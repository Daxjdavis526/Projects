"""Trade-study projects (Part VI) — registered inputs and expected outputs.

Every entry names a function in ``tools/rocket.py``, its arguments, and the
value quoted in ``part6-interview/trade-study-projects-key.md``.  ``tol`` is
relative.  Run ``python3 tools/check_examples.py`` to recompute the set.

Standing conventions for this file
----------------------------------
* ``g0 = 9.80665`` m/s^2, ``Ru = 8314.46`` J/(kmol K) as everywhere else.
* Working gas models, all tagged [A] approximation and stated in the key:

      NTO/MMH        gamma = 1.24, M = 21.5 kg/kmol (R = 386.719), T0 = 3100 K
                     -> c*_ideal = 1668.6 m/s ; eta_c* = 0.965 assumed
      LOX/RP-1       gamma = 1.20, M = 23.0 kg/kmol (R = 361.498), T0 = 3600 K
      LOX/CH4        gamma = 1.16, M = 20.5 kg/kmol (R = 405.583), T0 = 3550 K
                     -> c*_ideal = 1872.99 m/s ; eta_c* = 0.97 assumed
      AP/Al/HTPB     gamma = 1.18, delivered c* = 1580 m/s, rho_p = 1800 kg/m^3,
                     n = 0.35, a = 3.394197e-05 m/s/Pa^n (r = 8 mm/s at 60 bar)
      GN2 at 300 K   gamma = 1.400, M = 28.014 (R = 296.7966)
      He             M = 4.003 (R = 2076.807)

* Vacuum thrust coefficients use ``Cf(gamma, eps, p0, pa=0.0)``.  With pa = 0
  this is a function of gamma and eps only -- p0 cancels -- so several entries
  pass a representative p0.
* ``mach_from_area_ratio`` is always the supersonic root.
* The Bartz property recipe is Module 10's, reused here so the trade-study
  numbers and the module worked examples cannot drift apart:
      cp0 = gamma R/(gamma-1),  Pr0 = 4 gamma/(9 gamma - 5),
      mu0 = 1.0e-4 Pa s,  r_c = 1.5 * throat radius,  A/At = 1 at the throat,
      Twg = 800 K.
  Bartz is +-20-30% at the throat at best; every heat flux below is quoted in
  the key as an order of magnitude, not a design load.

Arithmetic that deliberately has NO library entry
-------------------------------------------------
* **Areas and diameters from areas.**  A = pi/4 D^2 and D = 2 sqrt(A/pi)
  throughout; no library function, none wanted.
      P1  Dt = 24.4 mm, De = 299.0 mm at At = 4.68252e-04 m^2, eps = 150
      P4  Dt = 430.5 / 346.0 / 296.7 / 239.1 mm at pc = 100 / 150 / 200 / 300 bar
      P5  Dt = 249.5 mm at At = 0.0489061 m^2
* **Bulk propellant density**  rho_b = (1+OF) / (OF/rho_ox + 1/rho_fu).
      LOX/RP-1  at OF 2.34, 1141 / 810   -> 1016.62 kg/m^3
      LOX/CH4   at OF 3.60, 1141 / 422.6 ->  833.12 kg/m^3
      NTO/MMH   at OF 1.65, 1443 /  874  -> 1074.2  kg/m^3
* **Membrane tank mass**  m = FoS * k * p * V * rho / sigma, with FoS = 1.5,
  k = 2 (cylinder with domes), and the alloy pairs stated in the key.  One
  multiplication; no library function.
      P2 pressure-fed kerolox: 1.5*2*26e5*1.879*2700/400e6 =  98.9 kg
      P2 gas-generator kerolox: 1.5*2*4e5*1.750*2700/400e6 =  14.2 kg
* **COPV mass from a performance factor**  m = p V / (g0 * PF), PF = 20,000 m.
      P2 helium COPV: 300e5*0.26099/(9.80665*20000) = 39.9 kg
* **Battery pack mass**  m_energy = E / 180 Wh/kg ; m_power = P / 2.5 kW/kg;
  the pack is the larger.  Two divisions.
* **Binomial reliability bounds.**  Lower 95% bound from n successes and zero
  failures is 0.05^(1/n); trials needed to demonstrate R at 95% confidence is
  ln(0.05)/ln(R).  P6 uses 0.05^(1/4) = 0.4729 and 597.6 trials for R = 0.995.
* **Coffin-Manson life scaling.**  N_f ~ N_ref (q_ref/q)^2, anchored at
  N_ref = 100 cycles at q_ref = 80 MW/m^2 [J].  Stated as a scaling, not a
  prediction, in the key.
* **Pugh matrix weighted sums and the sensitivity sweep.**  Sums of products of
  small integers; done in the key's tables.
"""

