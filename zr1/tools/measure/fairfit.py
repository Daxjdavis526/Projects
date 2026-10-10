"""The body as a fair mesh through the measured curve network.

Unknown: every vertex of a dense closed mesh (the subdivided cage). Each
Gauss-Newton step solves, for the displacement d,

  silhouettes   signed distance to the observed outline at every rim
                vertex, and no vertex on background (as cagefit), in mm;
  curve points  3-D points measured on the skin (paint boundaries, creases,
                stripe edges): point-to-plane to the nearest vertex,
                Huber-weighted, ignored beyond `cut` mm, every point
                carrying the same total weight per unit length of curve
                (the cloud is thinned on a voxel grid first);
  fairness      lam_abs ||L (V + d)||^2, the discrete thin-plate energy
                with the umbrella Laplacian L: curvature is spent only
                where the data asks for it; and lam_rel ||L d||^2, so a
                single step bends smoothly;
  damping       a small multiple of |d|^2,

by conjugate gradients, then makes the result exactly mirror-symmetric.
"""

from __future__ import annotations

import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spla
from scipy.spatial import cKDTree

from fit import proj_jac, render_outline_dist, rim_vertices, edge_face_map
from photo import vertex_normals
from cagefit import sample, paint_mask, coverage


def thin(points, cell=5.0):
    """One point per `cell` mm voxel (the mean of those in it)."""
    key = np.floor(points / cell).astype(np.int64)
    _, inv, cnt = np.unique(key, axis=0, return_inverse=True, return_counts=True)
    out = np.zeros((len(cnt), 3))
    for c in range(3):
        out[:, c] = np.bincount(inv, points[:, c]) / cnt
    return out


def umbrella(F, n):
    E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    E = np.unique(np.sort(E, 1), axis=0)
    A = sp.coo_matrix((np.ones(len(E)), (E[:, 0], E[:, 1])), shape=(n, n))
    A = (A + A.T).tocsr()
    deg = np.asarray(A.sum(1)).ravel()
    return (sp.identity(n) - sp.diags(1.0 / deg) @ A).tocsr()


