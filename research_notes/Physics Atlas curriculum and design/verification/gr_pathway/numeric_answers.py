"""Numeric answer keys for the 37-step GR pathway problem archetypes.
Constants: CODATA 2018 exact/recommended (G, c, hbar), IAU 2015 nominal solar/terrestrial values."""
import math
import numpy as np
from scipy.integrate import solve_ivp, quad
from scipy.optimize import brentq

G = 6.67430e-11; c = 299792458.0; hbar = 1.054571817e-34; kB = 1.380649e-23
GMsun = 1.3271244e20; Msun = GMsun/G; Rsun = 6.957e8
GMe = 3.986004418e14; Me = GMe/G; Re = 6.371e6   # mean radius
AU = 1.495978707e11; pc = 3.0856775814913673e16; Mpc = 1e6*pc; ly = c*365.25*86400
yr = 365.25*86400; day = 86400.0
arcsec = math.pi/(180*3600); mas = arcsec/1e3; uas = arcsec/1e6
lines = []
def P(tag, txt, val=None, fmt="{:.6g}"):
    s = f"{tag}: {txt}" + ("" if val is None else " = " + (fmt.format(val) if not isinstance(val, str) else val))
    lines.append(s); print(s, flush=True)

# ---------------- Step 1 Newtonian gravity ----------------
P("S01", "Earth surface g (GM/R^2, R=6371 km) m/s^2", GMe/Re**2)
P("S01", "Earth escape speed km/s", math.sqrt(2*GMe/Re)/1e3)
P("S01", "Michell dark-star radius for the Sun 2GM/c^2 (km)", 2*GMsun/c**2/1e3)
for name, GM, R in [("Earth", GMe, Re), ("Sun", GMsun, Rsun), ("white dwarf 1 Msun, R=7000 km", GMsun, 7.0e6), ("neutron star 1.4 Msun, R=12 km", 1.4*GMsun, 1.2e4)]:
    P("S01", f"compactness GM/(Rc^2) {name}", GM/(R*c**2))
GMmoon = 4.9048695e12; dmoon = 3.844e8
P("S01", "Lunar tidal acceleration at Earth's surface 2GM_moon R/d^3 (m/s^2)", 2*GMmoon*Re/dmoon**3)
P("S01", "Mercury residual from rounded Clemence budget 5600-5025-532 (arcsec/cy)", 5600-5025-532)

# ---------------- Step 2 SR review ----------------
tau_mu = 2.1969811e-6; beta = 0.995; gam = 1/math.sqrt(1-beta**2)
P("S02", "muon gamma at 0.995c", gam)
P("S02", "muon dilated lifetime (us)", gam*tau_mu*1e6)
P("S02", "mean decay length with dilation (km)", gam*tau_mu*beta*c/1e3)
P("S02", "naive decay length without dilation (m)", tau_mu*beta*c)
P("S02", "0.6c (+) 0.6c relativistic addition (c)", (0.6+0.6)/(1+0.36))
b = 0.6; g6 = 1/math.sqrt(1-b*b)
P("S02", "Lorentz transform of (t=5 s, x=3 light-s) with v=0.6c: t' (s)", g6*(5-b*3))
P("S02", "x' (light-s)", g6*(3-b*5))
P("S02", "Doppler ratio approaching at 0.6c sqrt((1+b)/(1-b))", math.sqrt((1+b)/(1-b)))
P("S02", "Twin: 0.8c to 4 ly and back, Earth years", 2*4/0.8)
P("S02", "Twin: traveller proper years", 2*4/0.8*math.sqrt(1-0.64))

# ---------------- Step 3 Minkowski ----------------
P("S03", "interval dt=3 s, dx=4 light-s: s^2 (light-s^2), spacelike if >0", -9+16)
P("S03", "proper time for dt=5 yr, dx=3 ly (yr)", math.sqrt(25-9))
phi = math.atanh(0.8)
P("S03", "rapidity of 0.8c", phi)
P("S03", "0.8c (+) 0.8c via rapidity addition (c)", math.tanh(2*phi))

# ---------------- Step 4 four-vectors ----------------
mp = 0.93827208816  # GeV
for E in (6.5e3, 6.8e3):
    gp = E/mp
    P("S04", f"LHC proton gamma at {E/1e3} TeV", gp)
    P("S04", f"  1-beta at {E/1e3} TeV", 1/(2*gp**2))
P("S04", "invariant mass, two 1 GeV photons head-on (GeV)", math.sqrt(2*1*1*(1-math.cos(math.pi))))
P("S04", "invariant mass, two 1 GeV photons at 90 deg (GeV)", math.sqrt(2*1*1*(1-math.cos(math.pi/2))))
mpi, mmu = 139.57039, 105.6583755
P("S04", "pi+ -> mu+ nu at rest: muon kinetic energy (MeV)", (mpi-mmu)**2/(2*mpi))
P("S04", "  muon momentum (MeV/c)", (mpi**2-mmu**2)/(2*mpi))

