"""
Module 17 — Manufacturing: worked-example, problem and quiz inputs.

Only cases whose arithmetic maps directly onto a rocket.py function are listed
in EXAMPLES. The bulk of this module's arithmetic is geometry (circumference /
pitch / tube section), an implicit Colebrook solve, an L-PBF build-time budget
and a Faraday-law deposition rate — none of which has a library function, so
each is written out below with its expected result and can be checked by hand.

Library functions used:
    reynolds(rho, v, L, mu)              -> Re = rho V Dh / mu
    dittus_boelter(k, D, Re, Pr, n)      -> h = 0.023 (k/D) Re^0.8 Pr^n
    pump_power(mdot, dp, rho, eta)       -> P = mdot dp / (rho eta)
    orifice_mdot(Cd, A, rho, dp)         -> mdot = Cd A sqrt(2 rho dp)   [Eq. 3.2]
    rel_unc_power(rel, exponent)         -> |n| * rel   (A ~ d^2 -> factor 2)
    rss(*terms)                          -> quadrature sum of independents

CAUTION 1 — there is no Colebrook solver in rocket.py. Every friction factor in
this module comes from iterating Eq. 3.7,

    1/sqrt(f) = -2 log10( (ks/Dh)/3.7 + 2.51/(Re sqrt f) )

to convergence (fixed-point on f = [-2 log10(...)]^-2 converges in ~10 passes).
The bridge from measured roughness to the sand-grain roughness the equation
wants is ks ~ 5 Ra [E][A], good to a factor of ~2, which is ~+-15 % in f.

CAUTION 2 — dittus_boelter returns the SMOOTH-wall coefficient. The rough-wall
value is that number times the Norris factor (f/f_smooth)^(0.68 Pr^0.215),
Eq. 3.8, and the module's design position is to budget the full friction
penalty and credit at most half of the Norris heat-transfer gain.

------------------------------------------------------------------------------
NOT IN EXAMPLES (no library function; check by hand)

  17.WE1  Tube-wall RE-500 chamber. Dt = 197.3 mm, Dc = 279.1 mm, eps = 16,
          tw = 0.30 mm, V = 40 m/s, mdot_f = 51.52 kg/s of RP-1 at 810 kg/m^3.
            C_t = pi Dt          = 619.8 mm   (C_c = 876.8, C_e = 2479.3 mm)
            N = 180 -> pitch     = 3.444 mm ; flow width 2.844 mm
            A_tot = mdot/(rho V) = 1.5903e-3 m^2 ; per tube 8.835 mm^2
            throat depth         = 3.11 mm (aspect 1.09)
            barrel depth         = 2.07 mm (width 4.271 mm)
            exit depth           = 0.67 mm (width 13.17 mm)  <- geometry breaks
            bifurcation station: C = 2 C_t -> D = 394.6 mm -> eps = 4
            L_div (80 % bell, 15 deg) = 0.2945 m ; axial 0.8882 m
            L_tube (x1.05)       = 0.933 m ; L_braze = 180 x 0.933 = 168 m
            at 1 void per 50 m of land -> 3.4 expected voids per chamber

  17.WE2  Roughness in a 1.5 x 3.0 mm channel, V = 25 m/s, L = 0.9 m.
            Dh = 2ab/(a+b) = 2.00 mm ; Re = 1.35e5 (registered) ; Pr = 6.545
            channel count at the throat, 2.5 mm pitch: 619.8/2.5 = 248
            ks = 5 Ra:  machined 4 um (ks/Dh 0.0020), as-built 60 um (0.0300)
            Colebrook: f_mach = 0.02470, f_AM = 0.05740, ratio 2.32
            dp = f (L/Dh) rho V^2/2, with (L/Dh)(rho V^2/2) = 1.1391e8 Pa
              machined 28.1 bar ; as-built 65.4 bar ; penalty 37.3 bar
            Norris n = 0.68 Pr^0.215 = 1.018 -> Nu ratio 2.32^1.018 = 2.36

  17.WE3  L-PBF build budget, GRCop-42 (rho = 8756), tl = 30 um, hs = 110 um,
          vs = 0.9 m/s, 4 lasers, recoat 9 s/layer, height 0.8882 m.
            areas 0.4584 + 0.0612 + 0.2888 = 0.8084 m^2 ; t_eff = 4.2 mm
            V = 3395 cm^3 (+800 for manifolds) = 4195 cm^3
            V1 = tl hs vs = 2.97 mm^3/s = 10.69 cm^3/h per laser -> 42.8 cm^3/h
            t_laser  = 4195/42.8       = 98.1 h
            layers   = 0.8882/30e-6    = 29,606 ; t_recoat = 74.0 h
            T_build  = 172 h = 7.2 d ; 57 % exposure / 43 % recoat
            m_part   = 4195e-6 x 8756  = 36.7 kg
            powder in machine: (pi/4)(0.45)^2(0.888) x 8756 x 0.55 = 680 kg

  17.WE4  Orifice tolerance stack (element flows and uncertainties registered).
            MR_element 2.3045 ; N = 51.45/0.09156 = 562 elements
            drilled +-0.025 mm at 3 sigma -> sigma_d = 0.00833 mm
              sA_f 1.042 %, sA_o 0.747 %, with sCd 1.5 %
              sm_f 1.826 %, sm_o 1.676 % -> sMR/MR 2.479 % -> sMR 0.0571
              +-3 sigma element band MR in [2.13, 2.48]
              engine: 2.479/sqrt(562) = 0.105 % -> sMR_engine 0.0024
            as-printed +-0.075 mm at 3 sigma, sCd 3 %:
              sA_f 3.125 %, sA_o 2.242 % -> sm 4.33 %, 3.83 %
              sMR/MR 5.78 % -> sMR 0.133, band [1.91, 2.70] ; 2.33x worse

  17.P9   Dt = 320 mm, 1.8 mm channels on 1.2 mm lands (3.0 mm pitch):
            C = 1005.3 mm -> N = 335 channels (0.31 mm of slack left over)
            A_ch = 6.3 mm^2 -> A_tot = 21.105 cm^2
            mdot = 810 x 2.1105e-3 x 28 = 47.87 kg/s

  17.P10  Same channel, Dh = 2(1.8)(3.5)/5.3 = 2.3774 mm, mu = 2.6e-4:
            Re = 2.0738e5 (registered) ; Pr = 5.6727
            ks = 5 um  -> ks/Dh = 0.002103 -> f = 0.02457
            ks = 90 um -> ks/Dh = 0.037857 -> f = 0.06326 ; ratio 2.575

  17.P11  L = 1.1 m: (L/Dh)(rho V^2/2) = 462.70 x 317,520 = 1.46916e8 Pa
            machined 36.09 bar ; as-built 92.93 bar ; penalty 56.84 bar
            extra pump power at 60 kg/s and eta = 0.68: 619 kW (registered)

  17.P12  Norris n = 0.68 x 5.6727^0.215 = 0.9876
            Nu ratio = 2.575^0.9876 = 2.545
            h_smooth = 3.819e4 (registered) -> h_rough = 9.718e4 W/(m^2 K)

  17.P13  V = 2800 cm^3, H = 540 mm, 8 lasers, tl = 40 um, hs = 120 um,
          vs = 1.1 m/s, recoat 7 s:
            V1 = 5.28 mm^3/s = 19.008 cm^3/h per laser -> 152.06 cm^3/h
            t_laser = 18.41 h ; layers 13,500 ; t_recoat = 26.25 h
            T = 44.66 h, RECOAT-LIMITED (recoat is 59 %)
            16 lasers: t_laser 9.21 h -> T = 35.46 h, only 21 % saved

  17.P14  400 elements, df 1.20, do 1.70 mm, +-0.020 at 3 sigma, sCd 2 %:
            sigma_d = 0.006667 mm ; sA_f 1.111 %, sA_o 0.784 %
            sm_f 2.288 %, sm_o 2.148 % -> sMR/MR 3.138 %
            sMR = 0.0659 about MR = 2.10 ; +-3 sigma band [1.902, 2.298]
            engine 3.138/sqrt(400) = 0.1569 % -> sMR_engine 0.0033

  17.P15  RS-25: 390 channels [_verify-liquid] on a stated Dt = 262 mm:
            C = 823.1 mm -> pitch 2.1105 mm ; 40 % land -> width 1.266 mm
          (P9's engine: 1.8 mm channels on a 3.0 mm pitch — much easier.)

  17.P16  Faraday, Eq. 3.4: s/t = M j eta / (n F rho)
            = 0.05869 x 250 x 0.96 / (2 x 96485 x 8900) = 8.2015e-9 m/s
            = 0.7086 mm/day -> 3.2 mm takes 4.52 days of tank residence

  17.Q3   Dh = 1.8 mm, Re = 1.6e5:
            ks = 5 um  -> rel 0.002778 -> f = 0.0265
            ks = 70 um -> rel 0.038889 -> f = 0.0640 ; ratio 2.42

  17.Q4   V = 1900 cm^3, H = 310 mm, tl = 30 um, hs = 100 um, vs = 1.0 m/s,
          4 lasers, recoat 8 s:
            V1 = 3.0 mm^3/s = 10.8 cm^3/h per laser -> 43.2 cm^3/h
            t_laser = 43.98 h ; layers 10,333 ; t_recoat = 22.96 h
            T = 66.94 h, EXPOSURE-LIMITED by a factor of 1.92

  17.Q6   300 elements, d = 1.4 mm, +-0.021 at 3 sigma, sCd 1.8 %:
            sigma_d = 0.007 mm -> sA/A = 1.000 % (registered)
            element sm/m = 2.059 % (registered)
            circuit total = 2.059/sqrt(300) = 0.1189 %

  17.Q9   300 kN engine, Dt = 160 mm, tw = 0.28 mm, mdot_f = 30 kg/s at 35 m/s:
            C = 502.65 mm ; A_tot = 30/(810 x 35) = 1058.2 mm^2
            N = 180: pitch 2.7925, width 2.2325, area 5.879, depth 2.633 mm,
                     aspect 1.18   <- inside the requested 1.0-1.5 band
            band of acceptable counts: N ~ 161 (AR 1.00) to N ~ 210 (AR 1.50)
            N = 160 gives 0.99 (just out); N = 220 gives 1.62 (out)
------------------------------------------------------------------------------
"""

