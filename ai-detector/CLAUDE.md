# Notes for Claude sessions

Plume is an AI-writing detector for IB work (IA, Extended Essay, TOK) in French and English. It works
at sentence level with 3 labels: human / ai / rephrased. See README.md for the full design.

## Environment needs

Start every session with `python -m aidetect doctor`: it tests all of the below and prints the fix.

- `OPENROUTER_API_KEY` env var: required for `aidetect build` (generating AI training text).
- Network: openrouter.ai, huggingface.co + *.hf.co (base models, Wikipedia, weights CDN),
  api.archives-ouvertes.fr (HAL). The default Claude cloud network policy blocks all of them.
- GPU recommended for `aidetect train` with xlm-roberta-base. CPU works for `aidetect baseline`, or
  `--base-model intfloat/multilingual-e5-small` for a slow CPU run.
- PyTorch: download.pytorch.org may be blocked; plain `pip install -r requirements.txt` (PyPI) works.

## Conventions

- Run `pytest` before every commit. The smoke test trains a tiny model on CPU in about 1 minute.
- Never commit `data/`, `models/` or student essays: they are personal data. `.gitignore` covers this.
- Training and inference must share `aidetect/encoding.py` and `aidetect/textproc.py`. Any change to
  segmentation changes what the model sees, so retrain after one.
- The priority is a low false-positive rate on human text. Report FPR first; calibrate with
  `target_fpr` (default 1% of human sentences).
- `app/static/demo.json` is scripted by `scripts/make_demo.py`. It is not a model output; keep it
  labelled as a demo.
- CI lives at the repository root: `.github/workflows/plume-tests.yml` (runs `pytest` in `ai-detector/`).

## Next steps

0. Blocked until the key and network hosts above are set (as of 2026-09-24 none were). Check with `doctor`.
1. `python -m aidetect models`, then `python -m aidetect build --max-docs 200` for a small first
   dataset (~$8). Check `data/examples.jsonl` by hand.
2. `python -m aidetect baseline` and `python -m aidetect eval --model models/baseline.joblib`.
3. Full build within budget, `train` on GPU, `eval`, `mine`, then rebuild with the hard negatives.
4. Deploy: Docker image (see Dockerfile) on a host with ~2 GB RAM, or export to ONNX for in-browser use.
