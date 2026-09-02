"""Worked-example inputs and expected outputs for Module 08 — Ignition systems.

Each entry names a function in ``tools/rocket.py``, its arguments, and the
value printed in the module or key text.  ``tol`` is relative.

Reference engine used throughout module 08 (fictional, deliberately generic):

    RE-100, LOX/LCH4 upper stage
      F_vac  = 100 kN          Isp_vac = 370 s
      pc     = 60 bar          MR      = 3.4
      c*     = 1800 m/s        L*      = 1.1 m
    ->  mdot = F/(Isp g0)              = 27.5599 kg/s
        At   = mdot c*/pc              = 8.267969e-3 m^2  (Dt = 102.6 mm)
        Vc   = L* At                   = 9.094766e-3 m^3

    Transient product gas assumed for the accumulation burn:
        M = 22 kg/kmol -> R = 377.93 J/(kg K),  gamma = 1.15,
        dh_c = 10.5 MJ/kg of mixture,
        T_v  = (gamma-1) dh_c / R = 4167.44 K,
        Gamma(1.15) = 0.638638,  c*_v = 1965.10 m/s,
        tau_e = Vc/(Gamma^2 c*_v At) = 1.3725 ms.

Several of this module's results are pure arithmetic on the module's own
equations and have no library counterpart.  They are recorded here so the
numbers in the text are regression-checkable by hand:

* **08.WE1 — accumulation and overpressure.**  Eq. 3.1-3.3.
      mdot_st = phi mdot        = 0.15 * 27.5599  = 4.13398 kg/s
      m_acc   = mdot_st tau_d   = 4.13398 * 0.250 = 1.033496 kg
      p_CV    = m_acc R T_v / Vc                  = 178.98 MPa  (29.83 pc)
      vent factor (tau_e/t_b)(1-exp(-t_b/tau_e)):
          t_b = 1 ms -> 0.71014 -> p_peak = 127.10 MPa (21.18 pc)
          t_b = 5 ms -> 0.26731 -> p_peak =  47.84 MPa ( 7.97 pc)
      delay budget at p_lim = 1.5 pc = 9 MPa:
          unvented   m_acc,max = 0.051970 kg -> tau_d,max = 12.57 ms
          t_b = 5 ms m_acc,max = 0.194421 kg -> tau_d,max = 47.03 ms

* **08.WE2 — the naive "heat the incoming flow" criterion.**
      q_ox = 213 + 0.95*(900-90)   = 982.5  kJ/kg
      q_f  = 510 + 2.50*(900-111)  = 2482.5 kJ/kg
      q_mix = 0.7727 q_ox + 0.2273 q_f = 1323.45 kJ/kg
      P     = 4.13398 * 1.32345e6      = 5.4711 MW
      h_use = 2.3e3*(1400-900)         = 1.15 MJ/kg
      mdot_ig = 4.757 kg/s = 17.3 % of main flow  -> criterion rejected.
    The empirical sizing that follows (f_ig = 1 %, mdot_ig = 0.275599 kg/s)
    is registered below as 08.WE2a/b.

* **08.WE3 — restart chilldown.**
      Q_ox = 95*300*(250-100)          = 4.275 MJ
      h_eff,ox = 213 + 0.95*(170-90)   = 289 kJ/kg
      m_ch,ox  = Q_ox/(0.55*289e3)     = 26.90 kg
      Q_f  = 70*300*(250-115)          = 2.835 MJ
      h_eff,f  = 510 + 2.20*(185-111)  = 672.8 kJ/kg
      m_ch,f   = Q_f/(0.55*672.8e3)    = 7.66 kg
      total 34.56 kg/restart; a 30 s burn is 27.5599*30 = 826.8 kg,
      so chilldown is 4.18 % of the burn; 4 restarts -> 138.2 kg.
      Settling: 25,000 kg at 0.02 g0 for 8 s, Isp 290 s -> 13.79 kg
                                  0.05 g0            -> 34.48 kg.

* **08.P1 — cold hypergolic thruster.**  R = 8314.46/21 = 395.927,
      T_v = 0.2*6.2e6/395.927 = 3131.9 K,
      tau_d = 4 ms  -> m_acc = 6.00e-4 kg -> p_CV =  4.96 MPa (5.5 pc)
      tau_d = 45 ms -> m_acc = 6.75e-3 kg -> p_CV = 55.80 MPa ( 62 pc)
      p_lim = 3 MPa -> m_acc,max = 3.629e-4 kg -> tau_d,max = 2.42 ms.

* **08.P2 — tank-head start.**  phi = 0.04, tau_d = 60 ms:
      m_acc = 0.0661438 kg, p_CV = 11.454 MPa (1.909 pc),
      p_peak(t_b = 5 ms) = 3.062 MPa (0.510 pc).

* **08.P4 — igniter-fluid budget.**  5 starts * 1.3 margin = 6.5 -> 7 starts
      required; 7*1.8 = 12.6 kg needed against 12 kg carried
      (12/1.8 = 6.67 -> 6 usable starts).  Does not close.
      Torch alternative: 0.28*0.4 = 0.112 kg/start -> 107 starts on the same
      mass, but the propellant comes from the main tanks, so the real answer
      is that the constraint disappears.

* **08.P7 — valve sequencing.**  Ox commanded 0.120 s, 35 ms dead + 90 ms
      stroke -> motion 0.155 s, 20 % area 0.173 s, full 0.245 s.
      Fuel commanded 0.200 s, 15 ms dead + 40 ms stroke -> motion 0.215 s,
      20 % area 0.223 s, full 0.255 s.  Commanded lead 80 ms; achieved
      60 ms at motion, 50 ms at 20 % area, 10 ms at full open.

* **08.P8 — chamber volume is not the hard-start variable.**
      L* = 0.7 m -> Vc = 5.787579e-3 m^3, tau_e = 0.87338 ms,
      vent factor at t_b = 5 ms = 0.174105.
      For m_acc = 0.2 kg:  L*=1.1 -> p_CV 34.63 MPa, p_peak 9.258 MPa
                           L*=0.7 -> p_CV 54.43 MPa, p_peak 9.476 MPa
      i.e. 2.4 % worse, because p_CV and tau_e scale oppositely with Vc.

* **08.Q3.**  mdot_st = 0.12*40 = 4.80 kg/s, m_acc = 0.384 kg,
      p_CV = 0.384*380*4000/0.022 = 26.53 MPa.

* **08.Q8.**  (30+15)*4 = 180 kg overhead against 5*700 = 3500 kg of burns;
      180/3680 = 4.89 %.
"""

