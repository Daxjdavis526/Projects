"""
Module 14 — Valves, Plumbing, and Engine Hardware.

Every entry below reproduces a number that appears in
part2-liquid/14-valves-plumbing.md or its key. `fn` names a function in
tools/rocket.py; `args` are its keyword arguments; `expect` is the value
printed in the text; `tol` is a RELATIVE tolerance.

Run with tools/check_examples.py (or any harness that imports EXAMPLES).

SI units throughout: areas m^2, densities kg/m^3, pressures Pa, mass flow
kg/s, R in J/(kg K), T in K.

--------------------------------------------------------------------------
Notes on examples whose arithmetic is NOT a single library call.

Module 14 introduces five relations that have no counterpart in
tools/rocket.py. They are pure closed-form arithmetic and are reproduced
here so the numbers in the text can be re-checked by hand or by pasting the
expressions below into a REPL. rocket.py is deliberately NOT extended for
them (this module may only append to its own examples file).

  Flow coefficient (Eq. 3.3, 3.4)
      Cv = Q[US gpm] * sqrt(SG / dp[psi])
      Kv = Q[m^3/h]  * sqrt(SG / dp[bar])
      Cv = 1.1561 * Kv
      CdA[m^2] = 1.698e-5 * Cv = 1.9632e-5 * Kv
      SG = rho / 999.0 ;  1 m^3/s = 15850.32 US gpm ; 1 psi = 6894.757 Pa

  Korteweg wave speed (Eq. 3.8)
      a = sqrt(Kf/rho) / sqrt(1 + Kf*D/(E*t))

  Joukowsky / Michaud surge (Eq. 3.7, 3.9)
      dp_J     = rho * a * dv                     (t_c <  2L/a)
      dp_slow  = 2 * rho * L * dv / t_c           (t_c >  2L/a)

  Thermal contraction and restraint (WE3)
      dL      = alpha_bar * L * dT
      sigma_r = E * alpha_bar * dT
      F       = sigma_r * pi * D_mean * t
      P_cr    = pi^2 * E * I / (K L)^2 , I = pi/64 (Do^4 - Di^4)

  Manifold maldistribution (Eq. 3.14)
      d(mdot)/mdot = Cd^2 / (2 * AR^2) ,  AR = A_manifold / sum(A_orifice)

  Relief/regulator area ratio (Eq. 3.13)
      CdA_relief / CdA_reg = (p_supply/p_relief) * sqrt(T_relief/T_supply)

--------------------------------------------------------------------------
WE1  Cv sizing of the main LOX valve for the Module 03 engine.
     mdot_ox = 129.6 kg/s, rho = 1140, dp = 0.30 bar.
       Q      = 0.113684 m^3/s = 409.26 m^3/h = 1801.9 US gpm
       SG     = 1.14114 ; dp = 4.3511 psi
       Cv     = 922.8 ; Kv = 798.2 ; Cv/Kv = 1.1561
       CdA    = 0.0156703 m^2 = 156.70 cm^2  (registered below via orifice_mdot)
       Cd=0.90 -> A = 174.11 cm^2 -> D = 148.9 mm
     100 mm line: A = 78.54 cm^2, v = 14.4747 m/s, 0.5 rho v^2 = 119.43 kPa.
       K = 0.07 -> dp = 8.36 kPa = 0.0836 bar ; implied Cv = 1745
       sigma = (45 - 1.0)/0.0836 bar = 526  (no cavitation)

WE2  Joukowsky surge, 100 ms vs 10 ms closure.
       a_f  = sqrt(0.94e9/1140)          = 908.05 m/s
       Kf D/(E t) = 0.235 -> a           = 817.11 m/s
       2L/a (L = 6.0 m)                  = 14.686 ms
       dp_J = 1140*817.11*14.4747        = 1.3483e7 Pa = 134.83 bar   (10 ms)
       dp   = 2*1140*6.0*14.4747/0.100   = 1.9801e6 Pa =  19.80 bar   (100 ms)
       hoop at t = 2 mm: 179.8 bar -> 450 MPa ; 64.8 bar -> 162 MPa

WE3  Thermal contraction, 6.0 m x 100 mm x 2 mm 304L, 293 -> 90 K.
       dL      = 1.40e-5*6.0*203         = 17.052 mm  (strain 2.842e-3)
       sigma_r = 200e9*2.842e-3          = 568.4 MPa
       A_w     = pi*0.102*0.002          = 6.4088e-4 m^2
       F_el    = 364.3 kN ; F_yield(340 MPa) = 217.9 kN
       I       = pi/64*(0.104^4-0.100^4) = 8.3379e-7 m^4
       P_cr    = pi^2*200e9*I/6.0^2      = 45.72 kN   <-- governs
       bellows k=50 kN/m -> F = 852.6 N ; A_eff(105 mm) = 8.6590e-3 m^2
       pressure thrust at 45 bar         = 38.97 kN

WE4  Relief valve for a regulator failed open (registered below).
       R_He   = 8314.46/4.0026 = 2077.26 J/(kg K) ; Gamma(1.667) = 0.72623
       mdot   = 0.72623*2.0e-5*25e6/sqrt(2077.26*300) = 0.4600 kg/s
       CdA_relief = 0.4600*sqrt(2077.26*250)/(0.72623*24e5)
                  = 1.9018e-4 m^2 = 190.18 mm^2
       Cd = 0.85 -> A = 223.74 mm^2 -> D = 16.88 mm
       ratio  = 190.18/20 = 9.51 = (250/24)*sqrt(250/300)   [Eq. 3.13]

--------------------------------------------------------------------------
Problem/quiz arithmetic that is not a library call (key K1, K2):

  P9   Q = 60/1140 = 0.0526316 m^3/s ; Cv = 523.2, Kv = 452.6,
       CdA = 88.85 cm^2. D(12 m/s) = 74.7 mm -> take 75 mm, v = 11.913 m/s,
       0.5 rho v^2 = 80.90 kPa, K_required = 0.247.
  P10  a = 837.26 m/s ; 2L/a (4.5 m) = 10.75 ms ; dp_J = 113.7 bar ;
       t_c for 15 bar = 81.5 ms.
  P11  RP-1: a = 1135.96 m/s ; 2L/a = 7.92 ms ; dp_J = 109.6 bar ;
       impedance ratio 0.964 ; t_c for 15 bar = 57.9 ms.
  P12  dL = 25.58 mm ; sigma_r = 568.4 MPa ; A_w = 3.850 cm^2 ;
       F_el = 218.9 kN ; F_yield = 130.9 kN ; I = 2.8252e-7 m^4 ;
       P_cr = 6.885 kN  <-- governs by a wide margin.
  P13  A_eff = 0.0196067 m^2 ; F_p = 58.82 kN ; F_bellows = 1680 N.
  P15  sum A_or = 814.30 mm^2 ; AR = 4.619 ; A_m = 3761 mm^2 = 37.61 cm^2 ;
       annular height on a 250 mm dome = 4.79 mm.
  P16  f_s = 300-750 Hz for St = 0.2-0.5 at 18 m/s, q = 12 mm.
  P17  mdot_tot = 2279e3/(452.3*9.80665) = 513.80 kg/s ;
       mdot_ox = (6.03/7.03)*513.80 = 440.72 kg/s ; Q = 0.386593 m^3/s ;
       Cv = 2431, Kv = 2103, CdA = 412.8 cm^2 at dp = 0.5 bar.
  Q1   CdA = 1.698e-5*400 = 67.92 cm^2 ; Kv = 0.865*400 = 346.
  Q3   a = 837.26 m/s ; dp_J = 1140*837.26*11 = 104.5 bar.
  Q5   dL = 14.21 mm ; sigma_r = 568.4 MPa.
  Q7   ratio = (28e6/30e5)*sqrt(260/300) = 8.689 ; CdA_relief = 130.33 mm^2
       -> D = 13.97 mm at Cd = 0.85.
  Q9   maldistribution = 0.78^2/(2*2.5^2) = 4.87 %.
"""

