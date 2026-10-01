"""The main window: project tree, the staged workflow, the 3D view, the
live checks, and run control."""

from __future__ import annotations

from pathlib import Path

from PySide6 import QtCore, QtGui, QtWidgets

from ..core.validate import Severity
from ..post import scene
from ..project import Project, RunInfo
from ..project.draft import Draft
from .pages import SEVERITY_STYLE, GeometryPage, MeshPage, PhysicsPage, ResultsPage, RunPage
from .run_control import RunController
from .viewport import Viewport

# Which stage a finding belongs to, by the prefix of its code.
STAGE_OF = {"geometry": 0, "inlet": 1, "envelope": 1, "gas": 1, "regime": 1, "domain": 1,
            "turbulence": 1, "wall": 1, "mesh": 2, "numerics": 3}
STAGES = ["Geometry", "Physics", "Mesh", "Run"]
TRUST_ICON = {"trusted": "#2e7d32", "trusted_with_warnings": "#c77700", "not_trustworthy": "#c62828"}


def _dot(colour: str) -> QtGui.QIcon:
    pix = QtGui.QPixmap(12, 12)
    pix.fill(QtCore.Qt.transparent)
    p = QtGui.QPainter(pix)
    p.setRenderHint(QtGui.QPainter.Antialiasing)
    p.setBrush(QtGui.QColor(colour))
    p.setPen(QtCore.Qt.NoPen)
    p.drawEllipse(1, 1, 10, 10)
    p.end()
    return QtGui.QIcon(pix)


