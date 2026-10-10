"""3-D feature curves from their images in several calibrated views.

A feature curve (a crease, a panel gap, the edge of a lamp or opening) is
traced as an edge-snapped 2-D polyline in each view that shows it. Its 3-D
shape is the curve whose projections lie on all of those polylines:

  init   — two views, each point of one polyline matched to where its
           epipolar line crosses the other, then triangulated;
  refine — the 3-D curve's points moved to minimise, in every view, the
           pixel distance between its projection and the traced polyline
           (both directions, so it can neither shrink nor overshoot), with
           a small bending penalty and even spacing.

Left/right symmetric curves pool their observations: a trace of the
right-hand twin is used as an observation of the left-hand curve mirrored
(y -> -y), which doubles the views every curve gets.
"""

from __future__ import annotations

import numpy as np
from scipy.optimize import least_squares

from camera import Camera, triangulate

MIRROR = np.diag([1.0, -1.0, 1.0])


def _proj(cam: Camera, X: np.ndarray, mirrored: bool) -> np.ndarray:
    return cam.project(X @ MIRROR if mirrored else X)


def _seg_dist(P: np.ndarray, poly: np.ndarray) -> np.ndarray:
    """Distance from each point of P (N,2) to the polyline `poly` (M,2)."""
    a, b = poly[:-1], poly[1:]
    ab = b - a
    L2 = np.maximum((ab ** 2).sum(1), 1e-12)
    t = np.clip(((P[:, None, :] - a[None]) * ab[None]).sum(2) / L2[None], 0, 1)
    q = a[None] + t[..., None] * ab[None]
    return np.linalg.norm(P[:, None, :] - q, axis=2).min(1)


def fundamental(c1: Camera, c2: Camera, m1=False, m2=False) -> np.ndarray:
    """F with x2^T F x1 = 0 (mirrored flags reflect the world first)."""
    def P(c, m):
        R = c.R @ (MIRROR if m else np.eye(3))
        return c.K @ np.concatenate([R, np.asarray(c.tvec, float).reshape(3, 1)], 1)
    P1, P2 = P(c1, m1), P(c2, m2)
    C1 = np.linalg.svd(P1)[2][-1]
    e2 = P2 @ C1
    ex = np.array([[0, -e2[2], e2[1]], [e2[2], 0, -e2[0]], [-e2[1], e2[0], 0]])
    return ex @ P2 @ np.linalg.pinv(P1)


def init_two_view(c1: Camera, poly1, c2: Camera, poly2, m1=False, m2=False, n=40) -> np.ndarray:
    """3-D points of a curve from two views by epipolar matching."""
    from trace import resample
    p1 = resample(np.asarray(poly1, float), max(_length(poly1) / n, 0.5))
    p2 = np.asarray(poly2, float)
    F = fundamental(c1, c2, m1, m2)
    out, last = [], None
    for u in p1:
        l = F @ np.array([u[0], u[1], 1.0])
        s = p2 @ l[:2] + l[2]
        hits = []
        for k in np.nonzero(np.sign(s[:-1]) != np.sign(s[1:]))[0]:
            t = s[k] / (s[k] - s[k + 1])
            hits.append((k + t, p2[k] + t * (p2[k + 1] - p2[k])))
        if not hits:
            continue
        # Keep correspondences monotone along the second polyline.
        if last is not None:
            hits.sort(key=lambda h: abs(h[0] - last))
        k, q = hits[0]
        last = k
        X = triangulate([c1, c2], [u, q])
        out.append(X @ MIRROR if m1 else X)
    return np.array(out)


def _length(p) -> float:
    p = np.asarray(p, float)
    return float(np.linalg.norm(np.diff(p, axis=0), axis=1).sum())


def _proj_jac(cam: Camera, X: np.ndarray, mirrored: bool):
    """Projections (N,2) of X and their Jacobians d(uv)/dX (N,2,3)."""
    M = MIRROR if mirrored else np.eye(3)
    A = cam.R @ M
    Xc = X @ A.T + np.asarray(cam.tvec, float)
    z = Xc[:, 2]
    uv = np.stack([cam.f * Xc[:, 0] / z + cam.cx, cam.f * Xc[:, 1] / z + cam.cy], 1)
    J = np.zeros((len(X), 2, 3))
    J[:, 0] = cam.f * (A[0][None] / z[:, None] - Xc[:, 0:1] * A[2][None] / z[:, None] ** 2)
    J[:, 1] = cam.f * (A[1][None] / z[:, None] - Xc[:, 1:2] * A[2][None] / z[:, None] ** 2)
    return uv, J


def _closest_on_poly(P: np.ndarray, poly: np.ndarray):
    """For each point of P: closest point on `poly`, its segment index, the
    segment parameter t, and the unit normal of that segment."""
    a, b = poly[:-1], poly[1:]
    ab = b - a
    L2 = np.maximum((ab ** 2).sum(1), 1e-12)
    t = np.clip(((P[:, None, :] - a[None]) * ab[None]).sum(2) / L2[None], 0, 1)
    q = a[None] + t[..., None] * ab[None]
    d = np.linalg.norm(P[:, None, :] - q, axis=2)
    k = d.argmin(1)
    r = np.arange(len(P))
    tan = ab[k] / np.sqrt(L2[k])[:, None]
    return q[r, k], k, t[r, k], np.stack([-tan[:, 1], tan[:, 0]], 1)


