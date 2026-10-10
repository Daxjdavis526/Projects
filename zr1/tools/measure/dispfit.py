"""Fine detail as a displacement of the subdivided cage along its normals.

The cage's subdivision carries the body's large shape; detail smaller than
the cage's spacing (a few centimetres) is one scalar per fine vertex, an
offset d along that vertex's normal. Each solve is linear least squares in
d (conjugate gradients):

  targets      maskfit's per-vertex offsets (where all views agree about the
               paint boundaries): d_i = t_i, weighted by confidence;
  silhouettes  as in cagefit, along the normal: rim vertices to the
               observed outline (only where that outline is the body's),
               vertices on background pushed in, uncovered paint covered;
  smoothness   lam ||L d||^2 with the umbrella Laplacian, mu ||d||^2;

then the left and right halves are averaged into exact symmetry.
"""

from __future__ import annotations

import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spla
from scipy.spatial import cKDTree

from fit import proj_jac, render_outline_dist, rim_vertices, edge_face_map
from cagefit import sample, paint_mask, coverage
from fairfit import umbrella
from photo import vertex_normals


def solve(V, F, mirror, views, ids=None, t=None, conf=None, w_t=1.0, w_sil=1.0, w_out=0.5, w_cov=1.0,
          lam=4.0, mu=0.01, d0=None):
    n = len(V)
    N = vertex_normals(V, F)
    ef = edge_face_map(F)
    rows, cols, vals, rhs = [], [], [], []
    r0 = [0]

    def add(vi, coef, b, w):
        m = len(vi)
        if m == 0:
            return
        rows.append(np.arange(r0[0], r0[0] + m)); cols.append(vi); vals.append(coef * w); rhs.append(b * w)
        r0[0] += m

    if ids is not None and len(ids):
        add(ids, np.ones(len(ids)), t, w_t * conf * 20 / np.sqrt(len(ids)))
    stats = {}
    for vd in views:
        cam = vd.cam
        uv, Jp, z = proj_jac(cam, V)
        mpp = z / cam.f
        Jn = np.einsum('nij,nj->ni', Jp, N)          # image motion per mm along the normal
        inimg = (uv[:, 0] > 1) & (uv[:, 0] < cam.w - 2) & (uv[:, 1] > 1) & (uv[:, 1] < cam.h - 2)
        dist_outline, _ = render_outline_dist(V, F, cam)
        rim = rim_vertices(V, F, cam, ef)
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
            okr &= vd.bad_d[np.clip(np.round(tg[:, 1]).astype(int), 0, cam.h - 1), np.clip(np.round(tg[:, 0]).astype(int), 0, cam.w - 1)] == 0
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
            U = paint_mask(vd) & (coverage(V, F, cam) == 0) & (vd.bad_d == 0)
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
                    add(r_, np.linalg.norm(Jn[r_], axis=1) * mpp[r_], res * mpp[r_], np.full(len(r_), w_cov * 20 / np.sqrt(len(r_))))
        stats[vd.name] = (len(rim), float(np.sqrt(np.mean((sd * mpp[rim]) ** 2))) if len(rim) else 0.0)
    A = sp.csr_matrix((np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))), shape=(r0[0], n))
    b = np.concatenate(rhs)
    L = umbrella(F, n)
    M = (A.T @ A + lam * (L.T @ L) + mu * sp.identity(n)).tocsr()
    dg = M.diagonal()
    d, _ = spla.cg(M, A.T @ b, x0=d0, M=spla.LinearOperator(M.shape, matvec=lambda x: x / dg), rtol=1e-7, maxiter=3000)
    d = 0.5 * (d + d[mirror])
    return d, N, stats
