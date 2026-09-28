#!/usr/bin/env python3
"""
STARSHIP — a parametric CAD model of SpaceX's Starship V3 stacked on Super
Heavy, built with CadQuery (OpenCascade) and exported as STEP and STL.

Everything is modelled at full scale in metres from public figures, then
scaled down on export. Features too fine to survive the chosen scale (engine
bell walls, grid fin webs, skirt walls) are thickened to a printable minimum;
see README.md for what that changes and for every dimension that is an
estimate rather than a published number.

    pip install cadquery
    python3 starship/build_model.py              # 1:500, ~249 mm tall
    python3 starship/build_model.py --scale 200  # 1:200, ~622 mm tall

Axes: +Z up the stack; +X is the ship's windward (heat shield) side, so the
ship's flaps sit on the ±Y tile line. The origin is the booster's engine exit
plane on the centreline.
"""

import argparse
import math
from pathlib import Path

import cadquery as cq
import numpy as np
from cadquery import Vector

# ---------------------------------------------------------------------------
# Published figures (Starship V3 / Block 3)
# ---------------------------------------------------------------------------
R_HULL = 4.5            # 9 m outer diameter, both stages
H_BOOSTER = 72.3        # Super Heavy Block 3, engine exits to top of interstage
H_SHIP = 52.1           # Starship V3 ship (124.4 m stack - 72.3 m booster)
RAPTOR_LEN = 3.1        # Raptor 3 sea-level engine length
RAPTOR_DIA = 1.3        # Raptor 3 sea-level engine diameter

# ---------------------------------------------------------------------------
# Estimates from photographs and renders (not published) — see README
# ---------------------------------------------------------------------------
RVAC_LEN = 4.6          # Raptor Vacuum overall length
RVAC_EXIT_R = 1.2       # Raptor Vacuum nozzle exit radius
NOSE_LEN = 17.0         # ship ogive, base to tip

BOOSTER_SKIRT_BOTTOM = 0.9   # lower lip of the aft skirt, above engine exits
BOOSTER_AFT_PLATE = 2.3      # engine bay heat shield / thrust puck level
INTERSTAGE_H = 2.4           # integrated hot-staging adapter at the top
GRID_FIN_Z = 63.0            # V3 fins moved down the forward tank
SHIP_SKIRT_H = 3.2           # ship aft skirt that shrouds its six engines


class Model:
    """Holds the scale and the printable-minimum clamp, and builds parts."""

    def __init__(self, scale_denom: float, min_wall_mm: float):
        self.scale_denom = scale_denom
        self.mm_per_m = 1000.0 / scale_denom
        # Thinnest wall, in real metres, that still prints at this scale.
        self.min_wall = min_wall_mm / self.mm_per_m

    def wall(self, real_m: float) -> float:
        """A wall thickness: the real value, or the printable minimum."""
        return max(real_m, self.min_wall)


# ---------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------
def rz(r, z):
    return Vector(r, 0, z)


def revolve(segments):
    """Revolve a closed (r, z) profile about the Z axis.

    `segments` is a list of ("line" | "spline" | "arc", [(r, z), ...]) pieces
    laid end to end; each piece starts where the previous one ended. An arc
    is given by three points; a spline piece may be ("spline", pts,
    (t_start, t_end)) with (r, z) tangent directions.
    """
    edges = []
    for seg in segments:
        kind, pts = seg[0], seg[1]
        vecs = [rz(*p) for p in pts]
        if kind == "arc":
            edges.append(cq.Edge.makeThreePointArc(*vecs))
        elif kind == "line":
            for a, b in zip(vecs, vecs[1:]):
                if (a - b).Length > 1e-9:
                    edges.append(cq.Edge.makeLine(a, b))
        else:
            tangents = None
            if len(seg) > 2:
                tangents = [rz(*seg[2][0]), rz(*seg[2][1])]
            edges.append(cq.Edge.makeSpline(vecs, tangents=tangents))
    wire = cq.Wire.assembleEdges(edges)
    return cq.Solid.revolve(wire, [], 360, Vector(0, 0, 0), Vector(0, 0, 1))


