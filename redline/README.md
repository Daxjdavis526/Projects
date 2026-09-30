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

## What is here (development phases 1–4)

| | |
|---|---|
| **Control room** | P&ID mimic, CCTV view of the cell, configurable strip charts, live channel table, console (valves, regulator, DAQ, facility, technician), fire control with a guarded ABORT, event log and alarm list, component faceplates |
| **Stand** | TS-1: N₂ K-bottle → HV-100 bottle valve → IV-101 remote isolation → PR-101 dome-loaded regulator (EPC-101) → F-201 filter → SV-301 fire valve → CGT-1 cold-gas thruster on a flexure thrust stand. Vents VV-101/VV-201 (normally open), relief RV-201 |
| **Physics** | Lumped-parameter gas network, real-time, sub-millisecond steps (below) |
| **Instruments** | 14 sensors — including an independent Coriolis mass flowmeter — plus command and derived channels, each with lag, zero offset, noise, mains pickup, anti-aliasing, quantisation, saturation. Real state and measured state are separate objects |
| **DAQ** | Sample rate 100 Hz – 5 kHz, recording to a run file, auto-stop, zero / tare / shunt calibration |
| **Control** | Interlocks (hard, warn, or consequence — by mode), firing sequencer (single burn or pulse train, 5 s countdown, hold, cutoff), limits and redlines with persistence, automatic abort sequence |
| **Procedures** | Data-driven checklist engine built from shared sections; Level 1 (orientation), Level 2 (full baseline firing), Level 3 (pressure characterisation, 60–200 psig) Level 4 (valve response, pulse sweep, minimum impulse bit) in tutorial, guided and independent modes, and Level 5 (return-to-service firing and troubleshooting, guided or independent). Levels 2–4 and the open stand also run in fault-injection mode. Test series run under one go/no-go poll for the approved matrix |
| **Go/no-go** | Six stations reporting from their own data; stations call GO/NO-GO in guided modes, report facts only in independent mode; wrong calls are remembered for the debrief |
| **Faults** | 26 hidden faults, hardware and instrument: regulator set wrong, drooping, creeping, sticking; low bottle; isolation valve not fully open; blocked filter; kinked line; leaking fitting; fire valve slow, partly open, stuck, open coil, leaking seat; wrong nozzle, eroded throat, obstructed throat; transducer bias, failure and noise; thermocouple open circuit; load-cell calibration, load-path, drift and intermittent connector. Each applies at a realistic moment (from the start, on pressurisation, or seconds into the burn) through the physics or the sensor chain. About one fault session in five has no fault at all |
| **Inspections** | 15 technician tasks (Console ▸ INSPECT): pin-gauge the throat, measure the exit, pull the filter, walk the line, snoop-test, bench-check the regulator and fire valve, stroke IV-101, read the bottle gauge, inspect connectors, loop check from the rack, compare the PTs with a reference gauge, dead-weight the thrust stand. Each has preconditions (from the rack; cell open; system vented; low side held at 20–50 psig), takes time, and returns measurements beside the expected value — never "fault found". Several find nothing, which is evidence too |
| **Diagnosis** | Component, failure mode, cited evidence (channels, comparisons, the inspections actually done) and recommended action, scored 40/30/20/10 with partial credit. Then the reveal: what failed, which measurements showed it, which misled, what should have been noticed, whether stopping was right, and how an expert would have gone about it. Diagnosis and root cause are written into the notebook entries of the session's runs |
| **Analysis** | TRACES: every recorded run at full rate — cursors (A/B, Δ, mean between), automatic reduction (steady Pc and thrust, droop, ΔP across filter and valve, valve delays, rise and fall times, total impulse, calculated AND measured mass flow, Isp, Cf, c*, effective throat diameter from measured flow, armature pull-in; per pulse: impulse bit, delays, fired / reached steady), prediction vs measured, overlays aligned at T-0, CSV export. CAMPAIGN: any per-run quantity against any other across runs and sessions, least-squares line with standard errors and R², what the line means (Cf and −Pa·Ae from F vs absolute Pc; dead time from impulse bit vs width), repeatability statistics with 95 % confidence |
| **Test history** | Every run, traces included, kept in the browser (IndexedDB, newest 80) — reopen, overlay or fit last week's runs with today's |
| **Notebook** | Automatic entry per run (configuration, results, alarms, aborts), pre- and post-test notes, filed test reports, search |
| **Reference** | ~45 concise entries (instrumentation, fluid systems, operations, performance, combustion), stand data and limits, and an honest list of what is modelled |
| **Sound** | Synthesised: valve clicks, pneumatic actuator, vent hiss, jet, relay, countdown, alarm tones |

