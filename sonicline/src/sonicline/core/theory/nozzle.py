"""Whole-nozzle quasi-1D analysis: operating regime, exit state and ideal
performance for given reservoir and ambient conditions.

This is the reference every CFD result is compared against, and the source
of the regime classification the validator uses before any mesh is built.

Back-pressure regimes for a converging-diverging nozzle, highest pa first
(Anderson, *Modern Compressible Flow*, ch. 5):

- pa >= p_first            subsonic throughout, not choked
- p_shock_exit < pa < p_first    choked, normal shock inside the divergent section
- p_design < pa <= p_shock_exit  overexpanded: supersonic exit, shocks outside
- pa ~ p_design                  matched
- pa < p_design                  underexpanded

Quasi-1D theory keeps an overexpanded flow attached all the way to the exit.
A real nozzle separates once the wall pressure falls far enough below
ambient; two standard criteria estimate where (see :class:`Separation`).
"""

from __future__ import annotations

import enum
import math
from dataclasses import dataclass

from scipy.optimize import brentq

from ..gas import G0, PerfectGas
from . import isentropic as isen
from . import shock

#: Exit pressure within this fraction of ambient counts as matched.
MATCHED_TOLERANCE = 0.01

#: Summerfield's criterion puts separation where the wall pressure falls to
#: roughly 0.25-0.4 of ambient. The upper value is used so the flag errs
#: towards warning.
SUMMERFIELD_RATIO = 0.4


class Regime(enum.Enum):
    SUBSONIC = "subsonic"
    SHOCK_IN_NOZZLE = "shock_in_nozzle"
    OVEREXPANDED = "overexpanded"
    MATCHED = "matched"
    UNDEREXPANDED = "underexpanded"

    @property
    def choked(self) -> bool:
        return self is not Regime.SUBSONIC


@dataclass(frozen=True)
class CriticalPressures:
    """Back pressures that bound the regimes, Pa."""

    first: float  # unchoked above this (subsonic isentropic exit)
    shock_at_exit: float  # normal shock standing exactly in the exit plane
    design: float  # exit pressure of the shock-free supersonic solution


@dataclass(frozen=True)
class Separation:
    """Flow-separation estimate for an overexpanded nozzle.

    Area ratios are where each criterion places the separation point; None
    means that criterion predicts no separation inside the nozzle.
    """

    summerfield_area_ratio: float | None
    schmucker_area_ratio: float | None

    @property
    def likely(self) -> bool:
        return self.summerfield_area_ratio is not None or self.schmucker_area_ratio is not None


@dataclass(frozen=True)
class NozzlePerformance:
    regime: Regime
    critical: CriticalPressures
    mass_flow: float  # kg/s, ideal (Cd = 1)
    exit_mach: float
    exit_pressure: float
    exit_temperature: float
    exit_velocity: float
    momentum_thrust: float  # N, mdot * ue
    pressure_thrust: float  # N, (pe - pa) * Ae
    shock_area_ratio: float | None  # A/At where a normal shock stands
    shock_mach: float | None  # Mach number just upstream of that shock
    separation: Separation

    @property
    def thrust(self) -> float:
        return self.momentum_thrust + self.pressure_thrust


def critical_pressures(gamma: float, p0: float, eps: float) -> CriticalPressures:
    """Regime boundaries for a nozzle of exit/throat area ratio ``eps``."""
    m_sub = isen.mach_from_area_ratio(gamma, eps, supersonic=False)
    m_sup = isen.mach_from_area_ratio(gamma, eps, supersonic=True)
    design = p0 / isen.p0_over_p(gamma, m_sup)
    return CriticalPressures(
        first=p0 / isen.p0_over_p(gamma, m_sub),
        shock_at_exit=design * shock.pressure_ratio(gamma, m_sup),
        design=design,
    )


def optimum_area_ratio(gamma: float, p0: float, pa: float) -> float:
    """Area ratio that expands exactly to ambient (pe = pa)."""
    return isen.area_ratio(gamma, isen.mach_from_pressure_ratio(gamma, p0 / pa))


