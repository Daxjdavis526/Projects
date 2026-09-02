"""Module 07 — Injectors: worked-example register.

Every entry maps a worked example (or a checkable intermediate step) in
part2-liquid/07-injectors.md onto a function in tools/rocket.py, so the
numbers printed in the module can be re-verified.

Run:  python3 tools/examples/07.py

Common design case (WE1-WE5): LOX/RP-1 gas-generator booster,
pc = 100 bar, MR = 2.27, mdot_f = 30 kg/s over 500 fuel orifices,
rho_RP1 = 810, rho_LOX = 1140 kg/m^3, sigma = 0.023 N/m,
mu = 1.62e-3 Pa.s, c* = 1800 m/s, L* = 1.0 m,
chamber gas M = 23.9 kg/kmol at 3500 K -> rho_c = 8.213 kg/m^3.
"""

EXAMPLES = [
    # --- WE1: orifice sizing -------------------------------------------------
    # d = 1.338 mm was obtained by inverting Eq. 3.1; this entry checks the
    # forward direction, i.e. that the sized orifice passes 30/500 kg/s.
    {"id": "07.WE1a", "fn": "orifice_mdot",
     "args": {"Cd": 0.75, "A": 1.405457e-06, "rho": 810.0, "dp": 2.0e6},
     "expect": 0.0600, "tol": 0.005},
    {"id": "07.WE1b", "fn": "orifice_velocity",
     "args": {"Cd": 0.75, "rho": 810.0, "dp": 2.0e6},
     "expect": 52.705, "tol": 0.005},
    {"id": "07.WE1c", "fn": "pump_power",
     "args": {"mdot": 30.0, "dp": 2.0e6, "rho": 810.0, "eta": 0.70},
     "expect": 1.0582e5, "tol": 0.005},

    # --- WE2: breakup-regime groups for the RP-1 jet -------------------------
    {"id": "07.WE2a", "fn": "weber",
     "args": {"rho": 810.0, "v": 52.705, "L": 1.3377e-3, "sigma": 0.023},
     "expect": 1.3086e5, "tol": 0.005},
    {"id": "07.WE2b", "fn": "reynolds",
     "args": {"rho": 810.0, "v": 52.705, "L": 1.3377e-3, "mu": 1.62e-3},
     "expect": 3.5252e4, "tol": 0.005},
    {"id": "07.WE2c", "fn": "ohnesorge",
     "args": {"mu": 1.62e-3, "rho": 810.0, "sigma": 0.023, "L": 1.3377e-3},
     "expect": 1.0264e-2, "tol": 0.005},
    # gas Weber number: same function, chamber gas density 8.213 kg/m^3.
    # We_g = 1327 >> 40.3, so the jet is in the atomization regime.
    {"id": "07.WE2d", "fn": "weber",
     "args": {"rho": 8.2129, "v": 52.705, "L": 1.3377e-3, "sigma": 0.023},
     "expect": 1.3269e3, "tol": 0.005},

    # --- WE3: unlike-doublet momentum balance --------------------------------
    {"id": "07.WE3a", "fn": "orifice_velocity",
     "args": {"Cd": 0.75, "rho": 1140.0, "dp": 2.0e6},
     "expect": 44.426, "tol": 0.005},
    # TMR = mdot_o V_o / (mdot_f V_f) = 1.913.  The Rupe parameter
    # R_u = TMR * (d_f/d_o) = 1.913 * (1.3377/1.8504) = 1.383 is arithmetic on
    # this result and is not a separate library function.
    {"id": "07.WE3b", "fn": "momentum_ratio",
     "args": {"mdot_o": 0.1362, "v_o": 44.426, "mdot_f": 0.0600, "v_f": 52.705},
     "expect": 1.9134, "tol": 0.005},

    # --- WE4: chamber stay time ---------------------------------------------
    # Vc = L* * At (Eq. from module 06); with L* = 1.0 m the stay time per unit
    # throat area is t_s = L* rho_c c* / pc.  Expressed through the library:
    # residence_time(Vc, rho_c, mdot) with At = 0.01 m^2 (arbitrary but
    # consistent: mdot = pc*At/c* = 1e7*0.01/1800 = 55.556 kg/s,
    # Vc = 1.0*0.01 = 0.01 m^3).
    {"id": "07.WE4a", "fn": "chamber_volume_from_Lstar",
     "args": {"Lstar": 1.0, "At": 0.01},
     "expect": 0.01, "tol": 1e-9},
    {"id": "07.WE4b", "fn": "residence_time",
     "args": {"Vc": 0.01, "rho_c": 8.2129, "mdot": 55.5556},
     "expect": 1.4783e-3, "tol": 0.005},

    # --- WE5: 100 kN methalox sizing used by the trade study and by N8 -------
    {"id": "07.N8a", "fn": "orifice_velocity",
     "args": {"Cd": 0.80, "rho": 1140.0, "dp": 1.2e6},
     "expect": 36.707, "tol": 0.005},
    {"id": "07.N8b", "fn": "orifice_velocity",
     "args": {"Cd": 0.80, "rho": 423.0, "dp": 1.2e6},
     "expect": 60.259, "tol": 0.005},
    {"id": "07.N8c", "fn": "orifice_mdot",
     "args": {"Cd": 0.80, "A": 5.3043e-4, "rho": 1140.0, "dp": 1.2e6},
     "expect": 22.196, "tol": 0.005},

    # --- key problems that reuse the same library calls ----------------------
    {"id": "07.N1", "fn": "orifice_velocity",
     "args": {"Cd": 0.78, "rho": 1140.0, "dp": 1.8e6},
     "expect": 43.832, "tol": 0.005},
    {"id": "07.N2a", "fn": "ohnesorge",
     "args": {"mu": 1.9e-4, "rho": 1140.0, "sigma": 0.013, "L": 1.6e-3},
     "expect": 1.2339e-3, "tol": 0.005},
    {"id": "07.N2b", "fn": "weber",
     "args": {"rho": 7.0041, "v": 43.832, "L": 1.6e-3, "sigma": 0.013},
     "expect": 1.6562e3, "tol": 0.005},
    {"id": "07.N3a", "fn": "orifice_velocity",
     "args": {"Cd": 0.80, "rho": 875.0, "dp": 5.0e5},
     "expect": 27.045, "tol": 0.005},
    {"id": "07.N3b", "fn": "orifice_velocity",
     "args": {"Cd": 0.80, "rho": 1440.0, "dp": 5.0e5},
     "expect": 21.082, "tol": 0.005},
    {"id": "07.N3c", "fn": "momentum_ratio",
     "args": {"mdot_o": 0.04125, "v_o": 21.082, "mdot_f": 0.025, "v_f": 27.045},
     "expect": 1.2862, "tol": 0.005},
    {"id": "07.Q3a", "fn": "orifice_velocity",
     "args": {"Cd": 0.76, "rho": 790.0, "dp": 1.4e6},
     "expect": 45.246, "tol": 0.005},
    {"id": "07.Q4", "fn": "ohnesorge",
     "args": {"mu": 1.1e-3, "rho": 790.0, "sigma": 0.025, "L": 1.2661e-3},
     "expect": 6.9563e-3, "tol": 0.005},
]

