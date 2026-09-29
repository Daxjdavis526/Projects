"""The workflow stages: Geometry -> Physics -> Mesh -> Run.

Each page edits the shared Draft through bound widgets and emits
``changed``; the main window re-assesses the draft and redraws. Long work
(STEP analysis, mesh generation) runs on the thread pool.
"""

from __future__ import annotations

import math
import os
from pathlib import Path

import numpy as np
from PySide6 import QtCore, QtGui, QtWidgets

from ..project import RunInfo
from .forms import ChoiceBox, QuantityEdit, Worker, row

SEVERITY_STYLE = {0: ("info", "#2d6cdf"), 1: ("warning", "#c77700"), 2: ("error", "#c62828")}


class Page(QtWidgets.QWidget):
    changed = QtCore.Signal()

    def __init__(self, window):
        super().__init__()
        self.window = window
        self.fields: list = []

    def draft(self):
        return self.window.draft

    def bind(self, widget):
        widget.edited.connect(self.changed.emit)
        self.fields.append(widget)
        return widget

    def refresh(self) -> None:
        for f in self.fields:
            f.refresh()


# ----------------------------------------------------------------------------- geometry


class GeometryPage(Page):
    TYPES = [("Parametric conical nozzle", "conical_nozzle"), ("Imported STEP file", "cad_file"),
             ("Tabulated wall", "wall_profile")]

    def __init__(self, window):
        super().__init__(window)
        v = QtWidgets.QVBoxLayout(self)
        self.kind = QtWidgets.QComboBox()
        for label, _ in self.TYPES:
            self.kind.addItem(label)
        self.kind.setToolTip("How the nozzle wall is given")
        self.kind.currentIndexChanged.connect(self._kind_changed)
        v.addWidget(self.kind)

        # Parametric nozzle.
        self.param = QtWidgets.QGroupBox("Conical nozzle")
        f = QtWidgets.QFormLayout(self.param)
        g = "geometry."
        row(f, "Throat diameter", self.bind(QuantityEdit(self.draft, g + "throat_radius", "mm", scale=0.5,
            minimum=1e-6, tooltip="Throat diameter (the half-height for a planar nozzle is half of it)")), "mm")
        row(f, "Expansion ratio Ae/At", self.bind(QuantityEdit(self.draft, g + "expansion_ratio", minimum=1.0,
            default=4.0, tooltip="Exit to throat area ratio; 1 is a converging nozzle")))
        row(f, "Contraction ratio Ac/At", self.bind(QuantityEdit(self.draft, g + "contraction_ratio",
            minimum=1.0, default=9.0, tooltip="Chamber to throat area ratio")))
        row(f, "Converging half-angle", self.bind(QuantityEdit(self.draft, g + "converging_half_angle", "deg",
            default=math.radians(45.0), tooltip="Half-angle of the converging cone")), "deg")
        row(f, "Diverging half-angle", self.bind(QuantityEdit(self.draft, g + "diverging_half_angle", "deg",
            default=math.radians(15.0), tooltip="Half-angle of the diverging cone")), "deg")
        row(f, "Throat Rc / Rt upstream", self.bind(QuantityEdit(self.draft, g + "throat_rc_upstream",
            minimum=0.01, default=1.5, tooltip="Wall curvature radius just upstream of the throat, in "
            "throat radii. It sets the discharge coefficient (Kliegel-Levine)")))
        row(f, "Throat Rc / Rt downstream", self.bind(QuantityEdit(self.draft, g + "throat_rc_downstream",
            minimum=0.01, default=0.382, tooltip="Wall curvature radius just downstream of the throat")))
        row(f, "Straight throat length / Rt", self.bind(QuantityEdit(self.draft, g + "throat_length",
            minimum=0.0, default=0.0, tooltip="A cylindrical section after the throat")))
        v.addWidget(self.param)

        # Imported CAD.
        self.cad = QtWidgets.QGroupBox("STEP fluid volume")
        c = QtWidgets.QVBoxLayout(self.cad)
        btn = QtWidgets.QPushButton("Import STEP file...")
        btn.clicked.connect(self._import)
        c.addWidget(btn)
        self.cad_file = QtWidgets.QLabel("no file")
        self.cad_report = QtWidgets.QLabel("")
        self.cad_report.setWordWrap(True)
        c.addWidget(self.cad_file)
        c.addWidget(self.cad_report)
        inlet = QtWidgets.QFormLayout()
        self.inlet_end = self.bind(ChoiceBox(self.draft, "geometry.inlet_end",
            [("As detected", "auto"), ("Lower-x end", "min"), ("Higher-x end", "max")],
            tooltip="Which end of the axis is the inlet. The analysis suggests one from the steeper "
                    "wall; confirm it here, or click an end in the 3D view.", default="auto"))
        inlet.addRow("Inlet end", self.inlet_end)
        c.addLayout(inlet)
        v.addWidget(self.cad)

        self.table = QtWidgets.QLabel("A tabulated wall is edited in its definition file.")
        self.table.setWordWrap(True)
        v.addWidget(self.table)
        v.addStretch(1)
        self.report = None  # geometry analysis report for a CAD file

    def refresh(self):
        super().refresh()
        t = self.draft().get("geometry.type")
        idx = [k for _, k in self.TYPES].index(t) if t in [k for _, k in self.TYPES] else 0
        self.kind.blockSignals(True)
        self.kind.setCurrentIndex(idx)
        self.kind.blockSignals(False)
        self.param.setVisible(t == "conical_nozzle")
        self.cad.setVisible(t == "cad_file")
        self.table.setVisible(t == "wall_profile")
        if t == "cad_file":
            self.cad_file.setText(self.draft().get("geometry.path", "no file"))

    def _kind_changed(self, idx):
        kind = self.TYPES[idx][1]
        if kind == self.draft().get("geometry.type"):
            return
        if kind == "conical_nozzle":
            self.draft().replace("geometry", {"type": "conical_nozzle", "throat_radius": 1e-3,
                                              "expansion_ratio": 2.88})
        elif kind == "cad_file":
            self._import()
            return
        else:
            self.kind.setCurrentIndex([k for _, k in self.TYPES].index(self.draft().get("geometry.type")))
            return
        self.window.draft.cad_profile = None
        self.refresh()
        self.changed.emit()

    def _import(self):
        path, _ = QtWidgets.QFileDialog.getOpenFileName(self, "Import a STEP fluid volume", "",
                                                        "STEP files (*.step *.stp)")
        if path:
            self.import_file(Path(path))
        else:
            self.refresh()

    def import_file(self, path: Path, synchronous: bool = False) -> None:
        """Copy the file into the project, analyse it, and point the draft at it."""
        from .. import geometry

        project = self.window.project
        rel = project.import_geometry(path)
        self.draft().replace("geometry", {"type": "cad_file", "path": rel,
                                          "sha256": geometry.sha256(project.root / rel),
                                          "inlet_end": "auto"})
        self.refresh()
        self.analyse(synchronous)

    def analyse(self, synchronous: bool = False) -> None:
        from .. import geometry

        rel = self.draft().get("geometry.path")
        if not rel:
            return
        file = self.window.project.root / rel
        unit = self.draft().get("geometry.length_unit", "mm")
        end = self.draft().get("geometry.inlet_end", "auto")
        self.cad_report.setText("analysing...")
        w = Worker(lambda: geometry.analyse(file, unit, end))
        w.done.connect(self._analysed)
        w.failed.connect(lambda msg: self.cad_report.setText(f"analysis failed: {msg}"))
        w.start(synchronous)

    def _analysed(self, report):
        self.report = report
        lines = [f"{report.kind.replace('_', ' ')}, {report.volumes} solid(s)"]
        lines += [f"<span style='color:#c62828'>{e}</span>" for e in report.errors]
        lines += [f"<span style='color:#c77700'>{w}</span>" for w in report.warnings]
        if report.ok:
            p = report.profile()
            rc = p.rc_over_rt
            lines.append(f"throat diameter {2e3 * p.throat_radius:.3f} mm, expansion ratio "
                         f"{p.expansion_ratio:.3f}, contraction {p.contraction_ratio:.2f}, "
                         f"Rc/Rt {rc:.2f}" if rc else "")
            lines.append(f"<b>suggested inlet: the {report.inlet_end} end "
                         f"({report.inlet_confidence} confidence)</b> - confirm below")
            self.window.draft.cad_profile = p
        else:
            self.window.draft.cad_profile = None
        self.cad_report.setText("<br>".join(x for x in lines if x))
        self.changed.emit()

    def pick(self, x: float, y: float, z: float) -> None:
        """A click in the 3D view on a CAD nozzle chooses the inlet end."""
        prof = self.window.draft.cad_profile
        if self.draft().get("geometry.type") != "cad_file" or prof is None:
            return
        # The profile runs inlet -> exit along +x; map the click to an end in
        # the file's own axis direction via the analysis report.
        near_inlet = abs(x - prof.x_inlet) < abs(x - prof.x_exit)
        current = self.report.inlet_end if self.report else "min"
        other = "max" if current == "min" else "min"
        self.draft().set("geometry.inlet_end", current if near_inlet else other)
        self.refresh()
        self.analyse()


