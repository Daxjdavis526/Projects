"""Catmull-Clark subdivision with sharp creases, as a sparse linear map.

The body skin is a quad cage — a few hundred control points arranged the
way a car modeller lays out edge loops — and the surface is its
Catmull-Clark subdivision. Every subdivided vertex is a fixed linear
combination of cage vertices, so `subdivide` returns the quads at the
requested level together with a sparse matrix S (n_fine x n_cage): fine
vertices = S @ cage vertices. Fitting the cage to the views is then linear
algebra on the cage, and fairness is a property of the representation:
a sparse cage cannot make a lump.

Creases: every cage edge carries an integer sharpness s. At each level a
sharp edge (s > 0) is split at its midpoint and its two children carry
s - 1; a vertex on exactly two sharp edges follows the crease rule
(e0 + 6 v + e1) / 8, on three or more it stays put (corner). A large s
gives a crease that stays sharp at every level (DeRose, Kass and Truong,
SIGGRAPH 1998, section 3, integer-sharpness case).
"""

from __future__ import annotations

import numpy as np
import scipy.sparse as sp


def _edges(Q):
    """Unique undirected edges of a quad mesh and, per face, its four edge ids."""
    E = np.stack([Q, np.roll(Q, -1, axis=1)], 2).reshape(-1, 2)      # (4m, 2): (q0,q1),(q1,q2),...
    key = np.sort(E, 1)
    uniq, inv = np.unique(key, axis=0, return_inverse=True)
    return uniq, inv.reshape(-1, 4)


def step(Q, n, sharp=None, corners=None):
    """One Catmull-Clark level. Returns (Q2, n2, M, sharp2) with M (n2 x n) sparse."""
    m = len(Q)
    E, FE = _edges(Q)
    ne = len(E)
    sharp = np.zeros(ne) if sharp is None else np.asarray(sharp, float)
    # faces per edge
    ef = [[] for _ in range(ne)]
    for f in range(m):
        for k in range(4):
            ef[FE[f, k]].append(f)
    if any(len(x) != 2 for x in ef):
        raise ValueError('cage is not a closed 2-manifold')
    ef = np.array(ef)
    rows, cols, vals = [], [], []

    def put(r, c, w):
        rows.append(r); cols.append(c); vals.append(w)

    # face points (as combinations of cage vertices): index n + ne + f
    fp = [dict() for _ in range(m)]
    for f in range(m):
        for v in Q[f]:
            fp[f][v] = fp[f].get(v, 0) + 0.25
    # edge points: index n + e
    ep = []
    for e in range(ne):
        a, b = E[e]
        d = {}
        if sharp[e] > 0:
            d[a] = 0.5; d[b] = d.get(b, 0) + 0.5
        else:
            d[a] = 0.25; d[b] = d.get(b, 0) + 0.25
            for f in ef[e]:
                for v, w in fp[f].items():
                    d[v] = d.get(v, 0) + 0.25 * w
        ep.append(d)
    # vertex points
    vfaces = [[] for _ in range(n)]
    for f in range(m):
        for v in Q[f]:
            vfaces[v].append(f)
    vedges = [[] for _ in range(n)]
    for e in range(ne):
        vedges[E[e, 0]].append(e); vedges[E[e, 1]].append(e)
    corner = np.zeros(n, bool) if corners is None else np.asarray(corners, bool)
    for v in range(n):
        es = vedges[v]
        k = len(es)
        sh = [e for e in es if sharp[e] > 0]
        if corner[v] or len(sh) >= 3:
            put(v, v, 1.0)
        elif len(sh) == 2:
            put(v, v, 0.75)
            for e in sh:
                o = E[e, 1] if E[e, 0] == v else E[e, 0]
                put(v, o, 0.125)
        else:
            # (Q + 2R + (k-3) S) / k
            d = {v: (k - 3) / k}
            for f in vfaces[v]:
                for u, w in fp[f].items():
                    d[u] = d.get(u, 0) + w / (len(vfaces[v]) * k)
            for e in es:
                a, b = E[e]
                d[a] = d.get(a, 0) + 2 * 0.5 / (k * k)
                d[b] = d.get(b, 0) + 2 * 0.5 / (k * k)
            for u, w in d.items():
                put(v, u, w)
    for e in range(ne):
        for u, w in ep[e].items():
            put(n + e, u, w)
    for f in range(m):
        for u, w in fp[f].items():
            put(n + ne + f, u, w)
    n2 = n + ne + m
    M = sp.csr_matrix((vals, (rows, cols)), shape=(n2, n))
    # new quads: (v, e_next, f, e_prev)
    Q2 = np.empty((4 * m, 4), int)
    for k in range(4):
        Q2[k::4] = np.stack([Q[:, k], n + FE[:, k], n + ne + np.arange(m), n + FE[:, (k - 1) % 4]], 1)
    # sharpness of new edges: children of an old edge carry s-1, the rest 0
    E2, _ = _edges(Q2)
    s2 = np.zeros(len(E2))
    lookup = {tuple(x): i for i, x in enumerate(E2)}
    for e in range(ne):
        if sharp[e] > 0:
            a, b = E[e]
            for u in (a, b):
                key = tuple(sorted((u, n + e)))
                s2[lookup[key]] = sharp[e] - 1
    corners2 = np.zeros(n2, bool)
    corners2[:n] = corner
    return Q2, n2, M, s2, corners2


def subdivide(Q, n, levels, sharp=None, corners=None):
    """Quads after `levels` steps and S (n_fine x n) with fine = S @ cage."""
    S = sp.identity(n, format='csr')
    for _ in range(levels):
        Q, n, M, sharp, corners = step(Q, n, sharp, corners)
        S = (M @ S).tocsr()
    return Q, S, sharp


def edge_sharpness(Q, crease_pairs, s=99):
    """Sharpness array for the cage's unique-edge order: `crease_pairs` is a
    list of (a, b) vertex pairs to mark with sharpness s."""
    E, _ = _edges(Q)
    lookup = {tuple(x): i for i, x in enumerate(E)}
    out = np.zeros(len(E))
    for a, b in crease_pairs:
        out[lookup[tuple(sorted((a, b)))]] = s
    return out


def triangles(Q):
    """Split quads into triangles along the shorter-index diagonal (for meshes and rendering)."""
    return np.concatenate([Q[:, [0, 1, 2]], Q[:, [0, 2, 3]]])
