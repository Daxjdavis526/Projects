"""Structured meshes of axisymmetric nozzles, with an optional plume region.

Topology
--------
A 2D cross-section *template* is swept along axial stations x_0..x_N:

- ``wedge``: a thin sector (one cell circumferentially) straddling the
  x-y plane. Cells on the axis collapse to prisms, so there is no axis
  patch and no singular face.
- ``o_grid``: a butterfly disk -- a square core surrounded by four blocks
  whose rays run from the core to the wall. There is no axis singularity.
  The wall is a polygon scaled so every cross-section has the exact area of
  the circle it represents.

Radial positions are fractions of the local wall radius, so every station
is a scaled copy of the same template and the wall points lie exactly on
the surface of revolution. The first cell next to the wall has a fixed
fraction of the *throat* radius at the throat and scales with the local
radius elsewhere (larger in the chamber, where the flow is slow).

Downstream of the exit the disk keeps the exit radius, and an annulus
out to the plume radius surrounds it. The exit-plane annulus is the lip
patch; the outer cylinder is the ambient patch; the far end is the
outlet. The throat and exit planes are exact stations and carry face zones
so mass flow and thrust can be integrated on them.

The wall clustering of the nozzle carries into the jet shear layer at the
lip and relaxes downstream over a few exit diameters, which keeps cell
aspect ratios in the plume sane.
"""

from __future__ import annotations

import enum
import math
from dataclasses import dataclass, field

import numpy as np

from ..core.profile import Profile
from . import distribution as dist
from .polymesh import Patch, PolyMesh, assemble


class Form(enum.Enum):
    WEDGE = "wedge"
    O_GRID = "o_grid"


@dataclass(frozen=True)
class Resolution:
    """Mesh density, in multiples of the throat radius Rt."""

    throat_spacing: float  # axial spacing at the throat / Rt
    core_cells: int  # cells across the core side (O-grid); wedge core gets half
    ring_growth: float  # maximum cell-to-cell growth in the wall-normal direction
    plume_far_spacing: float  # axial spacing at the plume outlet / exit radius

    @staticmethod
    def preset(name: str) -> "Resolution":
        return {
            "coarse": Resolution(0.10, 8, 1.25, 1.0),
            "standard": Resolution(0.05, 12, 1.20, 0.6),
            "fine": Resolution(0.025, 16, 1.15, 0.4),
        }[name]


@dataclass(frozen=True)
class PlumeRegion:
    length: float  # m, downstream of the exit plane
    radius: float  # m
    lip_is_wall: bool = False


@dataclass(frozen=True)
class RevolvedMeshSpec:
    form: Form
    resolution: Resolution
    wall_first_cell: float | None  # m at the throat; None for inviscid (slip) walls
    wedge_angle: float = math.radians(5.0)
    plume: PlumeRegion | None = None


@dataclass
class MeshMeta:
    """Structure the post-processor needs without re-deriving it."""

    stations: np.ndarray  # axial station positions
    throat_station: int
    exit_station: int
    centreline_cells: list[list[int]]  # per axial interval, cells on the axis
    wall_cells: list[int]  # per nozzle interval, one wall-adjacent cell
    wall_first_cell_at_throat: float
    form: Form
    patches: dict[str, str] = field(default_factory=dict)

    def to_json(self) -> dict:
        return {
            "stations": self.stations.tolist(),
            "throat_station": self.throat_station,
            "exit_station": self.exit_station,
            "centreline_cells": self.centreline_cells,
            "wall_cells": self.wall_cells,
            "wall_first_cell_at_throat": self.wall_first_cell_at_throat,
            "form": self.form.value,
            "patches": self.patches,
        }


# First-cell size (fraction of the local radius) the jet relaxes to downstream
# of the lip, and the distance scale of that relaxation (exit radii).
_JET_FIRST_CELL = 0.02
# First-cell size outside the jet, in the annulus far from the lip (fraction of
# the exit radius): comparable to the circumferential spacing there.
_AMBIENT_FIRST_CELL = 0.1
# First annulus cell at the lip, and the (longer) distance over which the
# annulus relaxes: its levels move further than the jet's, so they must move
# more slowly to keep faces orthogonal.
_LIP_FIRST_CELL = 0.002
_ANNULUS_RELAXATION = 20.0
_LIP_RELAXATION = 2.0
# Depth (fraction of the local radius) over which grid lines are bent to meet
# the wall at right angles.
_ORTHOGONAL_DEPTH = 0.3
_JET_GROWTH = 1.15


