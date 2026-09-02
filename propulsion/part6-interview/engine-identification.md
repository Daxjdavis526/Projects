# Engine identification

Part VI · Prerequisites: modules 05–18 (liquids), 19–27 (solids), 28–31 (cold
gas) · Estimated time: 10–18 h

**Answers and reasoning chains are in
[`engine-identification-key.md`](engine-identification-key.md).** Do not open it
until you have written down six answers for the exercise in front of you. The
skill this drill builds is *inference under partial information*, and you cannot
build it by recognising an answer you have already read.

---

## What this drill is

Thirty engines, motors and thrusters, described the way an interviewer describes
one across a table: era, a handful of numbers, three or four architectural
details, one quirk, and the reason the programme existed. Nothing is named — not
the engine, not the vehicle, not the country in most cases.

This is the Level-3 exercise from the course mastery scale, applied to hardware.
Level 1 recognises an engine by its name. Level 2 recalls its numbers. **Level 3
reconstructs the engine from the physics of the clues** — and, more importantly,
says *which clue* did the work and *what it ruled out*. An interviewer who asks
"what engine is this?" is rarely testing whether you memorised a table. They are
testing whether "the turbine exhaust is dumped into the nozzle extension as a
film curtain" means anything to you.

## The six questions

Every exercise asks the same six, in this order. Answer all six even when you
are certain of the sixth, because the first five are the reasoning and the sixth
is only the result.

1. **Likely propellants.** Oxidiser and fuel, and why the clues force them.
2. **Likely engine cycle.** Name the specific variant, not the family — "closed
   expander", "expander bleed" and "tap-off" are three different cycles with
   different thrust ceilings, and the secondary literature calls all three
   "expander cycle" `[_verify-liquid §19 of contested figures]`.
3. **Likely cooling method.** Regenerative (and with what coolant, in what wall
   construction), film, ablative, radiative, dump, or some split between them.
4. **Likely injector architecture.** Element type — impinging doublet/triplet,
   coaxial shear, coaxial swirl, pintle — and whether it is baffled.
5. **Likely mission or vehicle class.** Booster, sustainer, upper stage, apogee
   kick, lander, RCS, abort, crewed manoeuvring. Not the vehicle's name; the
   *class*, argued from thrust, Isp, expansion ratio and restart capability.
6. **The engine itself.**

For each answer, write one sentence naming **the clue that decided it** and one
naming **the alternative it ruled out**. An answer with no ruled-out alternative
is a guess that happened to be right.

## Rules of the drill

- **Twenty minutes per exercise, unaided**, then check. If you need the engine
  database to answer, you are doing a lookup exercise, not this one.
- **Two of the thirty are decoys.** In each, a second real engine shares almost
  every clue in the description, and exactly one detail separates them. You are
  not told which two. If you find yourself saying "it is either X or Y", write
  down *both*, then write the single clue you would need to settle it — that
  answer scores higher than a confident wrong pick and is exactly what a good
  interview answer sounds like.
- **Quote numbers with their uncertainty.** Every figure below is taken from
  [`reference/_verify-liquid.md`](../reference/_verify-liquid.md) and
  [`reference/_verify-solid-coldgas.md`](../reference/_verify-solid-coldgas.md),
  consolidated in [`reference/engine-database.md`](../reference/engine-database.md),
  with the worksheets' caveats carried across. Where a worksheet flags a figure
  as contested, unpublished or a company claim, this file says so **in the
  exercise**, because the caveat is often itself a clue. "Chamber pressure is not
  published" narrows the field as effectively as a number does.
- **Company claims are labelled.** Figures for engines built by SpaceX, Blue
  Origin, Rocket Lab, ArianeGroup's Prometheus programme and Northrop Grumman's
  BOLE are unaudited manufacturer statements. They are marked **[claim]** wherever
  they appear. Treating them as measured data is the fastest way to lose a
  technical interviewer.
- **"Not published" is a fact, not a gap.** Several exercises deliberately omit
  a parameter because no credible source publishes it. Do not assume the omission
  is a hint that the value is unremarkable.

## Conventions

SI throughout, US customary in parentheses on first appearance.
$g_0 = 9.80665\ \mathrm{m/s^2}$. $p_c$ is injector-face stagnation pressure unless
the exercise says otherwise — and where the exercise says otherwise, that is
usually load-bearing, because Soviet and Russian practice quotes **nozzle
stagnation** pressure while US Apollo-era practice quotes **injector-end**, and
the difference is a few percent
`[_verify-liquid §18 of contested figures]`. Isp is in seconds and always tagged
vacuum or sea level. Solid-motor thrust is tagged `/motor` or `/vehicle` and
`max` or `avg`; more than half the disagreements in the solid literature are
per-motor/per-vehicle confusions rather than real disputes
`[_verify-solid-coldgas, standing warning]`. Bracketed tags cite
[`reference/sources.md`](../reference/sources.md).

## Index

| # | tier | one-line character |
|---|---|---|
| 1–10 | easy | canonical engines every propulsion engineer is expected to recognise |
| 11–22 | medium | one architectural inference away from the obvious |
| 23–30 | hard | close relatives, unflown record-holders, and national programmes with small literatures |

---

# Tier 1 — Easy (1–10)

## Exercise 1

**Era.** Air Force study contracts 1955–57; component testing from 1957; first
full-stage firing March 1959; flight rating December 1964; first flight November
1967; last flight May 1973.

**Performance.** 6,770 kN (1,522,000 lbf) sea level, 7,770 kN (1,746,000 lbf)
vacuum for the flight-rated engine; the first three flights were flown derated to
6,700 kN. Isp 263 s sea level (260 s on the early block) and 304 s vacuum; one
specialist source gives 265.4 s / 304.1 s, and the ~2 s spread is the early-block
versus flight-block distinction, not a measurement dispute. Expansion ratio 16:1,
undisputed. Dry mass 8,400 kg (18,500 lb); thrust-to-weight 94:1 at sea level.
Total propellant flow 2,577 kg/s at a mixture ratio of 2.27.

**Chamber pressure — read this as a clue in itself.** Four values circulate:
965 psia (66.5 bar) in older editions of the standard textbook, 982 psia (67.7
bar) in NASA-derived documentation, 1,015 psia (70.0 bar) in the most-copied
infobox, and 1,125 psia (77.6 bar) in a specialist engine-history source that
elsewhere describes that figure as a development peak. The course's
recommendation is ≈70 bar injector-end with the 965–1,125 psia range footnoted;
the spread is a measurement-station and programme-phase artefact `[F1-R3896]`.

**Architecture.** Single-shaft, direct-drive turbopump — no gearbox — with a
two-stage turbine driving one single-stage centrifugal pump per propellant at
5,488 rpm and roughly 41 MW (55,000 bhp) of shaft power. Regeneratively cooled
thrust chamber built from **178 brazed nickel-alloy tubes** in an up-pass /
down-pass routing, with steel bands over an Inconel jacket. Flat-face injector
mixing doublet and triplet elements in one pattern, divided into **13
compartments by a copper baffle assembly**.

**The quirk.** The turbine exhaust is not vented overboard through a duct. It is
dumped into the nozzle extension and used as a **film-cooling curtain**, which is
why the nozzle extension carries no regenerative circuit at all and why the plume
has a dark outer sheath. Ignition is by a hypergolic slug in a burst-diaphragm
cartridge for the main chamber and a pyrotechnic igniter for the turbine's gas
source.

**Context.** The injector pattern that finally worked took roughly 2,000 tests
across 210 injector designs, 15 baffle designs and 14 injector configurations
under a dedicated crash programme in 1962–64. Stability was demonstrated by
detonating a bomb near the injector centre at full thrust and requiring the
engine to damp the induced oscillation within 45 ms `[SP-194][SP-8113]`. The
engine was never restarted and never recovered.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 2

**Era.** Requirements issued 1970; contract awarded 13 July 1971; first complete
engine test 16 March 1977; first flight 12 April 1981. A block upgrade with a new
high-pressure fuel turbopump first flew in 2001. The engine is still in
production and now flies expendably.

