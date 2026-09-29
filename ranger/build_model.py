#!/usr/bin/env python3
"""
RANGER — a parametric CAD model of the Ranger from Interstellar (2014), the
spaceplane that carries the crew from the Endurance down to Miller's and
Mann's planets. Built with CadQuery (OpenCascade), exported as STEP and STL.

It is a film prop, so "accurate" means faithful to the film's own sources:
the full-size practical Ranger (shown in Iceland and at Udvar-Hazy), New Deal
Studios' 1/5 pyro miniature (12 ft, so 18.3 m full size), the Moebius 1/72
kit built from the production CG files, and film frames. README.md lists
which numbers are stated and which were measured off photographs.

    pip install cadquery manifold3d
    python3 ranger/build_model.py               # 1:72 (the kit's scale), 254 mm long
    python3 ranger/build_model.py --scale 48    # 1:48, 381 mm long
    python3 ranger/build_model.py --gear-up     # in flight

Axes: origin at the centre of the nose's front face; +X runs aft, +Y to the
left (port), +Z up. The nose is the thin, square-ended slab; the blunt end
with the round docking hatch and the two engines is the tail.
"""

import argparse
import math
import zipfile
from pathlib import Path

import cadquery as cq
import manifold3d
import numpy as np
from cadquery import Vector

LENGTH = 18.3        # nose face to rear face (1/5 miniature: 12 ft x 5)
Z_BELLY = -0.42      # the flat black belly
GEAR_DROP = 1.0      # belly height above the ground, gear down

# Body cross-sections, nose to tail: (x, half-width at the belly and sides,
# half-width of the flat top, z of the shoulder, z of the top, z of the
# belly). A ruled loft through them gives the faceted lifting body: flat
# belly, vertical sides, chamfered shoulders, flat top. Measured from the
# Moebius paint guide's top and side views and the 1/5 miniature.
STATIONS = [
    (0.0, 2.15, 2.05, 0.20, 0.23, -0.22),     # nose slab, square-ended
    (1.6, 2.10, 1.95, 0.21, 0.25, -0.30),
    (4.2, 2.00, 1.60, 0.25, 0.33, -0.42),     # the cabin hump begins
    (6.0, 2.40, 1.40, 0.45, 0.63, -0.42),
    (8.4, 2.80, 1.40, 0.75, 1.01, -0.42),
    (10.7, 3.30, 1.40, 1.00, 1.30, -0.42),    # widest
    (12.0, 3.25, 1.45, 1.05, 1.50, -0.42),
    (14.9, 3.05, 1.80, 1.20, 1.58, -0.42),    # hump top; the black grille ramp starts
    (17.0, 3.10, 2.40, 1.10, 1.30, -0.42),
    (LENGTH, 2.80, 2.30, 0.90, 1.10, -0.30),  # the rear face
]

# The wings: two canted black plates per side, as triangles (left side;
# mirrored). B is the forward blade's free tip, T the wing tip at belly
# level, A the rear end at the grille corner; R* are roots on the body.
B = (1.6, 2.15, 0.60)
T = (10.7, 4.60, -0.45)
A = (16.5, 3.15, 1.40)
R6 = (6.0, 2.20, 0.45)
R10 = (10.7, 3.20, 0.95)
R15 = (15.5, 3.00, 1.20)
WING_T = 0.28
WING_TRIS = [(B, T, R6), (R6, T, R10), (R10, T, A), (R10, A, R15)]

# Cockpit windows: (x0, x1, |y0|, |y1|) on the hump, left side (mirrored);
# the two centreline slits are included once each side. Measured from the
# paint guide's top view (the full-size prop and the 1/5 model agree on the
# pattern: 22 windows).
WINDOWS = [
    (7.23, 8.30, 0.30, 1.42), (7.80, 8.33, 0.02, 0.26), (7.65, 8.27, 1.48, 2.01),
    (8.51, 8.99, 1.48, 2.10), (8.69, 9.37, 0.05, 1.01), (9.61, 10.71, 0.17, 1.07),
    (9.64, 10.48, 1.70, 2.10), (10.89, 11.79, 1.32, 2.01), (11.60, 13.09, 0.23, 1.11),
    (13.48, 14.37, 0.42, 0.92),
]

