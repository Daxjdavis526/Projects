# Module 34 — Failure Case Studies
Part V · Prerequisites: all of Parts I–IV · Estimated time: 8–10 h

Every number in the first thirty-three modules of this course was paid for. The
capture feature on the Shuttle booster field joint exists because seven people
died. The baffles on the F-1 injector exist because 210 injector designs were
thrown away. The bellows shroud on the J-2 augmented-spark-igniter line exists
because two engines quit on Apollo 6 and the reason they quit could not have
been found on a sea-level test stand. The Vega-C nozzle throat qualification
criteria exist because a carbon–carbon billet from a new supplier eroded three
times faster than the one it replaced, and nobody's acceptance test could tell.
This module is the case law of propulsion engineering. Its purpose is not to be
morbid; it is that failure analysis is the only branch of the subject where you
get to see the *whole* system at once — thermodynamics, structures, materials,
manufacturing, operations, instrumentation and management all in the same
five-second window — and where the physics is unambiguously graded. I have sat
in the room where a program decided that a recurring anomaly was "within
experience." That phrase is in the Rogers Commission report too. Learn to hear it.

---

## 1. Learning objectives

After this module you should be able to:

1. Distinguish **proximate cause**, **intermediate cause** and **root cause** in a
   propulsion mishap, and explain why an investigation that stops at the
   proximate cause produces a fix that does not hold.
2. Apply a fixed six-question interrogation to any failure — what happened, what
   subsystem failed, what physical mechanism, what evidence identified it, what
   changed, what a modern engineer should carry forward — and produce a
   defensible answer for a case you have never seen.
3. Classify a failure into one of six recurring **failure classes** (design
   margin, manufacturing/process escape, operations/environment,
   instrumentation/redline logic, materials compatibility, unrecognised physics)
   and say what corrective action each class demands.
4. Reconstruct the O-ring resilience-versus-temperature argument quantitatively
   from the Rogers Commission's own test data, using an elastomer
   time–temperature superposition model, and state the argument's limits.
5. Predict the **pressure–time signature** of a solid-motor internal-insulation
   debond, a case burn-through and a throat over-erosion from the Vieille
   equilibrium-pressure relation, and distinguish the three from telemetry alone.
6. Compute the stored energy of a composite overwrapped pressure vessel and the
   energy release available from solid oxygen trapped under its overwrap, and
   explain why a COPV in a cryogenic oxidiser tank is a materials-compatibility
   problem before it is a structural one.
7. Estimate the fatigue cycle count accumulated by a turbopump inducer blade
   under rotating cavitation in a single flight, and explain why a component can
   pass a long ground test programme and still fail on its eighth flight.
8. Read a described telemetry trace — chamber pressure, turbopump speed,
   turbine discharge temperature, mixture ratio, vehicle rates — and name the
   failure class and the most probable mechanism.
9. State, for each of the twenty-one cases in §3, the design or process change
   that followed, and say whether the same failure could occur in a vehicle
   being built today.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Proximate cause | — | — | The last event in the chain, the one visible in the wreckage. |
| Root cause | — | — | The condition whose correction prevents recurrence of the whole class. |
| Fault tree | — | — | Top-down deductive enumeration of every path to the top event, each branch closed by evidence or test. |
| Anomaly | — | — | Observed off-nominal behaviour, whether or not it caused loss. |
| Escape | — | — | A nonconformance that passed every inspection gate and reached flight. |
| Normalisation of deviance | — | — | Progressive redefinition of a recurring anomaly as acceptable because it has not yet caused loss. |
| Redline | — | — | A measured parameter limit whose violation commands automatic shutdown. |
| Joint rotation | $\theta$ | rad | Angular opening of a tang-and-clevis joint under internal pressure. |
| O-ring squeeze | $\delta$ | m | Diametral compression of a seal in its installed groove. |
| Shift factor | $a_T$ | — | Time–temperature superposition factor for a polymer relaxation process. |
| Glass transition temperature | $T_g$ | K | Temperature at which an amorphous polymer's segmental motion effectively freezes. |
| Burning area | $A_b$ | m² | Instantaneous propellant burning surface. |
| Throat area | $A_t$ | m² | Nozzle throat area. |
| Vent area | $A_v$ | m² | Effective sonic area of an unintended breach in a motor case. |
| Klemmung | $K_n$ | — | $A_b/A_t$. |
| Vieille exponent | $n$ | — | Pressure exponent in $r = a p^n$. |
| Characteristic velocity | $c^\ast$ | m/s | $p_c A_t/\dot m$. |
| COPV | — | — | Composite overwrapped pressure vessel: thin metallic or polymer liner with a filament-wound structural overwrap. |
| Stored energy | $E$ | J | Isentropic work available from a pressurised gas volume expanding to ambient. |
| Suction specific speed | $S$ | — | $\Omega\sqrt{Q}/(g\,\mathrm{NPSH})^{3/4}$; cavitation-similarity parameter for a pump inlet. |
| Rotating cavitation | — | — | Cavitation pattern that propagates around an inducer at a rate different from shaft speed, exciting blades asynchronously. |
| Basquin exponent | $b$ | — | Slope of the log–log stress-life (S–N) line, $\sigma_a=\sigma_f'(2N)^b$. |
| Reversals to failure | $2N$ | — | Twice the cycle count to fatigue failure. |
| POGO | — | — | Closed-loop coupling of vehicle longitudinal structural modes with the propulsion feed system. |
| FOD | — | — | Foreign object debris. |
| MEOP | — | — | Maximum expected operating pressure. |

---

## 3. Theory: the case law

### 3.1 What an investigation is, structurally

A launch-vehicle mishap investigation is a **fault tree closed by evidence**. The
top event ("loss of vehicle at T+73 s") is decomposed into every physically
possible path, and each branch is then *retained* or *closed* by one of four
kinds of evidence, in descending order of authority:

1. **Recovered hardware** with a diagnostic feature (a burn pattern, a fracture
   surface, a witness mark). This is the only evidence that is not a model.
2. **Telemetry**, which is a sampled, filtered, bandwidth-limited view of a few
   hundred channels out of a system with millions of degrees of freedom.
3. **Ground test reproduction** — deliberately recreating the hypothesised
   mechanism on a stand and showing it produces the observed signature.
4. **Analysis and simulation**, which can close a branch only when it is
   anchored to (1)–(3).

The pathology to watch for is a branch closed by (4) alone. `[J]` The Rogers
Commission's Chapter IV is a model of the discipline precisely because the O-ring
branch was closed by all four: recovered SRB segments with a burn path, telemetry
showing a right-booster pressure differential, resiliency and joint-rotation tests
that reproduced the mechanism, and only then analysis `[Rogers86 ch. IV]`.

**Proximate, intermediate, root.** [F] The proximate cause of the loss of
*Challenger* was hot gas escaping an aft field joint. The intermediate cause was
a seal system whose sealing action was rate-dependent and whose rate was
temperature-dependent. The root cause was a decision process that reclassified
recurring O-ring erosion as an acceptable flight condition. Fixing only the
proximate cause gives you a better O-ring; fixing the intermediate cause gives
you the capture feature; fixing the root cause gives you an anomaly-disposition
process. All three fixes were made, and they are not interchangeable.

### 3.2 The six questions

Every case below is worked in the same fixed format. Use it on anything you are
handed:

1. **What happened?** The observable sequence with times.
2. **What subsystem failed?** Named at the level of a drawing number, not "the engine."
3. **What physical mechanism caused it?** The equation or the material process.
4. **What evidence identified the cause?** Which of the four kinds above, and how it closed the branch.
5. **What design or process change followed?**
6. **What should a modern engineer remember?**

### 3.3 The six failure classes

The classification used throughout this module, and in the synthesis of §3.25:

| class | definition | characteristic corrective action |
|---|---|---|
| **DM — design margin** | The design was built as intended and the intended design was inadequate for a load, temperature or life that was foreseeable. | Redesign; increase margin; change the architecture. |
| **PE — process escape** | The design was adequate; a specific article deviated from it and the deviation reached flight. | Inspection, NDE, process control, traceability, supplier qualification. |
| **OE — operations / environment** | Hardware and process were nominal; the article was operated outside its qualified envelope, or the environment exceeded what was qualified. | Launch-commit criteria; environment requalification; procedure change. |
| **IR — instrumentation / redline logic** | The propulsion hardware was healthy (or unhealthy in a way the logic misjudged); the *measurement* or the *decision rule* failed. | Sensor redundancy, voting logic, disagreement detection, redline reasonableness checks. |
| **MC — materials compatibility** | Two materials, or a material and a fluid, interacted in a way the design did not model — ignition, corrosion, embrittlement, ageing. | Compatibility testing at flight conditions; oxygen-service rules; ageing surveillance. |
| **UP — unrecognised physics** | The mechanism was not in anybody's model at the time. | New analysis discipline; new test; the phenomenon acquires a name. |

Most real failures carry two labels. The honest classification names the
*dominant* one and lists the others. `[J]`

### 3.4 The recurring physics

Before the cases, five mechanisms that show up over and over.

**(a) Rate-dependent seals.** A seal that works by elastic recovery has a
characteristic response time $\tau$ set by the polymer's relaxation spectrum. If
the gap it must follow opens faster than $\tau$, it does not seal, regardless of
squeeze. Near $T_g$, $\tau$ obeys time–temperature superposition rather than a
simple Arrhenius law:

$$ \log_{10} a_T = \frac{-C_1 (T - T_g)}{C_2 + (T - T_g)} , \qquad \tau(T) = a_T\,\tau(T_{\text{ref}}) $$

> **Eq. 3.1 [E]** — variables: $a_T$ shift factor (–); $T$ temperature (K);
> $T_g$ glass transition temperature (K); $C_1 \approx 17.44$, $C_2 \approx 51.6$ K
> the "universal" WLF constants when referenced to $T_g$. **Meaning:** every
> viscoelastic response time of the polymer scales by the same factor $a_T$, so a
> seal that recovers in seconds at room temperature can take hours 25 K colder.
> **Assumes:** amorphous polymer, thermorheological simplicity, $T_g < T < T_g+100$ K.
> **Fails when:** the polymer crystallises, is highly filled, or is chemically
> aged; and outside that temperature window, where $a_T$ diverges unphysically.
> The universal constants are a fallback — a real material is fitted `[SB §12]`.

**(b) Bond lines.** [F] A solid motor is a stack of adhesive joints —
case/insulation, insulation/liner, liner/propellant — and every one of them is
loaded in peel or cleavage by pressurisation and by thermal-shrinkage strain. A
bond line has no redundancy and cannot be inspected by any method that
distinguishes "bonded" from "touching." This single sentence explains Titan
34D-9, Titan IV K-11, and the Vega VV15 forward dome `[SP-8115]` `[SP-8073]`.

**(c) Cavitation as a fatigue driver.** [F] An inducer running near its suction
limit does not simply lose head; it develops *asynchronous* cavitation patterns
(rotating cavitation, cavitation surge) that impose alternating blade loads at
frequencies unrelated to shaft speed. At 700 Hz shaft frequency, a few minutes
of operation is $10^4$–$10^5$ cycles — an entire high-cycle-fatigue life
`[Brennen-Pumps ch. 8]` `[SP-8107]`.

**(d) Oxygen compatibility.** [F] Ignition in an oxygen system needs an ignition
source of order millijoules and a fuel; in a COPV the fuel is the carbon fibre
and the epoxy, and the source is fibre fracture, particle impact, or adiabatic
compression of the gas. The controlling quantity is not "is the material
flammable" but *is there a mechanism that concentrates energy at a fuel/oxygen
interface* `[AIAA-S-081]` `[G-095]`.

**(e) Redline logic.** [F] A shutdown redline is a decision rule operating on a
noisy estimator. Its two error modes are symmetric and both are expensive: a
missed detection destroys the vehicle, a false trip aborts a mission on healthy
hardware. Every redline architecture is therefore a hypothesis test, and the
right question is always "what is the failure mode *of the measurement*"
`[SSME-Orient]`.

---

### 3.5 Case 1 — *Challenger*, STS-51L: SRB aft field joint, 28 January 1986

**1. What happened?** Ignition at 11:38 EST with an ambient temperature of about
36 °F (2 °C), the coldest Shuttle launch ever attempted; the right-hand SRB aft
field joint was estimated colder still, near 28 °F (−2 °C). Black smoke puffed
from the joint at 0.678 s after ignition and continued to about 2.5 s. The joint
apparently re-sealed with slag. A flame reappeared at about T+58 s, grew, and
impinged on the External Tank aft attachment strut and the ET hydrogen tank
wall. Structural failure of the ET followed at T+73 s and the Orbiter broke up
under aerodynamic loads. All seven crew died `[Rogers86 ch. IV]`.

**2. What subsystem failed?** The tang-and-clevis **field joint** between the aft
centre segment and the aft segment of the right SRM — specifically the primary
and secondary fluorocarbon O-ring seals and the zinc-chromate putty upstream of
them. Not the propellant, not the case membrane, not the nozzle.

**3. What physical mechanism?** Three things in series `[Rogers86 ch. IV]`:

- **Joint rotation.** Internal pressurisation to ~6.3 MPa (≈900 psi) in roughly
  0.6 s bulges the case membrane and *opens* the tang-and-clevis gap. The seal is
  therefore required to extrude into a growing gap during the pressure rise —
  a rate-dependent duty, not a static one. This is the single most important
  technical fact in the case, and it is a geometry problem, not a rubber problem.
- **Elastomer resilience versus temperature.** Commission resiliency tests found
  that after compression and release, an O-ring at 75 °F re-established contact
  in 2.4 s, whereas at 50 °F it had not re-established contact for 10 minutes
  `[Rogers86 ch. IV]`. Worked example 1 reconstructs what that implies at 28 °F.
- **Putty blow-by.** The zinc-chromate putty was intended to keep hot gas off the
  primary ring, but its behaviour depended on assembly and on temperature; where
  it channelled, it *jetted* gas at the primary ring rather than shielding it.

**4. What evidence?** All four kinds. Recovered right-SRB hardware showed a burn
path through the joint; launch photography showed the 0.678 s smoke puffs from
the correct clock angle; telemetry showed a right/left SRB chamber-pressure
divergence beginning around T+60 s; the resiliency and joint-rotation tests
reproduced the mechanism; and the field history — O-ring erosion and blow-by on
prior flights, correlated with joint temperature — was the statistical evidence
that had been available *before* the flight and had been dismissed
`[Rogers86 ch. IV, ch. V–VI]`.

**5. What changed?** The **Redesigned Solid Rocket Motor (RSRM)**:
a **capture feature** machined into the tang, an inner lip that engages the
inside clevis leg and mechanically limits joint rotation; a **third O-ring** on
that capture feature; redesigned joint insulation with a J-seal to keep hot gas
off the seals entirely; and **joint heaters** with a launch-commit criterion on
joint temperature `[NASA-SRB]` `[Rogers86 ch. IV]`. Process changes were as
large: an independent safety organisation, a formal anomaly-disposition process,
and the abolition of the practice of accepting a recurring anomaly by precedent.

**6. What to remember.** [J] *The seal was not the problem; the rotation was the
problem.* A seal asked to follow a moving surface is a dynamic component and must
be qualified dynamically, at the cold end of the environment, with the actual
pressurisation rate. And: **a trend in anomaly data is data.** Erosion depth
versus joint temperature was a real correlation in the flight history before
STS-51L, and the standard of proof demanded of it was inverted — engineers were
asked to prove it was unsafe rather than to prove it was safe.

**Class: DM** (the joint design could not tolerate its own rotation), with
**OE** (launched far outside the temperature experience base) and a root cause in
process.

