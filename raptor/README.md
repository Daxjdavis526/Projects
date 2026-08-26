# RAPTOR — F-22A flight simulator

A browser flight simulator built around a six-degree-of-freedom flight model,
a streamed world at true Earth scale, and audio that respects the speed of
sound. First person and third person are the same simulation: you can fly an
entire session from either, and the physics never knows which camera is on.

Live: https://daxjdavis526.github.io/Projects/raptor/

Desktop, keyboard + mouse or a game controller. No build step, no dependencies
beyond a vendored copy of Three.js.

---

## Getting airborne

You start lined up on runway 03 at Nellis AFB, north-east of Las Vegas.

1. **Shift** to run the throttle up. Past 100% the afterburners light.
2. Hold the centreline with **Q**/**E** (nosewheel steering).
3. At about 150 knots, ease back on **S**. She flies off at around 180.
4. **G** to raise the gear, then climb.

At 40,000 ft she will hold Mach 1.1 on military power — no afterburner, which
is the whole point of the aeroplane. Firewall the throttle and she will run
out past Mach 2.

Press **/** at any time for the full control list, **Tab** for settings.

## Controls

| | |
|---|---|
| Pitch / roll | `W` `S` `A` `D` (or a controller's left stick) |
| Rudder, nosewheel steering | `Q` `E` |
| Throttle | `Shift` / `Ctrl` — past 100% is afterburner |
| Wheel brakes | `Space` |
| Speedbrake | `B` |
| Landing gear | `G` (or click the gear handle in the cockpit) |
| Trim | `[` `]` |
| Mouse as a centre stick | `J` |
| Autopilot / fly the waypoint | `F` |
| Cameras, forward and back | `C` `V` |
| Cockpit ⇄ chase | `` ` `` |
| Direct camera select | `1`…`0` |
| Orbit the camera / look around | drag |
| Zoom | wheel |
| Recentre the view | `X` |
| Drop a ground observer | `O` |
| World map, set a waypoint | `M`, then click |
| HUD full / minimal / off | `H` |
| Weather | `K` |
| Advance time three hours | `N` |
| Time acceleration | `T` |
| Pause | `P` |
| Audio | `U` |
| Restart on the runway / airborne | `R` / `Y` |

A gamepad is picked up automatically. The input layer is an axis abstraction
(`src/input.js`) rather than direct key reads, so a HOTAS can be bound to it
without touching anything downstream.

## Cameras

Eleven of them, and every one is a way to fly rather than a replay view:
cockpit, chase, close chase, distant chase, free orbit, cinematic, flyby,
wing, nose, tail, and a ground observer you can plant anywhere.

The chase cameras are spring-damped and lag under acceleration — the offset
blends between aircraft-fixed and velocity-aligned so that loops and rolls
stay readable, and the roll is only partly followed so the horizon keeps
meaning something. They will not clip through the ground, and terrain
streaming is driven by the *camera*, not the aircraft, so orbiting or zooming
never reveals unloaded ground. Distance, stiffness, lag, field of view, shake
and sensitivities are all adjustable and are remembered between sessions.

The ground observer is the one to try first. Plant it with `O`, then fly a
supersonic pass over it.

## What is actually simulated

### Flight model — `src/aero.js`

Full 6-DOF rigid body: position, velocity, quaternion attitude and body rates
integrated at 240 Hz, independent of frame rate. Forces come from

```
L = ½ ρ V² S C_L        D = ½ ρ V² S C_D
```

with the lift coefficient built from a linear slope, a Prandtl–Glauert
compressibility factor, a soft stall, and a flat-plate branch beyond it. Drag
is parasite + induced (`C_L² / π A e`) + a transonic wave-drag rise that peaks
just past Mach 1 + gear + speedbrake + sideslip. Moments use conventional
stability and damping derivatives (`C_lp`, `C_mq`, `C_nr`, `C_nβ`, `C_lβ`) and
the full inertia tensor, cross-coupling terms included.

You cannot rotate this aeroplane like a free camera. Turns need aerodynamic
force, controls go soft at low speed, and at high dynamic pressure the control
laws — not the surfaces — are what limit you.

### Control laws

A fly-by-wire layer sits between the stick and the surfaces, which is how the
real aircraft works. Neutral stick commands one g and holds the flight path;
full aft stick commands about 30° of angle of attack. The two loops blend with
dynamic pressure — angle of attack at low speed, load factor at high — with a
9 g limiter, an angle-of-attack limiter and a bank-angle hold. On the wheels
the laws hand the stabilators straight to the pilot, because a load-factor
command loop cannot converge when the gear is carrying the aeroplane.

### Thrust vectoring

Pitch-axis only, as on the real jet. Its authority scales with `1 - q̄/9000`,
so it is worth very little at high speed and is doing most of the work at low
speed and high alpha. It is not magic: it is thrust × sin(nozzle angle) × a
5.2 m arm, and when the engines are at idle it does nothing. The nozzles
visibly vector in the exterior views.

### Engines — `src/engine.js`

Two F119-class afterburning turbofans, modelled separately. Spool lag (about
2.4 s idle to military), an augmentor that lights and dies much faster than
the core spools, thrust that lapses with density and recovers with ram above
Mach 0.55, and fuel flow that roughly triples in afterburner. The MFD shows
N1, EGT, thrust and fuel flow per engine.

### Atmosphere — `src/atmosphere.js`

The International Standard Atmosphere, layer by layer, to 84 km: temperature,
pressure, density and speed of sound. Wind is a surface layer shearing into a
jet-stream core near 10 km, plus three octaves of drifting turbulence, so your
ground track and your heading are not the same thing when it is blowing.

### Sonic booms — `src/audio.js`

This is the part worth explaining. Exterior listeners do not hear the aircraft
where it is; they hear it where it *was*. Every frame the engine solves the
retarded-time equation

```
|L − P(t)| = c · (now − t)
```

for the position `P(t)` whose sound is arriving at the listener `L` right now.
That single solution gives, for free: the correct propagation delay, Doppler
from the source's motion along the line of sight at the moment of emission,
distance attenuation, and — above Mach 1 — an aeroplane that arrives before
its own noise.

The boom itself is not a sound effect triggered at Mach 1. The Mach cone is a
surface moving through the world, and a listener hears the boom when that
surface reaches them, with an overpressure that falls off with distance. In
the cockpit you hear nothing, because you are inside the cone. Plant a ground
observer and go supersonic overhead: the jet passes in silence, and the
double crack arrives seconds later.

The Mach angle drawn in the exterior views is the real one, `μ = arcsin(1/M)`.

### Audio generally

Nothing is a recorded sample. The engines are additive synthesis driven by fan
speed — blade-passing tones over a filtered-noise core, with a shaped
broadband roar for the augmentor. Wind is filtered noise driven by dynamic
pressure. Inside the cockpit everything is muffled and close; outside it is
delayed, Doppler-shifted, panned and progressively stripped of high
frequencies by air absorption. Under g you hear yourself breathing.

### World — `src/terrain.js`, `src/world.js`

The world is a local tangent plane at true Earth scale, centred on Nellis:
Los Angeles really is 370 km away and it really does take a few minutes at
Mach 1.5. A floating origin keeps 32-bit GPU coordinates honest.

Terrain is a geometry clipmap — concentric rings of tiles whose size doubles
each LOD level, rebuilt on a per-frame budget so streaming never stalls the
frame. Elevation is procedural but geographically anchored: the Sierra Nevada,
the Spring Mountains, the Wasatch Front, the Panamints and the Transverse
Ranges are placed on their real lines, the Colorado Plateau and Great Basin
are lifted, the Californian coastline runs where it should, and twelve real
airfields are flattened along their real runway headings. Earth curvature is
applied in the vertex shader, so from 40,000 ft the horizon is visibly round
and distant ground genuinely sinks below it.

Cities are procedural building fields on a street lattice, denser and taller
toward their centres, with a night glow visible from altitude.

### Sky, cloud and weather

The sky is analytic Rayleigh + Mie single scattering with proper optical
depths, so it reddens at sunset, darkens toward black as you climb out of the
atmosphere, and puts stars out in daylight above about 11 km. Sun and moon
positions come from the solar declination and hour angle for your latitude and
the day of the year.

Clouds are three layered fields of lit billboards — cumulus, altostratus and
cirrus — plus towering cumulonimbus in storms, streamed in cells around the
camera. You can fly into them and lose the horizon. Seven weather presets
drive coverage, visibility, humidity, wind, turbulence, precipitation and
lightning, and they cross-fade rather than cut. Lightning lights the cloud
volume and the aircraft, and its thunder arrives late, by distance.

### Condensation

Vapour appears when the air is actually moist enough and the flow is actually
doing something: a transonic cone around Mach 0.98, wing-root and LEX vapour
above about 3 g or high alpha, wingtip vortex ribbons, and contrails only in
the 7.5–13.5 km band where contrails form.

### G-effects

Grey-out builds above about 5.5 g and red-out below −1.5 g, with a slow onset
and a slower recovery, and it is drawn only in the cockpit — third person does
not blur the screen because your eyeballs are not in the aeroplane. What third
person gets instead is more camera vibration, more vapour, and control
surfaces you can watch working.

## Honest limits

- The real aircraft's aerodynamic coefficients and flight-control laws are
  classified. Everything here is built from open-literature geometry, mass and
  thrust figures plus generic fighter aerodynamics. It is a plausible
  twin-engine supercruising fighter, not a reproduction of a specific one.
- Terrain is procedural. The mountain ranges, plateaus, coastline and airfields
  are anchored on real coordinates, but the ground between them is invented.
  Runway layouts are simplified to a single runway, a taxiway and an apron.
- Clouds are billboard-based, not ray-marched volumetrics.
- There is no other traffic, no ATC and no weapons.
- Sonic-boom overpressure uses a simple distance law, not a full ray trace
  through the atmosphere.
- Aeroelasticity, ground effect and engine damage are not modelled.

## Source layout

```
src/
  main.js          loop, wiring, key bindings
  config.js        aircraft and simulation constants
  aero.js          6-DOF flight model, control laws, gear contact
  engine.js        twin turbofans
  atmosphere.js    ISA, wind, turbulence
  terrain.js       clipmap streaming, elevation, biome colour
  world.js         floating origin, geodesy, airfields, cities
  scenery.js       runways, lighting, procedural cities
  sky.js clouds.js water.js weather.js
  aircraft.js      procedural F-22 with animated everything
  effects.js       plumes, vapour, vortices, contrails, Mach cone
  cameras.js       eleven camera modes
  cockpit.js       cockpit structure and live MFDs
  hud.js           conformal HUD, flight path marker, g-effects
  nav.js           world map, waypoints, autopilot
  audio.js         synthesis and acoustic propagation
  input.js         keyboard, mouse, gamepad, HOTAS-ready axes
```

Open `window.RAPTOR` in the console to poke at any of it while flying.