def _lip_weight(distance: float, exit_radius: float, scale: float = None) -> float:
    """1 at the exit plane (wall clustering), tending to 0 downstream."""
    return math.exp(-distance / ((scale or _LIP_RELAXATION) * exit_radius))


# Edge tags inside a cross-section template.
_DISK_EDGE, _ANN_OUTER, _FRONT, _BACK = 1, 2, 3, 4
# Quad edge (a, b) -> local hex face when the quad is swept along x with
# vertices 0-3 at station i and 4-7 at station i+1.
_EDGE_TO_FACE = {0: 2, 1: 1, 2: 3, 3: 0}  # edge k joins quad vertices k and k+1


@dataclass
class _Template:
    points: np.ndarray  # (Nd, 2) disk points in the unit disk
    quads: np.ndarray  # (Qd, 4) disk quads
    edge_tags: np.ndarray  # (Qd, 4)
    boundary_ring: np.ndarray  # disk point ids on the unit circle, one per annulus ray
    ann_dirs: np.ndarray  # (Na_rays, 2) unit directions of annulus rays
    ann_quads_template: list  # built later once the annulus count is known
    centre_quads: list[int]
    wall_quad: int
    ann_periodic: bool  # O-grid annulus wraps around; wedge annulus does not


def _ray_fractions(length: float, first: float | None, n: int) -> np.ndarray:
    """Fractions 0..1 along a ray of ``length`` (unit-disk units) with the
    wall at 1."""
    if first is None:
        return np.linspace(0.0, 1.0, n + 1)
    return dist.wall_clustered(length, first, n) / length


def _wedge_template(res: Resolution, first_n: float | None, half: float,
                    n_ring: int | None = None) -> tuple[_Template, int]:
    eta_c = 0.5
    # Twice the O-grid's radial count across the core: 2D cells cost little,
    # and at equal counts the wedge was the less accurate of the two.
    n_core = max(2, res.core_cells)
    core_h = eta_c / n_core
    if n_ring is None:
        n_ring = (max(2, round((1.0 - eta_c) / core_h)) if first_n is None else
                  dist.cells_for_wall_clustering(1.0 - eta_c, first_n, res.ring_growth, core_h))
    ring = eta_c + (1.0 - eta_c) * _ray_fractions(1.0 - eta_c, first_n, n_ring)
    eta = np.concatenate([np.linspace(0.0, eta_c, n_core + 1), ring[1:]])
    n = len(eta)
    c, s = math.cos(half), math.sin(half)
    front = np.column_stack([eta * c, -eta * s])
    back = np.column_stack([eta[1:] * c, eta[1:] * s])
    pts = np.vstack([front, back])  # front 0..n-1, back n..2n-2 (axis shared)
    fid = np.arange(n)
    bid = np.concatenate([[0], np.arange(n, 2 * n - 1)])
    quads, tags = [], []
    for j in range(n - 1):
        quads.append([fid[j], fid[j + 1], bid[j + 1], bid[j]])
        tags.append([_FRONT, _DISK_EDGE if j == n - 2 else 0, _BACK, 0])
    tmpl = _Template(pts, np.array(quads), np.array(tags), np.array([fid[-1], bid[-1]]),
                     np.array([[c, -s], [c, s]]), [], [0], n - 2, ann_periodic=False)
    return tmpl, n_ring


