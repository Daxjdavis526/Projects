import numpy as np, sympy as sp, mpmath as mp
from scipy import special as ss
from scipy.optimize import brentq
mp.mp.dps = 30
z, x, t, s = sp.symbols('z x t s')

print("=== COMPLEX: real integrals by residues (mpmath numeric vs closed form) ===")
checks = [
  ("int_R dx/(1+x^2)", lambda: mp.quad(lambda x: 1/(1+x**2), [-mp.inf, mp.inf]), mp.pi),
  ("int_R dx/(1+x^2)^2", lambda: mp.quad(lambda x: 1/(1+x**2)**2, [-mp.inf, mp.inf]), mp.pi/2),
  ("int_R dx/(1+x^4)", lambda: mp.quad(lambda x: 1/(1+x**4), [-mp.inf, mp.inf]), mp.pi/mp.sqrt(2)),
  ("int_R cos x/(1+x^2)", lambda: mp.quadosc(lambda x: mp.cos(x)/(1+x**2), [-mp.inf, mp.inf], omega=1), mp.pi/mp.e),
  ("int_0^2pi dth/(2+cos th)", lambda: mp.quad(lambda th: 1/(2+mp.cos(th)), [0, 2*mp.pi]), 2*mp.pi/mp.sqrt(3)),
  ("int_0^inf sin x/x", lambda: mp.quadosc(lambda x: mp.sin(x)/x, [0, mp.inf], omega=1), mp.pi/2),
  ("int_0^inf dx/(1+x^3)", lambda: mp.quad(lambda x: 1/(1+x**3), [0, mp.inf]), 2*mp.pi/(3*mp.sqrt(3))),
  ("int_0^inf x^(-1/2)/(1+x)", lambda: mp.quad(lambda x: x**-0.5/(1+x), [0, 1, mp.inf]), mp.pi),
]
for name, f, exact in checks:
    v = f(); print(f"{name:28} numeric={mp.nstr(v, 12):>16}  closed={mp.nstr(exact, 12):>16}  diff={mp.nstr(abs(v-exact), 3)}")

print("\nResidues (sympy):")
for expr, pt in [(1/(z**2+1), sp.I), (sp.exp(z)/z**3, 0), (1/(z**4+1), sp.exp(sp.I*sp.pi/4)),
                 (sp.cot(sp.pi*z), 0), (z/(sp.sin(z))**2, sp.pi)]:
    print(f"  Res[{expr}, {pt}] = {sp.simplify(sp.residue(expr, z, pt))}")
thq = np.linspace(0, 2*np.pi, 4001)[:-1]; zq = np.exp(1j*thq)
print("  Res[exp(1/z), 0] (numeric contour /2 pi i) =", np.round(np.mean(np.exp(1/zq)*zq), 12), "(essential singularity; Laurent coeff of 1/z = 1)")
print("Contour integrals: oint_{|z|=2} e^z/(z-1) dz = 2 pi i e ->", sp.simplify(2*sp.pi*sp.I*sp.residue(sp.exp(z)/(z-1), z, 1)))
print("                   oint_{|z|=1} sin z / z^2 dz = 2 pi i * 1 ->", 2*sp.pi*sp.I*sp.residue(sp.sin(z)/z**2, z, 0))
# numerical check of oint conj(z) dz on unit circle
th = np.linspace(0, 2*np.pi, 200001); zz = np.exp(1j*th)
print("oint conj(z) dz over |z|=1 (numeric) =", np.trapezoid(np.conj(zz)*1j*zz, th), " (2 pi i =", 2j*np.pi, ")")
print("oint z^2 dz over |z|=1 (numeric) =", np.round(np.trapezoid(zz**2*1j*zz, th), 12))

print("\nLaurent series of 1/(z(z-1)):")
print("  0<|z|<1 :", sp.series(1/(z*(z-1)), z, 0, 4))
w = sp.symbols('w')
print("  |z|>1 (z=1/w):", sp.series((1/(z*(z-1))).subs(z, 1/w), w, 0, 5), "  [powers of w = 1/z]")
print("sin z / z near 0:", sp.series(sp.sin(z)/z, z, 0, 6), " (removable)")

