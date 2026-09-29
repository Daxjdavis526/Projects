import json
import math

import pytest

from sonicline.core import model as m

MINIMAL = {
    "name": "sea-level matched",
    "geometry": {"type": "conical_nozzle", "throat_radius": "1 mm", "expansion_ratio": 2.88},
    "boundaries": {"inlet": {"type": "reservoir_inlet", "p0": "20 bar", "T0": "27 degC"}},
}


def test_units_are_converted_once_on_load():
    d = m.loads(json.dumps(MINIMAL))
    assert d.geometry.throat_radius == 1e-3
    assert d.boundaries.inlet.p0 == 2.0e6
    assert d.boundaries.inlet.T0 == pytest.approx(300.15)


def test_defaults_are_sea_level_with_a_plume():
    d = m.loads(json.dumps(MINIMAL))
    assert d.boundaries.ambient.pressure == 101325.0
    assert isinstance(d.boundaries.exit_domain, m.Plume)
    assert isinstance(d.boundaries.wall_thermal, m.Adiabatic)
    assert isinstance(d.flow.turbulence, m.KOmegaSST)


def test_round_trip_is_exact_and_canonical():
    d = m.loads(json.dumps(MINIMAL))
    text = m.dumps(d)
    again = m.loads(text)
    assert again == d
    assert m.dumps(again) == text
    assert m.definition_hash(again) == m.definition_hash(d)
    # SI in, SI out: the written file holds pascals, not "20 bar".
    assert json.loads(text)["boundaries"]["inlet"]["p0"] == 2.0e6


def test_hash_changes_with_content():
    a = m.loads(json.dumps(MINIMAL))
    b_src = json.loads(json.dumps(MINIMAL))
    b_src["boundaries"]["inlet"]["p0"] = "21 bar"
    assert m.definition_hash(a) != m.definition_hash(m.loads(json.dumps(b_src)))


@pytest.mark.parametrize(
    "mutate, message",
    [
        (lambda d: d["geometry"].update(type="bell"), "unknown type 'bell'"),
        (lambda d: d["boundaries"]["inlet"].pop("p0"), "p0: required"),
        (lambda d: d["boundaries"]["inlet"].update(p0="100 psig"), "gauge"),
        (lambda d: d.update(colour="red"), "unknown keys"),
        (lambda d: d.update(mesh={"form": "tet"}), "not one of"),
        (lambda d: d.update(schema_version=99), "schema_version"),
    ],
)
def test_bad_input_is_rejected_with_a_path(mutate, message):
    src = json.loads(json.dumps(MINIMAL))
    mutate(src)
    with pytest.raises(m.DefinitionError, match=message):
        m.loads(json.dumps(src))


def test_every_union_member_round_trips():
    d = m.SimulationDefinition(
        name="all",
        geometry=m.CadFile(path="nozzle.step", sha256="0" * 64),
        boundaries=m.Boundaries(
            inlet=m.MassFlowInlet(mass_flow=5e-3, T0=270.0),
            ambient=m.Ambient(pressure=0.0),
            exit_domain=m.TruncatedAtExit(fixed_pressure=True),
            wall_thermal=m.FixedTemperature(temperature=290.0),
        ),
        flow=m.Flow(time=m.Transient(end_time=1e-3), turbulence=m.Laminar()),
        mesh=m.MeshSpec(form=m.MeshForm.WEDGE, quality=m.MeshQuality.FINE),
    )
    assert m.loads(m.dumps(d)) == d


def test_parametric_geometry_builds_its_profile():
    d = m.loads(json.dumps(MINIMAL))
    p = d.geometry.profile()
    assert p.expansion_ratio == pytest.approx(2.88)
    assert math.degrees(d.geometry.diverging_half_angle) == pytest.approx(15.0)


def test_wall_profile_round_trips_and_builds():
    pts = tuple((0.1 * i, 2.0 - 1.5 * math.sin(math.pi * i / 20)) for i in range(21))
    d = m.SimulationDefinition(name="w", geometry=m.WallProfile(points=pts, length_unit="mm"),
                               boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=2e6)))
    back = m.loads(m.dumps(d))
    assert back == d
    p = back.geometry.profile()
    assert p.throat_radius == pytest.approx(0.5e-3, rel=1e-3)  # mm -> m
    assert p.throat_x == pytest.approx(1e-3, rel=1e-3)


@pytest.mark.parametrize("points, message", [
    ([[0, 1], [1, 1]], "at least three"),
    ([[0, 1], [1, 0], [2, 1]], "positive"),
    ([[0, 1], [2, 0.5], [1, 1]], "increasing"),
    ([[0, 1, 2], [1, 1], [2, 1]], "expected 2 values"),
])
def test_bad_wall_profiles_are_rejected(points, message):
    src = json.loads(json.dumps(MINIMAL))
    src["geometry"] = {"type": "wall_profile", "points": points}
    with pytest.raises(m.DefinitionError, match=message):
        m.loads(json.dumps(src))


def test_booleans_are_strict():
    src = json.loads(json.dumps(MINIMAL))
    src["boundaries"]["exit_domain"] = {"type": "truncated_at_exit", "fixed_pressure": 1}
    with pytest.raises(m.DefinitionError, match="true or false"):
        m.loads(json.dumps(src))
