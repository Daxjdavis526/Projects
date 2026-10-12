"""The measured shape on a smooth surface: the cage refitted to the
measured skin with its control net kept fair.

The measured skin is the cage's subdivision surface plus a per-vertex
offset layer, and the lumps live in the offsets. The first model looked
clean because it was a loft of a few smooth sections; the cage is the same
kind of thing (loops of control points around the car), so here it is
refitted, with no offset layer, to the measured surface's positions:

    min  sum |S Vc - X_measured|^2  +  lam * |L^2 Vc|^2      (mirror-symmetric)

S the subdivision (level 3) of the cage, L the cage net's umbrella
Laplacian (squared: even curvature costs nothing, bumps cost a lot; the
cage's own sharp edges stay sharp). Larger lam: smoother, further from the
measured surface.

With a sixth argument, a surface (the first model's body warped onto the
measured shape, ffd_warp.py), the targets are instead each measured
vertex's nearest point on that surface: the cage then takes that surface's
shape while keeping the measured skin's layout of points (which never folds
— a closest-point refit of the net itself folds at the nose and tail caps,
where the loft is a wedge and a flat end; coarse_cage.py with pre 0).

usage: cage_smooth.py cage.pkl measured.ply lam out.ply out_cage.pkl [onto.ply]
"""
import sys, pickle, numpy as np, trimesh, scipy.sparse as sp, scipy.sparse.linalg as spla
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
from subd import subdivide
from skinfit import triangles, mirror_map

C, Vc = pickle.load(open(sys.argv[1], 'rb'))[:2]
Xm = np.asarray(trimesh.load(sys.argv[2], process=False).vertices, float)
lam = float(sys.argv[3])
if len(sys.argv) > 6:
    onto = trimesh.load(sys.argv[6], process=False)
    pq = trimesh.proximity.ProximityQuery(onto)
    T = np.empty_like(Xm)
    for k in range(0, len(Xm), 20000):
        T[k:k + 20000], _, _ = pq.on_surface(Xm[k:k + 20000])
    d = np.linalg.norm(T - Xm, axis=1)
    print('measured -> surface 50/90/99/max: %.1f / %.1f / %.1f / %.1f mm' % tuple(np.percentile(d, [50, 90, 99, 100])))
    Xm = T
Q, S, _ = subdivide(C.Q, C.n, 3)
S = sp.csr_matrix(S)
nc = Vc.shape[0]
Qc = np.asarray(C.Q)
E = np.concatenate([Qc[:, [0, 1]], Qc[:, [1, 2]], Qc[:, [2, 3]], Qc[:, [3, 0]]])
A = sp.coo_matrix((np.ones(len(E)), (E[:, 0], E[:, 1])), shape=(nc, nc)).tocsr()
A = ((A + A.T) > 0).astype(float)
L = sp.identity(nc) - sp.diags(1.0 / np.asarray(A.sum(1)).ravel()) @ A
L2 = (L @ L).tocsr()
M = (S.T @ S + lam * (L2.T @ L2)).tocsc()
solve = spla.factorized(M)
V = np.stack([solve(S.T @ Xm[:, c]) for c in range(3)], 1)
# exact mirror symmetry of the cage
mir = mirror_map(Vc)
V = 0.5 * (V + V[mir] * np.array([1.0, -1.0, 1.0]))
X = S @ V
d = np.linalg.norm(X - Xm, axis=1)
print(f'lam {lam:g}: distance to the targets 50/90/99 = {np.percentile(d, 50):.1f} / {np.percentile(d, 90):.1f} / {np.percentile(d, 99):.1f} mm')
trimesh.Trimesh(X, triangles(np.asarray(Q)), process=False).export(sys.argv[4])
pickle.dump((C, V), open(sys.argv[5], 'wb'))
