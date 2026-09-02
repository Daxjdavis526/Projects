"""Worked-example inputs and expected outputs for Module 09 — Nozzles.

Each entry names a function in ``tools/rocket.py``, its arguments, and the
value printed in the module or key text.  ``tol`` is relative.

Conventions used throughout this module
---------------------------------------
* Vacuum thrust coefficients are computed with ``Cf(gamma, eps, p0, pa=0.0)``.
  Note that ``Cf`` with ``pa=0`` is a function of ``gamma`` and ``eps`` ONLY —
  ``p0`` cancels identically.  Several entries below pass ``p0=1e7`` purely as
  a placeholder; WE4 (RL10B-2) depends on exactly this property, because that
  engine's chamber pressure is not reliably published.
* ``mach_from_area_ratio`` is the supersonic root.

Examples whose arithmetic does NOT map onto a library call
----------------------------------------------------------
* **09.WE1 geometry** — conical length (Eq. 3.7), throat-arc endpoints
  (Eq. 3.3), the Rao parabolic control point (Eq. 3.8), convergent length, and
  wetted areas are all plane geometry on the contour and there is deliberately
  no library function for them; the pedagogical content is the construction.
  For the record, with r_t = 0.0996653 m, eps = 16, R_d = 0.382 r_t,
  theta_n = 22 deg, theta_e = 11 deg:
      L_cone(15 deg, R_d = 1.5 r_t) = 1.13555 m
      L_80%                          = 0.90844 m
      N  = (0.014262, 0.102438) m
      Q  = (0.598166, 0.338350) m
      E  = (0.908440, 0.398661) m
      L_convergent (beta = 30 deg, eps_c = 2.5) = 0.140377 m
      wetted area, 15 deg cone   = 1.8086 m^2
      wetted area, 80% bell      = 1.5699 m^2   (86.8% of the cone)
      wetted area, 100% bell     = 1.9557 m^2  (108.1% of the cone)

* **Standard-atmosphere altitude conversions** (WE2 step 4, P5, Q5) use the
  1976 US Standard Atmosphere; there is no atmosphere model in rocket.py.
  Troposphere: h = (T0/L)[1 - (pa/p0)^(R_air L / g0)] with T0 = 288.15 K,
  L = 0.0065 K/m, R_air = 287.05 J/(kg K), p0 = 101325 Pa.
      WE2:  pa = 50337 Pa -> h = 5.525 km
      P5 :  pa = 31903 Pa -> h = 8.750 km
      Q5 :  pa = 58940 Pa -> h = 4.342 km

* **The side-load estimates (WE3, P6)** use Eq. 3.14,
  F_side = 2 * dp * r_bar * dx, which is three multiplications and has no
  library entry.  The numbers quoted:
      WE3 case A (FSS wander): dp = 73216 Pa, r = 1.0204 m, dx = 0.0510 m
                               -> F_side = 7.62 kN
      WE3 case B (FSS/RSS)   : dp = 93482 Pa, r = 1.110 m,  dx = 0.847 m
                               -> F_side = 176 kN
      P6                     : dp = 86126 Pa, r = 0.95 m,   dx = 0.60 m
                               -> F_side = 98.2 kN

* **The divergence efficiency of a cone** is (1 + cos alpha)/2, one line of
  arithmetic; lambda(15 deg) = 0.982963.
"""

