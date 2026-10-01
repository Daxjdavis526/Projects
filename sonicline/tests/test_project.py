import json
import sys

import pytest

from sonicline.core import model as m
from sonicline.project import Project, ProjectError, read_run
from sonicline.run import pipeline


def _defn(name="20 bar thruster"):
    return m.SimulationDefinition(
        name=name, geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=2e6)))


def test_create_open_and_save_simulations(tmp_path):
    p = Project.create(tmp_path / "Thruster", "Thruster A")
    assert p.root.name == "Thruster.sonicline" and p.name == "Thruster A"
    with pytest.raises(ProjectError):
        Project.create(p.root)
    a = p.save_simulation(_defn())
    b = p.save_simulation(_defn())
    assert (a, b) == ("20-bar-thruster", "20-bar-thruster-2")
    assert p.load_simulation(a) == _defn()
    again = Project.open(p.root)
    assert [s.id for s in again.simulations()] == [a, b]
    with pytest.raises(ProjectError):
        Project.open(tmp_path)


def test_geometry_is_content_addressed(tmp_path):
    p = Project.create(tmp_path / "P")
    src = tmp_path / "nozzle.step"
    src.write_bytes(b"ISO-10303-21; fake")
    rel = p.import_geometry(src)
    assert rel.startswith("geometry/") and rel.endswith(".step") and (p.root / rel).is_file()
    assert p.import_geometry(src) == rel  # same content, same file


def test_run_command_and_history(tmp_path):
    p = Project.create(tmp_path / "P")
    sim = p.save_simulation(_defn())
    run_dir = p.new_run(sim)
    cmd = p.run_command(sim, run_dir, processors=4, images=False)
    assert cmd[:3] == [sys.executable, "-m", "sonicline"] and "--events" in cmd and "--no-images" in cmd
    assert (run_dir / "input.json").is_file()
    [info] = p.runs()
    assert info.status == "running" and info.simulation == sim
    (run_dir / "manifest.json").write_text(json.dumps({"status": "completed", "trust": "trusted"}))
    (run_dir / "metrics.json").write_text(json.dumps({"mass_flow": {"inlet": 0.014},
                                                      "thrust": {"total": 8.36},
                                                      "specific_impulse": {"cfd": 59.7}}))
    info = read_run(run_dir, sim)
    assert info.finished_ok and info.thrust == 8.36 and info.isp == 59.7
    assert p.runs("other") == []


def test_cancel_file_round_trip(tmp_path):
    pipeline.request_cancel(tmp_path)
    assert pipeline._cancelled(tmp_path)
