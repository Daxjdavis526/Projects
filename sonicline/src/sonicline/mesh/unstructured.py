"""Tier 2: unstructured meshes of arbitrary fluid volumes (DESIGN.md
section 3.5), for geometry the structured generator cannot sweep -- side
ports, non-round sections -- or on request for any nozzle.

Three external meshers, all run as separate processes:

- snappyHexMesh carves a Cartesian background mesh aligned with the nozzle
  frame, refines it to the throat's scale and snaps it to the surface. It
  is the first choice for inviscid runs (V14 verifies it). Its wall layers
  collapse to about one on these nozzles (DESIGN.md section 14), so
  viscous runs go first to
- cfMesh (``cartesianMesh``), whose boundary layers are inserted by
  splitting the boundary cells and covered every wall face at the
  wall-function first-cell height, throat included;
- gmsh as the last resort.

A mesh is accepted only if the layers cover the walls: a boundary layer
resolved on 80 % of the wall is not a resolved boundary layer. Coverage is
measured on the mesh itself (the height of each wall cell), whichever
mesher made it. checkMesh gates it afterwards like any other mesh.

The fallback is gmsh: prism layers extruded from the whole boundary and
tetrahedra filling the core, through MSH 2.2 and ``gmshToFoam``. Its
layers cover every wall face by construction; their stack is kept to 0.3
of the wall triangle size, above which extrusions from neighbouring
patches cross at the sharp inlet and exit rims (DESIGN.md section 14).

Everything is in the nozzle frame (x from the inlet plane to the exit, the
axis through the origin). The background grid has planes exactly at the
throat and exit stations, so the face zones cut there are flat away from
the wall (surface integrals over them use face-area magnitudes).
"""

from __future__ import annotations

import math
import shutil
from dataclasses import asdict, dataclass, field
from pathlib import Path

import numpy as np

from ..core.model import definition as d
from ..core.profile import Profile
from ..foam import polymesh_io
from ..foam.dictwriter import Raw, write_dict
from .polymesh import Patch, PolyMesh, _face_geometry
from .revolved import Form, MeshMeta

# Cells across the throat radius at the wall refinement level, per quality.
CELLS_PER_THROAT_RADIUS = {"coarse": 10, "standard": 14, "fine": 20}
LAYER_GROWTH = 1.2
MAX_LAYERS = 25
GMSH_LAYER_STACK = 0.3  # prism stack height / wall triangle size
GMSH_MAX_LAYERS = 40
# Acceptance: wall faces carrying at least one layer, everywhere and near
# the throat (within two throat radii of it).
LAYER_COVERAGE_MIN = 0.95
THROAT_COVERAGE_MIN = 1.0
AXIS_TOLERANCE = 1e-9  # m, planar-face classification in the nozzle frame


class MeshingError(RuntimeError):
    pass


@dataclass
class DomainSurface:
    """The closed boundary of the fluid domain, split into patches."""

    parts: dict  # patch name -> trimesh.Trimesh
    kinds: dict[str, str]  # patch name -> "patch" | "wall"
    x_inlet: float
    x_throat: float
    x_exit: float
    x_end: float  # downstream end of the domain (exit or plume outlet)
    radius: float  # largest distance of the domain from the axis
    nozzle: object = None  # the nozzle alone (refinement region)
    exit_disk: object = None  # with a plume: the nozzle's exit face, shared by nozzle and plume
    r_exit: float = 0.0  # radius of a circle of the exit's area


@dataclass
class UnstructuredSpec:
    wall_cell: float  # m, cell size at the wall refinement level
    wall_level: int
    background: float  # m, background cell size
    layers: int  # 0: no layers
    first_layer: float | None
    mesher: str = "auto"  # "auto" | "snappy" | "cfmesh" | "gmsh"
    viscous: bool = False
    wall_resolved: bool = False


@dataclass
class UnstructuredReport:
    mesher: str
    cells: int
    layer_coverage: float | None = None  # wall faces with at least one layer
    throat_layer_coverage: float | None = None
    mean_layers: float | None = None
    layers_requested: int = 0
    accepted: bool = True
    reasons: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    def to_json(self) -> dict:
        return asdict(self)


# --------------------------------------------------------------------------- surface


def to_frame(mesh, transform: np.ndarray):
    out = mesh.copy()
    out.apply_transform(transform)
    return out


