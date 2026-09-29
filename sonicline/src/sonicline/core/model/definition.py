"""The simulation definition: everything needed to reproduce a run, in SI,
independent of OpenFOAM syntax.

Boundaries are described by *role* (inlet, walls, ambient, exit treatment)
rather than as a free list of patches. That makes the common inconsistent
combinations -- two inlets, no wall, a pressure outlet on a supersonic exit
plane -- unrepresentable rather than merely invalid.

Dimensional fields carry ``metadata={"dim": Dimension.X}`` so the JSON
loader can accept "20 bar" or {"value": 20, "unit": "bar"} and convert once.
Every value is stored and written back in SI.
"""

from __future__ import annotations

import enum
import math
from dataclasses import dataclass, field
from typing import ClassVar

from ..gas import NITROGEN, PerfectGas
from ..profile import Profile, conical, from_points
from ..units import ATM, Dimension, quantity_to_si

SCHEMA_VERSION = 1


_REQUIRED = object()


def _q(dim: Dimension, default: object = _REQUIRED):
    """A dimensional dataclass field."""
    if default is _REQUIRED:
        return field(metadata={"dim": dim})
    return field(default=default, metadata={"dim": dim})


# --------------------------------------------------------------------------
# Geometry


class GeometryKind(enum.Enum):
    FLUID_VOLUME = "fluid_volume"  # the gas region itself
    SOLID_BODY = "solid_body"  # thruster hardware; gas volume must be extracted


@dataclass(frozen=True)
class ConicalNozzle:
    """Parametric conical CD nozzle (see :func:`sonicline.core.profile.conical`).

    Radii of curvature and chamber length are multiples of the throat radius.
    """

    TAG: ClassVar[str] = "conical_nozzle"
    throat_radius: float = _q(Dimension.LENGTH)
    expansion_ratio: float = 4.0
    contraction_ratio: float = 9.0
    converging_half_angle: float = _q(Dimension.ANGLE, math.radians(45.0))
    diverging_half_angle: float = _q(Dimension.ANGLE, math.radians(15.0))
    throat_rc_upstream: float = 1.5
    throat_rc_downstream: float = 0.382
    fillet_radius: float = 1.0
    chamber_length: float = 2.0
    throat_length: float = 0.0  # straight section after the throat

    def profile(self) -> Profile:
        return conical(
            self.throat_radius, self.expansion_ratio, self.contraction_ratio,
            self.converging_half_angle, self.diverging_half_angle,
            self.throat_rc_upstream, self.throat_rc_downstream,
            self.fillet_radius, self.chamber_length, self.throat_length,
        )


@dataclass(frozen=True)
class CadFile:
    """An imported STEP or STL file. ``sha256`` pins the exact content.

    ``inlet_end`` confirms which end of the detected axis is the inlet:
    "auto" accepts the detector's suggestion, "min"/"max" pick the end at
    the lower/higher axial coordinate.
    """

    TAG: ClassVar[str] = "cad_file"
    path: str
    sha256: str
    length_unit: str = "mm"
    kind: GeometryKind = GeometryKind.FLUID_VOLUME
    inlet_end: str = "auto"


@dataclass(frozen=True)
class WallProfile:
    """A tabulated axisymmetric wall: (x, r) points from inlet to exit in
    ``length_unit``, joined by straight lines. For nozzles defined by a
    formula or a table, such as the NPARC verification nozzles or a
    method-of-characteristics contour. The throat is found from the points
    (see :func:`sonicline.core.profile.from_points`); sample it finely."""

    TAG: ClassVar[str] = "wall_profile"
    points: tuple[tuple[float, float], ...]
    length_unit: str = "m"

    def __post_init__(self) -> None:
        if len(self.points) < 3:
            raise ValueError("a wall profile needs at least three points")
        if any(r <= 0.0 for _, r in self.points):
            raise ValueError("wall radii must be positive")
        if any(b[0] <= a[0] for a, b in zip(self.points, self.points[1:])):
            raise ValueError("wall points must be in strictly increasing x, inlet first")

    def profile(self) -> Profile:
        k = quantity_to_si(f"1 {self.length_unit}", Dimension.LENGTH)
        return from_points([(k * x, k * r) for x, r in self.points])


Geometry = ConicalNozzle | CadFile | WallProfile


# --------------------------------------------------------------------------
# Gas


@dataclass(frozen=True)
class GasSpec:
    species: str = "N2"

    def model(self) -> PerfectGas:
        if self.species != "N2":
            raise ValueError(f"only nitrogen is supported in V1, not {self.species!r}")
        return NITROGEN


# --------------------------------------------------------------------------
# Boundaries


@dataclass(frozen=True)
class ReservoirInlet:
    """Stagnation (chamber) conditions at the inlet face. T0 is the gas
    temperature *after* any regulator, which is colder than the bottle."""

    TAG: ClassVar[str] = "reservoir_inlet"
    p0: float = _q(Dimension.PRESSURE)
    T0: float = _q(Dimension.TEMPERATURE, 300.0)
    turbulence_intensity: float = 0.02
    turbulence_length_fraction: float = 0.1  # mixing length / inlet diameter


