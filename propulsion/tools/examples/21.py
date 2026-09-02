"""Module 21 — Grain Geometry: worked-example check data, plus the star
burn-back geometry (Eq. 3.6-3.11) used in the module.

Each EXAMPLES entry names a function in ``tools/rocket.py``, its arguments,
and the value quoted in the module text.  ``tol`` is relative.
``tools/check_examples.py`` runs them; running this file directly also
prints the worked-example tables and re-derives the star geometry.

Generic propellant "P-1770" used throughout Module 21 (a representative
AP/Al/HTPB composite, NOT a real formulation):

    rho_p   = 1770 kg/m^3
    r       = 5.0 (p_c / 1 MPa)^0.35  mm/s
              -> a = 3.9716411736e-5 m/s / Pa^0.35, n = 0.35
    c*      = 1580 m/s (delivered)
    sigma_p = 0.0022 1/K

Examples whose arithmetic does not map onto a single library function are
described in comments at the bottom of this file.
"""
import math

# --------------------------------------------------------------------------
# propellant P-1770
# --------------------------------------------------------------------------
RHO = 1770.0
N_EXP = 0.35
CSTAR = 1580.0
A_SI = 3.9716411736214090e-05      # (5.0e-3) / (1.0e6 ** 0.35)
SIGMA_P = 0.0022
PI_K = 3.3846153846153846e-03      # sigma_p / (1 - n)

AT_WE1 = 1.3892891e-02             # pi/4 * 0.133^2   (WE 21.1 throat)
AT_WE3 = 2.6590441e-02             # pi/4 * 0.184^2   (WE 21.3 throat)

