# Module 18 — Engine Testing and Instrumentation
Part II · Prerequisites: modules 03, 07, 12, 14 · Estimated time: 8 h

An engine does not have performance until it is measured, and a measurement is
not a number until you can say how wrong it might be. That sounds like
pedantry until the first time you watch a programme argue for three months
about whether an engine made 96.0 % or 97.5 % of its predicted specific
impulse, discover that the two camps were dividing thrust by two different
mass flows derived from the same turbine meter with two different density
models, and realise that nobody had ever written down the uncertainty budget.
The second time it bites you is worse: a wall thermocouple with a 300 ms time
constant tells the controller everything is fine while the liner behind it
melts, because the redline was set on a number the sensor was physically
incapable of reporting in time. Test engineering is not a service function
that happens after the design is done. It is the discipline that decides what
the design *is*, because everything you believe about the engine — $c^*$
efficiency, cooling margin, stability, life — is an inference from a voltage.
This module is about making that inference defensible.

---

## 1. Learning objectives

By the end of this module you should be able to:

1. Place a given test in the development / qualification / acceptance
   taxonomy and in the component → subsystem → engine → stage pyramid, and
   state what that test does and does not prove.
2. Compute a hydrostatic proof pressure from a stated MEOP and proof factor,
   and explain why the medium is water and not nitrogen.
3. Reduce a hot-fire dataset ($F$, $p_c$, $\dot m$, $A_t$, $\varepsilon$) to
   $c^*$, $C_f$, $I_{sp}$ and their efficiencies, applying the injector-end to
   nozzle-stagnation chamber-pressure correction and saying how big it is.
4. Scale an injector cold-flow test from water to the real propellant by
   matching Weber and Reynolds number, and state what the scaling cannot
   reproduce.
5. Build an uncertainty budget for $I_{sp}$ from stated sensor uncertainties,
   deriving $\partial I_{sp}/\partial F$ and $\partial I_{sp}/\partial \dot m$
   and combining in root-sum-square.
6. Select a pressure transducer and mounting for a stated bandwidth
   requirement, and compute the sense-line quarter-wave or Helmholtz frequency
   to decide whether a given combustion mode would be visible at all.
7. Correct a first-order sensor's indicated output for its own lag on a ramp
   and on a step, and quantify the error a slow thermocouple introduces into a
   transient.
8. Choose a sample rate and anti-alias filter for a stated signal bandwidth,
   and state the phase lag the filter introduces.
9. Interpret an annotated hot-fire trace: identify chug, a mixture-ratio
   shift, a sense-line resonance, and an instrumentation failure, and say what
   evidence separates them.
10. State a redline set for a given engine, justify each limit physically, and
    estimate the detection-to-shutdown latency and what damage accumulates
    inside it.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Maximum expected operating pressure | MEOP | Pa | the highest pressure a component sees in any credible operating case |
| Proof factor | $k_p$ | — | multiplier on MEOP for the non-destructive proof test |
| Burst factor | $k_b$ | — | multiplier on MEOP the component must survive without rupture |
| Proof pressure | $p_{proof}$ | Pa | $k_p\,\mathrm{MEOP}$ |
| Discharge coefficient | $C_d$ | — | actual over ideal orifice flow, measured on a flow bench |
| Chamber pressure, injector end | $p_{c,inj}$ | Pa | static pressure tapped at or near the injector face |
| Chamber pressure, nozzle stagnation | $p_{c,ns}$ | Pa | stagnation pressure at the nozzle entrance; the one that belongs in $c^*$ and $C_f$ |
| Chamber contraction ratio | $\varepsilon_c$ | — | chamber cross-sectional area over throat area |
| Characteristic velocity | $c^*$ | m/s | $p_{c,ns}A_t/\dot m$ |
| Thrust coefficient | $C_f$ | — | $F/(p_{c,ns}A_t)$ |
| $c^*$ efficiency | $\eta_{c^*}$ | — | measured $c^*$ over the reference (CEA equilibrium) value |
| Thrust-coefficient efficiency | $\eta_{C_f}$ | — | measured $C_f$ over the ideal one-dimensional value at the same $\varepsilon$ and pressure ratio |
| Throat area | $A_t$ | m² | hot, at the test condition — not the cold machined value |
| Sensor time constant | $\tau$ | s | first-order lag; the sensor reaches 63.2 % of a step in $\tau$ |
| Natural frequency | $f_n$ | Hz | undamped resonance of a transducer diaphragm, mount, or sense line |
| Quarter-wave frequency | $f_{1/4}$ | Hz | $a/(4L)$, the first resonance of a closed-end tube of length $L$ |
| Helmholtz frequency | $f_H$ | Hz | $(a/2\pi)\sqrt{A/(V L_{eff})}$ for a cavity $V$ behind a neck of area $A$, length $L_{eff}$ |
| Speed of sound in the sense fluid | $a$ | m/s | the fluid *in the line*, not in the chamber |
| Sample rate | $f_s$ | Hz | data-acquisition samples per second per channel |
| Nyquist frequency | $f_N$ | Hz | $f_s/2$; the highest frequency representable without aliasing |
| Full scale | FS | (unit) | the transducer's rated span |
| Quantization step | $q$ | (unit) | $\mathrm{FS}/2^N$ for an $N$-bit converter |
| Power spectral density | PSD | (unit)²/Hz | mean-square signal content per unit bandwidth |
| Standard uncertainty | $u$ | (unit) | one-standard-deviation estimate of the error in a measurement |
| Type A / Type B uncertainty | — | — | evaluated statistically from repeated observations / by any other means |
| Coverage factor | $k$ | — | multiplier converting standard to expanded uncertainty ($k=2$ for ≈95 %) |
| Tare | — | N | the part of the load-cell reading not produced by engine thrust |
| Cross-axis sensitivity | — | — | fraction of an off-axis load that appears in the measured axis |
| Redline | — | (unit) | a measured parameter limit that commands automatic shutdown when exceeded |
| Latency | $t_{lat}$ | s | time from the physical event to propellant-valve closure |
| Quantity–distance | Q-D | m | separation distance required for a stated explosive-equivalent quantity |
| Green run | — | — | the acceptance hot fire of a fully integrated stage or engine as it will fly |
| Cavitation head drop | — | — | the NPSH at which pump head falls by a stated percentage, conventionally 3 % |

---

## 3. Theory

### 3.1 What a test is for

Three purposes, three different documents, three different fleets of hardware.
Conflating them is the most common structural mistake in a small propulsion
programme [J].

**Development testing** answers *what does it do?* You do not yet know the
answer, so the test matrix is an exploration: you vary chamber pressure,
mixture ratio and duration to map the envelope, you deliberately go outside
it to find where the engine stops working, and you accept that hardware will
be damaged. Statistical rigour is low and information density is high. The
F-1 injector campaign — roughly 2,000 tests across 210 injector designs, 15
baffle designs and 14 injector configurations under "Project Go" between 1962
and 1964 — is development testing in its purest and most expensive form
[F1-R3896][SP-4206].

**Qualification testing** answers *does this design meet the requirement with
margin?* The hardware is production-representative and built to the flight
drawing set. The test conditions are deliberately beyond flight: longer
duration, wider mixture-ratio and chamber-pressure excursions, higher
vibration levels, more thermal cycles. Nothing is learned about the physics;
what is produced is evidence. Qualification hardware is normally scrapped,
because you have used up its life demonstrating that the life exists
[SMC-S-016].

**Acceptance testing** answers *is this particular article the one we
qualified?* Same nominal conditions as flight, short duration, tight pass/fail
band, every article. It is a screen for workmanship escapes — a mis-drilled
orifice, a bad braze, a contaminated valve — not a demonstration of design
adequacy. An acceptance test that a unit fails is doing its job; an acceptance
test nobody ever fails is either a very mature production line or an
insufficiently sensitive test [J].

The relationship between them is a margin ladder:

| level | condition | duration | sample | what it proves |
|---|---|---|---|---|
| development | anywhere, including failure | any | as many as needed | what the physics does |
| qualification | ≥ 1.2× life, ± envelope corners | extended | 1–3 articles | design has margin |
| acceptance | nominal | short | every article | this unit is built right |
| flight | nominal | mission | — | — |

> **Eq. 3.1** — Life margin: $t_{qual} \ge k_{life}\, t_{flight}$, with
> $k_{life} = 1.2$ to 4 depending on agency and criticality.
> Variables: $t$ = accumulated operating time or cycles [s or cycles];
> $k_{life}$ = life factor [—]. Assumes: damage accumulates monotonically with
> the demonstrated variable (time, cycles, thermal excursions). Fails when the
> damage mechanism is not the one you accelerated — a coking limit is not
> demonstrated by a cryogenic cycle count, and low-cycle fatigue life
> demonstrated on 100 s firings tells you little about a 480 s firing whose
> wall reaches a different steady temperature [SP-8087].

**"Test like you fly."** [M] Every deviation between the test article or test
condition and the flight article or flight condition is an unverified
assumption that you have chosen to carry. Sometimes you must: you cannot put
a first-stage engine in a vacuum, you cannot easily impose flight acceleration
on a test stand, and a horizontal firing loads the turbopump bearings
differently from a vertical one. The rule is not "never deviate"; it is
"enumerate every deviation, and for each one write down the analysis or the
separate test that closes it." Programmes get hurt by the deviations nobody
listed. The Shuttle-era practice of running the engine gimbal, the actual
flight controller and the actual flight software during acceptance firings —
rather than a test-stand surrogate — comes from exactly this reasoning
[SSME-Orient].

### 3.2 The test pyramid

Testing is organised bottom-up because the cost per test and the cost per
failure both rise by roughly an order of magnitude per level, while the
diagnostic resolution falls by about the same factor [J].

```
                      ┌───────────────┐
                      │  stage / green│   1-2 tests, ~$10^8, everything coupled
                      │      run      │
                    ┌─┴───────────────┴─┐
                    │   engine hot fire  │  10^2-10^3 s, all subsystems together
                  ┌─┴───────────────────┴─┐
                  │ subsystem: TCA, TPA,   │ thrust chamber alone, pump on water
                  │ powerpack, valve set   │
                ┌─┴───────────────────────┴─┐
                │ component: orifice, valve, │ hundreds of cheap tests
                │ igniter, seal, TC, sensor  │
                └───────────────────────────┘
```

Each level exists because it isolates a variable the level above cannot.

- **Component.** One part, one failure mode, one measurement. A valve is
  cycled 10,000 times at cryogenic temperature to find its seal wear rate;
  an injector element is cold-flowed to find its $C_d$; a hydrostatic proof
  finds a bad weld. Cheap enough that statistics are affordable — this is the
  only level where you can realistically build a sample of thirty.
- **Subsystem.** The thrust chamber assembly (TCA) on a stand with a
  facility-fed propellant supply; the turbopump assembly (TPA) on a water or
  liquid-nitrogen rig; the "powerpack" — gas generator or preburner plus
  turbopumps, without the main chamber. Subsystem testing exists because it
  removes the coupling: a TCA fed from a facility tank at a *commanded*
  pressure lets you set injector $\Delta p$ independently of pump behaviour,
  which is impossible on the engine. SSME development ran the preburners and
  the turbopumps separately for years before, and alongside, integrated
  engine tests [Biggs89].
- **Engine.** The whole assembly, its own valves, its own controller, its own
  start and shutdown sequence. This is the first level at which the start
  transient is real, and the start transient is where engines break.
- **Stage.** The engine or engine cluster in the flight structure with flight
  tanks and flight feedlines. It is the only level at which POGO coupling,
  feedline dynamics, base heating between engines, and the real tank ullage
  history exist at all.

The pyramid's logic is that a failure discovered at level $n$ costs roughly
$10^{n}$ times a failure at level 1 and tells you roughly $10^{-n}$ times as
much about *which part* was responsible, because at the higher levels the
number of things that could have caused a given symptom explodes.

### 3.3 Component testing

#### 3.3.1 Hydrostatic proof

Every pressure-containing part is pressurised, before it is ever used, to a
factor above its maximum expected operating pressure.

> **Eq. 3.2** — $p_{proof} = k_p\,\mathrm{MEOP}$, and the part must also
> satisfy $p_{burst} \ge k_b\,\mathrm{MEOP}$ by test or analysis.
> Variables: $p_{proof}$, $p_{burst}$ [Pa]; $k_p$, $k_b$ [—]. Typical metallic
> values are $k_p \approx 1.1$–1.5 and $k_b \approx 1.5$–2.0, but the exact
> numbers are set by the governing standard and *have changed between
> revisions*, so quote the revision [STD-5001][AIAA-S-080]. Assumes: the proof
> pressure produces a stress below yield in the intended design, and above
> yield only in a local defect, so that a defective part deforms or leaks
> visibly while a good one is unaffected. Fails when the flaw is a
> fatigue-critical crack too small to grow at proof pressure — proof testing
> screens gross defects and is not a substitute for fracture control
> [AIAA-S-080].

Proof testing is a *screening* argument, not a strength argument. Its power
comes from a subtle point: because the proof stress is known, surviving it
places an upper bound on the size of any crack present, and fracture mechanics
then converts that bound into a guaranteed remaining life. That is the real
reason every flight tank gets proofed.

**Why water.** Liquid water is nearly incompressible, so the stored energy in
a pressurised part is tiny: releasing it produces a squirt, not a blast. A
gas at the same pressure stores enormous energy.

> **Eq. 3.3** — Stored energy of a gas volume, isentropic expansion to
> ambient:
> $$E = \frac{p V}{\gamma - 1}\left[1 - \left(\frac{p_a}{p}\right)^{(\gamma-1)/\gamma}\right]$$
> Variables: $p$ = vessel pressure [Pa]; $V$ = internal volume [m³];
> $\gamma$ = ratio of specific heats [—]; $p_a$ = ambient [Pa]; $E$ [J].
> Assumes: ideal gas, isentropic, instantaneous release, no fragment kinetic
> energy accounted. Fails as an upper bound in the direction that matters
> — fragments carry additional energy and the real hazard is fragment
> throw, not overpressure. As a rule of thumb 1 kg of TNT ≈ 4.6 MJ, so a
> 50 L bottle at 30 MPa holds $E \approx 3.7$ MJ ≈ 0.8 kg TNT equivalent.
> The same 50 L of water at 30 MPa holds under 20 kJ.

