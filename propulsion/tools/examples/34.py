"""
Module 34 — Failure Case Studies: worked-example and problem inputs.

The worked examples in module 34 are evidence-analysis exercises. Only the
solid-motor internal-ballistics arithmetic (WE2, P1, P2, P7, Q3) maps onto a
rocket.py function; everything else is checked by hand and recorded in the
comments below.

Generic motor carried over from module 23 (fictional, SI):
    propellant density  rho_p = 1770 kg/m^3
    characteristic vel  c*    = 1550 m/s
    Vieille law               r = a p^n, n = 0.35,
                              a = 3.232159657e-05 m/s/Pa^0.35
    initial burn area   Ab1   = 2.827433388 m^2
    throat area         At    = 8.993696812e-03 m^2
    => nominal equilibrium chamber pressure p1 = 6.90 MPa

WE2 — pressure-time signatures of three solid-motor faults.
  exponent 1/(1-n) = 1.5384615
  (a) debond adding burning area, p2/p1 = (Ab2/Ab1)^1.5385:
        x1.05 -> 1.0780 (7.44 MPa)    x1.10 -> 1.1579 (7.99 MPa)
        x1.20 -> 1.3238 (9.13 MPa)    x1.50 -> 1.8660 (12.88 MPa)
        x2.00 -> 2.9048 (20.04 MPa)   x3.00 -> 5.4204 (37.40 MPa)
  (b) case burn-through vent, p2/p1 = (At/(At+Av))^1.5385:
        Av=5.0e-4 (5.6% At)  -> 0.9201 (6.35 MPa)
        Av=1.0e-3 (11.1% At) -> 0.8503 (5.87 MPa)
        Av=2.0e-3 (22.2% At) -> 0.7342 (5.07 MPa)
        Av=5.0e-3 (55.6% At) -> 0.5066 (3.50 MPa)
        Av=1.0e-2 (111% At)  -> 0.3166 (2.19 MPa)
        Av=2.0e-2 (222% At)  -> 0.1652 (1.14 MPa)
  (c) throat over-erosion, p2/p1 = (At2/At1)^-1.5385:
        x1.02 -> 0.9700   x1.05 -> 0.9277
        x1.10 -> 0.8636   x1.20 -> 0.7554

NOT IN EXAMPLES (no library function; check by hand):

  34.WE1  O-ring resilience vs temperature from Rogers Commission data.
          Data: tau = 2.4 s at 75 F (297.039 K); tau = 600 s at 50 F (283.150 K).
          Target: 28 F = 270.928 K; 36 F = 275.372 K; duty time 0.6 s.
          Arrhenius fit:
            1/T2 - 1/T1 = 1.651344e-04 1/K
            Ea = 8.3145*ln(250)/1.651344e-04 = 2.780e5 J/mol = 278 kJ/mol
            at 28 F: aT = 5.146e4, tau = 1.235e5 s (1.43 days)
            at 36 F: aT = 7.02e3,  tau = 1.685e4 s
            at 40 F (277.594 K): aT = 2.656e3, tau = 6.375e3 s (1.77 h)   [P6]
          WLF fit, C1 = 17.44, C2 = 51.6 K, two-point solve for Tg:
            T1 - Tg = 27.874 K  =>  Tg = 269.17 K = -3.98 C
            at 28 F: log10 aT = 5.541, aT = 3.473e5, tau = 8.335e5 s (~9.6 d)
            at 36 F: log10 aT = 4.244, aT = 1.754e4, tau = 4.21e4 s
            at 40 F: log10 aT = 3.668, aT = 4.659e3, tau = 1.118e4 s (3.11 h) [P6]
          Conclusion: tau/t_duty ~ 2e5 (Arrhenius) to 1.4e6 (WLF) at 28 F.

  34.WE3  COPV stored energy and solid-oxygen ignition arithmetic.
          Generic vessel: V = 0.100 m^3, p = 3.80e7 Pa, T = 90 K,
          gamma = 1.6667, He M = 4.0026, pa = 1.0e5 Pa.
            pV/(gamma-1)          = 5.700e6 J
            (pa/p)^((g-1)/g)      = 0.09300
            E = 5.170e6 J = 5.17 MJ = 1.24 kg TNT-equivalent
            m(ideal) = pV/(RT) = 20.33 kg  (Z ~ 1.2 -> ~17 kg real)
          Solid oxygen in a buckle void, rho_SOX = 1300 kg/m^3:
            1  cm^3 -> 1.30 g O2, 0.49 g C, Q =  16.0 kJ
            5  cm^3 -> 6.50 g O2, 2.44 g C, Q =  80.0 kJ   (WE3 case)
            12 cm^3 -> 15.6 g O2, 5.86 g C, Q = 192.1 kJ   (P4)
          P4 comparison: strain energy in 12 cm^3 at eps=0.012, E=140 GPa
            u = 0.5*140e9*0.012^2 = 1.008e7 J/m^3 -> U = 121 J; Q/U = 1.6e3.

  34.WE4  Inducer cavitation cycle count to fatigue.
          Shaft 41,900 rpm -> Omega = 698.33 Hz.
          f_exc = (lambda-1)*Omega:
            lambda 1.1 ->  69.83 Hz -> 1.669e4 cycles in 239 s
            lambda 1.2 -> 139.67 Hz -> 3.338e4 cycles in 239 s
            lambda 1.3 -> 209.50 Hz -> 5.007e4 cycles in 239 s
          Blade passing (3 blades) = 2095.0 Hz -> 5.007e5 cycles in 239 s.
          Basquin sigma_a = 1800 MPa * (2N)^-0.090 at N = 3.34e4:
            2N = 6.68e4, (2N)^-0.090 = 0.3679, sigma_a = 662 MPa.

  34.P2   Vent growth, At = 0.020 m^2, n = 0.30 (exponent 1.428571), p1 = 8.0 MPa:
            t=0 Av=0.0000 p/p1=1.0000 p=8.00 MPa
            t=1 Av=0.0020 p/p1=0.8727 p=6.98 MPa
            t=2 Av=0.0040 p/p1=0.7707 p=6.17 MPa
            t=3 Av=0.0060 p/p1=0.6874 p=5.50 MPa
            t=4 Av=0.0080 p/p1=0.6184 p=4.95 MPa
          25 % drop at Av = 4.46e-3 m^2 (22.3 % of At), 75 mm diameter hole.

  34.P1   n=0.30: 1.22^1.428571 = 1.3285 -> 10.63 MPa (MEOP 12.0, survives)
          n=0.45: 1.22^1.818182 = 1.4355 -> 11.48 MPa (survives, margin -62 %)

  34.P3   V=0.065, p=3.10e7, T=100 K: E = 2.718 MJ = 0.650 kg TNT;
          m(ideal) = 9.70 kg.

  34.P5   Omega = 305.0 Hz, lambda = 1.15 -> f = 45.75 Hz,
          N = 1.830e4 in 400 s; sigma_a = 1400*(3.66e4)^-0.085 = 573 MPa.
          Blade passing (4 blades) = 1220 Hz -> 4.88e5 cycles.

  34.P7   At x1.08, n=0.35 -> p2/p1 = 0.8883.

  34.P8   LE-7 pc 12.7 MPa -> LE-7A 12.0 MPa: 5.51 % reduction;
          pump discharge at 1.2*pc: 15.24 -> 14.40 MPa (delta 0.84 MPa);
          pump power ~ (1-0.0551)^2 -> 10.7 % reduction.

  34.Q3   n=0.40: 1.15^1.666667 = 1.2623 -> 9.47 MPa (MEOP 11.0, survives).

  34.Q4   V=0.080, p=3.40e7: E = 3.684 MJ = 0.880 kg TNT.

  34.Q5   Omega = 600.0 Hz, lambda = 1.25 -> f = 150.0 Hz,
          N = 2.25e4 cycles in 150 s.
"""

