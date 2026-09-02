"""
Module 13 — Engine Cycles: worked-example inputs and expected outputs.

Only examples whose arithmetic maps directly onto a rocket.py function are
listed in EXAMPLES. Everything else is described in the comments below with
its expected result so it can be checked by hand.

Library functions used:
    pump_power(mdot, dp, rho, eta)                  -> W
    turbine_power(mdot, cp, T_in, pr, gamma, eta)   -> W

Standing conventions for this module:
    injector drop      dp_inj = 0.20 * pc
    pump inlet         3-4 bar (tank + boost pump)
    mechanical eff.    eta_m = 0.98 (applied outside the library calls)

--------------------------------------------------------------------------
WE1 — GG flow fraction and Isp penalty, module 03 reference engine
      500 kN SL LOX/RP-1, pc = 100 bar, MR = 2.35,
      mdot = 184.8 kg/s (129.6 ox + 55.2 fuel), Isp_vac(main) = 303.3 s.
      Fuel pump   dp = 136 bar, rho = 810,  eta_p = 0.70 -> 1.3240 MW
      Ox pump     dp = 121 bar, rho = 1141, eta_p = 0.70 -> 1.9634 MW
      Pump total 3.2874 MW; shaft = /0.98 = 3.3545 MW
      Turbine     cp = 2100, T = 1000 K, pr = 20, gamma = 1.25, eta_t = 0.65
                  specific work 6.1523e5 J/kg
      -> mdot_gg = 5.452 kg/s ; f_gg = 5.452/190.25 = 2.87 %
      -> Isp with no dump credit  294.6 s  (penalty 8.7 s)
      -> Isp with 120 s dump      298.1 s  (penalty 5.2 s)

WE2 — Closed-expander feasibility, LOX/LH2, pc = 40 bar, MR = 5.5,
      Isp = 450 s, c* = 2300 m/s.
        A (100 kN): mdot 22.660, mf 3.4862, mo 19.174,
                    At 0.013030 m2, Dt 0.128802 m
        B (1 MN)  : mdot 226.60, mf 34.862, mo 191.74,
                    At 0.130297 m2, Dt 0.407307 m
      Heat model: q_throat = 160 MW/m2 * (pc/206)^0.8 * (0.262/Dt)^0.2
                  flux-weighted area = 15.4 * At
        A: q_t = 50.0 MW/m2, Q = 10.03 MW, dT = 198 K, T_t = 228 K
        B: q_t = 39.7 MW/m2, Q = 79.69 MW, dT = 158 K, T_t = 188 K
      Jacket drop scales with Dt: 30 bar (A) -> 94.9 bar (B)
      Fixed point (p_inj = 48 bar, pump inlet 3 bar, eta_p = eta_t = 0.70,
      gamma = 1.4, cp = 14500):
        A closes at dp_t = 25 bar, pr = 1.521,
          turbine 0.9120 MW vs pumps 0.8259 MW  (pump discharge 103 bar)
        B closes at dp_t = 105 bar, pr = 3.188,
          turbine 18.722 MW vs pumps 18.629 MW  (pump discharge 248 bar)
      -> the 1 MN engine "closes" only at 6.2x chamber pressure at the pump.

WE3 — RS-25-class preburner temperature and pressure ratio.
      F_vac 2279 kN, Isp 452.3 s, MR 6.03 -> mdot 513.80, mf 73.09, mo 440.72
      Published pump powers: HPFTP 53.05 MW, HPOTP 17.34 MW.
      Pump check: mf 73.09 kg/s, dp = 463 bar, rho 75, eta 0.80 -> 56.40 MW
        (implied eta_p on the published 53.05 MW is 0.85 at rho = 75)
      Preburner chemistry model, per kg H2 with r kg O2 (stoich O/F = 8):
        Y_H2 = (1-r/8)/(1+r), Y_H2O = (9r/8)/(1+r)
        cp = 15000*Y_H2 + 2300*Y_H2O
        M  = (1+r) / ((1-r/8)/2 + (9r/8)/18)
        T  = 120 K + (r/8)*120.9e6 / (cp*(1+r))
          r=0.7 -> cp 9117, M 3.400, gamma 1.3665, T  803 K
          r=0.8 -> cp 8650, M 3.600, gamma 1.3643, T  896 K
          r=0.9 -> cp 8232, M 3.800, gamma 1.3620, T  990 K
          r=1.0 -> cp 7856, M 4.000, gamma 1.3598, T 1082 K
      At r = 0.9: preburner gas flow 138.9 kg/s, required shaft power
      (53.05+17.34)/0.98 = 71.83 MW -> required pr = 1.376.

WE4 — Electric-pump battery mass. e_b (usable) = 110 Wh/kg = 3.96e5 J/kg,
      eta_mot 0.95, eta_inv 0.97.
      A) Rutherford: 24.9 kN SL, Isp 311 s -> mdot 8.164 kg/s;
         P_elec 74 kW, t_b 154 s -> E 11.40 MJ -> m_batt 28.8 kg/engine
         (259 kg for nine); battery/propellant = 2.29 %.
         Implied mean pump dp from 74 kW: 5847 J/kg -> ~58 bar at rho 1000.
      B) Module 03 engine: hydraulic 3.2874 MW -> P_elec 3.567 MW,
         t_b 165 s -> E 588.6 MJ = 163.5 kWh -> m_batt 1486 kg;
         propellant 30 492 kg -> ratio 4.87 % (matches Eq. 3.9 directly).
      C) Stage dv, prop 30 500 kg, inert 3 000 kg, payload 1 500 kg:
         GG  m0 34 992, mf 4 500, Isp 294.6 s -> dv 5 926 m/s
         EP  m0 36 358, mf 5 866, Isp 303.3 s -> dv 5 426 m/s
--------------------------------------------------------------------------
"""

