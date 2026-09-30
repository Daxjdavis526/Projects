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
        v = [i for i in f if i >= 0]
        rows.append(f"{len(v)}({' '.join(map(str, v))})")
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


# --------------------------------------------------------------------------- reading


def _strip(text: str) -> str:
    """The body of an ASCII OpenFOAM file: header and comments removed."""
    import re

    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    text = re.sub(r"//[^\n]*", "", text)
    i = text.find("FoamFile")
    if i >= 0:
        depth, j = 0, text.index("{", i)
        while True:
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        text = text[j + 1:]
    return text


def _numbers(text: str, dtype) -> np.ndarray:
    """All numbers in ``text``, parentheses ignored, parsed in C (a mesh of a
    million cells has files of hundreds of megabytes)."""
    import warnings

    clean = text.translate(_NO_PARENS)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", DeprecationWarning)
        values = np.fromstring(clean, dtype=np.float64, sep=" ")
    return values.astype(dtype) if dtype is not float else values


_NO_PARENS = str.maketrans("()", "  ")


def _list_body(text: str) -> tuple[int, str]:
    """Count and the text between the outer parentheses of the first list."""
    body = _strip(text).strip()
    open_ = body.index("(")
    n = int(body[:open_].split()[-1])
    close = body.rindex(")")
    return n, body[open_ + 1: close]


def read(case: Path) -> PolyMesh:
    """An ASCII constant/polyMesh (as snappyHexMesh or gmshToFoam write it)
    as a :class:`PolyMesh`, with cell centres. Faces of any size are kept,
    -1 padded to the largest."""
    import re

    from ..mesh.polymesh import Patch

    d = Path(case) / "constant" / "polyMesh"
    read_text = lambda name: (d / name).read_text(encoding="utf-8", errors="replace")  # noqa: E731
    n, body = _list_body(read_text("points"))
    points = _numbers(body, float).reshape(n, 3)

    text = read_text("faces")
    if "faceCompactList" in text.split("}", 1)[0]:
        stripped = _strip(text)
        first = stripped.index("(")
        n_off = int(stripped[:first].split()[-1])
        end = stripped.index(")", first)
        offsets = _numbers(stripped[first + 1: end], np.int64)
        rest = stripped[end + 1:]
        second = rest.index("(")
        flat = _numbers(rest[second + 1: rest.rindex(")")], np.int64)
        sizes = np.diff(offsets)
        assert len(offsets) == n_off
    else:
        # "n(a b c ...)" per face: one stream of numbers, each size followed
        # by that many labels.
        n, body = _list_body(text)
        stream = _numbers(body, np.int64)
        heads = np.empty(n, dtype=np.int64)
        pos = 0
        values = stream.tolist()
        for i in range(n):
            heads[i] = pos
            pos += 1 + values[pos]
        del values
        sizes = stream[heads]
        keep = np.ones(len(stream), dtype=bool)
        keep[heads] = False
        flat = stream[keep]
        offsets = np.concatenate([[0], np.cumsum(sizes)])
    k = max(4, int(sizes.max()))
    faces = np.full((len(sizes), k), -1, dtype=np.int64)
    col = np.arange(len(flat)) - np.repeat(offsets[:-1], sizes)
    faces[np.repeat(np.arange(len(sizes)), sizes), col] = flat

    _, body = _list_body(read_text("owner"))
    owner = _numbers(body, np.int64)
    _, body = _list_body(read_text("neighbour"))
    neighbour = _numbers(body, np.int64)

    patches, starts, nfaces = [], [], []
    bnd = _strip(read_text("boundary"))
    for m in re.finditer(r"(\w+)\s*\{([^}]*)\}", bnd):
        entries = dict(re.findall(r"(\w+)\s+([^;]+);", m.group(2)))
        patches.append(Patch(m.group(1), entries["type"].strip()))
        starts.append(int(entries["startFace"]))
        nfaces.append(int(entries["nFaces"]))

    # Some writers (cfMesh) pad the neighbour list to every face with -1;
    # the internal faces are those before the first patch.
    neighbour = neighbour[: min(starts)] if starts else neighbour
    mesh = PolyMesh(points, faces, owner, neighbour, patches, starts, nfaces)
    mesh.cell_centres = cell_centres(mesh)
    return mesh


def cell_centres(mesh: PolyMesh) -> np.ndarray:
    """Volume centroids by pyramid decomposition about each cell's face
    average, as OpenFOAM computes them."""
    fc, fa = face_centroids(mesh.points, mesh.faces)
    n = mesh.n_cells
    own, nei = mesh.owner, mesh.neighbour
    ni = len(nei)
    count = np.bincount(own, minlength=n) + np.bincount(nei, minlength=n)
    est = np.zeros((n, 3))
    np.add.at(est, own, fc)
    np.add.at(est, nei, fc[:ni])
    est /= count[:, None]
    # Pyramid of each face on the estimate: volume (1/3) A.(fc - est), centroid 3/4 fc + 1/4 est.
    vol = np.zeros(n)
    mom = np.zeros((n, 3))
    for cells, faces, sign in ((own, slice(None), 1.0), (nei, slice(0, ni), -1.0)):
        v = sign * np.einsum("ij,ij->i", fa[faces], fc[faces] - est[cells]) / 3.0
        c = 0.75 * fc[faces] + 0.25 * est[cells]
        np.add.at(vol, cells, v)
        np.add.at(mom, cells, v[:, None] * c)
    return mom / np.where(np.abs(vol) > 0, vol, 1.0)[:, None]


def face_centroids(points: np.ndarray, faces: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Area centroids and area vectors of (-1 padded) polygons, by a fan of
    triangles about the vertex average, as OpenFOAM computes them. (The
    vertex average alone is off for a face with a hanging node.) Faces are
    processed in groups of equal size: no padding enters the arithmetic."""
    sizes = (faces >= 0).sum(axis=1)
    centre = np.empty((len(faces), 3))
    area = np.empty((len(faces), 3))
    for k in np.unique(sizes):
        rows = np.nonzero(sizes == k)[0]
        p = points[faces[rows, :k]]  # (m, k, 3)
        mid = p.mean(axis=1)
        q = np.roll(p, -1, axis=1)
        tri = 0.5 * np.cross(p - mid[:, None, :], q - mid[:, None, :])
        a = tri.sum(axis=1)
        w = np.einsum("mkc,mc->mk", tri, a)  # each triangle's area along the face normal
        wsum = w.sum(axis=1)
        c = ((p + q + mid[:, None, :]) / 3.0 * w[..., None]).sum(axis=1)
        good = np.abs(wsum) > 0
        centre[rows] = np.where(good[:, None], c / np.where(good, wsum, 1.0)[:, None], mid)
        area[rows] = a
    return centre, area