def domain_surface(nozzle, profile: Profile, defn: d.SimulationDefinition) -> DomainSurface:
    """Patches of the fluid domain: the nozzle (in the nozzle frame), fused
    with a plume cylinder downstream of the exit when the definition asks
    for one."""
    import trimesh

    x_inlet = float(nozzle.vertices[:, 0].min())
    x_exit = float(nozzle.vertices[:, 0].max())
    r_exit = profile.exit_radius
    ed = defn.boundaries.exit_domain
    parts: dict[str, list[int]] = {}
    body = nozzle
    x_end = x_exit
    radius = float(np.linalg.norm(nozzle.vertices[:, 1:], axis=1).max())
    if isinstance(ed, d.Plume):
        De = 2.0 * r_exit
        length, R = ed.length * De, max(ed.radius * De, 1.5 * radius)
        cyl = trimesh.creation.cylinder(radius=R, height=length, sections=128)
        # Long side triangles become a usable triangulation (gmsh keeps the
        # surface mesh it is given).
        v, f = trimesh.remesh.subdivide_to_size(cyl.vertices, cyl.faces, max_edge=0.05 * R)
        cyl = trimesh.Trimesh(v, f)
        cyl.apply_transform(trimesh.transformations.rotation_matrix(math.pi / 2, [0, 1, 0]))
        cyl.apply_translation([x_exit + 0.5 * length, 0.0, 0.0])
        body = trimesh.boolean.union([nozzle, cyl], engine="manifold")
        x_end, radius = x_exit + length, R
    n, c = body.face_normals, body.triangles_center
    tol = max(AXIS_TOLERANCE, 1e-7 * x_end)
    axial = np.abs(n[:, 0])
    labels = np.full(len(body.faces), "wall", dtype=object)
    labels[(axial > 0.9999) & (n[:, 0] < 0) & (np.abs(c[:, 0] - x_inlet) < tol)] = "inlet"
    if isinstance(ed, d.Plume):
        r = np.linalg.norm(c[:, 1:], axis=1)
        outer = (axial < 1e-3) & (np.abs(r - radius) < 1e-3 * radius)
        labels[outer] = "ambient"
        labels[(axial > 0.9999) & (n[:, 0] < 0) & (np.abs(c[:, 0] - x_exit) < tol)] = "lip"
        labels[(axial > 0.9999) & (n[:, 0] > 0) & (np.abs(c[:, 0] - x_end) < tol)] = "outlet"
        kinds = {"inlet": "patch", "wall": "wall", "lip": "wall" if ed.lip is d.Lip.WALL else "patch",
                 "ambient": "patch", "outlet": "patch"}
    else:
        labels[(axial > 0.9999) & (n[:, 0] > 0) & (np.abs(c[:, 0] - x_exit) < tol)] = "outlet"
        kinds = {"inlet": "patch", "wall": "wall", "outlet": "patch"}
    for name in kinds:
        parts[name] = np.nonzero(labels == name)[0]
    missing = [k for k, v in parts.items() if not len(v)]
    if missing:
        raise MeshingError(f"the domain surface has no {', '.join(missing)} faces: the inlet and exit "
                           "must be planar faces normal to the axis")
    exit_disk = None
    if isinstance(ed, d.Plume):
        nn, nc = nozzle.face_normals, nozzle.triangles_center
        disk = np.nonzero((nn[:, 0] > 0.9999) & (np.abs(nc[:, 0] - x_exit) < tol))[0]
        exit_disk = nozzle.submesh([disk], append=True, repair=False)
    return DomainSurface(
        parts={k: body.submesh([v], append=True, repair=False) for k, v in parts.items()},
        kinds=kinds, x_inlet=x_inlet, x_throat=profile.throat_x, x_exit=x_exit, x_end=x_end, radius=radius,
        nozzle=nozzle, exit_disk=exit_disk, r_exit=profile.exit_radius)


