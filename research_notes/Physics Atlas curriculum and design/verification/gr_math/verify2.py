#!/usr/bin/env python3
"""Second batch of answer-key checks (same Carroll/MTW (+,+,+) conventions as verify.py)."""
from itertools import product, permutations
import sympy as sp


def S(e):
    return sp.simplify(sp.trigsimp(sp.simplify(e)))


def christoffel(g, x):
    n = len(x); gi = S(g.inv())
    return [[[S(sum(gi[a, d] * (sp.diff(g[d, b], x[c]) + sp.diff(g[d, c], x[b]) - sp.diff(g[b, c], x[d])) for d in range(n)) / 2)
              for c in range(n)] for b in range(n)] for a in range(n)], gi


def riemann(G, x):
    n = len(x)
    return [[[[S(sp.diff(G[a][d][b], x[c]) - sp.diff(G[a][c][b], x[d]) + sum(G[a][c][e] * G[e][d][b] - G[a][d][e] * G[e][c][b] for e in range(n)))
               for d in range(n)] for c in range(n)] for b in range(n)] for a in range(n)]


th, ph, a, s, chi, r = sp.symbols('theta phi a s chi r', positive=True)
dphi = sp.symbols('Delta_phi', positive=True)

# 1. Geodesic deviation on S^2, meridians from the north pole: T = (1/a) d_theta, S = Delta_phi d_phi, theta = s/a
print("=== Geodesic deviation on S^2 (A^mu = R^mu_{nu rho sigma} T^nu T^rho S^sigma) ===")
g = sp.diag(a**2, a**2 * sp.sin(th)**2); X = [th, ph]
G, gi = christoffel(g, X); R = riemann(G, X)
T = [1 / a, sp.Integer(0)]; Sv = [sp.Integer(0), dphi]
path = {th: s / a}


def cov_along(W):  # D W^mu/ds along theta = s/a with tangent T
    return [S(sp.diff(W[m].subs(path), s) + sum(G[m][i][j].subs(path) * T[i] * W[j].subs(path) for i in range(2) for j in range(2)))
            for m in range(2)]


DS = cov_along(Sv)
DDS = cov_along([sp.sympify(q).subs(s, a * th) for q in DS])
rhs = [S(sum(R[m][nu][rh][sg] * T[nu] * T[rh] * Sv[sg] for nu in range(2) for rh in range(2) for sg in range(2)).subs(path)) for m in range(2)]
print("    D S/ds =", DS, "\n    D^2 S/ds^2 =", DDS, "\n    R^mu_{nu rho sigma} T^nu T^rho S^sigma =", rhs)
sep = a * sp.sin(s / a) * dphi
print("    proper separation a sin(s/a) dphi satisfies xi'' = -xi/a^2:", S(sp.diff(sep, s, 2) + sep / a**2) == 0)

# 2. Analytic parallel transport around latitude theta0 (coordinate components)
print("\n=== Parallel transport around latitude theta0 ===")
th0 = sp.symbols('theta_0', positive=True)
Vt, Vp = sp.Function('Vt')(ph), sp.Function('Vp')(ph)
# dV^mu/dphi + Gamma^mu_{phi nu} V^nu = 0 along theta = th0
eq1 = sp.Eq(sp.diff(Vt, ph) + G[0][1][1].subs(th, th0) * Vp, 0)
eq2 = sp.Eq(sp.diff(Vp, ph) + G[1][1][0].subs(th, th0) * Vt, 0)
sol = sp.dsolve([eq1, eq2], [Vt, Vp], ics={Vt.subs(ph, 0): 1, Vp.subs(ph, 0): 0})
print("    ", [S(q.rhs) for q in sol])
print("    orthonormal components (V^th_hat, V^ph_hat) = (V^th, sin(th0) V^ph):",
      [S(sol[0].rhs), S(sp.sin(th0) * sol[1].rhs)], " -> rotates by angle -phi*cos(th0) relative to (e_th, e_ph)")
# Gauss-Bonnet with boundary for the polar cap
kg = S(sp.cos(th0) / (a * sp.sin(th0)))
cap = S(sp.integrate(sp.integrate(1 / a**2 * a**2 * sp.sin(th), (th, 0, th0)), (ph, 0, 2 * sp.pi)))
print("    cap: int K dA =", cap, "; geodesic curvature of latitude k_g = cot(th0)/a ; oint k_g ds =", S(kg * 2 * sp.pi * a * sp.sin(th0)),
      "; sum =", S(cap + kg * 2 * sp.pi * a * sp.sin(th0)), "(= 2 pi chi(disk) = 2 pi)")

