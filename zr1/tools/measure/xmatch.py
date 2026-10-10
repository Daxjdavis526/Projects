"""Matching a known 3-D landmark between two different calibrated images.

The landmark's patch in a source image (where it is located precisely) is
warped into the target image by the affine map that a small plane through
the landmark, facing between the two cameras, induces between them; the
target position is then found by normalised cross-correlation near the
prediction. Lighting differs between render sets, which NCC tolerates;
geometry differs between views, which the warp absorbs.
"""

from __future__ import annotations

import numpy as np
import cv2

from camera import Camera
from landmarks import _gray, _ncc


def warp_patch(src_g, src_cam: Camera, src_uv, dst_cam: Camera, X, half=12, plane_mm=40.0,
               dst_uv=None):
    """Template (2*half+1)^2 in DESTINATION pixels around dst_uv (default:
    the projection of X), sampled from the source image."""
    X = np.asarray(X, float)
    v = (src_cam.centre - X) / np.linalg.norm(src_cam.centre - X) + \
        (dst_cam.centre - X) / np.linalg.norm(dst_cam.centre - X)
    n = v / np.linalg.norm(v)
    e1 = np.cross(n, [0, 0, 1.0])
    if np.linalg.norm(e1) < 1e-6:
        e1 = np.cross(n, [1.0, 0, 0])
    e1 /= np.linalg.norm(e1)
    e2 = np.cross(n, e1)
    Q = np.array([X, X + plane_mm * e1, X + plane_mm * e2, X - plane_mm * e1, X - plane_mm * e2])
    A, _ = cv2.estimateAffine2D(dst_cam.project(Q).astype(np.float32), src_cam.project(Q).astype(np.float32))
    c_dst = dst_cam.project(X)[0] if dst_uv is None else np.asarray(dst_uv, float)
    # Correct for the source landmark not being exactly at the projection.
    shift = np.asarray(src_uv, float) - src_cam.project(X)[0]
    offs = np.arange(-half, half + 1, dtype=np.float32)
    xx, yy = np.meshgrid(offs, offs)
    L = A[:, :2]
    sx = src_uv[0] + L[0, 0] * xx + L[0, 1] * yy
    sy = src_uv[1] + L[1, 0] * xx + L[1, 1] * yy
    return cv2.remap(src_g, sx.astype(np.float32), sy.astype(np.float32), cv2.INTER_LINEAR), c_dst


def find(src_img, src_cam, src_uv, dst_img, dst_cam, X, half=12, search=30, step=1.0, min_ncc=0.6):
    sg, dg = _gray(src_img), _gray(dst_img)
    T, pred = warp_patch(sg, src_cam, src_uv, dst_cam, X, half)
    H, W = dg.shape
    best = (-2.0, None)
    offs = np.arange(-half, half + 1, dtype=np.float32)
    xx, yy = np.meshgrid(offs, offs)

    def score(q):
        P = cv2.remap(dg, (xx + q[0]).astype(np.float32), (yy + q[1]).astype(np.float32), cv2.INTER_LINEAR)
        return _ncc(T, P)
    for dy in np.arange(-search, search + step, step):
        for dx in np.arange(-search, search + step, step):
            q = pred + [dx, dy]
            if half < q[0] < W - half - 1 and half < q[1] < H - half - 1:
                c = score(q)
                if c > best[0]:
                    best = (c, q)
    c, q = best
    if q is None:
        return None, c
    # sub-pixel polish
    for st in (0.5, 0.25):
        for dy in (-st, 0, st):
            for dx in (-st, 0, st):
                qq = q + [dx, dy]
                cc = score(qq)
                if cc > c:
                    c, q = cc, qq
    return (q if c >= min_ncc else None), c
