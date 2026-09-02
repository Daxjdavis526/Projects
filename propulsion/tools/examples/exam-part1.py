"""
Part I exam (Modules 01-04) — every number in exams/exam-part1-key.md that is
a single call into tools/rocket.py.

`fn` names a function in tools/rocket.py; `args` are its keyword arguments;
`expect` is the value printed in the key; `tol` is a RELATIVE tolerance.

Run with tools/check_examples.py (or any harness that imports EXAMPLES).

Notes on the parts whose arithmetic is not a single library call:

  A2      Mean molar mass, mass fractions and mixture c_p are mole-fraction and
          mass-fraction sums, done by hand in the key:
              M    = sum x_i M_i                    = 20.7031 kg/kmol
              c_p  = 1000 * sum(x_i cpbar_i) / M    = 2114.0 J/(kg K)
              c_v  = c_p - R = 1712.4 ; gamma = 1.2345
          Only R, Gamma(gamma) and c* are library calls (A2.a/c/d below).
  A3.b    The incompressible estimate is p + 0.5 rho V^2 = 101.9825 bar, an
          error of -0.2127 % of p0 and -3.019 % of (p0 - p). Pure arithmetic.
  A3.c    p0,2 = p0,1 exp(-ds/R) = 102.1999 * exp(-12.0/377.93) = 99.006 bar,
          a 3.125 % loss. Pure arithmetic on R_specific (A3.a).
  B1      The derivation itself is algebra; only the numerical check at
          gamma = 1.20, M = 3.000 is registered (B1.c).
  B2.c    The separation station is the root of
              p0 / p0_over_p(g, M) = schmucker_separation(pa, M)
          solved numerically: M_sep = 3.9066, p_sep = 31.06 kPa. The area ratio
          at that Mach number is registered as B2.c1; the wall pressure there
          follows from B2.c2. Separated fraction = (45 - 26.529)/45 = 41.0 %.
  B2.d    p_a,max = p_e (1.88 Me - 1)^0.64 = 55.338 kPa is the inverse of
          schmucker_separation; the Cf at that cell pressure is B2.d1.
  C1      The reconstruction chain is:
              mdot   = F/(Isp g0)                    = 16.8385 kg/s
              c      = Isp g0                        = 4359.06 m/s
              c*_imp = c / Cf_vac                    = 2229.31 m/s
              eta_ov = c*_imp / 2330                 = 0.9568
          Only Cf_vac and the throat area are library calls (C1.b, C1.e).
          The gamma sensitivity of C1(f) is C1.f1 / C1.f2.
  C2      Delivered values apply the two efficiencies to the registered ideal
          ones:  c*_del = 0.980 * 2234.369 = 2189.681 m/s
                 Cf_del = 0.985 * 1.925909 = 1.897021
                 c      = 4153.870 m/s -> Isp = 423.58 s
  D2      The block's own rows are reproduced by:
              rho_c  = p M /(Ru T)   = 7.2318 kg/m^3   (ideal gas, by hand)
              M      = sum x_i M_i   = 21.346 kg/kmol  (by hand)
              c*     = p0/(rho* a*)  = 1824.0 m/s      (by hand from the block)
          The closed-form c* that the key compares against, the chamber sound
          speed, the exit Mach number and the three Isp conversions are library
          calls (D2.c2, D2.a1, D2.d0, D2.d1, D2.d2, D2.e).
  D3      Read off the plot; percentage changes are arithmetic:
              c*:   (2323-2382)/2382 = -2.477 %
              Isp:  (464.8-466.1)    = -1.3 s = -0.279 %
  D4      Stoichiometry is hand bookkeeping:
              n(H2O2) = 2 * 1.4875 = 2.975 kmol -> 101.192 kg
              m(HTP)  = 101.192/0.85 = 119.049 kg
              r_st    = 119.049/13.977 = 8.518 ; phi = 8.5177/8 = 1.0647

SI units throughout. gamma dimensionless, R in J/(kg K), T0 in K, p0/pa/pe in
Pa, At/Ae in m^2, F in N, c_eff in m/s.
"""

