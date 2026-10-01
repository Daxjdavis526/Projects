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
        btn = QtWidgets.QPushButton("Import STEP or STL file...")
        btn.clicked.connect(self._import)
        c.addWidget(btn)
        self.extract_btn = QtWidgets.QPushButton("Extract the gas passage...")
        self.extract_btn.setToolTip("The file is a solid thruster body: find the passage through it, show it, "
                                    "and use it as the fluid volume once you confirm")
        self.extract_btn.clicked.connect(lambda: self.extract())
        self.extract_btn.setVisible(False)
        c.addWidget(self.extract_btn)
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
        path, _ = QtWidgets.QFileDialog.getOpenFileName(self, "Import a fluid volume", "",
                                                        "STEP or STL (*.step *.stp *.stl)")
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

    def extract(self, synchronous: bool = False) -> None:
        """Extract a solid body's gas passage and preview it; import it once
        the user confirms (DESIGN.md section 3.6)."""
        from .. import geometry
        from ..geometry import surface as stl_surface
        from ..post import scene

        rel = self.draft().get("geometry.path")
        if not rel:
            return
        root = self.window.project.root
        src = root / rel
        out = root / "geometry" / (Path(rel).stem + "-fluid.step")
        unit = self.draft().get("geometry.length_unit", "mm")

        def work():
            rep = geometry.extract_fluid(src, unit, out)
            surfaces = []
            if rep["ok"]:
                stl = geometry.tessellate(out, unit, out.with_suffix(".preview.stl"), 1e9)
                mesh = stl_surface.load(stl, 1.0)
                surfaces = [scene.from_triangles(mesh.vertices, mesh.faces, "gas passage")]
            return rep, surfaces

        self.cad_report.setText("extracting the gas passage...")
        w = Worker(work)
        w.done.connect(self._extracted)
        w.failed.connect(lambda msg: self.cad_report.setText(f"extraction failed: {msg}"))
        self._extract_target, self._extract_sync = out, synchronous
        w.start(synchronous)

    def _extracted(self, result):
        rep, surfaces = result
        lines = [f"{rep['caps']} openings capped; {len(rep['cavities'])} closed cavities"]
        lines += [f"<span style='color:#c62828'>{e}</span>" for e in rep["errors"]]
        if not rep["ok"]:
            self.cad_report.setText("<br>".join(lines))
            return
        vol = 1e9 * rep["chosen"]["volume"]
        self.window.viewport.show_surfaces(surfaces, f"extracted gas passage, {vol:.3f} mm^3 (preview)",
                                           view="iso")
        self.cad_report.setText("<br>".join(lines + [f"passage {vol:.3f} mm^3 between two openings"]))
        if self.window.ask("Use the extracted gas passage?",
                           f"The passage through the body ({vol:.3f} mm^3, shown in the 3D view) becomes "
                           "the fluid volume. Cavities with a single opening (blind holes) are left out."):
            self.import_file(self._extract_target, synchronous=self._extract_sync)

    def _analysed(self, report):
        self.report = report
        self.extract_btn.setVisible(report.kind == "solid_body")
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
            if not report.axisymmetric:
                # Only the unstructured mesher can mesh it.
                self.draft().set("mesh.form", "unstructured")
                self.draft().set("mesh.planar_width", None)
                lines.append("not a body of revolution: the mesh is unstructured (Tier 2), and "
                             "quasi-1D theory uses the area-equivalent radius")
            if report.source == "stl":
                lines.append(f"STL surface: {report.checks.get('triangles')} triangles, watertight, "
                             "one body (self-intersection is checked when the run starts)")
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
        box = QtWidgets.QGroupBox("Chamber (inlet)")
        f = QtWidgets.QFormLayout(box)
        self.inlet_kind = QtWidgets.QComboBox()
        self.inlet_kind.addItems(["Chamber pressure", "Mass flow"])
        self.inlet_kind.setToolTip("State the chamber pressure and the CFD finds the mass flow, or state "
                                   "the mass flow and it finds the chamber pressure")
        self.inlet_kind.currentIndexChanged.connect(self._inlet_changed)
        f.addRow("Inlet", self.inlet_kind)
        self.p0 = self.bind(QuantityEdit(self.draft, b + "inlet.p0", "bar", minimum=0.0,
                                         tooltip="Chamber total pressure"))
        row(f, "Stagnation pressure p0", self.p0, "bar")
        self.mass_flow = self.bind(QuantityEdit(self.draft, b + "inlet.mass_flow", "g/s", minimum=0.0,
                                                tooltip="Mass flow through the nozzle; the chamber pressure "
                                                "floats to whatever passes it"))
        row(f, "Mass flow", self.mass_flow, "g/s")
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
            [("Perfect gas (default)", "perfect_gas"), ("Virial real gas (nitrogen)", "virial"),
             ("Peng-Robinson", "peng_robinson")],
            default="perfect_gas", tooltip="The virial gas puts nitrogen's real-gas behaviour in the CFD, "
            "within about 0.01 % of the reference equation's choked flux up to 30 bar. Peng-Robinson "
            "over-predicts the real-gas effect by about a quarter. The perfect gas reports the reference "
            "correction beside its results")))
        row(f, "Solver", self.bind(ChoiceBox(self.draft, "numerics.solver",
            [("Automatic", "auto"), ("rhoPimpleFoam", "rhoPimpleFoam"), ("rhoCentralFoam", "rhoCentralFoam")],
            default="auto", tooltip="Automatic picks rhoCentralFoam when a shock or separation is "
            "expected inside the nozzle")))
        v.addWidget(box)

        box = QtWidgets.QGroupBox("Time")
        f = QtWidgets.QFormLayout(box)
        self.time_kind = QtWidgets.QComboBox()
        self.time_kind.addItems(["Steady state", "Startup (time-accurate)"])
        self.time_kind.setToolTip("A startup opens the valve on a domain at rest and follows the flow in "
                                  "time with rhoCentralFoam: rise time, overshoot, settling, an animation")
        self.time_kind.currentIndexChanged.connect(self._time_changed)
        f.addRow("Run", self.time_kind)
        t = "flow.time."
        self.end_time = self.bind(QuantityEdit(self.draft, t + "end_time", "ms", minimum=1e-6, default=1e-3,
                                               tooltip="How long to follow the startup. It must settle "
                                               "by then for the end state to count as steady"))
        self.ramp_time = self.bind(QuantityEdit(self.draft, t + "ramp_time", "ms", minimum=0.0, default=0.0,
                                                tooltip="Valve opening time: the chamber pressure rises "
                                                "linearly from ambient to p0. An instant opening into vacuum "
                                                "can diverge"))
        self.frames = self.bind(QuantityEdit(self.draft, t + "frames", minimum=1.0, default=40, integer=True,
                                             tooltip="Fields written over the run: the animation's frames"))
        row(f, "End time", self.end_time, "ms")
        row(f, "Valve opening", self.ramp_time, "ms")
        row(f, "Frames", self.frames)
        v.addWidget(box)

        self.prediction = QtWidgets.QLabel("")
        self.prediction.setTextFormat(QtCore.Qt.RichText)
        self.prediction.setWordWrap(True)
        v.addWidget(self.prediction)
        v.addStretch(1)

    def refresh(self):
        super().refresh()
        d = self.draft()
        mass_flow = d.get("boundaries.inlet.type") == "mass_flow_inlet"
        self._set(self.inlet_kind, 1 if mass_flow else 0)
        self.p0.setEnabled(not mass_flow)
        self.mass_flow.setEnabled(mass_flow)
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
        transient = d.get("flow.time.type", "steady") == "transient"
        self._set(self.time_kind, 1 if transient else 0)
        for w in (self.end_time, self.ramp_time, self.frames):
            w.setEnabled(transient)

    @staticmethod
    def _set(combo, i):
        combo.blockSignals(True)
        combo.setCurrentIndex(i)
        combo.blockSignals(False)

    def _inlet_changed(self, i):
        """Switch the inlet, carrying over the flow or pressure that
        quasi-1D theory says the other setting implies."""
        d = self.draft()
        old = dict(d.get("boundaries.inlet") or {})
        pred = getattr(self.window, "assessment", None)
        pred = pred.prediction if pred is not None else None
        keep = {k: old[k] for k in ("T0", "turbulence_intensity", "turbulence_length_fraction") if k in old}
        if i == 1:
            new = {"type": "mass_flow_inlet", "mass_flow": pred.mass_flow if pred else 5e-3}
        else:
            p0 = pred.p0 if pred is not None and getattr(pred, "p0", None) else 20e5
            new = {"type": "reservoir_inlet", "p0": p0}
        d.replace("boundaries.inlet", new | keep)
        self.refresh()
        self.changed.emit()

    def _exit_changed(self, i):
        self.draft().replace("boundaries.exit_domain", [
            {"type": "plume"}, {"type": "truncated_at_exit"},
            {"type": "truncated_at_exit", "fixed_pressure": True}][i])
        self.refresh()
        self.changed.emit()

    def _turb_changed(self, i):
        self.draft().replace("flow.turbulence", {"type": self._turb[i][1]})
        self.changed.emit()

    def _time_changed(self, i):
        # A startup defaults to V15's: 1 ms, the valve opening over a tenth.
        self.draft().replace("flow.time", {"type": "steady"} if i == 0 else
                             {"type": "transient", "end_time": 1e-3, "ramp_time": 1e-4, "frames": 40})
        self.refresh()
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
            f"exit Mach {pred.exit_mach:.3f}, exit pressure {pred.exit_pressure / 1e5:.4g} bar"
            + (f"<br>chamber pressure {pred.p0 / 1e5:.4g} bar (implied by the mass flow; the CFD "
               "measures the real one)" if pred.p0 and self.inlet_kind.currentIndex() == 1 else ""))


