"""Overlay the projected outlines of meshes on reference views.
usage: ovl_parts.py out.png "v1;v2@x0,y0,x1,y1;..." mesh1:B,G,R mesh2:B,G,R ..."""
import sys, pickle, numpy as np, cv2, trimesh
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
import paint
from spin import frame_camera
J = pickle.load(open('joint_all1.pkl', 'rb'))
meshes = []
for s in sys.argv[3:]:
    f, c = s.rsplit(':', 1)
    m = trimesh.load(f, process=False)
    meshes.append((np.asarray(m.vertices, float), np.asarray(m.faces), tuple(int(x) for x in c.split(','))))
tiles = []
for spec in sys.argv[2].split(';'):
    v, box = spec.split('@') if '@' in spec else (spec, None)
    v = int(v) if v.isdigit() else v
    cam = frame_camera(J.rig, v, 1500, 750) if isinstance(v, int) else J.free_cams[v]
    w, _ = paint.pair(v)
    a = w[:, :, 3:4] / 255.0; img = (w[:, :, :3] * a + 150 * (1 - a)).astype(np.uint8)
    for V, F, col in meshes:
        uv = cam.project(V)
        mk = np.zeros((cam.h, cam.w), np.uint8)
        T = np.round(uv[F] * 4).astype(np.int32)
        if len(F) < 300000:
            for t in T:
                cv2.fillConvexPoly(mk, t, 1, shift=2)
        else:
            cv2.fillPoly(mk, list(T), 1, shift=2)
        cs, _ = cv2.findContours(mk, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        cv2.drawContours(img, cs, -1, col, 1 if cam.w < 2000 else 2, cv2.LINE_AA)
    if box:
        x0, y0, x1, y1 = map(int, box.split(','))
        img = img[y0:y1, x0:x1]
    s = 1600 / img.shape[1]
    tiles.append(cv2.resize(img, None, fx=s, fy=s, interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC))
cv2.imwrite(sys.argv[1], np.vstack(tiles))
