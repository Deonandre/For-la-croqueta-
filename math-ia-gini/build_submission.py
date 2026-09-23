"""Build the final IA from the student's own wording (draft/IA_submission.md).

- IA_Final_Submission.docx: cover page, table of contents, the student's text, tables,
  formulas, figures, references and appendices.
- Corrections_to_your_text.docx: every paragraph where a word was corrected, with the removed
  words struck through and the new words underlined, compared with draft/student_rewrite.docx.

Usage: python3 build_submission.py   (after analysis.py and figures.py)
"""

import difflib
import os
import re
import subprocess
import tempfile

import build_ia
from build_ia import HERE, PANDOC, to_docx, fill_toc, keep_tables_together, written_version

SRC = os.path.join(HERE, "draft", "IA_submission.md")
STUDENT = os.path.join(HERE, "draft", "student_rewrite.docx")
FINAL = os.path.join(HERE, "IA_Final_Submission.docx")
CHANGES = os.path.join(HERE, "Corrections_to_your_text.docx")
HEADING = re.compile(r"^(\d+\.\d*\s|References$|Appendix )")
QUOTES = str.maketrans({"\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"'})


def plain(path):
    """Paragraphs of a docx as plain text."""
    txt = subprocess.run([PANDOC, path, "-t", "plain", "--wrap=none"], check=True,
                         capture_output=True, text=True).stdout
    return [" ".join(p.split()) for p in txt.split("\n\n") if p.strip()]


def calc_lines():
    """Worked-calculation lines of the template; the written-only text never had them."""
    src = open(os.path.join(HERE, "draft", "IA_template.md"), encoding="utf-8").read()
    out = re.sub("«(.+?)»", lambda m: str(eval(m.group(1), build_ia.CTX)), src)
    return {l for block in build_ia.CALC.findall(out) for l in block.split("\n") if l and "calc-->" not in l}


def submission_as_text(md):
    """The merged IA reduced to prose, exactly as the written-only version was made."""
    skip = calc_lines()
    md = "\n".join(l for l in md.split("\n") if l not in skip)
    md = written_version(md)
    md = md.split("```\n", 1)[-1]                       # drop the cover and its page break
    tmp = tempfile.mkdtemp()
    with open(os.path.join(tmp, "text.md"), "w", encoding="utf-8") as fh:
        fh.write(md)
    to_docx(os.path.join(tmp, "text.md"), os.path.join(tmp, "text.docx"), plain_maths=True)
    return plain(os.path.join(tmp, "text.docx"))


def md_escape(s):
    return re.sub(r"([\\`*_{}\[\]<>#$~|^])", r"\\\1", s)


def word_diff(old, new):
    a, b = old.split(" "), new.split(" ")
    parts, changed = [], 0
    na, nb = [w.translate(QUOTES) for w in a], [w.translate(QUOTES) for w in b]   # straight = curly quotes
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, na, nb, autojunk=False).get_opcodes():
        if op == "equal":
            parts.append(md_escape(" ".join(a[i1:i2])))
            continue
        changed += 1
        if i2 > i1:
            parts.append("~~" + md_escape(" ".join(a[i1:i2])) + "~~")
        if j2 > j1:
            parts.append("[**" + md_escape(" ".join(b[j1:j2])) + "**]{.underline}")
    return " ".join(parts), changed


def corrections(student, merged):
    """Markdown listing every changed paragraph, and the number of changed places."""
    out, total, section = [], 0, ""
    sm = difflib.SequenceMatcher(None, [p.translate(QUOTES) for p in student],
                                 [p.translate(QUOTES) for p in merged], autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for p in student[i1:i2]:
                if HEADING.match(p) and len(p) < 90:
                    section = p
            continue
        old, new = student[i1:i2], merged[j1:j2]
        heads = [p for p in new if HEADING.match(p) and len(p) < 90]
        body_old = [p for p in old if not (HEADING.match(p) and len(p) < 90)]
        body_new = [p for p in new if not (HEADING.match(p) and len(p) < 90)]
        removed_heads = [p for p in old if HEADING.match(p) and len(p) < 90 and p not in new]
        if heads:
            section = heads[-1]
        text, n = word_diff("¶ ".join(body_old), "¶ ".join(body_new))
        out.append(f"### In {md_escape(section)}\n")
        for h in removed_heads:
            out.append(f"Heading removed: ~~{md_escape(h)}~~\n")
            n += 1
        if text.strip():
            out.append(text.replace("¶ ", "\n\n") + "\n")
        total += n
    return "\n".join(out), total


def main():
    md = open(SRC, encoding="utf-8").read()
    to_docx(SRC, FINAL, toc=True)
    keep_tables_together(FINAL)
    pages = fill_toc(FINAL, md)
    if pages:
        print(f"IA_Final_Submission.docx: {pages} pages, table of contents filled")

    student = plain(STUDENT)
    merged = submission_as_text(md)
    body, n = corrections(student, merged)
    head = ("# Corrections made to your text\n\n"
            "Only the paragraphs below were changed. ~~Struck-through words~~ were removed and "
            "[**underlined words**]{.underline} were added; everything else in the final IA is "
            "exactly your wording. Paragraph breaks are shown as new lines.\n\n")
    tmp = tempfile.mkdtemp()
    with open(os.path.join(tmp, "changes.md"), "w", encoding="utf-8") as fh:
        fh.write(head + body)
    to_docx(os.path.join(tmp, "changes.md"), CHANGES)
    merged_set = {p.translate(QUOTES) for p in merged}
    same = sum(1 for p in student if p.translate(QUOTES) in merged_set)
    print(f"{same} of {len(student)} of your paragraphs are unchanged; {n} places corrected")


if __name__ == "__main__":
    main()
