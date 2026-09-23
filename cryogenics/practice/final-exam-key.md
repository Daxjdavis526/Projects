# Final exam — answer key

*Companion to [`final-exam.md`](final-exam.md). Do not read this until you have
worked the paper.*

Every answer here gives the reasoning, not just the verdict. For the multiple
choice, each wrong option is explained — including **what believing it would
reveal**, because a wrong answer is diagnostic and tells you which module to
re-read. For the scenario questions there is a marking rubric; mark yourself
honestly and generously on mechanism, harshly on conclusions with no mechanism
under them.

Several answers are **facility-specific**, and where they are, this key says so
and says what determines them. That is not evasion. Recognising which questions
have no generic answer is one of the things this exam is testing.

## Marking summary

| Section | Marks | Weight |
|---|---|---|
| A — Multiple choice, 15 × 2 | 30 | 30 % |
| B — Short answer, 5 × 4 | 20 | 20 % |
| C — Scenario and hazard analysis, 5 × 6 | 30 | 30 % |
| D — Schematic and component, 5 × 4 | 20 | 20 % |
| **Total** | **100** | |

**90–100** strong foundational understanding · **80–89** good, some review needed ·
**70–79** significant gaps · **below 70** restudy before progressing.

---

# Section A — Multiple choice

## A1 — (b)

Adding a **non-condensable** pressurant raises the *total* pressure in the ullage
without changing the liquid's temperature, so the tank state is no longer on the
oxygen saturation line: the liquid is now subcooled with respect to total
pressure. That gap is exactly the NPSH margin a feed system needs, and it is why
tank pressurisation, boost pumps and subcooling are three ways of buying one thing
— distance between the fluid's state and its saturation line (Module 01 §8).

Two caveats a strong answer mentions: the margin **decays**, because heat and mass
transfer at the interface warm the surface layer over time, and one TT rarely
represents the bulk of a stratifying tank.

- **(a)** applies the saturation lock where it does not apply. It is true that for
  a *saturated* pure fluid, tank pressure is a temperature measurement — but that
  is the oxygen's own vapour pressure, not the total pressure with helium added.
  Believing it means you would "fix" a healthy instrument, and it points at the
  most dangerous habit in this module: trusting a memorised rule past the
  conditions that generate it.
- **(c)** overcorrects. There is still saturated liquid, still an interface, still
  a vapour pressure; what changed is that total pressure is now the sum of two
  contributions. Believing it reveals that the P–T lock has been learned as a
  slogan rather than as an equilibrium condition.
- **(d)** attaches a real phenomenon to the wrong gas. Helium boils at 4.2238 K
  and condenses on nothing in this system. **Nitrogen** is the gas that condenses
  against a 90 K wall above about 3.6 bar (see A10) — which is the correct version
  of this instinct.

## A2 — (c)

696 : 1 is liquid at NBP → gas at **70 °F and 1 atm**; straight off the boiling
liquid, before the gas has warmed, nitrogen gives only **174.8 : 1**. The big
number is the right basis for total inventory — asphyxiation and relief sizing —
and the small one is closer to how fast the cloud is growing now.

- **(a)** is the reference-condition error the course is built around. An
  expansion ratio without its reference temperature is not a number, it is a
  rumour.
- **(b)** treats 694 versus 696 as a data-quality problem. Both are Air Products
  figures, both correct: Safetygram-7 quotes 68 °F, Safetygram-27 quotes 70 °F,
  and computation from NIST data brackets them (692.0 at 20 °C, 694.6 at 70 °F).
  Believing it reveals a habit of resolving disagreements by hunting for a third
  source rather than by asking what basis each number was quoted on.
- **(d)** inverts conservatism. Using 175 : 1 for an oxygen-deficiency inventory
  under-counts the gas by a factor of four, because the gas does eventually reach
  room temperature. "First" is not the same as "bounding".

## A3 — (c)

Bulletin 503 measured both media on the same apparatus: methane's lean limit moves
5.0 % → 5.15 %, its rich limit 15.0 % → 60.5 %. The larger effect is not gas-phase
at all — most materials, metals included, burn in an oxygen-enriched environment,
ignite at considerably lower temperatures than in air and burn faster once
ignited, and nearly all polymers are flammable in 100 % oxygen at 1 atm.

- **(a)** is the intuition almost everyone arrives with, and it is wrong at the
  lean end. Believing it aims control effort at alarm setpoints, when the actual
  controls are fuel elimination, ignition-source elimination and material
  selection.
- **(b)** is invented. The direction of ignition energy in oxygen is *down*, not
  up, and AIT is strongly apparatus-dependent rather than a fundamental property.
- **(d)** gets the materials half right by accident but denies a fourfold widening
  of the flammable range. Believing it means a fuel-rich mixture that would
  self-extinguish in air gets treated as safe in an enriched space.

## A4 — (a)

Liquid nitrogen boils **12.83 K below** liquid oxygen (77.3549 K against
90.1875 K). The sharp version: oxygen's vapour pressure at 77.355 K is 0.2076 bar
and oxygen's partial pressure in air at 1 atm is 0.2122 bar — atmospheric oxygen
is essentially *at saturation* at LN₂ temperature, so anything marginally colder
pulls it out of the air continuously. Air's dew point at 1 atm is about 82 K and
the first condensate is ≈53.5 mol % oxygen, rising toward 80 % with continued
exposure as nitrogen preferentially boils off.

- **(b)** methane boils at 111.667 K — **21.5 K above** oxygen — so a methane
  surface cannot condense oxygen at all. Believing it reveals that the ordering
  LN₂ < LOX < LCH₄ has not been internalised, and it is the ordering almost every
  surprise in this course falls out of.
- **(c)** attaches the hazard to the *fluid's identity* rather than the *surface
  temperature*. A 90.2 K surface is warmer than air's 82 K dew point and condenses
  nothing but water and CO₂.
- **(d)** confuses water frost with oxygen condensation. Everything below the
  ambient dew point grows frost; oxygen needs about 82 K.

## A5 — (a)

The LBNL table is one line of arithmetic on explicit assumptions: a rigid,
perfectly strong, sealed volume, 100 % liquid-full at NBP and 1 atm, all of it
ending as gas at ~294 K in that same volume, ideal gas, no leakage. It is an
**endpoint, not a threshold**, and it is not conservative — at that density the
fluid is a dense supercritical fluid with a compressibility factor above 1, so the
true demand is higher. Real fittings, hose and valve bodies fail one to two orders
of magnitude below it. There is no "strong enough pipe" answer; there is only a
relief path.

- **(b)** believes you can out-build an unbounded demand, and quietly assumes the
  weakest item is the tubing rather than a fitting, a gasket or a valve body.
- **(c)** invents a bound nobody has. Believing it reveals reading a hazard number
  as a design number.
- **(d)** notices that oxygen's ratio is larger and misses that all five cryogens
  land in the same 10,200–12,600 psig band. Oxygen's difference is combustive —
  a component failing at pressure while soaked in LOX is an ignition event as well
  as a mechanical one — not a matter of a few thousand psi.

## A6 — (d)

The clamped members shrink more than the bolt, so the bolt unloads. Worked in
Module 04: 40 mm grip, Al 6061 at 0.389 % gives 0.1556 mm, SS 304 at 0.280 % gives
0.1120 mm, differential 0.0436 mm — **63 % of the bolt's entire 0.0690 mm elastic
stretch at 20 kN preload** — and with a typical member stiffness the load lost is
about 10.1 kN, roughly half the preload, before any pressure is applied. The fixes
fall straight out: match materials, make the bolt contract at least as much as the
stack, add compliance (Belleville washers), or athermalise the grip with Invar.

