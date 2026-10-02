"""Build an OpenFOAM (ESI v2512) case from a simulation definition.

Given the definition, the nozzle profile and the generated mesh, write a
complete, runnable case: mesh, thermophysics, turbulence, boundary
conditions, solver control and the function objects the post-processor
reads. The case is a pure function of its inputs; running the builder
twice produces byte-identical files.

Solver choice (DESIGN.md section 3.2): rhoPimpleFoam, pressure-based, with
the transonic formulation. Steady problems use local time stepping
(``localEuler``) as a pseudo-transient march; transient problems use
time-accurate PIMPLE.

Thermophysics (section 3.3): hePsiThermo / perfectGas / hConst /
sensibleInternalEnergy, Sutherland transport. The energy variable is
internal energy on purpose: ESI rhoCentralFoam, the cross-check solver,
does not validate the energy form and would silently misread enthalpy.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from ..core.gas import PerfectGas
from ..core.model import definition as d
from ..core.profile import Profile
from ..core.stagnation import nominal_p0
from ..core.theory import nozzle, quasi1d
from ..mesh.polymesh import PolyMesh
from ..mesh.revolved import PLANAR_DEPTH, Form, MeshMeta
from . import polymesh_io
from .dictwriter import Raw, write_dict, write_field

PIMPLE_SOLVER = "rhoPimpleFoam"
CENTRAL_SOLVER = "rhoCentralFoam"
# OpenFOAM's rarefied-gas wall conditions (maxwellSlipU, smoluchowskiJumpT)
# live in rhoCentralFoam's boundary-condition library; any solver can load it.
SLIP_LIBRARY = "librhoCentralFoam.so"
# Steady-state iteration limits when the definition sets none. rhoCentralFoam
# is explicit at a Courant number of 0.1.
DEFAULT_MAX_ITERATIONS = {PIMPLE_SOLVER: 20000, CENTRAL_SOLVER: 60000}


def energy_field(defn: d.SimulationDefinition) -> str:
    """OpenFOAM's energy variable: internal energy e, except enthalpy h for
    the Peng-Robinson gas (the only form OpenFOAM compiles it in). The
    virial gas is compiled in both and runs in e, which rhoCentralFoam
    needs."""
    return "h" if defn.gas.peng_robinson else "e"


def iteration_limit(defn: d.SimulationDefinition, solver: str) -> int:
    n = defn.numerics.convergence.max_iterations
    return DEFAULT_MAX_ITERATIONS[solver] if n is None else n


def shock_inside(defn: d.SimulationDefinition, profile: Profile) -> bool:
    """Whether quasi-1D theory expects a shock inside the nozzle: a normal
    shock in the diverging section, or separation (which stands an oblique
    shock system inside it)."""
    gas = defn.gas.model()
    b = defn.boundaries
    perf = nozzle.analyse(gas, nominal_p0(defn, profile), b.inlet.T0, b.ambient.pressure,
                          profile.throat_area, profile.area(profile.x_exit))
    return perf.regime is nozzle.Regime.SHOCK_IN_NOZZLE or perf.separation.likely


def start_pressure(defn: d.SimulationDefinition, p0: float) -> float:
    """Pressure in a transient's still domain at t = 0."""
    return max(defn.boundaries.ambient.pressure, 1e-3 * p0)


def solver_for(defn: d.SimulationDefinition, profile: Profile) -> str:
    """The solver a definition runs with (DESIGN.md section 3.2). "auto" is
    rhoPimpleFoam, except where a shock stands inside the nozzle:
    rhoPimpleFoam misplaces a normal shock by 30 % of the diverging length
    (V2, DESIGN.md section 11), rhoCentralFoam places it within 0.3 %."""
    name = defn.numerics.solver
    if name == "auto":
        # Transients are explicit and time-accurate: a startup drives a
        # shock through the nozzle, which rhoPimpleFoam misplaces.
        if isinstance(defn.flow.time, d.Transient):
            return CENTRAL_SOLVER
        return CENTRAL_SOLVER if shock_inside(defn, profile) else PIMPLE_SOLVER
    if name in (PIMPLE_SOLVER, CENTRAL_SOLVER):
        return name
    raise ValueError(f"unknown solver {name!r}; use auto, {PIMPLE_SOLVER} or {CENTRAL_SOLVER}")


def needs_viscous_work_extension(defn: d.SimulationDefinition, profile: Profile) -> bool:
    """rhoCentralFoam already carries viscous work (sigmaDotU); rhoPimpleFoam does not."""
    return (not isinstance(defn.flow.turbulence, d.Inviscid)
            and solver_for(defn, profile) == PIMPLE_SOLVER)

DIM = {
    "p": "[1 -1 -2 0 0 0 0]",
    "T": "[0 0 0 1 0 0 0]",
    "U": "[0 1 -1 0 0 0 0]",
    "k": "[0 2 -2 0 0 0 0]",
    "omega": "[0 0 -1 0 0 0 0]",
    "nut": "[0 2 -1 0 0 0 0]",
    "alphat": "[1 -1 -1 0 0 0 0]",
}

# Integrals on these surfaces are written every iteration by function
# objects and read back by sonicline.post. Keys are the function-object
# names; the post-processor relies on them.
MASS_FLOW_REGIONS = ("inlet", "throat", "exit", "outlet", "ambient", "lip")