def write_stl(surface: DomainSurface, path: Path, exit_plane: bool = False) -> None:
    """One ASCII STL, one solid per patch (snappy reads them as regions).
    ``exit_plane`` adds the nozzle's exit disk as the solid "exitplane" (the
    gmsh mesher's interface between the nozzle and the plume)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    parts = dict(surface.parts)
    if exit_plane and surface.exit_disk is not None:
        parts["exitplane"] = surface.exit_disk
    with open(path, "w", encoding="ascii", newline="\n") as f:
        for name, part in parts.items():
            f.write(f"solid {name}\n")
            for tri, nrm in zip(part.triangles, part.face_normals):
                f.write(f"facet normal {nrm[0]:.9e} {nrm[1]:.9e} {nrm[2]:.9e}\n outer loop\n")
                for v in tri:
                    f.write(f"  vertex {v[0]:.12e} {v[1]:.12e} {v[2]:.12e}\n")
                f.write(" endloop\nendfacet\n")
            f.write(f"endsolid {name}\n")


# --------------------------------------------------------------------------- sizing


def spec_for(defn: d.SimulationDefinition, profile: Profile, first_cell: float | None) -> UnstructuredSpec:
    """Sizes from the throat: ``first_cell`` is the wall-normal first-cell
    height for the target y+ (None for inviscid)."""
    r_t = profile.throat_radius
    n = CELLS_PER_THROAT_RADIUS[defn.mesh.quality.value] * defn.mesh.refinement
    h_wall = r_t / n
    plume = isinstance(defn.boundaries.exit_domain, d.Plume)
    target = 2.0 * profile.exit_radius if plume else max(profile.inlet_radius, profile.exit_radius)
    level = max(1, round(math.log2(target / h_wall)))
    viscous = not isinstance(defn.flow.turbulence, d.Inviscid)
    layers = 0
    if viscous and first_cell:
        # Grow from the first cell until a layer is half a wall cell thick.
        layers = int(math.ceil(math.log(max(0.5 * h_wall / first_cell, 1.0)) / math.log(LAYER_GROWTH))) + 1
        layers = min(max(layers, 3), MAX_LAYERS)
    return UnstructuredSpec(wall_cell=h_wall, wall_level=level, background=h_wall * 2**level,
                            layers=layers, first_layer=first_cell if layers else None,
                            mesher=defn.mesh.mesher, viscous=viscous,
                            wall_resolved=viscous and defn.mesh.first_cell_yplus <= 5.0)


# --------------------------------------------------------------------------- snappy


def _axis_grid(lo: float, hi: float, planes: list[float], h: float) -> list[tuple[float, float, int]]:
    """Blocks along one axis between ``lo`` and ``hi`` with a grid plane at
    each of ``planes``, cells about ``h``."""
    cuts = [lo] + sorted(p for p in planes if lo < p < hi) + [hi]
    return [(a, b, max(1, round((b - a) / h))) for a, b in zip(cuts[:-1], cuts[1:])]


def _block_mesh_dict(surface: DomainSurface, spec: UnstructuredSpec) -> dict:
    h = spec.background
    pad = 0.5 * h
    xs = _axis_grid(surface.x_inlet - pad, surface.x_end + pad, [surface.x_throat, surface.x_exit], h)
    R = surface.radius + pad
    n_r = max(2, math.ceil(2 * R / h))
    xv = [xs[0][0]] + [b for _, b, _ in xs]
    verts, blocks = [], []
    for i, x in enumerate(xv):
        verts += [(x, -R, -R), (x, R, -R), (x, R, R), (x, -R, R)]
    for i, (_, _, nx) in enumerate(xs):
        a, b = 4 * i, 4 * (i + 1)
        # Hex vertex order: x varies 0->1, y 1->2, z 0->3 in the local frame.
        blocks.append(Raw(f"hex ({a} {b} {b + 1} {a + 1} {a + 3} {b + 3} {b + 2} {a + 2}) "
                          f"({nx} {n_r} {n_r}) simpleGrading (1 1 1)"))
    return {
        "scale": 1,
        "vertices": Raw("\n(\n" + "\n".join(f"    ({x!r} {y!r} {z!r})" for x, y, z in verts) + "\n)"),
        "blocks": Raw("\n(\n" + "\n".join(f"    {b.text}" for b in blocks) + "\n)"),
        "edges": Raw("()"),
        "boundary": Raw("\n(\n    background\n    {\n        type patch;\n        faces\n        (\n"
                        + "".join(f"            ({a} {a + 1} {a + 2} {a + 3})\n" for a in (0, 4 * len(xs)))
                        + "".join(f"            ({4 * i} {4 * i + 4} {4 * i + 5} {4 * i + 1})\n"
                                  f"            ({4 * i + 1} {4 * i + 5} {4 * i + 6} {4 * i + 2})\n"
                                  f"            ({4 * i + 2} {4 * i + 6} {4 * i + 7} {4 * i + 3})\n"
                                  f"            ({4 * i + 3} {4 * i + 7} {4 * i + 4} {4 * i})\n"
                                  for i in range(len(xs)))
                        + "        );\n    }\n)"),
    }


def location_in_mesh(surface: DomainSurface, spec: UnstructuredSpec) -> tuple[float, float, float]:
    """A point inside the fluid, off every background grid plane, at the
    throat station (the one place every nozzle is sure to have gas)."""
    h = spec.wall_cell
    candidates = [(surface.x_throat + 0.313 * h, 0.127 * h, 0.071 * h)]
    for fx in (0.3, 0.5, 0.7):
        candidates.append((fx * surface.x_exit + 0.313 * h, 0.127 * h, 0.071 * h))
    inside = surface.nozzle.contains(np.array(candidates))
    for p, ok in zip(candidates, inside):
        if ok:
            return p
    raise MeshingError("no point on the axis lies inside the fluid volume; cannot seed the mesher")


def _snappy_dict(surface: DomainSurface, spec: UnstructuredSpec, location) -> dict:
    L = spec.wall_level
    regions = {name: {"name": name, "type": kind} for name, kind in surface.kinds.items()}
    # The whole nozzle at the wall level: a level change next to the snapped
    # wall leaves concave cells a pressure-based transonic solver cannot
    # survive (it drove p to its floor on the first iteration).
    refinement_regions = {"nozzle": {"mode": "inside", "levels": Raw(f"((1e15 {L}))")}}
    geometry = {
        "domain.stl": {"type": "triSurfaceMesh", "name": "domain",
                       "regions": {n: {"name": n} for n in surface.kinds}},
        "nozzle.stl": {"type": "triSurfaceMesh", "name": "nozzle"},
    }
    if surface.x_end > surface.x_exit:
        # The jet leaves through the exit, however far a side port reaches.
        re = max(surface.r_exit, spec.wall_cell)
        De = 2.0 * re
        for i, (length, radius, drop) in enumerate(((4 * De, 1.5 * re, 2), (10 * De, 3.0 * re, 3))):
            name = f"jet{i}"
            geometry[name] = {"type": "searchableCylinder",
                              "point1": Raw(f"({surface.x_exit!r} 0 0)"),
                              "point2": Raw(f"({min(surface.x_exit + length, surface.x_end)!r} 0 0)"),
                              "radius": radius}
            refinement_regions[name] = {"mode": "inside", "levels": Raw(f"((1e15 {max(L - drop, 0)}))")}
    castellated = {
        "maxLocalCells": 5000000, "maxGlobalCells": 40000000, "minRefinementCells": 0,
        "maxLoadUnbalance": 0.10, "nCellsBetweenLevels": 3,
        "features": Raw(f"(\n        {{ file \"domain.eMesh\"; level {L}; }}\n    )"),
        "refinementSurfaces": {"domain": {"level": Raw(f"({L} {L})"),
                                          "regions": {n: {"level": Raw(f"({L} {L})"), "patchInfo": {"type": k}}
                                                      for n, k in surface.kinds.items()}}},
        "resolveFeatureAngle": 30,
        "refinementRegions": refinement_regions,
        "locationInMesh": Raw("({!r} {!r} {!r})".format(*location)),
        "allowFreeStandingZoneFaces": "true",
    }
    snap = {"nSmoothPatch": 3, "tolerance": 2.0, "nSolveIter": 50, "nRelaxIter": 5,
            "nFeatureSnapIter": 10, "implicitFeatureSnap": "false", "explicitFeatureSnap": "true",
            "multiRegionFeatureSnap": "false"}
    walls = [n for n, k in surface.kinds.items() if k == "wall"]
    layers = {
        "relativeSizes": "false",
        "layers": {n: {"nSurfaceLayers": spec.layers} for n in walls} if spec.layers else {},
        "expansionRatio": LAYER_GROWTH,
        "firstLayerThickness": spec.first_layer or 1.0,
        "minThickness": 0.1 * (spec.first_layer or 1.0),
        "nGrow": 0, "featureAngle": 120, "slipFeatureAngle": 30, "nRelaxIter": 5,
        "nSmoothSurfaceNormals": 1, "nSmoothNormals": 3, "nSmoothThickness": 10,
        "maxFaceThicknessRatio": 0.5, "maxThicknessToMedialRatio": 0.3, "minMedialAxisAngle": 90,
        "nBufferCellsNoExtrude": 0, "nLayerIter": 50, "nRelaxedIter": 20,
    }
    quality = {
        "maxNonOrtho": 65, "maxBoundarySkewness": 20, "maxInternalSkewness": 4, "maxConcave": 80,
        "minVol": 1e-30, "minTetQuality": 1e-15, "minArea": -1, "minTwist": 0.02,
        "minDeterminant": 0.001, "minFaceWeight": 0.05, "minVolRatio": 0.01, "minTriangleTwist": -1,
        "nSmoothScale": 4, "errorReduction": 0.75, "relaxed": {"maxNonOrtho": 75},
    }
    return {
        "castellatedMesh": "true", "snap": "true", "addLayers": "true" if spec.layers else "false",
        "geometry": geometry, "castellatedMeshControls": castellated, "snapControls": snap,
        "addLayersControls": layers, "meshQualityControls": quality,
        "mergeTolerance": 1e-6,
    }


def _control(work: Path) -> None:
    write_dict(work / "system" / "controlDict", "controlDict", {
        "application": "snappyHexMesh", "startFrom": "startTime", "startTime": 0, "stopAt": "endTime",
        "endTime": 1, "deltaT": 1, "writeControl": "timeStep", "writeInterval": 1,
        "writeFormat": "ascii", "writePrecision": 15, "writeCompression": "off",
        "timeFormat": "general", "timePrecision": 6, "runTimeModifiable": "false"}, location="system")
    write_dict(work / "system" / "fvSchemes", "fvSchemes", {
        "ddtSchemes": {"default": "steadyState"}, "gradSchemes": {"default": "Gauss linear"},
        "divSchemes": {"default": "none"}, "laplacianSchemes": {"default": "Gauss linear corrected"},
        "interpolationSchemes": {"default": "linear"}, "snGradSchemes": {"default": "corrected"}},
        location="system")
    write_dict(work / "system" / "fvSolution", "fvSolution", {}, location="system")


def snappy(runner, work: Path, surface: DomainSurface, spec: UnstructuredSpec) -> tuple[PolyMesh, UnstructuredReport]:
    if work.exists():
        shutil.rmtree(work)
    tri = work / "constant" / "triSurface"
    write_stl(surface, tri / "domain.stl")
    surface.nozzle.export(str(tri / "nozzle.stl"))
    _control(work)
    write_dict(work / "system" / "blockMeshDict", "blockMeshDict", _block_mesh_dict(surface, spec),
               location="system")
    write_dict(work / "system" / "surfaceFeatureExtractDict", "surfaceFeatureExtractDict", {
        "domain.stl": {"extractionMethod": "extractFromSurface", "includedAngle": 150,
                       "subsetFeatures": {"nonManifoldEdges": "no", "openEdges": "yes"},
                       "writeObj": "no"}}, location="system")
    location = location_in_mesh(surface, spec)
    write_dict(work / "system" / "snappyHexMeshDict", "snappyHexMeshDict",
               _snappy_dict(surface, spec, location), location="system")
    for app in (["blockMesh"], ["surfaceFeatureExtract"], ["snappyHexMesh", "-overwrite"]):
        code = runner.run(app, work, work / f"log.{app[0]}")
        if code != 0:
            tail = (work / f"log.{app[0]}").read_text(encoding="utf-8", errors="replace").strip().splitlines()[-8:]
            raise MeshingError(f"{app[0]} failed:\n" + "\n".join(tail))
    mesh = polymesh_io.read(work)
    return mesh, UnstructuredReport("snappyHexMesh", mesh.n_cells, layers_requested=spec.layers)


def _nozzle_radius(surface: DomainSurface) -> float:
    """Largest distance of the nozzle's wall from the axis (the canonical
    frame's x axis)."""
    if surface.nozzle is None:
        return 0.0
    v = np.asarray(surface.nozzle.vertices)
    return float(np.hypot(v[:, 1], v[:, 2]).max())


