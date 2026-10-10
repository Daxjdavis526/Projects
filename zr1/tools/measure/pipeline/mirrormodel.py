"""Door mirror: a rounded box (housing) placed by centre, half sizes, yaw
and pitch, plus a capsule stalk from the door to the housing. Left side
(y < 0) is fitted; the right is its mirror image."""
import numpy as np, trimesh

_S = trimesh.creation.icosphere(subdivisions=3)
_D, _F = np.asarray(_S.vertices), np.asarray(_S.faces)

def rot(yaw, pitch):
    cy, sy, cp, sp = np.cos(yaw), np.sin(yaw), np.cos(pitch), np.sin(pitch)
    Rz = np.array([[cy, -sy, 0], [sy, cy, 0], [0, 0, 1]])
    Ry = np.array([[cp, 0, sp], [0, 1, 0], [-sp, 0, cp]])
    return Rz @ Ry

def rbox_sdf(P, h, r):
    q = np.abs(P) - (h - r)
    return np.linalg.norm(np.maximum(q, 0), axis=1) + np.minimum(q.max(1), 0) - r

def rbox_mesh(c, h, r, R):
    lo, hi = np.zeros(len(_D)), np.full(len(_D), np.linalg.norm(h) + 1)
    for _ in range(30):
        mid = 0.5 * (lo + hi)
        inside = rbox_sdf(_D * mid[:, None], h, r) < 0
        lo = np.where(inside, mid, lo); hi = np.where(inside, hi, mid)
    return (_D * lo[:, None]) @ R.T + c, _F

def capsule_mesh(a, b, rad):
    a, b = np.asarray(a, float), np.asarray(b, float)
    d = b - a; L = np.linalg.norm(d)
    m = trimesh.creation.capsule(height=L, radius=rad, count=[12, 12])
    V = np.asarray(m.vertices)
    z = np.array([0, 0, 1.0]); u = d / L
    v = np.cross(z, u); s = np.linalg.norm(v); c = z @ u
    if s < 1e-9:
        R = np.eye(3)
    else:
        K = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
        R = np.eye(3) + K + K @ K * ((1 - c) / s ** 2)
    return V @ R.T + (a + b) / 2, np.asarray(m.faces)

def housing(p):
    return np.array([p['cx'], p['cy'], p['cz']]), np.array([p['hx'], p['hy'], p['hz']]), p['r'], rot(np.radians(p['yaw']), np.radians(p['pitch']))

def meshes(p):
    out = []
    c, h, r, R = housing(p)
    for s in (1, -1):
        M = np.diag([1, s, 1.0])
        V, F = rbox_mesh(c, h, r, R)
        V = V @ M
        out.append((V, F if s == 1 else F[:, ::-1]))
        a = np.array([p['ax'], p['ay'], p['az']]) * [1, s, 1]; b = np.array([p['bx'], p['by'], p['bz']]) * [1, s, 1]
        out.append(capsule_mesh(a, b, p['sr']))
    V, F, o = [], [], 0
    for v, f in out:
        V.append(v); F.append(f + o); o += len(v)
    return np.concatenate(V), np.concatenate(F)

P0 = dict(cx=770.0, cy=-1005.0, cz=895.0, hx=55.0, hy=105.0, hz=62.0, r=30.0, yaw=0.0, pitch=0.0,
          ax=840.0, ay=-860.0, az=860.0, bx=790.0, by=-930.0, bz=865.0, sr=14.0)
VIEWS = ['deg05', 'deg03', 'deg04', 'deg42', 'deg43', 29, 28, 27, 26, 1, 2, 'deg01']
BOX = ((580, 830, 760), (1150, 1150, 1040))
MODE = 'any'
