"""Help a steady run converge without changing what it converges to.

Three slow modes defeat SONICLINE's steady settings, which were tuned on
transonic nozzles (DESIGN.md section 23):

1. **A pressure-based run caught in a limit cycle.** rhoPimpleFoam's local
   time step follows the flow speed only. In near-stagnant cells (the
   corner of an inlet contraction, a microchannel's walls) it grows far
   past the viscous and acoustic time scales, and at the nozzles' Courant
   number of 0.5 the inlet of a slow, very viscous channel never settles:
   its mass flow scatters by 1 % for good. The cure is a smaller Courant
   number; it is taken only when a run shows the stall, so every run that
   converges as it is keeps its settings. :func:`stalled` is the test and
   :func:`next_courant` the step.

2. **A pressure-based run that is steady but does not conserve mass.**
   Each iteration solves the pressure equation only to 1 % of its initial
   residual. In a slow channel that leaves a fixed point where inflow and
   outflow stay 0.13 % apart with no drift and no scatter at all: the
   100-height channel sat there for 4000 iterations. Solving the pressure
   to 10^-4 of its residual takes it out within a few hundred. The tighter
   solve costs ~15 % per iteration, so it is taken only when a run shows
   the signature. :func:`unbalanced` is the test.

3. **The chamber of a mass-flow-driven run on rhoCentralFoam.** With the
   inflow fixed, the chamber pressure has to rise or fall until the choked
   throat passes exactly that flow. The explicit density-based solver moves
   at the speed of sound, one acoustic Courant number per iteration, while
   the chamber's gas moves at Mach 0.01: E3a's chamber relaxed with an
   e-folding of ~32 000 iterations and was 0.16 % short after 61 000.
   A choked throat passes a flow proportional to the stagnation pressure,
   so scaling the pressure of the whole nozzle by inflow / throat flow (at
   the same temperature and velocity) does in one step what the march does
   in a hundred thousand. :func:`mass_storage_factor` decides when and by
   how much; ``foam.fields.scale_pressure`` edits the stopped run's fields.

None changes what a converged run converges to: the Courant number sets the
size of a pseudo-time step, the tighter pressure solve removes an error
that the mass-balance check would otherwise have to catch, and the pressure
scaling moves the starting point of the continuation. Each is recorded in
the manifest.
"""

from __future__ import annotations

import math

import numpy as np

from ..core.model.definition import ConvergenceCriteria
from ..foam.parse import Table
from .convergence import judgement_window

# Courant numbers a stalled rhoPimpleFoam run steps down through. 0.2
# settled the standard-mesh microchannel (inlet scatter 9e-3 at 0.5, 3e-7
# at 0.2) and the 100-height one; 0.1 settled both as well, more slowly.
COURANT_LADDER = (0.2, 0.1)


def next_courant(current: float) -> float | None:
    """The next step down: the largest rung at most half the current value."""
    lower = [c for c in COURANT_LADDER if c <= 0.5 * current + 1e-12]
    return max(lower) if lower else None


def _series(tables: dict[str, Table | None]) -> dict[str, np.ndarray]:
    out = {}
    for key, name, sign in (("mdot_inlet", "inlet mass flow", -1.0), ("mdot_exit", "exit mass flow", 1.0)):
        t = tables.get(key)
        if t is not None and "sum(phi)" in t.values:
            out[name] = sign * t.values["sum(phi)"]
    return out


def _noise(v: np.ndarray) -> float:
    m = float(np.mean(v))
    return math.inf if m == 0.0 else float(np.std(v)) / abs(m)


# A stall is judged over windows of at least this many iterations: over
# 200, the start of the V21 channel (and the transient after a step down)
# scattered by 3-6 % without settling yet, and read as a limit cycle.
STALL_WINDOW = 1000