- **(a)** is the sign error. Believing it means never asking *which member spans
  the joint*, which is the only question that decides the sign.
- **(b)** misfiles austenitic stainless. 304 is f.c.c. and gets *tougher* cold;
  316's K_IC goes from 350 to 510 MPa·m^0.5 between 295 K and 77 K. The brittle
  fasteners to worry about are carbon steel.
- **(c)** is true about α and false about the answer. α does fall steeply on
  cooling — which is exactly why cryogenic practice uses the already-integrated
  ΔL/L rather than α₂₉₃ × ΔT. Structural metals still move 0.2–0.4 % to 77 K.

## A7 — (d)

A spring-energised PTFE seal works because a corrosion-resistant metal spring
supplies the contact load instead of the polymer's elasticity, and the spring's
travel absorbs the differential contraction. It is the standard cryogenic dynamic
seal. Where a static joint must come apart, a metal gasket face seal is the
counterpart, sealing by plastic deformation rather than by an elastomer.

- **(a)** and **(b)** read the elastomer table as though its bottom row were near
  cryogenic temperature. The best conventional elastomer in Parker's catalogue
  stops at about 200 K; LN₂ is 77 K, LH₂ 20 K. Every compound listed would be
  120–180 K below its own rating. This is not a marginal judgement call — it is
  off the end of the table, and believing otherwise means you would specify a seal
  that is a hard ring in a groove.
- **(c)** is half right and therefore dangerous. PTFE *is* usable to 4 K, but it
  was never elastic, and it contracts 1.944 % against stainless's 0.280 % — nearly
  seven times. Left to its own elasticity it cannot rebound to follow a gland that
  is still moving. That is precisely why it needs external energising.

## A8 — (c)

Nickel steels show how much alloying it takes to drag a b.c.c. steel down: A203
Grade D/E (3.5 Ni) to 173 K, A645 (5.5 Ni) to 77 K, A553 Type I (9 Ni) to 77 K.
**Note the ceiling — even 9 % nickel steel stops at 77 K.** Liquid hydrogen is
20.4 K, and for that you are in austenitic stainless, aluminium or copper.

- **(a)** stops at the phrase "qualified for cryogenic service" without asking
  *to what temperature*. That is the single most common materials error in this
  subject.
- **(b)** picks the wrong failure mode. The structural metals cluster within a
  factor of two on contraction; brittleness is what sorts them, and it sorts them
  on crystal structure.
- **(d)** confuses alloying with phase. These grades are not austenitic — which is
  exactly why they carry a ductile-to-brittle transition at all.

## A9 — (a)

The plug sits in the combined pump-out and relief port and blows out when the
annulus is no longer a vacuum, so the plug on the floor is the signature of an
annulus that has pressurised — most plausibly an inner-line leak. Design fluxes
for a failed insulating vacuum are **1–7 kW/m² insulated and 25–40 kW/m² bare**
against roughly **0.6 W/m²** healthy: three to four orders of magnitude. The
mechanism is not convection — air entering a cold annulus **condenses and freezes
on the inner vessel**, and that latent heat delivers the flux; the ice can also
obstruct the reliefs. Ice on the outer casing of a vacuum-jacketed vessel is a
clear sign the jacket has failed.

- **(b)** understates by three orders of magnitude and credits MLI it should not.
  MLI performs only below about 10⁻³ torr; a light gas load of 0.7 kPa already
  gives a 15× rise in heat flux. Intact MLI is no defence once the vacuum is gone.
- **(c)** treats frost as cosmetic. A healthy vacuum jacket's outer casing sits
  near ambient and should not frost at all.
- **(d)** gets the right magnitude for the wrong reason, and the reason matters:
  relief sizing for loss of vacuum is set by condensation latent heat, not by gas
  conduction.

## A10 — (c)

Nitrogen's saturation temperature climbs steeply with pressure: **3.6 bar
(~52 psia) at 90 K**, about **15.6 bar at 111.7 K**. Purge and pressurant supplies
run well above that, so GN₂ pressurant liquefies on a LOX-cold ullage wall,
putting liquid where gas was intended and collapsing the pressure you were trying
to build. Helium stays gaseous under anything the system will see — and in a
hydrogen system nitrogen does not merely condense, it freezes solid (nitrogen's
triple point is 63.15 K).

- **(a)** cites a real property with no bearing on the choice. Helium's low latent
  heat is a boiloff and inventory issue, not a pressurant-selection argument.
- **(b)** treats "compatibility" as chemistry. Nitrogen is chemically inert with
  oxygen; the problem is a phase change.
- **(d)** reaches for authority instead of mechanism. Believing it means you would
  not recognise the same failure when it appears in a purge line, an actuator
  supply, or an annulus blanket.

## A11 — (d)

A catalytic bead (pellistor) works by oxidising the gas on a heated bead, so it
**requires oxygen** and reads low or zero in an inert or fuel-rich atmosphere.
Poisoning by silicones, sulphur or halogens fails the same direction. Both
failures look exactly like a clean atmosphere on the panel. Point infrared is
immune to poisoning and works with no oxygen, and is the sensor that belongs
inside a purged enclosure — at the cost of being blinded by dirt, ice or
condensation on its windows.

- **(a)** assumes detectors are technology-agnostic, which is the assumption that
  puts the wrong sensor in the worst place.
- **(b)** expects an annunciation the sensor cannot generate. A bump test proves
  the loop is alive; only calibration proves the number.
- **(c)** swaps the sensor families around.

## A12 — (c)

Cold methane vapour at its boiling point is about **1.5×** the density of ambient
air and must warm to **164.25 K — 52.6 K above its NBP** — before it is as light
as 20 °C air (Sandia computes 164.3 K independently, agreeing to 0.05 K). Until
then it slumps, spreads sideways, resists dilution and runs into trenches, pits
and doorways. Hydrogen's crossover is **22.09 K**, about 1.7 K above its boiling
point, so hydrogen practice is roof vents and high-point detection — and copying
it to methane leaves the worst case invisible. Methane needs detectors **high and
low, and in the trench**.

- **(a)** dodges the physics. Technology matters too (A11), but a detector the
  plume never reaches has no technology that saves it.
- **(b)** is true of *warm* methane (specific gravity 0.555) and false of the cold
  release that actually happens. This is the single most common methane
  misconception.
- **(d)** believes a setpoint can compensate for placement. It cannot: 20 % LEL at
  a sensor two metres away can coexist with 100 % LEL at the leak.

## A13 — (b)

The isentropic relation is an **upper bound**. Real compressions lose heat to the
wall and the seat, take finite time and mix, and ignition needs energy delivered
long enough to carry a real polymer through its ignition. NASA reports that
testing in a system consistent with **ASTM G74** found that for initial upstream
pressures below **275 psia** the actual temperature rise is too small for ignition
— even though the equation gives 275 psia a theoretical 404 °C, above the 300 °C
minimum AIT EIGA uses as a working convention for nonmetals. Both are correct, and
the gap is the lesson: the calculation tells you when you **cannot rule the
mechanism out**. Qualification comes from testing the actual configuration.

- **(a)** treats a bound as a prediction. Findings raised that way do not survive
  contact with test data, and they cost a reviewer the credibility needed for the
  findings that matter.