That three-orders-of-magnitude ratio is the whole argument. Hydrostatic proof
is done with people in the room behind a splash shield; **pneumatic proof, when
it is unavoidable, is done remotely, with the area cleared to a
quantity–distance radius** [G-095][J]. Pneumatic testing is unavoidable for
components that cannot tolerate water — anything that will later see LOX
(water leaves residue and corrosion products, both ignition sources), anything
with capillary passages that cannot be dried, and any leak test sensitive
enough to need helium.

**Strain gauging.** A proof test that only records pressure tells you the part
did not fail. A proof test with bonded foil strain gauges at the predicted
high-stress locations tells you whether the *stress model* is right, which is
worth far more. The comparison is between measured and predicted strain at
each gauge, and a systematic 20 % discrepancy at one gauge station is the
signature of a modelling error in a stiffness path — usually a joint or a
weld land that the finite-element model treated as rigid.

#### 3.3.2 Pneumatic and leak testing

Leak testing is a separate activity from proof and uses different physics.
Pressure-decay testing (seal the volume, pressurise, watch the pressure fall)
is cheap and has poor sensitivity, and it is corrupted by temperature: a 1 K
drop in a sealed volume of gas at constant volume drops the pressure by about
0.34 %, which will masquerade as a leak. Helium mass-spectrometer leak
detection is the sensitive method, because helium is small, inert, and rare in
air, and detection thresholds around $10^{-9}$ Pa·m³/s are routine. The
practical hierarchy is: bubble test (fast, ~$10^{-4}$ Pa·m³/s), pressure decay
(~$10^{-5}$), helium sniffer (~$10^{-7}$), helium in a vacuum bell
(~$10^{-9}$). The choice is driven by what the leak *does*: an external LH₂
leak is a fire, an internal valve-seat leak is a slow propellant migration
that can produce a hard start on the next ignition, and those need different
sensitivities [SP-8094][SP-8097].

#### 3.3.3 Injector cold flow

Cold flow is the highest-value-per-dollar test in liquid propulsion, and
module 07 has already used its outputs. You flow a non-reacting simulant —
water, or occasionally a refrigerant or an inert solvent chosen for its
density and viscosity — through the real injector hardware and measure:

**1. Discharge coefficient.**

> **Eq. 3.4** — $C_d = \dfrac{\dot m}{A\sqrt{2\rho\,\Delta p}}$
> Variables: $\dot m$ [kg/s]; $A$ = geometric orifice area [m²]; $\rho$ =
> liquid density [kg/m³]; $\Delta p$ = static pressure drop across the element
> [Pa]. Assumes: incompressible, single-phase, steady, $\Delta p$ measured
> manifold-static to receiver-static. Fails when the orifice cavitates
> (then $C_d \approx 0.61\sqrt{K}$ with $K$ the cavitation number
> [Nurick76]) or when the flow hydraulically flips, at which point $C_d$
> drops discontinuously and no smooth correlation applies.

The measurement you actually want is $C_dA$, the *effective area*, because
that is what sets flow; separating $C_d$ from $A$ requires knowing $A$, and
for a printed or EDM'd orifice you often do not, to better than a few percent.

**2. Mass-flux distribution.** A **patternator** is a grid of collection
tubes, typically 5–20 mm on a side, placed a chamber-diameter downstream of
the face. Flow for a fixed time, then read the volume in each tube. The result
is a map of $\dot m''(x,y)$ in kg/(m²·s). Run both circuits with separately
collectable simulants — or run one circuit at a time — and you get the local
mixture ratio distribution, which is the single strongest predictor of both
$\eta_{c^*}$ and wall streaking. Rupe's work at JPL established that
non-reactive mixing uniformity measured this way correlates with combustion
performance well enough to design against [Rupe65][SP-8089].

**3. Spray imaging.** Backlit high-speed video (10–100 kfps), or laser sheet
imaging, gives breakup length, spray angle, and — with phase-Doppler or
diffraction instruments — a drop-size distribution. What you are looking for
qualitatively is whether the element does what the drawing intended: do the
doublet jets actually impinge, or does one stream deflect; does the swirl
element form a closed cone or a collapsed one at low flow.

**4. Scaling to the real propellant.** Water is not LOX and not RP-1. The
breakup physics is governed by Weber and Reynolds numbers (module 07), so the
honest scaling rule is to match them:

> **Eq. 3.5** — Match $\mathrm{We} = \rho V^2 d/\sigma$ and
> $\mathrm{Re} = \rho V d/\mu$ between simulant and propellant. With fixed
> geometry ($d$ constant), matching We requires
> $V_{sim} = V_{prop}\sqrt{(\rho_{prop}\sigma_{sim})/(\rho_{sim}\sigma_{prop})}$,
> and matching Re simultaneously requires
> $\nu_{sim}/\nu_{prop} = V_{sim}/V_{prop}$ — two conditions, one free
> variable. Assumes: geometric similarity and isothermal, single-phase
> injection. Fails always, in the sense that you cannot match both with one
> simulant at one temperature; you choose which to match. [A][J] Standard
> practice is to match We (breakup is surface-tension-limited) and accept the
> Re mismatch, then bound the error by testing at two Re values.

What cold flow *cannot* reproduce, and where programmes get burned: the
chamber back-pressure is atmospheric, not 70 bar, so the ambient gas density
is a hundredfold low and aerodynamic secondary breakup is absent; there is no
heat, so nothing vaporises and a cryogen that would flash in the real engine
stays liquid; there is no combustion, so there is no acoustic field to
interact with; and the manifold is at uniform temperature, so a thermal
gradient that skews distribution in the real engine does not exist. Cold flow
tells you about metering and gross distribution. It says nothing about
stability [SP-8089][J].

#### 3.3.4 Ignition testing

Igniters are characterised separately before they are trusted to light a
chamber, because an igniter failure and a chamber failure look identical from
the outside. The measurements are: energy or enthalpy delivered (calorimetric,
or from torch-igniter mass flow and temperature), the ignition delay
distribution over many units, and — for a torch — the flame's spatial
position and its robustness to the main-chamber flow field.

The characteristic development matrix is a **lead/lag matrix**. Define
$t_{lead}$ as the interval between igniter activation and main-propellant
valve opening, and the fuel-lead or ox-lead as the interval between the two
main valves. Then run the two-dimensional grid: igniter lead from strongly
positive (igniter well established) to zero, and propellant lead from
fuel-first through simultaneous to ox-first, and record chamber pressure
overshoot on each. The output is a map with a safe island in the middle, and
the flight sequence is placed at the island's centre with margin to every
edge. What you find at the edges: too much propellant accumulated before
ignition gives a **hard start** — a pressure spike of several times $p_c$ that
can exceed the chamber's proof pressure in a few milliseconds; too little
igniter energy gives a **failure to ignite** followed by an unburned
propellant accumulation and then a delayed detonation, which is worse. For
hypergolic and pyrophoric systems (TEA/TEB in the F-1 and in Merlin) the
igniter is chemical and the matrix collapses to a valve-timing problem, which
is precisely why those systems were chosen [F1-R3896][Clark].

### 3.4 Hot fire

#### 3.4.1 The thrust-chamber test

A thrust chamber assembly on a stand is fed from facility tanks, pressurised
by facility gas through facility regulators and run-valves. This is a
deliberate architectural choice: it decouples feed pressure from engine
behaviour so the test conductor can command an injector $\Delta p$ and a
mixture ratio independently, which no pump-fed engine allows.

**What is varied.** Three variables, plus duration.

- **Chamber pressure** $p_c$, set by the feed pressure. Varying it sweeps
  Reynolds number, heat flux (roughly $\propto p_c^{0.8}$ from Bartz,
  module 10) and injector $\Delta p/p_c$, and it is the axis on which chug
  margin is found.
- **Mixture ratio** MR, set by the two feed pressures independently. The MR
  sweep produces the $\eta_{c^*}$-versus-MR curve, whose peak is almost never
  at the CEA-optimum MR — the offset between the two is a direct measure of
  mixing quality.
- **Duration.** Short "burp" firings (0.5–2 s) prove ignition and sequencing.
  Intermediate firings (5–20 s) reach steady chamber pressure but not steady
  wall temperature. Long firings (60 s+) reach thermal equilibrium in the
  structure and are the only ones from which cooling margin can be inferred.
  A 3 s test tells you almost nothing about a regenerative circuit.

**Heat-sink versus cooled hardware.** Early development is normally run on a
thick, uncooled copper or steel **heat-sink chamber**: the wall absorbs the
heat in its own thermal mass and the test is limited to a few seconds by the
wall temperature, not by cooling. This is enormously cheaper and faster to
build and modify, and it has a genuine measurement advantage — instrumenting
a thick wall with a radial thermocouple array turns it into a calorimeter,
and the time derivative of the wall temperature gives you the local heat flux
directly:

> **Eq. 3.6** — Slug calorimeter: $q'' = \rho c_p \delta \dfrac{dT}{dt}$
> Variables: $q''$ = local heat flux [W/m²]; $\rho$ [kg/m³], $c_p$ [J/(kg·K)]
> and $\delta$ [m] the density, specific heat and thickness of the isolated
> slug; $dT/dt$ [K/s] measured. Assumes: the slug is thermally isolated from
> its surroundings (a machined gap or a low-conductivity mount), lumped
> (Biot number $\ll 0.1$), and the measurement is taken early enough that the
> back face is still cold. Fails when lateral conduction is not blocked, and
> when the slug's temperature rise changes the gas-side driving potential
> $(T_{aw} - T_{wg})$ appreciably — so use the early, nearly-linear part of the
> trace.

The alternative is a **water-cooled calorimeter chamber**: segmented cooling
passages, each with its own inlet/outlet thermocouple pair and flow meter, so
that $Q_i = \dot m_i c_p \Delta T_i$ gives the axial heat-flux profile
directly. It is the highest-fidelity heat-transfer measurement available and
it is expensive. Flight-configuration regeneratively cooled hardware is
brought in last, because it is the most expensive to build and the hardest to
instrument — you cannot put thermocouples where the coolant channels are.

#### 3.4.2 Data reduction: extracting $c^*$ and $C_f$

This is the core computation of the module. You measure four things: axial
thrust $F$, chamber pressure $p_c$, propellant mass flows $\dot m_o$ and
$\dot m_f$, and the throat area $A_t$. Everything else is derived.

> **Eq. 3.7** — $c^*_{meas} = \dfrac{p_{c,ns} A_t}{\dot m}$
> Variables: $p_{c,ns}$ = nozzle-entrance stagnation pressure [Pa]; $A_t$ =
> hot throat area [m²]; $\dot m = \dot m_o + \dot m_f$ [kg/s]. Assumes: the
> throat is choked (always true in a rocket above a few bar), one-dimensional
> flow at the throat, and that $\dot m$ is the *total* flow through the throat
> — which excludes any film-coolant or turbine exhaust that bypasses the
> chamber and excludes nothing that enters it. Fails, silently and by several
> percent, when the wrong pressure station is used; see below.

> **Eq. 3.8** — $C_{f,meas} = \dfrac{F}{p_{c,ns} A_t}$, and
> $I_{sp,meas} = \dfrac{F}{\dot m g_0} = \dfrac{c^*_{meas}\,C_{f,meas}}{g_0}$
> Variables: $F$ = measured axial thrust [N] at the stand's ambient pressure.
> Assumes: $F$ is corrected for tare and for the momentum and pressure
> reactions of every line crossing the thrust-measuring boundary. Fails when
> the reported $F$ is a raw load-cell reading; see §3.6.3.

> **Eq. 3.9** — Efficiencies:
> $\eta_{c^*} = c^*_{meas}/c^*_{ideal}$, $\eta_{C_f} = C_{f,meas}/C_{f,ideal}$
> where the ideal values are computed for the *measured* mixture ratio,
> chamber pressure, area ratio and ambient pressure. Assumes: the reference is
> stated — one-dimensional equilibrium (ODE) is the convention of [CPIA-246],
> and a number quoted against a frozen or a kinetic reference is a different
> number. Fails as a comparison between programmes whenever the reference is
> not stated, which is most of the time. **A quoted "$c^*$ efficiency" without
> its reference method is not a number.**

$\eta_{c^*}$ isolates the combustion process: it is high (0.97–0.995) when
atomisation and mixing are good and the residence time is sufficient, and low
(0.90–0.94) when the injector mixes badly or $L^*$ is short. $\eta_{C_f}$
isolates the nozzle: divergence loss, boundary-layer drag, and any separation.
Their product is the overall efficiency. The decomposition matters because the
fixes are completely different — a low $\eta_{c^*}$ is an injector or chamber
problem, a low $\eta_{C_f}$ is a nozzle contour or a flow-separation problem,
and confusing them wastes a year [CPIA-246][CPIA-245].

**The chamber-pressure station problem.** [F] This is the most common
systematic error in published rocket performance, and it is worth being
pedantic about. The pressure tap is at the injector face, where the gas
velocity is nearly zero, so $p_{c,inj}$ is essentially a stagnation pressure —
but it is the stagnation pressure *before* heat addition. Between the face and
the nozzle entrance the gas is accelerated by combustion in a nearly constant
area duct (Rayleigh flow), which *lowers* the stagnation pressure. Applying
the momentum equation between the face and the nozzle-entrance station, and
then the isentropic relation at that station:

> **Eq. 3.10** — $\dfrac{p_{c,ns}}{p_{c,inj}} = \dfrac{\left(1+\frac{\gamma-1}{2}M_c^2\right)^{\gamma/(\gamma-1)}}{1+\gamma M_c^2}$
> Variables: $M_c$ = Mach number at the nozzle entrance, obtained by inverting
> the subsonic branch of the area relation at the contraction ratio
> $\varepsilon_c = A_c/A_t$; $\gamma$ [—]. Assumes: constant-area frictionless
> heat addition from face to nozzle entrance, uniform one-dimensional
> properties, combustion complete at the nozzle entrance. Fails when the
> chamber is highly convergent from the face (then it is not constant-area) or
> when combustion continues into the nozzle, which pushes the real loss
> further. The correction is 1–2 % for $\varepsilon_c \ge 3$ and grows sharply
> below $\varepsilon_c = 2$.

For $\gamma = 1.20$ and $\varepsilon_c = 4$, $M_c = 0.150$ and
$p_{c,ns}/p_{c,inj} = 0.9870$ — a 1.3 % drop. Since
$c^* \propto p_{c,ns}$ and $C_f \propto 1/p_{c,ns}$, using the wrong station
moves $\eta_{c^*}$ by 1.3 % in one direction and $\eta_{C_f}$ by 1.3 % in the
other. It cancels in $I_{sp}$ (which never involves $p_c$ at all) and does not
cancel in either efficiency. Since Apollo-era American practice quotes
injector-end pressure and Soviet/Russian practice quotes nozzle stagnation
pressure, every US-versus-Russian chamber-pressure comparison in the
literature carries this offset unstated. Comparing the RD-180's 267 bar to the
RS-25's 206 bar without the caveat overstates the gap slightly.

