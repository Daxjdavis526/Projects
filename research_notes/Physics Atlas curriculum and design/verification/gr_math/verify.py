#!/usr/bin/env python3
"""Symbolic/numeric verification of answer keys for the GR-math content map.

Convention (Carroll = MTW (+,+,+)):
  signature (-,+,+,+)
  Gamma^a_{bc} = 1/2 g^{ad} (d_b g_{dc} + d_c g_{bd} - d_d g_{bc})
  R^a_{bcd}   = d_c Gamma^a_{db} - d_d Gamma^a_{cb} + Gamma^a_{ce} Gamma^e_{db} - Gamma^a_{de} Gamma^e_{cb}
  R_{bd}      = R^a_{bad}   (contract 1st and 3rd)
  R           = g^{bd} R_{bd};   G_{ab} = R_{ab} - 1/2 R g_{ab}
"""
import math
from itertools import product
import sympy as sp

def S(e):
    e = sp.simplify(e)
    try:
        return sp.simplify(sp.trigsimp(e))
    except Exception:
        return e


def christoffel(g, x):
    n = len(x)
    gi = S(g.inv())
    G = [[[0] * n for _ in range(n)] for _ in range(n)]
    for a, b, c in product(range(n), repeat=3):
        G[a][b][c] = S(sum(gi[a, d] * (sp.diff(g[d, b], x[c]) + sp.diff(g[d, c], x[b]) - sp.diff(g[b, c], x[d]))
                           for d in range(n)) / 2)
    return G, gi


def riemann(G, x):
    n = len(x)
    R = [[[[0] * n for _ in range(n)] for _ in range(n)] for _ in range(n)]
    for a, b, c, d in product(range(n), repeat=4):
        R[a][b][c][d] = S(sp.diff(G[a][d][b], x[c]) - sp.diff(G[a][c][b], x[d])
                          + sum(G[a][c][e] * G[e][d][b] - G[a][d][e] * G[e][c][b] for e in range(n)))
    return R


def lower_riem(R, g):
    n = g.shape[0]
    return [[[[S(sum(g[a, e] * R[e][b][c][d] for e in range(n))) for d in range(n)] for c in range(n)]
             for b in range(n)] for a in range(n)]


def ricci(R, n):
    return sp.Matrix(n, n, lambda b, d: S(sum(R[a][b][a][d] for a in range(n))))


def rscalar(Ric, gi):
    n = gi.shape[0]
    return S(sum(gi[i, j] * Ric[i, j] for i in range(n) for j in range(n)))


def show_gamma(G, names):
    n = len(names)
    out = []
    for a, b, c in product(range(n), repeat=3):
        if b <= c and G[a][b][c] != 0:
            out.append(f"Gamma^{names[a]}_{{{names[b]}{names[c]}}} = {G[a][b][c]}")
    print("   ", "; ".join(out) if out else "all zero")


def show_riem(R, names, lowered=False):
    n = len(names)
    out = []
    for a, b, c, d in product(range(n), repeat=4):
        if c < d and R[a][b][c][d] != 0:
            if lowered and not (a < b):
                continue
            tag = f"R_{{{names[a]}{names[b]}{names[c]}{names[d]}}}" if lowered else f"R^{names[a]}_{{{names[b]}{names[c]}{names[d]}}}"
            out.append(f"{tag} = {R[a][b][c][d]}")
    print("   ", "; ".join(out) if out else "all zero")


def full_geometry(title, g, x, names, lowered=True):
    print(f"\n=== {title} ===")
    print("    g =", g.tolist())
    G, gi = christoffel(g, x)
    print("    g^-1 =", gi.tolist())
    print("    sqrt|det g| =", S(sp.sqrt(sp.Abs(g.det()))))
    show_gamma(G, names)
    R = riemann(G, x)
    print("  Riemann (upper first index, c<d):")
    show_riem(R, names)
    if lowered:
        Rl = lower_riem(R, g)
        print("  Riemann (all lower, a<b, c<d):")
        show_riem(Rl, names, lowered=True)
    Ric = ricci(R, len(x))
    print("    Ricci =", Ric.tolist())
    Rs = rscalar(Ric, gi)
    print("    Ricci scalar R =", Rs)
    return G, gi, R, Ric, Rs


# ---------------------------------------------------------------------------
r, th, ph, a, z, u, v, y, xx, t, rho, eta, chi = sp.symbols('r theta phi a z u v y x t rho eta chi', real=True)
Rbig, rsmall, c = sp.symbols('R_big r_small c', positive=True)
M = sp.symbols('M', positive=True)

