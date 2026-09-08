# Liquid methane and methalox facility safety — source verification

Working file. This is a **source-verification memo**, not course prose: every
claim below carries a citation, and anything I could not confirm is marked as
such rather than smoothed over. Course text should be written *from* this file,
not before it.

Scope note: this is hazard-recognition, engineering-controls and design-review
material. It covers why methane and methalox systems bite, what controls exist,
and what a reviewer looks for. It deliberately contains **no operating
procedures, no facility construction instructions, and no transfer or firing
sequences**.

Compiled 2026-09-08. Editions verified as of that date against
`_verify-standards.md` in this directory; standards move, so re-check anything
before it goes into a graded assessment.

---

## 0. How to read this file

**Confidence labels**

| Label | Meaning |
|---|---|
| **A** | Primary source. Read the actual document (or the publisher's own catalogue record for a bibliographic fact) and quoted or paraphrased it directly. |
| **B** | Secondary but reputable — a technical body, national lab, manufacturer, or peer-reviewed paper reporting the fact, where I did not read the underlying primary document. |
| **C** | Unconfirmed. Plausible, commonly repeated, but I could not verify it against a source I trust. Do not put a C claim in the course without chasing it down. |

**Standing caveats**

- **NTRS landing pages do not survive automated fetching.** `ntrs.nasa.gov/citations/{id}`
  is a client-rendered SPA and returned HTTP 504 or a connection timeout every
  time. What I actually read was the NTRS **API** record
  (`ntrs.nasa.gov/api/citations/{id}`, which returns JSON with title, authors and
  report numbers) and the **PDF** (`.../downloads/{id}.pdf`). Both return HTTP 200.
  Citations below give the human-readable `/citations/` URL because that is what a
  bibliography should carry, but the grade reflects the API/PDF that I read.
  Report numbers quoted are the strings NASA's own record returns.
- **NASA report numbers are quoted exactly as NTRS returns them and nothing is
  invented.** Where a document has only an internal center number (`JSC-CN-…`) and
  no NASA/TM number, that is what is shown.
- **Paywalled codes were verified at naming level only.** NFPA 55, 59A, 497 and 70
  editions are carried over from `_verify-standards.md` in this directory rather
  than re-litigated here; that file records the evidence and the residual doubt.
  I did **not** read the body of any NFPA document. Every statement below about
  what a code *requires* is therefore either **B** (reported by a reputable
  secondary) or explicitly flagged.
- **One source needed decoding.** The NESC LOX/LNG presentation (§8.1) is a
  PowerPoint export whose embedded fonts carry no `ToUnicode` map, so ordinary
  text extraction yields a monoalphabetic substitution. I solved the substitution
  against known cribs and the plaintext is internally consistent across the whole
  deck. The quotations in §8.1 are high-confidence but were **reconstructed, not
  copy-pasted** — verify them against the PDF before quoting in the course.
- **DTIC and a few vendor pages return HTTP 403 to automated fetches**
  (`apps.dtic.mil`, `static.e-publishing.af.mil`, `sensidyne.com`). Where that
  happened the row says so and the grade drops.

**Two corrections to the task brief.** Both verified; both matter.

1. **The brief's "methane freezes near 90.7 K and LOX boils near 90.2 K" is
   right, and the margin is even tighter than it sounds — about half a kelvin.**
   NIST gives the methane triple point as **90.67 ± 0.03 K** and the oxygen
   normal boiling point as **90.2 K**. This is not a comfortable margin, it is a
   design constraint (§2.5). **[A]**
2. **Morpheus did not run on rocket-grade methane. It ran on LNG.** The Morpheus
   lessons-learned paper lists the engine-test consumables as "liquid oxygen,
   **liquefied natural gas**, helium, liquid nitrogen, and gaseous nitrogen."
   That matters for §2.2 (weathering) and for §8, because the NESC explosive-hazard
   work is also framed as LO2/**LNG**, not LO2/CH4. Do not let the course blur
   the two. **[A]**

---

## 1. Why methane for rocket propulsion

### 1.1 The framing statement — NASA's own words **[A]**

The cleanest single citable statement of the case is from the Morpheus
lessons-learned paper:

> "The Morpheus LOX/methane propulsion system can provide a specific impulse
> during space flight of up to 321 seconds; it is clean-burning, non-toxic, and
> cryogenic, but space-storable. Additionally, for future space missions the lox
> and/or methane could be produced in situ on planetary surfaces, and the oxygen
> is compatible on-board with life support systems and power generation. These
> attributes make LOX/methane an attractive propulsion [option]."

— Olansen, Munday & Mitchell, *Project Morpheus: Lessons Learned in Lander
Technology Development*, AIAA SPACE 2013, NASA JSC, report **JSC-CN-29387**,
NTRS **20140001410**.
https://ntrs.nasa.gov/citations/20140001410

The longer version, from Hurlbert *et al.*, is worth having in full because it
names every argument at once **[A]**:

> "LOX/LCH4 is a space storable propellant combination. No heaters are required
> as with earth storable propellants and no active cooling as with LH2. In
> certain environments, LOX and methane can be stored indefinitely at
> temperatures of 90–120 K in equilibrium with deep space environments and for
> months in other orbits. Lox is compatible with many materials and methane is
> compatible with nearly all materials. Both are non-corrosive. They are clean
> burning, non-sooting, high vapor pressure propellants that do not coat
> sensitive optics or contaminate surfaces as does MMH/NTO. … The propellants are
> fully non-toxic and low cost which enables rapid loading, testing, and
> turnaround operations."

— Hurlbert, Morehead, Melcher & Atwell, *Integrated Pressure-Fed Liquid Oxygen /
Methane Propulsion Systems — Morpheus Experience, MARE, and Future Applications*,
NASA JSC, report **JSC-CN-35060**, NTRS **20160001041**.
https://ntrs.nasa.gov/citations/20160001041

Note the passage on why hydrogen lost this trade at spacecraft scale — it is a
mass argument, not an Isp argument **[A]**:

> "liquid hydrogen for spacecraft propulsion was determined to be very complex
> due to difficulties in long duration storage and the need for engine pumps. The
> hydrogen boil-off mass, large H2 tank volumes, and complexity of pumps that
> required redundancy resulted in a high spacecraft dry mass and cost which
> offset the high specific impulse."

### 1.2 Density and tank volume — the actual numbers **[A]**

From Chen, *ISRU Propellant Selection for Space Exploration Vehicles*, NASA MSFC,
report **M13-2789**, NTRS **20140002709**, Table 1.
https://ntrs.nasa.gov/citations/20140002709

Source units are Rankine and lbm/ft³; SI conversions are mine.

| Propellant | Tank temp | Density | Normal boiling point | Freezing point |
|---|---|---|---|---|
| Liquid oxygen, LO₂ | 160 °R (88.9 K) | 71.3 lbm/ft³ (1142 kg/m³) | — | 97.8 °R (54.3 K) |
| Liquid hydrogen, LH₂ | 38 °R (21.1 K) | **4.43 lbm/ft³ (71.0 kg/m³)** | 36.6 °R (20.3 K) | 25 °R (13.9 K) |
| RP-1 | ambient | **50.48 lbm/ft³ (808 kg/m³)** | — | 400 °R max (222 K) |
| Methane at NBP | 201 °R (111.7 K) | **26.4 lbm/ft³ (423 kg/m³)** | 201 °R (111.7 K) | 163.5 °R (90.8 K) |
| Methane, subcooled | 183 °R (101.7 K) | 27.3 lbm/ft³ (437 kg/m³) | — | — |

**What this table actually says.** Methane is about **six times denser than
liquid hydrogen** and about **half the density of RP-1**. That is the whole
"between kerosene and hydrogen" claim, in numbers, from a NASA trade study —
and the freezing point in that table (163.5 °R = 90.8 K) independently
corroborates NIST's 90.67 K triple point.

The volume consequence is worth making explicit in the course. For a fixed fuel
*mass*, a methane tank is roughly **one sixth** the volume of a hydrogen tank and
roughly **twice** the volume of an RP-1 tank. Tank volume drives dry mass,
insulation area, and — the point for this course — the **size of the inventory
that a facility has to site, relieve, and separate**.

Chen also states the selection criterion in the form worth teaching **[A]**:

> "From a vehicle system perspective, it is the combined characteristic of
> propellant Isp and bulk density in meeting the vehicle impulsive velocity (ΔV)
> mission requirement that offers either the lowest mass or lowest propellant
> tank volume that warrants the selection."

Isp alone is the wrong figure of merit. Density-impulse is closer.

### 1.3 Coking and regenerative cooling **[A]** for the criterion, **[B]** for the comparison

Chen names thermal stability in the cooling channel as a first-order selection
criterion, not an afterthought **[A]**:

> "it must have the thermal stability required to operate in a liquid rocket
> engine, this include the ability to cool engine throat critical heat flux,
> **avoid thermal decomposition and coking in engine coolant channels**, and
> offers sufficiently high engine specific impulse."

NASA's own repeated description of methane as **"clean burning, non-sooting"**
(Hurlbert *et al.*, §1.1) is the citable contrast with RP-1 **[A]**.

**What I could not verify to A.** I did not find a NASA source giving a
side-by-side coking-rate number for methane versus RP-1. The mechanism —
kerosene pyrolysing to solid carbon on channel walls above roughly 480 °C,
restricting coolant flow and degrading heat transfer, and thereby capping
chamber pressure and reuse life — is reported consistently in the secondary
literature but I read only secondary reporting of it. Treat any specific
temperature or rate as **[C]** until sourced. The related NASA primary source
that does exist, and that the course should chase, is Stiegemeier, B. R.,
Meyer, M. L. & Driscoll, E., *RP-1 Thermal Stability and Copper Based Materials
Compatibility Study*, NTRS **20050158764**
(https://ntrs.nasa.gov/citations/20050158764) — I confirmed the NTRS record,
title and authors, but did not read the document. **[B]**

### 1.4 Reusability and cleanliness **[A]**

Hurlbert *et al.* make the operational argument directly: non-toxic, non-sooting
propellants "enable rapid loading, testing, and turnaround operations of the
spacecraft and subsystems," and

> "No pre-loading of hazardous propellants onto the spacecraft is required at an
> offsite facility. The inert spacecraft is transported and integrated in the
> launch vehicle."

This is a **facility** argument, and it is the one most relevant to this course:
the ground-side cost of hypergolics is the SCAPE suits, the vapour scrubbers, the
decontamination, and the offsite hazardous-propellant facility. Methalox deletes
those and substitutes cryogenic and flammable-gas problems instead. The course
should be blunt that this is a **trade, not a free win** — see §8 and §9.

### 1.5 ISRU on Mars **[A]**

Banker & Ryan, *Liquid Oxygen/Liquid Methane Integrated Power and Propulsion*,
NASA JSC, report **JSC-CN-35628**, NTRS **20160003080**
(https://ntrs.nasa.gov/citations/20160003080), state that

> "Human-Mars architectures point to an oxygen-methane economy utilizing common
> commodities, scavenged from the planetary atmosphere and soil via In-Situ
> Resource Utilization (ISRU), and common commodities across sub-systems."

Chen's paper is the fuller treatment: the Mars atmosphere is ~95 % CO₂, and with
water from regolith both LCH₄ and LO₂ are producible, which is what makes a
fully-fuelled return vehicle possible without carrying return propellant. **[A]**

### 1.6 Storability, boiloff and insulation **[A]**

Hurlbert's "**90–120 K** in equilibrium with deep space environments" (§1.1) is
the citable storability claim. The contrast with hydrogen is the whole argument:
LH₂ at 20.3 K sits far below every practical passive equilibrium, so it demands
active cryogenic fluid management; methane at 111.7 K does not, in many
environments.

For a **ground facility**, the same physics reads differently and the course must
say so. Methane's normal boiling point is 111 K and LOX's is 90.2 K, so a methane
tank on a pad has a *smaller* temperature difference to ambient than a LOX tank
and a much smaller one than an LH₂ tank. Lower heat leak per unit area, lower
boiloff, less vent-gas handling — but the vent gas is **flammable**, which the
LOX and LN₂ vent gas is not. Boiloff is a smaller thermal problem and a larger
hazard problem. This is the cleanest one-sentence framing of the whole module.

### 1.7 Common-bulkhead / common-tank design **[B]**

The argument is that LO₂ (NBP 90.2 K) and LCH₄ (NBP 111.7 K) are close enough in
temperature that a shared bulkhead between the two tanks does not impose the
severe thermal gradient that a LO₂/LH₂ common bulkhead does, which permits mass
savings. I could not reach a NASA primary source stating this in those words;
the claim is reported consistently in the trade and secondary literature. **[B]**

**Do not teach this as an unqualified benefit.** §2.5 (methane freezing) and
§8.1 (NESC condensed-phase detonation finding) both identify the common bulkhead
as a *hazard concentrator*. NASA's own explosive-hazard work names
"common bulkhead tank designs, common-walled downcomers, or transfer tubes" as
the configurations of concern. The honest framing is: the thermal compatibility
is real, and it is exactly what puts a fuel and an oxidiser one wall apart.

---

## 2. Cryogenic methane behaviour

### 2.1 Verified physical properties **[A]**

All from the NIST Chemistry WebBook phase-change pages, read directly.

| Property | Methane (CH₄) | Oxygen (O₂) | Nitrogen (N₂) |
|---|---|---|---|
| Normal boiling point | **111 ± 2 K** (−162 °C) | **90.2 K** (−183 °C) | **77.34 K** (−196 °C) |
| Triple point | **90.67 ± 0.03 K** | 54.33 K | **63.14 K** |
| Triple-point pressure | 0.1169 ± 0.0006 bar | — | — |
| Critical temperature | 190.6 ± 0.3 K | 154.58 K | 126.19 K |
| Critical pressure | 46.1 ± 0.3 bar | 50.43 bar | 33.978 bar |

- Methane: https://webbook.nist.gov/cgi/cbook.cgi?ID=C74828&Mask=4
- Oxygen: https://webbook.nist.gov/cgi/cbook.cgi?ID=C7782447&Mask=4
- Nitrogen: https://webbook.nist.gov/cgi/cbook.cgi?ID=C7727379&Mask=4

Bureau of Mines Bulletin 680 Appendix A independently gives methane's boiling
point as −164 °C and its flash point as **−188 °C** **[A]** (§3.1 for the
citation). A flash point 188 degrees below zero is the compact way to say that
**there is no temperature at which liquid methane is not giving off an ignitable
vapour**.

### 2.2 Weathering — real for LNG, largely not for rocket-grade methane **[B]**

"Weathering" is the change in LNG composition during storage as the more volatile
components preferentially boil off. The lighter species — nitrogen first, then
methane — leave first, so the residual liquid grows progressively richer in
ethane, propane and heavier hydrocarbons, and its density and heating value
drift upward over time. Typical reported heat-leak-driven boiloff for a large
LNG tank is of order **0.05 % of contents per day**. **[B]** — reported by the
LNG marine/industry technical literature; I did not read a primary measurement.

**The correction the course must make.** Weathering is a *mixture* phenomenon.
Rocket-grade liquid methane is a high-purity single component, so there is
nothing lighter to fractionate away and no heavy residue to concentrate. The
concept still earns its place in the syllabus for three reasons:

1. It explains **why the LNG industry's deep operational experience does not
   transfer one-for-one** to a rocket-grade methane facility. Composition,
   density, and flammability data from LNG practice carry an implicit mixture
   assumption.
2. **NASA has actually run on LNG.** Morpheus's engine-test consumable list is
   "liquid oxygen, **liquefied natural gas**, helium, liquid nitrogen, and
   gaseous nitrogen" **[A]** — so for that programme the mixture behaviour was
   live, not academic. Breisacher & Ajmani's igniter work explicitly evaluated
   "the effects of **methane purity**" on ignition **[A]** (§10.4), which is the
   same issue viewed from the combustion end.
3. A facility that takes delivery of LNG and a facility that takes delivery of
   ≥99.5 % CH₄ have **different receiving, sampling and acceptance problems**,
   and a design review should know which one it is looking at.

### 2.3 Rollover — name it, and be honest that it is an LNG-tank phenomenon **[B]**

Stratification occurs when a storage tank ends up holding layers of different
density — from filling with liquid of a different composition, or from
"auto-stratification" as preferential nitrogen boiloff makes the *upper* layer
lighter than the lower one. Rollover is the sudden inversion and rapid mixing of
those layers, which releases vapour at many times the normal boiloff rate and can
overpressurise a tank not sized for it. Reported figures: high nitrogen content
(around 4 % or more) promotes self-stratification, and **at least 24 rollover
incidents have been reported since 1960**. **[B]**

The engineering reference the course should chase for a primary account is
Baker & Creed, *Stratification and rollover in liquefied natural gas storage
tanks*, IChemE Symposium Series 139 (1995):
https://www.icheme.org/media/25371/major-hazards-onshore-and-offshore-ii-icheme-symposium-series-139-1995-46-baker.pdf
— I confirmed the URL resolves but did not read the paper. **[C]** for anything
attributed to it specifically.

**Applicability caveat, stated plainly.** Rollover requires a multicomponent
liquid and a large, quiescent, stratified inventory. A single-component
rocket-grade methane run tank is a poor candidate. Teach rollover as (a) a named
phenomenon an engineer should recognise, and (b) the reason **relief sizing must
consider credible upset vapour-generation rates, not just steady heat leak** —
which *is* general. Do not imply a methalox test stand is at rollover risk.

### 2.4 Two-phase flow **[B]**

Any cryogenic transfer line starts warm. Until the hardware is at liquid
temperature the line runs two-phase, with vapour slugs, unstable flow, and
transient pressure and thermal loads on valves, joints and instruments; flow
metering is unreliable through the transient. NASA built dedicated rigs for
exactly this problem: Skaff *et al.*, *Liquid Methane/Liquid Oxygen Propellant
Conditioning Feed System (PCFS) Test Rigs*, NASA GRC, report **E-16872**, NTRS
**20090004695** (https://ntrs.nasa.gov/citations/20090004695), built to evaluate
engine performance "over a broad range of propellant temperatures" — I read the
abstract, not the body. **[B]**

The design-review point: two-phase behaviour is a **normal, expected operating
regime**, not a fault. Relief devices, restraints, supports and instrument
ranges must be designed for it.

### 2.5 The LOX/methane temperature relationship — the half-kelvin problem **[A]**

This is the single most teachable number in the module.

- Methane triple point: **90.67 ± 0.03 K** (NIST)
- Oxygen normal boiling point: **90.2 K** (NIST)

**Liquid oxygen at atmospheric pressure is colder than the temperature at which
methane freezes solid, by roughly half a kelvin.**

The consequences a reviewer should look for:

- **Common bulkheads and common-walled downcomers.** A methane-side surface in
  thermal contact with LOX at its normal boiling point is, in principle, below
  the methane freezing point. Any local subcooling of the LOX — or any reduction
  of pressure on the LOX side — pushes it further below.
- **Heat exchangers and conditioning hardware.** Anywhere methane is cooled
  *against* LOX (or against LN₂, NBP 77.34 K, which is far colder still), solid
  methane can form, and solids in a cryogenic system mean blocked passages,
  damaged seats, and debris downstream.
- **Subcooled methane storage.** Chen's table lists subcooled methane at
  **183 °R = 101.7 K** — deliberately only about 11 K above its own freezing
  point. Densification buys tank volume and buys margin *against* boiling while
  spending margin *toward* freezing. That trade should be explicit in any design
  review.

**What I could not verify.** I did not find a NASA or industry primary source
reporting an *actual incident* of methane freezing in a methalox heat exchanger
or common-bulkhead tank. The freezing point and the LOX boiling point are both
**[A]**; the inference that they collide is elementary; but the specific failure
mode as an observed event is **[C]**. Say "this is a design constraint that
follows from the property data," not "this has happened."

---

## 3. Flammability and ignition

### 3.1 Methane in air — and why the numbers disagree **[A]**

Two primary sources, deliberately shown together because the disagreement is
the lesson.

**Bureau of Mines Bulletin 680**, Kuchta, J. M. (1985), *Investigation of fire and
explosion accidents in the chemical, mining, and fuel-related industries — a
manual*, Appendix A, p. 71 (read as a page image):

| Methane, CH₄ | value |
|---|---|
| Molecular weight | 16.04 |
| Specific gravity (air = 1) | **0.55** |
| Boiling point | −164 °C |
| Stoichiometric conc. in air | 9.48 vol % |
| Flash point | **−188 °C** |
| Minimum autoignition temperature | **630 °C** |
| Flammable limits, 25 °C | **5.0 – 15.0 vol %** |

https://shepherd.caltech.edu/EDL/PublicResources/flammability/p71.pdf
(hosted by the Caltech Explosion Dynamics Laboratory:
https://shepherd.caltech.edu/EDL/PublicResources/flammability.html)

**Zlochower, I. A. & Green, G. M.** (NIOSH Pittsburgh Research Laboratory), *The
limiting oxygen concentration and flammability limits of gases and gas mixtures*,
Table 1, read directly:
https://stacks.cdc.gov/view/cdc/9780/cdc_9780_DS1.pdf

| Fuel | Vessel | LFL (mol %) | UFL (mol %) | LOC (mol % O₂) | Criterion |
|---|---|---|---|---|---|
| Methane | 120-L sphere | 5.0 | **15.8** | **11.1** | 7 % pressure rise |
| Methane | 20-L | 4.9 | 15.9 | 10.7 | 7 % pressure rise |
| Methane | 12-L glass | 4.9 | 15.8 | 11.3 | visual |
| Methane | flammability tube | 5.0 | **15.0** | **12.0** | visual |
| Hydrogen | 120-L sphere | — | 75.9 | 4.6 | 7 % pressure rise |
| Hydrogen | flammability tube | **4.0** | **75.0** | 5.0 | visual |

**The teaching point.** The classic "methane 5–15 %" comes from a long
flammability tube with a visual propagation criterion. A closed vessel with a
pressure-rise criterion gives **15.8 %** on the rich side and a *lower* limiting
oxygen concentration. **A flammability limit is not a property of the gas; it is
a property of the gas plus the vessel plus the ignition source plus the
propagation criterion.** For facility design this means: use the value the
governing code uses, know which one your detector is calibrated against
(§5), and never treat the number as a bright line to operate up to.

### 3.2 Methane and hydrogen in oxygen — primary source, same apparatus **[A]**

Coward, H. F. & Jones, G. W. (1952), *Limits of Flammability of Gases and
Vapors*, Bulletin 503, U.S. Bureau of Mines. Read as page images from the
Caltech mirror: https://shepherd.caltech.edu/EDL/PublicResources/flammability/USBM-503.pdf

**Bulletin 503, p. 44 — "Methane in oxygen":**

> "The limits of methane in oxygen, with upward propagation of flame in a
> 2-inch-diameter tube open at its lower end, are **5.15 and 60.5 percent**."

**Bulletin 503, p. 19 — "Hydrogen in oxygen":**

> "The limits of visible flame of hydrogen in oxygen with upward propagation of
> flame in a tube 2 inches in diameter, open at the firing end, are **4.65 and
> 93.90 percent**. In closed tubes the extremes recorded are 3.9 and 95.8 percent."

This is a genuinely apples-to-apples comparison — same apparatus, same
propagation direction, same investigators. Consolidated:

| | in air | in oxygen | rich limit multiplier |
|---|---|---|---|
| **Methane** | 5.0 – 15.0 % | **5.15 – 60.5 %** | ×4.0 |
| **Hydrogen** | 4.0 – 75.0 % | **4.65 – 93.9 %** | ×1.25 |

**What this means for a methalox facility.** The lean limit barely moves when you
swap air for oxygen — about 5 % either way, for both fuels. **The rich limit is
what oxygen changes**, and for methane it changes enormously: from a 10-point-wide
window in air to a 55-point-wide window in oxygen. A methane leak into ambient air
is flammable over a narrow band. A methane leak into an **oxygen-enriched** space —
which is precisely what a co-located LOX leak creates — is flammable over most of
the composition range. This is the quantitative core of §8.

Bulletin 503, p. 45 also gives the inerting figure directly **[A]**: "no mixture of
methane is flammable at ordinary temperatures and pressures when the atmosphere
contains **less than 12.8 percent oxygen** and the remainder is nitrogen." Compare
Zlochower & Green's modern closed-vessel LOC of **11.1 %** — the older tube method
is the less conservative of the two, which is the direction that matters.

### 3.3 Autoignition temperature — a genuine conflict in the literature **[A] / [C]**

- **630 °C** — Bureau of Mines Bulletin 680, Appendix A, minimum AIT (read
  directly, §3.1). **[A]**
- **537 °C (999 °F)** — the value almost universally attributed to NFPA 497 and
  reproduced in hazardous-area-classification practice. **I could not read the
  NFPA 497 table**; NFPA documents are paywalled and their product pages render
  client-side. Every source I could reach for 537 °C is secondary. **[C] as to
  provenance**, though the value's currency in practice is not in doubt.

The spread is real and is a test-method artefact (vessel material, size,
residence time; ASTM E659 versus older Bureau of Mines apparatus). **For area
classification, use the value in the code you are working to** — the T-code
selection in §6 depends on it, and a designer who picks 630 °C when the AHJ uses
537 °C has chosen a less conservative surface-temperature limit.

### 3.4 Minimum ignition energy **[B]**

| Fuel | MIE in air | Source quality |
|---|---|---|
| Methane | ~**0.28 – 0.29 mJ** | **[B]** — consistent across multiple secondary compilations; no primary read |
| Hydrogen | ~**0.017 – 0.02 mJ** | **[B]** — same |

Roughly a **factor of 15–17**. I did not reach a primary measurement for either
and the course should chase one (the ASTM E582 literature, or NFPA 497's table,
would be the places to look) before printing a number to two significant figures.

### 3.5 What these numbers mean for facility design

Read across §3.1–§3.4, methane against hydrogen:

| | Methane | Hydrogen | Design consequence |
|---|---|---|---|
| Flammable range in air | 5 – 15 % | 4 – 75 % | Methane has a **narrow** window; a leak is more often outside it. Hydrogen is flammable almost everywhere it is detectable. |
| Flammable range in O₂ | 5.15 – 60.5 % | 4.65 – 93.9 % | Oxygen enrichment closes most of that gap. **Methane's advantage over hydrogen is an air-only advantage.** |
| MIE | ~0.28 mJ | ~0.017 mJ | Both are below human-perceptible static discharge. Bonding, grounding and ignition-source control are mandatory for both; methane merely gives slightly more margin against weak sparks. |
| Vapour density behaviour | dense when cold, buoyant when warm (§4) | buoyant always | **The single biggest divergence.** Hydrogen practice is roof vents and high-point detection. Methane practice must cover **both** regimes. |
| NEC gas group | **Group D** | **Group B** | Group D equipment is cheaper and far more widely available than Group B. A genuine capital-cost advantage for methane. **[B]** |

**The honest summary for the course.** Methane is meaningfully more forgiving
than hydrogen on ignition energy, flammable range in air, and equipment group.
It is *not* more forgiving on: leak detectability without instruments (both are
odourless as delivered — see §5.5), behaviour in an oxygen-enriched space, or
consequence given ignition. And it is **less** forgiving than hydrogen in one
specific way: hydrogen that escapes goes up and leaves, whereas **cold methane
finds the floor and stays** (§4).

---

## 4. Vapour dispersion, conceptually

### 4.1 The crossover — derived, then corroborated **[A]** / **[B]**

At constant pressure an ideal gas has density proportional to *M/T*. Cold methane
vapour and ambient air have equal density when

  T_CH₄ = T_air × (M_CH₄ / M_air) = 293.15 K × (16.043 / 28.96) = **162.4 K = −110.8 °C**

That derivation is **[A]** — the molar masses and the ideal-gas relation are not
in dispute, and Bulletin 680 independently gives methane's specific gravity as
**0.55** relative to air at equal temperature (§3.1), which is the same 16.04/28.96.

Published figures agree closely **[B]**:

- LNG vapour at its boiling point has a relative density of about **1.5** (some
  sources say up to 1.8) — i.e. **denser than air**. My derivation gives
  (16.043/111.7)/(28.96/293.15) = **1.45**, consistent.
- Vapour becomes **buoyant at about −110 °C**, and below that temperature is
  negatively buoyant and accumulates in low areas until it warms.

### 4.2 Why this drives facility layout

A cold methane release therefore behaves in **two successive regimes**:

1. **Dense-gas phase.** Immediately after release the vapour is up to ~1.5× the
   density of air. It slumps, spreads laterally along the ground, and — critically
   — **resists dilution**, because gravity-driven slumping suppresses the vertical
   mixing that would otherwise entrain air. Sandia's LNG work states the mechanism
   plainly: "Dense gas clouds, like that of LNG, are negatively buoyant and they
   tend to slump to the ground when the wind speed is low. As a result of this
   process, the dilution with air is reduced." **[B]**
2. **Buoyant phase.** As the cloud entrains warm air and passes about −110 °C it
   becomes lighter than air and lifts.

The hazard lives in the **transition** — a cloud that is still cold enough to hug
the ground but already diluted into the 5–15 % flammable band.

**What follows for design review.** Stated as recognition criteria, not
construction instructions:

- **Low points are collection points.** Trenches, cable ducts, pits, sumps,
  bunded areas, stairwells and below-grade rooms are where a cold methane cloud
  goes. Any such feature within the credible release footprint of a methane
  system is a finding.
- **Detection cannot be roof-only.** Hydrogen practice — detectors high, vents at
  the apex — is *wrong on its own* for methane. See §5.3.
- **Grade and drainage matter as much as ventilation.** Where a cloud runs is set
  by topography before it is set by wind.
- **Trenches are a specific trap.** They channel a dense cloud, they concentrate
  it, they are hard to ventilate, and they usually contain exactly the ignition
  sources (cabling, junction boxes) that the classification exercise in §6 is
  meant to exclude. A **shared** trench carrying both fuel and oxidiser lines is
  the §8 failure mode in physical form.
- **Buildings.** A dense cloud enters at grade — doorways, floor penetrations,
  cable entries, HVAC intakes at low level.

### 4.3 Scale — the Sandia work **[A]**

Luketa, Hightower & Attaway, *Breach and Safety Analysis of Spills Over Water
from Large Liquefied Natural Gas Carriers*, **SAND2008-3153**, Sandia National
Laboratories, May 2008. Read directly: https://www.osti.gov/servlets/purl/983670

Reported dispersion results, for **large marine spills** — orders of magnitude
above anything a test stand holds, and quoted here only to fix the scale of the
physics:

- Near-shore, nominal 5 m breach: distance to LFL **2,800–3,300 m, average ~3,050 m**.
- Offshore, nominal 12 m breach: distance to LFL **4,000–5,200 m, average ~4,600 m**.

Sandia's own framing caveat is the part that belongs in the course **[A]**:

> "Pool fire and vapor dispersion hazard distances are significantly influenced by
> site-specific environmental, topographical, and operational conditions. The
> results presented use nominal environmental and operational conditions and can be
> used to identify the general scale of possible hazards…"

and

> "Dispersion is significantly influenced by environmental conditions and potential
> ignition sources, and the information presented should again be used for
> **identifying the scale of hazards, not necessarily be used for defining hazard
> distances for a specific site**."

**Keep this conceptual, per the module boundary.** The teachable content is:
dispersion distances are large, they scale strongly with release size, and they
are dominated by site-specific terrain and weather. No dispersion modelling
recipe belongs in this course, and Sandia explicitly warns against using their
numbers as one.

Companion source for the fire side, cited for completeness: Blanchat, T. K.,
*The Phoenix series large scale LNG pool fire experiments*, **SAND2010-8676**,
Sandia National Laboratories, 2010 — two LNG pool fires of **21 m and 81 m
diameter** on a purpose-built 120 m pond, measuring flame height, smoke
production and burn rate. **[A]** (publisher record read):
https://www.sandia.gov/research/publications/details/the-phoenix-series-large-scale-lng-pool-fire-experiments-2010-12-01/

### 4.4 NFPA 59A **[B]**

NFPA 59A, *Standard for the Production, Storage, and Handling of Liquefied
Natural Gas (LNG)* — **2026 edition** current, prior edition 2023, per
`_verify-standards.md` §, which notes the 2026 changes include **expanded
electrical area classification**. https://www.nfpa.org/product/nfpa-59a-standard-for-the-production-storage-and-handling-of-liquefied-natural-gas-lng/p0059acode

What secondary sources report about its structure, none of it read from the
standard itself — all **[B]**:

- It requires a **vapour dispersion exclusion zone** determined by consequence
  modelling, alongside a thermal radiation exclusion zone judged against a
  **5 kW/m²** criterion.
- It offers **two compliance routes**: prescriptive spacing tables, or a
  performance-based documented risk analysis using approved consequence models.
- **Impoundment** is a core concept: spill containment sized and graded so that
  a design spill is confined, with drainage such that impounded liquid does not
  pool where it is not intended.
- It requires that "provisions shall be made to minimize the possibility of the
  damaging effects of fire or a flammable cloud of vapors from a design spill
  reaching beyond a property line."

In the US the regulatory hook is **49 CFR Part 193**, *Liquefied Natural Gas
Facilities: Federal Safety Standards* (PHMSA), which incorporates NFPA 59A by
reference: https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-D/part-193 **[B]**

**Applicability caveat.** NFPA 59A governs LNG production, storage and handling
facilities. A rocket test stand is not one, and 49 CFR 193 does not reach it.
59A is cited here as the **best-developed body of design thinking about cryogenic
methane**, and as the place an AHJ will look for precedent — not as a code that
automatically applies. Say that explicitly in the course.

---

## 5. Detection and monitoring

### 5.1 Sensing principles **[B]**

Read from manufacturer application literature (Delphian, *About Combustible
Hydrocarbon Gas Monitoring*, https://delphian.com/chc.htm) — a vendor source, so
**[B]**, and the course should cross-check against an ISA or API document.

| Principle | How it works | Strengths | Limits |
|---|---|---|---|
| **Catalytic bead (pellistor)** | Burns gas on a heated catalytic bead; the temperature rise changes bead resistance | Works in dust and heat; small; responds to hydrogen as well as hydrocarbons | **Requires oxygen to function** — reads low or zero in an inert or fuel-rich atmosphere. Subject to **poisoning** (silicones, sulphur, halogens) and to **high-concentration saturation**, where a very rich mixture can read *low*. |
| **Point infrared** | Absorption at a methane band across a fixed short path | **Immune to poisoning**; continuous self-check reduces calibration burden; works with no oxygen present | Sensitive to optical contamination — dirt, ice, condensation on windows. Does not see hydrogen (no IR-active bond). |
| **Open-path infrared** | Same absorption, over a long path between transmitter and receiver | Covers a **line** rather than a point — good for perimeters and around large equipment | Reports path-integrated concentration (LEL·metres), not a point value; alignment and obscuration are failure modes. |

**The design point that matters most.** The catalytic bead's oxygen dependence
and the point-IR's oxygen independence are not a footnote in a methalox facility.
Inside a nitrogen-purged enclosure, or inside a fuel-rich pocket, **a catalytic
bead can under-report or read zero in exactly the atmosphere you most need to
measure**. That drives technology selection by location, not by site-wide
standardisation.

### 5.2 Alarm setpoints **[B]**

The convention reported by manufacturer literature:

> "Typical alarm settings are: **Low alarm = 20 % LEL, High alarm = 40 % LEL,
> High-High alarm = 60 % LEL**" — with the vendor's own caveat that "only users
> can determine appropriateness for their applications."

Other reputable secondary sources report common practice as **10–20 % LEL** low
and **20–40 % LEL** high, set by site risk assessment. **[B]**

**Why a fraction of LEL, and why staged.** Three reasons the course should give:

1. **The alarm is not a measure of danger, it is a measure of margin.** Alarming
   at 20 % LEL means acting when the atmosphere is one fifth of the way to
   ignitable — with the remaining 80 % as the margin that absorbs sensor error,
   sampling delay, and the fact that concentration at the sensor is not
   concentration at the leak.
2. **Point measurement badly understates a stratified cloud.** A dense-gas methane
   cloud (§4) is not well mixed. 20 % LEL at a sensor 2 m away can coexist with
   100 % LEL at the source.
3. **Staging separates warning from action.** A low alarm is an investigate-and-
   assess signal; a high alarm is an evacuate/isolate/shutdown signal. Collapsing
   them into one setpoint forces either nuisance shutdowns or a late response.

### 5.3 Placement logic — the part that differs from hydrogen and from oxygen

This is where the module's distinctive content lives. Derived from §4 plus
manufacturer guidance that gas density must be known before siting a detector
("Some combustible gases are lighter than air, some are heavier. Be sure the
characteristics of the gas are known") **[B]**:

- **Methane detectors must cover both regimes.** *High* placement catches warm,
  buoyant methane — the steady-state leak, the vent, the small ambient-temperature
  release. *Low* placement catches cold, dense methane — the cryogenic spill, the
  flash from a liquid release, the cloud in the transition band. A facility that
  installs only high-level detectors has imported hydrogen practice into a methane
  facility and will miss the worst case.
- **Low points get detectors because that is where the cloud goes.** Trenches,
  pits, sumps, below-grade enclosures.
- **Detectors go where the gas will *be*, not where it will be *emitted*.**
  Prevailing wind, natural draught, confinement geometry and grade all govern.
- **Oxygen-deficiency monitors follow a different logic entirely.** They protect
  **people**, so they belong at **breathing height in occupied spaces**, and in
  any space where an inert or cryogenic inventory could displace air — with the
  extra caution that cold nitrogen or cold methane is *also* dense, so an ODH
  monitor at head height can read normal while a lethal atmosphere sits at floor
  level. Threshold: OSHA defines an oxygen-deficient atmosphere as **below
  19.5 % by volume**. **[B]**
  Reference used: SLAC ES&H Manual Chapter 36, *Cryogenic and Oxygen Deficiency
  Hazard Safety*,
  https://www-group.slac.stanford.edu/esh/eshmanual/pdfs/ESHch36.pdf — reports
  19.5 % as the safe-breathing threshold, 16–12 % causing impaired judgment and
  coordination, and below 12 % risking loss of consciousness and death. A second
  usable engineering reference is the ESS *Guideline for Oxygen Deficiency Hazard*,
  https://uspas.fnal.gov/materials/19NewMexico/Cryo/ESS-0038692.pdf **[B]**
- **Three distinct detection populations.** A methalox facility needs
  **combustible gas** detection (methane), **oxygen deficiency** monitoring
  (nitrogen/helium displacement), and **oxygen enrichment** monitoring (LOX
  release). They have different sensors, different setpoints, different
  placements, and different responses. Conflating them is a design finding.

### 5.4 Calibration concepts **[B]**

- **Sensors are calibrated against a reference gas** — commonly methane or
  pentane for catalytic beads — and read other gases through a **cross-sensitivity
  factor**. Where the calibration gas and the target gas differ, setpoints should
  be set conservatively.
- Vendor guidance is explicit that "it is not always desirable or necessary to
  calibrate with the specific gas which is most likely to be present."
- Distinguish **bump test** (challenge with gas, confirm the sensor responds and
  the alarm actuates) from **calibration** (adjust the reading to a known
  concentration). A bump test proves the loop is alive; only calibration proves
  the number.
- **Catalytic beads drift and can be poisoned silently.** A poisoned pellistor
  fails *low* — it reports safe. That failure direction is why periodic bump
  testing exists at all, and why point-IR's continuous self-monitoring is a real
  advantage rather than a marketing claim.

### 5.5 Odorisation — an LNG/utility practice that does not transfer **[C]**

Distributed natural gas is odorised (mercaptan) so leaks are detectable by smell.
Rocket-grade methane, and LNG at the production/storage end, generally are not —
and a sulphur odorant is in any case unwelcome in a system with oxygen-cleaned
components. **I did not verify this against a standard.** It is flagged because
a student coming from a utility background will assume smell is a detection
layer, and in this facility it is not. Chase the actual requirement before
teaching it.

---

## 6. Hazardous area classification

### 6.1 The document set and current editions

Carried from `_verify-standards.md` in this directory, which holds the evidence:

| Document | Title | Edition | Conf. |
|---|---|---|---|
| **NFPA 70 (NEC)**, Arts. 500–506 | National Electrical Code | **2026**, issued by NFPA Standards Council 20 Aug 2025, effective 9 Sep 2025 | **A** |
| **NFPA 497** | Recommended Practice for the Classification of Flammable Liquids, Gases, or Vapors and of Hazardous (Classified) Locations for Electrical Installations in Chemical Process Areas | **2024**, ANSI-approved 13 May 2023 | **A** |
| **NFPA 55** | Compressed Gases and Cryogenic Fluids Code | **2026**, prior edition 2023 | **B** |
| **NFPA 59A** | Production, Storage, and Handling of LNG | **2026**, prior edition 2023 | **B** |

Note `_verify-standards.md` records a live ambiguity: **NFPA markets NFPA 497
under two different titles**, and its own product page uses a shorter one than
the ISBN record. Use the full ANSI title in a bibliography.

### 6.2 The structure **[B]**

- **NFPA 70 Article 500** is the foundation: the **Class I / Division 1 / Division 2**
  system for locations where flammable gas or vapour may be present.
- **NFPA 70 Article 505** is the **Zone** system (Zone 0 / 1 / 2), offered as an
  alternative to Division for Class I, and aligned with the IEC scheme.
- **NFPA 497** is the **recommended practice** — advisory, not enforceable on its
  own — that engineers use to actually draw the boundary and to look up gas
  group and autoignition temperature. The NEC relies on its property tables.
- **The enforceable path** is: OSHA makes NFPA 70 binding through **29 CFR
  1910.307**; NFPA 70 requires the area to be classified; NFPA 497 is the
  recognised method of doing it.

### 6.3 What makes an area classified **[B]**

Conceptually, three inputs:

1. **Is there a source of release?** Flanges, seals, valve stems, vents, relief
   discharges, sample points, drains, loading connections.
2. **How likely, and how long?** Division 1 / Zone 0–1 is where an ignitable
   mixture is present in normal operation or frequently; Division 2 / Zone 2 is
   where it is present only under abnormal conditions.
3. **Where does it go?** Extent is governed by release rate, ventilation, and —
   for cold methane specifically — **the dense-gas behaviour of §4**. Classified
   volumes around a cryogenic methane release source are not the same shape as
   those around a hydrogen or a warm-gas source, because the cloud goes down and
   sideways rather than up.

### 6.4 Gas group and temperature class **[B]**

- **Methane is NEC Group D.** Hydrogen is **Group B**. Grouping is by the
  ignition characteristics that govern flameproof-joint design — MESG and MIC —
  and it drives which certified equipment may be installed.
- **T-code** caps the maximum equipment surface temperature below the gas's
  autoignition temperature, T1 (450 °C) through T6 (85 °C). Because methane's AIT
  is disputed between 630 °C and 537 °C (§3.3), **use the code's own table value**;
  either way methane is a comparatively undemanding T-class, which is part of why
  Group D T1-rated equipment is cheap and everywhere.

**The practical consequence, and it is a real advantage for methane:** Group D
equipment is far more available and far less expensive than Group B. A facility
that moves from LN₂-only to methane acquires an electrical-equipment
specification problem, but a comparatively cheap one. A facility that moves to
hydrogen acquires an expensive one.

### 6.5 How classification drives instrument and electrical selection

The chain a reviewer should be able to trace, end to end:

**Release sources identified → area classified (Class/Division or Zone, Group D,
T-code) → every electrical and instrument item inside the boundary selected and
certified for that classification → wiring methods per NEC Art. 501 (or 505) →
intrinsically safe loops per Art. 504 where applicable → documented on a
classification drawing that is maintained as the plant changes.**

Failure modes a review should look for, in order of how often they actually occur:

- **The classification drawing has not been updated** after a modification.
- **A non-classified item has been installed inside a classified boundary** —
  a laptop, a phone, a camera, a portable light, a temporary heater, an
  unrated junction box.
- **Trenches and pits were not treated as classified volumes** despite being
  exactly where a dense methane cloud collects (§4.2).
- **Conduit seals omitted**, letting a classified volume communicate with an
  unclassified one through the wiring system.
- **The oxygen system was ignored in the classification exercise.** Oxygen is not
  a flammable gas and does not itself create a classified area — but oxygen
  enrichment invalidates the assumptions underneath the equipment certification
  (§8.3). This is the most commonly missed item on a methalox stand.

---

## 7. Purging and inerting

### 7.1 What a GN₂ purge is for

Four distinct purposes, which the course should separate because they have
different success criteria:

1. **Displace oxygen before introducing fuel** — so that no flammable mixture
   ever exists inside the hardware.
2. **Displace fuel before opening to air** — so that no flammable mixture exists
   when the system is broken into.
3. **Exclude atmospheric moisture and CO₂** from cold surfaces, where they freeze
   into solids that block orifices, jam valve seats and damage rotating machinery.
4. **Maintain a continuously inert blanket** in annular, interstitial and
   enclosed volumes so that a leak into them cannot find an oxidiser.

The general principle: **inert before, inert after**. The transitions in and out
of service are where the flammable window opens, and the purge exists to close it.

### 7.2 Annular and interstitial spaces

A vacuum-jacketed line or a double-walled vessel has a space between the walls.
If the inner wall leaks, that space receives fuel; if it also communicates with
air, it is a confined flammable mixture in a strong container. Continuously
purged or monitored interstitial spaces are the control. The same reasoning
applies to double-walled containment on a common-bulkhead tank — which is
precisely the configuration NASA's explosive-hazard work flags (§8.1).

### 7.3 Never cross-purge fuel and oxidiser systems

The rule is absolute, and the reasons are worth stating separately:

- **A purge manifold is a flow path.** If the same manifold serves a methane
  system and an oxygen system, then the only thing preventing methane reaching the
  LOX side — or LOX vapour reaching the methane side — is a check valve.
- **Check valves are not isolation devices.** They leak, they hang open on debris,
  they are not testable in place without breaking the joint, and they fail in the
  direction of the differential pressure that happens to exist. Treating a check
  valve as a barrier between a fuel and an oxidiser is the single most common
  design-review finding in this area.
- **Hydrocarbon into an oxygen system is a contamination event**, and oxygen
  systems are the one place where trace hydrocarbon is a fire hazard rather than a
  cleanliness nuisance (§8.4).
- **Oxygen into a fuel system** creates an internal flammable mixture in a volume
  designed on the assumption that no oxidiser is present.

The control is **physical separation** — separate purge sources, separate
manifolds, separate connections, and where systems must be cross-connected,
positive isolation (double block and bleed, or spool removal) rather than a
non-return device.

### 7.4 Oxygen compatibility of the purge supply **[A]**

The purge gas that enters an oxygen system is part of the oxygen system. It must
meet the same cleanliness standard as the hardware, because a purge line is a
direct injection path for whatever is inside it — compressor oil, hydrocarbon
residue from a shared manifold, particulate from a corroded line.

The governing standard is **CGA G-4.1, *Cleaning of Equipment for Oxygen
Service*, 7th edition, August 2018** (per `_verify-standards.md`). A free
older edition, incorporated by reference into the CFR, is readable at
https://law.resource.org/pub/us/cfr/ibr/003/cga.g-4.1.1985.pdf **[B]**

Key threshold, as reported: cleaning to G-4.1 is required for **all surfaces in
contact with a fluid whose oxygen concentration exceeds 23.5 %**, and the
contaminants of concern include "oils, greases, markings from crayons or other
markers, thread lubricants, paint, cleaning agents and their residue, weld
spatter and slag, rust and scale, metal particles, sand, dirt, lint, fiber, rags,
paper, wood, coal dust." **[B]**

Particulate matters independently of hydrocarbons, because **particle impact** is
a recognised ignition mechanism in flowing oxygen. NASA/TM-2007-213740 gives the
characteristic elements **[A]**: entrained particles, gas velocities "typically
greater than approximately 30 m/s (100 ft/s)," and an impact point between 45°
and perpendicular to the particle path. A dirty purge line supplies the first
element on demand.

### 7.5 Helium versus nitrogen — and the numbers that decide it **[A]**

**The hydrogen case is unambiguous.** Nitrogen's triple point is **63.14 K**
(NIST, §2.1). Liquid hydrogen's normal boiling point is about **20.3 K**.
Nitrogen introduced into an LH₂ system therefore **freezes solid**, and solid
nitrogen through a turbopump is a catastrophic event. Helium is the only element
that remains gaseous at liquid-hydrogen temperature, which is why LH₂ systems
purge with helium and not nitrogen. **[A]** for the property data; **[B]** for
the operational consequence, which is reported by NASA and by industrial gas
suppliers (e.g. Linde, *Inerting gases for purging spacecraft gas lines*,
https://www.linde-gas.com/industries/space/engine-testing-and-launch-gases/inerting-gases-purging).

**The methalox case is more interesting, and the brief's framing needs
sharpening.** At atmospheric pressure the ordering is comfortable:

  N₂ NBP **77.34 K**  <  LO₂ NBP **90.2 K**  <  LCH₄ NBP **111.7 K**

so gaseous nitrogen stays gaseous against both propellants, and GN₂ is generally
fine for methalox. **But that ordering only holds at 1 bar.** Nitrogen's
saturation temperature rises steeply with pressure. From the NIST nitrogen
saturation table (read directly) **[A]**:

| Nitrogen saturation temperature | Saturation pressure |
|---|---|
| 90 K (≈ LO₂ normal boiling point) | **3.60 bar** (~52 psia) |
| 102 K | 8.92 bar |
| 108 K | 13.03 bar |
| 111.7 K (≈ LCH₄ normal boiling point) | ~15.6 bar (interpolated) |
| 114 K | 18.35 bar |

https://webbook.nist.gov/cgi/cbook.cgi?ID=C7727379&Mask=4

**The design consequence, which is a genuinely non-obvious result:** a GN₂ purge
or pressurant at any pressure above about **3.6 bar (52 psia)** will **condense**
on a surface at liquid-oxygen temperature, and above about **15.6 bar** on a
surface at liquid-methane temperature. Since purge and pressurant supplies
routinely run at far higher pressures than that, "nitrogen does not freeze in a
methalox system" is true but incomplete — **nitrogen can liquefy in a methalox
system**, depositing liquid nitrogen where gas was intended, with consequences
for pressurant collapse, unexpected chilling, and slug flow.

This is also part of why **helium is the pressurant of choice for LOX tanks**
even where nitrogen would not freeze: helium stays gaseous under any condition
the system will see, and it does not introduce a condensable species into the
ullage. **[A]** for the saturation data and the inference; **[C]** for any claim
about what a specific programme actually does, which I did not verify.

The margins, stated as a table the course can use directly:

| Purge gas | vs LH₂ (20.3 K) | vs LO₂ (90.2 K) | vs LCH₄ (111.7 K) |
|---|---|---|---|
| **Nitrogen** (TP 63.14 K, NBP 77.34 K) | **Freezes solid.** Prohibited. | Gaseous at 1 bar; **condenses above ~3.6 bar** | Gaseous at 1 bar; **condenses above ~15.6 bar** |
| **Helium** (NBP 4.2 K) | Gaseous | Gaseous | Gaseous |

---

## 8. Methalox is more than the sum of its parts

This is the module's thesis section, and — unusually — NASA has published
directly on it.

### 8.1 The NESC finding: LO₂/LNG is not LO₂/LH₂ and not LO₂/RP-1 **[A, reconstructed]**

Meyer, M., Haas, J. & Eppig, B., *Investigating the Explosive Hazard of Liquid
Oxygen–Liquefied Natural Gas Rocket Propellant*, NASA (Langley Research Center /
NESC), presentation, 2023. NTRS **20230009860**, also numbered **20230003771**.
https://ntrs.nasa.gov/citations/20230009860

**Reconstruction caveat, repeated from §0:** this PDF's fonts carry no ToUnicode
map, so the text had to be recovered by solving a substitution cipher. The
plaintext is internally consistent across the whole deck and the passages below
read cleanly, but they were **reconstructed rather than copied**. Verify before
quoting in the course.

The core statements:

> "The miscibility of LO2 with LNG creates:
> — The risk of **condensed phase detonation**, resulting in **significantly
> higher overpressures than LO2/LH2 and LO2/RP-1**.
> — **Unique risks when used in launch vehicles that have common bulkhead tank
> designs, common-walled downcomers, or transfer tubes.**"

> "When intentionally mixed, small-scale, unconfined mixtures of LO2/LNG have
> shown a **broad detonable range with yields greater than that of TNT**."

> "Little data are available on LO2/LNG behavior in Launch Vehicle (LV) accident
> scenarios."

> "**We currently have only interim guidance for assessing the explosive hazard
> of this propellant.**"

The programme context, also reconstructed:

> "Coordinates testing and analysis funded by the Federal Aviation Administration
> (FAA), United States Space Force (USSF), and NASA to efficiently and quickly
> collect data sufficient to develop explosive hazard guidance and tools to assess
> the hazard with confidence."

> "Between NASA, USSF, FAA and The US Department of Energy (DOE), there are at
> least [N] different hazard and risk analysis models used to protect national
> assets, our workforce and the public. Each analysis is applied to unique
> operational scenarios, and all require experimental input data to work with new
> propellants."

Test-article descriptions in the deck describe deliberately shattering a barrier
between LO₂ and LNG — "tempered glass barrier is shattered, allowing mixing within
the confines of the two tanks," and drop tests where "glass common bulkhead and
glass downcomer shatter, and tank walls rupture" — i.e. **deliberate physical
simulation of common-bulkhead and downcomer failure**.

**Numbers deliberately omitted.** The deck contains propellant quantities, test
counts and data-point tallies. My cipher solution for the *digit* glyphs is not
reliable, so **no numeric value from this source is reproduced here**. Do not
invent them; read the PDF.

**Why this is the most important source in the file.** It is a NASA statement
that the combined hazard of LOX with methane is **qualitatively different in kind**
from the LOX/hydrogen and LOX/kerosene hazards the industry has decades of siting
experience with — because the two liquids are **miscible**, which permits an
intimate liquid-phase mixture and therefore condensed-phase detonation rather than
a vapour-cloud explosion. And it is a NASA statement that, as of 2023, **the
guidance for assessing that hazard was interim and the data were thin**.

### 8.2 Leak into a common space

Neither propellant alone produces a flammable atmosphere in an enclosure:

- Methane alone in air: flammable only between 5 % and 15 % (§3.1) — a narrow
  window a ventilation system can be designed against.
- Oxygen alone: not flammable at any concentration. It is not a fuel.

**Together, the window opens.** Methane's flammable range in oxygen is
**5.15–60.5 %** rather than 5–15 % (§3.2). Any enclosure, trench, pit or
building that can receive a release from *both* systems has a hazard neither
system creates alone, and it is roughly **four times wider** on the rich side.

The recognition criteria for a review are structural, not procedural:

- Is there any **volume** — room, trench, duct, pit, enclosure, cable chase —
  into which both a fuel release and an oxidiser release are credible?
- Is there any **shared drainage or grading** that would bring a methane pool and
  a LOX pool to the same low point? Recall from §4 that cold methane vapour
  actively seeks low points.
- Are the two systems' **relief and vent discharges** routed such that their
  plumes can meet, under any wind condition?

### 8.3 Shared vent stacks — never

A shared vent stack between a fuel system and an oxidiser system creates a
flammable mixture inside a pipe, at whatever composition the two flows happen to
produce, with no dilution and no way to inspect it. It is the one item in this
section that is a flat prohibition rather than a design trade. The same logic
extends to shared relief headers, shared burn stacks and shared knockout drums.

A subtler version worth teaching: even physically separate vents can co-mingle
**downstream in the atmosphere** if their discharge points are close, if their
exit velocities are low, or if terrain and building wake bring the plumes
together. Separation is a matter of where the plumes go, not only where the
pipes end.

Note also that oxygen enrichment silently invalidates the electrical-area
classification (§6.5). Equipment certified as suitable for a Group D methane
atmosphere was tested in **air**. Its certification says nothing about its
behaviour in an oxygen-enriched atmosphere, where ignition energies fall,
flammable ranges widen (§3.2), and materials that are non-flammable in air are
not (§8.4).

### 8.4 A LOX leak onto any hydrocarbon — the asphalt case, told honestly **[A]**

The primary source is excellent and the course should use it in full, because it
is more nuanced than the folklore.

**Moyers, C. V., Bryan, C. J. & Lockhart, B. J., *Test of LOX Compatibility for
Asphalt and Concrete Runway Materials*, NASA TM X-64086, John F. Kennedy Space
Center, December 1973.** Read directly:
https://www.uvu.edu/es/docs/liquid_oxygen/publications/lox_study-1973.pdf

**Laboratory impact tests** (per MSFC-SPEC-106B, standard LOX impact apparatus):

| Material | Energy | Drops | Reactions |
|---|---|---|---|
| New asphalt, 0.64 cm | 10 kg·m | 20 | 18 (7 faint, 3 slight, 6 appreciable, 2 violent) |
| New asphalt, 0.19 cm | 10 kg·m | 20 | 19 |
| Old asphalt, 0.64 cm | 10 kg·m | 20 | **20 (6 appreciable, 14 violent)** |
| Old asphalt, 0.19 cm | 10 kg·m | 20 | 20 |
| **Concrete**, both thicknesses | 10 kg·m | 20 + 20 | **0** |
| Old asphalt, 0.64 cm | **1 kg·m** | 3 | 3 |

The report's own summary: "Laboratory tests using standard LOX impact apparatus
yielded reactions with both old and new asphalt, but none with concrete." Old
asphalt "was found to be sensitive at impact energies even as low as 1 kg·m."
In a final laboratory test with a larger sample, "the reaction caused extensive
damage to equipment."

**Field tests** on 2-metre-square asphalt slabs flooded with LOX:

> "field experiments using 2-meter square asphalt slabs covered with LOX,
> conducted **during rainy weather, achieved no reaction with plummets**, and
> limited reaction with a blasting cap as a reaction initiator. In a final
> plummet-initiated test **on a dry slab, a violent reaction, which appeared to
> have propagated over the entire slab surface**, destroyed the plummet fixture
> and **threw fragments as far as 48 meters**."

**How to teach this without overstating or understating it.** Modern hazmat
literature has pushed back on the folklore version ("LOX-soaked asphalt explodes
if you step on it"), and the pushback is partly fair: the reaction needs a real
initiation energy, and wet conditions suppressed it entirely in NASA's own field
tests. But the same report shows a **dry** slab propagating a violent reaction
across its entire surface and throwing fragments 48 m. Both halves are true. The
accurate statement is:

> LOX in contact with asphalt or other organic material forms a mixture that is
> **impact-sensitive and capable of propagating a violent reaction** once
> initiated. Initiation requires energy, and moisture suppresses it — but the
> energies involved are within the range of ordinary mechanical events, and
> concrete does not do this while asphalt does.

The generalisation beyond asphalt: **any** hydrocarbon or organic material —
grease, oil, paint, rubber, wood, leaves, cloth, cardboard, organic debris —
soaked in LOX forms an oxidiser-fuel mixture in intimate contact. This is why
LOX areas use concrete rather than asphalt, why housekeeping and debris control
are engineering controls rather than tidiness, and why a LOX spill onto ground
that also receives methane condensate or lubricant drips is a compounded problem.

The framework for reasoning about it is NASA/TM-2007-213740's ignition-mechanism
list (§10.6), of which **mechanical impact**, **particle impact** and **friction**
are all directly applicable to a spill on a surface.

### 8.5 Fuel-rich or oxygen-rich pockets at the engine

Engine start and shutdown transients pass through mixture ratios that are
nowhere near the design point. A fuel-rich pocket at the injector face, or an
oxygen-rich pocket in the chamber or nozzle, is a normal transient feature of
every start — which is why ignition timing and propellant lead/lag are safety
items and not just performance items. Oxygen-rich conditions additionally make
the chamber and nozzle **materials** flammable in a way they are not at the
design mixture ratio (§10.6).

**Boundary note:** this section stops at hazard recognition. Start sequencing,
lead/lag selection and ignition timing are operating-procedure content and are
out of scope for this module by design.

---

## 9. The escalation ladder

What actually changes as a facility grows from LN₂-only, to LN₂ + LOX, to
LN₂ + LOX + methane. Every row is a real discontinuity, not a matter of degree.

Cited support: NFPA 55 for separation and quantity concepts **[B]**; NASA/TM-2007-213740
for the oxygen column **[A]**; §§3–8 above for the methane column.

| Dimension | LN₂ only | + LOX | + LOX & methane |
|---|---|---|---|
| **Dominant hazard** | Asphyxiation; cold burn; pressure from trapped liquid | All of that **plus fire**: LOX makes existing materials flammable that were not | All of that **plus an independent fuel inventory**, and — per NASA's own NESC finding (§8.1) — a **miscible fuel/oxidiser pair capable of condensed-phase detonation** |
| **Material compatibility & cleaning** | Ordinary cryogenic material selection; embrittlement is the concern | **Step change.** CGA G-4.1 oxygen cleaning for every wetted surface above 23.5 % O₂; hydrocarbon *and* particulate limits; documented cleanliness levels; oxygen-compatible non-metals only | Oxygen cleaning still governs the LOX side. Methane side is chemically undemanding — "compatible with nearly all materials" (§1.1) — but **cross-contamination control between the two now dominates** (§7.3) |
| **Ignition sources** | Largely irrelevant — nitrogen does not burn | Ignition *mechanisms* become the design language: particle impact, adiabatic compression, friction, mechanical impact, promoted combustion | Both the oxygen ignition-mechanism set **and** the conventional flammable-atmosphere set (static, electrical, hot surfaces) apply, **simultaneously and to the same hardware** |
| **Area classification** | **None required.** N₂ is not flammable | **Still none** from flammability — oxygen is not a flammable gas. But O₂ enrichment invalidates equipment certifications tested in air (§8.3) | **Now required.** NEC Art. 500/505 classified areas, Group D, T-coded equipment, classification drawings, conduit seals (§6) |
| **Detection** | O₂-deficiency monitors at breathing height | Add **O₂-enrichment** monitoring — a different sensor and a different alarm direction | Add **combustible-gas** detection, at **both high and low level** because of dense-gas behaviour (§4, §5.3). **Three distinct detection populations**, three setpoint philosophies |
| **Separation / quantity-distance** | Modest; driven by ODH and by relief discharge | NFPA 55 Ch. 9 bulk oxygen; separation from **combustibles and flammables** becomes the controlling dimension | Fuel–oxidiser separation now governs. Launch-site work additionally invokes **explosive siting**: DESR 6055.09 and SSCMAN 91-710, with an Explosives Safety Site Plan and Net Explosive Weight determination |
| **Relief & vent design** | Relief sized for heat leak and trapped liquid; **vents to atmosphere are benign** | Relief discharge is an **oxygen-enriching** plume — location matters; discharge must not impinge on combustibles or on personnel routes | Relief discharge is a **flammable** plume. **Fuel and oxidiser vents must never share a stack** (§8.3), and plume interaction downstream must be assessed |
| **Procedures & training** | Cryogen handling, PPE, confined space | Add oxygen-specific: cleanliness discipline, no hydrocarbons, clothing saturation hazard | Add flammable-gas discipline, hot-work control, ignition-source control, **and** the cross-contamination rules of §7.3 |
| **Emergency response** | Evacuate, ventilate, warm up | Fire is now credible; LOX-soaked material is impact-sensitive (§8.4); saturated clothing is a hazard to the wearer | Vapour-cloud and pool-fire scenarios; **detonation** is now a credible scenario per §8.1; response must handle a fire fed by an oxidiser it cannot exclude |
| **Regulatory & code triggers** | NFPA 55 Ch. 8 cryogenic fluids; OSHA 1910.101 | NFPA 55 Ch. 9; **OSHA 1910.104** bulk oxygen | Add NEC/NFPA 497 classification; NFPA 55 flammable-gas provisions; NFPA 59A as the reference body of practice; launch-site explosive siting |
| **Institutional approval** | Local EHS review | Formal oxygen compatibility assessment; hazard analysis; AHJ engagement | Full hazard analysis, explosive siting where applicable, and — per §8.1 — **assessment methods that NASA itself described in 2023 as interim** |

**The three sentences the course should land.**

1. **LN₂ → LOX is a change of kind, not degree.** Nothing burns; then everything
   does. The facility does not acquire a bigger version of its old hazard, it
   acquires a new one, and the entire materials and cleanliness discipline exists
   only from this step onward.
2. **LOX → LOX + methane adds a fuel that is separately hazardous *and*
   interacts.** The escalation is not additive. It is the co-location that
   creates the new hazard: shared spaces, shared trenches, shared manifolds,
   shared vents, and a miscible liquid pair.
3. **The assessment methods lag the hardware.** NASA's own 2023 position was that
   only interim guidance existed for the explosive hazard of LO₂/LNG. A design
   review that assumes the LOX/RP-1 or LOX/LH₂ siting precedent transfers is
   assuming something NASA does not.

**NFPA 55 structural note **[B]**.** The 2023 edition's chapter structure —
verified via the up.codes viewer, https://up.codes/viewer/nfpa/nfpa-55-2023 — is
17 chapters plus 9 annexes, with **Ch. 5 Classification of Hazards**, **Ch. 7
Compressed Gases**, **Ch. 8 Cryogenic Fluids**, **Ch. 9 Bulk Oxygen Systems**,
Ch. 10–11 hydrogen. The code contains "a methodology for the development of
separation distances," with Annex H covering separation distances for bulk
gaseous hydrogen. **I did not read the body of any chapter and no separation
distance value is reproduced here.** `_verify-standards.md` records the 2026
edition as current.

---

## 10. NASA LOX/methane experience — verified bibliography

Every entry below was confirmed against the NTRS API record: title, authors and
report number are as NASA returns them. Documents I read the body of are marked;
the rest are abstract-level.

### 10.1 Project Morpheus: Lessons Learned in Lander Technology Development **[A, full text read]**
Olansen, J. B., Munday, S. R. & Mitchell, J. D. — NASA Johnson Space Center.
AIAA SPACE 2013. Report **JSC-CN-29387**. NTRS **20140001410**.
https://ntrs.nasa.gov/citations/20140001410

The single best facility-and-operations source. Contains the Isp-321 s /
clean-burning / non-toxic / ISRU framing statement (§1.1); the
**LNG-not-methane** consumables list (§0, §2.2); the thrust termination system
description (two independent motorised valves on separate UHF radios, isolated
from the rest of the vehicle); the test-team position structure with per-position
certification; and the full flight-test log. Also documents the August 2012 free
flight in which the vehicle was lost, and the rebuild with **over 70 upgrades**
as Morpheus 1.5 Bravo — a genuine, citable lessons-learned narrative.

### 10.2 Integrated Pressure-Fed Liquid Oxygen / Methane Propulsion Systems — Morpheus Experience, MARE, and Future Applications **[A, full text read]**
Hurlbert, E., Morehead, R., Melcher, J. C. & Atwell, M. — NASA JSC.
Report **JSC-CN-35060**. NTRS **20160001041**.
https://ntrs.nasa.gov/citations/20160001041

The best statement of the propellant-selection rationale (§1.1, §1.6). Notably
frames LOX/methane's advantages for "reliable **safing or purging** of a
space-based vehicle" — i.e. the purge argument is a stated design benefit, not
an afterthought.

### 10.3 Investigating the Explosive Hazard of Liquid Oxygen–Liquefied Natural Gas Rocket Propellant **[A, decoded — see §8.1 caveat]**
Meyer, M., Haas, J. & Eppig, B. — NASA Langley Research Center. Presentation,
2023. NTRS **20230009860**; also numbered **20230003771**.
https://ntrs.nasa.gov/citations/20230009860

**The most important single source in this file.** See §8.1.

### 10.4 LOX/Methane Main Engine Igniter Tests and Modeling **[B, abstract read]**
Breisacher, K. J. & Ajmani, K. — NASA Glenn Research Center.
**NASA/TM-2008-215421**, also **E-16585** and **AIAA Paper 2008-4757**.
NTRS **20090001308**. https://ntrs.nasa.gov/citations/20090001308

Approximately **750 ignition tests** of an in-house LOX/methane spark torch
igniter in Cell 21 of the Research Combustion Laboratory at simulated vacuum,
evaluating "the effects of **methane purity**, ign[iter geometry, …]" — the
purity dependence is directly relevant to §2.2. Note this is one of the few
entries here with a real **NASA/TM** number.

### 10.5 Liquid Oxygen/Liquid Methane Test Results of the RS-18 Lunar Ascent Engine at Simulated Altitude Conditions at NASA White Sands Test Facility **[B, abstract read]**
Melcher, J. C., IV & Allred, J. K. — NASA JSC / WSTF.
Report **JSC-CN-18473**. NTRS **20090026004**.
https://ntrs.nasa.gov/citations/20090026004

Part of the Propulsion and Cryogenics Advanced Development (PCAD) project.
Altitude simulation to ~122,000 ft (~37 km) via the WSTF Large Altitude
Simulation System. The abstract carries a directly quotable safety claim:
**"'Green' propellants, such as LO2/LCH4, offer savings in both performance and
safety over equivalently sized hypergolic propulsion systems."**

### 10.6 Guide for Oxygen Compatibility Assessments on Oxygen Components and Systems **[A, full text read]**
Rosales, K. R., Shoffstall, M. S. & Stoltzfus, J. M. — NASA JSC White Sands Test
Facility. **NASA/TM-2007-213740**, March 2007.
https://ntrs.nasa.gov/api/citations/20070016582/downloads/20070016582.pdf

Not a methane document, but the framework the LOX half of a methalox facility is
assessed with, and already the backbone of `_verify-oxygen.md`. Recorded here
because §8 depends on it. Its five-step process is: determine the worst-case
operating environment; assess material flammability; **evaluate the presence and
probability of ignition mechanisms**; determine the **kindling chain**; analyse
the reaction effect.

The ignition-mechanism list (Table 1) **[A]**: particle impact, heat of
compression, flow friction, mechanical impact, friction, fresh metal exposure,
static discharge, electrical arc, chemical reaction, thermal runaway, resonance,
rapid pressurization, explosive charges, personnel smoking and open flames,
fragments from bursting vessels, welding, galling and friction, engine exhaust,
lightning.

Kindling chain, in the report's own words **[A]**:

> "Kindling chain begins when a material is ignited, and the material's heat of
> combustion is sufficient to heat and ignite the surrounding materials leading
> to a burn-through of the component."

And the governing generalisation **[A]**: "nearly all polymer materials are
flammable in 100 percent oxygen at atmospheric pressure," and "absolute
flammability thresholds are difficult to establish without testing the actual
use configuration."

### 10.7 Vehicle-Level Oxygen/Methane Propulsion System Hotfire Testing at Thermal Vacuum Conditions **[B, abstract read]**
Morehead, R. L., Melcher, J. C., Atwell, M. J., Hurlbert, E. A., Desai, P. &
Werlink, R. — NASA JSC. Report **JSC-CN-40102**. NTRS **20170006927**.
https://ntrs.nasa.gov/citations/20170006927

Integrated LOX/methane propulsion system hot-fired in the NASA Glenn Plum Brook
Station In-Space Propulsion Thermal Vacuum Chamber (formerly B2) — described in
the abstract as "a first" for an integrated LOX/methane system at high altitude
and thermal vacuum.

### 10.8 Project Morpheus Main Engine Development and Preliminary Flight Testing **[B, abstract read]**
Morehead, R. L. — NASA JSC. Report **JSC-CN-24268**. NTRS **20110014012**.
https://ntrs.nasa.gov/citations/20110014012
Notes "unique items such as variable acoustic damping and variable film cooling."

### 10.9 Combustion Instability in the Project Morpheus Liquid Oxygen/Liquid Methane Main Engine **[C, metadata only]**
Melcher, J. C., Morehead, R. L., Radke, C. & Hurlbert, E. A. — NASA JSC.
Presentation. Report **JSC-CN-28748**. NTRS **20130013690**.
https://ntrs.nasa.gov/citations/20130013690
**NTRS records "No abstract available."** Title and authors confirmed; content
not verified.

### 10.10 Liquid Methane/Liquid Oxygen Propellant Conditioning Feed System (PCFS) Test Rigs **[B, abstract read]**
Skaff, A., Grasl, S., Nguyen, C., Hockenberry, S. & Schubert, J. — NASA Glenn.
Report **E-16872**. NTRS **20090004695**.
https://ntrs.nasa.gov/citations/20090004695
PCAD-project rigs for conditioning propellants across a broad temperature range —
the two-phase-flow reference for §2.4.

### 10.11 Liquid Oxygen/Liquid Methane Integrated Power and Propulsion **[B, abstract read]**
Banker, B. & Ryan, A. — NASA JSC. Report **JSC-CN-35628**. NTRS **20160003080**.
https://ntrs.nasa.gov/citations/20160003080
LOX/methane propulsion brassboard integrated with a **Solid Oxide Fuel Cell** —
the source for the "oxygen-methane economy" framing in §1.5.

### 10.12 ISRU Propellant Selection for Space Exploration Vehicles **[A, full text read]**
Chen, T. T. — NASA Marshall Space Flight Center. Report **M13-2789**.
NTRS **20140002709**. https://ntrs.nasa.gov/citations/20140002709
Source of the density/temperature table in §1.2 and the coking criterion in §1.3.

---

## 11. What is unresolved

Listed so the course does not silently inherit these gaps.

1. **NFPA document bodies were never read.** Every statement about what NFPA 55,
   59A, 497 or 70 *requires* is secondary. Editions come from
   `_verify-standards.md`. Before any of this is assessed, someone with NFPA
   access must check the actual clauses — particularly the NFPA 55 separation
   distance methodology, which §9 references but does not quote.
2. **Methane's autoignition temperature is genuinely contested** (630 °C from
   Bulletin 680, read directly; 537 °C attributed to NFPA 497, unread). §3.3.
3. **Minimum ignition energies are secondary-sourced only.** §3.4.
4. **No primary source for a methane-freezing incident** in a methalox heat
   exchanger or common bulkhead. The property collision is certain; the observed
   failure is not documented here. §2.5.
5. **No NASA primary source found for a methane-versus-RP-1 coking comparison.**
   NTRS 20050158764 is the lead to chase. §1.3.
6. **The NESC LOX/LNG deck was decoded, not copied**, and all its numeric values
   are deliberately omitted. Someone must open that PDF. §8.1.
7. **Common-bulkhead thermal-compatibility claim is [B]** — widely repeated,
   no NASA primary found. §1.7.
8. **Odorisation practice for rocket-grade methane is [C]** — unverified. §5.5.
9. **Two sources could not be fetched at all** (HTTP 403 to automated requests)
   and are recorded as leads only: *Explosive Equivalence of Hydrocarbon
   Propellants*, DTIC AD1104981; and SSCMAN 91-710 Vol. 7 at
   static.e-publishing.af.mil. The launch-site explosive-siting row in §9 rests
   on secondary reporting of DESR 6055.09 and SSCMAN 91-710 and should be
   upgraded before use.
10. **Rollover's applicability to a single-component methane run tank is
    argued, not sourced.** The IChemE primary reference is identified but unread. §2.3.
