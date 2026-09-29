#!/usr/bin/env python3
"""
STARSHIP — a parametric CAD model of SpaceX's Starship V3 stacked on Super
Heavy, built with CadQuery (OpenCascade) and exported as STEP and STL.

Everything is modelled at full scale in metres from SpaceX's published
figures and from measurements taken off photographs of Ship 39/40 and
B19/B20, then scaled down on export. The vehicle is built twice: once at true
thicknesses for the STEP (CAD) and the viewer's GLB, and once for printing,
with anything thinner than --min-wall thickened and the finest details
dropped. README.md lists what is published, measured or estimated.

    pip install cadquery
    python3 starship/build_model.py              # 1:500, ~249 mm tall
    python3 starship/build_model.py --scale 200  # 1:200, ~622 mm tall

Axes: +Z up the stack; +X is the ship's windward (heat shield) side, so the
ship's flaps sit on the ±Y tile line. The origin is the booster's engine exit
plane on the centreline.
"""

import argparse
import gc
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
RAPTOR_LEN = 3.1        # Raptor 3 sea-level engine length (3.05 measured)
RAPTOR_DIA = 1.3        # Raptor 3 sea-level nozzle exit



class Model:
    """Holds the scale and the printable-minimum clamp, and builds parts."""

    def __init__(self, scale_denom: float, min_wall_mm: float, shell_mm: float = 0.0):
        self.scale_denom = scale_denom
        self.mm_per_m = 1000.0 / scale_denom
        # Thinnest wall, in real metres, that still prints at this scale.
        self.min_wall = min_wall_mm / self.mm_per_m
        # How far a painted-on feature (the heat shield, a door outline) must
        # stand proud or sink to survive printing: 0.2 mm, or nothing for the
        # true-thickness CAD model.
        self.relief = 0.2 / self.mm_per_m if min_wall_mm > 0 else 0.0
        # Both stages are hollow, with a wall this thick (real metres), so the
        # model prints light and fast; 0 leaves them solid.
        self.shell = shell_mm / self.mm_per_m

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
    # Merging coplanar faces tidies the STEP, but on a few curved seams it
    # corrupts the solid; keep the unmerged result when that happens.
    cleaned = out.clean()
    return cleaned if cleaned.isValid() else out


def wedge(deg_from, deg_to, z0, z1, reach=50.0):
    """A pie-slice prism about the Z axis, for cutting angular sectors."""
    n = max(2, int(abs(deg_to - deg_from) / 10) + 1)
    pts = [(0.0, 0.0)]
    for i in range(n + 1):
        a = math.radians(deg_from + (deg_to - deg_from) * i / n)
        pts.append((reach * math.cos(a), reach * math.sin(a)))
    return prism_xy(pts, z0, z1)


def radial_plate(points, t0, t1):
    """A plate in the X-Z plane given as (radius, z) points, spanning y from
    t0 to t1: build a feature at azimuth 0 and spin() it into place."""
    wire = cq.Wire.makePolygon([Vector(x, t0, z) for x, z in points], close=True)
    return cq.Solid.extrudeLinear(wire, [], Vector(0, t1 - t0, 0))


def radial_cylinder(r, z, x0, x1, y=0.0):
    """A cylinder pointing radially outward at azimuth 0, from x0 to x1."""
    return cq.Solid.makeCylinder(r, x1 - x0, Vector(x0, y, z), Vector(1, 0, 0))


def both_sides(shape, az):
    """The feature at +az and its mirror image at -az."""
    placed = spin(shape, az)
    return [placed, placed.mirror("XZ")]


# ---------------------------------------------------------------------------
# Engines
# ---------------------------------------------------------------------------
# Raptor 3 outer silhouette, measured off SpaceX's side-on photo of Raptors
# 1, 2 and 3 (scaled by the 1.30 m exit). (radius, depth below engine top).
# Top down: inlet, bolted flange, the upper powerhead block with its bolt
# ring, the main manifold disk (the widest part of the head), the stacked
# manifold tori, the neck around the throat, the nozzle manifold band.
RAPTOR_HEAD = [
    (0.12, 0.00), (0.12, 0.14), (0.235, 0.14), (0.235, 0.28), (0.24, 0.28),
    (0.24, 0.63), (0.29, 0.63), (0.29, 0.70), (0.24, 0.70), (0.24, 0.87),
    (0.34, 0.87), (0.34, 0.99), (0.27, 0.99), (0.29, 1.06), (0.27, 1.13),
    (0.29, 1.20), (0.26, 1.28), (0.22, 1.31), (0.22, 1.50),
]
# Sea-level bell outer jacket below the manifold band, same photo.
RAPTOR_SL_BELL = [(0.40, 1.72), (0.41, 1.80), (0.50, 1.96), (0.56, 2.12),
                  (0.61, 2.38), (0.64, 2.66), (0.65, 3.05)]
# Raptor Vacuum: the same powerhead, a regeneratively cooled section down to
# a manifold ring, then the long nozzle extension (2.3 m exit, ~4.1 m long).
RVAC_BELL = [(0.44, 1.72), (0.46, 1.82), (0.60, 2.05), (0.72, 2.35), (0.79, 2.58)]
RVAC_RING = [(0.79, 2.58), (0.84, 2.60), (0.84, 2.70), (0.80, 2.72)]
RVAC_EXTENSION = [(0.80, 2.72), (0.93, 3.05), (1.03, 3.40), (1.10, 3.75), (1.15, 4.10)]


