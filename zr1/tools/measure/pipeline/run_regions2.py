"""Regions of the final skin: texture projection -> unpainted components ->
named by where they sit -> outlines from the paint-probability iso-contour."""
import sys, json, pickle, numpy as np, cv2, trimesh, time
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
import texmap, segment, paint, regions as R
from spin import frame_camera
J = pickle.load(open('joint_all1.pkl', 'rb'))
m = trimesh.load(sys.argv[1], process=False); V, F = np.asarray(m.vertices, float), np.asarray(m.faces)
if len(sys.argv) > 2 and sys.argv[2] == 'project':
    views = pickle.load(open('fit_views.pkl', 'rb'))
    t0 = time.time()
    prob, colour, wsum = texmap.project(V, F, views, power=12.0)
    np.savez_compressed('skin_tex2.npz', prob=prob, colour=colour, wsum=wsum)
    print('projected %.0fs' % (time.time() - t0), flush=True)
d = np.load('skin_tex2.npz'); prob, colour = d['prob'].copy(), d['colour']
# the front fascia: decided by the front view alone (it sees the fascia
# head-on; elsewhere the splitter's exclusion zone leaves it unseen)
import photo
cam29 = frame_camera(J.rig, 29, 1500, 750)
_, pm29, car29 = paint.shading(29)
vn = photo.vertex_normals(V, F)
uv29 = cam29.project(V)
zone = (V[:, 0] < -600) & (V[:, 2] > 150) & (V[:, 2] < 650) & ((vn[:, 0] < -0.3) | ((np.abs(V[:, 1]) > 800) & (vn[:, 0] < 0.2)))
tid, (yy, xx, t, bary) = photo.raster(V, F, cam29)
z = cam29.to_cam(V)[:, 2]; zb = np.full(tid.shape, np.inf); zb[yy, xx] = (z[F[t]] * bary).sum(1)
u = np.clip(np.round(uv29[:, 0]).astype(int), 0, cam29.w - 1); v = np.clip(np.round(uv29[:, 1]).astype(int), 0, cam29.h - 1)
vis = zone & (np.abs(z - zb[v, u]) < 10)
p29 = texmap.bilinear(cv2.GaussianBlur(pm29.astype(np.float32), (0, 0), 0.7), uv29)[:, 0]
prob[vis] = p29[vis]
print('fascia vertices decided by the front view:', int(vis.sum()))
lab, info, p, col = segment.regions(V, F, prob, colour)
np.save('seg2_lab.npy', lab); json.dump(info, open('seg2.json', 'w'))
def name_of(i):
    c = np.array(i['centroid']); n = np.array(i['normal']); a = i['area_mm2'] / 1e4
    x, y, z = c; ay = abs(y)
    if x < -600 and ay > 820 and 100 < z < 500 and a > 0.15: return 'Front corner'
    if a < 0.5: return None
    if x > 3200 and z < 470: return 'Rear lower'
    if x > 3400 and ay < 300 and 820 < z < 960: return 'Rear trim'
    if n[2] < -0.7 and z < 300: return 'Underbody'
    if x > 3350 and ay < 320 and 560 < z < 820: return 'Plate recess'
    if x > 3100 and ay > 350 and 740 < z < 960: return 'Tail lamp'
    if x > 3250 and ay > 350 and 480 < z < 740: return 'Rear vent'
    if 1650 < x < 2350 and ay > 800 and 450 < z < 950: return 'Side intake'
    if 2050 < x < 2900 and ay > 450 and z > 880 and n[2] > 0.6: return 'Quarter inlet'
    if 1950 < x < 3250 and ay < 450 and z > 900: return 'Engine hatch'
    if 850 < x < 2100 and ay > 450 and 800 < z < 1200: return 'Side window'
    if -100 < x < 2000 and ay < 450 and z > 900: return 'Top glass'
    if -850 < x < -150 and ay > 450 and 520 < z < 850: return 'Headlamp'
    if -850 < x < -150 and ay < 600 and z > 600 and n[2] > 0.4: return 'Hood vent'
    if x < -650 and z < 600: return 'Front openings'
    return '?'
