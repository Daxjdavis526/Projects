"""Whiteboard problems (Part VI) — registered inputs and expected outputs.

Every entry names a function in ``tools/rocket.py``, its arguments, and the
value quoted in ``part6-interview/whiteboard-problems-key.md``.  ``tol`` is
relative.  Run ``python3 tools/check_examples.py`` to recompute the set.

Standing conventions for this file
----------------------------------
* ``gamma = 1.20`` for LOX/RP-1 and generic hydrocarbon combustion gas,
  ``1.16`` for LOX/CH4, ``1.19`` for LOX/LH2, ``1.40`` for GN2 at 300 K.
* Vacuum thrust coefficients use ``Cf(gamma, eps, p0, pa=0.0)``.  With
  ``pa = 0`` this is a function of gamma and eps ONLY — ``p0`` cancels — so
  several entries pass a placeholder ``p0``.
* ``mach_from_area_ratio`` is always the supersonic root.
* The Bartz property recipe is the one fixed in Module 10 and reused here so
  that the whiteboard answers and the module's worked examples cannot drift
  apart:
      cp0 = gamma R/(gamma-1),  Pr0 = 4 gamma/(9 gamma - 5),
      mu0 = 1.0e-4 Pa s,  r_c = 1.5 * throat radius,  A/At = 1 at the throat,
      Twg assumed 800 K, T0 = 3600 K for LOX/RP-1.
  Bartz is +-20-30% at the throat at best; every number derived from it in the
  key is quoted as an order of magnitude, not a design load.

Arithmetic that deliberately has NO library entry
-------------------------------------------------
* **P1, P16, P17, P30 thrust closure** ``F = Cf * p0 * At`` — one
  multiplication.  The library gives Cf and (inversely) At; the product is
  left in the text.
      P1 : At = pi/4 (0.250)^2 = 0.04908739 m^2
           F_vac = 1.842383 * 1e7 * 0.04908739 = 904.4 kN
           F_SL  = 1.589071 * 1e7 * 0.04908739 = 780.0 kN
      P16: At = pi/4 (0.130)^2 = 0.01327323 m^2
           F_vac = 1.929420 * 3e7 * 0.01327323 = 768.3 kN
           F_SL  = 1.794320 * 3e7 * 0.01327323 = 714.5 kN
      P17: F_vac = 1.770591 * 1.1e7 * 0.09892306 = 1926.7 kN
      P30: F_vac = 250 kN by construction (At solved from it)

* **Areas and diameters from areas.** ``A = pi/4 D^2`` and
  ``D = 2 sqrt(A/pi)`` throughout; no library function, none wanted.
      P2  Dt = 205.5 mm at Cf = 1.884275 ; 210.3 mm at the assumed Cf = 1.80
      P17 Dt = 354.9 mm, Ae = 1.25018 m^2, De = 1.2617 m
      P19 De = 1.2997 m at eps 40, 1.8381 m at eps 80 (At = 0.03316926 m^2)
      P30 Dt = 136.4 mm, Ae = 0.657217 m^2, De = 0.9148 m, Dc = 215.6 mm

* **US 1976 standard atmosphere** (P4 break-even altitude).  Troposphere:
  h = (T0/L)[1 - (pa/p0)^(R_air L/g0)], T0 = 288.15 K, L = 0.0065 K/m,
  R_air = 287.05 J/(kg K), p0 = 101325 Pa.
      P4: pa_BE = 27109 Pa -> h = 9.835 km

* **P4 break-even ambient pressure** itself,
  pa_BE = p_c (Cf_vac(60) - Cf_vac(16)) / (60 - 16)
        = 1e7 * (1.916358 - 1.797080) / 44 = 27109 Pa.

* **P5 separation station** solves p_wall(M) = p_sep(M) simultaneously; the
  root is M_sep = 3.72894, and the two bracketing evaluations are registered
  below (they must agree to ~0.1%).

* **P10 pressure exponent by inversion.**  p_B/p_A = (A_tA/A_tB)^(1/(1-n)),
  so n = 1 - ln(A_tA/A_tB)/ln(p_B/p_A) = 1 - ln(1/1.05)/ln(6.49/7.00)
        = 0.35503.  Three logarithms; no library entry.

* **P25 burning-area step.**  A_b2/A_b1 = (p2/p1)^(1-n) = 1.12^0.65 = 1.07644,
  i.e. a 12% pressure step is a 7.6% burning-area step at n = 0.35.
  At n = 0.5 it is 5.83%; at n = 0.2 it is 9.49%.

* **P15 channel geometry and pressure drop.**  A_1 = 1.5e-3 * 3.0e-3 =
  4.5e-6 m^2, 200 channels -> 9.0e-4 m^2; D_h = 2wh/(w+h) = 2.0 mm;
  v = mdot/(rho A) = 50/(810 * 9.0e-4) = 68.59 m/s.  Darcy with f = 0.02 over
  L = 1.0 m: dp = f (L/D_h) (rho v^2 / 2) = 190.5 bar.  That is the answer:
  the channel is badly undersized.

* **P28 uncertainty propagation.**  mdot = mdot_o + mdot_f is a SUM, so the
  absolute uncertainties add in quadrature and are then divided by the total:
      u(mdot)/mdot = sqrt((0.010*2.3)^2 + (0.015*1.0)^2)/3.3 = 0.008321
      u(Isp)/Isp   = sqrt(0.005^2 + 0.008321^2) = 0.009708 -> 3.30 s on 340 s
  ``rocket.rss`` takes *args and so cannot be registered as a kwargs example.

* **P12 payload fraction.**  lambda = (1 - R eps_s)/(R (1 - eps_s)) with
  R = exp(dv/(Isp g0)) and eps_s the structural fraction.  R1 = 3.894719,
  R2 = 3.399606, lambda1 = 0.192128, lambda2 = 0.232774, product 0.044722.

* **P24 angular rate from one impulse bit.**  dOmega = I_bit * L / I_sc
  = 5.5e-4 * 0.10 / 0.05 = 1.10e-3 rad/s = 0.063 deg/s.

* **P26 gas-generator Isp penalty.**  4% of the flow leaving at ~40% of main
  Isp costs 0.04*(1-0.40) = 2.4%, i.e. 8.4 s on a 350 s vacuum engine.

* **P3 oxidiser/fuel split.**  mdot = 26.9925 kg/s, 400 s -> 10,797 kg.  At
  MR = 2.3 that is 7,525 kg LOX + 3,272 kg RP-1; at MR = 2.7, 7,879 + 2,918;
  at MR = 3.6 (methalox), 8,450 + 2,347.  Two divisions, no library entry.

* **P12 optimal split.**  Maximising lambda1*lambda2 over the dv split pushes
  stage-1 dv down to ~1.9 km/s (lambda = 0.0539) because the 450 s stage is
  always the cheaper place to put dv.  That optimum is not buildable — stage 1
  must lift the stack and clear the atmosphere — so the key quotes the stated
  4.0/5.4 split and names the constraint.  Scan only; no library entry.

* **P22 acoustic yardstick.**  With a_chamber = 1277.75 m/s (registered below),
  the first tangential mode of a 300 mm chamber is 1.841 a/(pi D) = 2.50 kHz and
  the first longitudinal of a 0.5 m chamber is a/2L = 1.28 kHz.  120 Hz is an
  order of magnitude below both: it is a feed-system chug, not an acoustic mode.
  A 3 m propellant line at c ~ 1300 m/s has a quarter-wave at 108 Hz, which is
  the right neighbourhood.

* **P30 chamber geometry.**  Ac = 2.5 At = 0.0365120 m^2 -> Dc = 215.6 mm, and
  Lc = Vc/Ac = 0.01460482/0.0365120 = 0.400 m at L* = 1.0 m.  Chamber gas
  density rho_c = p0/(R T0) = 9e6/(415.723*3500) = 6.1854 kg/m^3, and mdot =
  p0 At/c*_delivered = 72.719 kg/s; both feed the registered residence time.

* **P15 coolant-side film drop.**  Dittus-Boelter is registered below at
  k = 0.14 W/(m K), D_h = 2.0 mm, Re = 74,074, Pr = mu cp/k = 21.43 (RP-1,
  assumed properties [A]): h_c = 4.31e4 W/(m^2 K), so a 40 MW/m^2 flux needs a
  927 K film drop.  That is the second, independent reason the channel fails.
"""

