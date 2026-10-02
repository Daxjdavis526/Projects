"""Propulsion metrics and the trust verdict.

Everything the engineer would otherwise extract by hand, computed from the
solver's integrals and compared with quasi-1D theory, plus the verdict that
decides whether the numbers may be presented as a result at all.
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field

import numpy as np

from ..core import pengrobinson, rarefaction, realgas
from ..core.gas import G0
from ..core.model import definition as d
from ..core.profile import Profile
from ..core.theory import discharge, nozzle
from ..foam.case import CaseSummary
from ..post.results import Integrals


def recovery_factor(profiles: dict, T0: float, x_start: float, x_end: float) -> dict | None:
    """Adiabatic-wall recovery r = (T_wall - T_core) / (T0 - T_core) along the
    diverging section, with the axis temperature standing in for the
    boundary-layer edge."""
    wall, core = profiles.get("wall", {}), profiles.get("centreline", {})
    if not wall.get("T") or not core.get("T"):
        return None
    xc = np.asarray(core["x"])
    Tc = np.asarray(core["T"])
    r = []
    for x, Tw in zip(wall["x"], wall["T"]):
        if x_start < x < x_end:
            t_core = float(np.interp(x, xc, Tc))
            if T0 - t_core > 0.05 * T0:
                r.append((Tw - t_core) / (T0 - t_core))
    if not r:
        return None
    return {"recovery_factor_mean": float(np.mean(r)), "recovery_factor_min": float(np.min(r)),
            "recovery_factor_max": float(np.max(r))}


def shock_front(line: dict, x_start: float, x_end: float) -> float | None:
    """Axial position of the strongest compression between x_start and
    x_end along one row of cells: where the pressure crosses halfway between
    its values at the foot and the head of the steepest rise. A captured
    shock spreads over a few cells; the midpoint locates it to a fraction of
    one."""
    x, p = np.asarray(line.get("x", [])), np.asarray(line.get("p", []))
    keep = (x > x_start) & (x < x_end)
    x, p = x[keep], p[keep]
    if len(x) < 4:
        return None
    dp = np.diff(p) / np.diff(x)
    i = int(np.argmax(dp))
    if dp[i] <= 0.0:
        return None
    lo, hi = i, i
    while lo > 0 and dp[lo - 1] > 0.05 * dp[i]:
        lo -= 1
    while hi < len(dp) - 1 and dp[hi + 1] > 0.05 * dp[i]:
        hi += 1
    mid = 0.5 * (p[lo] + p[hi + 1])
    return float(np.interp(mid, p[lo:hi + 2], x[lo:hi + 2]))


def shock_location(profiles: dict, profile: Profile, shock_area_ratio: float) -> dict:
    """Where the normal shock stands, measured on the axis and along the wall,
    against quasi-1D theory's station of the same area ratio."""
    xt, xe = profile.throat_x, profile.x_exit
    lo, hi = xt, xe
    for _ in range(80):
        mid = 0.5 * (lo + hi)
        if profile.area(mid) / profile.throat_area < shock_area_ratio:
            lo = mid
        else:
            hi = mid
    return {"x_quasi_1d": 0.5 * (lo + hi),
            "x_centreline": shock_front(profiles.get("centreline", {}), xt, xe),
            "x_wall": shock_front(profiles.get("wall", {}), xt, xe),
            "diverging_length": xe - xt}


def nozzle_p0(defn: d.SimulationDefinition, summary: CaseSummary) -> float:
    inlet = defn.boundaries.inlet
    return inlet.p0 if isinstance(inlet, d.ReservoirInlet) else summary.p0_nominal


def inlet_total_pressure(gas, it: Integrals, inlet_area: float) -> float | None:
    """Total pressure at the inlet face: area-averaged static pressure
    raised by the mass-averaged Mach number. The inlet Mach is a few
    hundredths, so how the average is taken changes p0 by parts per million."""
    avg = it.inlet_mass_avg
    if not inlet_area or "T" not in avg or "magSqr(U)" not in avg or not avg["T"]:
        return None
    p = it.inlet_pressure_force / inlet_area
    g = gas.gamma
    m2 = avg["magSqr(U)"] / (g * gas.R * avg["T"])
    return p * (1.0 + 0.5 * (g - 1.0) * m2) ** (g / (g - 1.0))


