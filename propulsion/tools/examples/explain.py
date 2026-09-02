"""
Part VI — "Explain this to an engineer": registered arithmetic.

Every `[EX nn.x]` tag in part6-interview/explain-to-an-engineer-key.md refers to
an entry below, where `nn` is the prompt number and `x` distinguishes the steps.
`fn` names a function in tools/rocket.py; `args` are its keyword arguments;
`expect` is the value quoted in the key; `tol` is a RELATIVE tolerance.

Run with tools/check_examples.py (or any harness that imports EXAMPLES).

WORKING GAS MODELS (stated in the key's preamble, tagged [A] approximation):

  LOX/RP-1 products   gamma = 1.20, M = 23.0 kg/kmol -> R = 361.5 J/(kg K),
                      T0 = 3600 K, c*_ideal = 1759 m/s
  LOX/LH2 products    gamma = 1.19, R = 615.9 J/(kg K) (M = 13.5 kg/kmol),
                      T0 = 3600 K, c*_ideal = 2303 m/s
  F-1                 worked at gamma = 1.21
  Solid AP/Al         gamma = 1.14 class; c* = 1550 m/s, rho_p = 1770 kg/m^3,
                      n = 0.35, a = 3.8e-5 (m/s)/Pa^n  -- a generic composite,
                      NOT a formulation for any specific motor
  Cold gas            T0 = 300 K, eps = 50, frozen ideal gas (engine-database
                      Part C.1 method)

BARTZ REFERENCE CASE (used by EX 35, 57, 59). A 70-bar kerolox chamber with
Dt = 0.30 m, rc = 2*Dt = 0.60 m, evaluated at the throat (A/At = 1, sigma = 1):
mu0 = 1.0e-4 Pa s, cp0 = 2200 J/(kg K), Pr0 = 0.8, c* = 1759 m/s. Bartz is
+-20-30% at the throat [E]; the ratios below are far more trustworthy than the
absolute flux.

ARITHMETIC NOT REGISTERED (single expressions, quoted inline in the key):

  12.c   ambient term pa*Ae/F_SL = 101325*16*At/(1.5580*70e5*At) = 14.9%
  54     divergence loss lambda = (1+cos alpha)/2: 15 deg -> 0.9830 (-1.7%),
         20 deg -> 0.9698 (-3.0%), 12 deg -> 0.9891 (-1.1%)
  58     film-cooling penalty: a fuel fraction f diverted to the wall burns at
         a lower local MR; the delivered-Isp loss is roughly f * (1 - Isp_film
         /Isp_core), i.e. ~1-3 s for f = 0.03-0.10 [E]
  70     GG cycle loss: turbine flow fraction f dumped at Isp_gg/Isp_main ~ 0.5
         gives dIsp/Isp ~ f/2; f = 0.03-0.05 -> 1.5-2.5%
  113    cold-gas realized/ideal ratio ~0.90 [engine-database C.1.3]
  119    series reliability: R_system = R_part^N; 0.9999^500 = 0.951 vs
         0.9999^100 = 0.990

SI units throughout. gamma dimensionless, R in J/(kg K), T0 in K, p0/pa/pe in
Pa, At/Ae in m^2, F in N, Dt in m, hg in W/(m^2 K), q in W/m^2.
"""

