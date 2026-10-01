"""The desktop application, driven headless (Qt's offscreen platform, 3D
view disabled). Skipped without the ``ui`` extra."""

import json
import os
import sys
import time

import pytest

pytest.importorskip("PySide6")
pytest.importorskip("pyqtgraph")
os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
os.environ["SONICLINE_NO_3D"] = "1"

from PySide6 import QtCore, QtWidgets  # noqa: E402

from sonicline.project import Project  # noqa: E402

EXAMPLES = os.path.join(os.path.dirname(__file__), "..", "examples")


@pytest.fixture(scope="module")
def app():
    return QtWidgets.QApplication.instance() or QtWidgets.QApplication([])


@pytest.fixture
def window(app, tmp_path):
    from sonicline.ui.main_window import MainWindow

    w = MainWindow(Project.create(tmp_path / "P"), ask=lambda *a: False)
    yield w
    w.close()


def _wait(app, cond, timeout=20.0):
    end = time.time() + timeout
    while not cond() and time.time() < end:
        app.processEvents(QtCore.QEventLoop.AllEvents, 50)
        time.sleep(0.02)
    return cond()


def test_new_project_starts_on_the_reference_case(window):
    assert window.assessment.runnable
    assert "regime: matched" in window.physics_page.prediction.text()
    assert window.run_page.run_btn.isEnabled()
    assert window.windowTitle().endswith("*")  # unsaved


def test_editing_a_field_updates_checks_and_badges(window):
    page = window.physics_page
    exit_combo = page.exit_kind
    exit_combo.setCurrentIndex(1)  # truncated at the exit, at sea level: an error
    assert "domain.truncated_not_supersonic" in {f.code for f in window.assessment.findings}
    assert not window.run_page.run_btn.isEnabled()
    assert not window.tabs.tabIcon(1).isNull()  # the Physics tab carries a badge
    exit_combo.setCurrentIndex(0)
    assert window.assessment.runnable


def test_quantity_fields_convert_units_and_reject_nonsense(window):
    p0 = next(f for f in window.physics_page.fields if getattr(f, "path", "") == "boundaries.inlet.p0")
    p0.setText("25")
    p0.editingFinished.emit()
    assert window.draft.get("boundaries.inlet.p0") == pytest.approx(25e5)
    p0.setText("lots")
    p0.editingFinished.emit()
    assert window.draft.get("boundaries.inlet.p0") == pytest.approx(25e5)
    assert "ffe3e3" in p0.styleSheet()
    d = next(f for f in window.geometry_page.fields if getattr(f, "path", "") == "geometry.throat_radius")
    d.setText("3")  # a 3 mm throat diameter
    d.editingFinished.emit()
    assert window.draft.get("geometry.throat_radius") == pytest.approx(1.5e-3)


def test_mesh_preview_and_planar_switch(window):
    window.mesh_page.preview(synchronous=True)
    assert "21044" in window.mesh_page.stats.text()
    window.mesh_page.form.setCurrentIndex(2)  # planar
    assert window.draft.get("mesh.planar_width") == pytest.approx(0.02)
    assert window.assessment.definition is not None
    assert "planar nozzle" in window.viewport.caption.text()


def test_save_and_reload(window):
    sim = window.save_simulation()
    assert sim and not window.windowTitle().endswith("*")
    window.draft.set("name", "changed")
    window.load_simulation(sim)
    assert window.draft.get("name") == "New thruster"


def test_run_control_follows_events_and_series(window, app, tmp_path):
    """A fake pipeline that speaks the JSON event protocol and writes the
    tables the live plots read."""
    run_dir = tmp_path / "run"
    table = run_dir / "case" / "postProcessing" / "mdot_inlet" / "0"
    table.mkdir(parents=True)
    script = f"""
import json, pathlib, time
d = pathlib.Path({str(run_dir)!r})
t = d / "case/postProcessing/mdot_inlet/0/surfaceFieldValue.dat"
t.write_text("# Time\\tsum(phi)\\n" + "".join(f"{{i}} {{-1e-4 * (1 + 1/i)}}\\n" for i in range(1, 50)))
print(json.dumps({{"stage": "mesh", "message": "9196 cells", "data": {{}}}}), flush=True)
time.sleep(0.5)
(d / "manifest.json").write_text(json.dumps({{"status": "completed", "trust": "trusted"}}))
print(json.dumps({{"stage": "done", "message": "completed; result trusted", "data": {{}}}}), flush=True)
"""
    events, series, finished = [], [], []
    rc = window.run
    rc.event.connect(lambda s, m, d: events.append((s, m)))
    rc.series.connect(series.append)
    rc.finished.connect(finished.append)
    rc._timer.setInterval(100)
    rc.start_command([sys.executable, "-c", script], run_dir)
    assert _wait(app, lambda: finished)
    assert ("mesh", "9196 cells") in events and events[-1][0] == "done"
    assert finished[0].status == "completed" and finished[0].trust == "trusted"
    assert series and "inlet mass flow" in series[-1]


