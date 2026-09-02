# Engine identification — reveals and reasoning chains

Key to [`engine-identification.md`](engine-identification.md). Thirty engines,
motors and thrusters, each with the six answers, **the chain of inference that
produces them**, and — the part that matters most — a section on the wrong
answers that are *reasonable*, and the single clue that should have stopped you.

**Read the reasoning before the name.** The name is the least valuable line in
every entry below. An interviewer who asks "what engine is this?" has already
decided that the answer is worth about ten seconds; the four minutes afterwards
are spent on *why*, and on whether you know what you ruled out.

## How each entry is laid out

| section | what it is for |
|---|---|
| **Answers** | the six (or, for solids and cold gas, the substituted six) in one table |
| **Chain** | numbered: clue → inference → **what it eliminates**. Each step names the alternative it kills |
| **The decisive clue** | the one line in the exercise that, on its own, closes the identification |
| **If you said …** | plausible wrong answers, why each is a *good* wrong answer, and the clue that should have stopped you |
| **Numbers to carry** | the contested, unpublished or company-claimed figures from [`reference/engine-database.md`](../reference/engine-database.md) that must travel with the answer |

**Every figure below is the engine database's, with the database's caveat
attached.** Where the database says a number is contested, unaudited or not
published, this key says so in the same sentence as the number, because that is
what a correct answer sounds like. Citation tags are those of
[`reference/sources.md`](../reference/sources.md) and of the database's Part E
tag list.

## Scoring your own attempt

Score each exercise out of 10:

| marks | for |
|---|---|
| 2 | propellants, with the clue that forced them |
| 2 | cycle — **the specific variant**, not the family name |
| 1 | cooling, split by station where the exercise splits it |
| 1 | injector architecture |
| 1 | mission class, argued from thrust / Isp / ε / restart, not recognised |
| 1 | the engine |
| 2 | **the ruled-out alternative, named, with the clue that ruled it out** |

The last two marks are the exercise. An answer that names the engine and no
alternative scores 8/10 at best, and in an interview it scores worse than that,
because the interviewer cannot tell whether you reasoned or recognised.

A total below 180/300 means work the tiers again in order. Above 250/300 you are
at Level 3 on hardware and should move to the trade studies.

---

# Tier 1 — Easy (1–10)

## Exercise 1 — Rocketdyne **F-1**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / RP-1**, O/F 2.27 (1,789 kg/s LOX + 788 kg/s RP-1) |
| 2. Cycle | **Gas generator, open, fuel-rich** — with the exhaust used as film coolant rather than dumped to atmosphere through a duct |
| 3. Cooling | **Regenerative tube-wall, 178 brazed Inconel X-750 / Hastelloy tubes**, up-pass/down-pass, in an Inconel jacket with steel bands; **plus GG-exhaust film cooling of the nozzle extension**, which carries no regenerative circuit at all |
| 4. Injector | **Flat-face, mixed doublet and triplet ("5U(f)") pattern, copper baffle assembly dividing the face into 13 compartments** |
| 5. Mission class | **First-stage booster**, sea-level-optimised, single-start, non-throttling, non-restartable |
| 6. The engine | **Rocketdyne F-1** (Saturn V S-IC, five per stage) |

### Chain

1. **6,770 kN sea level with an expansion ratio of 16:1 and Isp 263 s SL.**
   Sea-level-optimised, low ε, mediocre Isp — booster, and a hydrocarbon one.
   *Eliminates:* every hydrolox engine (Isp 263 s SL is 100 s short) and every
   upper stage (ε 16 is a sea-level nozzle).
2. **O/F 2.27.** That is the kerolox band. Hydrolox runs 5–6, storables 1.6–2.7
   but at far lower thrust and with no turbopump of this size.
   *Eliminates:* N₂O₄/Aerozine-50 (the LR87 at O/F 1.91 is the nearest storable
   competitor and is six times smaller per engine).
3. **Single-shaft, direct-drive turbopump, no gearbox, 5,488 rpm, 41 MW.**
   Direct drive at that power is a US 1960s signature; the contemporary
   Rocketdyne H-1 and MA-5 are *geared*, and the later J-2 uses two turbines in
   series. *Eliminates:* the H-1 (geared, 890 kN) and the whole Atlas family.
4. **Turbine exhaust dumped into the nozzle extension as a film curtain.**
   This is the F-1's single most quoted architectural feature and the reason the
   extension needs no regenerative circuit. *Eliminates:* the RS-27/RS-27A and
   every GG engine that vents through a side duct — including, notably, the
   RS-68A, which the same description would otherwise fit at a distance.
5. **13 copper baffle compartments; ~2,000 tests across 210 injector designs;
   bomb-damped within 45 ms.** The 1962–64 injector crash programme and the
   bomb-stability criterion are documented specifically for this engine
   `[SP-194][SP-8113]`.
6. **Never restarted, never recovered; last flight May 1973.** Confirms
   single-use booster.

### The decisive clue

**"The turbine exhaust is dumped into the nozzle extension and used as a
film-cooling curtain."** No other flown engine of this size does that, and it
explains the dark outer sheath of the plume, which is the visual an interviewer
is really testing.

### If you said …

- **"RD-170."** Reasonable: comparable thrust class (7,250 kN SL / 7,900 kN vac),
  kerolox, booster. **What should have stopped you:** *single-shaft direct-drive
  turbopump* and *one chamber*. The RD-170 is four chambers on one turbopump and
  an oxidiser-rich staged-combustion cycle at 245 bar — the F-1's ≈70 bar and
  gas-generator cycle are two orders of architecture away. Also: the F-1 remains
  the highest-thrust **single-chamber** engine ever flown; the RD-170 the
  highest-thrust engine *in total*. Both records are real; state which one you
  mean `[engine-database A.6.4]`.
- **"H-1."** Reasonable: same maker, same propellants, same era, same tube-wall
  regenerative construction, same flat-face impinging injector with baffles.
  **What should have stopped you:** thrust. The H-1 tops out at 912 kN; you are
  looking at seven and a half of them. Also the H-1 is *geared* and uses a
  solid-propellant gas generator spin-start.
- **"F-1A."** Reasonable and nearly right: the uprated F-1A is the same engine
  at 1,800,000 lbf. **What should have stopped you:** "flight rating December
  1964; first flight November 1967; last flight May 1973." The F-1A never flew,
  and the database's rule is that flown and unflown engines never share a column
  `[engine-database A.6.3]`.

### Numbers to carry

- **Chamber pressure is contested four ways:** 965 psia (66.5 bar, older Sutton &
  Biblarz), 982 psia (67.7 bar, NASA-derived documentation), **1,015 psia
  (70.0 bar, the most-copied infobox)**, 1,125 psia (77.6 bar, enginehistory.org,
  which elsewhere calls it a development peak). Quote **≈70 bar at the injector
  end** and footnote 965–1,125 psia. The spread is a measurement-station and
  programme-phase artefact, not a measurement dispute `[F1-R3896][NTRS-20140011656]`
  `[engine-database A.2.2]`.
- Isp 263 s SL / 304 s vac, with enginehistory's 265.4 / 304.1 as the early- versus
  flight-block distinction.
- ε 16:1 including the extension — **undisputed**, and worth saying so, because
  almost nothing else about this engine is.

---

## Exercise 2 — Aerojet Rocketdyne **RS-25** (SSME, Block II)

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2**, O/F **6.03** (the manufacturer rounds to 6.0) |
| 2. Cycle | **Fuel-rich staged combustion, dual-shaft** — two independent fuel-rich preburners, one per turbopump, both exhausting into the main injector |
| 3. Cooling | **Split by construction**: 390 milled channels in the NARloy-Z (Cu–Ag–Zr) main chamber liner with an electroformed-nickel closeout, and a separate 1,080-tube brazed tube-wall nozzle. Both hydrogen-cooled |
| 4. Injector | **Coaxial shear, 600 main elements**, augmented spark igniter at the face centre, **acoustic-resonator cavities machined into the face** for high-frequency stability |
| 5. Mission class | **Reusable sustainer** — burns from liftoff to MECO, throttles, sea-level-capable but vacuum-optimised nozzle; now flown expendably |
| 6. The engine | **RS-25 / Space Shuttle Main Engine, Block II** |

### Chain

1. **452.3 s vacuum Isp.** Only LOX/LH2 reaches the low 450s in a booster-class
   engine. *Eliminates:* every hydrocarbon engine outright.
2. **206.4 bar chamber pressure with 1,860 kN sea-level thrust.** 206 bar is a
   staged-combustion number; no gas generator has ever run a hydrolox chamber
   near it. *Eliminates:* RS-68A (102.6 bar GG), Vulcain 2 (117.3 bar GG),
   J-2 (52.6 bar GG).
3. **Two independent preburners, both fuel-rich, one per turbopump, both
   exhausting into the main injector.** This is the specific variant: fuel-rich
   staged combustion on a **dual-shaft powerhead**. *Eliminates:* RD-0120, which
   is fuel-rich staged combustion on a **single shaft** driving both pumps —
   the discriminator the file returns to in Exercise 23.
4. **Four pumps, LPFTP ~16,185 rpm, LPOTP ~5,150 rpm, three-stage HPFTP at
   ~35,360 rpm delivering 53 MW, two-stage HPOTP at ~28,120 rpm and 17.3 MW.**
   The low-pressure boost stages exist because the tanks cannot supply NPSH at
   206 bar discharge; that is a staged-combustion consequence.
5. **Acoustic resonator cavities in the injector face.** A specific, checkable
   design item — and the thing the RD-0120 is claimed *not* to have needed.
6. **Throttle 67–109 % RPL, ground-tested to 111 %; first flight 12 April 1981;
   still in production, now expendable.** Reusable-sustainer duty cycle.

### The decisive clue

**"Two independent preburners, one per turbopump, both running fuel-rich, both
exhausting into the main injector."** Two preburners and two shafts is the RS-25
fingerprint. One preburner and one shaft is the RD-0120.

### If you said …

- **"RD-0120."** Reasonable, and the intended trap — see Exercise 23, where the
  same pair is worked from the other side. Shared: LOX/LH2, fuel-rich staged
  combustion, regenerative hydrogen cooling, coaxial injector, torch ignition,
  and Isp within 3 s. **What should have stopped you:** the *dual-shaft, twin-
  preburner* powerhead, the *acoustic resonator cavities*, and 206 bar against
  219 bar. The RD-0120 is single-shaft, has no resonators, and flew twice.
- **"J-2 or J-2X."** Reasonable: hydrolox, coaxial, torch, US. **What should
  have stopped you:** 206 bar. J-2 runs 52.6 bar on a gas generator; J-2X 92 bar,
  also gas generator, and never flew.
- **"LE-7A."** Reasonable: fuel-rich staged combustion hydrolox, coaxial, spark
  torch. **What should have stopped you:** thrust and chamber pressure —
  870 kN SL at 120 bar against 1,860 kN at 206 bar, and the LE-7A has *separate*
  turbopumps on a **single** preburner.

### Numbers to carry

- **Expansion ratio is contested three ways:** **69:1** (L3Harris manufacturer
  datasheet, labelled "area ratio"; also the Wikipedia infobox), **77.5:1**
  (NASA/Rocketdyne SSME training material and much of the nozzle-flow
  literature), 78:1 (Wikipedia body text). Quote **69:1 as the geometric area
  ratio** and footnote 77.5:1 — "expansion ratio" is not one unambiguous quantity
  `[L3H][SSME-Orient][SP-8120]` `[engine-database A.2.3]`.
- **Dry mass is contested:** 3,177 kg (7,004 lb, Wikipedia) versus **3,526 kg
  (7,775 lb, L3Harris)** — almost certainly bare versus installed engine (heat
  shield, gimbal bearing, controller). The published **73.1:1 thrust-to-weight
  uses the smaller mass**; on the manufacturer's mass it is **~66:1**. Never
  quote a T/W without saying which mass it used `[engine-database A.2.5]`.
- 2,994 psia / 206.4 bar at 109 % is one of the best-attested numbers in the
  whole reference file — two independent sources agree exactly. Say that too;
  knowing which numbers are *solid* is as much a skill as knowing which are not.

---

## Exercise 3 — Pratt & Whitney **RL10A-3-3A**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2**, O/F **5.0** |
| 2. Cycle | **Closed expander** — not expander bleed, not tap-off. No preburner, no gas generator, nothing dumped overboard; the entire turbine flow is injected and burned |
| 3. Cooling | **Regenerative, brazed stainless-steel tube wall**, hydrogen-cooled — and the cooling circuit *is* the power cycle |
| 4. Injector | **Coaxial shear** — hollow oxidiser post with a concentric fuel annulus; **spark torch** igniter |
| 5. Mission class | **Restartable cryogenic upper stage** (Centaur), vacuum-only |
| 6. The engine | **RL10A-3-3A** — the 1986-service block of the RL10 family |

### Chain

1. **73.4 kN vacuum, Isp 444–445 s, ε 61:1, no sea-level rating.** Vacuum upper
   stage, hydrolox. *Eliminates:* everything sea-level.
2. **Chamber pressure 32.8 bar (475 psia) — and the exercise explains why it is
   structurally capped.** The turbine power available is set by the heat the
   chamber wall can put into the coolant, which scales with wall *area* (≈ D²),
   while thrust scales with *throat* area. That ceiling argument is the
   definition of the **closed** expander. *Eliminates:* gas generator (no reason
   for a 33 bar ceiling), and **expander bleed** — bleed escapes the ceiling by
   dumping part of the flow, which is exactly why the LE-9 reaches 1,471 kN.
3. **"No preburner. No gas generator. Nothing is dumped overboard."** Explicit.
   *Eliminates:* LE-5A/5B and BE-3U (expander bleed), BE-3PM and J-2S (tap-off).
4. **Single shaft with a reduction gearbox** — two-stage centrifugal fuel pump at
   ~31,000 rpm driving a single-stage centrifugal LOX pump through gearing
   `[SP-8100][SP-8107]`. Almost nothing else in the modern liquid world is
   geared. *Eliminates:* Vinci, which is the same cycle with **two separate
   ungeared high-speed turbopumps** — a deliberate departure.
5. **"Family in continuous production for over six decades — the longest service
   life of any rocket engine"; family first flight 1962.** RL10.
6. **The block: 73.4 kN, 444–445 s, ε 61:1, in service 1986 → early 2000s.**
   Within the family that is the **-3-3A**, not the A-4-2 (99.2 kN, 451 s), not
   the B-2 (110.1 kN, 465.5 s, ε 285 deployed), not the C-1 (101.8 kN, 449.7 s,
   ε 130 fixed).

### The decisive clue

**The gearbox.** "Single shaft with a reduction gearbox" plus "closed expander"
plus "first flight engine of its propellant combination, of any kind, anywhere"
is the RL10 and nothing else.

### If you said …

- **"RL10, but not the block."** Half marks in an interview, and honestly said,
  that is a fine answer — the family is the identification, the block is the
  test of whether you can read a rating table. The number that fixes it is
  **73.4 kN at 444–445 s and ε 61**.
- **"Vinci."** Reasonable: closed expander, hydrolox, restartable upper stage,
  regenerative. **What should have stopped you:** the gearbox (Vinci is ungeared,
  two separate turbopumps), 60 bar versus 32.8 bar, 180 kN versus 73.4 kN, and
  ε 240 deployable versus 61 fixed.
- **"LE-5A."** Reasonable: hydrolox upper stage, ~40 bar, mid-450s Isp. **What
  should have stopped you:** LE-5A is **expander bleed** — it dumps its turbine
  flow. "Nothing is dumped overboard" is the whole sentence that separates them.
- **"RD-0146."** Reasonable: closed expander, hydrolox. **What should have
  stopped you:** RD-0146 has never flown, has separate ungeared turbopumps with a
  fuel pump above 120,000 rpm, and an uncooled nozzle extension.

### Numbers to carry

- Dry mass **~136 kg (300 lb), medium confidence**: the manufacturer's own family
  table gives 370 lb for the A-4-2 and 420 lb for the C-1, so the 300 lb figure
  is a family-consistency inference, not a datasheet line `[L3H]`.
- Fuel-pump speed ~31,000 rpm is **medium confidence**.
- The RL10 family table is manufacturer data and is quotable `[L3H]`
  `[engine-database A.2.10]`.

---

