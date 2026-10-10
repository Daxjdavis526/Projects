import sys, pickle, numpy as np, trimesh, time
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
from hullpart import background_masks, carve, mesh
from scipy import ndimage
views = pickle.load(open('fit_views2.pkl', 'rb'))
bgs = background_masks(views)
lo, hi, vox = (600, -1150, 760), (1020, -840, 1040), 3.0
occ, grid = carve(views, bgs, lo, hi, vox)
skin = trimesh.load(sys.argv[1], process=False)
G = np.stack(np.meshgrid(*grid, indexing='ij'), -1).reshape(-1, 3)
cand = np.nonzero(occ.ravel())[0]
t0 = time.time()
# the skin near the box only, and the query in chunks (memory)
F = np.asarray(skin.faces); V = np.asarray(skin.vertices)
c = V[F].mean(1)
near = np.all((c > np.array(lo) - 80) & (c < np.array(hi) + 80), axis=1)
sub = trimesh.Trimesh(V, F[near], process=False)
# sign from the full mesh's winding is unreliable on an open crop: use the
# crop for distance and a ray-free sign: the side of the nearest face
pq = trimesh.proximity.ProximityQuery(sub)
sd = np.empty(len(cand))
for k in range(0, len(cand), 20000):
    P = G[cand[k:k + 20000]]
    cp, d, tri = pq.on_surface(P)
    s_ = np.sign(((P - cp) * sub.face_normals[tri]).sum(1))     # + outside
    sd[k:k + 20000] = -s_ * d                                     # + inside, as trimesh
print('signed distance %.0fs' % (time.time() - t0), flush=True)
keep = (sd < -float(sys.argv[2])) & (G[cand][:, 1] < -float(sys.argv[3])) & (G[cand][:, 0] < float(sys.argv[4])) & (G[cand][:, 2] > float(sys.argv[5]))
occ2 = np.zeros(occ.size, bool); occ2[cand[keep]] = True; occ2 = occ2.reshape(occ.shape)
lab, n = ndimage.label(occ2)
sizes = ndimage.sum(occ2, lab, range(1, n + 1))
occ3 = lab == (1 + np.argmax(sizes))
print('components', n, 'largest volume %.2f L' % (occ3.sum() * vox ** 3 / 1e6), flush=True)
m = mesh(occ3, grid, vox, keep_min_mm3=1e4, sigma=0.8)
print('mesh', len(m.faces), 'vol %.2f L' % (m.volume / 1e6), m.bounds.round(0).tolist())
m.export('hull_mirror2.ply')
