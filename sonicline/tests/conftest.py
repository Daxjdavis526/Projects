import importlib.util
import sys
from pathlib import Path

import pytest

from sonicline.core.gas import R_UNIVERSAL, PerfectGas

COURSE_TOOLS = Path(__file__).resolve().parents[2] / "propulsion" / "tools" / "rocket.py"


@pytest.fixture(scope="session")
def rocket():
    """The propulsion course's independent nozzle-theory module, as a
    cross-check. Imported without writing bytecode into the course tree."""
    if not COURSE_TOOLS.exists():
        pytest.skip("propulsion/tools/rocket.py not present")
    spec = importlib.util.spec_from_file_location("course_rocket", COURSE_TOOLS)
    module = importlib.util.module_from_spec(spec)
    old = sys.dont_write_bytecode
    sys.dont_write_bytecode = True
    try:
        spec.loader.exec_module(module)
    finally:
        sys.dont_write_bytecode = old
    return module


@pytest.fixture(scope="session")
def textbook_gas():
    """gamma = 1.4 exactly and R = 296.8 J/(kg K), the values textbook and
    reference-case numbers are quoted for."""
    R = 296.8
    return PerfectGas("N2-textbook", R_UNIVERSAL / R, 3.5 * R, 1.401e-6, 107.0)
