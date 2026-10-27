"""Symbolic verification of the GR formulas used in the Physics Atlas GR pathway notes.
Conventions: signature (-,+,+,+), Christoffel Gamma^l_{mn} = 1/2 g^{ls}(d_m g_ns + d_n g_ms - d_s g_mn),
Riemann R^r_{smn} = d_m Gamma^r_{ns} - d_n Gamma^r_{ms} + Gamma^r_{ml} Gamma^l_{ns} - Gamma^r_{nl} Gamma^l_{ms}
(Carroll convention), Ricci R_{mn} = R^l_{mln}, G = c = 1 unless stated.
"""
import sympy as sp

def christoffel(g, X):
    n = len(X)
    ginv = sp.simplify(g.inv())
    Gam = [[[0]*n for _ in range(n)] for _ in range(n)]
    for l in range(n):
        for m in range(n):
            for k in range(n):
                s = 0
                for q in range(n):
                    s += ginv[l, q]*(sp.diff(g[k, q], X[m]) + sp.diff(g[m, q], X[k]) - sp.diff(g[m, k], X[q]))
                Gam[l][m][k] = sp.simplify(s/2)
    return Gam

def riemann(Gam, X, simp=True):
    n = len(X)
    R = [[[[0]*n for _ in range(n)] for _ in range(n)] for _ in range(n)]
    for r in range(n):
        for s in range(n):
            for m in range(n):
                for k in range(n):
                    expr = sp.diff(Gam[r][k][s], X[m]) - sp.diff(Gam[r][m][s], X[k])
                    for l in range(n):
                        expr += Gam[r][m][l]*Gam[l][k][s] - Gam[r][k][l]*Gam[l][m][s]
                    R[r][s][m][k] = sp.simplify(expr) if simp else expr
    return R

def ricci(R, n, simp=True):
    Ric = sp.zeros(n, n)
    for m in range(n):
        for k in range(n):
            e = sum(R[l][m][l][k] for l in range(n))
            Ric[m, k] = sp.simplify(e) if simp else e
    return Ric

def full(g, X, simp=True):
    Gam = christoffel(g, X)
    R = riemann(Gam, X, simp)
    Ric = ricci(R, len(X), simp)
    ginv = sp.simplify(g.inv())
    Rs = sp.simplify(sum(ginv[i, j]*Ric[i, j] for i in range(len(X)) for j in range(len(X))))
    G = sp.simplify(Ric - Rs*g/2)
    return Gam, R, Ric, Rs, G

out = []
def rep(label, val):
    out.append(f"{label}: {val}")
    print(f"{label}: {val}", flush=True)

# ---------- 1. flat polar coordinates ----------
r, th, ph, t = sp.symbols('r theta phi t', positive=True)
g = sp.diag(1, r**2)
Gam = christoffel(g, [r, th])
rep("Polar Gamma^r_thth", Gam[0][1][1]); rep("Polar Gamma^th_rth", Gam[1][0][1])
_, R, Ric, Rs, _ = full(g, [r, th])
rep("Polar Ricci scalar (flat => 0)", Rs)
# divergence of V=(r,0) in polar coords: (1/sqrt g) d_r(sqrt g V^r) with sqrt g = r
rep("Polar divergence of V^r=r", sp.simplify(sp.diff(r*r, r)/r))
# covariant derivative of the constant Cartesian field e_x written in polar components
Vr, Vth = sp.cos(th), -sp.sin(th)/r
X = [r, th]; V = [Vr, Vth]
cov = [[sp.simplify(sp.diff(V[nu], X[mu]) + sum(Gam[nu][mu][l]*V[l] for l in range(2))) for nu in range(2)] for mu in range(2)]
rep("Polar nabla_mu V^nu for constant e_x (all zero)", cov)

