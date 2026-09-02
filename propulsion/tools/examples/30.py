"""Worked-example inputs and expected outputs for Module 30 — Cold-Gas Hardware.

Each entry names a function in tools/rocket.py, its arguments, and the value
quoted in the module text. `tol` is a relative tolerance.

Examples whose arithmetic does not map onto a rocket.py function are described
in comments below the table, with the equation number they exercise.
"""

EXAMPLES = [
    # --- WE1: COPV vs monolithic titanium tank (§5.1) ---------------------
    # Ideal-gas nitrogen mass in the 5.00 L tank at 310 bar, 293.15 K.
    # The module then divides by Z = 1.17 to get the real stored mass, 1.52 kg;
    # the library call is the ideal figure only.
    {"id": "30.WE1", "fn": "stored_gas_mass",
     "args": {"p": 31.0e6, "V": 0.005, "R": 296.7987, "T": 293.15},
     "expect": 1.7815, "tol": 0.005},
    # Same call with the real-gas compressibility supplied explicitly.
    {"id": "30.WE1z", "fn": "stored_gas_mass",
     "args": {"p": 31.0e6, "V": 0.005, "R": 296.7987, "T": 293.15, "Z": 1.17},
     "expect": 1.5226, "tol": 0.005},

    # --- WE3: throat tolerance -> thrust uncertainty (§5.3) ---------------
    # Vacuum thrust coefficient, gamma = 1.4, eps = 50, pc = 5 bar, vacuum.
    {"id": "30.WE3.Cf", "fn": "Cf",
     "args": {"gamma": 1.4, "eps": 50.0, "p0": 5.0e5, "pa": 0.0},
     "expect": 1.72915, "tol": 0.001},
    # Choked mass flow through the 0.300 mm throat at 5 bar, 290 K.
    {"id": "30.WE3.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.4, "R": 296.7987, "T0": 290.0, "p0": 5.0e5,
              "At": 7.068583e-8},
     "expect": 8.2489e-5, "tol": 0.005},
    # Ideal vacuum Isp of the same nozzle (cross-check against the Module 28
    # frozen-flow table value of 76.8 s at T0 = 300 K).
    {"id": "30.WE3.isp", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.4, "R": 296.7987, "T0": 290.0, "eps": 50.0},
     "expect": 75.548, "tol": 0.005},

    # --- WE5: valve response -> impulse bit (§5.5) ------------------------
    # 50 mN thruster, t_cmd = 10 ms, t_op = 3 ms, t_cl = 2 ms => t_eff = 9 ms,
    # with equal 1 ms rise and fall.
    {"id": "30.WE5", "fn": "impulse_bit",
     "args": {"F": 0.050, "t_on": 0.009, "t_rise": 0.001, "t_fall": 0.001},
     "expect": 4.50e-4, "tol": 0.001},
    # The minimum reproducible bit: t_eff = 1 ms at the same thrust.
    {"id": "30.WE5.min", "fn": "impulse_bit",
     "args": {"F": 0.050, "t_on": 0.001, "t_rise": 0.001, "t_fall": 0.001},
     "expect": 5.0e-5, "tol": 0.001},

    # --- Problem N3: 0.150 mm throat, eps = 40, 3 bar ---------------------
    {"id": "30.N3.Cf", "fn": "Cf",
     "args": {"gamma": 1.4, "eps": 40.0, "p0": 3.0e5, "pa": 0.0},
     "expect": 1.72103, "tol": 0.001},

    # --- Problem N5: unequal rise and fall (30 mN, t_eff = 7.5 ms) --------
    {"id": "30.N5", "fn": "impulse_bit",
     "args": {"F": 0.030, "t_on": 0.0075, "t_rise": 0.0012, "t_fall": 0.0006},
     "expect": 2.160e-4, "tol": 0.001},

    # --- Problem N6: blowdown usable fraction, 250 -> 40 bar --------------
    {"id": "30.N6", "fn": "usable_fraction",
     "args": {"p_i": 250.0e5, "p_f": 40.0e5, "isothermal": True},
     "expect": 0.840, "tol": 0.001},
]

# ---------------------------------------------------------------------------
# Examples with no rocket.py counterpart (computed inline in the module text):
#
# 30.WE1 tank sizing      — Eq. 3.1 membrane thickness t = p_b r / (2 sigma)
#                           and Eq. 3.2 PV/W = p V / (m g0). Sphere of 5.00 L:
#                           r = 0.10608 m, A = 0.14140 m^2, p_b = 46.5 MPa.
#                           Ti-6Al-4V: t = 2.740 mm, m = 2.06 kg (with +20 %
#                           for boss and knuckle), PV/W = 7.67e3 m.
#                           Type III COPV: t_ov = 1.028 mm, m = 0.604 kg
#                           (with +25 %), PV/W = 2.62e4 m. Ratio 3.41.
#
# 30.WE2 leak budget      — 0.0600 kg over 9.4673e7 s = 6.34e-10 kg/s;
#                           rho_std(N2) = 1.2498e-3 g/cm^3 => 1.825 scc/h
#                           total; 0.152 scc/h per thruster seat; helium
#                           equivalent x sqrt(28.014/4.003) = 2.645 gives
#                           1.12e-4 scc/s GHe.
#
# 30.WE3 uncertainty      — dA/A = 2 dD/D = 6.67 %; RSS with +/-2 % on pc and
#                           +/-2 % on Cd gives 7.24 %. Throat Reynolds number
#                           Re_t = rho* a* Dt / mu* = 2.26e4 (Eq. 3.9), and
#                           Cd = 1 - 3/sqrt(Re) = 0.980 (Eq. 3.9b).
#                           Misalignment: atan(0.050/3.0) = 0.955 deg gives
#                           1.25e-4 N m on a 0.15 m arm at 50 mN.
#
# 30.WE4 solenoid         — Eq. 3.7: F = mu0 N^2 I^2 A_p / (2 g^2) = 25.6 N at
#                           N = 800, I = 0.45 A, A_p = 2.827e-5 m^2, g = 0.30 mm.
#                           Seat force p A_seat = 1.57 N at 20 bar, 23.6 N at
#                           300 bar on a 1.0 mm seat. Eq. 3.8: t_elec =
#                           (L/R) ln[1/(1 - Ipi R/V)] = 0.77 ms for L = 30 mH,
#                           R = 40 ohm, V = 28 V, Ipi = 0.45 A. Hold current
#                           0.075 A at a 0.05 mm gap; 19.6 W -> 0.40 W.
#
# 30.thermal              — Eq. 3.10: stored gas at constant volume gives
#                           dp/p = dT/T = 23 % for 263 -> 323 K. R-236fa with
#                           dH_vap = 23.1 kJ/mol (Trouton, Tb = 271.7 K) gives
#                           dH/(RT) = 9.3 at 300 K and ~37 % per 10 K.
#
# 30.regulator            — Eq. 3.6 droop and SPE = A_seat/A_s. For k = 5000
#                           N/m, 25 mm diaphragm, 1.0 mm seat, mdot = 4.71e-4
#                           kg/s: lift 16.0 um and droop 0.0016 bar at 50 bar
#                           inlet. SPE = (1/25)^2 = 1.6e-3 => 0.4 bar shift
#                           over a 250 bar inlet decay.
# ---------------------------------------------------------------------------
