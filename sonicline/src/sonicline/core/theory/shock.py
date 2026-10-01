"""Normal shock relations for a calorically perfect gas (NACA Report 1135)."""

from __future__ import annotations

import math

from scipy.optimize import brentq


def _check(M1: float) -> None:
    if M1 < 1.0:
        raise ValueError(f"normal shock needs M1 >= 1, got {M1}")


def downstream_mach(gamma: float, M1: float) -> float:
    _check(M1)
    g = gamma
    return math.sqrt((1.0 + 0.5 * (g - 1.0) * M1**2) / (g * M1**2 - 0.5 * (g - 1.0)))


def pressure_ratio(gamma: float, M1: float) -> float:
    """p2/p1."""
    _check(M1)
    return 1.0 + 2.0 * gamma / (gamma + 1.0) * (M1**2 - 1.0)


def density_ratio(gamma: float, M1: float) -> float:
    """rho2/rho1."""
    _check(M1)
    return (gamma + 1.0) * M1**2 / ((gamma - 1.0) * M1**2 + 2.0)


def temperature_ratio(gamma: float, M1: float) -> float:
    """T2/T1."""
    return pressure_ratio(gamma, M1) / density_ratio(gamma, M1)


def total_pressure_ratio(gamma: float, M1: float) -> float:
    """p02/p01, the stagnation pressure recovery across the shock."""
    _check(M1)
    g = gamma
    a = ((g + 1.0) * M1**2 / ((g - 1.0) * M1**2 + 2.0)) ** (g / (g - 1.0))
    b = ((g + 1.0) / (2.0 * g * M1**2 - (g - 1.0))) ** (1.0 / (g - 1.0))
    return a * b


def mach_from_total_pressure_ratio(gamma: float, recovery: float) -> float:
    """Upstream Mach number giving p02/p01 = ``recovery`` (0 < recovery <= 1)."""
    if not 0.0 < recovery <= 1.0:
        raise ValueError(f"p02/p01 must be in (0, 1], got {recovery}")
    if recovery == 1.0:
        return 1.0
    return brentq(
        lambda M: total_pressure_ratio(gamma, M) - recovery, 1.0, 100.0, xtol=1e-14, rtol=1e-14
    )
