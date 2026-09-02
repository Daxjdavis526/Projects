# Liquid Rocket Engine Reference — Verification File

**Status:** working verification file for the propulsion textbook. Every block below
carries the sources actually consulted and a confidence label. Where sources disagree,
all values are listed with attribution and a recommendation.

**Compiled:** 2026-09-02. **Scope:** liquid engines only (solid/hybrid live elsewhere).

**Conventions used throughout**
- Conversions: 1 kN = 224.809 lbf; 1 bar = 14.5038 psi; 1 MPa = 145.038 psi.
- Where a source gives only one of a pair (kN or lbf, bar or psia), the converted
  value is marked *(converted)* and inherits the source's precision, not more.
- "Not published" means no primary or credible secondary source was located. It is
  never a placeholder for a guess.
- Chamber pressure for most US engines of the Apollo era is quoted **injector-end**;
  Soviet/Russian practice and many modern datasheets quote **nozzle stagnation**.
  This is the single largest recurring source of apparent disagreement in this file.
  See the contested-figures section at the end.

**A general caution on confidence.** Wikipedia infobox numbers were used as pointers,
and are cross-checked against a manufacturer page, a NASA/NTRS document, or a
specialist site (enginehistory.org, heroicrelics.org) wherever a block is labelled
"high". Blocks resting on Wikipedia alone are labelled medium at best. Company
marketing claims (SpaceX, Blue Origin, Rocket Lab, ArianeGroup) are labelled as
claims regardless of how confidently they are stated.

---

## Part 1 — German and early American heritage

### V-2 / A-4 engine (Model 39)

- **Manufacturer / country:** Peenemünde Army Research Center; production by
  Mittelwerk GmbH. Germany.
- **Development:** ~1938–1942 under Walter Thiel. First successful flight 3 October 1942.
  Operational use September 1944 – March 1945.
- **Vehicle:** A-4 / V-2 ballistic missile; later Hermes, Bumper, and Soviet R-1 derivatives.
- **Propellants:** LOX (*A-Stoff*) / 75% ethanol–25% water (*B-Stoff*).
  The water is there as a combustion-temperature and wall-temperature moderator, not as ballast.
- **Mixture ratio (O/F):** ~1.0 : 0.85 by mass at the 25 t rating, i.e. **O/F ≈ 1.18**
  (Wikipedia, citing Kennedy). Some sources give O/F ≈ 1.2–1.25. Low confidence on
  the second decimal.
- **Cycle:** Gas generator, but of the *monopropellant steam* kind — 80% H2O2 decomposed
  over sodium/potassium permanganate (*Z-Stoff*) drives the turbine. Not a bipropellant GG.
- **Thrust:** ~245 kN (55,000 lbf) sea level at the 25-tonne rating, rising to ~285 kN
  (64,000 lbf) as ambient pressure falls (quoted as "29 tons" at altitude).
  Preliminary/gravity-fed stage ~78 kN (8 t).
- **Chamber pressure:** 1.52 MPa = **15.2 bar (220 psia)**. Turbopump discharge ~1.5 MPa.
- **Isp:** ~203 s sea level, ~239 s vacuum (derived from the quoted 2,000 m/s effective
  exhaust velocity and standard V-2 performance tables). *Medium confidence — the
  Wikipedia article gives exhaust velocity, not Isp, and secondary tables vary 199–210 s SL.*
- **Expansion ratio:** ~3.5:1 (short conical, 15° half-angle nozzle). Consistent with the
  XLR43 derivative's documented 3.61 (enginehistory.org).
- **Dry mass:** ~1,126 kg for the Model 39 engine assembly (enginehistory.org, quoted in
  the Navaho comparison: "668 kg versus 1126 kg").
- **Thrust-to-weight:** ≈ 22:1 (245 kN / 1,126 kg). Computed, not sourced.
- **Cooling:** Regenerative (double-wall steel chamber, alcohol in the annulus) **plus**
  extensive film cooling — four rings of film-cooling holes injecting ~10% of the fuel
  along the wall. The film cooling does most of the work; the regen jacket alone was insufficient.
- **Chamber liner material:** Mild steel, double-walled.
- **Injector:** 18 pot-type ("burner cup") pre-mixing injection heads arranged in two
  concentric circles on a flat dome, each a miniature centrifugal-swirl injector.
  This is the distinguishing feature of the design and the reason the chamber is spherical-ish.
- **Ignition:** Pyrotechnic — a spinning pyrotechnic igniter ("Zündkerze") lowered into
  the chamber, followed by gravity-fed preliminary stage, then turbopump mainstage.