- **(c)** picks the wrong criterion entirely. The thing that ignites at a dead end
  is the exposed nonmetal, hundreds of degrees below any metal's melting point.
- **(d)** throws away a useful screen because it is idealised. The whole value of
  the relation is that it opens a question cheaply.

## A14 — (a)

Stainless is not "oxygen-safe"; it is a material with a threshold, and 250 psi is
an ordinary pressure in a cryogenic propulsion system. Davis's caveat travels with
the table — the numbers are "for comparison purposes only, not to be considered
standard values" — and the same metal scores differently in different tests: 304L
sustains combustion at 250 psi but resists *impact* ignition to 10,000 psi. LOX is
not merely cold GOX either: aluminium 2219's impact threshold is 1,500 psi in GOX
and **50 psi in LOX**. NASA's own worked hazard control is to change a valve body
from stainless to Monel.

- **(b)** ignores both the threshold and the LOX/GOX difference. Believing it is
  how "it's only stainless" gets written into a review.
- **(c)** moves in the wrong direction: aluminium 6061 sustains combustion at
  ambient and 4043 at 25 psi, while Monel, nickel, copper and brass resist to the
  10,000 psi top of the test range.
- **(d)** quotes a compatibility pressure without naming the test, which makes it
  meaningless — the deeper point being that compatibility is
  configuration-dependent (pressure, thickness and form, velocity and impingement
  angle, and what the material is paired with).

## A15 — (b)

ASME BPVC Section VIII de-rates the combination capacity by a factor of **0.90**
unless a higher factor is certified by test, and the specific failure mode is a
**pinhole**: the space between disc and valve pressurises, the disc no longer sees
full differential, and it bursts late. The advantage that buys those costs is
real — the disc isolates the valve seat, so it cannot be fouled or frozen shut.

- **(a)** mistakes a device *in series* for a second independent path. Two devices
  in one path are one path.
- **(c)** invents a prohibition. What is actually prohibited in spirit is a
  *block valve* that can remove the relief path (Module 05 §2.4).
- **(d)** inverts the arrangement. In series the disc sits at the valve inlet and
  bursts at the valve's set pressure; a disc set *below* the relief valve would
  open first and leave the system permanently open, defeating the reclosing
  device. Seat protection comes from isolating the seat from the process, not from
  opening first. On tanks the usual arrangement is the other one — valve and disc
  **in parallel**, the disc set higher for the catastrophic case.

---

# Section B — Short answer

Each question is 4 marks. A bare conclusion with no mechanism is worth about 1.

## B16 — the pump inlet

**The answer.** A saturated cryogen arrives at the pump inlet **already at its
boiling point** — on the saturation curve, with essentially zero NPSH margin,
because a vented tank sits at the bottom of that curve by construction. The inlet
is also the worst place in the system: flow accelerating into the impeller eye
drops the static pressure locally, and below the vapour pressure the liquid boils
right there. That is cavitation — bubbles forming in the low-pressure region and
collapsing violently millimetres later. Head collapses and recovers (the pressure
oscillation), the bearings and seals lose the liquid that cooled them, the metal
erodes, and any inferential flow meter loses the density assumption it works on.

**The two directions.** Either **raise the inlet pressure** — pressurise the tank
above saturation with a non-condensable, or fit a boost pump — or **lower the
fluid's state relative to its saturation line** by subcooling. They are not two
unrelated subsystems: they buy the same thing, distance between the state and the
saturation line. Insulating or shortening the suction line is a supporting measure
only; a fluid with zero margin still flashes at the impeller eye.

**Marking.** 1 — saturated fluid, zero margin, and why a vented tank guarantees
it. 1 — the local static-pressure drop at the eye and what cavitation does. 2 —
both directions, correctly described as buying the same quantity. Deduct if
insulation is offered as a fix rather than a support.

## B17 — the 0.507 K margin

**The answer.** Methane's triple point (its 1 atm freezing point for practical
purposes) is **90.6941 K**; oxygen's normal boiling point is **90.1875 K**. Methane
freezes **0.507 K above** the temperature at which LOX boils, so boiling LOX at
1 atm will freeze methane on contact with half a degree to spare.

**Hardware it constrains** (any two): a **LOX/methane heat exchanger**, which must
be de-rated and deliberately insulated to *retard* heat transfer, because methane
cooled against LOX condenses, keeps cooling and freezes, plugging it; a **common
bulkhead or common-walled downcomer**, which puts the two fluids in thermal
contact across that half kelvin by design; and **densified (subcooled) methane
storage**, which spends freezing margin to buy density — the useful window between
111.7 K and 90.7 K is only 21 K wide, and NASA's ISRU trade lists subcooled
methane at 101.7 K, about 11 K above freezing.

**Documented or inferred: inferred.** The property data are Confidence A and the
collision is elementary, but no primary source reporting an actual
methane-freezing incident was found. State it as a design constraint that follows
from the property data, not as something that has been observed. Note also that
pressurising the LOX raises its saturation temperature and is how the margin is
normally bought back — while subcooling the LOX, or dropping its pressure, widens
the gap the wrong way.

**Marking.** 1 — the two temperatures and the margin. 2 — two pieces of hardware
with the mechanism, not just the names. 1 — correctly labelling the failure mode
inferred, with the reason.

## B18 — configuration drift and generic procedures

**The answer.** Every analysis is valid about exactly one configuration. The new
valve creates a **new isolatable segment** whose relief question was never asked,
because the HAZOP that would have asked it was completed a month before the
segment existed. The relief calculation, the procedure's valve tags, the
cleanliness records and the training all refer to a system that no longer exists.
Nobody did anything careless — the configuration simply drifted away from the
analysis, which is the ordinary way this goes wrong. That is why a drawing that no
longer matches the built system is a **safety defect**: it silently invalidates
every analysis performed on it, and none of that announces itself. The extreme
version is the Texas case, where relief devices had been replaced with brass plugs
by unidentified people, undocumented, discovered only by forensic examination
after the vessel burst.

**The generic procedure.** A real procedure names actual valves with actual tag
numbers, actual set pressures traceable to actual relief calculations, and actual
people holding actual certifications. Change the hardware, the fluid or the stand
and it is wrong. **No procedure at least announces itself**; a generic sequence
that reads like a real one manufactures false confidence — it looks authoritative,
it invites someone to follow it, and it will be followed straight past the one
valve on this particular stand that it does not know exists.

**Facility-specific.** What re-review a given change triggers, and who may approve
it, is the institution's management-of-change and configuration-control rule.

**Marking.** 1 — the new isolatable volume with no relief. 1 — analyses attach to
a configuration, so the drawing mismatch invalidates the evidence. 1 — why generic
is worse than none. 1 — the per-system content of a real procedure, or the
management-of-change point.

## B19 — what an ODH analysis computes

**The answer.** It computes a **fatality-rate figure of merit**, in fatalities per
hour of occupancy: *f* = Σ *P*ᵢ *F*ᵢ over every credible release scenario, with
*P*ᵢ how often the scenario happens per hour and *F*ᵢ the probability it kills
someone — likelihood and consequence in one reviewable number.

**Two halves.** First a **concentration model**: an oxygen mass balance on the room
given the inert volume released and the ventilation provided, with cases for a fan
blowing in, a fan drawing out, and after the release. Second a **fatality factor**
*F*ᵢ set by concentration, exposure time and difficulty of escape — zero above
18 % O₂, 10⁻⁷ at 18 %, and **1 at 8.8 %**, where one minute of consciousness is
expected; logarithmic in oxygen *partial pressure* between them, so **altitude is
a real input**.

