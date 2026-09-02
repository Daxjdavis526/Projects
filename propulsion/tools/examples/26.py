"""Worked-example inputs and expected outputs for Module 26 —
Historical large solid motors.

Each entry names a function in ``tools/rocket.py``, its arguments, and the
value printed in the module text.  ``tol`` is relative.

Not every worked example maps to a library call:

* **26.WE2** (reconstructing RSRM average thrust) is pure arithmetic on the
  definitions ``I_t = m_p * I_sp * g0`` and ``F_avg = I_t / t_b``.  There is no
  library function for it and there should not be; the pedagogical content is
  the *basis tagging* (sea level vs vacuum, action time vs web time,
  per-motor vs per-vehicle), not the arithmetic.  For the record, with
  m_p = 500,000 kg, t_a = 123 s:
      I_t(SL,  242 s) = 1.1866e9 N.s  ->  F_avg = 9.647 MN
      I_t(vac, 268 s) = 1.3141e9 N.s  ->  F_avg = 10.684 MN
  against a published F_max of 14.7 MN /motor max SL, giving
  F_avg/F_max = 0.656 (SL) to 0.727 (vac).

* The propellant-mass-fraction figures quoted throughout the module are
  ``m_p / m_gross`` on masses taken from
  ``reference/_verify-solid-coldgas.md``; they carry that file's confidence
  labels.  Representative values, for regression:
      RSRM      500000 / 590000 = 0.8475
      P120C     141400 / 153000 = 0.9242
      Zefiro 40  36239 /  40477 = 0.8953
      GEM-63XL   47853 /  53030 = 0.9024
      PSLV S139 138200 / 168400 = 0.8207
      Star 48B    2010 /   2137 = 0.9406   (inert 128 kg, see module 3.9)
"""

EXAMPLES = [
    # --- WE1: what a case material is worth, in Delta v -------------------
    # Generic booster: m_p = 100,000 kg, I_sp = 275 s, upper stack 50,000 kg.
    # Steel case, zeta = 0.85 -> m_i = 17,647.06 kg
    {"id": "26.WE1a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 275.0, "m0": 167647.0588, "mf": 67647.0588},
     "expect": 2447.53, "tol": 0.001},
    # Composite case, zeta = 0.92 -> m_i = 8,695.65 kg
    {"id": "26.WE1b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 275.0, "m0": 158695.6522, "mf": 58695.6522},
     "expect": 2682.33, "tol": 0.001},
    # WE1 step 4, equal gross mass 200,000 kg instead of equal propellant
    {"id": "26.WE1c", "fn": "tsiolkovsky_dv",
     "args": {"isp": 275.0, "m0": 250000.0, "mf": 80000.0},
     "expect": 3072.9, "tol": 0.001},
    {"id": "26.WE1d", "fn": "tsiolkovsky_dv",
     "args": {"isp": 275.0, "m0": 250000.0, "mf": 66000.0},
     "expect": 3591.7, "tol": 0.001},

    # --- WE3: Star 48B short vs long nozzle -------------------------------
    # Delta v delivered to a 1000 kg payload, m_p = 2010 kg, m_i = 128 kg.
    # (The module solves the inverse problem at fixed Delta v = 2430 m/s;
    #  these forward cases pin the same mass model.)
    {"id": "26.WE3a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 286.2, "m0": 3138.0, "mf": 1128.0},
     "expect": 2871.61, "tol": 0.001},
    {"id": "26.WE3b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 292.2, "m0": 3138.0, "mf": 1128.0},
     "expect": 2931.81, "tol": 0.001},
    # WE3 sanity check: ideal vacuum thrust coefficient at gamma = 1.18 for
    # the short (47.7) and long (70.4) nozzle area ratios.  pe/p0 is the
    # isentropic exit pressure ratio at that area ratio; pa = 0 (vacuum).
    {"id": "26.WE3c", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.18, "eps": 47.7},
     "expect": 4.2419, "tol": 0.001},
    {"id": "26.WE3d", "fn": "mach_from_area_ratio",
     "args": {"gamma": 1.18, "eps": 70.4},
     "expect": 4.4980, "tol": 0.001},
    {"id": "26.WE3e", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 47.7, "p0": 1.0, "pa": 0.0,
              "pe": 0.0018121},
     "expect": 1.9218, "tol": 0.002},
    {"id": "26.WE3f", "fn": "Cf",
     "args": {"gamma": 1.18, "eps": 70.4, "p0": 1.0, "pa": 0.0,
              "pe": 0.0011240},
     "expect": 1.9538, "tol": 0.002},

    # --- Problem set regression (key K1/K2) -------------------------------
    {"id": "26.P2a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 272.0, "m0": 109767.4419, "mf": 49767.4419},
     "expect": 2109.93, "tol": 0.001},
    {"id": "26.P2b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 272.0, "m0": 104516.1290, "mf": 44516.1290},
     "expect": 2276.61, "tol": 0.001},
    {"id": "26.P5a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 286.2, "m0": 3038.0, "mf": 1028.0},
     "expect": 3041.26, "tol": 0.001},
    {"id": "26.P5b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 292.2, "m0": 3038.0, "mf": 1028.0},
     "expect": 3105.01, "tol": 0.001},
    {"id": "26.Q4a", "fn": "tsiolkovsky_dv",
     "args": {"isp": 276.0, "m0": 139117.6471, "mf": 59117.6471},
     "expect": 2316.31, "tol": 0.001},
    {"id": "26.Q4b", "fn": "tsiolkovsky_dv",
     "args": {"isp": 276.0, "m0": 131956.5217, "mf": 51956.5217},
     "expect": 2522.76, "tol": 0.001},
    # T1 trade study, m_p = 148,863.7 kg, I_sp = 274 s, stack 55,000 kg
    {"id": "26.T1A", "fn": "tsiolkovsky_dv",
     "args": {"isp": 274.0, "m0": 230133.9, "mf": 81270.2},
     "expect": 2796.9, "tol": 0.001},
    {"id": "26.T1C", "fn": "tsiolkovsky_dv",
     "args": {"isp": 274.0, "m0": 216808.4, "mf": 67944.7},
     "expect": 3117.8, "tol": 0.001},
]
