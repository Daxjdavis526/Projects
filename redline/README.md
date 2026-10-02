# REDLINE — rocket-engine test-stand operations trainer

A simulated test-control room. You prepare, instrument, zero, leak-check,
pressurise, poll, arm, fire, monitor, abort or shut down, safe, inspect and
reduce the data from a propulsion test — seeing the hardware **only through
its instruments**, the way a test engineer does. It is closer to a flight
simulator for a test stand than to a game: there is no START ENGINE button,
and nothing on screen is the truth.

> **Educational software.** The stand, the thruster and every procedure are
> fictional and generalised. They teach how test engineering is thought
> about. They are not operating procedures for real hardware, and completing
> them qualifies nobody to operate a real test facility.

Live: https://daxjdavis526.github.io/Projects/redline/ — desktop browser, 1366×768 or larger.

## What is here (development phases 1–9, and the cameras)

| | |
|---|---|
| **Control room** | P&ID mimic, CCTV view of the cell, **3D cameras on the cell and the FIRE VIEW** (below), configurable strip charts, live channel table, console (valves, regulator, DAQ, facility, technician), fire control with a guarded ABORT, event log and alarm list, component faceplates |
| **Stands** | TS-1: N₂ K-bottle → HV-100 bottle valve → IV-101 remote isolation → PR-101 dome-loaded regulator (EPC-101) → F-201 filter → SV-301 fire valve → CGT-1 cold-gas thruster on a flexure thrust stand. Vents VV-101/VV-201 (normally open), relief RV-201. **TS-2** (phase 6): a pressure-fed bipropellant stand — N₂ bottle → IV-601 → three dome-loaded regulators (oxidiser tank, fuel tank, purge); two run tanks with vents, reliefs, check valves and weigh scales; main ball valves MOV-713 / MFV-723 with limit switches; turbine flowmeters; purge valves and check valves into each injector manifold; BPE-1, a fictional 500 N-class engine with an impinging-doublet injector, on a thrust stand. Run cold — water through both sides — and then hot (phase 7): OX-1 / FU-1, a spark igniter IGN-901, an uncooled copper heat-sink chamber with embedded thermocouples, a flame detector and an accelerometer. **BPE-2** (phase 8) is a second engine for the same stand, chosen in TRAINING: the same size and propellants, regeneratively cooled — all the fuel crosses a milled-channel jacket in the chamber wall (PT-729 at its inlet, TC-728 at its outlet) before reaching the injector. **TS-3** (phase 9): a turbopump component stand — a 300 L nitrogen bank, two run tanks on RELIEVING regulators, and TPA-1, a fictional turbopump for a pump-fed engine (an oxidiser and a fuel centrifugal pump with inducers and an impulse turbine on one shaft, 36 000 rpm at design), its pumps flowing water through discharge valves, turbine flowmeters and throttle valves to a catch tank, its turbine driven by cold nitrogen through a turbine start valve and a speed controller (SC-330) |
| **Physics** | Lumped-parameter gas network, real-time, sub-millisecond steps; on TS-2 coupled to liquid feed lines with inertance (water hammer), a manifold that primes from dry against a trapped-gas cushion, and tank ullage that grows as liquid leaves; and a lumped combustion chamber — ignition, start transients, hard starts, chug and screech onset, a heat-sink wall that soaks back after shutdown; on TS-3, centrifugal pumps on the affinity laws with suction-limited cavitation and casing heating, an impulse turbine, and a shaft with bearings and vibration (below) |
| **Instruments** | 14 sensors — including an independent Coriolis mass flowmeter — plus command and derived channels, each with lag, zero offset, noise, mains pickup, anti-aliasing, quantisation, saturation. Real state and measured state are separate objects |
| **DAQ** | Sample rate 100 Hz – 5 kHz, recording to a run file, auto-stop, zero / tare / shunt calibration |
| **Control** | Interlocks (hard, warn, or consequence — by mode), firing sequencer (single burn or pulse train, 5 s countdown, hold, cutoff), limits and redlines with persistence, automatic abort sequence |
| **Procedures** | Data-driven checklist engine built from shared sections; Level 1 (orientation), Level 2 (full baseline firing), Level 3 (pressure characterisation, 60–200 psig) Level 4 (valve response, pulse sweep, minimum impulse bit) in tutorial, guided and independent modes, Level 5 (return-to-service firing and troubleshooting, guided or independent) and Level 6 (the independent test conductor: an acceptance campaign from a test request, no procedure, a hidden fault or none, a graded campaign report). Levels 2–4 and the open stand also run in fault-injection mode. Test series run under one go/no-go poll for the approved matrix or range |
| **Go/no-go** | Six stations reporting from their own data; stations call GO/NO-GO in guided modes, report facts only in independent mode; wrong calls are remembered for the debrief |
| **Faults** | TS-3 has 11 of its own: a pump-end bearing in distress, a seal rub, a worn ox wear ring, a damaged fuel inducer, a turbine nozzle blocked with ice, damaged turbine blades, a speed pickup with a loose connector and one configured for the wrong tooth count (both of which drive the real shaft fast through the speed controller), a flowmeter K-factor, a leaking relief seat on a tank regulator, a discharge valve that only partly opens. BPE-2 adds 5 cooling faults to TS-2's: a blocked throat-zone channel, a coked jacket, a cracked liner leaking fuel into the chamber, fuel loaded hot, a coolant thermocouple wired with the wrong extension. TS-2 adds 13 hot-fire faults: an igniter that does not spark, one whose exciter is dead, one that sparks late (a hard start); an oxidiser injector partly plugged, a fuel injector eroded (soft — it chugs); screech; lost film cooling; a drooping oxidiser regulator, a mis-set fuel regulator, a slow main fuel valve; a flowmeter with another meter's calibration, a chamber transducer whose zero shifted, a throat thermocouple that breaks mid-burn (a false redline). TS-1 has 26 hidden faults, hardware and instrument: regulator set wrong, drooping, creeping, sticking; low bottle; isolation valve not fully open; blocked filter; kinked line; leaking fitting; fire valve slow, partly open, stuck, open coil, leaking seat; wrong nozzle, eroded throat, obstructed throat; transducer bias, failure and noise; thermocouple open circuit; load-cell calibration, load-path, drift and intermittent connector. Each applies at a realistic moment (from the start, on pressurisation, or seconds into the burn) through the physics or the sensor chain. About one fault session in five has no fault at all |
| **Inspections** | TS-3 has 10, plus turning the rotor by hand: bearings, wear-ring clearances, inducer and turbine borescopes, rotor runout and breakaway torque, the speed pickups on a scope, the DAQ's speed-channel configuration, the meter K-factors, the regulators' relief seats, the discharge valves' travel. BPE-2 adds 6: water-flow and zone-check the jacket, pressure-decay it, radiograph it for blockage and deposit, borescope the liner, hand-probe the fuel, compare thermocouples with a reference probe. TS-2 has 12 of its own — the injector face, a water flow bench for each side, a borescope of the chamber and throat, the igniter plug, a spark check, regulator bench, valve stroke timing, meter K-factors, reference gauge, loop check, thermocouples, connectors; opening the engine or a meter needs the propellants drained first. TS-1 has 15 technician tasks (Console ▸ INSPECT): pin-gauge the throat, measure the exit, pull the filter, walk the line, snoop-test, bench-check the regulator and fire valve, stroke IV-101, read the bottle gauge, inspect connectors, loop check from the rack, compare the PTs with a reference gauge, dead-weight the thrust stand. Each has preconditions (from the rack; cell open; system vented; low side held at 20–50 psig), takes time, and returns measurements beside the expected value — never "fault found". Several find nothing, which is evidence too |
| **Diagnosis** | Component, failure mode, cited evidence (channels, comparisons, the inspections actually done) and recommended action, scored 40/30/20/10 with partial credit. Then the reveal: what failed, which measurements showed it, which misled, what should have been noticed, whether stopping was right, and how an expert would have gone about it. Diagnosis and root cause are written into the notebook entries of the session's runs |
| **Analysis** | TRACES: every recorded run at full rate — cursors (A/B, Δ, mean between), automatic reduction (steady Pc and thrust, droop, ΔP across filter and valve, valve delays, rise and fall times, total impulse, calculated AND measured mass flow, Isp, Cf, c*, effective throat diameter from measured flow, armature pull-in; per pulse: impulse bit, delays, fired / reached steady), prediction vs measured, overlays aligned at T-0, CSV export. CAMPAIGN: any per-run quantity against any other across runs and sessions, least-squares line with standard errors and R², what the line means (Cf and −Pa·Ae from F vs absolute Pc; dead time from impulse bit vs width), repeatability statistics with 95 % confidence |
| **Test history** | Every run, traces included, kept in the browser (IndexedDB, newest 80) — reopen, overlay or fit last week's runs with today's |
| **Notebook** | Automatic entry per run (configuration, results, alarms, aborts), pre- and post-test notes, per-run reports, search |
| **Test report** | NOTEBOOK ▸ Session test report: the request, conduct, run log, results against prediction, anomalies, inspections, diagnosis and root cause assembled from the record; the conductor's conclusions added; previewed as the printable document it becomes; filed in the notebook (newest 20) and downloadable as standalone HTML. In Level 6 filing grades it (below) |
| **Level 23 grading** | A design-point spin (both pump heads, ox flow, turbine efficiency, coast-down), a map at design speed and the ox pump's NPSH required — 40; data validity — 30; diagnosis — 20; safety — 10 |
| **Level 17 grading** | As Level 12, at a 20 s design point and a 210 psig throttled point, plus two cooling deliverables: the heat into the coolant at the design point and the boiling margin at the throttled point |
| **Level 12 grading** | Two hot-fire points set by targets, not setpoints — MR 1.50 ± 0.05 at Pc 275 ± 15 psig, and a throttled point at 220 psig — reported from the conductor's own reductions (Pc, thrust, MR, c* efficiency, Isp; c* efficiency at the throttled point) — 40; data validity — 30; diagnosis — 20; safety — 10 |
| **Level 6 grading** | Deliverables (baseline F, Pc, Isp; the thrust coefficient from a ≥ 3-point sweep; the 10 ms impulse bit and scatter) checked against the conductor's OWN reductions — 40; the call on data validity against what was really wrong with the stand — 30; the diagnosis — 20; the safety and go/no-go record — 10 |
| **Hints** | In guided fault sessions, up to three questions from a senior engineer, each more specific, each −5 on the diagnosis |
| **Reference** | ~76 concise entries (instrumentation, fluid systems, operations, performance, combustion, turbomachinery), stand data and limits, and an honest list of what is modelled |
| **Sound** | Synthesised: valve clicks, pneumatic actuator, vent hiss, jet, relay, countdown, alarm tones |

