import sys, json, pickle, numpy as np, cv2
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
import paint
from addon_obs import cam_of
R = json.load(open(sys.argv[1]))
tiles = []
for v in [int(a) if a.isdigit() else a for a in sys.argv[3].split(',')]:
    cam = cam_of(v)
    w, _ = paint.pair(v); a = w[:, :, 3:4] / 255.0; img = (w[:, :, :3] * a + 120 * (1 - a)).astype(np.uint8)
    for r in R:
        P = np.array(r['loop3d'])
        for M in ([1, 1, 1], [1, -1, 1]) if r['mirror'] else ([1, 1, 1],):
            Q = P * M; nn = np.array(r['n']) * M
            if (cam.centre - Q.mean(0)) @ nn < 0: continue
            uv = cam.project(Q)
            cv2.polylines(img, [np.round(uv * 4).astype(np.int32)], True, (0, 0, 255), 2 if cam.w > 2000 else 1, cv2.LINE_AA, shift=2)
    ys, xs = np.nonzero(w[:, :, 3] > 250); img = img[ys.min() - 10:ys.max() + 10, xs.min() - 10:xs.max() + 10]
    s = 1600 / img.shape[1]; tiles.append(cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA))
cv2.imwrite(sys.argv[2], np.vstack(tiles))