---

### 3.6 Case 2 — F-1 combustion instability, 1959–1965: a development crisis, not a flight failure

**1. What happened?** The F-1 was sized at 6.7 MN (1.5 Mlbf) in a single chamber,
roughly four times the thrust of anything then flying. From the first hot fires
it exhibited spontaneous, destructive **high-frequency combustion instability**:
transverse acoustic modes in a 0.9 m diameter chamber, at a few hundred to
several thousand hertz, that destroyed engines in fractions of a second. The
program came close to cancellation `[SP-4206 ch. 4]` `[Hunley07]`.

**2. What subsystem failed?** The **injector**, specifically the coupling between
the propellant spray field and the chamber's transverse acoustic modes. Nothing
was structurally deficient; the chamber was doing exactly what an acoustic cavity
with a distributed unsteady heat source does.

**3. What physical mechanism?** Rayleigh's criterion `[SP-194]` `[YA95-class]`:
when unsteady heat release is in phase with the pressure oscillation of an
acoustic mode, the mode gains energy. In a large-diameter LOX/RP-1 chamber the
first tangential mode has a frequency low enough to couple to the atomisation and
vaporisation timescales of the impinging-jet spray, and there is no natural
damping mechanism at that scale. Chamber diameter is the villain: the tangential
mode frequency scales as $c/D$, so making the engine bigger moves the mode *into*
the range where the spray responds. See module 15.

**4. What evidence?** Ground test, in enormous quantity, plus a decisive
methodological innovation: the **bomb test**. Rather than waiting for
spontaneous instability, the team detonated a small explosive charge near the
injector face at full thrust and required the engine to damp the induced
oscillation within a specified time. This converted a rare, unrepeatable event
into a repeatable, quantitative acceptance measurement — arguably the single most
important idea in the case `[SP-194]` `[F1-R3896]`.

**5. What changed?** Roughly **2,000 tests across 210 injector designs, 15 baffle
designs and 14 injector configurations** under "Project Go" (1962–64), converging
on the flat-face mixed doublet/triplet **"5U(f)"** pattern with a **copper baffle
assembly dividing the face into 13 compartments** `[F1-R3896]`. The acceptance
criterion was damping of a bomb-induced disturbance within **45 ms**. Baffles do
not remove the driving; they raise the frequency of the transverse modes above
the range where the spray responds, and add viscous damping.

**6. What to remember.** [J] Two things. First, **combustion stability does not
scale**, and it is the reason large single-chamber engines are hard — it is why
the Soviets built four-chamber engines on one turbopump (RD-170) rather than one
big one. Second, **make the rare event repeatable**. If a failure mode appears
once in fifty tests, you cannot qualify against it; invent a stimulus that
provokes it on demand and qualify against the response.

**Class: UP** at the start (nobody could predict the stability of a chamber that
size), converging to **DM** once the mechanism was understood.

---

### 3.7 Case 3 — Apollo 13 oxygen tank, 13 April 1970: a pressure-vessel and thermostat lesson

**1. What happened?** At about 55 h 55 m mission elapsed time, a routine
cryogenic-stir command was sent to the Service Module oxygen tanks. Oxygen tank 2
ruptured, the resulting pressure blew off a Service Module bay panel, damaged
tank 1's plumbing, and the crew lost essentially all Service Module electrical
power and oxygen. The lunar landing was abandoned; the crew returned using the
Lunar Module as a lifeboat `[Cortright70]`.

**2. What subsystem failed?** The **oxygen tank 2 internal heater assembly and
its thermostatic switches**, and downstream, the Teflon insulation on the fan
motor wiring inside the tank. Strictly this is a cryogenic-fluid storage
subsystem, not propulsion — but it is a pressure vessel with electrical heaters
in an oxygen atmosphere, which is exactly a propulsion problem.

**3. What physical mechanism?** A chain of four:
(i) the tank had been **dropped** during earlier handling, loosening the fill
tube; (ii) because of this, ground detanking could not be done normally and was
accomplished by running the internal heaters for hours; (iii) the **thermostatic
switches had been designed for the 28 V DC spacecraft bus but were operated from
a 65 V DC ground supply**, and when they tried to open under that voltage they
**welded closed**, so the heaters ran unregulated and internal temperatures
reached an estimated ~1,000 °F (~800 K), degrading the Teflon wire insulation;
(iv) in flight, the fan motor's damaged wiring arced in an oxygen atmosphere at
~900 psi, the insulation burned, tank pressure rose past the relief capability
and the tank failed `[Cortright70]`.

**4. What evidence?** Telemetry (tank pressure, quantity, and a brief current
spike on the fan circuit), the documented ground-test history of the extended
heater run, the drop incident's paperwork, and reproduction testing that showed
the switches welding under 65 V. The tank itself was never recovered — this is a
case closed on documentation and reproduction rather than on hardware.

**5. What changed?** Heaters and thermostats requalified for the actual ground
voltage; the fan removed from later tanks; a sheathed heater design; and — the
part that matters most for propulsion — a rule that **ground support equipment is
part of the qualified system**, not an accessory to it.

**6. What to remember.** [J] Every propulsion system spends far more time
connected to ground equipment than to flight power. The GSE voltage, the GSE
purge composition, the GSE fill rate and the GSE cleanliness are all *flight*
requirements. Also: an oxygen tank containing electrical hardware is an oxygen
*system*, and the compatibility rules of `[G-095]` apply to every material inside
it, including wire insulation.

**Class: OE** (operated outside its qualified electrical environment) compounded
by **PE** (the drop) and **MC** (organics in high-pressure oxygen).

---

### 3.8 Case 4 — Apollo 6 and the Saturn V J-2: igniter-line fatigue and pogo, 4 April 1968

**1. What happened?** On the second uncrewed Saturn V flight, three separate
propulsion events occurred. During S-IC flight the vehicle underwent severe
**longitudinal oscillation (pogo)** at about 5 Hz. On the S-II stage, engine 2
lost thrust at about T+319 s and was shut down; engine 3 shut down about one
second later because of **cross-wired** shutdown circuitry. The S-IVB then
completed its first burn but **failed to restart** in orbit `[SP-4206 ch. 9]`.

**2. What subsystem failed?** The **augmented spark igniter (ASI) liquid-oxygen
supply line** on the J-2 engine — a small-diameter line with a flexible **bellows**
section — on both the S-II engine 2 and the S-IVB engine. Plus, separately, the
S-IC feed-system/structure coupling that produced pogo.

**3. What physical mechanism?** Two distinct ones, and the first is the most
instructive case of "test as you fly" in the whole record:

- **ASI line failure.** The bellows section vibrated in flow-induced resonance.
  In every sea-level ground test, **liquid air condensed and froze on the outside
  of the cold bellows**, adding mass and damping and detuning the resonance. In
  vacuum there is no air to condense, the added damping vanished, the bellows
  responded at its true resonance, and it failed in **high-cycle fatigue**,
  leaking LOX and causing the engine's performance loss `[SP-4206 ch. 9]`
  `[SP-8123]`. The ground test was not merely incomplete; it was *actively
  misleading*, because the ground environment supplied a benefit the flight
  environment could not.
- **Pogo.** A closed loop: vehicle longitudinal structural mode → propellant
  feedline pressure oscillation → engine thrust oscillation → structural mode.
  The loop gain exceeded unity in the first-stage burn. See module 12 for the
  transfer-function treatment.

**4. What evidence?** Telemetry (engine chamber pressure and the ASI line
temperature history), the cross-wiring found by circuit trace, and — decisively —
**ground tests repeated in a vacuum chamber**, which reproduced the bellows
failure that sea-level testing never had.

**5. What changed?** The ASI line bellows were **removed and replaced with a
stiffened, brazed line** without the resonant flexible element; the shutdown
wiring was corrected; and the S-IC LOX prevalves were fitted with **helium-filled
accumulator cavities** that lowered the feedline's effective compliance and broke
the pogo loop. Pogo suppression accumulators became standard on subsequent
American vehicles `[SP-4206]`.

**6. What to remember.** [M] **Test as you fly, and interrogate the ways your
ground environment helps you.** Ask, of every ground test: what is present here
that will not be present in flight? Air, gravity vector, ambient pressure,
humidity, ground power, ground purge, an operator watching. Each one is a
candidate for exactly this failure. Also: small lines kill big engines. The ASI
LOX line carries a fraction of a percent of the flow.

**Class: UP/DM** for the bellows (the condensation effect was not in anyone's
model), **DM** for pogo, **PE** for the cross-wiring.

---

### 3.9 Case 5 — Titan 34D-9, 18 April 1986: SRM insulation debond

**1. What happened?** Launch from Vandenberg SLC-4E at 17:45 GMT. Flight was
nominal for about 8 s, at which point the **right SRM** suffered a case
burn-through and the vehicle disintegrated at a few hundred metres altitude,
scattering hypergolic core-stage propellants over the launch complex
`[UPI-Titan34D]` `[Astronautix]`.

**2. What subsystem failed?** The **internal insulation-to-case bond** in a
UA1205-family segment, at a location reported as roughly 5–7 in (130–180 mm)
below the second joint from the bottom of the segment.

**3. What physical mechanism?** Failure path B of module 23: the insulation
separated from the steel case, hot combustion gas at ~4.8 MPa (700 psi) reached
the ~9.5 mm (3/8 in) D6AC-class case wall, and eroded through it. Once a vent
opens, the case unzips: the vent grows, and the escaping plume acts as a lateral
thrust that destroys the vehicle before the pressure decay alone would. No
O-ring, no joint seal — a *bond line*.

**4. What evidence?** Telemetry located the initiation axially and
circumferentially by the differential pressure and thrust-vector signatures
between the two boosters; the reported root cause was **improper fabrication of
the motor segment** at the manufacturer, i.e. a bonding defect that existing
inspection could not detect `[UPI-Titan34D]`.

**5. What changed?** Tightened bond-line process control and NDE for segmented
solid motors, and — at the national level — the coincidence of this failure with
*Challenger* three months earlier grounded essentially all US heavy launch
capability at once and forced a re-examination of solid-motor quality assurance
across programs `[Hunley07]`.

**6. What to remember.** [J] Note the contrast with *Challenger*, which was
loudly drawn at the time and is still the right lesson: **the Titan failure was
not a joint-seal failure at all.** Two large segmented solids failed within
90 days by two different mechanisms in the same general region — the joint. A
segmented solid motor has two independent single-point-failure populations at
every joint: the *seal* and the *bond*. Fixing one tells you nothing about the
other.

**Class: PE** (manufacturing escape in the bond line), with **DM** in the
inspection method (an NDE method that cannot distinguish a bond from a contact is
a design deficiency in the process, not bad luck).

---

### 3.10 Case 6 — Titan IV K-11, 2 August 1993: SRM case burn-through from restrictor repair

**1. What happened?** The first Titan IV failure. About **101 s** after launch
from Vandenberg, a hole burned through one of the UA1207 solid rocket motors and
the vehicle was destroyed, losing three Navy ocean-surveillance satellites
`[SN-Titan93]` `[GS-Titan]`.

**2. What subsystem failed?** The solid motor's **propellant restrictor** — the
inhibitor that prevents burning on a surface that is not supposed to burn — and
through it, the case.

**3. What physical mechanism?** The **restrictor repair process** used a cutting
tool that produced continuous cuts through the restrictor **into the propellant**
`[GS-Titan]`. A cut through the inhibitor is a gas path to a surface that was
never meant to burn: it adds burning area (path A, a pressure rise) and, worse,
directs combustion gas along the inhibited surface toward the case (path B). The
result is a local case burn-through at the axial station where the repair was
made.

**4. What evidence?** Telemetry pressure and thrust divergence between the two
motors, and — the crucial piece — the **process records** of the repair. This is a
case where the fault tree was closed not on hardware but on paperwork, because
the repair was documented.

**5. What changed?** The repair procedure was eliminated in that form; the
programme moved to the **SRMU** (three-segment graphite/epoxy case, HTPB, gimbal
nozzle) which had been in development and which changes almost every variable in
the case at once `[Hunley07]`. Broadly: a "repair" to a solid motor grain or
inhibitor is a **redesign of that motor**, and must be qualified as such.

**6. What to remember.** [M] **Rework is not maintenance.** In a solid motor
there is no such thing as a local repair whose effects stay local, because the
internal ballistics are a global function of the burning surface. Any deviation
that touches propellant or inhibitor geometry requires a ballistic reanalysis and
usually a test.

**Class: PE** (process escape), with a **DM** component: a repair process was
approved whose failure mode was not analysed.

---

### 3.11 Case 7 — Delta II GPS IIR-1, 17 January 1997: GEM-40 case rupture

**1. What happened?** Launch from Cape Canaveral LC-17 at 11:28 EST. At about
**T+12 s** the No. 2 GEM-40 graphite-epoxy strap-on motor's composite case
suffered a **structural rupture** — a long axial crack, not a burn-through —
whose debris damaged an adjacent GEM. Range safety destroyed the vehicle
13 s into flight; burning debris and unspent solid propellant fell on the pad
area, destroying around 20 cars in an adjacent lot `[WP-GPSIIR1]`.

**2. What subsystem failed?** The **filament-wound carbon/epoxy case** of a
GEM-40, a 1.03 m diameter monolithic motor carrying ~11,770 kg of HTPB/AP/Al
propellant `[NG-COMM]`.

**3. What physical mechanism?** Composite case rupture initiating from
pre-existing **damage in the overwrap**. A filament-wound case carries hoop load
in fibres that have essentially no transverse strength; an impact or handling
event that breaks fibres locally removes load path with no visible surface
indication, and the case then fails at a fraction of its proof pressure when
pressurised. The failure is *structural*, and it is fast: an axial crack in a
filament-wound case propagates at a speed set by the fibre-direction wave speed,
so there is no measurable precursor in chamber pressure.

**4. What evidence?** Launch photography (a crack visible along the motor before
rupture), the pressure and rate telemetry, and recovered case fragments from the
pad area and shallow water. The distinction between "rupture" and "burn-through"
was made on the fracture surfaces.

**5. What changed?** Strengthened handling, transport and impact-damage control
for composite cases, and inspection for impact damage as a pre-flight requirement
`[AIAA-S-081]`-class thinking applied to motor cases: a composite pressure vessel
must be treated as **damage-intolerant** and its whole handling chain controlled.

**6. What to remember.** [M] A filament-wound case buys you ~6 points of
propellant mass fraction (GEM-40 is 0.908 versus 0.85 for the steel-cased Shuttle
SRB `[NG-COMM]` `[NASA-SRB]`) and pays for it with **damage intolerance**. A dent
in a steel case is visible and analysable. Broken fibres under an intact resin
surface are neither. If you choose composite, you have bought a
configuration-management problem as much as a structures problem.

**Class: PE / OE** — an escape or handling event, in a design class whose margin
against local damage is intrinsically low (**DM** contribution).

---

### 3.12 Case 8 — Ariane 5 ECA, Flight 157, 11 December 2002: Vulcain 2 nozzle

**1. What happened?** The maiden flight of the Ariane 5 ECA. Everything was
nominal through solid-booster separation. Then a cooling-circuit leak in the
**Vulcain 2 nozzle** developed, the nozzle overheated and deformed, the thrust
vector became grossly asymmetric, control was lost and the vehicle was destroyed.
Hot Bird 7 and Stentor were lost `[ESA-V157]` `[SN-V157]`.

