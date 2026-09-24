"""Models that turn a list of sentences into per-sentence probabilities [human, ai, rephrased]."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path

import numpy as np

from .encoding import aggregate_token_probs, encode_windows


@dataclass
class Calibration:
    """Decision settings tuned on validation data (see ``aidetect.evaluate.calibrate``)."""

    class_bias: list[float] = field(default_factory=lambda: [0.0, 0.0, 0.0])
    switch_p: float = 0.08
    para_switch_p: float = 0.25
    target_fpr: float | None = None
    measured_fpr: float | None = None

    def save(self, path: str | Path) -> None:
        Path(path).write_text(json.dumps(asdict(self), indent=2))

    @classmethod
    def load(cls, path: str | Path) -> "Calibration":
        return cls(**json.loads(Path(path).read_text()))


class Predictor:
    name = "predictor"
    kind = "abstract"
    calibration: Calibration

    def predict(self, sentences: list[str], para_starts: list[bool], language: str) -> np.ndarray:
        raise NotImplementedError


class TransformerPredictor(Predictor):
    kind = "transformer"

    def __init__(self, model_dir: str | Path, max_length: int = 512, stride: int = 128, batch_size: int = 8, device: str | None = None):
        import torch
        from transformers import AutoModelForTokenClassification, AutoTokenizer

        self.torch = torch
        self.model_dir = Path(model_dir)
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_dir)
        self.model = AutoModelForTokenClassification.from_pretrained(self.model_dir)
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device).eval()
        self.max_length = min(max_length, getattr(self.tokenizer, "model_max_length", max_length) or max_length)
        self.stride = min(stride, self.max_length // 4)
        self.batch_size = batch_size
        meta_path = self.model_dir / "aidetect_meta.json"
        meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
        self.name = meta.get("name", self.model_dir.name)
        cal_path = self.model_dir / "calibration.json"
        self.calibration = Calibration.load(cal_path) if cal_path.exists() else Calibration()

    def predict(self, sentences, para_starts, language):
        if not sentences:
            return np.zeros((0, 3))
        windows = encode_windows(self.tokenizer, sentences, para_starts, self.max_length, self.stride)
        probs_list, idx_list = [], []
        pad_id = self.tokenizer.pad_token_id or 0
        for b in range(0, len(windows), self.batch_size):
            batch = windows[b : b + self.batch_size]
            width = max(len(w["input_ids"]) for w in batch)
            ids = [w["input_ids"] + [pad_id] * (width - len(w["input_ids"])) for w in batch]
            att = [w["attention_mask"] + [0] * (width - len(w["attention_mask"])) for w in batch]
            with self.torch.no_grad():
                logits = self.model(
                    input_ids=self.torch.tensor(ids, device=self.device),
                    attention_mask=self.torch.tensor(att, device=self.device),
                ).logits
            probs = self.torch.softmax(logits.float(), dim=-1).cpu().numpy()
            for w, p in zip(batch, probs):
                probs_list.append(p[: len(w["input_ids"])])
                idx_list.append(w["sentence_index"])
        return aggregate_token_probs(probs_list, idx_list, len(sentences))


def load_predictor(path: str | Path) -> Predictor:
    path = Path(path)
    if path.suffix == ".joblib":
        from .baseline import BaselinePredictor

        return BaselinePredictor.load(path)
    if (path / "config.json").exists():
        return TransformerPredictor(path)
    raise FileNotFoundError(f"No model found at {path} (expected a transformer folder or a .joblib baseline)")
