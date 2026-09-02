"""Worked-example inputs and expected outputs for Module 27.

Run against tools/rocket.py. Each entry names a function in that module,
its keyword arguments, and the expected return value with a relative
tolerance.

Examples whose arithmetic has no library counterpart are described in
comments rather than encoded:

  * 27.WE1 step 6 (MEOP build-up) is a chain of multiplications on the
    hot-limit pressure: 10.0 MPa x exp(pi_K * 50 K) x 1.10 (lot dispersion)
    x 1.25 (design factor).
  * 27.WE2 steps 5-6 (webs, propellant masses, Isp cross-check) are
    elementary arithmetic on the values returned below.
  * 27.WE3 (hybrid regression and O/F shift) uses rdot = a * G_ox**n, which
    is not in rocket.py.  For the record, with rho_f = 920 kg/m^3, L = 1.5 m,
    mdot_ox = 1.5 kg/s:
        D = 0.100 m -> G_ox = 191.0 kg/m^2/s, rdot = 1.914 mm/s,
                       mdot_f = 0.830 kg/s, O/F = 1.81
        n = 0.50, D = 0.220 m -> rdot = 0.870 mm/s, mdot_f = 0.830 kg/s,
                       O/F = 1.81 (no shift; mdot_f ~ D^(1-2n) = D^0)
        n = 0.62, D = 0.220 m -> rdot = 0.720 mm/s, mdot_f = 0.687 kg/s,
                       O/F = 2.18
    calibrated a: 1.385e-4 (n = 0.50), 7.374e-5 (n = 0.62), SI units.
  * 27.N6 (reliability) is R_LB = (1 - C)**(1/N); no library counterpart.
"""

EXAMPLES = [
    # --- WE1: temperature envelope -------------------------------------
    {"id": "27.WE1a", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.002, "n": 0.35},
     "expect": 3.0769e-3, "tol": 0.001},
    # cold case: T_i = -40 C against a +21 C reference, dT = -61 K
    {"id": "27.WE1b", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 3.0769e-3, "dT": -61.0},
     "expect": 0.82887, "tol": 0.001},
    # hot case: T_i = +60 C, dT = +39 K
    {"id": "27.WE1c", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 3.0769e-3, "dT": 39.0},
     "expect": 1.12750, "tol": 0.001},
    # full field envelope -54 C to +71 C, dT = 125 K
    {"id": "27.WE1d", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 3.0769e-3, "dT": 125.0},
     "expect": 1.46905, "tol": 0.001},

    # --- WE2: boost-sustain grain --------------------------------------
    # boost: Kn = 461.7 at At = 2.344e-3 m^2  ->  p_c = 12.0 MPa
    {"id": "27.WE2a", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.2159e-5, "n": 0.35, "rho_p": 1770.0,
              "Ab": 1.0821, "At": 2.3438e-3, "c_star_val": 1520.0},
     "expect": 12.0e6, "tol": 0.005},
    {"id": "27.WE2b", "fn": "vieille_burn_rate",
     "args": {"a": 3.2159e-5, "p": 12.0e6, "n": 0.35},
     "expect": 9.661e-3, "tol": 0.005},
    # sustain, same propellant: Ab = 0.4018 m^2 -> p_c = 2.61 MPa
    {"id": "27.WE2c", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.2159e-5, "n": 0.35, "rho_p": 1770.0,
              "Ab": 0.40176, "At": 2.3438e-3, "c_star_val": 1520.0},
     "expect": 2.613e6, "tol": 0.005},
    {"id": "27.WE2d", "fn": "vieille_burn_rate",
     "args": {"a": 3.2159e-5, "p": 2.613e6, "n": 0.35},
     "expect": 5.667e-3, "tol": 0.005},
    # sustain with a slower co-cured propellant, a_s = 0.35 a, same p_c
    {"id": "27.WE2e", "fn": "solid_equilibrium_pressure",
     "args": {"a": 1.12557e-5, "n": 0.35, "rho_p": 1770.0,
              "Ab": 1.14788, "At": 2.3438e-3, "c_star_val": 1520.0},
     "expect": 2.613e6, "tol": 0.005},
    # cold-day sustain pressure check, dT = -75 K
    {"id": "27.WE2f", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 3.0769e-3, "dT": -75.0},
     "expect": 0.79392, "tol": 0.001},

    # --- problems ------------------------------------------------------
    {"id": "27.N1", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.0025, "n": 0.45},
     "expect": 4.5455e-3, "tol": 0.001},
    {"id": "27.N2a", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 3.1e-3, "dT": -75.0},
     "expect": 0.79249, "tol": 0.001},
    {"id": "27.N2b", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 3.1e-3, "dT": 50.0},
     "expect": 1.16766, "tol": 0.001},
    {"id": "27.N4a", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.216e-5, "n": 0.35, "rho_p": 1770.0,
              "Ab": 0.45952, "At": 1.20e-3, "c_star_val": 1520.0},
     "expect": 9.0e6, "tol": 0.005},
    {"id": "27.N4b", "fn": "vieille_burn_rate",
     "args": {"a": 3.216e-5, "p": 9.0e6, "n": 0.35},
     "expect": 8.736e-3, "tol": 0.005},
    {"id": "27.Q3", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 2.8e-3, "dT": 50.0},
     "expect": 1.15027, "tol": 0.001},
    {"id": "27.Q9", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 3.0e-3, "dT": 25.0},
     "expect": 1.07788, "tol": 0.001},
]
