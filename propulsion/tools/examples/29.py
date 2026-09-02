"""
Module 29 — Cold-Gas Performance Modeling: worked-example registry.

Each entry names a function in tools/rocket.py, its arguments, and the
value quoted in part4-coldgas/29-coldgas-modeling.md (or its key).
`tol` is a relative tolerance.

Constants used throughout the module:
    g0 = 9.80665 m/s^2, Ru = 8314.46 J/(kmol K)
    N2:      M = 28.014 kg/kmol -> R = 296.7966 J/(kg K), gamma = 1.400
    He:      M =  4.003          -> R = 2077.06,          gamma = 1.667
    Ar:      M = 39.948          -> R =  208.132,         gamma = 1.667
    R-236fa: M = 152.04          -> R =   54.686,         gamma ~ 1.08
    butane:  M =  58.122         -> R =  143.05,          gamma ~ 1.09

Quantities NOT covered by a library function, and computed inline in the
text, are listed in NOTES at the bottom with the formula and the expected
value so they can be re-derived by hand.
"""

R_N2 = 296.7966016991504
R_HE = 2077.0572070946787
R_AR = 208.13209171923
R_R236FA = 54.68600368324125

EXAMPLES = [
    # ---------------------------------------------------------------
    # WE1 — GN2 tank state, ideal and Z-corrected; SAFER cross-check
    # ---------------------------------------------------------------
    {"id": "29.WE1a", "fn": "stored_gas_mass",
     "args": {"p": 2.40e7, "V": 1.00e-3, "R": R_N2, "T": 293.15, "Z": 1.0},
     "expect": 0.27584, "tol": 0.001},
    {"id": "29.WE1b", "fn": "stored_gas_mass",
     "args": {"p": 2.40e7, "V": 1.00e-3, "R": R_N2, "T": 293.15, "Z": 1.13},
     "expect": 0.24411, "tol": 0.001},

    # ---------------------------------------------------------------
    # WE2 — 3.6 N GN2 thruster: c*, CF, Isp, At, mdot, ve, F
    # ---------------------------------------------------------------
    {"id": "29.WE2.cstar", "fn": "c_star",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15},
     "expect": 430.78, "tol": 0.001},
    {"id": "29.WE2.Gamma", "fn": "gamma_function",
     "args": {"gamma": 1.400},
     "expect": 0.684731, "tol": 0.001},
    {"id": "29.WE2.Me", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.400, "eps": 50.0},
     "expect": 5.9138, "tol": 0.001},
    {"id": "29.WE2.CF", "fn": "Cf",
     "args": {"gamma": 1.400, "eps": 50.0, "p0": 2.0e6, "pa": 0.0},
     "expect": 1.7292, "tol": 0.001},
    {"id": "29.WE2.Isp", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "eps": 50.0},
     "expect": 75.957, "tol": 0.001},
    {"id": "29.WE2.At", "fn": "throat_area_from_thrust",
     "args": {"F": 3.6, "p0": 2.0e6, "Cf_val": 1.72918},
     "expect": 1.0410e-6, "tol": 0.002},
    {"id": "29.WE2.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 2.0e6,
              "At": 1.04104e-6},
     "expect": 4.8330e-3, "tol": 0.002},
    {"id": "29.WE2.ve", "fn": "exit_velocity",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 2.0e6,
              "pe": 1384.38},
     "expect": 729.97, "tol": 0.002},
    {"id": "29.WE2.F", "fn": "thrust",
     "args": {"mdot": 4.83299e-3, "ve": 729.97, "pe": 1384.38, "pa": 0.0,
              "Ae": 5.20520e-5},
     "expect": 3.600, "tol": 0.002},

    # ---------------------------------------------------------------
    # WE3 — 1 mN CubeSat thruster at eps=50 and eps=20 (293.15 K)
    # ---------------------------------------------------------------
    {"id": "29.WE3.CF20", "fn": "Cf",
     "args": {"gamma": 1.400, "eps": 20.0, "p0": 2.0e5, "pa": 0.0},
     "expect": 1.6899, "tol": 0.001},
    {"id": "29.WE3.Isp20", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "eps": 20.0},
     "expect": 74.23, "tol": 0.001},
    {"id": "29.WE3.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 2.0e5,
              "At": 2.89178e-9},
     "expect": 1.3425e-6, "tol": 0.002},

    # ---------------------------------------------------------------
    # WE4 — unregulated isothermal blowdown, V=0.40 L, 20 -> 4 bar
    # ---------------------------------------------------------------
    {"id": "29.WE4.mi", "fn": "stored_gas_mass",
     "args": {"p": 2.0e6, "V": 4.00e-4, "R": R_N2, "T": 293.15, "Z": 1.0},
     "expect": 9.1948e-3, "tol": 0.001},
    {"id": "29.WE4.mdot_i", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 2.0e6,
              "At": 1.767146e-8},
     "expect": 8.2044e-5, "tol": 0.002},
    {"id": "29.WE4.phi", "fn": "usable_fraction",
     "args": {"p_i": 2.0e6, "p_f": 4.0e5, "isothermal": True},
     "expect": 0.800, "tol": 0.001},

    # ---------------------------------------------------------------
    # WE5 — same blowdown, adiabatic
    # ---------------------------------------------------------------
    {"id": "29.WE5.phi_ad", "fn": "usable_fraction",
     "args": {"p_i": 2.0e6, "p_f": 4.0e5, "isothermal": False,
              "gamma": 1.400},
     "expect": 0.68318, "tol": 0.001},
    {"id": "29.WE5.phi_poly", "fn": "usable_fraction",
     "args": {"p_i": 2.0e6, "p_f": 4.0e5, "isothermal": False,
              "gamma": 1.200},
     "expect": 0.73849, "tol": 0.001},
    # c* at the adiabatic cutoff temperature 185.09 K -> Isp 60.4 s
    {"id": "29.WE5.cstar_end", "fn": "c_star",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 185.09},
     "expect": 342.32, "tol": 0.002},

    # ---------------------------------------------------------------
    # WE6 — regulated system, 0.40 L at 200 bar, Z=1.10, p_reg = 5 bar
    # ---------------------------------------------------------------
    {"id": "29.WE6.m_tank", "fn": "stored_gas_mass",
     "args": {"p": 2.0e7, "V": 4.00e-4, "R": R_N2, "T": 293.15, "Z": 1.10},
     "expect": 8.3589e-2, "tol": 0.001},
    {"id": "29.WE6.At", "fn": "throat_area_from_thrust",
     "args": {"F": 0.025, "p0": 5.0e5, "Cf_val": 1.72918},
     "expect": 2.8916e-8, "tol": 0.002},
    {"id": "29.WE6.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 5.0e5,
              "At": 2.89178e-8},
     "expect": 3.3562e-5, "tol": 0.002},
    {"id": "29.WE6.m_res", "fn": "stored_gas_mass",
     "args": {"p": 6.0e5, "V": 4.00e-4, "R": R_N2, "T": 293.15, "Z": 1.0},
     "expect": 2.7584e-3, "tol": 0.001},

    # ---------------------------------------------------------------
    # WE7 — impulse bit. rocket.impulse_bit is the trapezoidal form;
    # the module's Eq. 3.20 first-order value at t_on = 10 ms is
    # 2.9822e-4 N.s, which the trapezoid approximates as 3.05e-4.
    # ---------------------------------------------------------------
    {"id": "29.WE7.trap", "fn": "impulse_bit",
     "args": {"F": 0.025, "t_on": 0.010, "t_rise": 0.0066, "t_fall": 0.011},
     "expect": 3.05e-4, "tol": 0.002},

    # ---------------------------------------------------------------
    # P1 — argon tank, 0.75 L at 250 bar / 288 K, eps = 40
    # ---------------------------------------------------------------
    {"id": "29.P1.m_ideal", "fn": "stored_gas_mass",
     "args": {"p": 2.50e7, "V": 7.50e-4, "R": R_AR, "T": 288.0, "Z": 1.0},
     "expect": 0.31280, "tol": 0.001},
    {"id": "29.P1.m_real", "fn": "stored_gas_mass",
     "args": {"p": 2.50e7, "V": 7.50e-4, "R": R_AR, "T": 288.0, "Z": 1.05},
     "expect": 0.29790, "tol": 0.001},
    {"id": "29.P1.Isp", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": R_AR, "T0": 288.0, "eps": 40.0},
     "expect": 55.130, "tol": 0.001},
    {"id": "29.P1.cstar", "fn": "c_star",
     "args": {"gamma": 1.667, "R": R_AR, "T0": 288.0},
     "expect": 337.12, "tol": 0.001},

    # ---------------------------------------------------------------
    # P2 — size a GN2 system: F = 12.5 mN at 4 bar, eps = 50
    # ---------------------------------------------------------------
    {"id": "29.P2.At", "fn": "throat_area_from_thrust",
     "args": {"F": 0.0125, "p0": 4.0e5, "Cf_val": 1.72918},
     "expect": 1.8072e-8, "tol": 0.002},
    {"id": "29.P2.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 4.0e5,
              "At": 1.80736e-8},
     "expect": 1.6781e-5, "tol": 0.002},

    # ---------------------------------------------------------------
    # P3 — blowdown V = 0.25 L, 25 -> 5 bar, Dt = 0.20 mm
    # ---------------------------------------------------------------
    {"id": "29.P3.mi", "fn": "stored_gas_mass",
     "args": {"p": 2.5e6, "V": 2.50e-4, "R": R_N2, "T": 293.15, "Z": 1.0},
     "expect": 7.1834e-3, "tol": 0.001},
    {"id": "29.P3.mdot_i", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 2.5e6,
              "At": 3.141593e-8},
     "expect": 1.82321e-4, "tol": 0.002},
    {"id": "29.P3.phi_iso", "fn": "usable_fraction",
     "args": {"p_i": 2.5e6, "p_f": 5.0e5, "isothermal": True},
     "expect": 0.800, "tol": 0.001},
    {"id": "29.P3.phi_ad", "fn": "usable_fraction",
     "args": {"p_i": 2.5e6, "p_f": 5.0e5, "isothermal": False,
              "gamma": 1.400},
     "expect": 0.68318, "tol": 0.001},

    # ---------------------------------------------------------------
    # P4 — He / N2 / R-236fa in 0.600 L, eps = 50, 293.15 K
    # ---------------------------------------------------------------
    {"id": "29.P4.He_isp", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": R_HE, "T0": 293.15, "eps": 50.0},
     "expect": 176.01, "tol": 0.001},
    {"id": "29.P4.N2_isp", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "eps": 50.0},
     "expect": 75.957, "tol": 0.001},
    {"id": "29.P4.R236_isp", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.08, "R": R_R236FA, "T0": 293.15, "eps": 50.0},
     "expect": 42.750, "tol": 0.001},
    {"id": "29.P4.He_mass", "fn": "stored_gas_mass",
     "args": {"p": 3.00e7, "V": 6.00e-4, "R": R_HE, "T": 293.15, "Z": 1.17},
     "expect": 2.5261e-2, "tol": 0.002},
    {"id": "29.P4.N2_mass", "fn": "stored_gas_mass",
     "args": {"p": 3.00e7, "V": 6.00e-4, "R": R_N2, "T": 293.15, "Z": 1.19},
     "expect": 0.173849, "tol": 0.002},

    # ---------------------------------------------------------------
    # P5 — Isp penalty at Re_t ~ 1000: 1 mN at 0.60 bar
    # ---------------------------------------------------------------
    {"id": "29.P5.At", "fn": "throat_area_from_thrust",
     "args": {"F": 1.0e-3, "p0": 6.0e4, "Cf_val": 1.72918},
     "expect": 9.6386e-9, "tol": 0.002},
    {"id": "29.P5.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 6.0e4,
              "At": 9.63925e-9},
     "expect": 1.3425e-6, "tol": 0.002},

    # ---------------------------------------------------------------
    # P6 — adiabatic blowdown 200 -> 20 bar for three gammas
    # ---------------------------------------------------------------
    {"id": "29.P6.N2", "fn": "usable_fraction",
     "args": {"p_i": 2.0e7, "p_f": 2.0e6, "isothermal": False,
              "gamma": 1.400},
     "expect": 0.80693, "tol": 0.001},
    {"id": "29.P6.He", "fn": "usable_fraction",
     "args": {"p_i": 2.0e7, "p_f": 2.0e6, "isothermal": False,
              "gamma": 1.667},
     "expect": 0.74874, "tol": 0.001},
    {"id": "29.P6.R236", "fn": "usable_fraction",
     "args": {"p_i": 2.0e7, "p_f": 2.0e6, "isothermal": False,
              "gamma": 1.080},
     "expect": 0.88140, "tol": 0.001},

    # ---------------------------------------------------------------
    # Quiz
    # ---------------------------------------------------------------
    {"id": "29.Q1.Gamma", "fn": "gamma_function",
     "args": {"gamma": 1.400}, "expect": 0.684731, "tol": 0.001},
    {"id": "29.Q1.cstar", "fn": "c_star",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15},
     "expect": 430.78, "tol": 0.001},
    {"id": "29.Q5.At", "fn": "throat_area_from_thrust",
     "args": {"F": 2.0e-3, "p0": 3.0e5, "Cf_val": 1.72918},
     "expect": 3.8555e-9, "tol": 0.002},
    {"id": "29.Q5.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 3.0e5,
              "At": 3.85570e-9},
     "expect": 2.6850e-6, "tol": 0.002},

    # ---------------------------------------------------------------
    # Trade study T1 — delivered Isp of the four candidate propellants
    # (ideal values at eps = 50, 293.15 K; the module applies eta_I)
    # ---------------------------------------------------------------
    {"id": "29.T1.butane_isp", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.09, "R": 143.0503, "T0": 293.15, "eps": 50.0},
     "expect": 68.372, "tol": 0.002},
]