def separation_estimate(gamma: float, p0: float, pa: float, exit_mach: float) -> Separation:
    """Where an overexpanded flow separates, by two criteria.

    Summerfield: wall pressure reaches ``SUMMERFIELD_RATIO * pa``.
    Schmucker (1973): p_sep / pa = (1.88 M_sep - 1)^-0.64.
    Both are empirical, fitted to rocket nozzles; they bracket rather than
    predict the separation point, which RANS also predicts poorly.
    """
    if pa <= 0.0:
        return Separation(None, None)
    pe = p0 / isen.p0_over_p(gamma, exit_mach)

    summerfield = None
    target = SUMMERFIELD_RATIO * pa
    if pe < target < p0:
        m = isen.mach_from_pressure_ratio(gamma, p0 / target)
        summerfield = isen.area_ratio(gamma, max(m, 1.0))

    def schmucker_residual(M: float) -> float:
        return (p0 / isen.p0_over_p(gamma, M)) / pa - (1.88 * M - 1.0) ** -0.64

    schmucker = None
    if exit_mach > 1.0 and schmucker_residual(exit_mach) < 0.0:
        if schmucker_residual(1.0) > 0.0:
            m = brentq(schmucker_residual, 1.0, exit_mach, xtol=1e-12)
            schmucker = isen.area_ratio(gamma, m)
        else:  # separated already at the throat by this criterion
            schmucker = 1.0
    return Separation(summerfield, schmucker)


def analyse(
    gas: PerfectGas, p0: float, T0: float, pa: float, throat_area: float, exit_area: float
) -> NozzlePerformance:
    """Ideal quasi-1D performance of a nozzle at the given conditions."""
    if exit_area < throat_area * (1.0 - 1e-12):
        raise ValueError("exit area is smaller than throat area")
    if not (p0 > 0.0 and T0 > 0.0 and pa >= 0.0):
        raise ValueError("need p0 > 0, T0 > 0, pa >= 0")
    g, R = gas.gamma, gas.R
    eps = max(exit_area / throat_area, 1.0)
    crit = critical_pressures(g, p0, eps)
    no_separation = Separation(None, None)

    if pa >= crit.first:
        regime = Regime.SUBSONIC
        pe = min(pa, p0)
        me = isen.mach_from_pressure_ratio(g, p0 / pe)
        mdot = isen.mass_flux(g, R, p0, T0, me) * exit_area
        shock_ar = shock_m = None
        separation = no_separation
    elif pa > crit.shock_at_exit:
        regime = Regime.SHOCK_IN_NOZZLE
        pe = pa
        mdot = isen.choked_mass_flow(g, R, p0, T0, throat_area)
        # Subsonic exit carrying the choked mass flow at pressure pe:
        # Me sqrt(1 + (g-1)/2 Me^2) = Gamma p0 At / (pe Ae sqrt(g)).
        c = isen.gamma_function(g) * p0 * throat_area / (pe * exit_area * math.sqrt(g))
        me = math.sqrt((-1.0 + math.sqrt(1.0 + 2.0 * (g - 1.0) * c * c)) / (g - 1.0))
        recovery = pe * isen.p0_over_p(g, me) / p0
        shock_m = shock.mach_from_total_pressure_ratio(g, recovery)
        shock_ar = isen.area_ratio(g, shock_m)
        # A normal shock this strong in a real nozzle separates the boundary
        # layer; Schmucker applied at the shock Mach says where it starts.
        separation = separation_estimate(g, p0, pa, shock_m)
    else:
        me = isen.mach_from_area_ratio(g, eps, supersonic=True)
        pe = crit.design
        mdot = isen.choked_mass_flow(g, R, p0, T0, throat_area)
        shock_ar = shock_m = None
        if abs(pe - pa) <= MATCHED_TOLERANCE * max(pa, 1e-300):
            regime = Regime.MATCHED
        elif pe < pa:
            regime = Regime.OVEREXPANDED
        else:
            regime = Regime.UNDEREXPANDED
        separation = (
            separation_estimate(g, p0, pa, me) if regime is Regime.OVEREXPANDED else no_separation
        )

    Te = T0 / isen.T0_over_T(g, me)
    ue = me * math.sqrt(g * R * Te)
    return NozzlePerformance(
        regime=regime,
        critical=crit,
        mass_flow=mdot,
        exit_mach=me,
        exit_pressure=pe,
        exit_temperature=Te,
        exit_velocity=ue,
        momentum_thrust=mdot * ue,
        pressure_thrust=(pe - pa) * exit_area,
        shock_area_ratio=shock_ar,
        shock_mach=shock_m,
        separation=separation,
    )


def thrust_coefficient(perf: NozzlePerformance, p0: float, throat_area: float) -> float:
    return perf.thrust / (p0 * throat_area)


def specific_impulse(perf: NozzlePerformance) -> float:
    """Isp in seconds (standard gravity)."""
    return perf.thrust / (perf.mass_flow * G0)
