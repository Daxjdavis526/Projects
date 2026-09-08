# Oxygen-system safety — source verification for Module 6

Working file. This is a **source-verification memo**, not course prose: every
claim below carries a citation, and anything I could not confirm is marked as
such rather than smoothed over. Module 6 text should be written *from* this
file, not before it.

Scope note: this is hazard-recognition and design-review material. It covers
why oxygen systems fail, what engineering controls exist, and what a reviewer
looks for. It deliberately contains no build or operating procedures.

Compiled 2026-09-08. Editions verified as of that date; standards move, so
re-check anything before it goes into a graded assessment.

---

## 0. How to read this file

**Confidence labels**

| Label | Meaning |
|---|---|
| **A** | Primary source. Read the actual document (or the publisher's own catalogue record for a bibliographic fact) and quoted or paraphrased it directly. |
| **B** | Secondary but reputable — a technical body, national lab, or peer-reviewed paper reporting the fact, where I did not read the underlying primary document. |
| **C** | Unconfirmed. Plausible, commonly repeated, but I could not verify it against a source I trust. Do not put a C claim in the course without chasing it down. |

**Four corrections to the task brief.** Each is verified; each matters.

1. **NASA/TM-2007-213740 is by Rosales, Shoffstall and Stoltzfus — not
   "Stoltzfus, Beeson et al."** Harold Beeson is an *editor of ASTM MNL36*, a
   different document. Getting this wrong in a course bibliography is the kind
   of error a reviewer notices. **[A]**
2. **ASTM G74 and G86 are the other way round in the brief.** G74 is *gaseous
   fluid impact* — that is, pneumatic impact / adiabatic compression. G86 is
   *mechanical impact* in LOX and pressurised LOX/GOX. **[A]**
3. **ASTM G128's title is "Control of Hazards and Risks in Oxygen Enriched
   Systems"**, not "oxygen enrichment". **[A]**
4. **ASTM D2512 (the classic ambient-pressure LOX mechanical impact test) was
   withdrawn in 2023.** Older NASA and ASTM literature — including the sources
   cited here — leans on it heavily. Any course discussion of it must be framed
   historically. **[A]**

---

## 1. Document inventory — verified bibliographic data

### 1.1 The backbone document

**NASA/TM-2007-213740, *Guide for Oxygen Compatibility Assessments on Oxygen
Components and Systems*** **[A]**

| Field | Verified value |
|---|---|
| Authors | Keisa R. Rosales; Michael S. Shoffstall; Joel M. Stoltzfus |
| Affiliation | NASA Lyndon B. Johnson Space Center, White Sands Test Facility, Las Cruces, New Mexico. Rosales and Shoffstall are listed under "NASA Test and Evaluation Contract" |
| Date | March 2007 |
| Report numbers | NASA/TM-2007-213740; also **S-998** |
| NTRS ID | 20070016582 |
| Working PDF | https://ntrs.nasa.gov/api/citations/20070016582/downloads/20070016582.pdf |
| Landing page | https://ntrs.nasa.gov/citations/20070016582 |

Verified two independent ways: the PDF title page, and the NTRS citation API
record at `https://ntrs.nasa.gov/api/citations/20070016582`. Both agree on all
three authors, the March 2007 date, and both report numbers.

Two facts worth carrying into the course:

- It **supersedes NASA TM-104823, *Guide for Oxygen Hazards Analyses on
  Components and Systems* (1996)** — stated in its own §1.0. If a student finds
  the 1996 document, it is obsolete. **[A]**
- It states its own authority basis: *"An oxygen compatibility assessment as
  required by NASA-STD-6001 and NASA-STD-6016 shall be performed on each
  component per the procedure described in Section 4 of this document."* (§2.0)
  **[A]**

A mirror copy circulates at `airanalysis.com`; prefer the NTRS link, which is
the authoritative host.

### 1.2 ASTM MNL36 **[A]**

| Field | Verified value |
|---|---|
| Title | *Safe Use of Oxygen and Oxygen Systems: Handbook for Design, Operation, and Maintenance* |
| Current edition | **2nd Edition, 2007** |
| Editors | Harold D. Beeson; Sarah R. Smith; Walter F. Stewart |
| Stock no. | MNL36-2ND (e-book MNL36-2ND-EB) |
| ISBN | 978-0-8031-4470-5 (print); 978-0-8031-6231-0 (e-book) |
| DOI | 10.1520/MNL36-2ND-EB |
| Pages | 137 |
| URL | https://store.astm.org/mnl36-2nd-eb.html |

**Trap for the unwary:** NASA/TM-2007-213740 repeatedly cites *"ASTM Manual 36
(2000)"* — the **1st** edition. The 2nd edition (2007) is contemporaneous with
the TM, so the TM's data pointers are to the older book. Cite the 2nd edition
as current, but do not "correct" the TM's internal references. **[A]**

I found no evidence of a 3rd edition. **[B]** — absence of evidence only.

### 1.3 ASTM G-series — current editions **[A]**

All verified from ASTM's own store listing of Oxygen Enriched Atmospheres
Standards (https://store.astm.org/products-services/standards-and-publications/standards/oxygen-enriched-atmospheres-standards.html),
with individual product pages cross-checked for the ones the brief named.

| Designation | Title | DOI | Note |
|---|---|---|---|
| **G88-21** | Standard Guide for **Designing Systems for Oxygen Service** | 10.1520/G0088-21 | Active since 3 Nov 2021. Supersedes G88-13e1, -13, -05, -90(1997)e1 |
| **G93/G93M-25** | Standard Guide for **Cleanliness Levels and Cleaning Methods** for Materials and Equipment Used in Oxygen-Enriched Environments | — | 2025. **Retitled from "Standard Practice" to "Standard Guide"** — supersedes G93/G93M-19 |
| **G63-15(2023)** | Standard Guide for **Evaluating Nonmetallic Materials** for Oxygen Service | 10.1520/G0063-15R23 | Reapproved 2023 |
| **G94-22** | Standard Guide for **Evaluating Metals** for Oxygen Service | 10.1520/G0094-22 | Active 1 July 2022 |
| **G72/G72M-24** | Standard Test Method for **Autogenous Ignition Temperature** of Liquids and Solids in a High-Pressure Oxygen-Enriched Environment | 10.1520/G0072_G0072M-24 | Active 9 Feb 2024 |
| **G74-13(2021)** | Standard Test Method for Ignition Sensitivity of Nonmetallic Materials and Components by **Gaseous Fluid Impact** | 10.1520/G0074-13R21 | *This is the pneumatic-impact / adiabatic-compression test* |
| **G86-17(2025)** | Standard Test Method for Determining Ignition Sensitivity of Materials to **Mechanical Impact** in Ambient Liquid Oxygen and Pressurized Liquid and Gaseous Oxygen Environments | 10.1520/G0086-17R25 | Reapproved 2025 |
| **G128/G128M-15(2023)** | Standard Guide for **Control of Hazards and Risks in Oxygen Enriched Systems** | 10.1520/G0128_G0128M-15R23 | Reapproved 2023 |

Adjacent standards the course will want, same source, same confidence **[A]**:

| Designation | Title | Why it matters here |
|---|---|---|
| **G124-18** | Standard Test Method for Determining the **Combustion Behavior of Metallic Materials** in Oxygen-Enriched Atmospheres | The promoted-ignition test. This is where metal flammability numbers come from |
| **G145-08(2023)** | Standard Guide for **Studying Fire Incidents** in Oxygen Systems | DOI 10.1520/G0145-08R23. Directly supports the incidents module |
| **G175-24** | Standard Test Method for Evaluating the Ignition Sensitivity and Fault Tolerance of **Oxygen Pressure Regulators** Used for Medical and Emergency Applications | The standard that came out of the regulator-fire investigations (§7.4) |
| **G127-15(2023)** | Standard Guide for the Selection of **Cleaning Agents** for Oxygen-Enriched Systems | Companion to G93 |
| **G126-16(2023)** | Standard **Terminology** Relating to Compatibility and Sensitivity of Materials in Oxygen Enriched Atmospheres | Settles vocabulary disputes |
| **G114-21** | Standard Practices for Evaluating the **Age Resistance** of Polymeric Materials Used in Oxygen Service | Ageing of soft goods |

**Withdrawn — flag these** **[A]**:

- **D2512-17**, *Compatibility of Materials with Liquid Oxygen (Impact
  Sensitivity Threshold and Pass-Fail Techniques)* — **withdrawn 2023**. This
  is the historic LOX impact test referenced throughout the older literature.
- **PS127-00**, provisional standard for medical/emergency oxygen regulators —
  **withdrawn 2003**, superseded in function by G175.

### 1.4 NASA-STD-6001 **[A]**

| Field | Verified value |
|---|---|
| Title | *Flammability, Offgassing, and Compatibility Requirements and Test Procedures* |
| Current revision | **Revision B with Change 3** |
| Status | ACTIVE |
| Base document date | 26 August 2011 |
| Change 3 date | 9 June 2025 (the Change-3 PDF filename carries 2025-06-25) |
| Landing page | https://standards.nasa.gov/standard/NASA/NASA-STD-6001 |
| Change 3 PDF | https://standards.nasa.gov/sites/default/files/standards/NASA/B-w/CHANGE-3/3/2025_06_25_NASA-STD-6001B_w_Change_3_FINAL_Admin-Change-FINAL.pdf |

Lineage: supersedes 6001B w/Change 2, w/Change 1, 6001B, NASA-STD-(I)-6001A,
and before that NHB 8060.1, *Flammability, Odor, Offgassing, and Compatibility
Requirements and Test Procedures for Materials in Environments that Support
Combustion*.

The two dates (9 June vs 25 June 2025) differ between the landing page and the
PDF filename; treat "Revision B w/Change 3, June 2025" as the safe citation.
**[A]** for the revision, **[B]** for which June day is definitive.

### 1.5 CGA G-4 series **[B]**

From CGA's own publication catalogue (`legacy.cganet.com`):

| Pub | Title | Edition | Date |
|---|---|---|---|
| **CGA G-4** | *Oxygen* | 11th | March 2015, reaffirmed May 2020 |
| **CGA G-4.1** | *Cleaning of Equipment for Oxygen Service* | 7th | August 2018 |
| **CGA G-4.4** | *Oxygen Pipeline and Piping Systems* | 6th | August 2020 |

Labelled **B**, not A, for one reason: these come from CGA's *legacy* catalogue
site. The bibliographic facts are the publisher's own, but the legacy site may
lag a current edition. I searched specifically for an 8th edition of G-4.1 and
found none. Before publishing Module 6, confirm against the live CGA catalogue.

Note the title drift worth getting right: G-4.1 is *"Cleaning **of** Equipment
for Oxygen Service"* in CGA's own listing, though it is very widely cited
(including by ANSI resellers and by the LANL guide) as *"Cleaning Equipment for
Oxygen Service"*. **[B]**

Related and useful: **CGA G-4.3**, *Commodity Specification for Oxygen* —
this is where oxygen purity/quality grades live. **[B]**

European counterparts, freely downloadable and genuinely useful because they
are not paywalled **[A]**:

- **EIGA Doc 04/26**, *Fire Hazards of Oxygen and Oxygen-Enriched Atmospheres*,
  published **June 2026**, revision of Doc 04/18 —
  https://www.eiga.eu/uploads/documents/DOC004.pdf
  EIGA explicitly grants permission to reproduce provided EIGA is acknowledged
  as the source, which makes it unusually easy to quote in courseware.
- **EIGA Doc 13/20**, *Oxygen Pipeline and Piping Systems* —
  https://www.eiga.eu/uploads/documents/DOC013.pdf **[B]** (URL resolves; I did
  not read it in full)

### 1.6 NFPA 55 **[B]**

- *NFPA 55, Compressed Gases and Cryogenic Fluids Code* — **2026 edition**,
  publisher NFPA, listed publication date 31 January 2026.
- Previous edition: **2023**.
- Product page: https://www.nfpa.org/product/nfpa-55-code/p0055code

**Why only B:** NFPA's own product and LiNK pages are JavaScript-driven and did
not yield a machine-readable edition statement. The 2026 edition is confirmed
via the publisher-attributed catalogue listing, and the 2023 edition via ANSI's
webstore. A search result also asserted an issue date of 20 August 2026 and an
effective date of 9 September 2026 — **I could not verify those dates against
NFPA and they should be treated as C. Do not print them.**

Definition worth quoting once verified: a *bulk oxygen system* is an assembly
with storage capacity **greater than 20,000 scf (566 Nm³)** of oxygen,
terminating at the source valve. **[B]** — reported for the 2023 edition;
confirm against the 2026 text before use.

---

## 2. Why oxygen changes everything

### 2.1 The framing statement

The cleanest authoritative framing is EIGA's, and it is quotable **[A]**:

> "Materials that do not burn in air, including fire-resistant materials, can
> burn vigorously in oxygen-enriched air or pure oxygen."
> — EIGA Doc 04/26 §5.3.1

> "In principle, all organic materials can burn in oxygen and so do most metals
> and metal alloys. Pressure affects the behaviour of materials, for example, by
> reducing ignition temperatures and increasing combustion rates."
> — EIGA Doc 04/26 §5.3.2

EIGA §5.2 states the three effects of raising oxygen concentration and pressure
in list form **[A]**:

- "combustion reaction or fire can be more vigorous";
- "ignition temperature and the ignition energy to promote the combustion
  reaction is much lower"; and
- "temperature of the flame is higher and consequently the destructive
  capability of the flame is greater."

NASA's version, from the backbone document **[A]**:

> "Oxygen pressure and concentration have significant effects on the
> flammability and ignitability of materials. In general, materials are easier
> to ignite and burn more readily as oxygen pressure or concentration increase.
> Hence, oxygen systems should be operated at the lowest possible pressure and
> oxygen concentration."
> — NASA/TM-2007-213740 §3.1

> "With few exceptions, materials become more flammable in oxygen as pressures
> increase. This includes metals, plastics, elastomers, lubricants, and
> contaminants. In fact, **nearly all polymer materials are flammable in 100
> percent oxygen at atmospheric pressure.**"
> — NASA/TM-2007-213740 §4.2 (emphasis added)

That last sentence is the single most useful line in the whole document for a
propulsion course. At one atmosphere — no pressure exotica at all — the polymer
half of your bill of materials is already flammable.

### 2.2 Quantitative data — what I actually found

The honest headline: **I could not find an authoritative, citable table giving
minimum ignition energy in air versus pure oxygen for common fuels.** The
numbers that circulate (hydrogen MIE ~0.017–0.02 mJ in air, hydrocarbons
~0.1–0.3 mJ in air) are for **air**, and the oxygen-enriched equivalents I found
were either behind paywalls or in sources I would not cite. **Treat any
air-versus-oxygen MIE ratio as C until someone reads MNL36 or a combustion text
directly.** The qualitative direction — MIE falls sharply with enrichment — is
solid **[A]** via EIGA §5.2; the multiplier is not.

What I *did* find, and can cite:

#### Burning rate versus oxygen concentration — nonmetals **[A]**

NASA MSFC data, tested per ISO 14624-1, specimens 12 in (305 mm) × 2.5 in
(64 mm). Reproduced in Davis (2012), Table 1. Burn rate in inches/second
(mm/s):

| Material | O₂ conc. | Burn length | Burn rate |
|---|---|---|---|
| Polyester-based foam | 23% | 1.3 in (33 mm) | 0.07 in/s (1.8 mm/s) |
| Polyester-based foam | **25%** | 12 in (305 mm) — full | **0.67 in/s (17.0 mm/s)** |
| Polyurethane + epoxy | 21% | 1 in (25.4 mm) | 0.05 in/s (1.3 mm/s) |
| Polyurethane + epoxy | **26%** | 12 in (305 mm) — full | **0.33 in/s (8.4 mm/s)** |
| Polyurethane foam | 21% | 1 in (25.4 mm) | 0.05 in/s (1.3 mm/s) |
| Polyurethane foam | **23%** | 9 in (228 mm) | **0.27 in/s (6.9 mm/s)** |
| Polyisocyanurate foam | 21% | 2 in (50.8 mm) | 0.07 in/s (1.8 mm/s) |
| Polyisocyanurate foam | **30%** | 12 in (305 mm) — full | 0.13 in/s (3.3 mm/s) |
| Silicone RTV | 21% | 0.5 in (12.7 mm) | 0.01 in/s (0.3 mm/s) |
| Silicone RTV | 30% | 12 in (305 mm) — full | 0.02 in/s (0.5 mm/s) |

The teaching point is the polyester foam row: **going from 23% to 25% oxygen —
two percentage points — takes a self-extinguishing material to fully consumed,
and multiplies burn rate by roughly ten.** That is the number that makes
students take enrichment seriously. Davis flags the data as "for oxygen
concentration effect comparison only, not to be considered standard values."

EIGA Doc 04/26 Figure 2 makes the same point for fire-exposed cotton, plotting
rate of burning against oxygen percentage. **[A]** that the figure exists and
what its axes are: burning rate 2–16 cm/s against 30–50% oxygen in atmosphere.
**[C]** for any specific data point — the plotted curve did not survive text
extraction and I did not read values off it. If the course wants a cotton
figure, reproduce EIGA's directly under their reproduction permission rather
than transcribing numbers.

#### Burning rate versus pressure — metals **[A]**

NASA MSFC, per ASTM G124 and ISO 14624-4. Rods 12 in long, 0.125 in
(3.2 mm) diameter. Davis (2012), Table 2:

| Material | Pressure | Burn length | Burn rate |
|---|---|---|---|
| Bronze/aluminium mixture | 50 psi (345 kPa) | 0 in — **no burn** | 0 |
| Bronze/aluminium mixture | 100 psi (689 kPa) | 12 in (305 mm) — full | 0.3 in/s (7.6 mm/s) |
| Aluminium 4043 | 25 psi (172 kPa) | 4.4 in (111.8 mm) | 0.6 in/s (15.2 mm/s) |
| Aluminium 4043 | 50 psi (345 kPa) | 12 in — full | 1.1 in/s (27.9 mm/s) |
| 316 stainless | 500 psi (3447 kPa) | 1.7 in (43.2 mm) | 0.3 in/s (7.6 mm/s) |
| 316 stainless | 1,000 psi (6895 kPa) | 12 in — full | 0.4 in/s (10.2 mm/s) |
| 304 stainless | 500 psi (3447 kPa) | 3.8 in (96.5 mm) | 0.3 in/s (7.6 mm/s) |
| 304 stainless | 1,000 psi (6895 kPa) | 12 in — full | 0.4 in/s (10.2 mm/s) |
| 316L stainless | 250 psi (1724 kPa) | 2.6 in (66.0 mm) | 0.2 in/s (5.1 mm/s) |
| 316L stainless | 1,000 psi (6895 kPa) | 12 in — full | 0.4 in/s (10.2 mm/s) |

**Aluminium 4043 burns at 25 psi.** Not a typo, and worth a full stop in the
lecture. Note also that the 12-inch rods are being *entirely consumed* — this is
the metal itself burning, not a coating.

#### Burning rate versus temperature — metals **[A]**

Same source, Davis (2012) Table 3, ASTM G124, same rod geometry:

| Material | Pressure | Temp | Burn length | Burn rate |
|---|---|---|---|---|
| 304L stainless | 500 psi | 75 °F (297 K) | 4 in (102 mm) | 0.35 in/s (8.9 mm/s) |
| 304L stainless | 500 psi | 1,000 °F (811 K) | 12 in — full | 0.43 in/s (10.9 mm/s) |
| 15-5 PH stainless | 500 psi | 75 °F | 2.9 in (74 mm) | 0.33 in/s (8.4 mm/s) |
| 15-5 PH stainless | 500 psi | 1,000 °F | 12 in — full | 0.35 in/s (8.9 mm/s) |
| Inconel 718 | 750 psi | 75 °F (297 K) | 4.2 in (107 mm) | 0.35 in/s (8.9 mm/s) |
| Inconel 718 | 750 psi | 1,700 °F (1200 K) | 12 in — full | 0.60 in/s (15.2 mm/s) |
| 316 stainless | 500 psi | 75 °F | 5.6 in (142 mm) | 0.34 in/s (8.6 mm/s) |
| 316 stainless | 500 psi | 1,000 °F | 12 in — full | 0.37 in/s (9.4 mm/s) |

Note the pattern across all three tables: **raising the severity variable does
not change the burn rate very much, but it changes burn *length* from partial
to total.** The physics that matters is whether combustion self-sustains, not
how fast it propagates once it does. This is exactly the criterion the promoted
ignition test measures.

#### Threshold pressures — the key metals table **[A]**

Davis (2012), Table 4. Minimum pressures to ignite or burn common metals.
"Promoted ignition" column = on average, self-sustained burning is *not*
sustained below this pressure (ASTM G124). "Mechanical impact" column = on
average, no ignition occurs below this pressure (ASTM G86 / D2512).

| Material | Promoted ignition (GOX) | Mechanical impact (GOX) | Mech. impact (LOX) |
|---|---|---|---|
| Magnesium | **Below ambient** | Below ambient | Below ambient |
| Titanium | **Below ambient** | Below ambient | Below ambient |
| Aluminium 6061 | **Ambient** | Ambient | Ambient |
| Aluminium 2090 | 500 psi (3447 kPa) | — | 500 psi |
| Aluminium 2024 | 1,500 psi (10 342 kPa) | — | 1,500 psi |
| Aluminium 2219 | 1,500 psi (10 342 kPa) | — | **50 psi (345 kPa)** |
| Stainless 304L | **250 psi (1724 kPa)** | 10,000 psi (68 948 kPa) | 10,000 psi |
| Stainless 17-4 | 400 psi (2758 kPa) | 5,000 psi (34 474 kPa) | 5,000 psi |
| Stainless 316 | 400 psi (2758 kPa) | 10,000 psi | 10,000 psi |
| Inconel 718 | 500 psi (3447 kPa) | 10,000 psi | 10,000 psi |
| Stainless 420 | 750 psi (5171 kPa) | 10,000 psi | 10,000 psi |
| Haynes 214 | 1,000 psi (6895 kPa) | 10,000 psi | 10,000 psi |
| Stainless 440C | 3,000 psi (20 684 kPa) | 10,000 psi | 10,000 psi |
| **Monel K-400/K-500** | **10,000 psi (68 948 kPa)** | 10,000 psi | 10,000 psi |
| **Nickel** | **10,000 psi** | 10,000 psi | 10,000 psi |
| **Copper 12200** | **10,000 psi** | 10,000 psi | 10,000 psi |
| **Brass** | **10,000 psi** | 10,000 psi | 10,000 psi |

Davis's caveat applies: "Data for comparison purposes only, not to be
considered standard values for listed material." "I/A" in the original means
insufficient test data.

**Three things this table teaches, and they are the heart of Module 6:**

1. **304L stainless steel sustains combustion in oxygen at 250 psi.** In a
   cryogenic propulsion context that is a trivially ordinary pressure. Stainless
   is not an "oxygen-safe" material; it is a material with a threshold.
2. **The ignition test and the burning test give wildly different numbers for
   the same metal.** 304L: 250 psi to sustain burning, 10,000 psi to ignite by
   mechanical impact — a factor of forty. Davis is explicit that "the pressure
   required for a given material to exhibit self-sustained burning is much lower
   than the pressure that is required to ignite that material by means of a
   mechanical impact." Quoting a single "compatibility pressure" for a metal
   without naming the test is meaningless.
3. **The copper and nickel family is qualitatively different.** Monel, nickel,
   copper and brass all top out the test range at 10,000 psi. This is why Monel
   is the reflexive answer for severe-service oxygen components, and why the
   NASA TM's own worked example of a hazard control is *"Change valve body from
   stainless steel to Monel."* (TM Table 4) **[A]**

Also note **Aluminium 2219**: 1,500 psi threshold in GOX mechanical impact but
**50 psi in LOX**. Liquid oxygen is not simply "cold GOX" for sensitivity
purposes. **[A]**

#### Threshold pressures — nonmetals **[A]**

Davis (2012), Table 5. Mechanical impact column:

| Material | GOX | LOX |
|---|---|---|
| Butyl rubber | 40 psi (276 kPa) | **Unsafe at all pressures** |
| Nitrile rubber | < 150 psi (< 1034 kPa) | < 150 psi |
| Polyimide (Kapton etc.) | 200 psi (1379 kPa) | **Unsafe at all pressures** |
| Silicon carbide | 250 psi (1724 kPa) | 250 psi |
| PTFE | 3,500 psi (24 132 kPa) | 1,500 psi (10 342 kPa) |
| Neoprene rubber | 4,000 psi (27 579 kPa) | 4,000 psi |
| Molybdenum disulfide | 4,000 psi (27 579 kPa) | 4,000 psi |
| Acrylic sheet | 5,000 psi (34 474 kPa) | 5,000 psi |
| Fiberglass | 5,000 psi (34 474 kPa) | 5,000 psi |
| Carbon fibre / epoxy | 10,000 psi (68 948 kPa) | 5,000 psi |
| **Fluorinated lubricants (PCTFE)** | **10,000 psi (68 948 kPa)** | 8,000 psi (55 158 kPa) |
| PVC | — | Unsafe at all pressures |
| Silicone rubber sheet | — | Unsafe at all pressures |

PTFE in the *promoted ignition* test is listed as not sustaining burning only
below **< 50 psi (< 345 kPa)** — i.e. PTFE burns readily in the promoted test
even at low pressure, while resisting *ignition by impact* to 3,500 psi. Same
lesson as the metals: name the test.

#### Autogenous ignition temperature

**[B]** EIGA's practical convention: "it is usual to consider a minimum
autoignition temperature (AIT) of 300 °C (572 °F) at a minimum test pressure"
for nonmetals in oxygen systems. Reported from EIGA Doc 04; I found this in
search summary rather than locating it in the extracted text, so **B**.

**[A]** ASTM G72/G72M-24 defines how AIT is measured in oxygen: organic liquids
and solids, spontaneous ignition without spark or flame, at **2.1–20.7 MPa
(300–3000 psi)** with standard testing at **10.3 MPa (1500 psi)**, temperature
range **60–500 °C (140–932 °F)**, oxygen concentration 0.5–100%, sample mass
~0.20 ± 0.03 g, heating rate 5 °C/min. The standard itself cautions that "means
for extrapolation from this idealized situation to... field situations, are not
established" — a caveat worth repeating to students who want to treat AIT as a
design number.

I did **not** find a citable air-versus-oxygen AIT comparison table. **[C]** for
any specific "AIT drops by X °C in oxygen" claim.

#### Flame temperature

**[C].** EIGA states qualitatively that flame temperature is higher in oxygen
and the flame is consequently more destructive **[A]**, but I found no citable
quantitative table (e.g. adiabatic flame temperatures in air vs O₂ for common
fuels) in an authoritative oxygen-safety source. The physics is standard
combustion theory and any combustion textbook will supply it; if the course
wants numbers, cite a combustion text, not an oxygen-safety standard.

### 2.3 Configuration dependence — the thickness/geometry rule **[A]**

This belongs in §2 because it is *why* the tables above carry so many caveats.

> "The configuration of a system or component significantly influences the
> ignitability and flammability of the materials of construction. For instance,
> metals, including those that normally exhibit high resistance to ignition, are
> more flammable in oxygen when they have thin cross-sections (e.g. thin-walled
> tubing) or when they are finely divided (e.g. wire mesh or sintered filters)."
> — NASA/TM-2007-213740 §4.2

Davis's generalised rules **[A]**, worth reproducing verbatim as a slide:

1. Higher oxygen concentration → easier ignition, faster burning. Use the lowest
   usable concentration.
2. Higher pressure → easier ignition, faster burning. Use the lowest usable
   pressure.
3. Higher temperature → easier ignition, faster burning. Use the lowest workable
   temperature.
4. **Smaller thickness → easier ignition, faster burning. Thicker is safer.**
5. Higher oxygen flow velocity → easier ignition, faster burning in the flow
   direction. Keep velocities as low as function allows.

Rule 4 is counter-intuitive and it killed people (see the Mir SFOG fire, §7.3).
It also creates a genuine design tension that NASA/TM-2007-213740 and Davis both
flag: less material means less fuel, but thinner material means easier ignition.
Davis: "the ignition hazard of a material must be weighed against the safety of
utilizing less fuel within a system."

The corresponding formal rule from LANL's design guide **[A]**: "The thickness
of a metal or alloy shall not be less than the minimum prescribed in the table.
If the thickness is less than the prescribed minimum, the alloy shall be
considered flammable and velocity limitations appropriate for the system
pressure shall be observed. Exemption pressures should not be extrapolated
outside the given thickness range of 3.18 mm to 6.35 mm (0.125 in to 0.250 in)."

---

## 3. Ignition mechanisms — the canonical list

### 3.1 Provenance

The list below is **Table 1 of NASA/TM-2007-213740**, reproduced in full and in
the document's own order. It is not assembled from memory, and it is not the
brief's list — there are differences worth noting. **[A]**

NASA's framing, which is the pedagogically important part:

> "An ignition mechanism is simply a source of heat that under the right
> conditions can lead to ignition of the materials of construction or
> contaminants in a system. The most effective way to analyze the ignition risks
> in a system is to methodically analyze the system for known ignition
> mechanisms."
> — §4.3

> "For ignition mechanisms to be effective, certain elements must be present.
> These characteristic elements are unique for each ignition mechanism, and each
> element is necessary for an ignition to occur. **If any characteristic element
> is not present, the ignition mechanism is unlikely to occur. Conversely, if
> all the characteristic elements are present, ignition is possible.**"
> — §4.3

That is the whole method in two sentences, and it is what a design reviewer
actually does: for each mechanism, walk the characteristic elements and ask
whether the design has removed at least one.

**Table 1 as printed — 17 entries** (the brief lists 11; the differences are
real, not cosmetic):

| | | | |
|---|---|---|---|
| Particle Impact | Lightning | Rapid Pressurization | Explosive Charges |
| Flow Friction ᵃ | | Personnel Smoking and Open Flames | |
| Resonance | | Fragments from Bursting Vessels | |
| Mechanical Impact | | Welding | |
| Galling and Friction | | Engine Exhaust | |
| Fresh Metal Exposure | | Static Discharge | |
| Electrical Arc | | Chemical Reaction | |
| Thermal Runaway | | | |

ᵃ NASA's own footnote: *"Theoretical only: No current test method exists to
duplicate flow friction in the laboratory."*

**Naming differences from the brief, all [A]:**

- NASA says **"Rapid Pressurization"**, and notes it "is also known as heat of
  compression or adiabatic compression." Use NASA's term when citing NASA.
- NASA says **"Galling and Friction"**, not "friction/galling".
- NASA says **"Thermal Runaway"**, not "thermal ignition" — and its definition
  is specifically about self-heating in high-surface-area accumulations, which
  is narrower and more interesting than "things got hot".
- The last six of the 17 (lightning, explosive charges, smoking/open flames,
  fragments from bursting vessels, welding, engine exhaust) are grouped by NASA
  under **"Other"** — "any external heat sources... Many of the potential
  sources of heat are self-explanatory."

### 3.2 Ignition mechanism rating logic **[A]**

Table 2 of the TM. This is how each mechanism is scored during an assessment:

| Rating | Code | Characteristic elements | Material flammability |
|---|---|---|---|
| Not Possible | 0 | Not all present | Nonflammable |
| Remotely Possible | 1 | All present, **or** not all present | Nonflammable / Flammable |
| Possible | 2 | All present and active | Flammable |
| Probable | 3 | All present and some are strongly active | Flammable |
| Highly Probable | 4 | All present and all are strongly active | Flammable |

Critical default, and a good exam question: *"If the flammability of a material
is unknown, or the materials of construction have not been selected, then the
material should be considered flammable for the purposes of assessing the
ignition mechanisms."* Unknown means flammable. **[A]**

### 3.3 The mechanisms in detail

Format for each: NASA's definition and characteristic elements are **[A]**
verbatim or close paraphrase from TM §4.3.1. The **Controls** rows are
*derived* — assembled from the LANL design guide, Davis (2012), EIGA Doc 04/26,
and the characteristic-elements logic itself. Controls are marked with their
source; where a control follows directly from removing a characteristic element
I mark it **[derived]**. ASTM G88-21 is the authoritative design-control source
and is paywalled — **the course should buy it before Module 6 ships.**

---

#### 1. Particle Impact

**Definition [A]:** "Heat generated when small particles strike a material with
sufficient velocity to ignite the particle and/or the material."

**Characteristic elements [A]:**
- particles that can be entrained in the flowing oxygen;
- gas velocities, typically greater than approximately **30 m/s (100 ft/s)**
  (NASA cites ASTM STP 986);
- an impact point ranging from **45 degrees to perpendicular** to the particle path.

**What makes it likely [A]:** "Particle impact is a very effective ignition
mechanism for metals, but less likely to ignite nonmetals unless they are very
hard." Usually the particulate must itself be flammable — but "some highly
reactive materials, such as aluminum and titanium, can be ignited when impacted
by inert particles."

**The Space Shuttle datum [A]** — one of the most instructive footnotes in the
whole document. Tests simulating the Space Shuttle Type II Main Propulsion
System oxygen flow control valve, in Inconel 718, at 600 K and 4600 psig with
10 mg of a particle mixture (26% Inconel 718, 29% 21-6-9 stainless, 45%
aluminium 2219 by weight):
- fixture **with** a drill point downstream of the flow control orifice:
  **ignited and burned on the second test**;
- fixture with the drill points removed, giving a **45° impact angle**: **did
  not ignite or burn in 40 tests.**
- "[The Space Shuttle flow control valve was subsequently redesigned.]"

A single internal geometric feature is the difference between burning on test
two and surviving forty. This is the best argument in the course for why
cross-sectional drawings are mandatory in an oxygen compatibility assessment.

**Controls:**
- Keep velocity below ~30 m/s where practical; review any location where flow
  approaches 30 m/s (100 ft/s) for particle impact sensitivity — LANL guide,
  citing CGA G-4.4 **[A]**
- Halve the velocity limit, or use a copper-based impingement surface, wherever
  oxygen impinges directly on ferrous piping — LANL guide **[A]**
- Where flow through a valve may approach sonic velocity, copper-based materials
  are required — LANL guide **[A]**
- Filtration upstream of high-velocity elements, and cleanliness control to stop
  particles existing at all (§5) **[derived]**
- Eliminate design features that create impingement targets at unfavourable
  angles — drill points, sharp direction changes downstream of orifices **[A,
  from the Shuttle footnote]**
- Choose copper/nickel alloys at impingement points: "In general, copper and
  nickel-based alloys are resistant to ignition by particle impact" — TM **[A]**
- Eliminate rotation of seals and rotation against seats; rotating parts
  generate particles that migrate into the flow stream (ball valves are
  specifically named) — LANL guide **[A]**

**Data pointers [A]:** ASTM MNL36 and ASTM G94.

---

#### 2. Rapid Pressurization (adiabatic compression / heat of compression)

Treated in full in §4. Summary here for list completeness.

**Definition [A]:** "Heat generated when a gas is rapidly compressed from a low
pressure to a high pressure. This ignition mechanism is also known as heat of
compression or adiabatic compression."

**Characteristic elements [A]:**
- rapid pressurization, **generally occurring in less than 1 s**;
- an exposed nonmetal close to the rapidly pressurized dead-end;
- a pressure ratio causing maximum compression temperature to exceed the
  situational auto-ignition temperature of the nonmetal.

**What makes it likely [A]:** "Rapid pressurization ignition is **the most
effective igniter of nonmetals**, but does not ignite bulk metals."

---

#### 3. Flow Friction

**Definition [A]:** "Heat generated when oxygen flows across a polymer and
produces erosion, friction, and/or vibration."

**Characteristic elements [A]:**
- nonmetal exposed to flow;
- flow that produces a vibration in the nonmetal.

**Status [A]:** Theoretical. "No current test method exists to duplicate flow
friction in the laboratory." And NASA's warning, which should be quoted in the
course because it is unusual for a standards document to say this:

> "Although this ignition mechanism is poorly understood, **it has caused a
> significant number of real-life fires.**"

**What makes it worse [A]:** "Surfaces of nonmetals that are highly fibrous from
being chafed, abraded, eroded, or plastically deformed may render flow friction
heating affects more severe."

**Typical scenario [A]:** "A leak past a polymer seal may cause flow friction
ignition. This could occur when throttling flow through an oxygen cylinder valve
with a nonmetal seat that has been damaged due to extensive cycling."

**Controls [derived, from the characteristic elements]:** eliminate leak paths
across polymers; avoid designs that throttle across a soft seat; treat seal
degradation and cycle life as a fire-safety parameter rather than a maintenance
one; shield nonmetals from direct flow. A reviewer should be asking "what
happens to this seat after N cycles" — the mechanism is a *degraded-condition*
mechanism, so a review of the as-new configuration will miss it entirely.

---

#### 4. Resonance

**Definition [A]:** "Acoustic oscillations within resonant cavities that cause
rapid temperature rise."

**Characteristic elements [A]:**
- favourable system geometry: a throttling device (nozzle, orifice, regulator,
  valve) directing a **sonic gas jet into a cavity or closed-end tube**;
- acoustic resonance (often audible);
- flammable materials in the area of the resonance.

**Physics [A]:** "The distance between the throttling device and the closed end
affects the frequency of acoustic oscillations in the cavity due to the
interference of incident and reflecting sound waves. The distance also affects
the temperature produced in the cavity. **Higher harmonic frequencies have been
shown to produce higher system temperatures.** The resonant frequency has been
shown to be a function of pipe diameter and pressure ratio."

Two ignition routes [A]: flammable material near the closed end self-ignites in
the hot gas; **or** "particulate or debris can vibrate, causing collisions that
generate sufficient heat to self-ignite."

**The detail that sells it [A]:** "Resonance is also used as an igniter for solid
or liquid rocket fuel: gaseous oxygen flows through a sonic nozzle and directly
into a resonance cavity, heating the gas and solid or liquid fuel. When the gas
reaches the auto-ignition temperature of the fuel, ignition occurs and a flame
jet is emitted from the chamber." **The same geometry is a deliberate rocket
igniter and an accidental one.** For a propulsion course this is the single best
illustration that these mechanisms are not exotic — they are engine components
appearing where nobody designed them.

**Typical scenario [A]:** "A capped tee fitting downstream of a valve or orifice."

**Controls [derived]:** eliminate closed-end cavities downstream of throttling
devices; avoid capped tees and dead-end stubs in the sonic-jet path; if a cavity
is unavoidable, break the geometry that supports the standing wave. An audible
tone from an oxygen system is a symptom, not a nuisance.

---

#### 5. Mechanical Impact

**Definition [A]:** "Heat generated due to single or repeated impacts on a
material with sufficient energy to ignite it."

**Characteristic elements [A]:**
- a single, large impact or repeated impacts;
- a nonmetal or reactive metal at the point of impact.

**What makes it likely [A]:** "Most metals cannot be ignited by mechanical
impact; however, nonmetals are susceptible." Exceptions that can be ignited:
"aluminum, magnesium, titanium, and lithium-based alloys, as well as some
lead-containing solders."

**Chatter [A]:** "Some components, such as check valves, regulators and relief
valves, may become unstable and 'chatter' during use. Chattering can result in
multiple impacts in rapid succession on polymer poppets or seats within these
components, creating a mechanical impact ignition hazard."

**LOX makes it worse [A]:** "The presence of liquid oxygen (instead of gaseous
oxygen) may cause some porous materials to become dramatically more sensitive to
mechanical impact." NASA's example is a wrench dropped onto LOX-soaked porous
hydrocarbon such as asphalt — which is why LOX facilities care about what the
pad is made of.

