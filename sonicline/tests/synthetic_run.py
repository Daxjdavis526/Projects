"""A run directory without running OpenFOAM: the case builder writes the
quasi-1D initial fields into 0/, and those serve as the "results". Exact and
deterministic, so results views and images can be checked anywhere."""

import json
from pathlib import Path

import numpy as np

from sonicline import verification
from sonicline.core import model as m
from sonicline.core.validate import resolve_profile
from sonicline.foam import parse
from sonicline.foam.case import build_case
from sonicline.mesh import revolved, sizing
from sonicline.post import results


def make(run_dir: Path, quality: str = "coarse") -> tuple[m.SimulationDefinition, object]:
    defn = verification.CASES["V1"].definition(quality, "wedge")
    prof = resolve_profile(defn)
    mesh, meta = revolved.build(prof, sizing.spec_for(defn, prof))
    run_dir.mkdir(parents=True, exist_ok=True)
    summary = build_case(run_dir / "case", defn, prof, mesh, meta)
    m.save(defn, run_dir / "definition.json")
    (run_dir / "mesh_meta.json").write_text(json.dumps(meta.to_json()))
    zero = run_dir / "case" / "0"
    fields = results.FieldData("0", parse.read_field(zero / "p")[0], parse.read_field(zero / "T")[0],
                               parse.read_field(zero / "U")[0].reshape(-1, 3), None, None, None)
    (run_dir / "profiles.json").write_text(json.dumps(results.axial_profiles(fields, meta, mesh.cell_centres)))
    (run_dir / "manifest.json").write_text(json.dumps({"status": "completed", "trust": "trusted",
                                                       "runner": {"openfoam": "synthetic"}}))
    (run_dir / "metrics.json").write_text(json.dumps({
        "mass_flow": {"inlet": 7.16e-3, "ideal": 7.208e-3, "imbalance_inlet_exit": 0.0},
        "discharge_coefficient": {"cfd": 0.9934, "kliegel_levine": 0.9940},
        "thrust": {"total": 4.94, "ideal": 5.05, "momentum": 4.64, "pressure": 0.30,
                   "control_volume_disagreement": 0.0},
        "specific_impulse": {"cfd": 70.3, "ideal": 71.5},
        "exit": {"mach_mass_avg": 3.36, "p_area_avg": 15000.0, "ideal": {"mach": 3.41, "p": 14900.0}},
        "throat": {"mach_area_avg": 1.0},
        "verdict": {"trust": "trusted", "reasons": [], "warnings": []},
        "solver": "rhoPimpleFoam", "convergence": {"iterations": 0},
    }))
    return defn, summary


def q1d_mach(defn, x: np.ndarray) -> np.ndarray:
    from sonicline.core.theory import quasi1d

    prof = resolve_profile(defn)
    inlet = defn.boundaries.inlet
    sol = quasi1d.solve(prof, defn.gas.model(), inlet.p0, inlet.T0, defn.boundaries.ambient.pressure, list(x))
    return np.array([s.mach for s in sol.stations])
