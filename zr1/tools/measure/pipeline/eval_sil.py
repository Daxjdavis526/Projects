import sys, os, numpy as np, pickle, trimesh
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
from fit import proj_jac, render_outline_dist, rim_vertices, edge_face_map
from cagefit import sample
views = pickle.load(open(os.environ.get('VIEWS', 'fit_views.pkl'), 'rb'))
for f in sys.argv[1:]:
    m = trimesh.load(f, process=False); V, F = np.asarray(m.vertices, float), np.asarray(m.faces)
    ef = edge_face_map(F)
    out = []
    for vd in views:
        cam = vd.cam
        uv, Jp, z = proj_jac(cam, V); mpp = z / cam.f
        inimg = (uv[:, 0] > 1) & (uv[:, 0] < cam.w - 2) & (uv[:, 1] > 1) & (uv[:, 1] < cam.h - 2)
        dist_outline, _ = render_outline_dist(V, F, cam)
        rim = rim_vertices(V, F, cam, ef); rim = rim[inimg[rim]]
        u = np.round(uv[rim, 0]).astype(int); v = np.round(uv[rim, 1]).astype(int)
        rim = rim[(dist_outline[v, u] < 1.6) & (vd.bad_d[v, u] == 0)]
        sd0 = sample(vd.sdf, uv[rim]); g = np.stack([sample(vd.sgx, uv[rim]), sample(vd.sgy, uv[rim])], 1)
        gn = g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-9); okr = np.ones(len(rim), bool)
        for frac in (0.5, 1.0, 1.3):
            tgt = uv[rim] - (frac * sd0)[:, None] * gn
            okr &= vd.bad_d[np.clip(np.round(tgt[:, 1]).astype(int), 0, cam.h - 1), np.clip(np.round(tgt[:, 0]).astype(int), 0, cam.w - 1)] == 0
        rim = rim[okr]
        sd = sd0[okr] * mpp[rim]
        idx = np.nonzero(inimg)[0]; uu = np.round(uv[idx, 0]).astype(int); vv = np.round(uv[idx, 1]).astype(int)
        o = idx[(vd.sdf[vv, uu] > 0.75) & (vd.bad_d[vv, uu] == 0)]
        out.append(f'{vd.name}:{np.sqrt(np.mean(sd**2)):.1f}/{len(o)}')
    print(f, ' '.join(out))