**Controls [derived + LANL]:** design components for stability across the full
operating envelope so they cannot chatter; avoid nonmetals at impact points;
avoid reactive metals (Al, Mg, Ti) where impact is credible; control what LOX
can spill onto. **[A]** for the chatter and LOX-porous-material facts.

**Test methods [A]:** ASTM G86-17(2025) at 0–68.9 MPa (0–10,000 psig), max
impact energy 98 J (72 ft·lbf). Formerly also ASTM D2512 at ambient — withdrawn
2023.

---

#### 6. Galling and Friction

**Definition [A]:** "Heat generated by the rubbing of two or more parts
together."

**Characteristic elements [A]:**
- two or more rubbing surfaces, generally metal-to-metal;
- rapid relative motion;
- high loads pressing the rubbing parts together.

**What makes it likely [A]:** "Data from ASTM Manual 36 indicate that metals, not
polymers, are most susceptible to ignition by friction in the frictional heating
tests currently available. Research indicates that polymers may also be
susceptible to ignition in certain conditions." Chatter again: "Chattering can
result in rapid oscillation of the moving parts within these components,
creating a frictional ignition hazard."

**Typical scenario [A]:** "Damaged or worn soft goods resulting in metal-to-metal
rubbing between the piston and the cylinder of a reciprocating compressor."

