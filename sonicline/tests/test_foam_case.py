"""The case builder writes a complete, deterministic case (no OpenFOAM needed)."""

import hashlib
import json

import pytest

from sonicline.core import model as m
from sonicline.core.validate import resolve_profile
from sonicline.foam.case import build_case, needs_viscous_work_extension
from sonicline.mesh import revolved, sizing

BASE = {
    "name": "t",
    "geometry": {"type": "conical_nozzle", "throat_radius": "1 mm", "expansion_ratio": 2.88},
    "boundaries": {"inlet": {"type": "reservoir_inlet", "p0": "20 bar"}},
    "mesh": {"form": "wedge", "quality": "coarse"},
}


def _build(tmp_path, name, overrides=None):
    src = json.loads(json.dumps(BASE))
    for k, v in (overrides or {}).items():
        src[k] = v
    defn = m.loads(json.dumps(src))
    profile = resolve_profile(defn)
    mesh, meta = revolved.build(profile, sizing.spec_for(defn, profile))
    summary = build_case(tmp_path / name, defn, profile, mesh, meta,
                         "libsoniclineFvOptions_test.so" if needs_viscous_work_extension(defn, profile) else None)
    return summary


def _digest(path):
    h = hashlib.sha256()
    for f in sorted(p for p in path.rglob("*") if p.is_file()):
        h.update(str(f.relative_to(path)).encode())
        h.update(f.read_bytes())
    return h.hexdigest()


def test_case_is_complete(tmp_path):
    s = _build(tmp_path, "a")
    case = s.path
    for rel in ("system/controlDict", "system/fvSchemes", "system/fvSolution",
                "constant/thermophysicalProperties", "constant/turbulenceProperties",
                "constant/polyMesh/faces", "constant/polyMesh/faceZones",
                "0/p", "0/T", "0/U", "0/k", "0/omega", "0/nut", "0/alphat"):
        assert (case / rel).is_file(), rel
    assert "viscousWork" in (case / "constant/fvOptions").read_text()
    assert '"libsoniclineFvOptions_test.so"' in (case / "system/controlDict").read_text()
    thermo = (case / "constant/thermophysicalProperties").read_text()
    assert "sensibleInternalEnergy" in thermo and "hePsiThermo" in thermo and "sutherland" in thermo
    assert "janaf" not in thermo  # clamps T at 200 K: never for cold gas
    p = (case / "0/p").read_text()
    assert "wedge" in p
    # Inlet (p0) and the ambient and lip entrainment boundaries at ambient
    # total pressure; a non-reflecting far outlet (the jet core may still be
    # supersonic there).
    assert p.count("totalPressure") == 3 and "waveTransmissive" in p
    assert s.sector_factor > 72.0 and s.exit_area == pytest.approx(3.1416e-6 * 2.88, rel=1e-4)


def test_case_is_deterministic(tmp_path):
    assert _digest(_build(tmp_path, "a").path) == _digest(_build(tmp_path, "b").path)


def test_viscous_case_requires_the_extension(tmp_path):
    defn = m.loads(json.dumps(BASE))
    profile = resolve_profile(defn)
    mesh, meta = revolved.build(profile, sizing.spec_for(defn, profile))
    with pytest.raises(ValueError, match="viscous-work"):
        build_case(tmp_path / "x", defn, profile, mesh, meta)


def test_extension_library_name_tracks_its_source():
    from sonicline.foam import extensions

    name = extensions.library_name()
    assert name.startswith("libsoniclineFvOptions_") and len(name) == len("libsoniclineFvOptions_") + 10
    assert (extensions.SOURCE / "viscousWork.C").is_file()


def test_inviscid_uses_slip_walls_and_no_turbulence(tmp_path):
    s = _build(tmp_path, "inv", {"flow": {"turbulence": {"type": "inviscid"}}})
    assert s.fields == ("p", "T", "U")
    assert not (s.path / "constant/fvOptions").exists()
    assert "slip" in (s.path / "0/U").read_text()
    assert "mu              0" in (s.path / "constant/thermophysicalProperties").read_text()


def test_central_solver_case(tmp_path):
    # rhoCentralFoam carries the viscous work itself: Sutherland transport,
    # no extension library, no fvOptions; Kurganov fluxes and LTS controls.
    s = _build(tmp_path, "central", {"numerics": {"solver": "rhoCentralFoam"}})
    assert s.solver == "rhoCentralFoam"
    assert s.p_min_limit is None
    control = (s.path / "system/controlDict").read_text()
    assert "application     rhoCentralFoam;" in control
    assert "libsoniclineFvOptions" not in control
    assert "rDeltaTSmoothingCoeff 1;" in control
    assert not (s.path / "constant/fvOptions").exists()
    assert "sutherland" in (s.path / "constant/thermophysicalProperties").read_text()
    schemes = (s.path / "system/fvSchemes").read_text()
    assert "fluxScheme      Kurganov;" in schemes
    assert "reconstruct(U)  vanLeerV;" in schemes
    assert "div(tauMC)" in schemes
    assert "PIMPLE" not in (s.path / "system/fvSolution").read_text()


