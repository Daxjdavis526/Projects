import numpy as np, sympy as sp, math, sys
from scipy.integrate import solve_ivp
from scipy.stats import norm, chi2
from scipy.linalg import lu, cholesky, qr, svd, hilbert

print("=== F1. Floating point ===")
print("eps(double) =", np.finfo(float).eps, "= 2^-52 =", 2.0**-52, "; eps(float32) =", np.finfo(np.float32).eps)
print("0.1 + 0.2 =", repr(0.1 + 0.2), "; == 0.3 ?", 0.1 + 0.2 == 0.3, "; 1 + 2^-53 == 1 ?", 1 + 2.0**-53 == 1)
print("max double =", sys.float_info.max, "; min normal =", sys.float_info.min)
print("decimal expansion of 0.1 as stored: %.55f" % 0.1)
xv = 1e-8
print("(1-cos x)/x^2 at x=1e-8:", (1 - math.cos(xv))/xv**2, "; stable 2 sin^2(x/2)/x^2:", 2*math.sin(xv/2)**2/xv**2)
a, b, c = 1.0, -1e8, 1.0
naive = (-b - math.sqrt(b*b - 4*a*c))/(2*a); q = -0.5*(b - math.sqrt(b*b - 4*a*c)); stable = c/q
print(f"x^2 - 1e8 x + 1 = 0 small root: naive {naive:.10e}, stable {stable:.10e} (true ~1.0000000000e-08)")
s32f = np.float32(0); s32b = np.float32(0)
for n in range(1, 10**6 + 1): s32f += np.float32(1.0/n**2)
for n in range(10**6, 0, -1): s32b += np.float32(1.0/n**2)
print(f"float32 sum_(n<=1e6) 1/n^2: forward {s32f:.8f}, backward {s32b:.8f}, true {np.pi**2/6 - 1e-6:.8f}")

print("\n=== F2. Finite-difference derivative of sin at x=1: truncation vs rounding ===")
for h in [1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12]:
    fwd = (math.sin(1 + h) - math.sin(1))/h; cen = (math.sin(1 + h) - math.sin(1 - h))/(2*h)
    print(f"h={h:.0e}: forward err {abs(fwd - math.cos(1)):.2e}   central err {abs(cen - math.cos(1)):.2e}")
hs = np.logspace(-14, -1, 1301)
fe = np.abs((np.sin(1 + hs) - np.sin(1))/hs - np.cos(1)); ce = np.abs((np.sin(1 + hs) - np.sin(1 - hs))/(2*hs) - np.cos(1))
print(f"best forward h ~ {hs[np.argmin(fe)]:.1e} (err {fe.min():.1e});  best central h ~ {hs[np.argmin(ce)]:.1e} (err {ce.min():.1e})")
print("theory: h_opt ~ sqrt(eps) =", math.sqrt(2.2e-16), "; ~ eps^(1/3) =", 2.2e-16**(1/3))

print("\n=== F3. Interpolation: Runge function 1/(1+25x^2) ===")
f = lambda x: 1/(1 + 25*x**2); xf = np.linspace(-1, 1, 20001)
def bary(xn, yn, xe):
    w = np.array([1/np.prod(xn[j] - np.delete(xn, j)) for j in range(len(xn))])
    num = np.zeros_like(xe); den = np.zeros_like(xe); exact = np.zeros(len(xe), bool)
    for j in range(len(xn)):
        d = xe - xn[j]; m = d == 0; exact |= m; d[m] = 1
        num += w[j]*yn[j]/d; den += w[j]/d
    out = num/den
    for j in range(len(xn)): out[xe == xn[j]] = yn[j]
    return out
for n in [10, 20, 40]:
    xe_ = np.linspace(-1, 1, n+1); xc = np.cos(np.pi*np.arange(n+1)/n)
    print(f"degree {n}: equispaced max err = {np.max(np.abs(bary(xe_, f(xe_), xf) - f(xf))):.3e}; Chebyshev max err = {np.max(np.abs(bary(xc, f(xc), xf) - f(xf))):.3e}")

print("\n=== F4. Quadrature of int_0^1 e^x dx = e - 1 ===")
ex = math.e - 1
def trap(n): x = np.linspace(0, 1, n+1); y = np.exp(x); return (y[0]/2 + y[1:-1].sum() + y[-1]/2)/n
def simp(n): x = np.linspace(0, 1, n+1); y = np.exp(x); return (y[0] + 4*y[1:-1:2].sum() + 2*y[2:-1:2].sum() + y[-1])/(3*n)
for n in [4, 8, 16, 32]:
    print(f"n={n:3}: trapezoid {trap(n):.10f} (err {abs(trap(n)-ex):.3e}), Simpson {simp(n):.10f} (err {abs(simp(n)-ex):.3e})")