## Exercise 4 — SpaceX **Merlin 1D** (sea-level), with the **MVac** variant

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / RP-1** |
| 2. Cycle | **Gas generator, open, fuel-rich**, turbine exhaust vented overboard through a duct — a deliberate simplicity-and-cost choice |
| 3. Cooling | **Regenerative milled channels, RP-1-cooled**, chamber and nozzle; the vacuum variant's extension is **radiatively cooled niobium alloy** |
| 4. Injector | **Pintle** — a single central pintle post, throttleable by geometry, inherently stable |
| 5. Mission class | **Reusable first-stage booster** (nine per stage), with a vacuum-optimised sibling as the single upper-stage engine |
| 6. The engine | **Merlin 1D**, sea-level variant; the vacuum variant is **Merlin 1D Vacuum (MVac)** |

### Chain

1. **845 kN SL / 981 kN vac, Isp 282 s SL / 311 s vac, ε 16:1.** Kerolox booster.
   *Eliminates:* hydrolox (Isp far too low) and storables (a 311 s vacuum
   hypergolic engine of this thrust does not exist).
2. **Open cycle, exhaust vented overboard through a duct, 97 bar.** Gas generator
   — and the exercise says outright that the simplicity is the point, which is
   the same argument the RS-68 makes at a different scale.
   *Eliminates:* every staged-combustion kerolox engine (RD-180 at 267 bar,
   RD-191 at 258 bar, NK-33 at 148 bar, YF-100 at 180 bar).
3. **One shaft carrying both propellant impellers and the turbine, ~36,000 rpm,
   ~7,500 kW.** Single-shaft dual-impeller is a small-engine, low-part-count
   choice. *Eliminates:* RS-68A and Vulcain-style two-turbopump GG layouts.
4. **A single central pintle post, with the lineage traced to a 1960s lander
   engine by a different company** `[Dressler00]`. That lander engine is the
   TRW LMDE of Exercise 9. Only one flown orbital-class booster engine uses a
   pintle. *Eliminates:* every impinging and coaxial engine in the file.
5. **TVC actuators run on fuel tapped from the high-pressure side and returned to
   the low-pressure inlet — no separate hydraulic fluid to run out.**
   A specific, teachable detail `[engine-database A.3.8]`.
6. **"The first orbital-class engine to be routinely recovered and reflown."**

### The decisive clue

**The pintle injector with an explicit 1960s-lander lineage.** Pintle plus nine
engines per first stage plus routine recovery is one engine.

### If you said …

- **"MVac."** Reasonable — the exercise describes both, and the two 981 kN
  figures sit next to each other precisely to catch you. **What should have
  stopped you:** the block described first is rated **845 kN sea level** at
  ε 16:1 and 282 s SL. The MVac has no sea-level rating and ε 165:1. Never place
  the two 981 kN numbers side by side without saying which engine each belongs to
  `[engine-database A.3.1]`.
- **"Rutherford."** Reasonable: kerolox, nine per first stage, one
  vacuum-optimised on the stage above, small, printed, reusable-adjacent.
  **What should have stopped you:** thrust — 24.9 kN versus 845 kN, a factor of
  34 — and the cycle. Rutherford has **no turbine at all**.
- **"RD-107A."** Reasonable if you fixated on "kerolox booster, many per stage".
  **What should have stopped you:** four chambers plus verniers on one
  monopropellant-steam turbopump, and 60 bar.

### Numbers to carry

- **T/W 184:1 is a company claim** — the highest of any flown orbital-class
  engine. It is at least arithmetically plausible (845 kN ÷ 470 kg → 183:1), and
  saying *that* is the right way to handle it.
- **97 bar chamber pressure is a company figure, not independently verified.**
- **Mixture ratio is not published.** ~2.34 circulates without a source; treat as
  unknown.
- **MVac Isp is 348 s vacuum, not 311 s.** A widely copied infobox has carried
  the sea-level engine's 311 s in the MVac's vacuum field, flagged "needs
  update", and the error propagated `[engine-database A.3.2]`.

---

## Exercise 5 — SpaceX **Raptor** (Raptor 2, with Raptor 3 as the third generation)

### Answers

| # | answer |
|---|---|
| 1. Propellants | **Subcooled LOX / subcooled LCH₄ (methane)**, O/F 3.6 (≈78 % O₂ / 22 % CH₄) |
| 2. Cycle | **Full-flow staged combustion (FFSC)** — an oxidiser-rich preburner driving the LOX pump and a fuel-rich preburner driving the methane pump, both exhausts into the main chamber |
| 3. Cooling | **Regenerative milled channels, methane-cooled**; the third generation integrates much secondary plumbing into castings and prints |
| 4. Injector | **Coaxial swirl**, from the second generation onward |
| 5. Mission class | **Reusable booster and (in the vacuum variant) upper stage** for a fully reusable two-stage vehicle |
| 6. The engine | **Raptor 2**, with **Raptor 3** as the third generation |

### Chain

1. **O/F 3.6.** That is the methalox band and essentially nothing else's: kerolox
   sits near 2.3–2.7, hydrolox near 5–6, storables near 1.6–2. *Eliminates:*
   every other propellant combination in the file in one step.
2. **Two mechanically independent turbopumps, one on an oxidiser-rich preburner,
   one on a fuel-rich preburner, both exhausts into the main chamber.** That is
   the definition of full-flow staged combustion: every gram of propellant passes
   through a turbine before it burns. *Eliminates:* ORSC (BE-4, RD-180 — one
   preburner) and FRSC (RS-25, RD-0120 — fuel-rich only).
3. **"Only one Soviet engine (never flown) and one American test article preceded
   this architecture."** RD-270 and the Integrated Powerhead Demonstrator. This
   engine is therefore **the first FFSC engine ever flown** — the one fact in the
   block that depends on no contested number `[engine-database A.3.6]`.
4. **250 → 300 → 330 bar across generations.** If those hold, the highest
   chamber pressure of any production engine, above 267 bar (RD-180) and 206 bar
   (RS-25).
5. **Main-chamber igniter deleted from the second generation** — preburner
   torches light the preburners and hot preburner gas lights the main chamber; no
   pyrophoric slug anywhere, which matters for on-orbit relight.
6. **Both propellants stored subcooled, with densification integral to the
   design** rather than an operational nicety.

### The decisive clue

**Two preburners of opposite mixture ratio, both feeding the main chamber.**
Full-flow staged combustion is a one-engine club among flown hardware.

### If you said …

- **"BE-4."** Reasonable: methalox, ORSC-adjacent, American, new. **What should
  have stopped you:** BE-4 has **one** preburner (oxidiser-rich) driving both
  pumps, runs deliberately low at 140 bar, and is 2,460 kN against 2,256 kN with
  a completely different design philosophy — long life at low pressure, not
  record pressure.
- **"RD-270."** Reasonable, and it is the right architectural ancestor. **What
  should have stopped you:** the RD-270 is N₂O₄/UDMH, Soviet, and **never flew**.
  Naming it as the FFSC precedent is a *good* answer; naming it as this engine is
  not.
- **"Archimedes."** Reasonable: methalox, new, reusable, heavily printed. **What
  should have stopped you:** Archimedes is ORSC, 730 kN, and has not flown.

### The seventh question — what survives if every company figure is 15 % optimistic

**Answers 1, 2, 3, 4 and 5 all survive unchanged, and answer 6 survives.** None
of them depends on a number. Propellants follow from O/F 3.6 and the subcooling
statement; the cycle follows from the two-preburner architecture; cooling,
injector and mission class are architectural statements. What does *not* survive
is every superlative: at 15 % optimistic, 330 bar becomes 280 bar and the
"highest chamber pressure ever" claim falls below the RD-180's 267 bar only in
the sense that it stops being comfortably clear of it; T/W 164 becomes 139 and no
longer stands apart from the NK-33's measured 137:1. **The architecture is
robust; the records are not.** That is the correct shape of the answer.

### Numbers to carry

- **Every performance figure in this exercise is a SpaceX claim.** Thrust,
  chamber pressure, Isp, dry mass and T/W for Raptor 1/2/3 originate from company
  statements, several of them executive social-media posts — the Raptor 2 thrust
  figures trace to an **August 2020 post** `[engine-database A.3.5]`.
- **Independent corroboration exists only for thrust, and only indirectly**, via
  FAA licensing and environmental documents `[FAA-SS]` and third-party analysis
  of flight telemetry and acoustics. **There is no independent verification of
  chamber pressure, Isp, dry mass or T/W at all.**
- The database's confidence label for the whole Raptor block is **LOW–MED [D],
  and that is the point.**

---

## Exercise 6 — NPO Energomash **RD-180**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / RP-1**, O/F **2.72** (73 % oxidiser by mass) |
| 2. Cycle | **Oxidiser-rich staged combustion (ORSC)**, a single ox-rich preburner driving one turbopump that feeds **two combustion chambers** |
| 3. Cooling | **Regenerative, kerosene (fuel) as coolant** |
| 4. Injector | **Coaxial swirl** — Glushko-lineage practice |
| 5. Mission class | **First-stage booster**, single-start, throttleable 47–100 %, gimballed |
| 6. The engine | **RD-180** (Atlas III and Atlas V stage 1, one per vehicle) |

### Chain

1. **3,830 kN SL at 267 bar.** A chamber pressure that high with kerolox is
   staged combustion, and kerolox staged combustion is oxidiser-rich, because a
   fuel-rich kerosene preburner cokes. *Eliminates:* every gas-generator kerolox
   engine (F-1 at ≈70 bar, RS-27A at 48 bar, Merlin at 97 bar).
2. **"Derived in the early-to-mid 1990s from a larger engine of the same family
   by halving it," and ε 36.87:1 *identical* to the parent because the chambers
   are the same part number.** The parent is the RD-170 family; halving four
   chambers gives two. *Eliminates:* RD-191 (one chamber, the further halving)
   and RD-170/171 (four).
3. **Two combustion chambers on one turbopump.** The Glushko multi-chamber
   architecture, adopted because Glushko could not solve combustion instability
   in a single large chamber `[engine-database A.6.5]`.
4. **An inert enamel coating on every metal surface in contact with hot
   oxygen-rich gas.** This is the enabling materials technology of ORSC and the
   reason the West could not copy the cycle for thirty years even after it was
   openly described `[SLPRE][Clark]`.
5. **Chemical ignition — a hypergolic starter fluid, not a spark and not a
   pyrophoric cartridge.** Russian ORSC practice.
6. **"The first engine of its nation ever certified for another nation's
   national-security launch"; deliveries ended 2021 for geopolitical reasons.**

### The decisive clue

**"Two combustion chambers" plus "expansion ratio identical to the parent
because the chambers are the same part number."** That sentence is the RD-180's
whole design history in one line: it is half an RD-170.

### The sibling question

**RD-191.** It shares the cycle (ORSC, single ox-rich preburner), the
propellants (LOX/RP-1), the injector (coaxial swirl), the cooling (regenerative,
kerosene), and:

| quantity | RD-180 | RD-191 | gap |
|---|---|---|---|
| chamber pressure | 267 bar `noz`† | 258 bar `noz`† | 3.4 % — inside 4 % |
| expansion ratio | 36.87:1 | 37:1 | 0.35 % — inside 0.5 % |
| vacuum Isp | 338 s | 337 s | 1 s |

**The two figures that separate them are thrust and dry mass:** 3,830 kN SL and
5,480 kg for the RD-180 against **1,920 kN SL and 2,290 kg** for the RD-191 —
i.e. the RD-191 is one chamber, not two, and it shows up as a clean factor of
two in both columns. The consequential difference is T/W: 78.4:1 versus 89:1, and
the RD-191's throttle range (27–105 %) is far wider.

### If you said …

- **"RD-170 / RD-171."** Reasonable: same family, same cycle, same chambers,
  same ε. **What should have stopped you:** 3,830 kN is half of 7,250 kN, and
  the exercise says the engine was made by halving a larger one.
- **"NK-33."** Reasonable: Soviet-heritage kerolox ORSC booster engine.
  **What should have stopped you:** 148.3 bar versus 267 bar, single chamber,
  a *different bureau* (Kuznetsov, an aircraft-engine house, not Energomash),
  and bearings that run in the LOX flow.
- **"YF-100."** Reasonable: kerolox ORSC, single-shaft, coaxial, chemical
  ignition. **What should have stopped you:** 180 bar, 1,200 kN SL, one chamber,
  and a first flight in 2015 rather than 2000.

### Numbers to carry

- **267 bar is quoted at nozzle stagnation**, Soviet/Russian convention, while US
  Apollo-era practice quotes injector-end, typically a few percent higher.
  Comparing 267 bar directly against the RS-25's 206 bar `inj` overstates the gap
  slightly, and a correct answer says so `[engine-database A.6, note on
  conventions]`.
- **Turbopump shaft power is not published.** The parent RD-170's figure is
  contested between ~170 MW (article body) and 192 MW (specification table)
  *inside a single article*; quote "approximately 170–190 MW" for the parent and
  "roughly half, not published" for this engine `[engine-database A.6.1]`.

---

## Exercise 7 — **Space Shuttle SRB / RSRM**

### Answers (solid substitution)

| # | answer |
|---|---|
| 1. Propellant family | **PBAN-bound ammonium-perchlorate / aluminium composite (APCP)**: AP 69.6 %, Al 16 %, Fe₂O₃ 0.4 %, PBAN 12.04 %, epoxy curing agent 1.96 % |
| 2. Grain geometry rationale | **11-point star in the forward segment, double-truncated-cone in the aft segments.** The star gives a large initial burning area that regresses, producing a head-end regressive-then-neutral thrust trace that unloads the vehicle through max-Q |
| 3. Case construction | **D6AC high-strength low-alloy steel**, ~12.7 mm nominal membrane wall; **11 casting segments assembled into 4 flight segments joined by 3 field joints**, with factory joints inside each flight segment |
| 4. Nozzle and TVC | **Submerged, ablative carbon-phenolic and silica-phenolic liners on a steel/composite shell, flexible-bearing (flexseal) gimbal, ±8° pitch and yaw**, two hydraulic actuators fed by two hydrazine APU/HPUs per booster |
| 5. Mission class | **Recoverable strap-on booster for a crewed vehicle**, two per stack, burning in parallel with the core from liftoff |
| 6. The motor | **Space Shuttle SRB**, post-Challenger **RSRM** redesign; the five-segment derivative is the **SLS RSRMV** |

### Chain

1. **14.7 MN per motor at sea level, ≈123–124 s burn, ~500,000 kg propellant.**
   Large segmented solid, launch-vehicle class. *Eliminates:* every liquid engine
   and every monolithic composite motor (P120C is 4.78 MN).
2. **Steel case, 11 casting segments into 4 flight segments, 3 field joints.**
   Segmentation exists for one reason: cast in Utah, ship by rail, assemble in
   Florida. *Eliminates:* P120C, GEM and Zefiro (monolithic filament-wound, no
   field joints).
3. **Forward 11-point star, aft double-truncated-cone.** Published grain geometry,
   specific to this motor.
4. **The tang-and-clevis field joint with two fluorocarbon O-rings that
   *rotated* under ignition pressure**, and the redesign that added a **capture
   feature**, a **third O-ring** on it, revised joint insulation and **joint
   heaters** `[Rogers86]` `[engine-database B.1.6]`.
5. **First flight 12 April 1981; redesigned version first flew 29 September 1988
   after a loss-of-crew accident; last flight 8 July 2011.**

### The decisive clue

**"The joint rotated."** The tang-and-clevis rotation mechanism, and the capture
feature that fixes it, belong to exactly one motor.

### Why the 0.85 mass fraction explains the architecture

**Because a steel segmented case is heavy, and the whole motor is shaped by
paying for that.** Propellant mass fraction ≈0.85 against **0.924** for the
monolithic filament-wound P120C means roughly 6 % of gross mass is thrown away as
inert structure that a composite motor would not carry — about 40 t per booster.
The steel is not there for strength per kilogram; it is there because segments
must survive rail transport, stacking, field-joint assembly, water impact,
recovery and refurbishment. Every one of those requirements is downstream of the
decision to cast in one place and fly from another, and every one of them costs
mass fraction. State it as: **the field joint is the mass fraction**
`[engine-database B.1.7]`.

### If you said …

- **"SLS RSRMV."** Reasonable — same propellant chemistry, same steel cases
  (refurbished Shuttle-era D6AC), same TVC heritage. **What should have stopped
  you:** four flight segments and three field joints. The RSRMV has **five**
  segments, a new nozzle, asbestos-free insulation, no parachutes and no
  recovery, and a 126 s burn (not 123–124 s) `[engine-database B.1.3, B.1.8]`.
- **"Ariane 5 EAP (P238/P241)."** Reasonable: large segmented steel booster, two
  per vehicle, flexseal nozzle. **What should have stopped you:** three segments
  bolted together, HTPB binder (AP 68 / Al 18 / HTPB 14), ε 9.7→11.0, TVC to
  7.3°, ~6,650–7,080 kN per motor, and no crewed vehicle and no O-ring accident.
