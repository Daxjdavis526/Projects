"""
Capstone — worked arithmetic for the three reference solutions.

Every entry below is a step that appears verbatim in capstone-key.md and that
maps onto a function in tools/rocket.py.  Steps that do NOT map onto a library
function are listed in the comment block at the bottom with the value the key
reports, so that the whole chain can still be audited by hand.

Run with:  python3 tools/check_examples.py

--------------------------------------------------------------------------
STANDING CONVENTIONS
--------------------------------------------------------------------------
    Ru = 8314.46 J/(kmol K)      g0 = 9.80665 m/s^2      pa,SL = 101325 Pa
    R  = Ru / M                  c*_delivered = eta_c* * c*_ideal
    Isp = c* * Cf * eta_n / g0   (eta_n = 0.98 liquid, 0.96 solid)

    Chamber-state tables are the [A] tables in capstone.md: representative
    equilibrium values, not CEA transcripts.  Delivered performance therefore
    carries roughly +-1.5 % on c* and +-2 s on Isp before hardware exists.

--------------------------------------------------------------------------
MISSION A — reusable medium-launcher first-stage engine
--------------------------------------------------------------------------
    GLOW ceiling 460,000 kg -> W0 = 4,511.1 kN
    T/W >= 1.25 (A1.4)      -> F_SL,total >= 5,638.8 kN
    T/W >= 1.05 one-out at T+0 (A1.5) -> (N-1)/N >= 1.05/1.25 = 0.84
                                      -> N >= 6.25 -> N = 7
    Engine: F_SL = 850 kN, 7 of them -> 5,950 kN, T/W = 1.319
            one out -> 5,100 kN, T/W = 1.131

    Candidates (gamma, M, T0, eta_c*, pc, pe_design):
      A1 LOX/RP-1 GG      1.20  23.0  3600  0.960  100 bar  0.60 bar
      A2 LOX/CH4 GG       1.20  21.3  3550  0.960  100 bar  0.60 bar
      A3 LOX/CH4 ORSC     1.19  21.6  3600  0.975  180 bar  0.65 bar   <- recommended
      A4 LOX/CH4 FFSC     1.19  21.9  3640  0.980  280 bar  0.70 bar
      A5 LOX/CH4 e-pump   1.20  21.1  3520  0.955   60 bar  0.55 bar

    Bartz inputs (both hydrocarbons, [A]):
      mu0 = 1.0e-4 Pa s, cp0 = 2500 J/(kg K), Pr0 = 0.52,
      rc = 1.5 * R_throat, Twg = 800 K, wall 0.8 mm of k = 300 W/(m K).

--------------------------------------------------------------------------
MISSION B — Mars orbit insertion + landing stage, 1,200 kg lander
--------------------------------------------------------------------------
    Three legs and one jettison:
      leg 1  TCM + MOI + trim  1,150 m/s  (aeroshell attached)
      leg 2  deorbit              90 m/s  (aeroshell attached)
      -- jettison aeroshell + backshell, 550 kg (B1.17) --
      leg 3  powered descent     620 m/s
      -> 1,200 kg landed (B1.1)

    MON-3/MMH at r = 1.65, pc = 10 bar: M = 21.2, T0 = 3120 K, gamma = 1.24,
    eta_c* = 0.975.

    The constraint that decides the mission:
      B1.10  T/W >= 2.2 at descent start (1,474.1 kg, 5,485 N on Mars)
             -> F_descent >= 12,070 N
      B1.12  De <= 500 mm below 30 m altitude
      -> a SINGLE engine is capped at eps = 28.94 and Isp = 298.9 s,
         and pays that penalty on the 1,050 m/s orbit insertion as well.

--------------------------------------------------------------------------
MISSION C — sounding-rocket-class motor
--------------------------------------------------------------------------
    Itot = 155 kN s, tb = 8.0 s, pc = 7.0 MPa, eps = 8, eta_n = 0.96.
      C1 aluminized AP/HTPB/Al : rho 1770, c*i 1550 (M 27.5, T0 3300, g 1.18),
                                 eta_c* 0.95, n 0.35, r(7 MPa) 8.0 mm/s,
                                 sigma_p 0.0020 /K
      C2 reduced-smoke AP/HTPB : rho 1720, c*i 1500 (M 25.9, T0 2950, g 1.20),
                                 eta_c* 0.96, n 0.30, r(7 MPa) 7.0 mm/s,
                                 sigma_p 0.0018 /K            <- recommended
    a = r / p^n  with a in (m/s)/Pa^n; Kn = Ab/At; MEOP = pc_hot * 1.10;
    design burst = 1.5 * MEOP.
"""

