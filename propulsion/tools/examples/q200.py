"""Worked-example inputs and expected outputs for the 200-question key.

Companion to part6-interview/200-questions-key.md.  Every quantitative
answer in that key that has a counterpart in tools/rocket.py is registered
here so `python3 tools/check_examples.py` reproduces it.

Arithmetic with no library counterpart (ratios, sums, budget rollups,
sanity divisions) is described in comments next to the entries it belongs
to rather than encoded, following the convention of the module example
files.

Entries are grouped by question number.  EXAMPLES is built up block by
block with `+=` so the file can be extended without rewriting it.
"""

EXAMPLES = []

# --- Q51-60 ---------------------------------------------------------------
# Q52 diminishing returns: ideal vacuum Isp with c* = 2300 m/s is
#   eps 20 -> 427.0 s, 40 -> 441.9 s, 80 -> 454.3 s, 160 -> 464.7 s
#   (gains of 14.9 s, 12.4 s, 10.4 s per doubling of area).
# Q56 c*_meas = pc At / mdot = 5.5e6 * 0.0080 / 26.0 = 1692.3 m/s;
#   Cf_meas = F / (pc At) = 65.0e3 / 44.0e3 = 1.4773;
#   eta_c* = 1692.3/1755 = 0.9643, eta_Cf = 1.4773/1.52 = 0.9719.
# Q58 c* ratio 2296.0/1776.1 = 1.293.
# Q60 density-impulse ratio 3.502e5/1.620e5 = 2.16.
EXAMPLES += [
    {"id": "q200.52a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 20.0, "p0": 100e5, "pa": 0.0},
     "expect": 1.8205, "tol": 0.001},
    {"id": "q200.52b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 40.0, "p0": 100e5, "pa": 0.0},
     "expect": 1.8843, "tol": 0.001},
    {"id": "q200.52c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 80.0, "p0": 100e5, "pa": 0.0},
     "expect": 1.9371, "tol": 0.001},
    {"id": "q200.52d", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 160.0, "p0": 100e5, "pa": 0.0},
     "expect": 1.9814, "tol": 0.001},
    {"id": "q200.53a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 4.0},
     "expect": 2.6194, "tol": 0.001},
    {"id": "q200.53b", "fn": "normal_shock_p2_p1",
     "args": {"gamma": 1.20, "M1": 2.6194},
     "expect": 7.394, "tol": 0.001},
    {"id": "q200.53c", "fn": "normal_shock_M2",
     "args": {"gamma": 1.20, "M1": 2.6194},
     "expect": 0.45530, "tol": 0.001},
    {"id": "q200.55a", "fn": "Cf",
     "args": {"gamma": 1.19, "eps": 69.0, "p0": 206e5, "pa": 0.0},
     "expect": 1.9393, "tol": 0.001},
    {"id": "q200.55b", "fn": "isp_from_c",
     "args": {"c_eff": 2330.0 * 1.93925},
     "expect": 460.75, "tol": 0.001},
    {"id": "q200.56a", "fn": "isp_from_c",
     "args": {"c_eff": 1692.31 * 1.47727},
     "expect": 254.93, "tol": 0.001},
    {"id": "q200.58a", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 615.886, "T0": 3600.0},
     "expect": 2295.99, "tol": 0.001},
    {"id": "q200.58b", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 361.498, "T0": 3670.0},
     "expect": 1776.05, "tol": 0.001},
    {"id": "q200.60a", "fn": "density_isp",
     "args": {"rho": 360.0, "isp": 450.0},
     "expect": 1.620e5, "tol": 0.001},
    {"id": "q200.60b", "fn": "density_isp",
     "args": {"rho": 1030.0, "isp": 340.0},
     "expect": 3.502e5, "tol": 0.001},
]

