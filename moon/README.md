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
| click | look. Escape gives the pointer back. In orbit, drag to turn the Moon |
| W A S D | walk, or drive. The arrow keys do the same |
| shift | lope, or the rover's boost mode |
| space | jump, brake, or skip the landing |
| J | jetpack (hold) |
| G | on foot, or the free camera |
| F | view: first person, first person with the helmet, third |
| L | suit lamps: off, flood and head, all three |
| R | get on and off the rover |
| E | the ship's hatch, at the ladder |
| C | rover canopy: open, or sealed and pressurised |
| M | site markers |
| K | where you have been |
| O | settings |
| V | the data overlay: what you are standing on and where it came from |
| T | time rate: held, real time, up to a day a second. Shift+T steps back down |
| P | photography |
| F2 | save |
| H | controls |

A gamepad works if one is plugged in, and produces exactly the same inputs the
keyboard and mouse do rather than a second control scheme: left stick to move,
right stick to look, A to jump or brake, B for the lamps, X for the jetpack, Y
for the view, the bumpers for the rover and the hatch, the triggers to lope or
boost. Sticks are analogue where the physics takes an analogue value, so easing
along a crater rim at walking pace is something a pad can ask for and a key
cannot.

URL parameters are useful for going straight somewhere:
`?site=apollo11`, `?site=-43.31,-11.36`, `?t=1969-07-20T20:17Z`, `?view=ground`,
`?mode=eva`, `?quality=ultra`, `?rate=600`, `?suit=relaxed`, `?offline=1`,
`?fov=12`, `?helmet=1`, `?help=0`. The orbital picker also takes a date and a time, and its
search box takes coordinates as well as names: `0.674, 23.473` and
`0.674N 23.473E` both work, in either order.

Leave `?t=` off and the clock starts at the next time the sun is actually up
over wherever you are going. That is not cosmetic: the Moon turns once a month,
so at any given moment about half the catalogue is in the dark, and on the day
this was written it was forty sites out of forty-seven — Tranquility Base among
them, at eighty-two degrees below the horizon. Nothing about the lighting is
faked; the date on the HUD is the date being simulated, and the game says so
when it moves the clock. Give it a `?t=` and it does exactly as it is told,
including landing you at local midnight.

`?view=descent` is the one worth knowing: it flies the approach into wherever
`?site=` points rather than starting you on the ground there — a minute of
guided descent from 1150 m and three kilometres out, space to skip it. So
`?site=apollo11&view=descent&t=2026-09-28T00:00Z` lands you at Tranquility
Base, which is to say two kilometres short of it, on the bearing you came in
on, because that is what the keep-out below insists on. You walk or drive the
rest: twenty minutes on foot, eight in the rover.

## What is real, and how real

This is the part that matters. The overlay (`V`) will tell you the same thing
about wherever you are standing, and `DATA_SOURCES.md` has the full table with
sources and limitations for every layer.

| | |
|---|---|
| **Shape of the Moon** | LOLA LDEM at 16 pixels per degree, 1.9 km per pixel, vendored for the whole globe. Every basin, mare, mountain range and crater larger than a few kilometres is where LOLA measured it. |
| **Regional topography** | LOLA at 118 m per pixel, streamed from NASA Trek as you go. Polar regions down to 36 m: the 5 m polar products exist, but Trek serves them reprojected to lat/lon and that reprojection is 35.663 m per pixel, which is what arrives here and what the registry and the overlay both say. |
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

It is bounded from below as well, by the vertex spacing of the tile being
drawn. A crater needs three vertices across to be a bowl rather than a spike,
so a tile whose vertices are half a metre apart carries craters down to two
metres and a tile twenty kilometres across carries none of it — which is not a
compromise but the anti-aliasing condition, since the same ground rebuilt one
level finer would otherwise put its detail somewhere slightly different.

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

The physics they run on is very nearly not fiction. The rover's handling comes
from the Apollo Lunar Roving Vehicle record and from regolith soil mechanics,
the suit's consumables from the Apollo portable life support system and the
published xEMU requirements, and the locomotion from the Apollo film analyses.

Three departures, which are deliberate and worth naming.

