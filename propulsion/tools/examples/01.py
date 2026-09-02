"""
Module 01 — Thermodynamics for Propulsion: worked-example registry.

Every entry maps one number printed in `part1-foundations/01-thermodynamics.md`
or its key onto a call into `tools/rocket.py`, so the text can be re-verified
mechanically.  `tol` is a RELATIVE tolerance.

Reference gas used by Examples 1, 2 and 4 (a LOX/LH2 product mixture at
MR 6.0, pc ~206 bar, derived in worked Example 2):
    gamma = 1.1912,  M = 13.845 kg/kmol,  R = 600.54 J/(kg K),
    cp    = 3742.1 J/(kg K),  T0 = 3600 K

Arithmetic that has no counterpart in rocket.py is described in the comments
under NON_LIBRARY at the bottom of this file.
"""

EXAMPLES = [
    # ---------------------------------------------------------------- WE1 --
    # Example 1 - stagnation quantities in an RS-25-class chamber.
    {"id": "01.WE1.R", "fn": "R_specific",
     "args": {"M": 13.845}, "expect": 600.54, "tol": 1e-4},
    {"id": "01.WE1.Mc", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.1912, "eps": 3.0, "supersonic": False},
     "expect": 0.20200, "tol": 1e-3},
    {"id": "01.WE1.T0_over_T", "fn": "T0_over_T",
     "args": {"gamma": 1.1912, "Mach": 0.20200}, "expect": 1.003901, "tol": 1e-5},
    {"id": "01.WE1.p0_over_p", "fn": "p0_over_p",
     "args": {"gamma": 1.1912, "Mach": 0.20200}, "expect": 1.024551, "tol": 1e-5},
    {"id": "01.WE1.a", "fn": "a_sound",
     "args": {"gamma": 1.1912, "R": 600.54, "T": 3586.0},
     "expect": 1601.6, "tol": 1e-3},
    {"id": "01.WE1.mdot_per_At_pinj", "fn": "choked_mdot",
     "args": {"gamma": 1.1912, "R": 600.54, "T0": 3600.0,
              "p0": 20.64e6, "At": 1.0},
     "expect": 9079.5, "tol": 1e-3},
    {"id": "01.WE1.mdot_per_At_p0t", "fn": "choked_mdot",
     "args": {"gamma": 1.1912, "R": 600.54, "T0": 3600.0,
              "p0": 20.167e6, "At": 1.0},
     "expect": 8871.3, "tol": 1e-3},

    # ---------------------------------------------------------------- WE2 --
    # Example 2 - mixture properties of a LOX/LH2 product gas.
    # (M, cp, gamma come from the mole-fraction sums; see NON_LIBRARY below.)
    {"id": "01.WE2.R", "fn": "R_specific",
     "args": {"M": 13.845}, "expect": 600.54, "tol": 1e-4},
    {"id": "01.WE2.Gamma", "fn": "gamma_function",
     "args": {"gamma": 1.1912}, "expect": 0.64682, "tol": 1e-4},
    {"id": "01.WE2.cstar", "fn": "c_star",
     "args": {"gamma": 1.1912, "R": 600.54, "T0": 3600.0},
     "expect": 2273.2, "tol": 1e-3},

    # ---------------------------------------------------------------- WE4 --
    # Example 4 - frozen vs equilibrium Isp, eps = 69 into vacuum.
    {"id": "01.WE4.Me", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.1912, "eps": 69.0}, "expect": 4.5615, "tol": 1e-3},
    {"id": "01.WE4.p0_over_pe", "fn": "p0_over_p",
     "args": {"gamma": 1.1912, "Mach": 4.5615}, "expect": 918.2, "tol": 2e-3},
    {"id": "01.WE4.ve_frozen", "fn": "exit_velocity",
     "args": {"gamma": 1.1912, "R": 600.54, "T0": 3600.0,
              "p0": 20.64e6, "pe": 22479.8},
     "expect": 4234.0, "tol": 1e-3},
    {"id": "01.WE4.Cf_vac", "fn": "Cf",
     "args": {"gamma": 1.1912, "eps": 69.0, "p0": 20.64e6, "pa": 0.0},
     "expect": 1.9377, "tol": 1e-3},
    {"id": "01.WE4.c_eff_frozen", "fn": "c_eff",
     "args": {"c_star_val": 2273.2, "Cf_val": 1.9377},
     "expect": 4404.8, "tol": 1e-3},
    {"id": "01.WE4.Isp_frozen", "fn": "isp_from_c",
     "args": {"c_eff": 4404.8}, "expect": 449.17, "tol": 1e-3},
    # 4% p0 loss inside the divergent section at fixed pe (§3.6 / key C7)
    {"id": "01.C7.ve_lossy", "fn": "exit_velocity",
     "args": {"gamma": 1.1912, "R": 600.54, "T0": 3600.0,
              "p0": 0.96 * 20.64e6, "pe": 22479.8},
     "expect": 4227.0, "tol": 1e-3},
    # 2% p0 loss version quoted in §3.6
    {"id": "01.S36.ve_lossy2pct", "fn": "exit_velocity",
     "args": {"gamma": 1.1912, "R": 600.54, "T0": 3600.0,
              "p0": 0.98 * 20.64e6, "pe": 22479.8},
     "expect": 4230.6, "tol": 1e-3},

    # ------------------------------------------------------ real engines ---
    # F-1 back-out (§6.1). gamma/M/T0 are CEA-class estimates, NOT measured
    # engine data; pc ~= 70 bar injector-end is the recommended value from
    # reference/_verify-liquid.md, where 965-1125 psia is the published spread.
    {"id": "01.F1.R", "fn": "R_specific",
     "args": {"M": 22.2}, "expect": 374.53, "tol": 1e-4},
    {"id": "01.F1.Cf_SL", "fn": "Cf",
     "args": {"gamma": 1.22, "eps": 16.0, "p0": 70.0e5, "pa": 101325.0},
     "expect": 1.5507, "tol": 1e-3},
    {"id": "01.F1.cstar_ideal", "fn": "c_star",
     "args": {"gamma": 1.22, "R": 374.53, "T0": 3570.0},
     "expect": 1772.4, "tol": 1e-3},
    # RS-25 ideal frozen c* and Cf at eps = 69 (manufacturer's area ratio;
    # ~77.5:1 is widely quoted against a different reference area).
    {"id": "01.RS25.cstar_ideal", "fn": "c_star",
     "args": {"gamma": 1.1912, "R": 600.54, "T0": 3600.0},
     "expect": 2273.2, "tol": 1e-3},

    # ---------------------------------------------------------- problems ---
    # C1 - kerolox specific heats
    {"id": "01.C1.R", "fn": "R_specific",
     "args": {"M": 22.2}, "expect": 374.53, "tol": 1e-4},
    # C2 - chamber at eps_c = 2.0, gamma = 1.20, M = 22.0, T0 = 3400 K
    {"id": "01.C2.R", "fn": "R_specific",
     "args": {"M": 22.0}, "expect": 377.93, "tol": 1e-4},
    {"id": "01.C2.Mc", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 2.0, "supersonic": False},
     "expect": 0.31220, "tol": 1e-3},
    {"id": "01.C2.a", "fn": "a_sound",
     "args": {"gamma": 1.20, "R": 377.93, "T": 3367.2},
     "expect": 1235.7, "tol": 1e-3},
    {"id": "01.C2.cstar", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 377.93, "T0": 3400.0},
     "expect": 1747.9, "tol": 1e-3},
    # C3 - kerolox product mixture
    {"id": "01.C3.R", "fn": "R_specific",
     "args": {"M": 20.9222}, "expect": 397.40, "tol": 1e-4},
    {"id": "01.C3.cstar", "fn": "c_star",
     "args": {"gamma": 1.2183, "R": 397.40, "T0": 3500.0},
     "expect": 1808.7, "tol": 1e-3},
    # C6 - eta_c* with and without the injector-face correction
    {"id": "01.C6.R", "fn": "R_specific",
     "args": {"M": 21.0}, "expect": 395.93, "tol": 1e-4},
    {"id": "01.C6.cstar_ideal", "fn": "c_star",
     "args": {"gamma": 1.20, "R": 395.93, "T0": 3500.0},
     "expect": 1815.1, "tol": 1e-3},
    {"id": "01.C6.Mc", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 2.5, "supersonic": False},
     "expect": 0.24470, "tol": 1e-3},

    # -------------------------------------------------------------- quiz ---
    {"id": "01.Q3.T0_over_T", "fn": "T0_over_T",
     "args": {"gamma": 1.20, "Mach": 0.30}, "expect": 1.00900, "tol": 1e-5},
    {"id": "01.Q3.p0_over_p", "fn": "p0_over_p",
     "args": {"gamma": 1.20, "Mach": 0.30}, "expect": 1.05523, "tol": 1e-5},
    {"id": "01.Q4.Mc", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.21, "eps": 2.5, "supersonic": False},
     "expect": 0.24437, "tol": 1e-3},
    {"id": "01.Q6.R", "fn": "R_specific",
     "args": {"M": 13.1147}, "expect": 633.98, "tol": 1e-4},
    {"id": "01.Q8.Mc", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.21, "eps": 3.5, "supersonic": False},
     "expect": 0.17170, "tol": 2e-3},
    {"id": "01.Q9.Isp_eq_bound", "fn": "isp_from_c",
     "args": {"c_eff": 4472.5}, "expect": 456.07, "tol": 1e-3},

    # --------------------------------------------------- P3 (both cases) ---
    {"id": "01.P3.Mc_1p8", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 1.8, "supersonic": False},
     "expect": 0.35190, "tol": 1e-3},
    {"id": "01.P3.Mc_4p0", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.20, "eps": 4.0, "supersonic": False},
     "expect": 0.14980, "tol": 1e-3},
]


