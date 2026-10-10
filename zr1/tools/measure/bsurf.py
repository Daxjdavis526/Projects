"""The body as one smooth, symmetric B-spline surface.

Control points P[i, j] (i along the car, nose to tail; j around the
right-hand half-section, from the roof centreline j=0 down to the
underbody centreline j=NU-1). The left half is the mirror image: the
half-section's control polygon is extended across the centre plane by its
own mirror image, so the cubic B-spline around the full section is smooth
and symmetric by construction. Along the car the spline is clamped, and the
end rows lie on the centre plane, which closes the nose and the tail.

Every surface sample is a fixed linear combination of the control points
(X = B P, one sparse B per coordinate), so fitting is linear algebra on a
few thousand numbers, and fairness is a property of the representation
rather than something a smoothing term has to fight for.
"""

from __future__ import annotations

import numpy as np
import scipy.sparse as sp
from scipy.interpolate import BSpline


def clamped_knots(n, k=3):
    inner = np.arange(1, n - k)
    return np.concatenate([np.zeros(k + 1), inner, np.full(k + 1, n - k)]).astype(float)


def basis_v(n_ctrl, s):
    """Clamped cubic basis along the car: (len(s) x n_ctrl), s in [0, n_ctrl-3]."""
    t = clamped_knots(n_ctrl)
    s = np.clip(s, 0, t[-1] - 1e-9)
    return BSpline.design_matrix(s, t, 3).toarray()


def basis_u(n_ctrl, s):
    """Mirror-extended uniform cubic basis around the half-section.

    Returns (Bxz, By): (len(s) x n_ctrl) for the x/z and y coordinates.
    s in [0, n_ctrl-1]; s=0 is the roof centreline, s=n_ctrl-1 the floor."""
    ext = list(range(3, 0, -1)) + list(range(n_ctrl)) + list(range(n_ctrl - 2, n_ctrl - 5, -1))
    sign = [-1] * 3 + [1] * n_ctrl + [-1] * 3
    m = len(ext)
    # Uniform knots t_e = e - 3: basis e peaks at t = e - 1. Original control j
    # is extended index e = j + 3, so evaluating at s + 2 puts s = j on it.
    t = np.arange(m + 4, dtype=float) - 3
    B = BSpline.design_matrix(np.asarray(s, float) + 2.0, t, 3).toarray()
    Bxz = np.zeros((len(s), n_ctrl))
    By = np.zeros((len(s), n_ctrl))
    for e, (j, sg) in enumerate(zip(ext, sign)):
        Bxz[:, j] += B[:, e]
        By[:, j] += sg * B[:, e]
    return Bxz, By


class Surface:
    def __init__(self, nv, nu, sv, su):
        """sv: sample parameters along (in [0, nv-3]); su: around (in [0, nu-1])."""
        self.nv, self.nu = nv, nu
        self.sv, self.su = np.asarray(sv, float), np.asarray(su, float)
        Bv = basis_v(nv, self.sv)
        Bxz, By = basis_u(nu, self.su)
        self.Bxz = sp.csr_matrix(np.kron(Bv, Bxz))
        self.By = sp.csr_matrix(np.kron(Bv, By))
        self.Bxz.eliminate_zeros()
        self.By.eliminate_zeros()
        self.ns_v, self.ns_u = len(self.sv), len(self.su)
        # Which control coordinates are free: y is pinned to 0 on the centreline
        # columns (j=0, j=nu-1) and on the end rows (i=0, i=nv-1).
        fy = np.ones((nv, nu), bool)
        fy[:, 0] = fy[:, -1] = False
        fy[0, :] = fy[-1, :] = False
        self.free_y = fy.ravel()

    # ---- parameters <-> control points
    # Each control row lies in a plane x = const (a station): only y and z
    # are parameters, so rows cannot slide along the car and fold over.
    def set_stations(self, xs):
        self.xs = np.asarray(xs, float)

    def n_params(self):
        return self.nv * self.nu + int(self.free_y.sum())

    def pack(self, P):
        P = P.reshape(self.nv * self.nu, 3)
        return np.concatenate([P[:, 2], P[self.free_y, 1]])

    def unpack(self, q):
        n = self.nv * self.nu
        P = np.zeros((n, 3))
        P[:, 0] = np.repeat(self.xs, self.nu)
        P[:, 2] = q[:n]
        P[self.free_y, 1] = q[n:]
        return P.reshape(self.nv, self.nu, 3)

    def jacobian_blocks(self):
        """d(sample x, y, z)/d(params), as three sparse matrices (x is fixed)."""
        n = self.nv * self.nu
        m = self.Bxz.shape[0]
        nf = int(self.free_y.sum())
        Jx = sp.csr_matrix((m, n + nf))
        Jz = sp.hstack([self.Bxz, sp.csr_matrix((m, nf))]).tocsr()
        Jy = sp.hstack([sp.csr_matrix((m, n)), self.By[:, self.free_y]]).tocsr()
        return Jx, Jy, Jz

    # ---- evaluation
    def samples(self, P):
        P = P.reshape(self.nv * self.nu, 3)
        X = np.stack([self.Bxz @ P[:, 0], self.By @ P[:, 1], self.Bxz @ P[:, 2]], 1)
        return X.reshape(self.ns_v, self.ns_u, 3)

    def mesh(self, P):
        """Closed triangle mesh: right half samples, mirrored left half, joined
        on the centreline (shared vertices). Returns V, F and the index of the
        right-half sample behind each vertex (for chaining Jacobians), with a
        sign flag for mirrored y."""
        S = self.samples(P)
        nv, nu = S.shape[:2]
        right = S.reshape(-1, 3)
        # left half: mirror of columns 1..nu-2 (centre columns shared)
        left = S[:, 1:-1][:, ::-1].copy()
        left[..., 1] *= -1
        V = np.concatenate([right, left.reshape(-1, 3)])
        src = np.concatenate([np.arange(nv * nu), (np.arange(nv)[:, None] * nu + np.arange(nu - 2, 0, -1)[None]).ravel()])
        mir = np.concatenate([np.zeros(nv * nu, bool), np.ones(nv * (nu - 2), bool)])
        # ring index: right j=0..nu-1, then left columns (nu-2 .. 1) as ring positions nu..2nu-3
        ring = 2 * nu - 2
        def vid(i, r):
            if r < nu:
                return i * nu + r
            return nv * nu + i * (nu - 2) + (r - nu)
        F = []
        for i in range(nv - 1):
            for r in range(ring):
                a, b = vid(i, r), vid(i, (r + 1) % ring)
                c, d = vid(i + 1, r), vid(i + 1, (r + 1) % ring)
                F.append((a, c, b))
                F.append((b, c, d))
        F = np.array(F)
        return V, F, src, mir