def prism_xy(points, z0, z1):
    """Extrude a polygon given in the XY plane from z0 to z1."""
    wire = cq.Wire.makePolygon([Vector(x, y, z0) for x, y in points], close=True)
    return cq.Solid.extrudeLinear(wire, [], Vector(0, 0, z1 - z0))


def plate_yz(points, x0, thickness):
    """A flat plate: polygon in the YZ plane at x0, `thickness` thick in +X."""
    wire = cq.Wire.makePolygon([Vector(x0, y, z) for y, z in points], close=True)
    return cq.Solid.extrudeLinear(wire, [], Vector(thickness, 0, 0))


def box(x0, x1, y0, y1, z0, z1):
    return cq.Solid.makeBox(x1 - x0, y1 - y0, z1 - z0, Vector(x0, y0, z0))


def spin(shape, degrees):
    return shape.rotate(Vector(0, 0, 0), Vector(0, 0, 1), degrees)


def fuse(shapes):
    shapes = list(shapes)
    out = shapes[0].fuse(*shapes[1:]) if len(shapes) > 1 else shapes[0]
    return out.clean()


def wedge(deg_from, deg_to, z0, z1, reach=50.0):
    """A pie-slice prism about the Z axis, for cutting angular sectors."""
    n = max(2, int(abs(deg_to - deg_from) / 10) + 1)
    pts = [(0.0, 0.0)]
    for i in range(n + 1):
        a = math.radians(deg_from + (deg_to - deg_from) * i / n)
        pts.append((reach * math.cos(a), reach * math.sin(a)))
    return prism_xy(pts, z0, z1)


# ---------------------------------------------------------------------------
# Engines
# ---------------------------------------------------------------------------
def engine(m: Model, exit_r, bell_len, head_len, head_r, throat_r):
    """A Raptor: a bell nozzle with a hollowed exit, capped by a powerhead.

    Exit plane at z=0, powerhead on top. The bell is hollowed as deep as the
    (clamped) wall thickness allows, so the nozzle reads as a nozzle.
    """
    wall = m.wall(0.02)
    n = 10
    outer = []
    for i in range(n + 1):
        s = i / n                                   # 0 at throat, 1 at exit
        r = throat_r + (exit_r - throat_r) * s ** 0.6
        outer.append((r, bell_len * (1 - s)))
    top = bell_len + head_len
    prof = [("line", [(0, top), (head_r, top), (head_r, bell_len + 0.15 * head_len),
                      (throat_r * 1.4, bell_len), (throat_r, bell_len * 0.97)])]
    outer[0] = (throat_r, bell_len * 0.97)
    prof.append(("spline", outer))
    if exit_r - wall > 0.35 * exit_r:
        # Hollow the bell: inner surface parallel to the outer one, stopping
        # where it would pinch shut.
        inner = []
        for r, z in reversed(outer):
            if r - wall < 0.3 * exit_r:
                break
            inner.append((r - wall, z))
        stop_z = inner[-1][1]
        prof.append(("line", [outer[-1], inner[0]]))
        if len(inner) >= 2:
            prof.append(("spline", inner))
        prof.append(("line", [inner[-1], (0, stop_z), (0, top)]))
    else:
        prof.append(("line", [outer[-1], (0, 0), (0, top)]))
    return revolve(prof)


def raptor_sl(m: Model):
    # 1.3 m is the engine's overall diameter; the nozzle exit is a little
    # smaller, which is what lets 20 of them ring the booster's aft end.
    return engine(m, exit_r=0.59, bell_len=1.9, head_len=RAPTOR_LEN - 1.9,
                  head_r=RAPTOR_DIA / 2 * 0.8, throat_r=0.2)


def raptor_vac(m: Model):
    return engine(m, exit_r=RVAC_EXIT_R, bell_len=3.4, head_len=RVAC_LEN - 3.4,
                  head_r=0.55, throat_r=0.2)


