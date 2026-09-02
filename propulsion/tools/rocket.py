"""
rocket.py — the calculation library behind every worked example in the
PROPULSION course. Pure Python 3, no dependencies. SI units throughout.

Every function documents its equation, assumptions, and the module that
derives it. Run `python3 tools/check_examples.py` to recompute the numbers
quoted in the text.

Conventions
-----------
g0     = 9.80665 m/s^2
Ru     = 8314.46 J/(kmol K)
gamma  = ratio of specific heats (dimensionless)
M      = molar mass, kg/kmol
T0, p0 = stagnation (chamber) temperature [K] and pressure [Pa]
"""
from __future__ import annotations
import math

G0 = 9.80665          # m/s^2
RU = 8314.46          # J/(kmol K)


# ---------------------------------------------------------------------------
# Ideal-gas and isentropic relations (Module 01, 02)
# ---------------------------------------------------------------------------
def R_specific(M: float) -> float:
    """Specific gas constant R = Ru / M  [J/(kg K)]."""
    return RU / M


def a_sound(gamma: float, R: float, T: float) -> float:
    """Speed of sound a = sqrt(gamma R T)  [m/s]. Calorically perfect gas."""
    return math.sqrt(gamma * R * T)


def T0_over_T(gamma: float, Mach: float) -> float:
    """Isentropic stagnation temperature ratio T0/T = 1 + (g-1)/2 M^2."""
    return 1.0 + 0.5 * (gamma - 1.0) * Mach ** 2


def p0_over_p(gamma: float, Mach: float) -> float:
    """Isentropic stagnation pressure ratio p0/p = (T0/T)^(g/(g-1))."""
    return T0_over_T(gamma, Mach) ** (gamma / (gamma - 1.0))


def area_ratio(gamma: float, Mach: float) -> float:
    """A/A* as a function of Mach number (isentropic, calorically perfect).

    A/A* = (1/M) [ (2/(g+1)) (1 + (g-1)/2 M^2) ]^((g+1)/(2(g-1)))
    """
    g = gamma
    return (1.0 / Mach) * ((2.0 / (g + 1.0)) * T0_over_T(g, Mach)) ** ((g + 1.0) / (2.0 * (g - 1.0)))


def mach_from_area_ratio(gamma: float, eps: float, supersonic: bool = True) -> float:
    """Invert A/A* for Mach by bisection. supersonic=True gives the M>1 root."""
    if eps < 1.0:
        raise ValueError("area ratio must be >= 1")
    if abs(eps - 1.0) < 1e-12:
        return 1.0
    lo, hi = (1.0, 100.0) if supersonic else (1e-6, 1.0)
    for _ in range(200):
        mid = 0.5 * (lo + hi)
        f = area_ratio(gamma, mid) - eps
        if supersonic:
            if f > 0:
                hi = mid
            else:
                lo = mid
        else:
            if f > 0:
                lo = mid
            else:
                hi = mid
    return 0.5 * (lo + hi)


def mach_from_pressure_ratio(gamma: float, p0_p: float) -> float:
    """Mach from p0/p (isentropic)."""
    g = gamma
    return math.sqrt(2.0 / (g - 1.0) * (p0_p ** ((g - 1.0) / g) - 1.0))


def normal_shock_p2_p1(gamma: float, M1: float) -> float:
    """Static pressure ratio across a normal shock."""
    g = gamma
    return 1.0 + 2.0 * g / (g + 1.0) * (M1 ** 2 - 1.0)


def normal_shock_M2(gamma: float, M1: float) -> float:
    g = gamma
    return math.sqrt((1.0 + 0.5 * (g - 1.0) * M1 ** 2) / (g * M1 ** 2 - 0.5 * (g - 1.0)))


# ---------------------------------------------------------------------------
# Rocket performance (Module 03)
# ---------------------------------------------------------------------------
def gamma_function(gamma: float) -> float:
    """Gamma = sqrt(g) (2/(g+1))^((g+1)/(2(g-1))). Appears in mdot and c*."""
    g = gamma
    return math.sqrt(g) * (2.0 / (g + 1.0)) ** ((g + 1.0) / (2.0 * (g - 1.0)))


def c_star(gamma: float, R: float, T0: float) -> float:
    """Characteristic velocity c* = sqrt(R T0) / Gamma  [m/s].

    Ideal, calorically perfect, choked throat. Real c* = eta_c* * c*_ideal,
    with eta_c* typically 0.92-0.995.
    """
    return math.sqrt(R * T0) / gamma_function(gamma)


def choked_mdot(gamma: float, R: float, T0: float, p0: float, At: float) -> float:
    """Choked mass flow  mdot = Gamma p0 At / sqrt(R T0)  [kg/s]."""
    return gamma_function(gamma) * p0 * At / math.sqrt(R * T0)


