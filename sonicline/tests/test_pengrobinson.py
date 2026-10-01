import math

import pytest

from sonicline.core.gas import NITROGEN
from sonicline.core.pengrobinson import PengRobinson, choked_mass_flux

PR = PengRobinson(NITROGEN)


def test_ideal_gas_limit():
    assert PR.Z(1.0, 300.0) == pytest.approx(1.0, abs=1e-8)
    assert PR.enthalpy(1.0, 300.0) == pytest.approx(NITROGEN.cp * 300.0, rel=1e-8)


@pytest.mark.parametrize("p, T", [(20e5, 300.0), (5e5, 150.0), (1e5, 90.0)])
def test_departure_functions_are_thermodynamically_consistent(p, T):
    # dh = T ds + v dp: the enthalpy and entropy OpenFOAM uses must belong to
    # one equation of state, or the isentrope (and the reference) is wrong.
    dp, dT = 1e-4 * p, 1e-4 * T
    dh_dT = (PR.enthalpy(p, T + dT) - PR.enthalpy(p, T - dT)) / (2 * dT)
    ds_dT = (PR.entropy(p, T + dT) - PR.entropy(p, T - dT)) / (2 * dT)
    assert dh_dT == pytest.approx(T * ds_dT, rel=1e-5)
    dh_dp = (PR.enthalpy(p + dp, T) - PR.enthalpy(p - dp, T)) / (2 * dp)
    ds_dp = (PR.entropy(p + dp, T) - PR.entropy(p - dp, T)) / (2 * dp)
    # OpenFOAM's rounded constants (2.078, 2.414, 0.414) cost ~1e-4 here.
    assert dh_dp == pytest.approx(T * ds_dp + 1.0 / PR.density(p, T), rel=2e-3)


def test_choked_flux_bias_exceeds_the_reference_equation_of_state():
    c = choked_mass_flux(PR, 20e5, 300.0)
    assert c.bias == pytest.approx(0.00887, abs=5e-5)
    assert 0.5 < c.throat_pressure / 20e5 < 0.55
    pytest.importorskip("CoolProp")
    from sonicline.core import realgas

    ref = realgas.choked_mass_flux(NITROGEN, 20e5, 300.0).bias
    assert 1.15 < c.bias / ref < 1.35  # Peng-Robinson overshoots by about a quarter
    assert not math.isclose(c.bias, ref, rel_tol=0.1)
