"""Measured regions of the skin as prisms for the Rust crate.

segment.regions labels the unpainted faces of the skin; a region named in
`SPEC` is turned into an oriented prism: its outline (the region's
boundary loop on the skin, smoothed along its length and simplified) in
the plane perpendicular to the region's mean normal, extruded across the
range the region spans along that normal (plus a margin). The crate
intersects the prism with layers under the skin to make inlays (glass,
lamps, carbon) and pockets (vents, intakes, grilles).

A region on the right side is written once with `mirror: true` when its
twin on the left is the same shape (the skin is symmetric).
"""

from __future__ import annotations

import json
import numpy as np


def boundary_loops(F, faces):
    """Closed loops of vertex ids around a set of faces."""
    sub = F[faces]
    E = np.concatenate([sub[:, [0, 1]], sub[:, [1, 2]], sub[:, [2, 0]]])
    key = np.sort(E, 1)
    _, inv, cnt = np.unique(key, axis=0, return_inverse=True, return_counts=True)
    bnd = E[cnt[inv] == 1]                      # directed boundary edges (face orientation)
    nxt = {}
    for a, b in bnd:
        nxt.setdefault(int(a), []).append(int(b))
    loops, used = [], set()
    for a, b in bnd:
        if (a, b) in used:
            continue
        loop = [int(a)]
        cur, prev = int(b), int(a)
        used.add((int(a), int(b)))
        while cur != loop[0] and len(loop) < 100000:
            loop.append(cur)
            cands = [c for c in nxt.get(cur, []) if (cur, c) not in used]
            if not cands:
                break
            c = cands[0]
            used.add((cur, c))
            prev, cur = cur, c
        loops.append(loop)
    return loops


