"""What the skin is made of, by projecting every view onto the mesh.

For each calibrated view the mesh is rasterised (photo.raster); a vertex
is seen when its depth matches the z-buffer at its pixel. There it samples
the white render's colour and the paint mask (paint.shading). Each sample
is weighted by how squarely the view looks at the surface, (n . v)^2, and
vertices in the excluded zones (wheels, wing, mirrors, splitter, dive
planes) are not sampled. The weighted means over all views give, per
vertex, the probability that the surface there is paint and its colour.
"""

from __future__ import annotations

import numpy as np
import cv2

import photo
import paint


def bilinear(img, uv):
    """Bilinear samples of img (h, w[, c]) at points uv (n, 2) -> (n, c)."""
    if img.ndim == 2:
        img = img[:, :, None]
    n = len(uv)
    W = 1024
    m = -(-n // W) * W
    pu = np.zeros(m, np.float32); pv = np.zeros(m, np.float32)
    pu[:n], pv[:n] = uv[:, 0], uv[:, 1]
    out = []
    for c in range(img.shape[2]):
        r = cv2.remap(np.ascontiguousarray(img[:, :, c]).astype(np.float32), pu.reshape(-1, W), pv.reshape(-1, W),
                      cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        out.append(r.ravel()[:n])
    return np.stack(out, 1)


def project(V, F, views, depth_tol=10.0, min_cos=0.2, power=2.0):
    n = len(V)
    vn = photo.vertex_normals(V, F)
    wsum = np.zeros(n)
    psum = np.zeros(n)
    csum = np.zeros((n, 3))
    best = np.zeros(n)
    for vd in views:
        cam = vd.cam
        w_img, _ = paint.pair(vd.name)
        sh, pm, car = paint.shading(vd.name)
        tid, (yy, xx, t, bary) = photo.raster(V, F, cam)
        z = cam.to_cam(V)[:, 2]
        zbuf = np.full(tid.shape, np.inf, np.float32)
        zbuf[yy, xx] = (z[F[t]] * bary).sum(1)
        uv = cam.project(V)
        u, v = np.round(uv[:, 0]).astype(int), np.round(uv[:, 1]).astype(int)
        inb = (u >= 1) & (u < cam.w - 1) & (v >= 1) & (v < cam.h - 1)
        ids = np.nonzero(inb)[0]
        zz = np.minimum.reduce([zbuf[v[ids] + dv, u[ids] + du] for dv in (-1, 0, 1) for du in (-1, 0, 1)])
        vis = ids[np.abs(z[ids] - zz) < depth_tol]
        vis = vis[(vd.bad_d[v[vis], u[vis]] == 0) & car[v[vis], u[vis]]]
        vdir = cam.centre[None] - V[vis]
        vdir /= np.linalg.norm(vdir, axis=1, keepdims=True)
        cosv = (vn[vis] * vdir).sum(1)
        keep = cosv > min_cos
        vis, cosv = vis[keep], cosv[keep]
        w = cosv ** power * (cam.w / 1500.0)       # sharper renders count more
        p = bilinear(pm.astype(np.float32), uv[vis])[:, 0]
        col = bilinear(w_img[:, :, :3], uv[vis])
        np.add.at(wsum, vis, w)
        np.add.at(psum, vis, w * p)
        np.add.at(csum, vis, w[:, None] * col)
        best = np.maximum(best, np.bincount(vis, w, minlength=n))
    seen = wsum > 0
    prob = np.where(seen, psum / np.maximum(wsum, 1e-9), np.nan)
    colour = np.where(seen[:, None], csum / np.maximum(wsum, 1e-9)[:, None], np.nan)
    return prob, colour, wsum
