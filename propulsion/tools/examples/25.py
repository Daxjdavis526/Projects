"""Worked-example checks for Module 25 — Solid rocket manufacturing.

Each dict names a function in tools/rocket.py, its arguments, and the value
the module text prints. `tol` is a RELATIVE tolerance.

Examples whose arithmetic does not map onto a library function are described
in comments at the bottom of this file rather than being forced into the
EXAMPLES list.
"""

EXAMPLES = [
    # --- WE2: lot-to-lot burn-rate variation -> pressure / thrust / burn time
    # Generic composite propellant: n = 0.35, r = 8.00 mm/s at p_c = 5.00 MPa,
    # rho_p = 1770 kg/m^3, c* = 1520 m/s.  a = r / p^n.
    {"id": "25.WE2a", "fn": "vieille_burn_rate",
     "args": {"a": 3.61785e-5, "p": 5.0e6, "n": 0.35},
     "expect": 0.008, "tol": 0.002},

    # Design Klemmung K_n = p^(1-n) / (a rho_p c*) = 232.31.  Feeding that back
    # through the equilibrium-pressure relation must return 5.00 MPa.
    {"id": "25.WE2b", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.61785e-5, "n": 0.35, "rho_p": 1770.0,
              "Ab": 232.31, "At": 1.0, "c_star_val": 1520.0},
     "expect": 5.0e6, "tol": 0.005},

    # Lot 2.0 % high in a -> p_c up by (1.02)^(1/(1-n)) = 1.03093, i.e. +3.09 %.
    {"id": "25.WE2c", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.690207e-5, "n": 0.35, "rho_p": 1770.0,
              "Ab": 232.31, "At": 1.0, "c_star_val": 1520.0},
     "expect": 5.1547e6, "tol": 0.005},

    # Burn rate at the new equilibrium tracks pressure exactly: 8.247 mm/s.
    {"id": "25.WE2d", "fn": "vieille_burn_rate",
     "args": {"a": 3.690207e-5, "p": 5.1547e6, "n": 0.35},
     "expect": 0.008247, "tol": 0.003},

    # WE2(c): temperature sensitivity.  sigma_p = 0.0020 /K, dT = +20 K.
    {"id": "25.WE2e", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.0020, "dT": 20.0},
     "expect": 1.040811, "tol": 1e-4},

    # pi_K = sigma_p / (1 - n) = 0.0020 / 0.65 = 3.0769e-3 /K, so +6.35 % over
    # 20 K -- roughly twice the effect of the +-2 % lot variation.
    {"id": "25.WE2f", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.0020, "n": 0.35},
     "expect": 3.0769e-3, "tol": 1e-3},

    # --- Problem N4: n = 0.42, r = 10.5 mm/s at 6.0 MPa, rho = 1810, c* = 1540
    {"id": "25.N4a", "fn": "vieille_burn_rate",
     "args": {"a": 1.49404e-5, "p": 6.0e6, "n": 0.42},
     "expect": 0.0105, "tol": 0.002},

    {"id": "25.N4b", "fn": "solid_equilibrium_pressure",
     "args": {"a": 1.49404e-5, "n": 0.42, "rho_p": 1810.0,
              "Ab": 205.01, "At": 1.0, "c_star_val": 1540.0},
     "expect": 6.0e6, "tol": 0.005},

    # Lot 3.0 % low in a: p_c -> 5.69 MPa (-5.12 %).  a' = 0.97 * 1.49404e-5.
    {"id": "25.N4c", "fn": "solid_equilibrium_pressure",
     "args": {"a": 1.449219e-5, "n": 0.42, "rho_p": 1810.0,
              "Ab": 205.01, "At": 1.0, "c_star_val": 1540.0},
     "expect": 5.6930e6, "tol": 0.005},

    # --- Problem N5: pi_K for that propellant, sigma_p = 0.0025 /K, n = 0.42
    {"id": "25.N5a", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.0025, "n": 0.42},
     "expect": 4.3103e-3, "tol": 1e-3},

    # --- Quiz Q3: n = 0.30, lot 2.5 % high in a -> p_c +3.59 %.
    # Same nominal operating point as WE2 (5.00 MPa, 8.00 mm/s, rho 1770,
    # c* 1520), so K_n = p / (r rho c*) = 232.31 regardless of n; only the
    # Vieille coefficient changes: a = 0.008 / (5e6)^0.30 = 7.8235e-5.
    {"id": "25.Q3a", "fn": "solid_equilibrium_pressure",
     "args": {"a": 7.8235e-5, "n": 0.30, "rho_p": 1770.0,
              "Ab": 232.31, "At": 1.0, "c_star_val": 1520.0},
     "expect": 5.0e6, "tol": 0.005},

    {"id": "25.Q3b", "fn": "solid_equilibrium_pressure",
     "args": {"a": 8.01909e-5, "n": 0.30, "rho_p": 1770.0,
              "Ab": 232.31, "At": 1.0, "c_star_val": 1520.0},
     "expect": 5.1795e6, "tol": 0.005},
]

