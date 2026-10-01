import pytest

from sonicline.core import realgas
from sonicline.core.gas import NITROGEN

pytestmark = pytest.mark.skipif(not realgas.available(), reason="CoolProp not installed")

# NIST Webbook compressibility of N2 at 300 K.
NIST_Z = {1e5: 0.99982, 1e6: 0.99840, 3e6: 0.99657, 1e7: 1.00522, 3e7: 1.14296}


@pytest.mark.parametrize("p, z", NIST_Z.items())
def test_compressibility_matches_nist(p, z):
    assert realgas.compressibility(NITROGEN, p, 300.0) == pytest.approx(z, abs=2e-5)


def test_mass_flux_bias_grows_with_pressure():
    low = realgas.choked_mass_flux(NITROGEN, 1e5, 300.0).bias
    one = realgas.choked_mass_flux(NITROGEN, 1e6, 300.0).bias
    ten = realgas.choked_mass_flux(NITROGEN, 1e7, 300.0).bias
    assert abs(low) < 1e-3  # the models agree in the ideal-gas limit
    assert one == pytest.approx(0.0035, abs=0.0005)
    assert ten == pytest.approx(0.033, abs=0.002)


def test_regulator_cooling():
    T = realgas.regulator_outlet_temperature(NITROGEN, 300e5, 300.0, 20e5)
    assert 265.0 < T < 271.0


def test_saturation():
    sat = realgas.saturation_temperature(NITROGEN, 101325.0)
    assert sat.temperature == pytest.approx(77.355, abs=0.01)
    assert not sat.approximate
    below = realgas.saturation_temperature(NITROGEN, 5000.0)
    assert below.approximate and 55.0 < below.temperature < 63.151
