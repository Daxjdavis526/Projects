"""The verification suite's bookkeeping, without OpenFOAM: comparison cases
reuse the runs they compare, and each run happens once."""

import pytest

from sonicline import verification as v


def _fake_run(calls):
    def run_case(case, quality, out, processors=1, form=None, on_event=None, solver="auto"):
        calls.append((case.name, form or case.form, solver))
        # The central run lands 0.05 % below in mass flow, the 3D run 0.3 % below.
        scale = {"rhoCentralFoam": 0.9995}.get(solver, 1.0) * (0.997 if form == "o_grid_3d" else 1.0)
        metrics = {"mass_flow": {"inlet": 7e-3 * scale}, "thrust": {"total": 5.0 * scale}}
        return v.CaseResult(case.name, case.title, "completed", "trusted"), metrics
    return run_case


def test_v1_runs_once_for_v6_and_v7(tmp_path, monkeypatch):
    calls = []
    monkeypatch.setattr(v, "run_case", _fake_run(calls))
    results = v.run_suite(["V1", "V6", "V7"], "standard", tmp_path)
    assert calls == [("V1", "wedge", "auto"), ("V1", "o_grid_3d", "auto"),
                     ("V1", "wedge", "rhoCentralFoam")]
    by_case = {r.case: r for r in results if r.case in v.COMPARISONS}
    assert by_case["V7"].passed
    assert not by_case["V6"].passed  # 0.3 % apart exceeds its 0.2 % mass-flow tolerance
    assert (tmp_path / "verification.md").exists()


def test_comparisons_are_known_to_the_cli():
    from sonicline import cli
    assert set(v.COMPARISONS) <= {"V5", "V6", "V7", "V10", "V11", "V14", "V15", "V16", "V17", "V18", "V19", "V21", "V22"}
    assert cli.main(["verify", "--cases", "V99"]) == 2


def test_nparc_nozzle_matches_its_published_shock_position():
    import math

    from sonicline.core.gas import NITROGEN
    from sonicline.core.theory import nozzle

    assert v.nparc_area(0.0) == 2.5 and v.nparc_area(5.0) == 1.0 and v.nparc_area(10.0) == 1.5
    pts = v.nparc_profile_points()
    assert pts[0][0] == 0.0 and pts[-1][0] == 10.0
    perf = nozzle.analyse(NITROGEN, 1.0, 300.0, v.V2_PRESSURE_RATIO, 1.0, 1.5)
    lo, hi = 5.0, 10.0
    for _ in range(60):
        mid = 0.5 * (lo + hi)
        lo, hi = (mid, hi) if v.nparc_area(mid) < perf.shock_area_ratio else (lo, mid)
    assert lo == pytest.approx(7.562, abs=2e-3)  # NPARC's quasi-1D reference, in inches
    assert math.isclose(perf.shock_mach, 1.61, abs_tol=0.01)


@pytest.mark.parametrize("name, fraction", [("V3a", 0.754), ("V3b", 0.408)])
def test_v3_shocks_stand_inside_the_reference_nozzle(name, fraction):
    from sonicline.core.theory import nozzle
    from sonicline.core.validate import resolve_profile
    from sonicline.foam.case import solver_for

    defn = v.CASES[name].definition("standard", "wedge")
    prof = resolve_profile(defn)
    perf = nozzle.analyse(defn.gas.model(), defn.boundaries.inlet.p0, 300.0,
                          defn.boundaries.ambient.pressure, prof.throat_area, prof.area(prof.x_exit))
    assert perf.regime is nozzle.Regime.SHOCK_IN_NOZZLE
    lo, hi = prof.throat_x, prof.x_exit
    for _ in range(60):
        mid = 0.5 * (lo + hi)
        lo, hi = (mid, hi) if prof.area(mid) / prof.throat_area < perf.shock_area_ratio else (lo, mid)
    assert (lo - prof.throat_x) / (prof.x_exit - prof.throat_x) == pytest.approx(fraction, abs=2e-3)
    assert solver_for(defn, prof) == "rhoCentralFoam"


def test_v13_mass_check_is_the_suites_again():
    # DESIGN.md finding 78: the tighter pressure solve takes V13's old
    # 0.7-2.9e-4 outflow deficit to 1.3-2.7e-5, inside the suite's 1e-4.
    from sonicline import verification as v

    def checks(imbalance):
        metrics = {"mass_flow": {"imbalance_inlet_exit": imbalance}, "thrust": {"control_volume_disagreement": 0.0},
                   "wall_heat": {"heat_into_gas": 1.0, "balance_error": 1e-5}}
        return [c.evaluate() for c in v._v13_checks(metrics, None)]

    assert all(c.passed for c in checks(2.7e-5))
    assert not all(c.passed for c in checks(1.9e-4))
    assert v.CASES["V13"].definition("standard").numerics.convergence.mass_imbalance == 5e-5


def test_v21_runs_at_the_requested_quality():
    # Until M14's convergence aids only the coarse channel converged; the
    # nightly now runs the standard one (DESIGN.md finding 77).
    for quality in ("coarse", "standard"):
        defn = v.CASES["V21-slip"].definition(quality)
        assert defn.mesh.quality.value == quality and defn.mesh.form.value == "planar"


def test_v22_compares_the_slip_effect_on_cd():
    # The solvers' own Cd and C_T differ; the slip ratio removes that.
    from sonicline import verification as v

    def run(cd, thrust=1.0, p0=100.0):
        r = v.CaseResult("x", "x", "completed", "trusted")
        return r, {"thrust": {"total": thrust}, "conditions": {"p0": p0}, "mass_flow": {"inlet": 1.0},
                   "discharge_coefficient": {"cfd": cd}}

    pimple = (run(0.9220), run(0.9220 * 1.00374, thrust=0.9984))
    central = (run(0.9290, thrust=1.0042), run(0.9290 * 1.00388, thrust=1.0042 * 0.9966))
    r = v.v22_check(pimple, central)
    assert r.passed and r.checks[0].value == pytest.approx(1.00388)
    assert "C_T (not checked)" in r.checks[0].note
    assert not v.v22_check(pimple, (run(0.9290), run(0.9290 * 1.0050))).passed
    defn = v.CASES["V22-slip"].definition("standard")
    assert defn.numerics.solver == "rhoCentralFoam" and defn.boundaries.wall_slip is not None
    assert defn.numerics.convergence.mass_imbalance == v.V22_MASS_TOLERANCE / 2
