"""
Module 10 — Heat Transfer: worked-example and problem inputs.

Only examples whose arithmetic maps directly onto a rocket.py function are
listed in EXAMPLES. The rest are described in comments below with their
expected results so they can be checked by hand.

Reference engine RE-500 (Modules 03 and 06), used throughout module 10:
    propellants        LOX / RP-1, MR 2.35
    thrust (SL)        F      = 500 kN
    chamber pressure   p0     = 1.00e7 Pa  (nozzle stagnation station)
    chamber temp       T0     = 3600 K
    gamma              g      = 1.20
    molar mass         M      = 22.0 kg/kmol   -> R = 377.93 J/(kg K)
    throat area        At     = 0.030582 m^2
    throat diameter    Dt     = 0.19732768 m
    throat radius      Rt     = 0.098663 m,  Ru = 1.5 Rt = 0.14799576 m
    c* ideal                  = 1798.6 m/s ; eta_c* = 0.96
    c* delivered       cs     = 1726.6222 m/s   <-- the value Bartz needs,
                                because p0/c* IS the throat mass flux mdot/At
    transport (CEA, chamber stagnation):
        mu0  = 1.00e-4 Pa s
        cp0  = g R/(g-1)      = 2267.58 J/(kg K)
        Pr0  = 4g/(9g-5)      = 0.827586

Station Mach numbers at gamma = 1.20 (Module 02 area relation):
        A/At = 2.0 subsonic   -> M = 0.31220
        A/At = 1.0 (throat)   -> M = 1.0
        A/At = 5.0 supersonic -> M = 2.78504
        A/At = 10.0 supersonic-> M = 3.27834
        A/At = 25.0 supersonic-> M = 3.91277

RS-25 sanity-check case (WE1 sanity check; engine architecture and pc from
reference/_verify-liquid.md, gas properties assumed as stated in the module —
no heat-flux figure for any engine exists in that file):
        p0 = 2.064e7 Pa, T0 = 3600 K, g = 1.19, M = 13.5 kg/kmol
        R = 615.89 J/(kg K), cp0 = 3857.39, Pr0 = 0.833625
        c*_del = 2287.25 m/s, Dt = 0.26925 m, Ru = Rt = 0.134625 m
        -> sigma = 1.36663, hg = 4.9286e4 W/(m^2 K), Taw = 3568.77 K,
           q'' = 136.5 MW/m^2  (quoted band for the RS-25 throat: 100-160)

F-1 counter-check (same method, film-cooled and sooty in reality):
        p0 = 7.0e6 Pa, T0 = 3600 K, g = 1.20, M = 23.0 -> R = 361.50
        cp0 = 2169.0, Pr0 = 0.827586, c* = 1690 m/s
        Dt = 0.886904 m, Ru = 0.75 Dt = 0.665178 m
        -> hg = 1.1282e4, q'' = 31.2 MW/m^2 against a literature 8-16.
           Bartz over-predicts by ~2x because it knows nothing about the
           fuel-rich film or the carbon deposit.

NOT IN EXAMPLES (no single library function; check by hand):

  10.WE2  Steady 1-D resistance chain, iterated because sigma depends on Twg.
          Taw = 3567.27 K, Tco = 300 K, tw = 1.0e-3 m, k = 300 W/(m K).
            hc = 5.0e4  -> converged sigma 1.2595, hg 1.922e4,
                           q'' = 43.35 MW/m^2, Twg = 1312 K, Twc = 1167 K
                           (design FAILS: copper melts at 1358 K)
            hc = 1.0e5  -> q'' = 51.96 MW/m^2, Twg = 993 K, Twc = 820 K
            hc = 2.0e5  -> q'' = 58.12 MW/m^2, Twg =  784 K, Twc = 591 K
          Required hc to hold Twg = 800 K: q'' = 57.64 MW/m^2,
            Twc = 607.9 K, hc_req = 1.872e5 W/(m^2 K).
          With a 50 um carbon deposit (k = 1.0 W/(m K), R'' = 5.0e-5) and
            hc = 5.0e4: q'' = 24.85 MW/m^2, soot surface 2123 K,
            metal hot face 880 K.

  10.WE4  Semi-infinite solid, constant surface flux (Eq. 3.9/3.10):
            t_surv = pi/alpha_d * (k dT /(2 q''))^2,  alpha_d = k/(rho_s c_s)
          Copper C18200: k 320, rho 8900, cs 385 -> alpha_d = 9.3390e-5 m^2/s
            q'' = 32 MW/m^2, dT = 500 K -> t_surv = 0.2103 s,
            penetration 2 sqrt(alpha t) = 8.86 mm (10 mm wall: marginal),
            wall diffusion time L^2/alpha = 1.071 s, Fo = 0.196
          Inconel 718: k 25, rho 8190, cs 435 -> alpha_d = 7.0166e-6
            same q'' and dT -> t_surv = 0.01718 s
          At pc = 20 bar the barrel flux scales as pc^0.8 to 8.8 MW/m^2 and
            t_surv = 0.210*(32/8.8)^2 = 2.78 s.

  10.WE1 radiation adder: eps_g = 0.35, Tg = 3600 K, Tw = 800 K
            q_rad = eps_g sigma_SB (Tg^4 - Tw^4) = 3.325 MW/m^2
            = 9.45 % of the chamber total (31.89 + 3.33 = 35.2 MW/m^2)

  Problem N5 (correction factors): 38/55 = 0.691 ; 49/55 = 0.891
  Problem N6 (graphite insert): k 100, rho 1800, cs 1700
            alpha_d = 3.2680e-5 m^2/s, q'' = 20 MW/m^2, dT = 2200 K
            -> t_surv = 2.908 s, penetration 19.5 mm
  Problem N7 (radiation): eps 0.18, Tg 3500, Tw 750 -> 1.528 MW/m^2 (5.5 % of 28)
                          eps 0.07                  -> 0.594 MW/m^2 (0.99 % of 60)
  Problem N8 (RS-25 chain): q'' = 135.0 MW/m^2, Twc = 379.9 K,
            hc_req = 5.87e5 W/(m^2 K) — above the practical supercritical-H2
            band of 2-4e5, so 830 K is not holdable at 1.0 mm without help.
  Quiz Q3 (resistance split): metal 5.26 %, gas film 78.9 %, coolant film 15.8 %
  Quiz Q6 (pressure uprate): 35*(140/80)^0.8 = 54.8 MW/m^2
  Quiz Q8 (heat sink): k 320, dT 460 K, q'' 12 MW/m^2 -> t_surv = 1.265 s,
            penetration 21.7 mm, so the wall must be at least ~22 mm thick
            for the semi-infinite assumption to hold.
"""

