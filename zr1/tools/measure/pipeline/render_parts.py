"""Render the built parts (zr1/out/parts/*.mesh, full-scale mm) into calibrated
views beside the reference images.  usage: render_parts.py out.png views [cache dir]"""
import sys, os, glob, struct, pickle, numpy as np, cv2
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
import paint
from render import shade_multi_z as shade_multi
from addon_obs import cam_of
COL = {  # linear-ish sRGB from car.rs finishes, shown a little lifted
    'Body': (0.95, 0.95, 0.94), 'Mirrors': (0.95, 0.95, 0.94), 'Glass': (0.10, 0.11, 0.12),
    'Carbon panels': (0.10, 0.10, 0.11), 'Wing': (0.10, 0.10, 0.11), 'Front splitter': (0.10, 0.10, 0.11),
    'Dive planes': (0.10, 0.10, 0.11), 'Side skirts': (0.10, 0.10, 0.11), 'Hood Gurney': (0.10, 0.10, 0.11),
    'Interior carbon trim': (0.10, 0.10, 0.11), 'Headlamps': (0.25, 0.25, 0.27), 'Tail lamps': (0.62, 0.05, 0.06),
    'Vents and liners': (0.04, 0.04, 0.045), 'Rear valance': (0.05, 0.05, 0.055), 'Exhaust housing': (0.05, 0.05, 0.055),
    'Black trim': (0.03, 0.03, 0.035), 'Mirror stalks': (0.03, 0.03, 0.035), 'Lug nuts': (0.03, 0.03, 0.035),
    'Interior lining': (0.08, 0.08, 0.09), 'Interior': (0.08, 0.08, 0.09), 'Seat belts': (0.10, 0.33, 0.75),
    'Wheels': (0.12, 0.12, 0.12), 'Tyres': (0.09, 0.09, 0.09), 'Brake rotors': (0.40, 0.40, 0.41),
    'Brake calipers': (0.05, 0.32, 0.78), 'Exhaust tips': (0.75, 0.75, 0.77), 'Plate': (0.8, 0.8, 0.8)}
def read(path):
    b = open(path, 'rb').read(); at = 4 + 16
    nv = struct.unpack_from('<I', b, at)[0]; at += 4
    V = np.frombuffer(b, '<f8', nv * 3, at).reshape(-1, 3); at += nv * 24
    nt = struct.unpack_from('<I', b, at)[0]; at += 4
    F = np.frombuffer(b, '<u4', nt * 3, at).reshape(-1, 3).astype(np.int64)
    return V, F
cache = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../out/parts')
meshes = []
for f in sorted(glob.glob(cache + '/*.mesh')):
    name = os.path.basename(f)[:-5]
    if name.startswith('Interior') or name == 'Seat belts':
        continue                                    # hidden inside; saves time
    V, F = read(f)
    c = COL.get(name, (0.5, 0.0, 0.5))
    meshes.append((V, F, [255 * c[2], 255 * c[1], 255 * c[0]]))
tiles = []
for v in [int(a) if a.isdigit() else a for a in sys.argv[2].split(',')]:
    cam = cam_of(v)
    w, _ = paint.pair(v); a = w[:, :, 3:4] / 255.0; ref = (w[:, :, :3] * a + 128 * (1 - a)).astype(np.uint8)
    r = shade_multi(meshes, cam)
    ys, xs = np.nonzero(w[:, :, 3] > 250)
    y0, y1, x0, x1 = max(ys.min() - 20, 0), ys.max() + 20, max(xs.min() - 20, 0), xs.max() + 20
    pair = np.hstack([ref[y0:y1, x0:x1], r[y0:y1, x0:x1]]); s = 1800 / pair.shape[1]
    tiles.append(cv2.resize(pair, None, fx=s, fy=s, interpolation=cv2.INTER_AREA))
cv2.imwrite(sys.argv[1], np.vstack(tiles))