print("\nCauchy-Riemann checks:")
X, Y = sp.symbols('x y', real=True)
for f in [(X+sp.I*Y)**2, sp.exp(X+sp.I*Y), X - sp.I*Y, X**2 + Y**2]:
    u, v = sp.re(sp.expand_complex(f)), sp.im(sp.expand_complex(f))
    cr1 = sp.simplify(sp.diff(u, X) - sp.diff(v, Y)); cr2 = sp.simplify(sp.diff(u, Y) + sp.diff(v, X))
    print(f"  f={f}: u_x - v_y = {cr1}, u_y + v_x = {cr2}")
print("harmonic conjugate of u = x^2 - y^2: v = 2xy (+C); of u = e^x cos y: v = e^x sin y")

print("\nConformal maps:")
th = np.linspace(0, 2*np.pi, 7)[:-1]; zc = np.exp(1j*th); J = zc + 1/zc
print("  Joukowski z+1/z on |z|=1 ->", np.round(J, 6), " (real, in [-2,2])")
rng = np.random.default_rng(0); zz = rng.normal(size=1000) + 1j*np.abs(rng.normal(size=1000))
print("  Moebius (z-i)/(z+i): max |w| for 1000 random Im z>0 points =", np.max(np.abs((zz-1j)/(zz+1j))))
U, a = 1.0, 1.0; dW = lambda zq: U*(1 - a**2/zq**2)   # W = U(z + a^2/z), velocity = conj(W')
print("  cylinder flow: speed at top z=ia =", abs(dW(1j*a)), "(=2U); stagnation W'(+-a) =", dW(a), dW(-a))
print("  w=z^2 doubles angles at 0: arg((e^{i pi/4})^2) =", np.angle(np.exp(1j*np.pi/4)**2), "= pi/2")

print("\nAnalytic continuation: zeta(-1) =", mp.zeta(-1), "; zeta(2) =", mp.zeta(2), "= pi^2/6 =", mp.pi**2/6)
print("Gamma(-1/2) =", mp.gamma(-0.5), " (= -2 sqrt(pi) =", -2*mp.sqrt(mp.pi), ")")

print("\nRetarded Green's function of x'' + w0^2 x = delta(t) by residues (poles pushed to lower half plane):")
om, w0, tt = sp.symbols('omega omega0 t', positive=True)
integrand = sp.exp(-sp.I*om*tt)/(w0**2 - om**2)
res = sp.residue(integrand, om, w0) + sp.residue(integrand, om, -w0)
G = sp.simplify(-2*sp.pi*sp.I*res/(2*sp.pi))     # close in lower half plane for t>0 (clockwise)
print("  G(t>0) =", sp.simplify(sp.expand_complex(sp.re(G)).rewrite(sp.sin)), "  check: G(0)=", sp.simplify(G.subs(tt, 0)),
      " G'(0)=", sp.simplify(sp.diff(G, tt).subs(tt, 0)))

print("\nQuasinormal mode (Leaver continued fraction, Schwarzschild s=2, l=2, units 2M=1):")
def leaver(omega, l=2, s=2, depth=400):
    rho = -mp.mpc(0, 1)*omega
    a = lambda n: n**2 + (2*rho + 2)*n + 2*rho + 1
    b = lambda n: -(2*n**2 + (8*rho + 2)*n + 8*rho**2 + 4*rho + l*(l+1) - s**2 + 1)
    g = lambda n: n**2 + 4*rho*n + 4*rho**2 - s**2
    frac = 0
    for n in range(depth, 0, -1):
        frac = a(n-1)*g(n)/(b(n) - frac)
    return b(0) - frac
om0 = mp.findroot(lambda w: leaver(w), mp.mpc(0.75, -0.18))
om1 = mp.findroot(lambda w: leaver(w, l=3), mp.mpc(1.2, -0.18))
print('  l=3 fundamental: M omega =', mp.nstr(om1/2, 8))
print("  2M omega =", mp.nstr(om0, 8), " -> M omega =", mp.nstr(om0/2, 8))
print("  eikonal (photon-sphere) estimate M omega ~ (l+1/2)/(3 sqrt3) - i (1/2)/(3 sqrt3) =",
      2.5/(3*np.sqrt(3)), "-", 0.5/(3*np.sqrt(3)), "i")