def engine(m: Model, bell, extra_rings=(), pipes=True):
    """A Raptor with its exit plane at z=0 and powerhead on top.

    The bell is hollow to the depth the wall thickness allows. The side pump
    pod and the hot-gas duct that loops down to the nozzle manifold are added
    only when they are big enough to exist at this scale.
    """
    length = bell[-1][1]
    zz = lambda d: length - d
    wall = m.wall(0.025)
    exit_r = bell[-1][0]

    prof = [("line", [(0, zz(0))] + [(r, zz(d)) for r, d in RAPTOR_HEAD] +
             [(bell[0][0], zz(bell[0][1]))])]
    body = [(r, zz(d)) for r, d in bell]
    prof.append(("spline", body))
    if exit_r - wall > 0.12:
        # Hollow the bell with an inner surface parallel to the outer one,
        # stopping where it would pinch shut.
        inner = [(r - wall, z) for r, z in reversed(body) if r - wall > 0.12]
        prof.append(("line", [body[-1], inner[0]]))
        if len(inner) >= 2:
            prof.append(("spline", inner))
        prof.append(("line", [inner[-1], (0, inner[-1][1]), (0, zz(0))]))
    else:
        prof.append(("line", [body[-1], (0, 0), (0, zz(0))]))
    parts = [revolve(prof)]
    for ring in extra_rings:
        parts.append(revolve([("line", [(0, zz(ring[0][1]))] + [(r, zz(d)) for r, d in ring]
                               + [(0, zz(ring[-1][1])), (0, zz(ring[0][1]))])]))

    if pipes and m.min_wall <= 0.12:
        # Offset turbopump pod, and the hot-gas duct from it down to the
        # nozzle manifold band (the big black U-pipe in every photo).
        parts.append(cq.Solid.makeCylinder(0.14, 0.45, Vector(0.40, 0, zz(0.85))))
        pts = [Vector(0.40, 0, zz(0.84)), Vector(0.50, 0.02, zz(1.10)),
               Vector(0.44, 0.05, zz(1.45)), Vector(0.30, 0.03, zz(1.72))]
        path = cq.Wire.assembleEdges([cq.Edge.makeSpline(pts)])
        tangent = path.tangentAt(0)
        circle = cq.Wire.makeCircle(max(0.07, m.min_wall / 2), pts[0], tangent)
        parts.append(cq.Solid.sweep(circle, [], path, True, True))
    return fuse(parts)


def raptor_sl(m: Model, pipes=True):
    return engine(m, RAPTOR_SL_BELL, pipes=pipes)


def sl_len():
    return RAPTOR_SL_BELL[-1][1]


def raptor_vac(m: Model):
    return engine(m, RVAC_BELL + RVAC_EXTENSION[1:], extra_rings=[RVAC_RING])


# ---------------------------------------------------------------------------
# Super Heavy
# ---------------------------------------------------------------------------
# Heights are from the engine exit plane. Azimuths use the ship's frame: the
# single "rudder" grid fin is on the ship's heat-shield side (0 deg); the
# tower, and the chopsticks' approach, is at 180 deg.
BOOSTER_LIP = 2.75       # bottom of the aft barrel: engines hang 2.75 m below it
HOT_STAGE_H = 3.0        # integrated hot-staging truss, top ring to lower pins
FIN_TOP_Z = H_BOOSTER - 6.6


def grid_fin(m: Model, catch=False):
    """One V3 grid fin in local axes: X radial (0 at the hull), Y across,
    Z along the flow (top face at 0). Air flows through the diamond lattice,
    so the panel lies flat, normal to the vehicle axis."""
    span, width, depth = 4.3, 3.5, 0.36            # measured (+-0.3 m)
    root_w = 1.15                                   # machined root box
    frame = m.wall(0.14)
    web = m.wall(0.035)
    pitch = max(0.30, 3.5 * web)                    # coarsen if webs thicken
    plan = [(0, -root_w / 2), ((width - root_w) / 2, -width / 2), (span, -width / 2),
            (span, width / 2), ((width - root_w) / 2, width / 2), (0, root_w / 2)]
    outer = prism_xy(plan, -depth, 0)
    # Inset outline for the lattice area, and the root box left solid.
    c = frame * (1 + math.sqrt(2))
    inner = prism_xy([(0.8, -root_w / 2 - 0.8 + c), ((width - root_w) / 2 + c - frame, -width / 2 + frame),
                      (span - frame, -width / 2 + frame), (span - frame, width / 2 - frame),
                      ((width - root_w) / 2 + c - frame, width / 2 - frame), (0.8, root_w / 2 + 0.8 - c)],
                     -depth - 1, 1)
    # Diamond |x|+|y| <= half; neighbours sit (pitch/2, pitch/2) away, so the
    # web between parallel edges is (pitch - 2*half)/sqrt(2).
    half = (pitch - web * math.sqrt(2)) / 2
    cells = []
    for i in range(-1, int(span / pitch) + 3):
        for j in range(-int(width / pitch) - 3, int(width / pitch) + 4):
            cx = i * pitch + (pitch / 2 if j % 2 else 0)
            cy = j * pitch / 2
            if -pitch < cx < span + pitch and abs(cy) < width / 2 + pitch:
                cells.append(prism_xy([(cx + half, cy), (cx, cy + half), (cx - half, cy),
                                       (cx, cy - half)], -depth - 1, 1))
    fin = outer.cut(fuse(cells).intersect(inner))
    # Serrated lower edge on the tip and both long sides (the saw-tooth
    # silhouette in every photo).
    tooth, tp = 0.23, max(0.30, 2 * m.min_wall)
    teeth = []
    edges = [((span - frame / 2, -width / 2), (span - frame / 2, width / 2)),
             (((width - root_w) / 2, -width / 2 + frame / 2), (span, -width / 2 + frame / 2)),
             (((width - root_w) / 2, width / 2 - frame / 2), (span, width / 2 - frame / 2))]
    for (x0, y0), (x1, y1) in edges:
        L = math.hypot(x1 - x0, y1 - y0)
        n = max(1, int(L / tp))
        ux, uy = (x1 - x0) / L, (y1 - y0) / L
        for k in range(n):
            a0, a1 = k * L / n, (k + 1) * L / n
            p0 = Vector(x0 + ux * a0, y0 + uy * a0, -depth)
            p1 = Vector(x0 + ux * a1, y0 + uy * a1, -depth)
            pm = Vector(x0 + ux * (a0 + a1) / 2, y0 + uy * (a0 + a1) / 2, -depth - tooth)
            tri = cq.Wire.makePolygon([p0, p1, pm], close=True)
            nx, ny = -uy * frame / 2, ux * frame / 2
            teeth.append(cq.Solid.extrudeLinear(tri, [], Vector(2 * nx, 2 * ny, 0))
                         .translate(Vector(-nx, -ny, 0)))
    parts = [fin] + teeth
    if catch:
        # The catch shoe under the root that sits on the chopstick rail.
        parts.append(box(0.1, 0.85, -0.3, 0.3, -depth - 0.2, -depth + 0.05))
    return fuse(parts)