EXAMPLES = [

    # ==================================================================
    # Mission A
    # ==================================================================
    {"id": "A.A1.cstar", "fn": "c_star",
     "args": {"gamma": 1.2, "R": 361.4983, "T0": 3600.0},
     "expect": 1759.03113, "tol": 0.002},
    {"id": "A.A1.eps", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.2, "p0": 10000000.0, "pa": 60000.0},
     "expect": 17.56021, "tol": 0.002},
    {"id": "A.A1.Cf_sl", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 17.56, "p0": 10000000.0, "pa": 101325.0},
     "expect": 1.629093, "tol": 0.002},
    {"id": "A.A1.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 17.56, "p0": 10000000.0, "pa": 0.0},
     "expect": 1.807019, "tol": 0.002},
    {"id": "A.A1.Isp_sl", "fn": "isp_from_c",
     "args": {"c_eff": 2695.976},
     "expect": 274.913044, "tol": 0.002},
    {"id": "A.A1.Isp_vac", "fn": "isp_from_c",
     "args": {"c_eff": 2990.431},
     "expect": 304.939097, "tol": 0.002},
    {"id": "A.A1.At", "fn": "throat_area_from_thrust",
     "args": {"F": 850000.0, "p0": 10000000.0, "Cf_val": 1.59651},
     "expect": 0.053241, "tol": 0.002},
    {"id": "A.A1.Isp_S2", "fn": "isp_from_c",
     "args": {"c_eff": 3219.121},
     "expect": 328.258988, "tol": 0.002},
    {"id": "A.A2.cstar", "fn": "c_star",
     "args": {"gamma": 1.2, "R": 390.3502, "T0": 3550.0},
     "expect": 1815.141662, "tol": 0.002},
    {"id": "A.A2.eps", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.2, "p0": 10000000.0, "pa": 60000.0},
     "expect": 17.56021, "tol": 0.002},
    {"id": "A.A2.Cf_sl", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 17.56, "p0": 10000000.0, "pa": 101325.0},
     "expect": 1.629093, "tol": 0.002},
    {"id": "A.A2.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 17.56, "p0": 10000000.0, "pa": 0.0},
     "expect": 1.807019, "tol": 0.002},
    {"id": "A.A2.Isp_sl", "fn": "isp_from_c",
     "args": {"c_eff": 2781.979},
     "expect": 283.682909, "tol": 0.002},
    {"id": "A.A2.Isp_vac", "fn": "isp_from_c",
     "args": {"c_eff": 3085.829},
     "expect": 314.666986, "tol": 0.002},
    {"id": "A.A2.At", "fn": "throat_area_from_thrust",
     "args": {"F": 850000.0, "p0": 10000000.0, "Cf_val": 1.59651},
     "expect": 0.053241, "tol": 0.002},
    {"id": "A.A2.Isp_S2", "fn": "isp_from_c",
     "args": {"c_eff": 3344.375},
     "expect": 341.031341, "tol": 0.002},
    {"id": "A.A3.cstar", "fn": "c_star",
     "args": {"gamma": 1.19, "R": 384.9287, "T0": 3600.0},
     "expect": 1820.613288, "tol": 0.002},
    {"id": "A.A3.eps", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.19, "p0": 18000000.0, "pa": 65000.0},
     "expect": 26.775745, "tol": 0.002},
    {"id": "A.A3.Cf_sl", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 26.776, "p0": 18000000.0, "pa": 101325.0},
     "expect": 1.707569, "tol": 0.002},
    {"id": "A.A3.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 26.776, "p0": 18000000.0, "pa": 0.0},
     "expect": 1.858296, "tol": 0.002},
    {"id": "A.A3.Isp_sl", "fn": "isp_from_c",
     "args": {"c_eff": 2970.485},
     "expect": 302.905171, "tol": 0.002},
    {"id": "A.A3.Isp_vac", "fn": "isp_from_c",
     "args": {"c_eff": 3232.695},
     "expect": 329.64315, "tol": 0.002},
    {"id": "A.A3.At", "fn": "throat_area_from_thrust",
     "args": {"F": 850000.0, "p0": 18000000.0, "Cf_val": 1.67342},
     "expect": 0.028219, "tol": 0.002},
    {"id": "A.A3.Isp_S2", "fn": "isp_from_c",
     "args": {"c_eff": 3441.485},
     "expect": 350.933805, "tol": 0.002},
    {"id": "A.A4.cstar", "fn": "c_star",
     "args": {"gamma": 1.19, "R": 379.6557, "T0": 3640.0},
     "expect": 1818.117577, "tol": 0.002},
    {"id": "A.A4.eps", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.19, "p0": 28000000.0, "pa": 70000.0},
     "expect": 35.77613, "tol": 0.002},
    {"id": "A.A4.Cf_sl", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 35.776, "p0": 28000000.0, "pa": 101325.0},
     "expect": 1.75578, "tol": 0.002},
    {"id": "A.A4.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 35.776, "p0": 28000000.0, "pa": 0.0},
     "expect": 1.885244, "tol": 0.002},
    {"id": "A.A4.Isp_sl", "fn": "isp_from_c",
     "args": {"c_eff": 3065.811},
     "expect": 312.625718, "tol": 0.002},
    {"id": "A.A4.Isp_vac", "fn": "isp_from_c",
     "args": {"c_eff": 3291.864},
     "expect": 335.676709, "tol": 0.002},
    {"id": "A.A4.At", "fn": "throat_area_from_thrust",
     "args": {"F": 850000.0, "p0": 28000000.0, "Cf_val": 1.72066},
     "expect": 0.017643, "tol": 0.002},
    {"id": "A.A4.Isp_S2", "fn": "isp_from_c",
     "args": {"c_eff": 3463.526},
     "expect": 353.181362, "tol": 0.002},
    {"id": "A.A5.cstar", "fn": "c_star",
     "args": {"gamma": 1.2, "R": 394.0502, "T0": 3520.0},
     "expect": 1816.00171, "tol": 0.002},
    {"id": "A.A5.eps", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.2, "p0": 6000000.0, "pa": 55000.0},
     "expect": 12.684928, "tol": 0.002},
    {"id": "A.A5.Cf_sl", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 12.685, "p0": 6000000.0, "pa": 101325.0},
     "expect": 1.556805, "tol": 0.002},
    {"id": "A.A5.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 12.685, "p0": 6000000.0, "pa": 0.0},
     "expect": 1.771023, "tol": 0.002},
    {"id": "A.A5.Isp_sl", "fn": "isp_from_c",
     "args": {"c_eff": 2645.946},
     "expect": 269.811403, "tol": 0.002},
    {"id": "A.A5.Isp_vac", "fn": "isp_from_c",
     "args": {"c_eff": 3010.016},
     "expect": 306.936212, "tol": 0.002},
    {"id": "A.A5.At", "fn": "throat_area_from_thrust",
     "args": {"F": 850000.0, "p0": 6000000.0, "Cf_val": 1.52567},
     "expect": 0.092855, "tol": 0.002},
    {"id": "A.A5.Isp_S2", "fn": "isp_from_c",
     "args": {"c_eff": 3292.347},
     "expect": 335.725961, "tol": 0.002},
    {"id": "A.A3.Me", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.19, "eps": 26.78},
     "expect": 3.912924, "tol": 0.002},
    {"id": "A.A3.p_sep_schmucker", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.9134},
     "expect": 31018.929261, "tol": 0.003},
    {"id": "A.A3.p_sep_summerfield", "fn": "summerfield_separation_pressure",
     "args": {"p0": 101325.0},
     "expect": 40530.0, "tol": 0.002},
    {"id": "A.A1.sigma", "fn": "bartz_sigma",
     "args": {"gamma": 1.2, "Mach": 1.0, "Tw_over_T0": 0.222222},
     "expect": 1.365054, "tol": 0.002},
    {"id": "A.A1.hg", "fn": "bartz_hg",
     "args": {"Dt": 0.2604, "mu0": 0.0001, "cp0": 2500.0, "Pr0": 0.52, "p0": 10000000.0, "c_star_val": 1759.03, "rc": 0.1953, "A_ratio": 1.0, "sigma": 1.36505},
     "expect": 28288.309203, "tol": 0.003},
    {"id": "A.A1.Taw", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.2, "Mach": 1.0, "r": 0.9},
     "expect": 3567.272727, "tol": 0.002},
    {"id": "A.A1.q_throat", "fn": "heat_flux",
     "args": {"hg": 28288.3, "Taw": 3567.3, "Twg": 800.0},
     "expect": 78282212.59, "tol": 0.003},
    {"id": "A.A1.dT_wall", "fn": "wall_dT",
     "args": {"q": 78282213.0, "t": 0.0008, "k": 300.0},
     "expect": 208.752568, "tol": 0.003},
    {"id": "A.A1.sigma_th", "fn": "thermal_stress_hoop",
     "args": {"E": 120000000000.0, "alpha": 1.7e-05, "dT": 208.8, "nu": 0.34},
     "expect": 322690909.090909, "tol": 0.003},
    {"id": "A.A2.sigma", "fn": "bartz_sigma",
     "args": {"gamma": 1.2, "Mach": 1.0, "Tw_over_T0": 0.225352},
     "expect": 1.362492, "tol": 0.002},
    {"id": "A.A2.hg", "fn": "bartz_hg",
     "args": {"Dt": 0.2604, "mu0": 0.0001, "cp0": 2500.0, "Pr0": 0.52, "p0": 10000000.0, "c_star_val": 1815.14, "rc": 0.1953, "A_ratio": 1.0, "sigma": 1.36249},
     "expect": 27534.820503, "tol": 0.003},
    {"id": "A.A2.Taw", "fn": "adiabatic_wall_T",
     "args": {"T0": 3550.0, "gamma": 1.2, "Mach": 1.0, "r": 0.9},
     "expect": 3517.727273, "tol": 0.002},
    {"id": "A.A2.q_throat", "fn": "heat_flux",
     "args": {"hg": 27534.8, "Taw": 3517.7, "Twg": 800.0},
     "expect": 74831325.96, "tol": 0.003},
    {"id": "A.A2.dT_wall", "fn": "wall_dT",
     "args": {"q": 74831326.0, "t": 0.0008, "k": 300.0},
     "expect": 199.550203, "tol": 0.003},
    {"id": "A.A2.sigma_th", "fn": "thermal_stress_hoop",
     "args": {"E": 120000000000.0, "alpha": 1.7e-05, "dT": 199.6, "nu": 0.34},
     "expect": 308472727.272727, "tol": 0.003},
    {"id": "A.A3.sigma", "fn": "bartz_sigma",
     "args": {"gamma": 1.19, "Mach": 1.0, "Tw_over_T0": 0.222222},
     "expect": 1.366631, "tol": 0.002},
    {"id": "A.A3.hg", "fn": "bartz_hg",
     "args": {"Dt": 0.1896, "mu0": 0.0001, "cp0": 2500.0, "Pr0": 0.52, "p0": 18000000.0, "c_star_val": 1820.61, "rc": 0.1422, "A_ratio": 1.0, "sigma": 1.36663},
     "expect": 46982.159246, "tol": 0.003},
    {"id": "A.A3.Taw", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.19, "Mach": 1.0, "r": 0.9},
     "expect": 3568.767123, "tol": 0.002},
    {"id": "A.A3.q_throat", "fn": "heat_flux",
     "args": {"hg": 46982.2, "Taw": 3568.8, "Twg": 800.0},
     "expect": 130084315.36, "tol": 0.003},
    {"id": "A.A3.dT_wall", "fn": "wall_dT",
     "args": {"q": 130084315.0, "t": 0.0008, "k": 300.0},
     "expect": 346.891507, "tol": 0.003},
    {"id": "A.A3.sigma_th", "fn": "thermal_stress_hoop",
     "args": {"E": 120000000000.0, "alpha": 1.7e-05, "dT": 346.9, "nu": 0.34},
     "expect": 536118181.818182, "tol": 0.003},
    {"id": "A.A4.sigma", "fn": "bartz_sigma",
     "args": {"gamma": 1.19, "Mach": 1.0, "Tw_over_T0": 0.21978},
     "expect": 1.368633, "tol": 0.002},
    {"id": "A.A4.hg", "fn": "bartz_hg",
     "args": {"Dt": 0.1499, "mu0": 0.0001, "cp0": 2500.0, "Pr0": 0.52, "p0": 28000000.0, "c_star_val": 1818.12, "rc": 0.112425, "A_ratio": 1.0, "sigma": 1.36863},
     "expect": 70300.650338, "tol": 0.003},
    {"id": "A.A4.Taw", "fn": "adiabatic_wall_T",
     "args": {"T0": 3640.0, "gamma": 1.19, "Mach": 1.0, "r": 0.9},
     "expect": 3608.420091, "tol": 0.002},
    {"id": "A.A4.q_throat", "fn": "heat_flux",
     "args": {"hg": 70300.7, "Taw": 3608.4, "Twg": 800.0},
     "expect": 197432485.88, "tol": 0.003},
    {"id": "A.A4.dT_wall", "fn": "wall_dT",
     "args": {"q": 197432486.0, "t": 0.0008, "k": 300.0},
     "expect": 526.486629, "tol": 0.003},
    {"id": "A.A4.sigma_th", "fn": "thermal_stress_hoop",
     "args": {"E": 120000000000.0, "alpha": 1.7e-05, "dT": 526.5, "nu": 0.34},
     "expect": 813681818.181818, "tol": 0.003},
    {"id": "A.A5.sigma", "fn": "bartz_sigma",
     "args": {"gamma": 1.2, "Mach": 1.0, "Tw_over_T0": 0.227273},
     "expect": 1.360926, "tol": 0.002},
    {"id": "A.A5.hg", "fn": "bartz_hg",
     "args": {"Dt": 0.3438, "mu0": 0.0001, "cp0": 2500.0, "Pr0": 0.52, "p0": 6000000.0, "c_star_val": 1816.0, "rc": 0.25785, "A_ratio": 1.0, "sigma": 1.36093},
     "expect": 17282.563541, "tol": 0.003},
    {"id": "A.A5.Taw", "fn": "adiabatic_wall_T",
     "args": {"T0": 3520.0, "gamma": 1.2, "Mach": 1.0, "r": 0.9},
     "expect": 3488.0, "tol": 0.002},
    {"id": "A.A5.q_throat", "fn": "heat_flux",
     "args": {"hg": 17282.6, "Taw": 3488.0, "Twg": 800.0},
     "expect": 46455628.8, "tol": 0.003},
    {"id": "A.A5.dT_wall", "fn": "wall_dT",
     "args": {"q": 46455629.0, "t": 0.0008, "k": 300.0},
     "expect": 123.881677, "tol": 0.003},
    {"id": "A.A5.sigma_th", "fn": "thermal_stress_hoop",
     "args": {"E": 120000000000.0, "alpha": 1.7e-05, "dT": 123.9, "nu": 0.34},
     "expect": 191481818.181818, "tol": 0.003},
    {"id": "A.A4.dT_wall_0p5mm", "fn": "wall_dT",
     "args": {"q": 197400000.0, "t": 0.0005, "k": 300.0},
     "expect": 329.0, "tol": 0.003},
    {"id": "A.A3.P_ox", "fn": "pump_power",
     "args": {"mdot": 222.56, "dp": 32000000.0, "rho": 1141.0, "eta": 0.72},
     "expect": 8669198.558769, "tol": 0.002},
    {"id": "A.A3.P_fuel", "fn": "pump_power",
     "args": {"mdot": 63.59, "dp": 28500000.0, "rho": 423.0, "eta": 0.72},
     "expect": 5950600.866824, "tol": 0.002},
    {"id": "A.A3.NPSH_ox", "fn": "npsh_available",
     "args": {"p_tank": 350000.0, "p_vapor": 101300.0, "rho": 1141.0, "z": 0.0, "dp_line": 30000.0},
     "expect": 19.545306, "tol": 0.003},
    {"id": "A.A3.NPSH_fuel", "fn": "npsh_available",
     "args": {"p_tank": 350000.0, "p_vapor": 101300.0, "rho": 423.0, "z": 0.0, "dp_line": 20000.0},
     "expect": 55.132174, "tol": 0.003},
    {"id": "A.A3.Nss_ox", "fn": "suction_specific_speed_SI",
     "args": {"omega": 2303.83, "Q": 0.19506, "NPSH": 19.55},
     "expect": 19.748493, "tol": 0.005},
    {"id": "A.A3.Vc", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 0.9, "At": 0.028219},
     "expect": 0.025397, "tol": 0.002},
    {"id": "A.A3.t_stay", "fn": "residence_time",
     "args": {"Vc": 0.0253971, "rho_c": 12.989, "mdot": 286.15},
     "expect": 0.001153, "tol": 0.003},
    {"id": "A.A3.v_inj_ox", "fn": "orifice_velocity",
     "args": {"Cd": 0.75, "rho": 1141.0, "dp": 3600000.0},
     "expect": 59.577831, "tol": 0.002},
    {"id": "A.A3.dT_coolant", "fn": "coolant_bulk_rise",
     "args": {"Q": 44050000.0, "mdot": 63.59, "cp": 3600.0},
     "expect": 192.421939, "tol": 0.003},
    {"id": "A.A5.P_ox_epump", "fn": "pump_power",
     "args": {"mdot": 246.5, "dp": 9400000.0, "rho": 1141.0, "eta": 0.7},
     "expect": 2901089.270064, "tol": 0.002},
    {"id": "A.A5.P_fuel_epump", "fn": "pump_power",
     "args": {"mdot": 74.7, "dp": 9400000.0, "rho": 423.0, "eta": 0.7},
     "expect": 2371428.571429, "tol": 0.002},
    {"id": "A.veh.dv1_check", "fn": "tsiolkovsky_dv",
     "args": {"isp": 317.6, "m0": 460000.0, "mf": 127357.0},
     "expect": 3999.859771, "tol": 0.003},
    # ==================================================================
    # Mission B
    # ==================================================================
    {"id": "B.cstar_ideal", "fn": "c_star",
     "args": {"gamma": 1.24, "R": 392.1915, "T0": 3120.0},
     "expect": 1685.775154, "tol": 0.002},
    {"id": "B.Cf_eps28.94", "fn": "Cf",
     "args": {"gamma": 1.24, "eps": 28.94, "p0": 1000000.0, "pa": 0.0},
     "expect": 1.819709, "tol": 0.002},
    {"id": "B.Isp_eps28.94", "fn": "isp_from_c",
     "args": {"c_eff": 2931.109},
     "expect": 298.889937, "tol": 0.002},
    {"id": "B.Cf_eps60", "fn": "Cf",
     "args": {"gamma": 1.24, "eps": 60.0, "p0": 1000000.0, "pa": 0.0},
     "expect": 1.871226, "tol": 0.002},
    {"id": "B.Isp_eps60", "fn": "isp_from_c",
     "args": {"c_eff": 3014.091},
     "expect": 307.351746, "tol": 0.002},
    {"id": "B.Cf_eps100", "fn": "Cf",
     "args": {"gamma": 1.24, "eps": 100.0, "p0": 1000000.0, "pa": 0.0},
     "expect": 1.901197, "tol": 0.002},
    {"id": "B.Isp_eps100", "fn": "isp_from_c",
     "args": {"c_eff": 3062.368},
     "expect": 312.27463, "tol": 0.002},
    {"id": "B.Cf_eps120", "fn": "Cf",
     "args": {"gamma": 1.24, "eps": 120.0, "p0": 1000000.0, "pa": 0.0},
     "expect": 1.910868, "tol": 0.002},
    {"id": "B.Isp_eps120", "fn": "isp_from_c",
     "args": {"c_eff": 3077.944},
     "expect": 313.86294, "tol": 0.002},
    {"id": "B.Cf_eps150", "fn": "Cf",
     "args": {"gamma": 1.24, "eps": 150.0, "p0": 1000000.0, "pa": 0.0},
     "expect": 1.922041, "tol": 0.002},
    {"id": "B.Isp_eps150", "fn": "isp_from_c",
     "args": {"c_eff": 3095.942},
     "expect": 315.698225, "tol": 0.002},
    {"id": "B.Cf_eps200", "fn": "Cf",
     "args": {"gamma": 1.24, "eps": 200.0, "p0": 1000000.0, "pa": 0.0},
     "expect": 1.935451, "tol": 0.002},
    {"id": "B.Isp_eps200", "fn": "isp_from_c",
     "args": {"c_eff": 3117.541},
     "expect": 317.90071, "tol": 0.002},
    {"id": "B.eps_max_single.At", "fn": "throat_area_from_thrust",
     "args": {"F": 12070.0, "p0": 1000000.0, "Cf_val": 1.78331},
     "expect": 0.006768, "tol": 0.002},
    {"id": "B.B2.At_MOI", "fn": "throat_area_from_thrust",
     "args": {"F": 12000.0, "p0": 1000000.0, "Cf_val": 1.87265},
     "expect": 0.006408, "tol": 0.002},
    {"id": "B.B2.At_land", "fn": "throat_area_from_thrust",
     "args": {"F": 3500.0, "p0": 1000000.0, "Cf_val": 1.8338},
     "expect": 0.001909, "tol": 0.002},
    {"id": "B.Me_eps150", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.24, "eps": 150.0},
     "expect": 5.580668, "tol": 0.002},
    {"id": "B.B1.mp_descent", "fn": "propellant_for_dv",
     "args": {"isp": 298.89, "m_final": 1200.0, "dv": 620.0},
     "expect": 282.671527, "tol": 0.003},
    {"id": "B.B1.mp_deorbit", "fn": "propellant_for_dv",
     "args": {"isp": 298.89, "m_final": 2032.7, "dv": 90.0},
     "expect": 63.382348, "tol": 0.003},
    {"id": "B.B1.mp_MOI", "fn": "propellant_for_dv",
     "args": {"isp": 298.89, "m_final": 2096.1, "dv": 1150.0},
     "expect": 1007.061278, "tol": 0.003},
    {"id": "B.B2.mp_descent", "fn": "propellant_for_dv",
     "args": {"isp": 307.35, "m_final": 1200.0, "dv": 620.0},
     "expect": 274.064007, "tol": 0.003},
    {"id": "B.B2.mp_deorbit", "fn": "propellant_for_dv",
     "args": {"isp": 313.86, "m_final": 2024.1, "dv": 90.0},
     "expect": 60.059652, "tol": 0.003},
    {"id": "B.B2.mp_MOI", "fn": "propellant_for_dv",
     "args": {"isp": 313.86, "m_final": 2084.2, "dv": 1150.0},
     "expect": 944.140014, "tol": 0.003},
    {"id": "B.B3.mp_descent", "fn": "propellant_for_dv",
     "args": {"isp": 232.0, "m_final": 1200.0, "dv": 620.0},
     "expect": 375.908488, "tol": 0.003},
    {"id": "B.B3.mp_deorbit", "fn": "propellant_for_dv",
     "args": {"isp": 232.0, "m_final": 2125.9, "dv": 90.0},
     "expect": 85.781749, "tol": 0.003},
    {"id": "B.B3.mp_MOI", "fn": "propellant_for_dv",
     "args": {"isp": 232.0, "m_final": 2211.7, "dv": 1150.0},
     "expect": 1454.751236, "tol": 0.003},
    {"id": "B.B4.cstar", "fn": "c_star",
     "args": {"gamma": 1.16, "R": 415.723, "T0": 3450.0},
     "expect": 1869.359928, "tol": 0.002},
    {"id": "B.B4.Cf", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 150.0, "p0": 4000000.0, "pa": 0.0},
     "expect": 2.041015, "tol": 0.002},
    {"id": "B.B4.Isp", "fn": "isp_from_c",
     "args": {"c_eff": 3626.913},
     "expect": 369.842199, "tol": 0.002},
    {"id": "B.B4.mp_descent", "fn": "propellant_for_dv",
     "args": {"isp": 369.84, "m_final": 1200.0, "dv": 620.0},
     "expect": 223.711002, "tol": 0.003},
    {"id": "B.B4.mp_deorbit", "fn": "propellant_for_dv",
     "args": {"isp": 369.84, "m_final": 1973.7, "dv": 90.0},
     "expect": 49.589379, "tol": 0.003},
    {"id": "B.B4.mp_MOI", "fn": "propellant_for_dv",
     "args": {"isp": 369.84, "m_final": 2023.3, "dv": 1150.0},
     "expect": 754.907064, "tol": 0.003},
    {"id": "B.B5.mp_descent", "fn": "propellant_for_dv",
     "args": {"isp": 253.0, "m_final": 1200.0, "dv": 620.0},
     "expect": 340.66245, "tol": 0.003},
    {"id": "B.B5.mp_deorbit", "fn": "propellant_for_dv",
     "args": {"isp": 253.0, "m_final": 2090.7, "dv": 90.0},
     "expect": 77.231372, "tol": 0.003},
    {"id": "B.B5.mp_MOI", "fn": "propellant_for_dv",
     "args": {"isp": 253.0, "m_final": 2167.9, "dv": 1150.0},
     "expect": 1278.279846, "tol": 0.003},
    {"id": "B.B2.He_mass", "fn": "pressurant_mass",
     "args": {"p_tank": 1600000.0, "V_prop": 1.2165, "R_g": 2077.1, "T_g": 290.0},
     "expect": 3.231296, "tol": 0.003},
    {"id": "B.B2.blowdown_usable", "fn": "usable_fraction",
     "args": {"p_i": 31000000.0, "p_f": 2000000.0, "isothermal": True},
     "expect": 0.935484, "tol": 0.003},
    {"id": "B.B2.dv_check_MOI", "fn": "tsiolkovsky_dv",
     "args": {"isp": 313.86, "m0": 3092.1, "mf": 2148.0},
     "expect": 1121.325417, "tol": 0.02},
    # ==================================================================
    # Mission C
    # ==================================================================
    {"id": "C.C1.cstar_ideal", "fn": "c_star",
     "args": {"gamma": 1.18, "R": 302.344, "T0": 3300.0},
     "expect": 1549.547455, "tol": 0.002},
    {"id": "C.C2.cstar_ideal", "fn": "c_star",
     "args": {"gamma": 1.2, "R": 321.0216, "T0": 2950.0},
     "expect": 1500.538977, "tol": 0.002},
    {"id": "C.C1.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 8.0, "p0": 7000000.0, "pa": 0.0},
     "expect": 1.723929, "tol": 0.002},
    {"id": "C.C1.Cf_sl", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 8.0, "p0": 7000000.0, "pa": 101325.0},
     "expect": 1.608129, "tol": 0.002},
    {"id": "C.C2.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 8.0, "p0": 7000000.0, "pa": 0.0},
     "expect": 1.713283, "tol": 0.002},
    {"id": "C.C1.Isp_vac", "fn": "isp_from_c",
     "args": {"c_eff": 2436.947},
     "expect": 248.499437, "tol": 0.002},
    {"id": "C.C1.Isp_sl", "fn": "isp_from_c",
     "args": {"c_eff": 2273.252},
     "expect": 231.807192, "tol": 0.002},
    {"id": "C.C2.Isp_vac", "fn": "isp_from_c",
     "args": {"c_eff": 2368.443},
     "expect": 241.513973, "tol": 0.002},
    {"id": "C.C1.At", "fn": "throat_area_from_thrust",
     "args": {"F": 19375.0, "p0": 7000000.0, "Cf_val": 1.65497},
     "expect": 0.001672, "tol": 0.002},
    {"id": "C.C2.At", "fn": "throat_area_from_thrust",
     "args": {"F": 19375.0, "p0": 7000000.0, "Cf_val": 1.64475},
     "expect": 0.001683, "tol": 0.002},
    {"id": "C.C1.rate_check", "fn": "vieille_burn_rate",
     "args": {"a": 3.215923e-05, "p": 7000000.0, "n": 0.35},
     "expect": 0.008, "tol": 0.002},
    {"id": "C.C2.rate_check", "fn": "vieille_burn_rate",
     "args": {"a": 6.188261e-05, "p": 7000000.0, "n": 0.3},
     "expect": 0.007, "tol": 0.002},
    {"id": "C.C1.pc_equilibrium", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.215923e-05, "n": 0.35, "rho_p": 1770.0, "Ab": 0.5615, "At": 0.0016724, "c_star_val": 1472.5},
     "expect": 7000746.11573, "tol": 0.003},
    {"id": "C.C2.pc_equilibrium", "fn": "solid_equilibrium_pressure",
     "args": {"a": 6.188261e-05, "n": 0.3, "rho_p": 1720.0, "Ab": 0.6794, "At": 0.0016828, "c_star_val": 1440.0},
     "expect": 6999630.966898, "tol": 0.003},
    {"id": "C.C1.piK", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.002, "n": 0.35},
     "expect": 0.003077, "tol": 0.002},
    {"id": "C.C2.piK", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.0018, "n": 0.3},
     "expect": 0.002571, "tol": 0.002},
    {"id": "C.C1.pc_ratio_hot", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.00307692, "dT": 39.0},
     "expect": 1.127497, "tol": 0.002},
    {"id": "C.C1.pc_ratio_cold", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.00307692, "dT": -61.0},
     "expect": 0.82887, "tol": 0.002},
    {"id": "C.C2.pc_ratio_hot", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.00257143, "dT": 39.0},
     "expect": 1.105487, "tol": 0.002},
    {"id": "C.C2.pc_ratio_cold", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.00257143, "dT": -61.0},
     "expect": 0.854826, "tol": 0.002},
    {"id": "C.C1.r_ratio_hot", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.002, "dT": 39.0},
     "expect": 1.081123, "tol": 0.002},
    {"id": "C.C1.r_ratio_cold", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.002, "dT": -61.0},
     "expect": 0.885148, "tol": 0.002},
    {"id": "C.C1.Me", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.18, "eps": 8.0},
     "expect": 3.072318, "tol": 0.002},
    {"id": "C.C1.p_sep", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.0723},
     "expect": 37249.450616, "tol": 0.003},
    {"id": "C.C1.rho_Isp", "fn": "density_isp",
     "args": {"rho": 1770.0, "isp": 248.5},
     "expect": 439845.0, "tol": 0.002},
    {"id": "C.C2.rho_Isp", "fn": "density_isp",
     "args": {"rho": 1720.0, "isp": 241.51},
     "expect": 415397.2, "tol": 0.002},
]

