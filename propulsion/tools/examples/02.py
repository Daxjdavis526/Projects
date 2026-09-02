"""
Module 02 — Compressible Flow and Nozzles.

Every entry below reproduces a number printed in
`part1-foundations/02-compressible-flow.md`. `fn` names a function in
`tools/rocket.py`; `args` are its keyword arguments; `expect` is the value
quoted in the text; `tol` is a *relative* tolerance.

Gas models used (both [A], see module 04 for where they come from):
  WE1  gamma = 1.2, molar mass 22 kg/kmol  -> R = 377.93 J/(kg K), T0 = 3600 K
       (F-1-scale LOX/RP-1 gas-generator engine, p0 = 7.0 MPa, At = 0.618 m^2)
  WE2-4 gamma = 1.2, molar mass 13.5 kg/kmol -> R = 615.89 J/(kg K), T0 = 3600 K
       (RS-25 at 109% RPL, p0 = 20.64 MPa, eps = 77.5)

Caveat carried from reference/_verify-liquid.md: the RS-25 expansion ratio is
contested (69:1 geometric per L3Harris, 77.5:1 in NASA/Rocketdyne training
material and most aerodynamic analyses, 78:1 elsewhere). These examples use
77.5 as specified in the module text, which works the 69:1 case alongside.
"""

EXAMPLES = [
    # ---- WE 5.1: isentropic station table, gamma = 1.2, eps = 16 -----------
    {"id": "02.WE1.R", "fn": "R_specific",
     "args": {"M": 22.0}, "expect": 377.93, "tol": 1e-4},
    {"id": "02.WE1.a0", "fn": "a_sound",
     "args": {"gamma": 1.2, "R": 377.93, "T": 3600.0},
     "expect": 1277.75, "tol": 1e-4},
    {"id": "02.WE1.mdot", "fn": "choked_mdot",
     "args": {"gamma": 1.2, "R": 377.93, "T0": 3600.0, "p0": 7.0e6,
              "At": 0.618},
     "expect": 2405.25, "tol": 1e-4},
    {"id": "02.WE1.throat_p_ratio", "fn": "p0_over_p",
     "args": {"gamma": 1.2, "Mach": 1.0}, "expect": 1.771556, "tol": 1e-5},
    {"id": "02.WE1.throat_T_ratio", "fn": "T0_over_T",
     "args": {"gamma": 1.2, "Mach": 1.0}, "expect": 1.1, "tol": 1e-9},
    {"id": "02.WE1.M_conv_3", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.2, "eps": 3.0, "supersonic": False},
     "expect": 0.20177, "tol": 1e-3},
    {"id": "02.WE1.M_div_2", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.2, "eps": 2.0, "supersonic": True},
     "expect": 2.05513, "tol": 1e-4},
    {"id": "02.WE1.M_div_8", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.2, "eps": 8.0, "supersonic": True},
     "expect": 3.12193, "tol": 1e-4},
    {"id": "02.WE1.Me", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.2, "eps": 16.0, "supersonic": True},
     "expect": 3.604355, "tol": 1e-5},
    {"id": "02.WE1.p0_over_pe", "fn": "p0_over_p",
     "args": {"gamma": 1.2, "Mach": 3.604355}, "expect": 147.7031, "tol": 1e-5},

    # ---- WE 5.2: eps = 77.5, p0 = 20.64 MPa -------------------------------
    {"id": "02.WE2.Me", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.2, "eps": 77.5, "supersonic": True},
     "expect": 4.706631, "tol": 1e-5},
    {"id": "02.WE2.p0_over_pe", "fn": "p0_over_p",
     "args": {"gamma": 1.2, "Mach": 4.706631}, "expect": 1104.786, "tol": 1e-5},
    # eps = 69 variant, quoted in section 6.1 with the contested-ratio caveat
    {"id": "02.WE2.Me_eps69", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.2, "eps": 69.0, "supersonic": True},
     "expect": 4.623723, "tol": 1e-5},
    {"id": "02.WE2.p0_over_pe_eps69", "fn": "p0_over_p",
     "args": {"gamma": 1.2, "Mach": 4.623723}, "expect": 954.5951, "tol": 1e-5},

    # ---- WE 5.3: separation at sea level ----------------------------------
    # The separation station is the root of
    #   p0 / p0_over_p(gamma, M) = schmucker_separation(pa, M),
    # solved by bisection in the module text; M_sep = 4.476185 is that root and
    # the two entries below check both sides of the equality at that root.
    {"id": "02.WE3.p_sep_schmucker", "fn": "schmucker_separation",
     "args": {"pa": 101325.0, "Me": 4.476185}, "expect": 28108.4, "tol": 1e-4},
    {"id": "02.WE3.eps_sep_schmucker", "fn": "area_ratio",
     "args": {"gamma": 1.2, "Mach": 4.476185}, "expect": 56.0379, "tol": 1e-4},
    # Summerfield: the library takes the reference pressure as its first
    # argument; here that reference is ambient, p_sep = 0.4 * p_a.
    {"id": "02.WE3.p_sep_summerfield", "fn": "summerfield_separation_pressure",
     "args": {"p0": 101325.0, "frac": 0.4}, "expect": 40530.0, "tol": 1e-9},
    {"id": "02.WE3.eps_sep_summerfield", "fn": "area_ratio",
     "args": {"gamma": 1.2, "Mach": 4.273045}, "expect": 41.9718, "tol": 1e-4},

    # ---- WE 5.4: normal shocks --------------------------------------------
    {"id": "02.WE4.p2_p1_at_Me", "fn": "normal_shock_p2_p1",
     "args": {"gamma": 1.2, "M1": 4.706631}, "expect": 24.07532, "tol": 1e-5},
    {"id": "02.WE4.M2_at_Me", "fn": "normal_shock_M2",
     "args": {"gamma": 1.2, "M1": 4.706631}, "expect": 0.348437, "tol": 1e-5},
    # shock standing at A/At = 5.2147 in the eps = 16 nozzle (pb = 2.0 MPa)
    {"id": "02.WE4.M1_at_shock", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.2, "eps": 5.2147, "supersonic": True},
     "expect": 2.815747, "tol": 1e-5},
    {"id": "02.WE4.M2_at_shock", "fn": "normal_shock_M2",
     "args": {"gamma": 1.2, "M1": 2.815747}, "expect": 0.436397, "tol": 1e-5},
    {"id": "02.WE4.p2_p1_at_shock", "fn": "normal_shock_p2_p1",
     "args": {"gamma": 1.2, "M1": 2.815747}, "expect": 8.558289, "tol": 1e-5},

    # ---- Section 3.16: altitude effect on Cf (used in the engine table) ----
    {"id": "02.S316.Cf_vac_RS25", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 77.5, "p0": 20.64e6, "pa": 0.0},
     "expect": 1.934919, "tol": 1e-5},
    {"id": "02.S316.Cf_SL_RS25", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 77.5, "p0": 20.64e6, "pa": 101325.0},
     "expect": 1.554459, "tol": 1e-5},
    {"id": "02.S316.Cf_vac_F1", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 16.0, "p0": 7.0e6, "pa": 0.0},
     "expect": 1.797080, "tol": 1e-5},
    {"id": "02.S316.Cf_SL_F1", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 16.0, "p0": 7.0e6, "pa": 101325.0},
     "expect": 1.565480, "tol": 1e-5},
    {"id": "02.S316.Cf_SL_Merlin", "fn": "Cf",
     "args": {"gamma": 1.2, "eps": 16.0, "p0": 9.7e6, "pa": 101325.0},
     "expect": 1.629946, "tol": 1e-5},
]

