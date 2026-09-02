"""
Worked-example checks for Module 15 — Combustion Instability.

Entries whose arithmetic maps onto a `tools/rocket.py` function are listed in
EXAMPLES below. The rest of the module's arithmetic — Bessel eigenvalues,
delay-differential characteristic roots, quarter-wave and Helmholtz tuning,
baffle sector modes, damping rates — has no library counterpart and is
reproduced in the comments and helper functions here with exact inputs and
expected outputs.

The reference chamber used throughout Module 15
-----------------------------------------------
    gamma = 1.20, M = 22.86 kg/kmol  ->  R = 363.712 J/(kg K)
    T_c   = 3300 K                   ->  c  = 1200.13 m/s  (rounded to 1200)
    Gamma(1.20) = 0.648531           ->  c* = 1689.29 m/s
    D_c = 0.500 m, L_cyl = 0.500 m, eps_c = 1.9
        A_c = 0.196350 m^2, A_t = 0.103342 m^2, D_t = 0.362738 m
    p_c = 100 bar, L* = 1.05 m
        rho_c = 8.3316 kg/m^3, V_c = 0.108509 m^3, mdot = 611.75 kg/s
        tau_c = L*/(Gamma^2 c*) = 1.4778 ms
"""
import math

GAMMA = 1.20
M_GAS = 22.86
T_C = 3300.0
D_C = 0.500
L_CYL = 0.500
EPS_C = 1.9
A_C = math.pi / 4.0 * D_C ** 2          # 0.19634954 m^2
A_T = A_C / EPS_C                       # 0.10334186 m^2
P_C = 100.0e5
LSTAR = 1.05
V_C = LSTAR * A_T                       # 0.10850896 m^3
R_GAS = 8314.46 / M_GAS                 # 363.71216 J/(kg K)
C_SOUND = math.sqrt(GAMMA * R_GAS * T_C)      # 1200.125 m/s
C_STAR = 1689.29317                     # sqrt(R T)/Gamma
RHO_C = P_C / (R_GAS * T_C)             # 8.331597 kg/m^3
MDOT = P_C * A_T / C_STAR               # 611.746 kg/s
TAU_C = 1.4778234830789619e-3           # s

