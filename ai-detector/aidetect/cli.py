"""Command line: ``python -m aidetect <command>`` (see README for the full pipeline)."""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

import yaml


def _cfg(path: str) -> dict:
    return yaml.safe_load(Path(path).read_text()) or {}


def cmd_doctor(args):
    from .doctor import report, run_checks

    text, ready = report(run_checks(_cfg(args.config)))
    print(text)
    if args.require and not ready[args.require]:
        sys.exit(1)


def cmd_models(args):
    from .data.llm import LLMClient, discover_generators

    cfg = _cfg(args.config)["generation"]
    client = LLMClient(budget_usd=0)
    gens = discover_generators(client.models(), cfg["providers"], cfg["max_completion_price_per_mtok"])
    print(json.dumps(gens, indent=2))


def _generators(cfg: dict, client) -> tuple[list[str], list[str]]:
    from .data.llm import discover_generators

    gens = cfg.get("generators") or discover_generators(client.models(), cfg["providers"], cfg["max_completion_price_per_mtok"])
    held_prov = tuple(p + "/" for p in cfg.get("heldout_providers", []))
    held = [g for g in gens if g.startswith(held_prov)] if held_prov else []
    train = [g for g in gens if g not in held]
    return train, held


def cmd_build(args):
    from .data.build import BuildConfig, Builder, build_dataset
    from .data.human import load_jsonl, load_sources
    from .data.llm import FakeLLM, LLMClient

    cfg = _cfg(args.config)
    gen_cfg = cfg["generation"]
    if args.fake:
        client, train, held = FakeLLM(), ["fake/model-a", "fake/model-b"], ["fake/model-heldout"]
    else:
        client = LLMClient(budget_usd=gen_cfg.get("budget_usd", 50), cache_dir=gen_cfg.get("cache_dir", ".cache/llm"))
        train, held = _generators(gen_cfg, client)
    print(f"training generators: {train}\nheld-out generators: {held}", file=sys.stderr)
    bc = BuildConfig(
        variants=gen_cfg.get("variants", BuildConfig().variants),
        max_doc_words=gen_cfg.get("max_doc_words", 1200),
        mirror_max_words=gen_cfg.get("mirror_max_words", 900),
        polish_threshold=gen_cfg.get("polish_threshold", 0.12),
        val_fraction=cfg.get("splits", {}).get("val", 0.1),
        test_fraction=cfg.get("splits", {}).get("test", 0.1),
        seed=cfg.get("splits", {}).get("seed", 13),
    )
    docs = load_jsonl(args.human_jsonl, source="mined") if args.human_jsonl else load_sources(cfg["human_sources"])
    n = build_dataset(docs, Builder(client, train, held, bc), args.out, gen_cfg.get("concurrency", 8), args.max_docs)
    print(f"wrote {n} examples to {args.out}; spent ${client.spent_usd:.2f}", file=sys.stderr)


def cmd_train(args):
    from .train import TrainConfig, train

    t = _cfg(args.config).get("training", {})
    if args.base_model:
        t["base_model"] = args.base_model
    if args.epochs:
        t["epochs"] = args.epochs
    train(args.data, args.out, TrainConfig(**t))


def cmd_baseline(args):
    from .baseline import BaselinePredictor
    from .data.build import load_examples
    from .evaluate import calibrate, predict_examples

    pred = BaselinePredictor.fit(load_examples(args.data, "train"))
    val = load_examples(args.data, "val")
    if val:
        pred.calibration = calibrate(val, predict_examples(pred, val), target_fpr=args.target_fpr)
    pred.save(args.out)
    print(f"saved baseline to {args.out}; calibration {pred.calibration}", file=sys.stderr)


def cmd_eval(args):
    from .data.build import load_examples
    from .evaluate import evaluate, predict_examples, write_report
    from .predictor import load_predictor

    pred = load_predictor(args.model)
    test = load_examples(args.data, args.split)
    report = evaluate(test, predict_examples(pred, test), pred.calibration)
    write_report(report, args.out)
    print(json.dumps(report["documents"], indent=2))


def cmd_mine(args):
    from .data.human import load_sources
    from .mine import mine
    from .predictor import load_predictor

    cfg = _cfg(args.config)
    # By default scan the training sources further than the build did: documents already in the dataset
    # are skipped, so the extra ones are the only candidates.
    pool = cfg.get("mining_pool") or [dict(s, limit=s["limit"] * args.pool_factor) if "limit" in s else s
                                      for s in cfg["human_sources"]]
    exclude = set()
    if Path(args.data).exists():
        with open(args.data, encoding="utf-8") as f:
            exclude = {json.loads(line)["doc_id"] for line in f if line.strip()}
    found = mine(load_predictor(args.model), load_sources(pool), args.out, args.top_k, exclude_ids=exclude)
    print(f"{len(found)} human documents flagged (skipped {len(exclude)} already in {args.data}); saved to {args.out}",
          file=sys.stderr)


