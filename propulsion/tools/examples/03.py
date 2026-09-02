"""
Module 03 — Rocket Performance: thrust, c*, Cf, Isp.

Every entry below reproduces a number that appears in
part1-foundations/03-performance.md or its key. `fn` names a function in
tools/rocket.py; `args` are its keyword arguments; `expect` is the value
printed in the text; `tol` is a RELATIVE tolerance.

Run with tools/check_examples.py (or any harness that imports EXAMPLES).

Notes on examples whose arithmetic is not a single library call:

  03.WE1  The full sizing chain (500 kN SL LOX/RP-1) is a sequence:
          c_star -> Cf -> throat_area_from_thrust -> choked-flow mdot ->
          chamber_volume_from_Lstar. Its individual steps are registered
          separately below as 03.WE1.a ... 03.WE1.f.
  03.WE2  eta_c* and eta_Cf are ratios of a measured value (p_c*A_t/mdot and
          F/(p_c*A_t), both pure arithmetic) to a library value. Only the
          library halves are registered; the measured halves are:
              c*_meas = 6.895e6 * 6.3617251e-3 / 26.2 = 1674.2 m/s
              Cf_meas = 68.0e3 / (6.895e6 * 6.3617251e-3) = 1.5502
          giving eta_c* = 0.952, eta_Cf = 0.971, eta_ov = 0.924.
  03.WE4  The published-ratio check (311/282 = 1.1028 vs Cf_vac/Cf_SL =
          1.1025) is a ratio of two registered Cf values; see 03.WE4.a/b.
  03.P21  The trade study's payload closure uses tsiolkovsky-style algebra on
          a stage mass model, not a single library function. The Cf values
          for the four options are registered as 03.P21.a ... 03.P21.d.

SI units throughout. gamma is dimensionless, R in J/(kg K), T0 in K,
p0/pa/pe in Pa, At/Ae in m^2, F in N.
"""

