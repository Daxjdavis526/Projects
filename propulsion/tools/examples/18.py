"""
Module 18 — Engine Testing and Instrumentation.

Every entry below reproduces a number printed in
part2-liquid/18-testing.md or part2-liquid/18-testing-key.md. `fn` names a
function in tools/rocket.py; `args` are its keyword arguments; `expect` is the
value in the text; `tol` is a RELATIVE tolerance.

Run with tools/check_examples.py.

--------------------------------------------------------------------------
Examples whose arithmetic is not a single library call
--------------------------------------------------------------------------

18.WE1  The hot-fire reduction is a chain, not one call:
          mdot        = 26.80 + 11.60                      = 38.40 kg/s
          MR          = 26.80 / 11.60                      = 2.310
          Mc          = mach_from_area_ratio(1.20, 4.0, subsonic)   [18.WE1.a]
          p_ns/p_inj  = (1+0.1*Mc^2)^6 / (1+1.2*Mc^2)      = 0.98694
          p_ns        = 0.98694 * 6.550e6                  = 6.4645e6 Pa
          c*_meas     = p_ns * At / mdot
                      = 6.4645e6 * 1.0029e-2 / 38.40       = 1688.4 m/s
          Cf_meas     = F / (p_ns * At) = 99100 / 64832    = 1.5285
          Isp_meas    = 99100 / (38.40 * 9.80665)          = 263.2 s
          c*_ideal    = c_star(1.20, 361.4983, 3670)       [18.WE1.b] = 1776.1
          Cf_ideal    = Cf(1.20, 12, 6.4645e6, 101325)     [18.WE1.c] = 1.5764
          eta_c*      = 1688.4 / 1776.1                    = 0.9506
          eta_Cf      = 1.5285 / 1.5764                    = 0.9696
          eta_overall = 0.9506 * 0.9696                    = 0.9218
        The "wrong station" counter-example: p_inj * At / mdot = 1802.1 m/s,
        giving eta_c* = 1.015 (impossible), and Cf = 1.5090 -> eta_Cf = 0.9573.
        Exit-plane check [18.WE1.d]: Me = 3.405, pe = 63.7 kPa, pe/pa = 0.63.

18.WE2  The uncertainty budget. rocket.rss() and rocket.rel_unc_product() take
        *args and so cannot be registered through the keyword-only harness;
        they are exercised in the __main__ block at the bottom of this file.
          u_F/F      = rss(0.0020, 0.0025, 0.0010)          = 0.003354
          u_mdot_o   = 0.0050 * 26.80                       = 0.1340 kg/s
          u_mdot_f   = 0.0020 * 11.60                       = 0.0232 kg/s
          u_mdot     = rss(0.1340, 0.0232) = 0.1360 kg/s -> = 0.003541 rel
                       (a SUM: absolute uncertainties combine, not relative)
          u_Isp/Isp  = rel_unc_product(0.003354, 0.003541)  = 0.004878
          u_Isp      = 0.004878 * 263.2                     = 1.28 s
                       expanded at k=2: +-2.6 s
          u_At/At    = rel_unc_power(0.0010, 2)             [18.WE2.a] = 0.0020
          u_p/p      = rss(0.0025, 0.0015)                  = 0.002915
          u_c*/c*    = rel_unc_product(0.002915, 0.0020, 0.003541) = 0.005004
          u_c*       = 0.005004 * 1688.4                    = 8.4 m/s

18.WE3  First-order sensor response. No library function.
          tau = 0.35 s, Rdot = 400 K/s, T(0) = 700 K
          steady ramp lag        = Rdot * tau               = 140 K
          redline (900 K) crossing solves t + 0.35 e^(-t/0.35) = 0.85
                                 -> t = 0.816 s, T_true = 1026 K
          plus 0.18 s of remaining latency -> T_true = 1098 K at valve close
          compensation at t = 0.55 s: T_i = 809 K, dT_i/dt = 317 K/s,
                 T_true = 809 + 0.35*317 = 920 K  (exactly 700 + 400*0.55)

18.WE4  Acoustics of the measurement installation. No library function.
          f_1T   = 1.8412 * 1100 / (pi * 0.30)              = 2149 Hz
          f_1L   = 1100 / (2 * 0.50)                        = 1100 Hz
          f_1/4  = 353 / (4 * 3.0)                          = 29.4 Hz   (line A)
          A      = pi * (1.6e-3)^2 / 4                      = 2.011e-6 m^2
          f_H    = (353 / 2pi) * sqrt(2.011e-6/(1.0e-7*0.3005)) = 460 Hz (B)
          flush mount, L_eff = 4 mm: f_H = 460*sqrt(300.5/4) = 3990 Hz

18.N*/18.Q*  Problem and quiz inputs; the library halves are registered below.
          N1: Mc at eps_c = 3.0, gamma = 1.21  [18.N1.a] -> p_ns/p_inj = 0.97681
          N2: c*_ideal [18.N2.a], Cf_ideal [18.N2.b];
              mdot = 91.1 kg/s, MR = 2.301, c*_meas = 1699.7 m/s,
              Cf_meas = 1.5823, Isp = 274.2 s, eta_c* = 0.9531, eta_Cf = 0.9697
          N3: u_At/At [18.N3.a]; u_Isp/Isp = 0.004434 -> 1.22 s (k=2: 2.43 s)
          N7: q = FS/2^16; 20 MPa -> 305.2 Pa, 4 MPa -> 61.0 Pa
          N8: f_n = sqrt(2.5e7/1800)/(2 pi) = 18.8 Hz
          Q1: Mc at eps_c = 2.5, gamma = 1.19  [18.Q1.a] -> p_ns = 7.737 MPa
          Q3: Isp = 88000/(31.5*9.80665) = 284.9 s, u = 0.6946 %, k=2: +-3.96 s
          Q8: (1 + 17e-6*650)^2 = 1.02222 -> +2.22 %

SI units throughout: gamma dimensionless, R in J/(kg K), T0 in K, p in Pa,
areas in m^2, F in N.
"""

