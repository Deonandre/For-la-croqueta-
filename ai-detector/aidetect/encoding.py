"""Shared text <-> token encoding used by both training and inference.

A document is a list of sentences. We join them into one string (" " inside a paragraph,
"\\n\\n" between paragraphs), tokenize it in overlapping windows, and give every token the label of
the sentence it falls in. At inference the token probabilities are averaged back per sentence.
"""

from __future__ import annotations

import numpy as np

from .labels import IGNORE_INDEX, NUM_LABELS
from .textproc import sentence_index_for_offsets


def join_sentences(sentences: list[str], para_starts: list[bool]) -> tuple[str, list[tuple[int, int]]]:
    parts: list[str] = []
    spans: list[tuple[int, int]] = []
    pos = 0
    for i, s in enumerate(sentences):
        if i > 0:
            sep = "\n\n" if para_starts[i] else " "
            parts.append(sep)
            pos += len(sep)
        spans.append((pos, pos + len(s)))
        parts.append(s)
        pos += len(s)
    return "".join(parts), spans


def encode_windows(tokenizer, sentences, para_starts, max_length=512, stride=128, labels=None):
    """Tokenize a document into overlapping windows.

    Returns a list of dicts with input_ids, attention_mask, and either ``labels`` (training) or
    ``sentence_index`` (inference: sentence index per token, -1 for special/separator tokens).
    """
    text, spans = join_sentences(sentences, para_starts)
    enc = tokenizer(
        text,
        truncation=True,
        max_length=max_length,
        stride=stride,
        return_overflowing_tokens=True,
        return_offsets_mapping=True,
    )
    windows = []
    for w in range(len(enc["input_ids"])):
        offsets = enc["offset_mapping"][w]
        idx = sentence_index_for_offsets(spans, [a for a, _ in offsets])
        idx = [i if b > a else -1 for i, (a, b) in zip(idx, offsets)]
        item = {"input_ids": enc["input_ids"][w], "attention_mask": enc["attention_mask"][w]}
        if labels is not None:
            item["labels"] = [labels[i] if i >= 0 else IGNORE_INDEX for i in idx]
        else:
            item["sentence_index"] = idx
        windows.append(item)
    return windows


def aggregate_token_probs(window_probs: list[np.ndarray], window_indices: list[list[int]], n_sentences: int) -> np.ndarray:
    """Average token probabilities per sentence across all windows that cover it."""
    sums = np.zeros((n_sentences, NUM_LABELS), dtype=np.float64)
    counts = np.zeros(n_sentences, dtype=np.float64)
    for probs, idx in zip(window_probs, window_indices):
        idx = np.asarray(idx[: len(probs)])
        mask = idx >= 0
        np.add.at(sums, idx[mask], probs[: len(idx)][mask])
        np.add.at(counts, idx[mask], 1.0)
    out = np.zeros_like(sums)
    out[:, 0] = 1.0  # sentences with no tokens (should not happen) default to human
    seen = counts > 0
    out[seen] = sums[seen] / counts[seen, None]
    return out
