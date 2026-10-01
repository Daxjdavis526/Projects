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


def _nozzle_surface(defn: d.SimulationDefinition, profile, cad: Path | None, report, work: Path,
                    size: float):
    """The nozzle's surface in the nozzle frame (metres), for the
    unstructured mesher: a CAD file's own, or the analytic profile revolved
    exactly (through STEP) and triangulated."""
    from .. import geometry
    from ..geometry import surface as stl_surface
    from ..mesh import unstructured as tier2

    work.mkdir(parents=True, exist_ok=True)
    if cad is None:
        step = work / "nozzle.step"
        geometry.write_revolved_step(profile, step)
        return stl_surface.load(geometry.tessellate(step, "mm", work / "nozzle-source.stl", size), 1.0)
    src = geometry.tessellate(cad, defn.geometry.length_unit, work / "nozzle-source.stl", size)
    return tier2.to_frame(stl_surface.load(src, 1.0), report.nozzle_frame())


# A transient's final state: the mean over the last tenth of its time, the
# window its settling is judged on. A chamber rings acoustically long after
# the exit flow has settled (V15: inlet mass flow +-0.4 % at 1 ms, exit flow
# steady to 1e-4), so a few steps read one phase of the ringing.
TRANSIENT_FINAL_FRACTION = 0.1


def transient_window(tables: dict) -> int:
    """Rows of the per-step tables in the last tenth of the run."""
    import numpy as np

    t = np.asarray(tables["mdot_inlet"].time, dtype=float)
    return max(1, int(np.count_nonzero(t >= t[-1] - TRANSIENT_FINAL_FRACTION * (t[-1] - t[0]))))


def nproc_of(defn: d.SimulationDefinition) -> int:
    return max(1, defn.numerics.processors)