- **Turbopump:** Single shaft, centrifugal LOX and alcohol pumps back-to-back, driven by a
  steam turbine at **4,000 rpm**, ~430 kW (580 hp). Flow ~68 kg/s LOX, ~55 kg/s alcohol.
- **Major innovation:** The first mass-produced, turbopump-fed, regeneratively cooled
  liquid rocket engine — it established the entire architectural vocabulary.
- **Major limitation:** The 18-pot injector is a manufacturing nightmare and caps chamber
  pressure; combustion efficiency was poor (~94% c*), and the film-cooling fraction is huge.
- **Historical significance:** Every American, Soviet, and European liquid engine lineage
  traces through this hardware, either by direct copy (R-1, XLR41) or by studied rejection
  of its choices (the single flat-face injector that followed).
- **SOURCES:**
  - Wikipedia, *V-2 rocket* — https://en.wikipedia.org/wiki/V-2_rocket (fetched)
  - enginehistory.org, *Rocket Propulsion Evolution* §3 (Navaho) — comparative engine mass
    and the V-2 Model 39/39a description — https://www.enginehistory.org/Rockets/RPE03/RPE03.shtml (fetched)
- **CONFIDENCE: medium-high.** Thrust, chamber pressure, propellants, injector count and
  turbopump speed are solid. Isp, mixture ratio and expansion ratio are reconstructions
  from secondary data and should be presented with a tolerance.

---

### Rocketdyne XLR43-NA-1 ("75K", Navaho) → the Atlas lineage

- **Manufacturer / country:** North American Aviation, Rocketdyne Division (then
  "Aerophysics Laboratory"). USA.
- **Development:** 1946–1951. Lineage: two V-2 Model 39 engines torn down and re-tested
  as "Mark I" → NAA-704 Mark II (**XLR41-NA-1**, three built, flow-tested, never hot-fired)
  → access to a Model 39a in early 1947 → NAA-704 Mark III = **XLR43-NA-1**.
  First successful test **15 November 1950**; development complete 1951.
- **Vehicle:** XSSM-A-2 Navaho test vehicle; the engine itself never flew operationally
  in this form, but it is the direct ancestor of the Redstone A-6/A-7.
- **Propellants:** LOX / 75%–25% ethanol–water (retained from the V-2).
- **Mixture ratio:** ~1.32 (as later documented for the Redstone derivative). Not
  separately published for the XLR43.
- **Cycle:** Gas generator of the V-2 type — H2O2 steam generator driving the turbopump.
- **Thrust:** **75,000 lbf (334 kN)** sea level. First American engine to exceed the V-2's
  ~56,000 lbf.
- **Chamber pressure:** **318 psia (21.9 bar)** (enginehistory.org).
- **Isp:** Not published for the XLR43 specifically; the Redstone A-7 derivative is
  documented at 235 s SL / 265 s vac.
- **Expansion ratio:** **3.61** (throat diameter 15.3 in).
- **Dry mass:** **668 kg** (1,473 lb) — "less than half the V-2's 1,126 kg while delivering
  34% more thrust."
- **Thrust-to-weight:** ≈ 51:1 (computed).
- **Cooling:** Double-wall regenerative **plus** film cooling.
- **Injector:** The decisive break from Germany — a single flat-face injector with
  **concentric rings of drilled holes** feeding distribution manifolds, in a
  **triplet pattern: two fuel streams impinging on one LOX stream (F-O-F)**.
  This replaced the V-2's 18 pre-mixing pots and is the ancestor of every American
  impinging-injector engine through the F-1.
- **Ignition:** Pyrotechnic.
- **Turbopump:** Single shaft, H2O2/permanganate steam turbine, V-2-derived layout.
- **Major innovation:** The flat-face impinging-triplet injector, and the cylindrical
  (rather than spherical) thrust chamber.
- **Major limitation:** Still V-2 propellants, still H2O2 steam drive, still low chamber
  pressure — an evolutionary rather than revolutionary machine.
