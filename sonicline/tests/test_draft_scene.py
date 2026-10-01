import numpy as np

from sonicline.core.validate import resolve_profile
from sonicline.mesh import revolved, sizing
from sonicline.post import scene
from sonicline.project.draft import Draft


def test_draft_edits_parse_and_assess():
    d = Draft()
    a = d.assess()
    assert a.runnable and a.prediction.regime == "matched"
    assert 14e-3 < a.prediction.mass_flow < 15e-3
    d.set("boundaries.inlet.p0", "5 bar")  # units parse as in a definition file
    assert d.assess().definition.boundaries.inlet.p0 == 5e5
    d.set("boundaries.inlet.p0", "five bar")
    bad = d.assess()
    assert bad.definition is None and "p0" in bad.error and not bad.runnable
    d.set("boundaries.inlet.p0", 20e5)
    d.replace("boundaries.exit_domain", {"type": "truncated_at_exit"})
    codes = {f.code for f in d.assess().findings}
    assert "domain.truncated_not_supersonic" in codes and not d.assess().runnable
    d.set("boundaries.exit_domain", None)
    assert d.assess().runnable


def test_nozzle_scene_closes_the_wall():
    prof = resolve_profile(Draft().assess().definition)
    wall, inlet, exit_ = scene.nozzle(prof, n_theta=16)
    r = np.hypot(wall.points[:, 1], wall.points[:, 2])
    assert np.isclose(r.max(), max(prof.inlet_radius, prof.exit_radius), rtol=1e-9)
    assert inlet.points[:, 0].max() == prof.x_inlet and np.isclose(exit_.points[:, 0].min(), prof.x_exit)
    assert all(max(p) < len(wall.points) for p in wall.polygons)


def test_mesh_boundary_patches():
    defn = Draft().assess().definition
    prof = resolve_profile(defn)
    mesh, meta = revolved.build(prof, sizing.spec_for(defn, prof))
    surfaces = {s.name: s for s in scene.mesh_boundary(mesh)}
    assert {"inlet", "wall", "front", "back"} <= set(surfaces)
    front = surfaces["front"]
    assert all(max(p) < len(front.points) for p in front.polygons)
