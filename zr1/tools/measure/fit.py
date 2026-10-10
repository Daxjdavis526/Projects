"""Fitting the body surface to every calibrated view.

A closed template mesh is deformed, iteration by iteration, to minimise:

  silhouettes — in every view, the mesh's occluding contour must lie on the
                car's observed outline wherever that outline belongs to the
                body (wheels, wing, mirrors, splitter and dive planes are
                excluded by projected 3-D exclusion zones; ambiguous pixels
                are excluded too); both directions are matched, so the
                contour can neither fall short of the outline nor overshoot;
  inside      — no vertex may project onto background in any view;
  lines       — 3-D points on the car's lines (multi-view edge points) must
                lie on the surface (point-to-plane, robust);
  smoothness  — the displacement is smooth (graph Laplacian), so the
                template's own shape fills in where no data reaches;
  symmetry    — left and right halves are kept mirror images.

Image-space residuals are converted to millimetres at the vertex's depth,
so a coarse spin frame and a sharp render are weighed in the same units.
"""

from __future__ import annotations

import numpy as np
import cv2
import scipy.sparse as sp
import scipy.sparse.linalg as spla
from scipy.spatial import cKDTree

from camera import Camera


class ViewData:
    def __init__(self, name, cam: Camera, car, unk, excl):
        self.name, self.cam = name, cam
        self.car = car.astype(np.uint8)
        self.bad = ((unk > 0) | (excl > 0)).astype(np.uint8)
        bad_d = cv2.dilate(self.bad, np.ones((7, 7), np.uint8))
        # Observed outline pixels (all boundaries: outer and holes) with outward normals.
        cs, _ = cv2.findContours(self.car, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
        pts = np.concatenate([c.reshape(-1, 2) for c in cs]).astype(float) if cs else np.zeros((0, 2))
        dt_in = cv2.distanceTransform(self.car, cv2.DIST_L2, 5)
        g = cv2.GaussianBlur(dt_in, (0, 0), 2.0)
        gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
        u, v = pts[:, 0].astype(int), pts[:, 1].astype(int)
        n = -np.stack([gx[v, u], gy[v, u]], 1)          # outward = down the inside distance
        nn = np.linalg.norm(n, axis=1)
        ok = (nn > 1e-6) & (bad_d[v, u] == 0)
        self.cpts = pts[ok]
        self.cnrm = n[ok] / nn[ok, None]
        self.ctree = cKDTree(self.cpts) if len(self.cpts) else None
        # Background distance (outside penalty): distance to the car, and its gradient.
        bg = ((self.car == 0) & (self.bad == 0)).astype(np.uint8)
        self.dt_out = cv2.distanceTransform(bg, cv2.DIST_L2, 5)
        g2 = cv2.GaussianBlur(self.dt_out, (0, 0), 1.5)
        self.ogx = cv2.Sobel(g2, cv2.CV_32F, 1, 0, ksize=3)
        self.ogy = cv2.Sobel(g2, cv2.CV_32F, 0, 1, ksize=3)
        self.bad_d = bad_d
        self.h, self.w = self.car.shape
        # Signed distance to the observed outline (pixels; + outside the car).
        dt_in2 = cv2.distanceTransform(self.car, cv2.DIST_L2, 5)
        dt_out2 = cv2.distanceTransform(1 - self.car, cv2.DIST_L2, 5)
        self.sdf = (dt_out2 - dt_in2).astype(np.float32)
        gs = cv2.GaussianBlur(self.sdf, (0, 0), 1.0)
        self.sgx = cv2.Sobel(gs, cv2.CV_32F, 1, 0, ksize=3) / 8.0
        self.sgy = cv2.Sobel(gs, cv2.CV_32F, 0, 1, ksize=3) / 8.0


def proj_jac(cam: Camera, X):
    R = cam.R
    Xc = X @ R.T + np.asarray(cam.tvec, float)
    z = Xc[:, 2]
    uv = np.stack([cam.f * Xc[:, 0] / z + cam.cx, cam.f * Xc[:, 1] / z + cam.cy], 1)
    J = np.zeros((len(X), 2, 3))
    J[:, 0] = cam.f * (R[0][None] / z[:, None] - Xc[:, 0:1] * R[2][None] / z[:, None] ** 2)
    J[:, 1] = cam.f * (R[1][None] / z[:, None] - Xc[:, 1:2] * R[2][None] / z[:, None] ** 2)
    return uv, J, z


def laplacian(n, F):
    E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    E = np.unique(np.sort(E, 1), axis=0)
    A = sp.coo_matrix((np.ones(len(E)), (E[:, 0], E[:, 1])), shape=(n, n))
    A = (A + A.T).tocsr()
    A.data[:] = 1.0
    deg = np.asarray(A.sum(1)).ravel()
    return sp.diags(deg) - A, E


def face_normals(V, F):
    n = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)