EXAMPLES = [
    # ---- WE2: as-built roughness in a 1.5 x 3.0 mm RE-500 coolant channel ----
    {"id": "17.WE2a", "fn": "reynolds",
     "args": {"rho": 810.0, "v": 25.0, "L": 2.00e-3, "mu": 3.0e-4},
     "expect": 1.35e5, "tol": 0.001},
    # smooth-wall Dittus-Boelter; the rough-wall value is this x 2.36 (Norris)
    {"id": "17.WE2b", "fn": "dittus_boelter",
     "args": {"k": 0.11, "D": 2.00e-3, "Re": 1.35e5, "Pr": 6.545, "n": 0.4},
     "expect": 3.4097e4, "tol": 0.001},
    # pump power to pay the 37.3 bar roughness penalty on 51.52 kg/s of RP-1
    {"id": "17.WE2c", "fn": "pump_power",
     "args": {"mdot": 51.52, "dp": 37.3e5, "rho": 810.0, "eta": 0.70},
     "expect": 3.3892e5, "tol": 0.001},

    # ---- WE4: element flows, then the tolerance stack -----------------------
    {"id": "17.WE4a", "fn": "orifice_mdot",
     "args": {"Cd": 0.80, "A": 2.0106193e-6, "rho": 810.0, "dp": 2.0e6},
     "expect": 0.091557, "tol": 0.001},
    {"id": "17.WE4b", "fn": "orifice_mdot",
     "args": {"Cd": 0.80, "A": 3.9057065e-6, "rho": 1140.0, "dp": 2.0e6},
     "expect": 0.210995, "tol": 0.001},
    # A ~ d^2, so the relative area uncertainty is twice the diameter's
    {"id": "17.WE4c", "fn": "rel_unc_power",
     "args": {"rel": 0.00520833, "exponent": 2.0},
     "expect": 0.0104167, "tol": 0.001},
    {"id": "17.WE4d", "fn": "rel_unc_power",
     "args": {"rel": 0.00373542, "exponent": 2.0},
     "expect": 0.00747085, "tol": 0.001},
    # NOTE: rss() takes *args and cannot be driven by the keyword-only harness,
    # so the quadrature combinations of WE4, P14 and Q6 are asserted in the
    # __main__ block at the bottom of this file instead (same as 18.py).

    # ---- P10 / P11 / P12: the 1.8 x 3.5 mm channel of P9 --------------------
    {"id": "17.P10Re", "fn": "reynolds",
     "args": {"rho": 810.0, "v": 28.0, "L": 2.3773585e-3, "mu": 2.6e-4},
     "expect": 2.073788e5, "tol": 0.001},
    {"id": "17.P11P", "fn": "pump_power",
     "args": {"mdot": 60.0, "dp": 56.8396e5, "rho": 810.0, "eta": 0.68},
     "expect": 6.19168e5, "tol": 0.001},
    {"id": "17.P12h", "fn": "dittus_boelter",
     "args": {"k": 0.11, "D": 2.3773585e-3, "Re": 2.073788e5,
              "Pr": 5.6727273, "n": 0.4},
     "expect": 3.81904e4, "tol": 0.001},

    # ---- P14: 400-element injector tolerance stack --------------------------
    {"id": "17.P14a", "fn": "rel_unc_power",
     "args": {"rel": 0.00555556, "exponent": 2.0},
     "expect": 0.0111111, "tol": 0.001},
    {"id": "17.P14b", "fn": "rel_unc_power",
     "args": {"rel": 0.00392157, "exponent": 2.0},
     "expect": 0.00784314, "tol": 0.001},

    # ---- Q6: 300-element fuel circuit ---------------------------------------
    {"id": "17.Q6a", "fn": "rel_unc_power",
     "args": {"rel": 0.005, "exponent": 2.0},
     "expect": 0.01, "tol": 0.001},
]


