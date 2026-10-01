import math

import pytest

from sonicline.core import profile as pr


@pytest.fixture
def cone():
    return pr.conical(1e-3, expansion_ratio=6.25, contraction_ratio=9.0)


def test_conical_key_dimensions(cone):
    assert cone.throat_radius == 1e-3
    assert cone.radius(0.0) == pytest.approx(1e-3, rel=1e-12)
    assert cone.expansion_ratio == pytest.approx(6.25, rel=1e-12)
    assert cone.contraction_ratio == pytest.approx(9.0, rel=1e-12)
    assert cone.rc_over_rt == pytest.approx(1.5)


def test_conical_is_continuous_and_tangent(cone):
    for a, b in zip(cone.segments, cone.segments[1:]):
        x = a.x1
        assert a.radius(x) == pytest.approx(b.radius(x), abs=1e-15)
        assert a.slope(x) == pytest.approx(b.slope(x), abs=1e-9)


def test_conical_angles(cone):
    conv = cone.segments[2]
    assert math.degrees(math.atan(-conv.slope(conv.x0))) == pytest.approx(45.0)
    div = cone.segments[-1]
    assert math.degrees(math.atan(div.slope(div.x0))) == pytest.approx(15.0)


def test_throat_is_the_minimum(cone):
    xs = [cone.x_inlet + (cone.x_exit - cone.x_inlet) * i / 2000 for i in range(2001)]
    assert min(cone.radius(x) for x in xs) >= cone.throat_radius * (1 - 1e-12)


def test_small_expansion_ends_on_the_throat_arc():
    p = pr.conical(1e-3, expansion_ratio=1.01)
    assert p.expansion_ratio == pytest.approx(1.01, rel=1e-12)
    assert isinstance(p.segments[-1], pr.Arc)


def test_converging_only():
    p = pr.conical(1e-3, expansion_ratio=1.0)
    assert p.x_exit == 0.0
    assert p.exit_radius == pytest.approx(1e-3)


def test_impossible_contraction_is_rejected():
    with pytest.raises(ValueError, match="contraction ratio"):
        pr.conical(1e-3, 4.0, contraction_ratio=1.2)


def test_from_points_recovers_throat_and_curvature(cone):
    pts = cone.sample(200)
    poly = pr.from_points(pts)
    assert poly.throat_radius == pytest.approx(1e-3, rel=1e-6)
    assert poly.throat_x == pytest.approx(0.0, abs=1e-6)
    assert poly.expansion_ratio == pytest.approx(6.25, rel=1e-5)
    assert poly.throat_curvature_upstream == pytest.approx(1.5e-3, rel=0.02)
