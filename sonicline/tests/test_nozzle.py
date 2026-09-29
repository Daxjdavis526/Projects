"""Whole-nozzle analysis against independently computed reference cases."""

import math

import pytest

from sonicline.core.theory import nozzle
from sonicline.core.theory.nozzle import Regime

# Reference nozzle: N2 (gamma 1.4, R 296.8), p0 = 1 MPa, T0 = 300 K,
# Dt = 2.0 mm, De = 5.0 mm (eps = 6.25). Values from the V&V research
# (DESIGN.md section 5), computed independently of this code.
P0, T0 = 1.0e6, 300.0
AT = math.pi * 1.0e-3**2
AE = math.pi * 2.5e-3**2


def test_reference_case_vacuum(textbook_gas):
    perf = nozzle.analyse(textbook_gas, P0, T0, 0.0, AT, AE)
    assert perf.regime is Regime.UNDEREXPANDED
    assert perf.mass_flow == pytest.approx(7.2090e-3, rel=2e-5)
    assert perf.exit_mach == pytest.approx(3.4114, abs=1e-4)
    assert perf.exit_pressure == pytest.approx(14879.5, rel=1e-4)
    assert perf.exit_temperature == pytest.approx(90.16, abs=0.01)
    assert perf.exit_velocity == pytest.approx(660.28, abs=0.01)
    assert perf.thrust == pytest.approx(5.0521, abs=1e-4)
    assert nozzle.thrust_coefficient(perf, P0, AT) == pytest.approx(1.6081, abs=1e-4)
    assert nozzle.specific_impulse(perf) == pytest.approx(71.46, abs=0.01)


def test_reference_case_sea_level(textbook_gas):
    perf = nozzle.analyse(textbook_gas, P0, T0, 101325.0, AT, AE)
    assert perf.regime is Regime.OVEREXPANDED
    assert perf.thrust == pytest.approx(3.0626, abs=1e-4)
    assert perf.pressure_thrust == pytest.approx(-1.697, abs=1e-3)
    # Both criteria place separation inside: Schmucker near A/At = 3.28.
    assert perf.separation.likely
    assert perf.separation.schmucker_area_ratio == pytest.approx(3.28, abs=0.03)


def test_critical_pressures(textbook_gas):
    crit = nozzle.critical_pressures(textbook_gas.gamma, P0, 6.25)
    assert crit.first == pytest.approx(993.96e3, rel=1e-5)
    assert crit.shock_at_exit == pytest.approx(199.54e3, rel=1e-4)
    assert crit.design == pytest.approx(14879.5, rel=1e-4)


@pytest.mark.parametrize(
    "pb, shock_ar, m1",
    [(400e3, 3.257, 2.724), (600e3, 2.078, 2.240)],
)
def test_shock_position(textbook_gas, pb, shock_ar, m1):
    perf = nozzle.analyse(textbook_gas, P0, T0, pb, AT, AE)
    assert perf.regime is Regime.SHOCK_IN_NOZZLE
    assert perf.shock_area_ratio == pytest.approx(shock_ar, abs=2e-3)
    assert perf.shock_mach == pytest.approx(m1, abs=2e-3)
    assert perf.exit_pressure == pb
    assert perf.exit_mach < 1.0


def test_shock_table_consistency(textbook_gas):
    """Place the shock at A/At = 3, read off pb/p0 = 0.4323 (research table),
    then recover the position from pb."""
    perf = nozzle.analyse(textbook_gas, P0, T0, 0.4323 * P0, AT, AE)
    assert perf.shock_area_ratio == pytest.approx(3.0, abs=2e-3)


def test_regime_sweep_is_monotone(textbook_gas):
    order = [Regime.SUBSONIC, Regime.SHOCK_IN_NOZZLE, Regime.OVEREXPANDED,
             Regime.MATCHED, Regime.UNDEREXPANDED]
    seen = []
    for pb in (999e3, 993e3, 700e3, 250e3, 150e3, 50e3, 14879.5, 5e3, 0.0):
        r = nozzle.analyse(textbook_gas, P0, T0, pb, AT, AE).regime
        if not seen or seen[-1] is not r:
            seen.append(r)
    assert seen == order


def test_subsonic_is_continuous_with_choking(textbook_gas):
    crit = nozzle.critical_pressures(textbook_gas.gamma, P0, 6.25)
    choked = nozzle.analyse(textbook_gas, P0, T0, crit.first * (1 - 1e-9), AT, AE).mass_flow
    unchoked = nozzle.analyse(textbook_gas, P0, T0, crit.first * (1 + 1e-9), AT, AE).mass_flow
    assert unchoked == pytest.approx(choked, rel=1e-6)


def test_converging_only_nozzle(textbook_gas):
    """eps = 1: choked below p* with the exit at sonic conditions."""
    perf = nozzle.analyse(textbook_gas, P0, T0, 101325.0, AT, AT)
    assert perf.regime is Regime.UNDEREXPANDED
    assert perf.exit_mach == pytest.approx(1.0)
    assert perf.exit_pressure == pytest.approx(0.52828 * P0, rel=1e-4)
    sub = nozzle.analyse(textbook_gas, P0, T0, 0.8 * P0, AT, AT)
    assert sub.regime is Regime.SUBSONIC
    assert sub.exit_pressure == 0.8 * P0


@pytest.mark.parametrize("p0_bar, eps", [(15, 2.421), (20, 2.877), (30, 3.696)])
def test_sea_level_optimum_expansion(textbook_gas, p0_bar, eps):
    assert nozzle.optimum_area_ratio(1.4, p0_bar * 1e5, 101325.0) == pytest.approx(eps, abs=2e-3)


def test_cdv_nozzle():
    """NPARC 'CDV' quasi-1D nozzle, eps = 1.5 (grc.nasa.gov/WWW/wind/valid/cdv):
    unchoked at pe/p0 = 0.89, shock at pe/p0 = 0.75, supersonic at 0.16."""
    from sonicline.core.gas import PerfectGas

    air = PerfectGas("air", 28.9647, 1004.9, 1.458e-6, 110.4)
    g = air.gamma
    crit = nozzle.critical_pressures(g, 1.0, 1.5)
    assert crit.first == pytest.approx(0.8805, abs=2e-4)
    assert nozzle.analyse(air, 1.0, 300.0, 0.89, 1.0, 1.5).regime is Regime.SUBSONIC
    shocked = nozzle.analyse(air, 1.0, 300.0, 0.75, 1.0, 1.5)
    assert shocked.shock_mach == pytest.approx(1.612, abs=2e-3)
    assert shocked.shock_area_ratio == pytest.approx(1.260, abs=2e-3)
    assert shocked.exit_mach == pytest.approx(0.502, abs=2e-3)
    sup = nozzle.analyse(air, 1.0, 300.0, 0.16, 1.0, 1.5)
    assert sup.exit_mach == pytest.approx(1.854, abs=2e-3)
    assert crit.design == pytest.approx(0.1602, abs=2e-4)
