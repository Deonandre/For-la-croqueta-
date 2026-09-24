"""The Colab notebook drives the CLI: renaming a command or flag must not silently break it."""

import ast
import json
from pathlib import Path

import pytest

from aidetect.cli import main

NB = Path(__file__).resolve().parents[1] / "notebooks" / "plume_colab.ipynb"


def _code_cells():
    nb = json.loads(NB.read_text(encoding="utf-8"))
    return ["".join(c["source"]) for c in nb["cells"] if c["cell_type"] == "code"]


def test_notebook_cells_are_valid_python():
    cells = _code_cells()
    assert cells
    for src in cells:
        ast.parse(src)


def test_notebook_only_uses_existing_cli_commands_and_flags(capsys):
    calls = []  # plume("build", "--max-docs", ...) and [sys.executable, "-m", "aidetect", "serve", ...]
    for src in _code_cells():
        for node in ast.walk(ast.parse(src)):
            if isinstance(node, ast.Call) and getattr(node.func, "id", None) == "plume":
                args = node.args
            elif isinstance(node, ast.List):
                args = node.elts
            else:
                continue
            strs = [a.value for a in args if isinstance(a, ast.Constant) and isinstance(a.value, str)]
            if isinstance(node, ast.List):
                if "aidetect" not in strs:
                    continue
                strs = strs[strs.index("aidetect") + 1:]
            calls.append((strs[0], [s for s in strs[1:] if s.startswith("--")]))
    assert {c for c, _ in calls} == {"doctor", "models", "build", "baseline", "train", "eval", "mine", "serve"}
    for cmd, flags in calls:
        with pytest.raises(SystemExit):
            main([cmd, "--help"])
        help_text = capsys.readouterr().out
        for flag in flags:
            assert flag in help_text, f"notebook uses `{cmd} {flag}`, which the CLI does not accept"