**Inputs a group can supply** (any two): room volume, penetrations and passive vent
area; ventilation capacity and whether it may be credited; the inventory of every
ODH source; credible release scenarios up to instantaneous venting of it all;
event rates; ease of egress; site elevation.

**Who.** A designated, qualified **ODH analysis authority**, checked by a second
independent one; Jefferson Lab additionally requires a department head's approval
and verification by a safety reviewer, with stated qualification criteria for the
role. **A student group cannot self-certify this.**

**What it refuses to credit: stratification.** JLab's words: *"Stratification
should not be used to reduce the risk."*

**Facility-specific.** The resulting **ODH class** (0–4, with 3 and 4 treated as
unacceptable) belongs to your specific space, and depends on volume, ventilation
and inventory. Monitor count and placement are outputs of the analysis, not rules
of thumb.

**Marking.** 1 — the fatality-rate figure of merit. 1 — both halves. 1 — who
performs and approves it, and that it cannot be self-certified. 1 — stratification
refused, or the class being facility-specific with what determines it.

## B20 — "oxygen clean"

**The answer.** It is a **specified, verified and documented level of freedom from
contaminants** that could act as fuel or as an ignition initiator, matched to the
system's pressure, concentration and geometry — and determining the worst-case
cleanliness level of each component is a required step of the compatibility
assessment.

- **Specified:** a level designation and the standard that defines it. ASTM
  G93/G93M-25 for cleanliness levels and verification methods; CGA G-4.1 (7th ed.,
  August 2018) as the cleaning requirement a purchase order invokes, applying to
  every surface contacting fluid above **23.5 % oxygen**. Note that the 2025 G93
  is a *Guide*, not a *Practice*: it deliberately stops prescribing levels and
  expects them to be selected from a documented risk analysis — so the level is
  configuration- and facility-specific, and material treating G93 as prescriptive
  is out of date.
- **Verified quantitatively:** **non-volatile residue** — the mass left after a
  solvent extract from a defined area is evaporated, reported per unit area
  (ASTM G120, G136, G144) — and **particle counts** by size band with a maximum
  permitted size. Visual and UV inspection catch gross contamination only; that is
  screening, not verification.
- **Documented:** who cleaned it, to what level and standard, the quantitative NVR
  and particle results, how it was packaged and preserved, and what triggers
  re-cleaning — a proof test being a standard trigger. "We degreased it carefully"
  is not a cleanliness level.

**Two contaminant families.** **Non-volatile residues** — oils, greases, thread
lubricants, crayon, paint — are dominated by **rapid pressurisation** (adiabatic
compression): a low-AIT fuel film sitting exactly where the compression peak
occurs, and EIGA notes oil and grease ignition "often causes a chain reaction that
finally results in metal burning or melting". **Particulates** feed **particle
impact**, and cleanliness removes the entrained particles — the only element of
that mechanism still controllable once the geometry is frozen.

**Marking.** 1 — specified with a level and standard. 1 — verified quantitatively,
with visual identified as screening. 1 — documented, with what travels with the
part. 1 — both contaminant families tied to their mechanisms.

---

# Section C — Scenario and hazard analysis

Each question is 6 marks. These are marked on the *structure* of the reasoning.

## C21 — the unexplained pressure rise

### What a strong answer contains

**The governing idea first.** For a saturated cryogen, tank pressure *is* a
temperature measurement and tank temperature *is* a pressure measurement. So the
first diagnostic move is to read PT-102 against TT-101 on the oxygen saturation
curve. If they agree, the fluid is genuinely being heated. If pressure is high and
temperature is not, either something non-condensable has been added, or the fluid
is not uniformly saturated, or an instrument is lying — and those three have very
different consequences.

**Candidate phenomena, and what each predicts elsewhere:**

1. **Loss of insulating vacuum.** The step change that dwarfs everything else:
   1–7 kW/m² insulated or 25–40 kW/m² bare against about 0.6 W/m² healthy. Predicts
   **frost or ice on the outer casing** (a clear sign the jacket has failed),
   heavy boiloff, a genuinely falling level, PT and TT tracking together up the
   saturation curve, and the relief working hard. This is also the case the burst
   disc — not the relief valve — is sized for.
2. **Ordinary self-pressurisation.** Heat leak boils liquid, vapour raises
   pressure, which raises the saturation temperature, which warms the liquid: a
   ratchet, not a steady state. Predicts a rise consistent with previous nights.
   The question is whether *this* night is anomalous, which requires the trend to
   have been recorded.
3. **Stratification.** A warm surface layer raises ullage pressure faster than the
   bulk temperature implies, so a single TT does not represent the tank. Predicts
   PT and TT off the saturation curve in the direction of "hotter than the
   thermometer says", and a pressure that behaves oddly when the contents are
   disturbed.
4. **Pressurant leak-by.** A regulator creeping, or vapour migrating past a check
   valve on the shared pressurant header. Remember that "the supply is isolated"
   usually means a valve is closed; **a check valve is not an isolation device**,
   cannot be tested in place, and fails in whichever direction the pressure
   points. Predicts pressure rising **without** a matching temperature rise and
   **without** extra boiloff — and, on a shared header, raises the far worse
   question of what else that header connects to.
5. **A new heat-leak path that is not the jacket.** Damaged or wetted insulation,
   a bayonet joint icing (the static vapour column defeated), conduction through
   supports, piping and instrument leads, an uninsulated section added since the
   last cold cycle. Predicts localised frost and a boiloff rate that is high but
   not catastrophic.
6. **A partially obstructed vent or relief outlet.** Cold gas freezes atmospheric
   moisture at the outlet, and blocked vent lines are a principal cause of
   overpressure. Predicts rising back pressure and reliefs that lift and stay
   lifted, or lift late. (The opposite failure — a relief frozen *open* — gives
   continuous release and loss of inventory instead, and is an ODH source.)
7. **The instrument itself.** A moisture or air plug freezing in PT-102's standoff
   sense line does not read zero and does not read noise — **it reads the last
   pressure it saw, steadily and plausibly**, while real tank pressure walks away
   from it. This is the candidate that makes the reading untrustworthy, and any
   interlock on that transmitter now depends on a blockage. A cold vapour column
   of varying density in the standoff can also drift and oscillate.
8. **The level measurement.** Level is harder than in water: the liquid is
   boiling, the head per metre is small, DP methods need a density that varies
   along the saturation line, and there is no sight glass. "The level dropped more
   than expected" may be lost inventory or may be a measurement artefact, and it
   is worth saying which you would trust.

**Discriminating.** Independent instruments, not more of the same one: PT against
TT against the saturation curve; a walk-around for frost on the casing, at
supports, at bayonets and at the vent outlet; the boiloff or NER trend against
previous nights; and the state of the pressurant header. **Facility-specific:**
what the tank's normal boiloff is, what set pressure the relief carries and how
often lifting is normal for it — those are properties of that vessel and its
relief calculation, and they only help if someone has been trending them.

**Boundary.** What to *do* about it — venting, warming, safing, re-pumping the
annulus — is written-procedure work for that stand under trained supervision.
This question asks only what to investigate.

### Rubric (6 marks)

| Mark | For |
|---|---|
| 1 | Loss of insulating vacuum, with its ice-on-the-casing signature and its order-of-magnitude effect |
| 1 | Self-pressurisation and/or stratification, described as a ratchet rather than a fault |
| 1 | A non-condensable route in — pressurant leak-by, with the check-valve point |
| 1 | Naming the instrument failure that reads plausibly, and identifying it as the one that undermines the reading |
| 1 | A discrimination method: PT against TT on the saturation curve, independent instruments, boiloff trend |
| 1 | Saying which quantities are facility-specific, or noting that the response is a procedure question and stopping there |

