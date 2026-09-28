# STARSHIP

A parametric CAD model of SpaceX's **Starship V3 upper stage stacked on a
Super Heavy Block 3 booster**, the configuration that has flown since
Flight 12. It exports a STEP file for CAD and watertight STLs for printing.
The default scale is **1:500**: the stack comes out 249 mm tall, 18 mm across
the hull and 35 mm across the aft flaps, which fits the Z axis of most desktop
printers.

The geometry comes from SpaceX's published figures plus measurements taken
off photographs of Ship 39, Ship 40, B19 and B20, scaled against the 9 m
diameter. Every number in `build_model.py` is tagged below as published,
measured or estimated.

Live viewer: https://daxjdavis526.github.io/Projects/starship/

![The stack; the hot-staging truss and grid fins; Super Heavy's 33 Raptors](preview.png)

## Files

| file | what |
|---|---|
| `models/starship_stack_1-500.step` | The CAD model, with every wall at its real thickness. Named, coloured bodies: `super_heavy`, `super_heavy_raptors`, `starship`, `starship_raptors`, and `heat_shield` (the windward shield plus four leeward tile patches). Units mm. |
| `models/starship_stack_1-500.stl` | The print model: the whole stack fused into one watertight body. |
| `models/super_heavy_1-500.stl` | Booster only, 144.6 mm. |
| `models/starship_ship_1-500.stl` | Ship only (heat shield fused on), 104.6 mm. |
| `models/starship_stack.glb` | The CAD model tessellated for `index.html`. |
| `build_model.py` | The generator. Every file above comes out of it. |
| `index.html` | A three.js viewer for the GLB, with download links. |

All three STLs have zero non-manifold edges. The STEP re-imports as 46 valid
solids:
- the booster's steel
- the ship's steel
- five heat-shield pieces
- the 39 engines, each trimmed to the part that shows outside the hull

## Building

```
pip install cadquery
python3 starship/build_model.py              # 1:500 into starship/models/
python3 starship/build_model.py --scale 200  # 1:200, 622 mm tall
python3 starship/build_model.py --scale 350 --min-wall 0.6
```

It takes about a minute and under 1 GB of memory. Most of that time goes on
the grid fin lattices and the 39 engines' plumbing. Geometry is written in
real metres and scaled only on export.

The script builds the vehicle twice:
- **The CAD model** (STEP and GLB) keeps real thicknesses and every detail:
  0.3 m lattice cells, the Raptors' pump pods and hot-gas ducts, the aft
  plumbing rings.
- **The print model** (STLs) thickens anything thinner than `--min-wall`
  (default 0.8 mm, two perimeters with a 0.4 mm nozzle). It also coarsens the
  grid fin lattice and drops details too small to print.

Axes: +Z up the stack, with the origin at the booster's engine exit plane. +X
is the ship's windward (heat-shield) side, which is also where the booster's
rudder fin sits. The launch tower is on −X, and the catch fins and catch pins
are on ±Y.

## Printing

Split it. The stack is a 249 mm pencil, and the two stages print more
reliably apart. Print them upright, standing on their engines. The ship's
skirt then sits on the booster's hot-staging ring, as it does on the pad.

- Support the grid fins, the undersides of the flaps, and the engine bells.
- Use a 0.2 mm layer height or finer for the fins and the truss.
- For colour, paint the heat shield. In the STL it stands 0.2 mm proud of the
  steel, so the tile line is a ridge you can mask along.

## What is in the model

### Super Heavy Block 3 (72.3 m)

**Engines.** 33 Raptor 3s hang fully exposed below the aft barrel. Block 3
deleted the engine shrouds and the aft cavity.
- 20 fixed engines every 18° at r = 4.30 m. Their 1.3 m nozzles overhang the
  9 m hull by about 0.45 m, as they do in every liftoff photo.
- 10 gimballing inner engines at r = 2.52 m, each splitting a pair of outer
  engines.
- 3 centre engines at r = 0.95 m, clocked 108° / 108° / 144° and in line with
  inner engines.
- Nozzle exits sit 2.75 m below the barrel lip.

**Aft plumbing band.** Three commodity ring pipes and one junction box per
outer engine, just above the lip.

**Hot-staging adapter.** The integrated, non-jettisoned truss is a 3.0 m
Warren truss:
- 36 spindle struts between 18 lower nodes, 20° apart, with a black clevis
  fork at each.
- 18 upper nodes, offset 10°, under the ring the ship sits on.
- The forward dome rises into the truss, exposed to the ship's exhaust.
- Eight round ports with doubler rings sit just below it.

**Grid fins.** Three fins in a "T", 6.6 m below the top:
- A rudder fin on the heat-shield side.
- Two catch fins at ±90°, which the chopsticks lift and catch the booster by.
  They have a catch shoe underneath, and there are no separate hardpoints on
  V3.
- Each fin is 4.3 m span × 3.5 m wide × 0.36 m deep, with chamfered root
  corners and a diamond lattice at about 0.3 m pitch.
- Each has the saw-tooth lower edge that shows in every photo, and a round
  shaft aperture on the hull.

**Chines.** Four angular fairings over avionics, pressure bottles and
batteries:
- Two tall ones close together either side of the tower-side conduit.
- Two shorter ones farther apart on the heat-shield side.

**Conduits.**
- The tower-side conduit runs the full length, with two pointed pods and a
  pipe alongside.
- The heat-shield-side conduit runs from the common dome down.
- A band of short vertical ribs circles the common dome.

### Starship V3 (52.1 m)

**Aft skirt and engines.**
- A 7.0 m open aft skirt, with the aft dome hanging into it.
- Three gimballed sea-level Raptors sit on the thrust puck.
- Three fixed Raptor Vacuums (2.3 m exit, 4.1 m long) are mounted on the dome
  and recessed inside the skirt. Their bells have a regen section, a manifold
  ring and a nozzle extension.

**Nose.** A 12.5 m tangent ogive with a 0.9 m blunted tip. Its profile matches
photo measurements within 0.15 m from 0.5 m to 11 m below the tip.

**Aft flaps.**
- 14 m tall on the ±90° tile line, reaching 4 m out.
- A straight outer edge, a swept leading edge, and a taper from 0.6 m to
  0.3 m thick.
- A full-height static hinge fairing with a ramped cap.
- Wingspan is 17.0 m, matching the published figure.

**Forward flaps.**
- Moved 23° leeward, to ±113°.
- 3 m span, with the root following the ogive and a leeward hinge fairing.

**Heat shield.**
- The windward 180° from the skirt lip up the body.
- Widening to ±117° around the forward flaps.
- The whole tip, all the way round, down to 3.5 m below it.
- The four black tile patches on the leeward side, seen on Ship 39.

**Leeward side.**
- Two raceways from the skirt to the nose.
- RCS thruster pods at their tops and on the skirt.
- Four docking drogue fittings.
- The recessed Starlink dispenser door.
- Ramp-shaped catch pins on the tile line under the nose.

## What is accurate and what is not

SpaceX publishes a handful of numbers and no drawings. So "replica" here means
three things: the published dimensions are exact, the rest is measured off
photographs, and the measuring has error bars. In detail:

### Published, and used exactly

- 9 m diameter; 124.4 m stack; 72.3 m booster; 52.1 m ship (the difference).
- 33 + 6 engines and the 3 / 10 / 20 booster layout, including the centre
  engines' 108/108/144° clocking.
- Three grid fins in a T with catch points on the fins.
- Raptor 3 at about 3.1 m long with a 1.3 m exit.
- The 17 m flap-to-flap wingspan.
- The deletion of the booster's engine shrouds.
- The integrated hot stage.
- Four leeward docking drogues.

### Measured from photographs

These are right in proportion but not to the centimetre. Typical error is
±0.5 m on positions, ±10–20% on sizes, and ±10° on angles.
- Engine ring radii (outer 4.30, inner 2.52, centre ~0.95 m) and the Raptor 3
  silhouette: flange, powerhead block, manifold disk, torus stack, bell
  contour. The silhouette was taken from SpaceX's side-on photo of Raptors 1,
  2 and 3.
- Grid fin size, lattice pitch, height, and the hot-stage truss (strut count,
  node spacing, 3.0 m height).
- Ship skirt height (7.0 m), nose profile, flap planforms and positions, the
  forward flaps' ±113° azimuth, the tile boundary, catch pins, raceways, RCS
  pods, drogues and door.

### Estimated, least certain

- The Raptor Vacuum. There is no clean photo of a Raptor 3 RVac, so it is
  built from an earlier-generation RVac display unit.
- The ship's engine clocking and ring radii. No V3 ship bottom-view photo was
  found; SpaceX's renders line the two rings up.
- The chines' exact azimuths (±15°) and cross-sections.
- The aft dome shape.
- The flaps' thickness taper.

### Simplified or left out

- Tank walls are solid; there are no interiors. The booster's forward dome and
  the ship's aft dome exist only as outer surfaces.
- The heat shield is a smooth shell. A real ship carries ~18,000 hexagonal
  tiles, which would be 0.3 mm across at 1:500.
- No weld seams, stringers, skirt vents, QD plates, launch-mount clamps,
  engine serial numbers, or the Raptors' smaller plumbing.
- The grid fins' saw-tooth is modelled on the three outer edges only. On the
  real fins every lattice web is scalloped.

### Changed in the print STLs only

These changes follow from the `--min-wall` clamp and depend on scale; at 1:200
far less of this happens.
- Walls thinner than 0.4 m real are thickened to 0.4 m: the skirts, the
  hot-stage ring and struts, the raceways, and the engine bell walls.
- The grid fin lattice coarsens from 0.3 m to 1.4 m cells, so the webs can
  print and the holes stay open.
- The Raptors' pump pods and ducts, the aft plumbing rings and the common-dome
  ribs are left out.
- The heat shield stands 0.1 m (0.2 mm) proud of the steel so the tile line
  survives as a ridge. This is why the stack measures 249.0 mm rather than
  248.8.

## Sources

**Published figures**
- SpaceX, [Introducing Starship V3](https://www.spacex.com/updates/)
  (2026-05-12)
- [Wikipedia: SpaceX Starship](https://en.wikipedia.org/wiki/SpaceX_Starship),
  [Super Heavy](https://en.wikipedia.org/wiki/SpaceX_Super_Heavy),
  [Starship (spacecraft)](https://en.wikipedia.org/wiki/SpaceX_Starship_(spacecraft)),
  [Raptor](https://en.wikipedia.org/wiki/SpaceX_Raptor)
- NASASpaceflight,
  [Super Heavy Block 3, the booster of the future](https://www.nasaspaceflight.com/2026/05/super-heavy-block-3-booster-future/)
  and [Future of Starship: Block 3 and Mars](https://www.nasaspaceflight.com/2025/05/future-starship-block-3-mars/)
- Ringwatchers' Ship 33 and Ship 37 teardowns: the nose, the aft section and
  the heat shield. These are Block 2, and V3 kept the flaps unchanged.
- [Space.com: how Starship V3 differs from its predecessors](https://www.space.com/space-exploration/launches-spacecraft/the-worlds-biggest-rocket-how-spacexs-new-starship-v3-differs-from-its-predecessors)

**Photographs measured**
- SpaceX's photos of the Flight 12 wet dress rehearsal, B19 transport and
  lift, the Flight 12/13 stacks, Ship 39's static fire, and the Raptor
  1/2/3 comparison.
- StarshipGazer's B19 aft close-up.
- NSF's photos of the Ship 40 rollout and the B20 liftoff.

`vendor/three/` is three.js r180 (the minified core, `OrbitControls`, and
`GLTFLoader` with the one utility it imports), fetched from npm.
