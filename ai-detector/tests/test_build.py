import json

from aidetect.data.build import BuildConfig, Builder, assign_split, build_dataset, clean_llm_output, edit_ratio, load_examples
from aidetect.data.human import HumanDoc, chunk_text
from aidetect.data.llm import FakeLLM, discover_generators
from aidetect.labels import AI, HUMAN, REPHRASED


def _doc(essay, lang, i=0):
    return HumanDoc(id=f"doc{i}-{lang}", text=essay, lang=lang, source="test", task="ee", subject="history")


def _builder(**variants):
    cfg = BuildConfig(variants=variants or {"human": 1, "mirror": 1, "mosaic": 1, "rephrase": 1, "polish": 1,
                                            "translation": 1, "humanized_ai": 1})
    return Builder(FakeLLM(), ["fake/a", "fake/b"], ["fake/heldout"], cfg)


def test_all_variants_have_aligned_labels(essay_en, essay_fr):
    for essay, lang in ((essay_en, "en"), (essay_fr, "fr")):
        exs = _builder().build_doc(_doc(essay, lang))
        variants = {e.variant for e in exs}
        assert {"human", "mirror", "mosaic", "rephrase", "translation", "humanized_ai"} <= variants
        for e in exs:
            assert len(e.sentences) == len(e.labels) == len(e.para_starts)
            assert e.para_starts[0] is True
        by = {e.variant: e for e in exs}
        assert set(by["human"].labels) == {HUMAN}
        assert set(by["mirror"].labels) == {AI}
        assert set(by["humanized_ai"].labels) == {AI}
        assert AI in by["mosaic"].labels and HUMAN in by["mosaic"].labels or set(by["mosaic"].labels) == {AI}
        assert REPHRASED in by["rephrase"].labels
        assert set(by["translation"].labels) == {REPHRASED}
        assert by["translation"].lang != lang


def test_bibliography_never_reaches_training_text(essay_en):
    ex = _builder(human=1).build_doc(_doc(essay_en, "en"))[0]
    assert not any("Penguin" in s or "bbc.co.uk" in s for s in ex.sentences)


def test_split_is_deterministic_and_heldout_only_in_test(tmp_path, essay_en):
    docs = [_doc(essay_en, "en", i) for i in range(40)]
    out = tmp_path / "ex.jsonl"
    n = build_dataset(docs, _builder(human=1, mirror=1), out, concurrency=4)
    rows = load_examples(out)
    assert n == len(rows) > 0
    for r in rows:
        assert r["split"] == assign_split(r["doc_id"], 0.1, 0.1, 13)
        if "fake/heldout" in r["generators"]:
            assert r["split"] == "test" and r["meta"]["heldout"]
    # resumable: a second run adds nothing
    assert build_dataset(docs, _builder(human=1, mirror=1), out) == 0


def test_clean_llm_output():
    raw = "Here is the rewritten passage:\n## Title\n**Bold** text here with enough words to count.\n- a bullet point that is long enough"
    out = clean_llm_output(raw)
    assert "Here is" not in out and "**" not in out and "##" not in out and not out.startswith("-")
    assert clean_llm_output("I'm sorry, I can't help with that.") is None


def test_edit_ratio():
    assert edit_ratio("the cat sat on the mat", "the cat sat on the mat") == 0
    assert edit_ratio("the cat sat on the mat", "a feline rested upon a rug") > 0.5


def test_chunk_text():
    text = "\n\n".join(["word " * 200] * 10)
    chunks = chunk_text(text, 250, 700)
    assert all(250 <= len(c.split()) <= 700 for c in chunks)


def test_discover_generators_picks_newest_affordable():
    models = [
        {"id": "openai/old", "created": 1, "pricing": {"completion": "0.000002"}, "architecture": {"modality": "text->text"}},
        {"id": "openai/new", "created": 2, "pricing": {"completion": "0.000004"}, "architecture": {"modality": "text->text"}},
        {"id": "openai/pricey", "created": 3, "pricing": {"completion": "0.0001"}, "architecture": {"modality": "text->text"}},
        {"id": "openai/new:free", "created": 4, "pricing": {"completion": "0"}, "architecture": {"modality": "text->text"}},
        {"id": "mistralai/m", "created": 1, "pricing": {"completion": "0.000001"}, "architecture": {"modality": "text+image->text"}},
    ]
    assert discover_generators(models, ["openai", "mistralai", "google"], 16) == ["openai/new", "mistralai/m"]


def test_sources_are_interleaved_after_local(tmp_path, essay_en):
    local = tmp_path / "local"
    local.mkdir()
    (local / "old_ee.txt").write_text(essay_en)
    for name, lang in (("a", "fr"), ("b", "en")):
        (tmp_path / f"{name}.jsonl").write_text(
            "".join(json.dumps({"id": f"{name}{i}", "text": "word " * 200, "lang": lang}) + "\n" for i in range(3)))
    from aidetect.data.human import load_sources

    docs = list(load_sources([{"type": "jsonl", "path": str(tmp_path / "a.jsonl")},
                              {"type": "local", "path": str(local)},
                              {"type": "jsonl", "path": str(tmp_path / "b.jsonl")}]))
    assert docs[0].source == "local"
    assert [d.id for d in docs[1:]] == ["a0", "b0", "a1", "b1", "a2", "b2"]