**2. What subsystem failed?** The **Vulcain 2 nozzle extension** and its
regenerative/dump cooling circuit. Vulcain 2 differs from Vulcain 1 by a higher
mixture ratio (6.1 versus 5.3), higher chamber pressure (117.3 versus 100 bar)
and a larger expansion ratio (58.2 versus 45.1), and it added **film cooling of
the lower nozzle with turbine exhaust** precisely because the wall heat flux went
up `[verify-liquid §4]`.

**3. What physical mechanism?** As reported by the inquiry board: as the vehicle
climbed, the **external ambient pressure on the nozzle fell away**. The upper
part of the nozzle then saw unexpected *upward* loading and deformed
substantially. The structural deformation altered the coolant flow distribution;
the altered flow permitted local overheating; the local overheating produced a
leak in the cooling circuit; the leak accelerated the overheating; the nozzle
melted `[ESA-V157]` `[CORDIS-V157]`. In other words, a **thermo-structural
coupling**: the structural deflection and the thermal state were not independent,
and the design analysis had treated them as if they were.

**4. What evidence?** Telemetry showing the thermal and pressure evolution in the
cooling circuit, the trajectory and attitude divergence consistent with an
asymmetric nozzle, and post-failure structural and thermal reanalysis of the
nozzle under the *flight* pressure history rather than the ground one.

**5. What changed?** Nozzle **structural reinforcement** and requalification of
the Vulcain 2 nozzle under the correct external-pressure history, followed by a
successful return to flight in February 2005 `[ESA-V157]`. The broader change was
methodological: coupled thermo-structural analysis of the nozzle across the whole
ascent pressure profile, not at discrete design points.

**6. What to remember.** [M] **The nozzle's load case is the whole trajectory,
not sea level and not vacuum.** A large nozzle is a thin shell whose stiffness
depends on the pressure difference across it, and that difference reverses sign
during ascent. Related failure modes — flow separation side loads at start,
free-shock to restricted-shock transition — live in the same regime; see module
09 and `[OMK05]`.

**Class: DM/UP** — a load case and a coupling that were not in the qualification
basis. Note explicitly that this is **not** the 1996 Ariane 501 failure, which
was an inertial-reference software fault and has nothing to do with propulsion.

---

### 3.13 Case 9 — Vega VV15, 11 July 2019: Zefiro 23 forward dome

**1. What happened?** Lift-off at 01:53 UTC 11 July 2019 (22:53 local, 10 July).
At **130.850 s** after lift-off, shortly after ignition of the Zefiro 23 second
stage, an anomaly occurred; the vehicle's trajectory diverged and the mission was
lost with the FalconEye 1 satellite `[ESA-VV15]`.

**2. What subsystem failed?** The **forward dome region of the Z23 motor** — the
structural dome, its thermal protection, and the joint between them. Not the
nozzle, not the grain.

**3. What physical mechanism?** The Independent Inquiry Commission identified the
most likely cause as a **thermo-structural failure in the forward dome area** of
the Z23 `[ESA-VV15]`. Subsequent work by the manufacturer attributed it to a
**thermal-protection design flaw in the forward dome area that allowed hot gas to
leak into the structural part of the dome** `[Avio-VV15]`. Mechanically this is
the same family as Titan 34D-9: a thermal barrier that failed to keep 3,400 K gas
off a load-bearing structure, at a location where the insulation is
geometrically awkward — a dome, with a curvature change, a joint, and a
polar-boss transition all in a few centimetres.

**4. What evidence?** Telemetry only, in the first instance — there was no
recovered hardware, and the Commission was explicit that it identified the *most
likely* cause rather than a proven one. That epistemic honesty is worth studying:
the report says what it can support. Closure came later, through design review
and ground testing of the dome thermal protection.

**5. What changed?** Redesign and requalification of the Z23 forward-dome thermal
protection, plus additional design and verification measures across the Vega
solid stages before return to flight `[ESA-VV15]`.

**6. What to remember.** [M] **Domes are the hard part.** Along the cylindrical
section of a motor, the insulation problem is one-dimensional and the mass flux
is predictable. At a dome you have three-dimensional flow, a stagnation region,
a bond-line curvature change, and often a joint — and the exposure time is the
*entire* burn because the dome is exposed from ignition. Module 23's exposure-time
profile is not a nicety; it is the whole design.

**Class: DM** (design of the thermal protection), with the caveat that the
Commission's finding is a most-likely cause, not a demonstrated one.

---

### 3.14 Case 10 — Vega-C VV22, 20 December 2022: Zefiro 40 carbon–carbon throat insert

**1. What happened?** After nominal operation of the P120C first stage and
nominal ignition of the Zefiro 40 second stage, a **progressive decrease in
chamber pressure** was observed beginning about **151 s** after lift-off, leading
to loss of the mission and the two Pléiades Neo satellites `[ESA-VV22]`.

**2. What subsystem failed?** The **carbon–carbon throat insert** of the Zefiro 40
nozzle — a single component, procured from a supplier in Ukraine, which had
replaced the insert material used on the qualified configuration `[ESA-VV22]`
`[SN-VV22]`.

**3. What physical mechanism?** **Thermo-mechanical over-erosion** of the C–C
throat insert, most likely due to a **flaw in the homogeneity of the material**
`[ESA-VV22]`. The internal-ballistics consequence follows directly from the
equilibrium-pressure relation: with $A_b$ on its designed schedule, chamber
pressure varies as $A_t^{-1/(1-n)}$, so a throat that erodes faster than
predicted produces a *monotonic pressure droop* — exactly the observed signature.
Worked example 2 quantifies this. It is the cleanest possible example of a
single material property, in a single part, propagating straight into the vehicle
trajectory.

