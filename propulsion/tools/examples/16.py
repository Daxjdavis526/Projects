"""
Module 16 — Structures and Materials: worked-example and problem inputs.

Only cases whose arithmetic maps directly onto a rocket.py function are listed
in EXAMPLES. Everything else (Coffin-Manson iteration, Larson-Miller inversion,
Lame thick-wall stresses, bimetallic CTE-mismatch force balance) has no library
function and is described in the comments below with its expected result so it
can be checked by hand.

Library functions used:
    wall_dT(q, t, k)                     -> dT = q t / k                [Eq. 3.1]
    thermal_stress_hoop(E, alpha, dT, nu)-> sigma = E a dT / (2(1-nu))  [Eq. 3.2]

CAUTION, and it is worked as WE4 in the module: thermal_stress_hoop carries the
factor of 2 that belongs to a LINEAR THROUGH-THICKNESS GRADIENT whose mid-plane
is unstrained. A bimetallic CTE mismatch is a uniform membrane mismatch with no
such plane, so the factor of 2 does NOT apply there and the function must not be
used for it (it under-predicts by exactly 2x).

------------------------------------------------------------------------------
NOT IN EXAMPLES (no library function; check by hand)

  16.WE1  LCF life of a NARloy-Z liner, Manson-Coffin-Basquin (Eq. 3.7):
            de_t/2 = (sf/E)(2Nf)^b + ef (2Nf)^c
          constants sf = 340 MPa, E = 96 GPa, b = -0.10, ef = 0.35, c = -0.60
            de_t = 0.012 -> 2Nf = 1529, Nf = 765, /4 -> 191 allowable cycles
                            elastic term 1.701e-3, plastic term 4.299e-3
          sensitivity: de_t = 0.008 -> Nf = 1951 (488 after /4)
                       de_t = 0.016 -> Nf =  416 (104)
                       de_t = 0.020 -> Nf =  266 ( 66)

  16.WE2  Larson-Miller inversion (Eq. 3.4), C = 20, T in K, t_r in hours:
            T = 1000 * (P_LM/1000) / (20 + log10 t_r)
          IN718      P/1000 = 22.5 -> 1071.4 K (10 h),  978.3 K (1000 h)
          Haynes 230 P/1000 = 26.0 -> 1238.1 K (10 h), 1130.4 K (1000 h)
          Engineering answer: the 718 10-h figure is inadmissible; gamma''
          overages above ~925 K, which the master curve cannot see.

  16.WE3  Pump housing, p = 30 MPa, a = 0.100 m, b = 0.112 m, closed ends.
            thin wall  p a / t                       = 250.0 MPa
            Lame bore  p (b^2+a^2)/(b^2-a^2)         = 265.85 MPa
            radial     -p                            = -30.0 MPa
            axial      p a^2/(b^2-a^2)               = 117.92 MPa
            von Mises at bore                        = 256.2 MPa
            required Fty (x1.25) 332.3 MPa; Ftu (x1.5) 398.8 MPa
            a_cr for IN718, K_Ic = 100 MPa*sqrt(m), Y = 1.12, s = 265.85 MPa:
              a_cr = (1/pi)(K_Ic/(Y s))^2 = 35.8 mm

  16.WE4  Bimetallic CTE mismatch, NARloy-Z (0.89 mm) on electroformed Ni
          (3.0 mm), 300 K -> 90 K, dT = -210 K.
            aCu = 15.5e-6, aNi = 12.0e-6 -> eps_mis = 7.350e-4
            E*Cu = 110/(1-0.34) = 166.67 GPa ; E*Ni = 207/(1-0.31) = 300.0 GPa
            stiffness ratio E*Cu tCu / (E*Ni tNi) = 0.1648
            fully-constrained bound  E*Cu eps_mis = 122.5 MPa
            actual sigma_Cu = 122.5 / 1.1648   = 105.2 MPa (TENSION in copper)
            balancing sigma_Ni = 105.2*0.89/3.0 =  31.2 MPa (compression)
          Cross-check quoted in the module: thermal_stress_hoop with the same
          (E=110e9, alpha=3.5e-6, dT=210, nu=0.34) returns 61.25 MPa, which is
          the WRONG model for this problem -- registered below as 16.WE4x so the
          checker pins the value the module quotes.

  16.N1   GRCop-42 liner, q = 45 MW/m^2, t = 1.0 mm, k = 340 W/(m K)
            dT = 132.35 K ; sigma_th (E=105 GPa, a=18.5e-6, nu=0.33) = 191.9 MPa
            gradient strain 1.827e-3 ; total (x2.2) 4.020e-3
            Eq. 3.7 with sf/E = 4.00e-3, b = -0.10, ef = 0.40, c = -0.62:
              2Nf = 3.528e4, Nf = 17640, /4 -> 4410 allowable cycles

  16.N3   Haynes 230 GG liner: 300 s x 150 = 12.5 h
            T = 27600/(20 + log10 12.5) = 1308.2 K ; margin over 1050 K = 258 K

  16.N4   316L helium sphere, R = 0.150 m, MEOP 35 MPa, Fty = 390 MPa at 90 K
            size on yield/1.25 at MEOP: t =  8.41 mm -> proof stress 468 MPa
              (ABOVE yield: the 1.5 proof factor governs, not the 1.25 on yield)
            size on proof <= Fty:       t = 10.10 mm -> MEOP stress 260 MPa
            a_cr at proof (K_Ic = 150 MPa*sqrt(m), Y = 1.12): 37.5 mm
            NDE finds 0.8 mm -> damage tolerant by ~47x; leak-before-burst

  16.N5   GRCop-84 (1.0 mm) on IN718 (4.0 mm), 300 K -> 110 K, dT = -190 K
            eps_mis = 4.5e-6 * 190 = 8.550e-4
            E*Cu = 125/0.67 = 186.57 GPa ; E*Ni = 200/0.71 = 281.69 GPa
            ratio 0.16558 -> sigma_Cu = 136.9 MPa (tension)
                             sigma_Ni =  34.2 MPa (compression)

  16.N6   WE3 housing with b = 0.120 m: sigma_theta = 166.36 MPa
            stress down 37.4 % ; mass per unit length up 73.0 %

  16.N7   Paris life scaling: a uniform 40x on da/dN is a 40x on C, so
            N_H2 = 4000/40 = 100 cycles. m = 3 is irrelevant to the arithmetic.

  16.Q2   q = 100 MW/m^2, t = 0.80 mm, k = 310 -> dT = 258.06 K
            sigma_th (E=100 GPa, a=18e-6, nu=0.33) = 346.65 MPa (2.7x hot yield)

  16.Q4   P_LM/1000 = 24.0 -> 1090.9 K at 100 h ; 1000.0 K at 10000 h

  16.Q7   Eq. 3.7 with sf/E = 3.5e-3, b = -0.10, ef = 0.35, c = -0.60,
          de_t = 0.010 -> 2Nf = 2278, Nf = 1139, /4 -> 285 cycles
            elastic 1.615e-3, plastic 3.385e-3 (plastic = 68 %)

  16.T1   Trade study, throat q = 95 MW/m^2, t = 1.0 mm:
            (a) GRCop-42, k = 340: dT = 279.41 K, grad strain 3.858e-3,
                total 8.487e-3, 2Nf = 3633, Nf = 1817, /4 -> 454 cycles
            (b) NARloy-Z, k = 316: dT = 300.63 K, grad strain 4.100e-3,
                total 9.019e-3, 2Nf = 2923, Nf = 1461, /4 -> 365 cycles
            (c) CuCrZr,   k = 320: dT = 296.88 K -- rejected on overaging >700 K
            (d) IN718 hot, k = 21: dT = 4523.8 K -- rejected on physics; holding
                dT = 250 K would need the flux cut to 5.25 MW/m^2 (18x)
            barrel for (a) at 55 MW/m^2: dT = 161.76 K

  Thermal-shock figure of merit (Eq. 3.3), M = k Fty (1-nu)/(E alpha), W/m,
  room temperature unless noted:
    OFHC Cu 9240 ; NARloy-Z 14665 ; GRCop-84 18990 ; GRCop-42 18441 ;
    CuCrZr 29559 ; 2219-T87 19410 ; C-103 8503 ; Ti-6Al-4V 3744 ;
    IN718 3206 ; A-286 1820 ; IN625 1143 ; Haynes 230 841 ; 316L 628
  at 800 K: NARloy-Z 7897 ; GRCop-84 12661 ; CuCrZr 5795 ; IN718 5427 ; 316L 577
------------------------------------------------------------------------------
"""

