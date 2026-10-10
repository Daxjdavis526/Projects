"""Surface normals from the paint's shading in many views (photometric
stereo), for skinfit to integrate.

The spin's thirty frames are lit by lights that travel with the camera:
one diffuse-shading function f(n_cam) for all of them. Each configurator
view has its own lighting f_v. Both are modelled with nine spherical-
harmonic coefficients (photo.sh_basis) in camera coordinates. Shading is
the green channel of the Arctic White render minus the Torch Red render,
each first converted from sRGB to linear light (the difference of the
encoded values is not proportional to the light), on paint only, away from
clipped highlights.

A vertex seen on paint in several images gets its normal from all of them
at once: Gauss-Newton on the two tangent directions of the mesh's own
normal, with a prior pulling back to it. The prior is what pins the
solution: a spin about one vertical axis cannot tell a normal from the same
normal turned about that axis together with the light, and the mesh's
normal (right to a few degrees on average, from the silhouettes) removes
that freedom without removing the detail.
"""

from __future__ import annotations

import numpy as np
import cv2

import photo
import paint
from turntable import observe as _observe


def lin(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def image(view):
    """Linear shading image and its usable mask."""
    w, r = paint.pair(view)
    _, pm, _ = paint.shading(view)
    I = (lin(w[:, :, 1].astype(float)) - lin(r[:, :, 1].astype(float))).astype(np.float32)
    pm = pm & (w[:, :, :3].max(2) < 252)
    return I, pm


def observe(V, F, groups, erode=3):
    """groups: {name: [(cam, I, pm), ...]} — images in one group share a light.
    Returns a list of (group, vis, I, R)."""
    out = []
    for g, frames in groups.items():
        for vis, I, R in _observe(V, F, frames, erode=erode):
            out.append((g, vis, I, R))
    return out


def fit_lights(obs, normals, per=20000, seed=0):
    rng = np.random.default_rng(seed)
    lights, r2 = {}, {}
    for g in {o[0] for o in obs}:
        N, I = [], []
        for gg, vis, Ik, R in obs:
            if gg != g or len(vis) == 0:
                continue
            sel = rng.choice(len(vis), min(len(vis), per), replace=False)
            N.append(normals[vis[sel]] @ R.T); I.append(Ik[sel])
        N, I = np.concatenate(N), np.concatenate(I)
        c, r = photo.fit_light(N, I)
        lights[g] = c
        r2[g] = 1 - r.var() / I.var()
    return lights, r2


def solve(obs, prior_n, lights, prior=0.15, iters=5, min_obs=4, max_tilt_deg=35.0):
    """Normals explaining the shading, pulled toward prior_n.

    prior: weight of the prior relative to the mean data curvature per
    vertex. Returns (normals, observation count, rms residual)."""
    n = len(prior_n)
    a = np.where(np.abs(prior_n[:, 0:1]) < 0.9, np.array([[1.0, 0, 0]]), np.array([[0, 1.0, 0]]))
    t1 = np.cross(prior_n, a); t1 /= np.linalg.norm(t1, axis=1, keepdims=True)
    t2 = np.cross(prior_n, t1)
    cnt = np.zeros(n)
    for _, vis, _, _ in obs:
        cnt[vis] += 1
    d = np.zeros((n, 2))                       # tangent offset from the prior
    for _ in range(iters):
        Nn = prior_n + d[:, 0:1] * t1 + d[:, 1:2] * t2
        Nn /= np.linalg.norm(Nn, axis=1, keepdims=True)
        H = np.zeros((n, 2, 2)); g = np.zeros((n, 2)); sse = np.zeros(n)
        for grp, vis, Ik, R in obs:
            c = lights[grp]
            nc = Nn[vis] @ R.T
            pred = photo.sh_basis(nc) @ c
            r = Ik - pred
            gw = np.einsum('k,nkd->nd', c, photo.sh_grad(nc)) @ R
            j1 = (gw * t1[vis]).sum(1); j2 = (gw * t2[vis]).sum(1)
            s = 1.4826 * np.median(np.abs(r)) + 1e-6
            w = np.where(np.abs(r) < 2 * s, 1.0, 2 * s / np.abs(r))
            np.add.at(H, (vis, 0, 0), w * j1 * j1); np.add.at(H, (vis, 0, 1), w * j1 * j2)
            np.add.at(H, (vis, 1, 1), w * j2 * j2)
            np.add.at(g, (vis, 0), w * j1 * r); np.add.at(g, (vis, 1), w * j2 * r)
            np.add.at(sse, vis, r * r)
        H[:, 1, 0] = H[:, 0, 1]
        k = prior * np.median((H[:, 0, 0] + H[:, 1, 1])[cnt >= min_obs]) / 2 + 1e-9
        # Gauss-Newton on the total offset with the prior on the total offset
        A = H + k * np.eye(2)[None]
        b = g + (H @ d[:, :, None])[:, :, 0] - 0 * d
        dn = np.linalg.solve(A, b[:, :, None])[:, :, 0]
        lim = np.tan(np.radians(max_tilt_deg))
        nrm = np.linalg.norm(dn, axis=1, keepdims=True)
        dn = np.where(nrm > lim, dn * lim / np.maximum(nrm, 1e-12), dn)
        ok = cnt >= min_obs
        d[ok] = dn[ok]
    Nn = prior_n + d[:, 0:1] * t1 + d[:, 1:2] * t2
    Nn /= np.linalg.norm(Nn, axis=1, keepdims=True)
    rms = np.sqrt(sse / np.maximum(cnt, 1))
    return Nn, cnt, rms


def solve_k(obs, prior_n, lights, prior=0.15, iters=6, min_obs=4, max_tilt_deg=35.0, k_range=(0.4, 1.6)):
    """As `solve`, with one brightness factor k per vertex shared by all the
    images that see it: intensity = k · f_view(n).

    The renders carry occlusion and soft shadow (under overhangs, inside the
    wheel arches, along panel gaps) that no lighting function of the normal
    alone explains; fitted with k = 1, the solve turns the normal away from
    the light to make such a spot darker, and the surface integrates that
    into dents and bulges. With k free, a spot that is darker in every view
    by the same factor costs nothing; the normal is decided by how the
    shading CHANGES from view to view, which is what the geometry controls.
    Returns (normals, k, observation count, rms residual)."""
    n = len(prior_n)
    a = np.where(np.abs(prior_n[:, 0:1]) < 0.9, np.array([[1.0, 0, 0]]), np.array([[0, 1.0, 0]]))
    t1 = np.cross(prior_n, a); t1 /= np.linalg.norm(t1, axis=1, keepdims=True)
    t2 = np.cross(prior_n, t1)
    cnt = np.zeros(n)
    for _, vis, _, _ in obs:
        cnt[vis] += 1
    d = np.zeros((n, 2)); lk = np.zeros(n)          # tangent offset, log k
    lim = np.tan(np.radians(max_tilt_deg))
    ok = cnt >= min_obs
    for _ in range(iters):
        Nn = prior_n + d[:, 0:1] * t1 + d[:, 1:2] * t2
        Nn /= np.linalg.norm(Nn, axis=1, keepdims=True)
        k = np.exp(lk)
        H = np.zeros((n, 3, 3)); g = np.zeros((n, 3)); sse = np.zeros(n)
        for grp, vis, Ik, R in obs:
            c = lights[grp]
            nc = Nn[vis] @ R.T
            f = photo.sh_basis(nc) @ c
            r = Ik - k[vis] * f
            gw = np.einsum('k,nkd->nd', c, photo.sh_grad(nc)) @ R
            J = np.stack([k[vis] * (gw * t1[vis]).sum(1), k[vis] * (gw * t2[vis]).sum(1), k[vis] * f], 1)
            s = 1.4826 * np.median(np.abs(r)) + 1e-6
            w = np.where(np.abs(r) < 2 * s, 1.0, 2 * s / np.abs(r))
            for i in range(3):
                for j in range(i, 3):
                    np.add.at(H, (vis, i, j), w * J[:, i] * J[:, j])
                np.add.at(g, (vis, i), w * J[:, i] * r)
            np.add.at(sse, vis, r * r)
        for i in range(3):
            for j in range(i):
                H[:, i, j] = H[:, j, i]
        kp = prior * np.median((H[:, 0, 0] + H[:, 1, 1])[ok]) / 2 + 1e-9
        # prior on the TOTAL tangent offset (pull to the mesh normal); a
        # weak one on log k (pull to 1)
        A = H.copy()
        A[:, 0, 0] += kp; A[:, 1, 1] += kp; A[:, 2, 2] += 0.05 * np.median(H[ok, 2, 2]) + 1e-9
        b = g.copy()
        b[:, 0] -= kp * d[:, 0]; b[:, 1] -= kp * d[:, 1]; b[:, 2] -= 0.05 * np.median(H[ok, 2, 2]) * lk
        step = np.linalg.solve(A + 1e-12 * np.eye(3)[None], b[:, :, None])[:, :, 0]
        dn = d + step[:, :2]
        nrm = np.linalg.norm(dn, axis=1, keepdims=True)
        dn = np.where(nrm > lim, dn * lim / np.maximum(nrm, 1e-12), dn)
        d[ok] = dn[ok]
        lk[ok] = np.clip(lk[ok] + step[ok, 2], np.log(k_range[0]), np.log(k_range[1]))
    Nn = prior_n + d[:, 0:1] * t1 + d[:, 1:2] * t2
    Nn /= np.linalg.norm(Nn, axis=1, keepdims=True)
    return Nn, np.exp(lk), cnt, np.sqrt(sse / np.maximum(cnt, 1))