print("\n=== FOURIER: Gibbs phenomenon for the square wave sign(x) on (-pi, pi) ===")
Si_pi = ss.sici(np.pi)[0]
print("limit of peak = (2/pi) Si(pi) =", 2/np.pi*Si_pi, "; overshoot / jump(2) =", (2/np.pi*Si_pi - 1)/2)
def S(xv, N):  # N odd harmonics
    k = np.arange(N); n = 2*k + 1
    return 4/np.pi*np.sum(np.sin(np.outer(xv, n))/n, axis=1)
def fejer(xv, N):
    # Cesaro mean of partial sums up to harmonic 2N-1: weights (1 - n/(2N+1)) approx; use explicit average
    k = np.arange(N); n = 2*k + 1; M = 2*N + 1
    return 4/np.pi*np.sum(np.sin(np.outer(xv, n))/n*(1 - n/M), axis=1)
for N in [5, 10, 50, 200]:
    xv = np.linspace(1e-6, np.pi/2, 200001)
    sv = S(xv, N) if N <= 50 else S(np.linspace(1e-6, 0.1, 200001), N)
    fv = fejer(xv, N)
    print(f"N={N:4} odd harmonics: peak S_N = {np.max(sv):.6f};  Fejer-weighted peak = {np.max(fv):.6f}; peak location ~ pi/(2N) = {np.pi/(2*N):.4f}")
print("Parseval/Fourier: f=x on (-pi,pi), b_n = 2(-1)^(n+1)/n ->", [sp.integrate(x*sp.sin(n*x), (x, -sp.pi, sp.pi))/sp.pi for n in range(1, 5)],
      "; sum 1/n^2 =", sp.summation(1/sp.Symbol('n', integer=True, positive=True)**2, (sp.Symbol('n', integer=True, positive=True), 1, sp.oo)))
print("FT of exp(-x^2/2) with F(k)=int f e^{-ikx}dx at k=1.3:", mp.quad(lambda x: mp.exp(-x**2/2)*mp.cos(1.3*x), [-mp.inf, mp.inf]),
      " vs sqrt(2pi) e^{-k^2/2} =", mp.sqrt(2*mp.pi)*mp.exp(-1.3**2/2))
print("Laplace: L{sin t} =", sp.laplace_transform(sp.sin(t), t, s, noconds=True),
      "; y''+3y'+2y=0, y(0)=1, y'(0)=0 ->", sp.dsolve(sp.Function('y')(t).diff(t, 2) + 3*sp.Function('y')(t).diff(t) + 2*sp.Function('y')(t),
      ics={sp.Function('y')(0): 1, sp.Function('y')(t).diff(t).subs(t, 0): 0}).rhs)

print("\n=== SPECIAL FUNCTIONS ===")
print("Legendre P2, P3:", sp.expand(sp.legendre(2, x)), "|", sp.expand(sp.legendre(3, x)),
      "; int P3^2 =", sp.integrate(sp.legendre(3, x)**2, (x, -1, 1)), "(2/(2n+1) = 2/7)")
c = [sp.Rational(2*n+1, 2)*sp.integrate(x**2*sp.legendre(n, x), (x, -1, 1)) for n in range(4)]
print("x^2 = sum c_n P_n with c =", c)
tt_ = sp.symbols('h'); gen = sp.series(1/sp.sqrt(1 - 2*x*tt_ + tt_**2), tt_, 0, 4).removeO()
print("generating fn coefficients:", [sp.expand(gen.coeff(tt_, n)) for n in range(4)])
th_, ph_ = sp.symbols('theta phi')
Y10 = sp.sqrt(sp.Rational(3, 4)/sp.pi)*sp.cos(th_)
print("Y00 = 1/(2 sqrt(pi)); int |Y10|^2 dOmega =", sp.integrate(sp.integrate(Y10**2*sp.sin(th_), (th_, 0, sp.pi)), (ph_, 0, 2*sp.pi)))
print("Bessel zeros j_{m,n} (m=0..3, n=1..3):")
for m in range(4):
    print(f"  m={m}:", np.round(ss.jn_zeros(m, 3), 5))