def stalled(tables: dict[str, Table | None], criteria: ConvergenceCriteria, since: int) -> str | None:
    """Why a steady pressure-based run is stuck, or None.

    Stuck means a monitored mass flow scattering beyond the noise tolerance
    over each of the last two windows (a judgement window, at least
    STALL_WINDOW iterations), the later scatter not under
    half the earlier: a limit cycle, not a transient dying away. ``since``
    is the iteration of the last change of settings; the two windows must
    both lie after it."""
    inlet = tables.get("mdot_inlet")
    if inlet is None or not len(inlet.time):
        return None
    n = len(inlet.time)
    window = max(STALL_WINDOW, judgement_window(criteria.integral_window, n))
    after = int(np.searchsorted(inlet.time, since, side="right"))
    if n - after < 2 * window:
        return None
    for name, s in _series(tables).items():
        if len(s) < 2 * window:
            continue
        earlier, later = _noise(s[-2 * window:-window]), _noise(s[-window:])
        if later > criteria.noise_tolerance and later > 0.5 * earlier:
            return (f"{name} scatters by {later:.1e} (std/mean) over the last {window} iterations "
                    f"and by {earlier:.1e} over the {window} before: a limit cycle")
    return None


# The pressure solve, tightened (from foam.case's 0.01).
TIGHT_PRESSURE_REL_TOL = 1e-4


def unbalanced(assessment, flat_since: int | None, criteria: ConvergenceCriteria) -> bool:
    """Whether a run has been steady but short of mass balance for a whole
    judgement window: flat, quiet integrals that will not converge because
    inflow and outflow disagree. ``flat_since`` is the first iteration of
    the current unbroken stretch of that state."""
    if flat_since is None or not assessment.integrals_flat or assessment.mass_balanced:
        return False
    return assessment.iterations - flat_since >= judgement_window(criteria.integral_window,
                                                                  assessment.iterations)


# The chamber correction is judged on the mean of this many iterations, and
# needs the throat flow's own scatter to be well under the correction, or
# the factor would be noise.
CORRECTION_SAMPLE = 200
# At least this many iterations between corrections, and before the first:
# the acoustic transient a correction starts crosses E3a's nozzle in ~300.
CORRECTION_INTERVAL = 1000
MAX_CORRECTIONS = 12


def mass_storage_factor(tables: dict[str, Table | None], criteria: ConvergenceCriteria,
                        since: int) -> float | None:
    """The factor to scale the nozzle's pressure by so the choked throat
    passes the fixed inflow, or None when no correction is due."""
    inlet, throat = tables.get("mdot_inlet"), tables.get("mdot_throat")
    if inlet is None or throat is None or not len(inlet.time) or not len(throat.time):
        return None
    t = np.intersect1d(inlet.time, throat.time)
    t = t[t > since]
    if not len(t) or t[-1] - since < CORRECTION_INTERVAL or len(t) < 2 * CORRECTION_SAMPLE:
        return None
    t = t[-2 * CORRECTION_SAMPLE:]
    m_in = -inlet.values["sum(phi)"][np.searchsorted(inlet.time, t)]
    m_th = throat.values["sum(phi)"][np.searchsorted(throat.time, t)]
    if np.any(m_in <= 0) or np.any(m_th <= 0):
        return None
    earlier, later = m_th[:-CORRECTION_SAMPLE], m_th[-CORRECTION_SAMPLE:]
    factor = float(np.mean(m_in[-CORRECTION_SAMPLE:]) / np.mean(later))
    deficit = abs(factor - 1.0)
    if deficit <= 0.5 * criteria.mass_imbalance:
        return None
    # Only the slow mode is corrected: a throat flow that scatters, or still
    # moves by a tenth of the deficit between two samples (the acoustic
    # transient of a start or of the last correction), would give a factor
    # that overshoots, and the corrections would alternate in sign.
    if _noise(later) > 0.25 * deficit:
        return None
    if abs(float(np.mean(later) - np.mean(earlier))) / float(np.mean(later)) > 0.1 * deficit:
        return None
    return factor
