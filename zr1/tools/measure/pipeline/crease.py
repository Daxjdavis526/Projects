"""Per-vertex crease score: how often a vertex lands on a sharp step in the
observed paint shading (the linear clay image), over the views it is seen in."""
import sys, pickle, numpy as np, cv2, trimesh
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
import psnorm, photo
from spin import frame_camera
from turntable import observe as _observe, bilinear
J = pickle.load(open('joint_all1.pkl', 'rb'))
m = trimesh.load(sys.argv[1], process=False); V, F = np.asarray(m.vertices, float), np.asarray(m.faces)
views = list(range(1, 31)) + ['deg01', 'deg02', 'deg03', 'deg04', 'deg05', 'deg07', 'deg42', 'deg43']
acc = np.zeros(len(V)); cnt = np.zeros(len(V))
for v in views:
    cam = frame_camera(J.rig, v, 1500, 750) if isinstance(v, int) else J.free_cams[v]
    I, pm = psnorm.image(v)
    pmi = pm.astype(np.uint8)
    inner = cv2.erode(pmi, np.ones((7, 7), np.uint8)) > 0
    lo, hi = np.percentile(I[pm], 2), np.percentile(I[pm], 98)
    g = np.clip((I - lo) / (hi - lo), 0, 1).astype(np.float32)
    g = cv2.GaussianBlur(g, (0, 0), 1.2)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3)
    mag = np.sqrt(gx * gx + gy * gy)
    # a crease is a step: strong here, against a gentle background (local median)
    bg = cv2.medianBlur((np.clip(mag, 0, 1) * 255).astype(np.uint8), 15).astype(np.float32) / 255
    e = np.clip(mag - 1.5 * bg, 0, None)
    e[~inner] = 0
    e = e / max(np.percentile(e[inner], 99), 1e-6)
    obs = _observe(V, F, [(cam, e, inner)], erode=0)
    vis, val, _ = obs[0]
    acc[vis] += np.clip(val, 0, 1.5); cnt[vis] += 1
score = np.where(cnt > 0, acc / np.maximum(cnt, 1), 0)
np.save(sys.argv[2], np.stack([score, cnt], 1))
print('vertices seen', int((cnt > 0).sum()), 'score pct 50/90/99', np.percentile(score[cnt > 0], [50, 90, 99]).round(3))