Four programs are complete: cold gas, Levels 1–6; bipropellant (BPE-1), Levels 7–12; regeneratively cooled engine (BPE-2), Levels 13–17; turbopump component testing (TPA-1), Levels 18–23.
Level 7 is the stand orientation; Level 8 the water cold flow of the
injector (each side alone at two tank pressures, then both; CdA per side,
meters against scales, and the mixture ratio the injector will give hot).
Level 9 is the first hot fire: propellants, meter calibration fluid, a spark
check, the start sequence, ignition confirmation, c* efficiency, the throat's
soak-back. Level 10 characterises the start: three burns that differ only in
the main-valve lead, the overshoot each gives, and the impulse the dribble
volume delivers after shutdown. Level 11 is the hot-fire return-to-service
with a hidden fault from TS-2's catalogue. Level 12 is the independent
campaign: hit a mixture ratio and a chamber pressure by choosing the two
tank pressures, then a throttled point, and report — graded.

On BPE-2, Level 13 water-flows the cooling jacket: its pressure drop and flow
coefficient, and how much later the fuel side primes now that the jacket
fills first — which sets the fuel lead. Level 14 is the first 10 s
regenerative hot fire: the coolant's temperature rise, the heat it carries,
its margin to boiling, and liner temperatures that level off instead of
climbing. Level 15 maps the cooling margin at the design point, oxidiser-rich
and throttled. Level 16 is the return-to-service fire with a hidden fault
from BPE-2's catalogue. Level 17 is the independent long-duration
acceptance: 20 s at the design point and a throttled point, graded on the
performance and the cooling.