# --- Q61-70 ---------------------------------------------------------------
# Q62 chamber gas density rho_c = pc/(R T0) = 8.0e6/(370*3500) = 6.176 kg/m^3.
# Q64 orifice area from mdot: A = mdot/(Cd sqrt(2 rho dp)) = 1.769e-6 m^2,
#   d = sqrt(4A/pi) = 1.50 mm; the mdot check below inverts it.
#   Loss-free velocity sqrt(2 dp/rho) = 56.20 m/s.
# Q68 conical divergence efficiency (1+cos 15 deg)/2 = 0.9830.
# Q69 pe/pc = 1/262.9; Summerfield 0.4*101325 = 40.5 kPa.
EXAMPLES += [
    {"id": "q200.62a", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.0, "At": 0.0125},
     "expect": 0.0125, "tol": 0.001},
    {"id": "q200.62b", "fn": "residence_time",
     "args": {"Vc": 0.0125, "rho_c": 6.1776, "mdot": 30.0},
     "expect": 2.5740e-3, "tol": 0.001},
    {"id": "q200.64a", "fn": "orifice_mdot",
     "args": {"Cd": 0.75, "A": 1.7691e-6, "rho": 1140.0, "dp": 1.8e6},
     "expect": 0.085, "tol": 0.001},
    {"id": "q200.64b", "fn": "orifice_velocity",
     "args": {"Cd": 0.75, "rho": 1140.0, "dp": 1.8e6},
     "expect": 42.146, "tol": 0.001},
    {"id": "q200.69a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 25.0},
     "expect": 3.9128, "tol": 0.001},
    {"id": "q200.69b", "fn": "p0_over_p",
     "args": {"gamma": 1.20, "Mach": 3.9128},
     "expect": 262.87, "tol": 0.001},
    {"id": "q200.69c", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 3.9128},
     "expect": 31023.0, "tol": 0.001},
]

# --- Q71-80 ---------------------------------------------------------------
# Q73 an RP-1 inlet near 290 K plus 204 K lands near 500 K, into coking.
# Q75 loss to fluid = P(1-eta) = 8.77 MW * 0.30 = 2.63 MW.
# Q76 NPSHa splits as 18.78 m (pressure) + 5.20 m (acceleration head).
# Q79 bracket term 1 - 16**-0.2308 = 0.4729; specific work 774 kJ/kg.
EXAMPLES += [
    {"id": "q200.71a", "fn": "bartz_hg",
     "args": {"Dt": 0.15, "mu0": 8.5e-5, "cp0": 2000.0, "Pr0": 0.55,
              "p0": 10e6, "c_star_val": 1780.0, "rc": 0.12,
              "A_ratio": 1.0, "sigma": 1.0},
     "expect": 17053.2, "tol": 0.001},
    {"id": "q200.71b", "fn": "heat_flux",
     "args": {"hg": 17053.2, "Taw": 3300.0, "Twg": 800.0},
     "expect": 4.2633e7, "tol": 0.001},
    {"id": "q200.73a", "fn": "coolant_bulk_rise",
     "args": {"Q": 12.0e6, "mdot": 28.0, "cp": 2100.0},
     "expect": 204.08, "tol": 0.001},
    {"id": "q200.73b", "fn": "wall_dT",
     "args": {"q": 60.0e6, "t": 0.0008, "k": 320.0},
     "expect": 150.0, "tol": 0.001},
    {"id": "q200.75a", "fn": "pump_power",
     "args": {"mdot": 250.0, "dp": 28.0e6, "rho": 1140.0, "eta": 0.70},
     "expect": 8.7719e6, "tol": 0.001},
    {"id": "q200.75b", "fn": "pump_head",
     "args": {"dp": 28.0e6, "rho": 1140.0},
     "expect": 2504.57, "tol": 0.001},
    {"id": "q200.76", "fn": "npsh_available",
     "args": {"p_tank": 3.5e5, "p_vapor": 1.0e5, "rho": 1140.0, "z": 4.0,
              "dp_line": 0.4e5, "accel": 1.3 * 9.80665},
     "expect": 23.984, "tol": 0.001},
    {"id": "q200.79", "fn": "turbine_power",
     "args": {"mdot": 18.0, "cp": 2800.0, "T_in": 900.0, "pr": 16.0,
              "gamma": 1.30, "eta": 0.65},
     "expect": 1.39346e7, "tol": 0.001},
]

