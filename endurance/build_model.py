#!/usr/bin/env python3
"""
ENDURANCE — a parametric CAD model of the Endurance from Interstellar (2014),
built with CadQuery (OpenCascade) and exported as STEP and STL.

There is no real ship to measure, so "accurate" here means faithful to the
film's own sources: New Deal Studios' 1/15 shooting miniature (14 ft across,
so 64 m full size), film frames, and the labelled plan in Kip Thorne's The
Science of Interstellar (reproduced by space.com). README.md lists which
numbers are stated and which were measured off photographs.

    pip install cadquery
    python3 endurance/build_model.py               # 1:300, 213 mm across
    python3 endurance/build_model.py --scale 250   # 1:250, 256 mm across

Axes: the ring lies in the XY plane and +Z is forward (the engines fire
toward -Z). Azimuth runs clockwise from +Y seen from the front, so a module
at azimuth t sits at R * (sin t, cos t): 12 o'clock is 0 deg, 3 o'clock is
90 deg (+X).
"""

import argparse
import math
import zipfile
from pathlib import Path

import cadquery as cq
import manifold3d
import numpy as np
from cadquery import Vector

# ---------------------------------------------------------------------------
# The ring (Thorne / space.com plan; the miniature agrees)
# ---------------------------------------------------------------------------
R_IN = 19.8          # module inner ends
R_OUT = 32.0         # module outer ends: 64 m across (stated)
DEPTH = 7.0          # module thickness along the spin axis (measured, low confidence)
WIDTH = 6.6          # habitat / pod / cryo / command modules, tangentially
WIDTH_ENGINE = 7.0   # engine modules are a little broader
CHAMFER = 1.2        # 45 deg chamfers on the four long edges
NODE_R = 24.5        # connector nodes, halfway between modules
NODE_D, NODE_L = 3.3, 2.4
TUNNEL_D = 2.0

# The twelve modules, clockwise from 12 o'clock seen from the front.
MODULES = [
    (0, "habitat"), (30, "pod"), (60, "engine"), (90, "habitat_b"),
    (120, "engine"), (150, "pod"), (180, "cryo"), (210, "pod"),
    (240, "engine"), (270, "command"), (300, "engine"), (330, "pod"),
]
AIRLOCKS = (75, 135, 255, 315)     # Ranger side docking ports, on nodes

# ---------------------------------------------------------------------------
# Hub, spoke and docked craft (measured; +-1 m)
# ---------------------------------------------------------------------------
HUB_D = 3.5
SPOKE_D, SPOKE_COLLAR_D = 3.2, 2.4
LANDER_W, LANDER_T, LANDER_Z = 14.4, 4.8, (-4.0, 10.0)
RANGER_Z = (3.2, 21.0)                   # docked tail-first on the forward port


class Model:
    def __init__(self, scale_denom, shell_mm):
        self.mm_per_m = 1000.0 / scale_denom
        self.shell = shell_mm / self.mm_per_m     # module wall, real metres


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def box(x0, x1, y0, y1, z0, z1):
    return cq.Solid.makeBox(x1 - x0, y1 - y0, z1 - z0, Vector(x0, y0, z0))


def fuse(shapes):
    shapes = list(shapes)
    out = shapes[0].fuse(*shapes[1:]) if len(shapes) > 1 else shapes[0]
    cleaned = out.clean()
    return cleaned if cleaned.isValid() else out


def at(shape, theta):
    """Place a feature built at 12 o'clock (radial = +Y) at azimuth theta,
    measured clockwise from the front."""
    return shape.rotate(Vector(0, 0, 0), Vector(0, 0, 1), -theta)


def cyl(d, p0, p1):
    p0, p1 = Vector(*p0), Vector(*p1)
    v = p1 - p0
    return cq.Solid.makeCylinder(d / 2, v.Length, p0, v.normalized())