def super_heavy(m: Model):
    top = H_BOOSTER
    z_eq = top - HOT_STAGE_H                # forward-dome equator, lower truss pins
    parts = []

    # Tank barrel from the aft lip to the forward dome, which rises inside
    # the truss, exposed to the ship's exhaust (shielded only by a thin
    # welded steel skin).
    parts.append(revolve([
        ("line", [(0, BOOSTER_LIP), (R_HULL, BOOSTER_LIP), (R_HULL, z_eq)]),
        ("spline", [(R_HULL, z_eq), (3.4, z_eq + 1.75), (1.8, z_eq + 2.4), (0, z_eq + 2.6)],
         ((0, 1), (-1, 0))),
        ("line", [(0, z_eq + 2.6), (0, BOOSTER_LIP)])]))

    # Integrated hot-staging adapter: a Warren truss of 36 spindle struts
    # between 18 lower nodes (20 deg apart) and 18 upper nodes offset 10 deg,
    # under the ring the ship sits on.
    ring_t = m.wall(0.25)
    parts.append(revolve([("line", [(R_HULL - ring_t, top - 0.3), (R_HULL, top - 0.3), (R_HULL, top),
                                    (R_HULL - ring_t, top), (R_HULL - ring_t, top - 0.3)])]))
    strut_r = m.wall(0.2) / 2
    r_node = R_HULL - max(0.15, strut_r)
    for i in range(18):
        # Each strut runs from inside the barrel to inside the ring, so it
        # overlaps both rather than ending exactly on a face.
        a = math.radians(20 * i)
        lo = Vector(r_node * math.cos(a), r_node * math.sin(a), z_eq - 0.25)
        for da in (-10, 10):
            b = math.radians(20 * i + da)
            hi = Vector(r_node * math.cos(b), r_node * math.sin(b), top - 0.12)
            d = hi - lo
            parts.append(cq.Solid.makeCylinder(strut_r, d.Length, lo, d.normalized()))
        # Clevis fork at each lower node.
        fork = box(R_HULL - 0.2, R_HULL + 0.18, -0.17, 0.17, z_eq - 0.9, z_eq + 0.1)
        parts.append(spin(fork, 20 * i))

    # Round RCS / vent ports with doubler rings, just under the truss.
    for i in range(8):
        port = radial_cylinder(0.45, z_eq - 1.3, R_HULL - 0.2, R_HULL + 0.05)
        if m.min_wall < 0.15:
            port = port.cut(radial_cylinder(0.25, z_eq - 1.3, R_HULL - 0.1, R_HULL + 0.2))
        parts.append(spin(port, 22.5 + 45 * i))

    # 33 Raptor 3s: 20 fixed outer engines every 18 deg at r = 4.30 m (their
    # nozzles overhang the 9 m hull), 10 gimballing inner engines at 2.52 m
    # splitting each outer pair, 3 centre engines clocked 108/108/144 deg in
    # line with inner engines. Turbopump pods face outward.
    eng = raptor_sl(m)
    engines = []
    top_of_engine = BOOSTER_LIP + 0.3
    z0 = top_of_engine - sl_len()
    for n, radius, angles in ((20, 4.30, [18 * i for i in range(20)]),
                              (10, 2.52, [9 + 36 * i for i in range(10)]),
                              (3, 0.95, [9, 117, 225])):
        for deg in angles:
            a = math.radians(deg)
            engines.append(spin(eng, deg).translate(Vector(radius * math.cos(a), radius * math.sin(a), z0)))

    # Aft plumbing band: engine commodity ring pipes and one junction box per
    # outer engine.
    if m.min_wall <= 0.14:
        for z in (BOOSTER_LIP + 0.9, BOOSTER_LIP + 1.9, BOOSTER_LIP + 2.2):
            parts.append(cq.Solid.makeTorus(R_HULL + 0.1, 0.07, Vector(0, 0, z)))
    for i in range(20):
        jb = box(R_HULL - 0.1, R_HULL + m.wall(0.2), -m.wall(0.3) / 2, m.wall(0.3) / 2,
                 BOOSTER_LIP + 1.2, BOOSTER_LIP + 1.7)
        parts.append(spin(jb, 18 * i + 9))

    # Grid fins in the V3 "T": the rudder fin on the heat-shield side, two
    # catch fins at +-90 deg that the chopsticks lift and catch it by. Each
    # root sits on a round shaft aperture with a toothed doubler.
    for az, catch in ((0, False), (90, True), (-90, True)):
        fin = grid_fin(m, catch).translate(Vector(R_HULL - 0.15, 0, FIN_TOP_Z))
        boss = radial_cylinder(0.6, FIN_TOP_Z - 0.1, R_HULL - 0.2, R_HULL + 0.06)
        parts += [spin(fin, az), spin(boss, az)]

    # Conduits. A: tower side, full length, with two pointed pods and a pipe
    # alongside. B: heat-shield side, from the common dome down.
    def conduit(z_lo, z_hi, w, h):
        return prism_xy([(R_HULL - 0.2, -w / 2), (R_HULL + h, -w / 2 + 0.08),
                         (R_HULL + h, w / 2 - 0.08), (R_HULL - 0.2, w / 2)], z_lo, z_hi)

    parts.append(spin(conduit(BOOSTER_LIP + 0.3, z_eq - 1.0, 0.6, 0.3), 180))
    for z_lo, z_hi in ((top - 9.5, top - 4.5), (top - 29.0, top - 21.0)):
        pod = radial_plate([(R_HULL - 0.1, z_lo), (R_HULL + 0.55, z_lo + 1.0),
                            (R_HULL + 0.55, z_hi - 1.0), (R_HULL - 0.1, z_hi)], -0.35, 0.35)
        parts.append(spin(pod, 180))
    parts.append(spin(cq.Solid.makeCylinder(m.wall(0.25) / 2, z_eq - 1.5 - BOOSTER_LIP - 2.5,
                                            Vector(R_HULL + 0.1, 0, BOOSTER_LIP + 2.5)), 187))
    parts.append(spin(conduit(BOOSTER_LIP + 0.3, top - 25.3, 0.45, 0.3), -3))

    # Chines: angular fairings over avionics, pressure bottles and batteries.
    # Two tall ones close together either side of conduit A, two shorter
    # ones farther apart on the heat-shield side.
    def chine(z_top):
        z_bot = BOOSTER_LIP + 2.0
        return radial_plate([(R_HULL - 0.2, z_bot), (R_HULL + 0.9, z_bot + 0.8),
                             (R_HULL + 0.9, z_top - 2.2), (R_HULL - 0.2, z_top)], -0.5, 0.5)

    for az in (150, -125):
        parts.append(spin(chine(top - 37.4), az))
    for az in (60, -60):
        parts.append(spin(chine(top - 45.2), az))

    # The short vertical ribs around the common dome.
    if m.min_wall <= 0.08:
        for i in range(96):
            rib = box(R_HULL - 0.05, R_HULL + 0.06, -0.04, 0.04, top - 24.7, top - 23.4)
            parts.append(spin(rib, 3.75 * i))

    steel = fuse(parts)
    if m.shell:
        # Hollow: a closed cavity from the thrust plate up to the forward
        # dome, leaving the shell wall all round (the dome stays solid).
        w = m.shell
        steel = steel.cut(cq.Solid.makeCylinder(R_HULL - w, z_eq - BOOSTER_LIP - w,
                                                Vector(0, 0, BOOSTER_LIP + w)))
    # The engines are their own body: they are matte black and the hull is
    # not. Their tops still overlap the hull; build() trims them for CAD.
    return steel, fuse(engines)