# --------------------------------------------------------------------------
# Steps in capstone-key.md that do NOT map onto a rocket.py function
# --------------------------------------------------------------------------
# A.1.1  Engine count.  (N-1)/N >= 1.05/1.25 = 0.84 -> N >= 6.25 -> N = 7.
#        Pure algebra; no library call.
#
# A.1.5  Vehicle closure.  Iterative: stage inert masses are derived from a
#        propellant-mass-proportional structural coefficient ks scaled by
#        (1000/rho_bulk)^0.5, plus engines, plus 1,800 kg of recovery hardware;
#        the stage split dv2 is optimised.  Results (reusable / expended
#        payload, kg):
#            A1  9,388 / 11,480      A2 10,228 / 12,511
#            A3 11,585 / 14,095      A4 12,076 / 14,701
#            A5  7,589 / 10,002   (before the 10.3 t battery is added)
#        Requirement A1.1 is 10,000 kg reusable: A1 and A5 fail; A2 passes by
#        2.3 %; A3 and A4 by 16 % and 21 %.
#        Flip triggers computed the same way:
#            A2 fails A1.1 if eta_c* <= 0.9575, or if the recovery budget
#            exceeds 1,540 m/s.  A3 holds margin to 1,930 m/s.
#
# A.1.6  A5 battery.  E = 7 engines * 5.78 MW * 165 s = 6.68 GJ = 1,855 kWh.
#        At 180 Wh/kg usable -> 10,300 kg; at 250 Wh/kg -> 7,420 kg.
#        (The 5.78 MW is the registered pump_power pair divided by
#        eta_motor 0.95 and eta_inverter 0.96.)
#
# A.1.7  A4 at 0.8 mm gives Twc = 274 K, which is not a solution; the wall must
#        thin to 0.5 mm -> dT = 329 K, Twc = 471 K (registered as
#        A.A4.dT_wall_0p5mm).  Thermal stress then 508 MPa, still far above a
#        GRCop-class allowable of ~130 MPa at 800 K -- which is normal for a
#        regen chamber and is why liner life is counted in cycles.
#
# B.1.3  eps_max for a single engine: solve Dt*sqrt(eps) = 0.5 m with
#        At = F/(pc Cf eta_n) at F = 12,070 N, pc = 10 bar.  Root: eps = 28.94,
#        De = 500 mm, Isp = 298.9 s.  At pc = 20 bar the root moves to
#        eps = 59.50 and Isp = 307.3 s.
#
# B.1.4  Arrival wet mass = 1,200 + 550 + sum(legs) + 5 % reserve:
#            B1 3,173.5   B2 3,092.1   B3 3,762.3   B4 2,829.6   B5 3,531.0
#        Ceiling B1.14 = 3,200 kg -> B3 and B5 fail on arithmetic.
#
# B.1.8  Dry-mass budgets with maturity-based MGA and 15 % system margin:
#            B2 298.1 kg  (ceiling B1.13 = 340 kg, passes)
#            B4 497.4 kg  (fails by 46 %; cryocooler also breaks B1.15's 25 W)
#
# B.1.9  Plume-surface loading proxy = thrust / total exit area at touchdown:
#            B1 4,560 N / 0.1901 m2 = 24.0 kPa
#            B2 4,560 N / 0.4580 m2 = 10.0 kPa
#
# C.1.1  mp = Itot / (Isp_vac g0):  C1 63.60 kg, C2 65.44 kg.
#        mdot = mp / tb;  F = mdot Isp g0 = 19.375 kN for both.
#
# C.1.2  Ab = mdot / (rho_p r):  C1 0.5615 m2, C2 0.6794 m2.
#        Kn = Ab/At:            C1 335.7,      C2 403.7.
#        Both are closed back through solid_equilibrium_pressure above and
#        must return 7.000 MPa.
#
# C.1.3  MEOP = pc_hot * 1.10:  C1 8.68 MPa, C2 8.51 MPa.
#        Burst = 1.5 * MEOP:    C1 13.02 MPa, C2 12.77 MPa.
#        Wall t = p R / sigma at R = 0.13 m:
#            C1  CFRP 1.21 mm | 15-5PH 1.54 mm | 4130 2.73 mm
#        Action time scales as 1/r: C1 7.40 s hot, 9.04 s cold (0.04 s outside
#        the C1.2 band); C2 7.46 s / 8.93 s (inside).
#
# C.1.4  Reference vehicle (C-G9): 45 kg payload + 40 kg airframe + motor.
#        C1: liftoff 159.2 kg, burnout 95.6 kg.
#        Hot thrust 21.85 kN; with no throat erosion a = 23.3 g -> fails C1.4.
#        Carbon-phenolic at 0.10 mm/s over 8 s grows At by 7.05 %, so
#        pc_end/pc_start = (1/1.0705)^(1/0.65) = 0.900, thrust 19.7 kN,
#        a = 21.0 g -> compliant.  C2 lands at 20.7 g.
#
# C.1.5  Mass fraction mp/(mp + inert):
#            C1 0.857 (pass)  C2 0.862 (pass)
#            C3 0.775 (fail)  C3b 0.692 (fail)  C4 0.831 (fail)
#
# C.1.6  Hybrid: mp 64.5 kg at Isp 245 s, O/F 7 -> 56.45 kg N2O,
#        V = 0.0758 m3, oxidizer tank length at 260 mm ID = 1.427 m, against a
#        1,200 mm envelope (C1.6).  N2O critical temperature 36.4 C, against
#        firing at +60 C (C1.8) and storage at +71 C (C1.9).