**Throat area is not a constant.** $A_t$ appears in both $c^*$ and $C_f$ and
you measured it cold, with a bore gauge, on a bench. Hot, the throat has grown
by thermal expansion and possibly eroded.

> **Eq. 3.11** — $A_t(T) = A_{t,0}\,[1 + \alpha (T - T_0)]^2$
> Variables: $\alpha$ = linear coefficient of thermal expansion [K⁻¹];
> $T - T_0$ = throat wall temperature rise [K]. Assumes: uniform temperature
> around the throat, free expansion, no erosion. Fails for ablative and
> graphite throats, which erode monotonically, and for regeneratively cooled
> throats under hoop restraint. For a copper-alloy throat at 700 K rise,
> $\alpha \approx 17\times10^{-6}$ K⁻¹ gives an area increase of 2.4 %,
> which is larger than most people's entire uncertainty budget.

This is why serious programmes measure the throat before and after every test
series, and why the reduction code carries a throat-area model rather than a
constant.

### 3.5 Turbopump, environmental, and life testing

#### 3.5.1 Turbopump rigs

Firing an engine to characterise its pump is absurdly expensive and gives you
one operating point per test. Instead the pump is run on a **water rig** or, for
cryogenic pumps, a **liquid-nitrogen rig**, driven by an electric motor or an
air turbine. Water is used because it is safe, cheap, has a well-known
equation of state, and — critically — because pump hydraulic performance
non-dimensionalises: head coefficient $\psi$ and flow coefficient $\phi$ versus
specific speed collapse across fluids provided Reynolds number is high enough
and cavitation is absent [Brennen-Pumps][SP-8109].

What is mapped:

- **Head–flow characteristic.** $\Delta p$ versus $\dot V$ at several speeds,
  producing the map that the engine cycle balance (module 13) consumes. The
  slope near the operating point is what determines feed-system stability.
- **Cavitation.** The classic test holds speed and flow constant and slowly
  reduces inlet pressure while watching discharge head. Head is flat, then
  falls off a cliff. The convention is to define the critical NPSH as the
  point where head has dropped **3 %**, and to quote suction specific speed
  $S = \omega\sqrt{Q}/(g_0\,\mathrm{NPSH})^{3/4}$ there. The number is a
  convention, not physics — cavitation begins well before 3 % head loss, and
  an inducer can be eroding badly at 1 % — so a pump run at its 3 % point in
  flight is a pump being consumed [Brennen-Pumps][SP-8052].
- **Rotordynamics.** Shaft displacement is measured with eddy-current proximity
  probes (two per plane, 90° apart) and plotted as orbit and as a **waterfall**
  — a stack of spectra versus shaft speed. What you are hunting is a
  subsynchronous whirl component, typically near 0.4–0.5× running speed, that
  grows with speed: that is a fluid-film or seal-driven instability and it will
  destroy the pump. The SSME high-pressure fuel turbopump's subsynchronous
  whirl problem, found this way, cost years and was fixed by changing the
  bearing and seal arrangement, not by changing the impeller [Biggs89].
- **Bearing and seal life.** Run-time accumulation with periodic teardown,
  plus torque and temperature monitoring for early wear detection. Cryogenic
  bearings run without conventional lubrication (the propellant is the
  coolant), so the wear mechanism is transfer-film-dependent and does not
  extrapolate from ambient-temperature data.

#### 3.5.2 Vibration, shock, thermal

These come from the launch-vehicle world rather than the engine world, and are
governed by [SMC-S-016] (successor to MIL-STD-1540) and, for acoustics,
[STD-7001]. The concepts that matter for propulsion hardware:

- **Sine vibration** sweeps a single frequency across a band to find
  resonances and to represent low-frequency vehicle transients. Its output is
  a transmissibility plot: response over input, whose peaks locate structural
  modes and whose peak height gives the damping ($Q \approx 1/(2\zeta)$).
- **Random vibration** applies a specified acceleration PSD in g²/Hz across
  20–2000 Hz. Its rationale is that real launch environments are broadband and
  a sine sweep at the same overall level under-excites the resonances that
  actually accumulate fatigue. The requirement is stated as a PSD envelope
  plus an overall $g_{rms}$, and the qualification level is the maximum
  expected flight level plus a margin (commonly +3 dB with a duration factor,
  +6 dB for qualification in some tailorings — check the revision).
- **Protoflight** logic tests the actual flight article at qualification
  *level* but acceptance *duration*, trading fatigue-life consumption for the
  cost of a dedicated qualification unit. It is standard for small programmes
  and it is a real risk transfer, not a free lunch [SMC-S-016].
- **Thermal cycling** for propulsion hardware is dominated by cryogenic
  cycling: chill-down to 20 K or 90 K and back, repeatedly, which drives
  differential contraction at every dissimilar-material joint and is the
  dominant failure mode for brazed joints and for bellows.

#### 3.5.3 Durability and life

Life is demonstrated by accumulating the damage variable, whichever one it is.
For a regeneratively cooled chamber the damage variable is thermal low-cycle
fatigue of the hot wall — cycles, not seconds. For a turbine it is creep and
high-cycle fatigue — seconds at temperature. For a valve it is actuations. For
a bearing it is revolutions under load. Demonstrating 1.2× the flight life in
the wrong variable demonstrates nothing.

Two contrasting programmes:

- **RS-25/SSME.** The programme accumulated well over one million seconds of
  hot-fire time across the fleet and the development stands over its life, on
  a scale no other engine has approached; this is the origin of its reputation
  and also of its cost. Individual engines were certified for a nominal
  55 flights / 27,000 s equivalent, and the between-flight inspection burden
  was enormous [Biggs89][SSME-Orient]. The exact fleet-total figure is quoted
  in several forms in secondary sources and should be treated as "over one
  million seconds" rather than as a precise number.
- **Merlin.** SpaceX's acceptance philosophy is different in kind: every
  engine is hot-fired at McGregor before delivery, every stage is hot-fired as
  a stage, and the vehicle is static-fired again on the pad. The engine is
  designed for multiple restarts and the second-stage engine must restart in
  flight, so restart is part of the acceptance sequence rather than a special
  test. Combined with engine-out capability at the vehicle level — a Falcon 9
  first stage can lose an engine and still reach orbit, which was demonstrated
  in flight on CRS-1 in 2012 — the design point is not "this engine will never
  fail" but "a failure of this engine is survivable and is screened by
  firing every one" [J].

### 3.6 Instrumentation physics

A test is only as good as its worst sensor, and the failure is almost never
that the sensor is inaccurate. It is that the sensor is *slow*, or that its
mounting resonates, or that it is measuring a slightly different thing than
you think.

#### 3.6.1 Pressure

Three transduction principles, with different jobs.

- **Bonded or thin-film strain gauge.** A diaphragm with a Wheatstone bridge.
  Rugged, stable, DC-coupled (measures absolute steady pressure), accuracy
  0.1–0.5 % FS, natural frequency from a few kHz to tens of kHz. This is the
  workhorse for steady chamber and manifold pressure.
- **Piezoresistive (silicon), e.g. the Kulite family.** A micromachined
  silicon diaphragm; very small, very stiff, natural frequency 100 kHz to
  >1 MHz for small ranges, DC-coupled. This is the sensor for combustion
  dynamics, and it is fragile and temperature-sensitive, which is why it is
  usually recessed slightly, protected by a screen, and sometimes water-cooled.
- **Piezoelectric (quartz, PCB/Kistler style).** Charge output from a stressed
  crystal, AC-coupled through a charge amplifier with a finite discharge time
  constant. Cannot measure a steady pressure at all — it drifts to zero — but
  it is superb for transients and shocks, has enormous range, and survives
  environments that kill silicon.

**Frequency response is a system property, not a sensor property.** [F] This
is the point students get wrong. A 500 kHz transducer at the end of a 3 m
sense line has the frequency response of the *line*, which is dreadful. A gas
column in a tube closed at the transducer end is a quarter-wave resonator:

> **Eq. 3.12** — $f_{1/4} = \dfrac{a}{4L}$
> Variables: $a$ = speed of sound in the fluid filling the line [m/s]; $L$ =
> line length [m]. Assumes: uniform line, closed at the transducer, open (to
> the chamber) at the other end, negligible damping. Fails when the line is
> long enough that viscous attenuation dominates before the resonance builds,
> and when the line contains a two-phase or a stratified fluid, in which case
> $a$ is neither known nor constant.

> **Eq. 3.13** — Helmholtz resonance of the transducer cavity behind a short
> passage: $f_H = \dfrac{a}{2\pi}\sqrt{\dfrac{A}{V L_{eff}}}$
> Variables: $A$ = passage cross-sectional area [m²]; $L_{eff} = L + 0.6\,r$ =
> passage length with end correction [m]; $V$ = cavity volume [m³]. Assumes:
> all dimensions $\ll$ wavelength (a lumped acoustic system), rigid walls, no
> mean flow. Fails when the passage is long relative to a wavelength, at which
> point Eq. 3.12 is the right model instead.

A 3 m line filled with nitrogen at 300 K ($a = 353$ m/s) resonates at 29 Hz,
which means it destroys everything above roughly 10 Hz and rings at 29 Hz in
response to any transient. Even a 0.3 m passage into a 0.1 cm³ transducer
cavity gives $f_H \approx 460$ Hz. Meanwhile the first tangential acoustic
mode of a 0.30 m diameter chamber with a sound speed of 1100 m/s is

> **Eq. 3.14** — $f_{1T} = \dfrac{1.8412\,a_c}{\pi D_c} \approx 2150$ Hz
> Variables: $a_c$ = chamber sound speed [m/s]; $D_c$ = chamber diameter [m];
> 1.8412 is the first zero of $J_1'$. Assumes: cylindrical chamber, uniform
> temperature, hard walls. Fails for real chambers by 10–20 % because the
> temperature and hence $a_c$ varies axially and radially; use it to know
> *which decade* to look in, not to identify a mode by frequency alone
> [SP-194][LRECI].

The conclusion is unavoidable: **a sense-line-mounted transducer cannot see a
tangential mode, and can barely see chug.** Instability instrumentation must
be *close-coupled* — the transducer flush-mounted in the chamber wall or in a
recess of a few millimetres — which is why development chambers carry
purpose-built high-frequency ports and flight engines usually do not.

#### 3.6.2 Temperature

Thermocouples dominate because they are cheap, small, rugged and wide-range.
Type K (chromel–alumel) to about 1500 K is the default; Type T
(copper–constantan) is preferred at cryogenic temperatures for its better
low-temperature sensitivity; Type E has the highest output per kelvin; Type R,
S and B (platinum–rhodium) go higher but are fragile and expensive. Resistance
thermometers (RTDs) are far more accurate (±0.1 K versus ±2 K) and far slower
and more fragile, so they live in coolant lines, not in gas paths.

The real issue is dynamics. A thermocouple is a first-order system:

> **Eq. 3.15** — $\tau\dfrac{dT_i}{dt} + T_i = T_{true}$, with
> $\tau = \dfrac{\rho c_p V}{h A} \approx \dfrac{\rho c_p d}{6h}$ for a
> spherical bead of diameter $d$.
> Variables: $T_i$ = indicated temperature [K]; $T_{true}$ = the temperature
> the junction is trying to follow [K]; $h$ = local convective coefficient
> [W/(m²·K)]; $d$ = bead diameter [m]. Assumes: lumped junction (Biot number
> $\ll$ 0.1), single dominant heat path, constant properties. Fails when the
> junction also radiates (hot gas, cold walls: the junction reads low by up to
> hundreds of kelvin), when conduction down the leads is significant (the
> "stem loss", which is why sheathed TCs are inserted at least 10 sheath
> diameters), and when a protective sheath adds its own much larger $\tau$.

Two consequences worth memorising [F]:

*Step response.* $T_i(t) = T_{true} - \Delta T\,e^{-t/\tau}$: the indicated
value reaches 63.2 % of a step in one $\tau$, 95 % in three.

*Ramp response.* For $T_{true} = T_0 + \dot R t$, the solution is
$T_i = T_0 + \dot R\left[t - \tau(1 - e^{-t/\tau})\right]$, so after a few
$\tau$ the indicated temperature **lags the true temperature by a constant
$\dot R\,\tau$ kelvin, forever.** A sheathed wall thermocouple with
$\tau = 0.35$ s on a wall heating at 400 K/s reads 140 K low, permanently, for
as long as the ramp lasts. If your wall redline is 900 K and the sensor is
140 K behind, you shut down at a true wall temperature of 1040 K. This single
fact has destroyed hardware.

The inverse is also usable: since $T_{true} = T_i + \tau\,dT_i/dt$, a
digitally differentiated thermocouple signal can be compensated in real time,
at the cost of amplifying high-frequency noise by $\tau$. Do it in the
reduction, not in the redline path [J].

#### 3.6.3 Thrust

Thrust is measured with **load cells**, almost always bonded strain-gauge
columns or shear-web designs, and it is the hardest measurement on the stand
to get right — not because load cells are inaccurate (0.03–0.1 % of full scale
is routine) but because of everything between the engine and the load cell.

The engine sits on a **thrust frame** suspended on **flexures** — thin metal
straps or flexural pivots that are stiff axially and compliant in the
measurement direction, so that the load path to the load cell is well defined.
Sources of error, in rough order of nastiness:

- **Tare.** Every line crossing the thrust-measuring boundary — propellant
  feeds, purge lines, instrumentation cables, hydraulic lines — carries both a
  stiffness and a pressure-induced force. A pressurised bellows in a feedline
  produces an axial force of $p\,A_{eff}$ where $A_{eff}$ is the bellows'
  effective area, and this force appears in the load cell exactly as if it
  were thrust. It scales with feed pressure, so it does not cancel across a
  $p_c$ sweep. The mitigation is symmetric line routing, low-stiffness flex
  joints, and an in-situ calibration performed *with the lines pressurised*.
- **Calibration.** The stand is calibrated by applying a known force with a
  hydraulic cylinder against a reference load cell traceable to a national
  standard, in place, with the engine installed. Both up and down the range
  (hysteresis), and repeated after the test (post-test calibration shift is
  the primary evidence of a stand problem).