# ---------------------------------------------------------------------------
# Starship (upper stage)
# ---------------------------------------------------------------------------
# Ship-local z runs up from the bottom of the aft skirt. Azimuth is measured
# from the windward centreline (+X, 0 deg) toward +Y; leeward is 180 deg.
NOSE_LEN = 12.5          # ogive, tangent to the barrel (measured, +-0.5)
NOSE_TIP_R = 0.9         # spherical blunting at the tip (measured, +-0.3)
SHIP_SKIRT_H = 7.0       # aft skirt, about four 1.83 m rings (measured)
SHIP_AFT_DOME_Z = 4.3    # lowest point of the aft dome / thrust puck (estimate)
Z_NOSE = H_SHIP - NOSE_LEN


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


def nose_segments(offset=0.0):
    """Revolve segments for the nose, base (R, Z_NOSE) to tip on the axis, as
    two exact arcs. `offset` grows the surface normally (for the heat shield)."""
    rho, zc, _ = _nose_geometry()
    cx = R_HULL - rho
    ro, rs = rho + offset, NOSE_TIP_R + offset
    z0 = Z_NOSE

    def on_ogive(t):              # t: 0 at base, 1 at the tangent point
        a = math.atan2(zc, -cx) * t
        return (cx + ro * math.cos(a), z0 + ro * math.sin(a))

    tang = on_ogive(1)
    a_t = math.atan2(tang[1] - z0 - zc, tang[0])
    a_m = (a_t + math.pi / 2) / 2
    return [
        ("arc", [on_ogive(0), on_ogive(0.5), tang]),
        ("arc", [tang, (rs * math.cos(a_m), z0 + zc + rs * math.sin(a_m)), (0, z0 + zc + rs)]),
    ]


def hull_radius(z):
    """Outer radius of the ship's steel at ship-local height z."""
    rho, zc, tang = _nose_geometry()
    h = z - Z_NOSE
    if h <= 0:
        return R_HULL
    if h <= tang[1]:
        return (R_HULL - rho) + math.sqrt(rho * rho - h * h)
    return math.sqrt(max(NOSE_TIP_R ** 2 - (h - zc) ** 2, 0))


def ship_envelope(offset=0.0, z_bottom=0.0):
    """The ship's outer surface as a solid (skirt filled in)."""
    nose = nose_segments(offset)
    tip = nose[-1][1][-1]
    return revolve([("line", [(0, z_bottom), (R_HULL + offset, z_bottom), (R_HULL + offset, Z_NOSE)])]
                   + nose + [("line", [tip, (0, z_bottom)])])


def aft_flap(m: Model):
    """V2/V3 aft flap on the +90 deg tile line: straight outer edge, swept
    leading edge, tapering from ~0.6 m thick at the root to ~0.3 m."""
    t_root, t_tip = m.wall(0.6), m.wall(0.3)
    x0, x1 = R_HULL - 0.3, R_HULL + 4.0
    root = cq.Wire.makePolygon([Vector(x0, -t_root / 2, 0.2), Vector(x0, t_root / 2, 0.2),
                                Vector(x0, t_root / 2, 14.0), Vector(x0, -t_root / 2, 14.0)], close=True)
    tip = cq.Wire.makePolygon([Vector(x1, -t_tip / 2, 0.2), Vector(x1, t_tip / 2, 0.2),
                               Vector(x1, t_tip / 2, 8.5), Vector(x1, -t_tip / 2, 8.5)], close=True)
    flap = cq.Solid.makeLoft([root, tip], True)
    # Static hinge fairing ("static aero") on the leeward side, full height,
    # with a ramped cap. Local +Y becomes leeward once spun to +90 deg.
    fairing = radial_plate([(R_HULL - 0.3, 0.0), (R_HULL + 0.7, 0.0), (R_HULL + 0.7, 13.2),
                            (R_HULL - 0.3, 15.0)], t_root / 2 - 0.05, t_root / 2 + 0.7)
    return fuse([flap, fairing])


