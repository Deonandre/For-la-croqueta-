"""End-to-end smoke test: fake data -> tiny transformer trained on CPU -> calibration -> evaluation -> analysis.

It proves the plumbing works (tokenization windows, label alignment, Trainer, calibration, reports);
it says nothing about real accuracy, which needs real data (see README).
"""

import json
import random

import pytest

from aidetect.analyze import analyze
from aidetect.baseline import BaselinePredictor
from aidetect.data.build import BuildConfig, Builder, build_dataset, load_examples
from aidetect.data.human import HumanDoc
from aidetect.data.llm import FakeLLM
from aidetect.evaluate import calibrate, evaluate, predict_examples, write_report
from aidetect.predictor import load_predictor

SUBJECTS = ["the pendulum", "my survey", "the enzyme", "our town", "the treaty", "the novel", "the market"]
VERBS = ["measured", "counted", "noticed", "asked", "wrote down", "compared", "checked"]


def _human_text(rng: random.Random, lang: str) -> str:
    paras = []
    for _ in range(rng.randint(3, 5)):
        sents = []
        for _ in range(rng.randint(3, 6)):
            if lang == "fr":
                sents.append(f"J'ai {rng.choice(['mesuré', 'compté', 'noté', 'vérifié'])} {rng.choice(['le pendule', 'mon enquête', 'le marché', 'la ville'])} {rng.randint(2, 9)} fois ce jour-là.")
            else:
                sents.append(f"I {rng.choice(VERBS)} {rng.choice(SUBJECTS)} {rng.randint(2, 9)} times on day {rng.randint(1, 30)}.")
        paras.append(" ".join(sents))
    return "\n\n".join(paras)


def _tiny_base_model(path, corpus):
    from tokenizers import Tokenizer, models, normalizers, pre_tokenizers, processors, trainers
    from transformers import BertConfig, BertForTokenClassification, PreTrainedTokenizerFast

    tok = Tokenizer(models.WordPiece(unk_token="[UNK]"))
    tok.normalizer = normalizers.BertNormalizer(lowercase=True)
    tok.pre_tokenizer = pre_tokenizers.BertPreTokenizer()
    tok.train_from_iterator(corpus, trainers.WordPieceTrainer(vocab_size=600, special_tokens=["[PAD]", "[UNK]", "[CLS]", "[SEP]", "[MASK]"]))
    tok.post_processor = processors.TemplateProcessing(
        single="[CLS] $A [SEP]", special_tokens=[("[CLS]", tok.token_to_id("[CLS]")), ("[SEP]", tok.token_to_id("[SEP]"))])
    fast = PreTrainedTokenizerFast(tokenizer_object=tok, unk_token="[UNK]", pad_token="[PAD]", cls_token="[CLS]",
                                   sep_token="[SEP]", mask_token="[MASK]", model_max_length=128)
    fast.save_pretrained(path)
    cfg = BertConfig(vocab_size=tok.get_vocab_size(), hidden_size=32, num_hidden_layers=1, num_attention_heads=2,
                     intermediate_size=64, max_position_embeddings=160, num_labels=3)
    BertForTokenClassification(cfg).save_pretrained(path)


@pytest.mark.filterwarnings("ignore")
def test_full_pipeline(tmp_path):
    rng = random.Random(0)
    docs = [HumanDoc(id=f"d{i}", text=_human_text(rng, "fr" if i % 3 == 0 else "en"), lang="fr" if i % 3 == 0 else "en",
                     source="synthetic", task="ia", subject="physics") for i in range(80)]
    data = tmp_path / "examples.jsonl"
    builder = Builder(FakeLLM(), ["fake/a", "fake/b"], ["fake/heldout"],
                      BuildConfig(variants={"human": 1, "mirror": 1, "mosaic": 1, "rephrase": 0.5}, val_fraction=0.15, test_fraction=0.15))
    assert build_dataset(docs, builder, data, concurrency=4) > 150
    corpus = [" ".join(e["sentences"]) for e in load_examples(data)]

    base = tmp_path / "base"
    _tiny_base_model(base, corpus)

    from aidetect.train import TrainConfig, train

    out = train(data, tmp_path / "model", TrainConfig(base_model=str(base), max_length=128, stride=32, epochs=3, lr=3e-3,
                                                       batch_size=16, grad_accum=1, warmup_ratio=0.0, name="smoke"))
    assert (out / "calibration.json").exists() and (out / "aidetect_meta.json").exists()

    pred = load_predictor(out)
    test = load_examples(data, "test")
    report = evaluate(test, predict_examples(pred, test), pred.calibration)
    write_report(report, tmp_path / "report")
    assert (tmp_path / "report" / "report.md").exists()
    assert report["sentences"]["all"]["sentences"] == sum(len(e["sentences"]) for e in test)
    # the fake AI text uses a completely different vocabulary, so even a tiny model must separate it
    assert report["documents"]["auroc_human_vs_ai"] > 0.9

    text = "\n\n".join([_human_text(rng, "en"), FakeLLM().complete("fake/a", [{"role": "user", "content": "Write about the enzyme experiment results"}])])
    res = analyze(text, pred)
    assert res["model"]["kind"] == "transformer"
    assert {s["label"] for s in res["segments"] if s["kind"] == "sentence"} <= {"human", "ai", "rephrased"}


def test_baseline_pipeline(tmp_path):
    rng = random.Random(1)
    docs = [HumanDoc(id=f"b{i}", text=_human_text(rng, "en"), lang="en", source="synthetic") for i in range(60)]
    data = tmp_path / "examples.jsonl"
    build_dataset(docs, Builder(FakeLLM(), ["fake/a"], [], BuildConfig(variants={"human": 1, "mirror": 1, "mosaic": 1},
                                                                        val_fraction=0.2, test_fraction=0.2)), data)
    pred = BaselinePredictor.fit(load_examples(data, "train"))
    val = load_examples(data, "val")
    pred.calibration = calibrate(val, predict_examples(pred, val), target_fpr=0.01)
    assert pred.calibration.measured_fpr <= 0.01
    pred.save(tmp_path / "b.joblib")
    loaded = load_predictor(tmp_path / "b.joblib")
    test = load_examples(data, "test")
    report = evaluate(test, predict_examples(loaded, test), loaded.calibration)
    assert report["documents"]["auroc_human_vs_ai"] > 0.95
    json.dumps(report)  # serialisable