EXAMPLES = [
    # --- WE 21.1  internal-burning tube -----------------------------------
    # Ri0 = 0.150 m, Ro = 0.300 m, L = 3.00 m, ends inhibited.
    # Ab(w) = 2 pi (0.150 + w) * 3.00
    {"id": "21.WE1.w000", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 2.8274334,
              "At": AT_WE1, "c_star_val": CSTAR},
     "expect": 4.9977e6, "tol": 0.002},
    {"id": "21.WE1.w030", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 3.3929201,
              "At": AT_WE1, "c_star_val": CSTAR},
     "expect": 6.6161e6, "tol": 0.002},
    {"id": "21.WE1.w060", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 3.9584068,
              "At": AT_WE1, "c_star_val": CSTAR},
     "expect": 8.3866e6, "tol": 0.002},
    {"id": "21.WE1.w090", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 4.5238934,
              "At": AT_WE1, "c_star_val": CSTAR},
     "expect": 10.2986e6, "tol": 0.002},
    {"id": "21.WE1.w120", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 5.0893801,
              "At": AT_WE1, "c_star_val": CSTAR},
     "expect": 12.3449e6, "tol": 0.002},
    {"id": "21.WE1.w150", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 5.6548668,
              "At": AT_WE1, "c_star_val": CSTAR},
     "expect": 14.5171e6, "tol": 0.002},
    {"id": "21.WE1.r0", "fn": "vieille_burn_rate",
     "args": {"a": A_SI, "p": 4.9977e6, "n": N_EXP},
     "expect": 8.7794e-3, "tol": 0.002},

    # --- WE 21.2  end burner, F = 2.00 kN for 120 s, pc = 4.00 MPa --------
    {"id": "21.WE2.r", "fn": "vieille_burn_rate",
     "args": {"a": A_SI, "p": 4.0e6, "n": N_EXP},
     "expect": 8.1222e-3, "tol": 0.002},
    {"id": "21.WE2.pc", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 5.680600e-2,
              "At": 3.225806e-4, "c_star_val": CSTAR},
     "expect": 4.0000e6, "tol": 0.003},
    {"id": "21.WE2.c", "fn": "c_eff",
     "args": {"c_star_val": CSTAR, "Cf_val": 1.55},
     "expect": 2449.0, "tol": 1e-6},
    {"id": "21.WE2.isp", "fn": "isp_from_c",
     "args": {"c_eff": 2449.0},
     "expect": 249.73, "tol": 0.001},

    # --- WE 21.3  8-point neutral star ------------------------------------
    # N = 8, theta = 15.00 deg, Rp = 0.2024 m, f = 8 mm, Ro = 0.300, L = 3.00
    # P(u) = 2.035743 + 0.092345 u   (Eq. 3.7);  Ab = 3.00 P
    {"id": "21.WE3.y0000", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 6.1094457,
              "At": AT_WE3, "c_star_val": CSTAR},
     "expect": 6.0230e6, "tol": 0.002},
    {"id": "21.WE3.y0224", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 6.1156512,
              "At": AT_WE3, "c_star_val": CSTAR},
     "expect": 6.0324e6, "tol": 0.002},
    {"id": "21.WE3.y0448", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 6.1218566,
              "At": AT_WE3, "c_star_val": CSTAR},
     "expect": 6.0418e6, "tol": 0.002},
    {"id": "21.WE3.y0672", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 6.1280621,
              "At": AT_WE3, "c_star_val": CSTAR},
     "expect": 6.0512e6, "tol": 0.002},
    {"id": "21.WE3.y0896", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 6.1342676,
              "At": AT_WE3, "c_star_val": CSTAR},
     "expect": 6.0607e6, "tol": 0.002},

    # --- Problem C4: amplification and temperature sensitivity ------------
    {"id": "21.C4.piK", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": SIGMA_P, "n": N_EXP},
     "expect": 3.3846153846153846e-3, "tol": 1e-9},
    {"id": "21.C4.hot30K", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": PI_K, "dT": 30.0},
     "expect": 1.1068725, "tol": 1e-5},

    # --- Quiz Q4: CP tube, Ri0 = 0.10, Ro = 0.25, L = 2.5, At = 0.0090 ----
    {"id": "21.Q4.pc0", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 1.5707963,
              "At": 0.0090, "c_star_val": CSTAR},
     "expect": 3.9457e6, "tol": 0.002},
    {"id": "21.Q4.pcf", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SI, "n": N_EXP, "rho_p": RHO, "Ab": 3.9269908,
              "At": 0.0090, "c_star_val": CSTAR},
     "expect": 16.1560e6, "tol": 0.002},

    # --- Trade study T1: hot-day correction on MEOP ------------------------
    {"id": "21.T1.hot", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": PI_K, "dT": 30.0},
     "expect": 1.1068725, "tol": 1e-5},
]


# ==========================================================================
# Star burn-back geometry — Module 21 §3.6, Eq. 3.6 to 3.11
#
# Sharp reference polygon: N points, apex radius Rp, flank half-angle theta,
# valley where adjacent flanks meet.  The real (filleted) grain is that
# polygon offset by the fillet radius f, and the burning surface after
# burning a distance y is the same polygon offset by u = f + y.
# ==========================================================================
def star_geometry(N, theta, Rp):
    """Sharp N-point star polygon; theta in radians.  Eq. 3.6, 3.7, 3.8."""
    beta = math.pi / N
    s0 = Rp * math.sin(beta) / math.sin(beta + theta)
    Ri = Rp * math.sin(theta) / math.sin(beta + theta)
    cot = 1.0 / math.tan(beta + theta)
    return {
        "beta": beta,
        "s0": s0,                                    # flank length
        "Ri": Ri,                                    # valley radius
        "P0": 2 * N * s0,                            # perimeter at u = 0
        "dPdu": 2 * N * ((math.pi / 2 - theta) - cot),   # Eq. 3.7 slope
        "A0": N * Rp * Ri * math.sin(beta),          # polygon area
        "u1": s0 * math.tan(beta + theta),           # Phase-I limit
    }


