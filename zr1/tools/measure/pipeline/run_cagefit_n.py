# Normal-only cage fit, re-based every round.
import sys, os, numpy as np, pickle, time, trimesh
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
from cagefit import CageFit
from subd import subdivide, triangles
src, tag, rounds, iters = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
lam, w_pt = float(sys.argv[5]), float(sys.argv[6])
pts = np.load(sys.argv[7]) if len(sys.argv) > 7 and w_pt > 0 else None
C, Vc = pickle.load(open(src, 'rb'))
views = pickle.load(open(os.environ.get('VIEWS', 'fit_views2.pkl'), 'rb'))
F_ = CageFit(C, Vc, level=2, normal_only=True)
t0 = time.time()
for r in range(rounds):
    F_.run(views, iters=iters, lam=(lam, lam), points=pts, w_pt=w_pt, pt_cut=30.0, w_station=0.0,
           max_step=float(os.environ.get('MAXSTEP', 15)), w_anchor=1e-4)
    F_.rebase(F_.cage())
    print(f'round {r} done ({time.time() - t0:.0f}s)', flush=True)
    pickle.dump((C, F_.cage()), open(f'cn_{tag}.pkl', 'wb'))
Q3, S3, _ = subdivide(C.Q, C.n, 3)
trimesh.Trimesh(S3 @ F_.cage(), triangles(Q3), process=False).export(f'cn_{tag}_l3.ply')
print('done')
