# ZR1 — a 1:15.3 C8 Corvette ZR1

A scale model of a **C8 Corvette ZR1 coupe** with everything ticked: 3LZ,
the **ZTK Performance Package** with the **TOM Carbon Fiber Aero** package
(tall wing, dive planes, splitter, hood Gurney), the **20-spoke forged
wheels in Carbon Flash (SOG)**, **Arctic White (G8G)** with the
visible-carbon roof, **Blue calipers (J6B)**, a **Jet Black** interior with
blue belts (3A9). Scaled so the wheelbase is **7.0 in** (1:15.31): the model
is about 12.2 in long.

This is the second model. The first was traced from a four-view drawing and
shaped by eye between the outlines; this one is **measured**: every surface
comes from Chevrolet's own renders of this exact build, through calibrated
cameras, and the build checks itself against them.

Live viewer: https://daxjdavis526.github.io/Projects/zr1/

## Files

| file | what | open it with |
|---|---|---|
| `model/zr1.step` | STEP AP214 assembly, one coloured solid per part (faceted B-rep) | SolidWorks, Fusion, Onshape, FreeCAD, any CAD |
| `model/zr1.3mf` | 3MF, every part at full detail with its colour | SolidWorks (opens .3mf), Bambu/Prusa/Cura for multi-colour printing |
| `model/zr1.glb` | glTF binary with paint/carbon/glass materials | the viewer here, Blender, Windows 3D Viewer |

All three are in **millimetres at model scale**, z up, the origin on the
ground under the middle of the wheelbase, +x toward the rear. Every part is
a closed, outward-oriented, non-self-intersecting solid that passed the
Orbital Dawn kernel's mesh gate twice (as meshed and after simplification)
before it was written.

**About the STEP.** The geometry is built as signed distance fields, not
NURBS patches, so the STEP holds each part as a solid of many small flat
faces. SolidWorks imports it as coloured solid bodies — a reference and
print model, not an editable feature tree. Glass is opaque in the STEP
(AP214 carries colour, not transparency).

## How it is measured — `tools/measure/`

**References.** Chevrolet's configurator renders this exact option set
(G8G, ZTK, TOM, SOG, J6B, 3A9, HTE) from eight angles at 2500×1407, and the
ZR1 page's colorizer spins the same car through thirty frames. Both were
also rendered in **Torch Red** with nothing else changed. White minus red is
zero wherever the surface is not paint (glass, carbon, lamps, grilles,
wheels) and, on the paint, the difference of two diffuse albedos times the
light arriving there: the clear-coat reflections are identical in both and
cancel. That one subtraction gives the exact outline of every painted panel
and a clean "clay" shading image of the body in every view.

**Cameras.** All 38 views are solved together (`joint.py`) from GM's
wheelbase and tracks, wheel-hub positions found in every frame, and
mirrored landmarks; the spin is one rig (focal length, distance, tilt,
step). The solve also measures the hub heights (319 / 347 mm) and how far
the wheels' centre faces sit outboard of the track (112 / 90 mm: the rear
wheels are much deeper-dished).

**Body skin.** A closed Catmull–Clark cage (3,570 control points) carries
the large shape, fitted to the painted outline in every view; on top of it
every vertex of its third subdivision (228k) carries one offset along the
surface normal, fitted to three kinds of evidence at once (`skinfit.py`,
`psnorm.py`):

- **silhouettes** — the surface's outline onto the observed outline wherever
  that outline is paint, nothing on background, every painted pixel covered;
- **feature lines** — 40,000 points on paint boundaries and crease lines,
  triangulated across views (`edgemvs.py`), denoised along each line from
  5.6 mm to 1.5 mm scatter (`curveclean.py`);
- **shading** — photometric stereo. The spin's lights travel with the
  camera, so all thirty frames share one diffuse-lighting function of the
  camera-space normal; each configurator view has its own. Each is nine
  spherical-harmonic coefficients, fitted in *linear* light (the 8-bit
  values are sRGB-decoded first; the raw difference is not proportional to
  the light). A point seen in many frames has its normal solved from all of
  them, anchored to the mesh normal (a spin about one axis cannot tell a
  normal from the same normal turned about that axis together with the
  light), and the surface is then bent to agree with those normals.

