import sys, numpy as np, cv2
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
import paint
from addon_obs import cam_of
lo = np.array(list(map(float, sys.argv[1].split(',')))); hi = np.array(list(map(float, sys.argv[2].split(','))))
B = np.array([[x, y, z] for x in (lo[0], hi[0]) for y in (lo[1], hi[1]) for z in (lo[2], hi[2])], float)
step = int(sys.argv[4]) if len(sys.argv) > 4 else 20
for v in [int(a) if a.isdigit() else a for a in sys.argv[3].split(',')]:
    cam = cam_of(v); uv = cam.project(B)
    x0, y0 = np.maximum(uv.min(0).astype(int), 0); x1, y1 = np.minimum(uv.max(0).astype(int), [cam.w, cam.h])
    w, _ = paint.pair(v); a = w[:, :, 3:4] / 255.0; img = (w[:, :, :3] * a + 150 * (1 - a)).astype(np.uint8)[y0:y1, x0:x1]
    s = 900 / img.shape[1]; img = cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC)
    for gx in range((x0 // step + 1) * step, x1, step):
        X = int((gx - x0) * s); cv2.line(img, (X, 0), (X, img.shape[0]), (0, 200, 255) if gx % (5 * step) == 0 else (0, 110, 150), 1)
        if gx % (5 * step) == 0: cv2.putText(img, str(gx), (X + 2, 12), 0, 0.4, (0, 0, 255), 1)
    for gy in range((y0 // step + 1) * step, y1, step):
        Y = int((gy - y0) * s); cv2.line(img, (0, Y), (img.shape[1], Y), (0, 200, 255) if gy % (5 * step) == 0 else (0, 110, 150), 1)
        if gy % (5 * step) == 0: cv2.putText(img, str(gy), (2, Y - 2), 0, 0.4, (0, 0, 255), 1)
    cv2.imwrite('../shots/grid_%s.png' % v, img); print(v, x0, y0, x1, y1, 'scale', round(s, 2))
