"""
Module 32 — Liquid vs Solid vs Cold Gas.

Every entry below is an arithmetic step that appears verbatim in
part5-cross-system/32-comparison.md or its key, and that maps onto a function
in tools/rocket.py.  Steps that do not map onto a library function — the
mass-closure solve of Eq. 3.8, the crossover solves of Eq. 3.10, the
Clopper-Pearson reliability bounds, and the tank-mass performance-factor
relation of Eq. 3.5 — are described in the comments at the bottom, with the
equation number they exercise.

Constants used throughout:
    R(N2) = Ru/28.014 = 296.7966 J/(kg K);  g0 = 9.80665 m/s^2
    All sizing uses Eq. 3.8:
        m_p = (m_pay + m_fix)(e^(dv/c) - 1) / (1 - k(e^(dv/c) - 1)),  c = Isp*g0
    and every sized case is verified below by feeding m0 and mf back through
    tsiolkovsky_dv, which must return the requested dv.
"""

R_N2 = 8314.46 / 28.014

EXAMPLES = [
    # ---------------------------------------------------------------
    # Section 3.3 / 3.6 — cold-gas reference performance, reproduced
    # from Module 28 so the comparison table is self-consistent.
    # T0 = 300 K, vacuum.
    # ---------------------------------------------------------------
    {"id": "32.T1", "fn": "c_star",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 300.0},
     "expect": 435.78, "tol": 0.002},
    {"id": "32.T2", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 300.0, "eps": 50.0},
     "expect": 76.84, "tol": 0.002},

    # ---------------------------------------------------------------
    # Section 3.6, Table of density impulse.  density_isp returns
    # rho*Isp in kg.s/m^3; the module quotes rho*Isp*g0/1000 in N.s per
    # litre, given in the comment after each entry.
    # ---------------------------------------------------------------
    {"id": "32.DI.gn2", "fn": "density_isp",
     "args": {"rho": 280.0, "isp": 65.0},
     "expect": 18200.0, "tol": 0.001},          # 178.5 N.s/L
    {"id": "32.DI.butane", "fn": "density_isp",
     "args": {"rho": 570.0, "isp": 65.0},
     "expect": 37050.0, "tol": 0.001},          # 363.3 N.s/L
    {"id": "32.DI.r236fa", "fn": "density_isp",
     "args": {"rho": 1360.0, "isp": 40.0},
     "expect": 54400.0, "tol": 0.001},          # 533.5 N.s/L
    {"id": "32.DI.n2h4", "fn": "density_isp",
     "args": {"rho": 1004.0, "isp": 220.0},
     "expect": 220880.0, "tol": 0.001},         # 2166.1 N.s/L
    {"id": "32.DI.htp", "fn": "density_isp",
     "args": {"rho": 1390.0, "isp": 150.0},
     "expect": 208500.0, "tol": 0.001},         # 2044.7 N.s/L
    {"id": "32.DI.hydrolox", "fn": "density_isp",
     "args": {"rho": 361.0, "isp": 452.0},
     "expect": 163172.0, "tol": 0.001},         # 1600.2 N.s/L
    {"id": "32.DI.kerolox", "fn": "density_isp",
     "args": {"rho": 1016.0, "isp": 311.0},
     "expect": 315976.0, "tol": 0.001},         # 3098.7 N.s/L
    {"id": "32.DI.storable", "fn": "density_isp",
     "args": {"rho": 1162.0, "isp": 320.0},
     "expect": 371840.0, "tol": 0.001},         # 3646.5 N.s/L
    {"id": "32.DI.apcp", "fn": "density_isp",
     "args": {"rho": 1800.0, "isp": 280.0},
     "expect": 504000.0, "tol": 0.001},         # 4942.6 N.s/L
    # Problem N3: LOX/LCH4 at O/F = 3.6, rho_b = 833.455 kg/m^3 (Eq. 3.4).
    {"id": "32.N3", "fn": "density_isp",
     "args": {"rho": 833.455, "isp": 370.0},
     "expect": 308378.4, "tol": 0.001},         # 3024.2 N.s/L

    # ---------------------------------------------------------------
    # Worked Example 1 — 500 m/s on a 500 kg payload, four classes.
    # Option A (cold gas, Isp 65 s, k = 1.10) does NOT close:
    #   k(e^(dv/c) - 1) = 1.310 > 1.  See comment below.
    # Options B, C, D are sized by Eq. 3.8 and verified here.
    # ---------------------------------------------------------------
    {"id": "32.WE1.B", "fn": "tsiolkovsky_dv",          # hydrazine mono
     "args": {"isp": 220.0, "m0": 673.078422, "mf": 533.846404},
     "expect": 500.0, "tol": 0.001},
    {"id": "32.WE1.C", "fn": "tsiolkovsky_dv",          # N2O4/MMH biprop
     "args": {"isp": 320.0, "m0": 627.149304, "mf": 534.779214},
     "expect": 500.0, "tol": 0.001},
    {"id": "32.WE1.D", "fn": "tsiolkovsky_dv",          # solid kick motor
     "args": {"isp": 286.2, "m0": 623.178830, "mf": 521.487882},
     "expect": 500.0, "tol": 0.001},

    # ---------------------------------------------------------------
    # Worked Example 4 / Quiz Q8 — impulse available from a fixed
    # propellant volume.  1.5 L at the tabulated density and Isp.
    # (density_isp * g0 * V gives N.s; values in the comment.)
    # ---------------------------------------------------------------
    # 1.5 L: GN2 268 N.s, butane 545 N.s, R-236fa 801 N.s, N2H4 3249 N.s.
    # 1.2 L (Q8): R-236fa 640 N.s > the 400 N.s requirement; GN2 214 N.s < 400.

    # ---------------------------------------------------------------
    # Problem N1 — 250 kg payload, 120 m/s, cold gas vs hydrazine.
    # ---------------------------------------------------------------
    {"id": "32.N1a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 375.437740, "mf": 315.224208},
     "expect": 120.0, "tol": 0.001},
    {"id": "32.N1b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 225.0, "m0": 271.988482, "mf": 257.591463},
     "expect": 120.0, "tol": 0.001},

    # Problem N2 — the same cold-gas system capped at 100 kg wet:
    # m_p = 47.805 kg, m_i = 52.195 kg.
    {"id": "32.N2", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 350.0, "mf": 302.195122},
     "expect": 100.81, "tol": 0.002},

    # ---------------------------------------------------------------
    # Problem N6 — 6.0 L nitrogen COPV at 300 bar, 293 K.
    # Ideal-gas inventory; the real value is 15-20 % lower (Z > 1).
    # ---------------------------------------------------------------
    {"id": "32.N6", "fn": "stored_gas_mass",
     "args": {"p": 300.0e5, "V": 6.0e-3, "R": R_N2, "T": 293.0},
     "expect": 2.06988, "tol": 0.002},
    # Same tank with an explicit compressibility factor, for comparison.
    {"id": "32.N6z", "fn": "stored_gas_mass",
     "args": {"p": 300.0e5, "V": 6.0e-3, "R": R_N2, "T": 293.0, "Z": 1.17},
     "expect": 1.76913, "tol": 0.002},

    # ---------------------------------------------------------------
    # Problem E2 — leak diagnosis. 1.5 L GN2 at 210 bar, 291 K.
    # ---------------------------------------------------------------
    {"id": "32.E2a", "fn": "stored_gas_mass",
     "args": {"p": 210.0e5, "V": 1.5e-3, "R": R_N2, "T": 291.0},
     "expect": 0.364719, "tol": 0.002},
    # Standard-condition density used to convert the leak rate to scc/min.
    {"id": "32.E2b", "fn": "stored_gas_mass",
     "args": {"p": 101325.0, "V": 1.0, "R": R_N2, "T": 273.15},
     "expect": 1.24985, "tol": 0.002},

    # ---------------------------------------------------------------
    # Problem E3 — 480 kg payload, 550 m/s, solid vs storable biprop.
    # Solid wet 128.1 kg; bipropellant wet 129.7 kg.
    # ---------------------------------------------------------------
    {"id": "32.E3s", "fn": "tsiolkovsky_dv",
     "args": {"isp": 286.2, "m0": 608.123908, "mf": 499.904171},
     "expect": 550.0, "tol": 0.001},
    {"id": "32.E3b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 320.0, "m0": 609.749634, "mf": 511.723639},
     "expect": 550.0, "tol": 0.001},

    # ---------------------------------------------------------------
    # Quiz Q6 — 300 kg payload, 250 m/s, hydrazine (220 s, k 0.20, 6 kg).
    # m_p = 38.541 kg, m_i = 13.708 kg, wet = 52.25 kg.
    # ---------------------------------------------------------------
    {"id": "32.Q6", "fn": "tsiolkovsky_dv",
     "args": {"isp": 220.0, "m0": 352.249727, "mf": 313.708288},
     "expect": 250.0, "tol": 0.001},

    # ---------------------------------------------------------------
    # Trade study T1 — 120 kg smallsat, 150 m/s, hydrazine option C.
    # Delta-v propellant only (the 600 N.s of ACS adds 0.278 kg).
    # ---------------------------------------------------------------
    {"id": "32.T1C", "fn": "tsiolkovsky_dv",
     "args": {"isp": 220.0, "m0": 135.413968, "mf": 126.318995},
     "expect": 150.0, "tol": 0.001},
    {"id": "32.T1Cp", "fn": "propellant_for_dv",
     "args": {"isp": 220.0, "m_final": 126.318995, "dv": 150.0},
     "expect": 9.09497, "tol": 0.002},
]

