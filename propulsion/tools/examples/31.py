"""
Module 31 — Real Cold-Gas Systems.

Every entry below is an arithmetic step that appears verbatim in
part4-coldgas/31-coldgas-systems.md or its key, and that maps onto a function
in tools/rocket.py. Steps that do not map onto a library function are
described in the comments rather than tabulated.

Constants used throughout:
    R(N2)      = Ru/28.014 = 296.7966 J/(kg K)
    R(butane)  = Ru/58.122 = 143.0512 J/(kg K)
    R(R-236fa) = Ru/152.04 =  54.6860 J/(kg K)
    R(He)      = Ru/4.003  = 2076.8074 J/(kg K)
    T0 = 300 K for all ideal-performance figures; g0 = 9.80665 m/s^2.
"""

R_N2 = 8314.46 / 28.014
R_C4H10 = 8314.46 / 58.122
R_R236FA = 8314.46 / 152.04
R_HE = 8314.46 / 4.003

EXAMPLES = [
    # ---------------------------------------------------------------
    # Section 3.2 / 4 — ideal cold-gas performance table
    # T0 = 300 K, vacuum, at the stated area ratio.
    # ---------------------------------------------------------------
    {"id": "31.T1", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 300.0, "eps": 20.0},
     "expect": 75.10, "tol": 0.002},
    {"id": "31.T2", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 300.0, "eps": 50.0},
     "expect": 76.84, "tol": 0.002},
    {"id": "31.T3", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 300.0, "eps": 100.0},
     "expect": 77.76, "tol": 0.002},
    {"id": "31.T4", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.09, "R": R_C4H10, "T0": 300.0, "eps": 50.0},
     "expect": 69.16, "tol": 0.002},
    {"id": "31.T5", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.08, "R": R_R236FA, "T0": 300.0, "eps": 50.0},
     "expect": 43.25, "tol": 0.002},
    {"id": "31.T6", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": R_HE, "T0": 300.0, "eps": 50.0},
     "expect": 178.06, "tol": 0.002},
    {"id": "31.T7", "fn": "c_star",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 300.0},
     "expect": 435.78, "tol": 0.002},

    # ---------------------------------------------------------------
    # Worked Example 1 — SAFER: 1.4 kg GN2, m0 ~ 180 kg suited crew
    # (a) ideal Isp = 76.84 s ; (b) 0.90 rule -> 69.16 s
    # (c) published dv = 3.05 m/s inverts to Isp = 39.8 s  [see comment]
    # ---------------------------------------------------------------
    {"id": "31.WE1a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 76.839, "m0": 180.0, "mf": 178.6},
     "expect": 5.881, "tol": 0.005},
    {"id": "31.WE1b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 69.155, "m0": 180.0, "mf": 178.6},
     "expect": 5.293, "tol": 0.005},
    {"id": "31.WE1d", "fn": "tsiolkovsky_dv",
     "args": {"isp": 39.832, "m0": 180.0, "mf": 178.6},
     "expect": 3.050, "tol": 0.005},
    # WE1, "what the 0.90 rule would have sized": propellant needed for
    # 3.05 m/s at 69.16 s against a 178.6 kg final mass.
    {"id": "31.WE1e", "fn": "propellant_for_dv",
     "args": {"isp": 69.155, "m_final": 178.6, "dv": 3.05},
     "expect": 0.8057, "tol": 0.005},

    # ---------------------------------------------------------------
    # Worked Example 2 — MMU: 11.8 kg GN2 at a steady-flow 70 s.
    # The published 33.5-39.6 m/s matches NEITHER reference mass.
    # ---------------------------------------------------------------
    {"id": "31.WE2a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 340.0, "mf": 328.2},
     "expect": 24.25, "tol": 0.005},
    {"id": "31.WE2b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 148.0, "mf": 136.2},
     "expect": 57.04, "tol": 0.005},
    {"id": "31.WE2c", "fn": "tsiolkovsky_dv",
     "args": {"isp": 76.839, "m0": 340.0, "mf": 328.2},
     "expect": 26.60, "tol": 0.005},
    # WE2 step 4: propellant needed for 36 m/s from m0 = 340 kg at 70 s.
    # Expressed on the final-mass basis that propellant_for_dv uses:
    # m_final = 340 - 17.371 = 322.629 kg.
    {"id": "31.WE2d", "fn": "propellant_for_dv",
     "args": {"isp": 70.0, "m_final": 322.629, "dv": 36.0},
     "expect": 17.371, "tol": 0.005},

    # ---------------------------------------------------------------
    # Worked Example 3 — MarCO: 755 N.s, 40 s, wet module 3.49 kg.
    # m_p = 755/(40*g0) = 1.9247 kg  [not a library fn; see comment]
    # ---------------------------------------------------------------
    {"id": "31.WE3a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 40.0, "m0": 12.0, "mf": 10.0753},
     "expect": 68.58, "tol": 0.005},
    {"id": "31.WE3b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 40.0, "m0": 13.5, "mf": 11.5753},
     "expect": 60.34, "tol": 0.005},
    {"id": "31.WE3c", "fn": "tsiolkovsky_dv",
     "args": {"isp": 40.0, "m0": 19.85, "mf": 17.9253},
     "expect": 39.99, "tol": 0.005},

    # ---------------------------------------------------------------
    # Worked Example 4 — butane -> GN2 at equal volume (105.3 cm^3).
    # 60 g butane at 0.57 g/cm3  vs  29.5 g GN2 at 0.28 g/cm3.
    # ---------------------------------------------------------------
    {"id": "31.WE4a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 65.0, "m0": 2.660, "mf": 2.600},
     "expect": 14.54, "tol": 0.005},
    {"id": "31.WE4b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 2.6295, "mf": 2.600},
     "expect": 7.744, "tol": 0.005},

    # ---------------------------------------------------------------
    # Problem N1 — 2.0 L GN2 tank, 250 bar, 293 K, cut-off 4 bar.
    # ---------------------------------------------------------------
    {"id": "31.N1a", "fn": "stored_gas_mass",
     "args": {"p": 250.0e5, "V": 2.0e-3, "R": R_N2, "T": 293.0},
     "expect": 0.57497, "tol": 0.002},
    {"id": "31.N1b", "fn": "usable_fraction",
     "args": {"p_i": 250.0e5, "p_f": 4.0e5, "isothermal": True},
     "expect": 0.984, "tol": 0.002},
    {"id": "31.N1c", "fn": "usable_fraction",
     "args": {"p_i": 250.0e5, "p_f": 4.0e5, "isothermal": False,
              "gamma": 1.4},
     "expect": 0.94785, "tol": 0.002},

    # ---------------------------------------------------------------
    # Problem N3 — 4 kg CubeSat, 80 g butane, 65 s.
    # ---------------------------------------------------------------
    {"id": "31.N3", "fn": "tsiolkovsky_dv",
     "args": {"isp": 65.0, "m0": 4.000, "mf": 3.920},
     "expect": 12.878, "tol": 0.005},

    # ---------------------------------------------------------------
    # Problem N4 — SAFER against a 140 kg reference mass instead of 180.
    # ---------------------------------------------------------------
    {"id": "31.N4", "fn": "tsiolkovsky_dv",
     "args": {"isp": 30.946, "m0": 140.0, "mf": 138.6},
     "expect": 3.050, "tol": 0.005},

    # ---------------------------------------------------------------
    # Problem N5 — impulse bit, F = 50 mN, t_rise 1.2 ms, t_fall 0.9 ms.
    # ---------------------------------------------------------------
    {"id": "31.N5a", "fn": "impulse_bit",
     "args": {"F": 0.050, "t_on": 0.100, "t_rise": 1.2e-3, "t_fall": 0.9e-3},
     "expect": 4.9925e-3, "tol": 0.002},
    {"id": "31.N5b", "fn": "impulse_bit",
     "args": {"F": 0.050, "t_on": 0.010, "t_rise": 1.2e-3, "t_fall": 0.9e-3},
     "expect": 4.925e-4, "tol": 0.002},
    {"id": "31.N5c", "fn": "impulse_bit",
     "args": {"F": 0.050, "t_on": 0.002, "t_rise": 1.2e-3, "t_fall": 0.9e-3},
     "expect": 9.25e-5, "tol": 0.002},

    # ---------------------------------------------------------------
    # Problem N8 — 12 kg spacecraft, 25 m/s TCM at 40 s.
    # m_final = 12.0/exp(25/392.266) = 11.2591 kg -> 0.7409 kg burned.
    # ---------------------------------------------------------------
    {"id": "31.N8", "fn": "propellant_for_dv",
     "args": {"isp": 40.0, "m_final": 11.2591, "dv": 25.0},
     "expect": 0.7409, "tol": 0.005},

    # ---------------------------------------------------------------
    # Problem E1 — 2.2 kg GN2, 55 kg system, claimed 8 m/s.
    # Against the 55 kg system alone the answer is 28 m/s, so the
    # published figure must refer to system + suited crew (~190 kg).
    # ---------------------------------------------------------------
    {"id": "31.E1a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 55.0, "mf": 52.8},
     "expect": 28.02, "tol": 0.005},
    {"id": "31.E1b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 189.88, "mf": 187.68},
     "expect": 8.000, "tol": 0.005},

    # ---------------------------------------------------------------
    # Problem E3 — blowdown trace with a leak. 1.20 L, 293 K.
    # Tank inventory at 200.0 bar and at 146.7 bar (day 30).
    # ---------------------------------------------------------------
    {"id": "31.E3a", "fn": "stored_gas_mass",
     "args": {"p": 200.0e5, "V": 1.20e-3, "R": R_N2, "T": 293.0},
     "expect": 0.275985, "tol": 0.002},
    {"id": "31.E3b", "fn": "stored_gas_mass",
     "args": {"p": 146.7e5, "V": 1.20e-3, "R": R_N2, "T": 293.0},
     "expect": 0.202435, "tol": 0.002},
    # Mass removed by burn 1 (198.0 -> 176.5 bar) as an inventory difference.
    {"id": "31.E3c", "fn": "stored_gas_mass",
     "args": {"p": 21.5e5, "V": 1.20e-3, "R": R_N2, "T": 293.0},
     "expect": 0.029668, "tol": 0.002},
    # Standard-condition density used to convert the leak rate to scc/min.
    {"id": "31.E3d", "fn": "stored_gas_mass",
     "args": {"p": 101325.0, "V": 1.0, "R": R_N2, "T": 273.15},
     "expect": 1.24985, "tol": 0.002},

    # ---------------------------------------------------------------
    # Quiz Q6 — 0.8 L GN2 tank, 300 bar, 293 K, cut-off 6 bar, 68 s.
    # ---------------------------------------------------------------
    {"id": "31.Q6a", "fn": "stored_gas_mass",
     "args": {"p": 300.0e5, "V": 0.8e-3, "R": R_N2, "T": 293.0},
     "expect": 0.275985, "tol": 0.002},
    {"id": "31.Q6b", "fn": "usable_fraction",
     "args": {"p_i": 300.0e5, "p_f": 6.0e5, "isothermal": True},
     "expect": 0.980, "tol": 0.002},
]

