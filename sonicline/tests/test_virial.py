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
    assert "virialGas" in thermo and "sensibleEnthalpy" in thermo
    assert foam_case._loaded_libraries(s.path) == ["libvirial_test.so"]
    # A rewrite (warm start, continuation) keeps it.
    foam_case.write_continuation(s.path, d, meta, s, 100)
    assert foam_case._loaded_libraries(s.path) == ["libvirial_test.so"]
    assert math.isfinite(s.p0_nominal)
