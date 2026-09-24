"""Fine-tune a multilingual encoder for sentence-level human / AI / rephrased tagging.

Each document is tokenized in overlapping windows; every token gets its sentence's label, so the
model sees context across sentence boundaries (where AI passages start and stop).
"""

from __future__ import annotations

import inspect
import json
import logging
import time
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np

from .data.build import load_examples
from .encoding import encode_windows
from .labels import IGNORE_INDEX, LABEL_NAMES

log = logging.getLogger(__name__)


@dataclass
class TrainConfig:
    base_model: str = "FacebookAI/xlm-roberta-base"
    max_length: int = 512
    stride: int = 128
    epochs: float = 3.0
    lr: float = 2e-5
    batch_size: int = 8
    grad_accum: int = 2
    warmup_ratio: float = 0.06
    weight_decay: float = 0.01
    seed: int = 13
    max_train_examples: int | None = None
    target_fpr: float = 0.01
    name: str = "plume"


class _WindowDataset:
    def __init__(self, windows):
        self.windows = windows

    def __len__(self):
        return len(self.windows)

    def __getitem__(self, i):
        return self.windows[i]


def _windows(tokenizer, examples, cfg: TrainConfig):
    out = []
    for ex in examples:
        out += encode_windows(tokenizer, ex["sentences"], ex["para_starts"], cfg.max_length, cfg.stride, labels=ex["labels"])
    return out


def _metrics(eval_pred):
    preds, labels = eval_pred
    mask = labels != IGNORE_INDEX
    p, y = preds[mask], labels[mask]
    f1s = []
    for k in range(len(LABEL_NAMES)):
        tp = np.sum((p == k) & (y == k))
        prec = tp / max(np.sum(p == k), 1)
        rec = tp / max(np.sum(y == k), 1)
        f1s.append(0.0 if prec + rec == 0 else 2 * prec * rec / (prec + rec))
    return {"token_accuracy": float(np.mean(p == y)), "macro_f1": float(np.mean(f1s)),
            **{f"f1_{n}": float(f) for n, f in zip(LABEL_NAMES, f1s)}}


def train(data_path: str | Path, out_dir: str | Path, cfg: TrainConfig | None = None) -> Path:
    import torch
    from transformers import (AutoModelForTokenClassification, AutoTokenizer, DataCollatorForTokenClassification,
                              Trainer, TrainingArguments, set_seed)

    from .evaluate import calibrate, predict_examples
    from .predictor import TransformerPredictor

    cfg = cfg or TrainConfig()
    set_seed(cfg.seed)
    out_dir = Path(out_dir)
    train_ex = load_examples(data_path, "train")
    val_ex = load_examples(data_path, "val")
    if cfg.max_train_examples:
        rng = np.random.default_rng(cfg.seed)
        train_ex = [train_ex[i] for i in rng.permutation(len(train_ex))[: cfg.max_train_examples]]
    log.info("train examples: %d, val examples: %d", len(train_ex), len(val_ex))

    tokenizer = AutoTokenizer.from_pretrained(cfg.base_model)
    model = AutoModelForTokenClassification.from_pretrained(
        cfg.base_model, num_labels=len(LABEL_NAMES),
        id2label=dict(enumerate(LABEL_NAMES)), label2id={n: i for i, n in enumerate(LABEL_NAMES)},
    )
    train_ds = _WindowDataset(_windows(tokenizer, train_ex, cfg))
    val_ds = _WindowDataset(_windows(tokenizer, val_ex, cfg))
    log.info("train windows: %d, val windows: %d", len(train_ds), len(val_ds))

    cuda = torch.cuda.is_available()
    # transformers 5 folds warmup_ratio into warmup_steps (a float < 1 is a ratio)
    warmup = ({"warmup_ratio": cfg.warmup_ratio} if "warmup_ratio" in inspect.signature(TrainingArguments).parameters
              else {"warmup_steps": float(cfg.warmup_ratio)})
    args = TrainingArguments(
        output_dir=str(out_dir / "checkpoints"),
        num_train_epochs=cfg.epochs,
        learning_rate=cfg.lr,
        per_device_train_batch_size=cfg.batch_size,
        per_device_eval_batch_size=cfg.batch_size,
        gradient_accumulation_steps=cfg.grad_accum,
        **warmup,
        weight_decay=cfg.weight_decay,
        eval_strategy="epoch",
        save_strategy="epoch",
        save_total_limit=1,
        load_best_model_at_end=True,
        metric_for_best_model="macro_f1",
        logging_steps=50,
        bf16=cuda and torch.cuda.is_bf16_supported(),
        fp16=cuda and not torch.cuda.is_bf16_supported(),
        report_to="none",
        seed=cfg.seed,
    )
    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        data_collator=DataCollatorForTokenClassification(tokenizer),
        compute_metrics=_metrics,
        preprocess_logits_for_metrics=lambda logits, labels: logits.argmax(-1),
        processing_class=tokenizer,
    )
    trainer.train()
    final = trainer.evaluate()

    trainer.save_model(str(out_dir))
    tokenizer.save_pretrained(str(out_dir))
    meta = {
        "name": f"{cfg.name}-{Path(cfg.base_model).name}",
        "created": time.strftime("%Y-%m-%d %H:%M"),
        "labels": LABEL_NAMES,
        "train_examples": len(train_ex),
        "config": asdict(cfg),
        "val_metrics": final,
    }
    (out_dir / "aidetect_meta.json").write_text(json.dumps(meta, indent=2))

    # tune the decision threshold on validation so human sentences are rarely flagged
    predictor = TransformerPredictor(out_dir, max_length=cfg.max_length, stride=cfg.stride)
    cal = calibrate(val_ex, predict_examples(predictor, val_ex), target_fpr=cfg.target_fpr)
    cal.save(out_dir / "calibration.json")
    log.info("calibration: %s", cal)
    return out_dir
