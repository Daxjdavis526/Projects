"""Verification cases: CFD against independent analytical references.

Each case is a simulation definition plus checks. A check compares one
number from the run with a reference computed *without* the CFD (quasi-1D
theory, the Kliegel-Levine throat correlation, the conical divergence
factor) and passes within a stated tolerance. The suite is how a change to
the code proves it has not degraded the physics (DESIGN.md section 5).

What each reference can and cannot judge is stated with the case. In
particular a conical nozzle's exit plane is not one-dimensional, so its
exit Mach number is reported but never checked against quasi-1D theory;
thrust, corrected for divergence, is.
"""

from __future__ import annotations

import json
import math
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Callable

from ..core import model as m
from ..core.gas import NITROGEN
from ..core.theory import discharge, isentropic as isen, nozzle
from ..core.units import ATM


@dataclass
class Check:
    name: str
    value: float | None
    reference: float
    tolerance: float
    relative: bool = True
    passed: bool = False
    note: str = ""

    def evaluate(self) -> "Check":
        if self.value is None or not math.isfinite(self.value):
            self.passed = False
            return self
        err = self.error
        self.passed = abs(err) <= self.tolerance
        return self

    @property
    def error(self) -> float:
        if self.value is None:
            return math.nan
        if self.relative:
            return self.value / self.reference - 1.0
        return self.value - self.reference


@dataclass
class CaseResult:
    case: str
    title: str
    status: str
    trust: str
    checks: list[Check] = field(default_factory=list)
    seconds: float = 0.0
    run_dir: str = ""

    @property
    def passed(self) -> bool:
        return self.status == "completed" and all(c.passed for c in self.checks)


@dataclass(frozen=True)
class Case:
    name: str
    title: str
    definition: Callable[[str, str], m.SimulationDefinition]  # (quality, form) -> definition
    checks: Callable[[dict, m.SimulationDefinition], list[Check]]
    form: str = "wedge"


# ----------------------------------------------------------------------------- V1


# Verification runs converge further than a design run needs (half its drift
# tolerance, a fiftieth of its mass imbalance), so the checks measure
# discretisation error rather than an unfinished iteration. Tighter than
# 5e-5 drift sits inside the reservoir inlet's iteration-to-iteration jitter
# on coarse meshes and can never be met.
TIGHT = m.Numerics(convergence=m.ConvergenceCriteria(integral_tolerance=5e-5, mass_imbalance=2e-5))


def _v1_definition(quality: str, form: str = "wedge") -> m.SimulationDefinition:
    return m.SimulationDefinition(
        name="V1 inviscid conical nozzle into vacuum",
        geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=6.25),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=10e5, T0=300.0),
                                ambient=m.Ambient(pressure=0.0),
                                exit_domain=m.TruncatedAtExit()),
        flow=m.Flow(turbulence=m.Inviscid()),
        mesh=m.MeshSpec(form=m.MeshForm(form), quality=m.MeshQuality(quality)),
        numerics=TIGHT,
    )


def _common_checks(metrics: dict) -> list[Check]:
    return [
        Check("mass conservation, inlet vs exit", metrics["mass_flow"]["imbalance_inlet_exit"],
              0.0, 1e-4, relative=False),
        # The exit-plane momentum flux is integrated with linearly interpolated
        # U, the solver's own convective flux is upwinded: they differ by
        # O(dx) where gradients are steep (a sonic exit plane most of all).
        Check("thrust: exit plane vs wall + feed", metrics["thrust"]["control_volume_disagreement"],
              0.0, 5e-3, relative=False),
    ]


