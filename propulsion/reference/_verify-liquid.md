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

## Part 2 — American large boosters and upper stages

### Aerojet LR87-AJ-11 (Titan III/IV stage 1)

- **Manufacturer / country:** Aerojet-General (later Aerojet Rocketdyne). USA.
- **Development:** LR87 family from 1955 (LOX/RP-1 LR87-AJ-3 for Titan I); converted to
  storable propellants for Titan II (LR87-AJ-5, 1962). The **AJ-11** block was developed
  for Titan 34D/Titan IV, first flight **1968** in the -9/-11 lineage per Wikipedia's
  variant table; Titan IV service ran to **19 October 2005**.
- **Vehicles:** Titan 24B, 34B, IIIB/IIID/IIIE, 34D, Titan IV A/B. (An LR87-LH2 LOX/LH2
  variant was built and tested but never flew.)
- **Propellants:** N2O4 / Aerozine 50 (50/50 UDMH–hydrazine). Storable, hypergolic.
- **Mixture ratio (O/F):** **1.91**.
- **Cycle:** Gas generator. Twin combustion chambers mounted as a single unit off one
  turbopump assembly — the LR87 is a *two-chamber engine*, not two engines.
- **Thrust:** **968.4 kN (217,800 lbf) sea level; 1,218.8 kN (274,000 lbf) vacuum.**
  (Wikipedia's LR87 table also quotes "1,900 kN total" for the -11; that is the
  **two-engine stage** figure for Titan IV, not one engine. *See contested figures.*)
- **Chamber pressure:** **58.3 atm ≈ 59.1 bar (857 psia)**. Wikipedia's variant table
  gives "59 bar" for the -11 and "40–59 bar" as the family range.
- **Isp:** **250 s sea level; 302 s vacuum.**
- **Expansion ratio:** **15:1**.
- **Dry mass:** **700 kg (1,540 lb)** for the -11; 758 kg quoted for the -9.
- **Thrust-to-weight:** ≈ 141:1 sea level (computed from 968.4 kN / 700 kg).
- **Cooling:** Regenerative (fuel-cooled tubular chamber).
- **Injector:** Unlike-impinging doublet, hypergolic pairs. Baffled.
- **Ignition:** Hypergolic — none required. This is the whole point of the propellant choice.
- **Turbopump:** "A single high-speed turbine drove the lower-speed centrifugal fuel and
  oxidizer pumps through gearing" — a geared, single-turbine, two-pump arrangement chosen
  for turbine efficiency. rpm and shaft power **not published** in the sources consulted.
- **Major innovation:** Making a large storable-propellant booster engine that could sit
  fuelled in a silo for years and start on command, then be uprated repeatedly across
  four decades without architectural change.
- **Major limitation:** Aerozine 50 and N2O4 are carcinogenic, corrosive and lethal;
  ground handling cost is enormous, and Isp is unremarkable.
- **Historical significance:** The workhorse of American national-security launch for
  forty years, and the only ICBM engine that also carried astronauts (Gemini, via the
  earlier LR87-AJ-7).
- **SOURCES:**
  - Wikipedia, *LR87* and *Aerojet LR87* — https://en.wikipedia.org/wiki/LR87,
    https://en.wikipedia.org/wiki/Aerojet_LR87 (both fetched)
  - Encyclopedia Astronautica, *LR87-7*, *LR87-5* (via search summary)
  - Braeunig, *Space Launchers — Titan* — http://www.braeunig.us/space/specs/titan.htm (pointer)
- **CONFIDENCE: medium-high.** The performance set is internally consistent across two
  Wikipedia articles and Astronautix. The "1,900 kN" figure must be flagged.

---

### Aerojet LR91-AJ-11 (Titan III/IV stage 2)

- **Manufacturer / country:** Aerojet-General. USA.
- **Development:** LR91 family from the late 1950s; **first flight 1 September 1964**
  (LR91 lineage); last flight **19 October 2005**. Retired.
- **Vehicles:** Titan III and Titan IV second stages.
- **Propellants:** N2O4 / Aerozine 50.
- **Mixture ratio:** **1.86**.
- **Cycle:** Gas generator, single chamber.
- **Thrust:** **467 kN (105,000 lbf) vacuum.** No meaningful sea-level rating — it is a
  vacuum-start upper stage.
- **Chamber pressure:** **5.93 MPa = 59.3 bar (860 psia)**.
- **Isp:** **316 s vacuum.**
- **Expansion ratio:** **49.2:1**.
- **Dry mass:** **589 kg (1,299 lb)**.
- **Thrust-to-weight:** ≈ 81:1 (computed).
- **Burn time:** 247 s.
- **Cooling:** **Hybrid — regeneratively (fuel) cooled chamber with a separate ablative
  nozzle skirt.** This is worth calling out in the textbook as a clean example of using
  two cooling technologies where each is cheapest.
- **Injector:** Unlike-impinging doublet. **Ignition:** hypergolic.
- **Turbopump:** Not published in the sources consulted.
- **Major innovation:** The regen-chamber / ablative-skirt split, and a genuinely
  reliable air-start on hypergols.
- **Major limitation:** Same toxicity problem as the LR87; performance capped by the
  propellant combination.
- **Historical significance:** Second stage for Gemini (in its -AJ-5 form) and for four
  decades of national-security payloads.
- **SOURCES:** Wikipedia, *LR91* — https://en.wikipedia.org/wiki/LR91 (fetched);
  Encyclopedia Astronautica *LR91* (pointer).
- **CONFIDENCE: medium-high** on performance; **low** on turbopump detail (not published).

---

### Rocketdyne H-1

- **Manufacturer / country:** Rocketdyne. USA.
- **Development:** Contract **15 August 1958**. Derived from the Thor/Jupiter S-3D
  (175,000 lbf). **First flight 27 October 1961** (SA-1); last flight **15 July 1975**
  (Apollo-Soyuz).
- **Vehicles:** Saturn I and Saturn IB first stages — eight engines per stage.
- **Propellants:** LOX / RP-1.
- **Mixture ratio:** **2.23 ± 2%.**
- **Cycle:** Gas generator. Started by a **solid propellant gas generator (SPGG)** —
  a solid grain spins the turbopump up to self-sustaining speed.
- **Thrust:** uprated across the program — **165,000 → 188,000 → 200,000 → 205,000 lbf**
  sea level (**734 → 836 → 890 → 912 kN**). The Saturn IB flew the 200,000 lbf and
  205,000 lbf blocks. Vacuum thrust is not separately quoted in the sources consulted;
  the vacuum Isp is.
- **Chamber pressure:** **633–700 psia (43.6–48.3 bar)** across blocks.
- **Isp:** **255 s sea level; 289 s vacuum.**
- **Expansion ratio:** **8:1.**
- **Dry mass:** ~1,000 kg class (Wikipedia's "1,000–2,100 kg" range in the infobox is
  garbled — it conflates inboard/outboard installations and gimbal hardware).
  **Treat the single-engine dry mass as ~1,000 kg, low confidence.**
- **Thrust-to-weight:** ≈ 90:1 at 890 kN / 1,000 kg (computed, inherits the mass uncertainty).
- **Burn time:** 155 s.
- **Cooling:** Regenerative, **tube-wall** (brazed tube bundle), fuel-cooled.
- **Injector:** Flat-face impinging with baffles. (Wikipedia's "waterfall-type" phrasing
  is nonstandard; the H-1 uses a conventional Rocketdyne impinging pattern.)
- **Ignition:** **Triethylaluminum (TEA) pyrophoric slug** in a burst-diaphragm cartridge —
  the direct ancestor of the TEA-TEB used on Merlin fifty years later.
- **Turbopump:** Single geared turbopump, SPGG spin-start.
- **Major innovation:** Cost-down mass production. The H-1 was deliberately engineered to
  be *cheap and repeatable* rather than high-performing — Rocketdyne built hundreds.
- **Major limitation:** ε = 8 and pc under 700 psia leave a lot of Isp on the table; the
  eight-engine cluster was a reliability worry that never actually bit.
- **Historical significance:** Proved clustering worked, which made Saturn V credible.
  Directly evolved into the RS-27.
- **SOURCES:** Wikipedia, *Rocketdyne H-1* — https://en.wikipedia.org/wiki/Rocketdyne_H-1
  (fetched); enginehistory.org RPE series (pointer).
- **CONFIDENCE: medium-high** on thrust/Isp/pc; **low** on dry mass and vacuum thrust.

---

### Rocketdyne F-1

- **Manufacturer / country:** Rocketdyne. USA.
- **Development:** Air Force study contract 1955–57; component testing 1957; first
  full-stage firing **March 1959**; first engine delivery October 1963; flight rating
  December 1964. **First flight 9 November 1967** (Apollo 4); last flight
  **14 May 1973** (Skylab 1).
- **Vehicle:** Saturn V S-IC first stage — five engines.
- **Propellants:** LOX / RP-1.
- **Mixture ratio:** **2.27** (≈69% LOX / 31% RP-1 by mass).
  Flow: 1,789 kg/s LOX, 788 kg/s RP-1 — **2,577 kg/s total**, which is the number
  worth putting in front of students.
- **Cycle:** Gas generator, fuel-rich. The GG exhaust is dumped into the nozzle extension
  as a **film-cooling curtain** — this is why the F-1 nozzle extension needs no regen
  circuit and why the exhaust plume has that dark outer sheath.
- **Thrust:** **6,770 kN (1,522,000 lbf) sea level; 7,770 kN (1,746,000 lbf) vacuum**
  for the flight-rated engine. Early flights (Apollo 4, 6, 8) were flown at
  **6,700 kN (1,500,000 lbf)**. enginehistory.org gives 1,522,000 lbf SL / **1,748,200 lbf**
  vacuum — a 2,200 lbf difference from Wikipedia's vacuum figure, i.e. noise.
- **Chamber pressure:** **THIS IS CONTESTED.** Values in circulation:
  - **1,015 psia (70 bar)** — Wikipedia infobox, consistently.
  - **982 psia (67.7 bar)** — appears in NASA-derived F-1 documentation.
  - **1,125 psia (77.6 bar)** — enginehistory.org, and described elsewhere as the
    "unprecedented chamber pressure" reached in development.
  - **965 psia (66.5 bar)** — the figure in older Sutton editions and in the textbook's
    working draft.
  **Recommendation: quote ~1,015 psia (70 bar) injector-end as the nominal flight value,
  and state the spread explicitly.** The reason for the spread is almost certainly the
  measurement station: injector-end static pressure, nozzle stagnation pressure, and
  the *development* peak are three different numbers, and secondary sources rarely say
  which they mean. Do not let the textbook print a single unqualified value.
- **Isp:** **263 s sea level (260 s on the early engines); 304 s vacuum** (Wikipedia).
  enginehistory.org gives **265.4 s SL / 304.1 s vac**. The ~2 s SL spread is the same
  early-block vs flight-block distinction.
- **Expansion ratio:** **16:1** — including the nozzle extension. Undisputed.
- **Dry mass:** **8,400 kg (18,500 lb)**. Both sources agree.
- **Thrust-to-weight:** **94.1:1** at sea level.
- **Cooling:** Regenerative **tube-wall** — **178 brazed tubes**, fuel-cooled, down-and-back
  ("up-pass/down-pass") routing; plus GG-exhaust film cooling of the nozzle extension.
- **Chamber liner material:** Nickel-alloy (Inconel X-750 / Hastelloy) tubes brazed into
  an Inconel jacket, with steel bands.
