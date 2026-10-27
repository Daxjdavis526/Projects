import sympy as sp, numpy as np
x, t, y, c, k, lam = sp.symbols('x t y c k lambda', real=True)
f = sp.Function('f')
checks = {
 "u=exp(-(x-2t)^2) solves u_t+2u_x=0": (lambda u: sp.simplify(sp.diff(u,t)+2*sp.diff(u,x)))(sp.exp(-(x-2*t)**2)),
 "u=f(x e^-t) solves u_t + x u_x = 0": (lambda u: sp.simplify(sp.diff(u,t)+x*sp.diff(u,x)))(f(x*sp.exp(-t))),
 "u=f(y e^-x) solves u_x + y u_y = 0": (lambda u: sp.simplify(sp.diff(u,x)+y*sp.diff(u,y)))(f(y*sp.exp(-x))),
 "u=e^{-lam t} f(x-ct) solves u_t + c u_x = -lam u": (lambda u: sp.simplify(sp.diff(u,t)+c*sp.diff(u,x)+lam*u))(sp.exp(-lam*t)*f(x-c*t)),
 "d'Alembert (f(x-ct)+f(x+ct))/2 solves u_tt=c^2u_xx": (lambda u: sp.simplify(sp.diff(u,t,2)-c**2*sp.diff(u,x,2)))((f(x-c*t)+f(x+c*t))/2),
}
tp = sp.Symbol('t', positive=True); Dp = sp.Symbol('D', positive=True)
K = sp.exp(-x**2/(4*Dp*tp))/sp.sqrt(4*sp.pi*Dp*tp)
checks["heat kernel solves u_t = D u_xx"] = sp.simplify(sp.diff(K,tp) - Dp*sp.diff(K,x,2))
checks["heat kernel integrates to 1"] = sp.simplify(sp.integrate(K,(x,-sp.oo,sp.oo)) - 1)
r = sp.Symbol('r', positive=True)
checks["-1/(4 pi r) is harmonic for r>0 (radial Laplacian)"] = sp.simplify(sp.diff(r**2*sp.diff(-1/(4*sp.pi*r), r), r)/r**2)
checks["ln r is harmonic in 2D (radial Laplacian)"] = sp.simplify(sp.diff(r*sp.diff(sp.log(r), r), r)/r)
for kk, v in checks.items(): print(f"{kk}: residual = {v}")
z = sp.Symbol('z')
print("e^{i pi} =", sp.exp(sp.I*sp.pi), "; (1+i)^8 =", sp.expand((1+sp.I)**8), "; |3+4i| =", sp.Abs(3+4*sp.I), "; arg(1+i) =", sp.arg(1+sp.I))
print("cube roots of unity:", sp.solve(z**3-1, z), "; sum =", sp.simplify(sum(sp.solve(z**3-1, z))))
print("i^i =", sp.N(sp.I**sp.I), "(principal value e^{-pi/2} =", sp.N(sp.exp(-sp.pi/2)), ")")
print("Log(-1) principal =", sp.log(-1), "; sqrt(z) has a branch point at 0: sqrt(e^{i(2pi-1e-9)}) =", np.sqrt(np.exp(1j*(2*np.pi-1e-9))), "vs sqrt(e^{i 1e-9}) =", np.sqrt(np.exp(1j*1e-9)))
# string modes and wave energy conservation check (exact standing wave)
L_, cc = sp.symbols('L c', positive=True); n = sp.Symbol('n', integer=True, positive=True)
u = sp.sin(n*sp.pi*x/L_)*sp.cos(n*sp.pi*cc*t/L_)
E = sp.integrate((sp.diff(u,t)**2 + cc**2*sp.diff(u,x)**2)/2, (x, 0, L_))
print("standing-wave energy (should be t-independent):", sp.simplify(E))
print("string frequencies f_n = n c/(2L): n=1..3 ->", [sp.Rational(k_,2) for k_ in (1,2,3)], "x c/L")