print("observed orders: trapezoid", [round(math.log2(abs(trap(n)-ex)/abs(trap(2*n)-ex)), 3) for n in [4, 8, 16]],
      " Simpson", [round(math.log2(abs(simp(n)-ex)/abs(simp(2*n)-ex)), 3) for n in [4, 8, 16]])
R = (4*trap(8) - trap(4))/3
print(f"Richardson on trapezoid (4T(h/2)-T(h))/3 with n=4,8: {R:.10f} (err {abs(R-ex):.3e}) == Simpson n=8: {simp(8):.10f}")
for npts in [1, 2, 3, 4]:
    xg, wg = np.polynomial.legendre.leggauss(npts); val = 0.5*np.sum(wg*np.exp(0.5*(xg + 1)))
    print(f"Gauss-Legendre {npts}-pt: {val:.12f} (err {abs(val-ex):.2e})")
xg, wg = np.polynomial.legendre.leggauss(2); print("2-pt Gauss nodes = +-1/sqrt(3) =", xg, "; exact for x^3 on [-1,1]?", np.sum(wg*xg**3), "and x^2:", np.sum(wg*xg**2), "(2/3)")

print("\n=== F5. Root finding ===")
xk = 1.0; its = []
for k in range(5): xk = xk - (xk*xk - 2)/(2*xk); its.append(xk)
print("Newton x^2=2 from 1:", [f"{v:.16f}" for v in its])
print("errors:", [f"{abs(v - math.sqrt(2)):.1e}" for v in its])
lo, hi = 1.0, 2.0
for k in range(20): mid = (lo + hi)/2; (lo, hi) = (mid, hi) if mid*mid < 2 else (lo, mid)
print("bisection 20 steps bracket width:", hi - lo, "= 2^-20")
Mm, e = 1.0, 0.5; E = Mm
for k in range(6): E = E - (E - e*math.sin(E) - Mm)/(1 - e*math.cos(E))
print(f"Kepler M=1, e=0.5: E = {E:.10f}; residual {E - e*math.sin(E) - Mm:.1e}")
for x0 in [1.3, 1.39, 1.40, 1.5]:
    xk = x0
    for k in range(8): xk = xk - math.atan(xk)*(1 + xk*xk)
    print(f"Newton on arctan(x) from x0={x0}: after 8 steps x = {xk:.3e}")
crit = sp.nsolve(2*sp.Symbol('x') - (1 + sp.Symbol('x')**2)*sp.atan(sp.Symbol('x')), 1.39)
print("critical |x0| for arctan Newton divergence:", crit)
# secant order
x0, x1 = 1.0, 2.0; errs = []
for k in range(7):
    x2 = x1 - (x1*x1 - 2)*(x1 - x0)/((x1*x1 - 2) - (x0*x0 - 2)); x0, x1 = x1, x2; errs.append(abs(x2 - math.sqrt(2)))
p_est = [math.log(errs[i+1]/errs[i])/math.log(errs[i]/errs[i-1]) for i in range(1, 5)]
print("secant observed orders:", [round(v, 3) for v in p_est], " golden ratio =", (1 + 5**0.5)/2)

