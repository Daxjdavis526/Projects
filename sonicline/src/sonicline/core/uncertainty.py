"""Uncertainty budgets for a run's engineering numbers: mass flow, thrust
and specific impulse, each with an expanded (about 95 %) relative
uncertainty and the components that make it up.

Components, combined as a root sum of squares (they are independent):

- **discretisation**: measured on the case by a grid study (the GCI of the
  base mesh, Celik et al. 2008) when there is one; otherwise estimated from
  what the verification suite measured for the same mesh form and preset
  (DESIGN.md section 19 lists the evidence). An estimate says so.
- **iterative**: what the run itself shows -- the inlet-exit mass balance
  for mass flow, the exit-plane against wall-plus-feed disagreement for
  thrust.
- **gas model**: the equation of state and the heat capacity, sized by the
  comparisons against the reference equation of state (V10, V18-V20,
  findings 60, 63).
- **wall treatment**: wall functions at a large y+ misplace wall drag
  (finding 59); the effect on thrust scales with the drag.
- **inputs**: tolerances the user states on chamber pressure, chamber
  temperature and throat diameter (or on a stated mass flow), carried
  through quasi-1D sensitivities computed for this nozzle.

What cannot be bounded from evidence is listed, not given a number: an
inviscid run leaves out the boundary layer altogether; a shock or
separation inside the nozzle has no verification-based bound on thrust.

No OpenFOAM here: the module reads a definition, a profile and a run's
metrics.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

from .model import definition as d
from .profile import Profile
from .theory import nozzle

QUANTITIES = ("mass_flow", "thrust", "specific_impulse")

# Discretisation without a study, relative, by mesh form at the standard
# preset (DESIGN.md section 19):
# - structured (wedge, planar, O-grid): V5's single-mesh shortfall of the
#   throat Cd, 0.25 % for a sharp throat (Rc/Rt 0.625) and 0.06 % for a
#   gentle one (Rc/Rt >= 2); thrust from V1/V6/V7 (within 0.12 %).
# - unstructured: V14 (snappy, -0.06 % / -0.22 %), V17 and the viscous
#   cfMesh runs (within 0.05 %): 0.1 % mass flow, 0.25 % thrust.
STRUCTURED_MDOT_SHARP = 2.5e-3
STRUCTURED_MDOT_GENTLE = 0.6e-3
STRUCTURED_THRUST = 1.5e-3
UNSTRUCTURED_MDOT = 1.0e-3
UNSTRUCTURED_THRUST = 2.5e-3
# One preset coarser roughly doubles the error at V5's orders (1.3-1.6) and
# the presets' cell-size ratio (about 1.4). A grid study of V1 on the coarse
# wedge measured 0.30 % in mass flow where 2x gave 0.21 %, so coarse takes
# 2.8 (DESIGN.md finding 66).
QUALITY_FACTOR = {"coarse": 2.8, "standard": 1.0, "fine": 0.5}
UNSTRUCTURED_QUALITY_FACTOR = {"coarse": 1.0, "standard": 0.7, "fine": 0.5}  # V14/V17 ran coarse

# Wall drag on the mesh, relative to the drag, at the standard preset
# (finding 67): E3 (laminar, Re 1800, drag 26 % of thrust) moved thrust
# +0.29 % coarse to standard and +0.34 % standard to fine while its Cd held
# to 3e-4. The drag is still changing by 1.3 % per preset, not yet
# shrinking, so standard is taken as two such steps from converged. It
# matters where drag is a large part of thrust: low Reynolds numbers.
DRAG_DISCRETISATION = 0.026

# Gas model, relative error in choked mass flux against the reference
# equation of state (findings 60, 63).
VIRIAL_MDOT = {30e5: 2.1e-4, 50e5: 7.3e-4}  # up to the pressure; V18/V19 at 30 bar
CP_T_MDOT = 2.0e-4  # virial or ideal gas with cp(T), 600-1000 K
# Constant cold cp on a heated gas: error grows with chamber temperature
# (finding 63; 20 bar): (T0, error).
CONSTANT_CP_HOT = ((350.0, 0.0), (600.0, 3.9e-3), (800.0, 9.4e-3), (1000.0, 1.44e-2))

# Wall functions, relative error in wall drag against a wall-resolved run
# (finding 59): y+ about 30 -> 6.4 %, about 6 -> 2.4 %; resolved runs 1 %.
WALL_DRAG = ((1.0, 0.01), (6.0, 0.024), (30.0, 0.064))


@dataclass
class Budget:
    quantity: str
    value: float | None
    components: dict[str, float] = field(default_factory=dict)  # relative, expanded
    sources: dict[str, str] = field(default_factory=dict)  # how each was obtained
    unquantified: list[str] = field(default_factory=list)

    @property
    def total(self) -> float:
        return math.sqrt(sum(c * c for c in self.components.values()))

    @property
    def absolute(self) -> float | None:
        return None if self.value is None else abs(self.value) * self.total

    def to_json(self) -> dict:
        return {"value": self.value, "relative": self.total, "absolute": self.absolute,
                "components": dict(self.components), "sources": dict(self.sources),
                "unquantified": list(self.unquantified)}


def _get(metrics: dict, *path):
    for k in path:
        if not isinstance(metrics, dict) or k not in metrics:
            return None
        metrics = metrics[k]
    return metrics


def _interp(points, x: float) -> float:
    if x <= points[0][0]:
        return points[0][1]
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        if x <= x1:
            return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return points[-1][1]


def discretisation_estimate(defn: d.SimulationDefinition, profile: Profile | None,
                            metrics: dict | None = None) -> dict[str, float]:
    """Relative discretisation uncertainty by mesh form and preset, from the
    verification record (no study on this case). A viscous run's metrics add
    the wall drag's share."""
    q = defn.mesh.quality.value
    if defn.mesh.form is d.MeshForm.UNSTRUCTURED:
        f = UNSTRUCTURED_QUALITY_FACTOR[q] / max(defn.mesh.refinement, 1e-9)
        mdot, thrust = UNSTRUCTURED_MDOT * f, UNSTRUCTURED_THRUST * f
    else:
        f = QUALITY_FACTOR[q] / max(defn.mesh.refinement, 1e-9) ** 1.4
        rc = profile.rc_over_rt if profile is not None and profile.rc_over_rt else 1.0
        # log-linear between a sharp (0.625) and a gentle (2) throat
        t = min(max(math.log(rc / 0.625) / math.log(2.0 / 0.625), 0.0), 1.0)
        mdot = f * (STRUCTURED_MDOT_SHARP + t * (STRUCTURED_MDOT_GENTLE - STRUCTURED_MDOT_SHARP))
        thrust = f * STRUCTURED_THRUST
    drag = _get(metrics or {}, "thrust", "wall_viscous_drag")
    total = _get(metrics or {}, "thrust", "total")
    if drag and total and not isinstance(defn.flow.turbulence, d.Inviscid):
        thrust = math.hypot(thrust, QUALITY_FACTOR[q] * DRAG_DISCRETISATION * abs(drag / total))
    return {"mass_flow": mdot, "thrust": thrust, "specific_impulse": math.hypot(mdot, thrust)}


