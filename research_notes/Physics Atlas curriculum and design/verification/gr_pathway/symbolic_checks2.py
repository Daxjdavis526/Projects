import sympy as sp
import importlib.util, sys
spec = importlib.util.spec_from_file_location("sc", "/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/gr/gr_toolkit.py")

def christoffel(g, X, simp=True):
    n = len(X)
    ginv = g.inv()
    if simp:
        ginv = sp.simplify(ginv)
    Gam = [[[0]*n for _ in range(n)] for _ in range(n)]
    for l in range(n):
        for m in range(n):
            for k in range(n):
                s = 0
                for q in range(n):
                    s += ginv[l, q]*(sp.diff(g[k, q], X[m]) + sp.diff(g[m, q], X[k]) - sp.diff(g[m, k], X[q]))
                Gam[l][m][k] = sp.simplify(s/2) if simp else s/2
    return Gam

def einstein_numeric(g, X, point):
    """Return G_{mn} and g^{mn} evaluated numerically at point (dict), computing derivatives symbolically
    but substituting numbers before any simplification."""
    n = len(X)
    ginv = g.inv()
    # first derivatives of metric
    dg = [[[sp.diff(g[a, b], X[c]) for c in range(n)] for b in range(n)] for a in range(n)]
    # Christoffels symbolic (unsimplified)
    Gam = [[[sum(ginv[l, q]*(dg[k][q][m] + dg[m][q][k] - dg[m][k][q]) for q in range(n))/2 for k in range(n)] for m in range(n)] for l in range(n)]
    # Riemann needs derivative of Gamma: do it symbolically then substitute
    num = lambda e: sp.N(e.subs(point), 25)
    GamN = [[[num(Gam[l][m][k]) for k in range(n)] for m in range(n)] for l in range(n)]
    dGamN = [[[[num(sp.diff(Gam[l][m][k], X[c])) for c in range(n)] for k in range(n)] for m in range(n)] for l in range(n)]
    Ric = sp.zeros(n, n)
    for m in range(n):
        for k in range(n):
            s = 0
            for l in range(n):
                # R^l_{m l k} = d_l Gam^l_{k m} - d_k Gam^l_{l m} + Gam^l_{l q} Gam^q_{k m} - Gam^l_{k q} Gam^q_{l m}
                s += dGamN[l][k][m][l] - dGamN[l][l][m][k]
                for q in range(n):
                    s += GamN[l][l][q]*GamN[q][k][m] - GamN[l][k][q]*GamN[q][l][m]
            Ric[m, k] = s
    gN = g.subs(point).evalf(25)
    ginvN = gN.inv()
    Rs = sum(ginvN[i, j]*Ric[i, j] for i in range(n) for j in range(n))
    G = Ric - Rs*gN/2
    return G, ginvN, Ric

out = []
def rep(label, val):
    out.append(f"{label}: {val}"); print(f"{label}: {val}", flush=True)

r, th, ph, t = sp.symbols('r theta phi t', positive=True)
a = sp.symbols('a', positive=True)
rep("Sphere R_thphthph trigsimp of a^2(sin2th/(2tan th) - cos2th)", sp.trigsimp(a**2*(sp.sin(2*th)/(2*sp.tan(th)) - sp.cos(2*th))))

# ---------- Alcubierre with concrete top-hat ----------
x, y, z = sp.symbols('x y z', real=True)
vs, sig, Rb = sp.Rational(3, 2), sp.Integer(3), sp.Integer(1)
rs = sp.sqrt((x - vs*t)**2 + y**2 + z**2)
f = (sp.tanh(sig*(rs + Rb)) - sp.tanh(sig*(rs - Rb)))/(2*sp.tanh(sig*Rb))
g = sp.Matrix([[-1 + vs**2*f**2, -vs*f, 0, 0], [-vs*f, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]])
X = [t, x, y, z]
for P in [{t: sp.Rational(1, 3), x: sp.Rational(7, 10), y: sp.Rational(2, 5), z: sp.Rational(-3, 10)},
          {t: sp.Rational(0), x: sp.Rational(9, 10), y: sp.Rational(1, 2), z: sp.Rational(1, 5)}]:
    G, ginvN, _ = einstein_numeric(g, X, P)
    Gtt_up = sum(ginvN[0, i]*ginvN[0, j]*G[i, j] for i in range(4) for j in range(4))
    s = sp.symbols('s')
    fs = (sp.tanh(sig*(s + Rb)) - sp.tanh(sig*(s - Rb)))/(2*sp.tanh(sig*Rb))
    rsv = sp.sqrt((P[x] - vs*P[t])**2 + P[y]**2 + P[z]**2)
    fp = sp.diff(fs, s).subs(s, rsv)
    closed = -(vs**2/4)*((P[y]**2 + P[z]**2)/rsv**2)*fp**2
    rep(f"Alcubierre G^tt numeric at {P}", sp.N(Gtt_up, 15))
    rep(f"Alcubierre closed form -(v^2/4)(rho^2/rs^2)f'^2 at {P}", sp.N(closed, 15))