On TS-3, Level 18 is the orientation: what spins, what drives it and what
loads it; turning the rotor by hand; why a pump makes head, not pressure;
and a tank regulator that can bring its tank DOWN. Level 19 is TPA-1's
first spin, at half speed and then at design: the two speed pickups
agreeing on the way up, the head of each pump against the prediction, the
affinity laws (four times the head at twice the speed), the turbine's
efficiency from its temperature drop, the coast-down. Level 20 maps both
pumps by stepping the throttles at constant speed, at 100 % and 75 %, and
refers the two maps to design speed. Level 21 is the suction test: hold the
speed and ramp one tank down until the head breaks — the NPSH required.
Level 22 is the return-to-service spin with a hidden fault from TS-3's
catalogue. Level 23 is the independent acceptance campaign: a design-point
spin, a map and a suction test, the water and gas budgeted by the
conductor, graded.

## Your own hardware (HARDWARE)

A cold-gas stand built from your parts. HARDWARE is an editor for every value
a datasheet gives — gas and site pressure; bottle; supply line and isolation
valve; regulator (Cv, loading, outlet range, one point off its flow curve,
supply-pressure effect); relief; feed line and filter; fire solenoid (Cv or
orifice, coil voltage and power, MOPD, response times, direct or
pilot-operated); thruster (throat, exit, half-angle, Cd, plenum); thrust
stand; transducers; ratings — each value tagged with where it came from
(datasheet, measured, estimate, default) and a note. From it REDLINE builds a
stand of TS-1's shape (`stands/custom-coldgas.js`) and gives you:

- **pre-test checks** — a relief set above the MAWP, a test pressure above
  the solenoid's MOPD or below a pilot valve's minimum differential, a load
  cell or transducer out of range, a fire valve too small for the throat, a
  regulator asked for more than half its capacity, an over-expanded nozzle;
- **a steady-state estimate** as you type;
- **a predicted test** — your planned burn or pulse train run start to
  finish through the same instruments, DAQ and reductions as a real one,
  saved to test history and opened in ANALYSIS, where a real run can later
  be overlaid on it;
- **the open stand** on your hardware, in the control room.

Configurations live in the browser and export/import as JSON.

**How accurate it is.** Steady state — chamber pressure, thrust, flow — is
set by things you can measure: the gas, the pressure the regulator delivers
under flow, the losses on the way, the throat area and the nozzle. With the
throat measured and the regulator's flow curve known, expect a few per cent.
The two big unknowns are the regulator's droop at your flow (often not on
the datasheet) and the throat discharge coefficient (0.90–0.99, rarely known
until you test). Transients — valve opening delay, line fill, tail-off —
come out the right shape and order of magnitude, but they depend on numbers
vendors rarely publish (solenoid response at your pressure, every fitting's
volume), so treat them as ±30 %. The conversions, all estimates where the
datasheet is silent: Cv → CdA = Cv × 16.97 mm²; tubing K = 0.02·L/D + 0.9
per fitting + 1.5; the regulator's band calibrated from the flow-curve
point; the coil's inductance from the opening time (65 % electrical delay,
35 % stroke); the pull-in current's growth with pressure from the MOPD.
The way to make it accurate is to calibrate it against your own first test.
It is a planning and data-checking tool: your hardware's ratings, reliefs
and procedures govern the real stand, not this.

## Controls

Everything is mouse-driven. Start from **TRAINING**: pick a level and a mode,
or the open stand.

| where | what |
|---|---|
| P&ID | click a component or instrument bubble for its faceplate (commands where it has them) |
| Console ▸ STAND | valve OPEN/CLOSE, regulator setpoint(s) — one on TS-1, three on TS-2 — pressure-decay leak check (60 s hold) |
| Console ▸ DAQ | power, sample rate, RECORD, ZERO PTs, TARE LC, SHUNT CAL; on TS-2 TARE SCALES and each turbine meter's calibration fluid (water, OX-1, FU-1) |
| Console ▸ FACILITY | clear/enter the cell, PA, technician tasks (walkdown, bottle valve, inspection; on TS-2 load water or propellants, drain the tanks), safety record |
| Console ▸ INSPECT | the inspection workbench and its results; submit a diagnosis; the root cause afterwards; hints (guided) |
| Notebook | pre-test notes; the session test report (conclusions, preview, File, Download HTML); filed reports; every run |
| Fire control | load plan (TS-1: burn or pulse train; TS-2 cold flow: which sides, duration, oxidiser lead, post-purge; TS-2 HOT FIRE: duration, lead, igniter-on time before T-0, ignition-check time, shutdown order, post-purge), POLL, ARM, FIRE, HOLD, CUTOFF; ABORT: lift the cover, then press |
| Strip charts | wheel: zoom time · shift+wheel: zoom y · drag: pan · shift+drag: pan y · double-click: reset · ⚙: channels |
| Analysis | click: cursor A · shift+click: cursor B · drag a cursor to move it |
| Top bar | ❚❚ freezes the simulation; 1×–10× sim speed (locked to 1× while armed, firing or aborting); MASTER ALARM acknowledges all |
| Cameras (3D) | the third tab over the schematic. Keys 1–5 (or the buttons) pick a camera; FREE orbits (drag, wheel); ⛶ or F opens the FIRE VIEW, Esc leaves it; REPLAY 1× / ¼× / ⅒× / 1/50× plays the last run back off the cell's tape |
| Settings | units, sound, and whether the countdown switches to the FIRE VIEW by itself (on by default) |

## The cameras (3D)

The control room has always had a CCTV picture of the cell — a flat
cartoon, there to show the evidence a camera gives (a valve's position flag,
a puff from the vent stack, people in the cell). The **Cameras (3D)** tab
is the real thing: the test site in three dimensions, built from the stand's
own definition — the engine turned on a lathe from its real throat and exit
diameters, the tanks sized from their real volumes, the valves and their
position flags where the plumbing has them — and five cameras on it:

