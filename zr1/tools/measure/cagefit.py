"""Fitting the subdivision cage to every calibrated view.

Parameters are the right-hand half of the cage (cage.Cage.param_matrix);
the surface is its Catmull-Clark subdivision at a fixed level, a linear
function of the cage (subd.subdivide). Each Gauss-Newton step linearises:

  silhouettes  for every surface vertex on its projected outline in a view,
               the observed outline's signed distance at its projection
               (pixels, + outside the car) times millimetres per pixel at
               its depth; every vertex projecting onto background gets the
               same residual. Wheels, wing, mirrors, splitter, dive planes
               and opaque-black pixels carry none (fit.ViewData);
  points       3-D points known to lie on the skin (multi-view edge points,
               stripe edges): point-to-plane to the nearest surface vertex,
               Huber-weighted, ignored beyond `pt_cut` mm (they belong to a
               hollow or a part the skin does not carry);
  curves       named 3-D curves pinned to named cage columns (creases):
               the column's subdivided curve must pass through them;
  fairness     the cage's second differences along loops and along
               columns stay close to the template's, shrinking over the
               iterations; loop vertices are held softly to their station
               planes so loops do not slide along the car.

Levenberg-Marquardt damping and a step cap keep the active outline set
from jumping between iterations.
"""

from __future__ import annotations

import numpy as np
import cv2
import scipy.sparse as sp
import scipy.sparse.linalg as spla
from scipy.spatial import cKDTree

from fit import proj_jac, render_outline_dist, rim_vertices, edge_face_map, vertex_normals
from subd import subdivide, triangles


def sample(img, uv):
    m = cv2.remap(img, uv[:, 0].astype(np.float32).reshape(1, -1), uv[:, 1].astype(np.float32).reshape(1, -1),
                  cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    return m.ravel()


_PAINT = {}


def paint_mask(vd, erode=1):
    """The view's paint mask (paint.shading), eroded; painted pixels are always body."""
    if vd.name not in _PAINT:
        import paint
        _, pm, _ = paint.shading(vd.name)
        _PAINT[vd.name] = cv2.erode(pm.astype(np.uint8), np.ones((2 * erode + 1, 2 * erode + 1), np.uint8)) > 0
    return _PAINT[vd.name]


def coverage(X, F, cam):
    img = np.zeros((cam.h, cam.w), np.uint8)
    cv2.fillPoly(img, list(np.round(cam.project(X)[F] * 4).astype(np.int32)), 1, shift=2)
    return cv2.morphologyEx(img, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))


def coord_blocks(S, n):
    """(nf x 3n) matrices picking coordinate c of every fine vertex out of the flat cage vector."""
    S = S.tocoo()
    out = []
    for c in range(3):
        out.append(sp.csr_matrix((S.data, (S.row, 3 * S.col + c)), shape=(S.shape[0], 3 * n)))
    return out


def second_diffs(C):
    """Second differences of the cage along every loop (cyclic) and along every column."""
    rows, cols, vals = [], [], []
    r = 0
    for i in range(C.NV):
        L = C.loop(i)
        for k in range(C.R):
            a, b, c = L[k - 1], L[k], L[(k + 1) % C.R]
            for d in range(3):
                rows += [r, r, r]; cols += [3 * a + d, 3 * b + d, 3 * c + d]; vals += [1, -2, 1]
                r += 1
    for k in range(C.R):
        col = np.array([C.ids[('L', i, k)] for i in range(C.NV)])
        for i in range(1, C.NV - 1):
            a, b, c = col[i - 1], col[i], col[i + 1]
            for d in range(3):
                rows += [r, r, r]; cols += [3 * a + d, 3 * b + d, 3 * c + d]; vals += [1, -2, 1]
                r += 1
    # cap grids: second differences along u and v
    for cap, i in (('F', 0), ('B', C.NV - 1)):
        def gid(u, v):
            if 0 < u < C.a and 0 < v < C.b:
                return C.ids[(cap, u, v)]
            return C.ids[('L', i, C.ring_index(u, v))]
        for u in range(1, C.a):
            for v in range(0, C.b + 1):
                for d in range(3):
                    rows += [r, r, r]; cols += [3 * gid(u - 1, v) + d, 3 * gid(u, v) + d, 3 * gid(u + 1, v) + d]; vals += [1, -2, 1]
                    r += 1
        for u in range(0, C.a + 1):
            for v in range(1, C.b):
                for d in range(3):
                    rows += [r, r, r]; cols += [3 * gid(u, v - 1) + d, 3 * gid(u, v) + d, 3 * gid(u, v + 1) + d]; vals += [1, -2, 1]
                    r += 1
    return sp.csr_matrix((vals, (rows, cols)), shape=(r, 3 * C.n))


def cage_normals(C, V):
    n = np.zeros_like(V)
    for q in C.Q:
        a, b, c, d = V[q]
        fn = np.cross(c - a, d - b)
        n[q] += fn
    return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)