**Life support runs on the clock on your wall.** Fast-forward the sky and your
oxygen does not go with it. This is a departure from consistency and it is the
right one: the alternative shipped, and at the old 600× default it emptied a
nine-hour suit in fifty-four seconds while your legs went on walking at normal
speed. A tank holds what it holds for as long as you are actually out there,
which also means the endurance on the HUD is a number you can trust — nine
hours is nine hours.

**The rover's tyres grip better than Apollo's did**, 0.78 against the 0.62
measured for wire mesh on regolith. In a sixth of a gravity traction, not
torque, is what decides everything: the vehicle weighs 2.3 kN, so grip alone
sets how hard it can accelerate, how steep a slope it holds — the friction
angle falls out as atan(0.78), about 38° — and how far it takes to stop, which
at 60 km/h is over a hundred metres. Boosting raises the grip again rather than
the torque, because multiplying a force that is already being clamped away
changes nothing at all.

**And it is fast**: 60 km/h, 110 boosted, against the real rover's 13. Nothing
it drives over is invented; only the vehicle is.

## Not landing on the hardware

Ask to land at Tranquility Base and the ship sets down two kilometres short of
it, on the bearing you picked from, and you walk or drive the rest. That is
about twenty minutes on foot and eight in the rover.

This is not squeamishness. A descent engine firing at the surface throws
regolith outward at kilometres per second in a sheet a couple of degrees above
the horizontal, and doing that beside Eagle would sandblast the descent stage,
bury a retroreflector that is still ranged from Earth every week, and erase the
bootprints. The keep-out is two kilometres at Apollo 11 and Apollo 17, five
hundred metres at the other crewed sites, two hundred at robotic landers, and
nothing at all at landmarks, which are scenery rather than hardware.

Nothing stops you walking right up to the descent stage once you are down. The
rule is about where a rocket lands, not about where you may stand, and arriving
on foot is a better arrival anyway.

**These radii are this game's own.** NASA published recommendations in 2011 for
approaching the US government's lunar artifacts and they set limits of roughly
this shape; this build could not retrieve that document to quote its figures, so
nothing here is presented as anyone's published number. `RESEARCH.md` says the
same in its unverified list.

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

The rover has the same problem an order of magnitude larger. It accelerates and
brakes at about a tenth of a gravity whatever the motors are asked for, so it
takes 13 seconds to reach 60 km/h and over a hundred metres to stop again,
slides rather than turns if you ask too much of a corner, climbs twenty degrees
at half the rate it crosses flat ground, and slides back down forty five.

It also gets air, and that is not decoration either. Hit a ten degree rise at
the boost ceiling and the vehicle keeps the vertical speed it had while it was
climbing — five seconds of it, and a couple of hundred metres of ground — then
lands on its suspension. Past about forty degrees of roll the centre of mass is
outside the wheels and it goes over; **R** rights it, because a rollover should
cost you a moment rather than a save.

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
horizon. The same eight angles say what fraction of the sky a point can see,
and what it cannot see is terrain: that terrain bounces one pass of sunlight
back into the shadow at the neighbourhood's own albedo, which lands four or
five stops under direct sun. It is invisible beside a lit slope and it is the
difference between a shadow you can see into and a hole cut out of the picture.
Apollo photographs show the inside of a crater for exactly this reason.

The astronaut, the ship and the rover have no horizon map, so they get the same
bounce as a hemisphere light aimed along the local vertical, and the terrain
drops the scene-wide version rather than counting it twice. Without it a figure
standing with the Sun behind them was a black silhouette, which is the one
thing Apollo photography conclusively refutes: Aldrin is in the lander's shadow
on the ladder and perfectly legible.

The camera meters the scene analytically rather than reading back the
framebuffer, so it is deterministic in a screenshot. It knows the local albedo,
how steeply the ground around you runs, the phase angle, how much of the frame
is ground rather than black sky, the Earth's phase and elevation, and what your
lamps are putting on the ground. Leaving any of those out has a visible cost:
metering a cratered highland as though it were a plain blows every sunward
slope to white paper, and forgetting the lamps opens the camera eleven stops
for a lunar night and then washes the picture out the moment you switch them on.

Where sunlit regolith sits on the tone curve is one number, and it was set by
measuring frames rather than by taste: too high and a genuinely cratered
surface photographs as a smooth dune, because the top of a filmic curve has no
slope left to spend on relief. The opening view of the whole Moon is the test
case, since everyone has seen the real thing.

