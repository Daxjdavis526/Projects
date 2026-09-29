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

## What is here (development phases 1–2)

| | |
|---|---|
| **Control room** | P&ID mimic, CCTV view of the cell, configurable strip charts, live channel table, console (valves, regulator, DAQ, facility, technician), fire control with a guarded ABORT, event log and alarm list, component faceplates |
| **Stand** | TS-1: N₂ K-bottle → HV-100 bottle valve → IV-101 remote isolation → PR-101 dome-loaded regulator (EPC-101) → F-201 filter → SV-301 fire valve → CGT-1 cold-gas thruster on a flexure thrust stand. Vents VV-101/VV-201 (normally open), relief RV-201 |
| **Physics** | Lumped-parameter gas network, real-time, sub-millisecond steps (below) |
| **Instruments** | 13 sensors + command and derived channels, each with lag, zero offset, noise, mains pickup, anti-aliasing, quantisation, saturation. Real state and measured state are separate objects |
| **DAQ** | Sample rate 100 Hz – 5 kHz, recording to a run file, auto-stop, zero / tare / shunt calibration |
| **Control** | Interlocks (hard, warn, or consequence — by mode), firing sequencer (single burn or pulse train, 5 s countdown, hold, cutoff), limits and redlines with persistence, automatic abort sequence |
| **Procedures** | Data-driven checklist engine; Level 1 (orientation) and Level 2 (full baseline firing, 42 steps) in tutorial, guided and independent modes |
| **Go/no-go** | Six stations reporting from their own data; stations call GO/NO-GO in guided modes, report facts only in independent mode; wrong calls are remembered for the debrief |
| **Analysis** | Every recorded run at full rate: cursors (A/B, Δ, mean between), automatic reduction (steady Pc and thrust, droop, ΔP across filter and valve, valve delay, rise and fall times, total impulse, mass flow, Isp, Cf, armature pull-in), prediction vs measured, overlay of runs aligned at T-0 |
| **Notebook** | Automatic entry per run (configuration, results, alarms, aborts), pre- and post-test notes, filed test reports, search. Summaries persist in the browser; traces live for the session |
| **Reference** | ~45 concise entries (instrumentation, fluid systems, operations, performance, combustion), stand data and limits, and an honest list of what is modelled |
| **Sound** | Synthesised: valve clicks, pneumatic actuator, vent hiss, jet, relay, countdown, alarm tones |

Levels 3–12 (pressure characterisation, pulse testing, fault diagnosis, the
bipropellant stand) are listed in TRAINING and say which development phase
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
| Fire control | load plan, POLL, ARM, FIRE, HOLD, CUTOFF; ABORT: lift the cover, then press |
| Strip charts | wheel: zoom time · shift+wheel: zoom y · drag: pan · shift+drag: pan y · double-click: reset · ⚙: channels |
| Analysis | click: cursor A · shift+click: cursor B · drag a cursor to move it |
| Top bar | ❚❚ freezes the simulation; 1×–10× sim speed (locked to 1× while armed, firing or aborting); MASTER ALARM acknowledges all |

## Modes

- **Tutorial** — every step explained, strict interlocks, stations make and explain their go/no-go calls.
- **Guided** — procedure shown and checked; "why?" on request; unsafe actions warn first.
- **Independent** — checklist titles only; stations report facts, you call it; many rules become consequences instead of blocks (zero a pressurised transducer and it reads low for the rest of the session). The debrief compares what you ticked with what the stand actually did.

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
  analysis/     metrics.js — post-test reductions
  sim/          session.js — wires the layers, owns the clock
  content/      DATA. stands/ts1-*.js (plumbing, sensors, limits, abort
                sequence, go/no-go stations, P&ID layout), procedures/,
                programs.js, glossary.js
  ui/           the only code that touches the DOM
test/           node redline/test/physics.test.mjs   (38 checks)
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
- **A new fault** (phase 4) is a change to a fault hook the elements and
  sensors already expose: `blockage`, `leakCdA`, `maxOpen`, `stuck`,
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
pressure tare from the feed line.

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

## Tests

```
node redline/test/physics.test.mjs
node redline/test/session.test.mjs
```

For visual checks, serve the repo with `python3 -m http.server` and drive
`/redline/` in headless Chromium; `window.redline` exposes the app and its
session for scripting.

## Roadmap

| phase | brings |
|---|---|
| 3 | pressure-characterisation and pulse-test levels (the sequencer and pulse reductions already exist), repeatability campaigns, IndexedDB run storage |
| 4 | fault engine (hooks exist), inspection interface (throat and exit measurement, continuity, leak test, redundant-sensor compare), diagnosis submission and scored root-cause debrief |
| 5 | polish of the cold-gas program, independent test-conductor level |
| 6 | pressure-fed bipropellant stand: two feed systems, injector, purge |
| 7 | hot fire: ignition and confirmation, valve sequencing, mixture ratio, thermal response, combustion faults |