def test_event_parser_tolerates_split_and_foreign_lines(window):
    got = []
    window.run.event.connect(lambda s, m, d: got.append((s, m)))
    window.run.feed(b'{"stage": "solve", "message": "iter')
    window.run.feed(b'ation 100", "data": {}}\nnot json\n')
    assert got == [("solve", "iteration 100"), ("output", "not json")]


def test_cancel_writes_the_cancel_file(window, app, tmp_path):
    run_dir = tmp_path / "r"
    run_dir.mkdir()
    window.run.start_command([sys.executable, "-c", "import time; time.sleep(30)"], run_dir)
    window.run.cancel()
    assert (run_dir / "CANCEL").exists()
    window.run.process.kill()
    assert _wait(app, lambda: not window.run.running)


def test_opening_a_project_lists_simulations_and_runs(app, tmp_path):
    from sonicline.core import model as m
    from sonicline.ui.main_window import MainWindow

    p = Project.create(tmp_path / "Q")
    sim = p.save_simulation(m.load(os.path.join(EXAMPLES, "sea-level-20bar.json")))
    run = p.new_run(sim)
    (run / "manifest.json").write_text(json.dumps({"status": "completed", "trust": "trusted"}))
    w = MainWindow(p, ask=lambda *a: False)
    root = w.tree.topLevelItem(0)
    sim_item = root.child(0)
    assert sim_item.childCount() == 1 and "trusted" in sim_item.child(0).text(1)
    w._tree_activated(sim_item.child(0))
    # No case to read: the summary shows on the Run stage, Results says why.
    assert w.tabs.currentIndex() == 3 and "trusted" in w.run_page.summary.text()
    assert "no fields" in w.results_page.title.text()
    w.close()


def test_step_import_suggests_the_inlet_and_a_click_changes_it(window):
    pytest.importorskip("gmsh")
    page = window.geometry_page
    page.import_file(os.path.join(EXAMPLES, "nozzle-2mm.step"), synchronous=True)
    assert window.draft.get("geometry.type") == "cad_file"
    assert window.draft.get("geometry.path").startswith("geometry/")
    assert "suggested inlet" in page.cad_report.text()
    prof = window.draft.cad_profile
    assert prof is not None and abs(2e3 * prof.throat_radius - 2.0) < 1e-3
    assert window.assessment.runnable
    suggested = page.report.inlet_end
    page.analyse = lambda synchronous=False: None  # keep the test on the click's effect
    page.pick(prof.x_exit, 0.0, 0.0)  # a click on the exit end: that end is the inlet
    assert window.draft.get("geometry.inlet_end") == ("max" if suggested == "min" else "min")


def test_results_page_on_a_synthetic_run(window, tmp_path):
    pytest.importorskip("pyvista")
    sys.path.insert(0, os.path.dirname(__file__))
    import synthetic_run

    run = tmp_path / "run"
    synthetic_run.make(run)
    page = window.results_page
    assert page.load(run)
    assert page.current_field() == "Mach" and "min" in page.data_range.text()
    assert page.field.count() >= 7 and page.table.rowCount() >= 9
    page.field.setCurrentIndex(1)  # pressure: range follows
    lo, hi = (float(page.lo.text()), float(page.hi.text()))
    assert 0.0 < lo < hi <= 10.0  # bar
    x = page.results.profile.throat_x
    got = page.probe(x, -3e-4, 0.0)
    assert got is not None and page.probe_table.rowCount() >= 9
    for cb in (page.vectors, page.streamlines, page.cut):
        cb.setChecked(True)  # draws without a 3D view in the test mode
    assert "plane x" in page.cut_label.text()
    page.axial_var.setCurrentIndex(1)
    page.export(tmp_path / "report", synchronous=True)
    assert (tmp_path / "report" / "report.json").exists() and (tmp_path / "report" / "report.pdf").exists()
    assert "wrote" in page.export_status.text()


def test_switching_to_a_mass_flow_inlet_carries_the_flow_over(window):
    page = window.physics_page
    before = window.assessment.prediction
    page.inlet_kind.setCurrentIndex(1)
    assert window.draft.get("boundaries.inlet.type") == "mass_flow_inlet"
    assert window.draft.get("boundaries.inlet.mass_flow") == pytest.approx(before.mass_flow)
    assert window.assessment.runnable and not page.p0.isEnabled() and page.mass_flow.isEnabled()
    assert "chamber pressure" in page.prediction.text()
    # And back: the implied chamber pressure is the one it started from.
    page.inlet_kind.setCurrentIndex(0)
    assert window.draft.get("boundaries.inlet.p0") == pytest.approx(before.p0, rel=1e-6)


