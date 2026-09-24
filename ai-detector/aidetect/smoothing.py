"""Viterbi smoothing of per-sentence probabilities into clean human / AI / rephrased passages.

Real essays switch source rarely (a pasted paragraph, a rephrased section), so an isolated
sentence flip is usually noise. Switching labels is cheaper at a paragraph boundary.
"""

from __future__ import annotations

import numpy as np


def viterbi(
    probs: np.ndarray,
    para_starts: list[bool],
    switch_p: float = 0.08,
    para_switch_p: float = 0.25,
    class_bias: list[float] | None = None,
) -> np.ndarray:
    n, k = probs.shape
    if n == 0:
        return np.zeros(0, dtype=int)
    emit = np.log(np.clip(probs, 1e-6, 1.0))
    if class_bias is not None:
        emit = emit + np.asarray(class_bias, dtype=np.float64)[None, :]

    def trans(p: float) -> np.ndarray:
        t = np.full((k, k), np.log(p / (k - 1)))
        np.fill_diagonal(t, np.log(1.0 - p))
        return t

    t_in, t_para = trans(switch_p), trans(para_switch_p)
    score = emit[0].copy()
    back = np.zeros((n, k), dtype=int)
    for i in range(1, n):
        t = t_para if para_starts[i] else t_in
        cand = score[:, None] + t  # from x to
        back[i] = cand.argmax(axis=0)
        score = cand.max(axis=0) + emit[i]
    labels = np.zeros(n, dtype=int)
    labels[-1] = int(score.argmax())
    for i in range(n - 1, 0, -1):
        labels[i - 1] = back[i, labels[i]]
    return labels