print("\n=== F6. Linear algebra ===")
A = np.array([[2., 1.], [4., 3.]]); P, L, U = lu(A); print("LU of [[2,1],[4,3]] (scipy pivots): P=", P.tolist(), "L=", L.tolist(), "U=", U.tolist())
print("   without pivoting by hand: L=[[1,0],[2,1]], U=[[2,1],[0,1]]; check L@U =", (np.array([[1,0],[2,1]])@np.array([[2,1],[0,1]])).tolist())
print("Cholesky of [[4,2],[2,3]]: L =", cholesky(np.array([[4., 2.], [2., 3.]]), lower=True).tolist(), "(sqrt2 =", 2**0.5, ")")
Q, Rr = qr(np.array([[3., 1.], [4., 2.]])); print("QR of [[3,1],[4,2]]: R =", np.round(Rr, 6).tolist(), "; |R00| = 5")
Us, sv, Vt = svd(np.array([[3., 0.], [4., 5.]])); print("SVD of [[3,0],[4,5]]: sigma =", sv, " = (3 sqrt5, sqrt5) =", 3*5**0.5, 5**0.5, "; cond =", sv[0]/sv[-1])
for n in [4, 8, 12]: print(f"cond(Hilbert {n}) = {np.linalg.cond(hilbert(n)):.2e}")
B = np.array([[2., 1.], [1., 2.]]); v = np.array([1., 0.]); ests = []
for k in range(8): v = B@v; v /= np.linalg.norm(v); ests.append(v@B@v)
print("power iteration Rayleigh estimates:", [round(x, 8) for x in ests], "-> 3; error ratio ~ (1/3)^2 per step")
N = 50; h = 1/(N+1); Lap = (np.diag(2*np.ones(N)) - np.diag(np.ones(N-1), 1) - np.diag(np.ones(N-1), -1))/h**2
ev = np.sort(np.linalg.eigvalsh(Lap))[:3]; print("discrete -d2/dx2 on [0,1], N=50: lowest eigenvalues", ev, "vs (n pi)^2 =", [(k*np.pi)**2 for k in (1, 2, 3)])
xd = np.array([0., 1, 2, 3, 4]); yd = np.array([1.1, 2.9, 5.2, 7.1, 8.8])
coef, res, rk, svals = np.linalg.lstsq(np.vstack([xd, np.ones(5)]).T, yd, rcond=None); print("least squares line through lab data:", coef)

print("\n=== F7. ODE stability ===")
R4 = lambda zz: 1 + zz + zz**2/2 + zz**3/6 + zz**4/24
from scipy.optimize import brentq
print("RK4 real-axis limit: h*lambda >=", -brentq(lambda xx: abs(R4(-xx)) - 1, 2, 3.5))
print("RK4 imag-axis limit: h*omega <=", brentq(lambda yy: abs(R4(1j*yy)) - 1, 2, 3.0), " (2 sqrt2 =", 2*2**0.5, ")")
print("explicit Euler y'=-10y stable iff h <= 0.2; |1+h lam| at h=0.21:", abs(1 - 0.21*10))
for meth in ["RK45", "Radau"]:
    sol = solve_ivp(lambda t, y: -1000*(y - np.cos(t)), (0, 1), [0.0], method=meth, rtol=1e-6, atol=1e-9)
    print(f"stiff y'=-1000(y-cos t) with {meth}: {sol.t.size - 1} steps")
def kepler(t, y):
    r3 = (y[0]**2 + y[1]**2)**1.5; return [y[2], y[3], -y[0]/r3, -y[1]/r3]
ecc = 0.9; y0 = [1 - ecc, 0, 0, math.sqrt((1 + ecc)/(1 - ecc))]
sol = solve_ivp(kepler, (0, 2*np.pi), y0, method="RK45", rtol=1e-9, atol=1e-12)
dts = np.diff(sol.t); rr = np.hypot(sol.y[0], sol.y[1])
print(f"adaptive RK45 on e=0.9 Kepler orbit: {dts.size} steps, max/min step = {dts.max()/dts.min():.1f}; r range {rr.min():.3f}-{rr.max():.3f}")
print("orbit-closure error after one period:", np.hypot(sol.y[0, -1] - y0[0], sol.y[1, -1] - y0[1]))

print("\n=== G1. Proof / analysis keys ===")
n = sp.Symbol('n', integer=True, positive=True); k = sp.Symbol('k', integer=True, positive=True)
print("sum k = ", sp.factor(sp.summation(k, (k, 1, n))), "; sum k^3 =", sp.factor(sp.summation(k**3, (k, 1, n))), "; sum (2k-1) =", sp.factor(sp.summation(2*k - 1, (k, 1, n))))
fr = [sp.Rational(1)]
for i in range(4): fr.append(sp.nsimplify((fr[-1] + 2/fr[-1])/2))
print("Newton rationals ->sqrt2:", fr, "; |q^2 - 2|:", [abs(q**2 - 2) for q in fr])
print("x^n on [0,1]: sup|x^n - limit| = 1 for all n (sup over [0,1)); at x = 1 - 1/n: (1-1/n)^n ->", [round((1 - 1/m)**m, 4) for m in (10, 100, 1000)], "-> 1/e")
xx = sp.Symbol('x', positive=True)
In = sp.integrate(n*xx*sp.exp(-n*xx**2), (xx, 0, 1)); print("int_0^1 n x e^{-n x^2} dx =", sp.simplify(In), "-> limit", sp.limit(In, n, sp.oo), "but pointwise limit of integrand is 0")
eps_ = 1e-3
print("eps-delta: lim_{x->2} x^2 = 4 with delta=min(1, eps/5): worst |x^2-4| for |x-2|<delta =", (2 + min(1, eps_/5))**2 - 4, "<", eps_)