ENGINE_Y, ENGINE_Z = 1.95, 0.40      # twin main engines in the rear face
ENGINE_W, ENGINE_H = 1.70, 0.90


class Model:
    def __init__(self, scale_denom, shell_mm, gear_down):
        self.mm_per_m = 1000.0 / scale_denom
        self.shell = shell_mm / self.mm_per_m     # body wall, real metres
        self.gear_down = gear_down


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def V(p):
    return Vector(*p)


def box(x0, x1, y0, y1, z0, z1):
    return cq.Solid.makeBox(x1 - x0, y1 - y0, z1 - z0, Vector(x0, y0, z0))


def fuse(shapes):
    shapes = list(shapes)
    out = shapes[0].fuse(*shapes[1:]) if len(shapes) > 1 else shapes[0]
    cleaned = out.clean()
    return cleaned if cleaned.isValid() else out


def cyl(d, p0, p1):
    p0, p1 = V(p0), V(p1)
    v = p1 - p0
    return cq.Solid.makeCylinder(d / 2, v.Length, p0, v.normalized())


def mirror_y(p):
    return (p[0], -p[1], p[2])


def section(x, w, wt, zs, zt, zb):
    """One body cross-section at station x, as a closed wire."""
    pts = [(-w, zb), (w, zb), (w, zs), (wt, zt), (-wt, zt), (-w, zs)]
    return cq.Wire.makePolygon([Vector(x, y, z) for y, z in pts], close=True)


def plate(tri, t):
    """A flat triangular plate of thickness t on the triangle's plane."""
    a, b, c = (V(p) for p in tri)
    n = (b - a).cross(c - a).normalized() * (t / 2)
    lo = cq.Wire.makePolygon([a - n, b - n, c - n], close=True)
    hi = cq.Wire.makePolygon([a + n, b + n, c + n], close=True)
    return cq.Solid.makeLoft([lo, hi], True)


def rounded_rect_prism(x0, x1, y0, y1, c, z0, z1):
    """A rectangle with chamfered corners in XY, extruded from z0 to z1."""
    pts = [(x0 + c, y0), (x1 - c, y0), (x1, y0 + c), (x1, y1 - c),
           (x1 - c, y1), (x0 + c, y1), (x0, y1 - c), (x0, y0 + c)]
    wire = cq.Wire.makePolygon([Vector(x, y, z0) for x, y in pts], close=True)
    return cq.Solid.extrudeLinear(wire, [], Vector(0, 0, z1 - z0))


# ---------------------------------------------------------------------------
# Parts
# ---------------------------------------------------------------------------
def hull(m: Model):
    """The body, before colours are split out."""
    body = cq.Solid.makeLoft([section(*s) for s in STATIONS], True)
    if m.shell:
        # Hollow the cabin hump and rear body: a closed cavity, the sections
        # shrunk by the shell wall, wherever the body is thick enough.
        w = m.shell
        inner = []
        for x, bw, wt, zs, zt, zb in STATIONS:
            if 6.0 <= x <= 17.0:
                inner.append(section(x, bw - w, max(wt - w, 0.3), max(zs, zb + 2 * w),
                                     zt - w, zb + w))
        x_end = LENGTH - 1.2 - w                 # clear of the engine recesses
        x, bw, wt, zs, zt, zb = STATIONS[-2]
        inner[-1] = section(min(x, x_end), bw - w, wt - w, zs, zt - w, zb + w)
        body = body.cut(cq.Solid.makeLoft(inner, True))
    return body


def windows_and_panels(body):
    """Gloss-black windows and black panels that lie in the hull's top skin:
    each is the part of a thin top layer of the hull inside its outline."""
    skin = body.cut(body.translate(Vector(0, 0, -0.08)))
    win = []
    for x0, x1, y0, y1 in WINDOWS:
        for s in (1, -1):
            ya, yb = sorted((s * y0, s * y1))
            c = min(0.15, (x1 - x0) / 4, (yb - ya) / 4)
            win.append(rounded_rect_prism(x0, x1, ya, yb, c, -2, 3))
    windows = skin.intersect(fuse(win))
    # The ribbed black grille across the upper rear, and the manoeuvring-jet
    # panels on the hump shoulders.
    grille_zone = box(14.9, 17.05, -3.5, 3.5, 0.6, 3)
    rcs = [box(11.6, 13.4, s * 2.55 - 0.3, s * 2.55 + 0.3, 0.6, 3) for s in (1, -1)]
    panels = skin.intersect(fuse([grille_zone] + rcs))
    return windows, panels


