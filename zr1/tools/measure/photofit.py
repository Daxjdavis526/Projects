"""Refining the body mesh with the paint's shading in every view.

Each iteration:

  1. per view, rasterise the mesh (photo.raster), take the pixels that are
     paint in the white-minus-red image (paint.shading), not grazing and not
     in an excluded zone, and fit that view's light (nine SH coefficients);
  2. per pixel, the shading residual and its gradient with respect to the
     normal, restricted to the tangent plane, are accumulated on the
     triangle's vertices (barycentric weights) over all views: a 2x2 normal
     equation per vertex whose solution is the tilt that best explains the
     shading wherever that vertex is seen. Different views are lit from
     different directions, so the tilt is determined in both tangent
     directions;
  3. positions: every edge around a vertex with a target normal should be
     perpendicular to it; silhouettes as in cagefit (signed distance to the
     observed outline at each rim vertex, and no vertex on background);
     optional 3-D curve points on the skin; a smooth (Laplacian) update and
     a damping term; then exact mirror symmetry.
"""

from __future__ import annotations

import numpy as np
import cv2
import scipy.sparse as sp
import scipy.sparse.linalg as spla
from scipy.spatial import cKDTree

import photo
import paint
from fit import proj_jac, render_outline_dist, rim_vertices, edge_face_map
from cagefit import sample


def neighbours(F, n):
    E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    E = np.unique(np.sort(E, 1), axis=0)
    return E


def uniform_laplacian(E, n):
    A = sp.coo_matrix((np.ones(len(E)), (E[:, 0], E[:, 1])), shape=(n, n))
    A = (A + A.T).tocsr()
    deg = np.asarray(A.sum(1)).ravel()
    return (sp.diags(deg) - A).tocsr()


class PhotoView:
    """A calibrated view with its shading image and silhouette data."""
    def __init__(self, vd, erode=2):
        self.vd = vd
        self.name, self.cam = vd.name, vd.cam
        sh, pm, car = paint.shading(vd.name)
        pm = cv2.erode(pm.astype(np.uint8), np.ones((2 * erode + 1, 2 * erode + 1), np.uint8)) > 0
        self.sh = sh
        self.paint = pm & (vd.bad_d == 0)


def normal_targets(V, F, vn, pviews, mu=4.0, min_cos=0.25, max_tilt=0.25, log=None):
    n = len(V)
    A = np.zeros((n, 3, 3))
    b = np.zeros((n, 3))
    cnt = np.zeros(n)
    stats = {}
    for pv in pviews:
        cam = pv.cam
        tid, (yy, xx, t, bary) = photo.raster(V, F, cam)
        ok = pv.paint[yy, xx]
        yy, xx, t, bary = yy[ok], xx[ok], t[ok], bary[ok]
        nn = (vn[F[t]] * bary[:, :, None]).sum(1)
        nn /= np.linalg.norm(nn, axis=1, keepdims=True)
        P = (V[F[t]] * bary[:, :, None]).sum(1)
        vdir = cam.centre[None] - P
        vdir /= np.linalg.norm(vdir, axis=1, keepdims=True)
        ok = (nn * vdir).sum(1) > min_cos
        yy, xx, t, bary, nn = yy[ok], xx[ok], t[ok], bary[ok], nn[ok]
        if len(t) < 500:
            continue
        I = pv.sh[yy, xx]
        c, r = photo.fit_light(nn, I)
        s = 1.4826 * np.median(np.abs(r)) + 1e-6
        w = np.where(np.abs(r) < 2.5 * s, 1.0, 2.5 * s / np.abs(r))        # Huber
        g = np.einsum('k,nkd->nd', c, photo.sh_grad(nn))
        g -= (g * nn).sum(1, keepdims=True) * nn                          # tangent part
        # normalise per view so bright and dark renders weigh alike
        sc = 1.0 / max(np.median(np.linalg.norm(g, axis=1)), 1e-6)
        g *= sc
        r = r * sc
        for k in range(3):
            vi = F[t, k]
            wb = w * bary[:, k]
            for p in range(3):
                b[:, p] += np.bincount(vi, wb * r * g[:, p], minlength=n)
                for q in range(p, 3):
                    s_ = np.bincount(vi, wb * g[:, p] * g[:, q], minlength=n)
                    A[:, p, q] += s_
                    if q != p:
                        A[:, q, p] += s_
            cnt += np.bincount(vi, wb, minlength=n)
        stats[pv.name] = (len(t), float(1 - r.var() / (I * sc).var()))
    has = cnt > 2
    # solve (A + mu*cnt*(I - n n^T) ... ) restricted to the tangent plane
    tgt = vn.copy()
    i = np.nonzero(has)[0]
    nrm = vn[i]
    tr = np.trace(A[i], axis1=1, axis2=2)
    M = (A[i] + (mu * 0.05 * cnt[i])[:, None, None] * np.eye(3)[None]
         + (1e3 * (tr + 1))[:, None, None] * nrm[:, :, None] * nrm[:, None, :])
    d = np.linalg.solve(M, b[i][:, :, None])[:, :, 0]
    L = np.linalg.norm(d, axis=1, keepdims=True)
    d = np.where(L > max_tilt, d * max_tilt / np.maximum(L, 1e-12), d)
    t_ = nrm + d
    tgt[i] = t_ / np.linalg.norm(t_, axis=1, keepdims=True)
    return tgt, has, cnt, stats