def forward_flap(m: Model):
    """V2/V3 forward flap, built at azimuth 0 and spun to +-113 deg: the root
    follows the ogive, 3 m span, straight 2 m outer edge, swept leading edge."""
    t = m.wall(0.3)
    z_lo, z_hi = Z_NOSE + 2.7, Z_NOSE + 8.4          # root: ~5.8 m along the ogive
    root = [(hull_radius(z_hi - (z_hi - z_lo) * k / 6) - 0.15, z_hi - (z_hi - z_lo) * k / 6)
            for k in range(7)]
    outline = root + [(7.5, Z_NOSE + 2.2), (7.5, Z_NOSE + 4.2)]
    flap = radial_plate(outline, -t / 2, t / 2)
    # Hinge aerocover: the flaps were moved leeward so that this tiled cover
    # sits on the windward side of the hinge, and the tile line runs along
    # it. It hugs the ogive, so its edges are splines. Local -Y becomes
    # windward once spun to +113 deg.
    z0, z1 = Z_NOSE + 2.3, Z_NOSE + 8.8
    zs = [z0 + (z1 - z0) * k / 12 for k in range(13)]
    inner = [Vector(hull_radius(z) - 0.35, 0, z) for z in zs]
    outer = [Vector(hull_radius(z) + 0.4, 0, z) for z in reversed(zs)]
    y0 = -t / 2 + 0.05
    wire = cq.Wire.assembleEdges([
        cq.Edge.makeSpline([v + Vector(0, y0, 0) for v in inner]),
        cq.Edge.makeLine(inner[-1] + Vector(0, y0, 0), outer[0] + Vector(0, y0, 0)),
        cq.Edge.makeSpline([v + Vector(0, y0, 0) for v in outer]),
        cq.Edge.makeLine(outer[-1] + Vector(0, y0, 0), inner[0] + Vector(0, y0, 0))])
    fairing = cq.Solid.extrudeLinear(wire, [], Vector(0, -0.9, 0)).cut(flap)
    return flap, fairing


# ---------------------------------------------------------------------------
# Heat shield tiles
# ---------------------------------------------------------------------------
# Hexagonal, pointy end up the vehicle, in staggered rows: 0.21 m flat to
# flat (measured: 22 px at 106 px/m on the B19 pad photo), which gives the
# ~18,000 tiles SpaceX quotes over the windward side. Each tile is a flat
# hexagonal plate on a 2 cm ablative backing.
TILE_PITCH = 0.21
TILE_GAP = 0.008
TILE_T = 0.05
TILE_BACKING = 0.02


def tile_shape(scale=1.0):
    """One tile in its own frame: normal +Z, pointy end +Y, base at z=0.
    `scale` enlarges it across (not in thickness) for the nose cap."""
    c = (TILE_PITCH * scale - TILE_GAP) / math.sqrt(3)       # circumradius
    pts = [Vector(c * math.cos(math.radians(90 + 60 * k)),
                  c * math.sin(math.radians(90 + 60 * k)), 0) for k in range(6)]
    return cq.Solid.extrudeLinear(cq.Wire.makePolygon(pts, close=True), [], Vector(0, 0, TILE_T))


def _profile(s):
    """The ship's outer profile by arclength s up from the skirt lip:
    (r, z, dr/ds, dz/ds)."""
    rho, zc, (tr, tz) = _nose_geometry()
    cx = R_HULL - rho
    if s <= Z_NOSE:
        return R_HULL, s, 0.0, 1.0
    a_end = math.atan2(tz, tr - cx)
    s1 = Z_NOSE + rho * a_end
    if s <= s1:
        a = (s - Z_NOSE) / rho
        return cx + rho * math.cos(a), Z_NOSE + rho * math.sin(a), -math.sin(a), math.cos(a)
    a0 = math.atan2(tz - zc, tr)
    a = min(a0 + (s - s1) / NOSE_TIP_R, math.pi / 2)
    return (NOSE_TIP_R * math.cos(a), Z_NOSE + zc + NOSE_TIP_R * math.sin(a),
            -math.sin(a), math.cos(a))


def _profile_length():
    """Arclength of the profile from the skirt lip to the tip."""
    rho, zc, (tr, tz) = _nose_geometry()
    cx = R_HULL - rho
    a_end = math.atan2(tz, tr - cx)
    a0 = math.atan2(tz - zc, tr)
    return Z_NOSE + rho * a_end + NOSE_TIP_R * (math.pi / 2 - a0)


def _in_polygon(x, y, poly, margin):
    """Point strictly inside a polygon, at least `margin` from every edge."""
    inside = False
    for (x0, y0), (x1, y1) in zip(poly, poly[1:] + poly[:1]):
        if (y0 > y) != (y1 > y) and x < x0 + (y - y0) * (x1 - x0) / (y1 - y0):
            inside = not inside
        dx, dy = x1 - x0, y1 - y0
        t = max(0, min(1, ((x - x0) * dx + (y - y0) * dy) / (dx * dx + dy * dy)))
        if math.hypot(x - x0 - t * dx, y - y0 - t * dy) < margin:
            return False
    return inside