# 1. Polar coordinates in the plane
full_geometry("Polar coordinates (r, theta) on the flat plane", sp.diag(1, r**2), [r, th], ['r', 'th'])

# 2. Spherical coordinates in flat 3-space
full_geometry("Spherical coordinates (r, theta, phi) in flat R^3", sp.diag(1, r**2, r**2 * sp.sin(th)**2), [r, th, ph],
              ['r', 'th', 'ph'], lowered=False)

# 3. Two-sphere radius a
G2, gi2, R2, Ric2, Rs2 = full_geometry("2-sphere of radius a", sp.diag(a**2, a**2 * sp.sin(th)**2), [th, ph], ['th', 'ph'])
print("    Gaussian curvature K = R_{thph th ph}/det g =",
      S(lower_riem(R2, sp.diag(a**2, a**2 * sp.sin(th)**2))[0][1][0][1] / (a**4 * sp.sin(th)**2)))

# 4. Torus: X = ((R + r cos v) cos u, (R + r cos v) sin u, r sin v)
gT = sp.diag((Rbig + rsmall * sp.cos(v))**2, rsmall**2)
GT, giT, RT, RicT, RsT = full_geometry("Torus (u = around z-axis, v = around tube)", gT, [u, v], ['u', 'v'])
KT = S(RsT / 2)
print("    K = R/2 =", KT)
print("    Total curvature int K dA (R>r, sqrt g = r(R + r cos v)) =", S(sp.integrate(sp.integrate(S(KT * rsmall * (Rbig + rsmall * sp.cos(v))), (u, 0, 2 * sp.pi)), (v, 0, 2 * sp.pi))))
print("    Sphere: int K dA = (1/a^2) * 4 pi a^2 =", S(sp.integrate(sp.integrate(sp.sin(th), (th, 0, sp.pi)), (ph, 0, 2 * sp.pi))))

# 5. Cylinder of radius a
full_geometry("Cylinder radius a, coords (phi, z)", sp.diag(a**2, 1), [ph, z], ['ph', 'z'])

# 6. Hyperbolic upper half plane
full_geometry("Hyperbolic upper half-plane ds^2=(dx^2+dy^2)/y^2", sp.diag(1 / y**2, 1 / y**2), [xx, y], ['x', 'y'])

# 7. Rindler (flat, Lorentzian analogue of polar)
full_geometry("Rindler ds^2 = -rho^2 deta^2 + drho^2 (flat)", sp.diag(-rho**2, 1), [eta, rho], ['eta', 'rho'])

# 8. 1+1 FLRW
A = sp.Function('A')(t)
full_geometry("1+1 FLRW ds^2 = -dt^2 + A(t)^2 dx^2", sp.diag(-1, A**2), [t, xx], ['t', 'x'])
H = sp.symbols('H', positive=True)
full_geometry("2D de Sitter ds^2 = -dt^2 + exp(2Ht) dx^2", sp.diag(-1, sp.exp(2 * H * t)), [t, xx], ['t', 'x'], lowered=False)

# 9. 3-sphere
g3 = a**2 * sp.diag(1, sp.sin(chi)**2, sp.sin(chi)**2 * sp.sin(th)**2)
G3, gi3, R3, Ric3, Rs3 = full_geometry("3-sphere radius a (chi, theta, phi)", g3, [chi, th, ph], ['chi', 'th', 'ph'], lowered=False)
print("    Ricci - (2/a^2) g =", S(Ric3 - 2 / a**2 * g3).tolist())

# 10. Signature flip: g -> -g on 1+1 FLRW
print("\n=== Signature flip test (g -> -g) on 1+1 FLRW ===")
gp = sp.diag(-1, A**2)
gm = -gp
Gp, gip = christoffel(gp, [t, xx]); Gm, gim = christoffel(gm, [t, xx])
Rp = riemann(Gp, [t, xx]); Rm = riemann(Gm, [t, xx])
Ricp = ricci(Rp, 2); Ricm = ricci(Rm, 2)
print("    Gammas identical:", all(S(Gp[i][j][k] - Gm[i][j][k]) == 0 for i, j, k in product(range(2), repeat=3)))
print("    R^a_bcd identical:", all(S(Rp[i][j][k][l] - Rm[i][j][k][l]) == 0 for i, j, k, l in product(range(2), repeat=4)))
print("    R_ab identical:", S(Ricp - Ricm) == sp.zeros(2, 2))
print("    R scalar (-+):", rscalar(Ricp, gip), "  R scalar (+-):", rscalar(Ricm, gim))

