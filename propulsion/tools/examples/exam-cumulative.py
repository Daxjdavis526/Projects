"""Problem inputs and expected outputs for the cumulative exam
(exams/exam-cumulative.md and exams/exam-cumulative-key.md).

Every engine, motor, grain, thruster, propellant and factory in the paper is
GENERIC or FICTIONAL and its coefficients are not any manufacturer's data.
Where a real article is named (Merlin 1D in 1(a), the F-1 in 1(d)/1(f)/6.3,
the P120C-class architecture in 2, MarCO-class cold gas in 3) only published,
architecture-level figures from reference/engine-database.md are used, with
their confidence tags carried across.

Problem 1 - RE-1000, fictional 1 MN LOX/RP-1 open gas-generator booster
    gamma = 1.21, M = 23.3 kg/kmol, T0 = 3600 K, pc = 100 bar (injector face),
    eps = 16.0, O/F = 2.35, eta_c* = 0.960, eta_Cf = 0.980, L* = 1.10 m,
    contraction ratio 2.00.
    Derived: R = 356.8438 J/(kg K), Gamma = 0.650466, c*_ideal = 1742.47 m/s,
    c*_del = 1672.77 m/s, At = 6.26988e-2 m^2, Dt = 0.282543 m,
    mdot = 374.820 kg/s, mdot_o = 262.933, mdot_f = 111.887 kg/s.

Problem 2 - exam propellant "S-2" (generic aluminised AP/HTPB class)
    r_ref = 7.20 mm/s at 6.00 MPa, n = 0.350, rho_p = 1770 kg/m^3,
    c* = 1560 m/s, sigma_p = 0.00200 1/K, gamma = 1.15.
    Derived: a = 3.054777e-05 m/s / Pa^0.35, 1/(1-n) = 1.538462,
    a*rho_p*c* = 84.3485, pi_K = 3.076923e-03 1/K.
    Motor: Ab = 28.30 m^2 (neutral), web 0.500 m, Dt0 = 0.340 m, eps = 11.0,
    Rc = 0.800 m, Lc = 8.00 m, mp = 25045.5 kg.

Problem 3 - AURA-9, fictional 165 kg ESPA-class spacecraft
    GN2 at 293.15 K, gamma = 1.400, M = 28.014, eps = 50, realized Isp =
    0.90 * ideal (engine-database C.1.3 discount).

Problem 4 - a described trace set for the RE-1000 of Problem 1.
Problem 5 - a fictional lunar kick-stage selection, k-model inert mass.
Problem 6 - ten short-answer items.

Entries whose arithmetic maps onto a rocket.py function are listed in
EXAMPLES; everything else is described in the comment block at the bottom.
`tol` is relative.
"""