def wings():
    tris = WING_TRIS + [tuple(mirror_y(p) for p in t) for t in WING_TRIS]
    return fuse([plate(t, WING_T) for t in tris])


def nose_frame():
    """The black U-frame around the square nose, with its RCS blocks."""
    parts = [box(-0.02, 0.4, -2.17, 2.17, -0.24, 0.29)]
    for s in (1, -1):
        parts.append(box(-0.02, 1.6, s * 1.95 - 0.22, s * 1.95 + 0.22, -0.24, 0.31))
    frame = fuse(parts)
    ports = []
    for s in (1, -1):
        for x in (0.35, 0.8, 1.25):
            ports.append(cyl(0.28, (x, s * 1.95, 0.2), (x, s * 1.95, 0.5)))
        ports.append(cyl(0.28, (0.8, s * 2.1, 0.03), (0.8, s * 2.4, 0.03)))
    return frame.cut(fuse(ports))


def rear_details():
    """Hatch plate and docking ring (light grey), engines (metallic grey)."""
    x = LENGTH
    plate_ = box(x - 0.1, x + 0.2, -1.0, 1.0, -0.33, 1.02)
    ring = cyl(1.5, (x + 0.15, 0, 0.35), (x + 0.32, 0, 0.35))
    door = cyl(1.2, (x + 0.24, 0, 0.35), (x + 0.4, 0, 0.35))
    hatch = fuse([plate_, ring]).cut(door)
    # The inner door, recessed, with radial struts.
    hatch = fuse([hatch, cyl(1.2, (x + 0.12, 0, 0.35), (x + 0.2, 0, 0.35))])
    for k in range(6):
        a = math.pi * k / 3
        c, s = math.cos(a), math.sin(a)
        hatch = fuse([hatch, box(x + 0.18, x + 0.26, -0.04, 0.04, -0.55, 0.55)
                      .rotate(Vector(x, 0, 0), Vector(x + 1, 0, 0), math.degrees(a))
                      .translate(Vector(0, 0, 0.35))])
    for ys in (-0.8, 0.8):
        for zs in (-0.18, 0.88):
            hatch = hatch.cut(cyl(0.28, (x + 0.1, ys, zs), (x + 0.3, ys, zs)))

    engines = []
    recesses = []
    for s in (1, -1):
        y = s * ENGINE_Y
        c = 0.25
        cowl = rounded_rect_prism(-ENGINE_H / 2 - 0.15, ENGINE_H / 2 + 0.15,
                                  y - ENGINE_W / 2 - 0.1, y + ENGINE_W / 2 + 0.1, c + 0.05, 0, 1)
        opening = rounded_rect_prism(-ENGINE_H / 2, ENGINE_H / 2, y - ENGINE_W / 2, y + ENGINE_W / 2,
                                     c, -1, 2)
        # Built lying in XY (X = height), then stood up on the rear face.
        stand = lambda sh: sh.rotate(Vector(0, 0, 0), Vector(0, 1, 0), 90) \
            .translate(Vector(x + 0.12, 0, ENGINE_Z))
        ring_ = stand(cowl.cut(opening).translate(Vector(0, 0, 0)))
        engines.append(ring_.intersect(box(x - 0.3, x + 0.12, -4, 4, -2, 3)))
        recesses.append(stand(opening.translate(Vector(0, 0, 0))).intersect(
            box(x - 0.9, x + 0.5, -4, 4, -2, 3)))
        # The wedge plug in each engine, like a linear aerospike.
        wedge = cq.Wire.makePolygon([Vector(x - 0.85, y - 0.6, ENGINE_Z - 0.3),
                                     Vector(x - 0.85, y - 0.6, ENGINE_Z + 0.3),
                                     Vector(x - 0.05, y - 0.6, ENGINE_Z)], close=True)
        engines.append(cq.Solid.extrudeLinear(wedge, [], Vector(0, 1.2, 0)))
        # The recess floor, so the engine reads as a deep nozzle.
        engines.append(box(x - 0.95, x - 0.85, y - ENGINE_W / 2, y + ENGINE_W / 2,
                           ENGINE_Z - ENGINE_H / 2, ENGINE_Z + ENGINE_H / 2))
    return hatch, fuse(engines), fuse(recesses)


