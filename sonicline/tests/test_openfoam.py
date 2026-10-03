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
    # every run records where it stands against the continuum (M11; the
    # first commit of it lost the line that computes this, unnoticed)
    assert metrics["rarefaction"]["max"] > 0 and metrics["rarefaction"]["regime"] == "continuum"
    assert set(metrics["uncertainty"]) == {"mass_flow", "thrust", "specific_impulse"}


def test_viscous_work_extension_builds(tmp_path):
    # Compiles against the installed OpenFOAM headers (openfoam2512-dev);
    # a second call finds the library and does not rebuild.
    from sonicline.foam import extensions

    runner = LocalRunner()
    lib = extensions.ensure_built(runner, tmp_path / "a")
    assert lib == f"{extensions.library_name()}.so"
    assert extensions.ensure_built(runner, tmp_path / "b") == lib
    assert not (tmp_path / "b" / "log.wmake").exists()


def test_virial_gas_runs_and_matches_its_isentrope(tmp_path):
    """V18 end to end: the virial-gas extension builds, OpenFOAM selects
    its thermophysics, and the real-gas mass flow at 30 bar matches the
    isentrope (and the reference equation of state, with CoolProp)."""
    results = verification.run_suite(["V18"], "standard", tmp_path, processors=1)
    v18 = [r for r in results if r.case == "V18"][0]
    failed = [f"{c.name}: {c.value} vs {c.reference}" for c in v18.checks if not c.passed]
    assert v18.passed and not failed, (v18, failed)


def test_heated_nitrogen_with_cp_of_t(tmp_path):
    """V20: nitrogen at 800 K, virial gas with cp(T) (janaf thermo in the
    virial-gas library): Cd against its own isentrope and the first law."""
    result, metrics = verification.run_case(verification.CASES["V20"], "standard", tmp_path)
    failed = [f"{c.name}: {c.value} vs {c.reference}" for c in result.checks if not c.passed]
    assert result.passed and not failed, (result, failed)


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


def _side_port_domain(exit_domain, turbulence=None):
    """The side-port example (not a body of revolution) in the nozzle frame."""
    pytest.importorskip("gmsh")
    pytest.importorskip("manifold3d")
    import os
    import tempfile
    from pathlib import Path

    from sonicline import geometry
    from sonicline.core import model as m
    from sonicline.geometry import surface
    from sonicline.mesh import unstructured as U

    step = Path(os.path.dirname(__file__)) / ".." / "examples" / "nozzle-side-port.step"
    report = geometry.analyse(step)
    profile = report.profile()
    stl = geometry.tessellate(step, "mm", Path(tempfile.mkdtemp()) / "s.stl", 0.15e-3)
    nozzle = U.to_frame(surface.load(stl, 1.0), report.nozzle_frame())
    defn = m.SimulationDefinition(
        name="t", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=20e5), exit_domain=exit_domain,
                                ambient=m.Ambient(pressure=0.0 if isinstance(exit_domain, m.TruncatedAtExit)
                                                  else 101325.0)),
        flow=m.Flow(turbulence=turbulence or m.Inviscid()),
        mesh=m.MeshSpec(form=m.MeshForm.UNSTRUCTURED, quality=m.MeshQuality.COARSE,
                        first_cell_yplus=1.0 if turbulence is None else 30.0))
    return U.domain_surface(nozzle, profile, defn), profile, defn, stl


@pytest.mark.parametrize("mesher", ["snappy", "cfmesh", "gmsh"])
def test_unstructured_mesh_of_a_side_port_nozzle(mesher, tmp_path):
    """Tier 2 on a volume Tier 1 cannot mesh: a plume for snappy (inviscid)
    and cfMesh (SST with wall functions: its layers must cover the wall),
    the truncated domain for gmsh. All pass checkMesh's gate and carry a
    throat zone."""

    from sonicline.core import model as m
    from sonicline.foam import case as foam_case
    from sonicline.foam import parse
    from sonicline.mesh import unstructured as U
    from sonicline.run import gates

    from sonicline.mesh.sizing import throat_first_cell

    exit_domain = m.Plume(length=6.0, radius=3.0) if mesher != "gmsh" else m.TruncatedAtExit()
    surface, profile, defn, _ = _side_port_domain(exit_domain, m.KOmegaSST() if mesher == "cfmesh" else None)
    viscous = mesher == "cfmesh"
    spec = U.spec_for(defn, profile, throat_first_cell(defn, profile) if viscous else None)
    spec.mesher = mesher
    runner = LocalRunner()
    mesh, meta, report = U.build(runner, tmp_path / "mesh", surface, profile, spec)
    assert report.accepted and report.mesher == {"snappy": "snappyHexMesh", "cfmesh": "cfMesh", "gmsh": "gmsh"}[mesher]
    if viscous:
        assert report.layer_coverage >= 0.95 and report.throat_layer_coverage == 1.0
    zones = {"throat"} | ({"exit"} if mesher != "gmsh" else set())
    assert set(mesh.face_zones) == zones
    s = foam_case.build_case(tmp_path / "case", defn, profile, mesh, meta, "libtest.so" if viscous else None)
    # Cd is judged against the geometry's throat; the mesh's own cut through
    # the throat meets the wall within a cell of it (wider there).
    assert s.throat_area == profile.throat_area
    zone = foam_case._zone_area(mesh, ("faceZone", "throat"))
    assert 0.99 * profile.throat_area < zone < 1.03 * profile.throat_area
    runner.run(["checkMesh", "-allGeometry", "-allTopology", "-writeChecks", "json"], s.path,
               s.path / "log.checkMesh")
    check = parse.read_checkmesh(s.path, (s.path / "log.checkMesh").read_text())
    assert gates.evaluate(check, viscous=viscous).ok and check.regions == 1


def test_surface_check_on_a_clean_stl():
    from sonicline.geometry import surface as stl_surface
    from sonicline.core import model as m
    import tempfile
    from pathlib import Path

    _, _, _, stl = _side_port_domain(m.TruncatedAtExit())
    crossing, log = stl_surface.self_intersection(LocalRunner(), stl, Path(tempfile.mkdtemp()))
    assert crossing is False, log[-500:]


def test_slip_walls_run_and_conserve_energy(tmp_path):
    # V21's no-slip / slip pair on its coarse planar channel, and E3a with
    # slip: the viscous-work extension keeps the slip friction in the gas
    # (DESIGN.md finding 73).
    results = verification.run_suite(["V21"], "standard", tmp_path, 2)
    pair = next(r for r in results if r.case == "V21")
    assert pair.passed, [(c.name, c.value, c.reference) for c in pair.checks]


def test_slip_central_solver_builds_from_the_installed_source(tmp_path):
    # M13: SONICLINE's rhoCentralFoam for slip walls is the installed
    # solver's own source with one patch (no viscous work through walls);
    # the patch must fit this OpenFOAM, and a second call reuses the build.
    from sonicline.foam import extensions

    runner = LocalRunner()
    exe = extensions.ensure_built(runner, tmp_path / "a", "slipCentralFoam")
    assert exe == extensions.library_name("slipCentralFoam")
    assert extensions.ensure_built(runner, tmp_path / "b", "slipCentralFoam") == exe
    assert not (tmp_path / "b" / "log.wmake").exists()
    # the patch, applied afresh to the installed source
    patched = tmp_path / "p"
    patched.mkdir()
    extensions._from_openfoam(runner, patched, "slipCentralFoam", tmp_path / "log.copy")
    source = (patched / "rhoCentralFoam.C").read_text()
    assert source.count("sigmaDotU.boundaryFieldRef()[patchi] = Zero") == 1