**Performance.** At the highest certified power level: 1,860 kN (418,000 lbf) sea
level and 2,279 kN (512,300 lbf) vacuum — independently confirmed by the
manufacturer, which makes this the best-attested row of its rating table. Isp
452.3 s vacuum, 366 s sea level. Mixture ratio 6.03:1. Throttle range 67–109% of
rated power level, ground-tested to 111%.

**Chamber pressure.** 2,994 psia (**206.4 bar**) at the top power level — two
independent sources agree exactly, which makes it one of the most solidly attested
numbers in the whole reference file. Roughly 189 bar at 100% rated power level;
that scaling is very nearly linear in thrust but is a scaling, not a measurement.

**Two contested figures you should carry with the answer.** The expansion ratio
is quoted as **69:1** (manufacturer datasheet, labelled "area ratio"), **77.5:1**
(agency training material and much of the nozzle-flow literature) and **78:1**
(body text of a widely read article). The recommendation is 69:1 as the geometric
area ratio with the 77.5:1 figure footnoted, because "expansion ratio" is not one
unambiguous quantity `[SSME-Orient][SP-8120]`. Dry mass is quoted as 3,177 kg
(7,004 lb) and 3,526 kg (7,775 lb); the larger is almost certainly the installed
engine with heat shield, gimbal bearing and controller. The published 73:1
thrust-to-weight uses the *smaller* mass — on the manufacturer's mass it is ~66:1.

**Architecture.** Four pumps. A low-pressure axial fuel turbopump at ~16,185 rpm
and a low-pressure oxidiser turbopump at ~5,150 rpm feed a **three-stage
centrifugal high-pressure fuel turbopump at ~35,360 rpm delivering 53 MW (71,140
hp) from a package the size of a car engine**, and a two-stage high-pressure
oxidiser turbopump — main stage and preburner boost stage on one shaft — at
~28,120 rpm and 17.3 MW. Cooling is split by construction: **390 milled channels
in the main chamber liner**, and a separate **1,080-tube brazed nozzle**, both
hydrogen-cooled. The liner is a copper–silver–zirconium alloy with an
electroformed-nickel closeout.

**The quirk.** There are **two independent preburners, one per turbopump, both
running fuel-rich, both exhausting into the main injector** — so the powerhead is
a dual-shaft machine, not a single-shaft one. 600 main injector elements
surround a torch igniter at the centre of the face; the same igniter concept
appears again inside each preburner. Acoustic resonator cavities are machined
into the injector face to suppress high-frequency instability `[Biggs89]`.

**Context.** Between-flight inspection was enormous, and the engine is now flown
expendably — which is a fair verdict on the reusability premise it was sold on.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 3

**Era.** Family development from 1958; first flight of the family in 1962. The
block described here entered service in 1986 and flew into the early 2000s. The
family as a whole has been in continuous production for over six decades — the
longest service life of any rocket engine.

**Performance.** 73.4 kN (16,500 lbf) vacuum. Isp 444–445 s vacuum. Mixture ratio
5.0:1. Expansion ratio 61:1. Dry mass around 136 kg (300 lb) for this block —
medium confidence, since the manufacturer's own table gives 370 lb for a later
variant and 420 lb for another.

**Chamber pressure.** 475 psia (**32.8 bar**), and the low value is not a
limitation to be apologised for. It is structural: the power available to the
turbine is set by how much heat the chamber wall can put into the coolant, which
scales with wall *area* (≈ D²), while thrust scales with *throat* area. Chamber
pressure therefore has a hard ceiling that no amount of turbomachinery
development moves.

**Architecture.** No preburner. No gas generator. Nothing is dumped overboard.
The coolant circuit and the power cycle are the same circuit: fuel is heated in
the chamber-wall cooling passages, expands through the turbine, and is then
injected and burned. Cooling is regenerative through a **brazed stainless-steel
tube wall**. The injector is a coaxial element — a hollow oxidiser post with a
concentric fuel annulus — and ignition is by a spark torch.

**The quirk.** The turbopump is **a single shaft with a reduction gearbox**: a
two-stage centrifugal fuel pump on the high-speed shaft (~31,000 rpm, medium
confidence) drives a single-stage centrifugal oxidiser pump on a slower shaft
through gearing `[SP-8100][SP-8107]`. Almost nothing else in the modern liquid
world uses a gearbox, and it is one of the most-copied features of this design.

**Context.** The first flight engine of its propellant combination, of any kind,
anywhere; the first closed cycle of its type; and the first engine designed from
the outset for multiple restarts.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 4

**Era.** Developed 2011–2012, qualified March 2013, first flight 29 September
2013, and uprated repeatedly to its final rating by May 2018. Nine of them fly
per first stage, with a vacuum-optimised variant on the stage above.

**Performance.** 845 kN (190,000 lbf) sea level and 981 kN (221,000 lbf) vacuum
for the sea-level engine. Isp 282 s sea level, 311 s vacuum. Expansion ratio
16:1, up from 14.5:1 on the preceding block. Dry mass 470 kg. Claimed
thrust-to-weight **184:1 [claim]** — the highest of any flown orbital-class
engine, and at least arithmetically plausible: 845 kN ÷ 470 kg gives 183:1.
Throttle 40–100%, widened from an original 70–100%.

The vacuum variant is rated 981 kN with a 165:1 expansion ratio and **348 s
vacuum Isp**. Beware: a widely copied infobox has at times carried the sea-level
engine's 311 s in the vacuum variant's Isp field, flagged "needs update", and the
error has propagated into derivative tables.

**Chamber pressure.** 97 bar (1,410 psi) — a company figure, not independently
verified. Mixture ratio is **not published**; ~2.34 circulates without a source.

**Architecture.** Open cycle, fuel-rich, with the turbine exhaust vented
overboard through a duct — a deliberate simplicity choice, not a performance one.
**One shaft carries both propellant impellers and the turbine** at ~36,000 rpm
and about 7,500 kW [claim]. Cooling is regenerative through milled channels, with
the *fuel* as coolant; the vacuum variant's nozzle extension is radiatively cooled
niobium alloy and glows cherry-red in flight, which is normal and not a fault.

**The quirk.** The injector is a **single central pintle post** — throttleable by
geometry and inherently stable — and the manufacturer traces the lineage directly
to a 1960s lander engine built by a different company entirely `[Dressler00]`.
Ignition is by a pyrophoric slug, carried aboard for the upper-stage variant's
restarts. The thrust-vector actuators run on fuel tapped from the high-pressure
side and returned to the low-pressure inlet, so there is no separate hydraulic
fluid that can run out — which is precisely the failure that has ended other
vehicles.

**Context.** The first orbital-class engine to be routinely recovered and
reflown. Its cycle and 97 bar chamber pressure mean it will never be efficient;
it is optimised for cost, restart and reuse.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 5 — **every figure below is a company claim**

**Era.** Studies of this propellant combination from about 2009; first test firing
25 September 2016; second-generation production from 18 December 2021; a
third-generation variant reported flown 22 May 2026.

**Performance [all claims].** Second generation: 2,256 kN (507,000 lbf) sea
level, 2,530 kN vacuum, Isp 347 s sea level, dry mass 1,630 kg, T/W 141. Third
generation: 2,452 kN sea level (280 tf reported on a ground test), 2,697 kN
vacuum, ~350 s, dry mass 1,525 kg, T/W 164. Expansion ratio ~34.3 sea level,
~80 on the vacuum variant. Mixture ratio 3.6:1.

**Chamber pressure [claim].** 250 bar first generation, **300 bar** second,
**330 bar** operational third. If those hold, this is the highest-chamber-pressure
production rocket engine ever built, above 267 bar and 206 bar for the two
previous record-holders.

**Architecture [claims].** Two mechanically independent turbopumps. One is driven
by an **oxidiser-rich preburner**, the other by a **fuel-rich preburner**, and
**both preburner exhausts enter the main chamber** — every gram of propellant
passes through a turbine before it burns. Only one Soviet engine (never flown)
and one American test article preceded this architecture. Cooling is
regenerative through milled channels using the fuel; the third generation
integrates much of the secondary plumbing into the castings and prints, which is
where a large part of the claimed mass reduction comes from. The injector is
coaxial swirl from the second generation onward.