## C22 — which deserve an oxygen compatibility review

### What a strong answer contains

The framing first: NASA requires an oxygen compatibility assessment **on each
component**, and its steps are worst-case conditions, material flammability, an
ignition-mechanism-by-mechanism walk, the **kindling chain**, the **reaction
effect**, history of use and the report. So "does this deserve one?" is really
"has the configuration changed, or has it never been assessed?" And if a
material's flammability is unknown, it is treated as flammable.

1. **304L ball valve, 400 psi GOX — yes.** Stainless sustains combustion in oxygen
   from about 250 psi, so at 400 psi the **body itself** is flammable, and the
   kindling chain runs seat → stem → body. A ball valve also supplies several
   mechanisms at once: it opens in a quarter turn (rapid pressurisation), rotates
   a seal against a seat every cycle (particles), can chatter if mis-sized
   (mechanical impact, galling and friction), and dead-ends are usually nearby
   (resonance).
2. **Monel needle valve, same line — yes, still.** Monel is the burn-resistant
   choice and resists to the top of the promoted-ignition test range, which lowers
   the **reaction effect** — but the assessment also covers the seat, seals,
   lubricant, cleanliness level, velocity and geometry, and unknown flammability
   defaults to flammable. A good material lowers the consequence; it does not
   remove the requirement.
3. **Aluminium bracket outside the wetted boundary — largely not.** Composites and
   ordinary structural metals outside the wetted boundary are normal practice. The
   question that remains is whether **the drawing defines that boundary
   correctly**, and whether a credible leak, drip of oxygen-enriched condensate or
   relief discharge could put the bracket inside an enriched atmosphere. Its real
   issues are contraction and thermal shorting, not oxygen.
4. **Six-year-old PTFE-seated check valve, 300 psi GOX — yes, and specifically in
   its worn condition.** Cycling on a soft seat is the setup for **flow friction**,
   the mechanism NASA admits no laboratory method reproduces and which has
   nevertheless "caused a significant number of real-life fires". It is a
   *degraded-condition* mechanism, so an as-new review misses it entirely. Ageing
   of soft goods, six years of generated particulate and re-verification of
   cleanliness all belong in the same assessment.
5. **GN₂ line re-tagged GOX — the most urgent of the five.** A service change
   invalidates material selection, cleanliness level and verification, and velocity
   limits alike, and nothing physically changed, which is exactly why it will be
   missed. The commonest failure in an oxygen review is not a wrong answer but a
   question never asked, because a configuration was classified as not hazardous
   and therefore given no controls — Apollo 1's error in miniature.

### Rubric (6 marks)

1 mark for each item correctly sorted **with a mechanism-level reason** (5 marks);
a verdict with no mechanism scores half. The sixth mark is for identifying item 5
as the most urgent, or for stating the general principle that the assessment is
per component, per configuration, at worst case — and that item 3's honest answer
is "not for oxygen, but define the boundary".

## C23 — the LN₂ leak indoors

### What a strong answer contains

**The hazard that matters is oxygen deficiency, and it is invisible because the
body has no oxygen sensor.** The urge to breathe tracks rising carbon dioxide,
which a diluent does not raise — CO₂ still washes out normally on every exhale —
so nothing tells you to leave. Nitrogen is odourless, colourless and tasteless,
which makes it **more** dangerous than a toxic gas like chlorine or ammonia, both
of which announce themselves. EIGA: an oxygen-deficient atmosphere *"can bring
about unconsciousness without warning. In as little as one or two breaths, an
individual's life can be endangered."* The bands matter as much as the fatal
number: OSHA's line is **below 19.5 %**, by 16 % thinking and coordination are
already impaired, below 10 % comes loss of consciousness and convulsions, and at
4–6 % the CSB reports coma in under 40 seconds. **Long before the fatal
concentration the person has lost the judgement to recognise the problem and
leave** — self-rescue is not a control.

**Why the floor is the wrong place to be.** Vapour leaving the spill is at 77 K
and roughly **3.8 times** the density of ambient air; nitrogen's buoyancy crossover
is 283.6 K, so it stays a heavy gas until nearly room temperature. It pools on the
floor and drains into pits, trenches, sumps and stairwells, which are vertical
drains. A monitor or a person at head height in the doorway can read normal while
the lower half of the room is lethal. The inventory is larger than it looks: 1 m³
of liquid becomes about **696 m³** of gas at 70 °F, and even a 50-litre spill is
about 35 m³ — more than a small store room holds.

**The cloud is not the hazard boundary.** The white cloud is **condensed
atmospheric water** — fog in air the release has chilled. Nitrogen is colourless.
At the fog's edge the chilled air has mixed with enough warm air to rise back
above its dew point, so the fog evaporates while the displacing gas is still
there: the hazardous envelope is generally **larger** than the visible cloud.
Vision is not an instrument; oxygen monitoring is.

**The second hazard, on the surfaces the leak cools.** Anything chilled to LN₂
temperature sits **12.83 K below the boiling point of oxygen** and condenses
oxygen out of the air continuously — first condensate ≈53.5 mol % O₂, enriching
toward 80 % with continued exposure. Pale blue liquid dripping from an
"innocuous" LN₂ line onto asphalt, an oily grating, cable insulation or a rag is
an oxygen-enrichment hazard built out of the safe cryogen; oxygen-enriched above
23.5 % is a hazardous atmosphere in its own right, and LOX-soaked porous material
stays hazardous long after the frost has gone.

**The rescuer.** Unprotected rescuer entry is *"one of the most common causes of
multiple fatalities in cases involving asphyxiation"*, and about one in ten of the
fatalities in the CSB's decade-long review were would-be rescuers. Recognising an
oxygen-deficient volume **from outside it** is the skill this course teaches;
entry is a trained, permitted activity under 29 CFR 1910.146.

**Facility-specific, and who owns it.** Whether that basement is a
**permit-required confined space** turns on whether it *has the potential to
contain* a hazardous atmosphere — a determination for that facility's
confined-space programme, not for the occupants and not for this course. The
room's **ODH class**, the ventilation that may be credited, and the number and
placement of monitors are outputs of an ODH analysis performed by a qualified
authority and independently approved.

### Rubric (6 marks)

| Mark | For |
|---|---|
| 1 | Oxygen deficiency, with the no-sensor / CO₂-driven-breathing mechanism |
| 1 | Cold vapour pools low and drains into low points; the reading-height trap |
| 1 | The cloud is condensed water and the envelope is not the fog |
| 1 | Condensed oxygen enrichment on the cooled surfaces, with the 12.83 K reason |
| 1 | The rescuer problem, and that entry is a permitted activity |
| 1 | Naming the facility-specific determinations (confined space, ODH class, monitors) and who owns them |

## C24 — frost on a methane line

### What a strong answer contains

**What it tells you.** The bracket is a **thermal short** and therefore the coldest
reachable external surface nearby, and something at that point is below the
ambient dew point. It may also mean cold gas is escaping and tracking along the
pipe and down supports and hangers to it.

**What it does not tell you.** That the leak is at the bracket. Frost marks where
a surface is *cold and reachable by humid air*, which is a different question from
where the leak is:

- Escaping cold gas runs along pipework, down supports and hangers, and pools at
  the lowest accessible point; frost forms **along that path, not at its start**.
  Inside insulation the path is longer still — gas migrates through perlite,
  mineral wool or a vacuum annulus and emerges at whatever seam or penetration it
  finds, metres from the defect.
- Frost forms preferentially at thermal shorts — supports, brackets, valve stems,
  instrument penetrations — **whether or not anything is leaking there**. A frosted
  bracket on a well-built system may be entirely normal.
- Frost insulates, so the most heavily frosted spot may no longer be the coldest.
- The flange with no frost is not thereby exonerated: it may be better insulated,
  less reachable by humid air, or upstream of where the gas emerges.

This is engineering judgement rather than a quotable standard, but EIGA supports
the shape of it: *"cold spots can be very localised and the installed temperature
elements might not detect all leaks, so they should not be seen as a replacement
of regular visual checks"*, and *"it is critical to find all leaks before
insulation is installed"*.

**What actually locates a leak.** **Helium mass spectrometry** is the reference
method and the one that produces a number — sniffer mode or vacuum/spray mode.
**Pressure decay** gives total leakage of the boundary with no location at all; it
is an acceptance gate. **Bubble testing** at ambient is crude and least sensitive
but localises with no instrument, and needs the fluid left on for several minutes.
All of them are warm-system methods: find leaks warm, before the insulation goes
on. Do not chase the frost, and do not certify a system on the absence of it.

**What the silent detectors prove.** Only that no detector saw at least its
threshold concentration **at its own location**. Cold methane vapour is about 1.5×
ambient air density and must warm **52.6 K, to 164.25 K**, before it lifts, so it
runs along the floor and into trenches while roof-mounted detectors see nothing;
20 % LEL at a sensor two metres away can coexist with 100 % LEL at the leak. Add
the sensor's own blind spots: a catalytic bead under-reads in a depleted or
fuel-rich atmosphere and fails low when poisoned. For scale, methane's LFL is
5.0 %, and OSHA already treats a flammable gas above 10 % of its LFL — **0.5 vol %
methane** — as a hazardous atmosphere.

**The hydrogen contrast, and the fuel point.** Hydrogen's buoyancy crossover is
22.09 K, about 1.7 K above its boiling point, so a hydrogen release becomes
buoyant almost immediately and hydrogen practice is roof vents and high-point
detection. Methane needs both regimes covered. And unlike the same frost on an LN₂
line, this line carries a **fuel**: the leak makes a flammable cloud, so
ignition-source control, bonding and grounding and hazardous-area classification
are in play, and the trench is exactly the classified volume people forget.

### Rubric (6 marks)

| Mark | For |
|---|---|
| 1 | Thermal short / coldest reachable surface — what the frost does indicate |
| 1 | Frost tracks the escape path, not the source, with at least one mechanism |
| 1 | Frost is not evidence either way — normal frost at brackets, frost insulates, no frost at the flange proves nothing |
| 1 | Leak-location methods with what each actually gives, and the warm/before-insulation point |
| 1 | What detector silence does and does not prove, including sensor blind spots |
| 1 | Cold methane behaviour with 164.25 K / 52.6 K, and the hydrogen contrast |

## C25 — independent hazards in a small methalox system

### What a strong answer contains

The organising insight is the one Module 07 ends on: **adding a fuel to an
oxidiser facility creates hazards neither system has**, and those hazards live in
the spaces *between* the systems — exactly where a system-by-system review does not
look. At least five of the following, each with its mechanism:

1. **The common helium header with one check valve per leg.** Reverse flow past
   one check valve puts methane vapour into a line that later feeds the LOX tank.
   A check valve leaks, hangs open on debris, cannot be tested in place, and fails
   in whichever direction the pressure points. **A check valve is not a barrier
   between a fuel and an oxidiser.** *Fix: physical* — separate pressurant paths,
   with positive isolation where systems must cross-connect.
2. **The shared vent stack and header.** A mixing chamber inside a pipe,
   undiluted and uninspectable, where methane's window is not 5–15 % but
   **5.15–60.5 %**. Height achieves nothing because the mixing happened upstream of
   the tip. Even without simultaneous flow, gas from one system waits in the header
   for the other, and a cold oxygen-carrying line that has also carried fuel can
   hold condensed hydrocarbon as a detonable deposit. *Fix: physical* — separate
   stacks. The subtler version that survives separation — plumes co-mingling
   downstream because discharge points are close, exit velocities low, or the
   building wake brings them together — is an *analysis and siting* question.
3. **The shared GN₂ purge manifold behind check valves.** The same objection, plus
   two more: a purge line is a direct injection path for compressor oil,
   hydrocarbon residue and particulate into the oxygen system, so the oxidiser
   purge line **is part of the oxygen system** and must be cleaned to CGA G-4.1
   with particulate control, because particle impact is an oxygen ignition
   mechanism. *Fix: physical* — separate sources.
4. **The cable trench.** Cold methane must warm 52.6 K to 164.25 K before it
   lifts, so it slumps into the trench, which channels and concentrates the cloud,
   resists ventilation, and holds exactly the cabling and junction boxes that area
   classification exists to control. It is also a low point a LOX release can reach
   — **a single volume that can receive both a fuel and an oxidiser release**.
   *Fix: layout and grading (physical), plus a hazardous-area classification study
   (analysis)* under NFPA 70 Articles 500–506 with NFPA 497 as the recognised
   method; methane is Group D, and the trench must be treated as a classified
   volume.
5. **One oxygen monitor at head height is three detection populations short.** A
   methalox facility needs combustible gas **high and low and in the trench**,
   oxygen deficiency at breathing height (below 19.5 %), and oxygen **enrichment**
   near the LOX release sources (above 23.5 %) — different sensors, setpoints,
   placements and responses, and conflating them is itself a design finding. The
   single monitor can read normal while a cold dense lethal layer sits on the
   floor. *Fix: devices, with placement an output of the ODH and dispersion
   analysis.*
6. **The LOX drain onto asphalt.** LOX plus any hydrocarbon in intimate contact is
   an impact-sensitive mixture: NASA's dry-slab test gave a violent reaction that
   appeared to propagate over the whole slab and threw fragments 48 m, while
   concrete never reacted. LOX-soaked porous material stays hazardous long after
   the frost has gone. *Fix: physical* — a graded concrete disposal area away from
   the fuel side, with housekeeping treated as an engineering control rather than
   tidiness.
7. **The co-located miscible pair itself.** NASA's NESC work found LO₂/LNG
   miscibility admits **condensed-phase detonation** with higher overpressures than
   LO₂/LH₂ or LO₂/RP-1, and specifically named common bulkheads, common-walled
   downcomers and transfer tubes. NASA called its own assessment guidance *interim*
   as recently as 2023, so assuming the LOX/RP-1 or LOX/LH₂ precedent transfers is
   assuming something NASA does not. *Fix: analysis.*
8. **Siting the inventory in an occupied bay.** Quantity drives occupancy
   classification and maximum allowable quantity per control area, separation
   distances and permit requirements — decided by the AHJ against the code edition
   they have adopted, not calculated from a textbook. *Fix: analysis, and the
   inherent control of reducing inventory, which shrinks the standoff, the ODH
   class, the occupancy problem and the permit question at once.*
9. **No remote-operation boundary is mentioned.** Distance is the only control that
   works against fragments, blast and a sudden oxygen-deficient atmosphere at
   once, and it works whether or not anybody did the right thing. *Fix: physical
   barricade, positioned by an explosive-siting or consequence analysis.*
