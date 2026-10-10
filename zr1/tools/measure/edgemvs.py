"""3-D points on the car's lines, by multi-view edge consistency.

Panel gaps, creases and the outlines of lamps and openings are fixed on
the body: seen from any calibrated camera they project onto edges in its
image. Paint highlights and reflections move with the view and do not.
So for every edge pixel of a reference image, the depth along its ray is
the one at which the point lands on edges in the other images; a depth is
kept only when that agreement is strong and clearly better than at other
depths. The search runs from where the ray enters the visual hull to a
set depth inside it, which is how points inside hollows the hull cannot
see (the door scoop, the dip of the bonnet) are found.

Silhouette edges are excluded in the reference image: an occluding
contour is not a fixed curve on the surface.
"""

from __future__ import annotations

import numpy as np
import cv2

from camera import Camera


def edge_map(img: np.ndarray, car: np.ndarray, lo=30, hi=80) -> np.ndarray:
    """Canny edges inside the car mask, excluding a band along its outline."""
    g = img if img.ndim == 2 else cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)
    g = cv2.GaussianBlur(g, (0, 0), 1.0)
    e = cv2.Canny(g, lo, hi, L2gradient=True)
    inner = cv2.erode(car.astype(np.uint8), np.ones((9, 9), np.uint8))
    return (e > 0) & (inner > 0)


class View:
    def __init__(self, name, cam: Camera, img, car, unk, sigma=1.5):
        self.name, self.cam = name, cam
        self.car = car.astype(bool)
        self.edges = edge_map(img, car)
        # Distance to the nearest edge, for a smooth score.
        self.dist = cv2.distanceTransform((~self.edges).astype(np.uint8), cv2.DIST_L2, 3)
        self.sigma = sigma
        self.h, self.w = self.car.shape

    def score(self, X: np.ndarray):
        """Edge agreement in [0,1] of points X (N,3), and a validity flag
        (projects inside this image's car mask)."""
        uv = self.cam.project(X)
        z = self.cam.to_cam(X)[:, 2]
        u = np.round(uv[:, 0]).astype(int)
        v = np.round(uv[:, 1]).astype(int)
        ok = (z > 0) & (u >= 0) & (u < self.w) & (v >= 0) & (v < self.h)
        s = np.zeros(len(X))
        valid = np.zeros(len(X), bool)
        uu, vv = u[ok], v[ok]
        inside = self.car[vv, uu]
        d = self.dist[vv, uu]
        s[ok] = np.where(inside, np.exp(-0.5 * (d / self.sigma) ** 2), 0)
        valid[ok] = inside
        return s, valid


def hull_entry(occ, lo, vox, origin, dirs, t_max=40000.0, step=None):
    """Distance along each ray to the first occupied voxel (inf if none)."""
    step = step or vox * 0.5
    n = np.array(occ.shape)
    t_hit = np.full(len(dirs), np.inf)
    ts = np.arange(0, t_max, step)
    # Coarse march in chunks to bound memory.
    for i0 in range(0, len(dirs), 2000):
        D = dirs[i0:i0 + 2000]
        for t0 in range(0, len(ts), 400):
            tt = ts[t0:t0 + 400]
            P = origin[None, None, :] + tt[None, :, None] * D[:, None, :]
            idx = np.floor((P - lo) / vox + 0.5).astype(int)
            inb = np.all((idx >= 0) & (idx < n), axis=2)
            hit = np.zeros(inb.shape, bool)
            ii = idx[inb]
            hit[inb] = occ[ii[:, 0], ii[:, 1], ii[:, 2]]
            first = np.where(hit.any(1), hit.argmax(1), -1)
            todo = (first >= 0) & ~np.isfinite(t_hit[i0:i0 + 2000])
            t_hit[i0:i0 + 2000][todo] = tt[first[todo]]
            if np.all(np.isfinite(t_hit[i0:i0 + 2000])):
                break
    return t_hit