# ----------------------------------------------------------------------------- physics


class PhysicsPage(Page):
    def __init__(self, window):
        super().__init__(window)
        v = QtWidgets.QVBoxLayout(self)
        b = "boundaries."
        box = QtWidgets.QGroupBox("Chamber (reservoir inlet)")
        f = QtWidgets.QFormLayout(box)
        row(f, "Stagnation pressure p0", self.bind(QuantityEdit(self.draft, b + "inlet.p0", "bar",
            minimum=0.0, tooltip="Chamber total pressure")), "bar")
        row(f, "Stagnation temperature T0", self.bind(QuantityEdit(self.draft, b + "inlet.T0", "K",
            minimum=1.0, default=300.0, tooltip="Chamber total temperature. Regulating from a bottle "
            "cools nitrogen (Joule-Thomson); the checks estimate by how much")), "K")
        v.addWidget(box)

        box = QtWidgets.QGroupBox("Surroundings")
        f = QtWidgets.QFormLayout(box)
        row(f, "Ambient pressure", self.bind(QuantityEdit(self.draft, b + "ambient.pressure", "bar",
            minimum=0.0, default=1.01325e5, tooltip="0 for vacuum")), "bar")
        row(f, "Ambient temperature", self.bind(QuantityEdit(self.draft, b + "ambient.temperature", "K",
            minimum=1.0, default=288.15)), "K")
        self.exit_kind = QtWidgets.QComboBox()
        for label in ("Plume region (sea level)", "Ends at the exit plane (vacuum)",
                      "Ends at the exit plane, fixed exit pressure (verification)"):
            self.exit_kind.addItem(label)
        self.exit_kind.setToolTip("The domain downstream of the nozzle. Anything but vacuum or a strongly "
                                  "underexpanded exit needs the plume region")
        self.exit_kind.currentIndexChanged.connect(self._exit_changed)
        f.addRow("Exit domain", self.exit_kind)
        self.plume_len = self.bind(QuantityEdit(self.draft, b + "exit_domain.length", minimum=1.0,
                                                default=20.0, tooltip="Plume length in exit diameters"))
        self.plume_rad = self.bind(QuantityEdit(self.draft, b + "exit_domain.radius", minimum=1.0,
                                                default=6.0, tooltip="Plume radius in exit diameters"))
        row(f, "Plume length", self.plume_len, "exit diameters")
        row(f, "Plume radius", self.plume_rad, "exit diameters")
        v.addWidget(box)

        box = QtWidgets.QGroupBox("Flow and gas")
        f = QtWidgets.QFormLayout(box)
        self.turb = QtWidgets.QComboBox()
        self._turb = [("k-omega SST (turbulent)", "k_omega_sst"), ("Laminar", "laminar"),
                      ("Inviscid", "inviscid")]
        for label, _ in self._turb:
            self.turb.addItem(label)
        self.turb.setToolTip("Small thrusters sit where boundary layers may be laminar; run both and "
                             "read the spread as the model uncertainty")
        self.turb.currentIndexChanged.connect(self._turb_changed)
        f.addRow("Viscous model", self.turb)
        self.wall = QtWidgets.QComboBox()
        self.wall.addItems(["Adiabatic", "Fixed temperature"])
        self.wall.currentIndexChanged.connect(self._wall_changed)
        f.addRow("Wall", self.wall)
        self.wall_T = self.bind(QuantityEdit(self.draft, b + "wall_thermal.temperature", "K", minimum=1.0,
                                             default=300.0))
        row(f, "Wall temperature", self.wall_T, "K")
        row(f, "Equation of state", self.bind(ChoiceBox(self.draft, "gas.equation_of_state",
            [("Perfect gas (default)", "perfect_gas"), ("Peng-Robinson", "peng_robinson")],
            default="perfect_gas", tooltip="Peng-Robinson over-predicts nitrogen's real-gas mass flux by "
            "about a quarter; the perfect gas plus the reported reference correction is more accurate")))
        row(f, "Solver", self.bind(ChoiceBox(self.draft, "numerics.solver",
            [("Automatic", "auto"), ("rhoPimpleFoam", "rhoPimpleFoam"), ("rhoCentralFoam", "rhoCentralFoam")],
            default="auto", tooltip="Automatic picks rhoCentralFoam when a shock or separation is "
            "expected inside the nozzle")))
        v.addWidget(box)

        self.prediction = QtWidgets.QLabel("")
        self.prediction.setTextFormat(QtCore.Qt.RichText)
        self.prediction.setWordWrap(True)
        v.addWidget(self.prediction)
        v.addStretch(1)

    def refresh(self):
        super().refresh()
        d = self.draft()
        t = d.get("boundaries.exit_domain.type", "plume")
        fixed = bool(d.get("boundaries.exit_domain.fixed_pressure", False))
        self._set(self.exit_kind, 0 if t == "plume" else (2 if fixed else 1))
        self.plume_len.setEnabled(t == "plume")
        self.plume_rad.setEnabled(t == "plume")
        tt = d.get("flow.turbulence.type", "k_omega_sst")
        self._set(self.turb, [k for _, k in self._turb].index(tt) if tt in [k for _, k in self._turb] else 0)
        wt = d.get("boundaries.wall_thermal.type", "adiabatic")
        self._set(self.wall, 1 if wt == "fixed_temperature" else 0)
        self.wall_T.setEnabled(wt == "fixed_temperature")

    @staticmethod
    def _set(combo, i):
        combo.blockSignals(True)
        combo.setCurrentIndex(i)
        combo.blockSignals(False)

    def _exit_changed(self, i):
        self.draft().replace("boundaries.exit_domain", [
            {"type": "plume"}, {"type": "truncated_at_exit"},
            {"type": "truncated_at_exit", "fixed_pressure": True}][i])
        self.refresh()
        self.changed.emit()

    def _turb_changed(self, i):
        self.draft().replace("flow.turbulence", {"type": self._turb[i][1]})
        self.changed.emit()

    def _wall_changed(self, i):
        self.draft().replace("boundaries.wall_thermal",
                             {"type": "adiabatic"} if i == 0 else {"type": "fixed_temperature",
                                                                   "temperature": 300.0})
        self.refresh()
        self.changed.emit()

    def show_prediction(self, pred) -> None:
        if pred is None:
            self.prediction.setText("")
            return
        cd = (f" (x Cd: {1e3 * pred.mass_flow_cd:.3f})" if pred.mass_flow_cd else "")
        self.prediction.setText(
            "<b>Quasi-1D prediction</b> (ideal, before CFD)<br>"
            f"regime: {pred.regime.replace('_', ' ')}<br>"
            f"mass flow {1e3 * pred.mass_flow:.3f} g/s{cd}<br>"
            f"thrust {pred.thrust:.4g} N, Isp {pred.isp:.1f} s<br>"
            f"exit Mach {pred.exit_mach:.3f}, exit pressure {pred.exit_pressure / 1e5:.4g} bar")


