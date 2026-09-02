"""Worked-example inputs and expected outputs for Module 20 —
Solid Combustion and Burn Rate.

Generic propellant used throughout the module (NOT a real formulation):
    a      = 3.2e-5  m/s / Pa^0.35
    n      = 0.35
    rho_p  = 1750    kg/m^3
    c*     = 1500    m/s
    sigma_p= 0.0020  1/K
Generic motor: throat diameter 0.10 m -> At = 7.853981633974483e-3 m^2.

Entries whose arithmetic maps onto a rocket.py function are listed in
EXAMPLES; everything else is described in a comment at the bottom.
`tol` is relative.
"""

A = 3.2e-5
N = 0.35
RHO_P = 1750.0
CSTAR = 1500.0
AT = 7.853981633974483e-3          # pi/4 * 0.10^2
AB = 2.7488935718910694            # Kn = 350
SIGMA_P = 0.0020
PI_K = 0.003076923076923077        # sigma_p / (1 - n)

EXAMPLES = [
    # --- WE1: equilibrium pressure, burn rate -------------------------------
    {"id": "20.WE1a", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": AB, "At": AT,
              "c_star_val": CSTAR},
     "expect": 7488252.99, "tol": 1e-4},
    {"id": "20.WE1b", "fn": "vieille_burn_rate",
     "args": {"a": A, "p": 7488252.985616873, "n": N},
     "expect": 8.150479440127214e-3, "tol": 1e-4},

    # --- WE2: temperature sensitivity, +/- 40 K -----------------------------
    {"id": "20.WE2a", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": SIGMA_P, "n": N},
     "expect": 3.076923076923077e-3, "tol": 1e-9},
    {"id": "20.WE2b", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": PI_K, "dT": 40.0},
     "expect": 1.1309714154026906, "tol": 1e-6},
    {"id": "20.WE2c", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": PI_K, "dT": -40.0},
     "expect": 0.884195644895183, "tol": 1e-6},
    # strand-burner (constant-pressure) rate ratio, for the contrast in WE2
    {"id": "20.WE2d", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": SIGMA_P, "dT": 40.0},
     "expect": 1.0832870676749586, "tol": 1e-6},

    # --- WE3: 3 % throat-area growth ----------------------------------------
    {"id": "20.WE3", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": AB, "At": AT * 1.03,
              "c_star_val": CSTAR},
     "expect": 7155350.82, "tol": 1e-4},

    # --- WE5: p_c(t) from the K_n(t) table ----------------------------------
    {"id": "20.WE5.t0", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 300 * AT, "At": AT,
              "c_star_val": CSTAR},
     "expect": 5906928.4, "tol": 1e-4},
    {"id": "20.WE5.t10", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 358 * AT, "At": AT,
              "c_star_val": CSTAR},
     "expect": 7753190.97, "tol": 1e-4},
    {"id": "20.WE5.t20", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 350 * AT, "At": AT,
              "c_star_val": CSTAR},
     "expect": 7488252.99, "tol": 1e-4},
    {"id": "20.WE5.t60", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 296 * AT, "At": AT,
              "c_star_val": CSTAR},
     "expect": 5786745.8, "tol": 1e-4},
    {"id": "20.WE5.t92", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 120 * AT, "At": AT,
              "c_star_val": CSTAR},
     "expect": 1442680.13, "tol": 1e-4},

    # --- Problem N1 ---------------------------------------------------------
    {"id": "20.N1", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 1.85,
              "At": 4.417864669110647e-3, "c_star_val": CSTAR},
     "expect": 9867638.72, "tol": 1e-4},

    # --- Problem N2: coefficient recovered from r = 6.5 mm/s at 6.9 MPa -----
    {"id": "20.N2", "fn": "vieille_burn_rate",
     "args": {"a": 5.771100394866341e-5, "p": 1.0e7, "n": 0.30},
     "expect": 7.265384941112588e-3, "tol": 1e-6},

    # --- Problem N4: two propellants over a 100 K band ----------------------
    {"id": "20.N4a", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.0020, "n": 0.35},
     "expect": 3.076923076923077e-3, "tol": 1e-9},
    {"id": "20.N4b", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.0045, "n": 0.62},
     "expect": 1.1842105263157893e-2, "tol": 1e-9},
    {"id": "20.N4c", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 1.1842105263157893e-2, "dT": 100.0},
     "expect": 3.2681057192812957, "tol": 1e-6},

    # --- Quiz Q4 / Q5 -------------------------------------------------------
    {"id": "20.Q4", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 3.60,
              "At": 1.1309733552923255e-2, "c_star_val": CSTAR},
     "expect": 6470954.23, "tol": 1e-4},
    {"id": "20.Q5", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 3.60,
              "At": 1.1785881189482957e-2, "c_star_val": CSTAR},
     "expect": 6073163.40, "tol": 1e-4},
    {"id": "20.Q2", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 4.1666666666666666e-3, "dT": 80.0},
     "expect": 1.3956124250860895, "tol": 1e-6},
]

# ---------------------------------------------------------------------------
# Examples whose arithmetic does NOT map onto a single rocket.py function
# ---------------------------------------------------------------------------
# 20.WE4  Erosive burning, coupled solution.  Solve simultaneously
#           r_bar = 0.7*a*pc^n + 0.3*[a*pc^n + k*(pc*At/(c* * Ap) - G_th)]
#           pc    = rho_p * Ab * r_bar * c* / At
#         with Ap = pi/4*0.14^2 = 1.5393804e-2 m^2, k = 1.8e-6 m^3/kg,
#         G_th = 1200 kg/(m^2 s).  Converges to pc = 8.8219e6 Pa,
#         G = 3000.6 kg/(m^2 s), r_aft = 11.873 mm/s (augmentation 1.3755),
#         mdot = 46.19 kg/s.  Fixed-point iteration with 0.5 relaxation
#         converges in ~20 steps from the non-erosive pressure.
#         Hot-day repeat with a -> a*exp(sigma_p*40) = 3.4666e-5 gives
#         pc = 1.0132e7 Pa.
#
# 20.WE4b Port Mach number from J = Ap/At = 1.960: subsonic root of
#         mach_from_area_ratio(1.18, 1.960, supersonic=False) = 0.3200.
#         Problem N6 is the same call at J = 1.8333 -> M = 0.3453.
#
# 20.C8 / 20.Q7  Time scales.  tau_fill = L*/(c* Gamma^2) with Gamma =
#         gamma_function(gamma); pressure relaxation = tau_fill/(1-n);
#         tau_th = alpha/r^2.  C8: L*=1.5, gamma=1.18 -> 2.407 ms, 3.702 ms,
#         5.556 ms.  Q7: L*=1.2, c*=1520, gamma=1.16, n=0.38, alpha=2.2e-7,
#         r=11 mm/s -> 1.924 ms, 3.102 ms, 1.818 ms.
#
# 20.N5 / 20.N7  Throat erosion sweeps: pc(t) = pc0 * f^(-1/(1-n)) with
#         f = At(t)/At(0).  Each row is a solid_equilibrium_pressure call
#         with At scaled by f; only representative rows are tabulated above.
#
# 20.RSRM  Inferred throat area in section 6.1: Cf(1.18, 7.72, 6.4e6,
#         101325) = 1.5966, At = 14.7e6/(1.5966*6.4e6) = 1.4386 m^2,
#         Dt = 1.353 m.  Flagged [A] in the text: an inference from published
#         thrust and pressure, not a published number.
