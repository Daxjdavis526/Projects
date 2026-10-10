"""Cage clean-up after fitting.

relax_caps     evens out the nose and tail cap grids: every interior cap
               vertex moves toward the mean of its four grid neighbours in
               the end face's plane (y, z), keeping its x, so no thin quads
               are left where the cap meets the last loop.
smooth_near    Laplacian smoothing of the cage vertices around given ones
               (rings of quad neighbours), used to undo a fold the mesh gate
               reports.
"""

import numpy as np


def relax_caps(C, V, iters=60, w=0.5):
    V = V.copy()
    for cap, i in (('F', 0), ('B', C.NV - 1)):
        def gid(u, v):
            if 0 < u < C.a and 0 < v < C.b:
                return C.ids[(cap, u, v)]
            return C.ids[('L', i, C.ring_index(u, v))]
        inner = [(u, v) for u in range(1, C.a) for v in range(1, C.b)]
        for _ in range(iters):
            new = {}
            for u, v in inner:
                nb = [gid(u - 1, v), gid(u + 1, v), gid(u, v - 1), gid(u, v + 1)]
                m = V[nb].mean(0)
                k = gid(u, v)
                p = V[k].copy()
                p[1:] = (1 - w) * p[1:] + w * m[1:]
                new[k] = p
            for k, p in new.items():
                V[k] = p
        # exact symmetry on the centre column
        for v in range(1, C.b):
            V[gid(C.T, v), 1] = 0.0
    return V


def quad_neighbours(C):
    nb = [set() for _ in range(C.n)]
    for q in C.Q:
        for a in q:
            nb[a].update(int(b) for b in q if b != a)
    return nb


def smooth_near(C, V, seeds, rings=2, iters=10, w=0.5):
    nb = quad_neighbours(C)
    region = set(int(s) for s in seeds)
    for _ in range(rings):
        region |= {b for a in list(region) for b in nb[a]}
    region = sorted(region)
    mir = C.mirror_of()
    right, centre = C.halves()
    V = V.copy()
    for _ in range(iters):
        for a in region:
            V[a] = (1 - w) * V[a] + w * V[sorted(nb[a])].mean(0)
        # symmetry
        for a in region:
            if centre[a]:
                V[a, 1] = 0.0
            else:
                V[mir[a]] = V[a] * [1, -1, 1]
    return V


def smooth_columns(C, V, passes=20, w=0.5, loop_passes=3):
    """Iron out station-to-station waves: [1 2 1]/4 smoothing along every
    longitudinal column (end loops held), then a little around the loops."""
    V = V.copy()
    cols = [np.array([C.ids[('L', i, r)] for i in range(C.NV)]) for r in range(C.R)]
    for _ in range(passes):
        for col in cols:
            P = V[col]
            Q = P.copy()
            Q[1:-1] = (1 - w) * P[1:-1] + w * 0.5 * (P[:-2] + P[2:])
            V[col] = Q
    for _ in range(loop_passes):
        for i in range(C.NV):
            L = C.loop(i)
            P = V[L]
            V[L] = (1 - w) * P + w * 0.5 * (np.roll(P, 1, 0) + np.roll(P, -1, 0))
    right, centre = C.halves()
    mir = C.mirror_of()
    V = 0.5 * (V + V[mir] * [1, -1, 1])
    V[centre, 1] = 0.0
    return V
