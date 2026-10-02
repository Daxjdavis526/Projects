"""Rarefaction (core.rarefaction): the mean free path, the Knudsen number
along a run's profiles, the pre-flight findings and the verdict."""

import pytest

from sonicline.core import model as m
from sonicline.core import rarefaction as R
from sonicline.core.gas import NITROGEN
from sonicline.core.validate import Severity, resolve_profile, validate


def test_mean_free_path_of_nitrogen_at_standard_conditions():
    # Bird (1994) table A.1 hard-sphere value for N2 at 273 K and 1 atm: 59 nm
    # (VHS; HS from the viscosity gives a few percent more).
    lam = R.mean_free_path(NITROGEN, 101325.0, 273.15)
    assert 58e-9 < lam < 64e-9
    # inversely proportional to pressure
    assert R.mean_free_path(NITROGEN, 1013.25, 273.15) == pytest.approx(100 * lam)


def test_regimes():
    assert R.regime(1e-4) == "continuum" and R.regime(0.02) == "slip" and R.regime(0.5) == "transitional"


def _defn(p0, rt="1 mm"):
    return m.loads(f'''{{"name": "k", "geometry": {{"type": "conical_nozzle", "throat_radius": "{rt}",
        "expansion_ratio": 10}}, "boundaries": {{"inlet": {{"type": "reservoir_inlet", "p0": "{p0}",
        "T0": "300 K"}}, "ambient": {{"pressure": 0}}, "exit_domain": {{"type": "truncated_at_exit"}}}},
        "flow": {{"turbulence": {{"type": "laminar"}}}}}}''')


def test_along_the_nozzle_the_wall_row_finds_the_largest():
    d = _defn("10 bar")
    prof = resolve_profile(d)
    x0, x1 = prof.x_inlet, prof.x_exit
    xs = [x0 + (x1 - x0) * k / 10 for k in range(11)]
    profiles = {"centreline": {"x": xs, "p": [1e5] * 11, "T": [250.0] * 11},
                "wall": {"x": xs, "p": [1e5] * 10 + [2e3], "T": [250.0] * 10 + [290.0]}}
    r = R.along_nozzle(NITROGEN, profiles, prof)
    assert r["where_max"] == "wall" and r["x_max"] == pytest.approx(x1)
    assert r["max"] == pytest.approx(R.knudsen(NITROGEN, 2e3, 290.0, 2 * prof.exit_radius))
    assert r["throat"] == pytest.approx(R.knudsen(NITROGEN, 1e5, 250.0, 2 * prof.throat_radius), rel=0.05)


def test_preflight_findings_scale_with_size_and_pressure():
    codes = lambda d: {f.code: f.severity for f in validate(d, resolve_profile(d))}  # noqa: E731
    assert "flow.rarefied" not in codes(_defn("10 bar")) and "flow.slip" not in codes(_defn("10 bar"))
    # a 0.1 mm throat: slip at 0.05 bar (exit Kn ~0.08), transition at 0.01 bar
    assert codes(_defn("0.05 bar", "0.05 mm")).get("flow.slip") is Severity.WARNING
    assert codes(_defn("0.01 bar", "0.05 mm")).get("flow.rarefied") is Severity.ERROR


def test_the_verdict_warns_in_slip_and_refuses_in_transition():
    from sonicline.metrics import Trust, verdict

    d = _defn("10 bar")

    def judged(kn):
        metrics = {"discharge_coefficient": {"cfd": 0.99, "kliegel_levine": 0.994},
                   "thrust": {"control_volume_disagreement": 0.0},
                   "regime": {"quasi_1d": "underexpanded", "separation_expected": False},
                   "rarefaction": {"max": kn, "x_max": 0.01, "where_max": "wall"}}
        return verdict(d, "completed", True, [], None, metrics, None)

    slip, transition = judged(0.03), judged(0.3)
    assert any("slip regime" in w for w in slip.warnings) and slip.trust is not Trust.NOT_TRUSTWORTHY
    assert transition.trust is Trust.NOT_TRUSTWORTHY
    assert any("transition regime" in r for r in transition.reasons)
    assert not any("Knudsen" in w for w in judged(0.002).warnings)
    # an inviscid run's walls slip already: no slip warning, but transition still refuses
    d = m.SimulationDefinition(name="i", geometry=d.geometry, boundaries=d.boundaries,
                               flow=m.Flow(turbulence=m.Inviscid()))
    assert not any("slip regime" in w for w in judged(0.03).warnings)
    assert judged(0.3).trust is Trust.NOT_TRUSTWORTHY