**The quirk.** The second generation **deleted the main-chamber igniter
entirely** — torch igniters in the preburners light the preburners, and the hot
preburner gas lights the main chamber. There is no pyrophoric slug anywhere,
which matters for on-orbit relight. The fuel and oxidiser are both stored
**subcooled**, and the densification is integral to the design rather than an
operational nicety.

**What independent data exists.** Regulatory licensing and environmental
documents give thrust and propellant-load figures broadly consistent with the
sea-level thrust claims, and third-party acoustic and telemetry analysis has
been used to cross-check total liftoff thrust. **There is no independent
verification of chamber pressure, Isp, dry mass or thrust-to-weight at all**;
the second-generation thrust figures trace to an executive's August 2020 social
media post.

**Identify:** propellants · cycle · cooling · injector · mission class · the
engine — and, as a seventh question, state which of the six answers you would
still defend if every company figure above turned out to be 15% optimistic.

---

## Exercise 6

**Era.** Derived in the early-to-mid 1990s from a larger engine of the same
family by halving it. First flight 24 May 2000. Deliveries ended in 2021 for
reasons that were entirely geopolitical and not at all technical.

**Performance.** 3,830 kN (860,000 lbf) sea level and 4,150 kN (930,000 lbf)
vacuum. Isp 311 s sea level, 338 s vacuum. Expansion ratio 36.87:1 — *identical*
to the parent engine, because the combustion chambers are the same part number.
Dry mass 5,480 kg (12,080 lb); thrust-to-weight 78.4:1. Mass flow 1,250 kg/s.
Burn time 270 s. Throttle 47–100%. Mixture ratio 2.72 (73% oxidiser by mass).

**Chamber pressure.** 26.7 MPa = **267 bar** (3,870 psia), the highest of any
engine in regular service before a certain methane engine's claims. Note the
national convention: this figure is quoted at **nozzle stagnation**, whereas US
Apollo-era practice quotes injector-end, which is typically a few percent higher.
Comparing this number directly against a US engine's overstates the gap slightly.

**Architecture.** A single oxidiser-rich preburner drives one turbopump, which
feeds **two combustion chambers**. Cooling is regenerative with the fuel as
coolant. Injector elements are coaxial swirl. Ignition is chemical — a
hypergolic starter fluid, not a spark and not a pyrophoric cartridge.

**The quirk that is really a materials lesson.** Every metal surface in contact
with the hot oxygen-rich gas carries an **inert enamel coating**. That single
technology is what makes the cycle survivable, and it is why the West could not
simply copy the architecture for thirty years even after it was fully described
in the open literature `[SLPRE][Clark]`.

**Context.** The first engine of its nation ever certified for another nation's
national-security launch. Turbopump shaft power is **not published**; the parent
engine's figure is contested between roughly 170 and 192 MW within a single
article, and roughly half of that would be the right order here.

**Identify:** propellants · cycle · cooling · injector · mission class · the
engine. **Then:** name the sibling engine that shares this one's cycle,
propellants, injector type, cooling, chamber pressure to within 4%, expansion
ratio to within 0.5%, and specific impulse to within 1 s — and state the two
figures above that separate them.

---

## Exercise 7

**Era.** First flight 12 April 1981. A comprehensively redesigned version first
flew 29 September 1988 after a loss-of-crew accident. Last flight 8 July 2011.
Two per vehicle. A five-segment derivative flies today.

**Performance.** ≈14.7 MN (3,300,000 lbf) `/motor`, `max`, sea level, reached at
about T+20 s; ≈12.5 MN `/motor` at liftoff. Isp 242 s sea level, 268 s vacuum.
Chamber pressure ≈6.25 MPa (906.8 psi) nominal, peaking near 6.4 MPa. Burn time
≈123–124 s to the 50 psi action-time cutoff. Propellant mass ≈500,000 kg; gross
mass ≈590,000 kg; inert mass ≈91,000 kg, giving a propellant mass fraction of
**≈0.85** `[CALC]`.

**Propellant and grain.** An ammonium-perchlorate / aluminium composite in a
polybutadiene-acrylonitrile binder. The published composition is AP 69.6%, Al
16%, iron oxide 0.4%, binder 12.04%, epoxy curing agent 1.96% by mass; a
competing figure of 69.8% AP with 0.2% iron oxide circulates and both sum to
100%. **The forward segment carries an 11-point star perforation; the aft
segments carry a double-truncated-cone perforation.** The star is there to
produce a head-end regressive-then-neutral thrust trace that keeps the vehicle
inside its structural box through maximum dynamic pressure.

**Case and nozzle.** High-strength low-alloy steel, ~12.7 mm (0.5 in) nominal
membrane wall — one widely read source says "2 cm", which is plausibly a local
thickness at a joint rather than the membrane. **Eleven cast segments assembled
into four flight segments joined by three field joints**, with factory joints
inside each flight segment. Submerged carbon-phenolic and silica-phenolic
ablative nozzle on a flexible bearing, gimballed ±8° in pitch and yaw by two
hydraulic actuators fed from two hydrazine-fuelled power units per booster.
Expansion ratio quoted as 7.72 early and 7.16 later — both are real, the nozzle
changed.

**The quirk, and the accident.** The original field joint was a tang-and-clevis
with two fluorocarbon O-rings. Under ignition pressure **the joint rotated**: the
tang and clevis legs deflected apart, momentarily opening the very gap the rings
had to seal, so the seal was rate-dependent — and the extrusion rate of a
fluorocarbon elastomer is strongly temperature-dependent. The redesign added a
**capture feature** on the tang that mechanically limits rotation, a third O-ring
on that capture feature, revised joint insulation, and joint heaters
`[Rogers86]`.

**Identify:** propellant family · grain geometry rationale · case construction ·
nozzle and TVC architecture · mission class · the motor. (Substitute the first
four for the usual liquid-engine questions.) **Then:** state in one sentence why
the 0.85 mass fraction above is the number that explains this motor's entire
architecture.

---

## Exercise 8

**Era.** Developed in the early 1990s as a replacement for a much larger and more
capable device flown three times in 1984. In service since the mid-1990s; carried
on essentially every extravehicular activity since.

**Performance.** Working fluid: a diatomic gas, molecular mass 28.014 kg/kmol,
γ = 1.400, stored as a high-pressure gas at **224 bar (3,250 psi)**. Propellant
mass **1.4 kg (3 lb)**. Δv **3.05 m/s (10 ft/s)**. System mass **37.7 kg**.
Twenty-four thrusters. Thrust per thruster ≈3.6 N (0.8 lbf) — **not published**;
that figure is derived, not sourced.

**The number that carries the whole exercise.** Work the implied specific
impulse: 3.05 m/s of Δv on ~180 kg of combined system-plus-crew mass, using
1.4 kg of propellant, gives **≈40 s** `[CALC]`. The ideal frozen-flow value for
this gas at a 50:1 area ratio is 76.8 s, and a real thruster of this type
typically delivers about 90% of ideal — so ~40 s is *less than 60% of what the
gas is worth*. That is not an error. A small, low-expansion thruster fired in
millisecond pulses loses most of its ideal performance to wall heat transfer,
non-equilibrium expansion, and dead volume in the valve and plenum.

**Contrast with the predecessor.** The 1984 device carried 5.9 kg per tank in two
Kevlar-overwrapped aluminium tanks (11.8 kg total), massed 148 kg loaded, had 24
nozzles in four clusters of six for six-degree-of-freedom control, and is
credited with 33.5–39.6 m/s of Δv on a ground charge. **That Δv figure does not
close**: 11.8 kg at a realistic 70 s gives ~8,100 N·s, which against ~340 kg of
system-plus-crew is ~24 m/s, not 36. Either the quoted Δv assumes a lighter
reference mass or the tank load is larger than published. The worksheet flags
this as unresolved and recommends using the *later*, smaller device as the honest
worked example precisely because its implied Isp is credible `[SAFER95]`.

**The quirk.** The specification of the later device follows entirely from one
sentence of requirement: *get back to the handrail, once.* It is a self-rescue
device with a single-use budget, not a manoeuvring unit.

**Identify:** working fluid · "cycle" (state what takes the place of one) ·
thermal management · thruster and valve architecture · mission class · both
devices — the one described in the performance block and the one described in the
contrast block.

---

## Exercise 9

**Era.** 1964–1972. First flight unmanned in 1968, crewed in 1969.