def _throat_radius(surface: DomainSurface) -> float:
    sec = surface.nozzle.section(plane_origin=[surface.x_throat, 0, 0], plane_normal=[1, 0, 0])
    if sec is None:
        return 0.0
    planar, _ = sec.to_2D()
    return math.sqrt(sum(p.area for p in planar.polygons_full) / math.pi)


# --------------------------------------------------------------------------- zones and metadata


def plane_zone(mesh: PolyMesh, x: float) -> tuple[np.ndarray, np.ndarray]:
    """Internal faces between cells on either side of the plane at x: a
    closed cut through the duct, oriented along +x."""
    c = mesh.cell_centres
    own, nei = mesh.owner[: mesh.n_internal_faces], mesh.neighbour
    a, b = c[own, 0] < x, c[nei, 0] < x
    idx = np.nonzero(a != b)[0]
    _, normals = _face_geometry(mesh.points, mesh.faces[idx])
    return idx, normals[:, 0] < 0.0


def metadata(mesh: PolyMesh, surface: DomainSurface, profile: Profile, spec: UnstructuredSpec) -> MeshMeta:
    """Axial stations with the cells nearest the axis and one wall row (the
    wall faces closest to the +y meridian), as the post-processor expects."""
    c = mesh.cell_centres
    n_noz = 60
    xs = list(np.linspace(surface.x_inlet, surface.x_exit, n_noz + 1))
    if surface.x_end > surface.x_exit:
        xs += list(np.linspace(surface.x_exit, surface.x_end, 41)[1:])
    stations = np.array(xs)
    r = np.hypot(c[:, 1], c[:, 2])
    bins = np.clip(np.searchsorted(stations, c[:, 0]) - 1, 0, len(stations) - 2)
    centreline = []
    for i in range(len(stations) - 1):
        cells = np.nonzero(bins == i)[0]
        if not len(cells):
            centreline.append(centreline[-1] if centreline else [0])
            continue
        near = cells[np.argsort(r[cells])[:4]]
        centreline.append(near.tolist())
    wall_faces = np.concatenate([mesh.patch_faces(n) for n, k in surface.kinds.items()
                                 if k == "wall" and n != "lip"])
    fc, _ = _face_geometry(mesh.points, mesh.faces[wall_faces])
    angle = np.abs(np.arctan2(fc[:, 2], fc[:, 1]))
    wall_cells = []
    fbins = np.clip(np.searchsorted(stations, fc[:, 0]) - 1, 0, len(stations) - 2)
    for i in range(n_noz):
        sel = np.nonzero(fbins == i)[0]
        if len(sel):
            wall_cells.append(int(mesh.owner[wall_faces[sel[np.argmin(angle[sel])]]]))
        elif wall_cells:
            wall_cells.append(wall_cells[-1])
    return MeshMeta(stations=stations, throat_station=int(np.argmin(np.abs(stations - surface.x_throat))),
                    exit_station=n_noz, centreline_cells=centreline, wall_cells=wall_cells,
                    wall_first_cell_at_throat=spec.first_layer or spec.wall_cell,
                    form=Form.UNSTRUCTURED, patches=dict(surface.kinds))