# 11. General static spherically symmetric 4D metric: Einstein tensor + contracted Bianchi identity
print("\n=== Static spherical 4D metric: contracted Bianchi identity ===")
al = sp.Function('alpha')(r); be = sp.Function('beta')(r)
X4 = [t, r, th, ph]
g4 = sp.diag(-sp.exp(2 * al), sp.exp(2 * be), r**2, r**2 * sp.sin(th)**2)
G4, gi4 = christoffel(g4, X4)
R4 = riemann(G4, X4)
Ric4 = ricci(R4, 4)
Rs4 = rscalar(Ric4, gi4)
Ein = S(Ric4 - Rs4 * g4 / 2)
Eup = S(gi4 * Ein * gi4)
div = [S(sum(sp.diff(Eup[m, nu], X4[m]) for m in range(4))
         + sum(G4[m][m][l] * Eup[l, nu] for m in range(4) for l in range(4))
         + sum(G4[nu][m][l] * Eup[m, l] for m in range(4) for l in range(4))) for nu in range(4)]
print("    nabla_mu G^{mu nu} =", div)
print("    G_tt =", S(Ein[0, 0]))
print("    G_rr =", S(Ein[1, 1]))

# 12. Schwarzschild: Ricci flatness and Kretschmann scalar
print("\n=== Schwarzschild (G=c=1) ===")
f = 1 - 2 * M / r
gs = sp.diag(-f, 1 / f, r**2, r**2 * sp.sin(th)**2)
Gs, gis = christoffel(gs, X4)
Rsch = riemann(Gs, X4)
print("    Ricci =", ricci(Rsch, 4).tolist())
Rl = lower_riem(Rsch, gs)
K = 0
for a1, b1, c1, d1 in product(range(4), repeat=4):
    if Rl[a1][b1][c1][d1] != 0:
        up = sum(gis[a1, a1] * gis[b1, b1] * gis[c1, c1] * gis[d1, d1] for _ in [0])  # metric is diagonal
        K += Rl[a1][b1][c1][d1] ** 2 * up
print("    Kretschmann R_abcd R^abcd =", S(K))
show_gamma(Gs, ['t', 'r', 'th', 'ph'])

# ---------------------------------------------------------------------------
print("\n=== Extrinsic geometry of embedded surfaces ===")


def surface(title, X, p, q):
    Xp = X.diff(p); Xq = X.diff(q)
    E = S(Xp.dot(Xp)); F = S(Xp.dot(Xq)); Gm_ = S(Xq.dot(Xq))
    nrm = Xp.cross(Xq)
    nlen = S(sp.sqrt(S(nrm.dot(nrm))))
    n = nrm / nlen
    L = S(X.diff(p, 2).dot(n)); Mm = S(X.diff(p, q).dot(n)); N = S(X.diff(q, 2).dot(n))
    det1 = S(E * Gm_ - F**2)
    K = S((L * N - Mm**2) / det1)
    Hm = S((E * N - 2 * F * Mm + Gm_ * L) / (2 * det1))
    print(f"  {title}:\n    I: E={E}, F={F}, G={Gm_}\n    II (normal = X_p x X_q / |..|): L={L}, M={Mm}, N={N}\n    K={K}, H={Hm}")
    return K, Hm


s_ = sp.symbols('s', real=True)
surface("Sphere radius a, X=(a sin th cos ph, a sin th sin ph, a cos th)",
        sp.Matrix([a * sp.sin(th) * sp.cos(ph), a * sp.sin(th) * sp.sin(ph), a * sp.cos(th)]), th, ph)
surface("Cylinder radius a, X=(a cos ph, a sin ph, z)", sp.Matrix([a * sp.cos(ph), a * sp.sin(ph), z]), ph, z)
surface("Torus X=((R+r cos v)cos u, (R+r cos v) sin u, r sin v)",
        sp.Matrix([(Rbig + rsmall * sp.cos(v)) * sp.cos(u), (Rbig + rsmall * sp.cos(v)) * sp.sin(u), rsmall * sp.sin(v)]), u, v)
xs, ys = sp.symbols('x y', real=True)
surface("Saddle z = x y", sp.Matrix([xs, ys, xs * ys]), xs, ys)
surface("Paraboloid z = (x^2+y^2)/2", sp.Matrix([xs, ys, (xs**2 + ys**2) / 2]), xs, ys)
surface("Catenoid X=(c cosh(v/c) cos u, c cosh(v/c) sin u, v)",
        sp.Matrix([c * sp.cosh(v / c) * sp.cos(u), c * sp.cosh(v / c) * sp.sin(u), v]), u, v)