EXAMPLES = [
    # --- reference engine geometry -----------------------------------------
    {"id": "08.RE100.R", "fn": "R_specific",
     "args": {"M": 22.0},
     "expect": 377.93, "tol": 1e-6},
    {"id": "08.RE100.Vc", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.1, "At": 0.008267969294415636},
     "expect": 0.0090947662238572, "tol": 1e-9},

    # --- WE1: c* of the transient (constant-volume) product gas ------------
    # Used to form tau_e = Vc/(Gamma^2 c*_v At) = 1.3725 ms.
    {"id": "08.WE1.cstar_v", "fn": "c_star",
     "args": {"gamma": 1.15, "R": 377.93, "T0": 4167.438414521206},
     "expect": 1965.103, "tol": 1e-5},
    {"id": "08.WE1.Gamma", "fn": "gamma_function",
     "args": {"gamma": 1.15},
     "expect": 0.6386382502425934, "tol": 1e-9},

    # --- WE2: augmented spark igniter for RE-100 ---------------------------
    # Fuel-rich torch, MR ~ 0.5: M = 15 kg/kmol -> R = 554.297 J/(kg K),
    # gamma = 1.3, T = 1400 K.  f_ig = 1 % -> mdot_ig = 0.275599 kg/s,
    # p_ig = 1.2 pc = 7.2 MPa -> At_ig = 5.0534e-5 m^2 (d = 8.0 mm).
    {"id": "08.WE2a", "fn": "c_star",
     "args": {"gamma": 1.3, "R": 554.2973333333333, "T0": 1400.0},
     "expect": 1320.197, "tol": 1e-5},
    {"id": "08.WE2b", "fn": "choked_mdot",
     "args": {"gamma": 1.3, "R": 554.2973333333333, "T0": 1400.0,
              "p0": 7.2e6, "At": 5.053402978441064e-05},
     "expect": 0.275599, "tol": 1e-6},

    # --- P3: ASI for a 470 kg/s, 206 bar hydrogen engine -------------------
    # f_ig = 0.3 % -> mdot_ig = 1.41 kg/s; torch M = 6, gamma = 1.26,
    # T = 1200 K; p_ig = 1.2 pc = 24.72 MPa -> At = 1.11456e-4 m^2
    # (d = 11.9 mm).
    {"id": "08.P3a", "fn": "c_star",
     "args": {"gamma": 1.26, "R": 1385.743333333333, "T0": 1200.0},
     "expect": 1954.0417, "tol": 1e-6},
    {"id": "08.P3b", "fn": "choked_mdot",
     "args": {"gamma": 1.26, "R": 1385.743333333333, "T0": 1200.0,
              "p0": 2.472e7, "At": 1.1145626284293184e-04},
     "expect": 1.41, "tol": 1e-6},

    # --- P5: delta v cost of one restart chilldown -------------------------
    # 61.06 kg of chilldown off a 3800 kg load, mf = 6000 kg, Isp = 450 s.
    {"id": "08.P5a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 450.0, "m0": 9800.0, "mf": 6000.0},
     "expect": 2165.115, "tol": 1e-6},
    {"id": "08.P5b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 450.0, "m0": 9738.94, "mf": 6000.0},
     "expect": 2137.534, "tol": 1e-6},

    # --- Q4: igniter sizing, 300 kg/s at 110 bar ---------------------------
    # f_ig = 0.5 % -> mdot_ig = 1.5 kg/s; torch R = 500, gamma = 1.28,
    # T = 1300 K; p_ig = 1.25 pc = 13.75 MPa -> At = 1.32533e-4 m^2
    # (d = 13.0 mm).
    {"id": "08.Q4a", "fn": "c_star",
     "args": {"gamma": 1.28, "R": 500.0, "T0": 1300.0},
     "expect": 1214.8866, "tol": 1e-6},
    {"id": "08.Q4b", "fn": "choked_mdot",
     "args": {"gamma": 1.28, "R": 500.0, "T0": 1300.0,
              "p0": 1.375e7, "At": 1.3253308033771226e-04},
     "expect": 1.5, "tol": 1e-6},
]
