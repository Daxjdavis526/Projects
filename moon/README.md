# SELENE — the real Moon, at full scale

An open-world exploration game on Earth's Moon, built on the measurements
rather than on an impression of them. The whole body is here at its real size,
1737.4 km of radius and 38 million square kilometres of surface, with the
topography the Lunar Orbiter Laser Altimeter measured, the imagery the Lunar
Reconnaissance Orbiter Camera took, the Sun and the Earth where celestial
mechanics puts them, and the temperature Diviner recorded. Land somewhere, get
out, and walk.

**Keyboard + mouse required.** Desktop only.

Live: https://daxjdavis526.github.io/Projects/moon/

## Running it

No build step. Any static server works:

    cd moon
    python3 -m http.server 8000
    # open http://localhost:8000

(Plain `file://` does not work: ES modules need HTTP, and so do the terrain
workers.)

It starts in orbit. Turn the Moon, zoom in, click anywhere on it, and the panel
tells you what is under the cursor: elevation, slope, which of the 8985 named
features you are inside, what the USGS geologic map calls the ground, where the
Sun and the Earth will be when you get there, and how good the topography is at
that spot. Then land.

## Controls

| Input | Action |
|---|---|
| drag | look, or turn the Moon in orbit |
| W A S D | walk, or drive |
| shift | lope, or the rover's boost mode |
| space | jump, brake, or skip the landing |
| J | jetpack (hold) |
| G | on foot, or the free camera |
| F | first or third person |
| L | suit lamps: off, flood and head, all three |
| R | get on and off the rover |
| C | rover canopy: open, or sealed and pressurised |
| M | site markers |
| O | settings |
| V | the data overlay: what you are standing on and where it came from |
| T | time rate: held, real time, up to a day a second |
| P | photography |
| F2 | save |
| H | controls |

URL parameters are useful for going straight somewhere:
`?site=apollo11`, `?site=-43.31,-11.36`, `?t=1969-07-20T20:17Z`, `?view=ground`,
`?mode=eva`, `?quality=ultra`, `?rate=600`, `?offline=1`, `?fov=12`.

## What is real, and how real

This is the part that matters. The overlay (`V`) will tell you the same thing
about wherever you are standing, and `DATA_SOURCES.md` has the full table with
sources and limitations for every layer.

| | |
|---|---|
| **Shape of the Moon** | LOLA LDEM at 16 pixels per degree, 1.9 km per pixel, vendored for the whole globe. Every basin, mare, mountain range and crater larger than a few kilometres is where LOLA measured it. |
| **Regional topography** | LOLA at 118 m per pixel, streamed from NASA Trek as you go. Polar regions down to 5 m. |
| **Metre-scale topography** | About fifty LROC NAC stereo models at 1.5 to 5 m per pixel, streamed where they exist, plus the Apollo 11 model vendored at 2 m. |
| **Imagery** | The LROC WAC global mosaic at 83 m per pixel, streamed. At Tranquility Base, the NAC mosaic at 65 cm. |
| **Colour** | The LROC colour map, read as a reflectance rather than as a picture: the mare comes out at 0.07 and the highlands at 0.11, which is what the photometry says, and the display-stretched ray craters are rolled over to a physical maximum. |
| **Sun and Earth** | Computed from the date and your position, checked against JPL Horizons at ten sites across twelve epochs from 1969 to 2045. Sun and Earth azimuth and elevation are right to 0.05 degrees, the illuminated fraction to 1 percent, the angular diameter to 5 arcseconds, and the face of the Earth turned towards you to 0.2 degrees. |
| **Stars** | The Yale Bright Star Catalogue, 9096 stars, rotated into the Moon's frame. |
| **Geology** | The USGS Unified Geologic Map of the Moon, 1:5 million. Tranquility Base reads `Im2`, Upper Mare Unit, Imbrian, which is correct. |
| **Temperature** | Diviner's bolometric temperature maps at half a degree, interpolated across the day by a model that is documented as being a model. |
| **Gravity** | GRAIL GRGM1200A. The mascons are real and they are about half a percent, which is far too small to feel and is shown in the overlay rather than exaggerated. |

