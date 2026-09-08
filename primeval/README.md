# PRIMEVAL

You are alone on **THERA**, an alien world that converged on the Mesozoic and
kept going. Your base is on **ANVIL**, its moon. Between the two is a
single-stage lifter called the **HALBERD**, and everything you need is on the
wrong side of it.

The loop is: fly down, survive long enough to be useful, fly back, come back
better armed. The first time you go down you have a bow. The last time you go
down you are wearing four metres of powered armour and you are looking for
something specific.

**Live:** https://daxjdavis526.github.io/Projects/primeval/

Desktop only — keyboard and mouse, pointer lock. Click **ENTER THE STATION**,
then click the canvas whenever you need to recapture the mouse.

---

## The opening

You start standing in the observation lounge of ANVIL Station with THERA
filling the window. Walk out through the corridor, past the sealed armoury and
the empty exosuit cradle, cycle the airlock, cross the pad, and board the ship.

Then fly it down.

## Controls

### On foot

| | |
|---|---|
| `W A S D` | move |
| `Shift` | sprint (costs stamina) |
| `Space` | jump · `C` crouch |
| `Mouse` | look · `LMB` use · `RMB` aim |
| `E` | interact — board, harvest, loot, recover arrows, use terminals |
| `Q` | hold to scan whatever the crosshair is on |
| `F` | headlamp |
| `R` | vent weapon heat |
| `Tab` | field pack — click an entry to eat it |
| `1` `2` `3` | bow · SUNDER · scanner (mouse wheel cycles) |
| `Esc` | pause |

### HALBERD

| | |
|---|---|
| `W` `S` | throttle up / down |
| `A` `D` | roll · mouse pitch and yaw |
| `Space` | vertical thrust · `C` descend |
| `Shift` | afterburner |
| `R` | toggle vectored (VTOL) and aerodynamic modes |
| `G` | landing gear · `F` landing lights · `V` cockpit / chase |
| `Tab` | transit burn to the other world — needs vacuum, alignment and throttle |
| `B` | deploy the exosuit onto the surface (once you have one) |
| `E` | disembark (landed only) |

Gear down is drag. Gear up is a belly landing. The ship will tell you which
one you just did.

### BASTION exosuit

| | |
|---|---|
| `W A S D` + `Shift` | run — it is faster than you are |
| `Space` | jump; hold in the air to burn boost |
| `LMB` | shoulder cannon (heat) · `RMB` punch |
| `R` | vent · `V` cockpit / chase · `E` dismount |

Land hard from height and everything within nine metres takes the impact.

## Survival

Three numbers: **health**, **hunger**, **stamina**. Hunger drains slowly and
faster when you sprint or swim; at zero it starts taking health. Food exists
in the world rather than in a menu — walk to a berry bush and press `E`, shoot
a Dartleg and butcher it, catch a Glimmerfin in the shallows. Raw meat works
and costs you a little health; the ship's galley and the station cook it
properly.

Arrows are recoverable. They stick where they land, including in things that
are still moving, and come back out when you butcher the carcass.

## The bestiary

Eleven species, all original, none of them a licensed dinosaur:

| | |
|---|---|
| **TITANOSPINE** | 26 m sauropod. Will not notice you. That is the danger. |
| **CRESTWAIL** | Herd browser. Their alarm call crosses four kilometres. |
| **IRONBACK** | Armoured, club-tailed, does not run. Rotates and waits. |
| **PALISADE** | Horned, territorial. One warning, then it commits. |
| **DARTLEG** | Two kilos of muscle and panic. Your first successful kill. |
| **SICKLERUNNER** | Pack hunter. The one you can see is not the problem. |
| **FENSTALKER** | Swamp ambusher. Four heartbeats a minute while it waits. |
| **ASHMAW** | Nine-tonne apex theropod. An arrow will annoy it. |
| **DREADCROWN** | One is alive on this continent. Bring the exosuit. |
| **GLIMMERFIN** | River fish. The most reliable calorie on the planet. |
| **SKYLANCE** | Six-metre pterosaur riding the volcanic thermals. |

They graze, drink, sleep, call, investigate noises, flee, defend ground and
hunt each other. Predators do not know where you are — they build awareness
from sight (a cone, cut down by jungle cover and by darkness) and from hearing
(no cone, and it works through the trees). Crouching is quieter. Sprinting is
not. Awareness decays if you break contact, which is why a Sicklerunner will
sometimes lose you and go back to what it was doing.