**Performance.** Maximum thrust 46.7 kN (10,500 lbf); throttleable 4.67–30.36 kN,
i.e. **10%–60%**. Isp 311 s at full thrust, falling to **285 s at 10%**.
Expansion ratio 47.5:1 on early units and 53.6:1 on later ones with a heavier
payload — and the later nozzle was long enough that it crushed on landing. Dry
mass 179 kg (394 lb). Mixture ratio 1.6. Demonstrated up to four restarts.

**Chamber pressure — the single best clue in this file.** **110 psia (7.6 bar) at
100% thrust and 11 psia (0.76 bar) at 10%.** A 10:1 chamber-pressure turndown.
Ask yourself what that demands of an injector, and what it rules out.

**Architecture.** No turbopump. Tank pressurisation is by **supercritical
cryogenic helium**, stored cold and dense to save tank mass and then warmed to
pressurise `[SP-8112]`. Cooling is ablative in the chamber with a radiatively
cooled skirt. Ignition requires no igniter at all.

**The quirk.** The injector is a **variable-area pintle**: a movable sleeve
changes the injection area with the flow, so injection velocity and mixing
quality stay roughly constant across the whole throttle range. That is *the*
reason the deep throttle was achievable, and the concept has had a longer
technological afterlife, relative to how simple it is, than anything else in the
reference file `[Dressler00][SP-8089]`.

**The detail usually omitted.** The band between 60% and 100% thrust was
**operationally prohibited** because of nozzle erosion. The engine ran at full
thrust or inside the throttle band, never between.

**Context.** It performed its intended job six times, and on one flight performed
a mid-course correction and free-return burn it was never designed for, with the
crew's lives depending on it.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 10

**Era.** Developed roughly 1938–1942. First successful flight 3 October 1942;
operational September 1944 – March 1945. Copied or studied by every subsequent
national programme.

**Performance.** ~245 kN (55,000 lbf) sea level at its rating, rising to ~285 kN
as ambient pressure falls. Isp ~203 s sea level and ~239 s vacuum — **medium
confidence**, reconstructed from a quoted 2,000 m/s effective exhaust velocity,
with secondary tables spread across 199–210 s at sea level. Expansion ratio
~3.5:1 through a short conical nozzle with a 15° half-angle. Chamber pressure
1.52 MPa = **15.2 bar (220 psia)**. Dry mass ~1,126 kg; thrust-to-weight ≈22:1.
Mixture ratio ≈1.18, with sources spread to 1.25; low confidence on the second
decimal. Burn time ~60 s.

**Propellants.** The fuel is **diluted deliberately with 25% water**, and the
water is there as a combustion- and wall-temperature moderator, not as ballast or
adulteration. That single fact should tell you how marginal the cooling was.

**Architecture.** The turbine is driven by **decomposed 80% hydrogen peroxide
over a permanganate catalyst** — steam, not combustion gas, and therefore a
monopropellant drive rather than a bipropellant gas generator. Single shaft,
centrifugal pumps back-to-back, 4,000 rpm, ~430 kW, moving ~68 kg/s of oxidiser
and ~55 kg/s of fuel. Cooling is a double-wall mild-steel regenerative jacket
**plus four rings of film-cooling holes injecting about 10% of the fuel along the
wall** — and the film cooling does most of the work, because the jacket alone was
insufficient.

**The quirk.** The injector is not a single flat face. It is **18 pot-type
pre-mixing "burner cup" heads arranged in two concentric circles on a domed
plate**, each one a miniature centrifugal-swirl injector. This is the
distinguishing feature of the design, the reason the chamber is nearly spherical,
a manufacturing nightmare, and the direct cause of the ~94% c* efficiency and the
capped chamber pressure. Ignition is a spinning pyrotechnic igniter lowered into
the chamber, followed by a gravity-fed preliminary stage and then turbopump
mainstage.

**Context.** The first mass-produced, turbopump-fed, regeneratively cooled liquid
rocket engine. Every subsequent lineage traces through it, either by direct copy
or by studied rejection of its choices `[Hunley07][SLPRE]`.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

# Tier 2 — Medium (11–22)

## Exercise 11

**Era.** Approved to the contractor 1 June 1960; production from May 1963; first
flight 26 February 1966. Retired with its programme in the mid-1970s. Flown one
per stage on one vehicle and five per stage on another.

**Performance.** 1,033.1 kN (232,250 lbf) vacuum at the nominal mixture ratio.
**Vacuum only — it never operates at sea level.** Isp 421 s vacuum. Chamber
pressure 5,260 kPa (**52.6 bar**, 763 psia). Expansion ratio only **27.5:1**,
which is small for a vacuum engine and was constrained by the interstage, not by
the aerodynamics. Dry mass 1,788 kg; T/W ≈59:1.

**The mixture-ratio clue.** A propellant utilisation valve shifts the ratio
between **4.5:1 and 5.5:1** in flight, trading thrust (780–1,000 kN) against Isp.
It is used both to burn both tanks dry simultaneously and to manage stage
acceleration. Only one propellant combination plausibly runs at a nominal 5.5:1.

**Architecture.** Two independently driven pumps, but **in series on one exhaust
stream**: a **7-stage axial fuel pump at 27,000 rpm** and a **single-stage
centrifugal oxidiser pump at 8,600 rpm**, with the drive gas passing through the
fuel turbine *first* and then the oxidiser turbine. That series arrangement makes
the mixture ratio partly self-regulating `[SP-8107][SP-8110]`. Cooling is
regenerative through a brazed tube wall, fuel-cooled.

**The quirk.** The injector has **614 hollow oxidiser posts with concentric fuel
annuli**, firing through a **porous sintered stainless-steel faceplate** that
transpiration-cools the face with the fuel `[SP-8089]`. Ignition is a small
torch at the injector centre with dual spark plugs. Both features are the
archetype that essentially every later engine on this propellant combination
copies.

**Context.** Restartable in vacuum — which required a separate ambient-helium
start tank and settling motors — and the restart is what made the mission
architecture possible. The cycle dumps 2–3% of the propellant overboard. An
uprated version tested from 1965 to 1972 reached 1,138.5 kN and 436 s by
**replacing the gas generator with a tap-off from the main chamber**; it never
flew.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 12

**Era.** Developed from the mid-1990s under an explicit "design for minimum cost"
brief for a government launch-vehicle competition — roughly 80% fewer parts than
the contemporary high-performance engine of the same propellant class. Baseline
first flight 20 November 2002; the uprated block described here entered service
in 2012; last flight 9 April 2024. Retired.

**Performance.** 3,137 kN (705,000 lbf) sea level, 3,560 kN (800,000 lbf) vacuum.
Isp 411.9 s vacuum (the baseline block: 365 s sea level, 410 s vacuum). Chamber
pressure **1,488 psia (102.6 bar)** for both blocks — the uprate came from about
5 bar more chamber pressure plus a redesigned injector for better mixing
efficiency, which is a rare case of a published performance delta being
*explained*. Dry mass 6,740 kg; thrust-to-weight **47:1**, the lowest of any
modern large booster engine. Mixture ratio ~6.0 but **not published** in any
fetched source — treat it as unknown.

**The two numbers that identify the cycle and the cooling together.** Expansion
ratio **21.5:1** — extremely low for this propellant combination — and an Isp
some 40 s below what the same propellants achieve in a staged-combustion engine
of similar size. Both follow from the same two design decisions.

**Architecture.** Separate fuel and oxidiser turbopumps on a common open-cycle
circuit, exhaust dumped through a side duct. The **main combustion chamber is
regeneratively cooled through channels in a copper-alloy wall; the nozzle is
ablative** — a silica/carbon-phenolic liner that chars and erodes through the
burn. Turbopump speeds and shaft powers are **not published**.

**The quirk.** The ablated carbon reacting with atmospheric oxygen is what
produces this engine's famously bright orange plume, and the pre-ignition fuel
bloom scorches the vehicle every flight — both cosmetic, both alarming, both
normal.

**Context.** The largest engine of its propellant class ever built by thrust, and
the clearest counter-example in the reference file to the assumption that engine
development should maximise performance. The ablative nozzle is single-use by
definition, which foreclosed any reusability path.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 13

