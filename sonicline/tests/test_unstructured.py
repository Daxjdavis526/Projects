"""Tier 2 meshing pieces that need no OpenFOAM: the domain surface and its
patches, the background grid, face zones and the polyhedral mesh reader.
snappyHexMesh itself runs in the openfoam tests (V14)."""

import math

import numpy as np
import pytest

trimesh = pytest.importorskip("trimesh")
pytest.importorskip("manifold3d")

from sonicline.core import model as m  # noqa: E402
from sonicline.core.profile import conical  # noqa: E402
from sonicline.mesh import unstructured as U  # noqa: E402


_CACHE = {}


def _nozzle(profile):
    """The profile revolved exactly (STEP) and triangulated, as the
    pipeline builds it."""
    pytest.importorskip("gmsh")
    import tempfile
    from pathlib import Path

    from sonicline import geometry
    from sonicline.geometry import surface

    if "n" not in _CACHE:
        d = Path(tempfile.mkdtemp())
        geometry.write_revolved_step(profile, d / "n.step")
        _CACHE["n"] = surface.load(geometry.tessellate(d / "n.step", "mm", d / "n.stl", 0.2e-3), 1.0)
    return _CACHE["n"].copy()


def _defn(exit_domain):
    return m.SimulationDefinition(
        name="t", geometry=m.ConicalNozzle(throat_radius=1e-3, expansion_ratio=2.88),
        boundaries=m.Boundaries(inlet=m.ReservoirInlet(p0=20e5), exit_domain=exit_domain,
                                ambient=m.Ambient(pressure=0.0 if isinstance(exit_domain, m.TruncatedAtExit)
                                                  else 101325.0)),
        flow=m.Flow(turbulence=m.Inviscid()),
        mesh=m.MeshSpec(form=m.MeshForm.UNSTRUCTURED, quality=m.MeshQuality.COARSE))


@pytest.fixture(scope="module")
def profile():
    return conical(1e-3, 2.88)


def test_truncated_domain_patches(profile):
    noz = _nozzle(profile)
    s = U.domain_surface(noz, profile, _defn(m.TruncatedAtExit()))
    assert set(s.parts) == {"inlet", "wall", "outlet"}
    assert s.kinds == {"inlet": "patch", "wall": "wall", "outlet": "patch"}
    area = lambda name: float(s.parts[name].area)  # noqa: E731
    # Faceted disks: within the polygon-to-circle ratio of the exact area.
    assert area("inlet") == pytest.approx(math.pi * profile.inlet_radius**2, rel=4e-3)
    assert area("outlet") == pytest.approx(math.pi * profile.exit_radius**2, rel=4e-3)
    assert s.x_end == s.x_exit == pytest.approx(profile.x_exit)


def test_plume_is_fused_and_split(profile):
    noz = _nozzle(profile)
    s = U.domain_surface(noz, profile, _defn(m.Plume(length=10.0, radius=4.0)))
    assert set(s.parts) == {"inlet", "wall", "lip", "ambient", "outlet"}
    assert s.kinds["lip"] == "patch" and s.kinds["ambient"] == "patch"
    De = 2 * profile.exit_radius
    assert s.x_end == pytest.approx(profile.x_exit + 10 * De) and s.radius == pytest.approx(4 * De)
    # The lip is the plume's back face less the nozzle exit opening.
    lip = float(s.parts["lip"].area)
    assert lip == pytest.approx(math.pi * ((4 * De) ** 2 - profile.exit_radius**2), rel=3e-3)
    whole = trimesh.util.concatenate(list(s.parts.values()))
    whole.merge_vertices()
    assert whole.is_watertight
    wall = U.domain_surface(noz, profile, _defn(m.Plume(length=10.0, radius=4.0, lip=m.Lip.WALL)))
    assert wall.kinds["lip"] == "wall"


