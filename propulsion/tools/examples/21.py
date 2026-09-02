"""
Module 21 — Grain Geometry: worked-example inputs and expected outputs,
plus the star burn-back geometry used in the module and the numerical
check that validated it.

Run:  python3 tools/examples/21.py
It recomputes every EXAMPLES entry with tools/rocket.py, verifies the
closed-form star relations (Eq. 3.6-3.10) against a direct grid Minkowski
sum of the star polygon, and prints the WE tables.

Generic propellant "P-1770" used throughout Module 21 (representative
AP/Al/HTPB composite; not a real formulation):
    rho_p = 1770 kg/m^3
    r     = 5.0 (p_c / 1 MPa)^0.35  mm/s
          -> a = 3.9716411736e-5  m/s / Pa^0.35 ,  n = 0.35
    c*    = 1580 m/s   (delivered)
    sigma_p = 0.0022 /K
"""
from __future__ import annotations
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import rocket as rk  # noqa: E402

# --------------------------------------------------------------------------
# propellant P-1770
# --------------------------------------------------------------------------
RHO = 1770.0
N_EXP = 0.35
CSTAR = 1580.0
A_SI = (5.0e-3) / (1.0e6 ** N_EXP)      # m/s / Pa^n
SIGMA_P = 0.0022                         # 1/K

# --------------------------------------------------------------------------
# EXAMPLES — every entry whose arithmetic maps onto a rocket.py function.
# tol is relative.
# --------------------------------------------------------------------------
EXAMPLES = [
    # ---- WE 21.1  internal-burning tube, Ri0=0.15, Ro=0.30, L=3.0 ---------
    # At = pi/4 * 0.133^2 = 0.01389288 m^2 ; Ab(w) = 2 pi (0.15+w) 3.0
    {"id": "21.WE1.w000", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 2.8274334,
              "At": 0.01389288, "c_star_val": CSTAR},
     "expect": 4.9977e6, "tol": 0.002},
    {"id": "21.WE1.w060", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 3.9584068,
              "At": 0.01389288, "c_star_val": CSTAR},
     "expect": 8.3866e6, "tol": 0.002},
    {"id": "21.WE1.w150", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 5.6548668,
              "At": 0.01389288, "c_star_val": CSTAR},
     "expect": 14.5171e6, "tol": 0.002},
    {"id": "21.WE1.r_at_5MPa", "fn": "vieille_burn_rate",
     "args": {"a": A_SI, "p": 5.0e6, "n": N_EXP},
     "expect": 8.7808e-3, "tol": 0.002},

    # ---- WE 21.2  end burner, F = 2.00 kN for 120 s ----------------------
    # r at 4 MPa; then Ab = F/(CF c* rho r), L = r tb, At = mdot c*/pc
    {"id": "21.WE2.r_at_4MPa", "fn": "vieille_burn_rate",
     "args": {"a": A_SI, "p": 4.0e6, "n": N_EXP},
     "expect": 8.1225e-3, "tol": 0.002},
    {"id": "21.WE2.pc_check", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 0.0568020,
              "At": 3.225616e-4, "c_star_val": CSTAR},
     "expect": 4.0000e6, "tol": 0.002},
    {"id": "21.WE2.c_eff", "fn": "c_eff",
     "args": {"c_star_val": CSTAR, "Cf_val": 1.55},
     "expect": 2449.0, "tol": 0.002},
    {"id": "21.WE2.isp", "fn": "isp_from_c",
     "args": {"c_eff": 2449.0},
     "expect": 249.73, "tol": 0.002},

    # ---- WE 21.3  8-point neutral star, Ro=0.30, L=3.0, Rp=0.2024 --------
    # At = pi/4 * 0.184^2 = 0.02659044 m^2
    {"id": "21.WE3.y0000", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 6.109438,
              "At": 0.02659044, "c_star_val": CSTAR},
     "expect": 6.0230e6, "tol": 0.002},
    {"id": "21.WE3.y0448", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 6.121859,
              "At": 0.02659044, "c_star_val": CSTAR},
     "expect": 6.0418e6, "tol": 0.002},
    {"id": "21.WE3.y0896", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 6.134281,
              "At": 0.02659044, "c_star_val": CSTAR},
     "expect": 6.0607e6, "tol": 0.002},

    # ---- problems / quiz -------------------------------------------------
    {"id": "21.C4.piK", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": SIGMA_P, "n": N_EXP},
     "expect": 3.38462e-3, "tol": 0.002},
    {"id": "21.C4.hot30K", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 3.384615e-3, "dT": 30.0},
     "expect": 1.10693, "tol": 0.002},
    {"id": "21.Q4.pc0", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 1.5707963,
              "At": 0.0090, "c_star_val": CSTAR},
     "expect": 3.9457e6, "tol": 0.002},
    {"id": "21.Q4.pcf", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 3.9269908,
              "At": 0.0090, "c_star_val": CSTAR},
     "expect": 16.1560e6, "tol": 0.002},
]

