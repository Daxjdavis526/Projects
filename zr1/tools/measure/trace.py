"""Reading positions off reference images.

`grid(img, box, step)` writes a crop with a labelled pixel grid, so a point
can be read off by eye to a few pixels; `snap(img, hint)` then moves a
hand-placed polyline onto the strongest nearby image edge, which is where
the precision comes from: the edge is found to a fraction of a pixel by
fitting the gradient profile across it, never by eye.
"""

from __future__ import annotations

import numpy as np
import cv2


def load(path: str) -> np.ndarray:
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(path)
    if img.ndim == 3 and img.shape[2] == 4:
        # Composite transparent renders onto mid grey so silhouettes stay visible.
        a = img[:, :, 3:4].astype(np.float32) / 255
        img = (img[:, :, :3] * a + 128 * (1 - a)).astype(np.uint8)
    return img


def grid(img: np.ndarray, box=None, step: int = 20, scale: float = 1.0, out: str = None,
         marks=None) -> np.ndarray:
    """A crop of `img` (box = x0, y0, x1, y1) enlarged by `scale` with grid lines
    every `step` source pixels, labelled in source-pixel coordinates.
    `marks`: optional list of (u, v, colour) points to draw (source pixels)."""
    h, w = img.shape[:2]
    x0, y0, x1, y1 = box or (0, 0, w, h)
    crop = img[y0:y1, x0:x1]
    if crop.ndim == 2:
        crop = cv2.cvtColor(crop, cv2.COLOR_GRAY2BGR)
    crop = cv2.resize(crop, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC if scale > 1 else cv2.INTER_AREA)
    out_img = crop.copy()
    for gx in range((x0 // step + 1) * step, x1, step):
        X = int(round((gx - x0) * scale))
        major = gx % (step * 5) == 0
        cv2.line(out_img, (X, 0), (X, out_img.shape[0]), (0, 200, 255) if major else (0, 140, 255), 1)
        if major:
            cv2.putText(out_img, str(gx), (X + 2, 12), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (0, 0, 255), 1)
    for gy in range((y0 // step + 1) * step, y1, step):
        Y = int(round((gy - y0) * scale))
        major = gy % (step * 5) == 0
        cv2.line(out_img, (0, Y), (out_img.shape[1], Y), (255, 200, 0) if major else (255, 140, 0), 1)
        if major:
            cv2.putText(out_img, str(gy), (2, Y - 2), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 0, 0), 1)
    # Blend so the image stays readable under the grid.
    out_img = cv2.addWeighted(out_img, 0.55, crop, 0.45, 0)
    for (u, v, col) in marks or []:
        cv2.circle(out_img, (int(round((u - x0) * scale)), int(round((v - y0) * scale))), 3, col, -1)
    if out:
        cv2.imwrite(out, out_img)
    return out_img


def resample(poly: np.ndarray, spacing: float) -> np.ndarray:
    """A polyline resampled to points `spacing` pixels apart (ends kept)."""
    p = np.asarray(poly, float)
    seg = np.linalg.norm(np.diff(p, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    n = max(int(np.ceil(s[-1] / spacing)), 1)
    t = np.linspace(0, s[-1], n + 1)
    return np.stack([np.interp(t, s, p[:, 0]), np.interp(t, s, p[:, 1])], axis=1)


def _gradient(img: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    g = img if img.ndim == 2 else cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    g = g.astype(np.float32)
    if g.ndim == 3:
        gx = sum(cv2.Sobel(np.ascontiguousarray(g[:, :, c]), cv2.CV_32F, 1, 0, ksize=3) ** 2 for c in range(3))
        gy = sum(cv2.Sobel(np.ascontiguousarray(g[:, :, c]), cv2.CV_32F, 0, 1, ksize=3) ** 2 for c in range(3))
        return np.sqrt(gx), np.sqrt(gy)
    return np.abs(cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)), np.abs(cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3))


def ridge_map(img: np.ndarray, sigma: float = 1.0) -> np.ndarray:
    """Strength of thin dark lines (panel gaps, creases drawn as shading
    lines): the larger eigenvalue of the Hessian of the grey image."""
    g = img if img.ndim == 2 else cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)
    g = cv2.GaussianBlur(g.astype(np.float32), (0, 0), sigma)
    gxx = cv2.Sobel(g, cv2.CV_32F, 2, 0, ksize=3)
    gyy = cv2.Sobel(g, cv2.CV_32F, 0, 2, ksize=3)
    gxy = cv2.Sobel(g, cv2.CV_32F, 1, 1, ksize=3)
    tr = gxx + gyy
    disc = np.sqrt(np.maximum((gxx - gyy) ** 2 + 4 * gxy ** 2, 0))
    return np.maximum(0.5 * (tr + disc), 0)


def enhance(img: np.ndarray) -> np.ndarray:
    """A view for reading lines by eye: local-contrast-equalised grey with
    thin dark lines drawn darker."""
    g = img if img.ndim == 2 else cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(16, 16))
    e = clahe.apply(g)
    r = ridge_map(img)
    r = np.clip(r / (np.percentile(r, 99.5) + 1e-6) * 255, 0, 255)
    out = np.clip(e.astype(np.float32) - 0.8 * r, 0, 255).astype(np.uint8)
    return cv2.cvtColor(out, cv2.COLOR_GRAY2BGR)


def snap(img: np.ndarray, hint, band: float = 6.0, spacing: float = 2.0, smooth: float = 2.0,
         closed: bool = False, mode: str = "edge") -> tuple[np.ndarray, np.ndarray]:
    """Move a hand-placed polyline onto the strongest image edge within `band`
    pixels of it, measured along the hint's normal.

    The offset along each normal is chosen by dynamic programming (edge
    strength minus a smoothness cost between neighbours), then refined to
    sub-pixel by a parabola through the gradient profile. Returns the snapped
    points (N,2) and the edge strength at each (so weak stretches can be
    rejected rather than trusted)."""
    p = resample(np.asarray(hint, float), spacing)
    if closed:
        p = np.concatenate([p, p[:1]])
    t = np.gradient(p, axis=0)
    t /= np.maximum(np.linalg.norm(t, axis=1, keepdims=True), 1e-9)
    n = np.stack([-t[:, 1], t[:, 0]], axis=1)
    if mode == "ridge":
        mag = ridge_map(img)
    else:
        gx, gy = _gradient(img)
        mag = np.sqrt(gx ** 2 + gy ** 2)
    offs = np.arange(-band, band + 0.25, 0.5)
    S = np.zeros((len(p), len(offs)))
    for j, o in enumerate(offs):
        q = p + o * n
        S[:, j] = cv2.remap(mag, q[:, 0].astype(np.float32).reshape(1, -1),
                            q[:, 1].astype(np.float32).reshape(1, -1), cv2.INTER_LINEAR).ravel()
    S /= max(S.max(), 1e-9)
    # Dynamic programming over offsets: maximise strength, penalise jumps.
    cost = -S[0].copy()
    back = np.zeros(S.shape, int)
    jump = smooth * (offs[:, None] - offs[None, :]) ** 2 / band ** 2
    for i in range(1, len(p)):
        tot = cost[None, :] + jump
        back[i] = np.argmin(tot, axis=1)
        cost = tot[np.arange(len(offs)), back[i]] - S[i]
    j = int(np.argmin(cost))
    idx = np.zeros(len(p), int)
    for i in range(len(p) - 1, -1, -1):
        idx[i] = j
        j = back[i, j]
    # Sub-pixel refinement by a parabola through the three profile samples.
    o = offs[idx].copy()
    strength = S[np.arange(len(p)), idx]
    for i, k in enumerate(idx):
        if 0 < k < len(offs) - 1:
            a, b, c = S[i, k - 1], S[i, k], S[i, k + 1]
            den = a - 2 * b + c
            if den < 0:
                o[i] += 0.5 * (a - c) / den * (offs[1] - offs[0])
    q = p + o[:, None] * n
    if closed:
        q, strength = q[:-1], strength[:-1]
    return q, strength
