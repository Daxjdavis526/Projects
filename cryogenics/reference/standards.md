# Standards register

**The single source of standards citations for this course.** Every designation,
title, edition and date below was checked against a live source on **2026-09-08**.
Compiled from `_verify-standards.md`, `_verify-oxygen.md`, `_verify-methane.md`
and `_verify-hardware.md`, which remain in this directory as the audit trail.

## How to use this file

1. **Every standards citation in a module comes from here, and must carry an
   edition and a year.** "CGA P-12" alone is not a citation. "CGA P-12, 7th
   edition (January 2023)" is.
2. **Use the title in the Title column, not the one you remember.** Several
   widely-repeated titles are the previous edition's, or plain wrong. The
   [corrections section](#corrections-to-commonly-cited-designations) lists every
   one that was found.
3. **Do not reproduce the content of a paywalled standard.** Cite it as the
   authority and say what it governs. Most of the ASTM, CGA, NFPA and ASME
   documents here were verified from the publisher's catalogue record only; that
   is expected, and the confidence column says so.
4. **Standards move.** Re-check any row before it goes into a graded assessment,
   and read [could not confirm](#could-not-confirm) first — several rows have a
   known open question attached.

### Confidence key

| | Meaning |
|---|---|
| **A** | Confirmed on the publisher's or issuing agency's own page (cganet.com, astm.org, asme.org, nfpa.org / link.nfpa.org, osha.gov, ecfr.gov, standards.nasa.gov, nasa.gov, ntrs.nasa.gov, nist.gov). |
| **B** | Confirmed on a reputable secondary page only (ANSI Webstore, Accuris, GlobalSpec, Google Books, a publisher's retail listing). The publisher's page was unreachable or did not state the edition. |
| **C** | Could not confirm. The row says exactly what is unverified. |

### Standing caveats

- **Several publishers block automated fetching.** osha.gov, ecfr.gov and the ANSI
  Webstore all returned 403 or a bot wall. Where that happened, designations and
  titles were read from the agency's own page titles as returned by search. Those
  are still agency-authored strings, so they are graded **A**, but the page body
  was not read. **Anyone drafting module content from an OSHA or CFR section must
  open it in a browser first.**
- **NFPA product and LiNK pages render client-side** and mostly returned no
  edition string to a fetch. NFPA editions below are graded accordingly.
- **CGA's public catalogue now lives at `legacy.cganet.com`.** It is CGA's own and
  is the best public source, but it may lag a very recent revision. The member
  portal requires a login and could not be used as a cross-check.

---

## 1. Cryogenic fluids, general

| Designation | Title | Body | Current edition / date | Status | What it governs | Link | Conf. |
|---|---|---|---|---|---|---|---|
| **CGA P-12** | Guideline for Safe Handling of Cryogenic and Refrigerated Liquids | Compressed Gas Association | **7th edition, January 2023** | Current. Supersedes 6th ed. (2017). | General properties, transport, storage, handling and use of industrial cryogenic and refrigerated liquids — O₂, N₂, Ar, H₂, He, plus Ne/Kr/Xe. The introductory document for cryogen handling. **Note the retitle — see corrections §1.** | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=P-12) | **A** |
| **CGA P-1** | Standard for Safe Handling of Compressed Gases in Containers | Compressed Gas Association | **13th edition, January 2022** | Current. Supersedes 12th ed. (2015). | User-side practice for compressed gases in containers: filling, maintenance, moving, storing, connecting. Also carries supplier/distributor precautions. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=P-1) | **A** |
| **CGA P-18** | Standard for Bulk Inert Gas Systems (an American National Standard) | CGA (ANSI-approved) | **5th edition, September 2020** | Current. Supersedes 4th ed. (2013). | Siting, equipment selection, installation, start-up, maintenance and removal of bulk inert gas supply systems > 20 000 scf (566 m³) at ≤ 15 000 psi. Covers the LN₂/LAr side of a test stand. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=P-18) | **A** |
| **CGA S-1.1** | Pressure Relief Device Standards — Part 1 — Cylinders for Compressed Gases | Compressed Gas Association | **18th edition, August 2026** | Current. | PRD requirements for DOT/TC **cylinders** — including a DOT-4L cryogenic cylinder's relief devices. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=S-1.1) | **A** |
| **CGA S-1.2** | Pressure Relief Device Standards — Part 2 — Portable Containers for Compressed Gases | Compressed Gas Association | **11th edition, September 2024** | Current. Supersedes 10th ed. (2019). | PRD requirements for DOT/TC **portable containers** — cargo tanks and portable tanks, including refrigerated and cryogenic fluids. Incorporated by reference at 49 CFR 173.318 for cryogenic cargo-tank relief sizing. **This — not S-1.3 — is the portable/cryogenic-container PRD standard.** | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=S-1.2) | **A** |
| **CGA S-1.3** | Pressure Relief Device Standards — Part 3 — Stationary Storage Containers for Compressed Gases | Compressed Gas Association | **10th edition, September 2024** | Current. Supersedes 9th ed. (2020). | PRD requirements for **stationary** ASME-code storage containers — the fixed LOX/LCH₄/LN₂ dewars on a pad, not anything that moves on a highway. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=S-1.3) | **A** |
| **NFPA 55** | Compressed Gases and Cryogenic Fluids Code | NFPA | **2026 edition** | Current. Prior edition 2023. | Installation, storage, use and handling of compressed gases and cryogenic fluids in portable and stationary cylinders, containers, equipment and tanks, in all occupancies. **The adoptable code a fire marshal will actually enforce.** | [nfpa.org](https://www.nfpa.org/product/nfpa-55-code/p0055code) | **B** — 2026 edition confirmed by Google Books (publisher NFPA, 2026) and NFPA's own Fall-2025-cycle second draft report; NFPA's product and LiNK pages render client-side and returned no edition string. |
| **ASME BPVC Section VIII, Division 1** | BPVC Section VIII — Rules for Construction of Pressure Vessels, Division 1 | ASME | **2025 edition** | Current. BPVC runs a two-year cycle (2021 → 2023 → 2025). | **Governs the vessel.** Design, fabrication, inspection, testing and certification of pressure vessels above 15 psig — LOX and LCH₄ run tanks, receivers, ASME-stamped dewars. Divisions 2 and 3 are alternative rules for higher pressure; Division 1 is the default. | [asme.org](https://www.asme.org/codes-standards/find-codes-standards/bpvc-viii-1-bpvc-section-viii-rules-construction-pressure-vessels-division-1/2025) | **A** |
| **ASME B31.3** | Process Piping | ASME | **2024 edition** | Current. Prior edition 2022. | **Governs the piping between vessels.** Materials, design, fabrication, assembly, erection, examination, inspection and testing of process piping; its scope statement names cryogenic plants and fluids explicitly. **The 2024 edition makes ASME B31J mandatory for flexibility and stress-intensification factors — see corrections §13.** | [asme.org](https://www.asme.org/codes-standards/find-codes-standards/b31-3-process-piping/2024) | **A** |
| **MSS SP-134** | Valves for Cryogenic Service Including Requirements for Body/Bonnet Extensions | MSS | 2006a (as previewed) | Current per the ANSI preview page. | Extended-bonnet requirements for cryogenic valves — the standard behind "why the stem is that long". | [ANSI preview](https://webstore.ansi.org/preview-pages/MSS/preview_MSS+SP-134-2006a.pdf) | **B** — read from the ANSI preview page only. |
| **BS 6364** | Specification for valves for cryogenic service | BSI | not verified | Named in the hardware verification pass, not checked against BSI. | The British counterpart to MSS SP-134 for cryogenic valve construction and testing. | — | **C** — designation and title only; edition unverified. |
| **AIGA 106/19** | Vacuum-Jacketed Piping in Liquid Oxygen Service | Asia Industrial Gases Association | 2019 | Current per AIGA's own hosted PDF. | The industry standard for VJ piping in LOX service: flexibility analysis, annulus relief, bayonet installation, frost/ice acceptance criteria, minimum 1000 bellows cycles. **Freely downloadable** — unusual and useful. | [asiaiga.org](https://asiaiga.org/uploaded_docs/en_AIGA_106_19_Vacuum-Jacketed_Piping_in_Liquid_Oxygen_Service.pdf) | **A** |
| **ASTM C740** | Standard Guide for Evacuated Reflective Insulation in Cryogenic Service | ASTM International | not verified | Named by NASA KSC as the applicable MLI thermal-test guide. | The test framework for multilayer insulation performance. | [store.astm.org](https://store.astm.org/standards/c740) | **C** — designation and applicability cited by an A-source (Fesmire/KSC); ASTM record not read. |
| **ISA-5.1** | Instrumentation Symbols and Identification | International Society of Automation | 2022 (per ISA's own InTech coverage of the revision) | Current. | **The tag scheme every P&ID in this course uses** — PT, TT, FT, LT, PSV, AT bubbles and line conventions. | [isa.org](https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa5) | **B** — ISA's committee and InTech pages confirm the standard and the revision; the document itself is paywalled and was not read. |

### 1a. 49 CFR / DOT — cryogenic containers in transport

Regulator: **PHMSA, U.S. Department of Transportation.** The Hazardous Materials
Regulations are amended continuously; there is **no edition year to cite** — cite
the *current* eCFR text and the date you consulted it. eCFR redirects automated
fetches to a bot wall, so these titles were read from eCFR's own page titles.

| Designation | Title | Status | What it governs | Link | Conf. |
|---|---|---|---|---|---|
| 49 CFR 173.315 | Compressed gases in cargo tanks and portable tanks | In force | Preparation and packaging of liquefied compressed gases for highway transport. | [ecfr.gov](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-173/subpart-G/section-173.315) | **A** |
| 49 CFR 173.316 | Cryogenic liquids in cylinders | In force | Cryogens in cylinders; requires a pressure-control system per §173.301(f) preventing the cylinder going liquid-full. Authorises DOT-4L cylinders, carried vertically. | [ecfr.gov](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-173/subpart-G/section-173.316) | **A** |
| 49 CFR 173.318 | Cryogenic liquids in cargo tanks | In force | Cryogens in cargo tanks: marked rated holding time, refill restrictions for flammable cryogens, relief flow capacity (references CGA S-1.2). | [ecfr.gov](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-173/subpart-G/section-173.318) | **A** |
| 49 CFR 173.320 | Cryogenic liquids; exceptions | In force | **The exception most labs live under:** atmospheric gases and helium in dewars that cannot exceed 25.3 psig at ambient are largely outside the subchapter when moved by motor vehicle or railcar. | [ecfr.gov](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-173/subpart-G/section-173.320) | **A** |
| 49 CFR 178.57 | Specification 4L welded insulated cylinders | In force | The DOT-4L cryogenic cylinder specification: ≤ 1000 lb water capacity, 40–500 psig service pressure, per-gas design service temperatures (O₂ and N₂ −320 °F, H₂ −423 °F, He −452 °F). | [ecfr.gov](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-178/subpart-C/section-178.57) | **A** |
| 49 CFR 178.338 | Specification MC-338; insulated cargo tank motor vehicle | In force | The MC-338 cryogenic tanker specification, including the insulation requirement holding tank pressure below PRV set pressure for the marked holding time at 85 °F average ambient. | [ecfr.gov](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-178/subpart-J/section-178.338) | **A** |
| 49 CFR 180.407 | Requirements for test and inspection of specification cargo tanks | In force | Periodic external/internal visual, leakage, pressure, thickness and relief-device testing by a §180.409-qualified inspector. Flammable-cryogen tanks additionally get a holding-time determination after each shipment (§180.405). | [ecfr.gov](https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-C/part-180/subpart-E/section-180.407) | **A** |

### 1b. OSHA — 29 CFR Part 1910 (General Industry)

Agency: **Occupational Safety and Health Administration, U.S. Department of
Labor.** OSHA standards carry **no edition year**; the current text binds.
osha.gov returns 403 to automated fetches (see standing caveats).

| Designation | Title | Status | What it governs | Link | Conf. |
|---|---|---|---|---|---|
| 29 CFR 1910.101 | Compressed gases (general requirements) | In force | Subpart H. Baseline cylinder inspection, handling, storage and use; pulls in CGA pamphlets by reference. | [osha.gov](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.101) | **A** |
| 29 CFR 1910.104 | Oxygen | In force | Subpart H. Bulk oxygen systems — siting, separation distances from flammables, installation. Directly relevant to a LOX farm. | [osha.gov](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.104) | **A** |
| 29 CFR 1910.119 | Process safety management of highly hazardous chemicals | In force | Subpart H. The PSM element list — PHA, mechanical integrity, management of change — that the hazard-analysis module is built on. | [osha.gov](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.119) | **A** |
| 29 CFR 1910.134 | Respiratory protection | In force | Subpart I. Carries the same 19.5 % / 23.5 % oxygen band as 1910.146. | [osha.gov](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.134) | **A** |
| 29 CFR 1910.146 | Permit-required confined spaces | In force | Subpart J. Entry programme, permits, atmospheric testing, attendants, rescue. **The controlling standard for oxygen-deficient (inert-purged) and oxygen-enriched spaces**, and the source of the 19.5 %/23.5 % definitions in `properties.md` §11.4. | [osha.gov](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.146) | **A** |
| 29 CFR 1910.147 | The control of hazardous energy (lockout/tagout) | In force | Subpart J. Servicing where unexpected energisation or **release of stored energy** could injure — stored pressure and trapped cryogenic liquid, not just electrical isolation. | [osha.gov](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147) | **A** |
| 29 CFR 1910.253 | Oxygen-fuel gas welding and cutting | In force | Subpart Q. Cylinder storage separation, manifolds, regulators, hose and torch practice for oxygen-fuel work. | [osha.gov](https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.253) | **A** |

---

## 2. Oxygen

| Designation | Title | Body | Current edition / date | Status | What it governs | Link | Conf. |
|---|---|---|---|---|---|---|---|
| **CGA G-4** | Oxygen | Compressed Gas Association | **11th edition, March 2015; reaffirmed May 2020** | Current per CGA's catalogue. | The base oxygen document: properties, hazards, materials, general handling of gaseous and liquid oxygen. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=G-4) | **A** |
| **CGA G-4.1** | Cleaning of Equipment for Oxygen Service | Compressed Gas Association | **7th edition, August 2018** — see [could not confirm](#could-not-confirm) item 1 | Current per CGA's catalogue; a post-2018 edition may exist. | Cleaning methods and acceptance for all surfaces contacting fluid > 23.5 % oxygen: tanks, road tankers, rail cars, vessels, compressors, pumps, piping, valves, instrumentation. Internationally harmonised; referenced by NFPA. Supersedes CGA PS-13. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=G-4.1) | **A** for the 7th/2018 edition; **C** for whether an 8th exists. |
| **CGA G-4.3** | Commodity Specification for Oxygen | Compressed Gas Association | not verified | — | Where oxygen purity and quality grades live. Relevant when a module discusses purge-gas or propellant acceptance. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=G-4.3) | **B** — existence and subject confirmed; edition not checked. |
| **CGA G-4.4** | Oxygen Pipeline and Piping Systems | Compressed Gas Association | **6th edition, August 2020** | Current. Harmonised with EIGA Doc 13. | Design and installation of gaseous oxygen transmission and distribution piping — velocity limits, materials, impingement sites. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=G-4.4) | **A** |
| **ASTM G63-15(2023)** | Standard Guide for Evaluating Nonmetallic Materials for Oxygen Service | ASTM (G04.02) | **G63-15, reapproved 2023** | Active. | Selecting **nonmetals** — seals, seats, lubricants, coatings — for oxygen and oxygen-enriched service. Explicitly *not* an approval specification. | [store.astm.org](https://store.astm.org/standards/g63) | **A** |
| **ASTM G72/G72M-24** | Standard Test Method for Autogenous Ignition Temperature of Liquids and Solids in a High-Pressure Oxygen-Enriched Environment | ASTM (G04.01) | **2024** | Active. Supersedes G72/G72M-15. | AIT test: 2.1–20.7 MPa (300–3000 psi), standard 10.3 MPa (1500 psi), 60–500 °C, 0.5–100 % O₂. **Note the dual G72/G72M designation.** | [store.astm.org](https://store.astm.org/standards/g72) | **A** |
| **ASTM G74-13(2021)** | Standard Test Method for Ignition Sensitivity of Nonmetallic Materials and Components by **Gaseous Fluid Impact** | ASTM International | **G74-13, reapproved 2021** | Active. | **The pneumatic-impact / adiabatic-compression test** — the rapid-pressurisation hazard at a fast-opening valve. Tests 5 mm and 14 mm bore configurations to 69 MPa. **Commonly confused with G86 — see corrections §5.** | [store.astm.org](https://store.astm.org/standards/g74) | **A** |
| **ASTM G86-17(2025)** | Standard Test Method for Determining Ignition Sensitivity of Materials to **Mechanical Impact** in Ambient Liquid Oxygen and Pressurized Liquid and Gaseous Oxygen Environments | ASTM International | **G86-17, reapproved 2025** | Active. | **The LOX mechanical-impact test**, 0–68.9 MPa, max impact energy 98 J. The canonical screen for nonmetals in liquid oxygen. | [store.astm.org](https://store.astm.org/standards/g86) | **A** |
| **ASTM G88-21** | Standard Guide for Designing Systems for Oxygen Service | ASTM International | **2021** | Active. Supersedes G88-13e1. | **The authoritative system-level oxygen design guide:** velocity, particle impact, adiabatic compression, ignition mechanisms, configuration. Paywalled and not read during verification — the biggest single evidence gap in the oxygen material. | [store.astm.org](https://store.astm.org/standards/g88) | **A** for the bibliographic record; content not read. |
| **ASTM G93/G93M-25** | Standard **Guide** for **Cleanliness Levels and Cleaning Methods** for Materials and Equipment Used in Oxygen-Enriched Environments | ASTM (G04.02) | **2025** | Active. Supersedes G93/G93M-19. | Cleanliness level definitions and coding, mechanical and chemical cleaning methods, verification, contamination control. The counterpart to CGA G-4.1. **Retitled and re-designated in 2025 — see corrections §4.** | [store.astm.org](https://store.astm.org/g0093_g0093m-25.html) | **A** |
| **ASTM G94-22** | Standard Guide for Evaluating Metals for Oxygen Service | ASTM International | **2022** | Active. Supersedes G94-05(2014). | Selecting **metals** for oxygen service. The metallic counterpart to G63. | [store.astm.org](https://store.astm.org/standards/g94) | **A** |
| **ASTM G124-18** | Standard Test Method for Determining the Combustion Behavior of Metallic Materials in Oxygen-Enriched Atmospheres | ASTM International | **2018** | Active. | **The promoted-ignition test** — where metal flammability numbers come from. Acceptance criterion: 1/8 in (3.2 mm) rod, ≥ 4 in long, ignited at the bottom by an Al or Mg promoter; self-sustained combustion is deemed to occur if the sample burns more than 1.2 in (30 mm). | [store.astm.org](https://store.astm.org/standards/g124) | **A** |
| **ASTM G128/G128M-15(2023)** | Standard Guide for Control of Hazards and Risks in **Oxygen Enriched Systems** | ASTM International | **G128/G128M-15, reapproved 2023** | Active. | Programmatic hazard and risk control across an oxygen system's life cycle; adiabatic compression is a stated focus area. **Note the dual designation and the exact title — see corrections §5.** | [store.astm.org](https://store.astm.org/standards/g128) | **A** |
| **ASTM G145-08(2023)** | Standard Guide for Studying Fire Incidents in Oxygen Systems | ASTM International | **G145-08, reapproved 2023** | Active. | Fire-investigation method: how to select a direct-cause hypothesis and avoid hypotheses that have proven faulty. **The right starting point for an incident library.** | [store.astm.org](https://store.astm.org/g0145-08r23.html) | **A** |
| **ASTM G175-24** | Standard Test Method for Evaluating the Ignition Sensitivity and Fault Tolerance of Oxygen Pressure Regulators Used for Medical and Emergency Applications | ASTM International | **2024** | Active. Approved 2003; superseded provisional PS127-00 (withdrawn 2003). | The standard that came out of the aluminium medical-regulator fire investigations. Tests **fault tolerance** — whether a regulator survives an ignition event — not merely whether it avoids one. | [store.astm.org](https://store.astm.org/standards/g175) | **A** |
| **ASTM G127-15(2023)** | Standard Guide for the Selection of Cleaning Agents for Oxygen-Enriched Systems | ASTM International | **G127-15, reapproved 2023** | Active. | Companion to G93 on cleaning-agent selection. | [store.astm.org](https://store.astm.org/standards/g127) | **A** |
| **ASTM G126-16(2023)** | Standard Terminology Relating to Compatibility and Sensitivity of Materials in Oxygen Enriched Atmospheres | ASTM International | **G126-16, reapproved 2023** | Active. | Settles vocabulary disputes — useful when a module defines "compatible". | [store.astm.org](https://store.astm.org/standards/g126) | **A** |
| **ASTM G114-21** | Standard Practices for Evaluating the Age Resistance of Polymeric Materials Used in Oxygen Service | ASTM International | **2021** | Active. | Ageing of soft goods in oxygen service. | [store.astm.org](https://store.astm.org/standards/g114) | **A** |
| **ASTM G120-15(2023)** | Determination of Soluble Residual Contamination by Soxhlet Extraction | ASTM International | **G120-15, reapproved 2023** | Active. | One of the three NVR quantification methods behind an oxygen cleanliness verification. | [store.astm.org](https://store.astm.org/standards/g120) | **A** |
| **ASTM G136-03(2023)e1** | Determination of Soluble Residual Contaminants in Materials by Ultrasonic Extraction | ASTM International | **G136-03, reapproved 2023, e1** | Active. | As above. | [store.astm.org](https://store.astm.org/standards/g136) | **A** |
| **ASTM G144-01(2022)** | Determination of Residual Contamination of Materials and Components by Total Carbon Analysis Using a High Temperature Combustion Analyzer | ASTM International | **G144-01, reapproved 2022** | Active. | As above. | [store.astm.org](https://store.astm.org/standards/g144) | **A** |
| **ASTM MNL36 (MNL36-2ND)** | Safe Use of Oxygen and Oxygen Systems: Handbook for Design, Operation, and Maintenance | ASTM International | **2nd edition, 2007.** Editors H. D. Beeson, S. R. Smith, W. F. Stewart (NASA WSTF). ISBN 978-0-8031-4470-5; DOI 10.1520/MNL36-2ND-EB; 137 pp. | Current. **No 3rd edition found.** | The practical oxygen-systems handbook: ignition mechanisms, material flammability data, the compatibility-assessment process, design principles, cleaning, storage, transfer. **This is where the cancelled NASA NSS 1740.15 content went — see corrections §8.** | [store.astm.org](https://store.astm.org/mnl36-2nd-eb.html) | **A** |
| **ASTM D2512-17** | Compatibility of Materials with Liquid Oxygen (Impact Sensitivity Threshold and Pass-Fail Techniques) | ASTM International | **WITHDRAWN 2023** | **Withdrawn.** | The historic ambient-pressure LOX mechanical-impact test, referenced heavily throughout older NASA and ASTM literature. **Frame any discussion of it historically — see corrections §6.** | [store.astm.org](https://store.astm.org/standards/d2512) | **A** |
| **ASTM PS127-00** | Provisional standard for medical/emergency oxygen regulators | ASTM International | **WITHDRAWN 2003** | **Withdrawn**, superseded in function by G175. | Standards archaeology worth one sentence: the provisional became the full standard the year it was withdrawn. | — | **A** |
| **NASA-STD-6001B w/Change 3** | Flammability, Offgassing, and Compatibility Requirements and Test Procedures | NASA (OCE-endorsed) | **Revision B (26 Aug 2011), Change 3 dated June 2025**; revalidated 07 Apr 2016 | **ACTIVE.** | Evaluation, testing and selection of materials for space vehicles, associated GSE, and facilities used in assembly, test and flight ops. **Test 17 (promoted combustion)** is the metals screen cited by KSC's oxygen material list. Formerly NHB 8060.1. | [standards.nasa.gov](https://standards.nasa.gov/standard/NASA/NASA-STD-6001) | **A** for the revision; **B** for whether Change 3 is dated 9 or 25 June 2025 — cite "Revision B w/Change 3, June 2025". |
| **EIGA Doc 04/26** | Fire Hazards of Oxygen and Oxygen-Enriched Atmospheres | European Industrial Gases Association | **Published June 2026**, revision of Doc 04/18 | Current. | **Free, quotable, and the best non-paywalled framing of the oxygen hazard.** EIGA explicitly permits reproduction with acknowledgement, which makes it unusually easy to use in courseware. | [eiga.eu](https://www.eiga.eu/uploads/documents/DOC004.pdf) | **A** |
| **EIGA Doc 13/20** | Oxygen Pipeline and Piping Systems | EIGA | **2020** | Current. Harmonised with CGA G-4.4. | The European counterpart to CGA G-4.4; free. | [eiga.eu](https://www.eiga.eu/uploads/documents/DOC013.pdf) | **B** — URL resolves; not read in full. |
| **EIGA Doc 44/18** | Hazards of Oxygen-Deficient Atmospheres | EIGA | **2018**, revision of Doc 44/09 | Current. | **The free equivalent of the paywalled CGA SB-2.** Source of the oxygen-concentration physiology table in `properties.md` §11.4, and of the OSHA 19.5 %/23.5 % cross-confirmation. | [eiga.eu](https://www.eiga.eu/uploads/documents/DOC044.pdf) | **A** |
| **EIGA/IGC Doc 33** | Cleaning of Equipment for Oxygen Service | EIGA | not verified | — | The European harmonised equivalent of CGA G-4.1, cited by the LANL oxygen design guide. | — | **B** — designation and subject reported by an A-source; EIGA record not opened. |
| **CGA SB-2** | Oxygen-Deficient Atmospheres | Compressed Gas Association | not verified | — | US equivalent of EIGA Doc 44. **Paywalled; superseded for this course by EIGA Doc 44/18**, which is free and states the same thresholds. | — | **B** |

---

## 3. Flammable gas, methane and area classification

| Designation | Title | Body | Current edition / date | Status | What it governs | Link | Conf. |
|---|---|---|---|---|---|---|---|
| **NFPA 59A** | Standard for the Production, Storage, and Handling of Liquefied Natural Gas (LNG) | NFPA | **2026 edition** | Current. Prior edition 2023. | Siting, design, construction, maintenance and operation of LNG facilities, and personnel training. Adopted by DOT and referenced by FERC. The 2026 edition expands electrical area classification, adds cybersecurity plan requirements, reorganises impounding and spill containment, and clarifies applicability to liquefied RNG and hydrogen blending. **The closest adoptable code to a bulk LCH₄ farm — but written for LNG plants, not test stands. Apply with judgement.** | [nfpa.org](https://www.nfpa.org/product/nfpa-59a-standard/p0059acode) | **B** — edition and change list confirmed on retail listings of the NFPA publication (ISBN 9781455932481) and the ANSI Webstore; NFPA's own page renders client-side. |
| **NFPA 2** | Hydrogen Technologies Code | NFPA | **2026 edition** | Current. | Generation, installation, storage, piping, use and handling of hydrogen as GH₂ and cryogenic LH₂. **In 2026, NFPA 2 no longer cross-references NFPA 55 for hydrogen — it now has full scope over hydrogen requirements itself.** | [link.nfpa.org](https://link.nfpa.org/all-publications/2/2026) | **A** — NFPA's own LiNK publication page is titled "2026 NFPA 2 — Hydrogen Technologies Code"; a TIA against the 2026 edition exists on NFPA's document server. |
| **NFPA 70 (NEC)**, Articles 500–506 | National Electrical Code | NFPA | **2026 edition**, issued by the NFPA Standards Council **20 Aug 2025**, effective **9 Sep 2025** | Current. | Art. 500 hazardous (classified) locations, Classes I–III, Divisions 1–2 (the foundation article); 501 Class I; 502 Class II; 503 Class III; 504 intrinsically safe systems; 505 Class I Zone 0/1/2; 506 zones for dusts/fibres. **LCH₄ and LH₂ areas are Class I.** The 2026 edition contains some requirements with delayed effective dates written into the code text. **See corrections §14 on the issue dates.** | [link.nfpa.org](https://link.nfpa.org/all-publications/70/2026) | **A** |
| **NFPA 497** | Recommended Practice for the Classification of Flammable Liquids, Gases, or Vapors and of Hazardous (Classified) Locations for Electrical Installations in Chemical Process Areas | NFPA | **2024 edition**, approved as an American National Standard 13 May 2023 | Current. A 2026-cycle revision is in development but not published. | **The document you actually use to draw the boundary:** gas group assignment (methane is Group D, hydrogen Group B), extent-of-classification figures — 2024 added figures for classification around pressure-relief-valve vents — and the "hazardous (classified) location" definition imported from the NEC. Feeds NEC Art. 500/505. Also the usual source of methane's 537 °C AIT. | [nfpa.org](https://www.nfpa.org/product/nfpa-497-recommended-practice/p0497code) | **B** for the edition (ANSI Webstore and the retail listing, ISBN 9781455930623). **See corrections §7 for a title discrepancy on NFPA's own page.** |
| **NFPA 68** | Standard on Explosion Protection by Deflagration Venting | NFPA | **2023 edition** | Current. | Design, location, installation, maintenance and use of deflagration vents. Relevant only for enclosed or indoor methane handling; an outdoor test stand generally does not vent-design under NFPA 68. | [nfpa.org](https://www.nfpa.org/codes-and-standards/nfpa-68-standard-development/68) | **B** — ANSI Webstore listing; NFPA's page returned no edition string. |
| **NFPA 69** | Standard on Explosion Prevention Systems | NFPA | **2024 edition** | Current. Supersedes 2019. | Minimum requirements for explosion *prevention* — inerting, oxidant concentration reduction, combustible concentration reduction, suppression, isolation. **The inert-purge discipline for methane systems traces here.** | [nfpa.org](https://www.nfpa.org/product/nfpa-69-standard/p0069code) | **B** — ANSI Webstore listing; NFPA's page returned no edition string. |
| **CGA G-5.4** | Standard for Hydrogen Piping Systems at User Locations | Compressed Gas Association | **6th edition, November 2019** | Current. | Hydrogen piping at user sites — materials, joints, supports, venting, purging. Its purge and vent discipline transfers directly to methane practice even though the document is hydrogen-specific. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=G-5.4) | **A** |
| **CGA P-96** | Reciprocating Cryogenic Pumps and Pump Installations for Hydrogen and Liquefied Natural Gas | Compressed Gas Association | **1st edition, May 2023** | Current. | **The one CGA document found that names LNG (methane) in its title.** Reciprocating cryogenic pump design and installation for flammable cryogens. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=P-96) | **A** |
| **CGA P-48** | Reciprocating Cryogenic Pumps and Pump Installations for Oxygen, Argon, and Nitrogen | Compressed Gas Association | **2nd edition, October 2021** | Current. | The oxidiser/inert companion to P-96. Included because the LOX-side pump rules differ materially from the fuel-side ones. | [legacy.cganet.com](https://legacy.cganet.com/Publication/Details.aspx?id=P-48) | **A** |
| **ANSI/AIAA G-095A-2017** | Guide to Safety of Hydrogen and Hydrogen Systems | AIAA (ANSI-approved) | **Revision A, 2017** (revision of AIAA G-095-2004) | Current. | **The successor to NASA's cancelled NSS 1740.16** — hydrogen system design, materials, operations, storage, transportation, detection, emergency procedures. 236 pp. Listed here rather than under NASA because NASA no longer publishes it. | [ANSI Webstore](https://webstore.ansi.org/standards/aiaa/ansiaiaa095a2017) | **B** — publisher-adjacent listings (ANSI Webstore, AIAA ARC DOI 10.2514/4.105197.001) confirm Rev A 2017; no newer revision found. |

---

## 4. NASA

### 4a. NASA Technical Standards (standards.nasa.gov)

| Designation | Title | Body | Current edition / date | Status | What it governs | Link | Conf. |
|---|---|---|---|---|---|---|---|
| **NASA-STD-8719.12B** | Safety Standard for Explosives, Propellants, and Pyrotechnics | NASA OSMA | **Revision B, document date 13 Jul 2026**, Change 0. NASA endorsement 23 May 2018. | **ACTIVE.** NASA Mandatory Standard. Rev A w/Change 2 (18 Mar 2021) is **superseded**. | Facilities developing, manufacturing, handling, storing, transporting, processing, testing or using explosives and **energetic liquids** for launch vehicles, rockets, missiles, static test apparatus and ammunition. Includes ESO and ordnance-handler training requirements. **The title is right; the revision letter is what people get wrong — see corrections §9.** | [standards.nasa.gov](https://standards.nasa.gov/standard/NASA/NASA-STD-871912) | **A** |
| **NASA-STD-8719.17D** | NASA Standard for Ground-Based Pressure Vessels and Pressurized Systems (PVS) | NASA OSMA | **Revision D, 26 Apr 2023.** Endorsed 9 Aug 2017. | **ACTIVE.** NASA Mandatory Standard. | Structural integrity of ground-based pressure vessels and pressurised systems, under NPD 8710.5. **This is the NASA document that actually governs a cryogenic test stand's tanks and lines**, and the one a NASA-facing course cites alongside ASME BPVC VIII and B31.3. | [standards.nasa.gov](https://standards.nasa.gov/standard/NASA/NASA-STD-871917) | **A** |
| **NASA-STD-8719.26** | NASA Requirements for Ground Based Non-Code Metallic Pressure Vessels | NASA OSMA | **Baseline, 11 May 2021**, Change 0. | **ACTIVE.** NASA Mandatory Standard. | Selection, application and design criteria for ground-based metallic pressure vessels **outside** ASME code construction — a common situation for research-built cryogenic hardware. | [standards.nasa.gov](https://standards.nasa.gov/standard/NASA/NASA-STD-871926) | **A** |
| **NASA-STD-6001B w/Change 3** | Flammability, Offgassing, and Compatibility Requirements and Test Procedures | NASA OCE | Rev B (2011), Change 3 (June 2025) | **ACTIVE.** | See §2. | [standards.nasa.gov](https://standards.nasa.gov/standard/NASA/NASA-STD-6001) | **A** |
| **JSC-67723** | Standard for the Control of Catastrophic Hazards in Human-Rated Spacecraft Propulsion Systems | NASA Johnson Space Center | **Basic, 27 April 2025**, Change 0 | **ACTIVE.** Not NASA-endorsed, not mandatory agency-wide. Cleared for public release. | Standards, practices and hazard mitigations applied early in the design and test of human-rated spacecraft propulsion systems. Directly on point for this course; recent and public. | [standards.nasa.gov](https://standards.nasa.gov/standard/JSC/JSC-67723) | **A** |
| **SSTD-8070-0091-FLUIDS** | SSC Requirements for Materials Used in LOX/GOX Service | NASA Stennis Space Center | **Revision A, 11 Mar 2019**; revalidated 11 Mar 2024 | **ACTIVE.** Not mandatory agency-wide. Public. | Material compatibility requirements for LOX and GOX service at SSC. **A concrete, citable, freely readable centre-level oxygen materials rule.** | [standards.nasa.gov](https://standards.nasa.gov/standard/SSC/SSTD-8070-0091-FLUIDS) | **A** |
| **KSC-KTI-5210 Rev C** | Material Selection List for Oxygen Service | NASA Kennedy Space Center, Materials and Processes Engineering Branch (NE-L4) | **Revision C.** Secondary sources give 7 Mar 2012; **the cover page carries no date.** | Hosted and publicly downloadable on standards.nasa.gov. | Materials selection for KSC GSE/GSS oxygen systems. Table 1 nonmetals (AIT, heat of combustion, oxygen index); Table 2 metals (promoted ignition per NASA-STD-6001B Test 17). Routes flammable materials into an Oxygen Compatibility Assessment per NASA/TM-2007-213740. Also documents NASA's rename of "Oxygen Hazard Analysis (OHA)" to "Oxygen Compatibility Assessment (OCA)". | [PDF on standards.nasa.gov](https://standards.nasa.gov/sites/default/files/standards/KSC/C/0/KSC-KTI-5210C.pdf) | **A** for designation, revision and title (read from the PDF cover). **C** for the effective date and current status — see [could not confirm](#could-not-confirm) item 7. |
| **NASA NPR 7123.1D, Appendix G** | NASA Systems Engineering Processes and Requirements — life-cycle reviews | NASA | Revision D | Active. | The life-cycle review gates (SRR, PDR, CDR, TRR and the rest) that the design-review module is framed around. | [nodis3.gsfc.nasa.gov](https://nodis3.gsfc.nasa.gov/displayDir.cfm?Internal_ID=N_PR_7123_001D_&page_name=AppendixG) | **A** |
| **NASA/SP-2010-580** | NASA System Safety Handbook, Volume 1 | NASA | 2010 | Current. | The agency's own framing of hazard analysis methods — the reference behind the FTA/FMEA/HAZOP treatment. Free on NTRS. | [NTRS PDF](https://ntrs.nasa.gov/api/citations/20120003291/downloads/20120003291.pdf) | **A** |

### 4b. NASA centre safety handbooks

| Designation | Title | Body | Current edition / date | Status | What it governs | Link | Conf. |
|---|---|---|---|---|---|---|---|
| **JPR 1700.1 Rev M PCN-1**, Ch. 6.4 | JSC Safety and Health Requirements — Ch. 6.4 "Working Safely with Cryogenic Fluids" | NASA Johnson Space Center | **Revision M, PCN-1, June 2026** | Current. Replaced Rev L. | **The best publicly available NASA centre-level cryogenic handling chapter:** certification to handle cryogens, asphyxiation labelling at room entrances, continuous ventilation of storage areas (including nights and weekends), venting practice. Related chapters: **6.10** Pressurized Gas and Liquid Systems; **6.12** Ground-Based Breathing Gases; **10.2** Test, Vacuum or Oxygen-Enriched Facilities. | [nasa.gov](https://www.nasa.gov/johnson/jsc-safety-health-requirements/) | **A** |
| **GLP-QS-8715.1** | Glenn Research Center Safety Manual | NASA Glenn Research Center | Chapter-by-chapter revisions with individual expiry dates | Active as a manual. | 35 chapters. Relevant ones: **Ch. 5 Oxygen** (GLP-QS-8715.1.5, Rev C w/Change 2, effective 11/15/2019); **Ch. 6 Hydrogen**; **Ch. 7 Pressure Systems Safety** (hydrostatic, pneumatic, leak and cryogenic testing); **Ch. 9 Lockout/Tagout**; **Ch. 10 Hazardous Operations**; **Ch. 18 Explosives, Propellants & Pyrotechnics**; **Ch. 25 Combustible-Gas, Toxic-Gas and Low-Oxygen Detection Systems**. **There is no dedicated cryogenics chapter** — the material is split across Ch. 5, 6 and 7. **Renumbered from GLM-QS-1700.1 — see corrections §11.** | [grc.nasa.gov PDF](https://www1.grc.nasa.gov/wp-content/uploads/gsm-manual.pdf) | **A** for the manual number, chapter list and Ch. 5 revision block (read from NASA-hosted PDFs). Ch. 5's own printed expiry (11/15/2025) has passed — see [could not confirm](#could-not-confirm) item 8. |

### 4c. NASA documents commonly cited that are NO LONGER CURRENT

| Designation | Title | Date | Status | Replacement | Conf. |
|---|---|---|---|---|---|
| **NSS 1740.15** | Safety Standard for Oxygen and Oxygen Systems — Guidelines for Oxygen System Design, Materials Selection, Operations, Storage, and Transportation | January 1996 | **CANCELLED.** | Content carried into **ASTM MNL36, 2nd ed. (2007)**, edited by NASA WSTF staff. For NASA-side process use **NASA/TM-2007-213740** and **NASA-STD-6001B**. | **B** — cancellation confirmed on standards aggregators (GlobalSpec, EverySpec); NASA hosts no live catalogue entry. The MNL36 lineage is stated in ASTM's own press release. |
| **NSS 1740.16** | Safety Standard for Hydrogen and Hydrogen Systems — Guidelines for Hydrogen System Design, Materials Selection, Operations, Storage, and Transportation | February 1997 | **CANCELLED** by Notice-1. | **ANSI/AIAA G-095A-2017.** | **B** — the AIAA G-095A front matter itself states it replaces NSS 1740.16. |
| **NASA TM-104823** | Guide for Oxygen Hazards Analyses on Components and Systems | 1996 | **SUPERSEDED.** | **NASA/TM-2007-213740**, which states the supersession in its own §1.0. | **A** |

### 4d. "Cryogenics Safety for Morpheus" — does not exist publicly

**No publicly available NASA training material titled "Cryogenics Safety for
Morpheus" could be found.** Searches run: NTRS full-text and citation search for
`Morpheus cryogenic safety` (one record only — *Morpheus 1.5A Lander Failure
Investigation Results*, NTRS 20140001490, with no title containing both
"Cryogenics Safety" and "Morpheus"); an exact-phrase web search for
`"Cryogenics Safety for Morpheus"` (zero matches on that string); and
domain-restricted searches of nasa.gov and ntrs.nasa.gov (no such course, module
or handout).

**Cite these instead:**

- **Morpheus cryogenic safety practice is described inside the lessons-learned
  papers themselves**, not in a standalone training deck. *Project Morpheus:
  Lessons Learned in Lander Technology Development* (NTRS 20140001410) records
  that pad crew positions PAD-2 and PAD-3 performed all cryogenic fluid handling
  under position-specific certification, that hazards were tracked with analysis
  and controls in SharePoint, and that a JSC Safety & Mission Assurance engineer
  was embedded in the team.
- **NASA's actual cryogenic safety training requirement** at that centre is
  **JPR 1700.1 Ch. 6.4**, which requires certification to handle cryogenic fluids.
- **NESC Academy** lists a Cryogenics discipline catalogue at
  `nescacademy.nasa.gov/catalogs/cryogenics`, but the page returned "Unable to
  locate catalog." Course titles and public accessibility are **unconfirmed (C)**.

---

## 5. Materials and property data

| Designation | Title | Body | Current edition / date | Status | What it covers | Link | Conf. |
|---|---|---|---|---|---|---|---|
| **NIST Cryogenic Material Properties Database** | Cryogenic Material Properties (part of NIST Cryogenic Technology Resources) | NIST Thermodynamics Research Center | Live; no version number. Content derives from the NIST Cryogenic Technologies Group (active 1995–2009). | **LIVE — but the URL has moved.** `cryogenics.nist.gov` now **301s to `trc.nist.gov/cryogenics/`. Cite the new URL.** | Critically evaluated property data for engineering materials at cryogenic temperature, as curve fits with interactive calculators. 40+ materials: aluminium alloys (1100, 3003-F, 5083-O, 6061-T6, 6063-T5), copper, brass, beryllium, beryllium copper, nickel steels, stainless steels (304, 304L, 310, 316), Inconel, titanium alloys, molybdenum, platinum, indium, lead; Kevlar-49, fibreglass epoxy, Kapton, Mylar, polystyrene, polyurethane, nylon, PVC, PTFE; sapphire, silicon, balsa, beech/phenolic, glass fabric/polyester, glass mat/epoxy, Apiezon N, regenerator materials. **The site's Cryogenic Flow Calibration section is historical only — NIST no longer offers that service.** | [trc.nist.gov/cryogenics](https://trc.nist.gov/cryogenics/) · [materials index](https://trc.nist.gov/cryogenics/materials/materialproperties.htm) | **A** for the site being live, the redirect, the material list and the flow-calibration retirement. **C** for per-property lists and per-material fit temperature ranges — those live on individual material pages that were not enumerated. |
| **NIST Chemistry WebBook — Thermophysical Properties of Fluid Systems** | — | NIST | Live | Current. | **The source of every fluid number in `properties.md` §1–§7.** Use the *fluid properties* pages (reference equations of state), **not** the phase-change summary pages (`Mask=4`) — see `properties.md` §13. | [webbook.nist.gov](https://webbook.nist.gov/chemistry/fluid/) | **A** |
| **ASTM E1450-24** | Standard Test Method for Tension Testing of Structural Alloys in Liquid Helium | ASTM International | **2024** | **Active.** Supersedes E1450-16. | Tension testing of structural alloys at 4 K in liquid helium — yield, tensile strength, elongation, reduction of area. The reference method at the bottom of the cryogenic range. For LOX (90 K) and LCH₄ (112 K) it is well below service temperature and is a bounding rather than a service-condition test. | [store.astm.org](https://store.astm.org/standards/e1450) | **A** |
| **EIGA Doc 170/21** | Safe Design and Operation of Cryogenic Enclosures | EIGA | **2021** | Current. | Cool-down rate guidance, frost and cold-spot behaviour, leak testing of cryogenic enclosures. Free. | [eiga.eu](https://www.eiga.eu/uploads/documents/DOC170.pdf) | **A** |
| **NBS Monograph 29** | Thermal Expansion of Technical Solids at Low Temperatures (Corruccini & Gniewek, 1961) | NBS (now NIST) | 1961 | Historical, still the underlying source. | The original integrated-contraction data that both the NIST database and Ekin's tables partly derive from. **Note the consequence: those two chains are not independent experimental confirmation of each other.** | [archive.org](https://archive.org/details/thermalexpansion29corr) | **A** for existence; OCR of its tables is unreliable (see `_verify-materials.md`). |
| **IEC 61882:2016** | Hazard and operability studies (HAZOP studies) — Application guide | IEC | **2016** | Current. | The formal HAZOP method and guide words. **Paywalled and not read** — the course's HAZOP guide-word list is currently stated from general knowledge and needs this citation before assessment. | [webstore.iec.ch](https://webstore.iec.ch/en/publication/24321) | **B** for the bibliographic record; **C** for anything attributed to its content. |
| **API STD 521** | Pressure-relieving and Depressuring Systems | API | not verified | — | Cited by number for relief-scenario framing. No verified free URL. | — | **B** |
| **IFC §5003.1.1** | International Fire Code — maximum allowable quantity per control area | ICC | 2021 edition consulted | Current in adopting jurisdictions. | The MAQ / control-area mechanism that drives how much cryogen may be held in a building. **Tables deliberately not reproduced** — get the specific adopted edition from the named AHJ. | [codes.iccsafe.org](https://codes.iccsafe.org/s/IFC2021P1/part-v-hazardous-materials/IFC2021P1-Pt05-Ch50-Sec5003.1.1) | **A** for the mechanism. |

---

## Corrections to commonly cited designations

Every place where the widely repeated designation or title is wrong or out of date.
**These are the errors a reviewer will notice.**

**1. CGA P-12 has been retitled, and almost everyone still uses the old title.**
*"Safe Handling of Cryogenic Liquids"* is the **6th edition (2017) title and is
obsolete.** The current **7th edition (January 2023)** is titled **"Guideline for
Safe Handling of Cryogenic and Refrigerated Liquids"**. Confirmed on CGA's own
catalogue. Most secondary pages — including the ANSI Webstore's P-12 landing page
and H2Tools — still carry the old title, which is why the stale version
circulates. **Use the 2023 title.**

**2. CGA S-1.3 is the wrong document for portable and cryogenic containers.**
S-1.3 is **Part 3 — Stationary Storage Containers**. The portable-container part
is **CGA S-1.2 (11th ed., Sept 2024)**; cylinders are **CGA S-1.1 (18th ed.,
Aug 2026)**. It is **S-1.2** that 49 CFR 173.318 leans on for cryogenic cargo-tank
relief capacity. All three are in §1.

**3. CGA S-1.2 has also been retitled.** Older citations (and the ANSI Webstore's
landing page) call it *"...Part 2 — **Cargo and Portable Tanks** for Compressed
Gases"*. CGA's current catalogue title is *"...Part 2 — **Portable Containers** for
Compressed Gases"*. Use "Portable Containers".

**4. ASTM G93 has been both retitled and re-designated.** It is no longer
*"Standard **Practice** for **Cleaning Methods and Cleanliness Levels** for
Material and Equipment Used in Oxygen-Enriched Environments"*, and it is no longer
plain "G93". The current standard is **ASTM G93/G93M-25, "Standard *Guide* for
*Cleanliness Levels and Cleaning Methods* for Materials and Equipment Used in
Oxygen-Enriched Environments"** — practice → guide, the two noun phrases swapped
order, "Material" → "Materials", and a dual inch-pound/SI **G93M** designation
added. ASTM's own G93 landing page still displays the old title in its summary
block; the version-specific page carries the new one.

The change is substantive, not cosmetic: a *Guide* is educational. The 2025
edition "deliberately avoids prescribing single correct levels" and expects users
to select levels from their own operating conditions and documented risk analysis.
**Any course material that treats G93 as prescribing a cleanliness level is now
wrong.**

**5. G74 and G86 are routinely swapped, and G128's title is routinely mangled.**
- **G74 is *gaseous fluid impact*** — pneumatic impact, i.e. adiabatic
  compression.
- **G86 is *mechanical impact*** in LOX and pressurised LOX/GOX.
- **G128's title is "Control of Hazards and Risks in Oxygen Enriched Systems"**,
  not "oxygen enrichment".
- **G72 and G128 are now dual-designated.** Cite **ASTM G72/G72M-24** and
  **ASTM G128/G128M-15(2023)**. G63, G74, G86, G88, G94 remain single-designated.

**6. ASTM D2512 was withdrawn in 2023.** D2512-17, *Compatibility of Materials
with Liquid Oxygen (Impact Sensitivity Threshold and Pass-Fail Techniques)*, was
the classic ambient-pressure LOX mechanical impact test. Older NASA and ASTM
literature — including sources this course relies on — leans on it heavily.
**Any discussion of it must be framed historically.** The live equivalent is
**ASTM G86-17(2025)**. (Related: **PS127-00** was withdrawn in 2003, superseded in
function by **G175**.)

**7. NFPA 497 has two titles in circulation, and NFPA is the source of the
confusion.** The 2024 edition is sold as *"Recommended Practice for the
Classification of Flammable Liquids, Gases, or Vapors and of Hazardous
(Classified) Locations for Electrical Installations in Chemical Process Areas"*
(ISBN 9781455930623). But **NFPA's own product page is headed "NFPA 497,
Recommended Practice for Electrical Installations in Chemical Atmospheres
Involving Flammable Liquids, Gases, or Vapors"** — a materially different title.
Whether that is a forthcoming retitle or a marketing short-title is unresolved.
**Cite the long classification title with the 2024 edition year**, and re-check
before the next edition.

**8. The NASA oxygen and hydrogen safety standards people cite from memory no
longer exist.** **NSS 1740.15** and **NSS 1740.16** are both **cancelled**.
NSS 1740.15's content went into **ASTM MNL36, 2nd ed. (2007)**; NSS 1740.16 was
replaced by **ANSI/AIAA G-095A-2017**. A course that cites "the NASA oxygen safety
standard" without qualification is citing a document NASA withdrew. For live
NASA-published oxygen material use **NASA-STD-6001B w/Change 3**,
**NASA/TM-2007-213740**, **SSTD-8070-0091-FLUIDS Rev A** and **KSC-KTI-5210 Rev C**.

**9. NASA-STD-8719.12 is now Revision B, not Revision A w/Change 2.** The title —
*Safety Standard for Explosives, Propellants, and Pyrotechnics* — is correct. The
designation is what people get wrong: the widely cited **Rev A w/Change 2
(18 Mar 2021) is superseded** by **NASA-STD-8719.12B**, document date
**13 July 2026**, currently ACTIVE. Almost every secondary page still shows Rev A.

**10. NASA does not publish a general cryogenic safety standard.** There is no
NASA-STD for cryogenics as such. The nearest live NASA documents are
**NASA-STD-8719.17D** (ground-based pressure vessels and pressurised systems —
the one that actually governs a cryogenic test stand), **NASA-STD-8719.26**
(non-code metallic pressure vessels), and centre-level handbook chapters:
**JPR 1700.1 Ch. 6.4** at JSC and **GLP-QS-8715.1 Ch. 5/6/7** at Glenn. Glenn's
manual has **no cryogenics chapter at all** — the material is split across Oxygen,
Hydrogen and Pressure Systems Safety.

**11. The Glenn Safety Manual was renumbered.** Citations to **GLM-QS-1700.1** are
stale; the manual is now **GLP-QS-8715.1**.

**12. `cryogenics.nist.gov` is a redirect, not a live host.** It 301s to
**`https://trc.nist.gov/cryogenics/`**. Course material and link checkers must use
the `trc.nist.gov` URL. Related: the site's **Cryogenic Flow Calibration** section
is retained for historical reference only — **NIST no longer offers that
service**, so do not present it as an available capability.

**13. ASME B31.3-2024 changed the stress-intensification method.** The 2024
edition makes **ASME B31J** the mandatory method for flexibility and
stress-intensification factors, superseding the simplified Appendix D chart
approach. Course material written against a 2022-or-earlier edition will teach a
method the current code no longer sanctions.

**14. NEC 2026 dates are frequently misattributed.** The 2026 NEC was issued by
the NFPA Standards Council on **20 August 2025**, effective **9 September 2025** —
not 2026. Several secondary summaries attach those dates to the wrong NFPA
document, including NFPA 55.

**15. "Cryogenics Safety for Morpheus" is not a real public NASA product.**
See §4d. Cite the Morpheus lessons-learned literature (NTRS 20140001410 and
20140001490) and **JPR 1700.1 Ch. 6.4** for the actual certification requirement.

**16. NASA/TM-2007-213740 is by Rosales, Shoffstall and Stoltzfus** — not
"Stoltzfus, Beeson et al." Harold Beeson is an *editor of ASTM MNL36*, a different
document. This is exactly the kind of bibliography error a reviewer notices.

**17. NASA/TM-2007-213740 cites "ASTM Manual 36 (2000)" — the 1st edition.** The
2nd edition (2007) is contemporaneous with the TM, so the TM's data pointers are
to the older book. **Cite MNL36 2nd ed. as current, but do not "correct" the TM's
internal references.**

---

## Could not confirm

Every item where verification fell short, and exactly what is unverified.

1. **CGA G-4.1 — whether an 8th edition exists.** CGA's catalogue lists the **7th
   edition, August 2018** (A for that edition). But CGA published a news article
   titled *"Revised Edition: CGA G-4.1, Cleaning of Equipment for Oxygen Service"*
   whose URL now returns **404**, and CGA's LinkedIn post of it dates to roughly
   **May 2023**. No catalogue, ANSI Webstore or reseller listing for a post-2018
   edition could be found. **Unverified: whether a 2023-or-later 8th edition was
   issued.** Enquire directly with CGA before the course cites an edition year.
2. **CGA G-4 — whether the reaffirmation still stands.** Catalogue says 11th
   edition, March 2015, reaffirmed May 2020. **Unverified: whether a 12th edition
   or a further reaffirmation has been issued since 2020.**
3. **NFPA 55 — publisher-page confirmation of the 2026 edition.** Near-certain
   (Google Books lists NFPA as publisher with a 31 Jan 2026 date; NFPA's own
   Fall-2025 second draft report for NFPA 55 exists), but **unverified on NFPA's
   own product page**, which renders client-side. Also **unverified: the Standards
   Council issue date and effective date for the 2026 edition.** One search
   summary asserted "issued 20 Aug 2026, effective 9 Sep 2026" — that is almost
   certainly a mis-attribution of the **NEC 2026** dates (correction §14) and
   **must not be repeated**.
4. **NFPA 59A, 497, 68, 69 — publisher-page confirmation.** Editions (2026 / 2024
   / 2023 / 2024) are confirmed only on the ANSI Webstore and retail listings.
   NFPA's own product pages could not be fetched.
5. **NFPA 497 — which title is current.** See correction §7.
6. **The bodies of NFPA documents were never read.** Every statement in this
   course about what NFPA 55, 59A, 497 or 70 *requires* is secondary. Before any
   of it is assessed, someone with NFPA access must check the actual clauses —
   particularly the NFPA 55 separation-distance methodology and NFPA 497's
   autoignition-temperature table (the source of methane's 537 °C; see
   `properties.md` §14.5).
7. **KSC-KTI-5210 Rev C — effective date and current status.** The PDF is public
   and its cover confirms designation, revision and title, but **the cover carries
   no date**, and **standards.nasa.gov's catalogue page for it returns HTTP 404**,
   so there is no NASA-side status record. Secondary sources give Rev C as
   7 Mar 2012; one reseller separately claims a 2004 version was "superseded
   01-08-2024". Neither could be corroborated.
8. **Glenn Safety Manual Ch. 5 (Oxygen) — currency.** The public PDF is
   GLP-QS-8715.1.5 Rev C w/Change 2, effective 11/15/2019, with a printed
   **expiration date of 11/15/2025 — now past**. The header also carries the
   confusing string "Oxygen w/Change 2 (11/15/2024)". **Unverified: whether a
   newer revision exists**; the controlled copy is behind NASA's SharePoint BMS
   Library.
9. **NSS 1740.15 / NSS 1740.16 cancellation records.** Both are confirmed
   cancelled, but only via aggregators and the successor documents' own front
   matter. **NASA hosts no live catalogue entry for either**, so the cancellation
   dates could not be read from an agency page. NSS 1740.15's aggregator-listed
   cancellation date (1995-12-31) is *earlier* than its own publication date
   (January 1996) — an aggregator data error, and the true date is unverified.
10. **NESC Academy cryogenics catalogue.** The URL returned *"Unable to locate
    catalog."* **Unverified: what cryogenics courses NESC Academy offers, their
    titles, and whether they are publicly accessible.**
11. **NIST cryogenic material properties — per-material detail.** The database is
    confirmed live and its material list was read. **Unverified: the exact set of
    properties per material and the temperature range of each curve fit.**
12. **OSHA and eCFR full text.** osha.gov returns 403 and ecfr.gov redirects to a
    bot wall. All OSHA and 49 CFR designations and titles here are the agencies'
    own page titles as surfaced by search — accurate as strings, but **the
    regulatory text itself was not read.** Anyone drafting from those sections must
    open them in a browser.
13. **ASME BPVC Section VIII Divisions 2 and 3.** Only Division 1 was verified
    (2025). **Unverified: current edition of Divisions 2 and 3** — same cycle, so
    almost certainly 2025, but not checked.
14. **ASTM G88-21 content.** The bibliographic record is A; **the clause text was
    never read** because it is paywalled. Every design-control statement in this
    course that would properly cite G88 is currently derived or secondary. **This
    is the largest single standards gap. Buy it before the oxygen module ships.**
15. **ASTM MNL36 content.** Same situation: cited as authority, never read. It is
    where an air-versus-oxygen MIE comparison would live if one exists.
16. **BS 6364, ASTM C740, ISA-5.1, EIGA/IGC Doc 33, API STD 521 and CGA G-4.3**
    are carried here at naming level only. Editions and content are unverified.
17. **Fermilab FESHM 4240 / 5064 primary text.** Blocked by Cloudflare and by
    single sign-on respectively. The ODH methodology in this course is verified
    through Jefferson Lab and LBNL instead; someone on an unblocked network should
    pull the Fermilab chapters to confirm the φ = Σ NᵢPᵢFᵢ form and the per-class
    PPE and mitigation requirements.

---

**Full citations, links and annotations for every document here are in
`sources.md`.** The complete verification record — including search strings tried,
fetch failures and the reasoning behind each confidence label — is in
`_verify-standards.md`, `_verify-oxygen.md`, `_verify-methane.md`,
`_verify-hardware.md`, `_verify-materials.md` and `_verify-hazards-ehs.md`.
