"""CAD worker process: runs gmsh's OpenCASCADE kernel and prints JSON.

    python -m sonicline.geometry.worker analyse <file> <scale> <inlet_end> <stations>
    python -m sonicline.geometry.worker write <segments.json> <out.step>
    python -m sonicline.geometry.worker tessellate <file> <scale> <out.stl> <size>
    python -m sonicline.geometry.worker extract <file> <scale> <out.step>

Run by :mod:`sonicline.geometry` in a subprocess so a kernel crash on a bad
file cannot take the application down.
"""

from __future__ import annotations

import json
import math
import sys

import numpy as np

from sonicline.geometry import frame


def _init():
    import gmsh

    gmsh.initialize(["-noenv"], readConfigFiles=False)
    gmsh.option.setNumber("General.Terminal", 0)
    gmsh.option.setNumber("General.Verbosity", 1)
    return gmsh


# ----------------------------------------------------------------------------- write


def write(segments_file: str, out: str) -> dict:
    gmsh = _init()
    occ = gmsh.model.occ
    segs = json.load(open(segments_file, encoding="utf-8"))
    mm = 1e3  # STEP is written in millimetres
    pts: dict[tuple, int] = {}

    def point(x, r):
        key = (round(x * mm, 12), round(r * mm, 12))
        if key not in pts:
            pts[key] = occ.addPoint(key[0], key[1], 0.0)
        return pts[key]

    x_in, r_in = segs[0]["x0"], segs[0]["r0"]
    x_e, r_e = segs[-1]["x1"], segs[-1]["r1"]
    curves = [occ.addLine(point(x_in, 0.0), point(x_in, r_in))]
    for s in segs:
        a, b = point(s["x0"], s["r0"]), point(s["x1"], s["r1"])
        if s["kind"] == "arc":
            c = occ.addPoint(s["xc"] * mm, s["rc"] * mm, 0.0)
            curves.append(occ.addCircleArc(a, c, b))
        else:
            curves.append(occ.addLine(a, b))
    curves.append(occ.addLine(point(x_e, r_e), point(x_e, 0.0)))
    curves.append(occ.addLine(point(x_e, 0.0), point(x_in, 0.0)))
    surface = occ.addPlaneSurface([occ.addCurveLoop(curves)])
    occ.revolve([(2, surface)], 0, 0, 0, 1, 0, 0, 2 * math.pi)
    occ.remove([(2, surface)], recursive=True)
    occ.synchronize()
    gmsh.write(out)
    gmsh.finalize()
    return {"ok": True}


# ----------------------------------------------------------------------------- analyse


def _axis_frame(axis):
    a = np.asarray(axis, dtype=float)
    a /= np.linalg.norm(a)
    helper = np.array([1.0, 0.0, 0.0]) if abs(a[0]) < 0.9 else np.array([0.0, 1.0, 0.0])
    u = np.cross(a, helper)
    u /= np.linalg.norm(u)
    return a, u


