"""A small software renderer for checking a mesh against a reference image.

Painter's algorithm (triangles drawn far to near), flat Lambert shading
from a light at the camera plus a fixed key light: enough to judge shape,
creases and proportion side by side with the reference render.
"""

from __future__ import annotations

import numpy as np
import cv2

from camera import Camera


def shade(V, F, cam: Camera, colour=(235, 235, 232), key=(0.3, -0.5, 0.8), bg=(128, 128, 128),
          img=None, wire=False):
    uv, z = cam.project(V), cam.to_cam(V)[:, 2]
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    fn /= np.maximum(np.linalg.norm(fn, axis=1, keepdims=True), 1e-12)
    fc = V[F].mean(1)
    view = cam.centre[None] - fc
    view /= np.linalg.norm(view, axis=1, keepdims=True)
    facing = (fn * view).sum(1)
    keep = facing > 0
    k = np.asarray(key, float)
    k /= np.linalg.norm(k)
    lam = 0.25 + 0.45 * np.clip(facing, 0, 1) + 0.35 * np.clip(fn @ k, 0, 1)
    order = np.argsort(-z[F].mean(1))
    out = np.full((cam.h, cam.w, 3), bg, np.uint8) if img is None else img.copy()
    col = np.asarray(colour, float)
    tri = np.round(uv[F] * 4).astype(np.int32)
    for f in order:
        if not keep[f]:
            continue
        c = tuple(int(v) for v in np.clip(col * lam[f], 0, 255))
        cv2.fillConvexPoly(out, tri[f], c, lineType=cv2.LINE_AA, shift=2)
    return out


def side_by_side(ref_rgba, V, F, cam: Camera, scale=0.5):
    if ref_rgba.shape[2] == 4:
        a = ref_rgba[:, :, 3:4] / 255.0
        ref = (ref_rgba[:, :, :3] * a + 128 * (1 - a)).astype(np.uint8)
    else:
        ref = ref_rgba
    r = shade(V, F, cam)
    both = np.hstack([ref, r])
    return cv2.resize(both, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)


def shade_multi(meshes, cam, bg=(128, 128, 128), key=(0.3, -0.5, 0.8)):
    """Several (V, F, colour) meshes in one painter's-algorithm render."""
    Vs, Fs, Cs = [], [], []
    off = 0
    for V, F, col in meshes:
        Vs.append(V); Fs.append(F + off); Cs.append(np.tile(np.asarray(col, float), (len(F), 1)))
        off += len(V)
    V = np.concatenate(Vs); F = np.concatenate(Fs); C = np.concatenate(Cs)
    uv, z = cam.project(V), cam.to_cam(V)[:, 2]
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    fn /= np.maximum(np.linalg.norm(fn, axis=1, keepdims=True), 1e-12)
    view = cam.centre[None] - V[F].mean(1)
    view /= np.linalg.norm(view, axis=1, keepdims=True)
    facing = (fn * view).sum(1)
    k = np.asarray(key, float); k /= np.linalg.norm(k)
    lam = 0.25 + 0.45 * np.clip(facing, 0, 1) + 0.35 * np.clip(fn @ k, 0, 1)
    order = np.argsort(-z[F].mean(1))
    out = np.full((cam.h, cam.w, 3), bg, np.uint8)
    tri = np.round(uv[F] * 4).astype(np.int32)
    for f in order:
        if facing[f] <= 0:
            continue
        cv2.fillConvexPoly(out, tri[f], tuple(int(v) for v in np.clip(C[f] * lam[f], 0, 255)), lineType=cv2.LINE_AA, shift=2)
    return out


def shade_multi_z(meshes, cam, bg=(128, 128, 128), key=(0.3, -0.5, 0.8)):
    """Several (V, F, colour) meshes with a per-pixel depth buffer.

    shade_multi's painter's algorithm orders whole triangles by their mean
    depth, which is wrong wherever a large triangle lies behind small ones
    (a simplified body under a thin inlay shows through in shards)."""
    Vs, Fs, Cs = [], [], []
    off = 0
    for V, F, col in meshes:
        Vs.append(V); Fs.append(F + off); Cs.append(np.tile(np.asarray(col, float), (len(F), 1)))
        off += len(V)
    V = np.concatenate(Vs); F = np.concatenate(Fs); C = np.concatenate(Cs)
    uv, z = cam.project(V), cam.to_cam(V)[:, 2]
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    fn /= np.maximum(np.linalg.norm(fn, axis=1, keepdims=True), 1e-12)
    view = cam.centre[None] - V[F].mean(1)
    view /= np.linalg.norm(view, axis=1, keepdims=True)
    facing = (fn * view).sum(1)
    k = np.asarray(key, float); k /= np.linalg.norm(k)
    lam = 0.25 + 0.45 * np.clip(facing, 0, 1) + 0.35 * np.clip(fn @ k, 0, 1)
    col = np.clip(C * lam[:, None], 0, 255).astype(np.uint8)
    H, W = cam.h, cam.w
    zbuf = np.full((H, W), np.inf)
    out = np.full((H, W, 3), bg, np.uint8)
    P, Z = uv[F], z[F]
    for f in np.nonzero((facing > 0) & (Z.min(1) > 0))[0]:
        p = P[f]
        x0, x1 = int(np.floor(p[:, 0].min())), int(np.ceil(p[:, 0].max()))
        y0, y1 = int(np.floor(p[:, 1].min())), int(np.ceil(p[:, 1].max()))
        x0, y0, x1, y1 = max(x0, 0), max(y0, 0), min(x1, W - 1), min(y1, H - 1)
        if x0 > x1 or y0 > y1:
            continue
        xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        (ax, ay), (bx, by), (cx, cy) = p
        d = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay)
        if abs(d) < 1e-12:
            continue
        w1 = ((xs - ax) * (cy - ay) - (cx - ax) * (ys - ay)) / d
        w2 = ((bx - ax) * (ys - ay) - (xs - ax) * (by - ay)) / d
        w0 = 1 - w1 - w2
        inside = (w0 >= -1e-9) & (w1 >= -1e-9) & (w2 >= -1e-9)
        if not inside.any():
            continue
        # perspective-correct depth: 1/z is linear in screen space
        iz = w0 / Z[f, 0] + w1 / Z[f, 1] + w2 / Z[f, 2]
        dep = 1.0 / np.maximum(iz, 1e-12)
        zb = zbuf[y0:y1 + 1, x0:x1 + 1]
        win = inside & (dep < zb)
        zb[win] = dep[win]
        out[y0:y1 + 1, x0:x1 + 1][win] = col[f]
    return out