def _v1_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    g = defn.geometry
    gas = NITROGEN
    kl = discharge.kliegel_levine(gas.gamma, g.throat_rc_upstream)
    lam = discharge.conical_divergence_factor(g.diverging_half_angle)
    At = math.pi * g.throat_radius**2
    Ae = At * g.expansion_ratio
    ideal = nozzle.analyse(gas, 10e5, 300.0, 0.0, At, Ae)
    f_ref = kl * lam * ideal.momentum_thrust + ideal.exit_pressure * Ae
    return [
        Check("discharge coefficient vs Kliegel-Levine", metrics["discharge_coefficient"]["cfd"],
              kl, 2e-3, relative=False, note=f"Rc/Rt = {g.throat_rc_upstream}"),
        Check("vacuum thrust vs 1D x Cd(K-L) x divergence factor", metrics["thrust"]["total"],
              f_ref, 5e-3, note=f"lambda = {lam:.5f} for a {math.degrees(g.diverging_half_angle):g} deg cone"),
    ] + _common_checks(metrics)


# ----------------------------------------------------------------------------- V2


def nparc_area(x: float) -> float:
    """The NPARC Alliance transonic diffuser test nozzle ("CDV"), in inches
    and square inches: inlet area 2.5 at x = 0, throat 1.0 at x = 5, exit 1.5
    at x = 10, every station meeting its neighbours with zero slope."""
    if x <= 5.0:
        return 1.75 - 0.75 * math.cos((0.2 * x - 1.0) * math.pi)
    return 1.25 - 0.25 * math.cos((0.2 * x - 1.0) * math.pi)


def nparc_profile_points(n: int = 200) -> tuple[tuple[float, float], ...]:
    """The NPARC nozzle revolved: r = sqrt(A / pi), in inches."""
    return tuple((10.0 * i / n, math.sqrt(nparc_area(10.0 * i / n) / math.pi)) for i in range(n + 1))


# NPARC's exit-to-stagnation pressure ratio for the case with a normal shock
# in the diverging section; quasi-1D theory puts the shock at x = 7.562 in.
V2_PRESSURE_RATIO = 0.75


def _v2_definition(quality: str, form: str = "wedge") -> m.SimulationDefinition:
    p0 = 2e5
    return m.SimulationDefinition(
        name="V2 NPARC nozzle, normal shock in the diverging section",
        geometry=m.WallProfile(points=nparc_profile_points(), length_unit="in"),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=p0, T0=300.0),
                                ambient=m.Ambient(pressure=V2_PRESSURE_RATIO * p0, temperature=300.0),
                                exit_domain=m.TruncatedAtExit(fixed_pressure=True)),
        flow=m.Flow(turbulence=m.Inviscid()),
        mesh=m.MeshSpec(form=m.MeshForm(form), quality=m.MeshQuality(quality)),
        numerics=TIGHT,
    )


def _v2_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    shock = metrics.get("shock") or {}
    L = shock.get("diverging_length") or math.nan
    x_ref = shock.get("x_quasi_1d", math.nan)

    def offset(key):
        x = shock.get(key)
        return None if x is None else (x - x_ref) / L

    kl = discharge.kliegel_levine(NITROGEN.gamma, defn.geometry.profile().rc_over_rt)
    return [
        Check("shock position on the axis vs quasi-1D (fraction of diverging length)",
              offset("x_centreline"), 0.0, 2e-2, relative=False,
              note=f"quasi-1D shock Mach {metrics['regime']['shock_mach']:.3f}"),
        Check("shock position at the wall vs quasi-1D (fraction of diverging length)",
              offset("x_wall"), 0.0, 2e-2, relative=False),
        Check("choked discharge coefficient vs Kliegel-Levine", metrics["discharge_coefficient"]["cfd"],
              kl, 2e-3, relative=False),
    ] + _common_checks(metrics)


# ----------------------------------------------------------------------------- V4


# An inviscid subsonic jet never becomes strictly steady: nothing damps its
# shear layer, and being subsonic it feeds back to the exit plane, where the
# mass flow oscillates by ~2e-4. It runs to design-level convergence.
DESIGN_LEVEL = m.Numerics(convergence=m.ConvergenceCriteria(integral_tolerance=1e-4,
                                                            mass_imbalance=3e-4))