EXAMPLES = [
    # --- WE1: chamber gas properties behind the acoustic modes -------------
    # R = Ru/M for the reference gas.
    {"id": "15.WE1a", "fn": "R_specific",
     "args": {"M": M_GAS},
     "expect": 363.71216, "tol": 1e-6},
    # Speed of sound c = sqrt(gamma R T) = 1200.1 m/s -> the "c = 1200 m/s"
    # used for every mode frequency in WE1, WE3 and WE4.
    {"id": "15.WE1b", "fn": "a_sound",
     "args": {"gamma": GAMMA, "R": 363.71216097987747, "T": T_C},
     "expect": 1200.1250591, "tol": 1e-8},

    # --- WE2: chamber fill time --------------------------------------------
    # c* = sqrt(R T_c)/Gamma for the reference gas.
    {"id": "15.WE2a", "fn": "c_star",
     "args": {"gamma": GAMMA, "R": 363.71216097987747, "T0": T_C},
     "expect": 1689.29317, "tol": 1e-6},
    # V_c = L* A_t.
    {"id": "15.WE2b", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": LSTAR, "At": A_T},
     "expect": 0.10850896, "tol": 1e-6},
    # Choked mass flow through the throat, 611.75 kg/s.
    {"id": "15.WE2c", "fn": "choked_mdot",
     "args": {"gamma": GAMMA, "R": 363.71216097987747, "T0": T_C,
              "p0": P_C, "At": A_T},
     "expect": 611.7461752, "tol": 1e-6},
    # tau_c = V_c rho_c / mdot = 1.4778 ms.  This is the same number as the
    # closed form L*/(Gamma^2 c*) quoted as Eq. 3.4 -- the cross-check in
    # WE2 step 1.
    {"id": "15.WE2d", "fn": "residence_time",
     "args": {"Vc": 0.10850895678517378, "rho_c": 8.331596672871996,
              "mdot": 611.7461751552505},
     "expect": 1.4778234831e-3, "tol": 1e-8},

    # --- N2/Q3 (key): fill times for other chambers -------------------------
    # N2: L* = 0.90 m, gamma = 1.22, c* = 1780 m/s -> tau_c = 1.188 ms.
    {"id": "15.N2a", "fn": "gamma_function",
     "args": {"gamma": 1.22},
     "expect": 0.65238638, "tol": 1e-6},
    # Q3: gamma = 1.21 -> Gamma = 0.650466, tau_c = 1.553 ms with L* = 1.15,
    # c* = 1750.
    {"id": "15.Q3a", "fn": "gamma_function",
     "args": {"gamma": 1.21},
     "expect": 0.65046586, "tol": 1e-6},

    # --- N1 (key): LOX/LH2 chamber gas --------------------------------------
    {"id": "15.N1a", "fn": "R_specific",
     "args": {"M": 13.0},
     "expect": 639.573846, "tol": 1e-6},
    {"id": "15.N1b", "fn": "a_sound",
     "args": {"gamma": 1.19, "R": 639.573846153846, "T": 3500.0},
     "expect": 1632.12287, "tol": 1e-6},

    # --- Section 3.8: RS-25-scale geometry estimate -------------------------
    # Cf_vac at eps = 69, gamma = 1.20 -> 1.92665; A_t = F/(p_c Cf) = 0.05731
    # m^2 -> D_t = 0.2701 m, from which D_c ~ 0.43-0.48 m at eps_c = 2.5-3.2.
    {"id": "15.RE1a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 69.0, "p0": 206.4e5, "pa": 0.0},
     "expect": 1.9266461, "tol": 1e-6},
    {"id": "15.RE1b", "fn": "throat_area_from_thrust",
     "args": {"F": 2279e3, "p0": 206.4e5, "Cf_val": 1.9266461010232676},
     "expect": 0.05731030, "tol": 1e-6},
    # RS-25 chamber gas: M = 13.5 kg/kmol, T_c = 3550 K, gamma = 1.20
    # -> c = 1619.8 m/s, 35 % above a kerosene chamber's 1200 m/s.
    {"id": "15.RE1c", "fn": "a_sound",
     "args": {"gamma": 1.20, "R": 615.8859259259259, "T": 3550.0},
     "expect": 1619.77592, "tol": 1e-6},
    # F-1 chamber gas: M = 23.3 kg/kmol, T_c = 3600 K, gamma = 1.22
    # -> c = 1251.9 m/s; with D_c = 1.05-1.20 m, f_1T = 614-696 Hz.
    {"id": "15.RE2a", "fn": "a_sound",
     "args": {"gamma": 1.22, "R": 356.8437768240343, "T": 3600.0},
     "expect": 1251.90170, "tol": 1e-6},
]


# ---------------------------------------------------------------------------
# Everything below has no rocket.py counterpart. Helpers plus expected values.
# ---------------------------------------------------------------------------

# Bessel eigenvalues alpha_mn: n-th non-trivial root of J_m'(x) = 0.
BESSEL = {"1T": 1.8412, "2T": 3.0542, "3T": 4.2012, "1R": 3.8317,
          "4T": 5.3176, "1T1R": 5.3314, "2R": 7.0156}


def transverse(alpha, c, D):
    """f = alpha c / (pi D)   [Hz]  -- Eq. 3.9 with q = 0."""
    return alpha * c / (math.pi * D)


def longitudinal(q, c, L):
    """f = q c / (2 L)   [Hz]  -- Eq. 3.9 with m = n = 0."""
    return q * c / (2.0 * L)


def combined(alpha, q, c, D, L):
    """f = sqrt(f_transverse^2 + f_longitudinal^2)."""
    return math.hypot(transverse(alpha, c, D), longitudinal(q, c, L))


def jprime_root(nu):
    """First non-trivial root of J_nu'(x)=0 for real order nu >= 1.
    McMahon-type expansion, 0.1 % accurate (1.8395 vs 1.8412 at nu = 1)."""
    return (nu + 0.8086165 * nu ** (1.0 / 3.0) + 0.072490 * nu ** (-1.0 / 3.0)
            - 0.05097 / nu + 0.0094 * nu ** (-5.0 / 3.0))


