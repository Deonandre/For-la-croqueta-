from aidetect.doctor import Check, report


def test_report_marks_only_the_steps_a_failed_check_blocks():
    text, ready = report([
        Check("OPENROUTER_API_KEY", False, "not set", ("build",), "add it"),
        Check("GPU", False, "none", (), "use a small model"),
        Check("trained model", True, "models/plume", ("serve",)),
    ])
    assert ready == {"build": False, "train": True, "serve": True}
    assert "-> add it" in text and "build: BLOCKED" in text
