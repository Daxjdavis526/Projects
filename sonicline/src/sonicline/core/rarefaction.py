"""Rarefaction: where the continuum, no-slip model stops holding.

The Knudsen number Kn = lambda / L compares the molecules' mean free path
with the size of the flow. Here lambda is the hard-sphere mean free path
written with the gas's own viscosity (Bird, "Molecular Gas Dynamics and the
Direct Simulation of Gas Flows", 1994, eq. 4.52):

    lambda = 16 mu / (5 rho sqrt(2 pi R T))

and L is the local nozzle diameter (for a planar nozzle, its full height).

The regimes (Schaaf and Chambre 1958, as Bird uses them):

- Kn < 0.001: continuum. The Navier-Stokes equations with no-slip walls,
  which is what SONICLINE solves, hold.
- 0.001 to 0.1: slip flow. Navier-Stokes still holds in the core, but the
  gas slips along the wall and its temperature jumps there. A no-slip wall
  overstates the friction and the heat transfer, by an amount that grows
  with Kn: in fully developed tube flow, first-order slip carries about
  8 Kn more flow at the same pressure drop (8 % at Kn 0.01).
- 0.1 to 10: transition. Navier-Stokes fails; the flow needs a kinetic
  method (DSMC). Continuum CFD is not a prediction there.

So a run warns from Kn 0.01 (a slip error worth knowing about) and is not
trustworthy above 0.1. The check is a global one, against the nozzle's
size; the gradient-length Knudsen number (Boyd et al. 1995), which catches
breakdown inside thin shocks and the far plume, is not evaluated. Thrust is
taken at the exit plane, so the plume's own rarefaction into vacuum does not
enter it.
"""

from __future__ import annotations

import math

import numpy as np

SLIP_WARNING = 0.01
TRANSITION = 0.1
CONTINUUM = 0.001


def mean_free_path(gas, p: float, T: float) -> float:
    """Hard-sphere mean free path, m (Bird eq. 4.52), from the ideal-gas
    density: at the pressures where it matters the gas is ideal."""
    rho = p / (gas.R * T)
    return 16.0 * gas.viscosity(T) / (5.0 * rho * math.sqrt(2.0 * math.pi * gas.R * T))


def knudsen(gas, p: float, T: float, length: float) -> float:
    return mean_free_path(gas, p, T) / length


def regime(kn: float) -> str:
    if kn < CONTINUUM:
        return "continuum"
    if kn < TRANSITION:
        return "slip"
    return "transitional"


def along_nozzle(gas, profiles: dict, profile) -> dict | None:
    """The Knudsen number along the nozzle, from a run's axial profiles
    (centreline and wall static p and T), against the local diameter. The
    wall row is where it matters (slip is a wall effect) and where it is
    largest: the gas there is hotter at nearly the same pressure."""
    worst = None
    at = {}
    for row in ("centreline", "wall"):
        r = profiles.get(row)
        if not r:
            continue
        x, p, T = (np.asarray(r[k], dtype=float) for k in ("x", "p", "T"))
        inside = (x >= profile.x_inlet) & (x <= profile.x_exit) & (p > 0) & (T > 0)
        for xi, pi, Ti in zip(x[inside], p[inside], T[inside]):
            kn = knudsen(gas, pi, Ti, 2.0 * profile.radius(float(xi)))
            if worst is None or kn > worst[0]:
                worst = (kn, float(xi), row)
        if row == "centreline" and inside.any():
            xs = x[inside]
            for name, x_at in (("throat", _throat_x(profile)), ("exit", profile.x_exit)):
                k = int(np.argmin(np.abs(xs - x_at)))
                at[name] = knudsen(gas, p[inside][k], T[inside][k], 2.0 * profile.radius(float(xs[k])))
    if worst is None:
        return None
    return {"max": worst[0], "x_max": worst[1], "where_max": worst[2], "regime": regime(worst[0]),
            "throat": at.get("throat"), "exit": at.get("exit")}


def _throat_x(profile) -> float:
    xs = np.linspace(profile.x_inlet, profile.x_exit, 2001)
    return float(xs[int(np.argmin([profile.radius(float(v)) for v in xs]))])