**Era.** Predecessor from 1988, first flight 4 June 1996. The block described
here first flew 12 February 2005 and last flew 5 July 2023. A simplified
successor first flew 9 July 2024 with *slightly lower* thrust — because it is a
manufacturing simplification, not a performance uprate.

**Performance.** 1,359 kN (306,000 lbf) vacuum. Chamber pressure **117.3 bar**
(1,701 psia); some secondary sources round this to "115 bar", which is a rounding
and not a disagreement. Isp **429 s vacuum**. Expansion ratio 58.2:1. Dry mass
1,800 kg; T/W ≈77:1 in vacuum.

**The clue that is a paradox.** The predecessor ran at 100 bar with a 45.1:1
nozzle and delivered **431 s** — *higher* Isp than this engine, despite this one
having 17% more chamber pressure and a 29% larger nozzle. The reason is the
mixture ratio, which went from 5.3:1 to **6.1:1**. That is also the single
biggest source of the thrust uprate. The optimum mixture ratio for an *engine* is
not the optimum for a *vehicle* `[SB][CEA]`.

**Architecture.** Two separate turbopumps on one common open-cycle gas source.
On the predecessor: oxidiser pump 13,600 rpm / 3 MW, fuel pump 34,000 rpm /
12 MW; on this block, ~12,300 rpm and ~36,500 rpm respectively (medium
confidence, from a secondary summary of the development paper). Regenerative
tube-wall chamber with a coaxial shear injector. **This block added film cooling
to the lower nozzle, injecting turbine exhaust**, because the higher chamber
pressure and richer mixture raised the wall heat flux.

**The quirk.** Ignition is ground-start only; **the engine does not restart**,
which forced its vehicle to carry a separate storable upper stage for anything
beyond a direct injection. Sea-level thrust is **not separately published** in
any source consulted — a commonly cited ~960 kN figure should be treated as
unverified.

**Context.** The successor block's nozzle is the best-documented example of
manufacturing-driven redesign in European propulsion: **90% fewer parts, 40%
lower cost and 30% faster to produce**, achieved with laser-welded sandwich
construction.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 14

**Era.** Development began in 1998 and the engine first flew on 9 July 2024 — a
26-year programme for a vehicle that flies a few times a year.

**Performance.** 180 kN (40,000 lbf) vacuum. Chamber pressure **60 bar** (870
psia). Isp **457.2 s vacuum**. Expansion ratio **240:1** with a deployable nozzle
extension. Mixture ratio 6.1:1, confirmed internally by the published flow rates
(34.1 kg/s oxidiser, 5.59 kg/s fuel, which back-computes to 6.10). Burn time up
to 900 s; up to three restarts in the fetched source, with some sources claiming
four or more.

**The mass figure worth memorising.** ~550 kg total, **160 kg excluding the
nozzle**. The nozzle is about **70% of the engine mass**.

**Architecture.** No preburner and no gas generator anywhere in the main power
path. The cooling circuit *is* the power cycle, and all of the turbine flow is
subsequently burned in the chamber — which is what caps chamber pressure at 60
bar and is why this engine, at 180 kN, is by a wide margin the highest-thrust
example of its exact cycle ever flown. Cooling is regenerative through a
smooth-wall chamber with high-speed milled channels; turbopump impellers are
powder-metallurgy parts. Two separate high-speed turbopumps, **not geared** —
which is a deliberate departure from the older engine that pioneered this cycle.
Injector coaxial, ignition by spark torch.

**The quirk.** Multi-restart capability comes from an **auxiliary propulsion
unit** that heats propellant in a **3D-printed gas generator** to re-pressurise
the tanks, and which also provides low-thrust settling and orbital adjustment.
The worksheet's assessment is blunt: the APU is arguably more novel than the
engine.

**Identify:** propellants · cycle (be specific about the variant) · cooling ·
injector · mission class · the engine.

---

## Exercise 15

**Era.** Predecessor from 1984, first flight 4 February 1994. After a launch
failure on 15 November 1999 caused by a **fuel turbopump inducer failure**, the
engine was redesigned; the redesigned version first flew 29 August 2001 and flies
today.

**Performance (long-nozzle operational configuration).** 870 kN (196,000 lbf)
sea level, 1,098 kN (247,000 lbf) vacuum, Isp 440 s vacuum, expansion ratio
51.9:1. A short-nozzle variant gives 843 kN SL / 1,074 kN vac at 429 s. Mixture
ratio 5.9:1. Dry mass 1,800 kg; T/W ≈66:1 in vacuum. Throttle 72–100%.

**The clue in the direction of a change.** The predecessor ran at 12.7 MPa
(127 bar); this engine runs at **12.0 MPa (120 bar)** — *lower*. The redesign
traded performance for turbopump margin after the failure. Sea-level Isp for this
block is **not published**; only the vacuum figures and the predecessor's 349 s
sea-level value are.

**Architecture.** Separate fuel and oxidiser turbopumps driven from a **fuel-rich
preburner**, with the preburner exhaust burned in the main chamber. Regenerative
hydrogen cooling, coaxial injector, spark torch ignition. Turbopump speeds are
**not published** in the sources consulted.

**The quirk.** The most instructive failure mode in this engine's history is not
the inducer. It is **nozzle-extension side loads during the start transient**,
which damaged gimbal actuators; the redesigned nozzle was specifically shaped to
fix it, and this is the best-documented flight case of start-transient side
loading anywhere in the reference file `[Ostlund02][OMK05][Schmucker73]`.

**Context.** Its nation is one of only three ever to fly staged combustion on
this propellant combination, and it did so on a small fraction of the budget the
other two spent.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 16

**Era.** Designed in the late 1960s and early 1970s for a super-heavy vehicle
whose four launch attempts all failed between 1969 and 1972. The programme was
cancelled in 1974 and roughly 150 engines were ordered destroyed; the design
bureau hid them instead. **First successful flight 21 April 2013 — forty years
after manufacture.** Supply exhausted in early 2025.

**Performance.** 1,510 kN (340,000 lbf) sea level, 1,680 kN (380,000 lbf)
vacuum. Chamber pressure 14.83 MPa (**148.3 bar**, 2,151 psia). Isp 297 s sea
level, 331 s vacuum. Dry mass 1,240 kg. Throttle 50–105%. Expansion ratio and
mixture ratio are **not published**; ~2.6 circulates for the latter without a
source.

**The number that made Western engineers disbelieve the engine was real when
they inspected one in 1993:** thrust-to-weight **137:1**. For decades the highest
of any booster engine.

**Architecture.** Closed cycle with an **oxidiser-rich** preburner. Regenerative
cooling with the fuel as coolant. Coaxial injector, chemical ignition. And a
constraint that is worth more than any performance number: **the turbopump
bearings run in the oxidiser flow and require subcooled liquid oxygen for
cooling**, which constrains ground operations directly.

**The institutional clue.** The design bureau was **not** the national rocket
engine bureau. It was an *aircraft engine* house, brought in after the vehicle's
chief designer and the established engine designer fell out over propellant
choice. That fact explains the engine's unusual design sensibilities, and the
thrust-to-weight above is the fingerprint of aviation practice applied to a
rocket engine.

**Context.** The engine that, on inspection, forced a wholesale revision of
Western assumptions about the other side's propulsion technology. Its second
career ended in a launch failure on 28 October 2014 traced to a turbopump in a
forty-year-old engine with corrosion and manufacturing debris: superb when new,
impossible to re-qualify as it aged.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 17

**Era.** Developed 1961–1963; first flight July 1965; uprated twice, in 1987–1993
and 2001–2005; retired with its vehicle in 2025. Six per first stage.

**Performance (baseline / first uprate / second uprate).** Thrust sea level
1,470 / 1,590 / 1,671 kN; vacuum 1,630 / 1,750 / 1,832 kN. Chamber pressure
**14.7 / 15.7 / 16.5 MPa** (147 / 157 / 165 bar). Isp 285 / 287 / 288 s sea
level and ~316 s vacuum throughout. Expansion ratio 26.2:1 for all variants. Dry
mass ~1,070–1,080 kg. Mixture ratio 2.67.

**The number that gives the cycle away.** Thrust-to-weight **156:1**. Work out
why an oxidiser-rich preburner produces that: the turbine runs on dense, cool,
high-mass-flow gas, so the turbomachinery is small for the power delivered.

