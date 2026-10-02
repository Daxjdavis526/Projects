"""Isothermal slip flow in a long two-dimensional channel: Arkilic, Schmidt
and Breuer, "Gaseous slip flow in long microchannels", J. MEMS 6(2), 1997.

For a channel of height H, width W (W >> H) and length L, with the pressure
falling from p_i to p_o along it, the locally fully developed, isothermal
solution with first-order Maxwell slip gives the mass flow

    mdot = H^3 W p_o^2 / (24 mu R T L) * [ (P^2 - 1) + 12 s Kn_o (P - 1) ]

with P = p_i / p_o, s = (2 - sigma) / sigma (sigma the accommodation
coefficient), Kn_o = lambda_o / H at the outlet, and the mean free path
lambda = mu / p sqrt(pi R T / 2) -- the one OpenFOAM's maxwellSlipU uses.
Without the Kn term it is compressible Poiseuille flow. It holds between
any two stations of a fully developed channel, which keeps the CFD's
entrance region out of the comparison.

The solution neglects inertia: it puts the whole pressure drop into wall
friction. Where Re H / L is not small the gas's acceleration along the
channel takes a share. ``inertia=True`` keeps it, in the same locally
fully developed model: the momentum flux beta G u (G = mdot / (H W), u
the mean velocity, beta the profile's momentum-flux factor, 6/5 for the
no-slip parabola and flatter with slip) enters the axial momentum balance,

    integral from p_o to p_i of (p + 6 s Kn_o p_o)(1 - beta G^2 R T / p^2) dp
        = 12 mu R T G L / H^2,

solved for G. (A slowly varying beta is taken out of the derivative.)
"""

from __future__ import annotations

import math


def mean_free_path(mu: float, p: float, R: float, T: float) -> float:
    return mu / p * math.sqrt(math.pi * R * T / 2.0)


def mass_flow(H: float, W: float, L: float, p_i: float, p_o: float, mu: float, R: float, T: float,
              accommodation: float | None = 1.0) -> float:
    """``accommodation=None``: no slip."""
    P = p_i / p_o
    term = P * P - 1.0
    if accommodation is not None:
        s = (2.0 - accommodation) / accommodation
        term += 12.0 * s * mean_free_path(mu, p_o, R, T) / H * (P - 1.0)
    return H**3 * W * p_o * p_o / (24.0 * mu * R * T * L) * term


def momentum_factor(slip_ratio: float) -> float:
    """beta = mean(u^2) / mean(u)^2 for the plane slip profile
    u = A (1 - eta^2) + A a, a = u_slip / A = 4 s Kn (eta across the half
    height): 6/5 without slip."""
    a = slip_ratio
    return (8.0 / 15.0 + 4.0 * a / 3.0 + a * a) / (2.0 / 3.0 + a) ** 2


def mass_flow_with_inertia(H: float, W: float, L: float, p_i: float, p_o: float, mu: float, R: float,
                           T: float, accommodation: float | None = 1.0, n: int = 400) -> float:
    """Arkilic's model with the streamwise momentum flux (module docstring)."""
    s = 0.0 if accommodation is None else (2.0 - accommodation) / accommodation
    kn_o = mean_free_path(mu, p_o, R, T) / H
    dp = (p_i - p_o) / n
    ps = [p_o + (k + 0.5) * dp for k in range(n)]

    def terms(G: float) -> tuple[float, float]:
        visc = sum(p + 6.0 * s * kn_o * p_o for p in ps) * dp
        acc = sum((p + 6.0 * s * kn_o * p_o) * momentum_factor(4.0 * s * kn_o * p_o / p) * R * T / (p * p)
                  for p in ps) * dp
        return visc, acc

    visc, acc = terms(0.0)
    # 12 mu R T L / H^2 G = visc - acc G^2  ->  acc G^2 + c G - visc = 0
    c = 12.0 * mu * R * T * L / H**2
    G = (-c + (c * c + 4.0 * acc * visc) ** 0.5) / (2.0 * acc)
    return G * H * W