def test_pimple_solver_case(tmp_path):
    s = _build(tmp_path, "pimple")
    assert s.solver == "rhoPimpleFoam"
    control = (s.path / "system/controlDict").read_text()
    assert "application     rhoPimpleFoam;" in control
    assert "libsoniclineFvOptions_test.so" in control
    assert "viscousWork" in (s.path / "constant/fvOptions").read_text()
    assert "transonic" in (s.path / "system/fvSolution").read_text()


def test_initial_field_follows_quasi_1d(tmp_path):
    s = _build(tmp_path, "init")
    assert s.initial.performance.regime.value == "matched"
    assert s.initial.stations[0].pressure == pytest.approx(20e5, rel=0.01)


def test_auto_solver_follows_the_physics(tmp_path):
    from sonicline import verification

    # A normal shock in the diverging section: rhoCentralFoam, with its
    # own iteration limit and a fixed static pressure on the exit plane.
    defn = verification.CASES["V2"].definition("coarse", "wedge")
    profile = resolve_profile(defn)
    mesh, meta = revolved.build(profile, sizing.spec_for(defn, profile))
    s = build_case(tmp_path / "v2", defn, profile, mesh, meta)
    assert s.solver == "rhoCentralFoam"
    control = (s.path / "system/controlDict").read_text()
    assert "endTime         60000;" in control
    outlet = (s.path / "0/p").read_text().split("outlet")[1].split("}")[0]
    assert "fixedValue" in outlet and "150000" in outlet
    # Design operation: rhoPimpleFoam.
    assert _build(tmp_path, "auto").solver == "rhoPimpleFoam"


def test_peng_robinson_case(tmp_path):
    s = _build(tmp_path, "pr", {"gas": {"equation_of_state": "peng_robinson"},
                               "flow": {"turbulence": {"type": "inviscid"}}})
    thermo = (s.path / "constant/thermophysicalProperties").read_text()
    for token in ("PengRobinsonGas", "sensibleEnthalpy", "sutherland", "Tc              126.192"):
        assert token in thermo
    assert "As              0;" in thermo  # inviscid via zero Sutherland viscosity
    assert "div(phi,h)" in (s.path / "system/fvSchemes").read_text()
    assert "(p U h)" in (s.path / "system/controlDict").read_text()


def test_planar_case_scales_integrals_to_the_full_width(tmp_path):
    from sonicline.mesh.revolved import PLANAR_DEPTH

    s = _build(tmp_path, "planar", {"mesh": {"form": "planar", "planar_width": "5 cm", "quality": "coarse"},
                                    "flow": {"turbulence": {"type": "inviscid"}}})
    assert s.sector_factor == pytest.approx(2 * 0.05 / (PLANAR_DEPTH * 1e-3))
    assert s.throat_area == pytest.approx(2 * 0.05 * 1e-3, rel=1e-9)
    assert s.exit_area / s.throat_area == pytest.approx(2.88, rel=1e-9)
    u = (s.path / "0/U").read_text()
    assert "empty" in u and "symmetryPlane" in u


def test_viscous_central_runs_start_on_rhopimplefoam(tmp_path):
    from sonicline.core.validate import resolve_profile
    from sonicline.foam import case as fc

    src = json.loads(json.dumps(BASE))
    src["numerics"] = {"solver": "rhoCentralFoam"}
    defn = m.loads(json.dumps(src))
    profile = resolve_profile(defn)
    mesh, meta = revolved.build(profile, sizing.spec_for(defn, profile))
    s = build_case(tmp_path / "c", defn, profile, mesh, meta)
    assert fc.needs_warm_start(defn, s)
    control = s.path / "system/controlDict"
    fc.write_warm_start(s.path, defn, meta, s)
    text = control.read_text()
    assert "application     rhoPimpleFoam;" in text and "endTime         1000;" in text
    assert "transonic" in (s.path / "system/fvSolution").read_text()
    fc.write_continuation(s.path, defn, meta, s, 1000)
    text = control.read_text()
    assert "application     rhoCentralFoam;" in text and "endTime         61000;" in text
    assert "fluxScheme" in (s.path / "system/fvSchemes").read_text()
    # Inviscid central runs start directly.
    inv = m.loads(json.dumps(src | {"flow": {"turbulence": {"type": "inviscid"}}}))
    si = build_case(tmp_path / "i", inv, profile, *revolved.build(profile, sizing.spec_for(inv, profile)))
    assert not fc.needs_warm_start(inv, si)