# How a real-gas density error carries into each quantity, from V18 (the
# virial against the perfect gas at 30 bar, same mesh): mass flow +1.030 %,
# thrust +0.026 %, specific impulse -0.994 %. Denser gas leaves slower, and
# thrust barely moves.
EOS_EFFECT = {"mass_flow": 1.0, "thrust": 0.025, "specific_impulse": 1.0}


def gas_model(defn: d.SimulationDefinition, metrics: dict) -> dict[str, tuple[float, str]]:
    """Relative uncertainty of each quantity from the gas model: the
    equation of state and, for a heated gas, the heat capacity."""
    gas = defn.gas
    p0 = _get(metrics, "conditions", "p0") or 0.0
    T0 = _get(metrics, "conditions", "T0") or 300.0
    corr = _get(metrics, "mass_flow", "real_gas_correction")
    if gas.virial:
        eos = VIRIAL_MDOT[30e5] if p0 <= 30e5 else VIRIAL_MDOT[50e5]
        src = "virial gas against the reference equation of state (V18/V19)"
    elif gas.peng_robinson:
        eos = abs(corr) if corr is not None else 2.6e-3
        src = "Peng-Robinson against the reference equation of state (V10)"
    else:
        eos = abs(corr) if corr is not None else 0.0
        src = ("perfect gas: the real-gas correction reported beside the result" if corr is not None
               else "perfect gas, no reference equation available")
    out = {k: (eos * EOS_EFFECT[k], src) for k in QUANTITIES}
    if T0 > 350.0:
        if gas.heat_capacity == "temperature_dependent":
            cp_u, cp_src = CP_T_MDOT, "cp(T) (V20)"
        else:
            cp_u, cp_src = _interp(CONSTANT_CP_HOT, T0), f"constant cp on a {T0:.0f} K gas (finding 63)"
        # No measured split for cp: applied in full to each quantity.
        out = {k: (math.hypot(u, cp_u), f"{s}; {cp_src}") for k, (u, s) in out.items()}
    return out