Levels 6–12 (the independent test conductor, the bipropellant stand) are
listed in TRAINING and say which development phase
brings them. The architecture for them is in place; see *Growing it*.

## Controls

Everything is mouse-driven. Start from **TRAINING**: pick a level and a mode,
or the open stand.

| where | what |
|---|---|
| P&ID | click a component or instrument bubble for its faceplate (commands where it has them) |
| Console ▸ STAND | valve OPEN/CLOSE, regulator setpoint |
| Console ▸ DAQ | power, sample rate, RECORD, ZERO PTs, TARE LC, SHUNT CAL |
| Console ▸ FACILITY | clear/enter the cell, PA, technician tasks (walkdown, bottle valve, inspection), safety record |
| Console ▸ INSPECT | the inspection workbench and its results; submit a diagnosis; the root cause afterwards |
| Fire control | load plan, POLL, ARM, FIRE, HOLD, CUTOFF; ABORT: lift the cover, then press |
| Strip charts | wheel: zoom time · shift+wheel: zoom y · drag: pan · shift+drag: pan y · double-click: reset · ⚙: channels |
| Analysis | click: cursor A · shift+click: cursor B · drag a cursor to move it |
| Top bar | ❚❚ freezes the simulation; 1×–10× sim speed (locked to 1× while armed, firing or aborting); MASTER ALARM acknowledges all |

## Modes

- **Tutorial** — every step explained, strict interlocks, stations make and explain their go/no-go calls.
- **Guided** — procedure shown and checked; "why?" on request; unsafe actions warn first.
- **Independent** — checklist titles only; stations report facts, you call it; many rules become consequences instead of blocks (zero a pressurised transducer and it reads low for the rest of the session). The debrief compares what you ticked with what the stand actually did.
- **Fault injection** — independent rules, plus a hidden fault that may or may not be there. The session ends with a diagnosis (INSPECT ▸ Submit diagnosis; the abort banner and the debrief offer it too). Competency is recorded for a diagnosis scoring 70 or more with no safety violations and no wrong go/no-go calls — not for ticking every step, since a NO-GO or an abort can rightly cut a procedure short.

## Architecture

Static files, ES modules, no build step, no dependencies. The layers are
separate, and everything but `ui/` runs in Node.