def octagon_prism(w, d, c, y0, y1):
    """A box w wide (X) and d deep (Z) with its four long edges chamfered by
    c, running radially from y0 to y1."""
    pts = [(-w / 2 + c, -d / 2), (w / 2 - c, -d / 2), (w / 2, -d / 2 + c), (w / 2, d / 2 - c),
           (w / 2 - c, d / 2), (-w / 2 + c, d / 2), (-w / 2, d / 2 - c), (-w / 2, -d / 2 + c)]
    wire = cq.Wire.makePolygon([Vector(x, y0, z) for x, z in pts], close=True)
    return cq.Solid.extrudeLinear(wire, [], Vector(0, y1 - y0, 0))


def recess(x0, x1, y0, y1, face, depth):
    """A pocket in the forward (face=+1) or aft (face=-1) face."""
    z = face * DEPTH / 2
    return box(x0, x1, y0, y1, z - depth if face > 0 else z - 1, z + 1 if face > 0 else z + depth)


def window_cluster(xc, yc, face, size=0.55, gap=0.25, depth=0.25):
    out = []
    for i in (-0.5, 0.5):
        for j in (-0.5, 0.5):
            x, y = xc + i * (size + gap), yc + j * (size + gap)
            out.append(recess(x - size / 2, x + size / 2, y - size / 2, y + size / 2, face, depth))
    return out


def bell(exit_d, length):
    """A bell nozzle with its exit at z=0, opening toward -Z, hollow."""
    r_e, r_t, w = exit_d / 2, exit_d * 0.18, 0.12
    outer = [(r_t + (r_e - r_t) * (s ** 0.6), -length * s) for s in np.linspace(0, 1, 9)]
    edges = [cq.Edge.makeLine(Vector(0, 0, 0.3), Vector(r_t * 1.3, 0, 0.3)),
             cq.Edge.makeLine(Vector(r_t * 1.3, 0, 0.3), Vector(*_xz(outer[0])))]
    edges.append(cq.Edge.makeSpline([Vector(*_xz(p)) for p in outer]))
    inner = [(r - w, z) for r, z in reversed(outer) if r - w > r_t * 0.6]
    edges.append(cq.Edge.makeLine(Vector(*_xz(outer[-1])), Vector(*_xz(inner[0]))))
    edges.append(cq.Edge.makeSpline([Vector(*_xz(p)) for p in inner]))
    edges.append(cq.Edge.makeLine(Vector(*_xz(inner[-1])), Vector(0, 0, inner[-1][1])))
    edges.append(cq.Edge.makeLine(Vector(0, 0, inner[-1][1]), Vector(0, 0, 0.3)))
    return cq.Solid.revolve(cq.Wire.assembleEdges(edges), [], 360,
                            Vector(0, 0, 0), Vector(0, 0, 1))


def _xz(p):
    return (p[0], 0, p[1])


