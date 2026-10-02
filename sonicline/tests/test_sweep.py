"""Design sweeps (run.sweep): axes, the grid of points, invalid points, the
quasi-1D prediction, and the table of a sweep driven by a stand-in runner
(no OpenFOAM)."""

import json
from pathlib import Path

import pytest

from sonicline.core import model as m
from sonicline.run import pipeline, sweep

BASE = {
    "name": "s",
    "geometry": {"type": "conical_nozzle", "throat_radius": "1 mm", "expansion_ratio": 2.88},
    "boundaries": {"inlet": {"type": "reservoir_inlet", "p0": "20 bar", "T0": "300 K"},
                   "ambient": {"pressure": "1 atm", "temperature": "288.15 K"}},
    "mesh": {"form": "wedge", "quality": "coarse"},
}


def test_axis_values_are_numbers_or_quantities():
    a = sweep.Axis.parse("boundaries.inlet.p0=5 bar, 10 bar,2e6")
    assert a.path == "boundaries.inlet.p0" and a.values == ["5 bar", "10 bar", 2e6]
    assert sweep.Axis.parse("geometry.expansion_ratio=2,4").values == [2, 4]
    with pytest.raises(sweep.SweepError):
        sweep.Axis.parse("geometry.expansion_ratio")


def test_the_grid_is_every_combination_parsed_and_predicted():
    pts = sweep.build_points(BASE, [sweep.Axis.parse("boundaries.inlet.p0=10 bar,20 bar"),
                                    sweep.Axis.parse("geometry.expansion_ratio=2,4")])
    assert len(pts) == 4
    (p, defn) = pts[3]
    assert p.settings == {"boundaries.inlet.p0": "20 bar", "geometry.expansion_ratio": 4}
    assert p.si["boundaries.inlet.p0"] == pytest.approx(20e5)
    assert defn.geometry.expansion_ratio == 4
    # choked: the predicted mass flow doubles with the chamber pressure
    assert pts[2][0].prediction["mass_flow"] == pytest.approx(2 * pts[0][0].prediction["mass_flow"], rel=1e-9)


def test_an_invalid_point_is_listed_not_run_and_a_misspelt_path_stops_the_sweep():
    pts = sweep.build_points(BASE, [sweep.Axis.parse("geometry.expansion_ratio=2,0.5")])
    assert pts[0][0].error is None and pts[1][0].error and pts[1][1] is None
    with pytest.raises(sweep.SweepError, match="every point"):
        sweep.build_points(BASE, [sweep.Axis.parse("geometry.expansion_ration=2,4")])
    with pytest.raises(sweep.SweepError, match="limited"):
        sweep.build_points(BASE, [sweep.Axis.parse("geometry.expansion_ratio=" + ",".join(
            str(2 + i / 100) for i in range(sweep.MAX_POINTS + 1)))])


def test_a_sweep_collects_values_uncertainties_and_verdicts(tmp_path: Path):
    calls = []

    def fake(defn, run_dir, on_event=None, render=True, base_dir=None):
        calls.append(defn)
        p0 = defn.boundaries.inlet.p0
        metrics = {"mass_flow": {"inlet": 7e-9 * p0}, "thrust": {"total": 4e-6 * p0},
                   "specific_impulse": {"cfd": 58.0}, "discharge_coefficient": {"cfd": 0.99},
                   "conditions": {"p0": p0},
                   "uncertainty": {"mass_flow": {"absolute": 1e-5}, "thrust": {"absolute": 0.01},
                                   "specific_impulse": {"absolute": 0.3}}}
        trust = "not_trustworthy" if p0 < 12e5 else "trusted"
        return pipeline.RunResult(Path(run_dir), "completed", trust, metrics, {})

    r = sweep.run(m.loads(json.dumps(BASE)), [sweep.Axis.parse("boundaries.inlet.p0=10 bar,20 bar")],
                  tmp_path, processors=2, runner=fake)
    assert [c.numerics.processors for c in calls] == [2, 2]
    good = r.points[1]
    assert good.values["thrust"] == pytest.approx(8.0) and good.uncertainty["thrust"] == 0.01
    assert not r.ok  # one point is not trustworthy
    md = (tmp_path / "sweep.md").read_text(encoding="utf-8")
    assert "8 ± 0.01" in md and "**NOT TRUSTWORTHY**" in md and "(1D " in md
    rows = (tmp_path / "sweep.csv").read_text(encoding="utf-8").splitlines()
    assert rows[0].startswith("boundaries.inlet.p0,status,trust") and len(rows) == 3
    assert json.loads((tmp_path / "sweep.json").read_text(encoding="utf-8"))["points"][1]["trust"] == "trusted"


def test_predict_only_runs_nothing(tmp_path: Path):
    def never(*a, **k):
        raise AssertionError("predict-only must not run the CFD")

    r = sweep.run(BASE, [sweep.Axis.parse("geometry.expansion_ratio=2,3")], tmp_path,
                  predict_only=True, runner=never)
    assert r.ok and all(p.prediction for p in r.points)
    assert "quasi-1D prediction only" in (tmp_path / "sweep.md").read_text(encoding="utf-8")


def test_a_definition_that_describes_no_nozzle_is_an_error_not_a_crash():
    from sonicline.project.draft import Draft

    data = json.loads(json.dumps(BASE))
    data["geometry"]["expansion_ratio"] = 0.5
    a = Draft(data).assess()
    assert a.definition is None and "expansion ratio" in a.error and not a.runnable
