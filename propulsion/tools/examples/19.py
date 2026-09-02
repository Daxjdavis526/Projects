"""Module 19 — Solid Propellant Fundamentals: worked-example check data.

Each entry names a function in ``tools/rocket.py``, its arguments, and the
value quoted in the module text.  ``tol`` is relative.

Examples whose arithmetic does not map onto a single library function are
described in comments rather than entries:

* **19.1 step 1** — bulk density of a bipropellant,
  ``rho = (1+MR)/(1/rho_f + MR/rho_o)``.  There is no library function for
  this; the values used downstream are LOX/RP-1 at MR 2.34 -> 1016.62 kg/m^3
  and LOX/LH2 at MR 6.03 -> 362.20 kg/m^3 (LOX 1141, RP-1 810, LH2 70.8).
* **19.1 step 4** — propellant volume for a given total impulse,
  ``V = I_tot/(g0 * rho*Isp)``.  Trivial division; results 215 / 288 / 623 m^3
  for 1e9 N.s.
* **19.3** — the two-phase bracketing model (condensed mass fraction from Al
  loading, mixture cp and effective gamma, equilibrium versus fully-lagging
  exhaust velocity).  Not in the library; it is a bounding model, not a
  predictive one, and is written out step by step in the module.  Key numbers:
  xi = 0.302 at 16 % Al, c_eq = 2240 m/s, c_lag = 1806 m/s, bracket 19.4 %,
  loss 1.9 % at a coupling efficiency lambda = 0.90.
"""

EXAMPLES = [
    # --- WE 19.1: density impulse ------------------------------------------
    {"id": "19.WE1a", "fn": "density_isp",
     "args": {"rho": 1770.0, "isp": 268.0}, "expect": 474360.0, "tol": 0.001},
    {"id": "19.WE1b", "fn": "density_isp",
     "args": {"rho": 1016.62, "isp": 348.0}, "expect": 353783.8, "tol": 0.001},
    {"id": "19.WE1c", "fn": "density_isp",
     "args": {"rho": 362.20, "isp": 452.3}, "expect": 163823.1, "tol": 0.001},

    # --- WE 19.2: ideal Isp of an SRB-class APCP ---------------------------
    # R = Ru/Mbar = 8314.46/27.5
    {"id": "19.WE2.R", "fn": "R_specific",
     "args": {"M": 27.5}, "expect": 302.344, "tol": 0.001},
    {"id": "19.WE2.cstar", "fn": "c_star",
     "args": {"gamma": 1.18, "R": 302.344, "T0": 3400.0},
     "expect": 1572.85, "tol": 0.001},
    {"id": "19.WE2.Cf_sl", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 7.72, "p0": 6.25e6, "pa": 101325.0},
     "expect": 1.59368, "tol": 0.001},
    {"id": "19.WE2.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 7.72, "p0": 6.25e6, "pa": 0.0},
     "expect": 1.71884, "tol": 0.001},
    # Isp_sl = 255.60 s, Isp_vac = 275.68 s; published 242 s SL / 268 s vac
    # give efficiencies 0.947 and 0.972.
    {"id": "19.WE2.Isp_sl", "fn": "isp_from_c",
     "args": {"c_eff": 1572.85 * 1.59368}, "expect": 255.60, "tol": 0.002},
    {"id": "19.WE2.Isp_vac", "fn": "isp_from_c",
     "args": {"c_eff": 1572.85 * 1.71884}, "expect": 275.68, "tol": 0.002},

    # --- WE 19.4: what aluminium is worth ----------------------------------
    # unmetallised AP/HTPB: Tc 2900 K, Mbar 25, gamma 1.24
    {"id": "19.WE4.R_noAl", "fn": "R_specific",
     "args": {"M": 25.0}, "expect": 332.578, "tol": 0.001},
    {"id": "19.WE4.cstar_noAl", "fn": "c_star",
     "args": {"gamma": 1.24, "R": 332.578, "T0": 2900.0},
     "expect": 1496.65, "tol": 0.001},
    {"id": "19.WE4.Cf_noAl_e50", "fn": "Cf",
     "args": {"gamma": 1.24, "eps": 50.0, "p0": 6.25e6, "pa": 0.0},
     "expect": 1.85939, "tol": 0.001},
    {"id": "19.WE4.Cf_Al_e50", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 50.0, "p0": 6.25e6, "pa": 0.0},
     "expect": 1.92580, "tol": 0.001},
    # Ideal vacuum Isp at eps = 50: 283.77 s unmetallised, 308.87 s aluminized.
    {"id": "19.WE4.Isp_noAl_e50", "fn": "isp_from_c",
     "args": {"c_eff": 1496.65 * 1.85939}, "expect": 283.77, "tol": 0.002},
    {"id": "19.WE4.Isp_Al_e50", "fn": "isp_from_c",
     "args": {"c_eff": 1572.85 * 1.92580}, "expect": 308.87, "tol": 0.002},
    # Charging the aluminized case the 1.9 % two-phase loss of WE 19.3 leaves
    # 303.0 s, still +19.2 s over the unmetallised propellant.
]
