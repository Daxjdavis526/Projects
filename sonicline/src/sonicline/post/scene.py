"""Plain-data scenes for a viewport: points and polygons as numpy arrays,
no VTK. The Qt viewport renders them; a web client could too (DESIGN.md
section 3.7, "decoupling").
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from ..core.profile import Profile
from ..mesh.polymesh import PolyMesh


@dataclass
class Surface:
    name: str
    points: np.ndarray  # (N, 3)
    polygons: list[list[int]]  # point indices, triangles or quads
    role: str  # "wall", "inlet", "exit", "patch", ...


def nozzle(profile: Profile, n_theta: int = 72, n_per_segment: int = 24) -> list[Surface]:
    """The wall, and the inlet and exit planes, of a revolved nozzle (a
    planar nozzle's two walls, one unit of width deep)."""
    xr = np.array(profile.sample(n_per_segment))
    x, r = xr[:, 0], xr[:, 1]
    if profile.planar_width is not None:
        w = profile.planar_width
        pts, polys = [], []
        for sign in (1.0, -1.0):
            base = len(pts)
            for xi, ri in zip(x, r):
                pts += [(xi, sign * ri, -w / 2), (xi, sign * ri, w / 2)]
            polys += [[base + 2 * i, base + 2 * i + 2, base + 2 * i + 3, base + 2 * i + 1]
                      for i in range(len(x) - 1)]
        wall = Surface("wall", np.array(pts), polys, "wall")

        def plane(i, name):
            y = r[i]
            p = np.array([(x[i], -y, -w / 2), (x[i], y, -w / 2), (x[i], y, w / 2), (x[i], -y, w / 2)])
            return Surface(name, p, [[0, 1, 2, 3]], name)
        return [wall, plane(0, "inlet"), plane(-1, "exit")]

    th = np.linspace(0.0, 2.0 * np.pi, n_theta, endpoint=False)
    c, s = np.cos(th), np.sin(th)
    pts = np.array([(xi, ri * cj, ri * sj) for xi, ri in zip(x, r) for cj, sj in zip(c, s)])
    polys = []
    for i in range(len(x) - 1):
        for j in range(n_theta):
            a, b = i * n_theta + j, i * n_theta + (j + 1) % n_theta
            polys.append([a, b, b + n_theta, a + n_theta])

    def disc(i, name):
        centre = np.array([[x[i], 0.0, 0.0]])
        ring = np.array([(x[i], r[i] * cj, r[i] * sj) for cj, sj in zip(c, s)])
        tris = [[0, 1 + j, 1 + (j + 1) % n_theta] for j in range(n_theta)]
        return Surface(name, np.vstack([centre, ring]), tris, name)

    return [Surface("wall", pts, polys, "wall"), disc(0, "inlet"), disc(-1, "exit")]


def mesh_boundary(mesh: PolyMesh) -> list[Surface]:
    """Each boundary patch of a mesh as a surface of its own faces."""
    out = []
    for patch, start, size in zip(mesh.patches, mesh.patch_start, mesh.patch_size):
        faces = mesh.faces[start:start + size]
        used = np.unique(faces[faces >= 0])
        remap = -np.ones(len(mesh.points), dtype=int)
        remap[used] = np.arange(len(used))
        polys = [[int(remap[v]) for v in f if v >= 0] for f in faces]
        out.append(Surface(patch.name, mesh.points[used], polys, patch.kind))
    return out
