"""The body skin's fine shape: a displacement along the normals of the
subdivided cage, fitted to the measured 3-D lines and to every view.

The cage (cagefit) carries the body's large shape but not its lines: a
subdivision surface through a few thousand control points is too coarse
to bend where the C8's creases and panel edges are, and its own fairness
(relative to a template) keeps whatever lumps the template had. Here
every vertex of the level-3 subdivision gets one more unknown, an offset
d along the cage surface's normal (the quad-diagonal normal the Rust
crate recomputes, `skin::quad_normals`), and the surface x0 + n d is
fitted to:

  lines        the multi-view 3-D line points (paint boundaries, crease
               lines in the clay shading, stripe edges): each point to the
               tangent plane of its nearest vertex, robust (Huber), points
               too far from the surface ignored;
  silhouettes  as in cagefit/dispfit: rim vertices onto the observed
               outline where that outline is the body's, nothing on
               background, every painted pixel covered;
  fairness     the umbrella Laplacian of the POSITIONS (not of d): the
               surface itself is made smooth, so the cage's lumps are
               smoothed away wherever no data holds them;

then exact mirror symmetry. Gauss-Newton, each step a sparse least-squares
solve by preconditioned conjugate gradients.
"""

from __future__ import annotations

import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spla
from scipy.spatial import cKDTree

from fit import proj_jac, render_outline_dist, rim_vertices, edge_face_map
from cagefit import sample, paint_mask, coverage
from fairfit import umbrella


def quad_normals(V, Q):
    """Vertex normals from quad diagonals, as `skin::quad_normals`."""
    a, b, c, d = (V[Q[:, k]] for k in range(4))
    fn = np.cross(c - a, d - b)
    n = np.zeros_like(V)
    for k in range(4):
        np.add.at(n, Q[:, k], fn)
    return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)


def mirror_map(V):
    t = cKDTree(V)
    d, k = t.query(V * np.array([1.0, -1.0, 1.0]))
    assert d.max() < 1e-6, f"mesh is not mirror-symmetric ({d.max():.2e} mm)"
    return k


def triangles(Q):
    return np.concatenate([Q[:, [0, 1, 2]], Q[:, [0, 2, 3]]])


