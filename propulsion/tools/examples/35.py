"""Worked-example inputs and expected outputs for Module 35 —
Historical evolution of rocket propulsion.

Each entry names a function in ``tools/rocket.py``, its arguments, and the
value printed in the module or key text.  ``tol`` is relative.

Thermochemistry inputs are the module 05 §4.3 equilibrium table so that every
module in the course quotes the same c*:

    LOX / 75 % ethanol   T0 = 3000 K,  M = 22.6,  gamma = 1.19  -> c* = 1624.8 m/s
    LOX / RP-1           T0 = 3670 K,  M = 23.3,  gamma = 1.15  -> c* = 1791.9 m/s
    LOX / LH2            T0 = 3550 K,  M = 13.5,  gamma = 1.19  -> c* = 2286.9 m/s
    N2O4 / Aerozine 50   T0 = 3390 K,  M = 22.0,  gamma = 1.17  -> c* = 1761.3 m/s

Not every worked example maps to a library call:

* **35.WE1** (chamber-pressure frontier) is a least-squares fit of ln(pc) on
  year plus piecewise exponential rates.  There is no library function and
  there should not be; the pedagogical content is that the single-exponential
  model *fails*.  For the record, on the frontier
  (1942, 15.2), (1963, 147), (1981, 206.4), (2000, 267) bar:
      k = 0.047248 /yr, doubling time 14.7 yr,
      fitted 1942 -> 26.1 bar (actual 15.2), 2025 -> 1319.5 bar.
  Piecewise k and doubling time:
      1942->1963  k = 0.1081 /yr,  t2 =   6.4 yr,  factor 9.67
      1963->1981  k = 0.0189 /yr,  t2 =  36.8 yr,  factor 1.40
      1981->2000  k = 0.0135 /yr,  t2 =  51.2 yr,  factor 1.29
      2000->2021  k = 0.0055 /yr,  t2 = 124.9 yr,  factor 1.12   (claimed endpoint)
  Back-extrapolating the 1942-63 rate to 267 bar gives calendar year 1968.5;
  the first 267-bar engine flew in 2000.

* **35.WE3** (solid propellant mass fraction vs year) is an ordinary least
  squares fit of zeta = m_p/m_gross on year for ten motors taken from
  ``reference/_verify-solid-coldgas.md``:
      RSRM      1981  500000/590000 = 0.8475  segmented steel
      Star 48B  1985    2009/  2137 = 0.9401  monolithic titanium
      GEM-40    1990   11770/ 12962 = 0.9080  monolithic composite
      GEM-60    2002   29698/ 33183 = 0.8950  monolithic composite
      P241      2006  241000/274000 = 0.8796  segmented steel
      P80FW     2012   88365/ 95800 = 0.9224  monolithic composite
      Zefiro 23 2012   23814/ 26300 = 0.9055  monolithic composite
      Zefiro 40 2022   36239/ 40477 = 0.8953  monolithic composite
      P120C     2022  141400/153000 = 0.9242  monolithic composite
      GEM-63XL  2024   47853/ 53030 = 0.9024  monolithic composite
  giving slope 3.98e-4 /yr (0.004 per decade) with R^2 = 0.059, against a
  segmented/monolithic group-mean difference of 0.8636 vs 0.9075 = 0.044.
  Dropping the two segmented motors (problem N7) gives slope -4.29e-4 /yr
  and R^2 = 0.163 -- the slope changes sign.

* **N2** (F-1 throat area from a contested pc) uses ``Cf`` and then the
  identity At = F/(pc Cf); the Cf calls are registered below and the areas
  are 0.6384 m^2 (965 psia) and 0.5360 m^2 (1125 psia), a 9.1 % difference
  in throat diameter.

* **N5** (SAFER implied Isp) is 3.05 * 180 / (1.4 * g0) = 40.0 s, the
  small-mass-ratio approximation to the rocket equation.
"""