- **"Titan UA1205/SRMU."** Reasonable: segmented US solid. **What should have
  stopped you:** thrust class and the 1981/1988/2011 dates — and the database
  warns that every Titan solid number is confidence C and unfit to tabulate
  `[engine-database B.2]`.

### Numbers to carry

- **Composition is contested by 0.2 percentage points**: AP 69.6 / Fe₂O₃ 0.4
  (NASA fact sheet) versus AP 69.8 / Fe₂O₃ 0.2. Both sum to 100. The point is not
  the rounding — **iron oxide is a burn-rate catalyst**, so 0.2 points of it is a
  several-percent change in burn rate and therefore in chamber pressure and
  thrust trace `[engine-database B.1.1]`.
- **Case wall 12.7 mm nominal membrane**; the "~2 cm" figure in circulation is
  plausibly a local thickness at a joint `[engine-database B.1.2]`.
- **Expansion ratio 7.72 early, 7.16 later — both real, the nozzle changed.**
- Mass fraction ≈0.85 is `CALC` from the published masses, not a sourced figure.

---

## Exercise 8 — **SAFER** (performance block) and **MMU** (contrast block)

### Answers (cold-gas substitution)

| # | answer |
|---|---|
| 1. Working fluid | **Gaseous nitrogen (GN₂)**, M = 28.014 kg/kmol, γ = 1.400, stored at 224 bar |
| 2. "Cycle" | **There is none.** A blowdown or regulated high-pressure gas store takes the place of a power cycle: the stored pressure *is* the energy source, and the only machinery is a valve |
| 3. Thermal management | **None active.** The gas cools on expansion; the hardware is thermally massive relative to a millisecond pulse, and the resulting wall heat transfer *into* the flow is a large part of why realised Isp is so far below ideal |
| 4. Thruster / valve architecture | **24 fixed thrusters** on a rigid backpack, solenoid-actuated poppet valves, pulse-mode operation, small low-expansion nozzles |
| 5. Mission class | **EVA crew self-rescue** — single-use Δv budget, not a manoeuvring unit |
| 6. The devices | Performance block: **SAFER (Simplified Aid For EVA Rescue)**. Contrast block: **MMU (Manned Maneuvering Unit)** |

### Chain

1. **M = 28.014, γ = 1.400.** Nitrogen exactly. *Eliminates:* helium (4.003,
   γ 1.667), butane, R-236fa, CO₂.
2. **1.4 kg of propellant, 3.05 m/s of Δv, 37.7 kg system mass, 24 thrusters,
   224 bar.** Small, single-purpose, human-scale.
3. **The implied Isp works out to ≈40 s** against an ideal frozen-flow 76.8 s for
   N₂ at ε = 50 and T₀ = 300 K — *less than 60 % of what the gas is worth*
   `[CALC]`. That is credible and it is the exercise: a small, low-ε thruster
   fired in millisecond pulses loses most of its ideal performance to wall heat
   transfer, non-equilibrium expansion, and dead volume in the valve and plenum
   `[engine-database C.2.2]`.
4. **The predecessor: 1984, three flights, 5.9 kg per tank in two
   Kevlar-overwrapped aluminium tanks, 148 kg loaded, 24 nozzles in four clusters
   of six giving 6-DOF.** That is the MMU.
5. **"Get back to the handrail, once."** The entire specification of the later
   device follows from one sentence of requirement.

### The decisive clue

**The arithmetic.** 3.05 m/s × ~180 kg ÷ (1.4 kg × 9.80665) ≈ 40 s. You are meant
to do the division, notice it is far below ideal, and *not* conclude that the
numbers are wrong.

### Why the MMU's numbers do not close — and why that is the answer

11.8 kg of GN₂ at a realistic 70 s Isp gives ~8,100 N·s. Against ~340 kg of
system-plus-suited-crew that is **~24 m/s, not the published 33.5–39.6 m/s**.
Working the published Δv backwards implies **Isp ≈ 100 s, which is too high for
GN₂ under any conditions.** Either the quoted Δv assumes a lighter reference mass
(the MMU alone, 148 kg, gives ~55 m/s) or the tank load is larger than published.
**The worksheet flags this as unresolved and recommends SAFER as the honest
worked example** precisely because SAFER's implied Isp is credible
`[SAFER95][engine-database C.2.1, C.2.2]`.

The correct interview answer is not "the MMU had about 36 m/s". It is: *"the
published MMU Δv cannot be reconciled with the published propellant load without
knowing the reference mass, and here is the arithmetic."*

### If you said …

- **"The Gemini HHMU."** Reasonable: EVA, cold gas, hand-held, first EVA
  manoeuvring device. **What should have stopped you:** three nozzles, ~3.1 kg,
  oxygen on the Gemini 4 unit, and 1965. Its lesson is control authority — a
  thruster whose line of action misses the combined centre of mass produces a
  torque, and White reported exactly that `[engine-database C.2.6]`.
- **"MarCO MiPS."** Reasonable: small cold-gas system with a ~40 s realised Isp.
  **What should have stopped you:** MarCO is R-236fa, self-pressurising at
  ~2.7 bar, 8 thrusters, on a 6U CubeSat — not 224 bar nitrogen on a backpack.
- **"A Falcon 9 GN₂ ACS."** Reasonable: GN₂, cold gas, clusters. **What should
  have stopped you:** the database's rule that **no performance numbers for that
  system should be quoted at all** — SpaceX does not publish them
  `[engine-database C.2.3]`.

### Numbers to carry

- **Thrust per thruster is not published for either device.** SAFER's ≈3.6 N
  (0.8 lbf) and the MMU's ≈7.6 N are *derived*, not sourced, and both are on the
  database's do-not-print list `[engine-database C.2.8]`.
- The MMU ground-charge Δv of 33.5–39.6 m/s is published (confidence A) and
  **still does not close** — publication and consistency are different things.
- Ideal N₂ Isp at ε = 50, T₀ = 300 K is **76.8 s** and is `CALC`, reproducible
  from the stated method; ε = 20 gives 75.1 s and ε = 100 gives 77.8 s. **Any
  published cold-gas Isp is meaningless without T₀ and ε.**

---

## Exercise 9 — TRW **LMDE** (Apollo Lunar Module Descent Propulsion System)

### Answers

| # | answer |
|---|---|
| 1. Propellants | **N₂O₄ / Aerozine 50**, O/F 1.6 — hypergolic and storable |
| 2. Cycle | **Pressure-fed**, using **supercritical cryogenic helium** stored cold and dense to save tank mass, then warmed to pressurise `[SP-8112]` |
| 3. Cooling | **Ablative chamber with a radiatively cooled skirt** |
| 4. Injector | **Variable-area pintle** — a movable sleeve varies injection area with flow, holding injection velocity and mixing quality roughly constant across a 10:1 throttle range |
| 5. Mission class | **Crewed planetary lander descent stage**, deep-throttling, multi-restart |
| 6. The engine | **TRW LMDE / Descent Propulsion System** |

### Chain

1. **Isp 311 s at full thrust with no igniter needed at all.** Hypergolic
   storables. *Eliminates:* cryogens (no igniter would be a fantasy) and
   monopropellants (225 s class).
2. **110 psia (7.6 bar) at 100 % and 11 psia (0.76 bar) at 10 % — a 10:1
   chamber-pressure turndown.** Nothing pump-fed does that, and no fixed-area
   injector survives it: at fixed area, a 10:1 flow turndown drops injector
   Δp by a factor of 100, so Δp/p_c collapses, the injector stops decoupling the
   feed system from the chamber, and the engine goes unstable long before you
   reach 10 %. *Eliminates:* every fixed-orifice injector and every turbopump
   architecture. **This is the single best clue in the whole file.**
3. **No turbopump; supercritical cryogenic helium pressurisation.** Pressure-fed,
   and a specific, unusual pressurant choice.
4. **Variable-area pintle, ε 47.5:1 early and 53.6:1 later, up to four restarts,
   dry mass 179 kg.** Small vacuum lander engine.
5. **"The 60–100 % band was operationally prohibited because of nozzle
   erosion."** A detail that is frequently omitted and should not be.
6. **"It performed its intended job six times, and on one flight performed a
   mid-course correction and free-return burn it was never designed for."**
   Apollo 13.

### The decisive clue

**110 psia to 11 psia.** State the number, then state what it demands: a
*variable-area* injector. The two go together, and the engine follows.

### If you said …

- **"Merlin 1D."** Reasonable, and it is the descendant — SpaceX traces the
  pintle lineage directly to this engine `[Dressler00]`. **What should have
  stopped you:** 1964–1972, hypergolic, pressure-fed, 46.7 kN, ablative. The
  ancestor and the descendant share one component and nothing else.
- **"SuperDraco."** Reasonable: MMH/NTO, pressure-fed, throttleable 20–100 %,
  crewed. **What should have stopped you:** 71 kN each at **69 bar** chamber
  pressure, regeneratively cooled, 3D-printed Inconel, ~25 s burn. SuperDraco is
  a high-pressure abort engine, not a 7.6 bar lander engine.
- **"LM Ascent Engine (APS)."** Reasonable: same vehicle, same propellants, same
  pressure-fed helium architecture, same era. **What should have stopped you:**
  the APS is **fixed thrust, non-gimballed, 15.6 kN**, with a Rocketdyne
  **baffled impinging** injector supplied after Bell could not solve combustion
  instability. Not throttleable at all `[engine-database A.8.4]`.
- **"Rocketdyne AR2-3."** Reasonable if you keyed on "50–100 % throttle". **What
  should have stopped you:** the AR2-3 throttles by **turbopump speed** (a single
  lever on the gas-generator oxidiser flow), the exact opposite architecture, and
  it is an HTP/JP-4 aircraft engine `[engine-database A.9.5]`.

### Numbers to carry

- This is **one of the best-documented blocks in the reference file
  (confidence A)** — say so; it is unusual.
- ε **47.5:1 (Apollo 14 and earlier) and 53.6:1 (Apollo 15 and later)**; the
  extended nozzle for the J-mission landers was long enough that it crushed on
  landing.
- The 60–100 % prohibition is part of the specification, not trivia.

---

## Exercise 10 — **V-2 / A-4** (Model 39)

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / 75 % ethanol – 25 % water**, O/F ≈1.18. The water is a combustion- and wall-temperature moderator, not ballast |
| 2. Cycle | **Gas generator of the monopropellant-steam type** — 80 % hydrogen peroxide decomposed over a sodium/potassium permanganate catalyst drives a **steam** turbine. Not a bipropellant gas generator |
| 3. Cooling | **Regenerative double-wall mild-steel jacket plus four rings of film-cooling holes injecting ~10 % of the fuel along the wall** — and the film cooling does most of the work, because the jacket alone was insufficient |
| 4. Injector | **18 pot-type pre-mixing "burner cup" heads** in two concentric circles on a domed plate, each a miniature centrifugal-swirl injector |
| 5. Mission class | **Single-stage ballistic missile booster**, ~60 s burn, no restart, no throttle |
| 6. The engine | **V-2 / A-4 Model 39** |

### Chain

1. **Fuel deliberately diluted with 25 % water as a temperature moderator.**
   Only one engine family in the file does this, and it tells you the cooling was
   marginal. *Eliminates:* every later alcohol engine that dropped the water or
   moved to hydrocarbons.
2. **Chamber pressure 15.2 bar, ε ~3.5:1 through a 15° conical nozzle, Isp
   ~203 s SL.** 1940s state of the art. *Eliminates:* everything post-1950.
3. **Peroxide-over-permanganate steam turbine, single shaft, back-to-back
   centrifugal pumps, 4,000 rpm, ~430 kW.** This drive appears again on the
   Redstone A-7, the RD-107A and (over a catalyst rather than permanganate) the
   XLR99 and AR2-3 — so the drive alone does not identify the engine.
4. **18 pot-type pre-mixing burner cups on a domed plate.** This is the
   identifying feature: it is why the chamber is nearly spherical, why it was a
   manufacturing nightmare, why c* efficiency was only ~94 %, and why chamber
   pressure was capped. *Eliminates:* the Rocketdyne XLR43-NA-1 and A-7, which
   are the direct descendants and whose **break from Germany was precisely the
   move to a flat-face injector with concentric rings of drilled holes in an
   F-O-F impinging triplet**.
5. **First successful flight 3 October 1942; operational September 1944 – March
   1945.**

### The decisive clue

**The 18 burner cups.** If you know one thing about this engine's injector, it is
that it was not a flat face — and the flat face is what everyone who copied it
did next.

### If you said …

- **"Redstone A-7 / XLR43-NA-1."** Reasonable, and it is the closest relative in
  the file: same propellants (75 % ethanol–water), same peroxide-permanganate
  steam turbine, same double-wall regenerative-plus-film cooling, same single
  shaft. **What should have stopped you:** the injector, and the numbers. The
  A-7 runs 21.9 bar, ε 3.61, Isp 235 s SL, 369 kN, with a **flat-face impinging**
  injector; the V-2 runs 15.2 bar, ε ~3.5, ~203 s, ~245 kN with burner cups. If
  you wrote "either the V-2 or its American derivative, and the injector settles
  it" you have written the best available answer.
- **"RD-107A."** Reasonable: monopropellant-steam gas generator, still in
  production, kerolox-adjacent. **What should have stopped you:** RD-107A is
  LOX/RG-1 kerosene at 60 bar with **four main chambers plus two verniers** on
  one turbopump, and it first flew in 1957.

### Numbers to carry

- **Isp ~203 s SL / ~239 s vac is medium confidence**, reconstructed from a
  quoted 2,000 m/s effective exhaust velocity; secondary tables spread across
  199–210 s at sea level.
- **O/F ≈1.18 with sources spread to 1.25 — low confidence on the second
  decimal.**
- Chamber pressure is flagged `inj`† — the station is *inferred* from the
  national-convention rule, not stated per-engine by a source.

---

# Tier 2 — Medium (11–22)

## Exercise 11 — Rocketdyne **J-2**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2**, nominal O/F **5.5** |
| 2. Cycle | **Gas generator**, dumping 2–3 % of propellant overboard |
| 3. Cooling | **Regenerative brazed tube wall, fuel-cooled**; plus **transpiration cooling of the injector face** through a porous sintered stainless faceplate |
| 4. Injector | **Coaxial shear — 614 hollow oxidiser posts with concentric fuel annuli**, firing through a **porous sintered stainless-steel faceplate**; augmented spark igniter with dual plugs at the centre |
| 5. Mission class | **Restartable cryogenic upper stage** — vacuum-only, one per S-IVB and five per S-II |
| 6. The engine | **Rocketdyne J-2** |

### Chain

1. **Nominal mixture ratio 5.5:1, shiftable 4.5–5.5 by a propellant utilisation
   valve.** Only hydrolox plausibly runs a *nominal* 5.5. *Eliminates:* kerolox
   (2.2–2.7) and storables (1.6–1.9).
2. **1,033.1 kN vacuum, 421 s vacuum, no sea-level rating, ε only 27.5:1
   constrained by the interstage.** Upper stage; and 421 s is well below what a
   closed cycle gives at this size, so the cycle throws performance away.
   *Eliminates:* closed expander (RL10 at 444 s), staged combustion.
3. **"The cycle dumps 2–3 % of the propellant overboard."** Gas generator,
   explicitly. *Eliminates:* expander bleed (which dumps a heated *coolant* flow,
   not gas-generator products) and tap-off.
4. **Two independently driven pumps in series on one exhaust stream — a 7-stage
   axial fuel pump at 27,000 rpm and a single-stage centrifugal oxidiser pump at
   8,600 rpm, the gas passing through the fuel turbine first.** The series
   arrangement makes the mixture ratio partly self-regulating `[SP-8107][SP-8110]`.
   An **axial** fuel pump is a strong marker; the J-2X deliberately replaced it
   with a centrifugal one.
5. **614 coaxial posts through a porous sintered transpiration-cooled
   faceplate** `[SP-8089]` — the archetype essentially every later hydrolox
   engine copies.
6. **Restartable in vacuum with a separate ambient-helium start tank and settling
   motors**, and an uprated version that reached 1,138.5 kN and 436 s by
   **replacing the gas generator with a tap-off from the main chamber** and never
   flew. That is the J-2S.

### The decisive clue

**The 7-stage axial fuel turbopump with the two turbines in series.** No other
flown hydrolox engine has an axial fuel pump feeding a series gas path.

### If you said …