def belly_louvres():
    """The louvred vent field in the forward belly, as slots to cut."""
    slots = []
    for i in range(6):
        for j in range(5):
            x = 6.3 + i * 0.72
            y = -1.45 + j * 0.72
            slots.append(box(x, x + 0.5, y - 0.1, y + 0.1, Z_BELLY - 1, Z_BELLY + 0.06))
    return fuse(slots)


def side_vents():
    """Black side vent panels with three vertical slots, on the rear flanks."""
    w = 3.07
    out = []
    for s in (1, -1):
        p = box(16.9, 17.8, s * w - 0.06, s * w + 0.06, -0.05, 0.6)
        for k in range(3):
            xs = 17.05 + k * 0.25
            p = p.cut(box(xs, xs + 0.1, s * w + s * 0.02 - 0.03, s * w + s * 0.02 + 0.03 + s * 0.1,
                          0.05, 0.5) if s > 0 else
                      box(xs, xs + 0.1, s * w - 0.15, s * w - 0.02 + 0.03, 0.05, 0.5))
        out.append(p)
    return fuse(out)


def landing_gear():
    """Four legs, gear down: short rear struts from boxy fairings, long
    splayed forward struts to skid feet just outboard of the wing tips."""
    zg = Z_BELLY - GEAR_DROP
    metal, feet = [], []
    for s in (1, -1):
        # Rear pair.
        metal.append(box(16.3, 17.3, s * 1.5 - 0.45, s * 1.5 + 0.45, Z_BELLY - 0.3, Z_BELLY + 0.1))
        metal.append(cyl(0.22, (16.8, s * 1.5, Z_BELLY - 0.25), (16.8, s * 1.5, zg + 0.1)))
        feet.append(box(16.35, 17.25, s * 1.5 - 0.3, s * 1.5 + 0.3, zg, zg + 0.12))
        # Forward pair, with the silver retraction cylinder alongside.
        top, foot = (9.5, s * 2.9, 0.4), (8.3, s * 4.7, zg + 0.12)
        metal.append(cyl(0.24, top, foot))
        metal.append(cyl(0.14, (10.1, s * 2.9, 0.3), (8.7, s * 4.4, zg + 0.4)))
        feet.append(box(7.3, 9.3, s * 4.7 - 0.18, s * 4.7 + 0.18, zg, zg + 0.12))
    return fuse(metal), fuse(feet)


# ---------------------------------------------------------------------------
# Assembly
# ---------------------------------------------------------------------------
def build(m: Model):
    body = hull(m)
    hatch, engines, engine_recesses = rear_details()
    body = body.cut(engine_recesses).cut(belly_louvres())
    windows, panels = windows_and_panels(body)
    body = body.cut(windows).cut(panels)
    # The lower fuselage (Shuttle-style tiles) is black, the upper white.
    lower = body.intersect(box(-1, LENGTH + 1, -6, 6, -2, 0.0))
    upper = body.cut(box(-1, LENGTH + 1, -6, 6, -2, 0.0))
    black = fuse([wings(), nose_frame(), lower, panels, side_vents()])
    parts = {
        "upper_fuselage": upper,
        "black_surfaces": black,
        "windows": windows,
        "hatch": hatch,
        "engines": engines,
    }
    if m.gear_down:
        metal, feet = landing_gear()
        parts["landing_gear"] = metal
        parts["landing_feet"] = feet
    return parts