EXAMPLES = [
    # WE1 - through-wall dT and the elastic thermal stress that proves the wall
    # is not elastic (NARloy-Z liner, q = 80 MW/m^2, t = 0.89 mm, k = 316).
    {"id": "16.WE1a", "fn": "wall_dT",
     "args": {"q": 80.0e6, "t": 0.89e-3, "k": 316.0},
     "expect": 225.316, "tol": 0.001},
    {"id": "16.WE1b", "fn": "thermal_stress_hoop",
     "args": {"E": 100.0e9, "alpha": 18.0e-6, "dT": 225.3164556962, "nu": 0.34},
     "expect": 307.25e6, "tol": 0.001},

    # WE4 cross-check - the value the module quotes to show the function is the
    # WRONG model for a bimetallic CTE mismatch (61.25 MPa vs the correct 105.2).
    {"id": "16.WE4x", "fn": "thermal_stress_hoop",
     "args": {"E": 110.0e9, "alpha": 3.5e-6, "dT": 210.0, "nu": 0.34},
     "expect": 61.25e6, "tol": 0.001},

    # RS-25 throat comparison quoted in section 6.1 (160 MW/m^2 through NARloy-Z).
    {"id": "16.S61", "fn": "wall_dT",
     "args": {"q": 160.0e6, "t": 0.89e-3, "k": 316.0},
     "expect": 450.633, "tol": 0.001},

    # Section 3.2.2 - the same flux through Inconel 718 at its hot conductivity.
    {"id": "16.S322", "fn": "wall_dT",
     "args": {"q": 80.0e6, "t": 0.89e-3, "k": 21.2},
     "expect": 3358.49, "tol": 0.001},

    # N1 - GRCop-42 liner at 45 MW/m^2.
    {"id": "16.N1a", "fn": "wall_dT",
     "args": {"q": 45.0e6, "t": 1.0e-3, "k": 340.0},
     "expect": 132.353, "tol": 0.001},
    {"id": "16.N1b", "fn": "thermal_stress_hoop",
     "args": {"E": 105.0e9, "alpha": 18.5e-6, "dT": 132.3529411765, "nu": 0.33},
     "expect": 191.862e6, "tol": 0.001},

    # N2 - the non-copper alternatives at the same flux and thickness.
    {"id": "16.N2i", "fn": "wall_dT",
     "args": {"q": 45.0e6, "t": 1.0e-3, "k": 21.0},
     "expect": 2142.857, "tol": 0.001},
    {"id": "16.N2ii", "fn": "wall_dT",
     "args": {"q": 45.0e6, "t": 1.0e-3, "k": 21.5},
     "expect": 2093.023, "tol": 0.001},
    {"id": "16.N2iii", "fn": "wall_dT",
     "args": {"q": 45.0e6, "t": 1.0e-3, "k": 10.0},
     "expect": 4500.0, "tol": 0.001},

    # Q2.
    {"id": "16.Q2a", "fn": "wall_dT",
     "args": {"q": 100.0e6, "t": 0.80e-3, "k": 310.0},
     "expect": 258.065, "tol": 0.001},
    {"id": "16.Q2b", "fn": "thermal_stress_hoop",
     "args": {"E": 100.0e9, "alpha": 18.0e-6, "dT": 258.0645161290, "nu": 0.33},
     "expect": 346.654e6, "tol": 0.001},

    # T1 - trade study, throat at 95 MW/m^2 and barrel at 55 MW/m^2.
    {"id": "16.T1a", "fn": "wall_dT",
     "args": {"q": 95.0e6, "t": 1.0e-3, "k": 340.0},
     "expect": 279.412, "tol": 0.001},
    {"id": "16.T1b", "fn": "wall_dT",
     "args": {"q": 95.0e6, "t": 1.0e-3, "k": 316.0},
     "expect": 300.633, "tol": 0.001},
    {"id": "16.T1c", "fn": "wall_dT",
     "args": {"q": 95.0e6, "t": 1.0e-3, "k": 320.0},
     "expect": 296.875, "tol": 0.001},
    {"id": "16.T1d", "fn": "wall_dT",
     "args": {"q": 95.0e6, "t": 1.0e-3, "k": 21.0},
     "expect": 4523.810, "tol": 0.001},
    {"id": "16.T1barrel", "fn": "wall_dT",
     "args": {"q": 55.0e6, "t": 1.0e-3, "k": 340.0},
     "expect": 161.765, "tol": 0.001},
]