def chug_neutral(tau, tau_c):
    """Solve omega*tau + atan(omega*tau_c) = pi  (Eq. 3.6). Returns omega."""
    lo, hi = 1e-3, 1e6
    for _ in range(300):
        mid = 0.5 * (lo + hi)
        if mid * tau + math.atan(mid * tau_c) - math.pi > 0:
            hi = mid
        else:
            lo = mid
    return 0.5 * (lo + hi)


def chug_root(k, tau, tau_c, seed):
    """Complex root of tau_c s + 1 + k exp(-s tau) = 0 nearest `seed`."""
    s = complex(seed)
    for _ in range(200):
        f = tau_c * s + 1.0 + k * cmath_exp(-s * tau)
        df = tau_c - k * tau * cmath_exp(-s * tau)
        s = s - f / df
    return s


def cmath_exp(z):
    import cmath
    return cmath.exp(z)


def ntau_neutral(tau, tau_c):
    """Solve omega*tau_c = cot(omega*tau/2) (Eq. 3.11). Returns (omega, n_crit)."""
    lo, hi = 1e-6, math.pi / tau * 0.999
    for _ in range(300):
        mid = 0.5 * (lo + hi)
        if mid * tau_c - 1.0 / math.tan(mid * tau / 2.0) > 0:
            hi = mid
        else:
            lo = mid
    w = 0.5 * (lo + hi)
    return w, 1.0 / (2.0 * math.sin(w * tau / 2.0) ** 2)


def quarter_wave(c_cav, f):
    """L_eff = c_cav / (4 f)   [m]  -- Eq. 3.13."""
    return c_cav / (4.0 * f)


def helmholtz(c_cav, A_n, V, L_eff):
    """f = (c/2pi) sqrt(A_n/(V L_eff))   [Hz]  -- Eq. 3.14."""
    return c_cav / (2.0 * math.pi) * math.sqrt(A_n / (V * L_eff))


def damping_rate(t10):
    """alpha_d = ln(10)/t10   [1/s]  -- Eq. 3.15."""
    return math.log(10.0) / t10