EXAMPLES = [
    # =================================================== Section A — thermo
    # A2: N2O4/MMH product mixture, M = 20.7031 kg/kmol, T0 = 3100 K
    {"id": "A2.a", "fn": "R_specific", "args": {"M": 20.7031},
     "expect": 401.6046, "tol": 1e-4},
    {"id": "A2.c", "fn": "gamma_function", "args": {"gamma": 1.2345274},
     "expect": 0.6551515, "tol": 1e-4},
    {"id": "A2.d", "fn": "c_star",
     "args": {"gamma": 1.2345274, "R": 401.6047, "T0": 3100.0},
     "expect": 1703.09, "tol": 1e-4},

    # A3: chamber station, gamma = 1.20, M = 22.0 kg/kmol, T = 3350 K, Mach 0.350
    {"id": "A3.a1", "fn": "R_specific", "args": {"M": 22.0},
     "expect": 377.930, "tol": 1e-4},
    {"id": "A3.a2", "fn": "a_sound",
     "args": {"gamma": 1.20, "R": 377.93, "T": 3350.0},
     "expect": 1232.590, "tol": 1e-4},
    {"id": "A3.a3", "fn": "T0_over_T", "args": {"gamma": 1.20, "Mach": 0.350},
     "expect": 1.01225, "tol": 1e-6},
    {"id": "A3.a4", "fn": "p0_over_p", "args": {"gamma": 1.20, "Mach": 0.350},
     "expect": 1.075788, "tol": 1e-5},

    # ============================================ Section B — compressible flow
    # B1(c): area-Mach relation evaluated at gamma = 1.20, M = 3.000
    {"id": "B1.c", "fn": "area_ratio", "args": {"gamma": 1.20, "Mach": 3.0},
     "expect": 6.73541, "tol": 1e-5},

    # B2: gamma = 1.19, M = 13.8 kg/kmol, T0 = 3500 K, p0 = 8.50 MPa, eps = 45
    {"id": "B2.a1", "fn": "R_specific", "args": {"M": 13.8},
     "expect": 602.4971, "tol": 1e-5},
    {"id": "B2.a2", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.19, "eps": 45.0}, "expect": 4.262469, "tol": 1e-5},
    {"id": "B2.a3", "fn": "p0_over_p", "args": {"gamma": 1.19, "Mach": 4.262469},
     "expect": 534.304, "tol": 1e-4},
    {"id": "B2.a4", "fn": "exit_velocity",
     "args": {"gamma": 1.19, "R": 602.4971, "T0": 3500.0, "p0": 8.5e6,
              "pe": 15908.557}, "expect": 4089.607, "tol": 1e-5},
    {"id": "B2.a5", "fn": "a_sound",
     "args": {"gamma": 1.19, "R": 602.4971, "T": 1283.9226},
     "expect": 959.4457, "tol": 1e-5},
    # B2(b): Schmucker at the exit Mach number, sea level
    {"id": "B2.b", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.262469}, "expect": 29128.67, "tol": 1e-5},
    # B2(c): separation station M_sep = 3.9066 -> area ratio and wall pressure
    {"id": "B2.c1", "fn": "area_ratio", "args": {"gamma": 1.19, "Mach": 3.9066},
     "expect": 26.5288, "tol": 1e-4},
    {"id": "B2.c2", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.9066}, "expect": 31058.9, "tol": 1e-4},
    # B2(d): Cf in vacuum and at the 55.338 kPa separation-limit cell pressure
    {"id": "B2.d0", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 45.0, "p0": 8.5e6, "pa": 0.0},
     "expect": 1.905154, "tol": 1e-5},
    {"id": "B2.d1", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 45.0, "p0": 8.5e6, "pa": 55338.419},
     "expect": 1.612186, "tol": 1e-5},

    # B3: normal shock at the exit plane, M1 = Me = 4.262469
    {"id": "B3.a1", "fn": "normal_shock_p2_p1",
     "args": {"gamma": 1.19, "M1": 4.262469}, "expect": 19.65816, "tol": 1e-5},
    {"id": "B3.a2", "fn": "normal_shock_M2",
     "args": {"gamma": 1.19, "M1": 4.262469}, "expect": 0.3558657, "tol": 1e-5},

    # ============================================== Section C — performance
    # C1: RL10A-3-3A reconstruction. pc = 475 psia = 3.2750096 MPa, eps = 61
    {"id": "C1.b1", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.17, "eps": 61.0}, "expect": 4.339045, "tol": 1e-5},
    {"id": "C1.b2", "fn": "p0_over_p", "args": {"gamma": 1.17, "Mach": 4.339045},
     "expect": 718.394, "tol": 1e-4},
    {"id": "C1.b3", "fn": "Cf",
     "args": {"gamma": 1.17, "eps": 61.0, "p0": 3275009.575, "pa": 0.0},
     "expect": 1.955341, "tol": 1e-5},
    # C1(c): c = Isp g0 = 444.5 * 9.80665 = 4359.06 m/s (arithmetic); the
    # implied c* is 4359.06/1.955341 = 2229.31 m/s, eta_ov = 0.9568.
    {"id": "C1.c", "fn": "isp_from_c", "args": {"c_eff": 4359.06},
     "expect": 444.500, "tol": 1e-5},
    # C1(e): At = F/(pc Cf_vac)
    {"id": "C1.e", "fn": "throat_area_from_thrust",
     "args": {"F": 73.4e3, "p0": 3275009.575, "Cf_val": 1.9553414},
     "expect": 0.01146201, "tol": 1e-5},
    # C1(f): the gamma sensitivity that dominates the reconstruction
    {"id": "C1.f1", "fn": "Cf",
     "args": {"gamma": 1.14, "eps": 61.0, "p0": 3275009.575, "pa": 0.0},
     "expect": 1.996689, "tol": 1e-5},
    {"id": "C1.f2", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 61.0, "p0": 3275009.575, "pa": 0.0},
     "expect": 1.917595, "tol": 1e-5},

    # C2: 45 kN upper stage, pc = 60 bar, gamma = 1.22, M = 13.5, T0 = 3450 K,
    #     eps = 100, eta_c* = 0.980, eta_Cf = 0.985, L* = 0.900 m
    {"id": "C2.a1", "fn": "R_specific", "args": {"M": 13.5},
     "expect": 615.8859, "tol": 1e-5},
    {"id": "C2.a2", "fn": "gamma_function", "args": {"gamma": 1.22},
     "expect": 0.6523864, "tol": 1e-5},
    {"id": "C2.a3", "fn": "c_star",
     "args": {"gamma": 1.22, "R": 615.8859, "T0": 3450.0},
     "expect": 2234.369, "tol": 1e-5},
    {"id": "C2.b1", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.22, "eps": 100.0}, "expect": 5.056602, "tol": 1e-5},
    {"id": "C2.b2", "fn": "Cf",
     "args": {"gamma": 1.22, "eps": 100.0, "p0": 60e5, "pa": 0.0},
     "expect": 1.925909, "tol": 1e-5},
    # C2(c): delivered c = (0.980*2234.369)*(0.985*1.925909) = 4153.870 m/s
    {"id": "C2.c1", "fn": "isp_from_c", "args": {"c_eff": 4153.870},
     "expect": 423.577, "tol": 1e-5},
    {"id": "C2.c2", "fn": "isp_from_c", "args": {"c_eff": 2234.3685 * 1.9259091},
     "expect": 438.803, "tol": 1e-5},
    # C2(e): At from the delivered Cf, and the L* chamber volume
    {"id": "C2.e", "fn": "throat_area_from_thrust",
     "args": {"F": 45e3, "p0": 60e5, "Cf_val": 1.8970205},
     "expect": 0.00395357, "tol": 1e-5},
    {"id": "C2.f", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 0.900, "At": 0.0039535682},
     "expect": 0.00355821, "tol": 1e-5},

    # ========================================= Section D — thermochemistry/CEA
    # D2: constructed CEA block, LOX/CH4, pc = 100 bar, r = 3.4, eps = 40.
    #     Chamber M = 21.346 kg/kmol, GAMMAs = 1.1420, T0 = 3550 K.
    {"id": "D2.b", "fn": "R_specific", "args": {"M": 21.346},
     "expect": 389.509, "tol": 1e-5},
    {"id": "D2.a1", "fn": "a_sound",
     "args": {"gamma": 1.142, "R": 389.5177, "T": 3550.0},
     "expect": 1256.640, "tol": 1e-4},
    # D2(c): the constant-gamma closed form, 1.20 % above the block's 1824.0
    {"id": "D2.c1", "fn": "gamma_function", "args": {"gamma": 1.142},
     "expect": 0.6370204, "tol": 1e-5},
    {"id": "D2.c2", "fn": "c_star",
     "args": {"gamma": 1.142, "R": 389.5177, "T0": 3550.0},
     "expect": 1845.969, "tol": 1e-5},
    # D2: the block's own exit station, reproduced from the chamber state
    {"id": "D2.d0", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.142, "eps": 40.0}, "expect": 3.925008, "tol": 1e-5},
    {"id": "D2.d3", "fn": "exit_velocity",
     "args": {"gamma": 1.142, "R": 389.5177, "T0": 3550.0, "p0": 100e5,
              "pe": 26239.273}, "expect": 3408.657, "tol": 1e-5},
    # D2(d): Ivac and Isp rows converted to seconds
    {"id": "D2.d1", "fn": "isp_from_c", "args": {"c_eff": 3600.1},
     "expect": 367.108, "tol": 1e-5},
    {"id": "D2.d2", "fn": "isp_from_c", "args": {"c_eff": 3408.7},
     "expect": 347.591, "tol": 1e-5},
    # D2(e): delivered Isp at pa = 40 kPa, Ivac - pa eps c*/p0 = 3308.26 m/s
    {"id": "D2.e", "fn": "isp_from_c", "args": {"c_eff": 3308.26},
     "expect": 337.349, "tol": 1e-5},
]