def star_perimeter(N, theta, Rp, u):
    """Burning perimeter at total offset u = f + y.  Eq. 3.7 then Eq. 3.10."""
    g = star_geometry(N, theta, Rp)
    if u <= g["u1"]:
        return g["P0"] + g["dPdu"] * u
    c = Rp * math.sin(g["beta"]) / u
    if c > 1.0:
        c = 1.0
    return N * u * (math.pi + 2 * g["beta"] - 2 * math.acos(c))


def star_port_area(N, theta, Rp, u):
    """Port cross-sectional area at offset u.  Eq. 3.8 (Phase I only)."""
    g = star_geometry(N, theta, Rp)
    return g["A0"] + g["P0"] * u + 0.5 * g["dPdu"] * u * u


def neutral_theta(N):
    """Root of Eq. 3.9: pi/2 - theta = cot(pi/N + theta), in radians.

    Returns None when no root exists in (0, pi/2 - pi/N) — that is N <= 5,
    for which the star is progressive at every flank angle.
    """
    beta = math.pi / N

    def f(t):
        return (math.pi / 2 - t) - 1.0 / math.tan(beta + t)

    lo = 1e-9
    hi = math.pi / 2 - beta - 1e-9
    if f(lo) * f(hi) > 0.0:
        return None
    for _ in range(200):
        mid = 0.5 * (lo + hi)
        if f(lo) * f(mid) <= 0.0:
            hi = mid
        else:
            lo = mid
    return 0.5 * (lo + hi)


def phase1_sizing_Rp(N, theta, Ro):
    """Eq. 3.11: apex radius for which the flanks vanish at tip contact."""
    beta = math.pi / N
    return Ro / (1.0 + math.sin(beta) / math.cos(beta + theta))


