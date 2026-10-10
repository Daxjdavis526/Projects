"""Named 3-D curves picked out of the measured curve clouds.

The clouds (paint boundaries, creases, stripe edges; all triangulated in
many views) are pooled on the car's left side (y < 0; right-side points
mirrored). A curve is named by a polygon drawn on one orthographic map
('side' x-z, 'top' x-y, 'front' y-z) and a range on the remaining axis;
the points inside are ordered along the curve and fitted with a smoothing
spline, outliers dropped by their distance to it. The result is a polyline
in millimetres, left side.
"""

from __future__ import annotations

import json
import numpy as np
from matplotlib.path import Path

AXES = {'side': (0, 2, 1), 'top': (0, 1, 2), 'front': (1, 2, 0)}


def pool(*arrays):
    P = np.concatenate([a[:, :3] for a in arrays])
    return np.concatenate([P[P[:, 1] <= 0], P[P[:, 1] > 0] * [1, -1, 1]])


def select(P, view, poly, third=None):
    a, b, c = AXES[view]
    inside = Path(np.asarray(poly, float)).contains_points(P[:, [a, b]])
    if third is not None:
        inside &= (P[:, c] >= third[0]) & (P[:, c] <= third[1])
    return P[inside]


def order(Q, start=None):
    """Order points along the curve: nearest-neighbour chain from one end of
    the principal axis, then the chain reversed if `start` is nearer its tail."""
    c = Q.mean(0)
    u = np.linalg.svd(Q - c, full_matrices=False)[2][0]
    s = (Q - c) @ u
    return Q[np.argsort(s)]


def fit(Q, smooth=2.0, spacing=10.0, iters=4, keep=2.5, axis=None):
    """Robust smoothing-spline curve through the points, parametrised by their
    projection on the principal axis (or on `axis`, e.g. x for a longitudinal
    line): each coordinate is a smoothing spline of that parameter, points
    farther than `keep` x rms from it are dropped and the fit repeated.
    Returns (curve polyline, residual rms, points kept)."""
    from scipy.interpolate import UnivariateSpline
    c = Q.mean(0)
    u = np.linalg.svd(Q - c, full_matrices=False)[2][0] if axis is None else np.asarray(axis, float)
    if axis is None and u[np.argmax(np.abs(u))] < 0:
        u = -u
    for _ in range(iters):
        t = (Q - c) @ u
        o = np.argsort(t)
        Q, t = Q[o], t[o]
        t = t + np.arange(len(t)) * 1e-6            # strictly increasing
        # bin to 3 mm along t so dense clusters do not dominate
        b = np.floor((t - t[0]) / 3.0).astype(int)
        _, first, cnt = np.unique(b, return_index=True, return_counts=True)
        tb = np.add.reduceat(t, first) / cnt
        Qb = np.stack([np.add.reduceat(Q[:, k], first) / cnt for k in range(3)], 1)
        w = np.sqrt(cnt)
        sp = [UnivariateSpline(tb, Qb[:, k], w=w / w.mean(), s=len(tb) * smooth ** 2, k=3) for k in range(3)]
        R = np.stack([s(t) for s in sp], 1)
        d = np.linalg.norm(Q - R, axis=1)
        rms = np.sqrt(np.mean(d ** 2))
        keep_ = d < max(keep * rms, 2.0)
        if keep_.all():
            break
        Q = Q[keep_]
    t = (Q - c) @ u
    tt = np.linspace(t.min(), t.max(), 4000)
    C = np.stack([s(tt) for s in sp], 1)
    L = np.sum(np.linalg.norm(np.diff(C, axis=0), axis=1))
    n = max(int(L / spacing), 4)
    tt = np.linspace(t.min(), t.max(), n)
    C = np.stack([s(tt) for s in sp], 1)
    return C, float(rms), len(Q)


class CurveBook:
    def __init__(self, path):
        self.path = path
        try:
            self.data = json.load(open(path))
        except FileNotFoundError:
            self.data = {}

    def add(self, name, C, meta):
        self.data[name] = {'pts': np.round(C, 2).tolist(), **meta}
        json.dump(self.data, open(self.path, 'w'), indent=0)

    def get(self, name):
        return np.array(self.data[name]['pts'])