# --- Q81-90 ---------------------------------------------------------------
# Q82 f_1T = 1.8412 a / (pi D): 2.8 kHz at a = 1150 m/s implies D = 0.241 m.
# Q85 rss(0.005, 0.008, 0.012) = 0.015264 (rocket.rss takes positional
#   arguments, so it is recorded here rather than as an EXAMPLES entry).
#   Variance share of mdot = 0.012^2 / 0.015264^2 = 0.618.
# Q86 0.97 -> 0.93 is a 4.12 % relative fall; 1.5 % of it is the throat.
EXAMPLES += [
    {"id": "q200.89a", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.0025, "dT": 78.0},
     "expect": 1.21531, "tol": 0.001},
    {"id": "q200.89b", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.0025, "n": 0.35},
     "expect": 3.84615e-3, "tol": 0.001},
    {"id": "q200.89c", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 3.84615e-3, "dT": 78.0},
     "expect": 1.34986, "tol": 0.001},
]

# --- Q91-100 --------------------------------------------------------------
# Q91 Ab = pi * Dp * L = pi * 1.6 * 25 = 125.66 m^2; Kn = 125.66/0.62 = 202.7;
#   port area 2.011 m^2 gives J = Ap/At = 3.24.
# Q92 t = p r / sigma = (1.5*7.0e6)(1.5)/1400e6 = 11.25 mm.
# Q96 pc ratio = 1.06**(-1/0.65) = 0.9143, so 6.2 MPa -> 5.67 MPa.
EXAMPLES += [
    {"id": "q200.96", "fn": "solid_equilibrium_pressure",
     # same motor, throat area 6 % larger: the ratio, not the level, is the
     # answer.  a, n, rho_p, c* chosen to put the baseline at 6.2 MPa.
     "args": {"a": 4.59866e-5, "n": 0.35, "rho_p": 1800.0, "Ab": 125.664,
              "At": 0.62 * 1.06, "c_star_val": 1550.0},
     "expect": 5.6684e6, "tol": 0.005},
    {"id": "q200.96b", "fn": "solid_equilibrium_pressure",
     "args": {"a": 4.59866e-5, "n": 0.35, "rho_p": 1800.0, "Ab": 125.664,
              "At": 0.62, "c_star_val": 1550.0},
     "expect": 6.2e6, "tol": 0.005},
]

# --- Q101-110 -------------------------------------------------------------
# Q102 ratio He/N2 = 178.06/76.84 = 2.317; at 90 % realisation, 69.2 s and
#   160.3 s.
# Q103 mp = 755/(40*9.80665) = 1.9247 kg; V = 1.9247/1360 = 1.415 L.
# Q105 one year = 3.156e7 s; 1e-4 scc/s -> 3156 scc -> 0.56 g of helium.
# Q106 1e-4 * 14 * 9.467e7 s = 1.3254e5 scc = 23.7 g He at 0.1786 mg/scc.
EXAMPLES += [
    {"id": "q200.102a", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.40, "R": 296.797, "T0": 300.0, "eps": 50.0},
     "expect": 76.839, "tol": 0.001},
    {"id": "q200.102b", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": 2077.06, "T0": 300.0, "eps": 50.0},
     "expect": 178.059, "tol": 0.001},
    {"id": "q200.103", "fn": "propellant_for_dv",
     # cross-check of mp = Itot/(Isp g0): a 1.9247 kg load on a 100 kg final
     # mass is worth dv = 7.478 m/s at Isp = 40 s.
     "args": {"isp": 40.0, "m_final": 100.0, "dv": 7.47826},
     "expect": 1.9247, "tol": 0.005},
]

