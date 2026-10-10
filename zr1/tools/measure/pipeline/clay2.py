# Linear clay (psnorm.image) beside the model lit by that view's fitted light, paint pixels only.
import sys, numpy as np, pickle, cv2, trimesh
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
import photo, psnorm
from spin import frame_camera
J = pickle.load(open('joint_all1.pkl', 'rb'))
m = trimesh.load(sys.argv[1], process=False); V, F = np.asarray(m.vertices, float), np.asarray(m.faces)
vn = photo.vertex_normals(V, F)
tiles = []
for v in [int(a) if a.isdigit() else a for a in sys.argv[3].split(',')]:
    cam = frame_camera(J.rig, v, 1500, 750) if isinstance(v, int) else J.free_cams[v]
    I, pm = psnorm.image(v)
    pm = cv2.erode(pm.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    tid, (yy, xx, t, bary) = photo.raster(V, F, cam)
    n = (vn[F[t]] * bary[:, :, None]).sum(1); n /= np.linalg.norm(n, axis=1, keepdims=True)
    ok = pm[yy, xx]
    c, r = photo.fit_light(n[ok], I[yy, xx][ok])
    pred = np.zeros(I.shape, np.float32); pred[yy, xx] = photo.sh_basis(n) @ c
    lo, hi = np.percentile(I[pm], 1), np.percentile(I[pm], 99.5)
    def show(a):
        g = np.clip((a - lo) / (hi - lo) * 230 + 20, 0, 255).astype(np.uint8)
        g[~pm] = 0
        return g
    obs, mod = show(I), show(pred)
    ys, xs = np.nonzero(pm)
    y0, y1, x0, x1 = max(ys.min() - 10, 0), ys.max() + 10, max(xs.min() - 10, 0), xs.max() + 10
    pair = np.hstack([obs[y0:y1, x0:x1], mod[y0:y1, x0:x1]])
    s = 1800 / pair.shape[1]
    tiles.append(cv2.resize(pair, None, fx=s, fy=s, interpolation=cv2.INTER_AREA))
    print(v, 'R2 %.3f' % (1 - r.var() / I[yy, xx][ok].var()))
cv2.imwrite(sys.argv[2], np.vstack([cv2.copyMakeBorder(t, 0, 6, 0, 0, cv2.BORDER_CONSTANT, value=60) for t in tiles]))
