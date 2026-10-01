"""Decide whether a steady run has converged, from its function-object output.

Residuals alone are a poor guide for a pressure-based compressible solver:
they commonly plateau a few orders down while the answer is already
steady, and can fall while an integral still drifts. What decides
convergence here is what the engineer reads off the result:

1. monitored integrals -- inlet and exit mass flow, exit-plane thrust --
   steady over the last window of iterations: the means of its two halves
   agree to a relative tolerance (no drift), and the scatter about the mean
   is small (the pseudo-time march can leave harmless iteration-to-iteration
   jitter at a reservoir inlet, which max-minus-min would mistake for drift);
2. mass conservation between inlet and exit;
3. residuals down by a minimum number of orders, or below an absolute
   level. This one is recorded and reported, but it does not block: in a
   domain with a free jet the shear layer of the plume never becomes
   strictly steady and dominates the global residuals, while the nozzle's
   integrals are converged to 1e-6. Unsteadiness inside the nozzle shows up
   in the monitored integrals themselves (as drift or scatter), which do
   block.

This module is a pure function of the tables, so it is tested without
running OpenFOAM.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np

from ..core.model.definition import ConvergenceCriteria
from ..foam.parse import Table

# Residual columns judged; Uz is excluded on wedges (it is the out-of-plane
# component and carries no information there).
RESIDUAL_FIELDS = ("p", "Ux", "Uy", "Uz", "e", "h", "k", "omega")


@dataclass
class Assessment:
    iterations: int
    converged: bool
    integrals_flat: bool
    mass_balanced: bool
    residuals_dropped: bool
    spreads: dict[str, float] = field(default_factory=dict)  # drift between window halves
    noise: dict[str, float] = field(default_factory=dict)  # std / mean over the window
    mass_imbalance: float = math.nan
    residual_drop: dict[str, float] = field(default_factory=dict)
    residual_final: dict[str, float] = field(default_factory=dict)
    reasons: list[str] = field(default_factory=list)
    residual_notes: list[str] = field(default_factory=list)  # reported, not blocking
    # The far plume develops long after the nozzle has converged. It does not
    # affect thrust or mass flow, so it does not block convergence, but images
    # of the plume from such a run must say they are not converged.
    plume_drift: float | None = None


def _drift(values: np.ndarray) -> float:
    """Relative change between the means of the two halves of a window."""
    half = len(values) // 2
    mean = float(np.mean(values))
    if mean == 0.0:
        return math.inf
    return abs(float(np.mean(values[half:]) - np.mean(values[:half]))) / abs(mean)


def _noise(values: np.ndarray) -> float:
    mean = float(np.mean(values))
    return math.inf if mean == 0.0 else float(np.std(values)) / abs(mean)


def exit_thrust_series(momentum: Table, pforce: Table) -> tuple[np.ndarray, np.ndarray]:
    """Per-iteration axial momentum + pressure force on the exit plane
    (uncorrected for ambient and sector), on common times."""
    t = np.intersect1d(momentum.time, pforce.time)
    mi = np.searchsorted(momentum.time, t)
    pi = np.searchsorted(pforce.time, t)
    mom = momentum.values["weightedSum(U)"][mi, 0]
    return t, mom + pressure_force_column(pforce)[pi]


def pressure_force_column(pforce: Table) -> np.ndarray:
    """The axial pressure force per iteration: sum(p |S|) on a flat plane,
    |sum(p S_x)| on an unstructured mesh's cut zone (foam.case)."""
    if "areaIntegrate(p)" in pforce.values:
        return pforce.values["areaIntegrate(p)"]
    return np.abs(pforce.values["areaNormalIntegrate(pAxial)"])


# The solver is stopped when the integrals meet their tolerance and judged
# afterwards at this multiple of it: without the slack, the few iterations it
# runs while stopping can push a borderline window back over the line.
JUDGEMENT_SLACK = 2.0