# Examples whose arithmetic does NOT map onto a rocket.py function, and are
# therefore checked by the routines below instead:
#   21.WE1 burn time      - numerical integration of dw/r over the web
#   21.WE2 grain sizing   - Ab = F/(CF c* rho r), L = r tb, geometry only
#   21.WE3 star geometry  - Eq. 3.6-3.11, implemented in star_geometry()
#   21.WE3 V_L, sliver    - areas from Eq. 3.8
#   21.WE4                - inversion of Eq. 3.2, pure algebra
#   21.C3, 21.Q6          - star neutrality root-find, neutral_theta()
#   21.T1                 - trade study, trade_study()


# --------------------------------------------------------------------------
# Star grain geometry — Eq. 3.6 to 3.11 of Module 21
# --------------------------------------------------------------------------
def star_geometry(N: int, theta: float, Rp: float) -> dict:
    """Sharp N-point reference star polygon. theta in radians.

    Returns beta, s0 (flank length), Ri (valley radius), P0 (perimeter),
    dPdu (Eq. 3.7 slope), A0 (polygon area), u1 (Phase-I limit).
    """
    beta = math.pi / N
    s0 = Rp * math.sin(beta) / math.sin(beta + theta)
    Ri = Rp * math.sin(theta) / math.sin(beta + theta)
    return {
        "beta": beta,
        "s0": s0,
        "Ri": Ri,
        "P0": 2 * N * s0,
        "dPdu": 2 * N * ((math.pi / 2 - theta) - 1.0 / math.tan(beta + theta)),
        "A0": N * Rp * Ri * math.sin(beta),
        "u1": s0 * math.tan(beta + theta),
    }


def star_perimeter(N: int, theta: float, Rp: float, u: float) -> float:
    """Burning perimeter at total offset u = f + y.  Eq. 3.7 / Eq. 3.10."""
    g = star_geometry(N, theta, Rp)
    if u <= g["u1"]:
        return g["P0"] + g["dPdu"] * u                      # Eq. 3.7
    c = min(1.0, Rp * math.sin(g["beta"]) / u)
    return N * u * (math.pi + 2 * g["beta"] - 2 * math.acos(c))   # Eq. 3.10


def star_port_area(N: int, theta: float, Rp: float, u: float) -> float:
    """Port cross-sectional area at offset u (Phase I only).  Eq. 3.8."""
    g = star_geometry(N, theta, Rp)
    assert u <= g["u1"] + 1e-12, "Eq. 3.8 is Phase-I only"
    return g["A0"] + g["P0"] * u + 0.5 * g["dPdu"] * u * u