# ---------------------------------------------------------------------------
# Examples whose arithmetic does NOT map onto a tools/rocket.py function.
# They are recomputed below so the module's numbers can still be checked.
#
#  07.WE2e  Ohnesorge chart placement: We_g = 1327 >> 40.3 -> atomization regime.
#  07.WE3c  Rupe parameter R_u = rho_o V_o^2 d_o / (rho_f V_f^2 d_f).
#           Plain doublet 1.383; O-F-O triplet (ox split in two) 0.978;
#           F-O-F triplet (fuel split in two) 1.956.
#  07.WE4c  Ingebo-type SMD: D30/d = 5/(We_g Re)^0.25 -> D30 = 80.9 um,
#           SMD ~ 1.2 D30 ~ 97 um.
#  07.WE4d  d^2-law lifetime with Ranz-Marshall convection correction:
#           Kv = 8 kg/(rho_l cp_g) ln(1+B) = 1.736e-6 m^2/s;
#           Keff(100 um) = 1.269e-5 m^2/s -> t_v = 0.788 ms  (t_s = 1.478 ms);
#           Keff(200 um) = 1.723e-5 m^2/s -> t_v = 2.322 ms  (needs L* = 1.57 m).
#  07.WE5   Chug neutral stability: solve w*tau + atan(w*t_s) = pi, then
#           k_crit = sqrt(1 + (w t_s)^2) and (dp/pc)_min = 1/(2 k_crit).
#           t_s = 1.478 ms, tau = 1.0 ms -> f = 304 Hz, k_crit = 3.00, 16.7 %.
#  07.MAN   Manifold rule: dm/m = 0.5 Cd^2 (sum A_or / A_man)^2, so 1 % error
#           needs A_man/sum A_or >= 5.3 at Cd = 0.75.
# ---------------------------------------------------------------------------

import math


def rupe(rho_o, v_o, d_o, rho_f, v_f, d_f):
    """Rupe momentum-balance parameter for an unlike impinging element."""
    return (rho_o * v_o ** 2 * d_o) / (rho_f * v_f ** 2 * d_f)


def smd_ingebo(d, We_g, Re_l, C=5.0, smd_over_d30=1.2):
    """Ingebo-type volume mean diameter and SMD for a jet in a gas stream."""
    d30 = C * d / (We_g * Re_l) ** 0.25
    return d30, smd_over_d30 * d30