- **"J-2S."** Reasonable — it is described in the last paragraph. **What should
  have stopped you:** the exercise gives 1,033.1 kN and 421 s as *the* engine's
  rating and describes the tap-off version as an uprate that "never flew". Flown
  and unflown engines never share a column `[engine-database A.6.3]`.
- **"J-2X."** Reasonable: same designation family, hydrolox, gas generator, 5.5
  mixture ratio, coaxial, augmented spark igniter. **What should have stopped
  you:** J-2X runs 92 bar with ε 92:1 and a **centrifugal** fuel pump and a
  **milled-channel** chamber, gives 448 s, and **never flew** (idle after 2014)
  `[engine-database A.2.6]`.
- **"RL10."** Reasonable: hydrolox restartable upper stage, coaxial, torch.
  **What should have stopped you:** 1,033 kN versus 73.4 kN, 52.6 bar versus
  32.8, gas generator versus closed expander.

### Numbers to carry

- The **PU valve range 4.5–5.5** trades thrust **780–1,000 kN** against Isp — it
  is used both to burn both tanks dry simultaneously and to manage stage
  acceleration. Quoting "J-2 thrust" without the mixture ratio is incomplete.
- Confidence on this block is **high [A]**; the J-2S row is explicitly marked
  *do not table with flight values*.

---

## Exercise 12 — Aerojet Rocketdyne **RS-68A**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2** |
| 2. Cycle | **Gas generator**, open, exhaust dumped through a side duct — chosen explicitly over staged combustion **for cost**, with ~80 % fewer parts than the RS-25 |
| 3. Cooling | **Split: regenerative hydrogen channels in a copper-alloy main chamber wall + an ablative silica/carbon-phenolic nozzle** that chars and erodes through the burn |
| 4. Injector | **Coaxial**, redesigned between the RS-68 and the RS-68A for mixing efficiency |
| 5. Mission class | **First-stage booster** (common booster core), single-start, expendable |
| 6. The engine | **RS-68A** (baseline: RS-68) |

### Chain

1. **3,137 kN SL / 3,560 kN vac at 411.9 s vacuum.** Hydrolox booster, large.
   *Eliminates:* kerolox (Isp far too high) and storables.
2. **Isp ~40 s below what the same propellants achieve in a staged-combustion
   engine of similar size, and ε only 21.5:1.** Both follow from the same two
   decisions: an **open cycle** (throwing away turbine flow) and an **ablative
   nozzle** (mass-limited, so it must be short). *Eliminates:* RS-25 (452.3 s,
   ε 69), RD-0120 (455 s, ε 85.7).
3. **Chamber pressure 102.6 bar for both blocks**, with the uprate coming from
   ~5 bar more Pc plus a redesigned injector — a rare case of a published
   performance delta being *explained*. *Eliminates:* staged combustion at any
   scale.
4. **Thrust-to-weight 47:1, the lowest of any modern large booster engine.** The
   direct price of design-for-cost.
5. **The bright orange plume from ablated carbon reacting with atmospheric
   oxygen, and the pre-ignition hydrogen bloom that scorches the vehicle** —
   both cosmetic, both alarming, both normal.
6. **Baseline first flight 20 November 2002; uprated block in service 2012; last
   flight 9 April 2024.** Delta IV Heavy's final flight.

### The decisive clue

**An ablative nozzle on a hydrolox booster engine.** Nothing else of that size
does it, and it is what forces both ε 21.5 and the reusability dead end.

### If you said …

- **"RS-68 (baseline)."** Reasonable and nearly right. **What should have
  stopped you:** the exercise gives 3,137 / 3,560 kN and 411.9 s and says "the
  uprated block described here entered service in 2012". The RS-68 is
  2,950 / 3,370 kN at 365 s SL / 410 s vac and T/W 45.3.
- **"Vulcain 2."** Reasonable: hydrolox gas generator, first-stage, European
  equivalent role, ~1,359 kN. **What should have stopped you:** thrust (a factor
  of 2.6), Pc 117.3 bar versus 102.6, ε 58.2 versus 21.5, and a **regenerative
  tube-wall** nozzle with turbine-exhaust film cooling rather than an ablative
  one.
- **"LE-9."** Reasonable: large hydrolox, ~426 s, low-ish pressure, low part
  count. **What should have stopped you:** LE-9 is **expander bleed** — no gas
  generator anywhere — at 100 bar and 1,471 kN.

### Numbers to carry

- **Mixture ratio is not published in any fetched source.** ~6.0 circulates;
  treat as unknown.
- **Turbopump speeds and shaft powers are not published.**
- The RS-68 → RS-68A pair is the file's clearest counter-example to the
  assumption that engine development should maximise performance
  `[engine-database A.2]`.

---

## Exercise 13 — ArianeGroup **Vulcain 2**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2**, O/F **6.1** |
| 2. Cycle | **Gas generator** — Europe deliberately did not attempt staged combustion for Ariane 5 |
| 3. Cooling | **Regenerative tube wall, plus film cooling added to the lower nozzle by injecting turbine exhaust**, needed because the higher chamber pressure and richer mixture raised wall heat flux |
| 4. Injector | **Coaxial shear** (LOX post / H₂ annulus) |
| 5. Mission class | **Core-stage sustainer**, ground-started, **no restart** |
| 6. The engine | **Vulcain 2**; the predecessor is **Vulcain 1**, the simplified successor **Vulcain 2.1** |

### Chain

1. **1,359 kN vacuum at 117.3 bar, 429 s vacuum, ε 58.2:1.** Hydrolox,
   core-stage class. *Eliminates:* hydrocarbons.
2. **The paradox: the predecessor ran 100 bar with ε 45.1 and delivered 431 s —
   *higher* Isp than this engine.** The cause is the mixture ratio, 5.3 → **6.1**,
   which trades Isp for propellant density and thrust and is also the single
   biggest source of the thrust uprate. **The optimum mixture ratio for an
   *engine* is not the optimum for a *vehicle*** `[SB][CEA]`
   `[engine-database A.4.2]`. That paradox is specific to this pair.
3. **Two separate turbopumps on one common open-cycle gas source**, with
   published speeds and powers for the predecessor (LOX 13,600 rpm / 3 MW; LH2
   34,000 rpm / 12 MW). Gas generator, two pumps. *Eliminates:* staged
   combustion, expander, tap-off.
4. **Film cooling of the lower nozzle by turbine-exhaust injection** — added on
   this block specifically.
5. **Ground-start only; the engine does not restart**, which forced its vehicle
   to carry a separate storable upper stage for anything beyond direct injection.
6. **The successor: 90 % fewer parts, 40 % lower cost, 30 % faster to produce,
   by laser-welded sandwich nozzle construction, first flight 9 July 2024, with
   *slightly lower* thrust.** That is Vulcain 2.1 at 1,324 kN.

### The decisive clue

**The Isp paradox with the mixture ratio as its cause.** 100 bar → 117.3 bar,
ε 45.1 → 58.2, and Isp *falls* 431 → 429 s. Only a mixture-ratio change does
that, and only one engine pair in the file is documented this way.

### If you said …

- **"Vulcain 1."** Reasonable: it is the predecessor and the exercise describes
  it. **What should have stopped you:** the block described first flew 12
  February 2005 and last flew 5 July 2023, at 117.3 bar and 429 s. Vulcain 1 is
  100 bar, 431 s, ε 45.1, retired 2009.
- **"Vulcain 2.1."** Reasonable: it is the successor. **What should have stopped
  you:** 2.1 first flew 9 July 2024, runs 120.8 bar, gives 1,324 kN — *lower* —
  and its vacuum Isp is not separately published.
- **"LE-7A."** Reasonable: hydrolox core engine, ~1,100 kN, ~120 bar, coaxial,
  regenerative. **What should have stopped you:** LE-7A is **fuel-rich staged
  combustion** at 440 s, not a gas generator at 429 s, and it has a published
  sea-level rating (870 kN) whereas this engine's is not separately published.

### Numbers to carry

- **117.3 bar; "115 bar" in secondary summaries is a rounding, not a
  disagreement** `[engine-database A.4.1]`.
- **Sea-level thrust is not separately published**; the commonly cited ~960 kN
  should be treated as unverified.
- **Turbopump speeds for this block (~12,300 and ~36,500 rpm) are medium
  confidence**, from a secondary summary of the AIAA development paper
  `[engine-database A.4.7]`.

---

## Exercise 14 — ArianeGroup **Vinci**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2**, O/F **6.1** — internally confirmed by the published flows (34.1 kg/s LOX, 5.59 kg/s LH2 → 6.10) |
| 2. Cycle | **Closed expander** — not expander bleed, not tap-off. All the turbine flow is subsequently burned in the chamber, which is what caps chamber pressure at 60 bar |
| 3. Cooling | **Regenerative, smooth-wall chamber with high-speed milled channels**, hydrogen-cooled; the cooling circuit *is* the power cycle |
| 4. Injector | **Coaxial**; spark torch ignition |
| 5. Mission class | **Restartable cryogenic upper stage**, vacuum-only, long-burn |
| 6. The engine | **Vinci** (Ariane 6 upper stage) |

### Chain

1. **457.2 s vacuum at ε 240:1 with a deployable extension.** Hydrolox upper
   stage, high expansion. *Eliminates:* everything sea-level and every
   hydrocarbon.
2. **"No preburner and no gas generator anywhere in the main power path. The
   cooling circuit *is* the power cycle, and all of the turbine flow is
   subsequently burned in the chamber."** That last clause is the discriminator
   between **closed expander** and **expander bleed**: bleed dumps its turbine
   flow overboard. *Eliminates:* LE-5A/5B, LE-9, BE-3U (all bleed) and BE-3PM,
   J-2S (tap-off).
3. **60 bar, and the exercise says the cycle caps it there.** Consistent with the
   closed-expander heat-balance ceiling — and at 180 kN this is by a wide margin
   the highest-thrust example of the *exact* cycle ever flown, which is the
   ceiling being approached, not escaped.
4. **Two separate high-speed turbopumps, not geared — a deliberate departure from
   the older engine that pioneered this cycle.** That older engine is the RL10.
   *Eliminates:* the RL10 family itself.
5. **~550 kg total, 160 kg excluding the nozzle — the nozzle is ~70 % of engine
   mass.** A striking, memorable, and identifying figure.
6. **Multi-restart from an auxiliary propulsion unit that heats propellant in a
   3D-printed gas generator to re-pressurise the tanks**, also providing settling
   and orbital adjustment. Development began 1998; first flight 9 July 2024.

### The decisive clue

**"The nozzle is about 70 % of the engine mass."** Combined with an ungeared
two-turbopump closed expander, that is one engine.

### If you said …

- **"RL10B-2."** Reasonable, and it is the closest thing in the file: closed
  expander, hydrolox, restartable upper stage, deployable nozzle extension,
  coaxial, spark torch. **What should have stopped you:** three things — the
  **gearbox** (RL10 has one, Vinci does not), the **thrust** (110.1 kN versus
  180 kN), and the **expansion ratio** (285:1 deployed versus 240:1). Also the
  RL10B-2's extension is uncooled carbon–carbon, whereas Vinci's is a deployable
  extension on a regeneratively cooled chamber.
- **"RD-0146."** Reasonable: closed expander, hydrolox, ungeared separate
  turbopumps, ~60 bar. **What should have stopped you:** 68.6 kN versus 180 kN,
  and the RD-0146 has **never flown**.
- **"LE-5B."** Reasonable: hydrolox upper stage, restartable, Japanese
  expander-family. **What should have stopped you:** LE-5B is **expander bleed**
  (chamber only), 137.2 kN, 446.8 s, ~35.8 bar.

### Numbers to carry

- **Restart count: "up to three restarts in the fetched source, with some sources
  claiming four or more."** Quote three and note the discrepancy.
- Burn time up to **900 s**; mixture ratio 6.1 is *internally confirmed* by the
  flows, which is worth saying — most mixture ratios in the file are not.
- The APU assessment ("arguably more novel than the engine") is the worksheet's
  editorial judgment [J], not a sourced claim.

---

## Exercise 15 — MHI/JAXA **LE-7A** (long-nozzle operational configuration)

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2**, O/F **5.9** |
| 2. Cycle | **Fuel-rich staged combustion** — separate fuel and oxidiser turbopumps driven from a **single fuel-rich preburner**, its exhaust burned in the main chamber |
| 3. Cooling | **Regenerative, hydrogen-cooled** |
| 4. Injector | **Coaxial**; spark torch ignition |
| 5. Mission class | **First-stage / core-stage engine**, sea-level start, throttleable 72–100 % |
| 6. The engine | **LE-7A**, long-nozzle configuration; the predecessor is the **LE-7** |

### Chain

1. **870 kN SL / 1,098 kN vac, Isp 440 s vacuum, ε 51.9:1, O/F 5.9.** Hydrolox
   core engine. *Eliminates:* hydrocarbons.
2. **120 bar with 440 s.** Too high for a gas generator, too low and too
   low-Isp for the RS-25 class. Staged combustion of a modest generation.
   *Eliminates:* Vulcain 2 (GG, 117.3 bar but only 429 s and no sea-level
   rating published), RS-68A (GG, 102.6 bar, 411.9 s).
3. **"The predecessor ran at 12.7 MPa; this engine runs at 12.0 MPa — *lower*.
   The redesign traded performance for turbopump margin after the failure."**
   A de-rating after a **fuel turbopump inducer failure** on 15 November 1999.
   Deliberate reliability-driven de-rating is rare and specific
   `[engine-database A.5.2]`.
4. **Nozzle-extension side loads during the start transient damaging gimbal
   actuators, fixed by a specifically reshaped nozzle** — the best-documented
   flight case of start-transient side loading in the reference file
   `[Ostlund02][OMK05][Schmucker73]` `[engine-database A.5.3]`.
5. **"Its nation is one of only three ever to fly staged combustion on this
   propellant combination, and it did so on a small fraction of the budget the
   other two spent."** The three are the United States (RS-25), the USSR
   (RD-0120) and Japan.

### The decisive clue

**A chamber-pressure *reduction* between blocks, explained by turbopump margin
after an inducer failure.** Engines almost never go down in chamber pressure
between blocks; this one did, for a documented reason.

### If you said …

- **"LE-7."** Reasonable: the predecessor. **What should have stopped you:**
  127 bar, 843.5 kN SL / 1,078 kN vac, 446 s, ε 52:1, first flight 4 February
  1994, and it is the engine that *failed*.
- **"LE-7A short-nozzle variant."** Reasonable and a good catch. **What should
  have stopped you:** the exercise gives the long-nozzle figures first
  (870 / 1,098 kN, 440 s, ε 51.9) and the short-nozzle set explicitly as the
  alternative (843 / 1,074 kN at 429 s).
- **"RS-25."** Reasonable: fuel-rich staged combustion hydrolox with a spark
  torch and coaxial injector. **What should have stopped you:** 206 bar versus
  120, **two** preburners on **two** shafts versus one preburner feeding two
  separate turbopumps, and 452.3 s versus 440 s.

### Numbers to carry

- **Sea-level Isp for this block is not published**; only the vacuum figures and
  the LE-7's 349 s SL value are `[engine-database A.5.4]`.
- **Turbopump speeds are not published** in the sources consulted.
- T/W is quoted **≈66:1 in vacuum, as published** — say which condition.

---

## Exercise 16 — Kuznetsov **NK-33** (flown as AJ26-62 / NK-33A)

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / RP-1** |
| 2. Cycle | **Oxidiser-rich closed staged combustion (ORSC)** |
| 3. Cooling | **Regenerative, kerosene (fuel) as coolant** |
| 4. Injector | **Coaxial**; chemical (hypergolic starter) ignition |
| 5. Mission class | **First-stage booster**, throttleable 50–105 % |
| 6. The engine | **NK-33** (ancestor NK-15; flown on Antares as AJ26-62 and on Soyuz-2.1v as NK-33A) |

### Chain

1. **1,510 kN SL at 148.3 bar with Isp 297 s SL / 331 s vac.** Kerolox booster at
   a chamber pressure only staged combustion reaches. *Eliminates:* every
   gas-generator kerolox engine.
2. **"Closed cycle with an oxidiser-rich preburner."** Stated. *Eliminates:*
   fuel-rich staged combustion (which cokes on kerosene) and full-flow.
3. **T/W 137:1.** For decades the highest of any booster engine, and the number
   that made Western engineers disbelieve the engine was real when they inspected
   one in 1993. *Eliminates:* RD-180 (78.4), RD-191 (89), RD-253 (156 — higher,
   but storable and 1963).
