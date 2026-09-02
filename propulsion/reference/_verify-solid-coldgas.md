# Verification worksheet — solid rocket motors and cold-gas systems

Working file for Part III (solid) and Part IV (cold gas). Every number here
carries a source and a confidence label. Nothing in this file is written from
memory; where I could not reach a primary source, the entry says so and the
confidence drops accordingly.

**Status:** first verification pass, compiled 2026-09-02. Entries marked
`NEEDS PRIMARY` should not be quoted in a module until someone has opened the
manufacturer data sheet or the NTRS report itself.

---

## How to read this file

**Confidence labels**

| label | meaning |
|---|---|
| **A** | Primary source (NASA fact sheet, manufacturer data sheet, NTRS report, ESA page) read directly and quoted. |
| **B** | Secondary source that itself cites a primary source, and the number is internally consistent with other independent secondaries. |
| **C** | Single secondary source, uncorroborated, or a number that failed an internal consistency check. Usable as an order of magnitude only. |
| **D** | Could not verify. Recorded as a claim with the claimant named, or omitted. |

**Source tags** used below and to be merged into `sources.md`:

| tag | source |
|---|---|
| `[NASA-SRB]` | NASA Space Shuttle SRB news reference / fact sheet material, propellant composition |
| `[NASA-SLS-SRB]` | NASA SLS Solid Rocket Booster reference page, nasa.gov/reference/space-launch-system-solid-rocket-booster/ |
| `[NG-BOLE]` | Northrop Grumman BOLE DM-1 press material, news.northropgrumman.com |
| `[NG-COMM]` | Northrop Grumman commercial rocket motors product pages |
| `[ESA-EAP]` | ESA Ariane 5 boosters (EAP) page |
| `[JM-LV]` | J. McDowell, *General Catalogue of Artificial Space Objects* / launch-vehicle motor lists, planet4589.org |
| `[EA]` | Encyclopedia Astronautica (astronautix.com) — secondary, known to propagate errors |
| `[WP]` | Wikipedia — used only where the article cites a source, and flagged as such |
| `[FAS]` | Federation of American Scientists / GlobalSecurity nuclear-forces pages |
| `[NASA-SOA]` | NASA *State of the Art of Small Spacecraft Technology*, propulsion chapter |
| `[VACCO]` | VACCO Industries CubeSat propulsion data sheets, cubesat-propulsion.com |
| `[CALC]` | Computed in this file from stated inputs; the script is in the cold-gas section |

**A standing warning about thrust figures.** More than half the disagreements
found in this pass are not real disagreements — they are *per-motor versus
per-vehicle* confusions, or *maximum versus average* thrust quoted without the
qualifier. Titan IV and Ariane 5 are the worst offenders. Every thrust number
below is tagged `/motor` or `/vehicle` and `max` or `avg`. If a number in a
module is not tagged this way, it is not finished.

---

# PART A — SOLID ROCKET MOTORS

## A.0 Scope boundary applied in this file

Per the course scope note, for defense motors (Minuteman, Peacekeeper,
Polaris/Poseidon/Trident) this file records **only architecture**: stage count,
propellant *family* name, case material *family*, nozzle *concept*, and any
thrust/Isp/mass figures that appear in open, citable, unclassified sources.
No formulations beyond what NASA publishes in a fact sheet, no processing, no
dimensions of weapon components. Several entries below are deliberately
shorter than the corresponding civil-launcher entries for this reason, and
that is the intended outcome, not a gap to be filled later.

---

## A.1 Space Shuttle SRB / RSRM (Redesigned Solid Rocket Motor)

| field | value | conf |
|---|---|---|
| Manufacturer | Morton Thiokol → Thiokol → Alliant Techsystems (ATK) → Northrop Grumman, Brigham City / Promontory, Utah | A |
| Country | USA | A |
| Dates | SRM first flight STS-1, 1981-04-12; RSRM (post-Challenger) first flight STS-26, 1988-09-29; last flight STS-135, 2011-07-08 | B |
| Vehicle | Space Shuttle, 2 per stack | A |
| Propellant family | PBAN-bound AP/Al composite (APCP) | A |
| **Published composition** | AP 69.6 %, Al 16 %, iron oxide 0.4 %, PBAN binder 12.04 %, epoxy curing agent 1.96 % (by mass) | A |
| — competing figure | AP 69.8 %, Al 16 %, iron oxide 0.2 %, PBAN 12.04 %, epoxy 1.96 % | C |
| Grain geometry | Forward segment: **11-point star** perforation. Aft segments: double-truncated-cone perforation. Star tailors the head-end regressive-then-neutral trace that limits max-Q loads. | A |
| Case | D6AC high-strength low-alloy steel, ~12.7 mm (0.5 in) nominal wall (one source gives ~2 cm — see disagreements) | B |
| Case construction | **Segmented**: 11 individually cast/loaded casting segments assembled into **4 flight segments** joined by **3 field joints**; factory joints inside each flight segment | B |
| Nozzle | Carbon-phenolic and silica-phenolic ablative liners on a steel/composite shell; submerged, flexible-bearing (flexseal) gimbal | B |
| Nozzle ε | 7.72 (initial), 7.16 on later motors | C |
| TVC | Flexible-bearing gimballed nozzle, ±8° in pitch and yaw, driven by two hydraulic actuators fed by two hydrazine-fuelled APU/HPUs per booster | B |
| Thrust, max | ≈ 14.7 MN (3,300,000 lbf) `/motor`, `max`, sea level, at about t+20 s | B |
| Thrust, liftoff | ≈ 12.5 MN (2,800,000 lbf) `/motor`, sea level | B |
| Chamber pressure | ≈ 6.25 MPa (906.8 psi) nominal; peak ~6.4 MPa | B |
| Isp | 242 s SL, 268 s vac | B |
| Burn time | ≈ 123–124 s (action time to 50 psi) | A |
| Propellant mass | ≈ 500,000 kg (1,100,000 lb) | B |
| Total mass | ≈ 590,000 kg (1,300,000 lb) gross; ≈ 91,000 kg (200,000 lb) inert | B |
| Propellant mass fraction | ≈ 0.85 | CALC |
| Separation motors | 8 BSMs per booster (4 forward, 4 aft) | B |

**Innovations.** Largest solid motor ever *flown* until the five-segment RSRMV.
First large segmented solid recovered and reflown. Flexible-bearing nozzle at
this scale. Grain shaping across segments to hold the thrust trace inside the
max-Q structural box.

**Limitations.** The segmented steel case is the whole story: field joints are
the structural and thermal weak point, the case is heavy (mass fraction 0.85 vs
0.91+ for a filament-wound monolithic motor), and once lit there is no
throttling and no shutdown.

### Field joint, pre- and post-Challenger — architectural level

- **Original (SRM) tang-and-clevis joint.** Two fluorocarbon O-rings, primary
  and secondary, in the clevis. Under ignition pressure the joint *rotated*:
  the tang and clevis legs deflected apart, momentarily opening the gap the
  O-rings had to seal. The rings had to extrude into the gap faster than the
  gap opened — a rate-dependent seal, and the extrusion rate of a fluorocarbon
  elastomer is strongly temperature-dependent. `[Rogers Commission]` conf **B**
- **Failure on STS-51-L, 1986-01-28.** Cold-stiffened O-rings failed to seat in
  the aft field joint of the right-hand SRB; hot gas blew by, burned through
  the joint, and the resulting plume impinged on the External Tank aft
  attachment and the ET itself. `[Rogers Commission]` conf **B**
- **Redesign (RSRM).** A **capture feature** was added to the tang — an inner
  lip that engages the inside clevis leg and mechanically limits joint
  rotation — plus a **third O-ring** on that capture feature, redesigned
  insulation to shield the joint, and **joint heaters** to hold the seals above
  a minimum temperature. Wikipedia notes the capture-feature concept was drawn
  from the "double tang" joint of the abandoned filament-wound case booster.
  conf **B**; the double-tang provenance specifically is conf **C**.

**Significance.** The RSRM redesign is the canonical worked example of
"the seal was not the problem; the *rotation* was the problem." It belongs in
the failure-modes section of the solid-motor joint module, not the materials
section.

**SOURCES.** `[NASA-SRB]` for composition, grain, burn time; `[WP]`
en.wikipedia.org/wiki/Space_Shuttle_Solid_Rocket_Booster (which cites NASA
STS news reference and NASA SP publications) for masses, Isp, pressure, case
material; Rogers Commission Report Vol. I ch. IV for the joint. **NEEDS
PRIMARY**: the NASA STS news reference page (science.ksc.nasa.gov) was 503 at
the time of this pass and web.archive.org is unreachable from this
environment; the 69.6/0.4 composition is the NASA-fact-sheet figure and is
corroborated by two independent secondaries, but re-quote it from NASA before
it goes into the module.

