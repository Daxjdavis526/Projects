import math
import sympy as sp
u, v, a, s, al = sp.symbols('u v a s alpha', real=True)
R, r, c = sp.symbols('R r c', positive=True)
def S(e): return sp.simplify(sp.trigsimp(sp.simplify(e)))
# 1. K for orthogonal coordinates: K = -1/(2 sqrt(EG)) [ d_u(G_u/sqrt(EG)) + d_v(E_v/sqrt(EG)) ]
def K_orth(E, G, x1, x2):
    W = sp.sqrt(E*G)
    return S(-(sp.diff(sp.diff(G, x1)/W, x1) + sp.diff(sp.diff(E, x2)/W, x2))/(2*W))
print("K_orth torus:", K_orth((R + r*sp.cos(v))**2, r**2, u, v))
y = sp.symbols('y', positive=True); x = sp.symbols('x', real=True)
print("K_orth hyperbolic half-plane:", K_orth(1/y**2, 1/y**2, x, y))
th = sp.symbols('theta', positive=True)
print("K_orth sphere (theta,phi):", K_orth(a**2, a**2*sp.sin(th)**2, th, u))
# 2. Associate family helicoid -> catenoid (c = 1): first fundamental form independent of alpha, H = 0
X = sp.cos(al)*sp.Matrix([sp.sinh(v)*sp.sin(u), -sp.sinh(v)*sp.cos(u), u]) + sp.sin(al)*sp.Matrix([sp.cosh(v)*sp.cos(u), sp.cosh(v)*sp.sin(u), v])
Xu, Xv = X.diff(u), X.diff(v)
E, F, G = S(Xu.dot(Xu)), S(Xu.dot(Xv)), S(Xv.dot(Xv))
n = Xu.cross(Xv); n = n/sp.sqrt(S(n.dot(n)))
L, M, N = S(X.diff(u, 2).dot(n)), S(X.diff(u, v).dot(n)), S(X.diff(v, 2).dot(n))
print("associate family I:", E, F, G, "| K =", S((L*N - M**2)/(E*G - F**2)), "| H =", S((E*N - 2*F*M + G*L)/(2*(E*G - F**2))))
# 3. Bertrand-Diguet-Puiseux on sphere: C(rho) = 2 pi a sin(rho/a)
rho = sp.symbols('rho', positive=True)
print("sphere geodesic circle circumference series:", sp.series(2*sp.pi*a*sp.sin(rho/a), rho, 0, 5))
# 4. Acceleration in polar coordinates from Christoffels: a^mu = x''^mu + Gamma^mu_{ab} x'^a x'^b
t = sp.symbols('t'); rr = sp.Function('r')(t); tt = sp.Function('theta')(t)
ar = sp.diff(rr, t, 2) + (-rr)*sp.diff(tt, t)**2
ath = sp.diff(tt, t, 2) + 2*(1/rr)*sp.diff(rr, t)*sp.diff(tt, t)
print("a^r =", ar, "; a^theta =", ath, "; orthonormal a^theta_hat = r a^theta =", sp.expand(rr*ath))
# 5. Clairaut / Killing conserved quantity along a tilted great circle on the unit sphere
for inc in [0.3, 1.0]:
    vals = []
    for k in range(1, 6):
        ss = 0.37*k
        p = (math.cos(ss), math.sin(ss)*math.cos(inc), math.sin(ss)*math.sin(inc))
        dp = (-math.sin(ss), math.cos(ss)*math.cos(inc), math.cos(ss)*math.sin(inc))
        # xi = d_phi = (-y, x, 0); conserved g(xi, dp/ds) = -y*dx + x*dy = sin^2(theta) dphi/ds
        vals.append(-p[1]*dp[0] + p[0]*dp[1])
    print(f"   tilt {inc}: sin^2(th) dphi/ds along geodesic =", [round(q, 12) for q in vals], " cos(tilt) =", round(math.cos(inc), 12))
# 6. Newtonian tidal tensor for Phi = -GM/r at (r0,0,0): relative acceleration = -d_i d_j Phi xi^j
X1, X2, X3, GM, r0 = sp.symbols('x1 x2 x3 GM r0', positive=True)
Phi = -GM/sp.sqrt(X1**2 + X2**2 + X3**2)
Hs = sp.Matrix(3, 3, lambda i, j: sp.diff(Phi, [X1, X2, X3][i], [X1, X2, X3][j])).subs({X1: r0, X2: 0, X3: 0})
print("tidal matrix -d_i d_j Phi at (r0,0,0):", S(-Hs).tolist(), "; trace:", S(-Hs.trace()))
# 7. Cone half-angle alpha: unrolled sector angle 2 pi sin(alpha) -> deficit
for deg in (30, 60, 90):
    al_ = math.radians(deg)
    print(f"   cone half-angle {deg} deg: sector angle = {math.degrees(2*math.pi*math.sin(al_)):.1f} deg, holonomy/deficit = {math.degrees(2*math.pi*(1-math.sin(al_))):.1f} deg")
# 8. Schwarzschild Kretschmann at horizon
M = sp.symbols('M', positive=True)
print("Kretschmann at r=2M:", sp.simplify(48*M**2/(2*M)**6))
