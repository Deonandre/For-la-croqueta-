"""Extract plain text from uploaded .docx / .pdf / .txt files."""

from __future__ import annotations

import io


def extract_text(data: bytes, filename: str) -> str:
    name = filename.lower()
    if name.endswith(".docx"):
        import docx
        from docx.table import Table
        from docx.text.paragraph import Paragraph

        d = docx.Document(io.BytesIO(data))
        parts = []
        for child in d.element.body.iterchildren():  # paragraphs and tables in document order
            tag = child.tag.rsplit("}", 1)[-1]
            if tag == "p":
                parts.append(Paragraph(child, d).text)
            elif tag == "tbl":  # tab-separated so tables are recognised (and excluded)
                for row in Table(child, d).rows:
                    parts.append("\t".join(c.text.strip() for c in row.cells))
        return "\n".join(parts)
    if name.endswith(".pdf"):
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(data))
        return "\n\n".join((page.extract_text() or "") for page in reader.pages)
    for enc in ("utf-8", "utf-16", "latin-1"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")
