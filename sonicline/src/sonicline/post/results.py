"""Turn a finished case into numbers: surface integrals from the solver's own
face fluxes, field extremes, and axial profiles along the axis and wall.

Integrals are never recomputed from reconstructed face values of p, T and
U: in the design spike that produced a false 0.13 % mass imbalance which
the flux-based function object did not show. Everything here reads what
the solver itself integrated.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from ..foam import parse
from ..foam.case import CaseSummary
from ..mesh.revolved import MeshMeta

FUNCTION_OBJECTS = (
    "residuals", "mdot_inlet", "mdot_throat", "mdot_exit", "mdot_outlet", "mdot_ambient",
    "mdot_lip", "momentum_inlet", "momentum_exit", "pforce_inlet", "pforce_exit",
    "area_avg_throat", "area_avg_exit", "mass_avg_inlet", "mass_avg_throat", "mass_avg_exit",
    "wall_force",
)


_FILES = {"wall_force": "force.dat"}


def read_tables(case: Path) -> dict[str, parse.Table | None]:
    return {name: parse.read_table(case / "postProcessing" / name, _FILES.get(name))
            for name in FUNCTION_OBJECTS}


def _final(table: parse.Table | None, column: str, window: int | None = None):
    """Mean over the last ``window`` rows (vectors component-wise); by
    default the last tenth of the run, between 100 and 1000 iterations, so
    a slowly oscillating flow (a subsonic jet) is averaged over its cycles
    rather than read at one phase."""
    if table is None or column not in table.values:
        return None
    v = table.values[column]
    n = window or max(100, min(1000, len(v) // 10))  # see run.convergence.judgement_window
    return v[-n:].mean(axis=0)


@dataclass
class Integrals:
    """Full-revolution surface integrals at the end of the run (SI)."""

    mdot_inlet: float
    mdot_throat: float
    mdot_exit: float
    mdot_outlet: float | None
    mdot_entrained: float | None  # through the ambient and lip boundaries, net inflow positive
    exit_momentum: float  # sum(phi U_x) over the exit plane
    exit_pressure_force: float  # sum(p |S|) over the exit plane
    inlet_momentum: float  # sum(phi U_x) over the inlet (negative: inflow)
    inlet_pressure_force: float  # sum(p |S|) over the inlet
    wall_force_x: float  # axial force of the gas on the nozzle wall, p measured from ambient
    wall_force_viscous_x: float
    throat_area_avg: dict[str, float]
    throat_mass_avg: dict[str, float]
    exit_area_avg: dict[str, float]
    exit_mass_avg: dict[str, float]
    inlet_mass_avg: dict[str, float]


def integrals(tables: dict, summary: CaseSummary) -> Integrals:
    k = summary.sector_factor

    def scaled(name, column, sign=1.0):
        v = _final(tables.get(name), column)
        return None if v is None else sign * k * v

    def averages(name, cols):
        t = tables.get(name)
        out = {}
        for c in cols:
            v = _final(t, c)
            if v is None:
                continue
            key = c[c.index("(") + 1 : -1]
            out[key] = float(v[0]) if np.ndim(v) else float(v)
        return out

    entrained = None
    for name in ("mdot_ambient", "mdot_lip"):
        v = scaled(name, "sum(phi)", -1.0)
        if v is not None:
            entrained = (entrained or 0.0) + v
    wf = tables.get("wall_force")
    return Integrals(
        mdot_inlet=scaled("mdot_inlet", "sum(phi)", -1.0),
        mdot_throat=scaled("mdot_throat", "sum(phi)"),
        mdot_exit=scaled("mdot_exit", "sum(phi)"),
        mdot_outlet=scaled("mdot_outlet", "sum(phi)"),
        mdot_entrained=entrained,
        exit_momentum=float(scaled("momentum_exit", "weightedSum(U)")[0]),
        exit_pressure_force=scaled("pforce_exit", "areaIntegrate(p)"),
        inlet_momentum=float(scaled("momentum_inlet", "weightedSum(U)")[0]),
        inlet_pressure_force=scaled("pforce_inlet", "areaIntegrate(p)"),
        wall_force_x=k * float(_final(wf, "total_x")) if wf is not None else math.nan,
        wall_force_viscous_x=k * float(_final(wf, "viscous_x")) if wf is not None else math.nan,
        throat_area_avg=averages("area_avg_throat", ["areaAverage(p)", "areaAverage(T)", "areaAverage(Ma)"]),
        throat_mass_avg=averages("mass_avg_throat", ["weightedAverage(T)", "weightedAverage(Ma)",
                                                      "weightedAverage(U)", "weightedAverage(magSqr(U))"]),
        exit_area_avg=averages("area_avg_exit", ["areaAverage(p)", "areaAverage(T)", "areaAverage(Ma)"]),
        exit_mass_avg=averages("mass_avg_exit", ["weightedAverage(T)", "weightedAverage(Ma)",
                                                  "weightedAverage(U)", "weightedAverage(magSqr(U))"]),
        inlet_mass_avg=averages("mass_avg_inlet", ["weightedAverage(T)", "weightedAverage(magSqr(U))"]),
    )


@dataclass
class FieldData:
    time: str
    p: np.ndarray
    T: np.ndarray
    U: np.ndarray
    Ma: np.ndarray | None
    wall_shear: np.ndarray | None  # on the wall patch, (n, 3)
    y_plus: np.ndarray | None  # on the wall patch


def read_fields(case: Path) -> FieldData | None:
    t = parse.latest_time(case)
    if t is None:
        return None
    d = case / t

    def internal(name):
        f = d / name
        return parse.read_field(f)[0] if f.is_file() else None

    def on_wall(name):
        f = d / name
        return parse.read_field(f)[1].get("wall") if f.is_file() else None

    U = internal("U")
    return FieldData(t, internal("p"), internal("T"), U.reshape(-1, 3), internal("Ma"),
                     on_wall("wallShearStress"), on_wall("yPlus"))


def extremes(fields: FieldData, centres: np.ndarray, x_exit: float, p_floor: float | None = None) -> dict:
    speed = np.linalg.norm(fields.U, axis=1)
    inside = centres[:, 0] <= x_exit + 1e-12

    def stats(mask):
        out = {
            "p_min": float(fields.p[mask].min()), "p_max": float(fields.p[mask].max()),
            "T_min": float(fields.T[mask].min()), "T_max": float(fields.T[mask].max()),
            "speed_max": float(speed[mask].max()),
        }
        if fields.Ma is not None:
            out["mach_max"] = float(fields.Ma[mask].max())
        return out

    result = {"nozzle": stats(inside), "cells_at_pressure_floor": None}
    if not inside.all():
        result["domain"] = stats(np.ones_like(inside))
    if p_floor is not None:
        result["cells_at_pressure_floor"] = int((fields.p <= 1.01 * p_floor).sum())
    return result


def axial_profiles(fields: FieldData, meta: MeshMeta, centres: np.ndarray) -> dict:
    """Mean values over the axis cells and along one wall-adjacent row."""
    def gather(cell_lists):
        x, p, T, u, ma = [], [], [], [], []
        for cells in cell_lists:
            c = np.asarray(cells)
            x.append(float(centres[c, 0].mean()))
            p.append(float(fields.p[c].mean()))
            T.append(float(fields.T[c].mean()))
            u.append(float(fields.U[c, 0].mean()))
            if fields.Ma is not None:
                ma.append(float(fields.Ma[c].mean()))
        return {"x": x, "p": p, "T": T, "u": u, "mach": ma}

    return {"centreline": gather(meta.centreline_cells),
            "wall": gather([[c] for c in meta.wall_cells])}
