"""
Module 12 — Feed Systems and Turbopumps.

Every entry below reproduces a number printed in
`part2-liquid/12-feed-systems.md` or its key. `fn` names a function in
`tools/rocket.py`; `args` are its keyword arguments; `expect` is the value
quoted in the text; `tol` is a *relative* tolerance.

Two reference machines
----------------------
PF-20 (fictional, WE1): pressure-fed NTO/MMH upper-stage engine.
    F_vac = 20 kN, Isp_vac = 320 s, MR = 1.65, p_c(inj) = 12 bar, t_b = 400 s.
    mdot = 6.3732 kg/s; m_ox = 1587.3 kg, m_f = 962.0 kg.
    rho_NTO = 1443, rho_MMH = 874 kg/m^3 -> V_ox = 1.1000, V_f = 1.1007,
    V = 2.2007 m^3, rho_bulk = 1158.4 kg/m^3.
    Tank budget: fuel 12 + 3.0 + 2.0 + 1.0 + 0.5 = 18.5 bar; ox 16.5 bar.
    Helium at 293 K, R_He = 8314.46/4.0026 = 2077.26 J/(kg K).

RE-500 (Module 03 reference engine as carried in Modules 06/07):
    LOX/RP-1, MR = 2.35, p_c(nozzle stagnation) = 100 bar,
    p_c(injector end) = 103 bar, mdot = 170.03 kg/s,
    mdot_ox = 119.275 kg/s, mdot_f = 50.755 kg/s,
    rho_LOX = 1140, rho_RP-1 = 810 kg/m^3, Isp_vac = 303.3 s.
    Feed budget: injector dp 20 bar; jacket dp 35 bar (fuel only);
    line+valve 5 bar; tank 3.0 bar (fuel) / 3.5 bar (LOX).
    -> fuel discharge 163 bar (dp 160 bar); LOX discharge 128 bar (dp 124.5).
    Single shaft at 20,000 rpm -> omega = 2094.395 rad/s.

Examples whose arithmetic does not map onto a rocket.py function (Euler head
and slip, Darcy/minor line losses, tank and COPV mass, the pressure-fed vs
pump-fed crossover of Eq. 3.10, the affinity-law ratios) are recorded in
comments with their inputs and expected outputs so they remain reproducible.
"""

R_HE = 2077.2647778943683      # J/(kg K), 8314.46 / 4.0026
OMEGA_20K = 2094.3951023931954  # rad/s at 20,000 rpm
Q_LOX_RE500 = 0.10462699659596753   # m^3/s
Q_RP1_RE500 = 0.06266077022295928   # m^3/s
H_LOX_RE500 = 1113.637443120632     # m
H_RP1_RE500 = 2014.254247857636     # m