**DISAGREEMENTS.**
1. *Iron oxide 0.4 % + AP 69.6 %* (NASA fact-sheet lineage) vs *0.2 % + 69.8 %*
   (Wikipedia's current text). Both sum to 100 %. Present the NASA figure and
   footnote the other.
2. *Case wall 12.7 mm* (common engineering citations) vs *"2-cm-thick"*
   (Wikipedia). The 0.5 in membrane thickness is the figure consistent with the
   published burst-pressure and case-mass numbers; 2 cm is plausibly a local
   thickness at a joint. Present 12.7 mm nominal membrane, note joint regions
   are thicker.
3. Nozzle ε quoted variously as 7.16 and 7.72 across the program. Both are
   real — the nozzle changed. State the flight range.

---

## A.2 SLS five-segment booster (RSRMV / "SLS SRB")

| field | value | conf |
|---|---|---|
| Manufacturer | Northrop Grumman (Promontory, Utah) | A |
| Country | USA | A |
| Dates | DM-1 static test 2009; first flight Artemis I, 2022-11-16 | B |
| Vehicle | SLS Block 1 / Block 1B, 2 per vehicle | A |
| Propellant family | PBAN-bound AP/Al composite — **unchanged from Shuttle** | A |
| Case | Steel — **refurbished Shuttle-era D6AC case segments**, planned for the first eight SLS flights | A |
| Segments | **5** | A |
| Length | 177 ft (53.9 m) | A |
| Diameter | 12 ft (3.71 m) | A |
| Gross mass | 1.6 million lb (≈ 726,000 kg) each | A |
| Thrust | 3.6 million lbf (≈ 16.0 MN) `/motor` — NASA's page does not say max or avg; treat as **max** | A |
| Operational time | 126 s | A |
| Isp | Not published on the NASA reference page. Commonly quoted ~269 s vac. | C |
| Propellant mass | Not published on the NASA reference page; ≈ 1.4 million lb (≈ 635,000 kg) is the widely repeated figure | C |
| TVC | Gimballed nozzle, hydraulic (Shuttle-heritage TVC on RSRMV) | B |

**Changes from the four-segment RSRM.** Fifth propellant segment (25 % more
propellant); **new nozzle design**; **asbestos-free insulation** (the Shuttle
motor's insulation used asbestos-filled NBR); new liner configuration; new
avionics. No parachutes, no recovery — SLS boosters are expended, which removed
the recovery-hardware mass and the salt-water refurbishment constraint.
conf **A** `[NASA-SLS-SRB]`

**Significance.** Currently the most powerful solid rocket motor ever flown.
The pedagogically interesting point is that a 25 % propellant increase in the
same case diameter is bought almost entirely with length and a redesigned
nozzle, not with propellant chemistry — the propellant is the same PBAN
formulation as 1981.

**SOURCES.** `[NASA-SLS-SRB]`; NASA SLS Solid Rocket Booster fact sheets
(2015, 2024 revisions). **NEEDS PRIMARY** for propellant mass and Isp — the
NASA fact-sheet PDFs would not text-extract cleanly in this environment and
the numbers I got back from automated extraction were visibly corrupted
(e.g. "length 177 inches" for a 177-foot booster). Do not quote the PDF-derived
numbers; re-open the PDF by hand.

**DISAGREEMENTS.** Burn time is given as **126 s** by NASA's reference page and
**~123 s** by several secondaries that appear to be carrying over the Shuttle
figure. Use 126 s.

---

## A.3 SLS BOLE booster — **IN DEVELOPMENT, figures are contractor claims**

| field | value | conf |
|---|---|---|
| Name | Booster Obsolescence and Life Extension (BOLE) | A |
| Manufacturer | Northrop Grumman | A |
| Status | **In development.** DM-1 full-scale static test 2025-06-26. Not flown. | A |
| Intended vehicle | SLS Block 2, from the ninth SLS flight (when Shuttle-heritage steel cases run out) | B |
| Case | **Carbon-fibre composite**, replacing refurbished steel. DM-1 cases used IM7/T300 fibre; DM-2 onward planned in T1100. | B |
| Propellant family | **HTPB**-bound AP/Al, replacing PBAN | B |
| Segments | 5 | A |
| TVC | **Electric** thrust vector control, replacing hydraulic | B |
| Performance claim | **+11 % total impulse** vs the current five-segment booster | B (claim) |
| DM-1 test result | 156 ft motor, burn "just over two minutes", "more than 4 million pounds of thrust" from a single booster; **an anomaly was observed near the end of the burn** (nozzle) | B |

**Label in the textbook as a claim.** Per hard rule 3 in `TEMPLATE.md`, every
BOLE number is a contractor figure for an unflown motor. The nozzle anomaly on
DM-1 must be mentioned wherever the +11 % figure is.

**SOURCES.** `[NG-BOLE]`; NASASpaceflight coverage of the DM-1 test
(nasaspaceflight.com/2025/06/bole-dm1-test/). conf **B** overall.

---

## A.4 Titan solid boosters — UA120 family and SRMU

### UA1205 (Titan IIIC / IIID / IIIE)

| field | value | conf |
|---|---|---|
| Manufacturer | United Technologies Chemical Systems Division (CSD) | B |
| Dates | 1965–1982 | B |
| Propellant family | PBAN-bound AP/Al composite | B |
| Diameter | 120 in (3.05 m) — the "120" in the name | B |
| Segments | **5** — the last digit of the designation is the segment count | B |
| Case | Steel, segmented | B |
| **TVC** | **Liquid injection thrust vector control (LITVC)** — N₂O₄ injected through ports in the nozzle exit cone from external nacelles. No moving nozzle. | B |
| Thrust termination | Pyrotechnic thrust-termination ports in the forward dome (retained for the crewed MOL/Titan IIIM configurations) | B |
| Thrust | ≈ 5.3 MN (1,200,000 lbf) `/motor`, `avg`, sea level | C |
| Burn time | ≈ 115 s | C |

### UA1206 / UA1207

- **UA1206**: 1982–1992, Titan 34D and Commercial Titan III. conf **B**
- **UA1207**: first flight 1989, Titan IV-A. **7 segments.** Steel case, PBAN,
  LITVC. Wikipedia's infobox gives *max thrust 14.234 MN (3,200,000 lbf)* and
  *Isp 272 s*, *burn time 120 s* — **the thrust figure is per-vehicle (two
  boosters), not per-motor**; per motor it is ≈ 7.1 MN. conf **C** on the
  numbers, **B** on the architecture.

### SRMU (Solid Rocket Motor Upgrade, Titan IV-B)

| field | value | conf |
|---|---|---|
| Manufacturer | Hercules Aerospace → Alliant Techsystems | B |
| Dates | First flight 1997 (Titan IV-B) | B |
| Propellant family | **HTPB**-bound AP/Al — a generation change from the UA120's PBAN | B |
| Case | **Graphite/epoxy filament-wound composite**, three segments | B |
| TVC | **Gimballed (movable) nozzle** — abandoning LITVC | B |
| Thrust | Wikipedia infobox: 15.12 MN (3,400,000 lbf) — again **per-vehicle**; ≈ 7.6 MN `/motor` | C |
| Isp | 286 s | C |
| Burn time | ≈ 140 s | C |

**Significance.** The UA1205 → SRMU transition is the single cleanest
side-by-side in the whole solid-motor field: same vehicle, same job, same
diameter class, but PBAN→HTPB, steel→graphite/epoxy, LITVC→gimballed nozzle,
5–7 segments→3 segments. Roughly +14 s of Isp and a large inert-mass saving.
Use it as the Part III worked comparison.

**Limitations.** SRMU development was famously troubled — a case failed during
a 1991 structural test, killing one worker, and the program slipped years, which
is why early Titan IV-B flights used leftover UA1207s. conf **C**, needs a
primary (GAO report or AIAA paper) before it is stated in the module.

**SOURCES.** `[WP]` UA120, Titan IV. **NEEDS PRIMARY** throughout — this entry
is the weakest in Part A. Find the CSD/Hercules AIAA papers or the Titan IV
User's Guide.

---

## A.5 Ariane 5 EAP (P230 / P238 / P241)

| field | value | conf |
|---|---|---|
| Manufacturer | Europropulsion (SNPE/Regulus for casting, Aérospatiale/EADS for cases) | B |
| Country | France / Italy (ESA) | B |
| Dates | 1996–2023 | B |
| Vehicle | Ariane 5, 2 per vehicle | A |
| Propellant family | HTPB-bound AP/Al composite | A |
| **Composition (ESA-published)** | AP 68 %, Al 18 %, HTPB binder 14 % | B |
| Grain | Cast in three segments; forward segment star-shaped, aft segments cylindrical bore | C |
| Case | **Steel**, segmented, **3 segments** bolted together | A |
| Nozzle | Carbon-phenolic ablative, flexible-joint (flexseal) | B |
| Nozzle ε | **9.7 originally, raised to 11.0 after 1997** | B |
| TVC | Gimballed nozzle, up to **7.3°** deflection, hydraulic actuation | B |
| Isp | ≈ 275 s vac | B |
| Propellant mass | **P230**: 237.8 t. **P238**: 238 t. **P241**: 241 t. (The number in the name *is* the propellant mass in tonnes.) | B |
| Thrust | P238 ≈ 6.65 MN, P241 ≈ 7.08 MN, `/motor`, `max`, sea level | C |
| Burn time | ≈ 130 s (P238), ≈ 140 s (P241) | C |
| Empty mass | ≈ 33 t (P241) | C |
| Length / diameter | 31.6 m × 3.06 m | B |

**Innovations.** European mastery of large segmented solids; the
P230→P238→P241 series is a textbook example of squeezing performance out of a
frozen case by increasing propellant loading and raising ε — no chemistry
change, no case change.

**Limitations.** Steel segmented case, so the same mass-fraction penalty as the
Shuttle SRB. Recoverable by parachute for inspection but not reused
operationally.

**SOURCES.** `[ESA-EAP]` (esa.int Ariane 5 boosters (EAP) — **403 from this
environment**, values above come from search-result extracts of that page and
are therefore conf **B** at best); `[WP]` Ariane 5. **NEEDS PRIMARY**: fetch the
ESA EAP page and the ESA Bulletin 104 article "First Test Firing of an Ariane-5
Production Booster" (esa.int/esapub/bulletin/bullet104/gonzalez104.pdf), which
should settle thrust trace, chamber pressure and burn time properly.

**DISAGREEMENTS.**
1. **Serious and recurring:** Wikipedia's Ariane 5 article reports "propellant
   mass 270,000 kg" for P238 and "273,000 kg" for P241. These are **gross
   masses**, mislabelled. The designation P*nnn* is by definition the propellant
   load in tonnes. Do not propagate the 270/273 t figures as propellant mass.
2. Nozzle deflection quoted as 6° in some places, 7.3° in the ESA-derived text.
   Use 7.3° and footnote.

---

## A.6 P120C (Vega-C first stage, Ariane 6 strap-on) and P160C

| field | value | conf |
|---|---|---|
| Manufacturer | Europropulsion (Avio + ArianeGroup JV); casting at Regulus, Kourou and Avio, Colleferro | B |
| Country | Italy / France (ESA) | B |
| Dates | First flight Vega-C, 2022-07-13 | B |
| Vehicle | Vega-C first stage (1); Ariane 6 boosters (2 or 4) | B |
| Propellant family | HTPB 1912 — AP/Al/HTPB composite | B |
| **Composition** | Al 19 %, AP 69 %, HTPB 12 % (this is what "1912" encodes: 19 % Al, 12 % binder) | B |
| Grain | Monolithic, single cast | B |
| Case | **Carbon-fibre filament-wound, monolithic** (one piece — no segments, no field joints) | B |
| Case manufacture | ≈ 3,500 km of carbon fibre wound over ≈ 33 days in a climate-controlled hall | C |
| Nozzle | Carbon-phenolic, flexseal joint | C |
| TVC | Electromechanical actuators on a flexible-joint nozzle | B |
| Thrust | ≈ 4,780 kN `/motor`, `max`, vacuum | B |
| Isp | ≈ 280 s | B |
| Burn time | ≈ 130–140 s | C |
| Propellant mass | 141,400 kg | B |
| Gross mass | 153,000 kg | B |
| Inert mass | 11,200 kg | B |
| **Propellant mass fraction** | **0.924** | CALC |
| Length / diameter | 13.5 m × 3.4 m | B |

**Significance.** The mass fraction is the whole point. 0.924 for a
filament-wound monolithic case against ~0.85 for the segmented steel Shuttle
SRB — that is the single most useful number-pair in Part III for arguing why
composite monolithic construction won for everything that does not need to be
shipped by rail.

**P160C.** Stretched derivative, ≈ 160 t propellant, for later Ariane 6 and
Vega-E. In development / early flight. Label as such. conf **C**.

**SOURCES.** `[WP]` P120C (which cites Avio and ESA material), Avio product
pages. **NEEDS PRIMARY**: Avio's own P120C data sheet for the thrust trace and
chamber pressure, neither of which I could verify.

---

## A.7 Vega and Vega-C solid stages (Avio)

| motor | stage | prop mass (kg) | gross (kg) | thrust max (kN) | Isp (s) | burn (s) | case | conf |
|---|---|---|---|---|---|---|---|---|
| **P80FW** | Vega S1 | 88,365 | ~95,800 | 2,261 | 280 | 107 | graphite-epoxy filament wound | B |
| **Zefiro 23** | Vega S2 | 23,814 | 26,300 | 1,120 | 287.5 | 77.1 | carbon-epoxy filament wound | B |
| **Zefiro 9A** | Vega/Vega-C S3 | 10,567 | 12,000 | 317 | 295.9 | 119.6 | carbon-epoxy filament wound | B |
| **Zefiro 40** | Vega-C S2 | 36,239 | 40,477 | 1,304 | 293.5 | 92.9 | carbon-epoxy filament wound | B |

Common architecture across the Zefiro family: 1.9 m (Z23, Z9A) or 2.4 m (Z40)
carbon-epoxy filament-wound case, **low-density EPDM insulation**, carbon-phenolic
nozzle with a **carbon–carbon throat insert**, **flexible nozzle joint** with
**electromechanical TVC**. Propellant is HTPB 1912 throughout. conf **B**.

**Flight anomalies — record these, they are the teaching value.**
- **Vega VV15, 2019-07-11 (FalconEye 1):** Zefiro 23 second-stage motor failure
  shortly after ignition; vehicle lost. conf **B**.
- **Vega-C VV22, 2022-12-20:** Zefiro 40 under-pressure at second-stage burn;
  vehicle lost. The independent inquiry attributed it to unexpected erosion of
  the **carbon–carbon nozzle throat insert**, traced to the insert material
  supplier change. conf **C** on the attribution detail — **NEEDS PRIMARY**
  (the ESA/Arianespace independent enquiry commission press release).

This second one is the best modern example available of "a materials
qualification decision in a subcomponent destroyed a launch vehicle," and
belongs in both the nozzle-materials and the quality-assurance sections.

**SOURCES.** `[WP]` Vega (rocket), Zefiro (rocket stage) — both cite Avio and
ESA material.

---

## A.8 Northrop Grumman GEM family (Graphite Epoxy Motor)

All variants: **carbon-fibre-reinforced-polymer filament-wound monolithic case**,
HTPB-bound AP/Al composite propellant. Manufacturer Hercules → Alliant
Techsystems → Northrop Grumman. conf **B**.

| motor | thrust (kN, max) | burn (s) | prop mass (kg) | gross (kg) | Isp (s) | dia (m) | length (m) | nozzle | vehicle | dates |
|---|---|---|---|---|---|---|---|---|---|---|
| GEM-40 | 643.8 | 63.3 | 11,770 | 12,962 | 274 | 1.03 | 11.0 | fixed | Delta II | 1990-11-26 → 2018-09-15 |
| GEM-46 | 611 | 75.9 | 16,860 | 18,860 | 277.8 | 1.15 | 12.59 | fixed + vectorable variant | Delta III, Delta II Heavy | 1998-08-26 → 2011-09-10 |
| GEM-60 | 1,248.9 | 90.8 | 29,698 | 33,183 | 275 | 1.52 | 13.2 | fixed or vectorable | Delta IV M+ | 2002-11-20 → 2019-08-22 |
| GEM-63 | 1,649.6 | 97.6 | 44,087 | 49,342 | 279.1 | 1.62 | 20.1 | fixed | Atlas V | 2020-11-13 → 2026-07-02 |
| GEM-63XL | 2,061 | 87.3 | 47,853 | 53,030 | 280.3 | 1.62 | 22.0 | fixed (63XLT vectorable, cancelled) | Vulcan Centaur | 2024-01-08 → active |

Mass fractions from the table: GEM-40 0.908, GEM-46 0.894, GEM-60 0.895,
GEM-63 0.894, GEM-63XL 0.902. `[CALC]`

**Cross-check.** Northrop Grumman's own page gives GEM-63XL propellant mass as
**105,497 lb = 47,853 kg** and nozzle exit diameter 60 in, and describes it as
"the longest monolithic rocket motor produced to date," with 15–20 % more
thrust than GEM 63. Both agree. conf **B→A** for the 63XL propellant mass.

**Note on GEM-46 thrust.** The table shows GEM-46 with *lower* max thrust than
GEM-40 despite 43 % more propellant, because the burn time is longer — this is
a genuine design choice (lower thrust, longer burn, better for the Delta III
trajectory), not a transcription error. Worth flagging in the module as an
example that "bigger motor" does not mean "more thrust."

**SOURCES.** `[WP]` Graphite-Epoxy Motor (cites NG data sheets and ULA user
guides); `[NG-COMM]`. **NEEDS PRIMARY**: the Northrop Grumman *Propulsion
Products Catalog* PDF would give chamber pressures and expansion ratios, which
are missing above; it would not text-extract in this environment.

---

## A.9 Castor family (Thiokol → ATK → Northrop Grumman)

| motor | prop | thrust max | burn (s) | Isp (s) | dia | notes | conf |
|---|---|---|---|---|---|---|---|
| Castor 1 (TX-33) | PBAA/AP | — | 27 | — | 0.79 m | Sergeant heritage; Scout S2, Delta strap-on | C |
| Castor 2 (TX-354) | PBAN/AP | — | ~37 | — | 0.79 m | Delta, Scout | C |
| Castor 4 / 4A / 4B | HTPB/AP (4A/4B) | ~430–478 kN | ~56 (4A) | ~266–280 | 1.02 m | Delta 3914/3920 strap-ons, Atlas IIAS (4A/4B), Shavit-class | C |
| **Castor 120** | Class 1.3 HTPB/AP | 1,900 kN | 83.4 | 280 | 2.34 m | **Direct derivative of the Peacekeeper stage-1 motor**; Athena I/II S1, Taurus S0 | B |
| Castor 30 | HTPB/AP | — | — | — | 2.34 m (92 in) | 3.5 m long, ≈14,000 kg; Antares S2 | C |
| Castor 30XL | HTPB/AP | — | — | ~300 | 2.34 m | 6.0 m long, ≈25,000 kg; Antares S2 | C |

**Significance of Castor 120.** It is the clearest public case of an ICBM
first-stage motor being commercialised essentially unchanged. Architecture
(HTPB, filament-wound composite case, movable nozzle) carried straight over.
The textbook should use it to make the point that the *architecture* is what
transfers, not a formulation.

**SOURCES.** `[WP]` Castor (rocket stage), Athena (rocket family). **NEEDS
PRIMARY** for the whole Castor row set — the Wikipedia article is unusually
thin and gives no thrust, Isp, or propellant mass for most variants. Everything
here except Castor 120 is conf **C** and must not be tabulated in a module yet.

---

## A.10 Apogee-kick and upper-stage motors: Star and Orbus

### Star 48B

| field | value | conf |
|---|---|---|
| Manufacturer | Thiokol Elkton → Northrop Grumman | B |
| Designation | TE-M-711-9 | B |
| Dates | Star 48 (TE-M-711) 1980–1985; Star 48B 1985– | B |
| Use | PAM-D upper stage on Delta II and Shuttle-deployed satellites; **New Horizons** third stage | B |
| Propellant | TP-H-3340 (HTPB/AP/Al) | C — **NEEDS PRIMARY** |
| Case | **Titanium (6Al-4V)** | C — **NEEDS PRIMARY** |
| Nozzle | Carbon-phenolic, fixed (Star 48BV adds TVC) | B |
| Propellant mass | 2,009–2,011 kg | B |
| Gross mass | ≈ 2,137 kg | B |
| Inert mass | 28 kg (McDowell) / 126 kg (Encyclopedia Astronautica) — **see disagreements** | C |
| Thrust | ≈ 66.0–66.4 kN vac | B |
| Burn time | ≈ 87 s | B |
| **Isp (vac)** | **286.2 s (short nozzle, ε ≈ 47.7) / 292.2 s (long nozzle, ε ≈ 54.8–70.4)** | C |

**Star 48BV** — non-spinning, thrust-vectoring variant, used on Minotaur IV+
and Minotaur V. conf **B**.

**Star 37 family** — 37 in (0.94 m) class apogee-kick motors (Star 37E, 37F,
37FM, 37XFP). Star 37FM flew as the Lunar Prospector injection motor. Titanium
or steel cases, TP-H-3340-class HTPB propellant, fixed carbon-phenolic nozzle,
Isp roughly 286–290 s vac. conf **C** — **NEEDS PRIMARY** (Northrop Grumman
propulsion catalog). Do not put Star 37 numbers in a module from this file.

**Orbus family** (formerly United Technologies / CSD, then Pratt & Whitney):
- **Orbus 21D** — Athena II second stage. Thrust 194 kN, Isp 293 s, burn 150 s,
  Class 1.3 HTPB/AP. conf **C**.
- **Orbus 6 / Orbus 21** — IUS (Inertial Upper Stage) stages 2 and 1
  respectively. Kevlar-epoxy cases, **extendable exit cone (EEC)**, gimballed
  nozzle. The IUS EEC is the flight-proven reference for the
  extendable-exit-cone concept in a solid motor and is the example to use in
  the nozzle module. conf **C** — **NEEDS PRIMARY** (Boeing IUS documentation
  or NASA IUS user's guide).

**SOURCES.** `[JM-LV]` planet4589.org motor list for Star 48; `[EA]`
astronautix Star 48B (503 at time of pass, values from search extract);
`[WP]` Star 48, Athena.

**DISAGREEMENTS — Star 48B, important, this is a genuinely contested motor.**

| quantity | value A | value B | note |
|---|---|---|---|
| Isp vac | 286.2 s | 292.2 s | **Both correct** — short-nozzle and long-nozzle variants. Never quote "Star 48B Isp" without the nozzle. |
| ε | 47.7 | 54.8 / 70.4 | Same cause. |
| Thrust | 66.0 kN | 66.4 kN | Within quoting noise. |
| Inert mass | 28 kg `[JM-LV]` | 126 kg `[EA]` | **Cannot both be right.** 2,137 − 2,009 = 128 kg, which supports the ~126 kg figure; the 28 kg figure is almost certainly a typo for 128 kg. Use ≈128 kg, mass fraction ≈ 0.94. |

---

## A.11 Pegasus / Orion motors (Orbital Sciences → Northrop Grumman)

| motor | stage | prop mass (kg) | thrust max (kN) | Isp (s) | burn (s) | conf |
|---|---|---|---|---|---|---|
| Orion 50S | Pegasus S1 | — | 500 | — | 75.3 | C |
| Orion 50SXL | Pegasus XL S1 | 15,014 | 726 | 284.6 | 68.6 | B |
| Orion 50XL | Pegasus XL S2 | 3,925 | 196 | 283.8 | 69.4 | B |
| Orion 38 | Pegasus S3 | 770 | 36 | 281.7 | 68.5 | B |

All: HTPB/Al composite propellant, **graphite-epoxy filament-wound case**,
carbon-phenolic nozzle. Stage 1 has an aerodynamically-controlled delta wing
plus a gimballed nozzle; stages 2 and 3 use electromechanically gimballed
nozzles. Northrop Grumman states 14 Orion variants, ~500 delivered, first
flight 1990, zero flight failures across 100+ launches. conf **B**; the
case-material and nozzle details are conf **C** — **NEEDS PRIMARY** (Pegasus
User's Guide).

---

## A.12 Scout (NASA/LTV) — the four-stage all-solid pathfinder

| stage | motor | manufacturer | vac thrust (kN) | burn (s) | gross mass (kg) | conf |
|---|---|---|---|---|---|---|
| 1 | Algol | Aerojet General | 564.25 | 47 | 11,600 | C |
| 2 | Castor | Thiokol | 258.92 | 37 | 4,424 | C |
| 3 | Antares | Allegany Ballistics Lab / Hercules | 93.09 | 36 | 1,400 | C |
| 4 | Altair | Allegany Ballistics Lab | 22.24 | 28 | 275 | C |

(Scout A configuration; later variants used Algol IIB/IIIA, Castor IIA,
Antares IIIA, Altair IIIA with higher performance.)

**Architectural significance.** Scout is the reference case for **spin
stabilisation of upper stages in place of TVC**: stages 3 and 4 were spun up
and flown unguided, which removes the actuator, the hydraulics and the mass,
at the cost of injection accuracy. It is also the heritage line — Algol came
from the Polaris programme, Castor from Sergeant. conf **B** on the
architecture; the numbers are conf **C** — **NEEDS PRIMARY** (NASA Scout
User's Manual, which is on NTRS).

---

## A.13 Indian solid motors (ISRO / VSSC)

### PSLV PS1 (S139) core

| field | value | conf |
|---|---|---|
| Propellant | HTPB/AP/Al | B |
| Propellant mass | 138,200 kg | B |
| Case | **M250 maraging steel**, segmented | B |
| Thrust | 4,846.9 kN `/motor`, `max` | C |
| Burn time | ≈ 110 s (PSLV) / 100 s (GSLV) | C |
| Isp | 237 s SL, 269 s vac | C |
| Diameter | 2.8 m | B |
| Inert mass | 30,200 kg → mass fraction **0.821** | CALC |
| **TVC** | **SITVC — secondary injection thrust vector control using aqueous strontium perchlorate**, injected into the nozzle exit cone for pitch and yaw. Roll is handled by a separate liquid RCS module. | B |

The SITVC-with-strontium-perchlorate architecture is a genuinely distinctive
choice and worth a subsection: it is LITVC with a dense, non-toxic, cheap
injectant, and it lets the S139 keep a fixed nozzle on a very large motor.

### PSOM strap-ons

| variant | prop mass (kg) | thrust (kN) | burn (s) | conf |
|---|---|---|---|---|
| PSOM (S9) | 9,000 | 510 | 44 | C |
| PSOM-XL (S12) | 12,200 | 703.5 | 70 | C |

PSOM-XL: 12 m × 1 m. Some PSOMs carry SITVC, others are fixed. conf **C**.

### GSLV S139

Same S139 core as PSLV (138,200 kg HTPB, 4,846.9 kN, Isp 237 s), burn time
100 s, with four **liquid** L40H strap-ons (N₂O₄/UDMH, 42,700 kg each,
760 kN, 154 s, Isp 262 s) rather than solid strap-ons. conf **C**.

### LVM3 S200 — the best-documented non-US large segmented solid

| field | value | conf |
|---|---|---|
| Propellant | HTPB/AP | B |
| Propellant mass | 205,000 kg each (2 boosters) | B |
| **Grain distribution** | head-end segment 27,100 kg; middle segment 97,380 kg; nozzle-end segment 82,210 kg | B |
| Segments | **3** | B |
| Case | **M250 maraging steel** | B |
| Thrust | 5,150 kN `max`, 3,578.2 kN `avg`, `/motor` | B |
| Isp | 274.5 s vac | B |
| Burn time | 128 s | B |
| **TVC** | **Flex nozzle, ±8°, electro-hydraulic actuators** | B |
| Length / diameter | 25 m × 3.2 m | B |

The published per-segment propellant split is unusually generous documentation
and makes S200 a good worked example for grain-design and thrust-trace
problems. Note the max/avg ratio of 1.44 — a strongly progressive-then-regressive
trace, quite unlike the Shuttle SRB.

**SOURCES.** `[WP]` PSLV, GSLV, LVM3 (all cite ISRO material). **NEEDS
PRIMARY**: ISRO's own launch vehicle pages for the S139 and S200.

---

## A.14 Japanese solid motors (ISAS / IHI Aerospace / JAXA)

### M-V (1997–2006)

| stage | motor | vac thrust (kN) | Isp (s) | burn (s) | conf |
|---|---|---|---|---|---|
| 1 | M-14 | 3,780 | 246 | 46 | C |
| 2 | M-24 | 1,245 | **203 — implausible, see below** | 71 | D |
| 3 | M-34 | 294 | 301 | 102 | C |
| 4 | KM-V1 | 51.9 | 298 | 73 | C |

Architecture (conf **C**, **NEEDS PRIMARY** — the ISAS/JAXA M-V papers on
NTRS-equivalent Japanese repositories): HT-230M high-strength steel case on
stage 1, **CFRP filament-wound cases on the upper stages**, HTPB-bound
composite propellant (BP-207 family), **movable nozzle TVC on stage 1**, and
a **carbon–carbon extendable exit cone on the M-34 third stage** — the M-34b
EEC is one of very few flight-proven solid-motor EECs outside the US.

M-V was, at retirement, the largest all-solid orbital launcher ever flown and
the highest-performing solid upper stage set (M-34b Isp ≈ 301 s vac).

### Epsilon

| stage | motor | prop mass (kg) | thrust max (kN) | Isp (s) | burn (s) | conf |
|---|---|---|---|---|---|---|
| 1 | SRB-A3 | 65,900 | 2,271 | 284 | 116 | B |
| 2 | M-35 | — | 445 | 295 | 129 | C |
| 3 | KM-V2c | 2,500 | 99.6 | 299 | 91 | C |

**SRB-A3** is the H-IIA/H-IIB strap-on booster reused as an orbital first
stage — CFRP filament-wound monolithic case, HTPB composite propellant,
movable nozzle. Reusing a strap-on as a first stage is the whole cost argument
for Epsilon. **M-35** and **KM-V2c** descend from the M-V upper stages.
Manufacturer: IHI Aerospace. conf **B** on architecture.

**DISAGREEMENT / ERROR TO NOT PROPAGATE.** The M-24 Isp of **203 s** in
Wikipedia's M-V infobox is not physically credible for an HTPB/AP/Al upper-stage
motor with a high-expansion nozzle; the neighbouring stages are 246 s and
301 s. It is almost certainly a transcription error (possibly a sea-level or a
mis-unit figure). **Do not use it.** Expected value is ~282–292 s. Flag as
unresolved until a JAXA source is read.

---

## A.15 Israeli — Shavit

| stage | motor | manufacturer | propellant | thrust (kN) | Isp (s) | burn (s) | conf |
|---|---|---|---|---|---|---|---|
| 1 | LK-1 | Israel Military Industries | HTPB | 553.8 | 268 | 55 | C |
| 2 | LK-1 | IMI | HTPB | 515.8 | 268 | 55 | C |
| 3 | RSA-3-3 | Rafael | solid | 58.6 | 298 | 94 | C |
| 4 (opt.) | LK-4 | — | hydrazine (liquid) | 0.402 | 200 | 800 | C |

Architecture: three solid stages plus an optional liquid fourth. Open sources
state the first two stages are common with the Jericho II. Shavit launches
**retrograde, westward over the Mediterranean**, paying roughly 2×460 m/s of
Earth-rotation penalty for range-safety reasons — which is the interesting
engineering point, not the motor internals. conf **C** throughout;
**NEEDS PRIMARY**.

---

## A.16 Chinese — solid strap-ons

Public data is thin and mostly non-primary.

- **Long March 6A (CZ-6A)**: 4 × **FG-112** solid strap-ons, 15.1 m × 2.0 m,
  **1,214 kN max thrust each**, 4,828 kN total. First Chinese launcher to
  combine liquid core with solid strap-ons. conf **C**.
- **Long March 11 (CZ-11)** is an all-solid four-stage launcher derived from
  road-mobile missile technology; open specifications are inconsistent and
  I could not verify a set. **Omit from the textbook table** rather than
  publish conf-D numbers.
- The CZ-3/4 families use **no** solid strap-ons (they are hypergolic).

**SOURCES.** `[WP]` Long March 6A. Everything Chinese in this file is conf **C**
or worse. Recommend the textbook keeps Chinese solids to a one-paragraph
architectural note and does not tabulate numbers.

---

## A.17 Defense motors — architecture only

### Minuteman

| | Minuteman I (LGM-30A/B) | Minuteman II (LGM-30F) | Minuteman III (LGM-30G) |
|---|---|---|---|
| Stage 1 | Thiokol M55 (TU-122) | Thiokol M55A1 | Thiokol **M55A1** |
| Stage 2 | Aerojet SR19-AJ-1 | Aerojet **SR19-AJ-1** (enlarged) | Aerojet **SR19-AJ-1** |
| Stage 3 | Aerojet/Thiokol **SR73-AJ/TC-1** | — | Hercules **SR73-AJ-1 / M57** |
| Dates | 1962–1969 | 1965–1990s | 1970– (in service) |

Published architecture-level points, conf **B** unless noted:

- All stages: **AP/Al composite propellant**. Stage 1 is a PBAN-class
  polybutadiene composite; later stages moved to higher-energy binders. No
  formulation detail beyond family is recorded here, per scope.
- **Stage 1 case: steel.** **Stages 2 and 3 progressively moved to
  filament-wound composite** — stage 2 to titanium and then composite, stage 3
  to **glass-filament-wound** and then composite. conf **C** on the specific
  progression; **NEEDS PRIMARY**.
- **Stage 1 TVC: four gimballed nozzles.** **Stage 2 TVC: liquid injection**
  (Freon injectant on Minuteman II/III era hardware). **Stage 3: fixed nozzle
  with a liquid-injection TVC system** — Wikipedia explicitly describes the
  Minuteman III third stage as "a fixed nozzle with a liquid injection thrust
  vector control system." conf **B**.
- **Thrust termination ports** on the third stage — shaped charges open ports
  in the forward dome, dropping chamber pressure and terminating thrust to set
  the final velocity. This is the architectural feature worth teaching: a solid
  motor *can* be shut down, at the cost of a violent, one-shot, structurally
  destructive event. conf **B**.
- Published thrust figures (Minuteman I): stage 1 ≈ 790 kN, stage 2 ≈ 268 kN,
  stage 3 ≈ 152 kN. conf **C**.

### Peacekeeper (LGM-118A, MX)

| stage | motor | manufacturer | conf |
|---|---|---|---|
| 1 | SR118 | Thiokol | B |
| 2 | SR119 | Aerojet General | B |
| 3 | SR120 | Hercules | B |
| PBV | restartable storable-hypergolic liquid | Rocketdyne | B |

- **Case material family: Kevlar/epoxy filament-wound on all three solid
  stages.** conf **B** (multiple open sources; FAS and GlobalSecurity both say
  Kevlar-epoxy for the marching stages).
- **Stages 2 and 3 use extendable exit cones (EEC).** conf **B**. This is the
  single most important architectural fact about Peacekeeper for a propulsion
  textbook: EECs let a stage carry a high-ε nozzle inside a length-limited
  silo, buying ~10–15 s of Isp for a deployment mechanism.
- **Propellant family:** open sources state the propellant used **HMX**, a
  nitramine of higher energy than AP alone — i.e. a **nitramine-loaded
  composite / CMDB-class** propellant rather than a plain AP/Al/HTPB. conf **C**.
  Some sources associate NEPE with Peacekeeper stage 3; I could not corroborate
  this and it is **not** recorded here as fact.
- Stage 1 thrust ≈ 2.2 MN (500,000 lbf). conf **C**.
- **Castor 120** is the commercial derivative of the stage-1 motor (see A.9).

### Polaris → Poseidon → Trident

| system | stages | propellant family (open sources) | case family | nozzle concept | decade |
|---|---|---|---|---|---|
| **Polaris A-1** | 2 | polyurethane / PBAA-class AP composite | **steel** | **four rotatable nozzles with jetavators** (jet vanes/deflector rings) | late 1950s |
| **Polaris A-2** | 2 | AP composite; second stage moved toward higher-energy binder | steel; **glass-filament-wound second stage** | rotatable nozzles / jetavators | early 1960s |
| **Polaris A-3** | 2 | **CTPB**-class composite (both stages) | **glass filament wound** | **liquid injection TVC (Freon injection)** replacing jetavators | mid 1960s |
| **Poseidon C-3** | 2 | high-energy composite (nitramine-loaded) | **glass filament wound** | **LITVC** | late 1960s / 1970s |
| **Trident I C-4** | 3 | high-energy composite | **Kevlar/epoxy** | **single gimballed nozzle per stage; extendable nozzle; aerospike** | late 1970s |
| **Trident II D-5** | 3 | **NEPE-75** (nitrate-ester-plasticised polyether) | **graphite/epoxy** on stages 1 and 2; stage 3 changed from Kevlar to graphite/epoxy mid-programme (1988) | **one oscillating (gimballed) graphite-composite nozzle per stage; aerospike** | 1980s–90s |

Confidence **B** for Trident (FAS/GlobalSecurity D-5 features pages are
explicit about NEPE-75, the Kevlar→graphite case change and its two stated
reasons: inert-weight reduction *and* elimination of the electrostatic
potential difference between Kevlar and graphite). Confidence **C** for the
Polaris/Poseidon rows — the Wikipedia Polaris article does not carry
propulsion detail and I could not reach a primary. **NEEDS PRIMARY**: the
Navy Strategic Systems Programs historical summaries, and the classic
open-literature account of the Polaris jetavator→LITVC transition.

**The aerospike (Trident) — do not confuse with the engine.** The Trident
"aerospike" is a **telescoping drag-reduction spike deployed from the nose**,
not an aerospike nozzle. It reportedly cuts frontal drag by roughly 50 % and
buys range. This naming collision confuses students every year and the module
must state it explicitly. conf **B**.

**The two architectural arcs worth teaching, and nothing more:**
1. **Nozzle control**: jetavators (1950s, simple, lossy) → liquid injection
   (1960s, no moving nozzle, injectant mass penalty) → single gimballed
   flexseal nozzle (1970s onward, efficient, needs a flexible joint that can
   survive submarine storage). Trident's *single* gimballed nozzle per stage
   replacing four nozzles is a large inert-mass and complexity win.
2. **Case material**: steel → glass filament wound → Kevlar/epoxy →
   graphite/epoxy. Each step is roughly a 20–30 % case-mass reduction at equal
   burst pressure. This progression alone accounts for a large part of the
   range growth from Polaris A-1 to Trident D-5, independent of chemistry.

---

# PART B — COLD-GAS SYSTEMS

## B.1 Gas property and ideal-performance table

**Method.** Ideal-gas, frozen-flow, isentropic nozzle. For each gas I solved
the area-ratio relation for exit Mach number at the stated ε, then

$$C_F^{vac} = \Gamma\sqrt{\frac{2\gamma}{\gamma-1}\left[1-\left(\tfrac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right]} + \frac{p_e}{p_c}\varepsilon,
\qquad c^{*}=\frac{\sqrt{R T_0}}{\Gamma},
\qquad \Gamma=\sqrt{\gamma}\left(\tfrac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

with $T_0 = 300$ K, $R = R_u/M$, $R_u = 8314.46$ J/(kmol·K),
$g_0 = 9.80665$ m/s². Script archived at
`propulsion/tools/` (to be committed) — reproduce before quoting.

| gas | M (kg/kmol) | γ @300 K | c* (m/s) | C_F,vac (ε=50) | **Isp ideal, ε=50 (s)** | Isp ideal, ε=20 | Isp ideal, ε=100 | typical **realized** Isp (s) | liquefiable @ 300 K? | stored density |
|---|---|---|---|---|---|---|---|---|---|---|
| H₂ | 2.016 | 1.405 | 1622.5 | 1.726 | **285.6** | 279.2 | 288.9 | ~250–272 | no (Tc 33 K) | ~0.02 g/cm³ @ 241 bar |
| He | 4.003 | 1.667 | 1087.0 | 1.606 | **178.1** | 176.4 | 178.8 | ~150–165 | no (Tc 5.2 K) | ~0.04 g/cm³ @ 241 bar |
| NH₃ | 17.031 | 1.31 | 572.0 | 1.795 | **104.7** | 101.5 | 106.5 | ~90–100 (warm gas) | **yes**, vp ≈ 10.6 bar | ~0.60 g/cm³ liquid |
| N₂ | 28.014 | 1.400 | 435.8 | 1.729 | **76.8** | 75.1 | 77.8 | **~65–73** | no (Tc 126 K) | ~0.28 g/cm³ @ 241 bar; ~0.25 g/cm³ @ 300 bar |
| Air | 28.965 | 1.400 | 428.6 | 1.729 | **75.6** | 73.9 | 76.5 | ~63–71 | no | ~0.29 g/cm³ @ 241 bar |
| Ar | 39.948 | 1.667 | 344.1 | 1.606 | **56.4** | 55.8 | 56.6 | ~48–52 | no (Tc 151 K) | ~0.44 g/cm³ @ 241 bar |
| CO₂ | 44.010 | 1.289 | 357.9 | 1.813 | **66.2** | 64.0 | 67.4 | ~50–60 | **yes, marginally** — Tc = 304.1 K, vp ≈ 67 bar @ 300 K | ~0.6–0.7 g/cm³ liquid |
| n-butane | 58.122 | 1.09 | 330.8 | 2.050 | **69.2** | 65.0 | 71.9 | **~60–70** (cold), ~75–80 warm | **yes**, vp ≈ 2.6 bar | ~0.57 g/cm³ liquid |
| Kr | 83.798 | 1.667 | 237.6 | 1.606 | **38.9** | 38.6 | 39.1 | ~33–36 | no (Tc 209 K) | ~1.0 g/cm³ @ 241 bar |
| R-134a | 102.03 | ~1.12 | 247.2 | 2.005 | **50.5** | 47.8 | 52.3 | **~40–50** cold; ~70–82 warm-gas | **yes**, vp ≈ 7.0 bar | ~1.19 g/cm³ liquid |
| Xe | 131.29 | 1.667 | 189.8 | 1.606 | **31.1** | 30.8 | 31.2 | ~26–28 | no — Tc = 289.7 K, so **supercritical** at 300 K | ~2.74 g/cm³ @ 241 bar |
| SF₆ | 146.06 | ~1.09 | 208.7 | 2.050 | **43.6** | 41.0 | 45.4 | ~35–42 | **yes**, vp ≈ 21 bar | ~1.4 g/cm³ liquid |
| R-236fa | 152.04 | ~1.08 | 205.2 | 2.067 | **43.2** | 40.6 | 45.0 | **~40** cold; ~82 warm-gas (CHIPS) | **yes**, vp ≈ 2.7 bar | ~1.36 g/cm³ liquid |

Confidence: **A** for the ideal Isp column — it is `[CALC]` from stated inputs
and reproducible. Confidence **C** for the γ values of the refrigerants and
butane (these are real gases well away from ideal near saturation; γ is
temperature- and pressure-dependent and the single value used here is an
approximation) and **C** for the stored-density column, which is
literature-recalled rather than NIST-verified. **NEEDS PRIMARY**: NIST
REFPROP/Webbook densities and real-gas γ before the table ships.

**Cross-check against Wikipedia's cold-gas table** (stated at 0 °C, 241 bar):
H₂ 296/272, He 179/165, N₂ 80/73, Ar 57/52, Xe 31/28 theoretical/measured.
My He (178.1), Ar (56.4) and Xe (31.1) agree to within 1 %. My N₂ (76.8) is
4 % below their 80, and my H₂ (285.6) is 3.5 % below their 296 — consistent
with them using a larger effective expansion (or expansion to zero back
pressure) than ε=50. The **measured/theoretical ratio of ~0.91** across their
whole table is the useful number: **a real cold-gas thruster delivers about
90 % of frozen-ideal Isp**, and that single discount factor is what the
textbook should teach.

**The two design rules that fall straight out of this table:**
1. **Isp scales as $1/\sqrt{M}$.** Helium is 2.3× nitrogen's Isp. Xenon is
   0.4×. If the requirement is Δv per kilogram of propellant, pick light.
2. **Impulse density scales the other way.** Helium at 241 bar stores 0.04
   g/cm³; R-236fa stores 1.36 g/cm³ as a self-pressurising liquid at 2.7 bar.
   Multiply through: helium gives ~7.1 N·s per cm³ of *propellant*, R-236fa
   gives ~5.8 N·s/cm³ — nearly the same — but helium needs a 241-bar COPV
   around it and R-236fa needs a thin-walled 2.7-bar can. **For a CubeSat,
   the tank is the system.** That is why every flown CubeSat cold-gas module
   uses a liquefiable propellant and no launcher uses one.

---

## B.2 Crewed maneuvering units

### Manned Maneuvering Unit (MMU)

| field | value | conf |
|---|---|---|
| Propellant | Gaseous nitrogen (GN₂) | A |
| Thrusters | **24** nozzles, in 4 clusters of 6, giving 6-DOF | A |
| Tanks | 2 × aluminium tanks with Kevlar overwrap | A |
| Propellant mass | **5.9 kg per tank (11.8 kg total)** | A |
| Tank pressure | ≈ 3,000 psi (207 bar) ground charge — **NEEDS PRIMARY** | C |
| Regulation | Regulated (two independent regulated systems, either alone flyable) | C |
| Valve type | Solenoid-actuated poppet | C |
| Total mass | 148 kg loaded | A |
| **Δv** | **110–130 ft/s (33.5–39.6 m/s)** on a ground charge; ≥ 72 ft/s (22 m/s) on an on-orbit recharge | A |
| Translational accel | 0.3 ± 0.05 ft/s² (0.091 m/s²) at nominal mass | A |
| Rotational accel | 10.0 ± 3.0 °/s² | A |
| **Thrust per thruster** | **≈ 7.6 N (1.7 lbf)** — *derived, not sourced*: 0.091 m/s² × ~340 kg (MMU + suited astronaut) ÷ ~4 thrusters firing = ~7.7 N | C — **NEEDS PRIMARY** |
| Implied Isp | Δv 36 m/s, m 340→328 kg ⇒ Isp ≈ 100 s — **too high for GN₂**; the published 110–130 ft/s figure likely assumes a lighter total or a partially-consumed load | C |
| Flights | STS-41-B (1984-02-07, McCandless & Stewart — first untethered EVA), STS-41-C (Solar Max), STS-51-A (Westar VI and Palapa B2 retrieval) | A |

**The Isp inconsistency above is real and must be resolved before the module
uses MMU as a worked example.** With 11.8 kg of GN₂ at a realistic 70 s Isp,
total impulse is ~8,100 N·s; against a 340 kg combined mass that is ~24 m/s,
not 36. Either the quoted Δv assumes a lighter reference mass (MMU alone,
148 kg, gives ~55 m/s), or the tank load is larger than 11.8 kg. **NEEDS
PRIMARY** — the Martin Marietta MMU description or NASA MSFC documentation.

### SAFER (Simplified Aid For EVA Rescue)

| field | value | conf |
|---|---|---|
| Propellant | GN₂ | A |
| Thrusters | **24** | A |
| Tank pressure | **224 bar (3,250 psi)** | A |
| Propellant mass | **1.4 kg (3 lb)** | A |
| Δv | **3.05 m/s (10 ft/s)** | A |
| System mass | **37.7 kg (83–85 lb)** | A |
| Thrust per thruster | ≈ 3.6 N (0.8 lbf) — **NEEDS PRIMARY** | C |
| Implied Isp | 3.05 m/s × ~180 kg (SAFER + suited crew) / (1.4 kg × 9.80665) ≈ **40 s** | CALC |

**SAFER's implied Isp of ~40 s is the more instructive number**, and it is
*credible*: a small, short-pulse, low-ε thruster firing in millisecond bursts
loses most of the ideal 77 s to heat transfer, non-equilibrium expansion, and
valve/plenum dead volume. Use SAFER, not MMU, as the honest cold-gas worked
example. The pair MMU/SAFER also makes the design point: SAFER is a
self-rescue device with a single-use budget, not a maneuvering unit, and its
entire specification follows from "get back to the handrail once."

### Gemini HHMU ("zip gun") — the first one

| field | value | conf |
|---|---|---|
| Propellant | **Oxygen** on the Gemini 4 unit (two bottles at 3,400 psi); later units used **nitrogen**, and Freon was also used in the family | B |
| Nozzles | **3** — one pusher (aft), two tractor (on extenders) | B |
| Construction | Aluminium and stainless steel | B |
| Mass | 6.8 lb (3.1 kg) | B |
| Flights | Carried on Gemini 4, 8, 10, 11; **used on Gemini 4 (White, 1965-06-03) and Gemini 10** | B |
| Thrust | Commonly quoted at ~2 lbf (8.9 N); **not confirmed** in any source read this pass | D |

The engineering lesson from HHMU is not performance, it is control authority:
a hand-held thruster whose line of action does not pass through the combined
centre of mass produces a torque, and White reported exactly that. It is the
argument for why MMU had 24 fixed thrusters around a rigid backpack.

**SOURCES.** `[WP]` Manned Maneuvering Unit, SAFER, Hand-held maneuvering
unit, Cold gas thruster; Smithsonian NASM collection records for the Gemini 4
HHMU. **NEEDS PRIMARY** for all thrust-per-thruster figures.

---

## B.3 Launch-vehicle cold-gas systems

### Falcon 9 first stage GN₂ attitude control

| field | value | conf |
|---|---|---|
| Propellant | **Gaseous nitrogen** | B |
| Configuration | **2 clusters of 4 thrusters** in the interstage region near the top of the first stage | C |
| Function | Flip the booster after stage separation; attitude hold through the exo-atmospheric coast; supplement grid fins outside their authority | B |
| Tank | High-pressure COPVs | C |
| Thrust, Isp, tank pressure, total impulse | **Not published by SpaceX** | D |

**What the textbook can honestly say:** Falcon 9 uses GN₂ cold gas for
first-stage attitude control during the unpowered phases of the return, and
the choice is driven by three things — the thrusters must work in vacuum and
in dense atmosphere, must not require ignition or ullage, and must be
restartable an arbitrary number of times over a ten-minute coast. No
performance numbers should be quoted. SpaceX does not publish them and the
figures circulating on enthusiast sites have no traceable origin.

### Centaur and other upper stages

Centaur's settling/attitude system is **not** cold gas in the classic sense —
it uses **hydrogen peroxide monopropellant** thrusters on the early vehicles
and **hydrazine** on later ones, with **gaseous hydrogen and helium** used for
tank pressurisation and, on some variants, for settling thrust via vented GH₂
thrusters. Cataloguing this properly requires the ULA Centaur documentation.
conf **D** as written — **do not put Centaur in the cold-gas chapter without
a primary source**; it risks teaching a category error.

Ariane 5 EPS and Ariane 6 upper stages likewise use hydrazine or (Ariane 6
APU) a gas-generator system, not cold gas. **NEEDS PRIMARY** if the module
wants a launcher cold-gas example at all; realistically the honest statement
is that **cold gas is rare on launch vehicles** because the impulse-to-mass
penalty is severe at that scale, and Falcon 9's use is the notable exception.

### Sputnik / Vanguard era

I found **no** citable evidence that Sputnik 1 or the Vanguard satellites
carried cold-gas thrusters — Sputnik 1 was uncontrolled and Vanguard 1 was
passively stabilised. The Wikipedia cold-gas article explicitly does not
mention either. **Recommend removing this from the textbook outline** unless
someone produces a source. The genuine early cold-gas milestones are the
**Gemini HHMU (1965)** and the reaction-control systems of early
attitude-controlled scientific satellites; Hubble uses **reaction wheels and
magnetic torquers, not thrusters**, and should not appear in a cold-gas
chapter either. conf **B** on both exclusions.

---

## B.4 CubeSat and smallsat cold-gas systems

### General envelope (NASA State of the Art)

NASA's *State of the Art of Small Spacecraft Technology* gives the cold-gas
class as **10 μN – 3.6 N thrust** and **40 – 110 s Isp**, and states the two
governing trades explicitly: *"Lower molecular weight gases offer higher
specific impulse but require more voluminous storage"* and *"Saturated liquids
are stored at low pressure and vaporized when introduced into a low-pressure
chamber."* conf **A** `[NASA-SOA]`.

Note that the top of that Isp band (110 s) is only reachable with **warm** gas
(resistojet-heated), not true cold gas — see CHIPS below.

### MarCO (Mars Cube One) — VACCO Micro CubeSat Propulsion System

| field | value | conf |
|---|---|---|
| Mission | MarCO-A / MarCO-B, first interplanetary CubeSats; launched with InSight 2018-05-05, Mars flyby 2018-11-26 | A |
| Supplier | VACCO Industries | A |
| Propellant | **R-236fa** (a fire-suppression refrigerant), stored as a **self-pressurising saturated liquid** | A |
| Thrusters | **8** — 4 canted for attitude control, 4 axial for trajectory correction manoeuvres | A |
| **Total impulse** | **755 N·s** | A |
| **Wet mass** | **3,490 g (3.49 kg)** | A |
| **Δv** | **> 40 m/s** for TCMs | A |
| Construction | Single-tank all-welded aluminium module housing propellant, valves and electronics; fits a 6U bus | A |
| Regulation | **Self-pressurising blowdown** (vapour pressure of the saturated liquid, ~2.7 bar at room temperature) — no regulator, no high-pressure COPV | B |
| Valve type | VACCO **ChEMS** chemically-etched micro-valves, frictionless, latching/solenoid | B |
| Thrust per thruster | VACCO states **> 50 mN per thruster** for its cold-gas line generally; ~25 mN is quoted for MarCO specifically in some accounts | C |
| Isp | ≈ 40 s (consistent with the ε=20–50 ideal of 40.6–43.2 s at ~90 % efficiency) | B/CALC |

**Why MarCO matters pedagogically.** It is the proof that a 40-second-Isp
propellant is the *right* engineering answer when the constraint is volume,
safety, and integration — not Δv efficiency. A GN₂ system of the same
total impulse would have needed a 200-bar COPV and would not have fit or
passed launch-safety review as a secondary payload. **Propellant choice is a
systems decision, not a performance decision.** This is the single best
example in the whole cold-gas part.

### Other flown / catalogued CubeSat cold-gas units

| system | supplier | propellant | thrust | Isp | total impulse | wet mass | notes | conf |
|---|---|---|---|---|---|---|---|---|
| Standard MiPS (0.3U) | VACCO | R-236fa | > 50 mN/thruster | ~40 s | **44 N·s**, up to 880,000 firings | — | modular, scalable **82–515 N·s** across the range | B |
| Micro MiPS (0.25U) | VACCO | R-236fa | > 50 mN | ~40 s | **93 N·s**, up to 1,860,000 firings | — | | B |
| MarCO MiPS | VACCO | R-236fa | see above | ~40 s | **755 N·s** | 3.49 kg | flown to Mars | A |
| **CHIPS** | CU Aerospace + VACCO (AFRL) | R-134a / R-236fa / SO₂ | **30 mN** | **82 s** | — | **1.2 kg wet, 0.7 kg propellant** | **warm gas / resistojet** — electrothermal, not pure cold gas. The 82 s vs 43 s ideal is the entire argument for heating the gas. | B |
| **NanoProp CGP3 / CubeProp (3U)** | GomSpace | **n-butane** | **1 mN per thruster**, 4 thrusters, **5 μN resolution** | ~60–70 s | — | 60 g propellant | **self-pressurising, 1–4 bar** from butane vapour pressure. Δv up to 15 m/s for a 2.66 kg satellite. Flown on TW-1 (2015). | B |
| **NanoProp 6U** | GomSpace | n-butane | — | — | — | — | Flown on **GOMX-4B (2018)** — ESA's butane-propelled CubeSat, demonstrated formation flying with GOMX-4A over ~4,500 km separation | B |
| CGMT-000-9 | Marotta Controls | GN₂ | — | — | — | — | Flew on NASA **ST-5** (2006) | B |
| BioSentinel ACS | Lightsey Space Research (Georgia Tech / UT Austin lineage) | R-236fa | — | — | — | — | 6U CubeSat, flown on **Artemis I** (2022) | B |
| I2T5 | ThrustMe | **iodine, subliming** | — | — | — | — | Not strictly cold gas — solid→vapour sublimation feed. Flown 2019+. | B |

**The university/JPL lineage.** The R-236fa self-pressurising architecture
traces through JPL (MarCO, CPOD, NEA Scout) and the Lightsey group's academic
work (BioSentinel, and the earlier Georgia Tech / UT Austin 3D-printed
integrated tank-and-nozzle designs). The distinguishing academic contribution
is **printing the plenum, feed passages and nozzles as one part**, which
removes the joints that dominate leak-rate budgets in a system that must hold
propellant for years. conf **C** — **NEEDS PRIMARY** (the SmallSat conference
papers).

**SOURCES.** `[NASA-SOA]` chapter 4 (In-Space Propulsion);
`[VACCO]` cubesat-propulsion.com system pages and the JPL MarCO data sheet;
GomSpace propulsion white paper; ESA GOMX-4B mission pages; CU Aerospace CHIPS
product page.

---

## Contested figures and how the textbook should present them

Ranked by how much damage getting them wrong would do.

**1. Thrust: per-motor versus per-vehicle. (Titan IV, Ariane 5, SLS)**
This is the most common error in the secondary literature and it is a factor
of two. Wikipedia's Titan IV infobox gives "14.234 MN" for the UA1207 and
"15.12 MN" for the SRMU; both are two-booster totals presented as if they
described one motor. **Rule for the textbook: every thrust figure in
`engine-database.md` carries an explicit `/motor` or `/vehicle` suffix, and
every module quoting one repeats the suffix.** No exceptions, including for
single-motor vehicles where it seems redundant.

**2. Ariane 5 EAP propellant mass. (270 t vs 237.8 t)**
Wikipedia lists 270,000 kg and 273,000 kg as "propellant mass" for P238 and
P241. Those are gross masses. The designation *P238* means 238 tonnes of
propellant, by construction. **Present the designation-consistent value
(237.8 / 238 / 241 t) and add a footnote naming the error**, because students
will find the wrong number in thirty seconds and need to know why it is wrong.

**3. Star 48B specific impulse. (286.2 s vs 292.2 s)**
Not an error — two nozzles. The short-nozzle variant (ε ≈ 47.7) was built to
fit inside the Shuttle PAM-D cradle; the long-nozzle variant is the
higher-performing motor. **Present both, always with the ε, and use the pair
as the worked example for "Isp is a property of the motor *and* its nozzle,
not of the propellant."** Also correct the 28 kg inert mass appearing in
McDowell's list: 2,137 − 2,009 = 128 kg, and 28 kg is almost certainly a
dropped digit.

**4. Shuttle SRB propellant composition. (69.6/0.4 vs 69.8/0.2)**
Both sum to 100 %; the difference is iron-oxide burn-rate catalyst loading,
0.2 percentage points. **Print the NASA fact-sheet figure (AP 69.6, Al 16.0,
Fe₂O₃ 0.4, PBAN 12.04, epoxy 1.96) and footnote the variant.** Then use the
0.2-point discrepancy to make a real teaching point: iron oxide is a
*burn-rate catalyst*, so a 0.2 % difference in its loading is not a rounding
question — it is a several-percent change in burn rate and therefore in
chamber pressure and thrust trace. The reader should leave knowing why that
particular number is the one worth checking.

**5. M-V second stage Isp of 203 s.**
Physically implausible between a 246 s stage and a 301 s stage.
**Do not print it.** Either state "≈285 s (uncorroborated)" with a visible
caveat, or omit the M-24 Isp entirely and say the source data is inconsistent.
Printing a wrong number with a caveat is worse than printing no number.

**6. MMU Δv and the Isp it implies.**
The published 110–130 ft/s does not close against 11.8 kg of GN₂ and a suited
astronaut at any credible cold-gas Isp. **Use SAFER as the worked example
instead** — its numbers (1.4 kg, 3.05 m/s, 224 bar, 37.7 kg system) close to
a believable ~40 s Isp. Mention MMU for its history and its 24-thruster
6-DOF architecture, and state plainly that the published Δv figure cannot be
reconciled with the published propellant load without knowing the reference
mass.

**7. Cold-gas ideal Isp: which ε, which temperature?**
Published cold-gas Isp tables rarely state the expansion ratio, and the spread
between ε=20 and ε=100 is 3–10 % depending on γ. **The textbook's table must
state T₀ = 300 K and ε explicitly in the caption, give ideal values, and give
the realized values separately with the ~0.90 efficiency factor named.** The
efficiency factor is the physically interesting part — it is where boundary
layers, heat transfer from the wall to a cold gas, and non-equilibrium
expansion of a polyatomic refrigerant all show up at once.

**8. BOLE and every other in-development motor.**
+11 % total impulse, 4 million lbf, composite case — all contractor claims for
a motor that has static-fired once, **with an anomaly near the end of the
burn**. Per hard rule 3, label as claims. **The anomaly must appear in the
same paragraph as the performance claim**, not in a footnote.

**9. Where the file says NEEDS PRIMARY, it means it.**
The following are not yet fit to quote: all Titan UA120/SRMU numbers; all
Castor numbers except Castor 120; all Star 37 numbers; all Orbus numbers;
Scout stage numbers; Shavit; every Chinese motor; MMU and SAFER thrust per
thruster; Falcon 9 anything; Centaur (which may not belong in the cold-gas
chapter at all); stored-density and refrigerant-γ columns in the gas table.

---

*End of verification worksheet. Numbers migrate to `engine-database.md` only
after their confidence reaches B or better and the per-motor/per-vehicle and
max/avg qualifiers are attached.*