def propulsion(defn: d.SimulationDefinition, profile: Profile, summary: CaseSummary,
               it: Integrals) -> dict:
    defn = d.resolve_gas(defn)
    gas = defn.gas.model()
    inlet = defn.boundaries.inlet
    T0 = inlet.T0
    pa = defn.boundaries.ambient.pressure
    At, Ae = summary.throat_area, summary.exit_area
    mass_flow_inlet = isinstance(inlet, d.MassFlowInlet)
    p0_cfd = inlet_total_pressure(gas, it, summary.inlet_area)
    # A reservoir inlet states p0; a mass-flow inlet's p0 is what the CFD
    # needed to pass the flow, and the ideal nozzle is judged at that p0.
    p0 = p0_cfd if mass_flow_inlet and p0_cfd else nozzle_p0(defn, summary)
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
    # Cd is measured against the ideal flow of the gas model the CFD runs.
    # For Peng-Robinson that is its own choked flux (core.pengrobinson), so
    # the Kliegel-Levine comparison still isolates the throat's 2D effect.
    # The same holds for the virial gas and for cp(T) (heated gas): their
    # own isentropes, same routine.
    pr = defn.gas.isentrope_model()
    pr_bias = pengrobinson.choked_mass_flux(pr, p0, T0).bias if pr and ideal.regime.choked else 0.0
    cd = mdot / (ideal.mass_flow * (1.0 + pr_bias))
    # Kliegel-Levine is for axisymmetric throats; a planar throat has its own.
    kl = discharge.kliegel_levine(gas.gamma, rc) if rc and profile.planar_width is None else None

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
        "solver": summary.solver,
        "regime": {
            "quasi_1d": ideal.regime.value,
            "shock_area_ratio": ideal.shock_area_ratio,
            "shock_mach": ideal.shock_mach,
            "separation_expected": ideal.separation.likely,
        },
        "conditions": {"p0": p0, "T0": T0, "ambient_p": pa,
                       "ambient_T": defn.boundaries.ambient.temperature,
                       "p0_source": "cfd_inlet" if mass_flow_inlet and p0_cfd else "stated",
                       "p0_inlet_cfd": p0_cfd},
    }
    if mass_flow_inlet:
        out["mass_flow"]["imposed"] = inlet.mass_flow
        out["mass_flow"]["inlet_minus_imposed"] = (mdot - inlet.mass_flow) / inlet.mass_flow
        out["conditions"]["p0_nominal"] = summary.p0_nominal
    # Energy conservation: the flux-weighted total temperature T + |U|^2/2cp
    # carried through the exit must equal what enters. With adiabatic walls
    # nothing adds or removes heat between them.
    # For a real gas the enthalpy departure h_dep(p, T) enters too (about
    # 0.5 % of T0 between a 20 bar chamber and the exit), evaluated at the
    # plane's area-averaged pressure; with cp(T), h(T) is not cp T.
    def total_T(avg, p_plane):
        if "T" not in avg or "magSqr(U)" not in avg:
            return None
        T = avg["T"]
        dep = pr.enthalpy(p_plane, T) - gas.enthalpy(T) if pr is not None and p_plane else 0.0
        return gas.temperature_from_enthalpy(gas.enthalpy(T) + 0.5 * avg["magSqr(U)"] + dep)

    p_inlet = it.inlet_pressure_force / inlet_area if inlet_area else None
    T0_in = total_T(it.inlet_mass_avg, p_inlet)
    T0_exit = total_T(it.exit_mass_avg, it.exit_area_avg.get("p"))
    out["energy"] = {
        "total_temperature_inlet": T0_in,
        "total_temperature_throat": total_T(it.throat_mass_avg, it.throat_area_avg.get("p")),
        "total_temperature_exit": T0_exit,
        "exit_minus_inlet": (T0_exit - T0_in) / T0_in if T0_in and T0_exit else None,
    }
    wall = defn.boundaries.wall_thermal
    if isinstance(wall, d.FixedTemperature):
        # The first law across the nozzle: mdot cp (T0_exit - T0_inlet) = Q.
        q = it.wall_heat
        # (h(T0_exit) - h(T0_inlet)) mdot = Q; for constant cp that is
        # mdot cp (T0_exit - T0_inlet).
        expected = ((gas.temperature_from_enthalpy(gas.enthalpy(T0_in) + q / mdot) - T0_in) / T0_in
                    if q is not None and T0_in else None)
        e = out["energy"]["exit_minus_inlet"]
        out["wall_heat"] = {
            "wall_temperature": wall.temperature,
            "heat_into_gas": q,
            "heat_over_enthalpy_flow": expected,
            "balance_error": (e - expected) if e is not None and expected is not None else None,
        }
    out["gas"] = {"equation_of_state": defn.gas.equation_of_state}
    if pr is not None:
        out["gas"]["cfd_model_choked_flux_bias"] = pr_bias
        if defn.gas.peng_robinson:
            out["gas"]["peng_robinson_choked_flux_bias"] = pr_bias
    if realgas.available(gas):
        bias = realgas.choked_mass_flux(gas, p0, T0).bias
        # From the model the CFD ran to the reference equation of state.
        correction = (1.0 + bias) / (1.0 + pr_bias) - 1.0
        out["mass_flow"]["real_gas_correction"] = correction
        out["mass_flow"]["inlet_real_gas_estimate"] = mdot * (1.0 + correction)
    return out


