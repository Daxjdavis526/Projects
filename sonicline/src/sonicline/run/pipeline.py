"""The end-to-end pipeline: definition in, verified numbers out.

    validate -> geometry -> mesh -> checkMesh gates -> solve (monitored)
             -> post-process -> metrics -> trust verdict -> manifest

Each stage reports through ``on_event`` so a console or the desktop UI can
show progress. Every run directory is self-describing: the definition, the
generated case, the mesh report, the convergence history, the metrics and
a manifest recording exactly which software produced them.
"""

from __future__ import annotations

import json
import math
import platform
import shutil
import subprocess
import sys
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable

import numpy as np

from .. import __version__
from ..core import model
from ..core.model import definition as d
from ..core.validate import Severity, has_errors, resolve_profile, validate
from ..foam import case as foam_case
from ..foam import parse
from ..mesh import revolved, sizing
from ..metrics import Trust, condensation, propulsion, recovery_factor, shock_location, verdict
from ..post import results
from . import convergence, gates
from .runner import default_runner


@dataclass
class Event:
    stage: str
    message: str
    data: dict = field(default_factory=dict)


# A run is cancelled by creating this file in its run directory: the UI
# (or anyone) can do it from another process on any platform, and the
# pipeline stops the solver, records the run as cancelled and returns.
CANCEL_FILE = "CANCEL"


def request_cancel(run_dir: Path) -> None:
    (Path(run_dir) / CANCEL_FILE).write_text("cancel requested\n", encoding="utf-8")


def _cancelled(run_dir: Path) -> bool:
    return (run_dir / CANCEL_FILE).exists()


@dataclass
class RunResult:
    run_dir: Path
    status: str  # completed | rejected | mesh_failed | diverged | failed | cancelled
    trust: str
    metrics: dict | None
    manifest: dict