# 3. Covariant derivative of the covector dx in polar coordinates vanishes; Gamma^mu_{mu lam} = d_lam ln sqrt g
print("\n=== Covector covariant derivative & divergence identity ===")
gp = sp.diag(1, r**2); Xp = [r, th]
Gp, gip = christoffel(gp, Xp)
w = [sp.cos(th), -r * sp.sin(th)]
nab = sp.Matrix(2, 2, lambda m, n: S(sp.diff(w[n], Xp[m]) - sum(Gp[l][m][n] * w[l] for l in range(2))))
print("    nabla_mu (dx)_nu in polar =", nab.tolist())
gs = sp.diag(1, r**2, r**2 * sp.sin(th)**2); Xs = [r, th, ph]
Gs, _ = christoffel(gs, Xs)
print("    Gamma^mu_{mu lam} - d_lam ln sqrt(g) (spherical):",
      [S(sum(Gs[m][m][l] for m in range(3)) - sp.diff(sp.log(r**2 * sp.sin(th)), Xs[l])) for l in range(3)])
# metric compatibility nabla_lam g_{mu nu} = 0 on S^2
comp = [S(sp.diff(g[m, n], X[l]) - sum(G[k][l][m] * g[k, n] + G[k][l][n] * g[m, k] for k in range(2))) for l, m, n in product(range(2), repeat=3)]
print("    nabla g = 0 on S^2:", all(q == 0 for q in comp))

# 4. Maximal symmetry of S^3: R_{abcd} = (1/a^2)(g_ac g_bd - g_ad g_bc)
print("\n=== Maximal symmetry check on S^3 ===")
g3 = a**2 * sp.diag(1, sp.sin(chi)**2, sp.sin(chi)**2 * sp.sin(th)**2); X3 = [chi, th, ph]
G3, _ = christoffel(g3, X3); R3 = riemann(G3, X3)
ok = True
for A_, B_, C_, D_ in product(range(3), repeat=4):
    low = S(sum(g3[A_, E_] * R3[E_][B_][C_][D_] for E_ in range(3)))
    if S(low - (g3[A_, C_] * g3[B_, D_] - g3[A_, D_] * g3[B_, C_]) / a**2) != 0:
        ok = False
print("    R_abcd == (g_ac g_bd - g_ad g_bc)/a^2 :", ok)

# 5. Cartan's magic formula on R^2 for X = -y d_x + x d_y and omega = x dy (1-form)
print("\n=== Cartan formula L_X w = i_X dw + d(i_X w) ===")
x, y = sp.symbols('x y', real=True)
Xv = [-y, x]; wv = [0, x]   # omega = 0 dx + x dy
lie = [S(sum(Xv[j] * sp.diff(wv[i], [x, y][j]) + wv[j] * sp.diff(Xv[j], [x, y][i]) for j in range(2))) for i in range(2)]
dw = sp.diff(wv[1], x) - sp.diff(wv[0], y)        # coefficient of dx^dy
iXdw = [-Xv[1] * dw, Xv[0] * dw]                   # i_X (f dx^dy) = f (X^x dy - X^y dx)
iXw = Xv[0] * wv[0] + Xv[1] * wv[1]
d_iXw = [sp.diff(iXw, x), sp.diff(iXw, y)]
print("    L_X w =", lie, "; i_X dw + d i_X w =", [S(iXdw[i] + d_iXw[i]) for i in range(2)])

# 6. Hodge star in Minkowski (-,+,+,+), Carroll convention eps_{0123} = +sqrt|g| = +1
print("\n=== Hodge star on 2-forms in Minkowski space ===")
eta = sp.diag(-1, 1, 1, 1)


def eps_low(idx):
    return sp.LeviCivita(*idx)


def eps_mixed(n1, n2, m1, m2):  # eps^{n1 n2}_{m1 m2}
    return eta[n1, n1] * eta[n2, n2] * eps_low((n1, n2, m1, m2))


def hodge2(F):  # F antisymmetric 4x4 lower components
    out = sp.zeros(4, 4)
    for m1, m2 in product(range(4), repeat=2):
        out[m1, m2] = sp.Rational(1, 2) * sum(eps_mixed(n1, n2, m1, m2) * F[n1, n2] for n1 in range(4) for n2 in range(4))
    return out


def basis2(i, j):
    F = sp.zeros(4, 4); F[i, j] = 1; F[j, i] = -1; return F


names = ['t', 'x', 'y', 'z']
for (i, j) in [(0, 1), (2, 3)]:
    H_ = hodge2(basis2(i, j))
    terms = [f"{H_[p, q]} d{names[p]}^d{names[q]}" for p in range(4) for q in range(p + 1, 4) if H_[p, q] != 0]
    print(f"    *(d{names[i]}^d{names[j]}) =", " + ".join(terms))