COLOURS = {
    "upper_fuselage": (0.86, 0.86, 0.84), "black_surfaces": (0.10, 0.10, 0.11),
    "windows": (0.02, 0.02, 0.03), "hatch": (0.68, 0.68, 0.68),
    "engines": (0.42, 0.43, 0.45), "landing_gear": (0.50, 0.51, 0.53),
    "landing_feet": (0.10, 0.10, 0.11),
}


def to_manifold(shape, tol):
    """Tessellate and weld OCCT's per-face seams into a closed mesh."""
    verts, tris = shape.tessellate(tol, 0.15)
    v = np.array([p.toTuple() for p in verts])
    t = np.array(tris, dtype=np.int64)
    v, inv = np.unique(np.round(v, 5), axis=0, return_inverse=True)
    t = inv.reshape(-1)[t]
    t = t[(t[:, 0] != t[:, 1]) & (t[:, 1] != t[:, 2]) & (t[:, 0] != t[:, 2])]
    return manifold3d.Manifold(manifold3d.Mesh(vert_properties=v.astype(np.float32),
                                               tri_verts=t.astype(np.uint32)))


def write_stl(mesh, path: Path):
    out = mesh.to_mesh()
    v = np.asarray(out.vert_properties)[:, :3]
    tri = v[np.asarray(out.tri_verts)].astype(np.float32)
    cr = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    area = np.linalg.norm(cr, axis=1)
    keep = area > 1e-12
    rec = np.zeros(int(keep.sum()), dtype=[("n", "<f4", 3), ("v", "<f4", (3, 3)), ("a", "<u2")])
    rec["n"], rec["v"] = cr[keep] / area[keep, None], tri[keep]
    path.write_bytes(b"RANGER print model".ljust(80, b" ")
                     + int(keep.sum()).to_bytes(4, "little") + rec.tobytes())


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--scale", type=float, default=72, help="scale denominator (default 1:72)")
    ap.add_argument("--shell", type=float, default=3.175,
                    help="hollow the body with walls this thick, mm (default 1/8 in; 0 = solid)")
    ap.add_argument("--gear-up", action="store_true", help="landing gear retracted")
    ap.add_argument("--out", type=Path, default=Path(__file__).parent / "models")
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    tag = f"1-{args.scale:g}" + ("_gear_up" if args.gear_up else "")

    m = Model(args.scale, args.shell, not args.gear_up)
    print(f"scale 1:{args.scale:g}  ({m.mm_per_m:.3f} mm per metre)")
    parts = {k: v.scale(m.mm_per_m) for k, v in build(m).items()}
    for k, v in parts.items():
        if not v.isValid():
            print(f"  warning: {k} is not a valid solid")

    asm = cq.Assembly(name="ranger")
    for name, shape in parts.items():
        asm.add(shape, name=name, color=cq.Color(*COLOURS[name]))
    step = args.out / f"ranger_{tag}.step"
    asm.export(str(step))
    zpath = args.out / f"ranger_{tag}_step.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.write(step, step.name)
    step.unlink()
    print(f"wrote {zpath}  ({zpath.stat().st_size / 1e6:.1f} MB zipped)")
    glb = args.out / ("ranger_gear_up.glb" if args.gear_up else "ranger.glb")
    asm.export(str(glb), tolerance=0.01 * m.mm_per_m, angularTolerance=0.2)
    print("wrote", glb)

    # The print model: every body meshed, then unioned as meshes into one
    # watertight solid.
    tol = 0.005 * m.mm_per_m
    whole = None
    for name, shape in parts.items():
        piece = to_manifold(shape, tol)
        if piece.status() != manifold3d.Error.NoError:
            raise RuntimeError(f"{name} does not mesh closed: {piece.status()}")
        whole = piece if whole is None else whole + piece
    stl = args.out / f"ranger_{tag}.stl"
    write_stl(whole, stl)
    lo, hi = whole.bounding_box()[:3], whole.bounding_box()[3:]
    print(f"wrote {stl}  ({hi[0] - lo[0]:.1f} x {hi[1] - lo[1]:.1f} x {hi[2] - lo[2]:.1f} mm, "
          f"{whole.num_tri()} triangles, manifold={whole.status() == manifold3d.Error.NoError})")


if __name__ == "__main__":
    main()