def neutral_theta(N: int) -> float:
    """Root of Eq. 3.9:  pi/2 - theta = cot(pi/N + theta).  Radians.

    Returns None when no root exists in (0, pi/2 - beta) — i.e. N <= 5,
    where the star is progressive for every flank angle.
    """
    beta = math.pi / N
    f = lambda t: (math.pi / 2 - t) - 1.0 / math.tan(beta + t)
    lo, hi = 1e-9, math.pi / 2 - beta - 1e-9
    if f(lo) * f(hi) > 0:
        return None
    for _ in range(300):
        mid = 0.5 * (lo + hi)
        if f(lo) * f(mid) <= 0:
            hi = mid
        else:
            lo = mid
    return 0.5 * (lo + hi)


def phase1_sizing_Rp(N: int, theta: float, Ro: float) -> float:
    """Eq. 3.11: Rp such that the flanks vanish exactly at tip contact."""
    beta = math.pi / N
    k = math.sin(beta) / math.cos(beta + theta)
    return Ro / (1.0 + k)


# --------------------------------------------------------------------------
# Ballistics helpers
# --------------------------------------------------------------------------
def pc_of(Ab: float, At: float) -> float:
    return rk.solid_equilibrium_pressure(A_SI, N_EXP, RHO, Ab, At, CSTAR)


def rate_of(p: float) -> float:
    return rk.vieille_burn_rate(A_SI, p, N_EXP)


def burn_time(Ab_of_web, web: float, At: float, steps: int = 20001) -> float:
    """t_b = integral dw / r(pc(Ab(w))) by the midpoint rule."""
    t = 0.0
    dw = web / (steps - 1)
    for i in range(1, steps):
        w = (i - 0.5) * dw
        t += dw / rate_of(pc_of(Ab_of_web(w), At))
    return t


# --------------------------------------------------------------------------
# Numerical validation of the closed-form star relations
# --------------------------------------------------------------------------
def _grid_offset_area(N: int, theta: float, Rp: float, u: float,
                      cells: int = 600) -> float:
    """Area of the sharp star polygon dilated by u (Minkowski sum), by
    direct grid sampling. Slow and dumb on purpose: it shares no algebra
    with star_port_area(), so agreement is a real check."""
    beta = math.pi / N
    Ri = Rp * math.sin(theta) / math.sin(beta + theta)
    V = []
    for k in range(N):
        a = 2 * beta * k
        V.append((Rp * math.cos(a), Rp * math.sin(a)))
        V.append((Ri * math.cos(a + beta), Ri * math.sin(a + beta)))

    def inside(px, py):
        c, j = False, len(V) - 1
        for i in range(len(V)):
            xi, yi = V[i]
            xj, yj = V[j]
            if ((yi > py) != (yj > py)) and \
               (px < (xj - xi) * (py - yi) / (yj - yi) + xi):
                c = not c
            j = i
        return c

    def dist(px, py):
        dm, j = 1e9, len(V) - 1
        for i in range(len(V)):
            ax, ay = V[j]
            bx, by = V[i]
            dx, dy = bx - ax, by - ay
            t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) /
                             (dx * dx + dy * dy)))
            d = math.hypot(px - ax - t * dx, py - ay - t * dy)
            dm = min(dm, d)
            j = i
        return dm

    S = Rp + u + 0.02
    h = 2 * S / cells
    n_in = 0
    for i in range(cells):
        px = -S + (i + 0.5) * h
        for j in range(cells):
            py = -S + (j + 0.5) * h
            if inside(px, py) or dist(px, py) <= u:
                n_in += 1
    return n_in * h * h