EXAMPLES = [
    # ---- WE1: gas generator, module 03 reference engine -------------------
    {"id": "13.WE1a", "fn": "pump_power",
     "args": {"mdot": 55.2, "dp": 136.0e5, "rho": 810.0, "eta": 0.70},
     "expect": 1.32402e6, "tol": 0.001},
    {"id": "13.WE1b", "fn": "pump_power",
     "args": {"mdot": 129.6, "dp": 121.0e5, "rho": 1141.0, "eta": 0.70},
     "expect": 1.96340e6, "tol": 0.001},
    {"id": "13.WE1c", "fn": "turbine_power",
     "args": {"mdot": 5.4524, "cp": 2100.0, "T_in": 1000.0, "pr": 20.0,
              "gamma": 1.25, "eta": 0.65},
     "expect": 3.35450e6, "tol": 0.001},

    # ---- WE2: closed expander at 100 kN (case A) --------------------------
    {"id": "13.WE2a", "fn": "pump_power",   # LH2 pump, dp = 48+30+25-3 bar
     "args": {"mdot": 3.4862, "dp": 100.0e5, "rho": 71.0, "eta": 0.70},
     "expect": 7.01247e5, "tol": 0.002},
    {"id": "13.WE2b", "fn": "pump_power",   # LOX pump, dp = 48-3 bar
     "args": {"mdot": 19.174, "dp": 45.0e5, "rho": 1141.0, "eta": 0.70},
     "expect": 1.08000e5, "tol": 0.002},
    {"id": "13.WE2c", "fn": "turbine_power",  # pr = 73/48
     "args": {"mdot": 3.4862, "cp": 14500.0, "T_in": 228.5, "pr": 1.520833,
              "gamma": 1.40, "eta": 0.70},
     "expect": 9.1198e5, "tol": 0.005},

    # ---- WE2: closed expander at 1 MN (case B) ----------------------------
    {"id": "13.WE2d", "fn": "pump_power",   # LH2, dp = 48+94.9+105-3 bar
     "args": {"mdot": 34.862, "dp": 244.9e5, "rho": 71.0, "eta": 0.70},
     "expect": 1.71755e7, "tol": 0.002},
    {"id": "13.WE2e", "fn": "pump_power",
     "args": {"mdot": 191.74, "dp": 45.0e5, "rho": 1141.0, "eta": 0.70},
     "expect": 1.08003e6, "tol": 0.002},
    {"id": "13.WE2f", "fn": "turbine_power",  # pr = 153/48
     "args": {"mdot": 34.862, "cp": 14500.0, "T_in": 187.7, "pr": 3.1875,
              "gamma": 1.40, "eta": 0.70},
     "expect": 1.87216e7, "tol": 0.005},

    # ---- WE3: RS-25 class -------------------------------------------------
    {"id": "13.WE3a", "fn": "pump_power",   # HPFTP first-order check
     "args": {"mdot": 73.09, "dp": 463.0e5, "rho": 75.0, "eta": 0.80},
     "expect": 5.63990e7, "tol": 0.002},
    {"id": "13.WE3b", "fn": "turbine_power",  # at the solved pr = 1.3764
     "args": {"mdot": 138.87, "cp": 8232.0, "T_in": 990.0, "pr": 1.3764,
              "gamma": 1.3620, "eta": 0.78},
     "expect": 7.1830e7, "tol": 0.005},

    # ---- WE4: electric pump -----------------------------------------------
    # Battery energy is P_elec * t_b; the library has no battery function, so
    # the two entries below check the pump-power half of the chain that the
    # battery mass is computed from.
    {"id": "13.WE4a", "fn": "pump_power",   # Rutherford, inferred mean pump
     "args": {"mdot": 8.164, "dp": 58.5e5, "rho": 1000.0, "eta": 0.70},
     "expect": 6.8228e4, "tol": 0.02},
    {"id": "13.WE4b", "fn": "pump_power",   # module 03 fuel pump, as WE1a
     "args": {"mdot": 55.2, "dp": 136.0e5, "rho": 810.0, "eta": 0.70},
     "expect": 1.32402e6, "tol": 0.001},

    # ---- C5: why a kerolox closed expander does not close ------------------
    # 100 kN, pc = 40 bar, MR 2.6, c* 1800, Isp 300 -> mdot 33.991,
    # mf 9.442, mo 24.549, At 0.015296 m2, Dt 0.1396 m, q_t 48.91 MW/m2,
    # Q 11.52 MW. Unconstrained bulk rise at cp 2200 is 555 K (-> 855 K),
    # far past the ~550-600 K coking limit, so Tt is CAPPED at 550 K below.
    {"id": "13.C5a", "fn": "pump_power",    # RP-1 pump, dp = 48+25+20-3 bar
     "args": {"mdot": 9.442, "dp": 90.0e5, "rho": 810.0, "eta": 0.70},
     "expect": 1.49873e5, "tol": 0.002},
    {"id": "13.C5b", "fn": "pump_power",    # LOX pump, dp = 48-3 bar
     "args": {"mdot": 24.549, "dp": 45.0e5, "rho": 1141.0, "eta": 0.70},
     "expect": 1.38313e5, "tol": 0.002},
    {"id": "13.C5c", "fn": "turbine_power",  # coking-capped Tt, pr = 68/48
     "args": {"mdot": 9.442, "cp": 2200.0, "T_in": 550.0, "pr": 1.416667,
              "gamma": 1.10, "eta": 0.70},
     "expect": 2.49264e5, "tol": 0.005},
    # -> turbine 249.3 kW vs pump shaft (0.288186/0.98) = 294.1 kW:
    #    ratio 0.85. The cycle does not close.

    # ---- N1: methalox gas generator, 900 kN at pc = 110 bar ---------------
    {"id": "13.N1a", "fn": "pump_power",    # CH4, dp = 110+22+20+5-4 bar
     "args": {"mdot": 68.1818, "dp": 153.0e5, "rho": 423.0, "eta": 0.72},
     "expect": 3.42521e6, "tol": 0.001},
    {"id": "13.N1b", "fn": "pump_power",    # LOX, dp = 110+22+5-4 bar
     "args": {"mdot": 231.8182, "dp": 133.0e5, "rho": 1141.0, "eta": 0.72},
     "expect": 3.75302e6, "tol": 0.001},
    {"id": "13.N1c", "fn": "turbine_power",  # at the solved GG flow
     "args": {"mdot": 9.8036, "cp": 2400.0, "T_in": 1050.0, "pr": 18.0,
              "gamma": 1.26, "eta": 0.66},
     "expect": 7.32474e6, "tol": 0.002},

    # ---- N2: the same engine uprated to pc = 180 bar ----------------------
    {"id": "13.N2a", "fn": "pump_power",    # dp = 180+36+32.727+5-4 bar
     "args": {"mdot": 68.1818, "dp": 249.727e5, "rho": 423.0, "eta": 0.72},
     "expect": 5.59063e6, "tol": 0.001},
    {"id": "13.N2b", "fn": "pump_power",    # dp = 180+36+5-4 bar
     "args": {"mdot": 231.8182, "dp": 217.0e5, "rho": 1141.0, "eta": 0.72},
     "expect": 6.12335e6, "tol": 0.001},
    {"id": "13.N2c", "fn": "turbine_power",
     "args": {"mdot": 15.9982, "cp": 2400.0, "T_in": 1050.0, "pr": 18.0,
              "gamma": 1.26, "eta": 0.66},
     "expect": 1.19530e7, "tol": 0.002},

    # ---- N3: 150 kN closed expander, pc = 55 bar --------------------------
    {"id": "13.N3a", "fn": "pump_power",    # LH2, dp = 66+35+55-3 bar
     "args": {"mdot": 4.9437, "dp": 153.0e5, "rho": 71.0, "eta": 0.70},
     "expect": 1.52190e6, "tol": 0.002},
    {"id": "13.N3b", "fn": "pump_power",    # LOX, dp = 66-3 bar
     "args": {"mdot": 28.6733, "dp": 63.0e5, "rho": 1141.0, "eta": 0.70},
     "expect": 2.26170e5, "tol": 0.002},
    {"id": "13.N3c", "fn": "turbine_power",  # pr = 121/66, Tt = 223.7 K
     "args": {"mdot": 4.9437, "cp": 14500.0, "T_in": 223.69, "pr": 1.833333,
              "gamma": 1.40, "eta": 0.70},
     "expect": 1.78485e6, "tol": 0.005},

    # ---- N4: RD-180-class ORSC at pc = 267 bar ----------------------------
    {"id": "13.N4a", "fn": "pump_power",    # RP-1, dp = 1.45*267 - 4 bar
     "args": {"mdot": 336.0215, "dp": 383.15e5, "rho": 810.0, "eta": 0.75},
     "expect": 2.11929e7, "tol": 0.001},
    {"id": "13.N4b", "fn": "pump_power",
     "args": {"mdot": 913.9785, "dp": 383.15e5, "rho": 1141.0, "eta": 0.75},
     "expect": 4.09221e7, "tol": 0.001},
    {"id": "13.N4c", "fn": "turbine_power",  # all the LOX, at the solved pr
     "args": {"mdot": 913.9785, "cp": 1100.0, "T_in": 720.0, "pr": 1.6493,
              "gamma": 1.33, "eta": 0.75},
     "expect": 6.33841e7, "tol": 0.005},

    # ---- N6: LE-9 expander bleed ------------------------------------------
    {"id": "13.N6a", "fn": "pump_power",    # LH2, dp = 1.5*100 - 3 bar
     "args": {"mdot": 51.0309, "dp": 147.0e5, "rho": 71.0, "eta": 0.72},
     "expect": 1.46744e7, "tol": 0.001},
    {"id": "13.N6b", "fn": "pump_power",
     "args": {"mdot": 301.0824, "dp": 147.0e5, "rho": 1141.0, "eta": 0.72},
     "expect": 5.38747e6, "tol": 0.001},
    {"id": "13.N6c", "fn": "turbine_power",  # at the solved bleed flow
     "args": {"mdot": 11.2008, "cp": 15000.0, "T_in": 400.0, "pr": 8.0,
              "gamma": 1.40, "eta": 0.68},
     "expect": 2.04712e7, "tol": 0.002},

    # ---- N7: F-1 implied pump efficiency ----------------------------------
    # eta = 1.0 so these return the IDEAL hydraulic power; the implied mean
    # pump efficiency is (N7a+N7b)/(41 MW * 0.98) = 0.62.
    {"id": "13.N7a", "fn": "pump_power",
     "args": {"mdot": 788.073, "dp": 97.5e5, "rho": 810.0, "eta": 1.0},
     "expect": 9.48606e6, "tol": 0.001},
    {"id": "13.N7b", "fn": "pump_power",
     "args": {"mdot": 1788.927, "dp": 97.5e5, "rho": 1141.0, "eta": 1.0},
     "expect": 1.52866e7, "tol": 0.001},

    # ---- Q3/Q4 and Q8 ------------------------------------------------------
    {"id": "13.Q3", "fn": "turbine_power",   # at the solved GG flow
     "args": {"mdot": 9.0975, "cp": 2050.0, "T_in": 1020.0, "pr": 16.0,
              "gamma": 1.24, "eta": 0.62},
     "expect": 4.89794e6, "tol": 0.002},
    # Q8: mass (kg) substituted for mass flow (kg/s), so pump_power returns
    # the total HYDRAULIC ENERGY in J for the whole burn, not a power.
    # 3.7543e7 J / (0.95*0.96) = 4.1166e7 J; / 4.14e5 J/kg = 99.4 kg battery.
    {"id": "13.Q8", "fn": "pump_power",
     "args": {"mdot": 4200.0, "dp": 62.0e5, "rho": 1020.0, "eta": 0.68},
     "expect": 3.75433e7, "tol": 0.001},

    # ---- R3: 200 kN closed expander at pc = 45 bar (key K1-R3) ------------
    # mdot 44.144, mf 6.4917, mo 37.652, At 0.022758 m2, Dt 0.17023 m,
    # q_t 51.65 MW/m2, Q 18.10 MW, dT 192.3 K -> Tt 222.3 K,
    # jacket drop scaled from WE2 case A (30 bar at Dt 0.1288) = 39.65 bar.
    {"id": "13.R3a", "fn": "pump_power",    # LH2, dp = 54+39.65+34-3 bar
     "args": {"mdot": 6.4917, "dp": 124.65e5, "rho": 71.0, "eta": 0.70},
     "expect": 1.62815e6, "tol": 0.002},
    {"id": "13.R3b", "fn": "pump_power",    # LOX, dp = 54-3 bar
     "args": {"mdot": 37.652, "dp": 51.0e5, "rho": 1141.0, "eta": 0.70},
     "expect": 2.40422e5, "tol": 0.002},
    {"id": "13.R3c", "fn": "turbine_power",  # pr = 88/54
     "args": {"mdot": 6.4917, "cp": 14500.0, "T_in": 222.3, "pr": 1.629630,
              "gamma": 1.40, "eta": 0.70},
     "expect": 1.90758e6, "tol": 0.005},
    # -> turbine 1.9076 MW vs pump shaft 1.9067 MW: closes with 0.05 % margin
    #    at a pump discharge of 127.7 bar for a 45 bar chamber (2.8 x pc).

    # ---- T1: trade-study candidates at 1 MN methalox (key K3) -------------
    # (a) gas generator at pc = 120 bar: mdot 333.33, mf 75.757, mo 257.573,
    #     dp_j scaled to 32.727 bar -> dp_f 166.818, dp_o 145.0 bar.
    {"id": "13.T1a", "fn": "pump_power",
     "args": {"mdot": 75.757, "dp": 166.8182e5, "rho": 423.0, "eta": 0.72},
     "expect": 4.14948e6, "tol": 0.001},
    {"id": "13.T1b", "fn": "pump_power",
     "args": {"mdot": 257.573, "dp": 145.0e5, "rho": 1141.0, "eta": 0.72},
     "expect": 4.54622e6, "tol": 0.001},
    {"id": "13.T1c", "fn": "turbine_power",  # at the solved GG flow
     "args": {"mdot": 11.876, "cp": 2400.0, "T_in": 1050.0, "pr": 18.0,
              "gamma": 1.26, "eta": 0.66},
     "expect": 8.87313e6, "tol": 0.002},
    # -> shaft 8.873 MW, f_gg = 11.876/345.21 = 3.44 %,
    #    Isp penalty 7.4 s with a 130 s dump credit.
    # (b) ORSC at pc = 150 bar, MR 3.6: mf 72.463, mo 260.867,
    #     dp = 1.45*150 - 4 = 213.5 bar.
    {"id": "13.T1d", "fn": "pump_power",
     "args": {"mdot": 72.463, "dp": 213.5e5, "rho": 423.0, "eta": 0.75},
     "expect": 4.87655e6, "tol": 0.001},
    {"id": "13.T1e", "fn": "pump_power",
     "args": {"mdot": 260.867, "dp": 213.5e5, "rho": 1141.0, "eta": 0.75},
     "expect": 6.50834e6, "tol": 0.001},
    {"id": "13.T1f", "fn": "turbine_power",  # all the LOX at the solved pr
     "args": {"mdot": 260.867, "cp": 1100.0, "T_in": 750.0, "pr": 1.3513,
              "gamma": 1.33, "eta": 0.75},
     "expect": 1.16182e7, "tol": 0.005},
    # -> shaft 11.62 MW, required pr = 1.351. Comfortable margin, which is
    #    the entire argument for de-rating a reusable ORSC booster engine.
    # (d) methane expander bleed at 1 MN, pc = 60 bar: mdot 309.0,
    #     mf 67.17, At 0.094246 m2, Dt 0.3464 m, q_t 56.4 MW/m2, Q 81.9 MW,
    #     bulk rise ~348 K at cp 3500. The heat is THERE; the cycle is
    #     rejected on the jacket drop (~80 bar at that Dt), on methane's
    #     pseudo-critical cp, and on 60 bar being the wrong pc for a booster.
]