Note the causal chain — this is a *secondary* failure. The soft goods fail
first; the fire is what the failed soft goods permit. Reviewers should trace
consequences of seal wear, not just seal function.

**Controls [derived]:** eliminate rubbing metal-to-metal contact in oxygen;
maintain clearances; specify soft-goods wear limits as a safety parameter;
design out chatter; where rubbing is unavoidable, select the burn-resistant
alloy family (§6).

**Data pointers [A]:** ASTM MNL36 and ASTM G94.

---

#### 7. Fresh Metal Exposure

**Definition [A]:** "The heat of oxidation released when unoxidized metal is
exposed to an oxidizing atmosphere."

**Characteristic elements [A]:**
- metal that oxidizes quickly and has a high heat of formation for its oxides,
  **such as aluminium and titanium alloys**;
- destruction or rapid removal of the oxide layer;
- configuration that minimizes heat loss.

**What makes it likely [A]:** "This ignition mechanism usually acts in
conjunction with other ignition mechanisms, such as frictional heating or
particle impact, which damage metal surfaces. This ignition mechanism may also
be present with a **fracture or tensile failure of an oxygen-wetted pressure
vessel**."

That last clause deserves emphasis in a propulsion course: burst a LOX or GOX
pressure vessel and the fresh fracture surface is itself an ignition source.
The structural failure and the fire are not independent events.