- **Cross-axis and alignment.** A 0.5° misalignment between the thrust vector
  and the measurement axis loses $1-\cos(0.5°) = 4\times10^{-5}$ of the axial
  reading — negligible — but puts $\sin(0.5°) = 0.9\%$ of thrust into the side
  axis, where flexure friction and cross-axis sensitivity convert an unknown
  fraction of it back into apparent axial force. Gimballed engines make this
  worse, which is why gimbal-position instrumentation is part of the thrust
  measurement.
- **Dynamics.** The thrust stand is a mass on springs with its own resonance,
  typically 20–100 Hz. Thrust transients faster than that are not measured;
  they are convolved with the stand's transfer function. Measuring an impulse
  bit of a small thruster requires either a stand with a much higher resonance
  or a deconvolution of the known stand dynamics.

A realistic thrust uncertainty on a well-run stand is 0.25–0.5 % [CPIA-245].
Anyone quoting 0.1 % has either an exceptional facility or an incomplete
budget.

#### 3.6.4 Flow

Mass flow is the other half of $I_{sp}$ and it is usually the *worse* half.

- **Turbine meters** measure volumetric flow from the rotation rate of a
  bladed rotor. Cheap, rugged, cryogen-compatible, and *volumetric*: mass flow
  requires a density, which requires an accurate temperature and pressure and
  an equation of state. For LOX near saturation, $\partial\rho/\partial T$ is
  about $-0.4$ % per kelvin, so a 2 K temperature error is a 0.8 % mass-flow
  error — larger than the meter's own error [NIST-WB][REFPROP]. Turbine meters
  also have a viscosity-dependent calibration and a lower linear limit.
- **Coriolis meters** measure mass flow directly, by the Coriolis-induced
  phase shift between two points on a vibrating tube. Accuracy 0.1–0.25 % of
  reading, and they give density as a bonus. The catch: they are heavy, they
  impose a real pressure drop, they hate two-phase flow (a slug of vapour in a
  cryogenic line causes a gross error, not a small one), and their large sizes
  become impractical.
- **Venturis and cavitating venturis.** A venturi infers flow from a
  differential pressure and needs a discharge coefficient and a density. A
  **cavitating venturi**, run with sufficient pressure ratio that the throat
  cavitates, chokes the liquid: flow becomes independent of downstream
  pressure and depends only on upstream pressure and vapour pressure. That
  makes it simultaneously a flow meter and a flow *regulator*, and it is the
  standard way to decouple a test-stand feed from engine back-pressure
  fluctuations.

The mass-flow uncertainty stack for a turbine meter is instructive: meter
calibration (0.25 %) ⊕ installation/profile effects (0.2 %) ⊕ density from
temperature (0.4 %) ⊕ density from pressure and EOS (0.1 %) ⊕ integration and
timing (0.1 %) ≈ 0.53 %. That is a typical, honest number, and it is why
$I_{sp}$ uncertainties below 0.4 % are rare.

#### 3.6.5 Acceleration and vibration

Accelerometers are either **piezoelectric with a charge output** (needs a
charge amplifier and low-noise cable, survives 500 K+, used on engines) or
**IEPE/ICP** (internal electronics, two-wire, cheap and convenient, limited to
about 400 K). The dominant error is not the sensor: it is the mounting.

> **Eq. 3.16** — A mounted accelerometer's usable band is roughly
> $f \le f_{mount}/3$ where $f_{mount}$ is the mounted resonance. Stud
> mounting gives $f_{mount}$ of 30–50 kHz; adhesive 10–20 kHz; a magnet
> 2–7 kHz; a handheld probe under 1 kHz. Assumes: rigid structure under the
> mount. Fails when the *structure* resonates below the mount — bracket-mounted
> accelerometers routinely report the bracket, not the engine.

An accelerometer with a mounted resonance at 5 kHz reporting a "6 kHz
component" is reporting its own mount.

#### 3.6.6 Optical

- **High-speed video** at 1–100 kfps is the cheapest diagnostic per unit
  insight in the business. It resolves ignition sequence, plume separation and
  shock structure, hardware liberation, and — with the frame timing recorded on
  the same time base as the DAQ — allows a pressure event to be tied to a
  visible one.
- **Schlieren and shadowgraph** visualise density gradients and are used on
  transparent-window subscale chambers and on nozzle exhaust to see shock
  structure and separation. They require optical access, which a real engine
  does not have.
- **Infrared thermography** gives full-field external wall temperature.
  Powerful, and treacherous: the answer depends entirely on the assumed
  surface emissivity, which changes as the surface oxidises during the test.
  Use it for gradients and hot-spot location; do not use it as an absolute
  thermometer without an in-scene reference [J].

#### 3.6.7 Data acquisition

> **Eq. 3.17** — Nyquist: to represent content up to $f_{max}$ you need
> $f_s > 2f_{max}$; energy above $f_s/2$ **aliases** down to
> $|f - n f_s|$ and is indistinguishable from real low-frequency content.
> Assumes: ideal sampling. Fails as a *sufficient* condition — 2× is the
> theoretical minimum for reconstruction, and practical measurement uses
> 5–10× for waveform fidelity and 2.56× as the standard for spectral
> analysis.

The critical corollary: **you must filter before you sample.** An anti-alias
filter is an analogue low-pass ahead of the converter, with its corner set
below $f_s/2$ and enough roll-off that content at $f_s/2$ is below the
converter's noise floor. Nothing done in software after sampling can undo
aliasing, because the aliased content is now, mathematically, a legitimate
low-frequency signal. Aliasing has been mistaken for combustion instability
more than once.

> **Eq. 3.18** — Quantization: $q = \mathrm{FS}/2^N$ and the resulting RMS
> error is $q/\sqrt{12}$ for a signal exercising many codes.
> Variables: FS = converter full-scale span; $N$ = bits. A 16-bit converter on
> a 0–10 MPa channel has $q = 153$ Pa and an RMS quantization noise of 44 Pa —
> utterly negligible against a 0.25 % FS transducer error of 25 kPa. Assumes:
> the signal spans many codes; fails for a small signal on a large range,
> where the quantization noise is correlated with the signal and shows up as
> distortion. **The lesson: range your channels.** A 70 bar transducer on a
> 5 bar signal wastes 14 of your 16 bits' worth of dynamic range, and the FS
> error term scales with the range, not with the reading.

**Sample rates in practice.** Steady performance channels (thrust, steady
$p_c$, flows, temperatures) at 100–1000 Hz. Dynamic pressure and vibration at
20–100 kHz per channel because you need to resolve the 3rd tangential mode.
Facility and sequencing channels at 10–100 Hz. All of them must share a time
base: a millisecond of skew between the thrust channel and the $p_c$ channel
makes a start-transient analysis meaningless. This is why serious stands
distribute IRIG-B time code or use a common sample clock, and why every test
begins with a synchronisation event visible on every channel.

### 3.7 Data reduction

#### 3.7.1 Filtering and the phase-lag trap

Every filter delays. A first-order (single-pole) low-pass with corner $f_c$
has magnitude $1/\sqrt{1+(f/f_c)^2}$ and phase $-\arctan(f/f_c)$, giving a
group delay of about $1/(2\pi f_c)$ in the passband. A 10 Hz filter delays by
16 ms; a 4-pole Butterworth at 10 Hz delays by roughly four times that. If you
filter a redline channel at 10 Hz, you have added 16–60 ms to your shutdown
latency, and at 400 K/s that is another 6–25 K of wall temperature.

The fix, where the timing matters, is a **zero-phase filter**: filter the
record forwards and backwards (`filtfilt`), which cancels the phase exactly at
the price of being non-causal — it uses future samples. It is therefore
available in post-test reduction and *never* available in a real-time redline
path. That asymmetry is why the redline threshold and the reported value are
computed differently and why they disagree.

#### 3.7.2 Spectra

For dynamics, the tool is the power spectral density, computed by Welch's
method: break the record into overlapping segments, window each (Hann is the
default; a rectangular window smears a tone across many bins), FFT, square,
average. Averaging reduces the variance of the estimate; the price is
frequency resolution $\Delta f = f_s/N_{fft}$.

What you look for in an engine PSD:
- **Broadband noise** rising smoothly with $p_c$: normal combustion roar.
  Typically 1–5 % of $p_c$ RMS.
- **A discrete peak at a chamber acoustic frequency** that grows with time or
  amplitude: an acoustic instability. Compare the frequency against Eq. 3.14
  and the longitudinal $f_{1L} = a_c/(2L_c)$.
- **A peak at 20–400 Hz** correlated between $p_c$ and the feed-line
  pressures: chug, a feed-system coupled mode (module 07 §3.4).
- **A peak at shaft speed or a blade-pass multiple** (blades × rpm/60):
  turbopump, not combustion.
- **A peak at a sense-line resonance** (Eqs. 3.12–3.13): your instrument.
  Verify by changing the line length and seeing the frequency move.

A **spectrogram** — PSD versus time — is the single most informative plot in
combustion-instability work, because it shows onset and growth rate, and
growth rate is what distinguishes a marginal-stability problem from a
triggered one [LRECI].

#### 3.7.3 Calibration hierarchy and traceability

Every number in a test report has a chain: the transducer was calibrated
against a laboratory standard (a deadweight tester for pressure, a reference
load cell for force), which was itself calibrated against a transfer standard,
which was calibrated at a national metrology institute. Each link adds
uncertainty and each has an expiry date. In practice, three things matter [M]:

1. **Traceability** — the chain exists and is documented.
2. **In-situ calibration** — the sensor is calibrated in the installed
   configuration where possible, because installation effects (line length,
   mounting stress, thermal gradient) are often larger than the sensor's
   catalogue error.
3. **Pre- and post-test calibration** — the difference between them is the
   only direct evidence of drift during the test, and a channel whose
   post-test calibration has shifted more than its stated uncertainty is
   *invalid data*, not slightly worse data.

#### 3.7.4 Uncertainty analysis

The framework is the GUM/ISO convention used by [CPIA-245]:

- **Type A** uncertainty is evaluated statistically from repeated
  observations: the standard deviation of the mean of $n$ samples,
  $s/\sqrt{n}$. Random noise, run-to-run scatter.
- **Type B** uncertainty is evaluated by any other means: a calibration
  certificate, a manufacturer's specification, a physical bound, engineering
  judgment. A specification quoted as "±0.25 % FS" with no distribution stated
  is conventionally treated as a rectangular distribution of half-width $a$,
  giving a standard uncertainty $a/\sqrt3$.
- Both are combined identically once expressed as standard uncertainties.

> **Eq. 3.19** — General propagation for $y = f(x_1,\dots,x_n)$ with
> independent inputs:
> $$u_y^2 = \sum_i \left(\frac{\partial f}{\partial x_i}\right)^2 u_{x_i}^2$$
> Variables: $u$ = standard uncertainty in the units of the quantity.
> Assumes: independence (no shared systematic error), and local linearity over
> the range $\pm u$. Fails when two channels share a calibration standard or a
> common temperature error — correlated errors add linearly, not in
> quadrature, and can be much larger than the RSS suggests. This is the single
> most common way an uncertainty budget lies.

For a pure product or quotient $y = \prod x_i^{a_i}$ this reduces to the
relative form used everywhere in practice:

> **Eq. 3.20** — $\dfrac{u_y}{y} = \sqrt{\sum_i a_i^2 \left(\dfrac{u_{x_i}}{x_i}\right)^2}$
> Variables: $a_i$ = the exponent of $x_i$. So a quantity that depends on the
> square of a measured diameter inherits *twice* that diameter's relative
> uncertainty. Assumes independence. Note the essential asymmetry: **products
> combine relative uncertainties; sums combine absolute ones.**

Applying it to specific impulse, $I_{sp} = F/(\dot m g_0)$:

$$\frac{\partial I_{sp}}{\partial F} = \frac{1}{\dot m g_0} = \frac{I_{sp}}{F},
\qquad
\frac{\partial I_{sp}}{\partial \dot m} = -\frac{F}{\dot m^2 g_0} = -\frac{I_{sp}}{\dot m}$$

so

> **Eq. 3.21** — $\dfrac{u_{I_{sp}}}{I_{sp}} = \sqrt{\left(\dfrac{u_F}{F}\right)^2 + \left(\dfrac{u_{\dot m}}{\dot m}\right)^2}$
> Variables: as above; $g_0$ is a defined constant and contributes nothing.
> Assumes: $F$ and $\dot m$ independently measured — which is *false* if the
> reduction used a flow computed from $p_c$ and $c^*$, in which case the two
> are perfectly correlated and this formula understates the uncertainty
> badly. Fails exactly there, and that failure is common in hobbyist and
> early-programme data.

The same machinery on $c^* = p_{c,ns}A_t/\dot m$ gives
$u_{c^*}/c^* = \mathrm{RSS}(u_p/p,\ u_{A_t}/A_t,\ u_{\dot m}/\dot m)$, and with
$A_t = \pi D_t^2/4$, $u_{A_t}/A_t = 2u_{D_t}/D_t$.

Finally, **report an expanded uncertainty with its coverage factor.** $U = k u$
with $k = 2$ is the ≈95 % convention. "$I_{sp} = 263.2 \pm 1.3$ s
($k=2$)" is a statement; "$I_{sp} = 263.2$ s" is a hope.

#### 3.7.5 Noise sources

- **Electromagnetic interference.** Ignition exciters, solenoid valves,
  variable-frequency drives and welding equipment inject spikes. Mitigation:
  shielded twisted-pair, differential inputs, physical separation of power and
  signal runs, and never routing a millivolt-level thermocouple lead next to a
  28 V solenoid line.
- **Ground loops.** A shield or a sensor body grounded at two points with a
  potential difference between them drives current through the signal return,
  appearing as a 50/60 Hz component and its harmonics. Ground at one point
  only. A 50 Hz peak in a PSD that persists with the engine off is a ground
  loop, not physics.
- **Cable microphonics and triboelectric noise.** Coaxial cable flexed in a
  vibration field generates charge, which a charge amplifier faithfully
  amplifies. This is the dominant noise source for piezoelectric
  instrumentation on a running engine, and it is fixed mechanically — clamp
  the cable every 150–200 mm — not electrically.
- **Thermal EMF and cold-junction error.** Every dissimilar-metal junction in
  a thermocouple circuit is itself a thermocouple. A poorly controlled
  cold-junction reference is a direct offset on every temperature channel.
- **Common-mode.** Long bridge cables in a high-noise environment pick up
  large common-mode voltages; the defence is a genuinely differential
  amplifier with high common-mode rejection, and it degrades if the two legs
  have unequal source impedance.

### 3.8 Reading a test plot

