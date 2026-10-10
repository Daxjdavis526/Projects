"""Surface corrections from multi-view agreement of the paint masks.

Where the mesh lies in the wrong place, the views disagree about whether a
point near a paint boundary is paint: each projects it to a different
side of the boundary. For every such vertex the offset t along its normal
is searched (-range..range mm) for the position where all the views that
see it agree, i.e. where the weighted variance of their (slightly
blurred) paint masks is least. Only offsets that are clearly better than
the rest are kept. Inside a large painted or unpainted area every offset
agrees and the vertex gets no target, so fairness and silhouettes decide
there. A grille's inner bars lie far behind the skin and never agree near
it, so they cannot pull the skin in.
"""

from __future__ import annotations

import numpy as np
import cv2

import photo
import paint
from texmap import bilinear


def soft_masks(views, sigma=1.2):
    out = {}
    for vd in views:
        sh, pm, car = paint.shading(vd.name)
        m = cv2.GaussianBlur(pm.astype(np.float32), (0, 0), sigma)
        out[vd.name] = (m, car)
    return out


def visibility(V, F, cam, depth_tol=12.0):
    tid, (yy, xx, t, bary) = photo.raster(V, F, cam)
    z = cam.to_cam(V)[:, 2]
    zbuf = np.full(tid.shape, np.inf, np.float32)
    zbuf[yy, xx] = (z[F[t]] * bary).sum(1)
    uv = cam.project(V)
    u, v = np.round(uv[:, 0]).astype(int), np.round(uv[:, 1]).astype(int)
    inb = (u >= 1) & (u < cam.w - 1) & (v >= 1) & (v < cam.h - 1)
    ids = np.nonzero(inb)[0]
    zz = np.minimum.reduce([zbuf[v[ids] + dv, u[ids] + du] for dv in (-1, 0, 1) for du in (-1, 0, 1)])
    return ids[np.abs(z[ids] - zz) < depth_tol]


def targets(V, F, views, masks, prob, band=(0.08, 0.92), rng=60.0, step=2.0, min_views=3,
            min_cos=0.25, prior=2e-6, ratio=0.5):
    """Per-vertex offsets along the normal that make the views agree.

    Returns (vertex ids, offsets t, confidence)."""
    vn = photo.vertex_normals(V, F)
    cand = np.nonzero(np.isfinite(prob) & (prob > band[0]) & (prob < band[1]))[0]
    # widen to the 2-ring so vertices just outside a misplaced boundary are included
    E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    mark = np.zeros(len(V), bool); mark[cand] = True
    for _ in range(3):
        m2 = mark.copy()
        m2[E[mark[E[:, 0]], 1]] = True; m2[E[mark[E[:, 1]], 0]] = True
        mark = m2
    cand = np.nonzero(mark)[0]
    ts = np.arange(-rng, rng + 1e-9, step)
    nt = len(ts)
    S1 = np.zeros((len(cand), nt)); S2 = np.zeros((len(cand), nt)); W = np.zeros((len(cand), nt))
    nview = np.zeros(len(cand))
    pos = {c: i for i, c in enumerate(cand)}
    for vd in views:
        cam = vd.cam
        m, car = masks[vd.name]
        vis = visibility(V, F, cam)
        vis = vis[np.isin(vis, cand)]
        if len(vis) == 0:
            continue
        vdir = cam.centre[None] - V[vis]
        vdir /= np.linalg.norm(vdir, axis=1, keepdims=True)
        cosv = (vn[vis] * vdir).sum(1)
        keep = cosv > min_cos
        vis, cosv = vis[keep], cosv[keep]
        P = V[vis][:, None, :] + ts[None, :, None] * vn[vis][:, None, :]
        uv = cam.project(P.reshape(-1, 3))
        val = bilinear(m, uv)[:, 0].reshape(len(vis), nt)
        bad = (bilinear(vd.bad_d.astype(np.float32), uv)[:, 0].reshape(len(vis), nt) > 0.01) | \
              (bilinear(car.astype(np.float32), uv)[:, 0].reshape(len(vis), nt) < 0.5)
        w = (cosv ** 2)[:, None] * (~bad)
        idx = np.array([pos[c] for c in vis])
        np.add.at(S1, idx, w * val); np.add.at(S2, idx, w * val * val); np.add.at(W, idx, w)
        np.add.at(nview, idx, 1)
    mean = S1 / np.maximum(W, 1e-9)
    var = S2 / np.maximum(W, 1e-9) - mean ** 2
    var = np.where(W > 1e-6, var, np.inf) + prior * ts[None, :] ** 2
    j = np.argmin(var, axis=1)
    best = var[np.arange(len(cand)), j]
    # the alternative: the best variance more than 10 mm away
    far = np.abs(ts[None, :] - ts[j][:, None]) > 10
    second = np.where(far, var, np.inf).min(1)
    vf = np.where(np.isfinite(var), var, np.nan)
    med = np.nanmedian(vf, axis=1)
    ok = (nview >= min_views) & np.isfinite(best) & (best < ratio * second) & (best < 0.5 * med) & \
         (np.abs(ts[j]) < rng - step)
    conf = np.clip(1 - best / np.maximum(med, 1e-9), 0, 1)
    return cand[ok], ts[j][ok], conf[ok]
