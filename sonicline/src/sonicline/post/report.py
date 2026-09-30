"""A run's report: report.json (everything needed to reproduce and judge the
run), PNG images, and a PDF that opens with the verdict.

    report.json      definition, manifest summary, metrics, verdict, mesh and
                     convergence records
    contour_*.png    Mach, pressure and temperature on the meridian plane
    axial.png        centreline and wall against quasi-1D theory
    convergence.png  mass flow and thrust history
    report.pdf       all of the above, verdict first

No Qt; images are rendered off screen (pyvista) and plotted with matplotlib.
"""

from __future__ import annotations

import json
import textwrap
from pathlib import Path

import numpy as np

from .fieldview import FIELDS, RunResults, _headless

CONTOUR_FIELDS = ("Mach", "p", "T")
# A horizontal legend under the picture; the field's name is a heading, not a
# bar title, which would collide with the labels.
SCALAR_BAR = {"color": "black", "vertical": False, "position_x": 0.2, "position_y": 0.03,
              "width": 0.6, "height": 0.06, "fmt": "%.4g", "label_font_size": 13, "n_labels": 5}


def _json_safe(o):
    if isinstance(o, dict):
        return {str(k): _json_safe(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [_json_safe(v) for v in o]
    if isinstance(o, np.generic):
        return o.item()
    if isinstance(o, float) and not np.isfinite(o):
        return None
    return o


def contour_image(results: RunResults, field: str, path: Path, size=(1600, 700)) -> Path:
    """The meridian plane coloured by ``field``, zoomed on the nozzle and the
    near plume."""
    _headless()
    import pyvista as pv

    info = FIELDS[field]
    surf = results.meridian()
    surf.cell_data["shown"] = np.asarray(surf.cell_data[field], dtype=float) * info.scale
    surf = results.clip(surf, results.near_field())
    p = pv.Plotter(off_screen=True, window_size=size)
    p.set_background("white")
    title = f"{info.label} [{info.unit}]" if info.unit else info.label
    p.add_mesh(surf, scalars="shown", cmap=info.colormap, show_edges=False,
               scalar_bar_args=SCALAR_BAR | {"title": ""})
    p.add_text(f"{title}    {results.definition.name}", position="upper_left", font_size=12, color="black")
    p.view_xy()
    p.camera.zoom(1.25)
    p.screenshot(str(path))
    p.close()
    return path


def contour_image_isolated(run_dir: Path, field: str, path: Path, size=(1600, 700),
                           timeout: float = 180.0) -> Path:
    """``contour_image`` in a child process. A broken or missing OpenGL
    driver does not raise, it kills the process (an access violation on a
    GPU-less Windows machine); isolated, it costs one image, not the report
    or the application."""
    import subprocess
    import sys

    code = ("import sys; from pathlib import Path; from sonicline.post import report, fieldview; "
            "report.contour_image(fieldview.RunResults(Path(sys.argv[1])), sys.argv[2], Path(sys.argv[3]), "
            "(int(sys.argv[4]), int(sys.argv[5])))")
    proc = subprocess.run([sys.executable, "-c", code, str(run_dir), field, str(path), str(size[0]),
                           str(size[1])], capture_output=True, text=True, timeout=timeout)
    if proc.returncode != 0 or not Path(path).is_file():
        tail = (proc.stderr or "").strip().splitlines()[-1:] or [f"exit code {proc.returncode}"]
        raise RuntimeError(f"off-screen rendering failed ({tail[0]})")
    return Path(path)


def axial_image(results: RunResults, path: Path) -> Path | None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    ax_data = results.axial()
    if "centreline" not in ax_data:
        return None
    inlet = results.definition.boundaries.inlet
    p0, T0 = results.p0, inlet.T0
    fig, axes = plt.subplots(3, 1, figsize=(9, 9), sharex=True)
    q = ax_data.get("quasi_1d")
    c, w = ax_data["centreline"], ax_data.get("wall")
    for ax, key, norm, label in ((axes[0], "p", p0, "p / p0"), (axes[1], "mach", 1.0, "Mach"),
                                 (axes[2], "T", T0, "T / T0")):
        if q is not None:
            ax.plot(1e3 * q["x"], q[key] / norm, "k--", lw=1, label="quasi-1D")
        if key in c and len(c[key]):
            ax.plot(1e3 * c["x"], c[key] / norm, lw=1.5, color="#2d6cdf", label="CFD, axis")
        if w is not None and key in w and len(w[key]) and key != "mach":
            ax.plot(1e3 * w["x"], w[key] / norm, lw=1.2, color="#c77700",
                    label="CFD, wall" + (" (adiabatic wall T)" if key == "T" else ""))
        ax.set_ylabel(label)
        ax.grid(alpha=0.3)
        ax.legend(fontsize=8, loc="best")
    axes[-1].set_xlabel("x [mm]")
    fig.suptitle(results.definition.name, fontsize=10)
    fig.tight_layout()
    fig.savefig(path, dpi=130)
    plt.close(fig)
    return path


def convergence_image(results: RunResults, path: Path) -> Path | None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    from ..post import results as res
    from ..run import convergence

    tables = res.read_tables(results.case)
    inlet, exit_ = tables.get("mdot_inlet"), tables.get("mdot_exit")
    if inlet is None or exit_ is None or not len(inlet.time):
        return None
    ref = float(np.mean(-inlet.values["sum(phi)"][-50:])) or 1.0
    fig, ax = plt.subplots(figsize=(9, 3.6))
    ax.plot(inlet.time, -inlet.values["sum(phi)"] / ref, lw=1, label="inlet mass flow")
    ax.plot(exit_.time, exit_.values["sum(phi)"] / ref, lw=1, label="exit mass flow")
    mom, pf = tables.get("momentum_exit"), tables.get("pforce_exit")
    if mom is not None and pf is not None and len(mom.time):
        t, thrust = convergence.exit_thrust_series(mom, pf)
        tref = float(np.mean(thrust[-50:])) or 1.0
        ax.plot(t, thrust / tref, lw=1, label="exit thrust")
    ax.set_ylim(0.9, 1.1)
    ax.set_xlabel("iteration")
    ax.set_ylabel("relative to final value")
    ax.grid(alpha=0.3)
    ax.legend(fontsize=8)
    fig.tight_layout()
    fig.savefig(path, dpi=130)
    plt.close(fig)
    return path


def report_json(results: RunResults) -> dict:
    from ..core import model

    man = results.manifest
    return _json_safe({
        "run": results.run_dir.name,
        "definition": json.loads(model.dumps(results.definition)),
        "manifest": {k: man.get(k) for k in ("status", "trust", "started", "finished", "definition_hash",
                                              "sonicline_version", "git_commit", "runner", "solver",
                                              "mesh", "solve_seconds", "warm_start", "stages")},
        "summary": results.summary(),
        "metrics": results.metrics,
        "mesh_report": results._json("mesh_report.json"),
        "convergence": results._json("convergence.json"),
    })


def export(run_dir: Path, out_dir: Path | None = None, images: bool = True) -> dict[str, Path]:
    """Write the report; returns the files written by role."""
    results = RunResults(run_dir)
    out = Path(out_dir) if out_dir else results.run_dir / "report"
    out.mkdir(parents=True, exist_ok=True)
    files: dict[str, Path] = {}
    data = report_json(results)
    missing = []
    if images:
        # A machine without off-screen OpenGL still gets the numbers: each
        # image that cannot be made is recorded, not fatal.
        for f in CONTOUR_FIELDS:
            if f in results.fields():
                try:
                    files[f"contour_{f}"] = contour_image_isolated(results.run_dir, f, out / f"contour_{f}.png")
                except Exception as e:
                    missing.append(f"contour_{f}: {type(e).__name__}: {e}")
        for role, make in (("axial", axial_image), ("convergence", convergence_image)):
            try:
                made = make(results, out / f"{role}.png")
            except Exception as e:
                missing.append(f"{role}: {type(e).__name__}: {e}")
            else:
                if made:
                    files[role] = made
    data["images"] = {"written": sorted(files), "missing": missing}
    files["json"] = out / "report.json"
    files["json"].write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    files["pdf"] = _pdf(results, data, files, out / "report.pdf")
    return files


def _pdf(results: RunResults, data: dict, files: dict[str, Path], path: Path) -> Path:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.image as mpimg
    import matplotlib.pyplot as plt
    from matplotlib.backends.backend_pdf import PdfPages

    s = data["summary"]
    colour = {"trusted": "#2e7d32", "trusted_with_warnings": "#c77700"}.get(s.get("trust"), "#c62828")
    with PdfPages(path) as pdf:
        fig = plt.figure(figsize=(8.27, 11.69))  # A4
        y = 0.95
        fig.text(0.07, y, "SONICLINE run report", fontsize=16, weight="bold")
        y -= 0.03
        fig.text(0.07, y, f"{results.definition.name}  -  run {results.run_dir.name}", fontsize=9)
        y -= 0.045
        fig.text(0.07, y, f"{s.get('status')}: {(s.get('trust') or 'not trustworthy').replace('_', ' ')}",
                 fontsize=14, weight="bold", color=colour)
        y -= 0.035
        for reason in s.get("reasons", []):
            for line in textwrap.wrap("NOT TRUSTWORTHY: " + reason, 100):
                fig.text(0.07, y, line, fontsize=8, color="#c62828")
                y -= 0.016
        for warning in s.get("warnings", []):
            for line in textwrap.wrap("warning: " + warning, 100):
                fig.text(0.07, y, line, fontsize=8, color="#c77700")
                y -= 0.016
        y -= 0.02
        fig.text(0.07, y, "quantity", fontsize=9, weight="bold")
        fig.text(0.47, y, "CFD", fontsize=9, weight="bold")
        fig.text(0.70, y, "ideal / reference", fontsize=9, weight="bold")
        y -= 0.022
        for name, cfd, ref in s.get("rows", []):
            fig.text(0.07, y, name, fontsize=9)
            fig.text(0.47, y, cfd, fontsize=9)
            fig.text(0.70, y, ref, fontsize=9)
            y -= 0.02
        y -= 0.02
        man = data["manifest"]
        runner = man.get("runner") or {}
        for line in (f"solver {s.get('solver')}, {s.get('iterations')} iterations, "
                     f"{man.get('solve_seconds')} s of solving",
                     f"{runner.get('openfoam', 'OpenFOAM ?')}, SONICLINE {man.get('sonicline_version')} "
                     f"({(man.get('git_commit') or '')[:10]})",
                     f"definition {str(man.get('definition_hash'))[:16]}, "
                     f"mesh {(man.get('mesh') or {}).get('cells', '?')} cells"):
            fig.text(0.07, y, line, fontsize=8, color="#555555")
            y -= 0.016
        pdf.savefig(fig)
        plt.close(fig)
        for role in [f"contour_{f}" for f in CONTOUR_FIELDS] + ["axial", "convergence"]:
            if role not in files:
                continue
            img = mpimg.imread(files[role])
            fig = plt.figure(figsize=(11.69, 8.27))
            ax = fig.add_axes([0.02, 0.02, 0.96, 0.96])
            ax.imshow(img)
            ax.axis("off")
            pdf.savefig(fig)
            plt.close(fig)
    return path