**Controls [derived]:** avoid Al and Ti alloys in oxygen-wetted service where
surface damage is credible; eliminate the mechanisms that expose fresh metal
(friction, particle impact); design for heat dissipation rather than adiabatic
pockets.

---

#### 8. Static Discharge

**Definition [A]:** "Discharge of accumulated static charge with enough energy to
ignite the material receiving the charge."

**Characteristic elements [A]:**
- static charge buildup from flow or rubbing accumulated on an **electrically
  isolated** surface;
- a discharge point between materials, generally with differing electrical
  potentials.

**What makes it likely [A]:** "Generally, two charged surfaces are not as likely
to arc unless one material is conductive. Static discharge ignition is **most
likely to occur in dry gas environments**." Dry oxygen is the normal case, so
this is not an edge condition.

**Typical scenarios [A]:** "Static charge accumulation due to dry oxygen flow
through polymer hoses"; "Bed sheets in hyperbaric chambers can be ignited by
static discharge."

**Controls [derived]:** eliminate electrically isolated conductive surfaces;
bond and ground; avoid insulating polymer flow paths where charge can
accumulate.

---

#### 9. Electrical Arc

**Definition [A]:** "Sufficient electrical current arcing from a power source
with enough energy to ignite the material receiving the arc."

**Characteristic elements [A]:**
- an electrical power source;
- an arc with sufficient energy to melt or vaporize materials;
- flammable material exposed to heating from the arc.

