import pytest

from sonicline.core.units import Dimension, UnitError, from_si, parse, quantity_to_si, to_si


def test_pressure_units():
    assert to_si(20, "bar", Dimension.PRESSURE) == 2.0e6
    assert to_si(1, "atm", Dimension.PRESSURE) == 101325.0
    assert to_si(230, "psia", Dimension.PRESSURE) == pytest.approx(15.858e5, rel=1e-4)
    assert from_si(2.0e6, "bar", Dimension.PRESSURE) == 20.0


def test_gauge_pressure_is_refused():
    with pytest.raises(UnitError, match="gauge"):
        to_si(100, "psig", Dimension.PRESSURE)


def test_temperature_is_affine():
    assert to_si(26.85, "degC", Dimension.TEMPERATURE) == pytest.approx(300.0)
    assert to_si(32, "degF", Dimension.TEMPERATURE) == pytest.approx(273.15)
    assert to_si(540, "R", Dimension.TEMPERATURE) == pytest.approx(300.0)
    assert from_si(300.0, "degC", Dimension.TEMPERATURE) == pytest.approx(26.85)
    with pytest.raises(UnitError, match="absolute zero"):
        to_si(-300, "degC", Dimension.TEMPERATURE)


def test_parse_strings_and_objects():
    assert parse("20 bar", Dimension.PRESSURE) == 2.0e6
    assert parse("300K", Dimension.TEMPERATURE) == 300.0
    assert parse("1.5e-3", Dimension.LENGTH) == 1.5e-3
    assert quantity_to_si({"value": 2, "unit": "mm"}, Dimension.LENGTH) == 2e-3
    assert quantity_to_si(7.5, Dimension.FORCE) == 7.5


def test_wrong_dimension_is_an_error():
    with pytest.raises(UnitError):
        to_si(1, "bar", Dimension.LENGTH)
    with pytest.raises(UnitError):
        quantity_to_si(True, Dimension.PRESSURE)