- **Historical significance:** The hinge point of American rocketry. Its successors
  (XLR71-NA-1 at 120,000 lbf, 438 psia, ε 4.16, on 92.5% ethanol with a true fuel-rich
  bipropellant gas generator; XLR83-NA-1 at 135,000 lbf per chamber on JP-4) produced
  the tube-wall chamber (Edward A. Neu Jr.'s patent, filed 5 April 1950) and the
  geared turbopump that went on to power **Atlas, Jupiter, Thor, Delta and Saturn I**.
- **SOURCES:**
  - enginehistory.org, *Rocket Propulsion Evolution* §3 "Navaho" —
    https://www.enginehistory.org/Rockets/RPE03/RPE03.shtml (fetched)
  - heroicrelics.org, *Rocketdyne Engine Family Tree* (pointer)
  - Encyclopedia Astronautica, *XLR43-NA-1* (secondary; site returned 503 during this pass)
- **CONFIDENCE: medium-high** on thrust, chamber pressure, expansion ratio, mass and the
  injector description (all from one detailed specialist source). **Low** on Isp and
  mixture ratio, which are not separately published.

---

### Rocketdyne A-7 (Redstone; NAA 75-110-A-7)

- **Manufacturer / country:** North American Aviation / Rocketdyne. USA.
- **Development:** 1953–1958; seven variants A-1 through A-7. Derived directly from the
  XLR43-NA-1. First flight of the Redstone 20 August 1953 (A-6 era); the **A-7** flew
  Mercury-Redstone, including **MR-3 (Shepard) 5 May 1961** and MR-4 (Grissom).
- **Vehicles:** PGM-11 Redstone, Jupiter-C, Juno I, Mercury-Redstone.
- **Propellants:** LOX / 75% ethyl alcohol for the Redstone and Mercury-Redstone.
  Jupiter-C and Juno I used **Hydyne** (60% UDMH / 40% diethylenetriamine) for higher
  performance; **Mercury-Redstone deliberately reverted to ethanol** to avoid Hydyne's
  toxicity around a crewed vehicle — a rare case of accepting lower Isp for safety.
- **Mixture ratio:** **1.324** (O/F).
- **Cycle:** Gas generator — 75% H2O2 decomposed over potassium permanganate in a steam
  generator drives the turbine.
- **Thrust:** **82,977 lbf (369 kN) sea level; 93,565 lbf (416 kN) vacuum**
  (enginehistory.org). Note the widespread "75,000 lbf" and "78,000 lbf" figures:
  75,000 lbf is the **NAA 75-110 nameplate rating** (75,000 lbf for 110 seconds), and
  78,000 lbf is that nameplate **plus ~3,000 lbf of steam-generator exhaust thrust**.
  The 82,977 lbf figure is the uprated A-7 as flown.
- **Chamber pressure:** **318 psia (21.9 bar)**.
- **Isp:** **235–265 s** (235 s SL / ~265 s vac).
- **Expansion ratio:** **3.61**.
- **Dry mass:** **1,479 lb (671 kg)**.
- **Thrust-to-weight:** **56:1** at sea level (as published).
- **Burn time:** 155 s (versus the V-2's ~60 s) — the real Redstone achievement.
- **Cooling:** Regenerative double-wall + film cooling.
- **Injector:** Flat-face impinging, XLR43 heritage.
- **Ignition:** Pyrotechnic igniter.
- **Turbopump:** Single shaft, steam turbine at **4,718 rpm** delivering **758 hp (565 kW)**.
- **Major innovation:** Not performance but *simplification and reliability* — the A-7
  cut the pneumatic system from **31 components to 10** by deleting check valves and
  consolidating regulators, relief and solenoid valves. This is why it was man-rated.
- **Major limitation:** Chamber pressure and expansion ratio barely moved from the V-2;
  performance is mediocre by any later standard.
- **Historical significance:** The engine that launched the first American in space,
  and (in Jupiter-C/Juno I form) the first American satellite.
- **SOURCES:**
  - enginehistory.org, *Rocket Propulsion Evolution* §4.2 "Redstone Engine" —
    https://www.enginehistory.org/Rockets/RPE04/RPE04-2.shtml (fetched)
  - NASA MSFC, *Mercury-Redstone Launch Vehicle* —
    https://www.nasa.gov/centers-and-facilities/marshall/mercury-redstone-launch-vehicle/ (pointer)
  - Smithsonian NASM collection record A19700252000, *Rocket Engine, Liquid Fuel, A-7,
    Redstone Missile* (pointer)
  - heroicrelics.org, *Redstone Rocket Engines (A-6 and A-7)* (503 during this pass)
- **CONFIDENCE: high** on the enginehistory.org figures; **flag for the reader** that
  the 75,000 / 78,000 / 83,000 lbf figures all circulate and mean different things.

---

### Rocketdyne MA-5 / MA-5A (Atlas booster + sustainer)

The MA-5 is a *propulsion system*, not a single engine: two **LR-89** booster chambers
jettisoned in a dropped skirt, one **LR-105** sustainer chamber that burns to
staging-free orbit insertion, plus two small **LR-101** verniers. The stage-and-a-half
Atlas is the reason the numbers are always quoted as a package.

- **Manufacturer / country:** Rocketdyne. USA.
- **Development dates:** LR-89/LR-105 lineage from the Navaho XLR43/XLR71 work,
  1954 onward. MA-5 flew on Atlas SLV-3/Atlas E-F/Atlas G; **MA-5A** (RS-56-OSA booster,
  RS-56-OBA sustainer) flew on **Atlas II from 7 December 1991**; last Atlas II flight
  31 August 2004.
- **Vehicles:** Atlas SLV-3, Atlas G/Centaur, Atlas I (MA-5), Atlas II/IIA/IIAS (MA-5A).
- **Propellants:** LOX / RP-1.
- **Mixture ratio:** ~2.25 (booster), ~2.27 (sustainer). *Medium confidence.*
- **Cycle:** Gas generator. In the MA-5, **the two LR-89 booster chambers share a single
  gas generator and a centrally mounted turbopump assembly**; the LR-105 sustainer has
  its own turbopump and gas generator.
- **Thrust — MA-5 (Atlas I / SLV-3 class):**
  - Booster pair: **1,681 kN (378,000 lbf) SL / 1,882 kN (423,000 lbf) vac**
  - Sustainer: **269 kN (60,473 lbf) SL / 374 kN (86,866 lbf) vac** — the widely quoted
    "60,000 lbf sustainer" is this figure.
- **Thrust — MA-5A (Atlas II):** total **1,890 kN SL / 2,100 kN vac**;
  booster pair alone quoted at **1,896 kN (426,240 lbf)**.
- **Chamber pressure:** **~580 psia (40 bar)** for both LR-89 and LR-105 (heroicrelics);
  Encyclopedia Astronautica gives the MA-5A sustainer as **48 bar / 48 atm at the
  injector end**. These are different engine blocks, not a contradiction, but the
  textbook should quote them separately. *See contested figures.*
- **Isp:**
  - MA-5 booster: 259 s SL / 292 s vac.
  - MA-5 sustainer: 220 s SL / 309 s vac. (The very low sustainer SL Isp is real — a
    large-ε nozzle badly overexpanded at liftoff.)
  - MA-5A overall: 263 s SL / 295 s vac; booster Isp quoted 294 s.
- **Expansion ratio:** booster ~8:1, sustainer ~25:1. *Medium confidence.*
- **Dry mass:** Not reliably published per-chamber; MA-5A system mass ~1,700 kg class.
  **Treat as not published** rather than quoting a figure.
- **Cooling:** Regenerative **tube-wall** (brazed thin-wall tube bundle) — the Neu
  patent from the Navaho program, here in full production form.
- **Injector:** Flat-face impinging (like-on-like doublet on the LR-89; the LR-89
  injector is a well-photographed artifact at the Cosmosphere).
- **Ignition:** Pyrotechnic / hypergolic slug depending on block.
- **Turbopump:** Geared, single turbine driving both pumps through a reduction gearbox —
  the XLR71 architecture.
- **Major innovation:** Stage-and-a-half operation — all three engines ignite on the pad
  and are verified before release, then the boosters are jettisoned. It solves
  air-start reliability by never air-starting.
- **Major limitation:** Carrying the sustainer's oversized nozzle and full plumbing off
  the pad is dead weight and terrible SL Isp; the architecture is a dead end.
- **Historical significance:** Powered every American orbital Mercury flight, and the
  Atlas that flew for five decades.
- **SOURCES:**
  - Encyclopedia Astronautica, *LR105-5* and *MA-5A* — http://www.astronautix.com/l/lr105-5.html,
    http://www.astronautix.com/m/ma-5a.html (via search summary; site 503 on direct fetch)
  - heroicrelics.org, *LR-105 (Atlas Sustainer) Cut-away* and *LR-89 (Atlas Booster)
    Rocket Engine Injector* — http://heroicrelics.org/info/atlas/lr-105-cut-away.html
  - Wikipedia, *MA-5 (rocket stage)* — https://en.wikipedia.org/wiki/MA-5_(rocket_stage) (fetched;
    thin on engine detail)
  - Braeunig, *Space Launchers — Atlas* — http://www.braeunig.us/space/specs/atlas.htm (503 this pass)
- **CONFIDENCE: medium.** Thrust and Isp are consistent across two independent secondary
  sources. Chamber pressure, expansion ratio and mass need a primary Rocketdyne or
  General Dynamics document before the textbook prints them as fact.

---
