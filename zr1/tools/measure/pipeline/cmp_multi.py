import sys, numpy as np, pickle, cv2, trimesh
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
from render import shade_multi
from spin import frame_camera
import paint
J = pickle.load(open('joint_all1.pkl', 'rb'))
specs = sys.argv[3].split(';')       # file:B,G,R
meshes = []
for s in specs:
    f, c = s.split(':')
    m = trimesh.load(f, process=False)
    meshes.append((np.asarray(m.vertices, float), np.asarray(m.faces), list(map(float, c.split(',')))))
tiles = []
for spec in sys.argv[2].split(';'):
    v, box = spec.split('@') if '@' in spec else (spec, None)
    v = int(v) if v.isdigit() else v
    cam = frame_camera(J.rig, v, 1500, 750) if isinstance(v, int) else J.free_cams[v]
    w, _ = paint.pair(v)
    a = w[:, :, 3:4] / 255.0; ref = (w[:, :, :3] * a + 128 * (1 - a)).astype(np.uint8)
    r = shade_multi(meshes, cam)
    if box:
        x0, y0, x1, y1 = map(int, box.split(','))
        ref, r = ref[y0:y1, x0:x1], r[y0:y1, x0:x1]
    pair = np.hstack([ref, r]); s = 1800 / pair.shape[1]
    tiles.append(cv2.resize(pair, None, fx=s, fy=s, interpolation=cv2.INTER_AREA))
cv2.imwrite(sys.argv[1], np.vstack(tiles))
