"""The Peng-Robinson equation of state exactly as OpenFOAM v2512 implements
it (PengRobinsonGas with hConstThermo), for predicting what a Peng-Robinson
CFD run must give.

OpenFOAM's sensible enthalpy is h = cp (T - Tref) + h_dep(p, T), with cp
the constant ideal-gas value and h_dep the Peng-Robinson departure; its
density is p / (Z R T). An inviscid steady nozzle conserves total enthalpy
and entropy, so integrating that isentrope and maximising the mass flux
rho u gives the choked mass flux the CFD should reproduce, independently of
the CFD. Comparing it with the reference equation of state
(:mod:`sonicline.core.realgas`) then says how good Peng-Robinson itself is.

Constants follow OpenFOAM's source, including its rounded 2.078 = 5.877 /
(2 sqrt 2), 2.414 and 0.414 (1 +- sqrt 2).
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from scipy.optimize import brentq, minimize_scalar

from .gas import R_UNIVERSAL, PerfectGas


@dataclass(frozen=True)
class Critical:
    Tc: float  # K
    Pc: float  # Pa
    Vc: float  # m^3/kmol (OpenFOAM's unit; enters only Zc, which PR does not use)
    omega: float  # acentric factor


# Nitrogen: Span et al. (2000), the reference equation of state CoolProp uses.
NITROGEN_CRITICAL = Critical(Tc=126.192, Pc=3.3958e6, Vc=28.0134 / 313.3, omega=0.0372)


@dataclass(frozen=True)
class PengRobinson:
    gas: PerfectGas  # supplies R and the ideal-gas cp
    crit: Critical = NITROGEN_CRITICAL

    @property
    def kappa(self) -> float:
        w = self.crit.omega
        return 0.37464 + 1.54226 * w - 0.26992 * w * w

    def _AB(self, p: float, T: float) -> tuple[float, float, float]:
        c = self.crit
        Tr = T / c.Tc
        alpha = (1.0 + self.kappa * (1.0 - math.sqrt(Tr))) ** 2
        a = 0.45724 * (R_UNIVERSAL * c.Tc) ** 2 / c.Pc
        b = 0.07780 * R_UNIVERSAL * c.Tc / c.Pc
        return a * alpha * p / (R_UNIVERSAL * T) ** 2, b * p / (R_UNIVERSAL * T), alpha

    def Z(self, p: float, T: float) -> float:
        """Compressibility: the largest real root of the cubic (the gas)."""
        A, B, _ = self._AB(p, T)
        a2, a1, a0 = B - 1.0, A - 2.0 * B - 3.0 * B * B, -A * B + B * B + B**3
        # Newton from the ideal-gas end converges to the largest root for a gas.
        z = 1.0
        for _ in range(100):
            f = ((z + a2) * z + a1) * z + a0
            df = (3.0 * z + 2.0 * a2) * z + a1
            step = f / df
            z -= step
            if abs(step) < 1e-15:
                break
        return z

    def density(self, p: float, T: float) -> float:
        return p / (self.Z(p, T) * self.gas.R * T)

    def _log_term(self, p: float, T: float) -> tuple[float, float, float]:
        _, B, alpha = self._AB(p, T)
        z = self.Z(p, T)
        return z, B, math.log((z + 2.414 * B) / (z - 0.414 * B))

    def enthalpy(self, p: float, T: float) -> float:
        """Sensible enthalpy, J/kg, relative to the ideal gas at 0 K."""
        c = self.crit
        Tr = T / c.Tc
        _, _, alpha = self._AB(p, T)
        z, _, L = self._log_term(p, T)
        dep = self.gas.R * c.Tc * (Tr * (z - 1.0) - 2.078 * (1.0 + self.kappa) * math.sqrt(alpha) * L)
        return self.gas.cp * T + dep

    def entropy(self, p: float, T: float) -> float:
        """Specific entropy, J/(kg K), up to a constant."""
        k = self.kappa
        Tr = T / self.crit.Tc
        z, B, L = self._log_term(p, T)
        dep = self.gas.R * (math.log(z - B) - 2.078 * k * ((1.0 + k) / math.sqrt(Tr) - k) * L)
        return self.gas.cp * math.log(T) - self.gas.R * math.log(p) + dep


@dataclass(frozen=True)
class PRChoking:
    mass_flux: float  # kg/(m^2 s), Peng-Robinson
    ideal_mass_flux: float  # the perfect-gas model at the same p0, T0
    throat_pressure: float
    throat_temperature: float

    @property
    def bias(self) -> float:
        return self.mass_flux / self.ideal_mass_flux - 1.0


def choked_mass_flux(model: PengRobinson, p0: float, T0: float) -> PRChoking:
    from .theory import isentropic as isen

    h0, s0 = model.enthalpy(p0, T0), model.entropy(p0, T0)

    def temperature(p: float) -> float:
        return brentq(lambda T: model.entropy(p, T) - s0, 0.3 * T0, 1.2 * T0, xtol=1e-12)

    def neg_flux(p: float) -> float:
        T = temperature(p)
        return -model.density(p, T) * math.sqrt(max(2.0 * (h0 - model.enthalpy(p, T)), 0.0))

    res = minimize_scalar(neg_flux, bounds=(0.3 * p0, 0.8 * p0), method="bounded",
                          options={"xatol": 1e-8 * p0})
    p_star = float(res.x)
    g = model.gas
    ideal = isen.gamma_function(g.gamma) * p0 / math.sqrt(g.R * T0)
    return PRChoking(-float(res.fun), ideal, p_star, temperature(p_star))
