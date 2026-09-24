"""Build a single self-contained HTML preview of the web app with the demo analysis embedded.

Usage: python scripts/build_preview.py OUTPUT.html
The page needs no server: it opens on the (made-up) demo and explains that the model is not trained yet.
"""

import json
import re
import sys
from pathlib import Path

STATIC = Path(__file__).resolve().parents[1] / "app" / "static"

html = (STATIC / "index.html").read_text()
body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
body = re.sub(r'\s*<script src="/static/app.js"></script>', "", body)
css = (STATIC / "styles.css").read_text()
js = (STATIC / "app.js").read_text()
demo = json.dumps({"demo": json.loads((STATIC / "demo.json").read_text())}, ensure_ascii=False).replace("</", "<\\/")

page = f"""<title>Plume</title>
<style>
{css}
</style>
{body.strip()}
<script>window.PLUME_PREVIEW = {demo};</script>
<script>
{js}
</script>
"""
Path(sys.argv[1]).write_text(page)
print(f"wrote {sys.argv[1]} ({len(page) // 1024} KB)")