def judgement_window(minimum: int, n: int) -> int:
    """Iterations over which steadiness is judged: the criteria's window, or
    the last tenth of the run (at most 1000) if that is longer -- the same
    span the reported integrals are averaged over (post.results._final).
    rhoCentralFoam can settle into a slow oscillation, ~0.1 % over ~1000
    iterations; a 200-iteration window that lands on one of its turning
    points looks flat while the reported averages are not (DESIGN.md
    section 11)."""
    return max(minimum, min(1000, n // 10))


def assess(tables: dict[str, Table | None], criteria: ConvergenceCriteria, wedge: bool,
           slack: float = 1.0) -> Assessment:
    """``slack`` multiplies the integral and mass-balance tolerances (1 to
    decide when to stop, JUDGEMENT_SLACK to judge the finished run)."""
    inlet, exit_ = tables.get("mdot_inlet"), tables.get("mdot_exit")
    if inlet is None or exit_ is None or len(inlet.time) < 2:
        return Assessment(0, False, False, False, False, reasons=["no solver output yet"])
    n = len(inlet.time)
    window = judgement_window(criteria.integral_window, n)
    a = Assessment(iterations=int(inlet.time[-1]), converged=False, integrals_flat=False,
                   mass_balanced=False, residuals_dropped=False)

    series = {
        "inlet mass flow": -inlet.values["sum(phi)"],
        "exit mass flow": exit_.values["sum(phi)"],
    }
    mom, pf = tables.get("momentum_exit"), tables.get("pforce_exit")
    if mom is not None and pf is not None:
        series["exit thrust"] = exit_thrust_series(mom, pf)[1]
    if n >= window:
        for name, s in series.items():
            a.spreads[name] = _drift(s[-window:])
            a.noise[name] = _noise(s[-window:])
        # A drift is judged beyond what the scatter alone would produce: the
        # half-window means of pure noise differ by ~ sigma sqrt(4 / window),
        # and a noisy (separated, unsettled) flow must not read as drifting.
        chance = {k: 2.0 * a.noise[k] * math.sqrt(4.0 / window) for k in a.spreads}
        drifting = [k for k, v in a.spreads.items()
                    if v > slack * criteria.integral_tolerance + chance[k]]
        noisy = [k for k, v in a.noise.items() if v > slack * criteria.noise_tolerance]
        a.integrals_flat = not drifting and not noisy
        for k in drifting:
            a.reasons.append(f"{k} still drifting by {a.spreads[k]:.2e} across the last {window} "
                             f"iterations (tolerance {criteria.integral_tolerance:.0e})")
        for k in noisy:
            a.reasons.append(f"{k} scatters by {a.noise[k]:.2e} (std/mean) over the last {window} "
                             f"iterations (tolerance {criteria.noise_tolerance:.0e})")
    else:
        a.reasons.append(f"fewer than {window} iterations")

    outlet = tables.get("mdot_outlet")
    if tables.get("mdot_ambient") is not None and outlet is not None and len(outlet.time) >= window:
        a.plume_drift = _drift(outlet.values["sum(phi)"][-window:])

    tail = min(window, n)
    m_in = float(np.mean(series["inlet mass flow"][-tail:]))
    m_out = float(np.mean(series["exit mass flow"][-tail:]))
    a.mass_imbalance = (m_in - m_out) / m_in if m_in else math.inf
    a.mass_balanced = abs(a.mass_imbalance) <= slack * criteria.mass_imbalance
    if not a.mass_balanced:
        a.reasons.append(f"inlet and exit mass flow differ by {100 * a.mass_imbalance:.3f} %")

    res = tables.get("residuals")
    if res is not None and len(res.time) > 10:
        for f in RESIDUAL_FIELDS:
            col = f"{f}_initial"
            if col not in res.values or (wedge and f == "Uz"):
                continue
            r = res.values[col]
            start = float(np.max(r[: min(20, len(r))]))
            end = float(np.median(r[-min(window, len(r)):]))
            if start > 0 and end > 0:
                a.residual_drop[f] = math.log10(start / end)
                a.residual_final[f] = end
        if a.residual_drop:
            failing = [f for f in a.residual_drop
                       if a.residual_drop[f] < criteria.residual_drop_orders
                       and a.residual_final[f] > criteria.residual_level]
            a.residuals_dropped = not failing
            for f in failing:
                a.residual_notes.append(f"{f} residual fell only {a.residual_drop[f]:.1f} orders and is "
                                 f"still {a.residual_final[f]:.1e} (need {criteria.residual_drop_orders:g} "
                                 f"orders or below {criteria.residual_level:.0e})")
    a.converged = a.integrals_flat and a.mass_balanced
    return a