# ---------------------------------------------------------------------------
# Examples whose arithmetic does NOT map onto a single rocket.py function
# ---------------------------------------------------------------------------
# 21.WE1 burn time — numerical integration of dw / r(pc(Ab(w))) over the
#   0.150 m web with Ab(w) = 2 pi (0.150 + w) * 3.00 and At = AT_WE1.
#   Midpoint rule, 20 001 intervals: t_b = 13.954 s.  Intermediate times
#   3.249 / 6.218 / 8.966 / 11.535 s at w = 0.03 / 0.06 / 0.09 / 0.12 m.
#   m_prop = 1126.0 kg, V_L = 0.7500, J0 = 5.09.
#
# 21.WE2 sizing — geometry only: r = a pc^n = 8.1222 mm/s at 4.00 MPa,
#   L = r t_b = 0.9747 m, Ab = F/(CF c* rho r) = 0.056806 m^2 -> D = 0.2689 m,
#   L/D = 3.62, mdot = 0.81666 kg/s, At = mdot c*/pc = 3.2258e-4 m^2
#   (Dt = 20.27 mm), Kn = 176.1, m_prop = 98.00 kg, I_tot = 240 kN.s,
#   Isp = CF c*/g0 = 249.73 s.
#
# 21.WE3 star geometry — star_geometry(8, radians(15), 0.2024) gives
#   beta = 22.500 deg, s0 = 0.127234 m, Ri = 0.086052 m, P0 = 2.035743 m,
#   dP/du = 0.092345 m/m, A0 = 0.053321 m^2, u1 = 0.097630 m against
#   Ro - Rp = 0.097600 m (Eq. 3.11 sizing, so the whole burn is Phase I).
#   A_port(f=0.008) = 0.069610 m^2 -> V_L = 0.7538, m_prop = 1131.7 kg,
#   J0 = 2.62, port mass flux 1456 kg/(m^2 s).  A_port(0.09760) = 0.252511
#   -> sliver 14.2 % of the propellant at tip contact.  t_b = 9.548 s.
#   Deep-star comparison (theta = 30 deg, Rp = 0.140, f = 0.010):
#   P0 = 1.080491, dP/du = 4.477929, u1 = 0.088008, V_L = 0.8272,
#   m_prop = 1242.0 kg, Ab 3.3758 -> 5.6382 m^2 (+67 %).
#
#   VALIDATION.  Eq. 3.8 was checked against a direct grid Minkowski sum of
#   the sharp polygon (dilate by u, count cells) on a 1400 x 1400 grid, for
#   (N, theta, Rp) = (8, 15 deg, 0.2024) at u = 0.008, 0.030, 0.0879 and
#   0.09763 m, and for (8, 30 deg, 0.140) at u = 0.008 m.  Worst area
#   disagreement 0.005 %.  Eq. 3.7 and Eq. 3.10 agree to machine precision at
#   u = u1: substituting u1 = Rp sin(beta)/cos(beta+theta) into Eq. 3.10 gives
#   arccos(cos(beta+theta)) = beta+theta, and both reduce to
#   N u1 (pi - 2 theta).  Re-run the grid check with a Minkowski-sum routine
#   if the relations are ever edited; it shares no algebra with them, which
#   is what makes it a check.
#
# 21.WE4 — pure inversion of Eq. 3.2: Ab2/Ab1 = (p2/p1)^(1-n) =
#   (6.9/5.2)^0.70 = 1.219; the same ratio applied to At gives -18.0 %.
#
# 21.C1 — CP tube Ri0 = 0.200, Ro = 0.320, L = 4.00, pc0 = 4.50 MPa:
#   web 0.120 m, web fraction 0.375, V_L = 0.6094, Ab0 = 5.0265 m^2,
#   Kn0 = 190.10, At = 0.026441 m^2 (Dt = 183.5 mm), Abf = 8.0425 m^2,
#   Knf = 304.16, pcf = 9.273 MPa (ratio 2.061), m_prop = 1387.9 kg,
#   J0 = 4.75, t_b = 12.402 s (r 8.464 -> 10.902 mm/s).
#
# 21.C2 — end burner F = 1.20 kN, t_b = 200 s, CF = 1.60, pc = 3.00 MPa:
#   r = 7.3445 mm/s, Ab = 0.036515 m^2, D = 0.2156 m, L = 1.4689 m,
#   L/D = 6.81, mdot = 0.47468 kg/s, At = 2.5000e-4 m^2 (Dt = 17.84 mm),
#   Kn = 146.1, m_prop = 94.94 kg, I_tot = 240 kN.s, Isp = 257.78 s.
#
# 21.C3 — neutral 10-point star, Ro = 0.250, L = 2.00, f = 0.006:
#   neutral_theta(10) = 0.38747 rad = 22.200 deg; u1/Rp = 0.40458;
#   phase1_sizing_Rp -> Rp = 0.17799 m, web at tip 0.07201 m;
#   s0 = 0.085213, Ri = 0.104193, P0 = 1.704256, A0 = 0.057308,
#   initial valley radius 0.11349, Ab0 = 3.4085 m^2, A_port(f) = 0.067533,
#   V_L = 0.6561, m_prop = 456.0 kg, sliver 12.67 %, burn distance 0.06601 m.
#
# 21.C6 — WE 21.3 star with f = 0.014 instead of 0.008: Ab0 = 6.1111 m^2
#   (+0.027 %), pc0 = 6.0255 MPa (+0.042 %), A_port(0) = 0.081831 m^2,
#   V_L = 0.7106, m_prop = 1066.8 kg (-64.9 kg), burn distance 0.0836 m.
#   Throat to restore exactly 6.000 MPa: 0.026664 m^2, Dt = 184.25 mm.
#
# 21.C7 — dual thrust: Ab ratio = 7.5^(1-n) = 3.705, r ratio = 7.5^n = 2.024,
#   web ratio for t_sus = 10 t_boost is 10/2.024 = 4.94.
#
# 21.C8 — RSRM mean Ab: mdot = 500000/123.5 = 4049 kg/s, Ab r = 2.2873 m^3/s,
#   so Ab = 286 / 229 / 191 m^2 for r = 8 / 10 / 12 mm/s.  The burn rate is
#   not published in reference/_verify-solid-coldgas.md; the answer carries a
#   factor-of-1.5 uncertainty from that input alone.
#
# 21.Q1 — 1.05^(1/(1-0.42)) = 1.0878.
# 21.Q6 — neutral_theta(9) = 18.84 deg; u1/Rp = 0.43911;
#   phase1_sizing_Rp(9, that theta, 0.40) = 0.27795 m; web 0.12205 m;
#   s0 = 0.15158 m; Ri = 0.14312 m; P0 = 2.7285 m.
# 21.Q7 — pressure ratio exp(PI_K * 12) = 1.0415; duration ratio 1/1.0415,
#   i.e. 3.99 % shorter, because r and pc both scale as a^(1/(1-n)) under a
#   temperature change (NOT as pc^n).
#
# 21.T1 trade study — hot factor exp(PI_K*30) = 1.1069, so the nominal
#   pressure ceiling is 9.0/1.1069 = 8.131 MPa and Kn_max = 279.3.
#   A (neutral star, m_prop 1131.7 kg): At = 0.040649 m^2 gives t_b = 12.00 s
#     but J0 = 1.71; At = 0.034805 m^2 gives J0 = 2.00 but t_b = 11.04 s.
#     Infeasible.
#   B (deep star): m_prop 1242.0 kg, At = 0.020191 m^2, J0 = 2.42,
#     t_b = 16.55 s, pc 3.69 -> 8.13 MPa, mean pc 5.56 MPa.
#   C (CP tube, Ri0 = 0.1135 m set by J0 = 2): m_prop 1286.3 kg,
#     At = 0.020250 m^2, t_b = 22.56 s, pc 1.82 -> 8.13 MPa, mean 4.45 MPa.
#   D (slotted tube, extra Ab decaying to zero at 40 % web): +10/20/30 % of
#     initial area gives m_prop 1284.4 / 1282.5 / 1280.6 kg and mean pc
#     4.55 / 4.64 / 4.73 MPa — it loses propellant to buy trace quality.
#
# 21.neutrality table (Eq. 3.9 roots, degrees; u1/Rp in brackets):
#   N=4 none, N=5 none, N=6 3.53 (0.600), N=7 9.84 (0.533), N=8 14.81 (0.481),
#   N=9 18.84 (0.439), N=10 22.20 (0.405), N=11 25.06 (0.376),
#   N=12 27.52 (0.351), N=16 34.84 (0.281).