# --- Q111-120 -------------------------------------------------------------
# Q111 at T0 = 3400 K, M = 22, pc = 100 bar, eps = 40, vacuum:
#   gamma 1.15 -> c* 1775.0, Cf 1.9415, Isp 351.4 s, SL-optimum eps 13.17
#   gamma 1.25 -> c* 1722.6, Cf 1.8346, Isp 322.3 s, SL-optimum eps 10.58
# Q115 table: eps 16 -> 1.635 SL / 1.797 vac; eps 40 -> 1.479 SL / 1.884 vac.
#   SL-optimum eps = 11.75 gives Cf = 1.643.
# Q120 At = 800e3/(12e6*1.85) = 0.036036 m^2, Dt = 0.21420 m;
#   c*_del = 0.96*1820 = 1747.2 m/s; mdot = 12e6*At/c* = 247.50 kg/s;
#   Vc = 1.05*At = 0.037838 m^3; Ac = 2.5*At = 0.090090 m^2, Dc = 0.33868 m.
EXAMPLES += [
    {"id": "q200.113a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 40.0},
     "expect": 4.2394, "tol": 0.001},
    {"id": "q200.113b", "fn": "p0_over_p",
     "args": {"gamma": 1.20, "Mach": 4.2394},
     "expect": 479.05, "tol": 0.001},
    {"id": "q200.113c", "fn": "normal_shock_p2_p1",
     "args": {"gamma": 1.20, "M1": 4.2394},
     "expect": 19.5155, "tol": 0.001},
    {"id": "q200.113d", "fn": "normal_shock_M2",
     "args": {"gamma": 1.20, "M1": 4.2394},
     "expect": 0.36098, "tol": 0.001},
    {"id": "q200.113e", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.2394},
     "expect": 29244.5, "tol": 0.001},
    {"id": "q200.115a", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 100e5, "pa": 101325.0},
     "expect": 1.63496, "tol": 0.001},
    {"id": "q200.115b", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 16.0, "p0": 100e5, "pa": 0.0},
     "expect": 1.79708, "tol": 0.001},
    {"id": "q200.115c", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 40.0, "p0": 100e5, "pa": 101325.0},
     "expect": 1.47897, "tol": 0.001},
    {"id": "q200.115d", "fn": "Cf",
     "args": {"gamma": 1.20, "eps": 40.0, "p0": 100e5, "pa": 0.0},
     "expect": 1.88427, "tol": 0.001},
    {"id": "q200.115e", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.20, "p0": 100e5, "pa": 101325.0},
     "expect": 11.7527, "tol": 0.001},
    {"id": "q200.117a", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 386.719, "T0": 3550.0},
     "expect": 1806.68, "tol": 0.001},
    {"id": "q200.117b", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 409.579, "T0": 3390.0},
     "expect": 1816.93, "tol": 0.001},
    {"id": "q200.120a", "fn": "throat_area_from_thrust",
     "args": {"F": 800e3, "p0": 12e6, "Cf_val": 1.85},
     "expect": 0.036036, "tol": 0.001},
    {"id": "q200.120b", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.05, "At": 0.036036},
     "expect": 0.037838, "tol": 0.001},
    {"id": "q200.120c", "fn": "isp_from_c",
     "args": {"c_eff": 1747.2 * 1.85},
     "expect": 329.605, "tol": 0.001},
]