def reconstruct(ref: View, others: list[View], occ, lo, vox, depth=400.0, step=2.0,
                min_views=3, min_score=0.6, peak_ratio=1.35, subsample=2, topk=4):
    """3-D points for the reference view's edge pixels.

    For each pixel: depths from 15 mm before the hull entry to `depth` mm
    inside; at each, the mean of the best half of the other views' scores
    among views where the point projects inside the car. Kept when at
    least `min_views` views agree, the mean beats `min_score`, and the best
    depth beats the best depth farther than 15 mm away by `peak_ratio`."""
    vs, us = np.nonzero(ref.edges)
    sel = ((us + vs) % subsample) == 0
    uv = np.stack([us[sel], vs[sel]], 1).astype(float)
    C, D = ref.cam.ray(uv)
    t0 = hull_entry(occ, lo, vox, C, D)
    keep = np.isfinite(t0)
    uv, D, t0 = uv[keep], D[keep], t0[keep]
    ts = np.arange(-15.0, depth, step)
    pts, stats = [], []
    for i0 in range(0, len(uv), 1500):
        Dd, T0 = D[i0:i0 + 1500], t0[i0:i0 + 1500]
        n = len(Dd)
        T = T0[:, None] + ts[None, :]
        X = C[None, None, :] + T[:, :, None] * Dd[:, None, :]
        Xf = X.reshape(-1, 3)
        S = np.zeros((len(others), len(Xf)))
        Vd = np.zeros((len(others), len(Xf)), bool)
        for j, o in enumerate(others):
            S[j], Vd[j] = o.score(Xf)
        S = S.reshape(len(others), n, len(ts))
        Vd = Vd.reshape(len(others), n, len(ts))
        nv = Vd.sum(0)
        # mean of the best `topk` views among those where the point projects
        # inside the car (a line is often hidden from most views)
        Ssort = np.sort(np.where(Vd, S, 0), axis=0)[::-1]
        best = Ssort[:topk].mean(0)
        best = np.where(nv >= min_views, best, 0)
        j = best.argmax(1)
        b = best[np.arange(n), j]
        far = np.abs(ts[None, :] - ts[j][:, None]) > 15
        second = np.where(far, best, 0).max(1)
        ok = (b >= min_score) & (b >= peak_ratio * second)
        for i in np.nonzero(ok)[0]:
            pts.append(X[i, j[i]])
            stats.append((uv[i0 + i, 0], uv[i0 + i, 1], b[i], ts[j[i]], nv[i, j[i]]))
    return np.array(pts).reshape(-1, 3), np.array(stats).reshape(-1, 5)


def profiles(ref: View, others: list[View], occ, lo, vox, depth=350.0, step=2.0, max_angle=50.0,
             subsample=1, chunk=1500):
    """Per edge pixel of `ref`, the depth profile of edge agreement, scored
    only by views looking from within `max_angle` of the reference ray at
    the hull entry (they almost surely see the same surface point)."""
    vs, us = np.nonzero(ref.edges)
    sel = ((us + vs) % subsample) == 0
    uv = np.stack([us[sel], vs[sel]], 1).astype(float)
    C, D = ref.cam.ray(uv)
    t0 = hull_entry(occ, lo, vox, C, D)
    keep = np.isfinite(t0)
    uv, D, t0 = uv[keep], D[keep], t0[keep]
    ts = np.arange(-15.0, depth, step)
    prof = np.zeros((len(uv), len(ts)), np.float32)
    nview = np.zeros(len(uv), np.int16)
    cosmax = np.cos(np.radians(max_angle))
    for i0 in range(0, len(uv), chunk):
        Dd, T0 = D[i0:i0 + chunk], t0[i0:i0 + chunk]
        n = len(Dd)
        X0 = C + T0[:, None] * Dd
        T = T0[:, None] + ts[None, :]
        X = C[None, None, :] + T[:, :, None] * Dd[:, None, :]
        Xf = X.reshape(-1, 3)
        num = np.zeros(n * len(ts))
        den = np.zeros(n * len(ts))
        vr = -Dd
        for o in others:
            vo = o.cam.centre[None] - X0
            vo /= np.linalg.norm(vo, axis=1, keepdims=True)
            near = (vr * vo).sum(1) > cosmax
            if not near.any():
                continue
            s, v = o.score(Xf)
            w = (np.repeat(near, len(ts)) & v).astype(float)
            num += s * w
            den += w
            nview[i0:i0 + n] += near.astype(np.int16)
        prof[i0:i0 + n] = (num / np.maximum(den, 1)).reshape(n, len(ts))
    return uv, C, D, t0, ts, prof, nview


def pick(uv, C, D, t0, ts, prof, nview, radius=4.0, min_views=4, min_score=0.5, peak_ratio=1.25,
         sep=15.0):
    """Depth per pixel from its profile pooled with neighbours' (within
    `radius` px): strong, unique peaks only."""
    from scipy.spatial import cKDTree
    tree = cKDTree(uv)
    nb = tree.query_ball_point(uv, radius)
    out, st = [], []
    for i, idx in enumerate(nb):
        if nview[i] < min_views:
            continue
        p = prof[idx].mean(0)
        j = int(p.argmax())
        far = np.abs(ts - ts[j]) > sep
        second = p[far].max() if far.any() else 0
        if p[j] >= min_score and p[j] >= peak_ratio * second:
            out.append(C + (t0[i] + ts[j]) * D[i])
            st.append((uv[i, 0], uv[i, 1], p[j], ts[j], nview[i], len(idx)))
    return np.array(out).reshape(-1, 3), np.array(st).reshape(-1, 6)