EXAMPLES = [
    {"id": "X5.1a.R", "fn": "R_specific",
     "args": {"M": 23.3},
     "expect": 356.843776824, "tol": 1e-06},
    {"id": "X5.1a.Gamma", "fn": "gamma_function",
     "args": {"gamma": 1.21},
     "expect": 0.650465860901, "tol": 1e-06},
    {"id": "X5.1a.cstar_ideal", "fn": "c_star",
     "args": {"gamma": 1.21, "R": 356.8437768240343, "T0": 3600.0},
     "expect": 1742.47199189, "tol": 1e-06},
    {"id": "X5.1a.Cf_SL_ideal", "fn": "Cf",
     "args": {"gamma": 1.21, "eps": 16.0, "p0": 10000000.0, "pa": 101325.0},
     "expect": 1.62747509979, "tol": 1e-06},
    {"id": "X5.1a.Cf_vac_ideal", "fn": "Cf",
     "args": {"gamma": 1.21, "eps": 16.0, "p0": 10000000.0, "pa": 0.0},
     "expect": 1.78959509979, "tol": 1e-06},
    {"id": "X5.1a.At", "fn": "throat_area_from_thrust",
     "args": {"F": 1000000.0, "p0": 10000000.0, "Cf_val": 1.5949255977897852},
     "expect": 0.0626988494878, "tol": 1e-06},
    {"id": "X5.1a.c_eff", "fn": "c_eff",
     "args": {"c_star_val": 1672.7731122148866, "Cf_val": 1.5949255977897852},
     "expect": 2667.94865597, "tol": 1e-06},
    {"id": "X5.1a.Isp_SL", "fn": "isp_from_c",
     "args": {"c_eff": 2667.948655966007},
     "expect": 272.055049988, "tol": 1e-06},
    {"id": "X5.1a.mdot_ideal_choked", "fn": "choked_mdot",
     "args": {"gamma": 1.21, "R": 356.8437768240343, "T0": 3600.0, "p0": 10000000.0, "At": 0.06269884948776164},
     "expect": 359.827014607, "tol": 1e-06},
    {"id": "X5.1b.Vc", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.1, "At": 0.06269884948776164},
     "expect": 0.0689687344365, "tol": 1e-06},
    {"id": "X5.1b.t_s", "fn": "residence_time",
     "args": {"Vc": 0.06896873443653781, "rho_c": 7.784296541473798, "mdot": 374.81980688189867},
     "expect": 0.00143234981473, "tol": 1e-06},
    {"id": "X5.1b.Mc_chamber", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.21, "eps": 2.0, "supersonic": False},
     "expect": 0.311908471067, "tol": 1e-06},
    {"id": "X5.1b.v_fuel", "fn": "orifice_velocity",
     "args": {"Cd": 0.78, "rho": 810.0, "dp": 2000000.0},
     "expect": 54.8128127763, "tol": 1e-06},
    {"id": "X5.1b.v_ox", "fn": "orifice_velocity",
     "args": {"Cd": 0.8, "rho": 1140.0, "dp": 1500000.0},
     "expect": 41.0391340834, "tol": 1e-06},
    {"id": "X5.1b.mdot_fuel_orifices", "fn": "orifice_mdot",
     "args": {"Cd": 0.78, "A": 0.002520058472363087, "rho": 810.0, "dp": 2000000.0},
     "expect": 111.886509517, "tol": 1e-06},
    {"id": "X5.1c.Re", "fn": "reynolds",
     "args": {"rho": 780.0, "v": 62.997032485943414, "L": 0.0027692307692307695, "mu": 0.0004},
     "expect": 340183.975424, "tol": 1e-06},
    {"id": "X5.1c.hc", "fn": "dittus_boelter",
     "args": {"k": 0.12, "D": 0.0027692307692307695, "Re": 340183.97542409453, "Pr": 7.0, "n": 0.4},
     "expect": 57804.3113036, "tol": 1e-06},
    {"id": "X5.1c.dT_bulk", "fn": "coolant_bulk_rise",
     "args": {"Q": 25000000.0, "mdot": 111.88650951698467, "cp": 2100.0},
     "expect": 106.400333303, "tol": 1e-06},
    {"id": "X5.1d.Taw", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.21, "Mach": 1.0, "r": 0.9},
     "expect": 3565.7918552, "tol": 1e-06},
    {"id": "X5.1d.sigma_800K", "fn": "bartz_sigma",
     "args": {"gamma": 1.21, "Mach": 1.0, "Tw_over_T0": 0.2222222222222222},
     "expect": 1.36348389805, "tol": 1e-06},
    {"id": "X5.1d.hg_800K", "fn": "bartz_hg",
     "args": {"Dt": 0.2825431906403269, "mu0": 9e-05, "cp0": 1900.0, "Pr0": 0.5, "p0": 10000000.0, "c_star_val": 1672.7731122148866, "rc": 0.2119073929802452, "A_ratio": 1.0, "sigma": 1.3634838980495607},
     "expect": 22048.0779212, "tol": 1e-06},
    {"id": "X5.1d.q_800K", "fn": "heat_flux",
     "args": {"hg": 22048.077921240652, "Taw": 3565.7918552036203, "Twg": 800.0},
     "expect": 60980394.3375, "tol": 1e-06},
    {"id": "X5.1d.dT_wall_converged", "fn": "wall_dT",
     "args": {"q": 45549698.35851929, "t": 0.0009, "k": 320.0},
     "expect": 128.108526633, "tol": 1e-06},
    {"id": "X5.1d.sigma_th", "fn": "thermal_stress_hoop",
     "args": {"E": 98000000000.0, "alpha": 1.7e-05, "dT": 128.1085266333355, "nu": 0.33},
     "expect": 159275227.889, "tol": 1e-06},
    {"id": "X5.1e.H_fuel", "fn": "pump_head",
     "args": {"dp": 16600000.0, "rho": 810.0},
     "expect": 2089.78878215, "tol": 1e-06},
    {"id": "X5.1e.H_ox", "fn": "pump_head",
     "args": {"dp": 11600000.0, "rho": 1140.0},
     "expect": 1037.6059711, "tol": 1e-06},
    {"id": "X5.1e.P_fuel", "fn": "pump_power",
     "args": {"mdot": 111.88650951698467, "dp": 16600000.0, "rho": 810.0, "eta": 0.72},
     "expect": 3184698.31616, "tol": 1e-06},
    {"id": "X5.1e.P_ox", "fn": "pump_power",
     "args": {"mdot": 262.933297364914, "dp": 11600000.0, "rho": 1140.0, "eta": 0.74},
     "expect": 3615488.6788, "tol": 1e-06},
    {"id": "X5.1f.w_turbine", "fn": "turbine_power",
     "args": {"mdot": 1.0, "cp": 2050.0, "T_in": 1000.0, "pr": 24.0, "gamma": 1.22, "eta": 0.6},
     "expect": 536550.946601, "tol": 1e-06},
    {"id": "X5.2a.a_closes", "fn": "vieille_burn_rate",
     "args": {"a": 3.054777328765856e-05, "p": 6000000.0, "n": 0.35},
     "expect": 0.0072, "tol": 1e-09},
    {"id": "X5.2a.pc", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.054777328765856e-05, "n": 0.35, "rho_p": 1770.0, "Ab": 28.3, "At": 0.09079202768874504, "c_star_val": 1560.0},
     "expect": 6305465.35721, "tol": 1e-06},
    {"id": "X5.2a.r_burn", "fn": "vieille_burn_rate",
     "args": {"a": 3.054777328765856e-05, "p": 6305465.35721072, "n": 0.35},
     "expect": 0.00732623017521, "tol": 1e-06},
    {"id": "X5.2b.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 11.0, "p0": 6305465.35721072, "pa": 0.0},
     "expect": 1.78753358774, "tol": 1e-06},
    {"id": "X5.2b.Isp", "fn": "isp_from_c",
     "args": {"c_eff": 2788.5523968730968},
     "expect": 284.353208983, "tol": 1e-06},
    {"id": "X5.2b.impulse_density", "fn": "density_isp",
     "args": {"rho": 1770.0, "isp": 284.3532089829959},
     "expect": 503305.1799, "tol": 1e-06},
    {"id": "X5.2c.pi_K", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.002, "n": 0.35},
     "expect": 0.00307692307692, "tol": 1e-06},
    {"id": "X5.2c.kT_hot", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.003076923076923077, "dT": 30.0},
     "expect": 1.09670221701, "tol": 1e-06},
    {"id": "X5.2c.dv_composite", "fn": "tsiolkovsky_dv",
     "args": {"isp": 284.3532089829959, "m0": 27288.9, "mf": 2243.4},
     "expect": 6967.16317806, "tol": 0.0001},
    {"id": "X5.2c.dv_steel", "fn": "tsiolkovsky_dv",
     "args": {"isp": 284.3532089829959, "m0": 29044.5, "mf": 3999.0},
     "expect": 5529.09932539, "tol": 0.0001},
    {"id": "X5.2d.Cf_eroded", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 10.135538407749657, "p0": 5559441.99433464, "pa": 0.0},
     "expect": 1.77593293034, "tol": 0.0001},
    {"id": "X5.2e.kT_cold", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.003076923076923077, "dT": -51.0},
     "expect": 0.854769807813, "tol": 1e-06},
    {"id": "X5.3a.R", "fn": "R_specific",
     "args": {"M": 28.014},
     "expect": 296.796601699, "tol": 1e-06},
    {"id": "X5.3a.Gamma", "fn": "gamma_function",
     "args": {"gamma": 1.4},
     "expect": 0.684731456377, "tol": 1e-06},
    {"id": "X5.3a.cstar", "fn": "c_star",
     "args": {"gamma": 1.4, "R": 296.7966016991504, "T0": 293.15},
     "expect": 430.77861097, "tol": 1e-06},
    {"id": "X5.3a.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.4, "eps": 50.0, "p0": 1.0, "pa": 0.0},
     "expect": 1.72915052574, "tol": 1e-06},
    {"id": "X5.3a.Isp_ideal", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.4, "R": 296.7966016991504, "T0": 293.15, "eps": 50.0},
     "expect": 75.9567295292, "tol": 1e-06},
    {"id": "X5.3b.mp_drag", "fn": "propellant_for_dv",
     "args": {"isp": 68.36105657624981, "m_final": 165.0, "dv": 14.0},
     "expect": 3.48197120189, "tol": 1e-06},
    {"id": "X5.3c.phi_iso", "fn": "usable_fraction",
     "args": {"p_i": 25000000.0, "p_f": 2000000.0, "isothermal": True},
     "expect": 0.92, "tol": 1e-06},
    {"id": "X5.3c.mdot_thruster", "fn": "choked_mdot",
     "args": {"gamma": 1.4, "R": 296.7966016991504, "T0": 293.15, "p0": 500000.0, "At": 6.425762792590675e-08},
     "expect": 7.45831226175e-05, "tol": 1e-06},
    {"id": "X5.3c.MIB", "fn": "impulse_bit",
     "args": {"F": 0.05, "t_on": 0.005, "t_rise": 0.004, "t_fall": 0.003},
     "expect": 0.000225, "tol": 1e-06},
    {"id": "X5.3d.mp_mono_drag", "fn": "propellant_for_dv",
     "args": {"isp": 220.0, "m_final": 165.0, "dv": 14.0},
     "expect": 1.07418349805, "tol": 1e-06},
    {"id": "X5.4a.Cf_ideal_eroded", "fn": "Cf",
     "args": {"gamma": 1.21, "eps": 15.90335, "p0": 10120000.0, "pa": 101325.0},
     "expect": 1.62972855629, "tol": 0.0001},
    {"id": "X5.5a.dv_A", "fn": "tsiolkovsky_dv",
     "args": {"isp": 293.0, "m0": 950.6, "mf": 517.0},
     "expect": 1750.01428047, "tol": 0.0002},
    {"id": "X5.5a.dv_B", "fn": "tsiolkovsky_dv",
     "args": {"isp": 322.0, "m0": 1046.5, "mf": 593.7},
     "expect": 1789.91008158, "tol": 0.0002},
    {"id": "X5.5a.dv_D", "fn": "tsiolkovsky_dv",
     "args": {"isp": 365.0, "m0": 966.4, "mf": 586.1},
     "expect": 1790.02648018, "tol": 0.0002},
    {"id": "X5.5b.mp_rcs", "fn": "propellant_for_dv",
     "args": {"isp": 220.0, "m_final": 528.4615, "dv": 40.0},
     "expect": 9.88922327067, "tol": 0.0001},
    {"id": "X5.6a.Me", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.15, "eps": 11.0},
     "expect": 3.19719929419, "tol": 1e-06},
    {"id": "X5.6a.p_sep_schmucker", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.1971992941876923},
     "expect": 36122.659062, "tol": 1e-06},
]