# ---------------------------------------------------------------------------
# Ring modules
# ---------------------------------------------------------------------------
def module(m: Model, kind):
    """One module at 12 o'clock: X tangential, Y radial, Z along the axis.
    Returns (hull, dark parts)."""
    w = WIDTH_ENGINE if kind == "engine" else WIDTH
    body = octagon_prism(w, DEPTH, CHAMFER, R_IN, R_OUT)
    cuts, adds, dark = [], [], []
    L = R_OUT - R_IN

    # Radiator louvres along both side faces, outboard of the tunnels.
    for side in (-1, 1):
        for k in range(5):
            z = -1.6 + 0.8 * k
            x = side * w / 2
            cuts.append(box(x - 0.2, x + 0.2, R_IN + 6.2, R_OUT - 0.8, z - 0.14, z + 0.14))

    if kind == "command":
        # The flight deck: a 3 m sloped panel across the forward inner end,
        # a 2 x 3 grid of face panels, a window cluster and a dark strip.
        wedge = cq.Wire.makePolygon([Vector(-w, R_IN - 0.1, DEPTH / 2 + 0.1),
                                     Vector(-w, R_IN + 3.0, DEPTH / 2 + 0.1),
                                     Vector(-w, R_IN - 0.1, DEPTH / 2 - 3.1)], close=True)
        cuts.append(cq.Solid.extrudeLinear(wedge, [], Vector(2 * w, 0, 0)))
        for i in (-1, 1):
            for j in range(3):
                x0 = -2.7 if i < 0 else 0.2
                y0 = R_IN + 4.0 + j * 2.6
                cuts.append(recess(x0, x0 + 2.5, y0, y0 + 2.3, 1, 0.15))
        cuts += window_cluster(0, R_IN + 3.4, 1)
        cuts.append(recess(-2.7, 2.7, R_OUT - 1.3, R_OUT - 0.7, 1, 0.2))
    elif kind in ("habitat", "habitat_b", "pod", "cryo"):
        if kind == "habitat_b":
            # Two horizontal panel rows, like the command module's face.
            for j in range(2):
                y0 = R_IN + 4.2 + j * 3.6
                cuts.append(recess(-2.7, 2.7, y0, y0 + 3.0, 1, 0.15))
        else:
            # Two long blue-grey strips running out along the face.
            for x0 in (-2.4, 0.5):
                cuts.append(recess(x0, x0 + 1.9, R_IN + 3.6, R_OUT - 1.0, 1, 0.15))
        cuts += window_cluster(0, R_IN + 2.0, 1)
        if kind.startswith("habitat"):
            # The recessed window bay at the outer end of the aft face.
            cuts.append(recess(-2.2, 2.2, R_OUT - 3.4, R_OUT - 0.9, -1, 0.45))
    elif kind == "engine":
        # Aft face: a charcoal nozzle bay at the outer end with three bells
        # in a triangle (two outboard, one inboard), exits about flush; a
        # large circular fitting on the solid inner part; one small hatch on
        # the forward face.
        bay = 5.8
        cuts.append(recess(-bay / 2, bay / 2, R_OUT - 0.6 - bay, R_OUT - 0.6, -1, 1.6))
        for x, y in ((-1.45, R_OUT - 2.2), (1.45, R_OUT - 2.2), (0.0, R_OUT - 4.8)):
            dark.append(bell(2.7, 1.5).translate(Vector(x, y, -DEPTH / 2 + 0.05)))
        adds.append(cyl(3.4, (0, R_IN + 3.0, -DEPTH / 2 + 0.1), (0, R_IN + 3.0, -DEPTH / 2 - 0.25)))
        cuts.append(cyl(2.2, (0, R_IN + 3.0, -DEPTH / 2 - 0.3), (0, R_IN + 3.0, -DEPTH / 2 - 0.1)))
        cuts.append(recess(-0.5, 0.5, R_IN + 5.0, R_IN + 6.2, 1, 0.2))

    hull = body.cut(fuse(cuts)) if cuts else body
    if adds:
        hull = fuse([hull] + adds)

    if m.shell:
        # Hollow: a closed cavity, the chamfered box shrunk by the wall. The
        # engine modules stop short of their nozzle bay; the command module
        # stays clear of its sloped panel.
        s = m.shell
        y0, y1 = R_IN + s, R_OUT - s
        if kind == "engine":
            y1 = R_OUT - 0.6 - 5.8 - s
        if kind == "command":
            y0 = R_IN + 3.0 + s
        c = max(CHAMFER - s * (math.sqrt(2) - 1), 0.1)
        if y1 > y0 + 1:
            hull = hull.cut(octagon_prism(w - 2 * s, DEPTH - 2 * s, c, y0, y1))
    return hull, dark


