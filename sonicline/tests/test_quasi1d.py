import math

import pytest

from sonicline.core import profile as pr
from sonicline.core.theory import quasi1d
from sonicline.core.theory.nozzle import Regime

P0, T0 = 1.0e6, 300.0


@pytest.fixture
def cone():
    return pr.conical(1e-3, expansion_ratio=6.25)


def _xs(p, n=400):
    return [p.x_inlet + (p.x_exit - p.x_inlet) * i / n for i in range(n + 1)]


@pytest.mark.parametrize("pa", [0.0, 101325.0, 400e3, 999e3])
def test_mass_is_conserved_along_the_nozzle(cone, textbook_gas, pa):
    sol = quasi1d.solve(cone, textbook_gas, P0, T0, pa, _xs(cone))
    mdot = sol.performance.mass_flow
    for s in sol.stations:
        area = s.area_ratio * cone.throat_area
        assert s.density * s.velocity * area == pytest.approx(mdot, rel=1e-8)


def test_supersonic_branch_downstream_of_throat(cone, textbook_gas):
    sol = quasi1d.solve(cone, textbook_gas, P0, T0, 0.0, _xs(cone))
    for s in sol.stations:
        assert (s.mach > 1.0) == (s.x > 0.0)
    assert sol.stations[-1].mach == pytest.approx(3.4114, abs=1e-3)


def test_shock_jump(cone, textbook_gas):
    sol = quasi1d.solve(cone, textbook_gas, P0, T0, 400e3, _xs(cone, 4000))
    assert sol.performance.regime is Regime.SHOCK_IN_NOZZLE
    assert cone.radius(sol.shock_x) ** 2 / 1e-6 == pytest.approx(3.257, abs=2e-3)
    before = [s for s in sol.stations if 0 < s.x < sol.shock_x][-1]
    after = [s for s in sol.stations if s.x > sol.shock_x][0]
    assert before.mach > 2.6 and after.mach < 0.55
    assert sol.stations[-1].pressure == pytest.approx(400e3, rel=1e-9)


def test_cdv_shock_location():
    """NPARC CDV nozzle at pe/p0 = 0.75: shock at x = 7.562 in."""
    from sonicline.core.gas import PerfectGas

    air = PerfectGas("air", 28.9647, 1004.9, 1.458e-6, 110.4)

    def area(x):  # in^2, x in inches
        if x < 5.0:
            return 1.75 - 0.75 * math.cos((0.2 * x - 1.0) * math.pi)
        return 1.25 - 0.25 * math.cos((0.2 * x - 1.0) * math.pi)

    pts = [(x, math.sqrt(area(x) / math.pi)) for x in (10.0 * i / 4000 for i in range(4001))]
    prof = pr.from_points(pts)
    sol = quasi1d.solve(prof, air, 1.0, 300.0, 0.75, [prof.x_exit])
    assert sol.shock_x == pytest.approx(7.562, abs=2e-3)