def vertex_normals(V, F):
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    vn = np.zeros_like(V)
    for k in range(3):
        np.add.at(vn, F[:, k], fn)
    return vn / np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-12)


def rim_vertices(V, F, cam: Camera, edges_faces):
    """Vertices on edges between a front- and a back-facing face."""
    fn = face_normals(V, F)
    fc = V[F].mean(1)
    facing = ((cam.centre[None] - fc) * fn).sum(1) > 0
    e, f0, f1 = edges_faces
    rim = facing[f0] != facing[f1]
    return np.unique(e[rim].ravel())


def edge_face_map(F):
    E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    fid = np.tile(np.arange(len(F)), 3)
    key = np.sort(E, 1)
    order = np.lexsort((key[:, 1], key[:, 0]))
    key, fid = key[order], fid[order]
    same = np.all(key[1:] == key[:-1], axis=1)
    i = np.nonzero(same)[0]
    return key[i], fid[i], fid[i + 1]


def render_outline_dist(V, F, cam: Camera):
    uv = cam.project(V)
    img = np.zeros((cam.h, cam.w), np.uint8)
    cv2.fillPoly(img, list(np.round(uv[F] * 4).astype(np.int32)), 1, shift=2)
    img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
    edge = img - cv2.erode(img, np.ones((3, 3), np.uint8))
    return cv2.distanceTransform((edge == 0).astype(np.uint8), cv2.DIST_L2, 3), uv


