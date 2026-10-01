"""The chamber (stagnation) state a definition implies before any CFD.

A reservoir inlet states p0 outright. A mass-flow inlet states the flow and
leaves p0 to the nozzle: the nominal value here is the ideal (Cd = 1)
inversion of quasi-1D theory, which the solver starts from. The pressure the
CFD actually needs is measured at its inlet afterwards (sonicline.metrics);
a real nozzle's Cd < 1 puts it that fraction higher.
"""

from __future__ import annotations

from .model import definition as d
from .profile import Profile
from .theory import nozzle


def nominal_p0(defn: d.SimulationDefinition, profile: Profile | None) -> float | None:
    """p0 in Pa, or None for a mass-flow inlet whose geometry is not known yet."""
    inlet = defn.boundaries.inlet
    if isinstance(inlet, d.ReservoirInlet):
        return inlet.p0
    if profile is None or not inlet.mass_flow > 0.0:
        return None
    return nozzle.stagnation_pressure_for(defn.gas.model(), inlet.mass_flow, inlet.T0,
                                          defn.boundaries.ambient.pressure, profile.throat_area,
                                          profile.area(profile.x_exit))


def run_p0(defn: d.SimulationDefinition, profile: Profile | None, metrics: dict | None) -> float | None:
    """p0 for presenting a run's results: what the CFD measured at the inlet
    when it measured it (mass-flow inlets), else the nominal value."""
    measured = ((metrics or {}).get("conditions") or {}).get("p0")
    return measured if measured else nominal_p0(defn, profile)
