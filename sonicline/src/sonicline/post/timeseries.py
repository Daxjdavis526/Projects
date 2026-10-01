"""Time histories of a transient run and the numbers read from them.

Every quantity comes from the solver's own per-step integrals (function
objects), full-revolution:

    mdot_in     through the inlet
    mdot_out    net outflow through every other open boundary
    thrust      exit-plane momentum flux plus (p - pa) over the exit
    mass        gas in the domain

Conservation in time is checked exactly, the transient analogue of the
steady inlet-exit balance: the gas the domain gains between the first and
last step equals the time integral of what flowed in minus what flowed out.
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass

import numpy as np

from ..run.convergence import pressure_force_column

SETTLED_DRIFT = 0.01  # thrust drift over the last tenth of the run that counts as settled


@dataclass
class TimeSeries:
    time: np.ndarray
    mdot_in: np.ndarray
    mdot_out: np.ndarray
    thrust: np.ndarray
    mass: np.ndarray | None

    def to_json(self) -> dict:
        return {k: (None if v is None else np.asarray(v).tolist()) for k, v in asdict(self).items()}


def _series(table, column, sign, k, t):
    if table is None or column not in table.values:
        return np.zeros_like(t)
    v = np.asarray(table.values[column], dtype=float)
    if v.ndim > 1:
        v = v[:, 0]
    return sign * k * np.interp(t, table.time, v)


def build(tables: dict, sector: float, ambient_pressure: float, exit_area: float) -> TimeSeries | None:
    inlet = tables.get("mdot_inlet")
    if inlet is None or not len(inlet.time):
        return None
    t = np.asarray(inlet.time, dtype=float)
    mdot_in = _series(inlet, "sum(phi)", -1.0, sector, t)
    mdot_out = np.zeros_like(t)
    for name in ("mdot_outlet", "mdot_ambient", "mdot_lip"):
        mdot_out += _series(tables.get(name), "sum(phi)", 1.0, sector, t)
    mom, pf = tables.get("momentum_exit"), tables.get("pforce_exit")
    thrust = np.zeros_like(t)
    if mom is not None and pf is not None and len(mom.time) and len(pf.time):
        m = np.interp(t, mom.time, np.asarray(mom.values["weightedSum(U)"])[:, 0])
        f = np.interp(t, pf.time, pressure_force_column(pf))
        thrust = sector * (m + f) - ambient_pressure * exit_area
    mass_t = tables.get("domain_mass")
    mass = None
    if mass_t is not None and "volIntegrate(rho)" in mass_t.values:
        mass = _series(mass_t, "volIntegrate(rho)", 1.0, sector, t)
    return TimeSeries(t, mdot_in, mdot_out, thrust, mass)


def metrics(ts: TimeSeries) -> dict:
    """Rise time, overshoot, the settled state and the conservation check."""
    t, F = ts.time, ts.thrust
    end = t[-1]
    last = t >= end - 0.1 * (end - t[0])
    F_end = float(np.mean(F[last]))
    drift = float((np.max(F[last]) - np.min(F[last])) / abs(F_end)) if F_end else math.inf
    out = {"end_time": float(end), "steps": int(len(t)), "thrust_final": F_end,
           "mass_flow_in_final": float(np.mean(ts.mdot_in[last])),
           "mass_flow_out_final": float(np.mean(ts.mdot_out[last])),
           "thrust_peak": float(np.max(F)), "thrust_overshoot": float(np.max(F) / F_end - 1.0) if F_end > 0 else None,
           "thrust_drift_last_tenth": drift, "settled": bool(drift < SETTLED_DRIFT)}
    for frac in (0.1, 0.9):
        above = np.nonzero(F >= frac * F_end)[0] if F_end > 0 else []
        out[f"time_to_{int(frac * 100)}_percent_thrust"] = float(t[above[0]]) if len(above) else None
    if ts.mass is not None and len(t) > 1:
        # Trapezoidal integral of the net inflow against the stored mass.
        net = np.trapezoid(ts.mdot_in - ts.mdot_out, t)
        gained = float(ts.mass[-1] - ts.mass[0])
        scale = max(abs(gained), float(np.trapezoid(np.abs(ts.mdot_in), t)), 1e-300)
        out["mass_gained"] = gained
        out["mass_net_inflow"] = float(net)
        out["conservation_error"] = float((gained - net) / scale)
    return out
