"""Thin blades from a fat visual hull (hull_paint.py) of a dive plane.

A hull carved from views is as thick as no view could disprove — the dive
plane comes out ~35 mm thick against a real blade of a few millimetres.
Its position, width and tilt are well measured, though, so each slice
x = const of the hull is reduced to its principal axis (the long direction
of the section) and a plate `T` mm thick is built on it; consecutive plates
are lofted. Two arms: the rising dive plane above `ZS` and the splitter's
side edge below it.

usage: blade_rings.py hull.ply out.json [x0 x1 step]
Writes {"upper": rings, "lower": rings} on the measured side (y < 0)."""
import sys, json, numpy as np, trimesh
T = 8.0
ZS = 172.0
h = trimesh.load(sys.argv[1], process=False)
x0, x1, step = (float(a) for a in sys.argv[3:6]) if len(sys.argv) > 5 else (-745.0, -390.0, 15.0)
arms = {'upper': [], 'lower': []}
for x in np.arange(x0, x1 + 1e-9, step):
    s = h.section(plane_origin=[x, 0, 0], plane_normal=[1, 0, 0])
    if s is None:
        continue
    P = np.vstack([e for e in s.discrete])[:, 1:]
    for arm, sel in (('upper', P[:, 1] >= ZS), ('lower', P[:, 1] < ZS)):
        Q = P[sel]
        if len(Q) < 8:
            continue
        c = Q.mean(0)
        u, sv, vt = np.linalg.svd(Q - c, full_matrices=False)
        d = vt[0] if vt[0][0] < 0 else -vt[0]          # outward: toward -y
        n = np.array([-d[1], d[0]])
        a, b = ((Q - c) @ d).min(), ((Q - c) @ d).max()
        ring = [c + d * a - n * T / 2, c + d * b - n * T / 2, c + d * b + n * T / 2, c + d * a + n * T / 2]
        arms[arm].append([[round(float(x), 1), round(float(p[0]), 1), round(float(p[1]), 1)] for p in ring])
for k, r in arms.items():
    print(k, len(r), 'rings', 'x', r[0][0][0] if r else None, '..', r[-1][0][0] if r else None)
json.dump(arms, open(sys.argv[2], 'w'))