print("\n=== G2. Functional analysis keys ===")
X = sp.Symbol('x')
ip = lambda f, g, a=-1, b=1: sp.integrate(f*g, (X, a, b))
basis = [sp.Integer(1), X, X**2]; ortho = []
for v in basis:
    w_ = v - sum(ip(v, e)/ip(e, e)*e for e in ortho); ortho.append(sp.expand(w_))
print("Gram-Schmidt {1,x,x^2} on [-1,1]:", ortho, "(prop. to P0, P1, P2)")
print("||sin|| in L2[-pi,pi] = ", sp.sqrt(sp.integrate(sp.sin(X)**2, (X, -sp.pi, sp.pi))), "; <sin,cos> =", sp.integrate(sp.sin(X)*sp.cos(X), (X, -sp.pi, sp.pi)))
print("d/dx unbounded: ||d/dx e^{inx}|| / ||e^{inx}|| = n (e.g. n = 1, 10, 100)")
Xm = np.random.default_rng(1).normal(size=(5, 5)); Pm = np.random.default_rng(2).normal(size=(5, 5))
print("trace of any finite commutator [X,P] =", np.trace(Xm@Pm - Pm@Xm), " (but tr(i hbar I) != 0 => no finite-dim CCR)")
# projection / best approximation: cos(pi x/2)... show Fourier partial sums minimise L2 error
print("Bessel/Parseval: sum_{n odd} (4/(n pi))^2 * pi =", float(sum((4/(m*np.pi))**2*np.pi for m in range(1, 200001, 2))), "= ||sign||^2 = 2 pi =", 2*np.pi)

print("\n=== G3. Probability & statistics keys ===")
prev, sens, fp = 0.01, 0.99, 0.05
print("Bayes rare disease: P(D|+) =", prev*sens/(prev*sens + (1 - prev)*fp))
for kz in [1, 2, 3]: print(f"P(|Z|<{kz}) = {norm.cdf(kz) - norm.cdf(-kz):.5f}")
print("one-sided p at 5 sigma =", norm.sf(5), "; 5.1 sigma =", norm.sf(5.1), "; two-sided 5 sigma =", 2*norm.sf(5))
print("chi2 95% critical value, 10 dof:", chi2.ppf(0.95, 10))
vals = np.array([9.79, 9.83, 9.78, 9.85, 9.81]); print("lab g: mean", vals.mean(), "std", vals.std(ddof=1), "standard error", vals.std(ddof=1)/np.sqrt(5))
m1, s1, m2, s2 = 9.80, 0.02, 9.84, 0.04; wm = (m1/s1**2 + m2/s2**2)/(1/s1**2 + 1/s2**2); ws = (1/s1**2 + 1/s2**2)**-0.5
print("weighted mean of 9.80+-0.02 and 9.84+-0.04:", wm, "+-", ws)
# matched filter toy in white Gaussian noise
rng = np.random.default_rng(42); fs = 1024; tt = np.arange(0, 2, 1/fs)
tmpl = np.sin(2*np.pi*(30*tt + 20*tt**2))*np.exp(-((tt - 1)/0.4)**2)
sigma = 1.0; A = 0.15
rho_opt = A*np.sqrt(np.sum(tmpl**2))/sigma
outs = []
for trial in range(2000):
    data = A*tmpl + rng.normal(0, sigma, tt.size)
    outs.append(np.sum(data*tmpl)/(sigma*np.sqrt(np.sum(tmpl**2))))
print(f"matched filter: optimal SNR = {rho_opt:.3f}; mean filter output over 2000 noise draws = {np.mean(outs):.3f}, std = {np.std(outs):.3f} (expect 1)")
print(f"   per-sample amplitude/noise = {A/sigma} yet SNR = {rho_opt:.1f}: SNR grows like sqrt(number of cycles/samples)")
# Bayesian amplitude posterior (flat prior): mean = <d,h>/<h,h>, sd = sigma/||h||
data = A*tmpl + rng.normal(0, sigma, tt.size)
Agrid = np.linspace(-0.2, 0.5, 7001); logL = -0.5*np.array([np.sum((data - a*tmpl)**2) for a in Agrid])/sigma**2
post = np.exp(logL - logL.max()); post /= np.trapezoid(post, Agrid)
mean = np.trapezoid(Agrid*post, Agrid); sd = np.sqrt(np.trapezoid((Agrid - mean)**2*post, Agrid))
print(f"posterior on A: mean {mean:.4f}, sd {sd:.4f}; analytic sd sigma/||h|| = {sigma/np.sqrt(np.sum(tmpl**2)):.4f}; analytic mean {np.sum(data*tmpl)/np.sum(tmpl**2):.4f}")

