"""Honest evaluation: false positives on human text first, then detection rates, per language,
variant and generator (including generators never seen in training)."""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

import numpy as np

from .labels import HUMAN, LABEL_NAMES
from .predictor import Calibration, Predictor
from .smoothing import viterbi
from .textproc import word_count


def predict_examples(predictor: Predictor, examples: list[dict]) -> list[np.ndarray]:
    return [predictor.predict(ex["sentences"], ex["para_starts"], ex["lang"]) for ex in examples]


def _smoothed(examples, preds, cal: Calibration):
    return [viterbi(p, ex["para_starts"], cal.switch_p, cal.para_switch_p, cal.class_bias) for ex, p in zip(examples, preds)]


def calibrate(examples: list[dict], preds: list[np.ndarray], target_fpr: float = 0.01,
              switch_p: float = 0.08, para_switch_p: float = 0.25) -> Calibration:
    """Most sensitive bias whose human-sentence false-positive rate stays under ``target_fpr``."""
    fpr = 1.0
    for b in np.arange(2.0, -8.01, -0.25):
        cal = Calibration([0.0, float(b), float(b)], switch_p, para_switch_p, target_fpr)
        fp = n = 0
        for ex, lab in zip(examples, _smoothed(examples, preds, cal)):
            y = np.asarray(ex["labels"])
            m = y == HUMAN
            fp += int((lab[m] != HUMAN).sum())
            n += int(m.sum())
        fpr = fp / max(n, 1)
        if fpr <= target_fpr:
            cal.measured_fpr = fpr
            return cal
    cal.measured_fpr = fpr
    return cal


def _auroc(neg: list[float], pos: list[float]) -> float | None:
    if not neg or not pos:
        return None
    from sklearn.metrics import roc_auc_score

    return float(roc_auc_score([0] * len(neg) + [1] * len(pos), neg + pos))


def _tpr_at_fpr(neg: list[float], pos: list[float], fpr: float) -> float | None:
    if len(neg) < int(1 / fpr) or not pos:
        return None  # not enough human documents to measure this FPR
    thr = float(np.quantile(neg, 1 - fpr))
    return float(np.mean(np.asarray(pos) > thr))


def evaluate(examples: list[dict], preds: list[np.ndarray], cal: Calibration) -> dict:
    labs = _smoothed(examples, preds, cal)
    groups: dict[str, np.ndarray] = defaultdict(lambda: np.zeros((3, 3), dtype=int))
    doc_scores: dict[str, list[float]] = defaultdict(list)
    human_docs_flagged = human_docs_any = human_docs = 0

    for ex, p, lab in zip(examples, preds, labs):
        y = np.asarray(ex["labels"])
        gen_group = "no_generator" if not ex["generators"] else ("heldout_generator" if ex["meta"].get("heldout") else "seen_generator")
        for key in ("all", f"lang={ex['lang']}", f"variant={ex['variant']}", gen_group):
            np.add.at(groups[key], (y, lab), 1)
        w = np.array([word_count(s) for s in ex["sentences"]], dtype=float)
        soft = float(((1 - p[:, HUMAN]) * w).sum() / max(w.sum(), 1))
        hard = float((w * (lab != HUMAN)).sum() / max(w.sum(), 1))
        if ex["variant"] == "human":
            human_docs += 1
            human_docs_any += int(hard > 0)
            human_docs_flagged += int(hard >= 0.15)
            doc_scores["human"].append(soft)
        elif ex["variant"] in ("mirror", "humanized_ai"):
            doc_scores["ai"].append(soft)
            doc_scores["ai_" + gen_group].append(soft)

    def summarize(cm: np.ndarray) -> dict:
        out = {"sentences": int(cm.sum())}
        for k, name in enumerate(LABEL_NAMES):
            tp = cm[k, k]
            prec = tp / max(cm[:, k].sum(), 1)
            rec = tp / max(cm[k, :].sum(), 1)
            out[f"{name}_precision"] = round(float(prec), 4)
            out[f"{name}_recall"] = round(float(rec), 4)
        out["human_sentence_fpr"] = round(float(1 - cm[HUMAN, HUMAN] / max(cm[HUMAN].sum(), 1)), 4)
        out["confusion"] = cm.tolist()
        return out

    return {
        "calibration": cal.__dict__,
        "documents": {
            "human_docs": human_docs,
            "human_docs_with_any_flag": round(human_docs_any / max(human_docs, 1), 4),
            "human_docs_flagged_mixed_or_worse": round(human_docs_flagged / max(human_docs, 1), 4),
            "auroc_human_vs_ai": _auroc(doc_scores["human"], doc_scores["ai"]),
            "auroc_human_vs_ai_heldout_generators": _auroc(doc_scores["human"], doc_scores["ai_heldout_generator"]),
            "tpr_at_1pct_fpr": _tpr_at_fpr(doc_scores["human"], doc_scores["ai"], 0.01),
            "tpr_at_0.1pct_fpr": _tpr_at_fpr(doc_scores["human"], doc_scores["ai"], 0.001),
        },
        "sentences": {k: summarize(v) for k, v in sorted(groups.items())},
    }


def write_report(report: dict, out_dir: str | Path) -> None:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "report.json").write_text(json.dumps(report, indent=2))
    d = report["documents"]
    lines = ["# Evaluation report", "", "## Documents", ""]
    lines += [f"- **{k}**: {v}" for k, v in d.items()]
    lines += ["", "## Sentences", "", "| group | n | human FPR | AI recall | AI precision | rephrased recall | rephrased precision |",
              "|---|---|---|---|---|---|---|"]
    for k, s in report["sentences"].items():
        lines.append(f"| {k} | {s['sentences']} | {s['human_sentence_fpr']:.2%} | {s['ai_recall']:.2%} | "
                     f"{s['ai_precision']:.2%} | {s['rephrased_recall']:.2%} | {s['rephrased_precision']:.2%} |")
    (out_dir / "report.md").write_text("\n".join(lines) + "\n")
