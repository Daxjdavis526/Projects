"""Machine-checkable inputs and expected outputs for Module 28 —
Cold-Gas Principles.

Every entry maps to a function in ``tools/rocket.py``. ``tol`` is relative.
Gas properties: T0 = 300 K throughout; R = Ru/M with Ru = 8314.46 J/(kmol K).

  R(N2,   M=28.014)  = 296.7966 J/(kg K)
  R(He,   M=4.003)   = 2077.0572 J/(kg K)
  R(Ar,   M=39.948)  = 208.1321 J/(kg K)

Examples whose arithmetic does not map onto a single library call are
described in comments at the bottom of this file.
"""

EXAMPLES = [
    # ---- Section 4.1 property table: ideal vacuum Isp at eps = 50, T0 = 300 K
    {"id": "28.T1.N2", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": 296.7966, "T0": 300.0, "eps": 50.0},
     "expect": 76.84, "tol": 0.001},
    {"id": "28.T1.He", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": 2077.0572, "T0": 300.0, "eps": 50.0},
     "expect": 178.06, "tol": 0.001},
    {"id": "28.T1.Ar", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": 208.1321, "T0": 300.0, "eps": 50.0},
     "expect": 56.37, "tol": 0.001},

    # ---- WE1: N2 vs He for a fixed total impulse of 5000 N.s
    # ideal Isp at eps = 50; the module applies the 0.90 realization discount
    # of Eq. 3.12 by hand (69.16 s and 160.25 s respectively).
    {"id": "28.WE1.isp_N2_ideal", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": 296.7966, "T0": 300.0, "eps": 50.0},
     "expect": 76.84, "tol": 0.001},
    {"id": "28.WE1.isp_He_ideal", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": 2077.0572, "T0": 300.0, "eps": 50.0},
     "expect": 178.06, "tol": 0.001},
    # stored mass in the sized N2 tank: 27.35 L at 300 bar, 300 K, Z = 1.25
    {"id": "28.WE1.mass_N2", "fn": "stored_gas_mass",
     "args": {"p": 30.0e6, "V": 0.02735, "R": 296.7966, "T": 300.0, "Z": 1.25},
     "expect": 7.373, "tol": 0.002},
    # stored mass in the sized He tank: 77.97 L at 300 bar, 300 K, Z = 1.18
    {"id": "28.WE1.mass_He", "fn": "stored_gas_mass",
     "args": {"p": 30.0e6, "V": 0.07797, "R": 2077.0572, "T": 300.0, "Z": 1.18},
     "expect": 3.182, "tol": 0.002},

    # ---- WE2: 55 mN N2 thruster, 5 bar plenum, 0.30 mm throat
    # At = pi/4 * (0.30e-3)^2 = 7.068583e-8 m^2
    {"id": "28.WE2.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": 296.7966, "T0": 300.0, "p0": 5.0e5,
              "At": 7.068583e-8},
     "expect": 8.1102e-5, "tol": 0.001},
    {"id": "28.WE2.ibit_10ms", "fn": "impulse_bit",
     "args": {"F": 0.055002, "t_on": 0.010, "t_rise": 0.004, "t_fall": 0.006},
     "expect": 6.0502e-4, "tol": 0.001},
    {"id": "28.WE2.mib_5ms", "fn": "impulse_bit",
     "args": {"F": 0.055002, "t_on": 0.005, "t_rise": 0.004, "t_fall": 0.006},
     "expect": 3.3001e-4, "tol": 0.001},
    # dead-volume charge: 20 mm^3 at 5 bar, 300 K
    {"id": "28.WE2.dead_mass", "fn": "stored_gas_mass",
     "args": {"p": 5.0e5, "V": 20.0e-9, "R": 296.7966, "T": 300.0, "Z": 1.0},
     "expect": 1.1231e-7, "tol": 0.001},

    # ---- P9: argon at eps = 40, 300 K and 250 K (the sqrt(T0) check)
    {"id": "28.P9.300K", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": 208.1321, "T0": 300.0, "eps": 40.0},
     "expect": 56.267, "tol": 0.001},
    {"id": "28.P9.250K", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": 208.1321, "T0": 250.0, "eps": 40.0},
     "expect": 51.364, "tol": 0.001},

    # ---- P10: 250 mN N2 thruster, 6 bar, eps = 60
    {"id": "28.P10.isp_ideal", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": 296.7966, "T0": 300.0, "eps": 60.0},
     "expect": 77.108, "tol": 0.001},
    # At = 2.66805e-7 m^2 reproduces the 367 mg/s flow at 6 bar
    {"id": "28.P10.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": 296.7966, "T0": 300.0, "p0": 6.0e5,
              "At": 2.66805e-7},
     "expect": 3.6735e-4, "tol": 0.002},

    # ---- P11: 180 g of n-butane on a 4.0 kg CubeSat
    {"id": "28.P11.dv_60s", "fn": "tsiolkovsky_dv",
     "args": {"isp": 60.0, "m0": 4.000, "mf": 3.820},
     "expect": 27.092, "tol": 0.001},
    {"id": "28.P11.dv_70s", "fn": "tsiolkovsky_dv",
     "args": {"isp": 70.0, "m0": 4.000, "mf": 3.820},
     "expect": 31.608, "tol": 0.001},

    # ---- P12: 120 mN thruster, tr = 6 ms, tf = 9 ms
    {"id": "28.P12.ibit_20ms", "fn": "impulse_bit",
     "args": {"F": 0.120, "t_on": 0.020, "t_rise": 0.006, "t_fall": 0.009},
     "expect": 2.580e-3, "tol": 0.001},
    {"id": "28.P12.mib_8ms", "fn": "impulse_bit",
     "args": {"F": 0.120, "t_on": 0.008, "t_rise": 0.006, "t_fall": 0.009},
     "expect": 1.140e-3, "tol": 0.001},
    {"id": "28.P12.dead_mass", "fn": "stored_gas_mass",
     "args": {"p": 4.0e5, "V": 45.0e-9, "R": 296.7966, "T": 300.0, "Z": 1.0},
     "expect": 2.0216e-7, "tol": 0.001},

    # ---- P13: blowdown 300 -> 30 bar, isothermal and adiabatic bounds
    {"id": "28.P13.iso", "fn": "usable_fraction",
     "args": {"p_i": 300.0, "p_f": 30.0, "isothermal": True},
     "expect": 0.900, "tol": 0.001},
    {"id": "28.P13.adiab", "fn": "usable_fraction",
     "args": {"p_i": 300.0, "p_f": 30.0, "isothermal": False, "gamma": 1.4},
     "expect": 0.80693, "tol": 0.001},

    # ---- P21 (trade study): dv propellant for 25 m/s onto a 14 kg final mass
    {"id": "28.P21.butane", "fn": "propellant_for_dv",
     "args": {"isp": 65.0, "m_final": 14.0, "dv": 25.0},
     "expect": 0.5600, "tol": 0.002},
    {"id": "28.P21.r236fa", "fn": "propellant_for_dv",
     "args": {"isp": 40.0, "m_final": 14.0, "dv": 25.0},
     "expect": 0.9213, "tol": 0.002},
    {"id": "28.P21.r134a_warm", "fn": "propellant_for_dv",
     "args": {"isp": 82.0, "m_final": 14.0, "dv": 25.0},
     "expect": 0.4421, "tol": 0.002},

    # ---- Q4: helium, 0.25 mm throat, 4 bar
    # At = pi/4 * (0.25e-3)^2 = 4.908739e-8 m^2
    {"id": "28.Q4.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.667, "R": 2077.0572, "T0": 300.0, "p0": 4.0e5,
              "At": 4.908739e-8},
     "expect": 1.80643e-5, "tol": 0.001},

    # ---- Q5: 40 mN, tr = 5 ms, tf = 8 ms, 12 ms command
    {"id": "28.Q5.ibit", "fn": "impulse_bit",
     "args": {"F": 0.040, "t_on": 0.012, "t_rise": 0.005, "t_fall": 0.008},
     "expect": 5.400e-4, "tol": 0.001},
]