def finish(mesh: PolyMesh, surface: DomainSurface) -> PolyMesh:
    """Face zones at the throat and (with a plume) the exit, and patch types
    from the domain (the mesher's own may say "patch" for a wall)."""
    mesh.face_zones = {"throat": plane_zone(mesh, surface.x_throat)}
    if surface.x_end > surface.x_exit:
        mesh.face_zones["exit"] = plane_zone(mesh, surface.x_exit)
    mesh.patches = [Patch(p.name, surface.kinds.get(p.name, p.kind)) for p in mesh.patches]
    return mesh


# --------------------------------------------------------------------------- cfMesh


THROAT_REFINEMENT = 0.5  # cfMesh cell size around the throat, in wall cells
THROAT_CORE = 0.8  # radius of the refined core, in throat radii


def _cfmesh_dict(surface: DomainSurface, spec: UnstructuredSpec) -> dict:
    h = spec.wall_cell
    # The whole nozzle at the wall size, as snappy has it: refined only
    # within a throat radius of the wall, the converging section's core was
    # coarse and mass flow read 0.7-0.9 % high (DESIGN.md finding 46).
    local = {"wall": {"cellSize": h, "refinementThickness": _nozzle_radius(surface) or 10 * h},
             "inlet": {"cellSize": 2 * h}}
    objects = {}
    r_t = _throat_radius(surface) or 10 * h
    # The transonic core at half the wall size: cfMesh's mass-flow error is
    # first order in the cell size there (DESIGN.md findings 46, 53). The
    # cone stays inside the wall (radius THROAT_CORE r_t), so the boundary
    # cells keep the wall size and the layers cut from them their intended
    # height; reaching the wall, it squeezed them to a fifth (finding 58).
    objects["throat"] = {"type": "cone", "cellSize": THROAT_REFINEMENT * h,
                         "p0": Raw(f"({surface.x_throat - 1.0 * r_t!r} 0 0)"),
                         "p1": Raw(f"({surface.x_throat + 0.5 * r_t!r} 0 0)"),
                         "radius0": THROAT_CORE * r_t, "radius1": THROAT_CORE * r_t}
    if surface.x_end > surface.x_exit:
        re = max(surface.r_exit, h)
        local["lip"] = {"cellSize": 4 * h}
        local["outlet"] = {"cellSize": spec.background / 2}
        for i, (length, radius, size) in enumerate(((8 * re, 1.5 * re, 2 * h), (20 * re, 3.0 * re, 8 * h))):
            objects[f"jet{i}"] = {"type": "cone", "cellSize": size,
                                  "p0": Raw(f"({surface.x_exit!r} 0 0)"),
                                  "p1": Raw(f"({min(surface.x_exit + length, surface.x_end)!r} 0 0)"),
                                  "radius0": radius, "radius1": radius}
    walls = [n for n, k in surface.kinds.items() if k == "wall"]
    layers = cfmesh_layers(spec)
    body = {
        "surfaceFile": '"domain.stl"', "maxCellSize": spec.background, "boundaryCellSize": 8 * h,
        "localRefinement": local,
        "renameBoundary": {"newPatchNames": {n: {"newName": n, "type": k} for n, k in surface.kinds.items()}},
    }
    if objects:
        body["objectRefinements"] = objects
    if layers:
        body["boundaryLayers"] = {
            "patchBoundaryLayers": {w: {"nLayers": layers, "thicknessRatio": LAYER_GROWTH,
                                        "maxFirstLayerThickness": spec.first_layer,
                                        "allowDiscontinuity": 0} for w in walls},
            "optimiseLayer": 1,
        }
    return body