Here is a described trace. Work through it before reading the interpretation.

A 100 kN LOX/RP-1 development engine, 40 s planned duration, sea-level stand.
Channels: chamber pressure $p_c$ (injector-end tap, 2 kHz), close-coupled
dynamic chamber pressure $p_c'$ (100 kHz), thrust $F$ (1 kHz), oxidiser and
fuel turbine-meter flows (500 Hz), fuel-manifold pressure (2 kHz), throat-region
wall thermocouple (100 Hz, sheathed, $\tau \approx 0.3$ s).

- **t = 0.00–0.35 s.** Igniter on; $p_c$ rises to 4 % of nominal and holds.
  Both flows near zero.
- **t = 0.35–0.90 s.** Main valves open; $p_c$ rises to 62 bar with a single
  overshoot to 71 bar at t = 0.55 s, settling by t = 0.9 s. $F$ follows,
  lagging $p_c$ by about 8 ms.
- **t = 0.9–6.0 s.** Steady. $p_c = 62.0$ bar, $F = 99.0$ kN,
  $\dot m_o = 26.8$ kg/s, $\dot m_f = 11.6$ kg/s. The dynamic channel shows
  broadband noise at 1.8 % of $p_c$ RMS with no discrete peaks. Wall TC rising
  smoothly, 480 K at t = 6.
- **t = 6.0–6.4 s.** A 210 Hz oscillation appears on $p_c$, on $p_c'$, and on
  the fuel-manifold pressure, in phase between the two pressures, at ±4 % of
  $p_c$ growing to ±9 %. Thrust shows the same 210 Hz at ±4 %. Both flow
  channels show 210 Hz at ±3 %. Amplitude then stops growing and holds.
- **t = 12.0 s.** Over about 300 ms, $\dot m_o$ falls by 4 % while $\dot m_f$
  is unchanged; $p_c$ falls by 1.6 %; $F$ falls by 2.1 %; the wall TC begins to
  *rise* faster than before, gaining an additional 3 K/s.
- **t = 12.0–28.0 s.** New steady state. The 210 Hz oscillation is now ±5 %.
- **t = 28.4 s.** Wall TC crosses its 900 K redline; automatic shutdown; valves
  closed at t = 28.46 s; $p_c$ below 10 % by t = 28.62 s.

*What happened.* The 210 Hz feature is **chug**: it appears on the feed side
as well as in the chamber, it is in the 20–400 Hz band, it is coherent with
the flow channels, and it saturates rather than growing exponentially — all
signatures of a low-frequency feed-system-coupled oscillation, not an acoustic
mode. Check the acoustic modes to be sure: a 0.30 m chamber has $f_{1T}
\approx 2150$ Hz and $f_{1L} \approx 1100$ Hz, both a decade above 210 Hz. It
is not the sense line either — a sense-line resonance would appear on $p_c$ but
*not* on the close-coupled $p_c'$ and not on the flows.

The t = 12.0 s event is a **mixture-ratio shift**: oxidiser flow alone drops
4 %, taking MR from 2.31 to 2.22, which is fuel-rich of the previous point.
Three candidate causes, distinguished by other evidence: (a) an oxidiser-side
flow restriction, which would show as a *rise* in oxidiser manifold pressure
at constant upstream pressure — check that channel; (b) a real change in
delivered oxidiser flow from the facility, which would show on the tank or
run-line pressure; (c) a turbine-meter fault or a cavitation event in the
meter, which would show as a noisy or stepped flow signal rather than a smooth
300 ms transition, and would *not* be corroborated by $p_c$ and $F$. Here
$p_c$ and $F$ both moved consistently with a real flow loss ($c^*$ actually
went *up* slightly, as expected moving fuel-rich toward peak $c^*$ for
kerolox), so the sensor-fault hypothesis is dead: an instrumentation failure
does not move the thrust.

The wall temperature rising faster after the shift is the corroborating
physical evidence and the thing that ends the test. It is *not* what a naive
reading predicts — going fuel-rich should lower the flame temperature. But the
wall in question is the throat region of a film-cooled chamber whose film is
fuel; reducing oxidiser flow at constant fuel flow changed the core-to-film
momentum balance and degraded the film's coverage, and that dominates the bulk
temperature effect. The lesson is general: **wall temperature responds to the
near-wall mixture ratio, which is not the global mixture ratio.**

Finally, the wall TC has $\tau \approx 0.3$ s and was rising at roughly
10 K/s at shutdown, so its 140 ms of lag corresponds to about 3 K — small here.
Had the excursion been a fast one at 400 K/s, the same sensor would have been
120 K behind and the redline would have fired far too late.

### 3.9 Test safety principles

This section is about *why* the practices exist, at the level of engineering
principle. It is not a procedure and must not be read as one.

**Remote operation.** Nobody is near a running engine, ever. The reason is not
squeamishness: it is that the credible failure of a liquid engine is a
release of tonnes of propellant in seconds with an ignition source guaranteed
to be present, and no protective equipment addresses that. Test control is
from a blockhouse or a remote control room, the countdown includes an
area-clear verification, and the hazard extends into the post-test period —
trapped cryogen, an un-vented pressurised line, and residual hypergols are all
lethal after the engine has stopped.

**Quantity–distance.** Facility siting uses the standard cube-root scaling of
blast radius with explosive equivalent:

> **Eq. 3.22** — $R = K\,W^{1/3}$
> Variables: $R$ = required separation [m]; $W$ = net explosive weight or
> propellant TNT equivalent [kg]; $K$ = a scaling constant set by the
> protection level required (personnel, inhabited building, public traffic
> route). Assumes: an idealised free-field blast and a stated equivalence
> factor for the propellant combination — LOX/hydrocarbon and LOX/LH₂ have
> very different published equivalence factors and the numbers are
> facility-specific. Fails to address fragment throw, which frequently governs
> at large $W$, and cryogenic vapour-cloud drift, which governs downwind
> hazard rather than blast.

The engineering consequence is that stand spacing, control-room siting, and
maximum on-stand propellant inventory are all coupled decisions, and that
"just add another tank" changes the site plan.

**Purge and inerting.** The philosophy is that no oxidiser and no fuel ever
share a volume except inside the chamber during a commanded burn. In practice
this means: gaseous nitrogen or helium purge of every manifold, cavity and
seal drain before, during and after operation; interpropellant seals with a
vented, purged cavity between them so that a leak of either propellant vents
overboard rather than accumulating; a purge that continues through shutdown
and into the post-test period, because the residual propellant boiling out of
a warm manifold is exactly the hazard. Helium rather than nitrogen where the
temperature is low enough to freeze nitrogen — in LH₂ and LOX systems nitrogen
solidifies and plugs. Hydrogen adds its own set: the flame is nearly invisible
in daylight, the buoyancy carries it up rather than pooling, and the
flammability range is extraordinarily wide (about 4–75 % in air), so hydrogen
facilities are designed around detection and around never confining a leak
[G-095].

**Redlines.** A redline is a measured parameter with a limit and an automatic
consequence: exceed it and the sequencer commands shutdown without human
intervention. The common set for a liquid engine [M]:

| redline | why | what it catches |
|---|---|---|
| $p_c$ low | thrust is proportional to $p_c$ | failure to ignite, feed failure, burn-through |
| $p_c$ high | structural limit of the chamber | valve or regulator failure, MR excursion |
| turbine inlet/discharge temperature high | turbine blade life is exponential in temperature | preburner or GG mixture-ratio excursion |
| turbopump shaft speed high | burst margin of the impeller | turbine over-drive, cavitation-induced load loss |
| turbopump vibration (RMS in a band) high | bearing or seal degradation, rubbing | incipient rotordynamic failure |
| chamber or nozzle wall temperature high | liner is about to melt | coolant flow loss, film-cooling loss, streaking |
| coolant $\Delta p$ or $\Delta T$ out of band | cooling circuit integrity | blockage, channel breach |
| MR out of band | thermal and structural envelope | flow-control or valve position fault |

**How a redline is set.** Not at the failure value. The limit is placed at the
failure value minus the accumulated damage during the detection latency, minus
the measurement uncertainty, minus the normal operating scatter, and it must
still be above the worst-case *nominal* excursion or you will scrub good
tests. That squeeze is the entire art:

$$\text{redline} = \text{limit} - \underbrace{\dot X\, t_{lat}}_{\text{latency}} - \underbrace{k\,u_X}_{\text{measurement}} - \underbrace{\Delta X_{scatter}}_{\text{normal variation}}$$

**Why redlines have latency, and how much.** [F] The chain from physical event
to propellant valve closed:

> **Eq. 3.23** — $t_{lat} = \tau_{sensor} + t_{filter} + t_{sample} + t_{logic} + t_{valve}$
> Typical magnitudes: $\tau_{sensor}$ 1–500 ms (a sheathed thermocouple is the
> worst offender by two orders of magnitude); $t_{filter}$ 1–50 ms;
> $t_{sample}$ = 1–2 sample intervals, plus the persistence requirement (a
> redline usually requires $N$ consecutive out-of-limit samples to reject
> noise, and that is a deliberate purchase of latency to avoid nuisance
> shutdowns); $t_{logic}$ 1–20 ms including any two-out-of-three voting;
> $t_{valve}$ 20–200 ms for a large main valve to stroke, plus the chamber's
> own blowdown time. Assumes each stage is serial. Fails to capture the case
> where the sensor is not measuring the failing thing at all — a wall
> thermocouple 30 mm from a burn-through sees it late or never.

Total is realistically 50–500 ms, dominated by the thermocouple at one end and
the valve at the other. In 200 ms a 100 kN engine passes about 7 kg of
propellant and a burn-through grows substantially. **This is why redlines are
a damage-limitation system, not a protection system**, and why the real
protection is the design margin and the pre-test verification, not the
sequencer [J].

---

## 4. Typical engineering ranges

| quantity | typical range | where the extremes sit |
|---|---|---|
| Proof factor $k_p$, metallic | 1.1–1.5 × MEOP | varies by standard and revision [STD-5001][AIAA-S-080] |
| Burst factor $k_b$, metallic | 1.5–2.0 × MEOP | manned systems at the high end |
| Life factor for qualification | 1.2–4 × flight life | 4× for reusable, human-rated hardware |
| Injector $C_d$ from cold flow | 0.6–0.9 | sharp-edged short orifice low; contoured, $L/D>4$ high |
| $\eta_{c^*}$, development first fire | 0.88–0.94 | a bad first injector |
| $\eta_{c^*}$, mature engine | 0.96–0.995 | shear-coax LOX/LH₂ at the top |
| $\eta_{C_f}$ | 0.95–0.99 | high-area-ratio bells with thick boundary layers at the low end |
| $p_{c,ns}/p_{c,inj}$ | 0.97–0.995 | $\varepsilon_c = 2$ at the low end, $\varepsilon_c \ge 5$ at the high |
| Thrust measurement uncertainty | 0.25–0.5 % | 0.15 % on an exceptional, freshly calibrated stand |
| Mass-flow uncertainty, turbine meter + density | 0.4–0.8 % | 0.2 % with a Coriolis meter on a warm propellant |
| $I_{sp}$ uncertainty, well-run test | 0.4–0.7 % | ≈1.5–2 s on a kerolox engine |
| Chamber pressure transducer accuracy | 0.1–0.5 % FS | piezoresistive at the low end, over a narrow temperature range |
| Steady-channel sample rate | 100–1000 Hz | |
| Dynamic-pressure sample rate | 20–100 kHz | to resolve 3T modes above 10 kHz |
| Sheathed wall TC time constant | 0.1–1 s | bare fine-wire bead: 1–20 ms |
| Exposed fine-wire TC time constant | 1–20 ms | fragile, short-lived in a rocket chamber |
| Thrust-stand resonance | 20–100 Hz | small thruster stands designed higher |
| Redline detection-to-shutdown latency | 50–500 ms | thermocouple-based redlines at the high end |
| Broadband combustion noise | 1–5 % of $p_c$ RMS | above 5 % is a problem, not noise |
| Instability rating: bomb recovery time | ≤ 40–50 ms | the F-1 requirement was damping within 45 ms |
| Cavitation criterion | 3 % head drop | a convention, not a physical threshold |
| Random-vibration qualification band | 20–2000 Hz | per [SMC-S-016] / [STD-7001] tailoring |

---

## 5. Worked examples

### WE1 — Reducing a hot-fire dataset to $c^*$, $C_f$ and efficiencies

**Given** (a single 40 s LOX/RP-1 development firing on a sea-level stand):

| measured | value |
|---|---|
| Axial thrust $F$ | 99.10 kN |
| Chamber pressure, injector-end tap $p_{c,inj}$ | 6.550 MPa (950 psia) |
| Oxidiser mass flow $\dot m_o$ | 26.80 kg/s |
| Fuel mass flow $\dot m_f$ | 11.60 kg/s |
| Throat area $A_t$ (hot, corrected) | $1.0029\times10^{-2}$ m² |
| Nozzle area ratio $\varepsilon$ | 12.0 |
| Chamber contraction ratio $\varepsilon_c$ | 4.0 |
| Ambient pressure $p_a$ | 101 325 Pa |

Reference gas properties for LOX/RP-1 at this MR and $p_c$ (module 04):
$\gamma = 1.20$, $\mathcal{M} = 23.0$ kg/kmol, $T_c = 3670$ K.

**Step 1 — total flow and mixture ratio.**
$$\dot m = 26.80 + 11.60 = 38.40\ \mathrm{kg/s}, \qquad
MR = \frac{26.80}{11.60} = 2.310$$

**Step 2 — correct the chamber pressure to the nozzle-stagnation station.**
Invert the subsonic area relation at $\varepsilon_c = 4.0$, $\gamma = 1.20$:
$M_c = 0.1498$. Then from Eq. 3.10:
$$\frac{p_{c,ns}}{p_{c,inj}} = \frac{(1 + 0.10\times0.1498^2)^{6}}{1 + 1.20\times0.1498^2}
= \frac{1.01352}{1.02693} = 0.98694$$
$$p_{c,ns} = 0.98694 \times 6.550\ \mathrm{MPa} = 6.4645\ \mathrm{MPa}$$
A 1.31 % correction — and it is the difference between a defensible efficiency
and a wrong one.

**Step 3 — measured $c^*$ (Eq. 3.7).**
$$c^*_{meas} = \frac{6.4645\times10^6 \times 1.0029\times10^{-2}}{38.40}
= \frac{64\,832}{38.40} = 1688.4\ \mathrm{m/s}$$

