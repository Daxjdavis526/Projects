"""Verify Schwarzschild geodesic benchmarks and integrator behaviour (G = c = 1, M = 1).

Massive, equatorial:  E = (1-2M/r) dt/dtau,  L = r^2 dphi/dtau,
  (dr/dtau)^2 = E^2 - V(r),  V(r) = (1-2M/r)(1+L^2/r^2)   [Carroll's V_C = V/2]
  d2r/dtau2 = -V'(r)/2 = -M/r^2 + L^2/r^3 - 3 M L^2/r^4
Orbit equation: u'' + u = M/L^2 + 3 M u^2 ;  light: u'' + u = 3 M u^2
"""
import numpy as np
import sympy as sp
from scipy.special import ellipk
from scipy.integrate import quad

M = 1.0
print("=== 1. Exact radii and constants (sympy) ===")
r, Ls, Ms = sp.symbols('r L M', positive=True)
V = (1 - 2*Ms/r) * (1 + Ls**2 / r**2)
dV = sp.diff(V, r)
sol_L2 = sp.solve(sp.Eq(dV, 0), Ls**2)
print("circular-orbit L^2(r) =", sp.simplify(sol_L2[0]))           # M r^2/(r-3M)
L2c = sp.simplify(sol_L2[0])
E2c = sp.simplify(V.subs(Ls**2, L2c))
print("circular-orbit E^2(r) =", sp.factor(E2c))                   # (r-2M)^2/(r(r-3M))
# ISCO: dL^2/dr = 0
risco = sp.solve(sp.Eq(sp.diff(L2c, r), 0), r)
print("ISCO r =", risco, " L =", sp.sqrt(L2c.subs(r, 6*Ms)), " E =", sp.sqrt(E2c.subs(r, 6*Ms)),
      "=", sp.N(sp.sqrt(E2c.subs({r: 6*Ms}))))
print("binding efficiency 1 - E_isco =", sp.N(1 - sp.sqrt(sp.Rational(8, 9))))
rmb = sp.solve(sp.Eq(E2c, 1), r)
print("marginally bound (E=1) r =", rmb, " L =", [sp.sqrt(L2c.subs(r, x)) for x in rmb])
Vph = (1 - 2*Ms/r) / r**2
rph = sp.solve(sp.Eq(sp.diff(Vph, r), 0), r)
bc = sp.sqrt(1 / Vph.subs(r, rph[0]))
print("photon sphere r =", rph, " critical b =", sp.simplify(bc), "=", sp.N(bc.subs(Ms, 1)))
Omega_isco = sp.sqrt(Ms / (6*Ms)**3)
print("M*Omega_ISCO = 6^{-3/2} =", sp.N(Omega_isco.subs(Ms, 1)))
# GW frequency at ISCO for 1 Msun: f_GW = 2 f_orb = Omega/pi
GMsun_s = 1.32712440018e20 / 299792458.0**3
print("f_GW(ISCO) for 1 Msun = %.1f Hz (scale as 1/M)" % (6**-1.5 / GMsun_s / np.pi))
# proper vs coordinate time at ISCO: dtau/dt = sqrt(1-3M/r)
print("dtau/dt at ISCO =", np.sqrt(1 - 3/6))

print("\n=== 2. Weak-field benchmarks with IAU constants ===")
GM = 1.32712440018e20; c = 299792458.0; Rsun = 6.957e8
a_merc = 5.7909050e10; e_merc = 0.205630; P_merc = 87.9691  # NASA fact sheet values
dphi = 6*np.pi*GM / (c**2 * a_merc * (1 - e_merc**2))
orbits_per_century = 36525.0 / P_merc
arcsec = np.degrees(1) * 3600
print("Mercury: dphi/orbit = %.4e rad; per century = %.3f arcsec" % (dphi, dphi*orbits_per_century*arcsec))
defl = 4*GM/(c**2*Rsun)
print("Solar-limb deflection 4GM/(c^2 R) = %.4e rad = %.4f arcsec (R=6.957e8 m)" % (defl, defl*arcsec))
print("   with R = 6.96e8 m: %.4f arcsec" % (4*GM/(c**2*6.96e8)*arcsec))

print("\n=== 3. Exact vs weak-field perihelion advance (elliptic-integral formula) ===")
def orbit_constants(rp, ra, M=1.0):
    # E, L from turning points: E^2 = V(rp) = V(ra)
    up, ua = 1/rp, 1/ra
    L2 = (up - ua) / ((1 - 2*M*up)*up**2 - (1 - 2*M*ua)*ua**2) * (2*M) * 0 + None if False else None
    # solve (1-2M u)(1+L2 u^2) equal at both u:  L2 = 2M(up-ua) / ((up^2-ua^2) - 2M(up^3-ua^3))
    L2 = 2*M*(up - ua) / ((up**2 - ua**2) - 2*M*(up**3 - ua**3))
    E2 = (1 - 2*M*up) * (1 + L2*up**2)
    return np.sqrt(E2), np.sqrt(L2)