def _ogrid_template(res: Resolution, first_n: float | None,
                    n_ring: int | None = None) -> tuple[_Template, int]:
    nc = res.core_cells + res.core_cells % 2  # even, so the axis is a grid point
    a = 0.4
    g = np.linspace(-a, a, nc + 1)
    gid = np.arange((nc + 1) ** 2).reshape(nc + 1, nc + 1)  # gid[i, j]: y = g[i], z = g[j]
    core = np.array([[g[i], g[j]] for i in range(nc + 1) for j in range(nc + 1)])
    # Square perimeter, anticlockwise from the corner (a, -a).
    perim = ([gid[nc, j] for j in range(nc)] + [gid[i, nc] for i in range(nc, 0, -1)]
             + [gid[0, j] for j in range(nc, 0, -1)] + [gid[i, 0] for i in range(nc)])
    n_rays = len(perim)
    angles = -math.pi / 4 + np.arange(n_rays) * 2 * math.pi / n_rays
    circle = np.column_stack([np.cos(angles), np.sin(angles)])
    starts = core[perim]
    lengths = np.linalg.norm(circle - starts, axis=1)
    core_h = 2 * a / nc
    if n_ring is None:
        n_ring = (max(2, round(lengths.max() / core_h)) if first_n is None else
                  dist.cells_for_wall_clustering(lengths.max(), first_n, res.ring_growth, core_h))
    ring_pts = []
    for k in range(n_rays):
        t = _ray_fractions(lengths[k], first_n, n_ring)[1:]
        straight = starts[k] + t[:, None] * (circle[k] - starts[k])
        # Bend the outer part of each ray onto the radial line through its
        # wall point, so near-wall cells meet the wall at right angles.
        radial = np.linalg.norm(straight, axis=1)[:, None] * circle[k]
        s = (t**4)[:, None]
        ring_pts.append((1 - s) * straight + s * radial)
    ring = np.vstack(ring_pts)  # ray k, level m (1..n_ring) at index k*n_ring + m-1
    base = len(core)

    def rid(k: int, m: int) -> int:
        k %= n_rays
        return perim[k] if m == 0 else base + k * n_ring + (m - 1)

    quads, tags = [], []
    for i in range(nc):
        for j in range(nc):
            quads.append([gid[i, j], gid[i + 1, j], gid[i + 1, j + 1], gid[i, j + 1]])
            tags.append([0, 0, 0, 0])
    h = nc // 2
    centre = [(h - 1) * nc + (h - 1), (h - 1) * nc + h, h * nc + (h - 1), h * nc + h]
    wall_quad = None
    for k in range(n_rays):
        for m in range(n_ring):
            quads.append([rid(k, m), rid(k + 1, m), rid(k + 1, m + 1), rid(k, m + 1)])
            tags.append([0, 0, _DISK_EDGE if m == n_ring - 1 else 0, 0])
            if k == n_rays // 8 and m == n_ring - 1:  # the ray at angle 0
                wall_quad = len(quads) - 1
    # The wall is a regular polygon of n_rays facets inscribed in the circle,
    # which would lose (1 - n sin(2 pi/n) / 2 pi) of every cross-section's
    # area: 0.29 % at 48 facets, and choked mass flow with it. Scaling the
    # template by the inverse square root makes every cross-section's area
    # exact; the wall vertices then sit that fraction (0.14 %) outside the
    # surface and the facet midpoints just inside it.
    f = 1.0 / math.sqrt(n_rays / (2 * math.pi) * math.sin(2 * math.pi / n_rays))
    tmpl = _Template(f * np.vstack([core, ring]), np.array(quads), np.array(tags),
                     np.array([rid(k, n_ring) for k in range(n_rays)]), f * circle, [],
                     centre, wall_quad, ann_periodic=True)
    return tmpl, n_ring


def _stations(profile: Profile, res: Resolution, plume: PlumeRegion | None):
    Rt = profile.throat_radius
    h_t = res.throat_spacing * Rt
    xs = [profile.x_inlet]
    x_t, x_e = profile.throat_x, profile.x_exit
    up = dist.geometric(x_t - profile.x_inlet, 4.0 * h_t, h_t) + profile.x_inlet
    xs = list(up)
    throat = len(xs) - 1
    if x_e > x_t + 1e-12 * Rt:
        down = dist.geometric(x_e - x_t, h_t, 2.0 * h_t) + x_t
        xs += list(down[1:])
    exit_ = len(xs) - 1
    if plume is not None:
        h_e = xs[-1] - xs[-2]
        far = res.plume_far_spacing * profile.exit_radius
        n = max(4, math.ceil(math.log(max(far / h_e, 1.0 + 1e-9)) / math.log(1.08)) + 1)
        seg = dist.geometric(plume.length, h_e, far)
        if len(seg) - 1 < n:
            seg = dist.geometric(plume.length, h_e, far, n)
        xs += list(seg[1:] + x_e)
    return np.array(xs), throat, exit_