# --- WE1: reference chamber modes, c = 1200 m/s, D = L = 0.500 m -----------
#   1L   1200.0 Hz     1T   1406.6 Hz     2T   2333.2 Hz
#   1R   2927.2 Hz     3T   3209.5 Hz     1T1L 1848.9 Hz    2L 2400.0 Hz
# Crossover L_cyl = pi D /(2*1.8412) = 0.853 D: above it, 1L is the lowest mode.
#
# --- WE2: chug at tau = 1.2 ms, tau_c = 1.4778 ms --------------------------
#   neutral: omega = 1636.0 rad/s -> f = 260.4 Hz, k_crit = 2.6162,
#            (dp/p_c)_min = 19.11 %
#   dp/p_c = 0.15 -> k = 3.3333, s = +151.4 + 1688.9j, f = 268.8 Hz,
#                    doubling time ln2/151.4 = 4.58 ms                (UNSTABLE)
#   dp/p_c = 0.20 -> k = 2.5000, s =  -28.2 + 1625.3j, f = 258.7 Hz,
#                    t10 = ln10/28.21 = 81.6 ms          (stable, fails 45 ms)
#   dp/p_c = 0.25 -> k = 2.0000, s = -166.1 + 1570.9j, f = 250.0 Hz,
#                    t10 = ln10/166.07 = 13.87 ms                     (PASSES)
#   tau sweep at tau_c = 1.4778 ms (the 15-25 % rule):
#       0.8 ms -> 369.0 Hz, k_crit 3.569, 14.01 %
#       1.0 ms -> 304.2 Hz, k_crit 2.996, 16.69 %
#       1.2 ms -> 260.4 Hz, k_crit 2.616, 19.11 %
#       1.5 ms -> 215.8 Hz, k_crit 2.239, 22.33 %
#
# --- Section 3.9: n-tau neutral curve, tau_c = 1.4778 ms -------------------
#   tau = 0.8 ms -> f 198.1 Hz, omega*tau 0.9958, n_crit 2.192
#   tau = 1.2 ms -> f 158.4 Hz, omega*tau 1.1943, n_crit 1.582
#   tau = 2.0 ms -> f 117.8 Hz, omega*tau 1.4809, n_crit 1.099
#   Limit tau_c -> 0 gives omega*tau -> pi and n_crit -> 1/2 (Crocco).
#
# --- WE3: quarter-wave cavity for f_1T = 1406.6 Hz -------------------------
#   gamma_cav = 1.25, R = 363.71 J/(kg K):
#       T = 800 K  -> c = 615.0 m/s -> 109.3 mm
#       T = 1200 K -> c = 738.6 m/s -> 131.3 mm   (design; 128 mm geometric
#                                                  after a 3.2 mm end correction)
#       T = 1800 K -> c = 893.7 m/s -> 158.8 mm
#       T = 3300 K -> c = 1200  m/s -> 213.3 mm
#   The 131.3 mm cavity actually running at 1800 K is tuned to 1701.9 Hz (+21 %).
#   Helmholtz equivalent: six 8 mm necks (A_n = 3.0159e-4 m^2), L_eff = 23.2 mm,
#   c = 738.6 m/s -> V = 90.8 cm^3 for 1406.6 Hz.
#
# --- WE4: baffle compartments, D = 0.500 m, c = 1200 m/s -------------------
#   unbaffled 1T = 1406.6 Hz; target > 3000 Hz needs alpha >= 3.927
#       N = 4  nu 2.0  alpha 3.054  f 2332.9 Hz
#       N = 5  nu 2.5  alpha 3.632  f 2775.0 Hz
#       N = 6  nu 3.0  alpha 4.201  f 3209.3 Hz   <- chosen
#       N = 8  nu 4.0  alpha 5.318  f 4062.2 Hz
#       N = 13 nu 6.5  alpha 8.041  f 6142.5 Hz  (F-1 compartment count)
#   F-1 check: N = 13 at D_c = 1.13 m and c = 900 m/s -> 2040 Hz.
#
# --- Problem answers (key K1/K2) ------------------------------------------
#   N1: R 639.574, c 1632.1 m/s; 1L 2914.5, 1T 2813.4, 2T 4666.8, 1R 5854.8,
#       1T1L 4050.8 Hz
#   N2: Gamma 0.652386, tau_c 1.1880 ms, f 314.2 Hz, k_crit 2.549, 19.61 %
#   N3: k 2.2727, s = -85.6 + 1942.1j, f 309.1 Hz, t10 26.9 ms (passes 30 ms)
#   N4: c(1000/1400/1800 K) = 869.5/1028.8/1166.5 m/s -> 106.0/125.5/142.3 mm;
#       the 125.5 mm cavity is tuned to 1732.6 Hz at 1000 K and 2324.5 Hz at
#       1800 K, i.e. -15.5 % / +13.4 % about the 2050 Hz target
#   N5: f_1T 1087.1 Hz; alpha needed 4.4037; N = 7 (alpha 4.762, 2811.6 Hz,
#       ratio 2.59)
#   N6: I = 5.40e5 kg/m^4, C = 3.829e-9 m^5/N, V_g = 2.14 L
#   N7: eps_c 1.50 -> D_c 1.091 m, f_1T 671.3 Hz (c=1250) / 483.4 Hz (c=900)
#       eps_c 1.75 -> D_c 1.179 m, f_1T 621.5 Hz (c=1250) / 447.5 Hz (c=900)
#   N8: alpha_d 155.5 1/s, zeta 0.01833 at 1350 Hz, Q 27.3, t10 14.8 ms
#   Q3: Gamma 0.650466, tau_c 1.5531 ms, f 241.4 Hz, k_crit 2.560, 19.53 %
#   Q6: c 719.9 m/s, L 109.1 mm; at 1600 K the same cavity is tuned to 1990 Hz
#   Q8: f_1T 1257.4 Hz, alpha needed 4.100, N = 6 -> 2868.9 Hz
#   Q10: alpha_d 92.10 1/s, zeta 0.01629 at 900 Hz, Q 30.70
#   T1: R 386.719, c 1278.16 m/s; 1T 1628.5, 1L 1521.6, 2T 2701.3, 1R 3389.0 Hz
#       option D (eps_c +15 %): D_c 0.4933 m -> 1T 1518.6 Hz (moves DOWN)
#       option A (N = 5 baffle): 3212.8 Hz
#       option B cavity depth at 1000/1400/1800 K: 106.7/126.3/143.2 mm
#       required alpha_d 57.56 1/s (40 ms); achieved 33.86 1/s (68 ms);
#       shortfall factor 1.70