# ---------------- Step 5 equivalence principle ----------------
gE = 9.81
P("S05", "light drop across 3 m cabin at 1 g (m)", 0.5*gE*(3/c)**2)
for h in (22.5, 0.33, 1e-3, 330.0):
    P("S05", f"gh/c^2 for h={h} m", gE*h/c**2)
P("S05", "330 m tower clock gain per day (ns)", gE*330/c**2*day*1e9)
P("S05", "Pound-Rebka two-way (up minus down) fractional difference 2gh/c^2, h=22.5 m", 2*gE*22.5/c**2)

# ---------------- Step 6 gravity as geometry ----------------
P("S06", "two walkers 1 km apart at equator, separation at 60N (km)", 1.0*math.cos(math.radians(60)))
v0 = 10.0
P("S06", "thrown ball extra proper time v0^3/(3 g c^2), v0=10 m/s (s)", v0**3/(3*gE*c**2))
# numerical check of thrown ball by integration
T = 2*v0/gE
num, _ = quad(lambda t: (gE*(v0*t-0.5*gE*t*t) - 0.5*(v0-gE*t)**2)/c**2, 0, T)
P("S06", "  numerical integral check (s)", num)
P("S06", "Earth vertical tidal gradient 2GM/R^3 (s^-2)", 2*GMe/Re**3)
P("S06", "head-to-foot tidal difference for 2 m (m/s^2)", 2*GMe/Re**3*2)
P("S06", "sphere triangle (pole + two equator pts 90 deg apart) angle excess (deg)", 90.0)

# ---------------- Step 7 coordinates ----------------
alpha = 9.81
for tau_y in (1.0, 10.0):
    tau = tau_y*yr
    tc = (c/alpha)*math.sinh(alpha*tau/c)
    xc = (c**2/alpha)*(math.cosh(alpha*tau/c)-1)
    P("S07", f"1 g rocket, proper time {tau_y} yr: Earth-frame time (yr)", tc/yr)
    P("S07", f"  distance (ly)", xc/ly)
    P("S07", f"  final speed (c)", math.tanh(alpha*tau/c))
P("S07", "c/g in years (rocket 'natural' time)", c/alpha/yr)
th = math.pi/4; rr = math.sqrt(2)
P("S07", "e_x at (1,1) in polar components V^r", math.cos(th))
P("S07", "  V^theta", -math.sin(th)/rr)

# ---------------- Step 8 metric ----------------
R = 6.371e6
for rk in (100e3, 1000e3):
    C = 2*math.pi*R*math.sin(rk/R)
    P("S08", f"circle of surface radius {rk/1e3} km on Earth: shortfall 2pi r - C (m)", 2*math.pi*rk - C)
def Lprop(r1, r2, rs=1.0):
    F = lambda r: math.sqrt(r*(r-rs)) + rs*math.log(math.sqrt(r)+math.sqrt(r-rs))
    return F(r2)-F(r1)
for r2 in (2, 3, 10):
    P("S08", f"Schwarzschild proper radial distance r_s -> {r2} r_s (units r_s)", Lprop(1, r2))
rsSun = 2*GMsun/c**2
P("S08", "Sun surface to 1 AU: extra proper distance beyond coordinate difference (km)", (Lprop(Rsun/rsSun, AU/rsSun)*rsSun - (AU-Rsun))/1e3)

# ---------------- Step 9 proper time ----------------
a_gps = 2.656175e7; Phi0c2 = -6.969290134e-10
grav = (-GMe/(a_gps*c**2) - Phi0c2)
vel = -GMe/(2*a_gps*c**2)
P("S09", "GPS gravitational term (us/day)", grav*day*1e6)
P("S09", "GPS velocity term (us/day)", vel*day*1e6)
P("S09", "GPS net (us/day)", (grav+vel)*day*1e6)
P("S09", "GPS factory frequency (MHz)", 10.23*(1-(grav+vel)), "{:.11f}")
P("S09", "light distance in net daily offset (km)", c*(grav+vel)*day/1e3)
h_iss = 400e3; r_iss = Re+h_iss; v_iss = math.sqrt(GMe/r_iss)
gi = (GMe/Re - GMe/r_iss)/c**2; vi = -v_iss**2/(2*c**2)
P("S09", "ISS speed (km/s)", v_iss/1e3)
P("S09", "ISS gravitational (us/day)", gi*day*1e6)
P("S09", "ISS velocity (us/day)", vi*day*1e6)
P("S09", "ISS net (us/day)", (gi+vi)*day*1e6)
P("S09", "ISS 182.6-day mission accumulated (ms)", (gi+vi)*182.6*day*1e3)
P("S09", "crossover altitude r=1.5 R_E (km) (ignoring Earth rotation)", 0.5*Re/1e3)
P("S09", "circular-geodesic dtau/dt at ISCO sqrt(1-3M/r) r=6M", math.sqrt(0.5))

