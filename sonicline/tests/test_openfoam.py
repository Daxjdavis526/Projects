"""End-to-end runs through OpenFOAM: the fast verification tier (standard
wedge meshes, about 20 s per case).

Skipped when OpenFOAM is not installed. CI runs them on Linux with ESI
OpenFOAM v2512 (.github/workflows/sonicline.yml).
"""

import pytest

from sonicline import verification
from sonicline.run.runner import LocalRunner, OpenFOAMNotFound

try:
    LocalRunner()
    HAVE_OPENFOAM = True
except OpenFOAMNotFound:
    HAVE_OPENFOAM = False

pytestmark = [pytest.mark.openfoam,
              pytest.mark.skipif(not HAVE_OPENFOAM, reason="OpenFOAM v2512 not installed")]


# Standard meshes: on the coarse preset the choked Cd lands 0.35 % above the
# Kliegel-Levine bound, which the verdict (rightly) refuses.
@pytest.mark.parametrize("name", ["V1", "V4a"])
def test_verification_case(name, tmp_path):
    result, metrics = verification.run_case(verification.CASES[name], "standard", tmp_path)
    assert result.status == "completed", result
    assert result.trust != "not_trustworthy", metrics.get("verdict")
    failed = [f"{c.name}: {c.value} vs {c.reference} (tol {c.tolerance})" for c in result.checks if not c.passed]
    assert not failed, failed


def test_viscous_work_extension_builds(tmp_path):
    # Compiles against the installed OpenFOAM headers (openfoam2512-dev);
    # a second call finds the library and does not rebuild.
    from sonicline.foam import extensions

    runner = LocalRunner()
    lib = extensions.ensure_built(runner, tmp_path / "a")
    assert lib == f"{extensions.library_name()}.so"
    assert extensions.ensure_built(runner, tmp_path / "b") == lib
    assert not (tmp_path / "b" / "log.wmake").exists()