**Typical scenarios [A]:** "A defective pressure switch could cause ignition when
it arcs to a flammable material. An insulated electrical heater element
undergoing a short circuit could produce ignition by arcing through its sheath
to a combustible material."

That second example is, almost word for word, Apollo 13 (§7.2). The mechanism
was documented; the tank was built anyway.

**Controls [A, LANL]:** "electrical devices should be designed in modular
structure and hermetically sealed, and inerting with nitrogen or helium is
recommended." Plus the Apollo 13 recommendation itself: **remove electrical
equipment from inside the pressure vessel** (§7.2) **[B]**.

---

#### 10. Chemical Reaction

**Definition [A]:** "A reaction of a combination of chemicals that could release
sufficient heat energy to ignite the surrounding materials."

**Characteristic elements [A]:** depend on the reactants. "For example, some
mixtures may be self-igniting while others need an external heat source. In
oxygen-hydrogen mixtures, the ignition energy is so low that it is assumed that
energies released from mixing will ignite the mixture."

**Examples [A]:**
- "Oxygen reacting with the palladium getter in a vacuum-jacketed vessel produces
  ignition." (Directly relevant to cryogenic vacuum jackets.)
- "Hydrogen leaking into the oxygen section of an oxygen-hydrogen fuel cell
  system can produce a chemical reaction ignition."