EXAMPLES = [
    # WE2 baseline: the module-23 generic motor's nominal equilibrium pressure.
    {"id": "34.WE2.p1", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.232159657e-05, "n": 0.35, "rho_p": 1770.0,
              "Ab": 2.827433388, "At": 8.993696812e-03, "c_star_val": 1550.0},
     "expect": 6.90e6, "tol": 0.001},

    # WE2(a): debond exposing 20 % extra burning area -> 9.13 MPa.
    {"id": "34.WE2.debond20", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.232159657e-05, "n": 0.35, "rho_p": 1770.0,
              "Ab": 1.20 * 2.827433388, "At": 8.993696812e-03,
              "c_star_val": 1550.0},
     "expect": 9.134e6, "tol": 0.002},

    # WE2(b): case vent Av = 2.0e-3 m^2 modelled as an enlarged effective throat.
    {"id": "34.WE2.vent2e-3", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.232159657e-05, "n": 0.35, "rho_p": 1770.0,
              "Ab": 2.827433388, "At": 8.993696812e-03 + 2.0e-3,
              "c_star_val": 1550.0},
     "expect": 5.066e6, "tol": 0.002},

    # WE2(c): throat over-erosion of 10 % -> 0.8636 * p1.
    {"id": "34.WE2.erode10", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.232159657e-05, "n": 0.35, "rho_p": 1770.0,
              "Ab": 2.827433388, "At": 1.10 * 8.993696812e-03,
              "c_star_val": 1550.0},
     "expect": 5.959e6, "tol": 0.002},

    # WE4 / P5 sanity: Basquin and WLF have no library function, but the
    # COPV blowdown ratio used in WE3 step 1 shares usable_fraction's algebra
    # only loosely, so it is left to the hand-checked comments above.
]
