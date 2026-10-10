import sys, os, pickle, time, numpy as np, trimesh
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
from subd import subdivide
from skinfit import SkinFit
import psnorm, photo
from spin import frame_camera
J = pickle.load(open('joint_all1.pkl', 'rb'))
cage_pkl, out, rounds, steps = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
lam = float(os.environ.get('LAM', '100')); w_n = float(os.environ.get('WN', '1')); prior = float(os.environ.get('PRIOR', '0.15'))
use_views = os.environ.get('SIL', '1') == '1'
C, Vc = pickle.load(open(cage_pkl, 'rb'))[:2]
Q, S, _ = subdivide(C.Q, C.n, 3)
X0 = S @ Vc
fit = SkinFit(X0, np.asarray(Q), order=int(os.environ.get('ORDER', '1')))
if os.environ.get('INIT_D'):
    fit.d = pickle.load(open(os.environ['INIT_D'], 'rb'))[2]
views = pickle.load(open('fit_views2.pkl', 'rb')) if use_views else []
if os.environ.get('COV_ALL') and views:
    # painted pixels are body everywhere except on the mirrors (measured hull,
    # both sides, dilated): coverage may use them inside the exclusion zones
    import cv2
    from cagefit import paint_mask
    mh = trimesh.load('mirror_housing.ply', process=False)
    MV, MF = np.asarray(mh.vertices), np.asarray(mh.faces)
    for vd in views:
        mz = np.zeros((vd.cam.h, vd.cam.w), np.uint8)
        for sgn in (1, -1):
            uvm = vd.cam.project(MV * [1, sgn, 1.0])
            for t in np.round(uvm[MF] * 4).astype(np.int32):
                cv2.fillConvexPoly(mz, t, 1, shift=2)
        mz = cv2.dilate(mz, np.ones((13, 13), np.uint8)) > 0
        vd.cov_ok = ~mz
P = np.load('curves_mls.npy')
# fairness relaxed where the clay images show a crease (crease.py): there
# the surface may bend sharply
fair_w = None
if os.environ.get('CREASE'):
    cs = np.load(os.environ['CREASE'])[:, 0]
    cs = np.maximum(cs, cs[fit.mirror])
    fair_w = np.clip(1.0 - cs / float(os.environ.get('CREASE_T', '0.4')), float(os.environ.get('CREASE_MIN', '0.05')), 1.0)
    # one ring wider: a crease bends across its neighbours
    import scipy.sparse as sp
    A = (fit.L != 0).astype(float)
    fair_w = np.minimum(fair_w, (A @ fair_w) / np.maximum(A.sum(1).A1, 1))
    print(f"crease relaxation on {(fair_w < 0.5).sum()} verts", flush=True)
groups = {'spin': [(frame_camera(J.rig, k, 1500, 750),) + psnorm.image(k) for k in range(1, 31)]}
if os.environ.get('CFG', '1') == '1':
    for v in ['deg01', 'deg02', 'deg03', 'deg04', 'deg05', 'deg07', 'deg42', 'deg43']:
        groups[v] = [(J.free_cams[v],) + psnorm.image(v)]
t0 = time.time()
for rnd in range(rounds):
    X = fit.X()
    vn = photo.vertex_normals(X, fit.F)
    obs = psnorm.observe(X, fit.F, groups)
    lights, r2 = psnorm.fit_lights(obs, vn)
    Nps, cnt, rms = psnorm.solve(obs, vn, lights, prior=prior, min_obs=int(os.environ.get("MINO", "4")))
    wn = np.where(cnt >= 4, 1.0, 0.0)
    wn = 0.5 * (wn + wn[fit.mirror])
    Nm = Nps * np.array([1, -1, 1.0]); Nps2 = Nps.copy()
    both = (cnt >= int(os.environ.get("MINO", "4"))) & (cnt[fit.mirror] >= int(os.environ.get("MINO", "4")))
    Nps2[both] = Nps[both] + Nm[fit.mirror[both]]
    Nps2 /= np.linalg.norm(Nps2, axis=1, keepdims=True)
    only_m = (cnt < int(os.environ.get("MINO", "4"))) & (cnt[fit.mirror] >= int(os.environ.get("MINO", "4")))
    Nps2[only_m] = Nm[fit.mirror[only_m]]
    MINO = int(os.environ.get("MINO", "4"))
    wn = np.where((cnt >= MINO) | (cnt[fit.mirror] >= MINO), 1.0, 0.0)
    tilt = np.degrees(np.arccos(np.clip((Nps2 * vn).sum(1), -1, 1)))[wn > 0]
    print(f"round {rnd}: lights R2 " + ' '.join(f'{k}:{v:.2f}' for k, v in r2.items()) +
          f"; normals on {int((wn > 0).sum())} verts, tilt med {np.median(tilt):.1f} p90 {np.percentile(tilt, 90):.1f}  ({time.time()-t0:.0f}s)", flush=True)
    for it in range(steps):
        s = fit.step(views, P, w_pt=1.0, cut=25.0, lam=lam, max_step=15, normals=(Nps2, wn), w_n=w_n, fair_w=fair_w)
        print(f"  step {it}: pts {s['pts'][1]:.2f}/{s['pts'][2]:.2f} nrm {s.get('nrm', (0, 0))[1]:.2f} sil {s['sil'][0]:.2f}/{s['sil'][1]:.2f} step {s['step']:.1f} ({time.time()-t0:.0f}s)", flush=True)
    pickle.dump((C, Vc, fit.d), open(out + '.pkl', 'wb'))
    trimesh.Trimesh(fit.X(), fit.F, process=False).export(out + '.ply')