def ship_tiles(m: Model):
    """Every tile as (origin, x direction, normal, scale) in ship
    coordinates: the nose cap, the rows below it, then the windward faces of
    the four flaps."""
    frames = []
    half = TILE_PITCH / math.sqrt(3) + 0.02          # tile corner radius + clearance
    row = TILE_PITCH * math.sqrt(3) / 2

    patches = [(143, 13.4, 28.8, 31.2), (140, 21.6, 13.3, 16.7)]

    def covered(th, z, r):
        """Is a tile centred at azimuth th (deg), height z, wholly on the shield?"""
        a = abs(th)
        m_ang = math.degrees(half / r)
        if z >= Z_NOSE + 9.0:
            ok = True
        elif z >= Z_NOSE + 1.7:
            # Up to the forward flaps' hinge aerocovers.
            ok = a <= 113 - math.degrees(0.95 / r) - m_ang
        else:
            # Clear of the aft flap roots and the catch pins.
            ok = a <= 90 - m_ang - (math.degrees(0.35 / r) if z < 14.4 or 38.5 < z < 39.9 else 0)
        for az, hw, z0, z1 in patches:
            if az - hw + m_ang <= a <= az + hw - m_ang and z0 + half <= z <= z1 - half:
                ok = True
        return ok

    def place(s, th, scale=1.0, pointy=None):
        r, z, dr, dz = _profile(s)
        c, sn = math.cos(math.radians(th)), math.sin(math.radians(th))
        normal = Vector(dz * c, dz * sn, -dr)
        origin = Vector(r * c, r * sn, z) + normal * TILE_BACKING
        x = Vector(-sn, c, 0) if pointy is None else pointy.cross(normal).normalized()
        frames.append((origin, x, normal, scale))

    # The nose tip: one continuous hex lattice mapped conformally over it, as
    # on the real ship (seen from
    # above in the Flight 12 wet dress photo). A conformal map keeps every
    # tile a regular hexagon; the price is that tiles grow toward the tip,
    # which the real cap does too. u = integral of ds/r is the log-radius of
    # the flat lattice; the surface scale there is r / exp(u).
    # The cap spans the first 1.0 m from the tip, which keeps the tip tiles
    # to 1.8x normal size; wider, they balloon (4.5x at 3.7 m).
    s_tip = _profile_length()
    d_cap = 1.0                                            # cap edge, from the tip
    s_cap = s_tip - d_cap
    table, u, d, step = [], math.log(0.01), 0.01, 0.005   # (d, u, scale) from the tip
    while d <= d_cap + 0.5:
        r = _profile(s_tip - d)[0]
        table.append((d, u, r / math.exp(u)))
        u += step / max(r, 1e-3)
        d += step
    lam_cap = next(sc for dd, uu, sc in table if dd >= d_cap)
    pitch = TILE_PITCH / lam_cap                           # planar lattice pitch
    rho_cap = math.exp(next(uu for dd, uu, sc in table if dd >= d_cap - half))
    j = 0
    while j * pitch * math.sqrt(3) / 2 <= rho_cap:
        for sgn in ((1,) if j == 0 else (1, -1)):
            py = sgn * j * pitch * math.sqrt(3) / 2
            i0 = -int(rho_cap / pitch) - 1
            for i in range(i0, -i0 + 1):
                px = (i + (0.5 if j % 2 else 0)) * pitch
                rho = math.hypot(px, py)
                if rho > rho_cap:
                    continue
                phi = math.atan2(py, px)
                lu = math.log(max(rho, 1e-6))
                d, sc = next(((dd, scc) for dd, uu, scc in table if uu >= lu), table[-1][::2])
                scale = round(sc / lam_cap * 10) / 10      # a handful of tile sizes
                sd = s_tip - d
                r, z, dr, dz = _profile(sd)
                c, sn = math.cos(phi), math.sin(phi)
                down = Vector(-dr * c, -dr * sn, -dz)     # away from the tip
                circ = Vector(-sn, c, 0)
                place(sd, math.degrees(phi), scale, down * math.sin(phi) + circ * math.cos(phi))
        j += 1

    # Below the cap: rows up the meridian. On the barrel that is a perfect
    # hexagonal lattice. Up the ogive the circumference shrinks, so the row
    # count steps down in bands: each band keeps its count (and a clean
    # stagger) until the tiles would touch, then drops about 12%, leaving a
    # neat seam row, the way the real ship steps its rows.
    k, s = 0, 0.25
    n = int(2 * math.pi * R_HULL / TILE_PITCH)
    while True:
        r, z, dr, dz = _profile(s)
        if s > s_cap - row / 2:
            break
        if 2 * math.pi * r / n < TILE_PITCH:
            n = int(2 * math.pi * r / (TILE_PITCH * 1.12))
            k = 0
        for j in range(n):
            th = 360 * (j + (0.5 if k % 2 else 0)) / n
            th = (th + 180) % 360 - 180
            if covered(th, z, r):
                place(s, th)
        k += 1
        s += row

    # Flaps: a flat lattice on each windward face, whole tiles only.
    def flap_tiles(poly, face_y, slope, az, clear):
        """poly: planform (radius, z); face_y(x): the windward face's local y;
        slope: d(face_y)/dx; clear(x, z): False where the tile would hit
        something at the root."""
        out = []
        nrm = Vector(slope, -1, 0).normalized()
        xs = [p[0] for p in poly]
        zs = [p[1] for p in poly]
        k = 0
        z = min(zs)
        while z <= max(zs):
            x = min(xs) + (TILE_PITCH / 2 if k % 2 else 0)
            while x <= max(xs):
                if _in_polygon(x, z, poly, half) and clear(x, z):
                    out.append((Vector(x, face_y(x), z), nrm))
                x += TILE_PITCH
            z += row
            k += 1
        for side in (1, -1):
            for o, nv in out:
                o = Vector(o.x, side * o.y, o.z)
                nv = Vector(nv.x, side * nv.y, nv.z)
                a = math.radians(side * az)
                rot = lambda v: Vector(v.x * math.cos(a) - v.y * math.sin(a),
                                       v.x * math.sin(a) + v.y * math.cos(a), v.z)
                o2, n2 = rot(o), rot(nv)
                frames.append((o2, n2.cross(Vector(0, 0, 1)).normalized(), n2, 1.0))

    t_root, t_tip = m.wall(0.6), m.wall(0.3)
    x0, x1 = R_HULL - 0.3, R_HULL + 4.0
    slope = (t_root - t_tip) / 2 / (x1 - x0)
    flap_tiles([(x0, 0.2), (x1, 0.2), (x1, 8.5), (x0, 14.0)],
               lambda x: -(t_root + (t_tip - t_root) * (x - x0) / (x1 - x0)) / 2 - TILE_BACKING,
               slope, 90, lambda x, z: x > R_HULL + 0.1 + half)
    t = m.wall(0.3)
    z_lo, z_hi = Z_NOSE + 2.7, Z_NOSE + 8.4
    root = [(hull_radius(z_hi - (z_hi - z_lo) * k / 6) - 0.15, z_hi - (z_hi - z_lo) * k / 6)
            for k in range(7)]
    flap_tiles(root + [(7.5, Z_NOSE + 2.2), (7.5, Z_NOSE + 4.2)],
               lambda x: -t / 2 - TILE_BACKING, 0.0, 113,
               lambda x, z: x > hull_radius(z) + 0.4 + half)
    return frames