A high Sun really does flatten the Moon. Regolith's backscatter means the light
comes back the way it went out, so a slope tipped towards the Sun is barely
brighter than level ground and the craters read as tone rather than as shadow.
The place to look at a landscape here is the same place it is on Earth: near
sunrise or sunset, which on the Moon lasts days.

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
    node test/gravity.test.mjs        # GRAIL's anomaly, against the mascons
    node test/terrain.test.mjs        # cube sphere and band-limited detail
    node test/tilebuilder.test.mjs    # tile geometry and horizon maps
    node test/quadtree.test.mjs       # which tiles get drawn, and the budget
    node test/photometry.test.mjs     # the BRDF, against its own shader
    node test/streams.test.mjs        # NASA Trek service selection
    node test/surface.test.mjs        # the streaming state machine
    node test/player.test.mjs         # locomotion in a sixth of a gravity
    node test/suit.test.mjs           # life support, and dust
    node test/rover.test.mjs          # driving
    node test/descent.test.mjs        # the landing, flown against gravity
    node test/ship.test.mjs           # the walkable interior and the airlock
    node test/audio.test.mjs          # the vacuum, on a stub Web Audio
    node test/save.test.mjs           # a round trip through the save file
    node test/track.test.mjs          # the recorder behind tracks and the map
    node test/achievements.test.mjs   # the log, against the real site data
    node test/gamepad.test.mjs        # sticks, deadzones and button edges
    node test/temperature.test.mjs    # the Diviner interpolation
    node test/exposure.test.mjs       # the analytic eye adaptation
    node test/keepout.test.mjs        # not landing on the historic hardware

