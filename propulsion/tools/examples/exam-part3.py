"""Problem inputs and expected outputs for the Part III exam
(exams/exam-part3.md and exams/exam-part3-key.md).

Exam propellant — GENERIC, not a real formulation and not any vendor's
measured coefficients:

    r_ref  = 9.00 mm/s at p_ref = 7.50 MPa
    n      = 0.30
    rho_p  = 1800   kg/m^3
    c*     = 1520   m/s
    sigma_p= 0.0024 1/K
    gamma  = 1.17

Derived once:
    a      = r_ref / p_ref^n = 7.793349094559612e-5  m/s / Pa^0.30
    1/(1-n)= 1.4285714285714286
    pi_K   = sigma_p/(1-n) = 3.4285714285714284e-3  1/K

Every motor, grain, case and factory in the exam is generic or fictional.
Where a real motor appears (D3) only published, architecture-level figures
from reference/_verify-solid-coldgas.md Part A are used, with their
per-motor tags: RSRM propellant 500,000 kg / gross 590,000 kg / Isp 268 s
vac (conf B); P120C propellant 141,400 kg / gross 153,000 kg / Isp ~280 s
(conf B).

Entries whose arithmetic maps onto a rocket.py function are listed in
EXAMPLES; everything else is described in the comment block at the bottom.
`tol` is relative.
"""

A = 7.793349094559612e-05
N = 0.30
RHO_P = 1800.0
CSTAR = 1520.0
SIGMA_P = 0.0024
GAMMA = 1.17
PI_K = 3.4285714285714284e-3          # sigma_p / (1 - n)

AT_A2 = 2.5446900494077322e-2         # pi/4 * 0.180^2
AB_A2 = 6.616194128460104             # Kn = 260
PC_A2 = 5982414.915840252

AT_B1 = 1.7671458676442587e-2         # pi/4 * 0.150^2
AT_B3 = 1.1309733552923255e-2         # pi/4 * 0.120^2
AT_C2 = 1.6417734894356478e-2         # implied by pc_nom = 6.50 MPa at Ab = 4.5239 m^2