# ---------------------------------------------------------------------------
# Super Heavy
# ---------------------------------------------------------------------------
def grid_fin(m: Model):
    """One V3 grid fin in local axes: X radial (0 at the hull), Y across,
    Z along the flow. Air flows through the lattice cells, so the panel
    lies flat, normal to the vehicle axis."""
    span, width, depth = 4.2, 3.6, 0.9      # estimates, 50% up on V2's area
    frame = m.wall(0.22)
    web = m.wall(0.07)
    pitch = max(0.62, 3.5 * web)            # coarsen the lattice if webs grow
    outer = box(0, span, -width / 2, width / 2, -depth / 2, depth / 2)
    inner = box(frame, span - frame, -width / 2 + frame, width / 2 - frame,
                -depth, depth)
    # Diamond cells: squares rotated 45 degrees in the panel plane.
    half = (pitch - web * math.sqrt(2)) / 2 * math.sqrt(2)
    cells = []
    nx = int(span / pitch) + 2
    ny = int(width / pitch) + 2
    for i in range(-1, nx + 1):
        for j in range(-ny, ny + 1):
            cx = i * pitch + (pitch / 2 if j % 2 else 0)
            cy = j * pitch / 2
            if not (-pitch < cx < span + pitch and abs(cy) < width / 2 + pitch):
                continue
            d = [(cx + half, cy), (cx, cy + half), (cx - half, cy), (cx, cy - half)]
            cells.append(prism_xy(d, -depth, depth))
    holes = fuse(cells).intersect(inner)
    fin = outer.cut(holes)
    # Root fitting: the hinge and actuator housing against the hull.
    root = box(-0.4, 0.5, -1.0, 1.0, -1.0, 0.8)
    return fuse([fin, root])


def super_heavy(m: Model):
    top = H_BOOSTER
    tank_top = top - INTERSTAGE_H
    skirt_wall = m.wall(0.06)
    parts = []

    # Aft skirt, solid tank body, and the forward dome under the interstage.
    parts.append(revolve([("line", [
        (0, BOOSTER_AFT_PLATE), (R_HULL - skirt_wall, BOOSTER_AFT_PLATE),
        (R_HULL - skirt_wall, BOOSTER_SKIRT_BOTTOM), (R_HULL, BOOSTER_SKIRT_BOTTOM),
        (R_HULL, tank_top), (R_HULL - 0.05, tank_top)]),
        ("spline", [(R_HULL - 0.05, tank_top), (3.6, tank_top + 0.8),
                    (0, tank_top + 1.35)], ((0, 1), (-1, 0))),
        ("line", [(0, tank_top + 1.35), (0, BOOSTER_AFT_PLATE)])]))

    # Integrated hot-staging adapter: an open ring with vent windows, the
    # forward dome visible through them.
    ring_wall = m.wall(0.08)
    ring = revolve([("line", [(R_HULL - ring_wall, tank_top - 0.2), (R_HULL, tank_top - 0.2),
                              (R_HULL, top), (R_HULL - ring_wall, top),
                              (R_HULL - ring_wall, tank_top - 0.2)])])
    vents = []
    n_vents = 12
    for i in range(n_vents):
        w = 1.35
        v = box(R_HULL - 1.0, R_HULL + 1.0, -w / 2, w / 2, tank_top + 0.35, top - 0.45)
        vents.append(spin(v, 360 / n_vents * (i + 0.5)))
    parts.append(ring.cut(fuse(vents)))

    # 33 Raptor 3s: 3 centre, 10 inner gimballing ring, 20 fixed outer ring.
    eng = raptor_sl(m)
    for n, radius, phase in ((3, 0.92, 90), (10, 2.5, 0), (20, 3.87, 9)):
        for i in range(n):
            a = math.radians(phase + 360 * i / n)
            parts.append(eng.translate(Vector(radius * math.cos(a), radius * math.sin(a), 0)))

    # Grid fins: three, 120 degrees apart.
    fin = grid_fin(m)
    for a in (60, 180, 300):
        parts.append(spin(fin.translate(Vector(R_HULL - 0.1, 0, GRID_FIN_Z)), a))

    # Catch hardpoints under the forward dome, between the fins.
    for a in (120, 240):
        hp = box(R_HULL - 0.2, R_HULL + 0.55, -0.45, 0.45, tank_top - 3.3, tank_top - 2.5)
        parts.append(spin(hp, a))

    # Cable / plumbing raceway, full length on the +X side.
    rw_h, rw_w = 0.35, 0.9
    parts.append(prism_xy([(R_HULL - 0.2, -rw_w / 2), (R_HULL + rw_h, -rw_w / 2 + 0.12),
                           (R_HULL + rw_h, rw_w / 2 - 0.12), (R_HULL - 0.2, rw_w / 2)],
                          BOOSTER_SKIRT_BOTTOM + 0.3, tank_top - 0.4))

    # Aft chines: two strakes along the LOX tank, tapered at the top.
    t = m.wall(0.3)
    for a in (90, 270):
        chine = plate_yz([(R_HULL - 0.2, BOOSTER_SKIRT_BOTTOM + 0.2), (R_HULL + 0.55, BOOSTER_SKIRT_BOTTOM + 0.2),
                          (R_HULL + 0.55, 24.0), (R_HULL - 0.2, 28.0)], -t / 2, t)
        parts.append(spin(chine, a - 90))

    return fuse(parts)