def _hermite(t):
    t2, t3 = t * t, t * t * t
    return 2 * t3 - 3 * t2 + 1, t3 - 2 * t2 + t, -2 * t3 + 3 * t2, t3 - t2


def cardinal_matrix(n, s, tension, index_map, sign_map=None):
    """Interpolating cardinal-spline basis (len(s) x n).

    Segment k..k+1 uses neighbours k-1 and k+2 through `index_map(e)` (which
    turns an extended index into (control index, sign)); tangent at k is
    a_k (P[k+1] - P[k-1]) with a_k = (1 - tension_k)/2, so tension 1 makes a
    sharp corner and 0 is Catmull-Rom."""
    s = np.asarray(s, float)
    B = np.zeros((len(s), n))
    a = (1 - np.asarray(tension, float)) / 2
    for r, sv in enumerate(s):
        k = int(min(np.floor(sv), n - 2))
        t = sv - k
        h00, h10, h01, h11 = _hermite(t)
        w = {k - 1: -h10 * a[k], k: h00 - h11 * a[k + 1], k + 1: h01 + h10 * a[k], k + 2: h11 * a[k + 1]}
        for e, wt in w.items():
            j, sg = index_map(e)
            if sign_map is None:
                B[r, j] += wt
            else:
                B[r, j] += wt * (sg if sign_map else 1)
    return B


def basis_u_cardinal(nu, s, tension):
    """Around the half-section, mirrored across the centre plane at both ends."""
    def im(e):
        if e < 0:
            return -e, -1           # mirror of P[|e|]
        if e > nu - 1:
            return 2 * (nu - 1) - e, -1
        return e, 1
    Bxz = cardinal_matrix(nu, s, tension, im, sign_map=False)
    By = cardinal_matrix(nu, s, tension, im, sign_map=True)
    return Bxz, By


def basis_v_cardinal(nv, s, tension=None):
    """Along the car, through every station; ends extrapolated linearly."""
    tension = np.zeros(nv) if tension is None else tension
    B = np.zeros((len(s), nv))
    a = (1 - np.asarray(tension, float)) / 2
    for r, sv in enumerate(np.asarray(s, float)):
        k = int(min(np.floor(sv), nv - 2))
        t = sv - k
        h00, h10, h01, h11 = _hermite(t)
        def P(e):                     # P[-1] = 2P0 - P1, P[n] = 2P[n-1] - P[n-2]
            if e < 0:
                return {0: 2.0, 1: -1.0}
            if e > nv - 1:
                return {nv - 1: 2.0, nv - 2: -1.0}
            return {e: 1.0}
        for e, wt in ((k - 1, -h10 * a[k]), (k, h00 - h11 * a[k + 1]), (k + 1, h01 + h10 * a[k]), (k + 2, h11 * a[k + 1])):
            for j, c in P(e).items():
                B[r, j] += wt * c
    return B


class CardinalSurface(Surface):
    """Like Surface, but interpolating: control points lie on the surface
    and a tension per section column can make a crisp crease."""
    def __init__(self, nv, nu, sv, su, tension_u=None, tension_v=None):
        self.nv, self.nu = nv, nu
        self.sv, self.su = np.asarray(sv, float), np.asarray(su, float)
        tu = np.zeros(nu) if tension_u is None else np.asarray(tension_u, float)
        Bv = basis_v_cardinal(nv, self.sv, tension_v)
        Bxz, By = basis_u_cardinal(nu, self.su, tu)
        self.Bxz = sp.csr_matrix(np.kron(Bv, Bxz))
        self.By = sp.csr_matrix(np.kron(Bv, By))
        self.Bxz.eliminate_zeros()
        self.By.eliminate_zeros()
        self.ns_v, self.ns_u = len(self.sv), len(self.su)
        fy = np.ones((nv, nu), bool)
        fy[:, 0] = fy[:, -1] = False
        fy[0, :] = fy[-1, :] = False
        self.free_y = fy.ravel()
