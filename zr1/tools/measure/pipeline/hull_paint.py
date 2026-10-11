"""A dark add-on seen against the white paint (the dive planes) as a visual
hull carved by the paint as well as the background.

hull_box.py carves only where a view sees clear background, which leaves
anything seen against the body uncarved. Here a voxel outside the body is
also empty when, in some view, it projects onto PAINT that lies behind it:
a dark part there would have hidden that paint. (Paint in front of the
voxel says nothing: the body hides the voxel.) Depth behind the voxel comes
from the measured skin's own depth buffer in that view.

usage: [HULL_ZMIN=z] [HULL_XMAX=x] hull_paint.py skin.ply lo hi voxel out.ply [views]
  lo, hi: box corners "x,y,z" (mm); the part is carved on the side the box
  is on and written as it stands there.
"""
import sys, os, pickle, time
import numpy as np, cv2, trimesh
from scipy import ndimage
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import photo
from paint import pair, shading
from addon_obs import cam_of
from hullpart import mesh

skin = trimesh.load(sys.argv[1], process=False)
V, F = np.asarray(skin.vertices, float), np.asarray(skin.faces)
lo = np.array(list(map(float, sys.argv[2].split(','))))
hi = np.array(list(map(float, sys.argv[3].split(','))))
vox = float(sys.argv[4])
views = [int(a) if a.isdigit() else a for a in (sys.argv[6] if len(sys.argv) > 6 else
         ','.join([str(k) for k in range(1, 31)] + ['deg01', 'deg02', 'deg03', 'deg04', 'deg05', 'deg07', 'deg42', 'deg43'])).split(',')]
MARGIN = 6.0      # mm: paint must lie this far behind the voxel to carve it

shape = np.ceil((hi - lo) / vox).astype(int) + 1
grid = [lo[i] + np.arange(shape[i]) * vox for i in range(3)]
G = np.stack(np.meshgrid(*grid, indexing='ij'), -1).reshape(-1, 3)
occ = np.ones(len(G), bool)
t0 = time.time()
for v in views:
    cam = cam_of(v)
    w, _ = pair(v)
    bg = cv2.erode((w[:, :, 3] < 60).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    _, pm, _ = shading(v)
    pm = cv2.erode(pm.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    tid, (yy, xx, t, bary) = photo.raster(V, F, cam)
    zc = cam.to_cam(V)[:, 2]
    zbuf = np.full((cam.h, cam.w), np.inf, np.float32)
    zbuf[yy, xx] = (zc[F[t]] * bary).sum(1)
    idx = np.nonzero(occ)[0]
    uv = cam.project(G[idx]); z = cam.to_cam(G[idx])[:, 2]
    u = np.round(uv[:, 0]).astype(int); vv = np.round(uv[:, 1]).astype(int)
    ins = (u >= 0) & (u < cam.w) & (vv >= 0) & (vv < cam.h)
    kill = np.zeros(len(idx), bool)
    ui, vi = u[ins], vv[ins]
    kill[ins] = bg[vi, ui] | (pm[vi, ui] & (zbuf[vi, ui] > z[ins] + MARGIN))
    occ[idx[kill]] = False
    print(f'{v}: {occ.sum()} voxels left ({time.time() - t0:.0f}s)', flush=True)

# outside the body only (the skin's signed distance, nearest-face side)
F_near = F[np.all((V[F].mean(1) > lo - 80) & (V[F].mean(1) < hi + 80), axis=1)]
sub = trimesh.Trimesh(V, F_near, process=False)
pq = trimesh.proximity.ProximityQuery(sub)
cand = np.nonzero(occ)[0]
out = np.zeros(len(cand), bool)
for k in range(0, len(cand), 20000):
    P = G[cand[k:k + 20000]]
    cp, d, tri = pq.on_surface(P)
    out[k:k + 20000] = ((P - cp) * sub.face_normals[tri]).sum(1) > 1.0
occ2 = np.zeros(len(G), bool); occ2[cand[out]] = True
# optional clips: HULL_ZMIN (drop what lies below, e.g. the splitter under a
# dive plane), HULL_XMAX (drop what lies behind, e.g. the gap at the wheel
# arch that is only ever seen against the tyre)
if os.environ.get('HULL_ZMIN'):
    occ2 &= G[:, 2] > float(os.environ['HULL_ZMIN'])
if os.environ.get('HULL_XMAX'):
    occ2 &= G[:, 0] < float(os.environ['HULL_XMAX'])
occ2 = occ2.reshape(shape)
lab, n = ndimage.label(occ2)
sizes = ndimage.sum(occ2, lab, range(1, n + 1))
print('components', n, 'sizes (L)', np.round(np.sort(sizes)[::-1][:6] * vox ** 3 / 1e6, 3), flush=True)
keep = lab == (1 + np.argmax(sizes))
m = mesh(keep, grid, vox, keep_min_mm3=1e3, sigma=0.7)
print('mesh', len(m.faces), 'vol %.3f L' % (m.volume / 1e6), m.bounds.round(0).tolist())
m.export(sys.argv[5])
