"""Assemble hexahedral cells into a face-addressed polyhedral mesh.

The generators in this package produce cells as 8-vertex hexahedra in the
usual order (0-1-2-3 one face, 4-5-6-7 the opposite face, 4 above 0).
Vertices may repeat: a hex with a collapsed edge is a prism, which is how
the wedge mesh represents the cells on the axis.

The output follows the face-addressing conventions OpenFOAM's polyMesh
requires (but this module writes no OpenFOAM syntax; sonicline.foam does):

- every face is listed once, with the owner the lower-numbered cell and the
  normal pointing out of the owner;
- internal faces come first, ordered by owner then neighbour (upper
  triangular order);
- boundary faces follow, grouped by patch.

Every boundary face must carry a patch label from the generator. An
unlabelled boundary face means the generator left a hole in the mesh, and
assembly fails rather than inventing a patch for it.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

# Local faces of a hex, as vertex indices into the cell's 8 vertices.
HEX_FACES = np.array(
    [
        [0, 4, 7, 3],  # 0: the 0-3-7-4 side
        [1, 2, 6, 5],  # 1: opposite side
        [0, 1, 5, 4],  # 2
        [3, 7, 6, 2],  # 3
        [0, 3, 2, 1],  # 4: bottom
        [4, 5, 6, 7],  # 5: top
    ]
)


@dataclass(frozen=True)
class Patch:
    name: str
    kind: str  # "patch", "wall" or "wedge"


@dataclass
class PolyMesh:
    points: np.ndarray  # (N, 3)
    faces: np.ndarray  # (F, 4); triangles padded with -1 in the last column
    owner: np.ndarray  # (F,)
    neighbour: np.ndarray  # (F_internal,)
    patches: list[Patch]
    patch_start: list[int]
    patch_size: list[int]
    face_zones: dict[str, tuple[np.ndarray, np.ndarray]] = field(default_factory=dict)
    cell_centres: np.ndarray | None = None

    @property
    def n_cells(self) -> int:
        return int(self.owner.max()) + 1 if len(self.owner) else 0

    @property
    def n_internal_faces(self) -> int:
        return len(self.neighbour)

    def patch_faces(self, name: str) -> np.ndarray:
        i = [p.name for p in self.patches].index(name)
        return np.arange(self.patch_start[i], self.patch_start[i] + self.patch_size[i])


class MeshAssemblyError(RuntimeError):
    pass


def _face_geometry(points: np.ndarray, faces: np.ndarray):
    """Centroid and area vector of quads/triangles (-1 padded)."""
    tri = faces[:, 3] < 0
    f = np.where(faces < 0, faces[:, :1], faces)  # pad triangles with vertex 0
    p0, p1, p2, p3 = (points[f[:, k]] for k in range(4))
    normal = 0.5 * np.cross(p2 - p0, p3 - p1)
    normal[tri] = 0.5 * np.cross(p1[tri] - p0[tri], p2[tri] - p0[tri])
    centre = 0.25 * (p0 + p1 + p2 + p3)
    centre[tri] = (p0[tri] + p1[tri] + p2[tri]) / 3.0
    return centre, normal


def assemble(
    points: np.ndarray,
    cells: np.ndarray,
    face_patch: np.ndarray,
    patches: list[Patch],
    face_zone: np.ndarray | None = None,
    zone_names: list[str] | None = None,
    zone_direction: np.ndarray = np.array([1.0, 0.0, 0.0]),
) -> PolyMesh:
    """Build a face-addressed mesh.

    ``face_patch`` is (C, 6): for each cell's local face, the index into
    ``patches`` if that face lies on the boundary, else -1. ``face_zone`` is
    (C, 6) with an index into ``zone_names`` for faces on an internal face
    zone (either neighbour may carry the tag); zone faces are flipped so
    their normals point along ``zone_direction``.
    """
    points = np.asarray(points, dtype=float)
    cells = np.asarray(cells, dtype=np.int64)
    n_cells = len(cells)

    raw = cells[:, HEX_FACES].reshape(-1, 4)
    cell_of = np.repeat(np.arange(n_cells), 6)
    patch_of = np.asarray(face_patch).reshape(-1)
    zone_of = (np.full(len(raw), -1) if face_zone is None else np.asarray(face_zone).reshape(-1))

    # Remove vertices repeated from their cyclic predecessor (collapsed edges).
    dup = raw == np.roll(raw, 1, axis=1)
    n_unique = 4 - dup.sum(axis=1)
    keep = n_unique >= 3
    raw, cell_of, patch_of, zone_of, dup = raw[keep], cell_of[keep], patch_of[keep], zone_of[keep], dup[keep]
    faces = np.full_like(raw, -1)
    quad = ~dup.any(axis=1)
    faces[quad] = raw[quad]
    for r in np.nonzero(~quad)[0]:
        verts = raw[r][~dup[r]]
        faces[r, : len(verts)] = verts

    # Match faces shared by two cells.
    key = np.sort(np.where(faces < 0, np.iinfo(np.int64).max, faces), axis=1)
    _, inverse, counts = np.unique(key, axis=0, return_inverse=True, return_counts=True)
    inverse = inverse.reshape(-1)
    if (counts > 2).any():
        raise MeshAssemblyError("a face is shared by more than two cells")
    order = np.argsort(inverse, kind="stable")
    shared = counts[inverse[order]] == 2
    first = order[shared][0::2]
    second = order[shared][1::2]
    a, b = cell_of[first], cell_of[second]
    swap = a > b
    own_face = np.where(swap, second, first)  # the face row as seen from the owner
    owner_int = np.minimum(a, b)
    neigh_int = np.maximum(a, b)
    zone_int = np.maximum(zone_of[first], zone_of[second])

    boundary = order[counts[inverse[order]] == 1]
    unlabelled = boundary[patch_of[boundary] < 0]
    if len(unlabelled):
        c = cell_of[unlabelled[0]]
        raise MeshAssemblyError(
            f"{len(unlabelled)} boundary faces have no patch (first on cell {c}); "
            "the generator left a hole"
        )
    labelled_internal = np.concatenate([first, second])[patch_of[np.concatenate([first, second])] >= 0]
    if len(labelled_internal):
        raise MeshAssemblyError("a face labelled as boundary is shared by two cells")

    # Cell centres (vertex average over unique vertices) for orientation.
    centres = np.empty((n_cells, 3))
    for c in range(0, n_cells, 200000):
        blk = cells[c : c + 200000]
        pts = points[blk]  # (b, 8, 3)
        uniq = np.ones(blk.shape, dtype=bool)
        for k in range(1, 8):
            uniq[:, k] = ~(blk[:, :k] == blk[:, k : k + 1]).any(axis=1)
        centres[c : c + 200000] = (pts * uniq[..., None]).sum(axis=1) / uniq.sum(axis=1)[:, None]

    def orient(rows: np.ndarray, own: np.ndarray) -> np.ndarray:
        f = faces[rows].copy()
        centre, normal = _face_geometry(points, f)
        flip = np.einsum("ij,ij->i", normal, centre - centres[own]) < 0.0
        tri = f[:, 3] < 0
        f[flip & ~tri] = f[flip & ~tri][:, ::-1]
        f[flip & tri, :3] = f[flip & tri, :3][:, ::-1]
        return f

    # Internal faces in upper-triangular order.
    o = np.lexsort((neigh_int, owner_int))
    int_faces = orient(own_face[o], owner_int[o])
    owner_int, neigh_int, zone_int = owner_int[o], neigh_int[o], zone_int[o]

    # Boundary faces grouped by patch, then by owner.
    b_patch = patch_of[boundary]
    b_cell = cell_of[boundary]
    ob = np.lexsort((b_cell, b_patch))
    boundary, b_patch, b_cell = boundary[ob], b_patch[ob], b_cell[ob]
    bnd_faces = orient(boundary, b_cell)

    all_faces = np.vstack([int_faces, bnd_faces])
    owner = np.concatenate([owner_int, b_cell])
    n_int = len(neigh_int)
    starts, sizes = [], []
    for i in range(len(patches)):
        starts.append(n_int + int((b_patch < i).sum()))
        sizes.append(int((b_patch == i).sum()))

    zones: dict[str, tuple[np.ndarray, np.ndarray]] = {}
    if zone_names:
        _, normals = _face_geometry(points, int_faces)
        for zi, name in enumerate(zone_names):
            idx = np.nonzero(zone_int == zi)[0]
            flip = normals[idx] @ zone_direction < 0.0
            zones[name] = (idx, flip)

    # Drop points no face uses (collapsed duplicates never arise here, but a
    # generator may allocate unused slots) and renumber.
    used = np.zeros(len(points), dtype=bool)
    used[all_faces[all_faces >= 0]] = True
    if not used.all():
        remap = np.cumsum(used) - 1
        all_faces = np.where(all_faces >= 0, remap[np.maximum(all_faces, 0)], -1)
        points = points[used]

    return PolyMesh(points, all_faces, owner, neigh_int, list(patches), starts, sizes,
                    zones, centres)