def starship(m: Model):
    wall = m.wall(0.02)
    parts = []

    # Hull: open aft skirt, the aft dome hanging into it, tanks, ogive nose.
    dome = [(0, SHIP_AFT_DOME_Z), (2.3, SHIP_AFT_DOME_Z + 0.36), (3.6, SHIP_AFT_DOME_Z + 1.08),
            (R_HULL - wall, SHIP_SKIRT_H)]
    nose = nose_segments()
    parts.append(revolve([("spline", dome, ((1, 0), (0.3, 1))),
                          ("line", [(R_HULL - wall, SHIP_SKIRT_H), (R_HULL - wall, 0),
                                    (R_HULL, 0), (R_HULL, Z_NOSE)])]
                         + nose + [("line", [nose[-1][1][-1], (0, SHIP_AFT_DOME_Z)])]))
    # Thrust puck under the dome, carrying the sea-level engines.
    parts.append(cq.Solid.makeCylinder(1.55, 0.5, Vector(0, 0, SHIP_AFT_DOME_Z - 0.3)))

    # Engines: three gimballed sea-level Raptors on the puck, and three fixed
    # Raptor Vacuums on the aft dome, recessed inside the skirt. Clocking is
    # not known from photos; the SpaceX render lines the rings up.
    sl = raptor_sl(m)
    engines = []
    for i in range(3):
        a = math.radians(120 * i)
        engines.append(sl.translate(Vector(0.95 * math.cos(a), 0.95 * math.sin(a),
                                         SHIP_AFT_DOME_Z - 0.2 - sl_len())))
    vac = raptor_vac(m)
    for i in range(3):
        a = math.radians(120 * i)
        engines.append(vac.translate(Vector(3.2 * math.cos(a), 3.2 * math.sin(a), 1.1)))

    # Flaps and their fairings.
    parts += both_sides(aft_flap(m), 90)
    flap, fairing = forward_flap(m)
    parts += both_sides(flap, 113)
    fairings = both_sides(fairing, 113)

    # Catch pins for the tower, ramp-shaped, on the tile line under the nose.
    pin = radial_plate([(R_HULL - 0.2, 38.75), (R_HULL + 0.4, 39.35), (R_HULL + 0.4, 39.6),
                        (R_HULL - 0.2, 39.6)], -0.3, 0.3)
    parts += both_sides(pin, 90)

    # Leeward plumbing: the two raceways (methane and oxygen side) from the
    # skirt to the nose, RCS thruster pods at their tops and on the skirt,
    # and the four docking drogue fittings.
    for az in (163, -158):
        pipe = cq.Solid.makeCylinder(m.wall(0.3), 29.0, Vector(R_HULL + 0.05, 0, SHIP_SKIRT_H))
        parts.append(spin(pipe, az))
    for z in (36.3, 4.7):
        parts += both_sides(radial_cylinder(m.wall(0.3), z, R_HULL - 0.3, R_HULL + 0.55), 142.5)
    for z in (27.5, 9.0):
        drogue = radial_cylinder(0.55, z, R_HULL - 0.3, R_HULL + 0.18)
        if m.min_wall < 0.15:
            drogue = drogue.cut(radial_cylinder(0.35, z, R_HULL + 0.06, R_HULL + 0.3))
        parts += both_sides(drogue, 133)

    steel = fuse(parts)
    engines = fuse(engines)
    if m.shell:
        # Hollow: a closed cavity from above the aft dome to inside the nose,
        # its walls the hull offset inward by the shell thickness. The nose
        # arc offset inward meets the axis well below the tip, so the tip
        # stays solid.
        w = m.shell
        rho, _, _ = _nose_geometry()
        cx, ri = R_HULL - rho, rho - w
        a_top = math.acos(-cx / ri)
        mid = (cx + ri * math.cos(a_top / 2), Z_NOSE + ri * math.sin(a_top / 2))
        top = (0.0, Z_NOSE + ri * math.sin(a_top))
        z_bot = SHIP_SKIRT_H + w
        steel = steel.cut(revolve([
            ("line", [(0, z_bot), (R_HULL - w, z_bot), (R_HULL - w, Z_NOSE)]),
            ("arc", [(R_HULL - w, Z_NOSE), mid, top]),
            ("line", [top, (0, z_bot)])]))

    # Starlink dispenser ("Pez") door: a recessed slot on the leeward side.
    depth = max(0.03, m.relief)
    door = ship_envelope(0.5).cut(ship_envelope(-depth)) \
        .intersect(wedge(180 - 47, 180 + 47, 37.9, 39.1))
    steel = steel.cut(door)

    # Heat shield: the windward half from the skirt lip to the nose, widening
    # around the forward flaps, and the whole tip. Plus the black leeward
    # patches seen on Ship 39.
    # In the CAD model this is the 2 cm ablative backing, and the tiles
    # (ship_tiles) sit on it; the print model has no tiles, so it is a
    # single raised shell instead.
    t = m.relief if m.relief else TILE_BACKING
    shell = ship_envelope(t).cut(ship_envelope(0.0))
    regions = [wedge(-90, 90, 0, Z_NOSE + 1.7), wedge(-113, 113, Z_NOSE + 1.7, Z_NOSE + 9.0),
               wedge(-180, 180, Z_NOSE + 9.0, H_SHIP + 1)]
    for az, half, z0, z1 in ((143, 13.4, 28.8, 31.2), (140, 21.6, 13.3, 16.7)):
        regions.append(wedge(az - half, az + half, z0, z1))
        regions.append(wedge(-az - half, -az + half, z0, z1))
    regions = fuse(regions)
    shield = shell.intersect(regions).cut(steel)
    aerocovers = fuse(fairings).cut(steel)
    # For printing, a version that sinks into the steel wall instead of just
    # touching it: fusing coincident curved faces is fragile, overlapping
    # volumes are not.
    shield_print = fuse([ship_envelope(t).cut(ship_envelope(-wall / 2)).intersect(regions)]
                        + fairings)
    return steel, engines, shield, aerocovers, shield_print


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


def zip_step(path: Path):
    """STEP is verbose text that zips to about a seventh of its size; ship
    the zip and drop the raw file."""
    import zipfile
    zpath = path.with_name(path.stem + "_step.zip")
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.write(path, path.name)
    path.unlink()
    print(f"wrote {zpath}  ({zpath.stat().st_size / 1e6:.1f} MB zipped)")


def write_tile_texture(path: Path, px=256):
    """A seamless image of the tile lattice, for a CAD appearance: one
    repeat is one tile pitch wide and two rows (sqrt(3) pitches) tall."""
    from PIL import Image, ImageDraw
    w, h = px, round(px * math.sqrt(3))
    img = Image.new("RGB", (w, h), (84, 84, 89))          # the pale gap
    draw = ImageDraw.Draw(img)
    c = px * (1 - TILE_GAP / TILE_PITCH) / math.sqrt(3)   # tile circumradius, px
    for cx, cy in ((0, 0), (w, 0), (w / 2, h / 2), (0, h), (w, h),
                   (w / 2, -h / 2), (w / 2, 3 * h / 2)):
        draw.polygon([(cx + c * math.cos(math.radians(90 + 60 * k)),
                       cy + c * math.sin(math.radians(90 + 60 * k))) for k in range(6)],
                     fill=(13, 13, 14))
    img.save(path)
    print("wrote", path)