4. **The institutional clue: an *aircraft engine* bureau, not the national rocket
   engine bureau, brought in after the vehicle's chief designer and the
   established engine designer fell out over propellant choice.** Kuznetsov OKB-276
   versus Glushko/Energomash; Korolev wanted LOX/kerosene, Glushko wanted
   storables. The aviation sensibility is exactly what the 137:1 T/W is.
   *Eliminates:* the entire Energomash line in one clue.
5. **Turbopump bearings run in the oxidiser flow and require subcooled LOX for
   cooling** — a hard constraint on ground operations, and unusual enough to be
   an identifier.
6. **~150 engines ordered destroyed in 1974 and hidden instead; first successful
   flight 21 April 2013 — forty years after manufacture; supply exhausted early
   2025; failure 28 October 2014 traced to a turbopump in a forty-year-old engine
   with corrosion and manufacturing debris.**

### The decisive clue

**"The design bureau was not the national rocket engine bureau. It was an
aircraft engine house."** Everything odd about the engine — the T/W, the bearing
architecture, the packaging — follows from that.

### If you said …

- **"NK-43."** Reasonable: the vacuum-optimised sibling of the same family, same
  cycle, same bureau, same hidden-engine story. **What should have stopped you:**
  the sea-level rating (1,510 kN SL) and the first-successful-flight date. The
  NK-43 was never flown.
- **"RD-191."** Reasonable: single-chamber kerolox ORSC, ~2,000 kN class,
  Russian. **What should have stopped you:** 258 bar versus 148.3, 2,290 kg
  versus 1,240 kg, T/W 89 versus 137, Energomash versus Kuznetsov, and a first
  flight in 2014 from a current production line rather than a 1970s stockpile.
- **"RD-180."** Reasonable: kerolox ORSC on Western vehicles. **What should have
  stopped you:** two chambers, 267 bar, 5,480 kg, and no forty-year storage
  story.

### Numbers to carry

- **Expansion ratio and mixture ratio are not published.** ~2.6 circulates for
  the mixture ratio without a source; do not print it as fact.
- 148.3 bar is flagged `noz`† — nozzle-stagnation by the national-convention
  rule, inferred rather than stated per-engine.
- The lesson the database draws is worth repeating in the answer: **superb when
  new, impossible to re-qualify as it aged.**

---

## Exercise 17 — NPO Energomash **RD-253 → RD-275 → RD-275M**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **N₂O₄ / UDMH**, O/F **2.67** — storable, hypergolic, carcinogenic and lethal |
| 2. Cycle | **Oxidiser-rich staged combustion — the first ORSC engine ever flown**, 1963, at 147 bar |
| 3. Cooling | **Regenerative, fuel-cooled** |
| 4. Injector | **Coaxial**; **no igniter of any kind and none needed** — the propellants are hypergolic |
| 5. Mission class | **First-stage booster**, six per stage, gimbal 7.5° in a *single* plane, the six mounted so single-plane actuators give three-axis vehicle control between them |
| 6. The engine | **RD-253** (baseline), **RD-275** (first uprate), **RD-275M** (second uprate) — Proton stage 1 |

### Chain

1. **O/F 2.67 with no igniter needed.** Storable hypergolics, and specifically
   the N₂O₄/UDMH pair rather than N₂O₄/Aerozine 50 (LR87 at 1.91) or NTO/MMH
   (1.6–1.65). *Eliminates:* every cryogenic engine.
2. **147 bar chamber pressure in 1963.** No American engine reached that until
   the SSME fifteen years later, and no American engine of this cycle flew until
   2024. That immediately places it as Soviet ORSC. *Eliminates:* everything
   Western of the period.
3. **T/W 156:1.** Work out why: the ox-rich preburner runs the turbine on dense,
   cool, high-mass-flow gas, so the turbomachinery is small for the power
   delivered. This is the clean physical argument for ORSC's mass advantage.
4. **Single-shaft turbopump; regenerative fuel cooling; coaxial injector; the
   enabling technology of passivating enamel and specialised alloys against hot
   oxygen-rich gas, closely held.** Same materials story as the RD-180 and the
   same reason the West did not follow.
5. **Three ratings — 1,470 / 1,590 / 1,671 kN SL at 147 / 157 / 165 bar,
   1965 / 1987–93 / 2001–05, six per first stage, retired with the vehicle in
   2025.** RD-253, RD-275, RD-275M on Proton.

### The decisive clue

**"The first oxidiser-rich staged-combustion engine ever flown, in 1963, at
147 bar."** One engine holds that title.

### If you said …

- **"RD-180 or RD-191."** Reasonable: same cycle, same bureau, same enamel
  technology, same coaxial injector. **What should have stopped you:**
  propellants. Those are kerolox at O/F 2.6–2.72; this is N₂O₄/UDMH at 2.67 —
  and the mixture ratios are close enough to catch you if you do not read the
  *hypergolic, no igniter* clue.
- **"RD-270."** Reasonable: N₂O₄/UDMH, Soviet, high pressure, and it is the
  full-flow ancestor. **What should have stopped you:** the RD-270 never flew.
- **"LR87-AJ-11."** Reasonable: storable hypergolic booster engine of the same
  era. **What should have stopped you:** gas generator at 59.1 bar, N₂O₄ /
  **Aerozine 50** at O/F 1.91, twin chambers, geared turbopump, and a T/W of
  ~141:1 achieved a completely different way.

### Numbers to carry

- Chamber pressures are flagged `noz`† — Russian convention.
- ε 26.2:1 for all three variants; Isp ~316 s vacuum essentially unchanged across
  sixty years of uprates, because the uprates bought thrust, not efficiency.
- Dry mass ~1,070–1,080 kg is quoted for all three, which is itself a mild
  warning: three ratings sharing one mass figure is unlikely to be three
  measurements.

---

## Exercise 18 — Blue Origin **BE-4**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LNG (methane)** |
| 2. Cycle | **Oxidiser-rich staged combustion (ORSC)** — a single ox-rich preburner whose turbine drives **both** pumps. The first US-designed ORSC engine to fly |
| 3. Cooling | **Regenerative, methane (fuel) as coolant** |
| 4. Injector | **Not published.** Full-scale injector elements were tested in development and that is all the public record shows |
| 5. Mission class | **First-stage booster**, throttleable 40–100 %, relightable, two per one vehicle and seven per another |
| 6. The engine | **BE-4** |

### Chain

1. **340 s sea-level Isp at 2,460 kN.** Too high for kerolox at sea level
   (Merlin 282 s, RD-180 311 s), too low for hydrolox — methalox.
   *Eliminates:* both neighbours on the propellant axis.
2. **A single oxidiser-rich preburner driving both pumps.** ORSC, single-shaft
   powerhead. *Eliminates:* full-flow (two preburners — Raptor) and fuel-rich
   staged combustion.
3. **140 bar, *deliberately low* for this cycle, against 267 bar for the engine
   it displaced.** A life-and-reusability choice, not a limitation — and the
   engine it displaced is the RD-180 on Atlas V. That sentence alone almost
   names the engine.
4. **Hydrostatic bearings rather than rolling-element bearings**, another
   life-driven choice aimed at reuse; ~56 MW shaft power.
5. **In-flight relight by a head-pressure start** — tank pressure alone spins the
   turbine up, with no start cartridge and no spin-start system.
6. **First hotfire October 2017; first flight 8 January 2024, roughly five years
   late, delaying two launch vehicles; "the reason its nation's national-security
   launch no longer depends on imported engines."**

### The decisive clue

**"Deliberately low chamber pressure for this cycle, against 267 bar for the
engine it displaced."** 267 bar identifies the RD-180; "displaced" identifies the
vehicle; the rest follows.

### If you said …

- **"Raptor."** Reasonable: methalox, American, new, staged combustion, deep
  throttle, relightable. **What should have stopped you:** **one** preburner, not
  two. Raptor is full-flow with an ox-rich *and* a fuel-rich preburner; BE-4 has
  a single ox-rich preburner. Also 140 bar versus a claimed 300–330, and a T/W of
  ~46 versus a claimed 141–164.
- **"Archimedes."** Reasonable: methalox ORSC, deliberately de-rated for life,
  nine on a first stage. **What should have stopped you:** Archimedes is 730 kN
  and **has not flown**; its cycle change from GG to ORSC happened in
  development.
- **"YF-100."** Reasonable: single-shaft ORSC booster engine. **What should have
  stopped you:** kerolox at 180 bar, first flight 2015, and a Chinese programme.

### Numbers to carry

- **Every performance figure is a Blue Origin claim.** Thrust is **2,460 kN as
  originally specified** with **2,847 kN stated in November 2025** as improved —
  and it is not clear which vehicles fly which rating. Quote 2,450–2,460 kN as
  the baseline and list the uprate with its date `[engine-database A.3.4]`.
- **Vacuum thrust, expansion ratio, mixture ratio and injector element type are
  all not published.**
- T/W ≈46:1 is `CALC` from 2,460 kN and 5,400 kg, and is modest — worth saying,
  because it is the visible price of the low-pressure life choice.

---

## Exercise 19 — Rocket Lab **Rutherford**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / RP-1** |
| 2. Cycle | **Electric pump-fed** — the first such engine ever flown. Two brushless DC motors on lithium-polymer batteries. **No turbine, no gas generator, and no power-cycle propellant loss at all.** It is not one of the four cycles taught first (GG, staged combustion, expander, pressure-fed) |
| 3. Cooling | **Regenerative — cold RP-1 through channels embedded in a printed chamber** |
| 4. Injector | **Not published**; ignition by spark |
| 5. Mission class | **Small-launch-vehicle first-stage engine** (nine per stage), with a larger-nozzle vacuum variant as the single second-stage engine |
| 6. The engine | **Rutherford** (Electron) |

### Chain

1. **24.9 kN sea level, 35 kg dry, nine per first stage.** Small launch vehicle.
   *Eliminates:* every orbital-class booster engine by two orders of magnitude.
2. **"No turbine, no gas generator and no power-cycle propellant loss at all.
   Two brushless DC motors, 37 kW each at 40,000 rpm, on lithium-polymer
   batteries; the first-stage pack supplies over 1 MW."** The cycle is named by
   what is absent. *Eliminates:* pressure-fed (there are pumps), and all three
   turbine cycles.
3. **Isp 311 s SL / 343 s vacuum with the batteries partly jettisoned in
   flight.** Batteries as staged consumable mass is unique to this architecture.
4. **Chamber, injector, pumps and main propellant valves all produced by laser
   powder bed fusion** — the first engine to fly with essentially its entire
   primary structure additively manufactured `[GradlAM][Gradl18]`.
5. **369 units flown across 47 flights by April 2024; first flight 25 May 2017.**

### The decisive clue

**"Two brushless DC motors … powered by lithium-polymer batteries."** One flown
engine.

### The claim you should refuse to repeat

The manufacturer quotes **~95 % efficiency for the electric pump drive against
~50 % for a gas-generator turbine**. Those are **different quantities** —
*electrical-to-hydraulic* efficiency versus *thermodynamic cycle* efficiency —
and comparing them is not meaningful `[engine-database A.3.7]`. The honest
criticism of the cycle is different and better: **battery mass is carried as
parasitic weight**. The 72.8:1 thrust-to-weight is an *engine* figure that
excludes the batteries; at stage level the number is much worse, and that is what
caps the approach at small vehicles. The company's own next, larger vehicle moved
to oxidiser-rich staged combustion.

### If you said …

- **"Merlin 1D."** Reasonable: kerolox, nine per first stage, one vacuum-optimised
  above, printed parts, American-ish commercial. **What should have stopped you:**
  845 kN versus 24.9 kN, and Merlin has a turbine.
- **"Pressure-fed."** Reasonable as a *cycle* guess if you fixated on "no
  turbine". **What should have stopped you:** the exercise says there are
  **pumps** — motors driving propellant pumps. Pressure-fed means the tanks do
  the work and there are no pumps at all.
- **"Archimedes."** Reasonable: same company, kerolox-adjacent, printed. **What
  should have stopped you:** Archimedes is methalox ORSC at 730 kN and has not
  flown.

### Numbers to carry

- **Chamber pressure, expansion ratio and mixture ratio are all not published.**
- **72.8:1 T/W excludes the batteries** — quote it only with that qualifier.
- The efficiency comparison above is a company claim that the course explicitly
  declines to repeat uncritically.

---

## Exercise 20 — Europropulsion **P120C**

### Answers (solid substitution)

| # | answer |
|---|---|
| 1. Propellant family | **HTPB 1912** — an AP/Al composite in a hydroxyl-terminated polybutadiene binder, **19 % Al / 69 % AP / 12 % HTPB**; the trade name encodes the aluminium and binder fractions directly |
| 2. Grain and case | **Single monolithic cast grain in a carbon-fibre filament-wound monolithic case — one piece, no segments, no field joints.** ≈3,500 km of fibre wound over ≈33 days in a climate-controlled hall (low confidence on both figures) |
| 3. Nozzle and TVC | **Carbon-phenolic on a flexible joint, steered by electromechanical actuators** rather than hydraulics |
| 4. Why the mass fraction came out where it did | see below |
| 5. Mission class | **First stage on one vehicle and strap-on booster (two or four) on another**, dual-use by design |
| 6. The motor | **P120C**; the ~160 t stretched derivative is the **P160C** |

### Chain

1. **≈4,780 kN per motor at ≈280 s, 141,400 kg propellant, 13.5 m × 3.4 m,
   first flight 13 July 2022.** Large modern solid.
2. **Monolithic filament-wound carbon case, no segments, no field joints.**
   *Eliminates:* every segmented motor — Shuttle SRB/RSRM, RSRMV, Ariane 5 EAP,
   Titan UA1205/SRMU.
3. **Propellant mass fraction 0.924, against ≈0.85 for a segmented steel motor of
   similar vintage-of-concept.** That pair is the single most useful number-pair
   in the solids part of the course `[engine-database B.1.7]`.
4. **HTPB "1912" naming.** European practice; the same propellant runs through
   the Zefiro family.
5. **Electromechanical TVC** — the modern European choice, against the Shuttle's
   hydraulic actuators fed by hydrazine APUs.
6. **"One as a first stage on one vehicle; two or four as strap-ons on
   another."** Vega-C stage 1; Ariane 6 boosters.

### Why the mass fraction is 0.924

Three reasons, in descending order of magnitude:

1. **No field joints.** A field joint is a thick, heavy, doubled-up structure
   plus seals, plus insulation on both sides of it, plus the local case
   reinforcement that carries joint-rotation loads. Three of them on a Shuttle
   SRB is a large fraction of the inert mass, and they buy *nothing* ballistic.
2. **Carbon fibre instead of steel.** Filament winding puts fibre where the hoop
   and axial stresses are, at a specific strength several times D6AC's, and the
   case is the dominant inert item.
3. **A single monolithic cast grain**, so there is no inter-segment insulation,
   no segment-end web, and no volumetric loss to joint hardware.

The cost is that you must cast, cure and transport the whole motor as one piece —
which is exactly what the Shuttle SRB's rail constraint forbade. **The mass
fraction is the transport decision** `[engine-database B.1.7]`.

### If you said …

- **"GEM-63XL."** Reasonable: CFRP filament-wound monolithic, fixed nozzle,
  HTPB AP/Al, strap-on. **What should have stopped you:** 2,061 kN and
  47,853 kg propellant against 4,780 kN and 141,400 kg — a factor of three — and
  GEM-63XL's nozzle is **fixed**, with no TVC at all (the vectorable 63XLT was
  cancelled).
- **"P80FW."** Reasonable: Avio, graphite-epoxy filament-wound monolithic,
  carbon-phenolic with electromechanical TVC, Vega first stage, mass fraction
  0.922. **What should have stopped you:** 2,261 kN and 88,365 kg propellant, and
  107 s burn. P80FW is the predecessor, not the motor described.
- **"Zefiro 40."** Reasonable: same family, same propellant, same TVC. **What
  should have stopped you:** 1,304 kN, 36,239 kg, 2.4 m diameter, upper-stage
  application.

### Numbers to carry

- **Chamber pressure and the thrust trace could not be verified against the
  manufacturer's own data sheet** — both are flagged as needing a primary source
  `[P120C]` `[engine-database B.1.10]`.
- **Thrust is `/motor` `max` *vacuum***, not sea level; the tag matters.
- Burn time ≈130–140 s is **low confidence**, as are the 3,500 km / 33 days
  manufacturing figures.
- Mass fraction 0.924 is `CALC` from 141,400 / 153,000 kg.

---

## Exercise 21 — Thiokol / Northrop Grumman **Star 48B**