def _v4_definition(p0: float, name: str, throat_length: float,
                   numerics: m.Numerics = TIGHT) -> Callable[[str, str], m.SimulationDefinition]:
    def build(quality: str, form: str = "wedge") -> m.SimulationDefinition:
        return m.SimulationDefinition(
            name=name,
            geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=1.0,
                                     throat_length=throat_length),
            boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=p0, T0=300.0),
                                    ambient=m.Ambient(pressure=ATM, temperature=300.0),
                                    exit_domain=m.Plume(length=8.0, radius=4.0)),
            flow=m.Flow(turbulence=m.Inviscid()),
            mesh=m.MeshSpec(form=m.MeshForm(form), quality=m.MeshQuality(quality)),
            numerics=numerics,
        )
    return build


def _v4a_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    kl = discharge.kliegel_levine(NITROGEN.gamma, defn.geometry.throat_rc_upstream)
    return [
        Check("choked discharge coefficient vs Kliegel-Levine", metrics["discharge_coefficient"]["cfd"],
              kl, 2e-3, relative=False),
    ] + _common_checks(metrics)


def _v4b_checks(metrics: dict, defn: m.SimulationDefinition) -> list[Check]:
    g = NITROGEN
    At = math.pi * defn.geometry.throat_radius**2
    p0 = defn.boundaries.inlet.p0
    M = isen.mach_from_pressure_ratio(g.gamma, p0 / ATM)
    mdot = isen.mass_flux(g.gamma, g.R, p0, 300.0, M) * At
    common = _common_checks(metrics)
    common[0].tolerance = 3e-4  # time-averaged over the jet's oscillation
    return [
        Check("subsonic mass flow vs isentropic (pe = pa)", metrics["mass_flow"]["inlet"], mdot, 5e-3,
              note=f"exit Mach {M:.3f}; parallel exit flow"),
    ] + common


CASES: dict[str, Case] = {
    "V1": Case("V1", "Inviscid conical CD nozzle into vacuum (throat Cd, vacuum thrust)",
               _v1_definition, _v1_checks),
    "V2": Case("V2", "Inviscid NPARC nozzle with a normal shock in the diverging section",
               _v2_definition, _v2_checks),
    "V4a": Case("V4a", "Inviscid converging nozzle, choked, sea-level plume",
                _v4_definition(5e5, "V4a choked converging nozzle", 0.0), _v4a_checks),
    # A converging nozzle ending at a curved throat keeps contracting past its
    # exit (vena contracta), so its exit plane sits above ambient and its
    # subsonic mass flow is ~6 % below quasi-1D theory -- real physics, found
    # by this case. A straight throat section of two diameters delivers
    # parallel flow, where quasi-1D theory with pe = pa applies.
    "V4b": Case("V4b", "Inviscid converging nozzle with straight throat, subsonic, sea-level plume",
                _v4_definition(1.5e5, "V4b subsonic converging nozzle", 4.0, DESIGN_LEVEL), _v4b_checks),
}


# Comparison cases run_suite builds from other runs.
COMPARISONS = ("V6", "V7")

def run_case(case: Case, quality: str, out: Path, processors: int = 1, form: str | None = None,
             on_event=None, solver: str = "auto") -> tuple[CaseResult, dict | None]:
    import dataclasses

    from ..run import pipeline

    defn = case.definition(quality, form or case.form)
    numerics = defn.numerics
    if processors > 1:
        numerics = dataclasses.replace(numerics, processors=processors)
    if solver != "auto":
        numerics = dataclasses.replace(numerics, solver=solver)
    defn = dataclasses.replace(defn, numerics=numerics)
    t0 = time.time()
    run_dir = out / (f"{case.name}-{form or case.form}-{quality}"
                     + ("" if solver == "auto" else f"-{solver}"))
    result = pipeline.run(defn, run_dir, on_event=on_event, render=False)
    checks = [c.evaluate() for c in case.checks(result.metrics, defn)] if result.metrics else []
    variant = [v for v in ((form if form and form != case.form else None),
                           (solver if solver != "auto" else None)) if v]
    label = case.name + (f" ({', '.join(variant)})" if variant else "")
    title = case.title + "".join(f", {v}" for v in variant)
    return CaseResult(label, title, result.status, result.trust, checks,
                      round(time.time() - t0, 1), str(run_dir)), result.metrics


