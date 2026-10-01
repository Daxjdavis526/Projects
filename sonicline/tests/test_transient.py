"""Transient runs without OpenFOAM: the definition, the case it writes,
the time series and its metrics, and the verdict's rules for them."""

import json

import numpy as np
import pytest

from sonicline.core import model as m
from sonicline.core.validate import resolve_profile
from sonicline.foam import case as foam_case
from sonicline.foam.parse import Table
from sonicline.mesh import revolved, sizing
from sonicline.post import timeseries


def _defn(**transient):
    return m.SimulationDefinition(
        name="t", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=20e5)),
        flow=m.Flow(turbulence=m.Inviscid(), time=m.Transient(end_time=1e-3, **transient)),
        mesh=m.MeshSpec(form=m.MeshForm.WEDGE, quality=m.MeshQuality.COARSE))


def test_transient_definition_is_checked():
    with pytest.raises(ValueError):
        m.Transient(end_time=1e-3, initial="warm")
    with pytest.raises(ValueError):
        m.Transient(end_time=1e-3, ramp_time=2e-3)
    d = _defn(ramp_time=1e-4)
    assert m.loads(m.dumps(d)) == d


def test_instant_opening_into_vacuum_is_flagged():
    from sonicline.core.validate import validate

    def codes(d):
        return {f.code for f in validate(d, resolve_profile(d))}

    vacuum = m.Boundaries(inlet=m.ReservoirInlet(p0=20e5), ambient=m.Ambient(pressure=0.0),
                          exit_domain=m.TruncatedAtExit())
    instant = m.SimulationDefinition(**{**_defn().__dict__, "boundaries": vacuum})
    assert "transient.instant_opening" in codes(instant)
    ramped = m.SimulationDefinition(**{**_defn(ramp_time=1e-4).__dict__, "boundaries": vacuum})
    assert "transient.instant_opening" not in codes(ramped)
    assert "transient.instant_opening" not in codes(_defn())  # 20:1 at sea level


def test_startup_case(tmp_path):
    d = _defn(ramp_time=2e-4, frames=10)
    prof = resolve_profile(d)
    mesh, meta = revolved.build(prof, sizing.spec_for(d, prof))
    s = foam_case.build_case(tmp_path / "c", d, prof, mesh, meta)
    assert s.solver == foam_case.CENTRAL_SOLVER  # transients are explicit
    control = (s.path / "system/controlDict").read_text()
    assert "domain_mass" in control and "writeInterval   0.0001;" in control
    assert "Euler" in (s.path / "system/fvSchemes").read_text()
    p = (s.path / "0/p").read_text()
    assert "uniformTotalPressure" in p and "table ((0 101325.0) (0.0002 2000000.0)" in " ".join(p.split())
    # Still gas at ambient everywhere at t = 0.
    from sonicline.foam import parse

    p_int, _ = parse.read_field(s.path / "0/p")
    U_int, _ = parse.read_field(s.path / "0/U")
    assert np.all(p_int == 101325.0) and np.all(U_int == 0.0)
    back = foam_case.CaseSummary.from_json(json.loads(json.dumps(s.to_json())))
    assert back.sector_factor == s.sector_factor and back.solver == s.solver


def _tables(t, mdot_in, mdot_out, mass, thrust):
    one = lambda v: Table(["sum(phi)"], t, {"sum(phi)": v})  # noqa: E731
    return {"mdot_inlet": one(-mdot_in), "mdot_outlet": one(mdot_out),
            "momentum_exit": Table(["weightedSum(U)"], t, {"weightedSum(U)": np.column_stack([thrust, 0 * t, 0 * t])}),
            "pforce_exit": Table(["areaIntegrate(p)"], t, {"areaIntegrate(p)": 0 * t}),
            "domain_mass": Table(["volIntegrate(rho)"], t, {"volIntegrate(rho)": mass})}


