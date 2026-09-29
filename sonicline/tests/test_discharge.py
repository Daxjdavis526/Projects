import math

import pytest

from sonicline.core.theory import discharge

# gamma = 1.4 table (Johnson & Wright 2008 formulas, research table).
KL = {0.5: 0.97707, 0.625: 0.98165, 1: 0.98949, 1.5: 0.99405, 2: 0.99618, 3: 0.99804, 5: 0.99920}
HALL = {1: 0.96467, 2: 0.99415, 5: 0.99909}
HALL_CORR = {1: 0.97815, 2: 0.99604, 5: 0.99922}


@pytest.mark.parametrize("rr, cd", KL.items())
def test_kliegel_levine(rr, cd):
    assert discharge.kliegel_levine(1.4, rr) == pytest.approx(cd, abs=6e-6)


@pytest.mark.parametrize("rr, cd", HALL.items())
def test_hall(rr, cd):
    assert discharge.hall(1.4, rr) == pytest.approx(cd, abs=6e-6)


@pytest.mark.parametrize("rr, cd", HALL_CORR.items())
def test_hall_corrected(rr, cd):
    assert discharge.hall(1.4, rr, corrected=True) == pytest.approx(cd, abs=6e-6)


def test_hall_jpl_value():
    """Back, Massier & Gier (JPL TR 32-654) quote 0.9943 for Rc/Rt = 2, gamma = 1.35."""
    assert discharge.hall(1.35, 2.0) == pytest.approx(0.9943, abs=1e-4)


def test_design_spike_value():
    """The design spike's inviscid rhoPimpleFoam Cd was 0.99428 for Rc/Rt = 1.621."""
    assert discharge.kliegel_levine(1.3999, 1.621) == pytest.approx(0.99470, abs=2e-5)


def test_divergence_factor():
    assert discharge.conical_divergence_factor(math.radians(15)) == pytest.approx(0.98296, abs=1e-5)
    assert discharge.conical_divergence_factor(0.0) == 1.0