def fit(V0, F, views: list[ViewData], edge_pts=None, iters=20, lam=(4.0, 0.6), w_sil=1.0,
        w_out=1.0, w_edge=0.5, mirror=None, max_match_px=40, log=print, callback=None):
    V = V0.copy()
    n = len(V)
    L, _ = laplacian(n, F)
    L3 = sp.kron(L, sp.eye(3)).tocsr()
    ef = edge_face_map(F)
    lams = np.geomspace(lam[0], lam[1], iters)
    for it in range(iters):
        rows, cols, vals, rhs = [], [], [], []
        r0 = 0
        stats = {}

        def add(vidx, coef, b, w):
            """Rows: sum_k coef[k] . d[vidx[k]] = b   (coef (m,K,3), vidx (m,K))"""
            nonlocal r0
            m, K = vidx.shape
            rr = np.repeat(np.arange(r0, r0 + m), K * 3)
            cc = (3 * vidx[:, :, None] + np.arange(3)[None, None]).reshape(-1)
            rows.append(rr)
            cols.append(cc)
            vals.append((coef * w[:, None, None]).reshape(-1))
            rhs.append(b * w)
            r0 += m

        for vd in views:
            cam = vd.cam
            uv, Jp, z = proj_jac(cam, V)
            mpp = z / cam.f                                   # mm per pixel at each vertex
            dist_outline, _ = render_outline_dist(V, F, cam)
            rim = rim_vertices(V, F, cam, ef)
            u = np.clip(np.round(uv[rim, 0]).astype(int), 0, cam.w - 1)
            v = np.clip(np.round(uv[rim, 1]).astype(int), 0, cam.h - 1)
            inimg = (uv[rim, 0] >= 0) & (uv[rim, 0] < cam.w) & (uv[rim, 1] >= 0) & (uv[rim, 1] < cam.h)
            on = inimg & (dist_outline[v, u] < 1.6) & (vd.bad_d[v, u] == 0)
            rim = rim[on]
            if vd.ctree is not None and len(rim):
                # model -> observation
                d, j = vd.ctree.query(uv[rim], distance_upper_bound=max_match_px)
                ok = np.isfinite(d)
                ri, jj = rim[ok], j[ok]
                q, nq = vd.cpts[jj], vd.cnrm[jj]
                res = ((q - uv[ri]) * nq).sum(1)
                coef = (nq[:, :, None] * Jp[ri]).sum(1)[:, None, :]
                w = w_sil * np.ones(len(ri)) / np.sqrt(max(len(ri), 1)) * np.sqrt(400)
                add(ri[:, None], coef * mpp[ri, None, None], res * mpp[ri], w)
                e1 = np.abs(res * mpp[ri])
                # observation -> model (subsampled outline)
                rt = cKDTree(uv[rim])
                sub = vd.cpts[::3]
                subn = vd.cnrm[::3]
                d2, k2 = rt.query(sub, distance_upper_bound=max_match_px)
                ok2 = np.isfinite(d2)
                ri2 = rim[k2[ok2]]
                q2, n2 = sub[ok2], subn[ok2]
                res2 = ((q2 - uv[ri2]) * n2).sum(1)
                coef2 = (n2[:, :, None] * Jp[ri2]).sum(1)[:, None, :]
                w2 = w_sil * np.ones(len(ri2)) / np.sqrt(max(len(ri2), 1)) * np.sqrt(400)
                add(ri2[:, None], coef2 * mpp[ri2, None, None], res2 * mpp[ri2], w2)
                stats[vd.name] = (len(ri), float(np.sqrt(np.mean(e1 ** 2))) if len(e1) else 0.0,
                                  int((~ok2).sum()))
            # inside: vertices on background
            uu = np.round(uv[:, 0]).astype(int)
            vv = np.round(uv[:, 1]).astype(int)
            inside = (uu >= 0) & (uu < cam.w) & (vv >= 0) & (vv < cam.h)
            idx = np.nonzero(inside)[0]
            dout = vd.dt_out[vv[idx], uu[idx]]
            o = idx[dout > 0.75]
            if len(o):
                g = np.stack([vd.ogx[vv[o], uu[o]], vd.ogy[vv[o], uu[o]]], 1)
                gn = np.linalg.norm(g, axis=1, keepdims=True)
                g = g / np.maximum(gn, 1e-9)
                # moving along -g reduces the distance: g . (J d) = -dout
                coef = (g[:, :, None] * Jp[o]).sum(1)[:, None, :]
                add(o[:, None], coef * mpp[o, None, None], -vd.dt_out[vv[o], uu[o]] * mpp[o],
                    w_out * np.ones(len(o)) / np.sqrt(max(len(o), 1)) * np.sqrt(400))
        # line points: point-to-plane on the nearest vertex
        if edge_pts is not None and len(edge_pts):
            vn = vertex_normals(V, F)
            t = cKDTree(V)
            d, j = t.query(edge_pts)
            off = edge_pts - V[j]
            pn = (off * vn[j]).sum(1)
            ok = (d < 45) & (np.abs(pn) < 35)
            jj, pnn = j[ok], pn[ok]
            hub = np.where(np.abs(pnn) < 4, 1.0, 4 / np.maximum(np.abs(pnn), 1e-9))  # Huber
            add(jj[:, None], vn[jj][:, None, :], pnn, w_edge * np.sqrt(hub) / np.sqrt(max(len(jj), 1)) * np.sqrt(2000))
            stats['lines'] = (int(ok.sum()), float(np.sqrt(np.mean(pnn ** 2))) if ok.any() else 0.0, 0)
        A = sp.csr_matrix((np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))),
                          shape=(r0, 3 * n))
        b = np.concatenate(rhs)
        M = (A.T @ A + lams[it] * (L3.T @ L3) + 1e-4 * sp.eye(3 * n)).tocsc()
        dvec = spla.spsolve(M, A.T @ b)
        D = dvec.reshape(-1, 3)
        if mirror is not None:
            Dm = D[mirror] * np.array([1, -1, 1])
            D = 0.5 * (D + Dm)
        V = V + D
        sil = [s for k, s in stats.items() if k != 'lines']
        log(f"iter {it:2d} lam {lams[it]:.2f}: move max {np.abs(D).max():6.1f} mean {np.linalg.norm(D, axis=1).mean():5.2f} mm; "
            f"silhouette rms (mm) median over views {np.median([s[1] for s in sil]):.2f}, worst {max(s[1] for s in sil):.2f}; "
            f"lines {stats.get('lines', (0, 0))[:2]}")
        if callback:
            callback(it, V, stats)
    return V, stats
