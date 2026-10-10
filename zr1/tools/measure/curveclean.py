"""Denoising the measured 3-D curve points.

The multi-view line points scatter ~5 mm about the true lines (local
line-fit rms). Each point is moved onto a local quadratic curve fitted to
its neighbours within `r` mm on the same curve segment (moving least
squares along the curve: the noise across the curve averages out, the
curve's own bend is kept), twice; points whose neighbourhood is too small
or not line-like are dropped."""

from __future__ import annotations

import numpy as np
from scipy.spatial import cKDTree

from segments import segment


def mls_curve(Q, r=20.0, min_n=6):
    t = cKDTree(Q)
    out = np.full_like(Q, np.nan)
    for i, nb in enumerate(t.query_ball_point(Q, r)):
        if len(nb) < min_n:
            continue
        N = Q[nb]
        c = N.mean(0)
        _, s, vt = np.linalg.svd(N - c, full_matrices=False)
        u, e1, e2 = vt
        tt = (N - c) @ u
        A = np.stack([np.ones_like(tt), tt, tt ** 2], 1)
        w = np.exp(-0.5 * (np.linalg.norm(N - Q[i], axis=1) / (0.5 * r)) ** 2)
        Aw = A * w[:, None]
        cv, *_ = np.linalg.lstsq(Aw, ((N - c) @ e1) * w, rcond=None)
        cw, *_ = np.linalg.lstsq(Aw, ((N - c) @ e2) * w, rcond=None)
        tp = (Q[i] - c) @ u
        a = np.array([1, tp, tp * tp])
        out[i] = c + u * tp + e1 * (a @ cv) + e2 * (a @ cw)
    return out


def clean(P, r=20.0, passes=2, thin_mm=3.0):
    segs, _, _ = segment(P)
    out = []
    for idx in segs:
        Q = P[idx]
        for _ in range(passes):
            Q = mls_curve(Q, r)
            Q = Q[np.isfinite(Q[:, 0])]
            if len(Q) < 6:
                break
        if len(Q) >= 6:
            out.append(Q)
    C = np.concatenate(out) if out else np.zeros((0, 3))
    key = np.floor(C / thin_mm).astype(np.int64)
    _, first = np.unique(key, axis=0, return_index=True)
    return C[np.sort(first)], len(segs)
