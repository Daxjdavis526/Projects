"""A finished run's fields, for viewing: read from the OpenFOAM case through
VTK's own reader, with the geometry and derived quantities a nozzle needs.

No Qt: the desktop Results stage and the report exporter both use it.
Values are cell values, as the solver computed them. Point data, which VTK
interpolates from cells *and* boundary faces, is used only where a
continuous field is needed (streamline integration), never for a probe
(DESIGN.md section 3.7).

Axisymmetric (wedge) and planar runs are shown mirrored about the axis, so
a picture shows the whole nozzle; a probe on the mirrored half reads the
cell it mirrors.
"""

from __future__ import annotations

import json
import math
import os
import sys
from dataclasses import dataclass
from pathlib import Path

import numpy as np

from ..core import model
from ..core.profile import Profile, from_points
from ..core.stagnation import run_p0
from ..core.theory import quasi1d
from ..core.validate import resolve_profile


def _headless() -> None:
    if sys.platform.startswith("linux") and not os.environ.get("DISPLAY"):
        os.environ.setdefault("VTK_DEFAULT_OPENGL_WINDOW", "vtkOSOpenGLRenderWindow")


@dataclass(frozen=True)
class FieldInfo:
    name: str  # array name on the datasets
    label: str
    unit: str
    colormap: str
    scale: float = 1.0  # shown value = stored * scale


FIELDS: dict[str, FieldInfo] = {
    "Mach": FieldInfo("Mach", "Mach number", "", "turbo"),
    "p": FieldInfo("p", "static pressure", "bar", "viridis", 1e-5),
    "T": FieldInfo("T", "static temperature", "K", "inferno"),
    "speed": FieldInfo("speed", "velocity magnitude", "m/s", "plasma"),
    "rho": FieldInfo("rho", "density", "kg/m³", "cividis"),
    "T0": FieldInfo("T0", "total temperature", "K", "coolwarm"),
    "p0": FieldInfo("p0", "total pressure (isentropic from p and Mach)", "bar", "viridis", 1e-5),
    "k": FieldInfo("k", "turbulent kinetic energy", "m²/s²", "magma"),
    "nut": FieldInfo("nut", "turbulent viscosity", "m²/s", "magma"),
}


class ResultsError(RuntimeError):
    pass