**Architecture.** Single-shaft turbopump. Regenerative cooling, fuel as coolant.
Coaxial injector. **No igniter of any kind** — and no igniter is needed. Gimbal
is 7.5° in a *single* plane; the six engines are mounted so that single-plane
actuators give full three-axis vehicle control between them.

**The quirk that is really a claim of precedence.** This is the **first
oxidiser-rich staged-combustion engine ever flown**, in 1963, at 147 bar. No
American engine reached that chamber pressure for fifteen years, and no American
engine of this cycle flew until 2024. The enabling technology — passivating
enamel and specialised alloys against hot oxygen-rich gas — was closely held, and
that secrecy is the main reason the West did not follow for decades.

**Context.** Propellants are storable, hypergolic, carcinogenic and lethal, and
the ground-handling cost was enormous for sixty years of operations.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 18

**Era.** Work began 2011; publicly announced September 2014; first hotfire October
2017; first flight 8 January 2024, roughly five years later than planned, which
delayed two launch vehicles. Two fly on one vehicle and seven on another.

**Performance [claims].** 2,460 kN (550,000 lbf) sea level as originally
specified, with **2,847 kN (640,000 lbf)** stated as an improved figure in
November 2025 — it is not clear which vehicles fly which rating. Vacuum thrust
**not published**. Isp 340 s sea level (company figure). Expansion ratio and
mixture ratio **not published**. Dry mass 5,400 kg for the original
configuration, giving a modest ~46:1 thrust-to-weight. Throttle 40–100%.

**The design decision the manufacturer has been explicit about.** Chamber
pressure is **140 bar (2,030 psia)** — *deliberately low* for this cycle, against
267 bar for the engine it displaced. That is a life-and-reusability choice, not a
limitation.

**Architecture.** A **single oxidiser-rich preburner whose turbine drives both
propellant pumps**. Regenerative cooling with the fuel as coolant. Turbopump
shaft power ~56 MW (75,000 hp), and notably running on **hydrostatic bearings
rather than rolling-element bearings** — another life-driven choice aimed at
reuse. The injector element type is **not published**; full-scale injector
elements were tested during development and that is all the record shows.

**The quirk.** In-flight relight is achieved by a **head-pressure start**: tank
pressure alone spins the turbine up, with no start cartridge and no spin-start
system.

**Context.** The first engine of its cycle designed in its country to fly, and
the reason its nation's national-security launch no longer depends on imported
engines.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 19

**Era.** First test firing 2013; flight qualification March 2016; first flight
25 May 2017. By April 2024, 369 units had flown across 47 flights. Nine on the
first stage, one vacuum-optimised on the second.

**Performance.** 24.9 kN (5,600 lbf) sea level; the vacuum variant 25.8 kN with a
larger nozzle. Isp 311 s sea level, 343 s vacuum. Dry mass **35 kg**;
thrust-to-weight 72.8:1. Chamber pressure, expansion ratio and mixture ratio are
all **not published**.

**The architecture, stated plainly, because it is the whole exercise.** There is
**no turbine, no gas generator and no power-cycle propellant loss at all**. Two
**brushless DC motors, 37 kW (50 hp) each at 40,000 rpm**, drive the propellant
pumps, powered by lithium-polymer batteries. The first-stage battery pack supplies
over 1 MW to run all nine engines, and part of the pack is jettisoned in flight.

**The claim you should refuse to repeat uncritically.** The manufacturer quotes
~95% efficiency for the electric pump drive against ~50% for a gas-generator
turbine. Those are **different quantities** — electrical-to-hydraulic efficiency
versus thermodynamic cycle efficiency — and comparing them is not meaningful.

**Cooling and manufacturing.** Regenerative, with cold fuel through channels
embedded in a **printed** chamber. Chamber, injector, pumps and main propellant
valves are all produced by laser powder bed fusion; this was the first engine to
fly with essentially its entire primary structure additively manufactured
`[GradlAM][Gradl18]`. Injector element type is **not published**; ignition is by
spark.

**The honest criticism.** The 72.8:1 thrust-to-weight is an *engine* figure and
excludes the batteries. At stage level the number is much worse, and that
parasitic mass is what caps the approach at small vehicles — the same company
moved to a preburner cycle for its next, larger vehicle.

**Identify:** propellants · cycle (name it precisely; it is not one of the four
you were taught first) · cooling · injector · mission class · the engine.

---

## Exercise 20

**Era.** First flight 13 July 2022. One as a first stage on one vehicle; two or
four as strap-ons on another. A stretched derivative of about 160 t propellant
is in early service.

**Performance.** ≈4,780 kN `/motor`, `max`, vacuum. Isp ≈280 s. Burn time
≈130–140 s (low confidence). Propellant mass **141,400 kg**; gross mass 153,000
kg; inert mass 11,200 kg. Length 13.5 m, diameter 3.4 m.

**The number the whole exercise turns on.** Propellant mass fraction **0.924**
`[CALC]`. Compare that with **≈0.85** for a segmented steel motor of similar
vintage-of-concept. That 0.07 is the single most useful number-pair in the solids
part of this course.

**Propellant.** An AP/Al composite in a hydroxyl-terminated polybutadiene binder,
19% aluminium / 69% AP / 12% binder — the trade name encodes the aluminium and
binder fractions directly. Cast as a **single monolithic grain**.

**Case and nozzle.** **Carbon-fibre filament-wound, monolithic — one piece, no
segments, no field joints.** Roughly 3,500 km of fibre wound over about 33 days
in a climate-controlled hall (low confidence on those two figures).
Carbon-phenolic nozzle on a flexible joint, steered by **electromechanical**
actuators rather than hydraulics.

**Not published.** Chamber pressure and the thrust trace could not be verified
against the manufacturer's own data sheet — the worksheet flags both as needing a
primary source `[P120C]`.

**Identify:** propellant family · grain and case construction · nozzle and TVC
architecture · why the mass fraction came out where it did · mission class · the
motor.

---

## Exercise 21

**Era.** Base motor 1980–1985; the variant described here from 1985 onward. Used
as an upper stage on a medium launch vehicle and on satellites deployed from a
crewed orbiter; also flown as the third stage of a fast outer-planets mission.

**Performance.** Thrust ≈66.0–66.4 kN vacuum (the difference is quoting noise).
Burn time ≈87 s. Propellant mass 2,009–2,011 kg; gross mass ≈2,137 kg.

**The contested figure that is the exercise.** Vacuum Isp is quoted as **286.2 s
and 292.2 s**, and **both are correct** — they are the short-nozzle and
long-nozzle variants, at expansion ratios of ≈47.7 and ≈54.8–70.4 respectively.
Never quote this motor's Isp without saying which nozzle. Inert mass is given as
28 kg by one catalogue and 126 kg by another; 2,137 − 2,009 = 128 kg, which
supports the larger figure and suggests the smaller is a typo for 128 kg. Use
≈128 kg and a mass fraction of ≈0.94.

**Architecture.** Propellant is an HTPB/AP/Al composite (**needs primary
source**). Case is titanium 6Al-4V (**needs primary source**). Nozzle is
carbon-phenolic and **fixed** — a thrust-vectoring, non-spinning variant exists
and flies on a different launcher family.

**The design question hiding in the numbers.** With a fixed nozzle and no TVC,
how is this motor's thrust vector stabilised during its 87-second burn? Answer
that before you name it.

**Identify:** propellant family · case material and why · nozzle architecture ·
attitude-control method · mission class · the motor.

---

## Exercise 22

**Era.** Contract signed April 1962; developed 1962–1966; first flew unmanned in
1966, crewed from 1968, retired 1975.

**Performance.** 91.19 kN (20,500 lbf) vacuum. Isp 314.5 s vacuum. Mixture ratio
1.6 (from programme documentation, medium confidence). Maximum burn 750 s, with
multiple restarts. Two-axis gimbal.

**A warning about this block's provenance.** Chamber pressure (~100 psia /
6.9 bar), expansion ratio (62.5:1), dry mass (~294 kg) and the cooling
description are all flagged **low confidence and unverified** in the worksheet —
they come from programme-era documentation that was not re-read during the
verification pass. What *is* sourced is more useful anyway: the nozzle is
**3.882 m long with a 2.501 m exit diameter**. Compute the area ratio yourself
and see whether 62.5:1 is even consistent with a throat sized for 91 kN at 7 bar.

