"""
Worked-example checks for Module 24 — Solid Rocket Nozzles.

Every entry whose arithmetic maps onto a `tools/rocket.py` function is listed
in EXAMPLES below. Examples whose arithmetic does not map to a library
function (two-phase particle lag, transient conduction stack-up, Bartz plus a
radiation term) are described in comments with the exact inputs and expected
outputs so they can still be reproduced by hand.

Generic booster used throughout the module:
    n = 0.35, rho_p = 1770 kg/m^3, c* = 1550 m/s, gamma = 1.18,
    a = 4.243e-5 m/s/Pa^0.35  (r_b = 10.0 mm/s at 6.0 MPa),
    r_t0 = 0.300 m -> A_t0 = 0.282743 m^2, eps0 = 16.0 -> A_e = 4.52389 m^2,
    K_n0 = 218.70 -> A_b = 61.836 m^2 (neutral grain),
    web time 120 s, action time 130 s, 18 % Al.
"""

A_NOZ = 4.2427462899525784e-05   # m/s/Pa^0.35
AB = 61.83561264583518           # m^2, neutral burning area
AT0 = 0.2827433388230814         # m^2, pi * 0.300^2
ATF = 0.30581519527104484        # m^2, pi * 0.312^2 after 120 s at 0.10 mm/s