def node():
    """A connector node at 12 o'clock on the node circle: a short cylinder
    along the spin axis with round hatches forward, aft and outboard."""
    n = cyl(NODE_D, (0, NODE_R, -NODE_L / 2), (0, NODE_R, NODE_L / 2))
    n = fuse([n, cyl(NODE_D * 0.8, (0, NODE_R, 0), (0, NODE_R + NODE_D / 2 + 0.25, 0))])
    hatches = [cyl(1.7, (0, NODE_R, NODE_L / 2 - 0.12), (0, NODE_R, NODE_L / 2 + 1)),
               cyl(1.7, (0, NODE_R, -NODE_L / 2 + 0.12), (0, NODE_R, -NODE_L / 2 - 1)),
               cyl(1.7, (0, NODE_R + NODE_D / 2 + 0.13, 0), (0, NODE_R + NODE_D, 0))]
    return n.cut(fuse(hatches))


def tunnels(theta_node):
    """The two tunnels from a node to its neighbours' side faces."""
    out = []
    a = math.radians(theta_node)
    p = (NODE_R * math.sin(a), NODE_R * math.cos(a), 0)
    for side, mod_theta in ((-1, theta_node - 15), (1, theta_node + 15)):
        w = WIDTH_ENGINE if dict(MODULES).get(mod_theta % 360) == "engine" else WIDTH
        # The attachment point on the module's side face, 4.7 m out from its
        # inner end, in that module's frame, then rotated into place.
        b = math.radians(mod_theta)
        lx = -side * (w / 2 - 0.3)
        ly = R_IN + 4.7
        q = (lx * math.cos(b) + ly * math.sin(b), -lx * math.sin(b) + ly * math.cos(b), 0)
        out.append(cyl(TUNNEL_D, p, q))
    return out


def airlock(theta):
    """A Ranger docking capsule standing out from a node."""
    a = math.radians(theta)
    u = Vector(math.sin(a), math.cos(a), 0)
    c = cyl(NODE_D, (u * NODE_R).toTuple(), (u * 29.2).toTuple())
    dome = cq.Solid.makeSphere(NODE_D / 2, Vector(0, 0, 0)).translate(u * 29.2)
    ring = cyl(NODE_D + 0.3, (u * 28.4).toTuple(), (u * 28.9).toTuple())
    return fuse([c, dome, ring])


# ---------------------------------------------------------------------------
# Hub, spoke, Ranger, landers
# ---------------------------------------------------------------------------
def hub_and_spoke():
    parts = [cyl(HUB_D, (0, 0, -HUB_D / 2), (0, 0, HUB_D / 2))]
    # Forward and aft axial docking ports, a ribbed collar on the forward one.
    parts.append(cyl(3.4, (0, 0, HUB_D / 2 - 0.1), (0, 0, RANGER_Z[0] + 0.1)))
    parts.append(cyl(3.4, (0, 0, -HUB_D / 2 + 0.1), (0, 0, -RANGER_Z[0] - 0.1)))
    for z in (2.0, 2.5, 3.0):
        parts.append(cyl(3.8, (0, 0, z - 0.12), (0, 0, z + 0.12)))
    # The spoke: three sections with narrower collars, to habitat B's inner
    # end at 3 o'clock.
    x = HUB_D / 2 - 0.2
    for L in (4.8, 4.8, 4.8):
        parts.append(cyl(SPOKE_COLLAR_D, (x, 0, 0), (x + 1.3, 0, 0)))
        x += 1.2
        parts.append(cyl(SPOKE_D, (x, 0, 0), (x + L, 0, 0)))
        x += L - 0.1
    parts.append(cyl(SPOKE_COLLAR_D, (x, 0, 0), (R_IN + 0.3, 0, 0)))
    # The stub toward the command module, ending in a hatch well short of it.
    parts.append(cyl(3.5, (-HUB_D / 2 + 0.2, 0, 0), (-8.4, 0, 0)))
    parts.append(cyl(3.9, (-8.4, 0, 0), (-8.9, 0, 0)))
    # Lander arms, up and down.
    for s in (1, -1):
        parts.append(cyl(2.6, (0, s * (HUB_D / 2 - 0.2), 0), (0, s * 6.2, 0)))
    return fuse(parts)


