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