def Cf(gamma: float, eps: float, p0: float, pa: float, pe: float | None = None) -> float:
    """Thrust coefficient.

    Cf = sqrt( 2 g^2/(g-1) (2/(g+1))^((g+1)/(g-1)) [1 - (pe/p0)^((g-1)/g)] )
         + (pe - pa)/p0 * eps

    If pe is None it is computed from eps assuming isentropic, attached flow.
    """
    g = gamma
    if pe is None:
        Me = mach_from_area_ratio(g, eps)
        pe = p0 / p0_over_p(g, Me)
    term = 2.0 * g ** 2 / (g - 1.0) * (2.0 / (g + 1.0)) ** ((g + 1.0) / (g - 1.0))
    term *= 1.0 - (pe / p0) ** ((g - 1.0) / g)
    return math.sqrt(term) + (pe - pa) / p0 * eps


def exit_velocity(gamma: float, R: float, T0: float, p0: float, pe: float) -> float:
    """Ideal exit velocity ve = sqrt( 2 g/(g-1) R T0 [1 - (pe/p0)^((g-1)/g)] )."""
    g = gamma
    return math.sqrt(2.0 * g / (g - 1.0) * R * T0 * (1.0 - (pe / p0) ** ((g - 1.0) / g)))


def thrust(mdot: float, ve: float, pe: float, pa: float, Ae: float) -> float:
    """F = mdot ve + (pe - pa) Ae  [N]."""
    return mdot * ve + (pe - pa) * Ae


def isp_from_c(c_eff: float) -> float:
    """Isp = c / g0  [s]."""
    return c_eff / G0


def c_eff(c_star_val: float, Cf_val: float) -> float:
    """Effective exhaust velocity c = c* Cf  [m/s]."""
    return c_star_val * Cf_val


def throat_area_from_thrust(F: float, p0: float, Cf_val: float) -> float:
    """At = F / (p0 Cf)  [m^2]."""
    return F / (p0 * Cf_val)


def optimum_eps_for_pa(gamma: float, p0: float, pa: float) -> float:
    """Expansion ratio that gives pe = pa (ideal expansion)."""
    Me = mach_from_pressure_ratio(gamma, p0 / pa)
    return area_ratio(gamma, Me)


def summerfield_separation_pressure(p0: float, frac: float = 0.4) -> float:
    """[E] Summerfield criterion: flow separates when pe < ~0.4 pa.
    Returns the wall pressure below which separation is expected, given pa."""
    return frac * p0


def schmucker_separation(pa: float, Me: float) -> float:
    """[E] Schmucker (1984): p_sep/pa = (1.88 Me - 1)^-0.64. Returns p_sep."""
    return pa * (1.88 * Me - 1.0) ** (-0.64)


# ---------------------------------------------------------------------------
# Chamber sizing (Module 06)
# ---------------------------------------------------------------------------
def chamber_volume_from_Lstar(Lstar: float, At: float) -> float:
    """Vc = L* At  [m^3]. L* is an empirical residence-time proxy [E]."""
    return Lstar * At


def residence_time(Vc: float, rho_c: float, mdot: float) -> float:
    """t_s = Vc rho_c / mdot  [s]. rho_c = p0/(R T0) for chamber gas."""
    return Vc * rho_c / mdot


# ---------------------------------------------------------------------------
# Injector orifice flow (Module 07)
# ---------------------------------------------------------------------------
def orifice_mdot(Cd: float, A: float, rho: float, dp: float) -> float:
    """Single-phase incompressible orifice: mdot = Cd A sqrt(2 rho dp)."""
    return Cd * A * math.sqrt(2.0 * rho * dp)


def orifice_velocity(Cd: float, rho: float, dp: float) -> float:
    return Cd * math.sqrt(2.0 * dp / rho)


def weber(rho: float, v: float, L: float, sigma: float) -> float:
    """We = rho v^2 L / sigma."""
    return rho * v ** 2 * L / sigma


def reynolds(rho: float, v: float, L: float, mu: float) -> float:
    return rho * v * L / mu


def ohnesorge(mu: float, rho: float, sigma: float, L: float) -> float:
    """Oh = mu / sqrt(rho sigma L) = sqrt(We)/Re."""
    return mu / math.sqrt(rho * sigma * L)


def momentum_ratio(mdot_o: float, v_o: float, mdot_f: float, v_f: float) -> float:
    """Total momentum ratio (ox/fuel) for impinging or pintle elements."""
    return (mdot_o * v_o) / (mdot_f * v_f)