EXAMPLES = [
    # ---------------------------------------------------- WE1: hot-fire reduction
    # Chamber Mach at the nozzle entrance, contraction ratio 4.0 (Eq. 3.10)
    {"id": "18.WE1.a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 4.0, "supersonic": False},
     "expect": 0.149843, "tol": 1e-4},

    # Reference c* for LOX/RP-1 at MR 2.31: gamma 1.20, M 23.0 kg/kmol, Tc 3670 K
    {"id": "18.WE1.b", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 361.4983, "T0": 3670.0},
     "expect": 1776.05, "tol": 1e-4},

    # Ideal Cf at the measured p_c,ns and the test nozzle's area ratio
    {"id": "18.WE1.c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 12.0, "p0": 6.4645e6, "pa": 101325.0},
     "expect": 1.57644, "tol": 1e-3},

    # Exit Mach for the separation check (pe/pa = 0.63 > 0.4, nozzle runs full)
    {"id": "18.WE1.d", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 12.0},
     "expect": 3.40520, "tol": 1e-4},

    # ------------------------------------------------------ WE2: uncertainty
    # At = pi D^2 / 4, so a 0.10 % diameter uncertainty is 0.20 % on area
    {"id": "18.WE2.a", "fn": "rel_unc_power",
     "args": {"rel": 0.0010, "exponent": 2.0},
     "expect": 0.0020, "tol": 1e-9},

    # ------------------------------------------------------------- problems
    # N1: chamber Mach at contraction ratio 3.0, gamma 1.21
    {"id": "18.N1.a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.21, "eps": 3.0, "supersonic": False},
     "expect": 0.201576, "tol": 1e-4},

    # N2: reference c* at Tc = 3700 K
    {"id": "18.N2.a", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 361.4983, "T0": 3700.0},
     "expect": 1783.29, "tol": 1e-4},

    # N2: ideal Cf at eps = 16, p_c,ns = 9.8 MPa, sea level
    {"id": "18.N2.b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 9.8e6, "pa": 101325.0},
     "expect": 1.63174, "tol": 1e-3},

    # N2: exit Mach for the separation check (pe/pa = 0.655)
    {"id": "18.N2.c", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 16.0},
     "expect": 3.60414, "tol": 1e-4},

    # N3: 0.08 % on throat diameter -> 0.16 % on throat area
    {"id": "18.N3.a", "fn": "rel_unc_power",
     "args": {"rel": 0.0008, "exponent": 2.0},
     "expect": 0.0016, "tol": 1e-9},

    # ----------------------------------------------------------------- quiz
    # Q1: chamber Mach at contraction ratio 2.5, gamma 1.19
    {"id": "18.Q1.a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.19, "eps": 2.5, "supersonic": False},
     "expect": 0.244986, "tol": 1e-4},
]


if __name__ == "__main__":
    # rss() and rel_unc_product() are *args functions and cannot be driven by
    # the keyword-only harness, so they are checked here instead.
    import os
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import rocket as r

    def close(a, b, tol=1e-3):
        return abs(a - b) <= tol * abs(b)

    # WE2 step 1 — thrust
    uF = r.rss(0.0020, 0.0025, 0.0010)
    assert close(uF, 0.003354), uF
    # WE2 step 2 — total mass flow (a SUM: absolutes combine)
    um_abs = r.rss(0.0050 * 26.80, 0.0020 * 11.60)
    um = um_abs / 38.40
    assert close(um_abs, 0.13600, 1e-3), um_abs
    assert close(um, 0.003541), um
    # WE2 step 3 — Isp
    uIsp = r.rel_unc_product(uF, um)
    assert close(uIsp, 0.004878), uIsp
    assert close(uIsp * 263.16, 1.284, 1e-3)
    # WE2 steps 4-6 — c*
    uAt = r.rel_unc_power(0.0010, 2)
    up = r.rss(0.0025, 0.0015)
    assert close(up, 0.002915), up
    ucs = r.rel_unc_product(up, uAt, um)
    assert close(ucs, 0.005004), ucs
    assert close(ucs * 1688.4, 8.45, 1e-3)
    # N3
    umN = r.rss(0.0045 * 63.5, 0.0030 * 27.6) / 91.1
    assert close(umN, 0.003266), umN
    uIspN = r.rel_unc_product(0.0030, umN)
    assert close(uIspN, 0.004434), uIspN
    assert close(uIspN * 274.24, 1.216, 1e-3)
    ucsN = r.rel_unc_product(0.0020, r.rel_unc_power(0.0008, 2), umN)
    assert close(ucsN, 0.004150), ucsN
    # Q3
    uQ3 = r.rel_unc_product(0.0035, 0.0060)
    assert close(uQ3, 0.006946), uQ3
    assert close(uQ3 * 284.90 * 2, 3.958, 1e-3)
    print("18.py: all *args uncertainty checks pass")
