"""Fitting the B-spline body (bsurf.Surface) to the calibrated views.

Gauss-Newton on the control points. Each iteration meshes the surface,
finds in every view the vertices on its occluding contour, matches them to
the observed body outline (both directions) and pushes vertices that
project onto background back inside, all in millimetres at the vertex's
depth; the rows are chained through the surface's linear basis onto the
control points. Fairness: the control net's second differences stay close
to the starting template's (so the car keeps its curvature where no view
constrains it), with a small absolute term so the net stays even.
"""

from __future__ import annotations

import numpy as np
import scipy.sparse as sp
import scipy.sparse.linalg as spla
from scipy.spatial import cKDTree

from bsurf import Surface
from fit import proj_jac, render_outline_dist, rim_vertices, edge_face_map


def unpack_matrix(S: Surface):
    """Sparse U with P.ravel() (3 n, order x,y,z per control point) = U q."""
    n = S.nv * S.nu
    rows, cols = [], []
    for k in range(n):
        rows += [3 * k, 3 * k + 2]
        cols += [k, n + k]
    fy = np.nonzero(S.free_y)[0]
    for m, k in enumerate(fy):
        rows.append(3 * k + 1)
        cols.append(2 * n + m)
    return sp.csr_matrix((np.ones(len(rows)), (rows, cols)), shape=(3 * n, S.n_params()))


def second_diff(nv, nu):
    """Second differences of the control net along i and along j (3 coords)."""
    rows, cols, vals = [], [], []
    r = 0
    idx = lambda i, j: i * nu + j
    for i in range(1, nv - 1):
        for j in range(nu):
            for c in range(3):
                for (ii, w) in ((i - 1, 1), (i, -2), (i + 1, 1)):
                    rows.append(r); cols.append(3 * idx(ii, j) + c); vals.append(w)
                r += 1
    for i in range(nv):
        for j in range(1, nu - 1):
            for c in range(3):
                for (jj, w) in ((j - 1, 1), (j, -2), (j + 1, 1)):
                    rows.append(r); cols.append(3 * idx(i, jj) + c); vals.append(w)
                r += 1
    return sp.csr_matrix((vals, (rows, cols)), shape=(r, 3 * nv * nu))