# ---------------- Step 13 parallel transport ----------------
for lat in (60.0, 45.0):
    th0 = math.radians(90-lat)
    hol = 2*math.pi*(1-math.cos(th0))
    P("S13", f"holonomy around latitude {lat} circle 2pi(1-cos theta0) (deg)", math.degrees(hol))
    P("S13", f"  = 360 - 360 sin(lat) check (deg)", 360-360*math.sin(math.radians(lat)))
r_gpb = 6.378137e6 + 642e3
Om = 1.5*GMe**1.5/(c**2*r_gpb**2.5)
P("S13", "GP-B geodetic precession, circular 642 km orbit (mas/yr)", Om*yr/mas)

# ---------------- Step 14 curvature ----------------
P("S14", "Riemann independent components n^2(n^2-1)/12 for n=2,3,4", "1, 6, 20")
for name, Mm in [("10 Msun", 10*Msun), ("Sgr A* 4.30e6 Msun", 4.30e6*Msun), ("M87* 6.5e9 Msun", 6.5e9*Msun)]:
    rs = 2*G*Mm/c**2
    grad = 2*G*Mm/rs**3
    P("S14", f"tidal gradient 2GM/r^3 at horizon, {name} (s^-2)", grad)
    P("S14", f"  head-to-foot (2 m) at horizon (m/s^2)", grad*2)
    P("S14", f"  Kretschmann 48G^2M^2/(c^4 r^6) at horizon (m^-4)", 48*G**2*Mm**2/(c**4*rs**6))
# radius where 2 m tidal difference = 10 g for 10 Msun
Mm = 10*Msun
r10g = (2*G*Mm*2/(10*9.81))**(1/3)
P("S14", "radius where 2 m head-foot tidal difference = 10 g, 10 Msun (km)", r10g/1e3)
P("S14", "  in units of r_s", r10g/(2*G*Mm/c**2))

# ---------------- Step 15 Ricci ----------------
P("S15", "Ricci scalar of Earth-radius 2-sphere 2/a^2 (m^-2)", 2/R**2)
rho_w = 1000.0
P("S15", "ball of test particles in water-density medium: Vddot/V = -4 pi G rho (s^-2)", -4*math.pi*G*rho_w)
P("S15", "  timescale 1/sqrt(4 pi G rho) (s)", 1/math.sqrt(4*math.pi*G*rho_w))

# ---------------- Step 16 stress-energy ----------------
S0 = 1361.0
P("S16", "sunlight energy density at 1 AU, S/c (J/m^3)", S0/c)
P("S16", "air: p/c^2 vs rho (ratio)", (1.013e5/c**2)/1.2)

# ---------------- Step 18 EFE ----------------
kappa = 8*math.pi*G/c**4
P("S18", "kappa = 8 pi G/c^4 (N^-1)", kappa)
P("S18", "1/kappa (N)", 1/kappa)
P("S18", "curvature radius 1/sqrt(kappa rho c^2) for water density (m)", 1/math.sqrt(kappa*rho_w*c**2))
P("S18", "  in AU", 1/math.sqrt(kappa*rho_w*c**2)/AU)
H0 = 67.4e3/Mpc; OL = 0.685; Om0 = 0.315
Lam = 3*OL*H0**2/c**2
P("S18", "Lambda = 3 Omega_L H0^2/c^2 (m^-2), H0=67.4, OL=0.685", Lam)
rhoL = Lam*c**2/(8*math.pi*G)
P("S18", "vacuum mass density rho_L (kg/m^3)", rhoL)
P("S18", "vacuum energy density (J/m^3)", rhoL*c**2)

# ---------------- Step 19 Newtonian limit ----------------
P("S19", "h_00 = -2 Phi/c^2 at Earth's surface", 2*GMe/(Re*c**2))
P("S19", "(v/c)^2 for Earth's orbital speed 29.78 km/s", (29.78e3/c)**2)

# ---------------- Step 20 Schwarzschild ----------------
for name, Mm in [("Sun", Msun), ("Earth", Me), ("Sgr A* 4.30e6", 4.30e6*Msun), ("M87* 6.5e9", 6.5e9*Msun), ("GW150914 remnant 62", 62*Msun)]:
    rs = 2*G*Mm/c**2
    P("S20", f"r_s {name} (m)", rs)
    if Mm > 1e35:
        P("S20", f"  r_s {name} (AU)", rs/AU)
    P("S20", f"  'mean density' M/(4/3 pi r_s^3) {name} (kg/m^3)", Mm/(4/3*math.pi*rs**3))