EXAMPLES = [
    # ---- WE1: Bartz sigma at the three stations (Twg = 800 K) -------------
    {"id": "10.WE1.sigma_chamber", "fn": "bartz_sigma",
     "args": {"gamma": 1.20, "Mach": 0.31220, "Tw_over_T0": 800.0 / 3600.0},
     "expect": 1.39454, "tol": 0.001},
    {"id": "10.WE1.sigma_throat", "fn": "bartz_sigma",
     "args": {"gamma": 1.20, "Mach": 1.0, "Tw_over_T0": 800.0 / 3600.0},
     "expect": 1.36513, "tol": 0.001},
    {"id": "10.WE1.sigma_eps5", "fn": "bartz_sigma",
     "args": {"gamma": 1.20, "Mach": 2.78504, "Tw_over_T0": 800.0 / 3600.0},
     "expect": 1.19277, "tol": 0.001},

    # ---- WE1: adiabatic wall temperature ----------------------------------
    {"id": "10.WE1.Taw_chamber", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.20, "Mach": 0.31220, "r": 0.9},
     "expect": 3596.53, "tol": 0.001},
    {"id": "10.WE1.Taw_throat", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.20, "Mach": 1.0, "r": 0.9},
     "expect": 3567.27, "tol": 0.001},
    {"id": "10.WE1.Taw_eps5", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.20, "Mach": 2.78504, "r": 0.9},
     "expect": 3442.72, "tol": 0.001},
    # nozzle exit of RE-500: Taw is still 94 % of T0 - the point of section 3.3
    {"id": "10.WE1.Taw_eps16", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.20, "Mach": 3.60400, "r": 0.9},
     "expect": 3396.6, "tol": 0.002},

    # ---- WE1: Bartz hg at the three stations ------------------------------
    {"id": "10.WE1.hg_chamber", "fn": "bartz_hg",
     "args": {"Dt": 0.19732768, "mu0": 1.0e-4, "cp0": 2267.58, "Pr0": 0.827586,
              "p0": 1.0e7, "c_star_val": 1726.6222, "rc": 0.14799576,
              "A_ratio": 2.0, "sigma": 1.39454},
     "expect": 11403.3, "tol": 0.002},
    {"id": "10.WE1.hg_throat", "fn": "bartz_hg",
     "args": {"Dt": 0.19732768, "mu0": 1.0e-4, "cp0": 2267.58, "Pr0": 0.827586,
              "p0": 1.0e7, "c_star_val": 1726.6222, "rc": 0.14799576,
              "A_ratio": 1.0, "sigma": 1.36513},
     "expect": 20830.3, "tol": 0.002},
    {"id": "10.WE1.hg_eps5", "fn": "bartz_hg",
     "args": {"Dt": 0.19732768, "mu0": 1.0e-4, "cp0": 2267.58, "Pr0": 0.827586,
              "p0": 1.0e7, "c_star_val": 1726.6222, "rc": 0.14799576,
              "A_ratio": 5.0, "sigma": 1.19277},
     "expect": 4275.9, "tol": 0.002},

    # ---- WE1: heat flux at the three stations (Twg = 800 K) ---------------
    {"id": "10.WE1.q_chamber", "fn": "heat_flux",
     "args": {"hg": 11403.3, "Taw": 3596.53, "Twg": 800.0},
     "expect": 3.18904e7, "tol": 0.002},
    {"id": "10.WE1.q_throat", "fn": "heat_flux",
     "args": {"hg": 20830.3, "Taw": 3567.27, "Twg": 800.0},
     "expect": 5.76435e7, "tol": 0.002},
    {"id": "10.WE1.q_eps5", "fn": "heat_flux",
     "args": {"hg": 4275.9, "Taw": 3442.72, "Twg": 800.0},
     "expect": 1.13020e7, "tol": 0.002},

    # ---- WE1 sanity check: RS-25 throat -----------------------------------
    {"id": "10.WE1.rs25_sigma", "fn": "bartz_sigma",
     "args": {"gamma": 1.19, "Mach": 1.0, "Tw_over_T0": 800.0 / 3600.0},
     "expect": 1.36663, "tol": 0.001},
    {"id": "10.WE1.rs25_hg", "fn": "bartz_hg",
     "args": {"Dt": 0.2692496, "mu0": 1.0e-4, "cp0": 3857.39, "Pr0": 0.833625,
              "p0": 2.064e7, "c_star_val": 2287.245, "rc": 0.1346248,
              "A_ratio": 1.0, "sigma": 1.36663},
     "expect": 49286.2, "tol": 0.002},
    {"id": "10.WE1.rs25_q", "fn": "heat_flux",
     "args": {"hg": 49286.2, "Taw": 3568.77, "Twg": 800.0},
     "expect": 1.36462e8, "tol": 0.002},

    # ---- WE1 counter-check: F-1 throat (Bartz over-predicts by ~2x) -------
    {"id": "10.WE1.f1_hg", "fn": "bartz_hg",
     "args": {"Dt": 0.8869040, "mu0": 1.0e-4, "cp0": 2169.0, "Pr0": 0.827586,
              "p0": 7.0e6, "c_star_val": 1690.0, "rc": 0.6651780,
              "A_ratio": 1.0, "sigma": 1.36513},
     "expect": 11281.9, "tol": 0.002},
    {"id": "10.WE1.f1_q", "fn": "heat_flux",
     "args": {"hg": 11281.9, "Taw": 3567.27, "Twg": 800.0},
     "expect": 3.12200e7, "tol": 0.002},

    # ---- WE2: wall temperature drop across a 1 mm copper liner ------------
    {"id": "10.WE2.dTwall_43MW", "fn": "wall_dT",
     "args": {"q": 4.335e7, "t": 1.0e-3, "k": 300.0},
     "expect": 144.5, "tol": 0.002},
    {"id": "10.WE2.dTwall_58MW", "fn": "wall_dT",
     "args": {"q": 5.764e7, "t": 1.0e-3, "k": 300.0},
     "expect": 192.1, "tol": 0.002},

    # ---- WE3: thermal stress, copper alloys vs Inconel at 50 MW/m^2 -------
    {"id": "10.WE3.dT_narloy", "fn": "wall_dT",
     "args": {"q": 5.0e7, "t": 1.0e-3, "k": 300.0},
     "expect": 166.667, "tol": 0.001},
    {"id": "10.WE3.stress_narloy", "fn": "thermal_stress_hoop",
     "args": {"E": 100.0e9, "alpha": 18.0e-6, "dT": 166.667, "nu": 0.34},
     "expect": 2.27273e8, "tol": 0.001},
    {"id": "10.WE3.dT_grcop", "fn": "wall_dT",
     "args": {"q": 5.0e7, "t": 1.0e-3, "k": 290.0},
     "expect": 172.414, "tol": 0.001},
    {"id": "10.WE3.stress_grcop", "fn": "thermal_stress_hoop",
     "args": {"E": 110.0e9, "alpha": 17.0e-6, "dT": 172.414, "nu": 0.33},
     "expect": 2.40621e8, "tol": 0.001},
    {"id": "10.WE3.dT_inconel", "fn": "wall_dT",
     "args": {"q": 5.0e7, "t": 1.0e-3, "k": 25.0},
     "expect": 2000.0, "tol": 0.001},
    {"id": "10.WE3.stress_inconel", "fn": "thermal_stress_hoop",
     "args": {"E": 165.0e9, "alpha": 14.4e-6, "dT": 2000.0, "nu": 0.29},
     "expect": 3.34648e9, "tol": 0.001},

    # ---- Problem N1: hg and q at eps = 10, Twg = 700 K --------------------
    {"id": "10.N1.sigma", "fn": "bartz_sigma",
     "args": {"gamma": 1.20, "Mach": 3.27834, "Tw_over_T0": 700.0 / 3600.0},
     "expect": 1.16567, "tol": 0.001},
    {"id": "10.N1.hg", "fn": "bartz_hg",
     "args": {"Dt": 0.19732768, "mu0": 1.0e-4, "cp0": 2267.58, "Pr0": 0.827586,
              "p0": 1.0e7, "c_star_val": 1726.6222, "rc": 0.14799576,
              "A_ratio": 10.0, "sigma": 1.16567},
     "expect": 2239.35, "tol": 0.002},
    {"id": "10.N1.Taw", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.20, "Mach": 3.27834, "r": 0.9},
     "expect": 3413.51, "tol": 0.001},
    {"id": "10.N1.q", "fn": "heat_flux",
     "args": {"hg": 2239.35, "Taw": 3413.51, "Twg": 700.0},
     "expect": 6.07651e6, "tol": 0.002},

    # ---- Problem N2: same throat at pc = 200 bar -------------------------
    {"id": "10.N2.hg_200bar", "fn": "bartz_hg",
     "args": {"Dt": 0.19732768, "mu0": 1.0e-4, "cp0": 2267.58, "Pr0": 0.827586,
              "p0": 2.0e7, "c_star_val": 1726.6222, "rc": 0.14799576,
              "A_ratio": 1.0, "sigma": 1.36513},
     "expect": 36267.7, "tol": 0.002},

    # ---- Problem N3: 25 kN LOX/LH2 upper stage at 60 bar -----------------
    {"id": "10.N3.sigma", "fn": "bartz_sigma",
     "args": {"gamma": 1.21, "Mach": 1.0, "Tw_over_T0": 750.0 / 3450.0},
     "expect": 1.36747, "tol": 0.001},
    {"id": "10.N3.hg", "fn": "bartz_hg",
     "args": {"Dt": 0.05355051, "mu0": 1.0e-4, "cp0": 3685.16, "Pr0": 0.821732,
              "p0": 6.0e6, "c_star_val": 2250.0, "rc": 0.02677525,
              "A_ratio": 1.0, "sigma": 1.36747},
     "expect": 24753.5, "tol": 0.002},
    {"id": "10.N3.Taw", "fn": "adiabatic_wall_T",
     "args": {"T0": 3450.0, "gamma": 1.21, "Mach": 1.0, "r": 0.9},
     "expect": 3417.22, "tol": 0.001},
    {"id": "10.N3.q", "fn": "heat_flux",
     "args": {"hg": 24753.5, "Taw": 3417.22, "Twg": 750.0},
     "expect": 6.60229e7, "tol": 0.002},

    # ---- Problem N4: thin vs thick GRCop-42 wall at 45 MW/m^2 ------------
    {"id": "10.N4.dT_thin", "fn": "wall_dT",
     "args": {"q": 4.5e7, "t": 0.7e-3, "k": 290.0},
     "expect": 108.621, "tol": 0.001},
    {"id": "10.N4.stress_thin", "fn": "thermal_stress_hoop",
     "args": {"E": 110.0e9, "alpha": 17.0e-6, "dT": 108.621, "nu": 0.33},
     "expect": 1.51583e8, "tol": 0.001},
    {"id": "10.N4.dT_thick", "fn": "wall_dT",
     "args": {"q": 4.5e7, "t": 1.4e-3, "k": 290.0},
     "expect": 217.241, "tol": 0.001},
    {"id": "10.N4.stress_thick", "fn": "thermal_stress_hoop",
     "args": {"E": 110.0e9, "alpha": 17.0e-6, "dT": 217.241, "nu": 0.33},
     "expect": 3.03165e8, "tol": 0.001},

    # ---- Quiz Q4: 60 MW/m^2 through a 1 mm liner -------------------------
    {"id": "10.Q4.dT", "fn": "wall_dT",
     "args": {"q": 6.0e7, "t": 1.0e-3, "k": 280.0},
     "expect": 214.286, "tol": 0.001},
    {"id": "10.Q4.stress", "fn": "thermal_stress_hoop",
     "args": {"E": 105.0e9, "alpha": 17.5e-6, "dT": 214.286, "nu": 0.33},
     "expect": 2.93843e8, "tol": 0.001},
]
