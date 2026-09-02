"""Registered arithmetic for the Part IV exam (cold-gas thrusters).

Every entry below is a step that appears verbatim in
``exams/exam-part4.md`` or ``exams/exam-part4-key.md`` and that maps onto a
function in ``tools/rocket.py``. Steps that have no library function are
described in the comments here so that a reader can still reproduce them by
hand. ``tol`` is a *relative* tolerance. Run with ``tools/check_examples.py``.

Constants
---------
    g0  = 9.80665 m/s^2 ; Ru = 8314.46 J/(kmol K)
    N2      : M =  28.014 -> R =  296.7966 J/(kg K), gamma = 1.400,
              Gamma = 0.6847315
    He      : M =   4.003 -> R = 2076.8074 J/(kg K)
    Kr      : M =  83.798 -> R =   99.2202 J/(kg K), gamma = 1.667
    Xe      : M = 131.29  -> R =   63.3212 J/(kg K), gamma = 1.667
    R-236fa : M = 152.04  -> R =   54.6860 J/(kg K), gamma = 1.08

Arithmetic in the exam that does NOT map to a rocket.py function
----------------------------------------------------------------

  * Standard density for leak-rate work, rho_std = p_std M / (Ru T_std) at
    273.15 K and 101325 Pa:
        N2      : 1.24985 kg/m^3  = 1.24985e-6 kg per std cm^3
        He      : 0.178594 kg/m^3 = 1.78594e-7 kg per std cm^3
        R-236fa : 6.78327 kg/m^3  = 6.78327e-6 kg per std cm^3
    Molecular-flow (Knudsen) conversion factors, sqrt(M_service/M_He):
        N2 -> He      : sqrt(28.014/4.003)  = 2.64542
        R-236fa -> He : sqrt(152.04/4.003)  = 6.16291

  * A2 (gas screening at 293.15 K, 0.90 L of propellant volume).
    Stored density of GN2 at 15 bar: rho = p/(ZRT) = 15e5/(296.7966*293.15)
        = 17.2402 kg/m^3.
    Impulse density Lambda = rho * Isp * g0, and I_t = Lambda * 9.00e-4 m^3:
        GN2 @15 bar, 69 s : Lambda = 1.1666e4 N s/m^3 (0.01167 N s/cm^3) ->  10.5 N s
        n-butane, 570, 65 s: Lambda = 3.6334e5 (0.36334)                 -> 327.0 N s
        R-236fa, 1360, 40 s: Lambda = 5.3348e5 (0.53348)                 -> 480.1 N s
        SF6,     1400, 38 s: Lambda = 5.2171e5 (0.52171)                 -> 469.5 N s
    A1.2 impulse densities at the table's ideal Isp (eps = 50, 300 K):
        Xe      : 2740 * 31.091 * g0 = 8.3554e5 N s/m^3 = 0.8355 N s/cm^3
        R-236fa : 1360 * 43.245 * g0 = 5.7682e5          = 0.5769
        ratio 1.448 in xenon's favour.

  * B1 is a derivation. The only registered piece is the identity
    tau = V/(Gamma At sqrt(R Ti)) = m_i / mdot_i, which is checked below for
    the B2 numbers (tau = 60.846 s).

  * B2 (iv), adiabatic blowdown. Not in the library:
        T_f = T_i (p_f/p_i)^((g-1)/g) = 290 * 0.2^0.2857 = 183.10 K
        t_f = (2 tau/(g-1)) [ (p_f/p_i)^(-(g-1)/(2g)) - 1 ]
            = 304.23 * 0.25850 = 78.64 s
        I_tot = CF c* m_i (2/(g+1)) [1 - (m_f/m_i)^((g+1)/2)]
              = 1.72103 * 428.458 * 0.0209130 * 0.833333 * (1 - 0.25553)
              = 9.6163 N s, against 12.3368 N s isothermal -> 22.05 % loss.
        m_f = 6.6245 g, m_used = 14.2885 g, mean Isp = 68.63 s,
        cutoff Isp = 75.193 * sqrt(183.10/290) = 59.75 s.

  * B3 (ii)/(iii), low-Reynolds-number corrections. Not in the library:
        T* = 2 T0/(g+1) = 241.667 K
        mu* = 1.76e-5 (T*/293)^0.7 = 1.53800e-5 Pa s
        Re_t = 4 mdot/(pi Dt mu*)
        eps = 40: Dt = 135.997 um, mdot = 1.35613e-5 kg/s, Re_t = 8255.2,
                  b = 10 sqrt(40/50) = 8.9443, eta_visc = 0.90156,
                  lambda = 0.98296, eta_I = 0.88620, Isp = 66.64 s
        eps = 20: Dt = 137.243 um, mdot = 1.38109e-5 kg/s, Re_t = 8330.8,
                  b = 6.3246, eta_visc = 0.93071, eta_I = 0.91485,
                  Isp = 67.55 s   -> the short nozzle wins by 0.91 s.

  * C1 leak budget. 0.025 * 0.950 kg over 6.0 * 365.25 d = 1.89346e8 s
    gives mdot = 1.25432e-10 kg/s = 1.00358e-4 scc/s GN2 = 0.36129 scc/h.
    Allocation 55/15/20/10 over 8 seats, 2 seats, 14 joints:
        thruster seat : 6.8996e-6 scc/s GN2 -> 1.8252e-5 scc/s GHe
        other seat    : 7.5268e-6           -> 1.9912e-5
        joint         : 1.4337e-6           -> 3.7927e-6
    A 1e-3 scc/s GHe hard seat is 3.78e-4 scc/s GN2, i.e. 3.8x the whole
    system allowance from one seat.

  * C2 regulator. SPE = (d_s/D_diaphragm)^2 = (1.0/22)^2 = 2.0661e-3;
    setpoint shift over a 215 bar inlet change = 0.44421 bar = 7.404 % of
    6.0 bar. Droop scales as 1/p_in: 0.9 % * (250/35) = 6.43 %.

  * C3 solenoid. Not in the library:
        A_p = pi/4 (5.5e-3)^2 = 2.37583e-5 m^2
        F_mag = mu0 N^2 I^2 A_p/(2 g^2)
              = (4pi e-7)(1000^2)(0.40^2)(2.37583e-5)/(2*(2.8e-4)^2)
              = 30.465 N
        A_seat = pi/4 (1.0e-3)^2 = 7.85398e-7 m^2
        F_p(6 bar) = 0.4712 N ; F_p(250 bar) = 19.635 N (64.5 % of F_mag)
        I_final = 28/50 = 0.560 A ; tau = L/R = 0.720 ms
        t_elec = tau ln(1/(1 - 0.40/0.56)) = 0.9020 ms
        I_hold = 0.40 (0.05/0.28) = 0.0714 A
        P_pullin = 0.56^2 * 50 = 15.68 W ; P_hold(0.10 A) = 0.50 W

  * C4 (iii) uncertainty. dAt/At = 2 (7/220) = 6.3636 %; RSS with 2.0 % and
    2.5 % gives 7.1236 %; the throat carries 79.80 % of the variance.
    (rocket.rss takes *args and so cannot be registered by the checker,
    which calls functions with keyword arguments only.)

  * D1 telemetry. Consumption: dp = 32.3 bar over V = 2.00 L at Z = 1.10,
    293.15 K -> 0.067498 kg in 1800 thruster-seconds -> 3.74989e-5 kg/s,
    against a specification 0.025/(68 g0) = 3.74896e-5 kg/s (0.03 % apart).
    Creep: dp = 1.40 bar into 40 cm^3 at 293.15 K, Z = 1 -> 6.43634e-5 kg
    over 5.184e5 s -> 1.24158e-10 kg/s = 9.9339e-5 scc/s GN2
    = 0.35762 scc/h -> 2.6279e-4 scc/s GHe, i.e. 2.63x the 1e-4 spec.
    Relief lift: 1.40 bar/6.0 d = 0.23333 bar/day; (8.0 - 6.40)/0.23333
    = 6.86 days.

  * D2 sizing (AURA-6). Ideal Isp at eps = 30, 293.15 K is 41.321 s, so the
    0.90 rule gives 37.189 s.
        at 40.00 s : m_p = 0.61183 kg, V = 449.9 cm^3, tank(90 %) = 499.9 cm^3
        at 37.19 s : m_p = 0.65813 kg, V = 483.9 cm^3, tank(90 %) = 537.6 cm^3
    Tank sphere at 537.6 cm^3: r = 50.44 mm (D = 100.9 mm), A = 0.031966 m^2,
    stress-limited t = 1.5*2.7e5*0.05044/(2*310e6) = 33.0 um, mass at a
    1.0 mm minimum gauge in 6061 = 0.031966 * 1.0e-3 * 2700 = 86.3 g.
    Nozzle: D_e = D_t sqrt(30) = 0.24294 * 5.4772 = 1.3306 mm.
    Valve: t_eff,max = 2.00e-4/0.025 = 8.0 ms; N = 240/2.00e-4 = 1.2e6.
    Leak: 0.03 * 0.65813 kg over 9.46728e7 s = 2.08548e-10 kg/s
        = 3.07445e-5 scc/s R-236fa = 0.11068 scc/h -> 1.89476e-4 scc/s GHe.
"""

