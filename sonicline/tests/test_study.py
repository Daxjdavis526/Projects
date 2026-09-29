"""The grid-study bookkeeping, with a fake pipeline whose answers follow
an exact power law in the cell size."""

import json
from pathlib import Path

import pytest

from sonicline.core import model as m
from sonicline.run import study
from sonicline.run.pipeline import RunResult


def _defn():
    return m.SimulationDefinition(
        name="s", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=6.25),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=1e6), ambient=m.Ambient(pressure=0.0),
                                exit_domain=m.TruncatedAtExit()),
        flow=m.Flow(turbulence=m.Inviscid()), mesh=m.MeshSpec(form=m.MeshForm.WEDGE))


def _fake(calls, trust="trusted"):
    def run(defn, run_dir, on_event=None, render=True, base_dir=None):
        ref = defn.mesh.refinement
        calls.append(ref)
        cells = round(3000 * ref**2)
        h = cells ** -0.5
        Path(run_dir).mkdir(parents=True, exist_ok=True)
        (Path(run_dir) / "mesh_report.json").write_text(json.dumps({"cells": cells}))
        metrics = {"mass_flow": {"inlet": 7e-3 * (1 - 5.0 * h**2)},
                   "discharge_coefficient": {"cfd": 0.994 - 3.0 * h**2},
                   "thrust": {"total": 4.9}, "specific_impulse": {"cfd": 70.0},
                   "exit": {"mach_mass_avg": None}}
        return RunResult(Path(run_dir), "completed", trust, metrics, {})
    return run


def test_three_levels_and_second_order_recovery(tmp_path):
    calls = []
    s = study.run(_defn(), tmp_path, runner=_fake(calls))
    assert calls == pytest.approx([2.0, 2 ** 0.5, 1.0])  # finest first
    assert s.valid
    cd = s.quantity("discharge coefficient").result
    assert cd.convergence == "monotone"
    assert cd.order == pytest.approx(2.0, abs=0.02)  # cell counts round, so r is not exact
    assert cd.extrapolated == pytest.approx(0.994, abs=1e-6)
    assert s.quantity("thrust [N]").result.convergence == "converged"
    assert s.quantity("exit Mach (mass-averaged)").result is None
    assert "GCI fine" in (tmp_path / "study.md").read_text()


def test_an_untrustworthy_level_invalidates_the_study(tmp_path):
    s = study.run(_defn(), tmp_path, runner=_fake([], trust="not_trustworthy"))
    assert not s.valid and not s.quantities
    assert "Not valid" in (tmp_path / "study.md").read_text()


def test_refinement_is_bounded():
    with pytest.raises(ValueError):
        m.MeshSpec(refinement=10.0)