def test_background_grid_has_the_throat_and_exit_planes(profile, tmp_path):
    noz = _nozzle(profile)
    s = U.domain_surface(noz, profile, _defn(m.Plume()))
    spec = U.spec_for(_defn(m.Plume()), profile, None)
    assert spec.wall_cell == pytest.approx(1e-3 / 10) and spec.layers == 0
    d = U._block_mesh_dict(s, spec)
    import re

    xs = sorted({float(v) for v in re.findall(r"\(([-+.\deE]+) [-+.\deE]+ [-+.\deE]+\)", d["vertices"].text)})
    assert any(abs(x - s.x_throat) < 1e-15 for x in xs) and any(abs(x - s.x_exit) < 1e-15 for x in xs)
    p = U.location_in_mesh(s, spec)
    assert noz.contains([p])[0]


def test_layers_follow_the_first_cell(profile):
    viscous = _defn(m.TruncatedAtExit())
    viscous = m.SimulationDefinition(**{**viscous.__dict__, "flow": m.Flow(turbulence=m.Laminar())})
    spec = U.spec_for(viscous, profile, 1e-5)
    h = spec.wall_cell
    # The last layer reaches about half a wall cell.
    last = 1e-5 * U.LAYER_GROWTH ** (spec.layers - 1)
    assert 0.5 * h <= last < 0.5 * h * U.LAYER_GROWTH and spec.wall_resolved


def test_plane_zone_is_a_closed_cut_through_a_hex_block():
    from sonicline.mesh import polymesh

    # A 4 x 2 x 2 block of unit cubes along x.
    nx, ny, nz = 4, 2, 2
    pts = np.array([(i, j, k) for k in range(nz + 1) for j in range(ny + 1) for i in range(nx + 1)], float)
    idx = lambda i, j, k: i + (nx + 1) * (j + (ny + 1) * k)  # noqa: E731
    cells = [[idx(i, j, k), idx(i + 1, j, k), idx(i + 1, j + 1, k), idx(i, j + 1, k),
              idx(i, j, k + 1), idx(i + 1, j, k + 1), idx(i + 1, j + 1, k + 1), idx(i, j + 1, k + 1)]
             for k in range(nz) for j in range(ny) for i in range(nx)]
    # Local faces 0/1 are the x ends of a cell, 2/3 the y ends, 4/5 the z ends.
    fp = -np.ones((len(cells), 6), dtype=int)
    for c, (i, j, k) in enumerate((i, j, k) for k in range(nz) for j in range(ny) for i in range(nx)):
        for face, edge in ((0, i == 0), (1, i == nx - 1), (2, j == 0), (3, j == ny - 1),
                           (4, k == 0), (5, k == nz - 1)):
            if edge:
                fp[c, face] = 0
    mesh = polymesh.assemble(pts, np.array(cells), fp, [polymesh.Patch("walls", "wall")])
    faces, flip = U.plane_zone(mesh, 2.0)
    _, normals = polymesh._face_geometry(mesh.points, mesh.faces[faces])
    oriented = np.where(flip, -1.0, 1.0)[:, None] * normals
    assert len(faces) == ny * nz and np.allclose(oriented.sum(axis=0), [ny * nz, 0, 0])


