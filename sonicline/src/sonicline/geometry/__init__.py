"""Geometry input: STEP files of revolved thruster fluid volumes.

The CAD kernel (gmsh's OpenCASCADE) runs in a separate worker process
(:mod:`sonicline.geometry.worker`): a malformed file can crash the kernel,
and that must not take the application down with it. The parent sees only
JSON.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

from ..core.profile import Profile, from_points

LENGTH_UNITS = {"m": 1.0, "mm": 1e-3, "cm": 1e-2, "in": 0.0254}


class GeometryError(RuntimeError):
    pass


@dataclass
class GeometryReport:
    """What the analyser found. Lengths in metres, in the nozzle frame
    (x along the axis from inlet to exit)."""

    ok: bool
    kind: str  # "fluid_volume" | "solid_body" | "unknown"
    volumes: int
    volume: float
    axisymmetric: bool
    roundness_min: float
    profile_points: list[tuple[float, float]]
    throat_x: float | None
    throat_radius: float | None
    inlet_end: str  # "min" | "max": which end of the detected axis the inlet is at
    inlet_confidence: str  # "high" | "low"
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    axis_origin: list[float] | None = None
    axis_direction: list[float] | None = None
    axis_extent: list[float] | None = None  # (min, max) along the axis from axis_origin
    source: str = "step"  # "step" | "stl"
    checks: dict = field(default_factory=dict)  # surface checks (STL)

    def nozzle_frame(self):
        """4x4 transform from the file's frame (metres) to the nozzle frame."""
        from .frame import to_nozzle_frame

        return to_nozzle_frame(self.axis_origin, self.axis_direction, self.axis_extent, self.inlet_end)

    def profile(self) -> Profile:
        return from_points(self.profile_points)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _worker(args: list[str], timeout: float = 300.0) -> dict:
    proc = subprocess.run([sys.executable, "-m", "sonicline.geometry.worker", *args],
                          capture_output=True, text=True, timeout=timeout)
    if proc.returncode != 0:
        tail = (proc.stderr or proc.stdout).strip().splitlines()[-5:]
        raise GeometryError("the geometry kernel failed:\n" + "\n".join(tail))
    return json.loads(proc.stdout.strip().splitlines()[-1])


def analyse(path: Path, length_unit: str = "mm", inlet_end: str = "auto",
            stations: int = 240) -> GeometryReport:
    if length_unit not in LENGTH_UNITS:
        raise GeometryError(f"unknown length unit {length_unit!r}; use one of {sorted(LENGTH_UNITS)}")
    if not Path(path).is_file():
        raise GeometryError(f"no such file: {path}")
    if Path(path).suffix.lower() == ".stl":
        from . import surface

        return surface.analyse(Path(path), LENGTH_UNITS[length_unit], inlet_end, stations)
    data = _worker(["analyse", str(path), str(LENGTH_UNITS[length_unit]), inlet_end, str(stations)])
    data["profile_points"] = [tuple(p) for p in data["profile_points"]]
    return GeometryReport(**data)


def tessellate(path: Path, length_unit: str, out: Path, size: float) -> Path:
    """A STEP or STL file's surface as an ASCII STL in metres (file frame)."""
    if Path(path).suffix.lower() == ".stl":
        from . import surface

        surface.load(Path(path), LENGTH_UNITS[length_unit]).export(str(out))
        return Path(out)
    _worker(["tessellate", str(path), str(LENGTH_UNITS[length_unit]), str(out), repr(size)])
    return Path(out)


def write_revolved_step(profile: Profile, path: Path, n_per_segment: int = 1) -> None:
    """Write the fluid volume of a revolved profile as a STEP file (in mm),
    with lines and circular arcs kept exact."""
    segs = []
    for s in profile.segments:
        kind = "arc" if hasattr(s, "R") else "line"
        entry = {"kind": kind, "x0": s.x0, "r0": s.radius(s.x0), "x1": s.x1, "r1": s.radius(s.x1)}
        if kind == "arc":
            entry.update({"xc": s.xc, "rc": s.rc})
        segs.append(entry)
    spec = Path(path).with_suffix(".segments.json")
    spec.write_text(json.dumps(segs), encoding="utf-8")
    try:
        _worker(["write", str(spec), str(path)])
    finally:
        spec.unlink(missing_ok=True)


def check_definition_file(path: Path, expected_sha256: str) -> None:
    actual = sha256(path)
    if actual != expected_sha256:
        raise GeometryError(
            f"{path.name} has changed since the simulation was defined "
            f"(sha256 {actual[:12]}..., expected {expected_sha256[:12]}...)"
        )


def extract_fluid(path: Path, length_unit: str, out: Path) -> dict:
    """The gas passage of a solid thruster body, written to ``out`` (STEP):
    a preview for the user to confirm, never used silently. Returns the
    worker's report (ok, errors, the cavities found and the one chosen)."""
    if Path(path).suffix.lower() == ".stl":
        raise GeometryError("extracting the gas volume needs a STEP body (an STL has no faces to cap)")
    return _worker(["extract", str(path), str(LENGTH_UNITS[length_unit]), str(out)])