_COLORS = {"ai": "\033[41;97m", "rephrased": "\033[43;30m"}


def cmd_analyze(args):
    from .analyze import analyze
    from .extract import extract_text
    from .predictor import load_predictor

    text = extract_text(Path(args.file).read_bytes(), args.file)
    res = analyze(text, load_predictor(args.model))
    if args.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return
    out, pos = [], 0
    for seg in res["segments"]:
        out.append(text[pos : seg["start"]])
        chunk = text[seg["start"] : seg["end"]]
        if seg["kind"] != "sentence":
            out.append(f"\033[2m{chunk}\033[0m")
        elif seg["label"] in _COLORS:
            out.append(f"{_COLORS[seg['label']]}{chunk}\033[0m")
        else:
            out.append(chunk)
        pos = seg["end"]
    out.append(text[pos:])
    print("".join(out))
    print("\n" + json.dumps(res["summary"], indent=2))


def cmd_serve(args):
    import os

    import uvicorn

    if args.model:
        os.environ["AIDETECT_MODEL"] = args.model
    uvicorn.run("app.server:app", host=args.host, port=args.port)


def main(argv=None):
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    p = argparse.ArgumentParser(prog="aidetect")
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("doctor", help="check the key, network, GPU and data this machine needs")
    s.add_argument("--config", default="configs/default.yaml")
    s.add_argument("--require", choices=["build", "train", "serve"], help="exit 1 if this step is blocked")
    s.set_defaults(func=cmd_doctor)

    s = sub.add_parser("models", help="list the generator models that would be used")
    s.add_argument("--config", default="configs/default.yaml")
    s.set_defaults(func=cmd_models)

    s = sub.add_parser("build", help="generate the labelled dataset")
    s.add_argument("--config", default="configs/default.yaml")
    s.add_argument("--out", default="data/examples.jsonl")
    s.add_argument("--human-jsonl", help="build from this JSONL of human docs instead (e.g. mined hard negatives)")
    s.add_argument("--max-docs", type=int)
    s.add_argument("--fake", action="store_true", help="offline fake generator (pipeline test only)")
    s.set_defaults(func=cmd_build)

    s = sub.add_parser("train", help="fine-tune the transformer model")
    s.add_argument("--config", default="configs/default.yaml")
    s.add_argument("--data", default="data/examples.jsonl")
    s.add_argument("--out", default="models/plume")
    s.add_argument("--base-model")
    s.add_argument("--epochs", type=float)
    s.set_defaults(func=cmd_train)

    s = sub.add_parser("baseline", help="train the fast TF-IDF baseline")
    s.add_argument("--data", default="data/examples.jsonl")
    s.add_argument("--out", default="models/baseline.joblib")
    s.add_argument("--target-fpr", type=float, default=0.01)
    s.set_defaults(func=cmd_baseline)

    s = sub.add_parser("eval", help="evaluate a model on the test split")
    s.add_argument("--model", required=True)
    s.add_argument("--data", default="data/examples.jsonl")
    s.add_argument("--split", default="test")
    s.add_argument("--out", default="reports/latest")
    s.set_defaults(func=cmd_eval)

    s = sub.add_parser("mine", help="find human documents the model wrongly flags")
    s.add_argument("--model", required=True)
    s.add_argument("--config", default="configs/default.yaml")
    s.add_argument("--out", default="data/hard_negatives.jsonl")
    s.add_argument("--data", default="data/examples.jsonl", help="documents already in this dataset are skipped")
    s.add_argument("--pool-factor", type=int, default=3, help="scan this many times each source's build limit")
    s.add_argument("--top-k", type=int, default=500)
    s.set_defaults(func=cmd_mine)

    s = sub.add_parser("analyze", help="analyze one file (.docx/.pdf/.txt) in the terminal")
    s.add_argument("file")
    s.add_argument("--model", required=True)
    s.add_argument("--json", action="store_true")
    s.set_defaults(func=cmd_analyze)

    s = sub.add_parser("serve", help="run the web app")
    s.add_argument("--model")
    s.add_argument("--host", default="127.0.0.1")
    s.add_argument("--port", type=int, default=8000)
    s.set_defaults(func=cmd_serve)

    args = p.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