# --- Q121-130 -------------------------------------------------------------
# Q123 Ao = 2.2783e-6 m^2 (do = 1.703 mm), Af = 1.1712e-6 m^2 total
#   (two holes of 5.856e-7 m^2, d = 0.863 mm each);
#   momentum ratio (0.12*46.203)/(0.052*54.813) = 1.945.
# Q126 gain 464.53 - 447.89 = 16.63 s; from eps 40 (437.1 s) to 285 it is
#   27.4 s, which is the ~30 s usually attributed to the RL10B-2 extension.
# Q128 (1/2.5)**0.9 = 0.4384; (1/10)**0.9 = 0.12589.
# Q130 Dh = 4*(1.5e-3*4.5e-3)/(2*(1.5e-3+4.5e-3)) = 2.25e-3 m;
#   Pr = mu cp / k = 7.5e-4*2100/0.13 = 12.115.
EXAMPLES += [
    {"id": "q200.123a", "fn": "orifice_mdot",
     "args": {"Cd": 0.78, "A": 2.27826e-6, "rho": 1140.0, "dp": 2.0e6},
     "expect": 0.12, "tol": 0.001},
    {"id": "q200.123b", "fn": "orifice_mdot",
     "args": {"Cd": 0.78, "A": 1.17121e-6, "rho": 810.0, "dp": 2.0e6},
     "expect": 0.052, "tol": 0.001},
    {"id": "q200.123c", "fn": "orifice_velocity",
     "args": {"Cd": 0.78, "rho": 1140.0, "dp": 2.0e6},
     "expect": 46.2032, "tol": 0.001},
    {"id": "q200.123d", "fn": "orifice_velocity",
     "args": {"Cd": 0.78, "rho": 810.0, "dp": 2.0e6},
     "expect": 54.8128, "tol": 0.001},
    {"id": "q200.123e", "fn": "momentum_ratio",
     "args": {"mdot_o": 0.12, "v_o": 46.2032, "mdot_f": 0.052,
              "v_f": 54.8128},
     "expect": 1.94522, "tol": 0.001},
    {"id": "q200.126a", "fn": "Cf",
     "args": {"gamma": 1.22, "eps": 77.0, "p0": 1.0, "pa": 0.0},
     "expect": 1.90971, "tol": 0.001},
    {"id": "q200.126b", "fn": "Cf",
     "args": {"gamma": 1.22, "eps": 285.0, "p0": 1.0, "pa": 0.0},
     "expect": 1.98063, "tol": 0.001},
    {"id": "q200.126c", "fn": "isp_from_c",
     "args": {"c_eff": 2300.0 * 1.90971},
     "expect": 447.893, "tol": 0.001},
    {"id": "q200.126d", "fn": "isp_from_c",
     "args": {"c_eff": 2300.0 * 1.98063},
     "expect": 464.526, "tol": 0.001},
    {"id": "q200.130a", "fn": "reynolds",
     "args": {"rho": 810.0, "v": 6.0, "L": 2.25e-3, "mu": 7.5e-4},
     "expect": 14580.0, "tol": 0.001},
    {"id": "q200.130b", "fn": "dittus_boelter",
     "args": {"k": 0.13, "D": 2.25e-3, "Re": 14580.0, "Pr": 12.1154,
              "n": 0.4},
     "expect": 7723.77, "tol": 0.001},
]

# --- Q131-140 -------------------------------------------------------------
# Q136 mass-weighted Isp = 0.968*340 + 0.032*130 = 333.28 s; penalty 6.72 s
#   (1.98 % of 340 s); the turbine flow contributes 4.16 s of that total.
# Q138 Joukowsky estimate dp = rho a dv = 1140*1000*5 = 5.7e6 Pa = 57 bar.
EXAMPLES += [
    {"id": "q200.133a", "fn": "specific_speed_SI",
     "args": {"omega": 3769.911, "Q": 0.070, "H": 22000.0},
     "expect": 0.099637, "tol": 0.001},
    {"id": "q200.133b", "fn": "suction_specific_speed_SI",
     "args": {"omega": 3769.911, "Q": 0.070, "NPSH": 300.0},
     "expect": 2.49689, "tol": 0.001},
]

# --- Q141-150 -------------------------------------------------------------
# Q141 f = alpha a/(pi D) with a = 1150 m/s, D = 0.28 m:
#   1T (alpha 1.8412) 2407.1 Hz, 2T (3.0542) 3992.9 Hz, 1R (3.8317) 5009.4 Hz.
# Q148 required diffuser recovery 101325/2629.7 = 38.53:1 against 26.0:1 from
#   a single normal shock.
# Q150 n = ln(11.3/8.4)/ln(7/4) = 0.52995; a = 8.4e-3/(4.0e6**n) = 2.6637e-6
#   SI; 1/(1-n) = 2.127.
EXAMPLES += [
    {"id": "q200.144", "fn": "thermal_stress_hoop",
     "args": {"E": 110e9, "alpha": 1.8e-5, "dT": 150.0, "nu": 0.34},
     "expect": 2.25e8, "tol": 0.001},
    {"id": "q200.148a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 100.0},
     "expect": 4.89003, "tol": 0.001},
    {"id": "q200.148b", "fn": "p0_over_p",
     "args": {"gamma": 1.20, "Mach": 4.89003},
     "expect": 1521.07, "tol": 0.001},
    {"id": "q200.148c", "fn": "normal_shock_p2_p1",
     "args": {"gamma": 1.20, "M1": 4.89003},
     "expect": 25.9953, "tol": 0.001},
    {"id": "q200.148d", "fn": "schmucker_separation",
     "args": {"pa": 5000.0, "Me": 4.89003},
     "expect": 1301.24, "tol": 0.001},
    {"id": "q200.150a", "fn": "vieille_burn_rate",
     "args": {"a": 2.66371e-6, "p": 4.0e6, "n": 0.529955},
     "expect": 8.4e-3, "tol": 0.002},
    {"id": "q200.150b", "fn": "vieille_burn_rate",
     "args": {"a": 2.66371e-6, "p": 7.0e6, "n": 0.529955},
     "expect": 11.3e-3, "tol": 0.002},
]

