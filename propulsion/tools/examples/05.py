"""
Module 05 — Propellants: registered worked examples and problem answers.

Every entry maps a number printed in `part2-liquid/05-propellants.md` or its
key onto a call into `tools/rocket.py`, so the text can be re-verified:

    EXAMPLES = [{"id", "fn", "args", "expect", "tol"}, ...]

`tol` is relative. Entries whose arithmetic does not map onto a library
function are described in comments rather than registered.

Property values used as inputs come from [NIST-WB] (cryogens) or from the
handbook/specification table in module section 4.1; chamber states in the
section 4.3 performance table are representative CEA-level values, not CEA
output, and are tagged [A] in the text.
"""

RU = 8314.46  # J/(kmol K)

EXAMPLES = [
    # ---------------------------------------------------------------
    # Section 4.3 — pair performance on a common basis
    # p_c = 7 MPa, eps = 40, vacuum, ideal 1-D constant-gamma.
    # R = RU / M is precomputed for each pair.
    # ---------------------------------------------------------------
    {"id": "05.T43.LOX_LH2.cstar", "fn": "c_star",
     "args": {"gamma": 1.19, "R": 615.88593, "T0": 3550.0},
     "expect": 2286.9, "tol": 0.002},
    {"id": "05.T43.LOX_LH2.Cf", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 40.0, "p0": 7.0e6, "pa": 0.0},
     "expect": 1.895, "tol": 0.005},
    # Isp_vac = c* Cf / g0 = 2286.9 * 1.895 / 9.80665 = 441.9 s

    {"id": "05.T43.LOX_RP1.cstar", "fn": "c_star",
     "args": {"gamma": 1.15, "R": 356.84378, "T0": 3670.0},
     "expect": 1791.9, "tol": 0.002},
    {"id": "05.T43.LOX_RP1.Cf", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 40.0, "p0": 7.0e6, "pa": 0.0},
     "expect": 1.942, "tol": 0.005},
    # Isp_vac = 1791.9 * 1.942 / 9.80665 = 354.8 s

    {"id": "05.T43.LOX_CH4.cstar", "fn": "c_star",
     "args": {"gamma": 1.16, "R": 386.71907, "T0": 3560.0},
     "expect": 1831.5, "tol": 0.002},
    {"id": "05.T43.LOX_CH4.Cf", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 40.0, "p0": 7.0e6, "pa": 0.0},
     "expect": 1.929, "tol": 0.005},
    # Isp_vac = 1831.5 * 1.929 / 9.80665 = 360.3 s

    {"id": "05.T43.N2O4_MMH.cstar", "fn": "c_star",
     "args": {"gamma": 1.17, "R": 369.53156, "T0": 3400.0},
     "expect": 1744.2, "tol": 0.002},
    {"id": "05.T43.N2O4_MMH.Cf", "fn": "Cf",
     "args": {"gamma": 1.17, "eps": 40.0, "p0": 7.0e6, "pa": 0.0},
     "expect": 1.918, "tol": 0.005},
    # Isp_vac = 1744.2 * 1.918 / 9.80665 = 341.1 s

    # ---------------------------------------------------------------
    # WE1 — tank volume and stage mass for equal dv (4500 m/s)
    # Payload 5000 kg, fixed hardware 1200 kg, 3 % ullage,
    # k_v = 18 kg/m^3 (LH2 stage) or 12 kg/m^3 (RP-1, CH4 stages).
    # The iteration itself is not a library function; the converged
    # burnout masses below are its output, and each propellant mass
    # is re-derivable from them.
    #
    #   rho_b (Eq. 3.2) is arithmetic, not a library call:
    #     LOX/LH2  (1+6.00)/(6.00/1141.3 + 1/70.9) = 361.5 kg/m^3
    #     LOX/RP-1 (1+2.65)/(2.65/1141.3 + 1/810 ) = 1026.3 kg/m^3
    #     LOX/CH4  (1+3.45)/(3.45/1141.3 + 1/422 ) =  825.2 kg/m^3
    # ---------------------------------------------------------------
    {"id": "05.WE1.LH2.mprop", "fn": "propellant_for_dv",
     "args": {"isp": 441.9, "m_final": 6840.0, "dv": 4500.0},
     "expect": 12481.0, "tol": 0.002},
    {"id": "05.WE1.LH2.dv_check", "fn": "tsiolkovsky_dv",
     "args": {"isp": 441.9, "m0": 19321.0, "mf": 6840.0},
     "expect": 4500.0, "tol": 0.002},
    {"id": "05.WE1.RP1.mprop", "fn": "propellant_for_dv",
     "args": {"isp": 354.8, "m_final": 6404.0, "dv": 4500.0},
     "expect": 16938.0, "tol": 0.002},
    {"id": "05.WE1.CH4.mprop", "fn": "propellant_for_dv",
     "args": {"isp": 360.3, "m_final": 6449.0, "dv": 4500.0},
     "expect": 16596.0, "tol": 0.002},

    # Density impulse of each combination (section 4.3 column)
    {"id": "05.WE1.LH2.density_isp", "fn": "density_isp",
     "args": {"rho": 361.5, "isp": 441.9}, "expect": 159747.0, "tol": 0.002},
    {"id": "05.WE1.RP1.density_isp", "fn": "density_isp",
     "args": {"rho": 1026.3, "isp": 354.8}, "expect": 364131.0, "tol": 0.002},
    {"id": "05.WE1.CH4.density_isp", "fn": "density_isp",
     "args": {"rho": 825.2, "isp": 360.3}, "expect": 297320.0, "tol": 0.002},

    # ---------------------------------------------------------------
    # WE2 — coking-limit check, RP-1 channel
    # 1.5 x 4.0 mm channel: A = 6.00e-6 m^2, Dh = 2.1818e-3 m,
    # mdot = 0.15 kg/s -> G = 25000 kg/(m^2 s), v = 34.72 m/s.
    # RP-1 at 400 K: rho 720, cp 2400, k 0.11, mu 3.5e-4.
    # Pr = cp mu / k = 7.636.
    # T_wc = T_b + q''/h = 400 + 25e6/37291 = 1070 K  (limit ~700 K)
    # ---------------------------------------------------------------
    {"id": "05.WE2.Re", "fn": "reynolds",
     "args": {"rho": 720.0, "v": 34.7222, "L": 2.18182e-3, "mu": 3.5e-4},
     "expect": 155844.0, "tol": 0.002},
    {"id": "05.WE2.h", "fn": "dittus_boelter",
     "args": {"k": 0.11, "D": 2.18182e-3, "Re": 155844.0, "Pr": 7.636, "n": 0.4},
     "expect": 37291.0, "tol": 0.005},
    # metal temperature drop through a 0.9 mm copper-alloy wall at 25 MW/m^2
    {"id": "05.WE2.wall_dT", "fn": "wall_dT",
     "args": {"q": 25.0e6, "t": 0.9e-3, "k": 310.0},
     "expect": 72.6, "tol": 0.005},
    # Higher-flow variants quoted in the WE2 table:
    {"id": "05.WE2.h_at_0p35", "fn": "dittus_boelter",
     "args": {"k": 0.11, "D": 2.18182e-3, "Re": 363636.0, "Pr": 7.636, "n": 0.4},
     "expect": 73450.0, "tol": 0.005},

    # ---------------------------------------------------------------
    # WE3 — LH2 boil-off.  Not a library function:
    #   mdot_bo = Qdot / h_fg = 240 W / 448960 J/kg = 5.35e-4 kg/s
    #           = 46.2 kg/day; load = 70.9 * 100 = 7090 kg -> 0.65 %/day
    #   LOX  : 240/213100  = 1.13e-3 kg/s = 97.3 kg/day of 114130 kg (0.085 %/day)
    #   LCH4 : 240/510400  = 4.70e-4 kg/s = 40.6 kg/day of  42199 kg (0.096 %/day)
    # Latent heats are (h_g - h_f) at NBP from [NIST-WB].
    # ---------------------------------------------------------------

    # ---------------------------------------------------------------
    # Problem answers that map onto the library
    # ---------------------------------------------------------------
    # N1: rho_b at r = 5.0 is 324.6, at r = 6.5 is 378.8 kg/m^3 (Eq. 3.2)
    {"id": "05.N1.Id_r5", "fn": "density_isp",
     "args": {"rho": 324.6, "isp": 445.0}, "expect": 144447.0, "tol": 0.002},
    {"id": "05.N1.Id_r65", "fn": "density_isp",
     "args": {"rho": 378.8, "isp": 439.0}, "expect": 166293.0, "tol": 0.002},

    # N2: T0 = 3400 K, M = 22.5, gamma = 1.17
    {"id": "05.N2.cstar", "fn": "c_star",
     "args": {"gamma": 1.17, "R": 369.53156, "T0": 3400.0},
     "expect": 1744.2, "tol": 0.002},
    {"id": "05.N2.Cf_eps40", "fn": "Cf",
     "args": {"gamma": 1.17, "eps": 40.0, "p0": 7.0e6, "pa": 0.0},
     "expect": 1.918, "tol": 0.005},
    {"id": "05.N2.Cf_eps100", "fn": "Cf",
     "args": {"gamma": 1.17, "eps": 100.0, "p0": 7.0e6, "pa": 0.0},
     "expect": 1.995, "tol": 0.01},
    # Isp = 341.1 s at eps = 40; 354.8 s at eps = 100.

    # N3: WE1 repeated at dv = 3000 m/s (converged burnout masses shown)
    {"id": "05.N3.LH2.mprop", "fn": "propellant_for_dv",
     "args": {"isp": 441.9, "m_final": 6535.0, "dv": 3000.0},
     "expect": 6523.0, "tol": 0.003},
    {"id": "05.N3.RP1.mprop", "fn": "propellant_for_dv",
     "args": {"isp": 354.8, "m_final": 6304.0, "dv": 3000.0},
     "expect": 8626.0, "tol": 0.003},
    {"id": "05.N3.CH4.mprop", "fn": "propellant_for_dv",
     "args": {"isp": 360.3, "m_final": 6327.0, "dv": 3000.0},
     "expect": 8462.0, "tol": 0.003},

    # N4: methane channel 1.2 x 3.5 mm, A = 4.20e-6 m^2, Dh = 1.7872e-3 m,
    # mdot = 0.08 kg/s -> G = 19048 kg/(m^2 s), v = 90.7 m/s,
    # Re = 1.1348e6, Pr = 1.44, T_wc = 250 + 30e6/77940 = 635 K (limit ~1050 K)
    {"id": "05.N4.h", "fn": "dittus_boelter",
     "args": {"k": 0.075, "D": 1.78723e-3, "Re": 1134752.0, "Pr": 1.44, "n": 0.4},
     "expect": 77940.0, "tol": 0.01},

    # N5: max heat flux for 5 % loss of 17725 kg of LH2 over 14 days.
    #   mdot = 886.25 / 1.2096e6 = 7.327e-4 kg/s
    #   Qdot = 7.327e-4 * 448960 = 329 W over 260 m^2 -> 1.27 W/m^2
    # (arithmetic only, no library call)

    # N6: NPSH available, saturated and subcooled LOX
    {"id": "05.N6.npsh_sat", "fn": "npsh_available",
     "args": {"p_tank": 350000.0, "p_vapor": 101000.0, "rho": 1141.3,
              "z": 4.0, "dp_line": 40000.0, "accel": 29.42},
     "expect": 30.67, "tol": 0.01},
    {"id": "05.N6.npsh_subcooled", "fn": "npsh_available",
     "args": {"p_tank": 350000.0, "p_vapor": 30000.0, "rho": 1190.0,
              "z": 4.0, "dp_line": 40000.0, "accel": 29.42},
     "expect": 35.99, "tol": 0.01},

    # N7: methane saturation temperatures by interpolation of the section 4.2
    # table: T(0.8 MPa) = 144.0 K, T(0.6 MPa) = 138.5 K; sensible heat from
    # NBP to 138.5 K is cp dT = 3.48 * 26.8 = 93 kJ/kg (arithmetic only).

    # N8: storable tank sizing, r = 1.65, 12000 kg total.
    #   m_ox = 7472 kg -> 5.177 m^3 at 1443 kg/m^3; tank 5.384 m^3 at 4 % ullage
    #   m_f  = 4528 kg -> 5.175 m^3 at  875 kg/m^3; tank 5.382 m^3
    #   cold soak to 268 K: dV/V = -2.75 %, ullage grows to 6.5 %
    #   N2O4 freezes at 261.9 K -> only 6.1 K of margin (arithmetic only).

    # ---------------------------------------------------------------
    # Quiz items
    # ---------------------------------------------------------------
    {"id": "05.Q3.cstar", "fn": "c_star",
     "args": {"gamma": 1.16, "R": 386.71907, "T0": 3560.0},
     "expect": 1831.5, "tol": 0.002},
    # Q4: CH4 p_sat(149.9 K) = 1.036 MPa > 1.0 MPa relief setting -> valve
    #     lifts; T_sat(1.0 MPa) = 149.0 K, so the margin is -1 K (table lookup).
    {"id": "05.Q6.h", "fn": "dittus_boelter",
     "args": {"k": 0.11, "D": 2.0e-3, "Re": 207792.0, "Pr": 7.636, "n": 0.4},
     "expect": 51208.0, "tol": 0.01},
    # Q6: T_wc = 420 + 18e6/51208 = 772 K -> fails a 700 K limit.
    # Q9: mdot = 300 / 213000 = 1.408e-3 kg/s = 121.7 kg/day of a
    #     1141.3 * 40 = 45652 kg load -> 0.267 %/day (arithmetic only).
]