def fit(S: Surface, P0, views, iters=15, w_shape=(0.05, 0.01), w_fair=0.002, w_out=1.0,
        max_match_px=40, curves=None, w_curve=1.0, log=print, callback=None, P_template=None):
    U = unpack_matrix(S)
    D2 = second_diff(S.nv, S.nu)
    R = (D2 @ U).tocsr()
    q = S.pack(P0)
    q_t = S.pack(P_template if P_template is not None else P0)
    Rq_t = R @ q_t
    Jx, Jy, Jz = S.jacobian_blocks()
    V, F, src, mir = S.mesh(P0)
    ef = edge_face_map(F)
    ws = np.geomspace(w_shape[0], w_shape[1], iters)
    stats = {}
    for it in range(iters):
        P = S.unpack(q)
        V, _, _, _ = S.mesh(P)
        blocks, rhs = [], []
        stats = {}

        def add(k, coef, b, w):
            """Rows on mesh vertices k with coefficient vectors coef (m,3)."""
            m = len(k)
            s = src[k]
            sy = np.where(mir[k], -1.0, 1.0)
            Cx = sp.csr_matrix((coef[:, 0] * w, (np.arange(m), s)), shape=(m, Jx.shape[0]))
            Cy = sp.csr_matrix((coef[:, 1] * sy * w, (np.arange(m), s)), shape=(m, Jx.shape[0]))
            Cz = sp.csr_matrix((coef[:, 2] * w, (np.arange(m), s)), shape=(m, Jx.shape[0]))
            blocks.append(Cx @ Jx + Cy @ Jy + Cz @ Jz)
            rhs.append(b * w)

        for vd in views:
            cam = vd.cam
            uv, Jp, z = proj_jac(cam, V)
            mpp = z / cam.f
            dist_outline, _ = render_outline_dist(V, F, cam)
            rim = rim_vertices(V, F, cam, ef)
            inimg = (uv[rim, 0] >= 0) & (uv[rim, 0] < cam.w - 1) & (uv[rim, 1] >= 0) & (uv[rim, 1] < cam.h - 1)
            rim = rim[inimg]
            u = np.round(uv[rim, 0]).astype(int)
            v = np.round(uv[rim, 1]).astype(int)
            on = (dist_outline[v, u] < 1.6) & (vd.bad_d[v, u] == 0)
            rim = rim[on]
            if vd.ctree is not None and len(rim):
                d, j = vd.ctree.query(uv[rim], distance_upper_bound=max_match_px)
                ok = np.isfinite(d)
                ri, jj = rim[ok], j[ok]
                nq = vd.cnrm[jj]
                res = ((vd.cpts[jj] - uv[ri]) * nq).sum(1) * mpp[ri]
                coef = (nq[:, :, None] * Jp[ri]).sum(1) * mpp[ri, None]
                add(ri, coef, res, np.ones(len(ri)) * 20 / np.sqrt(max(len(ri), 1)))
                e1 = res
                rt = cKDTree(uv[rim])
                sub, subn = vd.cpts[::3], vd.cnrm[::3]
                d2, k2 = rt.query(sub, distance_upper_bound=max_match_px)
                ok2 = np.isfinite(d2)
                ri2 = rim[k2[ok2]]
                res2 = ((sub[ok2] - uv[ri2]) * subn[ok2]).sum(1) * mpp[ri2]
                coef2 = (subn[ok2][:, :, None] * Jp[ri2]).sum(1) * mpp[ri2, None]
                add(ri2, coef2, res2, np.ones(len(ri2)) * 20 / np.sqrt(max(len(ri2), 1)))
                stats[vd.name] = (len(ri), float(np.sqrt(np.mean(e1 ** 2))) if len(e1) else 0.0,
                                  float(np.sqrt(np.mean(res2 ** 2))) if len(res2) else 0.0)
            uu = np.round(uv[:, 0]).astype(int)
            vv = np.round(uv[:, 1]).astype(int)
            inside = (uu >= 0) & (uu < cam.w) & (vv >= 0) & (vv < cam.h)
            idx = np.nonzero(inside)[0]
            o = idx[vd.dt_out[vv[idx], uu[idx]] > 0.75]
            if len(o):
                g = np.stack([vd.ogx[vv[o], uu[o]], vd.ogy[vv[o], uu[o]]], 1)
                g /= np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-9)
                coef = (g[:, :, None] * Jp[o]).sum(1) * mpp[o, None]
                add(o, coef, -vd.dt_out[vv[o], uu[o]] * mpp[o], w_out * np.ones(len(o)) * 20 / np.sqrt(max(len(o), 1)))
        if curves is not None:
            # 3-D curve points that must lie on the surface: point-to-plane on the nearest vertex.
            from fit import vertex_normals
            vn = vertex_normals(V, F)
            d, k = cKDTree(V).query(curves)
            pn = ((curves - V[k]) * vn[k]).sum(1)
            ok = d < 60
            add(k[ok], vn[k[ok]], pn[ok], w_curve * np.ones(ok.sum()) * 20 / np.sqrt(max(ok.sum(), 1)))
            stats['curves'] = (int(ok.sum()), float(np.sqrt(np.mean(pn[ok] ** 2))), 0.0)
        A = sp.vstack(blocks).tocsr()
        b = np.concatenate(rhs)
        M = A.T @ A + ws[it] * (R.T @ R) + w_fair * sp.eye(len(q)) * 0 + 1e-6 * sp.eye(len(q))
        g = A.T @ b - ws[it] * (R.T @ (R @ q - Rq_t))
        dq = spla.spsolve(M.tocsc(), g)
        q = q + dq
        sil = [s for k_, s in stats.items() if k_ != 'curves']
        log(f"iter {it:2d} w_shape {ws[it]:.3f}: step max {np.abs(dq).max():6.1f} mm; outline rms per view (mm): "
            f"median {np.median([s[1] for s in sil]):.2f} / {np.median([s[2] for s in sil]):.2f}, "
            f"worst {max(s[1] for s in sil):.2f} / {max(s[2] for s in sil):.2f}"
            + (f"; curves {stats['curves'][1]:.2f} mm" if 'curves' in stats else ''))
        if callback:
            callback(it, S.unpack(q), stats)
    return S.unpack(q), stats