surface("Helicoid X=(c sinh(v/c) cos u, c sinh(v/c) sin u, c u)",
        sp.Matrix([c * sp.sinh(v / c) * sp.cos(u), c * sp.sinh(v / c) * sp.sin(u), c * u]), u, v)

# ---------------------------------------------------------------------------
print("\n=== Frenet-Serret ===")


def frenet(title, X, tt, at=None):
    d1 = X.diff(tt); d2 = X.diff(tt, 2); d3 = X.diff(tt, 3)
    cr = d1.cross(d2)
    kap = S(sp.sqrt(S(cr.dot(cr))) / sp.sqrt(S(d1.dot(d1)))**3)
    tau = S(cr.dot(d3) / cr.dot(cr))
    if at is not None:
        kap = S(kap.subs(tt, at)); tau = S(tau.subs(tt, at))
    print(f"  {title}: kappa = {kap}, tau = {tau}")


bb = sp.symbols('b', positive=True)
frenet("Helix (a cos t, a sin t, b t), a>0", sp.Matrix([a * sp.cos(t), a * sp.sin(t), bb * t]).subs(a, sp.Symbol('a', positive=True)), t)
frenet("Twisted cubic (t, t^2, t^3) at t=0", sp.Matrix([t, t**2, t**3]), t, at=0)
frenet("Circle radius 3 in plane", sp.Matrix([3 * sp.cos(t), 3 * sp.sin(t), 0]), t)

# ---------------------------------------------------------------------------
print("\n=== Coordinate transformations: Cartesian <-> polar ===")
X_, Y_ = r * sp.cos(th), r * sp.sin(th)
J = sp.Matrix([[sp.diff(X_, r), sp.diff(X_, th)], [sp.diff(Y_, r), sp.diff(Y_, th)]])  # dx^i/dx'^mu
Jinv = S(J.inv())  # dx'^mu/dx^i
print("    dx^i/dx'^mu =", J.tolist())
print("    dx'^mu/dx^i =", Jinv.tolist())
print("    g'_{mu nu} = J^T J =", S(J.T * J).tolist())
Vcart = sp.Matrix([1, 0])  # V = d/dx
Vpol = S(Jinv * Vcart)
print("    V = d/dx -> (V^r, V^th) =", Vpol.tolist())
wcart = sp.Matrix([[1, 0]])  # omega = dx
wpol = S(wcart * J)
print("    omega = dx -> (w_r, w_th) =", wpol.tolist())
print("    contraction w_mu V^mu (polar) =", S((wpol * Vpol)[0]))
gpol = sp.diag(1, r**2)
print("    V_mu = g_{mu nu} V^nu =", S(gpol * Vpol).tolist(), "; |V|^2 =", S((Vpol.T * gpol * Vpol)[0]))
Gp_, _ = christoffel(gpol, [r, th])
cov = sp.Matrix(2, 2, lambda nu, mu: S(sp.diff(Vpol[nu], [r, th][mu]) + sum(Gp_[nu][mu][l] * Vpol[l] for l in range(2))))
print("    nabla_mu V^nu for V = d/dx in polar (rows nu, cols mu) =", cov.tolist())
pd = sp.Matrix(2, 2, lambda nu, mu: S(sp.diff(Vpol[nu], [r, th][mu])))
print("    naive partials d_mu V^nu =", pd.tolist())
# Position field V = r d_r : divergence
f_ = sp.Function('f')(r, th)
print("    div(r d_r) = (1/sqrt g) d_mu(sqrt g V^mu) =", S(sp.diff(r * r, r) / r))
lap_polar = S(sum(sp.diff(sp.sqrt(gpol.det()) * gpol.inv()[i, i] * sp.diff(f_, [r, th][i]), [r, th][i]) for i in range(2)) / sp.sqrt(gpol.det()))
print("    Laplacian polar =", sp.expand(lap_polar))
# The rank-2 tensor transformation check: T = dx (x) dx
T_cart = sp.Matrix([[1, 0], [0, 0]])
print("    T = dx (x) dx in polar T'_{mu nu} =", S(J.T * T_cart * J).tolist())
# Spherical Jacobian & metric
X3 = sp.Matrix([r * sp.sin(th) * sp.cos(ph), r * sp.sin(th) * sp.sin(ph), r * sp.cos(th)])
J3 = X3.jacobian([r, th, ph])
print("    spherical metric J^T J =", S(J3.T * J3).tolist(), "; det J =", S(J3.det()))