def exact_precession(rp, ra, M=1.0):
    u1, u2 = 1/ra, 1/rp
    u3 = 1/(2*M) - u1 - u2
    m = (u2 - u1)/(u3 - u1)
    return 4*ellipk(m)/np.sqrt(2*M*(u3 - u1)) - 2*np.pi

for (rp, ra) in [(9, 15), (12, 30), (20, 60), (100, 300), (1000, 3000)]:
    a = (rp + ra)/2; e = (ra - rp)/(ra + rp); p = a*(1 - e**2)
    ex = exact_precession(rp, ra)
    wf = 6*np.pi/p
    print(f"rp={rp:5}, ra={ra:5}: p={p:8.2f}  exact={ex:.6e}  6piM/p={wf:.6e}  ratio={ex/wf:.4f}")
for r0 in [7, 10, 20, 100]:
    print(f"near-circular r={r0}: 2pi[(1-6M/r)^-1/2 - 1] = {2*np.pi*((1-6/r0)**-0.5 - 1):.6f}, "
          f"elliptic(e->0) = {exact_precession(r0*(1-1e-6), r0*(1+1e-6)):.6f}, 6piM/r = {6*np.pi/r0:.6f}")

print("\n=== 4. Exact light deflection vs 4M/b and 4M/b + 15pi M^2/(4 b^2) ===")
def deflection_exact(r0, M=1.0):
    b = np.sqrt(r0**3/(r0 - 2*M)); u0 = 1/r0
    # substitute u = u0 (1 - s^2) to remove the endpoint singularity
    f = lambda s: 2*u0*s / np.sqrt(max(1/b**2 - (u0*(1-s**2))**2 + 2*M*(u0*(1-s**2))**3, 1e-300))
    I, _ = quad(f, 0, 1, limit=200, epsabs=1e-13, epsrel=1e-13)
    return 2*I - np.pi, b
for r0 in [4, 6, 10, 100, 1000, 1e4]:
    d, b = deflection_exact(r0)
    print(f"r0={r0:8}: b={b:10.4f}  exact={d:.6e}  4M/b={4/b:.6e}  +2nd={4/b + 15*np.pi/(4*b**2):.6e}")

print("\n=== 5. Integrators on the reduced radial equation (rp=12M, ra=30M) ===")
rp, ra = 12.0, 30.0
E, L = orbit_constants(rp, ra)
print("E = %.10f, L = %.10f" % (E, L))
V_ = lambda r: (1 - 2/r)*(1 + L**2/r**2)
acc = lambda r: -1/r**2 + L**2/r**3 - 3*L**2/r**4
def deriv(y):  # y = [r, rdot, phi]
    return np.array([y[1], acc(y[0]), L/y[0]**2])
def rk4_step(y, h):
    k1 = deriv(y); k2 = deriv(y + h/2*k1); k3 = deriv(y + h/2*k2); k4 = deriv(y + h*k3)
    return y + h/6*(k1 + 2*k2 + 2*k3 + k4)
def euler_step(y, h):
    return y + h*deriv(y)
def verlet_step(y, h):
    r0, v0, ph = y
    v_half = v0 + h/2*acc(r0)
    r1 = r0 + h*v_half
    v1 = v_half + h/2*acc(r1)
    # phi by trapezoid on L/r^2 (2nd order, consistent with Verlet)
    return np.array([r1, v1, ph + h/2*(L/r0**2 + L/r1**2)])

# radial period in proper time (exact, by quadrature with substitution r = mid + half*cos(chi))
# Use the cubic factorisation: rdot^2 = E^2 - V = (2M/r^3)(r - ra)(rp - r)... check numerically instead
def tau_radial_period():
    f = lambda chi: (lambda rr: ( (0.5*(ra-rp))*np.sin(chi) ) / np.sqrt(max(E**2 - V_(rr), 1e-300)))(0.5*(ra+rp) - 0.5*(ra-rp)*np.cos(chi))
    I, _ = quad(f, 1e-9, np.pi - 1e-9, limit=400)
    return 2*I
Tr = tau_radial_period()
print("radial period (proper time) = %.6f M" % Tr)

def run(stepper, h, n_periods):
    y = np.array([rp, 0.0, 0.0])
    nsteps = int(round(n_periods*Tr/h))
    maxdev = 0.0
    for i in range(nsteps):
        y = stepper(y, h)
        dev = abs((y[1]**2 + V_(y[0])) - E**2)
        if dev > maxdev: maxdev = dev
    return y, maxdev, nsteps

for name, st in [("Euler", euler_step), ("RK4", rk4_step), ("Verlet", verlet_step)]:
    for h in [1.0, 0.5]:
        y, dev, n = run(st, h, 20)
        print(f"{name:6} h={h:4}: steps={n:6}, max|E^2_num - E^2| over 20 radial periods = {dev:.3e}, final r = {y[0]:.4f}")

# long-run drift comparison (RK4 vs Verlet), coarse step
for name, st in [("RK4", rk4_step), ("Verlet", verlet_step)]:
    for nper in [10, 100, 1000]:
        y, dev, n = run(st, 2.0, nper)
        print(f"   long run {name:6} h=2.0, {nper:5} periods: max energy dev = {dev:.3e}")

