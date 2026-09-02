"""
Module 23 — Insulation and Liners: worked-example and problem inputs.

Only examples whose arithmetic maps directly onto a rocket.py function are
listed in EXAMPLES. The rest are described in comments below with their
expected results so they can be checked by hand.

Generic motor used throughout module 23 (fictional, SI):
    bore diameter      D      = 0.300 m
    grain length       L      = 3.00 m
    case inner radius  Rc     = 0.550 m
    propellant density rho_p  = 1770 kg/m^3
    characteristic vel c*     = 1550 m/s
    Vieille law               r = a p^n, n = 0.35,
                              r = 8.0 mm/s at p = 6.90 MPa
                              => a = 3.232159657e-05 m/s/Pa^0.35
    initial burn area  Ab1    = pi*D*L = 2.827433388 m^2
    throat area        At     = 8.993696812e-03 m^2  (sized for 6.90 MPa)

NOT IN EXAMPLES (no library function; check by hand):

  23.WE1  Insulation thickness profile from a char-rate model.
          sdot[mm/s] = 0.10 + 0.0060*G   (material A, rho 1100)
          sdot[mm/s] = 0.05 + 0.0030*G   (material B, rho 1350)
          t_ins = 1.5*sdot*t_e + 1.5 mm
          (G, t_e) -> t_ins:
            fwd dome   (  5,  95) -> 20.02 mm
            fwd cyl    ( 15,  22) ->  7.77 mm
            mid cyl    ( 40,  18) -> 10.68 mm
            aft cyl    ( 85,  35) -> 33.52 mm
            aft dome   (130, 100) -> 133.50 mm (material A)
                                     67.50 mm (material B)
          Tapered mass 412.6 kg; uniform at 67.5 mm in material A 1052 kg;
          ratio 2.55.

  23.WE3  Cure-cooldown bore hoop strain, Eq. 3.5:
            eps = dT*(2*ac*b^2 - (3*ap - ac)*(b^2 - a^2)) / (2*a^2)
          a=0.150, b=0.550, ap=1.0e-4, ac=1.2e-5, dT=219-330=-111 K
            -> eps = 0.18100  (18.1 %)
          Same with a carbon/epoxy case, ac=1.0e-6 -> eps = 0.2050 (20.5 %)
          Raw mismatch (ap-ac)*|dT| = 0.00977; amplification 18.5x.

  23.P9   t_ins = 33.05 mm (material A, G=60, t_e=45, FS 1.5, d_res 2.0 mm);
          areal-mass crossover with material B at t_e = 1.71 s.

  23.P12  Eq. 3.5 with a=0.120, b=0.500, ap=1.05e-4, ac=2.3e-5,
          dT=233-335=-102 K -> eps = 0.2029 (20.3 %).
          a for eps = 0.12 is 0.1525 m; propellant area/length falls
          0.7402 -> 0.7124 m^2/m, a loss of 3.76 %.

  23.P14  kappa = 0.25/(1100*1500) = 1.5152e-07 m^2/s;
          t = (4.0e-3)^2/kappa = 105.6 s.

  23.P15  t2 = 180*exp((85000/8.314)*(1/298 - 1/344)) = 17,688 d = 48.5 yr.

  23.Q3   t_ins = 1.5*(0.10+0.0060*25)*60 + 1.5 = 24.00 mm.

  23.Q8   Eq. 3.5 with a=0.18, b=0.60, ap=9.0e-5, ac=1.2e-5,
          dT=240-330=-90 K -> eps = 0.10539 (10.5 %).
"""

A_VIEILLE = 3.232159657181914e-05      # m/s per Pa^0.35
N_VIEILLE = 0.35
RHO_P = 1770.0                          # kg/m^3
C_STAR = 1550.0                         # m/s
AB1 = 2.827433388230814                 # m^2, nominal burning area
AT = 8.993696812302885e-03              # m^2, throat area

EXAMPLES = [
    # --- WE2: nominal, crack, debond -------------------------------------
    {"id": "23.WE2a", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_VIEILLE, "n": N_VIEILLE, "rho_p": RHO_P,
              "Ab": AB1, "At": AT, "c_star_val": C_STAR},
     "expect": 6.900e6, "tol": 0.001,
     "note": "nominal equilibrium chamber pressure, 6.90 MPa"},

    {"id": "23.WE2b", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_VIEILLE, "n": N_VIEILLE, "rho_p": RHO_P,
              "Ab": AB1 + 0.0400, "At": AT, "c_star_val": C_STAR},
     "expect": 7.0507e6, "tol": 0.002,
     "note": "0.50 m x 40 mm bore crack, two faces: +0.0400 m^2 -> +2.2 %"},

    {"id": "23.WE2c", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_VIEILLE, "n": N_VIEILLE, "rho_p": RHO_P,
              "Ab": AB1 + 6.911503838, "At": AT, "c_star_val": C_STAR},
     "expect": 4.6258e7, "tol": 0.002,
     "note": "2.0 m propellant/liner debond at Rc=0.550 m: 46.3 MPa vs "
             "14.5 MPa burst -> case rupture"},

    # --- P10: independent motor, casting void ----------------------------
    {"id": "23.P10a", "fn": "solid_equilibrium_pressure",
     "args": {"a": 4.10e-5, "n": 0.30, "rho_p": 1760.0,
              "Ab": 4.20, "At": 0.0125, "c_star_val": 1520.0},
     "expect": 3.3384e6, "tol": 0.002,
     "note": "nominal 3.34 MPa"},

    {"id": "23.P10b", "fn": "solid_equilibrium_pressure",
     "args": {"a": 4.10e-5, "n": 0.30, "rho_p": 1760.0,
              "Ab": 4.55, "At": 0.0125, "c_star_val": 1520.0},
     "expect": 3.7428e6, "tol": 0.002,
     "note": "+0.35 m^2 void surface -> 3.74 MPa, +12.1 %, inside "
             "MEOP = 4.67 MPa"},

    # --- P11: largest debond that stays inside MEOP ----------------------
    # Ab limit = AB1 * (10.35/6.90)^(1-n) = 1.30155 * AB1 = 3.68003 m^2,
    # i.e. dA = 0.85260 m^2 -> L_debond = 0.2467 m = 8.2 % of grain length.
    {"id": "23.P11", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_VIEILLE, "n": N_VIEILLE, "rho_p": RHO_P,
              "Ab": 3.680032893, "At": AT, "c_star_val": C_STAR},
     "expect": 1.0350e7, "tol": 0.002,
     "note": "MEOP exactly; corresponds to a 0.247 m debond length"},
]

# Quiz 5 is a pure ratio, not a library call:
#   p2/p1 = 1.18**(1/(1-0.40)) = 1.3177 ; p2 = 9.22 MPa vs MEOP 10.5 MPa.
