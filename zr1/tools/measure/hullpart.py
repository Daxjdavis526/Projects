"""Add-on parts (wing, uprights, mirrors, splitter, dive planes, diffuser)
as visual hulls inside their bounding boxes.

A voxel survives when no calibrated view sees background at its
projection (only clear background carves: an opaque black pixel of the
renders may be carbon, so it never does). Inside a box that holds a thin,
free-standing part every view sees around it, so the hull is close to the
part itself; the body's own volume (the measured skin) is subtracted
afterwards. The surviving voxels are meshed by marching cubes on a
slightly smoothed occupancy and the largest pieces kept.
"""

from __future__ import annotations

import numpy as np
import cv2


def background_masks(views):
    from paint import pair
    out = {}
    for vd in views:
        w, _ = pair(vd.name)
        a = w[:, :, 3]
        bg = (a < 60).astype(np.uint8)
        # erode the background a little: never carve on an anti-aliased edge
        out[vd.name] = cv2.erode(bg, np.ones((3, 3), np.uint8))
    return out


def carve(views, bgs, lo, hi, voxel):
    lo, hi = np.asarray(lo, float), np.asarray(hi, float)
    shape = np.ceil((hi - lo) / voxel).astype(int) + 1
    gx, gy, gz = [lo[i] + np.arange(shape[i]) * voxel for i in range(3)]
    occ = np.ones(shape, bool)
    for vd in views:
        cam = vd.cam
        bg = bgs[vd.name]
        for i in range(shape[0]):
            if not occ[i].any():
                continue
            Y, Z = np.meshgrid(gy, gz, indexing='ij')
            P = np.stack([np.full(Y.size, gx[i]), Y.ravel(), Z.ravel()], 1)
            uv = cam.project(P)
            u = np.round(uv[:, 0]).astype(int); v = np.round(uv[:, 1]).astype(int)
            inside = (u >= 0) & (u < cam.w) & (v >= 0) & (v < cam.h)
            kill = np.zeros(len(P), bool)
            kill[inside] = bg[v[inside], u[inside]] > 0
            occ[i] &= ~kill.reshape(shape[1], shape[2])
    return occ, (gx, gy, gz)


def mesh(occ, grid, voxel, keep_min_mm3=2e4, sigma=0.7):
    from scipy.ndimage import gaussian_filter
    from skimage.measure import marching_cubes
    import trimesh
    f = gaussian_filter(np.where(occ, 1.0, -1.0), sigma)
    f = np.pad(f, 1, constant_values=-1.0)
    v, fc, _, _ = marching_cubes(f, 0.0, spacing=(voxel, voxel, voxel))
    v += np.array([grid[0][0], grid[1][0], grid[2][0]]) - voxel
    m = trimesh.Trimesh(v, fc, process=True)
    if m.volume < 0:
        m.invert()
    parts = [p for p in m.split(only_watertight=True) if p.volume > keep_min_mm3]
    return trimesh.util.concatenate(parts) if parts else None