# ---------- 2. 2-sphere radius a ----------
a = sp.symbols('a', positive=True)
g = sp.diag(a**2, a**2*sp.sin(th)**2)
Gam, R, Ric, Rs, G = full(g, [th, ph])
rep("Sphere Gamma^th_phph", Gam[0][1][1]); rep("Sphere Gamma^ph_thph", Gam[1][0][1])
# lower R^th_{ph th ph} -> R_{th ph th ph}
rep("Sphere R_{th ph th ph} minus a^2 sin^2(theta) (should be 0)", sp.simplify(sp.expand_trig(g[0, 0]*R[0][1][0][1] - a**2*sp.sin(th)**2)))
rep("Sphere Ricci scalar", Rs); rep("Sphere Einstein tensor (2D => 0)", G)

# 3-sphere
chi = sp.symbols('chi', positive=True)
g3 = sp.diag(a**2, a**2*sp.sin(chi)**2, a**2*sp.sin(chi)**2*sp.sin(th)**2)
_, _, _, Rs3, _ = full(g3, [chi, th, ph])
rep("3-sphere Ricci scalar", Rs3)

# ---------- 3. Schwarzschild ----------
M = sp.symbols('M', positive=True)
f = 1 - 2*M/r
g = sp.diag(-f, 1/f, r**2, r**2*sp.sin(th)**2)
X = [t, r, th, ph]
Gam, R, Ric, Rs, G = full(g, X)
rep("Schw Gamma^r_tt", sp.factor(Gam[1][0][0])); rep("Schw Gamma^t_tr", sp.factor(Gam[0][0][1]))
rep("Schw Gamma^r_rr", sp.factor(Gam[1][1][1])); rep("Schw Gamma^r_thth", sp.factor(Gam[1][2][2]))
rep("Schw Ricci tensor (vacuum => 0)", Ric)
# Kretschmann
ginv = g.inv()
Rdown = [[[[sp.simplify(sum(g[i, l]*R[l][j][k][m] for l in range(4))) for m in range(4)] for k in range(4)] for j in range(4)] for i in range(4)]
Rup = [[[[sp.simplify(sum(ginv[j, jj]*ginv[k, kk]*ginv[m, mm]*R[i][jj][kk][mm] for jj in range(4) for kk in range(4) for mm in range(4))) for m in range(4)] for k in range(4)] for j in range(4)] for i in range(4)]
K = sp.simplify(sum(Rdown[i][j][k][m]*Rup[i][j][k][m] for i in range(4) for j in range(4) for k in range(4) for m in range(4)))
rep("Schw Kretschmann", K)
# radial tidal component in static orthonormal frame: R^rhat_{that rhat that} = -2M/r^3
Rtrtr = sp.simplify(R[1][0][1][0])  # R^r_{t r t}
rep("Schw R^r_{trt} (coordinate)", sp.factor(Rtrtr))
rep("Schw R^rhat_{that rhat that} = R^r_trt / f  (orthonormal)", sp.simplify(Rtrtr/f))
Rthtth = sp.simplify(R[2][0][2][0])
rep("Schw R^thhat_{that thhat that} (orthonormal)", sp.simplify(Rthtth/f))

# ---------- 4. FLRW ----------
k = sp.symbols('k')
A = sp.Function('A')(t)
g = sp.diag(-1, A**2/(1 - k*r**2), A**2*r**2, A**2*r**2*sp.sin(th)**2)
Gam, R, Ric, Rs, G = full(g, X)
rep("FLRW G_tt", sp.simplify(G[0, 0]))
rep("FLRW G^r_r", sp.simplify(G[1, 1]/g[1, 1]))
rep("FLRW Ricci scalar", sp.simplify(Rs))
# Friedmann check: G_tt = 8 pi rho, G^r_r = 8 pi p  (+ Lambda terms: G_mn + L g_mn)
rho, p, Lam = sp.symbols('rho p Lambda')
adot = sp.diff(A, t); addot = sp.diff(A, t, 2)
eq1 = sp.Eq(sp.simplify(G[0, 0] - Lam), 8*sp.pi*rho)  # G_tt + Lam g_tt = 8 pi T_tt (g_tt=-1)
eq2 = sp.Eq(sp.simplify(G[1, 1]/g[1, 1] + Lam), 8*sp.pi*p)
rho_sol = sp.solve(eq1, rho)[0]; p_sol = sp.solve(eq2, p)[0]
rep("FLRW rho from 00 eq", sp.simplify(rho_sol))
# acceleration eq: addot/a = -(4pi/3)(rho+3p) + Lam/3
rep("FLRW check acceleration eq (should be 0)", sp.simplify(addot/A - (-(sp.Rational(4, 3)*sp.pi)*(rho_sol + 3*p_sol) + Lam/3)))
# continuity: d(rho)/dt + 3 H (rho + p) = 0 identically (Bianchi)
rep("FLRW continuity identity (should be 0)", sp.simplify(sp.diff(rho_sol, t) + 3*adot/A*(rho_sol + p_sol)))