# ---------------------------------------------------------------------------
# Examples not expressible as a single library call
# ---------------------------------------------------------------------------
#
# 28.WE1 tank mass. Eq. 3.6, m_tank/m_p = 1.5 (rho_m/sigma_allow) Z R T, with
#   Ti-6Al-4V rho_m = 4430 kg/m^3 and sigma_allow = 950e6/1.5 = 633.33e6 Pa,
#   so 1.5*rho_m/sigma_allow = 1.0490e-5 s^2/m^2. Gives 8.61 kg (N2) and
#   24.54 kg (He). The COPV comparison uses m = pV/(g0 * 25000 m) ->
#   3.35 kg (N2), 9.54 kg (He).
#
# 28.WE3 attitude-control budget. Eqs. 3.14-3.17 with F = 0.0550 N,
#   L = 0.25 m, I = 3.0 kg m^2, MIB = 3.3001e-4 N s, theta_db = 1 deg,
#   tau_d = 3e-6 N m, four 30-deg / 60-s slews per day, Isp = 69.16 s:
#     limit cycle    omega_lc = 2.750e-5 rad/s, t_cycle = 1269 s,
#                    0.0242 kg/axis/yr, 0.0726 kg/yr for three axes
#     secular        H = 94.67 N m s/yr, 378.7 N s/yr, 0.558 kg/yr
#     slews          0.4189 N s per slew, 612 N s/yr, 0.902 kg/yr
#     total          1.533 kg/yr, 4.60 kg and 3120 N s over three years
#   Valve-life check: 5.74e5 minimum-impulse pulses per thruster per year
#   against a 8.8e5 qualified life.
#
# 28.P14 / 28.Q6 limit cycles. Eq. 3.15 in closed form:
#     P14: omega_lc = 5.333e-5 rad/s (11.0 deg/hr), t_cycle = 327.2 s,
#          9.643e4 pulses/yr, 0.562 kg/yr/axis at Isp = 70 s.
#     Q6:  omega_lc = 6.000e-5 rad/s (12.4 deg/hr), t_cycle = 436.3 s,
#          7.232e4 pulses/yr, 0.227 kg/yr/axis at Isp = 65 s.
#
# 28.P15 impulse density. Eq. 3.18, Lambda = rho_s * Isp * g0, in N s/cm^3:
#     Xe 0.725, R-236fa 0.533, n-butane 0.363, Ar 0.216, N2 0.189, He 0.063.
#
# 28.P13 adiabatic blowdown temperature. T_f = 300 * (30/300)^(0.4/1.4)
#   = 155.4 K; Isp ratio sqrt(155.4/300) = 0.720.
#
# 28.P21 gaseous-storage elimination. rho_s = p/(Z R T) with p = 12 bar,
#   T = 293 K, Z = 1 gives 13.80 kg/m^3, i.e. 27.6 g in 2000 cm^3 and only
#   18.7 N s of total impulse at Isp = 69 s.
