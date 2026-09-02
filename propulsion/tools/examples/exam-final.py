"""Registered arithmetic for the Final Comprehensive Examination.

Every entry in ``EXAMPLES`` is a step that appears verbatim in
``exams/exam-final.md`` or ``exams/exam-final-key.md`` and that maps onto a
function in ``tools/rocket.py``. Steps with no library function are written
out in this docstring so a reader can still reproduce them by hand. ``tol``
is a *relative* tolerance. Run with ``tools/check_examples.py``.

Constants
---------
    g0 = 9.80665 m/s^2 ; Ru = 8314.46 J/(kmol K)

    FX-250 (fictional, B1/B2): LOX/LCH4, MR 3.40, pc 250 bar, eps 40,
        T0 3600 K, gamma 1.16, M 21.0 -> R = 395.9267 J/(kg K),
        Gamma = 0.6406468, c*_ideal = 1863.545, c*_del (0.96) = 1789.004,
        Cf_vac = 1.929420, At = 2.487794e-2 m^2, Dt = 177.976 mm,
        mdot = 347.651 kg/s (mo 268.639 / mf 79.0115), Isp_vac = 351.979 s.
        Preburner gas M 14.0 -> R = 593.890, cp = 2449.796 (gamma 1.32).
        GG gas M 14.5 -> R = 573.411, cp = 2484.781 (gamma 1.30).

    EXAM-F solid (fictional, B3/C2): r = 7.20 mm/s at 6.00 MPa, n = 0.35,
        rho_p = 1770, c* = 1545, sigma_p = 0.0021 /K, gamma = 1.18.
        a = 7.20e-3/(6.00e6)^0.35 = 3.054777e-05 m/s/Pa^0.35.
        a_hot(+30 K) = a exp(0.0021*30) = 3.253420e-05.

    TR-90 (fictional, C1): At = 9.600e-3 m^2, eps 14, gamma 1.20,
        pc_ns = pc_inj/1.030, c*_ideal = 1798.6 m/s, mdot = 33.50 kg/s.

Arithmetic in the paper that does NOT map to a rocket.py function
-----------------------------------------------------------------

  * B1 geometry and properties.
        Ae = 40 * 2.487794e-2 = 0.995118 m^2 -> De = 1.12562 m
        cp0 = gamma R/(gamma-1) = 1.16*395.9267/0.16 = 2870.468 J/(kg K)
        Pr0 = 4 gamma/(9 gamma - 5) = 4.64/5.44 = 0.8529412
        Ru_curv = 1.5 Rt = 1.5*0.0889882 = 0.1334823 m

  * B1(c)/(d) wall chain. Not in the library:
        Twc = 800 - 406.875 = 393.125 K
        hc_req = q''/(Twc - Tco) = 1.47492e8/103.125 = 1.43022e6 W/(m^2 K)
        q''_max = (800-290)/(8.0e-4/290 + 1/1.5e5)
                = 510/9.42529e-6 = 5.41098e7 W/m^2 = 54.110 MW/m^2
        factor = 147.492/54.110 = 2.7258
        RS-25 pressure scaling check: (250/206.4)^0.8 = 1.16569,
        136 MW/m^2 * 1.16569 = 158.5 MW/m^2 (we get 147.5, 7 % lower,
        because methalox cp0 = 2870 vs hydrolox 3857 J/(kg K)).

  * B2 pressure budget (sums, not functions):
        pd_f = 480 + 25 + 45 + 10 = 560 bar ; dp_f = 552 bar
        pd_o = 250 + 40 + 10 = 300 bar      ; dp_o = 294 bar
        GG variant: pd_f = 250 + 40 + 45 + 10 = 345 bar ; dp_f = 337 bar
        P_shaft(SC)  = (13.7802 + 8.88213)/0.98 + 0.80 = 23.9248 MW
        P_shaft(GG)  = (8.41292 + 8.88213)/0.98        = 17.6480 MW
        pi_t (SC) = 480/290 = 1.6551724 ; pi_t (GG) = 300/2.0 = 150
        mdot_t available = 1.40 * 79.0115 = 110.616 kg/s
        P_avail = 110.616 * 164799 = 18.2294 MW  < 23.9248 MW -> no closure
        deficit 5.6954 MW (23.8 %); Tt_req = 750*23.9248/18.2294 = 984.3 K
        GG: mdot_t = 17.6480e6/950246 = 18.5721 kg/s = 5.342 % of 347.651
        Isp_eff = (347.651*351.979 + 18.5721*110)/366.223 = 339.708 s
                -> loss 12.271 s (3.49 %)
        omega at 11500 rpm = 2 pi 11500/60 = 1204.277 rad/s
        Q_ox = 268.639/1140 = 0.2356485 m^3/s

  * B3 solid geometry and the coupled erosive loop. Not in the library:
        At = pi/4 (0.0740)^2 = 4.300840e-3 m^2 ; Ab = 1.4451326 m^2
        Kn = 336.012 ; Ap = pi/4 (0.100)^2 = 7.853982e-3 ; J = 1.8262
        non-erosive: pc = 6.9733 MPa, r = 7.5890 mm/s,
                     mdot = 19.4117 kg/s, G = 2471.6 kg/(m^2 s)
        loop: rbar = a pc^n + 0.30 k <(pc At/c*)/Ap - Gth>,
              pc' = rho_p Ab rbar c*/At,  Gth = 1150, k = 1.6e-6
          it 1: pc 6.9733 G 2471.6 r0 7.5890 dr 2.1145 rbar 8.2233 -> 7.5562
          it 2: pc 7.5562 G 2678.2 r0 7.8052 dr 2.4451 rbar 8.5388 -> 7.8460
          it 3: pc 7.8460 G 2780.9 r0 7.9087 dr 2.6094 rbar 8.6916 -> 7.9865
          it 4: pc 7.9865 G 2830.7 r0 7.9580 dr 2.6891 rbar 8.7647 -> 8.0537
          it 5: pc 8.0537 G 2854.5 r0 7.9814 dr 2.7272 rbar 8.7995 -> 8.0857
          conv: pc 8.1145 G 2876.1 r0 8.0024 dr 2.7617 rbar 8.8309
          aft local r = 10.7641 mm/s, ratio 1.3451, rise +16.365 %
        hot +30 K loop:
          start 7.6830 -> 8.3769 -> 8.7214 -> 8.8878 -> ... conv 9.0382 MPa
          aft local 12.1360 mm/s, ratio 1.3712; 1.2961 x cold nominal
          vs MEOP 9.50 MPa: 0.9514 ; vs burst 13.30 MPa: 0.6796
        extinction: Ap_ext = 19.4117/1150 = 1.68798e-2 m^2
                    -> Dp_ext = 146.60 mm, web burned 23.30 mm,
                    2.64 s at 8.83 mm/s or 3.07 s at 7.59 mm/s
                    = 12-14 % of the 22 s web time
        thrust: F = Cf pc At = 1.740349*6.9733e6*4.300840e-3 = 52.195 kN
                erosive 1.740349*8.1145e6*4.300840e-3 = 60.74 kN

  * B4 cold gas. Not in the library:
        m_usable = 1150/(9.80665*68.60078) = 1.709417 kg
        m_i = 1.709417/0.900 = 1.899353 kg
        V = m_i Z R T/p_i = 1.899353*1.05*296.7966*293.15/2.0e7
          = 8.675884e-3 m^3 = 8.6759 L
        tank at 95 % fill: 9.1325 L -> r = 0.129668 m, D = 259.34 mm
        T_f (adiabatic) = 293.15*(0.100)^(0.4/1.4) = 151.836 K
        m_usable(adiab) = 1.899353*0.8069302 = 1.532645 kg
        shortfall = 1 - 0.8069302/0.900 = 10.341 %
        Isp(cut-off) = 68.60078*sqrt(151.836/293.15) = 49.371 s
        argon: m_usable = 2.788141*0.900 = 2.509327 kg
               I_t = 2.509327*9.80665*50.20824 = 1235.5 N s
               against nitrogen's 1150 N s -> +7.44 % from the same volume

  * C1 data reduction. Not in the library:
        run 1: pc_ns = 62.00/1.030 = 60.1942 bar
               c* = 6.019417e6*9.600e-3/33.50 = 1724.967 m/s
               eta_c* = 1724.967/1798.6 = 0.95906
               Cf_meas = 8.94e4/(6.019417e6*9.600e-3) = 1.54708
               eta_Cf = 1.54708/1.546661 = 1.00027
               Isp = 8.94e4/(33.50*9.80665) = 272.13 s
        run 5: pc_ns = 60.40/1.030 = 58.6408 bar
               c* = 1680.452 m/s, eta_c* = 0.93431
               Cf_meas = 8.67e4/(5.864078e6*9.600e-3) = 1.54010
               eta_Cf = 1.54010/1.540412 = 0.99979
               Isp = 263.91 s
        drops: c* -2.581 %, Cf -0.404 %, product -2.975 %, F -3.020 %
        injector: mdot_f = 33.50/3.35 = 10.00 kg/s
               CdA_1 = 10.00/sqrt(2*810*1.120e6) = 2.347651e-4 m^2
               CdA_5 = 10.00/sqrt(2*810*0.910e6) = 2.604485e-4 m^2
               ratio = sqrt(11.20/9.10) = 1.109400  (+10.94 %)
               A_1 = CdA_1/0.80 = 2.934563e-4 m^2
               N = A_1/(pi/4 (1.60e-3)^2) = 145.95 -> 146 orifices
               extra = 146*0.10940 = 15.97 orifice-equivalents;
               over 6 orifices each must grow 3.66x in area = 1.91x in
               diameter (1.60 -> 3.06 mm), which is why six streaks cannot
               be the whole story.
        margins: dp/pc = 11.20/62.00 = 18.06 % ; 9.10/60.40 = 15.07 %
               at 60 % throttle (dp ~ mdot^2, pc ~ mdot):
               run 1: 11.20*0.36/(62.00*0.60) = 10.84 %
               run 5:  9.10*0.36/(60.40*0.60) =  9.04 %  -> chug

  * C2 trace reduction. Not in the library (pc ~ Kn^(1/(1-n)),
    so an area or rate ratio is a pressure ratio to the power (1-n) = 0.65):
        hump:  (8.15/6.98)^0.65 = 1.10598 mean multiplier
               local (aft 30 %) = 1 + 0.10598/0.30 = 1.35326
        ramp:  (7.60/6.98)^0.65 = 1.05687  (+5.69 % burning area)
        throat +4.0 % at fixed Ab: (1/1.04)^1.538462 = 0.941445 (-5.856 %)
               eps 9.00 -> 9.00/1.04 = 8.653846
               Cf 1.740349 -> 1.734949 (-0.310 %)
               Isp 274.185 -> 273.335 s (-0.310 %)
        reconciliation: I_t = Cf_bar At_bar Int(pc dt)
               1.015 * 1.015 * 0.99810 = 1.02827 (+2.83 % expected)
               measured -3.1 % -> 1 - 0.969/1.02827 = 5.76 % unaccounted,
               attributed to slag retention, two-phase lag and the sliver.

  * D closure and sizing. Not in the library:
        closure condition k(exp(dv/c)-1) < 1
        D at 1570 m/s: c = 68*9.80665 = 666.852 m/s,
               exp(1570/666.852)-1 = 9.53123, k(..) = 0.55*9.53123 = 5.2422
               -> infeasible
        D for R-2 alone (120 m/s): k(..) = 0.55*0.197149 = 0.108437,
               m_p = 626*0.197149/0.891563 = 138.43 kg,
               inert = 6.0 + 0.55*138.43 = 82.14 kg, system 220.57 kg
        A: monoprop m_p = 35.4304 kg, inert 13.9205 kg
           -> mass after solid burnout 669.351 kg
           solid m_p = 480.932 kg, inert 50.612 kg
           wet = 1200.89 kg
        B: m_p = 484.062 kg, inert 110.812 kg, wet = 1214.87 kg
        C: m_p = 455.712 kg, inert  87.521 kg, wet = 1163.23 kg
        sensitivities on B (wet mass, kg):
           Isp 305/315/325 s : 1243.30 / 1214.87 / 1188.95
           k 0.17/0.20/0.23  : 1187.67 / 1214.87 / 1243.35
           dv 1470/1570/1670 : 1161.99 / 1214.87 / 1270.87
           break-even against R-3 (1250 kg): B at dv_total = 1633.4 m/s
           (dv_1 = 1513 m/s, i.e. +63 m/s); C at 1751.4 m/s (+181 m/s).
        Pugh weighted totals (weights 3/3/3/2/2/2/1/1, B datum):
           A = -5, B = 0, C = -3, D screened out before scoring.
"""

