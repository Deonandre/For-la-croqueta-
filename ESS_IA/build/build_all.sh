#!/usr/bin/env bash
# Two-pass build: the table of contents is filled in only after the document is fully formatted.
#   NODE_MODULES=<dir with docx+jszip> SOFFICE_PY=<skills/docx/scripts/office/soffice.py> build/build_all.sh
set -euo pipefail
cd "$(dirname "$0")/.."
: "${NODE_MODULES:?set NODE_MODULES}" "${SOFFICE_PY:?set SOFFICE_PY}"
DOCX="$PWD/ESS_IA_Cameroon_TreeCoverLoss_CO2.docx"

to_pdf() { timeout 300 python3 "$SOFFICE_PY" --headless --convert-to pdf --outdir "$PWD" "$DOCX" 2>&1 | grep -v javaldx || true; }

rm -f build/toc_pages.json
echo "== pass 1: build with placeholder page numbers"
NODE_PATH="$NODE_MODULES" node build/build_ia.js > /dev/null
to_pdf
python3 build/paginate.py
echo "== pass 2: build with measured page numbers"
NODE_PATH="$NODE_MODULES" node build/build_ia.js
to_pdf
python3 build/paginate.py --check
