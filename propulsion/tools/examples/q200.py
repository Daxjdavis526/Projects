"""
Part VI — 200 interview questions (part6-interview/200-questions.md) and their
model answers (200-questions-key.md).

Every entry below reproduces a number printed in the answer key. `fn` names a
function in tools/rocket.py; `args` are its keyword arguments; `expect` is the
value quoted in the key; `tol` is a RELATIVE tolerance.

Run with tools/check_examples.py (or any harness that imports EXAMPLES).

IDs are `Q<question number>` with a letter suffix where one question needs
several library calls.

Notes on answers whose arithmetic is NOT a single library call, and is
therefore done longhand in the key rather than registered here:

  Q56   eta_c* and eta_Cf are ratios of measured values (p_c A_t / mdot and
        F/(p_c A_t), both pure arithmetic) to stated ideal values:
            c*_meas = 5.5e6 * 0.0080 / 26.0 = 1692.3 m/s  -> eta_c* = 0.964
            Cf_meas = 65.0e3 / (5.5e6 * 0.0080) = 1.4773  -> eta_Cf = 0.972
            Isp_meas = 1692.3 * 1.4773 / g0 = 254.9 s
  Q91   Ab = pi D L = pi * 1.6 * 25.0 = 125.66 m^2; Kn = Ab/At = 202.7.
        Pure geometry.
  Q92   Thin-wall hoop: t = p r SF / sigma = 7.0e6 * 1.5 * 1.5 / 1400e6
        = 11.25 mm.
  Q96   Pressure response to throat growth: p2/p1 = (At1/At2)^(1/(1-n))
        = (1/1.06)^(1/0.65) = 0.9143 -> 6.2 MPa becomes 5.67 MPa.
  Q103  m = It/(Isp g0) = 755/(40*9.80665) = 1.925 kg; V = m/rho = 1415 cm^3.
  Q128  Bartz A-ratio scaling only: (1/2.5)^0.9 = 0.438, (1/10)^0.9 = 0.126.
  Q136  Mass-weighted Isp = 0.968*340 + 0.032*130 = 333.3 s; penalty 6.7 s.
  Q141  Chamber acoustic modes f = alpha_mn a /(pi D) with alpha_1T = 1.8412,
        alpha_1R = 3.8317, alpha_2T = 3.0542: 2407 / 5009 / 3993 Hz. The mode
        constants are not in rocket.py.
  Q151  tb = web/r = 0.42/0.0095 = 44.2 s; propellant mass ~ Ab_avg * web * rho.
  Q153  Shell volume pi D L t = pi*3.4*13.5*0.012 = 1.730 m^3 -> 2,734 kg.
  Q155  Throat radius 0.20 -> 0.2144 m; At ratio 1.149; p2/p1 = 0.807.
  Q163  m_prop = It/(Isp g0) for three Isp values: 14.57 / 3.64 / 4.64 kg.
  Q168  Multiplicative vs additive loss stack on 366 s: 349.1 s vs 348.8 s.
  Q179  m = pV/(RT) = 6.0e6*6.0/(320*3300) = 34.1 kg; tau = V/(c* At) = 6.24 ms.
  Q184  Cd degradation scaling 1 - k/sqrt(Re) at Re = 3,868.
  Q186  Impulse density rho * Isp * g0 per cm^3.
  Q85   rocket.rss() takes positional arguments, which the EXAMPLES harness
        cannot express, so the two uncertainty answers are checked by hand:
            rss(0.005, 0.008, 0.012) = 0.015264  (Q85)
            rss(0.015, 0.020, 0.003) = 0.025179  (Q193)

SI units throughout. gamma dimensionless, R in J/(kg K), T0 in K, pressures in
Pa, areas in m^2, thrust in N, mass flow in kg/s.
"""