EXAMPLES = [
    # ---------------------------------------------------------------- theory
    # Gamma(gamma), the Vandenkerckhove function (Eq. 3.7), table in section 3.5
    {"id": "03.T1", "fn": "gamma_function", "args": {"gamma": 1.15}, "expect": 0.63864, "tol": 1e-4},
    {"id": "03.T2", "fn": "gamma_function", "args": {"gamma": 1.19}, "expect": 0.64658, "tol": 1e-4},
    {"id": "03.T3", "fn": "gamma_function", "args": {"gamma": 1.20}, "expect": 0.64853, "tol": 1e-4},
    {"id": "03.T4", "fn": "gamma_function", "args": {"gamma": 1.21}, "expect": 0.65047, "tol": 1e-4},
    {"id": "03.T5", "fn": "gamma_function", "args": {"gamma": 1.25}, "expect": 0.65806, "tol": 1e-4},
    {"id": "03.T6", "fn": "gamma_function", "args": {"gamma": 1.40}, "expect": 0.68473, "tol": 1e-4},

    # Optimum sea-level expansion ratio vs chamber pressure (section 3.9 table)
    {"id": "03.T7", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.20, "p0": 100e5, "pa": 101325.0}, "expect": 11.75, "tol": 0.01},
    {"id": "03.T8", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.20, "p0": 100e5, "pa": 26500.0}, "expect": 33.2, "tol": 0.01},
    {"id": "03.T9", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.20, "p0": 100e5, "pa": 5530.0}, "expect": 114.8, "tol": 0.01},

    # Cf vs eps map, section 3.8 (gamma = 1.20). NPR = p0/pa.
    {"id": "03.T10", "fn": "Cf", "args": {"gamma": 1.20, "eps": 8.0,
     "p0": 100 * 101325.0, "pa": 101325.0}, "expect": 1.6333, "tol": 1e-3},
    {"id": "03.T11", "fn": "Cf", "args": {"gamma": 1.20, "eps": 12.0,
     "p0": 100 * 101325.0, "pa": 101325.0}, "expect": 1.6445, "tol": 1e-3},
    {"id": "03.T12", "fn": "Cf", "args": {"gamma": 1.20, "eps": 40.0,
     "p0": 100 * 101325.0, "pa": 0.0}, "expect": 1.8843, "tol": 1e-3},

    # ------------------------------------------------- WE1: 500 kN SL kerolox
    # R = 8314.46/23.0 = 361.498 J/(kg K)
    {"id": "03.WE1.a", "fn": "R_specific", "args": {"M": 23.0}, "expect": 361.498, "tol": 1e-4},
    {"id": "03.WE1.b", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 361.498, "T0": 3600.0}, "expect": 1759.0, "tol": 1e-3},
    {"id": "03.WE1.c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 100e5, "pa": 101325.0},
     "expect": 1.6350, "tol": 1e-3},
    {"id": "03.WE1.d", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 100e5, "pa": 0.0},
     "expect": 1.7971, "tol": 1e-3},
    # At = F/(Cf p_c) with Cf = 0.98 * 1.6350 = 1.60227
    {"id": "03.WE1.e", "fn": "throat_area_from_thrust",
     "args": {"F": 500e3, "p0": 100e5, "Cf_val": 1.60227}, "expect": 0.031206, "tol": 1e-3},
    # Vc = L* At, L* = 1.1 m
    {"id": "03.WE1.f", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.1, "At": 0.031206}, "expect": 0.034327, "tol": 1e-3},
    # Isp_SL = c* Cf / g0 with c* = 0.96*1759.0 = 1688.67, Cf = 1.60227
    {"id": "03.WE1.g", "fn": "isp_from_c", "args": {"c_eff": 1688.67 * 1.60227},
     "expect": 275.9, "tol": 1e-3},
    # separation check: Schmucker p_sep at Me = 3.6044 (eps = 16, gamma = 1.20)
    {"id": "03.WE1.h", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.6044}, "expect": 32981.0, "tol": 1e-3},

    # ------------------------------------------- WE2: hot-fire data reduction
    # ideal reference: gamma 1.20, T0 3600, M 23.0 -> c*_ideal
    {"id": "03.WE2.a", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 361.498, "T0": 3600.0}, "expect": 1759.0, "tol": 1e-3},
    # ideal Cf at eps = 9, p_c = 6.895 MPa, sea level
    {"id": "03.WE2.b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 9.0, "p0": 6.895e6, "pa": 101325.0},
     "expect": 1.5966, "tol": 1e-3},
    # measured c* = 1674.2 -> eta_c* = 0.952; measured Cf = 1.5502 -> eta_Cf = 0.971

    # --------------------------------- WE3: RS-25 vacuum Isp reconstruction
    {"id": "03.WE3.a", "fn": "R_specific", "args": {"M": 13.5}, "expect": 615.886, "tol": 1e-4},
    {"id": "03.WE3.b", "fn": "c_star",
     "args": {"gamma": 1.19, "R": 615.886, "T0": 3600.0}, "expect": 2302.9, "tol": 1e-3},
    {"id": "03.WE3.c", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 69.0, "p0": 206.4e5, "pa": 0.0},
     "expect": 1.93925, "tol": 1e-3},
    {"id": "03.WE3.d", "fn": "isp_from_c", "args": {"c_eff": 2302.9 * 1.93925},
     "expect": 455.4, "tol": 1e-3},
    # contested eps = 77.5 variant -> 457.4 s
    {"id": "03.WE3.e", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 77.5, "p0": 206.4e5, "pa": 0.0},
     "expect": 1.94790, "tol": 1e-3},
    # sea-level check (overexpanded, near separation): Cf = 1.6005, Isp = 375.9 s
    {"id": "03.WE3.f", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 69.0, "p0": 206.4e5, "pa": 101325.0},
     "expect": 1.60052, "tol": 1e-3},
    {"id": "03.WE3.g", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.5535}, "expect": 27763.0, "tol": 1e-3},

    # ------------------------------- WE4: Merlin 1D Cf sea level vs vacuum
    {"id": "03.WE4.a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 9.7e6, "pa": 101325.0},
     "expect": 1.62994, "tol": 1e-3},
    {"id": "03.WE4.b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 9.7e6, "pa": 0.0},
     "expect": 1.79708, "tol": 1e-3},
    # ratio 1.1025 vs published 311/282 = 1.1028; implied c* = 282*g0/1.62994 = 1697 m/s

    # ------------------------------------------------------------- problems
    # P8: gamma 1.15, M 21.0, T0 3450
    {"id": "03.P8.a", "fn": "R_specific", "args": {"M": 21.0}, "expect": 395.927, "tol": 1e-4},
    {"id": "03.P8.b", "fn": "c_star",
     "args": {"gamma": 1.15, "R": 395.927, "T0": 3450.0}, "expect": 1830.0, "tol": 1e-3},
    {"id": "03.P8.c", "fn": "choked_mdot",
     "args": {"gamma": 1.15, "R": 395.927, "T0": 3450.0, "p0": 8.0e6, "At": 0.0113097},
     "expect": 49.44, "tol": 1e-3},

    # P9: vacuum engine, gamma 1.22, T0 3300, M 22.0, eps 60, p_c 4 MPa, F 100 kN
    {"id": "03.P9.a", "fn": "R_specific", "args": {"M": 22.0}, "expect": 377.930, "tol": 1e-4},
    {"id": "03.P9.b", "fn": "c_star",
     "args": {"gamma": 1.22, "R": 377.930, "T0": 3300.0}, "expect": 1711.8, "tol": 1e-3},
    {"id": "03.P9.c", "fn": "Cf",
     "args": {"gamma": 1.22, "eps": 60.0, "p0": 4.0e6, "pa": 0.0},
     "expect": 1.89312, "tol": 1e-3},
    {"id": "03.P9.d", "fn": "isp_from_c", "args": {"c_eff": 1711.8 * 1.89312},
     "expect": 330.5, "tol": 1e-3},
    {"id": "03.P9.e", "fn": "throat_area_from_thrust",
     "args": {"F": 100e3, "p0": 4.0e6, "Cf_val": 1.89312}, "expect": 0.0132057, "tol": 1e-3},

    # P10: c* reconstruction from published engine data (reference/_verify-liquid.md)
    # F-1 sea level: pc 70 bar, eps 16, Isp 263 s, gamma 1.21 -> c* = 1655 m/s
    {"id": "03.P10.a", "fn": "Cf",
     "args": {"gamma": 1.21, "eps": 16.0, "p0": 70e5, "pa": 101325.0},
     "expect": 1.55800, "tol": 1e-3},
    # RS-25 vacuum: pc 206.4 bar, eps 69, Isp 452.3 s, gamma 1.19 -> c* = 2287 m/s
    {"id": "03.P10.b", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 69.0, "p0": 206.4e5, "pa": 0.0},
     "expect": 1.93925, "tol": 1e-3},
    # RD-180 sea level: pc 267 bar, eps 36.87, Isp 311 s, gamma 1.20 -> c* = 1755 m/s
    {"id": "03.P10.c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 36.87, "p0": 267e5, "pa": 101325.0},
     "expect": 1.73748, "tol": 1e-3},

    # P12: eps_opt at pc 70 bar, gamma 1.21, and Cf at eps_opt vs eps = 16
    {"id": "03.P12.a", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.21, "p0": 70e5, "pa": 101325.0}, "expect": 8.7974, "tol": 1e-3},
    {"id": "03.P12.b", "fn": "Cf",
     "args": {"gamma": 1.21, "eps": 8.7974, "p0": 70e5, "pa": 101325.0},
     "expect": 1.59310, "tol": 1e-3},
    {"id": "03.P12.c", "fn": "Cf",
     "args": {"gamma": 1.21, "eps": 16.0, "p0": 70e5, "pa": 0.0},
     "expect": 1.78960, "tol": 1e-3},

    # P13: chamber volume from L* = 1.05 m and the P8 throat
    {"id": "03.P13.a", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.05, "At": 0.0113097}, "expect": 0.0118752, "tol": 1e-3},

    # P14: hot-fire reduction. ideal c* (gamma 1.20, M 22.5, T0 3500) and ideal Cf
    {"id": "03.P14.a", "fn": "R_specific", "args": {"M": 22.5}, "expect": 369.532, "tol": 1e-4},
    {"id": "03.P14.b", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 369.532, "T0": 3500.0}, "expect": 1753.6, "tol": 1e-3},
    {"id": "03.P14.c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 12.0, "p0": 5.5e6, "pa": 101325.0},
     "expect": 1.54344, "tol": 1e-3},
    {"id": "03.P14.d", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.4052}, "expect": 34427.0, "tol": 1e-3},
    # measured: c* = 1664.3 (eta 0.9491), Cf = 1.5022 (eta 0.9733), Isp = 254.9 s

    # P18: datasheet consistency check, LOX/LH2 upper stage, eps 130, pc 60 bar
    {"id": "03.P18.a", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 130.0, "p0": 60e5, "pa": 0.0},
     "expect": 1.98355, "tol": 1e-3},
    # implied c* = 462 * g0 / 1.98355 = 2284 m/s -> eta_ov ~ 0.96, consistent

    # P19: throttling a fixed eps = 25 nozzle at sea level, gamma 1.20
    {"id": "03.P19.a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 25.0, "p0": 100e5, "pa": 101325.0},
     "expect": 1.5891, "tol": 1e-3},
    {"id": "03.P19.b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 25.0, "p0": 40e5, "pa": 101325.0},
     "expect": 1.2091, "tol": 1e-3},
    {"id": "03.P19.c", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.9128}, "expect": 31022.0, "tol": 1e-3},

    # ----------------------------------------------- P21 trade study (key K3)
    # pc 55 bar, gamma 1.21, vacuum. c*_ideal = 1741.6, eta 0.96 -> 1671.9 m/s
    {"id": "03.P21.c_star", "fn": "c_star",
     "args": {"gamma": 1.21, "R": 361.498, "T0": 3550.0}, "expect": 1741.6, "tol": 1e-3},
    {"id": "03.P21.a", "fn": "Cf",
     "args": {"gamma": 1.21, "eps": 40.0, "p0": 55e5, "pa": 0.0},
     "expect": 1.87377, "tol": 1e-3},
    {"id": "03.P21.b", "fn": "Cf",
     "args": {"gamma": 1.21, "eps": 80.0, "p0": 55e5, "pa": 0.0},
     "expect": 1.92445, "tol": 1e-3},
    {"id": "03.P21.c", "fn": "Cf",
     "args": {"gamma": 1.21, "eps": 130.0, "p0": 55e5, "pa": 0.0},
     "expect": 1.95477, "tol": 1e-3},
    {"id": "03.P21.d", "fn": "Cf",
     "args": {"gamma": 1.21, "eps": 55.0, "p0": 55e5, "pa": 0.0},
     "expect": 1.89824, "tol": 1e-3},
    # Isp_vac: A 319.5 s, B 328.1 s, C/D 333.3 s
    {"id": "03.P21.isp_b", "fn": "isp_from_c", "args": {"c_eff": 1671.9 * 1.92445},
     "expect": 328.1, "tol": 1e-3},

    # --------------------------------------------------------------- quiz
    # Q3
    {"id": "03.Q3", "fn": "gamma_function", "args": {"gamma": 1.25},
     "expect": 0.65806, "tol": 1e-4},
    # Q4: pc 120 bar, eps 22, gamma 1.20
    {"id": "03.Q4.a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 22.0, "p0": 120e5, "pa": 101325.0},
     "expect": 1.64424, "tol": 1e-3},
    {"id": "03.Q4.b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 22.0, "p0": 120e5, "pa": 0.0},
     "expect": 1.83000, "tol": 1e-3},
    # Q5 measured values are pure arithmetic:
    #   c* = 9.0e6*0.0125/62.0 = 1814.5 m/s ; Cf = 208e3/(9.0e6*0.0125) = 1.84889
    #   Isp = 208e3/(62.0*g0) = 342.1 s ; eta_c* 0.9550, eta_Cf 0.9731, eta_ov 0.9293
    {"id": "03.Q5", "fn": "isp_from_c", "args": {"c_eff": 1814.516 * 1.848889},
     "expect": 342.1, "tol": 1e-3},
]