def ranger(aft=False):
    """A Ranger docked tail-first on an axial port, nose outward: a faceted
    lifting body 18 m long, 9 m in span, 3 m deep. The Thorne plan draws two
    end-on at the hub, one behind the other, wings toward the landers (Y);
    the film mostly shows the forward one."""
    z0, z1 = RANGER_Z

    def section(z, span, top, bottom, lift=0.0):
        # Corner insets scale with the section so the narrow nose stays a
        # simple (non-self-crossing) outline.
        a, b = min(1.2, 0.2 * span), min(2.6, 0.35 * span)
        pts = [(-0.3, -span / 2), (bottom, -span / 2 + a), (bottom, span / 2 - a),
               (-0.3, span / 2), (top, span / 2 - b), (top, -span / 2 + b)]
        return cq.Wire.makePolygon([Vector(x + lift, y, z) for x, y in pts], close=True)

    body = cq.Solid.makeLoft([section(z0, 9.0, 1.6, -1.4), section(z0 + 9, 9.0, 1.7, -1.4),
                              section(z1 - 3, 5.4, 1.0, -1.1), section(z1, 1.6, 0.25, -0.4, -0.5)],
                             True)
    # Canopy windows, and the tail engine block that seats in the port.
    body = body.cut(box(0.8, 2.5, -1.2, 1.2, z1 - 6.2, z1 - 4.4))
    tail = box(-1.1, 1.0, -2.6, 2.6, z0 - 0.4, z0 + 1.0)
    craft = fuse([body, tail])
    if aft:
        craft = craft.mirror("XY")
    return craft


def lander(side):
    """A lander on the +Y (side=1) or -Y arm, lying along the spin axis with
    its four engines aft: a faceted slab, 14.4 m x 4.8 m x 18 m."""
    z0, z1 = LANDER_Z
    y0 = side * 6.2
    w, t = LANDER_W, LANDER_T

    def section(z, ww, tt):
        c = min(1.9, 0.4 * tt)
        pts = [(-ww / 2 + c, 0), (ww / 2 - c, 0), (ww / 2, c), (ww / 2, tt - c),
               (ww / 2 - c, tt), (-ww / 2 + c, tt), (-ww / 2, tt - c), (-ww / 2, c)]
        return cq.Wire.makePolygon([Vector(x, y0 + side * y, z) for x, y in pts], close=True)

    body = cq.Solid.makeLoft([section(z0, w * 0.9, t * 0.85), section(z0 + 2.5, w, t),
                              section(z1 - 4.5, w, t), section(z1, w * 0.55, t * 0.6)], True)
    nozzles = []
    for x in (-5.0, -1.7, 1.7, 5.0):
        nozzles.append(bell(2.0, 1.6).translate(Vector(x, y0 + side * t / 2, z0 + 0.6)))
    return body, nozzles


# ---------------------------------------------------------------------------
# Assembly
# ---------------------------------------------------------------------------
def build(m: Model):
    ring, dark = [], []
    for theta, kind in MODULES:
        hull, d = module(m, kind)
        ring.append(at(hull, theta))
        dark += [at(x, theta) for x in d]
    nd = node()
    for k in range(12):
        t = 15 + 30 * k
        ring.append(at(nd, t))
        ring += tunnels(t)
    ring += [airlock(t) for t in AIRLOCKS]
    hub = hub_and_spoke()
    landers, lander_nozzles = [], []
    for s in (1, -1):
        b, n = lander(s)
        landers.append(b)
        lander_nozzles += n
    return {
        "ring": fuse(ring),
        "engine_nozzles": fuse(dark),
        "hub": hub,
        "ranger": fuse([ranger(), ranger(aft=True)]),
        "landers": fuse(landers),
        "lander_nozzles": fuse(lander_nozzles),
    }


COLOURS = {
    "ring": (0.86, 0.86, 0.84), "engine_nozzles": (0.16, 0.16, 0.17),
    "hub": (0.80, 0.80, 0.80), "ranger": (0.90, 0.90, 0.90),
    "landers": (0.34, 0.35, 0.37), "lander_nozzles": (0.16, 0.16, 0.17),
}


