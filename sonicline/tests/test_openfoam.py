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


def test_a_running_solve_can_be_cancelled(tmp_path):
    import json

    from sonicline.run import pipeline

    defn = verification.CASES["V1"].definition("standard", "wedge")
    run_dir = tmp_path / "run"

    def on_event(e):
        if e.stage == "solve" and e.message.startswith("running"):
            pipeline.request_cancel(run_dir)

    result = pipeline.run(defn, run_dir, on_event=on_event, render=False, poll_seconds=0.5)
    assert result.status == "cancelled" and result.trust == "not_trustworthy"
    manifest = json.loads((run_dir / "manifest.json").read_text())
    assert manifest["status"] == "cancelled"
    stages = [s["stage"] for s in manifest["stages"]]
    assert "mesh" in stages and "solve" in stages and stages[-1] == "done"