R_N2 = 8314.46 / 28.014          # 296.7966
R_HE = 8314.46 / 4.003           # 2076.8074
R_KR = 8314.46 / 83.798          # 99.2202
R_XE = 8314.46 / 131.29          # 63.3212
R_236FA = 8314.46 / 152.04       # 54.6860

# B2 / B3 geometry carried between entries
AT_B2 = 4.9087385212340514e-08   # pi/4 (0.250 mm)^2
CF_EPS40 = 1.7210332443740333    # Cf(1.4, 40, vacuum)
CF_EPS20 = 1.689929779627978     # Cf(1.4, 20, vacuum)
AT_B3_40 = 1.45261575171332e-08  # 10.0 mN at 4 bar, eps = 40
AT_B3_20 = 1.4793514086427611e-08
CSTAR_B2 = 428.4579260383604     # N2 at 290 K

EXAMPLES = [
    # ---------------------------------------------------------------
    # Specific gas constants used across the paper
    # ---------------------------------------------------------------
    {"id": "P4.R1", "fn": "R_specific", "args": {"M": 28.014},
     "expect": 296.7966, "tol": 1e-6},
    {"id": "P4.R2", "fn": "R_specific", "args": {"M": 152.04},
     "expect": 54.68600, "tol": 1e-6},
    {"id": "P4.R3", "fn": "R_specific", "args": {"M": 83.798},
     "expect": 99.22020, "tol": 1e-6},

    # ---------------------------------------------------------------
    # A1.1 — krypton ideal vacuum Isp, T0 = 300 K, eps = 50  -> (b) 39 s
    # A1.2 — the two impulse-density inputs (Xe and R-236fa at eps = 50)
    # ---------------------------------------------------------------
    {"id": "P4.A1.1", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": R_KR, "T0": 300.0, "eps": 50.0},
     "expect": 38.917, "tol": 1e-4},
    {"id": "P4.A1.2a", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.667, "R": R_XE, "T0": 300.0, "eps": 50.0},
     "expect": 31.091, "tol": 1e-4},
    {"id": "P4.A1.2b", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.08, "R": R_236FA, "T0": 300.0, "eps": 50.0},
     "expect": 43.2452, "tol": 1e-5},

    # ---------------------------------------------------------------
    # B2 (i)-(iii) — GN2 blowdown, V = 0.600 L, p_i = 30 bar, T_i = 290 K,
    # D_t = 0.250 mm, eps = 40, vacuum, isothermal to 6.00 bar.
    # ---------------------------------------------------------------
    {"id": "P4.B2a", "fn": "gamma_function",
     "args": {"gamma": 1.400}, "expect": 0.6847315, "tol": 1e-6},
    {"id": "P4.B2b", "fn": "c_star",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 290.0},
     "expect": 428.4579, "tol": 1e-6},
    {"id": "P4.B2c", "fn": "Cf",
     "args": {"gamma": 1.400, "eps": 40.0, "p0": 3.0e6, "pa": 0.0},
     "expect": 1.7210332, "tol": 1e-6},
    {"id": "P4.B2d", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 290.0, "eps": 40.0},
     "expect": 75.1929, "tol": 1e-5},
    # m_i = p V/(Z R T) with Z = 1 at 30 bar -> 20.913 g
    {"id": "P4.B2e", "fn": "stored_gas_mass",
     "args": {"p": 3.0e6, "V": 6.0e-4, "R": R_N2, "T": 290.0, "Z": 1.0},
     "expect": 0.0209130, "tol": 1e-5},
    {"id": "P4.B2f", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 290.0, "p0": 3.0e6,
              "At": AT_B2},
     "expect": 3.437027e-4, "tol": 1e-5},
    # F_i = CF p_i At = 0.25344 N (a one-line product, registered via
    # throat_area_from_thrust run backwards as a consistency check)
    {"id": "P4.B2g", "fn": "throat_area_from_thrust",
     "args": {"F": 0.2534431, "p0": 3.0e6, "Cf_val": CF_EPS40},
     "expect": AT_B2, "tol": 1e-6},
    {"id": "P4.B2h", "fn": "usable_fraction",
     "args": {"p_i": 3.0e6, "p_f": 6.0e5, "isothermal": True},
     "expect": 0.800, "tol": 1e-9},
    # ---------------------------------------------------------------
    # B2 (iv) — adiabatic bound. phi_adiab = 1 - (p_f/p_i)^(1/gamma).
    # ---------------------------------------------------------------
    {"id": "P4.B2i", "fn": "usable_fraction",
     "args": {"p_i": 3.0e6, "p_f": 6.0e5, "isothermal": False,
              "gamma": 1.400},
     "expect": 0.6832361, "tol": 1e-6},

    # ---------------------------------------------------------------
    # B3 — regulated 10.0 mN thruster, p_0 = 4.00 bar, T_0 = 290 K.
    # eps = 40 first, then the eps = 20 comparison.
    # ---------------------------------------------------------------
    {"id": "P4.B3a", "fn": "Cf",
     "args": {"gamma": 1.400, "eps": 40.0, "p0": 4.0e5, "pa": 0.0},
     "expect": 1.7210332, "tol": 1e-6},
    {"id": "P4.B3b", "fn": "throat_area_from_thrust",
     "args": {"F": 1.0e-2, "p0": 4.0e5, "Cf_val": CF_EPS40},
     "expect": 1.452616e-8, "tol": 1e-6},
    {"id": "P4.B3c", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 290.0, "p0": 4.0e5,
              "At": AT_B3_40},
     "expect": 1.356134e-5, "tol": 1e-5},
    {"id": "P4.B3d", "fn": "Cf",
     "args": {"gamma": 1.400, "eps": 20.0, "p0": 4.0e5, "pa": 0.0},
     "expect": 1.6899298, "tol": 1e-6},
    {"id": "P4.B3e", "fn": "throat_area_from_thrust",
     "args": {"F": 1.0e-2, "p0": 4.0e5, "Cf_val": CF_EPS20},
     "expect": 1.479351e-8, "tol": 1e-6},
    {"id": "P4.B3f", "fn": "choked_mdot",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 290.0, "p0": 4.0e5,
              "At": AT_B3_20},
     "expect": 1.381094e-5, "tol": 1e-5},
    {"id": "P4.B3g", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.400, "R": R_N2, "T0": 290.0, "eps": 20.0},
     "expect": 73.8340, "tol": 1e-5},

    # ---------------------------------------------------------------
    # C4 — impulse bit from the trapezoidal model. rocket.impulse_bit's
    # t_on argument is the *effective* on-time t_cmd - t_op + t_cl.
    #   12.0 ms command -> t_eff = 10.7 ms -> 0.385 mN s
    #    4.0 ms command -> t_eff =  2.7 ms -> 0.105 mN s
    # ---------------------------------------------------------------
    {"id": "P4.C4a", "fn": "impulse_bit",
     "args": {"F": 0.0350, "t_on": 10.7e-3, "t_rise": 1.0e-3,
              "t_fall": 1.6e-3},
     "expect": 3.850e-4, "tol": 1e-9},
    {"id": "P4.C4b", "fn": "impulse_bit",
     "args": {"F": 0.0350, "t_on": 2.7e-3, "t_rise": 1.0e-3,
              "t_fall": 1.6e-3},
     "expect": 1.050e-4, "tol": 1e-9},

    # ---------------------------------------------------------------
    # D1 — telemetry. Tank consumption over the campaign, Z = 1.10;
    # and the mass accumulated in the 40 cm^3 plenum by regulator creep.
    # ---------------------------------------------------------------
    {"id": "P4.D1a", "fn": "stored_gas_mass",
     "args": {"p": 3.23e6, "V": 2.00e-3, "R": R_N2, "T": 293.15, "Z": 1.10},
     "expect": 0.0674980, "tol": 1e-5},
    {"id": "P4.D1b", "fn": "stored_gas_mass",
     "args": {"p": 1.40e5, "V": 40.0e-6, "R": R_N2, "T": 293.15, "Z": 1.0},
     "expect": 6.436343e-5, "tol": 1e-5},

    # ---------------------------------------------------------------
    # D2 — AURA-6 sizing. R-236fa at 2.7 bar, eps = 30, T0 = 293.15 K.
    # ---------------------------------------------------------------
    {"id": "P4.D2a", "fn": "ideal_isp_vac",
     "args": {"gamma": 1.08, "R": R_236FA, "T0": 293.15, "eps": 30.0},
     "expect": 41.3213, "tol": 1e-5},
    {"id": "P4.D2b", "fn": "Cf",
     "args": {"gamma": 1.08, "eps": 30.0, "p0": 2.70e5, "pa": 0.0},
     "expect": 1.9975168, "tol": 1e-6},
    {"id": "P4.D2c", "fn": "throat_area_from_thrust",
     "args": {"F": 0.0250, "p0": 2.70e5, "Cf_val": 1.9975167859795884},
     "expect": 4.635385e-8, "tol": 1e-6},
    {"id": "P4.D2d", "fn": "choked_mdot",
     "args": {"gamma": 1.08, "R": R_236FA, "T0": 293.15, "p0": 2.70e5,
              "At": 4.6353849560861093e-08},
     "expect": 6.169429e-5, "tol": 1e-5},
    # propellant mass for 240 N s, at the flight value and at 0.90 x ideal
    {"id": "P4.D2e", "fn": "propellant_for_dv",
     "args": {"isp": 40.0, "m_final": 8.888170, "dv": 26.11338},
     "expect": 0.611830, "tol": 1e-4},
    {"id": "P4.D2f", "fn": "tsiolkovsky_dv",
     "args": {"isp": 37.18920, "m0": 9.5, "mf": 8.841871},
     "expect": 26.1831, "tol": 1e-4},
]