def cfmesh_layers(spec: UnstructuredSpec, wall_cell: float | None = None) -> int:
    """Layers that fill half a wall cell (``wall_cell``, by default the
    spec's) at the growth rate from the first-cell height (cfMesh splits the
    boundary cell into them; asked to fill a whole one it made the first
    layer half the target)."""
    if not spec.first_layer:
        return 0
    g = LAYER_GROWTH
    h = wall_cell or spec.wall_cell
    n = math.ceil(math.log(1.0 + 0.5 * h * (g - 1.0) / spec.first_layer) / math.log(g))
    return int(min(max(n, 1), GMSH_MAX_LAYERS))


def cfmesh(runner, work: Path, surface: DomainSurface, spec: UnstructuredSpec) -> tuple[PolyMesh, UnstructuredReport]:
    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    write_stl(surface, work / "domain.stl")
    _control(work)
    write_dict(work / "system" / "meshDict", "meshDict", _cfmesh_dict(surface, spec), location="system")
    code = runner.run(["cartesianMesh"], work, work / "log.cartesianMesh")
    if code != 0:
        tail = (work / "log.cartesianMesh").read_text(encoding="utf-8", errors="replace").strip().splitlines()[-8:]
        raise MeshingError("cartesianMesh failed:\n" + "\n".join(tail))
    mesh = polymesh_io.read(work)
    report = UnstructuredReport("cfMesh", mesh.n_cells, layers_requested=cfmesh_layers(spec))
    return mesh, report


