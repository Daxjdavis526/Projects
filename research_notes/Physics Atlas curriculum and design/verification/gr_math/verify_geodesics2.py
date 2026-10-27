"""Follow-ups: fixed-final-time convergence test, integrator-induced precession, long-run drift crossover,
photon capture around b_c = 3 sqrt(3) M."""
import numpy as np

def orbit_constants(rp, ra, M=1.0):
    up, ua = 1/rp, 1/ra
    L2 = 2*M*(up - ua) / ((up**2 - ua**2) - 2*M*(up**3 - ua**3))
    E2 = (1 - 2*M*up) * (1 + L2*up**2)
    return np.sqrt(E2), np.sqrt(L2)

rp, ra = 12.0, 30.0
E, L = orbit_constants(rp, ra)
V_ = lambda r: (1 - 2/r)*(1 + L**2/r**2)
acc = lambda r: -1/r**2 + L**2/r**3 - 3*L**2/r**4

def full_rhs(Y):
    t, rr, ph, td, rd, pd = Y
    f = 1 - 2/rr
    return np.array([td, rd, pd, -2/(rr**2*f)*td*rd,
                     -(f/rr**2)*td**2 + rd**2/(rr**2*f) + rr*f*pd**2, -2/rr*rd*pd])
def rk4_full(Y, h):
    k1 = full_rhs(Y); k2 = full_rhs(Y + h/2*k1); k3 = full_rhs(Y + h/2*k2); k4 = full_rhs(Y + h*k3)
    return Y + h/6*(k1 + 2*k2 + 2*k3 + k4)

print("=== A. Self-convergence at a FIXED final time T = 3200 M ===")
Y0 = np.array([0.0, rp, 0.0, E/(1 - 2/rp), 0.0, L/rp**2])
T = 3200.0
res = {}
for h in [4.0, 2.0, 1.0, 0.5]:
    Y = Y0.copy()
    for i in range(int(T/h)): Y = rk4_full(Y, h)
    res[h] = Y
    print(f"h={h}: r(T) = {Y[1]:.12f}, phi(T) = {Y[2]:.12f}")
for trip in [(4.0, 2.0, 1.0), (2.0, 1.0, 0.5)]:
    a, b, c = (res[x][2] for x in trip)
    q = (a - b)/(b - c)
    print(f"phi self-convergence Q{trip} = {q:.3f}  => observed order {np.log2(q):.3f}  (RK4 expects 16 -> 4)")
rich = res[0.5][2] + (res[0.5][2] - res[1.0][2])/15
print(f"Richardson phi(T) = {rich:.12f}")

print("\n=== B. Integrator-induced (spurious) precession: Verlet vs RK4 on the radial equation ===")
from scipy.special import ellipk
def exact_prec(rp, ra, M=1.0):
    u1, u2 = 1/ra, 1/rp; u3 = 1/(2*M) - u1 - u2; m = (u2 - u1)/(u3 - u1)
    return 4*ellipk(m)/np.sqrt(2*M*(u3 - u1)) - 2*np.pi
ex = exact_prec(rp, ra)
def verlet_step(y, h):
    r0, v0, ph = y
    vh = v0 + h/2*acc(r0); r1 = r0 + h*vh; v1 = vh + h/2*acc(r1)
    return np.array([r1, v1, ph + h/2*(L/r0**2 + L/r1**2)])
def rk4_step(y, h):
    d = lambda y: np.array([y[1], acc(y[0]), L/y[0]**2])
    k1 = d(y); k2 = d(y + h/2*k1); k3 = d(y + h/2*k2); k4 = d(y + h*k3)
    return y + h/6*(k1 + 2*k2 + 2*k3 + k4)
def periapsis_advance(step, h, n=5):
    y = np.array([rp, 0.0, 0.0]); peris = []
    while len(peris) < n:
        yn = step(y, h)
        if y[1] < 0 and yn[1] >= 0:   # rdot crosses - -> + : periapsis
            frac = -y[1]/(yn[1] - y[1]); peris.append(y[2] + frac*(yn[2] - y[2]))
        y = yn
    return np.mean(np.diff(peris)) - 2*np.pi
print(f"exact advance per orbit = {ex:.6f} rad")
for h in [8.0, 4.0, 2.0, 1.0]:
    v = periapsis_advance(verlet_step, h); k = periapsis_advance(rk4_step, h)
    print(f"h={h}: Verlet advance = {v:.6f} (err {v-ex:+.2e}),  RK4 advance = {k:.6f} (err {k-ex:+.2e})")

print("\n=== C. Long-run energy-error growth, coarse step h = 8 M ===")
Tr = 666.442112
for name, st in [("RK4", rk4_step), ("Verlet", verlet_step)]:
    y = np.array([rp, 0.0, 0.0]); h = 8.0; maxdev = 0; checkpoints = {10, 100, 1000, 3000}
    nsteps_per = Tr/h; step = 0; per = 0
    out = []
    for target in [10, 100, 1000, 3000]:
        while step < target*nsteps_per:
            y = st(y, h); step += 1
            d = abs(y[1]**2 + V_(y[0]) - E**2)
            if d > maxdev: maxdev = d
        out.append(f"{target}: {maxdev:.2e}")
    print(f"{name:6}: max |E^2 err| after N radial periods -> " + ", ".join(out))

print("\n=== D. Photon capture threshold b_c = 3 sqrt(3) M = %.6f ===" % (3*np.sqrt(3)))
def photon(b, dphi=1e-3):
    # u'' + u = 3 u^2 (M=1); start far away u ~ 0 with du/dphi = 1/b
    u, w, phi = 1e-6, np.sqrt(1/b**2 - 1e-12 + 2e-18), 0.0
    f = lambda y: np.array([y[1], -y[0] + 3*y[0]**2])
    y = np.array([u, w])
    while True:
        k1 = f(y); k2 = f(y + dphi/2*k1); k3 = f(y + dphi/2*k2); k4 = f(y + dphi*k3)
        y = y + dphi/6*(k1 + 2*k2 + 2*k3 + k4); phi += dphi
        if y[0] >= 0.5: return "captured (reached horizon r=2M)", phi
        if y[0] <= 0 and y[1] < 0: return "escaped", phi
        if phi > 60: return "still orbiting", phi
for b in [5.15, 5.19, 5.196, 5.197, 5.20, 5.25]:
    print(f"b = {b}: {photon(b)}")