EXAMPLES = [
    # ---------------- WE1: PF-20 pressure-fed tank and pressurant ----------
    # Ideal helium to displace 2.2007 m^3 at 18.5 bar, 293 K.
    {"id": "12.WE1.mHe_ideal", "fn": "pressurant_mass",
     "args": {"p_tank": 1.85e6, "V_prop": 2.2006783259766687,
              "R_g": R_HE, "T_g": 293.0},
     "expect": 6.6891, "tol": 1e-4},
    # With collapse factor 1.35 -> 9.030 kg (not a library call; see comment).
    # Bottle: (p_i/Z_i - p_f/Z_f)/(R T) = 40.117 kg/m^3 at 310/21 bar, 293 K,
    #   Z_i = 1.17, Z_f = 1.01 -> V_b = 9.030/40.117 = 0.22510 m^3 (225 L).
    # COPV mass = p_i V_b /(g0 * 1.5e4) = 47.44 kg.
    # Propellant tank mass = 2.25 * p_t V /(sigma/rho), sigma/rho = 1.408e5
    #   J/kg (Al 2219) -> 65.04 kg. Package total 121.4 kg (4.8 % of prop).
    #
    # Blowdown variant, BR = 4, isothermal: V_ullage_i = 0.73356 m^3,
    # total tank volume 2.93424 m^3, initial pressure 74 bar.
    {"id": "12.WE1.blowdown", "fn": "blowdown_pressure",
     "args": {"p_i": 7.4e6, "V_i": 0.7335594419922229,
              "V": 2.9342377679688916, "n": 1.0},
     "expect": 1.85e6, "tol": 1e-9},

    # ---------------- WE2: RE-500 pump head, power, specific speed ---------
    {"id": "12.WE2.H_fuel", "fn": "pump_head",
     "args": {"dp": 1.60e7, "rho": 810.0},
     "expect": 2014.254, "tol": 1e-5},
    {"id": "12.WE2.H_lox", "fn": "pump_head",
     "args": {"dp": 1.245e7, "rho": 1140.0},
     "expect": 1113.637, "tol": 1e-5},
    {"id": "12.WE2.P_fuel", "fn": "pump_power",
     "args": {"mdot": 50.755223880597015, "dp": 1.60e7, "rho": 810.0,
              "eta": 0.70},
     "expect": 1.43225e6, "tol": 1e-4},
    {"id": "12.WE2.P_lox", "fn": "pump_power",
     "args": {"mdot": 119.27477611940299, "dp": 1.245e7, "rho": 1140.0,
              "eta": 0.75},
     "expect": 1.73681e6, "tol": 1e-4},
    # Total 3.169 MW for 500 kN = 6.34 W/N (F-1: 6.06; Merlin: 8.88).
    {"id": "12.WE2.Ns_fuel", "fn": "specific_speed_SI",
     "args": {"omega": OMEGA_20K, "Q": Q_RP1_RE500, "H": H_RP1_RE500},
     "expect": 0.31465, "tol": 1e-4},
    {"id": "12.WE2.Ns_lox", "fn": "specific_speed_SI",
     "args": {"omega": OMEGA_20K, "Q": Q_LOX_RE500, "H": H_LOX_RE500},
     "expect": 0.63414, "tol": 1e-4},
    # Two-stage fuel pump (H/2 per stage) raises Ns by 2^0.75 to 0.5290.
    {"id": "12.WE2.Ns_fuel_2stage", "fn": "specific_speed_SI",
     "args": {"omega": OMEGA_20K, "Q": Q_RP1_RE500,
              "H": H_RP1_RE500 / 2.0},
     "expect": 0.529179, "tol": 1e-4},
    # Geometry (not library calls): psi = 0.50 ->
    #   u2_lox = sqrt(g0*1113.637/0.50) = 147.79 m/s, D2 = 141.1 mm;
    #   u2_fuel = 198.76 m/s, D2 = 189.8 mm.
    # Euler cross-check on the LOX impeller, b2 = 12 mm, beta2 = 25 deg,
    #   slip sigma = 0.85:  c_m2 = Q/(pi D2 b2) = 19.67 m/s (phi = 0.133),
    #   c_u2 = 0.85*147.79 - 19.67/tan(25) = 83.44 m/s,
    #   H_Euler = u2 c_u2/g0 = 1257.6 m -> eta_h = 1113.6/1257.6 = 0.886.
    #
    # Line losses quoted in section 3.6 (Darcy + minor, not library calls):
    #   RP-1, mdot 50.755 kg/s, D = 100 mm -> V = 7.978 m/s, Re = 3.40e5,
    #   eps/D = 1.5e-5, f = 0.01423, L = 1.2 m -> dp_friction = 0.0440 bar;
    #   sum K = 2.1 -> dp_minor = 0.541 bar. Fittings dominate friction 12:1.

    # ---------------- WE3: NPSH for the RE-500 LOX pump --------------------
    # Subcooled LOX at 90.2 K (p_v = 1.013 bar), tank 2.5 bar, line 0.35 bar,
    # 8.0 m of liquid above the inlet at 1 g0.
    {"id": "12.WE3.NPSHa", "fn": "npsh_available",
     "args": {"p_tank": 2.5e5, "p_vapor": 1.013e5, "rho": 1140.0,
              "z": 8.0, "dp_line": 0.35e5},
     "expect": 18.1703, "tol": 1e-4},
    # Self-pressurised (saturated) worst case: p_tank = p_vapor.
    {"id": "12.WE3.NPSHa_saturated", "fn": "npsh_available",
     "args": {"p_tank": 2.5e5, "p_vapor": 2.5e5, "rho": 1140.0,
              "z": 8.0, "dp_line": 0.35e5},
     "expect": 4.86929, "tol": 1e-4},
    # NPSHr from N_ss: NPSHr = (omega sqrt(Q)/N_ss)^(4/3)/g0.
    # omega sqrt(Q) = 677.455. N_ss = 2.5 -> 178.81 m; 4.0 -> 95.55 m;
    # 8.0 -> 37.920 m; 10.0 -> 28.161 m. All exceed NPSHa = 18.17 m.
    # Verified by inverting with suction_specific_speed_SI:
    {"id": "12.WE3.Nss_check_8", "fn": "suction_specific_speed_SI",
     "args": {"omega": OMEGA_20K, "Q": Q_LOX_RE500, "NPSH": 37.91985480554297},
     "expect": 8.0, "tol": 1e-6},
    {"id": "12.WE3.Nss_at_NPSHa", "fn": "suction_specific_speed_SI",
     "args": {"omega": OMEGA_20K, "Q": Q_LOX_RE500,
              "NPSH": 18.170327492595653},
     "expect": 13.89049, "tol": 1e-4},
    # Fixes: (a) omega_max = 8*(g0*18.1703)^0.75/sqrt(Q) = 1206.2 rad/s
    #        = 11,519 rpm, D2 -> 245 mm;
    #    (b) hold 20,000 rpm: p_tank = (37.920-8.0)*1140*g0 + 1.013e5
    #        + 0.35e5 = 4.708 bar;
    #    (c) boost pump at 4,000 rpm, N_ss = 8 -> NPSHr = 4.9 m.
    # TSH: LOX 0.75 m per K of local cooling; LH2 10.5 m per K.

    # ---------------- WE4: gas-generator turbine flow ----------------------
    # Pumps need 3.169 MW; +5 % parasitics -> 3.3275 MW at the turbine shaft.
    # Fuel-rich kerolox GG gas at 900 K: M = 16.0 kg/kmol, gamma = 1.25,
    # R = 519.65, cp = 2598.27 J/(kg K). Inlet 62 bar, exhaust 1.8 bar,
    # pi_t = 34.444, eta_t = 0.60 -> mdot_t = 4.6749 kg/s (2.75 % of 170.03).
    {"id": "12.WE4.turbine_power", "fn": "turbine_power",
     "args": {"mdot": 4.674875780813278, "cp": 2598.26875, "T_in": 900.0,
              "pr": 34.44444444444444, "gamma": 1.25, "eta": 0.60},
     "expect": 3.32751e6, "tol": 1e-4},
    # GG split at MR_gg = 0.35: 1.212 kg/s LOX, 3.463 kg/s RP-1.
    # Isp penalty with Isp_gg = 95 s:
    #   Isp_eff = (170.03*303.3 + 4.675*95)/174.705 = 297.73 s, loss 5.57 s.

    # ---------------- WE5: affinity scaling to 100 kN ----------------------
    # s = 0.2 at constant p_c and constant N_s. omega x 1/sqrt(0.2) = 2.2361
    # -> 44,721 rpm; D x 0.44721; u2 unchanged; P x 0.2 (0.634 MW total).
    {"id": "12.WE5.Ns_lox_scaled", "fn": "specific_speed_SI",
     "args": {"omega": 4683.209820693817, "Q": 0.2 * Q_LOX_RE500,
              "H": H_LOX_RE500},
     "expect": 0.63414, "tol": 1e-4},
    {"id": "12.WE5.Ns_fuel_scaled", "fn": "specific_speed_SI",
     "args": {"omega": 4683.209820693817, "Q": 0.2 * Q_RP1_RE500,
              "H": H_RP1_RE500},
     "expect": 0.31465, "tol": 1e-4},
    # The result that matters: omega*sqrt(Q) = 677.455 before AND after, so
    # NPSHr is identical (37.92 m at N_ss = 8) for the 500 kN and the 100 kN
    # engine. Pressurisation requirements do not scale down.
    {"id": "12.WE5.Nss_invariant", "fn": "suction_specific_speed_SI",
     "args": {"omega": 4683.209820693817, "Q": 0.2 * Q_LOX_RE500,
              "NPSH": 37.91985480554297},
     "expect": 8.0, "tol": 1e-6},
    #
    # Crossover, Eq. 3.10 (not a library call):
    #   C_p = 2.25/1.408e5 + 1.35/(R_He*293)*(1 + 4.468) = 2.810e-5 kg/J.
    #   Second term k_TP/(C_p eta_p) = 2e-5/(2.810e-5*0.70) = 1.02 s.
    #   PF-20: rho m_0/(C_p dp_t mdot) = 1158.4*25/(2.810e-5*1.55e6*6.3732)
    #        = 104.3 s -> t_crit = 105 s.
    #   Aestus-class check: C_p * 13 bar * 8.4 m^3 = 307 kg of tank and
    #        pressurisation hardware, against a turbopump of 40-60 kg.
    #   Pressure-fed RE-500 for 160 s: V = 26.77 m^3 at dp_t = 130 bar
    #        -> 9,779 kg of tankage and pressurant. Not viable.

    # ---------------- Problems (module section 10) -------------------------
    # N1: fuel 14.9 bar (p_t/p_c = 1.49); ox 13.4 bar (1.34).
    {"id": "12.N2.He_ideal", "fn": "pressurant_mass",
     "args": {"p_tank": 1.49e6, "V_prop": 3.4, "R_g": R_HE, "T_g": 300.0},
     "expect": 8.12928, "tol": 1e-4},
    {"id": "12.N2.N2_ideal", "fn": "pressurant_mass",
     "args": {"p_tank": 1.49e6, "V_prop": 3.4, "R_g": 8314.46 / 28.0134,
              "T_g": 300.0},
     "expect": 56.8952, "tol": 1e-4},
    {"id": "12.N2.He_500K", "fn": "pressurant_mass",
     "args": {"p_tank": 1.49e6, "V_prop": 3.4, "R_g": R_HE, "T_g": 500.0},
     "expect": 4.87757, "tol": 1e-4},
    # N2 answers with Z_c = 1.4: 11.38 kg He, 79.65 kg N2, 6.83 kg hot He.
    # N3: BR = 2.5, V_prop = 0.8 -> V_ullage_i = 0.53333, V_tank = 1.33333,
    #     p_i = 35 bar, F_f/F_i = 0.40.
    {"id": "12.N3.blowdown", "fn": "blowdown_pressure",
     "args": {"p_i": 3.5e6, "V_i": 0.5333333333333334,
              "V": 1.3333333333333335, "n": 1.0},
     "expect": 1.4e6, "tol": 1e-9},
    {"id": "12.N4.H", "fn": "pump_head",
     "args": {"dp": 1.688e7, "rho": 810.0},
     "expect": 2125.038, "tol": 1e-5},
    {"id": "12.N4.P", "fn": "pump_power",
     "args": {"mdot": 42.0, "dp": 1.688e7, "rho": 810.0, "eta": 0.68},
     "expect": 1.28715e6, "tol": 1e-4},
    {"id": "12.N4.Ns", "fn": "specific_speed_SI",
     "args": {"omega": 2513.2741228718346, "Q": 42.0 / 810.0,
              "H": 2125.038231489806},
     "expect": 0.329956, "tol": 1e-4},
    # N4 two-stage: Ns = 0.5549.
    # N5: psi = 0.52 -> u2 = 200.19 m/s, D2 = 159.3 mm; c_m2 = 17.27 m/s
    #     (phi = 0.0863); c_u2 = 139.69 m/s; H_Euler = 2851.5 m;
    #     eta_h = 2125.0/2851.5 = 0.745.
    {"id": "12.N6.NPSHa", "fn": "npsh_available",
     "args": {"p_tank": 3.2e5, "p_vapor": 0.74e5, "rho": 1140.0,
              "z": 4.5, "dp_line": 0.30e5, "accel": 2.0 * 9.80665},
     "expect": 28.3209, "tol": 1e-4},
    {"id": "12.N6.Nss_req", "fn": "suction_specific_speed_SI",
     "args": {"omega": 2722.713633111154, "Q": 0.085, "NPSH": 28.320938772213378},
     "expect": 11.6678, "tol": 1e-4},
    # N6: not achievable; omega_max at N_ss = 8 is 1866.8 rad/s = 17,827 rpm.
    {"id": "12.N7.turbine", "fn": "turbine_power",
     "args": {"mdot": 10.932842379490804, "cp": 2599.5582133995035,
              "T_in": 1050.0, "pr": 25.0, "gamma": 1.26, "eta": 0.58},
     "expect": 8.4e6, "tol": 1e-6},
    # N7: mdot_t = 10.93 kg/s = 3.42 % of 320 kg/s.
    # N8: s = 1/3 -> omega x 1.7321 (41,569 rpm), D x 0.5774 (92.0 mm),
    #     u2 unchanged (200.2 m/s), P x 1/3 (0.429 MW), NPSHr unchanged.
    # N9: F-1 6.06 W/N; RS-25 (HPFTP+HPOTP) 37.8 W/N; Merlin 8.88 W/N.

    # ---------------- Quiz (module section 11) -----------------------------
    # Q1: 1800 m of head -> 12.50 bar on LH2 (70.8), 201.2 bar on LOX (1140).
    {"id": "12.Q3.He_ideal", "fn": "pressurant_mass",
     "args": {"p_tank": 2.2e6, "V_prop": 5.0, "R_g": R_HE, "T_g": 320.0},
     "expect": 16.5482, "tol": 1e-4},
    # Q3: x1.45 = 23.99 kg; bottle coefficient 35.423 kg/m^3 -> V_b = 0.677 m^3.
    {"id": "12.Q5.NPSHa", "fn": "npsh_available",
     "args": {"p_tank": 2.8e5, "p_vapor": 1.05e5, "rho": 1140.0,
              "z": 3.0, "dp_line": 0.25e5, "accel": 1.4 * 9.80665},
     "expect": 17.6173, "tol": 1e-4},
    {"id": "12.Q5.Nss_req", "fn": "suction_specific_speed_SI",
     "args": {"omega": 3351.0321638291125, "Q": 0.062,
              "NPSH": 17.617318591814843},
     "expect": 17.5097, "tol": 1e-4},
    # Q5: infeasible. N_max at N_ss = 8 is 14,620 rpm; or raise the tank to
    #     6.43 bar (NPSHr = 50.06 m at 32,000 rpm and N_ss = 8).
    # Q7: s = 0.25 -> omega x2, D x0.5, u2 x1, P x0.25, NPSHr x1, p_t x1.
    # Q10: RD-170 at 170 MW / 7,250 kN = 23.4 W/N (26.5 at 192 MW) against
    #      RE-500's 6.34 W/N; ratio 3.7 from 245 vs 100 bar and ORSC vs GG.

    # ---------------- Reasoning problems -----------------------------------
    # R2: 30 kN, Isp 320 s -> mdot = 9.5598 kg/s; t_crit = 70.5 s against a
    #     900 s requirement; V = 7.430 m^3; penalty C_p*15.5 bar*V = 324 kg.
    # R3: 24 m (water) - 11 m (LH2) = 13 m of TSH credit; at 10.5 m/K this
    #     implies about 1.24 K of local temperature depression.
    # R4: omega x1.4 -> N_s 0.19 -> 0.266; NPSHr x1.4^(4/3) = x1.566;
    #     u2 unchanged at fixed head; the co-shafted LOX pump also gains 57 %
    #     NPSHr. Two-staging instead gives N_s = 0.319 at no NPSH cost.
    # R5: NPSHr ~ p_c^(4/3); 12.0/12.7 = 0.945 -> NPSHr x 0.927, a ~7 %
    #     reduction in required suction head at unchanged NPSHa.
]

if __name__ == "__main__":
    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    import rocket
    bad = 0
    for ex in EXAMPLES:
        got = getattr(rocket, ex["fn"])(**ex["args"])
        rel = abs(got - ex["expect"]) / max(abs(ex["expect"]), 1e-30)
        ok = rel <= ex["tol"]
        bad += not ok
        print(f"{'ok  ' if ok else 'FAIL'} {ex['id']:<26} {got:>16.6g} "
              f"(expect {ex['expect']:.6g}, rel {rel:.2e})")
    print(f"\n{len(EXAMPLES)} checks, {bad} failures")
    sys.exit(1 if bad else 0)
