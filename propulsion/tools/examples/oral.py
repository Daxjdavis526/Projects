"""
Part VI — oral exam bank (part6-interview/oral-exam.md) and the examiner's key
(oral-exam-key.md).

Every entry below reproduces a number printed in the key. `fn` names a function
in tools/rocket.py; `args` are its keyword arguments; `expect` is the value
quoted in the key; `tol` is a RELATIVE tolerance.

Run with tools/check_examples.py (or any harness that imports EXAMPLES).

IDs are `I<item number>` with a letter suffix where one item needs several
library calls.

Standing conventions for this file
----------------------------------
* The reference LOX/RP-1 chamber used from item 2 through item 24 is a single
  consistent engine so that the heat-transfer, injector and chamber-sizing
  answers cannot drift apart:
      gamma = 1.20, M = 23.0 kg/kmol  -> R = 361.4983 J/(kg K)
      T0 = 3600 K, p_c = 97 bar (the Merlin 1D figure, a company claim
      `[engine-database A.3]`), F_SL = 845 kN
      -> c* = 1759.03 m/s, Cf_SL(eps=16) = 1.629946, At = 0.05344557 m^2,
         Dt = 260.9 mm, mdot = 294.72 kg/s
  The 97 bar and 845 kN inputs are SpaceX figures with no primary source; the
  key says so every time it uses them. Everything downstream of them is
  arithmetic on a claim, not a measurement.
* gamma: 1.20 LOX/RP-1, 1.19 LOX/LH2, 1.16 LOX/CH4, 1.14 AP/Al composite
  exhaust, 1.40 GN2 at 300 K.
* Vacuum thrust coefficients use `Cf(gamma, eps, p0, pa=0.0)`; with pa = 0 the
  result depends on gamma and eps only, so p0 is a placeholder in those calls.
* `mach_from_area_ratio` is the supersonic root unless `supersonic=False`.
* The Bartz property recipe is Module 10's, reused unchanged:
      cp0 = gamma R/(gamma-1), Pr0 = 4 gamma/(9 gamma - 5),
      mu0 = 1.0e-4 Pa s, rc = 1.5 x throat radius, A/At = 1 at the throat,
      Twg = 800 K, sigma from bartz_sigma(gamma, M=1, Twg/T0).
  Bartz is +-20-30% at the throat at best. Item 22's key quotes it as an order
  of magnitude and says so.

Arithmetic in the key that is deliberately NOT registered here
--------------------------------------------------------------
* **Item 1 — the A-7 thrust triple.** 75,000 / 78,000 / 82,977 lbf are three
  published figures, not a calculation `[engine-database A.1.1]`.
* **Item 2 — measured efficiencies.** eta_c* and eta_Cf are ratios of measured
  to ideal values; the key's worked case is
      c*_meas = p_c At/mdot = 97e5 * 0.05344557 / 294.72 = 1759.0 m/s
  which is the ideal by construction (the example is built to close), so the
  key instead perturbs it: a measured mdot of 306.0 kg/s gives
  c*_meas = 1693.6 m/s and eta_c* = 0.963.
* **Item 3 — throat erosion.** p2/p1 = (At1/At2)^(1/(1-n)) = (1/1.06)^(1/0.65)
  = 0.91426 for n = 0.35, i.e. an 8.6% pressure loss. Registered under I43 in
  spirit but computed as three logarithms; left longhand.
* **Item 5 — break-even altitude.** pa_BE = p_c (Cf_vac(eps2) - Cf_vac(eps1))
  / (eps2 - eps1), then the US 1976 troposphere inversion
  h = (T0/L)[1 - (pa/p0)^(R_air L/g0)] with T0 = 288.15 K, L = 0.0065 K/m,
  R_air = 287.05 J/(kg K). Two of the three terms are library calls (below);
  the atmosphere inversion is not in rocket.py.
* **Item 7 — divergence loss.** lambda = (1 + cos alpha)/2 = 0.9830 for a 15
  degree half-angle cone. One cosine.
* **Item 7/24/28 — Isp loss stacks.** Mass-weighted mixing of a core and a
  degraded stream: 0.90*348 + 0.10*0.6*348 = 334.1 s (item 24, 10% film
  coolant at 60% of core Isp, a 13.9 s penalty); 0.97*348 + 0.03*0.4*348 =
  341.7 s (item 28, 3% gas-generator flow at 40% of core Isp, a 6.3 s
  penalty). Pure arithmetic.
* **Item 13 — contraction ratio.** The chamber Mach number is the SUBSONIC
  root of the area relation, registered below; the stagnation-pressure loss
  p0/p is then a second library call, also registered.
* **Item 31 — chamber acoustic modes.** f = alpha_mn a / (pi D) with
  alpha_1T = 1.8412: 1.8412 * 1100 / (pi * 0.6) = 1074 Hz. The Bessel mode
  constants are not in rocket.py.
* **Item 36 — the n = 0.6 sensitivity.** Only the RATIO is quoted, because the
  absolute equilibrium pressure at n = 0.6 with the item's coefficient is
  physically absurd (10^11 Pa) and the key says so: 1.1^(1/(1-0.6)) = 1.2691,
  against 1.1^(1/0.65) = 1.1579 at n = 0.35.
* **Item 38 — conditioning swing.** exp(sigma_p dT/(1-n)) - 1 = 13.1% pressure
  rise over 40 K at sigma_p = 0.002 /K, n = 0.35; the burn-rate part alone is
  exp(0.002*40) - 1 = 8.3% and IS registered.
* **Item 41 — case membrane.** t = p r SF / sigma = 6.5e6 * 1.7 * 1.4 / 1400e6
  = 11.05 mm. Thin-wall hoop, one line.
* **Item 51 — MarCO propellant mass.** m = It/(Isp g0) = 755/(40*9.80665) =
  1.925 kg; at ~1.36 g/cm^3 for liquid R-236fa that is ~1,415 cm^3
  `[engine-database C.1, C.2]`.
* **Item 8/54 — uncertainty combinations.** `rocket.rss()` takes positional
  arguments, which the EXAMPLES harness cannot express; `rel_unc_product` can
  be called with keywords only if they are positional-or-keyword, and they are
  not (it is *rel). Both items' combinations are therefore done longhand:
      item 8:  Isp  sqrt(0.0025^2 + 0.005^2) = 0.005590 -> +-0.56%
               c*   sqrt(0.003^2  + 0.005^2) = 0.005831 -> +-0.58%
      item 54: dv   sqrt(0.015^2  + 0.05^2)  = 0.05220  -> +-5.2%

SI units throughout. gamma dimensionless, R in J/(kg K), T0 in K, pressures in
Pa, areas in m^2, thrust in N, mass flow in kg/s, lengths in m.
"""