### Answers (solid substitution)

| # | answer |
|---|---|
| 1. Propellant family | **TP-H-3340-class HTPB/AP/Al composite** — flagged **C, needs primary source** |
| 2. Case material and why | **Titanium 6Al-4V** — flagged **C, needs primary source**. Titanium because an apogee-kick motor's figure of merit is mass fraction: it flies at the very top of the stack, where a kilogram of case is a kilogram off the payload, and it is a short, single-burn, benign-thermal-environment application where titanium's cost and hydrogen-embrittlement handling are affordable |
| 3. Nozzle architecture | **Carbon-phenolic, fixed** — no thrust vector control at all |
| 4. Attitude-control method | **Spin stabilisation.** The stage is spun up on a spin table before ignition and despun afterwards; gyroscopic stiffness holds the thrust vector through the 87-second burn |
| 5. Mission class | **Upper-stage / apogee-kick motor** — perigee kick from a Shuttle-deployed or Delta II parking orbit, and a third stage for a fast outer-planets mission |
| 6. The motor | **Star 48B**; the vectorable non-spinning variant is the **Star 48BV** |

### Chain

1. **≈66 kN vacuum, 87 s burn, 2,009–2,011 kg propellant, gross ≈2,137 kg.**
   Small, high-mass-fraction, single-burn solid. *Eliminates:* every launch-stage
   motor.
2. **"Used as an upper stage on a medium launch vehicle and on satellites
   deployed from a crewed orbiter; also flown as the third stage of a fast
   outer-planets mission."** PAM-D on Delta II and Shuttle; New Horizons.
3. **Fixed nozzle, no TVC** — so the vector must be held some other way. The only
   answer available on a motor of this class is **spin stabilisation**, and the
   spin table is part of the PAM-D architecture. *Eliminates:* every gimballed or
   SITVC motor.
4. **The Isp pair 286.2 / 292.2 s at ε ≈47.7 and ≈54.8–70.4.** This is the
   file's canonical demonstration that **Isp is a property of the motor *and* its
   nozzle, not of the propellant** `[engine-database B.4.1]`.
5. **"A thrust-vectoring, non-spinning variant exists and flies on a different
   launcher family."** Star 48BV on Minotaur IV+ / Minotaur V.

### The decisive clue

**A fixed nozzle with a two-valued published Isp.** The two Isp figures are the
short- and long-nozzle variants, and no other motor in the file is contested that
way.

### If you said …

- **"Star 37FM."** Reasonable: same family, apogee-kick, titanium or steel case,
  fixed carbon-phenolic nozzle, ~286–290 s. **What should have stopped you:**
  the numbers. The Star 37 family is 37 in (0.94 m) class, and the database
  states plainly that **no Star 37 numbers should be put in a module from that
  file** — thrust, burn time and propellant mass are all unpublished
  `[engine-database B.4]`. The described motor has a full, if contested, number
  set.
- **"Orbus 6 / Orbus 21."** Reasonable: IUS upper-stage solids with an
  **extendable exit cone**, which would also give two expansion ratios.
  **What should have stopped you:** the Orbus motors are Kevlar-epoxy cased with
  a **gimballed** nozzle, and every Orbus number is confidence C. Also, an EEC
  gives two ε values *on one motor*; the described motor's two ε values are two
  *variants*.
- **"Star 48BV."** Reasonable — same motor, and the exercise mentions it. **What
  should have stopped you:** the exercise says the nozzle is **fixed**, and the
  BV is the thrust-vectoring, non-spinning variant.

### Numbers to carry

- **Isp 286.2 s and 292.2 s are both correct** — short nozzle (ε ≈47.7) and long
  nozzle (ε ≈54.8–70.4). **Never quote "Star 48B Isp" without saying which
  nozzle** `[engine-database B.4.1]`.
- **Inert mass: 28 kg `[JM-LV]` versus 126 kg `[EA]` — they cannot both be
  right.** 2,137 − 2,009 = **128 kg**, which supports the larger figure; the 28 kg
  value is almost certainly a dropped digit. **Use ≈128 kg and a mass fraction of
  ≈0.94.**
- **Propellant and case material both need a primary source.** Say "reported as
  TP-H-3340 and Ti-6Al-4V, unconfirmed" — do not assert them.
- Thrust 66.0 versus 66.4 kN is quoting noise, not a dispute.

---

## Exercise 22 — Aerojet **AJ10-137**, the Apollo Service Propulsion System (SPS)

### Answers

| # | answer |
|---|---|
| 1. Propellants | **N₂O₄ / Aerozine 50**, O/F 1.6 (Apollo documentation; medium confidence) |
| 2. Cycle | **Pressure-fed** — 39.2 ft³ (1.11 m³) of gaseous helium at 3,600 psi (25 MPa) in two tanks, regulated down. No turbopump |
| 3. Cooling | **Ablative chamber with a radiatively cooled extension** — the standard Apollo description, **not confirmed** in the sources fetched |
| 4. Injector | **Unlike-impinging doublet, deliberately conservative and unbaffled** |
| 5. Mission class | **Crewed spacecraft main propulsion** — lunar orbit insertion, trans-Earth injection, orbital manoeuvring; 750 s maximum burn, multiple restarts, two-axis gimbal |
| 6. The engine | **Aerojet AJ10-137, Apollo SPS** |

### Chain

1. **91.19 kN vacuum at 314.5 s with O/F 1.6 and no igniter.** Storable
   hypergolics, vacuum-only. *Eliminates:* cryogens.
2. **No turbopump; helium at 25 MPa regulated down.** Pressure-fed.
   *Eliminates:* every pump-fed engine, and (by the pressurant choice) the LMDE,
   which uses **supercritical cryogenic** helium.
3. **"No igniter, no turbopump, and no valve that must move more than once", with
   redundant series-parallel valve trains throughout.** This is the canonical
   example of designing for single-string criticality by *removing mechanisms*
   rather than adding redundancy `[SLPRE]` `[engine-database A.8.3]`.
4. **An unbaffled, deliberately conservative unlike-impinging doublet — striking
   because a contemporary engine of similar propellants needed a competitor's
   baffled injector to be stable at all.** That contemporary is the LM ascent
   engine, whose injector Rocketdyne supplied after Bell could not solve the
   instability `[engine-database A.8.4]`.
5. **Contract April 1962; unmanned 1966, crewed from 1968, retired 1975; 750 s
   burn, multiple restarts, two-axis gimbal; originally sized for a mission mode
   that was abandoned.** Direct ascent gave way to lunar-orbit rendezvous, which
   is why it is over-powered for the job it did — and it did that job every time
   without a failure.

### The decisive clue

**"Originally sized for a mission mode that was abandoned, which is why it is
over-powered for the job it actually did."** Direct ascent → LOR is one
programme.

### The nozzle-geometry check the exercise asks for

The sourced dimensions are **3.882 m long with a 2.501 m exit diameter**, so the
exit area is $A_e = \pi (2.501/2)^2 = 4.913\ \mathrm{m^2}$. If ε were 62.5:1 the
throat area would be $A_t = 4.913 / 62.5 = 0.0786\ \mathrm{m^2}$, i.e. a throat
diameter of 316 mm. Check that against the thrust: with 91.19 kN at ~6.9 bar,
$A_t = F/(p_c C_F)$ needs $C_F = 91{,}190 / (6.9\times10^5 \times 0.0786) = 1.68$.
A vacuum $C_F$ of 1.68 at ε = 62.5 is **low** — a γ ≈ 1.25 gas at that area ratio
gives roughly 1.85–1.9 — so the three unsourced numbers (91 kN, ~6.9 bar, 62.5:1)
are **not quite mutually consistent**, and the most likely culprit is the
chamber pressure, which the database flags as low confidence anyway. The correct
answer is not a corrected number; it is *"these figures do not close, and the
database says three of them are unverified, so I would quote the sourced nozzle
dimensions instead."*

### If you said …

- **"Shuttle OMS (AJ10-190)."** Reasonable: directly derived from this engine,
  pressure-fed helium, hypergolic, impinging doublet, ablative-or-regen chamber
  with a radiative extension. **What should have stopped you:** 26.7 kN versus
  91.19 kN, **NTO/MMH** rather than Aerozine 50, O/F 1.65, ε 55:1, 118 kg, and
  a first flight in 1981. The OMS is also the only *reusable* member of the
  family — 100 missions, 1,000 starts, 15 hours cumulative.
- **"LM Ascent Engine."** Reasonable: same programme, same propellants, same
  pressure-fed helium, same ablative construction, no igniter. **What should have
  stopped you:** 15.6 kN, fixed thrust, non-gimballed, **baffled** Rocketdyne
  impinging injector, 200 s burn, designed for one restart.
- **"Aestus."** Reasonable: N₂O₄ storable pressure-fed upper-stage engine with
  multiple re-ignitions and a 1,100 s burn. **What should have stopped you:**
  MMH not Aerozine 50, O/F 1.9, 29.6 kN, ε 84:1, **132 coaxial swirl elements**
  — unusual for a hypergolic engine, where impinging doublets are the norm — and
  a 1997 first flight.

### Numbers to carry

- **Four figures in this block are low confidence and unverified:** chamber
  pressure (~100 psia / 6.9 bar), expansion ratio (62.5:1), dry mass (~294 kg)
  and the cooling description. They come from Apollo-era documentation that was
  **not re-read during the verification pass** `[engine-database A.8.1]`.
- **The sourced nozzle dimensions (3.882 m long, 2.501 m exit) are more useful
  than the unsourced area ratio** — and prefer them.
- O/F 1.6 is Apollo documentation, medium confidence.

---

# Tier 3 — Hard (23–30)

## Exercise 23 — KBKhA **RD-0120** (11D122)

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2**, O/F **6.0** |
| 2. Cycle | **Fuel-rich staged combustion with a single-shaft turbopump driving both pumps** — structurally simpler than the RS-25's dual-shaft, dual-preburner arrangement |
| 3. Cooling | **Regenerative, hydrogen-cooled** |
| 4. Injector | **Coaxial**; torch ignition; **no acoustic resonance cavities** |
| 5. Mission class | **Expendable core-stage engine** for a super-heavy vehicle, four per core, sea-level start |
| 6. The engine | **RD-0120** (Energia core stage) |

### Chain

1. **455 s vacuum at 219 bar, ε 85.7:1, 1,961.3 kN at 106 %.** Hydrolox staged
   combustion at the very top of the flown field. *Eliminates:* every gas
   generator.
2. **Single-shaft turbopump driving both the fuel and the oxidiser pumps.**
   *This is the discriminator.* The RS-25 is dual-shaft with one preburner per
   turbopump. *Eliminates:* the RS-25.
3. **Nominal burn 480–500 s but certified to 1,670 s.** A long-duration
   certification of an expendable engine — a Soviet practice and a specific fact.
4. **Two flights, 15 May 1987 and 15 November 1988, four engines per vehicle,
   then the programme died with its country.** Energia.
5. **Reached combustion stability without acoustic resonance cavities.** A
   specific, checkable design difference, not a marketing claim — though the
   database flags it as coming from a single source `[engine-database A.6.2]`.

### The decisive clue

**"A single-shaft turbopump driving both the fuel and the oxidiser pumps."**
That one architectural line separates this engine from the only other engine that
looks like it.

### The real question — the second engine, and the three clues

The second engine is the **RS-25 (SSME)**. It shares LOX/LH2, the fuel-rich
staged-combustion cycle family, regenerative hydrogen cooling, a coaxial
injector, torch ignition, booster/sustainer mission class, and Isp within 3 s
(452.3 versus 455).

The **three clues** that separate them, one of each kind:

| kind | clue | RD-0120 | RS-25 |
|---|---|---|---|
| **architectural** | turbopump layout | **single shaft**, both pumps, one preburner | **dual shaft**, one preburner per turbopump, both exhausting to the main injector |
| **performance** | chamber pressure | **219 bar** `noz`† | 206.4 bar `inj` |
| **stability design** | high-frequency suppression | **no acoustic resonance cavities** | **resonator cavities machined into the injector face** |

A fourth, not asked for but worth having: the RD-0120 was **expendable**; the
RS-25 was designed for 55 reuses, and that single requirement explains most of
the cost and complexity gap.

### If you said …

- **"RS-25."** Reasonable, and this is the intended near-miss. **What should
  have stopped you:** the single shaft, 219 versus 206 bar, ε 85.7 versus the
  contested 69/77.5, and "two flights, then the programme died with its country."
- **"LE-7A."** Reasonable: fuel-rich staged combustion hydrolox with separate
  turbopumps on one preburner. **What should have stopped you:** 120 bar,
  1,098 kN vacuum, 440 s, and Japan.
- **"J-2X."** Reasonable if you keyed on the high ε and hydrolox. **What should
  have stopped you:** gas generator, 92 bar, and never flew.

### Numbers to carry

- **219 bar is `noz`†** — Russian convention, inferred rather than stated.
  Comparing it directly to the RS-25's 206 bar `inj` overstates the gap slightly.
- **The comparative claims are single-sourced.** "Slightly higher Isp and higher
  chamber pressure at lower complexity and cost" and "stability without resonance
  cavities" come from the same one source and **should be corroborated before
  being printed as fact** `[engine-database A.6.2]`. Carrying that caveat is part
  of the right answer.
- 1,961.3 kN is quoted **at 106 % power**; state the power level.

---

## Exercise 24 — MHI/JAXA **LE-9**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2**, O/F **5.9** |
| 2. Cycle | **Expander bleed** — *not* closed expander, *not* tap-off. The cooling jacket drives the turbines and the turbine flow is then **dumped overboard** rather than injected |
| 3. Cooling | **Regenerative**, hydrogen-cooled — and the jacket is the power source |
| 4. Injector | **Coaxial**; turbopump detail not published |
| 5. Mission class | **Core-stage engine**, two or three per stage, sea-level start |
| 6. The engine | **LE-9** (H3 core stage) |

### Chain

1. **1,471 kN vacuum at 426 s with O/F 5.9 and ε 37:1.** Hydrolox core engine.
2. **426 s vacuum at 100 bar in a booster-class engine — 30 s below what staged
   combustion delivers at the same size** (RS-25 452.3 s, RD-0120 455 s). So the
   cycle is **not** staged combustion. *Eliminates:* FRSC and ORSC.
3. **"No preburner and no gas generator anywhere."** *Eliminates:* the gas
   generator, which was the obvious remaining open cycle (RS-68A, Vulcain 2).
4. **"The cooling jacket drives the turbines and the turbine flow is then dumped
   overboard rather than injected into the chamber."** That sentence is the
   definition of **expander bleed**, and it is what distinguishes it from the
   **closed expander** (all flow burned; hard thrust ceiling) and from **tap-off**
   (hot gas bled from the main chamber, not from the cooling jacket).
   *Eliminates:* RL10, Vinci, RD-0146 (closed); BE-3PM, J-2S (tap-off).
5. **"At 1,471 kN this is by a wide margin the largest engine of its cycle
   *family* ever flown — against 110 kN and 180 kN for the two best-known
   members."** RL10 and Vinci. Bleed escapes the closed expander's ceiling
   because the turbine no longer has to be fed by the whole fuel flow
   `[engine-database A.5.1]`.
6. **Chamber-wall cracks and turbine-blade fatigue cracks found in 2020, ~2-year
   delay; first flight 7 March 2023 with the engines performing correctly and the
   failure in the stage above; fully successful 17 February 2024.**

### The decisive clue

**"The turbine flow is dumped overboard."** Everything else in the exercise is
consistent with three cycles; that clause is consistent with one.

### If you said …

- **"Closed expander."** Reasonable: no preburner, no gas generator, jacket-driven
  turbines. **What should have stopped you:** the dumping. A closed expander burns
  all its turbine flow, which is precisely why it cannot reach 1,471 kN — the
  closed-expander record is Vinci's 180 kN.
- **"Tap-off."** Reasonable: also preburner-free and gas-generator-free. **What
  should have stopped you:** tap-off bleeds **hot gas from the main chamber**;
  this engine's turbine gas comes from the **cooling jacket**. Different source,
  different temperature, different failure modes.
- **"RS-68A."** Reasonable: large hydrolox, low-ish Isp, low part count, cost
  driven, dumps flow overboard. **What should have stopped you:** RS-68A dumps
  **gas-generator** products through a side duct, runs 102.6 bar with an
  **ablative** nozzle and ε 21.5, and gives 411.9 s.
- **"LE-5B."** Reasonable: Japanese expander bleed, chamber-only heat exchange.
  **What should have stopped you:** 137.2 kN and 446.8 s — an upper-stage engine.

### Numbers to carry