10. **Relief philosophy is entirely absent from the description.** Nothing says
    every isolatable volume has its own relief path that cannot itself be
    isolated. *Fix: design and analysis.*

### Rubric (6 marks)

1 mark for each of five hazards named **with its mechanism** (5 marks). Three
shared paths — header, purge manifold, trench — count separately only if the
answer names the distinct route by which one fluid reaches the other; "everything
is shared" is one hazard, not three. The sixth mark is for correctly classifying
the fixes as physical separation, device, or analysis-by-a-qualified-person, or
for making the "hazards live between the systems" point explicitly.

---

# Section D — Schematic and component

## D26 — trapped volumes in Figure E.1 (4 marks)

With HV-1, HV-2, HV-3 and MOV-1 closed, and CV-1 and CV-2 holding:

1. **HV-1 → CV-1**, including filter **F-1**. A check valve is a closed valve no
   operator can open. F-1 is also a trap in its own sense: water, CO₂ and
   hydrocarbons are *solid particles* at 90 K, so a cryogenic filter catches them
   and then plugs, isolating liquid downstream of itself with nothing on the
   drawing to show it.
2. **CV-1 → HV-2**, which also contains the purge tie-in up to **CV-2**. Bounded by
   a check valve at one end and a closed manual valve at the other, and fed by
   nothing.
3. **HV-2 → MOV-1**, the long segment containing the relief riser, the FT-1 tap and
   the branch to HV-3. This segment *does* have a relief — **but only through
   BV-1**, which is the point of the next item.
4. **The branch below HV-3, ending at the parted, capped QD-1.** A filled length
   with no rating and no relief; a hose or line disconnected at one end and capped
   is a filled pressure vessel nobody specified.
5. **The purge leg between CV-2 and its panel isolation.** Liquid or condensate can
   migrate into a purge line, and CV-2 is again a closed valve nobody can open.
6. **Every ball-valve body cavity**, unless these are vented-ball types — which the
   drawing does not say. A closed floating ball valve seals liquid between ball,
   seats and body, connected to neither line.
7. **The PT-1 sense leg**, a dead leg warming from its closed end in.
8. **The segment under PSV-1 if BV-1 is ever closed** — the relief exists, is
   correctly sized, and is disconnected from what it protects. This is the
   Williams Olefins configuration, and a car seal on BV-1 would be an
   administrative control, not a second layer.

**The trap that exists with every drawn valve open:** the **vacuum annulus** — of
the VJ run and of TK-1. It is a sealed volume beside a cryogen; an inner-line leak
fills it with boiling liquid and bursts a jacket built only to hold one atmosphere
*out*. SLAC extends the relief rule to any vacuum space in contact with a cryogen,
and the drawing shows no annulus relief or pump-out port.

**What the drawing does not let you determine** (any one): whether the ball valves
are vented-ball type and which way each vent hole faces; whether PSV-1 is sized for
the credible heat input, and whether the accident cases — fire and loss of
insulating vacuum — were considered as well as boiloff; whether the annulus has a
relief; where the vent stack discharges relative to people, intakes and any fuel
stack; whether the fluid is single-phase at FT-1; and whether PT-1's sense line can
freeze.

