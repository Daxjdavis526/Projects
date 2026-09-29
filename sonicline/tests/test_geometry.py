"""STEP round trip: a known profile written as a revolved solid, read back
and analysed, must reproduce its own dimensions."""

import pytest

pytest.importorskip("gmsh")

from sonicline import geometry  # noqa: E402
from sonicline.core.profile import conical  # noqa: E402


@pytest.fixture(scope="module")
def nozzle_step(tmp_path_factory):
    path = tmp_path_factory.mktemp("cad") / "nozzle.step"
    geometry.write_revolved_step(conical(1e-3, 2.88), path)
    return path


def test_round_trip_recovers_the_profile(nozzle_step):
    r = geometry.analyse(nozzle_step, stations=120)
    assert r.ok and r.kind == "fluid_volume" and r.volumes == 1
    p = r.profile()
    exact = conical(1e-3, 2.88)
    assert p.throat_radius == pytest.approx(1e-3, rel=1e-5)
    assert p.expansion_ratio == pytest.approx(2.88, rel=1e-4)
    assert p.contraction_ratio == pytest.approx(9.0, rel=1e-4)
    assert p.x_exit - p.x_inlet == pytest.approx(exact.x_exit - exact.x_inlet, rel=1e-9)
    assert p.rc_over_rt == pytest.approx(1.5, rel=0.02)
    assert r.inlet_confidence == "high"


def test_inlet_override_is_respected(nozzle_step):
    auto = geometry.analyse(nozzle_step, stations=60)
    other = "min" if auto.inlet_end == "max" else "max"
    forced = geometry.analyse(nozzle_step, inlet_end=other, stations=60)
    assert forced.inlet_end == other and forced.inlet_confidence == "user"
    assert any("steeper" in w for w in forced.warnings)
    # Reversed, the nozzle's first section is the exit.
    assert forced.profile().inlet_radius == pytest.approx(auto.profile().exit_radius, rel=1e-6)


def test_changed_file_is_detected(nozzle_step, tmp_path):
    with pytest.raises(geometry.GeometryError, match="changed"):
        geometry.check_definition_file(nozzle_step, "0" * 64)


def test_solid_body_is_rejected_with_advice(tmp_path):
    import gmsh

    path = tmp_path / "body.step"
    gmsh.initialize(["-noenv"], readConfigFiles=False)
    gmsh.option.setNumber("General.Terminal", 0)
    occ = gmsh.model.occ
    outer = occ.addCylinder(0, 0, 0, 10, 0, 0, 5)
    bore = occ.addCylinder(-1, 0, 0, 12, 0, 0, 2)
    occ.cut([(3, outer)], [(3, bore)])
    occ.synchronize()
    gmsh.write(str(path))
    gmsh.finalize()
    r = geometry.analyse(path, stations=30)
    assert not r.ok and r.kind == "solid_body"
    assert "fluid volume" in r.errors[0]


def test_two_solids_are_rejected(tmp_path):
    import gmsh

    path = tmp_path / "two.step"
    gmsh.initialize(["-noenv"], readConfigFiles=False)
    gmsh.option.setNumber("General.Terminal", 0)
    gmsh.model.occ.addBox(0, 0, 0, 1, 1, 1)
    gmsh.model.occ.addBox(3, 0, 0, 1, 1, 1)
    gmsh.model.occ.synchronize()
    gmsh.write(str(path))
    gmsh.finalize()
    r = geometry.analyse(path, stations=10)
    assert not r.ok and r.volumes == 2 and "separate solids" in r.errors[0]


def test_non_revolved_body_is_rejected(tmp_path):
    import gmsh

    path = tmp_path / "box.step"
    gmsh.initialize(["-noenv"], readConfigFiles=False)
    gmsh.option.setNumber("General.Terminal", 0)
    gmsh.model.occ.addBox(0, 0, 0, 10, 2, 2)
    gmsh.model.occ.synchronize()
    gmsh.write(str(path))
    gmsh.finalize()
    r = geometry.analyse(path, stations=20)
    assert not r.ok and "not a body of revolution" in r.errors[0]