EXAMPLES = [
    # ================================================================ group A
    # 01: chamber pressure at fixed eps = 16, kerolox, sea level.
    # Isp = c*(1759) * Cf / g0 -> 225.4 / 280.8 / 293.3 / 312.7 s
    {"id": "01.a", "fn": "Cf", "args": {"gamma": 1.20, "eps": 16.0,
     "p0": 30e5, "pa": 101325.0}, "expect": 1.25668, "tol": 1e-3},
    {"id": "01.b", "fn": "Cf", "args": {"gamma": 1.20, "eps": 16.0,
     "p0": 70e5, "pa": 101325.0}, "expect": 1.56548, "tol": 1e-3},
    {"id": "01.c", "fn": "Cf", "args": {"gamma": 1.20, "eps": 16.0,
     "p0": 100e5, "pa": 101325.0}, "expect": 1.63496, "tol": 1e-3},
    {"id": "01.d", "fn": "Cf", "args": {"gamma": 1.20, "eps": 16.0,
     "p0": 300e5, "pa": 101325.0}, "expect": 1.74304, "tol": 1e-3},
    {"id": "01.isp_b", "fn": "isp_from_c", "args": {"c_eff": 1759.035 * 1.56548},
     "expect": 280.80, "tol": 1e-3},

    # 06: c* from molecular weight alone, same T0
    {"id": "06.a", "fn": "c_star", "args": {"gamma": 1.19, "R": 615.9, "T0": 3600.0},
     "expect": 2302.94, "tol": 1e-3},
    {"id": "06.b", "fn": "c_star", "args": {"gamma": 1.20, "R": 361.5, "T0": 3600.0},
     "expect": 1759.04, "tol": 1e-3},

    # ================================================================ group B
    # 12: F-1 class altitude gain, eps = 16, pc = 70 bar, gamma = 1.21
    {"id": "12.a", "fn": "Cf", "args": {"gamma": 1.21, "eps": 16.0,
     "p0": 70e5, "pa": 101325.0}, "expect": 1.55800, "tol": 1e-3},
    {"id": "12.b", "fn": "Cf", "args": {"gamma": 1.21, "eps": 16.0,
     "p0": 70e5, "pa": 0.0}, "expect": 1.78960, "tol": 1e-3},

    # 16: density impulse. rho bulk at the stated MR; Isp vacuum from the
    # engine database (RS-25 452.3 s, Merlin 1D 311 s, Raptor 350 s CLAIM).
    {"id": "16.a", "fn": "density_isp", "args": {"rho": 362.0, "isp": 452.3},
     "expect": 163732.6, "tol": 1e-4},
    {"id": "16.b", "fn": "density_isp", "args": {"rho": 1017.0, "isp": 311.0},
     "expect": 316287.0, "tol": 1e-4},
    {"id": "16.c", "fn": "density_isp", "args": {"rho": 1017.0, "isp": 311.0 / 1.9317},
     "expect": 163741.0, "tol": 1e-3},   # ratio check: 316287/163733 = 1.932
    {"id": "16.d", "fn": "density_isp", "args": {"rho": 833.0, "isp": 350.0},
     "expect": 291550.0, "tol": 1e-4},   # LOX/CH4, Raptor Isp is a company claim

    # 17: RS-25 throat sizing from F_vac, pc, eps
    {"id": "17.a", "fn": "Cf", "args": {"gamma": 1.19, "eps": 69.0,
     "p0": 206.4e5, "pa": 0.0}, "expect": 1.93925, "tol": 1e-3},
    {"id": "17.b", "fn": "throat_area_from_thrust",
     "args": {"F": 2279e3, "p0": 206.4e5, "Cf_val": 1.93925},
     "expect": 0.056938, "tol": 1e-3},   # Dt = 2 sqrt(At/pi) = 0.2692 m
    {"id": "17.c", "fn": "choked_mdot", "args": {"gamma": 1.19, "R": 615.9,
     "T0": 3600.0, "p0": 206.4e5, "At": 0.056938}, "expect": 510.3, "tol": 1e-3},

    # ================================================================ group E
    # 31: L* and stay time for an RS-25-class chamber
    {"id": "31.a", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 0.9, "At": 0.056938}, "expect": 0.051244, "tol": 1e-3},
    {"id": "31.b", "fn": "residence_time",
     "args": {"Vc": 0.051244, "rho_c": 206.4e5 / (615.9 * 3600.0), "mdot": 510.3},
     "expect": 9.354e-4, "tol": 1e-3},

    # 35: Bartz scales as Dt^-0.2 -- tripling the throat cuts flux only 20%
    {"id": "35.a", "fn": "bartz_hg", "args": {"Dt": 0.30, "mu0": 1.0e-4,
     "cp0": 2200.0, "Pr0": 0.8, "p0": 70e5, "c_star_val": 1759.0,
     "rc": 0.60, "A_ratio": 1.0}, "expect": 9330.0, "tol": 1e-3},
    {"id": "35.b", "fn": "bartz_hg", "args": {"Dt": 0.90, "mu0": 1.0e-4,
     "cp0": 2200.0, "Pr0": 0.8, "p0": 70e5, "c_star_val": 1759.0,
     "rc": 1.80, "A_ratio": 1.0}, "expect": 7489.6, "tol": 1e-3},

    # ================================================================ group F
    # 36: injector velocity at 20% vs 5% dp/pc, pc = 100 bar, RP-1 (810 kg/m3)
    {"id": "36.a", "fn": "orifice_velocity",
     "args": {"Cd": 0.75, "rho": 810.0, "dp": 0.20 * 100e5},
     "expect": 52.70, "tol": 1e-3},
    {"id": "36.b", "fn": "orifice_velocity",
     "args": {"Cd": 0.75, "rho": 810.0, "dp": 0.05 * 100e5},
     "expect": 26.35, "tol": 1e-3},

    # ================================================================ group H
    # 48: optimum sea-level eps at pc = 100 bar, and what over-expanding costs
    {"id": "48.a", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.20, "p0": 100e5, "pa": 101325.0},
     "expect": 11.753, "tol": 1e-3},
    {"id": "48.b", "fn": "Cf", "args": {"gamma": 1.20, "eps": 11.753,
     "p0": 100e5, "pa": 101325.0}, "expect": 1.64296, "tol": 1e-3},
    {"id": "48.c", "fn": "Cf", "args": {"gamma": 1.20, "eps": 25.0,
     "p0": 100e5, "pa": 101325.0}, "expect": 1.58907, "tol": 1e-3},
    {"id": "48.d", "fn": "Cf", "args": {"gamma": 1.20, "eps": 11.753,
     "p0": 100e5, "pa": 0.0}, "expect": 1.76201, "tol": 1e-3},
    {"id": "48.e", "fn": "Cf", "args": {"gamma": 1.20, "eps": 25.0,
     "p0": 100e5, "pa": 0.0}, "expect": 1.84238, "tol": 1e-3},

    # 49: separation. RS-25 (eps 69, pc 206.4 bar) fired at sea level.
    {"id": "49.a", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.19, "eps": 69.0}, "expect": 4.5535, "tol": 1e-3},
    {"id": "49.b", "fn": "summerfield_separation_pressure",
     "args": {"p0": 101325.0, "frac": 0.4}, "expect": 40530.0, "tol": 1e-4},
    {"id": "49.c", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.5535}, "expect": 27762.0, "tol": 1e-3},
    # exit static pressure is 206.4e5/p0_over_p(1.19, 4.5535) = 22.6 kPa,
    # below both criteria -> the RS-25 cannot run full-flowing at sea level.

    # 51: what the RL10B-2's extendible nozzle is worth. pc taken as 44 bar
    # (Astronautix, LOW CONFIDENCE -- the manufacturer does not publish it;
    # the RATIO is what the answer uses, and it is insensitive to pc).
    {"id": "51.a", "fn": "Cf", "args": {"gamma": 1.19, "eps": 285.0,
     "p0": 44e5, "pa": 0.0}, "expect": 2.02990, "tol": 1e-3},
    {"id": "51.b", "fn": "Cf", "args": {"gamma": 1.19, "eps": 77.0,
     "p0": 44e5, "pa": 0.0}, "expect": 1.94743, "tol": 1e-3},

    # 52: the RS-25's two published expansion ratios, same pc
    {"id": "52.a", "fn": "Cf", "args": {"gamma": 1.19, "eps": 69.0,
     "p0": 206.4e5, "pa": 0.0}, "expect": 1.93925, "tol": 1e-3},
    {"id": "52.b", "fn": "Cf", "args": {"gamma": 1.19, "eps": 77.5,
     "p0": 206.4e5, "pa": 0.0}, "expect": 1.94790, "tol": 1e-3},

    # 53: 2% throat AREA growth. Solid: pc falls 3.0% at n = 0.35
    # (Kn 250 -> 245.1). Liquid: thrust rises with At, Isp barely moves.
    {"id": "53.a", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.8e-5, "n": 0.35, "rho_p": 1770.0, "Ab": 25.0, "At": 0.1,
              "c_star_val": 1550.0}, "expect": 6.2214e6, "tol": 1e-3},
    {"id": "53.b", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.8e-5, "n": 0.35, "rho_p": 1770.0, "Ab": 25.0, "At": 0.102,
              "c_star_val": 1550.0}, "expect": 6.0348e6, "tol": 1e-3},
    {"id": "53.c", "fn": "Cf", "args": {"gamma": 1.19, "eps": 67.65,
     "p0": 206.4e5, "pa": 0.0}, "expect": 1.93776, "tol": 1e-3},

    # ================================================================ group I
    # 57: Bartz flux vs chamber pressure, and the throat flux itself
    {"id": "57.a", "fn": "bartz_hg", "args": {"Dt": 0.30, "mu0": 1.0e-4,
     "cp0": 2200.0, "Pr0": 0.8, "p0": 300e5, "c_star_val": 1759.0,
     "rc": 0.60, "A_ratio": 1.0}, "expect": 29888.2, "tol": 1e-3},
    # 29888/9330 = 3.20x for 70 -> 300 bar, i.e. (300/70)^0.8
    {"id": "57.b", "fn": "heat_flux",
     "args": {"hg": 9330.0, "Taw": 3567.3, "Twg": 800.0},
     "expect": 25.82e6, "tol": 1e-3},
    {"id": "57.c", "fn": "adiabatic_wall_T",
     "args": {"T0": 3600.0, "gamma": 1.20, "Mach": 1.0},
     "expect": 3567.3, "tol": 1e-3},

    # 59: why copper. Same 26 MW/m2 through 0.7 mm of NARloy-Z (k=350) vs a
    # nickel-alloy wall of the same thickness (k=20).
    {"id": "59.a", "fn": "wall_dT", "args": {"q": 25.82e6, "t": 0.0007, "k": 350.0},
     "expect": 51.64, "tol": 1e-3},
    {"id": "59.b", "fn": "wall_dT", "args": {"q": 25.82e6, "t": 0.0007, "k": 20.0},
     "expect": 903.7, "tol": 1e-3},

    # ================================================================ group J
    # 65: NPSH available, LOX at 3 bar tank, 1 bar vs 0.3 bar vapour pressure
    {"id": "65.a", "fn": "npsh_available",
     "args": {"p_tank": 3e5, "p_vapor": 1e5, "rho": 1141.0},
     "expect": 17.874, "tol": 1e-3},
    {"id": "65.b", "fn": "npsh_available",
     "args": {"p_tank": 3e5, "p_vapor": 0.3e5, "rho": 1141.0},
     "expect": 24.130, "tol": 1e-3},

    # 66: F-1 pump shaft power from the published flows. 1,789 kg/s LOX
    # (1141 kg/m3) + 788 kg/s RP-1 (810 kg/m3), both raised ~110 bar, at 75%
    # pump efficiency [J]. Published: 41 MW (55,000 bhp).
    {"id": "66.a", "fn": "pump_power",
     "args": {"mdot": 1789.0, "dp": 110e5, "rho": 1141.0, "eta": 0.75},
     "expect": 22.996e6, "tol": 1e-3},
    {"id": "66.b", "fn": "pump_power",
     "args": {"mdot": 788.0, "dp": 110e5, "rho": 810.0, "eta": 0.75},
     "expect": 14.268e6, "tol": 1e-3},
    # sum 37.3 MW against the published 41 MW: 9% low, which is the pump
    # efficiency and the discharge pressure assumption, not the method.

    # ================================================================ group Q
    # 101: grain 10 K below qualification temperature. sigma_p = 0.002 /K [E].
    {"id": "101.a", "fn": "temperature_sensitivity_pressure",
     "args": {"sigma_p": 0.002, "dT": -10.0}, "expect": 0.98020, "tol": 1e-4},
    {"id": "101.b", "fn": "pressure_sensitivity_pi_K",
     "args": {"sigma_p": 0.002, "n": 0.35}, "expect": 0.0030769, "tol": 1e-4},

    # 103: Kn is the design variable. Kn 250 -> 275 (+10%) at n = 0.35.
    {"id": "103.a", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.8e-5, "n": 0.35, "rho_p": 1770.0, "Ab": 25.0, "At": 0.1,
              "c_star_val": 1550.0}, "expect": 6.2214e6, "tol": 1e-3},
    {"id": "103.b", "fn": "solid_equilibrium_pressure",
     "args": {"a": 3.8e-5, "n": 0.35, "rho_p": 1770.0, "Ab": 27.5, "At": 0.1,
              "c_star_val": 1550.0}, "expect": 7.2040e6, "tol": 1e-3},
    # +10% Kn -> +15.8% pc, the 1/(1-n) amplification

    # ================================================================ group R
    # 111: ideal cold-gas Isp, T0 = 300 K, eps = 50 (engine-database C.1)
    {"id": "111.a", "fn": "ideal_isp_vac", "args": {"gamma": 1.40,
     "R": 8314.46 / 28.014, "T0": 300.0, "eps": 50.0}, "expect": 76.84, "tol": 1e-3},
    {"id": "111.b", "fn": "ideal_isp_vac", "args": {"gamma": 1.667,
     "R": 8314.46 / 4.003, "T0": 300.0, "eps": 50.0}, "expect": 178.06, "tol": 1e-3},

    # 112: MarCO's R-236fa (M = 152.04, gamma ~ 1.08) and its impulse density
    # against 241-bar helium (engine-database C.1.1 corrected values)
    {"id": "112.a", "fn": "ideal_isp_vac", "args": {"gamma": 1.08,
     "R": 8314.46 / 152.04, "T0": 300.0, "eps": 50.0}, "expect": 43.245, "tol": 1e-3},
    {"id": "112.b", "fn": "density_isp", "args": {"rho": 1360.0, "isp": 42.0},
     "expect": 57120.0, "tol": 1e-4},
    {"id": "112.c", "fn": "density_isp", "args": {"rho": 40.0, "isp": 160.0},
     "expect": 6400.0, "tol": 1e-4},   # ratio 8.9x in the refrigerant's favour

    # 114: blowdown. 241 bar COPV run down to 20 bar, isothermal vs adiabatic.
    {"id": "114.a", "fn": "usable_fraction",
     "args": {"p_i": 241e5, "p_f": 20e5, "isothermal": True},
     "expect": 0.91701, "tol": 1e-4},
    {"id": "114.b", "fn": "usable_fraction",
     "args": {"p_i": 241e5, "p_f": 20e5, "isothermal": False, "gamma": 1.4},
     "expect": 0.83101, "tol": 1e-4},

    # 116: heating the gas. Isp goes as sqrt(T0): 300 K -> 600 K on nitrogen.
    {"id": "116.a", "fn": "ideal_isp_vac", "args": {"gamma": 1.40,
     "R": 8314.46 / 28.014, "T0": 600.0, "eps": 50.0}, "expect": 108.67, "tol": 1e-3},
]