@dataclass(frozen=True)
class CaseSummary:
    path: Path
    solver: str
    viscous: bool
    turbulence: str
    fields: tuple[str, ...]
    sector_factor: float  # multiply wedge or planar integrals by this for the full nozzle
    exit_region: tuple[str, str]  # ("faceZone"|"patch", name) of the exit plane
    throat_region: tuple[str, str]
    exit_area: float  # full-revolution exit area from the mesh, m^2
    throat_area: float
    inlet_area: float
    initial: quasi1d.Quasi1DSolution
    p_min_limit: float | None  # the solver's pressure floor (rhoCentralFoam has none)
    p0_nominal: float = 0.0  # stated, or for a mass-flow inlet the ideal inversion

    def to_json(self) -> dict:
        """Everything but the initial estimate, for resuming a run."""
        return {"path": str(self.path), "solver": self.solver, "viscous": self.viscous,
                "turbulence": self.turbulence, "fields": list(self.fields),
                "sector_factor": self.sector_factor, "exit_region": list(self.exit_region),
                "throat_region": list(self.throat_region), "exit_area": self.exit_area,
                "throat_area": self.throat_area, "inlet_area": self.inlet_area,
                "p_min_limit": self.p_min_limit, "p0_nominal": self.p0_nominal}

    @staticmethod
    def from_json(data: dict) -> "CaseSummary":
        return CaseSummary(
            path=Path(data["path"]), solver=data["solver"], viscous=data["viscous"],
            turbulence=data["turbulence"], fields=tuple(data["fields"]), sector_factor=data["sector_factor"],
            exit_region=tuple(data["exit_region"]), throat_region=tuple(data["throat_region"]),
            exit_area=data["exit_area"], throat_area=data["throat_area"], inlet_area=data["inlet_area"],
            initial=None, p_min_limit=data["p_min_limit"], p0_nominal=data["p0_nominal"])


def _region(meta: MeshMeta, mesh: PolyMesh, which: str) -> tuple[str, str]:
    if which in mesh.face_zones:
        return ("faceZone", which)
    if which == "throat" and "exit" in mesh.face_zones:
        return ("faceZone", "exit")  # converging-only nozzle: throat is the exit
    return ("patch", "outlet")


def _zone_area(mesh: PolyMesh, region: tuple[str, str]) -> float:
    """Axial projection of a zone or patch: the signed sum over its
    (consistently oriented) faces, which is the enclosed cross-section even
    for the jagged cut through a tetrahedral mesh."""
    kind, name = region
    if kind == "faceZone":
        faces, flip = mesh.face_zones[name]
    else:
        faces = mesh.patch_faces(name)
        flip = np.zeros(len(faces), dtype=bool)
    pts = mesh.points
    f = mesh.faces[faces]
    total = 0.0
    for row, flipped in zip(f, flip):
        v = pts[row[row >= 0]]
        n = np.zeros(3)
        for i in range(len(v)):
            n += np.cross(v[i], v[(i + 1) % len(v)])
        total += -0.5 * n[0] if flipped else 0.5 * n[0]
    return abs(total)


