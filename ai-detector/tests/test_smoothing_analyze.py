import numpy as np

from aidetect.analyze import analyze
from aidetect.smoothing import viterbi


def test_isolated_flip_is_smoothed():
    probs = np.array([[0.9, 0.05, 0.05]] * 3 + [[0.4, 0.55, 0.05]] + [[0.9, 0.05, 0.05]] * 3)
    labels = viterbi(probs, [True] + [False] * 6)
    assert labels.tolist() == [0] * 7


def test_strong_passage_is_kept():
    probs = np.array([[0.9, 0.05, 0.05]] * 3 + [[0.02, 0.96, 0.02]] * 3 + [[0.9, 0.05, 0.05]] * 3)
    labels = viterbi(probs, [True] + [False] * 8)
    assert labels.tolist() == [0] * 3 + [1] * 3 + [0] * 3


def test_bias_reduces_flags():
    probs = np.array([[0.45, 0.5, 0.05]] * 4)
    assert viterbi(probs, [True, False, False, False]).tolist() == [1] * 4
    assert viterbi(probs, [True, False, False, False], class_bias=[0, -1, -1]).tolist() == [0] * 4


def test_analyze_report(keyword_predictor):
    text = (
        "Introduction\n"
        + "I measured the reaction rate myself in the school lab last spring. " * 12
        + "\n\nFurthermore, it is crucial to note that enzymes are crucial. It is crucial in this context. "
        + "This crucial interplay is crucial.\n\n"
        + "Then I reworded this part with a tool. The reworded sentence is here. Another reworded one.\n\n"
        + "Bibliography\nSmith, J. (2019). Enzymes. Oxford Press.\n"
    )
    res = analyze(text, keyword_predictor)
    labels = {text[s["start"] : s["end"]]: s.get("label") for s in res["segments"] if s["kind"] == "sentence"}
    assert labels["It is crucial in this context."] == "ai"
    assert labels["The reworded sentence is here."] == "rephrased"
    assert labels["I measured the reaction rate myself in the school lab last spring."] == "human"
    assert [p["label"] for p in res["passages"]] == ["ai", "rephrased"]
    s = res["summary"]
    assert abs(s["human"] + s["ai"] + s["rephrased"] - 1) < 1e-6
    assert s["verdict"] == "mixed"
    assert "excluded_regions" in res["warnings"]
    assert any(seg["kind"] == "bibliography" for seg in res["segments"])


def test_short_text_is_insufficient(keyword_predictor):
    res = analyze("This is short. Only a few words.", keyword_predictor)
    assert res["summary"]["verdict"] == "insufficient"
    assert "short_text" in res["warnings"]


def test_mine_skips_documents_already_in_dataset(tmp_path, keyword_predictor):
    from aidetect.data.human import HumanDoc
    from aidetect.mine import mine

    flagged = "It is crucial to note this. It is crucial again. It is crucial once more."
    docs = [HumanDoc(id=i, text=flagged, lang="en", source="t") for i in ("in-dataset", "new")]
    found = mine(keyword_predictor, docs, tmp_path / "hn.jsonl", exclude_ids={"in-dataset"})
    assert [doc_id for _, doc_id in found] == ["new"]
