import numpy as np
import sympy as sp
from scipy.linalg import expm

print("=== 1. Burgers u_t + u u_x = 0: breaking time t* = -1/min u0'(xi) ===")
xi = np.linspace(-6, 6, 2_000_001)
for name, u0, du0 in [("exp(-x^2)", lambda x: np.exp(-x**2), lambda x: -2*x*np.exp(-x**2)),
                      ("sin x", np.sin, np.cos),
                      ("-tanh x", lambda x: -np.tanh(x), lambda x: -1/np.cosh(x)**2)]:
    i = np.argmin(du0(xi)); ts = -1/du0(xi)[i]
    print(f"{name:10}: t* = {ts:.6f} at xi* = {xi[i]:.5f}; break location x = xi* + u0(xi*) t* = {xi[i] + u0(xi[i])*ts:.5f}")
print("   sqrt(e/2) =", np.sqrt(np.e/2), " sqrt(2) =", np.sqrt(2))

print("\n=== 2. Riemann problem u_L=1, u_R=0: conservative vs non-conservative upwind ===")
N = 400; x = np.linspace(-1, 3, N, endpoint=False); dx = x[1]-x[0]; dt = 0.4*dx; T = 2.0
u_c = np.where(x < 0, 1.0, 0.0); u_n = u_c.copy()
for n in range(int(round(T/dt))):
    f = 0.5*u_c**2
    u_c[1:] = u_c[1:] - dt/dx*(f[1:] - f[:-1])          # conservative upwind (u >= 0)
    u_n[1:] = u_n[1:] - dt/dx*u_n[1:]*(u_n[1:] - u_n[:-1])  # non-conservative upwind
shock_c = x[np.argmax(u_c < 0.5)]; shock_n = x[np.argmax(u_n < 0.5)]
print(f"exact shock at t=2: x = 0 + s t = 1.0 (s = (uL+uR)/2 = 0.5)")
print(f"conservative scheme: x_shock ~ {shock_c:.3f};  non-conservative scheme: x_shock ~ {shock_n:.3f}")

print("\n=== 3. Separation of variables answer keys ===")
print("heat u_t=u_xx on [0,pi], u0 = sin x + 3 sin 2x: u(pi/2, 1) = e^-1 =", np.exp(-1))
# unit square Laplace, u=1 on top, 0 elsewhere; centre value by series
s = sum(4/(n*np.pi)*np.sin(n*np.pi/2)*np.sinh(n*np.pi/2)/np.sinh(n*np.pi) for n in range(1, 200, 2))
print("square, top=1: centre value series =", s, "(symmetry argument: 1/4)")
print("top = sin(pi x): u(1/2,1/2) = sinh(pi/2)/sinh(pi) =", np.sinh(np.pi/2)/np.sinh(np.pi))
xs, ys = sp.symbols('x y');
print("disk, u(1,th)=cos^2 th -> u = 1/2 + r^2 cos(2th)/2; centre = 1/2 = boundary mean:",
      sp.integrate(sp.cos(xs)**2, (xs, 0, 2*sp.pi))/(2*sp.pi))
# Green's function for -u'' = f, u(0)=u(1)=0
xx, ss = sp.symbols('x s', positive=True)
G = sp.Piecewise((xx*(1-ss), xx < ss), (ss*(1-xx), True))
u = sp.integrate(ss*(1-xx), (ss, 0, xx)) + sp.integrate(xx*(1-ss), (ss, xx, 1))
print("Green's fn solution of -u''=1:", sp.factor(u), " max at 1/2 =", u.subs(xx, sp.Rational(1, 2)))

