"""The skin divided into paint and the regions that are not paint.

Input: the skin mesh and texmap's per-vertex paint probability and colour.
Unseen vertices take the values of the nearest seen ones along the mesh;
the probability is smoothed over the mesh (a few neighbour averages) and
thresholded; faces vote by their vertices. The unpainted faces fall into
connected regions (shared edges), each summarised for labelling: area,
centroid, mean colour of the white render, mean normal, bounding box.
"""

from __future__ import annotations

import numpy as np
import scipy.sparse as sp
from scipy.sparse.csgraph import connected_components


def adjacency(F, n):
    E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    A = sp.coo_matrix((np.ones(len(E)), (E[:, 0], E[:, 1])), shape=(n, n))
    A = ((A + A.T) > 0).astype(float).tocsr()
    return A


def fill_unseen(A, val):
    """Propagate finite values into NaN vertices by repeated neighbour means."""
    v = val.copy()
    single = v.ndim == 1
    if single:
        v = v[:, None]
    known = np.all(np.isfinite(v), axis=1)
    for _ in range(400):
        if known.all():
            break
        s = A @ np.where(known[:, None], v, 0)
        c = A @ known.astype(float)
        new = (~known) & (c > 0)
        v[new] = s[new] / c[new, None]
        known = known | new
    return v[:, 0] if single else v


def smooth(A, val, iters=3):
    deg = np.asarray(A.sum(1)).ravel()
    for _ in range(iters):
        val = 0.5 * val + 0.5 * (A @ val) / deg
    return val


def face_adjacency(F):
    E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    fid = np.tile(np.arange(len(F)), 3)
    key = np.sort(E, 1)
    order = np.lexsort((key[:, 1], key[:, 0]))
    key, fid = key[order], fid[order]
    same = np.all(key[1:] == key[:-1], axis=1)
    i = np.nonzero(same)[0]
    return fid[i], fid[i + 1]


def regions(V, F, prob, colour, threshold=0.5, smooth_iters=3):
    n = len(V)
    A = adjacency(F, n)
    p = fill_unseen(A, prob)
    col = fill_unseen(A, colour)
    p = smooth(A, p, smooth_iters)
    paint_v = p >= threshold
    paint_f = paint_v[F].sum(1) >= 2
    f0, f1 = face_adjacency(F)
    keep = (~paint_f[f0]) & (~paint_f[f1])
    G = sp.coo_matrix((np.ones(keep.sum()), (f0[keep], f1[keep])), shape=(len(F), len(F)))
    nc, lab = connected_components(G, directed=False)
    lab = np.where(paint_f, -1, lab)
    # renumber by area
    tri = V[F]
    area = 0.5 * np.linalg.norm(np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0]), axis=1)
    fn = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    ids = np.unique(lab[lab >= 0])
    areas = np.array([area[lab == i].sum() for i in ids])
    order = ids[np.argsort(-areas)]
    remap = {old: new for new, old in enumerate(order)}
    lab2 = np.array([remap.get(l, -1) for l in lab])
    info = []
    fc = tri.mean(1)
    for new, old in enumerate(order):
        m = lab2 == new
        a = area[m].sum()
        nrm = fn[m].sum(0); nrm /= max(np.linalg.norm(nrm), 1e-9)
        c = (col[F[m]].mean(1) * area[m, None]).sum(0) / a
        info.append(dict(id=new, area_mm2=float(a), faces=int(m.sum()),
                         centroid=((fc[m] * area[m, None]).sum(0) / max(a, 1e-9)).tolist(),
                         normal=nrm.tolist(), colour_bgr=c.tolist(),
                         lo=fc[m].min(0).tolist(), hi=fc[m].max(0).tolist()))
    return lab2, info, p, col