# Helium: R = R_u / M = 8314.46 / 4.0026 = 2077.2648 J/(kg K)
R_HE = 8314.46 / 4.0026

EXAMPLES = [
    # ------------------------------------------------------------- theory
    # Gamma(gamma) for helium, used in Eq. 3.12 and 3.13 (section 3.12)
    {"id": "14.T1", "fn": "gamma_function", "args": {"gamma": 1.667},
     "expect": 0.72623, "tol": 1e-4},

    # ------------------------------------ WE1: main LOX valve, Module 03 engine
    # Cd A = 0.0156703 m^2 at dp = 0.30 bar; with Cd = 0.90, A = 0.0174114 m^2.
    # Check: orifice flow through that area reproduces the engine's LOX flow.
    {"id": "14.WE1", "fn": "orifice_mdot",
     "args": {"Cd": 0.90, "A": 0.0174114, "rho": 1140.0, "dp": 30000.0},
     "expect": 129.6, "tol": 1e-3},
    # The same valve at its actual full-open drop (K = 0.07 -> 8.36 kPa):
    # effective area is unchanged, the flow is set by the line, not the valve.

    # ------------------------------------------ WE4: relief valve sizing
    # Failed-open regulator: choked helium through CdA = 2.0e-5 m^2 at 25 MPa, 300 K
    {"id": "14.WE4.a", "fn": "choked_mdot",
     "args": {"gamma": 1.667, "R": R_HE, "T0": 300.0, "p0": 25.0e6,
              "At": 2.0e-5},
     "expect": 0.4600, "tol": 1e-3},
    # Relief valve passing the same flow at 24 bar, 250 K, with CdA = 1.9018e-4 m^2
    {"id": "14.WE4.b", "fn": "choked_mdot",
     "args": {"gamma": 1.667, "R": R_HE, "T0": 250.0, "p0": 24.0e5,
              "At": 1.9018e-4},
     "expect": 0.4600, "tol": 2e-3},

    # --------------------------------------------------------------- problems
    # P9: required effective area for 60 kg/s LOX at 0.20 bar (Cd absorbed, Cd=1)
    {"id": "14.P9", "fn": "orifice_mdot",
     "args": {"Cd": 1.0, "A": 0.0088852, "rho": 1140.0, "dp": 20000.0},
     "expect": 60.0, "tol": 1e-3},

    # P14: regulator with CdA = 12 mm^2 failed open from 31 MPa, 290 K
    {"id": "14.P14.a", "fn": "choked_mdot",
     "args": {"gamma": 1.667, "R": R_HE, "T0": 290.0, "p0": 31.0e6,
              "At": 1.2e-5},
     "expect": 0.34808, "tol": 1e-3},
    # relief valve at 16.5 bar, 240 K, CdA = 2.0510e-4 m^2 passes the same flow
    {"id": "14.P14.b", "fn": "choked_mdot",
     "args": {"gamma": 1.667, "R": R_HE, "T0": 240.0, "p0": 16.5e5,
              "At": 2.0510e-4},
     "expect": 0.34808, "tol": 2e-3},

    # P17: RS-25 at 109% — total flow from F_vac and Isp_vac
    # mdot = F/(Isp g0); registered through the c_eff/Isp relation:
    # Isp = 452.3 s  <->  c = 4435.7 m/s, and mdot = 2279e3/4435.7 = 513.80 kg/s
    {"id": "14.P17", "fn": "isp_from_c", "args": {"c_eff": 4435.75},
     "expect": 452.3, "tol": 1e-3},

    # ------------------------------------------------------------------ quiz
    # Q7: 15 mm^2 regulator seat failed open from 28 MPa, 300 K
    {"id": "14.Q7.a", "fn": "choked_mdot",
     "args": {"gamma": 1.667, "R": R_HE, "T0": 300.0, "p0": 28.0e6,
              "At": 1.5e-5},
     "expect": 0.38638, "tol": 1e-3},
    # relief at 30 bar, 260 K with CdA = 1.30333e-4 m^2
    {"id": "14.Q7.b", "fn": "choked_mdot",
     "args": {"gamma": 1.667, "R": R_HE, "T0": 260.0, "p0": 30.0e5,
              "At": 1.30333e-4},
     "expect": 0.38638, "tol": 2e-3},
]
