# SUPERNOVA — the death of a massive star

An interactive visualisation of a core-collapse supernova: a 15 M☉ red
supergiant from its final minutes, through iron-core collapse, bounce, the
stalled and revived shock, breakout, and three thousand years of remnant
evolution. Everything runs on a reduced-order physics model that is honest
about what it simplifies, and every number on screen means something.

**Keyboard + mouse required.** Desktop only, like HELIOS.

## Running it

No build step. Any static server works:

    cd supernova
    python3 -m http.server 8000
    # open http://localhost:8000

(Plain file:// does not work here — ES modules need HTTP.)

Scenarios: the title screen picks between three genuinely different models,
or link directly with `?m=ccsn15` (default), `?m=ccsn40bh` (failed supernova,
black hole), `?m=ia` (thermonuclear white dwarf).

## Controls

| Input | Action |
|---|---|
| drag | orbit the current focus |
| scroll | zoom (orbit) · speed trim (free flight) |
| click canvas | free flight (pointer lock) |
| W A S D · Q / E | fly · down / up |
| shift | boost |
| esc | leave free flight / close panel |
| space | play / pause |
| Z | debug: render the raw asymmetry field ζ |
| H or ? | help |

The camera's speed adapts to whatever you are near: approaching the 12 km
neutron star slows you to a crawl, crossing the remnant winds you up past
light speed. CINEMA hands the camera to a documentary director; touching
anything takes it back.

## What's in the box

- A convecting red supergiant with limb darkening, blackbody colour, a
  ragged exponential atmosphere, a clumpy dusty wind and an r⁻² circumstellar
  medium — the same wind the remnant will plough into millennia later.
- A cutaway of the onion-shell interior, drawn in mass coordinate the way
  stellar-structure diagrams always are (and labelled as such), with
  visualisation modes for elements, density, temperature and velocity.
- Core collapse at true scale: the shrinking iron core, neutrino trapping,
  bounce at nuclear density, a proto-neutron star, the neutrinosphere, and a
  neutrino burst that expands at literally the speed of light.
- The stalled shock sloshed by the standing accretion shock instability —
  real spherical harmonics to ℓ=4, grown by the physics, frozen at revival,
  and inherited by everything that follows: the ejecta knots cluster in the
  same lobes, and the neutron star's kick recoils against them.
- An asymmetric explosion with composition-stratified debris (nickel gold,
  oxygen teal, hydrogen rose), shock breakout that lights the wind, a live
  light curve, and a remnant that ages — hydrogen fades, oxygen filaments
  survive, the reverse shock drives inward, and the neutron star drifts
  visibly off-centre.
- Three scenarios sharing one engine: the 15 M☉ core collapse; a 40 M☉
  failed supernova whose neutrino signal simply stops at horizon formation
  and whose star quietly disappears; and a Type Ia with no core, no
  neutrinos, ten times the nickel and no survivor.
- A data panel that keeps the four energies separate — binding (~3×10⁵³
  erg), neutrino (99% of it), kinetic (10⁵¹), radiated (~10⁴⁹) — because
  conflating them is the classic mistake.

## The two clocks

Simulation time spans fourteen orders of magnitude, so the scrub bar is not
linear in time. Each phase owns a share of the bar (core bounce gets 8% of it
and 15 milliseconds of reality), exponentially warped inside each segment.
The speed readout shows the true instantaneous dt_sim/dt_wall — it honestly
says 0.03× during the collapse and 3×10⁹× across the remnant. Physical ×N
presets are there when you want to feel how long a hundred days of plateau
actually is.

## How the physics works

A Lagrangian shell model: 256 shells at fixed mass coordinates, which makes
composition bookkeeping free — a shell keeps its identity forever, wherever
it moves. Each phase is a closed-form or semi-implicit solution chosen to be
stable under arbitrarily large timesteps, because the scrub bar can demand
500 years in a single frame:

- collapse: the exact pressureless free-fall cycloid, inner core homologous
- deleptonization: an empirical Ye(ρ) ramp frozen at trapping density
- bounce: prescribed ring-down at nuclear saturation; PNS contraction fit
- stall: shock-radius relaxation toward a heating/ram-pressure equilibrium;
  revival by a critical-luminosity criterion when the Si/O interface falls in
- SASI: growing, saturating spherical-harmonic coefficients, ℓ=1 fastest
- light curve: recombination plateau plus the exact ⁵⁶Ni→⁵⁶Co→⁵⁶Fe chain
- remnant: free expansion into Sedov–Taylor in the star's own r⁻² wind
  (R ∝ t²ᐟ³), with a parametrised reverse shock

The physics runs headless in Node with no DOM and no renderer —
`node test/physics.test.mjs` executes nineteen checks (bounce density, stall
radius, burst luminosity, energy budget, the 0.0098 mag/day cobalt slope,
backward-scrub state integrity, black-hole formation, the failed supernova
actually failing, the Ia peak). That separation is enforced: the renderer
sees exactly one object, `engine.snapshot()`.

The in-app **Σ panel** lists every simplification by name; the short version
is that stages, timescales and orders of magnitude are real, and anything
requiring transport, a nuclear EOS or 3D turbulence is a calibrated stand-in.

## How the rendering works

Modern three.js (r180, vendored, importmap — still zero-build) with an HDR
pipeline: linear-light rendering into half-float targets, UnrealBloom, ACES
filmic tone mapping last. The photosphere is a vector-warped low-frequency
granulation field — chained domain warping produces marble, not convection,
and the difference matters. Colour comes from the Planckian locus with a
documented saturation compensation for ACES's highlight desaturation.

Scale is handled with three tricks stacked: logarithmic depth, a floating
origin (the camera lives at (0,0,0); the world is offset in f64 — HELIOS's
trick), and a far tier for the sky. A 12 km neutron star and a 3 ly remnant
coexist in one scene; nothing is drawn inflated, and the one diagrammatic
view (the mass-coordinate cutaway) says so on screen.

Audio is a live Web Audio score — subs tracking core density, a shimmer
keyed to neutrino luminosity, one restrained impact at bounce. Sound does
not propagate through vacuum; the score is cinema, and is labelled as such.

## Files

- `index.html` — markup, styles, importmap
- `src/config.js` — constants, units, quality tiers
- `src/physics/` — the engine: state, progenitor, phases, models (the three
  scenarios are parameter packs sharing every line of code), headlessly
  testable
- `src/time/clock.js` — the two clocks and the narrative warp
- `src/render/` — renderer/composer, star, interior cutaway, core & black
  hole, shock shells, ejecta, scale references, the physics→GPU bridge
- `src/shaders/` — noise/SH/blackbody library, photosphere, volume, shock
- `src/camera/` — free-flight/orbit rig, documentary director
- `src/ui/` — panel, timeline, light curve, annotations, modals, formatters
- `src/audio/audio.js` — the score
- `vendor/three/` — three.js r180 + the ten addon files, pinned and local
- `test/physics.test.mjs` — the headless validation suite