- **Injector:** Flat-face **impinging, mixed doublet and triplet**, in the final
  **"5U(f)" pattern**, with a **copper baffle assembly** dividing the face into 13
  compartments. Reaching that pattern took **~2,000 tests across 210 injector designs,
  15 baffle designs and 14 injector configurations** under "Project Go" (1962–64).
  Stability was demonstrated by detonating a **bomb near the injector centre** at full
  thrust and requiring the engine to damp the induced oscillation within **45 ms**.
- **Ignition:** **Hypergolic cartridge** — a TEA/TEB slug in a burst-diaphragm cartridge
  ignites the chamber; a pyrotechnic igniter lights the gas generator.
- **Turbopump:** Single shaft, direct-drive (no gearbox), two-stage turbine driving a
  single-stage centrifugal LOX pump and a single-stage centrifugal RP-1 pump.
  **5,488 rpm** (enginehistory.org; Wikipedia rounds to 5,500), **55,000 bhp (41 MW)**.
  The turbopump alone outpowers a nuclear submarine's propulsion plant — a useful
  classroom line.
- **Major innovation:** Combustion stability at 1.5 million lbf in a single chamber.
  The baffled injector plus the deliberate bomb-testing protocol is the F-1's real
  technical legacy, more than the thrust number.
- **Major limitation:** ε = 16 and pc ≈ 70 bar are modest; the F-1 is a *big* engine, not
  an efficient one. It is also entirely expendable and was never restarted.
- **Historical significance:** Still the highest-thrust single-chamber liquid engine ever
  flown. The F-1A uprate reached ~1,800,000 lbf (8 MN) in test but never flew.
- **SOURCES:**
  - Wikipedia, *Rocketdyne F-1* — https://en.wikipedia.org/wiki/Rocketdyne_F-1 (fetched)
  - enginehistory.org, *Rocket Propulsion Evolution* §8.11 "F-1 Engine" —
    https://www.enginehistory.org/Rockets/RPE08.11/RPE08.11.shtml (fetched)
  - NASA NTRS 20140011656, *Waking a Giant: Bringing the Saturn F-1 Engine Back to Life* —
    https://ntrs.nasa.gov/api/citations/20140011656/downloads/20140011656.pdf
    (retrieved as binary; not text-extractable in this pass — **re-verify chamber pressure
    against this document before publication**)
  - heroicrelics.org, *F-1 Engine Thrust Chamber* — http://heroicrelics.org/info/f-1/f-1-thrust-chamber.html
- **CONFIDENCE: high** on thrust, Isp, mass, expansion ratio, turbopump and injector.
  **Low on chamber pressure** until an NTRS primary source is read as text.

---

### Rocketdyne J-2

- **Manufacturer / country:** Rocketdyne. USA.
- **Development:** Approval to Rocketdyne **1 June 1960**; production from May 1963.
  **First flight 26 February 1966** (AS-201). Retired with Apollo/Skylab.
- **Vehicles:** Saturn IB S-IVB (one engine); Saturn V S-II (five) and S-IVB (one).
- **Propellants:** LOX / LH2.
- **Mixture ratio:** **5.5:1 nominal.** The **propellant utilisation (PU) valve** could
  shift the ratio between **4.5:1 and 5.5:1**, trading thrust
  (**780–1,000 kN / 175,000–225,000 lbf**) against Isp — used both to burn the tanks dry
  simultaneously and to manage S-II acceleration.
- **Cycle:** Gas generator.
- **Thrust:** **1,033.1 kN (232,250 lbf) vacuum** at the 5.5:1 setting. Vacuum only —
  it never operates at sea level.
- **Chamber pressure:** **5,260 kPa = 52.6 bar (763 psia)**.
- **Isp:** **421 s vacuum.**
- **Expansion ratio:** **27.5:1.**
- **Dry mass:** **1,788.1 kg (3,942 lb)**.
- **Thrust-to-weight:** ≈ 59:1 (computed).
- **Cooling:** Regenerative, **tube-wall**, fuel-cooled.
- **Injector:** **Coaxial (concentric-element) shear injector — 614 hollow oxidizer posts
  with concentric fuel annuli**, through a **porous sintered stainless-steel faceplate**
  that transpiration-cools the face with hydrogen. This is the archetype for essentially
  every subsequent LOX/LH2 injector.
- **Ignition:** **Augmented spark igniter (ASI)** with dual spark plugs — a small
  LOX/LH2 torch at the injector centre. Also the archetype; the RS-25 uses the same idea.
- **Turbopump:** **Separate, independently driven pumps in series on the GG exhaust.**
  Fuel pump: **7-stage axial, 27,000 rpm**. Oxidizer pump: **single-stage centrifugal,
  8,600 rpm**. The GG gas passes through the fuel turbine first, then the oxidizer
  turbine — a series arrangement that makes the mixture ratio self-regulating.
- **Restart:** Yes — the S-IVB restarted the J-2 for translunar injection. This required
  a separate ambient helium start-tank and settling motors.
- **Major innovation:** The first flight-proven restartable, high-performance LOX/LH2
  engine, and the coaxial-post injector with a transpiration-cooled porous face.
- **Major limitation:** Gas-generator cycle dumps ~2–3% of propellant overboard; ε = 27.5
  is small for a vacuum engine because the S-IVB interstage constrained the nozzle.
- **Historical significance:** The engine that actually performed translunar injection.
- **J-2S (uprated, tested 1965–72, never flown):** **1,138.5 kN (255,945 lbf)**, Isp
  **436 s**, dry mass **1,400 kg**, and — importantly for the textbook — it replaced the
  gas generator with a **tap-off cycle**, bleeding hot gas from the main chamber. The
  J-2S is the best historical example of a tap-off engine after the BE-3.
- **SOURCES:** Wikipedia, *Rocketdyne J-2* — https://en.wikipedia.org/wiki/Rocketdyne_J-2
  (fetched); Encyclopedia Astronautica *J-2*, *J-2S* (pointers).
- **CONFIDENCE: high.**

---

### Rocketdyne / Aerojet Rocketdyne J-2X

- **Manufacturer / country:** Pratt & Whitney Rocketdyne → Aerojet Rocketdyne. USA.
- **Development:** Formally announced **July 2007** for Ares I upper stage / Ares V EDS.
  Extensive hot-fire at Stennis A-2 and A-3, 2011–2013. Program moved to **"idle"
  status after 2014** when SLS Block 1B adopted the RL10 for the EUS. **Never flown.**
- **Vehicles:** Intended for Ares I upper stage, Ares V Earth Departure Stage, and
  early SLS upper-stage concepts.
- **Propellants:** LOX / LH2. **Mixture ratio:** 5.5:1.
- **Cycle:** Gas generator (deliberately, for schedule and cost — not a performance choice).
- **Thrust:** **1,307–1,310 kN (294,000 lbf) vacuum.**
- **Chamber pressure:** **~1,332–1,337 psia (91.9–92.2 bar)** — sources give both;
  the difference is rounding. Roughly **double** the J-2's.
- **Isp:** **448 s vacuum.**
- **Expansion ratio:** **92:1** (with the nozzle extension).
- **Dry mass:** **2,472 kg (5,450 lb)**.
- **Thrust-to-weight:** ≈ 54:1 (computed).
- **Cooling:** Regenerative **milled-channel** chamber (a deliberate change from the J-2's
  brazed tube wall), with a **film-cooled / radiatively cooled nozzle extension**.
- **Injector:** Coaxial, J-2/RS-25 heritage. **Ignition:** augmented spark igniter.
- **Turbopump:** **Centrifugal** fuel pump replacing the J-2's axial pump — one of the
  four changes the program itself listed. Separate fuel and oxidizer turbopumps.
- **Design deltas from J-2 (as stated by the program):** removal of beryllium; modern
  electronics; centrifugal rather than axial fuel turbopump; **channel-walled combustion
  chamber rather than tube-welded**.
- **Major innovation:** Demonstrated that a modern GG hydrogen engine could reach 448 s
  with a 92:1 nozzle and be built with contemporary manufacturing.
- **Major limitation:** Heavy (2.47 t for 1.31 MN) and it never flew — a complete,
  well-characterised engine with no vehicle.
- **Historical significance:** The most thoroughly tested American rocket engine never to
  fly; a cautionary tale about engine development decoupled from vehicle commitment.
- **SOURCES:** Wikipedia, *Rocketdyne J-2* and *J-2X* — https://en.wikipedia.org/wiki/J-2X;
  NASA NTRS 20100034922, *The J-2X Upper Stage Engine: From Design to Hardware* —
  https://ntrs.nasa.gov/api/citations/20100034922/downloads/20100034922.pdf (pointer,
  not text-extracted this pass); NASA news release, *J-2X Engine Ready for 'Higher'
  Level of Tests*.
- **CONFIDENCE: medium-high.** Chamber pressure should be pinned to the NTRS paper
  (1,332 vs 1,337 psia) before printing.

---

### Pratt & Whitney RL10A-3-3A

- **Manufacturer / country:** Pratt & Whitney (West Palm Beach) → Aerojet Rocketdyne →
  **L3Harris Aerojet Rocketdyne**. USA.
- **Development:** RL10 family from 1958; first flight of the family **1962**. The
  **-3-3A** block entered service in **1986** and flew through the Atlas IIAS / Titan
  Centaur era into the early 2000s.
- **Vehicles:** Centaur upper stage (Atlas I/II/IIA/IIAS, Titan IV Centaur), Delta III.
- **Propellants:** LOX / LH2. **Mixture ratio: 5.0:1.**
- **Cycle:** **Closed expander.** No preburner, no gas generator. Hydrogen is heated in the
  chamber-wall cooling channels, drives the turbine, then is injected and burned. Nothing
  is dumped — this is the defining feature and the reason the RL10 is the standard
  classroom example of the expander cycle.
- **Thrust:** **16,500 lbf (73.4 kN) vacuum.**
- **Chamber pressure:** **475 psia (32.8 bar).** Low by design — the expander cycle is
  limited by how much heat the chamber wall can put into the hydrogen, which scales with
  surface area (≈ D²) while thrust scales with throat area, so pc has a hard ceiling.
  This "expander cycle thrust limit" is the single most useful pedagogical point in the block.
- **Isp:** **444–445 s vacuum.**
- **Expansion ratio:** **61:1.**
- **Dry mass:** ~**300 lb (136 kg)** class for this block. *Medium confidence* — the
  L3Harris table gives 370 lb for the later RL10A-4-2 and 420 lb for the RL10C-1.
- **Thrust-to-weight:** ≈ 55:1 (computed, inherits mass uncertainty).
- **Cooling:** Regenerative, **brazed stainless-steel tube-wall**, hydrogen-cooled —
  and the cooling circuit *is* the power cycle.
- **Injector:** Coaxial shear (concentric LOX post / hydrogen annulus).
- **Ignition:** Spark torch igniter.
- **Turbopump:** **Single shaft with a reduction gearbox.** A two-stage centrifugal
  hydrogen pump on the high-speed shaft drives, through gearing, a single-stage
  centrifugal LOX pump on a slower shaft. Hydrogen pump speed ~**31,000 rpm**;
  the gearbox is one of the RL10's most distinctive and most-copied features.
  *rpm figure is medium confidence.*
- **Major innovation:** The first flight LOX/LH2 engine of any kind (1962), and the first
  closed expander cycle. Also the first engine designed from the start for multiple restarts.
- **Major limitation:** Thrust is capped by the expander heat balance; the engine cannot
  simply be scaled up without going to expander *bleed* or a preburner.
- **Historical significance:** Over six decades in continuous production — the longest
  service life of any rocket engine, ever.
