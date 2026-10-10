# Initial cage from the blob fit's sections.
import sys, numpy as np, trimesh, pickle
sys.path.insert(0, __import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..'))
from cage import Cage, half_section_columns
from subd import subdivide, triangles
NV, T, SIDE = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])
out = sys.argv[4]
blob = trimesh.load('b2_c_it19.ply')
X0, X1 = float(sys.argv[5]), float(sys.argv[6])
t = np.linspace(0, 1, NV)
f = t - 0.55 * np.sin(2 * np.pi * t) / (2 * np.pi)
xs = X0 + (X1 - X0) * f
C = Cage(NV, T, SIDE)
V = np.zeros((C.n, 3))
NU, R = C.NU, C.R
for i, x in enumerate(xs):
    s = blob.section(plane_origin=[x, 0, 0], plane_normal=[1, 0, 0])
    P = max(s.discrete, key=len)
    zc = 0.5 * (P[:, 2].max() + P[:, 2].min())
    P = P[P[:, 1] >= -1e-6]
    th = np.arctan2(P[:, 1], P[:, 2] - zc)
    o = np.argsort(th); P = P[o]
    poly = np.concatenate([[[0, P[0, 2]]], P[:, 1:], [[0, P[-1, 2]]]])
    cols = half_section_columns(poly, NU, T, SIDE)
    for r in range(R):
        j = r if r < NU else R - r
        y, z = cols[j]
        V[C.ids[('L', i, r)]] = [x, y if r < NU else -y, z]
# cap interiors: Coons patch of the end loop, bulged outward along x
for cap, i, sgn in (('F', 0, -1), ('B', NV - 1, 1)):
    a, b = C.a, C.b
    B = lambda u, v: V[C.ids[('L', i, C.ring_index(u, v))]]
    for u in range(1, a):
        for v in range(1, b):
            s_, t_ = u / a, v / b
            P = ((1 - t_) * B(u, 0) + t_ * B(u, b) + (1 - s_) * B(0, v) + s_ * B(a, v)
                 - ((1 - s_) * (1 - t_) * B(0, 0) + s_ * (1 - t_) * B(a, 0) + (1 - s_) * t_ * B(0, b) + s_ * t_ * B(a, b)))
            P[0] += sgn * 25 * np.sin(np.pi * s_) * np.sin(np.pi * t_)
            V[C.ids[(cap, u, v)]] = P
# symmetrise exactly
mir = C.mirror_of(); V = 0.5 * (V + V[mir] * [1, -1, 1])
right, centre = C.halves(); V[centre, 1] = 0
Qf, S, _ = subdivide(C.Q, C.n, 3)
X = S @ V
m = trimesh.Trimesh(X, triangles(Qf), process=False)
print('cage', C.n, 'quads', len(C.Q), 'fine faces', len(Qf), 'volume %.3f m3' % (m.volume / 1e9), 'blob %.3f' % (blob.volume / 1e9))
if m.volume < 0:
    print('flipping orientation'); C.Q = C.Q[:, ::-1]
pickle.dump((C, V), open(out, 'wb'))
m = trimesh.Trimesh(X, triangles(Qf if m.volume > 0 else Qf[:, ::-1]), process=False)
m.export(out.replace('.pkl', '_l3.ply'))
# directed-edge check
E = np.concatenate([C.Q[:, [k, (k + 1) % 4]] for k in range(4)])
print('directed edges unique:', len(np.unique(E, axis=0)) == len(E))