EXAMPLES = [
    # --- WE1: throat erosion -> chamber-pressure decay (module 5.1) ---
    # Design point: K_n = 218.70 reproduces p_c = 6.00 MPa.
    {"id": "24.WE1a", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_NOZ, "n": 0.35, "rho_p": 1770.0, "Ab": AB, "At": AT0,
              "c_star_val": 1550.0},
     "expect": 6.0e6, "tol": 1e-6},
    # After 120 s of erosion at 0.10 mm/s the throat is 0.312 m: p_c = 5.318 MPa
    # (ratio 0.8863, matching the closed form Eq. 3.11 (1.040)^(-2/0.65)).
    {"id": "24.WE1b", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_NOZ, "n": 0.35, "rho_p": 1770.0, "Ab": AB, "At": ATF,
              "c_star_val": 1550.0},
     "expect": 5317909.9, "tol": 1e-5},
    # Burn rate falls with pressure: 10.00 -> 9.586 mm/s.
    {"id": "24.WE1c", "fn": "vieille_burn_rate",
     "args": {"a": A_NOZ, "p": 5317909.9, "n": 0.35},
     "expect": 9.5864e-3, "tol": 1e-4},
    # Thrust coefficients before and after: eps 16.0 -> 14.79 as the throat opens.
    {"id": "24.WE1d", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 16.0, "p0": 6.0e6, "pa": 0.0},
     "expect": 1.81263, "tol": 1e-4},
    {"id": "24.WE1e", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 14.792899408284024, "p0": 5317909.9,
              "pa": 0.0},
     "expect": 1.80348, "tol": 1e-4},
    # Vacuum Isp falls 286.50 -> 285.05 s purely from the eroded area ratio.
    {"id": "24.WE1f", "fn": "isp_from_c",
     "args": {"c_eff": 1550.0 * 1.8126295693581382},
     "expect": 286.497, "tol": 1e-4},
    {"id": "24.WE1g", "fn": "isp_from_c",
     "args": {"c_eff": 1550.0 * 1.803477833449808},
     "expect": 285.051, "tol": 1e-4},

    # --- Module 6.3: Star 48B short vs long nozzle (real-motor check) ---
    # Published pair 286.2 s at eps 47.7 vs 292.2 s at eps 54.8-70.4 (conf C).
    # Ideal 1-D Cf says eps 54.8 buys only 1.8 s and eps 70.4 buys 4.8 s from
    # the 47.7 baseline, so the 6.0 s published gain supports the 70.4 figure.
    {"id": "24.RE1a", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 47.7, "p0": 4.0e6, "pa": 0.0},
     "expect": 1.92180, "tol": 1e-4},
    {"id": "24.RE1b", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 54.8, "p0": 4.0e6, "pa": 0.0},
     "expect": 1.93353, "tol": 1e-4},
    {"id": "24.RE1c", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 70.4, "p0": 4.0e6, "pa": 0.0},
     "expect": 1.95383, "tol": 1e-4},

    # --- Module 6.1 / problem N8: RSRM consistency check ---
    # Cf_SL at eps 7.72, p_c 6.25 MPa, p_a 101325 Pa -> A_t = 1.2550 m^2 from
    # the 12.5 MN /motor sea-level liftoff thrust (D_t = 1.264 m). Inference
    # only: eps 7.72 is confidence C and the thrust/pressure qualifiers differ.
    {"id": "24.RE2a", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 7.72, "p0": 6.25e6, "pa": 101325.0},
     "expect": 1.59368, "tol": 1e-4},
    {"id": "24.RE2b", "fn": "throat_area_from_thrust",
     "args": {"F": 12.5e6, "p0": 6.25e6, "Cf_val": 1.5936838088884806},
     "expect": 1.25495, "tol": 1e-4},

    # --- Problem N1 / N2 / Q5: erosion-decay closed forms ---
    # These are pure algebra on Eq. 3.11 / 3.12 and have no library function:
    #   N1: r_t0 0.150 m, sdot 0.15 mm/s, 90 s -> x = 1.090,
    #       p_c ratio = x^(-2/0.65) = 0.7671, F ratio = x^(-0.70/0.65) = 0.9114.
    #   N2: hold p_c ratio >= 0.95 -> x = 0.95^(-0.325) = 1.01681,
    #       recession 2.52 mm, sdot = 0.028 mm/s (3D/4D C/C territory).
    #   Q5: r_t0 0.200 m, sdot 0.08 mm/s, 100 s -> x = 1.040,
    #       p_c ratio 0.8863, F ratio 0.9586.
    # Problem N6 checks the same Cf(70.4) above: implied c* = 292.2*g0/1.9538
    #       = 1467 m/s, i.e. the real Cf must be ~4 % below ideal.
    {"id": "24.N6", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 70.4, "p0": 4.0e6, "pa": 0.0},
     "expect": 1.95383, "tol": 1e-4},

    # --- Trade study T1: area-ratio table at p_c = 5.5 MPa, c* = 1520 m/s ---
    {"id": "24.T1a", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 25.0, "p0": 5.5e6, "pa": 0.0},
     "expect": 1.86107, "tol": 1e-4},
    {"id": "24.T1b", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 30.0, "p0": 5.5e6, "pa": 0.0},
     "expect": 1.87924, "tol": 1e-4},
    {"id": "24.T1c", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 45.0, "p0": 5.5e6, "pa": 0.0},
     "expect": 1.91668, "tol": 1e-4},
    {"id": "24.T1d", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 60.0, "p0": 5.5e6, "pa": 0.0},
     "expect": 1.94096, "tol": 1e-4},

    # --- Quiz Q9: eps 45 -> 68 at gamma 1.18 ---
    # Cf ratio 1.01795 -> +5.2 s from a 288 s baseline; the claimed 7.5 s
    # exceeds the ideal 1-D upper bound and must be challenged.
    {"id": "24.Q9", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 68.0, "p0": 4.0e6, "pa": 0.0},
     "expect": 1.95110, "tol": 1e-4},

    # --- Section 3.2 / problem N5: Bartz throat heat flux ---
    # Recovery temperature at the throat, T_c = 3400 K, gamma 1.18, r = 0.9.
    {"id": "24.HT1", "fn": "adiabatic_wall_T",
     "args": {"T0": 3400.0, "gamma": 1.18, "Mach": 1.0, "r": 0.9},
     "expect": 3371.93, "tol": 1e-4},
    # Generic booster throat, D_t = 0.60 m, p_c = 6.0 MPa: h_g = 9963 W/m^2K,
    # q_conv = 5.70 MW/m^2 against a 2800 K wall; the radiative term at
    # eps_r = 0.5 adds 3.79 MW/m^2 (5.67e-8 * 0.5 * 3400^4), i.e. 40 % of total.
    {"id": "24.HT2", "fn": "bartz_sigma",
     "args": {"gamma": 1.18, "Mach": 1.0, "Tw_over_T0": 2800.0 / 3400.0},
     "expect": 1.025706, "tol": 1e-5},
    {"id": "24.HT3", "fn": "bartz_hg",
     "args": {"Dt": 0.60, "mu0": 8.5e-5, "cp0": 1900.0, "Pr0": 0.50,
              "p0": 6.0e6, "c_star_val": 1550.0, "rc": 0.45, "A_ratio": 1.0,
              "sigma": 1.0257055771818135},
     "expect": 9962.55, "tol": 1e-4},
    {"id": "24.HT4", "fn": "heat_flux",
     "args": {"hg": 9962.554581840222, "Taw": 3371.9266055045878,
              "Twg": 2800.0},
     "expect": 5697850.0, "tol": 1e-5},
    # N5 uses D_t = 0.25 m, r_c = 0.19 m, sigma = 1.03:
    #   p_c =  6.0 MPa -> h_g = 1.1903e4, q_conv =  6.81 MW/m^2
    #   p_c = 12.0 MPa -> h_g = 2.0724e4, q_conv = 11.85 MW/m^2  (ratio 2^0.8)
    #   q_rad = 0.5*5.670e-8*(3400^4 - 2800^4) = 2.05 MW/m^2, pressure-invariant
    #   total ratio = 13.90/8.85 = 1.57, NOT 2^0.8 = 1.74.
    {"id": "24.N5a", "fn": "bartz_hg",
     "args": {"Dt": 0.25, "mu0": 8.5e-5, "cp0": 1900.0, "Pr0": 0.50,
              "p0": 6.0e6, "c_star_val": 1550.0, "rc": 0.19, "A_ratio": 1.0,
              "sigma": 1.03},
     "expect": 11902.88, "tol": 1e-4},
    {"id": "24.N5b", "fn": "bartz_hg",
     "args": {"Dt": 0.25, "mu0": 8.5e-5, "cp0": 1900.0, "Pr0": 0.50,
              "p0": 12.0e6, "c_star_val": 1550.0, "rc": 0.19, "A_ratio": 1.0,
              "sigma": 1.03},
     "expect": 20724.13, "tol": 1e-4},
]

