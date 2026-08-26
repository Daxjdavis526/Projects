# HORIZON — observable universe explorer

An interactive journey from Earth orbit to the edge of the observable
universe — 21 orders of magnitude in one continuous zoom. A scientific
visualization first, a cinematic experience always.

Live (once merged to `main`): https://daxjdavis526.github.io/Projects/universe/

## Running it

Static files, no build step — but it uses ES modules, so it needs to be
*served*, not opened from `file://`:

```sh
cd universe
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works. Desktop recommended; basic touch (drag + pinch)
works too.

## Controls

| Input | Action |
|---|---|
| Scroll / pinch | zoom — each notch is a step up or down the cosmic scale ladder |
| Drag | orbit the current focus |
| Click | select & inspect an object |
| Double-click | fly to an object |
| `/` | search & bookmarks (Earth → Observable Universe quick-jumps) |
| `T` | guided tour — a 14-stop cinematic ride from home to the horizon |
| `V` | **voyage** — auto-hop object to object, ever outward, to the horizon (or homeward from far out); dwell time adjustable live |
| `F` | **free flight** — WASD + Space/C, Shift boost, Ctrl creep, scroll sets speed (from m/s to Gpc/s), drag looks |
| `N` | jump to the nearest star |
| `0` / `Home` | return to Earth |
| `M` | ambient sound on/off |
| `Esc` | end voyage/tour/flight · close panels |

The **NEARBY** dock (top-left) lists the closest named objects with live
distances — click to travel, exploration-game style.

The **Time** button (available zoomed out past ~galaxy-cluster scale)
opens the cosmic-history slider: structure un-forms and space contracts
back toward the CMB. It is labeled — and built — as a *conceptual*
visualization, not a simulation.

## Architecture

```
index.html          UI markup + styles, import map, entry point
vendor/             Three.js r170 (module build) + bloom post chain
assets/             real Earth (day/night/normal/specular) + Moon maps
src/
  scale.js          units, log-scale math, coordinate frames, compression
  camera.js         orbit + log-zoom rig, rise-and-fall flyTo arcs
  render.js         shared shaders: flux-sized star points, beacons
  data.js           embedded catalogs + all object facts
  main.js           renderer, layer stack, per-frame projection, input
  layers/           solar · stars · galaxy · localgroup · clusters · cosmicweb
  ui/               hud · labels · panel · search · settings
  tour.js  timemode.js  audio.js  picking.js
```

### How one scene spans 10²¹ of scale

Everything lives in **universe coordinates**: heliocentric, ecliptic-
oriented, in meters, held in JS doubles (the observable radius, ~4.4×10²⁶ m,
fits with room to spare). Each frame the world is re-expressed relative to
the camera's focus, divided by the current camera distance — so the focused
neighborhood is always ~1 unit across, no matter whether that unit is a
planet or a supercluster.

Anything farther than 10⁴ render units is **logarithmically compressed**
along its sight-line: direction and angular size are preserved exactly, so
the result is visually identical to a literal rendering — the compression
only tames the numeric range for the GPU. This is why the Milky Way's band
is visible from Earth orbit and the same point cloud is the galaxy you
orbit at 10²¹ m: it's one coherent scene, never a scene switch.

Star-like points are sized by actual flux (luminosity / true distance²)
with a logarithmic response, so things brighten and fade physically as you
travel. Layers cross-fade in overlapping log-scale bands, and each layer's
point buffer is stored in its own natural unit (Gm, pc, Mpc) to keep
float32 math well-conditioned everywhere.

## What is accurate

- **Planets**: real radii, real orbital elements (JPL J2000 mean elements
  + rates), positions computed for today's date; real axial tilts.
- **Moon**: real orbit size/eccentricity/inclination with precessing nodes.
- **Belts**: real extents (asteroid 2.1–3.3 AU, Kuiper 30–50 AU,
  heliopause ~120 AU, Oort 2k–100k AU).
- **The night sky**: all 9,096 naked-eye stars of the Yale Bright Star
  Catalog at real positions — 2,922 with measured parallax distances,
  the rest photometric estimates. All 333 IAU-named stars are labeled
  and selectable, plus the faint historic neighbors (Proxima, Barnard's…).
  Star colors come from actual color temperatures; bright stars get a
  diffraction-spike PSF; fly to any star and it resolves into a glowing
  surface at its estimated radius.
- **Deep sky** (fact-checked catalog): 24 nebulae, 15 star clusters,
  20 nearby named galaxies, 8 black holes & quasars, and 14 famous
  exoplanet systems with 60+ real planets (real orbits and periods;
  orbital phases schematic) — all at published positions and distances.
- **Milky Way**: published structural parameters (disk scale length/height,
  bar, 4 arms at 12.5° pitch, Sun at 8,178 pc), galactic orientation is the
  real IAU frame — the galaxy sits in the correct direction from Earth.
- **Local Group**: 26 real members at real positions/distances.
- **Clusters/superclusters**: 18 named structures at real sky positions and
  mean distances (Virgo, Coma, Norma/Great Attractor, Shapley, …).
- **Horizon**: comoving radius 46.5 Gly; redshift readout in time mode uses
  the real a(t) relation.

## What is approximated or artistic (and says so)

- **Visibility enhancement**: objects smaller than a pixel are drawn as
  minimal glowing points so the sky stays navigable; the scale box notes
  when this is active. Distances are never altered.
- **Surface detail**: every planet except Earth/Moon is procedural.
- **Belt/Oort points** are statistical samples, not ephemerides (and far
  sparser than reality — the real belt wouldn't be visible at all).
- **Milky Way / M31 point clouds** are structural models, not star
  catalogs; each point stands in for ~10⁶ stars, with a surface-brightness
  compensation as you zoom out.
- **Cluster swarms** are schematic scatter around real centers; **Laniakea**
  is a soft envelope, since the real boundary is a velocity watershed.
- **Nebulae and distant galaxies** are procedural impostors (layered cloud
  sprites, painted disks) at real positions/sizes — evocative, not imagery.
- **Black-hole close-ups** are schematic accretion scenes at exaggerated
  visual scale (a real stellar black hole is kilometers across).
- **The cosmic web beyond ~300 Mpc** is a seeded statistical filament
  network with the right topology, not a map of real galaxies.
- **Time mode** is conceptual: qualitative structure growth, a visual floor
  on the scale factor, real z labels.
- The Sun is drawn ~10⁵× fainter than physical flux would demand — real
  exposure would blind every other pixel.

## Performance

Instanced GPU point clouds (≈450k points at High), band-gated layer
culling, one shared shader family, a pooled DOM label system with greedy
decluttering, MSAA + bloom through a single half-float render target.
Quality presets (Low → Ultra) scale point counts and pixel ratio; bloom
can be disabled independently.

## v2 notes

- Point flux is computed in log2 space from true camera distance, and the
  bloom/output shaders clamp + NaN-guard HDR values (the vendored
  LuminosityHighPassShader/OutputShader carry small documented patches) —
  this removes the black-rectangle artifacts HDR overflow could cause.
- Any input during a tour/voyage flight hands control back instantly.