def analyse(path: str, scale: float, inlet_end: str, n_stations: int) -> dict:
    gmsh = _init()
    occ = gmsh.model.occ
    report = {"ok": False, "kind": "unknown", "volumes": 0, "volume": 0.0, "axisymmetric": False,
              "roundness_min": 0.0, "profile_points": [], "throat_x": None, "throat_radius": None,
              "inlet_end": "min", "inlet_confidence": "low", "errors": [], "warnings": [],
              "axis_origin": None, "axis_direction": None}
    step = path.lower().endswith((".step", ".stp"))
    if step:
        gmsh.option.setString("Geometry.OCCTargetUnit", "M")  # STEP carries its own units
        scale = 1.0
    try:
        occ.importShapes(path)
    except Exception as e:  # noqa: BLE001 - report any kernel error as a finding
        report["errors"].append(f"could not read the file: {e}")
        return report
    occ.synchronize()
    if not occ.getEntities(3):
        # Only repair what needs repairing: healing valid multi-solid input
        # can sew separate bodies into one shell that is no longer a solid.
        occ.healShapes()
        occ.synchronize()
        if occ.getEntities(3):
            report["warnings"].append("the file held no valid solid; surfaces were sewn into one "
                                      "(check the result)")
    if scale != 1.0:
        occ.dilate(occ.getEntities(), 0, 0, 0, scale, scale, scale)
        occ.synchronize()

    vols = occ.getEntities(3)
    report["volumes"] = len(vols)
    if not vols:
        report["errors"].append("the file contains no closed solid: the surfaces do not enclose a "
                                "volume (open or non-watertight geometry)")
        return report
    if len(vols) > 1:
        report["errors"].append(f"the file contains {len(vols)} separate solids; a fluid domain "
                                "must be one connected volume")
        return report
    tag = vols[0][1]
    volume = occ.getMass(3, tag)
    report["volume"] = volume
    if volume <= 0:
        report["errors"].append("the solid has zero or negative volume (inverted or invalid)")
        return report

    com = np.array(occ.getCenterOfMass(3, tag))
    inertia = np.array(occ.getMatrixOfInertia(3, tag)).reshape(3, 3)
    evals, evecs = np.linalg.eigh(inertia)
    distinct = [min(abs(evals[i] - evals[j]) for j in range(3) if j != i) for i in range(3)]
    i_axis = int(np.argmax(distinct))
    axis, perp = _axis_frame(evecs[:, i_axis])
    others = [evals[j] for j in range(3) if j != i_axis]
    if abs(others[0] - others[1]) > 1e-3 * max(abs(others[0]), 1e-300):
        report["warnings"].append("the inertia tensor is not axisymmetric; checking sections")
    pts = np.array([gmsh.model.getValue(0, t, []) for _, t in gmsh.model.getEntities(0)])
    bbox = gmsh.model.getBoundingBox(3, tag)
    span = np.linalg.norm(np.array(bbox[3:]) - np.array(bbox[:3]))

    # Coaxial planar end faces define the axis better than inertia does
    # once anything (a side port, a boss) breaks the symmetry.
    planes = []
    for _, face in gmsh.model.getEntities(2):
        if gmsh.model.getType(2, face) == "Plane":
            lo, hi = gmsh.model.getParametrizationBounds(2, face)
            n = np.array(gmsh.model.getNormal(face, [0.5 * (lo[0] + hi[0]), 0.5 * (lo[1] + hi[1])]))
            planes.append((n / np.linalg.norm(n), np.array(occ.getCenterOfMass(2, face)),
                           occ.getMass(2, face)))
    if len(pts):
        found = frame.end_face_axis(planes, pts, span)
        if found is not None:
            end_axis, on_axis = found
            if abs(float(end_axis @ axis)) < 1.0 - 1e-6:
                report["warnings"].append("the axis through the end faces differs from the inertia "
                                          "axis (the body is not symmetric); the end faces define it")
            axis, perp = _axis_frame(end_axis)
            # The origin moves onto that axis, level with the centroid.
            com = on_axis + float((com - on_axis) @ axis) * axis
    report["axis_origin"] = com.tolist()
    report["axis_direction"] = axis.tolist()
    if len(pts):
        s_all = (pts - com) @ axis
        s_min, s_max = float(s_all.min()), float(s_all.max())
    else:
        corners = np.array([[bbox[i], bbox[j], bbox[k]] for i in (0, 3) for j in (1, 4) for k in (2, 5)])
        s_all = (corners - com) @ axis
        s_min, s_max = float(s_all.min()), float(s_all.max())

    for _, c in gmsh.model.getEntities(1):
        length = occ.getMass(1, c)
        if 0 < length < 1e-6 * span:
            report["warnings"].append(f"curve {c} is only {length:.2e} m long (sliver or tiny feature)")

    def section(s):
        centre = com + s * axis
        big = 2.0 * span
        disk = occ.addDisk(*centre, big, big, zAxis=axis.tolist(), xAxis=perp.tolist())
        try:
            out, _ = occ.intersect([(3, tag)], [(2, disk)], removeObject=False, removeTool=True)
        except Exception:  # noqa: BLE001
            return None
        occ.synchronize()
        surfs = [dt for dt in out if dt[0] == 2]
        area = sum(occ.getMass(2, t) for _, t in surfs)
        radii = []
        for dim, t in gmsh.model.getBoundary(surfs, oriented=False, combined=False, recursive=False):
            lo, hi = gmsh.model.getParametrizationBounds(1, abs(t))
            for u in np.linspace(lo[0], hi[0], 17):
                p = np.array(gmsh.model.getValue(1, abs(t), [u]))
                d = p - com
                radii.append(np.linalg.norm(d - (d @ axis) * axis))
        occ.remove(out, recursive=True)
        occ.synchronize()
        if not surfs or not radii:
            return None
        return area, max(radii), min(radii), len(surfs)

    eps = 1e-4 * (s_max - s_min)
    ss = np.linspace(s_min + eps, s_max - eps, n_stations)
    rows = []
    kinds = set()
    roundness = 1.0
    for s in ss:
        sec = section(s)
        if sec is None:
            continue
        area, r_max, r_min, n_surf = sec
        r_eq = math.sqrt(area / math.pi)
        if r_max <= 0:
            continue
        if n_surf > 1:
            kinds.add("multiple_regions")
        if r_min / r_max < 0.98 and abs(area - math.pi * (r_max**2 - r_min**2)) < 0.02 * area:
            kinds.add("annulus")
        roundness = min(roundness, area / (math.pi * r_max**2))
        rows.append((float(s), r_eq))
    report["roundness_min"] = float(roundness)
    if "annulus" in kinds:
        report["kind"] = "solid_body"
        report["errors"].append(
            "this looks like a solid thruster body with a gas passage through it, not the gas "
            "volume itself: extract the passage (sonicline extract, or Extract in the application) "
            "and confirm it, or export the internal fluid volume from your CAD tool.")
        return report
    report["kind"] = "fluid_volume"
    report["axisymmetric"] = bool(roundness > 0.995)
    report["axis_extent"] = [s_min, s_max]
    if not report["axisymmetric"]:
        report["warnings"].append(
            f"the volume is not a body of revolution (sections reach only {100 * roundness:.1f} % "
            "of a circle's area): it needs the unstructured (Tier 2) mesher, and quasi-1D theory "
            "sees it through the radius of a circle of the same section area")
    if len(rows) < 10:
        report["errors"].append("too few valid cross-sections; the geometry could not be sliced")
        return report

    # Refine the throat: golden-section search on the section radius.
    arr = np.array(rows)
    k = int(np.argmin(arr[:, 1]))
    lo = arr[max(k - 1, 0), 0]
    hi = arr[min(k + 1, len(arr) - 1), 0]
    gr = (math.sqrt(5) - 1) / 2
    f = lambda s: math.sqrt(section(s)[0] / math.pi)  # noqa: E731
    a, b = lo, hi
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

    # End faces: planar faces normal to the axis at either end.
    ends = {}
    for _, face in gmsh.model.getEntities(2):
        if gmsh.model.getType(2, face) != "Plane":
            continue
        c = np.array(occ.getCenterOfMass(2, face))
        s = float((c - com) @ axis)
        n = np.array(gmsh.model.getNormal(face, [0.5, 0.5]))
        if abs(abs(n @ axis) - 1.0) > 1e-6:
            continue
        for end, target in (("min", s_min), ("max", s_max)):
            if abs(s - target) < 1e-6 * span:
                ends[end] = math.sqrt(occ.getMass(2, face) / math.pi)
    if "min" in ends:
        rows.append((s_min, ends["min"]))
    if "max" in ends:
        rows.append((s_max, ends["max"]))
    if len(ends) < 2:
        report["warnings"].append("could not find planar inlet/outlet faces normal to the axis at "
                                  "both ends; the end radii are extrapolated from sections")
    rows.sort()

    # Which end is the inlet? The converging side of a thruster nozzle is
    # steeper than the diverging side, and a chamber sits upstream.
    end, confidence, warnings = frame.choose_inlet_end(rows, s_t, r_t, inlet_end)
    report["inlet_end"], report["inlet_confidence"] = end, confidence
    report["warnings"] += warnings

    # Nozzle frame: x from the inlet towards the exit.
    report["throat_x"] = float(s_t - s_min if end == "min" else s_max - s_t)
    report["profile_points"] = frame.nozzle_profile(rows, s_min, s_max, end)
    report["throat_radius"] = float(r_t)
    report["ok"] = not report["errors"]
    gmsh.finalize()
    return report


