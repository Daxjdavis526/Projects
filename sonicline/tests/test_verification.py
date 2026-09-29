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
    assert set(v.COMPARISONS) <= {"V6", "V7"}
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