# --------------------------------------------------------------------------- coverage


def wall_coverage(mesh: PolyMesh, surface: DomainSurface, spec: UnstructuredSpec,
                  report: UnstructuredReport) -> None:
    """Layer coverage measured on the mesh: a wall face is covered when its
    cell is no taller (wall-normal, twice the centre's distance) than 1.5
    times the target first-cell height. Sets the report's coverage and
    first-cell statistics and rejects a mesh below the thresholds."""
    fc, fa = polymesh_io.face_centroids(mesh.points, mesh.faces)
    r_t = _throat_radius(surface)
    heights, near = [], []
    for name, kind in surface.kinds.items():
        if kind != "wall" or name == "lip" or name not in [p.name for p in mesh.patches]:
            continue
        f = mesh.patch_faces(name)
        n = fa[f] / np.linalg.norm(fa[f], axis=1)[:, None]
        h = 2.0 * np.abs(np.einsum("ij,ij->i", mesh.cell_centres[mesh.owner[f]] - fc[f], n))
        heights.append(h)
        near.append(np.abs(fc[f, 0] - surface.x_throat) < 2.0 * r_t)
    if not heights:
        report.accepted = False
        report.reasons.append("the mesh has no wall faces")
        return
    h, near = np.concatenate(heights), np.concatenate(near)
    covered = h <= 1.5 * spec.first_layer
    report.layer_coverage = float(covered.mean())
    report.throat_layer_coverage = float(covered[near].mean()) if near.any() else None
    report.notes.append(f"first cell on the wall: median {1e6 * float(np.median(h)):.3g} um, "
                        f"95th percentile {1e6 * float(np.quantile(h, 0.95)):.3g} um "
                        f"(target {1e6 * spec.first_layer:.3g} um)")
    if report.layer_coverage < LAYER_COVERAGE_MIN:
        report.accepted = False
        report.reasons.append(f"wall layers cover {100 * report.layer_coverage:.1f} % of the wall "
                              f"(needs {100 * LAYER_COVERAGE_MIN:.0f} %)")
    if report.throat_layer_coverage is not None and report.throat_layer_coverage < THROAT_COVERAGE_MIN:
        report.accepted = False
        report.reasons.append(f"wall layers are missing near the throat ({100 * report.throat_layer_coverage:.1f} % "
                              "of the faces within two throat radii carry one)")


