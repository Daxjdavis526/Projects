"""
Part II Exam A (Modules 05-11) - every number in exams/exam-part2a-key.md that
is a single call into tools/rocket.py.

`fn` names a function in tools/rocket.py; `args` are its keyword arguments;
`expect` is the value printed in the key; `tol` is a RELATIVE tolerance.

Run with tools/check_examples.py (or any harness that imports EXAMPLES).

Reference engines used by the paper
-----------------------------------
  MX-450 (Sections B and D). LOX/LCH4, MR = 3.45, F_SL = 450 kN,
      p_c,ns = 130 bar, T_c = 3560 K, gamma = 1.16, M = 21.8 kg/kmol,
      eps = 22, eta_c* = 0.970, L* = 1.05 m, eps_c = 2.2, R_u = 1.5 R_t.
      Derived: R = 381.397 J/(kg K), Gamma = 0.640647,
      c*_ideal = 1818.84 m/s, c*_del = 1764.28 m/s, C_F,SL = 1.69507,
      A_t = 0.0204212 m^2, D_t = 161.25 mm, mdot = 150.473 kg/s,
      mdot_f = 33.814 kg/s, mdot_o = 116.659 kg/s, V_c = 21.44 L.
  UX-220 (Section C1). LOX/LCH4 upper stage, F_vac = 220 kN, Isp = 372 s,
      p_c = 90 bar, c* = 1830 m/s, L* = 1.00 m.
  Section C2 nozzle study: p_c = 85 bar, gamma = 1.20, A_t = 0.0350 m^2.

Notes on the parts whose arithmetic is not a single library call
----------------------------------------------------------------
  A2.c/d  Bulk density and density impulse are hand arithmetic:
              rho_b = (1+r) / (r/rho_ox + 1/rho_f)
              NBP:       4.60 / (3.60/1141 + 1/422) = 832.61 kg/m^3
              densified: 4.60 / (3.60/1256 + 1/439) = 894.22 kg/m^3
              I_d = rho_b * 358.92 s = 2.9884e5 and 3.2095e5 kg s/m^3
              gain = +7.400 %
  B1.d    The 3.0 % gap between t_s from L*/(Gamma^2 c*_ideal) (B1.f,
          1.4066 ms) and rho_c V_c / mdot_del (B1.g, 1.3644 ms) is exactly
          1 - eta_c*. rho_c = p_c/(R T_c) = 9.5745 kg/m^3 by hand.
  B2.b    Rayleigh stagnation ratio = p0_over_p(1.16, 0.282219) /
          (1 + 1.16 * 0.282219^2) = 1.0471258 / 1.0923923 = 0.958563,
          a 4.144 % loss, so p_c,inj = 130/0.958563 = 135.62 bar.
  B2.d    Chug: omega solves omega*tau + atan(omega*t_s) = pi numerically.
          At t_s = 1.3644 ms, tau = 0.80 ms: omega = 2342.5 rad/s,
          f = 372.8 Hz, k_crit = sqrt(1 + (omega t_s)^2) = 3.3489,
          min dp/pc = 1/(2 k_crit) = 14.930 %.
          At tau = 1.10 ms: omega = 1782.6, f = 283.7 Hz, k_crit = 2.6297,
          min dp/pc = 19.014 %.
          Loop gains: 130/(2*26) = 2.5000 (wrong station);
          135.62/(2*26) = 2.6081 (correct); margins 1.3395 and 1.2840.
          At 55 % thrust dp/pc = 0.20*0.55 = 11.0 %.
  B2/B3   Orifice areas follow from the registered velocities:
              A_f = mdot_f,el/(Cd sqrt(2 rho dp)) = 2.31085e-6 m^2, d = 1.7153 mm
              A_o = mdot_o,el/(rho_o V_o)         = 4.85420e-6 m^2, d = 2.4861 mm
          Rupe R_u = rho_o V_o^2 d_o / (rho_f V_f^2 d_f) = 7865.1/5426.7 = 1.4493.
          At equal dp and Cd this reduces exactly to
              R_u = sqrt(MR) (rho_f/rho_o)^0.25 = 1.857 * 0.7803 = 1.4493
              TMR = MR (rho_f/rho_o)^0.5        = 3.45 * 0.60887 = 2.1006  (B3.b)
          Fix (i): R_u ~ V_o^1.5, so V_o' = 1.4493^(-2/3) * 52.657 = 41.115 m/s
          and dp_o = rho V^2/(2 Cd^2) = 15.85 bar = 12.19 % of p_c.
          Fix (ii): d_o' = d_o/sqrt(2) = 1.7579 mm, R_u' = 1.4493/sqrt(2) = 1.0248.
  B4      Bench: A = pi d^2/4 = 2.31003e-6 m^2 at d = 1.715 mm;
          A sqrt(2 rho dp) = 0.145953 kg/s, so Cd = mdot/0.145953.
          B4.a and B4.b re-derive the two tabulated flows from those Cd.
          K = (p2 + dp - p_v)/dp: 2.4988 at p2 = 30 bar, 1.0988 at 2 bar.
          K_crit = (0.78/0.61)^2 = 1.635; cavitating branch Cd = 0.61 sqrt(K).
          Engine LOX circuit: K = (161.6 - 2.54)/26.0 = 6.12.
  C1      Hard-start chain, by hand from the registered R and c*:
              mdot   = 220e3/(372*9.80665)        = 60.306 kg/s
              A_t    = mdot c*/p_c                = 0.0122622 m^2, D_t = 125.0 mm
              V_c    = L* A_t                     = 12.262 L
              m_acc  = 0.10 * 60.306 * 0.180      = 1.0855 kg  (88.5 kg/m^3)
              T_v    = (gamma-1) dh_c / R         = 4122.0 K
              p_CV   = m_acc R T_v / V_c          = 144.47 MPa = 16.05 p_c
              tau_e  = L*/(Gamma^2 c*_v)          = 1.2219 ms
              factor = (tau_e/t_b)(1-exp(-t_b/tau_e)) = 0.29390 at t_b = 4 ms
              p_peak = 42.46 MPa = 4.718 p_c
              tau_d,max = 17.94 ms unvented, 61.05 ms with venting credit
  C2      Exit pressures are p_c divided by C2.c/C2.d:
              eps = 14: p_e = 8.5e6/124.1167 = 68.484 kPa, p_e/p_a = 0.6759
              eps = 24: p_e = 8.5e6/249.4337 = 34.077 kPa, p_e/p_a = 0.3363
          Thrusts F = C_F p_c A_t at A_t = 0.0350 m^2:
              SL   480.59 / 461.83 kN   (diff -18.76 kN)
              20 km 527.56 / 542.35 kN  (diff +14.79 kN)
          Break-even p_a = p_c (C2.f - C2.e)/10 = 47.735 kPa;
          altitude = (288.15/0.0065)[1 - (47735/101325)^0.190263] = 5.915 km.
          Required p_c for Summerfield at eps = 24: 40530 * 249.4337 = 101.1 bar.
  D1      Channel geometry and the resistance chain are hand arithmetic on the
          registered coefficients:
              A_ch = 8.10e-6 m^2, D_h = 2.5714 mm, pitch = 3.4107 mm,
              land = 1.6107 mm, AR = 2.5
              mdot_ch = 0.225427 kg/s, V_c = 146.48 m/s, Re = 2.7525e6,
              Pr = 1.13286
              fin: m = 632.21 1/m, eta_f = 0.34913, Phi = 1.44903,
                   h_c,eff = 1.35263e5 W/(m^2 K)
              resistances 3.4630e-5 / 2.7586e-6 / 7.3930e-6 (77.3/6.2/16.5 %)
              q'' = 73.33 MW/m^2, T_wg = 994.4 K, dT_w = 202.3 K, T_wc = 792.1 K
          The sigma of D1.b is the converged value of that iteration.
  D2      f_smooth = 0.184 Re^-0.2 = 9.4814e-3; Haaland at eps/D_h = 1.1667e-3
          gives 0.020522 (Q) and at 7.7778e-3 gives 0.034970 (P).
          dp/dx = (f/D_h)(rho V^2/2) = 75.16 / 162.67 / 277.19 bar/m;
          over 0.18 m: 13.53 / 29.28 / 49.89 bar.
          Re-solving the D1 chain at h_c enhancements of 1.9205 (P, full),
          1.4000 (P, measured) and 1.4712 (Q) gives T_wg = 841.3 / 910.4 /
          898.9 K and T_wc = 621.5 / 698.5 / 685.8 K.
  D3      Equilibrium wall temperatures solve
          0.85 sigma_SB T_w^4 = h_g (T_aw - T_w) by iteration, with sigma
          re-evaluated at the converged T_w:
              eps = 30:  h_g = 840.0,  T_w = 2147.3 K, q_rad = 1.025 MW/m^2
              eps = 60:  h_g = 443.8,  T_w = 1908.4 K, q_rad = 0.639 MW/m^2
              eps = 100: h_g = 277.9,  T_w = 1741.6 K, q_rad = 0.443 MW/m^2
          With the 0.6 Bartz correction: T_w = 1741.4 K at eps = 60 and
          1583.6 K at eps = 100.

SI units throughout. gamma dimensionless, R in J/(kg K), T in K, pressures in
Pa, areas in m^2, F in N, velocities and c* in m/s, h in W/(m^2 K),
q'' in W/m^2, stress in Pa.
"""