def run(defn: d.SimulationDefinition, run_dir: Path, runner=None,
        on_event: Callable[[Event], None] | None = None, poll_seconds: float = 2.0,
        render: bool = True, base_dir: Path | None = None, resume: bool = False) -> RunResult:
    """Run a definition end to end. ``base_dir`` resolves relative CAD paths
    (normally the directory holding the definition file). ``resume``
    continues a run directory's existing case from its last written time
    instead of meshing afresh (when there is one to continue)."""
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
        if not report.axisymmetric and defn.mesh.form is not d.MeshForm.UNSTRUCTURED:
            msg = ("the geometry is not a body of revolution: mesh it with the unstructured "
                   "(Tier 2) mesher (mesh.form = unstructured)")
            emit(Event("geometry", f"ERROR: {msg}"))
            manifest["geometry_error"] = [msg]
            return finish("rejected", Trust.NOT_TRUSTWORTHY.value)
        profile = report.profile()
        # The recovered profile goes with the run: the results views need it.
        _write_json(run_dir / "profile.json", {"points": [list(p) for p in report.profile_points],
                                               "area_equivalent": not report.axisymmetric})
        manifest["geometry"] = {"file": cad.name, "sha256": defn.geometry.sha256, "kind": report.kind,
                                "inlet_end": report.inlet_end,
                                "inlet_confidence": report.inlet_confidence}
        kind = "revolved fluid volume" if report.axisymmetric else "fluid volume (not revolved)"
        emit(Event("geometry", f"{cad.name}: {kind}, throat diameter "
                               f"{2e3 * profile.throat_radius:.3f} mm, expansion ratio "
                               f"{profile.expansion_ratio:.3f} (inlet at the {report.inlet_end} end, "
                               f"{report.inlet_confidence} confidence)"))

    # --- gas: equation of state and heat capacity ----------------------------------
    resolved = d.resolve_gas(defn)
    if resolved != defn:
        requested = defn.gas
        defn = resolved
        model.save(defn, run_dir / "definition.json")
        manifest["gas"] = {"requested": {"equation_of_state": requested.equation_of_state,
                                         "heat_capacity": requested.heat_capacity},
                           "used": {"equation_of_state": defn.gas.equation_of_state,
                                    "heat_capacity": defn.gas.heat_capacity,
                                    "reference_temperature": defn.gas.reference_temperature}}
        emit(Event("validate", f"gas: {defn.gas.species}, {defn.gas.equation_of_state.replace('_', ' ')}, "
                               f"{'cp(T)' if defn.gas.heat_capacity == 'temperature_dependent' else 'constant cp'}"
                               " (automatic)"))

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
    if isinstance(defn.geometry, d.CadFile) and cad.suffix.lower() == ".stl":
        from ..geometry import surface as stl_surface

        crossing, _ = stl_surface.self_intersection(runner, cad, run_dir / "surfaceCheck")
        manifest["geometry"]["self_intersecting"] = crossing
        if crossing:
            emit(Event("geometry", "ERROR: the surface intersects itself (OpenFOAM surfaceCheck)"))
            manifest["geometry_error"] = ["self-intersecting surface"]
            return finish("rejected", Trust.NOT_TRUSTWORTHY.value)

    # --- mesh and case -----------------------------------------------------------
    case = run_dir / "case"
    summary_file = run_dir / "case_summary.json"
    resuming = resume and summary_file.is_file() and (case / "case.foam").is_file()
    if resuming:
        # Continue a run that stopped (a killed container, a cancel) from its
        # last written time, with the mesh and case it already has.
        from ..foam import polymesh_io

        summary = foam_case.CaseSummary.from_json(json.loads(summary_file.read_text(encoding="utf-8")))
        meta = revolved.MeshMeta.from_json(json.loads((run_dir / "mesh_meta.json").read_text(encoding="utf-8")))
        mesh = polymesh_io.read(case)
        previous = json.loads((run_dir / "manifest.json").read_text(encoding="utf-8")) \
            if (run_dir / "manifest.json").is_file() else {}
        for key in ("mesh", "solver", "extension", "warm_start", "resumed"):
            if key in previous:
                manifest[key] = previous[key]
        report_file = run_dir / "mesh_report.json"
        prior = json.loads(report_file.read_text(encoding="utf-8")) if report_file.is_file() else {}
        gate = gates.GateResult(bool(prior.get("gate_ok", True)), list(prior.get("gate_errors", [])),
                                list(prior.get("gate_warnings", [])))
        form_name = meta.form.value
        two_d = meta.form in (revolved.Form.WEDGE, revolved.Form.PLANAR)
        latest = parse.latest_time(case) or "0"
        if nproc_of(defn) > 1 and (case / "processor0").is_dir():
            latest = parse.latest_time(case / "processor0") or latest
        manifest["resumed"] = manifest.get("resumed", []) + [{"from_time": latest,
                                                             "at": datetime.now(timezone.utc).isoformat()}]
        foam_case.clear_stop(case)
        emit(Event("setup", f"resuming from time {latest}"))
    else:
        if case.exists():
            shutil.rmtree(case)
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
        real_gas_library = None
        if defn.gas.virial:
            from ..foam import extensions

            try:
                real_gas_library = extensions.ensure_built(runner, run_dir / "extensions", "virialGas")
            except extensions.ExtensionBuildError as e:
                emit(Event("setup", f"ERROR: {e}"))
                manifest["setup_error"] = str(e)
                return finish("failed", Trust.NOT_TRUSTWORTHY.value)
            manifest["real_gas_library"] = real_gas_library
        t0 = time.time()
        if defn.mesh.form is d.MeshForm.UNSTRUCTURED:
            from ..mesh import unstructured as tier2

            viscous = not isinstance(defn.flow.turbulence, d.Inviscid)
            first_cell = sizing.throat_first_cell(defn, profile) / defn.mesh.refinement if viscous else None
            spec2 = tier2.spec_for(defn, profile, first_cell)
            try:
                nozzle_surface = _nozzle_surface(defn, profile, cad if isinstance(defn.geometry, d.CadFile) else None,
                                                 report if isinstance(defn.geometry, d.CadFile) else None,
                                                 run_dir / "mesh", spec2.wall_cell)
                domain = tier2.domain_surface(nozzle_surface, profile, defn)
                mesh, meta, t2 = tier2.build(runner, run_dir / "mesh", domain, profile, spec2,
                                             on_note=lambda text: emit(Event("mesh", text)))
            except tier2.MeshingError as e:
                emit(Event("mesh", f"ERROR: {e}"))
                manifest["mesh"] = {"generator": "sonicline.mesh.unstructured", "error": str(e)}
                return finish("mesh_failed", Trust.NOT_TRUSTWORTHY.value)
            for note in t2.notes:
                emit(Event("mesh", note))
            mesher_info = {"generator": f"sonicline.mesh.unstructured ({t2.mesher})", "tier2": t2.to_json(),
                           "first_cell_at_throat": spec2.first_layer, "wall_cell": spec2.wall_cell}
            form_name, two_d = "unstructured", False
        else:
            spec = sizing.spec_for(defn, profile)
            mesh, meta = revolved.build(profile, spec)
            mesher_info = {"generator": "sonicline.mesh.revolved", "first_cell_at_throat": spec.wall_first_cell}
            form_name, two_d = spec.form.value, spec.form in (revolved.Form.WEDGE, revolved.Form.PLANAR)
        summary = foam_case.build_case(case, defn, profile, mesh, meta, extension, real_gas_library)
        (run_dir / "mesh_meta.json").write_text(json.dumps(meta.to_json()) + "\n", encoding="utf-8")
        _write_json(run_dir / "case_summary.json", summary.to_json())
        manifest["mesh"] = {**mesher_info, "form": form_name, "quality": defn.mesh.quality.value,
                            "cells": mesh.n_cells, "build_seconds": round(time.time() - t0, 2)}
        manifest["solver"] = {"application": summary.solver, "turbulence": summary.turbulence,
                              "steady": isinstance(defn.flow.time, d.Steady)}
        emit(Event("mesh", f"{mesh.n_cells} cells ({form_name}, {defn.mesh.quality.value})"))

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
    nproc = nproc_of(defn)
    wedge = two_d  # two-dimensional: no Uz
    transient = isinstance(defn.flow.time, d.Transient)
    if nproc > 1 and not (resuming and (case / "processor0").is_dir()):
        runner.run(["decomposePar", "-force"], case, case / "log.decomposePar")

    def command(solver):
        return ["mpirun", "-np", str(nproc), solver, "-parallel"] if nproc > 1 else [solver]

    t_solve = time.time()
    if foam_case.needs_warm_start(defn, summary) and not (resuming and (case / "postProcessing.warmstart").is_dir()):
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
    end_time = defn.flow.time.end_time if transient else None
    try:
        while proc.poll() is None:
            time.sleep(poll_seconds)
            if _cancelled(run_dir):
                emit(Event("solve", "cancel requested; stopping the solver"))
                proc.terminate()
                cancelled = True
                break
            tables = results.read_tables(case)
            if transient:
                # A transient runs to its end time; progress is simulated time.
                inlet = tables.get("mdot_inlet")
                if inlet is not None and len(inlet.time):
                    done = 100.0 * float(inlet.time[-1]) / end_time
                    if done - last_report >= 5.0:
                        last_report = done
                        emit(Event("solve", f"t = {1e3 * float(inlet.time[-1]):.4g} ms ({done:.0f} %)",
                                   {"time": float(inlet.time[-1]), "fraction": done / 100.0}))
                continue
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
    except BaseException:
        # Whatever breaks the monitoring (a bug, Ctrl-C) must not leave
        # the solver running on its own.
        proc.terminate()
        proc.wait()
        raise
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
    elif code != 0:
        # Say why: an MPI launch refusal or a missing library leaves no
        # solver failure text, only the last lines of the log.
        tail = [l.strip() for l in log_text.splitlines() if l.strip() and not set(l.strip()) <= set("-*=")]
        detail = "; ".join(tail[-3:]) if tail else "empty log"
        manifest["solver_exit"] = {"exit_code": code, "log_tail": tail[-20:]}
        emit(Event("solve", f"solver exited with code {code}: {detail[:400]}"))
    if nproc > 1 and status == "completed":
        # A transient's every written time is a frame of its animation.
        runner.run(["reconstructPar"] if transient else ["reconstructPar", "-latestTime"], case,
                   case / "log.reconstructPar")

    tables = results.read_tables(case)
    if transient:
        assessment = None  # judged on conservation in time, not steadiness
        if status == "completed":
            reached = tables.get("mdot_inlet")
            if reached is None or not len(reached.time) or reached.time[-1] < 0.999 * end_time:
                status = "failed"
                emit(Event("solve", "the solver stopped before the end time"))
    else:
        assessment = convergence.assess(tables, criteria, wedge, slack=convergence.JUDGEMENT_SLACK)
        _write_json(run_dir / "convergence.json", asdict(assessment))

    # --- post-processing ---------------------------------------------------------
    metrics = None
    yplus_max = None
    if tables.get("mdot_inlet") is not None:
        it = results.integrals(tables, summary, window=transient_window(tables) if transient else None)
        metrics = propulsion(defn, profile, summary, it)
        if transient:
            from ..post import timeseries

            ts = timeseries.build(tables, summary.sector_factor, defn.boundaries.ambient.pressure,
                                  summary.exit_area)
            if ts is not None:
                _write_json(run_dir / "timeseries.json", ts.to_json())
                metrics["transient"] = timeseries.metrics(ts)
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
        if assessment is not None:
            metrics["convergence"] = {"iterations": assessment.iterations, "converged": assessment.converged,
                                      "mass_imbalance": assessment.mass_imbalance,
                                      "residual_drop_orders": assessment.residual_drop}
    v = verdict(defn, status, gate.ok, gate.warnings, assessment, metrics, yplus_max)
    if metrics is not None:
        metrics["verdict"] = v.to_json()
        try:
            from ..core import uncertainty

            metrics["uncertainty"] = uncertainty.to_json(uncertainty.budgets(defn, profile, metrics))
        except (KeyError, TypeError, ValueError, ZeroDivisionError) as e:  # never costs the run
            metrics["uncertainty"] = {"error": f"{type(e).__name__}: {e}"}
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
            if transient:
                from ..post import report as reporting

                try:
                    frames = reporting.frames_isolated(run_dir, run_dir / "frames")
                    manifest["animation"] = [str(p.relative_to(run_dir)) for p in frames if p.suffix == ".gif"]
                    emit(Event("post", f"{len(frames) - 1} animation frames"))
                except RuntimeError as e:
                    emit(Event("post", f"animation skipped ({e})"))
        except ImportError as e:
            emit(Event("post", f"images skipped ({e})"))
    for r in v.reasons:
        emit(Event("verdict", f"NOT TRUSTWORTHY: {r}"))
    for w in v.warnings:
        emit(Event("verdict", f"warning: {w}"))
    return finish(status, v.trust.value, metrics)
