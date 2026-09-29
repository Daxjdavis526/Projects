from sonicline.core import model as m
from sonicline.core.validate import Severity, has_errors, validate


def definition(eps=2.88, p0=20e5, pa=101325.0, exit_domain=None, turbulence=None, inlet=None):
    return m.SimulationDefinition(
        name="t",
        geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=eps),
        boundaries=m.Boundaries(
            inlet=inlet or m.ReservoirInlet(p0=p0),
            ambient=m.Ambient(pressure=pa),
            exit_domain=exit_domain or m.Plume(),
        ),
        flow=m.Flow(turbulence=turbulence or m.KOmegaSST()),
    )


def codes(findings, severity=None):
    return {f.code for f in findings if severity is None or f.severity is severity}


def test_matched_sea_level_nozzle_is_clean():
    f = validate(definition())
    assert not has_errors(f)
    assert "regime.matched" in codes(f)
    assert "gas.condensation_margin" in codes(f)


def test_vacuum_nozzle_at_sea_level_warns_of_separation():
    f = validate(definition(eps=20.0))
    assert "regime.separation_likely" in codes(f, Severity.WARNING)


def test_truncated_domain_at_sea_level_is_an_error():
    f = validate(definition(exit_domain=m.TruncatedAtExit()))
    assert "domain.truncated_not_supersonic" in codes(f, Severity.ERROR)


def test_truncated_domain_in_vacuum_is_fine():
    f = validate(definition(eps=20.0, pa=0.0, exit_domain=m.TruncatedAtExit()))
    assert not has_errors(f)
    assert not codes(f) & {"domain.truncated_not_supersonic", "domain.truncated_underexpanded"}


def test_unchoked_and_shocked_regimes():
    # eps = 2.88 chokes against 1 atm above p0 ~ 1.044 bar (first critical
    # pressure ratio 0.9705), so 1.04 bar is unchoked and 1.5 bar is not.
    assert "regime.unchoked" in codes(validate(definition(p0=1.04e5)))
    assert "regime.shock_in_nozzle" in codes(validate(definition(p0=1.5e5)))
    assert "regime.shock_in_nozzle" in codes(validate(definition(eps=6.25, p0=5e5)))


def test_no_driving_pressure_stops_validation():
    f = validate(definition(p0=0.9e5))
    assert codes(f, Severity.ERROR) == {"inlet.no_driving_pressure"}


def test_real_gas_bias_is_flagged_at_high_pressure():
    assert "gas.real_gas_bias" in codes(validate(definition(p0=30e5)), Severity.WARNING)
    assert "gas.real_gas_bias" in codes(validate(definition(p0=5e5, eps=1.5)), Severity.INFO)


def test_condensation_in_vacuum_expansion():
    f = validate(definition(eps=50.0, p0=5e5, pa=0.0, exit_domain=m.TruncatedAtExit()))
    assert "gas.condensation" in codes(f, Severity.WARNING)


def test_turbulence_advice():
    assert "turbulence.laminar_bracket" in codes(validate(definition()))
    big = m.ConicalNozzle(throat_radius=5e-3, expansion_ratio=3.7)
    d = definition(p0=30e5, turbulence=m.Laminar())
    d = m.SimulationDefinition(name="t", geometry=big, boundaries=d.boundaries, flow=d.flow)
    assert "turbulence.likely_turbulent" in codes(validate(d))


def test_mass_flow_inlet_implies_chamber_pressure():
    f = validate(definition(inlet=m.MassFlowInlet(mass_flow=4.8e-3)))
    implied = [x for x in f if x.code == "inlet.implied_p0"]
    assert implied and "bar" in implied[0].message


def test_unknown_solver_is_an_error():
    import dataclasses
    d = definition()
    ok = dataclasses.replace(d, numerics=dataclasses.replace(d.numerics, solver="rhoCentralFoam"))
    assert "numerics.solver" not in codes(validate(ok))
    bad = dataclasses.replace(d, numerics=dataclasses.replace(d.numerics, solver="simpleFoam"))
    assert "numerics.solver" in codes(validate(bad), Severity.ERROR)