# ---------------------------------------------------------------------------
# Steps in the module that do NOT map onto a rocket.py function
# ---------------------------------------------------------------------------
# 32.Eq3.8   Mass closure. For m_i = k m_p + m_fix,
#              m_p = (m_pay + m_fix)(R - 1) / (1 - k(R - 1)),  R = e^(dv/c)
#            The design closes only if k(R - 1) < 1.
#            WE1, dv = 500 m/s, m_pay = 500 kg:
#              A cold gas  Isp  65, k 1.10   R 2.1911  k(R-1) = 1.310  NO SOLUTION
#              B hydrazine Isp 220, k 0.20   R 1.2608  k(R-1) = 0.052  m_p 139.2 kg
#              C N2O4/MMH  Isp 320, k 0.16   R 1.1727  k(R-1) = 0.028  m_p  92.4 kg
#              D solid     Isp 286.2, k 0.0638 R 1.1950 k(R-1)= 0.012  m_p 101.7 kg
#            Wet system masses 173.1 / 127.1 / 123.2 kg for B / C / D.
#
# 32.Eq3.9   Closure ceiling  dv_max = c ln(1 + 1/k):
#              Isp 65, k 1.10  -> 412.2 m/s   (WE1 option A)
#              Isp 70, k 1.05  -> 459.3 m/s   (problem N2)
#              Isp 70, k 1.20  -> 416.1 m/s   (quiz Q2)
#
# 32.Eq3.5   COPV tank mass from the performance factor,
#              m_tank = pV / (g0 * (pV/W)).
#            1 kg of GN2 at 280 kg/m^3 occupies 3.571e-3 m^3; at 241 bar,
#              pV = 8.61e4 J, and at pV/W = 8,000 m, m_tank = 1.10 kg.
#            That 1.10 is the k used for the cold-gas option in WE1.
#            Q8: a 2.2 L COPV at 241 bar masses 0.68 kg and stores 53 kJ.
#            Sec. 3.18: 5 L at 310 bar stores pV = 155 kJ = 37 g TNT-equiv.
#            N6: 6 L at 300 bar stores 180 kJ = 43 g TNT-equiv.
#
# 32.Eq3.10  Cold-gas / monopropellant crossover by total impulse,
#              It* = (m_fix2 - m_fix1) / [ (1+k1)/(Isp1 g0) - (1+k2)/(Isp2 g0) ]
#            WE3: cold gas 65 s, k 1.10, 1.0 kg vs hydrazine 220 s, k 0.20,
#            4.5 kg.  Coefficients 3.2945e-3 and 5.5621e-4 kg per N.s;
#              It* = 3.5 / 2.7383e-3 = 1,278 N.s ; system mass 5.21 kg either
#              way; 2.005 kg of GN2 against 0.592 kg of hydrazine.
#            Sensitivity on the monopropellant fixed mass:
#              3.0 kg -> 730 N.s ; 4.5 kg -> 1,278 N.s ; 6.0 kg -> 1,826 N.s.
#            Problem N5: R-236fa 45 s, k 0.25, 0.8 kg vs hydrazine 225 s,
#              k 0.18, 4.0 kg -> coefficients 2.8325e-3 and 5.3478e-4,
#              It* = 3.2 / 2.2977e-3 = 1,393 N.s.
#
# 32.XOVER   Solid-kick / storable-bipropellant crossover by dv, both sized
#            by Eq. 3.8 with m_pay = 500 kg:
#              solid   Isp 286.2, k 0.11, m_fix  8 kg
#              biprop  Isp 320.0, k 0.14, m_fix 18 kg
#            wet system mass (kg): dv 200 -> 50.0 / 57.2 ; 400 -> 95.9 / 99.8 ;
#              600 -> 146.0 / 146.2 ; 800 -> 201.0 / 196.7 ; 1200 -> 327.6 / 312.2
#            Crossover dv = 609 m/s, and the two answers stay within 3 % of
#            each other from roughly 350 to 850 m/s.
#
# 32.WE2     Booster comparison at equal total impulse.
#              GEM-63XL: m_p 47,853 kg, Isp 280.3 s
#                It = 47,853 * 280.3 * 9.80665 = 1.3154e8 N.s
#                inert 53,030 - 47,853 = 5,177 kg ; zeta = 0.902
#                F_avg = It/87.3 = 1.507e6 N ; avg/peak = 1.507/2.061 = 0.731
#                stage T/W = 2.061e6 / (53,030 * 9.80665) = 3.96
#              Kerolox strap-on at a trajectory-average Isp of 297 s:
#                m_p = It/(297*9.80665) = 45,162 kg
#                inert = 0.055*45,162 + 470 = 2,954 kg ; gross 48,116 kg
#                zeta = 0.939 ; mdot = 845e3/(282*9.80665) = 305.6 kg/s
#                burn time = 45,162/305.6 = 148 s
#                stage T/W = 845e3/(48,116*9.80665) = 1.79
#              Cost proxy [J, illustrative only]: inert mass x complexity
#                weight (1 solid, 6 liquid) -> 5,177 vs 17,724, ratio 3.4:1.
#
# 32.N7      GEM-63: It = 44,087*279.1*9.80665 = 1.2067e8 N.s ; zeta = 0.8935 ;
#              F_avg = 1.236e6 N ; avg/peak = 0.749 ;
#              stage T/W = 1.6496e6/(49,342*9.80665) = 3.41.
#
# 32.REL     Reliability from a flight record.  Point estimate (n-f)/n;
#            one-sided Clopper-Pearson lower bound p_L solving
#            P(X >= n-f | p) = alpha, which for f = 0 is p_L = alpha^(1/n).
#              n=10  f=0 -> p_L(90%) 0.794
#              n=30  f=0 -> 0.926      (quiz Q4 competitor claim)
#              n=50  f=0 -> 0.955
#              n=84  f=0 -> 0.973      (quiz Q4)
#              n=100 f=0 -> 0.977
#              n=369 f=0 -> 0.994      (Rutherford record to Apr 2024)
#              n=270 f=1 -> point 0.9963, p_L(90%) 0.9857  (Shuttle SRB record)
#              n=63  f=1 -> point 0.98413, p_L(90%) 0.9397 (problem N4);
#                reaching p_L = 0.99 with that failure needs n = 388, i.e.
#                325 further consecutive successes.
#            n needed for p_L at 90 % with zero failures: ln(0.1)/ln(p_L);
#              0.99 -> 230 flights ; 0.995 -> 460 flights (quiz Q4).
#
# 32.E1      Data-sheet consistency check.  m_p 300 t, Isp 286 s, t_b 140 s:
#              It = 3.0e5*286*9.80665 = 8.414e8 N.s ; F_avg = 6.01e6 N.
#            The quoted 15.12 MN is 2.52x that, which closes only if the
#            figure is a two-motor total (7.56 MN/motor) AND a maximum
#            (7.56/6.01 = 1.26 peak-to-average).  Missing qualifiers:
#            /vehicle vs /motor, and max vs avg.
#
# 32.E2      Leak diagnosis, 1.5 L GN2 at 210 bar, 291 K, dp/dt 0.4 bar/day.
#              thermal artefact would need dT = T dp/p = 0.554 K/day, against
#                a telemetry band of +-0.4 K -> it is a leak
#              dp/dt   = 0.4e5/86400 = 0.4630 Pa/s
#              mdot_L  = (V/(R T)) dp/dt = 8.04e-9 kg/s = 0.695 g/day
#              V_std   = 8.04e-9/1.2498 = 6.43e-9 m^3/s = 0.386 scc/min
#              t_empty = 0.3647/6.95e-4 = 525 days
#
# 32.T1      Trade study, 120 kg smallsat, dv 150 m/s, ACS 600 N.s.
#            Wet propulsion system mass by Eq. 3.8 (ACS propellant added at
#            the same Isp, inert taken on the total propellant load):
#              A GN2      70 s, k 1.10, 1.5 kg -> 41.5 prop, 88.5 kg wet, 148 L
#              B1 butane  65 s, k 0.35, 1.5 kg -> 36.5 prop, 50.7 kg wet,  64 L
#              B2 R-236fa 40 s, k 0.25, 1.5 kg -> 65.6 prop, 83.5 kg wet,  48 L
#              C hydrazine 220 s, k 0.20, 4.5 kg -> 9.4 prop, 15.8 kg wet, 9.3 L
#              C2 HTP-90  150 s, k 0.20, 4.5 kg -> 14.1 prop, 21.4 kg wet, 10.1 L
#              D N2O4/MMH 300 s, k 0.30, 12  kg ->  7.2 prop, 21.4 kg wet,  6.2 L
#              E Hall EP 1500 s -> 1.28 kg propellant, ~5 kg hardware
#            Total impulse of the mission is ~1.9e4 N.s, i.e. 15x the 1,278 N.s
#            cold-gas crossover -> A, B1, B2 are eliminated by Eq. 3.10 before
#            any sizing.
#            EP thrust at the 120 W cap: F = 2 eta P / c = 2*0.45*120/14710
#              = 7.3 mN, so 1.885e4 N.s takes 2.58e6 s = 30 days of cumulative
#              thrusting.  That is feasible over three years and is the
#              operations-concept constraint, not a mass constraint.