print("\n=== 6. Precession from integration vs exact (RK4 small step) ===")
# integrate u(phi) orbit equation with RK4 and locate successive periapses
def orbit_rk4(rp, ra, dphi=1e-3, n_orbits=3):
    E, L = orbit_constants(rp, ra)
    f = lambda u, w: (w, -u + 1/L**2 + 3*u**2)   # M=1
    u, w, phi = 1/rp, 0.0, 0.0
    peris = []
    while len(peris) < n_orbits:
        def F(y): a, b = f(*y); return np.array([a, b])
        y = np.array([u, w])
        k1 = F(y); k2 = F(y + dphi/2*k1); k3 = F(y + dphi/2*k2); k4 = F(y + dphi*k3)
        yn = y + dphi/6*(k1 + 2*k2 + 2*k3 + k4)
        if w > 0 and yn[1] <= 0:      # du/dphi crosses + -> -: u maximum = periapsis
            frac = w/(w - yn[1]); peris.append(phi + frac*dphi)
        u, w = yn; phi += dphi
    return np.diff([0.0] + peris)
adv = orbit_rk4(12, 30)
print("successive periapsis spacings - 2pi:", adv - 2*np.pi, " exact:", exact_precession(12, 30))

print("\n=== 7. Full geodesic equation (t,r,phi) with Christoffels, RK4: E, L, norm drift & order ===")
def full_rhs(Y):
    t, rr, ph, td, rd, pd = Y
    f = 1 - 2/rr
    tdd = -2/(rr**2 * f) * td * rd                       # -2 Gamma^t_tr
    rdd = -(f/rr**2)*td**2 + rd**2/(rr**2 * f) + rr*f*pd**2   # Gamma^r_tt, Gamma^r_rr, Gamma^r_phph
    pdd = -2/rr * rd * pd
    return np.array([td, rd, pd, tdd, rdd, pdd])
def rk4_full(Y, h):
    k1 = full_rhs(Y); k2 = full_rhs(Y + h/2*k1); k3 = full_rhs(Y + h/2*k2); k4 = full_rhs(Y + h*k3)
    return Y + h/6*(k1 + 2*k2 + 2*k3 + k4)
def checks(Y):
    t, rr, ph, td, rd, pd = Y; f = 1 - 2/rr
    return f*td, rr**2*pd, -f*td**2 + rd**2/f + rr**2*pd**2
Y0 = np.array([0.0, rp, 0.0, E/(1 - 2/rp), 0.0, L/rp**2])
print("initial (E, L, u.u) =", checks(Y0))
T_end = 5*Tr
finals = {}
for h in [2.0, 1.0, 0.5, 0.25]:
    Y = Y0.copy(); n = int(round(T_end/h))
    for i in range(n): Y = rk4_full(Y, h)
    Ee, Ll, nn = checks(Y)
    finals[h] = Y
    print(f"h={h:5}: |dE|={abs(Ee-E):.2e} |dL|={abs(Ll-L):.2e} |u.u+1|={abs(nn+1):.2e}  r_end={Y[1]:.10f}")
# observed order from three resolutions (self-convergence on r_end)
for (h1, h2, h3) in [(2.0, 1.0, 0.5), (1.0, 0.5, 0.25)]:
    q = (finals[h1][1] - finals[h2][1]) / (finals[h2][1] - finals[h3][1])
    print(f"self-convergence ratio ({h1},{h2},{h3}) = {q:.3f} -> order p = {np.log2(abs(q)):.3f}")
# Richardson extrapolation of r_end (RK4: p = 4)
rich = finals[0.25][1] + (finals[0.25][1] - finals[0.5][1]) / (2**4 - 1)
print("Richardson-extrapolated r_end = %.12f" % rich)

print("\n=== 8. Explicit Euler / Verlet on harmonic oscillator (energy behaviour) ===")
w = 1.0
for h in [0.1, 0.01]:
    # Euler: energy factor per step
    A = np.array([[1, h], [-h*w**2, 1]])
    q, p = 1.0, 0.0
    for i in range(int(round(2*np.pi*10/h))):
        q, p = q + h*p, p - h*w**2*q
    print(f"Euler h={h}: energy after 10 periods / initial = {(p**2 + w**2*q**2)/1.0:.4f}  (predicted (1+h^2)^n = {(1+h**2)**int(round(2*np.pi*10/h)):.4f})")
    q, p = 1.0, 0.0; emax = 0; emin = 10
    for i in range(int(round(2*np.pi*1000/h))):
        p_half = p - h/2*w**2*q; q = q + h*p_half; p = p_half - h/2*w**2*q
        en = 0.5*(p**2 + w**2*q**2); emax = max(emax, en); emin = min(emin, en)
    print(f"Verlet h={h}: energy range over 1000 periods = [{emin:.8f}, {emax:.8f}] (E0 = 0.5); rel. amplitude {(emax-emin)/0.5:.3e}")
print("Verlet stability: trace of one-step matrix = 2 - (h w)^2; |trace| < 2 <=> h w < 2")