# ---------------- Step 21 orbits ----------------
Tsun = GMsun/c**3
P("S21", "GM_sun/c^3 (s)", Tsun)
for m in (1, 10, 62):
    risco = 6*G*m*Msun/c**2
    forb = 1/(2*math.pi)*math.sqrt(G*m*Msun/risco**3)
    P("S21", f"ISCO radius {m} Msun (km)", risco/1e3)
    P("S21", f"  orbital frequency at ISCO (Hz)", forb)
    P("S21", f"  GW frequency at ISCO 2 f_orb (Hz)", 2*forb)
P("S21", "efficiency 1-sqrt(8/9)", 1-math.sqrt(8/9))
P("S21", "L_isco = 2 sqrt(3) GM/c (units GM/c)", 2*math.sqrt(3))
P("S21", "orbital speed at ISCO measured by static observer (c): v = sqrt(M/(r-2M)) at r=6M", math.sqrt(1/4))

# ---------------- Step 22 horizons ----------------
for name, Mm in [("10 Msun", 10*Msun), ("Sgr A*", 4.30e6*Msun), ("M87*", 6.5e9*Msun)]:
    tmax = math.pi*G*Mm/c**3
    P("S22", f"max proper time horizon->singularity pi GM/c^3, {name} (s)", tmax)
    tff = 4/3*G*Mm/c**3
    P("S22", f"  free fall from rest at infinity: proper time r_s->0 = (4/3)GM/c^3 (s)", tff)
for m in (1.0, 4.30e6):
    TH = hbar*c**3/(8*math.pi*G*m*Msun*kB)
    P("S22", f"Hawking temperature {m} Msun (K)", TH)
A1 = 16*math.pi*(G*36*Msun)**2/c**4 + 16*math.pi*(G*29*Msun)**2/c**4
P("S22", "GW150914 initial horizon areas (non-spinning approx) 36+29 Msun (km^2)", A1/1e6)
A2 = 16*math.pi*(G*62*Msun)**2/c**4
P("S22", "62 Msun non-spinning area (km^2) [upper bound for spinning remnant]", A2/1e6)
def kerr_area(Mm, chi):
    m = G*Mm/c**2
    rp = m*(1+math.sqrt(1-chi**2))
    return 4*math.pi*(rp**2 + (chi*m)**2)
P("S22", "62 Msun, chi=0.67 Kerr area (km^2)", kerr_area(62*Msun, 0.67)/1e6)
A_250 = 16*math.pi*(G*33.6*Msun)**2/c**4 + 16*math.pi*(G*32.2*Msun)**2/c**4
P("S22", "GW250114 initial areas 33.6+32.2 Msun (km^2)", A_250/1e6)

# ---------------- Step 23 redshift ----------------
P("S23", "Sun surface GM/(Rc^2)", GMsun/(Rsun*c**2))
P("S23", "  as velocity cz (m/s)", GMsun/(Rsun*c**2)*c)
ns = 2*G*1.4*Msun/(1.2e4*c**2)
P("S23", "neutron star 1.4 Msun R=12 km: r_s/R", ns)
P("S23", "  1+z = 1/sqrt(1-r_s/R)", 1/math.sqrt(1-ns))
P("S23", "static emitter at r=3 r_s: z", 1/math.sqrt(1-1/3)-1)
P("S23", "static clock at r=1.5 r_s rate factor", math.sqrt(1-1/1.5))
P("S23", "Earth-surface clock vs infinity GM/(Rc^2)", GMe/(Re*c**2))

# ---------------- Step 24 light bending ----------------
defl = 4*GMsun/(c**2*Rsun)
P("S24", "solar limb deflection 4GM/(c^2 R) (arcsec)", defl/arcsec)
P("S24", "Newtonian/corpuscular half (arcsec)", defl/2/arcsec)
P("S24", "deflection at 90 deg elongation (b = 1 AU) (mas)", 4*GMsun/(c**2*AU)/mas)
DL, DS = 4e3*pc, 8e3*pc; DLS = DS-DL
thE = math.sqrt(4*G*0.5*Msun/c**2*DLS/(DL*DS))
P("S24", "Einstein radius, 0.5 Msun lens at 4 kpc, source 8 kpc (mas)", thE/mas)
P("S24", "  physical Einstein radius at lens (AU)", thE*DL/AU)
r1, r2 = AU, 1.524*AU
dt = 4*GMsun/c**3*math.log(4*r1*r2/Rsun**2)
P("S24", "Shapiro round-trip delay Earth-Mars superior conjunction, ray grazing Sun (us)", dt*1e6)
for name, Mm, D in [("Sgr A* 4.30e6 Msun, 8.275 kpc", 4.30e6, 8275*pc), ("M87* 6.5e9 Msun, 16.8 Mpc", 6.5e9, 16.8*Mpc)]:
    sh = 2*math.sqrt(27)*G*Mm*Msun/(c**2*D)
    P("S24", f"Schwarzschild shadow angular diameter {name} (uas)", sh/uas)