| camera | where |
|---|---|
| CAM 1 · CELL | on the roof corner, the whole stand |
| CAM 2 · NOZZLE (TPA-1 on TS-3) | a close-up beside the engine, looking across the plume |
| CAM 3 · DOWNRANGE (CATCH TANK on TS-3) | out on the apron, looking back up the plume |
| CAM 4 · BUNKER | the blockhouse's long lens, 50 m away. The sound arrives a seventh of a second late, as it does out there |
| FREE | orbit anywhere |

When the countdown starts, the screen becomes the **FIRE VIEW**: the camera
fills it, with the T-clock, the readouts that matter for the run, the
sequence state and a guarded ABORT (lift the cover, then press). When the
sequence ends it hands you back to the console. After every run the cell's
tape (the scene at 100 frames a second, from a second before T-0 until a few
seconds after the sequence) can be replayed at speed or slowed to a tenth or
a fiftieth — a high-speed camera on the ignition transient.

Everything on these cameras comes from the true state of the model through
`sim/visual.js`, the same way the CCTV and the cell microphone always have:

- **The plume is the engine that is running.** Its regime comes from the
  nozzle's area ratio and the chamber pressure: subsonic at the very start,
  separated inside the nozzle while Pc is low (ragged, flapping, a Mach
  disk), then flowing full — overexpanded at BPE-1's design point, so a
  little pinched, with shock diamonds; underexpanded if you run it hot. The
  diamonds are spaced as the theory spaces them and are as bright as the
  pressure mismatch makes them. Its colour follows the burning mixture
  ratio (fuel-rich is sootier, and afterburns orange at its edge); its
  brightness, the chamber pressure; it flickers with chug and shakes with
  screech. A hard start flashes, bangs and throws sparks; a burnt-through
  regen liner throws sparks from the wall.
- **Cold gas is invisible**, as it is: TS-1's jet shows only as a faint
  condensation fog in the cold expanded nitrogen. **Water** from a cold flow
  leaves the nozzle as spray and rains on the apron. **Purge** puffs. The
  **vent stack** puffs white when cold nitrogen comes out of it. On TS-3
  the turbine exhaust fogs (it is −70 °C), the catch tank churns, and the
  speed-pickup wheel turns — strobing on video above 30 revolutions a
  second, as it would.
- **A heat-sink chamber glows** after a long burn — dull red past ~750 K,
  brighter as it heats — from the model's own wall temperatures, and keeps
  glowing during soak-back.
- **The sun** follows the session's clock (sessions start at 08:30); the
  beacon is the facility's own (green, amber, red and turning); the gate is
  open while the cell is; technicians are where their task puts them.
- **The sound** (on any view) is driven by the same state: a roar as loud as
  the jet's acoustic power, balanced by its noise peak frequency (a small
  jet hisses, a big one rumbles), supersonic crackle, the chug and screech
  at the chamber's own frequencies, the turbopump's whine at its shaft and
  blade-passing frequencies with cavitation crackle and bearing grind.
  In the console you hear the cell microphone on a speaker; on a camera,
  the full range; from the bunker, late and dull.

The cameras load three.js (vendored, r180) only when first opened; the rest
of REDLINE does not need it. If the browser has no WebGL, the tab says so
and the 2D CCTV still works.

### The cameras, and how honest they are

- **Physics:** the plume's regime, its fully expanded Mach number and
  diameter, the shock-cell spacing (L ≈ 1.306·Dj·√(Mj² − 1), the
  vortex-sheet result), whether there is a Mach disk, how much of the nozzle
  has separated (Summerfield's ~0.4·Pa), the exit temperature, the jet's
  mechanical power (½·ṁ·U²) and from it the sound level (≈ 0.5 % of it
  radiated, the textbook figure for rockets), the hot-wall colour (a
  blackbody fit) and the delay of sound to the bunker.
- **Shaped by eye:** the supersonic core length (an empirical fit,
  x/Dj ≈ 4.2 + 1.1·Mj², good to tens of percent), the luminous length and
  spread past it, the flame's colours (a clean alcohol-like flame is drawn
  faintly blue-violet with yellow-white diamonds; soot and afterburning are
  scaled from how fuel-rich the mixture is), the turbulence (slowed and
  smeared — real eddies cross the frame in a fraction of a millisecond, and
  a 60 Hz camera would smear them just as much), every particle of steam,
  smoke, spray and fog, the camera shake, the auto-exposure and the CCTV
  look, and all of the synthesis in the sound.
- **Not modelled:** radiation from the plume's gas bands, its infrared,
  shock–boundary-layer detail, the nozzle's side loads beyond a shake, noise
  directivity, reflections off the walls.

## Modes

- **Tutorial** — every step explained, strict interlocks, stations make and explain their go/no-go calls.
- **Guided** — procedure shown and checked; "why?" on request; unsafe actions warn first.
- **Independent** — checklist titles only; stations report facts, you call it; many rules become consequences instead of blocks (zero a pressurised transducer and it reads low for the rest of the session). The debrief compares what you ticked with what the stand actually did.
- **Fault injection** — independent rules, plus a hidden fault that may or may not be there. The session ends with a diagnosis (INSPECT ▸ Submit diagnosis; the abort banner and the debrief offer it too). Competency is recorded for a diagnosis scoring 70 or more with no safety violations and no wrong go/no-go calls — not for ticking every step, since a NO-GO or an abort can rightly cut a procedure short.

## Architecture

Static files, ES modules, no build step. One dependency, vendored:
three.js for the 3D cameras, fetched only when they are opened. The layers
are separate, and everything but `ui/` runs in Node.

