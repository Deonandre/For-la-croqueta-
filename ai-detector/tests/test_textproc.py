from aidetect.textproc import detect_language, segment_document, split_sentences


def test_language_detection(essay_en, essay_fr):
    assert detect_language(essay_en) == "en"
    assert detect_language(essay_fr) == "fr"


def test_offsets_round_trip(essay_en):
    doc = segment_document(essay_en)
    for seg in doc.segments:
        chunk = essay_en[seg.start : seg.end]
        assert chunk == chunk.strip() and chunk
    starts = [s.start for s in doc.segments]
    assert starts == sorted(starts)


def test_abbreviations_do_not_split():
    text = "Historians such as Dr. Richard J. Evans argue this, e.g. in 2003. Next sentence here."
    spans = split_sentences(text)
    assert [text[a:b] for a, b in spans] == [
        "Historians such as Dr. Richard J. Evans argue this, e.g. in 2003.",
        "Next sentence here.",
    ]
    fr = "Selon M. Dupont, env. 20 % des cas, cf. p. 7 du rapport. Ensuite on conclut."
    assert len(split_sentences(fr)) == 2


def test_decimals_and_question_marks():
    text = "The value was 3.14 exactly. Why? Because the model says so."
    assert len(split_sentences(text)) == 3


def _kinds(text):
    doc = segment_document(text)
    return {text[s.start : s.end]: s.kind for s in doc.segments}


def test_ib_structure_excluded(essay_en):
    kinds = _kinds(essay_en)
    assert kinds["1. Introduction"] == "heading"
    assert kinds["Introduction .......... 3"] == "toc"
    assert kinds["Figure 1: NSDAP share of the vote, 1928-1933"] == "caption"
    assert kinds["1928\t2.6%\t12"] == "table"
    assert kinds["Evans, R. J. (2003). The Coming of the Third Reich. Penguin."] == "bibliography"
    assert kinds["https://www.bbc.co.uk/bitesize/guides/weimar"] == "bibliography"
    quote = next(k for k in kinds if k.startswith("As Evans puts it"))
    assert kinds[quote] == "quote"
    assert kinds["However, the crash alone cannot explain everything."] == "sentence"


def test_french_structure(essay_fr):
    kinds = _kinds(essay_fr)
    assert kinds["Méthodologie"] == "heading"
    assert kinds["Campbell, N. (2012). Biologie. Pearson."] == "bibliography"
    guillemets = next(k for k in kinds if k.startswith("Selon M. Dupont"))
    assert kinds[guillemets] == "quote"
    assert kinds["Chaque essai a été répété trois fois."] == "sentence"


def test_sections_are_tracked(essay_en):
    doc = segment_document(essay_en)
    sec = {essay_en[s.start : s.end]: s.section for s in doc.sentences()}
    assert sec["However, the crash alone cannot explain everything."] == "2. Analysis"


def test_hard_wrapped_pdf_lines_are_joined():
    text = ("The results of the experiment show that the rate of reaction\n"
            "increases with temperature until the enzyme is denatured at\n"
            "around forty degrees. This matches the literature.\n")
    doc = segment_document(text)
    sents = doc.sentence_texts()
    assert len(sents) == 2
    assert sents[0].startswith("The results") and sents[0].endswith("forty degrees.")
