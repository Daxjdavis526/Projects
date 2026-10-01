"""Grid-convergence study: one definition on three systematically refined
meshes, and the Grid Convergence Index of each engineering quantity.

The definition's own mesh is the coarsest; the others divide every cell
size by ``ratio`` and ``ratio**2`` (MeshSpec.refinement). Celik et al.
(2008) ask for ratios of at least 1.3; the default is sqrt(2), which
doubles the cell count of a wedge at each level.

A study is only as good as its runs: if any level is not converged or not
trustworthy, the GCI is reported but marked invalid.
"""

from __future__ import annotations

import dataclasses
import json
import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from ..core import gci
from ..core import model as d
from . import pipeline

# (label, path into metrics.json)
QUANTITIES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("mass flow [kg/s]", ("mass_flow", "inlet")),
    ("discharge coefficient", ("discharge_coefficient", "cfd")),
    ("thrust [N]", ("thrust", "total")),
    ("specific impulse [s]", ("specific_impulse", "cfd")),
    ("exit Mach (mass-averaged)", ("exit", "mach_mass_avg")),
)

DEFAULT_RATIO = math.sqrt(2.0)


@dataclass
class QuantityStudy:
    name: str
    result: gci.GridStudy | None
    coarse_error: float | None = None  # |phi_3 - phi_ext| / |phi_ext|: error of the base mesh


@dataclass
class StudyResult:
    run_dirs: list[str]
    cells: list[int]
    refinements: list[float]
    trust: list[str]
    valid: bool
    quantities: list[QuantityStudy] = field(default_factory=list)

    def quantity(self, name: str) -> QuantityStudy:
        return next(q for q in self.quantities if q.name == name)


def _get(metrics: dict, path: tuple[str, ...]):
    for k in path:
        if not isinstance(metrics, dict) or k not in metrics:
            return None
        metrics = metrics[k]
    return metrics


def run(defn: d.SimulationDefinition, out: Path, ratio: float = DEFAULT_RATIO,
        on_event: Callable | None = None, base_dir: Path | None = None,
        runner: Callable = pipeline.run) -> StudyResult:
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    base = defn.mesh.refinement
    levels = [base * ratio**2, base * ratio, base]  # finest first, as Celik orders them
    results = []
    for k, ref in enumerate(levels):
        level = dataclasses.replace(defn, mesh=dataclasses.replace(defn.mesh, refinement=ref))
        run_dir = out / f"level{3 - k}-x{ref:.3f}"
        results.append(runner(level, run_dir, on_event=on_event, render=False, base_dir=base_dir))

    cells = []
    for r in results:
        report = Path(r.run_dir) / "mesh_report.json"
        cells.append(json.loads(report.read_text(encoding="utf-8"))["cells"] if report.is_file() else 0)
    trust = [r.trust for r in results]
    valid = all(r.status == "completed" and r.trust != "not_trustworthy" and r.metrics
                for r in results) and all(cells)
    study = StudyResult([str(r.run_dir) for r in results], cells, levels, trust, valid)
    if valid:
        dims = 2 if defn.mesh.form in (d.MeshForm.WEDGE, d.MeshForm.PLANAR) else 3
        # The domain is the same at every level, so its size cancels in the ratios.
        hs = tuple(gci.representative_spacing(n, 1.0, dims) for n in cells)
        for name, path in QUANTITIES:
            vals = [_get(r.metrics, path) for r in results]
            if any(v is None for v in vals):
                study.quantities.append(QuantityStudy(name, None))
                continue
            g = gci.study(tuple(float(v) for v in vals), hs)
            coarse = (abs(vals[2] - g.extrapolated) / abs(g.extrapolated)
                      if g.extrapolated else None)
            study.quantities.append(QuantityStudy(name, g, coarse))
        _measured_uncertainty(defn, results[2], study)
    (out / "study.json").write_text(json.dumps(dataclasses.asdict(study), indent=2) + "\n",
                                    encoding="utf-8")
    (out / "study.md").write_text(markdown(study), encoding="utf-8")
    return study


UNCERTAINTY_KEYS = {"mass flow [kg/s]": "mass_flow", "thrust [N]": "thrust",
                    "specific impulse [s]": "specific_impulse"}


def _measured_uncertainty(defn: d.SimulationDefinition, base, study: StudyResult) -> None:
    """Rewrite the base run's uncertainty budget with the discretisation
    error this study measured (its GCI-based base-mesh error) in place of
    the verification estimate."""
    from ..core import uncertainty
    from ..core.profile import from_points
    from ..core.validate import resolve_profile

    measured = {UNCERTAINTY_KEYS[q.name]: q.coarse_error for q in study.quantities
                if q.name in UNCERTAINTY_KEYS and q.coarse_error is not None}
    run_dir = Path(base.run_dir)
    f = run_dir / "metrics.json"
    if not measured or not f.is_file():
        return
    metrics = json.loads(f.read_text(encoding="utf-8"))
    profile = resolve_profile(defn)
    pf = run_dir / "profile.json"
    if profile is None and pf.is_file():
        profile = from_points([tuple(p) for p in json.loads(pf.read_text(encoding="utf-8"))["points"]])
    metrics["uncertainty"] = uncertainty.to_json(uncertainty.budgets(defn, profile, metrics, measured))
    pipeline._write_json(f, metrics)


def markdown(s: StudyResult) -> str:
    lines = ["Grid convergence study (Celik et al. 2008)", "",
             "| level | refinement | cells | verdict |", "|---|---|---|---|"]
    for k, (ref, n, t) in enumerate(zip(s.refinements, s.cells, s.trust)):
        lines.append(f"| {'fine' if k == 0 else 'medium' if k == 1 else 'base'} | {ref:.3f} | {n} | {t} |")
    lines.append("")
    if not s.valid:
        lines.append("**Not valid:** a level did not complete or is not trustworthy; no GCI is given.")
        return "\n".join(lines) + "\n"
    lines += ["| quantity | fine | medium | base | order p | convergence | extrapolated | "
              "GCI fine | base-mesh error |", "|---|---|---|---|---|---|---|---|---|"]
    for q in s.quantities:
        g = q.result
        if g is None:
            lines.append(f"| {q.name} | n/a | | | | | | | |")
            continue
        f = lambda v: "—" if v is None else f"{v:.6g}"  # noqa: E731
        pct = lambda v: "—" if v is None else f"{100 * v:.3f} %"  # noqa: E731
        lines.append(f"| {q.name} | {f(g.values[0])} | {f(g.values[1])} | {f(g.values[2])} | "
                     f"{'—' if g.order is None else f'{g.order:.2f}'} | {g.convergence} | "
                     f"{f(g.extrapolated)} | {pct(g.gci_fine)} | {pct(q.coarse_error)} |")
    return "\n".join(lines) + "\n"
