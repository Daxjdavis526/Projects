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