EXAMPLES = [
    # --- A1: unit conversion closes on the quoted reference point ----------
    {"id": "X3.A1", "fn": "vieille_burn_rate",
     "args": {"a": A, "p": 7.5e6, "n": N},
     "expect": 9.0e-3, "tol": 1e-9},

    # --- A2: equilibrium pressure, burn rate, Cf, Isp ----------------------
    {"id": "X3.A2b.pc", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": AB_A2, "At": AT_A2,
              "c_star_val": CSTAR},
     "expect": 5982414.915840252, "tol": 1e-6},
    {"id": "X3.A2b.r", "fn": "vieille_burn_rate",
     "args": {"a": A, "p": PC_A2, "n": N},
     "expect": 8.409827535762835e-3, "tol": 1e-6},
    {"id": "X3.A2c.Cf", "fn": "Cf",
     "args": {"gamma": GAMMA, "eps": 12.0, "p0": PC_A2, "pa": 0.0},
     "expect": 1.785038656828971, "tol": 1e-6},
    {"id": "X3.A2c.ceff", "fn": "c_eff",
     "args": {"c_star_val": CSTAR, "Cf_val": 1.785038656828971},
     "expect": 2713.258758380036, "tol": 1e-9},
    {"id": "X3.A2c.Isp", "fn": "isp_from_c",
     "args": {"c_eff": 2713.258758380036},
     "expect": 276.6753945924486, "tol": 1e-9},

    # --- A2d/A2e: pi_K and the +/- 35 K conditioning band ------------------
    {"id": "X3.A2d", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": SIGMA_P, "n": N},
     "expect": 3.4285714285714284e-3, "tol": 1e-12},
    {"id": "X3.A2e.hot", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": PI_K, "dT": 35.0},
     "expect": 1.1274968515793757, "tol": 1e-9},
    {"id": "X3.A2e.cold", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": PI_K, "dT": -35.0},
     "expect": 0.8869204367171575, "tol": 1e-9},

    # --- A4a: the strand-burner number the colleague used by mistake -------
    {"id": "X3.A4a.strand", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": SIGMA_P, "dT": 35.0},
     "expect": 1.087628893808826, "tol": 1e-9},

    # --- B1: burn-back table -> p_c(w), Dt = 0.150 m, non-eroding ----------
    {"id": "X3.B1.w000", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 4.20, "At": AT_B1,
              "c_star_val": CSTAR},
     "expect": 5262199.467036399, "tol": 1e-6},
    {"id": "X3.B1.w020", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 4.55, "At": AT_B1,
              "c_star_val": CSTAR},
     "expect": 5899666.442972082, "tol": 1e-6},
    {"id": "X3.B1.w040", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 4.72, "At": AT_B1,
              "c_star_val": CSTAR},
     "expect": 6217065.757471354, "tol": 1e-6},
    {"id": "X3.B1.w060", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 4.70, "At": AT_B1,
              "c_star_val": CSTAR},
     "expect": 6179466.386053351, "tol": 1e-6},
    {"id": "X3.B1.w080", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 4.40, "At": AT_B1,
              "c_star_val": CSTAR},
     "expect": 5623792.476319292, "tol": 1e-6},
    {"id": "X3.B1.w100", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 3.60, "At": AT_B1,
              "c_star_val": CSTAR},
     "expect": 4222105.055871821, "tol": 1e-6},
    {"id": "X3.B1.w115", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 2.10, "At": AT_B1,
              "c_star_val": CSTAR},
     "expect": 1954899.5890788955, "tol": 1e-6},
    # burn rates at the first and last stations (the rest follow identically)
    {"id": "X3.B1.r000", "fn": "vieille_burn_rate",
     "args": {"a": A, "p": 5262199.467036399, "n": N},
     "expect": 8.092343743815431e-3, "tol": 1e-6},
    {"id": "X3.B1.r115", "fn": "vieille_burn_rate",
     "args": {"a": A, "p": 1954899.5890788955, "n": N},
     "expect": 6.012588294521422e-3, "tol": 1e-6},

    # --- B3: CP tube at ignition and at web burnout ------------------------
    {"id": "X3.B3.start", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 1.7969909978533616,
              "At": AT_B3, "c_star_val": CSTAR},
     "expect": 2960287.7684179773, "tol": 1e-6},
    {"id": "X3.B3.end", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 3.9207076316800618,
              "At": AT_B3, "c_star_val": CSTAR},
     "expect": 9023197.016911456, "tol": 1e-6},

    # --- C1a: hot-day MEOP factor -----------------------------------------
    {"id": "X3.C1a.kT", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": PI_K, "dT": 30.0},
     "expect": 1.1083330644710232, "tol": 1e-9},

    # --- C2: liner debond, Path A pressure rise ----------------------------
    {"id": "X3.C2.nominal", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 4.523893421169302,
              "At": AT_C2, "c_star_val": CSTAR},
     "expect": 6.5e6, "tol": 1e-6},
    {"id": "X3.C2.Ld040", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 6.031857894892403,
              "At": AT_C2, "c_star_val": CSTAR},
     "expect": 9803863.729783896, "tol": 1e-6},
    {"id": "X3.C2.Ld100", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 8.293804605477053,
              "At": AT_C2, "c_star_val": CSTAR},
     "expect": 15451567.70408796, "tol": 1e-6},
    {"id": "X3.C2.Ldburst", "fn": "solid_equilibrium_pressure",
     "args": {"a": A, "n": N, "rho_p": RHO_P, "Ab": 7.604416072772178,
              "At": AT_C2, "c_star_val": CSTAR},
     "expect": 13.65e6, "tol": 1e-6},

    # --- C3: throat erosion, Cf and Isp at start and end of burn -----------
    {"id": "X3.C3.Cf0", "fn": "Cf",
     "args": {"gamma": GAMMA, "eps": 16.0, "p0": 7.5e6, "pa": 0.0},
     "expect": 1.8207052012467364, "tol": 1e-6},
    {"id": "X3.C3.Cf1", "fn": "Cf",
     "args": {"gamma": GAMMA, "eps": 13.153295695535459,
              "p0": 5669055.296164912, "pa": 0.0},
     "expect": 1.7967308276297365, "tol": 1e-6},
    {"id": "X3.C3.Isp0", "fn": "isp_from_c",
     "args": {"c_eff": 2767.4719058950394},
     "expect": 282.2035971402099, "tol": 1e-9},
    {"id": "X3.C3.Isp1", "fn": "isp_from_c",
     "args": {"c_eff": 2731.0308579971995},
     "expect": 278.48764440427664, "tol": 1e-9},

    # --- D3: ideal dv of each motor treated as a stage on its own ----------
    # RSRM: gross 590,000 kg, inert 90,000 kg, Isp 268 s vac  [conf B]
    {"id": "X3.D3.dv_rsrm", "fn": "tsiolkovsky_dv",
     "args": {"isp": 268.0, "m0": 590000.0, "mf": 90000.0},
     "expect": 4941.804806348935, "tol": 1e-9},
    # P120C: gross 153,000 kg, inert 11,600 kg, Isp 280 s  [conf B]
    {"id": "X3.D3.dv_p120c", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 153000.0, "mf": 11600.0},
     "expect": 7082.766570997587, "tol": 1e-9},
    # counterfactual: RSRM Isp with P120C mass fraction, to split the delta
    {"id": "X3.D3.dv_split", "fn": "tsiolkovsky_dv",
     "args": {"isp": 268.0, "m0": 153000.0, "mf": 11600.0},
     "expect": 6779.219432240548, "tol": 1e-9},
]

