"""The curve clouds broken into individual curve segments.

Points (left side, thinned) are linked to neighbours within `radius` when
the offset between them runs along both points' local direction (first
principal axis of their neighbourhood) and the directions agree; the
connected pieces are curve segments. Crossing curves stay apart because a
link across a crossing is not along either direction.
"""

from __future__ import annotations

import numpy as np
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components


def directions(P, r=15.0, min_n=5):
    tree = cKDTree(P)
    nb = tree.query_ball_point(P, r)
    D = np.zeros_like(P)
    lin = np.zeros(len(P))
    for i, idx in enumerate(nb):
        if len(idx) < min_n:
            continue
        Q = P[idx] - P[idx].mean(0)
        _, s, vt = np.linalg.svd(Q, full_matrices=False)
        D[i] = vt[0]
        lin[i] = (s[0] - s[1]) / max(s[0], 1e-9)       # 1 = perfectly linear
    return D, lin


def segment(P, radius=8.0, r_dir=15.0, cos_link=0.85, cos_dir=0.9, min_lin=0.5, min_len=40.0):
    D, lin = directions(P, r_dir)
    ok = lin > min_lin
    tree = cKDTree(P)
    pairs = tree.query_pairs(radius, output_type='ndarray')
    a, b = pairs[:, 0], pairs[:, 1]
    keep = ok[a] & ok[b]
    off = P[b] - P[a]
    L = np.maximum(np.linalg.norm(off, axis=1), 1e-9)
    u = off / L[:, None]
    keep &= (np.abs((u * D[a]).sum(1)) > cos_link) & (np.abs((u * D[b]).sum(1)) > cos_link)
    keep &= np.abs((D[a] * D[b]).sum(1)) > cos_dir
    a, b = a[keep], b[keep]
    G = coo_matrix((np.ones(len(a)), (a, b)), shape=(len(P), len(P)))
    nc, lab = connected_components(G, directed=False)
    segs = []
    for c in range(nc):
        idx = np.nonzero(lab == c)[0]
        if len(idx) < 6:
            continue
        Q = P[idx]
        ext = np.ptp(Q @ np.linalg.svd(Q - Q.mean(0), full_matrices=False)[2][0])
        if ext >= min_len:
            segs.append(idx)
    segs.sort(key=lambda s: -len(s))
    return segs, D, lin