# ---------------------------------------------------------------------------
# NON_LIBRARY - arithmetic in this module that rocket.py has no function for.
# Described here so the text can still be audited by hand.
# ---------------------------------------------------------------------------
NON_LIBRARY = """
Eq. 3.8, injector-face to throat-stagnation pressure ratio (no rocket.py fn):

    p0t / p_inj = (1 + (g-1)/2 * Mc^2)^(g/(g-1)) / (1 + g * Mc^2)

  with Mc = mach_from_area_ratio(g, eps_c, supersonic=False).
  Values used in the text:
    g=1.1912, eps_c=3.0 -> Mc=0.2020, ratio=0.97706  (2.29 % loss)   [WE1]
    g=1.20,   eps_c=2.0 -> Mc=0.3122, ratio=0.94892  (5.11 % loss)   [C2]
    g=1.20,   eps_c=1.8 -> Mc=0.3519, ratio=0.93734  (6.27 % loss)   [P3]
    g=1.20,   eps_c=4.0 -> Mc=0.1498, ratio=0.98696  (1.30 % loss)   [P3]
    g=1.20,   eps_c=2.5 -> Mc=0.2447, ratio=0.96698  (3.30 % loss)   [C6]
    g=1.21,   eps_c=2.5 -> Mc=0.2444, ratio=0.96679  (3.32 % loss)   [Q4]
    g=1.21,   eps_c=3.5 -> Mc=0.1717, ratio=0.98290  (1.71 % loss)   [Q8]

Eq. 3.5, entropy generation from a stagnation-pressure loss:
    s_gen = -R * ln(p02/p01)
    WE1: -600.54*ln(0.97706) = 13.94 J/(kg K)
    C2:  -377.93*ln(0.94892) = 19.81 J/(kg K)
    C7:  -600.54*ln(0.96)    = 24.52 J/(kg K)
  Gouy-Stodola cross-check, C7: Te*s_gen/ve = 1205*24.52/4234 = 6.98 m/s,
  against 7.00 m/s from the direct exit_velocity difference. Agreement 0.3 %.

Eq. 3.11, mixture properties from mole fractions (pure summation):
  WE2, LOX/LH2 at MR 6.0, pc ~206 bar. x = {H2O 0.7115, H2 0.2490, OH 0.0263,
  H 0.0106, O 0.0010, O2 0.0016}; Mi = {18.0153, 2.0159, 17.0073, 1.0079,
  15.9994, 31.9988}; cp_i at 3600 K [J/(mol K)] = {57.6, 38.3, 37.4, 20.786,
  20.9, 40.8}.
    M      = sum(x_i * Mi)          = 13.8450 kg/kmol
    cp_bar = sum(x_i * cp_i)        = 51.8092 J/(mol K)
    cp     = cp_bar / M * 1000      = 3742.1 J/(kg K)
    R      = 8314.46 / M            =  600.54 J/(kg K)
    gamma  = cp / (cp - R)          = 1.1912
  C3, kerolox: x = {H2O 0.30, CO 0.24, CO2 0.16, H2 0.20, OH 0.04, H 0.03,
  O2 0.01, O 0.02} -> M = 20.9222, cp_bar = 46.4056, cp = 2218.0,
  R = 397.40, gamma = 1.2183.
  Q5/Q6: x = {H2O 0.60, H2 0.30, OH 0.10} -> M = 13.1147, Y_H2 = 0.0461,
  cp_bar = 49.79, cp = 3796.5, R = 633.98, gamma = 1.2005.

Eq. 3.13, adiabatic flame temperature (needs JANAF sensible-enthalpy tables,
not in rocket.py). LOX/LH2, no dissociation:
    MR 6.0: nO2 = 0.37800 per mol H2 -> 0.75599 H2O + 0.24401 H2,
            Q = 182.82 kJ/mol-H2.
            298 K gaseous reactants   -> Tad = 4245 K
            cryogenic liquid reactants-> Tad = 3986 K   (reactant h = -13.918 kJ)
            CEA-class equilibrium     ->      ~3600 K
    MR 4.0: nO2 = 0.25200 -> 0.50399 H2O + 0.49601 H2, Q = 121.88 kJ/mol-H2.
            298 K gaseous  -> 3299 K ; cryogenic -> 3038 K
            CEA-class equilibrium ->  ~2980 K   (reactant h = -12.283 kJ)
  Sensible enthalpies H(T)-H(298) in kJ/mol from JANAF; cryogenic enthalpies of
  formation -9.012 (LH2, 20.3 K) and -12.979 (LOX, 90.2 K) kJ/mol.

Eq. 3.15/3.16, dissociation of H2O at 3600 K with dG0 = +41.0 kJ/mol:
    Kp = exp(-41000/(8.31446*3600)) = 0.2542
    exact alpha from  a*(a/2)^0.5 / ((1-a)*(1+a/2)^0.5) * p^0.5 = Kp :
        p =   1.0 bar -> 0.3870      small-alpha form -> 0.5055
        p =  32.8 bar -> 0.1456                       -> 0.1576
        p =  70.0 bar -> 0.1152                       -> 0.1227
        p = 206.4 bar -> 0.0819                       -> 0.0853
    Q7: alpha(25 bar) = 0.082*(206/25)^(1/3) = 0.166

WE4 recombination energy (Hess-law bookkeeping, not in rocket.py):
    dHf [kJ/mol]: H2O -241.826, H2 0, OH +38.987, H +217.998, O +249.180, O2 0
    chamber      : sum(x_i dHf_i)          = -168.474 kJ/mol-mix
    element count: nH = 1.9579, nO = 0.7420 per mol-mix
    recombined   : 0.7420 H2O + 0.2369 H2  = -179.435 kJ/mol-mix, n = 0.9789
    released     = 10.961 kJ/mol-mix / 0.013845 kg/mol = 0.792 MJ/kg
    M rises 13.845 -> 14.14 kg/kmol on full recombination.
    c_eq = sqrt(c_frozen^2 + 2*f*dh):  f=0.6 -> 460.1 s, f=0.8 -> 463.6 s,
    f=1.0 -> 467.2 s, against a frozen 449.2 s and a delivered RS-25 452.3 s.
    Q9 variant: c_frozen = 441*g0 = 4324.7, dh = 0.65 MJ/kg -> bound 456.07 s;
    delivered 448 s implies a recovered fraction of 0.46 (an underestimate,
    because real losses are credited against the recombination gain).

Bulk density for the T1 trade study (LOX 1141, LH2 70.8 kg/m^3):
    rho_bulk = (1+r) / (r/rho_o + 1/rho_f)
    r = 4.5 -> 304.4 ; 5.0 -> 324.2 ; 5.5 -> 343.1 ; 6.0 -> 361.1 kg/m^3
"""


if __name__ == "__main__":
    import os
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import rocket

    failures = 0
    for ex in EXAMPLES:
        got = getattr(rocket, ex["fn"])(**ex["args"])
        rel = abs(got - ex["expect"]) / abs(ex["expect"])
        ok = rel <= ex["tol"]
        if not ok:
            failures += 1
        print(f"{'ok ' if ok else 'FAIL'} {ex['id']:<28} {ex['fn']:<22} "
              f"got={got:.6g} expect={ex['expect']:.6g} rel={rel:.2e}")
    print(f"\n{len(EXAMPLES) - failures}/{len(EXAMPLES)} passed")
    sys.exit(1 if failures else 0)
