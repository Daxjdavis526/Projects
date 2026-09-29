import json
from pathlib import Path

from sonicline.cli import main

EXAMPLES = Path(__file__).resolve().parents[1] / "examples"


def test_check_example(capsys):
    assert main(["check", str(EXAMPLES / "sea-level-20bar.json")]) == 0
    out = capsys.readouterr().out
    assert "regime              matched" in out
    assert "regime.matched" in out


def test_check_reports_errors_with_exit_code(tmp_path, capsys):
    src = json.loads((EXAMPLES / "sea-level-20bar.json").read_text(encoding="utf-8"))
    src["boundaries"]["exit_domain"] = {"type": "truncated_at_exit"}
    path = tmp_path / "bad.json"
    path.write_text(json.dumps(src), encoding="utf-8")
    assert main(["check", str(path)]) == 1
    assert "domain.truncated_not_supersonic" in capsys.readouterr().out


def test_check_unreadable_definition(tmp_path, capsys):
    path = tmp_path / "broken.json"
    path.write_text("{not json", encoding="utf-8")
    assert main(["check", str(path)]) == 2
    assert "not valid JSON" in capsys.readouterr().err


def test_planar_example_checks_clean(capsys):
    assert main(["check", str(EXAMPLES / "planar-tp1704-b1-npr2.46.json")]) == 0
    out = capsys.readouterr().out
    assert "throat height" in out and "regime              overexpanded" in out
    assert "regime.separation_likely" in out
