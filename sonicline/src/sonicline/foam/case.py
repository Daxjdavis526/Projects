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
from ..core.theory import quasi1d
from ..mesh.polymesh import PolyMesh
from ..mesh.revolved import Form, MeshMeta
from . import polymesh_io
from .dictwriter import Raw, write_dict, write_field

SOLVER = "rhoPimpleFoam"

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
    sector_factor: float  # multiply wedge integrals by this for the full nozzle
    exit_region: tuple[str, str]  # ("faceZone"|"patch", name) of the exit plane
    throat_region: tuple[str, str]
    exit_area: float  # full-revolution exit area from the mesh, m^2
    throat_area: float
    inlet_area: float
    initial: quasi1d.Quasi1DSolution
    p_min_limit: float  # the solver's pressure floor; cells at it are clamped


def _region(meta: MeshMeta, mesh: PolyMesh, which: str) -> tuple[str, str]:
    if which in mesh.face_zones:
        return ("faceZone", which)
    if which == "throat" and "exit" in mesh.face_zones:
        return ("faceZone", "exit")  # converging-only nozzle: throat is the exit
    return ("patch", "outlet")


def _zone_area(mesh: PolyMesh, region: tuple[str, str]) -> float:
    kind, name = region
    faces = mesh.face_zones[name][0] if kind == "faceZone" else mesh.patch_faces(name)
    pts = mesh.points
    f = mesh.faces[faces]
    total = 0.0
    for row in f:
        v = pts[row[row >= 0]]
        n = np.zeros(3)
        for i in range(len(v)):
            n += np.cross(v[i], v[(i + 1) % len(v)])
        total += 0.5 * abs(n[0])
    return total


def build_case(
    case: Path,
    defn: d.SimulationDefinition,
    profile: Profile,
    mesh: PolyMesh,
    meta: MeshMeta,
) -> CaseSummary:
    gas = defn.gas.model()
    b = defn.boundaries
    if not isinstance(b.inlet, d.ReservoirInlet):
        raise NotImplementedError("the mass-flow inlet arrives in M5; use a reservoir inlet")
    turb = defn.flow.turbulence
    viscous = not isinstance(turb, d.Inviscid)
    ras = isinstance(turb, d.KOmegaSST)
    steady = isinstance(defn.flow.time, d.Steady)

    case.mkdir(parents=True, exist_ok=True)
    polymesh_io.write(mesh, case)
    fields = ["p", "T", "U"] + (["k", "omega", "nut", "alphat"] if ras else [])

    # --- initial state from quasi-1D theory ---------------------------------
    p0, T0 = b.inlet.p0, b.inlet.T0
    pa, Ta = b.ambient.pressure, b.ambient.temperature
    centres = mesh.cell_centres
    xs_unique = np.unique(np.round(centres[:, 0], 12))
    xs_nozzle = [x for x in xs_unique if x <= profile.x_exit]
    q1d = quasi1d.solve(profile, gas, p0, T0, pa, xs_nozzle)
    table = {round(s.x, 12): s for s in q1d.stations}
    exit_state = q1d.stations[-1]
    r_cell = np.hypot(centres[:, 1], centres[:, 2])
    p_init = np.empty(len(centres))
    T_init = np.empty(len(centres))
    U_init = np.zeros((len(centres), 3))
    for c, (x, r) in enumerate(zip(np.round(centres[:, 0], 12), r_cell)):
        if x <= profile.x_exit:
            s = table[x]
            p_init[c], T_init[c], U_init[c, 0] = s.pressure, s.temperature, s.velocity
        elif r <= profile.exit_radius:  # jet core, carried unchanged into the plume
            p_init[c], T_init[c], U_init[c, 0] = exit_state.pressure, exit_state.temperature, exit_state.velocity
        else:
            p_init[c], T_init[c] = max(pa, 1e-3 * p0), Ta
    if pa <= 0.0:
        p_init = np.maximum(p_init, 1e-4 * p0)

    # Turbulence inlet state and a matching initial field.
    u_in = q1d.stations[0].velocity
    D_in = 2.0 * profile.inlet_radius
    L_mix = b.inlet.turbulence_length_fraction * D_in
    k0 = max(1.5 * (b.inlet.turbulence_intensity * u_in) ** 2, 1e-6)
    omega0 = math.sqrt(k0) / (0.09**0.25 * L_mix)
    k_amb, omega_amb = k0, omega0

    _write_constant(case, gas, viscous, ras)
    _write_fields(case, defn, meta, profile.exit_radius, fields, p_init, T_init, U_init,
                  k0, omega0, k_amb, omega_amb, L_mix)
    exit_region = _region(meta, mesh, "exit")
    throat_region = _region(meta, mesh, "throat")
    _write_system(case, defn, meta, viscous, ras, steady, p0, pa, exit_region, throat_region)

    # A wedge of angle theta has flat (chord) faces: its cross-section is
    # r^2 sin(theta)/2, not r^2 theta/2. Scaling by 2 pi / sin(theta) makes
    # the scaled face areas -- and so every flux integral -- exact.
    sector = 2.0 * math.pi / math.sin(defn.mesh.wedge_angle) if meta.form is Form.WEDGE else 1.0
    (case / "case.foam").write_text("", encoding="utf-8")
    return CaseSummary(
        path=case, solver=SOLVER, viscous=viscous,
        turbulence=type(turb).TAG, fields=tuple(fields), sector_factor=sector,
        exit_region=exit_region, throat_region=throat_region,
        exit_area=_zone_area(mesh, exit_region) * sector,
        throat_area=_zone_area(mesh, throat_region) * sector,
        inlet_area=_zone_area(mesh, ("patch", "inlet")) * sector,
        initial=q1d,
        p_min_limit=_p_min(p0),
    )