P("S24", "shadow diameter / horizon diameter = sqrt(27)/2", math.sqrt(27)/2)

# exact null-geodesic deflection check: phi integral for u'' + u = 3 M u^2
def exact_deflection(M, b):
    # turning point u0 solves 1/b^2 = u^2 (1 - 2 M u)
    u0 = brentq(lambda u: u*u*(1-2*M*u) - 1/b**2, 1e-12, 1/(3*M))
    # Delta phi = 2 int_0^u0 du / sqrt(1/b^2 - u^2 (1-2Mu)) - pi
    f = lambda w: 1/math.sqrt(1/b**2 - (u0*(1-w*w))**2*(1-2*M*u0*(1-w*w)))*2*u0*w
    val, _ = quad(f, 0, 1, limit=200)
    return 2*val - math.pi
for b_over_M in (1e3, 1e4):
    d = exact_deflection(1.0, b_over_M)
    P("S24", f"exact deflection b={b_over_M:g} M (rad) vs 4M/b + 15 pi M^2/(4 b^2)", f"{d:.9e} vs {4/b_over_M + 15*math.pi/(4*b_over_M**2):.9e}")

# ---------------- Step 25 precession ----------------
def prec_per_orbit(GM, a, e):
    return 6*math.pi*GM/(c**2*a*(1-e*e))
for name, a, e, Pd in [("Mercury", 5.7909e10, 0.20563, 87.969), ("Venus", 1.08209e11, 0.006772, 224.701), ("Earth", 1.495978707e11, 0.0167086, 365.256)]:
    dphi = prec_per_orbit(GMsun, a, e)
    P("S25", f"{name} GR precession per century (arcsec)", dphi/arcsec*36525/Pd)
# S2: pericentre 120 AU, e = 0.88 (rounded values from GRAVITY)
e2 = 0.88; a2 = 120*AU/(1-e2)
P("S25", "S2 semi-major axis from 120 AU pericentre, e=0.88 (AU)", a2/AU)
P("S25", "S2 Schwarzschild precession per orbit (arcmin)", prec_per_orbit(G*4.30e6*Msun, a2, e2)/arcsec/60)
# Hulse-Taylor
Pb = 7.7519*3600; eHT = 0.617; mp_, mc_ = 1.438, 1.390; Mtot = mp_+mc_
wdot = 3*(Pb/(2*math.pi))**(-5/3)*(Tsun*Mtot)**(2/3)/(1-eHT**2)
P("S25", "Hulse-Taylor periastron advance (deg/yr)", math.degrees(wdot)*yr)
# numerical check of precession by integrating Binet equation u'' + u = M/L^2 + 3 M u^2
def numeric_precession(M=1.0, p=1000.0, e=0.5):
    L2 = M*p  # Newtonian semi-latus rectum p = L^2/M
    def rhs(phi, y):
        u, du = y
        return [du, M/L2 - u + 3*M*u*u]
    u0 = (1+e)/p  # start at perihelion
    sol = solve_ivp(rhs, [0, 4*math.pi], [u0, 0.0], rtol=1e-12, atol=1e-15, dense_output=True, max_step=0.01)
    # find next perihelion: du/dphi crosses 0 from + to - near 2 pi
    phis = np.linspace(math.pi*1.5, math.pi*2.5, 200001)
    du = sol.sol(phis)[1]
    idx = np.where((du[:-1] > 0) & (du[1:] <= 0))[0][0]
    phi_peri = brentq(lambda ph: sol.sol(ph)[1], phis[idx], phis[idx+1])
    return phi_peri - 2*math.pi
d_num = numeric_precession(1.0, 1000.0, 0.5)
P("S25", "Binet-equation numeric perihelion shift, M=1, p=1000M, e=0.5 (rad) vs 6 pi M/p", f"{d_num:.6e} vs {6*math.pi/1000:.6e}")

# ---------------- Step 26 Kerr ----------------
def kerr_isco(chi, prograde=True):
    Z1 = 1 + (1-chi**2)**(1/3)*((1+chi)**(1/3)+(1-chi)**(1/3))
    Z2 = math.sqrt(3*chi**2+Z1**2)
    s = -1 if prograde else 1
    return 3 + Z2 + s*math.sqrt((3-Z1)*(3+Z1+2*Z2))
def kerr_E(r, chi, prograde=True):
    a = chi if prograde else -chi
    return (1 - 2/r + a/r**1.5)/math.sqrt(1 - 3/r + 2*a/r**1.5)