def build(m: Model):
    """Both stages, stacked and scaled to millimetres, as named bodies."""
    print("  Super Heavy ...")
    booster, booster_engines = super_heavy(m)
    print("  Starship ...")
    ship, ship_engines, shield, aerocovers, shield_print = starship(m)
    if m.min_wall == 0:
        # For CAD, trim each engine to what shows outside the hull, so no two
        # bodies overlap. For printing they stay overlapping, which fuses
        # far more reliably than faces that merely touch.
        booster_engines = booster_engines.cut(booster)
        ship_engines = ship_engines.cut(ship)
    s = m.mm_per_m
    lift = Vector(0, 0, H_BOOSTER)
    return {
        "super_heavy": booster.scale(s),
        "super_heavy_raptors": booster_engines.scale(s),
        "starship": ship.translate(lift).scale(s),
        "starship_raptors": ship_engines.translate(lift).scale(s),
        "heat_shield": shield.translate(lift).scale(s),
        "flap_aerocovers": aerocovers.translate(lift).scale(s),
        "heat_shield_print": shield_print.translate(lift).scale(s),
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--scale", type=float, default=500, help="scale denominator (default 1:500)")
    ap.add_argument("--min-wall", type=float, default=0.8,
                    help="thinnest printable wall at the output scale, mm (default 0.8)")
    ap.add_argument("--shell", type=float, default=3.175,
                    help="hollow both stages with walls this thick, mm (default 3.175 = 1/8 in; 0 = solid)")
    ap.add_argument("--out", type=Path, default=Path(__file__).parent / "models")
    args = ap.parse_args()

    tag = f"1-{args.scale:g}"
    args.out.mkdir(parents=True, exist_ok=True)

    # The CAD model keeps every wall at its real thickness; the print model
    # thickens what a printer cannot make and coarsens the grid fin lattice.
    true = Model(args.scale, 0.0, args.shell)
    printable = Model(args.scale, args.min_wall, args.shell)
    print(f"scale 1:{args.scale:g}  ({true.mm_per_m:.3f} mm per metre)")

    print("building the CAD model (true thicknesses) ...")
    body = build(true)
    # An assembly with named, coloured bodies: stainless steel, the pale
    # backing that shows in the gaps, the Raptors' dark grey, the tiles.
    colours = {"steel": cq.Color(0.78, 0.79, 0.81), "backing": cq.Color(0.33, 0.33, 0.35),
               "raptor": cq.Color(0.16, 0.16, 0.17), "tiles": cq.Color(0.05, 0.05, 0.055)}
    asm = cq.Assembly(name="starship_v3_stack")
    for name, colour in (("super_heavy", "steel"), ("super_heavy_raptors", "raptor"),
                         ("starship", "steel"), ("starship_raptors", "raptor"),
                         ("heat_shield", "backing"), ("flap_aerocovers", "tiles")):
        asm.add(body[name], name=name, color=colours[colour])
    # GLB for the browser viewer (index.html), without the tiles: the viewer
    # draws those itself, instanced, from tiles.bin.
    glb_path = args.out / "starship_stack.glb"
    asm.export(str(glb_path), tolerance=0.02 * true.mm_per_m, angularTolerance=0.2)
    print("wrote", glb_path)

    # The main STEP: everything but the individual tiles. It opens quickly;
    # heat_shield is the tiled area's backing, and tile_texture.png puts the
    # tile pattern on it as an appearance.
    step_path = args.out / f"starship_stack_{tag}.step"
    asm.export(str(step_path))
    zip_step(step_path)

    # The tiled STEP adds the heat shield tiles: a few tile parts (the nose
    # tip's are larger), placed ~21,000 times as instances, so the file
    # stores each shape once and each placement as a transform. CAD programs
    # open each placement as a component, which is what makes it slow.
    s = true.mm_per_m
    lift = Vector(0, 0, H_BOOSTER)
    frames = [((o + lift) * s, x, n, sc) for o, x, n, sc in ship_tiles(true)]
    protos = {sc: tile_shape(sc).scale(s) for sc in {f[3] for f in frames}}
    tiles = cq.Assembly(name="heat_shield_tiles", color=colours["tiles"])
    for i, (o, x, n, sc) in enumerate(frames):
        tiles.add(protos[sc], name=f"tile_{i}", loc=cq.Location(cq.Plane(o, x, n)))
    asm.add(tiles)
    tiled_path = args.out / f"starship_stack_{tag}_tiled.step"
    asm.export(str(tiled_path))
    zip_step(tiled_path)
    print(f"  ({len(frames)} tiles)")
    # tiles.bin: per tile, origin (mm), x direction, normal and scale, float32.
    tiles_path = args.out / "tiles.bin"
    tiles_path.write_bytes(np.array([[*o.toTuple(), *x.toTuple(), *n.toTuple(), sc]
                                     for o, x, n, sc in frames], dtype="<f4").tobytes())
    print("wrote", tiles_path)
    write_tile_texture(args.out / "tile_texture.png")

    # STL: watertight single bodies for printing — the stack, and each stage
    # on its own (the stack is tall enough that most printers want it split).
    print(f"building the print model (walls >= {args.min_wall} mm) ...")
    del asm, body, tiles
    gc.collect()
    body = build(printable)
    tol = 0.01 * (500 / args.scale) ** 0.5 * 2
    booster_print = fuse([body["super_heavy"], body["super_heavy_raptors"]])
    ship_print = fuse([body["starship"], body["starship_raptors"], body["heat_shield_print"]])
    stack = fuse([booster_print, ship_print])
    for shape, name in ((stack, "starship_stack"), (booster_print, "super_heavy"),
                        (ship_print, "starship_ship")):
        path = args.out / f"{name}_{tag}.stl"
        shape.exportStl(str(path), tolerance=tol, angularTolerance=0.15)
        drop_degenerate_triangles(path)
        bb = shape.BoundingBox()
        print(f"wrote {path}  ({bb.xlen:.1f} x {bb.ylen:.1f} x {bb.zlen:.1f} mm, "
              f"valid={shape.isValid()})")


if __name__ == "__main__":
    main()