- "A heat-producing chemical reaction can occur when aluminum is sheared in the
  presence of polychlorotrifluoroethylene (PCTFE)."

The Al/PCTFE pair is a good exam item: PCTFE is one of the *recommended*
fluoropolymers, aluminium is a common structural metal, and the combination
under shear is hazardous. Compatibility is pairwise and configurational, never a
property of one material alone.

**Controls [derived]:** review getters, catalysts and adsorbents in
oxygen-wetted volumes; treat fuel/oxidiser separation failures as ignition
events; check material *pairs* under shear, not just materials.

---

#### 11. Thermal Runaway

**Definition [A]:** "Some materials, notably certain accumulations of fines,
porous materials, or liquids, may undergo self-sustained reactions that generate
heat."

**Characteristic elements [A]:**
- a material with a **high surface-area-to-volume ratio** (dusts, particles,
  foams, chars) that reacts exothermically at temperatures significantly below
  its ignition temperature;
- an environment that does not adequately dissipate heat (insulated or large
  volume vessel, or an accumulation of fines).

**The timescale is the point [A]:** "Ignition and fire may occur after short time
periods (seconds or minutes) or **over long time periods (hours, days, or
months). In the most extreme cases, the thermal runaway temperature may be near
or below normal room temperature.**"

A system can pass every commissioning test and ignite weeks later. This breaks
the intuition that "it worked when we tested it" means anything.