# --- Q151-160 -------------------------------------------------------------
# Q151 tb = 0.42/0.0095 = 44.21 s; peak at 0.3*web = 13.26 s; area-weighted
#   mean Ab = 9.27 m^2 gives mp = 1800*9.27*0.42 = 7008 kg.
# Q153 case mass = pi*3.4*13.5*0.012*1580 = 2734.0 kg; inert 5134.0 kg;
#   PMF = 141400/146534 = 0.9650 against P120C's published 0.924, which needs
#   an inert mass of 141400*(1/0.924 - 1) = 11630 kg -- 6496 kg unaccounted.
# Q155 rt 0.200 -> 0.2144 m, At 0.125664 -> 0.144411 m^2 (+14.92 %);
#   Cf(1.18, eps 16 -> 13.923) at 6 MPa SL rises 1.5424 -> 1.5611;
#   pc ratio 1.149184**(-1/0.65) = 0.8074; net SL thrust ratio 0.939.
# Q160 total impulse 0.315*68*9.80665 = 210.06 N*s; adiabatic alternative
#   usable fraction 1-(0.1)**(1/1.4) = 0.80693 -> 0.2824 kg -> 188.3 N*s.
EXAMPLES += [
    {"id": "q200.155a", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 16.0, "p0": 6.0e6, "pa": 101325.0},
     "expect": 1.54243, "tol": 0.001},
    {"id": "q200.155b", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 13.9229, "p0": 6.0e6, "pa": 101325.0},
     "expect": 1.56114, "tol": 0.001},
    {"id": "q200.159a", "fn": "stored_gas_mass",
     "args": {"p": 300e5, "V": 4.0e-3, "R": 296.797, "T": 300.0, "Z": 1.0},
     "expect": 1.34772, "tol": 0.001},
    {"id": "q200.159b", "fn": "stored_gas_mass",
     "args": {"p": 300e5, "V": 4.0e-3, "R": 296.797, "T": 300.0, "Z": 1.12},
     "expect": 1.20333, "tol": 0.001},
    {"id": "q200.160a", "fn": "usable_fraction",
     "args": {"p_i": 200.0, "p_f": 20.0, "isothermal": True},
     "expect": 0.90, "tol": 0.001},
    {"id": "q200.160b", "fn": "usable_fraction",
     "args": {"p_i": 200.0, "p_f": 20.0, "isothermal": False,
              "gamma": 1.4},
     "expect": 0.80693, "tol": 0.001},
    {"id": "q200.160c", "fn": "tsiolkovsky_dv",
     "args": {"isp": 68.0, "m0": 12.0, "mf": 11.685},
     "expect": 17.7387, "tol": 0.001},
]