def test_a_jagged_cut_is_oriented_upstream_to_downstream():
    """Where the cut runs along faces parallel to the axis (a jagged cut
    through a cut-cell mesh), the orientation comes from which side each
    cell is on, not from the sign of the normal's x component."""
    from sonicline.mesh import polymesh

    nx, ny, nz = 4, 2, 2
    pts = np.array([(i, j, k) for k in range(nz + 1) for j in range(ny + 1) for i in range(nx + 1)], float)
    idx = lambda i, j, k: i + (nx + 1) * (j + (ny + 1) * k)  # noqa: E731
    ijk = [(i, j, k) for k in range(nz) for j in range(ny) for i in range(nx)]
    cells = [[idx(i, j, k), idx(i + 1, j, k), idx(i + 1, j + 1, k), idx(i, j + 1, k),
              idx(i, j, k + 1), idx(i + 1, j, k + 1), idx(i + 1, j + 1, k + 1), idx(i, j + 1, k + 1)]
             for i, j, k in ijk]
    fp = -np.ones((len(cells), 6), dtype=int)
    for c, (i, j, k) in enumerate(ijk):
        for face, edge in ((0, i == 0), (1, i == nx - 1), (2, j == 0), (3, j == ny - 1),
                           (4, k == 0), (5, k == nz - 1)):
            if edge:
                fp[c, face] = 0
    mesh = polymesh.assemble(pts, np.array(cells), fp, [polymesh.Patch("walls", "wall")])
    # Pull the cells of column i = 1 at j = 0 across the cut: the cut then
    # also runs along faces normal to y, owned by the downstream cell.
    for c, (i, j, k) in enumerate(ijk):
        if i == 1 and j == 0:
            mesh.cell_centres[c, 0] = 2.5
    faces, flip = U.plane_zone(mesh, 2.0)
    _, normals = polymesh._face_geometry(mesh.points, mesh.faces[faces])
    oriented = np.where(flip, -1.0, 1.0)[:, None] * normals
    up = mesh.cell_centres[:, 0] < 2.0
    own, nei = mesh.owner[faces], mesh.neighbour[faces]
    down_minus_up = np.where(up[own][:, None], 1.0, -1.0) * (mesh.cell_centres[nei] - mesh.cell_centres[own])
    assert np.any(np.abs(normals[:, 0]) < 1e-12)  # the cut has faces parallel to the axis
    assert (np.einsum("ij,ij->i", oriented, down_minus_up) > 0).all()


def test_polyhedral_faces_round_trip(tmp_path):
    """Faces of five and more vertices (snappy's split hexes) survive
    writing and reading, and the cell centre is the volume centroid."""
    from sonicline.foam import polymesh_io
    from sonicline.mesh.polymesh import Patch, PolyMesh

    # A unit cube whose +x face is split into a pentagon by an extra point
    # (a hanging node, as refinement leaves them).
    pts = np.array([(0, 0, 0), (1, 0, 0), (1, 1, 0), (0, 1, 0), (0, 0, 1), (1, 0, 1), (1, 1, 1),
                    (0, 1, 1), (1, 0.5, 0)], float)
    faces = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [3, 7, 6, 2], [0, 4, 7, 3], [1, 8, 2, 6, 5]]
    F = np.full((6, 5), -1)
    for i, f in enumerate(faces):
        F[i, :len(f)] = f
    # The bottom face must carry the hanging node too to stay closed.
    F[0] = [0, 3, 2, 8, 1]
    mesh = PolyMesh(pts, F, np.zeros(6, dtype=int), np.zeros(0, dtype=int), [Patch("box", "wall")], [0], [6])
    polymesh_io.write(mesh, tmp_path)
    back = polymesh_io.read(tmp_path)
    assert back.faces.shape[1] == 5 and (back.faces == F).all()
    assert np.allclose(back.cell_centres[0], [0.5, 0.5, 0.5])


def test_cfmesh_dictionary_and_layer_counts(profile):
    noz = _nozzle(profile)
    viscous = m.SimulationDefinition(**{**_defn(m.Plume()).__dict__, "flow": m.Flow(turbulence=m.KOmegaSST()),
                                        "mesh": m.MeshSpec(form=m.MeshForm.UNSTRUCTURED,
                                                           quality=m.MeshQuality.COARSE,
                                                           first_cell_yplus=30.0)})
    s = U.domain_surface(noz, profile, viscous)
    spec = U.spec_for(viscous, profile, 1.6e-6)
    n = U.cfmesh_layers(spec)
    # The layers fill half a wall cell from the first height at the growth rate.
    g = U.LAYER_GROWTH
    assert 1.6e-6 * (g ** (n - 1) - 1) / (g - 1) < 0.5 * spec.wall_cell <= 1.6e-6 * (g**n - 1) / (g - 1)
    d = U._cfmesh_dict(s, spec)
    assert d["boundaryLayers"]["patchBoundaryLayers"]["wall"]["maxFirstLayerThickness"] == 1.6e-6
    assert d["renameBoundary"]["newPatchNames"]["wall"]["type"] == "wall"
    assert set(d["objectRefinements"]) == {"throat", "jet0", "jet1"}
    # The transonic region at half the wall size (DESIGN.md finding 53).
    throat = d["objectRefinements"]["throat"]
    assert throat["cellSize"] == pytest.approx(0.5 * spec.wall_cell)
    assert d["localRefinement"]["wall"]["refinementThickness"] >= profile.inlet_radius * 0.99
    assert "boundaryLayers" not in U._cfmesh_dict(s, U.spec_for(_defn(m.Plume()), profile, None))


