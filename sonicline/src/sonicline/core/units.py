"""Unit conversion at the input boundary.

Everything inside SONICLINE is SI: Pa, K, m, kg/s, N. Values arrive from the
user or a JSON file in whatever unit they were typed in, are converted here
exactly once, and are never converted again until they are displayed.

Gauge pressures are refused rather than guessed at: "psig" needs an ambient
reference, and silently assuming one atmosphere is exactly the kind of error
that shifts a chamber pressure by 1 bar without anybody noticing.
"""

from __future__ import annotations

import enum
import re


class Dimension(enum.Enum):
    PRESSURE = "pressure"
    TEMPERATURE = "temperature"
    LENGTH = "length"
    AREA = "area"
    MASS_FLOW = "mass_flow"
    FORCE = "force"
    VELOCITY = "velocity"
    TIME = "time"
    ANGLE = "angle"
    DIMENSIONLESS = "dimensionless"


class UnitError(ValueError):
    """A unit that is unknown, of the wrong dimension, or ambiguous."""


PSI = 6894.757293168361  # Pa, exact from the lbf and inch definitions
LBF = 4.4482216152605  # N
INCH = 0.0254  # m
ATM = 101325.0  # Pa

# Multiplicative units: SI value = value * factor.
_FACTORS: dict[Dimension, dict[str, float]] = {
    Dimension.PRESSURE: {
        "Pa": 1.0, "kPa": 1e3, "MPa": 1e6, "bar": 1e5, "mbar": 1e2,
        "atm": ATM, "psi": PSI, "psia": PSI, "torr": ATM / 760.0,
    },
    Dimension.LENGTH: {
        "m": 1.0, "cm": 1e-2, "mm": 1e-3, "um": 1e-6, "µm": 1e-6,
        "in": INCH, "ft": 12 * INCH,
    },
    Dimension.AREA: {"m2": 1.0, "cm2": 1e-4, "mm2": 1e-6, "in2": INCH**2},
    Dimension.MASS_FLOW: {"kg/s": 1.0, "g/s": 1e-3, "lbm/s": 0.45359237},
    Dimension.FORCE: {"N": 1.0, "mN": 1e-3, "kN": 1e3, "lbf": LBF},
    Dimension.VELOCITY: {"m/s": 1.0, "ft/s": 12 * INCH},
    Dimension.TIME: {"s": 1.0, "ms": 1e-3, "us": 1e-6, "µs": 1e-6},
    Dimension.ANGLE: {"rad": 1.0, "deg": 0.017453292519943295},
    Dimension.DIMENSIONLESS: {"": 1.0, "1": 1.0},
}

# Affine temperature units: SI value = (value + offset) * factor.
_TEMPERATURE: dict[str, tuple[float, float]] = {
    "K": (0.0, 1.0),
    "degC": (273.15, 1.0), "°C": (273.15, 1.0), "C": (273.15, 1.0),
    "degF": (459.67, 5.0 / 9.0), "°F": (459.67, 5.0 / 9.0), "F": (459.67, 5.0 / 9.0),
    "degR": (0.0, 5.0 / 9.0), "°R": (0.0, 5.0 / 9.0), "R": (0.0, 5.0 / 9.0),
}

_SI_UNIT = {
    Dimension.PRESSURE: "Pa", Dimension.TEMPERATURE: "K", Dimension.LENGTH: "m",
    Dimension.AREA: "m2", Dimension.MASS_FLOW: "kg/s", Dimension.FORCE: "N",
    Dimension.VELOCITY: "m/s", Dimension.TIME: "s", Dimension.ANGLE: "rad",
    Dimension.DIMENSIONLESS: "",
}


def si_unit(dimension: Dimension) -> str:
    return _SI_UNIT[dimension]


def to_si(value: float, unit: str, dimension: Dimension) -> float:
    """Convert ``value`` in ``unit`` to SI, checking the unit's dimension."""
    unit = unit.strip()
    if dimension is Dimension.TEMPERATURE:
        if unit not in _TEMPERATURE:
            raise UnitError(f"unknown temperature unit {unit!r}")
        offset, factor = _TEMPERATURE[unit]
        kelvin = (float(value) + offset) * factor
        if kelvin <= 0.0:
            raise UnitError(f"{value} {unit} is at or below absolute zero")
        return kelvin
    if dimension is Dimension.PRESSURE and unit.lower() in ("psig", "barg", "kpag"):
        raise UnitError(
            f"{unit!r} is a gauge pressure; give an absolute pressure "
            "(e.g. psia, bar, Pa) so no ambient reference has to be assumed"
        )
    factors = _FACTORS[dimension]
    if unit not in factors:
        raise UnitError(
            f"unknown {dimension.value} unit {unit!r}; known: {', '.join(k for k in factors if k)}"
        )
    return float(value) * factors[unit]


def from_si(value: float, unit: str, dimension: Dimension) -> float:
    """Convert an SI ``value`` to ``unit`` (for display only)."""
    if dimension is Dimension.TEMPERATURE:
        offset, factor = _TEMPERATURE[unit]
        return value / factor - offset
    return value / _FACTORS[dimension][unit]


_QUANTITY = re.compile(r"^\s*([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)\s*(.*?)\s*$")


def parse(text: str, dimension: Dimension) -> float:
    """Parse a string such as ``"20 bar"`` or ``"300K"`` to an SI value.

    A bare number is taken as SI.
    """
    match = _QUANTITY.match(text)
    if not match:
        raise UnitError(f"cannot read a quantity from {text!r}")
    number, unit = match.groups()
    return to_si(float(number), unit or si_unit(dimension), dimension)


def quantity_to_si(raw: object, dimension: Dimension) -> float:
    """Read a JSON-style quantity: a number (SI), a string ("20 bar"), or
    ``{"value": 20, "unit": "bar"}``."""
    if isinstance(raw, bool):
        raise UnitError(f"expected a {dimension.value}, got a boolean")
    if isinstance(raw, (int, float)):
        return float(raw)
    if isinstance(raw, str):
        return parse(raw, dimension)
    if isinstance(raw, dict) and "value" in raw:
        return to_si(raw["value"], str(raw.get("unit", si_unit(dimension))), dimension)
    raise UnitError(f"cannot read a {dimension.value} from {raw!r}")