def wall_treatment(defn: d.SimulationDefinition, metrics: dict) -> tuple[float, str] | None:
    """Relative thrust uncertainty from the wall drag model, or None
    (inviscid)."""
    if isinstance(defn.flow.turbulence, d.Inviscid):
        return None
    drag = _get(metrics, "thrust", "wall_viscous_drag")
    thrust = _get(metrics, "thrust", "total")
    if not drag or not thrust:
        return None
    yp = defn.mesh.first_cell_yplus
    rel = _interp(WALL_DRAG, yp) * abs(drag) / abs(thrust)
    return rel, f"wall drag at target y+ {yp:g} (finding 59), drag {100 * abs(drag / thrust):.2f} % of thrust"


def input_sensitivities(defn: d.SimulationDefinition, profile: Profile, metrics: dict) -> dict[str, dict]:
    """d ln(quantity) / d ln(input), from quasi-1D theory for this nozzle:
    chamber pressure, chamber temperature and throat diameter."""
    gas = defn.gas.model()
    p0 = _get(metrics, "conditions", "p0") or getattr(defn.boundaries.inlet, "p0", None)
    T0 = defn.boundaries.inlet.T0
    pa = defn.boundaries.ambient.pressure
    At, Ae = profile.throat_area, profile.area(profile.x_exit)
    if not p0:
        return {}

    def q(p0_, T0_, At_):
        perf = nozzle.analyse(gas, p0_, T0_, pa, At_, Ae)
        return {"mass_flow": perf.mass_flow, "thrust": perf.thrust,
                "specific_impulse": nozzle.specific_impulse(perf)}

    base = q(p0, T0, At)
    eps = 1e-4
    out = {}
    for name, args in (("p0", (p0 * (1 + eps), T0, At)), ("T0", (p0, T0 * (1 + eps), At)),
                       ("throat_diameter", (p0, T0, At * (1 + eps) ** 2))):
        hi = q(*args)
        out[name] = {k: (math.log(hi[k] / base[k]) / math.log(1 + eps)) if base[k] else 0.0 for k in base}
    return out


