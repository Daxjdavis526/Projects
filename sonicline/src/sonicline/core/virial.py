"""The virial equation of state SONICLINE's OpenFOAM extension implements
(foam/extensions/virialGas), for predicting what a virial CFD run must give
and for its metrics.

Pressure-explicit, truncated after the third coefficient:

    v(p, T) = R T / p + B(T) + D(T) p,    D = (C - B^2) / (R T)

with B and C the density-form virial coefficients (Z = 1 + B rho + C rho^2)
per unit mass, each a quartic in 1/T. OpenFOAM's sensible enthalpy is then
h = cp T + p (B - T B') + p^2/2 (D - T D'), with cp the constant ideal-gas
value; this module computes exactly that.

Nitrogen's coefficients are a least-squares fit to the reference equation
of state (Span et al. 2000, through CoolProp) from 70 K to 500 K: B within
0.5 % relative, C within 3e-7 m^6/kg^2 rms. Against the reference equation
the choked mass flux is right to 0.013 % from 10 to 30 bar (250-300 K) and
0.07 % at 50 bar, where Peng-Robinson is 0.18 % high already at 20 bar
(DESIGN.md section 17). The truncated series holds on the gas side well
below critical density; a nozzle's chamber is the densest point.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from .gas import PerfectGas

# B in m^3/kg, C in m^6/kg^2; coefficient k multiplies T^-k.
NITROGEN_B = (1.448921144644e-03, -3.329714844344e-01, -5.242709766543e+01, 2.581607731369e+03,
              -1.165460634782e+05)
NITROGEN_C = (-3.469003176309e-06, 4.492509933152e-03, -1.383588662532e+00, 1.853993931828e+02,
              -8.484195228322e+03)
FIT_RANGE = (70.0, 500.0)  # K

COEFFICIENTS = {"N2": (NITROGEN_B, NITROGEN_C)}


@dataclass(frozen=True)
class Virial:
    gas: PerfectGas  # supplies R and the ideal-gas cp
    b: tuple = NITROGEN_B
    c: tuple = NITROGEN_C

    def _coeffs(self, T: float) -> tuple[float, float, float, float, float, float]:
        """B, B', B'', D, D', D'' (as the C++ coeffs())."""
        B = B1 = B2 = C = C1 = C2 = 0.0
        Tk = 1.0
        for k in range(5):
            B += self.b[k] * Tk
            B1 -= k * self.b[k] * Tk / T
            B2 += k * (k + 1) * self.b[k] * Tk / (T * T)
            C += self.c[k] * Tk
            C1 -= k * self.c[k] * Tk / T
            C2 += k * (k + 1) * self.c[k] * Tk / (T * T)
            Tk /= T
        RT = self.gas.R * T
        N, N1, N2 = C - B * B, C1 - 2 * B * B1, C2 - 2 * B1 * B1 - 2 * B * B2
        return B, B1, B2, N / RT, N1 / RT - N / (RT * T), N2 / RT - 2 * N1 / (RT * T) + 2 * N / (RT * T * T)

    def Z(self, p: float, T: float) -> float:
        B, _, _, D, _, _ = self._coeffs(T)
        return 1.0 + (B * p + D * p * p) / (self.gas.R * T)

    def density(self, p: float, T: float) -> float:
        B, _, _, D, _, _ = self._coeffs(T)
        return p / (self.gas.R * T + B * p + D * p * p)

    def enthalpy(self, p: float, T: float) -> float:
        """Sensible enthalpy, J/kg, relative to the ideal gas at 0 K (the
        ideal part from the gas: constant cp, or cp(T) for heated gas)."""
        B, B1, _, D, D1, _ = self._coeffs(T)
        return self.gas.enthalpy(T) + p * (B - T * B1) + 0.5 * p * p * (D - T * D1)

    def entropy(self, p: float, T: float) -> float:
        """Specific entropy, J/(kg K), up to a constant."""
        _, B1, _, _, D1, _ = self._coeffs(T)
        return self.gas.ideal_entropy(T) - self.gas.R * math.log(p) - p * B1 - 0.5 * p * p * D1

    def cp(self, p: float, T: float) -> float:
        _, _, B2, _, _, D2 = self._coeffs(T)
        return self.gas.cp_at(T) - T * (p * B2 + 0.5 * p * p * D2)


def for_gas(gas: PerfectGas) -> Virial:
    """The virial gas for this gas's species; its ideal part (constant cp
    or cp(T)) is the gas's own."""
    if gas.name not in COEFFICIENTS:
        raise ValueError(f"no virial coefficients for {gas.name}; the virial gas is fitted for nitrogen only")
    b, c = COEFFICIENTS[gas.name]
    return Virial(gas, b, c)