# --------------------------------------------------------------------------
# Reports
# --------------------------------------------------------------------------
def we1():
    Ro, Ri0, L = 0.300, 0.150, 3.00
    At = math.pi / 4 * 0.133 ** 2
    Ab = lambda w: 2 * math.pi * (Ri0 + w) * L
    print("WE 21.1  internal-burning tube   At = %.7f m^2 (Dt = 133.0 mm)" % At)
    print("   w[m]   Ab[m2]     Kn      pc[MPa]   r[mm/s]")
    for w in (0.00, 0.03, 0.06, 0.09, 0.12, 0.15):
        p = pc_of(Ab(w), At)
        print("  %.2f   %7.4f  %7.1f  %8.3f  %7.3f"
              % (w, Ab(w), Ab(w) / At, p / 1e6, rate_of(p) * 1e3))
    print("   t_b = %.3f s ; m_prop = %.1f kg ; V_L = %.4f ; J0 = %.2f"
          % (burn_time(Ab, Ro - Ri0, At),
             RHO * math.pi * (Ro ** 2 - Ri0 ** 2) * L,
             (Ro ** 2 - Ri0 ** 2) / Ro ** 2,
             math.pi * Ri0 ** 2 / At))


def we2():
    F, tb, CF, pc = 2000.0, 120.0, 1.55, 4.0e6
    r = rate_of(pc)
    Ab = F / (CF * CSTAR * RHO * r)
    D = math.sqrt(4 * Ab / math.pi)
    L = r * tb
    mdot = F / (CF * CSTAR)
    At = mdot * CSTAR / pc
    mp = RHO * Ab * L
    print("\nWE 21.2  end burner  F = 2.00 kN, t_b = 120 s, pc = 4.00 MPa")
    print("   r = %.4f mm/s ; Ab = %.5f m^2 ; D = %.4f m ; L = %.4f m ; L/D = %.2f"
          % (r * 1e3, Ab, D, L, L / D))
    print("   mdot = %.4f kg/s ; At = %.7f m^2 (Dt = %.2f mm) ; Kn = %.1f"
          % (mdot, At, math.sqrt(4 * At / math.pi) * 1e3, Ab / At))
    print("   m_prop = %.2f kg ; I_tot = %.1f kN.s ; Isp = %.2f s"
          % (mp, F * tb / 1e3, rk.isp_from_c(rk.c_eff(CSTAR, CF))))
    print("   check pc = %.4f MPa" % (pc_of(Ab, At) / 1e6))


def we3():
    N, Ro, L, f = 8, 0.300, 3.00, 0.008
    theta = math.radians(15.0)
    Rp = 0.2024
    g = star_geometry(N, theta, Rp)
    At = math.pi / 4 * 0.184 ** 2
    uend = Ro - Rp
    print("\nWE 21.3  8-point neutral star  Rp = %.4f m, theta = 15.00 deg, f = 8 mm"
          % Rp)
    print("   beta = %.3f deg ; s0 = %.6f ; Ri = %.6f ; P0 = %.6f ; dP/du = %.6f"
          % (math.degrees(g["beta"]), g["s0"], g["Ri"], g["P0"], g["dPdu"]))
    print("   u1 = %.6f m   vs   Ro - Rp = %.6f m   (ratio %.4f)"
          % (g["u1"], uend, g["u1"] / uend))
    print("    y[m]     u[m]     P[m]      Ab[m2]     Kn      pc[MPa]  r[mm/s]")
    for y in (0.0, 0.0224, 0.0448, 0.0672, 0.0896):
        u = f + y
        P = star_perimeter(N, theta, Rp, u)
        Ab = P * L
        p = pc_of(Ab, At)
        print("   %.4f  %.4f  %.5f  %8.4f  %7.2f  %8.4f  %7.3f"
              % (y, u, P, Ab, Ab / At, p / 1e6, rate_of(p) * 1e3))
    Ap0 = star_port_area(N, theta, Rp, f)
    Ape = star_port_area(N, theta, Rp, uend)
    Ac = math.pi * Ro ** 2
    Abf = lambda y: star_perimeter(N, theta, Rp, f + y) * L
    print("   A_port(0) = %.6f m^2 ; V_L = %.4f ; m_prop = %.1f kg"
          % (Ap0, (Ac - Ap0) / Ac, RHO * (Ac - Ap0) * L))
    print("   sliver at tip contact = %.2f %% of propellant"
          % (100 * (Ac - Ape) / (Ac - Ap0)))
    print("   J0 = %.2f ; t_b = %.3f s"
          % (Ap0 / At, burn_time(Abf, 0.0896, At)))

    # deep-star comparison (WE 21.3 step 7)
    th2, Rp2, f2 = math.radians(30.0), 0.140, 0.010
    g2 = star_geometry(N, th2, Rp2)
    Ap2 = star_port_area(N, th2, Rp2, f2)
    print("   -- deep star Rp = 0.140, theta = 30 deg, f = 10 mm --")
    print("      P0 = %.5f ; dP/du = %.5f ; u1 = %.5f ; V_L = %.4f ; m_prop = %.1f kg"
          % (g2["P0"], g2["dPdu"], g2["u1"], (Ac - Ap2) / Ac,
             RHO * (Ac - Ap2) * L))
    print("      Ab: %.4f m^2 at cast -> %.4f m^2 at web burnout (%+.1f %%)"
          % (star_perimeter(N, th2, Rp2, f2) * L,
             star_perimeter(N, th2, Rp2, 0.160) * L,
             100 * (star_perimeter(N, th2, Rp2, 0.160) /
                    star_perimeter(N, th2, Rp2, f2) - 1)))


