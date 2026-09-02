"""
Part II exam B (Modules 12-18) — every number in exams/exam-part2b-key.md that
is a single call into tools/rocket.py.

`fn` names a function in tools/rocket.py; `args` are its keyword arguments;
`expect` is the value printed in the key; `tol` is a RELATIVE tolerance.

Run with tools/check_examples.py (or any harness that imports EXAMPLES).

SI units throughout: areas m^2, densities kg/m^3, pressures Pa, mass flow
kg/s, R in J/(kg K), T in K, head m, power W.

--------------------------------------------------------------------------
The reference engine, MB-350 (fictional LOX/LCH4 gas-generator booster)

    F_SL = 350 kN ; p_c,inj = 90.0 bar ; MR = 3.453
    mdot_o = 91.50 , mdot_f = 26.50 , mdot = 118.00 kg/s
    rho_LOX = 1141 , rho_LCH4 = 423 kg/m^3
    Isp_vac (main chamber alone) = 327.0 s
    D_c = 0.280 m , L_cyl = 0.300 m , L* = 1.15 m
    chamber gas gamma = 1.19 , M = 20.4 kg/kmol , T_c = 3500 K
    single shaft at 25 000 rpm -> omega = 2617.993878 rad/s

--------------------------------------------------------------------------
Arithmetic in the exam that does NOT map to a rocket.py function.

  A2(a)  Pressure budget, summed backwards from the injector face:
             fuel disch 137.0 bar, inlet 3.5  -> dp_f = 133.5 bar = 1.335e7 Pa
             ox   disch 112.0 bar, inlet 4.0  -> dp_o = 108.0 bar = 1.080e7 Pa
         Head ratio H_f/H_o = 3218.253/965.200 = 3.3343.

  A2(b)  Q_f = 26.50/423  = 6.264775e-2 m^3/s
         Q_o = 91.50/1141 = 8.019281e-2 m^3/s
         P_total = 1.229923 + 1.170382 = 2.400304 MW
         P/F     = 2.400304e6/3.50e5 = 6.858 W/N
         Database comparison (reference/engine-database.md):
             F-1       41 MW / 6770 kN = 6.056 W/N  (Pc CONTESTED, note A.2.2)
             Merlin 1D 7.5 MW / 845 kN = 8.876 W/N  (company figures, med conf.;
                                                     Pc 97 bar is a claim, `n.s.`)

  A2(c)  Two-stage fuel pump: H per stage = 3218.253/2 = 1609.127 m, which is
         what A2.c3 below is evaluated at. Ratio 0.4654/0.2767 = 2^(3/4) = 1.6818.

  A2(d)  NPSHa splits as 13.763 m (pressure) + 8.250 m (static, z*a/g0 with
         z = 5.50 m and a = 1.50 g0) = 22.013 m.
         NPSHr = (1/g0) (omega sqrt(Q) / N_ss)^(4/3), omega sqrt(Q_o) = 741.372:
             N_ss = 2.5 -> 201.65 m ; 4.0 -> 107.76 m ; 8.0 -> 42.764 m
         Max shaft speed holding N_ss = 8 at NPSHa = 22.013 m:
             omega_max = 8 (g0 NPSHa)^0.75 / sqrt(Q_o) = 1591.01 rad/s
                       = 15 193 rpm
         Tank pressure that would make 25 000 rpm close at N_ss = 8:
             p_t = (42.764 - 8.250) rho g0 + p_v + dp_line = 5.522 bar

  A3(b)  u_2 = sqrt(g0 H_o/psi) = sqrt(9.80665*965.2003/0.52) = 134.917 m/s
         D_2 = 2 u_2/omega = 0.1030692 m = 103.07 mm

  A3(c)  c_m2 = Q_o/(pi D_2 b_2) = 0.08019281/(pi*0.1030692*0.014) = 17.690 m/s
         phi  = 17.690/134.917 = 0.13112
         c_u2 = sigma u_2 - c_m2/tan(beta_2)
              = 0.86*134.917 - 17.690/tan(26 deg) = 116.03 - 36.27 = 79.759 m/s
         H_Euler = u_2 c_u2/g0 = 134.917*79.759/9.80665 = 1097.30 m
         eta_h   = 965.200/1097.301 = 0.87961

  B2     c_p,t = gamma R/(gamma-1) = 1.24*475.112/0.24 = 2454.7453 J/(kg K)
         22^-(0.24/1.24) = 0.549765 ; 1 - that = 0.450235
         dh_is = 2454.7453*1000*0.450235 = 1.105215e6 J/kg  (turbine_power at
                 eta = 1 and mdot = 1 reproduces it; B2.a below uses eta = 0.62)
         P_shaft = 2.400304/0.98 = 2.449290 MW
         mdot_t  = 2.449290e6/6.852332e5 = 3.574389 kg/s
         mdot_tot= 121.574389 kg/s ; f_gg = 3.574389/121.574389 = 2.9401 %
         Isp (no dump thrust)  = 327.0*118.00/121.574389 = 317.386 s (-9.614 s)
         Isp (115 s dump)      = (118*327 + 3.574389*115)/121.574389
                               = 320.767 s (-6.233 s)
         At T_t = 1200 K: mdot_t = 2.449290e6/8.222798e5 = 2.978658 kg/s,
             mdot_tot = 120.978658, f_gg = 2.4621 %, Isp = 321.780 s (+1.013 s)

  C1(a)  Q = 91.50/1141 = 8.019281e-2 m^3/s = 288.694 m^3/h = 1271.08 US gpm
         SG = 1141/999 = 1.142142 ; dp = 0.30 bar = 4.35113 psi
         Cv = 1271.08 sqrt(1.142142/4.35113)      = 651.227
         Kv = 288.694 sqrt(1.142142/0.30)         = 563.297  (Cv/Kv = 1.15610)
         CdA = 1.698e-5*651.227 = 1.105783e-2 m^2 = 110.578 cm^2
               (checked against orifice_mdot as C1.a below)
         At Cd = 0.90: A = 122.865 cm^2 -> D = 125.07 mm (> the 100 mm line)

  C1(b)  A_line = pi*0.100^2/4 = 7.853982e-3 m^2 ; v = 10.2105 m/s
         K = 3.0e4/(0.5*1141*10.2105^2) = 0.50440
         Cavitation index sigma = (4.00-1.36)/0.30 = 8.80 (> 4, no cavitation)

  C1(c)  a_free = sqrt(0.94e9/1141) = 907.656 m/s
         K_f D/(E t) = 0.94e9*0.100/(200e9*0.0025) = 0.188
         a = 907.656/sqrt(1.188) = 832.747 m/s
         2L/a = 2*5.00/832.747 = 12.008 ms

  C1(d)  dp_J = rho a dv = 1141*832.747*10.2105 = 9.70162e6 Pa = 97.016 bar
         peak line pressure 45.0 + 97.0 = 142.02 bar
         hoop = pD/(2t) = 1.4202e7*0.100/0.005 = 284.04 MPa (vs ~340 MPa yield)
         t_c for 20 bar = 2 rho L dv/dp = 2*1141*5.00*10.2105/2.00e6
                        = 58.25 ms  (> 2L/a, so Michaud is the right branch)

  C2(a)  f_1L = c/(2 L_cyl) = 1302.895/0.600 = 2171.49 Hz
         f_mn0 = alpha c/(pi D_c) = 1481.16 * alpha:
             1T (1.8412) 2727.11 ; 2T (3.0542) 4523.75 ; 1R (3.8317) 5675.36
         f_1T1L = sqrt(2727.11^2 + 2171.49^2) = 3486.04 Hz

  C2(b)  tau_c = L*/(Gamma^2 c*) = 1.15/(0.6465821^2*1847.193)
               = 1.15/772.30 = 1.48915 ms

  C2(c)  Solve omega tau + arctan(omega tau_c) = pi with tau = 0.900 ms:
             omega = 2090.66 rad/s -> f = 332.74 Hz
             omega tau_c = 3.11330 ; k_crit = sqrt(1+3.11330^2) = 3.26996
             (dp_inj/p_c)_min = 1/(2 k_crit) = 15.291 %
         Design 20 % -> k = 2.500, margin (3.26996-2.5)/3.26996 = 23.55 %
         Complex root of tau_c s + 1 + k exp(-s tau) = 0 (Newton from s = i omega):
             k = 2.500 (20 %) : s = -218.81 + 1993.46i -> 317.27 Hz,
                                t to 10 % = ln10/218.81 = 10.52 ms
             k = 3.333 (15 %) : s =  +15.74 + 2097.19i -> 333.78 Hz, GROWS,
                                doubling time ln2/15.74 = 44.04 ms

  C3(a)  dp_inj at 60 % flow = 18.0*0.60^2 = 6.48 bar ; /54.0 bar = 12.00 %
         k = 1/(2*0.12) = 4.1667 > k_crit = 3.26996 -> unstable. Chug.

  D1(b)  gradient strain = alpha dT_w/(2(1-nu)) = 18.5e-6*251.4706/1.34
                         = 3.47180e-3 = 0.34718 %, i.e. 14.47 % of the 2.40 %
                         total reported by the FE analysis.

  D1(c)  Manson-Coffin-Basquin, de_t/2 = 0.01200:
             0.01200 = (380e6/102e9)(2Nf)^-0.11 + 0.38 (2Nf)^-0.60
                     = 3.72549e-3 (2Nf)^-0.11 + 0.38 (2Nf)^-0.60
         Bisection on log(2Nf):
             2Nf = 300   -> 1.9893e-3 + 1.2403e-2 = 1.4392e-2
             2Nf = 600   -> 1.8433e-3 + 8.1826e-3 = 1.0026e-2
             2Nf = 400   -> 1.9273e-3 + 1.0436e-2 = 1.2364e-2
             2Nf = 423.5 -> 1.9153e-3 + 1.0085e-2 = 1.2000e-2  <-- root
         Nf = 211.8 cycles ; plastic term = 84.0 % of the total.

  D1(d)  Factor 4 on cycles : 211.8/4 = 52.9 allowable  <-- governs
         Factor 2 on strain : de_t/2 = 0.0240 -> 2Nf = 117.24, Nf = 58.6
         Requirement 53 cycles -> FAILS at t = 0.90 mm.
         At t = 0.80 mm, dT_w = 223.529 K and de_t = 2.40 %*223.529/251.471
             = 2.1333 %; 2Nf = 531.6, Nf = 265.8, /4 = 66.5 cycles (25 % margin).

  D2(a)  t_exp    = V/(t_l h_s v_s N_lasers)
                  = 1.900e-3/(40e-6*110e-6*1.0*4) = 1.07955e5 s = 29.987 h
         layers   = 0.480/40e-6 = 12 000 ; t_recoat = 12 000*8.0 = 9.600e4 s
                  = 26.667 h
         t_build  = 56.654 h (exposure limiting, 52.9 % of the total)
         8 lasers : t_exp = 14.994 h -> t_build = 41.660 h, only 26.5 % faster.

  D3(a)  Isp = 3.186e5/(118.00*9.80665) = 275.323 s
  D3(c)  u_o = 0.0025*91.50 = 0.22875 kg/s ; u_f = 0.0055*26.50 = 0.14575 kg/s
         u_mdot = 0.271237 kg/s -> 0.229862 % of 118.00
         variance shares: ox 71.13 %, fuel 28.87 %
  D3(d)  u_Isp = 0.4144 % -> 1.1410 s ; k = 2 -> 275.3 +/- 2.28 s
  D3(f)  (i)   ox meter 0.10 % : u_mdot = 0.145840 % -> u_Isp = 0.37439 %
         (ii)  fuel meter 0.15 %: u_mdot = 0.196761 % -> u_Isp = 0.39701 %
         (iii) tare 0.12 %      : u_F    = 0.208087 % -> u_Isp = 0.31006 %  <-- best
--------------------------------------------------------------------------
"""