Or all of them:

    for t in test/*.test.mjs; do node "$t" || break; done

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
Nothing else on the page reaches outward: the two typefaces are vendored under
`vendor/fonts/` rather than pulled from a CDN, so an offline session has type
and a loaded page has told nobody about it.

Tiles are built in Web Workers, and the cost of one is dominated by the crater
field. A tile only computes the bands between the source data's resolution and
its own vertex spacing, so a distant tile is nearly free and the expensive ones
are the handful under your boots. The worst case is a tile at the finest level
over ground whose only elevation is the 1.9 km global grid, where the range
spans nine octaves and the last of them is faded in rather than cut, so that
neighbouring levels do not disagree about the ground along the edge they share:
about 70 ms. Where a metre-scale stereo model has streamed in there is almost
nothing left to invent and the same tile costs 3 ms.

## Three ranges

The ship carries as much as you like, the rover carries days, and the suit
carries hours, so an expedition is a planning problem rather than a resource
grind. Propulsion energy is unlimited by design: nobody is mining anything here
in order to keep driving. What is limited is what the people inside need.

The rover's navigation console does the arithmetic Apollo did. Every traverse
they drove was planned under a walkback constraint: never further from the
lander than you could walk home on the consumables you were carrying. The
console shows that distance, and turns amber and then red as you approach it.
Beside it is a topographic map sampled live out of the heightfield the wheels
are on — shaded relief, warmed to amber past twenty-five degrees where the
traction limit on regolith at a sixth of a gravity actually bites, with the
ship, the waypoints and where you have been drawn on it.

## Dust

Three hours of walking coats the lower suit, and the cost is thermal before it
is anything else: Gaier 2005 records eleven per cent areal coverage doubling a
radiator's solar absorptance, so a coated suit in sunlight boils about forty
per cent more feedwater — nine hours of EVA becoming six and a half — and costs
nothing at all in shadow, because there is no sunlight to absorb. It comes off
at the vacuum point in the ship's vestibule and nowhere else; a recharge does
not clean anything, because a tank of oxygen would not. What does not come off
goes through the hatch with you, and the cabin says so in words on the shelter
panel. Nothing about it harms anyone. The honest version of dust mitigation is
a chore, not a penalty.

Boot prints and wheel ruts stay where you put them. There is no wind here and
no rain, so the only things that erase a mark are micrometeorite gardening and
the solar wind, both working on a scale of ten million years: what you leave,
you leave for longer than the species has existed. They are drawn darker than
the ground because compaction reduces the shadow-hiding in the porous top
layer, which is why Apollo boot prints photograph dark on grey and why the LRV
tracks are visible from orbit.

## Where you have been

`K` opens a log, and it is a list of real places rather than a list of tasks.
Nothing is scored and nothing in the game is gated on any of it. Landing sites
are earned against their published coordinates — all twenty-eight in
`data/sites.json`, from Luna 9 to Chang'e 6 — and named ground against the IAU
gazetteer. The terrain keeps its own records: the deepest and the highest
ground you have stood on, the steepest, the furthest you have been from the
ship. Distances are measured against what people have actually done, so 7.6 km
on foot is further than an Apollo crew walked in a day and 35.7 km driven is
further than Apollo 17 went, which is still the record on another world.

## What is still wrong

One known artefact, at the hardest place on the Moon to draw. With the Sun a
fraction of a degree above the horizon, as it is for most of the year at the
lunar south pole, what is lit and what is not is decided by differences in the
skyline of well under a degree. Each vertex carries eight horizon angles, one
every 45 degrees, and interpolating eight samples cannot resolve that: the
polar terminator comes out banded into columns rather than fingered. The
shadows are in the right places and the geometry underneath them is measured
LOLA topography at 36 m; the edges between them are quantised. Sixteen azimuths
would halve it and double the per-vertex cost, which is a trade worth measuring
before making.

## The pits, and the cave

Four collapse pits in the maria are drawn, and one of them has a cave under it.

An earlier version of this file said the opposite — that the pits could not be
drawn because the finest elevation over any of them is 118 m per pixel and
modelling them would mean inventing the shape of the one thing you came to see.
Both halves of that were wrong, and it is worth being specific about how.

The LROC Lunar Pits Atlas measured these pits off oblique NAC images and stereo
models and published the numbers; Wagner & Robinson did photogrammetry on six
of them. So the shape is published — it just arrives as a table rather than as
a raster, which is what this project builds from.

And the resolution claim was too broad. There is a stereo digital terrain model
of the Mare Tranquillitatis pit at **two metres per pixel**, `NAC_DTM_TRANQPIT1`,
with a relative vertical accuracy of 0.72 m, and there are equivalents over
Marius Hills and Mare Ingenii. What is actually true is the narrower thing:
NASA Trek, which is where this game streams its elevation from, serves nothing
better than 118 m/px at any of these coordinates. Vendoring that DTM would turn
the pit from DERIVED into MEASURED, and it is the most valuable thing left
undone here.

So `src/data/pits.js` fits an elliptical funnel-and-shaft profile to the atlas's
own dimensions and hands it to the height field as a one-metre patch, installed
when you come within thirty kilometres and dropped past fifty. It is labelled
DERIVED and never MEASURED, because a profile fitted to six numbers is not a
height field sampled off the Moon, and every value that is not straight off the
atlas page is named in that pit's `inferred` list.

| | across | to the floor | how you get in |
|---|---|---|---|
| Mare Tranquillitatis | 146 x 140 m | 125 m | fall, or fly |
| Marius Hills | 92 x 79 m | 40 m | fly |
| Southwest Mare Tranquillitatis | 100 x 80 m | 25 m | fly |
| West Marius Hills | 95 x 70 m | 16 m | **walk** |

West Marius is the one you can walk into: the atlas records a ramp of collapse
debris running from the rim to the floor on its south-west side, and at 23
degrees it is comfortably inside what a boot will hold. The other three have
walls that read 89 degrees against a 37 degree friction angle. Falling into
Mare Tranquillitatis arrives at 20 m/s, which is well past survivable; the
jetpack climbs back out of it in four seconds and about half its heat budget.

Under the west side of the Tranquillitatis pit floor there is a cave. In 2024
Carrer et al. showed that Mini-RF radar images of the pit carry an anomaly no
model of the pit alone reproduces, and that an unlit conduit below and to one
side of it does. It is the only cave on the Moon anyone has evidence for. Here
it is at least 45 m wide and drops at the published 45 degrees for the 30 m of
horizontal extent their best-fitting model has, reaching about 155 m below the
plain, with a roof at 55 degrees that comes down to meet the floor and ends the
passage. Forty-five degrees is too steep to walk back up, so bring the jetpack.

The west side is worth dwelling on, because the obvious answer is the other
one. The atlas describes the pit's visible floor as sloping down under the
**east** wall, which is exactly what a way in looks like from orbit. The radar
found the void under the **west** wall — and the reason is in the observation
rather than in the geology: the Mini-RF pass was taken looking left at an
azimuth of 270 degrees, due west, so the beam could only ever illuminate the
base of the far wall. The paper constrains a westward conduit and says nothing
at all about an eastward one. This game builds the one that was measured. An
earlier version of it built the east side, which was a reasonable reading of
the atlas and not what the paper found.

None of it has been seen. The overlay says DERIVED, names the paper, and says
the thing the paper says about itself: the radar cannot separate this geometry
from a second one it fits about as well, which would be a nearly level chamber
reaching some eighty metres instead of thirty. The 45 m width is a lower bound
rather than a measurement, because the width this method recovers saturates
against the real one.

The temperature readout changes when you go in, and this is the part worth
going for. Horvath, Hayne & Paige measured these pits with Diviner and modelled
the inside: a regolith pit floor near the equator can pass 420 K at noon, and
beyond the opening, in permanent shadow, the temperature holds at about 290 K —
seventeen degrees Celsius — through the entire lunar day and the entire lunar
night, while the surface a hundred metres above swings across three hundred
kelvin. Stand in the cave with the science overlay open and watch it read room
temperature.

Drawing the cave at all needed one piece of renderer surgery worth naming,
because it is the only thing in the project that works this way. A height field
is a single height per point, so it can describe a hole in the ground but never
a ceiling over one, and the pit's shaft wall is therefore drawn straight across
the cave mouth. Carving the wall away would stop the pit being the shape the
atlas measured. So the mouth is a stencil portal — a band of nothing standing
inside the wall that marks where the void is, after which the cave draws
ignoring the depth the wall wrote — and the renderer asks for a stencil buffer
for this and for nothing else.

What is deliberately not there: a walkable recess running round the pit under
the overhanging rim. The atlas measures overhangs of at least 10 to 15 m on
three sides of Tranquillitatis, but how much of that space is open void and how
much is talus is not published, and a ring of floor under the rim is a big,
prominent, invented room. The pit wall is a wall.

One thing about the pits is visibly wrong and is named here rather than fixed:
the imagery is mapped by latitude and longitude, so on a wall that is
eighty-nine degrees from horizontal a single column of texels is stretched over
a hundred and twenty-five metres. The shaft walls are therefore streaked
vertically. Fixing it means triplanar projection in the terrain shader, which
is a change to every surface in the game to improve four of them.

## Roadmap

Not in this version, and each one named rather than glossed:

**The Apollo 12 to 17 hardware.** You can fly to all six sites, stand on their
published coordinates and look at the real ground; what is not there is the
hardware. Apollo 11 was built object by object with a citation for every one
and an explicit note wherever a position is inferred, and the other five
deserve the same standard or none at all. Guessing where an ALSEP central
station sits because it would look right is exactly the thing this project
refuses to do.

**The NAC stereo DTMs over the pits, and the point clouds under them.**
`NAC_DTM_TRANQPIT1` at 2 m/px, plus `NAC_DTM_MARIUSPIT01` and
`NAC_DTM_INGENIIPIT`, are 32-bit GeoTIFFs on the LROC RDR archive; Wagner &
Robinson's pit-wall point clouds are CC BY 4.0 at doi 10.5281/zenodo.6622042.
None of them are on NASA Trek, which is why nothing streams them here.
Vendoring the DTMs would replace a profile fitted to six catalogue numbers with
the measured surface and turn the pit rows in `DATA_SOURCES.md` from DERIVED to
MEASURED. This is the most valuable single item on this list.

It would not fix everything, and the part it cannot fix is worth naming.
Wagner, Rowland & Robinson report the Mare Tranquillitatis shaft as about forty
metres of near-vertical wall above sixty metres of wall that flares outward at
twenty to forty degrees. That is an overhang a hundred metres tall, and a
height field cannot describe any of it. The shaft here is vertical for its
whole depth because that is the only thing the representation can say.

**SLDEM2015 at 59 m globally.** The reader and the registry entry are the work;
`src/data/surface.js` already handles scheduling, blending and provenance.

**Sato et al. 2014 per-pixel photometry.** The Hapke-like parameters here are
fixed and labelled ESTIMATED. Sato published resolved parameter maps, which
would turn an UNVERIFIED entry into a measured one.

**Sixteen horizon azimuths**, which would halve the polar banding above at
double the per-vertex cost — a trade worth measuring before making.

Also worth naming because the data is already in the repository: the coarse
levels of the vendored LOLA pyramid are built and shipped but never loaded.
Level 1 is 1.5 MB against level 3's 21 MB and would be enough to draw the globe
while the rest arrives, which is the progressive DEM load the loader is shaped
for and does not do. The GRAIL Bouguer anomaly is registered and not queried.
Carried equipment does not accumulate dust, though the suit and the rover do.

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
- The ship was standing on top of Tranquility Base, with the descent stage, the
  seismometer and the retroreflector scattered under its legs.
- The far side was made of sand dunes. The crater field stopped five bands below
  the source resolution, and where the only elevation is 1.9 km a pixel that put
  the smallest procedural crater at sixty metres across, so a hundred metres of
  ground held two enormous smooth bowls and nothing else. Rocks were missing for
  a related reason: they were gated on how good the elevation data was rather
  than on how close the tile was.
- The helmet lamps lit nothing. The terrain shader cleared every light's
  contribution and not just the Sun's, and three.js has already added the spot
  lights by that point.
- Turning them on then washed the frame white, because the exposure model did not
  know they existed: it adapted to a moonless night and opened eleven stops.
- Every shadow was pure black. There is no air to scatter light into them, but
  the sunlit ground next door bounces about a fortieth of what falls on it, which
  is why Aldrin is visible coming down the ladder. The astronaut himself stayed
  a silhouette for a round longer, because the first version of the bounce only
  lit the ground.
- The page pulled its two typefaces off Google's CDN, which is the one thing
  this repository's notes say not to do, and it was the console error every
  screenshot in the gallery was reporting.
- The caption told a player standing at Shackleton they were on the far side.
  The Earth is under the horizon there because the site is 90.2 degrees from the
  mean sub-Earth point; libration lifts it into view over the month.
- Shackleton's own preset was at the crater's centre, which is a floor four
  kilometres down that has not seen the Sun in a billion years. It photographed
  as a rectangle of black, which was true and was not a picture.
- The player was permanently getting up on rough ground, because a tile arriving
  at a finer level drops the surface a metre or two and that was read as a fall.
- And the one that was hiding all the others. Every tile's bounding sphere was
  inflated by the Moon's entire height range, 21 kilometres from the floor of
  the South Pole-Aitken basin to the far-side highlands. A level 17 tile is
  twenty metres across; a sphere ten kilometres tall around it puts its distance
  from any camera within ten kilometres at zero, so everything inside that
  radius refined to the finest level there is. Three hundred tiles of centimetre
  detail, seen from seven kilometres up, while the middle distance stayed coarse
  for want of a worker — and a straight bright line ran to the horizon along the
  boundary between the two. Bounding a tile by what the Moon can actually do
  over its own width, or by its parent's measured range once that is known, put
  the craters back across the whole landscape and cost half the tiles.
- Anywhere a NAC stereo model streamed in, the landscape came apart into
  floating slabs with the sky showing between them. Two separate causes. A
  worker takes a second or two to decode the vendored elevation pyramid, and
  any streamed raster arriving inside that window was dropped on the floor and
  never offered again, so the physics knew the ground at Tycho was at -3465 m
  while the workers went on drawing it at -3375 and the camera stood ninety
  metres inside the surface, looking up through it. And when a raster did
  arrive in time, the tiles it covered were deleted outright to force a
  rebuild — which takes the tile and all its ancestors out of the tree at once,
  because they cover the same ground. Old tiles now stay on screen until their
  replacements arrive, which is the rule everywhere else in the renderer.

## Sources

`DATA_SOURCES.md` is the dataset table the whole thing is built on: what each
one is, its resolution and coverage, what it controls in the game, and what it
cannot support. `RESEARCH.md` carries every constant with its citation, and an
explicit list of the things that are still unverified.

The Moon is more interesting than anything anyone would invent to replace it.
That is the entire design brief.
