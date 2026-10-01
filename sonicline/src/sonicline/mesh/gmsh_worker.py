"""gmsh prism-and-tetrahedron mesher, run as a child process (a kernel crash must not
take the run with it):

    python -m sonicline.mesh.gmsh_worker <domain.stl> <out.msh> <max_size> [<first> <growth> <layers>]

The domain STL holds one solid per patch; they become the physical
surfaces gmshToFoam turns into patches. The surface triangulation is kept
as given. With ``layers`` > 0 the nozzle's closed boundary is extruded
inwards into prism layers (first height ``first``, each ``growth`` times
the last); the core is filled with tetrahedra whose size grows from the
boundary's towards ``max_size``.

With a plume the STL also holds "exitplane", the nozzle's exit disk. The
nozzle (inlet, wall, exit disk) and the plume (exit disk, lip, ambient,
outlet) are then two volumes sharing that disk: only the nozzle gets
layers, since extruded over the plume's large boundaries they multiply the
cell count and degenerate. The disk is internal, not a patch. Writes MSH 2.2 ASCII (what gmshToFoam reads) and
prints a JSON summary.
"""

from __future__ import annotations

import json
import sys


def mesh(stl: str, out: str, max_size: float, first: float = 0.0, growth: float = 1.2,
         layers: int = 0) -> dict:
    import gmsh

    gmsh.initialize(["-noenv"], readConfigFiles=False)
    gmsh.option.setNumber("General.Terminal", 0)
    gmsh.option.setNumber("General.Verbosity", 2)
    gmsh.merge(stl)
    gmsh.model.mesh.removeDuplicateNodes()
    gmsh.model.mesh.createTopology()
    surfaces = [t for _, t in gmsh.model.getEntities(2)]
    names = {t: gmsh.model.getEntityName(2, t) or f"surface{t}" for t in surfaces}
    nozzle_names = {"inlet", "wall", "exitplane"} if "exitplane" in names.values() else None
    shell = [t for t in surfaces if nozzle_names is None or names[t] in nozzle_names]
    plume = [t for t in surfaces if nozzle_names is not None and names[t] not in nozzle_names]
    volumes = []
    inner = shell
    if layers > 0:
        # Prisms on every boundary (a closed shell; the inlet and outlet
        # get thin cells too, which cost nothing), extruded against the
        # outward normals.
        heights, h, total = [], first, 0.0
        for _ in range(layers):
            total += h
            heights.append(-total)
            h *= growth
        gmsh.option.setNumber("Geometry.ExtrudeReturnLateralEntities", 0)
        out_tags = gmsh.model.geo.extrudeBoundaryLayer([(2, t) for t in shell], [1] * layers, heights, True)
        inner = [out_tags[i - 1][1] for i in range(1, len(out_tags)) if out_tags[i][0] == 3]
        volumes = [t for d, t in out_tags if d == 3]
        gmsh.model.geo.synchronize()
    loop = gmsh.model.geo.addSurfaceLoop(inner)
    volume = gmsh.model.geo.addVolume([loop])
    if plume:
        disk = [t for t in surfaces if names[t] == "exitplane"]
        volumes.append(gmsh.model.geo.addVolume([gmsh.model.geo.addSurfaceLoop(disk + plume)]))
    gmsh.model.geo.synchronize()
    for name in sorted(set(names.values()) - {"exitplane"}):
        tags = [t for t, n in names.items() if n == name]
        gmsh.model.setPhysicalName(2, gmsh.model.addPhysicalGroup(2, tags), name)
    gmsh.model.setPhysicalName(3, gmsh.model.addPhysicalGroup(3, [volume] + volumes), "fluid")
    gmsh.option.setNumber("Mesh.MeshSizeMax", max_size)
    gmsh.option.setNumber("Mesh.MeshSizeExtendFromBoundary", 1)
    gmsh.option.setNumber("Mesh.Algorithm3D", 1)  # Delaunay
    gmsh.option.setNumber("Mesh.Optimize", 1)
    gmsh.model.mesh.generate(3)
    types, tags, _ = gmsh.model.mesh.getElements(3)
    counts = {gmsh.model.mesh.getElementProperties(t)[0].split()[0].lower(): len(g) for t, g in zip(types, tags)}
    n = sum(counts.values())
    gmsh.option.setNumber("Mesh.MshFileVersion", 2.2)
    gmsh.option.setNumber("Mesh.Binary", 0)
    gmsh.write(out)
    gmsh.finalize()
    return {"ok": True, "cells": n, "by_type": counts, "patches": sorted(set(names.values()))}


if __name__ == "__main__":
    extra = [float(sys.argv[4]), float(sys.argv[5]), int(sys.argv[6])] if len(sys.argv) > 6 else []
    print(json.dumps(mesh(sys.argv[1], sys.argv[2], float(sys.argv[3]), *extra)))
