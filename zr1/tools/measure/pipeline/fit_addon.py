"""Fit a parametric add-on part to the observed masks.
usage: fit_addon.py <model module> <out prefix> <skin.ply> <rounds> key1,key2,...  [view list]"""
import sys, json, time, importlib, numpy as np, cv2, trimesh
from scipy.optimize import minimize
from addon_obs import observe, cam_of
M = importlib.import_module(sys.argv[1])
out, skin_f, rounds, keys = sys.argv[2], sys.argv[3], int(sys.argv[4]), sys.argv[5].split(',')
views = [int(v) if str(v).isdigit() else v for v in (sys.argv[6].split(',') if len(sys.argv) > 6 else M.VIEWS)]
skin = trimesh.load(skin_f, process=False)
VS, FS = np.asarray(skin.vertices, float), np.asarray(skin.faces)
obs = observe(views, VS, FS, M.BOX[0], M.BOX[1], mode=getattr(M, 'MODE', 'dark'))
# don't-care zones (e.g. the tyres, which are dark too)
for v, (cam, lab) in obs.items():
    for Vx, Fx in getattr(M, 'EXCLUDE', lambda: [])():
        mk = np.zeros(lab.shape, np.uint8)
        cv2.fillPoly(mk, list(np.round(cam.project(Vx)[Fx] * 4).astype(np.int32)), 1, shift=2)
        lab[(mk > 0) & (lab < 3)] = 2
    print(v, 'part px', int((lab == 1).sum()), 'not-part px', int((lab == 0).sum()), flush=True)
obs = {v: o for v, o in obs.items() if (o[1] == 1).sum() >= 400}     # views where the part shows against something
P0 = dict(M.P0)
if len(sys.argv) > 7:
    P0.update(json.load(open(sys.argv[7])))
def render(V, F, cam):
    mk = np.zeros((cam.h, cam.w), np.uint8)
    for t in np.round(cam.project(V)[F] * 4).astype(np.int32):
        cv2.fillConvexPoly(mk, t, 1, shift=2)
    return mk > 0
def unpack(x):
    p = dict(P0)
    for i, k in enumerate(keys):
        p[k] = P0[k] + x[i]
    return p
def cost(x, detail=False):
    V, F = M.meshes(unpack(x))
    tot, per = 0.0, {}
    for v, (cam, lab) in obs.items():
        r = render(V, F, cam)
        c = ((r & (lab == 0)).sum() + (~r & (lab == 1)).sum()) / max((lab == 1).sum(), 1)
        per[v] = round(float(c), 3); tot += c
    return (round(tot, 3), per) if detail else tot
x = np.zeros(len(keys))
print('start', cost(x, True), flush=True)
t0 = time.time()
for rnd in range(rounds):
    res = minimize(cost, x, method='Powell', options=dict(maxfev=1200, xtol=0.5, ftol=1e-4))
    x = res.x
    print('round', rnd, cost(x, True), '%.0fs' % (time.time() - t0), flush=True)
    p = unpack(x)
    json.dump({k: (v.tolist() if isinstance(v, np.ndarray) else v) for k, v in p.items()}, open(out + '.json', 'w'), indent=1)
    V, F = M.meshes(p); trimesh.Trimesh(V, F, process=False).export(out + '.ply')