# ----------------------------------------------------------------------------- mesh


class MeshPage(Page):
    def __init__(self, window):
        super().__init__(window)
        v = QtWidgets.QVBoxLayout(self)
        box = QtWidgets.QGroupBox("Mesh")
        f = QtWidgets.QFormLayout(box)
        self.form = self.bind(ChoiceBox(self.draft, "mesh.form",
            [("Axisymmetric wedge", "wedge"), ("3D O-grid", "o_grid_3d"), ("Planar (2D nozzle)", "planar")],
            default="o_grid_3d", tooltip="The wedge is exact for axisymmetric flow and runs in minutes"))
        f.addRow("Form", self.form)
        self.width = self.bind(QuantityEdit(self.draft, "mesh.planar_width", "mm", minimum=0.0,
                                            tooltip="Planar nozzles: the width between the flat sidewalls"))
        row(f, "Planar width", self.width, "mm")
        row(f, "Quality", self.bind(ChoiceBox(self.draft, "mesh.quality",
            [("Standard", "standard"), ("Coarse", "coarse"), ("Fine", "fine")], default="standard")))
        row(f, "First cell y+", self.bind(QuantityEdit(self.draft, "mesh.first_cell_yplus", minimum=0.1,
            default=1.0, tooltip="1 resolves the wall; above 5 the wall law (Spalding) takes over, "
            "which large high-Reynolds nozzles need")))
        row(f, "Refinement", self.bind(QuantityEdit(self.draft, "mesh.refinement", minimum=0.25, default=1.0,
            tooltip="Divides every cell size of the preset; grid studies use it")))
        v.addWidget(box)
        self.form.edited.connect(self._form_changed)
        btn = QtWidgets.QPushButton("Preview mesh")
        btn.clicked.connect(lambda: self.preview())
        v.addWidget(btn)
        self.stats = QtWidgets.QLabel("")
        self.stats.setWordWrap(True)
        v.addWidget(self.stats)
        v.addStretch(1)

    def refresh(self):
        super().refresh()
        self.width.setEnabled(self.draft().get("mesh.form") == "planar")

    def _form_changed(self):
        d = self.draft()
        if d.get("mesh.form") == "planar" and not d.get("mesh.planar_width"):
            d.set("mesh.planar_width", 0.02)
        elif d.get("mesh.form") != "planar":
            d.set("mesh.planar_width", None)
        self.refresh()
        self.changed.emit()

    def preview(self, synchronous: bool = False) -> None:
        from ..mesh import revolved, sizing
        from ..post import scene

        a = self.window.assessment
        if a is None or a.definition is None or a.profile is None:
            self.stats.setText("The definition is incomplete; see the checks.")
            return
        defn, profile = a.definition, a.profile

        def build():
            mesh, meta = revolved.build(profile, sizing.spec_for(defn, profile))
            return mesh, meta, scene.mesh_boundary(mesh)

        self.stats.setText("building...")
        w = Worker(build)
        w.done.connect(self._built)
        w.failed.connect(lambda m: self.stats.setText(f"mesh generation failed: {m}"))
        w.start(synchronous)

    def _built(self, result):
        mesh, meta, surfaces = result
        first = meta.wall_first_cell_at_throat
        wall = ("inviscid (slip) wall" if not np.isfinite(first)
                else f"first cell at the throat {1e6 * first:.2f} micron")
        self.stats.setText(f"<b>{mesh.n_cells}</b> cells, {len(meta.stations)} axial stations, {wall}. "
                           "OpenFOAM's checkMesh gates the mesh when the run starts.")
        shown = [s for s in surfaces if s.name in ("front", "wall", "inlet", "outlet", "lip", "ambient")]
        self.window.viewport.show_surfaces(shown or surfaces, f"mesh: {mesh.n_cells} cells", edges=True,
                                           view="side")