Below the resolution of the source data, detail is invented, and it is invented
in a way that provably cannot move a real landform: every procedural band is
switched off at wavelengths longer than twice the pixel size of whatever data
is under you. At 1.9 km per pixel the invented part is 14 m RMS; at 2 m per
pixel it is 7 cm. It shrinks as the data improves, which is the whole design.

The overlay labels every value **MEASURED**, **INTERPOLATED**, **REGIONAL**,
**PROCEDURAL** or **FICTIONAL**, and means it. LOLA's grids have no missing
data flag because the gaps were filled by interpolation, so the game reads the
observation counts separately: Tranquility Base itself is between altimeter
tracks, and the overlay says so.

## What is fiction

The ship, the rover, the jetpack and the suit's exact consumable capacities.
No such vehicles exist or are planned. They are labelled FICTIONAL wherever
they surface, and the Moon is never altered to accommodate them, with one
exception: the ship flattens a circle of ground sixteen metres across so it can
stand on its legs, and that pad is labelled too.

The physics they run on is not fiction. The rover's handling comes from the
Apollo Lunar Roving Vehicle record and from regolith soil mechanics, the suit's
consumables from the Apollo portable life support system and the published xEMU
requirements, and the locomotion from the Apollo film analyses.

## Moving in a sixth of a gravity

Walking on the Moon is not walking on Earth slowed down, and the controller is
built around the three reasons why.

Gravity is a sixth, so a walking leg swings through a six times slower
pendulum. Walking stays stable only below a Froude number of about 0.37, which
here is 0.74 m/s, a stroll. Above that you have to leave the ground between
steps, which is why every Apollo crew ended up loping.

Traction is a sixth too. Regolith's friction angle is around 37 degrees, so a
boot can push with about 0.8 of your weight and your weight is already a sixth.
Acceleration tops out near 1.3 m/s², and only while a foot is down. Stopping
from a lope takes four metres.

Your mass is not a sixth. The suit and backpack together mass more than you do,
and inertia does not care which planet it is on.

The rover has the same problem an order of magnitude larger: it can accelerate
and brake at about a tenth of a gravity, takes twelve metres to stop from 18
km/h, slides rather than turns if you ask too much of a corner, climbs twenty
degrees three times slower than it crosses flat ground, and slides back down
forty five.

## Light

There is no atmosphere, so there is no sky light. The sky is black in daylight
and the shadows are lit only by whatever the Earth is throwing at them, which
is about a ten-thousandth of sunlight. That is not a stylistic choice; it is
the reason a crater floor can be genuinely dark and the reason the suit spends
most of its battery on lamps and heat when you go into one.

The surface is not Lambertian either. Regolith is a porous backscattering
powder: a full Moon is far brighter than a diffuse sphere would be and looks
flat rather than shaded towards the limb, because every grain throws light
back where it came from. The renderer uses a Lommel-Seeliger base with a
Henyey-Greenstein backscatter term and an opposition surge, normalised so the
albedo numbers mean what they say. The exposure model uses the same function,
so the camera cannot over-expose the thing it is pointed at.

Every vertex carries eight horizon angles, one every 45 degrees, so a crater
rim shadows its own floor at any distance without a shadow map reaching to the
horizon.

## Sound in a vacuum

There is no airborne sound outdoors, ever. No wind, no rover noise carrying
across the landscape, no ambient drone pretending to be a physical thing.

What you hear inside the suit is the suit: the ventilation fan, the pump, the
regulator, your own breathing at whatever rate the work is demanding, the
radio. Footfalls arrive as structure-borne vibration through boot and suit and
body, which sounds nothing like a footstep recorded outdoors. The rover reaches
you through whatever you are touching. Inside the ship there is air, so the
ship sounds like a room.

The airlock is the demonstration: as the pressure falls, the airborne path
fades to exactly nothing and only the structure-borne one is left.

## Architecture