```
src/
  lib/          units & formatting, seeded RNG, event emitter
  physics/      TRUTH. gas.js (isentropic orifice flow), nozzle.js,
                elements.js (valve, solenoid, regulator, relief, nozzle),
                gasnet.js (volumes + elements, adaptive explicit integrator),
                coldgas.js (network + thrust stand), predict.js;
                liquid.js (feed line: inertance, valve, priming manifold,
                injector), combustion.js (the lumped chamber: ignition,
                pools, products and nitrogen, throat, nozzle, chug/screech
                onset, heat-sink walls), cooling.js (a regenerative
                jacket: zones, boiling, critical heat flux, coking),
                turbopump.js (pumps, impulse turbine, shaft, bearings),
                biprop.js (gas network + two liquid lines + chamber or
                turbopump + stand), predict-bp.js (cold flow and hot fire
                from the injector drawing), predict-tp.js (a turbopump's
                steady point, at a speed or at a drive pressure)
  instruments/  MEASUREMENT. sensor.js, daq.js, store.js (ring + history tiers)
  control/      controller.js (commands, sequencer, abort, facility),
                interlocks.js, alarms.js, procedure.js, gonogo.js, eventlog.js
  analysis/     metrics.js — per-run reductions (metrics-bp.js for cold
                flows and hot fires); campaign.js — cross-run fits and
                statistics; report.js — the session report and the Level 6
                grading; report-bp.js — Levels 12 and 17; reporthtml.js — the document
  sim/          session.js — wires the layers, owns the clock; predict-test.js —
                a planned test run start to finish, headless; visual.js —
                what a camera and a microphone in the cell would pick up
                (plume regime and shock cells, flame colour, hot walls,
                sound levels), its events, and the cell's tape
  content/      DATA. stands/ts1-*.js and ts2-*.js: plumbing, sensors,
                limits, abort sequence, interlocks, go/no-go stations, P&ID
                layout, and the stand's own hooks (prediction, reductions,
                sequence, leak check). ts2-regen.js is TS-2 with BPE-2: it
                imports TS-2 and overrides the engine. Also procedures/ (one
                file per level, cg-*, bp-*, rg-*), programs.js, glossary.js,
                and hardware/ — the custom-hardware schema and presets
                (stands/custom-coldgas.js builds a stand from one)
  ui/           the only code that touches the DOM; ui/cell/ is the 3D
                test site (environment, stands, the ray-marched plume,
                particles, the camera panel and FIRE VIEW)
vendor/three/   three.js r180 and the addons the cameras use
tools/          cell-shots.mjs: screenshots of the cameras during real runs,
                in headless Chromium
test/           sixteen headless suites, node redline/test/<name>.test.mjs
                (see Tests below)
```

The flow of information is one-way, and it is the point of the design:

```
physics (true state) ─► sensors ─► DAQ (measured) ─► alarms, procedure checks, go/no-go, UI
        ▲                                                         │
        └────────────── controller (commands, interlocks) ◄───────┘
```

Nothing the operator sees reads the physics directly. Even the P&ID colours a
line from the transducer on it, and draws a valve from its limit switches if
it has them or from its command (marked **C**) if it does not — a lying
transducer makes a lying P&ID. The exceptions are deliberate and physical:
the CCTV view, the 3D cameras and the cell microphone (sound) see and hear
the real gas, the real flame and the real rotor.

### Growing it

- **A new stand** is a data file like `content/stands/ts2-biprop.js` (volumes,
  elements, liquid lines, sensors, limits, abort sequence, interlocks,
  go/no-go stations, its regulators and main valves, and hooks for its
  prediction, reductions, firing sequence and leak check) plus a P&ID
  layout. A physics model publishes named signals (`P:feed`, `F:stand`,
  `mdotL:ox`, `W:fu`); sensors bind to them by name. TS-2 was added this
  way: the controller, DAQ, alarms, procedures, poll, reports and every
  panel are shared with TS-1.
- **A new fault** is an entry in a stand's catalogue
  (`content/faults/ts1-faults.js`, `ts2-faults.js`, each with its own
  failure-mode vocabulary, actions and citable checks): the
  component, failure mode, onset, randomised parameters, an `apply` that sets
  fault hooks, the key evidence, any inspection readings physics cannot
  produce (a kink, a loose connector), and the debrief story. The hooks the
  elements and sensors already expose: `blockage`, `leakCdA`, `maxOpen`, `stuck`,
  `strokeScale`, `failClosed`, `coilOpen`, `setBias`, `creepCdA`, `stuckAt`,
  nozzle `blockage` and geometry on the physics side; `bias`, `chainGain`,
  `mechGain`, `noiseScale`, `drift`, `stuckAt`, `open`, `intermittent`,
  `lagScale` on the sensor side; on TS-2 also `injBlockage` and `CdAinj` on
  a liquid line and the chamber's `igniter.fail/open/weak`, `hf.drive` and
  `film`. None of them know they are faults.
- **A new exercise** is a procedure: sections of steps with a kind (info,
  action, verify, record, hold, poll), the station, the instruction, *why*,
  and a check against the measured view of the stand.

## The physics, and how honest it is

**Modelled physically.** Every restriction is an isentropic orifice with an
effective area, choked or unchoked: ṁ = CdA·P₀/√(RT₀)·f(Pr). Six gas volumes
integrate mass and energy; flow carries enthalpy; walls exchange heat with
the gas (more when it flows) and with the room. The bottle blows down and
cools. The regulator is a proportional poppet with a lag, loaded by a
rate-limited EPC: it locks up, droops under flow, creeps with supply decay
and drops out when supply approaches outlet pressure. The relief valve has
accumulation and blowdown. The fire valve is a coil (L, R, back-EMF) and an
armature with pull-in and drop-out currents, so it opens later at higher
inlet pressure and its current trace dips as it strokes. The nozzle is solved
quasi-steadily in four regimes (no flow, subsonic, separated, attached),
giving the textbook straight line of thrust against chamber pressure with a
−Pa·Ae intercept. The thrust stand is a damped oscillator near 120 Hz with a
pressure tare from the feed line. The regulator is non-relieving: turn its
setpoint down and the pressure downstream stays until something flows or
vents — Level 4 makes you bleed it down.

Two measurements of mass flow, deliberately: MDOT-C is what the DAQ
calculates from chamber pressure and the drawing's throat; FT-201 is a
Coriolis meter that measures it. They agree while the throat is what the
drawing says. From the measured flow the analysis infers an effective throat
diameter (2.50 mm on a nominal stand, at every pressure).

Across the operating range, thrust against absolute chamber pressure is a
straight line (R² > 0.9999) whose intercept, −1.00 N, is ambient pressure on
the 3.55 mm exit. Pulses: the valve opens ≈ 5.8 ms after command at 150 psig
and ≈ 4.6 ms at 60 psig; pulses of 6 ms and longer fire, 5 ms does not open
the valve at 150 psig; impulse bits scatter by ≈ 0.3–5 % (seeded per-actuation
valve jitter), more for shorter pulses.

