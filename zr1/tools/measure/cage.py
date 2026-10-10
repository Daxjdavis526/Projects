"""The body's quad cage: station loops around the car, capped at nose and tail.

Topology (all quads, closed, mirror-symmetric):

  * NV station loops, nose (i = 0) to tail (i = NV-1). Each loop has
    2 (NU-1) vertices: r = 0 is the top centreline, r = 1..NU-2 run down
    the right-hand side, r = NU-1 is the bottom centreline, and the left
    half is the mirror image. Loop column j = r on the right is the same
    longitudinal flow line on every station, so a column can be made a
    crease along part of the car.
  * Each half loop is split into three runs: T segments over the top,
    SIDE segments down the side, T segments under the floor. The nose and
    tail are each closed by a (2T x SIDE) grid of quads whose boundary is
    the end loop (a 'grid fill', every interior vertex regular).

Vertices are free in 3-D. The fit's parameters are the right-hand half
(y >= 0); centreline vertices keep y = 0 exactly.
"""

from __future__ import annotations

import numpy as np
import scipy.sparse as sp


class Cage:
    def __init__(self, NV, T, SIDE):
        self.NV, self.T, self.SIDE = NV, T, SIDE
        self.NU = 2 * T + SIDE + 1
        NU = self.NU
        R = 2 * (NU - 1)
        self.R = R
        ids = {}
        n = 0
        # loops
        for i in range(NV):
            for r in range(R):
                ids[('L', i, r)] = n; n += 1
        a, b = 2 * T, SIDE
        self.a, self.b = a, b
        # cap interiors (front 'F', rear 'B'): u = 1..a-1, v = 1..b-1
        for cap in ('F', 'B'):
            for u in range(1, a):
                for v in range(1, b):
                    ids[(cap, u, v)] = n; n += 1
        self.n = n
        self.ids = ids
        Q = []
        for i in range(NV - 1):
            for r in range(R):
                r2 = (r + 1) % R
                Q.append((ids[('L', i, r)], ids[('L', i + 1, r)], ids[('L', i + 1, r2)], ids[('L', i, r2)]))
        for cap, i in (('F', 0), ('B', NV - 1)):
            def gid(u, v, cap=cap, i=i):
                if 0 < u < a and 0 < v < b:
                    return ids[(cap, u, v)]
                return ids[('L', i, self.ring_index(u, v))]
            for u in range(a):
                for v in range(b):
                    q = (gid(u, v), gid(u + 1, v), gid(u + 1, v + 1), gid(u, v + 1))
                    Q.append(q if cap == 'F' else q[::-1])
        self.Q = np.array(Q)

    def ring_index(self, u, v):
        """Loop position r of the cap-grid boundary point (u, v)."""
        T, S, NU = self.T, self.SIDE, self.NU
        a, b = self.a, self.b
        if v == 0 and u >= T:
            return u - T
        if u == a:
            return T + v
        if v == b:
            return T + S + (a - u)
        if u == 0:
            return NU - 1 + T + (b - v)
        if v == 0 and u < T:
            return (2 * (NU - 1) - (T - u)) % (2 * (NU - 1))
        raise ValueError((u, v))

    # ---- symmetry
    def mirror_of(self):
        """Index of each vertex's mirror image."""
        m = np.empty(self.n, int)
        R, NU = self.R, self.NU
        for k, i in self.ids.items():
            if k[0] == 'L':
                _, ii, r = k
                m[i] = self.ids[('L', ii, (R - r) % R)]
            else:
                cap, u, v = k
                m[i] = self.ids[(cap, self.a - u, v)]
        return m

    def halves(self):
        """(right, centre) boolean masks: right = y > 0 side, centre = on y = 0."""
        right = np.zeros(self.n, bool)
        centre = np.zeros(self.n, bool)
        NU = self.NU
        for k, i in self.ids.items():
            if k[0] == 'L':
                r = k[2]
                centre[i] = r in (0, NU - 1)
                right[i] = 0 < r < NU - 1
            else:
                u = k[1]
                centre[i] = u == self.T
                right[i] = u > self.T
        return right, centre

    def param_matrix(self):
        """U (3n x p): full cage coordinates (x0,y0,z0,x1,...) = U q.

        Parameters: x, y, z of every right-half vertex and x, z of every
        centreline vertex; the left half is the mirror image."""
        right, centre = self.halves()
        mir = self.mirror_of()
        col = {}
        p = 0
        rows, cols, vals = [], [], []
        for i in range(self.n):
            if right[i]:
                col[i] = (p, p + 1, p + 2); p += 3
            elif centre[i]:
                col[i] = (p, None, p + 1); p += 2
        for i in range(self.n):
            if right[i] or centre[i]:
                cx, cy, cz = col[i]
                rows += [3 * i, 3 * i + 2]; cols += [cx, cz]; vals += [1.0, 1.0]
                if cy is not None:
                    rows.append(3 * i + 1); cols.append(cy); vals.append(1.0)
            else:
                cx, cy, cz = col[mir[i]]
                rows += [3 * i, 3 * i + 1, 3 * i + 2]; cols += [cx, cy, cz]; vals += [1.0, -1.0, 1.0]
        U = sp.csr_matrix((vals, (rows, cols)), shape=(3 * self.n, p))
        return U, col

    def pack(self, V):
        U, col = self.param_matrix()
        q = np.zeros(U.shape[1])
        for i, (cx, cy, cz) in col.items():
            q[cx] = V[i, 0]; q[cz] = V[i, 2]
            if cy is not None:
                q[cy] = V[i, 1]
        return q

    def loop(self, i):
        return np.array([self.ids[('L', i, r)] for r in range(self.R)])

    def column(self, j):
        """Right-hand column j (0..NU-1) as cage indices along the car."""
        return np.array([self.ids[('L', i, j)] for i in range(self.NV)])


def half_section_columns(poly, NU, T, SIDE, corner_deg=45.0):
    """Place NU points on a half section (y >= 0, ordered top centre -> bottom
    centre): T segments where the outward normal points up (above +corner_deg),
    SIDE segments where it points sideways, T segments where it points down,
    each run spaced evenly by arc length."""
    P = np.asarray(poly, float)                 # (k, 2): (y, z)
    seg = np.diff(P, axis=0)
    L = np.linalg.norm(seg, axis=1)
    s = np.concatenate([[0], np.cumsum(L)])
    t = seg / np.maximum(L[:, None], 1e-9)
    nrm = np.stack([t[:, 1], -t[:, 0]], 1)      # outward for top->bottom traversal of the right half
    ang = np.degrees(np.arctan2(nrm[:, 1], nrm[:, 0]))
    sm = 0.5 * (s[1:] + s[:-1])
    # first point where the normal drops below +corner, and below -corner (smoothed, monotone)
    from scipy.ndimage import uniform_filter1d
    a2 = uniform_filter1d(ang, max(3, len(ang) // 40))
    i1 = np.argmax(a2 < corner_deg)
    i2 = len(a2) - 1 - np.argmax(a2[::-1] > -corner_deg)
    s1, s2 = sm[i1], sm[min(i2, len(sm) - 1)]
    if not (0 < s1 < s2 < s[-1]):
        s1, s2 = s[-1] * 0.3, s[-1] * 0.7
    st = np.concatenate([np.linspace(0, s1, T + 1)[:-1], np.linspace(s1, s2, SIDE + 1)[:-1], np.linspace(s2, s[-1], T + 1)])
    y = np.interp(st, s, P[:, 0]); z = np.interp(st, s, P[:, 1])
    y[0] = y[-1] = 0.0
    return np.stack([y, z], 1)