for chi in (0.0, 0.5, 0.67, 0.9, 0.998, 0.999999):
    rp = 1+math.sqrt(1-chi**2); rm = 1-math.sqrt(1-chi**2)
    ri_p = kerr_isco(chi, True); ri_r = kerr_isco(chi, False)
    P("S26", f"chi={chi}: r+ , r- (GM/c^2)", f"{rp:.4f}, {rm:.4f}")
    P("S26", f"  ISCO prograde, retrograde (GM/c^2)", f"{ri_p:.4f}, {ri_r:.4f}")
    P("S26", f"  efficiency prograde 1-E_isco", 1-kerr_E(ri_p, chi, True))
    P("S26", f"  efficiency retrograde", 1-kerr_E(ri_r, chi, False))
    Mirr = math.sqrt((1+math.sqrt(1-chi**2))/2)
    P("S26", f"  irreducible mass fraction / extractable fraction", f"{Mirr:.4f} / {1-Mirr:.4f}")
P("S26", "maximal Kerr efficiency 1-1/sqrt(3)", 1-1/math.sqrt(3))
chi = 0.9; Mm = 10*Msun; rp = 1+math.sqrt(1-chi**2)
OmH = chi/(2*rp)/(G*Mm/c**3)
P("S26", "Omega_H for 10 Msun chi=0.9 (rad/s)", OmH)
P("S26", "  horizon rotation frequency Omega_H/2pi (Hz)", OmH/(2*math.pi))
P("S26", "ergosphere equatorial radius (GM/c^2) any chi", 2.0)

# ---------------- Step 27 GWs ----------------
P("S27", "Delta L = h L for h=1e-21, L=4 km (m)", 1e-21*4e3)
m1, m2 = 36.0, 29.0
Mc = (m1*m2)**0.6/(m1+m2)**0.2
P("S27", "GW150914 source-frame chirp mass from 36+29 (Msun)", Mc)
P("S27", "  detector-frame chirp mass (1+z) with z=0.09", Mc*1.09)
P("S27", "energy radiated 3 Msun c^2 (J)", 3*Msun*c**2)
P("S27", "410 Mpc in Gly", 410*Mpc/ly/1e9)
Mcz = Mc*1.09*Msun; DL_ = 410*Mpc
for f in (35.0, 150.0):
    h = 4*(G*Mcz/c**2)**(5/3)*(math.pi*f/c)**(2/3)/DL_
    P("S27", f"leading-order strain amplitude at f_GW={f} Hz, optimally oriented", h)
# frequency evolution: time to coalescence from f
def tau_coal(Mc_s, f):
    return 5/256*(G*Mc_s/c**3)**(-5/3)*(math.pi*f)**(-8/3)
P("S27", "time to coalescence from f_GW=35 Hz for Mc_z (s)", tau_coal(Mcz, 35.0))
# Earth-Sun GW power
Pes = 32/5*G**4/c**5*(Msun*Me)**2*(Msun+Me)/AU**5
P("S27", "Earth-Sun GW power (W)", Pes)
# Hulse-Taylor GW power and Pdot
aHT = (G*Mtot*Msun*Pb**2/(4*math.pi**2))**(1/3)
fe = (1 + 73/24*eHT**2 + 37/96*eHT**4)/(1-eHT**2)**3.5
PHT = 32/5*G**4/c**5*(mp_*mc_*Msun**2)**2*(Mtot*Msun)/aHT**5*fe
P("S27", "Hulse-Taylor semi-major axis (m)", aHT)
P("S27", "Peters-Mathews enhancement f(e) at e=0.617", fe)
P("S27", "Hulse-Taylor GW power (W)", PHT)
Pbdot = -192*math.pi/5*(Pb/(2*math.pi))**(-5/3)*fe*Tsun**(5/3)*mp_*mc_*Mtot**(-1/3)
P("S27", "Hulse-Taylor predicted dPb/dt (s/s)", Pbdot)
P("S27", "  i.e. per year (us)", Pbdot*yr*1e6)
# time to merger by integrating Peters equations
def peters(t, y, m1=mp_*Msun, m2=mc_*Msun):
    a, e = y
    beta_ = 64/5*G**3*m1*m2*(m1+m2)/c**5
    dadt = -beta_/(a**3*(1-e*e)**3.5)*(1+73/24*e*e+37/96*e**4)
    dedt = -19/12*beta_/(a**4*(1-e*e)**2.5)*e*(1+121/304*e*e)
    return [dadt, dedt]
ev = lambda t, y: y[0] - 2e5
ev.terminal = True
sol = solve_ivp(peters, [0, 1e18], [aHT, eHT], events=ev, rtol=1e-9, atol=1.0, method='LSODA')
P("S27", "Hulse-Taylor time to merger by Peters equations (Myr)", sol.t_events[0][0]/yr/1e6)

# ---------------- Step 28 linearized ----------------
P("S28", "dof count 10 - 4 (gauge) - 4 (residual) =", 2)
P("S28", "proper change of x-arm for h+ (fraction of L) = h/2 per arm; differential = h", "h/2 each, h total")

