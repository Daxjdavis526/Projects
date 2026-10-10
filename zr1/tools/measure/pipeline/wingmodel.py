"""Parametric ZTK wing: main plane (lofted sections), endplates, uprights.
Produces closed meshes (for fitting by projection) and the data the Rust
crate builds from (rings, polygons)."""
import numpy as np

def airfoil(n=28, tc=0.12, camber=0.04):
    """Closed section, x in [0,1], LE at 0; inverted camber (downforce: the
    lower surface is the convex suction side). Blunt 1.5 % trailing edge."""
    t = 0.5 - 0.5 * np.cos(np.pi * np.arange(n + 1) / n)
    th = 5 * tc * (0.2969 * np.sqrt(t) - 0.1260 * t - 0.3516 * t ** 2 + 0.2843 * t ** 3 - 0.1036 * t ** 4) + 0.0075 * t
    m, p = camber, 0.4
    yc = np.where(t < p, m / p ** 2 * (2 * p * t - t ** 2), m / (1 - p) ** 2 * ((1 - 2 * p) + 2 * p * t - t ** 2))
    yc = -yc
    up = np.stack([t, yc + th], 1); lo = np.stack([t, yc - th], 1)
    return np.concatenate([up[::-1], lo[1:-1]])

def main_plane(p, ns=48):
    """p: dict. Sections at y in [-Y, Y]; LE x = x0 + kx*(y/Y)^2, z = z0 + kz*(y/Y)^2;
    chord c0 + kc*(y/Y)^2; angle a (deg, TE up)."""
    sec = airfoil(tc=p['tc'], camber=p['camber'])
    Y = p['Y']
    rings = []
    for y in np.linspace(-Y, Y, ns + 1):
        s = (y / Y) ** 2
        c = p['c0'] + p['kc'] * s
        a = np.radians(p['a0'] + p['ka'] * s)
        x = sec[:, 0] * c; z = sec[:, 1] * c
        xr = x * np.cos(a) - z * np.sin(a); zr = x * np.sin(a) + z * np.cos(a)
        rings.append(np.stack([p['x0'] + p['kx'] * s + xr, np.full(len(xr), y), p['z0'] + p['kz'] * s + zr], 1))
    return np.array(rings)

def loft(rings):
    """Closed triangle mesh through rings (ends fanned to centroids)."""
    R, M = rings.shape[:2]
    V = rings.reshape(-1, 3)
    F = []
    for i in range(R - 1):
        for j in range(M):
            a, b = i * M + j, i * M + (j + 1) % M
            c, d = a + M, b + M
            F += [[a, b, d], [a, d, c]]
    V = np.concatenate([V, rings[0].mean(0)[None], rings[-1].mean(0)[None]])
    c0, c1 = len(V) - 2, len(V) - 1
    for j in range(M):
        F.append([c0, (j + 1) % M, j])
        F.append([c1, (R - 1) * M + j, (R - 1) * M + (j + 1) % M])
    return V, np.array(F)

def prism_mesh(poly, y0, y1):
    """Polygon (x, z) extruded along y."""
    P = np.asarray(poly, float); n = len(P)
    V = np.concatenate([np.stack([P[:, 0], np.full(n, y0), P[:, 1]], 1), np.stack([P[:, 0], np.full(n, y1), P[:, 1]], 1)])
    F = []
    for j in range(n):
        a, b = j, (j + 1) % n
        F += [[a, b, b + n], [a, b + n, a + n]]
    c0 = len(V); c1 = c0 + 1
    V = np.concatenate([V, [[P[:, 0].mean(), y0, P[:, 1].mean()], [P[:, 0].mean(), y1, P[:, 1].mean()]]])
    for j in range(n):
        F += [[c0, (j + 1) % n, j], [c1, n + j, n + (j + 1) % n]]
    return V, np.array(F)

def wing(p):
    parts = [loft(main_plane(p))]
    for s in (1, -1):
        y0, y1 = sorted([s * p['ep_y'], s * (p['ep_y'] + p['ep_t'])])
        parts.append(prism_mesh(p['ep_poly'], y0, y1))
        y0, y1 = sorted([s * (p['up_y'] - p['up_t'] / 2), s * (p['up_y'] + p['up_t'] / 2)])
        parts.append(prism_mesh(p['up_poly'], y0, y1))
    V, F, o = [], [], 0
    for v, f in parts:
        V.append(v); F.append(f + o); o += len(v)
    return np.concatenate(V), np.concatenate(F)

P0 = dict(x0=3395.0, kx=-310.0, z0=1090.0, kz=10.0, c0=405.0, kc=0.0, a0=13.0, ka=0.0, tc=0.11, camber=0.03, Y=915.0,
          ep_y=915.0, ep_t=16.0,
          ep_poly=[[3098, 1076], [3104, 1089], [3175, 1206], [3542, 1275], [3545, 1240], [3500, 1180], [3420, 1150]],
          up_y=365.0, up_t=36.0,
          up_poly=[[3426, 980], [3480, 980], [3642, 1100], [3640, 1170], [3590, 1170], [3540, 1080]])