def neutrality_table():
    print("\nEq. 3.9 neutrality roots")
    print("    N   theta_neutral [deg]   u1/Rp")
    for N in (4, 5, 6, 7, 8, 9, 10, 11, 12, 16):
        th = neutral_theta(N)
        if th is None:
            print("   %2d   --- (always progressive)" % N)
            continue
        beta = math.pi / N
        print("   %2d        %6.2f            %.4f"
              % (N, math.degrees(th), math.sin(beta) / math.cos(beta + th)))


def trade_study():
    """T1 reference solution."""
    L, Ro = 3.00, 0.300
    Ac = math.pi * Ro ** 2
    piK = rk.pressure_sensitivity_pi_K(SIGMA_P, N_EXP)
    hot = rk.temperature_sensitivity_pressure(piK, 30.0)
    plim = 9.0e6 / hot
    Kmax = plim ** (1 - N_EXP) / (A_SI * RHO * CSTAR)
    print("\nT1 trade study   hot factor = %.4f -> nominal pc limit = %.4f MPa"
          " -> Kn_max = %.1f" % (hot, plim / 1e6, Kmax))

    # A: neutral star, throat trapped between t_b >= 12 s and J >= 2
    N, th, Rp, f = 8, math.radians(15.0), 0.2024, 0.008
    Ap = star_port_area(N, th, Rp, f)
    AbA = lambda y: star_perimeter(N, th, Rp, f + y) * L
    lo, hi = 0.005, 0.20
    for _ in range(60):
        mid = 0.5 * (lo + hi)
        if burn_time(AbA, 0.0896, mid, 2001) < 12.0:
            lo = mid
        else:
            hi = mid
    AtA = 0.5 * (lo + hi)
    AtJ2 = Ap / 2.0
    print("   A neutral star : m_prop = %.1f kg" % (RHO * (Ac - Ap) * L))
    print("       At for t_b = 12 s : %.6f m^2 -> J0 = %.2f  (FAILS J >= 2)"
          % (AtA, Ap / AtA))
    print("       At for J0 = 2.0   : %.6f m^2 -> t_b = %.2f s  (FAILS t_b >= 12)"
          % (AtJ2, burn_time(AbA, 0.0896, AtJ2)))

    # B: deep star
    th2, Rp2, f2 = math.radians(30.0), 0.140, 0.010
    Ap2 = star_port_area(N, th2, Rp2, f2)
    AbB = lambda y: star_perimeter(N, th2, Rp2, f2 + y) * L
    AtB = AbB(0.150) / Kmax
    print("   B deep star    : m_prop = %.1f kg ; At = %.6f ; J0 = %.2f ; "
          "t_b = %.2f s ; pc %.2f -> %.2f MPa"
          % (RHO * (Ac - Ap2) * L, AtB, Ap2 / AtB,
             burn_time(AbB, 0.150, AtB),
             pc_of(AbB(0.0), AtB) / 1e6, pc_of(AbB(0.150), AtB) / 1e6))

    # C: CP tube, bore set by J >= 2
    AtC = 2 * math.pi * Ro * L / Kmax
    Ri0 = math.sqrt(2.0 * AtC / math.pi)
    AbC = lambda w: 2 * math.pi * (Ri0 + w) * L
    print("   C CP tube      : Ri0 = %.4f m ; m_prop = %.1f kg ; At = %.6f ; "
          "J0 = 2.00 ; t_b = %.2f s ; pc %.2f -> %.2f MPa"
          % (Ri0, RHO * math.pi * (Ro ** 2 - Ri0 ** 2) * L, AtC,
             burn_time(AbC, Ro - Ri0, AtC),
             pc_of(AbC(0.0), AtC) / 1e6, pc_of(AbC(Ro - Ri0), AtC) / 1e6))