**Architecture.** No turbopump. Pressurisation is **39.2 ft³ (1.11 m³) of gaseous
helium at 3,600 psi (25 MPa)** in two tanks, regulated down. The chamber is
ablative with a radiatively cooled skirt (standard description, not confirmed).
The injector is an **unlike-impinging doublet in a deliberately conservative,
unbaffled design** — which is a striking choice given that a contemporary engine
of similar propellants needed a competitor's baffled injector to be stable at
all.

**The quirk.** **No igniter, no turbopump, and no valve that must move more than
once**, with redundant series-parallel valve trains throughout. Nothing was
innovated deliberately. It is the canonical example of designing for
single-string criticality by *removing mechanisms* rather than adding redundancy.

**Context.** It was originally sized for a mission mode that was abandoned, which
is why it is over-powered for the job it actually did — and it did that job,
every time, without a failure.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

# Tier 3 — Hard (23–30)

## Exercise 23

**Era.** Development from 1976. First flight 15 May 1987, second and last flight
15 November 1988. Two flights, four engines per vehicle, then the programme died
with its country.

**Performance.** 1,961.3 kN (440,900 lbf) vacuum at 106% power, 1,526 kN
(343,000 lbf) sea level. Isp **455 s vacuum**, 354 s sea level. Chamber pressure
21.9 MPa = **219 bar** (3,180 psia). Expansion ratio **85.7:1**. Dry mass 3,450
kg; thrust-to-weight 57.9:1 at the 106% vacuum rating. Mixture ratio 6:1. Nominal
burn 480–500 s, but **certified to 1,670 s**.

**Architecture.** Fuel-rich staged combustion — with a **single-shaft turbopump
driving both the fuel and the oxidiser pumps**. Regenerative hydrogen cooling.
Coaxial injector, torch ignition.

**Two comparative facts the worksheet flags as coming from one source and
needing corroboration.** Against its closest analogue elsewhere in the world,
this engine achieved **slightly higher Isp (455 s versus 452.3 s) and higher
chamber pressure (219 versus 206 bar) at lower complexity and cost** — but it was
expendable, where the analogue was designed for 55 reuses. And it **reached
combustion stability without the acoustic resonance cavities the analogue
requires**, which is a specific, checkable design difference rather than a
marketing claim.

**Identify:** propellants · cycle · cooling · injector · mission class · the
engine. **Then, the real question:** you have almost certainly considered a
second engine that shares this one's propellants, cycle family, cooling, injector
type, mission class, and Isp to within 3 s. Name it, and name the **three** clues
above that separate the two. One of them is architectural, one is a performance
figure, and one is a stability-design detail.

---

## Exercise 24

**Era.** Firing tests from April 2017. The programme suffered **combustion
chamber wall cracks and turbine blade fatigue cracks** discovered in 2020,
delaying its vehicle by roughly two years. First flight 7 March 2023 — the
engines performed correctly; the flight failed for reasons in the stage above.
Fully successful second flight 17 February 2024. Two or three per core stage.

**Performance.** **1,471 kN (331,000 lbf) vacuum.** Sea-level thrust **not
published**. Chamber pressure 10.0 MPa (**100 bar**). Isp **426 s vacuum**.
Expansion ratio **37:1**. Dry mass 2,400 kg; T/W 62.5:1. Mixture ratio 5.9.

**The clue that should stop you.** 426 s vacuum, from that propellant
combination, at 100 bar, in a booster-class engine. That is well below what
staged combustion delivers at the same size — 30 s below, in fact, and you know
of at least two engines that prove it. So the cycle is *not* staged combustion,
and it is not the obvious open cycle either.

**Architecture.** **No preburner and no gas generator anywhere.** The cooling
jacket drives the turbines, and the turbine flow is then **dumped overboard**
rather than injected into the chamber. That is the entire architecture, and it
is why this is the simplest large engine of its propellant class ever built, with
correspondingly low part count and intended low cost. Injector coaxial;
turbopump detail **not published**.

**The significance.** At 1,471 kN this is by a wide margin the largest engine of
its cycle *family* ever flown — against 110 kN and 180 kN for the two best-known
members. It demonstrates that the variant has no practical thrust ceiling, which
reopens a design space the industry had written off. The turbine cracks showed
the thermal margins are tight.

**Identify:** propellants · cycle (the specific variant, and why not the other
two in its family) · cooling · injector · mission class · the engine.

---

## Exercise 25

**Era.** Concept 1988; project start 1999; **first test firing 9 October 2001**;
a derivative still in development as of 2022 for an upper stage that has not
flown. Twenty-five years of development without a flight. Developed with foreign
industrial collaboration in the early 2000s.

**Performance.** 68.6 kN (15,400 lbf) vacuum. Chamber pressure 5.9 MPa (**59
bar**). Capable of five firings, with thrust control in two planes. Expansion
ratio **not published**; dry mass **not published**; mixture ratio **not
published**.

**The record, and the caveat that must travel with it.** Isp **470 s vacuum** —
**if correct, the highest specific impulse ever demonstrated by a chemical rocket
engine**, above the 465.5 s of the highest-Isp engine ever *flown*. But it is a
**test-stand figure from a design bureau for an engine that has never flown**,
and the course's rule is that flown and unflown engines never share a column
`[_verify-liquid §17 of contested figures]`.

**Architecture.** No preburner, no gas generator — the turbopumps are driven by
heat absorbed in the nozzle and combustion chamber. The nozzle extension is
**uncooled**. **Separate fuel and oxidiser turbopumps**, with the **fuel
turbopump running at over 120,000 rpm** — the highest published turbopump speed
of any rocket engine anywhere `[SP-8107][SP-8101]`.

**The two clues that fix the nationality and the cycle together.** It is the
first engine of its cycle from its country; and its chamber pressure of 59 bar
sits exactly where you would expect that cycle's heat-balance ceiling to be at
this thrust.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 26

**Era.** Development began in the early 2000s, drawing on technology transferred
from another country's engine programme in the 1990s. First 300-second test
November 2007; first flight 20 September 2015. In service across an entire
national launch fleet, with an uprated variant, a vacuum-optimised variant and a
variant carrying dual roll-control nozzles.

**Performance.** 1,200 kN (270,000 lbf) sea level, 1,340 kN (300,000 lbf)
vacuum. Chamber pressure 18 MPa (**180 bar**, 2,600 psia). Isp 300 s sea level,
335 s vacuum. Expansion ratio 35:1. Mixture ratio 2.6, **adjustable ±10%**.
Throttle 65–105%. Diameter 1.338 m. Burn time ~155 s (estimated).

**Dry mass is not published**, and a thrust-to-weight of ~78–80 that circulates
widely is **not sourced** — do not quote a figure.

**Architecture.** Closed cycle with an **oxidiser-rich** preburner. The turbopump
is **single shaft**, carrying a **single-stage oxidiser pump and a two-stage fuel
pump**. Regenerative cooling with the fuel as coolant. Coaxial injector; chemical
ignition.

**Context.** This engine marks its country's transition from a hypergolic booster
fleet to a cryogenic one, and independent mastery of a cycle that only two other
entities had flown at the time — and it flew nine years before the third did.
Its chamber pressure and Isp trail the leading engine of the same cycle and
propellants by a clear margin; this is a capable second-generation machine, not a
frontier one.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## Exercise 27

**Era.** Development from 1956; first flight in its vehicle 15 November 1960; the
programme ran to 1968. The vehicle was **not a launch vehicle**.

**Performance.** 57,000 lbf (250 kN) maximum. Chamber pressure **600 psia (41.4
bar)**. Isp 279 s vacuum, 239 s sea level. Dry mass 910 lb (413 kg); length
2,083 mm; thrust-to-weight 62:1. Chamber temperature 3,023 K (4,982 °F). Mass
flow over 4,500 kg/min. Burn time ~83 s in the basic vehicle, over 150 s with
external tanks. Expansion ratio **not published**; nozzle exit diameter 998 mm.
Mixture ratio ~1.25, **not published** — low confidence.