- **SOURCES:**
  - NASA CR-190786, *An RL10A-3-3A Rocket Engine Model* —
    https://ntrs.nasa.gov/api/citations/19950017370/downloads/19950017370.pdf
  - NASA TM-107318, *RL10A-3-3A Rocket Engine Modeling Project* —
    https://ntrs.nasa.gov/api/citations/19970010379/downloads/19970010379.pdf
    (both located; PDF text extraction failed this pass — figures come from the search
    summary of these two documents and should be re-read directly before printing)
  - L3Harris, *RL10 Engine* — https://www.l3harris.com/all-capabilities/rl10-engine (fetched)
  - Encyclopedia Astronautica, *RL-10A-3A* (pointer)
- **CONFIDENCE: medium-high** on thrust / pc / Isp / ε / MR (four sources agree);
  **medium** on mass and turbopump speed.

---

### Aerojet Rocketdyne RL10B-2

- **Manufacturer / country:** Pratt & Whitney → Aerojet Rocketdyne → L3Harris. USA.
- **Development:** Early–mid 1990s for the Delta III second stage. **First flight 1998.**
- **Vehicles:** Delta III second stage; **Delta IV DCSS**; **SLS ICPS** (still flying).
- **Propellants:** LOX / LH2. **Mixture ratio: 5.88:1.**
- **Cycle:** Closed expander.
- **Thrust:** **110.1 kN (24,750 lbf) vacuum.** Wikipedia and L3Harris agree exactly.
- **Chamber pressure:** **Not published** in the manufacturer or Wikipedia sources fetched.
  Encyclopedia Astronautica quotes ~44 bar (~640 psia); **low confidence — do not print
  without a primary source.**
- **Isp:** **465.5 s vacuum.** The highest specific impulse of any flown chemical rocket
  engine. Both Wikipedia and L3Harris give this figure.
- **Expansion ratio:** **CONTESTED.** Wikipedia's table says **280:1**; the AIAA/SEP
  carbon-carbon nozzle literature says the extension raises it **from 77:1 to 285:1**.
  **Recommendation: quote 285:1 deployed / 77:1 retracted**, citing the nozzle paper,
  and note the 280:1 figure as a rounding that appears in secondary tables.
- **Dry mass:** **301 kg (664 lb)** — Wikipedia and L3Harris agree.
- **Thrust-to-weight:** ≈ 37:1 (computed).
- **Cooling:** Regenerative tube-wall chamber; the **nozzle extension is uncooled
  radiatively-cooled carbon–carbon**.
- **Nozzle extension:** **NOVOLTEX® SEPCARB® 3D carbon–carbon**, made by SEP (Snecma),
  ~100 in (2.5 m) long, exit diameter just over 84 in (2.1 m) — the largest
  carbon–carbon extendible nozzle ever flown. It **translates into place after stage
  separation** and is worth ~30 s of Isp.
- **Injector:** Coaxial shear. **Ignition:** spark torch.
- **Turbopump:** Geared single-shaft, RL10 heritage.
- **Major innovation:** The extendible carbon–carbon nozzle — packaging a 285:1 expansion
  ratio into an interstage sized for 77:1.
- **Major limitation:** The deployment mechanism is a single-point failure with no
  meaningful abort mode, and the engine is heavy for its thrust.
