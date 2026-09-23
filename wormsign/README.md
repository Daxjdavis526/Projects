# WORMSIGN

A sandworm-riding game. You cross an enormous desert on foot, try not to be
heard, plant a caller to bring a worm in, get onto it as it passes, hook in,
and ride it for kilometres — or you run carelessly across open sand and get
eaten. It is a fan game inspired by *Dune*; all code, geometry and sound are
original and procedural, and nothing is taken from any Dune game or film.

Written in Rust (Bevy 0.19), compiled to WebAssembly, played in the browser.

Live: https://daxjdavis526.github.io/Projects/wormsign/

Desktop only: keyboard and mouse, and a browser with WebGL2 (any current
Chrome, Edge or Firefox). Sound needs one click or key press first; it is
made for headphones.

## Controls

| | |
|---|---|
| click | capture the mouse (Esc to release and pause) |
| mouse | look |
| W A S D | walk |
| Shift | run |
| Space | jump |
| C (hold) | crouch |
| Q (hold) | **sandwalk** |
| V | first / third person |
| K | cinematic camera: a slow orbit, for watching |
| mouse wheel | third-person distance |
| T | plant a worm caller, or pick one up again |
| left / right mouse (or Z / X) | throw a hook, or let that hook go |
| R / F (hold) | reel in / pay out |
| E | let go of both hooks |
| G | switch between bracing on the ropes and walking the back |
| riding, braced: A / D | pry to turn left / right |
| riding, braced: W / S | drive it on / ease off |
| riding: Space | jump clear |
| 1 / 2, 3 / 4, 5 / 6 | look sensitivity, camera shake, field of view |

## How to play

**Worms hunt by vibration.** Everything your feet do goes into the sand.
Standing still puts in nothing. Walking is a steady, moderate beat that
carries a few hundred metres; running is a loud, steady beat that carries
most of a kilometre. A worm that hears a rhythm turns toward it, and the
closer it gets the better it knows where you are.

**Sandwalking** (hold Q) is a deliberately broken gait: steps at irregular
intervals, softer, with the body lurching forward on each one. It is quieter
*and* arrhythmic, which is what a worm listens for. It is not invisibility —
sandwalk right over a worm and it will hear you, it just won't find you very
interesting.

**Rock is refuge.** Worms cannot pass through the rock islands, and footsteps
on rock barely couple into the ground. A worm hunting someone on a rock
circles it.

**A worm caller** (T) drums the sand at a steady beat. Worms many kilometres
away hear it, and one that locks onto it comes at full speed: from the usual
couple of kilometres, expect it in a minute or so. The build-up as one comes: a low rumble you feel before you
hear, the ground starting to shake, a plume of dust on the horizon, and then
the mound of sand racing toward the caller. It rears up, takes the caller,
and lopes on past with its back out of the sand. That is your chance.

**Getting on** is physical. Nothing snaps you into place. Run alongside, throw
a hook into its flank, and the rope drags you in; jump up onto the back and
set the second hook. Landing on something moving that fast is a slide, not a
landing — the hooks are what keep you on. The back is curved and slick: past
about 26° you slide, and a rolling worm sweeps you toward its flank.

**Riding.** Braced on the ropes (G switches), A and D pry at the rings on one
side and it turns that way — slowly, through its own enormous inertia; it
never turns like a car. Hooks near the head give more leverage, and a hook on
the side you are turning toward does most of the work. W drives it on, S lets
it ease off. Leave it alone and after a while it starts to go down, and a
diving worm tears your hooks out. Pry too hard for too long and it gets
angry, and rolls to throw you off. Crouching grips better.

**Being eaten** is not a fade to black. It is on screen, in slow motion.

## What is running

The game is two crates:

- **`crates/core`** — everything that decides what happens, with no engine
  in it: the desert's height function, the terrain level-of-detail plan,
  the player's body, footstrikes, the vibration model, the worm's body and
  brain, hooks, the figure's animation and cloak, the ragdoll, the baked dune
  shadows. 84 tests, run with `cargo test -p wormsign_core`,
  including whole-game scenarios on the real terrain: a sprinter gets eaten,
  a sandwalker walks past a worm unnoticed, someone standing still is left
  alone, and a scripted player runs alongside a worm, hooks it, climbs on and
  rides 4.7 km without touching sand.