# ----------------------------------------------------------------------------- tessellate


def tessellate(path: str, scale: float, out: str, size: float) -> dict:
    """Triangulate the file's surface (metres, in the file's frame) for the
    unstructured mesher: ``size`` is the largest edge, and curved faces get
    at least 48 triangles around a full circle."""
    gmsh = _init()
    occ = gmsh.model.occ
    if path.lower().endswith((".step", ".stp")):
        gmsh.option.setString("Geometry.OCCTargetUnit", "M")
        scale = 1.0
    occ.importShapes(path)
    occ.synchronize()
    if not occ.getEntities(3):
        occ.healShapes()
        occ.synchronize()
    if scale != 1.0:
        occ.dilate(occ.getEntities(), 0, 0, 0, scale, scale, scale)
        occ.synchronize()
    gmsh.option.setNumber("Mesh.MeshSizeMax", size)
    gmsh.option.setNumber("Mesh.MeshSizeMin", size / 20.0)
    gmsh.option.setNumber("Mesh.MeshSizeFromCurvature", 48)
    gmsh.option.setNumber("Mesh.Algorithm", 6)
    gmsh.model.mesh.generate(2)
    gmsh.option.setNumber("Mesh.Binary", 0)
    gmsh.write(out)
    n = len(gmsh.model.mesh.getElementsByType(2)[0])
    gmsh.finalize()
    return {"ok": True, "triangles": n}


