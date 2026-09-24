# Plume: AI-writing detector for IB school work

Plume checks IB Internal Assessments, Extended Essays and TOK essays, in **French and English**, and
highlights sentence by sentence which passages look:

- **AI-generated** (red): written by a language model, including "humanized" AI text
- **AI-rephrased** (amber): the student's own text reworded, heavily polished or machine-translated by AI
- **Human**: no highlight

Headings, quotations, tables, captions, equations, the bibliography and appendices are detected and
**not analysed**. They are formulaic by nature and would cause false accusations. They appear greyed out.

A result is a probability, not proof. It is meant to start a conversation with the student, never to
be the only evidence.

## How it works

It uses the same recipe as the strongest commercial detectors (Pangram), specialised on IB work:

1. **Human essays** written before 2023, when AI writing was not yet common. The best source is a
   school's own archive of IAs/EEs (drop them in `data/human/local/`; they are never committed).
   French academic writing from HAL and encyclopaedic text are used as a supplement.
2. **AI "mirrors"**: for every human essay, 9 model families (GPT, Claude, Gemini, Llama, Mistral,
   DeepSeek, Qwen, Grok, Cohere, all through one OpenRouter key) write the same kind of text on the
   same topic, with varied student personas.
3. **Mixed documents**, used to train the highlighting: passages replaced by AI text that fits the
   context, passages reworded in 6 styles (paraphrase, "make it academic", "humanize"…), grammar-only
   fixes (these stay *human* if the edit is small, so spell-checking is not punished), and FR↔EN
   machine translation.
4. **Training**: a multilingual transformer (XLM-RoBERTa) labels every token. It reads the whole
   context, so it can see where an AI passage starts and stops. Scores are smoothed per sentence
   (Viterbi) to give clean passages.
5. **Calibration**: the decision threshold is tuned so that at most 1% of human sentences are flagged
   on validation data.
6. **Hard-negative mining**: human essays the model wrongly flags are collected and fed back into the
   next training round. This loop is what pushes false positives down.
7. **Honest evaluation**: two model families (Grok, Cohere) are never used in training, so the test
   set measures detection of unseen models. The report lists false-positive rates first.

## Pipeline

```bash
pip install -r requirements.txt
export OPENROUTER_API_KEY=...          # in the environment settings, never in code

python -m aidetect models              # which generator models will be used
python -m aidetect build               # human docs -> labelled dataset (data/examples.jsonl), budget-capped
python -m aidetect baseline            # fast CPU baseline (models/baseline.joblib): the number to beat
python -m aidetect train               # transformer (models/plume); a GPU is strongly recommended
python -m aidetect eval --model models/plume          # reports/latest/report.md
python -m aidetect mine --model models/plume          # data/hard_negatives.jsonl
python -m aidetect build --human-jsonl data/hard_negatives.jsonl   # next round, then train again
python -m aidetect serve --model models/plume         # web app on http://127.0.0.1:8000
python -m aidetect analyze essay.docx --model models/plume         # coloured output in the terminal
```

Everything is configured in `configs/default.yaml` (sources, generator families, budget, variants,
training settings).

## Web app

`python -m aidetect serve --model <model>` opens the app. You can paste text or upload a .docx, .pdf
or .txt file and get:

- a verdict, the share of AI / rephrased / human text and a confidence level
- the essay with highlighted passages; hover a sentence to see its probabilities
- the list of flagged passages (click one to jump to it) and a breakdown per section
- print / save as PDF

Texts are analysed in memory and never stored. A demo with a made-up example is available at `/?demo`.

## Tests

```bash
pytest
```

The suite includes an end-to-end run: it builds fake data, trains a tiny transformer on CPU,
calibrates it, evaluates it and analyzes an essay. It proves the plumbing works, not the accuracy.
Accuracy comes from real data and is measured by `aidetect eval`.

## Project layout

```
aidetect/textproc.py      sentence splitting with offsets; IB structure detection (excluded regions)
aidetect/data/            human sources, IB prompts (FR/EN), OpenRouter client, dataset builder
aidetect/encoding.py      sentence <-> token windows (shared by training and inference)
aidetect/train.py         transformer fine-tuning + calibration
aidetect/baseline.py      TF-IDF + logistic regression baseline
aidetect/smoothing.py     Viterbi smoothing into passages
aidetect/analyze.py       full analysis -> JSON for the UI
aidetect/evaluate.py      metrics and reports
aidetect/mine.py          hard-negative mining
app/                      FastAPI server + web interface
```