# ---------------------------------------------------------------------------
# Heat transfer (Module 10)
# ---------------------------------------------------------------------------
def bartz_hg(Dt: float, mu0: float, cp0: float, Pr0: float, p0: float,
             c_star_val: float, rc: float, A_ratio: float, sigma: float = 1.0) -> float:
    """[E] Bartz (1957) gas-side heat-transfer coefficient, W/(m^2 K).

    hg = (0.026/Dt^0.2) (mu0^0.2 cp0 / Pr0^0.6) (p0/c*)^0.8 (Dt/rc)^0.1 (At/A)^0.9 sigma

    Dt: throat diameter [m]; mu0, cp0, Pr0 at chamber stagnation conditions;
    p0 [Pa]; c* [m/s]; rc throat radius of curvature [m]; A_ratio = A/At at
    the station; sigma = boundary-layer property correction (bartz_sigma).
    Accuracy: +-20-30% at throat, worse in chamber and far downstream.
    """
    return (0.026 / Dt ** 0.2) * (mu0 ** 0.2 * cp0 / Pr0 ** 0.6) * (p0 / c_star_val) ** 0.8 \
        * (Dt / rc) ** 0.1 * (1.0 / A_ratio) ** 0.9 * sigma


def bartz_sigma(gamma: float, Mach: float, Tw_over_T0: float) -> float:
    """Bartz property-variation factor sigma."""
    g = gamma
    a = 0.5 * Tw_over_T0 * (1.0 + 0.5 * (g - 1.0) * Mach ** 2) + 0.5
    b = 1.0 + 0.5 * (g - 1.0) * Mach ** 2
    return 1.0 / (a ** 0.68 * b ** 0.12)


def adiabatic_wall_T(T0: float, gamma: float, Mach: float, r: float = 0.9) -> float:
    """T_aw = T0 * (1 + r (g-1)/2 M^2) / (1 + (g-1)/2 M^2). r ~ Pr^(1/3) ~ 0.9 turbulent."""
    g = gamma
    return T0 * (1.0 + r * 0.5 * (g - 1.0) * Mach ** 2) / (1.0 + 0.5 * (g - 1.0) * Mach ** 2)


def heat_flux(hg: float, Taw: float, Twg: float) -> float:
    """q = hg (Taw - Twg)  [W/m^2]."""
    return hg * (Taw - Twg)


def wall_dT(q: float, t: float, k: float) -> float:
    """Temperature drop across a wall of thickness t, conductivity k: dT = q t / k."""
    return q * t / k


def dittus_boelter(k: float, D: float, Re: float, Pr: float, n: float = 0.4) -> float:
    """[E] Coolant-side h = 0.023 (k/D) Re^0.8 Pr^n. Turbulent, fully developed,
    single-phase; n=0.4 heating. Fails for supercritical, boiling, curvature."""
    return 0.023 * (k / D) * Re ** 0.8 * Pr ** n


def coolant_bulk_rise(Q: float, mdot: float, cp: float) -> float:
    """dT_bulk = Q / (mdot cp)."""
    return Q / (mdot * cp)


def thermal_stress_hoop(E: float, alpha: float, dT: float, nu: float) -> float:
    """Thermal stress in a constrained wall with through-thickness dT:
    sigma = E alpha dT / (2 (1 - nu)). Elastic only."""
    return E * alpha * dT / (2.0 * (1.0 - nu))


# ---------------------------------------------------------------------------
# Feed systems and pumps (Module 12)
# ---------------------------------------------------------------------------
def pump_head(dp: float, rho: float) -> float:
    """H = dp / (rho g0)  [m]."""
    return dp / (rho * G0)


def pump_power(mdot: float, dp: float, rho: float, eta: float) -> float:
    """P = mdot dp / (rho eta)  [W]."""
    return mdot * dp / (rho * eta)


def npsh_available(p_tank: float, p_vapor: float, rho: float, z: float = 0.0,
                   dp_line: float = 0.0, accel: float = G0) -> float:
    """NPSHa = (p_tank - p_vapor - dp_line)/(rho g0) + z*accel/g0  [m]."""
    return (p_tank - p_vapor - dp_line) / (rho * G0) + z * accel / G0


def specific_speed_SI(omega: float, Q: float, H: float) -> float:
    """Dimensionless-ish specific speed Ns = omega sqrt(Q) / (g0 H)^0.75,
    omega in rad/s, Q in m^3/s, H in m."""
    return omega * math.sqrt(Q) / (G0 * H) ** 0.75


def suction_specific_speed_SI(omega: float, Q: float, NPSH: float) -> float:
    return omega * math.sqrt(Q) / (G0 * NPSH) ** 0.75


def turbine_power(mdot: float, cp: float, T_in: float, pr: float, gamma: float, eta: float) -> float:
    """Turbine shaft power for pressure ratio pr = p_in/p_out:
    P = eta mdot cp T_in [1 - pr^(-(g-1)/g)]."""
    return eta * mdot * cp * T_in * (1.0 - pr ** (-(gamma - 1.0) / gamma))