# ----------------------------------------------------------------------------- extract


def _loop_extent(gmsh, curves) -> float:
    lo, hi = np.full(3, np.inf), np.full(3, -np.inf)
    for c in curves:
        b = gmsh.model.getBoundingBox(1, abs(c))
        lo, hi = np.minimum(lo, b[:3]), np.maximum(hi, b[3:])
    return float(np.linalg.norm(hi - lo))


def extract(path: str, scale: float, out: str) -> dict:
    """The gas passage of a solid thruster body (DESIGN.md section 3.6):
    cap every hole in the body's planar faces, fragment body and caps inside
    a box, and keep the cavity bounded by two caps -- a passage through the
    body, inlet to exit. A cavity with one cap (a blind hole) is not it;
    the step fails when no cavity or more than one qualifies."""
    gmsh = _init()
    occ = gmsh.model.occ
    report = {"ok": False, "errors": [], "cavities": [], "caps": 0, "chosen": None}
    if path.lower().endswith((".step", ".stp")):
        gmsh.option.setString("Geometry.OCCTargetUnit", "M")
        scale = 1.0
    occ.importShapes(path)
    occ.synchronize()
    if scale != 1.0:
        occ.dilate(occ.getEntities(), 0, 0, 0, scale, scale, scale)
        occ.synchronize()
    vols = occ.getEntities(3)
    if len(vols) != 1:
        report["errors"].append(f"expected one solid body, found {len(vols)}")
        return report
    body = vols[0][1]
    caps = []
    for _, face in gmsh.model.getBoundary([(3, body)], oriented=False):
        if gmsh.model.getType(2, abs(face)) != "Plane":
            continue
        _, loop_curves = occ.getCurveLoops(abs(face))
        if len(loop_curves) < 2:
            continue
        # The largest loop bounds the face; the others are holes in it.
        extents = [_loop_extent(gmsh, list(c)) for c in loop_curves]
        outer = int(np.argmax(extents))
        for i, curves in enumerate(loop_curves):
            if i != outer:
                caps.append(occ.addPlaneSurface([occ.addCurveLoop([abs(int(c)) for c in curves])]))
    occ.synchronize()
    report["caps"] = len(caps)
    if not caps:
        report["errors"].append("the body has no openings in flat faces to cap; export the gas volume "
                                "from your CAD tool instead")
        return report
    b = gmsh.model.getBoundingBox(3, body)
    pad = 0.1 * max(b[3] - b[0], b[4] - b[1], b[5] - b[2])
    box = occ.addBox(b[0] - pad, b[1] - pad, b[2] - pad, b[3] - b[0] + 2 * pad, b[4] - b[1] + 2 * pad,
                     b[5] - b[2] + 2 * pad)
    tools = [(3, body)] + [(2, c) for c in caps]
    _, mapping = occ.fragment([(3, box)], tools)
    occ.synchronize()
    body_vols = {t for d, t in mapping[1] if d == 3}
    cap_faces = [{t for d, t in mapping[2 + i] if d == 2} for i in range(len(caps))]
    outside, cavities = set(), []
    for _, v in occ.getEntities(3):
        if v in body_vols:
            continue
        bb = gmsh.model.getBoundingBox(3, v)
        if bb[0] <= b[0] - 0.5 * pad:  # reaches the box: the outside
            outside.add(v)
        else:
            cavities.append(v)
    # A hole in a flat face is not always an opening. A stepped bore (a
    # pilot drilled through to a wider entry) has a flat floor at the step
    # with the pilot as a hole in it, and its cap lies inside the passage,
    # with gas on both sides: it splits one passage into two cavities. Such
    # caps are internal: the cavities they separate are one, and only caps
    # with the outside on one side count as openings.
    group = {v: v for v in cavities}

    def root(v):
        while group[v] != v:
            group[v] = group[group[v]]
            v = group[v]
        return v

    openings: dict[int, set[int]] = {}  # cavity -> caps it opens to the outside through
    for i, faces in enumerate(cap_faces):
        for f in faces:
            up = set(gmsh.model.getAdjacencies(2, f)[0])
            inner = [v for v in up if v in group]
            if len(inner) == 2:
                group[root(inner[0])] = root(inner[1])
            elif len(inner) == 1 and up & outside:
                openings.setdefault(inner[0], set()).add(i)
    members: dict[int, list[int]] = {}
    for v in cavities:
        members.setdefault(root(v), []).append(v)
    candidates = []
    for r, vs in members.items():
        n_caps = len(set().union(*(openings.get(v, set()) for v in vs)))
        candidates.append({"tags": vs, "volume": float(sum(occ.getMass(3, v) for v in vs)), "caps": n_caps})
    report["cavities"] = [{k: c[k] for k in ("volume", "caps")} for c in candidates]
    report["internal_caps"] = sum(len(vs) - 1 for vs in members.values())
    through = [c for c in candidates if c["caps"] >= 2]
    if len(through) != 1:
        what = "no" if not through else f"{len(through)}"
        report["errors"].append(f"{what} passage(s) through the body from one opening to another; "
                                f"{len(candidates)} closed cavities in all")
        return report
    keep = through[0]["tags"]
    occ.remove([(3, v) for _, v in occ.getEntities(3) if v not in keep], recursive=True)
    if len(keep) > 1:
        occ.fuse([(3, keep[0])], [(3, v) for v in keep[1:]])
    occ.synchronize()
    gmsh.write(out)
    gmsh.finalize()
    report["chosen"] = {k: through[0][k] for k in ("volume", "caps")}
    report["ok"] = True
    return report


def main(argv: list[str]) -> int:
    if argv[0] == "extract":
        print(json.dumps(extract(argv[1], float(argv[2]), argv[3])))
    elif argv[0] == "tessellate":
        print(json.dumps(tessellate(argv[1], float(argv[2]), argv[3], float(argv[4]))))
    elif argv[0] == "write":
        print(json.dumps(write(argv[1], argv[2])))
    elif argv[0] == "analyse":
        print(json.dumps(analyse(argv[1], float(argv[2]), argv[3], int(argv[4]))))
    else:
        print(f"unknown command {argv[0]!r}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