class RunResults:
    """One run directory's results. Reading is lazy: the case is opened on
    first use."""

    def __init__(self, run_dir: Path, time: float | None = None):
        """``time``: the written time to show (a transient's frame); the
        latest by default."""
        self.run_dir = Path(run_dir)
        self.requested_time = time
        self.case = self.run_dir / "case"
        if not (self.case / "case.foam").is_file():
            raise ResultsError(f"{self.run_dir} has no OpenFOAM case to read")
        self.definition = model.load(self.run_dir / "definition.json")
        self.metrics = self._json("metrics.json")
        self.manifest = self._json("manifest.json")
        self.profiles = self._json("profiles.json")
        self.mesh_meta = self._json("mesh_meta.json")
        self.form = self.mesh_meta.get("form", "wedge")
        gas = self.definition.gas.model()
        self.gamma, self.R, self.cp = gas.gamma, gas.R, gas.cp
        self.gas = gas
        self._internal = None
        self._patches: dict | None = None
        self.time: str | None = None

    def _json(self, name: str) -> dict:
        f = self.run_dir / name
        try:
            return json.loads(f.read_text(encoding="utf-8")) if f.is_file() else {}
        except json.JSONDecodeError:
            return {}

    @property
    def profile(self) -> Profile:
        prof = resolve_profile(self.definition)
        if prof is None:  # CAD geometry: the profile recovered from the file, stored with the run
            stored = self._json("profile.json").get("points")
            if not stored:
                raise ResultsError("the wall profile of this CAD run is not stored with it")
            prof = from_points([tuple(p) for p in stored])
        return prof

    @property
    def p0(self) -> float | None:
        """Chamber pressure: stated, or measured by the CFD for a mass-flow inlet."""
        try:
            prof = self.profile
        except ResultsError:
            prof = None
        return run_p0(self.definition, prof, self.metrics)

    @property
    def mirrored(self) -> bool:
        return self.form in ("wedge", "planar")

    # -- reading ------------------------------------------------------------------

    def _read(self) -> None:
        _headless()
        import pyvista as pv

        reader = pv.POpenFOAMReader(str(self.case / "case.foam"))
        reader.skip_zero_time = False
        times = list(reader.time_values)
        if not times or times[-1] <= 0.0:
            # A run stopped before reconstructPar: read the processor directories.
            if any(self.case.glob("processor*")):
                reader.case_type = "decomposed"
                times = list(reader.time_values)
        if not times:
            raise ResultsError(f"{self.case} has no time directories")
        chosen = times[-1]
        if self.requested_time is not None:
            chosen = min(times, key=lambda t: abs(t - self.requested_time))
        reader.set_active_time_value(chosen)
        self.time = f"{chosen:g}"
        reader.enable_all_cell_arrays()
        reader.enable_all_patch_arrays()
        data = reader.read()
        internal = data["internalMesh"]
        self._derive(internal)
        self._internal = internal
        self._patches = {}
        boundary = data["boundary"] if "boundary" in data.keys() else None
        if boundary is not None:
            for name in boundary.keys():
                patch = boundary[name]
                if patch is not None and patch.n_cells:
                    self._derive(patch)
                    self._patches[name] = patch

    def _derive(self, ds) -> None:
        cd = ds.cell_data
        if "U" not in cd or "T" not in cd or "p" not in cd:
            return
        U = np.asarray(cd["U"])
        T = np.asarray(cd["T"], dtype=float)
        p = np.asarray(cd["p"], dtype=float)
        speed = np.linalg.norm(U, axis=1)
        a = np.sqrt(self.gamma * self.R * np.maximum(T, 1e-9))
        mach = np.asarray(cd["Ma"], dtype=float) if "Ma" in cd else speed / a
        g = self.gamma
        cd["speed"] = speed
        cd["Mach"] = mach
        cd["rho"] = p / (self.R * np.maximum(T, 1e-9))
        if self.gas.janaf is None:
            cd["T0"] = T + speed**2 / (2.0 * self.cp)
        else:
            cd["T0"] = np.array([self.gas.total_temperature(t, u * u) for t, u in zip(T, speed)])
        cd["p0"] = p * (1.0 + 0.5 * (g - 1.0) * mach**2) ** (g / (g - 1.0))

    def times(self) -> list[float]:
        """Written times with fields (a transient's frames), ascending."""
        out = []
        for d in self.case.iterdir():
            try:
                t = float(d.name)
            except ValueError:
                continue
            if d.is_dir() and (d / "p").is_file() and t > 0.0:
                out.append(t)
        return sorted(out)

    @property
    def internal(self):
        if self._internal is None:
            self._read()
        return self._internal

    @property
    def patches(self) -> dict:
        if self._patches is None:
            self._read()
        return self._patches

    def fields(self) -> list[str]:
        """Fields that can be shown, in display order."""
        have = set(self.internal.cell_data.keys())
        return [k for k in FIELDS if k in have]

    def range(self, field: str) -> tuple[float, float]:
        v = np.asarray(self.internal.cell_data[field], dtype=float)
        s = FIELDS[field].scale if field in FIELDS else 1.0
        return float(np.nanmin(v) * s), float(np.nanmax(v) * s)

    # -- geometry for display ---------------------------------------------------------

    def _mirror(self, ds):
        return ds.merge(ds.reflect((0, 1, 0), point=(0, 0, 0))) if self.mirrored else ds

    def meridian(self):
        """The x-y plane through the axis: the whole nozzle and plume."""
        cut = self.internal.slice(normal=(0, 0, 1), origin=(0, 0, 0))
        return self._mirror(cut)

    def cutting_plane(self, normal: tuple[float, float, float], origin: tuple[float, float, float]):
        """Any plane through the domain. On a wedge or planar mesh only planes
        containing the axis direction show more than a line."""
        return self.internal.slice(normal=normal, origin=origin)

    def cross_section(self, x: float, n: int = 120) -> dict[str, np.ndarray]:
        """Cell values along the radius (the half-height) at station x."""
        prof = self.profile
        if x > prof.x_exit:  # in the plume: out to the plume boundary
            r_wall = self.internal.bounds[3]
        else:
            r_wall = prof.radius(max(x, prof.x_inlet))
        r = np.linspace(0.0, 0.999 * r_wall, n)
        pts = np.column_stack([np.full(n, x), r, np.zeros(n)])
        return self._sample_cells(pts, r, "r")

    def centreline(self, n: int = 400) -> dict[str, np.ndarray]:
        b = self.internal.bounds
        x = np.linspace(b[0], b[1], n)
        pts = np.column_stack([x, np.full(n, 1e-9 * (b[3] - b[2])), np.zeros(n)])
        return self._sample_cells(pts, x, "x")

    def _sample_cells(self, pts: np.ndarray, coord: np.ndarray, name: str) -> dict[str, np.ndarray]:
        ids = self.internal.find_containing_cell(pts)
        ok = ids >= 0
        out = {name: coord[ok]}
        for f in self.fields():
            out[f] = np.asarray(self.internal.cell_data[f])[ids[ok]]
        return out

    def near_field(self) -> tuple[float, float, float, float, float, float]:
        """The nozzle and three exit diameters of plume, full height: where a
        thruster's flow is decided. The far plume only matters to plume
        studies."""
        b = self.internal.bounds
        try:
            prof = self.profile
        except ResultsError:
            return tuple(b)
        De = 2.0 * prof.exit_radius
        half = 1.6 * max(De, 2.0 * prof.inlet_radius)
        return (prof.x_inlet, min(b[1], prof.x_exit + 3.0 * De), -half, half, -half, half)

    @staticmethod
    def clip(ds, box):
        return ds.clip_box(box, invert=False) if ds is not None and ds.n_points else ds

    def patch(self, name: str):
        return self._mirror(self.patches[name]) if name in self.patches else None

    def display_patches(self) -> list[str]:
        """Patches worth drawing: walls and open boundaries, not the wedge or
        empty sides (which the meridian shows)."""
        skip = {"front", "back", "axis"}
        return [n for n in self.patches if n not in skip]

    def vectors(self, ds, max_arrows: int = 300, length: float | None = None):
        """Velocity direction arrows of one length at a subset of the cells of
        ``ds``; the field colour carries the magnitude."""
        centres = ds.cell_centers()
        n = centres.n_points
        step = max(1, n // max_arrows)
        pts = centres.extract_points(np.arange(0, n, step), adjacent_cells=False)
        if "U" not in pts.point_data and "U" in pts.cell_data:
            pts = pts.cell_data_to_point_data()
        span = max(ds.bounds[1] - ds.bounds[0], ds.bounds[3] - ds.bounds[2])
        return pts.glyph(orient="U", scale=False, factor=length or 0.035 * span)

    def streamlines(self, n: int = 12):
        """Streamlines from seeds across the inlet, integrated on point data
        interpolated from the cells (display only)."""
        prof = self.profile
        b = self.internal.bounds
        x0 = prof.x_inlet + 0.02 * (prof.x_exit - prof.x_inlet)
        r0 = prof.radius(x0)
        grid = self.internal.cell_data_to_point_data()
        import pyvista as pv

        seeds = pv.Line((x0, 0.05 * r0, 0.0), (x0, 0.95 * r0, 0.0), resolution=max(1, n - 1))
        lines = grid.streamlines_from_source(seeds, vectors="U", integration_direction="forward",
                                             max_length=4.0 * (b[1] - b[0]), initial_step_length=0.2)
        return self._mirror(lines) if lines.n_points else lines

    # -- probe ------------------------------------------------------------------------

    def probe(self, point: tuple[float, float, float]) -> dict | None:
        """Cell values at ``point`` (a click on the mirrored half reads the
        cell it mirrors). None outside the domain."""
        x, y, z = map(float, point)
        if self.mirrored:
            y = abs(y)
        if self.form == "wedge":
            z = 0.0
        ids = self.internal.find_containing_cell(np.array([[x, y, z]]))
        cell = int(ids[0]) if len(ids) else -1
        if cell < 0:
            return None
        values = {}
        for f in self.fields():
            info = FIELDS[f]
            values[f] = float(np.asarray(self.internal.cell_data[f])[cell]) * info.scale
        U = np.asarray(self.internal.cell_data["U"])[cell]
        return {"cell": cell, "point": (x, y, z), "values": values,
                "velocity": tuple(float(u) for u in U), "kind": "cell value"}

    # -- plots and summary -----------------------------------------------------------

    def axial(self) -> dict[str, dict[str, np.ndarray]]:
        """Centreline and wall profiles (the pipeline's cell rows), with
        quasi-1D theory over the nozzle."""
        out = {}
        for row in ("centreline", "wall"):
            data = self.profiles.get(row)
            if data and data.get("x"):
                out[row] = {k: np.asarray(v, dtype=float) for k, v in data.items() if v}
        try:
            prof = self.profile
        except ResultsError:
            return out
        inlet = self.definition.boundaries.inlet
        xs = np.linspace(prof.x_inlet, prof.x_exit, 300)
        q = quasi1d.solve(prof, self.definition.gas.model(), self.p0, inlet.T0,
                          self.definition.boundaries.ambient.pressure, list(xs))
        out["quasi_1d"] = {"x": xs, "p": np.array([s.pressure for s in q.stations]),
                           "T": np.array([s.temperature for s in q.stations]),
                           "mach": np.array([s.mach for s in q.stations])}
        return out

    def summary(self) -> dict:
        """The engineering numbers and the verdict, in display units."""
        m = self.metrics
        if not m:
            return {"status": self.manifest.get("status", "unknown"),
                    "trust": self.manifest.get("trust"), "rows": [], "reasons": [], "warnings": []}

        def g(*keys):
            v = m
            for k in keys:
                v = v.get(k) if isinstance(v, dict) else None
            return v

        def fmt(v, spec):
            return "n/a" if v is None or (isinstance(v, float) and not math.isfinite(v)) else format(v, spec)

        rows = [
            ("Mass flow", fmt(1e3 * g("mass_flow", "inlet"), ".4f") + " g/s",
             fmt(1e3 * g("mass_flow", "ideal"), ".4f") + " g/s"),
            ("Discharge coefficient", fmt(g("discharge_coefficient", "cfd"), ".4f"),
             fmt(g("discharge_coefficient", "kliegel_levine"), ".4f") + " (Kliegel-Levine)"
             if g("discharge_coefficient", "kliegel_levine") else "-"),
            ("Thrust", fmt(g("thrust", "total"), ".4f") + " N", fmt(g("thrust", "ideal"), ".4f") + " N"),
            ("  momentum / pressure", f"{fmt(g('thrust', 'momentum'), '.4f')} / {fmt(g('thrust', 'pressure'), '+.4f')} N", ""),
            ("Specific impulse", fmt(g("specific_impulse", "cfd"), ".2f") + " s",
             fmt(g("specific_impulse", "ideal"), ".2f") + " s"),
            ("Exit Mach (mass-averaged)", fmt(g("exit", "mach_mass_avg"), ".4f"),
             fmt(g("exit", "ideal", "mach"), ".4f")),
            ("Exit pressure (area-averaged)", fmt((g("exit", "p_area_avg") or math.nan) / 1e5, ".4f") + " bar",
             fmt((g("exit", "ideal", "p") or math.nan) / 1e5, ".4f") + " bar"),
            ("Throat Mach (area-averaged)", fmt(g("throat", "mach_area_avg"), ".4f"), "1"),
            ("Mass balance, inlet vs exit", fmt(100 * (g("mass_flow", "imbalance_inlet_exit") or math.nan), "+.4f") + " %", ""),
            ("Thrust, exit plane vs wall + feed",
             fmt(100 * (g("thrust", "control_volume_disagreement") or math.nan), "+.3f") + " %", ""),
        ]
        rg = g("mass_flow", "real_gas_correction")
        if rg is not None:
            rows.append(("Real-gas mass flow estimate", fmt(1e3 * g("mass_flow", "inlet_real_gas_estimate"), ".4f")
                         + f" g/s ({100 * rg:+.2f} %)", ""))
        rf = g("wall", "recovery_factor_mean")
        if rf is not None:
            rows.append(("Adiabatic-wall recovery factor", fmt(rf, ".3f"), "0.83-0.88"))
        ub = m.get("uncertainty") or {}
        if ub and "error" not in ub:
            # About 95 %; the components are in metrics.json (core.uncertainty).
            for key, label, scale, unit, spec in (("mass_flow", "mass flow", 1e3, "g/s", ".4f"),
                                                  ("thrust", "thrust", 1.0, "N", ".4f"),
                                                  ("specific_impulse", "Isp", 1.0, "s", ".2f")):
                b = ub.get(key) or {}
                if b.get("absolute") is None:
                    continue
                comps = b.get("components") or {}
                top = max(comps, key=comps.get) if comps else "-"
                rows.append((f"Uncertainty, {label} (95 %)",
                             f"+- {scale * b['absolute']:{spec}} {unit} ({100 * b['relative']:.2f} %)",
                             f"largest: {top}"))
            notes = sorted({n for b in ub.values() for n in (b.get("unquantified") or [])})
            for n in notes:
                rows.append(("  not bounded", n, ""))
        tr = m.get("transient")
        if tr:
            # A startup: the steady rows above are its end state (the mean
            # over the last tenth of the run).
            us = lambda v: fmt(None if v is None else 1e6 * v, ".1f") + " µs"  # noqa: E731
            rows += [
                ("Startup: end time", fmt(1e3 * tr["end_time"], ".4g") + " ms", ""),
                ("  10 % / 90 % of final thrust", f"{us(tr.get('time_to_10_percent_thrust'))} / "
                 f"{us(tr.get('time_to_90_percent_thrust'))}", ""),
                ("  peak thrust (overshoot)", fmt(tr.get("thrust_peak"), ".4f")
                 + f" N ({fmt(100 * (tr.get('thrust_overshoot') or math.nan), '+.1f')} %)", ""),
                ("  settled (thrust drift, last tenth)", ("yes" if tr.get("settled") else "no")
                 + f" ({fmt(100 * (tr.get('thrust_drift_last_tenth') or math.nan), '.2f')} %)", "< 1 %"),
                ("  mass conservation in time", fmt(tr.get("conservation_error"), ".1e"), "< 1e-3"),
            ]
        verdict = m.get("verdict", {})
        return {"status": self.manifest.get("status", "unknown"), "trust": verdict.get("trust"),
                "rows": rows, "reasons": verdict.get("reasons", []), "warnings": verdict.get("warnings", []),
                "solver": m.get("solver"), "iterations": g("convergence", "iterations")}
