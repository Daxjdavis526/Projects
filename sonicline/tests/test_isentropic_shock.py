"""Isentropic and normal-shock relations against NACA Report 1135 tables
(gamma = 1.4) and against the propulsion course's independent module."""

import math

import pytest

from sonicline.core.theory import isentropic as isen
from sonicline.core.theory import shock

G = 1.4


@pytest.mark.parametrize(
    "M, p_p0, T_T0, rho_rho0, A_Astar",
    [
        (0.5, 0.84302, 0.95238, 0.88517, 1.33984),
        (1.0, 0.52828, 0.83333, 0.63394, 1.00000),
        (2.0, 0.12780, 0.55556, 0.23005, 1.68750),
        (3.0, 0.02722, 0.35714, 0.07623, 4.23457),
    ],
)
def test_isentropic_table(M, p_p0, T_T0, rho_rho0, A_Astar):
    assert 1 / isen.p0_over_p(G, M) == pytest.approx(p_p0, abs=6e-6)
    assert 1 / isen.T0_over_T(G, M) == pytest.approx(T_T0, abs=6e-6)
    assert 1 / isen.rho0_over_rho(G, M) == pytest.approx(rho_rho0, abs=6e-6)
    assert isen.area_ratio(G, M) == pytest.approx(A_Astar, abs=6e-6)


@pytest.mark.parametrize(
    "M1, M2, p21, T21, p0ratio",
    [
        (1.5, 0.70109, 2.45833, 1.32022, 0.92979),
        (2.0, 0.57735, 4.50000, 1.68750, 0.72087),
        (3.0, 0.47519, 10.33333, 2.67901, 0.32834),
    ],
)
def test_normal_shock_table(M1, M2, p21, T21, p0ratio):
    assert shock.downstream_mach(G, M1) == pytest.approx(M2, abs=6e-6)
    assert shock.pressure_ratio(G, M1) == pytest.approx(p21, abs=6e-5)
    assert shock.temperature_ratio(G, M1) == pytest.approx(T21, abs=6e-6)
    assert shock.total_pressure_ratio(G, M1) == pytest.approx(p0ratio, abs=6e-6)


@pytest.mark.parametrize("gamma", [1.3, 1.3995, 1.4, 5 / 3])
@pytest.mark.parametrize("M", [0.01, 0.2, 0.7, 0.999, 1.001, 1.5, 3.4, 6.0])
def test_inversions_round_trip(gamma, M):
    ar = isen.area_ratio(gamma, M)
    assert isen.mach_from_area_ratio(gamma, ar, supersonic=M > 1) == pytest.approx(M, rel=1e-10)
    assert isen.mach_from_pressure_ratio(gamma, isen.p0_over_p(gamma, M)) == pytest.approx(M, rel=1e-12)
    if M > 1:
        rec = shock.total_pressure_ratio(gamma, M)
        assert shock.mach_from_total_pressure_ratio(gamma, rec) == pytest.approx(M, rel=1e-9)


def test_area_ratio_below_one_is_rejected():
    with pytest.raises(ValueError):
        isen.mach_from_area_ratio(G, 0.9, supersonic=True)


def test_mass_flux_peaks_at_sonic():
    R, p0, T0 = 296.8, 1e6, 300.0
    peak = isen.mass_flux(G, R, p0, T0, 1.0)
    assert peak * 1.0 == pytest.approx(isen.gamma_function(G) * p0 / math.sqrt(R * T0), rel=1e-12)
    for M in (0.9, 0.99, 1.01, 1.1):
        assert isen.mass_flux(G, R, p0, T0, M) < peak


def test_agrees_with_course_module(rocket):
    for gamma in (1.2, 1.4, 1.67):
        for eps in (1.5, 6.25, 50.0):
            for sup in (False, True):
                assert isen.mach_from_area_ratio(gamma, eps, sup) == pytest.approx(
                    rocket.mach_from_area_ratio(gamma, eps, sup), rel=1e-8)
        for M in (1.5, 3.0):
            assert shock.pressure_ratio(gamma, M) == pytest.approx(rocket.normal_shock_p2_p1(gamma, M))
            assert shock.downstream_mach(gamma, M) == pytest.approx(rocket.normal_shock_M2(gamma, M))
        assert isen.choked_mass_flow(gamma, 296.8, 2e6, 300.0, 3e-6) == pytest.approx(
            rocket.choked_mdot(gamma, 296.8, 300.0, 2e6, 3e-6), rel=1e-12)
        assert isen.exit_velocity(gamma, 296.8, 300.0, 2e6, 1e5) == pytest.approx(
            rocket.exit_velocity(gamma, 296.8, 300.0, 2e6, 1e5), rel=1e-12)