# ---------------------------------------------------------------------------
print("\n=== Lie derivatives and Killing vectors ===")


def lie_metric(xi, g, x):
    n = len(x)
    return sp.Matrix(n, n, lambda m, nn: S(sum(xi[l] * sp.diff(g[m, nn], x[l]) for l in range(n))
                                          + sum(g[l, nn] * sp.diff(xi[l], x[m]) for l in range(n))
                                          + sum(g[m, l] * sp.diff(xi[l], x[nn]) for l in range(n))))


def bracket(X, Y, x):
    n = len(x)
    return [S(sum(X[j] * sp.diff(Y[i], x[j]) - Y[j] * sp.diff(X[i], x[j]) for j in range(n))) for i in range(n)]


xy = [xs, ys]
rot = [-ys, xs]
print("    L_X g (flat plane, X = -y d_x + x d_y) =", lie_metric(rot, sp.eye(2), xy).tolist())
print("    [X, d_x] for X = -y d_x + x d_y =", bracket(rot, [1, 0], xy))
print("    L_X g for dilation X = x d_x + y d_y =", lie_metric([xs, ys], sp.eye(2), xy).tolist())
gS = sp.diag(1, sp.sin(th)**2)
xi1 = [0, 1]
xi2 = [-sp.sin(ph), -sp.cot(th) * sp.cos(ph)]
xi3 = [sp.cos(ph), -sp.cot(th) * sp.sin(ph)]
for nm, xi in [("d_phi", xi1), ("-sin ph d_th - cot th cos ph d_ph", xi2), ("cos ph d_th - cot th sin ph d_ph", xi3)]:
    print(f"    S^2 Killing check L_xi g for xi = {nm}:", lie_metric(xi, gS, [th, ph]).tolist())
print("    [xi2, xi3] =", bracket(xi2, xi3, [th, ph]), " (compare xi1 =", xi1, ")")
print("    [xi3, xi1] =", bracket(xi3, xi1, [th, ph]), " (compare xi2 =", xi2, ")")
print("    [xi1, xi2] =", bracket(xi1, xi2, [th, ph]), " (compare xi3 =", xi3, ")")
eta2 = sp.diag(-1, 1)
print("    Minkowski 1+1 boost xi = x d_t + t d_x: L_xi eta =", lie_metric([xs, t], eta2, [t, xs]).tolist())
print("    Not Killing: xi = t d_t + x d_x (dilation): L_xi eta =", lie_metric([t, xs], eta2, [t, xs]).tolist())
# conserved quantity along sphere geodesic: p_phi = g_{phph} dphi/ds
print("    Killing conserved quantity on S^2: sin^2(th) dph/ds is constant along geodesics (Clairaut)")

# ---------------------------------------------------------------------------
print("\n=== Geodesic checks ===")


def geod_residual(G, x, curve, par):
    n = len(x)
    sub = {x[i]: curve[i] for i in range(n)}
    res = []
    for m in range(n):
        acc = sp.diff(curve[m], par, 2) + sum(G[m][i][j].subs(sub) * sp.diff(curve[i], par) * sp.diff(curve[j], par)
                                                for i in range(n) for j in range(n))
        res.append(S(acc))
    return res


print("    S^2 equator th=pi/2, ph=s/a:", geod_residual(G2, [th, ph], [sp.pi / 2, s_ / a], s_))
th0 = sp.symbols('theta_0', positive=True)
print("    S^2 latitude th=th0, ph=s/(a sin th0):", geod_residual(G2, [th, ph], [th0, s_ / (a * sp.sin(th0))], s_))
print("    S^2 meridian th=s/a, ph=const:", geod_residual(G2, [th, ph], [s_ / a, sp.Integer(1)], s_))
GH, _ = christoffel(sp.diag(1 / y**2, 1 / y**2), [xx, y])
print("    H^2 semicircle x=tanh s, y=sech s:", geod_residual(GH, [xx, y], [sp.tanh(s_), 1 / sp.cosh(s_)], s_))
print("    H^2 vertical line x=0, y=e^s:", geod_residual(GH, [xx, y], [sp.Integer(0), sp.exp(s_)], s_))
GC, _ = christoffel(sp.diag(a**2, 1), [ph, z])
print("    Cylinder helix ph = s/(a sqrt2), z = s/sqrt2:", geod_residual(GC, [ph, z], [s_ / (a * sp.sqrt(2)), s_ / sp.sqrt(2)], s_))
# geodesic deviation on sphere: xi(s) = a sin(s/a) dphi
xi_s = a * sp.sin(s_ / a)
print("    Jacobi eq xi'' + K xi on S^2 (K=1/a^2), xi = a sin(s/a):", S(sp.diff(xi_s, s_, 2) + xi_s / a**2))
print("    Jacobi eq on H^2 (K=-1), xi = sinh s:", S(sp.diff(sp.sinh(s_), s_, 2) - sp.sinh(s_)))

