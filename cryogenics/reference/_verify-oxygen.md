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
| Landing page | https://ntrs.nasa.gov/citations/20070016582 (browser-only; the NTRS landing pages are JavaScript-driven and time out for automated fetches — use the PDF or API URL above) |

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

---

## 4. Adiabatic compression in depth

### 4.1 The physics and NASA's equation

NASA/TM-2007-213740 gives the maximum theoretical temperature from compression
**[A]**. The equation is mangled by PDF text extraction in the source, but it is
the standard isentropic relation and the TM defines every symbol explicitly:

```
        ( P_f ) ^ ((n-1)/n)
T_f = T_i (----)
        ( P_i )
```

where, verbatim from the TM **[A]**:

- `T_f` = final temperature (absolute)
- `T_i` = initial temperature (absolute)
- `P_f` = final pressure (absolute)
- `P_i` = initial pressure (absolute)
- `n` = ratio of specific heats (**1.4 for oxygen**)

And immediately after, the caveat that must always travel with it **[A]**:

> "The actual maximum temperature is inevitably appreciably lower than the
> maximum theoretical temperature."

**Why it happens.** Gas driven rapidly into a dead-ended volume is compressed
faster than it can shed heat to the walls. The compression work goes into
internal energy, so the temperature at the closed end rises — and it rises with
the *pressure ratio*, not the pressure difference. Because the process is fast
(NASA's threshold: "generally occurring in less than 1 s"), it is approximately
adiabatic; because it is approximately adiabatic and approximately reversible,
it is approximately isentropic, which is what the equation above assumes.

The nonmetal sitting at that dead end — a seat, an O-ring, a seal — sees the
peak temperature. Bulk metals do not ignite this way; nonmetals do. This is why
NASA calls it "the most effective igniter of nonmetals."

### 4.2 Worked example

**Assumptions — state these every time, they are doing a lot of work:**

1. Ideal gas.
2. Constant ratio of specific heats, γ = n = 1.4 for oxygen.
3. Isentropic: adiabatic *and* reversible. No heat transfer to walls, no
   viscous dissipation accounted separately.
4. Compression is effectively instantaneous relative to the thermal time
   constant of the gas volume.
5. Initial gas at **20 °C (293.15 K)** and **14.7 psia (1 atm)** — i.e. the
   dead-ended line is sitting at ambient before the valve opens.
6. Gas-phase only. No condensed-phase oxygen.

**Result.** Final temperature at the dead end as a function of upstream
pressure, computed from the TM equation under the assumptions above:

| Upstream P_f (psia) | Pressure ratio | T_f (K) | T_f (°C) | T_f (°F) |
|---:|---:|---:|---:|---:|
| 100 | 6.8 | 507 | 234 | 453 |
| 275 | 18.7 | 677 | 404 | 759 |
| 500 | 34.0 | 803 | 530 | 986 |
| 1,000 | 68.0 | 979 | 706 | 1,302 |
| 2,000 | 136.1 | 1,193 | 920 | 1,688 |
| 3,000 | 204.1 | 1,340 | 1,067 | 1,952 |
| 4,500 | 306.1 | 1,504 | 1,231 | 2,248 |
| 6,000 | 408.2 | 1,633 | 1,360 | 2,480 |

**The headline for the lecture:** opening a valve from a 3,000 psi oxygen supply
into a dead-ended line that was sitting at atmospheric pressure and room
temperature can theoretically produce **about 1,070 °C (1,950 °F)** at the
closed end. No spark, no external heat, no contamination required — just a valve
opening quickly. Steel glows at that temperature.

Inverting the relation, the pressure ratio needed to reach a given temperature:

| Target T | Pressure ratio | P_f from 1 atm |
|---|---:|---:|
| 200 °C | 5.3 | 79 psia (0.54 MPa) |
| **300 °C** | **10.5** | **154 psia (1.06 MPa)** |
| 400 °C | 18.3 | 270 psia (1.86 MPa) |

Against EIGA's working convention of a 300 °C minimum AIT for nonmetals in
oxygen systems **[B]**, the *theoretical* threshold is a pressure ratio of only
about **10.5** — around 154 psia from atmospheric. That is a low bar, and it is
why this mechanism dominates nonmetal ignition.

These figures are my own computation from the TM's equation, not quoted from any
document: **[A]** for the equation and its stated constants, arithmetic
independently reproducible from the assumptions above.

### 4.3 Ideal versus real — the discrepancy that teaches the lesson

Here is the tension a good student should notice, and it is worth building a
tutorial around.

NASA/TM-2007-213740 states **[A]**:

> "Extensive testing in a system consistent with ASTM G74 has demonstrated that
> for **initial upstream pressures less than 275 psia** and an initial
> downstream pressure of ambient or above, **the actual temperature rise (with
> real heat loss) is too small for ignition to occur.**"

But the table above says 275 psia gives a *theoretical* 404 °C — comfortably
above the 300 °C nominal nonmetal AIT. So the ideal calculation predicts
ignition where forty years of testing says it does not happen.

**Both are correct, and the gap is the lesson:**

- The isentropic result is an **upper bound**, not a prediction. Real
  compressions are neither perfectly adiabatic nor perfectly reversible: heat
  flows into the pipe wall and the seat, the compression takes finite time, and
  the gas at the dead end mixes.
- Ignition needs not just peak temperature but **enough energy delivered for
  long enough** to raise a real piece of polymer through its ignition. A brief
  temperature spike in a small gas mass against a large metal heat sink may not
  do it.
- Which is precisely why **ASTM G74-13(2021)** exists as a *test* rather than a
  calculation. The standard tests components in 5 mm and 14 mm bore
  configurations at up to 69 MPa, and reports either a median failure pressure
  or an ignition-probability curve. **[A]**

**The design-review rule to take away:** the isentropic equation is a screening
tool that tells you when you *cannot* rule the mechanism out. It never tells you
a design is safe. Qualification comes from G74 testing of the actual
configuration. NASA says the same thing about the whole method: "The designer of
an oxygen system or component shall consult the appropriate Materials and
Processes organization to ensure that the testing data used to make ignitability
assessments are applicable to the specific design configuration." **[A]**

### 4.4 Why fast-opening valves into dead-ended lines are dangerous

NASA's own example **[A]**: "Fast-opening valve that releases high-pressure
oxygen into a dead-end tube or pipe compresses the oxygen initially in the tube
and causes rapid pressurization heating at the dead end."

The hazard needs all three of NASA's characteristic elements at once, and a
fast-opening valve into a dead-ended line supplies all three:

1. **Rapid pressurization (< 1 s)** — supplied by the valve's opening
   characteristic.
2. **An exposed nonmetal close to the dead end** — supplied by the seat, seal or
   O-ring of whatever terminates the line. A dead end in a real system is almost
   always a *component*, and components contain polymers.
3. **A pressure ratio exceeding the situational AIT** — supplied by the supply
   pressure, and it is the *ratio* that matters, so a line left at atmospheric
   is the worst case. Leaving a line partially pressurised reduces the ratio.

Compounding factors a reviewer should look for:

- **Quarter-turn valves** (ball, plug) inherently open fast. **[derived]**
- **Long dead-ended runs** put more gas mass at the closed end. **[derived]**
- **Contamination at the dead end** lowers the effective ignition temperature —
  WHA note that for nonvolatile residues such as oils and greases "adiabatic
  compression is often the dominant ignition threat." **[B]**
- The kindling chain: ignite the seat and you may burn the stem and then the
  body (§3.4). Adiabatic compression is a *nonmetal* igniter, but the fire it
  starts need not stay in the nonmetal. **[A]**

### 4.5 What the standards say about pressurisation rates

**Honest answer: I could not verify a specific numeric pressurisation-rate limit
from a primary standard, and the course should not print one until someone reads
ASTM G88-21.** **[C]** for any specific rate figure.

What I *can* cite:

- **The < 1 s characteristic element.** NASA/TM-2007-213740: rapid pressurization
  "generally occurring in less than 1 s." This is the closest thing to a rate
  criterion in the primary NASA source, and it is a *screening* criterion for
  whether the mechanism is present, not a design limit. **[A]**
- **The 275 psia empirical bound.** Below 275 psia initial upstream pressure with
  downstream at ambient or above, G74-consistent testing shows the real
  temperature rise is too small for ignition. **[A]**
- **ASTM G88-21** is the authoritative design guide and "emphasizes factors that
  cause ignition and enhance propagation throughout a system's service life so
  that the occurrence of these conditions may be avoided or minimized."
  Secondary sources report that G88 establishes design criteria specifically
  addressing adiabatic compression among other mechanisms. **[B]** — I have the
  scope statement from ASTM's own product page **[A]** but not the clause text.
- **ASTM G128/G128M-15(2023)** is described by ASTM as having adiabatic
  compression as a key focus area. **[A]** (from ASTM's product page)
- **Slow-opening valves are the recognised control.** The design intent is
  documented in the patent literature — a portable oxygen system device where
  "it was required that initially the flow of oxygen be increased slowly in
  order to prevent local overheating caused by adiabatic [compression] of the
  oxygen in a high pressure system." **[B]** — this is a patent, i.e. evidence
  that the control is standard practice, not a standards requirement.

**Controls a design reviewer looks for** (each traceable to removing one of
NASA's three characteristic elements) **[derived]**:

| Element to remove | Control |
|---|---|
| Rapid pressurization | Slow-opening or metered-opening valves; restricting orifice upstream; deliberate staged pressurisation |
| Exposed nonmetal at the dead end | Move soft goods out of the dead-end impact zone; metal-to-metal seating where feasible; shield the seat |
| High pressure ratio | Avoid pressurising from atmospheric — keep lines charged; reduce system pressure to the lowest usable (TM §3.1) |
| Dead end itself | Eliminate dead-ended legs; avoid capped tees and unused ports (this also removes the resonance geometry, §3.3 item 4) |

Note how the last row kills two mechanisms with one design change. That is the
argument for doing the assessment mechanism-by-mechanism rather than
hazard-by-hazard: the controls overlap, and you find that out only by tabulating.

---

## 5. Cleanliness

### 5.1 What "oxygen clean" means conceptually

Not "visually clean". Oxygen cleanliness is a **specified, verified and
documented level of freedom from contaminants that could act as fuel or as an
ignition initiator**, appropriate to the pressure, oxygen concentration, and
geometry of the specific system.

The governing framing, from WHA's summary of the 2025 revision **[B]**:
"Cleaning for oxygen service is fundamentally a fire-prevention measure." It is
not a quality or product-purity activity that happens to involve oxygen; it is a
hazard control, and it belongs in the hazard analysis.

NASA makes this structural: "The analyst shall determine the worst-case
cleanliness level of each component" is a *required step* of the compatibility
assessment (TM §4.1) **[A]**, and contamination is listed alongside
concentration, temperature, pressure and flow rate as a condition that
"can intensify flammability and ignition risks."

### 5.2 The governing standards

- **ASTM G93/G93M-25**, *Standard Guide for Cleanliness Levels and Cleaning
  Methods for Materials and Equipment Used in Oxygen-Enriched Environments*
  **[A]**. Covers "selection of methods and apparatus for cleaning materials and
  equipment intended for service in oxygen-enriched environments... levels of
  cleanliness used for various applications and the methods used to obtain and
  verify these levels," across chemical-, solvent- and aqueous-based processes.
- **CGA G-4.1, 7th edition (2018)**, *Cleaning of Equipment for Oxygen Service*
  **[B]**. "Describes the cleaning methods and requirements for equipment used in
  the production, storage, distribution, and use of liquid and gaseous oxygen to
  reduce the risk of fire, explosion, or promotion of combustion." Internationally
  harmonised and referenced by NFPA. **[B]**
- **ASTM G127-15(2023)**, cleaning-agent selection. **[A]**
- **EIGA/IGC Doc 33**, *Cleaning of Equipment for Oxygen Service* — the European
  harmonised equivalent, cited by the LANL guide. **[B]**

**Important change to flag in the course [A]:** the 2025 revision moved G93 from
a *Standard Practice* to a *Standard Guide*. Per WHA's summary **[B]**: "Guides
are educational. They present options, considerations, and technical context."
The standard now "deliberately avoids prescribing single correct levels" and
instead expects users to "select levels based on their specific operating
conditions and documented risk analysis." Any older course material that treats
G93 as prescribing a level is now wrong.

### 5.3 Why hydrocarbon and particulate contamination matter — and differently

The 2025 revision treats these as **distinct hazards with different risk
profiles**, which is the conceptually important point **[B]**:

**Nonvolatile residues (NVR) — oils, greases, films.** The dominant threat is
**adiabatic compression** (WHA, informed by NASA WSTF data) **[B]**. A film of
hydrocarbon sitting at a dead end is a low-AIT fuel positioned exactly where the
compression peak occurs. EIGA is blunt **[A]**:

> "Oil and grease are particularly hazardous in the presence of oxygen as they
> can ignite extremely easily and burn with explosive violence. In oxygen
> equipment, oil and grease ignition often causes a chain reaction that finally
> results in metal burning or melting. In such cases, the molten or burned metal
> residue is projected away from the equipment and can be followed by an oxygen
> release."
> — EIGA Doc 04/26 §5.3.2

That sentence is the whole kindling-chain argument in miniature: a trace of oil
ignites, and the *metal* ends up burning.

**Particulates.** These involve "more complex ignition mechanisms such as
particle impact" **[B]**. Recall the characteristic elements from §3.3: entrained
particles plus >30 m/s velocity plus an unfavourable impact angle. Cleanliness
removes the first element. It is the only one of the three you can control
after the geometry is frozen.

The contaminant list a reviewer should expect to see addressed, from the LANL
guide **[A]**: "solvents, acids, alkalis, thread lubricants, filings, dirt,
scale, slag, [fi]ling, weld splatter, organic materials such as oil, grease,
crayon, or paint, and other foreign materials." Note *crayon* and *paint* —
marking materials are a classic finding in oxygen fire investigations.

### 5.4 How cleanliness is verified — conceptually

Two families of measurement, and the distinction between them matters:

**Nonvolatile residue (NVR).** A measure of the mass of residue remaining after a
solvent extract from a defined surface area is evaporated. Reported as mass per
unit area (typically mg/ft² or mg/m²) or mass per unit volume of extractant.
Supporting ASTM methods **[A]**:
- **G120-15(2023)**, Determination of Soluble Residual Contamination by Soxhlet
  Extraction
- **G136-03(2023)e1**, Determination of Soluble Residual Contaminants in
  Materials by Ultrasonic Extraction
- **G144-01(2022)**, Determination of Residual Contamination of Materials and
  Components by Total Carbon Analysis Using a High Temperature Combustion
  Analyzer

**Particle count.** Counts of particles by size band per unit area or per unit
volume of rinse fluid, with a maximum permitted size and permitted counts in
each band.

**The verification principle that must survive into the course [B]:**
> "Visual inspection methods alone cannot verify most oxygen service cleanliness
> levels."

Qualitative methods — visual and UV/black-light inspection — detect only gross
contamination. Quantitative methods are required to verify compliance with a
specification. A reviewer confronted with "we looked at it under UV and it was
clean" has been given a screening result, not a verification.

### 5.5 How a level is specified, and the documentation trail

G93/G93M-25 provides updated **coding conventions** so a cleanliness level can be
named unambiguously in a procurement document **[B]**. The practical consequence:
a purchase order should carry a *level designation*, not the adjective "clean".

The 2025 edition covers the **full lifecycle** — "procurement, cleaning process
specification, verification testing, packaging, preservation, and assembly"
**[B]**. Each of those is a place cleanliness is lost, and the documentation
should follow the part through all of them.

What a design reviewer should expect to see in the package **[derived from the
above, plus LANL]**:

- The **specified cleanliness level** and the standard it is drawn from.
- **Who cleaned it** — LANL notes components "shall have been cleaned for oxygen
  service by the manufacturer prior to installation in accordance with the
  mandatory requirements of CGA G-4.1... or equivalent standard." **[A]**
- **Verification results** — quantitative NVR and particle data, not a visual
  sign-off.
- **Packaging and preservation** evidence, showing cleanliness was maintained
  from cleaning to installation.
- **Re-cleaning triggers.** LANL: "Final cleaning after assembly and before
  introduction of oxygen to the system, by purging the system using clean, dry
  gaseous nitrogen or dry air." **[A]** And recall the thermal runaway example
  (§3.3 item 11): a nitrogen proof test *generates* particulate, so the
  cleanliness state after testing is not the state at cleaning.
- Awareness of **cleaning's own hazards**, which LANL states plainly **[A]**:
  "Non-volatile cleaning agents may remain in trapped spaces, which could react
  with oxygen. Cleaning solutions may degrade non-metals in an assembly. Caustic
  and acid cleaning solutions may cause crevice corrosion in assemblies." The
  cleaning process can introduce the contaminant it was meant to remove.

Purity of the oxygen itself is specified separately — **CGA G-4.3**, *Commodity
Specification for Oxygen*. **[B]**

---

## 6. Materials and lubricants

### 6.1 Why most hydrocarbons are incompatible

EIGA states the rule and the exception together **[A]**:

> "In general, hydrocarbon-based oil and grease shall never be used to lubricate
> equipment that can be in contact with oxygen or oxygen-enriched air. Special
> lubricants such as approved perfluorocarbon lubricants are available for use in
> oxygen-enriched atmospheres. **Oxygen pressure gauges shall not be tested or
> calibrated in contact with oil.**"
> — EIGA Doc 04/26 §5.2 area

The mechanism: hydrocarbons have low autoignition temperatures, high heats of
combustion, and — as contaminants — high surface-area-to-volume ratios and
positions (films, at dead ends, in crevices) that maximise both ignition
probability and heat delivery to surrounding metal. They are the ideal first
link of a kindling chain.

Davis's two rules for lubricants, where one is unavoidable **[A]**: "(1) Use only
when it is absolutely necessary, and (2) Use only the smallest workable amount."
Plus: "lubricants become contaminants if they enter into the oxygen stream" —
i.e. a lubricant is a deliberately introduced contamination source, and should be
treated as such in the hazard analysis.

Note also the glycol trap, which is not obvious **[A]**: closed-circuit cooling
systems for oxygen equipment are often filled with water containing up to 50%
ethylene or propylene glycol. "Both ethylene glycol and propylene glycol are
flammable and can concentrate if leaked into an oxygen system and the water
evaporates." The coolant becomes a fuel by evaporative concentration. EIGA notes
"incidents have occurred when leakage is undetected in the system."

### 6.2 Material classes used in oxygen service

**Metals — the compatible family [A]** (Davis 2012): "The metals that tend to be
the most compatible include **nickel alloys, copper, brass and bronze**. These
metals are more difficult to ignite and, once ignited, tend to burn with the
lowest heats of combustion."

**Metals to avoid [A]:** "magnesium, titanium and many aluminum alloys."
Cross-reference the threshold table in §2.2 — magnesium and titanium sustain
combustion *below ambient pressure*.

**Monel** specifically: 10,000 psi threshold in both promoted ignition and
mechanical impact **[A]**; NASA's own worked hazard control is switching a valve
body from stainless to Monel **[A]**; LANL: "Monel is approved for tubing,
fittings, and c[omponents]" **[A]**.

**LANL's pressure-banded guidance [A]:**
- At or below **200 psig and 200 °F**: carbon steel, 316 SS, or copper (Type K)
  acceptable for 99.5 mole percent oxygen, at almost any velocity.
- Above that curve: **copper tubing should be selected** — "This applies also in
  flow-through valves, where velocity could be an issue, and where oxygen gas
  impinges directly on ferrous piping."
- Where velocity through a valve may approach **sonic**: "copper-based materials
  will be required."
- Above **4.83 MPa (700 psig)**: "oxygen piping and fittings should be stainless
  steel, nickel alloys, or copper alloys... because of ignition susceptibility."

**Nonmetals [A]** (Davis 2012): the common classes are elastomers, lubricants,
ceramics and carbon fibre materials. "The best elastomeric compounds are
typically the **fluorinated polymers**, which... tend to be the more difficult to
ignite and burn with a lower heat of combustion."

Specific fluoropolymer/fluorolubricant data from §2.2 **[A]**: fluorinated
lubricants (PCTFE) resist mechanical-impact ignition to 10,000 psi in GOX and
8,000 psi in LOX — the best nonmetal numbers in the table.

**The toxicity counterweight, which is easy to omit [A]:** "Special care must be
taken with nonmetals if they are used within a breathing oxygen system because
some materials can produce toxic products... Fluorinated elastomers and
lubricants can produce toxic fluorinated products, especially if any small burn
within the system allows combustion byproducts to enter the gas stream." The
same fluorination that gives low heat of combustion gives toxic combustion
products. For a breathing-gas or crewed application this is a real trade, not a
footnote.

**Ceramics [A]:** "generally oxidized compounds and tend to be compatible with
oxygen. However, the use of ceramics is limited because they are typically very
fragile."

**Carbon fibre / graphite epoxy [A]:** traditionally excluded because the binder
is incompatible, but "laboratory testing has demonstrated that some of these can
be used." Davis is candid: "the factors that make graphite epoxy materials
acceptable for use in oxygen systems are not well understood. Many variables
inherent with composites have strong influences on their oxygen compatibility,
namely binder material, layup, cure, shape, etc."

**Secondary (non-wetted) materials [A]:** incompatible materials can be used as
structural support outside the oxygen-wetted boundary — "A good example of this
is a composite overwrapped oxygen tank." The wetted/non-wetted distinction is a
design tool, and it makes the definition of the wetted boundary a safety-critical
drawing question.

### 6.3 The principle: compatibility is configuration-dependent

This is the single most important idea in §6, and every primary source states it
independently.

**NASA/TM-2007-213740 [A]:**
> "Unfortunately, material flammability is affected by many factors and,
> therefore, **absolute flammability thresholds are difficult to establish
> without testing the actual use configuration.**"

And the mandatory consultation, stated twice in the document:
> "The designer of an oxygen system or component **shall** consult the
> appropriate Materials and Processes organization to ensure that the testing
> data used to make [flammability / ignitability] assessments are applicable to
> the specific design configuration."

**Davis 2012 [A]:**
> "**Caution: The compatibility of untested materials is unknown. They cannot be
> determined by similarity to other materials whose properties are known**,
> whether the similarity is in composition, physical properties, etc. Slight
> differences can drastically change the oxygen compatibility of a material.
> Testing, and not evaluation, is the only method by which safe materials can be
> chosen."

And the admission that no single test settles it:
> "However, there is no decisive test or evaluation method that will clearly
> indicate the best materials for use in oxygen."

**ASTM's structural admission, in G128's own scope [A]:** the guide "does not
purport to contain all the information needed to design and operate an
oxygen-enriched system safely" and "safe system design requires sound technical
judgment from qualified personnel beyond handbook procedures."

**Four axes on which "the same material" changes verdict**, all evidenced above:

1. **Pressure.** 304L stainless: nonflammable enough below 250 psi, sustains
   combustion above. **[A]**
2. **Thickness / geometry.** Thin sections and finely divided forms (mesh,
   sintered filters) are far more flammable than bulk. The Mir SFOG casing
   burned partly because it was thin (§7.3). **[A]**
3. **Velocity and impingement angle.** The Shuttle flow control valve: same
   alloy, same pressure, same particles — burned with a drill point present,
   survived 40 tests at 45°. **[A]**
4. **What it is paired with.** Aluminium is acceptable in many places; aluminium
   *sheared against PCTFE* is a chemical-reaction ignition mechanism. **[A]**

**The corollary for the promoted ignition test [A]:** Davis notes G124 is so
harsh that "the majority of the industry standard metals for oxygen systems, such
as stainless steel alloys, do not meet this criterion at their typical use
pressures," and essential nonmetal seal materials cannot meet it at all. The
response was not to abandon those materials but to build a hazards process
around them: "The harshness of the test has necessitated the development of a
more realistic hazards evaluation process that will allow the use of materials
that do not meet the acceptance criteria. This process is called an Oxygen
Compatibility Assessment."

**This is the pedagogical spine of Module 6.** The oxygen compatibility
assessment is not a materials lookup that returns pass/fail. It exists precisely
*because* a materials lookup returns "fail" for almost everything real systems
are built from. The assessment is the discipline of using flammable materials
safely by removing ignition mechanisms.

For reference, the G124 acceptance criterion itself **[A]**: 1/8 in (3.2 mm)
diameter rod, at least 4 in (102 mm) long, ignited at the bottom by an aluminium
or magnesium promoter; **self-sustained combustion is deemed to occur if the
sample burns more than 1.2 in (30 mm)**.

And Davis's four design ground rules, from the ASTM Technical and Professional
Training course *Fire Hazards in Oxygen Systems* **[A]**:

- **Conservation** — conserve both oxygen and materials within the system.
- **Maximization** — maximise the use of the most burn-resistant materials available.
- **Minimization** — minimise the potential ignition sources inherent in all systems.
- **Utilization** — utilise good system design practices.

---

## 7. Historical incidents

**Read this classification first.** The mechanisms differ by phase and
environment, and conflating them produces bad engineering intuition:

| Incident | Environment | Why the distinction matters |
|---|---|---|
| Apollo 1 (1967) | **Oxygen-enriched atmosphere** — 100% O₂ at 16.7 psia, crewed cabin | Bulk-material flammability in a habitable volume. Not a plumbing failure |
| Apollo 13 (1970) | **Cryogenic supercritical oxygen** in a pressure vessel | Electrical arc ignition inside an oxygen-wetted vessel |
| Mir SFOG (1997) | **Chemically generated hot GOX** in a crewed volume | Contamination + thin-metal flammability; casing burn-through |
| Medical regulator fires | **High-pressure GOX** | Adiabatic compression, particle impact, aluminium |
| Industrial valve/pipeline fires | **High-pressure/high-velocity GOX** | Friction and particle impact in large piping |

Only Apollo 13 involves cryogenic oxygen as such. A cryogenic propulsion course
should be explicit that most of the well-documented oxygen fire literature is
GOX and enriched-atmosphere work, and that LOX adds its own effects — porous
materials become "dramatically more sensitive to mechanical impact" in LOX (TM
§4.3.1) **[A]**, and Al 2219's impact threshold drops from 1,500 psi in GOX to
50 psi in LOX **[A]**.

---

### 7.1 Apollo 1 / AS-204 (27 January 1967) — oxygen-enriched atmosphere

**Primary source [A]:** *Report of Apollo 204 Review Board to the Administrator,
National Aeronautics and Space Administration*, 5 April 1967.
- NTRS 19820066930, report number **NASA-TM-84105**, dated 1967-04-05 —
  https://ntrs.nasa.gov/api/citations/19820066930/downloads/19820066930.pdf
- Also catalogued as NTRS 19930078717, **NASA-TM-108667**.
- NASA-hosted Findings, Determinations and Recommendations:
  https://www.nasa.gov/wp-content/uploads/static/history/Apollo204/find.html
- Numerous appendices exist as separate NTRS records (19820066927 Appendix B,
  19820066925 Appendix C §1, 19820066923 Appendix D, 19820066935 Appendix E,
  19820067189 Appendix G Pt 1).

**What happened.** During a plugs-out test, fire broke out in the Command Module
and killed the three-man crew. The Board could not identify a single ignition
source but found physical evidence of arcing.

**Why — verbatim from the NASA-hosted Findings page [A]:**

- Test conditions: *"The test was conducted with a 16.7 pounds per square inch
  absolute, 100-percent oxygen atmosphere."*
- Determination: *"The test conditions were extremely hazardous."*
- Ignition: *"Evidence of several arcs was found in the post-fire
  investigation,"* with probable location *"an electrical arc in the sector
  between -Y and +Z spacecraft axes."*
- Fuel load: *"The Command Module contained many types and classes of
  combustible material in areas contiguous to possible ignition sources."*
- Wiring: *"Deficiencies in design, manufacture, installation, rework and quality
  control existed in the electrical wiring."*

**Recommendations [A]:**
- *"The amount and location of combustible materials in the Command Module must
  be severely restricted and controlled."*
- Three-dimensional jigs for wire bundle manufacture, with rigid inspection at
  all stages of wiring design, manufacture and installation.
- Continue studies of a diluent gas, "with particular reference to assessing the
  problems of gas detection and control and the risk of additional operations
  that would be required in the use of a two-gas atmosphere."

**The finding that should be quoted in every safety course [B]:** the Board
found that NASA's long record of success with pure oxygen atmospheres at
16.7 psia and below had led to *overconfidence and complacency*, and that test
documents and crew procedures contained no fire emergency provisions because
*"the test configuration was not classified as potentially hazardous."*
Marked B because I have it from a search summary of the NASA pages rather than
having read that clause in the report text; the underlying document is public
and should be quoted directly for the course.

**Engineering lesson.** Three lessons, and the third is the one people miss:

1. **Enrichment plus pressure plus fuel load is the hazard, not any one of them.**
   At 16.7 psia of pure oxygen, the cabin's materials — nylon netting, Velcro,
   foam padding, paper checklists — were a fuel bed. Compare §2.2: two
   percentage points of enrichment changes polyester foam from
   self-extinguishing to fully consumed. This cabin was at 100%.
2. **The ignition source was never definitively identified, and it did not need
   to be.** Where arcs are credible and the fuel load is uncontrolled, the fire
   is a matter of time. This is exactly the logic of NASA's ignition mechanism
   method (§3): remove characteristic elements, do not hunt for the one spark.
3. **A hazardous configuration classified as non-hazardous receives no hazard
   controls.** The absence of emergency planning followed directly from the
   paperwork classification. In review terms: the classification step is itself
   safety-critical.

Direct lineage to this course: the compatibility-assessment discipline in
NASA/TM-2007-213740 and the material requirements in NASA-STD-6001 are
institutional descendants of this report.

---

### 7.2 Apollo 13 oxygen tank 2 (13 April 1970) — cryogenic oxygen pressure vessel

**Primary source [A]:** *Report of Apollo 13 Review Board* (the Cortright
Report), **NASA-TM-X-65270**, 15 June 1970.
- NTRS 19700076776 — https://ntrs.nasa.gov/api/citations/19700076776/downloads/19700076776.pdf
- Appendices: NTRS 19700078804 (Baseline Data), 19700078726 (Appendices B, C),
  19700078913 (Appendix F Special Tests and Analyses, Appendix G).

**Secondary source used here [A]:** Brenda Lindley Anderson, *A Case Study of the
Failure on Apollo 13: Based on TMX-65270, Report of Apollo 13 Review Board*,
NASA Marshall Space Flight Center, report **M11-0349**, 8 August 2011, NTRS
20110015690 — https://ntrs.nasa.gov/api/citations/20110015690/downloads/20110015690.pdf
This is a NASA document that explicitly summarises the Board report, and I read
it directly; the detail below is quoted from it.

**The failure chain, in order [A, from Anderson]:**

1. **Design mismatch.** Each heater in the tank had a thermostatic switch as
   protection against extreme heat; it "should open if the temperature rises
   above 80 °F." The switches "were rated at 28 V dc, which is the standard
   operating power for the Apollo craft."
2. **Ground support equipment at 65 V.** During the Countdown Demonstration Test
   and tanking tests at KSC, the heaters were powered from **65 V dc GSE**.
   Post-flight testing showed the switches "failed to open when the heaters used
   power from the 65 V dc GSE."
3. **The gap in qualification.** "Qualification and testing procedures for the
   heater did not test the ability at any point for the switches to operate at
   65 V dc." The mismatch existed for years and was never exercised by a test.
4. **Overheating during detanking.** Flight data reviewed post-flight "showed
   that the switches did not open at any time when the recorded temperature was
   above 80 °F." Post-flight testing showed the heaters, "since they were not cut
   off by the thermostatic switch, may have reached temperatures as high as
   **1000 °F** during the detanking procedures."
5. **Insulation destroyed.** "This greatly elevated temperature was shown to
   cause severe damage to Teflon insulation on wiring. Severe damage almost
   certainly occurred to the wiring inside oxygen tank 2 during the extended
   heater use."
6. **The information never reached the decision.** "This information was not
   available to decision makers at the time of the pre-launch discussions,
   instead virtually all attention focused on the potential of damage due [to] a
   loose fill tube."
7. **First warning in flight, misread.** At **46:40:02 MET** the crew turned on
   the tank 2 fans; in three seconds the oxygen quantity reading rose from an
   expected 82% to off-scale above 100%. The fans ran twice more without adverse
   effect, "however, the quantity gauge continued to read off scale."
8. **The failure.** At **55:53:20 GET**, current was applied to the oxygen tank 2
   fan motors at the EECOM's request to stir the tanks. At **55:54:53.555 GET**
   telemetry was lost for 1.8 seconds; dc main bus B registered a serious
   undervolt and the crew heard a loud bang.
9. **Mechanism.** "It is evident that wiring inside the oxygen tank had lost its
   Teflon insulation due to the overheating during the de-tanking procedures at
   KSC. When the fan-on request was performed, **the current flow generated a
   spark which ignited oxygen in the tank**. The tank was over-pressured by the
   explosion and burst, causing damage to adjacent systems, including oxygen
   tank 1, and blowing off the side panel covering SM bay 4."

**Cortright's summary of cause [B]:** the accident "was not the result of a
chance malfunction in a statistical sense but, rather, it was the result of an
unusual combination of mistakes coupled with a somewhat deficient and unforgiving
design." Marked B — widely reported from the Board report; verify the exact
wording against TM-X-65270 before quoting in courseware.

**Board recommendation [B]:** redesign the service module oxygen tank, including
**removal of all electrical equipment from inside the pressure vessel**. Same
caveat — verify against the report text.

**Engineering lessons.**

1. **This is textbook electrical arc ignition (§3.3 item 9), and NASA's own
   guide names the scenario.** TM-2007-213740's example for electrical arc is
   "an insulated electrical heater element undergoing a short circuit could
   produce ignition by arcing through its sheath to a combustible material." The
   mechanism was catalogued. The tank still had powered electrical equipment
   immersed in oxygen.
2. **Interface voltage is a safety parameter.** A 28 V component met by 65 V
   ground equipment defeated the only protective device in the assembly. Ground
   support equipment is part of the system.
3. **Untested protection is not protection.** The switches' behaviour at the
   voltage they would actually see was never in any qualification procedure. A
   reviewer's question: *has this protective device been tested at every
   condition it will encounter, including ground operations?*
4. **The damage was latent.** The tank flew 46 hours without anomaly. Damage
   inflicted on the ground, weeks earlier, waited for a current to be applied.
   Compare thermal runaway (§3.3 item 11): "it worked when we tested it" is not
   evidence.
5. **The 82%-to-off-scale spike at 46:40:02 was the system reporting its own
   damage** and was not recognised as such. Anomalous instrumentation in an
   oxygen system deserves a fire hypothesis, not just a sensor hypothesis.
6. **Teflon (PTFE) is a *good* oxygen material and it still failed.** Per §2.2
   PTFE has among the best impact thresholds of the nonmetals. It was destroyed
   thermally at 1000 °F. Material selection does not survive an out-of-envelope
   thermal excursion — which is the configuration-dependence principle (§6.3)
   stated in the time domain.

---

### 7.3 Mir SFOG / Vika fire (24 February 1997) — chemically generated hot GOX

**Primary source [A]:** John Graf, *Oxygen Candle Background for Subs and Space*,
NASA Johnson Space Center, report **JSC-CN-38913**, February 2017, NTRS
20170002051 —
https://ntrs.nasa.gov/api/citations/20170002051/downloads/20170002051.pdf
Presented at "Subs in Space", Houston TX, February 2017; the document notes it
was for eventual publication in an NESC report then in preparation. The internal
title on the paper is *Chlorate Oxygen Generator (Oxygen Candle) Review of the
History of Candle Development*.

**Context.** Mir used solid fuel oxygen generators (SFOG), designated **TGK** by
the Russians and commonly called Vika, burning **lithium perchlorate** canisters
to generate oxygen chemically, supplementing the Elektron units when the crew
was large. **[A]** (Graf; system naming also **[B]** from NASA history pages.)

**What happened, verbatim from Graf [A]:**

> "The Russian MIR space station carried a lithium perchlorate oxygen generator
> designated TGK. In 1997 one TGK unit failed having burned through the thin
> stainless steel wall. It is assumed that the stainless steel was actually
> burning in the high temperature oxygen stream. The fire continued for some
> 10-20 minutes until the generator was exhausted. NASA assisted the Russian
> Space Agency with the failure investigation."

**Why [A]:**

> "The investigation concluded that the oxygen generator was probably
> contaminated during manufacture. The contaminant being either a hydrocarbon
> material or a fragment of the manufacturer's technician's chemical gloves...
> The fire of the stainless steel shell was due in part to its extreme thinness
> since **thinner metals have been shown to be more flammable in elevated oxygen
> compatibility tests**."

**[B]** from NASA history sources: the flames spanned the breadth of the Kvant-1
module and cut off access to one of the two Soyuz escape craft; the crew
extinguished the fire without damage to the station structure.

**Engineering lessons.** This incident is worth more class time than it usually
gets, because it demonstrates three separate course principles converging:

1. **Manufacturing contamination is an ignition source.** A glove fragment or a
   trace hydrocarbon, introduced at manufacture, was sufficient. This is exactly
   the cleanliness argument of §5 — and note that no amount of careful field
   operation could have removed a contaminant sealed inside the canister.
   Cleanliness is a *supply chain* property.
2. **Thin stainless steel burned.** Not melted — burned, in the oxygen stream it
   was generating. This is the thickness rule (§2.3, Davis rule 4) killing
   someone's intuition that stainless is inert. Cross-reference §2.2: 304L
   sustains combustion at 250 psi in *bulk rod* form; thin sheet is worse.
3. **The containment was the fuel.** The design assumed the casing would contain
   the reaction. In an oxygen-rich, high-temperature environment the casing was
   simply another flammable material in the kindling chain (§3.4).

**Related incidents in the same source [A]**, useful for showing this is a class
of failure and not a one-off: candles burning at uneven rates, "occasionally
tripling their generation rate," attributed to incomplete mixing of iron powder
into the bulk chlorate; SCOG units found "contaminated on the outside by various
oils" with reports of "holes burning through the stainless steel SCOG wall";
and a Dutch submarine (HrMs Bruinvis) candle furnace over-pressure event in May
2007.

Graf also documents **ValuJet Flight 592** (Everglades, 11 May 1996), where
expired-but-not-expended chemical oxygen generators carried as cargo without
safety caps activated in the cargo hold **[A]**. Graf cites NTSB report
**PB97-910406**, dated 19 August 1997. Different mechanism (uncontrolled
activation rather than material ignition) but the same family, and a good
illustration that oxygen sources are hazardous cargo.

---

### 7.4 Aluminium medical oxygen regulator fires (1990s) — high-pressure GOX

**Source [B]:** WHA International case study —
https://wha-international.com/case-study-medical-oxygen-regulators/
Marked B: WHA are the recognised specialists and performed the investigations,
but this is their own summary page, not the underlying reports. The resulting
**ASTM G175** is verifiable **[A]**.

**What happened [B].** WHA investigated **11** medical oxygen regulator fires;
the FDA received reports of **17 fires between 1993 and 1999** involving aluminium
regulators on portable oxygen cylinders. Many involved fire or emergency
services. In the documented **6 October 1995 Boone, North Carolina** incident,
responders ventilating a patient from a high-pressure medical oxygen cylinder
experienced a catastrophic burnout within the aluminium regulator; "flames and
molten slag from the regulator erupted from the carrying case and engulfed the
upper torso of the EMT who was carrying it." The ignition mechanism identified
for that incident was **particle impact**.

**Why [B].** Four ignition mechanisms across the incident set — all four already
in the canonical list of §3:
1. **Heat of compression** — "When a cylinder valve is first opened, high
   pressure gas flows into the mechanism and rapidly recompresses."
2. **Contaminant ignition** — heat of compression igniting foreign contaminants.
3. **Particle impact** — "Gas flows extremely fast when a valve is opened (close
   to the speed of sound!)" propelling metallic particles.
4. **Promoted ignition** — fire propagating downstream through the gas flow, i.e.
   the kindling chain.

**The material [B].** All 11 involved regulators "primarily constructed out of
aluminum." WHA's stated thresholds — aluminium igniting at pressures as low as
**170 kPa (25 psi)** while brass resists to **70 MPa (10,000 psi)** — agree
closely with the independently sourced NASA MSFC data in §2.2 (Al 4043 burning
at 25 psi; brass at 10,000 psi). Two independent sources converging is worth
noting in the course.

**Engineering lesson.** The most encouraging incident in this file, because the
loop closed. The investigations produced **ASTM G175**, *Standard Test Method for
Evaluating the Ignition Sensitivity and Fault Tolerance of Oxygen Pressure
Regulators Used for Medical and Emergency Applications*, approved 2003, current
edition **G175-24** **[A]**. WHA report that since approval "there have been no
new incidents recorded involving medical oxygen regulators that met the
requirements of ASTM G175" **[B]**.

Note also the standards archaeology **[A]**: **PS127-00**, a provisional standard
covering the same subject, was withdrawn in 2003 — the year G175 was approved.
The provisional became the full standard.

The design principle: **fault tolerance**, not just material selection. G175
tests whether a regulator survives an ignition event, not merely whether it
avoids one.

---

### 7.5 Industrial oxygen valve and pipeline fires

Two citable works. **Bibliographic data is [A]** (CrossRef); **content detail is
weaker and marked accordingly**, because both are paywalled and I could not read
them.

**(a) Lautkaski, R. (2008), "Investigation of a large industrial oxygen valve
fire", *Journal of Loss Prevention in the Process Industries*, **21**(4),
466–471. DOI **10.1016/j.jlp.2008.03.002**. [A — bibliographic, verified via
CrossRef and Semantic Scholar]**

Reported content **[C]**: a 300 mm butterfly valve in an industrial oxygen
pipeline ignited during system start-up, killing three people; the valve was
apparently stuck and operators used pipe tongs to open it. **This description
comes from a search summary, not from the paper.** The publisher elides the
abstract. If the course uses this incident, obtain the paper.

If it holds up, the lesson is a good one: forcing a stuck valve supplies exactly
the characteristic elements of galling/friction ignition (§3.3 item 6) — rubbing
surfaces, relative motion, and high loads — and start-up supplies the rapid
pressurisation and particle-laden first flow.

**(b) Newton, B. and Forsyth, E.T., "Cause And Origin Analyses Of Two Large
Industrial Oxygen Valve Fires", in *Flammability and Sensitivity of Materials in
Oxygen-Enriched Atmospheres: 10th Volume*, ASTM, 2003, pp. 268–289. DOI
**10.1520/STP11594S**. [A — bibliographic, verified via CrossRef]** Content not
read; no claims made here.

Also identified but not read: **ASTM STP11595S**, "Oxygen Fire Cause and Origin
Analysis of the CUMA V2 Underwater Breathing Apparatus" —
https://store.astm.org/stp11595s.html **[B]** (listing exists).

**The ASTM *Flammability and Sensitivity of Materials in Oxygen-Enriched
Atmospheres* STP series is the main body of published oxygen fire case
literature.** For a course building an incident library, that series plus
**ASTM G145-08(2023)**, *Standard Guide for Studying Fire Incidents in Oxygen
Systems*, is the right place to start. G145's stated purpose is to help
investigators "select a direct cause hypothesis and to avoid conclusions based
on hypotheses... that have proven faulty in the past," and it recommends
multidisciplinary teams. **[A]**

---

### 7.6 Incidents I deliberately did not include

Several oxygen incidents are widely retold online without documentation I could
verify. They are omitted rather than included with a hedge. If the course wants
more incidents, the route is the ASTM STP series above and NASA WSTF's published
work — not general web sources.

---

## 8. Open items — what still needs verifying

Ordered by how much they matter to Module 6.

1. **Buy and read ASTM G88-21.** It is the design guide, it is the source for
   design controls per mechanism, and everything in §3's Controls rows and §4.5
   is currently derived or secondary. This is the biggest single gap. **[C]**
2. **Read ASTM MNL36 2nd ed.** It is the source NASA points to for material
   flammability and ignition data, and it is where an air-versus-oxygen MIE
   comparison would live if one exists in the oxygen-safety literature. **[C]**
3. **Pressurisation rate limits.** No verified numeric limit found (§4.5). Check
   G88-21 and CGA G-4.4 6th ed.
4. **MIE, AIT and flame temperature in oxygen vs air.** No citable quantitative
   comparison found (§2.2). Direction of effect is solid; magnitudes are not.
5. **NFPA 55 2026 edition** — confirm against NFPA directly, and discard the
   unverified issue/effective dates noted in §1.6. **[C]**
6. **CGA editions** — G-4 (11th, 2015 r2020), G-4.1 (7th, 2018), G-4.4 (6th,
   2020) came from CGA's *legacy* catalogue. Confirm on the live site. **[B]**
7. **Lautkaski (2008)** — obtain the paper before using the valve fire incident
   (§7.5a). **[C]**
8. **Apollo 13 direct quotes** — the Cortright "unusual combination of mistakes"
   quote and the "remove all electrical equipment from inside the pressure
   vessel" recommendation should be pulled from TM-X-65270 itself (NTRS
   19700076776) rather than from secondary reporting. **[B]**
9. **Apollo 1 "overconfidence and complacency" finding** — same: quote from the
   report, not from a summary. **[B]**
10. **EIGA Doc 04/26 Figure 2** — reproduce the figure under EIGA's reproduction
    permission rather than transcribing values (§2.2). **[C]** for any
    transcribed number.
11. **NASA-STD-6016** — cited by TM-2007-213740 as co-requiring oxygen
    compatibility assessments, but not verified in this pass. Worth adding to
    the inventory.
12. **NASA-STD-6001B Change 3 date** — 9 June vs 25 June 2025 discrepancy
    (§1.4). Minor.

---

## 9. Source list

Every URL below was fetched successfully during compilation on 2026-09-08 unless
noted. ASTM standard pages under `www.astm.org/Standards/` return HTTP 403 to
automated fetches; the `store.astm.org` product pages work and were used instead.

**NASA primary**
- NASA/TM-2007-213740, Rosales, Shoffstall & Stoltzfus, *Guide for Oxygen
  Compatibility Assessments on Oxygen Components and Systems*, March 2007 —
  https://ntrs.nasa.gov/api/citations/20070016582/downloads/20070016582.pdf
- NASA-STD-6001B w/Change 3, *Flammability, Offgassing, and Compatibility
  Requirements and Test Procedures*, June 2025 —
  https://standards.nasa.gov/standard/NASA/NASA-STD-6001
- Davis, S.E., *An Elementary Overview of the Selection of Materials for Service
  in Oxygen-Enriched Environments*, NASA MSFC M12-1549, ASTM G04 Symposium,
  19 September 2012 —
  https://ntrs.nasa.gov/api/citations/20120015993/downloads/20120015993.pdf
- Graf, J., *Oxygen Candle Background for Subs and Space*, NASA JSC-CN-38913,
  February 2017 —
  https://ntrs.nasa.gov/api/citations/20170002051/downloads/20170002051.pdf
- Anderson, B.L., *A Case Study of the Failure on Apollo 13*, NASA MSFC
  M11-0349, 8 August 2011 —
  https://ntrs.nasa.gov/api/citations/20110015690/downloads/20110015690.pdf
- *Report of Apollo 204 Review Board*, NASA-TM-84105, 5 April 1967 —
  https://ntrs.nasa.gov/api/citations/19820066930/downloads/19820066930.pdf
- Apollo 204 Findings, Determinations and Recommendations (NASA-hosted) —
  https://www.nasa.gov/wp-content/uploads/static/history/Apollo204/find.html
- *Report of Apollo 13 Review Board*, NASA-TM-X-65270, 15 June 1970 —
  https://ntrs.nasa.gov/api/citations/19700076776/downloads/19700076776.pdf
- NASA WSTF, Oxygen Compatibility Assessment and Hazards Evaluation —
  https://www.nasa.gov/centers-and-facilities/white-sands/oxygen-compatibility-assessment-and-hazards-evaluation/
- NASA WSTF, Ignition Susceptibility and Flammability —
  https://www.nasa.gov/centers-and-facilities/white-sands/ignition-susceptibility-and-flammability/

*NTRS metadata for all of the above was independently verified through the NTRS
citation API, e.g. `https://ntrs.nasa.gov/api/citations/20070016582`.*

**ASTM**
- Oxygen Enriched Atmospheres standards listing (edition source of record) —
  https://store.astm.org/products-services/standards-and-publications/standards/oxygen-enriched-atmospheres-standards.html
- MNL36 2nd ed. — https://store.astm.org/mnl36-2nd-eb.html
- G88-21 — https://store.astm.org/g0088-21.html
- G93/G93M (showing -19 superseded by -25) — https://store.astm.org/g0093_g0093m-19.html
- G63-15(2023) — https://store.astm.org/g0063-15r23.html
- G94-22 — https://store.astm.org/g0094-22.html
- G72/G72M-24 — https://store.astm.org/g0072_g0072m-24.html
- G74-13(2021) — https://store.astm.org/g0074-13r21.html
- G86-17(2025) — https://store.astm.org/g0086-17r25.html
- G128/G128M-15(2023) — https://store.astm.org/g0128_g0128m-15r23.html
- G145-08(2023) — https://store.astm.org/g0145-08r23.html

**Other standards bodies**
- EIGA Doc 04/26, *Fire Hazards of Oxygen and Oxygen-Enriched Atmospheres*,
  June 2026 — https://www.eiga.eu/uploads/documents/DOC004.pdf
  *(EIGA permits reproduction with acknowledgement.)*
- EIGA Doc 13/20, *Oxygen Pipeline and Piping Systems* —
  https://www.eiga.eu/uploads/documents/DOC013.pdf
- CGA G-4 — https://legacy.cganet.com/Publication/Details.aspx?id=G-4
- CGA G-4.1 — https://legacy.cganet.com/Publication/Details.aspx?id=G-4.1
- CGA G-4.4 — https://legacy.cganet.com/Publication/Details.aspx?id=G-4.4
- NFPA 55 product page — https://www.nfpa.org/product/nfpa-55-code/p0055code

**Engineering guidance and case material**
- LANL Engineering Standards Manual STD-342-100, Chapter 17 Pressure Safety,
  Section PS-GUIDE, Attachment GUIDE-2, *Oxygen System Design Guide*, Rev. 0,
  22 September 2023 —
  https://engstandards.lanl.gov/esm/pressure_safety/Att-GUIDE-2-R0.pdf
- WHA International, medical oxygen regulator case study —
  https://wha-international.com/case-study-medical-oxygen-regulators/
- WHA International, guide to the ASTM G93-2025 update —
  https://wha-international.com/guide-to-astm-g93-2025/
- Lautkaski, R. (2008), *J. Loss Prev. Process Ind.* **21**(4) 466–471 —
  doi:10.1016/j.jlp.2008.03.002
- Newton, B. & Forsyth, E.T. (2003), ASTM STP, pp. 268–289 —
  doi:10.1520/STP11594S

**Note on method.** Several NASA and EIGA PDFs do not survive automated
HTML-conversion and required direct decompression of their content streams to
read. Where a source is quoted above, the text was read from the document
itself, not from a search-engine summary; where only a summary was available,
the claim is labelled **B** or **C** and says so.
