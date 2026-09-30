"""STL input: surface checks and the same analysis the STEP worker gives.

A triangulated surface has no topology to trust, so it is checked before
anything is measured on it (trimesh; DESIGN.md section 3.6):

    watertight        every edge shared by exactly two triangles
    manifold          no edge shared by more than two
    winding           neighbouring triangles agree on orientation
    one body          a single connected component
    positive volume   outward normals (an inside-out file is flipped, with a warning)
    duplicates        no triangle twice
    degenerate        no zero-area triangles; slivers are counted

Self-intersection is OpenFOAM's ``surfaceCheck`` (trimesh cannot test it):
:func:`self_intersection` runs it when a runner is at hand.

The measurement then follows the STEP analyser: the principal axis of
inertia, cross-sections along it, the throat by golden section on the
section area, the inlet end from the steeper wall. Radii are those of a
circle of the section's area, so a non-revolved volume still has a
quasi-1D profile. STL carries no units: ``scale`` (metres per file unit)
comes from the user.
"""

from __future__ import annotations

import math
import re
from pathlib import Path

import numpy as np

from . import GeometryReport, frame

# A section whose area reaches this fraction of the circle through its
# farthest point is round. A faceted circle of n sides reaches
# (n / 2 pi) sin(2 pi / n): 0.99 needs 29 facets around (the exact STEP
# test is 0.995). A square section reaches 0.64.
ROUND = 0.99
SLIVER_ANGLE = math.radians(1.0)


def load(path: Path, scale: float):
    """The surface in metres, vertices merged (STL repeats them per triangle)."""
    import trimesh

    mesh = trimesh.load_mesh(str(path), file_type="stl", process=True)
    if not isinstance(mesh, trimesh.Trimesh):
        raise ValueError(f"{path.name} holds no triangles")
    if scale != 1.0:
        mesh.apply_scale(scale)
    return mesh


def surface_checks(mesh) -> tuple[dict, list[str], list[str]]:
    """The trimesh checks; returns (numbers, errors, warnings)."""
    errors, warnings = [], []
    edges = np.sort(mesh.edges, axis=1)
    _, counts = np.unique(edges, axis=0, return_counts=True)
    open_edges = int((counts == 1).sum())
    nonmanifold = int((counts > 2).sum())
    faces_sorted = np.sort(mesh.faces, axis=1)
    duplicates = len(faces_sorted) - len(np.unique(faces_sorted, axis=0))
    span = float(np.linalg.norm(mesh.extents)) or 1.0
    degenerate = int((mesh.area_faces <= 1e-14 * span * span).sum())
    angles = mesh.face_angles
    slivers = int((angles.min(axis=1) < SLIVER_ANGLE).sum()) - degenerate
    components = len(mesh.split(only_watertight=False))
    numbers = {"triangles": int(len(mesh.faces)), "open_edges": open_edges,
               "nonmanifold_edges": nonmanifold, "duplicate_triangles": int(duplicates),
               "degenerate_triangles": degenerate, "sliver_triangles": max(slivers, 0),
               "components": components, "winding_consistent": bool(mesh.is_winding_consistent),
               "watertight": bool(mesh.is_watertight)}
    if open_edges:
        errors.append(f"the surface is not watertight: {open_edges} edges belong to one triangle only "
                      "(a hole or a gap between patches)")
    if nonmanifold:
        errors.append(f"{nonmanifold} edges are shared by more than two triangles (non-manifold)")
    if duplicates:
        errors.append(f"{duplicates} triangles appear twice")
    if components > 1:
        errors.append(f"the surface has {components} separate pieces; a fluid domain is one "
                      "connected volume")
    if not mesh.is_winding_consistent and not open_edges:
        errors.append("neighbouring triangles disagree on orientation (inconsistent winding)")
    if degenerate:
        warnings.append(f"{degenerate} triangles have zero area")
    if slivers > 0:
        warnings.append(f"{slivers} sliver triangles (an angle under 1 deg); the mesher tolerates "
                        "them, but they mark a poor export")
    return numbers, errors, warnings


def self_intersection(runner, stl: Path, work: Path) -> tuple[bool | None, str]:
    """OpenFOAM's surfaceCheck on ``stl``: (self-intersecting?, log). None
    when the log does not say."""
    work.mkdir(parents=True, exist_ok=True)
    log = work / "log.surfaceCheck"
    runner.run(["surfaceCheck", "-checkSelfIntersection", str(Path(stl).resolve())], work, log)
    text = log.read_text(encoding="utf-8", errors="replace")
    if re.search(r"Surface is not self-intersecting", text):
        return False, text
    if re.search(r"Surface is self-intersecting", text):
        return True, text
    return None, text


