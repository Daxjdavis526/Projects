"""Registered worked examples for Module 06 — Combustion Chambers.

Each entry names a function in ``tools/rocket.py``, the arguments the module
text uses, and the value printed in the text. ``tol`` is a *relative*
tolerance. Run with the course example checker.

Reference engine ("RE-500", the Module 03 engine used throughout Module 06):
    LOX/RP-1, F_SL = 500 kN, p_c,ns = 100 bar, eps = 16, gamma = 1.20,
    T_c = 3600 K, M = 22.0 kg/kmol  ->  R = 377.93 J/(kg K),
    c*_ideal = 1798.56 m/s, C_F,SL = 1.63496, A_t = 0.0305818 m^2,
    D_t = 197.3 mm, mdot = 170.03 kg/s.

Arithmetic in the module that does NOT map to a rocket.py function is
described in comments beside the nearest registered entry, so that a reader
can still reproduce it by hand:

  * WE1 steps 2-5 (barrel diameter, convergent-cone volume, cylinder length,
    total injector-to-throat length) use Eq. 3.12,
        L* = L_cyl * eps_c + (1/3) sqrt(A_t/pi) cot(theta_c) (eps_c^1.5 - 1),
    which has no library function. For RE-500 with L* = 1.15 m, eps_c = 2.0
    and theta_c = 30 deg:
        R_t = 0.0986635 m, R_c = 0.1395313 m, D_c = 279.1 mm,
        V_conv = 3.1852e-3 m^3 (9.06 % of V_c),
        L_cyl = 0.52292 m, h = 0.070785 m, L_total = 0.59371 m,
        G = mdot / A_c = 2780 kg/(m^2 s).

  * WE2's Rayleigh stagnation-pressure ratio, Eq. 3.9,
        p_ns / p_inj = (1 + (g-1)/2 Ma^2)^(g/(g-1)) / (1 + g Ma^2),
    is assembled from the registered ``p0_over_p`` values below divided by
    (1 + gamma*Ma^2):
        Ma = 0.20, gamma = 1.20:  1.024241 / 1.048 = 0.977325  (2.267 % loss)
        Ma = 0.40, gamma = 1.20:  1.099923 / 1.192 = 0.922754  (7.725 % loss)
    Consequences quoted in the text: p_c,inj = 102.3 bar vs 108.4 bar for
    p_c,ns = 100 bar; 144 kW of extra pump work at 170 kg/s; or, at fixed
    pump discharge, a 5.6 % thrust loss.

  * WE3's droplet arithmetic uses the d^2-law and a quiescent evaporation
    constant, neither of which is in rocket.py:
        K_0 = 8 k_g ln(1+B) / (rho_l c_p,g)
            = 8 (0.30)(ln 6) / (800 * 2000) = 2.688e-6 m^2/s
        K   = 10 * K_0 = 2.7e-5 m^2/s  (convective enhancement, Ranz-Marshall)
        t_v = d_0^2 / K:
            d_0 =  50 um -> 0.093 ms ;  100 um -> 0.372 ms ;
                  150 um -> 0.837 ms ;  200 um -> 1.488 ms ;
                  300 um -> 3.349 ms
        with t_s = 1.520 ms, the SMD threshold for t_s >= 3 t_v is ~120 um.

  * Section 3.12 / problem N6 acoustic frequency, f_1T = 1.8412 a / (pi D_c),
    has no library function. With a = 1277.75 m/s (registered below as
    ``a_sound``): eps_c = 2.0 -> D_c = 0.27906 m -> 2683 Hz;
    eps_c = 3.0 -> D_c = 0.34178 m -> 2191 Hz; a shift of -18.35 %.

  * The heat-flux scaling q'' ~ p_c^0.8 and the barrel-mass scaling
    m ~ p_c^-0.5 (Eq. 3.11) are one-line powers, not library calls.
"""