**Examples [A]:**
- "Ignition could occur due to an accumulation of small particulate generated by
  rubbing and abrasion in an oxygen compressor that has been proof-tested with
  nitrogen gas and is then exposed to oxygen." — the proof test *created* the
  hazard that the oxygen then ignited.
- "Contaminated adsorbent or absorbent materials, such as molecular sieves
  (zeolites), alumina, and activated carbon, may become highly reactive in
  oxygen-enriched atmospheres."

**Controls [derived]:** treat inert-gas proof testing as a particulate-generating
operation requiring re-cleaning before oxygen exposure; control adsorbent
contamination; avoid insulated accumulations of fines.

---

#### 12–17. External heat sources ("Other") **[A]**

NASA groups these together: lightning, explosive charges, personnel smoking and
open flames, fragments from bursting vessels, welding, and engine exhaust.
"Many of the potential sources of heat are self-explanatory."

The TM's parallel requirement: "The oxygen system shall also be protected from
external heat sources." (§3.3) These belong in a facility hazard review rather
than a component assessment, but they are formally part of the list and should
not be silently dropped from the course.

### 3.4 What the assessment does with the ratings

The seven required steps, verbatim from TM §4.0 **[A]**:

1. Determine the worst-case operating conditions
2. Assess the flammability of system materials
3. Evaluate the presence and probability of ignition mechanisms
4. Determine the **kindling chain** — the potential for a fire to breach the system
5. Analyze the **reaction effect** — potential loss of life, mission, and system functionality
6. Identify the **history of use**
7. Report the results of the analysis

