"""Half-width of the body's front-view silhouette at each height (max over
x), from a full-scale STL, for comparison with a drawing's front view.

    python tools/widths.py out/body_loft.stl [x0 x1]
"""
import sys, struct
import numpy as np
data = open(sys.argv[1], 'rb').read()
n = struct.unpack('<I', data[80:84])[0]
T = np.frombuffer(data[84:84 + n * 50], dtype=np.dtype([('n', '<f4', 3), ('v', '<f4', (3, 3)), ('a', '<u2')]))['v'].astype(float)
x0, x1 = (float(sys.argv[2]), float(sys.argv[3])) if len(sys.argv) > 3 else (-1e9, 1e9)
V = T.reshape(-1, 3)
V = V[(V[:, 0] >= x0) & (V[:, 0] <= x1)]
for z in range(1240, 0, -40):
    sel = V[np.abs(V[:, 2] - z) < 20]
    print(z, round(np.abs(sel[:, 1]).max()) if len(sel) else '-')
