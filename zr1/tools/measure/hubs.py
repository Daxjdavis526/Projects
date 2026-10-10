"""Finding wheel hubs in many frames by a warped template.

A hub patch is cut from one frame where the wheel is seen face-on and
located by hand. For any other frame, the current camera estimate predicts
how the wheel's plane maps between the two images (an affine map fitted to
the projections of a ring around the hub in both), the template is warped
by it, and normalised cross-correlation finds it near the prediction. The
hub's position is the warped template centre at the best match, refined to
sub-pixel by a parabola through the correlation peak.
"""

from __future__ import annotations

import numpy as np
import cv2

from camera import Camera, circle_points


def gray(img: np.ndarray) -> np.ndarray:
    if img.ndim == 3 and img.shape[2] == 4:
        a = img[:, :, 3:4].astype(np.float32) / 255
        img = (img[:, :, :3] * a + 128 * (1 - a)).astype(np.uint8)
    return cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY).astype(np.float32)


def find(src_img, src_cam: Camera, src_uv, img, cam: Camera, centre, normal,
         ring_mm=180.0, search=24, half=34):
    """Locate the hub at world `centre` (wheel axis `normal`) in `img`.

    src_uv is the hand-located hub in src_img (seen by src_cam). Returns
    (uv, score) or (None, score) when the correlation is weak."""
    ring = circle_points(centre, normal, ring_mm, 24)
    A, _ = cv2.estimateAffine2D(src_cam.project(ring).astype(np.float32),
                                cam.project(ring).astype(np.float32))
    if A is None:
        return None, 0.0
    # Shift the affine so the source hub maps to the predicted target hub,
    # then cut a warped template around that point.
    pred = cam.project(np.asarray(centre, float))[0]
    g0, g1 = gray(src_img), gray(img)
    Ai = cv2.invertAffineTransform(A)
    # Template in target pixel coordinates: sample the source through A^-1.
    size = 2 * half + 1
    T = np.zeros((size, size), np.float32)
    offs = np.arange(-half, half + 1, dtype=np.float32)
    xx, yy = np.meshgrid(offs, offs)
    # Target pixel (pred + d) corresponds to source pixel src_uv + L^-1 d
    L = Ai[:, :2]
    sx = src_uv[0] + L[0, 0] * xx + L[0, 1] * yy
    sy = src_uv[1] + L[1, 0] * xx + L[1, 1] * yy
    T = cv2.remap(g0, sx.astype(np.float32), sy.astype(np.float32), cv2.INTER_LINEAR)
    x0, y0 = int(round(pred[0])) - half - search, int(round(pred[1])) - half - search
    H, W = g1.shape
    if x0 < 0 or y0 < 0 or x0 + size + 2 * search > W or y0 + size + 2 * search > H:
        return None, 0.0
    win = g1[y0:y0 + size + 2 * search, x0:x0 + size + 2 * search]
    R = cv2.matchTemplate(win, T, cv2.TM_CCOEFF_NORMED)
    _, score, _, loc = cv2.minMaxLoc(R)
    px, py = loc

    def para(a, b, c):
        d = a - 2 * b + c
        return 0.5 * (a - c) / d if d < 0 else 0.0
    dx = para(R[py, px - 1], R[py, px], R[py, px + 1]) if 0 < px < R.shape[1] - 1 else 0
    dy = para(R[py - 1, px], R[py, px], R[py + 1, px]) if 0 < py < R.shape[0] - 1 else 0
    uv = np.array([x0 + px + dx + half, y0 + py + dy + half])
    return (uv if score > 0.5 else None), float(score)