**Kindling chain [A]** — the concept that distinguishes a real assessment from a
materials checklist:

> "Kindling chain begins when a material is ignited, and the material's heat of
> combustion is sufficient to heat and ignite the surrounding materials leading
> to a burn-through of the component."

NASA's worked example is worth reproducing exactly: a manual valve with a
polysulfone seat and stainless steel stem and body. At high pressure all three
are flammable. Ignite the seat (by flow friction or rapid pressurization) and
"enough energy could be released to ignite and burn the stem, which could then
ignite the body and result in a burn-through of the manual valve." **"If a
component could be breached, a kindling chain is present."**

**Reaction effect [A]** is rated Negligible (A) / Marginal (B) / Critical (C) /
Catastrophic (D), keyed to effects on personnel safety, system objectives and
functional capability. NASA notes ratings "are often applied conservatively,
which means the worst-case scenario drives the reaction effect assessment."

**History of use [A]** is rated (+) successful, (−) negative, or (?) unknown,
based on "whether the component has experienced routine operation/cycling in
similar or more severe conditions over an extended period of time."

**Hazard Control Table [A]** — TM Table 4 — is the deliverable: component,
schematic reference, ignition hazard, probability rating, reaction effect,
recommendation, mitigated reaction effect, status. NASA's single worked row:

| Component | Ignition hazard | Rating | Reaction effect | Recommendation | Mitigated |
|---|---|---|---|---|---|
| Manual valve | Particle impact | 4 (highly probable) | D (catastrophic) | Change valve body from stainless steel to Monel | A (negligible) |

Two mandatory deliverables a reviewer should insist on **[A]**: "a system flow
schematic and a cross-sectional diagram (e.g. machined cut-away) of each
component that shows the configuration and materials of construction... shall be
used" and "shall be included in the report"; and "a concise listing of the most
severe hazards and suggested mitigations for those same hazards shall be
included."

Also required and easy to skip: "The analyst shall determine the worst-case
**cleanliness level** of each component." Cleanliness is an input to the hazard
analysis, not a housekeeping afterthought. **[A]**