print("\n=== G4. Variational keys ===")
from sympy.calculus.euler import euler_equations
tq = sp.Symbol('t'); q = sp.Function('q')(tq); m_, k_ = sp.symbols('m k', positive=True)
print("EL for L = m qdot^2/2 - k q^2/2:", euler_equations(m_*q.diff(tq)**2/2 - k_*q**2/2, q, tq))
yv = sp.Function('y')(X); print("EL for arclength sqrt(1+y'^2):", sp.simplify(euler_equations(sp.sqrt(1 + yv.diff(X)**2), yv, X)[0]))
th_ = sp.Function('theta')(tq); ph_ = sp.Function('phi')(tq)
Ls = (th_.diff(tq)**2 + sp.sin(th_)**2*ph_.diff(tq)**2)/2
print("sphere geodesic EL:", [sp.simplify(e) for e in euler_equations(Ls, [th_, ph_], tq)])
# Schwarzschild geodesic Lagrangian -> conserved E and L as Noether charges (cyclic t, phi)
Ms = sp.Symbol('M', positive=True); tf, rf, pf = [sp.Function(nm)(sp.Symbol('tau')) for nm in ('t', 'r', 'phi')]; tau = sp.Symbol('tau')
Lag = sp.Rational(1, 2)*(-(1 - 2*Ms/rf)*tf.diff(tau)**2 + rf.diff(tau)**2/(1 - 2*Ms/rf) + rf**2*pf.diff(tau)**2)
print("dL/d(tdot) =", sp.simplify(sp.diff(Lag, tf.diff(tau))), "(= -E);  dL/d(phidot) =", sp.diff(Lag, pf.diff(tau)), "(= L)")
# Jacobi identity: d sqrt(-g) = -1/2 sqrt(-g) g_mn d g^mn, finite-difference check on random Lorentzian metric
rng = np.random.default_rng(3); Gm = np.diag([-1., 1, 1, 1]) + 0.1*(lambda S: S + S.T)(rng.normal(size=(4, 4)))
Ginv = np.linalg.inv(Gm); dGinv = 1e-7*(lambda S: S + S.T)(rng.normal(size=(4, 4)))
sq = lambda g: np.sqrt(-np.linalg.det(g))
lhs = sq(np.linalg.inv(Ginv + dGinv)) - sq(Gm); rhs = -0.5*sq(Gm)*np.sum(Gm*dGinv)
print(f"delta sqrt(-g): finite difference {lhs:.6e} vs -1/2 sqrt(-g) g_mn dg^mn {rhs:.6e}")

print("\n=== G5. Constrained dynamics keys ===")
mm, gg, ll = sp.symbols('m g l', positive=True); th = sp.Function('theta')(tq); lam = sp.Symbol('lambda')
# pendulum in Cartesian with multiplier: tension = m g cos th + m l thdot^2 (from radial Newton eq)
T = mm*gg*sp.cos(th) + mm*ll*th.diff(tq)**2
print("pendulum tension from multiplier (radial eq):", T)
print("  released from horizontal at rest: thdot^2 at bottom = 2g/l -> T_bottom = 3 m g:", sp.simplify(T.subs(th.diff(tq)**2, 2*gg/ll).subs(th, 0).subs(sp.cos(0), 1)))
wv, Rv = sp.symbols('omega R', positive=True)
print("bead on rotating hoop: equilibria sin th (R w^2 cos th - g) = 0 -> cos th* = g/(R w^2), exists iff w^2 > g/R")
print("Dirac counting: EM phase space per point 8 (A_mu, pi^mu), 2 first-class constraints -> (8 - 2*2)/2 =", (8 - 4)//2, "DOF")
print("                GR ADM phase space 12 (gamma_ij, pi^ij), 4 first-class constraints -> (12 - 2*4)/2 =", (12 - 8)//2, "DOF")
print("                GR incl. lapse/shift 20 dims, 8 first-class constraints -> (20 - 16)/2 =", (20 - 16)//2, "DOF")