def build_case(
    case: Path,
    defn: d.SimulationDefinition,
    profile: Profile,
    mesh: PolyMesh,
    meta: MeshMeta,
    extension_library: str | None = None,
    real_gas_library: str | None = None,
) -> CaseSummary:
    """``extension_library`` is the viscous-work fvOption library and
    ``real_gas_library`` the virial-gas thermophysics library (both from
    sonicline.foam.extensions.ensure_built); viscous cases need the first,
    virial-gas cases the second."""
    defn = d.resolve_gas(defn)
    gas = defn.gas.model()
    b = defn.boundaries
    turb = defn.flow.turbulence
    viscous = not isinstance(turb, d.Inviscid)
    ras = isinstance(turb, d.KOmegaSST)
    steady = isinstance(defn.flow.time, d.Steady)

    case.mkdir(parents=True, exist_ok=True)
    polymesh_io.write(mesh, case)
    fields = ["p", "T", "U"] + (["k", "omega", "nut", "alphat"] if ras else [])

    # --- initial state from quasi-1D theory ---------------------------------
    # A mass-flow inlet starts from the ideal chamber pressure for its flow;
    # the solver finds the real one (higher by 1/Cd) on its own.
    p0, T0 = nominal_p0(defn, profile), b.inlet.T0
    pa, Ta = b.ambient.pressure, b.ambient.temperature
    centres = mesh.cell_centres
    xs_unique = np.unique(np.round(centres[:, 0], 12))
    xs_nozzle = [x for x in xs_unique if x <= profile.x_exit]
    # A structured mesh has a few hundred stations, solved exactly; every
    # cell of an unstructured mesh has its own x, so theory is solved on
    # 2000 stations there and interpolated.
    if len(xs_nozzle) > 2000:
        xs_nozzle = list(np.linspace(max(min(xs_nozzle), profile.x_inlet), profile.x_exit, 2000))
    q1d = quasi1d.solve(profile, gas, p0, T0, pa, xs_nozzle)
    table = {round(s.x, 12): s for s in q1d.stations}
    q_x = np.array([s.x for s in q1d.stations])
    q_p, q_T, q_u = (np.array([getattr(s, k) for s in q1d.stations]) for k in ("pressure", "temperature", "velocity"))

    def station(x):
        s = table.get(x)
        if s is not None:
            return s.pressure, s.temperature, s.velocity
        return float(np.interp(x, q_x, q_p)), float(np.interp(x, q_x, q_T)), float(np.interp(x, q_x, q_u))

    exit_state = q1d.stations[-1]
    r_cell = np.hypot(centres[:, 1], centres[:, 2])
    p_init = np.empty(len(centres))
    T_init = np.empty(len(centres))
    U_init = np.zeros((len(centres), 3))
    for c, (x, r) in enumerate(zip(np.round(centres[:, 0], 12), r_cell)):
        if x <= profile.x_exit:
            p_init[c], T_init[c], U_init[c, 0] = station(x)
        elif r <= profile.exit_radius:
            # Jet core, carried into the plume. An overexpanded core starts at
            # ambient pressure: carried at its exit pressure (0.28 atm for
            # NPR 2.46 in TP-1704's nozzle) it drives the far outlet to vacuum
            # before the plume can recompress it.
            p_init[c] = max(exit_state.pressure, pa)
            T_init[c], U_init[c, 0] = exit_state.temperature, exit_state.velocity
        else:
            p_init[c], T_init[c] = max(pa, 1e-3 * p0), Ta
    if pa <= 0.0:
        p_init = np.maximum(p_init, 1e-4 * p0)
    t = defn.flow.time
    if isinstance(t, d.Transient) and t.initial == "ambient":
        # A startup: gas at rest at ambient conditions everywhere (vacuum
        # stands in as a thousandth of p0: the solvers need a pressure).
        p_init[:] = start_pressure(defn, p0)
        T_init[:] = Ta
        U_init[:] = 0.0

    # Turbulence inlet state and a matching initial field.
    u_in = q1d.stations[0].velocity
    D_in = 2.0 * profile.inlet_radius
    L_mix = b.inlet.turbulence_length_fraction * D_in
    k0 = max(1.5 * (b.inlet.turbulence_intensity * u_in) ** 2, 1e-6)
    omega0 = math.sqrt(k0) / (0.09**0.25 * L_mix)
    k_amb, omega_amb = k0, omega0

    solver = solver_for(defn, profile)
    viscous_work = needs_viscous_work_extension(defn, profile)
    if viscous_work and extension_library is None:
        raise ValueError("viscous rhoPimpleFoam cases need the viscous-work extension library")
    real_gas = defn.gas.cfd_model()
    if defn.gas.peng_robinson and solver != PIMPLE_SOLVER:
        raise ValueError("the Peng-Robinson gas runs only with rhoPimpleFoam")
    if defn.gas.virial and real_gas_library is None:
        raise ValueError("the virial gas needs its extension library")
    # A wedge of angle theta has flat (chord) faces: its cross-section is
    # r^2 sin(theta)/2, not r^2 theta/2. Scaling by 2 pi / sin(theta) makes
    # the scaled face areas -- and so every flux integral -- exact.
    # A planar half-channel of constant depth stands for both halves of a
    # nozzle planar_width wide.
    if meta.form is Form.WEDGE:
        sector = 2.0 * math.pi / math.sin(defn.mesh.wedge_angle)
    elif meta.form is Form.PLANAR:
        sector = 2.0 * defn.mesh.planar_width / (PLANAR_DEPTH * profile.throat_radius)
    else:
        sector = 1.0
    # With slip, stock rhoCentralFoam's energy equation takes the viscous work
    # through the wall face and drains the sliding friction out of the gas
    # (DESIGN.md finding 73): the pipeline runs SONICLINE's build of it
    # (foam/extensions, slipCentralFoam); viscousWork does the same for
    # rhoPimpleFoam.
    slip = defn.boundaries.wall_slip if viscous else None
    _write_constant(case, gas, viscous, viscous_work, ras, real_gas,
                    gas.prandtl(defn.boundaries.inlet.T0) if slip is not None else None)
    _write_fields(case, defn, meta, profile.exit_radius, fields, p_init, T_init, U_init,
                  k0, omega0, k_amb, omega_amb, L_mix, p0, sector)
    exit_region = _region(meta, mesh, "exit")
    throat_region = _region(meta, mesh, "throat")
    _write_system(case, defn, meta, viscous, ras, steady, p0, pa, exit_region, throat_region,
                  [lib for lib in (extension_library if viscous_work else None,
                                   real_gas_library if defn.gas.virial else None,
                                   SLIP_LIBRARY if viscous and defn.boundaries.wall_slip else None) if lib],
                  solver)

    (case / "case.foam").write_text("", encoding="utf-8")
    return CaseSummary(
        path=case, solver=solver, viscous=viscous,
        turbulence=type(turb).TAG, fields=tuple(fields), sector_factor=sector,
        exit_region=exit_region, throat_region=throat_region,
        exit_area=_zone_area(mesh, exit_region) * sector,
        # The throat Cd is measured against: an unstructured mesh's throat
        # zone is a cut through its cells that meets the wall up to a cell
        # away from the throat, where the nozzle is wider (1.8 % too large
        # on a coarse tetrahedral mesh), so the geometry's own throat is
        # used. Faceting of the mesh wall then shows in Cd, as it should.
        throat_area=(profile.throat_area if meta.form is Form.UNSTRUCTURED
                     else _zone_area(mesh, throat_region) * sector),
        inlet_area=_zone_area(mesh, ("patch", "inlet")) * sector,
        initial=q1d,
        p_min_limit=_p_min(p0) if solver == PIMPLE_SOLVER else None,
        p0_nominal=p0,
    )


# --------------------------------------------------------------------------- constant


