import sys
from pathlib import Path

import numpy as np
import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
FIXTURES = Path(__file__).parent / "fixtures"

from aidetect.predictor import Calibration, Predictor  # noqa: E402


class KeywordPredictor(Predictor):
    """Test double: sentences containing a marker word get a confident label."""

    name = "keyword-test"
    kind = "test"

    def __init__(self):
        self.calibration = Calibration()

    def predict(self, sentences, para_starts, language):
        out = np.tile([0.9, 0.05, 0.05], (len(sentences), 1))
        for i, s in enumerate(sentences):
            low = s.lower()
            if "crucial" in low or "essentiel" in low:
                out[i] = [0.05, 0.9, 0.05]
            elif "reworded" in low or "reformulé" in low:
                out[i] = [0.05, 0.05, 0.9]
        return out


@pytest.fixture
def essay_en():
    return (FIXTURES / "essay_en.txt").read_text()


@pytest.fixture
def essay_fr():
    return (FIXTURES / "essay_fr.txt").read_text()


@pytest.fixture
def keyword_predictor():
    return KeywordPredictor()