- **`crates/game`** — the Bevy app: streaming the terrain, drawing the worm,
  cameras, effects, sound, input, the HUD.

### The desert

Height is a pure function of position. Dunes are an asymmetric profile — a
long windward slope and a short slip face — laid along a prevailing wind with
their phase bent by noise so the crests wander and break into crescents;
smaller dunes run across them on a second wind; a large-scale region field
opens the dune seas into plains; rock islands sit on a sparse random grid.
Walking and worms query the function directly, so collision is exact
whatever mesh happens to be drawn.

What is drawn is a quadtree of tiles, all with the same vertex count: 4 m
spacing where you stand, 256 m spacing on the horizon, about 80–160 tiles
out to roughly 25 km, with skirts hiding the seams between levels. Tiles are
built a few milliseconds per frame, nearest first, and an old tile is only
removed once everything replacing it is ready, so there are no holes and no
pauses. Positions are kept in 64-bit world coordinates and the render origin
jumps to follow you, so a 40 km ride does not jitter.

### Vibration

Every footstrike, landing and caller blow is an event with an energy, a
frequency and a coupling to the ground. What a worm receives falls off with
two-dimensional spreading and with absorption that is stronger at high
frequency, so deep thuds outrun footsteps. A worm groups what it hears into
sources by where it *thinks* each came from — its estimate is noisy, worse
when the signal is faint — and scores each source's rhythm from how much the
gaps between events vary. Interest is accumulated signal weighted by rhythm.
Nothing in the game says "the player is running"; the worm only ever sees
the events.

### The worm

The head is steered like something with enormous mass: limited
acceleration, a turn rate that can only change slowly, and a turning circle
that widens with speed. Every metre it records where it has been, and each
part of the body is placed at its arc length along that record, so the whole
animal flows along one line — turns sweep back down the body, and a breach
ripples along it. It rides the terrain at a depth, so it climbs over dunes
and dives down their faces, and the body behind repeats the climb.

Its brain: roaming, investigating, tracking, charging, the attack (rear up,
then bring the open mouth down to ground level on where it thinks you are),
the pass, searching, and being ridden. It looks ahead along the arc it would
actually fly and steers off any that would clip rock.

The sand heaped over a shallow worm is the same function for drawing and for
standing on: you can be lifted by the mound of a passing worm.

### The sand

The sun is fixed, low (18°), so dunes throw long shadows. The shadow map only
reaches 800 m (WebGL2 gets one cascade), so beyond that each terrain vertex's
view of the sun is baked when its tile is built — a march toward the sun over
the height function, reusing a shared lattice of samples so a tile costs a few
milliseconds — and the sand shader darkens by it. Up close the shader adds
what a flat colour cannot: wind ripples at two scales (about 0.3 m and 1.9 m)
running across the wind and fading out on slip faces, which avalanche smooth;
colour mottling at 2, 19 and 230 m; paler crests and darker, redder troughs
from the surface's curvature; strata on rock; and the odd glinting grain.
All of it is anchored to world coordinates, so nothing swims as the render
origin moves.

### The figure

A Fremen in a stillsuit, built from lofted meshes — each segment a sweep of
elliptical sections, tapering and flattening like the body does — to Drillis
& Contini's segment proportions for a person 1.78 m tall. The suit is ribbed,
with catchpockets on the thighs, a catchtube from the collar to a mask over
mouth and nose, boots and gloves; a belt with pouches and a crysknife; a
harness with the caller and two maker hooks on the back (they leave it when
thrown); a hood; and a long cloak that is a simulated cloth, pinned round the
shoulders, pushed off the body and legs, lifted by the wind. The costume is an
original design from the novel's description, not any film's.

It is animated procedurally, from what the simulation is doing, with no
canned clips. One gait cycle runs at the cadence of the real footstrikes (the
same ones the worm hears), nudged into step by each of them. A planted foot
stays exactly where it landed — no skating — and rolls up onto its ball as
the body passes; the swinging foot is aimed at where it will land, predicted
from the body's velocity, on the real ground height. Two-bone IK does the
legs. Walking vaults over a stiff leg; running loops the heel up toward the
seat and drives the knee through, with both feet off the ground between
steps; sandwalking is low and wary; crouching creeps. The hips bob, sway and
sink to let a leg reach, the spine leans and counter-twists, arms swing
against the legs, the head looks where you look. Throwing a hook winds up and
whips; planting a caller reaches down; riding braces wide with both hands on
the ropes. First person sees out of the figure's own head. When a worm takes
you, the ragdoll takes over this same figure, torn limbs and all.