class SkinFit:
    def __init__(self, X0, Q, order=1):
        self.X0 = X0
        self.Q = Q
        self.F = triangles(Q)
        self.N0 = quad_normals(X0, Q)
        self.n = len(X0)
        self.mirror = mirror_map(X0)
        self.L = umbrella(self.F, self.n)
        if order == 2:
            # second order: the change of the Laplacian, not the Laplacian.
            # A panel of even curvature costs nothing (the first-order term
            # pulls every panel toward flat, which between measured points
            # makes blobs and flattens creases); a wave costs a lot.
            self.L = (self.L @ self.L).tocsr()
        self.ef = edge_face_map(self.F)
        self.d = np.zeros(self.n)
        self.target = np.zeros_like(X0)      # L x the fairness aims at (0: plain thin plate)

    def smooth_target(self, iters=30, lam=0.5, mu=-0.53):
        """Aim the fairness at the curvature of a Taubin-smoothed copy of the
        base: the base's large shape is kept, its lumps are not."""
        X = self.X0.copy()
        W = sp.identity(self.n) - self.L          # neighbour mean
        for _ in range(iters):
            X = X + lam * (W @ X - X)
            X = X + mu * (W @ X - X)
        self.target = self.L @ X
        return X

    def X(self, d=None):
        d = self.d if d is None else d
        return self.X0 + self.N0 * d[:, None]

    def step(self, views, points=None, w_pt=1.0, huber=4.0, cut=30.0, w_sil=1.0, w_out=0.5, w_cov=1.0,
             lam=1.0, mu=0.02, max_step=15.0, fair_w=None, normals=None, w_n=1.0, log=print):
        X = self.X()
        n = self.n
        F = self.F
        rows, cols, vals, rhs = [], [], [], []
        r0 = [0]

        def add(vi, coef, b, w):
            m = len(vi)
            if m == 0:
                return
            rows.append(np.arange(r0[0], r0[0] + m)); cols.append(vi); vals.append(coef * w); rhs.append(b * w)
            r0[0] += m

        # current normals (for the line points' tangent planes)
        fn = np.cross(X[F[:, 1]] - X[F[:, 0]], X[F[:, 2]] - X[F[:, 0]])
        vn = np.zeros_like(X)
        for k in range(3):
            np.add.at(vn, F[:, k], fn)
        vn /= np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-12)
        stats = {}
        if points is not None and len(points):
            dist, k = cKDTree(X).query(points)
            r = ((points - X[k]) * vn[k]).sum(1)            # + : point lies outside the surface
            ok = (np.abs(r) < cut) & (dist < cut + 15)
            k, r = k[ok], r[ok]
            g = (self.N0[k] * vn[k]).sum(1)                  # how much d moves the plane
            w = np.where(np.abs(r) < huber, 1.0, np.sqrt(huber / np.abs(r)))
            add(k, g, r, w_pt * w)
            stats['pts'] = (len(r), float(np.sqrt(np.mean(r ** 2))), float(np.median(np.abs(r))))
        if normals is not None:
            # photometric normals (psnorm): every edge of a triangle whose
            # three vertices have one is made perpendicular to their mean
            Tn, wn = normals
            tri = F[(wn[F] > 0).all(1)]
            m = Tn[tri].sum(1)
            m /= np.maximum(np.linalg.norm(m, axis=1, keepdims=True), 1e-12)
            wt = w_n * np.sqrt(wn[tri].min(1))
            res_all = []
            for i, j in ((0, 1), (1, 2), (2, 0)):
                a_, b_ = tri[:, i], tri[:, j]
                r = ((X[b_] - X[a_]) * m).sum(1)
                k0 = r0[0]
                ridx = np.arange(k0, k0 + len(r))
                rows += [ridx, ridx]
                cols += [b_, a_]
                vals += [wt * (self.N0[b_] * m).sum(1), -wt * (self.N0[a_] * m).sum(1)]
                rhs.append(-r * wt)
                r0[0] += len(r)
                res_all.append(r)
            ra = np.concatenate(res_all)
            stats['nrm'] = (len(tri), float(np.sqrt(np.mean(ra ** 2))))
        sil = []
        for vd in views:
            cam = vd.cam
            uv, Jp, z = proj_jac(cam, X)
            mpp = z / cam.f
            Jn = np.einsum('nij,nj->ni', Jp, self.N0)
            inimg = (uv[:, 0] > 1) & (uv[:, 0] < cam.w - 2) & (uv[:, 1] > 1) & (uv[:, 1] < cam.h - 2)
            dist_outline, _ = render_outline_dist(X, F, cam)
            rim = rim_vertices(X, F, cam, self.ef)
            rim = rim[inimg[rim]]
            u = np.round(uv[rim, 0]).astype(int); v = np.round(uv[rim, 1]).astype(int)
            rim_o = rim[dist_outline[v, u] < 1.6]
            rim = rim_o[vd.bad_d[np.round(uv[rim_o, 1]).astype(int), np.round(uv[rim_o, 0]).astype(int)] == 0]
            sd = sample(vd.sdf, uv[rim])
            g = np.stack([sample(vd.sgx, uv[rim]), sample(vd.sgy, uv[rim])], 1)
            gn = g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-9)
            okr = np.ones(len(rim), bool)
            for frac in (0.5, 1.0, 1.3):
                tg = uv[rim] - (frac * sd)[:, None] * gn
                okr &= vd.bad_d[np.clip(np.round(tg[:, 1]).astype(int), 0, cam.h - 1),
                                np.clip(np.round(tg[:, 0]).astype(int), 0, cam.w - 1)] == 0
            rim, sd, g = rim[okr], sd[okr], g[okr]
            coef = (g * Jn[rim]).sum(1) * mpp[rim]
            add(rim, coef, -sd * mpp[rim], np.full(len(rim), w_sil * 20 / np.sqrt(max(len(rim), 1))))
            idx = np.nonzero(inimg)[0]
            uu = np.round(uv[idx, 0]).astype(int); vv = np.round(uv[idx, 1]).astype(int)
            o = idx[(vd.sdf[vv, uu] > 0.75) & (vd.bad_d[vv, uu] == 0)]
            if len(o):
                so = sample(vd.sdf, uv[o])
                go = np.stack([sample(vd.sgx, uv[o]), sample(vd.sgy, uv[o])], 1)
                add(o, (go * Jn[o]).sum(1) * mpp[o], -so * mpp[o], np.full(len(o), w_out * 20 / np.sqrt(len(o))))
            if w_cov > 0:
                ok = getattr(vd, 'cov_ok', None)
                U = paint_mask(vd) & (coverage(X, F, cam) == 0) & (ok if ok is not None else (vd.bad_d == 0))
                ys, xs = np.nonzero(U)
                if len(ys) and len(rim_o):
                    sel = np.arange(0, len(ys), max(1, len(ys) // 4000))
                    P2 = np.stack([xs[sel], ys[sel]], 1).astype(float) + 0.5
                    dd, kk = cKDTree(uv[rim_o]).query(P2, distance_upper_bound=80)
                    okc = np.isfinite(dd)
                    r_ = rim_o[kk[okc]]
                    g2 = Jn[r_] / np.maximum(np.linalg.norm(Jn[r_], axis=1, keepdims=True), 1e-9)
                    res = ((P2[okc] - uv[r_]) * g2).sum(1)
                    pos = res > 0.5
                    if pos.any():
                        r_, g2, res = r_[pos], g2[pos], res[pos]
                        add(r_, np.linalg.norm(Jn[r_], axis=1) * mpp[r_], res * mpp[r_],
                            np.full(len(r_), w_cov * 20 / np.sqrt(len(r_))))
            sil.append(float(np.sqrt(np.mean((sd * mpp[rim]) ** 2))) if len(rim) else 0.0)
        stats['sil'] = (float(np.median(sil)), float(np.max(sil))) if sil else (0.0, 0.0)
        A = sp.csr_matrix((np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))), shape=(r0[0], n))
        b = np.concatenate(rhs)
        # fairness of the positions: L (X + N0 delta) -> 0
        # (fair_w: per-vertex weight of the fairness, e.g. relaxed along the
        # measured lines so the surface may crease there)
        Lw = self.L if fair_w is None else sp.diags(np.sqrt(fair_w)) @ self.L
        LN = [Lw @ sp.diags(self.N0[:, c]) for c in range(3)]
        LX = Lw @ X - (self.target if fair_w is None else np.sqrt(fair_w)[:, None] * self.target)
        M = A.T @ A + lam * sum(m.T @ m for m in LN) + mu * sp.identity(n)
        rhs_v = A.T @ b - lam * sum(LN[c].T @ LX[:, c] for c in range(3))
        M = M.tocsr()
        dg = M.diagonal()
        delta, _ = spla.cg(M, rhs_v, M=spla.LinearOperator(M.shape, matvec=lambda x: x / dg), rtol=1e-6, maxiter=4000)
        delta = np.clip(0.5 * (delta + delta[self.mirror]), -max_step, max_step)
        self.d = self.d + delta
        stats['step'] = float(np.abs(delta).max())
        stats['fair'] = float(np.sqrt(np.mean((self.L @ self.X() - self.target) ** 2)))
        return stats