def _write_constant(case: Path, gas: PerfectGas, viscous: bool, viscous_work: bool,
                    ras: bool, real_gas=None, slip_prandtl: float | None = None) -> None:
    mixture: dict = {"specie": {"molWeight": gas.molar_mass},
                     "thermodynamics": {"Cp": gas.cp, "Hf": 0}}
    thermo = "hConst"
    if gas.janaf is not None and not hasattr(real_gas, "crit"):
        # cp(T) (heated gas), also under the virial gas; Peng-Robinson is
        # compiled with constant cp only. One polynomial on both sides of Tcommon; the enthalpy and entropy
        # constants are zero (sensible energy and psiThermo use neither).
        # OpenFOAM clamps T to [Tlow, Thigh].
        coeffs = list(gas.janaf) + [0.0, 0.0]
        lo, hi = gas.janaf_range
        thermo = "janaf"
        mixture["thermodynamics"] = {"Tlow": lo, "Thigh": hi, "Tcommon": hi,
                                     "highCpCoeffs": Raw("( " + " ".join(f"{c!r}" for c in coeffs) + " )"),
                                     "lowCpCoeffs": Raw("( " + " ".join(f"{c!r}" for c in coeffs) + " )")}
    if real_gas is None:
        transport = ({"As": gas.sutherland_As, "Ts": gas.sutherland_Ts} if viscous
                     else {"mu": 0, "Pr": 0.71})
        kinds = ("sutherland" if viscous else "const", "perfectGas", "sensibleInternalEnergy")
    elif hasattr(real_gas, "crit"):
        # OpenFOAM compiles Peng-Robinson with constant cp only as
        # sutherland / sensibleEnthalpy; As = 0 makes it inviscid.
        transport = {"As": gas.sutherland_As if viscous else 0.0, "Ts": gas.sutherland_Ts}
        kinds = ("sutherland", "PengRobinsonGas", "sensibleEnthalpy")
        c = real_gas.crit
        mixture["equationOfState"] = {"Tc": c.Tc, "Vc": c.Vc, "Pc": c.Pc, "omega": c.omega}
    else:
        # The virial gas (foam/extensions/virialGas) in internal-energy form,
        # which both solvers use; its library compiles every combination of
        # const/sutherland, hConst/janaf and e/h.
        transport = ({"As": gas.sutherland_As, "Ts": gas.sutherland_Ts} if viscous
                     else {"mu": 0, "Pr": 0.71})
        kinds = ("sutherland" if viscous else "const", "virialGas", "sensibleInternalEnergy")
        mixture["equationOfState"] = {
            "B": Raw("( " + " ".join(f"{c!r}" for c in real_gas.b) + " )"),
            "C": Raw("( " + " ".join(f"{c!r}" for c in real_gas.c) + " )")}
    if viscous and slip_prandtl is not None and "Pr" not in transport:
        # smoluchowskiJumpT reads the Prandtl number from the transport
        # dictionary; Sutherland transport has none of its own (and ignores it).
        transport = {**transport, "Pr": slip_prandtl}
    mixture["transport"] = transport
    write_dict(case / "constant" / "thermophysicalProperties", "thermophysicalProperties", {
        "thermoType": {
            "type": "hePsiThermo",
            "mixture": "pureMixture",
            "transport": kinds[0],
            "thermo": thermo,
            "equationOfState": kinds[1],
            "specie": "specie",
            "energy": kinds[2],
        },
        "mixture": mixture,
    }, location="constant")
    if viscous_work:
        # rhoPimpleFoam's total-energy equation lacks the viscous work
        # div(tau & U); SONICLINE's viscousWork fvOption supplies it (see
        # foam/extensions/viscousWork/viscousWork.H and DESIGN.md section 10).
        write_dict(case / "constant" / "fvOptions", "fvOptions", {
            "viscousWork": {"type": "viscousWork", "active": "yes"},
        }, location="constant")
    body: dict = {"simulationType": "RAS" if ras else "laminar"}
    if ras:
        body["RAS"] = {"RASModel": "kOmegaSST", "turbulence": "on", "printCoeffs": "on"}
    write_dict(case / "constant" / "turbulenceProperties", "turbulenceProperties", body,
               location="constant")


# --------------------------------------------------------------------------- 0/


