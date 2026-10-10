# ZR1 — a 1:15.3 C8 Corvette ZR1

A scale model of a **C8 Corvette ZR1 coupe** with everything ticked: 3LZ,
the **ZTK Performance Package** with the **TOM Carbon Fiber Aero** package
(tall wing, dive planes, tall hood Gurney), **SU1 visible carbon-fibre
wheels**, **Arctic White (G8G)** paint with the visible-carbon roof,
split-window spine and hatch inlets, **Blue calipers (J6B)**, a **Jet
Black** interior with **Tension Blue belts (3A9)**. Scaled so the wheelbase
is **7.0 in** (1:15.31): the model is about 12.2 in long.

Live viewer: https://daxjdavis526.github.io/Projects/zr1/

## Files

| file | what | open it with |
|---|---|---|
| `model/zr1.step` | STEP AP214 assembly, one coloured solid per part (faceted B-rep) | SolidWorks, Fusion, Onshape, FreeCAD, any CAD |
| `model/zr1.3mf` | 3MF, every part at full detail with its colour | SolidWorks (opens .3mf), Bambu/Prusa/Cura for multi-colour printing |
| `model/zr1.glb` | glTF binary with paint/carbon/glass materials | the viewer here, Blender, Windows 3D Viewer |

All three are in **millimetres at model scale**, z up, the origin on the
ground under the middle of the wheelbase, +x toward the rear. Every part
is a closed, outward-oriented, non-self-intersecting solid — each one passed
the Orbital Dawn kernel's mesh gate twice (as meshed and after
simplification) before it was written.

**About the STEP.** A car body is free-form, and this generator builds its
geometry as signed distance fields, not as NURBS patches, so the STEP holds
each part as a solid of many small flat faces (simplified to within
0.1 mm at model scale). SolidWorks imports it as solid bodies with their
colours; it is a reference/print model, not an editable feature tree. The
glass is opaque in the STEP (AP214 carries colour, not transparency) — set
it transparent in SolidWorks' appearance to see the interior.

## How it is made

Rust, in this directory, on the **Orbital Dawn Astronautics geometry
kernel** (`odawn-geo`): signed distance fields and their booleans, the
sparse bake, the surface-nets meshers, the mesh gate and the quadric
simplifier are the kernel's. The kernel lives in its own private
repository and is *referenced*, not copied — `Cargo.toml` points at
`../../Orbital-Dawn-Astronautics/crates/odawn-geo`. To rebuild, clone both
repositories side by side and:

```
cd zr1
cargo run --release                       # all 20 parts → model/zr1.{step,3mf,glb}, ~50 min on 4 cores
cargo run --release -- "=Body,Glass"      # rebuild some parts, reuse the rest from out/parts/
cargo run --release -- assemble           # re-write the three files from out/parts/ only
cargo run --release -- preview            # the body loft alone → out/preview.glb, seconds
ZR1_DETAIL=2 cargo run --release          # every voxel doubled: a quick draft (its own cache)
```

Every built part is cached in `out/parts/`; a cached part goes back
through the kernel's gate when it is read, so a stale or damaged cache
file is refused, never written into the model.

What this crate adds on top of the kernel (`src/`):

- `body.rs` — the body is a **loft** of cross-sections pinned to the traced
  silhouettes at every station (20 mm apart): each section is eight
  control points given as *fractions* of the local plan half-width and of
  the height between underbody and side-silhouette top, so the side and
  plan silhouettes are reproduced by construction and the fractions only
  shape what lies between (fender crowns, the greenhouse, tumblehome).
  Creases are points of high tension in a closed cardinal spline. The
  loft is gated by the kernel and becomes the kernel's exact `MeshField`.
- `car.rs` — every part as a field: the body less its wheel arches,
  window openings, recessed vents (hood extractor, hatch louvres, fender
  slots, side intakes, grilles) and the panels given to other parts;
  glass and carbon panels as layers of the body's own surface inside
  traced outlines; wheels, tyres, cross-drilled rotors and calipers as
  solids of revolution and rotational arrays; the wing as a lofted
  section on two uprights; the splitter, dive planes and hood Gurney.
- `fields.rs` — prisms (extruded outlines, exact), rigid placements,
  mirroring, and `OverSurface`: an expression over the body surface that
  reads the expensive mesh field once per point however many layers the
  part uses.
- `interior.rs` — seats, dash, console, squircle wheel, belts.
- `export.rs` — STEP (AP214, coloured assembly), 3MF and GLB writers.
- `tools/overlay.py` — overlays the body on a reference drawing;
  `tools/step_check.py` — reads the STEP back through OpenCASCADE and
  checks every solid; `tools/shots.mjs` — headless screenshots.

### Two kernel bugs found on the way

Building a car exercised the kernel in ways a rocket engine had not, and
its own checks caught two real defects; both are fixed, with tests, on the
Orbital Dawn branch `claude/meshfield-unit-pseudonormals` (this crate needs
that branch until it is merged):

1. **`MeshField` signs** — pseudonormals were summed from area-weighted
   face normals; the Bærentzen–Aanæs guarantee needs unit normals. On a
   mesh whose triangle areas differ by orders of magnitude (the wing's
   fan-capped tips beside thin leading-edge strips) points 60 mm outside
   read as inside. Caught by the sparse bake's debug Lipschitz audit.
2. **`RotationalArray` fold** — sectors were counted from the datum
   direction, not from the element, so an element sitting off the datum
   (the wheel's spokes) lost its nearest copy and the field stepped by
   119 mm across sector boundaries. Caught by the same audit.

## What is accurate, and what is not

Honest accounting, in the house style.

**From GM's own data (accurate):** wheelbase 2723 mm, width 2025 mm,
height 1234 mm, tracks 1685 / 1678 mm (2025–26 fleet order guide); tyres
275/30ZR20 and 345/25ZR21 on 20×10 and 21×13 wheels; carbon-ceramic rotors
400×38 front and 390×34 rear (ZR1 reveal release); option content, codes
and colour names. Tyre overall diameters (26.5 / 27.8 in) are retailer
figures.

**Traced (good to roughly ±20 mm full size, ±1.5 mm on the model):** the
side and plan silhouettes, nose and tail profiles, and the outlines of the
glass, carbon roof, hatch, vents, intakes, lamps and wing — from a published
four-view drawing of the 2025 ZR1 with the ZTK wing, each view
re-calibrated to GM's numbers (the drawing's own height is 1.2 % off). The
drawing is a commercial product and is not included here; only the traced
curves are.

**Approximated (by eye, from GM's photos and Chevrolet's configurator
renders of this exact build):** the shape of every cross-section between
the silhouettes — crowns, creases, the dish of the hood, the scoop of the
doors; the wing's section (a NACA-style 12 % section; GM publishes no
profile); the interior (no interior dimensions are published — seats,
dash and wheel are placed to fit the cabin and the photos); caliper
shape; spoke shape. Colours are close matches, not paint codes — GM
publishes none.

**Left out:** badges and lettering, door handles and shut lines, the
louvre slats of the hatch inlets, the grille mesh pattern, the cross-
drilling of the rotors, the engine under the glass, wipers.

**Model year.** For 2026 the ZTK package brings Alcon calipers (10-piston
front, 6-piston rear) on 16.5 in rotors; this model has the 2025 brakes
(6/4-piston on 400/390 mm). Tension Blue belts were renamed Santorini Blue
for 2026.
