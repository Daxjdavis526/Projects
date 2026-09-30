"""STEP round trip: a known profile written as a revolved solid, read back
and analysed, must reproduce its own dimensions."""

import math

import numpy as np
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
    # OpenCASCADE integrates the section area to ~3e-5 (1.7e-5 in radius
    # with the axis along +x): far inside any Cd tolerance.
    assert p.throat_radius == pytest.approx(1e-3, rel=5e-5)
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


def test_non_revolved_body_gets_an_area_equivalent_profile(tmp_path):
    import gmsh

    path = tmp_path / "box.step"
    gmsh.initialize(["-noenv"], readConfigFiles=False)
    gmsh.option.setNumber("General.Terminal", 0)
    gmsh.model.occ.addBox(0, 0, 0, 10, 2, 2)
    gmsh.model.occ.synchronize()
    gmsh.write(str(path))
    gmsh.finalize()
    r = geometry.analyse(path, stations=20)
    # A square duct: sections fill 2/pi of their circumscribed circle, and
    # quasi-1D theory sees the radius of a circle of the same area.
    assert r.ok and not r.axisymmetric and r.roundness_min == pytest.approx(2 / math.pi, rel=1e-3)
    assert any("not a body of revolution" in w for w in r.warnings)
    radii = [q[1] for q in r.profile_points]
    assert max(radii) == pytest.approx(min(radii), rel=1e-6)
    assert math.pi * radii[0] ** 2 == pytest.approx(4e-6, rel=1e-6)  # 2 mm x 2 mm


@pytest.fixture(scope="module")
def nozzle_stl(nozzle_step, tmp_path_factory):
    pytest.importorskip("trimesh")
    path = tmp_path_factory.mktemp("stl") / "nozzle.stl"
    return geometry.tessellate(nozzle_step, "mm", path, 0.15e-3)


def test_stl_reproduces_the_step_analysis(nozzle_step, nozzle_stl):
    """The same nozzle through the STL path: dimensions within the
    faceting error, the same inlet end, and the frame maps the inlet plane
    to x = 0."""

    from sonicline.geometry import surface

    step = geometry.analyse(nozzle_step, stations=120)
    stl = geometry.analyse(nozzle_stl, "m", stations=120)
    assert stl.ok and stl.source == "stl" and stl.axisymmetric, (stl.errors, stl.warnings)
    assert stl.checks["watertight"] and stl.checks["components"] == 1
    a, b = step.profile(), stl.profile()
    assert b.throat_radius == pytest.approx(a.throat_radius, rel=3e-3)  # chords inside the circle
    assert b.throat_x == pytest.approx(a.throat_x, abs=0.05e-3)
    assert b.expansion_ratio == pytest.approx(a.expansion_ratio, rel=5e-3)
    mesh = surface.load(nozzle_stl, 1.0)
    T = stl.nozzle_frame()
    x = (mesh.vertices @ T[:3, :3].T + T[:3, 3])[:, 0]
    assert x.min() == pytest.approx(0.0, abs=1e-8) and x.max() == pytest.approx(b.x_exit, rel=1e-6)


def test_a_punctured_stl_is_rejected(nozzle_stl, tmp_path):
    from sonicline.geometry import surface

    mesh = surface.load(nozzle_stl, 1.0)
    mesh.update_faces(np.arange(1, len(mesh.faces)))  # drop one triangle
    holed = tmp_path / "holed.stl"
    mesh.export(str(holed))
    r = geometry.analyse(holed, "m", stations=20)
    assert not r.ok and "not watertight" in r.errors[0] and r.checks["open_edges"] == 3


def test_surface_check_parses_self_intersection(tmp_path):
    from sonicline.geometry import surface

    class Fake:
        def __init__(self, text):
            self.text = text

        def run(self, cmd, cwd, log):
            assert cmd[:2] == ["surfaceCheck", "-checkSelfIntersection"]
            log.write_text(self.text)

    assert surface.self_intersection(Fake("Surface is not self-intersecting\n"), "a.stl", tmp_path)[0] is False
    assert surface.self_intersection(Fake("Surface is self-intersecting\n"), "a.stl", tmp_path)[0] is True