@dataclass(frozen=True)
class MassFlowInlet:
    TAG: ClassVar[str] = "mass_flow_inlet"
    mass_flow: float = _q(Dimension.MASS_FLOW)
    T0: float = _q(Dimension.TEMPERATURE, 300.0)
    turbulence_intensity: float = 0.02
    turbulence_length_fraction: float = 0.1


Inlet = ReservoirInlet | MassFlowInlet


@dataclass(frozen=True)
class Ambient:
    """Surroundings the thruster exhausts into. pressure = 0 is vacuum."""

    pressure: float = _q(Dimension.PRESSURE, ATM)
    temperature: float = _q(Dimension.TEMPERATURE, 288.15)


class Lip(enum.Enum):
    ENTRAINMENT = "entrainment"  # free-standing nozzle: ambient gas can enter behind the exit
    WALL = "wall"  # nozzle exit flush with a plate


@dataclass(frozen=True)
class Plume:
    """External region downstream of the exit plane (required at sea level)."""

    TAG: ClassVar[str] = "plume"
    length: float = 20.0  # exit diameters
    radius: float = 6.0  # exit diameters
    lip: Lip = Lip.ENTRAINMENT


@dataclass(frozen=True)
class TruncatedAtExit:
    """Domain ends at the exit plane. Physical only when the whole exit plane
    leaves supersonically into vacuum or a strongly under-expanded jet.

    ``fixed_pressure`` instead imposes the ambient pressure as the static
    pressure of a subsonic exit plane: the quasi-1D internal-flow problem
    (a shock standing in the nozzle), used for verification. A thruster
    exhausting into surroundings needs a plume region instead."""

    TAG: ClassVar[str] = "truncated_at_exit"
    fixed_pressure: bool = False


ExitDomain = Plume | TruncatedAtExit


@dataclass(frozen=True)
class Adiabatic:
    TAG: ClassVar[str] = "adiabatic"


@dataclass(frozen=True)
class FixedTemperature:
    TAG: ClassVar[str] = "fixed_temperature"
    temperature: float = _q(Dimension.TEMPERATURE)


WallThermal = Adiabatic | FixedTemperature


@dataclass(frozen=True)
class Boundaries:
    inlet: Inlet
    ambient: Ambient = Ambient()
    exit_domain: ExitDomain = Plume()
    wall_thermal: WallThermal = Adiabatic()


# --------------------------------------------------------------------------
# Flow physics


@dataclass(frozen=True)
class Steady:
    TAG: ClassVar[str] = "steady"


@dataclass(frozen=True)
class Transient:
    TAG: ClassVar[str] = "transient"
    end_time: float = _q(Dimension.TIME)
    max_courant: float = 0.3


TimeTreatment = Steady | Transient


@dataclass(frozen=True)
class Inviscid:
    """Euler equations: zero viscosity and slip walls. For verification
    against analytical theory, not for predicting real thrusters."""

    TAG: ClassVar[str] = "inviscid"


@dataclass(frozen=True)
class Laminar:
    TAG: ClassVar[str] = "laminar"


@dataclass(frozen=True)
class KOmegaSST:
    TAG: ClassVar[str] = "k_omega_sst"


Turbulence = Inviscid | Laminar | KOmegaSST


@dataclass(frozen=True)
class Flow:
    time: TimeTreatment = Steady()
    turbulence: Turbulence = KOmegaSST()


# --------------------------------------------------------------------------
# Mesh and numerics


class MeshForm(enum.Enum):
    WEDGE = "wedge"  # axisymmetric, one cell thick: verification and previews
    O_GRID_3D = "o_grid_3d"  # full 3D structured O-grid


class MeshQuality(enum.Enum):
    COARSE = "coarse"
    STANDARD = "standard"
    FINE = "fine"


@dataclass(frozen=True)
class MeshSpec:
    form: MeshForm = MeshForm.O_GRID_3D
    quality: MeshQuality = MeshQuality.STANDARD
    first_cell_yplus: float = 1.0
    wedge_angle: float = _q(Dimension.ANGLE, math.radians(5.0))


@dataclass(frozen=True)
class ConvergenceCriteria:
    # Pressure-based compressible solvers commonly plateau 3-4 orders down;
    # the integral criteria below are what decide convergence.
    residual_drop_orders: float = 3.0
    # ...or residuals already below this level. Starting from the quasi-1D
    # solution leaves less to drop from, so a drop alone would be unfair.
    residual_level: float = 1e-4
    integral_window: int = 200  # iterations over which integrals must be flat
    integral_tolerance: float = 1e-4  # relative spread allowed in that window
    mass_imbalance: float = 1e-3  # |inlet - outlet| / inlet
    # None: the solver's own limit (20 000 for rhoPimpleFoam; 60 000 for
    # the explicit rhoCentralFoam, which V1 needs 23 000 of).
    max_iterations: int | None = None


@dataclass(frozen=True)
class Numerics:
    solver: str = "auto"  # chosen from the physics; see foam/ for the mapping
    convergence: ConvergenceCriteria = ConvergenceCriteria()
    processors: int = 1


# --------------------------------------------------------------------------


@dataclass(frozen=True)
class SimulationDefinition:
    name: str
    geometry: Geometry
    boundaries: Boundaries
    gas: GasSpec = GasSpec()
    flow: Flow = Flow()
    mesh: MeshSpec = MeshSpec()
    numerics: Numerics = Numerics()
    schema_version: int = SCHEMA_VERSION
