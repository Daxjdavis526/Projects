import sympy as sp, numpy as np
x, t, r, R, G, rho, D, s0 = sp.symbols('x t r R G rho D sigma0', positive=True)
# E10-a: eigenfunction expansion of Green's function solution of -u''=1 at x=1/2
val = sum(4*(-1)**((n-1)//2)/(n**3*np.pi**3) for n in range(1, 400001, 2))
print("E10-a series u(1/2) =", val, "(expect 1/8); Dirichlet beta(3) = pi^3/32:", sp.nsimplify(sp.summation((-1)**sp.Symbol('k')/(2*sp.Symbol('k')+1)**3, (sp.Symbol('k'), 0, sp.oo))))
# B2-b uniform sphere interior potential
Phi = 2*sp.pi*G*rho/3*(r**2 - 3*R**2)
print("B2-b Laplacian of Phi =", sp.simplify(sp.diff(r**2*sp.diff(Phi, r), r)/r**2), "; Phi(R) + GM/R =", sp.simplify(Phi.subs(r, R) + G*(4*sp.pi*rho*R**3/3)/R))
# B12-d rarefaction u = x/t solves Burgers
u = x/t; print("B12-d residual u_t + u u_x for u=x/t:", sp.simplify(sp.diff(u, t) + u*sp.diff(u, x)))
# B9-a Gaussian under heat eq: sigma^2 = sigma0^2 + 2Dt
uu = sp.exp(-x**2/(2*(s0**2 + 2*D*t)))/sp.sqrt(s0**2 + 2*D*t)
print("B9-a residual u_t - D u_xx:", sp.simplify(sp.diff(uu, t) - D*sp.diff(uu, x, 2)))
# B4-b string 220 Hz
print("B4-b f1 = c/(2L) with c=286 m/s, L=0.65 m:", 286/(2*0.65), "Hz")
# ISCO and photon sphere in km per solar mass; GM/c^3
GM, c = 1.32712440018e20, 299792458.0
print("GM_sun/c^2 = %.1f m; ISCO 6GM/c^2 = %.2f km; photon sphere 3GM/c^2 = %.2f km; GM_sun/c^3 = %.4f us" % (GM/c**2, 6*GM/c**2/1e3, 3*GM/c**2/1e3, GM/c**3*1e6))
# Tricomi discriminant
y = sp.Symbol('y'); print("B11-b Tricomi B^2-4AC =", 0**2 - 4*y*1)
# Bead on hoop: effective potential check, stability of off-axis equilibrium
th, w, g, Rh, m = sp.symbols('theta omega g R m', positive=True)
Ueff = -m*g*Rh*sp.cos(th) - sp.Rational(1, 2)*m*Rh**2*w**2*sp.sin(th)**2
eq = sp.solve(sp.Eq(sp.diff(Ueff, th), 0), th)
print("G6 hoop dU/dth = 0 solutions:", eq)
thstar = sp.acos(g/(Rh*w**2)); print("   U'' at cos th* = g/(R w^2):", sp.simplify(sp.diff(Ueff, th, 2).subs(th, thstar)), "(>0 when R w^2 > g)")