**Step 4 — measured $C_f$ and $I_{sp}$ (Eq. 3.8).**
$$C_{f,meas} = \frac{99\,100}{6.4645\times10^6 \times 1.0029\times10^{-2}}
= \frac{99\,100}{64\,832} = 1.5285$$
$$I_{sp,meas} = \frac{99\,100}{38.40 \times 9.80665} = 263.2\ \mathrm{s}$$
Check the consistency: $c^*C_f/g_0 = 1688.4\times1.5285/9.80665 = 263.2$ s. ✓

**Step 5 — reference (ideal) values.**
$R = 8314.46/23.0 = 361.50$ J/(kg·K), and
$$c^*_{ideal} = \frac{\sqrt{R T_c}}{\Gamma(\gamma)}
= \frac{\sqrt{361.50\times3670}}{0.64853} = \frac{1151.9}{0.64853} = 1776.1\ \mathrm{m/s}$$
$$C_{f,ideal}(\gamma=1.20,\ \varepsilon=12,\ p_0 = 6.4645\ \mathrm{MPa},\ p_a = 101\,325\ \mathrm{Pa}) = 1.5764$$
(The exit-plane check: $M_e = 3.405$, $p_e = 63.7$ kPa, $p_e/p_a = 0.63$ —
overexpanded, but above the Summerfield separation threshold of ≈0.4, so the
nozzle is running full and the ideal $C_f$ is the right comparison.)

**Step 6 — efficiencies (Eq. 3.9).**
$$\eta_{c^*} = \frac{1688.4}{1776.1} = 0.9506, \qquad
\eta_{C_f} = \frac{1.5285}{1.5764} = 0.9696$$
$$\eta_{overall} = 0.9506\times0.9696 = 0.9218$$

**What if you had used the injector-end pressure?** $c^*$ would come out at
1802.1 m/s, giving $\eta_{c^*} = 1.015$ — greater than unity, which is
thermodynamically impossible and is the classic tell that the pressure station
is wrong. $\eta_{C_f}$ would fall to 0.903. The product is unchanged.

**Sanity check.** $\eta_{c^*} = 0.951$ is a mediocre-but-real injector: worse
than a mature shear-coaxial LOX/LH₂ engine (0.98+), consistent with an early
impinging or pintle development unit. $I_{sp} = 263$ s sea-level for kerolox
at 65 bar and $\varepsilon = 12$ sits sensibly below the Merlin 1D's 282 s at
97 bar and $\varepsilon = 16$. The immediate engineering action is injector
work, not nozzle work: the 4.9 % $c^*$ shortfall is three times the 3.0 %
$C_f$ shortfall and is the cheaper one to attack.

### WE2 — Uncertainty budget for $I_{sp}$ and $c^*$

**Given** the same test, with these standard uncertainties (already converted
to one-sigma relative form):

| source | relative $u$ |
|---|---|
| Load-cell calibration | 0.20 % |
| Thrust-stand tare and alignment | 0.25 % |
| Load-cell zero drift over the run | 0.10 % |
| Oxidiser turbine meter + density | 0.50 % of $\dot m_o$ |
| Fuel Coriolis meter | 0.20 % of $\dot m_f$ |
| Chamber pressure transducer | 0.25 % |
| $p_{c,ns}$ correction model | 0.15 % |
| Throat diameter $D_t$ | 0.10 % |

**Step 1 — thrust.** These three are independent, so RSS (Eq. 3.19):
$$\frac{u_F}{F} = \sqrt{0.0020^2 + 0.0025^2 + 0.0010^2} = 0.003354 = 0.335\ \%$$

**Step 2 — total mass flow. This is a sum, so combine absolutes.**
$$u_{\dot m_o} = 0.0050\times26.80 = 0.1340\ \mathrm{kg/s},\qquad
u_{\dot m_f} = 0.0020\times11.60 = 0.0232\ \mathrm{kg/s}$$
$$u_{\dot m} = \sqrt{0.1340^2 + 0.0232^2} = 0.1360\ \mathrm{kg/s}
\Rightarrow \frac{u_{\dot m}}{\dot m} = \frac{0.1360}{38.40} = 0.354\ \%$$
Note what happened: the fuel meter is twice as good and carries only a third of
the flow, so it contributes essentially nothing. **The oxidiser meter is the
entire flow uncertainty**, and that is where money should go.

**Step 3 — specific impulse.** From Eq. 3.21, with
$\partial I_{sp}/\partial F = I_{sp}/F$ and
$\partial I_{sp}/\partial \dot m = -I_{sp}/\dot m$:
$$\frac{u_{I_{sp}}}{I_{sp}} = \sqrt{0.003354^2 + 0.003541^2} = 0.004878 = 0.488\ \%$$
$$u_{I_{sp}} = 0.004878\times263.2 = 1.28\ \mathrm{s}$$
Reported at $k=2$: $I_{sp} = 263.2 \pm 2.6$ s (95 %).

**Step 4 — throat area.** $A_t \propto D_t^2$, so from Eq. 3.20 the exponent
is 2:
$$\frac{u_{A_t}}{A_t} = 2\times0.0010 = 0.200\ \%$$

**Step 5 — chamber pressure at the nozzle station.**
$$\frac{u_p}{p} = \sqrt{0.0025^2+0.0015^2} = 0.002915 = 0.292\ \%$$

**Step 6 — characteristic velocity.** $c^* = p_{c,ns}A_t/\dot m$ is a pure
product/quotient:
$$\frac{u_{c^*}}{c^*} = \sqrt{0.002915^2 + 0.00200^2 + 0.003541^2} = 0.005004 = 0.500\ \%$$
$$u_{c^*} = 0.005004\times1688.4 = 8.4\ \mathrm{m/s}$$
so $\eta_{c^*} = 0.951 \pm 0.005$ (one sigma), *before* adding the uncertainty
of the CEA reference value itself.

**Sanity check.** 0.49 % on $I_{sp}$ and 0.50 % on $c^*$ are typical of a
well-run development stand [CPIA-245]. Two consequences fall straight out.
First, a claimed 0.3 % $I_{sp}$ improvement from an injector change **is not
measurable in a single test** — it is a fifth of the standard uncertainty; you
need either a better flow measurement or repeated tests, since $n$ repeats cut
the Type A part by $\sqrt n$ while leaving the systematic part untouched.
Second, the systematic part does not shrink with repeats at all, which is why
back-to-back A/B testing of two injectors on the same stand, same instruments,
same day is enormously more sensitive than comparing two absolute numbers:
the shared systematic errors cancel in the difference.

### WE3 — What the thermocouple did not tell you

**Given.** A sheathed Type K wall thermocouple, time constant $\tau = 0.35$ s
in this installation (determined from a step response during chill-down). A
cooling-passage blockage causes the true wall temperature to ramp at
$\dot R = 400$ K/s starting from 700 K. The wall redline is 900 K. The liner
melts at 1350 K.

**Step 1 — the steady-state ramp lag.** With
$T_{true} = 700 + 400t$, the first-order solution is
$$T_i(t) = 700 + 400\left[t - \tau\left(1 - e^{-t/\tau}\right)\right]$$
After a few time constants the bracket becomes $t - \tau$, so
$$T_{true} - T_i \to \dot R\,\tau = 400\times0.35 = 140\ \mathrm{K}$$
The indicated temperature is 140 K low, permanently, for the duration of the
ramp.

**Step 2 — when does the redline actually fire?** Solve
$700 + 400\left[t - 0.35(1-e^{-t/0.35})\right] = 900$, i.e.
$t + 0.35e^{-t/0.35} = 0.85$. The asymptotic form ($t = 0.85$ s) is a little
late because the lag has not fully developed; iterating gives
$$t = 0.816\ \mathrm{s}$$
At that moment the true wall temperature is
$$T_{true} = 700 + 400\times0.816 = 1026\ \mathrm{K}$$
The sensor says 900 K. The wall is at 1026 K.

**Step 3 — add the rest of the latency.** Filter 20 ms, sampling with a
3-sample persistence requirement at 100 Hz = 30 ms, logic 10 ms, main-valve
stroke 120 ms: $t_{lat,extra} = 0.18$ s. The wall gains a further
$400\times0.18 = 72$ K, and chamber pressure does not fall instantly after
that either.
$$T_{true,\ \text{at valve close}} \approx 1026 + 72 = 1098\ \mathrm{K}$$
against a 900 K redline and a 1350 K melt point. The margin that looked like
450 K on the display is actually 252 K of real wall temperature, and 252 K at
400 K/s is 0.63 s. The redline is doing something, but it is not "protecting"
anything — it is spending most of its apparent margin on its own latency.

**Step 4 — the compensated reading.** Since $T_{true} = T_i + \tau\,dT_i/dt$,
the lag is recoverable in real time from the sensor's own derivative. Take the
instant $t = 0.55$ s in the same event: the sensor reads
$T_i = 700 + 400[0.55 - 0.35(1-e^{-1.571})] = 809$ K and is rising at
$dT_i/dt = 400(1 - e^{-1.571}) = 317$ K/s. Then
$$T_{true} = 809 + 0.35\times317 = 920\ \mathrm{K}$$
which is exactly $700 + 400\times0.55$. The compensation recovers all 111 K the
sensor was hiding at that instant. The cost is that differentiating a noisy
channel amplifies its noise by roughly $\tau/\Delta t$ per sample, so this
belongs in post-test reduction and in a carefully filtered control law, never
naively in a redline comparator.

**Sanity check.** The whole result turns on $\tau$, which is a property of
*this installation* — bead size, sheath, contact, local $h$ — and not of the
thermocouple type. This is why credible programmes measure the in-situ time
constant (a step from a chill-down, or a small resistive self-heating pulse)
rather than quoting a catalogue number, and why a fine-wire TC at $\tau = 5$ ms
would have had a 2 K ramp lag instead of 140 K. The engineering conclusion is
blunt: **if the redline parameter can change fast, the sensor must be fast, or
the redline must be set for the sensor you have.**

### WE4 — Would you see the instability at all?

**Given.** A 0.30 m internal-diameter development chamber, chamber sound speed
$a_c \approx 1100$ m/s, chamber length 0.50 m. Two candidate
instrumentation installations:

- **(A)** A strain-gauge transducer at the end of a 3.0 m nitrogen-filled
  sense line ($a = 353$ m/s at 300 K), the standard "safe" installation.
- **(B)** A close-coupled piezoresistive transducer in a 0.30 m long, 1.6 mm
  diameter passage opening into a 0.10 cm³ cavity, same fluid.

**Step 1 — what are we trying to see?** First tangential (Eq. 3.14):
$$f_{1T} = \frac{1.8412\times1100}{\pi\times0.30} = 2149\ \mathrm{Hz}$$
First longitudinal: $f_{1L} = a_c/(2L_c) = 1100/(2\times0.50) = 1100$ Hz.
Chug, if present, would be 20–400 Hz.

**Step 2 — installation A, quarter-wave (Eq. 3.12).**
$$f_{1/4} = \frac{353}{4\times3.0} = 29.4\ \mathrm{Hz}$$
The line's own first resonance is at 29 Hz. Useful response ends around
$f_{1/4}/3 \approx 10$ Hz. This installation cannot see the 1T mode, cannot see
the 1L mode, and cannot even see chug — and worse, it will *ring at 29 Hz* in
response to the start transient, producing a decaying oscillation that a
careless reader will call an instability. It measures steady chamber pressure
and nothing else, which is exactly what it should be used for.

**Step 3 — installation B, Helmholtz (Eq. 3.13).**
$$A = \frac{\pi (1.6\times10^{-3})^2}{4} = 2.011\times10^{-6}\ \mathrm{m^2},
\qquad L_{eff} = 0.30 + 0.6\times0.8\times10^{-3} \approx 0.3005\ \mathrm{m}$$
$$f_H = \frac{353}{2\pi}\sqrt{\frac{2.011\times10^{-6}}{1.0\times10^{-7}\times0.3005}}
= 56.18\times\sqrt{66.9} = 460\ \mathrm{Hz}$$
Better by a factor of 16, and now chug is visible with reasonable fidelity
(460/3 ≈ 150 Hz of clean bandwidth, marginal at 210 Hz). But it is still a
factor of 4.7 below the 1T mode. **Installation B would also miss the
instability**, and would report the 1T mode — if any energy leaked through at
all — attenuated by roughly $1/[(f/f_H)^2-1] \approx 0.05$, i.e. a real ±15 %
$p_c$ oscillation shown as ±0.7 %. That is the difference between "we have a
serious instability" and "combustion is a bit rough."

**Step 4 — what actually works.** Flush-mount the piezoresistive sensor in the
chamber wall with a passage no longer than a few millimetres. With
$L_{eff} = 4$ mm and the same cavity, $f_H = 460\sqrt{300.5/4} = 3990$ Hz —
finally above 1T, though only by a factor of 1.9, so a phase and amplitude
correction is still needed near 2 kHz. The genuinely correct answer for
instability work is a recessed-mount sensor with a cooled adapter and a
*measured* installed frequency response, not a calculated one.

**Sanity check.** This is exactly why combustion-instability development
chambers carry dedicated high-frequency ports and why flight engines usually
do not: flight $p_c$ instrumentation exists for control and redlines, and
30 Hz is plenty for that, while stability is demonstrated on the ground with
close-coupled sensors and bomb tests. Anyone claiming to have measured a
tangential mode on an engine instrumented only through sense lines has
measured their plumbing.

---

## 6. Real engines: why did they design it that way?

### RS-25 / SSME — instrumentation as a design constraint

The SSME is the most heavily instrumented liquid engine ever flown, and this
was a consequence of the cycle, not a preference. A fuel-rich staged-combustion
engine has no benign failure modes: the preburners feed hot gas directly to the
turbines, so a preburner mixture-ratio excursion is a turbine failure a few
hundred milliseconds later, and there is no dump path. The engine therefore
carries a digital controller with redundant channels and a redline set whose
core members are the ones that catch that chain — chamber pressure, preburner
and turbine temperatures, turbopump speeds, and turbopump vibration — plus
enough steady instrumentation for the controller to close a closed-loop
thrust and mixture-ratio control law rather than merely observing
[SSME-Orient][Biggs89].

**The alternative available at the time** was open-loop control with
pre-set orifices and a small monitoring set, which is what the F-1 and J-2 had.
That works when the engine has an inherently benign failure mode and a wide
operating band. It does not work for an engine that must throttle 67–109 %,
hold mixture ratio to a fraction of a percent for propellant-utilisation
reasons, and be reused. Closed-loop control forced accurate real-time
measurement, and accurate real-time measurement forced redundancy, and
redundancy forced the controller. The instrumentation is downstream of the
cycle choice.

