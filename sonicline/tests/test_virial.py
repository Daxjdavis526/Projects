"""The virial equation of state: the Python twin of the OpenFOAM extension
against the reference equation of state, its thermodynamic consistency, and
the case it writes. The extension itself runs in V18."""

import math

import pytest

from sonicline.core import model as m
from sonicline.core import pengrobinson, realgas, virial
from sonicline.core.gas import NITROGEN


def test_departures_are_consistent_with_the_volume():
    """h, s and cp are the exact integrals of v(p, T): check by differences."""
    g = virial.for_gas(NITROGEN)
    p, T, dp, dT = 20e5, 250.0, 1.0, 1e-3
    v = lambda p, T: 1.0 / g.density(p, T)  # noqa: E731
    # dh = v dp at constant s, i.e. (dh/dp)_T = v - T (dv/dT)_p
    dvdT = (v(p, T + dT) - v(p, T - dT)) / (2 * dT)
    dhdp = (g.enthalpy(p + dp, T) - g.enthalpy(p - dp, T)) / (2 * dp)
    assert dhdp == pytest.approx(v(p, T) - T * dvdT, rel=1e-6)
    # (ds/dp)_T = -(dv/dT)_p and cp = (dh/dT)_p
    dsdp = (g.entropy(p + dp, T) - g.entropy(p - dp, T)) / (2 * dp)
    assert dsdp == pytest.approx(-dvdT, rel=1e-6)
    cp = (g.enthalpy(p, T + dT) - g.enthalpy(p, T - dT)) / (2 * dT)
    assert cp == pytest.approx(g.cp(p, T), rel=1e-6)
    assert g.Z(1.0, T) == pytest.approx(1.0, abs=1e-8)


@pytest.mark.skipif(not realgas.available(NITROGEN), reason="needs CoolProp")
def test_density_and_choked_flux_match_the_reference_equation():
    import CoolProp.CoolProp as CP

    g = virial.for_gas(NITROGEN)
    for p, T in ((20e5, 300.0), (30e5, 250.0), (2e5, 120.0)):
        assert g.density(p, T) == pytest.approx(CP.PropsSI("Dmass", "P", p, "T", T, "Nitrogen"), rel=2e-4)
    for p0, T0 in ((10e5, 300.0), (20e5, 300.0), (30e5, 300.0), (20e5, 250.0)):
        ours = pengrobinson.choked_mass_flux(g, p0, T0).bias
        ref = realgas.choked_mass_flux(NITROGEN, p0, T0).bias
        assert ours == pytest.approx(ref, abs=2e-4), (p0, T0)


def test_only_nitrogen_has_coefficients():
    from sonicline.core.gas import AIR

    with pytest.raises(ValueError):
        virial.for_gas(AIR)


def test_virial_case_loads_its_library(tmp_path):
    from sonicline.core.validate import resolve_profile, validate
    from sonicline.foam import case as foam_case
    from sonicline.mesh import revolved, sizing

    d = m.SimulationDefinition(
        name="v", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=20e5)),
        flow=m.Flow(turbulence=m.Inviscid()), gas=m.GasSpec(equation_of_state="virial"),
        mesh=m.MeshSpec(form=m.MeshForm.WEDGE, quality=m.MeshQuality.COARSE))
    prof = resolve_profile(d)
    assert "gas.virial" in {f.code for f in validate(d, prof)}
    mesh, meta = revolved.build(prof, sizing.spec_for(d, prof))
    with pytest.raises(ValueError):
        foam_case.build_case(tmp_path / "x", d, prof, mesh, meta)  # no library
    s = foam_case.build_case(tmp_path / "c", d, prof, mesh, meta, real_gas_library="libvirial_test.so")
    thermo = (s.path / "constant/thermophysicalProperties").read_text()
    # Internal-energy form, which rhoCentralFoam needs too.
    assert "virialGas" in thermo and "sensibleInternalEnergy" in thermo
    assert foam_case._loaded_libraries(s.path) == ["libvirial_test.so"]
    # A rewrite (warm start, continuation) keeps it.
    foam_case.write_continuation(s.path, d, meta, s, 100)
    assert foam_case._loaded_libraries(s.path) == ["libvirial_test.so"]
    assert math.isfinite(s.p0_nominal)


def test_auto_is_the_virial_gas_on_either_solver():
    """auto: the virial gas for nitrogen whatever the solver (it runs in
    internal-energy form on rhoCentralFoam too), the perfect gas for a gas
    without virial coefficients."""
    import dataclasses

    from sonicline.core.validate import resolve_profile, validate

    def defn(pa, species="N2"):
        return m.SimulationDefinition(
            name="a", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
            boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=20e5), ambient=m.Ambient(pressure=pa)),
            flow=m.Flow(turbulence=m.Inviscid()), gas=m.GasSpec(species=species, equation_of_state="auto"))
    matched = defn(101325.0)
    assert not matched.gas.real_gas and matched.gas.cfd_model() is None
    assert m.resolve_gas(matched).gas.equation_of_state == "virial"
    shocked = defn(14e5)  # a normal shock stands inside: rhoCentralFoam
    assert m.resolve_gas(shocked).gas.equation_of_state == "virial"
    assert "gas.real_gas_solver" not in {f.code for f in validate(shocked, resolve_profile(shocked))}
    assert m.resolve_gas(defn(101325.0, "air")).gas.equation_of_state == "perfect_gas"
    # Peng-Robinson keeps its limit.
    pr = dataclasses.replace(shocked, gas=m.GasSpec(equation_of_state="peng_robinson"))
    assert "gas.real_gas_solver" in {f.code for f in validate(pr, resolve_profile(pr))}