if __name__ == "__main__":
    # rss() is an *args function and cannot be driven by the keyword-only
    # harness, so the quadrature sums are checked here instead.
    import os
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import rocket as r

    def close(a, b, tol=1e-3):
        return abs(a - b) <= tol * abs(b)

    # WE4, drilled: area scatter combined with Cd scatter, then the two circuits
    smf = r.rss(r.rel_unc_power(0.00520833, 2), 0.015)
    smo = r.rss(r.rel_unc_power(0.00373542, 2), 0.015)
    assert close(smf, 0.018260), smf
    assert close(smo, 0.016757), smo
    sMR = r.rss(smf, smo)
    assert close(sMR, 0.024782), sMR
    assert close(sMR * 2.3045, 0.05711), sMR * 2.3045          # sigma_MR
    assert close(sMR / 562 ** 0.5, 0.0010455), sMR / 562 ** 0.5  # engine level

    # WE4, as-printed: +-0.075 mm at 3 sigma and 3 % Cd scatter
    spf = r.rss(r.rel_unc_power(0.025 / 1.60, 2), 0.03)
    spo = r.rss(r.rel_unc_power(0.025 / 2.23, 2), 0.03)
    sPR = r.rss(spf, spo)
    # NOTE: the module prints sm_o = 3.83 % and sMR/MR = 5.78 % for this case.
    # sqrt(2.242^2 + 3^2) = 3.745, not 3.83, so the correct pair is 3.75 % and
    # 5.73 %, and the drilled-to-printed ratio is 2.31x, not 2.33x. The
    # engineering conclusion is unchanged; the key flags the slip.
    assert close(spf, 0.043326), spf
    assert close(spo, 0.037452), spo
    assert close(sPR, 0.057265), sPR
    assert close(sPR / sMR, 2.3107, 2e-3), sPR / sMR

    # P14 — 400 elements at +-0.020 mm (3 sigma) and 2 % Cd scatter
    p14f = r.rss(r.rel_unc_power(0.00555556, 2), 0.02)
    p14o = r.rss(r.rel_unc_power(0.00392157, 2), 0.02)
    assert close(p14f, 0.022879), p14f
    assert close(p14o, 0.021483), p14o
    p14 = r.rss(p14f, p14o)
    assert close(p14, 0.031384), p14
    assert close(p14 * 2.10, 0.065907), p14 * 2.10
    assert close(p14 / 400 ** 0.5, 0.0015692), p14 / 400 ** 0.5

    # Q6 — 300 elements, one 1.4 mm fuel orifice each
    q6 = r.rss(r.rel_unc_power(0.005, 2), 0.018)
    assert close(q6, 0.020591), q6
    assert close(q6 / 300 ** 0.5, 0.0011888), q6 / 300 ** 0.5

    print("17.py auxiliary uncertainty checks OK")