```
src/
  lib/          units & formatting, seeded RNG, event emitter
  physics/      TRUTH. gas.js (isentropic orifice flow), nozzle.js,
                elements.js (valve, solenoid, regulator, relief, nozzle),
                gasnet.js (volumes + elements, adaptive explicit integrator),
                coldgas.js (network + thrust stand), predict.js
  instruments/  MEASUREMENT. sensor.js, daq.js, store.js (ring + history tiers)
  control/      controller.js (commands, sequencer, abort, facility),
                interlocks.js, alarms.js, procedure.js, gonogo.js, eventlog.js
  analysis/     metrics.js — per-run reductions; campaign.js — cross-run fits and statistics
  sim/          session.js — wires the layers, owns the clock
  content/      DATA. stands/ts1-*.js (plumbing, sensors, limits, abort
                sequence, go/no-go stations, P&ID layout), procedures/,
                programs.js, glossary.js
  ui/           the only code that touches the DOM
test/           node redline/test/physics.test.mjs   (38 checks)
                node redline/test/series.test.mjs    (22 checks: Levels 3 and 4
                start to finish, the campaign arithmetic)
                node redline/test/session.test.mjs   (29 checks: a full guided
                Level-2 test, interlocks, the poll, an automatic abort,
                a pulse train)
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
the CCTV view and the cell microphone (sound) see and hear the real gas.

### Growing it

- **A new stand** is a data file like `content/stands/ts1-coldgas.js` (volumes,
  elements, sensors, limits, abort sequence, go/no-go stations) plus a P&ID
  layout. A physics model publishes named signals (`P:feed`, `F:stand`,
  `I:SV-301`); sensors bind to them by name, so the bipropellant model only
  has to publish its own.
- **A new fault** is an entry in `content/faults/ts1-faults.js`: the
  component, failure mode, onset, randomised parameters, an `apply` that sets
  fault hooks, the key evidence, any inspection readings physics cannot
  produce (a kink, a loose connector), and the debrief story. The hooks the
  elements and sensors already expose: `blockage`, `leakCdA`, `maxOpen`, `stuck`,
  `strokeScale`, `failClosed`, `coilOpen`, `setBias`, `creepCdA`, `stuckAt`,
  nozzle `blockage` and geometry on the physics side; `bias`, `chainGain`,
  `mechGain`, `noiseScale`, `drift`, `stuckAt`, `open`, `intermittent`,
  `lagScale` on the sensor side. None of them know they are faults.
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

**Not claimed.** The numbers are plausible for a small research cold-gas
thruster at sea level. They predict no real hardware. The bipropellant engine
(phases 6–7) will be a lumped, quasi-steady model and will say so.

### The faults, and how honest they are

- Faults change the **model**, not the display: a blocked filter is a smaller
  flow area, a slow valve a longer stroke, a biased transducer an offset in
  its signal chain. What you see follows from the physics and the
  instruments, exactly as for a healthy stand.
- The **magnitudes are chosen to be findable**. Each is large enough to show
  in the measured data of a normal test (the test suite checks this); real
  faults are often subtler, intermittent, or several at once. Here there is
  at most one per session.
- The **odds are not failure rates**. One session in five has no fault and
  the rest draw uniformly from the catalogue. Nothing here says how often a
  real regulator creeps.
- Some **inspection results are scripted** per fault where the lumped model
  has nothing to say — what a kinked tube or a loose connector looks like.
  Measurements of things the model does have (throat diameter, coil
  resistance, lock-up pressure, gauge agreement) are computed from it.
- The **score** is a teaching heuristic, not an accident-investigation
  standard. The reveal is the point of the exercise; the number is not.

## Tests

```
node redline/test/physics.test.mjs
node redline/test/session.test.mjs
node redline/test/series.test.mjs
node redline/test/faults.test.mjs
```

`faults.test.mjs` forces every fault in turn through the same standard firing
and checks that it leaves the fingerprint its answer key claims *in the
measured data* — a fault the instruments cannot see is not a fair exercise —
then checks the inspections, the scoring, the lottery and a Level 5 path
(NO-GO → safe → inspect → diagnose). It takes about two minutes.

For visual checks, serve the repo with `python3 -m http.server` and drive
`/redline/` in headless Chromium; `window.redline` exposes the app and its
session for scripting.

## Roadmap

| phase | brings |
|---|---|
| 3 | ✓ pressure characterisation and pulse testing, campaign analysis, test history, measured mass flow |
| 4 | ✓ fault engine and 26 cold-gas faults, inspection workbench, diagnosis submission, scored root-cause debrief, Level 5, fault-injection mode |
| 5 | polish of the cold-gas program, independent test-conductor level |
| 6 | pressure-fed bipropellant stand: two feed systems, injector, purge |
| 7 | hot fire: ignition and confirmation, valve sequencing, mixture ratio, thermal response, combustion faults |