class FairFit:
    def __init__(self, V, F, mirror):
        self.V, self.F, self.mirror = V.copy(), F, mirror
        n = len(V)
        L = umbrella(F, n)
        self.L3 = sp.kron(L, sp.eye(3)).tocsr()
        self.LtL = (self.L3.T @ self.L3).tocsr()
        self.ef = edge_face_map(F)

    def step(self, views, points=None, w_pt=1.0, cut=20.0, w_sil=1.0, w_out=0.5, lam_abs=0.5, lam_rel=2.0,
             damp=0.02, max_step=15.0, point_weights=None, w_cov=1.0):
        V, F = self.V, self.F
        n = len(V)
        rows, cols, vals, rhs = [], [], [], []
        r0 = [0]

        def add(vi, coef, b, w):
            m = len(vi)
            if m == 0:
                return
            rows.append(np.repeat(np.arange(r0[0], r0[0] + m), 3))
            cols.append((3 * vi[:, None] + np.arange(3)[None]).reshape(-1))
            vals.append((coef * w[:, None]).reshape(-1))
            rhs.append(b * w)
            r0[0] += m

        stats = {}
        for vd in views:
            cam = vd.cam
            uv, Jp, z = proj_jac(cam, V)
            mpp = z / cam.f
            inimg = (uv[:, 0] > 1) & (uv[:, 0] < cam.w - 2) & (uv[:, 1] > 1) & (uv[:, 1] < cam.h - 2)
            dist_outline, _ = render_outline_dist(V, F, cam)
            rim = rim_vertices(V, F, cam, self.ef)
            rim = rim[inimg[rim]]
            u = np.round(uv[rim, 0]).astype(int); v = np.round(uv[rim, 1]).astype(int)
            rim = rim[(dist_outline[v, u] < 1.6) & (vd.bad_d[v, u] == 0)]
            sd = sample(vd.sdf, uv[rim])
            g = np.stack([sample(vd.sgx, uv[rim]), sample(vd.sgy, uv[rim])], 1)
            # keep a residual only when the outline point it is measured to
            # belongs to the body, not to an excluded part (splitter, wheel...)
            gn = g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-9)
            okr = np.ones(len(rim), bool)
            for frac in (0.5, 1.0, 1.3):
                tgt = uv[rim] - (frac * sd)[:, None] * gn
                tu = np.clip(np.round(tgt[:, 0]).astype(int), 0, cam.w - 1)
                tv = np.clip(np.round(tgt[:, 1]).astype(int), 0, cam.h - 1)
                okr &= vd.bad_d[tv, tu] == 0
            rim, sd, g = rim[okr], sd[okr], g[okr]
            coef = (g[:, :, None] * Jp[rim]).sum(1) * mpp[rim, None]
            add(rim, coef, -sd * mpp[rim], np.full(len(rim), w_sil * 20 / np.sqrt(max(len(rim), 1))))
            idx = np.nonzero(inimg)[0]
            uu = np.round(uv[idx, 0]).astype(int); vv = np.round(uv[idx, 1]).astype(int)
            o = idx[(vd.sdf[vv, uu] > 0.75) & (vd.bad_d[vv, uu] == 0)]
            if len(o):
                so = sample(vd.sdf, uv[o])
                go = np.stack([sample(vd.sgx, uv[o]), sample(vd.sgy, uv[o])], 1)
                co = (go[:, :, None] * Jp[o]).sum(1) * mpp[o, None]
                add(o, co, -so * mpp[o], np.full(len(o), w_out * 20 / np.sqrt(max(len(o), 1))))
            if w_cov > 0:
                pm = paint_mask(vd)
                U = pm & (coverage(V, F, cam) == 0) & (vd.bad_d == 0)
                ys, xs = np.nonzero(U)
                ra = rim_vertices(V, F, cam, self.ef); ra = ra[inimg[ra]]
                ua = np.round(uv[ra, 0]).astype(int); va = np.round(uv[ra, 1]).astype(int)
                ra = ra[dist_outline[va, ua] < 1.6]
                if len(ys) and len(ra):
                    sel = np.arange(0, len(ys), max(1, len(ys) // 4000))
                    P2 = np.stack([xs[sel], ys[sel]], 1).astype(float) + 0.5
                    dd, kk = cKDTree(uv[ra]).query(P2, distance_upper_bound=80)
                    okc = np.isfinite(dd)
                    r_ = ra[kk[okc]]
                    g2 = np.einsum('nij,nj->ni', Jp[r_], vertex_normals(V, F)[r_])
                    g2 /= np.maximum(np.linalg.norm(g2, axis=1, keepdims=True), 1e-9)
                    res = ((P2[okc] - uv[r_]) * g2).sum(1)
                    pos = res > 0.5
                    if pos.any():
                        r_, g2, res = r_[pos], g2[pos], res[pos]
                        co = (g2[:, :, None] * Jp[r_]).sum(1) * mpp[r_, None]
                        add(r_, co, res * mpp[r_], np.full(len(r_), w_cov * 20 / np.sqrt(len(r_))))
            stats[vd.name] = (len(rim), float(np.sqrt(np.mean((sd * mpp[rim]) ** 2))) if len(rim) else 0.0, len(o))
        if points is not None and len(points):
            vn = vertex_normals(V, F)
            d, k = cKDTree(V).query(points)
            pn = ((points - V[k]) * vn[k]).sum(1)
            ok = (d < 2 * cut) & (np.abs(pn) < cut)
            k, pn = k[ok], pn[ok]
            pw = np.ones(ok.sum()) if point_weights is None else point_weights[ok]
            hub = np.sqrt(np.where(np.abs(pn) < 2, 1.0, 2 / np.maximum(np.abs(pn), 1e-9)))
            add(k, vn[k], pn, w_pt * pw * hub * 20 / np.sqrt(max(len(k), 1)))
            stats['points'] = (len(k), float(np.sqrt(np.mean(pn ** 2))) if len(k) else 0.0, int((~ok).sum()))
        A = sp.csr_matrix((np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))), shape=(r0[0], 3 * n))
        b = np.concatenate(rhs)
        x0 = V.reshape(-1)
        M = (A.T @ A + (lam_abs + lam_rel) * self.LtL + damp * sp.identity(3 * n)).tocsr()
        rhs_ = A.T @ b - lam_abs * (self.LtL @ x0)
        dg = M.diagonal()
        pre = spla.LinearOperator(M.shape, matvec=lambda x: x / dg)
        dvec, _ = spla.cg(M, rhs_, M=pre, rtol=1e-6, maxiter=1000)
        D = dvec.reshape(-1, 3)
        D = 0.5 * (D + D[self.mirror] * np.array([1, -1, 1]))
        mx = np.linalg.norm(D, axis=1).max()
        if mx > max_step:
            D *= max_step / mx
        self.V = V + D
        stats['_step'] = (0, float(mx), 0)
        return stats