The programme also learned the hard way that a redline is only as good as the
sensor behind it: the SSME development history includes failures where the
first indication was structural rather than instrumental, and the response was
not "add more redlines" but "change the hardware" — bearings, seals, LOX-post
geometry [Biggs89]. **Would a modern engineer do the same?** Yes on closed-loop
control and yes on the redline set, but with far more high-frequency channels
and a health-monitoring layer that looks at spectral features rather than
scalar limits — which is now feasible only because the computing is free.

### Merlin — acceptance testing as the quality system

SpaceX's approach inverts the classical emphasis. Rather than an extremely
extensive qualification campaign on a small number of articles, Merlin's
programme rests on hot-firing **every engine** before delivery, hot-firing
**every stage** with all engines installed, and static-firing the integrated
vehicle. Combined with vehicle-level engine-out capability — the Falcon 9
first stage flies nine engines and can lose one and still complete the primary
mission, as it did on CRS-1 in 2012 — this converts engine reliability from a
"prove it cannot fail" problem into a "screen it and survive it" problem [J].

**The alternatives available** were the traditional ones: a very long
qualification campaign per engine block, plus sampling acceptance (fire one in
ten). Sampling is cheaper per engine and is the historical norm for
mass-produced engines; it screens design and process drift but not individual
workmanship escapes. Firing every engine only makes sense if the marginal cost
of a test is low, which requires a dedicated high-cadence facility and an
engine designed to be fired repeatedly without refurbishment — which is
exactly what a gas-generator kerolox engine at 97 bar with a pintle injector
gives you. The acceptance philosophy and the engine architecture were chosen
together. **A modern engineer would do the same** for a high-cadence
programme, and would not for a programme building four engines a year, where
the qualification-heavy path is cheaper.

### F-1 — the bomb-rating test

Rocketdyne could not analyse their way out of the F-1's combustion
instability; the theory of the day could not predict which injector patterns
would be stable. So they made stability a *measured* property. The rating test
detonated a small explosive charge inside the running chamber at full thrust
and required the resulting pressure oscillation to decay within a specified
time — 45 ms in the F-1's case — with no residual oscillation. Roughly 2,000
tests across 210 injector designs, 15 baffle designs and 14 injector
configurations got them a face that passed [F1-R3896][SP-4206].

This is a profound methodological move [H]. It replaces "we believe this is
stable" with "we have measured its response to a known finite-amplitude
disturbance", which converts an unknowable into a pass/fail criterion. It
also, crucially, tests *nonlinear* stability: an engine can be linearly stable
and still be triggered into a limit cycle by a large enough disturbance, and
only a bomb or a pulse gun finds that out. The methodology was codified and is
still standard — bombs, pulse guns and directed-flow disturbances are the
three canonical rating methods [SP-194][SP-8113][LRECI].

**The alternative** was analysis, which did not exist in usable form, or
flight experience, which is unacceptable. **A modern engineer would still do
this**, and does: stability rating by artificial disturbance remains the
accepted demonstration, because CFD still cannot certify a combustor's
nonlinear stability boundary [LRECI][R].

### RL10 — why an upper-stage engine needs an altitude chamber

An engine with $\varepsilon = 61$ (RL10A-3-3A) or 280:1 (RL10B-2) cannot be
fired at sea level. At $p_c = 32.8$ bar and $\varepsilon = 61$ the ideal exit
pressure is far below the Summerfield separation threshold, so at sea level
the nozzle separates violently, generating enormous side loads that would tear
the extension off and destroy the bearing. The RL10B-2's extendible carbon
nozzle physically cannot be deployed in air at all.

Altitude test facilities solve this with a **diffuser**: a duct downstream of
the nozzle sized so that the engine's own exhaust momentum, entering a
convergent–divergent second throat, pumps the test cell down and holds it
there. A **steam ejector** train is added to establish the low cell pressure
before ignition and to handle start transients. The US facilities that matter
historically are AEDC's rocket test cells (the J-4 and J-6 large altitude
cells, used for upper-stage and solid-motor firings) and NASA Glenn's Plum
Brook Station **B-2**, which combines altitude simulation with thermal-vacuum
capability and can test a complete upper stage [SP-4230].

**The alternatives** were sea-level firing of a truncated nozzle (you get
$c^*$ and chamber behaviour but not $C_f$, and you never test the real nozzle),
or analysis alone. Neither closes the case for a stage that must start in
vacuum, restart after a coast, and survive the thermal environment of a long
coast — all of which B-2-class facilities exist to demonstrate. **A modern
engineer would still do it** and does: upper-stage engines are still
altitude-tested, and the facility shortage is a real constraint on the
industry.

### SLS core stage — the green run argument

The SLS core-stage Green Run at Stennis in 2020–2021 fired all four RS-25
engines installed in the flight core stage, fed from the flight tanks through
the flight main-propulsion system, under flight software. The first attempt in
January 2021 shut down early (about 67 s) on a conservative hydraulics test
limit and a subsequent thrust-vector-control parameter; the second attempt in
March 2021 ran the full ≈500 s duration [M].

The argument for doing it is the pyramid argument in its purest form: the core
stage is the first level at which the flight tanks, the flight feedlines, the
engine cluster's mutual interaction, the pressurisation system, and the flight
software all exist together, and none of those interactions is verified by
firing engines individually on a test stand. The argument against — made
seriously within the programme — is that it consumes a substantial fraction of
the flight article's life, risks damaging the only article, and costs a year.
Both arguments are correct; the decision is a judgment about which risk is
larger, and it turns almost entirely on how novel the stage is [J]. The first
attempt's early shutdown is itself evidence for the practice: it exposed
limits set too tightly, which is precisely the sort of thing you want to
discover on the ground.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The standing trade-offs

**Instrumentation versus fidelity.** Every port is a hole in a pressure vessel,
a leak path, a stress concentration and a cooling discontinuity. A heavily
instrumented development chamber is not the flight chamber, and the difference
is not always negligible — a recessed high-frequency port is also a small
acoustic cavity that can change the local stability. You always instrument
more than you will fly, and you always carry the risk that the instrumentation
changed the answer.

**Redline tightness versus test completion.** Tight redlines protect hardware
and terminate good tests; loose redlines complete tests and lose hardware. The
economics differ by programme phase: in early development, hardware is cheap
relative to information and the redlines are loose; in qualification, the
hardware is expensive and rare and the redlines are tight.

**Sample rate versus data volume and channel count.** A 100 kHz channel is
360 million samples an hour. Modern storage makes this a non-issue for a
handful of channels and a real issue at 500. The practical answer is tiered:
everything at a low rate continuously, a subset at high rate continuously, and
a circular buffer at very high rate that is committed to disk only around
triggers.

**Subscale versus full scale.** A subscale chamber is 10–20 % of the cost and
answers questions about injector element performance and heat flux at the
element level. It does not answer questions about stability (acoustic
frequencies scale with size, and the whole coupling changes), about
manifold distribution, or about structural response. Programmes that mistook
subscale stability for full-scale stability have paid for it repeatedly
[SP-194][LRECI].

### 7.2 Failure modes in the measurement chain

| mechanism | symptom | evidence | fix |
|---|---|---|---|
| Sense-line resonance | oscillation at a fixed frequency independent of $p_c$; present on the steady channel but absent on close-coupled and flow channels | change the line length; the frequency moves as $1/L$ | close-couple, or shorten and damp the line |
| Aliasing | a "real" low-frequency tone whose frequency changes when you change the sample rate | resample at a different $f_s$ and see the tone move | analogue anti-alias filter ahead of the converter |
| Ground loop | 50/60 Hz and harmonics, present with the engine off | record a pre-test zero with all systems powered | single-point ground; differential inputs |
| Thermocouple lag | transient magnitude under-reported; redline fires late | compare with a faster sensor, or with the heat-flux model | measure $\tau$ in situ; compensate; or move the redline |
| Load-cell tare drift | thrust offset that scales with feed pressure | pre-test calibration with lines pressurised and unpressurised | symmetric routing, flex joints, in-situ calibration |
| Turbine-meter density error | $I_{sp}$ high or low by ~1 % with no other symptom | check the temperature channel against saturation | add a densitometer, or use a Coriolis meter |
| Cable microphonics | broadband noise on piezoelectric channels that scales with vibration, not with pressure | correlate against the accelerometer | clamp the cable; use low-noise coax |
| Transducer thermal shift | slow zero drift during a long run | compare pre- and post-test zeros at the same temperature | recess and cool the transducer; use a temperature-compensated unit |
| Wrong $p_c$ station | $\eta_{c^*} > 1$, or a systematic 1–2 % offset from the model | apply Eq. 3.10 and see if it closes | fix the reduction, and state the station in the report |

### 7.3 Materials and hardware

Test hardware materials are chosen for instrumentability and robustness rather
than mass. Heat-sink chambers are thick OFHC copper or a copper alloy
(high conductivity and heat capacity, and machinable for thermocouple wells)
or, for longer runs, mild steel with a graphite or ablative liner
[SP-8124]. Thrust-stand flexures are high-strength steel or titanium chosen
for fatigue life under thousands of load cycles. Transducer wetted parts in
LOX service must be oxygen-compatible and rigorously cleaned — a hydrocarbon
film on a transducer diaphragm in a LOX line is an ignition source.
Thermocouple sheaths in hot gas are Inconel or, for higher temperature,
platinum-sheathed. Everything cryogenic is austenitic stainless or aluminium;
ordinary carbon steel goes brittle.

### 7.4 Manufacturing constraints on measurement

You cannot measure what you cannot reach. A regeneratively cooled chamber with
milled channels and an electroformed closeout has no route for a wall
thermocouple that does not breach the closeout, so wall temperature is
inferred from coolant $\Delta T$ and a model rather than measured. Additively
manufactured chambers change this: instrumentation ports, thermocouple
channels and even pressure passages can be printed in place, and NASA MSFC's
AM combustion-devices work explicitly exploited this to instrument hardware
that could not otherwise have been instrumented [Gradl18][M]. This is a real,
underappreciated benefit of AM — not mass or cost, but observability.

### 7.5 Testing the test system

The instrumentation is hardware too, and it gets its own verification:
end-to-end channel checks (inject a known physical stimulus, not an electrical
one, and confirm the number that lands in the data file), shunt calibration of
every bridge channel before and after, a recorded pre-test zero with all
facility systems energised, and a deliberate synchronisation event on all
channels. A test where the data system was not checked end-to-end is a test
you may have to repeat.

---

## 8. Misconceptions and what engineers actually care about

**"The transducer's specification is the measurement's accuracy."** No. The
catalogue number is one term in a budget that also contains installation
effects, thermal drift, the sense line, the data system, and the
uncertainty of whatever the reading is converted into. Installation effects
routinely exceed the sensor's own error by a factor of three.

**"We sampled at 10 kHz so we can see up to 5 kHz."** Only if there was an
analogue filter below 5 kHz ahead of the converter. Otherwise you can see up
to 5 kHz *plus* everything above it, folded down and now indistinguishable
from real signal. Nyquist is a statement about what you can reconstruct from
properly band-limited data, not a licence to sample and hope.

**"$\eta_{c^*}$ came out at 1.02, so the engine beat CEA."** It did not. Either
the chamber pressure is at the wrong station (Eq. 3.10), or the throat area is
the cold one and the hot one is larger, or a flow is being under-counted —
most often a film-coolant or turbine-exhaust stream that enters the chamber
but was not included in $\dot m$. Efficiencies above unity are always a
bookkeeping error.

**"A redline protects the engine."** A redline limits damage. By the time a
thermocouple, a filter, a sampler, a voter and a 100 ms valve have all had
their turn, 50–500 ms of the failure has already happened. Protection is
margin and pre-test verification; the redline stops the second half of the
event.

**"Cold flow showed the injector is fine."** Cold flow shows the injector
meters and distributes as intended at atmospheric back-pressure with a
non-vaporising liquid and no acoustic field. It says nothing about stability
and little about atomisation at real chamber density.

**"Average the noisy channel harder and the uncertainty goes down."**
Averaging reduces the Type A (random) component as $1/\sqrt n$ and does
absolutely nothing to the Type B (systematic) component. Past a few tens of
samples you are averaging a systematic error very precisely.

**"The engine vibrated at 6 kHz."** Check the accelerometer's mounted
resonance first. A magnet-mounted accelerometer resonates around 2–7 kHz and
will report itself enthusiastically.

**"Thrust is the easiest thing to measure — it's just a load cell."** It is
the hardest steady measurement on the stand, because the load cell is
excellent and everything between it and the engine is not.

### What engineers actually care about

1. **What is my $c^*$ efficiency, and is the shortfall in the injector or in
   the chamber length?** It decides whether the next hardware change is an
   injector or an $L^*$ change, and those have different lead times.
2. **What is the uncertainty, and how much of it is systematic?** Because the
   systematic part determines whether the next test can resolve the effect
   they are trying to measure at all, and no amount of repetition helps.
3. **Is that feature real or is it my instrumentation?** Every anomalous
   frequency, every drift, every step is guilty until proven physical, and the
   proof is corroboration across independent channels with independent failure
   modes.
4. **How fast can I detect the thing that will destroy this hardware, and how
   much damage happens inside that time?** This sets the redline values, the
   sensor choice, and sometimes the test duration.
5. **What does this test not prove?** The list of deviations from flight
   configuration and flight environment, and what closes each one. It is the
   document a review board actually reads.

---

## 9. Mastery levels

**Level 1 — Familiarity.**
Explain the difference between development, qualification and acceptance
testing and give an example of each. Name the levels of the test pyramid and
say why each exists. State what a redline is and name four common ones. Name
the three pressure-transducer principles and say which is used for combustion
dynamics. Explain in plain language why a slow thermocouple under-reports a
fast transient, and why an engine is fired remotely.

**Level 2 — Working engineering knowledge.**
Given $F$, $p_c$, $\dot m$, $A_t$ and $\varepsilon$, compute $c^*$, $C_f$,
$I_{sp}$ and both efficiencies, applying the injector-end to nozzle-stagnation
correction and stating its magnitude. Build an $I_{sp}$ uncertainty budget from
stated sensor uncertainties, correctly distinguishing sums from products.
Compute a sense-line quarter-wave or Helmholtz frequency and decide whether a
named combustion mode is observable. Compute the ramp lag of a first-order
sensor and correct for it. Choose a sample rate and anti-alias corner for a
stated bandwidth. Read a hot-fire trace and distinguish chug from an acoustic
mode from an instrumentation artefact.