NOTES = """
Quantities in module 29 that have no direct library function. Each is a
one-line formula; the expected values below are what the text quotes.

BLOWDOWN TIME CONSTANT  (Eq. 3.14)
    tau = V / (Gamma * At * sqrt(R*T))  =  V*c_star / (At*R*T)
    WE4 : V=4.00e-4, At=1.767146e-8, N2 at 293.15 K  -> tau = 112.07 s
    P3  : V=2.50e-4, At=3.141593e-8, N2 at 293.15 K  -> tau =  39.40 s
    Q3  : V=3.00e-4, At=2.544690e-8, N2 at 293.15 K  -> tau =  58.37 s
          time to fall from 18 to 6 bar = tau*ln(3) = 64.13 s

ISOTHERMAL DECAY / TIME TO A PRESSURE
    t = tau * ln(p_i/p_f)
    WE4: 112.07*ln(5)  = 180.37 s
    P3 : 39.40*ln(5)   =  63.41 s

ADIABATIC BLOWDOWN TIME  (Eq. 3.15)
    x_f = (p_f/p_i)^(1/gamma)
    t   = (2*tau/(gamma-1)) * (x_f^(-(gamma-1)/2) - 1)
    WE5: x_f=0.31678 -> t = 144.85 s  (vs 180.37 s isothermal)
    P3 : x_f=0.31678 -> t =  50.92 s  (vs  63.41 s isothermal, -19.7 %)

TOTAL IMPULSE, ISOTHERMAL  (Eq. 3.17)
    I = F_i * tau * (1 - p_f/p_i) = phi * m_i * Isp * g0
    WE4: 5.4792 N.s      P3: 4.2806 N.s

TOTAL IMPULSE, ADIABATIC  (Eq. 3.18)
    I = CF * c*_i * m_i * (2/(gamma+1)) * (1 - (m_f/m_i)^((gamma+1)/2))
    WE5: 4.2709 N.s (mean Isp 69.33 s; Isp at cutoff 60.36 s)
    P3 : 3.3367 N.s (-22.1 % vs isothermal)

ADIABATIC TANK TEMPERATURE  (Eq. 3.6)
    T_f = T_i * (p_f/p_i)^((n-1)/n)
    WE5 n=1.4 : 293.15 -> 185.09 K ;  n=1.2 : 293.15 -> 224.18 K
    P6  200->20 bar: N2 151.8 K, He 116.7 K, R-236fa 247.2 K

THROAT REYNOLDS NUMBER  (Eq. 3.11)
    T_star = 2*T0/(gamma+1);  mu_star = mu_293 * (T_star/293.15)^0.7
    Re_t   = 4*mdot / (pi*Dt*mu_star)
    N2, mu_293 = 1.76e-5 Pa.s, T0 = 293.15 K -> T* = 244.29 K,
    mu* = 1.5491e-5 Pa.s.
    WE2 (Dt=1.1513 mm, mdot=4.8330e-3) : Re_t = 3.450e5
    WE3 (Dt=60.68 um,  mdot=1.3425e-6) : Re_t = 1.819e3
    WE4 (Dt=0.150 mm)                  : Re_t = 4.496e4 at 20 bar,
                                                8.99e3 at 4 bar
    WE6 (Dt=0.1919 mm, mdot=3.3562e-5) : Re_t = 1.438e4
    P2  (Dt=0.1517 mm, mdot=1.6781e-5) : Re_t = 9.09e3
    P5  (Dt=110.8 um,  mdot=1.3425e-6) : Re_t = 996
    Q5  (Dt=70.1 um,   mdot=2.6850e-6) : Re_t = 3.15e3

LOW-REYNOLDS EFFICIENCY  (Eq. 3.12, 3.12a, 3.13) -- [E], +-0.05
    b(eps)   = 10*sqrt(eps/50)
    eta_visc = 1 - b/sqrt(Re_t)
    lambda   = (1+cos(15 deg))/2 = 0.98296
    eta_I    = lambda * eta_visc
    WE3(50) : eta_I = 0.752 -> Isp 57.15 s
    WE3(20) : eta_I = 0.838 -> Isp 62.21 s
    P2      : eta_I = 0.880 -> Isp 66.83 s
    P5      : eta_I = 0.672 -> Isp 51.01 s
    Q5      : eta_I = 0.808 -> Isp 61.36 s
    WE4 integrated over the discharge: 5.035 N.s delivered (8.1 % below
        the 5.479 N.s ideal)

IMPULSE BIT, FIRST-ORDER VALVE  (Eq. 3.20)
    k     = 1 - exp(-t_on/tau_f)
    I_bit = F * (t_on + (tau_e - tau_f)*k)
    WE7 F=25 mN, tau_f=3 ms, tau_e=5 ms:
        t_on = 50/20/10/5/2 ms -> 1300/550/298/166/74 uN.s
    P7  F=25 mN, tau_f=2 ms, tau_e=6 ms:
        t_on = 3/6/12/40 ms -> 152.7/245.0/399.8/1100.0 uN.s
        dI/dt_on at 3 ms = 0.0362 N -> +-0.3 ms gives +-10.9 uN.s (+-7.1 %)
    Q6  F=25 mN, tau_f=4 ms, tau_e=2 ms, t_on=3 ms -> 48.6 uN.s
        (0.648 of F*t_on -- the asymmetry is reversed)

LEAKAGE  (Eq. 3.21)
    mass of 1 std cm3 (273.15 K, 101325 Pa):
        He 1.7859e-7 kg   N2 1.2498e-6 kg
    molecular-flow scaling He -> N2 : sqrt(4.003/28.014) = 0.3780
    WE8 1e-4 scc/s He, 5 yr : 7.46 g N2 (8.9 % of an 83.6 g load)
        1e-5 -> 0.75 g (0.89 %) ; 1e-6 -> 0.075 g (0.09 %)
    P8  5e-5 scc/s He, 7 yr : 5.22 g (4.35 %) molecular
                              15.19 g (12.65 %) viscous (mu ratio 1.10)
        1 % of 120 g in 7 yr requires Q_N2 <= 4.35e-6 std cm3/s
    Q8  2e-5 scc/s He, 6 yr : 1.79 g (2.98 % of 60 g)
    R2  0.4 bar/week from 0.5 L at 290 K -> 3.84e-10 kg/s
                                         -> 3.07e-4 std cm3/s N2
                                         -> 8.13e-4 std cm3/s He equiv.

JOULE-THOMSON  (Eq. 3.22)  -- [E]
    dT = mu_JT * (p2 - p1)
    N2, mu_JT ~ +0.15 K/bar : 200 -> 5 bar gives -29.2 K
    He, mu_JT ~ -0.06 K/bar : 200 -> 5 bar gives +12.1 K
    Q10 200 -> 6 bar N2 : -29.1 K, plenum at 264.0 K,
        Isp ratio sqrt(264.0/293.15) = 0.949 (-5.1 %)

TANK MASS MODEL (P4, T1)  -- thin-wall sphere, [A]
    m_tank = 1.5 * p * V / (sigma_allow/rho_metal)
    Ti-6Al-4V: 500e6/4430 = 1.129e5 m2/s2
    P4: 300 bar, 0.600 L -> 239 g
    T1: A 250 bar 1.337 L -> 444 g ; B 25 bar 13.807 L -> 459 g

TRADE STUDY T1 SUMMARY (F = 50 mN, eps = 50, 293.15 K, 250 g of
valves/electronics in every option)
    A GN2 250 bar regulated : Isp 69.4 s, m_p 334 g, V 1.34 L, wet 1.28 kg
    B GN2  25 bar blowdown  : Isp 70.7 s, m_p 397 g, V 13.81 L, wet 1.11 kg
    C R-236fa 2.7 bar       : Isp 40.0 s, m_p 624 g, V 0.51 L, wet 0.97 kg
    D n-butane 2.6 bar      : Isp 63.7 s, m_p 391 g, V 0.76 L, wet 0.80 kg
    (A fails the 1.2 L and 1.2 kg constraints; B fails volume by 11x.)
"""
