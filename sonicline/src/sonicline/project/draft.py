"""A simulation definition being edited: its JSON form, edited field by
field, and everything the editor shows about it -- whether it parses, the
pre-flight findings, and the quasi-1D prediction. No Qt: the desktop UI
binds widgets to dotted paths here, and the tests drive it directly.
"""

from __future__ import annotations

import copy
import json
from dataclasses import dataclass, field
from pathlib import Path

from ..core import model
from ..core.profile import Profile
from ..core.theory import discharge, nozzle
from ..core.validate import Finding, resolve_profile, validate

# What a new simulation starts from: the 20 bar sea-level reference case.
DEFAULT = {
    "name": "New thruster",
    "geometry": {"type": "conical_nozzle", "throat_radius": 1e-3, "expansion_ratio": 2.88},
    "boundaries": {"inlet": {"type": "reservoir_inlet", "p0": 20e5, "T0": 300.0}},
    "mesh": {"form": "wedge", "quality": "standard"},
}


@dataclass
class Prediction:
    regime: str
    mass_flow: float
    mass_flow_cd: float | None
    thrust: float
    isp: float
    exit_mach: float
    exit_pressure: float


@dataclass
class Assessment:
    definition: model.SimulationDefinition | None
    error: str | None
    profile: Profile | None = None
    findings: list[Finding] = field(default_factory=list)
    prediction: Prediction | None = None

    @property
    def runnable(self) -> bool:
        from ..core.validate import has_errors

        return self.definition is not None and not has_errors(self.findings)


class Draft:
    def __init__(self, data: dict | None = None):
        self.data = copy.deepcopy(data if data is not None else DEFAULT)
        # For a CAD definition the editor supplies the profile recovered from
        # the file (geometry analysis runs outside the draft).
        self.cad_profile: Profile | None = None

    @classmethod
    def from_definition(cls, defn: model.SimulationDefinition) -> "Draft":
        return cls(json.loads(model.dumps(defn)))

    def get(self, path: str, default=None):
        node = self.data
        for key in path.split("."):
            if not isinstance(node, dict) or key not in node:
                return default
            node = node[key]
        return node

    def set(self, path: str, value) -> None:
        """Set a field; ``None`` removes it (the model's default applies)."""
        keys = path.split(".")
        node = self.data
        for key in keys[:-1]:
            node = node.setdefault(key, {})
        if value is None:
            node.pop(keys[-1], None)
        else:
            node[keys[-1]] = value

    def replace(self, path: str, value: dict) -> None:
        """Replace a whole tagged sub-object (switching a union member)."""
        self.set(path, None)
        self.set(path, value)

    def assess(self) -> Assessment:
        try:
            defn = model.loads(json.dumps(self.data))
        except model.DefinitionError as e:
            return Assessment(None, str(e))
        profile = resolve_profile(defn) or self.cad_profile
        a = Assessment(defn, None, profile, validate(defn, profile))
        inlet = defn.boundaries.inlet
        if profile is not None and isinstance(inlet, model.ReservoirInlet):
            gas = defn.gas.model()
            perf = nozzle.analyse(gas, inlet.p0, inlet.T0, defn.boundaries.ambient.pressure,
                                  profile.throat_area, profile.area(profile.x_exit))
            rc = profile.rc_over_rt
            cd = (discharge.kliegel_levine(gas.gamma, rc)
                  if rc and profile.planar_width is None else None)
            a.prediction = Prediction(perf.regime.value, perf.mass_flow,
                                      cd * perf.mass_flow if cd else None, perf.thrust,
                                      nozzle.specific_impulse(perf), perf.exit_mach, perf.exit_pressure)
        return a

    def save(self, path: Path) -> None:
        Path(path).write_text(json.dumps(self.data, indent=2) + "\n", encoding="utf-8")