# ----------------------------------------------------------------------------- mesh


class MeshPage(Page):
    def __init__(self, window):
        super().__init__(window)
        v = QtWidgets.QVBoxLayout(self)
        box = QtWidgets.QGroupBox("Mesh")
        f = QtWidgets.QFormLayout(box)
        self.form = self.bind(ChoiceBox(self.draft, "mesh.form",
            [("Axisymmetric wedge", "wedge"), ("3D O-grid", "o_grid_3d"), ("Planar (2D nozzle)", "planar"),
             ("Unstructured 3D (any volume)", "unstructured")],
            default="o_grid_3d", tooltip="The wedge is exact for axisymmetric flow and runs in minutes; "
            "unstructured meshes any fluid volume with snappyHexMesh (gmsh as the fallback)"))
        f.addRow("Form", self.form)
        self.mesher = self.bind(ChoiceBox(self.draft, "mesh.mesher",
            [("Automatic (snappyHexMesh / cfMesh / gmsh)", "auto"), ("snappyHexMesh only", "snappy"),
             ("cfMesh only", "cfmesh"), ("gmsh only", "gmsh")], default="auto",
            tooltip="Automatic tries snappyHexMesh first for inviscid runs and cfMesh first for viscous "
            "ones (its wall layers cover the wall), then the others; a mesh whose layers miss the "
            "wall is rejected"))
        row(f, "Unstructured mesher", self.mesher)
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
        self.mesher.setEnabled(self.draft().get("mesh.form") == "unstructured")

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
        if defn.mesh.form.value == "unstructured":
            self.stats.setText("The unstructured mesh is built by snappyHexMesh (OpenFOAM) when the run "
                               "starts; its wall-layer coverage and checkMesh gate are reported then.")
            return

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


