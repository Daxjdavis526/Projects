"""The measured shape on a coarse cage: fewer station loops and fewer
points per loop, fitted to the measured skin, so the panels are smooth by
construction (the first model was a loft of a few sections; this is the
same idea with the sections placed by the measurement).

A fairness weight on the full-resolution cage (cage_smooth.py) does not do
this: it either keeps the lumps or rounds the whole car into a blob,
because it penalises every wavelength alike. Fewer control points simply
cannot represent the short ones.

The coarse cage (NV stations, T and SIDE segments per run) starts from the
fitted cage's own loops, sampled, and is fitted by iterated closest points
(point-to-plane, both directions: coarse surface to measured skin and
measured skin to coarse surface) with a light bi-Laplacian on the net,
mirror-symmetric through the cage's own parameterisation. It is written
once subdivided, so it is a cage of the usual size and the Rust crate
subdivides it the usual three more times.

usage: coarse_cage.py cage.pkl target.ply NV T SIDE lam out.ply out_cage.pkl [pre]
  pre: subdivision steps applied before writing the cage (default 1;
  0 with the fitted cage's own NV, T, SIDE refits that cage as it is,
  e.g. to a clean target such as ffd_warp.py's warped loft)
"""
import sys, os, pickle, types
import numpy as np, trimesh, scipy.sparse as sp, scipy.sparse.linalg as spla
from scipy.spatial import cKDTree
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from cage import Cage
from subd import subdivide
from skinfit import triangles, mirror_map

ITER = 25
W_POINT = float(os.environ.get('W_POINT', 0.05))   # point-to-point share: keeps the net from sliding along the surface


def coarse_from(C, V, NV, T, SIDE):
    """A coarse cage whose vertices start on the fine cage's matching ones."""
    K = Cage(NV, T, SIDE)
    st = np.round(np.linspace(0, C.NV - 1, NV)).astype(int)

    def col(j):  # coarse right-hand column -> fine column
        if j <= T:
            return round(j * C.T / T)
        if j <= T + SIDE:
            return C.T + round((j - T) * C.SIDE / SIDE)
        return C.T + C.SIDE + round((j - T - SIDE) * C.T / T)

    X = np.zeros((K.n, 3))
    for k, i in K.ids.items():
        if k[0] == 'L':
            _, ic, r = k
            j = r if r < K.NU else K.R - r
            jf = col(j)
            rf = jf if r < K.NU else (C.R - jf) % C.R
            X[i] = V[C.ids[('L', st[ic], rf)]]
        else:
            cap, u, v = k
            uf, vf = round(u * C.a / K.a), round(v * C.b / K.b)
            X[i] = V[C.ids[(cap, uf, vf)]]
    return K, X


def main():
    C, Vf = pickle.load(open(sys.argv[1], 'rb'))[:2]
    meas = trimesh.load(sys.argv[2], process=False)
    NV, T, SIDE, lam = int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), float(sys.argv[6])
    Pm = np.asarray(meas.vertices, float)
    Nm = np.asarray(meas.vertex_normals, float)
    K, V0 = coarse_from(C, Vf, NV, T, SIDE)
    pre = int(sys.argv[9]) if len(sys.argv) > 9 else 1
    Q1, S1, _ = subdivide(K.Q, K.n, pre)
    Qf, S3, _ = subdivide(Q1, S1.shape[0], 3)
    S = sp.csr_matrix(S3 @ S1)
    U, _ = K.param_matrix()
    q = K.pack(V0)
    nf = S.shape[0]
    S3x = sp.kron(S, sp.identity(3), format='csr') @ U          # fine coords (3nf) = S3x q
    # bi-Laplacian on the coarse net
    Qc = np.asarray(K.Q)
    E = np.concatenate([Qc[:, [0, 1]], Qc[:, [1, 2]], Qc[:, [2, 3]], Qc[:, [3, 0]]])
    A = sp.coo_matrix((np.ones(len(E)), (E[:, 0], E[:, 1])), shape=(K.n, K.n)).tocsr()
    A = ((A + A.T) > 0).astype(float)
    L = sp.identity(K.n) - sp.diags(1.0 / np.asarray(A.sum(1)).ravel()) @ A
    L2x = sp.kron(L @ L, sp.identity(3), format='csr') @ U
    tm = cKDTree(Pm)
    Ff = triangles(np.asarray(Qf))
    for it in range(ITER):
        X = (S3x @ q).reshape(-1, 3)
        # forward: every fine vertex of the coarse surface to the measured skin
        _, k = tm.query(X)
        n1, c1 = Nm[k], Pm[k]
        # backward: every measured vertex to the coarse surface's nearest vertex
        _, j = cKDTree(X).query(Pm)
        rows_f = np.repeat(np.arange(nf), 3)
        cols_f = (3 * np.arange(nf)[:, None] + np.arange(3)).ravel()
        Nf = sp.csr_matrix((n1.ravel(), (rows_f, cols_f)), shape=(nf, 3 * nf))
        nb = len(Pm)
        rows_b = np.repeat(np.arange(nb), 3)
        cols_b = (3 * j[:, None] + np.arange(3)).ravel()
        Nb = sp.csr_matrix((Nm.ravel(), (rows_b, cols_b)), shape=(nb, 3 * nf))
        Af = Nf @ S3x
        Ab = Nb @ S3x
        bf = (n1 * c1).sum(1)
        bb = (Nm * Pm).sum(1)
        M = Af.T @ Af + Ab.T @ Ab + W_POINT * (S3x.T @ S3x) + lam * (L2x.T @ L2x)
        rhs = Af.T @ bf + Ab.T @ bb + W_POINT * (S3x.T @ c1.ravel())
        q = spla.spsolve(M.tocsc(), rhs)
        X = (S3x @ q).reshape(-1, 3)
        df = np.abs(((X - c1) * n1).sum(1))
        db = np.abs(((X[j] - Pm) * Nm).sum(1))
        if it % 5 == 4 or it == ITER - 1:
            print(f'iter {it + 1}: coarse->measured 50/90/99 {np.percentile(df, 50):.1f}/{np.percentile(df, 90):.1f}/{np.percentile(df, 99):.1f}  '
                  f'measured->coarse {np.percentile(db, 50):.1f}/{np.percentile(db, 90):.1f}/{np.percentile(db, 99):.1f} mm', flush=True)
    Vc = (U @ q).reshape(-1, 3)
    V1 = S1 @ Vc
    mir = mirror_map(np.round(V1, 6)) if pre else K.mirror_of()
    V1 = 0.5 * (V1 + V1[mir] * np.array([1.0, -1.0, 1.0]))
    X = S3 @ V1
    trimesh.Trimesh(X, Ff, process=False).export(sys.argv[7])
    # the once-subdivided coarse cage, in the shape export_cage.py reads
    C1 = K if pre == 0 else types.SimpleNamespace(NV=K.NV, T=K.T, SIDE=K.SIDE, Q=np.asarray(Q1), n=S1.shape[0])
    pickle.dump((C1, V1), open(sys.argv[8], 'wb'))
    print('coarse cage', K.n, f'vertices; written after {pre} subdivision step(s):', len(V1), 'vertices', len(Q1), 'quads')


if __name__ == '__main__':
    main()