EXAMPLES = [
    # ======================================== Section A — feed and turbopumps
    # A2(a) head rise from the pressure budget
    {"id": "A2.a1", "fn": "pump_head", "args": {"dp": 1.335e7, "rho": 423.0},
     "expect": 3218.2533, "tol": 1e-5},
    {"id": "A2.a2", "fn": "pump_head", "args": {"dp": 1.080e7, "rho": 1141.0},
     "expect": 965.20027, "tol": 1e-5},

    # A2(b) shaft power
    {"id": "A2.b1", "fn": "pump_power",
     "args": {"mdot": 26.50, "dp": 1.335e7, "rho": 423.0, "eta": 0.68},
     "expect": 1.22992282e6, "tol": 1e-6},
    {"id": "A2.b2", "fn": "pump_power",
     "args": {"mdot": 91.50, "dp": 1.080e7, "rho": 1141.0, "eta": 0.74},
     "expect": 1.17038160e6, "tol": 1e-6},

    # A2(c) specific speed at 25 000 rpm, and the two-stage fuel pump
    {"id": "A2.c1", "fn": "specific_speed_SI",
     "args": {"omega": 2617.993878, "Q": 0.0626477541, "H": 3218.2533},
     "expect": 0.27673603, "tol": 1e-6},
    {"id": "A2.c2", "fn": "specific_speed_SI",
     "args": {"omega": 2617.993878, "Q": 0.0801928133, "H": 965.20027},
     "expect": 0.77256098, "tol": 1e-6},
    {"id": "A2.c3", "fn": "specific_speed_SI",
     "args": {"omega": 2617.993878, "Q": 0.0626477541, "H": 1609.12665},
     "expect": 0.46541267, "tol": 1e-6},

    # A2(d) NPSH available, the autogenous worst case, and the required N_ss
    {"id": "A2.d1", "fn": "npsh_available",
     "args": {"p_tank": 3.20e5, "p_vapor": 1.36e5, "rho": 1141.0,
              "z": 5.50, "dp_line": 0.30e5, "accel": 14.709975},
     "expect": 22.013041, "tol": 1e-6},
    {"id": "A2.d2", "fn": "npsh_available",
     "args": {"p_tank": 1.36e5, "p_vapor": 1.36e5, "rho": 1141.0,
              "z": 5.50, "dp_line": 0.30e5, "accel": 14.709975},
     "expect": 5.5688881, "tol": 1e-6},
    {"id": "A2.d3", "fn": "suction_specific_speed_SI",
     "args": {"omega": 2617.993878, "Q": 0.0801928133, "NPSH": 22.013041},
     "expect": 13.163938, "tol": 1e-6},

    # ================================================ Section B — engine cycles
    # B2(a) drive-gas constant and turbine specific work (mdot = 1 kg/s)
    {"id": "B2.a1", "fn": "R_specific", "args": {"M": 17.5},
     "expect": 475.112, "tol": 1e-6},
    {"id": "B2.a2", "fn": "turbine_power",
     "args": {"mdot": 1.0, "cp": 2454.745333, "T_in": 1000.0,
              "pr": 22.0, "gamma": 1.24, "eta": 0.62},
     "expect": 6.8523321e5, "tol": 1e-6},
    # B2(d) the 1200 K variant
    {"id": "B2.d1", "fn": "turbine_power",
     "args": {"mdot": 1.0, "cp": 2454.745333, "T_in": 1200.0,
              "pr": 22.0, "gamma": 1.24, "eta": 0.62},
     "expect": 8.2227985e5, "tol": 1e-6},

    # ================== Section C — valves, plumbing, combustion instability
    # C1(a) the Cv-derived effective area, checked back through the orifice law
    {"id": "C1.a", "fn": "orifice_mdot",
     "args": {"Cd": 1.0, "A": 1.105783494e-2, "rho": 1141.0, "dp": 3.0e4},
     "expect": 91.493144, "tol": 1e-6},

    # C2(a) chamber gas constant and sound speed
    {"id": "C2.a1", "fn": "R_specific", "args": {"M": 20.4},
     "expect": 407.57157, "tol": 1e-6},
    {"id": "C2.a2", "fn": "a_sound",
     "args": {"gamma": 1.19, "R": 407.5715686, "T": 3500.0},
     "expect": 1302.8951, "tol": 1e-6},
    # C2(b) Vandenkerckhove function and ideal c*, which set tau_c
    {"id": "C2.b1", "fn": "gamma_function", "args": {"gamma": 1.19},
     "expect": 0.64658212, "tol": 1e-6},
    {"id": "C2.b2", "fn": "c_star",
     "args": {"gamma": 1.19, "R": 407.5715686, "T0": 3500.0},
     "expect": 1847.1930, "tol": 1e-6},

    # ================= Section D — materials, manufacturing, testing
    # D1(a) through-wall drop at 0.90 mm, the elastic thermal stress,
    #       and the Inconel 718 counter-example
    {"id": "D1.a1", "fn": "wall_dT",
     "args": {"q": 95e6, "t": 0.90e-3, "k": 340.0},
     "expect": 251.47059, "tol": 1e-6},
    {"id": "D1.a2", "fn": "thermal_stress_hoop",
     "args": {"E": 105e9, "alpha": 18.5e-6, "dT": 251.4705882, "nu": 0.33},
     "expect": 3.6453852e8, "tol": 1e-6},
    {"id": "D1.a3", "fn": "wall_dT",
     "args": {"q": 95e6, "t": 0.90e-3, "k": 21.0},
     "expect": 4071.4286, "tol": 1e-6},
    # D1(d) the 0.80 mm fix
    {"id": "D1.d1", "fn": "wall_dT",
     "args": {"q": 95e6, "t": 0.80e-3, "k": 340.0},
     "expect": 223.52941, "tol": 1e-6},

    # D3(e) the throat area inherits twice the diameter's relative uncertainty
    {"id": "D3.e1", "fn": "rel_unc_power",
     "args": {"rel": 0.0009, "exponent": 2.0},
     "expect": 0.0018, "tol": 1e-9},
]

# NOTE on the rest of the D3 budget. `rocket.rss` and `rocket.rel_unc_product`
# take *args, so the keyword-calling harness in tools/check_examples.py cannot
# register them. Their results are written out in the header above and are
# reproduced by:
#     rss(0.0015, 0.0030, 0.0008)            = 0.00344818793   (u_F/F)
#     rss(0.22875, 0.14575)                  = 0.2712372117    (u_mdot, kg/s)
#     rel_unc_product(0.00344819, 0.00229862)= 0.004144111     (u_Isp/Isp)
#     rss(0.0022, 0.0012)                    = 0.002505993     (u_p/p)
#     rel_unc_product(0.00250599, 0.0018, 0.00229862)
#                                            = 0.003847552     (u_c*/c*)
#     rel_unc_product(0.00344819, 0.00145840)= 0.003743918     (upgrade i)
#     rel_unc_product(0.00344819, 0.00196761)= 0.003970074     (upgrade ii)
#     rss(0.0015, 0.0012, 0.0008)            = 0.002080865     (upgrade iii u_F/F)
#     rel_unc_product(0.00208087, 0.00229862)= 0.003100589     (upgrade iii)