# --------------------------------------------------------------------------
# Problem-set answers (module 13 §10). Not in EXAMPLES where the arithmetic
# is a multi-step balance rather than a single library call.
#
# N1  mdot 300 kg/s, MR 3.4 -> mf 68.182, mo 231.818
#     dp_f 153 bar, dp_o 133 bar; Pf 3.4252 MW, Po 3.7530 MW,
#     pump total 7.1782 MW, shaft 7.3247 MW
#     turbine specific work 7.4715e5 J/kg -> mdot_gg 9.804 kg/s, f_gg 3.16 %
#     Isp: 329.2 s no credit (penalty 10.8 s); 333.4 s at 130 s (penalty 6.7 s)
#
# N2  pc 180 bar, dp_j scaled to 32.73 bar: dp_f 249.7 bar, dp_o 217 bar
#     Pf 5.5906 MW, Po 6.1234 MW, shaft 11.9531 MW -> mdot_gg 15.998 kg/s,
#     f_gg 5.06 %. Main-chamber Isp 344 s; delivered 333.17 s at 130 s dump
#     credit, versus 333.35 s at 110 bar -> the uprate is a net LOSS of 0.19 s.
#
# N3  150 kN closed expander, pc 55 bar, MR 5.8, c* 2320, Isp 455 s:
#     mdot 33.617, mf 4.944, mo 28.673, At 0.014180 m2, Dt 0.13440 m
#     q_t 63.6 MW/m2, Q 13.88 MW, dT 193.7 K, T_t 223.7 K
#     Closes at dp_t = 55 bar (pr 1.833): turbine 1.785 MW vs pumps 1.784 MW,
#     pump discharge 156 bar = 2.8 x pc. Feasible but at the edge.
#
# N4  RD-180 class: mf 336.02, mo 913.98, dp 383.1 bar
#     Pf 21.193 MW, Po 40.922 MW, shaft 63.383 MW
#     All the oxidizer as drive flow -> required pr = 1.649
#
# N5  E = 588.6 MJ; to match 900 kg the usable e_b must be 6.54e5 J/kg
#     = 182 Wh/kg USABLE, i.e. roughly 350-400 Wh/kg at the cell.
#
# N6  LE-9: mdot 352.11, mf 51.03, mo 301.08, dp 147 bar
#     Pf 14.674 MW, Po 5.387 MW, shaft 20.471 MW
#     turbine specific work 1.8277e6 J/kg -> bleed 11.20 kg/s
#     = 3.18 % of total flow = 22.0 % of the fuel flow
#     Isp 418.2 s with a 180 s dump (penalty 7.8 s); 412.5 s with no credit
#     (penalty 13.6 s).
#
# N7  F-1: mf 788.1, mo 1788.9, dp 97.5 bar -> ideal hydraulic power 24.77 MW
#     against 41 MW x 0.98 of shaft power -> implied mean eta_p = 0.62.
#
# Q3  turbine specific work 5.3838e5 J/kg; shaft 4.898 MW -> mdot_gg 9.098 kg/s
#     f_gg = 9.098/260 = 3.50 %; main flow 250.90 kg/s
# Q4  no credit 301.1 s (penalty 10.9 s); 140 s dump 306.0 s (penalty 6.0 s)
# Q6  dT scales as Dt^-0.2: 180 K -> 156.7 K, so T_t = 186.7 K.
#     dp_j scales as Dt: 32 bar -> 64 bar.
# Q8  ratio = 62e5/(1020*0.68*0.95*0.96*115*3600) = 2.37 % -> 99.4 kg
# --------------------------------------------------------------------------