# ---------------------------------------------------------------------------
# Examples with no library counterpart — reproduce by hand or with the
# snippets below. Inputs and expected outputs are given exactly.
# ---------------------------------------------------------------------------
#
# WE2 (module 5.2) — two-phase loss, 18 % Al, d_p = 5 um.
#   X = 0.18 * 101.96/(2*26.98) = 0.34012
#   tau_v,Stokes = 3000*(5e-6)^2/(18*8.5e-5) = 4.902e-5 s
#   t_res = 1.6/1825 = 8.767e-4 s ; du_g/dt = 1550/t_res = 1.768e6 m/s^2
#   Schiller-Naumann: tau_v = tau_Stokes/(1+0.15 Re_p^0.687), iterate ->
#       du = 53.5 m/s, Re_p = 7.87, tau_v = 3.03e-5 s, du/u_e = 2.06 %
#   velocity-lag loss  = X*du/u_e                    = 0.70 %
#   tau_T = 3000*(5e-6)^2*1300/(12*0.35) = 2.32e-5 s ; dT = 39.7 K
#   thermal loss       = 0.5*X*c_s*dT/(0.5*u_e^2)    = 0.26 %
#   total              = 0.96 %
#   sensitivity (same nozzle): d_p = 2 um -> 0.20 %, 5 um -> 0.96 %,
#       10 um -> 2.67 %, 15 um -> 4.81 % ; L = 0.4 m at 5 um -> 3.04 %
#   problem N3 (20 % Al, d_p = 8 um, L = 1.2 m): X = 0.37791,
#       Stokes-only du = 296 m/s at Re_p = 69.6 (invalid); corrected
#       du = 119 m/s at Re_p = 28.0, lag 4.58 %, velocity loss 1.73 %.
#
# WE3 (module 5.3) — ablative liner stack-up, carbon-cloth phenolic.
#   recession   = 1.5 * 0.06e-3 * 130                = 11.70 mm
#   erfc(eta) = (450-300)/(800-300) = 0.300 -> eta   = 0.7329
#   sqrt(alpha t) = sqrt(1.3e-7 * 250)               =  5.70 mm
#   delta_th  = 2*eta*sqrt(alpha t)                  =  8.36 mm
#   structural allowance                             =  2.00 mm
#   total 22.06 mm -> specify 23 mm
#   liner mass: frustum r 0.300 -> 1.200 m over 2.70 m axial, slant 2.846 m,
#       wetted area 13.41 m^2, rho 1450 kg/m^3 -> 447 kg at 23 mm.
#   problem N4 (silica phenolic): 1.4*0.12e-3*95 = 15.96 mm recession;
#       erfc(eta) = 0.21311 -> eta = 0.8804; sqrt(2.0e-7*185) = 6.083 mm;
#       delta_th = 10.71 mm; + 2 mm -> 28.67 mm -> specify 29 mm.
#
# WE1 step 5 — coupled erosion feedback, sdot = sdot0 (p_c/p_c0)^0.8,
#   integrated at dt = 0.01 s for 120 s: total recession 11.45 mm (vs 12.00 mm
#   at constant rate) and p_c(120)/p_c(0) = 0.891 (vs 0.886). The feedback is
#   stabilising and worth ~5 % of the recession.

if __name__ == "__main__":
    import os
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import rocket

    bad = 0
    for ex in EXAMPLES:
        got = getattr(rocket, ex["fn"])(**ex["args"])
        rel = abs(got - ex["expect"]) / abs(ex["expect"])
        ok = rel <= ex["tol"]
        bad += not ok
        print(f"{'ok  ' if ok else 'FAIL'} {ex['id']:10s} {ex['fn']:28s} "
              f"got {got:.6g} expect {ex['expect']:.6g} (rel {rel:.2e})")
    print(f"\n{len(EXAMPLES) - bad}/{len(EXAMPLES)} passed")
    sys.exit(1 if bad else 0)
