"""The measured skin's shape with the first model's surfaces.

The measured skin (cage + displacement) matches the references' outlines
to a few millimetres, but its panels carry waves and soft lumps the car
does not have. The first model's body (a loft of smooth sections drawn by
eye, `git show bede119:zr1/src/body.rs`) has clean panels and crease
lines, but proportions drawn from a four-view drawing. Here, on the
measured mesh's own vertices:

    final = measured + HP(old - measured) = LP(measured) + HP(old)

where `old` is the nearest point of the first model's loft to each
measured vertex, and LP/HP split a field over the mesh into what varies
slower and faster than about `sigma` mm (diffusion of the field over the
mesh graph). Large-scale shape — the outline, proportions, intake scoops,
fender flares — is the measured one; anything finer comes from the loft.

usage: blend_skin.py measured.ply old_loft.stl sigma_mm out.ply
"""
import sys, numpy as np, trimesh, scipy.sparse as sp

m = trimesh.load(sys.argv[1], process=False)
old = trimesh.load(sys.argv[2], process=False)
sigma = float(sys.argv[3])
X = np.asarray(m.vertices, float); F = np.asarray(m.faces)
n = len(X)

# nearest points on the loft
pq = trimesh.proximity.ProximityQuery(old)
O = np.empty_like(X)
for k in range(0, n, 20000):
    O[k:k + 20000], _, _ = pq.on_surface(X[k:k + 20000])
D = O - X
print('old - measured |D| pct 50/90/99: %.1f %.1f %.1f mm' % tuple(np.percentile(np.linalg.norm(D, axis=1), [50, 90, 99])))

# diffusion over the mesh graph: K steps of neighbour averaging spread a
# field over about h·sqrt(K) (h the edge length)
E = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
A = sp.coo_matrix((np.ones(len(E)), (E[:, 0], E[:, 1])), shape=(n, n)).tocsr()
A = ((A + A.T) > 0).astype(float)
W = sp.diags(1.0 / np.asarray(A.sum(1)).ravel()) @ A
h = np.median(np.linalg.norm(X[E[:, 0]] - X[E[:, 1]], axis=1))
K = int(round((sigma / h) ** 2))
print(f'edge {h:.1f} mm, {K} diffusion steps for sigma {sigma:.0f} mm')
L = D.copy()
for _ in range(K):
    L = 0.5 * L + 0.5 * (W @ L)
final = X + D - L
print('final - measured pct 50/90/99: %.1f %.1f %.1f mm' % tuple(np.percentile(np.linalg.norm(final - X, axis=1), [50, 90, 99])))
trimesh.Trimesh(final, F, process=False).export(sys.argv[4])
