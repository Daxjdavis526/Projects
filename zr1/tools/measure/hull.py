"""Silhouettes and the visual hull they bound.

A silhouette mask per calibrated view (1 = car, 0 = background, and an
optional 'unknown' mask where a view must not carve: wheels, the wing and
mirrors when the body alone is wanted, occluders, image borders). A voxel
is removed when any view sees background at its projection; what survives
is the visual hull, the largest shape consistent with every silhouette.
It over-fills concave regions (a silhouette cannot see into a hollow), so
it is a starting surface for the fit, never the answer.
"""

from __future__ import annotations

import numpy as np
import cv2

from camera import Camera


def render_mask(img: np.ndarray, white: int = 249, close: int = 5) -> np.ndarray:
    """Car mask from a render on a plain white background: anything darker
    than `white` in any channel, closed and hole-filled. White paint against
    a white backdrop can still leak here; every mask is checked by eye on an
    outline overlay and corrected with hand-traced, edge-snapped polygons."""
    dark = (img[:, :, :3].min(axis=2) < white).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (close, close))
    m = cv2.morphologyEx(dark, cv2.MORPH_CLOSE, k)
    # Fill holes: flood the background from the border.
    h, w = m.shape
    ff = m.copy()
    pad = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(ff, pad, (0, 0), 2)
    return ((ff != 2)).astype(np.uint8)


def outline(img: np.ndarray, mask: np.ndarray, colour=(0, 0, 255)) -> np.ndarray:
    out = img[:, :, :3].copy()
    cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    cv2.drawContours(out, cs, -1, colour, 1)
    return out


def carve(views: list[tuple[Camera, np.ndarray, np.ndarray | None]], lo, hi, voxel: float,
          chunk: int = 4_000_000) -> tuple[np.ndarray, np.ndarray]:
    """Visual hull on a voxel lattice over the box [lo, hi] (mm).

    `views`: (camera, mask, unknown) triples; `unknown` pixels (nonzero)
    never carve. A projection outside the image carves (the car is fully
    in frame in every view used). Returns (occupied bool array indexed
    [ix, iy, iz], lattice origin) with voxel centres at origin + i*voxel."""
    lo, hi = np.asarray(lo, float), np.asarray(hi, float)
    n = np.ceil((hi - lo) / voxel).astype(int) + 1
    occ = np.ones(n, bool)
    flat = occ.reshape(-1)
    total = flat.size
    ii = np.arange(total)
    for cam, mask, unk in views:
        h, w = mask.shape
        for s in range(0, total, chunk):
            idx = ii[s:s + chunk]
            idx = idx[flat[idx]]
            if idx.size == 0:
                continue
            iz = idx % n[2]
            iy = (idx // n[2]) % n[1]
            ix = idx // (n[1] * n[2])
            X = lo + np.stack([ix, iy, iz], axis=1) * voxel
            uv = np.rint(cam.project(X)).astype(int)
            inside = (uv[:, 0] >= 0) & (uv[:, 0] < w) & (uv[:, 1] >= 0) & (uv[:, 1] < h)
            bg = ~inside
            u, v = uv[inside, 0], uv[inside, 1]
            seen = mask[v, u] == 0
            if unk is not None:
                seen &= unk[v, u] == 0
            bg[inside] = seen
            flat[idx[bg]] = False
    return occ, lo


def alpha_masks(img: np.ndarray, black: int = 3) -> tuple[np.ndarray, np.ndarray]:
    """(car, unknown) masks from a transparent render.

    Car: opaque and not pure black. Unknown: opaque (or nearly) pure black,
    which these renders use both for the darkest trim and for the contact
    shadow under the car; such pixels neither carve nor count as car.
    Semi-transparent black (the soft shadow) is background. Holes inside
    the car that hold anything opaque are filled; true see-through gaps
    (alpha 0, e.g. under the wing) stay open."""
    a = img[:, :, 3].astype(int)
    m = img[:, :, :3].max(axis=2).astype(int)
    car = ((a >= 254) & (m > black)) | ((a > 100) & (a < 254) & (m > 10))
    unk = (a >= 254) & (m <= black)
    solid = (car | unk).astype(np.uint8)
    h, w = solid.shape
    ff = solid.copy()
    pad = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(ff, pad, (0, 0), 2)
    holes = (ff == 0) & (a > 0)
    car = car | (holes & ~unk)
    return car.astype(np.uint8), unk.astype(np.uint8)