- **Sea-level thrust is not published**; nor are injector element type or
  turbopump detail `[engine-database A.5.4]`.
- 100 bar is flagged `n.s.` — station not stated by any source consulted.
- T/W 62.5:1 is quoted **in vacuum, as published**.
- The turbine cracks are the point, not trivia: they show the thermal margins on
  a bleed cycle at this scale are tight, which is the engineering caveat that must
  travel with "the variant has no practical thrust ceiling."

---

## Exercise 25 — KBKhA **RD-0146**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2** (mixture ratio not published) |
| 2. Cycle | **Closed expander** — no preburner, no gas generator; the turbopumps are driven by heat absorbed in the nozzle and combustion chamber. **The first Russian expander engine** |
| 3. Cooling | **Regenerative chamber — the jacket is the power cycle — with an *uncooled* nozzle extension** |
| 4. Injector | **Not published** |
| 5. Mission class | **Restartable cryogenic upper stage** (five firings, thrust control in two planes) — proposed, never flown |
| 6. The engine | **RD-0146** (RD-0146D derivative still in development) |

### Chain

1. **68.6 kN vacuum at 59 bar with a claimed 470 s.** Upper stage, hydrolox,
   small. *Eliminates:* everything sea-level.
2. **"No preburner, no gas generator — the turbopumps are driven by heat absorbed
   in the nozzle and combustion chamber."** Expander family. And because nothing
   is said to be dumped, and because 59 bar sits **exactly where the closed
   expander's heat-balance ceiling falls at this thrust**, it is the **closed**
   variant. *Eliminates:* expander bleed (which would not be pressure-capped this
   way) and tap-off.
3. **Separate fuel and oxidiser turbopumps, with the fuel turbopump above
   120,000 rpm — the highest published turbopump speed of any rocket engine
   anywhere** `[SP-8107][SP-8101]`. *Eliminates:* the RL10 (geared, ~31,000 rpm)
   and Vinci (ungeared but not at that speed).
4. **"It is the first engine of its cycle from its country."** Combined with
   "developed with foreign industrial collaboration in the early 2000s" (Pratt &
   Whitney) and a first test firing on 9 October 2001, that is Russia.
5. **Concept 1988, project start 1999, twenty-five years without a flight.**

### The decisive clue

**120,000 rpm.** One published number, one engine.

### If you said …

- **"RL10B-2."** Reasonable: closed expander, hydrolox, upper stage, the Isp
  record-holder. **What should have stopped you:** 110.1 kN, 465.5 s, geared
  single shaft, ε 285:1 deployed, and — decisively — the RL10B-2 has *flown*.
- **"Vinci."** Reasonable: closed expander, ungeared separate turbopumps,
  restartable, ~60 bar. **What should have stopped you:** 180 kN, 457.2 s,
  ε 240:1, first flight 9 July 2024, and a *cooled* deployable extension rather
  than an uncooled one.
- **"YF-75D."** Reasonable: a closed expander "like the RL10" on a Chinese upper
  stage. **What should have stopped you:** the nationality clues, and the fact
  that every YF-75D performance figure is unconfirmed and confidence D — the
  database says find a primary source before tabulating them `[engine-database
  A.7.2]`.

### Numbers to carry

- **The 470 s must never be quoted flat.** It is a **test-stand figure from a
  design bureau for an engine that has never flown**, confidence **low [D]**,
  and the course's rule is that flown and unflown engines never share a column.
  The highest Isp ever *flown* is the RL10B-2's 465.5 s `[engine-database A.6.3]`
  `[_verify-liquid §17 of contested figures]`.
- **Expansion ratio, dry mass and mixture ratio are all not published.**
- 59 bar is `noz`† — Russian convention, inferred.

---

## Exercise 26 — AALPT **YF-100**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / RP-1**, O/F **2.6, adjustable ±10 %** |
| 2. Cycle | **Oxidiser-rich staged combustion (ORSC)** |
| 3. Cooling | **Regenerative, kerosene (fuel) as coolant** |
| 4. Injector | **Coaxial**; chemical ignition |
| 5. Mission class | **First-stage booster and strap-on**, throttleable 65–105 %, ~155 s burn |
| 6. The engine | **YF-100**, with the **YF-100K** uprate, the **YF-100M** vacuum-optimised variant and the **YF-100GBI** dual-roll-nozzle variant |

### Chain

1. **1,200 kN SL at 180 bar with Isp 300 s SL / 335 s vacuum.** Kerolox at a
   staged-combustion chamber pressure. *Eliminates:* every GG kerolox engine.
2. **Oxidiser-rich preburner, single-shaft turbopump with a single-stage oxidiser
   pump and a two-stage fuel pump.** ORSC, and the specific pump arrangement is
   published. *Eliminates:* full-flow, fuel-rich staged combustion.
3. **"Development began in the early 2000s, drawing on technology transferred
   from another country's engine programme in the 1990s."** RD-120 technology
   from NPO Energomash. *Eliminates:* an indigenous-from-scratch programme.
4. **"The fourth entity to fly this cycle, nine years before the third did."**
   The USSR/Russia flew ORSC from 1963; China flew the YF-100 on 20 September
   2015; the United States flew ORSC only with the BE-4 in January 2024. That
   ordering is a clean national fingerprint.
5. **"In service across an entire national launch fleet, with an uprated variant,
   a vacuum-optimised variant and a variant carrying dual roll-control nozzles";
   first 300-second test November 2007; diameter 1.338 m.**
6. **"Its chamber pressure and Isp trail the leading engine of the same cycle and
   propellants by a clear margin; this is a capable second-generation machine,
   not a frontier one."** 180 bar and 335 s against the RD-180's 267 bar and
   338 s.

### The decisive clue

**Mixture ratio adjustable ±10 %, on a single-shaft ORSC kerolox engine, in
service across a whole national fleet from 2015.** The adjustability is unusual
and published; the date and the fleet role close it.

### If you said …

- **"RD-120."** Reasonable — it is the technology ancestor, ORSC kerolox, and the
  transfer is stated. **What should have stopped you:** the RD-120 is a
  *vacuum* upper-stage engine (Zenit stage 2) with no sea-level rating, and the
  described engine gives 1,200 kN at sea level with a 65–105 % throttle range.
- **"RD-191."** Reasonable: single-chamber kerolox ORSC, ~2,000 kN class, wide
  throttle. **What should have stopped you:** 258 bar versus 180, 1,920 kN SL
  versus 1,200, published dry mass (2,290 kg) versus none, and a Russian
  programme.
- **"BE-4."** Reasonable: single ox-rich preburner driving both pumps, modern,
  low-ish pressure by ORSC standards. **What should have stopped you:**
  **methane**, 140 bar, 2,460 kN, and 2024.

### Numbers to carry

- **Dry mass is not published, and the widely circulated T/W of ~78–80 is not
  sourced — do not quote a figure** `[engine-database A.7]`. This is the single
  most important caveat in the exercise: a student who supplies a T/W here has
  invented one.
- 180 bar is `noz`† — Chinese practice follows the Russian convention here by
  inheritance of the technology, and the flag records that the station is
  inferred.
- Burn time ~155 s is **estimated**.

---

## Exercise 27 — Reaction Motors **XLR99**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / anhydrous liquid ammonia (LNH₃)**, O/F ~1.25 (not published; low confidence) — ammonia chosen for a clean, non-sooting, restartable engine in a piloted vehicle |
| 2. Cycle | **Gas generator — but of the monopropellant-steam type**: high-test hydrogen peroxide decomposed over a catalyst drives the turbopump. The same idea as the V-2 and the Redstone A-7, in an engine otherwise thoroughly modern for 1960 |
| 3. Cooling | **Regenerative, ammonia (fuel) as coolant** |
| 4. Injector | **Impinging**; spark-ignited with a closely sequenced start |
| 5. Mission / vehicle class | **Rocket-powered research *aircraft*, air-launched, pilot-throttled** — not a launch vehicle at all |
| 6. The engine | **Reaction Motors XLR99** (North American X-15) |

### Chain

1. **"The vehicle was not a launch vehicle."** Stated outright, and it reframes
   every other number. *Eliminates:* the entire launch-vehicle field.
2. **Anhydrous liquid ammonia as fuel.** Nothing else in the file uses it. The
   reason — clean, non-sooting, restartable, in a **piloted** vehicle — is the
   whole design rationale. *Eliminates:* kerosene, alcohol, hydrogen, hypergolics.
3. **HTP decomposed over a catalyst driving the turbopump.** Monopropellant steam
   drive. *Eliminates:* bipropellant gas generators.
4. **Throttle 50–100 %, continuously variable, commanded by the pilot with a
   throttle lever, plus in-flight shutdown and restart** — required, because the
   vehicle was air-launched and the pilot managed the energy profile by hand.
5. **250 kN (57,000 lbf) max, 600 psia, Isp 279 s vac / 239 s SL, 413 kg dry,
   T/W 62:1, chamber temp 3,023 K, ~83 s burn (over 150 s with external tanks),
   development from 1956, first flight 15 November 1960, programme to 1968, past
   Mach 6.7 and above 100 km.**

### The decisive clue

**Anhydrous liquid ammonia.** One engine in this course burns it.

### If you said …

- **"Rocketdyne AR2-3."** Reasonable, and it is the closest relative: HTP
  catalytic turbine drive, aircraft application, throttle 50–100 % on a single
  lever, US, late 1950s. **What should have stopped you:** the propellants and
  the thrust. The AR2-3 burns **90 % HTP with the aircraft's own JP-4/JP-5** at
  29.34 kN — a factor of eight smaller — and its **catalyst pack is also the
  ignition system**, whereas the XLR99 needs a spark and a sequenced start.
  Also, the two throttle *by opposite means*: the AR2-3 varies turbopump speed
  through the gas-generator oxidiser flow; that is a different architecture from
  a throttled main chamber `[engine-database A.9.5]`.
- **"V-2 / A-4."** Reasonable: peroxide-permanganate steam turbine, regenerative,
  impinging-ish. **What should have stopped you:** 1938–42, alcohol–water,
  15.2 bar, 18 burner cups, and no throttle or restart of any kind.
- **"LMDE."** Reasonable if you keyed on throttling and crewed vehicles. **What
  should have stopped you:** pressure-fed hypergolics at 7.6 bar and 46.7 kN,
  and a 10:1 turndown rather than 2:1.

### Numbers to carry

- **Expansion ratio is not published**; the nozzle exit diameter is 998 mm, which
  is what you should quote instead.
- **Mixture ratio ~1.25 is not published and is low confidence.**
- 41.4 bar is `n.s.` — station not stated.
- The claim worth making is the operational one: **the first man-rated,
  throttleable, restartable large liquid rocket engine**, and the direct ancestor
  of every reusable-engine programme since, by fifty years `[engine-database
  A.9.4]`.

---

## Exercise 28 — Bristol Siddeley **Gamma 8** (Black Arrow first stage)

### Answers

| # | answer |
|---|---|
| 1. Propellants | **85 % high-test hydrogen peroxide (HTP) / kerosene (RP-1)**, O/F **8:1** — the very high ratio is characteristic of HTP, which is mostly oxygen *and water* by mass, so most of that 8 is not doing oxidising work |
| 2. Cycle | **Gas generator**, HTP-driven |
| 3. Cooling | **Regenerative, kerosene-cooled** |
| 4. Injector and ignition | **Kerosene injected downstream of a silver-plated nickel-gauze catalyst pack into 600 °C decomposed HTP (steam + oxygen), where it ignites spontaneously. There is no igniter and no hypergolic slug — the catalyst pack *is* the ignition system** |
| 5. Mission class | **Small orbital launcher first stage**, eight chambers in pairs on tangential gimbals |
| 6. The engine | **Gamma 8** (Black Arrow first stage); the second-stage engine of the same family is the **Gamma 2** |

### Chain

1. **Mixture ratio 8:1.** Stop and ask what oxidiser has a stoichiometric-ish O/F
   that high. Only a peroxide that is mostly water by mass. *Eliminates:* LOX
   (2.3–2.7 with hydrocarbons), N₂O₄ (1.6–1.9).
2. **The catalyst pack as the ignition system.** Nothing else in the reference
   file has this architecture. *Eliminates:* every spark, torch, pyrotechnic and
   hypergolic-slug engine.
3. **Eight combustion chambers, mounted in pairs on tangential gimbals.** The
   Gamma 8 layout specifically — Gamma 201/301 have four chambers, Gamma 2 has
   two with extended nozzles.
4. **"A suborbital test vehicle from 1955–57; the variant here flew on a small
   orbital launcher from 1969; that launcher put a satellite in orbit on
   28 October 1971 — after the programme had already been cancelled."**
   Black Knight → Black Arrow → Prospero.
5. **"Its country remains the only one ever to develop an independent orbital
   launch capability and then abandon it."** The UK.
6. **128 engines of this family flew across 26 launches with zero failures.**

### The decisive clue

**O/F 8:1 with a catalyst pack for ignition.** Those two together are one engine
family, and the eight tangentially gimballed chambers pick the variant.

### If you said …

- **"Gamma 301."** Reasonable: same family, same architecture, same catalyst
  ignition, same 8:1. **What should have stopped you:** four chambers and
  76–96 kN, on Black Knight rather than Black Arrow.
- **"Gamma 2."** Reasonable: same family and it is described in the last
  performance sentence. **What should have stopped you:** two chambers with
  extended nozzles at 64.6 kN SL / 68.2 kN vac — the *second* stage.
- **"AR2-3."** Reasonable: HTP over a catalyst, kerosene-family fuel, no igniter.
  **What should have stopped you:** the AR2-3 is a 29 kN **aircraft** engine
  burning the aircraft's own JP-4, with a single-lever turbopump-speed throttle;
  the Gamma 8 is a 235 kN eight-chamber launch-vehicle first stage.
- **"RD-107A."** Reasonable if "peroxide" made you think Soviet: the RD-107A does
  use catalytically decomposed H₂O₂ — but only to drive its *turbine*. **What
  should have stopped you:** the RD-107A's main propellants are LOX/RG-1 at
  ~2.4, not HTP/kerosene at 8:1.

### Numbers to carry

- **Thrust is contested:** **52,785 lbf (234.8 kN)** in the most-cited source
  versus **222.4 kN (49,998 lbf)** in a second — a 5 % spread, and the lower
  figure looks like a rounded 50,000 lbf design value. **Use 234.8 kN and note
  the alternative** `[engine-database A.9.1]`.
- **Dry mass and expansion ratio are not published.**
- The propellant-combination trade is worth stating: storable, non-cryogenic,
  non-hypergolic, exhaust of steam and CO₂ — properties nothing else in this
  course combines — at a cost of 250–265 s Isp, an oxidiser that decomposes in
  storage, and a cleanliness requirement so strict that any contaminant is a
  catalyst `[Clark]` `[engine-database A.9.3]`.

---

## Exercise 29 — Aerojet Rocketdyne **RL10B-2**, with **RL10C-1** as the discrimination

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2**, O/F **5.88** |
| 2. Cycle | **Closed expander** |
| 3. Cooling | **Chamber: regenerative brazed tube wall, hydrogen-cooled. Nozzle extension: none — radiatively cooled 3D-woven carbon–carbon, entirely uncooled by propellant** |
| 4. Injector | **Coaxial shear**; spark torch igniter; geared single-shaft turbopump |
| 5. Mission class | **High-energy cryogenic upper stage**, vacuum-only |
| 6. The engine | **RL10B-2** |

### Chain

1. **110.1 kN vacuum at 465.5 s — the highest specific impulse of any flown
   chemical rocket engine.** That figure alone is nearly an identification.
2. **Closed expander, regenerative tube-wall chamber, coaxial shear, spark torch,
   geared single-shaft turbopump — "all standard for its family."** RL10.
3. **A 3D-woven carbon–carbon extension, ~2.5 m long, exit just over 2.1 m, the
   largest carbon–carbon extendible nozzle ever flown, translating into place
   after stage separation, worth ~30 s of Isp** — and **a single-point failure
   with no meaningful abort mode**. That picks the **B-2** out of the family.
4. **First flight 1998; still flying today on a government heavy-lift upper
   stage** (SLS ICPS).

### The decisive clue

**465.5 s.** No other flown engine reaches it. (The 470 s of Exercise 25 is a
test-stand figure for an engine that never flew — keep the columns separate.)

### The discrimination question

Given only **Isp, mass and expansion ratio**, the two sentences are:

> **Sentence 1.** At a fixed chamber pressure and mixture ratio, upper-stage Isp
> is dominated by expansion ratio, so 449.7 s against 465.5 s is essentially the
> difference between ε = 130 and ε = 285 — the engine with the smaller nozzle is
> the lower-Isp one, and 15.8 s is about the right size for that ratio step.
>
> **Sentence 2.** A 285:1 carbon–carbon extendible nozzle is a large, heavy
> structure with a deployment mechanism, so it is the *nozzle* that makes the
> heavier engine heavier — 301 kg against 190 kg is 111 kg of nozzle and
> mechanism, not 111 kg of powerhead.

**Why the lighter engine has the lower specific impulse:** because on a
vacuum upper stage, Isp is bought almost entirely with nozzle area, and nozzle
area is bought with mass. The 190 kg engine has a **fixed 130:1** nozzle; the
301 kg engine carries a 2.5 m carbon–carbon extension that translates into place
after separation. **You are not looking at a better engine and a worse one; you
are looking at the same powerhead with two different answers to "how much mass
will you spend on expansion ratio, and will you accept a deployment mechanism as
a single-point failure?"** The RL10C-1 exists because two production lines were
consolidated into one, and a fixed nozzle is cheaper, simpler and abort-tolerant.

### If you said …

- **"RL10C-1 for the first engine."** Reasonable — same family, same cycle, same
  everything except the nozzle. **What should have stopped you:** 465.5 s and a
  translating carbon–carbon extension. The C-1 is 449.7 s at a fixed 130:1.
- **"RL10A-4-2."** Reasonable: 22,300 lbf, 451.0 s, 370 lb, O/F 5.5. **What
  should have stopped you:** the mass and Isp both, and the absence of an
  extendible nozzle.
- **"Vinci."** Reasonable: closed expander with a deployable extension at high ε.
  **What should have stopped you:** 180 kN, 457.2 s, ε 240, ungeared twin
  turbopumps, and ~550 kg.
- **"RD-0146."** Reasonable: the 470 s figure is tempting. **What should have
  stopped you:** it has never flown, and the exercise says "the highest Isp of
  any **flown** chemical rocket engine."

### Numbers to carry

- **Expansion ratio is contested:** **280:1** in the most-copied table versus
  **285:1** in the technical literature on the nozzle itself, which states the
  extension raises the ratio **from 77:1 to 285:1**. **Use 285:1 deployed and
  77:1 retracted; 280:1 is a rounding** `[RL10B2-CC]` `[engine-database A.2.7]`.
  The retracted figure is the more interesting one — it is what makes the
  mechanism worth its mass and its single-point-failure risk.
- **Chamber pressure is not published** by the manufacturer or in any fetched
  secondary; a ~44 bar figure circulates from one aggregator and **should not be
  printed** `[engine-database A.2]`.
- **RL10C-1 thrust:** 22,890 lbf (101.8 kN, L3Harris) versus 22,820 lbf
  (101.5 kN, widely copied). A 70 lbf difference — immaterial in magnitude, but
  **the manufacturer's figure should win on principle** `[engine-database A.2.8]`.

---

## Exercise 30 — Snecma **HM7B**

### Answers

| # | answer |
|---|---|
| 1. Propellants | **LOX / LH2**, O/F **5.0** |
| 2. Cycle | **Gas generator**, open, turbine exhaust dumped overboard |
| 3. Cooling | **Regenerative** (detail not published) |
| 4. Injector | **Not published in detail**; ignition detail and turbopump speeds also not published |
| 5. Mission class | **Cryogenic upper stage**, vacuum-only, **single burn, no restart** |
| 6. The engine | **HM7B** (Ariane 1–4 third stages; Ariane 5 ECA upper stage) |

### Chain

1. **62.2 kN vacuum, 444.6 s, ε 83.1:1, O/F 5:1, dry mass 165 kg, burn times of
   735 / 780 / 950 s.** Hydrolox upper stage, small, light, long-burning.
2. **"An open cycle that dumps turbine exhaust overboard" at 37 bar.** Gas
   generator. *Eliminates:* expander (which would be the obvious guess at 37 bar)
   and staged combustion.
3. **The question the numbers pose — 444.6 s at 37 bar from an open cycle.**
   The answer is in **ε 83.1:1 and the fact that it never sees atmosphere**.
   Upper-stage Isp is dominated by expansion ratio, not chamber pressure: chamber
   pressure buys you $C_F$ only through the pressure-ratio term, which saturates,
   whereas area ratio keeps buying exit velocity. A closed-expander at 60 bar and
   ε 240 gets 457 s; a staged-combustion booster at 219 bar and ε 85.7 gets 455 s;
   this engine at 37 bar and ε 83.1 gets 444.6 s. **The gas-generator penalty —
   2–3 % of flow thrown overboard — is worth roughly 10 s, and everything else in
   the 13 s gap is expansion ratio** `[SB][SP-8120]`. That is the cleanest
   demonstration in the course of where upper-stage Isp comes from.
4. **Single-shaft *fuel* turbopump; no restart, single burn only** — the
   limitation that forced its final vehicle into direct high-energy-orbit
   insertion and motivated the closed-expander replacement (Vinci).
5. **Family from 1973; first flight 24 December 1979 on the maiden flight of its
   country's first orbital launcher; retired 2023 after 44 years across four
   launcher generations; nearly 300 units produced.** Ariane 1 L01.

### The decisive clue

**444.6 s at 37 bar from an open cycle, with no restart.** The combination of a
very high expansion ratio, a very low chamber pressure and a single-burn
limitation is one engine.

### If you said …

- **"YF-75."** Reasonable, and it is the closest thing in the file: LOX/LH2 gas
  generator upper-stage engine, 37.6 bar, 438 s vacuum, ε 80:1, single-shaft
  hydrogen turbopump, ~470 s burn. **What should have stopped you:** three
  things — the dates (first flight 8 February 1994, not 1979), the dry mass
  (**550 kg**, which the database itself flags as suspiciously high for the
  thrust and possibly a two-engine assembly, against 165 kg here), and the
  cooling, which on the YF-75 is **split: regenerative chamber, dump-cooled
  nozzle** — one of the few good flown examples of dump cooling. Two engines per
  stage, not one, as well.
- **"LE-5."** Reasonable: LOX/LH2 gas generator upper stage, 36.5 bar, 450 s,
  ε 140:1, 255 kg. **What should have stopped you:** ε 140 versus 83.1, and the
  LE-5 is **qualified for up to 16 starts** — the described engine does not
  restart at all.
- **"RL10A-3-3A."** Reasonable: hydrolox upper stage at low chamber pressure with
  Isp in the 440s. **What should have stopped you:** the RL10 is a **closed
  expander** that dumps nothing, at 32.8 bar and ε 61 with restart capability.

### Numbers to carry

- **Chamber pressure is internally inconsistent inside a single article:**
  **3.7 MPa (37 bar, 537 psia)** in the specification table and **3.5 MPa** in
  the body text of the *same* document. **Use 37 bar and footnote the other**,
  and take the general lesson: tertiary sources are not self-consistent
  `[engine-database A.4.3]`.
- **Injector element type, ignition detail and turbopump speeds are all not
  published.**
- 165 kg dry is the number worth memorising — it is remarkably light and is what
  makes the 38:1 T/W possible on a 62 kN engine.

---

# The three checks from "After you have finished"

## 1. Did you name the specific cycle variant every time?

Family names are not answers. Here is the whole file sorted by cycle, which is
the table to memorise:

| cycle variant | engines in this file | thrust ceiling / signature |
|---|---|---|
| **Gas generator** (bipropellant) | F-1 (1), J-2 (11), RS-68A (12), Vulcain 2 (13), HM7B (30) | none in practice; 2–5 % of flow dumped; the default |
| **Gas generator, monopropellant steam** | V-2 (10), XLR99 (27), Gamma 8 (28), and RD-107A | turbine runs on decomposed peroxide, not combustion gas |
| **Closed expander** | RL10A-3-3A (3), Vinci (14), RD-0146 (25), RL10B-2 (29) | hard Pc ceiling: heat input ∝ wall area (D²), thrust ∝ throat area. Flown record 180 kN (Vinci) |
| **Expander bleed** | LE-9 (24) | escapes the ceiling by dumping turbine flow. 1,471 kN, and no practical ceiling shown |
| **Tap-off** | (none identified here; BE-3PM and J-2S are the file's examples) | hot gas bled from the main chamber |
| **Fuel-rich staged combustion** | RS-25 (2), LE-7A (15), RD-0120 (23) | hydrolox only; kerosene cokes a fuel-rich preburner |
| **Oxidiser-rich staged combustion** | RD-180 (6), NK-33 (16), RD-253 family (17), BE-4 (18), YF-100 (26) | enamel-coated hot-oxygen surfaces; small turbomachinery, high T/W |
| **Full-flow staged combustion** | Raptor (5) | two preburners of opposite mixture ratio; first flown example |
| **Electric pump-fed** | Rutherford (19) | no turbine at all; battery mass is parasitic |
| **Pressure-fed** | LMDE (9), Apollo SPS (22) | Pc limited by tank MEOP; no rotating machinery |
| **Solid** | Shuttle SRB (7), P120C (20), Star 48B (21) | no throttle, no shutdown, once lit |
| **Stored cold gas** | SAFER / MMU (8) | the stored pressure *is* the cycle |

Three pairs in this file exist specifically to punish "expander cycle" as an
answer: **RL10A-3-3A (closed) versus LE-9 (bleed)**, **Vinci (closed, ungeared)
versus RL10B-2 (closed, geared)**, and **RD-0146 (closed, never flown) versus
everything flown**. Two more punish "staged combustion": **RS-25 (fuel-rich,
dual-shaft) versus RD-0120 (fuel-rich, single-shaft)** and **BE-4 (ox-rich, one
preburner) versus Raptor (full-flow, two preburners)**.

## 2. Did you attach a caveat to every contested number?

The file's own list, with the caveat you should have written:

| exercise | figure | caveat |
|---|---|---|
| 1 — F-1 | chamber pressure | four values circulate: 965 / 982 / **1,015** / 1,125 psia. Quote ≈70 bar `inj` and footnote the range; the spread is a measurement-station and programme-phase artefact `[engine-database A.2.2]` |
| 2 — RS-25 | expansion ratio | **69:1** (manufacturer, "area ratio") / 77.5:1 (agency training material) / 78:1. Quote 69:1 as geometric and footnote 77.5:1 `[A.2.3]` |
| 2 — RS-25 | dry mass | 3,177 kg (bare) vs **3,526 kg** (manufacturer, installed). T/W 73.1:1 uses the *smaller* mass; ~66:1 on the larger. Never quote T/W without saying which mass `[A.2.5]` |
| 5 — Raptor | everything | company claims; thrust corroborated only indirectly via FAA documents and third-party telemetry/acoustics. **No independent verification of Pc, Isp, dry mass or T/W** `[A.3.5]` |
| 21 — Star 48B | vacuum Isp | **286.2 s and 292.2 s are both correct** — short and long nozzle. Never quote it without the nozzle. Inert mass 28 kg is almost certainly a dropped digit for 128 kg `[B.4.1]` |
| 29 — RL10B-2 | expansion ratio | **285:1 deployed / 77:1 retracted**; 280:1 is a rounding `[A.2.7]` |

And the ones the file's own list does not mention but that a strong answer
carries anyway: the Gamma 8's 234.8 vs 222.4 kN thrust (Ex 28), the HM7B's
37 vs 35 bar *inside one document* (Ex 30), the RD-170's 170 vs 192 MW turbopump
power quoted for the RD-180's parent (Ex 6), the Shuttle SRB's 69.6/0.4 vs
69.8/0.2 composition (Ex 7), the MMU's Δv that does not close (Ex 8), and the
four unsourced Apollo SPS figures (Ex 22).

**Quoting a contested number flat is a wrong answer even when the number is the
one the interviewer had in mind.** They will ask "where's that from?" and the
answer "an infobox" ends the conversation.

## 3. The two decoys

The exercise file never says which two, so this is an inference from its own
definition — *"a second real engine shares almost every clue in the description,
and exactly one detail separates them"* — applied to the exercises that give **no
hint that a twin exists**. On that test [J]:

### Decoy 1 — Exercise 2 (RS-25), whose twin is the RD-0120

Shared: LOX/LH2; fuel-rich staged combustion; regenerative hydrogen cooling;
coaxial injector; torch ignition; booster/sustainer class; chamber pressure
within 6 % (206 vs 219 bar); vacuum Isp within 3 s (452.3 vs 455).

**The single detail that separates them: the powerhead.** The RS-25 has **two
preburners on two independent turbopump shafts**; the RD-0120 has **one
preburner and a single shaft driving both pumps**. Everything else — the
resonator cavities, the reusability requirement, the 55-flight design life — is
downstream of that.

Exercise 23 works the same pair from the other side, which is why the file's
closing note can send you back to find it: the drill is symmetric, and only one
of the two exercises declares the twin.

### Decoy 2 — Exercise 30 (HM7B), whose twin is the YF-75

Shared: LOX/LH2; **gas generator**; regenerative cooling; cryogenic upper stage;
chamber pressure within 2 % (37 vs 37.6 bar); vacuum Isp within 7 s (444.6 vs
438); expansion ratio within 4 % (83.1 vs 80); **single-shaft hydrogen
turbopump**; long burn (735–950 s vs 470 s); no published injector detail.

**The single detail that separates them: the cooling.** The HM7B is
**regenerative throughout**; the YF-75 is **split — regenerative chamber, dump-
cooled nozzle**, and is one of the very few flown examples of dump cooling
anywhere. If you want a second discriminator, the dry masses are 165 kg and
550 kg, and the database itself flags the 550 kg as possibly covering a
two-engine assembly.

### Runners-up, and why they do not qualify

- **Exercise 3 (RL10A-3-3A) vs RL10A-4-2 / RL10C-1.** A real near-twin set, but
  the discriminating clue is a *rating table*, not a single architectural detail
  — and Exercise 29 declares the family's twin problem explicitly.
- **Exercise 10 (V-2) vs the Redstone A-7.** Shares propellants, cooling
  philosophy and the whole power cycle; separated by the injector (18 burner cups
  vs flat-face impinging) — a clean single discriminator. It loses only because
  the era clue (1938–42) closes it before the injector has to.
- **Exercise 27 (XLR99) vs the AR2-3.** Shares the HTP catalytic turbine drive,
  the aircraft application and the 50–100 % single-lever throttle; separated by
  the propellants and by *how* they throttle. Again, the era and the thrust close
  it early.

**If your answer named any of these five pairs with its discriminator, mark it
correct.** The skill being tested is "which single clue settles it", and all five
exercise that skill honestly.

---

# What the drill was actually testing

Six habits, in the order they matter:

1. **Read the mixture ratio first.** O/F alone partitions the entire file:
   ~1.2 (alcohol–water), 1.6–1.9 (storables), 2.2–2.7 (kerolox), 3.6 (methalox),
   5–6 (hydrolox), 8 (HTP). Exercises 5, 11, 17 and 28 are decided on it.
2. **Read chamber pressure as a cycle statement, not a performance statement.**
   33 bar on hydrolox is a closed expander's heat-balance ceiling. 100–120 bar is
   a gas generator. 200+ bar is staged combustion. 267–330 bar is oxidiser-rich
   or full-flow. Exercises 3, 12, 16, 18 and 24 turn on it.
3. **Read expansion ratio as a mission statement.** ε 8–21 is sea level;
   ε 27–60 is a compromise or an interstage constraint; ε 80–285 is a vacuum
   upper stage. Exercises 11, 29 and 30 turn on it.
4. **Treat "not published" as data.** Exercises 18, 19, 22, 24, 26 and 30 each
   omit a parameter because no credible source publishes it, and in every case
   the omission narrows the field — an engine whose dry mass is unpublished is
   not an American engine of the Apollo era.
5. **Name the ruled-out alternative.** Every entry above is written so that the
   answer *is* the elimination. An identification with no eliminated twin is a
   recognition, and recognition is Level 1.
6. **Carry the caveat.** The engine database exists because rocket performance
   figures are not exact, and an engineer who quotes them as though they were has
   told you something about their sourcing habits that no amount of correct
   recall repairs.

---

*Numbers throughout are from [`reference/engine-database.md`](../reference/engine-database.md),
which consolidates [`reference/_verify-liquid.md`](../reference/_verify-liquid.md)
and [`reference/_verify-solid-coldgas.md`](../reference/_verify-solid-coldgas.md)
with their caveats intact. Citation tags resolve in
[`reference/sources.md`](../reference/sources.md) and in the database's Part E
tag list. Where this key says a figure is not published, that is a finding of the
verification pass, not a gap in this key.*
