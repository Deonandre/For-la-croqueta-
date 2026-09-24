"""Build app/static/demo.json: a made-up analysis used to preview the interface (``/?demo``).

The labels below are scripted by hand to show every feature; this is NOT a model output.
"""

import json
from pathlib import Path

import numpy as np

from aidetect.analyze import analyze
from aidetect.predictor import Calibration, Predictor

ROOT = Path(__file__).resolve().parents[1]


class ScriptedPredictor(Predictor):
    name = "demo (scripted)"
    kind = "demo"
    calibration = Calibration()

    def predict(self, sentences, para_starts, language):
        out = []
        for s in sentences:
            if any(k in s for k in ("pivotal", "multifaceted", "valuable insights")):
                out.append([0.03, 0.94, 0.03])
            elif any(k in s for k in ("nuanced picture", "curtail", "elasticity")):
                out.append([0.08, 0.12, 0.80])
            elif "My aunt runs" in s:
                out.append([0.83, 0.10, 0.07])
            else:
                out.append([0.93, 0.04, 0.03])
        return np.array(out)


text = (ROOT / "scripts" / "demo_essay.txt").read_text()
result = analyze(text, ScriptedPredictor())
result["text"] = text
(ROOT / "app" / "static" / "demo.json").write_text(json.dumps(result, ensure_ascii=False, indent=1))
print(json.dumps(result["summary"], indent=2))
