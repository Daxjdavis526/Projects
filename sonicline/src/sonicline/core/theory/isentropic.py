"""Quasi-one-dimensional isentropic flow of a calorically perfect gas.

Standard relations (NACA Report 1135; Anderson, *Modern Compressible Flow*).
Every function takes gamma explicitly so the theory can be evaluated with
exactly the gas model the CFD uses.
"""

from __future__ import annotations

import math

from scipy.optimize import brentq

# Mach numbers are bracketed inside [_M_MIN, _M_MAX] when inverting.
_M_MIN = 1e-10
_M_MAX = 100.0


def T0_over_T(gamma: float, M: float) -> float:
    return 1.0 + 0.5 * (gamma - 1.0) * M * M


def p0_over_p(gamma: float, M: float) -> float:
    return T0_over_T(gamma, M) ** (gamma / (gamma - 1.0))


def rho0_over_rho(gamma: float, M: float) -> float:
    return T0_over_T(gamma, M) ** (1.0 / (gamma - 1.0))


def area_ratio(gamma: float, M: float) -> float:
    """A/A* for Mach M."""
    if M <= 0.0:
        return math.inf
    e = (gamma + 1.0) / (2.0 * (gamma - 1.0))
    return (1.0 / M) * ((2.0 / (gamma + 1.0)) * T0_over_T(gamma, M)) ** e


def mach_from_area_ratio(gamma: float, ratio: float, supersonic: bool) -> float:
    """Invert A/A* on the chosen branch. ``ratio`` must be >= 1."""
    if ratio < 1.0:
        raise ValueError(f"A/A* = {ratio} < 1 has no isentropic solution")
    if ratio == 1.0:
        return 1.0
    f = lambda M: area_ratio(gamma, M) - ratio  # noqa: E731
    if supersonic:
        return brentq(f, 1.0, _M_MAX, xtol=1e-14, rtol=1e-14, maxiter=500)
    return brentq(f, _M_MIN, 1.0, xtol=1e-16, rtol=1e-14, maxiter=500)


def mach_from_pressure_ratio(gamma: float, p0_p: float) -> float:
    """Mach number for a stagnation-to-static pressure ratio p0/p >= 1."""
    if p0_p < 1.0:
        raise ValueError(f"p0/p = {p0_p} < 1")
    return math.sqrt(2.0 / (gamma - 1.0) * (p0_p ** ((gamma - 1.0) / gamma) - 1.0))


def gamma_function(gamma: float) -> float:
    """Vandenkerckhove function Gamma = sqrt(g) (2/(g+1))^((g+1)/(2(g-1)))."""
    return math.sqrt(gamma) * (2.0 / (gamma + 1.0)) ** ((gamma + 1.0) / (2.0 * (gamma - 1.0)))


def choked_mass_flow(gamma: float, R: float, p0: float, T0: float, throat_area: float) -> float:
    """Ideal choked mass flow, kg/s."""
    return gamma_function(gamma) * p0 * throat_area / math.sqrt(R * T0)


def mass_flux(gamma: float, R: float, p0: float, T0: float, M: float) -> float:
    """Isentropic mass flux rho*u at Mach M, kg/(m^2 s)."""
    T = T0 / T0_over_T(gamma, M)
    p = p0 / p0_over_p(gamma, M)
    return p / (R * T) * M * math.sqrt(gamma * R * T)


def velocity(gamma: float, R: float, T0: float, M: float) -> float:
    T = T0 / T0_over_T(gamma, M)
    return M * math.sqrt(gamma * R * T)


def exit_velocity(gamma: float, R: float, T0: float, p0: float, pe: float) -> float:
    """Isentropic expansion velocity from (p0, T0) to pe."""
    return math.sqrt(
        2.0 * gamma / (gamma - 1.0) * R * T0 * (1.0 - (pe / p0) ** ((gamma - 1.0) / gamma))
    )


def characteristic_velocity(gamma: float, R: float, T0: float) -> float:
    """c* = sqrt(R T0) / Gamma, m/s."""
    return math.sqrt(R * T0) / gamma_function(gamma)