def blowdown_pressure(p_i: float, V_i: float, V: float, n: float) -> float:
    """Polytropic blowdown of ullage: p = p_i (V_i/V)^n. n=1 isothermal, n=gamma adiabatic."""
    return p_i * (V_i / V) ** n


def pressurant_mass(p_tank: float, V_prop: float, R_g: float, T_g: float) -> float:
    """Ideal-gas pressurant mass to displace V_prop at p_tank and T_g (no heat transfer)."""
    return p_tank * V_prop / (R_g * T_g)


# ---------------------------------------------------------------------------
# Solid motors (Modules 20, 21)
# ---------------------------------------------------------------------------
def vieille_burn_rate(a: float, p: float, n: float) -> float:
    """[E] Saint-Robert / Vieille: r = a p^n. Units follow a."""
    return a * p ** n


def solid_equilibrium_pressure(a: float, n: float, rho_p: float, Ab: float, At: float, c_star_val: float) -> float:
    """Equilibrium chamber pressure: p = (a rho_p c* Kn)^(1/(1-n)), Kn = Ab/At.
    a must be in m/s / Pa^n. Requires n < 1 for stability."""
    Kn = Ab / At
    return (a * rho_p * c_star_val * Kn) ** (1.0 / (1.0 - n))


def temperature_sensitivity_pressure(sigma_p: float, dT: float) -> float:
    """Fractional burn-rate change for initial-temperature change dT: r2/r1 = exp(sigma_p dT)."""
    return math.exp(sigma_p * dT)


def pressure_sensitivity_pi_K(sigma_p: float, n: float) -> float:
    """pi_K = sigma_p / (1 - n): fractional chamber-pressure change per K at constant Kn."""
    return sigma_p / (1.0 - n)


def density_isp(rho: float, isp: float) -> float:
    """Density impulse rho * Isp  [kg s / m^3]."""
    return rho * isp


# ---------------------------------------------------------------------------
# Cold gas (Modules 28, 29)
# ---------------------------------------------------------------------------
def ideal_isp_vac(gamma: float, R: float, T0: float, eps: float) -> float:
    """Vacuum Isp of an ideal cold-gas nozzle at area ratio eps."""
    Me = mach_from_area_ratio(gamma, eps)
    pe_p0 = 1.0 / p0_over_p(gamma, Me)
    p0 = 1.0
    ve = exit_velocity(gamma, R, T0, p0, pe_p0 * p0)
    # thrust = mdot ve + pe Ae ; per unit mdot: c = ve + pe Ae / mdot
    At = 1.0
    mdot = choked_mdot(gamma, R, T0, p0, At)
    c = ve + pe_p0 * p0 * eps * At / mdot
    return c / G0


def stored_gas_mass(p: float, V: float, R: float, T: float, Z: float = 1.0) -> float:
    """m = p V / (Z R T)."""
    return p * V / (Z * R * T)


def usable_fraction(p_i: float, p_f: float, isothermal: bool = True, gamma: float = 1.4) -> float:
    """Usable mass fraction of a blowdown gas tank from p_i to p_f.
    Isothermal: 1 - p_f/p_i. Adiabatic: 1 - (p_f/p_i)^(1/gamma)."""
    if isothermal:
        return 1.0 - p_f / p_i
    return 1.0 - (p_f / p_i) ** (1.0 / gamma)


def impulse_bit(F: float, t_on: float, t_rise: float = 0.0, t_fall: float = 0.0) -> float:
    """Trapezoidal impulse bit: F * (t_on - t_rise/2 + t_fall/2) approx."""
    return F * (t_on - 0.5 * t_rise + 0.5 * t_fall)


def tsiolkovsky_dv(isp: float, m0: float, mf: float) -> float:
    return isp * G0 * math.log(m0 / mf)


def propellant_for_dv(isp: float, m_final: float, dv: float) -> float:
    return m_final * (math.exp(dv / (isp * G0)) - 1.0)


# ---------------------------------------------------------------------------
# Uncertainty (Module 18)
# ---------------------------------------------------------------------------
def rss(*terms: float) -> float:
    """Root-sum-square combination of independent uncertainties."""
    return math.sqrt(sum(t * t for t in terms))


def rel_unc_product(*rel: float) -> float:
    """Relative uncertainty of a product/quotient of independent quantities."""
    return rss(*rel)


def rel_unc_power(rel: float, exponent: float) -> float:
    return abs(exponent) * rel


if __name__ == "__main__":
    # quick smoke test: LOX/LH2 like gas
    g, M, T0, p0 = 1.20, 13.5, 3500.0, 20.0e6
    R = R_specific(M)
    cs = c_star(g, R, T0)
    print(f"c* = {cs:.0f} m/s (expect ~2300-2400)")
    eps = 77.5
    cf = Cf(g, eps, p0, 0.0)
    print(f"Cf_vac(eps=77.5) = {cf:.3f}, Isp_vac ~ {cs*cf/G0:.0f} s")