print("\n=== 4. Jacobi / Gauss-Seidel / SOR relaxation for Laplace (top=1) ===")
def relax(Nint, method, tol=1e-6, omega=None):
    U = np.zeros((Nint+2, Nint+2)); U[-1, :] = 1.0
    h = 1/(Nint+1); it = 0
    while True:
        it += 1
        if method == "jacobi":
            Unew = U.copy()
            Unew[1:-1, 1:-1] = 0.25*(U[2:, 1:-1] + U[:-2, 1:-1] + U[1:-1, 2:] + U[1:-1, :-2])
            diff = np.max(np.abs(Unew - U)); U = Unew
        else:
            diff = 0.0
            w = 1.0 if method == "gs" else omega
            for i in range(1, Nint+1):
                for j in range(1, Nint+1):
                    new = 0.25*(U[i+1, j] + U[i-1, j] + U[i, j+1] + U[i, j-1])
                    d = w*(new - U[i, j]); U[i, j] += d; diff = max(diff, abs(d))
        if diff < tol or it > 200000: break
    c = U[(Nint+1)//2, (Nint+1)//2] if Nint % 2 == 1 else None
    return it, c
for Nint in [9, 19]:
    h = 1/(Nint+1); om = 2/(1 + np.sin(np.pi*h))
    for m in ["jacobi", "gs", "sor"]:
        it, c = relax(Nint, m, omega=om)
        print(f"N={Nint:3} {m:6}: iterations to max-update < 1e-6: {it:6d}; centre = {c}")
    print(f"   predicted Jacobi spectral radius cos(pi h) = {np.cos(np.pi*h):.5f}; SOR omega_opt = {om:.4f}")

print("\n=== 5. von Neumann amplification factors (theta = k dx in [0, pi]) ===")
th = np.linspace(0, np.pi, 100001)
for nu in [0.5, 1.0, 1.01]:
    G_up = 1 - nu*(1 - np.exp(-1j*th))
    G_lw = 1 - 1j*nu*np.sin(th) - nu**2*(1 - np.cos(th))
    G_ftcs = 1 - 1j*nu*np.sin(th)
    print(f"nu={nu}: max|G| upwind={np.max(np.abs(G_up)):.4f}, Lax-Wendroff={np.max(np.abs(G_lw)):.4f}, FTCS-advection={np.max(np.abs(G_ftcs)):.4f}")
for r in [0.25, 0.5, 0.51]:
    G = 1 - 4*r*np.sin(th/2)**2
    print(f"FTCS heat r={r}: max|G| = {np.max(np.abs(G)):.4f}")
# blow-up demo: FTCS heat with r = 0.51, smooth initial data, roundoff seeds the sawtooth mode
for r in [0.49, 0.51]:
    N = 100; xg = np.linspace(0, 1, N+1); u = np.sin(np.pi*xg); steps = 0
    while steps < 5000:
        u[1:-1] = u[1:-1] + r*(u[2:] - 2*u[1:-1] + u[:-2]); steps += 1
        if np.max(np.abs(u)) > 10: break
    print(f"FTCS heat r={r}: steps run = {steps}, max|u| = {np.max(np.abs(u)):.3e}, "
          f"sawtooth? {np.all(np.sign(u[1:-2])*np.sign(u[2:-1]) <= 0) if steps < 5000 else 'n/a'}")
print("predicted steps for r=0.51: ln(1e16 * 10)/ln(1.04) ~", np.log(1e17)/np.log(1.04))

print("\n=== 6. Leapfrog for u_tt = c^2 u_xx: growth with Courant number nu = c dt/dx ===")
for nu in [0.9, 1.0, 1.05]:
    N = 200; xg = np.linspace(0, 1, N+1); dx = xg[1]-xg[0]; dt = nu*dx
    u_prev = np.exp(-200*(xg-0.5)**2); u = u_prev.copy()
    for n in range(2000):
        un = np.zeros_like(u)
        un[1:-1] = 2*u[1:-1] - u_prev[1:-1] + nu**2*(u[2:] - 2*u[1:-1] + u[:-2])
        u_prev, u = u, un
        if np.max(np.abs(u)) > 1e6: break
    print(f"nu={nu}: after {n+1} steps max|u| = {np.max(np.abs(u)):.3e}")
print("2D/3D leapfrog with equal spacing: stable iff c dt/dx <= 1/sqrt(d): 2D", 1/np.sqrt(2), "3D", 1/np.sqrt(3))

print("\n=== 7. Ill-posedness: backward heat and Hadamard's Laplace Cauchy problem ===")
for n in [1, 10, 100]:
    print(f"backward heat mode sin({n}x): amplification at t=0.1: e^(n^2 t) = {np.exp(n**2*0.1):.3e}")
for n in [5, 10, 20]:
    print(f"Hadamard: data u_y(x,0)=sin({n}x)/{n}^2 (size {1/n**2:.1e}); u(x,1) amplitude sinh(n)/n^3 = {np.sinh(n)/n**3:.3e}")

print("\n=== 8. Weakly vs strongly hyperbolic toy systems: |exp(i k A t)| growth ===")
A_weak = np.array([[1., 1.], [0., 1.]]); A_strong = np.array([[1., 0.], [0., -1.]])
for k in [1, 10, 100, 1000]:
    nw = np.linalg.norm(expm(1j*k*A_weak*1.0), 2); ns = np.linalg.norm(expm(1j*k*A_strong*1.0), 2)
    print(f"k={k:5}: ||exp(ikAt)|| at t=1: Jordan-block (weakly hyperbolic) = {nw:9.2f}; diagonalizable = {ns:.2f}")
A_ell = np.array([[0., 1.], [-1., 0.]])  # u_t = v_x, v_t = -u_x  ->  Laplace (Cauchy-Riemann type)
for k in [1, 10, 20]:
    print(f"k={k:3}: elliptic 'evolution' (complex eigenvalues) ||exp(ikAt)|| at t=1 = {np.linalg.norm(expm(1j*k*A_ell), 2):.3e}")

print("\n=== 9. Constraint propagation and damping toy (first-order wave system) ===")
# u_t = pi ; pi_t = phi_x ; phi_t = pi_x - gamma (phi - u_x);  constraint C = phi - u_x
def run(Nx, gamma, eps, T=2.0):
    x = np.linspace(0, 2*np.pi, Nx, endpoint=False); dx = x[1]-x[0]
    D = lambda f: (np.roll(f, -1) - np.roll(f, 1))/(2*dx)
    u = np.sin(x); p = np.zeros(Nx); ph = (1+eps)*np.cos(x)   # eps != 0: constraint-violating data
    dt = 0.25*dx; n = int(round(T/dt)); dt = T/max(n, 1)
    def rhs(u, p, ph):
        return p, D(ph), D(p) - gamma*(ph - D(u))
    for i in range(n):
        k1 = rhs(u, p, ph)
        k2 = rhs(u + dt/2*k1[0], p + dt/2*k1[1], ph + dt/2*k1[2])
        k3 = rhs(u + dt/2*k2[0], p + dt/2*k2[1], ph + dt/2*k2[2])
        k4 = rhs(u + dt*k3[0], p + dt*k3[1], ph + dt*k3[2])
        u = u + dt/6*(k1[0] + 2*k2[0] + 2*k3[0] + k4[0]); p = p + dt/6*(k1[1] + 2*k2[1] + 2*k3[1] + k4[1])
        ph = ph + dt/6*(k1[2] + 2*k2[2] + 2*k3[2] + k4[2])
    C = ph - D(u)
    return np.sqrt(np.mean(C**2))
for Nx in [50, 100, 200]:
    print(f"Nx={Nx}: ||C|| at t=2 with consistent data, gamma=0: {run(Nx, 0.0, 0.0):.3e}")
for g in [0.0, 1.0, 3.0]:
    c0 = run(100, g, 0.1, T=1e-9); c2 = run(100, g, 0.1)
    print(f"gamma={g}: inconsistent data (10% error): ||C||(0) = {c0:.4f}, ||C||(2) = {c2:.4f}, ratio = {c2/c0:.4f}, e^(-2 gamma) = {np.exp(-2*g):.4f}")
# Maxwell analog symbolic identity
X, Y, Z, t = sp.symbols('x y z t')
B = [sp.Function(f'B{i}')(X, Y, Z, t) for i in range(3)]
curlB = [sp.diff(B[2], Y) - sp.diff(B[1], Z), sp.diff(B[0], Z) - sp.diff(B[2], X), sp.diff(B[1], X) - sp.diff(B[0], Y)]
print("div(curl B) =", sp.simplify(sp.diff(curlB[0], X) + sp.diff(curlB[1], Y) + sp.diff(curlB[2], Z)))

print("\n=== 10. Classification discriminants B^2 - 4AC ===")
for (A, Bc, C, lab) in [(1, 4, 3, "u_xx+4u_xy+3u_yy"), (1, 2, 1, "u_xx+2u_xy+u_yy"), (1, 1, 1, "u_xx+u_xy+u_yy"),
                        (1, 0, -1, "wave u_tt - u_xx (t as y)"), (1, 0, 1, "Laplace"), (1, 0, 0, "heat u_xx - u_t (no u_tt)")]:
    d = Bc**2 - 4*A*C
    print(f"{lab:28}: {d:3d} -> {'hyperbolic' if d > 0 else 'parabolic' if d == 0 else 'elliptic'}")