class MainWindow(QtWidgets.QMainWindow):
    def __init__(self, project: Project | None = None, ask=None):
        super().__init__()
        # ``ask`` answers yes/no questions; tests replace the dialog.
        self.ask = ask or (lambda title, text: QtWidgets.QMessageBox.question(self, title, text)
                           == QtWidgets.QMessageBox.Yes)
        self.project: Project | None = None
        self.sim_id: str | None = None
        self.draft = Draft()
        self.dirty = False
        self.assessment = None
        self.resize(1400, 900)

        self.viewport = Viewport()
        self.checks = QtWidgets.QListWidget()
        self.checks.setWordWrap(True)
        self.checks.setToolTip("Pre-flight checks, updated as you edit")
        self.error_label = QtWidgets.QLabel("")
        self.error_label.setStyleSheet("color: #c62828;")
        self.error_label.setWordWrap(True)

        self.tabs = QtWidgets.QTabWidget()
        self.geometry_page = GeometryPage(self)
        self.physics_page = PhysicsPage(self)
        self.mesh_page = MeshPage(self)
        self.run_page = RunPage(self)
        self.pages = [self.geometry_page, self.physics_page, self.mesh_page, self.run_page]
        for page, name in zip(self.pages, STAGES):
            scroll = QtWidgets.QScrollArea()
            scroll.setWidgetResizable(True)
            scroll.setWidget(page)
            self.tabs.addTab(scroll, name)
            page.changed.connect(self._edited)
        # Results is not a stage of the definition: it shows a run.
        self.results_page = ResultsPage(self)
        scroll = QtWidgets.QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setWidget(self.results_page)
        self.tabs.addTab(scroll, "Results")
        self.RESULTS_TAB = self.tabs.count() - 1
        self.tabs.currentChanged.connect(self._tab_changed)

        right = QtWidgets.QSplitter(QtCore.Qt.Vertical)
        right.addWidget(self.viewport)
        checks_box = QtWidgets.QWidget()
        cl = QtWidgets.QVBoxLayout(checks_box)
        cl.setContentsMargins(4, 4, 4, 4)
        cl.addWidget(QtWidgets.QLabel("<b>Checks</b>"))
        cl.addWidget(self.error_label)
        cl.addWidget(self.checks)
        right.addWidget(checks_box)
        right.setSizes([600, 250])
        centre = QtWidgets.QSplitter()
        centre.addWidget(self.tabs)
        centre.addWidget(right)
        centre.setSizes([520, 880])
        self.setCentralWidget(centre)

        self.tree = QtWidgets.QTreeWidget()
        self.tree.setHeaderLabels(["Project", "Result"])
        self.tree.itemActivated.connect(self._tree_activated)
        self.tree.itemClicked.connect(self._tree_activated)
        dock = QtWidgets.QDockWidget("Project")
        dock.setObjectName("project")
        dock.setWidget(self.tree)
        self.tree.setMinimumWidth(330)
        self.addDockWidget(QtCore.Qt.LeftDockWidgetArea, dock)

        self.run = RunController(self)
        self.run.event.connect(lambda st, msg, data: self.run_page.append_event(st, msg))
        self.run.series.connect(self.run_page.update_series)
        self.run.finished.connect(self._run_finished)
        self.run_page.run_btn.clicked.connect(self.start_run)
        self.run_page.cancel_btn.clicked.connect(self.run.cancel)
        self.viewport.picked.connect(self._picked)
        self.viewport.enable_picking()

        self._menus()
        self.statusBar()
        if project is not None:
            self.open_project(project)
        else:
            self._update_title()
            self.refresh_all()

    # -- menus -------------------------------------------------------------------

    def _menus(self):
        m = self.menuBar().addMenu("&File")
        for text, slot, key in (("&New project...", self._new_project_dialog, "Ctrl+Shift+N"),
                                ("&Open project...", self._open_project_dialog, "Ctrl+O"),
                                ("New &simulation", self.new_simulation, "Ctrl+N"),
                                ("&Save simulation", self.save_simulation, "Ctrl+S"),
                                ("Open run folder", self._open_run_folder, None),
                                ("Open run in &ParaView", self._open_paraview, None),
                                ("&Quit", self.close, "Ctrl+Q")):
            a = QtGui.QAction(text, self)
            if key:
                a.setShortcut(key)
            a.triggered.connect(slot)
            m.addAction(a)

    def _new_project_dialog(self):
        path, _ = QtWidgets.QFileDialog.getSaveFileName(self, "New project", "", "SONICLINE project (*.sonicline)")
        if path:
            self.open_project(Project.create(Path(path)))

    def _open_project_dialog(self):
        path = QtWidgets.QFileDialog.getExistingDirectory(self, "Open a .sonicline project folder")
        if path:
            self.open_project(Project.open(Path(path)))

    # -- project and simulations --------------------------------------------------

    def open_project(self, project: Project):
        if not self._leave_draft():
            return
        self.project = project
        sims = project.simulations()
        if sims:
            self.load_simulation(sims[0].id)
        else:
            self.new_simulation()
        self._update_title()

    def _leave_draft(self) -> bool:
        if self.dirty and self.project is not None:
            if self.ask("Unsaved changes", "Save the current simulation first?"):
                self.save_simulation()
        return True

    def new_simulation(self):
        if not self._leave_draft():
            return
        self.sim_id = None
        self.draft = Draft()
        self.dirty = True
        self.refresh_all()

    def load_simulation(self, sim_id: str):
        self.sim_id = sim_id
        self.draft = Draft.from_definition(self.project.load_simulation(sim_id))
        self.dirty = False
        self.refresh_all()
        if self.draft.get("geometry.type") == "cad_file":
            self.geometry_page.analyse()

    def save_simulation(self) -> str | None:
        if self.project is None:
            return None
        a = self.draft.assess()
        if a.definition is None:
            self.statusBar().showMessage(f"cannot save: {a.error}", 8000)
            return None
        self.sim_id = self.project.save_simulation(a.definition, self.sim_id)
        self.dirty = False
        self.statusBar().showMessage(f"saved {self.sim_id}", 4000)
        self.refresh_tree()
        self._update_title()
        return self.sim_id

    def _update_title(self):
        name = self.project.name if self.project else "no project"
        sim = self.sim_id or "new simulation"
        self.setWindowTitle(f"SONICLINE - {name} - {sim}{' *' if self.dirty else ''}")

    # -- refresh -------------------------------------------------------------------

    def refresh_all(self):
        for p in self.pages:
            p.refresh()
        self._assess(redraw=True)
        self.refresh_tree()
        self._update_title()

    def _edited(self):
        self.dirty = True
        self._assess(redraw=True)
        self._update_title()

    def _assess(self, redraw: bool):
        a = self.draft.assess()
        self.assessment = a
        self.error_label.setText(a.error or "")
        self.checks.clear()
        worst = [-1] * len(STAGES)
        for f in sorted(a.findings, key=lambda f: -f.severity):
            name, colour = SEVERITY_STYLE[int(f.severity)]
            item = QtWidgets.QListWidgetItem(_dot(colour), f"{f.message}" + (f"\n-> {f.hint}" if f.hint else ""))
            item.setToolTip(f"{name}: {f.code}")
            self.checks.addItem(item)
            stage = STAGE_OF.get(f.code.split(".")[0], 1)
            worst[stage] = max(worst[stage], int(f.severity))
        if a.error:
            worst[1] = max(worst[1], int(Severity.ERROR))
        for i, name in enumerate(STAGES):
            self.tabs.setTabText(i, name)
            self.tabs.setTabIcon(i, _dot(SEVERITY_STYLE[worst[i]][1]) if worst[i] >= 1 else QtGui.QIcon())
        self.physics_page.show_prediction(a.prediction)
        self.run_page.run_btn.setEnabled(a.runnable and self.project is not None and not self.run.running)
        if redraw and a.profile is not None:
            kind = "planar nozzle" if a.profile.planar_width else "nozzle"
            self.viewport.show_surfaces(
                scene.nozzle(a.profile),
                f"{kind}: throat {'height' if a.profile.planar_width else 'diameter'} "
                f"{2e3 * a.profile.throat_radius:.3f} mm, Ae/At {a.profile.expansion_ratio:.3f} "
                "(blue: inlet, orange: exit)")

    def refresh_tree(self):
        self.tree.clear()
        if self.project is None:
            return
        root = QtWidgets.QTreeWidgetItem(self.tree, [self.project.name, ""])
        root.setExpanded(True)
        for sim in self.project.simulations():
            s = QtWidgets.QTreeWidgetItem(root, [sim.name, ""])
            s.setData(0, QtCore.Qt.UserRole, ("simulation", sim.id))
            if sim.id == self.sim_id:
                f = s.font(0)
                f.setBold(True)
                s.setFont(0, f)
            for run in self.project.runs(sim.id):
                text = run.status if run.status != "completed" else (run.trust or "").replace("_", " ")
                if run.thrust is not None:
                    text += f", {run.thrust:.4g} N"
                r = QtWidgets.QTreeWidgetItem(s, [run.id, text])
                r.setIcon(0, _dot(TRUST_ICON.get(run.trust, "#888888")))
                r.setData(0, QtCore.Qt.UserRole, ("run", str(run.path)))
            s.setExpanded(True)
        self.tree.resizeColumnToContents(0)
        self.tree.resizeColumnToContents(1)

    def _tree_activated(self, item, _column=0):
        data = item.data(0, QtCore.Qt.UserRole)
        if not data:
            return
        kind, value = data
        if kind == "simulation" and value != self.sim_id:
            self._leave_draft()
            self.load_simulation(value)
        elif kind == "run":
            self.show_run(Path(value))

    def show_run(self, run_dir: Path) -> None:
        """A run's summary on the Run stage, and its fields under Results
        when it has any."""
        from ..project import read_run

        self.selected_run = Path(run_dir)
        self.run_page.show_result(read_run(self.selected_run))
        if self.results_page.load(self.selected_run):
            self.tabs.setCurrentIndex(self.RESULTS_TAB)
        else:
            self.tabs.setCurrentIndex(3)

    def _picked(self, x, y, z):
        if self.tabs.currentIndex() == self.RESULTS_TAB:
            self.results_page.probe(x, y, z)
        else:
            self.geometry_page.pick(x, y, z)

    def _tab_changed(self, index):
        if index == self.RESULTS_TAB:
            self.results_page.redraw(keep_camera=False)
        elif index in (0, 1):
            self._assess(redraw=True)

    # -- runs -----------------------------------------------------------------------

    def start_run(self) -> Path | None:
        if self.project is None or self.run.running:
            return None
        if self.dirty or self.sim_id is None:
            if self.save_simulation() is None:
                return None
        self.run_page.clear()
        self.run_page.run_btn.setEnabled(False)
        self.run_page.cancel_btn.setEnabled(True)
        run_dir = self.run.start(self.project, self.sim_id, self.run_page.procs.value())
        self.selected_run = run_dir
        self.run_page.append_event("start", f"run {run_dir.name}")
        self.refresh_tree()
        self.tabs.setCurrentIndex(3)
        return run_dir

    def _run_finished(self, info: RunInfo):
        self.run_page.cancel_btn.setEnabled(False)
        self.run_page.show_result(info)
        self.refresh_tree()
        self._assess(redraw=False)
        if info.status == "completed":
            self.results_page.load(info.path)

    def _open_run_folder(self):
        run = getattr(self, "selected_run", None)
        if run is not None:
            QtGui.QDesktopServices.openUrl(QtCore.QUrl.fromLocalFile(str(run)))

    def _open_paraview(self):
        """ParaView is the escape hatch for anything the app does not show."""
        import shutil
        import subprocess

        run = getattr(self, "selected_run", None)
        exe = shutil.which("paraview")
        if run is None or exe is None:
            self.statusBar().showMessage("no run selected, or ParaView is not on the PATH", 6000)
            return
        foam = Path(run) / "case" / "case.foam"
        subprocess.Popen([exe, str(foam)])

    def closeEvent(self, event):
        if self.run.running and not self.ask("Run in progress", "A run is in progress. Cancel it and quit?"):
            event.ignore()
            return
        if self.run.running:
            self.run.cancel()
        self._leave_draft()
        self.viewport.close_plotter()
        super().closeEvent(event)

