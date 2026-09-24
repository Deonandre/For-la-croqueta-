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

0. The Claude cloud environment is still blocked (no key, hosts denied, no GPU as of 2026-09-24), so the
   recommended route is `notebooks/plume_colab.ipynb` on Google Colab: it runs build, baseline, train,
   eval, mine and the hard-negative round with the user's key and saves everything to their Google
   Drive. It has a `BRANCH` setting: update it (and the README link) if this work moves to `main`.
1. First run: 200 documents, budget $15. Ask the user to paste `reports/plume/report.md` (step 8 of the
   notebook) and judge it: human FPR first, then AI / rephrased recall, then the held-out generators.
2. If the numbers hold: full run (1,500 documents, $60) and the user's pre-2023 essays if they have any.
3. Deploy: Docker image (see Dockerfile) on a host with ~2 GB RAM, or export to ONNX for in-browser use.
   Until then the notebook's last step serves the app from Colab.
- Changing a CLI command or flag: update the notebook too; `tests/test_notebook.py` fails otherwise.
- The notebook is plain JSON. After editing it, re-run it end to end with Colab stubbed and `build --fake`
  plus a tiny base model (see `tests/test_pipeline_smoke.py`) before pushing.
