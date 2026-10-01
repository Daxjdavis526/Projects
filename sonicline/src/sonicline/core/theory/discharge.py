"""Inviscid throat discharge coefficient and nozzle divergence losses.

A real throat is not one-dimensional: the sonic line curves upstream towards
the wall, and the mass flow through a throat of given geometric area is
slightly below the quasi-1D value. The deficit depends on the ratio of the
throat's upstream wall radius of curvature to its radius, Rc/Rt.

All three series share the form Cd = 1 - a2/P^2 + a3/P^3 - a4/P^4
(Johnson & Wright, J. Fluids Eng. 130:071202, 2008, Table 4):

- Kliegel & Levine (AIAA J 7(7):1375, 1969): P = 1 + Rc/Rt. Valid down to
  Rc/Rt ~ 0.5 and the one to use.
- Hall (QJMAM 15:487, 1962), as published: P = Rc/Rt. Diverges below ~1.
- Hall, corrected coefficients: P = Rc/Rt.

Spot values for gamma = 1.4: Kliegel-Levine gives 0.98949 at Rc/Rt = 1 and
0.99618 at 2; Cuffel, Back & Massier measured 0.985 against 0.982 (K-L) at
Rc/Rt = 0.625; Hall's 0.9943 at Rc/Rt = 2, gamma = 1.35, matches JPL TR 32-654.
"""

from __future__ import annotations

import math


def _series(P: float, a2: float, a3: float, a4: float) -> float:
    return 1.0 - a2 / P**2 + a3 / P**3 - a4 / P**4


def kliegel_levine(gamma: float, rc_over_rt: float) -> float:
    if rc_over_rt <= 0.0:
        raise ValueError("Rc/Rt must be positive")
    g = gamma
    return _series(
        1.0 + rc_over_rt,
        (g + 1.0) / 96.0,
        (g + 1.0) * (8.0 * g - 27.0) / 2304.0,
        (g + 1.0) * (754.0 * g * g - 757.0 * g + 3633.0) / 276480.0,
    )


def hall(gamma: float, rc_over_rt: float, corrected: bool = False) -> float:
    if rc_over_rt <= 0.0:
        raise ValueError("Rc/Rt must be positive")
    g = gamma
    if corrected:
        a3 = (g + 1.0) * (8.0 * g + 21.0) / 2304.0
        a4 = (g + 1.0) * (754.0 * g * g + 2123.0 * g + 2553.0) / 552960.0
    else:
        a3 = (g + 1.0) * (8.0 * g + 21.0) / 4608.0
        a4 = (g + 1.0) * (754.0 * g * g + 1971.0 * g + 2007.0) / 552960.0
    return _series(rc_over_rt, (g + 1.0) / 96.0, a3, a4)


def conical_divergence_factor(half_angle: float) -> float:
    """lambda = (1 + cos alpha) / 2: the fraction of exit momentum that is
    axial for a conical nozzle of divergence half-angle ``alpha`` (rad)."""
    return 0.5 * (1.0 + math.cos(half_angle))