import math

# ---- shared constants ------------------------------------------------------
G0 = 9.80665
GAM_HC = 1.20          # LOX/RP-1 and generic hydrocarbon combustion gas
GAM_CH4 = 1.16         # LOX/CH4
GAM_N2 = 1.40          # cold GN2 at 300 K

M_HC = 22.0            # kg/kmol, LOX/RP-1 chamber gas
R_HC = 8314.46 / M_HC  # 377.93 J/(kg K)
CP_HC = GAM_HC * R_HC / (GAM_HC - 1.0)          # 2267.58
PR_HC = 4.0 * GAM_HC / (9.0 * GAM_HC - 5.0)     # 0.827586
MU0 = 1.0e-4           # Pa s
T0_HC = 3600.0
CSTAR_HC_DEL = 1726.6221680805486                # 0.96 * ideal

AT_P2 = 0.03316925809960609    # P2/P19 throat area, m^2
AT_P30 = 0.014604818378826967  # P30 throat area, m^2

EXAMPLES = [
    # =====================================================================
    # Block A — thrust, throat, flow
    # =====================================================================
    # --- P1: pc = 100 bar, Dt = 250 mm, eps = 25 -------------------------
    {"id": "WB.P1a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 25.0, "p0": 1.0e7, "pa": 0.0},
     "expect": 1.842383, "tol": 0.0005},
    {"id": "WB.P1b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 25.0, "p0": 1.0e7, "pa": 101325.0},
     "expect": 1.589071, "tol": 0.0005},
    {"id": "WB.P1c", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 25.0},
     "expect": 3.912769, "tol": 0.0005},
    # exit pressure 38.04 kPa vs Schmucker 31.02 kPa: attached at sea level
    {"id": "WB.P1d", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.912769},
     "expect": 31022.6, "tol": 0.002},
    # pe = 1e7 / 262.862 = 38.04 kPa; Isp at the delivered LOX/RP-1 c*
    {"id": "WB.P1e", "fn": "p0_over_p",
     "args": {"gamma": 1.20, "Mach": 3.912769},
     "expect": 262.862, "tol": 0.002},
    {"id": "WB.P1f", "fn": "isp_from_c",
     "args": {"c_eff": 1726.6221680805486 * 1.842383},
     "expect": 324.382, "tol": 0.0005},
    {"id": "WB.P1g", "fn": "isp_from_c",
     "args": {"c_eff": 1726.6221680805486 * 1.589071},
     "expect": 279.782, "tol": 0.0005},

    # --- P2: 500 kN vacuum at 80 bar -------------------------------------
    # The candidate's assumed Cf = 1.80 gives At = 0.034722 m^2 (Dt 210.3 mm);
    # the honest eps = 40 value 1.884275 gives 0.033169 m^2 (Dt 205.5 mm).
    {"id": "WB.P2a", "fn": "throat_area_from_thrust",
     "args": {"F": 500000.0, "p0": 8.0e6, "Cf_val": 1.80},
     "expect": 0.03472222, "tol": 0.0005},
    {"id": "WB.P2b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 40.0, "p0": 8.0e6, "pa": 0.0},
     "expect": 1.884275, "tol": 0.0005},
    {"id": "WB.P2c", "fn": "throat_area_from_thrust",
     "args": {"F": 500000.0, "p0": 8.0e6, "Cf_val": 1.884275},
     "expect": 0.03316926, "tol": 0.0005},

    # --- P3: 90 kN vacuum at Isp 340 s -----------------------------------
    # mdot = F/(Isp g0); registered through the Isp identity Isp = c/g0 with
    # c = F/mdot: isp_from_c(90000/26.992488) = 340 s.
    {"id": "WB.P3", "fn": "isp_from_c",
     "args": {"c_eff": 90000.0 / 26.992487990592217},
     "expect": 340.0, "tol": 1e-6},

    # --- P16: methalox, 300 bar, Dt = 130 mm, eps = 40 -------------------
    {"id": "WB.P16a", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 40.0, "p0": 3.0e7, "pa": 0.0},
     "expect": 1.929420, "tol": 0.0005},
    {"id": "WB.P16b", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 40.0, "p0": 3.0e7, "pa": 101325.0},
     "expect": 1.794320, "tol": 0.0005},
    {"id": "WB.P16c", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.16, "eps": 40.0},
     "expect": 4.019137, "tol": 0.0005},
    # pe = 3e7 / p0_over_p(1.16, 4.019137) = 73.31 kPa -> attached, easily
    {"id": "WB.P16d", "fn": "p0_over_p",
     "args": {"gamma": 1.16, "Mach": 4.019137},
     "expect": 409.2, "tol": 0.002},
    # 73.31 kPa exit against a Schmucker separation pressure of 30.41 kPa
    {"id": "WB.P16e", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.019137},
     "expect": 30413.7, "tol": 0.002},
    # Isp at the delivered methalox c* of 0.96 * 1882.857 = 1807.54 m/s
    {"id": "WB.P16f", "fn": "isp_from_c",
     "args": {"c_eff": 0.96 * 1882.857 * 1.929420},
     "expect": 355.627, "tol": 0.0005},
    {"id": "WB.P16g", "fn": "isp_from_c",
     "args": {"c_eff": 0.96 * 1882.857 * 1.794320},
     "expect": 330.726, "tol": 0.0005},

    # --- P17: 1.8 MN SL at 110 bar, sea-level-optimum nozzle -------------
    {"id": "WB.P17a", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.20, "p0": 1.1e7, "pa": 101325.0},
     "expect": 12.63794, "tol": 0.001},
    {"id": "WB.P17b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 12.63794, "p0": 1.1e7, "pa": 101325.0},
     "expect": 1.654178, "tol": 0.0005},
    {"id": "WB.P17c", "fn": "throat_area_from_thrust",
     "args": {"F": 1.8e6, "p0": 1.1e7, "Cf_val": 1.654178},
     "expect": 0.09892306, "tol": 0.0005},
    {"id": "WB.P17d", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 12.63794, "p0": 1.1e7, "pa": 0.0},
     "expect": 1.770591, "tol": 0.0005},
    {"id": "WB.P17e", "fn": "isp_from_c",
     "args": {"c_eff": 1726.6221680805486 * 1.654178},
     "expect": 291.245, "tol": 0.0005},
    {"id": "WB.P17f", "fn": "isp_from_c",
     "args": {"c_eff": 1726.6221680805486 * 1.770591},
     "expect": 311.742, "tol": 0.0005},

    # --- P18: 7.6 MN at Isp_SL 282 s -------------------------------------
    # mdot = 2748.17 kg/s; 400 t / 2748.17 = 145.6 s
    {"id": "WB.P18", "fn": "isp_from_c",
     "args": {"c_eff": 7.6e6 / 2748.171354124913},
     "expect": 282.0, "tol": 1e-6},

    # =====================================================================
    # Block B — expansion ratio and altitude
    # =====================================================================
    # --- P4: eps 16 vs 60 at pc = 100 bar --------------------------------
    {"id": "WB.P4a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 1.0e7, "pa": 0.0},
     "expect": 1.797080, "tol": 0.0005},
    {"id": "WB.P4b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 60.0, "p0": 1.0e7, "pa": 0.0},
     "expect": 1.916358, "tol": 0.0005},
    {"id": "WB.P4c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 1.0e7, "pa": 101325.0},
     "expect": 1.634960, "tol": 0.0005},
    # The eps = 60 sea-level value is computed for the comparison and then
    # DISCARDED: the nozzle is separated on both criteria at sea level.
    {"id": "WB.P4d", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 60.0, "p0": 1.0e7, "pa": 101325.0},
     "expect": 1.308408, "tol": 0.0005},
    {"id": "WB.P4e", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 60.0},
     "expect": 4.524495, "tol": 0.0005},
    # exit pressure 12.49 kPa against a Schmucker separation pressure of
    # 27.89 kPa -> separated, by more than a factor of two
    {"id": "WB.P4f", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.524495},
     "expect": 27890.3, "tol": 0.002},
    # the three Isp values the sketch needs, at the delivered LOX/RP-1 c*
    {"id": "WB.P4g", "fn": "isp_from_c",
     "args": {"c_eff": 1726.6221680805486 * 1.634960},
     "expect": 287.862, "tol": 0.0005},
    {"id": "WB.P4h", "fn": "isp_from_c",
     "args": {"c_eff": 1726.6221680805486 * 1.797080},
     "expect": 316.406, "tol": 0.0005},
    {"id": "WB.P4i", "fn": "isp_from_c",
     "args": {"c_eff": 1726.6221680805486 * 1.916358},
     "expect": 337.406, "tol": 0.0005},

    # --- P5: eps = 150 upper stage at 60 bar, tested at sea level --------
    {"id": "WB.P5a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 150.0},
     "expect": 5.186491, "tol": 0.0005},
    {"id": "WB.P5b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 150.0, "p0": 6.0e6, "pa": 0.0},
     "expect": 1.977578, "tol": 0.0005},
    # simultaneous root p_wall(M) = p_sep(M) at M_sep = 3.728942:
    {"id": "WB.P5c", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.728942},
     "expect": 32152.7, "tol": 0.002},
    {"id": "WB.P5d", "fn": "area_ratio",
     "args": {"gamma": 1.20, "Mach": 3.728942},
     "expect": 19.1621, "tol": 0.001},
    # Summerfield's cruder rule: pe >= 0.4 pa -> eps ~ 16
    {"id": "WB.P5e", "fn": "summerfield_separation_pressure",
     "args": {"p0": 101325.0, "frac": 0.4},
     "expect": 40530.0, "tol": 0.001},
    {"id": "WB.P5f", "fn": "mach_from_pressure_ratio",
     "args": {"gamma": 1.20, "p0_p": 6.0e6 / 40530.0},
     "expect": 3.605561, "tol": 0.0005},
    {"id": "WB.P5g", "fn": "area_ratio",
     "args": {"gamma": 1.20, "Mach": 3.605561},
     "expect": 16.0279, "tol": 0.001},

    # --- P19: eps 40 -> 80 on a vacuum engine ----------------------------
    {"id": "WB.P19a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 80.0, "p0": 1.0e7, "pa": 0.0},
     "expect": 1.937137, "tol": 0.0005},
    # Isp at the delivered LOX/RP-1 c* of 1726.62 m/s: 331.75 s -> 341.06 s,
    # a gain of 9.3 s (+2.81%) for a 41% larger exit diameter.
    {"id": "WB.P19b", "fn": "isp_from_c",
     "args": {"c_eff": 1726.6221680805486 * 1.884275},
     "expect": 331.753, "tol": 0.0005},
    {"id": "WB.P19c", "fn": "isp_from_c",
     "args": {"c_eff": 1726.6221680805486 * 1.937137},
     "expect": 341.060, "tol": 0.0005},

    # =====================================================================
    # Block C — heat transfer and cooling
    # =====================================================================
    # --- P6: Bartz throat flux, LOX/RP-1, 100 bar, Dt = 200 mm -----------
    {"id": "WB.P6a", "fn": "R_specific",
     "args": {"M": 22.0}, "expect": 377.93, "tol": 1e-4},
    {"id": "WB.P6b", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 377.93, "T0": 3600.0},
     "expect": 1798.565, "tol": 0.0005},
    {"id": "WB.P6c", "fn": "bartz_sigma",
     "args": {"gamma": 1.20, "Mach": 1.0, "Tw_over_T0": 800.0 / 3600.0},
     "expect": 1.365054, "tol": 0.0005},
    {"id": "WB.P6d", "fn": "bartz_hg",
     "args": {"Dt": 0.200, "mu0": 1.0e-4, "cp0": 2267.58, "Pr0": 0.8275862,
              "p0": 1.0e7, "c_star_val": 1726.6221680805486, "rc": 0.150,
              "A_ratio": 1.0, "sigma": 1.365054},
     "expect": 20774.4, "tol": 0.001},
    {"id": "WB.P6e", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.20, "Mach": 1.0, "r": 0.9},
     "expect": 3567.273, "tol": 0.0005},
    {"id": "WB.P6f", "fn": "heat_flux",
     "args": {"hg": 20774.4, "Taw": 3567.273, "Twg": 800.0},
     "expect": 57.489e6, "tol": 0.001},

    # --- P20: same engine at 200 bar -------------------------------------
    {"id": "WB.P20a", "fn": "bartz_hg",
     "args": {"Dt": 0.200, "mu0": 1.0e-4, "cp0": 2267.58, "Pr0": 0.8275862,
              "p0": 2.0e7, "c_star_val": 1726.6221680805486, "rc": 0.150,
              "A_ratio": 1.0, "sigma": 1.365054},
     "expect": 36170.3, "tol": 0.001},
    {"id": "WB.P20b", "fn": "heat_flux",
     "args": {"hg": 36170.3, "Taw": 3567.273, "Twg": 800.0},
     "expect": 100.093e6, "tol": 0.001},
    # Sanity check against the Module 10 RS-25 case, same recipe:
    {"id": "WB.P20c", "fn": "bartz_hg",
     "args": {"Dt": 0.26925, "mu0": 1.0e-4, "cp0": 3857.39, "Pr0": 0.833625,
              "p0": 2.064e7, "c_star_val": 2287.25, "rc": 0.134625,
              "A_ratio": 1.0, "sigma": 1.36663},
     "expect": 49286.1, "tol": 0.001},

    # --- P15: regen channel sanity ---------------------------------------
    # v = 68.587 m/s, D_h = 2.0 mm, mu = 1.5e-3 Pa s -> Re = 7.4e4
    {"id": "WB.P15a", "fn": "reynolds",
     "args": {"rho": 810.0, "v": 68.58710562414267, "L": 2.0e-3,
              "mu": 1.5e-3},
     "expect": 74074.1, "tol": 0.001},
    # throat-band heat load: 40 MW/m^2 over pi * 0.2 * 0.05 = 0.031416 m^2
    {"id": "WB.P15b", "fn": "coolant_bulk_rise",
     "args": {"Q": 1.2566370614359175e6, "mdot": 50.0, "cp": 2000.0},
     "expect": 12.566, "tol": 0.001},
    # whole-jacket load, order 15 MW -> 150 K bulk rise (coking limit)
    {"id": "WB.P15c", "fn": "coolant_bulk_rise",
     "args": {"Q": 15.0e6, "mdot": 50.0, "cp": 2000.0},
     "expect": 150.0, "tol": 1e-6},
    # coolant-side film coefficient, RP-1 properties assumed [A]:
    # k = 0.14 W/(m K), cp = 2000 J/(kg K), mu = 1.5e-3 Pa s -> Pr = 21.43
    {"id": "WB.P15d", "fn": "dittus_boelter",
     "args": {"k": 0.14, "D": 2.0e-3, "Re": 74074.07, "Pr": 21.4286,
              "n": 0.4},
     "expect": 43147.6, "tol": 0.001},

    # =====================================================================
    # Block D — propellant and cycle choice
    # =====================================================================
    # --- P7 / P21: density impulse, rho_bulk * Isp_vac -------------------
    {"id": "WB.P7a", "fn": "density_isp",
     "args": {"rho": 360.0, "isp": 450.0}, "expect": 162000.0, "tol": 1e-9},
    {"id": "WB.P7b", "fn": "density_isp",
     "args": {"rho": 830.0, "isp": 360.0}, "expect": 298800.0, "tol": 1e-9},
    {"id": "WB.P7c", "fn": "density_isp",
     "args": {"rho": 1030.0, "isp": 340.0}, "expect": 350200.0, "tol": 1e-9},
    {"id": "WB.P7d", "fn": "density_isp",
     "args": {"rho": 1180.0, "isp": 330.0}, "expect": 389400.0, "tol": 1e-9},

    # =====================================================================
    # Block E — injector diagnosis
    # =====================================================================
    # --- P22: is 120 Hz an acoustic mode? --------------------------------
    # chamber speed of sound sets the yardstick; 1T of a 300 mm chamber is
    # 1.841 a/(pi D) = 2.50 kHz, twenty times the observed 120 Hz.
    {"id": "WB.P22", "fn": "a_sound",
     "args": {"gamma": 1.20, "R": 377.93, "T": 3600.0},
     "expect": 1277.755, "tol": 0.0005},

    # =====================================================================
    # Block F — cold gas
    # =====================================================================
    # --- P9: 12 kg 6U CubeSat, 25 m/s ------------------------------------
    {"id": "WB.P9a", "fn": "R_specific",
     "args": {"M": 28.014}, "expect": 296.797, "tol": 1e-4},
    {"id": "WB.P9b", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.40, "R": 296.7966, "T0": 300.0, "eps": 50.0},
     "expect": 76.839, "tol": 0.001},
    {"id": "WB.P9c", "fn": "propellant_for_dv",
     "args": {"isp": 69.15514, "m_final": 12.0, "dv": 25.0},
     "expect": 0.450615, "tol": 0.001},
    {"id": "WB.P9d", "fn": "usable_fraction",
     "args": {"p_i": 250.0e5, "p_f": 50.0e5, "isothermal": True},
     "expect": 0.80, "tol": 1e-9},
    # 0.5633 kg loaded at 250 bar, 293 K, ideal gas -> 1.96 L
    {"id": "WB.P9e", "fn": "stored_gas_mass",
     "args": {"p": 250.0e5, "V": 1.959305012754019e-3, "R": 296.7966,
              "T": 293.0, "Z": 1.0},
     "expect": 0.563269, "tol": 0.001},
    # the R-236fa alternative (MarCO's propellant), eps = 50, 293 K
    {"id": "WB.P9f", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.08, "R": 8314.46 / 152.04, "T0": 293.0,
              "eps": 50.0},
     "expect": 42.7375, "tol": 0.002},
    {"id": "WB.P9g", "fn": "propellant_for_dv",
     "args": {"isp": 38.46376, "m_final": 12.0, "dv": 25.0},
     "expect": 0.822281, "tol": 0.001},

    # --- P24: minimum impulse bit ----------------------------------------
    # trapezoid, 4 ms rise / 6 ms fall on a 10 ms command
    {"id": "WB.P24a", "fn": "impulse_bit",
     "args": {"F": 0.050, "t_on": 0.010, "t_rise": 0.004, "t_fall": 0.006},
     "expect": 5.5e-4, "tol": 1e-9},
    {"id": "WB.P24b", "fn": "impulse_bit",
     "args": {"F": 0.050, "t_on": 0.010, "t_rise": 0.0, "t_fall": 0.0},
     "expect": 5.0e-4, "tol": 1e-9},

    # =====================================================================
    # Block G — solid motors
    # =====================================================================
    # --- P10: n = 0.355 recovered from the two firings -------------------
    # Forward check: a generic AP composite at the recovered exponent
    # reproduces the 5% throat step as a 7.3% pressure drop.
    {"id": "WB.P10a", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.2e-5, "n": 0.355, "rho_p": 1750.0,
              "Ab": 2.7488935718910694, "At": 7.853981633974483e-3,
              "c_star_val": 1500.0},
     "expect": 8465844.0, "tol": 0.001},
    {"id": "WB.P10b", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.2e-5, "n": 0.355, "rho_p": 1750.0,
              "Ab": 2.7488935718910694, "At": 1.05 * 7.853981633974483e-3,
              "c_star_val": 1500.0},
     "expect": 7849078.0, "tol": 0.001},
    # ratio 0.927147 vs (6.49/7.00) = 0.927143 -- four figures -- the inversion is
    # self-consistent.
    {"id": "WB.P10c", "fn": "vieille_burn_rate",
     "args": {"a": 3.2e-5, "p": 7.0e6, "n": 0.355},
     "expect": 8.61311e-3, "tol": 0.001},

    # --- P25: 12% pressure step at n = 0.35 ------------------------------
    # A 7.64% burning-area step reproduces the observed 12% pressure step.
    {"id": "WB.P25a", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.2e-5, "n": 0.35, "rho_p": 1750.0,
              "Ab": 2.7488935718910694, "At": 7.853981633974483e-3,
              "c_star_val": 1500.0},
     "expect": 7488253.0, "tol": 1e-4},
    {"id": "WB.P25b", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.2e-5, "n": 0.35, "rho_p": 1750.0,
              "Ab": 1.0764446775323464 * 2.7488935718910694,
              "At": 7.853981633974483e-3, "c_star_val": 1500.0},
     "expect": 8386843.0, "tol": 1e-3},
    # temperature sensitivity is the competing hypothesis and it does not fit:
    # pi_K = 0.003077 /K, so a 12% step needs a 37 K jump mid-burn.
    {"id": "WB.P25c", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.0020, "n": 0.35},
     "expect": 3.0769e-3, "tol": 1e-4},

    # =====================================================================
    # Block H — feed system
    # =====================================================================
    # --- P13: turbopump shaft power --------------------------------------
    # 500 kN vac at Isp_vac 311 s -> mdot 163.94 kg/s; MR 2.3 -> 114.26 ox,
    # 49.68 fuel; pump rise 1.7 pc - 3.5 bar inlet = 166.5 bar; eta 0.70.
    {"id": "WB.P13a", "fn": "pump_power",
     "args": {"mdot": 114.26226687368387, "dp": 1.665e7, "rho": 1140.0,
              "eta": 0.70},
     "expect": 2.38404e6, "tol": 0.001},
    {"id": "WB.P13b", "fn": "pump_power",
     "args": {"mdot": 49.67924646681908, "dp": 1.665e7, "rho": 810.0,
              "eta": 0.70},
     "expect": 1.45884e6, "tol": 0.001},
    {"id": "WB.P13c", "fn": "pump_head",
     "args": {"dp": 1.665e7, "rho": 810.0},
     "expect": 2096.08, "tol": 0.001},
    {"id": "WB.P13d", "fn": "pump_head",
     "args": {"dp": 1.665e7, "rho": 1140.0},
     "expect": 1489.32, "tol": 0.001},

    # --- P14: NPSH on the LOX pump ---------------------------------------
    # p_tank 3.5 bar, p_vap 1.0 bar (LOX near its 90.2 K NBP), rho 1140,
    # 8 m of head, 0.5 bar of line loss, 1 g:
    {"id": "WB.P14a", "fn": "npsh_available",
     "args": {"p_tank": 3.5e5, "p_vapor": 1.0e5, "rho": 1140.0, "z": 8.0,
              "dp_line": 0.5e5, "accel": 9.80665},
     "expect": 25.8898, "tol": 0.001},
    # warm LOX (92 K, p_vap 1.4 bar) eats 3.6 m of it:
    {"id": "WB.P14b", "fn": "npsh_available",
     "args": {"p_tank": 3.5e5, "p_vapor": 1.4e5, "rho": 1140.0, "z": 8.0,
              "dp_line": 0.5e5, "accel": 9.80665},
     "expect": 22.3118, "tol": 0.001},
    # on the pad, before liftoff, with no acceleration head at all:
    {"id": "WB.P14c", "fn": "npsh_available",
     "args": {"p_tank": 3.5e5, "p_vapor": 1.0e5, "rho": 1140.0, "z": 0.0,
              "dp_line": 0.5e5, "accel": 9.80665},
     "expect": 17.8898, "tol": 0.001},
    # suction specific speed at 6000 rpm on Q = 0.1002 m^3/s:
    {"id": "WB.P14d", "fn": "suction_specific_speed_SI",
     "args": {"omega": 628.3185307179587, "Q": 0.1002046783625731,
              "NPSH": 25.8898},
     "expect": 3.12706, "tol": 0.001},

    # =====================================================================
    # Block I — vehicle, test, measurement
    # =====================================================================
    # --- P12: two-stage payload fraction ---------------------------------
    # dv split 4.0 / 5.4 km/s; mass ratios 3.8947 and 3.3996
    {"id": "WB.P12a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 300.0, "m0": 3.8947193285497432, "mf": 1.0},
     "expect": 4000.0, "tol": 1e-6},
    {"id": "WB.P12b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 450.0, "m0": 3.399605704299625, "mf": 1.0},
     "expect": 5400.0, "tol": 1e-6},
    # single-stage sanity: the same 9.4 km/s on 300 s alone needs e^3.19
    {"id": "WB.P12c", "fn": "propellant_for_dv",
     "args": {"isp": 300.0, "m_final": 1.0, "dv": 9400.0},
     "expect": 23.4129, "tol": 0.001},

    # --- P30: size the whole engine, 250 kN vac LOX/CH4 at 90 bar --------
    {"id": "WB.P30a", "fn": "R_specific",
     "args": {"M": 20.0}, "expect": 415.723, "tol": 1e-5},
    {"id": "WB.P30b", "fn": "c_star",
     "args": {"gamma": 1.16, "R": 415.723, "T0": 3500.0},
     "expect": 1882.857, "tol": 0.0005},
    {"id": "WB.P30c", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 45.0, "p0": 9.0e6, "pa": 0.0},
     "expect": 1.940775, "tol": 0.0005},
    # eta_c* = 0.96, eta_nozzle = 0.98
    {"id": "WB.P30d", "fn": "throat_area_from_thrust",
     "args": {"F": 250000.0, "p0": 9.0e6, "Cf_val": 0.98 * 1.940775},
     "expect": 0.01460482, "tol": 0.0005},
    {"id": "WB.P30e", "fn": "isp_from_c",
     "args": {"c_eff": 0.96 * 1882.857 * 0.98 * 1.940775},
     "expect": 350.566, "tol": 0.001},
    {"id": "WB.P30f", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.0, "At": 0.014604818378826967},
     "expect": 0.01460482, "tol": 1e-6},
    # rho_c = 9e6/(415.723*3500) = 6.1854 kg/m^3, mdot = 72.719 kg/s
    {"id": "WB.P30g", "fn": "residence_time",
     "args": {"Vc": 0.014604818378826967, "rho_c": 6.185437349938714,
              "mdot": 72.71935757914082},
     "expect": 1.24227e-3, "tol": 0.001},
]