# ----------------------------------------------------------------------------- results


class ResultsPage(Page):
    """A finished run's fields: field and range, surfaces, cutting plane,
    vectors, streamlines, a cell-value probe, axial plots, the engineering
    summary with its verdict, and report export."""

    AXIAL = [("p / p0", "p"), ("Mach", "mach"), ("T / T0", "T")]

    def __init__(self, window):
        super().__init__(window)
        import pyqtgraph as pg

        self.results = None
        v = QtWidgets.QVBoxLayout(self)
        self.title = QtWidgets.QLabel("No run selected: pick one in the project tree.")
        self.title.setWordWrap(True)
        v.addWidget(self.title)

        box = QtWidgets.QGroupBox("Field")
        f = QtWidgets.QFormLayout(box)
        self.field = QtWidgets.QComboBox()
        self.field.setToolTip("Cell values, as the solver computed them")
        self.field.currentIndexChanged.connect(lambda *_: self._range_auto())
        f.addRow("Field", self.field)
        rng = QtWidgets.QHBoxLayout()
        self.auto = QtWidgets.QCheckBox("auto")
        self.auto.setChecked(True)
        self.auto.toggled.connect(lambda on: self._range_auto() if on else None)
        self.lo, self.hi = QtWidgets.QLineEdit(), QtWidgets.QLineEdit()
        for w in (self.lo, self.hi):
            w.setMaximumWidth(90)
            w.editingFinished.connect(self._manual_range)
        rng.addWidget(self.auto)
        rng.addWidget(self.lo)
        rng.addWidget(QtWidgets.QLabel("to"))
        rng.addWidget(self.hi)
        rng.addStretch(1)
        f.addRow("Range", rng)
        self.data_range = QtWidgets.QLabel("")
        f.addRow("Data", self.data_range)
        # A transient's written times; hidden for a steady run (one time).
        self.time_row = QtWidgets.QWidget()
        tr = QtWidgets.QHBoxLayout(self.time_row)
        tr.setContentsMargins(0, 0, 0, 0)
        self.time_slider = QtWidgets.QSlider(QtCore.Qt.Horizontal)
        self.time_slider.setToolTip("Written times of the run; the fields are reloaded at the one chosen")
        self.time_slider.sliderReleased.connect(lambda: self.show_time(self.time_slider.value()))
        self.time_slider.valueChanged.connect(self._time_label)
        self.time_value = QtWidgets.QLabel("")
        self.animation_btn = QtWidgets.QPushButton("Animation...")
        self.animation_btn.setToolTip("Open the run's Mach-number animation (frames/Mach.gif)")
        self.animation_btn.clicked.connect(self._open_animation)
        tr.addWidget(self.time_slider, 1)
        tr.addWidget(self.time_value)
        tr.addWidget(self.animation_btn)
        f.addRow("Time", self.time_row)
        self.time_row.setVisible(False)
        self._times: list[float] = []
        v.addWidget(box)

        box = QtWidgets.QGroupBox("Show")
        g = QtWidgets.QGridLayout(box)
        self.meridian = QtWidgets.QCheckBox("Meridian plane")
        self.meridian.setChecked(True)
        self.meridian.setToolTip("The plane through the axis; mirrored for axisymmetric and planar runs")
        g.addWidget(self.meridian, 0, 0)
        self.vectors = QtWidgets.QCheckBox("Velocity vectors")
        self.streamlines = QtWidgets.QCheckBox("Streamlines")
        g.addWidget(self.vectors, 0, 1)
        g.addWidget(self.streamlines, 1, 1)
        self.patch_box = QtWidgets.QWidget()
        self.patch_layout = QtWidgets.QVBoxLayout(self.patch_box)
        self.patch_layout.setContentsMargins(0, 0, 0, 0)
        g.addWidget(self.patch_box, 1, 0, 2, 1)
        self.patch_checks: dict[str, QtWidgets.QCheckBox] = {}
        cut = QtWidgets.QHBoxLayout()
        self.cut = QtWidgets.QCheckBox("Cutting plane")
        self.cut_axis = QtWidgets.QComboBox()
        self.cut_axis.addItems(["x (cross-section)", "y", "z"])
        self.cut_pos = QtWidgets.QSlider(QtCore.Qt.Horizontal)
        self.cut_pos.setRange(0, 1000)
        self.cut_pos.setValue(500)
        cut.addWidget(self.cut)
        cut.addWidget(self.cut_axis)
        cut.addWidget(self.cut_pos, 1)
        g.addLayout(cut, 3, 0, 1, 2)
        self.cut_label = QtWidgets.QLabel("")
        g.addWidget(self.cut_label, 4, 0, 1, 2)
        self.extent = QtWidgets.QComboBox()
        self.extent.addItems(["Nozzle and near plume", "Whole domain"])
        self.extent.setToolTip("The near plume is three exit diameters; the whole domain includes the far "
                               "plume, where the nozzle becomes a speck")
        self.extent.currentIndexChanged.connect(lambda *_: (self.redraw(keep_camera=False), self._axial()))
        g.addWidget(self.extent, 5, 0, 1, 2)
        for w in (self.meridian, self.vectors, self.streamlines, self.cut):
            w.toggled.connect(lambda *_: self.redraw(keep_camera=True))
        self.cut_axis.currentIndexChanged.connect(lambda *_: self.redraw(keep_camera=True))
        self.cut_pos.valueChanged.connect(lambda *_: self.redraw(keep_camera=True) if self.cut.isChecked() else None)
        v.addWidget(box)

        self.probe_table = QtWidgets.QTableWidget(0, 2)
        self.probe_table.setHorizontalHeaderLabels(["probe", "cell value"])
        self.probe_table.setToolTip("Click a point in the 3D view to read the cell there")
        self.probe_table.horizontalHeader().setStretchLastSection(True)
        self.probe_table.setMaximumHeight(200)
        v.addWidget(self.probe_table)

        axial = QtWidgets.QHBoxLayout()
        axial.addWidget(QtWidgets.QLabel("Axial plot"))
        self.axial_var = QtWidgets.QComboBox()
        self.axial_var.addItems([a for a, _ in self.AXIAL])
        self.axial_var.currentIndexChanged.connect(lambda *_: self._axial())
        axial.addWidget(self.axial_var)
        axial.addStretch(1)
        v.addLayout(axial)
        self.axial_plot = pg.PlotWidget()
        self.axial_plot.addLegend(offset=(-10, 10))
        self.axial_plot.setLabel("bottom", "x [mm]")
        self.axial_plot.setMinimumHeight(220)
        v.addWidget(self.axial_plot)

        self.summary = QtWidgets.QLabel("")
        self.summary.setTextFormat(QtCore.Qt.RichText)
        self.summary.setWordWrap(True)
        self.summary.setTextInteractionFlags(QtCore.Qt.TextSelectableByMouse)
        v.addWidget(self.summary)
        self.table = QtWidgets.QTableWidget(0, 3)
        self.table.setHorizontalHeaderLabels(["quantity", "CFD", "ideal / reference"])
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.setMinimumHeight(260)
        v.addWidget(self.table)
        export = QtWidgets.QPushButton("Export report (PDF, PNG, JSON)...")
        export.clicked.connect(self._export_dialog)
        v.addWidget(export)
        self.export_status = QtWidgets.QLabel("")
        self.export_status.setWordWrap(True)
        v.addWidget(self.export_status)
        v.addStretch(1)

    # -- loading -----------------------------------------------------------------------

    def load(self, run_dir: Path, time: float | None = None) -> bool:
        from ..post.fieldview import FIELDS, ResultsError, RunResults

        keep = self.current_field() if time is not None else None
        try:
            r = RunResults(run_dir, time=time)
            fields = r.fields()
        except (ResultsError, OSError, KeyError, ValueError) as e:
            self.results = None
            self.title.setText(f"<b>{Path(run_dir).name}</b>: no fields to show ({e})")
            return False
        self.results = r
        self.title.setText(f"<b>{r.run_dir.name}</b> - {r.definition.name}, time {r.time}, "
                           f"{r.form} mesh, {r.internal.n_cells} cells")
        self.field.blockSignals(True)
        self.field.clear()
        for name in fields:
            info = FIELDS[name]
            self.field.addItem(f"{info.label}" + (f" [{info.unit}]" if info.unit else ""), name)
        if keep is not None and self.field.findData(keep) >= 0:
            self.field.setCurrentIndex(self.field.findData(keep))
        self.field.blockSignals(False)
        self._times = r.times()
        self.time_row.setVisible(len(self._times) > 1)
        if len(self._times) > 1:
            self.time_slider.blockSignals(True)
            self.time_slider.setRange(0, len(self._times) - 1)
            now = min(range(len(self._times)), key=lambda i: abs(self._times[i] - float(r.time)))
            self.time_slider.setValue(now)
            self.time_slider.blockSignals(False)
            self._time_label(now)
            self.animation_btn.setEnabled((r.run_dir / "frames" / "Mach.gif").is_file())
        if keep is not None:
            # Another time of the same run: keep the view, the range (when
            # fixed) and the surfaces as they are.
            if self.auto.isChecked():
                self._range_auto(redraw=False)
            self.redraw(keep_camera=True)
            return True
        for w in self.patch_checks.values():
            w.setParent(None)
        self.patch_checks = {}
        for name in r.display_patches():
            cb = QtWidgets.QCheckBox(f"patch: {name}")
            cb.setChecked(name == "wall" and r.form == "o_grid")
            cb.toggled.connect(lambda *_: self.redraw(keep_camera=True))
            self.patch_layout.addWidget(cb)
            self.patch_checks[name] = cb
        self._summary()
        self._axial()
        self._range_auto(redraw=False)
        self.redraw(keep_camera=False)
        return True

    def show_time(self, index: int) -> None:
        if self.results is not None and 0 <= index < len(self._times):
            self.load(self.results.run_dir, time=self._times[index])

    def _time_label(self, index: int) -> None:
        if 0 <= index < len(self._times):
            self.time_value.setText(f"{1e3 * self._times[index]:.4g} ms")

    def _open_animation(self) -> None:
        if self.results is not None:
            gif = self.results.run_dir / "frames" / "Mach.gif"
            QtGui.QDesktopServices.openUrl(QtCore.QUrl.fromLocalFile(str(gif)))

    def current_field(self) -> str | None:
        return self.field.currentData()

    def _range_auto(self, redraw: bool = True):
        if self.results is None or not self.current_field():
            return
        lo, hi = self.results.range(self.current_field())
        self.data_range.setText(f"min {lo:.5g}, max {hi:.5g}")
        if self.auto.isChecked():
            self.lo.setText(f"{lo:.5g}")
            self.hi.setText(f"{hi:.5g}")
        if redraw:
            self.redraw(keep_camera=True)

    def _manual_range(self):
        self.auto.setChecked(False)
        self.redraw(keep_camera=True)

    def clim(self) -> tuple[float, float] | None:
        try:
            lo, hi = float(self.lo.text()), float(self.hi.text())
        except ValueError:
            return None
        return (lo, hi) if hi > lo else None

    # -- drawing ------------------------------------------------------------------------

    def redraw(self, keep_camera: bool = False):
        from ..post.fieldview import FIELDS

        r = self.results
        field = self.current_field()
        if r is None or field is None:
            return
        info = FIELDS[field]
        clim = self.clim() or r.range(field)
        items = []
        box = None if self.extent.currentIndex() == 1 else r.near_field()

        def framed(ds):
            return r.clip(ds, box) if box is not None else ds

        def coloured(ds):
            ds = framed(ds)
            ds.cell_data["shown"] = np.asarray(ds.cell_data[field], dtype=float) * info.scale
            return ds, {"scalars": "shown", "cmap": info.colormap, "clim": clim,
                        "show_scalar_bar": False, "pickable": True}

        if self.meridian.isChecked():
            items.append(coloured(r.meridian()))
        for name, cb in self.patch_checks.items():
            if cb.isChecked():
                patch = r.patch(name)
                if patch is not None and field in patch.cell_data:
                    ds, kw = coloured(patch)
                    kw["opacity"] = 0.6 if name == "wall" else 1.0
                    items.append((ds, kw))
        self.cut_label.setText("")
        if self.cut.isChecked():
            b = r.internal.bounds
            axis = self.cut_axis.currentIndex()
            t = self.cut_pos.value() / 1000.0
            lo, hi = b[2 * axis], b[2 * axis + 1]
            pos = lo + t * (hi - lo)
            origin = [0.0, 0.0, 0.0]
            origin[axis] = pos
            normal = [0.0, 0.0, 0.0]
            normal[axis] = 1.0
            plane = r.cutting_plane(tuple(normal), tuple(origin))
            if plane.n_cells:
                items.append(coloured(plane))
            self.cut_label.setText(f"plane {'xyz'[axis]} = {1e3 * pos:.3f} mm"
                                   + (" (a wedge or planar mesh shows a line here)"
                                      if r.mirrored and axis == 0 else ""))
        if self.vectors.isChecked():
            base = framed(r.meridian())
            items.append((r.vectors(base), {"color": "#222222", "pickable": False}))
        if self.streamlines.isChecked():
            try:
                lines = framed(r.streamlines())
                if lines.n_points:
                    items.append((lines, {"color": "white", "line_width": 1, "pickable": False}))
            except Exception as e:  # streamlines are a display aid; say why they are missing
                self.cut_label.setText(f"streamlines unavailable: {e}")
        lo_d, hi_d = r.range(field)
        title = info.label + (f" [{info.unit}]" if info.unit else "")
        self.window.viewport.show_datasets(
            items, f"{title}: data {lo_d:.5g} to {hi_d:.5g}; shown {clim[0]:.5g} to {clim[1]:.5g}",
            view=None if keep_camera else ("iso" if r.form == "o_grid" and not self.meridian.isChecked()
                                           else "side"),
            legend=(title, clim[0], clim[1]))

    def _axial(self):
        import pyqtgraph as pg

        self.axial_plot.clear()
        r = self.results
        if r is None:
            return
        label, key = self.AXIAL[self.axial_var.currentIndex()]
        inlet = r.definition.boundaries.inlet
        norm = {"p": r.p0, "T": inlet.T0, "mach": 1.0}[key]
        data = r.axial()
        self.axial_plot.setLabel("left", label)
        styles = {"quasi_1d": ("quasi-1D", pg.mkPen("#000000", width=1, style=QtCore.Qt.DashLine)),
                  "centreline": ("CFD, axis", pg.mkPen("#2d6cdf", width=2)),
                  "wall": ("CFD, wall" + (" (adiabatic wall T)" if key == "T" else ""),
                           pg.mkPen("#c77700", width=1.5))}
        for line, (name, pen) in styles.items():
            d = data.get(line)
            if d is None or key not in d or not len(d[key]) or (line == "wall" and key == "mach"):
                continue
            self.axial_plot.plot(1e3 * np.asarray(d["x"]), np.asarray(d[key]) / norm, name=name, pen=pen)
        if self.extent.currentIndex() == 0:  # the same frame as the 3D view
            box = r.near_field()
            self.axial_plot.setXRange(1e3 * box[0], 1e3 * box[1], padding=0.02)
        else:
            self.axial_plot.enableAutoRange(axis="x")

    def _summary(self):
        s = self.results.summary()
        colour = {"trusted": "#2e7d32", "trusted_with_warnings": "#c77700"}.get(s.get("trust"), "#c62828")
        lines = [f"<b>{s.get('status')}</b>: <span style='color:{colour}'><b>"
                 f"{(s.get('trust') or 'not trustworthy').replace('_', ' ')}</b></span>"]
        lines += [f"<span style='color:#c62828'>not trustworthy: {x}</span>" for x in s.get("reasons", [])]
        lines += [f"<span style='color:#c77700'>warning: {x}</span>" for x in s.get("warnings", [])]
        self.summary.setText("<br>".join(lines))
        rows = s.get("rows", [])
        self.table.setRowCount(len(rows))
        for i, cells in enumerate(rows):
            for j, text in enumerate(cells):
                self.table.setItem(i, j, QtWidgets.QTableWidgetItem(text))
        self.table.resizeColumnsToContents()

    # -- probe and export -----------------------------------------------------------------

    def probe(self, x: float, y: float, z: float) -> dict | None:
        from ..post.fieldview import FIELDS

        if self.results is None:
            return None
        got = self.results.probe((x, y, z))
        if got is None:
            self.probe_table.setRowCount(1)
            self.probe_table.setItem(0, 0, QtWidgets.QTableWidgetItem("outside the domain"))
            self.probe_table.setItem(0, 1, QtWidgets.QTableWidgetItem(""))
            return None
        rows = [("cell", str(got["cell"])),
                ("x, r [mm]", f"{1e3 * got['point'][0]:.4f}, {1e3 * math.hypot(*got['point'][1:]):.4f}")]
        for name, value in got["values"].items():
            info = FIELDS[name]
            rows.append((info.label + (f" [{info.unit}]" if info.unit else ""), f"{value:.6g}"))
        self.probe_table.setRowCount(len(rows))
        for i, (a, b) in enumerate(rows):
            self.probe_table.setItem(i, 0, QtWidgets.QTableWidgetItem(a))
            self.probe_table.setItem(i, 1, QtWidgets.QTableWidgetItem(b))
        return got

    def _export_dialog(self):
        if self.results is None:
            return
        target = QtWidgets.QFileDialog.getExistingDirectory(self, "Export the report to a folder",
                                                            str(self.results.run_dir))
        if target:
            self.export(Path(target))

    def export(self, target: Path, synchronous: bool = False) -> None:
        from ..post import report

        run_dir = self.results.run_dir
        self.export_status.setText("exporting...")
        w = Worker(lambda: report.export(run_dir, target))
        w.done.connect(lambda files: self.export_status.setText(
            f"wrote {len(files)} files to {target}: " + ", ".join(sorted(p.name for p in files.values()))))
        w.failed.connect(lambda m: self.export_status.setText(f"export failed: {m}"))
        w.start(synchronous)
