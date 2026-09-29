"""How far real nitrogen departs from the perfect-gas model, from the
reference equation of state (Span et al. 2000, via CoolProp).

The CFD runs a perfect gas; this module puts a number on what that costs:

- :func:`choked_mass_flux` integrates the isentrope on the real equation of
  state and finds the sonic (maximum-flux) point. Its ratio to the
  perfect-gas value is the mass-flow bias: about +0.3 % at 1 MPa, +1 % at
  3 MPa and +3 % at 10 MPa for nitrogen at 300 K.
- :func:`regulator_outlet_temperature`: throttling from a bottle is
  isenthalpic, and nitrogen cools on the way down (Joule-Thomson). 300 bar
  at 300 K regulated to 20 bar arrives at about 268 K, so the reservoir T0
  is not the bottle temperature.
- :func:`saturation_temperature`: the vapour-liquid line above the triple
  point (63.151 K, 12.52 kPa). Below it the relevant line is sublimation,
  which the reference EOS does not cover; there a Clausius-Clapeyron
  extrapolation with an approximate enthalpy of sublimation is used, and
  :func:`saturation_temperature` says so via ``approximate``.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from scipy.optimize import minimize_scalar

try:
    import CoolProp.CoolProp as _CP
except ImportError:  # pragma: no cover - CoolProp is a declared dependency
    _CP = None

from .gas import R_UNIVERSAL, PerfectGas
from .theory import isentropic as isen


def available() -> bool:
    return _CP is not None


def _fluid(gas: PerfectGas) -> str:
    if _CP is None:
        raise RuntimeError("CoolProp is not installed; real-gas checks are unavailable")
    if not gas.coolprop_name:
        raise ValueError(f"no reference equation of state is configured for {gas.name}")
    return gas.coolprop_name


def compressibility(gas: PerfectGas, p: float, T: float) -> float:
    return _CP.PropsSI("Z", "T", T, "P", p, _fluid(gas))


@dataclass(frozen=True)
class RealGasChoking:
    mass_flux: float  # kg/(m^2 s) at the sonic point, real gas
    ideal_mass_flux: float  # same, perfect-gas model
    throat_pressure: float
    throat_temperature: float

    @property
    def bias(self) -> float:
        """Real / ideal - 1: the fraction by which the perfect-gas model
        under-predicts choked mass flow."""
        return self.mass_flux / self.ideal_mass_flux - 1.0


def choked_mass_flux(gas: PerfectGas, p0: float, T0: float) -> RealGasChoking:
    fluid = _fluid(gas)
    h0 = _CP.PropsSI("H", "T", T0, "P", p0, fluid)
    s0 = _CP.PropsSI("S", "T", T0, "P", p0, fluid)

    def neg_flux(p: float) -> float:
        h = _CP.PropsSI("H", "P", p, "S", s0, fluid)
        rho = _CP.PropsSI("D", "P", p, "S", s0, fluid)
        return -rho * math.sqrt(max(2.0 * (h0 - h), 0.0))

    res = minimize_scalar(neg_flux, bounds=(0.3 * p0, 0.8 * p0), method="bounded",
                          options={"xatol": 1e-7 * p0})
    p_star = float(res.x)
    T_star = _CP.PropsSI("T", "P", p_star, "S", s0, fluid)
    ideal = isen.gamma_function(gas.gamma) * p0 / math.sqrt(gas.R * T0)
    return RealGasChoking(-float(res.fun), ideal, p_star, T_star)


def regulator_outlet_temperature(gas: PerfectGas, p_in: float, T_in: float, p_out: float) -> float:
    """Temperature after isenthalpic throttling from (p_in, T_in) to p_out."""
    fluid = _fluid(gas)
    h = _CP.PropsSI("H", "T", T_in, "P", p_in, fluid)
    return _CP.PropsSI("T", "H", h, "P", p_out, fluid)


# Approximate molar enthalpy of sublimation of N2 near the triple point
# (vaporisation ~6.0 kJ/mol + fusion ~0.72 kJ/mol). Used only below the
# triple point, where the result is flagged approximate.
_DH_SUBLIMATION_N2 = 6.8e3  # J/mol


@dataclass(frozen=True)
class SaturationTemperature:
    temperature: float
    approximate: bool  # True below the triple point (sublimation extrapolation)


def saturation_temperature(gas: PerfectGas, p: float) -> SaturationTemperature:
    """Temperature below which the vapour at pressure ``p`` is supersaturated."""
    fluid = _fluid(gas)
    p_trip = _CP.PropsSI("ptriple", fluid)
    T_trip = _CP.PropsSI("Ttriple", fluid)
    p_crit = _CP.PropsSI("pcrit", fluid)
    if p >= p_crit:
        return SaturationTemperature(_CP.PropsSI("Tcrit", fluid), approximate=False)
    if p >= p_trip:
        return SaturationTemperature(_CP.PropsSI("T", "P", p, "Q", 1, fluid), approximate=False)
    # Clausius-Clapeyron from the triple point: ln(p/pt) = -dH/R (1/T - 1/Tt).
    r_molar = R_UNIVERSAL / 1000.0  # J/(mol K)
    inv_T = 1.0 / T_trip - math.log(p / p_trip) * r_molar / _DH_SUBLIMATION_N2
    return SaturationTemperature(1.0 / inv_T, approximate=True)