# ---------- Schwarzschild effective potential (rest) ----------
M, L = sp.symbols('M L', positive=True)
Veff = sp.Rational(1, 2) - M/r + L**2/(2*r**2) - M*L**2/r**3
dV = sp.diff(Veff, r)
circ = sp.solve(sp.Eq(dV, 0), r)
rep("ISCO radius for L=2sqrt3 M", [sp.simplify(c.subs(L, 2*sp.sqrt(3)*M)) for c in circ])
Vn = L**2/(2*r**2) - M*L**2/r**3
rep("Photon sphere radius", sp.solve(sp.Eq(sp.diff(Vn, r), 0), r))
Ecirc = (1 - 2*M/r)/sp.sqrt(1 - 3*M/r); Lcirc = sp.sqrt(M*r)/sp.sqrt(1 - 3*M/r)
rep("E at ISCO", sp.radsimp(sp.simplify(Ecirc.subs(r, 6*M))))
rep("L at ISCO", sp.simplify(Lcirc.subs(r, 6*M)))
rep("Marginally bound circular orbit radius (E=1)", sp.solve(sp.Eq((1 - 2*M/r)**2, 1 - 3*M/r), r))
rep("check dV=0 for circular L", sp.simplify(dV.subs(L, Lcirc)))
rep("check E^2/2 = V for circular orbit", sp.simplify(Ecirc**2/2 - Veff.subs(L, Lcirc)))
rep("Critical impact parameter b_c (photon sphere)", sp.simplify(sp.sqrt((3*M)**2/(1 - sp.Rational(2, 3)))))
rep("Efficiency 1 - E_isco", sp.N(1 - sp.sqrt(sp.Rational(8, 9)), 6))

# ---------- Kerr ----------
aK = sp.symbols('a', positive=True)
Delta = r**2 - 2*M*r + aK**2
rep("Kerr horizons", sp.solve(sp.Eq(Delta, 0), r))
Sigma = r**2 + aK**2*sp.cos(th)**2
rep("Kerr ergosurface roots of r^2 - 2Mr + a^2 cos^2(th)", sp.solve(sp.Eq(r**2 - 2*M*r + aK**2*sp.cos(th)**2, 0), r))
# Kerr metric in Boyer-Lindquist (G=c=1) and numeric vacuum check
gK = sp.zeros(4, 4)
gK[0, 0] = -(1 - 2*M*r/Sigma)
gK[0, 3] = gK[3, 0] = -2*M*aK*r*sp.sin(th)**2/Sigma
gK[1, 1] = Sigma/Delta
gK[2, 2] = Sigma
gK[3, 3] = (r**2 + aK**2 + 2*M*r*aK**2*sp.sin(th)**2/Sigma)*sp.sin(th)**2
XK = [t, r, th, ph]
P = {M: 1, aK: sp.Rational(9, 10), r: sp.Rational(37, 10), th: sp.Rational(7, 10)}
G, ginvN, Ric = einstein_numeric(gK, XK, P)
rep("Kerr Ricci max |component| at test point (should be ~0)", max(abs(sp.N(Ric[i, j])) for i in range(4) for j in range(4)))
# equivalence of the two common g_phiphi forms
alt = ((r**2 + aK**2)**2 - aK**2*Delta*sp.sin(th)**2)*sp.sin(th)**2/Sigma
rep("Kerr g_phiphi forms agree", sp.simplify(gK[3, 3] - alt) == 0)
# frame dragging angular velocity omega = -g_tphi/g_phiphi at horizon equals a/(r+^2+a^2) = a/(2 M r+)
rplus = M + sp.sqrt(M**2 - aK**2)
omega = sp.simplify(-gK[0, 3]/gK[3, 3])
rep("Kerr omega_H check (should be 0)", sp.simplify((omega.subs(r, rplus) - aK/(2*M*rplus)).subs({M: 1, aK: sp.Rational(9, 10), th: sp.Rational(1, 3)})))
# Kerr reduces to Schwarzschild for a=0
rep("Kerr a->0 g_tt, g_rr", (sp.simplify(gK[0, 0].subs(aK, 0)), sp.simplify(gK[1, 1].subs(aK, 0))))

# ---------- FLRW metric as written in notes with c: check Friedmann symbols using sympy units-free ----------
with open('/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/gr/symbolic_results2.txt', 'w') as fh:
    fh.write("\n".join(out))
print("DONE")