def _write_fields(case, defn, meta, exit_radius, fields, p_init, T_init, U_init,
                  k0, omega0, k_amb, omega_amb, L_mix, p0, sector):
    b = defn.boundaries
    g = defn.gas.model().gamma
    turb = defn.flow.turbulence
    viscous = not isinstance(turb, d.Inviscid)
    pa, Ta = b.ambient.pressure, b.ambient.temperature
    T0 = b.inlet.T0
    patches = meta.patches
    lip_wall = patches.get("lip") == "wall"
    plume = "ambient" in patches
    fixed_wall_T = b.wall_thermal.temperature if isinstance(b.wall_thermal, d.FixedTemperature) else None

    def io(value):
        """Zero gradient on outflow, ``value`` on inflow."""
        return {"type": "inletOutlet", "inletValue": Raw(f"uniform {value}"),
                "value": Raw(f"uniform {value}")}

    plume_length = defn.boundaries.exit_domain.length * 2 * exit_radius if plume else 0.0

    def outlet_p():
        if not plume and pa <= 0.0:
            return {"type": "zeroGradient"}
        if not plume and b.exit_domain.fixed_pressure:
            return {"type": "fixedValue", "value": Raw(f"uniform {pa}")}
        # Non-reflecting outflow. The jet core can still be supersonic at the
        # far outlet (Mach ~3 at 20 exit diameters in the 20 bar case), where
        # imposing a static pressure is ill-posed and drove cells to pMin.
        # The plume's pressure level is pinned by the ambient boundaries
        # (total pressure = ambient) instead.
        return {"type": "waveTransmissive", "field": "p", "phi": "phi", "rho": "rho",
                "psi": "thermo:psi", "gamma": g, "fieldInf": pa,
                "lInf": max(0.5 * plume_length, 1e-3), "value": Raw(f"uniform {max(pa, 1e-4 * p0)}")}

    def ambient_p():
        return {"type": "totalPressure", "p0": Raw(f"uniform {pa}"), "psi": "thermo:psi",
                "gamma": g, "value": Raw(f"uniform {pa}")}

    slip = b.wall_slip if viscous else None
    wall_U = {"type": "noSlip"} if viscous else {"type": "slip"}
    wall_T = ({"type": "fixedValue", "value": Raw(f"uniform {fixed_wall_T}")}
              if fixed_wall_T else {"type": "zeroGradient"})
    if slip is not None:
        # First-order rarefied-gas walls (rhoCentralFoam's boundary library,
        # loaded by _write_system): Maxwell slip, with the slip length
        # (2 - sigma)/sigma lambda, lambda = mu/p sqrt(pi R T / 2). The
        # curvature term needs rhoCentralFoam's tauMC and is off.
        wall_U = {"type": "maxwellSlipU", "accommodationCoeff": slip.accommodation,
                  "Uwall": Raw("uniform (0 0 0)"), "thermalCreep": "true" if slip.thermal_creep else "false",
                  "curvature": "false", "value": Raw("uniform (0 0 0)")}
        if fixed_wall_T:
            # An adiabatic wall has no jump: its normal gradient is zero.
            wall_T = {"type": "smoluchowskiJumpT", "accommodationCoeff": slip.accommodation,
                      "Twall": Raw(f"uniform {fixed_wall_T}"), "gamma": g,
                      "value": Raw(f"uniform {fixed_wall_T}")}
    wall_types = {
        "U": wall_U,
        "p": {"type": "zeroGradient"},
        "T": wall_T,
        "k": {"type": "kqRWallFunction", "value": Raw(f"uniform {k0}")},
        "omega": {"type": "omegaWallFunction", "value": Raw(f"uniform {omega0}")},
        # Resolved walls (y+ ~ 1) integrate to the wall; coarser ones use
        # Spalding's law, valid continuously from the sublayer to the log layer.
        "nut": {"type": "nutLowReWallFunction" if defn.mesh.first_cell_yplus <= 5.0
                else "nutUSpaldingWallFunction", "value": Raw("uniform 0")},
        "alphat": {"type": "compressible::alphatWallFunction", "Prt": 0.85, "value": Raw("uniform 0")},
    }
    entrain = {
        "p": ambient_p(),
        "T": io(Ta),
        "U": {"type": "pressureInletOutletVelocity", "value": Raw("uniform (0 0 0)")},
        "k": io(k_amb),
        "omega": io(omega_amb),
        "nut": {"type": "calculated", "value": Raw("uniform 0")},
        "alphat": {"type": "calculated", "value": Raw("uniform 0")},
    }
    outflow = {
        "p": outlet_p(),
        "T": io(Ta if plume else T0),
        "U": {"type": "inletOutlet", "inletValue": Raw("uniform (0 0 0)"), "value": Raw("uniform (0 0 0)")},
        "k": io(k_amb),
        "omega": io(omega_amb),
        "nut": {"type": "calculated", "value": Raw("uniform 0")},
        "alphat": {"type": "calculated", "value": Raw("uniform 0")},
    }
    if isinstance(b.inlet, d.MassFlowInlet):
        # The flow is imposed (per wedge or half-channel: the full nozzle's
        # divided by the sector factor) and the pressure floats: zero
        # gradient lets the chamber settle at whatever the nozzle needs.
        # rhoInlet is only a fallback; both solvers register rho.
        inlet_p = {"type": "zeroGradient"}
        inlet_U = {"type": "flowRateInletVelocity", "massFlowRate": b.inlet.mass_flow / sector,
                   "rhoInlet": p0 / (defn.gas.model().R * T0), "extrapolateProfile": "false",
                   "value": Raw("uniform (0 0 0)")}
    elif isinstance(defn.flow.time, d.Transient) and defn.flow.time.ramp_time > 0.0:
        # The valve opens linearly from the still domain's pressure to p0.
        tr, p_start = defn.flow.time.ramp_time, start_pressure(defn, p0)
        inlet_p = {"type": "uniformTotalPressure",
                   "p0": Raw(f"table ((0 {p_start!r}) ({tr!r} {p0!r}) ({2 * tr + 1.0!r} {p0!r}))"),
                   "psi": "thermo:psi", "gamma": g, "value": Raw(f"uniform {p_start!r}")}
        inlet_U = {"type": "pressureInletOutletVelocity", "value": Raw("uniform (0 0 0)")}
    else:
        inlet_p = {"type": "totalPressure", "p0": Raw(f"uniform {p0}"), "psi": "thermo:psi", "gamma": g,
                   "value": Raw(f"uniform {p0}")}
        inlet_U = {"type": "pressureInletOutletVelocity", "value": Raw("uniform (0 0 0)")}
    inlet = {
        "p": inlet_p,
        "T": {"type": "totalTemperature", "T0": Raw(f"uniform {T0}"), "gamma": g, "value": Raw(f"uniform {T0}")},
        "U": inlet_U,
        "k": {"type": "turbulentIntensityKineticEnergyInlet",
              "intensity": b.inlet.turbulence_intensity, "value": Raw(f"uniform {k0}")},
        "omega": {"type": "turbulentMixingLengthFrequencyInlet", "mixingLength": L_mix,
                  "value": Raw(f"uniform {omega0}")},
        "nut": {"type": "calculated", "value": Raw("uniform 0")},
        "alphat": {"type": "calculated", "value": Raw("uniform 0")},
    }

    internal = {
        "p": p_init, "T": T_init, "U": U_init,
        "k": k0, "omega": omega0, "nut": 0.0, "alphat": 0.0,
    }
    cls = {"U": "volVectorField"}
    for f in fields:
        bf = {}
        for name, kind in patches.items():
            if kind in ("wedge", "empty", "symmetryPlane"):
                bf[name] = {"type": kind}
            elif name == "inlet":
                bf[name] = inlet[f]
            elif name == "wall" or (name == "lip" and lip_wall):
                bf[name] = wall_types[f]
            elif name in ("ambient", "lip"):
                bf[name] = entrain[f]
            elif name == "outlet":
                bf[name] = outflow[f]
            else:
                raise ValueError(f"no boundary condition rule for patch {name!r}")
        write_field(case / "0" / f, f, cls.get(f, "volScalarField"), DIM[f], internal[f], bf)