EXAMPLES = [
    # ------------------------------------------------- Block A — foundations
    # I2 - the reference LOX/RP-1 chamber: R, Gamma, c*
    {"id": "I2.a", "fn": "R_specific", "args": {"M": 23.0}, "expect": 361.4983, "tol": 1e-5},
    {"id": "I2.b", "fn": "gamma_function", "args": {"gamma": 1.20},
     "expect": 0.6485312, "tol": 1e-5},
    {"id": "I2.c", "fn": "c_star", "args": {"gamma": 1.20, "R": 361.4983, "T0": 3600.0},
     "expect": 1759.031, "tol": 1e-5},
    # I2.d - Cf at sea level, eps = 16, pc = 97 bar; and the throat it implies
    {"id": "I2.d", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 97e5, "pa": 101325.0},
     "expect": 1.629946, "tol": 1e-5},
    {"id": "I2.e", "fn": "throat_area_from_thrust",
     "args": {"F": 845e3, "p0": 97e5, "Cf_val": 1.629946}, "expect": 0.05344557, "tol": 1e-5},
    {"id": "I2.f", "fn": "c_eff", "args": {"c_star_val": 1759.031, "Cf_val": 1.629946},
     "expect": 2867.126, "tol": 1e-5},
    {"id": "I2.g", "fn": "isp_from_c", "args": {"c_eff": 2867.126}, "expect": 292.3655, "tol": 1e-5},

    # I3 - choked mass flow through that throat
    {"id": "I3.a", "fn": "choked_mdot",
     "args": {"gamma": 1.20, "R": 361.4983, "T0": 3600.0, "p0": 97e5, "At": 0.05344557},
     "expect": 294.7202, "tol": 1e-5},
    # I3.b - doubling p_c doubles mdot at fixed At (the linearity the item probes)
    {"id": "I3.b", "fn": "choked_mdot",
     "args": {"gamma": 1.20, "R": 361.4983, "T0": 3600.0, "p0": 194e5, "At": 0.05344557},
     "expect": 589.4405, "tol": 1e-5},

    # I5 - expansion ratio and the altitude compromise
    {"id": "I5.a", "fn": "Cf", "args": {"gamma": 1.20, "eps": 16.0, "p0": 1e7, "pa": 0.0},
     "expect": 1.797080, "tol": 1e-5},
    {"id": "I5.b", "fn": "Cf", "args": {"gamma": 1.20, "eps": 40.0, "p0": 1e7, "pa": 0.0},
     "expect": 1.884275, "tol": 1e-5},
    {"id": "I5.c", "fn": "Cf", "args": {"gamma": 1.20, "eps": 77.5, "p0": 1e7, "pa": 0.0},
     "expect": 1.934919, "tol": 1e-5},
    {"id": "I5.d", "fn": "Cf", "args": {"gamma": 1.20, "eps": 240.0, "p0": 1e7, "pa": 0.0},
     "expect": 2.003964, "tol": 1e-5},
    {"id": "I5.e", "fn": "Cf", "args": {"gamma": 1.19, "eps": 285.0, "p0": 1e7, "pa": 0.0},
     "expect": 2.029896, "tol": 1e-5},
    {"id": "I5.f", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.20, "p0": 97e5, "pa": 101325.0}, "expect": 11.48361, "tol": 1e-5},
    {"id": "I5.g", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.20, "p0": 206.4e5, "pa": 101325.0}, "expect": 20.50725, "tol": 1e-5},
    # I5.h - exit Mach and pressure ratio at the reference eps = 16
    {"id": "I5.h", "fn": "mach_from_area_ratio", "args": {"gamma": 1.20, "eps": 16.0},
     "expect": 3.604355, "tol": 1e-5},
    {"id": "I5.i", "fn": "p0_over_p", "args": {"gamma": 1.20, "Mach": 3.604355},
     "expect": 147.7032, "tol": 1e-4},

    # I6 - molecular weight and temperature: hydrolox against cold helium
    {"id": "I6.a", "fn": "R_specific", "args": {"M": 13.5}, "expect": 615.8859, "tol": 1e-5},
    {"id": "I6.b", "fn": "c_star", "args": {"gamma": 1.19, "R": 615.8859, "T0": 3550.0},
     "expect": 2286.866, "tol": 1e-5},
    {"id": "I6.c", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": 2077.05, "T0": 300.0, "eps": 50.0},
     "expect": 178.0591, "tol": 1e-4},

    # ------------------------------------------------ Block B — liquid engines
    # I12 - chamber sizing from L*
    {"id": "I12.a", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.0, "At": 0.05344557}, "expect": 0.05344557, "tol": 1e-9},
    {"id": "I12.b", "fn": "residence_time",
     "args": {"Vc": 0.05344557, "rho_c": 7.453547, "mdot": 294.7202},
     "expect": 1.351652e-3, "tol": 1e-5},

    # I13 - contraction ratio: subsonic root and the stagnation-pressure loss
    {"id": "I13.a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 3.0, "supersonic": False}, "expect": 0.2018026, "tol": 1e-4},
    {"id": "I13.b", "fn": "p0_over_p", "args": {"gamma": 1.20, "Mach": 0.2018026},
     "expect": 1.024685, "tol": 1e-5},
    {"id": "I13.c", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 2.0, "supersonic": False}, "expect": 0.3122372, "tol": 1e-4},
    {"id": "I13.d", "fn": "p0_over_p", "args": {"gamma": 1.20, "Mach": 0.3122372},
     "expect": 1.059940, "tol": 1e-5},

    # I15/I16 - injector orifice and atomization groups
    {"id": "I15.a", "fn": "orifice_mdot",
     "args": {"Cd": 0.75, "A": 7.853982e-6, "rho": 1140.0, "dp": 2.0e6},
     "expect": 0.3977714, "tol": 1e-5},
    {"id": "I15.b", "fn": "orifice_velocity",
     "args": {"Cd": 0.75, "rho": 810.0, "dp": 2.0e6}, "expect": 52.70463, "tol": 1e-5},
    {"id": "I16.a", "fn": "weber",
     "args": {"rho": 3.0, "v": 30.0, "L": 1.0e-3, "sigma": 0.030}, "expect": 90.0, "tol": 1e-6},
    {"id": "I16.b", "fn": "reynolds",
     "args": {"rho": 810.0, "v": 30.0, "L": 1.0e-3, "mu": 1.5e-3},
     "expect": 16200.0, "tol": 1e-6},
    {"id": "I16.c", "fn": "momentum_ratio",
     "args": {"mdot_o": 0.70, "v_o": 35.0, "mdot_f": 0.30, "v_f": 25.0},
     "expect": 3.266667, "tol": 1e-5},

    # I20 - separation criteria
    {"id": "I20.a", "fn": "summerfield_separation_pressure",
     "args": {"p0": 101325.0, "frac": 0.4}, "expect": 40530.0, "tol": 1e-6},
    {"id": "I20.b", "fn": "mach_from_area_ratio", "args": {"gamma": 1.20, "eps": 77.5},
     "expect": 4.706631, "tol": 1e-5},
    {"id": "I20.c", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.706631}, "expect": 27105.31, "tol": 1e-5},

    # I22 - Bartz at the throat of the reference chamber
    {"id": "I22.a", "fn": "bartz_sigma",
     "args": {"gamma": 1.20, "Mach": 1.0, "Tw_over_T0": 0.2222222},
     "expect": 1.365054, "tol": 1e-5},
    {"id": "I22.b", "fn": "bartz_hg",
     "args": {"Dt": 0.2608621, "mu0": 1.0e-4, "cp0": 2168.990, "Pr0": 0.8275862,
              "p0": 97e5, "c_star_val": 1759.031, "rc": 0.1956466, "A_ratio": 1.0,
              "sigma": 1.365054},
     "expect": 18117.70, "tol": 1e-4},
    {"id": "I22.c", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.20, "Mach": 1.0}, "expect": 3567.273, "tol": 1e-5},
    {"id": "I22.d", "fn": "heat_flux",
     "args": {"hg": 18117.70, "Taw": 3567.273, "Twg": 800.0}, "expect": 5.013662e7, "tol": 1e-5},
    {"id": "I22.e", "fn": "wall_dT",
     "args": {"q": 5.013662e7, "t": 0.0008, "k": 340.0}, "expect": 117.9685, "tol": 1e-5},
    # I22.f - the same Bartz call moved to A/At = 10 in the diverging section
    {"id": "I22.f", "fn": "bartz_hg",
     "args": {"Dt": 0.2608621, "mu0": 1.0e-4, "cp0": 2168.990, "Pr0": 0.8275862,
              "p0": 97e5, "c_star_val": 1759.031, "rc": 0.1956466, "A_ratio": 10.0,
              "sigma": 1.365054},
     "expect": 2280.883, "tol": 1e-4},

    # I23 - coolant side
    {"id": "I23.a", "fn": "dittus_boelter",
     "args": {"k": 0.10, "D": 0.003, "Re": 3.0e5, "Pr": 2.0}, "expect": 24362.15, "tol": 1e-5},
    {"id": "I23.b", "fn": "coolant_bulk_rise",
     "args": {"Q": 60e6, "mdot": 140.0, "cp": 2000.0}, "expect": 214.2857, "tol": 1e-5},
    {"id": "I23.c", "fn": "thermal_stress_hoop",
     "args": {"E": 120e9, "alpha": 17e-6, "dT": 150.0, "nu": 0.34},
     "expect": 2.318182e8, "tol": 1e-5},

    # I26 - pressure feed
    {"id": "I26.a", "fn": "pressurant_mass",
     "args": {"p_tank": 3.0e6, "V_prop": 2.0, "R_g": 2077.0, "T_g": 250.0},
     "expect": 11.55513, "tol": 1e-5},

    # I27 - suction performance
    {"id": "I27.a", "fn": "pump_head", "args": {"dp": 1.5e7, "rho": 810.0},
     "expect": 1888.363, "tol": 1e-5},
    {"id": "I27.b", "fn": "pump_power",
     "args": {"mdot": 140.0, "dp": 1.5e7, "rho": 810.0, "eta": 0.70},
     "expect": 3.703704e6, "tol": 1e-5},
    {"id": "I27.c", "fn": "npsh_available",
     "args": {"p_tank": 3.0e5, "p_vapor": 2.0e4, "rho": 810.0, "z": 0.0, "accel": 9.80665},
     "expect": 35.24945, "tol": 1e-5},
    {"id": "I27.d", "fn": "suction_specific_speed_SI",
     "args": {"omega": 3000.0, "Q": 0.1728395, "NPSH": 35.24945},
     "expect": 15.55743, "tol": 1e-4},

    # I28 - turbine power
    {"id": "I28.a", "fn": "turbine_power",
     "args": {"mdot": 20.0, "cp": 2000.0, "T_in": 900.0, "pr": 20.0, "gamma": 1.30,
              "eta": 0.65},
     "expect": 1.167864e7, "tol": 1e-5},

    # ------------------------------------------------ Block C — solid motors
    # I36 - burn rate and the equilibrium pressure, then a 10% Kn step
    {"id": "I36.a", "fn": "vieille_burn_rate",
     "args": {"a": 3.5e-5, "p": 5.482051e6, "n": 0.35}, "expect": 7.992785e-3, "tol": 1e-5},
    {"id": "I36.b", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.5e-5, "n": 0.35, "rho_p": 1770.0, "Ab": 5.0, "At": 0.020,
              "c_star_val": 1550.0},
     "expect": 5.482051e6, "tol": 1e-5},
    {"id": "I36.c", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.5e-5, "n": 0.35, "rho_p": 1770.0, "Ab": 5.5, "At": 0.020,
              "c_star_val": 1550.0},
     "expect": 6.347813e6, "tol": 1e-5},

    # I38 - temperature sensitivity
    {"id": "I38.a", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.002, "n": 0.35}, "expect": 3.076923e-3, "tol": 1e-5},
    {"id": "I38.b", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.002, "dT": 40.0}, "expect": 1.083287, "tol": 1e-5},

    # I43 - AP/Al exhaust thrust coefficients at the Shuttle SRB's area ratio
    {"id": "I43.a", "fn": "Cf",
     "args": {"gamma": 1.14, "eps": 7.72, "p0": 62.5e5, "pa": 101325.0},
     "expect": 1.615964, "tol": 1e-5},
    {"id": "I43.b", "fn": "Cf",
     "args": {"gamma": 1.14, "eps": 7.72, "p0": 62.5e5, "pa": 0.0},
     "expect": 1.741121, "tol": 1e-5},

    # I34/I53 - density impulse, solid against LOX/RP-1
    {"id": "I34.a", "fn": "density_isp", "args": {"rho": 1770.0, "isp": 268.0},
     "expect": 474360.0, "tol": 1e-6},
    {"id": "I34.b", "fn": "density_isp", "args": {"rho": 1030.0, "isp": 311.0},
     "expect": 320330.0, "tol": 1e-6},

    # ------------------------------------------------ Block D — cold gas
    # I47 - ideal cold-gas Isp for GN2 and its insensitivity to eps
    {"id": "I47.a", "fn": "R_specific", "args": {"M": 28.014}, "expect": 296.7966, "tol": 1e-5},
    {"id": "I47.b", "fn": "c_star",
     "args": {"gamma": 1.40, "R": 296.7966, "T0": 300.0}, "expect": 435.7825, "tol": 1e-5},
    {"id": "I47.c", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.40, "R": 296.7966, "T0": 300.0, "eps": 50.0},
     "expect": 76.83904, "tol": 1e-4},
    {"id": "I47.d", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.40, "R": 296.7966, "T0": 300.0, "eps": 20.0},
     "expect": 75.09617, "tol": 1e-4},
    {"id": "I47.e", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.40, "R": 296.7966, "T0": 300.0, "eps": 100.0},
     "expect": 77.75872, "tol": 1e-4},
    {"id": "I47.f", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.40, "R": 296.7966, "T0": 250.0, "eps": 50.0},
     "expect": 70.14413, "tol": 1e-4},

    # I49 - blowdown
    {"id": "I49.a", "fn": "blowdown_pressure",
     "args": {"p_i": 3.0e7, "V_i": 0.10, "V": 0.40, "n": 1.0}, "expect": 7.5e6, "tol": 1e-9},
    {"id": "I49.b", "fn": "usable_fraction",
     "args": {"p_i": 3.0e7, "p_f": 5.0e6, "isothermal": True}, "expect": 0.8333333, "tol": 1e-6},
    {"id": "I49.c", "fn": "stored_gas_mass",
     "args": {"p": 3.0e7, "V": 0.010, "R": 296.8, "T": 293.0, "Z": 1.05},
     "expect": 3.285492, "tol": 1e-5},

    # I50 - minimum impulse bit
    {"id": "I50.a", "fn": "impulse_bit",
     "args": {"F": 1.0, "t_on": 0.020, "t_rise": 0.004, "t_fall": 0.006},
     "expect": 0.021, "tol": 1e-6},

    # I51 - MarCO and SAFER closure checks
    {"id": "I51.a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 40.0, "m0": 180.0, "mf": 178.6}, "expect": 3.062884, "tol": 1e-5},
    {"id": "I51.b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 340.0, "mf": 328.2}, "expect": 24.24764, "tol": 1e-5},

    # ------------------------------------------------ Block E — cross-system
    # I53 - the 3 km/s upper stage, liquid against solid
    {"id": "I53.a", "fn": "propellant_for_dv",
     "args": {"isp": 340.0, "m_final": 400.0, "dv": 3000.0}, "expect": 583.5949, "tol": 1e-5},
    {"id": "I53.b", "fn": "propellant_for_dv",
     "args": {"isp": 290.0, "m_final": 600.0, "dv": 3000.0}, "expect": 1122.976, "tol": 1e-5},

    # I58 - what doubling chamber pressure does to Cf at fixed eps
    {"id": "I58.a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 34.34, "p0": 150e5, "pa": 101325.0},
     "expect": 1.639301, "tol": 1e-4},
    {"id": "I58.b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 34.34, "p0": 300e5, "pa": 101325.0},
     "expect": 1.755285, "tol": 1e-4},

    # I60 - the 250 kN methalox upper stage designed at the board
    {"id": "I60.a", "fn": "R_specific", "args": {"M": 20.5}, "expect": 405.5834, "tol": 1e-5},
    {"id": "I60.b", "fn": "c_star",
     "args": {"gamma": 1.16, "R": 405.5834, "T0": 3550.0}, "expect": 1872.991, "tol": 1e-5},
    {"id": "I60.c", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 80.0, "p0": 100e5, "pa": 0.0},
     "expect": 1.992023, "tol": 1e-5},
    {"id": "I60.d", "fn": "throat_area_from_thrust",
     "args": {"F": 250e3, "p0": 100e5, "Cf_val": 1.992023}, "expect": 0.01255006, "tol": 1e-5},
    {"id": "I60.e", "fn": "isp_from_c",
     "args": {"c_eff": 3730.999}, "expect": 380.4602, "tol": 1e-4},
]
