"""Build nozzle-side-port.step: the 2 mm example nozzle with a closed
pressure-tap port (1.2 mm bore, 4.5 mm from the axis) on its chamber. It is
not a body of revolution, so SONICLINE meshes it with the unstructured
(Tier 2) mesher. Run from this directory: python make_side_port.py"""

import gmsh

gmsh.initialize(["-noenv"], readConfigFiles=False)
gmsh.option.setNumber("General.Terminal", 0)
gmsh.option.setString("Geometry.OCCTargetUnit", "MM")
occ = gmsh.model.occ
nozzle = occ.importShapes("nozzle-2mm.step")
# The inlet face is at x = -5.035 mm, the chamber (radius 3 mm) runs to about x = -3.4 mm.
port = occ.addCylinder(-4.2, 0.0, 0.0, 0.0, 4.5, 0.0, 0.6)
occ.fuse(nozzle, [(3, port)])
occ.synchronize()
gmsh.write("nozzle-side-port.step")
gmsh.finalize()
