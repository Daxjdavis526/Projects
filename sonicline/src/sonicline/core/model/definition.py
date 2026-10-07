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

import dataclasses
import enum
import math
from dataclasses import dataclass, field
from typing import ClassVar

from ..gas import PerfectGas
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

    def profile(self, planar_width: float | None = None) -> Profile:
        """The wall r(x). For a planar nozzle ``throat_radius`` is the throat
        half-height and the area ratios are ratios of heights; the profile's
        areas then follow from ``planar_width``."""
        square = 2 if planar_width else 1
        prof = conical(
            self.throat_radius, self.expansion_ratio**square, self.contraction_ratio**square,
            self.converging_half_angle, self.diverging_half_angle,
            self.throat_rc_upstream, self.throat_rc_downstream,
            self.fillet_radius, self.chamber_length, self.throat_length,
        )
        return dataclasses.replace(prof, planar_width=planar_width) if planar_width else prof


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

    def profile(self, planar_width: float | None = None) -> Profile:
        k = quantity_to_si(f"1 {self.length_unit}", Dimension.LENGTH)
        prof = from_points([(k * x, k * r) for x, r in self.points])
        return dataclasses.replace(prof, planar_width=planar_width) if planar_width else prof


Geometry = ConicalNozzle | CadFile | WallProfile


# --------------------------------------------------------------------------
# Gas


@dataclass(frozen=True)
class GasSpec:
    """``equation_of_state``: "perfect_gas" (the default), "virial",
    "peng_robinson" or "auto". "auto" runs the virial gas for nitrogen (on
    either solver) and the perfect gas, with the reported reference
    correction, for other gases. New simulations start from it. The
    perfect gas is what most verification cases run;
    its real-gas mass flow bias is reported from the reference equation of
    state. The virial gas (nitrogen only) puts real-gas behaviour in the CFD
    itself and matches the reference equation's choked flux to about 0.01 %
    up to 30 bar (DESIGN.md section 17). Peng-Robinson does too, but for
    nitrogen at 300 K it over-predicts the real-gas bias by about a quarter
    (section 11).

    ``heat_capacity``: "auto" (the default), "constant" or
    "temperature_dependent". A cold gas has a constant ideal-gas cp
    (nitrogen's moves 0.14 % up to 350 K); a heated one does not (+3.4 % at
    600 K, +12 % at 1000 K). "auto" is cp(T) when the chamber is above
    350 K and constant otherwise. ``reference_temperature`` is the
    temperature the constant-gamma theory takes cp at (the chamber's),
    filled in by resolve_gas."""

    species: str = "N2"
    equation_of_state: str = "perfect_gas"
    heat_capacity: str = "auto"
    reference_temperature: float | None = None

    def __post_init__(self) -> None:
        if self.equation_of_state not in EQUATIONS_OF_STATE:
            raise ValueError(f"equation_of_state must be one of {', '.join(EQUATIONS_OF_STATE)}")
        if self.heat_capacity not in HEAT_CAPACITIES:
            raise ValueError(f"heat_capacity must be one of {', '.join(HEAT_CAPACITIES)}")

    def model(self) -> PerfectGas:
        from ..gas import GASES, with_cp_of_temperature

        if self.species not in GASES:
            raise ValueError(f"unknown gas {self.species!r}; use one of {', '.join(GASES)}")
        gas = GASES[self.species]
        if self.heat_capacity == "temperature_dependent":
            gas = with_cp_of_temperature(gas, self.reference_temperature or 300.0)
        return gas

    def isentrope_model(self):
        """The gas the CFD runs, as a model whose isentrope gives its own
        choked flux: the real-gas model, the ideal gas with cp(T), or None
        for the constant-cp perfect gas (whose isentrope is the theory's)."""
        model = self.cfd_model()
        if model is not None:
            return model
        gas = self.model()
        if gas.janaf is not None:
            from ..gas import IdealGasCpT

            return IdealGasCpT(gas)
        return None

    @property
    def peng_robinson(self) -> bool:
        return self.equation_of_state == "peng_robinson"

    @property
    def virial(self) -> bool:
        return self.equation_of_state == "virial"

    @property
    def real_gas(self) -> bool:
        """The CFD itself runs a real-gas equation of state ("auto" is not
        resolved yet, so not)."""
        return self.equation_of_state in ("virial", "peng_robinson")

    def cfd_model(self):
        """The real-gas model the CFD runs (enthalpy, entropy, density), or None."""
        if self.peng_robinson:
            from ..pengrobinson import PengRobinson

            return PengRobinson(self.model())
        if self.virial:
            from ..virial import for_gas

            return for_gas(self.model())
        return None