# --------------------------------------------------------------------------- system


def _surface(name: str, region: tuple[str, str], operation: str, fields: list[str],
             weight: str | None = None) -> dict:
    fo = {
        "type": "surfaceFieldValue",
        "libs": ["fieldFunctionObjects"],
        "log": "false",
        "writeFields": "false",
        "regionType": region[0],
        "name": region[1],
        "operation": operation,
        "fields": fields,
        "writeControl": "timeStep",
        "writeInterval": 1,
    }
    if weight:
        fo["weightField"] = weight
    return fo


def function_objects(defn, meta, viscous, ras, exit_region, throat_region) -> dict:
    patches = meta.patches
    unstructured = meta.form is Form.UNSTRUCTURED
    fos: dict = {
        "residuals": {"type": "solverInfo", "libs": ["utilityFunctionObjects"],
                      "fields": ["p", "U", energy_field(defn)] + (["k", "omega"] if ras else []),
                      "writeResidualFields": "false"},
        "Ma": {"type": "MachNo", "libs": ["fieldFunctionObjects"],
               "executeControl": "timeStep", "writeControl": "writeTime"},
        # |U|^2 for the flux-weighted total temperature T + |U|^2 / 2 cp.
        "magSqrU": {"type": "magSqr", "libs": ["fieldFunctionObjects"], "field": "U",
                    "executeControl": "timeStep", "writeControl": "none"},
    }
    if unstructured:
        fos["pAxial"] = {"type": "exprField", "libs": ["fieldFunctionObjects"], "field": "pAxial",
                         "expression": '"vector(p, 0, 0)"', "dimensions": Raw("[1 -1 -2 0 0 0 0]"),
                         "executeControl": "timeStep", "writeControl": "none"}
    regions = {"inlet": ("patch", "inlet"), "throat": throat_region, "exit": exit_region}
    for name in ("outlet", "ambient", "lip"):
        if name in patches:
            regions[name] = ("patch", name)
    for name, reg in regions.items():
        fos[f"mdot_{name}"] = _surface(name, reg, "sum", ["phi"])
    for name in ("inlet", "exit"):
        reg = regions[name]
        fos[f"momentum_{name}"] = _surface(name, reg, "weightedSum", ["U"], weight="phi")
        # The inlet and exit planes are planar with normals along x, so the
        # area integral of p is exactly the axial pressure force.
        # (areaNormalIntegrate is for vector fields and returns 0 for p.)
        # An unstructured mesh's exit zone is a cut through its cells, not a
        # plane: there the axial force is the normal integral of p x.
        if unstructured:
            fos[f"pforce_{name}"] = _surface(name, reg, "areaNormalIntegrate", ["pAxial"])
        else:
            fos[f"pforce_{name}"] = _surface(name, reg, "areaIntegrate", ["p"])
    for name in ("throat", "exit"):
        reg = regions[name]
        fos[f"area_avg_{name}"] = _surface(name, reg, "areaAverage", ["p", "T", "Ma"])
        fos[f"mass_avg_{name}"] = _surface(name, reg, "weightedAverage", ["T", "Ma", "U", "magSqr(U)"],
                                           weight="phi")
    fos["mass_avg_inlet"] = _surface("inlet", regions["inlet"], "weightedAverage", ["T", "magSqr(U)"],
                                     weight="phi")
    # The nozzle wall only: with the inlet and exit plane it closes the
    # control volume for the thrust cross-check.
    fos["wall_force"] = {
        "type": "forces", "libs": ["forces"], "log": "false",
        "patches": ["wall"], "p": "p", "U": "U", "rho": "rho",
        "CofR": [0, 0, 0], "pRef": defn.boundaries.ambient.pressure,
        "writeControl": "timeStep", "writeInterval": 1,
    }
    if isinstance(defn.flow.time, d.Transient):
        # Mass held in the domain: with every boundary's flux it closes the
        # time-accurate balance dM/dt = sum of inflows (post.timeseries).
        fos["domain_mass"] = {"type": "volFieldValue", "libs": ["fieldFunctionObjects"], "log": "false",
                              "writeFields": "false", "regionType": "all", "operation": "volIntegrate",
                              "fields": ["rho"], "writeControl": "timeStep", "writeInterval": 1}
    if isinstance(defn.boundaries.wall_thermal, d.FixedTemperature):
        # Heat into the gas through the nozzle wall, kappa dT/dn integrated:
        # ESI's alphaEff carries Cp/Cv, so alphaEff grad(e) is kappa grad(T)
        # in the internal-energy form too. Positive into the gas.
        fos["wallHeatFlux"] = {"type": "wallHeatFlux", "libs": ["fieldFunctionObjects"],
                               "patches": ["wall"], "executeControl": "timeStep",
                               "writeControl": "writeTime"}
        fos["heat_wall"] = _surface("wall", ("patch", "wall"), "areaIntegrate", ["wallHeatFlux"])
    if viscous:
        fos["wallShearStress"] = {"type": "wallShearStress", "libs": ["fieldFunctionObjects"],
                                  "patches": ["wall"], "writeControl": "writeTime"}
        fos["yPlus"] = {"type": "yPlus", "libs": ["fieldFunctionObjects"], "writeControl": "writeTime"}
    return fos


# Iterations of rhoPimpleFoam that start a viscous rhoCentralFoam run. The
# explicit solver cannot survive the quasi-1D start where a jet meets still
# ambient air across one thin lip cell (it drove internal energy negative on
# its first step in TP-1704's nozzle); the pressure-based solver can, and a
# thousand iterations smooth the start (DESIGN.md section 11).
WARM_START_ITERATIONS = 1000