EXAMPLES = [
    # ------------------------------------------------------------- Beginner
    # Q41 - gas properties and c* for gamma=1.20, M=22.0 kg/kmol, T0=3400 K
    {"id": "Q41.a", "fn": "R_specific", "args": {"M": 22.0}, "expect": 377.930, "tol": 1e-4},
    {"id": "Q41.b", "fn": "gamma_function", "args": {"gamma": 1.20}, "expect": 0.648531, "tol": 1e-4},
    {"id": "Q41.c", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 377.930, "T0": 3400.0}, "expect": 1747.89, "tol": 1e-4},
    # Q42 - choked mdot, At = pi/4 * 0.100^2 = 7.853982e-3 m^2
    {"id": "Q42", "fn": "choked_mdot",
     "args": {"gamma": 1.20, "R": 377.930, "T0": 3400.0, "p0": 6.0e6, "At": 7.853982e-3},
     "expect": 26.9604, "tol": 1e-4},
    # Q43 - throat sizing
    {"id": "Q43", "fn": "throat_area_from_thrust",
     "args": {"F": 250e3, "p0": 10e6, "Cf_val": 1.80}, "expect": 0.0138889, "tol": 1e-4},
    # Q44 - c and Isp
    {"id": "Q44.a", "fn": "c_eff", "args": {"c_star_val": 1780.0, "Cf_val": 1.72},
     "expect": 3061.6, "tol": 1e-4},
    {"id": "Q44.b", "fn": "isp_from_c", "args": {"c_eff": 3061.6}, "expect": 312.196, "tol": 1e-4},
    # Q45 - exit Mach and pressure ratio at eps = 40, gamma = 1.22
    {"id": "Q45.a", "fn": "mach_from_area_ratio", "args": {"gamma": 1.22, "eps": 40.0},
     "expect": 4.35554, "tol": 1e-4},
    {"id": "Q45.b", "fn": "p0_over_p", "args": {"gamma": 1.22, "Mach": 4.35554},
     "expect": 518.238, "tol": 1e-3},
    # Q46 - ideal delta-v
    {"id": "Q46", "fn": "tsiolkovsky_dv", "args": {"isp": 340.0, "m0": 30000.0, "mf": 4000.0},
     "expect": 6718.2, "tol": 1e-4},
    # Q47 - solid motor equilibrium pressure
    {"id": "Q47", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.5e-5, "n": 0.35, "rho_p": 1770.0, "Ab": 12.0, "At": 0.030,
              "c_star_val": 1550.0}, "expect": 1.12973e7, "tol": 1e-4},
    # Q48 - blowdown usable fraction
    {"id": "Q48.a", "fn": "usable_fraction", "args": {"p_i": 240.0, "p_f": 20.0, "isothermal": True},
     "expect": 0.916667, "tol": 1e-4},
    {"id": "Q48.b", "fn": "usable_fraction",
     "args": {"p_i": 240.0, "p_f": 20.0, "isothermal": False, "gamma": 1.4},
     "expect": 0.830505, "tol": 1e-4},
    # Q49 - helium pressurant mass
    {"id": "Q49.a", "fn": "R_specific", "args": {"M": 4.003}, "expect": 2077.057, "tol": 1e-4},
    {"id": "Q49.b", "fn": "pressurant_mass",
     "args": {"p_tank": 25e5, "V_prop": 0.60, "R_g": 2077.057, "T_g": 280.0},
     "expect": 2.5792, "tol": 1e-4},
    # Q50 - trapezoidal impulse bit
    {"id": "Q50", "fn": "impulse_bit",
     "args": {"F": 0.050, "t_on": 0.020, "t_rise": 0.004, "t_fall": 0.006},
     "expect": 1.050e-3, "tol": 1e-4},

    # --------------------------------------------------------- Intermediate
    # Q53 - normal shock at A/A* = 4.0, gamma = 1.20
    {"id": "Q53.a", "fn": "mach_from_area_ratio", "args": {"gamma": 1.20, "eps": 4.0},
     "expect": 2.61945, "tol": 1e-4},
    {"id": "Q53.b", "fn": "normal_shock_p2_p1", "args": {"gamma": 1.20, "M1": 2.61945},
     "expect": 7.39437, "tol": 1e-4},
    {"id": "Q53.c", "fn": "normal_shock_M2", "args": {"gamma": 1.20, "M1": 2.61945},
     "expect": 0.455304, "tol": 1e-4},
    # Q55 - RS-25-like vacuum Cf and Isp
    {"id": "Q55.a", "fn": "Cf", "args": {"gamma": 1.19, "eps": 69.0, "p0": 206e5, "pa": 0.0},
     "expect": 1.93925, "tol": 1e-4},
    {"id": "Q55.b", "fn": "isp_from_c", "args": {"c_eff": 2330.0 * 1.93925},
     "expect": 460.75, "tol": 1e-4},
    # Q58 - c* for LOX/LH2 vs LOX/RP-1
    {"id": "Q58.a", "fn": "R_specific", "args": {"M": 13.5}, "expect": 615.886, "tol": 1e-4},
    {"id": "Q58.b", "fn": "c_star", "args": {"gamma": 1.20, "R": 615.886, "T0": 3600.0},
     "expect": 2295.99, "tol": 1e-4},
    {"id": "Q58.c", "fn": "R_specific", "args": {"M": 23.0}, "expect": 361.498, "tol": 1e-4},
    {"id": "Q58.d", "fn": "c_star", "args": {"gamma": 1.20, "R": 361.498, "T0": 3670.0},
     "expect": 1776.05, "tol": 1e-4},
    # Q60 - density impulse
    {"id": "Q60.a", "fn": "density_isp", "args": {"rho": 360.0, "isp": 450.0},
     "expect": 162000.0, "tol": 1e-6},
    {"id": "Q60.b", "fn": "density_isp", "args": {"rho": 1030.0, "isp": 340.0},
     "expect": 350200.0, "tol": 1e-6},
    # Q62 - chamber volume and residence time
    {"id": "Q62.a", "fn": "chamber_volume_from_Lstar", "args": {"Lstar": 1.0, "At": 0.0125},
     "expect": 0.0125, "tol": 1e-9},
    {"id": "Q62.b", "fn": "residence_time",
     "args": {"Vc": 0.0125, "rho_c": 6.17761, "mdot": 30.0}, "expect": 2.5740e-3, "tol": 1e-4},
    # Q64 - LOX orifice sizing
    {"id": "Q64.a", "fn": "orifice_velocity", "args": {"Cd": 0.75, "rho": 1140.0, "dp": 1.8e6},
     "expect": 42.146, "tol": 1e-4},
    {"id": "Q64.b", "fn": "orifice_mdot",
     "args": {"Cd": 0.75, "A": 1.769107e-6, "rho": 1140.0, "dp": 1.8e6},
     "expect": 0.085, "tol": 1e-4},
    # Q69 - separation check at eps = 25, pc = 60 bar, sea level
    {"id": "Q69.a", "fn": "mach_from_area_ratio", "args": {"gamma": 1.20, "eps": 25.0},
     "expect": 3.91277, "tol": 1e-4},
    {"id": "Q69.b", "fn": "schmucker_separation", "args": {"pa": 101325.0, "Me": 3.91277},
     "expect": 31022.6, "tol": 1e-4},
    {"id": "Q69.c", "fn": "Cf", "args": {"gamma": 1.20, "eps": 25.0, "p0": 60e5, "pa": 101325.0},
     "expect": 1.42020, "tol": 1e-4},
    # Q71 - Bartz throat coefficient and heat flux
    {"id": "Q71.a", "fn": "bartz_hg",
     "args": {"Dt": 0.15, "mu0": 8.5e-5, "cp0": 2000.0, "Pr0": 0.55, "p0": 10e6,
              "c_star_val": 1780.0, "rc": 0.12, "A_ratio": 1.0, "sigma": 1.0},
     "expect": 17053.2, "tol": 1e-4},
    {"id": "Q71.b", "fn": "heat_flux", "args": {"hg": 17053.2, "Taw": 3300.0, "Twg": 800.0},
     "expect": 4.26330e7, "tol": 1e-4},
    # Q73 - coolant bulk rise and wall drop
    {"id": "Q73.a", "fn": "coolant_bulk_rise", "args": {"Q": 12e6, "mdot": 28.0, "cp": 2100.0},
     "expect": 204.08, "tol": 1e-4},
    {"id": "Q73.b", "fn": "wall_dT", "args": {"q": 60e6, "t": 0.0008, "k": 320.0},
     "expect": 150.0, "tol": 1e-9},
    # Q75 - LOX pump power
    {"id": "Q75", "fn": "pump_power", "args": {"mdot": 250.0, "dp": 28e6, "rho": 1140.0, "eta": 0.70},
     "expect": 8.77193e6, "tol": 1e-4},
    # Q76 - NPSH available (accel = 1.3 g0 = 12.74865 m/s^2)
    {"id": "Q76", "fn": "npsh_available",
     "args": {"p_tank": 3.5e5, "p_vapor": 1.0e5, "rho": 1140.0, "z": 4.0,
              "dp_line": 0.4e5, "accel": 12.74865}, "expect": 23.984, "tol": 1e-4},
    # Q79 - turbine shaft power
    {"id": "Q79", "fn": "turbine_power",
     "args": {"mdot": 18.0, "cp": 2800.0, "T_in": 900.0, "pr": 16.0, "gamma": 1.30, "eta": 0.65},
     "expect": 1.393464e7, "tol": 1e-4},
    # Q89 - temperature sensitivity
    {"id": "Q89.a", "fn": "temperature_sensitivity_pressure", "args": {"sigma_p": 0.0025, "dT": 78.0},
     "expect": 1.21531, "tol": 1e-4},
    {"id": "Q89.b", "fn": "pressure_sensitivity_pi_K", "args": {"sigma_p": 0.0025, "n": 0.35},
     "expect": 3.84615e-3, "tol": 1e-4},
    # Q102 - cold-gas ideal vacuum Isp at eps = 50, T0 = 300 K
    {"id": "Q102.a", "fn": "R_specific", "args": {"M": 28.014}, "expect": 296.7955, "tol": 1e-4},
    {"id": "Q102.b", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": 296.7955, "T0": 300.0, "eps": 50.0},
     "expect": 76.839, "tol": 1e-4},
    {"id": "Q102.c", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": 2077.057, "T0": 300.0, "eps": 50.0},
     "expect": 178.06, "tol": 1e-4},

    # -------------------------------------------------------------- Advanced
    # Q113 - normal shock at the exit plane, eps = 40, gamma = 1.20, pc = 100 bar
    {"id": "Q113.a", "fn": "mach_from_area_ratio", "args": {"gamma": 1.20, "eps": 40.0},
     "expect": 4.23940, "tol": 1e-4},
    {"id": "Q113.b", "fn": "normal_shock_p2_p1", "args": {"gamma": 1.20, "M1": 4.23940},
     "expect": 19.5155, "tol": 1e-3},
    {"id": "Q113.c", "fn": "normal_shock_M2", "args": {"gamma": 1.20, "M1": 4.23940},
     "expect": 0.360977, "tol": 1e-3},
    # Q115 - altitude compensation map
    {"id": "Q115.a", "fn": "Cf", "args": {"gamma": 1.20, "eps": 16.0, "p0": 100e5, "pa": 101325.0},
     "expect": 1.63496, "tol": 1e-4},
    {"id": "Q115.b", "fn": "Cf", "args": {"gamma": 1.20, "eps": 16.0, "p0": 100e5, "pa": 0.0},
     "expect": 1.79708, "tol": 1e-4},
    {"id": "Q115.c", "fn": "Cf", "args": {"gamma": 1.20, "eps": 40.0, "p0": 100e5, "pa": 101325.0},
     "expect": 1.47897, "tol": 1e-4},
    {"id": "Q115.d", "fn": "Cf", "args": {"gamma": 1.20, "eps": 40.0, "p0": 100e5, "pa": 0.0},
     "expect": 1.88427, "tol": 1e-4},
    # Q117 - methalox mixture-ratio shift
    {"id": "Q117.a", "fn": "R_specific", "args": {"M": 21.5}, "expect": 386.719, "tol": 1e-4},
    {"id": "Q117.b", "fn": "c_star", "args": {"gamma": 1.20, "R": 386.719, "T0": 3550.0},
     "expect": 1806.68, "tol": 1e-4},
    {"id": "Q117.c", "fn": "R_specific", "args": {"M": 20.3}, "expect": 409.579, "tol": 1e-4},
    {"id": "Q117.d", "fn": "c_star", "args": {"gamma": 1.20, "R": 409.579, "T0": 3390.0},
     "expect": 1816.93, "tol": 1e-4},
    # Q120 - full chamber sizing chain
    {"id": "Q120.a", "fn": "throat_area_from_thrust",
     "args": {"F": 800e3, "p0": 12e6, "Cf_val": 1.85}, "expect": 0.0360360, "tol": 1e-4},
    {"id": "Q120.b", "fn": "chamber_volume_from_Lstar", "args": {"Lstar": 1.05, "At": 0.0360360},
     "expect": 0.0378378, "tol": 1e-4},
    {"id": "Q120.c", "fn": "isp_from_c", "args": {"c_eff": 1747.2 * 1.85},
     "expect": 329.60, "tol": 1e-4},
    # Q123 - F-O-F triplet sizing and momentum ratio
    {"id": "Q123.a", "fn": "orifice_velocity", "args": {"Cd": 0.78, "rho": 1140.0, "dp": 2.0e6},
     "expect": 46.203, "tol": 1e-4},
    {"id": "Q123.b", "fn": "orifice_velocity", "args": {"Cd": 0.78, "rho": 810.0, "dp": 2.0e6},
     "expect": 54.813, "tol": 1e-4},
    {"id": "Q123.c", "fn": "momentum_ratio",
     "args": {"mdot_o": 0.12, "v_o": 46.203, "mdot_f": 0.052, "v_f": 54.813},
     "expect": 1.94522, "tol": 1e-4},
    # Q126 - extendible nozzle gain
    {"id": "Q126.a", "fn": "Cf", "args": {"gamma": 1.22, "eps": 77.0, "p0": 1e7, "pa": 0.0},
     "expect": 1.90971, "tol": 1e-4},
    {"id": "Q126.b", "fn": "Cf", "args": {"gamma": 1.22, "eps": 285.0, "p0": 1e7, "pa": 0.0},
     "expect": 1.98063, "tol": 1e-4},
    {"id": "Q126.c", "fn": "isp_from_c", "args": {"c_eff": 2300.0 * 1.90971},
     "expect": 447.89, "tol": 1e-4},
    {"id": "Q126.d", "fn": "isp_from_c", "args": {"c_eff": 2300.0 * 1.98063},
     "expect": 464.53, "tol": 1e-4},
    # Q130 - coolant channel, Dh = 2.25 mm
    {"id": "Q130.a", "fn": "reynolds", "args": {"rho": 810.0, "v": 6.0, "L": 0.00225, "mu": 7.5e-4},
     "expect": 14580.0, "tol": 1e-6},
    {"id": "Q130.b", "fn": "dittus_boelter",
     "args": {"k": 0.13, "D": 0.00225, "Re": 14580.0, "Pr": 12.1154, "n": 0.4},
     "expect": 7723.8, "tol": 1e-4},
    # Q133 - pump specific speeds (omega = 36,000 rpm = 3769.911 rad/s)
    {"id": "Q133.a", "fn": "specific_speed_SI",
     "args": {"omega": 3769.911, "Q": 0.070, "H": 22000.0}, "expect": 0.0996375, "tol": 1e-4},
    {"id": "Q133.b", "fn": "suction_specific_speed_SI",
     "args": {"omega": 3769.911, "Q": 0.070, "NPSH": 300.0}, "expect": 2.49689, "tol": 1e-4},
    # Q144 - thermal hoop stress in a copper liner
    {"id": "Q144", "fn": "thermal_stress_hoop",
     "args": {"E": 110e9, "alpha": 1.8e-5, "dT": 150.0, "nu": 0.34},
     "expect": 2.250e8, "tol": 1e-6},
    # Q148 - altitude cell diffuser
    {"id": "Q148.a", "fn": "mach_from_area_ratio", "args": {"gamma": 1.20, "eps": 100.0},
     "expect": 4.89003, "tol": 1e-4},
    {"id": "Q148.b", "fn": "normal_shock_p2_p1", "args": {"gamma": 1.20, "M1": 4.89003},
     "expect": 25.9953, "tol": 1e-4},
    # Q150 - burn-rate law fit; n = 0.52995, a = 2.663707e-6 (SI)
    {"id": "Q150", "fn": "vieille_burn_rate",
     "args": {"a": 2.663707e-6, "p": 7.0e6, "n": 0.5299547}, "expect": 0.0113, "tol": 1e-3},
    # Q159 - real-gas stored mass
    {"id": "Q159.a", "fn": "stored_gas_mass",
     "args": {"p": 300e5, "V": 0.004, "R": 296.7955, "T": 300.0, "Z": 1.0},
     "expect": 1.34772, "tol": 1e-4},
    {"id": "Q159.b", "fn": "stored_gas_mass",
     "args": {"p": 300e5, "V": 0.004, "R": 296.7955, "T": 300.0, "Z": 1.12},
     "expect": 1.20333, "tol": 1e-4},
    # Q160 - CubeSat blowdown budget
    {"id": "Q160.a", "fn": "usable_fraction", "args": {"p_i": 200.0, "p_f": 20.0, "isothermal": True},
     "expect": 0.90, "tol": 1e-9},
    {"id": "Q160.b", "fn": "tsiolkovsky_dv", "args": {"isp": 68.0, "m0": 12.0, "mf": 11.685},
     "expect": 17.739, "tol": 1e-4},

    # --------------------------------------------------------- Very advanced
    # Q171 - staged-combustion power balance
    {"id": "Q171.a", "fn": "pump_power",
     "args": {"mdot": 45.0, "dp": 45e6, "rho": 71.0, "eta": 0.75}, "expect": 3.802817e7, "tol": 1e-4},
    {"id": "Q171.b", "fn": "turbine_power",
     "args": {"mdot": 45.0, "cp": 6000.0, "T_in": 850.0, "pr": 2.46496, "gamma": 1.36, "eta": 0.78},
     "expect": 3.802817e7, "tol": 1e-3},
    # Q177 - loss stack against the optimum expansion ratio
    {"id": "Q177.a", "fn": "Cf", "args": {"gamma": 1.20, "eps": 16.0, "p0": 100e5, "pa": 101325.0},
     "expect": 1.63496, "tol": 1e-4},
    {"id": "Q177.b", "fn": "optimum_eps_for_pa", "args": {"gamma": 1.20, "p0": 100e5, "pa": 101325.0},
     "expect": 11.7527, "tol": 1e-4},
    {"id": "Q177.c", "fn": "Cf", "args": {"gamma": 1.20, "eps": 11.7527, "p0": 100e5, "pa": 101325.0},
     "expect": 1.64296, "tol": 1e-4},
    # Q183 - micro-nozzle choked flow, At = 1.7671459e-8 m^2
    {"id": "Q183", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": 296.7955, "T0": 300.0, "p0": 2.0e5, "At": 1.7671459e-8},
     "expect": 8.11022e-6, "tol": 1e-4},
    # Q195 - LH2 pump power scaling illustration
    {"id": "Q195", "fn": "pump_power",
     "args": {"mdot": 70.0, "dp": 48e6, "rho": 71.0, "eta": 0.75}, "expect": 6.30986e7, "tol": 1e-4},
]