# ---------------------------------------------------------------------------
# Exam arithmetic that does NOT map onto a single rocket.py function
# ---------------------------------------------------------------------------
# A1   Unit conversion.  a' = 9.00/7.50^0.30 = 4.9173 (mm/s) MPa^-0.30, and
#      a = a' * 1e-3 * (1e-6)^0.30 = 7.7933e-5 m/s/Pa^0.30.  The registered
#      X3.A1 entry is the closure check: vieille_burn_rate(a, 7.5e6, 0.30)
#      must return 9.00 mm/s exactly.
#
# A2b  Mass-balance closure: rho_p*Ab*r = 1800*6.616194*8.409828e-3 = 100.154
#      kg/s equals p_c*At/c* = 5.982415e6*2.544690e-2/1520 = 100.154 kg/s.
#
# A2e  Band ratio exp(2*pi_K*35) = 1.27125.
#
# A3   Derivation only; no arithmetic.
#
# B1c  Trapezoidal web integration, dt = dw/mean(r_i, r_i+1) over the six
#      intervals: 2.4291, 2.3694, 2.3530, 2.3884, 2.5268, 2.2079 s,
#      total 14.2746 s.  Peak/initial pressure 6.217066/5.262199 = 1.18147.
#
# B2   Star-grain geometry (module 21 Eq. 3.6-3.9), N = 8, Rp = 0.280 m,
#      theta = 10 deg, f = 8 mm, L = 1.60 m.  beta = pi/8.
#        s0     = Rp sin(beta)/sin(beta+theta)        = 0.1994257 m
#        Ri     = Rp sin(theta)/sin(beta+theta)       = 0.0904923 m
#        P0     = 2 N s0                              = 3.1908115 m
#        dP/du  = 2N[(pi/2 - theta) - cot(beta+theta)]= -2.7747548 m/m
#        Ab(y=0)   = (P0 + dP/du * 0.008) * 1.60      = 5.0697772 m^2
#        Ab(y=60mm)= (P0 + dP/du * 0.068) * 1.60      = 4.8034078 m^2
#        Ab ratio 0.9474594 -> p_c ratio 0.9474594^(1/0.7) = 0.9257956
#      Neutrality check at theta = 14.8067 deg: pi/2 - theta = 1.3123706 and
#      cot(beta+theta) = 1.3123692; slope = 2.26e-5 m/m, i.e. zero to the
#      precision of the quoted angle.  Cost of neutrality at fixed Rp:
#      A0 = N Rp Ri sin(beta) grows 0.0775710 -> 0.1012060 m^2 (+30.5 %),
#      P0 falls 3.1908 -> 2.8287 m (-11.3 %).
#
# B3c  J = Ap/At = pi*0.110^2 / 1.1309734e-2 = 3.3611.
#      mdot = p_c At/c* = 2.960288e6*1.1309734e-2/1520 = 22.026 kg/s,
#      G = mdot/Ap = 22.026/3.801327e-2 = 579.4 kg/(m^2 s) < G_th = 700.
#      Ratio check: (0.240/0.110)^(1/0.7) = 3.0481 = 9.023197/2.960288.
#
# C1   MEOP = 7.00e6 * 1.1083331 * 1.05 * 1.06 * 1.03 = 8.894074e6 Pa;
#      p_b = 1.40 * MEOP = 1.2451703e7 Pa.
#      Steel: t = p_b R/Ftu = 1.2451703e7*0.850/1.500e9 = 7.0560 mm,
#      t/R = 0.00830; m_cyl = 7830*2*pi*0.850*0.0070560*7.00 = 2065.45 kg;
#      m_case = 1.25*m_cyl = 2581.81 kg.
#      V = pi*0.850^2*7.00 = 15.8886 m^3; m_p = 0.86*V*1800 = 24595.6 kg;
#      m_other = 0.055*m_p = 1352.76 kg; zeta = 0.862091.
#      Composite (netting): t_L = 1.5*p_b*R/(sigma_f Vf)
#        = 1.5*1.2451703e7*0.850/(2.550e9*0.60) = 10.3764 mm;
#      m_case = 1.25*1580*2*pi*0.850*0.0103764*7.00 = 766.15 kg;
#      zeta = 0.920683.
#      PV/W steel     = Ftu/(2 rho g0)      = 9767.4 m = 9.77 km
#      PV/W netting   = sigma_f Vf/(3 rho g0) = 32914.9 m = 32.91 km
#
# C2   Ab1 = pi*0.320*4.50 = 4.5238934 m^2.  The registered At_C2 is the
#      throat implied by p_c,nom = 6.50 MPa (Kn = 275.549), which is why
#      X3.C2.nominal returns 6.50 MPa exactly.  Debond area 2 pi Rc Ld:
#      Ld = 0.40 m -> +1.5079645 m^2, ratio 1.333333, p = 9.8039 MPa;
#      Ld = 1.00 m -> +3.7699112 m^2, ratio 1.833333, p = 15.4516 MPa;
#      burst (13.65 MPa) at ratio (13.65/6.50)^0.70 = 1.6809450, i.e.
#      dA = 3.0805227 m^2 and Ld = 0.81713 m.
#
# C3   x = 1 + s_dot t / r_t0.
#      s_dot = 0.060 mm/s: x = 1.047500, At ratio x^2 = 1.097256 (+9.73 %),
#        p ratio x^(-2/0.7) = 0.875824, F ratio x^(-0.6/0.7) = 0.961004.
#      s_dot = 0.130 mm/s: x = 1.1029167, At ratio 1.2164252 (+21.64 %),
#        p ratio 0.7558740 -> p_c = 5.669055e6 Pa, F ratio 0.9194642.
#      Long way: At0 = pi*0.120^2 = 4.5238934e-2 m^2, Ae = 16*At0 =
#        0.7238229 m^2, At(95) = pi*0.13235^2 = 5.5029778e-2 m^2,
#        eps(95) = 13.15330.  F0 = 1.8207052*7.50e6*4.5238934e-2 =
#        617.75 kN; F1 = 1.7967308*5.669055e6*5.5029778e-2 = 560.52 kN;
#        ratio 0.9073570.  The gap to 0.9194642 is the Cf ratio
#        1.7967308/1.8207052 = 0.986830.  Isp 282.204 -> 278.488 s.
#
# D1   Throughput (module 25 Eq. 3.1/3.2/3.6).
#      N_b = ceil(26000/2400) = 11 batches; batches per mixer inside the
#      7.0 h working life = floor(7.0/3.5) = 2; mixers = ceil(11/2) = 6.
#      Casting bay: (7.0+5.0)/24 = 0.500 d -> 2.0000 motors/day.
#      Cure pits:   0.5+7.0+1.5+0.5 = 9.5 d, 8 pits -> 0.8421 motors/day.
#      CT cell:     20.0/12.0 = 1.6667 motors/day.
#      Rate = 0.80 * min(...) = 0.673684 motors/day = 20.21 per 30 d.
#      Target 1.347368/day.  Pits stop paying when N/9.5 >= 1.666667, i.e.
#      N = 15.83 -> 16 pits; the CT cell then binds and the line caps at
#      0.80*1.666667 = 1.333333/day = 40.00/month against the 40.42 needed.
#      Each added pit is worth 0.80/9.5 = 0.084211/day = 2.526/month.
#      Completing the doubling needs 1.347368/0.80*12.0 = 20.21 h/day of CT.
#
# D2   Trace anomaly.  p2/p1 = 6.57/6.20 = 1.0596774.
#      Ab ratio  = (p2/p1)^(1-n)  = 1.0596774^0.70 = 1.0414096  (+4.14 %)
#      If instead it were throat blockage at fixed Ab:
#        At ratio = (p2/p1)^-(1-n) = 0.9602370 (-4.0 % area),
#        radius ratio = 0.9799168 (-2.0 %), which post-fire data excludes.
#      Burn time: predicted remaining 43.5-9.2 = 34.3 s, shortened to
#      34.3/1.0596774 = 32.368 s, tail-off at 41.57 s vs 41.0 s observed.
#
# D3   zeta_RSRM  = 500000/590000 = 0.847458  [conf B, /motor]
#      zeta_P120C = 141400/153000 = 0.924183  [conf B, /motor]
#      dv 4941.80 vs 7082.77 m/s; the counterfactual 6779.22 m/s splits the
#      2140.96 m/s difference into 1837.41 m/s (85.82 %) from mass fraction
#      and 303.55 m/s (14.18 %) from Isp.
#      Inert mass at the other motor's mass fraction, m_p (1-zeta)/zeta:
#        500000 kg of propellant at zeta = 0.924183 -> 41018 kg (vs 90000)
#        141400 kg of propellant at zeta = 0.847458 -> 25452 kg (vs 11600)
#
# Figures excluded on purpose, per the scope boundary and the verification
# file's caveats: no propellant formulations beyond the fact-sheet level, no
# processing procedures, no weapon dimensions.  Nothing marked "do not
# print" or confidence C is used as an exam number -- in particular the
# M-V M-24 Isp, the Castor rows other than Castor 120, the Chinese solids,
# and the Titan/SRMU thrust figures (which are per-vehicle in the sources)
# appear nowhere in this paper.  The Vega-C VV22 nozzle-insert attribution
# is used only as a qualitative case in C3(c), and the key flags that the
# course records it at confidence C.