# ---------------- Step 30-31 cosmology ----------------
P("S30", "Hubble time 1/H0 for 67.4 (Gyr)", 1/H0/yr/1e9)
P("S30", "Hubble time 1/H0 for 73.0 (Gyr)", 1/(73e3/Mpc)/yr/1e9)
P("S30", "Hubble radius c/H0 (Mpc)", c/H0/Mpc)
P("S30", "  in Gly", c/H0/ly/1e9)
P("S30", "recession velocity at 100 Mpc for H0=67.4 (km/s)", 67.4*100)
P("S30", "CMB temperature at z=1089.9 from T0=2.725 K (K)", 2.725*1090.9)
P("S31", "critical density 3H0^2/(8 pi G) for 67.4 (kg/m^3)", 3*H0**2/(8*math.pi*G))
P("S31", "  protons per m^3", 3*H0**2/(8*math.pi*G)/1.67262192e-27)
P("S31", "Einstein-de Sitter age 2/(3H0) for 67.4 (Gyr)", 2/(3*H0)/yr/1e9)
t0 = 2/(3*H0*math.sqrt(OL))*math.asinh(math.sqrt(OL/Om0))
P("S31", "flat LCDM age (Om=0.315, OL=0.685, H0=67.4, no radiation) (Gyr)", t0/yr/1e9)
P("S31", "deceleration parameter q0 = Om/2 - OL", Om0/2-OL)
P("S31", "matter-Lambda equality z = (OL/Om)^(1/3)-1", (OL/Om0)**(1/3)-1)
P("S31", "onset of acceleration z = (2 OL/Om)^(1/3)-1", (2*OL/Om0)**(1/3)-1)
Hz = lambda z: H0*math.sqrt(Om0*(1+z)**3+OL)
DC, _ = quad(lambda z: c/Hz(z), 0, 1)
P("S31", "comoving distance to z=1 (Gpc)", DC/Mpc/1e3)
tl, _ = quad(lambda z: 1/((1+z)*Hz(z)), 0, 1)
P("S31", "lookback time to z=1 (Gyr)", tl/yr/1e9)
# age with radiation included (Omega_r h^2 ~ 4.15e-5 photons*1.69 for neutrinos)
h_ = 0.674; Orad = 4.15e-5/h_**2*1.0 + 0.0  # photons only, illustrative
Orad_tot = 9.1e-5
ag, _ = quad(lambda a: 1/(a*H0*math.sqrt(Om0/a**3 + Orad_tot/a**4 + (1-Om0-Orad_tot))), 1e-12, 1)
P("S31", "flat LCDM age incl. radiation Omega_r=9.1e-5 (Gyr)", ag/yr/1e9)
# Hubble tension significance
for (Hl, sl) in [(73.04, 1.04), (73.18, 0.88), (73.50, 0.81)]:
    for (He, se) in [(67.4, 0.5), (67.19, 0.38)]:
        P("S31", f"tension ({Hl}+-{sl}) vs ({He}+-{se}) in sigma", (Hl-He)/math.sqrt(sl**2+se**2))

# ---------------- Step 32 NR: QNM via Leaver continued fraction ----------------
def leaver(omega, l=2, s=2, N=4000):
    # 2M = 1 units, Schwarzschild; Leaver (1985) recurrence coefficients
    rho = -1j*omega
    def coeffs(n):
        an = n**2 + (2*rho+2)*n + 2*rho + 1
        bn = -(2*n**2 + (8*rho+2)*n + 8*rho**2 + 4*rho + l*(l+1) - s**2 + 1)
        cn = n**2 + 4*rho*n + 4*rho**2 - s**2
        return an, bn, cn
    # evaluate continued fraction from deep n backward
    val = 0j
    for n in range(N, 0, -1):
        an, bn, cn = coeffs(n)
        a_prev, _, _ = coeffs(n-1)
        val = a_prev*cn/(bn - val)
    a0, b0, c0 = coeffs(0)
    return b0 - val
from scipy.optimize import fsolve
def F(v):
    w = v[0] + 1j*v[1]
    r_ = leaver(w)
    return [r_.real, r_.imag]
sol = fsolve(F, [0.74, -0.18], xtol=1e-14)
w2M = sol[0] + 1j*sol[1]
P("S32", "Schwarzschild l=2 n=0 QNM, 2M*omega", f"{w2M.real:.6f} {w2M.imag:+.6f}i")
P("S32", "  M*omega", f"{w2M.real/2:.6f} {w2M.imag/2:+.6f}i")
for mf in (62.0, 10.0):
    Ts = G*mf*Msun/c**3
    f = (w2M.real/2)/Ts/(2*math.pi); tau = 1/(abs(w2M.imag/2)/Ts)
    P("S32", f"Schwarzschild ringdown for {mf} Msun: f (Hz)", f)
    P("S32", f"  damping time (ms)", tau*1e3)