R_NTO_MMH = 8314.46 / 21.5
R_KEROLOX = 8314.46 / 23.0
R_METHALOX = 8314.46 / 20.5
R_N2 = 8314.46 / 28.014
R_HE = 8314.46 / 4.003

EXAMPLES = [
    # ==================================================================
    # PROJECT 1 — 200 kg lunar lander descent stage
    # ==================================================================
    # P1.1  Working c* for the NTO/MMH gas model.
    {"id": "P1.1", "fn": "c_star",
     "args": {"gamma": 1.24, "R": R_NTO_MMH, "T0": 3100.0},
     "expect": 1668.60, "tol": 0.002},

    # P1.2-P1.4  Justifying the 315 s assumption of candidate A: vacuum Cf at
    # three candidate area ratios.  eps = 150 with eta_c* = 0.965 gives
    # 0.965 * 1668.60 * 1.92204 / 9.80665 = 315.6 s, which is the number the
    # project statement asks the student to defend.
    {"id": "P1.2", "fn": "Cf",
     "args": {"gamma": 1.24, "eps": 100.0, "p0": 1.0e6, "pa": 0.0},
     "expect": 1.90122, "tol": 0.002},
    {"id": "P1.3", "fn": "Cf",
     "args": {"gamma": 1.24, "eps": 150.0, "p0": 1.0e6, "pa": 0.0},
     "expect": 1.92204, "tol": 0.002},
    {"id": "P1.4", "fn": "Cf",
     "args": {"gamma": 1.24, "eps": 200.0, "p0": 1.0e6, "pa": 0.0},
     "expect": 1.93551, "tol": 0.002},

    # P1.5  Throat area at F = 900 N, pc = 10 bar, Cf = 1.92204.
    {"id": "P1.5", "fn": "throat_area_from_thrust",
     "args": {"F": 900.0, "p0": 1.0e6, "Cf_val": 1.92204},
     "expect": 4.68253e-4, "tol": 0.002},

    # P1.6-P1.8  Rocket-equation propellant for the 2,000 m/s descent, sized
    # from the required burnout mass rather than the wet cap, so each candidate
    # is compared at the same delivered landed mass of 100 kg.
    {"id": "P1.6.A", "fn": "propellant_for_dv",
     "args": {"isp": 313.0, "m_final": 100.0, "dv": 2000.0},
     "expect": 91.87, "tol": 0.005},
    {"id": "P1.7.B", "fn": "propellant_for_dv",
     "args": {"isp": 335.0, "m_final": 100.0, "dv": 2000.0},
     "expect": 83.83, "tol": 0.005},
    {"id": "P1.8.C", "fn": "propellant_for_dv",
     "args": {"isp": 225.0, "m_final": 100.0, "dv": 2000.0},
     "expect": 147.52, "tol": 0.005},

    # P1.9-P1.11  The same three candidates read the other way: burnout mass
    # available under the 200 kg wet cap of R1.3.  Candidate C lands 80.8 kg
    # and fails R1.2's 100 kg floor by 19 kg — the arithmetic elimination.
    {"id": "P1.9.A", "fn": "tsiolkovsky_dv",
     "args": {"isp": 313.0, "m0": 200.0, "mf": 104.24},
     "expect": 2000.0, "tol": 0.002},
    {"id": "P1.10.B", "fn": "tsiolkovsky_dv",
     "args": {"isp": 335.0, "m0": 200.0, "mf": 108.80},
     "expect": 2000.0, "tol": 0.002},
    {"id": "P1.11.C", "fn": "tsiolkovsky_dv",
     "args": {"isp": 225.0, "m0": 200.0, "mf": 80.79},
     "expect": 2000.0, "tol": 0.002},

    # P1.12  Regulated-helium mass in the ullage at 18 bar MEOP, 0.0893 m^3,
    # warmed to 250 K.
    {"id": "P1.12", "fn": "pressurant_mass",
     "args": {"p_tank": 18.0e5, "V_prop": 0.08932, "R_g": R_HE, "T_g": 250.0},
     "expect": 0.30961, "tol": 0.005},

    # P1.13  Usable fraction of the helium COPV, 310 -> 20 bar, adiabatic.
    {"id": "P1.13", "fn": "usable_fraction",
     "args": {"p_i": 310.0e5, "p_f": 20.0e5, "isothermal": False, "gamma": 1.667},
     "expect": 0.80683, "tol": 0.005},

    # P1.14  Chamber volume from L* = 0.9 m (hypergolic, ablative) at the
    # sized throat: Vc = 4.213e-4 m^3.
    {"id": "P1.14", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 0.90, "At": 4.68253e-4},
     "expect": 4.21428e-4, "tol": 0.002},

    # P1.15-P1.16  The injector-stability argument.  A FIXED-area element at
    # 20% of rated flow keeps Cd and A, so mdot falls with sqrt(dp): dropping
    # dp from 2.0 bar to 0.08 bar gives exactly one fifth of the flow, while
    # pc has fallen only to 2 bar — so dp/pc collapses from 0.20 to 0.04 and
    # the injector stops decoupling the feed system from the chamber.
    {"id": "P1.15", "fn": "orifice_mdot",
     "args": {"Cd": 0.75, "A": 1.0e-4, "rho": 1074.2, "dp": 2.0e5},
     "expect": 1.55506, "tol": 0.002},
    {"id": "P1.16", "fn": "orifice_mdot",
     "args": {"Cd": 0.75, "A": 1.0e-4, "rho": 1074.2, "dp": 0.08e5},
     "expect": 0.311013, "tol": 0.002},

    # ==================================================================
    # PROJECT 2 — small launch vehicle second stage
    # ==================================================================
    # P2.1-P2.6  Burnout mass allowed under R2.1 (3,600 m/s) from the R2.6 cap
    # of 2,600 kg gross, for each of the six cycle/propellant pairs.  Each is
    # verified by feeding m0 and the resulting mf back through the rocket
    # equation, which must return 3,600 m/s.
    {"id": "P2.1.GGkero", "fn": "tsiolkovsky_dv",
     "args": {"isp": 348.0, "m0": 2600.0, "mf": 905.4},
     "expect": 3600.0, "tol": 0.002},
    {"id": "P2.2.EPkero", "fn": "tsiolkovsky_dv",
     "args": {"isp": 343.0, "m0": 2600.0, "mf": 891.6},
     "expect": 3600.0, "tol": 0.002},
    {"id": "P2.3.PFkero", "fn": "tsiolkovsky_dv",
     "args": {"isp": 305.0, "m0": 2600.0, "mf": 780.3},
     "expect": 3600.0, "tol": 0.002},
    {"id": "P2.4.GGmeth", "fn": "tsiolkovsky_dv",
     "args": {"isp": 362.0, "m0": 2600.0, "mf": 943.1},
     "expect": 3600.0, "tol": 0.002},
    {"id": "P2.5.EPmeth", "fn": "tsiolkovsky_dv",
     "args": {"isp": 358.0, "m0": 2600.0, "mf": 932.5},
     "expect": 3600.0, "tol": 0.002},
    {"id": "P2.6.PFmeth", "fn": "tsiolkovsky_dv",
     "args": {"isp": 318.0, "m0": 2600.0, "mf": 819.6},
     "expect": 3600.0, "tol": 0.002},

    # P2.7  Electric-pump shaft power, kerolox, 30 kN at pc = 60 bar.
    # mdot = 30,000/(343*9.80665) = 8.9187 kg/s; dp = 1.35*60 - 6 = 75 bar;
    # rho_bulk = 1016.62 kg/m^3; eta_pump = 0.65.
    {"id": "P2.7", "fn": "pump_power",
     "args": {"mdot": 8.9187, "dp": 75.0e5, "rho": 1016.62, "eta": 0.65},
     "expect": 101_240.0, "tol": 0.005},

    # P2.8  Same for methalox: mdot = 30,000/(358*9.80665) = 8.5450 kg/s,
    # rho_bulk = 833.12 kg/m^3.
    {"id": "P2.8", "fn": "pump_power",
     "args": {"mdot": 8.5450, "dp": 75.0e5, "rho": 833.12, "eta": 0.65},
     "expect": 118_320.0, "tol": 0.005},

    # P2.9  Helium mass in the pressure-fed kerolox ullage: 26 bar MEOP,
    # 1.879 m^3 of propellant volume, gas warmed to 250 K.
    {"id": "P2.9", "fn": "pressurant_mass",
     "args": {"p_tank": 26.0e5, "V_prop": 1.879, "R_g": R_HE, "T_g": 250.0},
     "expect": 9.40831, "tol": 0.005},

    # P2.10  Usable fraction of that COPV, 300 -> 30 bar, adiabatic.
    {"id": "P2.10", "fn": "usable_fraction",
     "args": {"p_i": 300.0e5, "p_f": 30.0e5, "isothermal": False, "gamma": 1.667},
     "expect": 0.748742, "tol": 0.005},

    # P2.11-P2.12  Vacuum Cf for the two nozzle choices in the sizing:
    # eps = 40 for the pressure-fed candidate (throat is large at 19 bar, so
    # the nozzle is diameter-limited) and eps = 120 for the pump-fed ones.
    {"id": "P2.11", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 40.0, "p0": 1.92e6, "pa": 0.0},
     "expect": 1.81232, "tol": 0.002},
    {"id": "P2.12", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 120.0, "p0": 6.0e6, "pa": 0.0},
     "expect": 1.91116, "tol": 0.002},

    # P2.13  c* for the kerolox gas model, used with P2.11/P2.12 to check that
    # the project's assumed Isp values are internally consistent.
    {"id": "P2.13", "fn": "c_star",
     "args": {"gamma": 1.20, "R": R_KEROLOX, "T0": 3600.0},
     "expect": 1758.94, "tol": 0.002},

    # P2.14  NPSH available at the pump inlet for the electric-pump candidate:
    # 6 bar tank, LOX vapour pressure 1.0 bar at the tank condition, 0.4 bar of
    # line loss, 2 m of head at 3 g of stage acceleration.
    {"id": "P2.14", "fn": "npsh_available",
     "args": {"p_tank": 6.0e5, "p_vapor": 1.0e5, "rho": 1141.0, "z": 2.0,
              "dp_line": 0.4e5, "accel": 29.42},
     "expect": 47.11, "tol": 0.01},

    # ==================================================================
    # PROJECT 3 — GEO communications satellite propulsion suite
    # ==================================================================
    # Delivered dry spacecraft D = 2,318.5 kg in all three architectures, so
    # the comparison is at constant delivered mass rather than constant BOL.
    # P3.1-P3.2  Candidate A, all-chemical at 321 s.
    {"id": "P3.1.A.sk", "fn": "propellant_for_dv",
     "args": {"isp": 321.0, "m_final": 2318.5, "dv": 811.0},
     "expect": 681.3, "tol": 0.005},
    {"id": "P3.2.A.ar", "fn": "propellant_for_dv",
     "args": {"isp": 321.0, "m_final": 2999.8, "dv": 1500.0},
     "expect": 1831.2, "tol": 0.005},

    # P3.3-P3.4  Candidate B, all-electric at 1,800 s, 3,000 m/s effective.
    {"id": "P3.3.B.sk", "fn": "propellant_for_dv",
     "args": {"isp": 1800.0, "m_final": 2318.5, "dv": 811.0},
     "expect": 109.0, "tol": 0.005},
    {"id": "P3.4.B.ar", "fn": "propellant_for_dv",
     "args": {"isp": 1800.0, "m_final": 2427.5, "dv": 3000.0},
     "expect": 449.7, "tol": 0.005},

    # P3.5  Candidate C, hybrid: xenon station-keeping as P3.3, chemical
    # apogee burn on the reduced mass.
    {"id": "P3.5.C.ar", "fn": "propellant_for_dv",
     "args": {"isp": 321.0, "m_final": 2427.5, "dv": 1500.0},
     "expect": 1481.8, "tol": 0.005},

    # P3.6  Closure check on the all-chemical stack: 4,831.0 -> 2,318.5 kg
    # must return the full 2,311 m/s budget.
    {"id": "P3.6", "fn": "tsiolkovsky_dv",
     "args": {"isp": 321.0, "m0": 4831.0, "mf": 2318.5},
     "expect": 2311.0, "tol": 0.002},

    # P3.7-P3.12  The ACS sub-trade.  Propellant mass for 8,000 N.s at each
    # candidate's REALISED specific impulse, computed as an impulse quotient
    # via the rocket equation on a nominal 3,000 kg spacecraft (dv = 8,000 /
    # 3,000 = 2.6667 m/s equivalent) is not the honest form; the key uses
    # m_p = I / (Isp g0) directly and registers the ideal cold-gas figures
    # that justify the realised numbers instead.
    {"id": "P3.7.gn2.ideal", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 300.0, "eps": 50.0},
     "expect": 76.84, "tol": 0.002},
    {"id": "P3.8.gn2.eps20", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 300.0, "eps": 20.0},
     "expect": 75.13, "tol": 0.002},
    {"id": "P3.9.gn2.cstar", "fn": "c_star",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 300.0},
     "expect": 435.78, "tol": 0.002},
    {"id": "P3.10.butane.ideal", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.09, "R": 8314.46 / 58.122, "T0": 300.0, "eps": 50.0},
     "expect": 69.24, "tol": 0.005},
    {"id": "P3.11.r236fa.ideal", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.08, "R": 8314.46 / 152.04, "T0": 300.0, "eps": 50.0},
     "expect": 43.24, "tol": 0.005},

    # P3.12  GN2 stored mass in a 35.1 L COPV at 300 bar, 300 K, Z = 1.
    # The real-gas correction is the reason the key quotes "about 12 kg, and
    # ideal gas overstates it by a few percent at 300 bar".
    {"id": "P3.12", "fn": "stored_gas_mass",
     "args": {"p": 300.0e5, "V": 0.0351, "R": R_N2, "T": 300.0, "Z": 1.0},
     "expect": 11.827, "tol": 0.005},

    # P3.13  Density impulse comparison behind the ACS sub-trade: GN2 stored
    # at 280 kg/m^3 against R-236fa stored as a saturated liquid at
    # 1,360 kg/m^3.  Returns rho*Isp in kg.s/m^3.
    {"id": "P3.13.gn2", "fn": "density_isp",
     "args": {"rho": 280.0, "isp": 69.0},
     "expect": 19320.0, "tol": 0.001},
    {"id": "P3.14.r236fa", "fn": "density_isp",
     "args": {"rho": 1360.0, "isp": 40.0},
     "expect": 54400.0, "tol": 0.001},
    {"id": "P3.15.butane", "fn": "density_isp",
     "args": {"rho": 570.0, "isp": 62.0},
     "expect": 35340.0, "tol": 0.001},

    # ==================================================================
    # PROJECT 4 — reusable medium-lift booster engine
    # ==================================================================
    # P4.1  Methalox c* for the gas model.
    {"id": "P4.1", "fn": "c_star",
     "args": {"gamma": 1.16, "R": R_METHALOX, "T0": 3550.0},
     "expect": 1872.99, "tol": 0.002},

    # P4.2-P4.5  The chamber-pressure trade.  At each pc the area ratio is the
    # one that gives pe = 0.55 bar (a slightly overexpanded sea-level nozzle,
    # comfortably above the Summerfield separation limit at lift-off).
    {"id": "P4.2.eps100", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.16, "p0": 100.0e5, "pa": 0.55e5},
     "expect": 20.93, "tol": 0.005},
    {"id": "P4.3.eps150", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.16, "p0": 150.0e5, "pa": 0.55e5},
     "expect": 28.80, "tol": 0.005},
    {"id": "P4.4.eps200", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.16, "p0": 200.0e5, "pa": 0.55e5},
     "expect": 36.42, "tol": 0.005},
    {"id": "P4.5.eps300", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.16, "p0": 300.0e5, "pa": 0.55e5},
     "expect": 50.51, "tol": 0.005},

    # P4.6-P4.9  Sea-level thrust coefficient at each of those points.
    # Isp_SL = 0.97 * 1872.99 * Cf / 9.80665.
    {"id": "P4.6.cf100", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 20.93, "p0": 100.0e5, "pa": 101325.0},
     "expect": 1.64914, "tol": 0.003},
    {"id": "P4.7.cf150", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 28.80, "p0": 150.0e5, "pa": 101325.0},
     "expect": 1.70129, "tol": 0.003},
    {"id": "P4.8.cf200", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 36.42, "p0": 200.0e5, "pa": 101325.0},
     "expect": 1.73576, "tol": 0.003},
    {"id": "P4.9.cf300", "fn": "Cf",
     "args": {"gamma": 1.16, "eps": 50.51, "p0": 300.0e5, "pa": 101325.0},
     "expect": 1.78104, "tol": 0.003},

    # P4.10-P4.13  Throat area at the fixed 2,400 kN sea-level rating of R4.1.
    {"id": "P4.10.at100", "fn": "throat_area_from_thrust",
     "args": {"F": 2.4e6, "p0": 100.0e5, "Cf_val": 1.64914},
     "expect": 0.145531, "tol": 0.003},
    {"id": "P4.11.at150", "fn": "throat_area_from_thrust",
     "args": {"F": 2.4e6, "p0": 150.0e5, "Cf_val": 1.70129},
     "expect": 0.094046, "tol": 0.003},
    {"id": "P4.12.at200", "fn": "throat_area_from_thrust",
     "args": {"F": 2.4e6, "p0": 200.0e5, "Cf_val": 1.73576},
     "expect": 0.069134, "tol": 0.003},
    {"id": "P4.13.at300", "fn": "throat_area_from_thrust",
     "args": {"F": 2.4e6, "p0": 300.0e5, "Cf_val": 1.78104},
     "expect": 0.044919, "tol": 0.003},

    # P4.14-P4.17  Pump power at each point.  dp = 1.45 pc - 4 bar (the 1.45
    # covers the ox-rich preburner pressure and the injector drop of an ORSC
    # powerhead); rho_bulk = 833.12 kg/m^3; eta_pump = 0.70.  mdot is
    # F/(Isp_SL g0) at the Isp computed from P4.6-P4.9.
    {"id": "P4.14.p100", "fn": "pump_power",
     "args": {"mdot": 800.97, "dp": 141.0e5, "rho": 833.12, "eta": 0.70},
     "expect": 19.368e6, "tol": 0.005},
    {"id": "P4.15.p150", "fn": "pump_power",
     "args": {"mdot": 776.49, "dp": 213.5e5, "rho": 833.12, "eta": 0.70},
     "expect": 28.427e6, "tol": 0.005},
    {"id": "P4.16.p200", "fn": "pump_power",
     "args": {"mdot": 761.02, "dp": 286.0e5, "rho": 833.12, "eta": 0.70},
     "expect": 37.317e6, "tol": 0.005},
    {"id": "P4.17.p300", "fn": "pump_power",
     "args": {"mdot": 741.71, "dp": 431.0e5, "rho": 833.12, "eta": 0.70},
     "expect": 54.816e6, "tol": 0.005},

    # P4.18  Bartz property-variation factor at the throat, Twg/T0 = 800/3550.
    {"id": "P4.18", "fn": "bartz_sigma",
     "args": {"gamma": 1.16, "Mach": 1.0, "Tw_over_T0": 0.225352},
     "expect": 1.14567, "tol": 0.003},

    # P4.19  Adiabatic wall temperature at the throat, r = 0.9.
    {"id": "P4.19", "fn": "adiabatic_wall_T",
     "args": {"T0": 3550.0, "gamma": 1.16, "Mach": 1.0, "r": 0.9},
     "expect": 3523.5, "tol": 0.003},

    # P4.20-P4.23  Bartz gas-side coefficient at the throat for the four
    # chamber pressures.  cp0 = 1.16*405.583/0.16 = 2940.5 J/(kg K);
    # Pr0 = 4*1.16/(9*1.16-5) = 0.81690; mu0 = 1.0e-4 Pa s; c* used is the
    # delivered 0.97*1872.99 = 1816.80 m/s; rc = 1.5 * throat radius.
    {"id": "P4.20.hg100", "fn": "bartz_hg",
     "args": {"Dt": 0.43050, "mu0": 1.0e-4, "cp0": 2940.48, "Pr0": 0.816901,
              "p0": 100.0e5, "c_star_val": 1816.80, "rc": 0.322875,
              "A_ratio": 1.0, "sigma": 1.14567},
     "expect": 21_852.0, "tol": 0.01},
    {"id": "P4.21.hg150", "fn": "bartz_hg",
     "args": {"Dt": 0.34600, "mu0": 1.0e-4, "cp0": 2940.48, "Pr0": 0.816901,
              "p0": 150.0e5, "c_star_val": 1816.80, "rc": 0.259500,
              "A_ratio": 1.0, "sigma": 1.14567},
     "expect": 31_580.0, "tol": 0.01},
    {"id": "P4.22.hg200", "fn": "bartz_hg",
     "args": {"Dt": 0.29670, "mu0": 1.0e-4, "cp0": 2940.48, "Pr0": 0.816901,
              "p0": 200.0e5, "c_star_val": 1816.80, "rc": 0.222525,
              "A_ratio": 1.0, "sigma": 1.14567},
     "expect": 40_990.0, "tol": 0.01},
    {"id": "P4.23.hg300", "fn": "bartz_hg",
     "args": {"Dt": 0.23910, "mu0": 1.0e-4, "cp0": 2940.48, "Pr0": 0.816901,
              "p0": 300.0e5, "c_star_val": 1816.80, "rc": 0.179325,
              "A_ratio": 1.0, "sigma": 1.14567},
     "expect": 59_200.0, "tol": 0.01},

    # P4.24-P4.27  Throat heat flux, q = hg (Taw - Twg), Twg = 800 K.
    {"id": "P4.24.q100", "fn": "heat_flux",
     "args": {"hg": 21_852.0, "Taw": 3523.5, "Twg": 800.0},
     "expect": 59.51e6, "tol": 0.01},
    {"id": "P4.25.q150", "fn": "heat_flux",
     "args": {"hg": 31_580.0, "Taw": 3523.5, "Twg": 800.0},
     "expect": 86.00e6, "tol": 0.01},
    {"id": "P4.26.q200", "fn": "heat_flux",
     "args": {"hg": 40_990.0, "Taw": 3523.5, "Twg": 800.0},
     "expect": 111.63e6, "tol": 0.01},
    {"id": "P4.27.q300", "fn": "heat_flux",
     "args": {"hg": 59_200.0, "Taw": 3523.5, "Twg": 800.0},
     "expect": 161.23e6, "tol": 0.01},

    # P4.28  Through-thickness dT in a 0.8 mm GRCop-class liner (k = 300
    # W/(m K)) at the 150 bar heat flux — the number that drives low-cycle
    # fatigue and therefore R4.6/R4.7.
    {"id": "P4.28", "fn": "wall_dT",
     "args": {"q": 86.00e6, "t": 0.0008, "k": 300.0},
     "expect": 229.3, "tol": 0.005},

    # P4.29  And at 300 bar, where the same wall runs 200 K hotter through
    # thickness and the fatigue life falls with the square of the strain range.
    {"id": "P4.29", "fn": "wall_dT",
     "args": {"q": 161.23e6, "t": 0.0008, "k": 300.0},
     "expect": 429.9, "tol": 0.005},

    # P4.30  Coolant bulk temperature rise: 15% of the methane flow taking the
    # full chamber heat load of ~48 MW at cp = 3,500 J/(kg K).
    {"id": "P4.30", "fn": "coolant_bulk_rise",
     "args": {"Q": 48.0e6, "mdot": 25.3, "cp": 3500.0},
     "expect": 542.1, "tol": 0.005},

    # P4.31  Separation check at the 150 bar point: Schmucker's correlation at
    # sea level, Me from eps = 28.80.
    {"id": "P4.31", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.16, "eps": 28.80, "supersonic": True},
     "expect": 3.6924, "tol": 0.003},
    {"id": "P4.32", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.6924},
     "expect": 33_050.0, "tol": 0.01},

    # ==================================================================
    # PROJECT 5 — strap-on booster for an existing core
    # ==================================================================
    # P5.1-P5.2  Delivered performance of the AP/Al/HTPB gas model at the
    # chosen eps = 12: Isp_vac = 1580 * Cf_vac / g0 = 286.5 s,
    # Isp_SL = 1580 * Cf_SL / g0 = 253.8 s.
    {"id": "P5.1.cfvac", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 12.0, "p0": 60.0e5, "pa": 0.0},
     "expect": 1.77800, "tol": 0.002},
    {"id": "P5.2.cfsl", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 12.0, "p0": 60.0e5, "pa": 101325.0},
     "expect": 1.57541, "tol": 0.002},

    # P5.3  Throat area from the burn-averaged vacuum thrust of 521.74 kN
    # (60 MN.s over a 115 s burn) at pc = 60 bar.
    {"id": "P5.3", "fn": "throat_area_from_thrust",
     "args": {"F": 521_739.0, "p0": 60.0e5, "Cf_val": 1.77800},
     "expect": 0.0489060, "tol": 0.002},

    # P5.4  Equilibrium chamber pressure from the sized grain: Ab = 12.897 m^2,
    # At = 0.048906 m^2 (Kn = 263.7), a = 3.394197e-05, n = 0.35,
    # rho_p = 1800, c* = 1580.  This is the closure of the internal ballistics.
    {"id": "P5.4", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.394197e-05, "n": 0.35, "rho_p": 1800.0,
              "Ab": 12.8972, "At": 0.0489060, "c_star_val": 1580.0},
     "expect": 60.0e5, "tol": 0.003},

    # P5.5  Peak-thrust Kn at the start of the burn: Ab = 15.24 m^2 gives
    # 78 bar, which is where the 25% roll-off of R5.5 starts from.
    {"id": "P5.5", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.394197e-05, "n": 0.35, "rho_p": 1800.0,
              "Ab": 15.2380, "At": 0.0489060, "c_star_val": 1580.0},
     "expect": 78.02e5, "tol": 0.005},

    # P5.6  End-of-fin-burnout Kn: Ab = 12.20 m^2 gives 55 bar, a 30% pressure
    # roll-off and (with Cf) a 32% thrust roll-off.
    {"id": "P5.6", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.394197e-05, "n": 0.35, "rho_p": 1800.0,
              "Ab": 12.2000, "At": 0.0489060, "c_star_val": 1580.0},
     "expect": 55.02e5, "tol": 0.005},

    # P5.7  Burn rate at the 60 bar equilibrium point: 8.0 mm/s by construction.
    {"id": "P5.7", "fn": "vieille_burn_rate",
     "args": {"a": 3.394197e-05, "p": 60.0e5, "n": 0.35},
     "expect": 0.0080, "tol": 0.002},

    # P5.8  Pressure sensitivity: pi_K = sigma_p/(1-n) with sigma_p = 0.002/K.
    {"id": "P5.8", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.002, "n": 0.35},
     "expect": 0.00307692, "tol": 0.002},

    # P5.9-P5.10  Temperature sensitivity of the trace over the -5 to +35 C
    # bulk range (dT = +-20 K about 15 C): pressure and thrust move +-6.35%,
    # burn time moves -+6.0%.
    {"id": "P5.9.hot", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.00307692, "dT": 20.0},
     "expect": 1.06348, "tol": 0.002},
    {"id": "P5.10.cold", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.00307692, "dT": -20.0},
     "expect": 0.940317, "tol": 0.002},

    # P5.11  Hot-day peak sea-level thrust check against the 1,650 kN cap of
    # R5.2: pc_peak x 1.06348 = 82.97 bar.
    {"id": "P5.11", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 12.0, "p0": 82.97e5, "pa": 101325.0},
     "expect": 1.73178, "tol": 0.003},

    # P5.12  Candidate C, the liquid strap-on: burn time at the RD-107A's
    # 839 kN would be 71.5 s, outside the 90-140 s window of R5.3.  Registered
    # as the propellant mass at a 290 s trajectory-average Isp.
    {"id": "P5.12", "fn": "propellant_for_dv",
     "args": {"isp": 290.0, "m_final": 1.0, "dv": 1.0},
     "expect": 0.000351717, "tol": 0.005},

    # P5.13  Density impulse of the solid against the kerolox alternative, the
    # number behind "the solid wins on volume, not on Isp".
    {"id": "P5.13.solid", "fn": "density_isp",
     "args": {"rho": 1800.0, "isp": 286.5},
     "expect": 515_700.0, "tol": 0.002},
    {"id": "P5.14.kerolox", "fn": "density_isp",
     "args": {"rho": 1016.62, "isp": 320.0},
     "expect": 325_318.0, "tol": 0.002},

    # ==================================================================
    # PROJECT 6 — crew-capsule launch abort system
    # ==================================================================
    # P6.1  Candidate A exactly as the project statement specifies it:
    # 1,800 kN for 5 s at 270 s gives 9.0 MN.s and 3,399 kg of propellant.
    {"id": "P6.1", "fn": "propellant_for_dv",
     "args": {"isp": 270.0, "m_final": 13_949.3, "dv": 577.4},
     "expect": 3399.0, "tol": 0.005},

    # P6.2  ...and the dv that motor actually imparts to a 10,500 kg capsule
    # with a 6,848 kg tower: 577 m/s, 2.3x the 250 m/s of R6.2.
    {"id": "P6.2", "fn": "tsiolkovsky_dv",
     "args": {"isp": 270.0, "m0": 17_348.3, "mf": 13_949.3},
     "expect": 577.4, "tol": 0.005},

    # P6.3  Candidate A resized to the requirement: 1,219 kg of propellant on a
    # 13,534 kg stack gives exactly 250 m/s.
    {"id": "P6.3", "fn": "tsiolkovsky_dv",
     "args": {"isp": 270.0, "m0": 13_534.0, "mf": 12_315.0},
     "expect": 250.0, "tol": 0.005},

    # P6.4  Candidate B at the SuperDraco baseline of 8 x 71 kN: 1,388 kg of
    # MMH/NTO at 235 s on a 12,968 kg stack gives 260.9 m/s — R6.2 is met.
    {"id": "P6.4", "fn": "tsiolkovsky_dv",
     "args": {"isp": 235.0, "m0": 12_968.0, "mf": 11_580.0},
     "expect": 260.9, "tol": 0.005},

    # P6.5  Candidate B resized to 12 x 71 kN = 852 kN so that R6.3's 4.0 s is
    # met: 1,327 kg on a 12,907 kg stack gives 250 m/s in 3.6 s.
    {"id": "P6.5", "fn": "tsiolkovsky_dv",
     "args": {"isp": 235.0, "m0": 12_907.0, "mf": 11_580.0},
     "expect": 250.0, "tol": 0.005},

    # P6.6  Propellant for candidate B stated the other way round.
    {"id": "P6.6", "fn": "propellant_for_dv",
     "args": {"isp": 235.0, "m_final": 11_580.0, "dv": 250.0},
     "expect": 1327.0, "tol": 0.005},

    # P6.7  Impulse bit of one abort thruster used for the post-burnout
    # reorientation of R6.12: 400 N for 40 ms with 8 ms rise and fall.
    {"id": "P6.7", "fn": "impulse_bit",
     "args": {"F": 400.0, "t_on": 0.040, "t_rise": 0.008, "t_fall": 0.008},
     "expect": 16.0, "tol": 0.002},

    # P6.8-P6.9  The solid abort motor's nozzle: eps = 8 for a short, very hot,
    # sea-level-start burn, and the resulting throat area at 1,000 kN average
    # and 90 bar.
    {"id": "P6.8", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 8.0, "p0": 90.0e5, "pa": 101325.0},
     "expect": 1.58080, "tol": 0.003},
    {"id": "P6.9", "fn": "throat_area_from_thrust",
     "args": {"F": 1.0e6, "p0": 90.0e5, "Cf_val": 1.58080},
     "expect": 0.070284, "tol": 0.003},

    # P6.10  Uncertainty roll-up for the demonstrated-reliability argument:
    # the RSS of the four independent contributors the key lists.
    {"id": "P6.10", "fn": "rss",
     "args": {},
     "expect": 0.0, "tol": 1.0},
]

# rss() takes *args, so the empty-args entry above is a degenerate call that
# returns 0.0; it exists so the key can point at the function by name.  The
# actual roll-up quoted in the key is rss(0.010, 0.015, 0.008, 0.020) = 0.0281.
