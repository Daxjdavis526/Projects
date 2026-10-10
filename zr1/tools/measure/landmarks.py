"""Named landmarks: marked once by hand, tracked through a calibrated spin.

A landmark (a lamp tip, a badge centre, a wing corner) is marked in one
frame. Its match in a neighbouring frame must lie on that frame's epipolar
line, so the search is one-dimensional: normalised cross-correlation of a
patch along the line. Two frames give a 3-D point; it is then predicted in
every frame and confirmed there by a small 2-D search, kept only when the
correlation is strong and the point reprojects within a pixel and a half.
"""

from __future__ import annotations

import numpy as np
import cv2

from camera import Camera, triangulate
from curves import fundamental


def _gray(img):
    if img.ndim == 3 and img.shape[2] == 4:
        a = img[:, :, 3:4].astype(np.float32) / 255
        img = (img[:, :, :3] * a + 128 * (1 - a)).astype(np.uint8)
    return cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY).astype(np.float32)


def _patch(g, uv, half):
    x, y = uv
    xs = np.arange(-half, half + 1, dtype=np.float32) + np.float32(x)
    ys = np.arange(-half, half + 1, dtype=np.float32) + np.float32(y)
    X, Y = np.meshgrid(xs, ys)
    return cv2.remap(g, X, Y, cv2.INTER_LINEAR)


def _ncc(a, b):
    a = a - a.mean()
    b = b - b.mean()
    d = np.sqrt((a * a).sum() * (b * b).sum())
    return float((a * b).sum() / d) if d > 1e-6 else -1.0


def along_epipolar(g0, uv0, g1, c0: Camera, c1: Camera, half=8, span=None, step=0.5):
    """Best match of the patch at uv0 (image 0) along its epipolar line in image 1."""
    F = fundamental(c0, c1)
    l = F @ np.array([uv0[0], uv0[1], 1.0])
    n = np.hypot(l[0], l[1])
    d = np.array([-l[1], l[0]]) / n                  # direction along the line
    p0 = -l[2] * np.array([l[0], l[1]]) / n ** 2      # a point on it
    # Search +-span along the line around the foot of uv0 on it: frames a
    # step or two apart move a landmark by tens to a couple of hundred pixels.
    h, w = g1.shape
    s_mid = (np.asarray(uv0, float) - p0) @ d
    S = np.arange(-(span or max(w, h)), (span or max(w, h)) + step, step) + s_mid
    T = _patch(g0, uv0, half)
    best = (-2, None)
    for s in S:
        q = p0 + s * d
        if half < q[0] < w - half - 1 and half < q[1] < h - half - 1:
            c = _ncc(T, _patch(g1, q, half))
            if c > best[0]:
                best = (c, q)
    return best[1], best[0]


def refine2d(gt, uvt, gs, uvs, half=8, search=4, step=0.25):
    """Refine `uvs` in image gs to best match the template at uvt in gt."""
    T = _patch(gt, uvt, half)
    best = (-2, uvs)
    for dy in np.arange(-search, search + step, step):
        for dx in np.arange(-search, search + step, step):
            q = np.array([uvs[0] + dx, uvs[1] + dy])
            c = _ncc(T, _patch(gs, q, half))
            if c > best[0]:
                best = (c, q)
    return best[1], best[0]


def track(imgs: dict, cams: dict, k0: int, uv0, k1: int, half=8, min_ncc=0.8, max_err=1.5,
          neighbours=4):
    """Track a landmark marked at uv0 in frame k0 through the frames.

    k1 is the frame used to triangulate (searched along the epipolar line).
    Returns (X, {frame: uv}) or (None, {}) when the landmark cannot be
    confirmed."""
    g = {k: _gray(im) for k, im in imgs.items()}
    uv0 = np.asarray(uv0, float)
    uv1, c = along_epipolar(g[k0], uv0, g[k1], cams[k0], cams[k1], half, span=150)
    if uv1 is None or c < min_ncc:
        return None, {}
    X = triangulate([cams[k0], cams[k1]], [uv0, uv1])
    obs = {k0: uv0, k1: uv1}
    # Grow outward frame by frame, re-triangulating as observations add up.
    order = sorted(cams, key=lambda k: abs(k - k0))
    for k in order:
        if k in obs:
            continue
        if cams[k].to_cam(X)[0, 2] <= 0:
            continue
        pred = cams[k].project(X)[0]
        # Template from the nearest observed frame.
        kn = min(obs, key=lambda j: abs(j - k))
        if abs(kn - k) > neighbours:
            continue
        q, c = refine2d(g[kn], obs[kn], g[k], pred, half)
        if c < min_ncc or np.linalg.norm(q - pred) > 3.5:
            continue
        trial = dict(obs)
        trial[k] = q
        X2 = triangulate([cams[j] for j in trial], [trial[j] for j in trial])
        err = max(np.linalg.norm(cams[j].project(X2)[0] - trial[j]) for j in trial)
        if err <= max_err:
            obs, X = trial, X2
    return X, obs