def test_wall_coverage_is_measured_on_the_mesh():
    """A column of cells on a wall: covered when the wall cell is as thin
    as the target first cell, not otherwise."""
    from types import SimpleNamespace

    from sonicline.mesh import polymesh

    zs = [0.0, 1e-6, 1e-3, 2e-3]
    pts = np.array([(x, y, z) for z in zs for y in (0.0, 1e-3) for x in (0.0, 1e-3)])
    idx = lambda i, j, k: i + 2 * (j + 2 * k)  # noqa: E731
    cells = np.array([[idx(0, 0, k), idx(1, 0, k), idx(1, 1, k), idx(0, 1, k),
                       idx(0, 0, k + 1), idx(1, 0, k + 1), idx(1, 1, k + 1), idx(0, 1, k + 1)] for k in range(3)])
    fp = np.full((3, 6), 1)
    fp[0, 4] = 0  # the bottom of the first cell is the wall
    fp[0, 5] = fp[1, 4] = fp[1, 5] = fp[2, 4] = -1
    mesh = polymesh.assemble(pts, cells, fp, [polymesh.Patch("wall", "wall"), polymesh.Patch("other", "patch")])
    box = trimesh.creation.box(extents=(1e-3, 1e-3, 1e-3))
    surface = SimpleNamespace(kinds={"wall": "wall", "other": "patch"}, x_throat=5e-4, nozzle=box)
    spec = SimpleNamespace(first_layer=1e-6)
    ok = U.UnstructuredReport("t", 3)
    U.wall_coverage(mesh, surface, spec, ok)
    assert ok.accepted and ok.layer_coverage == 1.0
    thick = U.UnstructuredReport("t", 3)
    U.wall_coverage(mesh, surface, SimpleNamespace(first_layer=1e-7), thick)
    assert not thick.accepted and thick.layer_coverage == 0.0 and "cover 0.0 %" in thick.reasons[0]


def test_each_mesher_keeps_the_gradient_scheme_it_was_verified_with():
    # snappyHexMesh: Gauss (V14, finding 70); cfMesh: least squares (V17,
    # finding 46); structured meshes: Gauss. The mesher survives the
    # metadata's JSON round trip, which continuation runs rewrite from.
    import numpy as np

    from sonicline.foam.case import STRUCTURED_GRAD, UNSTRUCTURED_GRAD, gradient_scheme
    from sonicline.mesh.revolved import Form, MeshMeta

    def meta(form, mesher=""):
        return MeshMeta(np.zeros(2), 0, 1, [[0]], [0], 1e-5, form, {}, mesher)

    assert gradient_scheme(meta(Form.UNSTRUCTURED, "snappyHexMesh")) == STRUCTURED_GRAD
    assert gradient_scheme(meta(Form.UNSTRUCTURED, "cfMesh")) == UNSTRUCTURED_GRAD
    assert gradient_scheme(meta(Form.WEDGE)) == STRUCTURED_GRAD
    assert MeshMeta.from_json(meta(Form.UNSTRUCTURED, "cfMesh").to_json()).mesher == "cfMesh"