def analyse(path: Path, scale: float, inlet_end: str = "auto", stations: int = 240) -> GeometryReport:
    report = GeometryReport(ok=False, kind="unknown", volumes=0, volume=0.0, axisymmetric=False,
                            roundness_min=0.0, profile_points=[], throat_x=None, throat_radius=None,
                            inlet_end="min", inlet_confidence="low", source="stl")
    try:
        mesh = load(path, scale)
    except Exception as e:  # noqa: BLE001 - a bad file is a finding, not a crash
        report.errors.append(f"could not read the file: {e}")
        return report
    numbers, errors, warnings = surface_checks(mesh)
    report.checks = numbers
    report.errors += errors
    report.warnings += warnings
    if errors:
        return report
    if mesh.volume < 0.0:
        mesh.invert()
        report.warnings.append("the triangles faced inwards (negative volume); they were flipped")
    report.volumes = 1
    report.volume = float(mesh.volume)
    if report.volume <= 0.0:
        report.errors.append("the surface encloses no volume")
        return report
    _measure(mesh, report, inlet_end, stations)
    report.ok = not report.errors
    return report


def _measure(mesh, report: GeometryReport, inlet_end: str, stations: int) -> None:
    com = np.asarray(mesh.center_mass, dtype=float)
    evals, evecs = np.linalg.eigh(np.asarray(mesh.moment_inertia, dtype=float))
    axis, symmetric = frame.principal_axis(evals, evecs)
    if not symmetric:
        report.warnings.append("the inertia tensor is not axisymmetric; checking sections")
    s_all = (mesh.vertices - com) @ axis
    s_min, s_max = float(s_all.min()), float(s_all.max())
    span = float(np.linalg.norm(mesh.extents))
    report.axis_origin = com.tolist()
    report.axis_direction = axis.tolist()
    report.axis_extent = [s_min, s_max]

    def section(s):
        path3 = mesh.section(plane_origin=com + s * axis, plane_normal=axis)
        if path3 is None:
            return None
        pts = np.asarray(path3.vertices)
        d = pts - com
        radial = np.linalg.norm(d - np.outer(d @ axis, axis), axis=1)
        planar, _ = path3.to_2D()
        polys = planar.polygons_full
        if not polys:
            return None
        area = float(sum(p.area for p in polys))
        holes = any(len(p.interiors) for p in polys)
        return area, float(radial.max()), len(polys), holes

    eps = 1e-4 * (s_max - s_min)
    rows, roundness, kinds = [], 1.0, set()
    for s in np.linspace(s_min + eps, s_max - eps, stations):
        sec = section(float(s))
        if sec is None:
            continue
        area, r_max, n, holes = sec
        if holes:
            kinds.add("annulus")
        if n > 1:
            kinds.add("multiple_regions")
        roundness = min(roundness, area / (math.pi * r_max**2))
        rows.append((float(s), frame.equivalent_radius(area)))
    report.roundness_min = float(roundness)
    if "annulus" in kinds:
        report.kind = "solid_body"
        report.errors.append(
            "this looks like a solid thruster body with a gas passage through it, not the gas "
            "volume itself: export the internal fluid volume (the passage filled as a solid)")
        return
    report.kind = "fluid_volume"
    report.axisymmetric = bool(roundness > ROUND)
    if not report.axisymmetric:
        report.warnings.append(
            f"the volume is not a body of revolution (sections reach only {100 * roundness:.1f} % "
            "of a circle's area): it needs the unstructured (Tier 2) mesher, and quasi-1D theory "
            "sees it through the radius of a circle of the same section area")
    if len(rows) < 10:
        report.errors.append("too few valid cross-sections; the geometry could not be sliced")
        return

    arr = np.array(rows)
    k = int(np.argmin(arr[:, 1]))
    a, b = arr[max(k - 1, 0), 0], arr[min(k + 1, len(arr) - 1), 0]
    f = lambda s: frame.equivalent_radius(section(s)[0])  # noqa: E731
    gr = (math.sqrt(5) - 1) / 2
    c, d_ = b - gr * (b - a), a + gr * (b - a)
    fc, fd = f(c), f(d_)
    for _ in range(40):
        if fc < fd:
            b, d_, fd = d_, c, fc
            c = b - gr * (b - a)
            fc = f(c)
        else:
            a, c, fc = c, d_, fd
            d_ = a + gr * (b - a)
            fd = f(d_)
    s_t = 0.5 * (a + b)
    r_t = f(s_t)
    rows.append((s_t, r_t))

    # End faces: triangles normal to the axis at either extreme.
    normals, centres = mesh.face_normals, mesh.triangles_center
    s_face = (centres - com) @ axis
    # A tessellated body's inertia axis is good to ~1e-5 rad, not the 1e-7
    # of an exact CAD solid: the tolerances are set by that.
    flat = np.abs(np.abs(normals @ axis) - 1.0) < 1e-4
    ends = {}
    for end, target in (("min", s_min), ("max", s_max)):
        sel = flat & (np.abs(s_face - target) < 1e-4 * span)
        if sel.any():
            ends[end] = frame.equivalent_radius(float(mesh.area_faces[sel].sum()))
            rows.append((target, ends[end]))
    if len(ends) < 2:
        report.warnings.append("could not find planar inlet/outlet faces normal to the axis at "
                               "both ends; the end radii are extrapolated from sections")
    end, confidence, warnings = frame.choose_inlet_end(rows, s_t, r_t, inlet_end)
    report.inlet_end, report.inlet_confidence = end, confidence
    report.warnings += warnings
    report.throat_x = float(s_t - s_min if end == "min" else s_max - s_t)
    report.throat_radius = float(r_t)
    report.profile_points = frame.nozzle_profile(rows, s_min, s_max, end)