Nominal result at 150 psig: Pc ≈ 137.6 psig, F ≈ 6.2 N, ṁ ≈ 11.7 g/s,
Isp ≈ 54 s (sea level), valve opening delay ≈ 6 ms, Pc rise ≈ 1.5 ms,
regulator droop ≈ 5 psi, filter ΔP ≈ 2.4 psi, valve ΔP ≈ 5 psi.

**Approximated.** Nitrogen is ideal except for one constant Joule–Thomson
coefficient across the regulator (the cold regulator outlet is real and
visible, so it stays). Lines have no wave dynamics: no water hammer, no
acoustic ringing. Separation uses a single Summerfield ratio; shocks inside
the nozzle are folded into it and the thrust is blended across the choking
boundary, a millisecond-long, sub-0.3 N part of every transient. Heat-transfer
coefficients are tuned for plausible behaviour, not taken from correlations.
The flow curve is linearised within 4 % of equal pressure, where real small-ΔP
flow turns viscous anyway, to keep an explicit integrator stable.

**Instruments.** Every channel is a sensor model, not the truth plus noise:
first-order lag, per-session zero offset, noise that scales with DAQ
bandwidth, 60 Hz pickup, a two-pole anti-alias filter at 35 % of the sample
rate, ADC quantisation, amplifier rails at −5 %/+10 % of range, and zeroing as
a software offset applied after conversion (as in a real DAQ). The calculated
mass-flow channel assumes the drawing's throat, as a real one would.

**Liquid feed (TS-2).** Each propellant line is incompressible liquid with
a lumped inertance — I·dṁ/dt = P_tank − P_manifold − R·ṁ|ṁ| — and square-law
resistances for the line, the main valve and the injector
(ṁ = CdA·√(2ρΔP)). Close a valve and the decelerating column raises the
valve-inlet pressure: water hammer, as a lumped surge rather than a wave
travelling at the speed of sound. The manifold between valve and injector
starts dry; incoming liquid squeezes its gas out through the orifices until
the liquid reaches them (priming), and what gas is left trapped is the
manifold's compliance. The tank ullage grows by the volume of liquid that
leaves, does p·dV work, cools, and the regulator refills it (droop). Purge gas
blows a wet manifold dry; a check valve keeps liquid out of the purge line.
Not modelled: cavitation, two-phase flow beyond that fill fraction, line
elasticity and acoustics, liquid property changes with temperature. The
as-built injector differs from its drawing by a fixed −6 % (ox) and +3 %
(fuel) — on purpose, so a cold flow has something to discover; real
injectors differ by amounts like these, for reasons like burrs and edge
radii.

**Combustion (TS-2, phase 7).** One lumped chamber volume holding two
species — combustion products and nitrogen — carried as P·V = Σ m·R·T.
Products arrive with R·T = (η·c*(MR)·Γ)², which is the definition of
characteristic velocity turned around; c*(MR) and the flame temperature come
from a small invented table shaped like a storable oxidiser with an alcohol
fuel (peak c* ≈ 1640 m/s a little fuel-rich), and the as-built engine
reaches 94 % of it. Gas leaves through a choked (or, early and late,
unchoked) throat; thrust is an ideal nozzle at the throat's conditions with
the same crude Summerfield allowance for separation as TS-1. Steady state
lands within a per cent of an independent quasi-steady prediction:
276 psig, 448 N, MR 1.37, Isp ≈ 217 s at 400/400 psig on the as-built
injector.

Approximated, bluntly:
- **Ignition** is a rule, not chemistry: the spark must be on, both
  propellants present above a threshold, their ratio inside 0.25–8, and then
  a 6–12 ms delay. Nothing is hypergolic.
- **Liquid in the chamber** is two bins per propellant: spray that leaves
  through the nozzle in ≈ 6 ms if unlit, and a share (6 %) that wets the
  wall and lingers. Lit, each vaporises at m/τ with τ growing with the
  amount, and a propellant burns only as fast as the other lets it (a
  0.5–3 mixture window). Light late, or lead one valve by ≈ 0.1 s, and the
  accumulated liquid goes at once: a hard start, aborted by a 475 psig
  structural redline. The thresholds that separate smooth, rough and hard
  are tuned to give a teachable gradient, not measured.
- **Chug** is an onset criterion, not feed-system dynamics: when the softer
  injector side's ΔP/Pc falls below 0.2 a 110 Hz modulation of the burn rate
  grows. Because injector ΔP falls as ṁ² and Pc only as ṁ, a pressure-fed
  engine throttled below ≈ 200 psig tank pressure gets there by itself.
- **Screech** (≈ 3.3 kHz, first longitudinal mode) appears only when a fault
  drives it. It multiplies the wall heat flux and the vibration level. The
  DAQ sees it aliased, as it would.
- **Walls**: two thermal nodes (chamber, throat) heated in proportion to
  Pc^0.8 times the gas–wall temperature difference, conducting into each
  other and losing slowly to the stand. A 5 s burn at the design point ends
  just under the 600 °C throat redline and soaks back above it afterwards;
  the coefficients are tuned to that, not to a correlation.
- **Shutdown**: the 25 cc and 20 cc manifolds empty under purge and burn
  out over a few tenths of a second, a sizeable shutdown impulse for a short
  burn. Real small engines put their valves on the injector for exactly this
  reason.
- The **flame detector** and **accelerometer** read invented functions of the
  chamber state (light from pressure; roughness, chug and screech amplitude),
  shaped to be useful the way the real instruments are.

**Regenerative cooling (BPE-2, phase 8).** The liner is seven axial zones
from injector to nozzle exit, each a thin copper-alloy node and the fuel in
its channels; the fuel enters at the nozzle end and runs forward. Both are
integrated implicitly, so a 1 mm liner costs no step size. Steady state at
the design point: 22 kW into 88 g/s of fuel, a 102 K coolant rise to
121 °C, a 70 K margin to boiling at the jacket outlet, liner ≈ 180 °C at the
throat — reached in two seconds and then flat for as long as the propellant
lasts (a 25 s burn ends as cool as a 5 s one).

