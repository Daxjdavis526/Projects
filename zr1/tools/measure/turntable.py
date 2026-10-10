"""Photometric stereo from the 360 spin.

The colorizer's spin is a camera orbiting the car with its lights fixed to
the camera: a point on the door brightens and darkens as it turns toward
and away from the lens, which a diffuse surface under fixed studio lights
cannot do. So in every frame the paint's diffuse shading is one function
f of the normal expressed in that camera's frame, f(R_k n), the same f
for all thirty frames. f is modelled with nine spherical-harmonic
coefficients (photo.sh_basis), fitted once over all frames.

For each mesh vertex the thirty frames give up to ~12 visible samples of f
at rotated normals: enough to solve for the normal itself (two tangent
parameters, Gauss-Newton), independently of how wrong the mesh's own
normal is, as long as the vertex projects onto the right part of the car.
"""

from __future__ import annotations

import numpy as np
import cv2

import photo


def bilinear(img, uv):
    """Bilinear samples at uv (chunked: OpenCV's remap takes < 32767 columns)."""
    out = np.empty(len(uv), np.float32)
    for k in range(0, len(uv), 30000):
        u = uv[k:k + 30000]
        m = cv2.remap(img, u[:, 0].astype(np.float32).reshape(1, -1), u[:, 1].astype(np.float32).reshape(1, -1),
                      cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
        out[k:k + 30000] = m.ravel()
    return out


def observe(V, F, frames, depth_tol=12.0, erode=2):
    """Per frame: (vertex ids visible and on paint, their intensities, R).

    frames: list of (cam, shading image, paint mask)."""
    obs = []
    for cam, sh, pm in frames:
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
        pe = cv2.erode(pm.astype(np.uint8), np.ones((2 * erode + 1, 2 * erode + 1), np.uint8)) > 0
        vis = vis[pe[v[vis], u[vis]]]
        I = bilinear(sh, uv[vis])
        obs.append((vis, I, cam.R))
    return obs


def fit_shared_light(obs, normals, max_per_frame=20000, seed=0):
    rng = np.random.default_rng(seed)
    N, I = [], []
    for vis, Ik, R in obs:
        sel = rng.choice(len(vis), min(len(vis), max_per_frame), replace=False) if len(vis) else []
        N.append(normals[vis[sel]] @ R.T); I.append(Ik[sel])
    N, I = np.concatenate(N), np.concatenate(I)
    c, r = photo.fit_light(N, I)
    return c, 1 - r.var() / I.var()


def solve_normals(obs, normals, c, iters=4, prior=0.05, min_obs=4):
    """Per-vertex normals that explain the vertex's intensities in all frames.

    Returns (normals, count, rms residual per vertex)."""
    n = len(normals)
    Nn = normals.copy()
    cnt = np.zeros(n)
    for vis, _, _ in obs:
        cnt[vis] += 1
    for _ in range(iters):
        # tangent basis
        a = np.where(np.abs(Nn[:, 0:1]) < 0.9, np.array([[1.0, 0, 0]]), np.array([[0, 1.0, 0]]))
        t1 = np.cross(Nn, a); t1 /= np.linalg.norm(t1, axis=1, keepdims=True)
        t2 = np.cross(Nn, t1)
        H = np.zeros((n, 2, 2)); g = np.zeros((n, 2)); sse = np.zeros(n)
        for vis, Ik, R in obs:
            nc = Nn[vis] @ R.T
            pred = photo.sh_basis(nc) @ c
            r = Ik - pred
            gc = np.einsum('k,nkd->nd', c, photo.sh_grad(nc))       # d pred / d n_cam
            gw = gc @ R                                              # d pred / d n_world
            j1 = (gw * t1[vis]).sum(1); j2 = (gw * t2[vis]).sum(1)
            s = 1.4826 * np.median(np.abs(r)) + 1e-6
            w = np.where(np.abs(r) < 2 * s, 1.0, 2 * s / np.abs(r))
            np.add.at(H, (vis, 0, 0), w * j1 * j1); np.add.at(H, (vis, 0, 1), w * j1 * j2)
            np.add.at(H, (vis, 1, 1), w * j2 * j2)
            np.add.at(g, (vis, 0), w * j1 * r); np.add.at(g, (vis, 1), w * j2 * r)
            np.add.at(sse, vis, r * r)
        H[:, 1, 0] = H[:, 0, 1]
        tr = H[:, 0, 0] + H[:, 1, 1]
        H[:, 0, 0] += prior * tr + 1e-6; H[:, 1, 1] += prior * tr + 1e-6
        d = np.linalg.solve(H, g[:, :, None])[:, :, 0]
        d = np.clip(d, -0.3, 0.3)
        ok = cnt >= min_obs
        Nn[ok] = Nn[ok] + d[ok, 0:1] * t1[ok] + d[ok, 1:2] * t2[ok]
        Nn /= np.linalg.norm(Nn, axis=1, keepdims=True)
    rms = np.sqrt(sse / np.maximum(cnt, 1))
    return Nn, cnt, rms