# --------------------------------------------------------------------------- constant


def _write_constant(case: Path, gas: PerfectGas, viscous: bool, ras: bool) -> None:
    transport = ({"As": gas.sutherland_As, "Ts": gas.sutherland_Ts} if viscous
                 else {"mu": 0, "Pr": 0.71})
    write_dict(case / "constant" / "thermophysicalProperties", "thermophysicalProperties", {
        "thermoType": {
            "type": "hePsiThermo",
            "mixture": "pureMixture",
            "transport": "sutherland" if viscous else "const",
            "thermo": "hConst",
            "equationOfState": "perfectGas",
            "specie": "specie",
            "energy": "sensibleInternalEnergy",
        },
        "mixture": {
            "specie": {"molWeight": gas.molar_mass},
            "thermodynamics": {"Cp": gas.cp, "Hf": 0},
            "transport": transport,
        },
    }, location="constant")
    # Known limitation (DESIGN.md section 10, finding 12): rhoPimpleFoam's
    # energy equation is in total-energy form (it carries K) but has no
    # viscous-work term div(tau & U), so friction never heats the gas and an
    # adiabatic wall recovers ~40 % of the dynamic temperature instead of
    # ~85-90 %. ESI's viscousDissipation source is not the fix: it adds
    # tau:grad(U), correct only for an internal-energy equation, and
    # over-heats the wall past T0. Thrust and mass flow move by ~0.1 %
    # between the two; the verdict says so on every viscous run.
    body: dict = {"simulationType": "RAS" if ras else "laminar"}
    if ras:
        body["RAS"] = {"RASModel": "kOmegaSST", "turbulence": "on", "printCoeffs": "on"}
    write_dict(case / "constant" / "turbulenceProperties", "turbulenceProperties", body,
               location="constant")


# --------------------------------------------------------------------------- 0/