Static files, ES modules, an importmap, three.js vendored locally. No build
step and no bundler.

    src/physics/     frames, ephemeris, player, suit, rover — no DOM, no three.js
    src/terrain/     cube-sphere quadtree, heightfield, procedural detail, workers
    src/render/      two-tier stage, regolith material, sky, exposure, photometry
    src/data/        NASA Trek streaming, IndexedDB cache, GeoTIFF, temperature
    src/game/        EVA, descent, the ship, the rover, historic sites, saves
    src/models/      astronaut, ship, rover, Apollo 11 — procedural geometry only
    src/ui/          orbit picker, suit display, photography
    tools/           the data pipeline and the Horizons fixture generator
    data/            47 MB of vendored NASA data, built by tools/build_data.py
    test/            headless checks: node test/*.test.mjs

The whole surface is one cube-sphere quadtree at real scale. Tiles are 33 by 33
vertices with skirts; the camera sits at a floating origin on a 256 m lattice
so nothing near you is ever a large float; depth is logarithmic; and the sky is
a separate rotation-only pass so a star 400 light years away and a pebble half
a metre away can share a frame.

Anything with real logic is testable without a browser, which is the house
rule:

    node test/ephemeris.test.mjs      # against JPL Horizons fixtures
    node test/dem.test.mjs            # the vendored elevation data
    node test/terrain.test.mjs        # cube sphere and band-limited detail
    node test/tilebuilder.test.mjs    # tile geometry and horizon maps
    node test/streams.test.mjs        # NASA Trek service selection
    node test/player.test.mjs         # locomotion in a sixth of a gravity
    node test/suit.test.mjs           # life support
    node test/rover.test.mjs          # driving
    node test/temperature.test.mjs    # the Diviner interpolation

    python3 tools/build_data.py --check     # the vendored data still checks out

Several rendering bugs in this project were only ever visible in a picture, so
screenshots are a first-class test:

    NODE_PATH=/opt/node22/lib/node_modules node test/screenshot.mjs

## Rebuilding the data

`data/` is 47 MB and committed, so nothing needs downloading to play. To
rebuild it from the original archives:

    python3 tools/build_data.py            # ~2 GB of downloads, cached
    python3 tools/horizons_fixture.py      # regenerate the ephemeris fixtures

## Performance

Quality tiers are PERFORMANCE, BALANCED, HIGH, ULTRA and SCIENTIFIC
VISUALISATION, the last being measured data with as little processing as
possible: flat shading, no invented micro-relief. Streamed data is cached in
IndexedDB with a size cap, so revisiting somewhere costs nothing and an offline
session keeps whatever you have already seen. `?offline=1` turns streaming off
entirely and the game runs on the vendored data, with the overlay saying so.

## Three ranges

The ship carries as much as you like, the rover carries days, and the suit
carries hours, so an expedition is a planning problem rather than a resource
grind. Propulsion energy is unlimited by design: nobody is mining anything here
in order to keep driving. What is limited is what the people inside need.

The rover's navigation console does the arithmetic Apollo did. Every traverse
they drove was planned under a walkback constraint: never further from the
lander than you could walk home on the consumables you were carrying. The
console shows that distance, and turns amber and then red as you approach it.

## Roadmap

Not in this version: SLDEM2015 region streaming at 59 m globally, persistent
footprints across sessions, the Apollo 12 to 17 hardware layouts, lava tube
pits, an achievements list, and a gamepad.

There are no quests and there will not be any. The Moon is the content.

## What a screenshot found

Every one of these was invisible in a stack trace and obvious in a picture,
which is why the screenshot harness is a test rather than a convenience.

- The colour map was being read as an albedo. Tycho came out at 0.76
  reflectance, which pushed whole frames into the top of the tone curve, and
  filmic response turns bright neutral grey into warm sand. The Moon looked
  like a beach.
- The Earth was black. Its limb term normalised the vector from the camera to
  itself, and the sky camera sits at the origin, so every pixel of the planet
  was a quiet NaN.
- Tranquility Base was a staircase. The two metre stereo model was stored as
  whole metres, which is invisible on a 1.9 km global grid and a visible
  terrace on a 2 m one.
- Shackleton was two and a half kilometres too deep, because five of the six
  LOLA polar services return raw counts rather than metres.
- The far side came apart down the middle, because the preset sat exactly on
  the longitude seam.
- A tile a thousand kilometres across was being drawn through the ground under
  your boots, because the horizon cull had to widen itself by the tile's
  bounding radius and that swamps it at that size.

## Sources

`DATA_SOURCES.md` is the dataset table the whole thing is built on: what each
one is, its resolution and coverage, what it controls in the game, and what it
cannot support. `RESEARCH.md` carries every constant with its citation, and an
explicit list of the things that are still unverified.

The Moon is more interesting than anything anyone would invent to replace it.
That is the entire design brief.