def test_side_port_volume_takes_its_axis_from_the_end_faces():
    """A pressure-tap port on the chamber skews the inertia tensor; the
    coaxial inlet and exit faces still give the axis, and the area profile
    matches the plain nozzle's away from the port."""
    import os

    examples = os.path.join(os.path.dirname(__file__), "..", "examples")
    plain = geometry.analyse(os.path.join(examples, "nozzle-2mm.step"))
    port = geometry.analyse(os.path.join(examples, "nozzle-side-port.step"))
    assert port.ok and not port.axisymmetric and port.roundness_min < 0.6
    assert any("end faces" in w for w in port.warnings)
    a, b = plain.profile(), port.profile()
    assert b.throat_radius == pytest.approx(a.throat_radius, rel=1e-6)
    assert b.expansion_ratio == pytest.approx(a.expansion_ratio, rel=1e-6)
    assert b.x_exit == pytest.approx(a.x_exit, rel=1e-9)


def test_gas_passage_is_extracted_from_a_solid_body(tmp_path):
    """A cylindrical block with the example nozzle bored through it and a
    blind hole in its inlet face: the passage (two capped openings) is the
    gas volume, the blind hole (one) is not, and the passage is the nozzle."""
    import os

    import gmsh

    examples = os.path.join(os.path.dirname(__file__), "..", "examples")
    body = tmp_path / "body.step"
    gmsh.initialize(["-noenv"], readConfigFiles=False)
    gmsh.option.setNumber("General.Terminal", 0)
    gmsh.option.setString("Geometry.OCCTargetUnit", "MM")
    occ = gmsh.model.occ
    noz = occ.importShapes(os.path.join(examples, "nozzle-2mm.step"))
    occ.synchronize()
    b = gmsh.model.getBoundingBox(3, noz[0][1])
    block = occ.addCylinder(b[0], 0, 0, b[3] - b[0], 0, 0, 6.0)
    solid, _ = occ.cut([(3, block)], noz)
    solid, _ = occ.cut(solid, [(3, occ.addCylinder(b[0], 4.5, 0, 2.0, 0, 0, 0.5))])
    occ.synchronize()
    gmsh.write(str(body))
    gmsh.finalize()

    assert geometry.analyse(body, stations=20).kind == "solid_body"
    rep = geometry.extract_fluid(body, "mm", tmp_path / "fluid.step")
    assert rep["ok"] and rep["caps"] == 3
    assert sorted(c["caps"] for c in rep["cavities"]) == [1, 2]
    fluid = geometry.analyse(tmp_path / "fluid.step", stations=60)
    plain = geometry.analyse(os.path.join(examples, "nozzle-2mm.step"), stations=60)
    assert fluid.ok and fluid.axisymmetric
    # 60 stations place the sections differently in the two bodies: 1e-4.
    assert fluid.profile().expansion_ratio == pytest.approx(plain.profile().expansion_ratio, rel=1e-3)
    assert fluid.volume == pytest.approx(plain.volume, rel=1e-6)


def test_extraction_refuses_a_body_without_a_through_passage(tmp_path):
    import gmsh

    body = tmp_path / "blind.step"
    gmsh.initialize(["-noenv"], readConfigFiles=False)
    gmsh.option.setNumber("General.Terminal", 0)
    occ = gmsh.model.occ
    block = occ.addBox(0, 0, 0, 10, 10, 10)
    occ.cut([(3, block)], [(3, occ.addCylinder(5, 5, 0, 0, 0, 4, 1))])
    occ.synchronize()
    gmsh.write(str(body))
    gmsh.finalize()
    rep = geometry.extract_fluid(body, "mm", tmp_path / "out.step")
    assert not rep["ok"] and "no passage" in rep["errors"][0]