import math

Ru = 8314.46
G0 = 9.80665

# --- FX-250 carried values -------------------------------------------------
R_FX = 8314.46 / 21.0                 # 395.9267
CSTAR_FX = 1789.0036026257380         # delivered, = 0.96 * 1863.5454
CF_FX = 1.9294201444447250            # vacuum, eps = 40, gamma = 1.16
AT_FX = 2.4877940731677237e-02
DT_FX = 0.17797634093089196
RU_CURV_FX = 1.5 * DT_FX / 2.0        # 0.1334823
CP0_FX = 1.16 * R_FX / 0.16           # 2870.4683
PR0_FX = 4 * 1.16 / (9 * 1.16 - 5)    # 0.8529412
HG_FX = 53182.238                     # from bartz_hg below
TAW_FX = 3573.3333333333335
Q_FX = 1.4749210e8

R_PB = 8314.46 / 14.0                 # 593.8900
CP_PB = 1.32 * R_PB / 0.32            # 2449.7962
R_GG = 8314.46 / 14.5                 # 573.4110
CP_GG = 1.30 * R_GG / 0.30            # 2484.7811

# --- EXAM-F solid ----------------------------------------------------------
A_SOLID = 7.20e-3 / (6.00e6) ** 0.35          # 3.054777e-05
A_SOLID_HOT = A_SOLID * math.exp(0.0021 * 30.0)   # 3.253420e-05
AB_SOLID = 1.4451326
AT_SOLID = math.pi / 4 * 0.0740 ** 2          # 4.300840e-03
PC_SOLID = 6.973318751448593e6