# ---------------------------------------------------------------------------
# Examples with no library counterpart
# ---------------------------------------------------------------------------
#
# WE1 -- line throughput.  Pure integer/rate arithmetic (Eqs. 3.1, 3.2, 3.6);
#   no rocket.py function applies.
#     N_b        = ceil(11770 / 1800)                    = 7 batches
#     N_mixers   = ceil(7 / floor(8.0 / 4.0))            = 4 mixers
#     cast bay   = 1 / ((8.0 + 4.0) / 24)                = 2.000 motors/day
#     cure pits  = 6 / 7.0                               = 0.857 motors/day
#     radiograph = 2 * (16.0 / 8.0)                      = 4.000 motors/day
#     Ndot       = 0.85 * min(...)                       = 0.729 motors/day
#                                                        ~ 21.9 motors/month
#     pits to saturate the cast bay = ceil(2.000 * 7.0 / 0.85) = 17
#
# Eq. 3.3 -- bore hoop strain of a case-bonded grain.  Derived in the module
#   from incompressibility; not in rocket.py.
#     eps_theta = 1.5 * (b^2/a_i^2 - 1) * (alpha*dT + eps_chem_vol/3)
#   Module numbers: a_i = 0.15 m, b = 0.50 m, alpha = 1.0e-4 /K, dT = 97 K
#     -> 1.5 * 10.111 * 9.70e-3 = 0.1471  (14.7 %)
#   Raising cure by 17 K (dT = 114 K) -> 0.1729 (17.3 %).
#   Problem N3: a_i = 0.10, b = 0.40, alpha = 9.5e-5, dT = 105 K,
#     eps_chem_vol = 0.008 -> 22.5 * 1.26417e-2 = 0.2844 (28.4 %); margin
#     0.22/0.2844 = 0.77, i.e. the grain fails as designed.
#   Quiz Q5: b/a_i = 2.5, alpha = 1.0e-4, dT = 105 K -> 7.875 * 1.05e-2
#     = 0.0827 (8.3 %).
#
# WE3 -- void detectability vs burning surface.  Geometry and a mass balance.
#     d_v      = 3 * 1.0 mm                       = 3.0 mm
#     S_v      = pi * d_v^2                       = 2.827e-5 m^2
#     mdot     = 11770 / 63.3                     = 185.9 kg/s
#     A_b      = mdot / (rho_p * r)               = 13.1 m^2   (r = 8.0 mm/s)
#     S_v/A_b  = 2.2e-6 ; dp/p = 1.538 * that     = 3.3e-6
#     void for 1 % of A_b: d = sqrt(0.131/pi)     = 0.204 m
#     0.5 % porosity of 11770 kg                  = 58.9 kg, -0.51 % impulse
#
# Eq. 3.4 -- radiographic contrast.  dI/I = mu * dx.
#     N6: mu = 4.3 /m, x = 0.85 m -> transmission exp(-3.655) = 2.6e-2;
#         dI/I = 0.015 -> dx = 3.5 mm.  CT: 4 voxels * 1.5 mm = 6.0 mm.
#
# Eq. 3.5 -- Arrhenius acceleration factor.  Not in rocket.py.
#     N9: Ea = 95 kJ/mol, T1 = 293.15 K, T2 = 323.15 K
#         -> exp((95000/8.31446)(1/293.15 - 1/323.15)) = exp(3.618) = 37.3
#         20 yr / 37.3 = 0.537 yr = 6.4 months.
#     Module text: Ea = 80 kJ/mol, 25 C vs 40 C -> exp(1.546) = 4.7.
#
# N8 -- mass-properties porosity check.  Arithmetic only.
#     9398 - 1041 = 8357 kg loaded; deficit 43 kg on 8400 -> phi = 0.51 %;
#     scale +-4 kg = 0.048 % of propellant mass, so 11x the resolution.