# ---------- 5. Morris-Thorne wormhole (Phi = 0) ----------
b = sp.Function('b')(r)
g = sp.diag(-1, 1/(1 - b/r), r**2, r**2*sp.sin(th)**2)
Gam, R, Ric, Rs, G = full(g, X)
Gmix = sp.simplify(g.inv()*G)  # G^m_n
rho_wh = sp.simplify(-Gmix[0, 0]/(8*sp.pi))   # T^t_t = -rho
pr_wh = sp.simplify(Gmix[1, 1]/(8*sp.pi))
pt_wh = sp.simplify(Gmix[2, 2]/(8*sp.pi))
rep("MT rho", rho_wh); rep("MT p_r", pr_wh); rep("MT p_t", pt_wh)
rep("MT rho + p_r", sp.simplify(rho_wh + pr_wh))
# Ellis/Bronnikov: b = r0^2/r
r0 = sp.symbols('r0', positive=True)
sub = {b: r0**2/r}
ell_rho = sp.simplify(rho_wh.subs(sp.Derivative(b, r), sp.diff(r0**2/r, r)).subs(b, r0**2/r))
ell_pr = sp.simplify(pr_wh.subs(b, r0**2/r))
rep("Ellis rho", ell_rho); rep("Ellis p_r", ell_pr); rep("Ellis rho+p_r", sp.simplify(ell_rho + ell_pr))
# integrated energy on one side: int rho * 4 pi r^2 dr / sqrt(1-b/r), r0..inf
integrand = sp.simplify(ell_rho*4*sp.pi*r**2/sp.sqrt(1 - r0**2/r**2))
E_side = sp.integrate(integrand, (r, r0, sp.oo))
rep("Ellis integrated energy one side (G=c=1)", sp.simplify(E_side))

# Alcubierre check moved to symbolic_checks2.py (concrete tanh profile)
x, y, z = sp.symbols('x y z', real=True)
# ---------- 7. Painleve-Gullstrand form is vacuum ----------
Tp = sp.symbols('T')
g = sp.Matrix([[-(1 - 2*M/r), sp.sqrt(2*M/r), 0, 0], [sp.sqrt(2*M/r), 1, 0, 0], [0, 0, r**2, 0], [0, 0, 0, r**2*sp.sin(th)**2]])
_, _, RicPG, _, _ = full(g, [Tp, r, th, ph])
rep("Painleve-Gullstrand Ricci (vacuum => 0)", sp.simplify(RicPG))

# ---------- 8. ingoing Eddington-Finkelstein light cone: dv=0 and dr/dv=(1-2M/r)/2 ----------
v = sp.symbols('v')
rep("IEF outgoing null slope dr/dv", sp.simplify((1 - 2*M/r)/2))

# ---------- 9. Brill-Lindquist / isotropic Schwarzschild: conformal factor is flat-harmonic ----------
m1, m2, d = sp.symbols('m1 m2 d', positive=True)
psi = 1 + m1/(2*sp.sqrt(x**2 + y**2 + (z - d)**2)) + m2/(2*sp.sqrt(x**2 + y**2 + (z + d)**2))
lap = sp.simplify(sp.diff(psi, x, 2) + sp.diff(psi, y, 2) + sp.diff(psi, z, 2))
rep("Brill-Lindquist flat Laplacian of psi (=0 away from punctures)", lap)