def budgets(defn: d.SimulationDefinition, profile: Profile | None, metrics: dict,
            study: dict | None = None) -> dict[str, Budget]:
    """The uncertainty budget of each quantity. ``study`` maps a quantity
    to the base-mesh error a grid study measured on this case (relative)."""
    defn = d.resolve_gas(defn)
    values = {"mass_flow": _get(metrics, "mass_flow", "inlet"),
              "thrust": _get(metrics, "thrust", "total"),
              "specific_impulse": _get(metrics, "specific_impulse", "cfd")}
    out = {k: Budget(k, v) for k, v in values.items()}

    # discretisation
    est = discretisation_estimate(defn, profile, metrics)
    for k, b in out.items():
        if study and study.get(k) is not None:
            b.components["discretisation"] = abs(study[k])
            b.sources["discretisation"] = "grid study on this case (GCI of the base mesh)"
        else:
            b.components["discretisation"] = est[k]
            b.sources["discretisation"] = (f"estimate from verification for a {defn.mesh.form.value} mesh at "
                                           f"the {defn.mesh.quality.value} preset; `sonicline study` measures it")

    # iterative / conservation
    imb = _get(metrics, "mass_flow", "imbalance_inlet_exit")
    cv = _get(metrics, "thrust", "control_volume_disagreement")
    if imb is not None:
        out["mass_flow"].components["iterative"] = abs(imb)
        out["mass_flow"].sources["iterative"] = "inlet-exit mass balance of this run"
    if cv is not None:
        out["thrust"].components["iterative"] = abs(cv)
        out["thrust"].sources["iterative"] = "exit plane against wall plus feed, this run"
    out["specific_impulse"].components["iterative"] = math.hypot(abs(imb or 0.0), abs(cv or 0.0))
    out["specific_impulse"].sources["iterative"] = "mass flow and thrust, combined"

    # gas model
    for k, (u, src) in gas_model(defn, metrics).items():
        out[k].components["gas model"] = u
        out[k].sources["gas model"] = src

    # wall treatment
    wall = wall_treatment(defn, metrics)
    if wall is not None:
        for k in ("thrust", "specific_impulse"):
            out[k].components["wall treatment"] = wall[0]
            out[k].sources["wall treatment"] = wall[1]
    else:
        for k in QUANTITIES:
            out[k].unquantified.append(
                "inviscid run: boundary-layer losses are left out (typically 0.5-1 % in mass flow and "
                "1-3 % in thrust for millimetre throats); run k-omega SST to include them")

    # inputs
    tol = defn.tolerances
    if tol is not None and profile is not None:
        sens = input_sensitivities(defn, profile, metrics)
        stated = {"p0": tol.p0_relative,
                  "T0": (tol.T0 / defn.boundaries.inlet.T0) if tol.T0 else None,
                  "throat_diameter": (tol.throat_diameter / (2.0 * profile.throat_radius))
                  if tol.throat_diameter else None}
        if isinstance(defn.boundaries.inlet, d.MassFlowInlet) and tol.mass_flow_relative:
            # A stated mass flow fixes mdot; thrust follows it.
            for k in QUANTITIES:
                if k != "specific_impulse":
                    out[k].components["input: mass flow"] = tol.mass_flow_relative
                    out[k].sources["input: mass flow"] = "stated tolerance on the mass flow"
        for name, rel in stated.items():
            if not rel or name not in sens:
                continue
            for k in QUANTITIES:
                u = abs(sens[name][k]) * rel
                if u > 1e-7:  # a quantity this input does not move (thrust and T0, Isp and the throat)
                    out[k].components[f"input: {name}"] = u
                    out[k].sources[f"input: {name}"] = (f"stated tolerance {100 * rel:.3g} % x sensitivity "
                                                        f"{sens[name][k]:+.2f} (quasi-1D)")

    # what has no bound
    regime = _get(metrics, "regime") or {}
    if regime.get("shock_area_ratio") or regime.get("separation_expected"):
        out["thrust"].unquantified.append(
            "a shock or separation stands in the nozzle: verification bounds its position (V2, V3), not "
            "its effect on thrust; a grid study measures the discretisation part")
    kn = _get(metrics, "rarefaction", "max")
    if kn is not None and kn > 1e-3 and not isinstance(defn.flow.turbulence, d.Inviscid):
        # Slip lowers wall friction where the gas is rarefied; how much of the
        # drag that is depends on where the shear is, which a local Knudsen
        # number does not say (core.rarefaction).
        for k in ("thrust", "specific_impulse"):
            out[k].unquantified.append(
                f"rarefaction: Knudsen number up to {kn:.2g} near the wall; no-slip walls overstate the "
                "friction there (by about 8 Kn of it in tube flow), so thrust reads low by an amount "
                "not bounded here")
    if isinstance(defn.flow.time, d.Transient):
        for k in QUANTITIES:
            out[k].unquantified.append("transient: the values are the end state's; the budget is for that state")
    return out


def to_json(b: dict[str, Budget]) -> dict:
    return {k: v.to_json() for k, v in b.items()}