Approximated, bluntly:
- **Gas side** scales as Bartz's correlation does — Pc^0.8 and (At/A)^0.9 —
  with the constant tuned to give a plausible heat load, not computed from
  transport properties. The adiabatic wall temperature is 88 % of the gas
  temperature everywhere.
- **Coolant side** is Dittus–Boelter's ṁ^0.8 with a constant per zone. Fuel
  properties (density, cp) do not change with temperature, and the heat it
  carries does not raise c*.
- **Boiling.** FU-1 saturates on an invented alcohol-like curve (78 °C at one
  atmosphere, ≈ 196 °C at 3 MPa, critical at 6.1 MPa). Past saturation at
  the wall, nucleate boiling helps; past a lumped critical heat flux — which
  falls with less flow and less subcooling — a vapour film forms and holds
  until the wall cools, and the liner overheats in a fraction of a second.
  The constants are chosen so that the design point has about 1.5× margin
  and a blocked throat zone, or fuel loaded 60 K hot, does not.
- **Coking** is an empirical deposit rate, exponential above 240 °C at the
  coolant-side wall; **damage** is a running overtemperature integral above
  600 °C at the hot face, and enough of it cracks the liner, after which fuel
  leaks into the chamber and burns poorly.
- The **jacket** adds its volume to the fuel manifold (so the fuel side
  primes in ≈ 0.6 s instead of ≈ 0.2 s) and its resistance to the fuel line;
  it is one lumped restriction, not seven.

### The turbopump (TS-3), and how honest it is

Modelled:
- **Pumps.** Each is a head–flow curve, H/H0 = a0·n² + a1·n·q − a2·q² (n
  speed, q flow, both as fractions of design), scaled by the affinity laws
  and added as a pressure source to its liquid line's momentum equation —
  so the flow, the line's inertia, the throttle and the pump settle
  together, and a stopped pump is just a restriction. Shaft power is a
  shutoff share (40 % at zero flow) plus a share rising with flow;
  efficiency emerges, it is not looked up. Head, not pressure: ΔP = ρgH.
- **Cavitation** is one factor on the head (and, partly, the torque) from
  NPSH available against an NPSH required that scales with speed² and flow,
  defined — as the real one is — by a 3 % head drop. A cavitating pump
  unloads, and the turbine speeds up.
- **Casing heat.** A few hundred grams of liquid in each casing take the
  shaft power not delivered as head. With flow it hardly warms; deadheaded
  it heats tens of degrees a minute, and its vapour pressure rises with it.
- **Turbine.** One impulse stage on the drive gas leaving the network
  through its nozzles: spouting velocity from the inlet state, Euler torque
  with a nozzle and a blade velocity coefficient and one lumped loss, so the
  torque is highest stalled and the efficiency peaks near u/c0 ≈ 0.45. The
  gas leaves colder by exactly the work done — which is how the stand
  measures the turbine's efficiency.
- **Shaft.** One inertia; two bearings with linear friction, each a thermal
  node cooled by the propellant through it; windage. The speed pickups count
  teeth; a counter that loses its pulses reads zero.
- **Speed control.** A PI loop with a feed-forward from the steady
  prediction, acting on the DAQ's readings (the mean of the two pickups),
  through a fast EPC on the drive regulator.