def test_new_simulations_start_on_auto():
    from sonicline.project.draft import DEFAULT

    assert DEFAULT["gas"]["equation_of_state"] == "auto"


def test_heat_capacity_is_constant_cold_and_temperature_dependent_hot():
    from sonicline.core.gas import HEATED_T0, IdealGasCpT

    def defn(T0, **gas):
        return m.SimulationDefinition(
            name="h", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
            boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=20e5, T0=T0)),
            flow=m.Flow(turbulence=m.Inviscid()), gas=m.GasSpec(**gas))
    cold = m.resolve_gas(defn(300.0))
    assert cold.gas.heat_capacity == "constant" and cold.gas.model().janaf is None
    assert cold.gas.model() == NITROGEN
    hot = m.resolve_gas(defn(800.0))
    g = hot.gas.model()
    assert hot.gas.heat_capacity == "temperature_dependent" and hot.gas.reference_temperature == 800.0
    assert g.janaf is not None and g.cp == pytest.approx(g.cp_at(800.0))
    assert g.cp_at(300.0) == pytest.approx(NITROGEN.cp, rel=3e-3)  # the fit meets the cold value
    assert g.cp_at(800.0) == pytest.approx(1122.1, rel=3e-3)  # CoolProp's ideal-gas cp
    assert isinstance(hot.gas.isentrope_model(), IdealGasCpT)
    assert m.resolve_gas(hot) == hot  # idempotent
    # Stated choices win.
    assert m.resolve_gas(defn(800.0, heat_capacity="constant")).gas.model().janaf is None
    forced = m.resolve_gas(defn(300.0, heat_capacity="temperature_dependent")).gas.model()
    assert forced.janaf is not None
    assert m.resolve_gas(defn(HEATED_T0)).gas.heat_capacity == "constant"


def test_heated_virial_gas_writes_janaf_and_its_twin_uses_cp_of_t(tmp_path):
    from sonicline.core.validate import resolve_profile, validate
    from sonicline.foam import case as foam_case
    from sonicline.mesh import revolved, sizing

    d = m.resolve_gas(m.SimulationDefinition(
        name="hot", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=20e5, T0=700.0)),
        flow=m.Flow(turbulence=m.Inviscid()), gas=m.GasSpec(equation_of_state="auto")))
    assert d.gas.virial and d.gas.heat_capacity == "temperature_dependent"
    findings = {f.code for f in validate(d, resolve_profile(d))}
    assert "gas.heated" in findings and "envelope.T0" not in findings
    prof = resolve_profile(d)
    mesh, meta = revolved.build(prof, sizing.spec_for(d, prof))
    s = foam_case.build_case(tmp_path / "c", d, prof, mesh, meta, real_gas_library="libvirial_test.so")
    thermo = (s.path / "constant/thermophysicalProperties").read_text()
    assert "janaf" in thermo and "virialGas" in thermo and "sensibleInternalEnergy" in thermo
    v = d.gas.cfd_model()
    T, p, dT = 600.0, 10e5, 1e-3
    cp = (v.enthalpy(p, T + dT) - v.enthalpy(p, T - dT)) / (2 * dT)
    assert cp == pytest.approx(v.cp(p, T), rel=1e-6) and v.cp(1.0, T) == pytest.approx(v.gas.cp_at(T))


@pytest.mark.skipif(not realgas.available(NITROGEN), reason="needs CoolProp")
def test_heated_choked_flux_matches_the_reference_equation():
    """Heated nitrogen: cp(T) plus the virial departures against CoolProp's
    full equation of state; constant cp would be far off."""
    from sonicline.core.gas import IdealGasCpT, with_cp_of_temperature

    for p0, T0 in ((20e5, 600.0), (20e5, 800.0)):
        hot = with_cp_of_temperature(NITROGEN, T0)
        ref = realgas.choked_mass_flux(hot, p0, T0).bias
        both = pengrobinson.choked_mass_flux(virial.for_gas(hot), p0, T0).bias
        assert both == pytest.approx(ref, abs=3e-4), (T0, both, ref)
        ideal_cpt = pengrobinson.choked_mass_flux(IdealGasCpT(hot), p0, T0).bias
        assert abs(ideal_cpt - ref) > abs(both - ref)  # the real-gas part matters too
