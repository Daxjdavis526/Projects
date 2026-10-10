"""Splitter plan outline from the skin's lower nose: the lip runs `ahead`
mm in front of the fascia's lowest band, ending at the triangulated corner
tips (-890, +-937); plate between z0 and z0 + t (from the mask fit)."""
import sys, json, numpy as np, trimesh
from scipy.ndimage import gaussian_filter1d
m = trimesh.load(sys.argv[1], process=False); V = np.asarray(m.vertices)
ahead = float(sys.argv[2]) if len(sys.argv) > 2 else 30.0
ys = np.arange(0.0, 901.0, 25.0)
xf = []
for y in ys:
    s = (np.abs(np.abs(V[:, 1]) - y) < 15) & (V[:, 2] > 140) & (V[:, 2] < 230) & (V[:, 0] < -300)
    xf.append(V[s, 0].min())
xf = gaussian_filter1d(np.array(xf), 1.5, mode='nearest') - ahead
tip = (-890.0, 937.0)
pts = list(zip(xf, ys))
right = [list(tip)] + [[x, y] for x, y in pts[::-1] if y > 0]
left = [[x, -y] for x, y in pts if y > 0] + [[tip[0], -tip[1]]]
outline = right + [[pts[0][0], 0.0]] + left + [[-600.0, -937.0], [-600.0, 937.0]]
print('front x at centre %.0f, |y| 400 %.0f, 800 %.0f' % (xf[0], xf[16], xf[32]))
json.dump(dict(outline=np.round(outline, 1).tolist(), z0=89.3, t=31.1), open('splitter_skin.json', 'w'))