print("    ** on 2-forms:", hodge2(hodge2(basis2(0, 1))) == -basis2(0, 1), "(expect ** = -1)")

# 7. Lorentz invariants of the field tensor under a boost (verify-a-scalar exercise)
print("\n=== Verify F_{mu nu}F^{mu nu} and the dual invariant are Lorentz scalars ===")
Ex, Ey, Ez, Bx, By, Bz, w_ = sp.symbols('E_x E_y E_z B_x B_y B_z w', real=True)
F = sp.Matrix([[0, -Ex, -Ey, -Ez], [Ex, 0, Bz, -By], [Ey, -Bz, 0, Bx], [Ez, By, -Bx, 0]])  # F_{mu nu}, Carroll-style F_{0i} = -E_i
Fup = eta * F * eta


def inv1(Fl):
    Fu = eta * Fl * eta
    return S(sum(Fl[i, j] * Fu[i, j] for i in range(4) for j in range(4)))


L = sp.Matrix([[sp.cosh(w_), -sp.sinh(w_), 0, 0], [-sp.sinh(w_), sp.cosh(w_), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]])  # Lambda^mu'_nu
Linv = L.inv()
Fprime = S(Linv.T * F * Linv)  # F'_{mu nu} = (Lambda^-1)^a_mu (Lambda^-1)^b_nu F_ab
print("    F_{mu nu}F^{mu nu} =", inv1(F), "; after boost:", inv1(Fprime))
dual = hodge2(F)
print("    F_{mu nu}(*F)^{mu nu} =", S(sum(F[i, j] * (eta * dual * eta)[i, j] for i in range(4) for j in range(4))),
      "; after boost:", S(sum(Fprime[i, j] * (eta * hodge2(Fprime) * eta)[i, j] for i in range(4) for j in range(4))))

# 8. Four-velocity normalisation in both signatures and orthonormal ("physical") vs coordinate components
print("\n=== Signature bookkeeping ===")
v = sp.symbols('v', positive=True)
gam = 1 / sp.sqrt(1 - v**2)
U = sp.Matrix([gam, gam * v, 0, 0])
print("    u.u with (-+++):", S((U.T * eta * U)[0]), " ; with (+---):", S((U.T * (-eta) * U)[0]))
print("    polar: coordinate component V^theta vs orthonormal V^theta_hat = r V^theta (since |d_theta| = r)")

# 9. Pullback / induced metric: sphere metric induced from R^3 and Minkowski light-cone induced metric is degenerate
print("\n=== Induced metrics ===")
Xsph = sp.Matrix([a * sp.sin(th) * sp.cos(ph), a * sp.sin(th) * sp.sin(ph), a * sp.cos(th)])
Js = Xsph.jacobian([th, ph])
print("    induced metric on sphere J^T delta J =", S(Js.T * Js).tolist())
# hyperboloid -t^2 + x^2 + y^2 = -1 parametrised (cosh u, sinh u cos p, sinh u sin p) -> hyperbolic plane metric
u_, p_ = sp.symbols('u p', real=True)
Xh = sp.Matrix([sp.cosh(u_), sp.sinh(u_) * sp.cos(p_), sp.sinh(u_) * sp.sin(p_)])
Jh = Xh.jacobian([u_, p_])
print("    induced metric on hyperboloid in Minkowski 2+1:", S(Jh.T * sp.diag(-1, 1, 1) * Jh).tolist(), "(hyperbolic plane, K = -1)")

# 10. Christoffel symbols are not tensors: zero in Cartesian, nonzero in polar (already shown); transformation law check
print("\n=== Inhomogeneous transformation law of Gamma (Cartesian -> polar) ===")
xc = [r * sp.cos(th), r * sp.sin(th)]
J = sp.Matrix(2, 2, lambda i, m: sp.diff(xc[i], Xp[m]))  # dx^i/dx'^m
Ji = S(J.inv())                                          # dx'^m/dx^i
# Gamma'^l_{mn} = (dx'^l/dx^i)(d^2 x^i / dx'^m dx'^n)  since Cartesian Gamma = 0
Gam = [[[S(sum(Ji[l, i] * sp.diff(xc[i], Xp[m], Xp[n]) for i in range(2))) for n in range(2)] for m in range(2)] for l in range(2)]
print("    Gamma'^r_{th th} =", Gam[0][1][1], "; Gamma'^th_{r th} =", Gam[1][0][1], " (match metric-derived values -r, 1/r)")