# --- cold gas --------------------------------------------------------------
R_N2 = 8314.46 / 28.014               # 296.7966
R_AR = 8314.46 / 39.948               # 208.1321
V_TANK = 8.675884193978864e-3
CF_CG = 1.7352141056822565            # gamma 1.4, eps 60, vacuum
AT_CG = 1.0085210777559521e-07

EXAMPLES = [
    # -----------------------------------------------------------------
    # Section A — the two items that are a computation rather than recall
    # -----------------------------------------------------------------
    {"id": "F.A1", "fn": "gamma_function", "args": {"gamma": 1.20},
     "expect": 0.6485312, "tol": 1e-6},
    {"id": "F.A3", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 60.0, "p0": 1.0e7, "pa": 0.0},
     "expect": 1.9163582, "tol": 1e-6},
    {"id": "F.A12", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.0021, "n": 0.35},
     "expect": 3.2307692e-3, "tol": 1e-6},
    {"id": "F.A16", "fn": "usable_fraction",
     "args": {"p_i": 2.0e7, "p_f": 2.0e6, "isothermal": True},
     "expect": 0.900, "tol": 1e-9},

    # -----------------------------------------------------------------
    # B1(a) — FX-250 performance chain
    # -----------------------------------------------------------------
    {"id": "F.B1a1", "fn": "R_specific", "args": {"M": 21.0},
     "expect": 395.92667, "tol": 1e-6},
    {"id": "F.B1a2", "fn": "gamma_function", "args": {"gamma": 1.16},
     "expect": 0.6406468, "tol": 1e-6},
    {"id": "F.B1a3", "fn": "c_star",
     "args": {"gamma": 1.16, "R": R_FX, "T0": 3600.0},
     "expect": 1863.5454, "tol": 1e-6},
    {"id": "F.B1a4", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 40.0, "p0": 2.50e7, "pa": 0.0},
     "expect": 1.9294201, "tol": 1e-6},
    {"id": "F.B1a5", "fn": "throat_area_from_thrust",
     "args": {"F": 1.200e6, "p0": 2.50e7, "Cf_val": CF_FX},
     "expect": 2.4877941e-2, "tol": 1e-6},
    {"id": "F.B1a6", "fn": "c_eff",
     "args": {"c_star_val": CSTAR_FX, "Cf_val": CF_FX},
     "expect": 3451.7396, "tol": 1e-6},
    {"id": "F.B1a7", "fn": "isp_from_c", "args": {"c_eff": 3451.7395894},
     "expect": 351.9795, "tol": 1e-6},
    # -----------------------------------------------------------------
    # B1(b)-(c) — Bartz chain at the throat, Twg = 800 K
    # -----------------------------------------------------------------
    {"id": "F.B1b1", "fn": "bartz_sigma",
     "args": {"gamma": 1.16, "Mach": 1.0, "Tw_over_T0": 800.0 / 3600.0},
     "expect": 1.3713961, "tol": 1e-6},
    {"id": "F.B1b2", "fn": "bartz_hg",
     "args": {"Dt": DT_FX, "mu0": 9.50e-5, "cp0": CP0_FX, "Pr0": PR0_FX,
              "p0": 2.50e7, "c_star_val": CSTAR_FX, "rc": RU_CURV_FX,
              "A_ratio": 1.0, "sigma": 1.3713961},
     "expect": 53182.24, "tol": 1e-5},
    {"id": "F.B1b3", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.16, "Mach": 1.0, "r": 0.90},
     "expect": 3573.3333, "tol": 1e-6},
    {"id": "F.B1b4", "fn": "heat_flux",
     "args": {"hg": 53182.238, "Taw": TAW_FX, "Twg": 800.0},
     "expect": 1.4749210e8, "tol": 1e-5},
    {"id": "F.B1c1", "fn": "wall_dT",
     "args": {"q": Q_FX, "t": 8.0e-4, "k": 290.0},
     "expect": 406.875, "tol": 1e-5},

    # -----------------------------------------------------------------
    # B2(a) — pump heads and powers
    # -----------------------------------------------------------------
    {"id": "F.B2a1", "fn": "pump_power",
     "args": {"mdot": 79.011543, "dp": 5.52e7, "rho": 422.0, "eta": 0.75},
     "expect": 1.3780199e7, "tol": 1e-6},
    {"id": "F.B2a2", "fn": "pump_power",
     "args": {"mdot": 268.639248, "dp": 2.94e7, "rho": 1140.0, "eta": 0.78},
     "expect": 8.8821298e6, "tol": 1e-6},
    {"id": "F.B2a3", "fn": "pump_head", "args": {"dp": 5.52e7, "rho": 422.0},
     "expect": 13338.468, "tol": 1e-6},
    {"id": "F.B2a4", "fn": "pump_head", "args": {"dp": 2.94e7, "rho": 1140.0},
     "expect": 2629.7944, "tol": 1e-6},

    # -----------------------------------------------------------------
    # B2(b) — staged-combustion turbine, exhausting into the chamber
    # -----------------------------------------------------------------
    {"id": "F.B2b1", "fn": "R_specific", "args": {"M": 14.0},
     "expect": 593.89000, "tol": 1e-6},
    {"id": "F.B2b2", "fn": "turbine_power",
     "args": {"mdot": 1.0, "cp": CP_PB, "T_in": 750.0,
              "pr": 480.0 / 290.0, "gamma": 1.32, "eta": 0.78},
     "expect": 164798.88, "tol": 1e-6},

    # -----------------------------------------------------------------
    # B2(c) — the same chamber as an open gas generator
    # -----------------------------------------------------------------
    {"id": "F.B2c1", "fn": "pump_power",
     "args": {"mdot": 79.011543, "dp": 3.37e7, "rho": 422.0, "eta": 0.75},
     "expect": 8.4129208e6, "tol": 1e-6},
    {"id": "F.B2c2", "fn": "R_specific", "args": {"M": 14.5},
     "expect": 573.41103, "tol": 1e-6},
    {"id": "F.B2c3", "fn": "turbine_power",
     "args": {"mdot": 1.0, "cp": CP_GG, "T_in": 900.0, "pr": 150.0,
              "gamma": 1.30, "eta": 0.62},
     "expect": 950246.0, "tol": 1e-5},

    # -----------------------------------------------------------------
    # B2(d) — NPSH and suction specific speed on the LOX pump
    # -----------------------------------------------------------------
    {"id": "F.B2d1", "fn": "npsh_available",
     "args": {"p_tank": 3.50e5, "p_vapor": 1.50e5, "rho": 1140.0, "z": 6.0,
              "dp_line": 0.35e5, "accel": 1.35 * G0},
     "expect": 22.859050, "tol": 1e-6},
    {"id": "F.B2d2", "fn": "suction_specific_speed_SI",
     "args": {"omega": 1204.2771839, "Q": 0.2356485, "NPSH": 22.859050},
     "expect": 10.090777, "tol": 1e-5},

    # -----------------------------------------------------------------
    # B3 — EXAM-F internal ballistics
    # -----------------------------------------------------------------
    {"id": "F.B3a1", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SOLID, "n": 0.35, "rho_p": 1770.0, "Ab": AB_SOLID,
              "At": AT_SOLID, "c_star_val": 1545.0},
     "expect": 6.9733188e6, "tol": 1e-6},
    {"id": "F.B3a2", "fn": "vieille_burn_rate",
     "args": {"a": A_SOLID, "p": PC_SOLID, "n": 0.35},
     "expect": 7.5889797e-3, "tol": 1e-6},
    {"id": "F.B3d1", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.0021, "dT": 30.0},
     "expect": 1.0650268, "tol": 1e-6},
    {"id": "F.B3d2", "fn": "solid_equilibrium_pressure",
     "args": {"a": A_SOLID_HOT, "n": 0.35, "rho_p": 1770.0, "Ab": AB_SOLID,
              "At": AT_SOLID, "c_star_val": 1545.0},
     "expect": 7.6830326e6, "tol": 1e-6},
    # nominal thrust coefficient and Isp of the motor, eps = 9, vacuum
    {"id": "F.B3e1", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 9.0, "p0": PC_SOLID, "pa": 0.0},
     "expect": 1.7403490, "tol": 1e-6},
    {"id": "F.B3e2", "fn": "isp_from_c",
     "args": {"c_eff": 1545.0 * 1.7403489558},
     "expect": 274.18529, "tol": 1e-6},

    # -----------------------------------------------------------------
    # B4 — cold-gas blowdown module
    # -----------------------------------------------------------------
    {"id": "F.B4a1", "fn": "R_specific", "args": {"M": 28.014},
     "expect": 296.79660, "tol": 1e-6},
    {"id": "F.B4a2", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "eps": 60.0},
     "expect": 76.223086, "tol": 1e-6},
    {"id": "F.B4a3", "fn": "usable_fraction",
     "args": {"p_i": 2.0e7, "p_f": 2.0e6, "isothermal": True},
     "expect": 0.900, "tol": 1e-9},
    {"id": "F.B4a4", "fn": "stored_gas_mass",
     "args": {"p": 2.0e7, "V": V_TANK, "R": R_N2, "T": 293.15, "Z": 1.05},
     "expect": 1.8993527, "tol": 1e-6},
    {"id": "F.B4b1", "fn": "Cf",
     "args": {"gamma": 1.400, "eps": 60.0, "p0": 2.0e6, "pa": 0.0},
     "expect": 1.7352141, "tol": 1e-6},
    {"id": "F.B4b2", "fn": "throat_area_from_thrust",
     "args": {"F": 0.350, "p0": 2.0e6, "Cf_val": CF_CG},
     "expect": 1.0085211e-7, "tol": 1e-6},
    {"id": "F.B4b3", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 2.0e7,
              "At": AT_CG},
     "expect": 4.6823173e-3, "tol": 1e-6},
    {"id": "F.B4b4", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 293.15, "p0": 2.0e6,
              "At": AT_CG},
     "expect": 4.6823173e-4, "tol": 1e-6},
    {"id": "F.B4c1", "fn": "usable_fraction",
     "args": {"p_i": 2.0e7, "p_f": 2.0e6, "isothermal": False,
              "gamma": 1.400},
     "expect": 0.8069302, "tol": 1e-6},
    {"id": "F.B4d1", "fn": "R_specific", "args": {"M": 39.948},
     "expect": 208.13207, "tol": 1e-6},
    {"id": "F.B4d2", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": R_AR, "T0": 293.15, "eps": 60.0},
     "expect": 55.786931, "tol": 1e-6},
    {"id": "F.B4d3", "fn": "stored_gas_mass",
     "args": {"p": 2.0e7, "V": V_TANK, "R": R_AR, "T": 293.15, "Z": 1.02},
     "expect": 2.7881406, "tol": 1e-6},
    {"id": "F.B4d4", "fn": "tsiolkovsky_dv",
     "args": {"isp": 68.600777, "m0": 145.0, "mf": 143.290583},
     "expect": 7.9781552, "tol": 1e-5},

    # -----------------------------------------------------------------
    # C1 — TR-90 reduction: the ideal sea-level Cf at each run's pc_ns
    # -----------------------------------------------------------------
    {"id": "F.C1a1", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 14.0, "p0": 6.0194175e6, "pa": 101325.0},
     "expect": 1.5466573, "tol": 1e-6},
    {"id": "F.C1a2", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 14.0, "p0": 5.8640777e6, "pa": 101325.0},
     "expect": 1.5404146, "tol": 1e-6},

    # -----------------------------------------------------------------
    # C2 — eroded-throat expansion-ratio loss
    # -----------------------------------------------------------------
    {"id": "F.C2c1", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 8.6538462, "p0": PC_SOLID, "pa": 0.0},
     "expect": 1.7349490, "tol": 1e-6},
    {"id": "F.C2c2", "fn": "isp_from_c",
     "args": {"c_eff": 1545.0 * 1.7349490099},
     "expect": 273.33455, "tol": 1e-6},

    # -----------------------------------------------------------------
    # D — architecture sizing. propellant_for_dv(isp, m_final, dv) is the
    # rocket equation solved for propellant against the *burnout* mass, so
    # each entry below is the converged stage of the key's back-substitution.
    # -----------------------------------------------------------------
    {"id": "F.D1a", "fn": "propellant_for_dv",
     "args": {"isp": 225.0, "m_final": 633.9205084, "dv": 120.0},
     "expect": 35.430387, "tol": 1e-6},
    {"id": "F.D1b", "fn": "propellant_for_dv",
     "args": {"isp": 289.0, "m_final": 719.9631436, "dv": 1450.0},
     "expect": 480.93180, "tol": 1e-6},
    {"id": "F.D1c", "fn": "propellant_for_dv",
     "args": {"isp": 315.0, "m_final": 730.8124912, "dv": 1570.0},
     "expect": 484.06246, "tol": 1e-6},
    {"id": "F.D1d", "fn": "propellant_for_dv",
     "args": {"isp": 322.0, "m_final": 707.5210728, "dv": 1570.0},
     "expect": 455.71165, "tol": 1e-6},
    # sensitivity points on architecture B (m_final recomputed at each)
    {"id": "F.D1e", "fn": "propellant_for_dv",
     "args": {"isp": 305.0, "m_final": 735.5491935, "dv": 1570.0},
     "expect": 507.74597, "tol": 1e-6},
    {"id": "F.D1f", "fn": "propellant_for_dv",
     "args": {"isp": 325.0, "m_final": 726.4923586, "dv": 1570.0},
     "expect": 462.46179, "tol": 1e-6},
]