def _write_fields(case, defn, meta, exit_radius, fields, p_init, T_init, U_init,
                  k0, omega0, k_amb, omega_amb, L_mix):
    b = defn.boundaries
    g = defn.gas.model().gamma
    turb = defn.flow.turbulence
    viscous = not isinstance(turb, d.Inviscid)
    pa, Ta = b.ambient.pressure, b.ambient.temperature
    p0, T0 = b.inlet.p0, b.inlet.T0
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

    wall_types = {
        "U": {"type": "noSlip"} if viscous else {"type": "slip"},
        "p": {"type": "zeroGradient"},
        "T": ({"type": "fixedValue", "value": Raw(f"uniform {fixed_wall_T}")}
              if fixed_wall_T else {"type": "zeroGradient"}),
        "k": {"type": "kqRWallFunction", "value": Raw(f"uniform {k0}")},
        "omega": {"type": "omegaWallFunction", "value": Raw(f"uniform {omega0}")},
        "nut": {"type": "nutLowReWallFunction", "value": Raw("uniform 0")},
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
    inlet = {
        "p": {"type": "totalPressure", "p0": Raw(f"uniform {p0}"), "psi": "thermo:psi", "gamma": g,
              "value": Raw(f"uniform {p0}")},
        "T": {"type": "totalTemperature", "T0": Raw(f"uniform {T0}"), "gamma": g, "value": Raw(f"uniform {T0}")},
        "U": {"type": "pressureInletOutletVelocity", "value": Raw("uniform (0 0 0)")},
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
            if kind == "wedge":
                bf[name] = {"type": "wedge"}
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
    fos: dict = {
        "residuals": {"type": "solverInfo", "libs": ["utilityFunctionObjects"],
                      "fields": ["p", "U", "e"] + (["k", "omega"] if ras else []),
                      "writeResidualFields": "false"},
        "Ma": {"type": "MachNo", "libs": ["fieldFunctionObjects"],
               "executeControl": "timeStep", "writeControl": "writeTime"},
    }
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
        fos[f"pforce_{name}"] = _surface(name, reg, "areaIntegrate", ["p"])
    for name in ("throat", "exit"):
        reg = regions[name]
        fos[f"area_avg_{name}"] = _surface(name, reg, "areaAverage", ["p", "T", "Ma"])
        fos[f"mass_avg_{name}"] = _surface(name, reg, "weightedAverage", ["T", "Ma", "U"], weight="phi")
    # The nozzle wall only: with the inlet and exit plane it closes the
    # control volume for the thrust cross-check.
    fos["wall_force"] = {
        "type": "forces", "libs": ["forces"], "log": "false",
        "patches": ["wall"], "p": "p", "U": "U", "rho": "rho",
        "CofR": [0, 0, 0], "pRef": defn.boundaries.ambient.pressure,
        "writeControl": "timeStep", "writeInterval": 1,
    }
    if viscous:
        fos["wallShearStress"] = {"type": "wallShearStress", "libs": ["fieldFunctionObjects"],
                                  "patches": ["wall"], "writeControl": "writeTime"}
        fos["yPlus"] = {"type": "yPlus", "libs": ["fieldFunctionObjects"], "writeControl": "writeTime"}
    return fos


def _write_system(case, defn, meta, viscous, ras, steady, p0, pa, exit_region, throat_region):
    conv = defn.numerics.convergence
    fos = function_objects(defn, meta, viscous, ras, exit_region, throat_region)
    if steady:
        timing = {"startFrom": "latestTime", "startTime": 0, "stopAt": "endTime",
                  "endTime": conv.max_iterations, "deltaT": 1, "writeControl": "timeStep",
                  "writeInterval": min(1000, conv.max_iterations), "purgeWrite": 2}
    else:
        t = defn.flow.time
        timing = {"startFrom": "latestTime", "startTime": 0, "stopAt": "endTime",
                  "endTime": t.end_time, "deltaT": 1e-9, "writeControl": "adjustableRunTime",
                  "writeInterval": t.end_time / 20, "purgeWrite": 0,
                  "adjustTimeStep": "yes", "maxCo": t.max_courant, "maxDeltaT": 1}
    write_dict(case / "system" / "controlDict", "controlDict", {
        "application": SOLVER,
        **timing,
        "writeFormat": "ascii",
        "writePrecision": 12,
        "writeCompression": "off",
        "timeFormat": "general",
        "timePrecision": 8,
        "runTimeModifiable": "true",
        "functions": fos,
    }, location="system")

    turb_div = ({"div(phi,k)": Raw("Gauss linearUpwind grad(k)"),
                 "div(phi,omega)": Raw("Gauss linearUpwind grad(omega)")} if ras else {})
    write_dict(case / "system" / "fvSchemes", "fvSchemes", {
        "ddtSchemes": {"default": "localEuler" if steady else "Euler"},
        "gradSchemes": {"default": Raw("cellLimited Gauss linear 1")},
        "divSchemes": {
            "default": "none",
            "div(phi,U)": Raw("Gauss linearUpwindV grad(U)"),
            "div(phi,e)": Raw("Gauss linearUpwind grad(e)"),
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
        '"(U|e|k|omega)(|Final)"': {"solver": "smoothSolver", "smoother": "symGaussSeidel",
                                   "tolerance": 1e-12, "relTol": 0.01},
    }
    pimple = {"nOuterCorrectors": 1, "nCorrectors": 2, "nNonOrthogonalCorrectors": 0,
              "transonic": "yes", "pMin": p_min, "pMax": 2.0 * p0}
    if steady:
        pimple.update({"maxCo": 0.5, "rDeltaTSmoothingCoeff": 0.1, "rDeltaTDampingCoeff": 1,
                       "maxDeltaT": 1})
    else:
        solvers['"(p|pFinal)"']["relTol"] = 0
        pimple["nOuterCorrectors"] = 2
    write_dict(case / "system" / "fvSolution", "fvSolution", {
        "solvers": solvers,
        "PIMPLE": pimple,
        "relaxationFactors": {"equations": {'".*"': 1}},
    }, location="system")
    write_dict(case / "system" / "decomposeParDict", "decomposeParDict", {
        "numberOfSubdomains": max(1, defn.numerics.processors),
        "method": "scotch",
    }, location="system")


def _p_min(p0: float) -> float:
    return max(1.0, 1e-4 * p0)


def request_stop(case: Path) -> None:
    """Ask a running solver to write and stop at the next time step."""
    path = case / "system" / "controlDict"
    text = path.read_text(encoding="utf-8")
    text = text.replace("stopAt          endTime;", "stopAt          writeNow;")
    path.write_text(text, encoding="utf-8", newline="\n")


def set_non_orthogonal_correctors(case: Path, n: int) -> None:
    path = case / "system" / "fvSolution"
    text = path.read_text(encoding="utf-8")
    text = text.replace("nNonOrthogonalCorrectors 0;", f"nNonOrthogonalCorrectors {n};")
    path.write_text(text, encoding="utf-8", newline="\n")