# --------------------------------------------------------------------------
def check_examples() -> int:
    bad = 0
    for e in EXAMPLES:
        got = getattr(rk, e["fn"])(**e["args"])
        rel = abs(got - e["expect"]) / abs(e["expect"])
        ok = rel <= e["tol"]
        bad += 0 if ok else 1
        print("  %-22s %-32s got %.6g  expect %.6g  (%.2e)  %s"
              % (e["id"], e["fn"], got, e["expect"], rel,
                 "OK" if ok else "FAIL"))
    return bad


def check_star_closed_form() -> int:
    """Eq. 3.8 against a direct grid Minkowski sum. Independent algebra."""
    bad = 0
    print("\nEq. 3.7/3.8 closed form vs grid Minkowski sum")
    # The grid check is O(cells^2 * edges) in pure Python; two cases at two
    # offsets is enough to catch an algebra error, and the tolerance is set
    # by the grid resolution (half a cell along the whole perimeter), not by
    # the closed form.
    cases = [(8, 15.0, 0.2024), (11, 25.0, 0.218122)]
    for (N, th_deg, Rp) in cases:
        th = math.radians(th_deg)
        g = star_geometry(N, th, Rp)
        for frac in (0.20, 1.00):
            u = g["u1"] * frac
            a_c = star_port_area(N, th, Rp, u)
            a_g = _grid_offset_area(N, th, Rp, u)
            rel = abs(a_g - a_c) / a_c
            ok = rel < 1e-2
            bad += 0 if ok else 1
            print("   N=%2d theta=%4.1f Rp=%.4f u=%.5f  closed %.6f  grid %.6f"
                  "  err %+.3f %%  %s"
                  % (N, th_deg, Rp, u, a_c, a_g, 100 * (a_g - a_c) / a_c,
                     "OK" if ok else "FAIL"))
        # Phase I / Phase II continuity at u1
        p1 = g["P0"] + g["dPdu"] * g["u1"]
        c = min(1.0, Rp * math.sin(g["beta"]) / g["u1"])
        p2 = N * g["u1"] * (math.pi + 2 * g["beta"] - 2 * math.acos(c))
        ok = abs(p1 - p2) / p1 < 1e-9
        bad += 0 if ok else 1
        print("   ...Eq.3.7/3.10 continuity at u1: %.9f vs %.9f  %s"
              % (p1, p2, "OK" if ok else "FAIL"))
    return bad


if __name__ == "__main__":
    print("Module 21 — recomputing worked examples\n")
    failures = check_examples()
    failures += check_star_closed_form()
    we1()
    we2()
    we3()
    neutrality_table()
    trade_study()
    print("\n%d failure(s)." % failures)
    sys.exit(1 if failures else 0)