# ---------------------------------------------------------------------------
# Starship (upper stage)
# ---------------------------------------------------------------------------
NOSE_TIP_R = 1.5         # spherical blunting of the ogive tip (estimate)


def _nose_geometry():
    """Solve the spherically blunted tangent ogive that is exactly NOSE_LEN
    long: returns (rho, zc, tangent point) with z measured from the nose base.
    The ogive arc is centred at (R - rho, 0); the tip sphere at (0, zc)."""
    R, L, rn = R_HULL, NOSE_LEN, NOSE_TIP_R

    def length(rho):
        return math.sqrt((rho - rn) ** 2 - (rho - R) ** 2) + rn

    lo, hi = R + 1e-6, 1e4
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if length(mid) < L else (lo, mid)
    rho = (lo + hi) / 2
    zc = length(rho) - rn
    # Tangent point: on the line from the ogive centre through the sphere centre.
    dx, dz = 0 - (R - rho), zc
    k = rho / math.hypot(dx, dz)
    return rho, zc, ((R - rho) + dx * k, dz * k)


def nose_segments(z0, offset=0.0):
    """Revolve segments for the nose, base (R, z0) to tip on the axis, as two
    exact arcs. `offset` grows the surface normally (for the heat shield)."""
    rho, zc, _ = _nose_geometry()
    cx = R_HULL - rho
    ro, rs = rho + offset, NOSE_TIP_R + offset

    def on_ogive(t):              # t: 0 at base, 1 at the tangent point
        a_end = math.atan2(zc, -cx)
        a = a_end * t
        return (cx + ro * math.cos(a), z0 + ro * math.sin(a))

    tang = on_ogive(1)
    a_t = math.atan2(tang[1] - z0 - zc, tang[0])
    a_m = (a_t + math.pi / 2) / 2
    return [
        ("arc", [on_ogive(0), on_ogive(0.5), tang]),
        ("arc", [tang, (rs * math.cos(a_m), z0 + zc + rs * math.sin(a_m)), (0, z0 + zc + rs)]),
    ]


def nose_radius(z, z0):
    rho, zc, tang = _nose_geometry()
    h = z - z0
    if h <= 0:
        return R_HULL
    if h <= tang[1]:
        return (R_HULL - rho) + math.sqrt(rho * rho - h * h)
    return math.sqrt(max(NOSE_TIP_R ** 2 - (h - zc) ** 2, 0))


def hull_solid(z_bottom, z_nose, offset=0.0):
    nose = nose_segments(z_nose, offset)
    tip = nose[-1][1][-1]
    return revolve([("line", [(0, z_bottom), (R_HULL + offset, z_bottom), (R_HULL + offset, z_nose)])]
                   + nose + [("line", [tip, (0, z_bottom)])])


