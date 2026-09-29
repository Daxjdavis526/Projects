"""Write a :class:`sonicline.mesh.polymesh.PolyMesh` as constant/polyMesh."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from ..mesh.polymesh import PolyMesh
from .dictwriter import header, render


def _write(path: Path, cls: str, obj: str, body: str, note: str | None = None) -> None:
    h = header(cls, obj, "constant/polyMesh")
    if note:
        h = h.replace(f"    object      {obj};", f"    note        \"{note}\";\n    object      {obj};")
    path.write_text(h + body, encoding="utf-8", newline="\n")


def _labels(a: np.ndarray) -> str:
    return f"{len(a)}\n(\n" + "\n".join(map(str, a.tolist())) + "\n)\n"


def write(mesh: PolyMesh, case: Path) -> None:
    d = case / "constant" / "polyMesh"
    d.mkdir(parents=True, exist_ok=True)
    for stale in ("cellZones", "pointZones", "sets"):
        p = d / stale
        if p.is_file():
            p.unlink()
    n_pts, n_faces = len(mesh.points), len(mesh.faces)
    note = (f"nPoints:{n_pts}  nCells:{mesh.n_cells}  nFaces:{n_faces}  "
            f"nInternalFaces:{mesh.n_internal_faces}")

    pts = "\n".join(f"({x!r} {y!r} {z!r})" for x, y, z in mesh.points.tolist())
    _write(d / "points", "vectorField", "points", f"{n_pts}\n(\n{pts}\n)\n")

    rows = []
    for f in mesh.faces.tolist():
        if f[3] < 0:
            rows.append(f"3({f[0]} {f[1]} {f[2]})")
        else:
            rows.append(f"4({f[0]} {f[1]} {f[2]} {f[3]})")
    _write(d / "faces", "faceList", "faces", f"{n_faces}\n(\n" + "\n".join(rows) + "\n)\n")
    _write(d / "owner", "labelList", "owner", _labels(mesh.owner), note)
    _write(d / "neighbour", "labelList", "neighbour", _labels(mesh.neighbour), note)

    entries = []
    for p, start, size in zip(mesh.patches, mesh.patch_start, mesh.patch_size):
        body = {"type": p.kind}
        if p.kind in ("wall", "wedge"):
            body["inGroups"] = [p.kind]
        body["nFaces"] = size
        body["startFace"] = start
        entries.append(f"    {p.name}\n    {{\n{render(body, 2)}    }}\n")
    _write(d / "boundary", "polyBoundaryMesh", "boundary",
           f"{len(entries)}\n(\n" + "".join(entries) + ")\n")

    zones = []
    for name, (faces, flip) in mesh.face_zones.items():
        fl = " ".join(map(str, faces.tolist()))
        fm = " ".join("1" if b else "0" for b in flip.tolist())
        zones.append(f"{name}\n{{\n    type faceZone;\n"
                     f"    faceLabels List<label> {len(faces)}({fl});\n"
                     f"    flipMap List<bool> {len(flip)}({fm});\n}}\n")
    _write(d / "faceZones", "regIOobject", "faceZones", f"{len(zones)}\n(\n" + "".join(zones) + ")\n")