# ---------- 10. weak-field static metric: Gamma^i_tt -> d_i Phi ----------
Phi = sp.Function('Phi')(x, y, z)
eps = sp.symbols('epsilon')
g = sp.diag(-(1 + 2*eps*Phi), 1 - 2*eps*Phi, 1 - 2*eps*Phi, 1 - 2*eps*Phi)
GamW = christoffel(g, [t, x, y, z])
rep("Weak field Gamma^x_tt to O(eps)", sp.series(GamW[1][0][0], eps, 0, 2).removeO())
# geodesic: d2x/dt2 = -Gamma^x_tt (slow motion) => -dPhi/dx

# ---------- 11. linearised point mass: hbar_00 = 4M/r solves Laplace outside ----------
rr = sp.sqrt(x**2 + y**2 + z**2)
h00bar = 4*M/rr
rep("Laplacian of 4M/r (=0 off source)", sp.simplify(sum(sp.diff(h00bar, q, 2) for q in (x, y, z))))
# trace-reverse: hbar = diag(4M/r,0,0,0); h = hbar - 1/2 eta hbar_trace, trace hbar = eta^{mn} hbar_mn = -4M/r
hb_tr = -4*M/rr
h00 = h00bar - sp.Rational(1, 2)*(-1)*hb_tr
hxx = 0 - sp.Rational(1, 2)*(1)*hb_tr
rep("Linearised h_00, h_xx from hbar_00=4M/r", (sp.simplify(h00), sp.simplify(hxx)))

# ---------- 12. Schwarzschild effective potential ----------
L, E = sp.symbols('L E', positive=True)
Veff = sp.Rational(1, 2) - M/r + L**2/(2*r**2) - M*L**2/r**3  # massive, eps=1
dV = sp.diff(Veff, r)
circ = sp.solve(sp.Eq(dV, 0), r)
rep("Circular orbit radii (massive)", circ)
L2isco = sp.solve(sp.discriminant(sp.numer(sp.together(dV*r**4)), r), L)
rep("L at which circular orbits merge (ISCO)", L2isco)
risco = [sp.simplify(c.subs(L, 2*sp.sqrt(3)*M)) for c in circ]
rep("ISCO radius for L=2sqrt3 M", risco)
Vn = -M/r*0 + L**2/(2*r**2) - M*L**2/r**3  # massless eps=0
rep("Photon sphere radius", sp.solve(sp.Eq(sp.diff(Vn, r), 0), r))
# energy and angular momentum per unit mass for circular orbits
Ecirc = (1 - 2*M/r)/sp.sqrt(1 - 3*M/r); Lcirc = sp.sqrt(M*r)/sp.sqrt(1 - 3*M/r)
rep("E at ISCO", sp.nsimplify(sp.simplify(Ecirc.subs(r, 6*M))))
rep("L at ISCO", sp.simplify(Lcirc.subs(r, 6*M)))
rep("Marginally bound circular orbit (E=1) radius", sp.solve(sp.Eq(Ecirc**2, 1), r))
# check the circular-orbit E,L reproduce dV=0 and E^2/2 = V
rep("check dV=0 for circular L", sp.simplify(dV.subs(L, Lcirc)))
rep("check E^2/2 = V for circular orbit", sp.simplify(Ecirc**2/2 - Veff.subs(L, Lcirc)))
# dtau/dt on circular geodesic
rep("dtau/dt circular", sp.simplify(sp.sqrt(1 - 3*M/r)))
# photon-sphere critical impact parameter b_c = L/E for photons at r=3M: b^2 = r^2/(1-2M/r)
rep("Critical impact parameter b_c", sp.simplify(sp.sqrt((3*M)**2/(1 - 2*M/(3*M)))))

# ---------- 13. Kerr horizons, ergosphere, frame dragging ----------
aK = sp.symbols('a', positive=True)
Delta = r**2 - 2*M*r + aK**2
rep("Kerr horizons", sp.solve(sp.Eq(Delta, 0), r))
Sigma = r**2 + aK**2*sp.cos(th)**2
gtt = -(1 - 2*M*r/Sigma)
rep("Kerr ergosurface (g_tt=0)", sp.solve(sp.Eq(gtt*Sigma, 0), r))

with open('/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/gr/symbolic_results.txt', 'w') as fh:
    fh.write("\n".join(out))
print("DONE")
