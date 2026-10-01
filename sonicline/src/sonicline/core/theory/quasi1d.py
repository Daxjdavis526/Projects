"""Quasi-1D flow along a nozzle profile.

Gives Mach, pressure, temperature, density and velocity at any axial
station for the regime :func:`nozzle.analyse` selects, including a normal
shock standing in the divergent section.

Two jobs:
1. the analytical reference curve for axial plots and verification;
2. the solver's initial field. Starting a compressible solver from a
   uniform field puts a 100:1 pressure jump on the inlet face -- an
   impulsive shock-tube start that diverged both rhoCentralFoam and
   rhoPimpleFoam within ten steps in the design spike. Starting from this
   solution converged cleanly.

Overexpanded and underexpanded regimes use the attached supersonic
solution inside the nozzle: quasi-1D theory has nothing to say about
separation or the plume, and the CFD resolves those itself.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from ..gas import PerfectGas
from ..profile import Profile
from . import isentropic as isen
from . import nozzle, shock


@dataclass(frozen=True)
class Station:
    x: float
    area_ratio: float  # A / A_throat
    mach: float
    pressure: float
    temperature: float
    density: float
    velocity: float


@dataclass(frozen=True)
class Quasi1DSolution:
    performance: nozzle.NozzlePerformance
    shock_x: float | None  # axial position of the normal shock, if any
    stations: tuple[Station, ...]


def _state(gas: PerfectGas, p0: float, T0: float, M: float, x: float, ar: float) -> Station:
    g, R = gas.gamma, gas.R
    T = T0 / isen.T0_over_T(g, M)
    p = p0 / isen.p0_over_p(g, M)
    return Station(x, ar, M, p, T, p / (R * T), M * math.sqrt(g * R * T))


def _locate_area(profile: Profile, target_ratio: float, x_lo: float, x_hi: float) -> float:
    """Axial position in [x_lo, x_hi] (divergent, area increasing) where
    A/At equals ``target_ratio``, by bisection."""
    rt2 = profile.throat_radius**2
    lo, hi = x_lo, x_hi
    for _ in range(200):
        mid = 0.5 * (lo + hi)
        if profile.radius(mid) ** 2 / rt2 < target_ratio:
            lo = mid
        else:
            hi = mid
    return 0.5 * (lo + hi)


def solve(
    profile: Profile, gas: PerfectGas, p0: float, T0: float, pa: float, xs: list[float]
) -> Quasi1DSolution:
    """Evaluate the quasi-1D solution at the axial positions ``xs``."""
    perf = nozzle.analyse(gas, p0, T0, pa, profile.throat_area, profile.area(profile.x_exit))
    g = gas.gamma
    rt2 = profile.throat_radius**2
    xt = profile.throat_x

    shock_x = None
    if perf.regime is nozzle.Regime.SHOCK_IN_NOZZLE:
        shock_x = _locate_area(profile, perf.shock_area_ratio, xt, profile.x_exit)
        p0_after = p0 * shock.total_pressure_ratio(g, perf.shock_mach)
        # Downstream of the shock the flow is subsonic-isentropic with a
        # larger sonic reference area: A*_2 = A*_1 p01 / p02.
        astar2_ratio = p0 / p0_after

    if perf.regime is nozzle.Regime.SUBSONIC:
        # Unchoked: A* is a virtual area set by the exit Mach number.
        astar_ratio = (profile.exit_radius**2 / rt2) / isen.area_ratio(g, perf.exit_mach)

    stations = []
    for x in xs:
        ar = profile.radius(x) ** 2 / rt2
        if perf.regime is nozzle.Regime.SUBSONIC:
            M = isen.mach_from_area_ratio(g, max(ar / astar_ratio, 1.0), supersonic=False)
            stations.append(_state(gas, p0, T0, M, x, ar))
        elif x <= xt or ar <= 1.0:
            M = isen.mach_from_area_ratio(g, max(ar, 1.0), supersonic=False) if x < xt else 1.0
            stations.append(_state(gas, p0, T0, M, x, ar))
        elif shock_x is not None and x > shock_x:
            M = isen.mach_from_area_ratio(g, max(ar / astar2_ratio, 1.0), supersonic=False)
            stations.append(_state(gas, p0_after, T0, M, x, ar))
        else:
            M = isen.mach_from_area_ratio(g, ar, supersonic=True)
            stations.append(_state(gas, p0, T0, M, x, ar))
    return Quasi1DSolution(perf, shock_x, tuple(stations))