# ---------------------------------------------------------------------------
# Arithmetic that does not map onto a single rocket.py call
# ---------------------------------------------------------------------------
#
# 1(a)  mdot = pc*At/c*_del = 374.820 kg/s; mdot_o = (r/(1+r))*mdot = 262.933,
#       mdot_f = 111.887. Ae = 16*At = 1.003182 m^2, De = 1.130173 m.
#       Isp_SL = 272.055 s, Isp_vac = 299.156 s.
#       Sanity: engine-database Merlin 1D (SL) 845 kN SL / 981 kN vac,
#       eps = 16, Isp 282 s SL / 311 s vac (med-high [B]); pc 97 bar `n.s.`
#       and **claim** (med [C]) - not to be quoted as fact.
#
# 1(b)  Lcyl = 0.80*Vc/Ac = 0.440 m; Ac = 2.00*At = 0.1253977 m^2,
#       Dc = 0.399576 m; rho_c = pc/(R T0) = 7.78430 kg/m^3.
#       Fuel orifice area 2.52014e-3 m^2 -> 1637 holes of 1.40 mm;
#       ox orifice area 5.62012e-3 m^2 -> 2209 holes of 1.80 mm.
#
# 1(c)  throat circumference pi*Dt = 0.887636 m; pitch 3.50 mm -> 253 channels;
#       per-channel flow 0.442239 kg/s; velocity 62.997 m/s;
#       Dh = 2.76923 mm; Pr = cp*mu/k = 7.000; T_b,out = 406.400 K.
#
# 1(d)  Series-resistance chain solved by iterating sigma -> hg -> q -> Twg:
#         no film, no soot : q = 45.550 MW/m^2, Twg = 1322.5 K, Twc = 1194.4 K
#         no film, soot    : q = 30.457 MW/m^2, Twg = 1019.0 K, Twc =  933.3 K
#         film,    no soot : q = 32.532 MW/m^2, Twg = 1060.7 K, Twc =  969.2 K
#         film +   soot    : q = 21.796 MW/m^2, Twg =  845.1 K, Twc =  783.3 K
#       with t = 0.900 mm, kw = 320 W/(m K), hc = 5.78043e4 W/(m^2 K),
#       Tb = 406.4 K, Rs = 3.00e-5 m^2K/W, Taw,eff(film) = 2600 K.
#       Film Isp penalty = 0.40*(0.060*mdot_f)/mdot*Isp_SL = 1.949 s.
#
# 1(e)  fuel discharge 170 bar, ox 120 bar, both inlets 4.00 bar;
#       P_pump,total = 6.7997 MW; P_turbine = P_pump/0.98 = 6.9385 MW.
#
# 1(f)  mdot_gg = P_turbine/w_t = 12.932 kg/s = 3.335 % of engine flow;
#       F_gg = 12.05 kN; Isp_engine,SL = 266.13 s; cycle penalty 5.93 s;
#       with the film, 7.88 s total.
#
# 2(a)  At = 9.07920e-2 m^2, Kn = 311.701, tb = web/r = 68.248 s,
#       Vp = 14.150 m^3, eta_V = 0.8797, mp = 25045.5 kg,
#       mdot = pc*At/c* = 366.98 kg/s = mp/tb (closure).
#
# 2(b)  F_vac = Cf*pc*At = 1023.3 kN; Itot = 6.984e7 N s;
#       impulse density 4936 N s/L (module 32 band for solids 4.8-5.0 k).
#
# 2(c)  MEOP = pc*kT*1.06*1.05*1.03 = 7.9275 MPa; pb = 1.50*MEOP = 11.891 MPa.
#       Composite netting tL = 1.5*pb*Rc/(sigma_f*Vf) = 9.327 mm, t/R = 0.01166,
#       m_case = 1.25*2*pi*Rc*tL*Lc*1580 = 740.7 kg.
#       Steel t = pb*Rc/Ftu = 6.342 mm, m_case = 2496.1 kg.
#       Inert = m_case + 0.060*mp -> 2243.4 kg / 3998.7 kg;
#       zeta = 0.9178 / 0.8623; PV/W = 26.33 km / 7.81 km.
#
# 2(d)  sdot = 0.100*(pc/6.00 MPa)^0.8 = 0.104046 mm/s;
#       X = 1 + sdot*tb/r_t0 = 1.041773 (r_t0 = 0.170 m);
#       At ratio X^2 = 1.08529; pc ratio X^(-2/(1-n)) = 0.881686 -> 5.5594 MPa;
#       F ratio X^(-2n/(1-n)) = 0.956890 -> 979.2 kN;
#       eroded eps = 10.1355, Isp 282.51 s, dIsp = -1.85 s.
#
# 2(e)  Cold soak dT = -51 K: kT = 0.854772 -> pc_pred = 5.3897 MPa;
#       a_cold = a*exp(sigma_p*dT) = 0.903030*a -> r = 6.2622 mm/s,
#       tb_pred = 79.844 s. Measured 5.95 MPa and 72.3 s.
#       Area ratio from pressure (p_meas/p_pred)^(1-n) = 1.06639 (+6.64 %);
#       from burn time (79.844/72.3)^(1-n) = 1.06664 - the two agree to 0.02 %.
#       Invariant: int pc dt = mp*c*/At = 4.3033e8 Pa s;
#       measured 5.95e6*72.3 = 4.3019e8 Pa s (-0.03 %).
#       Degeneracy: read as pure temperature, lambda = (5.95/6.3055)^(1-n)
#       = 0.96297 -> dT = ln(lambda)/sigma_p = -18.9 K, a grain at ~ +2 C.
#
# 3(a)  Gamma(1.400) = 0.684734; c* = 430.779 m/s; Cf_vac(eps=50) = 1.72918;
#       Isp_ideal = 75.957 s at 293.15 K; realized 68.361 s (c = 670.40 m/s).
#       Engine-database Part C gives 76.8 s at 300 K; 76.8*sqrt(293.15/300)
#       = 75.9 s - the whole difference is the reference temperature.
#
# 3(b)  Couple: I per desat = 2H/d = 2*0.800/0.450 = 3.5556 N s;
#       780 events -> 2773.3 N s. Drag: mp = 3.48197 kg -> 2334.3 N s.
#       Itot = 5307.6 N s; usable propellant 7.9172 kg.
#
# 3(c)  phi_iso = 0.9200 -> m_load = 8.6056 kg; V = m R T/p = 29.950 L;
#       m_tank = p V/((PV/W) g0) = 3.054 kg at PV/W = 25.0 km.
#       At_ideal = F/(p Cf) = 5.78319e-8 m^2 (Dt = 0.27136 mm);
#       At_delivered = At_ideal/0.90 = 6.42576e-8 m^2 (Dt = 0.28603 mm).
#       MIB = 0.225 mN s against a 1 mN s requirement.
#
# 3(d)  Monoprop: drag 1.0742 kg at 220 s; desat 2773.3/(140*g0) = 2.0200 kg;
#       detumble 0.1457 kg; total 3.2399 kg; V at 10 % ullage = 3.550 L.
#       System wet: cold gas 15.16 kg, monopropellant 8.64 kg.
#
# 3(e)  Leak: 0.020*8.6056 = 0.17211 kg over 43800 h = 3.930 mg/h
#       = 3.14 scc/h GN2 (rho_std = 1.2504e-3 g/cm^3).
#       Helium: molecular sqrt(28.014/4.003) = 2.6455 -> 8.31 scc/h;
#       viscous mu_N2/mu_He = 0.90816 -> 2.85 scc/h. Specify 2.85 scc/h.
#
# 4(a)  At_meas = pi/4*(0.2834)^2 = 6.30798e-2 m^2, ratio 1.00607;
#       c*_meas = pc*At/mdot = 1703.13 m/s, eta_c* = 0.9774 (design 0.960);
#       eps_eff = 15.9034; Cf_meas = 1.5790, eta_Cf = 0.9689;
#       Isp_SL = 274.23 s.
# 4(b)  core flow ratio sqrt(22.4/20.0) = 1.05830; core = 111.305 kg/s;
#       film delivered 0.581 kg/s = 0.52 % of total fuel (design 6.00 %).
# 4(c)  Q_meas = mdot_f*cp*141 K = 33.13 MW; ratio to 25.0 MW = 1.325.
#       Throat-local ratio from 1(d): 45.550/21.796 = 2.089.
#
# 5(a)  mp = (mu-1)(m_pl+m_fixed)/(1-k(mu-1)). At dv = 1750 m/s, m_pl = 450 kg:
#         A 293 s k=0.12 mfix=15: mu=1.83869 mp=433.6 mi=67.0 wet=500.7
#         B 322 s k=0.24 mfix=35: mu=1.74053 mp=436.8 mi=139.8 wet=576.6
#         C 228 s k=0.30 mfix=25: mu=2.18726 mp=876.0 mi=287.8 wet=1163.8
#         D 365 s k=0.20 mfix=60: mu=1.63054 mp=368.0 mi=133.6 wet=501.6
#       At dv = 1790 m/s (B, C, D must also cover REQ-2):
#         B wet 596.5 kg; C wet 1223.7 kg; D wet 516.3 kg.
# 5(b)  C fails REQ-4 (1100 kg) at either dv. A's RCS module:
#       mp = 9.89 kg, inert 11.46 kg, total 21.35 kg -> A wet 522.1 kg
#       (544.3 kg if the RCS is iterated into the motor's payload).
# 5(c)  Pugh totals with B as datum: S_A = +20, S_B = 0, S_D = -70.
#       Sweep of the risk weight w with the other five scaled by (100-w)/75:
#       S_A(w) = 1.06667w - 6.667, S_D(w) = -1.73333w - 26.667.
#       w = 10/20/25/30/40 -> S_A = 4.0/14.7/20.0/25.3/36.0,
#       S_D = -44.0/-61.3/-70.0/-78.7/-96.0. A/B crossover at w = 6.25,
#       outside the swept range: the ranking A > B > D survives.
#
# 6.1   Me(gamma=1.15, eps=11.0) = 3.19723; pe = pc/(1+(g-1)/2 Me^2)^(g/(g-1))
#       = 8.0332e4 Pa. Summerfield 0.4*pa = 4.0530e4 Pa;
#       Schmucker 3.6123e4 Pa. pe exceeds both -> flows full; the two
#       criteria disagree by 12.2 % in separation pressure.
# 6.5   Joukowsky dp = rho*a*dv = 1140*1100*8.00 = 100.32 bar;
#       2L/a = 8.18 ms; closure 40 ms is slow -> dp ~ 100.32*8.18/40
#       = 20.5 bar.
# 6.6   f_1T = 1.8412*c/(pi*Dc) = 1.8412*1150/(pi*0.399576) = 1686.7 Hz.
# 6.7   u_Isp/Isp = sqrt(0.30^2 + 0.25^2) = 0.3905 % -> +-1.06 s on 272.06 s.
#       (rocket.rss takes *args and cannot be called with keyword arguments,
#       so it is not registered in EXAMPLES; rocket.rss(0.30, 0.25)
#       = 0.390512.)