At night their eyes catch the light before the rest of them does.

## Architecture

No build step. Static ES modules, an importmap, and a vendored three.js.
`python3 -m http.server` from the repository root and open `primeval/`.

```
src/
  game.js            scene, clock, locale, mode; the frame
  main.js            boot, quality presets, pause
  fx.js              pooled beams, flashes, sparks, dust
  missions.js        three jobs and what each unlocks
  math/noise.js      simplex, fbm, ridged, hashes — no DOM, no three
  world/
    field.js         THERA as pure maths: continents, ranges, rivers,
                     volcanoes, climate, biomes
    moon.js          ANVIL as pure maths: mare, rilles, craters
    terrain.js       quadtree LOD over a 1048 km root, pluggable sampler
    textures.js      every surface, baked on the GPU at boot
    shaders.js       shared curvature, wind and aerial-perspective injections
    sky.js           analytic sky, stars, celestial bodies, day/night
    water.js         ocean plane plus a streamed river mesh
    props.js         parametric plants and rocks
    vegetation.js    instanced scatter, streamed nearest-first
    poi.js           crashed probes, fossil beds, crystal vents, nests
    weather.js       wind, storms, lightning, fog, volcanic plumes
    base.js          ANVIL Station: rooms, doorways, colliders, the window
    vehicles.js      ship, station and exosuit wiring
    install.js       registers the systems onto a Game
  life/
    anatomy.js       numbers in, rigged SkinnedMesh out
    species.js       the bestiary
    creature.js      gait, senses, state machine
    ecology.js       population streaming, predation, alarm propagation
  ship/
    model.js         the HALBERD, lofted from cross-sections
    ship.js          flight model, reentry, cockpit displays
    space.js         surface → orbit → transit → the other world
  player/
    player.js        first-person controller and survival
    physics.js       yaw-aligned box colliders
    inventory.js     items and eating
    gear.js          equipment, scanning, the E key
    bow.js  rifle.js  mech.js  mechmodel.js
  audio/audio.js     every sound, synthesised
  ui/hud.js          the only file that touches the DOM for the HUD
tools/
  bestiary.html      any species on a turntable, with a metre stick
  hangar.html        the HALBERD and the BASTION, with gear/ramp/burn toggles
test/
  run.mjs            node primeval/test/run.mjs
```

### How the world is stored

It isn't. The ground is an analytic function of `(x, z)` — domain-warped
continents, ridged multifractal ranges, carved river channels, volcano cones
with calderas, and climate fields for moisture and temperature. Nothing is
saved for a place you are not standing in, and the tree you walked past is the
same tree when you walk back because its position is a hash of its cell, not a
row in a table.

Rendering is a quadtree over a root 1048 km across, subdivided toward the
camera down to 64 m leaves. Collision does not use the mesh at all — it calls
the same height function the mesh was built from.

### How the surfaces are made

Nothing is downloaded. At boot a fullscreen shader renders soil, turf, rock,
sand, snow, ash, regolith, bark, reptile hide, a four-cell ground-accent sheet
and an RGBA foliage atlas into render targets, and derives a normal map for each
from central differences of the same height function that produced the albedo.
The noise wraps on a lattice period, so every tile is seamless.

The ground is splatted per vertex — turf, soil, one of four accents, and rock
projected triplanar on anything steep — sampled at two scales with the second
octave rotated, because two axis-aligned octaves share a grain direction and an
open field then reads as corduroy. Biome colour is applied as a hue tint over
the texture rather than as the albedo itself, and a half-kilometre noise drifts
patches toward dry straw and damp olive.

Plants are alpha-cut cards from the foliage atlas: leaf clusters with outward
normals so a canopy lights as a soft mass, fronds cupped across their section so
they still present something when seen edge-on, and grass blades drawn bold
enough to survive the mip chain. Creature hide is sampled triplanar in bind-pose
object space, which is the one projection that stays glued to the skin through a
gait cycle.

Fog is not three's flat exponential fog. Haze pools in low ground, thins with
altitude, and mixes between a cool colour and a warm one along a forward-scatter
lobe around the sun, so looking into the light and looking away from it are
different pictures. The post chain runs on a multisampled half-float target;
without MSAA a jungle of alpha-tested leaf edges crawls.

### How you get to the moon

