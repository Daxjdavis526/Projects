"""Fitting the station-sectioned B-spline body to every calibrated view.

Correspondence-free silhouettes: for every vertex on the mesh's projected
outline (in a view), the residual is the observed outline's signed distance
at its projection (pixels, + outside the car), converted to millimetres at
the vertex's depth; any vertex projecting outside the car gets the same
residual. Ambiguous pixels (wheels, wing, mirrors, splitter, dive planes,
opaque-black renders) carry no residual. Control points move only within
their station planes; fairness keeps the control net's second differences
close to the template's.
"""

from __future__ import annotations

import numpy as np
import cv2
import scipy.sparse as sp
import scipy.sparse.linalg as spla
from scipy.spatial import cKDTree

from bsurf import Surface
from fit import proj_jac, render_outline_dist, rim_vertices, edge_face_map, vertex_normals
from bsfit import second_diff


def unpack_matrix(S: Surface):
    n = S.nv * S.nu
    rows, cols = [], []
    for k in range(n):
        rows.append(3 * k + 2)
        cols.append(k)
    for m, k in enumerate(np.nonzero(S.free_y)[0]):
        rows.append(3 * k + 1)
        cols.append(n + m)
    return sp.csr_matrix((np.ones(len(rows)), (rows, cols)), shape=(3 * n, S.n_params()))


def sample(img, uv):
    m = cv2.remap(img, uv[:, 0].astype(np.float32).reshape(1, -1), uv[:, 1].astype(np.float32).reshape(1, -1),
                  cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    return m.ravel()


def fit(S: Surface, P0, views, iters=20, lam=(1.0, 0.1), w_rim=1.0, w_out=0.5, curves=None,
        w_curve=1.0, log=print, callback=None, P_template=None, view_weight=None, damping=0.3,
        max_step=40.0):
    U = unpack_matrix(S)
    R = (second_diff(S.nv, S.nu) @ U).tocsr()
    q = S.pack(P0)
    q_t = S.pack(P_template if P_template is not None else P0)
    Jx, Jy, Jz = S.jacobian_blocks()
    V, F, src, mir = S.mesh(P0)
    ef = edge_face_map(F)
    lams = np.geomspace(lam[0], lam[1], iters)
    for it in range(iters):
        P = S.unpack(q)
        V, _, _, _ = S.mesh(P)
        blocks, rhs = [], []
        stats = {}

        def add(k, coef, b, w):
            m = len(k)
            s = src[k]
            sy = np.where(mir[k], -1.0, 1.0)
            ar = np.arange(m)
            Cy = sp.csr_matrix((coef[:, 1] * sy * w, (ar, s)), shape=(m, Jy.shape[0]))
            Cz = sp.csr_matrix((coef[:, 2] * w, (ar, s)), shape=(m, Jz.shape[0]))
            blocks.append(Cy @ Jy + Cz @ Jz)
            rhs.append(b * w)

        for vd in views:
            cam = vd.cam
            vw = 1.0 if view_weight is None else view_weight.get(vd.name, 1.0)
            uv, Jp, z = proj_jac(cam, V)
            mpp = z / cam.f
            inimg = (uv[:, 0] > 1) & (uv[:, 0] < cam.w - 2) & (uv[:, 1] > 1) & (uv[:, 1] < cam.h - 2)
            dist_outline, _ = render_outline_dist(V, F, cam)
            rim = rim_vertices(V, F, cam, ef)
            rim = rim[inimg[rim]]
            u = np.round(uv[rim, 0]).astype(int)
            v = np.round(uv[rim, 1]).astype(int)
            rim = rim[(dist_outline[v, u] < 1.6) & (vd.bad_d[v, u] == 0)]
            sd = sample(vd.sdf, uv[rim])
            g = np.stack([sample(vd.sgx, uv[rim]), sample(vd.sgy, uv[rim])], 1)
            coef = (g[:, :, None] * Jp[rim]).sum(1)
            # residual: sdf (px) -> we want sdf + grad.J d = 0
            w = vw * w_rim * 20 / np.sqrt(max(len(rim), 1))
            add(rim, coef * mpp[rim, None], -sd * mpp[rim], np.full(len(rim), w))
            # inside: every vertex projecting outside the car, off the bad regions
            idx = np.nonzero(inimg)[0]
            uu = np.round(uv[idx, 0]).astype(int)
            vv = np.round(uv[idx, 1]).astype(int)
            o = idx[(vd.sdf[vv, uu] > 0.75) & (vd.bad_d[vv, uu] == 0)]
            if len(o):
                so = sample(vd.sdf, uv[o])
                go = np.stack([sample(vd.sgx, uv[o]), sample(vd.sgy, uv[o])], 1)
                co = (go[:, :, None] * Jp[o]).sum(1)
                add(o, co * mpp[o, None], -so * mpp[o], np.full(len(o), vw * w_out * 20 / np.sqrt(max(len(o), 1))))
            stats[vd.name] = (len(rim), float(np.sqrt(np.mean((sd * mpp[rim]) ** 2))) if len(rim) else 0.0,
                              len(o))
        if curves is not None:
            vn = vertex_normals(V, F)
            d, k = cKDTree(V).query(curves)
            pn = ((curves - V[k]) * vn[k]).sum(1)
            ok = d < 80
            add(k[ok], vn[k[ok]], pn[ok], np.full(ok.sum(), w_curve * 20 / np.sqrt(max(ok.sum(), 1))))
            stats['curves'] = (int(ok.sum()), float(np.sqrt(np.mean(pn[ok] ** 2))), 0)
        A = sp.vstack(blocks).tocsr()
        b = np.concatenate(rhs)
        M = A.T @ A + lams[it] * (R.T @ R)
        # Levenberg-Marquardt damping on the diagonal, and a step cap: the
        # outline set changes with the shape, so long steps overshoot.
        M = M + damping * sp.diags(M.diagonal() + 1e-3)
        gvec = A.T @ b - lams[it] * (R.T @ (R @ (q - q_t)))
        dq = spla.spsolve(M.tocsc(), gvec)
        mx = np.abs(dq).max()
        if mx > max_step:
            dq *= max_step / mx
        q = q + dq
        sil = [s for k_, s in stats.items() if k_ != 'curves']
        log(f"iter {it:2d} lam {lams[it]:.3f}: step max {np.abs(dq).max():6.1f} mm; outline rms (mm) median "
            f"{np.median([s[1] for s in sil]):.2f} worst {max(s[1] for s in sil):.2f}; outside verts "
            f"{sum(s[2] for s in sil)}" + (f"; curves {stats['curves'][1]:.2f}" if 'curves' in stats else ''))
        if callback:
            callback(it, S.unpack(q), stats)
    return S.unpack(q), stats