# ---------------------------------------------------------------------------
print("\n=== Parallel transport and holonomy on the unit sphere (numeric, embedded R^3) ===")


def transport(path, V0, steps=20000):
    """path: function t in [0,1] -> point on unit sphere (tuple). Parallel transport: dV/dt = -(V . p') p."""
    def p(tt):
        return path(tt)

    def dp(tt, h=1e-6):
        a1 = p(tt + h); a0 = p(tt - h)
        return [(a1[i] - a0[i]) / (2 * h) for i in range(3)]

    def rhs(tt, V):
        pp = p(tt); d = dp(tt)
        k = sum(V[i] * d[i] for i in range(3))
        return [-k * pp[i] for i in range(3)]

    V = list(V0); hstep = 1.0 / steps; tt = 0.0
    for _ in range(steps):
        k1 = rhs(tt, V)
        k2 = rhs(tt + hstep / 2, [V[i] + hstep / 2 * k1[i] for i in range(3)])
        k3 = rhs(tt + hstep / 2, [V[i] + hstep / 2 * k2[i] for i in range(3)])
        k4 = rhs(tt + hstep, [V[i] + hstep * k3[i] for i in range(3)])
        V = [V[i] + hstep / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]) for i in range(3)]
        tt += hstep
    return V


def angle_between(V0, V1, normal):
    cr = [V0[1] * V1[2] - V0[2] * V1[1], V0[2] * V1[0] - V0[0] * V1[2], V0[0] * V1[1] - V0[1] * V1[0]]
    return math.atan2(sum(cr[i] * normal[i] for i in range(3)), sum(V0[i] * V1[i] for i in range(3)))


for th0d in [30, 45, 60, 90]:
    t0 = math.radians(th0d)
    path = lambda tt, t0=t0: (math.sin(t0) * math.cos(2 * math.pi * tt), math.sin(t0) * math.sin(2 * math.pi * tt), math.cos(t0))
    p0 = path(0)
    V0 = (math.cos(t0), 0.0, -math.sin(t0))  # unit e_theta at phi=0
    V1 = transport(path, V0)
    ang = angle_between(V0, V1, p0)
    cap = 2 * math.pi * (1 - math.cos(t0))
    print(f"    latitude th0={th0d} deg: rotation of transported vector = {math.degrees(ang):.4f} deg;"
          f" cap area/a^2 = 2pi(1-cos th0) = {math.degrees(cap):.4f} deg; (ang - cap) mod 360 = {(math.degrees(ang - cap)) % 360:.4f}")


def slerp(P, Q):
    dot = sum(P[i] * Q[i] for i in range(3)); om = math.acos(max(-1, min(1, dot)))
    return lambda tt: tuple((math.sin((1 - tt) * om) * P[i] + math.sin(tt * om) * Q[i]) / math.sin(om) for i in range(3))


def triangle(Ps):
    legs = [slerp(Ps[i], Ps[(i + 1) % 3]) for i in range(3)]
    return lambda tt: legs[min(int(tt * 3), 2)](tt * 3 - min(int(tt * 3), 2))


def sph_excess(Ps):
    # Girard: area = sum of angles - pi on unit sphere; compute via l'Huilier-free formula (Oosterom & Strackee)
    A_, B_, C_ = Ps
    trip = A_[0] * (B_[1] * C_[2] - B_[2] * C_[1]) - A_[1] * (B_[0] * C_[2] - B_[2] * C_[0]) + A_[2] * (B_[0] * C_[1] - B_[1] * C_[0])
    dots = sum(A_[i] * B_[i] for i in range(3)) + sum(B_[i] * C_[i] for i in range(3)) + sum(C_[i] * A_[i] for i in range(3))
    return 2 * math.atan2(abs(trip), 1 + dots)


