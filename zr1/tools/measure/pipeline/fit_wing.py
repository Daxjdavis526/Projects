import sys, pickle, json, time, numpy as np, cv2, trimesh
from scipy.optimize import minimize
import wingmodel as W
from addon_obs import observe
skin = trimesh.load(sys.argv[1], process=False)
VS, FS = np.asarray(skin.vertices, float), np.asarray(skin.faces)
views = ['deg02', 'deg03', 'deg04', 'deg07', 7, 21, 14, 10, 12, 16, 18, 4, 25, 8, 20]
obs = observe(views, VS, FS, (2950, -980, 880), (3900, 980, 1340))
for v, (cam, lab) in obs.items():
    print(v, 'wing px', (lab == 1).sum(), 'bg/white px', (lab == 0).sum())

def render(V, F, cam):
    mk = np.zeros((cam.h, cam.w), np.uint8)
    for t in np.round(cam.project(V)[F] * 4).astype(np.int32):
        cv2.fillConvexPoly(mk, t, 1, shift=2)
    return mk > 0

keys = ['x0', 'kx', 'z0', 'kz', 'c0', 'kc', 'a0', 'ka', 'Y', 'up_y']
P0 = dict(W.P0)
def unpack(x):
    p = dict(P0)
    for i, k in enumerate(keys):
        p[k] = P0[k] + x[i]
    p['ep_y'] = p['Y']
    e = np.array(P0['ep_poly'], float) + x[len(keys):len(keys) + 14].reshape(7, 2)
    u = np.array(P0['up_poly'], float) + x[len(keys) + 14:].reshape(6, 2)
    p['ep_poly'] = e.tolist(); p['up_poly'] = u.tolist()
    return p
n = len(keys) + 14 + 12
def cost(x, detail=False):
    V, F = W.wing(unpack(x))
    tot, per = 0.0, {}
    for v, (cam, lab) in obs.items():
        r = render(V, F, cam)
        fp = (r & (lab == 0)).sum(); fn = (~r & (lab == 1)).sum()
        c = (fp + fn) / max((lab == 1).sum(), 1)
        per[v] = round(c, 3); tot += c
    return (tot, per) if detail else tot
x = np.zeros(n)
print('start', cost(x, True), flush=True)
t0 = time.time()
for rnd in range(int(sys.argv[2])):
    res = minimize(cost, x, method='Powell', options=dict(maxfev=1500, xtol=0.5, ftol=1e-4))
    x = res.x
    print('round', rnd, cost(x, True), '%.0fs' % (time.time() - t0), flush=True)
    json.dump(unpack(x), open('wing_fit.json', 'w'), indent=1)
V, F = W.wing(unpack(x)); trimesh.Trimesh(V, F, process=False).export('wing_fit.ply')