EXAMPLES = [
    # ---------------------------------------------------------------
    # Reference engine (Module 03 carry-over, restated at the head of §5)
    # ---------------------------------------------------------------
    {"id": "06.RE1", "fn": "R_specific",
     "args": {"M": 22.0}, "expect": 377.93, "tol": 1e-4},
    {"id": "06.RE2", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 377.93, "T0": 3600.0},
     "expect": 1798.5648, "tol": 1e-5},
    {"id": "06.RE3", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 10.0e6, "pa": 101325.0},
     "expect": 1.6349601, "tol": 1e-6},
    {"id": "06.RE4", "fn": "throat_area_from_thrust",
     "args": {"F": 500.0e3, "p0": 10.0e6, "Cf_val": 1.6349600791459753},
     "expect": 0.030581786, "tol": 1e-6},
    {"id": "06.RE5", "fn": "choked_mdot",
     "args": {"gamma": 1.20, "R": 377.93, "T0": 3600.0, "p0": 10.0e6,
              "At": 0.03058178645323108},
     "expect": 170.0344, "tol": 1e-5},

    # ---------------------------------------------------------------
    # WE1 — chamber volume from L* and contraction ratio
    #   L* = 1.15 m, eps_c = 2.0, theta_c = 30 deg
    #   V_c = 0.0351691 m^3 = 35.17 L; the rest of WE1 is Eq. 3.12 (see docstring)
    # ---------------------------------------------------------------
    {"id": "06.WE1", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.15, "At": 0.03058178645323108},
     "expect": 0.035169054, "tol": 1e-6},

    # ---------------------------------------------------------------
    # WE2 — Rayleigh (heat-addition) stagnation loss at Ma 0.2 vs 0.4
    #   Registered pieces: the isentropic stagnation factor at each Mach,
    #   and the contraction ratios that produce those Mach numbers.
    #   The Rayleigh ratio is assembled as shown in the docstring.
    # ---------------------------------------------------------------
    {"id": "06.WE2a", "fn": "p0_over_p",
     "args": {"gamma": 1.20, "Mach": 0.20},
     "expect": 1.0242413, "tol": 1e-6},
    {"id": "06.WE2b", "fn": "p0_over_p",
     "args": {"gamma": 1.20, "Mach": 0.40},
     "expect": 1.0999229, "tol": 1e-6},
    {"id": "06.WE2c", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 3.0, "supersonic": False},
     "expect": 0.20180258, "tol": 1e-5},
    {"id": "06.WE2d", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 1.6, "supersonic": False},
     "expect": 0.40457707, "tol": 1e-5},
    # eps_c = 2.0 (the RE-500 value, quoted in §3.4, §3.5 and quiz Q3)
    {"id": "06.WE2e", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 2.0, "supersonic": False},
     "expect": 0.31223716, "tol": 1e-5},

    # ---------------------------------------------------------------
    # WE3 — residence time vs vaporization time
    #   rho_c = p_c/(R T_c) = 7.34998 kg/m^3 ; t_s = 1.520 ms.
    #   Cross-check in the text: t_s = L*/(Gamma^2 c*) gives the same value.
    #   The d^2-law half of WE3 has no library function (see docstring).
    # ---------------------------------------------------------------
    {"id": "06.WE3", "fn": "residence_time",
     "args": {"Vc": 0.03516905442121574, "rho_c": 7.3499795670568036,
              "mdot": 170.03439164538878},
     "expect": 0.0015202328, "tol": 1e-6},
    {"id": "06.WE3b", "fn": "a_sound",
     "args": {"gamma": 1.20, "R": 377.93, "T": 3600.0},
     "expect": 1277.7549, "tol": 1e-5},

    # ---------------------------------------------------------------
    # Key file, problem N1 — upper-stage LOX/LH2 chamber sizing
    #   F_vac = 180 kN, p_c = 60 bar, eps = 240, gamma = 1.20,
    #   T_c = 3450 K, M = 13.8 kg/kmol, L* = 0.90 m, eps_c = 2.5
    # ---------------------------------------------------------------
    {"id": "06.N1a", "fn": "R_specific",
     "args": {"M": 13.8}, "expect": 602.4971, "tol": 1e-6},
    {"id": "06.N1b", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 602.4971014492753, "T0": 3450.0},
     "expect": 2223.0855, "tol": 1e-6},
    {"id": "06.N1c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 240.0, "p0": 60.0e5, "pa": 0.0},
     "expect": 2.0039636, "tol": 1e-6},
    {"id": "06.N1d", "fn": "throat_area_from_thrust",
     "args": {"F": 180.0e3, "p0": 60.0e5, "Cf_val": 2.003963604427259},
     "expect": 0.014970332, "tol": 1e-6},
    {"id": "06.N1e", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 0.90, "At": 0.014970331763372579},
     "expect": 0.013473299, "tol": 1e-6},

    # Key file, problem N2 — same engine, residence time 0.963 ms
    {"id": "06.N2", "fn": "residence_time",
     "args": {"Vc": 0.013473298587035321, "rho_c": 2.8865374299713995,
              "mdot": 40.404199011657205},
     "expect": 0.00096255294, "tol": 1e-6},

    # Key file, problem N3 — eps_c = 1.8, gamma = 1.21 (6.30 % stagnation loss)
    {"id": "06.N3a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.21, "eps": 1.8, "supersonic": False},
     "expect": 0.35158365, "tol": 1e-5},
    {"id": "06.N3b", "fn": "p0_over_p",
     "args": {"gamma": 1.21, "Mach": 0.35158365454085916},
     "expect": 1.0771337, "tol": 1e-6},

    # Key file, problem N4 — RE-500 re-optimised at 200 bar
    {"id": "06.N4a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 200.0e5, "pa": 101325.0},
     "expect": 1.7160201, "tol": 1e-6},
    {"id": "06.N4b", "fn": "throat_area_from_thrust",
     "args": {"F": 500.0e3, "p0": 200.0e5, "Cf_val": 1.7160200791459752},
     "expect": 0.014568594, "tol": 1e-6},
    {"id": "06.N4c", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.00, "At": 0.014568594099692554},
     "expect": 0.014568594, "tol": 1e-6},

    # Key file, quiz Q8 — 3 MN engine, p_c = 150 bar, C_F = 1.69, eps_c = 1.9
    {"id": "06.Q8a", "fn": "throat_area_from_thrust",
     "args": {"F": 3.000e6, "p0": 150.0e5, "Cf_val": 1.69},
     "expect": 0.11834320, "tol": 1e-6},
    {"id": "06.Q8b", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.21, "eps": 1.9, "supersonic": False},
     "expect": 0.33047161, "tol": 1e-5},

    # Key file, problem N8 — sea-level-optimum area ratios at 97 and 267 bar
    {"id": "06.N8a", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.20, "p0": 97.0e5, "pa": 101325.0},
     "expect": 11.483608, "tol": 1e-5},
    {"id": "06.N8b", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.20, "p0": 267.0e5, "pa": 101325.0},
     "expect": 25.047876, "tol": 1e-5},
]