**Level 3 — Interview mastery.**
Given an unfamiliar engine and a described anomaly, propose the instrumentation
that would discriminate among the candidate causes, and say what each channel
would show under each hypothesis. Design a redline set for that engine, justify
each limit, estimate the latency chain, and state what damage accrues inside
it. Argue both sides of a green-run decision for a specific stage. Explain why
a published efficiency figure from another programme may not be comparable to
yours, and enumerate every assumption that would have to match. Given a
proposed test campaign, identify what it does not prove and what additional
test or analysis closes each gap.

---

## 10. Problems

### Conceptual

**C1.** A programme reports $\eta_{c^*} = 1.008$ from a hot fire. Give three
distinct bookkeeping errors that produce an efficiency above unity, and for
each, state the single measurement or document you would ask for to test it.

**C2.** Explain why hydrostatic proof testing is done with water and pneumatic
proof testing is done remotely, using an energy argument. Then name two
component types for which water is nevertheless forbidden, and say why.

**C3.** A test engineer proposes to filter the wall-temperature redline
channel at 5 Hz to stop nuisance shutdowns from electrical noise. Explain what
this costs, quantitatively in terms of the added latency, and propose two
alternatives that do not add latency.

**C4.** Why does averaging $n$ repeated measurements reduce some parts of an
uncertainty budget and not others? Give a concrete example of each kind from a
hot-fire test, and explain the consequence for the design of an A/B injector
comparison.

**C5.** A subscale chamber at one-quarter linear scale is stable under bomb
testing. State three independent reasons this does not demonstrate that the
full-scale chamber will be stable.

**C6.** Distinguish "test like you fly" from "test at flight conditions", and
give one deviation from flight configuration that is unavoidable for a
first-stage engine, one that is unavoidable for an upper-stage engine, and one
that is merely convenient. For each, say what closes the gap.

**C7.** An accelerometer mounted on a bracket on the turbopump housing shows a
strong 4.2 kHz component. List, in the order you would check them, the four
things this could be, and the test that distinguishes each.

**C8.** Why is a cavitating venturi used in a test-stand feed system rather
than a plain venturi, and what does it cost you?

### Calculation

**N1.** A LOX/LH₂ thrust chamber is fired at $p_{c,inj} = 10.00$ MPa with
$\varepsilon_c = 3.0$ and $\gamma = 1.21$. Compute $M_c$ at the nozzle
entrance, the ratio $p_{c,ns}/p_{c,inj}$, and $p_{c,ns}$. By how many percent
would $\eta_{c^*}$ be overstated if the correction were omitted?

**N2.** A hot fire gives $F = 245.0$ kN, $p_{c,ns} = 9.800$ MPa,
$\dot m_o = 63.5$ kg/s, $\dot m_f = 27.6$ kg/s, $A_t = 1.580\times10^{-2}$ m²,
$\varepsilon = 16$, $p_a = 101\,325$ Pa. Compute MR, $c^*_{meas}$,
$C_{f,meas}$, and $I_{sp,meas}$. Using $\gamma = 1.20$,
$\mathcal{M} = 23.0$ kg/kmol and $T_c = 3700$ K as the reference, compute
$\eta_{c^*}$ and $\eta_{C_f}$. Comment on which one you would attack first.

**N3.** For the test in N2, the sensor uncertainties are: thrust 0.30 %,
oxidiser flow 0.45 % of $\dot m_o$, fuel flow 0.30 % of $\dot m_f$, chamber
pressure 0.20 %, throat diameter 0.08 %. Compute $u_{I_{sp}}/I_{sp}$,
$u_{c^*}/c^*$, and the expanded uncertainty in $I_{sp}$ in seconds at $k = 2$.
Which single sensor upgrade buys the most, and how much?

**N4.** A bare-bead Type K thermocouple has $\tau = 8$ ms; the same junction
inside a 3 mm Inconel sheath has $\tau = 0.45$ s. Both are exposed to a wall
temperature rising at 250 K/s. Compute the steady ramp lag of each. If the
redline is 950 K and the melt temperature is 1300 K, and the remaining latency
(filter + sample + logic + valve) is 0.15 s, compute the true wall temperature
at valve closure for each sensor. State the maximum ramp rate the sheathed
installation can tolerate without exceeding the melt temperature.

**N5.** A pressure sense line is 1.20 m of tubing filled with helium at 300 K
($a = 1017$ m/s). Compute $f_{1/4}$. Repeat for the same line filled with
gaseous oxygen at 300 K ($a = 330$ m/s). A colleague argues that switching the
purge gas from helium to nitrogen "won't affect the pressure measurement".
Evaluate that claim quantitatively.

**N6.** A chamber is 0.42 m in diameter and 0.65 m long with a chamber sound
speed of 1150 m/s. Compute $f_{1L}$, $f_{1T}$ and $f_{1R}$ (use 3.8317 for the
first radial eigenvalue). Choose a minimum sample rate for the dynamic
pressure channel that resolves up to the second tangential mode
(eigenvalue 3.0542) with a factor of 2.56 margin, and state the anti-alias
corner frequency you would specify.

**N7.** A 16-bit data system is configured with a 0–20 MPa range on a channel
whose signal never exceeds 3.0 MPa. Compute the quantization step and RMS
quantization noise. Then compute both for a 0–4 MPa range. If the transducer
itself is 0.25 % FS, compute the total (RSS) uncertainty on a 2.5 MPa reading
for both range choices, and state the lesson.

**N8.** A thrust stand has an effective moving mass of 1800 kg on flexures
with a combined axial stiffness of $2.5\times10^7$ N/m. Compute the stand's
undamped natural frequency. A start transient rises to full thrust in 60 ms.
Is the measured rise faithful? Justify with a comparison of time scales, and
state what you would do to measure the transient properly.

### Engineering reasoning

**R1.** *(Trace interpretation.)* A 250 kN LOX/LH₂ engine runs steadily for
18 s, then over 900 ms the following happens: fuel-pump discharge pressure
falls 6 %; fuel flow falls 5 %; $p_c$ falls 3.5 %; thrust falls 3.8 %; MR
rises from 5.95 to 6.27; the high-pressure fuel turbopump vibration RMS in the
1–5 kHz band rises by a factor of 2.4; turbine discharge temperature rises
40 K; the coolant outlet temperature rises 25 K. State the most probable
single root cause, name two alternative causes, and for each alternative give
the channel that would discriminate it. State which redline you would expect
to fire first and estimate whether it fires before the turbine reaches its
temperature limit.

**R2.** Two injectors are compared on the same stand, one week apart. Injector
A gives $I_{sp} = 311.4$ s, injector B gives 313.0 s. The stated $I_{sp}$
uncertainty is 0.5 %. A programme manager concludes B is better. Evaluate the
conclusion. Then design a test sequence that could resolve a 0.5 % difference
between the two injectors, and state the assumptions your sequence relies on.

**R3.** An engine passes acceptance testing at nominal conditions but fails in
flight 40 s into the burn. Post-flight data shows chamber pressure decaying
over the last 4 s before loss of signal. List the categories of failure that
an acceptance test structurally cannot catch, and for each, name the test at a
different level of the pyramid that would have caught it.

**R4.** You have inherited a test stand with a 3.5 m sense line to the chamber
pressure transducer and no dynamic pressure instrumentation, and a report
claiming the engine "shows a 34 Hz instability that grows during the run."
State what you believe is happening, the three measurements you would make to
confirm it, and what each would show under your hypothesis versus under the
alternative that the instability is real.

**R5.** An upper-stage engine with $\varepsilon = 150$ must be qualified. The
only available altitude facility has a six-month queue and costs four times a
sea-level test. Enumerate what can honestly be qualified at sea level with a
truncated nozzle, what cannot, and construct a test programme that minimises
altitude-facility time while leaving no unclosed gap.

### Mini trade study

**T1.** You are the propulsion lead on a 200 kN LOX/methane engine programme
with a fixed budget for exactly one measurement-system upgrade before the
development campaign begins. The current baseline is: turbine flow meters on
both circuits with RTD-based density correction ($u = 0.55$ % ox, 0.45 %
fuel), a thrust stand with $u_F = 0.45$ %, chamber pressure via a 2.0 m sense
line to a strain-gauge transducer ($u = 0.30$ %), sheathed wall thermocouples
($\tau \approx 0.4$ s), and a 5 kHz data system with no anti-alias filtering
above 2 kHz.

The four candidate upgrades, all of the same cost:

- **(a)** Coriolis mass flow meters on both circuits ($u = 0.20$ % ox,
  0.15 % fuel), at the price of an additional 3 bar feed pressure drop.
- **(b)** Thrust-stand rebuild with new flexures, in-situ hydraulic
  calibration and pressurised-line tare characterisation ($u_F \to 0.20$ %).
- **(c)** Close-coupled piezoresistive dynamic pressure instrumentation (four
  ports) plus a 100 kHz data system with proper anti-alias filtering, on the
  chamber and both propellant manifolds.
- **(d)** Fine-wire and thin-film wall temperature instrumentation
  ($\tau \approx 15$ ms) at twelve stations, plus a segmented calorimeter
  section for the first three test articles.

The programme's stated top three risks are, in order: (1) combustion
instability, this being the team's first methane engine; (2) achieving
$\eta_{c^*} \ge 0.96$; (3) chamber life at the target 100-cycle requirement.

Recommend one upgrade. Your answer must include: the quantitative effect of
(a) and (b) on $u_{I_{sp}}$; an argument about which risk the measurement
system is currently blind to; what you would do about the risks the chosen
upgrade does not address; and the circumstances under which your
recommendation would change.

---

## 11. Quiz

Ten questions, 10 marks each, 100 total. Show working where a calculation is
asked for.

**Q1.** (10) A hot fire gives $p_{c,inj} = 8.00$ MPa, $\varepsilon_c = 2.5$,
$\gamma = 1.19$. Compute $p_{c,ns}$. If the analyst used $p_{c,inj}$ in
$c^* = pA_t/\dot m$, is the resulting $\eta_{c^*}$ too high or too low, and by
what percentage?

**Q2.** (10) Which of the following can a first-order sensor with time
constant $\tau$ reproduce faithfully?
(a) A step, after $3\tau$.
(b) A ramp, with a constant offset $\dot R\tau$.
(c) A sinusoid at $f = 1/(2\pi\tau)$, with 3 dB attenuation and 45° phase lag.
(d) All of the above, with the stated caveats.
Choose one and justify each of the other options' status in one sentence.

**Q3.** (10) An engine's $I_{sp}$ is computed from $F = 88.0$ kN ± 0.35 % and
$\dot m = 31.5$ kg/s ± 0.60 %. Compute $I_{sp}$ and its expanded uncertainty
at $k=2$, in seconds.

**Q4.** (10) A 2.5 m nitrogen-filled sense line ($a = 353$ m/s) feeds the
chamber pressure transducer. The chamber's first tangential mode is at
1850 Hz. State the line's quarter-wave frequency and explain, in two
sentences, what the transducer will report if a ±10 % 1T instability is
present.

**Q5.** (10) Match each redline to the failure it primarily catches, and for
each give the sensor whose time constant dominates the detection latency:
(i) turbine discharge temperature high; (ii) $p_c$ low; (iii) turbopump
vibration RMS high; (iv) coolant $\Delta T$ high.

**Q6.** (10) A data system samples at 4 kHz with no anti-alias filter. The
engine has a real 5.2 kHz acoustic mode. At what apparent frequency does it
appear in the data? Can any post-processing recover the truth? Explain in two
sentences.

**Q7.** (10) True or false, with a one-sentence justification each:
(a) Proof testing every tank guarantees no tank will fail in flight.
(b) An acceptance test demonstrates design margin.
(c) A cold-flow patternator measurement predicts $\eta_{c^*}$ better than it
predicts stability.
(d) Averaging 400 samples reduces a calibration bias by a factor of 20.

**Q8.** (10) An engine's throat is copper alloy,
$\alpha = 17\times10^{-6}$ K⁻¹, and the throat wall runs 650 K above the
temperature at which $A_t$ was measured. Compute the fractional change in
$A_t$ and the resulting fractional error in $c^*$ and in $C_f$ if the cold
area is used. Which direction does each error go?

**Q9.** (10) You must choose instrumentation to demonstrate that a new
injector is dynamically stable. State the disturbance method you would use,
the pass criterion, the transducer type and mounting, and the minimum sample
rate, for a chamber whose 1T mode is at 2.4 kHz. Justify the sample rate.

**Q10.** (10) A stage-level green run is proposed for a vehicle whose engines,
tanks and feedlines are all flight-proven from a previous vehicle, but whose
engine cluster arrangement and thrust structure are new. Argue for or against
the green run in no more than 150 words, and state the single piece of
evidence that would change your position.

---

## 12. Further reading

- **[CPIA-245]** — the JANNAF data-acquisition and interpretation manual. Read
  it for the uncertainty methodology and for what a measured $I_{sp}$ legally
  means; it is the document this module's §3.7 is a compression of.
- **[CPIA-246]** — the companion performance-prediction manual. Read it to
  find out what reference method a quoted efficiency is measured against, and
  why "$\eta_{c^*}$" without a stated reference is meaningless.
- **[SP-8041]** — captive-fire testing of solid motors. The instrumentation
  technology is dated but the *measurement logic* — what a published thrust
  trace does and does not contain — transfers directly to liquids.
- **[SP-194]** and **[LRECI]** — for stability rating: bombs, pulse guns,
  directed flow, and the criteria for calling a chamber stable. Read the
  case-study chapters of [LRECI] first.
- **[Biggs89]** — the SSME's first ten years by someone who lived them. Read
  it for what a real development test campaign costs and for how failures were
  actually diagnosed.
- **[SMC-S-016]** — the launch-vehicle environmental test standard. Read it
  for the qualification/acceptance/protoflight logic and the margin
  philosophy; check the current revision before quoting a level.
- **[STD-5001]** and **[AIAA-S-080]** — proof and burst factors, and fracture
  control. Read [AIAA-S-080] to understand why proof testing screens rather
  than proves.
- **[G-095]** — hydrogen safety. Read it before designing any test facility
  that will handle LH₂; the invisible-flame and detonability sections in
  particular.
- **[Brennen-Pumps]** — for cavitation testing, the 3 % head-drop convention,
  and rotordynamic instability. The book to read alongside a waterfall plot.
- **[SP-4230]** — Centaur and RL10 history, including the long grind of making
  hydrogen and altitude testing routine.