**4. What evidence?** Chamber-pressure telemetry with the characteristic droop;
material characterisation of the insert lots; and the Commission's finding that
**the acceptance criteria used for the C–C throat insert were not sufficient to
demonstrate its flightworthiness** `[ESA-VV22]`. That last sentence is the actual
root cause and it is a *qualification-method* finding, not a material finding.
(The supplier publicly contested the attribution `[PL-VV22]`; the course reports
the Commission's conclusion and notes the disagreement.)

**5. What changed?** A **delta-qualification of the nozzle with a different
carbon–carbon throat insert material**, plus revised acceptance criteria and
additional testing, before Vega-C's return to flight `[ESA-VV22]`.

**6. What to remember.** [M] **A supplier change is a design change.** Carbon–carbon
is not a specification, it is a family: fibre type, weave architecture,
matrix precursor, number of densification cycles, and final graphitisation
temperature all change the ablation rate, and none of them is captured by
"density and room-temperature strength," which is what acceptance tests usually
measure. If your acceptance test cannot distinguish the new lot from the
qualified lot **in the property that matters** — here, hot-gas erosion rate — you
have not accepted anything. See module 24 and `[SP-8115]`.

**Class: PE/MC** — a materials and supplier escape, enabled by a **DM** in the
acceptance-criteria design.

---

### 3.15 Case 11 — Falcon 1 flights 1, 2 and 3, 2006–2008

Three consecutive failures of a small launcher, each with a different and
individually banal cause. They are in this module because each is a textbook
instance of a class `[SpaceX-F1]`.

**Flight 1, 24 March 2006 — corroded nut.** Loss of thrust at about T+25 s
following a fuel leak and fire around the Merlin 1A. The proximate cause was an
**aluminium B-nut** on a fuel-pump inlet fitting that **corroded** in the salt-air
environment of Omelek Island, Kwajalein, and failed, releasing kerosene onto a
hot engine. *Mechanism:* galvanic/atmospheric corrosion of an aluminium fastener
in a marine environment, over months of exposure while the vehicle sat on the
pad. *Change:* material change to a corrosion-resistant alloy for exposed
fasteners, and control of pre-launch environmental exposure. *Class:* **MC/OE**.
*Remember:* [J] the qualified environment of a launch vehicle includes the
months it sits outdoors before launch. Fastener metallurgy is a propulsion
discipline.

**Flight 2, 21 March 2007 — propellant slosh.** First stage nominal; the second
stage began a slow coning motion that grew until the engine shut down early at
about T+7.5 min, short of orbit. *Mechanism:* **liquid-propellant slosh** in the
second-stage LOX tank coupled to the control loop. A partly full tank has lateral
sloshing modes whose frequency lies near the vehicle's rigid-body control
bandwidth; without baffles or an accurate slosh model in the controller, the
control system pumps energy into the slosh mode. *Change:* slosh baffles and an
updated control model. *Class:* **UP/DM** — the slosh model was inadequate.
*Remember:* [F] slosh is a propulsion-structures-GNC coupled problem, and its
frequency changes continuously as the tank drains, so it is never a single mode.

**Flight 3, 3 August 2008 — residual thrust at staging.** The upgraded,
**regeneratively cooled** Merlin 1C replaced the ablatively cooled 1A/1B. After
MECO, fuel trapped in the hot regenerative cooling jacket **vaporised and
produced residual thrust** for a longer period than the ablative engine had. The
staging sequence timing had been inherited from the ablative engine; the first
stage recontacted the second stage. *Change:* longer staging delay. *Class:*
**DM** — a changed component's transient behaviour was not propagated into the
sequence design. *Remember:* [M] **shutdown transients are part of the engine
specification.** Thrust decay tail-off, chamber emptying, and post-shutdown
outgassing determine stage-separation clearance, and they change when you change
the cooling architecture.

**What the trio teaches together.** [J] Small-vehicle failures are rarely exotic.
They are a nut, a slosh mode, and a timeline. The value of Falcon 1 as a case
study is precisely that no advanced physics is required to explain any of the
three — which means that no advanced physics would have been required to prevent
them either, only systematic environmental, dynamic and transient analysis.

---

### 3.16 Case 12 — Falcon 9 CRS-7, 28 June 2015: strut, COPV, LOX tank

**1. What happened?** Nominal first-stage flight. At about **T+139 s**, during
first-stage burn, the second stage's liquid-oxygen tank experienced an
overpressure event; the vehicle broke up. Telemetry showed the anomaly develop
over roughly **0.893 s** `[SpaceX-CRS7]` `[NSF-CRS7]`.

**2. What subsystem failed?** A single **axial support strut** holding one of the
helium COPVs inside the second-stage LOX tank — a stainless-steel rod-end
assembly roughly 600 mm long, bought from a supplier.

**3. What physical mechanism?** The strut fractured at approximately **2,000 lbf
(8.9 kN)** against a design and material certification of **10,000 lbf (44.5 kN)**
— a fivefold shortfall, attributed to a material or manufacturing defect in the
stainless part `[SpaceX-CRS7]`. With the strut gone, the buoyant COPV (helium in
LOX: enormous net buoyancy under 3–4 g axial acceleration) broke free, and helium
at high pressure was released into the LOX tank, which over-pressurised and
ruptured the tank dome.

**4. What evidence?** Over 3,000 telemetry channels reduced to the sub-second
window; high-speed imagery; recovered wreckage from the Atlantic; and
**destructive testing of a large sample of like struts**, which found a
population with strengths far below specification. That last step is what
converted a hypothesis into a root cause: the failure was **reproducible in the
supplier's population**, not a one-off.

**5. What changed?** The strut design and supplier were changed, and — the
generalisable part — **individual proof-testing of every such part** rather than
lot-sampling of a certified material. `[AIAA-S-080]`-class practice: for a
single-point-failure part in a critical load path, material certification plus
sampling is not sufficient; you proof-test the article that flies.

**6. What to remember.** [M] **Buoyancy is a load case.** A helium bottle in a
LOX tank under 4 g is trying to escape upward with several times its own weight;
that is a large, sustained, poorly instrumented load on a small part. And
**a strut is a single-point failure**: there was no second load path. Look for
parts whose failure releases a pressurised object inside a pressurised tank.

**Class: PE** (supplier process escape) with **DM** (no redundancy in a
single-point-failure load path, and no article-level proof test).

---

### 3.17 Case 13 — Falcon 9 AMOS-6, 1 September 2016: COPV, solid oxygen, and fibre friction

**1. What happened?** During propellant loading for a static-fire test — not a
launch — the vehicle was destroyed on the pad along with the AMOS-6 satellite.
The event originated in the **second-stage LOX tank** during helium loading
`[SpaceX-AMOS6]`.

**2. What subsystem failed?** One of the **three helium COPVs** inside the
second-stage LOX tank: a thin metallic liner with a carbon-fibre/epoxy overwrap,
submerged in subcooled liquid oxygen.

**3. What physical mechanism?** This is the most instructive materials-compatibility
mechanism in the modern record, and it has four steps `[SpaceX-AMOS6]`:

1. The COPV liners had **buckles** — local inward deformations of the thin liner
   under the overwrap, which by themselves were shown not to burst a vessel.
2. **Subcooled liquid oxygen pooled in the gap** between liner and overwrap at a
   buckle. SpaceX's LOX is loaded well below its normal boiling point to increase
   density.
3. The **helium loading temperature was cold enough to freeze that oxygen** —
   the local temperature fell below the oxygen triple point (54.36 K), producing
   **solid oxygen (SOX)** *inside the carbon-fibre overwrap*.
4. On pressurisation, **breaking fibres or friction between fibres and the solid
   oxygen ignited** the carbon. Carbon in oxygen releases ~32.8 MJ per kilogram of
   carbon; the minimum ignition energy for a carbon/oxygen interface at high
   pressure is of order millijoules. A single fibre fracture supplies it. The COPV
   failed and the vehicle followed.

Worked example 3 does the energy arithmetic. The point of that arithmetic is that
the ignition energy is negligible and the released energy is not: the reaction is
grossly energy-positive at the scale of a cubic centimetre of trapped SOX.

**4. What evidence?** Recovered COPVs showing liner buckles; the loading
temperature history; and — the decisive step — **reproduction on a test stand**,
where the team demonstrated that oxygen trapped in a buckle under the overwrap
could be ignited by fibre friction. Without that reproduction this would have
remained one branch of a fault tree among several.

**5. What changed?** In the short term, **a change in the helium loading
procedure** — warmer helium, slower loading — so that solid oxygen could not
form. In the longer term, a **COPV redesign to eliminate liner buckling**, and
a general re-examination of COPVs in cryogenic-oxidiser service `[SpaceX-AMOS6]`
`[AIAA-S-081]`.

**6. What to remember.** [M] Three things. **(i)** A COPV in a LOX tank is an
oxygen-system component and must be assessed under `[G-095]`-type oxygen
compatibility rules, not merely as a pressure vessel under `[AIAA-S-081]`.
**(ii)** Subcooling propellant to gain density moves you toward the *triple point*
of the oxidiser, and the phase diagram does not care about your density budget.
**(iii)** A "buckle that cannot burst the vessel" was correctly analysed as a
structural non-issue and was simultaneously a fatal *chemical* issue. Structural
adequacy and materials compatibility are separate assessments and you must do
both on the same feature.

**Class: MC** primarily — a materials/fluid compatibility mechanism not in the
design basis — with **DM** (the liner buckling) and **OE** (the loading
procedure) contributing.

---

### 3.18 Case 14 — SSME: STS-51F redline shutdown, and the development history

**1. What happened?** On **29 July 1985**, five minutes and 45 seconds into the
ascent of STS-51F, the centre main engine (ME-1) was **shut down by the engine
controller** on a high-pressure fuel turbopump discharge temperature redline. An
**abort-to-orbit** was declared. Shortly afterwards a second engine (ME-3)
approached the same redline; a ground call inhibited the remaining
temperature-redline shutdowns and the vehicle reached a lower-than-planned orbit
with two engines' worth of margin remaining `[SSME-Orient]` `[Biggs89]`.

**2. What subsystem failed?** The **temperature sensors**, not the turbopumps.
Two of the three HPFTP discharge temperature sensors on ME-1 had failed high; on
ME-3 a sensor was drifting the same way.

**3. What physical mechanism?** Sensor failure mode plus **voting logic**. The
redline architecture required two-of-three agreement to command shutdown. When
sensor failures are *correlated* — same part number, same installation, same
environment, same failure mechanism — a two-of-three vote does not protect you;
it makes a coincident double failure into a commanded shutdown. The physics of
the sensors mattered less than the statistical independence assumption in the
logic. [F]

**4. What evidence?** Post-flight examination of the sensors, and the fact that
the engines themselves showed no other symptom: HPFTP speed, chamber pressure,
mixture ratio and coolant flow were all nominal. **A healthy engine with one sick
parameter is an instrumentation problem until proven otherwise.**

**5. What changed?** Changes to the temperature sensor design and installation,
and — more importantly — to the **redline philosophy**: reasonableness checks
against other parameters, and disqualification of a sensor whose behaviour is
inconsistent with the rest of the engine state, before it can vote.

**6. What to remember.** [M] **The redline is a hypothesis test with two error
types.** A missed detection loses the vehicle; a false trip loses the mission. As
you tighten a redline you trade one for the other, and the only way to improve
*both* at once is to improve the *estimator* — more independent measurements,
physics-based cross-checks, model-based state estimation. This is why modern
engine controllers do not simply threshold a channel.

**The development history that sits behind this.** [H] The SSME's public
development record is the best available account of what a high-pressure
staged-combustion engine costs `[Biggs89]`. The recurring items were: **HPFTP
turbine blade cracking** (blades in a 1,000 K hydrogen-rich environment at
35,000 rpm, driven by both LCF from start/shutdown transients and HCF from wake
excitation); **bearing wear and subsynchronous whirl** in the turbopumps, running
in liquid hydrogen with no conventional lubrication; and **main injector LOX post
failures** from flow-induced vibration in the hot-gas crossflow, fixed with
dampers and by changing the post geometry. The 1979 and 1980 test-stand incidents
that destroyed engines are in the same source. The Block II HPFTP, introduced in
2001, was a substantially new pump with a cast rather than welded housing and
ceramic bearings `[Biggs89]` `[verify-liquid §2]`.

**Class: IR** for STS-51F. The development history is **DM/UP** — the design
margins in turbomachinery at that power density were not knowable in advance and
were bought with test hardware.

---

### 3.19 Case 15 — The N1 programme, 1969–1972: four launches, four failures

**1. What happened?** All four launches of the Soviet N1 failed in first-stage
flight, with a first stage carrying **thirty NK-15 engines** `[verify-liquid §6]`
`[Astronautix]`:

| flight | date | outcome |
|---|---|---|
| 3L | 21 Feb 1969 | Oxidiser line leak and fire in the aft compartment; the KORD control system shut down engines; loss at ~68 s. |
| 5L | 3 Jul 1969 | Turbopump of engine 8 disintegrated ~0.25 s after lift-off — debris ingestion is the usual attribution; KORD shut down all but one engine; the vehicle fell back onto the pad, destroying it. |
| 6L | 27 Jun 1971 | Loss of roll control at ~50 s: roll torque from the plume/base-flow asymmetry exceeded the available control authority. |
| 7L | 23 Nov 1972 | Programmed shutdown of the six central engines at ~107 s produced a hydraulic transient ("water hammer") in the propellant lines; a line ruptured and the stage was lost. |

**2. What subsystem failed?** Different each time — turbopump, feed line, control
authority, feed-system transient — which is itself the finding.

**3. What physical mechanism?** The unifying mechanism is **statistical**. [F]
With 30 engines and no engine-out capability beyond a narrow window, first-stage
reliability is approximately $R_{\text{engine}}^{30}$ modified by the control
system's ability to survive a shutdown. Even $R_{\text{engine}} = 0.99$ gives
$0.99^{30} = 0.74$. The specific mechanisms — LOX pump debris ingestion, line
rupture, water hammer from simultaneous valve closure — are each individually
fixable; the architecture guaranteed that *some* mechanism would appear.

**4. What evidence?** Telemetry and pad debris. The programme's central evidentiary
problem was that **there was no all-up ground test of the first stage**: the
Soviets had no test stand able to fire a 30-engine block, and the NK-15 was not
reusable, so engines were **acceptance-tested by lot sampling** — a sample was
fired and the rest of the batch flew untested. Every launch was therefore also
the first integrated test. `[Hunley07]` `[Astronautix]`

**5. What changed?** The NK-15 was superseded by the **NK-33**, with simplified
pneumatics and hydraulics, improved control and enhanced turbopumps, and — the key
change — **restartable, individually testable** engines `[verify-liquid §6]`. The
N1 was cancelled in 1974 before any NK-33-equipped vehicle flew.

**6. What to remember.** [M] **Engine count is a reliability architecture
decision, not just a thrust decision**, and it only works if it comes with three
things: (i) genuine engine-out capability including the control authority to fly
asymmetrically, (ii) an engine you can acceptance-test individually and still fly,
and (iii) an integrated stage-level ground test. Falcon 9 flies nine engines and
Falcon Heavy twenty-seven with all three; the N1 flew thirty with none. The
number of engines was never the problem.

**Class: DM** (architecture), rooted in an **OE/process** failure: absence of
integrated ground test.

---

### 3.20 Case 16 — Proton: turbopump and process failures

Proton has a long failure record, of which two entries are propulsion-relevant
and well enough documented to teach.

**Proton-M / MexSat-1, 16 May 2015.** The third stage failed about **497 s** into
flight. The investigation attributed it to the **RD-0214 vernier (steering)
engine**: increasing **rotor imbalance in its turbopump** produced escalating
vibration; the rotor material was reported as degraded by high temperature, and
the balance and mounting arrangement were found to be deficient. Roscosmos
directed a **change of rotor shaft material, a change to the rotor balancing
technique, and a change to how the steering engine is attached** to the third
stage main engine frame, and cited **inconsistencies in quality-control practice**
`[SFN-Proton15]` `[SFI-Proton15]`. Reporting at the time noted the same design
weakness had been implicated in a 1988 failure — a **repeat mechanism across
decades** `[SPO-Proton15]`. *Class:* **DM + PE**. *Remember:* [J] a rotordynamic
problem that recurs across decades is not bad luck; it is an unfixed design
margin, and the tell is that the corrective action list contains the word
"balancing."

**Voronezh solder substitution, discovered 2016.** Routine inspection found that
a **substitute solder had been used** in engines built at the Voronezh
Mechanical Plant, which produces Proton second- and third-stage engines. The
substitute had a **higher melting point**, so during the brazing/baking operation
it **did not flow and wick into the intended joints**, leaving joints incomplete.
Roscosmos **recalled all suspect engines** for rework, grounding Proton for
roughly a year `[SN-Solder]`. *Class:* **PE**, the purest example in this module.
*Remember:* [M] a consumable substitution is a process change. Solder, braze
alloy, flux, cleaning solvent, adhesive primer, glove material — none of these
appear on a drawing as a "part," and all of them are qualification-relevant. The
reason this one was *caught* is also the lesson: **routine independent inspection
of a mature process**, which is the only defence against a substitution that
leaves no visible signature.

---

### 3.21 Case 17 — LE-7 on H-II Flight 8, 15 November 1999: inducer cavitation to fatigue

**1. What happened?** The H-II launch vehicle's first stage LE-7 engine lost
thrust and shut down prematurely during ascent; the vehicle was destroyed by
command. The engine was subsequently **recovered from about 3,000 m of water**
in the Pacific `[WP-LE7]` `[verify-liquid §5]`.

**2. What subsystem failed?** The **liquid-hydrogen turbopump inducer** of the
LE-7 — the axial-flow stage ahead of the main impeller whose only job is to raise
inlet pressure enough that the impeller does not cavitate.

**3. What physical mechanism?** The original inducer design **cavitated**, and
the cavitation was not the benign, steady, attached kind. Cavitation on an
inducer at off-design suction conditions becomes **asynchronous** — the cavity
pattern rotates around the inducer at a rate different from shaft speed, imposing
an alternating load on each blade at the difference frequency. The resulting
**imbalance and vibration** drove the blade into **high-cycle fatigue**; a blade
liberated, the pump unbalanced catastrophically, and the engine failed
`[WP-LE7]` `[Brennen-Pumps ch. 8]`. Worked example 4 counts the cycles: at a
shaft frequency near 700 Hz, the fatigue life is consumed in **minutes**.

**4. What evidence?** The decisive evidence was **recovered hardware** — a
deep-ocean salvage operation that returned the engine and allowed the fracture
surfaces on the inducer to be read. Fatigue fractures are self-documenting: beach
marks give you the loading history, and the initiation site gives you the stress
concentration. Telemetry alone would have supported several hypotheses.

**5. What changed?** In the **LE-7A**, the fuel inducer was **redesigned**; the
oxidiser inducer was also redesigned (primarily for low-inlet-pressure
performance); and the fuel turbopump received durability enhancements
`[WP-LE7]`. Note the system-level consequence: **the LE-7A runs at a *lower*
chamber pressure than the LE-7 — 12.0 MPa versus 12.7 MPa** — deliberately
trading performance for turbopump margin `[verify-liquid §5]`. That is one of the
cleanest examples in the course of a programme choosing reliability over Isp
after a failure.

**6. What to remember.** [M] **Cavitation is a structural-dynamics problem, not
only a performance problem.** The classical suction-specific-speed criterion tells
you when head breaks down; it does not tell you when *rotating cavitation* starts,
which is usually at a *higher* NPSH than head breakdown. You must test the
inducer for cavitation *instabilities* across the inlet-pressure range, in the
real fluid, and measure blade strain — not just head rise. `[SP-8107]`
`[Brennen-Pumps]`

**Class: UP/DM** — an instability regime outside the design criteria, in a
component qualified against the wrong criterion.

---

### 3.22 Case 18 — Antares Orb-3, 28 October 2014: AJ26 oxidiser turbopump

**1. What happened?** About **15 seconds** after lift-off from Wallops, the
vehicle lost thrust, fell back and exploded on the pad, destroying the pad
infrastructure and the Cygnus cargo `[Orb3-IRT]`.

**2. What subsystem failed?** The **liquid-oxygen turbopump of AJ26 engine E15**
(main engine 1). Its explosion damaged engine E16 in the main engine 2 position.
The AJ26 is a refurbished **NK-33**, manufactured in the early 1970s for the N1
follow-on, stored for four decades, and Americanised `[verify-liquid §6]`.

**3. What physical mechanism?** NASA's Independent Review Team **could not isolate
a single technical root cause** and identified **three credible root causes**, any
one or a combination of which could have produced the event. The IRT was explicit
that the **hydraulic balance assembly and thrust bearing designs have
intricacies and sensitivities that make bearing loads difficult to manage
reliably, leaving that area of the turbopump vulnerable to oxygen fire and
failure** `[Orb3-IRT]`. Orbital's own Accident Investigation Board favoured a
**decades-old manufacturing defect** in the turbopump; Aerojet Rocketdyne argued
for **foreign object debris** `[SFN-Orb3]` `[SN-Orb3]`. The course reports all
three positions and does not adjudicate.

The underlying physics is common to all of them: an **oxidiser-rich turbopump is
a machine in which the working fluid will burn its own structure** if a rubbing
contact, a particle impact or a local overtemperature supplies ignition. Bearing
axial load in such a pump is set by a hydraulic balance piston, and if the
balance is off, the bearing rubs. In LOX, a rub is an ignition source.

**4. What evidence?** Recovered engine hardware from the pad; telemetry over the
few seconds available; and extensive teardown of like engines. The instructive
point is that even with hardware in hand, **three fault-tree branches could not be
closed**, because a LOX fire destroys the evidence of its own initiation.

**5. What changed?** Antares was re-engined with the **RD-181** (an RD-191
derivative) — the programme abandoned the engine rather than requalify it.

**6. What to remember.** [J] **You cannot re-qualify age.** The NK-33 was an
extraordinary engine — 137:1 thrust-to-weight, oxidiser-rich staged combustion,
in 1972 `[verify-liquid §6]` — and it was extraordinary *when new*. Forty years of
storage introduces corrosion, elastomer ageing and unknown handling history, and
there is no non-destructive test that returns a used, aged turbopump to a known
state. Also: **oxidiser-rich turbomachinery has a failure mode with no analogue in
fuel-rich machinery**, and the design margin that matters is the margin against
rubbing contact.

**Class: MC + PE + OE** — oxygen-compatibility failure mode, enabled by
manufacturing/ageing condition, in hardware operated far outside its original
storage and service assumptions.

---

### 3.23 Case 19 — Small-launcher propulsion failures, 2021–2023

Brief entries. The public record for these is **company statements and FAA
mishap-closure summaries**, not independent technical reports, and they are
labelled accordingly. `[J]`

**Astra Rocket 3.3, LV0006, 28 August 2021.** One of the five first-stage
Delphin engines shut down about one second after lift-off; the vehicle slid
sideways off the pad before climbing and being terminated. Astra attributed it to
a **propellant leak from a quick-disconnect at lift-off**, which ignited and
damaged the engine's electronics. *Class:* **DM/OE** at the vehicle–ground
interface. *Remember:* the launch mount is part of the propulsion system for the
first half-second.

**Astra Rocket 3.3, LV0009, 12 June 2022.** The upper-stage Aether engine shut
down early. The company attributed it to a propellant-feed problem in the upper
stage. Detail beyond that is not reliably published. *Class:* not reliably
determinable from public sources.

**Firefly Alpha FLTA001, 3 September 2021.** One of the four Reaver first-stage
engines shut down about 15 s after lift-off; the vehicle became uncontrollable
and was terminated. Firefly attributed it to a **faulty electrical connection**
between an engine's main propellant valve and its controller. *Class:* **PE** —
a workmanship escape in an electrical interface. *Remember:* [M] on a
multi-engine vehicle, the *harness* is a propulsion single-point failure, and it
is the least analysed part of the engine.

**Relativity Terran 1, 22 March 2023.** The first stage performed; the
second-stage Aeon Vac engine ignited but did not reach full thrust and the stage
failed to complete its burn. Relativity's public statement described an anomaly in
the upper-stage engine ignition/main-stage sequence. No independent report is
public. *Class:* not reliably determinable.

**Virgin Orbit LauncherOne, "Start Me Up," 9 January 2023.** The first orbital
launch attempt from the United Kingdom. From the beginning of the second-stage
first burn, a **fuel filter in the fuel feedline had become dislodged** from its
position. The **fuel pump downstream ran at degraded efficiency**, the
**NewtonFour engine ran fuel-starved and therefore oxidiser-rich and much hotter
than rated**, components in the vicinity of the abnormally hot engine
malfunctioned, and second-stage thrust terminated prematurely `[VO-2023]`. Ground
testing subsequently **reproduced the dislodging and the filter's travel into the
engine**, matching flight data — a proper reproduction closure. *Class:* **PE/DM**
— a retention feature inadequate for the flight vibration environment.
*Remember:* [M] this is a whole failure chain from **one loose part in a filter
housing**. Filters, screens and orifices are the most commonly under-analysed
parts in a feed system; `[SP-8123]` exists because of exactly this. And note the
thermal logic: **fuel starvation in a bipropellant engine means mixture-ratio
excursion toward oxidiser-rich, which means a hotter wall**, not a cooler one.

---

### 3.24 Cases 20 and 21 — two entries for calibration

**Soyuz MS-10, 11 October 2018 — not a propulsion failure.** During strap-on
separation, one of the four first-stage boosters failed to separate cleanly and
struck the core stage; the crew aborted successfully. The cause was a **deformed
contact sensor rod in the separation mechanism, damaged during vehicle assembly**
at Baikonur — an assembly/process escape in a mechanism, with no propulsion
content at all. It is here to make the point that **"the rocket exploded" is not
a diagnosis**: staging, structures, avionics and GNC produce loss-of-vehicle
events at comparable rates to propulsion, and the first job of an investigator is
to establish which discipline owns the failure. *Class:* **PE**.

**Starship, Flights 1–8, 2023–2025 — read the sourcing carefully.** [M] These are
in the module as an exercise in **evidence quality**, not as settled case studies.

- **Flight 1, 20 April 2023.** Multiple Raptor engines were lost during ascent;
  the vehicle lost thrust vector control and tumbled; the flight-termination
  system took longer to destroy the vehicle than expected. The **FAA closed the
  mishap investigation on 8 September 2023**, citing **multiple root causes** and
  requiring **63 corrective actions**, including *redesigns of vehicle hardware to
  prevent leaks and fires*, launch-pad redesign, additional analysis and testing
  of safety-critical systems **including the autonomous flight safety system**,
  and additional change-control practices `[FAA-Starship]`. Note what that
  regulatory finding does and does not say: it names categories, not mechanisms.
- **Later flights.** SpaceX has published statements attributing subsequent losses
  to, variously, propellant filter blockage feeding the engines, a fire in the aft
  section from a propellant leak, and harmonic response in the ship's aft section
  stronger than predicted from ground testing. These are **company statements**;
  no independent technical report has been published.

**What to remember.** [J] When you assess a modern failure, ask *who wrote the
document you are reading and what were they obliged to establish*. A presidential
commission with subpoena power, a NASA independent review team, an ESA independent
enquiry commission, an FAA mishap closure, and a company blog post are five
different epistemic instruments. The first three publish mechanisms; the fourth
publishes categories and corrective actions; the fifth publishes what the company
chooses. All five are legitimate sources. Only the first three let you write
"the cause was" without a hedge.

---

### 3.25 Synthesis: the classification and what recurs

**Classification of all cases.**

| # | case | dominant class | contributing |
|---|---|---|---|
| 1 | Challenger STS-51L field joint | DM | OE, process |
| 2 | F-1 combustion instability | UP → DM | — |
| 3 | Apollo 13 oxygen tank | OE | PE, MC |
| 4a | Apollo 6 J-2 ASI line | UP | DM |
| 4b | Apollo 6 / S-IC pogo | DM | UP |
| 5 | Titan 34D-9 insulation debond | PE | DM (NDE capability) |
| 6 | Titan IV K-11 restrictor repair | PE | DM (repair not qualified) |
| 7 | Delta II GPS IIR-1 GEM-40 case | PE/OE | DM (damage tolerance) |
| 8 | Ariane 5 ECA V157 Vulcain 2 nozzle | DM/UP | — |
| 9 | Vega VV15 Z23 forward dome | DM | — |
| 10 | Vega-C VV22 Z40 throat insert | PE/MC | DM (acceptance criteria) |
| 11a | Falcon 1 F1 corroded nut | MC/OE | — |
| 11b | Falcon 1 F2 slosh | UP/DM | — |
| 11c | Falcon 1 F3 residual thrust | DM | — |
| 12 | Falcon 9 CRS-7 strut | PE | DM (single load path) |
| 13 | Falcon 9 AMOS-6 COPV/SOX | MC | DM, OE |
| 14a | SSME STS-51F shutdown | IR | — |
| 14b | SSME development (HPFTP, LOX posts) | DM/UP | — |
| 15 | N1 programme | DM (architecture) | process (no all-up test) |
| 16a | Proton MexSat-1 RD-0214 turbopump | DM | PE |
| 16b | Proton Voronezh solder | PE | — |
| 17 | LE-7 H-II F8 inducer | UP/DM | — |
| 18 | Antares Orb-3 AJ26 LOX pump | MC | PE, OE |
| 19a | Astra LV0006 QD leak | DM/OE | — |
| 19b | Firefly FLTA001 harness | PE | — |
| 19c | LauncherOne fuel filter | PE/DM | — |
| 20 | Soyuz MS-10 (non-propulsion) | PE | — |
| 21 | Starship Flight 1 | not adjudicable from public sources | — |

**Distribution.** Of 28 entries: process escapes (PE) dominate as the single
largest dominant class (~9), followed by design margin (DM, ~8), materials
compatibility (MC, ~4), unrecognised physics (UP, ~4), operations/environment
(OE, ~2), and instrumentation/redline (IR, 1). [J] Read that carefully before
concluding anything: it is a biased sample — cases were selected for teaching
value and for public documentation. What it does support is a weaker and still
useful claim: **more launch vehicles are lost to a part that was not built as
designed than to a design that was wrong.** That has consequences for where you
spend money.

**The recurring lessons.**

1. **Test as you fly, and interrogate what the ground gives you for free.**
   Apollo 6's bellows were damped by condensed air that does not exist in
   vacuum. Ground testing of the Vulcain 2 nozzle did not include the ascent
   external-pressure reversal. Starship's later aft-section harmonic response was
   reported as stronger in flight than in ground test. Every ground environment
   is a *different* environment, and the differences are usually helpful, which
   is what makes them dangerous.

2. **Cold elastomers.** Every seal in a propulsion system is a viscoelastic
   component whose response time varies by orders of magnitude across the launch
   temperature range, and the qualification point that matters is the cold one at
   the flight pressurisation rate. `[Rogers86]` remains the reference.

3. **Bond lines are single-point failures you cannot inspect.** Titan 34D-9,
   Vega VV15, and much of Titan IV K-11. Solid-motor bond lines carry no
   redundancy, and no NDE method distinguishes a bonded interface from a
   touching one with confidence. The defence is process control, not inspection.
   `[SP-8115]` `[SP-8075]`

4. **COPV compatibility.** A composite pressure vessel in a cryogenic oxidiser is
   an oxygen system, a structure, and a fracture-control article simultaneously,
   and the three assessments are independent. AMOS-6 passed the structural one.
   `[AIAA-S-081]` `[G-095]`

5. **Redline robustness.** STS-51F. A threshold on a single channel is a
   detector whose false-alarm rate is set by sensor reliability, not by engine
   reliability. Cross-check against physics before you shut an engine down.

6. **Turbopump bearings and cavitation.** LE-7, Antares Orb-3, Proton RD-0214,
   the SSME's whole development history. Turbomachinery is where propulsion
   failures concentrate, because it is the only part of the engine with large
   rotating stored energy, and the failure modes — rotordynamic instability,
   cavitation-driven fatigue, bearing rub in an oxidising fluid — are all
   *dynamic* and therefore invisible to steady-state analysis. `[SP-8107]`
   `[Brennen-Pumps]`

7. **A supplier change is a design change.** Vega-C VV22's throat insert, the
   Voronezh solder, the CRS-7 strut. In each, the drawing did not change and the
   part did. Your acceptance test must measure **the property that the function
   depends on**, and for an ablative throat that is erosion rate, not density.

8. **Rework and repair are redesign.** Titan IV K-11.

9. **Small parts, big consequences.** The J-2 ASI line, the CRS-7 strut, the
   LauncherOne filter, the Falcon 1 B-nut. There is an inverse correlation
   between a part's cost and the attention it receives, and no correlation at all
   between its cost and its criticality. [J]

10. **The organisational finding is a technical finding.** `[Rogers86]` Chapter V
    and the VV22 commission's "the acceptance criteria were not sufficient" are
    the same kind of statement: the process that decided the hardware was
    acceptable is part of the hardware's design.

---

## 4. Typical engineering ranges

Quantities that appear across the cases, with realistic ranges. Numbers for
specific motors and engines are from `reference/_verify-solid-coldgas.md` and
`reference/_verify-liquid.md`; the rest are order-of-magnitude engineering
ranges. [E]

| quantity | typical range | extreme / note |
|---|---|---|
| Solid-motor ignition pressure rise time | 0.15–0.6 s | Shuttle SRB to ~6.25 MPa in roughly 0.6 s `[NASA-SRB]` |
| Segmented-motor field-joint gap opening under pressure | 0.1–0.8 mm | the quantity the RSRM capture feature limits |
| Fluoroelastomer $T_g$ | 250–255 K (−23 to −18 °C) | fitted value in WE1 is higher; see the caveat there |
| WLF shift factor over 25 K near $T_g$ | $10^2$–$10^5$ | why "25 degrees colder" is not a small change |
| Vieille exponent $n$, composite propellant | 0.2–0.5 | pressure amplification $1/(1-n)$ = 1.25–2.0 |
| Chamber-pressure droop from throat over-erosion | −3 % per 2 % $A_t$ growth (at $n=0.35$) | VV22 signature |
| Solid-motor case burn-through pressure decay | 10–60 % in 1–5 s | depends on vent growth rate |
| COPV service pressure, launch-vehicle helium | 25–45 MPa (3,600–6,500 psi) | stored energy 3–8 MJ for a 100 L bottle |
| COPV stored energy, 100 L at 38 MPa | ≈ 5 MJ ≈ 1.2 kg TNT-equivalent | WE3 |
| Combustion enthalpy, carbon in O₂ | ≈ 32.8 MJ/kg C | the number behind the SOX mechanism |
| Minimum ignition energy, carbon fibre / high-pressure O₂ | order $10^{-3}$ J | a single fibre fracture supplies it `[G-095]` |
| Booster-engine LH₂ turbopump shaft speed | 30,000–45,000 rpm | RS-25 HPFTP 35,360 rpm; LE-7A LH₂ TP 41,900 rpm |
| Rotating-cavitation propagation ratio | 1.1–1.3 × shaft speed | rotating-frame excitation 0.1–0.3 Ω `[Brennen-Pumps]` |
| HCF cycles accumulated by an inducer blade in one flight | $10^4$–$10^5$ | WE4 |
| Titanium alloy HCF strength at $10^5$ reversals | 500–700 MPa alternating | Basquin fit, WE4 |
| Redline shutdown decision time, modern controller | 20–100 ms | sample rate × voting depth |
| Engine count, large first stages | 1–33 | F-1 ×5 (Saturn V) to N1 ×30, Super Heavy ×33 |

---

## 5. Worked examples

These are **evidence-analysis exercises**: you are given the data an
investigation had and asked to do the arithmetic that closes or opens a branch.
Each is fully numerical.

### WE1 — Reconstructing the O-ring resilience argument

**Given.** Rogers Commission resiliency test data `[Rogers86 ch. IV]`: after
compression and release, an O-ring re-established contact with its sealing
surface in **2.4 s at 75 °F**, and had **not** re-established contact after
**10 minutes (600 s) at 50 °F**. Launch-day ambient was **36 °F**; the right SRB
aft field joint was estimated at about **28 °F**. The joint must seal during a
pressure rise of order **0.6 s**.

**Find.** (a) What single time–temperature model fits the two data points; (b)
the implied recovery time at 28 °F; (c) whether the seal could have followed the
joint; (d) what is wrong with the model.

**Step 1 — convert.** $T_1 = 75\ ^\circ\mathrm F = 23.89\ ^\circ\mathrm C = 297.04$ K;
$T_2 = 50\ ^\circ\mathrm F = 10.00\ ^\circ\mathrm C = 283.15$ K;
$T_3 = 28\ ^\circ\mathrm F = -2.22\ ^\circ\mathrm C = 270.93$ K.
$\Delta T = T_1 - T_2 = 13.89$ K.

**Step 2 — Arrhenius first, and read the number sceptically.** If
$\tau \propto \exp(E_a/RT)$,

$$ \ln\frac{\tau_2}{\tau_1} = \frac{E_a}{R}\left(\frac{1}{T_2}-\frac{1}{T_1}\right) $$

$\ln(600/2.4) = \ln 250 = 5.521$; $1/T_2 - 1/T_1 = 3.5317\times10^{-3} -
3.3666\times10^{-3} = 1.6513\times10^{-4}\ \mathrm{K^{-1}}$. Hence

$$ E_a = \frac{(8.3145)(5.521)}{1.6513\times10^{-4}} = 2.78\times10^{5}\ \mathrm{J/mol} = 278\ \mathrm{kJ/mol} $$

Extrapolating to $T_3 = 270.93$ K: $1/T_3 - 1/T_1 = 3.2446\times10^{-4}$ K⁻¹,
so $\ln a_T = (2.78\times10^{5}/8.3145)(3.2446\times10^{-4}) = 10.85$,
$a_T = 5.15\times10^{4}$, and

$$ \tau(28\ ^\circ\mathrm F) \approx 2.4 \times 5.15\times10^{4} = 1.24\times10^{5}\ \mathrm{s} \approx 1.4\ \text{days} $$

[A][J] **278 kJ/mol looks entirely respectable** — it is the same order as a C–C
bond dissociation energy — and that is exactly the trap. A *physical* relaxation
process has no bond to break; apparent activation energies of 200–400 kJ/mol are
the classic signature of a polymer near its glass transition, where the
temperature dependence is *not* Arrhenius at all and the apparent $E_a$ is itself
a function of temperature. So the Arrhenius fit is a valid interpolation between
the two measured points and an unreliable extrapolation beyond them. Do it
anyway, keep the answer, and cross-check with a model that has the right physics.

**Step 3 — fit WLF (Eq. 3.1) instead.** Take the universal constants
$C_1 = 17.44$, $C_2 = 51.6$ K referenced to $T_g$, and let $x \equiv T_1 - T_g$.
Requiring the model to reproduce the measured shift $\log_{10}(600/2.4) = 2.398$:

$$ \frac{C_1 x}{C_2 + x} - \frac{C_1 (x - \Delta T)}{C_2 + x - \Delta T} = 2.398 $$

Solving numerically gives $x = 27.87$ K, i.e. $T_g = 297.04 - 27.87 = 269.17$ K
$= -3.98\ ^\circ$C.

**Step 4 — extrapolate to 28 °F.** With $T_3 - T_g = 270.93 - 269.17 = 1.76$ K:

$$ \log_{10} a_T(T_3) - \log_{10} a_T(T_1) = -\frac{17.44(1.76)}{51.6+1.76} + \frac{17.44(27.87)}{51.6+27.87} = 5.541 $$

$a_T = 3.47\times10^{5}$, so

$$ \tau(28\ ^\circ\mathrm F) = 2.4\ \mathrm{s} \times 3.47\times10^{5} = 8.3\times10^{5}\ \mathrm{s} \approx 10\ \text{days} $$

At the 36 °F ambient the same model gives $a_T = 1.75\times10^4$ and
$\tau \approx 4.2\times10^{4}$ s ≈ 12 hours.

**Step 5 — compare with the duty cycle, and compare the two models.** The seal
must follow a gap that opens over roughly $0.6$ s. The two independent models
give, at 28 °F:

| model | $a_T$ at 28 °F | $\tau$ (s) | $\tau/t_{\text{duty}}$ |
|---|---|---|---|
| Arrhenius (Step 2) | $5.15\times10^{4}$ | $1.24\times10^{5}$ | $2\times10^{5}$ |
| WLF (Step 4) | $3.47\times10^{5}$ | $8.3\times10^{5}$ | $1.4\times10^{6}$ |

They disagree by a factor of 7 — and **they agree on the only thing that
matters**: the seal's response time exceeds its duty by five to six orders of
magnitude. A conclusion that survives a factor-of-7 model disagreement is a
robust conclusion.

**Step 6 — state what is wrong with the model.** [A][J] Three things, and a
competent investigator states all of them.
(i) A **two-point fit** to a three-parameter model with two constants assumed is
not a material characterisation; the fitted $T_g = -4\ ^\circ$C is **higher than
the accepted $T_g$ of fluorocarbon elastomers (roughly −23 to −18 °C)**, which
tells you the "loss of contact" test is not a pure relaxation measurement — it
convolves relaxation with geometry, squeeze and friction.
(ii) The extrapolation to $T_3$ sits only 1.8 K above the fitted $T_g$, exactly
where WLF diverges and is least trustworthy.
(iii) The absolute number is therefore meaningless; **the order of magnitude is
not.** Any model that reproduces the 2.4 s → 600 s shift over 13.9 K predicts a
further catastrophic shift over the next 12.2 K, because that is what the data
already showed — which is why the two models in Step 5 agree despite disagreeing.

**Sanity check.** The defensible conclusion is not "the recovery time was
8.3×10⁵ s." It is: *the measured data alone establish a 250× degradation for a
13.9 K drop; a further 12.2 K drop lies in the same steepening regime; therefore
the seal's response time at 28 °F exceeds the 0.6 s duty by at least five orders
of magnitude, on any model that fits the data.* That is a conclusion robust to the
model, and it is the conclusion the Commission reached without the algebra
`[Rogers86 ch. IV]`.

### WE2 — Pressure–time signatures of three solid-motor faults

**Given.** The generic motor of module 23: HTPB/AP composite, $n = 0.35$,
$a = 3.2322\times10^{-5}$ m/s·Pa$^{-n}$, $\rho_p = 1{,}770$ kg/m³,
$c^\ast = 1{,}550$ m/s, initial burning area $A_{b} = 2.827$ m²,
throat area $A_t = 8.9937\times10^{-3}$ m², nominal equilibrium chamber
pressure $p_1 = 6.90$ MPa.

**Find.** The chamber-pressure signature of (a) a debond that exposes extra
burning surface, (b) a case burn-through that opens a vent, and (c) throat
over-erosion — and the rule that distinguishes them from telemetry.

**Step 1 — the governing relation.** From module 20, at equilibrium
$p = (a \rho_p c^\ast K_n)^{1/(1-n)}$ with $K_n = A_b / A_t$. Hence for any
perturbation

$$ \frac{p_2}{p_1} = \left(\frac{A_{b,2}/A_{b,1}}{A_{t,2}/A_{t,1}}\right)^{1/(1-n)},
\qquad \frac{1}{1-n} = \frac{1}{0.65} = 1.5385 $$

> **Eq. 5.1 [F]** — variables as §2. **Meaning:** area errors are amplified by
> 1.5385 in pressure. **Assumes:** quasi-steady, unchanged $c^\ast$, choked
> nozzle. **Fails when:** the area change is faster than the chamber filling time
> $V_c/(c^\ast A_t)$, typically 10–50 ms, in which case the transient overshoots.

**Step 2 — (a) debond exposing burning surface.** A liner debond that exposes
propellant along the case wall adds $A_b$ with $A_t$ unchanged:

| $A_{b,2}/A_{b,1}$ | $p_2/p_1$ | $p_2$ (MPa) |
|---|---|---|
| 1.05 | 1.078 | 7.44 |
| 1.10 | 1.158 | 7.99 |
| 1.20 | 1.324 | 9.13 |
| 1.50 | 1.866 | 12.88 |
| 2.00 | 2.905 | 20.04 |
| 3.00 | 5.420 | 37.40 |

Against a MEOP of, say, 10.35 MPa (1.5× nominal), a **20 % area increase is
survivable and a 50 % increase is not**. A full-length case-wall debond in a
thick-web motor can expose several times the design burning area, which is why
that failure is instantaneous and total.

**Step 3 — (b) case burn-through opening a vent.** Now $A_b$ is unchanged and the
*effective* exit area is $A_t + A_v$:

$$ \frac{p_2}{p_1} = \left(\frac{A_t}{A_t + A_v}\right)^{1.5385} $$

| $A_v$ (m²) | $A_v/A_t$ | $p_2/p_1$ | $p_2$ (MPa) |
|---|---|---|---|
| 0.0005 | 5.6 % | 0.920 | 6.35 |
| 0.0010 | 11.1 % | 0.850 | 5.87 |
| 0.0020 | 22.2 % | 0.734 | 5.07 |
| 0.0050 | 55.6 % | 0.507 | 3.50 |
| 0.0100 | 111 % | 0.317 | 2.19 |
| 0.0200 | 222 % | 0.165 | 1.14 |

A vent of only 25 mm diameter ($A_v = 4.9\times10^{-4}$ m²) already drops chamber
pressure 8 %. This is the Titan 34D-9 and Titan IV K-11 signature: **head-end
pressure falls monotonically while the burning area is still on its designed
schedule**, and — the discriminator — the vehicle simultaneously develops a
**lateral force and a yaw/pitch transient**, because the vent is a nozzle pointed
sideways.

**Step 4 — (c) throat over-erosion.** $A_b$ nominal, $A_t$ growing:

| $A_{t,2}/A_{t,1}$ | $p_2/p_1$ |
|---|---|
| 1.02 | 0.970 |
| 1.05 | 0.928 |
| 1.10 | 0.864 |
| 1.20 | 0.755 |

**Step 5 — the discrimination rule.** All three of (b) and (c) produce a falling
chamber pressure. Distinguish them by three signatures:

| observable | debond → extra $A_b$ | case burn-through | throat over-erosion |
|---|---|---|---|
| head-end $p_c$ | rises, possibly abruptly | falls, accelerating | falls, smooth and monotonic |
| lateral force / vehicle rates | none until case fails | large, immediate | none |
| thrust vs $p_c$ ratio ($C_F$ implied) | consistent | **inconsistent** — mass leaves through a non-nozzle | consistent, but $\varepsilon$ falling so $C_F$ falls slowly |
| burn time | shortened | shortened | lengthened |

Case (c) — smooth droop, no lateral event, no $C_F$ inconsistency, burn time
extending — is precisely what VV22 showed `[ESA-VV22]`.

**Sanity check.** The Shuttle SRB runs at ~6.25 MPa with a throat area of order
$1.0$ m²; a vent of $A_v/A_t = 10\%$ there is a hole of order 0.36 m diameter,
which is a very large burn-through — consistent with the observation that
*Challenger's* right SRB pressure divergence was a few percent and slow, not a
collapse `[Rogers86 ch. IV]` `[NASA-SRB]`.

### WE3 — COPV stored energy and the solid-oxygen ignition arithmetic

**Given.** A representative launch-vehicle helium COPV: internal volume
$V = 100$ L $= 0.100$ m³, service pressure $p = 380$ bar $= 3.80\times10^{7}$ Pa,
gas temperature $T = 90$ K (submerged in a LOX tank), helium $\gamma = 1.667$,
$M = 4.0026$ kg/kmol. Ambient $p_a = 1.0\times10^{5}$ Pa. *(A generic vessel; the
Falcon 9 second-stage COPV dimensions are not published.)*

**Find.** (a) The stored energy; (b) the helium inventory; (c) the mass of solid
oxygen that fits in a 5 cm³ buckle void and the energy released if it burns the
surrounding carbon; (d) why the ratio of (c) to the ignition energy is the whole
story.

**Step 1 — stored energy.** For isentropic expansion of an ideal gas to ambient:

$$ E = \frac{pV}{\gamma-1}\left[1 - \left(\frac{p_a}{p}\right)^{(\gamma-1)/\gamma}\right] $$

> **Eq. 5.2 [A]** — variables: $E$ available work (J); $p$, $V$ vessel pressure
> and volume; $\gamma$ ratio of specific heats; $p_a$ ambient pressure.
> **Meaning:** the mechanical work a burst vessel can do on its surroundings.
> **Assumes:** ideal gas, isentropic, no heat transfer during the burst.
> **Fails when:** $Z \ne 1$ (helium at 380 bar and 90 K has $Z \approx 1.2$, so
> this underestimates the mass and hence the energy by roughly that factor), and
> when the burst is slow enough to be near-isothermal (which gives more energy).

$pV = (3.80\times10^{7})(0.100) = 3.80\times10^{6}$ J.
$pV/(\gamma-1) = 3.80\times10^{6}/0.667 = 5.700\times10^{6}$ J.
$(p_a/p)^{(\gamma-1)/\gamma} = (2.632\times10^{-3})^{0.4} = 0.0930$.

$$ E = 5.700\times10^{6}(1 - 0.0930) = 5.17\times10^{6}\ \mathrm{J} = 5.17\ \mathrm{MJ} $$

Expressed as TNT equivalent (4.184 MJ/kg): **1.24 kg TNT**. That is the *purely
mechanical* content of one helium bottle, before any chemistry.

**Step 2 — helium inventory.** $R = 8314.46/4.0026 = 2077.3$ J/(kg·K).
Ideal-gas: $m = pV/(RT) = (3.80\times10^{7})(0.100)/(2077.3 \times 90) = 20.3$ kg.
With $Z \approx 1.2$, about **17 kg** — the correction matters, and this is why
real pressurisation budgets use `[NIST-WB]`/`[REFPROP]` densities and not the
ideal gas law.

**Step 3 — solid oxygen in a buckle.** Solid oxygen ($\gamma$-phase, near the
triple point at 54.36 K) has a density of roughly 1,300 kg/m³. A buckle void of
$V_v = 5\ \mathrm{cm^3} = 5\times10^{-6}$ m³ holds

$$ m_{\mathrm{O_2}} = (1300)(5\times10^{-6}) = 6.50\times10^{-3}\ \mathrm{kg} = 6.5\ \mathrm{g} $$

**Step 4 — energy available if it burns the overwrap.** Stoichiometric
C + O₂ → CO₂ consumes carbon in the mass ratio $12.011/31.999 = 0.3754$:

$$ m_C = (0.3754)(6.50\ \mathrm{g}) = 2.44\ \mathrm{g} $$

At $\Delta h_c \approx 32.8$ MJ/kg for carbon,

$$ Q = (2.44\times10^{-3})(32.8\times10^{6}) = 8.0\times10^{4}\ \mathrm{J} = 80\ \mathrm{kJ} $$

**Step 5 — the ratio that matters.** The minimum ignition energy for a carbon
surface in high-pressure oxygen is of order **1 mJ** `[G-095]`. The elastic energy
released when a single high-modulus carbon fibre of 7 µm diameter and 10 mm gauge
fails at 5 GPa strain is easily of that order. So:

$$ \frac{Q_{\text{released}}}{E_{\text{ignition}}} \approx \frac{8.0\times10^{4}}{1\times10^{-3}} = 8\times10^{7} $$

**Step 6 — interpretation.** [J] 80 kJ is small compared with the 5.17 MJ of
stored pneumatic energy — but it does not have to be large. It only has to be
enough to burn through the liner locally or to run away into the surrounding
overwrap, at which point the 5.17 MJ is released as well. **The chemistry is the
trigger; the pneumatics are the payload.** This is why the corrective action for
AMOS-6 was to prevent SOX from forming (procedure) and to prevent the buckle
(design), not to make the vessel stronger: strength does not address an ignition
mechanism `[SpaceX-AMOS6]` `[AIAA-S-081]`.

**Sanity check.** 5.2 MJ ≈ 1.2 kg TNT for a single 100 L bottle at 380 bar is
consistent with the standard rule of thumb that a high-pressure gas cylinder
carries roughly $10^{-2}$ kg TNT-equivalent per litre-hundred-bar; here
$100\ \mathrm{L}\times 3.8\ (\text{hundred bar}) \times 3\times10^{-3}
\approx 1.1$ kg. Same order.

### WE4 — Inducer cavitation cycles to fatigue

**Given.** An LH₂ turbopump with shaft speed **41,900 rpm** (the published LE-7A
liquid-hydrogen turbopump speed; the LE-7's own speed is **not reliably
published** in this course's reference set, so this is a representative value
`[verify-liquid §5]`). The inducer operates in a rotating-cavitation regime with
the cavity pattern propagating at **1.1–1.3 times** shaft speed. First-stage burn
duration to the failure event: **239 s**. Inducer blade material: a titanium
alloy with a Basquin fit $\sigma_a = \sigma_f'(2N)^b$, $\sigma_f' = 1{,}800$ MPa,
$b = -0.090$.

**Find.** (a) shaft frequency; (b) the alternating-load frequency seen by a blade
in the rotating frame; (c) cycles accumulated in the burn; (d) the alternating
stress that would cause failure at that count; (e) what this implies about
qualification.

**Step 1 — shaft frequency.**

$$ \Omega = \frac{41{,}900}{60} = 698.3\ \mathrm{Hz} $$

**Step 2 — excitation frequency in the rotating frame.** A cavitation pattern
propagating at $\lambda\Omega$ in the stationary frame passes a given blade at
$(\lambda - 1)\Omega$ in the rotating frame:

$$ f_{\text{exc}} = (\lambda - 1)\,\Omega $$

> **Eq. 5.3 [F]** — variables: $\lambda$ propagation ratio (–), $\Omega$ shaft
> frequency (Hz). **Meaning:** super-synchronous rotating cavitation loads the
> blade at the *difference* frequency, which is small compared with shaft speed
> but still hundreds of hertz. **Assumes:** a single dominant propagating cell.
> **Fails when:** multiple cells or cavitation surge (an axial, roughly
> synchronous-with-system mode) dominate instead.

| $\lambda$ | $f_{\text{exc}}$ (Hz) | cycles in 239 s |
|---|---|---|
| 1.1 | 69.8 | $1.67\times10^{4}$ |
| 1.2 | 139.7 | $3.34\times10^{4}$ |
| 1.3 | 209.5 | $5.01\times10^{4}$ |

For comparison, the **blade-passing** frequency for a 3-bladed inducer is
$3\Omega = 2{,}095$ Hz — 15 times higher, and if *that* mechanism drives the
blade, the same 239 s accumulates $5\times10^{5}$ cycles.

**Step 3 — take the mid case.** $N \approx 3.34\times10^{4}$ cycles,
$2N = 6.68\times10^{4}$ reversals.

**Step 4 — Basquin.**

$$ \sigma_a = \sigma_f'(2N)^b = (1800\ \mathrm{MPa})(6.68\times10^{4})^{-0.090} $$

$\ln(6.68\times10^{4}) = 11.11$; $(6.68\times10^4)^{-0.090} = e^{-1.000} = 0.368$.

$$ \sigma_a = (1800)(0.368) = 662\ \mathrm{MPa} $$

**Step 5 — interpretation.** [J] 662 MPa alternating is a **large but entirely
attainable** blade stress for an inducer blade with a fillet stress
concentration, running in a fluid whose density fluctuates by orders of magnitude
as cavities collapse on the suction surface. In other words: **one flight is
enough**. The component does not need a long service life to reach its fatigue
limit; it needs about four minutes.

**Step 6 — what this implies about qualification.** Three consequences:
(i) A ground test that runs the pump at *nominal* inlet pressure accumulates
cycles at a benign amplitude and proves nothing about the cavitating case;
(ii) the qualification variable is **inlet pressure**, and you must map the
instability boundary across the whole NPSH range, in the real cryogen, with blade
strain gauges or tip-timing — not just head rise `[SP-8107]` `[Brennen-Pumps]`;
(iii) if the instability boundary sits inside the flight envelope, the correct fix
is to move the boundary (redesign the inducer) or move the envelope (raise tank
pressure, lower chamber pressure). The LE-7A did **both**: a redesigned inducer
*and* a chamber pressure reduced from 12.7 to 12.0 MPa `[verify-liquid §5]`.

**Sanity check.** $3\times10^{4}$ cycles is squarely in the low-to-intermediate
cycle regime where a titanium S–N curve is steep — meaning small changes in
alternating stress change life by an order of magnitude. That steepness is
exactly why cavitation-driven inducer failures are *sudden*: the transition from
"fine for 20 flights" to "fails on this one" is a modest change in inlet
condition.

---

## 6. Real engines: why the redesigns look the way they do

### 6.1 RSRM field joint (historical) — why a capture feature and not a better O-ring

The available options after STS-51L were: (a) a more resilient elastomer with a
lower $T_g$; (b) more or larger O-rings; (c) heaters to hold the seal warm;
(d) eliminate the field joint by shipping monolithic motors; (e) mechanically
prevent the joint from opening. Option (d) was infeasible — a monolithic Shuttle
SRB cannot be transported from Utah. Options (a)–(c) all treat the *seal* as the
problem. The RSRM took (e) **plus** (b) **plus** (c): a capture feature that
limits rotation, a third O-ring, redesigned insulation to keep gas away, and
joint heaters with a temperature launch-commit criterion `[NASA-SRB]`
`[Rogers86]`.

**Would a modern engineer choose the same?** [J] Given the same constraint —
segmented steel case, rail transport — yes, and the RSRM flew 110 consecutive
missions without a joint failure. But a modern programme would question the
constraint. The Ariane 5 EAP and Vega P80 use **filament-wound or segmented
composite cases** with different joint concepts, and the SRMU replaced a
five-segment steel LITVC motor with a **three-segment graphite/epoxy** motor —
fewer joints is the more fundamental answer `[verify-solid §A.4]`.

### 6.2 F-1 injector (historical) — why baffles and not acoustic liners

Options in 1962: baffles, acoustic cavities/liners, injector-pattern change,
propellant temperature or additive changes. The F-1 used pattern change **and**
baffles, and the reason is diagnostic capability: the bomb test gave a
*quantitative* damping-time measurement, and baffles produce a monotonic,
predictable improvement in damping that a pattern change does not `[F1-R3896]`
`[SP-194]`.

**Would a modern engineer choose the same?** [M] Partly. The RS-25 uses
**acoustic-resonator cavities in the injector face** rather than baffles, because
at 206 bar in hydrogen the mode structure is different and baffles cost cooling
and life `[verify-liquid §2]`. A modern hydrocarbon engine at F-1 scale would
probably still use baffles — but a modern designer would more likely avoid the
scale entirely, as the RD-170's four chambers on one turbopump did.

### 6.3 LE-7 → LE-7A (historical/modern) — de-rating as a design choice

The LE-7A redesigned both inducers, added turbopump durability changes, redesigned
the nozzle to cure the start-transient side-load problem, and **reduced chamber
pressure from 12.7 to 12.0 MPa** `[verify-liquid §5]`. The alternatives were to
keep pc and buy margin through materials and geometry alone, or to raise tank
pressure (which costs stage inert mass). Japan chose the option that costs
performance and buys margin everywhere at once.

**Would a modern engineer choose the same?** [J] Yes, and this is the least
fashionable lesson in the module. After a turbopump failure, a 6 % chamber
pressure reduction is a very cheap way to buy margin in **every** component
simultaneously — pump discharge pressure, turbine inlet temperature, wall heat
flux, and inducer suction requirement all fall together. The Isp cost is under a
second.

### 6.4 Falcon 9 COPV (modern) — procedure first, design second

After AMOS-6, SpaceX changed the **helium loading procedure** immediately (warmer,
slower helium so SOX cannot form) and pursued a **COPV redesign to eliminate
liner buckling** on a longer timescale `[SpaceX-AMOS6]`. For crew flights NASA
required the redesigned "COPV 2.0" and an extensive qualification programme
including deliberate loading-condition variations.

**Would a modern engineer choose the same?** [M] The sequencing is right and
generalisable: when the mechanism requires a *coincidence* (buckle **and** SOX
**and** fibre fracture), you can break the chain at whichever link is cheapest and
fastest, then fix the underlying design. What you must not do is declare the
procedure change to be the fix.

### 6.5 Antares AJ26 → RD-181 (modern) — when requalification is not the answer

After Orb-3, with three credible root causes and no way to prove any of them
absent in the remaining engine inventory, the programme **replaced the engine**
`[Orb3-IRT]`. The alternative — a teardown-and-inspect programme on 40-year-old
oxidiser-rich turbopumps — could not produce a defensible reliability argument at
any cost.

**Would a modern engineer choose the same?** [J] Yes. The general rule: when the
fault tree cannot be closed, the corrective action must cover **every** open
branch. If that is unaffordable, the honest answer is to change the hardware.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 Failure modes: mechanism → symptom → evidence → fix

| mechanism | symptom | evidence that identifies it | fix |
|---|---|---|---|
| Seal fails to follow joint rotation at low $T$ | Smoke/blow-by at ignition; slow $p_c$ divergence between paired motors | Recovered joint burn path; resiliency test; joint-temperature correlation in flight history | Capture feature, third seal, joint heaters, temperature LCC |
| Insulation-to-case debond | Monotonic $p_c$ droop **plus** lateral force and attitude transient | Telemetry $C_F$ inconsistency; recovered case with erosion pattern; process records | Bond process control, cure monitoring, proof of bond by process not inspection |
| Inhibitor cut into propellant | $p_c$ rise then local burn-through | Repair paperwork; ballistic reanalysis | Prohibit unqualified rework |
| Composite case impact damage | Sudden structural rupture, no $p_c$ precursor | Fracture surfaces; launch imagery | Handling control, impact-damage inspection, damage-tolerance design |
| C–C throat over-erosion | Smooth $p_c$ droop, extended burn, no lateral event | Insert material characterisation; erosion-rate testing of the flight lot | Erosion-rate acceptance criteria; supplier requalification |
| Nozzle thermo-structural coupling | Cooling-circuit temperature/pressure excursion then thrust asymmetry | Trajectory divergence; coupled reanalysis over ascent | Structural reinforcement; coupled analysis across the full pressure history |
| COPV ignition in cryogenic oxidiser | Tank overpressure with no structural precursor | Recovered liner buckles; reproduction test | Loading procedure; buckle-free liner; oxygen-compatibility assessment |
| Strut/bracket failure releasing a pressure vessel | Sub-second tank overpressure | Wreckage; destructive testing of the part population | Article-level proof test; redundant load path |
| Inducer rotating cavitation | Turbopump vibration rise, then speed/pressure collapse | Recovered fracture surfaces; instability-boundary testing | Inducer redesign; raise NPSH; de-rate $p_c$ |
| LOX-side bearing rub | Sudden turbopump destruction, no warning | Teardown of like hardware; often unresolvable | Balance-piston design; oxygen-compatible materials; clearance control |
| Sensor failure driving a redline | Single parameter off-nominal, all others healthy | Post-flight sensor inspection; parameter cross-checks | Reasonableness checks; sensor disqualification logic |
| Loose internal part (filter, screen) | Downstream flow degradation; mixture-ratio and temperature excursion | Vibration reproduction on the stand | Retention design qualified to flight vibration |

### 7.2 Materials

Four material families recur. **Fluorocarbon elastomers** in seals — chosen for
propellant and temperature compatibility, and limited by $T_g$ and by
compression-set. **D6AC and similar high-strength low-alloy steels** in
segmented motor cases — chosen for toughness and weldability at 12.7 mm wall,
and limited by mass. **Carbon/epoxy filament windings** — chosen for a mass
fraction gain of ~6 points, and limited by damage intolerance and by the fact
that the structural property that matters (residual strength after impact) is not
measurable without destroying the article. **Carbon–carbon** in throat inserts —
chosen for erosion resistance at 3,400 K, and limited by the fact that "carbon–carbon"
names a process family, not a material `[SP-8115]` `[SP-8025]` `[AIAA-S-081]`.

### 7.3 Manufacturing

The process-escape cases in this module all share one feature: **the deviation
left no signature detectable by the acceptance method in use**. A bond line that
is touching but not bonded passes a tap test. A substituted solder with a higher
melting point passes a visual inspection of a joint that looks filled. A
stainless strut with an internal defect passes a material certification based on
lot sampling. A carbon–carbon billet with a homogeneity flaw passes a density and
strength check. [J] The generalisation: **your acceptance test must measure the
property the function depends on, at the condition the function occurs.** If that
is impossible non-destructively, then the defence is statistical process control
plus destructive lot testing, and you must say so explicitly in the
qualification logic rather than pretending the inspection covers it.

### 7.4 Testing

What the cases demand of a test programme:

- **Vacuum, not sea level**, for any component whose environment differs — the
  J-2 ASI bellows.
- **Cold, not ambient**, for any elastomer, at the flight rate.
- **The full trajectory pressure history**, not endpoints, for large nozzles.
- **The instability boundary, not the operating point**, for inducers — sweep
  inlet pressure, instrument blade strain.
- **Deliberate provocation** of rare events: the F-1 bomb test is the model. If
  you cannot make the failure happen on demand, you cannot qualify against it.
- **Reproduction as closure**: CRS-7's strut population testing, AMOS-6's SOX
  ignition demonstration, LauncherOne's filter-dislodging test. A fault tree
  branch is not closed by an argument.
- **Integrated stage-level hot fire.** The N1's absence of one is the single
  largest process finding in this module.

---

## 8. Misconceptions and what engineers actually care about

**Misconception 1: "The Challenger O-rings failed because they got brittle."**
Not brittle — *slow*. The elastomer's stiffness and its relaxation time both rose,
and the fatal quantity was the relaxation time relative to the 0.6 s joint-opening
duty. A material can be well above its glass transition, perfectly flexible to the
touch, and still be four orders of magnitude too slow.

**Misconception 2: "The Titan 34D-9 failure was the same as Challenger."**
It was not. *Challenger* was a **seal** failure at a joint; Titan 34D-9 was an
**insulation-to-case bond** failure near a joint. Different subsystem, different
mechanism, different fix. The two were conflated at the time, and conflating them
loses the lesson that a segmented motor has two independent failure populations at
every joint.

**Misconception 3: "A stronger COPV would have prevented AMOS-6."**
No. The mechanism was ignition, not overload. A stronger vessel with the same
liner buckle and the same loading procedure has the same fault. Structural margin
does not address a chemical initiator — this is the single most important
distinction in the module.

**Misconception 4: "Redundant sensors make a redline safe."**
Only if the failures are independent. Three identical sensors, in the same
location, from the same lot, in the same environment, have a correlated failure
mode, and a two-of-three vote converts a correlated double failure directly into
a commanded shutdown. STS-51F. Redundancy multiplies reliability only for
independent failures.

**Misconception 5: "Falling chamber pressure means the propellant is exhausted."**
Chamber pressure falls for at least four independent reasons: burning-area
regression on schedule, throat erosion, a vent in the case, and a feed-system
restriction. Distinguishing them requires the *thrust-to-pressure ratio* and the
*vehicle rates*, not the pressure trace alone. WE2.

**Misconception 6: "More engines means lower reliability."**
Only without engine-out capability. The N1 flew 30 engines with no meaningful
engine-out and no integrated ground test; Falcon 9 flies nine with both. Engine
count and reliability are coupled through the *architecture*, not directly.

**Misconception 7: "Root cause means the first thing that went wrong."**
Root cause means the condition whose correction prevents the whole class from
recurring. For *Challenger* the first thing that went wrong was a cold O-ring;
the root cause was a decision process. Both fixes were needed.

**Misconception 8: "A company statement is a failure report."**
It is a data point of a specific and limited kind. Distinguish presidential
commissions and independent enquiry commissions (mechanisms, with evidence) from
regulatory closures (categories and corrective actions) from company statements
(what the company chose to publish). Cite accordingly.

### What engineers actually care about

1. **"What is the single-point failure list, and what proof-tests each item?"**
   The CRS-7 strut and the Vega throat insert were both on such a list, or should
   have been.
2. **"What changed since the last flight?"** — supplier, lot, procedure,
   consumable, software, temperature. Nearly every process-escape case in this
   module answers to a change that was not recognised as one.
3. **"Where does my ground test help me in a way flight will not?"** The
   discipline behind test-as-you-fly, and the hardest question on this list.
4. **"What is the failure mode of the measurement?"** Before you trust a redline,
   an acceptance test, or an NDE result.
5. **"What is the trend in my anomaly data?"** Not "is each anomaly acceptable" —
   is the *rate* or the *severity* moving, and against what variable.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can name the propulsion failure mode in each of
the major cases (Challenger: field-joint seal; Titan 34D-9: insulation debond;
CRS-7: strut/COPV; AMOS-6: COPV ignition; LE-7: inducer cavitation fatigue;
VV22: carbon–carbon throat erosion), state the six failure classes, and explain
in plain language why a cold O-ring is slow rather than brittle.

**Level 2 — Working engineering knowledge.** Given the equilibrium-pressure
relation and a described telemetry trace, you can compute the pressure signature
of a debond, a vent and a throat erosion and say which is which. You can compute
COPV stored energy and the SOX energy balance. You can estimate inducer fatigue
cycles from shaft speed and a propagation ratio. You can classify any of the
cases into the six-class taxonomy and defend the classification, and you can state
what corrective action each class demands.

**Level 3 — Interview mastery.** Handed an unfamiliar failure — a described
anomaly on a vehicle you have never seen — you can build the fault tree, say what
evidence would close each branch and in what order you would seek it, name the
two or three historical cases that share the mechanism, propose a corrective
action set that addresses the root cause and not only the proximate cause, and
say honestly what the public record does and does not support. You can also argue
the other side: when a programme was *right* to accept a known anomaly, and what
distinguishes that judgement from normalisation of deviance.

---

## 10. Problems

### Conceptual

**C1.** Explain, in terms of the physical duty cycle rather than the material,
why the Shuttle SRM field joint seal is a *dynamic* component. What measurement
would you require in its qualification that a static seal would not need?

**C2.** A segmented solid motor has both an O-ring seal and an insulation-to-case
bond at every field joint. Argue that these are two independent failure
populations, and state what evidence would distinguish a seal failure from a bond
failure in post-flight wreckage.

**C3.** The AMOS-6 investigation concluded that liner buckles "were not shown to
burst a COPV on their own." Explain how a feature can be simultaneously
structurally acceptable and the enabling condition for a catastrophic failure,
and give one other example from this module of the same pattern.

**C4.** Why does a two-of-three sensor vote fail to protect against the STS-51F
failure mode? Propose an architecture that would have, and state its cost.

**C5.** The Apollo 6 J-2 augmented-spark-igniter line failed in flight but never
in ground test. State the general principle this illustrates and give two other
examples — one from this module, one you construct yourself — of a ground
environment supplying a benefit that flight does not.

**C6.** The Vega-C VV22 commission's central finding was that "the criteria used
to accept the C–C throat insert were not sufficient to demonstrate its
flightworthiness." Explain why this is a finding about *qualification method*
rather than about carbon–carbon, and say what property the acceptance test should
have measured.

**C7.** Argue both sides: the N1's thirty engines were (a) the cause of the
programme's failure, (b) irrelevant to it. Which argument is stronger and why?

**C8.** Distinguish "normalisation of deviance" from "the legitimate acceptance of
a known, characterised anomaly." Give a criterion an engineer could apply in real
time to tell them apart.

### Calculation

**P1.** A composite solid motor has $n = 0.30$, nominal chamber pressure 8.0 MPa
and MEOP 12.0 MPa. A casting void exposed at burnback increases the burning area
by 22 %. Compute the new equilibrium pressure and state whether the motor
survives. Repeat for $n = 0.45$ and comment on which propellant class is more
forgiving.

**P2.** The same motor has $A_t = 0.020$ m². A case burn-through opens a vent that
grows linearly from 0 to $0.008$ m² over 4.0 s. Using $n = 0.30$, tabulate the
chamber pressure at 1 s intervals and sketch (describe) the trace. At what vent
area has the pressure fallen 25 %?

**P3.** A helium COPV holds 65 L at 31 MPa and 100 K. Compute (a) the stored
energy by Eq. 5.2, (b) the TNT equivalent, (c) the helium mass assuming ideal
gas, and (d) state which way the ideal-gas assumption errs and by roughly how
much.

**P4.** A liner buckle traps a void of 12 cm³ that fills with solid oxygen at
1,300 kg/m³. Compute the O₂ mass, the stoichiometric carbon mass, and the
combustion energy release. Compare it with the strain energy stored in 12 cm³ of
carbon/epoxy overwrap at 1.2 % strain and 140 GPa modulus, and comment.

**P5.** A LOX turbopump runs at 18,300 rpm. Its four-bladed inducer operates with
rotating cavitation at a propagation ratio of 1.15. Compute the rotating-frame
excitation frequency and the cycles accumulated in a 400 s burn. Using
$\sigma_f' = 1{,}400$ MPa and $b = -0.085$, find the alternating stress
corresponding to that life.

**P6.** Using the Rogers Commission resiliency data (2.4 s at 75 °F, 600 s at
50 °F), fit an Arrhenius model and report the apparent activation energy. Use it
to predict the recovery time at **40 °F**, then repeat the prediction with the
WLF fit of WE1 ($T_g = 269.17$ K, $C_1 = 17.44$, $C_2 = 51.6$ K). Report both,
state which you would quote to a launch-readiness review and why, and say in one
sentence what the magnitude of the apparent $E_a$ tells you about the Arrhenius
model.

**P7.** A solid motor's throat erodes 8 % more than predicted over its burn.
With $n = 0.35$, compute the end-of-burn chamber pressure ratio, and estimate the
percentage change in delivered total impulse if $c^\ast$ is unaffected and the
burn simply extends. State your assumptions.

**P8.** Read from the engine data in `reference/_verify-liquid.md`: the LE-7
chamber pressure and the LE-7A chamber pressure. Compute the fractional reduction
and estimate the corresponding reduction in HPFTP discharge pressure requirement,
assuming discharge pressure scales linearly with $p_c$ and the injector pressure
drop is 20 % of $p_c$.

### Engineering reasoning

**R1.** You are handed the following telemetry from a two-booster vehicle:
booster A head-end pressure follows the predicted trace within 1 %; booster B
head-end pressure is 4 % low at $t=20$ s, 11 % low at $t=40$ s, and 26 % low at
$t=55$ s. Vehicle yaw rate is nominal throughout. Total burn time on B is 6 %
longer than A. Name the failure class and the most probable mechanism, and state
the one additional measurement that would confirm it.

**R2.** Same vehicle, different flight: booster B head-end pressure is 3 % low at
$t=8$ s and 9 % low at $t=10$ s; simultaneously the vehicle develops a 2°/s yaw
rate that the TVC system is partially compensating; the thrust-to-chamber-pressure
ratio inferred from vehicle acceleration is 12 % below nominal on B. Name the
failure class and mechanism, and state why the $C_F$ inconsistency is the
decisive observable.

**R3.** An upper-stage engine's telemetry shows: chamber pressure 6 % low, fuel
pump discharge pressure 9 % low, turbine discharge temperature 140 K high,
mixture ratio estimate shifted 8 % oxidiser-rich, and a chamber-wall
thermocouple rising steadily. Name the failure class, propose the two most likely
mechanisms, and say which historical case each corresponds to.

**R4.** A staged-combustion engine shuts down 340 s into a 480 s burn on a
turbine discharge temperature redline. Post-flight, all other parameters —
turbopump speeds, chamber pressure, coolant flow, mixture ratio — were nominal to
the moment of shutdown, and the shutdown transient itself was clean. What is your
leading hypothesis, what is the alternative, and what evidence separates them?

**R5.** You are the responsible engineer for a solid motor whose carbon–carbon
throat insert supplier has gone out of business. A second supplier offers an
insert meeting the same drawing: same dimensions, same density specification,
same room-temperature flexural strength. Write the argument for why this is a
design change, and specify the minimum test programme you would require before
flight.

### Mini trade study

**T1.** A launch-vehicle upper stage stores helium in three COPVs inside its
liquid-oxygen tank. Following an industry-wide re-examination of COPVs in
cryogenic oxidiser service, you must recommend a path forward. Constraints: the
stage's inert mass budget has 40 kg of margin; the vehicle flies 20 times a year;
a design change requires an 18-month qualification programme; a procedure change
can be implemented in 6 weeks; the customer requires crew-rating within 3 years.

Options:
1. Keep the COPVs inside the LOX tank; change only the helium loading procedure
   (warmer helium, slower fill) so solid oxygen cannot form.
2. Keep the COPVs inside the LOX tank; redesign the liner to eliminate buckling,
   requalify, and keep the procedure change as well.
3. Move the COPVs outside the LOX tank into the interstage. Estimated inert-mass
   penalty: 55 kg (longer lines, insulation, mounting structure), plus a
   pressurisation-performance penalty from warmer helium.
4. Replace the COPVs with a metallic (Inconel) pressure vessel inside the tank.
   Estimated inert-mass penalty: 120 kg.

Recommend one, with justification. Address: which failure mechanism each option
eliminates versus mitigates; what each does to the fault tree; the schedule and
mass consequences; and what you would tell a crew-rating authority. State
explicitly which option you would choose if the crew-rating requirement were
removed, and whether that changes your answer.

---

## 11. Quiz (100 points)

**Q1 (8).** Multiple choice. The primary technical reason the Shuttle SRM field
joint seal failed at low temperature was that the O-ring:
(a) became brittle and fractured; (b) shrank below its groove dimensions;
(c) recovered too slowly to follow the joint gap opening during pressurisation;
(d) lost chemical compatibility with the combustion products.

**Q2 (8).** Multiple choice. A solid motor shows a smooth monotonic chamber
pressure droop, extended burn time, no vehicle rate transient, and a
thrust-to-pressure ratio consistent with nominal. The most probable cause is:
(a) insulation debond; (b) case burn-through; (c) nozzle throat over-erosion;
(d) a propellant crack.

**Q3 (10).** Calculation. A motor with $n = 0.40$ suffers a defect that increases
burning area by 15 %. Compute $p_2/p_1$. If nominal pressure is 7.5 MPa and MEOP
is 11.0 MPa, does it survive?

**Q4 (10).** Calculation. A COPV of 80 L at 34 MPa contains helium at 95 K
($\gamma = 1.667$). Compute the isentropic stored energy and express it in kg of
TNT equivalent.

**Q5 (10).** Calculation. An inducer turns at 36,000 rpm with rotating cavitation
at a propagation ratio of 1.25. How many rotating-frame load cycles does a blade
accumulate in a 150 s burn?

**Q6 (8).** Short answer. State the four kinds of evidence that close a fault-tree
branch, in descending order of authority, and give one case from this module
closed principally by each of the first three.

**Q7 (10).** Short answer. Explain why AMOS-6 is classified as a
materials-compatibility failure rather than a structural one, and what corrective
action follows from that classification that would *not* follow from a structural
classification.

**Q8 (12).** Engineering judgement. You are reviewing an anomaly that has occurred
on 7 of the last 22 flights, has never caused a mission loss, and correlates
weakly with ambient temperature. Your programme wants to fly. Write the criteria
you would apply to decide whether accepting it is legitimate engineering or
normalisation of deviance, and state what data you would demand.

**Q9 (12).** Engineering judgement. A supplier informs you that they have changed
the braze alloy used in your engine's injector manifold to an equivalent with a
higher melting point, and asserts the joint strength specification is unchanged.
State what you do, in order, and justify each step by reference to a case in this
module.

**Q10 (12).** Synthesis. Take any three cases from §3 that share a dominant
failure class. State the class, describe what the three have in common at the
level of mechanism (not narrative), and state the single corrective-action
principle that addresses all three. Then name one case in a *different* class
that the same corrective action would **not** have prevented, and explain why.

---

## 12. Further reading

From `reference/sources.md`:

- **`[Rogers86]`** — *Report of the Presidential Commission on the Space Shuttle
  Challenger Accident*, Vol. 1, June 1986,
  <https://ntrs.nasa.gov/citations/19860015255>. Chapter IV is the technical
  account: joint geometry, joint rotation, O-ring resiliency versus temperature,
  putty blow-by. Chapters V–VI are the decision-process findings and are not
  optional reading. The single most important document in this module.
- **`[Biggs89]`** — Biggs, "Space Shuttle Main Engine: The First Ten Years."
  Read for the turbopump development history: HPFTP blade cracking, bearing and
  whirl problems, LOX post failures, and the test-stand incidents. The honest
  account of what staged combustion costs.
- **`[SP-8115]`** — *Solid Rocket Motor Nozzles*. Read for the ablative and
  carbon–carbon material behaviour behind the VV22 case and for what a throat
  insert qualification is supposed to demonstrate.
- **`[SP-8107]`** — *Turbopump Systems for Liquid Rocket Engines*, and
  **`[Brennen-Pumps]`** — Brennen, *Hydrodynamics of Pumps*, ch. 8. Read together
  for cavitation instabilities: rotating cavitation, cavitation surge, and why the
  instability boundary is not the head-breakdown boundary. The LE-7 case is
  unreadable without these.
- **`[SP-8123]`** — *Liquid Rocket Lines, Bellows, Flexible Hoses, and Filters*.
  Read for the Apollo 6 ASI bellows and the LauncherOne filter — both are in
  scope of this monograph, decades apart.
- **`[AIAA-S-081]`** — ANSI/AIAA S-081B, *Space Systems — Composite Overwrapped
  Pressure Vessels*, and **`[G-095]`** — ASTM G95-series / NASA oxygen
  compatibility guidance. Read together for CRS-7 and AMOS-6: the first tells you
  how to qualify a COPV, the second tells you why that is not sufficient in an
  oxygen environment.
- **`[SP-194]`** — Harrje and Reardon, *Liquid Propellant Rocket Combustion
  Instability*. Read for the F-1 case and for the bomb-test methodology.
- **`[Hunley07]`** — Hunley, *The Development of Propulsion Technology for U.S.
  Space-Launch Vehicles*. Read for the Titan solid-motor history and for the
  institutional context of the 1986 failures.
- **`[SP-4206]`** — Bilstein, *Stages to Saturn*. Read for Apollo 6, the J-2
  igniter line, pogo suppression, and the F-1 instability campaign.
- **`[SP-8073]`**, **`[SP-8075]`** — grain structural integrity and processing
  factors. Read for the bond-line failure family: Titan 34D-9, Titan IV K-11,
  Vega VV15.

Sources introduced by this module (to be reconciled into
`reference/sources.md`):

| tag | citation |
|---|---|
| `[Cortright70]` | Cortright, E. M., et al., *Report of the Apollo 13 Review Board*, NASA, June 1970. <https://ntrs.nasa.gov/citations/19700076776> |
| `[Orb3-IRT]` | NASA Independent Review Team, *Orb–3 Accident Investigation Report*, Executive Summary, 9 Oct. 2015. <https://sma.nasa.gov/SignificantIncidents/assets/orb3_accident_investigation_report.pdf> |
| `[ESA-V157]` | ESA/Arianespace, "Arianespace Flight 157 — Inquiry Board submits findings," press release, 7 Jan. 2003. |
| `[CORDIS-V157]` | European Commission CORDIS, "Ariane 5 explosion caused by fault in main engine cooling system," 9 Jan. 2003. |
| `[SN-V157]` | *SpaceNews*, "Arianespace Flight 157: The Inquiry Board Submits its Findings," Jan. 2003. |
| `[ESA-VV15]` | ESA/Arianespace, "Vega flight VV15: findings of the Independent Inquiry Commission's investigations," 5 Sept. 2019. |
| `[Avio-VV15]` | Avio S.p.A., statement on VV15 root cause (thermal protection of the Z23 forward dome), 6 Dec. 2019. |
| `[ESA-VV22]` | ESA/Arianespace, "Loss of flight VV22: Independent Enquiry Commission announces conclusions," 3 Mar. 2023. |
| `[SN-VV22]` | *SpaceNews*, "Independent Enquiry Commission conclusions on loss of Vega-C flight VV22," Mar. 2023. |
| `[PL-VV22]` | *Payload*, "Ukraine contests findings of Vega-C independent inquiry," Mar. 2023. (Records the supplier's dissent.) |
| `[SpaceX-CRS7]` | SpaceX / NASA, "SpaceX Details Preliminary Investigation Findings" (CRS-7), NASA blog, 21 July 2015, and SpaceX final CRS-7 statement. |
| `[NSF-CRS7]` | NASASpaceflight.com, "SpaceX Falcon 9 failure investigation focuses on COPV struts," July 2015; and "NASA's IRT publishes report on SpaceX's CRS-7 failure," Mar. 2018. |
| `[SpaceX-AMOS6]` | SpaceX, "Anomaly Updates" (AMOS-6), 2 Jan. 2017. |
| `[SpaceX-F1]` | SpaceX Falcon 1 flight update statements, 2006–2008. Company statements. |
| `[VO-2023]` | Virgin Orbit, "Virgin Orbit update on UK mission anomaly," 14 Feb. 2023. |
| `[FAA-Starship]` | Federal Aviation Administration, "FAA Closes SpaceX Starship Mishap Investigation," 8 Sept. 2023. |
| `[SFN-Proton15]` | *Spaceflight Now*, "Roscosmos: Design flaw brought down Proton rocket," 1 June 2015. |
| `[SFI-Proton15]` | *Spaceflight Insider*, "Third stage engine blamed for Russian Proton-M rocket crash," 2015. |
| `[SPO-Proton15]` | *SpacePolicyOnline*, "Proton-M Failure Due to Same Design Flaw that Doomed 1988 Mission," 2015. |
| `[SN-Solder]` | *SpaceNews*, "ILS still planning three commercial launches this year despite Proton engine recall," 2016. |
| `[SN-Titan93]` | *SpaceNews*, "Aug. 2, 1993: Death of a Titan." |
| `[GS-Titan]` | GlobalSecurity.org, Titan IV programme summaries (citing USAF/DOT&E material). |
| `[UPI-Titan34D]` | UPI Archives, reporting on the Titan 34D-9 accident investigation findings, 2 July 1986. |
| `[WP-GPSIIR1]` | Wikipedia, *GPS IIR-1* and *List of Delta II launches* (citing Boeing/USAF material). Secondary. |
| `[WP-LE7]` | Wikipedia, *LE-7* (citing JAXA/MHI material). Secondary. |
| `[SFN-Orb3]` | *Spaceflight Now*, "Two Antares failure probes produce different results," 1 Nov. 2015. |
| `[SN-Orb3]` | *SpaceNews*, "Turbopump in AJ-26 engine implicated in Antares failure," 2014. |
| `[YA95-class]` | Yang, V., and Anderson, W. E. (eds.), *Liquid Rocket Engine Combustion Instability*, AIAA Progress Series Vol. 169, 1995 — cited here for Rayleigh-criterion treatment. |

A note on how to read these. `[Rogers86]`, `[Cortright70]` and `[Orb3-IRT]` are
formal investigation reports with evidence appendices. The ESA/Arianespace items
are commission *summaries* — they state conclusions with limited supporting data.
`[FAA-Starship]` is a regulatory closure: it names corrective-action categories,
not mechanisms. The SpaceX and Virgin Orbit items are company statements. Several
entries are secondary reporting of primary findings, marked as such. Where a
finding is disputed — VV22 — the module reports the dispute.