**Marking.** 2 — five volumes with their boundaries (roughly ½ each, rounded in the
candidate's favour). 1 — the annulus, with the reason it counts. 1 — a legitimate
"not determinable from this drawing" item.

## D27 — findings on Figure E.2 (4 marks)

**In order of seriousness:**

1. **PSV-101 is isolatable behind BV-101.** The tank has no *uninterruptible*
   relief path: a correctly sized relief that can be disconnected from the vessel
   it protects is not a relief path, it is a relief path plus a way to remove one.
   A car seal is an administrative control that depends on people. **Williams
   Olefins, Geismar, 13 June 2013:** a reboiler isolated from its relief device,
   shell rupture, BLEVE and fire, two workers killed and 167 people reporting
   injuries — and the CSB's own conclusion was that a relief valve on the vessel
   would have been better than a locked-open block valve, "less reliable due to
   the possibility of human implementation errors". Ask for the relief mounted
   with no isolation between it and the protected volume, or a second independent
   relief that stays connected. (A block valve upstream of a relief is permitted
   only under ASME BPVC VIII Div. 1 Appendix M controls.)
2. **Fuel and oxidiser reliefs discharge into one header and one stack.** This is
   the flat prohibition: it makes a flammable mixture inside a pipe, undiluted and
   uninspectable, and in oxygen methane's window is 5.15–60.5 % rather than
   5–15 %. Stack height does nothing, because the mixing happened upstream of the
   tip. Even without simultaneous flow, one system's gas sits in the header waiting
   for the other, and a cold oxygen-carrying line that has also carried fuel can
   hold condensed hydrocarbon.
3. **PSE-202 is in series upstream of PSV-201.** Capacity is de-rated by **0.90**
   unless a higher factor is certified by test, and a pinhole in the disc
   pressurises the space between so the disc no longer sees full differential and
   bursts late. The advantage — the disc isolates the valve seat so it cannot be
   fouled or frozen shut — is real and should be acknowledged. Contrast the LOX
   side, where PSE-102 is in **parallel**: that is the usual tank arrangement, and
   the two devices there are not redundancy but **two sizing cases**.
4. **No sizing basis is shown.** The reclosing valve covers steady boiloff so the
   system keeps running; the disc covers the accident case — fire, and in
   cryogenics **loss of insulating vacuum** (1–7 kW/m² insulated, 25–40 kW/m² bare,
   against about 0.6 W/m² healthy), a step beyond any reclosing valve of sensible
   size. Numbers with no basis are placeholders. **Facility-specific:** every set
   pressure and device size belongs to that vessel's MAWP and its relief
   calculation, traceable to ASME BPVC VIII Div. 1 for accumulation and to the
   right part of the CGA S-1 series for the container type. A set pressure copied
   from another group's stand is a finding, not an answer.
5. **The discharge end is undrawn and unasked-about.** Where does the stack
   terminate relative to people, walkways and building air intakes; can it drop
   room oxygen below 19.5 % or raise it above 23.5 %; is the stack **restrained**,
   since a relieving vent is a nozzle with a reaction force; and will the outlet
   **ice**, because cold gas freezes atmospheric moisture exactly at the component
   whose job is never to be blocked. Stack height, orientation and separation are
   site-specific and confirmed by the AHJ.
6. **Not shown, must be asked for:** a relief schedule tying every isolatable
   segment to its device, set pressure, sizing case and discharge; whether the
   tanks are vacuum-jacketed and whether the annuli have their own reliefs; and
   whether anything in the discharge path — a baffle, insulation, ice — could pass
   normal boiloff invisibly and choke at full flow.

**Marking.** 1 — the isolatable relief, ideally with the incident. 1 — the shared
header and stack, with the mixing-upstream-of-the-tip point. 1 — the series disc:
derate *and* pinhole. 1 — any "not shown" finding: sizing basis, discharge
location and icing, or annulus relief.

## D28 — the valve in Figure E.3 (4 marks)

**Problem 1 — the valve is installed with its stem horizontal.** The bonnet
extension works by holding a **static, stratified column of cryogen vapour**
between the cold body and the polymeric packing — long enough, in the words of
MSS SP-134, "to provide an insulating gas column that prevents the packing area
and operating mechanism from freezing", with a small internal clearance to
minimise convection and a thin wall to cut conduction. That column works **only
while it can stratify**, so the valve goes stem-vertical. Mounted far off vertical,
liquid enters the extension and reaches the packing: at 77–90 K polymers are not
seals but brittle rings that shrink away from the stem, the gland ices, and the
valve can freeze in position. **The frost front part-way along the extension is
the evidence** — a bonnet doing its job keeps the frost line down near the body and
the packing warm.

**Problem 2 — the ball's relief hole faces the wrong way.** The hole is drilled
toward the downstream (upper) side, while the valve must hold pressure from below.
The hole must face **upstream**, the side the valve holds against, so that cavity
pressure is capped at line pressure. Vented downstream, cavity pressure lifts the
ball off the upstream seat and opens a permanent leak path — the valve leaks by
design.

**What makes it directional.** The drilled ball. A vented ball valve is therefore
**unidirectional**, and its arrow must match the direction in which it must *hold*
pressure, not merely the direction of normal flow. Why the hole exists at all:
without it, a closed ball valve seals liquid in the body cavity connected to
neither line, and confined cryogen warming to ambient generates pressure "in
excess of 10,000 psig" — the body fails as a fragmentation event.

**Worth a mention on a LOX line:** the same valve supplies several oxygen ignition
mechanisms at once — quarter-turn opening (rapid pressurisation), a seal rotating
against a seat every cycle (particle impact), chatter if mis-sized (mechanical
impact, galling and friction), and a body cavity that is a dead end.

**Marking.** 1 — stem orientation with the stratified-column mechanism. 1 — vent
hole direction with the unseating consequence. 1 — directionality and the arrow
rule. 1 — reading the frost front, or the body-cavity trapped-volume point.

## D29 — tags (4 marks, 1 each)

**(a)** The **200-series is the fuel system** on this course's convention —
100-series oxidiser, 200-series fuel, 300-series pressurant and inert, 400-series
analysers and detection, as used in Module 08. Loops are numbered **by system**,
and the digits identify **the loop, not the device**: PT-201, TT-201 and LT-201
belong to the same loop.

**(b)** `PSE` is conventionally the **rupture disc** — under ISA-5.1 the first
letter is the measured variable and succeeding letters say what the device does,
with `E` for element; `PSV` is the reclosing **pressure safety valve**. (Note that
`S` is ambiguous: *safety* in PSV, *switch* in LSH.) Their roles differ by sizing
case: **PSV recloses**, which the boiloff case wants because the system keeps
running; **PSE does not reclose**, offers more capacity per size and no seat to
leak, and covers the accident case — fire, and loss of insulating vacuum — after
which the system stays open.

**(c)** A bubble with a **horizontal bar** is **control-room mounted**; a plain
bubble on a line is **field-mounted**. That is why PIC, HS and AI sit in the
blockhouse and PT sits on the tank.

**(d)** **CV-201, the check valve.** It stops reverse flow but is not an isolation
valve and is emphatically not a barrier between a fuel and an oxidiser:
contamination makes it stick, it hangs open on debris, it cannot be tested in
place, it fails in whichever direction the pressure points, and its leakage is a
named cause of overpressure. It is also a *closed valve no operator can open*, so
the volume downstream of it is a trapped-volume candidate. **QD-2** is accepted as
a second answer if the candidate argues it properly — a parted quick disconnect
leaves a capped, filled length with no relief, and a human-in-the-loop connection
is four to five orders of magnitude more likely to release cryogen than a pipe is
to rupture.

## D30 — four ways to be misled (4 marks, 1 each)

**(a) Pressure transmitter behind a standoff sense line.** A moisture or air plug
freezes in the line. The transducer does not read zero and does not read noise —
**it reads the last pressure it saw, steadily and plausibly**, while real tank
pressure walks away from it. This one fails quietly. (Related and also plausible:
the standoff fills with cryogen, heat leak boils it, and a column of cold vapour
of varying density becomes the measurement path — not a static head you can
correct for, and liable to oscillate as liquid enters the warm section and
flashes.) **Interlock consequence:** a trip that depends on that transmitter now
depends on a blockage; it will not trip, and the panel shows a healthy number.
Traced or purged sense lines are the recognised control.

**(b) Turbine flow meter in a saturated liquid feed leg.** The fluid sits close to
its boiling point and **every meter works by creating a pressure drop**, so the
measurement creates the condition that invalidates it. Two-phase flow breaks the
density assumption every inferential meter depends on, in an unpredictable
direction; the rotor over-speeds while cavitation erodes it. A flow reading is
valid only if the fluid is **single-phase at the meter**. **Interlock
consequence:** a flow-based cut-off, totaliser or mixture-ratio control is acting
on a fiction — and it will be a plausible-looking fiction, not an obvious fault.

**(c) Catalytic-bead combustible-gas detector.** It needs oxygen to oxidise gas on
the bead, so it under-reads in an inert-purged, depleted or fuel-rich atmosphere —
exactly the atmosphere a cryogenic release creates — and silicones, sulphur and
halogens poison it silently. **Both failure modes read low, that is, safe**, and on
the panel they look exactly like a clean atmosphere. A bump test proves the loop is
alive; only calibration proves the number, and a sensor reading a non-calibration
gas through a cross-sensitivity factor needs conservative setpoints. **Interlock
consequence:** a permissive that requires "no gas detected" is satisfied by a dead
sensor.

**(d) Oxygen monitor at head height with a floor trench.** Cold vapour is several
times ambient air density at its boiling point and stays negatively buoyant until
nearly room temperature, so it pools at the floor and drains into the trench. The
monitor can read a healthy 20.9 % while the lower half of the room is
oxygen-deficient — and an ODH analysis explicitly refuses to credit stratification
as a risk reduction. **Interlock consequence:** an alarm or access permissive keyed
to that one monitor allows entry into a hazardous atmosphere. **Facility-specific:**
how many monitors, and where, is an ODH-analysis output, not a rule of thumb.

---

## Where the honest answer was "it depends on the facility"

Worth reading as a list, because it is half the skill:

- **Relief set pressures, device sizes and sizing cases** — properties of a
  specific vessel's MAWP and its relief calculation (A15, C21, D27).
- **What counts as normal boiloff, and how often a relief lifting is normal** —
  properties of that tank, knowable only if someone trends them (C21).
- **ODH class, ventilation credit, monitor count and placement** — outputs of an
  ODH analysis by a qualified authority, independently approved (B19, C23, C25,
  D30).
- **Whether a pit, trench or basement is a permit-required confined space** — a
  determination of that facility's confined-space programme, following the
  *potential* for a hazardous atmosphere rather than today's reading (C23, C25).
- **Cleanliness level** — selected from a documented risk analysis against your
  pressures, velocities and geometry, since ASTM G93 is now a Guide (B20, C22).
- **Stack heights, orientations, separations, and the exclusion zone** — site- and
  AHJ-specific, resting on terrain, adjacent structures, prevailing wind and an
  explosive-siting or consequence analysis (C25, D27).
- **Occupancy classification and maximum allowable quantity** — decided by the AHJ
  against the code edition they have adopted (C25).
- **What re-review a configuration change triggers, and who may approve it** — the
  institution's management-of-change rule (B18).

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
A score on this paper measures whether you can <em>recognise</em>, <em>diagnose</em>
and <em>judge what deserves review</em>. That is what the course set out to teach
and exactly as far as it goes. It is not training, it is not certification, and it
is not permission. The next step is not another document — it is a real drawing, a
real facility, and a person with experience standing next to you.
</div>