- **Historical significance:** Holds the flown Isp record; still flying on SLS.
- **SOURCES:** Wikipedia, *RL10* — https://en.wikipedia.org/wiki/RL10 (fetched);
  L3Harris, *RL10 Engine* (fetched); *Testing of the RL10B-2 carbon-carbon nozzle
  extension* (AIAA/Acta Astronautica; https://www.sciencedirect.com/science/article/abs/pii/S0094576501001783).
- **CONFIDENCE: high** on thrust, Isp, mass; **medium** on expansion ratio (two values);
  **low** on chamber pressure (not published).

---

### Aerojet Rocketdyne RL10C-1

- **Manufacturer / country:** Aerojet Rocketdyne → L3Harris. USA.
- **Development:** Consolidation of the RL10A-4-2 and RL10B-2 production lines into a
  single common engine, ~2010–2014. **First flight 2014.**
- **Vehicles:** Atlas V Centaur (single- and dual-engine), Vulcan Centaur V (as RL10C-1-1).
- **Propellants:** LOX / LH2. **Mixture ratio: 5.5:1.**
- **Cycle:** Closed expander.
- **Thrust:** **CONTESTED, mildly.** Wikipedia: **101.5 kN (22,820 lbf)**.
  L3Harris (manufacturer): **22,890 lbf (101.8 kN)**.
  **Recommendation: use the manufacturer's 22,890 lbf**; the 70 lbf difference is
  immaterial but the textbook should cite the primary.
- **Chamber pressure:** **Not published** by the manufacturer. *Do not guess.*
- **Isp:** **449.7 s vacuum** — Wikipedia and L3Harris agree exactly.
- **Expansion ratio:** **130:1** (fixed nozzle, no extension). Wikipedia only.
- **Dry mass:** **190 kg (420 lb)** — both sources agree.
- **Thrust-to-weight:** ≈ 55:1 (computed).
- **Cooling / injector / ignition / turbopump:** RL10 family standard — regenerative
  tube-wall, coaxial shear injector, spark torch igniter, geared single-shaft turbopump.
- **Major innovation:** Not technical — industrial. One engine replaces two production lines.
- **Major limitation:** Fixed 130:1 nozzle gives up ~16 s to the RL10B-2.
- **Historical significance:** The current production RL10 and the baseline for the
  SLS Exploration Upper Stage (four RL10C-3s).
- **Family context (L3Harris manufacturer table, useful for the textbook):**

  | Variant | Thrust (lbf) | Isp (s) | Weight (lb) | O/F |
  |---|---|---|---|---|
  | RL10A-4-2 | 22,300 | 451.0 | 370 | 5.5 |
  | RL10B-2 | 24,750 | 465.5 | 664 | 5.88 |
  | RL10C-1 | 22,890 | 449.7 | 420 | 5.5 |
  | RL10C-3 | 24,340 | 460.1 | 508 | 5.7 |
  | RL10C-X | 24,120 | 460.9 | 510 | 5.5 |

  (RL10C-X is the additively-manufactured development variant.)
- **SOURCES:** L3Harris, *RL10 Engine* — https://www.l3harris.com/all-capabilities/rl10-engine
  (fetched); Wikipedia, *RL10* (fetched).
- **CONFIDENCE: high** on Isp, mass, and the manufacturer table; **medium** on thrust
  (two values 70 lbf apart); **low/absent** on chamber pressure.

---

### Aerojet Rocketdyne RS-25 (SSME Block II)

- **Manufacturer / country:** Rocketdyne → Pratt & Whitney Rocketdyne → Aerojet
  Rocketdyne → **L3Harris**. USA.
- **Development:** RFP issued 1970; **contract awarded 13 July 1971**; first complete
  engine test **16 March 1977**; **first flight 12 April 1981 (STS-1)**. Block II
  (new HPFTP) first flown on **STS-104 (2001)**. Now flying expendably on SLS.
- **Vehicles:** Space Shuttle orbiter (three engines); SLS core stage (four engines).
- **Propellants:** LOX / LH2. **Mixture ratio: 6.03:1** (L3Harris rounds to 6.0).
- **Cycle:** **Fuel-rich staged combustion, dual-shaft** — two independent preburners
  (one per turbopump), both fuel-rich, both exhausting into the main injector.
- **Thrust:**
  | Power level | Sea level | Vacuum |
  |---|---|---|
  | 100% RPL | 1,670 kN (380,000 lbf) | 2,090 kN (470,000 lbf) |
  | 104.5% NPL | 1,750 kN (390,000 lbf) | 2,170 kN (490,000 lbf) |
  | 109% FPL | 1,860 kN (418,000 lbf) | 2,279 kN (512,300 lbf) |

  The 109% column is confirmed independently by **L3Harris** (418,000 lbf SL /
  512,300 lbf vac), so it is the best-attested row.
- **Chamber pressure:** **2,994 psia (206.4 bar) at 109%.** Wikipedia and L3Harris agree
  exactly — this is one of the most solidly attested numbers in the file.
  At 104.5% it is ~2,870 psia (198 bar); at 100%, ~2,747 psia (189 bar) *(scaled, medium
  confidence — the scaling is very nearly linear in thrust but the textbook should say so).*
- **Isp:** **452.3 s vacuum / 366 s sea level** (L3Harris rounds vacuum to 452).
- **Expansion ratio:** **CONTESTED — the classic case.**
  - **69:1** — Wikipedia's infobox *and* L3Harris's own datasheet, labelled "area ratio".
  - **77.5:1** — appears in NASA/Rocketdyne training material and much of the
    aerodynamics literature, sometimes as "about 77.5:1".
  - **78:1** — also appears in the Wikipedia body text.
  **What is actually going on:** 69:1 is the *nozzle exit area / throat area* of the
  bell as built. The ~77.5:1 figures come from analyses that use a slightly different
  reference — most plausibly the exit area against a different throat definition, or an
  effective/aerodynamic area ratio. **Recommendation: print 69:1 as the geometric
  expansion ratio, cite L3Harris, and add a footnote that 77.5:1 is widely quoted and
  explain why.** Do not silently pick one; this specific discrepancy is a well-known
  trap and a good teaching moment about what "expansion ratio" means.
- **Dry mass:** **3,177 kg (7,004 lb)** per Wikipedia; **7,775 lb (3,526 kg)** per
  L3Harris. **These disagree by 771 lb (350 kg).** The likely explanation is that
  L3Harris quotes the *installed* engine including the heat shield, gimbal bearing and
  controller, while 7,004 lb is the bare powerhead-plus-nozzle. **Recommendation: quote
  L3Harris's 7,775 lb as the manufacturer figure and note the 7,004 lb variant.**
- **Thrust-to-weight:** **73.1:1** (Wikipedia, using the 7,004 lb mass and vacuum thrust).
  Recomputed on the L3Harris mass it is ~66:1. Another reason to be explicit about which
  mass is used.
- **Cooling:** Regenerative, **milled-channel** — **390 channels machined into the
  main-combustion-chamber liner**, hydrogen-cooled. The nozzle is a **1,080-tube brazed
  tube-wall**, also hydrogen-cooled.
- **Chamber liner material:** **NARloy-Z** (copper–silver–zirconium), electroformed-nickel
  closeout. This is the standard textbook example of a high-conductivity copper-alloy liner.
- **Injector:** **Coaxial shear**, 600 main elements, with the **augmented spark igniter
  (ASI)** at the centre of the face. Acoustic-resonator cavities in the injector face
  suppress high-frequency instability.
- **Ignition:** Augmented spark igniter — an H2/O2 torch at the injector centre, plus
  separate ASIs in each preburner.
- **Turbopump architecture:** **Four pumps, two shafts of interest:**
  - **LPFTP** — axial, ~**16,185 rpm**, hydrogen-turbine-driven.
  - **HPFTP** — **three-stage centrifugal, ~35,360 rpm, 71,140 hp (53.05 MW)**.
    Discharge ~7,000 psi.
  - **LPOTP** — ~**5,150 rpm**.
  - **HPOTP** — **two-stage centrifugal (main + preburner boost) on one shaft,
    ~28,120 rpm, 23,260 hp (17.34 MW)**.
  The HPFTP's 53 MW from a unit the size of a car engine is the standard
  power-density demonstration.
- **Throttle range:** 67%–109% RPL. Ground-tested to 111%.
- **Major innovation:** Reusable staged combustion at 206 bar with deep throttling —
  no other engine has combined all three.
- **Major limitation:** Cost and complexity. Between-flight inspection was enormous, and
  the engine is now flown expendably on SLS, which is a fair verdict on the reusability premise.
- **Historical significance:** The highest-chamber-pressure fuel-rich staged-combustion
  engine ever flown, and the benchmark against which every hydrogen engine is measured.
- **SOURCES:**
  - Wikipedia, *RS-25* — https://en.wikipedia.org/wiki/RS-25 (fetched)
  - L3Harris, *RS-25 Engine* — https://www.l3harris.com/all-capabilities/rs-25-engine (fetched)
  - NASA/Rocketdyne, *Space Transportation System Training Data: Space Shuttle Main
    Engine Orientation* — http://large.stanford.edu/courses/2011/ph240/nguyen1/docs/SSME_PRESENTATION.pdf
    (503 during this pass — **this is the document to read for the expansion-ratio question**)
- **CONFIDENCE: high** on thrust, chamber pressure, Isp, turbopump, cooling and injector.
  **Medium** on dry mass (two figures). **Contested** on expansion ratio — see above.

---

### Aerojet Rocketdyne RS-68A

- **Manufacturer / country:** Rocketdyne (Boeing) → Pratt & Whitney Rocketdyne →
  Aerojet Rocketdyne. USA.
- **Development:** RS-68 developed from the mid-1990s under a deliberate "design for
  minimum cost" brief for the EELV competition — roughly 80% fewer parts than the RS-25.
  **RS-68 first flight 20 November 2002**; **RS-68A** entered service 2012.
  **Last flight 9 April 2024** (final Delta IV Heavy). Retired.
- **Vehicles:** Delta IV Medium and Delta IV Heavy common booster cores.
- **Propellants:** LOX / LH2. **Mixture ratio: ~6.0** *(not stated in the sources fetched;
  low confidence — treat as not published)*.
- **Cycle:** **Gas generator** — chosen explicitly over staged combustion for cost. The
  GG exhaust is dumped through a side duct, which is why the engine's efficiency is low
  for a hydrogen engine.
- **Thrust:**
  - RS-68: **2,950 kN (660,000 lbf) SL / 3,370 kN (758,000 lbf) vac**
  - **RS-68A: 3,137 kN (705,000 lbf) SL / 3,560 kN (800,000 lbf) vac**
  (Note: some Rocketdyne material quotes "650,000 lb sea level thrust" for the original
  RS-68 — an early design figure, superseded.)
- **Chamber pressure:** **1,488 psia (102.6 bar)** for both. The RS-68A's uprate came
  from ~5 bar more chamber pressure plus a redesigned injector for better mixing
  efficiency — a rare case where the published delta is explained.
- **Isp:** RS-68 **365 s SL / 410 s vac**; **RS-68A 411.9 s vac**.
- **Expansion ratio:** **21.5:1** — very low for a hydrogen engine, because the nozzle is
  ablative and mass-limited.
- **Dry mass:** RS-68 **6,600 kg (14,560 lb)**; **RS-68A 6,740 kg (14,870 lb)**.
- **Thrust-to-weight:** RS-68 **45.3:1**; **RS-68A 47.4:1**. The lowest of any modern
  large booster engine — the direct price of the cost-driven design.
- **Cooling:** **Split.** The **main combustion chamber is regeneratively cooled**
  (hydrogen through channels in the chamber wall); the **nozzle is ablative** — a
  silica/carbon-phenolic liner that chars and erodes through the burn. The ablated carbon
  reacting with atmospheric oxygen is what produces the RS-68's famously bright orange
  exhaust and the spectacular hydrogen-fireball ignition.
- **Chamber liner material:** Copper-alloy regen liner; ablative phenolic nozzle.
- **Injector:** Coaxial; redesigned between RS-68 and RS-68A for mixing/combustion efficiency.
- **Ignition:** Pyrotechnic/spark, with a large pre-ignition hydrogen bloom (the "hydrogen
  burnoff" that scorches the booster).
- **Turbopump:** Separate fuel and oxidizer turbopumps on a gas-generator circuit.
  rpm and power **not published** in the sources consulted.
- **Major innovation:** Design-for-cost. It demonstrated that deliberately accepting
  lower performance (GG cycle, ablative nozzle, ε = 21.5) can be the right systems
  answer if the part count and touch labour fall far enough.
- **Major limitation:** Isp and T/W are poor for hydrolox; the ablative nozzle is
  single-use by definition, which foreclosed any reusability path.
- **Historical significance:** The largest hydrogen engine ever built by thrust, and the
  clearest counter-example to the assumption that engine development should maximise performance.
- **SOURCES:** Wikipedia, *RS-68* — https://en.wikipedia.org/wiki/RS-68 (fetched);
  *Propulsion for the 21st Century — RS-68* (AIAA/Rocketdyne, via search);
  Everyday Astronaut, *Engine Cooling* (secondary, for the regen-chamber/ablative-nozzle split);
  Encyclopedia Astronautica *RS-68* (pointer).
- **CONFIDENCE: high** on thrust, pc, Isp, ε, mass, T/W. **Low** on mixture ratio and
  turbopump detail (not published).

---

### Rocketdyne RS-27A

- **Manufacturer / country:** Rocketdyne. USA.
- **Development:** RS-27 developed **1974** to replace the MB-3 on Delta, built from H-1
  and MB-3 components. **RS-27A** in the 1980s–early 1990s with an extended nozzle for
  the Delta II. Last flight **ICESat-2, 15 September 2018** (final Delta II). Retired.
- **Vehicles:** Delta 2000/3000 (RS-27); **Delta II and Delta III first stages** (RS-27A).
- **Propellants:** LOX / RP-1. **Mixture ratio: ~2.25** *(not stated in the source; low
  confidence)*.
- **Cycle:** Gas generator.
- **Thrust:** **890.1 kN (200,100 lbf) SL / 1,054.2 kN (237,000 lbf) vacuum.**
  Note the RS-27A has **lower sea-level thrust than the RS-27** (971 kN) — the bigger
  nozzle costs SL thrust and buys vacuum performance. This is a clean textbook example
  of the nozzle trade and worth using as one.
- **Chamber pressure:** **4.8 MPa = 48 bar (700 psia)** (RS-27: 4.9 MPa / 710 psia).
- **Isp:** **255 s SL / 302 s vacuum** (RS-27: 264 s SL / 295 s vac — again, the trade).
- **Expansion ratio:** **12:1**, increased from the RS-27's **8:1**.
- **Dry mass:** **1,147 kg (2,529 lb)** (RS-27: 1,027 kg).
- **Thrust-to-weight:** ≈ 79:1 sea level (computed).
- **Burn time:** 265 s.
- **Cooling:** Regenerative tube-wall, fuel-cooled — direct H-1 heritage.
- **Injector:** Flat-face impinging. **Ignition:** pyrotechnic/hypergolic slug.
- **Turbopump:** Single geared turbopump, H-1/MB-3 heritage.
- **Major innovation:** None, deliberately — it is a parts-bin engine assembled from two
  mature designs to a fixed price.
- **Major limitation:** Ancient architecture; performance was uncompetitive by 2000.
- **Historical significance:** Powered the Delta II, the most reliable American launch
  vehicle of its era (100+ consecutive successes), which is an argument for conservative
  engine design that the textbook should make.
- **SOURCES:** Wikipedia, *RS-27* — https://en.wikipedia.org/wiki/RS-27 (fetched).
- **CONFIDENCE: medium.** Single source for the whole block; the numbers are internally
  consistent and match the RS-27→RS-27A story, but a second source is wanted.

---

## Part 3 — Commercial-era American engines

**A standing caveat for this entire section.** SpaceX, Blue Origin and Rocket Lab publish
almost nothing in the peer-reviewed or government-report literature. Most figures below
originate from company websites, press kits, conference talks, or executive social-media
posts, and several have changed silently over time. Where a number is a company claim, it
is labelled as one. The textbook should say so on the page, not bury it in a footnote.

### SpaceX Merlin 1D (sea level) and Merlin 1D Vacuum

- **Manufacturer / country:** SpaceX, Hawthorne CA. USA.
- **Development:** Merlin 1D developed **2011–2012**, qualified March 2013, **first flight
  29 September 2013** (Falcon 9 v1.1). Uprated repeatedly; the **Block 5** configuration
  reached its final 845 kN sea-level rating by **May 2018**.
- **Vehicles:** Falcon 9 (nine SL engines + one MVac), Falcon Heavy (27 + 1).
- **Propellants:** LOX / RP-1. **Mixture ratio: ~2.34** *(SpaceX does not publish this;
  low confidence — treat as not published)*.
- **Cycle:** **Gas generator**, open cycle, fuel-rich. A deliberate simplicity choice.
- **Thrust:**
  - **Merlin 1D (SL): 845 kN (190,000 lbf) sea level; 981 kN (221,000 lbf) vacuum.**
  - **Merlin 1D Vacuum (MVac): 981 kN (220,500 lbf) vacuum.**
  The coincidence that both quote ~981 kN vacuum is a known source of confusion — the
  SL engine's *vacuum* rating and the MVac's rating happen to be nearly identical, because
  the MVac trades chamber-pressure headroom for nozzle area rather than for thrust.
- **Chamber pressure:** **9.7 MPa = 97 bar (1,410 psi)**. Company figure; not
  independently verified.
- **Isp:**
  - Merlin 1D SL: **282 s SL / 311 s vacuum.**
  - **MVac: 348 s vacuum** — the highest specific impulse of any American hydrocarbon
    engine flown. **Note:** Wikipedia's MVac infobox has at times carried the SL engine's
    311 s in the vacuum field, flagged "needs update". Use 348 s.
- **Expansion ratio:** **16:1** (SL engine, up from 14.5:1 on Merlin 1C);
  **165:1** (MVac, with the niobium nozzle extension).
- **Dry mass:** **470 kg (1,030 lb)** for the SL engine. MVac mass **not published**.
- **Thrust-to-weight:** **184:1** — the highest of any flown orbital-class engine.
  This is a SpaceX claim, repeated widely, and it is at least plausible given the
  mass and thrust figures above (845 kN / 470 kg → 183:1 at sea level, which checks out).
- **Cooling:** Regenerative, **milled-channel**, RP-1-cooled chamber and nozzle.
  The MVac nozzle extension is **radiatively cooled niobium alloy** — visibly cherry-red
  in flight, which is normal, not a fault.
- **Injector:** **Pintle.** A single central pintle post, throttleable by design, and
  inherently stable. SpaceX's own material traces this directly to the **Apollo Lunar
  Module descent engine** — the same TRW lineage, six decades on.
- **Ignition:** **TEA-TEB** (triethylaluminium–triethylborane) pyrophoric slug, ground-fed
  on the first stage and carried aboard for MVac restarts.
- **Turbopump:** **Single-shaft, dual-impeller** — one shaft carries both the LOX and RP-1
  impellers and the turbine. **~36,000 rpm, ~10,000 hp (7,500 kW)**. Company figures.
- **Throttle:** originally 70–100%; **40–100%** after 2013 (SL engine). MVac **39–100%**
  (360–981 kN).
- **Notable design detail:** The TVC actuators run on **RP-1 tapped from the high-pressure
  side and returned to the low-pressure inlet** — there is no separate hydraulic fluid to
  run out, which is exactly the failure that has ended other vehicles.
- **Major innovation:** The pintle injector at production scale, and manufacturing
  cadence — hundreds of engines a year, an output no other liquid engine programme has matched.
- **Major limitation:** Gas-generator cycle and pc = 97 bar mean the Merlin will never be
  efficient; the design is optimised for cost, restart and reuse, not Isp.
- **Historical significance:** The first orbital-class engine to be routinely recovered
  and reflown, and the first to make reuse economically real.
- **SOURCES:** Wikipedia, *SpaceX Merlin* and *Merlin (rocket engine family)* —
  https://en.wikipedia.org/wiki/SpaceX_Merlin (both fetched); SpaceX Falcon 9 users'
  guide (pointer); Space Launch Report Falcon 9 data sheet —
  https://sma.nasa.gov/LaunchVehicle/assets/space-launch-report-falcon-9-data-sheet.pdf.
- **CONFIDENCE: medium-high** on thrust, Isp, ε, mass (multiply repeated and mutually
  consistent); **medium** on chamber pressure and turbopump (single-source company claims);
  **low/not published** on mixture ratio.

---

### SpaceX Raptor 1 / 2 / 3 — **ALL FIGURES ARE COMPANY CLAIMS**

- **Manufacturer / country:** SpaceX, McGregor TX and Hawthorne CA. USA.
- **Development:** Methane engine studies from ~2009; **first Raptor test firing
  25 September 2016** at McGregor. **Raptor 2** production began **18 December 2021**.
  **Raptor 3** reported first flight **22 May 2026** (Starship Flight Test 12).
- **Vehicles:** Starship / Super Heavy.
- **Propellants:** **Subcooled** liquid methane / liquid oxygen. The subcooling (densified
  propellant) is integral to the design, not an operational nicety.
- **Mixture ratio: 3.6:1** (≈78% O2 / 22% CH4).
- **Cycle:** **Full-flow staged combustion (FFSC)** — an **oxidizer-rich preburner**
  driving the LOX turbopump and a **fuel-rich preburner** driving the CH4 turbopump, with
  *both* preburner exhausts entering the main chamber. Every gram of propellant passes
  through a turbine. Only the Soviet **RD-270** (never flown) and the American
  **Integrated Powerhead Demonstrator** (test only) preceded it; **Raptor is the first
  FFSC engine ever flown.** That is the single most important fact in this block.
- **Performance — as claimed, by version:**

  | | Raptor 1 | Raptor 2 | Raptor 3 |
  |---|---|---|---|
  | Thrust SL | 185 tf ≈ **1,814 kN (408,000 lbf)** | 230 tf ≈ **2,256 kN (507,000 lbf)** | 250 tf ≈ **2,452 kN (551,000 lbf)** (280 tf max on ground test) |
  | Thrust vac | 200 tf ≈ 1,962 kN | 258 tf ≈ **2,530 kN** | 275 tf ≈ 2,697 kN |
  | Chamber pressure | **250 bar (3,626 psia)** | **300 bar (4,351 psia)** | **330 bar (4,786 psia)** operational |
  | Isp | 327 s SL / 350 s vac | 347 s SL | ~350 s |
  | Dry mass | **2,080 kg** | **1,630 kg** | **1,525 kg** |
  | T/W | 88.9 | **141.1** | **163.9** |
  | Expansion ratio | 34.34 (SL) / 80 (vac variant) | ~34.3 / ~80 | ~34.3 / ~80 |

- **Chamber pressure context:** at 300–330 bar Raptor 2/3 exceed the RS-25's 206 bar and
  the RD-180's 267 bar, making it (if the claims hold) the highest-chamber-pressure
  production rocket engine ever built.
- **Cooling:** Regenerative, methane-cooled milled channels. Raptor 3 additionally
  integrates much of the secondary plumbing into the castings/prints, which is where a
  large part of the claimed mass reduction comes from.
- **Injector:** **Coaxial swirl** (from Raptor 2 onward).
- **Ignition:** **Torch igniters** in the preburners. Raptor 2 **eliminated the main-chamber
  igniter** entirely — the preburner torches and the hot preburner gas light the main
  chamber. Earlier Raptors used spark torch ignition; no TEA-TEB, which matters for
  on-orbit relight.
- **Turbopumps:** Two — one oxidizer-rich, one fuel-rich, mechanically independent.
  Speeds and shaft powers **not published**.
- **What independent data exists:** FAA licensing and environmental documents for Starship
  give thrust and propellant-load figures that are broadly consistent with the SL thrust
  claims, and flight telemetry / acoustic analysis by third parties has been used to
  cross-check total liftoff thrust. **No independent verification exists for chamber
  pressure, Isp, dry mass or T/W** — those rest entirely on SpaceX statements, several of
  which were first made on Twitter/X by Elon Musk rather than in any document.
  The Raptor 2 thrust figures in particular trace to an **August 2020 Musk tweet**.
- **Major innovation:** First flown full-flow staged combustion engine; first flown
  methalox engine at booster scale; deep throttling with rapid reuse.
- **Major limitation:** The claims are unaudited, the version history is not documented in
  any stable public record, and early Raptors had a poor reliability record in flight.
- **Historical significance:** If the numbers are broadly right, Raptor is the highest
  performance-density rocket engine ever built. The textbook should present it as the
  frontier *and* as an object lesson in the difference between published data and
  verified data.
- **SOURCES:** Wikipedia, *SpaceX Raptor* — https://en.wikipedia.org/wiki/SpaceX_Raptor
  (fetched; the article itself flags which figures come from Musk tweets and which from
  FAA documents); FAA Starship licensing/environmental documents (pointer).
- **CONFIDENCE: LOW-MEDIUM, and this label is the point.** Thrust and cycle: medium-high.
  Chamber pressure, Isp, mass, T/W: **low — company claims only.** Print them with the
  attribution attached.

---

### Blue Origin BE-3PM

- **Manufacturer / country:** Blue Origin, Kent WA. USA.
- **Development:** Announced **January 2013**; **first flight 29 April 2015** on
  New Shepard. Status: dormant/superseded (New Shepard continues to fly it).
- **Vehicle:** New Shepard suborbital booster (single engine).
- **Propellants:** LOX / LH2.
- **Mixture ratio:** **Not published.**
- **Cycle:** **Tap-off.** Hot gas is bled directly from the main combustion chamber to
  drive the turbopump — no preburner and no gas generator. The other flown tap-off
  examples are the J-2S (never flown operationally) and the Saturn LR87-LH2 studies, so
  **the BE-3 is effectively the only tap-off engine in regular service** and is the
  right worked example for that cycle in the textbook.
- **Thrust:** **490 kN (110,000 lbf) sea level** at full power;
  **minimum 89 kN (20,000 lbf)** — a **18–100% throttle range**, which is extraordinary
  and is what makes propulsive vertical landing on a single engine possible.
- **Chamber pressure:** **Not published.**
- **Isp:** **Not published** for the PM variant.
- **Expansion ratio, dry mass, injector, ignition, turbopump detail:** **Not published.**
- **Cooling:** Regenerative *(stated generally by Blue Origin; not documented in detail)*.
- **Major innovation:** Deep throttling (18%) on a hydrogen engine, and the tap-off cycle
  in operational service.
- **Major limitation:** Almost nothing about it is publicly documented; it is a suborbital
  engine with no orbital application.
- **Historical significance:** The engine behind the first vertical landing and reflight
  of a liquid-fuelled rocket booster (New Shepard, November 2015).
- **SOURCES:** Wikipedia, *BE-3* — https://en.wikipedia.org/wiki/BE-3 (fetched);
  Blue Origin product pages (pointer).
- **CONFIDENCE: medium** on thrust, throttle range, cycle and dates. **Most of the
  parameter set is genuinely not published** — say so rather than filling it in.

---

### Blue Origin BE-3U

- **Manufacturer / country:** Blue Origin. USA.
- **Development:** From ~2015, with the extendible nozzle funded separately.
  **First orbital flight 16 January 2025** on New Glenn. Active.
- **Vehicle:** New Glenn second stage — two engines.
- **Propellants:** LOX / LH2. **Mixture ratio: not published.**
- **Cycle:** **Expander bleed** — *not* the tap-off cycle of the BE-3PM. Blue Origin
  changed the cycle for the vacuum variant. Getting this distinction right matters:
  the BE-3PM and BE-3U share a name and very little else in the power cycle.
- **Thrust:** the published figure has moved:
  - Original specification: **711.5 kN (160,000 lbf)**
  - Improved: **889.5 kN (200,000 lbf)**
  - Demonstrated: **941.5 kN (211,658 lbf)**
  **Recommendation: quote 710 kN as the design point and note the uprate history**, since
  it is unclear which figure is flight-nominal.
- **Chamber pressure:** **Not published.**
- **Isp:** **445 s vacuum** (company figure).
- **Expansion ratio:** **Not published** (an extendible nozzle is used).
- **Dry mass:** **Not published**, but the company quotes a **thrust-to-weight of 90:1**,
  which back-solves to ~1,000 kg at 889 kN. *Derived, low confidence.*
- **Throttle:** 75–100%.
- **Cooling / injector / ignition / turbopump:** **Not published.**
- **Major innovation:** A high-Isp expander-bleed hydrogen engine at nearly 900 kN — far
  above the thrust class where expander cycles are usually considered viable, which the
  bleed architecture is precisely what enables.
- **Major limitation:** Undocumented; and the shifting thrust figures make independent
  performance assessment impossible.
- **Historical significance:** The upper-stage engine of the first new American
  heavy-lift vehicle since Delta IV Heavy.
- **SOURCES:** Wikipedia, *BE-3* — https://en.wikipedia.org/wiki/BE-3 (fetched).
- **CONFIDENCE: low-medium.** Cycle, propellants, Isp and dates are reasonably firm;
  thrust has three published values; most other parameters are not published.

---

### Blue Origin BE-4

- **Manufacturer / country:** Blue Origin, Huntsville AL (production). USA.
- **Development:** Work began **2011**; publicly announced **September 2014**; first
  hotfire **October 2017**; **first flight 8 January 2024** (Vulcan Centaur Cert-1).
- **Vehicles:** **ULA Vulcan Centaur** (two engines) and **Blue Origin New Glenn**
  (seven engines, first stage).
- **Propellants:** LOX / **liquid methane (LNG)**. **Mixture ratio: not published.**
- **Cycle:** **Oxidizer-rich staged combustion** — a single oxygen-rich preburner whose
  turbine drives **both** the fuel and oxidizer pumps. This is the American adoption of
  the Soviet ORSC architecture, and the first US-designed ORSC engine to fly.
- **Thrust:** **2,460 kN (550,000 lbf) sea level** as originally specified;
  **2,847 kN (640,000 lbf)** at the improved performance stated in **November 2025**.
  Vacuum thrust **not published**. **Recommendation: quote 2,450 kN as the baseline and
  note the 2025 uprate**, because it is not yet clear which vehicles fly which rating.
- **Chamber pressure:** **140 bar (2,030 psia)** — deliberately *low* for an ORSC engine
  (compare RD-180 at 267 bar). Blue Origin has been explicit that this is a life-and-
  reusability choice, not a limitation.
- **Isp:** **340 s** (sea level, company figure).
- **Expansion ratio:** **Not published.**
- **Dry mass:** **5,400 kg (11,900 lb)** for the original configuration.
- **Thrust-to-weight:** ≈ 46:1 at 2,460 kN / 5,400 kg (computed). Modest.
- **Throttle:** **40–100%.**
- **Cooling:** Regeneratively cooled thrust chamber, **methane** as the coolant.
- **Injector:** Full-scale injector elements were tested during development; the element
  type is **not published**.
- **Ignition:** Relightable in flight via a **head-pressure start** — tank pressure spins
  the turbine up without a separate start cartridge or spin-start system.
- **Turbopump:** ~**75,000 hp (56 MW)**, and notably uses **hydrostatic bearings rather
  than rolling-element bearings** — a life-driven choice aimed at reuse.
- **Major innovation:** ORSC on methane, with hydrostatic bearings and a low chamber
  pressure chosen for engine life. It is the clearest example in the file of designing an
  engine around *reuse* rather than around peak performance.
- **Major limitation:** Poor thrust-to-weight, and a development that ran roughly five
  years late, which delayed two launch vehicles.
- **Historical significance:** Ended American dependence on the Russian RD-180 for
  national-security launch.
- **SOURCES:** Wikipedia, *BE-4* — https://en.wikipedia.org/wiki/BE-4 (fetched);
  Blue Origin and ULA statements (pointers).
- **CONFIDENCE: medium.** Cycle, propellants, pc, throttle, mass, bearings and start
  method are consistently reported. Thrust has two ratings; Isp, ε and mixture ratio are
  single-source or unpublished.

---

### Rocket Lab Rutherford (sea level and vacuum)

- **Manufacturer / country:** Rocket Lab, Auckland NZ / Long Beach CA. New Zealand–USA.
- **Development:** **First test firing 2013**; flight qualification **March 2016**;
  **first flight 25 May 2017**. In production; by April 2024, 369 engines had flown
  across 47 Electron flights.
- **Vehicle:** Electron — **nine sea-level Rutherfords** on stage 1, **one vacuum
  Rutherford** on stage 2.
- **Propellants:** LOX / RP-1. **Mixture ratio: not published.**
- **Cycle:** **Electric pump-fed** — the first such engine ever flown. Two **brushless DC
  motors** driving the propellant pumps, powered by **lithium-polymer batteries**. There
  is no turbine, no gas generator, and no power-cycle propellant loss at all.
- **Thrust:** **SL: 24.9 kN (5,600 lbf). Vacuum: 25.8 kN (5,800 lbf)** (vacuum variant,
  larger nozzle).
- **Chamber pressure:** **Not published.**
- **Isp:** **311 s sea level; 343 s vacuum.**
- **Expansion ratio:** **Not published** for either variant.
- **Dry mass:** **35 kg (77 lb)**.
- **Thrust-to-weight:** **72.8:1**. Note this is *engine* T/W and excludes the batteries,
  which is the honest criticism of the electric-pump cycle — the stage-level figure is
  much worse, and the batteries are partly jettisoned in flight to manage it.
- **Electric system:** **two motors, 37 kW (50 hp) each at 40,000 rpm**. The stage-1
  battery pack supplies **over 1 MW (1,300 hp)** to run all nine engines.
- **Claimed efficiency:** ~**95%** for the electric pump drive versus ~50% for a
  gas-generator turbine. This is a Rocket Lab claim; it is comparing different things
  (electrical-to-hydraulic efficiency versus thermodynamic cycle efficiency) and the
  textbook should not repeat it uncritically.
- **Cooling:** Regenerative — cold RP-1 through channels embedded in the printed chamber.
- **Manufacturing:** **Chamber, injectors, pumps and main propellant valves are all
  3D-printed** by laser powder bed fusion / DMLS. Rutherford was the first engine to fly
  with essentially the entire primary structure additively manufactured.
- **Injector / ignition:** **Not published** in detail; spark ignition.
- **Major innovation:** The electric pump cycle, and end-to-end additive manufacturing.
- **Major limitation:** The battery mass is carried as pure parasitic weight, which caps
  the approach at small vehicles; Rocket Lab itself moved to ORSC (Archimedes) for Neutron.
- **Historical significance:** The first fundamentally new propellant-feed architecture to
  reach orbit since the turbopump.
- **SOURCES:** Wikipedia, *Rutherford (rocket engine)* —
  https://en.wikipedia.org/wiki/Rutherford_(rocket_engine) (fetched); Rocket Lab
  published material (pointer).
- **CONFIDENCE: medium-high** on thrust, Isp, mass, motor power and manufacturing;
  **not published** on chamber pressure, expansion ratio, mixture ratio.

---

### Rocket Lab Archimedes

- **Manufacturer / country:** Rocket Lab, Long Beach CA. USA/NZ.
- **Development:** Announced 2021; cycle changed to ORSC during development; first
  hotfire 2024; **full-mission-duration hot fire completed August 2025**. **In development,
  not yet flown.**
- **Vehicle:** **Neutron** — nine on stage 1, one vacuum-optimised on stage 2.
- **Propellants:** LOX / liquid methane. **Mixture ratio: not published.**
- **Cycle:** **Oxidizer-rich staged combustion.** Rocket Lab has stated the change from
  its original gas-generator design was forced by the requirement to hold performance
  "through all the throttle points that a reusable rocket needs" — a directly quotable
  justification for ORSC in a reuse context.
- **Thrust:** **730 kN (165,000 lbf) sea level; 890 kN (200,000 lbf) vacuum.**
- **Chamber pressure:** **Not published.**
- **Isp:** **329 s sea level; 365 s vacuum.**
- **Expansion ratio:** **Not published.**
- **Dry mass:** **Not published.**
- **Throttle:** **50–100%.**
- **Cooling / injector / ignition / turbopump:** **Not published.** Mostly 3D printed.
- **Major innovation:** Deliberately de-rated ORSC — Rocket Lab has said Archimedes runs
  well below its structural capability specifically to extend life between reflights.
- **Major limitation:** Unflown. Every number is a company projection.
- **Historical significance:** Pending.
- **SOURCES:** Wikipedia, *Archimedes (rocket engine)* —
  https://en.wikipedia.org/wiki/Archimedes_(rocket_engine) (fetched); Rocket Lab
  investor and press material (pointer).
- **CONFIDENCE: low.** Company claims for an unflown engine. Thrust and Isp are the only
  figures with any circulation; treat everything as provisional.

---

### SpaceX SuperDraco

- **Manufacturer / country:** SpaceX. USA.
- **Development:** Announced **1 February 2012**; qualification complete **May 2014**;
  **first flight (pad abort test) 6 May 2015**. In service.
- **Vehicle:** **Crew Dragon** launch escape system — **eight engines in four pods of two**.
- **Propellants:** **MMH / N2O4**, storable hypergolic. Propellant load **1,388 kg (3,060 lb)**.
- **Mixture ratio:** **Not published.**
- **Cycle:** **Pressure-fed** (helium).
- **Thrust:** **71 kN (16,000 lbf) each at sea level**; a pod pair produces 32,000 lbf;
  all eight give ~568 kN.
- **Chamber pressure:** **6.9 MPa = 69 bar (1,000 psi)** — exceptionally high for a
  pressure-fed engine, and the reason the helium system is so substantial.
- **Isp:** **235 s sea level.** Low, as expected for a short, low-ε abort engine.
- **Expansion ratio:** **Not published**; visibly small.
- **Dry mass:** **Not published.**
- **Throttle:** **20–100%** — genuinely deep throttling on a hypergolic pressure-fed engine.
- **Burn time:** ~25 s.
- **Cooling:** **Regenerative** — unusual for a hypergolic abort engine, most of which are
  ablative or film-cooled, and necessary here because the engine must be restartable and
  reusable.
- **Chamber material:** **3D-printed Inconel** by direct metal laser sintering. This was
  the first 3D-printed combustion chamber to fly on a crewed spacecraft.
- **Injector:** **Not published** (pintle is likely given SpaceX practice, but this is
  inference — do not print it as fact).
- **Ignition:** Hypergolic; no igniter.
- **Major innovation:** A printed, regeneratively cooled, deeply throttleable, restartable
  hypergolic engine — and the integration of abort propulsion into the spacecraft rather
  than a jettisoned tower.
- **Major limitation:** The propellants are toxic and the system rides all the way to
  orbit; the original propulsive-landing application was abandoned after a **April 2019
  ground-test explosion** traced to NTO leaking past a check valve into a helium line.
- **Historical significance:** The first integrated (non-tower) launch escape system on an
  American crewed vehicle, and the reason Crew Dragon has abort coverage through the
  whole ascent.
- **SOURCES:** Wikipedia, *SuperDraco* — https://en.wikipedia.org/wiki/SuperDraco (fetched).
- **CONFIDENCE: medium.** Thrust, pc, Isp, propellants, throttle and manufacturing are
  well reported; mass, ε, injector and mixture ratio are not published.

---

### SpaceX Draco

- **Manufacturer / country:** SpaceX. USA.
- **Development:** ~2008–2010; **first flight December 2010** (Dragon C1). In service.
- **Vehicle:** Dragon 1 (18 thrusters) and Dragon 2 (16 thrusters) — attitude control,
  orbital manoeuvring, deorbit. Sources differ on 16 vs 18; the count changed between
  Dragon variants.
- **Propellants:** **MMH / NTO**, storable hypergolic.
- **Mixture ratio:** **Not published.**
- **Cycle:** Pressure-fed.
- **Thrust:** **400 N (90 lbf) vacuum.**
- **Chamber pressure:** **Not published.**
- **Isp:** **300 s vacuum.**
- **Expansion ratio:** **Not published.**
- **Dry mass:** **Not published.**
- **Cooling:** Film/radiative *(not documented; inferred from class — flag as such)*.
- **Injector / ignition:** Not published; hypergolic, no igniter.
- **Major innovation:** None claimed — it is a conventional small hypergolic thruster,
  notable mainly for being built in-house rather than bought from Aerojet or Ariane.
- **Major limitation:** Undocumented; performance is unremarkable for the class.
- **Historical significance:** Useful in the textbook as a direct modern comparison to the
  R-4D: **400 N at 300 s (Draco, 2010) versus 490 N at 312 s (R-4D, 1965)** — fifty years
  and the small-hypergolic state of the art barely moved, which is itself the lesson.
- **SOURCES:** Wikipedia, *SpaceX Draco* — https://en.wikipedia.org/wiki/SpaceX_Draco
  and *Draco (rocket engine family)* (fetched).
- **CONFIDENCE: medium** on thrust and Isp; **low/not published** on everything else.

---

## Part 4 — European engines

### Snecma / ArianeGroup Vulcain 2 and Vulcain 2.1

- **Manufacturer / country:** Snecma Moteurs → **ArianeGroup**, France (prime).
  International workshare: **Avio (Italy)** LOX turbopump; **GKN Aerospace / Volvo Aero
  (Sweden)** turbines and nozzle.
- **Development:** Vulcain 1 from **1988**, first flight **4 June 1996** (Ariane 5 G,
  the maiden flight that failed for guidance-software reasons unrelated to the engine);
  last Vulcain 1 flight 18 December 2009. **Vulcain 2** first flight **12 February 2005**
  (Ariane 5 ECA), last flight **5 July 2023**. **Vulcain 2.1** development from **2014**,
  first nozzle delivered June 2017, **first flight 9 July 2024** (Ariane 6).
- **Vehicles:** Ariane 5 (Vulcain 1: G/G+/GS; Vulcain 2: ECA/ECA+/ES), Ariane 6 (Vulcain 2.1).
- **Propellants:** LOX / LH2.
- **Mixture ratio:** Vulcain 1 **5.3:1**; **Vulcain 2 6.1:1** — the increase is the
  single biggest source of the thrust uprate.
- **Cycle:** **Gas generator.** Europe deliberately did not attempt staged combustion for
  Ariane 5, and Vulcain is the reference example of a large, well-executed GG hydrogen engine.
- **Thrust (vacuum):** Vulcain 1 **1,140 kN (256,000 lbf)**;
  **Vulcain 2: 1,359 kN (306,000 lbf)**; **Vulcain 2.1: 1,324 kN (298,000 lbf)**.
  Note Vulcain 2.1 is slightly *lower* than Vulcain 2 — the 2.1 is a manufacturing
  simplification, not a performance uprate.
  Sea-level thrust is not separately quoted in the sources fetched (~960 kN for Vulcain 2
  is commonly cited but **treat as unverified**).
- **Chamber pressure:** Vulcain 1 **100 bar (1,450 psia)**;
  **Vulcain 2 117.3 bar (1,701 psia)**; **Vulcain 2.1 120.8 bar (1,752 psia)**.
  Some secondary sources round Vulcain 2 to "115 bar" — a rounding, not a real disagreement.
- **Isp (vacuum):** Vulcain 1 **431 s**; **Vulcain 2 429 s**; Vulcain 2.1 not separately
  published. Vulcain 2's Isp is *lower* than Vulcain 1's despite higher pc, because the
  richer 6.1:1 mixture ratio trades Isp for density and thrust. **This is an excellent
  worked example for the mixture-ratio optimisation chapter** — the optimum for a
  *vehicle* is not the optimum for an *engine*.
- **Expansion ratio:** Vulcain 1 **45.1:1**; **Vulcain 2 58.2:1.**
- **Dry mass:** Vulcain 1 **1,300 kg**; **Vulcain 2 1,800 kg**; **Vulcain 2.1 2,000 kg.**
- **Thrust-to-weight:** Vulcain 2 ≈ **77:1** vacuum (computed).
- **Mass flow:** Vulcain 1 ~235 kg/s total, of which 41.2 kg/s hydrogen.
- **Cooling:** Regenerative **tube-wall** chamber. **Vulcain 2 added film cooling to the
  lower nozzle**, injecting turbine exhaust — needed because the higher pc and richer
  mixture raised the wall heat flux.
- **Injector:** Coaxial shear (LOX post / H2 annulus).
- **Ignition:** Pyrotechnic/spark torch, ground-started only — Vulcain does not restart.
- **Turbopump:** **Two separate turbopumps** on a common gas generator.
  Vulcain 1: **LOX pump 13,600 rpm / 3 MW; LH2 pump 34,000 rpm / 12 MW.**
  Vulcain 2: **LOX pump ~12,300 rpm; LH2 pump ~36,500 rpm** *(medium confidence — from a
  secondary summary of the Vulcain 2 development paper)*.
- **Major innovation:** Vulcain 2.1's nozzle — **90% fewer parts, 40% lower cost, 30%
  faster to produce** than the Vulcain 2 nozzle, achieved by laser-welded sandwich
  construction. It is the best-documented example of manufacturing-driven redesign in
  European propulsion.
- **Major limitation:** GG cycle and no restart; Ariane 5 needed a separate storable
  upper stage for anything beyond a direct injection.
- **Historical significance:** Gave Europe independent heavy-lift access for three decades.
- **SOURCES:** Wikipedia, *Vulcain (rocket engine)* —
  https://en.wikipedia.org/wiki/Vulcain_(rocket_engine) (fetched);
  ESA, *Ariane 5 Vulcain engine* — https://www.esa.int/Enabling_Support/Space_Transportation/Ariane/Ariane_5_Vulcain_engine;
  *Development Status of the Vulcain 2 Engine* (AIAA, via search summary);
  Encyclopedia Astronautica *Vulcain 2* (pointer).
- **CONFIDENCE: high** on thrust, pc, Isp, ε, mass, mixture ratio and Vulcain 1 turbopump;
  **medium** on Vulcain 2 turbopump speeds; **low** on sea-level thrust (not sourced).

---

### ArianeGroup Vinci

- **Manufacturer / country:** ArianeGroup (Snecma heritage), France, with European workshare.
- **Development:** Began **1998** — a 26-year development. **First flight 9 July 2024**
  (Ariane 6 maiden flight).
- **Vehicle:** Ariane 6 upper stage (ULPM).
- **Propellants:** LOX / LH2. **Mixture ratio: 6.1:1** (some sources round to 6:1).
  Flow rates **34.1 kg/s LOX, 5.59 kg/s LH2** — which back-computes to 6.10, confirming
  the ratio internally.
- **Cycle:** **Closed expander.** The first European expander-cycle engine, and by some
  margin the highest-thrust closed expander ever flown (180 kN versus the RL10's 110 kN).
- **Thrust:** **180 kN (40,000 lbf) vacuum.**
- **Chamber pressure:** **60 bar (870 psia).** Typical of the expander cycle's heat-balance limit.
- **Isp:** **457.2 s vacuum.**
- **Expansion ratio:** **240:1**, with a deployable nozzle extension.
- **Dry mass:** **~550 kg total; 160 kg excluding the nozzle.** The nozzle is ~70% of the
  engine mass — a striking figure worth using.
- **Thrust-to-weight:** ≈ 33:1 (computed).
- **Burn time / restarts:** up to **900 s**, up to **3 restarts** (some sources say 4+;
  3 is the figure in the fetched source).
- **Cooling:** Regenerative, **smooth-wall** chamber technology with **high-speed milled
  cooling channels**; **powder-metallurgy turbopump impellers**.
- **Injector / ignition:** Coaxial; spark torch. Restart is enabled by an **auxiliary
  propulsion unit (APU)** that heats propellant in a **3D-printed gas generator** to
  re-pressurise the tanks and provides low-thrust settling and orbital adjustment.
  The APU is arguably more novel than the engine.
- **Turbopump:** Separate high-speed hydrogen and oxygen turbopumps (not geared, unlike
  the RL10). Speeds **not published** in the sources fetched.
- **Major innovation:** Scaling the closed expander cycle to 180 kN, and the APU-based
  multi-restart architecture.
- **Major limitation:** A 26-year development for an engine whose vehicle flies a few
  times a year; the expander cycle still caps chamber pressure at 60 bar.
- **Historical significance:** Gives Europe multi-burn, high-Isp upper-stage capability
  for the first time, closing a gap that had existed since Ariane 1.
- **SOURCES:** Wikipedia, *Vinci (rocket engine)* —
  https://en.wikipedia.org/wiki/Vinci_(rocket_engine) (fetched);
  *VINCI®, the European reference for Ariane 6 upper stage* (EUCASS 2019) —
  https://www.eucass-proceedings.eu/articles/eucass/pdf/2019/01/eucass2019_481.pdf;
  eoPortal, *Ariane 6* — https://www.eoportal.org/other-space-activities/ariane6.
- **CONFIDENCE: high** on thrust, pc, Isp, ε, mass, mixture ratio, flows and cycle.

---

### Snecma HM7B

- **Manufacturer / country:** Snecma (now ArianeGroup), France.
- **Development:** HM7 from **1973**; HM7B **first flight 24 December 1979** (Ariane 1
  maiden flight, L01). Retired with Ariane 5 ECA in 2023. **Nearly 300 engines produced.**
- **Vehicles:** Ariane 1 third stage; Ariane 2/3 third stage; Ariane 4 third stage (H10);
  Ariane 5 ECA upper stage (ESC-A).
- **Propellants:** LOX / LH2. **Mixture ratio: 5:1.**
- **Cycle:** Gas generator.
- **Thrust:** **62.2 kN (13,980 lbf) vacuum.**
- **Chamber pressure:** **3.7 MPa = 37 bar (537 psia)** per the specification table;
  the article body says 3.5 MPa. **Minor internal disagreement — use 37 bar and note it.**
- **Isp:** **444.6 s vacuum.**
- **Expansion ratio:** **83.1:1.**
- **Dry mass:** **165 kg (364 lb)** — remarkably light.
- **Thrust-to-weight:** ≈ **38:1** (computed).
- **Burn time:** 735 s (Ariane 2/3), 780 s (Ariane 4), 950 s (Ariane 5 ECA).
- **Restart:** **None.** Single-burn only. This is the limitation that forced Ariane 5 ECA
  into direct GTO insertion and eventually motivated Vinci.
- **Cooling:** Regenerative.
- **Injector / ignition / turbopump:** **Not published in detail.** Single-shaft hydrogen
  turbopump. Speeds not published.
- **Major innovation:** 444.6 s from a gas-generator cycle at only 37 bar — achieved
  almost entirely through the 83:1 nozzle and low mass. It is the demonstration that
  upper-stage Isp is dominated by expansion ratio, not chamber pressure.
- **Major limitation:** No restart, and low thrust.
- **Historical significance:** The engine of Europe's first orbital launch, in service for
  44 years across four launcher generations.
- **SOURCES:** Wikipedia, *HM7B* — https://en.wikipedia.org/wiki/HM7B (fetched).
- **CONFIDENCE: medium-high** on the performance set (single source, but internally
  consistent and widely corroborated); **not published** on injector and turbopump detail.

---

### Astrium / ArianeGroup Aestus

- **Manufacturer / country:** DASA / Astrium / ArianeGroup, **Ottobrunn Space Propulsion
  Centre**, Germany.
- **Development:** **1988–1995.** **First flight 30 October 1997** (Ariane 5 G, flight 502).
  **Last flight 25 July 2018.** Retired.
- **Vehicles:** Ariane 5 G and ES storable upper stage (EPS).
- **Propellants:** **N2O4 / MMH**, storable hypergolic. **Mixture ratio: 1.9.**
- **Cycle:** **Pressure-fed** (helium). No turbopump at all.
- **Thrust:** **29.6 kN (6,654 lbf) vacuum.**
- **Chamber pressure:** **11 bar (160 psia)** — very low, which is the direct and
  unavoidable consequence of pressure feeding: the tanks must survive the chamber pressure
  plus the feed losses.
- **Isp:** **324 s vacuum.**
- **Expansion ratio:** **84:1.**
- **Dry mass:** **111 kg.**
- **Thrust-to-weight:** ≈ 27:1 (computed).
- **Burn time:** **1,100 s.** **Multiple re-ignitions.**
- **Cooling:** Regenerative chamber with a **cooled nozzle extension**.
- **Injector:** **132 coaxial swirl elements** producing swirl mixing — an unusual choice
  for a hypergolic engine, where impinging doublets are the norm, and worth noting.
- **Ignition:** Hypergolic; none required.
- **Major innovation:** Achieving 324 s at only 11 bar through a large 84:1 nozzle and a
  well-mixed swirl injector — a good illustration that low chamber pressure need not mean
  poor Isp in vacuum.
- **Major limitation:** Low thrust and low chamber pressure make it useless for anything
  but upper-stage/orbital work; ATV missions needed very long burns.
- **Historical significance:** The workhorse of Ariane 5's ATV and dual-launch GTO
  missions. Aestus II / **RS-72** (a pump-fed, ~55 kN development with Rocketdyne) was
  developed and tested but **never flew**.
- **SOURCES:** Wikipedia, *Aestus* — https://en.wikipedia.org/wiki/Aestus (fetched).
- **CONFIDENCE: medium-high** on the performance set; **low** on the RS-72/Aestus II
  numbers, which are not verified here.

---

### SEP Viking (Ariane 1–4)

- **Manufacturer / country:** Société Européenne de Propulsion (SEP), France.
- **Development:** From 1971. **First flight 24 December 1979** (Ariane 1). Last flight
  **2003** (final Ariane 4). Retired.
- **Vehicles:** Ariane 1 first stage (4× Viking 2) and second stage (1× Viking 4);
  Ariane 2/3 (Viking 5/4B); Ariane 4 first stage (4× Viking 5C), second stage (Viking 4B),
  liquid strap-on boosters (Viking 6).
- **Propellants:** N2O4 / **UDMH** (Viking 2) and N2O4 / **UH 25** (25% hydrazine hydrate
  in UDMH) for the later variants.
- **Mixture ratio:** Viking 2 **1.86**; Viking 4B/5C **1.70**; Viking 6 **1.71**.
- **Cycle:** Gas generator.
- **Performance by variant:**

  | | Viking 2 | Viking 4B | Viking 5C | Viking 6 |
  |---|---|---|---|---|
  | Thrust SL | 611 kN | — | 678 kN | — |
  | Thrust vac | 690 kN | 805 kN | 758 kN | 750 kN |
  | pc | 5.5 MPa (55 bar) | 5.5 MPa | ~5.8 MPa | — |
  | Isp vac | 281 s | 301 s | 301 s | — |
  | ε | 10:1 | 30.8:1 | 10:1 | — |
  | Dry mass | 776 kg | 826 kg | 826 kg | — |

- **Thrust-to-weight:** Viking 5C ≈ **84:1** sea level (computed).
- **Cooling:** **THE distinguishing feature — water cooling.** The Viking carries a
  **dedicated water tank and water pump**, and injects water into the exhaust/nozzle to
  cool it. No other production launch-vehicle engine has done this. It is a strange,
  effective, and entirely rational answer to cooling a hypergolic engine whose fuel is a
  poor coolant, and the textbook should use it as the canonical "there are more than four
  cooling methods" example.
- **Injector / ignition:** Impinging; hypergolic, no igniter.
- **Turbopump:** **Three coaxial pumps** (oxidizer, fuel, water) on one shaft,
  **2,500 kW at 10,000 rpm**.
- **Major innovation:** Water-augmented cooling, and the coaxial three-fluid turbopump.
- **Major limitation:** Toxic propellants, modest Isp, and the water system is dead mass.
- **Historical significance:** **Only 2 failures in 958 engines across 144 launches
  (1979–2003)** — one of the best reliability records ever compiled by a booster engine,
  and a strong argument that architectural conservatism buys reliability.
- **SOURCES:** Wikipedia, *Viking (rocket engine)* —
  https://en.wikipedia.org/wiki/Viking_(rocket_engine) (fetched).
- **CONFIDENCE: medium-high** on the variant table and the water-cooling description;
  **incomplete** for Viking 6, whose full parameter set is not published.

---

### ArianeGroup / ESA Prometheus — **ESA AND ARIANEGROUP CLAIMS, UNFLOWN**

- **Manufacturer / country:** ArianeGroup for ESA. France/Germany/Europe.
- **Development:** ESA funding from **June 2017 (€85 M)**, further **€135 M in 2021**.
  **12-second test firing June 2023** at Vernon, France. By mid-2025 the second engine
  model demonstrated **four consecutive ignitions** — "a first in Europe for this type of
  engine". **Not yet flown.**
- **Vehicles (intended):** **Themis** reusable demonstrator, **Ariane Next**, **Maia**.
- **Propellants:** LOX / liquid methane. **Mixture ratio: not published.**
- **Cycle:** **Gas generator.** Notably *not* staged combustion — Europe chose the cheap
  cycle deliberately for a reusability demonstrator.
- **Thrust:** **~980 kN (220,000 lbf) sea level.**
- **Chamber pressure:** **100 bar (1,450 psia).**
- **Isp:** **360 s** (variant/condition not specified in the source; presumably vacuum —
  **flag as ambiguous**).
- **Expansion ratio, dry mass:** **Not published.**
- **Throttle:** **30–110%** — an unusually wide claimed range.
- **Reusability:** **5 flights** claimed.
- **Manufacturing:** **Up to 50% of the engine by metal 3D printing.**
- **Target cost:** ~**€1 million per engine** — explicitly **one tenth the cost of
  Vulcain 2**. The cost target, not the performance, is the programme's stated purpose.
- **Cooling / injector / ignition / turbopump:** **Not published.**
- **Major innovation:** Cost as the primary design variable in a European engine, for the
  first time.
- **Major limitation:** Unflown; all figures are programme targets, not measured results.
- **Historical significance:** Pending. Its importance is as Europe's answer to Merlin,
  and the textbook should treat it as a statement of intent.
- **SOURCES:** Wikipedia, *Prometheus (rocket engine)* —
  https://en.wikipedia.org/wiki/Prometheus_(rocket_engine) (fetched); ESA press material (pointer).
- **CONFIDENCE: low.** Every figure is a target or a claim for an unflown engine.

---

## Part 5 — Japanese engines

### MHI / JAXA LE-7A

- **Manufacturer / country:** Mitsubishi Heavy Industries with JAXA/NASDA. Japan.
- **Development:** LE-7 from 1984 (first flight H-II, **4 February 1994**); the LE-7A
  redesign followed the **H-II Flight 8 failure (15 November 1999)**, in which an LE-7
  LH2 turbopump inducer failed. LE-7A first flight **29 August 2001** (H-IIA).
- **Vehicles:** H-II (LE-7), H-IIA and H-IIB first stages (LE-7A).
- **Propellants:** LOX / LH2. **Mixture ratio: 5.9:1.**
- **Cycle:** **Fuel-rich staged combustion.** Japan is one of only three countries
  (with the US and USSR/Russia) to fly staged combustion on hydrogen.
- **Thrust (LE-7A):**
  - Short-nozzle: **843 kN SL / 1,074 kN vac**, Isp **429 s** vac.
  - **Long-nozzle (operational): 870 kN (196,000 lbf) SL / 1,098 kN (247,000 lbf) vac**,
    Isp **440 s** vac, **ε 51.9:1**.
  (LE-7 original: 843.5 kN SL / 1,078 kN vac, Isp 349 s SL / 446 s vac, ε 52:1.)
- **Chamber pressure:** LE-7 **12.7 MPa (127 bar, 1,842 psia)**;
  **LE-7A 12.0 MPa (120 bar, 1,740 psia)** — the LE-7A runs at *lower* chamber pressure
  than the LE-7. The redesign traded performance for turbopump margin after the failure,
  which is a good case study in reliability-driven de-rating.
- **Dry mass:** LE-7 **1,714 kg**; **LE-7A 1,800 kg**.
- **Thrust-to-weight:** LE-7 **64.1:1**; **LE-7A 65.9:1** (vacuum, as published).
- **Throttle:** **72–100%** (LE-7A).
- **Cooling:** Regenerative, hydrogen-cooled.
- **Injector / ignition:** Coaxial; spark torch. **Turbopump:** separate LH2 and LOX
  turbopumps on a fuel-rich preburner; speeds **not published** here.
- **Major innovation:** Japan's independent mastery of fuel-rich staged combustion.
- **Major limitation:** The nozzle-extension **side-load problem at start-up** damaged
  gimbal actuators; the LE-7A's redesigned nozzle was specifically to fix it. Side loads
  during nozzle start transients are worth a section of their own in the textbook and the
  LE-7A is the best-documented case.
- **Historical significance:** The third national staged-combustion hydrogen engine,
  achieved on a fraction of the American or Soviet budget.
- **SOURCES:** Wikipedia, *LE-7* — https://en.wikipedia.org/wiki/LE-7 (fetched);
  JAXA/MHI published material (pointer).
- **CONFIDENCE: medium-high.** Note that the LE-7A's SL Isp is not given in the source;
  only the vacuum figures and the LE-7's 349 s SL are published there.

---

### MHI / JAXA LE-5B

- **Manufacturer / country:** Mitsubishi Heavy Industries with JAXA/NASDA. Japan.
- **Development:** LE-5 (gas generator) flew on H-I from 1986; **LE-5A** introduced the
  **expander bleed cycle** (H-II, 1994) — the **world's first operational expander bleed
  engine**; **LE-5B** simplified it further for H-IIA from 2001.
- **Vehicles:** LE-5: H-I second stage. LE-5A: H-II second stage. **LE-5B: H-IIA / H-IIB
  second stage.**
- **Propellants:** LOX / LH2.
- **Cycle and performance across the family:**

  | | LE-5 | LE-5A | LE-5B |
  |---|---|---|---|
  | Cycle | Gas generator | Expander **bleed** (nozzle + chamber) | Expander **bleed** (chamber only) |
  | Thrust vac | 102.9 kN (23,100 lbf) | 121.5 kN (27,300 lbf) | **137.2 kN (30,800 lbf)** |
  | pc | 3.65 MPa (36.5 bar / 529 psia) | 3.98 MPa (39.8 bar / 577 psia) | **3.58 MPa (35.8 bar / 519 psia)** |
  | Isp vac | 450 s | 452 s | **446.8 s** |
  | ε | 140:1 | 130:1 | not published |
  | Dry mass | 255 kg | 248 kg | **285 kg** |
  | O/F | 5.5 | 5.0 | not published |

- **Thrust-to-weight (LE-5B):** ≈ 49:1 (computed).
- **The cycle distinction that matters:** an **expander bleed** cycle heats a *portion* of
  the fuel in the cooling jacket, runs it through the turbine, and then **dumps it
  overboard** rather than injecting it into the chamber. It sacrifices a little Isp
  (hence LE-5B's 446.8 s against LE-5A's 452 s) but **escapes the closed expander's thrust
  ceiling entirely**, because the turbine no longer has to be fed by the whole fuel flow.
  The LE-5A/5B and the LE-9 are the clearest flown demonstrations of this, and the
  BE-3U is the American adoption of the same idea.
- **Throttle:** LE-5B operates at **100%, 60%, 30% and a 3% idle mode** — the idle mode is
  used for settling and low-thrust manoeuvres.
- **Restart:** LE-5 was qualified for up to **16 starts**.
- **Cooling:** Regenerative; the cooling circuit is the power source.
- **Injector / ignition:** Coaxial; **spark ignition**.
- **Major innovation:** The world's first operational expander bleed engine (LE-5A), and
  the LE-5B's deliberate simplification — dropping the nozzle from the heat-exchange
  circuit — to cut cost and improve reliability at a small Isp penalty.
- **Major limitation:** The bleed flow is a real Isp loss; and the LE-5B's chamber pressure
  is very low.
- **Historical significance:** Japan invented and proved the expander bleed cycle, which
  is now the basis of the LE-9 and (in a different form) the BE-3U.
- **SOURCES:** Wikipedia, *LE-5* — https://en.wikipedia.org/wiki/LE-5 (fetched).
- **CONFIDENCE: medium-high** on the table; **not published** for LE-5B expansion ratio
  and mixture ratio in this source.

---

### MHI / JAXA LE-9

- **Manufacturer / country:** JAXA (design) and Mitsubishi Heavy Industries (manufacture). Japan.
- **Development:** Firing tests from **April 2017**; the programme suffered **combustion
  chamber wall cracks and turbine blade fatigue cracks** discovered in 2020, delaying H3
  by roughly two years. **First flight 7 March 2023** (H3 TF1 — the LE-9s performed
  correctly; the failure was in the second stage). **Second flight 17 February 2024**,
  fully successful. In production.
- **Vehicle:** **H3** core stage — two or three engines.
- **Propellants:** LOX / LH2. **Mixture ratio: 5.9.**
- **Cycle:** **Expander bleed** — and this is the headline. The LE-9 is by a wide margin
  the **largest expander-cycle-family engine ever flown**, at 1,471 kN against the
  RL10's 110 kN and Vinci's 180 kN. It demonstrates that the bleed variant has no
  practical thrust ceiling.
- **Thrust:** **1,471 kN (331,000 lbf) vacuum.** Sea-level thrust **not published** in the
  source consulted.
- **Chamber pressure:** **10.0 MPa = 100 bar (1,450 psia).**
- **Isp:** **426 s vacuum.**
- **Expansion ratio:** **37:1.**
- **Dry mass:** **2,400 kg (5,300 lb).**
- **Thrust-to-weight:** **62.5:1** (vacuum, as published).
- **Cooling:** Regenerative; the jacket drives the turbines and the flow is then dumped.
- **Injector / ignition / turbopump:** Coaxial; **not published** in detail here.
- **Major innovation:** Booster-class thrust from a cycle with no preburner and no gas
  generator — the simplest large hydrogen engine ever built, with correspondingly low
  part count and (intended) low cost.
- **Major limitation:** Isp of 426 s is well below what staged combustion would give at
  the same size; and the development's turbine-crack problems showed the thermal margins
  are tight.
- **Historical significance:** The clearest demonstration that the expander bleed cycle
  scales, which reopens a design space the industry had written off.
- **SOURCES:** Wikipedia, *LE-9* — https://en.wikipedia.org/wiki/LE-9 (fetched);
  JAXA H3 programme material (pointer).
- **CONFIDENCE: medium-high** on the published performance set; **not published** on
  sea-level thrust, injector and turbopump detail.

---
