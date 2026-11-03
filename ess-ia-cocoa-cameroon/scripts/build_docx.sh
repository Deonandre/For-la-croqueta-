#!/usr/bin/env bash
# Build submission-ready .docx (and .pdf if LibreOffice is present) from the markdown.
# Usage: bash scripts/build_docx.sh [IA_FINAL.md]
set -euo pipefail
cd "$(dirname "$0")/.."
SRC="${1:-IA_Cocoa_Deforestation_Cameroon.md}"
BASE="$(basename "$SRC" .md)"
TMP="$(mktemp -d)"
# strip the word-count control markers; they are not content
sed -e 's/<!--NOCOUNT-->//g' -e 's|<!--/NOCOUNT-->||g' "$SRC" > "$TMP/$BASE.md"
pandoc "$TMP/$BASE.md" -f gfm -t docx --standalone -o "output/$BASE.docx"
echo "wrote output/$BASE.docx"
if command -v soffice >/dev/null 2>&1; then
  soffice --headless --convert-to pdf --outdir output "output/$BASE.docx" >/dev/null 2>&1 || true
  [ -f "output/$BASE.pdf" ] && echo "wrote output/$BASE.pdf"
fi
