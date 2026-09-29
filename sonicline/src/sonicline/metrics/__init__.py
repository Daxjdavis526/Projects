"""Propulsion metrics and the trust verdict.

Everything the engineer would otherwise extract by hand, computed from the
solver's integrals and compared with quasi-1D theory, plus the verdict that
decides whether the numbers may be presented as a result at all.
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field

from ..core import realgas
from ..core.gas import G0
from ..core.model import definition as d
from ..core.profile import Profile
from ..core.theory import discharge, nozzle
from ..foam.case import CaseSummary
from ..post.results import Integrals


def propulsion(defn: d.SimulationDefinition, profile: Profile, summary: CaseSummary,
               it: Integrals) -> dict:
    gas = defn.gas.model()
    p0, T0 = defn.boundaries.inlet.p0, defn.boundaries.inlet.T0
    pa = defn.boundaries.ambient.pressure
    At, Ae = summary.throat_area, summary.exit_area
    ideal = nozzle.analyse(gas, p0, T0, pa, At, Ae)

    # Thrust from the exit plane: momentum flux plus pressure relative to ambient.
    momentum = it.exit_momentum
    pressure = it.exit_pressure_force - pa * Ae
    thrust = momentum + pressure
    # The same thrust from the other side of the control volume: the force
    # of the gas on the nozzle wall plus the reaction at the feed (inlet).
    # Agreement between the two is a momentum-conservation check.
    inlet_area = summary.inlet_area
    thrust_wall = -it.wall_force_x - it.inlet_momentum + (it.inlet_pressure_force - pa * inlet_area)

    mdot = it.mdot_inlet
    rc = profile.rc_over_rt
    cd = mdot / ideal.mass_flow
    kl = discharge.kliegel_levine(gas.gamma, rc) if rc else None

    out = {
        "mass_flow": {
            "inlet": mdot, "throat": it.mdot_throat, "exit": it.mdot_exit,
            "outlet": it.mdot_outlet, "entrained": it.mdot_entrained,
            "imbalance_inlet_exit": (mdot - it.mdot_exit) / mdot,
            "imbalance_inlet_throat": (mdot - it.mdot_throat) / mdot,
            "ideal": ideal.mass_flow,
        },
        "discharge_coefficient": {
            "cfd": cd,
            "kliegel_levine": kl,
            "rc_over_rt": rc,
            "cfd_minus_kliegel_levine": (cd - kl) if kl else None,
        },
        "thrust": {
            "total": thrust,
            "momentum": momentum,
            "pressure": pressure,
            "wall_plus_feed": thrust_wall,
            # Normalised by the largest momentum term, not by thrust: in a
            # weak (e.g. subsonic) jet thrust is a small difference of large
            # wall and feed forces.
            "control_volume_disagreement": (thrust_wall - thrust) / max(
                abs(thrust), abs(it.wall_force_x), abs(it.inlet_pressure_force - pa * inlet_area), 1e-300),
            "wall_viscous_drag": it.wall_force_viscous_x,
            "ideal": ideal.thrust,
            "ideal_times_cd": ideal.thrust * cd,
            "cfd_over_ideal": thrust / ideal.thrust,
            "ambient_pressure": pa,
        },
        "specific_impulse": {
            "cfd": thrust / (mdot * G0),
            "ideal": nozzle.specific_impulse(ideal),
        },
        "throat": {
            "mach_area_avg": it.throat_area_avg.get("Ma"),
            "mach_mass_avg": it.throat_mass_avg.get("Ma"),
            "p_area_avg": it.throat_area_avg.get("p"),
            "T_area_avg": it.throat_area_avg.get("T"),
            "area": At,
        },
        "exit": {
            "mach_mass_avg": it.exit_mass_avg.get("Ma"),
            "p_area_avg": it.exit_area_avg.get("p"),
            "T_mass_avg": it.exit_mass_avg.get("T"),
            "velocity_mass_avg": it.exit_mass_avg.get("U"),
            "area": Ae,
            "ideal": {"mach": ideal.exit_mach, "p": ideal.exit_pressure,
                      "T": ideal.exit_temperature, "velocity": ideal.exit_velocity},
        },
        "regime": {
            "quasi_1d": ideal.regime.value,
            "separation_expected": ideal.separation.likely,
        },
        "conditions": {"p0": p0, "T0": T0, "ambient_p": pa,
                       "ambient_T": defn.boundaries.ambient.temperature},
    }
    if realgas.available():
        bias = realgas.choked_mass_flux(gas, p0, T0).bias
        out["mass_flow"]["real_gas_correction"] = bias
        out["mass_flow"]["inlet_real_gas_estimate"] = mdot * (1.0 + bias)
    return out


# ---------------------------------------------------------------------------- verdict


class Trust(enum.Enum):
    TRUSTED = "trusted"
    WARNINGS = "trusted_with_warnings"
    NOT_TRUSTWORTHY = "not_trustworthy"


@dataclass
class Verdict:
    trust: Trust
    reasons: list[str] = field(default_factory=list)  # why not trustworthy
    warnings: list[str] = field(default_factory=list)

    def to_json(self) -> dict:
        return {"trust": self.trust.value, "reasons": self.reasons, "warnings": self.warnings}


# Physical and numerical consistency limits for a trusted result.
THRUST_CV_TOLERANCE = 0.005  # exit-plane vs wall+feed thrust
INVISCID_CD_MARGIN = 0.002  # an inviscid Cd above Kliegel-Levine by more than this is wrong
MAX_WALL_YPLUS = 2.0  # for a wall-resolved (low-Re) mesh
PLUME_DRIFT_WARN = 0.01
STAGNATION_MARGIN = 0.005  # static T above T0 by more than this is a numerical error
VISCOUS_WORK_WARNING = (
    "the solver's energy equation omits viscous work: wall temperatures are not physical "
    "(adiabatic recovery ~40 % instead of ~85-90 %); thrust and mass flow carry an estimated "
    "0.1 % uncertainty from this")


def verdict(defn: d.SimulationDefinition, status: str, mesh_ok: bool, mesh_warnings: list[str],
            convergence, metrics: dict | None, wall_yplus_max: float | None) -> Verdict:
    v = Verdict(Trust.TRUSTED)
    if status != "completed":
        v.reasons.append(f"the solver did not complete ({status})")
    if not mesh_ok:
        v.reasons.append("the mesh failed its quality gates")
    v.warnings += mesh_warnings
    if convergence is not None and not convergence.converged:
        v.reasons.append("not converged: " + "; ".join(convergence.reasons))
    if metrics:
        m = metrics
        cd = m["discharge_coefficient"]["cfd"]
        if cd > 1.0 + INVISCID_CD_MARGIN:
            v.reasons.append(f"discharge coefficient {cd:.4f} exceeds 1: mass is not conserved "
                             "or the throat area is wrong")
        choked = m["regime"]["quasi_1d"] != nozzle.Regime.SUBSONIC.value
        if isinstance(defn.flow.turbulence, d.Inviscid) and choked:
            # The Kliegel-Levine bound is on a choked throat; an unchoked
            # nozzle's Cd is measured against the subsonic isentropic flow.
            kl = m["discharge_coefficient"]["kliegel_levine"]
            if kl and cd > kl + INVISCID_CD_MARGIN:
                v.reasons.append(f"inviscid Cd {cd:.4f} is above the Kliegel-Levine bound {kl:.4f}")
        ext = m.get("extremes", {})
        T0 = defn.boundaries.inlet.T0
        t_max = ext.get("nozzle", {}).get("T_max")
        if t_max is not None and t_max > T0 * (1.0 + STAGNATION_MARGIN):
            v.warnings.append(f"static temperature inside the nozzle reaches {t_max:.1f} K, above the "
                              f"{T0:.1f} K stagnation temperature: a local numerical error (with "
                              "adiabatic walls nothing can heat the gas)")
        clamped = ext.get("cells_at_pressure_floor")
        if clamped:
            v.warnings.append(f"{clamped} cells sit at the solver's pressure floor; the limiter is "
                              "active there and the local solution is not physical")
        cv = m["thrust"]["control_volume_disagreement"]
        if abs(cv) > THRUST_CV_TOLERANCE:
            v.warnings.append(f"exit-plane and wall-force thrust differ by {100 * cv:.2f} %")
        if m["regime"]["separation_expected"]:
            v.warnings.append("flow separation is expected in this nozzle; thrust and separation "
                              "location are sensitive to the turbulence model")
        if m["regime"]["quasi_1d"] == nozzle.Regime.SHOCK_IN_NOZZLE.value:
            v.warnings.append("a shock stands in the nozzle; its position is model-sensitive")
    if convergence is not None and convergence.converged and not convergence.residuals_dropped:
        v.warnings.append("residuals stalled (" + "; ".join(convergence.residual_notes)
                          + "); the monitored integrals are steady")
    if not isinstance(defn.flow.turbulence, d.Inviscid):
        v.warnings.append(VISCOUS_WORK_WARNING)
    plume_drift = getattr(convergence, "plume_drift", None) if convergence is not None else None
    if plume_drift is not None and plume_drift > PLUME_DRIFT_WARN:
        v.warnings.append(f"the far plume is still developing (outlet flow drifting {100 * plume_drift:.1f} % "
                          "per window): thrust and mass flow are converged, plume images are not")
    if (wall_yplus_max is not None and not isinstance(defn.flow.turbulence, d.Inviscid)
            and wall_yplus_max > MAX_WALL_YPLUS):
        v.warnings.append(f"maximum wall y+ is {wall_yplus_max:.1f}; the mesh was meant to resolve "
                          f"the wall (y+ <= {MAX_WALL_YPLUS:g})")
    if v.reasons:
        v.trust = Trust.NOT_TRUSTWORTHY
    elif v.warnings:
        v.trust = Trust.WARNINGS
    return v