def smooth_loop(P, spacing=6.0, sigma_mm=12.0):
    """Resample a closed polyline by arc length and smooth it (circular Gaussian)."""
    Q = np.concatenate([P, P[:1]])
    seg = np.linalg.norm(np.diff(Q, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    L = s[-1]
    n = max(int(L / spacing), 12)
    t = np.linspace(0, L, n, endpoint=False)
    R = np.stack([np.interp(t, s, Q[:, k]) for k in range(3)], 1)
    sig = sigma_mm / (L / n)
    k = np.arange(-int(3 * sig) - 1, int(3 * sig) + 2)
    w = np.exp(-0.5 * (k / max(sig, 1e-6)) ** 2); w /= w.sum()
    out = np.zeros_like(R)
    for kk, ww in zip(k, w):
        out += ww * np.roll(R, -kk, axis=0)
    return out


def simplify_2d(P, tol=0.8):
    """Douglas-Peucker on a closed 2-D polygon."""
    def dp(pts):
        if len(pts) < 3:
            return pts
        a, b = pts[0], pts[-1]
        ab = b - a
        L = np.linalg.norm(ab)
        if L < 1e-9:
            d = np.linalg.norm(pts - a, axis=1)
        else:
            q = pts - a
            d = np.abs(ab[0] * q[:, 1] - ab[1] * q[:, 0]) / L
        i = int(np.argmax(d))
        if d[i] > tol:
            return np.concatenate([dp(pts[:i + 1])[:-1], dp(pts[i:])])
        return np.stack([a, b])
    i0 = int(np.argmax(np.linalg.norm(P - P.mean(0), axis=1)))
    Q = np.roll(P, -i0, axis=0)
    Q = np.concatenate([Q, Q[:1]])
    return dp(Q)[:-1]


def region_prism(V, F, faces, normal=None, margin=25.0, sigma_mm=12.0, cut=None):
    """Oriented prism of a face set: origin, axes (e1, e2, n), 2-D outline, range along n."""
    tri = V[F[faces]]
    fn = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    area = 0.5 * np.linalg.norm(fn, axis=1)
    n = fn.sum(0) if normal is None else np.asarray(normal, float)
    n = n / np.linalg.norm(n)
    a = np.array([0.0, 0.0, 1.0]) if abs(n[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
    e1 = np.cross(a, n); e1 /= np.linalg.norm(e1)
    e2 = np.cross(n, e1)
    c = (tri.mean(1) * area[:, None]).sum(0) / area.sum()
    loops = boundary_loops(F, faces)
    loops.sort(key=lambda l: -len(l))
    P = V[loops[0]]
    S = smooth_loop(P, sigma_mm=sigma_mm)
    uv = np.stack([(S - c) @ e1, (S - c) @ e2], 1)
    # orient counter-clockwise
    if np.sum(uv[:, 0] * np.roll(uv[:, 1], -1) - np.roll(uv[:, 0], -1) * uv[:, 1]) < 0:
        uv = uv[::-1]
    uv = simplify_2d(uv)
    h = (V[np.unique(F[faces])] - c) @ n
    return dict(origin=c.tolist(), e1=e1.tolist(), e2=e2.tolist(), n=n.tolist(),
                poly=np.round(uv, 2).tolist(), lo=float(h.min() - margin), hi=float(h.max() + margin),
                area_mm2=float(area.sum()))


def write(regions, path):
    json.dump({'note': 'Measured regions of the C8 ZR1 skin (tools/measure/regions.py): oriented prisms. '
                       'A point p is in a region when (p - origin) . (e1, e2) lies in poly and (p - origin) . n in [lo, hi].',
               'regions': regions}, open(path, 'w'), indent=1)


def iso_loops(V, F, val, level=0.5):
    """Closed polylines where a per-vertex value crosses `level` (marching
    triangles): the boundary of {val < level} at sub-face accuracy, rather
    than the staircase of whole faces."""
    val = np.where(np.abs(val - level) < 1e-9, level + 1e-9, val)
    s = val[F] < level
    cnt = s.sum(1)
    cut = np.nonzero((cnt == 1) | (cnt == 2))[0]
    pts, nxt = {}, {}

    def edge_point(a, b):
        k = (min(a, b), max(a, b))
        if k not in pts:
            t = (level - val[a]) / (val[b] - val[a])
            pts[k] = V[a] + t * (V[b] - V[a])
        return k

    for f in cut:
        tri = F[f]
        e = [edge_point(tri[i], tri[(i + 1) % 3]) for i in range(3)
             if s[f, i] != s[f, (i + 1) % 3]]
        a, b = e
        nxt.setdefault(a, []).append(b)
        nxt.setdefault(b, []).append(a)
    loops, seen = [], set()
    for start in nxt:
        if start in seen:
            continue
        loop, prev, cur = [start], None, start
        seen.add(start)
        while True:
            cands = [c for c in nxt[cur] if c != prev and c not in seen]
            if not cands:
                break
            prev, cur = cur, cands[0]
            seen.add(cur)
            loop.append(cur)
        loops.append(np.array([pts[k] for k in loop]))
    return loops


def region_prism_loop(V, F, faces, loop, normal=None, margin=25.0, sigma_mm=6.0, tol=0.6):
    """As region_prism, with the outline given as a 3-D loop on the skin
    (an iso-contour) instead of the faces' staircase boundary."""
    tri = V[F[faces]]
    fn = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    area = 0.5 * np.linalg.norm(fn, axis=1)
    n = fn.sum(0) if normal is None else np.asarray(normal, float)
    n = n / np.linalg.norm(n)
    a = np.array([0.0, 0.0, 1.0]) if abs(n[2]) < 0.9 else np.array([1.0, 0.0, 0.0])
    e1 = np.cross(a, n); e1 /= np.linalg.norm(e1)
    e2 = np.cross(n, e1)
    c = (tri.mean(1) * area[:, None]).sum(0) / area.sum()
    S = smooth_loop(loop, spacing=3.0, sigma_mm=sigma_mm)
    uv = np.stack([(S - c) @ e1, (S - c) @ e2], 1)
    if np.sum(uv[:, 0] * np.roll(uv[:, 1], -1) - np.roll(uv[:, 0], -1) * uv[:, 1]) < 0:
        uv = uv[::-1]
    uv = simplify_2d(uv, tol)
    h = np.concatenate([(V[np.unique(F[faces])] - c) @ n, (S - c) @ n])
    return dict(origin=c.tolist(), e1=e1.tolist(), e2=e2.tolist(), n=n.tolist(),
                poly=np.round(uv, 2).tolist(), lo=float(h.min() - margin), hi=float(h.max() + margin),
                area_mm2=float(area.sum()), loop3d=np.round(S, 2).tolist())
