"""Hard-negative mining: find human documents the current model wrongly flags.

Those documents (and their AI mirrors) are fed into the next build + training round, which is how
the false-positive rate is driven down round after round.
"""

from __future__ import annotations

import json
from pathlib import Path

from .analyze import analyze
from .data.human import HumanDoc
from .predictor import Predictor


def mine(predictor: Predictor, docs, out_path: str | Path, top_k: int = 500,
         exclude_ids: set[str] | frozenset[str] = frozenset()) -> list[tuple[float, str]]:
    """Score human ``docs`` and save the ``top_k`` most flagged ones.

    ``exclude_ids`` are documents already in the dataset: ``build`` would skip them anyway, and val/test
    documents must not come back as training data.
    """
    scored = []
    for doc in docs:
        if doc.id in exclude_ids:
            continue
        s = analyze(doc.text, predictor)["summary"]
        score = s["ai"] + s["rephrased"]
        if score > 0:
            scored.append((score, doc))
    scored.sort(key=lambda t: t[0], reverse=True)
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        for score, doc in scored[:top_k]:
            f.write(doc.to_json() + "\n")
    return [(score, doc.id) for score, doc in scored[:top_k]]