**Propellants.** The oxidiser is conventional and cryogenic. The fuel is
**anhydrous liquid ammonia**, chosen for a clean, non-sooting, restartable engine
in a **piloted** vehicle.

**Architecture.** The turbopump is driven by **high-test hydrogen peroxide
decomposed over a catalyst** — a monopropellant steam drive, the same idea as two
much earlier engines in this course, in an engine that is otherwise thoroughly
modern for 1960. Regenerative cooling with the fuel as coolant. Impinging
injector; a spark-ignited, closely sequenced start.

**The quirk.** Throttle **50–100%, continuously variable, commanded by the pilot
with a throttle lever**, plus in-flight shutdown and restart — required, because
the vehicle was air-launched and the pilot managed the energy profile by hand.

**Context.** The first man-rated, throttleable, restartable large liquid rocket
engine. Its operational philosophy — throttle, restart, reuse, inspect, fly again
— is the direct ancestor of every reusable-engine programme since, and it
predates all of them by fifty years. It flew its vehicle past Mach 6.7 and above
100 km.

**Identify:** propellants · cycle · cooling · injector · mission/vehicle class ·
the engine.

---

## Exercise 28

**Era.** Family from 1955–57 for a suborbital test vehicle; the variant described
here flew on a small orbital launcher from 1969. That launcher put a satellite in
orbit on 28 October 1971 — after the programme had already been cancelled. Its
country remains the only one ever to develop an independent orbital launch
capability and then abandon it.

**Performance (the first-stage variant).** **52,785 lbf (234.8 kN)** sea level in
the most-cited source; **222.4 kN (49,998 lbf)** in a second source — a 5%
spread, and the lower figure looks like a rounded 50,000 lbf design value. Isp
265 s vacuum / 251 s sea level. Chamber pressure **47.4 bar (687 psia)**. Burn
time 125 s. Dry mass and expansion ratio are **not published**. The second-stage
variant of the same family gives 64.6 kN sea level / 68.2 kN vacuum from two
chambers with extended nozzles.

**Propellants and mixture ratio.** **Mixture ratio 8:1.** Stop there and think
about what oxidiser has a stoichiometric-ish O/F that high. The answer is that
the "oxidiser" is mostly oxygen *and water* by mass, so most of that 8 is not
doing oxidising work at all.

**Architecture.** **Eight combustion chambers, mounted in pairs on tangential
gimbals** for the first-stage variant. Regenerative cooling with the fuel as
coolant. Gas-generator power cycle.

**The quirk, and it is the whole engine.** The oxidiser is **decomposed over a
silver-plated nickel-gauze catalyst pack**, producing 600 °C steam and oxygen;
the fuel is then injected downstream into that stream and ignites spontaneously.
**There is no igniter and no hypergolic slug — the catalyst pack is the ignition
system.** Nothing else in the reference file has this architecture.

**Context.** **128 engines of this family flew across 26 launches with zero
failures.** The propellant combination is storable, non-cryogenic,
non-hypergolic, and its exhaust is steam and carbon dioxide — properties nothing
else in this course combines. The cost is 250–265 s of Isp, an oxidiser that
decomposes in storage, and a cleanliness requirement so strict that any
contaminant is a catalyst `[Clark]`.

**Identify:** propellants · cycle · cooling · injector and ignition · mission
class · the engine.

---

## Exercise 29

**Era.** Developed in the early-to-mid 1990s for a commercial second stage; first
flight 1998; still flying today on a government heavy-lift upper stage.

**Performance.** 110.1 kN (24,750 lbf) vacuum — two independent sources agree
exactly. Isp **465.5 s vacuum: the highest specific impulse of any flown chemical
rocket engine.** Mixture ratio 5.88:1. Dry mass **301 kg (664 lb)**;
thrust-to-weight ≈37:1. Chamber pressure is **not published** by the manufacturer
or in any fetched secondary; a ~44 bar figure circulates from one aggregator and
should not be printed.

**The contested figure.** Expansion ratio is given as **280:1** in the most-copied
table and as **285:1** in the technical literature on the nozzle itself, which
states the extension raises the ratio **from 77:1 to 285:1**. Use 285:1 deployed
and 77:1 retracted; 280:1 is a rounding. The retracted figure is the more
interesting one — it is what makes the mechanism worth its mass.

**Architecture.** Closed expander. Regenerative tube-wall chamber. Coaxial shear
injector, spark torch igniter, geared single-shaft turbopump — all standard for
its family.

**The quirk.** The nozzle extension is **3D-woven carbon–carbon, radiatively
cooled and entirely uncooled by propellant**, about 2.5 m long with an exit
diameter just over 2.1 m — the largest carbon–carbon extendible nozzle ever
flown. It **translates into place after stage separation** and is worth about 30 s
of Isp. It is also a single-point failure with no meaningful abort mode.

**Identify:** propellants · cycle · cooling (state it separately for chamber and
nozzle) · injector · mission class · the engine. **Then, the discrimination
question:** a later engine from the same family, produced by consolidating two
production lines into one, delivers **22,890 lbf (101.8 kN)** — the manufacturer's
figure; a widely copied table says 22,820 lbf, a 70 lbf difference that is
immaterial in magnitude but should be settled in the manufacturer's favour on
principle — at **449.7 s** with a **fixed 130:1** nozzle and a dry mass of
**190 kg (420 lb)**. Given only Isp, mass and expansion ratio, state the two
sentences of physical reasoning that tell you which of the two engines you are
looking at, and explain why the *lighter* engine has the *lower* specific impulse.

---

## Exercise 30

**Era.** Family from 1973; the variant described here first flew 24 December 1979
on the maiden flight of its country's first orbital launcher, and was retired in
2023 after 44 years of service across four launcher generations. Nearly 300 units
produced.

**Performance.** 62.2 kN (13,980 lbf) vacuum. Isp **444.6 s vacuum**. Expansion
ratio **83.1:1**. Dry mass **165 kg** — remarkably light; thrust-to-weight ≈38:1.
Mixture ratio 5:1. Burn times of 735 s, 780 s and 950 s across successive
applications.

**Chamber pressure.** **3.7 MPa (37 bar, 537 psia)** in the specification table
of the source; the body text of the *same* article says 3.5 MPa. A 5% internal
inconsistency inside one document — use 37 bar and footnote the other, and take
the general lesson that tertiary sources are not self-consistent.

**The question the numbers pose.** 444.6 s at **37 bar**, from an **open cycle
that dumps turbine exhaust overboard**. A modern closed-expander engine of
similar class manages 457 s at 60 bar and a staged-combustion booster engine of
the same propellants manages 455 s at 219 bar. How does an open-cycle engine at
37 bar get within 13 s of them? Answer that before naming it — the answer is
almost entirely in two of the numbers above, and it is the cleanest demonstration
in this course that **upper-stage Isp is dominated by expansion ratio, not
chamber pressure** `[SB][SP-8120]`.

**Architecture.** Gas generator. Regenerative cooling. A single-shaft fuel
turbopump. Injector element type, ignition detail and turbopump speeds are **not
published**.

**The limitation.** **No restart. Single burn only.** That is what forced its
final vehicle into direct high-energy-orbit insertion and what ultimately
motivated its closed-expander replacement.

**Identify:** propellants · cycle · cooling · injector · mission class · the engine.

---

## After you have finished

Three things to check across all thirty, because they are what an interviewer
actually probes:

1. **Did you name the specific cycle variant every time?** Closed expander,
   expander bleed and tap-off appear in this file as distinct engines with
   distinct thrust ceilings. So do fuel-rich and oxidiser-rich staged combustion.
   "Expander cycle" and "staged combustion" are family names, not answers.
2. **Did you attach a caveat to every contested number you quoted?** The chamber
   pressure in Exercise 1, the expansion ratio and dry mass in Exercise 2, the Isp
   in Exercise 21, the expansion ratio in Exercise 29 and the whole of Exercise 5
   are contested or unaudited in the reference file. Quoting one flat is a wrong
   answer even when the number is the one the interviewer had in mind.
3. **Which two were the decoys, and what single clue settled each?** If you did
   not notice them, work back through the file and find the two exercises whose
   engine has a near-twin. Then write the one-sentence discriminator for each.
   That sentence is the exercise.