for Ps in [((0, 0, 1), (1, 0, 0), (0, 1, 0)),
           ((0, 0, 1), (math.cos(0.3), 0, math.sin(0.3)), (0, math.cos(0.5), math.sin(0.5)))]:
    # transport along legs separately (piecewise) to avoid corner derivative issues
    V = None
    P0 = Ps[0]
    # initial tangent vector at P0 orthogonal to P0
    tmp = (1.0, 0.3, 0.2)
    dd = sum(tmp[i] * P0[i] for i in range(3))
    V0 = [tmp[i] - dd * P0[i] for i in range(3)]
    nn = math.sqrt(sum(q * q for q in V0)); V0 = [q / nn for q in V0]
    V = V0
    for i in range(3):
        V = transport(slerp(Ps[i], Ps[(i + 1) % 3]), V, steps=6000)
    ang = angle_between(V0, V, P0)
    print(f"    geodesic triangle {[tuple(round(q, 3) for q in P) for P in Ps]}: holonomy = {math.degrees(ang):.4f} deg; "
          f"area/a^2 = {math.degrees(sph_excess(Ps)):.4f} deg")

# ---------------------------------------------------------------------------
print("\n=== Lorentz / rotation groups ===")
w1, w2 = sp.symbols('w1 w2', real=True)


def boost(w):
    return sp.Matrix([[sp.cosh(w), sp.sinh(w)], [sp.sinh(w), sp.cosh(w)]])


e2 = sp.diag(-1, 1)
print("    L^T eta L - eta =", S(boost(w1).T * e2 * boost(w1) - e2).tolist())
print("    L(w1)L(w2) - L(w1+w2) =", S((boost(w1) * boost(w2) - boost(w1 + w2)).applyfunc(lambda q: sp.expand(sp.expand_trig(q)))).tolist())
v1, v2 = sp.symbols('v1 v2', real=True)
print("    tanh(atanh v1 + atanh v2) =", S(sp.expand_trig(sp.tanh(sp.atanh(v1) + sp.atanh(v2)))))
# 3+1 generators acting on (t,x,y,z): (J_i)^j_k = -eps_ijk ; (K_i)^0_i = (K_i)^i_0 = 1
Jm = []
for i in range(3):
    m = sp.zeros(4, 4)
    for j in range(3):
        for k in range(3):
            m[j + 1, k + 1] = -sp.LeviCivita(i, j, k)
    Jm.append(m)
Km = []
for i in range(3):
    m = sp.zeros(4, 4); m[0, i + 1] = 1; m[i + 1, 0] = 1; Km.append(m)


def comm(A_, B_):
    return A_ * B_ - B_ * A_


