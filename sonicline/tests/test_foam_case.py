"""The case builder writes a complete, deterministic case (no OpenFOAM needed)."""

import hashlib
import json

import pytest

from sonicline.core import model as m
from sonicline.core.validate import resolve_profile
from sonicline.foam.case import build_case
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
    summary = build_case(tmp_path / name, defn, profile, mesh, meta)
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


def test_inviscid_uses_slip_walls_and_no_turbulence(tmp_path):
    s = _build(tmp_path, "inv", {"flow": {"turbulence": {"type": "inviscid"}}})
    assert s.fields == ("p", "T", "U")
    assert "slip" in (s.path / "0/U").read_text()
    assert "mu              0" in (s.path / "constant/thermophysicalProperties").read_text()


def test_initial_field_follows_quasi_1d(tmp_path):
    s = _build(tmp_path, "init")
    assert s.initial.performance.regime.value == "matched"
    assert s.initial.stations[0].pressure == pytest.approx(20e5, rel=0.01)