def starship(m: Model):
    z_nose = H_SHIP - NOSE_LEN
    skirt_wall = m.wall(0.06)
    parts = []

    # Aft skirt around the engines, then the solid hull and ogive nose.
    body = hull_solid(SHIP_SKIRT_H, z_nose)
    skirt = revolve([("line", [(R_HULL - skirt_wall, 0), (R_HULL, 0), (R_HULL, SHIP_SKIRT_H + 0.1),
                               (R_HULL - skirt_wall, SHIP_SKIRT_H + 0.1), (R_HULL - skirt_wall, 0)])])
    parts += [body, skirt]

    # Engines: 3 sea-level Raptors in the middle, 3 Raptor Vacuums outboard.
    sl = raptor_sl(m)
    for i in range(3):
        a = math.radians(60 + 120 * i)
        parts.append(sl.translate(Vector(1.05 * math.cos(a), 1.05 * math.sin(a), 1.0)))
    vac = raptor_vac(m)
    for i in range(3):
        a = math.radians(120 * i)
        parts.append(vac.translate(Vector(3.05 * math.cos(a), 3.05 * math.sin(a), 0.1)))

    # Heat shield: the windward half, a little over 180 degrees, raised off
    # the steel so it reads as a separate surface (tiles are ~0.08 m thick).
    shield_t = m.wall(0.08) if m.min_wall < 0.2 else max(0.08, 0.2 / m.mm_per_m)
    shield = hull_solid(0.4, z_nose, shield_t).intersect(wedge(-96, 96, 0, H_SHIP + 1))
    shield = shield.cut(hull_solid(0.0, z_nose))

    # Aft flaps on the tile line (±Y), with their hinge fairings on the
    # leeward side. The flap plane faces the windward flow.
    flap_t = m.wall(0.4)
    for side in (1, -1):
        pts = [(R_HULL - 0.3, 1.2), (R_HULL + 4.1, 1.2), (R_HULL + 4.1, 8.3), (R_HULL + 1.2, 11.0),
               (R_HULL - 0.3, 12.6)]
        flap = plate_yz([(side * y, z) for y, z in pts], -flap_t / 2, flap_t)
        fairing = box(-1.1, -0.1, R_HULL - 0.4, R_HULL + 0.55, 0.9, 13.4)
        if side < 0:
            fairing = fairing.mirror("XZ")
        parts += [flap, fairing]

    # Forward flaps: smaller, shifted leeward (V2/V3 layout) so the hinges sit
    # out of the plasma, on the ogive.
    x_leeward = -1.1
    ff_t = m.wall(0.3)
    zf0, zf1 = z_nose + 2.2, z_nose + 11.2
    for side in (1, -1):
        root = []
        for k in range(7):
            z = zf1 - (zf1 - zf0) * k / 6
            y = math.sqrt(max(nose_radius(z, z_nose) ** 2 - x_leeward ** 2, 0.1)) - 0.35
            root.append((y, z))
        y_root_bottom = root[-1][0]
        tip = [(y_root_bottom + 3.0, zf0 + 0.2), (y_root_bottom + 3.0, zf0 + 3.6),
               (root[0][0] + 0.9, zf1 - 0.4)]
        pts = [root[-1]] + tip + root[:-1]
        pts = [(side * y, z) for y, z in pts]
        parts.append(plate_yz(pts, x_leeward - ff_t / 2, ff_t))
        # Hinge fairing on the leeward face, hugging the ogive along the root.
        x_f = x_leeward - 0.1
        edge = []
        for k in range(7):
            z = zf0 - 0.3 + (zf1 - zf0 + 0.3) * k / 6
            y = math.sqrt(max(nose_radius(z, z_nose) ** 2 - x_f ** 2, 0.1))
            edge.append((y, z))
        fpts = [(y - 0.4, z) for y, z in edge] + [(y + 0.4, z) for y, z in reversed(edge)]
        parts.append(plate_yz([(side * y, z) for y, z in fpts], x_leeward - 0.75, 0.65))

    # Chines: low strakes along the tile line between the flaps.
    ch_t = m.wall(0.3)
    for side in (1, -1):
        ch = box(-ch_t / 2, ch_t / 2, R_HULL - 0.2, R_HULL + 0.35, 13.0, z_nose + 0.5)
        if side < 0:
            ch = ch.mirror("XZ")
        parts.append(ch)

    # V3 catch pins for the tower chopsticks, just leeward of the tile line.
    for side in (1, -1):
        pin = cq.Solid.makeCylinder(0.35, 1.0, Vector(-1.4, side * (R_HULL - 0.4), z_nose - 1.8),
                                    Vector(0, side, 0))
        parts.append(pin)

    steel = fuse(parts)
    shield = shield.cut(steel)
    return steel, shield


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------
def drop_degenerate_triangles(path: Path):
    """OCCT leaves zero-area slivers where a revolved profile meets the axis;
    slicers shrug them off, but they make the mesh read as non-manifold."""
    rec = np.dtype([("n", "<f4", 3), ("v", "<f4", (3, 3)), ("a", "<u2")])
    data = path.read_bytes()
    n = int.from_bytes(data[80:84], "little")
    tris = np.frombuffer(data[84:84 + 50 * n], dtype=rec)
    v = tris["v"].astype(np.float64)
    area = np.linalg.norm(np.cross(v[:, 1] - v[:, 0], v[:, 2] - v[:, 0]), axis=1)
    keep = tris[area > 1e-12]
    path.write_bytes(data[:80] + len(keep).to_bytes(4, "little") + keep.tobytes())


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--scale", type=float, default=500, help="scale denominator (default 1:500)")
    ap.add_argument("--min-wall", type=float, default=0.8,
                    help="thinnest printable wall at the output scale, mm (default 0.8)")
    ap.add_argument("--out", type=Path, default=Path(__file__).parent / "models")
    args = ap.parse_args()

    m = Model(args.scale, args.min_wall)
    tag = f"1-{args.scale:g}"
    args.out.mkdir(parents=True, exist_ok=True)

    print(f"scale 1:{args.scale:g}  ({m.mm_per_m:.3f} mm per metre, "
          f"min wall {m.min_wall:.2f} m real)")
    print("building Super Heavy ...")
    booster = super_heavy(m)
    print("building Starship ...")
    ship_steel, ship_shield = starship(m)

    s = m.mm_per_m
    lift = Vector(0, 0, H_BOOSTER)
    booster_mm = booster.scale(s)
    ship_mm = ship_steel.translate(lift).scale(s)
    shield_mm = ship_shield.translate(lift).scale(s)

    # STEP: an assembly with named, coloured bodies (stainless and tile black).
    steel = cq.Color(0.78, 0.79, 0.81)
    tiles = cq.Color(0.08, 0.08, 0.09)
    asm = cq.Assembly(name="starship_v3_stack")
    asm.add(booster_mm, name="super_heavy", color=steel)
    asm.add(ship_mm, name="starship", color=steel)
    asm.add(shield_mm, name="heat_shield", color=tiles)
    step_path = args.out / f"starship_stack_{tag}.step"
    asm.export(str(step_path))
    print("wrote", step_path)
    # GLB of the same assembly, for the browser viewer (index.html).
    glb_path = args.out / "starship_stack.glb"
    asm.export(str(glb_path), tolerance=0.01 * s, angularTolerance=0.12)
    print("wrote", glb_path)

    # STL: watertight single bodies for printing — the stack, and each stage
    # on its own (the stack is tall enough that most printers want it split).
    tol = 0.01 * (500 / args.scale) ** 0.5 * 2
    ship_print = fuse([ship_mm, shield_mm])
    stack = fuse([booster_mm, ship_print])
    for shape, name in ((stack, "starship_stack"), (booster_mm, "super_heavy"),
                        (ship_print, "starship_ship")):
        path = args.out / f"{name}_{tag}.stl"
        shape.exportStl(str(path), tolerance=tol, angularTolerance=0.15)
        drop_degenerate_triangles(path)
        bb = shape.BoundingBox()
        print(f"wrote {path}  ({bb.xlen:.1f} x {bb.ylen:.1f} x {bb.zlen:.1f} mm, "
              f"valid={shape.isValid()})")


if __name__ == "__main__":
    main()