def evaporation_constant(k_g, rho_l, cp_g, B):
    """d^2-law evaporation constant, stagnant drop (Eq. 3.14)."""
    return 8.0 * k_g / (rho_l * cp_g) * math.log(1.0 + B)


def droplet_lifetime(d0, Kv, rho_g, v_rel, mu_g, Pr=0.8):
    """Lifetime with the Ranz-Marshall convection correction (Eq. 3.15)."""
    Re_d = rho_g * v_rel * d0 / mu_g
    Keff = Kv * (1.0 + 0.3 * math.sqrt(Re_d) * Pr ** (1.0 / 3.0))
    return d0 ** 2 / Keff, Keff, Re_d


def chug_limit(t_s, tau):
    """Neutral-stability chug frequency, critical gain and minimum dp/pc."""
    lo, hi = 1.0, 1.0e6
    for _ in range(300):
        mid = 0.5 * (lo + hi)
        if mid * tau + math.atan(mid * t_s) - math.pi < 0.0:
            lo = mid
        else:
            hi = mid
    w = 0.5 * (lo + hi)
    k_crit = math.sqrt(1.0 + (w * t_s) ** 2)
    return w / (2.0 * math.pi), k_crit, 1.0 / (2.0 * k_crit)


def manifold_area_ratio(err, Cd):
    """Minimum A_man / sum(A_orifice) for a given fractional flow error."""
    return 1.0 / math.sqrt(2.0 * err / Cd ** 2)


def _main() -> int:
    import os
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                    os.pardir))
    import rocket

    failures = 0
    for ex in EXAMPLES:
        fn = getattr(rocket, ex["fn"])
        got = fn(**ex["args"])
        rel = abs(got - ex["expect"]) / abs(ex["expect"]) if ex["expect"] else abs(got)
        ok = rel <= ex["tol"]
        failures += 0 if ok else 1
        print(f"{'PASS' if ok else 'FAIL'}  {ex['id']:<10} {ex['fn']:<26} "
              f"got={got:.6g} expect={ex['expect']:.6g} rel={rel:.2e}")

    print("\n-- non-library checks --")
    ru = rupe(1140.0, 44.426, 1.8504e-3, 810.0, 52.705, 1.3377e-3)
    print(f"07.WE3c  Rupe R_u (plain doublet)      = {ru:.3f}   (expect 1.383)")
    print(f"         R_u, ox split two ways        = {ru / math.sqrt(2):.3f}   (expect 0.978)")
    print(f"         R_u, fuel split two ways      = {ru * math.sqrt(2):.3f}   (expect 1.956)")

    d30, smd = smd_ingebo(1.3377e-3, 1.3269e3, 3.5252e4)
    print(f"07.WE4c  D30 = {d30*1e6:.1f} um, SMD = {smd*1e6:.1f} um   (expect 80.9 / 97)")

    Kv = evaporation_constant(0.20, 810.0, 2500.0, 8.0)
    for d0 in (100e-6, 200e-6):
        tv, Keff, Re_d = droplet_lifetime(d0, Kv, 8.2129, 50.0, 8.0e-5)
        print(f"07.WE4d  d0={d0*1e6:5.0f} um  Re_d={Re_d:6.0f}  "
              f"Keff={Keff:.3e} m2/s  t_v={tv*1e3:.3f} ms")
    print("         chamber stay time t_s = 1.478 ms at L* = 1.0 m")

    for tau in (0.5e-3, 1.0e-3, 1.5e-3, 2.0e-3):
        f, k, dpc = chug_limit(1.4783e-3, tau)
        print(f"07.WE5   tau={tau*1e3:.1f} ms  f={f:6.1f} Hz  "
              f"k_crit={k:.3f}  (dp/pc)_min={dpc*100:.1f} %")
    for t_s, tau, tag in ((2.2e-3, 1.2e-3, "N5a"), (0.8e-3, 1.2e-3, "N5b"),
                          (1.9e-3, 0.9e-3, "Q6 ")):
        f, k, dpc = chug_limit(t_s, tau)
        print(f"07.{tag}   t_s={t_s*1e3:.1f} ms tau={tau*1e3:.1f} ms  "
              f"f={f:6.1f} Hz  k_crit={k:.3f}  (dp/pc)_min={dpc*100:.1f} %")

    for err in (0.01, 0.02, 0.05):
        print(f"07.MAN   error {err:.0%} -> A_man/sum(A_or) >= "
              f"{manifold_area_ratio(err, 0.75):.2f}")

    print("\n" + ("all library examples PASS" if failures == 0
                  else f"{failures} FAILURE(S)"))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(_main())
