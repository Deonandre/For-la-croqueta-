"""Fast CPU baseline: TF-IDF features + logistic regression per sentence, with neighbour context.

It is the "number to beat" for the transformer model and a fallback when no GPU is available.
"""

from __future__ import annotations

import re
from pathlib import Path

import joblib
import numpy as np
from scipy import sparse
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from .predictor import Calibration, Predictor


def _style_features(sentences: list[str], para_starts: list[bool]) -> np.ndarray:
    rows = []
    for i, s in enumerate(sentences):
        words = s.split() or [""]
        n = max(len(s), 1)
        rows.append([
            np.log1p(len(words)),
            np.mean([len(w) for w in words]),
            s.count(",") / len(words),
            (s.count(";") + s.count(":")) / len(words),
            (s.count("—") + s.count("–")) / len(words),
            sum(c.isupper() for c in s) / n,
            sum(c.isdigit() for c in s) / n,
            float(para_starts[i]),
            float(bool(re.search(r"\b(I|je|j'|my|mon|ma|mes)\b", s, re.IGNORECASE))),
        ])
    return np.asarray(rows, dtype=np.float64)


def _context(sentences: list[str]) -> list[str]:
    out = []
    for i in range(len(sentences)):
        prev = sentences[i - 1] if i > 0 else ""
        nxt = sentences[i + 1] if i + 1 < len(sentences) else ""
        out.append(f"{prev} {sentences[i]} {nxt}")
    return out


class BaselinePredictor(Predictor):
    kind = "baseline"

    def __init__(self, char_vec, ctx_vec, clf, calibration: Calibration | None = None, name: str = "baseline-tfidf-lr"):
        self.char_vec, self.ctx_vec, self.clf = char_vec, ctx_vec, clf
        self.calibration = calibration or Calibration()
        self.name = name

    def _features(self, sentences, para_starts):
        return sparse.hstack([
            self.char_vec.transform(sentences),
            self.ctx_vec.transform(_context(sentences)),
            sparse.csr_matrix(_style_features(sentences, para_starts)),
        ]).tocsr()

    @classmethod
    def fit(cls, examples: list[dict], max_features: int = 200_000, C: float = 4.0) -> "BaselinePredictor":
        sents, ctx, style, y = [], [], [], []
        for ex in examples:
            sents += ex["sentences"]
            ctx += _context(ex["sentences"])
            style.append(_style_features(ex["sentences"], ex["para_starts"]))
            y += ex["labels"]
        char_vec = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4), max_features=max_features, sublinear_tf=True)
        ctx_vec = TfidfVectorizer(analyzer="word", ngram_range=(1, 2), max_features=max_features // 2, sublinear_tf=True)
        X = sparse.hstack([
            char_vec.fit_transform(sents),
            ctx_vec.fit_transform(ctx),
            sparse.csr_matrix(np.vstack(style)),
        ]).tocsr()
        clf = LogisticRegression(max_iter=2000, C=C, class_weight="balanced")
        clf.fit(X, np.asarray(y))
        return cls(char_vec, ctx_vec, clf)

    def predict(self, sentences, para_starts, language):
        if not sentences:
            return np.zeros((0, 3))
        probs = self.clf.predict_proba(self._features(sentences, para_starts))
        out = np.zeros((len(sentences), 3))
        out[:, self.clf.classes_] = probs  # classes absent from training stay at 0
        return out

    def save(self, path: str | Path) -> None:
        joblib.dump({"char_vec": self.char_vec, "ctx_vec": self.ctx_vec, "clf": self.clf,
                     "calibration": self.calibration.__dict__, "name": self.name}, path)

    @classmethod
    def load(cls, path: str | Path) -> "BaselinePredictor":
        d = joblib.load(path)
        return cls(d["char_vec"], d["ctx_vec"], d["clf"], Calibration(**d["calibration"]), d.get("name", "baseline"))
