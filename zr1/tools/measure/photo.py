"""Shape from the paint's diffuse shading (paint.shading), in every view.

Diffuse light arriving at a surface from a distant environment is, to
within a few per cent for any lighting, a quadratic function of the
surface normal: nine spherical-harmonic coefficients per view (Ramamoorthi
and Hanrahan, 'An efficient representation for irradiance environment
maps', SIGGRAPH 2001). So in each view the shading image is fitted with
nine numbers from the model's normals, and wherever the model's normal is
wrong the residual says which way to tilt it.

  raster      per-pixel front-most triangle and barycentric coordinates
  sh_basis    the nine irradiance basis functions of a unit normal
  fit_light   least-squares coefficients for one view (robust)
  target_normals  per triangle, the normal that best explains the shading
              of its pixels in all views that see it, as a small rotation
              of the current normal (Gauss-Newton on the two tangent
              directions, damped toward no change)
"""

from __future__ import annotations

import numpy as np
import cv2


def raster(V, F, cam, scale=1.0):
    """Triangle id (-1 = none) and barycentrics per pixel, nearest surface first."""
    uv = cam.project(V) * scale
    z = cam.to_cam(V)[:, 2]
    h, w = int(round(cam.h * scale)), int(round(cam.w * scale))
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    fc = V[F].mean(1)
    facing = ((cam.centre[None] - fc) * fn).sum(1) > 0
    order = np.argsort(-z[F].mean(1))
    order = order[facing[order]]
    ids = np.zeros((h, w, 3), np.uint8)
    pts = np.round(uv[F] * 16).astype(np.int32)
    for f in order:
        k = int(f) + 1
        cv2.fillConvexPoly(ids, pts[f], (k & 255, (k >> 8) & 255, (k >> 16) & 255), lineType=cv2.LINE_8, shift=4)
    tid = ids[:, :, 0].astype(np.int64) + (ids[:, :, 1].astype(np.int64) << 8) + (ids[:, :, 2].astype(np.int64) << 16) - 1
    yy, xx = np.nonzero(tid >= 0)
    t = tid[yy, xx]
    A, B, C = uv[F[t, 0]], uv[F[t, 1]], uv[F[t, 2]]
    p = np.stack([xx + 0.5, yy + 0.5], 1)
    v0, v1, v2 = B - A, C - A, p - A
    den = v0[:, 0] * v1[:, 1] - v1[:, 0] * v0[:, 1]
    den = np.where(np.abs(den) < 1e-12, 1e-12, den)
    b1 = (v2[:, 0] * v1[:, 1] - v1[:, 0] * v2[:, 1]) / den
    b2 = (v0[:, 0] * v2[:, 1] - v2[:, 0] * v0[:, 1]) / den
    bary = np.clip(np.stack([1 - b1 - b2, b1, b2], 1), 0, 1)
    bary /= bary.sum(1, keepdims=True)
    return tid, (yy, xx, t, bary)


def sh_basis(n):
    x, y, z = n[:, 0], n[:, 1], n[:, 2]
    return np.stack([np.ones_like(x), x, y, z, x * y, x * z, y * z, x * x - y * y, 3 * z * z - 1], 1)


def sh_grad(n):
    """d basis / d n: (N, 9, 3)."""
    x, y, z = n[:, 0], n[:, 1], n[:, 2]
    o, zz = np.ones_like(x), np.zeros_like(x)
    g = np.stack([
        np.stack([zz, zz, zz], 1), np.stack([o, zz, zz], 1), np.stack([zz, o, zz], 1), np.stack([zz, zz, o], 1),
        np.stack([y, x, zz], 1), np.stack([z, zz, x], 1), np.stack([zz, z, y], 1),
        np.stack([2 * x, -2 * y, zz], 1), np.stack([zz, zz, 6 * z], 1)], 1)
    return g


def fit_light(n, I, iters=3):
    """Nine coefficients with I ~ sh_basis(n) @ c, Huber-reweighted."""
    Bm = sh_basis(n)
    w = np.ones(len(I))
    for _ in range(iters):
        c, *_ = np.linalg.lstsq(Bm * w[:, None], I * w, rcond=None)
        r = I - Bm @ c
        s = 1.4826 * np.median(np.abs(r)) + 1e-6
        w = np.sqrt(np.where(np.abs(r) < 2 * s, 1.0, 2 * s / np.abs(r)))
    return c, r


def vertex_normals(V, F):
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    vn = np.zeros_like(V)
    for k in range(3):
        np.add.at(vn, F[:, k], fn)
    return vn / np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-12)