z01 = ss.jn_zeros(0, 1)[0]
modes = sorted([(ss.jn_zeros(m, 3)[n-1], m, n) for m in range(4) for n in range(1, 4)])[:7]
print("drum frequency ratios f_mn/f_01:", [(m, n, round(j/z01, 4)) for j, m, n in modes])
print("Hermite (phys) H0..H3:", [sp.expand(sp.hermite(n, x)) for n in range(4)],
      "; int H3^2 e^{-x^2} =", sp.integrate(sp.hermite(3, x)**2*sp.exp(-x**2), (x, -sp.oo, sp.oo)), "= 2^3 3! sqrt(pi)")
print("Laguerre L0..L2:", [sp.expand(sp.laguerre(n, x)) for n in range(3)])
print("Gamma: G(1/2) =", sp.gamma(sp.Rational(1, 2)), "; G(5/2) =", sp.gamma(sp.Rational(5, 2)), "=", float(sp.gamma(sp.Rational(5, 2))),
      "; unit 4-ball volume pi^2/Gamma(3) =", sp.pi**2/sp.gamma(3))

print("\n=== STURM-LIOUVILLE / VARIATIONAL ===")
r1 = brentq(lambda k: np.tan(k) + k, np.pi/2 + 1e-9, 3*np.pi/2 - 1e-9)
print("y''+lam y=0, y(0)=0, y'(1)+y(1)=0: first sqrt(lam) =", r1, " lam =", r1**2)
yv = x*(1 - x)
R = sp.integrate(sp.diff(yv, x)**2, (x, 0, 1))/sp.integrate(yv**2, (x, 0, 1))
print("Rayleigh quotient with trial x(1-x) for -y''=lam y on [0,1]:", R, ">= pi^2 =", float(sp.pi**2))
g = 9.81
T_cyc = np.pi*np.sqrt(1/g)            # cycloid with a=1 from (0,0) to (pi, -2)
Lline = np.hypot(np.pi, 2); T_line = Lline/np.sqrt(g)  # t = sqrt(2L/(g sin a)), sin a = 2/L -> L/sqrt(g)
print(f"brachistochrone to (pi a, -2a), a=1 m: cycloid {T_cyc:.4f} s vs straight line {T_line:.4f} s")

print("\n=== SPECTRAL vs FINITE DIFFERENCE differentiation of u = e^x sin(5x) on [-1,1] ===")
def cheb(N):
    xg = np.cos(np.pi*np.arange(N+1)/N)
    c = np.hstack([2, np.ones(N-1), 2])*(-1)**np.arange(N+1)
    X = np.tile(xg, (N+1, 1)).T
    dX = X - X.T
    D = np.outer(c, 1/c)/(dX + np.eye(N+1)); D = D - np.diag(D.sum(axis=1))
    return D, xg
u = lambda x: np.exp(x)*np.sin(5*x); du = lambda x: np.exp(x)*(np.sin(5*x) + 5*np.cos(5*x))
for N in [10, 20, 30, 40, 50]:
    D, xg = cheb(N); e_sp = np.max(np.abs(D@u(xg) - du(xg)))
    xe = np.linspace(-1, 1, N+1); h = xe[1]-xe[0]; ue = u(xe)
    fd = np.empty_like(ue); fd[1:-1] = (ue[2:] - ue[:-2])/(2*h)
    fd[0] = (-3*ue[0] + 4*ue[1] - ue[2])/(2*h); fd[-1] = (3*ue[-1] - 4*ue[-2] + ue[-3])/(2*h)
    print(f"N={N:3}: Chebyshev max error = {e_sp:.2e};  2nd-order FD max error = {np.max(np.abs(fd - du(xe))):.2e}")