def normal_param_matrix(C, V):
    """U (3n x p) for normal-only motion: every right-half and centreline
    cage vertex moves along its own normal (one parameter each), the left
    half mirrors it."""
    right, centre = C.halves()
    mir = C.mirror_of()
    N = cage_normals(C, V)
    N[centre, 1] = 0.0
    N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-12)
    col = {}
    for i in range(C.n):
        if right[i] or centre[i]:
            col[i] = len(col)
    rows, cols, vals = [], [], []
    for i in range(C.n):
        j = i if (right[i] or centre[i]) else mir[i]
        nn = N[j] * (np.array([1.0, -1.0, 1.0]) if j != i else 1.0)
        for d in range(3):
            rows.append(3 * i + d); cols.append(col[j]); vals.append(nn[d])
    return sp.csr_matrix((vals, (rows, cols)), shape=(3 * C.n, len(col)))


class CageFit:
    def __init__(self, C, V0, level=2, sharp=None, corners=None, normal_only=False):
        self.C, self.level = C, level
        self.normal_only = normal_only
        self.D2 = second_diffs(C)
        self.set_creases(sharp, corners)
        self.rebase(np.asarray(V0, float))

    def rebase(self, V):
        """(Re)linearise around cage V: for normal-only motion the
        parameters become offsets along V's normals, zero at V."""
        C = self.C
        if self.normal_only:
            self.base = V.reshape(-1).copy()
            self.U = normal_param_matrix(C, V)
            self.q = np.zeros(self.U.shape[1])
        else:
            self.base = np.zeros(3 * C.n)
            self.U, _ = C.param_matrix()
            self.q = C.pack(V)
        self.q_t = self.q.copy()
        Bx, By, Bz = coord_blocks(self.S, C.n)
        self.J = [(B @ self.U).tocsr() for B in (Bx, By, Bz)]
        self.R = (self.D2 @ self.U).tocsr()
        # station-plane hold on loop vertices (x only)
        rows, cols = [], []
        for k, i in C.ids.items():
            if k[0] == 'L':
                rows.append(len(rows)); cols.append(3 * i)
        Hfull = sp.csr_matrix((np.ones(len(rows)), (np.arange(len(rows)), cols)), shape=(len(rows), 3 * C.n))
        self.Hx = (Hfull @ self.U).tocsr()
        self.x_t = self.Hx @ self.q

    def set_creases(self, sharp=None, corners=None):
        C = self.C
        self.sharp, self.corners = sharp, corners
        self.Qf, S, _ = subdivide(C.Q, C.n, self.level, sharp, corners)
        self.F = triangles(self.Qf)
        self.S = S
        self.ef = edge_face_map(self.F)
        if hasattr(self, 'U'):
            self.rebase(self.cage())

    def cage(self, q=None):
        return (self.base + self.U @ (self.q if q is None else q)).reshape(-1, 3)

    def surface(self, q=None):
        return self.S @ self.cage(q)

    def run(self, views, iters=20, lam=(1.0, 0.05), w_rim=1.0, w_out=0.5, points=None, w_pt=0.5,
            pt_cut=30.0, curves=(), w_curve=1.0, w_station=0.02, w_anchor=1e-3, damping=0.3, max_step=30.0,
            view_weight=None, log=print, callback=None, w_cov=1.0):
        lams = np.geomspace(lam[0], lam[1], iters)
        Jx, Jy, Jz = self.J
        for it in range(iters):
            X = self.surface()
            blocks, rhs = [], []
            stats = {}

            def add(k, coef, b, w):
                m = len(k)
                if m == 0:
                    return
                W = sp.diags(w)
                blk = sp.diags(coef[:, 0]) @ Jx[k] + sp.diags(coef[:, 1]) @ Jy[k] + sp.diags(coef[:, 2]) @ Jz[k]
                blocks.append(W @ blk)
                rhs.append(b * w)

            for vd in views:
                cam = vd.cam
                vw = 1.0 if view_weight is None else view_weight.get(vd.name, 1.0)
                uv, Jp, z = proj_jac(cam, X)
                mpp = z / cam.f
                inimg = (uv[:, 0] > 1) & (uv[:, 0] < cam.w - 2) & (uv[:, 1] > 1) & (uv[:, 1] < cam.h - 2)
                dist_outline, _ = render_outline_dist(X, self.F, cam)
                rim = rim_vertices(X, self.F, cam, self.ef)
                rim = rim[inimg[rim]]
                u = np.round(uv[rim, 0]).astype(int)
                v = np.round(uv[rim, 1]).astype(int)
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
                add(rim, coef, -sd * mpp[rim], np.full(len(rim), vw * w_rim * 20 / np.sqrt(max(len(rim), 1))))
                idx = np.nonzero(inimg)[0]
                uu = np.round(uv[idx, 0]).astype(int)
                vv = np.round(uv[idx, 1]).astype(int)
                o = idx[(vd.sdf[vv, uu] > 0.75) & (vd.bad_d[vv, uu] == 0)]
                if len(o):
                    so = sample(vd.sdf, uv[o])
                    go = np.stack([sample(vd.sgx, uv[o]), sample(vd.sgy, uv[o])], 1)
                    co = (go[:, :, None] * Jp[o]).sum(1) * mpp[o, None]
                    add(o, co, -so * mpp[o], np.full(len(o), vw * w_out * 20 / np.sqrt(max(len(o), 1))))
                ncov = 0
                if w_cov > 0:
                    pm = paint_mask(vd)
                    cov = coverage(X, self.F, cam)
                    U = pm & (cov == 0) & (vd.bad_d == 0)
                    ys, xs = np.nonzero(U)
                    rim_all = rim_vertices(X, self.F, cam, self.ef)
                    rim_all = rim_all[inimg[rim_all]]
                    ua = np.round(uv[rim_all, 0]).astype(int); va = np.round(uv[rim_all, 1]).astype(int)
                    rim_all = rim_all[dist_outline[va, ua] < 1.6]
                    if len(ys) and len(rim_all):
                        sel = np.arange(0, len(ys), max(1, len(ys) // 4000))
                        P2 = np.stack([xs[sel], ys[sel]], 1).astype(float) + 0.5
                        dd, kk = cKDTree(uv[rim_all]).query(P2, distance_upper_bound=80)
                        okc = np.isfinite(dd)
                        r_ = rim_all[kk[okc]]
                        vn_ = vertex_normals(X, self.F)[r_]
                        g2 = np.einsum('nij,nj->ni', Jp[r_], vn_)
                        g2 /= np.maximum(np.linalg.norm(g2, axis=1, keepdims=True), 1e-9)
                        res = ((P2[okc] - uv[r_]) * g2).sum(1)
                        pos = res > 0.5
                        r_, g2, res = r_[pos], g2[pos], res[pos]
                        if len(r_):
                            co = (g2[:, :, None] * Jp[r_]).sum(1) * mpp[r_, None]
                            add(r_, co, res * mpp[r_], np.full(len(r_), vw * w_cov * 20 / np.sqrt(max(len(r_), 1))))
                        ncov = int(U.sum())
                stats[vd.name] = (len(rim), float(np.sqrt(np.mean((sd * mpp[rim]) ** 2))) if len(rim) else 0.0, len(o), ncov)
            if points is not None and len(points):
                vn = vertex_normals(X, self.F)
                d, k = cKDTree(X).query(points)
                pn = ((points - X[k]) * vn[k]).sum(1)
                ok = (d < 2 * pt_cut) & (np.abs(pn) < pt_cut)
                k, pn = k[ok], pn[ok]
                hub = np.sqrt(np.where(np.abs(pn) < 3, 1.0, 3 / np.maximum(np.abs(pn), 1e-9)))
                add(k, vn[k], pn, w_pt * hub * 20 / np.sqrt(max(len(k), 1)))
                stats['points'] = (len(k), float(np.sqrt(np.mean(pn ** 2))) if len(k) else 0.0, int((~ok).sum()))
            for name, rows_k, target, w in curves:
                # rows_k: fine-vertex indices along a column; target: (len(rows_k),3) points to pass through
                res = target - X[rows_k]
                for c in range(3):
                    e = np.zeros((len(rows_k), 3)); e[:, c] = 1
                    add(rows_k, e, res[:, c], np.full(len(rows_k), w_curve * w * 20 / np.sqrt(len(rows_k))))
                stats['curve:' + name] = (len(rows_k), float(np.sqrt(np.mean((res ** 2).sum(1)))), 0)
            A = sp.vstack(blocks).tocsr()
            b = np.concatenate(rhs)
            M = A.T @ A + lams[it] * (self.R.T @ self.R) + w_station * (self.Hx.T @ self.Hx) + w_anchor * sp.identity(len(self.q))
            dg = M.diagonal()
            M = M + damping * sp.diags(dg + 1e-3 * dg.mean())
            gvec = (A.T @ b - lams[it] * (self.R.T @ (self.R @ (self.q - self.q_t)))
                    - w_station * (self.Hx.T @ (self.Hx @ self.q - self.x_t)) - w_anchor * (self.q - self.q_t))
            dq = spla.spsolve(M.tocsc(), gvec)
            mx = np.abs(dq).max()
            dq = np.clip(dq, -max_step, max_step)
            self.q = self.q + dq
            sil = [s for k_, s in stats.items() if not str(k_).startswith(('points', 'curve:'))]
            extra = ''.join(f"; {k_} {s[1]:.2f}mm/{s[0]}" for k_, s in stats.items() if str(k_).startswith(('points', 'curve:')))
            log(f"iter {it:2d} lam {lams[it]:.3f}: step {mx:5.1f}; outline rms median {np.median([s[1] for s in sil]):.2f} "
                f"worst {max(s[1] for s in sil):.2f} mm; outside {sum(s[2] for s in sil)}; uncovered paint px {sum(s[3] for s in sil)}{extra}")
            if callback:
                callback(it, self, stats)
        return stats