def test_a_solid_body_offers_extraction_and_uses_the_confirmed_passage(app, tmp_path):
    pytest.importorskip("gmsh")
    pytest.importorskip("trimesh")
    import gmsh

    from sonicline.ui.main_window import MainWindow

    body = tmp_path / "body.step"
    gmsh.initialize(["-noenv"], readConfigFiles=False)
    gmsh.option.setNumber("General.Terminal", 0)
    gmsh.option.setString("Geometry.OCCTargetUnit", "MM")
    occ = gmsh.model.occ
    noz = occ.importShapes(os.path.join(EXAMPLES, "nozzle-2mm.step"))
    occ.synchronize()
    b = gmsh.model.getBoundingBox(3, noz[0][1])
    occ.cut([(3, occ.addCylinder(b[0], 0, 0, b[3] - b[0], 0, 0, 6.0))], noz)
    occ.synchronize()
    gmsh.write(str(body))
    gmsh.finalize()

    asked = []
    w = MainWindow(Project.create(tmp_path / "P"), ask=lambda title, text: asked.append(title) or True)
    page = w.geometry_page
    page.import_file(body, synchronous=True)
    assert page.report.kind == "solid_body" and not page.extract_btn.isHidden()
    page.extract(synchronous=True)
    assert asked == ["Use the extracted gas passage?"]
    assert w.draft.get("geometry.path").endswith(".step") and page.report.kind == "fluid_volume"
    assert page.report.ok and w.assessment.runnable
    w.close()


def test_physics_page_sets_up_a_startup(window):
    page = window.physics_page
    assert not page.end_time.isEnabled()
    page.time_kind.setCurrentIndex(1)
    assert window.draft.get("flow.time.type") == "transient"
    assert page.end_time.isEnabled() and page.end_time.text() == "1"  # ms
    page.ramp_time.setText("0.2")
    page.ramp_time.editingFinished.emit()
    assert window.draft.get("flow.time.ramp_time") == pytest.approx(2e-4)
    page.frames.setText("12.5")  # not a whole number: refused
    page.frames.editingFinished.emit()
    assert window.draft.get("flow.time.frames") == 40
    page.frames.setText("12")
    page.frames.editingFinished.emit()
    assert window.draft.get("flow.time.frames") == 12 and isinstance(window.draft.get("flow.time.frames"), int)
    assert window.assessment.runnable
    page.time_kind.setCurrentIndex(0)
    assert window.draft.get("flow.time.type") == "steady" and not page.end_time.isEnabled()


def test_results_page_steps_through_a_transients_times(window, tmp_path):
    pytest.importorskip("pyvista")
    import shutil

    sys.path.insert(0, os.path.dirname(__file__))
    import synthetic_run

    run = tmp_path / "run"
    synthetic_run.make(run)
    # Two written times, the first at half the pressure.
    case = run / "case"
    for t, scale in (("0.0001", 0.5), ("0.0002", 1.0)):
        shutil.copytree(case / "0", case / t)
        text = (case / t / "p").read_text()
        if scale != 1.0:
            head, sep, body = text.partition("(\n")
            values, close, tail = body.partition("\n)")
            text = head + sep + "\n".join(f"{scale * float(v)!r}" for v in values.split()) + close + tail
        (case / t / "p").write_text(text)
    metrics = json.loads((run / "metrics.json").read_text())
    metrics["transient"] = {"end_time": 2e-4, "thrust_peak": 5.3, "thrust_overshoot": 0.08, "settled": True,
                            "thrust_drift_last_tenth": 3e-4, "time_to_10_percent_thrust": 2.2e-5,
                            "time_to_90_percent_thrust": 9.2e-5, "conservation_error": 7e-7}
    (run / "metrics.json").write_text(json.dumps(metrics))
    page = window.results_page
    assert page.load(run)
    assert page.time_row.isVisibleTo(page) and page.time_slider.maximum() == 1
    assert page.time_value.text() == "0.2 ms" and not page.animation_btn.isEnabled()
    rows = [page.table.item(i, 0).text() for i in range(page.table.rowCount())]
    assert "Startup: end time" in rows and "  mass conservation in time" in rows
    page.field.setCurrentIndex(page.field.findData("p"))
    late = float(page.hi.text())
    page.show_time(0)
    assert page.results.time == "0.0001" and page.current_field() == "p"
    assert float(page.hi.text()) == pytest.approx(0.5 * late, rel=1e-3)