EXAMPLES = [
    # --- WE1: full nozzle geometry, Module 03's 500 kN LOX/RP-1 engine ----
    # gamma = 1.20, pc = 10 MPa, eps = 16, c* = 1689 m/s, At = 0.031206 m^2.
    {"id": "09.WE1a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 16.0},
     "expect": 3.60436, "tol": 0.0005},
    {"id": "09.WE1b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 1.0e7, "pa": 0.0},
     "expect": 1.79708, "tol": 0.0005},
    {"id": "09.WE1c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 1.0e7, "pa": 101325.0},
     "expect": 1.63496, "tol": 0.0005},
    # Route 2 throat sizing, Eq. 3.2, with the Module 03 delivered Cf = 1.602
    {"id": "09.WE1d", "fn": "throat_area_from_thrust",
     "args": {"F": 500000.0, "p0": 1.0e7, "Cf_val": 1.602},
     "expect": 0.0312110, "tol": 0.0005},

    # --- WE2: break-even altitude, eps = 16 vs 25 -------------------------
    {"id": "09.WE2a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 25.0},
     "expect": 3.91277, "tol": 0.0005},
    {"id": "09.WE2b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 25.0, "p0": 1.0e7, "pa": 0.0},
     "expect": 1.84238, "tol": 0.0005},
    {"id": "09.WE2c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 25.0, "p0": 1.0e7, "pa": 101325.0},
     "expect": 1.58913, "tol": 0.0005},
    # Separation check at sea level for the eps = 25 case: Schmucker gives
    # 31.02 kPa against an exit pressure of 38.04 kPa (attached, by 23%),
    # while Summerfield's 40.53 kPa says separated.  The criteria disagree
    # about the ANSWER, not merely the number.
    {"id": "09.WE2d", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.91277},
     "expect": 31023.0, "tol": 0.002},
    {"id": "09.WE2e", "fn": "summerfield_separation_pressure",
     "args": {"p0": 101325.0, "frac": 0.4},
     "expect": 40530.0, "tol": 0.001},
    # Break-even ambient pressure, Eq. 3.12:
    #   pa_BE = pc (Cf_vac(25) - Cf_vac(16)) / (25 - 16)
    #         = 1e7 * 0.0453034 / 9 = 50337 Pa  ->  h = 5.525 km

    # --- WE3: RS-25 separation and side load at sea level ----------------
    # Ae = pi (1.2)^2 = 4.5239 m^2; eps = 77.5 -> At = 0.058373 m^2,
    # Dt = 272.6 mm.  Exit Mach 4.7066, exit pressure 18.68 kPa at 20.64 MPa.
    {"id": "09.WE3a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 77.5},
     "expect": 4.70663, "tol": 0.0005},
    {"id": "09.WE3b", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 69.0},
     "expect": 4.62372, "tol": 0.0005},
    # The separation station solves p_wall(M) = p_sep(M) simultaneously; the
    # root is M_sep = 4.4762, which the following two entries bracket by
    # evaluating both sides at the root (they must agree to ~0.1%).
    {"id": "09.WE3c", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.476185},
     "expect": 28108.5, "tol": 0.002},
    {"id": "09.WE3d", "fn": "area_ratio",
     "args": {"gamma": 1.20, "Mach": 4.476185},
     "expect": 56.038, "tol": 0.001},
    # Start-transient sweep (module table): the separation station at 20% and
    # 50% of full chamber pressure.
    {"id": "09.WE3e", "fn": "area_ratio",
     "args": {"gamma": 1.20, "Mach": 3.505417},
     "expect": 13.870, "tol": 0.002},
    {"id": "09.WE3f", "fn": "area_ratio",
     "args": {"gamma": 1.20, "Mach": 4.054418},
     "expect": 30.668, "tol": 0.002},

    # --- WE4: RL10B-2, Isp gain from the extendable extension ------------
    # The whole point: Cf with pa = 0 does not depend on p0, so the RL10B-2's
    # unpublished chamber pressure does not block the calculation.  The two
    # entries below are the SAME area ratio at chamber pressures differing by
    # 34%; they must return identical values.
    {"id": "09.WE4a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 77.0, "p0": 4.4e6, "pa": 0.0},
     "expect": 1.934464, "tol": 0.0005},
    {"id": "09.WE4b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 77.0, "p0": 3.28e6, "pa": 0.0},
     "expect": 1.934464, "tol": 0.0005},
    {"id": "09.WE4c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 85.0, "p0": 4.4e6, "pa": 0.0},
     "expect": 1.941334, "tol": 0.0005},
    {"id": "09.WE4d", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 285.0, "p0": 4.4e6, "pa": 0.0},
     "expect": 2.012887, "tol": 0.0005},
    {"id": "09.WE4e", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 280.0, "p0": 4.4e6, "pa": 0.0},
     "expect": 2.011985, "tol": 0.0005},
    # Isp ratios anchored on the published 465.5 s at eps = 285:
    #   eps = 77  -> 465.5 * 1.934464/2.012887 = 447.4 s  (+18.1 s gain)
    #   eps = 85  -> 465.5 * 1.941334/2.012887 = 448.9 s  (+16.6 s gain)
    #   eps = 280 vs 285 differs by 0.21 s -- immaterial.
    # Geometric cross-check from the published 2.1 m exit diameter:
    #   Ae = 3.4636 m^2, At = Ae/285 = 0.012153 m^2, Dt = 124.4 mm, and
    #   pc = F/(Cf At) = 110100/(2.012887 * 0.012153) = 45.0 bar, consistent
    #   with (but NOT a source for) the ~44 bar the reference file flags.

    # --- Problem-set regression (key K1) ---------------------------------
    # P1/P2: Vinci-like, 180 kN, 60 bar, eps = 240, c* = 2290 m/s
    {"id": "09.P1a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 240.0},
     "expect": 5.538435, "tol": 0.0005},
    {"id": "09.P1b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 240.0, "p0": 6.0e6, "pa": 0.0},
     "expect": 2.003964, "tol": 0.0005},
    {"id": "09.P1c", "fn": "throat_area_from_thrust",
     "args": {"F": 180000.0, "p0": 6.0e6, "Cf_val": 2.003964},
     "expect": 0.01497033, "tol": 0.0005},
    {"id": "09.P2a", "fn": "isp_from_c",
     "args": {"c_eff": 2290.0 * 2.003964},
     "expect": 467.956, "tol": 0.0005},
    {"id": "09.P2b", "fn": "isp_from_c",
     "args": {"c_eff": 0.975 * 2290.0 * 2.003964},
     "expect": 456.257, "tol": 0.0005},

    # P3: largest eps at sea level, pc = 70 bar.  Summerfield needs
    # pe >= 40530 Pa -> Me = 3.68763 -> eps = 18.05.  Schmucker's
    # simultaneous root is Me = 3.82121 -> eps = 21.90 (21.3% larger).
    {"id": "09.P3a", "fn": "mach_from_pressure_ratio",
     "args": {"gamma": 1.20, "p0_p": 7.0e6 / 40530.0},
     "expect": 3.687633, "tol": 0.0005},
    {"id": "09.P3b", "fn": "area_ratio",
     "args": {"gamma": 1.20, "Mach": 3.687633},
     "expect": 18.0497, "tol": 0.001},
    {"id": "09.P3c", "fn": "area_ratio",
     "args": {"gamma": 1.20, "Mach": 3.821215},
     "expect": 21.9000, "tol": 0.001},
    {"id": "09.P3d", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.821215},
     "expect": 31572.5, "tol": 0.002},

    # P5: break-even eps = 20 vs 40 at pc = 100 bar -> pa_BE = 31903 Pa,
    # h = 8.75 km.  NOTE: eps = 40 is SEPARATED at sea level on both
    # criteria (pe = 20.87 kPa vs Schmucker 29.24 kPa), so the sea-level
    # thrust computed from the attached-flow Cf is not physical.
    {"id": "09.P5a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 20.0, "p0": 1.0e7, "pa": 0.0},
     "expect": 1.820468, "tol": 0.0005},
    {"id": "09.P5b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 40.0, "p0": 1.0e7, "pa": 0.0},
     "expect": 1.884275, "tol": 0.0005},
    {"id": "09.P5c", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.239402},
     "expect": 29244.5, "tol": 0.002},

    # P7: sea-level exit pressures of four real engines, gamma = 1.20.
    {"id": "09.P7a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 21.5},
     "expect": 3.808074, "tol": 0.0005},
    {"id": "09.P7b", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.604355},
     "expect": 32981.0, "tol": 0.002},

    # P8: 0.4 mm throat recession on a 60 mm throat -> eps 16 -> 15.789,
    # Cf_vac 1.79708 -> 1.79564 (-0.08%).
    {"id": "09.P8a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 15.7888, "p0": 1.0e7, "pa": 0.0},
     "expect": 1.795638, "tol": 0.0005},

    # --- Quiz regression (key K2) ----------------------------------------
    # Q4: gamma = 1.20, eps = 36, pc = 80 bar
    {"id": "09.Q4a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 36.0},
     "expect": 4.165889, "tol": 0.0005},
    {"id": "09.Q4b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 36.0, "p0": 8.0e6, "pa": 0.0},
     "expect": 1.875351, "tol": 0.0005},
    {"id": "09.Q4c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 36.0, "p0": 8.0e6, "pa": 101325.0},
     "expect": 1.419388, "tol": 0.0005},
    {"id": "09.Q4d", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.165889},
     "expect": 29621.8, "tol": 0.002},

    # Q5: break-even eps = 12 vs 22 at pc = 90 bar -> pa_BE = 58940 Pa,
    # h = 4.342 km.
    {"id": "09.Q5a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 12.0, "p0": 9.0e6, "pa": 0.0},
     "expect": 1.764512, "tol": 0.0005},
    {"id": "09.Q5b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 22.0, "p0": 9.0e6, "pa": 0.0},
     "expect": 1.830001, "tol": 0.0005},

    # Q8: the 280-vs-285 dispute is worth 0.21 s and can be dismissed.
    {"id": "09.Q8a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 285.0, "p0": 1.0e7, "pa": 0.0},
     "expect": 2.012887, "tol": 0.0005},

    # --- Trade study T1 (key K3): methalox upper stage, gamma = 1.16 ------
    # 250 kN vacuum, pc = 120 bar, c* = 1850 m/s, eta_n = 0.975.
    {"id": "09.T1A", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 100.0, "p0": 1.2e7, "pa": 0.0},
     "expect": 2.010235, "tol": 0.0005},
    {"id": "09.T1B", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 150.0, "p0": 1.2e7, "pa": 0.0},
     "expect": 2.041017, "tol": 0.0005},
    {"id": "09.T1Cstow", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 90.0, "p0": 1.2e7, "pa": 0.0},
     "expect": 2.001729, "tol": 0.0005},
    {"id": "09.T1Cdep", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 260.0, "p0": 1.2e7, "pa": 0.0},
     "expect": 2.078807, "tol": 0.0005},
    {"id": "09.T1D", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 60.0, "p0": 1.2e7, "pa": 0.0},
     "expect": 1.967184, "tol": 0.0005},
]