def needs_warm_start(defn: d.SimulationDefinition, summary: "CaseSummary") -> bool:
    steady = isinstance(defn.flow.time, d.Steady)
    return steady and summary.solver == CENTRAL_SOLVER and summary.viscous


def write_warm_start(case: Path, defn: d.SimulationDefinition, meta: MeshMeta,
                     summary: "CaseSummary") -> None:
    """Point the case at rhoPimpleFoam for WARM_START_ITERATIONS, writing
    the final state. Its fields (p, U, T, k, omega) are rhoCentralFoam's."""
    _rewrite_system(case, defn, meta, summary, PIMPLE_SOLVER, end=WARM_START_ITERATIONS)


def write_continuation(case: Path, defn: d.SimulationDefinition, meta: MeshMeta,
                       summary: "CaseSummary", start: int) -> None:
    """Point the case back at its own solver, continuing from ``start``."""
    _rewrite_system(case, defn, meta, summary, summary.solver, offset=start)


def _loaded_libraries(case: Path) -> list[str]:
    """The extension libraries the case's controlDict already loads."""
    import re

    f = case / "system" / "controlDict"
    m = re.search(r"^libs\s*\(([^)]*)\)", f.read_text(encoding="utf-8"), re.M) if f.is_file() else None
    return re.findall(r'"([^"]+)"', m.group(1)) if m else []


def _rewrite_system(case, defn, meta, summary, solver, end=None, offset=0):
    b = defn.boundaries
    # Keep the libraries: the thermophysics of a virial-gas case lives in one.
    _write_system(case, defn, meta, summary.viscous, summary.turbulence == d.KOmegaSST.TAG,
                  isinstance(defn.flow.time, d.Steady), summary.p0_nominal, b.ambient.pressure,
                  summary.exit_region, summary.throat_region, _loaded_libraries(case), solver,
                  end=end, offset=offset)


def _write_system(case, defn, meta, viscous, ras, steady, p0, pa, exit_region, throat_region,
                  libraries=(), solver=PIMPLE_SOLVER, end=None, offset=0):
    if isinstance(libraries, str):
        libraries = [libraries]
    libraries = list(libraries or [])
    n_max = end if end is not None else offset + iteration_limit(defn, solver)
    fos = function_objects(defn, meta, viscous, ras, exit_region, throat_region)
    if steady:
        timing = {"startFrom": "latestTime", "startTime": 0, "stopAt": "endTime",
                  "endTime": n_max, "deltaT": 1, "writeControl": "timeStep",
                  "writeInterval": min(1000, n_max), "purgeWrite": 2}
    else:
        t = defn.flow.time
        timing = {"startFrom": "latestTime", "startTime": 0, "stopAt": "endTime",
                  "endTime": t.end_time, "deltaT": 1e-9, "writeControl": "adjustableRunTime",
                  "writeInterval": t.end_time / t.frames, "purgeWrite": 0,
                  "adjustTimeStep": "yes", "maxCo": t.max_courant, "maxDeltaT": 1}
    if solver == CENTRAL_SOLVER and steady:
        # rhoCentralFoam reads its local-time-step controls from controlDict.
        # Its default smoothing (0.02) lets the time step grow only 2 % per
        # cell away from the throat, which starves the chamber of pseudo-time
        # and leaves a +-10 % inlet mass-flow oscillation undamped after 30 000
        # iterations; 1 allows a doubling per cell and damps it. At maxCo 0.2
        # the exit flux keeps a 2e-3 limit cycle; 0.1 settles it; 0.4
        # diverges. (DESIGN.md section 11.)
        timing.update({"maxCo": 0.1, "rDeltaTSmoothingCoeff": 1, "maxDeltaT": 1})
    write_dict(case / "system" / "controlDict", "controlDict", {
        "application": solver,
        **({"libs": [Raw(f'"{lib}"') for lib in libraries]} if libraries else {}),
        **timing,
        "writeFormat": "ascii",
        "writePrecision": 12,
        "writeCompression": "off",
        "timeFormat": "general",
        "timePrecision": 8,
        "runTimeModifiable": "true",
        "functions": fos,
    }, location="system")

    if solver == CENTRAL_SOLVER:
        _write_central_numerics(case, ras, steady)
    else:
        # Snapped cells beside a curved wall (thin, determinant ~0.02) do
        # not survive the quasi-1D start at the structured meshes' Courant
        # number: p fell to its floor on the first iteration at 0.5 and not at
        # 0.3 (DESIGN.md section 14).
        max_co = 0.25 if meta.form is Form.UNSTRUCTURED else 0.5
        _write_pimple_numerics(case, ras, steady, p0, energy_field(defn), max_co,
                               grad=gradient_scheme(meta))
    write_dict(case / "system" / "decomposeParDict", "decomposeParDict", {
        "numberOfSubdomains": max(1, defn.numerics.processors),
        "method": "scotch",
    }, location="system")


# Gauss gradients are inconsistent on irregular polyhedra: on cfMesh's
# core-to-wall transition cells they put V1's inviscid mass flow 0.93 %
# high, least squares 0.69 % (DESIGN.md section 15), and cfMesh has been
# verified with least squares since (V17). On snappyHexMesh's hex-dominant
# mesh least squares costs instead: V14's Cd read -0.42 % against -0.06 %
# with Gauss (finding 70). Each mesher keeps the scheme it was verified
# with; structured meshes keep Gauss.
STRUCTURED_GRAD = "cellLimited Gauss linear 1"
UNSTRUCTURED_GRAD = "cellLimited leastSquares 1"
GAUSS_MESHERS = ("snappyHexMesh",)


def gradient_scheme(meta: MeshMeta) -> str:
    if meta.form is Form.UNSTRUCTURED and meta.mesher not in GAUSS_MESHERS:
        return UNSTRUCTURED_GRAD
    return STRUCTURED_GRAD


