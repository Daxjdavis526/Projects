# Multi-view triangulation of the paint-mask boundaries (fixed curves on the skin).
import sys, numpy as np, cv2, json, pickle, time
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
import edgemvs, paint
from spin import frame_camera
S = __import__('os').environ.get('ZR1_SCRATCH', '..')
J = pickle.load(open(S + '/work/joint_all1.pkl', 'rb'))
occ = np.load(S + '/work/hull_all_occ.npy'); meta = json.load(open(S + '/work/hull_all.json'))
lo, vox = np.array(meta['lo']), meta['vox']
names = list(range(1, 31)) + ['deg01', 'deg02', 'deg03', 'deg04', 'deg05', 'deg07', 'deg42', 'deg43']
views = {}
for v in names:
    sh, pm, car = paint.shading(v)
    cam = frame_camera(J.rig, v, 1500, 750) if isinstance(v, int) else J.free_cams[v]
    vw = edgemvs.View.__new__(edgemvs.View)
    vw.name, vw.cam = v, cam
    vw.car = car
    vw.edges = paint.boundary_edges(pm, car)
    vw.dist = cv2.distanceTransform((~vw.edges).astype(np.uint8), cv2.DIST_L2, 3)
    vw.sigma = 1.2 if isinstance(v, int) else 1.6
    vw.h, vw.w = car.shape
    views[v] = vw
pickle.dump({k: (v.edges, v.car) for k, v in views.items()}, open(S + '/work/paint_edges.pkl', 'wb'))
allP = []
t0 = time.time()
for ri, r in enumerate(names):
    ref = views[r]
    others = [w for n, w in views.items() if n != r]
    pr = edgemvs.profiles(ref, others, occ, lo, vox, depth=400, max_angle=55, subsample=2)
    P, st = edgemvs.pick(*pr, radius=3, min_views=3, min_score=0.55, peak_ratio=1.3)
    print(f'ref {r}: {len(pr[0])} edge px -> {len(P)} points  ({time.time() - t0:.0f}s)', flush=True)
    allP.append(np.concatenate([P, st[:, 2:3], np.full((len(P), 1), ri)], 1))
    np.save(S + '/work/paint_pts.npy', np.concatenate(allP))
print('total', sum(len(a) for a in allP))
