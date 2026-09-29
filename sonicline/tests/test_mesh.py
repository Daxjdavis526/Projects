"""Structural invariants of the generated meshes (no OpenFOAM needed)."""

import math

import numpy as np
import pytest

from sonicline.core.profile import conical
from sonicline.mesh import distribution as dist
from sonicline.mesh.polymesh import _face_geometry
from sonicline.mesh.revolved import Form, PlumeRegion, Resolution, RevolvedMeshSpec, build

PROFILE = conical(1e-3, 2.88)
DE = 2 * PROFILE.exit_radius
WEDGE = math.radians(5.0)


def mesh_for(form, viscous, plume, quality="coarse"):
    spec = RevolvedMeshSpec(form, Resolution.preset(quality), 5e-8 if viscous else None, WEDGE,
                            PlumeRegion(20 * DE, 6 * DE) if plume else None)
    return build(PROFILE, spec)


CASES = [(Form.WEDGE, False, False), (Form.WEDGE, True, True), (Form.O_GRID, False, True),
         (Form.WEDGE, False, True)]


@pytest.fixture(scope="module", params=CASES, ids=lambda c: f"{c[0].value}-{'visc' if c[1] else 'inv'}-{'plume' if c[2] else 'trunc'}")
def built(request):
    form, viscous, plume = request.param
    mesh, meta = mesh_for(form, viscous, plume)
    return form, plume, mesh, meta


def _cell_sums(mesh):
    """Sum of outward face-area vectors per cell and cell volumes."""
    centre, normal = _face_geometry(mesh.points, mesh.faces)
    n_int = mesh.n_internal_faces
    area_sum = np.zeros((mesh.n_cells, 3))
    vol = np.zeros(mesh.n_cells)
    np.add.at(area_sum, mesh.owner, normal)
    np.add.at(area_sum, mesh.neighbour, -normal[:n_int])
    cv = np.einsum("ij,ij->i", centre, normal) / 3.0
    np.add.at(vol, mesh.owner, cv)
    np.add.at(vol, mesh.neighbour, -cv[:n_int])
    return area_sum, vol


def test_cells_are_closed_and_positive(built):
    _, _, mesh, _ = built
    area_sum, vol = _cell_sums(mesh)
    face_scale = np.abs(_face_geometry(mesh.points, mesh.faces)[1]).max()
    assert np.abs(area_sum).max() < 1e-9 * face_scale
    assert (vol > 0).all()


def test_face_ordering_is_upper_triangular(built):
    _, _, mesh, _ = built
    n = mesh.n_internal_faces
    assert (mesh.neighbour > mesh.owner[:n]).all()
    order = np.lexsort((mesh.neighbour, mesh.owner[:n]))
    assert (order == np.arange(n)).all()
    starts = np.array(mesh.patch_start)
    assert starts[0] == n and (np.diff(starts) == np.array(mesh.patch_size[:-1])).all()


def test_patches(built):
    form, plume, mesh, _ = built
    names = {p.name for p in mesh.patches}
    expected = {"inlet", "wall", "outlet"} | ({"lip", "ambient"} if plume else set())
    expected |= {"front", "back"} if form is Form.WEDGE else set()
    assert names == expected
    assert all(s > 0 for s in mesh.patch_size)


def test_wall_points_lie_on_the_profile(built):
    form, _, mesh, _ = built
    faces = mesh.faces[mesh.patch_faces("wall")]
    pts = mesh.points[np.unique(faces[faces >= 0])]
    r = np.hypot(pts[:, 1], pts[:, 2])
    ratio = r / np.array([PROFILE.radius(x) for x in pts[:, 0]])
    if form is Form.WEDGE:
        assert np.abs(ratio - 1.0).max() < 1e-12
    else:
        # Every vertex at the same area-preserving factor, 0.1-0.4 % out.
        assert ratio.max() - ratio.min() < 1e-12 and 1.0 < ratio[0] < 1.004


def test_zone_areas_are_exact(built):
    form, plume, mesh, meta = built
    factor = 2 * math.pi / math.sin(WEDGE) if form is Form.WEDGE else 1.0
    idx, flip = mesh.face_zones["throat"]
    _, normal = _face_geometry(mesh.points, mesh.faces[idx])
    signed = np.where(flip, -1, 1) * normal[:, 0]
    assert (signed > 0).all()  # flipMap orients every zone face along +x
    area = signed.sum() * factor
    # Both forms reproduce the circle's area exactly.
    assert area == pytest.approx(math.pi * PROFILE.throat_radius**2, rel=1e-12)


def test_wedge_has_no_axis_faces():
    mesh, _ = mesh_for(Form.WEDGE, False, False)
    r = np.hypot(*_face_geometry(mesh.points, mesh.faces)[0][:, 1:].T)
    assert (r > 0).all()
    assert (mesh.faces[:, 3] < 0).any()  # the axis cells are prisms


def test_build_is_deterministic():
    a, _ = mesh_for(Form.WEDGE, True, True)
    b, _ = mesh_for(Form.WEDGE, True, True)
    assert np.array_equal(a.points, b.points) and np.array_equal(a.faces, b.faces)


def test_first_cell_matches_request():
    mesh, meta = mesh_for(Form.WEDGE, True, False)
    i_t = meta.throat_station
    x_t = meta.stations[i_t]
    pts = mesh.points[np.isclose(mesh.points[:, 0], x_t) & (mesh.points[:, 2] > 0)]
    r = np.sort(np.hypot(pts[:, 1], pts[:, 2]))
    assert r[-1] - r[-2] == pytest.approx(5e-8, rel=1e-6)


def test_distributions():
    p = dist.wall_clustered(1.0, 1e-3, 30)
    assert p[0] == 0.0 and p[-1] == pytest.approx(1.0) and p[-1] - p[-2] == pytest.approx(1e-3)
    assert (np.diff(p) > 0).all()
    g = dist.geometric(2.0, 0.1, 0.01)
    assert g[-1] == pytest.approx(2.0) and np.diff(g)[0] > np.diff(g)[-1]
    a = dist.capped_from_wall(1.0, 1e-4, 1.2, 0.05, 60)
    b = dist.capped_from_wall(1.0, 1e-2, 1.2, 0.05, 60)
    assert a[-1] == pytest.approx(1.0) and b[-1] == pytest.approx(1.0)


def test_planar_mesh_is_a_constant_depth_half_channel():
    import math

    from sonicline.core.profile import conical
    from sonicline.mesh.revolved import PLANAR_DEPTH, Form, Resolution, RevolvedMeshSpec, build

    import dataclasses
    prof = dataclasses.replace(conical(0.01, 2.0 ** 2, 3.0 ** 2), planar_width=0.05)
    assert prof.expansion_ratio == pytest.approx(2.0)  # heights, not radii squared
    assert prof.throat_area == pytest.approx(2 * 0.05 * 0.01)
    mesh, meta = build(prof, RevolvedMeshSpec(Form.PLANAR, Resolution.preset("coarse"), None))
    assert meta.patches["front"] == meta.patches["back"] == "empty"
    assert meta.patches["axis"] == "symmetryPlane"
    z = mesh.points[:, 2]
    assert set(np.round(np.unique(z) / (0.5 * PLANAR_DEPTH * 0.01), 12)) == {-1.0, 1.0}
    assert mesh.points[:, 1].min() == pytest.approx(0.0, abs=1e-15)
    assert mesh.points[:, 1].max() == pytest.approx(prof.inlet_radius, rel=1e-12)
    assert not math.isnan(meta.stations[meta.throat_station])