`cargo run -p wormsign_core --example gait_svg > gaits.svg` draws every gait
side-on, for looking at the animation without a browser.

### Sound

All synthesised with Web Audio. The wind is two voices, one each side of your
head, made from brown and pink noise: a low body, a resonant band that sweeps
up in gusts (the whistle over a crest), and sand-grain hiss that only comes in
with the strongest gusts. Gusts are a slow random process with occasional
fronts; the wind is louder up on crests, rushes past you when riding, and
ducks under a worm's rumble. Parameters change a few times a second with
bounded automation, so the audio graph stays small however long you play.

## What is physical and what is not

Blunt, as usual.

- **Invented, not physics.** There are no sandworms. Their size (320 m long,
  22 m across; the rare giant 900 m by 60 m), speed (to 36 m/s), turning,
  hearing range and behaviour are designed to make a good animal to hunt
  with and ride, not derived from anything.
- **The vibration model** has a physical shape — geometric spreading plus
  frequency-dependent absorption — but its constants are tuned for play. Real
  footsteps on sand are detectable by seismometers at tens of metres, not
  hundreds.
- **Dune shape** is right in kind: asymmetric, slip faces near the angle of
  repose, barchan-like crescents where the crest breaks. It is not a
  simulation of sand transport; it is a function.
- **Sand** does not flow. Slip faces and the worm's heap are heights, not
  grains. The walker slides on anything steeper than about 33° (loose dry
  sand's angle of repose), which is the one granular fact it respects.
- **The rider** is a kinematic body with friction against a moving surface,
  held by one-sided rope constraints. That part is honest physics. The worm
  is not a physics object: it is kinematic and does not feel the rider's
  weight, and "prying" is a designed control, not a force on real tissue.
- **The ragdoll** is a Verlet particle skeleton. It is thrown, dragged and
  torn plausibly; it has no muscles and no mass distribution to speak of.
- **The figure's animation** is procedural kinematics, not dynamics or motion
  capture. Proportions are real (Drillis & Contini); the gait timings (stance
  about 60% of a walking stride, under a third of a running one, a flight
  phase when running) are in the right range; nothing balances, and the body
  has no mass. Feet plant on the height function, so they sit on slopes, but
  there is no deformation of the sand under them beyond the footprint decals.
- **The cloak** is a coarse Verlet cloth (13 × 11 particles) with no
  self-collision; it can fold through itself in a hard turn. The wind on it is
  a simple drag toward a gusting wind velocity.
- **Dune shadows** past the shadow map are per-vertex, so they are soft and a
  little coarse at a distance, and the sun never moves. The ripples are
  shading on a smooth surface, not geometry: they vanish at grazing angles.
- **The wind** is filtered noise shaped to sound like wind, not a recording
  and not a model of air over sand.
- **The sky** is painted, not scattered. Bevy's physical atmosphere needs
  compute shaders, which WebGL2 does not have.
- **Missing**: heat haze, sandstorms, day and night, a photo mode, a gamepad, and sound
  off the web (the native build is silent). Footprints fill in after a
  while rather than being blown over.

## Building it

```
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli --version 0.2.128 --locked   # must match Cargo.lock
./build-web.sh            # release build into dist/
./build-web.sh --dev      # faster to compile, slower to play
cd dist && python3 -m http.server
```

`cargo test -p wormsign_core` runs the tests; no browser needed.

URL flags for testing: `?debug` (state readout, vibration rings, no title
card), `?noshadow`, `?ride` (start on a worm's back, hooked in),
`?worm=<m>` (put a worm that far ahead; with `wormattack` it is already
lunging at you, `wormhold=speed,depth,mouth` pins it), `?dist`, `?pitch`,
`?yaw`, `?view=first`, `?go=walk|run|sandwalk|crouch` (keep moving
forward in that gait), `?camyaw` (swing the third-person camera round the
figure without turning it).

## Repository note

Unlike every other project here, this one has a build step. What GitHub
Pages serves is still just static files: `dist/` holds the built page and
WebAssembly, committed at milestones rather than on every change, because a
new build is a new multi-megabyte binary in the history. `target/` is not
committed.