EQUATIONS_OF_STATE = ("perfect_gas", "virial", "peng_robinson", "auto")
# The virial gas is not chosen automatically for an expansion colder than
# this at the exit: its fit (core.virial.FIT_RANGE) starts at 70 K, and
# the margin covers the expansion overshooting the ideal in places.
VIRIAL_COLDEST = 80.0
HEAT_CAPACITIES = ("auto", "constant", "temperature_dependent")


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
class WallSlip:
    """First-order rarefied-gas wall conditions (core.rarefaction): Maxwell
    velocity slip, and on a fixed-temperature wall Smoluchowski temperature
    jump. ``accommodation`` is the fraction of molecules reflected diffusely
    (1: fully diffuse, usual for engineering surfaces; smoother surfaces
    slip more). ``thermal_creep`` adds the slip driven by the temperature
    gradient along the wall. For the slip regime, Knudsen numbers up to about
    0.1; it runs on rhoPimpleFoam."""

    accommodation: float = 1.0
    thermal_creep: bool = True

    def __post_init__(self) -> None:
        if not 0.0 < self.accommodation <= 1.0:
            raise ValueError("the accommodation coefficient must lie in (0, 1]")


@dataclass(frozen=True)
class Boundaries:
    inlet: Inlet
    ambient: Ambient = Ambient()
    exit_domain: ExitDomain = Plume()
    wall_thermal: WallThermal = Adiabatic()
    wall_slip: WallSlip | None = None  # no slip unless given


# --------------------------------------------------------------------------
# Flow physics


@dataclass(frozen=True)
class Steady:
    TAG: ClassVar[str] = "steady"


@dataclass(frozen=True)
class Transient:
    """Time-accurate run to ``end_time``.

    ``initial``: "ambient" starts the thruster from rest -- the whole domain
    at ambient pressure and temperature, the reservoir opening at t = 0 (a
    startup); "quasi_1d" starts from the steady quasi-1D estimate.
    ``ramp_time`` > 0 opens the valve linearly: the inlet total pressure
    rises from ambient to p0 over that time. Fields are written
    ``frames`` times over the run (the animation's frames)."""

    TAG: ClassVar[str] = "transient"
    end_time: float = _q(Dimension.TIME)
    max_courant: float = 0.3
    initial: str = "ambient"
    ramp_time: float = _q(Dimension.TIME, 0.0)
    frames: int = 40

    def __post_init__(self) -> None:
        if self.initial not in ("ambient", "quasi_1d"):
            raise ValueError("transient initial state must be 'ambient' or 'quasi_1d'")
        if not self.end_time > 0.0 or self.ramp_time < 0.0 or self.ramp_time > self.end_time:
            raise ValueError("need end_time > 0 and 0 <= ramp_time <= end_time")
        if not 1 <= self.frames <= 1000:
            raise ValueError("frames must lie between 1 and 1000")


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
    PLANAR = "planar"  # two-dimensional (rectangular) nozzle, half-channel, one cell deep
    UNSTRUCTURED = "unstructured"  # Tier 2: snappyHexMesh (gmsh fallback), any fluid volume


