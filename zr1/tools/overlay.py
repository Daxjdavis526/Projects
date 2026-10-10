"""Overlay a full-scale STL (car coordinates: x rearward from the front axle,
y right, z up, mm) on a four-view reference drawing, using the same
per-view calibrations the tracer used, and write shaded renders.

    python tools/overlay.py out/body_loft.stl <drawing.jpg> <outdir>

The drawing is NOT part of this repository (it is a commercial preview);
pass your own copy.
"""
import sys, struct
import numpy as np
from PIL import Image, ImageDraw

stl, ref, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
data = open(stl, 'rb').read()
n = struct.unpack('<I', data[80:84])[0]
arr = np.frombuffer(data[84:84 + n * 50], dtype=np.dtype([('n', '<f4', 3), ('v', '<f4', (3, 3)), ('a', '<u2')]))
T = arr['v'].astype(float)  # n x 3 x 3

img = Image.open(ref).convert('RGB')
# calibrations (pixel = f(mm)) — see the tracer
FA, GROUND = 201.7, 331.0
sx, sz = 2723 / 453.3, 1234 / 206.0
views = {
    # name: (u(x,y,z) px, v(x,y,z) px, depth for painter (larger = nearer), crop box)
    'side': (lambda p: FA + p[..., 0] / sx, lambda p: GROUND - p[..., 2] / sz, lambda p: -p[..., 1], (10, 110, 845, 340)),
    'top': (lambda p: 18 + (p[..., 0] + 1097) / 5.985, lambda p: 629 + p[..., 1] / (2025 / 2 / 165.0), lambda p: p[..., 2], (10, 445, 845, 805)),
    'front': (lambda p: 1055.5 - p[..., 1] / 6.1927, lambda p: GROUND - p[..., 2] / sz, lambda p: -p[..., 0], (875, 115, 1245, 340)),
    'rear': (lambda p: 1055.5 + p[..., 1] / 6.1927, lambda p: 739 - p[..., 2] / sz, lambda p: p[..., 0], (875, 530, 1245, 745)),
}
nrm = np.cross(T[:, 1] - T[:, 0], T[:, 2] - T[:, 0])
nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-12
for name, (fu, fv, fd, box) in views.items():
    U = fu(T); V = fv(T); D = fd(T).mean(axis=1)
    # silhouette mask
    S = 4
    W, H = img.size
    mask = Image.new('L', (W * S, H * S), 0)
    md = ImageDraw.Draw(mask)
    for k in range(len(T)):
        md.polygon([(U[k, i] * S, V[k, i] * S) for i in range(3)], fill=255)
    mask = mask.resize((W, H), Image.LANCZOS)
    m = np.array(mask) > 127
    edge = m ^ np.roll(m, 1, 0) | m ^ np.roll(m, 1, 1)
    over = np.array(img).copy()
    over[edge] = [255, 0, 0]
    o = Image.fromarray(over).crop(box)
    o = o.resize((o.size[0] * 2, o.size[1] * 2), Image.NEAREST)
    o.save(f'{outdir}/ov_{name}.png')
    # shaded render (painter's algorithm), light from the viewer and above
    light = {'side': np.array([0.3, -0.8, 0.5]), 'top': np.array([0.2, 0.3, 1.0]),
             'front': np.array([-0.8, -0.2, 0.5]), 'rear': np.array([0.8, 0.2, 0.5])}[name]
    light = light / np.linalg.norm(light)
    sh = Image.new('RGB', (W * S, H * S), (255, 255, 255))
    sd = ImageDraw.Draw(sh)
    order = np.argsort(D)
    shade = np.clip(np.abs(nrm @ light), 0, 1)
    for k in order:
        c = int(60 + 190 * shade[k])
        sd.polygon([(U[k, i] * S, V[k, i] * S) for i in range(3)], fill=(c, c, c))
    sh = sh.resize((W, H), Image.LANCZOS).crop(box)
    sh = sh.resize((sh.size[0] * 2, sh.size[1] * 2), Image.LANCZOS)
    sh.save(f'{outdir}/sh_{name}.png')
print('ok')
