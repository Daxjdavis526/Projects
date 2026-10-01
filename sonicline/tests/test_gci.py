import pytest

from sonicline.core import gci


def test_exact_power_law_is_recovered():
    # phi = 2 + 0.3 h^1.7 on a non-uniform ratio family
    hs = (0.01, 0.0137, 0.0201)
    vals = tuple(2.0 + 0.3 * h**1.7 for h in hs)
    s = gci.study(vals, hs)
    assert s.convergence == "monotone"
    assert s.order == pytest.approx(1.7, rel=1e-8)
    assert s.extrapolated == pytest.approx(2.0, rel=1e-10)
    # With the exact order the band is 1.25x the true error of the finest value.
    assert s.gci_fine == pytest.approx(1.25 * s.extrapolated_error_fine * s.extrapolated / vals[0], rel=1e-6)
    lo, hi = s.band()
    assert lo < 2.0 < hi


def test_celik_worked_example():
    # Celik et al. (2008), table 1, phi = dimensionless reattachment length:
    # N = 18 000, 8 000, 4 500 cells in 2D, so r21 = 1.5, r32 = 1.333.
    hs = tuple(gci.representative_spacing(n, 1.0, 2) for n in (18000, 8000, 4500))
    s = gci.study((6.063, 5.972, 5.863), hs)
    assert s.order == pytest.approx(1.53, abs=0.01)
    assert s.extrapolated == pytest.approx(6.1685, abs=1e-3)
    assert s.gci_fine == pytest.approx(0.022, abs=0.001)


def test_oscillatory_and_divergent_are_flagged():
    hs = (1.0, 2.0, 4.0)
    osc = gci.study((1.0, 1.01, 0.995), hs)
    assert osc.convergence == "oscillatory" and osc.extrapolated is None
    assert osc.gci_fine == pytest.approx(1.25 * 0.015, rel=1e-9)
    div = gci.study((1.0, 1.01, 1.015), hs)
    assert div.convergence == "divergent" and div.gci_fine is None


def test_identical_solutions_are_converged():
    s = gci.study((3.0, 3.0, 3.0), (1.0, 1.5, 2.25))
    assert s.convergence == "converged" and s.gci_fine == 0.0 and s.extrapolated == 3.0


def test_spacings_must_be_ordered():
    with pytest.raises(ValueError):
        gci.study((1.0, 1.1, 1.2), (2.0, 1.0, 4.0))