def _write_pimple_numerics(case, ras, steady, p0, he="e", max_co=0.5, grad=STRUCTURED_GRAD):
    turb_div = ({"div(phi,k)": Raw("Gauss linearUpwind grad(k)"),
                 "div(phi,omega)": Raw("Gauss linearUpwind grad(omega)")} if ras else {})
    write_dict(case / "system" / "fvSchemes", "fvSchemes", {
        "ddtSchemes": {"default": "localEuler" if steady else "Euler"},
        "gradSchemes": {"default": Raw(grad)},
        "divSchemes": {
            "default": "none",
            "div(phi,U)": Raw("Gauss linearUpwindV grad(U)"),
            f"div(phi,{he})": Raw(f"Gauss linearUpwind grad({he})"),
            "div(phi,K)": Raw("Gauss linear"),
            "div(phid,p)": Raw("Gauss limitedLinear 1"),
            "div(phiv,p)": Raw("Gauss linear"),
            **turb_div,
            "div(((rho*nuEff)*dev2(T(grad(U)))))": Raw("Gauss linear"),
        },
        "laplacianSchemes": {"default": Raw("Gauss linear limited corrected 0.5")},
        "interpolationSchemes": {"default": "linear"},
        "snGradSchemes": {"default": Raw("limited corrected 0.5")},
        "wallDist": {"method": "meshWave"},
    }, location="system")

    p_min = _p_min(p0)
    solvers = {
        '"(rho|rhoFinal)"': {"solver": "diagonal"},
        '"(p|pFinal)"': {"solver": "GAMG", "smoother": "GaussSeidel", "tolerance": 1e-12,
                         "relTol": 0.01},
        '"(U|e|h|k|omega)(|Final)"': {"solver": "smoothSolver", "smoother": "symGaussSeidel",
                                   "tolerance": 1e-12, "relTol": 0.01},
    }
    pimple = {"nOuterCorrectors": 1, "nCorrectors": 2, "nNonOrthogonalCorrectors": 0,
              "transonic": "yes", "pMin": p_min, "pMax": 2.0 * p0}
    if steady:
        pimple.update({"maxCo": max_co, "rDeltaTSmoothingCoeff": 0.1, "rDeltaTDampingCoeff": 1,
                       "maxDeltaT": 1})
    else:
        solvers['"(p|pFinal)"']["relTol"] = 0
        pimple["nOuterCorrectors"] = 2
    write_dict(case / "system" / "fvSolution", "fvSolution", {
        "solvers": solvers,
        "PIMPLE": pimple,
        "relaxationFactors": {"equations": {'".*"': 1}},
    }, location="system")


def _write_central_numerics(case, ras, steady):
    """rhoCentralFoam: density-based, Kurganov-Tadmor central-upwind fluxes
    with TVD (van Leer) reconstruction. Its energy equation carries the
    viscous work itself, so it needs no extension."""
    turb_div = ({"div(phi,k)": Raw("Gauss linearUpwind grad(k)"),
                 "div(phi,omega)": Raw("Gauss linearUpwind grad(omega)")} if ras else {})
    write_dict(case / "system" / "fvSchemes", "fvSchemes", {
        "fluxScheme": "Kurganov",
        "ddtSchemes": {"default": "localEuler" if steady else "Euler"},
        # k and omega are convected with linearUpwind; their gradients must be
        # limited, or omega (~1/y^2 near a wall) overshoots and diverges within
        # ten iterations (DESIGN.md section 11).
        "gradSchemes": {"default": Raw("Gauss linear"),
                        **({"grad(k)": Raw("cellLimited Gauss linear 1"),
                            "grad(omega)": Raw("cellLimited Gauss linear 1")} if ras else {})},
        "divSchemes": {
            "default": "none",
            "div(tauMC)": Raw("Gauss linear"),
            **turb_div,
        },
        "laplacianSchemes": {"default": Raw("Gauss linear corrected")},
        "interpolationSchemes": {
            "default": "linear",
            "reconstruct(rho)": "vanLeer",
            "reconstruct(U)": "vanLeerV",
            "reconstruct(T)": "vanLeer",
        },
        "snGradSchemes": {"default": "corrected"},
        "wallDist": {"method": "meshWave"},
    }, location="system")
    write_dict(case / "system" / "fvSolution", "fvSolution", {
        "solvers": {
            '"(rho|rhoU|rhoE)"': {"solver": "diagonal"},
            '"(U|e|k|omega)"': {"solver": "smoothSolver", "smoother": "GaussSeidel",
                               "nSweeps": 2, "tolerance": 1e-12, "relTol": 0.01},
        },
    }, location="system")


def _p_min(p0: float) -> float:
    return max(1.0, 1e-4 * p0)


def request_stop(case: Path) -> None:
    """Ask a running solver to write and stop at the next time step."""
    path = case / "system" / "controlDict"
    text = path.read_text(encoding="utf-8")
    text = text.replace("stopAt          endTime;", "stopAt          writeNow;")
    path.write_text(text, encoding="utf-8", newline="\n")


def clear_stop(case: Path) -> None:
    """Undo :func:`request_stop` (resuming a run that was stopped)."""
    path = case / "system" / "controlDict"
    text = path.read_text(encoding="utf-8")
    text = text.replace("stopAt          writeNow;", "stopAt          endTime;")
    path.write_text(text, encoding="utf-8", newline="\n")


def set_non_orthogonal_correctors(case: Path, n: int) -> None:
    path = case / "system" / "fvSolution"
    text = path.read_text(encoding="utf-8")
    text = text.replace("nNonOrthogonalCorrectors 0;", f"nNonOrthogonalCorrectors {n};")
    path.write_text(text, encoding="utf-8", newline="\n")
