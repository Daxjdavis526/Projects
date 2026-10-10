"""Parametric ZTK front aero: splitter (plan outline, flat plate) with corner
fences, and one dive plane per side (an inclined plate)."""
import numpy as np
from wingmodel import prism_mesh

def prism_z(poly, z0, z1):
    """Polygon (x, y) extruded along z."""
    V, F = prism_mesh(poly, z0, z1)          # prism_mesh extrudes (a, b) -> (a, t, b)
    V = V[:, [0, 2, 1]]                      # (x, t, y) -> (x, y, t)
    return V, F[:, ::-1]

def splitter_outline(p, n=40):
    W = p['W']
    ys = np.linspace(-W, W, n)
    s = ys / W
    xf = p['xc'] + p['k1'] * s ** 2 + p['k2'] * s ** 8
    front = np.stack([xf, ys], 1)
    back = np.array([[p['xr'], W], [p['xr'], -W]])
    return np.concatenate([front, back])

def fence_outline(p):
    W = p['W']; x0 = p['xc'] + p['k1'] + p['k2']
    return np.array([[x0, p['z0']], [x0 + p['fl'], p['z0']], [x0 + p['fl'], p['z0'] + p['fh']], [x0 + 0.3 * p['fl'], p['z0'] + p['fh']]])

def dive_outline(p):
    x1, z1, x2, z2, t = p['dx1'], p['dz1'], p['dx2'], p['dz2'], p['dt']
    d = np.array([x2 - x1, z2 - z1]); d /= np.linalg.norm(d); nrm = np.array([-d[1], d[0]])
    a, b = np.array([x1, z1]), np.array([x2, z2])
    return np.array([a - nrm * t / 2, b - nrm * t / 2, b + nrm * t / 2, a + nrm * t / 2])

def meshes(p):
    out = [prism_z(splitter_outline(p), p['z0'], p['z0'] + p['t'])]
    for s in (1, -1):
        for poly, y0, y1 in [(fence_outline(p), p['W'] - p['ft'], p['W']), (dive_outline(p), p['dy0'], p['dy1'])]:
            ya, yb = sorted([s * y0, s * y1])
            out.append(prism_mesh(poly, ya, yb))
    V, F, o = [], [], 0
    for v, f in out:
        V.append(v); F.append(f + o); o += len(v)
    return np.concatenate(V), np.concatenate(F)

P0 = dict(xc=-1100.0, k1=80.0, k2=180.0, W=930.0, xr=-650.0, z0=95.0, t=14.0,
          fl=160.0, fh=70.0, ft=10.0,
          dx1=-640.0, dz1=250.0, dx2=-420.0, dz2=330.0, dt=8.0, dy0=880.0, dy1=1000.0)

VIEWS = ['deg01', 'deg02', 'deg42', 'deg43', 29, 28, 27, 1, 2, 3, 7, 26, 25, 4, 5]
BOX = ((-1250, -1060, 0), (-150, 1060, 480))

def EXCLUDE():
    """The front tyres (dark): cylinders about the front hubs."""
    out = []
    t = np.linspace(0, 2 * np.pi, 48, endpoint=False)
    for s in (1, -1):
        ring = np.stack([350 * np.cos(t), np.zeros_like(t), 319.2 + 350 * np.sin(t)], 1)
        a = ring + [0, s * 690, 0]; b = ring + [0, s * 1000, 0]
        V = np.concatenate([a, b]); n = len(t)
        F = [[i, (i + 1) % n, n + (i + 1) % n] for i in range(n)] + [[i, n + (i + 1) % n, n + i] for i in range(n)]
        F += [[0, i, i + 1] for i in range(1, n - 1)] + [[n, n + i + 1, n + i] for i in range(1, n - 1)]
        out.append((V, np.array(F)))
    return out
