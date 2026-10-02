"""Arkilic, Schmidt and Breuer's slip-flow channel solution
(core.theory.microchannel): limits it must reduce to."""

import math

import pytest

from sonicline.core.theory import microchannel as mc

R, T, MU = 296.8, 300.0, 1.78e-5
H, W, L = 20e-6, 1e-3, 2e-3


def test_small_pressure_drop_is_incompressible_poiseuille():
    p_o, dp = 1e5, 10.0
    rho = (p_o + dp / 2) / (R * T)
    poiseuille = rho * H**3 * W * dp / (12.0 * MU * L)  # plane Poiseuille, no slip
    assert mc.mass_flow(H, W, L, p_o + dp, p_o, MU, R, T, accommodation=None) == pytest.approx(poiseuille, rel=1e-6)


def test_slip_adds_six_kn_in_the_incompressible_limit():
    # plane Poiseuille with Maxwell slip: Q = Q_noslip (1 + 6 s Kn) (s = 1 at sigma = 1)
    p_o, dp = 1e5, 10.0
    kn = mc.mean_free_path(MU, p_o, R, T) / H
    ratio = mc.mass_flow(H, W, L, p_o + dp, p_o, MU, R, T) / mc.mass_flow(H, W, L, p_o + dp, p_o, MU, R, T, None)
    assert ratio == pytest.approx(1.0 + 6.0 * kn, rel=1e-4)
    # a smoother wall (sigma 0.8) slips more: s = 1.5
    r8 = mc.mass_flow(H, W, L, p_o + dp, p_o, MU, R, T, 0.8) / mc.mass_flow(H, W, L, p_o + dp, p_o, MU, R, T, None)
    assert r8 == pytest.approx(1.0 + 9.0 * kn, rel=1e-4)


def test_mean_free_path_is_maxwells():
    assert mc.mean_free_path(MU, 101325.0, R, T) == pytest.approx(MU / 101325.0 * math.sqrt(math.pi * R * T / 2))


def test_inertia_vanishes_at_small_flow_and_lowers_it_at_large():
    p_o = 1e5
    small = mc.mass_flow_with_inertia(H, W, L, p_o + 10.0, p_o, MU, R, T)
    assert small == pytest.approx(mc.mass_flow(H, W, L, p_o + 10.0, p_o, MU, R, T), rel=1e-5)
    big = mc.mass_flow_with_inertia(H, W, 25 * H, 33e3, 22e3, MU, R, T, None)
    assert big < mc.mass_flow(H, W, 25 * H, 33e3, 22e3, MU, R, T, None)
    assert mc.momentum_factor(0.0) == pytest.approx(1.2) and mc.momentum_factor(0.3) < 1.2
