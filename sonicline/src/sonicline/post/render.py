"""Off-screen images of a finished run: field contours on the meridional
plane and axial plots against quasi-1D theory.

Uses VTK through pyvista for the contours (reading the OpenFOAM case
directly) and matplotlib for the line plots. Both are optional
dependencies; the pipeline skips images if they are missing.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import numpy as np

from ..core.model import definition as d
from ..core.profile import Profile
from ..core.theory import quasi1d
from ..foam.case import CaseSummary


def _headless() -> None:
    """Without a display, render through OSMesa instead of trying X first."""
    if sys.platform.startswith("linux") and not os.environ.get("DISPLAY"):
        os.environ.setdefault("VTK_DEFAULT_OPENGL_WINDOW", "vtkOSOpenGLRenderWindow")


def _load_slice(case: Path):
    _headless()
    import pyvista as pv

    reader = pv.POpenFOAMReader(str(case / "case.foam"))
    reader.set_active_time_value(reader.time_values[-1])
    reader.enable_all_cell_arrays()
    data = reader.read()["internalMesh"]
    cut = data.slice(normal=(0, 0, 1), origin=(0, 0, 0))
    # Mirror about the axis so the image shows the whole nozzle.
    return cut.merge(cut.reflect((0, 1, 0), point=(0, 0, 0)))


_FIELDS = (
    ("Ma", "Mach number", "turbo"),
    ("p", "static pressure [bar]", "viridis"),
    ("T", "static temperature [K]", "inferno"),
)


def contours(run_dir: Path, case: Path, profile: Profile, zoom: bool) -> list[Path]:
    import pyvista as pv

    pv.OFF_SCREEN = True
    surface = _load_slice(case)
    if "p" in surface.cell_data:
        surface.cell_data["p_bar"] = surface.cell_data["p"] / 1e5
    De = 2.0 * profile.exit_radius
    if zoom:
        x0, x1 = profile.x_inlet, profile.x_exit + 3.0 * De
        surface = surface.clip_box((x0, x1, -1.5 * De, 1.5 * De, -1, 1), invert=False)
    out = []
    for name, label, cmap in _FIELDS:
        array = "p_bar" if name == "p" else name
        if array not in surface.cell_data:
            continue
        pl = pv.Plotter(off_screen=True, window_size=(1600, 700))
        pl.set_background("white")
        pl.add_mesh(surface, scalars=array, cmap=cmap, show_edges=False,
                    scalar_bar_args={"title": label, "color": "black", "vertical": False,
                                     "position_x": 0.25, "position_y": 0.04, "width": 0.5})
        pl.view_xy()
        pl.camera.zoom(1.3 if zoom else 1.0)
        path = run_dir / "images" / f"{name}{'_nozzle' if zoom else '_plume'}.png"
        path.parent.mkdir(exist_ok=True)
        pl.screenshot(str(path))
        pl.close()
        out.append(path)
    return out


def axial_plot(run_dir: Path, defn: d.SimulationDefinition, profile: Profile) -> Path | None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    prof_file = run_dir / "profiles.json"
    if not prof_file.is_file():
        return None
    data = json.loads(prof_file.read_text(encoding="utf-8"))
    gas = defn.gas.model()
    p0, T0 = defn.boundaries.inlet.p0, defn.boundaries.inlet.T0
    pa = defn.boundaries.ambient.pressure
    xs = np.linspace(profile.x_inlet, profile.x_exit, 400)
    q = quasi1d.solve(profile, gas, p0, T0, pa, list(xs))
    theory = {"p": [s.pressure / p0 for s in q.stations], "mach": [s.mach for s in q.stations],
              "T": [s.temperature for s in q.stations]}
    cl, wall = data["centreline"], data["wall"]
    viscous = not isinstance(defn.flow.turbulence, d.Inviscid)
    # Nozzle plus the first few shock cells of the plume.
    x_max = profile.x_exit + 4.0 * 2.0 * profile.exit_radius

    def clip(series, key):
        x = np.array(series["x"])
        keep = x <= x_max
        return x[keep] * 1e3, np.array(series[key])[keep]

    fig, axes = plt.subplots(3, 1, figsize=(10, 10), sharex=True)
    for ax, key, label, scale in ((axes[0], "p", "p / p0", 1 / p0), (axes[1], "mach", "Mach", 1.0),
                                  (axes[2], "T", "T [K]", 1.0)):
        ax.plot(np.array(xs) * 1e3, theory[key], "k--", lw=1.2, label="quasi-1D theory")
        if cl.get(key):
            x, v = clip(cl, key)
            ax.plot(x, v * scale, lw=1.6, label="CFD, axis")
        # With viscous walls the wall-adjacent cell is inside the boundary
        # layer: its pressure is the wall pressure and its temperature the
        # adiabatic wall temperature, but its Mach number is ~0 and not
        # comparable with the core flow.
        if wall.get(key) and not (viscous and key == "mach"):
            x, v = clip(wall, key)
            name = "CFD, wall" if not viscous else (
                "CFD, wall pressure" if key == "p" else "CFD, adiabatic wall temperature")
            ax.plot(x, v * scale, lw=1.6, label=name)
        ax.legend(frameon=False, fontsize=9)
        ax.set_ylabel(label)
        ax.grid(alpha=0.3)
        ax.axvline(profile.throat_x * 1e3, color="0.7", lw=0.8)
        ax.axvline(profile.x_exit * 1e3, color="0.7", lw=0.8)
    axes[-1].set_xlabel("x [mm]  (throat and exit marked; plume shown to 4 exit diameters)")
    fig.suptitle(defn.name)
    fig.tight_layout()
    path = run_dir / "images" / "axial.png"
    path.parent.mkdir(exist_ok=True)
    fig.savefig(path, dpi=120)
    plt.close(fig)
    return path


def render_all(run_dir: Path, case: Path, defn: d.SimulationDefinition, profile: Profile,
               summary: CaseSummary) -> list[Path]:
    images = contours(run_dir, case, profile, zoom=True)
    if isinstance(defn.boundaries.exit_domain, d.Plume):
        images += contours(run_dir, case, profile, zoom=False)
    axial = axial_plot(run_dir, defn, profile)
    if axial:
        images.append(axial)
    return images