MAT = {'Rear lower': 'diffuser', 'Plate recess': 'plate', 'Tail lamp': 'taillamp', 'Rear vent': 'vent_rear',
       'Side intake': 'intake', 'Quarter inlet': 'inlet', 'Engine hatch': 'hatch', 'Side window': 'glass',
       'Headlamp': 'headlamp', 'Hood vent': 'vent', 'Front openings': 'grille', 'Rear trim': 'black', 'Front corner': 'carbon'}
groups = {}
for i in info:
    nm = name_of(i)
    print(f"{i['id']:3d} {i['area_mm2']/1e4:6.1f} dm2 c {np.round(i['centroid']).astype(int)} n {np.round(i['normal'], 2)} -> {nm}")
    if nm and nm != '?':
        groups.setdefault(nm, []).append(i)
fc = V[F].mean(1)
# the front grille openings join the underbody through the lower nose: split
# them off by position and facing (forward-facing faces ahead of x = -650)
fn_ = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]]); fn_ /= np.linalg.norm(fn_, axis=1, keepdims=True)
for i in groups.pop('Underbody', []):
    sel = (lab == i['id']) & (fc[:, 0] < -650) & (fc[:, 2] > float(sys.argv[4]) if len(sys.argv) > 4 else fc[:, 2] > 165) & (fn_[:, 0] < -0.25)
    if sel.sum():
        new = lab.max() + 1
        lab = lab.copy(); lab[sel] = new
        groups.setdefault('Front openings', []).append(dict(id=int(new), centroid=fc[sel].mean(0).tolist()))
# per-vertex smoothed paint probability from the segmentation
A = segment.adjacency(F, len(V))
pv = segment.smooth(A, segment.fill_unseen(A, prob), 3)
out = []
def emit(name, mat, ids, mirror, cond=None):
    faces = np.nonzero(np.isin(lab, ids) & (cond if cond is not None else True))[0]
    if len(faces) == 0: return
    # vertices of the region and a 2-ring: keep their probability; elsewhere paint
    vs = np.unique(F[faces])
    ring = vs
    for _ in range(2):
        nb = np.unique(A[ring].indices); ring = np.union1d(ring, nb)
    val = np.ones(len(V)); val[ring] = pv[ring]
    val[np.unique(F[faces])] = np.minimum(val[np.unique(F[faces])], 0.49)   # region faces are inside
    loops = R.iso_loops(V, F, val, 0.5)
    loops = [l for l in loops if len(l) > 10]
    if not loops: print('no loop', name); return
    loop = max(loops, key=lambda l: np.linalg.norm(np.diff(np.vstack([l, l[:1]]), axis=0), axis=1).sum())
    pr = R.region_prism_loop(V, F, faces, loop)
    pr.update(name=name, material=mat, mirror=mirror)
    out.append(pr)
    print(f'{name:16s} {mat:9s} faces {len(faces):6d} area {pr["area_mm2"]/1e4:6.1f} dm2 poly {len(pr["poly"]):4d} n {np.round(pr["n"], 2)}')
L = fc[:, 1] < 0
for nm, items in groups.items():
    left = [i['id'] for i in items if i['centroid'][1] < -100]
    centre = [i['id'] for i in items if abs(i['centroid'][1]) <= 100]
    if nm == 'Top glass':
        emit('Windshield', 'glass', centre, False, fc[:, 0] < float(sys.argv[3]) if len(sys.argv) > 3 else fc[:, 0] < 1025)
        emit('Roof panel', 'carbon', centre, False, fc[:, 0] >= (float(sys.argv[3]) if len(sys.argv) > 3 else 1025))
        continue
    if centre:
        for k, cid in enumerate(centre):
            emit(nm if k == 0 else f'{nm} {k + 1}', MAT[nm], [cid], False)
    for k, lid in enumerate(left):
        emit(nm if (k == 0 and not centre) else f'{nm} {k + 1 + len(centre)}', MAT[nm], [lid], True, L)
json.dump({'note': 'Measured regions of the C8 ZR1 skin (tools/measure/regions.py): oriented prisms; '
                   'the outline is the paint-probability iso-contour on the skin. A point p is in a region when '
                   '(p - origin) . (e1, e2) lies in poly and (p - origin) . n in [lo, hi].',
           'regions': [{k: v for k, v in r.items() if k != 'loop3d'} for r in out]},
          open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '../../../data/') + 'regions.json', 'w'), indent=1)
json.dump(out, open('regions2_full.json', 'w'))