def to_mesh(shape, tol):
    """Tessellate, welding OCCT's per-face seams so the mesh is closed."""
    verts, tris = shape.tessellate(tol, 0.15)
    v = np.array([p.toTuple() for p in verts])
    t = np.array(tris, dtype=np.int64)
    v, inv = np.unique(np.round(v, 5), axis=0, return_inverse=True)
    t = inv.reshape(-1)[t]
    t = t[(t[:, 0] != t[:, 1]) & (t[:, 1] != t[:, 2]) & (t[:, 0] != t[:, 2])]
    return v, t


def write_stl(v, t, path: Path):
    tri = v[t].astype(np.float32)
    nrm = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    nrm /= np.maximum(np.linalg.norm(nrm, axis=1, keepdims=True), 1e-12)
    area = np.linalg.norm(np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]), axis=1)
    keep = area > 1e-12
    rec = np.zeros(int(keep.sum()), dtype=[("n", "<f4", 3), ("v", "<f4", (3, 3)), ("a", "<u2")])
    rec["n"], rec["v"] = nrm[keep], tri[keep]
    path.write_bytes(b"ENDURANCE print model".ljust(80, b" ")
                     + int(keep.sum()).to_bytes(4, "little") + rec.tobytes())


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--scale", type=float, default=300, help="scale denominator (default 1:300)")
    ap.add_argument("--shell", type=float, default=3.175,
                    help="hollow the ring modules with walls this thick, mm (default 1/8 in; 0 = solid)")
    ap.add_argument("--out", type=Path, default=Path(__file__).parent / "models")
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    tag = f"1-{args.scale:g}"

    m = Model(args.scale, args.shell)
    print(f"scale 1:{args.scale:g}  ({m.mm_per_m:.3f} mm per metre)")
    parts = {k: v.scale(m.mm_per_m) for k, v in build(m).items()}

    asm = cq.Assembly(name="endurance")
    for name, shape in parts.items():
        asm.add(shape, name=name, color=cq.Color(*COLOURS[name]))
    step = args.out / f"endurance_{tag}.step"
    asm.export(str(step))
    zpath = args.out / f"endurance_{tag}_step.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        z.write(step, step.name)
    step.unlink()
    print(f"wrote {zpath}  ({zpath.stat().st_size / 1e6:.1f} MB zipped)")
    glb = args.out / "endurance.glb"
    asm.export(str(glb), tolerance=0.02 * m.mm_per_m, angularTolerance=0.2)
    print("wrote", glb)

    # The print model: every body meshed, then unioned as meshes into one
    # watertight solid (OCCT's fuse of all of it is fragile; manifold3d's
    # mesh booleans are not).
    tol = 0.02 * (300 / args.scale) ** 0.5
    whole = None
    for name, shape in parts.items():
        v, t = to_mesh(shape, tol)
        piece = manifold3d.Manifold(manifold3d.Mesh(vert_properties=v.astype(np.float32),
                                                    tri_verts=t.astype(np.uint32)))
        if piece.status() != manifold3d.Error.NoError:
            raise RuntimeError(f"{name} does not mesh closed: {piece.status()}")
        whole = piece if whole is None else whole + piece
    out = whole.to_mesh()
    stl = args.out / f"endurance_{tag}.stl"
    write_stl(np.asarray(out.vert_properties)[:, :3], np.asarray(out.tri_verts), stl)
    lo, hi = whole.bounding_box()[:3], whole.bounding_box()[3:]
    print(f"wrote {stl}  ({hi[0] - lo[0]:.1f} x {hi[1] - lo[1]:.1f} x {hi[2] - lo[2]:.1f} mm, "
          f"{whole.num_tri()} triangles, manifold={whole.status() == manifold3d.Error.NoError})")


if __name__ == "__main__":
    main()