def test_time_series_metrics():
    """A filling domain whose outflow lags its inflow: the stored mass must
    equal the integrated difference, and the thrust rise is timed."""
    t = np.linspace(1e-6, 1e-3, 2001)
    tau = 1e-4
    mdot_in = np.full_like(t, 7e-3)
    mdot_out = 7e-3 * (1 - np.exp(-t / tau))
    mass = 1e-6 + 7e-3 * tau * (1 - np.exp(-t / tau))  # its time derivative is in - out
    thrust = 5.0 * (1 - np.exp(-t / tau))
    ts = timeseries.build(_tables(t, mdot_in, mdot_out, mass, thrust), 1.0, 0.0, 1e-5)
    tm = timeseries.metrics(ts)
    assert abs(tm["conservation_error"]) < 1e-4
    assert tm["settled"] and tm["thrust_final"] == pytest.approx(5.0, rel=1e-3)
    assert tm["time_to_90_percent_thrust"] == pytest.approx(tau * np.log(10), rel=0.01)
    # A leak (outflow the mass does not show) is caught.
    leaky = timeseries.build(_tables(t, mdot_in, mdot_out * 0.9, mass, thrust), 1.0, 0.0, 1e-5)
    assert abs(timeseries.metrics(leaky)["conservation_error"]) > 1e-2


def test_transient_verdict():
    from sonicline.metrics import Trust, verdict

    d = _defn()
    base = {"discharge_coefficient": {"cfd": 1.2, "kliegel_levine": None},  # a mid-startup overshoot
            "thrust": {"control_volume_disagreement": 0.2},
            "regime": {"quasi_1d": "underexpanded", "separation_expected": False}}
    developing = dict(base, transient={"settled": False, "thrust_drift_last_tenth": 0.3,
                                       "conservation_error": 1e-5, "mass_gained": 1.0, "mass_net_inflow": 1.0})
    v = verdict(d, "completed", True, [], None, developing, None)
    assert v.trust is Trust.WARNINGS and "still developing" in v.warnings[0]  # steady checks skipped
    leak = dict(developing, transient=dict(developing["transient"], conservation_error=0.05))
    assert verdict(d, "completed", True, [], None, leak, None).trust is Trust.NOT_TRUSTWORTHY


def test_variable_cp_air():
    """The cp(T) fit: gamma 1.40 cold and 1.35 at 833 K, enthalpy its
    integral, total temperature inverted exactly, and OpenFOAM given janaf."""
    from sonicline.core.gas import AIR, HOT_AIR

    g = HOT_AIR
    gamma = lambda T: g.cp_at(T) / (g.cp_at(T) - g.R)  # noqa: E731
    assert gamma(300.0) == pytest.approx(1.400, abs=2e-3) and gamma(833.3) == pytest.approx(1.350, abs=2e-3)
    assert g.cp == pytest.approx(g.cp_at(833.3))
    dh = g.enthalpy(600.0) - g.enthalpy(500.0)
    assert dh == pytest.approx(np.mean([g.cp_at(t) for t in np.linspace(500, 600, 1001)]) * 100.0, rel=1e-6)
    T0 = g.total_temperature(300.0, 400.0**2)
    assert g.enthalpy(T0) - g.enthalpy(300.0) == pytest.approx(400.0**2 / 2, rel=1e-9)
    assert AIR.total_temperature(300.0, 100.0**2) == pytest.approx(300.0 + 100.0**2 / (2 * AIR.cp))


def test_variable_cp_case_writes_janaf(tmp_path):
    d = _defn()
    d = m.SimulationDefinition(**{**d.__dict__, "gas": m.GasSpec(species="air_hot")})
    prof = resolve_profile(d)
    mesh, meta = revolved.build(prof, sizing.spec_for(d, prof))
    s = foam_case.build_case(tmp_path / "c", d, prof, mesh, meta)
    text = (s.path / "constant/thermophysicalProperties").read_text()
    assert "janaf" in text and "lowCpCoeffs" in text and "hConst" not in text