def build(profile: Profile, spec: RevolvedMeshSpec) -> tuple[PolyMesh, MeshMeta]:
    res = spec.resolution
    Rt = profile.throat_radius
    first_n = None if spec.wall_first_cell is None else spec.wall_first_cell / Rt
    if spec.form is Form.WEDGE:
        make = lambda f, n=None: _wedge_template(res, f, spec.wedge_angle / 2, n)  # noqa: E731
    else:
        make = lambda f, n=None: _ogrid_template(res, f, n)  # noqa: E731
    tmpl, n_ring = make(first_n)
    # The same topology with gentle clustering, blended in downstream of the lip.
    relaxed_first = None if first_n is None else max(first_n, _LIP_FIRST_CELL)
    relaxed_points = make(relaxed_first, n_ring)[0].points
    xs, i_t, i_e = _stations(profile, res, spec.plume)
    plume = spec.plume
    Re = profile.exit_radius
    n_st = len(xs)
    Nd, Qd = len(tmpl.points), len(tmpl.quads)

    # ---- points: disk at every station --------------------------------------
    scale = np.array([profile.radius(min(x, profile.x_exit)) for x in xs])
    pts = np.empty((n_st * Nd, 3))
    for i, x in enumerate(xs):
        blk = slice(i * Nd, (i + 1) * Nd)
        pts[blk, 0] = x
        pts[blk, 1:] = tmpl.points * scale[i]
    # Bend the station lines near the wall so they meet it at right angles.
    # On a 45 degree converging cone vertical station lines cut the wall at
    # 45 degrees, and the thin wall-resolved cells become sheared
    # parallelograms (in the 20 bar case their temperature overshot the
    # stagnation value by 5 %). A point a distance d inside the wall moves
    # axially by d R'(x) (1 - d/delta)^2: along the wall normal at the wall,
    # blending back to the vertical line by delta = 10 % of the local radius.
    # R' = 0 at the inlet and the throat, and the shift is tapered to zero at
    # the exit, so those planes stay exactly planar.
    if spec.wall_first_cell is not None:
        r_template = np.linalg.norm(tmpl.points, axis=1)
        r_wall = r_template.max()  # 1 for the wedge, the area factor for the O-grid
        for i in range(1, i_e):
            slope = profile.slope(xs[i])
            if slope == 0.0:
                continue
            taper = min(1.0, (xs[i_e] - xs[i]) / Rt)
            d = (r_wall - r_template) * scale[i]  # distance inside the wall
            delta = _ORTHOGONAL_DEPTH * scale[i]
            w = np.clip(1.0 - d / delta, 0.0, None) ** 2
            pts[i * Nd : (i + 1) * Nd, 0] += d * slope * w * taper

    # Relax the wall clustering in the jet downstream of the lip. A cell of
    # thickness h that thickens by a fraction g over an axial step dx becomes a
    # trapezoid whose centroid slides about g*dx/12 downstream; against its
    # radial neighbour h away that tilts the face by atan(g*dx/(12 h)). So the
    # outermost jet cell may grow per station by at most min(_JET_GROWTH - 1,
    # 10 h/dx), which bounds the tilt near 40 degrees. On a coarse axial mesh
    # this keeps the thin wall layer nearly unchanged through the plume:
    # high aspect ratio, but orthogonal.
    if plume is not None and relaxed_first is not None:
        t_wall, t_rel = first_n, relaxed_first
        t = t_wall
        for i in range(i_e + 1, n_st):
            dx = xs[i] - xs[i - 1]
            t = min(t * (1.0 + min(_JET_GROWTH - 1.0, 10.0 * t * Re / dx)), t_rel)
            w = (t_rel - t) / (t_rel - t_wall) if t_rel > t_wall else 0.0
            pts[i * Nd : (i + 1) * Nd, 1:] = (w * tmpl.points + (1 - w) * relaxed_points) * scale[i]

    # ---- annulus points (plume stations only) --------------------------------
    n_ann = 0
    ann_base = len(pts)
    if plume is not None:
        n_rays = len(tmpl.ann_dirs)
        L = plume.radius - Re
        # The free shear layer leaving the lip does not need the nozzle's
        # wall-resolved first cell; a few microns resolves it.
        lip_first = max(first_n or _JET_FIRST_CELL, _LIP_FIRST_CELL) * Re
        far_first = max(lip_first, _AMBIENT_FIRST_CELL * Re)
        cap = L / 6.0
        n_ann = dist.cells_for_wall_clustering(L, lip_first, res.ring_growth, cap)
        d_lip = dist.capped_from_wall(L, lip_first, res.ring_growth, cap, n_ann)
        d_far = dist.capped_from_wall(L, far_first, res.ring_growth, cap, n_ann)
        ann = []
        for i in range(i_e, n_st):
            w = _lip_weight(xs[i] - xs[i_e], Re, _ANNULUS_RELAXATION)
            # Blend positions, not spacings: re-solving the distribution for a
            # new first cell at every station would move every level at once.
            d = w * d_lip + (1 - w) * d_far  # 0 at Re, clustered there
            r = Re + d[1:]
            for k in range(n_rays):
                for rr in r:
                    ann.append([xs[i], *(tmpl.ann_dirs[k] * rr)])
        pts = np.vstack([pts, np.array(ann)])

    def disk_id(i, k):
        return i * Nd + k

    def ann_id(i, k, level):
        """Annulus point on ray k at level (0 = disk boundary)."""
        if level == 0:
            return disk_id(i, tmpl.boundary_ring[k])
        return ann_base + ((i - i_e) * len(tmpl.ann_dirs) + k) * n_ann + level - 1

    # Annulus quads (per station pair, same connectivity).
    ann_quads, ann_tags = [], []
    if plume is not None:
        n_rays = len(tmpl.ann_dirs)
        ray_pairs = [(k, (k + 1) % n_rays) for k in range(n_rays)] if tmpl.ann_periodic else [(0, 1)]
        for ka, kb in ray_pairs:
            for lv in range(n_ann):
                ann_quads.append((ka, kb, lv))
                if tmpl.ann_periodic:
                    ann_tags.append([0, 0, _ANN_OUTER if lv == n_ann - 1 else 0, 0])
                else:  # wedge: quad (front_l, back_l, back_l+1, front_l+1)
                    ann_tags.append([0, _BACK, _ANN_OUTER if lv == n_ann - 1 else 0, _FRONT])

    # ---- patches -------------------------------------------------------------
    names = ["inlet", "wall", "outlet"]
    kinds = ["patch", "wall", "patch"]
    if plume is not None:
        names += ["lip", "ambient"]
        kinds += ["wall" if plume.lip_is_wall else "patch", "patch"]
    if spec.form is Form.WEDGE:
        names += ["front", "back"]
        kinds += ["wedge", "wedge"]
    P = {n: i for i, n in enumerate(names)}
    patches = [Patch(n, k) for n, k in zip(names, kinds)]
    has_throat_zone = i_t < i_e
    zone_names = (["throat"] if has_throat_zone else []) + (["exit"] if plume is not None else [])
    Z = {n: i for i, n in enumerate(zone_names)}

    cells, fpatch, fzone = [], [], []

    def add_cell(bottom, top, edge_tags, interval, disk: bool):
        fp = [-1] * 6
        fz = [-1] * 6
        for e, tag in enumerate(edge_tags):
            f = _EDGE_TO_FACE[e]
            if tag == _FRONT:
                fp[f] = P["front"]
            elif tag == _BACK:
                fp[f] = P["back"]
            elif tag == _ANN_OUTER:
                fp[f] = P["ambient"]
            elif tag == _DISK_EDGE and interval < i_e:
                fp[f] = P["wall"]
        if interval == 0:
            fp[4] = P["inlet"]
        if has_throat_zone and interval == i_t - 1 and disk:
            fz[5] = Z["throat"]
        if interval == i_e - 1 and disk:
            if plume is None:
                fp[5] = P["outlet"]
            else:
                fz[5] = Z["exit"]
        if plume is not None and interval == i_e and not disk:
            fp[4] = P["lip"]
        if interval == n_st - 2 and interval >= i_e:
            fp[5] = P["outlet"]
        cells.append(list(bottom) + list(top))
        fpatch.append(fp)
        fzone.append(fz)

    centreline: list[list[int]] = []
    wall_cells: list[int] = []
    for i in range(n_st - 1):
        first_cell = len(cells)
        for q in range(Qd):
            quad = tmpl.quads[q]
            add_cell([disk_id(i, v) for v in quad], [disk_id(i + 1, v) for v in quad],
                     tmpl.edge_tags[q], i, True)
        centreline.append([first_cell + q for q in tmpl.centre_quads])
        if i < i_e:
            wall_cells.append(first_cell + tmpl.wall_quad)
        if plume is not None and i >= i_e:
            for (ka, kb, lv), tags in zip(ann_quads, ann_tags):
                b = [ann_id(i, ka, lv), ann_id(i, kb, lv), ann_id(i, kb, lv + 1), ann_id(i, ka, lv + 1)]
                t = [ann_id(i + 1, ka, lv), ann_id(i + 1, kb, lv), ann_id(i + 1, kb, lv + 1),
                     ann_id(i + 1, ka, lv + 1)]
                add_cell(b, t, tags, i, False)

    mesh = assemble(pts, np.array(cells), np.array(fpatch), patches, np.array(fzone), zone_names)
    meta = MeshMeta(xs, i_t, i_e, centreline, wall_cells,
                    spec.wall_first_cell if spec.wall_first_cell is not None else float("nan"),
                    spec.form, {p.name: p.kind for p in patches})
    return mesh, meta