if __name__ == "__main__":
    print("Module 21 star geometry (Eq. 3.6-3.11)\n")
    print("Eq. 3.9 neutrality roots")
    print("    N   theta [deg]   u1/Rp")
    for _N in (4, 5, 6, 7, 8, 9, 10, 11, 12, 16):
        _th = neutral_theta(_N)
        if _th is None:
            print("   %2d   ---  (progressive at every theta)" % _N)
        else:
            _b = math.pi / _N
            print("   %2d      %6.2f      %.4f"
                  % (_N, math.degrees(_th),
                     math.sin(_b) / math.cos(_b + _th)))

    print("\nWE 21.3  8-point neutral star, Rp = 0.2024 m, theta = 15 deg")
    _g = star_geometry(8, math.radians(15.0), 0.2024)
    for _k in ("beta", "s0", "Ri", "P0", "dPdu", "A0", "u1"):
        print("   %-5s = %.6f" % (_k, _g[_k]))
    print("    y[m]     u[m]     P[m]       Ab[m2]")
    for _y in (0.0, 0.0224, 0.0448, 0.0672, 0.0896):
        _u = 0.008 + _y
        _P = star_perimeter(8, math.radians(15.0), 0.2024, _u)
        print("   %.4f   %.4f   %.6f   %.6f" % (_y, _u, _P, 3.0 * _P))