def _pair(name: str, title: str, a: tuple[CaseResult, dict | None], b: tuple[CaseResult, dict | None],
          label: str, mass_tol: float, thrust_tol: float) -> CaseResult:
    """A comparison case: the second run must agree with the first."""
    (ra, ma), (rb, mb) = a, b
    r = CaseResult(name, title, "completed" if ra.status == rb.status == "completed" else "failed",
                   "trusted" if ra.trust == rb.trust == "trusted" else "not_trustworthy")
    if ma and mb:
        r.checks = [c.evaluate() for c in (
            Check(f"{label} mass flow", mb["mass_flow"]["inlet"], ma["mass_flow"]["inlet"], mass_tol),
            Check(f"{label} thrust", mb["thrust"]["total"], ma["thrust"]["total"], thrust_tol),
        )]
    return r


def run_suite(names: list[str], quality: str, out: Path, processors: int = 1,
              on_event=None) -> list[CaseResult]:
    """Runs each case once. V6 (wedge vs 3D O-grid) and V7 (rhoPimpleFoam vs
    rhoCentralFoam) are comparisons built on V1; V1 runs once whichever of
    them asks for it."""
    out.mkdir(parents=True, exist_ok=True)
    results: list[CaseResult] = []
    runs: dict[tuple[str, str, str], tuple[CaseResult, dict | None]] = {}

    def once(case: str, form: str = "wedge", solver: str = "auto"):
        key = (case, form, solver)
        if key not in runs:
            runs[key] = run_case(CASES[case], quality, out, processors, form, on_event, solver)
            results.append(runs[key][0])
        return runs[key]

    for name in names:
        if name == "V6":
            # The 3D O-grid shares the wedge's axial and wall-normal
            # distribution; the two must agree with each other.
            results.append(_pair("V6", "Wedge vs 3D O-grid on the V1 nozzle", once("V1"),
                                 once("V1", "o_grid_3d"), "3D vs wedge:", 2e-3, 3e-3))
        elif name == "V7":
            # Two independent discretisations of the same equations: a
            # pressure-based PIMPLE solver and a density-based central-upwind
            # (Kurganov-Tadmor) one. Agreement bounds the error neither
            # reference-based check can see in the other.
            results.append(_pair("V7", "rhoPimpleFoam vs rhoCentralFoam on the V1 nozzle", once("V1"),
                                 once("V1", solver="rhoCentralFoam"), "central vs PIMPLE:", 1e-3, 2e-3))
        else:
            once(name)
    (out / "verification.json").write_text(
        json.dumps([asdict(r) | {"passed": r.passed} for r in results], indent=2, default=str) + "\n",
        encoding="utf-8")
    (out / "verification.md").write_text(markdown(results, quality), encoding="utf-8")
    return results


def markdown(results: list[CaseResult], quality: str) -> str:
    lines = [f"Verification results ({quality} meshes)", "",
             "| case | check | CFD | reference | error | tolerance | result |",
             "|---|---|---|---|---|---|---|"]
    for r in results:
        if not r.checks:
            lines.append(f"| {r.case} | run {r.status} ({r.trust}) | | | | | **FAIL** |")
        for c in r.checks:
            err = f"{100 * c.error:+.3f} %" if c.relative else f"{c.error:+.2e}"
            tol = f"{100 * c.tolerance:.2g} %" if c.relative else f"{c.tolerance:.0e}"
            val = "n/a" if c.value is None else f"{c.value:.6g}"
            lines.append(f"| {r.case} | {c.name} | {val} | {c.reference:.6g} | {err} | {tol} | "
                         f"{'pass' if c.passed else '**FAIL**'} |")
    return "\n".join(lines) + "\n"
