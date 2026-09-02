"""
Module 04 — Thermochemistry and CEA: worked-example registry.

Each entry names a function in tools/rocket.py, its arguments, and the value
printed in the module text. `tol` is relative.

Examples whose arithmetic does NOT map onto a rocket.py function are described
in comments below, with their inputs and expected outputs, so they can still be
checked by hand or by a future chemistry module.

  04.WE1  Stoichiometric O/F by mass for five propellant pairs.
          Pure stoichiometry; no rocket.py function applies.
          Atomic masses (kg/kmol): H 1.008, C 12.011, N 14.007, O 15.999.
            LH2/LOX     2 H2 + O2 -> 2 H2O
                        r_st = 31.998 / (2 x 2.016)          = 7.936
            CH4/LOX     CH4 + 2 O2 -> CO2 + 2 H2O
                        r_st = 2 x 31.998 / 16.043           = 3.989
            RP-1/LOX    CH1.95 + 1.4875 O2 -> CO2 + 0.975 H2O
                        r_st = 1.4875 x 31.998 / 13.977      = 3.406
            MMH/N2O4    CH6N2 + 1.25 N2O4 -> CO2 + 3 H2O + 2.25 N2
                        r_st = 1.25 x 92.010 / 46.073        = 2.496
            UDMH/N2O4   C2H8N2 + 2 N2O4 -> 2 CO2 + 4 H2O + 3 N2
                        r_st = 2 x 92.010 / 60.100           = 3.062
          (Aerozine-50 / N2O4, 50/50 UDMH/N2H4 by mass: r_st = 2.249.)

  04.WE2  Hand adiabatic flame temperature, LOX/LH2 at O/F = 6.
          Enthalpy balance with heats of formation and linear cp(T) fits; no
          rocket.py function applies.
          Basis 1 kmol O2 (31.998 kg); fuel 5.333 kg = 2.6453 kmol H2.
          Products (no dissociation): 2 H2O + 0.6453 H2, n = 2.6453 kmol,
          Mbar = 14.112 kg/kmol.
          dHrxn = 2 x (-241 826) = -483 652 kJ.
          cp fits, kJ/(kmol K), valid 1500-4500 K:
            H2O : 42.88 + 4.414e-3 T      H2 : 28.43 + 2.861e-3 T
          h(1000)-h(298.15): H2O 25 980 kJ/kmol, H2 20 680 kJ/kmol.
            gaseous reactants at 298.15 K   -> T_ad = 4176 K  (exact poly 4203 K)
            cryogenic liquid reactants      -> T_ad = 3926 K  (exact poly 3952 K)
              h(O2,L, 90.17 K) = -12 979 kJ/kmol
              h(H2,L, 20.27 K) =  -9 012 kJ/kmol
          Six-species equilibrium (H2, H2O, O2, OH, H, O) at 200 bar:
            T0 = 3602 K, Mbar = 13.619 kg/kmol.  Gap = 324 K.
          Dissociation energy stored = 1293 kJ/kg; frozen cp = 3.80 kJ/(kg K);
          1293/3.80 = 340 K, which accounts for the gap.

  04.WE3  c* and vacuum Isp versus mixture ratio (entries below).
          Chamber properties are equilibrium values at pc = 200 bar:
            O/F 4.0 : T0 = 2975.8 K, Mbar = 10.031, gamma_s = 1.1968
            O/F 6.0 : T0 = 3601.6 K, Mbar = 13.619, gamma_s = 1.1473
            O/F 8.0 : T0 = 3743.6 K, Mbar = 16.383, gamma_s = 1.1345
          Isp_vac = c* * Cf / g0 at eps = 77.5, pa = 0:
            479.3 s, 475.9 s, 448.5 s respectively.
          Full equilibrium expansion (not constant gamma) gives
            459.8 s, 464.8 s, 450.2 s — the constant-gamma shortcut is
            optimistic by 4-20 s and worst at low O/F.

  04.WE4  Picking eps from a CEA table (entry below).
          pc = 117 bar, O/F 6.1, target pe = 0.4 x 1.013 = 0.405 bar.
          Log-interpolating the equilibrium table between eps = 20
          (pe = 0.6338 bar) and eps = 30 (pe = 0.3715 bar) gives eps = 28.1.
          The constant-gamma closed form (entry 04.WE4a) gives 31.4 — 12 %
          high, because gamma rises from 1.147 to ~1.26 down the nozzle.
"""

EXAMPLES = [
    # --- WE3: c* at three mixture ratios, LOX/LH2, pc = 200 bar -------------
    {"id": "04.WE3a", "fn": "c_star",
     "args": {"gamma": 1.1968, "R": 828.8765, "T0": 2975.8},
     "expect": 2424.00, "tol": 0.001},
    {"id": "04.WE3b", "fn": "c_star",
     "args": {"gamma": 1.1473, "R": 610.5044, "T0": 3601.6},
     "expect": 2323.85, "tol": 0.001},
    {"id": "04.WE3c", "fn": "c_star",
     "args": {"gamma": 1.1345, "R": 507.5053, "T0": 3743.6},
     "expect": 2168.97, "tol": 0.001},

    # specific gas constants used above
    {"id": "04.WE3R4", "fn": "R_specific", "args": {"M": 10.031},
     "expect": 828.8765, "tol": 0.001},
    {"id": "04.WE3R6", "fn": "R_specific", "args": {"M": 13.619},
     "expect": 610.5044, "tol": 0.001},
    {"id": "04.WE3R8", "fn": "R_specific", "args": {"M": 16.383},
     "expect": 507.5053, "tol": 0.001},

    # --- WE3: vacuum thrust coefficient at eps = 77.5 -----------------------
    {"id": "04.WE3d", "fn": "Cf",
     "args": {"gamma": 1.1968, "eps": 77.5, "p0": 200.0e5, "pa": 0.0},
     "expect": 1.93903, "tol": 0.001},
    {"id": "04.WE3e", "fn": "Cf",
     "args": {"gamma": 1.1473, "eps": 77.5, "p0": 200.0e5, "pa": 0.0},
     "expect": 2.00813, "tol": 0.001},
    {"id": "04.WE3f", "fn": "Cf",
     "args": {"gamma": 1.1345, "eps": 77.5, "p0": 200.0e5, "pa": 0.0},
     "expect": 2.02781, "tol": 0.001},

    # --- WE4: constant-gamma expansion ratio for a target exit pressure -----
    {"id": "04.WE4a", "fn": "optimum_eps_for_pa",
     "args": {"gamma": 1.1473, "p0": 117.0e5, "pa": 0.405e5},
     "expect": 31.387, "tol": 0.001},
    # Vulcain 2's actual eps = 58.2 gives, on the same constant-gamma model,
    # an exit pressure of 0.190 bar (equilibrium table: 0.1545 bar).
    {"id": "04.WE4b", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.1473, "eps": 58.2},
     "expect": 4.17015, "tol": 0.001},
]


if __name__ == "__main__":
    import os
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    import rocket

    fails = 0
    for ex in EXAMPLES:
        got = getattr(rocket, ex["fn"])(**ex["args"])
        rel = abs(got - ex["expect"]) / abs(ex["expect"])
        ok = rel <= ex["tol"]
        fails += 0 if ok else 1
        print(f"{'ok  ' if ok else 'FAIL'} {ex['id']:<10} {ex['fn']:<20} "
              f"got {got:.5f}  expect {ex['expect']:.5f}  rel {rel:.2e}")
    print("all ok" if not fails else f"{fails} failure(s)")
    sys.exit(1 if fails else 0)