def refine(X0: np.ndarray, obs: list, n: int = 40, bend: float = 0.3, spacing: float = 0.2,
           fix_y0: bool = False, iters: int = 30) -> tuple[np.ndarray, dict]:
    """Refine a 3-D curve against its traced polylines in every view.

    obs: (camera, polyline (M,2), mirrored[, partial]) per view. A `partial`
    observation (the curve is cut off by an occluder or the frame in that
    view) only requires its traced points to lie on the curve, not the
    whole curve to lie on its trace. `fix_y0` pins the curve to the centre
    plane. Gauss-Newton on point-to-line distances (ICP style) with exact
    projection Jacobians; regularised by bending and even spacing, both in
    pixel-equivalent units. Returns the curve (n,3) and per-view RMS / max
    pixel errors."""
    from trace import resample
    X0 = np.asarray(X0, float)
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(X0, axis=0), axis=1))])
    t = np.linspace(0, s[-1], n)
    Y = np.stack([np.interp(t, s, X0[:, k]) for k in range(3)], axis=1)
    if fix_y0:
        Y[:, 1] = 0
    dense = []
    for o in obs:
        c, p, m = o[:3]
        partial = o[3] if len(o) > 3 else False
        dense.append((c, resample(np.asarray(p, float), 3.0), m, partial))
    for it in range(iters):
        rows, rhs = [], []
        for c, p, m, partial in dense:
            q, J = _proj_jac(c, Y, m)
            if not partial:
                # model -> observation: point-to-line, point-to-point at ends
                o, k, tt, nrm = _closest_on_poly(q, p)
                end = (tt <= 0) & (k == 0) | (tt >= 1) & (k == len(p) - 2)
                for i in range(n):
                    if end[i]:
                        for ax in range(2):
                            row = np.zeros(3 * n); row[3 * i:3 * i + 3] = J[i, ax]
                            rows.append(row / np.sqrt(n)); rhs.append((o[i, ax] - q[i, ax]) / np.sqrt(n))
                    else:
                        row = np.zeros(3 * n); row[3 * i:3 * i + 3] = nrm[i] @ J[i]
                        rows.append(row / np.sqrt(n)); rhs.append(nrm[i] @ (o[i] - q[i]) / np.sqrt(n))
            # observation -> model: each traced point on the projected curve
            o, k, tt, nrm = _closest_on_poly(p, q)
            for j in range(len(p)):
                i = k[j]
                # Past either end of the curve: pull the end point itself, in
                # both directions, so the curve grows to cover the trace.
                if (k[j] == 0 and tt[j] <= 0) or (k[j] == n - 2 and tt[j] >= 1):
                    e = 0 if k[j] == 0 and tt[j] <= 0 else n - 1
                    for ax in range(2):
                        row = np.zeros(3 * n); row[3 * e:3 * e + 3] = J[e, ax]
                        rows.append(row / np.sqrt(len(p))); rhs.append((p[j, ax] - q[e, ax]) / np.sqrt(len(p)))
                    continue
                row = np.zeros(3 * n)
                row[3 * i:3 * i + 3] = (1 - tt[j]) * (nrm[j] @ J[i])
                row[3 * i + 3:3 * i + 6] = tt[j] * (nrm[j] @ J[i + 1])
                rows.append(row / np.sqrt(len(p))); rhs.append(nrm[j] @ (p[j] - o[j]) / np.sqrt(len(p)))
        # Regularisers, scaled to pixels by a typical mm-per-pixel.
        mpp = np.median([np.linalg.norm(c.centre - Y.mean(0)) / c.f for c, *_ in dense])
        L = np.linalg.norm(np.diff(Y, axis=0), axis=1).mean()
        for i in range(1, n - 1):
            for ax in range(3):
                row = np.zeros(3 * n)
                row[3 * (i - 1) + ax], row[3 * i + ax], row[3 * (i + 1) + ax] = 1, -2, 1
                rows.append(bend * row / mpp); rhs.append(-bend * (Y[i - 1, ax] - 2 * Y[i, ax] + Y[i + 1, ax]) / mpp)
        for i in range(n - 1):
            d = Y[i + 1] - Y[i]
            ln = np.linalg.norm(d)
            u = d / max(ln, 1e-9)
            row = np.zeros(3 * n); row[3 * i:3 * i + 3] = -u; row[3 * i + 3:3 * i + 6] = u
            rows.append(spacing * row / mpp); rhs.append(spacing * (L - ln) / mpp)
        A, b = np.array(rows), np.array(rhs)
        if fix_y0:
            A[:, 1::3] = 0
        dx = np.linalg.lstsq(A.T @ A + 1e-6 * np.eye(3 * n), A.T @ b, rcond=None)[0]
        Y = Y + dx.reshape(-1, 3)
        if np.abs(dx).max() < 1e-3:
            break
    stats = {}
    for i, (c, p, m, partial) in enumerate(dense):
        q = _proj(c, Y, m)
        d = _seg_dist(p, q) if partial else np.concatenate([_seg_dist(p, q), _seg_dist(q, p)])
        stats[i] = (float(np.sqrt(np.mean(d ** 2))), float(d.max()))
    return Y, stats
