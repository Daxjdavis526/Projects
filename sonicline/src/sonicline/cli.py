"""Command-line entry point.

    sonicline check <definition.json>   validate a definition and print the
                                        quasi-1D prediction for it
    sonicline import <nozzle.step>      analyse a fluid volume, write a definition
    sonicline run <definition.json>     mesh, solve, post-process and judge it
    sonicline study <definition.json>   grid-convergence study (three meshes, GCI)
    sonicline verify                    run the verification cases
    sonicline report <run-dir>          PDF, PNG and JSON report of a finished run
    sonicline ui [project]              the desktop application (the ``ui`` extra)

The same pipeline functions back the desktop UI; the CLI is also how CI and
the verification suite drive the application.
"""

from __future__ import annotations

import argparse
import sys

from .core import model
from .core.stagnation import nominal_p0
from .core.theory import discharge, nozzle
from .core.validate import Severity, has_errors, resolve_profile, validate

_MARK = {Severity.INFO: "info ", Severity.WARNING: "WARN ", Severity.ERROR: "ERROR"}


def _check(path: str) -> int:
    try:
        defn = model.load(path)
    except (OSError, model.DefinitionError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2

    print(f"{defn.name}  (definition {model.definition_hash(defn)[:12]})")
    profile = resolve_profile(defn)
    if profile is None and isinstance(defn.geometry, model.CadFile):
        from pathlib import Path

        from . import geometry

        cad = Path(path).resolve().parent / defn.geometry.path
        try:
            geometry.check_definition_file(cad, defn.geometry.sha256)
            report = geometry.analyse(cad, defn.geometry.length_unit, defn.geometry.inlet_end)
        except geometry.GeometryError as e:
            print(f"error: {e}", file=sys.stderr)
            return 1
        if not report.ok:
            for e in report.errors:
                print(f"  ERROR geometry: {e}")
            return 1
        profile = report.profile()
    inlet = defn.boundaries.inlet
    p0 = nominal_p0(defn, profile)
    if profile is not None and p0 is not None:
        gas = defn.gas.model()
        pa = defn.boundaries.ambient.pressure
        perf = nozzle.analyse(gas, p0, inlet.T0, pa, profile.throat_area,
                              profile.area(profile.x_exit))
        rc = profile.rc_over_rt
        cd = discharge.kliegel_levine(gas.gamma, rc) if rc and not profile.planar_width else None
        print()
        print("quasi-1D prediction (ideal, before CFD)")
        size = "height  " if profile.planar_width else "diameter"
        print(f"  throat {size}     {2e3 * profile.throat_radius:.3f} mm, "
              f"expansion ratio {profile.expansion_ratio:.3f}")
        print(f"  regime              {perf.regime.value}")
        print(f"  mass flow           {1e3 * perf.mass_flow:.4f} g/s"
              + (f"   (x Cd {cd:.4f} for Rc/Rt = {rc:.2f}: {1e3 * cd * perf.mass_flow:.4f} g/s)"
                 if cd else ""))
        print(f"  exit Mach           {perf.exit_mach:.4f}")
        print(f"  exit pressure       {perf.exit_pressure:.1f} Pa")
        print(f"  exit temperature    {perf.exit_temperature:.2f} K")
        print(f"  thrust              {perf.thrust:.4f} N "
              f"(momentum {perf.momentum_thrust:.4f}, pressure {perf.pressure_thrust:+.4f})")
        print(f"  specific impulse    {nozzle.specific_impulse(perf):.2f} s")

    findings = validate(defn, profile)
    print()
    print("checks")
    for f in sorted(findings, key=lambda f: -f.severity):
        print(f"  {_MARK[f.severity]} {f.code}: {f.message}")
        if f.hint:
            print(f"        -> {f.hint}")
    return 1 if has_errors(findings) else 0


def _json_event(e) -> None:
    import json

    print(json.dumps({"stage": e.stage, "message": e.message, "data": e.data}, default=str), flush=True)


def _run(path: str, out: str | None, processors: int | None, no_images: bool,
         events: str = "text", resume: bool = False) -> int:
    import dataclasses
    from pathlib import Path

    from .run import pipeline

    try:
        defn = model.load(path)
    except (OSError, model.DefinitionError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    if processors:
        defn = dataclasses.replace(defn, numerics=dataclasses.replace(defn.numerics, processors=processors))
    run_dir = Path(out) if out else Path("runs") / Path(path).stem
    on_event = _json_event if events == "json" else (
        lambda e: print(f"[{e.stage}] {e.message}", flush=True))
    result = pipeline.run(defn, run_dir, on_event=on_event,
                          render=not no_images, base_dir=Path(path).resolve().parent, resume=resume)
    if events == "json":
        return 0 if result.trust != "not_trustworthy" else 1
    if result.metrics:
        m = result.metrics
        print()
        print(f"  mass flow      {1e3 * m['mass_flow']['inlet']:.4f} g/s   "
              f"(ideal {1e3 * m['mass_flow']['ideal']:.4f}; Cd {m['discharge_coefficient']['cfd']:.4f})")
        print(f"  thrust         {m['thrust']['total']:.4f} N   (ideal {m['thrust']['ideal']:.4f})")
        print(f"  Isp            {m['specific_impulse']['cfd']:.2f} s")
        print(f"  exit Mach      {m['exit']['mach_mass_avg']:.4f}   (quasi-1D {m['exit']['ideal']['mach']:.4f})")
        print(f"  throat Mach    {m['throat']['mach_area_avg']:.4f} (area-averaged)")
        print(f"  mass balance   {100 * m['mass_flow']['imbalance_inlet_exit']:+.4f} % inlet-exit")
        print(f"  verdict        {result.trust}")
    print(f"\nresults in {result.run_dir}")
    return 0 if result.trust != "not_trustworthy" else 1


def _extract(body: str, unit: str, out: str | None) -> int:
    from pathlib import Path

    from . import geometry

    src = Path(body)
    target = Path(out) if out else src.with_name(src.stem + "-fluid.step")
    try:
        rep = geometry.extract_fluid(src, unit, target)
    except geometry.GeometryError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(f"{src.name}: {rep['caps']} openings capped, {len(rep['cavities'])} closed cavities")
    for c in rep["cavities"]:
        print(f"  cavity {1e9 * c['volume']:.3f} mm^3 bounded by {c['caps']} cap(s)")
    for e in rep["errors"]:
        print(f"  ERROR {e}")
    if not rep["ok"]:
        return 1
    print(f"passage {1e9 * rep['chosen']['volume']:.3f} mm^3 written to {target}: look at it before using it "
          f"(sonicline import {target.name})")
    return 0


def _import(cad: str, unit: str, p0: str, out: str | None) -> int:
    import json
    from pathlib import Path

    from . import geometry

    path = Path(cad)
    try:
        report = geometry.analyse(path, unit)
    except geometry.GeometryError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(f"{path.name}: {report.kind}, {report.volumes} solid(s), volume {report.volume * 1e9:.3f} mm^3")
    for w in report.warnings:
        print(f"  WARN  {w}")
    for e in report.errors:
        print(f"  ERROR {e}")
    if not report.ok:
        return 1
    prof = report.profile()
    print(f"  throat diameter   {2e3 * prof.throat_radius:.4f} mm")
    print(f"  expansion ratio   {prof.expansion_ratio:.4f}")
    print(f"  contraction ratio {prof.contraction_ratio:.4f}")
    print(f"  length            {1e3 * (prof.x_exit - prof.x_inlet):.4f} mm")
    rc = prof.rc_over_rt
    print(f"  throat Rc/Rt      {rc:.3f}" if rc else "  throat Rc/Rt      unknown")
    print(f"  inlet end         {report.inlet_end} ({report.inlet_confidence} confidence)")
    defn = {
        "name": path.stem,
        "geometry": {"type": "cad_file", "path": path.name, "sha256": geometry.sha256(path),
                     "length_unit": unit, "inlet_end": report.inlet_end},
        "boundaries": {"inlet": {"type": "reservoir_inlet", "p0": p0, "T0": "300 K"}},
        # Axisymmetric flow in a revolved nozzle: the wedge is exact and runs in
        # minutes. Set "o_grid_3d" for a full 3D run. Anything else needs the
        # unstructured mesher, with wall functions: its tetrahedral fallback
        # has no wall layers.
        "mesh": ({"form": "wedge", "quality": "standard"} if report.axisymmetric else
                 {"form": "unstructured", "quality": "standard", "first_cell_yplus": 30.0}),
    }
    if not report.axisymmetric:
        print("  not a body of revolution: the unstructured (Tier 2) mesher, SST with wall functions")
    target = Path(out) if out else path.with_suffix(".json")
    target.write_text(json.dumps(defn, indent=2) + "\n", encoding="utf-8")
    form = "wedge mesh" if report.axisymmetric else "unstructured mesh"
    print(f"\ndefinition written to {target} (sea level, plume region, k-omega SST, {form})")
    return 0


def _study(path: str, out: str | None, processors: int | None, ratio: float) -> int:
    import dataclasses
    from pathlib import Path

    from .run import study

    try:
        defn = model.load(path)
    except (OSError, model.DefinitionError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    if processors:
        defn = dataclasses.replace(defn, numerics=dataclasses.replace(defn.numerics, processors=processors))
    out_dir = Path(out) if out else Path("runs") / f"{Path(path).stem}-study"
    result = study.run(defn, out_dir, ratio, base_dir=Path(path).resolve().parent,
                       on_event=lambda e: print(f"[{e.stage}] {e.message}", flush=True)
                       if e.stage in ("mesh", "done", "verdict") else None)
    print()
    print(study.markdown(result))
    print(f"results in {out_dir}")
    return 0 if result.valid else 1


def _report(run_dir: str, out: str | None) -> int:
    import json
    from pathlib import Path

    try:
        from .post import fieldview, report
    except ImportError as e:
        print(f"error: reports need the post extra ({e})", file=sys.stderr)
        return 2
    try:
        files = report.export(Path(run_dir), Path(out) if out else None)
    except fieldview.ResultsError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    for role, path in sorted(files.items()):
        print(f"  {role:14s} {path}")
    missing = json.loads(files["json"].read_text(encoding="utf-8"))["images"]["missing"]
    for m in missing:
        print(f"  image skipped: {m}")
    if (Path(run_dir) / "timeseries.json").is_file():
        # A transient's written times are its animation's frames.
        dest = (Path(out) if out else Path(run_dir)) / "frames"
        try:
            gif = report.frames_isolated(Path(run_dir), dest)[-1]
            print(f"  {'animation':14s} {gif}")
        except RuntimeError as e:
            print(f"  animation skipped: {e}")
    return 0


def _verify(cases: str, quality: str, out: str, processors: int) -> int:
    from pathlib import Path

    from . import verification

    names = [c.strip() for c in cases.split(",") if c.strip()]
    unknown = [n for n in names if n not in verification.CASES and n not in verification.COMPARISONS]
    if unknown:
        print(f"error: unknown cases {unknown}; known: {sorted(verification.CASES) + list(verification.COMPARISONS)}",
              file=sys.stderr)
        return 2
    results = verification.run_suite(names, quality, Path(out), processors,
                                     on_event=lambda e: print(f"  [{e.stage}] {e.message}", flush=True)
                                     if e.stage in ("done", "verdict") else None)
    print()
    print(verification.markdown(results, quality))
    failed = [r.case for r in results if not r.passed]
    print("all verification checks passed" if not failed else f"FAILED: {', '.join(failed)}")
    return 0 if not failed else 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="sonicline", description=__doc__.split("\n\n")[0])
    sub = parser.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check", help="validate a simulation definition")
    check.add_argument("definition")
    run = sub.add_parser("run", help="mesh, solve and post-process a definition")
    run.add_argument("definition")
    run.add_argument("--out", help="run directory (default runs/<definition name>)")
    run.add_argument("--processors", type=int, help="MPI processes")
    run.add_argument("--no-images", action="store_true", help="skip rendered images")
    run.add_argument("--resume", action="store_true",
                     help="continue the run directory's case from its last written time")
    run.add_argument("--events", choices=["text", "json"], default="text",
                     help="json: one JSON object per line, for the desktop UI")
    imp = sub.add_parser("import", help="analyse a STEP or STL fluid volume and write a starter definition")
    imp.add_argument("cad")
    imp.add_argument("--unit", default="mm", help="length unit of an STL file (STEP carries its own)")
    imp.add_argument("--p0", default="20 bar", help="chamber (stagnation) pressure")
    imp.add_argument("--out", help="definition file to write (default <cad>.json)")
    ext = sub.add_parser("extract", help="extract the gas passage of a solid thruster body (STEP) for review")
    ext.add_argument("body")
    ext.add_argument("--unit", default="mm")
    ext.add_argument("--out", help="STEP file to write (default <body>-fluid.step)")
    stu = sub.add_parser("study", help="grid-convergence study of a definition (three meshes)")
    stu.add_argument("definition")
    stu.add_argument("--out", help="study directory (default runs/<definition name>-study)")
    stu.add_argument("--processors", type=int, help="MPI processes")
    stu.add_argument("--ratio", type=float, default=2 ** 0.5,
                     help="refinement ratio between levels (at least 1.3; default sqrt 2)")
    rep = sub.add_parser("report", help="PDF, PNG and JSON report of a finished run")
    rep.add_argument("run_dir")
    rep.add_argument("--out", help="folder for the report (default <run-dir>/report)")
    ui = sub.add_parser("ui", help="open the desktop application")
    ui.add_argument("project", nargs="?", help="a .sonicline project folder (created if missing)")
    ver = sub.add_parser("verify", help="run verification cases against analytical references")
    ver.add_argument("--cases", default="V1,V2,V3a,V3b,V4a,V4b,V5,V6,V7,V9a,V9b,V9c,V9d,V10,V11,V12,V13,V14,V15,E1,E2")
    ver.add_argument("--quality", default="standard", choices=["coarse", "standard", "fine"])
    ver.add_argument("--out", default="verification-runs")
    ver.add_argument("--processors", type=int, default=1)
    args = parser.parse_args(argv)
    if args.command == "report":
        return _report(args.run_dir, args.out)
    if args.command == "ui":
        try:
            from .ui import main as ui_main
        except ImportError as e:
            print(f"error: the desktop application needs the ui extra ({e}): "
                  "pip install -e \"./sonicline[ui]\"", file=sys.stderr)
            return 2
        return ui_main([args.project] if args.project else [])
    if args.command == "study":
        if args.ratio < 1.3:
            print("error: the refinement ratio must be at least 1.3 (Celik et al. 2008)", file=sys.stderr)
            return 2
        return _study(args.definition, args.out, args.processors, args.ratio)
    if args.command == "verify":
        return _verify(args.cases, args.quality, args.out, args.processors)
    if args.command == "extract":
        return _extract(args.body, args.unit, args.out)
    if args.command == "import":
        return _import(args.cad, args.unit, args.p0, args.out)
    if args.command == "check":
        return _check(args.definition)
    if args.command == "run":
        return _run(args.definition, args.out, args.processors, args.no_images, args.events, args.resume)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