print("    [J1,J2] == J3:", comm(Jm[0], Jm[1]) == Jm[2])
print("    [J1,K2] == K3:", comm(Jm[0], Km[1]) == Km[2])
print("    [K1,K2] == -J3:", comm(Km[0], Km[1]) == -Jm[2])
eta4 = sp.diag(-1, 1, 1, 1)
print("    generators satisfy X^T eta + eta X = 0:", all(S(X_.T * eta4 + eta4 * X_) == sp.zeros(4, 4) for X_ in Jm + Km))
th_ = sp.symbols('vartheta', real=True)
print("    exp(theta J3) =", S((th_ * Jm[2]).exp()).tolist())
print("    exp(w K1) =", S((w1 * Km[0]).exp()).tolist())
sz = sp.Matrix([[1, 0], [0, -1]])
print("    SU(2): exp(-i 2pi sigma_z/2) =", S((-sp.I * 2 * sp.pi * sz / 2).exp()).tolist())
print("    dim so(1,3) = 6, Poincare = 6 + 4 = 10; max Killing vectors n(n+1)/2 for n=2,3,4:", [n * (n + 1) // 2 for n in (2, 3, 4)])

# ---------------------------------------------------------------------------
print("\n=== Riemann tensor independent components (linear algebra count) ===")


def riemann_dim(n):
    idx = {}
    for q in product(range(n), repeat=4):
        idx[q] = len(idx)
    rows = []
    def row(pairs):
        rr = [0] * len(idx)
        for coef, q in pairs:
            rr[idx[q]] += coef
        return rr
    for a1, b1, c1, d1 in product(range(n), repeat=4):
        rows.append(row([(1, (a1, b1, c1, d1)), (1, (b1, a1, c1, d1))]))
        rows.append(row([(1, (a1, b1, c1, d1)), (1, (a1, b1, d1, c1))]))
        rows.append(row([(1, (a1, b1, c1, d1)), (-1, (c1, d1, a1, b1))]))
        rows.append(row([(1, (a1, b1, c1, d1)), (1, (a1, c1, d1, b1)), (1, (a1, d1, b1, c1))]))
    Mx = sp.Matrix(rows)
    return len(idx) - Mx.rank()


for n in (2, 3, 4):
    print(f"    n={n}: independent components = {riemann_dim(n)}; formula n^2(n^2-1)/12 = {n * n * (n * n - 1) // 12}")

# ---------------------------------------------------------------------------
print("\n=== Differential forms ===")
# d(-y dx + x dy) = 2 dx^dy  (component: d_x(w_y) - d_y(w_x))
wx, wy = -ys, xs
print("    d(-y dx + x dy) coefficient of dx^dy:", S(sp.diff(wy, xs) - sp.diff(wx, ys)))
wx2, wy2 = -ys / (xs**2 + ys**2), xs / (xs**2 + ys**2)
print("    d(dtheta) coefficient:", S(sp.diff(wy2, xs) - sp.diff(wx2, ys)))
tt_ = sp.symbols('tt', real=True)
circ = {xs: sp.cos(tt_), ys: sp.sin(tt_)}
loop = sp.integrate(S((wx2 * sp.diff(sp.cos(tt_), tt_) + wy2 * sp.diff(sp.sin(tt_), tt_)).subs(circ)), (tt_, 0, 2 * sp.pi))
print("    loop integral of (x dy - y dx)/(x^2+y^2) around unit circle:", loop)
print("    Stokes: int_disk 2 dA =", 2 * sp.pi, "; loop of (-y dx + x dy) =",
      sp.integrate(S((wx * sp.diff(sp.cos(tt_), tt_) + wy * sp.diff(sp.sin(tt_), tt_)).subs(circ)), (tt_, 0, 2 * sp.pi)))
print("    dx^dy in polar = det(J) dr^dth with det J =", S(J.det()))
# wedge of two 1-forms in R^3 equals cross product components
a1_, a2_, a3_, b1_, b2_, b3_ = sp.symbols('a1 a2 a3 b1 b2 b3')
al_ = [a1_, a2_, a3_]; bl_ = [b1_, b2_, b3_]
wedge = {(i, j): al_[i] * bl_[j] - al_[j] * bl_[i] for i in range(3) for j in range(3) if i < j}
print("    (alpha ^ beta) components dy^dz, dz^dx, dx^dy:", wedge[(1, 2)], ",", -wedge[(0, 2)], ",", wedge[(0, 1)])
# d^2 = 0 check: curl grad = 0, div curl = 0
F_ = sp.Function('F')(xs, ys, z)
grad = [sp.diff(F_, q) for q in (xs, ys, z)]
curl = [sp.diff(grad[2], ys) - sp.diff(grad[1], z), sp.diff(grad[0], z) - sp.diff(grad[2], xs), sp.diff(grad[1], xs) - sp.diff(grad[0], ys)]
print("    curl grad F =", [S(q) for q in curl])
P_, Q_, R_ = [sp.Function(nm)(xs, ys, z) for nm in ('P', 'Q', 'Rf')]
cu = [sp.diff(R_, ys) - sp.diff(Q_, z), sp.diff(P_, z) - sp.diff(R_, xs), sp.diff(Q_, xs) - sp.diff(P_, ys)]
print("    div curl =", S(sp.diff(cu[0], xs) + sp.diff(cu[1], ys) + sp.diff(cu[2], z)))

# ---------------------------------------------------------------------------
print("\n=== Units ===")
GMsun = 1.32712440018e20  # m^3 s^-2 (IAU)
cl = 299792458.0
print(f"    GM_sun/c^2 = {GMsun / cl**2:.4f} m ; GM_sun/c^3 = {GMsun / cl**3 * 1e6:.4f} microseconds")
Gn = 6.67430e-11; hbar = 1.054571817e-34
print(f"    Planck length = {math.sqrt(hbar * Gn / cl**3):.4e} m ; Planck time = {math.sqrt(hbar * Gn / cl**5):.4e} s ; Planck mass = {math.sqrt(hbar * cl / Gn):.4e} kg")
print(f"    Earth GM/c^2 = {3.986004418e14 / cl**2 * 1000:.3f} mm")
print(f"    1 m of length <-> {1 / cl:.4e} s ; 1 kg <-> G/c^2 = {Gn / cl**2:.4e} m")