# --- Q161-165 -------------------------------------------------------------
# Q161 dw = Ibit*L/I = 2e-3*0.8/150 = 1.0667e-5 rad/s = 6.112e-4 deg/s;
#   deadband half-width 0.02 deg = 3.4907e-4 rad; full-deadband traverse
#   2*3.4907e-4/1.0667e-5 = 65.4 s; 1320 pulses/axis/day; 964 N*s/axis/year.
# Q163 mp = Itot/(Isp g0): 14.567 kg (70 s), 3.642 kg (280 s), 4.635 kg
#   (220 s).  N2 at 300 bar, 300 K, Z = 1.12 -> 300.8 kg/m^3 -> 48.42 L;
#   COPV at pV/W = 2.0e4 m -> 7.41 kg; solid 3.642/0.9 = 4.05 kg;
#   hydrazine tank at 12 % of propellant -> 5.19 kg.
EXAMPLES += [
    {"id": "q200.163a", "fn": "stored_gas_mass",
     "args": {"p": 300e5, "V": 0.0484238, "R": 296.797, "T": 300.0,
              "Z": 1.12},
     "expect": 14.5674, "tol": 0.001},
]

# --- Q166-175 -------------------------------------------------------------
# Q168 multiplicative product 0.994*0.991*0.993*0.986*0.989 = 0.953855, so
#   366*0.953855 = 349.11 s; additive 366*0.953 = 348.80 s; difference 0.31 s.
# Q171 pump 38.028 MW; turbine bracket 0.21244 -> pr = 2.465; with pc = 25 MPa
#   and ~30 MPa turbine discharge the preburner would need ~74 MPa against a
#   45 MPa pump rise, so the stated numbers do not close on pressure.
# Q174 0.15 % diameter growth = 0.30 % area growth per flight; 1.5/0.30 = 5
#   flights to the limit.
EXAMPLES += [
    {"id": "q200.171a", "fn": "pump_power",
     "args": {"mdot": 45.0, "dp": 45.0e6, "rho": 71.0, "eta": 0.75},
     "expect": 3.80282e7, "tol": 0.001},
    {"id": "q200.171b", "fn": "turbine_power",
     "args": {"mdot": 45.0, "cp": 6000.0, "T_in": 850.0, "pr": 2.464955,
              "gamma": 1.36, "eta": 0.78},
     "expect": 3.80282e7, "tol": 0.001},
]

# --- Q176-185 -------------------------------------------------------------
# Q177 lambda = (1+cos 15 deg)/2 = 0.98296; Cf ideal SL eps 16 = 1.63496 ->
#   delivered 1.63496*0.98296*0.992 = 1.59425; at the SL-optimum eps 11.7527
#   ideal 1.64296 -> delivered 1.60205 (only 0.49 % better).
# Q179 m = (6.0-0.1)e6*6.0/(320*3300) = 33.52 kg; tau = 6.0/(1550*0.62) =
#   6.243 ms.
# Q183 At = 1.7671e-8 m^2; Kn = 0.04e-6/0.15e-3 = 2.667e-4;
#   Re = 4*mdot/(pi*Dt*mu) = 4441 at mu = 1.55e-5 Pa*s.
# Q184 Cd = 1 - C/sqrt(4441): 0.970 (C=2), 0.964 (C=2.4), 0.940 (C=4).
# Q185 ln(340/328.2) = 0.035322 -> Isp 96.7-114.3 s for 33.5-39.6 m/s;
#   ln(148/136.2) = 0.083088 -> Isp 41.1-48.6 s.  At 70 s the same 11.8 kg
#   gives 24.2 m/s against 340 kg and 57.0 m/s against 148 kg.
EXAMPLES += [
    {"id": "q200.183a", "fn": "choked_mdot",
     "args": {"gamma": 1.40, "R": 296.797, "T0": 300.0, "p0": 2.0e5,
              "At": 1.76715e-8},
     "expect": 8.1102e-6, "tol": 0.001},
    {"id": "q200.183b", "fn": "reynolds",
     # rho v Dt / mu written as 4 mdot/(pi Dt mu): rho*v = mdot/At
     "args": {"rho": 8.1102e-6 / 1.76715e-8, "v": 1.0, "L": 1.5e-4,
              "mu": 1.55e-5},
     "expect": 4441.4, "tol": 0.001},
    {"id": "q200.185a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 340.0, "mf": 328.2},
     "expect": 24.2476, "tol": 0.001},
    {"id": "q200.185b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 148.0, "mf": 136.2},
     "expect": 57.0370, "tol": 0.001},
]