Approximated, bluntly: the pump curves and NPSH scaling are textbook shapes
with invented constants; there is no inducer backflow, no rotating
cavitation, no surge in the rising part of a curve (the curves are drawn
falling everywhere to avoid it), no rotordynamics — no critical speeds,
whirl or axial thrust. Vibration is an invented RMS figure: imbalance ∝ n²,
plus cavitation and bearing terms. Water's properties do not change with
temperature except its vapour pressure. The redline overshoot after a
genuine overspeed (≈ 115 % with the turbine valve's 90 ms) is real
behaviour of the model, not a tuned number.

**Not claimed.** The numbers are plausible for a small research cold-gas
thruster, a small pressure-fed engine and a small turbopump at sea level. They predict no real
hardware, and OX-1 and FU-1 are not real propellants.

### The faults, and how honest they are

- Faults change the **model**, not the display: a blocked filter is a smaller
  flow area, a slow valve a longer stroke, a biased transducer an offset in
  its signal chain. What you see follows from the physics and the
  instruments, exactly as for a healthy stand.
- The **magnitudes are chosen to be findable**. Each is large enough to show
  in the measured data of a normal test (the test suite checks this); real
  faults are often subtler, intermittent, or several at once. Here there is
  at most one per session.
- The **odds are not failure rates**. One session in five (one campaign in
  three, in Level 6) has no fault and the rest draw uniformly from the
  catalogue. Nothing here says how often a
  real regulator creeps.
- Some **inspection results are scripted** per fault where the lumped model
  has nothing to say — what a kinked tube or a loose connector looks like.
  Measurements of things the model does have (throat diameter, coil
  resistance, lock-up pressure, gauge agreement) are computed from it.
- The **score** is a teaching heuristic, not an accident-investigation
  standard. The reveal is the point of the exercise; the number is not.
- On TS-2 most faults only show **with fire** — an igniter, an instability,
  film cooling — and several only in the first few tenths of a second. The
  fault test suite checks each against a standard hot fire.
- The Level 6 **data-validity call** is graded against a fixed judgement per
  fault: hardware faults invalidate the campaign (the article was not tested
  as specified), instrument faults invalidate the data they touch, and a few
  faults that leave the deliverables standing also accept "valid with
  anomalies". Real review boards argue about exactly these calls; the grader
  does not argue.

## Tests

```
node redline/test/physics.test.mjs
node redline/test/session.test.mjs
node redline/test/series.test.mjs
node redline/test/faults.test.mjs
node redline/test/campaign.test.mjs
node redline/test/biprop.test.mjs
node redline/test/hotfire.test.mjs
node redline/test/faults-bp.test.mjs
node redline/test/levels-bp.test.mjs
node redline/test/regen.test.mjs
node redline/test/levels-rg.test.mjs
node redline/test/custom.test.mjs
node redline/test/turbopump.test.mjs
node redline/test/faults-tp.test.mjs
node redline/test/levels-tp.test.mjs
node redline/test/visual.test.mjs
```

`physics.test.mjs` checks the gas network against hand calculations;
`session.test.mjs` flies a full guided Level 2, the interlocks, the poll, an
automatic abort and a pulse train; `series.test.mjs` walks Levels 3 and 4
start to finish and checks the campaign arithmetic.

`faults.test.mjs` forces every fault in turn through the same standard firing
and checks that it leaves the fingerprint its answer key claims *in the
measured data* — a fault the instruments cannot see is not a fair exercise —
then checks the inspections, the scoring, the lottery and a Level 5 path
(NO-GO → safe → inspect → diagnose). It takes about two minutes.
`campaign.test.mjs` flies a whole Level 6 campaign — leak check from the
console, a three-point sweep, a pulse train — and grades reports against it,
nominal and with a load-cell fault; it also checks the report document and
the hints.

`biprop.test.mjs` checks the liquid physics (mass conservation, the √ΔP law,
priming, water hammer growing with closing speed, purge, ullage growth), a
full cold flow through the session and its reductions (the measured CdA is
the as-built injector, not the drawing), the stand's rules, and Levels 7 and
8 driven start to finish.

`hotfire.test.mjs` fires the engine: a clean start against the as-built
prediction (Pc, thrust and MR within a few per cent; c* efficiency recovered
as 0.94; meters and scales agreeing), the meter calibration fluid left on
water, a 200 ms oxidiser lead and a late light (hard starts, aborted), a
50 ms lead (rough but runs), a dead igniter (no ignition, the ignition check
aborts), chug at low tank pressure but not at 300 psig, screech, the 5 s
burn limit with and without film cooling, and the rules that keep a
cold-flow plan away from loaded propellants. `faults-bp.test.mjs` forces
each TS-2 fault through a standard hot fire and checks its fingerprint in
the measured data, plus the inspections and the diagnosis vocabulary.
`levels-bp.test.mjs` walks Level 9 start to finish and flies Level 12's two
points, grading reports against them.

`regen.test.mjs` checks BPE-2: the fuel's boiling curve, a water flow
through the jacket (its CdA recovered), a 5 s hot fire against the as-built
prediction with the jacket in the fuel budget, the coolant heat balance
against the model, the start with and without a fuel lead, a 25 s burn that
stays steady, throttling (less heat, less margin), and each cooling fault's
fingerprint in the measured data. `levels-rg.test.mjs` walks Level 14 and
flies Level 17's 21 s and throttled points. The hot-fire suites take a few
minutes each: a lit chamber needs 50 µs steps.

`custom.test.mjs` checks custom hardware: the reference configuration
reproduces TS-1 within 1.5 %, the Cv, orifice and coil conversions, every
pre-test check, a pilot valve below its minimum differential, helium and
altitude, and a predicted test for each preset — clean, matching the steady
prediction, with droop following the datasheet point and the opening delay
of the order of the stated response time.

`turbopump.test.mjs` checks TPA-1: the affinity laws in the pump model, a
stopped pump as a restriction, head scaling with density, the steady
prediction against the simulation at three drive points, cavitation at low
tank pressure, the runaway of a deadheaded pump and its casing heating,
the turbine's energy balance; then a design-speed spin, a five-point map
and a suction test through the session and their reductions against the
prediction, the stand's rules, and the overspeed abort. `faults-tp.test.mjs`
forces each TS-3 fault through a standard spin (the damaged inducer
through a suction test, the only place it shows) and checks its fingerprint
in the measured data, the inspections and the diagnosis vocabulary.
`levels-tp.test.mjs` walks Levels 18 to 22 start to finish (the pump map,
both suction runs on one tank load, and the troubleshooting spin with and
without a worn ox pump) and flies Level 23's three deliverables — refilling
the tanks between runs, as the water budget demands — and grades a report
against them. It is the slow one: about seven minutes.

`visual.test.mjs` checks what the cameras and the microphone are given,
without a browser: the plume's regimes against chamber pressure on BPE-1
(subsonic, separated with a Mach disk, overexpanded, matched,
underexpanded), the shock-cell spacing, the cold-gas jet, the hot-wall
colour, the flame's look; and cellState and its events through a real hot
fire, a hard start, a cold flow, a TS-1 firing and a TS-3 spin, and the
cell's tape.

For visual checks, `node redline/tools/cell-shots.mjs [hot|regen|cold|coldgas|tp|all] [outdir]`
serves the project, drives real runs in headless Chromium (software WebGL)
and photographs each camera mid-run. More generally, serve the repo with
`python3 -m http.server` and drive `/redline/` in headless Chromium;
`window.redline` exposes the app and its session for scripting.

## Roadmap

| phase | brings |
|---|---|
| 3 | ✓ pressure characterisation and pulse testing, campaign analysis, test history, measured mass flow |
| 4 | ✓ fault engine and 26 cold-gas faults, inspection workbench, diagnosis submission, scored root-cause debrief, Level 5, fault-injection mode |
| 5 | ✓ Level 6 independent campaign with graded report, session test report document, console leak check, guided hints, polish |
| 6 | ✓ pressure-fed bipropellant stand TS-2 (liquid feed physics, two feed systems, injector, purge), cold flow, Levels 7 and 8, the core generalised to more than one stand |
| 7 | ✓ hot fire: combustion chamber, spark ignition and confirmation, start sequencing and hard starts, chug and screech onset, heat-sink thermal limit and soak-back, hot-fire reductions, 13 TS-2 faults and 12 inspections, Levels 9–12 |
| 8 | ✓ BPE-2, a regeneratively cooled engine on TS-2: cooling jacket physics (boiling, critical heat flux, coking, liner damage), jacket instruments and reductions, 5 cooling faults and 6 inspections, Levels 13–17 |
| 9 | ✓ TS-3, a turbopump component stand: pumps on water and a turbine on cold nitrogen, speed control, the affinity laws, maps, suction tests, bearings, vibration and overspeed, 11 faults and 10 inspections, Levels 18–23 |
| — | ✓ the cameras: a 3D test site built from each stand's definition, a plume that follows the running engine, the FIRE VIEW, replay with slow motion, sound from the physics |
| 10 | TS-3 integrated: a gas-generator cycle engine, bootstrap start |