# ----------------------------------------------------------------------------- run


class RunPage(Page):
    SERIES_PENS = {"inlet mass flow": "#2d6cdf", "exit mass flow": "#c77700", "exit thrust": "#2e7d32"}

    def __init__(self, window):
        super().__init__(window)
        import pyqtgraph as pg

        pg.setConfigOptions(antialias=True, background="w", foreground="#333")
        v = QtWidgets.QVBoxLayout(self)
        top = QtWidgets.QHBoxLayout()
        top.addWidget(QtWidgets.QLabel("Processors"))
        self.procs = QtWidgets.QSpinBox()
        self.procs.setRange(1, max(1, os.cpu_count() or 1))
        self.procs.setValue(max(1, min(4, os.cpu_count() or 1)))
        top.addWidget(self.procs)
        self.run_btn = QtWidgets.QPushButton("Run")
        self.cancel_btn = QtWidgets.QPushButton("Cancel")
        self.cancel_btn.setEnabled(False)
        top.addWidget(self.run_btn)
        top.addWidget(self.cancel_btn)
        top.addStretch(1)
        v.addLayout(top)
        self.state = QtWidgets.QLabel("idle")
        v.addWidget(self.state)
        # The verdict comes first: it says whether the numbers may be used.
        self.summary = QtWidgets.QLabel("")
        self.summary.setTextFormat(QtCore.Qt.RichText)
        self.summary.setWordWrap(True)
        self.summary.setTextInteractionFlags(QtCore.Qt.TextSelectableByMouse)
        v.addWidget(self.summary)

        self.flow_plot = pg.PlotWidget(title="Mass flow and thrust / latest inlet value")
        self.flow_plot.addLegend(offset=(-10, 10))
        self.flow_plot.setLabel("bottom", "iteration")
        self.res_plot = pg.PlotWidget(title="Initial residuals")
        self.res_plot.setLogMode(y=True)
        self.res_plot.setLabel("bottom", "iteration")
        self.res_plot.addLegend(offset=(-10, 10))
        v.addWidget(self.flow_plot, 2)
        v.addWidget(self.res_plot, 1)
        self.curves: dict = {}

        self.log = QtWidgets.QPlainTextEdit()
        self.log.setReadOnly(True)
        self.log.setMaximumBlockCount(5000)
        self.log.setFont(QtGui.QFontDatabase.systemFont(QtGui.QFontDatabase.FixedFont))
        self.log.setMinimumHeight(120)
        v.addWidget(self.log, 1)

    def clear(self):
        self.flow_plot.clear()
        self.res_plot.clear()
        self.curves = {}
        self.log.clear()
        self.summary.setText("")

    def append_event(self, stage: str, message: str) -> None:
        self.log.appendPlainText(f"[{stage}] {message}")
        if stage not in ("output", "stderr"):
            self.state.setText(f"<b>{stage}</b>: {message[:120]}")

    def update_series(self, data: dict) -> None:
        import pyqtgraph as pg

        ref = None
        if "inlet mass flow" in data and len(data["inlet mass flow"][1]):
            ref = float(np.mean(data["inlet mass flow"][1][-20:])) or None
        thrust_ref = None
        if "exit thrust" in data and len(data["exit thrust"][1]):
            thrust_ref = float(np.mean(data["exit thrust"][1][-20:])) or None
        two_d = self.window.draft.get("mesh.form", "o_grid_3d") != "o_grid_3d"
        for name, (t, y) in data.items():
            if two_d and name == "residual Uz":
                continue  # out-of-plane on a wedge or planar mesh: no information
            if name.startswith("residual "):
                plot, norm = self.res_plot, 1.0
                y = np.where(y > 0, y, np.nan)
            else:
                plot = self.flow_plot
                norm = thrust_ref if name == "exit thrust" else ref
                if not norm:
                    continue
            if name not in self.curves:
                colour = self.SERIES_PENS.get(name, pg.intColor(len(self.curves), hues=9))
                self.curves[name] = plot.plot(name=name, pen=pg.mkPen(colour, width=1.5))
            self.curves[name].setData(np.asarray(t, float), np.asarray(y, float) / norm)

    def show_result(self, info: RunInfo) -> None:
        colour = {"trusted": "#2e7d32", "trusted_with_warnings": "#c77700"}.get(info.trust, "#c62828")
        lines = [f"<b>{info.id}</b>: {info.status}, "
                 f"<span style='color:{colour}'><b>{(info.trust or 'not trustworthy').replace('_', ' ')}</b></span>"]
        metrics_file = Path(info.path) / "metrics.json"
        if metrics_file.is_file():
            import json

            m = json.loads(metrics_file.read_text(encoding="utf-8"))
            lines.append(f"mass flow {1e3 * m['mass_flow']['inlet']:.4f} g/s (Cd "
                         f"{m['discharge_coefficient']['cfd']:.4f}), thrust {m['thrust']['total']:.4f} N, "
                         f"Isp {m['specific_impulse']['cfd']:.2f} s, exit Mach "
                         f"{m['exit'].get('mach_mass_avg') or float('nan'):.3f}")
            verdict = m.get("verdict", {})
            for r in verdict.get("reasons", []):
                lines.append(f"<span style='color:#c62828'>not trustworthy: {r}</span>")
            for w in verdict.get("warnings", []):
                lines.append(f"<span style='color:#c77700'>warning: {w}</span>")
        self.summary.setText("<br>".join(lines))
        self.state.setText(f"<b>finished</b>: {info.status}")