# ---------------------------------------------------------------------------
# Numbers in the module that do NOT map onto a single library call, and how
# they are obtained:
#
#  * WE 5.2 step 3, ideal-expansion altitude 12.2 km. Inverts the 1976 US
#    Standard Atmosphere in the isothermal stratosphere:
#        h = 11000 + (R_air T / g0) ln(p11 / pe),
#    R_air = 287.053 J/(kg K), T = 216.65 K, p11 = 22632.06 Pa, pe = 18682 Pa.
#
#  * WE 5.3, the separation station itself. Root of
#        p0 / p0_over_p(gamma, M)  -  schmucker_separation(pa, M) = 0
#    by bisection on 1.2 <= M <= Me. rocket.py has no solver for this; the two
#    sides of the equality at the root are checked above instead.
#
#  * WE 5.4 part B, shock location for a given back pressure. Requires the
#    A* jump across the shock:
#        p02/p01 = (p2/p1) * p0_over_p(g, M2) / p0_over_p(g, M1),
#        Ae/A*_2 = eps * p02/p01,   M_exit = mach_from_area_ratio(g, Ae/A*_2,
#                                            supersonic=False),
#        p_exit  = p0 * (p02/p01) / p0_over_p(g, M_exit).
#    Iterated on the shock station until p_exit = pb. Component calls are
#    registered above; the loop is not.
#
#  * Section 3.10 entropy table. ds = cp ln(T2/T1) - R ln(p2/p1) with
#    T2/T1 = (p2/p1)/(rho2/rho1) and
#    rho2/rho1 = (g+1) M1^2 / ((g-1) M1^2 + 2). rocket.py has no
#    normal_shock_rho or entropy helper.
#
#  * Sections 3.11-3.13, oblique shock and Prandtl-Meyer (beta = 28.5 deg,
#    theta = 20.2 deg, nu(4.7066) = 102.0 deg, cell length 14 m). Not in
#    rocket.py; the theta-beta-M and Prandtl-Meyer relations are Eq. 3.18 and
#    Eq. 3.19 in the module text.
# ---------------------------------------------------------------------------