EXAMPLES = [
    # --- shared thermochemistry: c* for the four propellant pairs used --------
    {"id": "35.C1", "fn": "c_star",
     "args": {"gamma": 1.19, "R": 8314.46 / 22.6, "T0": 3000.0},
     "expect": 1624.8, "tol": 0.001},                       # LOX/75 % ethanol
    {"id": "35.C2", "fn": "c_star",
     "args": {"gamma": 1.15, "R": 8314.46 / 23.3, "T0": 3670.0},
     "expect": 1791.9, "tol": 0.001},                       # LOX/RP-1
    {"id": "35.C3", "fn": "c_star",
     "args": {"gamma": 1.19, "R": 8314.46 / 13.5, "T0": 3550.0},
     "expect": 2286.9, "tol": 0.001},                       # LOX/LH2
    {"id": "35.C4", "fn": "c_star",
     "args": {"gamma": 1.17, "R": 8314.46 / 22.0, "T0": 3390.0},
     "expect": 1761.3, "tol": 0.001},                       # N2O4/Aerozine 50

    # --- WE2: V-2 -> RD-180 Isp decomposition, sea level (pa = 101325 Pa) -----
    # S0  V-2 propellant, pc = 15.2 bar, eps = 3.5   -> Isp_ideal 224.1 s
    {"id": "35.WE2.S0", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 3.5, "p0": 15.2e5, "pa": 101325.0},
     "expect": 1.3524, "tol": 0.001},
    # S1  swap propellant to LOX/RP-1                -> 249.0 s  (+24.9)
    {"id": "35.WE2.S1", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 3.5, "p0": 15.2e5, "pa": 101325.0},
     "expect": 1.3626, "tol": 0.001},
    # S2  raise pc to 267 bar                        -> 289.2 s  (+40.2)
    {"id": "35.WE2.S2", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 3.5, "p0": 267e5, "pa": 101325.0},
     "expect": 1.5826, "tol": 0.001},
    # S3  raise eps to 36.87                         -> 327.7 s  (+38.5)
    #     then eta 0.94 -> 0.98 gives 321.1 s against a published 311 s
    {"id": "35.WE2.S3", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 36.87, "p0": 267e5, "pa": 101325.0},
     "expect": 1.7933, "tol": 0.001},

    # --- WE2, vacuum column: the pc term is identically zero ------------------
    {"id": "35.WE2.V0", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 3.5, "p0": 15.2e5, "pa": 0.0},
     "expect": 1.5857, "tol": 0.001},                       # 262.7 s
    {"id": "35.WE2.V1", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 3.5, "p0": 15.2e5, "pa": 0.0},
     "expect": 1.5959, "tol": 0.001},                       # 291.6 s
    # identical to V1 at 267 bar: vacuum Cf depends only on gamma and eps
    {"id": "35.WE2.V2", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 3.5, "p0": 267e5, "pa": 0.0},
     "expect": 1.5959, "tol": 0.001},                       # 291.6 s, +0.0 s
    {"id": "35.WE2.V3", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 36.87, "p0": 267e5, "pa": 0.0},
     "expect": 1.9332, "tol": 0.001},                       # 353.2 s

    # --- WE2 separation check: eps = 36.87 is unavailable at 15.2 bar ---------
    # optimum sea-level expansion at each chamber pressure
    {"id": "35.WE2.EPSOPT.V2", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.19, "p0": 15.2e5, "pa": 101325.0},
     "expect": 3.00, "tol": 0.01},
    {"id": "35.WE2.EPSOPT.RD180", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.15, "p0": 267e5, "pa": 101325.0},
     "expect": 28.9, "tol": 0.01},
    # Summerfield floor 0.4 * pa = 40.5 kPa; pe at eps = 36.87 is
    # 4.27 kPa at pc = 15.2 bar (separated) and 75.03 kPa at 267 bar (attached)
    {"id": "35.WE2.SEP", "fn": "summerfield_separation_pressure",
     "args": {"p0": 101325.0, "frac": 0.4},
     "expect": 40530.0, "tol": 0.001},

    # --- WE3 rider: what 0.044 of mass fraction is worth ----------------------
    # P120C-class stage, m_p = 141400 kg, Isp = 280 s, upper stack 60000 kg
    # zeta = 0.8636 -> m_i = 22333.2 kg
    {"id": "35.WE3.DV.STEEL", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 223733.2, "mf": 82333.2},
     "expect": 2745.0, "tol": 0.001},
    # zeta = 0.9075 -> m_i = 14412.7 kg
    {"id": "35.WE3.DV.COMPOSITE", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 215812.7, "mf": 74412.7},
     "expect": 2923.8, "tol": 0.001},
    # difference 178.8 m/s

    # --- N1: LOX/RP-1 vacuum Isp at eps = 8 (H-1) and eps = 36.87 (RD-180) ----
    {"id": "35.N1.EPS8", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 8.0, "p0": 48e5, "pa": 0.0},
     "expect": 1.7409, "tol": 0.001},                       # 318.1 s ideal
    {"id": "35.N1.EPS37", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 36.87, "p0": 267e5, "pa": 0.0},
     "expect": 1.9332, "tol": 0.001},                       # 353.2 s ideal

    # --- N2: F-1 sea-level Cf at the two ends of the contested pc range -------
    {"id": "35.N2.LOW", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 16.0, "p0": 965 * 6894.757, "pa": 101325.0},
     "expect": 1.5938, "tol": 0.001},                       # At = 0.6384 m^2
    {"id": "35.N2.HIGH", "fn": "Cf",
     "args": {"gamma": 1.15, "eps": 16.0, "p0": 1125 * 6894.757, "pa": 101325.0},
     "expect": 1.6285, "tol": 0.001},                       # At = 0.5360 m^2

    # --- N3: P241 vs P120C, own loads then a common 141400 kg load ------------
    {"id": "35.N3.P241.OWN", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 314000.0, "mf": 73000.0},
     "expect": 4006.0, "tol": 0.001},
    {"id": "35.N3.P120C.OWN", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 193000.0, "mf": 51600.0},
     "expect": 3622.3, "tol": 0.001},
    {"id": "35.N3.COMMON.P241", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 200762.0, "mf": 59362.0},
     "expect": 3345.7, "tol": 0.001},
    {"id": "35.N3.COMMON.P120C", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 193000.0, "mf": 51600.0},
     "expect": 3622.3, "tol": 0.001},

    # --- N6: 1965-technology storable booster engine --------------------------
    {"id": "35.N6.SL", "fn": "Cf",
     "args": {"gamma": 1.17, "eps": 15.0, "p0": 59e5, "pa": 101325.0},
     "expect": 1.5553, "tol": 0.001},        # 279.3 s ideal, 268.2 s at eta 0.96
    {"id": "35.N6.VAC", "fn": "Cf",
     "args": {"gamma": 1.17, "eps": 15.0, "p0": 59e5, "pa": 0.0},
     "expect": 1.8130, "tol": 0.001},        # 325.6 s ideal, 312.6 s at eta 0.96

    # --- Q3: LOX/LH2 at the J-2's and Vinci's expansion ratios ----------------
    {"id": "35.Q3.J2", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 27.5, "p0": 60e5, "pa": 0.0},
     "expect": 1.8609, "tol": 0.001},                       # 433.9 s ideal
    {"id": "35.Q3.VINCI", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 240.0, "p0": 60e5, "pa": 0.0},
     "expect": 2.0205, "tol": 0.001},                       # 471.2 s ideal

    # --- Q8: stage dv at zeta = 0.86 and 0.92 --------------------------------
    {"id": "35.Q8.LOW", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 161279.0, "mf": 61279.0},
     "expect": 2657.2, "tol": 0.001},
    {"id": "35.Q8.HIGH", "fn": "tsiolkovsky_dv",
     "args": {"isp": 280.0, "m0": 153696.0, "mf": 53696.0},
     "expect": 2887.7, "tol": 0.001},
]