# --------------------------------------------------------------------------- gmsh fallback


def gmsh(runner, work: Path, surface: DomainSurface, spec: UnstructuredSpec) -> tuple[PolyMesh, UnstructuredReport]:
    import json
    import subprocess
    import sys

    if work.exists():
        shutil.rmtree(work)
    work.mkdir(parents=True)
    write_stl(surface, work / "domain.stl", exit_plane=True)
    args = [sys.executable, "-m", "sonicline.mesh.gmsh_worker", str(work / "domain.stl"),
            str(work / "fluid.msh"), repr(spec.background / 4.0)]
    layers = gmsh_layers(spec)
    if layers:
        args += [repr(spec.first_layer), repr(LAYER_GROWTH), str(layers)]
    proc = subprocess.run(args, capture_output=True, text=True, timeout=3600)
    if proc.returncode != 0:
        tail = (proc.stderr or proc.stdout).strip().splitlines()[-5:]
        raise MeshingError("gmsh failed:\n" + "\n".join(tail))
    summary = json.loads(proc.stdout.strip().splitlines()[-1])
    _control(work)
    code = runner.run(["gmshToFoam", "fluid.msh"], work, work / "log.gmshToFoam")
    if code != 0:
        raise MeshingError("gmshToFoam failed")
    mesh = polymesh_io.read(work)
    report = UnstructuredReport("gmsh", mesh.n_cells, layers_requested=layers)
    kinds = ", ".join(f"{n} {k}s" for k, n in sorted(summary["by_type"].items()))
    report.notes.append(f"gmsh: {kinds}" + (f"; {layers} prism layers on every boundary" if layers else ""))
    return mesh, report


def gmsh_layers(spec: UnstructuredSpec) -> int:
    """Prism layers that fit in GMSH_LAYER_STACK of a wall cell at the
    growth rate, from the first-cell height; 0 for inviscid runs."""
    if not spec.first_layer:
        return 0
    stack = GMSH_LAYER_STACK * spec.wall_cell
    g = LAYER_GROWTH
    n = math.floor(math.log(1.0 + stack * (g - 1.0) / spec.first_layer) / math.log(g))
    return int(min(max(n, 1), GMSH_MAX_LAYERS))


# --------------------------------------------------------------------------- orchestration


def build(runner, work: Path, surface: DomainSurface, profile: Profile, spec: UnstructuredSpec,
          on_note=lambda text: None) -> tuple[PolyMesh, MeshMeta, UnstructuredReport]:
    """Mesh the domain: snappyHexMesh, then (``auto``) gmsh when snappy
    fails or its layers do not pass the coverage gate."""
    attempts: list[UnstructuredReport] = []
    automatic = ["cfmesh", "snappy", "gmsh"] if spec.layers else ["snappy", "cfmesh", "gmsh"]
    order = automatic if spec.mesher == "auto" else [spec.mesher]
    makers = {"snappy": snappy, "cfmesh": cfmesh, "gmsh": gmsh}
    for mesher in order:
        try:
            mesh, report = makers[mesher](runner, work / mesher, surface, spec)
            if spec.layers and report.accepted:
                wall_coverage(mesh, surface, spec, report)
        except MeshingError as e:
            report = UnstructuredReport(mesher, 0, accepted=False, reasons=[str(e)])
            attempts.append(report)
            on_note(f"{mesher}: {e}")
            continue
        attempts.append(report)
        if report.accepted:
            if len(attempts) > 1:
                report.notes += [f"{a.mesher} rejected: {'; '.join(a.reasons)}" for a in attempts[:-1]]
            mesh = finish(mesh, surface)
            return mesh, metadata(mesh, surface, profile, spec), report
        on_note(f"{mesher} mesh rejected: {'; '.join(report.reasons)}")
    raise MeshingError("no acceptable mesh: " + " | ".join(
        f"{a.mesher}: {'; '.join(a.reasons)}" for a in attempts))