def _clean(o):
    """JSON-safe copy: numpy scalars and arrays to Python, non-finite floats
    to null (NaN is not valid JSON)."""
    if isinstance(o, dict):
        return {str(k): _clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [_clean(v) for v in o]
    if isinstance(o, np.ndarray):
        return _clean(o.tolist())
    if isinstance(o, np.generic):
        o = o.item()
    if isinstance(o, float) and not math.isfinite(o):
        return None
    return o


def _write_json(path: Path, data) -> None:
    path.write_text(json.dumps(_clean(data), indent=2, allow_nan=False) + "\n",
                    encoding="utf-8", newline="\n")


def _git_commit() -> str | None:
    try:
        here = Path(__file__).resolve().parent
        out = subprocess.run(["git", "-C", str(here), "rev-parse", "HEAD"], capture_output=True,
                             text=True, timeout=5)
        return out.stdout.strip() or None
    except (OSError, subprocess.SubprocessError):
        return None


def run(defn: d.SimulationDefinition, run_dir: Path, runner=None,
        on_event: Callable[[Event], None] | None = None, poll_seconds: float = 2.0,
        render: bool = True, base_dir: Path | None = None) -> RunResult:
    """Run a definition end to end. ``base_dir`` resolves relative CAD paths
    (normally the directory holding the definition file)."""
    notify = on_event or (lambda e: None)
    run_dir = Path(run_dir)
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / CANCEL_FILE).unlink(missing_ok=True)
    stages: list[dict] = []

    def emit(event: Event) -> None:
        # Every change of stage is recorded in the manifest (DESIGN.md 4.4).
        if not stages or stages[-1]["stage"] != event.stage:
            stages.append({"stage": event.stage, "at": datetime.now(timezone.utc).isoformat()})
        notify(event)

    started = datetime.now(timezone.utc)
    model.save(defn, run_dir / "definition.json")
    manifest: dict = {
        "sonicline_version": __version__,
        "git_commit": _git_commit(),
        "definition_hash": model.definition_hash(defn),
        "started": started.isoformat(),
        "python": sys.version.split()[0],
        "platform": platform.platform(),
        "stages": stages,
    }

    def finish(status: str, trust: str, metrics=None) -> RunResult:
        # Announced first, so the final transition is in the manifest too.
        emit(Event("done", f"{status}; result {trust.replace('_', ' ')}"))
        manifest.update({"status": status, "trust": trust,
                         "finished": datetime.now(timezone.utc).isoformat()})
        _write_json(run_dir / "manifest.json", manifest)
        return RunResult(run_dir, status, trust, metrics, manifest)

    # --- geometry ----------------------------------------------------------------
    profile = resolve_profile(defn)
    if profile is None and isinstance(defn.geometry, d.CadFile):
        from .. import geometry

        cad = Path(defn.geometry.path)
        if not cad.is_absolute():
            cad = (base_dir or Path.cwd()) / cad
        try:
            geometry.check_definition_file(cad, defn.geometry.sha256)
            report = geometry.analyse(cad, defn.geometry.length_unit, defn.geometry.inlet_end)
        except geometry.GeometryError as e:
            emit(Event("geometry", f"ERROR: {e}"))
            manifest["geometry_error"] = str(e)
            return finish("rejected", Trust.NOT_TRUSTWORTHY.value)
        _write_json(run_dir / "geometry_report.json", asdict(report))
        for w in report.warnings:
            emit(Event("geometry", f"warning: {w}"))
        if not report.ok:
            for e in report.errors:
                emit(Event("geometry", f"ERROR: {e}"))
            manifest["geometry_error"] = report.errors
            return finish("rejected", Trust.NOT_TRUSTWORTHY.value)
        if not report.axisymmetric:
            msg = ("the geometry is not a body of revolution; it needs the unstructured (Tier 2) "
                   "mesher, which this build does not have yet")
            emit(Event("geometry", f"ERROR: {msg}"))
            manifest["geometry_error"] = [msg]
            return finish("rejected", Trust.NOT_TRUSTWORTHY.value)
        profile = report.profile()
        manifest["geometry"] = {"file": cad.name, "sha256": defn.geometry.sha256, "kind": report.kind,
                                "inlet_end": report.inlet_end,
                                "inlet_confidence": report.inlet_confidence}
        emit(Event("geometry", f"{cad.name}: revolved fluid volume, throat diameter "
                               f"{2e3 * profile.throat_radius:.3f} mm, expansion ratio "
                               f"{profile.expansion_ratio:.3f} (inlet at the {report.inlet_end} end, "
                               f"{report.inlet_confidence} confidence)"))

    # --- validation ------------------------------------------------------------
    findings = validate(defn, profile)
    manifest["preflight"] = [asdict(f) | {"severity": f.severity.name} for f in findings]
    for f in findings:
        if f.severity >= Severity.WARNING:
            emit(Event("validate", f"{f.severity.name}: {f.message}"))
    if has_errors(findings):
        return finish("rejected", Trust.NOT_TRUSTWORTHY.value)

    runner = runner or default_runner()
    manifest["runner"] = runner.describe()
    emit(Event("setup", f"OpenFOAM: {manifest['runner'].get('openfoam', '?')}"))

    # --- mesh and case -----------------------------------------------------------
    case = run_dir / "case"
    if case.exists():
        shutil.rmtree(case)
    spec = sizing.spec_for(defn, profile)
    extension = None
    if foam_case.needs_viscous_work_extension(defn, profile):
        from ..foam import extensions

        try:
            extension = extensions.ensure_built(runner, run_dir / "extensions")
        except extensions.ExtensionBuildError as e:
            emit(Event("setup", f"ERROR: {e}"))
            manifest["setup_error"] = str(e)
            return finish("failed", Trust.NOT_TRUSTWORTHY.value)
        manifest["extension"] = extension
    t0 = time.time()
    mesh, meta = revolved.build(profile, spec)
    summary = foam_case.build_case(case, defn, profile, mesh, meta, extension)
    (run_dir / "mesh_meta.json").write_text(json.dumps(meta.to_json()) + "\n", encoding="utf-8")
    manifest["mesh"] = {"generator": "sonicline.mesh.revolved", "form": spec.form.value,
                        "quality": defn.mesh.quality.value, "cells": mesh.n_cells,
                        "first_cell_at_throat": spec.wall_first_cell,
                        "build_seconds": round(time.time() - t0, 2)}
    manifest["solver"] = {"application": summary.solver, "turbulence": summary.turbulence,
                          "steady": isinstance(defn.flow.time, d.Steady)}
    emit(Event("mesh", f"{mesh.n_cells} cells ({spec.form.value}, {defn.mesh.quality.value})"))

    runner.run(["checkMesh", "-allGeometry", "-allTopology", "-writeChecks", "json"], case,
               case / "log.checkMesh")
    check = parse.read_checkmesh(case, (case / "log.checkMesh").read_text(encoding="utf-8", errors="replace"))
    gate = gates.evaluate(check, viscous=summary.viscous)
    _write_json(run_dir / "mesh_report.json", {**asdict(check), **gate.to_json()})
    manifest["mesh"].update({"max_non_orthogonality": check.max_non_orthogonality,
                             "max_skewness": check.max_skewness, "gate": gate.ok})
    emit(Event("mesh", f"checkMesh: non-orthogonality {check.max_non_orthogonality:.1f} deg, "
                       f"skewness {check.max_skewness:.2f} -> {'pass' if gate.ok else 'FAIL'}"))
    if not gate.ok:
        for e in gate.errors:
            emit(Event("mesh", f"ERROR: {e}"))
        return finish("mesh_failed", Trust.NOT_TRUSTWORTHY.value)
    if check.max_non_orthogonality > gates.NON_ORTHO_CORRECT:
        foam_case.set_non_orthogonal_correctors(case, 1)

    # --- solve -------------------------------------------------------------------
    nproc = max(1, defn.numerics.processors)
    wedge = spec.form in (revolved.Form.WEDGE, revolved.Form.PLANAR)  # two-dimensional: no Uz
    if nproc > 1:
        runner.run(["decomposePar", "-force"], case, case / "log.decomposePar")

    def command(solver):
        return ["mpirun", "-np", str(nproc), solver, "-parallel"] if nproc > 1 else [solver]

    t_solve = time.time()
    if foam_case.needs_warm_start(defn, summary):
        n_warm = foam_case.WARM_START_ITERATIONS
        emit(Event("solve", f"warm start: {n_warm} iterations of {foam_case.PIMPLE_SOLVER}"))
        foam_case.write_warm_start(case, defn, meta, summary)
        warm = runner.start(command(foam_case.PIMPLE_SOLVER), case, case / "log.warmstart")
        while warm.poll() is None:
            time.sleep(poll_seconds)
            if _cancelled(run_dir):
                warm.terminate()
                warm.wait()
                emit(Event("solve", "cancelled during the warm start"))
                return finish("cancelled", Trust.NOT_TRUSTWORTHY.value)
        code = warm.wait()
        failure = parse.log_failure(warm.log.read_text(encoding="utf-8", errors="replace"))
        manifest["warm_start"] = {"solver": foam_case.PIMPLE_SOLVER, "iterations": n_warm,
                                  "exit_code": code, "failure": failure}
        if code != 0 or failure:
            emit(Event("solve", f"warm start failed: {failure or f'exit code {code}'}"))
            return finish("diverged" if failure else "failed", Trust.NOT_TRUSTWORTHY.value)
        # The continuation is judged on its own output only.
        shutil.move(str(case / "postProcessing"), str(case / "postProcessing.warmstart"))
        foam_case.write_continuation(case, defn, meta, summary, n_warm)
    if _cancelled(run_dir):
        return finish("cancelled", Trust.NOT_TRUSTWORTHY.value)
    cmd = command(summary.solver)
    emit(Event("solve", f"running {' '.join(cmd)}"))
    proc = runner.start(cmd, case, case / f"log.{summary.solver}")
    criteria = defn.numerics.convergence
    assessment = None
    stop_requested = False
    last_report = 0
    held_since = None  # first iteration of the current unbroken run of passing checks
    cancelled = False
    while proc.poll() is None:
        time.sleep(poll_seconds)
        if _cancelled(run_dir):
            emit(Event("solve", "cancel requested; stopping the solver"))
            proc.terminate()
            cancelled = True
            break
        tables = results.read_tables(case)
        assessment = convergence.assess(tables, criteria, wedge)
        # Stop only once the criteria have held for half a judgement window:
        # a slow oscillation passes a window that lands on its turning point
        # and fails a few iterations later (DESIGN.md section 11).
        if not assessment.converged:
            held_since = None
        elif held_since is None:
            held_since = assessment.iterations
        hold = convergence.judgement_window(criteria.integral_window, assessment.iterations) // 2
        steady = held_since is not None and assessment.iterations - held_since >= hold
        if assessment.iterations - last_report >= 100:
            last_report = assessment.iterations
            emit(Event("solve", f"iteration {assessment.iterations}",
                       {"spreads": assessment.spreads, "residual_drop": assessment.residual_drop,
                        "mass_imbalance": assessment.mass_imbalance}))
        if steady and not stop_requested:
            emit(Event("solve", f"converged at iteration {assessment.iterations}; stopping"))
            foam_case.request_stop(case)
            stop_requested = True
    code = proc.wait()
    if cancelled:
        manifest["solve_seconds"] = round(time.time() - t_solve, 1)
        return finish("cancelled", Trust.NOT_TRUSTWORTHY.value)
    log_text = proc.log.read_text(encoding="utf-8", errors="replace")
    failure = parse.log_failure(log_text)
    status = "completed" if code == 0 and failure is None else ("diverged" if failure else "failed")
    manifest["solve_seconds"] = round(time.time() - t_solve, 1)
    if failure:
        emit(Event("solve", f"solver failure: {failure}"))
    if nproc > 1 and status == "completed":
        runner.run(["reconstructPar", "-latestTime"], case, case / "log.reconstructPar")

    tables = results.read_tables(case)
    assessment = convergence.assess(tables, criteria, wedge, slack=convergence.JUDGEMENT_SLACK)
    _write_json(run_dir / "convergence.json", asdict(assessment))

    # --- post-processing ---------------------------------------------------------
    metrics = None
    yplus_max = None
    if tables.get("mdot_inlet") is not None:
        it = results.integrals(tables, summary)
        metrics = propulsion(defn, profile, summary, it)
        fields = results.read_fields(case)
        if fields is not None:
            metrics["extremes"] = results.extremes(fields, mesh.cell_centres, profile.x_exit,
                                                   summary.p_min_limit)
            if fields.y_plus is not None:
                yplus_max = float(np.max(fields.y_plus))
                metrics["wall"] = {"y_plus_max": yplus_max, "y_plus_mean": float(np.mean(fields.y_plus))}
            if fields.wall_shear is not None:
                metrics.setdefault("wall", {})["shear_stress_max"] = float(
                    np.linalg.norm(fields.wall_shear, axis=1).max())
            cond = condensation(defn.gas.model(), fields.p, fields.T, mesh.cell_centres[:, 0], profile.x_exit)
            if cond is not None:
                metrics["condensation"] = cond
            profiles = results.axial_profiles(fields, meta, mesh.cell_centres)
            _write_json(run_dir / "profiles.json", profiles)
            if metrics["regime"]["shock_area_ratio"]:
                metrics["shock"] = shock_location(profiles, profile, metrics["regime"]["shock_area_ratio"])
            if summary.viscous:
                rf = recovery_factor(profiles, defn.boundaries.inlet.T0,
                                     profile.throat_x + 0.2 * (profile.x_exit - profile.throat_x),
                                     profile.x_exit - 0.1 * (profile.x_exit - profile.throat_x))
                if rf:
                    metrics.setdefault("wall", {}).update(rf)
        metrics["convergence"] = {"iterations": assessment.iterations, "converged": assessment.converged,
                                  "mass_imbalance": assessment.mass_imbalance,
                                  "residual_drop_orders": assessment.residual_drop}
    v = verdict(defn, status, gate.ok, gate.warnings, assessment, metrics, yplus_max)
    if metrics is not None:
        metrics["verdict"] = v.to_json()
        _write_json(run_dir / "metrics.json", metrics)
    if render and metrics is not None:
        # Rendering goes through OpenGL, which on a machine with a broken or
        # missing driver kills the process instead of raising. The run's
        # outcome is on disk first, so such a crash costs the images only.
        _write_json(run_dir / "manifest.json", dict(manifest, status=status, trust=v.trust.value,
                                                    finished=datetime.now(timezone.utc).isoformat()))
        try:
            from ..post import render as rendering

            images = rendering.render_all(run_dir, case, defn, profile, summary)
            manifest["images"] = [str(p.relative_to(run_dir)) for p in images]
        except ImportError as e:
            emit(Event("post", f"images skipped ({e})"))
    for r in v.reasons:
        emit(Event("verdict", f"NOT TRUSTWORTHY: {r}"))
    for w in v.warnings:
        emit(Event("verdict", f"warning: {w}"))
    return finish(status, v.trust.value, metrics)