# ---------------------------------------------------------------------------
# Steps in the module that do NOT map onto a rocket.py function
# ---------------------------------------------------------------------------
# 31.WE1c  Inverted Isp from a published dv:
#            Isp = dv / (g0 * ln(m0/(m0-mp)))
#                = 3.05 / (9.80665 * ln(180.0/178.6)) = 39.83 s
#          The ratio to the ideal 76.84 s is 0.518 — the pulse-mode penalty.
#
# 31.WE2e  Reference mass that closes the MMU spec at 36 m/s and 70 s:
#            k  = exp(36/686.47) = 1.053841
#            m0 = 11.8 * k/(k-1) = 231.0 kg
#          At 40 s the same solve gives 134.6 kg, which is BELOW the MMU's
#          own 148 kg loaded mass — the argument that excludes a low Isp.
#
# 31.WE3d  Propellant mass from total impulse:
#            m_p = It/(Isp*g0) = 755/(40*9.80665) = 1.9247 kg
#          Dry module 3.49 - 1.925 = 1.565 kg; propellant mass fraction 0.551.
#          Spacecraft mass that yields a stated dv, m0 = m_p*k/(k-1):
#            dv = 40.0 m/s -> 19.85 kg ;  dv = 68.6 m/s -> 12.00 kg.
#          This is how the "> 40 m/s" and "68.6 m/s" sources reconcile.
#
# 31.WE4c  Equal-volume substitution:
#            V      = 0.060/0.57 = 0.1053 L = 105.3 cm^3
#            m_GN2  = 105.3 * 0.28 = 29.5 g
#          Tank mass from the performance factor (Eq. 5.1):
#            pV = 241e5 * 105.3e-6 = 2537 J
#            m_tank = pV/(g0 * pV/W) = 17 g (15,000 m) ... 52 g (5,000 m)
#
# 31.3.2   Impulse density rho*Isp*g0, in N.s per cm^3 of propellant:
#            He   0.04 g/cm3 * 178.1 s * g0 = 0.070
#            N2   0.28       *  76.8       = 0.211
#            C4H10 0.57      *  69.2       = 0.387
#            R236fa 1.36     *  43.2       = 0.576
#            Xe   2.74       *  31.1       = 0.836
#          NOTE: reference/_verify-solid-coldgas.md Sec. B.1 quotes 7.1 and
#          5.8 N.s/cm^3 for He and R-236fa. Those do not reproduce (a factor
#          of 100, and the ratio is inverted). The values above are correct;
#          the worksheet's CONCLUSION still holds and is strengthened.
#
# 31.E3e   Leak rate from the quiescent droop, dp/dt = 0.35 bar/day:
#            dp/dt   = 0.35e5/86400 = 0.4051 Pa/s
#            mdot_L  = (V/(R T)) dp/dt = 5.59e-9 kg/s = 0.483 g/day
#            V_std   = mdot_L/1.2498 = 4.47e-3 cm^3/s = 0.268 scc/min
#            t_empty = 0.2024/4.83e-4 = 419 days from day 30.
#          Thermal-artefact rejection: p ~ T at fixed mass would need
#            dT = T dp/p = 293*0.35/200 = 0.51 K/day = 15 K over 30 days,
#          against telemetry flat at 293 +/- 0.5 K.
#
# 31.T1    Trade study, m0 = 18 kg, dv = 35 m/s, ACS 150 N.s:
#            m_p = m0 (1 - exp(-dv/(Isp g0))) ; V = m_p/rho
#            A GN2   70 s, 0.28 g/cm3 -> 1.113 kg, 3,980 cm^3
#            B R236fa 40 s, 1.36      -> 1.919 kg, 1,410 cm^3
#            C butane 65 s, 0.57      -> 1.197 kg, 2,100 cm^3
#            D warm   82 s, 1.36      -> 0.953 kg,   701 cm^3
#          Only B and D fit inside 1.5 L. Option A's COPV, at pV/W = 8,000 m,
#          masses 1.22 kg against 1.113 kg of propellant.