def condensation(gas, p: np.ndarray, T: np.ndarray, x: np.ndarray, x_exit: float) -> dict | None:
    """Where the expanded gas is colder than nitrogen's saturation
    temperature at its own pressure: supersaturated vapour, which the
    single-phase CFD cannot condense. Checked cell by cell, in the nozzle
    and in the plume. None without CoolProp."""
    if not realgas.available(gas):
        return None
    T_sat, approx = realgas.saturation_temperatures(gas, p)
    margin = T - T_sat
    out = {}
    for name, mask in (("nozzle", x <= x_exit + 1e-12), ("plume", x > x_exit + 1e-12)):
        if not mask.any():
            continue
        m = margin[mask]
        i = int(np.argmin(m))
        cold = m < 0.0
        out[name] = {"cells": int(mask.sum()), "cells_supersaturated": int(cold.sum()),
                     "min_margin": float(m[i]), "x_min_margin": float(x[mask][i]),
                     "p_at_min_margin": float(p[mask][i]), "T_at_min_margin": float(T[mask][i]),
                     "approximate": bool(approx[mask][cold].any()) if cold.any() else False}
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
ENERGY_TOLERANCE = 0.002  # exit vs inlet flux-weighted total temperature, adiabatic walls
STAGNATION_MARGIN = 0.005  # static T above T0 by more than this is a numerical error
# Adiabatic-wall recovery factor: ~Pr^1/2 = 0.83 laminar to ~Pr^1/3 = 0.88
# turbulent for Pr = 0.69, measured against the axis temperature (which only
# approximates the boundary-layer edge in a 2D nozzle), hence a loose band.
RECOVERY_RANGE = (0.75, 0.95)
UNSETTLED_NOISE = 1e-3
MASS_FLOW_IMPOSED_TOLERANCE = 0.002
TRANSIENT_CONSERVATION = 1e-3  # domain mass change vs time-integrated net inflow  # measured inlet flow vs a mass-flow inlet's setting
UNCHOKED_MACH_LIMIT = 1.05  # a sharp throat's local supersonic pocket stays below this  # integral scatter above which a converged run is flagged unsettled


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
    transient = (metrics or {}).get("transient")
    if transient:
        err = transient.get("conservation_error")
        if err is not None and abs(err) > TRANSIENT_CONSERVATION:
            v.reasons.append(f"mass is not conserved in time: the domain gained {transient['mass_gained']:.4g} kg "
                             f"but {transient['mass_net_inflow']:.4g} kg flowed in ({100 * err:+.2f} %)")
        if not transient["settled"]:
            v.warnings.append(
                f"the flow is still developing at the end time (thrust varies "
                f"{100 * transient['thrust_drift_last_tenth']:.1f} % over the last tenth of the run): the "
                "final values are the state at that time, not a steady state, and the steady-state checks "
                "are not applied")
    if metrics and (not transient or transient["settled"]):
        m = metrics
        cd = m["discharge_coefficient"]["cfd"]
        if cd > 1.0 + INVISCID_CD_MARGIN:
            v.reasons.append(f"discharge coefficient {cd:.4f} exceeds 1: mass is not conserved "
                             "or the throat area is wrong")
        choked = m["regime"]["quasi_1d"] != nozzle.Regime.SUBSONIC.value
        # Hazard 7 (DESIGN.md section 6): the choking theory predicted must be
        # the choking the CFD shows.
        mach_max = m.get("extremes", {}).get("nozzle", {}).get("mach_max")
        if mach_max is not None:
            if choked and mach_max < 1.0:
                v.reasons.append(f"theory predicts a choked throat but the flow inside the nozzle "
                                 f"stays subsonic (peak Mach {mach_max:.3f})")
            elif not choked and mach_max > UNCHOKED_MACH_LIMIT:
                v.warnings.append(f"theory predicts subsonic flow but the nozzle reaches Mach "
                                  f"{mach_max:.2f}: the throat may be choked, and subsonic theory's "
                                  "mass flow does not apply")
        if isinstance(defn.flow.turbulence, d.Inviscid) and choked:
            # The Kliegel-Levine bound is on a choked throat; an unchoked
            # nozzle's Cd is measured against the subsonic isentropic flow.
            kl = m["discharge_coefficient"]["kliegel_levine"]
            if kl and cd > kl + INVISCID_CD_MARGIN:
                v.reasons.append(f"inviscid Cd {cd:.4f} is above the Kliegel-Levine bound {kl:.4f}")
        ext = m.get("extremes", {})
        T0 = defn.boundaries.inlet.T0
        t_max = ext.get("nozzle", {}).get("T_max")
        adiabatic = isinstance(defn.boundaries.wall_thermal, d.Adiabatic)
        if adiabatic and t_max is not None and t_max > T0 * (1.0 + STAGNATION_MARGIN):
            v.warnings.append(f"static temperature inside the nozzle reaches {t_max:.1f} K, above the "
                              f"{T0:.1f} K stagnation temperature: a local numerical error (with "
                              "adiabatic walls nothing can heat the gas)")
        clamped = ext.get("cells_at_pressure_floor")
        if clamped:
            v.warnings.append(f"{clamped} cells sit at the solver's pressure floor; the limiter is "
                              "active there and the local solution is not physical")
        energy = m.get("energy", {}).get("exit_minus_inlet")
        if energy is not None and adiabatic and abs(energy) > ENERGY_TOLERANCE:
            v.warnings.append(f"total temperature leaving the nozzle differs from what enters by "
                              f"{100 * energy:+.2f} %: energy is not conserved (adiabatic walls)")
        for region, where in (("nozzle", "inside the nozzle"), ("plume", "in the plume")):
            c = (m.get("condensation") or {}).get(region)
            if c and c["cells_supersaturated"]:
                approx = (" (the saturation line is extrapolated below nitrogen's triple point there)"
                          if c["approximate"] else "")
                v.warnings.append(
                    f"the gas is supersaturated {where}: {c['cells_supersaturated']} cells lie below "
                    f"nitrogen's saturation temperature, by up to {-c['min_margin']:.1f} K at "
                    f"x = {1e3 * c['x_min_margin']:.2f} mm{approx}. The single-phase CFD keeps it a "
                    "vapour; real nitrogen may condense there, and the results beyond that point are "
                    "bounds, not predictions")
        rare = m.get("rarefaction")
        if rare:
            where = f"{rare['where_max']} at x = {1e3 * rare['x_max']:.2f} mm"
            if rare["max"] > rarefaction.TRANSITION:
                v.reasons.append(
                    f"the gas is rarefied: Knudsen number {rare['max']:.3g} ({where}) is in the "
                    "transition regime, where the Navier-Stokes equations fail; continuum CFD is not a "
                    "prediction here (DSMC is)")
            elif rare["max"] > rarefaction.SLIP_WARNING and not isinstance(defn.flow.turbulence, d.Inviscid):
                # (an inviscid run's walls slip already)
                v.warnings.append(
                    f"Knudsen number {rare['max']:.3g} ({where}) is in the slip regime: the gas slips "
                    "along the walls, which the no-slip CFD leaves out, so wall friction and heat "
                    "transfer are overstated and thrust and Cd read somewhat low")
        heat = m.get("wall_heat")
        if heat is not None:
            err = heat.get("balance_error")
            if err is None:
                v.warnings.append("the wall heat flux was not recorded; the energy balance with heat "
                                  "transfer cannot be checked")
            elif abs(err) > ENERGY_TOLERANCE:
                v.warnings.append(f"the gas gains {100 * energy:+.2f} % total temperature but the wall "
                                  f"heat flux accounts for {100 * heat['heat_over_enthalpy_flow']:+.2f} %: "
                                  "energy is not conserved")
        imposed = m.get("mass_flow", {}).get("inlet_minus_imposed")
        if imposed is not None and abs(imposed) > MASS_FLOW_IMPOSED_TOLERANCE:
            v.warnings.append(f"the inlet passes {100 * imposed:+.2f} % more than the imposed mass flow")
        cv = m["thrust"]["control_volume_disagreement"]
        if abs(cv) > THRUST_CV_TOLERANCE:
            v.warnings.append(f"exit-plane and wall-force thrust differ by {100 * cv:.2f} %")
        shocked = m["regime"]["quasi_1d"] == nozzle.Regime.SHOCK_IN_NOZZLE.value
        if (shocked or m["regime"]["separation_expected"]) and m.get("solver") == "rhoPimpleFoam":
            # V2: rhoPimpleFoam puts the NPARC nozzle's normal shock 30 % of
            # the diverging length downstream of where rhoCentralFoam and
            # theory agree it stands (DESIGN.md section 11).
            v.reasons.append("a shock stands inside the nozzle and rhoPimpleFoam misplaces normal "
                             "shocks; run it with rhoCentralFoam (the automatic choice)")
        if not isinstance(defn.flow.turbulence, d.Inviscid):
            # An inviscid shock sits where the jump conditions put it; a
            # boundary layer makes its position depend on the wall model.
            if m["regime"]["separation_expected"]:
                v.warnings.append("flow separation is expected in this nozzle; thrust and separation "
                                  "location are sensitive to the turbulence model")
            if shocked:
                v.warnings.append("a shock stands in the nozzle; its position is model-sensitive")
    if convergence is not None and convergence.converged and convergence.noise:
        worst = max(convergence.noise.values())
        if worst > UNSETTLED_NOISE:
            v.warnings.append(f"the flow does not settle: integrals scatter by {worst:.1e} (std/mean); "
                              "the results are averages over the last iterations of pseudo-time, "
                              "not a steady or a time-accurate solution")
    if (convergence is not None and convergence.converged and not convergence.residuals_dropped
            and convergence.residual_notes):
        v.warnings.append("residuals stalled (" + "; ".join(convergence.residual_notes)
                          + "); the monitored integrals are steady")
    recovery = (metrics or {}).get("wall", {}).get("recovery_factor_mean")
    if (recovery is not None and isinstance(defn.boundaries.wall_thermal, d.Adiabatic)
            and not RECOVERY_RANGE[0] <= recovery <= RECOVERY_RANGE[1]):
        v.warnings.append(f"adiabatic-wall recovery factor {recovery:.2f} is outside the physical "
                          f"range {RECOVERY_RANGE[0]}-{RECOVERY_RANGE[1]} (Pr^1/2 to Pr^1/3 and "
                          "turbulent Prandtl effects): wall temperatures are suspect")
    plume_drift = getattr(convergence, "plume_drift", None) if convergence is not None else None
    if plume_drift is not None and plume_drift > PLUME_DRIFT_WARN:
        v.warnings.append(f"the far plume is still developing (outlet flow drifting {100 * plume_drift:.1f} % "
                          "per window): thrust and mass flow are converged, plume images are not")
    target = defn.mesh.first_cell_yplus
    if wall_yplus_max is not None and not isinstance(defn.flow.turbulence, d.Inviscid):
        if target <= 5.0 and wall_yplus_max > MAX_WALL_YPLUS:
            v.warnings.append(f"maximum wall y+ is {wall_yplus_max:.1f}; the mesh was meant to resolve "
                              f"the wall (y+ <= {MAX_WALL_YPLUS:g})")
        elif target > 5.0 and wall_yplus_max > 10.0 * target:
            # Spalding's law spans the sublayer to the log layer; beyond a few
            # hundred the first cell leaves the boundary layer's inner part.
            v.warnings.append(f"maximum wall y+ is {wall_yplus_max:.0f} against a target of "
                              f"{target:g}: the wall function is being stretched")
    if v.reasons:
        v.trust = Trust.NOT_TRUSTWORTHY
    elif v.warnings:
        v.trust = Trust.WARNINGS
    return v