MESHERS = ("auto", "snappy", "cfmesh", "gmsh")


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
    # Divides every cell size of the quality preset (> 1 is finer), for
    # grid-convergence studies: `sonicline study` sets it.
    refinement: float = 1.0
    # Planar nozzles: the width between the flat sidewalls (which the
    # two-dimensional model does not resolve).
    planar_width: float = _q(Dimension.LENGTH, 0.0)
    # Tier 2 only: "auto" tries snappyHexMesh (inviscid) or cfMesh (viscous)
    # first, then the other, then gmsh.
    mesher: str = "auto"

    def __post_init__(self) -> None:
        if self.mesher not in MESHERS:
            raise ValueError(f"unknown mesher {self.mesher!r}; use one of {', '.join(MESHERS)}")
        if not 0.25 <= self.refinement <= 4.0:
            raise ValueError("mesh refinement must lie between 0.25 and 4")
        if (self.form is MeshForm.PLANAR) != (self.planar_width > 0.0):
            raise ValueError("a planar mesh needs a planar_width > 0, and only a planar mesh takes one")


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
    # Scatter (std / mean) the integrals may keep over the window. A separated
    # nozzle never settles (its shock and shear layer move); allowing more
    # here reports pseudo-time averages, and the verdict says so.
    noise_tolerance: float = 1e-3
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
class Tolerances:
    """What the inputs may be off by, for the run's uncertainty budget
    (core.uncertainty): chamber pressure and a stated mass flow as fractions
    (0.01 = 1 %), chamber temperature in kelvin (a difference: write a
    number, not "2 degC"), throat diameter as a length ("0.01 mm"). Each
    is optional; a tolerance not given contributes nothing."""

    p0_relative: float | None = None
    T0: float | None = None
    throat_diameter: float | None = _q(Dimension.LENGTH, None)
    mass_flow_relative: float | None = None

    def __post_init__(self) -> None:
        for name in ("p0_relative", "T0", "throat_diameter", "mass_flow_relative"):
            v = getattr(self, name)
            if v is not None and not v >= 0.0:
                raise ValueError(f"tolerance {name} must be a non-negative number")


@dataclass(frozen=True)
class SimulationDefinition:
    name: str
    geometry: Geometry
    boundaries: Boundaries
    gas: GasSpec = GasSpec()
    flow: Flow = Flow()
    mesh: MeshSpec = MeshSpec()
    numerics: Numerics = Numerics()
    tolerances: Tolerances | None = None
    schema_version: int = SCHEMA_VERSION


def coldest_ideal_temperature(defn: SimulationDefinition, profile=None) -> float | None:
    """The static temperature at the nozzle exit of the ideal (isentropic,
    quasi-1D) expansion: the coldest gas a steady run should hold. None
    without a profile."""
    if profile is None or not getattr(profile, "expansion_ratio", None):
        return None
    from ..theory import isentropic

    gamma = defn.gas.model().gamma
    M = isentropic.mach_from_area_ratio(gamma, profile.expansion_ratio, supersonic=True)
    return defn.boundaries.inlet.T0 / isentropic.T0_over_T(gamma, M)


def resolve_gas(defn: SimulationDefinition, profile=None) -> SimulationDefinition:
    """Settle the gas's "auto" choices for a definition:

    - equation of state: the virial gas for a species with virial
      coefficients (nitrogen), the perfect gas otherwise. Not the virial
      gas when the ideal expansion leaves its fit (below 70 K at the exit,
      ``profile`` permitting): its coefficients diverge there, and a 4 N
      space nozzle (area ratio 40, 40 K at the exit) stopped the solver on
      its first iterations. At those pressures nitrogen is ideal to 0.3 %,
      which the reported real-gas correction carries;
    - heat capacity: cp(T) above HEATED_T0 for a species with a cp(T)
      fit, constant otherwise; the reference temperature is the chamber's.

    Idempotent; a stated choice is kept."""
    import dataclasses

    from ..gas import HEATED_T0, JANAF
    from ..virial import COEFFICIENTS

    gas = defn.gas
    eos = gas.equation_of_state
    if eos == "auto":
        eos = "virial" if gas.species in COEFFICIENTS else "perfect_gas"
        cold = coldest_ideal_temperature(defn, profile) if eos == "virial" else None
        if cold is not None and cold < VIRIAL_COLDEST:
            eos = "perfect_gas"
    hc = gas.heat_capacity
    T0 = defn.boundaries.inlet.T0
    if hc == "auto":
        hc = "temperature_dependent" if T0 > HEATED_T0 and gas.species in JANAF else "constant"
    ref = T0 if hc == "temperature_dependent" else gas.reference_temperature
    if (eos, hc, ref) == (gas.equation_of_state, gas.heat_capacity, gas.reference_temperature):
        return defn
    return dataclasses.replace(defn, gas=dataclasses.replace(gas, equation_of_state=eos, heat_capacity=hc,
                                                             reference_temperature=ref))