# Kerr fit (Berti, Cardoso & Will 2006) for chi=0.67 -- flagged as unverified source in notes
F_ = 1.5251 - 1.1568*(1-0.67)**0.1292
P("S32", "Kerr l=m=2 fit M*omega at chi=0.67 (BCW 2006 fit, unverified)", F_)
P("S32", "  f for 62 Msun (Hz)", F_/(G*62*Msun/c**3)/(2*math.pi))
P("S32", "  detector-frame f for z=0.09 (Hz)", F_/(G*62*Msun/c**3)/(2*math.pi)/1.09)
# Painleve-Gullstrand river speed equals Newtonian escape speed
P("S32", "PG shift (river speed) at r = 4 r_s in c", math.sqrt(1/4))

# ---------------- Step 33 energy conditions ----------------
d = 1e-6
rhoC = -math.pi**2*hbar*c/(720*d**4)
P("S33", "Casimir energy density, plates 1 um apart (J/m^3)", rhoC)
P("S33", "Casimir attractive pressure pi^2 hbar c/(240 d^4) at 1 um (Pa)", math.pi**2*hbar*c/(240*d**4))
P("S33", "Casimir energy density at 10 nm (J/m^3)", -math.pi**2*hbar*c/(720*(1e-8)**4))

# ---------------- Step 34 exotic ----------------
for Gmu in (1e-7, 1e-6):
    dl = 8*math.pi*Gmu
    P("S34", f"cosmic string deficit angle for G mu/c^2={Gmu} (arcsec)", dl/arcsec)
P("S34", "Reissner-Nordstrom horizons Q=0.6M: r+-", f"{1+math.sqrt(1-0.36):.3f} M, {1-math.sqrt(1-0.36):.3f} M")

# ---------------- Step 35 wormholes ----------------
for r0 in (1.0, 1e3):
    tension = c**4/(8*math.pi*G*r0**2)
    P("S35", f"throat radial tension c^4/(8 pi G r0^2) for r0={r0} m (Pa)", tension)
    Eside = -math.pi/4*r0*c**2/G
    P("S35", f"Ellis wormhole integrated negative mass per side -(pi/4) r0 c^2/G, r0={r0} m (kg)", Eside)
    P("S35", f"  in Jupiter masses (1.898e27 kg)", Eside/1.898e27)
    P("S35", f"  in solar masses", Eside/Msun)

# ---------------- Step 36 Alcubierre ----------------
# exact integral E = -(c^4 beta^2/(12 G)) int r^2 f'^2 dr for tanh profile, compare with thin-wall c^4 beta^2 R^2 sigma/(36 G)
def alc_energy(R, sig, beta=1.0):
    def sech2(xx):
        ax = abs(xx); return 4*math.exp(-2*ax)/(1+math.exp(-2*ax))**2
    fp = lambda r: (sig/(2*math.tanh(sig*R)))*(sech2(sig*(r+R)) - sech2(sig*(r-R)))
    I, _ = quad(lambda r: r*r*fp(r)**2, max(0, R - 60/sig), R + 60/sig, points=[R], limit=1000)
    return -(c**4*beta**2/(12*G))*I
for R_, sg in [(100.0, 1.0), (100.0, 10.0)]:
    E = alc_energy(R_, sg)
    thin = -(c**4*R_**2*sg/(36*G))
    P("S36", f"Alcubierre E/c^2 R={R_} m sigma={sg}/m beta=1 exact (kg)", E/c**2)
    P("S36", f"  thin-wall approx -c^2 R^2 sigma/(36 G) (kg)", thin/c**2)
    P("S36", f"  in solar masses", E/c**2/Msun)
lP = math.sqrt(hbar*G/c**3)
sig_QI = 2/(100*lP)
P("S36", "Planck length (m)", lP)
P("S36", "thin-wall E/c^2 for R=100 m, wall ~100 l_P (sigma=2/Delta) (kg)", -(c**2*100.0**2*sig_QI/(36*G)))

# ---------------- Step 37 open questions ----------------
rhoP = c**5/(hbar*G**2)
P("S37", "Planck density c^5/(hbar G^2) (kg/m^3)", rhoP)
P("S37", "ratio Planck density / rho_Lambda", rhoP/rhoL)
P("S37", "  log10", math.log10(rhoP/rhoL))
tev = 5120*math.pi*G**2*Msun**3/(hbar*c**4)
P("S37", "Hawking evaporation time 1 Msun (photons+gravitons only formula 5120 pi G^2 M^3/(hbar c^4)) (yr)", tev/yr)
A = 16*math.pi*(G*Msun)**2/c**4
P("S37", "Bekenstein-Hawking entropy 1 Msun S/k_B = A c^3/(4 G hbar)", A*c**3/(4*G*hbar))

open('/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/gr/numeric_results.txt', 'w').write("\n".join(lines))
print("DONE")