The fit alternates normals and surface for fourteen rounds. The Rust crate
rebuilds the same surface from `data/body_cage.json` (cage + offsets) to
within 0.01 mm of the fitted one.

**Materials.** Each view is projected onto the skin; the unpainted regions
are named by where they sit (glass, carbon roof, louvred hatch, lamps,
grilles, intakes, vents, plate, valance) and outlined by the paint
probability's sub-face iso-contour (`regions.py`) → `data/regions.json`.
The lower fascia is decided from the head-on view alone (elsewhere the
splitter hides it).

**Add-on parts** (`data/addons.json`): the **wing** — main plane,
endplates and uprights — is a parametric model whose projected outline is
optimised against the carbon pixels of fifteen views; the **mirrors** are a
visual hull carved from every view in which they show against the
background; the **dive planes, splitter corners, side skirts, exhaust tips
and hood Gurney** are placed from points triangulated in two to four
calibrated views (reprojection error mostly under 3 px, i.e. a few mm). The
**wheel arches** are measured edge points (`data/arches.json`).

## How it is built — `src/`

Rust, on the **Orbital Dawn Astronautics geometry kernel** (`odawn-geo`):
signed distance fields and their booleans, the sparse bake, the
surface-nets meshers, the mesh gate and the quadric simplifier are the
kernel's. The kernel lives in its own private repository and is
*referenced*, not copied — `Cargo.toml` points at
`../../Orbital-Dawn-Astronautics/crates/odawn-geo`. To rebuild, clone both
repositories side by side and:

```
cd zr1
cargo run --release                       # every part → model/zr1.{step,3mf,glb}
cargo run --release -- "=Body,Glass"      # rebuild some parts, reuse the rest from out/parts/
cargo run --release -- assemble           # re-write the three files from out/parts/ only
cargo run --release -- stl Wing           # build matching parts to out/*.stl (overlay checks)
cargo run --release -- skin               # the measured skin alone → out/skin.stl
ZR1_DETAIL=2 cargo run --release          # every voxel doubled: a quick draft (its own cache)
```

- `skin.rs` — the cage, its Catmull–Clark subdivision and displacement,
  gated, as the kernel's exact `MeshField`.
- `regions.rs` — the measured regions as oriented prisms.
- `car.rs` — every part: the body (skin less the arches, the cabin, the
  glass and inlays, the recessed grilles, intakes and vents, and the space
  the splitter and Gurney take), glass, carbon, lamps, liners, valance; the
  fitted add-ons; wheels, tyres, cross-drilled rotors and calipers placed
  at the measured hubs.
- `fields.rs` — prisms, placements, mirroring, and `OverSurface`, an
  expression over the body surface that reads the expensive mesh field once
  per point however many layers a part uses.
- `interior.rs` — seats, dash, console, wheel, belts.
- `export.rs` — STEP (AP214, coloured assembly), 3MF and GLB writers.

## What is accurate, and what is not

Honest accounting, in the house style.

**From GM's data:** wheelbase 2723 mm, tracks 1685 / 1678 mm; tyres
275/30ZR20 and 345/25ZR21 on 20×10 and 21×13 wheels; carbon-ceramic rotors
400×38 / 390×34 mm; option content, codes and colour names.

**Measured from the renders:** the body's shape (outline within about
4–5 mm RMS full size in most views — 0.3 mm on the model; the shading of
the fitted surface explains 55–72 % of the observed paint shading per
view), every paint/glass/carbon/lamp boundary, the wheel arches, hub
heights and wheel offsets, the wing, mirrors and the other add-ons. The
renders are Chevrolet's CGI of the car, so the model reproduces GM's own
model of it, at the resolution of those images.

**Approximated:** the underbody (never seen; a fair surface); the far side
of anything seen from one side only (made symmetric); detail finer than
about 2 cm on the body — the measured surface is smooth, so sharp creases
are slightly rounded; the wheel spoke shape (ten spokes forking into Ys,
placed by eye from the renders); caliper shape; the interior (no interior
dimensions are published — seats, dash and wheel are placed to fit the
cabin); the exhaust housing's outline. Colours are close matches, not
paint codes.

**Left out:** badges and lettering, door handles and shut lines, grille
mesh patterns, louvre slats, the engine under the hatch, wipers.

**Model year.** The renders are of the 2025 build (J58 brakes, polished
tips); for 2026 the ZTK brakes and belt colour name changed.