def solve_positions(V, F, E, Lap, tgt, has, wnorm, views, w_sil=1.0, w_out=0.5, lam=1.0, damp=0.05,
                    points=None, w_pt=0.3, pt_cut=25.0, mirror=None):
    n = len(V)
    rows, cols, vals, rhs = [], [], [], []
    r0 = [0]

    def add(vidx, coef, b, w):
        """rows: sum_k coef[:,k,:] . d[vidx[:,k]] = b"""
        m, K = vidx.shape
        rr = np.repeat(np.arange(r0[0], r0[0] + m), K * 3)
        cc = (3 * vidx[:, :, None] + np.arange(3)[None, None]).reshape(-1)
        rows.append(rr); cols.append(cc); vals.append((coef * w[:, None, None]).reshape(-1)); rhs.append(b * w)
        r0[0] += m

    # normal targets on both directions of every edge
    for a, c in ((0, 1), (1, 0)):
        k, j = E[:, a], E[:, c]
        sel = has[k]
        k, j = k[sel], j[sel]
        t = tgt[k]
        e = V[j] - V[k]
        L = np.maximum(np.linalg.norm(e, axis=1), 1e-6)
        coef = np.stack([-t, t], 1) / L[:, None, None]
        add(np.stack([k, j], 1), coef, -(e * t).sum(1) / L, np.full(len(k), wnorm))
    stats = {}
    ef = edge_face_map(F)
    for vd in views:
        cam = vd.cam
        uv, Jp, z = proj_jac(cam, V)
        mpp = z / cam.f
        inimg = (uv[:, 0] > 1) & (uv[:, 0] < cam.w - 2) & (uv[:, 1] > 1) & (uv[:, 1] < cam.h - 2)
        dist_outline, _ = render_outline_dist(V, F, cam)
        rim = rim_vertices(V, F, cam, ef)
        rim = rim[inimg[rim]]
        u = np.round(uv[rim, 0]).astype(int); v = np.round(uv[rim, 1]).astype(int)
        rim = rim[(dist_outline[v, u] < 1.6) & (vd.bad_d[v, u] == 0)]
        sd = sample(vd.sdf, uv[rim])
        g = np.stack([sample(vd.sgx, uv[rim]), sample(vd.sgy, uv[rim])], 1)
        coef = (g[:, :, None] * Jp[rim]).sum(1) * mpp[rim, None]
        add(rim[:, None], coef[:, None, :], -sd * mpp[rim], np.full(len(rim), w_sil * 20 / np.sqrt(max(len(rim), 1))))
        idx = np.nonzero(inimg)[0]
        uu = np.round(uv[idx, 0]).astype(int); vv = np.round(uv[idx, 1]).astype(int)
        o = idx[(vd.sdf[vv, uu] > 0.75) & (vd.bad_d[vv, uu] == 0)]
        if len(o):
            so = sample(vd.sdf, uv[o])
            go = np.stack([sample(vd.sgx, uv[o]), sample(vd.sgy, uv[o])], 1)
            co = (go[:, :, None] * Jp[o]).sum(1) * mpp[o, None]
            add(o[:, None], co[:, None, :], -so * mpp[o], np.full(len(o), w_out * 20 / np.sqrt(max(len(o), 1))))
        stats[vd.name] = (len(rim), float(np.sqrt(np.mean((sd * mpp[rim]) ** 2))) if len(rim) else 0.0, len(o))
    if points is not None and len(points):
        vn = photo.vertex_normals(V, F)
        d, k = cKDTree(V).query(points)
        pn = ((points - V[k]) * vn[k]).sum(1)
        ok = (d < 2 * pt_cut) & (np.abs(pn) < pt_cut)
        k, pn = k[ok], pn[ok]
        hub = np.sqrt(np.where(np.abs(pn) < 2, 1.0, 2 / np.maximum(np.abs(pn), 1e-9)))
        add(k[:, None], vn[k][:, None, :], pn, w_pt * hub * 20 / np.sqrt(max(len(k), 1)))
        stats['points'] = (len(k), float(np.sqrt(np.mean(pn ** 2))) if len(k) else 0.0, 0)
    A = sp.csr_matrix((np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))), shape=(r0[0], 3 * n))
    b = np.concatenate(rhs)
    L3 = sp.kron(Lap, sp.eye(3)).tocsr()
    M = (A.T @ A + lam * (L3.T @ L3) + damp * sp.eye(3 * n)).tocsr()
    rhs_ = A.T @ b
    dg = M.diagonal()
    pre = spla.LinearOperator(M.shape, matvec=lambda x: x / dg)
    d, info = spla.cg(M, rhs_, M=pre, rtol=1e-6, maxiter=800)
    d = d.reshape(-1, 3)
    if mirror is not None:
        d = 0.5 * (d + d[mirror] * np.array([1, -1, 1]))
    return d, stats