There is only ever one flat world under you. Above about 21 km the ground
fades into haze and a sphere fades in behind it, sized by `asin(R/(R+h))`, so
climbing out looks like climbing out. The crossing itself is a timed burn with
a real countdown — long enough to feel like a distance, short enough that you
will do it more than once. Coming down runs the same band in reverse, inside a
layer of atmosphere you cannot see through anyway.

### The animals

Each one is a single `SkinnedMesh` built at load from a row of numbers: a
spine running tail-tip to skull, a neck, a jaw, and two or four legs whose
segment lengths are rescaled so the toes land exactly on the ground whatever
posture the species asks for. There are no animation clips. The gait is a
function of speed, the tail is a travelling wave, and the neck aims the skull
at whatever the animal is currently thinking about.

`tools/bestiary.html` renders any of them on a turntable next to a twenty-metre
ruler. That page is how the leg posture got fixed.

### The sound

There are no audio files. Wind, rain and rivers are filtered noise beds.
Creature voices are detuned oscillators through a formant chain and a
waveshaper, with a pitch envelope. The rifle is an FM sweep. Thunder is a noise
burst with a very long low tail and a delay set by the distance to the strike.

The distance model is the point. A roar 500 m away and a roar 20 m away are the
same synthesiser — the far one just has more air in front of it: low-passed
by an exponential absorption curve, and sent much harder into a reverb.

## What is real, and what is not

Honesty is the house style, so:

**Real enough to defend**

- The height field is a genuine procedural planet. Rivers run downhill because
  their surface is derived from a smoothed elevation field, not painted on.
- Reentry heating scales with air density times velocity cubed, which is the
  right shape even if the constant is chosen by eye.
- Predator senses are modelled as separate sight and hearing channels with
  their own ranges, cones and falloffs, and awareness that decays. You can lose
  something by breaking line of sight and going quiet, and that is a real
  simulation result rather than a scripted state.
- The animals' proportions and gaits come from their stated mass and limb
  lengths. A Titanospine accelerates like forty tonnes.

**Frankly approximated**

- **The planet is not a sphere.** It is a flat height field with a curvature
  term in the vertex shader that bends distant geometry over a 420 km horizon.
  You can walk 500 km in a straight line and never notice, which is the whole
  point, but the map does not wrap.
- **The crossing to ANVIL is compressed.** 402,000 km in thirteen seconds. The
  countdown is honest about the distance; the clock is not.
- **Orbits do not exist.** THERA and ANVIL hang on fixed bearings. There is no
  Hohmann transfer, no launch window, no orbital mechanics of any kind.
- **Gravity is a constant** per world. No inverse square, no altitude falloff.
- **The atmosphere is one exponential** with a scale height picked to make the
  climb feel right, not to match any particular composition.
- **Vegetation is instanced scatter, not ecology.** Plants do not grow, spread,
  compete or get eaten. Trees are solid cylinders for collision purposes and
  have no branches you can climb.
- **Water is a shader.** The ocean is a plane; rivers are a streamed mesh
  following an analytic surface. There is no flow simulation, no erosion, and
  the waterfalls you will find are steep sections of river surface rendered
  with a lot of foam, not falling water.
- **Caves are not enterable.** The height field is a heightmap; it cannot
  overhang. Cave mouths are dressing.
- **The Dreadcrown is not really unique.** One at a time, in the volcanic
  country. Kill it and the world will eventually produce another.

## Performance

Three presets on the title screen. `PERFORMANCE` drops render scale to 0.72,
halves the vegetation and turns off bloom; `ULTRA` roughly triples the plant
count and pushes terrain detail out much further. Changing preset reloads the
page, because the shadow map size and render targets are allocated once.

The expensive things are, in order: vegetation instance count, terrain patch
count, and shadow map resolution. If it stutters, drop a preset before
anything else.

## Tests

```
node primeval/test/run.mjs
```

74 assertions over the height field, the bestiary, the props and the collision
helper — no browser, no GPU. It bootstraps a gitignored `node_modules/three`
that re-exports the vendored bundle so node can resolve the same bare
specifier the browser resolves through the importmap. Nothing is downloaded.

The suite exists because two of the worst bugs in this project were invisible
in a stack trace: a `Math.pow(-1e-8, 0.62)` that quietly filled a forest with
`NaN`, and a floor slab that spent an afternoon shoving the player across the
observation lounge because gravity dips you a few millimetres into the ground
every frame.