EXAMPLES = [
    {"id": "A2.a", "fn": "R_specific",
     "args": {"M": 21.8},
     "expect": 381.397248, "tol": 1e-05},
    {"id": "A2.b", "fn": "gamma_function",
     "args": {"gamma": 1.15},
     "expect": 0.63863825, "tol": 1e-05},
    {"id": "A2.c", "fn": "c_star",
     "args": {"gamma": 1.15, "R": 381.397248, "T0": 3565.0},
     "expect": 1825.84379, "tol": 1e-05},
    {"id": "A2.d", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.15, "eps": 35.0},
     "expect": 3.88805375, "tol": 1e-05},
    {"id": "A2.e", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 35.0, "p0": 13000000.0, "pa": 0.0},
     "expect": 1.92775437, "tol": 1e-05},
    {"id": "A2.f", "fn": "isp_from_c",
     "args": {"c_eff": 3519.7782263872796},
     "expect": 358.917492, "tol": 1e-05},
    {"id": "B1.a", "fn": "gamma_function",
     "args": {"gamma": 1.16},
     "expect": 0.640646776, "tol": 1e-05},
    {"id": "B1.b", "fn": "c_star",
     "args": {"gamma": 1.16, "R": 381.397248, "T0": 3560.0},
     "expect": 1818.84266, "tol": 1e-05},
    {"id": "B1.c", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 22.0, "p0": 13000000.0, "pa": 101325.0},
     "expect": 1.69506999, "tol": 1e-05},
    {"id": "B1.d", "fn": "throat_area_from_thrust",
     "args": {"F": 450000.0, "p0": 13000000.0, "Cf_val": 1.69507},
     "expect": 0.0204212125, "tol": 1e-05},
    {"id": "B1.e", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.05, "At": 0.020421212},
     "expect": 0.0214422726, "tol": 1e-05},
    {"id": "B1.f", "fn": "residence_time",
     "args": {"Vc": 0.021442273, "rho_c": 9.5744945, "mdot": 145.95862},
     "expect": 0.00140655567, "tol": 1e-05},
    {"id": "B1.g", "fn": "residence_time",
     "args": {"Vc": 0.021442273, "rho_c": 9.5744945, "mdot": 150.4728},
     "expect": 0.00136435904, "tol": 1e-05},
    {"id": "B2.a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.16, "eps": 2.2, "supersonic": False},
     "expect": 0.282219236, "tol": 1e-05},
    {"id": "B2.b", "fn": "p0_over_p",
     "args": {"gamma": 1.16, "Mach": 0.28221924},
     "expect": 1.04712584, "tol": 1e-05},
    {"id": "B2.c", "fn": "orifice_velocity",
     "args": {"Cd": 0.78, "rho": 423.0, "dp": 2600000.0},
     "expect": 86.4820729, "tol": 1e-05},
    {"id": "B2.d", "fn": "orifice_mdot",
     "args": {"Cd": 0.78, "A": 2.3108489e-06, "rho": 423.0, "dp": 2600000.0},
     "expect": 0.0845352823, "tol": 1e-05},
    {"id": "B3.a", "fn": "orifice_velocity",
     "args": {"Cd": 0.78, "rho": 1141.0, "dp": 2600000.0},
     "expect": 52.6566774, "tol": 1e-05},
    {"id": "B3.b", "fn": "momentum_ratio",
     "args": {"mdot_o": 0.29164673, "v_o": 52.656677, "mdot_f": 0.08453528, "v_f": 86.482073},
     "expect": 2.10061505, "tol": 1e-05},
    {"id": "B4.a", "fn": "orifice_mdot",
     "args": {"Cd": 0.7803875, "A": 2.3100327e-06, "rho": 998.0, "dp": 2000000.0},
     "expect": 0.113899993, "tol": 1e-05},
    {"id": "B4.b", "fn": "orifice_mdot",
     "args": {"Cd": 0.6399315, "A": 2.3100327e-06, "rho": 998.0, "dp": 2000000.0},
     "expect": 0.0934000013, "tol": 1e-05},
    {"id": "C1.a", "fn": "R_specific",
     "args": {"M": 21.0},
     "expect": 395.926667, "tol": 1e-05},
    {"id": "C1.b", "fn": "gamma_function",
     "args": {"gamma": 1.16},
     "expect": 0.640646776, "tol": 1e-05},
    {"id": "C1.c", "fn": "c_star",
     "args": {"gamma": 1.16, "R": 395.92667, "T0": 4121.9754},
     "expect": 1994.07474, "tol": 1e-05},
    {"id": "C2.a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.2, "eps": 14.0},
     "expect": 3.51201768, "tol": 1e-05},
    {"id": "C2.b", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.2, "eps": 24.0},
     "expect": 3.88452438, "tol": 1e-05},
    {"id": "C2.c", "fn": "p0_over_p",
     "args": {"gamma": 1.2, "Mach": 3.5120177},
     "expect": 124.116745, "tol": 1e-05},
    {"id": "C2.d", "fn": "p0_over_p",
     "args": {"gamma": 1.2, "Mach": 3.8845244},
     "expect": 249.433704, "tol": 1e-05},
    {"id": "C2.e", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 14.0, "p0": 8500000.0, "pa": 0.0},
     "expect": 1.78231965, "tol": 1e-05},
    {"id": "C2.f", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 24.0, "p0": 8500000.0, "pa": 0.0},
     "expect": 1.83847837, "tol": 1e-05},
    {"id": "C2.g", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 14.0, "p0": 8500000.0, "pa": 101325.0},
     "expect": 1.61543142, "tol": 1e-05},
    {"id": "C2.h", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 24.0, "p0": 8500000.0, "pa": 101325.0},
     "expect": 1.55238425, "tol": 1e-05},
    {"id": "C2.i", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.5120177},
     "expect": 33631.6048, "tol": 1e-05},
    {"id": "C2.j", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.8845244},
     "expect": 31189.649, "tol": 1e-05},
    {"id": "C2.k", "fn": "summerfield_separation_pressure",
     "args": {"p0": 101325.0, "frac": 0.4},
     "expect": 40530, "tol": 1e-05},
    {"id": "C2.l", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 14.0, "p0": 8500000.0, "pa": 5474.9},
     "expect": 1.77330217, "tol": 1e-05},
    {"id": "C2.m", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 24.0, "p0": 8500000.0, "pa": 5474.9},
     "expect": 1.82301983, "tol": 1e-05},
    {"id": "D1.a", "fn": "adiabatic_wall_T",
     "args": {"T0": 3560.0, "gamma": 1.16, "Mach": 1.0, "r": 0.9},
     "expect": 3533.62963, "tol": 1e-05},
    {"id": "D1.b", "fn": "bartz_sigma",
     "args": {"gamma": 1.16, "Mach": 1.0, "Tw_over_T0": 0.2793202247191011},
     "expect": 1.3268746, "tol": 1e-05},
    {"id": "D1.c", "fn": "bartz_hg",
     "args": {"Dt": 0.16124855, "mu0": 7.4722251e-05, "cp0": 2765.13, "Pr0": 0.85294118, "p0": 13000000.0, "c_star_val": 1764.2774, "rc": 0.12093641249999999, "A_ratio": 1.0, "sigma": 1.3268746},
     "expect": 28877.0761, "tol": 1e-05},
    {"id": "D1.d", "fn": "dittus_boelter",
     "args": {"k": 0.07, "D": 0.0025714286, "Re": 2752471.6, "Pr": 1.1328571, "n": 0.4},
     "expect": 93346.8647, "tol": 1e-05},
    {"id": "D1.e", "fn": "heat_flux",
     "args": {"hg": 28877.07, "Taw": 3533.6296, "Twg": 994.38},
     "expect": 73326088.4, "tol": 1e-05},
    {"id": "D1.f", "fn": "wall_dT",
     "args": {"q": 73326094.0, "t": 0.0008, "k": 290.0},
     "expect": 202.27888, "tol": 1e-05},
    {"id": "D1.g", "fn": "thermal_stress_hoop",
     "args": {"E": 110000000000.0, "alpha": 1.7e-05, "dT": 202.2786, "nu": 0.33},
     "expect": 282284315, "tol": 1e-05},
    {"id": "D2.a", "fn": "dittus_boelter",
     "args": {"k": 0.07, "D": 0.0025714286, "Re": 2752471.6, "Pr": 1.1328571, "n": 0.4},
     "expect": 93346.8647, "tol": 1e-05},
    {"id": "D3.a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.16, "eps": 30.0},
     "expect": 3.8441428, "tol": 1e-05},
    {"id": "D3.b", "fn": "adiabatic_wall_T",
     "args": {"T0": 3560.0, "gamma": 1.16, "Mach": 3.8441428, "r": 0.9},
     "expect": 3367.13851, "tol": 1e-05},
    {"id": "D3.c", "fn": "bartz_sigma",
     "args": {"gamma": 1.16, "Mach": 3.8441428, "Tw_over_T0": 0.6031741573033709},
     "expect": 0.824100007, "tol": 1e-05},
    {"id": "D3.d", "fn": "bartz_hg",
     "args": {"Dt": 0.16124855, "mu0": 7.4722251e-05, "cp0": 2765.13, "Pr0": 0.85294118, "p0": 13000000.0, "c_star_val": 1764.2774, "rc": 0.12093641249999999, "A_ratio": 30.0, "sigma": 0.8241},
     "expect": 840.028695, "tol": 1e-05},
    {"id": "D3.e", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.16, "eps": 60.0},
     "expect": 4.26580334, "tol": 1e-05},
    {"id": "D3.f", "fn": "adiabatic_wall_T",
     "args": {"T0": 3560.0, "gamma": 1.16, "Mach": 4.2658033, "r": 0.9},
     "expect": 3348.96494, "tol": 1e-05},
    {"id": "D3.g", "fn": "bartz_hg",
     "args": {"Dt": 0.16124855, "mu0": 7.4722251e-05, "cp0": 2765.13, "Pr0": 0.85294118, "p0": 13000000.0, "c_star_val": 1764.2774, "rc": 0.12093641249999999, "A_ratio": 60.0, "sigma": 0.8124517},
     "expect": 443.79741, "tol": 1e-05},
    {"id": "D3.h", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.16, "eps": 100.0},
     "expect": 4.57806577, "tol": 1e-05},
    {"id": "D3.i", "fn": "adiabatic_wall_T",
     "args": {"T0": 3560.0, "gamma": 1.16, "Mach": 4.578065769607926, "r": 0.9},
     "expect": 3336.99984, "tol": 1e-05},
    {"id": "D3.j", "fn": "bartz_hg",
     "args": {"Dt": 0.16124855, "mu0": 7.4722251e-05, "cp0": 2765.13, "Pr0": 0.85294118, "p0": 13000000.0, "c_star_val": 1764.2774, "rc": 0.12093641249999999, "A_ratio": 100.0, "sigma": 0.8057485},
     "expect": 277.921946, "tol": 1e-05},
]
