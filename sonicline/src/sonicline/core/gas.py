"""Gas property models.

The CFD uses a calorically perfect gas with Sutherland viscosity, because
that is what OpenFOAM is given (hePsiThermo / perfectGas / hConst /
sutherland). The analytical theory uses the *same* model, so a verification
comparison measures numerical error only, not a mismatch in gas constants.

Why constant cp: ideal-gas nitrogen cp varies by less than 0.5 % between
30 K and 400 K (JANAF), and OpenFOAM's JANAF polynomial thermo clamps
temperature to its fitted range [Tlow, Thigh] -- 200 K for the stock N2
entry -- which would silently corrupt a cold-gas expansion.

How far the real gas departs from this model is quantified separately in
:mod:`sonicline.core.realgas`.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

R_UNIVERSAL = 8314.462618  # J/(kmol K), CODATA 2018
G0 = 9.80665  # m/s^2, standard gravity for Isp


@dataclass(frozen=True)
class PerfectGas:
    """Calorically perfect gas with Sutherland viscosity.

    ``sutherland_As`` and ``sutherland_Ts`` are in OpenFOAM's form,
    mu = As T^1.5 / (T + Ts).
    """

    name: str
    molar_mass: float  # kg/kmol
    cp: float  # J/(kg K)
    sutherland_As: float  # Pa s / K^0.5
    sutherland_Ts: float  # K
    coolprop_name: str | None = None  # fluid name for the real-gas reference
    # Optional temperature-dependent cp: cp/R = a0 + a1 T + ... + a4 T^4
    # (NASA/JANAF form), valid over ``janaf_range``. ``cp`` is then the value
    # at the reference state, used by the quasi-1D theory and the checks.
    janaf: tuple[float, float, float, float, float] | None = None
    janaf_range: tuple[float, float] = (100.0, 1100.0)

    @property
    def R(self) -> float:
        """Specific gas constant, J/(kg K)."""
        return R_UNIVERSAL / self.molar_mass

    @property
    def cv(self) -> float:
        return self.cp - self.R

    @property
    def gamma(self) -> float:
        return self.cp / self.cv

    def cp_at(self, T: float) -> float:
        if self.janaf is None:
            return self.cp
        return self.R * sum(a * T**k for k, a in enumerate(self.janaf))

    def enthalpy(self, T: float) -> float:
        """Sensible enthalpy above 0 K, J/kg (cp T for constant cp)."""
        if self.janaf is None:
            return self.cp * T
        return self.R * sum(a * T ** (k + 1) / (k + 1) for k, a in enumerate(self.janaf))

    def temperature_from_enthalpy(self, h: float) -> float:
        if self.janaf is None:
            return h / self.cp
        T = h / self.cp
        for _ in range(50):
            step = (self.enthalpy(T) - h) / self.cp_at(T)
            T -= step
            if abs(step) < 1e-10 * T:
                break
        return T

    def ideal_entropy(self, T: float) -> float:
        """Temperature part of the ideal-gas entropy, J/(kg K): the integral
        of cp/T (s = this - R ln p, up to a constant)."""
        if self.janaf is None:
            return self.cp * math.log(T)
        a = self.janaf
        return self.R * (a[0] * math.log(T) + a[1] * T + a[2] * T**2 / 2 + a[3] * T**3 / 3 + a[4] * T**4 / 4)

    def total_temperature(self, T: float, speed_squared: float) -> float:
        """Stagnation temperature: h(T0) = h(T) + |U|^2 / 2."""
        if self.janaf is None:
            return T + speed_squared / (2.0 * self.cp)
        return self.temperature_from_enthalpy(self.enthalpy(T) + 0.5 * speed_squared)

    def viscosity(self, T: float) -> float:
        """Dynamic viscosity, Pa s."""
        return self.sutherland_As * T**1.5 / (T + self.sutherland_Ts)

    def thermal_conductivity(self, T: float) -> float:
        """W/(m K), by the modified Eucken relation OpenFOAM's ``sutherland``
        transport uses: kappa = mu cv (1.32 + 1.77 R / cv)."""
        return self.viscosity(T) * self.cv * (1.32 + 1.77 * self.R / self.cv)

    def prandtl(self, T: float) -> float:
        return self.cp * self.viscosity(T) / self.thermal_conductivity(T)

    def sound_speed(self, T: float) -> float:
        return math.sqrt(self.gamma * self.R * T)

    def density(self, p: float, T: float) -> float:
        return p / (self.R * T)


# Nitrogen. cp is the JANAF ideal-gas value at 300 K (1039.7 J/(kg K));
# it gives gamma = 1.3995. Sutherland As = 1.401e-6, Ts = 107 K correspond
# to mu_ref = 1.663e-5 Pa s at 273 K with S = 107 K (White); within 0.2 % of
# NIST from 150 K to 400 K, -2.6 % at 90 K. Air's 1.458e-6 / 110.4 is not N2.
NITROGEN = PerfectGas(
    name="N2",
    molar_mass=28.0134,
    cp=1039.7,
    sutherland_As=1.401e-6,
    sutherland_Ts=107.0,
    coolprop_name="Nitrogen",
)


# Air, for validation against air experiments only (SONICLINE is validated
# for nitrogen). Cold air: cp 1004.5 J/(kg K), gamma 1.400; Sutherland
# 1.458e-6 / 110.4 K.
AIR = PerfectGas(
    name="air",
    molar_mass=28.965,
    cp=1004.5,
    sutherland_As=1.458e-6,
    sutherland_Ts=110.4,
    coolprop_name="Air",
)

# Air heated to 1500 R (833 K) by burning methanol in it, as in Back,
# Massier and Gier's JPL nozzle tests (TR 32-654): the report treats the
# products as air with gamma = 1.35, which fixes cp. No reference equation
# of state: real-gas checks are skipped for it.
HEATED_AIR = PerfectGas(
    name="air_heated",
    molar_mass=28.965,
    cp=1.35 / 0.35 * R_UNIVERSAL / 28.965,
    sutherland_As=1.458e-6,
    sutherland_Ts=110.4,
)

# Air with its real (ideal-gas) cp(T), for the same heated-air tests: a fit
# of cp/R to CoolProp's ideal-gas cp of air from 100 K to 1100 K, within
# 0.3 % throughout. gamma falls from 1.40 at 300 K to 1.35 at 833 K, so a
# hot expansion's gamma rises as it cools, which the constant-gamma
# HEATED_AIR cannot follow (DESIGN.md section 16). cp below is the 833 K
# value, the reference for the quasi-1D theory and the checks.
_AIR_JANAF = (3.54529035, -5.838799171e-4, 1.5080222534e-6, -1.6481919814e-10, -3.2699809503e-13)
HOT_AIR = PerfectGas(
    name="air_hot",
    molar_mass=28.965,
    cp=R_UNIVERSAL / 28.965 * sum(a * 833.3**k for k, a in enumerate(_AIR_JANAF)),
    sutherland_As=1.458e-6,
    sutherland_Ts=110.4,
    janaf=_AIR_JANAF,
)

GASES = {g.name: g for g in (NITROGEN, AIR, HEATED_AIR, HOT_AIR)}

# Temperature-dependent ideal-gas cp, for heated gas: cp/R = sum a_k T^k,
# fitted to CoolProp's ideal-gas cp from 100 K to 1100 K (within 0.23 % for
# nitrogen, 0.3 % for air). Nitrogen's cp is constant to 0.14 % up to 350 K
# and rises 3.4 % by 600 K, 7.9 % by 800 K and 12 % by 1000 K, so a cold
# thruster keeps the constant value and a heated one needs this.
JANAF = {
    "N2": (3.5273538815, -2.0738276444e-04, -3.5600099685e-09, 1.6069145544e-09, -9.8644706128e-13),
    "air": _AIR_JANAF,
}
HEATED_T0 = 350.0  # K: above this chamber temperature, "auto" heat capacity is cp(T)


def with_cp_of_temperature(gas: PerfectGas, reference_temperature: float) -> PerfectGas:
    """The gas with its cp(T) polynomial; ``cp`` becomes the value at the
    reference temperature (the chamber's), which the constant-gamma theory
    uses."""
    import dataclasses

    if gas.janaf is not None:
        return gas
    if gas.name not in JANAF:
        raise ValueError(f"no temperature-dependent cp for {gas.name}")
    hot = dataclasses.replace(gas, janaf=JANAF[gas.name])
    return dataclasses.replace(hot, cp=hot.cp_at(reference_temperature))


@dataclass(frozen=True)
class IdealGasCpT:
    """The ideal gas with cp(T), as a model with the real-gas models'
    interface (enthalpy, entropy, density), for its exact isentrope."""

    gas: PerfectGas

    def density(self, p: float, T: float) -> float:
        return p / (self.gas.R * T)

    def enthalpy(self, p: float, T: float) -> float:
        return self.gas.enthalpy(T)

    def entropy(self, p: float, T: float) -> float:
        return self.gas.ideal_entropy(T) - self.gas.R * math.log(p)
