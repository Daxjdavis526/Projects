"""The first model's body warped onto the measured shape.

The first model's body (a loft of smooth sections drawn by eye,
`git show bede119:zr1/src/body.rs`; `zr1 preview` at that commit writes it
as out/body_loft.stl) has clean panels; the measured skin
has the right proportions but carries waves and lumps the car does not
have. Here the loft is carried by a smooth space warp, a cubic B-spline
lattice (free-form deformation, Sederberg & Parry 1986) whose control
displacements are fitted so the warped loft lies on the measured skin:
iterated closest points both ways (loft to skin and skin to loft), each
pulling a point onto the other's tangent plane (point-to-plane by
projected targets, so x, y and z share one matrix), with second
differences of the displacements across the lattice penalised. The lattice spacing decides what is measured and what
is the loft's: shape that varies slower than about twice the spacing
follows the measurement, anything finer keeps the loft's clean surface.
The warp is mirror-symmetric (the lattice is centred on y = 0 and the
displacements averaged with their mirror images).

usage: ffd_warp.py loft.stl measured.ply nx ny nz smooth out.ply
"""
import sys
import numpy as np, trimesh, scipy.sparse as sp, scipy.sparse.linalg as spla
from scipy.spatial import cKDTree

ITER = 40


def bspline_weights(s):
    """Uniform cubic B-spline weights at fraction s (n, 4)."""
    s2, s3 = s * s, s * s * s
    return np.stack([(1 - s) ** 3 / 6, (3 * s3 - 6 * s2 + 4) / 6, (-3 * s3 + 3 * s2 + 3 * s + 1) / 6, s3 / 6], 1)


class Lattice:
    def __init__(self, lo, hi, shape):
        self.lo, self.shape = np.asarray(lo, float), np.asarray(shape)
        self.h = (np.asarray(hi, float) - self.lo) / (self.shape - 3)
        self.nc = int(np.prod(self.shape))

    def matrix(self, P):
        u = (P - self.lo) / self.h
        k = np.clip(np.floor(u).astype(int), 0, self.shape - 4)
        w = [bspline_weights(u[:, a] - k[:, a]) for a in range(3)]
        rows, cols, vals = [], [], []
        n = len(P)
        nx, ny, nz = self.shape
        for a in range(4):
            for b in range(4):
                for c in range(4):
                    idx = ((k[:, 0] + a) * ny + (k[:, 1] + b)) * nz + (k[:, 2] + c)
                    rows.append(np.arange(n)); cols.append(idx); vals.append(w[0][:, a] * w[1][:, b] * w[2][:, c])
        return sp.csr_matrix((np.concatenate(vals), (np.concatenate(rows), np.concatenate(cols))), shape=(n, self.nc))

    def second_differences(self):
        nx, ny, nz = self.shape
        idx = np.arange(self.nc).reshape(nx, ny, nz)
        rows = []
        for a in range(3):
            sl = [slice(None)] * 3
            m = idx.shape[a]
            for i in range(1, m - 1):
                s0, s1, s2 = list(sl), list(sl), list(sl)
                s0[a], s1[a], s2[a] = i - 1, i, i + 1
                rows.append((idx[tuple(s0)].ravel(), idx[tuple(s1)].ravel(), idx[tuple(s2)].ravel()))
        r = np.concatenate([x[0] for x in rows]); c = np.concatenate([x[1] for x in rows]); d = np.concatenate([x[2] for x in rows])
        k = np.arange(len(r))
        return sp.csr_matrix((np.concatenate([np.ones(len(k)), -2 * np.ones(len(k)), np.ones(len(k))]),
                              (np.concatenate([k, k, k]), np.concatenate([r, c, d]))), shape=(len(k), self.nc))

    def mirror(self):
        nx, ny, nz = self.shape
        idx = np.arange(self.nc).reshape(nx, ny, nz)
        return idx[:, ::-1, :].ravel()


def main():
    loft = trimesh.load(sys.argv[1])
    meas = trimesh.load(sys.argv[2], process=False)
    shape = (int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]))
    smooth = float(sys.argv[6])
    P = np.asarray(loft.vertices, float)
    Pm = np.asarray(meas.vertices, float); Nm = np.asarray(meas.vertex_normals, float)
    allp = np.vstack([P, Pm])
    lo, hi = allp.min(0) - 60, allp.max(0) + 60
    w = max(-lo[1], hi[1]); lo[1], hi[1] = -w, w
    lat = Lattice(lo, hi, shape)
    W = lat.matrix(P)
    D2 = lat.second_differences()
    mir = lat.mirror()
    n = len(P)
    WtW = (W.T @ W).tocsr()
    reg = smooth * (D2.T @ D2) + 1e-6 * sp.identity(lat.nc)
    D = np.zeros((lat.nc, 3))
    tm = cKDTree(Pm)
    sb = n / len(Pm)           # the backward term counts each measured vertex; scale it to the loft's
    for it in range(ITER):
        X = P + W @ D
        # forward: each loft vertex to the tangent plane of its nearest skin vertex
        _, k = tm.query(X)
        n1, c1 = Nm[k], Pm[k]
        Tf = X + n1 * ((c1 - X) * n1).sum(1, keepdims=True)
        # backward: each skin vertex pulls its nearest loft vertex onto its tangent plane
        _, j = cKDTree(X).query(Pm)
        tb = X[j] + Nm * ((Pm - X[j]) * Nm).sum(1, keepdims=True)
        cnt = np.bincount(j, minlength=n).astype(float)
        sumb = np.stack([np.bincount(j, tb[:, a], minlength=n) for a in range(3)], 1)
        # minimise |X - Tf|^2 + sb sum_m |X_j(m) - tb_m|^2 + reg, X = P + W D
        M = WtW + sb * (W.T @ sp.diags(cnt) @ W) + reg
        rhs = W.T @ ((Tf - P) + sb * (sumb - cnt[:, None] * P))
        solve = spla.factorized(M.tocsc())
        D = np.stack([solve(rhs[:, a]) for a in range(3)], 1)
        D = 0.5 * (D + D[mir] * np.array([1.0, -1.0, 1.0]))
        if it % 5 == 4 or it == ITER - 1:
            X = P + W @ D
            df = np.abs(((X - c1) * n1).sum(1)); db = np.abs(((X[j] - Pm) * Nm).sum(1))
            print(f'iter {it + 1}: loft->measured 50/90/99 {np.percentile(df, 50):.1f}/{np.percentile(df, 90):.1f}/{np.percentile(df, 99):.1f}  '
                  f'measured->loft {np.percentile(db, 50):.1f}/{np.percentile(db, 90):.1f}/{np.percentile(db, 99):.1f} mm', flush=True)
    trimesh.Trimesh(P + W @ D, loft.faces, process=False).export(sys.argv[7])
    np.save(sys.argv[7] + '.lattice.npy', {'lo': lo, 'hi': hi, 'shape': shape, 'D': D}, allow_pickle=True)


if __name__ == '__main__':
    main()
