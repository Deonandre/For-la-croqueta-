"""Full analysis of one essay: segmentation -> model -> smoothing -> JSON report for the UI."""

from __future__ import annotations

import numpy as np

from .labels import AI, HUMAN, LABEL_NAMES, REPHRASED
from .predictor import Calibration, Predictor
from .smoothing import viterbi
from .textproc import segment_document, word_count

MIN_WORDS = 150  # below this the verdict is "insufficient"


def _verdict(fr: dict[str, float], scored_words: int) -> str:
    if scored_words < MIN_WORDS:
        return "insufficient"
    flagged = fr["ai"] + fr["rephrased"]
    if fr["ai"] >= 0.5:
        return "mostly_ai"
    if fr["rephrased"] >= 0.5:
        return "mostly_rephrased"
    if flagged >= 0.15:
        return "mixed"
    if flagged > 0:
        return "mostly_human"
    return "human"


def _confidence(scored_words: int, mean_max_prob: float) -> str:
    if scored_words >= 400 and mean_max_prob >= 0.85:
        return "high"
    if scored_words >= 200 and mean_max_prob >= 0.7:
        return "medium"
    return "low"


def analyze(text: str, predictor: Predictor, calibration: Calibration | None = None) -> dict:
    cal = calibration or getattr(predictor, "calibration", None) or Calibration()
    doc = segment_document(text)
    sents = doc.sentences()
    sent_texts = doc.sentence_texts()
    para_starts = doc.paragraph_starts()

    probs = predictor.predict(sent_texts, para_starts, doc.language) if sents else np.zeros((0, 3))
    labels = viterbi(probs, para_starts, cal.switch_p, cal.para_switch_p, cal.class_bias)
    words = np.array([word_count(t) for t in sent_texts], dtype=float)
    scored_words = int(words.sum())

    fractions = {name: 0.0 for name in LABEL_NAMES}
    if scored_words:
        for k, name in enumerate(LABEL_NAMES):
            fractions[name] = float(words[labels == k].sum() / scored_words)

    # per-segment output (scored and excluded), in document order
    segments, sent_i = [], 0
    for seg in doc.segments:
        item = {"start": seg.start, "end": seg.end, "kind": seg.kind, "section": seg.section}
        if seg.scored:
            p = probs[sent_i]
            item["label"] = LABEL_NAMES[labels[sent_i]]
            item["probs"] = {n: round(float(p[k]), 4) for k, n in enumerate(LABEL_NAMES)}
            sent_i += 1
        segments.append(item)

    # merged passages of consecutive flagged sentences
    passages = []
    for i, seg in enumerate(sents):
        lab = int(labels[i])
        if lab == HUMAN:
            continue
        if passages and passages[-1]["_last"] == i - 1 and passages[-1]["label"] == LABEL_NAMES[lab]:
            p = passages[-1]
            p["end"], p["_last"], p["_probs"] = seg.end, i, p["_probs"] + [probs[i, lab]]
            p["words"] += int(words[i])
        else:
            passages.append({"start": seg.start, "end": seg.end, "label": LABEL_NAMES[lab],
                             "_last": i, "_probs": [probs[i, lab]], "words": int(words[i])})
    for p in passages:
        p["confidence"] = round(float(np.mean(p.pop("_probs"))), 3)
        p.pop("_last")

    # per-section breakdown
    sections: dict[str, dict] = {}
    for i, seg in enumerate(sents):
        key = seg.section or ""
        s = sections.setdefault(key, {"title": seg.section, "words": 0, "human": 0.0, "ai": 0.0, "rephrased": 0.0})
        s["words"] += int(words[i])
        s[LABEL_NAMES[labels[i]]] += float(words[i])
    for s in sections.values():
        for name in LABEL_NAMES:
            s[name] = round(s[name] / s["words"], 3) if s["words"] else 0.0

    warnings = []
    if scored_words < MIN_WORDS:
        warnings.append("short_text")
    if any(not s.scored for s in doc.segments):
        warnings.append("excluded_regions")
    if getattr(predictor, "kind", "") == "baseline":
        warnings.append("baseline_model")

    mean_max = float(probs.max(axis=1).mean()) if len(probs) else 0.0
    return {
        "language": doc.language,
        "word_count": word_count(text),
        "scored_word_count": scored_words,
        "summary": {
            **{k: round(v, 4) for k, v in fractions.items()},
            "verdict": _verdict(fractions, scored_words),
            "confidence": _confidence(scored_words, mean_max),
        },
        "segments": segments,
        "passages": passages,
        "sections": list(sections.values()),
        "warnings": warnings,
        "model": {"name": predictor.name, "kind": getattr(predictor, "kind", "unknown")},
        "labels": {"human": HUMAN, "ai": AI, "rephrased": REPHRASED},
    }
