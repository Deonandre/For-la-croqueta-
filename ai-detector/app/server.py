"""Web app: paste or upload an essay, get the highlighted analysis.

Run with ``python -m aidetect serve --model models/plume``. Texts are analysed in memory and never
stored or logged.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from aidetect.analyze import analyze
from aidetect.extract import extract_text
from aidetect.predictor import Predictor, load_predictor

STATIC = Path(__file__).parent / "static"
MAX_CHARS = 120_000  # ~20k words, far above an Extended Essay
MAX_UPLOAD = 15 * 1024 * 1024

app = FastAPI(title="Plume", docs_url=None, redoc_url=None)
app.mount("/static", StaticFiles(directory=STATIC), name="static")


@lru_cache(maxsize=1)
def get_predictor() -> Predictor:
    path = os.environ.get("AIDETECT_MODEL")
    if not path:
        raise HTTPException(503, "no_model")
    return load_predictor(path)


class AnalyzeRequest(BaseModel):
    text: str


def _run(text: str) -> dict:
    text = text.replace("\r\n", "\n")
    if not text.strip():
        raise HTTPException(400, "empty_text")
    if len(text) > MAX_CHARS:
        raise HTTPException(413, "text_too_long")
    result = analyze(text, get_predictor())
    result["text"] = text
    return result


@app.get("/")
def index():
    return FileResponse(STATIC / "index.html")


@app.get("/api/health")
def health():
    try:
        p = get_predictor()
        return {"ready": True, "model": p.name, "kind": p.kind}
    except HTTPException:
        return {"ready": False}


@app.post("/api/analyze")
def analyze_text(req: AnalyzeRequest):
    return _run(req.text)


@app.post("/api/analyze-file")
async def analyze_file(file: UploadFile = File(...)):
    name = (file.filename or "").lower()
    if not name.endswith((".docx", ".pdf", ".txt", ".md")):
        raise HTTPException(415, "unsupported_file")
    data = await file.read()
    if len(data) > MAX_UPLOAD:
        raise HTTPException(413, "file_too_large")
    try:
        text = extract_text(data, name)
    except Exception:
        raise HTTPException(422, "unreadable_file")
    return _run(text)
