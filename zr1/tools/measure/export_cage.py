"""Write a fitted cage (and optional displacement layer) as zr1/data/body_cage.json.

    python export_cage.py <cage.pkl> <out.json> [--detail fine.ply] [--creases creases.json]

The file holds the full cage (both halves, millimetres, x rearward from
the front axle, y right, z up), its quads (outward, counter-clockwise),
the sharp edges as (a, b, sharpness), and optionally the fine detail: for
every vertex of the cage's 3-step subdivision, the offset along that
vertex's quad-diagonal normal (subd.quad_normals) that carries it to the
refined surface, stored as integers in units of `disp_scale_mm`."""

import argparse
import json
import pickle
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from subd import subdivide  # noqa: E402

SCALE = 0.02


def quad_normals(V, Q):
    n = np.zeros_like(V)
    fn = np.cross(V[Q[:, 2]] - V[Q[:, 0]], V[Q[:, 3]] - V[Q[:, 1]])
    for k in range(4):
        np.add.at(n, Q[:, k], fn)
    return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cage'); ap.add_argument('out')
    ap.add_argument('--detail'); ap.add_argument('--creases'); ap.add_argument('--levels', type=int, default=3)
    a = ap.parse_args()
    C, V = pickle.load(open(a.cage, 'rb'))
    creases = json.load(open(a.creases)) if a.creases else []
    out = {
        'note': 'Measured C8 ZR1 body skin (tools/measure): Catmull-Clark subdivision of this cage, '
                'displaced along its normals by the fine detail.',
        'frame': 'mm; x rearward from the front axle, y to the right, z up from the ground',
        'NV': C.NV, 'T': C.T, 'SIDE': C.SIDE,
        'levels': [a.levels],
        'vertices': [[round(float(c), 3) for c in p] for p in V],
        'quads': [[int(i) for i in q] for q in C.Q],
        'creases': [[int(x), int(y), int(s)] for x, y, s in creases],
    }
    if a.detail:
        import trimesh
        fine = np.asarray(trimesh.load(a.detail, process=False).vertices, float)
        sh = None
        Q, S, sh = subdivide(C.Q, C.n, a.levels, None if not creases else None)
        base = S @ V
        if len(fine) != len(base):
            raise SystemExit(f'detail has {len(fine)} vertices, subdivision {len(base)}')
        N = quad_normals(base, Q)
        d = ((fine - base) * N).sum(1)
        tang = np.linalg.norm((fine - base) - d[:, None] * N, axis=1)
        print(f'displacement: |d| p50 {np.median(np.abs(d)):.2f} p99 {np.percentile(np.abs(d), 99):.2f} max {np.abs(d).max():.2f} mm; '
              f'tangential residual dropped p99 {np.percentile(tang, 99):.2f} mm')
        out['disp_scale_mm'] = [SCALE]
        out['disp'] = [int(x) for x in np.round(d / SCALE)]
    with open(a.out, 'w') as f:
        json.dump(out, f, separators=(',', ':'))
    print(a.out, len(V), 'cage vertices', len(C.Q), 'quads', len(creases), 'creases')


if __name__ == '__main__':
    main()
