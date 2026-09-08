# Annotated source list

**Every source cited anywhere in this course.** Each entry carries a short
citation **TAG** in backticks — that is what modules cite by. Use the tag inline
(e.g. "the ignition-mechanism list `[NASA-TM-2007-213740]`") and let this file
carry the full citation.

Compiled 2026-09-08 from the seven `_verify-*.md` worksheets in this directory,
which remain as the audit trail. **Only sources actually verified in those
worksheets appear here.** Nothing has been added from memory, and nothing has
been padded. Where a source was located but not read, the entry says so.

**Access:** every entry is marked **[free]** or **[paywalled]**. Links were live
on 2026-09-08. Several publishers block automated fetching — noted per entry.

**How to add a source:** verify it, record the verification in the relevant
`_verify-*.md` worksheet, then add it here with a tag, a full citation, a working
link, and one or two sentences on what it is good for and what it cannot support.

---

## 1. NASA — NTRS reports, technical memoranda and handbooks

> **NTRS access note.** `ntrs.nasa.gov/citations/{id}` landing pages are
> client-rendered and time out for automated fetches. The working routes are the
> citation API (`ntrs.nasa.gov/api/citations/{id}`) and the PDF
> (`.../downloads/{id}.pdf`). Bibliographies should carry the `/citations/` URL
> because that is what a human wants. All NTRS items below are **[free]**.

`[NASA-TM-2007-213740]` — Rosales, K. R., Shoffstall, M. S. & Stoltzfus, J. M.,
*Guide for Oxygen Compatibility Assessments on Oxygen Components and Systems*,
NASA/TM-2007-213740 (also S-998), NASA JSC White Sands Test Facility, March 2007.
NTRS 20070016582. <https://ntrs.nasa.gov/citations/20070016582> · [PDF](https://ntrs.nasa.gov/api/citations/20070016582/downloads/20070016582.pdf) **[free]**
**The backbone oxygen document for this course.** Source of the 17-item ignition
mechanism list and its characteristic elements, the ignition-mechanism rating
scale, the kindling chain, the reaction-effect and history-of-use ratings, the
adiabatic-compression equation, and the mandatory-deliverables list for an oxygen
compatibility assessment. *Caveats:* it supersedes NASA TM-104823 (1996); its own
data pointers are to ASTM MNL36 **1st** edition (2000); and note the author list
— see `standards.md` corrections §16.

`[NASA-TM-104823]` — *Guide for Oxygen Hazards Analyses on Components and
Systems*, NASA JSC White Sands Test Facility, 1996. Via NTRS. **[free]**
**Superseded** by `[NASA-TM-2007-213740]`, which says so in its own §1.0. Cited
here only for its quotable statement that most materials, including metals, burn
in oxygen-enriched environments. Do not present it as current.

`[NASA-DAVIS-2012]` — Davis, S. E., *An Elementary Overview of the Selection of
Materials for Service in Oxygen-Enriched Environments*, NASA MSFC M12-1549, ASTM
G04 Symposium, 19 September 2012. NTRS 20120015993.
[PDF](https://ntrs.nasa.gov/api/citations/20120015993/downloads/20120015993.pdf) **[free]**
**The best free source of oxygen material data tables:** burn rate versus oxygen
concentration for nonmetals, burn rate versus pressure and temperature for
metals, and the threshold-pressure tables for promoted ignition and mechanical
impact (metals and nonmetals). Also the five generalised design rules and the four
ground rules (conservation, maximisation, minimisation, utilisation). *Caveat:*
Davis flags the data as "for comparison purposes only, not to be considered
standard values" — quote it as illustrative, never as a design allowable.

`[NASA-MORPHEUS-LESSONS]` — Olansen, J. B., Munday, S. R. & Mitchell, J. D.,
*Project Morpheus: Lessons Learned in Lander Technology Development*, AIAA SPACE
2013, NASA JSC, JSC-CN-29387. NTRS 20140001410.
<https://ntrs.nasa.gov/citations/20140001410> **[free]**
**The single best facility-and-operations source in the course.** Full text read.
Contains the Isp-321 s / clean-burning / non-toxic / ISRU framing statement; the
pad-crew position structure with per-position certification; hazard tracking and
the embedded S&MA engineer; the thrust-termination architecture; the full
flight-test log including the August 2012 vehicle loss and the 70+ upgrade
rebuild. *Caveat that matters:* the consumables list is "liquid oxygen,
**liquefied natural gas**, helium, liquid nitrogen, and gaseous nitrogen" —
Morpheus ran on **LNG, not rocket-grade methane**. Do not let a module blur them.

`[NASA-MORPHEUS-FAILURE]` — Devolites, J. L., Olansen, J. B. & Munday, S. R.,
*Project Morpheus: Morpheus 1.5A Lander Failure Investigation Results*, NASA JSC,
JSC-CN-29482, 10 September 2013. NTRS 20140001490.
<https://ntrs.nasa.gov/citations/20140001490> **[free]**
The August 2012 vehicle-loss investigation. Mishap-analysis material for a safety
course, from the same team as the lessons-learned paper.

`[NASA-HURLBERT-2016]` — Hurlbert, E., Morehead, R., Melcher, J. C. & Atwell, M.,
*Integrated Pressure-Fed Liquid Oxygen / Methane Propulsion Systems — Morpheus
Experience, MARE, and Future Applications*, NASA JSC, JSC-CN-35060, 25 July 2016.
NTRS 20160001041. <https://ntrs.nasa.gov/citations/20160001041> **[free]**
**The best single statement of the LOX/methane propellant-selection rationale.**
Full text read. Includes the space-storability argument, the materials-compatibility
argument, and the explanation of why hydrogen lost the trade at spacecraft scale
(a dry-mass argument, not an Isp argument). Frames reliable safing and purging as
a stated design benefit of methalox.

`[NASA-CHEN-ISRU]` — Chen, T. T., *ISRU Propellant Selection for Space Exploration
Vehicles*, NASA MSFC, M13-2789. NTRS 20140002709.
<https://ntrs.nasa.gov/citations/20140002709> **[free]**
Full text read. Source of the propellant density and freezing-point trade table
used in `properties.md` §11.2 (methane ~6× denser than LH₂, ~half RP-1;
subcooled methane at 101.7 K) and of the density-impulse selection criterion.
Independently corroborates NIST's methane triple point at 90.8 K.

`[NASA-NESC-LOXLNG]` — Meyer, M., Haas, J. & Eppig, B., *Investigating the
Explosive Hazard of Liquid Oxygen–Liquefied Natural Gas Rocket Propellant*, NASA
LaRC / NESC, presentation, 2023. NTRS 20230009860 (also numbered 20230003771).
<https://ntrs.nasa.gov/citations/20230009860> **[free]**
The NESC finding that LO₂/LNG behaves as neither LO₂/LH₂ nor LO₂/RP-1 — the
strongest available support for the "methalox is more than the sum of its parts"
argument. **Serious caveat:** this PDF's embedded fonts carry no ToUnicode map, so
its text had to be recovered by solving a substitution cipher. The reconstruction
is internally consistent but was **not copy-pasted**. All of its numeric values
were deliberately omitted from the worksheets. **Someone must open this PDF
properly before any module quotes it.**

`[NASA-RS18-WSTF]` — Melcher, J. C. IV & Allred, J. K., *Liquid Oxygen/Liquid
Methane Test Results of the RS-18 Lunar Ascent Engine at Simulated Altitude
Conditions at NASA White Sands Test Facility*, NASA JSC/WSTF, JSC-CN-18473,
2 August 2009. NTRS 20090026004. <https://ntrs.nasa.gov/citations/20090026004> **[free]**
WSTF LOX/LCH₄ altitude testing under the PCAD project. Carries a directly quotable
claim: *"'Green' propellants, such as LO2/LCH4, offer savings in both performance
and safety over equivalently sized hypergolic propulsion systems."* Abstract read;
body not.

`[NASA-IPSTB]` — Flynn, H., Lusby, B. & Villemarette, M., *Liquid Oxygen/Liquid
Methane Integrated Propulsion System Test Bed*, NASA JSC, JSC-CN-24066 /
JSC-CN-24175, 47th AIAA/ASME/SAE/ASEE JPC, 31 July 2011. NTRS 20110012829.
<https://ntrs.nasa.gov/citations/20110012829> **[free]**
The JSC integrated main-engine plus reaction-control-engine hotfire record,
ambient and simulated altitude at WSTF.

`[NASA-TVAC-HOTFIRE]` — Morehead, R. L., Melcher, J. C., Atwell, M. J.,
Hurlbert, E. A., Desai, P. & Werlink, R., *Vehicle-Level Oxygen/Methane Propulsion
System Hotfire Testing at Thermal Vacuum Conditions*, NASA JSC, JSC-CN-40102,
10 July 2017. NTRS 20170006927. <https://ntrs.nasa.gov/citations/20170006927> **[free]**
Integrated LOX/methane system hot-fired in the Glenn Plum Brook In-Space
Propulsion Thermal Vacuum Chamber (formerly B2) — described in its abstract as a
first for an integrated LOX/methane system at high altitude and thermal vacuum.
Abstract read.

`[NASA-IGNITER]` — Breisacher, K. J. & Ajmani, K., *LOX/Methane Main Engine
Igniter Tests and Modeling*, NASA Glenn, NASA/TM-2008-215421 (also E-16585,
AIAA 2008-4757). NTRS 20090001308. <https://ntrs.nasa.gov/citations/20090001308> **[free]**
~750 ignition tests of a LOX/methane spark torch igniter at simulated vacuum,
explicitly evaluating **the effects of methane purity** — the combustion-side view
of the LNG-versus-rocket-grade-methane distinction. Abstract read.

`[NASA-PCFS]` — Skaff, A., Grasl, S., Nguyen, C., Hockenberry, S. & Schubert, J.,
*Liquid Methane/Liquid Oxygen Propellant Conditioning Feed System (PCFS) Test
Rigs*, NASA Glenn, E-16872. NTRS 20090004695.
<https://ntrs.nasa.gov/citations/20090004695> **[free]**
The two-phase-flow reference: PCAD-project rigs built to evaluate engine
performance across a broad range of propellant temperatures. Abstract read.

`[NASA-IPP]` — Banker, B. & Ryan, A., *Liquid Oxygen/Liquid Methane Integrated
Power and Propulsion*, NASA JSC, JSC-CN-35628. NTRS 20160003080.
<https://ntrs.nasa.gov/citations/20160003080> **[free]**
LOX/methane propulsion brassboard integrated with a solid oxide fuel cell — the
source for the "oxygen–methane economy" framing. Abstract read.

`[NASA-CFM-2024]` — Ameen, L. M., Kenny, R. J., Johnson, W. L. & Henkel, K. L.,
*NASA's Developments in Cryogenic Fluid Management Technology*, presentation,
15 April 2024. NTRS 20240004242. <https://ntrs.nasa.gov/citations/20240004242> **[free]**
The most recent Glenn-led cryogenic fluid management overview found: current state
of the art and development direction.

`[NASA-MLI-JOHNSON]` — Johnson, W. L., NASA/UCF thesis on multilayer insulation
performance. NTRS 20100034929. <https://ntrs.nasa.gov/citations/20100034929> ·
[PDF](https://ntrs.nasa.gov/api/citations/20100034929/downloads/20100034929.pdf) **[free]**
The layer-density trade stated precisely — conduction rises with spacer thickness
while radiation falls with layer count, so there is an optimum layer *density*,
not an optimum layer *count*. Also the statement that MLI is the best-performing
cryogenic insulation **at high vacuum (below 10⁻³ torr)** and only there.

`[NASA-FESMIRE-KSC]` — Fesmire, J. E. et al., KSC Cryogenics Test Laboratory
comparative insulation work (aerogel versus MLI systems, boiloff calorimetry
method). NTRS 20180006600.
[PDF](https://ntrs.nasa.gov/api/citations/20180006600/downloads/20180006600.pdf) **[free]**
Source of the MLI baseline characterisation (26 test specimens, 10–80 layers,
~22 mm, ~50 kg/m³), the compression-load degradation figures (7 kPa → ~40×
increase in heat flux; 70 kPa → >100×), and the Type K / Type E thermocouple
practice in KSC test cryostats. Also names **ASTM C740** as the applicable MLI
thermal-test guide.

`[NASA-KOGAN-MLI]` — Kogan, A., Fesmire, J. E. & Johnson, W. L., MLI seams,
penetrations and edge effects. NTRS 20110006939.
[PDF](https://ntrs.nasa.gov/api/citations/20110006939/downloads/20110006939.pdf) **[free]**
The quotable statement that compression, seams, penetrations and edge effects
"increase heat leak through MLI systems by 100 percent or more if the system is
improperly designed", plus the evacuated-perlite working vacuum range (1–10
millitorr, versus below ~1 millitorr for MLI to reach its potential).

`[NASA-PROP-TEST-HANDBOOK]` — NASA Propulsion Test Handbook. NTRS 20100002189.
[PDF](https://ntrs.nasa.gov/api/citations/20100002189/downloads/20100002189.pdf) **[free]**
Practical hardware source: check-valve contamination and sticking; relief-valve
set-pressure tolerances (2 psi to 70 psi set, 3 % above, reseat before 90 % of
set); direct-acting versus pilot-operated reliefs; dome-loaded regulation as the
standard high-flow architecture; typical operating and relief pressure bands; and
the case for resistance or steam tracing on lines expected to ice.

`[NASA-VCR-FITTINGS]` — Tamasy, G. et al., *Ground-based cryogenic leak test of
fittings for cryogenic fluid management*, NASA, CEC 2023. NTRS 20230009407 (see
also 20230004260 and 20205011830 for the underlying test reports).
[PDF](https://ntrs.nasa.gov/api/citations/20230009407/downloads/C3Or2A-06_Manuscript_CEC%202023_VCR%20Fittings_062223%20(002).pdf) **[free]**
Qualification data for mechanical fittings at cryogenic temperature — the
evidence behind "welded first, mechanical joints only where you must".

`[NASA-JWST-PRELOAD]` — *Investigation of Bolt Preload Relaxation for JWST*, NASA.
NTRS 20180003004.
[PDF](https://ntrs.nasa.gov/api/citations/20180003004/downloads/20180003004.pdf) **[free]**
Preload behaviour through thermal cycling — the source for the bolted-joint
section of the materials worksheet.

`[NASA-SP-2010-580]` — *NASA System Safety Handbook, Volume 1*, NASA/SP-2010-580.
NTRS 20120003291.
[PDF](https://ntrs.nasa.gov/api/citations/20120003291/downloads/20120003291.pdf) **[free]**
NASA's own framing of hazard-analysis methods; the reference behind the
FTA/FMEA/HAZOP treatment in the hazard-analysis material.

`[NASA-SP-125]` — Huzel, D. K. & Huang, D. H., *Design of Liquid Propellant Rocket
Engines*, NASA SP-125, 2nd edition, 1967. NTRS 19710019929.
<https://ntrs.nasa.gov/citations/19710019929> **[free]**
The free ancestor of Huzel & Huang. The best free source on how LOX and LH₂ lines,
valves, seals and pressurisation systems were actually built — dimensions,
materials, tolerances, real drawings. Much of it has not been superseded.

`[NASA-MEDIA-GUIDELINES]` — *NASA Images and Media Usage Guidelines*.
<https://www.nasa.gov/nasa-brand-center/images-and-media/> **[free]**
Read in full. **The licence basis for every image in `../img/`.** NASA still
images are generally not subject to US copyright and may be used for educational
purposes with NASA acknowledged — but this is a *permission*, not a licence, and
it carries conditions: no implied endorsement, no commercial or promotional use of
images containing identifiable NASA personnel without their permission, and the
NASA insignia is **not** public domain and must never be cropped out for use as a
logo, badge, favicon or course mark. Also relevant: NASA does not permit
attribution of AI model output directly to NASA. Per-image credit lines live in
`../img/CREDITS.md`.

*See also §8 for the NASA incident and mishap reports (Apollo 1, Apollo 13, Mir
SFOG), which are NTRS documents but are grouped by subject.*

---

## 2. ASTM, CGA and other standards bodies

> Editions, dates and status for everything in this section are in
> `standards.md`. This section says what each document is *good for*.
> ASTM pages under `www.astm.org/Standards/` return HTTP 403 to automated
> fetches; the `store.astm.org` product pages work and were used instead.

`[ASTM-G63]` — *Standard Guide for Evaluating Nonmetallic Materials for Oxygen
Service*, ASTM G63-15(2023). <https://store.astm.org/standards/g63> **[paywalled]**
The nonmetals selection guide for oxygen service. Cite as the authority for
material selection; do not reproduce its tables. Explicitly not an approval
specification.

`[ASTM-G88]` — *Standard Guide for Designing Systems for Oxygen Service*,
ASTM G88-21. <https://store.astm.org/standards/g88> **[paywalled]**
**The authoritative system-level oxygen design guide** — velocity limits, particle
impact, adiabatic compression, ignition mechanisms, configuration. **Caveat: it was
never read during verification.** Every design-control statement in this course
that would properly cite G88 is currently derived or secondary. Buy it before the
oxygen module ships.

`[ASTM-G94]` — *Standard Guide for Evaluating Metals for Oxygen Service*,
ASTM G94-22. <https://store.astm.org/standards/g94> **[paywalled]**
The metals counterpart to G63.

`[ASTM-G72]` — *Standard Test Method for Autogenous Ignition Temperature of
Liquids and Solids in a High-Pressure Oxygen-Enriched Environment*,
ASTM G72/G72M-24. <https://store.astm.org/standards/g72> **[paywalled]**
Defines how AIT is measured in oxygen: 2.1–20.7 MPa, standard 10.3 MPa,
60–500 °C, 0.5–100 % O₂, ~0.20 g sample, 5 °C/min. Its own caution is worth
repeating to students who want to treat AIT as a design number: means for
extrapolating from the idealised test to field situations "are not established".

`[ASTM-G74]` — *Standard Test Method for Ignition Sensitivity of Nonmetallic
Materials and Components by Gaseous Fluid Impact*, ASTM G74-13(2021).
<https://store.astm.org/standards/g74> **[paywalled]**
**The pneumatic-impact / adiabatic-compression test.** Tests 5 mm and 14 mm bore
configurations to 69 MPa and reports a median failure pressure or an
ignition-probability curve. This is why adiabatic compression is qualified by
*test* and not by the isentropic equation. Commonly confused with G86.

`[ASTM-G86]` — *Standard Test Method for Determining Ignition Sensitivity of
Materials to Mechanical Impact in Ambient Liquid Oxygen and Pressurized Liquid and
Gaseous Oxygen Environments*, ASTM G86-17(2025).
<https://store.astm.org/standards/g86> **[paywalled]**
**The LOX mechanical-impact test**, 0–68.9 MPa, max impact energy 98 J. The
canonical screen for nonmetals in liquid oxygen.

`[ASTM-G93]` — *Standard Guide for Cleanliness Levels and Cleaning Methods for
Materials and Equipment Used in Oxygen-Enriched Environments*, ASTM G93/G93M-25.
<https://store.astm.org/g0093_g0093m-25.html> **[paywalled]**
Cleanliness level definitions and coding, cleaning methods, verification. The 2025
edition changed from a *Practice* to a *Guide* and deliberately stopped
prescribing single correct levels — see `standards.md` corrections §4.

`[ASTM-G124]` — *Standard Test Method for Determining the Combustion Behavior of
Metallic Materials in Oxygen-Enriched Atmospheres*, ASTM G124-18.
<https://store.astm.org/standards/g124> **[paywalled]**
**The promoted-ignition test — where metal flammability numbers come from.**
Acceptance criterion: a 3.2 mm rod burning more than 30 mm counts as
self-sustained combustion. Worth knowing that the test is harsh enough that most
industry-standard oxygen metals fail it at their typical use pressures, which is
precisely why the oxygen compatibility assessment process exists.

`[ASTM-G128]` — *Standard Guide for Control of Hazards and Risks in Oxygen
Enriched Systems*, ASTM G128/G128M-15(2023).
<https://store.astm.org/standards/g128> **[paywalled]**
Programmatic hazard and risk control across an oxygen system's life cycle. Its own
scope contains a useful admission: the guide "does not purport to contain all the
information needed to design and operate an oxygen-enriched system safely" and
safe design "requires sound technical judgment from qualified personnel beyond
handbook procedures."

`[ASTM-G145]` — *Standard Guide for Studying Fire Incidents in Oxygen Systems*,
ASTM G145-08(2023). <https://store.astm.org/g0145-08r23.html> **[paywalled]**
Fire-investigation method: how to select a direct-cause hypothesis and avoid
hypotheses that have proven faulty. **The right starting point for building an
incident library**, alongside the ASTM STP series (`[ASTM-STP-OXYGEN]`).

`[ASTM-G175]` — *Standard Test Method for Evaluating the Ignition Sensitivity and
Fault Tolerance of Oxygen Pressure Regulators Used for Medical and Emergency
Applications*, ASTM G175-24. <https://store.astm.org/standards/g175> **[paywalled]**
The standard that came out of the medical-regulator fire investigations
(`[WHA-REGULATORS]`). Teaches **fault tolerance** as a design principle: whether a
component survives an ignition event, not merely whether it avoids one.

`[ASTM-D2512]` — *Compatibility of Materials with Liquid Oxygen (Impact
Sensitivity Threshold and Pass-Fail Techniques)*, ASTM D2512-17. **WITHDRAWN
2023.** <https://store.astm.org/standards/d2512> **[paywalled]**
Cited only historically. It is the test behind much of the older NASA and ASTM LOX
impact data, including Davis's tables, so a module that uses those tables should
name it and say it is withdrawn.

`[ASTM-MNL36]` — Beeson, H. D., Smith, S. R. & Stewart, W. F. (eds.), *Safe Use of
Oxygen and Oxygen Systems: Handbook for Design, Operation, and Maintenance*, ASTM
Manual 36, 2nd edition, 2007. ISBN 978-0-8031-4470-5; DOI 10.1520/MNL36-2ND-EB.
<https://store.astm.org/mnl36-2nd-eb.html> **[paywalled]**
**The practical oxygen-systems handbook, and the destination of the cancelled NASA
NSS 1740.15 content.** Where NASA's TM is a procedure, MNL36 is the handbook:
materials compatibility data, ignition mechanism theory, cleaning, component
design rules. *Caveats:* it was **never read** during verification; NASA/TM-2007-
213740 cites the 1st edition (2000); and no 3rd edition was found despite one
circulating catalogue reference.

`[ASTM-STP-OXYGEN]` — *Flammability and Sensitivity of Materials in
Oxygen-Enriched Atmospheres*, ASTM Special Technical Publication series.
**[paywalled]**
**The main body of published oxygen fire case literature.** Individual papers
verified bibliographically: Newton, B. & Forsyth, E. T., "Cause And Origin Analyses
Of Two Large Industrial Oxygen Valve Fires", 10th Volume, 2003, pp. 268–289,
DOI 10.1520/STP11594S; and STP11595S on the CUMA V2 underwater breathing
apparatus. **Content not read; no claims in this course rest on them.**

`[ASTM-E1450]` — *Standard Test Method for Tension Testing of Structural Alloys in
Liquid Helium*, ASTM E1450-24. <https://store.astm.org/standards/e1450> **[paywalled]**
Tension testing at 4 K. For LOX (90 K) and LCH₄ (112 K) service it is a bounding
rather than a service-condition test — say so if a module cites it.

`[ASTM-NVR-METHODS]` — Cleanliness verification methods: **G120-15(2023)**
(Soxhlet extraction), **G136-03(2023)e1** (ultrasonic extraction),
**G144-01(2022)** (total carbon analysis); plus **G127-15(2023)** (cleaning agent
selection), **G126-16(2023)** (terminology) and **G114-21** (age resistance of
polymers). All at <https://store.astm.org> **[paywalled]**
The quantitative basis for "oxygen clean". The principle a module must carry:
**visual and UV inspection detect only gross contamination; they cannot verify a
cleanliness level.**

`[CGA-P-12]` — *Guideline for Safe Handling of Cryogenic and Refrigerated
Liquids*, CGA P-12, 7th edition, January 2023.
<https://legacy.cganet.com/Publication/Details.aspx?id=P-12> **[paywalled]**
The introductory industry document for cryogen handling — properties, transport,
storage, handling, use. **Paywalled and not read; cited by number only.** Note the
retitle: the widely used "Safe Handling of Cryogenic Liquids" is the obsolete 6th
edition title.

`[CGA-G-4]` — *Oxygen*, CGA G-4, 11th edition, March 2015, reaffirmed May 2020.
<https://legacy.cganet.com/Publication/Details.aspx?id=G-4> **[paywalled]**
The base CGA oxygen document. Cited by number.

`[CGA-G-4.1]` — *Cleaning of Equipment for Oxygen Service*, CGA G-4.1, 7th
edition, August 2018.
<https://legacy.cganet.com/Publication/Details.aspx?id=G-4.1> **[paywalled]**
The cleaning requirement for **all surfaces contacting fluid above 23.5 % oxygen**
— internationally harmonised, referenced by NFPA, and the standard a purchase
order should name. A **free older edition incorporated by reference into the CFR**
is readable at <https://law.resource.org/pub/us/cfr/ibr/003/cga.g-4.1.1985.pdf>
(1985 — useful for teaching the structure, **not** for current requirements).
See `standards.md` "could not confirm" item 1 on a possible 8th edition.

`[CGA-G-4.4]` — *Oxygen Pipeline and Piping Systems*, CGA G-4.4, 6th edition,
August 2020. <https://legacy.cganet.com/Publication/Details.aspx?id=G-4.4> **[paywalled]**
Velocity limits, materials and impingement-site rules for gaseous oxygen piping.
Harmonised with EIGA Doc 13. The free European equivalent is `[EIGA-13]`.

`[CGA-S-1-SERIES]` — Pressure Relief Device Standards: **S-1.1** (cylinders, 18th
ed., Aug 2026), **S-1.2** (portable containers, 11th ed., Sept 2024), **S-1.3**
(stationary storage containers, 10th ed., Sept 2024).
<https://legacy.cganet.com/Publication/Details.aspx?id=S-1.2> **[paywalled]**
Get the part number right — see `standards.md` corrections §2. A **free 1980
edition of S-1.2**, incorporated by reference into the CFR, is at
<https://law.resource.org/pub/us/cfr/ibr/003/cga.s-1.2.1980.pdf> — historical
only.

`[CGA-OTHER]` — Also cited by number: **P-1** (compressed gases in containers),
**P-18** (bulk inert gas systems), **P-48** and **P-96** (reciprocating cryogenic
pumps — oxidiser/inert and hydrogen/LNG respectively), **G-4.3** (commodity
specification for oxygen), **G-5.4** (hydrogen piping at user locations),
**H-5** (cited in the hardware pass), **SB-2** (oxygen-deficient atmospheres —
superseded here by the free `[EIGA-44]`). Catalogue: `legacy.cganet.com`
**[paywalled]**

`[EIGA-04]` — EIGA Doc 04/26, *Fire Hazards of Oxygen and Oxygen-Enriched
Atmospheres*, June 2026 (revision of Doc 04/18).
<https://www.eiga.eu/uploads/documents/DOC004.pdf> **[free]**
**The best free, quotable framing of the oxygen hazard**, and EIGA explicitly
permits reproduction with acknowledgement — unusually easy to use in courseware.
Source of "materials that do not burn in air, including fire-resistant materials,
can burn vigorously in oxygen-enriched air or pure oxygen"; the three effects of
raising oxygen concentration and pressure; the oil-and-grease kindling-chain
passage; the hydrocarbon-lubricant prohibition and the glycol-coolant trap.
*Caveat:* its Figure 2 (cotton burning rate versus oxygen percentage) did not
survive text extraction — **reproduce the figure under EIGA's permission rather
than transcribing values off it.**

`[EIGA-13]` — EIGA Doc 13/20, *Oxygen Pipeline and Piping Systems*.
<https://www.eiga.eu/uploads/documents/DOC013.pdf> **[free]**
The free European counterpart to CGA G-4.4. URL resolves; not read in full.

`[EIGA-44]` — EIGA Doc 44/18, *Hazards of Oxygen-Deficient Atmospheres*.
<https://www.eiga.eu/uploads/documents/DOC044.pdf> **[free]**
**The free equivalent of the paywalled CGA SB-2**, and the source of the
oxygen-concentration physiology table in `properties.md` §11.4. Also confirms the
OSHA 19.5 %/23.5 % band independently, and carries the warnings that must travel
with the table: unconsciousness without warning in one or two breaths, inert gases
being more dangerous than smelly toxic gases, and unprotected rescuer entry as one
of the commonest causes of multiple fatalities.

`[EIGA-170]` — EIGA Doc 170/21, *Safe Design and Operation of Cryogenic
Enclosures*. <https://www.eiga.eu/uploads/documents/DOC170.pdf> **[free]**
Cool-down rate guidance, frost and cold-spot behaviour, and leak testing of
cryogenic enclosures.

`[AIGA-106]` — AIGA 106/19, *Vacuum-Jacketed Piping in Liquid Oxygen Service*,
Asia Industrial Gases Association, 2019.
<https://asiaiga.org/uploaded_docs/en_AIGA_106_19_Vacuum-Jacketed_Piping_in_Liquid_Oxygen_Service.pdf> **[free]**
**The most useful free standard in the hardware material.** Mandatory flexibility
analysis for VJ piping; annular-space relief devices; bayonet installation and
support; internal versus external bellows; a minimum 1000 bellows cycles; frost,
ice and condensation as acceptance and in-service criteria; and the LOX-specific
ignition risk of a leak into the annulus.

`[ASME-BPVC-VIII]` and `[ASME-B31.3]` — ASME Boiler and Pressure Vessel Code
Section VIII Division 1 (2025) and ASME B31.3 Process Piping (2024).
<https://www.asme.org/codes-standards> **[paywalled]**
The vessel code and the piping code. Cited by number and edition; contents not
read. **Note that B31.3-2024 makes ASME B31J mandatory for flexibility and
stress-intensification factors** — see `standards.md` corrections §13.

`[MSS-SP-134]` — MSS SP-134, *Valves for Cryogenic Service Including Requirements
for Body/Bonnet Extensions*.
<https://webstore.ansi.org/preview-pages/MSS/preview_MSS+SP-134-2006a.pdf> **[paywalled; free preview]**
States the extended-bonnet requirement functionally — the standard behind "why the
stem is that long". Only the ANSI preview page was read.

`[ISA-5.1]` — ISA-5.1, *Instrumentation Symbols and Identification*.
<https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa5> **[paywalled]**
**The tag scheme every P&ID in this course uses.** The standard itself was not
read; the tag-letter tables used in the hardware worksheet came from a secondary
compilation at <https://mechcodex.com/reference/isa-instrumentation-tag-letters>
**[free, confidence B]** and from ISA's own *InTech* article on the revision.

---

## 3. NFPA, OSHA, NIOSH and other US regulators

`[NFPA-55]` — *Compressed Gases and Cryogenic Fluids Code*, NFPA 55, 2026 edition.
<https://www.nfpa.org/product/nfpa-55-code/p0055code> **[paywalled; free read-only
access via nfpa.org]**
**The adoptable code a fire marshal will actually enforce** for cryogenic fluid
installation, storage and use. **Caveat: no NFPA document body was read during
verification.** Every statement in this course about what NFPA 55 *requires* is
secondary. NFPA offers free read-only online access — that is the route a student
should take, and the route someone must take before any module quotes a clause.

`[NFPA-59A]` — *Standard for the Production, Storage, and Handling of Liquefied
Natural Gas (LNG)*, NFPA 59A, 2026 edition.
<https://www.nfpa.org/product/nfpa-59a-standard/p0059acode> **[paywalled]**
The closest adoptable code to a bulk LCH₄ farm. **Written for LNG plants, not test
stands** — apply with judgement and say so.

`[NFPA-2]` — *Hydrogen Technologies Code*, NFPA 2, 2026 edition.
<https://link.nfpa.org/all-publications/2/2026> **[paywalled]**
Full scope over hydrogen requirements as of 2026 — it no longer cross-references
NFPA 55 for hydrogen.

`[NFPA-70]` — *National Electrical Code*, NFPA 70, 2026 edition, Articles 500–506.
<https://link.nfpa.org/all-publications/70/2026> **[paywalled]**
Hazardous (classified) locations. LCH₄ and LH₂ areas are Class I. Issued
20 Aug 2025, effective 9 Sep 2025 — dates commonly misattributed.

`[NFPA-497]` — *Recommended Practice for the Classification of Flammable Liquids,
Gases, or Vapors and of Hazardous (Classified) Locations for Electrical
Installations in Chemical Process Areas*, NFPA 497, 2024 edition.
<https://www.nfpa.org/product/nfpa-497-recommended-practice/p0497code> **[paywalled]**
**The document you actually use to draw the classified-area boundary**, and the
usual source of methane's 537 °C AIT and the Group D / Group B gas assignments.
**Its table was never read** — see `properties.md` §14.5 on the AIT provenance.
Two different titles are in circulation; see `standards.md` corrections §7.

`[NFPA-68]` / `[NFPA-69]` — *Explosion Protection by Deflagration Venting* (2023)
and *Explosion Prevention Systems* (2024). <https://www.nfpa.org> **[paywalled]**
NFPA 69 is where the inert-purge discipline for methane systems traces to. NFPA 68
matters only for enclosed or indoor handling.

`[OSHA-1910.146]` — 29 CFR 1910.146, *Permit-Required Confined Spaces*, OSHA.
<https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.146> **[free]**
**The source of the 19.5 % / 23.5 % oxygen definitions and the 10 %-of-LFL
threshold** used throughout this course. *Access caveat:* osha.gov returns 403 to
automated fetches, so the text was corroborated from three independent secondary
reproductions rather than read off the primary page. The threshold values are not
in doubt; **check the verbatim wording against the live CFR before quoting it.**

`[OSHA-OTHER]` — Also cited: **1910.101** (compressed gases), **1910.104**
(oxygen — bulk oxygen system siting), **1910.119** (process safety management),
**1910.134** (respiratory protection — same oxygen band), **1910.147**
(lockout/tagout, including release of stored energy), **1910.253**
(oxygen-fuel gas welding and cutting). All at <https://www.osha.gov/laws-regs>
**[free]**

`[OSHA-3132]` / `[OSHA-3071]` — OSHA publication 3132, *Process Safety
Management*; OSHA publication 3071, *Job Hazard Analysis*.
<https://www.osha.gov/sites/default/files/publications/osha3132.pdf> ·
<https://www.osha.gov/sites/default/files/publications/osha3071.pdf> **[free]**
Plain-language explanations of the PSM elements and of how to build a JHA — the
accessible companions to the regulation text.

`[USBM-627]` — Zabetakis, M. G., *Flammability Characteristics of Combustible
Gases and Vapors*, US Bureau of Mines Bulletin 627, 1965 (1970 printing). Via CDC
STACKS. **[free]**
**The primary classical flammability source.** Tables 2, 4 and 21, plus the
"Limits in Other Atmospheres" section that states — authoritatively — that lower
flammability limits in oxygen are essentially the same as in air. Source of
methane's 5.0–15.0 % in air, 537 °C AIT and 9.48 % stoichiometric concentration,
and hydrogen's 4.0–75.0 % in air.

`[USBM-503]` — Coward, H. F. & Jones, G. W., *Limits of Flammability of Gases and
Vapors*, US Bureau of Mines Bulletin 503, 1952. Read as page images via the
Caltech Explosion Dynamics Laboratory mirror:
<https://shepherd.caltech.edu/EDL/PublicResources/flammability/USBM-503.pdf> **[free]**
**The primary source for flammability limits in oxygen**, and the reason
`properties.md` §10c is Confidence A. Methane in oxygen: **5.15 and 60.5 %**
(p. 44). Hydrogen in oxygen: **4.65 and 93.90 %** upward in an open 2-inch tube,
3.9 and 95.8 % in closed tubes (p. 19). Also the tube-method inerting figure for
methane (below 12.8 % oxygen in nitrogen, p. 45). Same apparatus, same
investigators for both fuels — a genuinely apples-to-apples comparison.

`[USBM-680]` — Kuchta, J. M., *Investigation of fire and explosion accidents in
the chemical, mining, and fuel-related industries — a manual*, US Bureau of Mines
Bulletin 680, 1985, Appendix A p. 71. Via the Caltech mirror:
<https://shepherd.caltech.edu/EDL/PublicResources/flammability/p71.pdf> ·
[index](https://shepherd.caltech.edu/EDL/PublicResources/flammability.html) **[free]**
Read as a page image. Methane property block: MW 16.04, specific gravity 0.55,
boiling point −164 °C, stoichiometric 9.48 %, **flash point −188 °C**, **minimum
AIT 630 °C**, limits 5.0–15.0 % at 25 °C. **The 630 °C AIT conflicts with the
537 °C in universal area-classification use** — see `properties.md` §14.5.

`[NIOSH-ZLOCHOWER]` — Zlochower, I. A. & Green, G. M. (NIOSH Pittsburgh Research
Laboratory), *The limiting oxygen concentration and flammability limits of gases
and gas mixtures*, J. Loss Prev. Process Ind. 22 (2009), Table 1. Via CDC STACKS:
<https://stacks.cdc.gov/view/cdc/9780/cdc_9780_DS1.pdf> **[free]**
**The modern closed-vessel counterpart to Bulletin 627, and the paper that exists
specifically to flag that flammability limits are method-dependent.** Methane
LFL/UFL/LOC by vessel and criterion (120 L: 5.0 / 15.8 / 11.1; flammability tube:
5.0 / 15.0 / 12.0), hydrogen likewise. Read directly. This is the evidence behind
"a flammability limit is not a property of the gas".

`[CSB-NITROGEN]` — U.S. Chemical Safety Board, *Hazards of Nitrogen Asphyxiation*,
Safety Bulletin 2003-10-B, 11 June 2003.
<https://www.csb.gov/assets/1/6/nitrogen_asphyxiation_safety_bulletin_(6-11-03).pdf> **[free]**
The federal accident-investigation body's own bulletin on why inert-gas
asphyxiation kills without warning, with case histories. The clearest citable
authority for the "no warning, no smell, two breaths" framing.

`[ICC-IFC-MAQ]` — International Fire Code §5003.1.1 and ICC's Code Corner article
on IFC Tables 5003.1.1(1)/(2), maximum allowable quantities per control area.
<https://codes.iccsafe.org/s/IFC2021P1/part-v-hazardous-materials/IFC2021P1-Pt05-Ch50-Sec5003.1.1> ·
[ICC article](https://www.iccsafe.org/building-safety-journal/bsj-technical/code-corner-2024-international-fire-code-tables-5003-1-11-and-5003-1-12-maximum-allowable-quantities/) **[free to view]**
The MAQ and control-area mechanism that decides how much cryogen a building may
hold. **Cite the mechanism, not the numbers** — get the specific adopted edition
from the named AHJ.

`[DOT-49CFR]` — 49 CFR Parts 173, 178 and 180 (PHMSA), the cryogenic transport
sections: §§173.315, 173.316, 173.318, 173.320, 178.57 (DOT-4L), 178.338
(MC-338), 180.407. <https://www.ecfr.gov/current/title-49> **[free]**
Where the DOT-4L liquid cylinder and MC-338 tanker specifications live, and where
rated holding time becomes a legal requirement rather than a marketing figure.
*Access caveat:* eCFR redirects automated fetches to a bot wall; titles here are
eCFR's own page titles and **the regulatory text was not read.**

---

## 4. National laboratories and universities

`[LBNL-PUB3000-29]` — Lawrence Berkeley National Laboratory, ES&H Manual PUB-3000
Chapter 29, *Safe Handling of Cryogenic Liquids*.
<https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch29/> **[free]**
**The single richest free source in the hazards material.** Container taxonomy
(open-neck dewars, liquid cylinders, bulk tanks), expansion ratios, trapped-liquid
pressures, the "every isolatable part must be relieved" rule, ice on a vacuum
jacket as a vacuum-failure symptom, oxygen enrichment of LN₂ (≈50 % condensate,
up to 80 % in an open dewar), and the memorable line that a single drop of LOX has
the oxidising power of about half a litre of air. Companion pages: [ODH
analysis](https://ehs.lbl.gov/service/cryogenic-liquid-safety/oxygen-deficiency-hazard-analysis/),
[the Leidenfrost
effect](https://ehs.lbl.gov/service/cryogenic-liquid-safety/the-leidenfrost-effect/),
[burns and
frostbite](https://ehs.lbl.gov/service/cryogenic-liquid-safety/cryogenic-liquid-burns-and-frostbite/),
and [PUB-3000 Ch. 07 Pressure Safety](https://ehs.lbl.gov/resource/esh-manual-pub-3000/ch07/).

`[JLAB-ODH]` — Thomas Jefferson National Accelerator Facility, ES&H Manual Chapter
6540 and Appendix T4, *Oxygen Deficiency Hazard (ODH) Control Program*.
<https://www.jlab.org/ehs/ehsmanual/6540.htm> ·
[Appendix T4](https://www.jlab.org/ehs/ehsmanual/6540T4.htm) **[free]**
**The primary ODH methodology source for this course**, and the most accessible
one. Classification scheme, the quantitative fatality-rate model, and the required
engineering and administrative controls per ODH class. Read it as a model for how
to write a hazard analysis — the reasoning matters more than the specific numbers,
which are facility-specific.

`[JLAB-OVERPRESSURE]` — Jefferson Lab ES&H Manual, Pressure and Vacuum Systems
Supplement, Part 4, *Overpressure Protection*.
<https://www.jlab.org/ehs/ehsmanual/Pressure%20and%20Vacuum%20Systems%20Supplement/PSS%20Part%204%20Overpressure%20Protection.htm> **[free]**
The relief-sizing design figures actually used in practice at a lab that runs large
cryogenic plant: heat-flux values for bare metal versus insulated versus
vacuum-jacketed surfaces, the requirement to relieve the insulating vacuum space,
the practical exemption for small relief devices, block-valve controls upstream of
reliefs, and check-valve leakage as a principal cause of system overpressure.

`[SLAC-CH36]` — SLAC National Accelerator Laboratory, ES&H Manual Chapter 36,
*Cryogenic and ODH Safety*.
<https://www-group.slac.stanford.edu/esh/eshmanual/pdfs/ESHch36.pdf> **[free]**
Independent confirmation of the JLab ODH method, plus two hardware rules worth
quoting: that system configuration must ensure frozen air entering a cryostat
cannot prevent relief devices functioning, and the general form of the
trapped-liquid rule ("each and every isolatable volume…"). Also SLAC ES&H Ch. 14
on pressure systems: <https://esh.slac.stanford.edu/hazardous_activities/pressure>

`[LANL-OXYGEN-GUIDE]` — Los Alamos National Laboratory, Engineering Standards
Manual STD-342-100, Chapter 17 Pressure Safety, Attachment GUIDE-2, *Oxygen System
Design Guide*, Rev. 0, 22 September 2023.
<https://engstandards.lanl.gov/esm/pressure_safety/Att-GUIDE-2-R0.pdf> **[free]**
**The best free substitute for the paywalled ASTM G88.** Pressure-banded material
guidance (carbon steel / 316 SS / copper at or below 200 psig and 200 °F; copper
above that curve; copper-based materials where velocity may approach sonic;
stainless, nickel or copper alloys above 700 psig); the minimum-thickness rule with
its 3.18–6.35 mm validity range; the contaminant list a reviewer should expect
addressed; cleaning requirements and the hazards of cleaning itself. See also
LANL's general pressure-safety guide, Attachment GUIDE-1:
<https://engstandards.lanl.gov/esm/pressure_safety/Att-GUIDE-1-R1.pdf>

`[FNAL-ODH]` — Fermi National Accelerator Laboratory, FESHM Chapter 4240 (and
Chapter 5064, *Oxygen Deficiency Hazards*). <https://eshq.fnal.gov/manuals/feshm/> **[free
in principle]**
The other canonical DOE ODH programme, and the origin of the φ = Σ NᵢPᵢFᵢ
fatality-factor form. **NOT FETCHED** — Cloudflare blocked one route and the
manual has moved behind single sign-on. Everything the course says about the ODH
method is verified through `[JLAB-ODH]` and `[LBNL-PUB3000-29]` instead. Someone on
an unblocked network should pull the Fermilab chapters to confirm the component-count
term and the per-class PPE requirements.

`[FNAL-PIP2]` — Fermilab PIP-II cryogenic distribution safety work. arXiv:2307.08608.
<https://arxiv.org/abs/2307.08608> **[free]**
The large-scale version of the vacuum-jacket relief problem: vacuum-vessel relief
sizing to protect distribution-system vacuum shells against an internal line
rupture, and the requirement that relief flow vent outside to avoid creating an
ODH inside a tunnel.

`[LOSS-OF-VACUUM-REVIEW]` — Review of loss-of-insulating-vacuum behaviour in helium
systems. arXiv:2303.15309. <https://arxiv.org/abs/2303.15309> **[free]**
The citable framing of why loss of vacuum is hard to design for: rapid heat
transfer, venting losses, overpressure risk, and behaviour that is "highly
transient and difficult to predict uniformly across applications". Reported peak
fluxes in the helium literature (~31 kW/m² bare, ~4.4 kW/m² insulated) are
secondary attributions in this source — treat them as **B**.

`[CERN-DUTHIL]` — Duthil, P., *Material Properties at Low Temperature*, CAS–CERN
Accelerator School, CERN-2014-005. <https://arxiv.org/pdf/1501.07100> **[free]**
The mechanism behind the ductile-to-brittle transition and why f.c.c. metals do not
have one. Its Charpy and toughness figures are images and no numeric values could
be extracted — use it for the physics, not for numbers.

`[CERN-CRYOSTAT-DESIGN]` — *Cryostat Design*, CAS–CERN Accelerator School.
<https://arxiv.org/pdf/1501.07154> **[free]**
Welds, brazes, joint selection and anisotropy effects in cryostat construction.

`[CERN-ODH]` — CERN HSE, ODH Risk Management.
<https://hse.cern/services-support/OHS/ODH-risk-management> **[free]**
Service-level statement only — used to show the practice is international, not to
support any specific method or number.

`[CORNELL-CRYO]` — Cornell University, Laboratory Safety Manual §16.10, *Cryogenic
Material Safety*. <https://ehs.cornell.edu/book/export/html/1459> **[free]**
Source of the ~82 K air dew point and ~50 % oxygen condensate figure (which
`properties.md` §11.1 independently reproduces by calculation), the cold-trap
hazard chain (over-pressurisation, reaction with rotary-pump oil, ozone ice under
radiation), and the LOX/LH₂ prior-approval gate as a worked example of an
institutional control.

`[MIT-EHS-0082]` — MIT EHS-0082, *Laboratory Use of Research Pressure Vessel
Systems*. <https://ehs.mit.edu/wp-content/uploads/EHS_0082.pdf> **[free]**
**The best available example of a tiered institutional pressure-system programme** —
registration, review, procedures, training and competency. Use it as the model for
"what a real approval gate looks like", not as a template to copy.

`[UNIV-EHS-OTHER]` — Additional university EHS sources used for corroboration:
UT Austin ([cryogens](https://ehs.utexas.edu/working-safely/equipment-safety/cryogens)),
Utah State ([liquid nitrogen](https://research.usu.edu/ehs/training-and-resources/liquid-nitrogen)),
Colorado State ([cryogenic safety manual](https://lasers.colostate.edu/wp-content/uploads/2019/04/Cryogenic-Safety-Manual.pdf)),
Yale EHS, East Carolina University OEHS, and CU Boulder Fire & Life Safety on
[gas storage and control areas](https://www.colorado.edu/firelifesafety/sites/default/files/attached-files/gas_storage.pdf).
All **[free]**. Individually these are secondary; collectively they establish what
normal institutional practice is. **Do not cite a single university page as the
authority for a number.**

`[UVU-LOX-ASPHALT]` — Utah Valley University, *Oxygen impact and reactivity
trials* (LOX/asphalt replication study), PMC10011059.
<https://pmc.ncbi.nlm.nih.gov/articles/PMC10011059/> **[free]**
**The reason the LOX-on-asphalt story must be told carefully.** The replication
study does not support the dramatic version of the folklore. Keep the nuance:
overstating one hazard discredits the correctly-stated ones next to it.

`[SANDIA-SFBREEZE]` — Klebanoff, L. E., Pratt, J. W. & LaFleur, C. B. (Sandia
National Laboratories), *Comparison of the Safety-related Physical and Combustion
Properties of Liquid Hydrogen and Liquid Natural Gas in the Context of the
SF-BREEZE High-Speed Fuel-Cell Ferry*, SAND2016-6456 J. **[free]**
**The independent confirmation of the buoyancy crossover temperatures** in
`properties.md` §6 — methane 164.3 K (agreement to 0.05 K with the value computed
here) and hydrogen 22.07 K (exact agreement). Also the source for detonability
limits, the ~10 mJ human static-discharge figure, the self-sustaining-versus-
classical LFL distinction, and the statement that LH₂ can liquefy and solidify air
while liquid methane cannot. *Caveat:* its methane expansion ratio (648) is an
outlier traceable to a mismatched gas density — see `properties.md` §14.1.

`[SANDIA-LNG-SPILL]` — Hightower, M. et al., *Guidance on Risk Analysis and Safety
Implications of a Large Liquefied Natural Gas (LNG) Spill Over Water*,
SAND2004-6258, Sandia National Laboratories, 2004.
<https://www.osti.gov/biblio/882343> **[free]**
The canonical public analysis of large LNG releases: pool spreading, vapour
dispersion, pool fires, thermal-radiation hazard distances, and a sober treatment
of what does and does not cause a rapid phase transition. The best free entry point
into the LNG body of experience.

---

## 5. NIST and property data

`[NIST-FLUIDS]` — NIST Chemistry WebBook, *Thermophysical Properties of Fluid
Systems*. <https://webbook.nist.gov/chemistry/fluid/> **[free]**
**The source of every fluid number in `properties.md` §1–§7**, retrieved
2026-09-08 as tab-delimited data with no transcription step. These are the
reference equations of state that also underlie REFPROP. **Use these pages — not
the WebBook's phase-change summary pages** (`Mask=4`), which aggregate a century of
literature with no quality filter and contain demonstrably impossible entries. See
`properties.md` §13.

`[NIST-WEBBOOK-PHASE]` — NIST Chemistry WebBook phase-change data pages
(`Mask=4`), e.g. [methane](https://webbook.nist.gov/cgi/cbook.cgi?ID=C74828&Mask=4),
[oxygen](https://webbook.nist.gov/cgi/cbook.cgi?ID=C7782447&Mask=4),
[nitrogen](https://webbook.nist.gov/cgi/cbook.cgi?ID=C7727379&Mask=4). **[free]**
Useful for literature-average fixed points with stated uncertainties (methane
triple point 90.67 ± 0.03 K) and for the nitrogen saturation table behind
`properties.md` §11.3. **Cross-checking only** — see the warning above.

`[NIST-CRYO-MATERIALS]` — NIST Cryogenic Material Properties database, NIST
Thermodynamics Research Center, Boulder.
<https://trc.nist.gov/cryogenics/materials/materialproperties.htm> ·
[section index](https://trc.nist.gov/cryogenics/) **[free]**
**Fitted curves and coefficients for thermal conductivity, specific heat, thermal
expansion and Young's modulus from 4 K upward**, for the 40+ structural materials
actually used — stainless steels, aluminium alloys, OFHC copper, Ti-6Al-4V, G-10,
PTFE, Kapton, Invar, beryllium copper and more. This is what you use to compute a
heat-leak budget or a contraction allowance instead of guessing. **Two caveats:**
`cryogenics.nist.gov` now 301s here, so use the `trc.nist.gov` URL; and the site's
Cryogenic Flow Calibration section is historical only — NIST no longer offers that
service. Provenance page: <https://trc.nist.gov/cryogenics/materials/references.htm>

`[NIST-BRADLEY-RADEBAUGH]` — Bradley, P. E. & Radebaugh, R., *Properties of
Selected Materials at Cryogenic Temperatures*, NIST.
<https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913059> **[free]**
The validation chain for the contraction data — used to cross-check the database's
fits against tabulated values.

`[NIST-CMPD-PAPER]` — Marquardt, E. D., Le, J. P. & Radebaugh, R., *Cryogenic
Material Properties Database*, NIST, 2000.
<https://trc.nist.gov/cryogenics/Papers/Material_Properties/2000-Cryogenic_Material_Properties_Database.pdf> **[free]**
Defines what the tabulated integrated thermal contraction number actually means —
read this before quoting a contraction percentage.

`[NBS-MONOGRAPH-29]` — Corruccini, R. J. & Gniewek, C. J., *Thermal Expansion of
Technical Solids at Low Temperatures*, NBS Monograph 29, 1961.
<https://archive.org/details/thermalexpansion29corr> **[free]**
The original integrated-contraction dataset. **Important caveat:** both the NIST
database and Ekin's tables draw partly on it, so those two chains are **not**
independent experimental confirmation of each other — the cross-check validates
evaluation and transcription only. The Internet Archive OCR of its Table 2.4
interleaves columns badly and no elastomer values could be transcribed with
confidence.

`[EKIN-APPENDIX]` — Ekin, J. W., *Experimental Techniques for Low-Temperature
Measurements*, Oxford University Press — free appendix tables (A6.4, A6.9, A6.10,
A7.4, A7.6).
<https://www.researchmeasurements.com/figures/ExpTechLTMeas_Apdx_English.pdf> **[free
appendix; book paywalled]**
The second contraction chain, plus low-temperature toughness and seal data. The
free appendix is genuinely useful on its own; the book body (Figs. 6.8/6.9) would
close the elastomer-contraction gap.

`[MARZOUK-AFT]` — Marzouk, O. A., *Adiabatic Flame Temperatures for Oxy-Methane,
Oxy-Hydrogen, Air-Methane and Air-Hydrogen Stoichiometric Combustion using the
NASA CEARUN Tool, GRI-Mech 3.0 and Cantera*, Eng. Technol. Appl. Sci. Res.
13(4):11437–11444 (2023). **[free — open access]**
The adiabatic flame temperatures in `properties.md` §8–§9. Internally consistent
and transparently sourced. **Always quote its equilibrium values, not its
"complete combustion" values** — the latter ignore dissociation and are physically
unreachable (5166 K for oxy-methane). Always state "stoichiometric, reactants at
298.15 K, 1 atm, chemical equilibrium" alongside the number.

`[CIPM-AIR]` — CIPM-2007 recommended molar mass of dry air (28.9647 g/mol) and
ISO 2533 standard atmosphere (1.225 kg/m³ at 15 °C).
The basis of the air-density row in `properties.md` §3.

`[LEWIS-VON-ELBE]` — Lewis, B. & von Elbe, G., *Combustion, Flames and Explosions
of Gases*. **[paywalled]**
Cited here **only** as the usual attribution for the minimum-ignition-energy-in-
oxygen figures that could **not** be verified (`properties.md` §14.7). Listed so
that whoever chases them knows where to look. Do not cite it for a number this
course has not read.

---

## 6. Textbooks and handbooks

*The reading-order commentary for these is in `where-to-go-next.md`; this section
is the citation record.*

`[BARRON-SYSTEMS]` — Barron, R. F., *Cryogenic Systems*, 2nd edition, Oxford
University Press, 1985. <https://openlibrary.org/works/OL2008154W> **[paywalled;
out of print]**
The standard first textbook in the subject: liquefaction cycles, refrigeration,
insulation, low-temperature material properties, storage and transfer,
instrumentation, from first principles with problems.

`[BARRON-NELLIS]` — Barron, R. F. & Nellis, G. F., *Cryogenic Heat Transfer*, 2nd
edition, CRC Press, 2016. ISBN 9781482227444.
<https://www.routledge.com/Cryogenic-Heat-Transfer/Barron-Nellis/p/book/9781482227444> **[paywalled]**
The specialist follow-on, and the one that matters most for propulsion — chilldown,
two-phase flow, cryogenic boiling and condensation, heat exchangers at low
temperature.

`[FLYNN]` — Flynn, T. M., *Cryogenic Engineering*, 2nd edition revised and
expanded, Marcel Dekker / CRC Press, 2004.
<https://openlibrary.org/works/OL3780218W> **[paywalled]**
The industrial counterpart to Barron: fluid properties, storage vessels, transfer
lines, instrumentation, and a genuinely good treatment of cryogenic safety and
hazard analysis that most thermodynamics texts skip.

`[EDESKUTY-STEWART]` — Edeskuty, F. J. & Stewart, W. F., *Safety in the Handling
of Cryogenic Fluids*, Plenum Press / Springer, 1996. DOI 10.1007/978-1-4899-0307-5.
<https://link.springer.com/book/10.1007/978-1-4899-0307-5> **[paywalled; sold by
the chapter]**
**The single best book on cryogenic safety**, by two Los Alamos cryogenic
operations people, organised around the hazards rather than the equipment: cold
burns, embrittlement, trapped-volume pressure, air condensation and oxygen
enrichment, hydrogen and methane combustion properties, oxygen deficiency, relief
sizing, and how real accidents unfolded.

`[WEISEND-HANDBOOK]` / `[WEISEND-CRYOSTAT]` / `[TIMMERHAUS-REED]` — Weisend, J. G.
II (ed.), *Handbook of Cryogenic Engineering*, Taylor & Francis, 1998
(<https://openlibrary.org/works/OL19408242W>); Weisend, *Cryostat Design: Case
Studies, Principles and Engineering*, Springer, 2016
(<https://link.springer.com/book/10.1007/978-3-319-31150-0>); Timmerhaus, K. D. &
Reed, R. P. (eds.), *Cryogenic Engineering: Fifty Years of Progress*, Springer,
2007 (<https://link.springer.com/book/10.1007/0-387-46896-X>). **[paywalled; the
Springer titles sell by the chapter]**
Consulted, not read cover to cover. *Cryostat Design* is unusually valuable for a
student because it teaches by worked case studies — supports, heat-leak budgeting
and thermal intercepts, including the mistakes.

`[SUTTON-BIBLARZ]` — Sutton, G. P. & Biblarz, O., *Rocket Propulsion Elements*,
9th edition, Wiley, 2016. <https://openlibrary.org/works/OL21470530W> **[paywalled]**
The system context around the cryogenics: the liquid-propellant chapter (LOX, LH₂,
LCH₄ properties and the density/bulk-density trades) and the feed-system and
turbopump chapters (tank pressurisation, NPSH and cavitation, chilldown).

`[HUZEL-HUANG]` — Huzel, D. K. & Huang, D. H., *Modern Engineering for Design of
Liquid-Propellant Rocket Engines*, Progress in Astronautics and Aeronautics
vol. 147, AIAA, 1992. <https://openlibrary.org/works/OL27313820W> **[paywalled]**
The design manual rather than the textbook. **The free ancestor is `[NASA-SP-125]`,
which is the same book in an earlier form** — start there.

`[WOODWARD-PITBLADO]` — Woodward, J. L. & Pitblado, R. M., *LNG Risk Based Safety:
Modeling and Consequence Analysis*, Wiley / AIChE (CCPS), 2010.
<https://openlibrary.org/works/OL15440802W> **[paywalled]**
The fuller LNG consequence-modelling text — source terms, dispersion, fires, and
the risk methodology. Only needed for quantitative consequence analysis; start with
`[SANDIA-LNG-SPILL]`.

`[MATRICON-WAYSAND]` — Matricon, J. & Waysand, G., *The Cold Wars: A History of
Superconductivity*, Rutgers University Press, 2003.
<https://openlibrary.org/works/OL3058982W> **[paywalled]**
Listed only to correct a common misattribution: **this book is not by Weisend.** It
is a history of superconductivity rather than a cryogenics text, and is optional
for this course.

---

## 7. Manufacturer, industry and trade literature

> These are the most operationally concrete sources available for free, and the
> ones most likely to be wrong in detail. **Directionally reliable; confirm any
> specific number against a controlling document before a design decision rests
> on it.**

`[AP-SG-6]` — Air Products, *Safetygram-6: Liquid Oxygen*.
<https://www.airproducts.com> **[free]**
Source of the "pale blue… nonflammable but a strong oxidizer" framing, the
firefighting guidance (shut off the oxygen source first), the 20.95 % dry-air
composition, the **oxygen-saturated clothing** warning (remove and air for at least
an hour), and independent confirmation of OSHA's 23.5 % enrichment threshold.

`[AP-SG-7]` — Air Products, *Safetygram-7: Liquid Nitrogen*. **[free]**
Property table including the **694 : 1 expansion ratio at 68 °F** — half of the
694-versus-696 teaching example in `properties.md` §4c. Also concurs on 19.5 %
oxygen as the minimum for safe working.

`[AP-SG-9]` — Air Products, *Safetygram-9: Liquid Hydrogen*. **[free]**
Hydrogen flammability and detonability limits in air and in oxygen, and AIT
500–577 °C. **Two traps:** its latent heat is quoted **per kilomole** and is easily
misread by a factor of two (`properties.md` §14.10), and its freezing point
(13.85 K) is closer to the parahydrogen value than to normal hydrogen's
(§14.11).

`[AP-SG-27]` — Air Products, *Safetygram-27: Cryogenic Liquid Containers*.
**[free]**
**Table 1 is the authoritative industry expansion-ratio table** — 861 (O₂),
848 (H₂), 841 (Ar), 754 (He), 696 (N₂), all at 70 °F, with a worked example that
fixes the basis beyond doubt. Also the general statement that materials which do
not burn in air may burn in an oxygen-enriched atmosphere.

`[WHA-REGULATORS]` — WHA International, medical oxygen regulator fire case study.
<https://wha-international.com/case-study-medical-oxygen-regulators/> **[free]**
WHA investigated 11 regulator fires; the FDA received reports of 17 between 1993
and 1999, all involving aluminium regulators. Four ignition mechanisms across the
set — heat of compression, contaminant ignition, particle impact, promoted
ignition. WHA's aluminium (25 psi) and brass (10,000 psi) thresholds agree closely
with NASA MSFC's independent data in `[NASA-DAVIS-2012]`. *Caveat:* this is WHA's
own summary page, not the underlying reports — **confidence B**. The resulting
`[ASTM-G175]` is verifiable.

`[WHA-G93-2025]` — WHA International, guide to the ASTM G93-2025 update.
<https://wha-international.com/guide-to-astm-g93-2025/> **[free]**
The clearest available explanation of what changed when G93 became a *Guide*, and
the source of the framing "cleaning for oxygen service is fundamentally a
fire-prevention measure" and "visual inspection methods alone cannot verify most
oxygen service cleanliness levels". **Confidence B** — it is a commentary on a
paywalled standard, not the standard.

`[CHART-BULK]` / `[CHART-LIQUID-CYLINDER]` / `[CHART-VIP]` — Chart Industries,
[bulk tank catalogue](https://files.chartindustries.com/13608592_BulkCatalog.pdf),
[liquid cylinder product manual](https://files.chartindustries.com/10642912_Liquid_Cylinder_Product_Manual_ws.pdf),
[vacuum-insulated pipe](https://www.chartindustries.com/Products/Vacuum-Insulated-Pipe). **[free]**
**Real catalogue boiloff figures (normal evaporation rates), pressure-build and
economiser circuit descriptions, and VJ pipe construction** — the concrete numbers
that let a module teach with real figures instead of hand-waving. Manufacturer
literature: representative of that product line, not of the industry.

`[EJMA]` — Expansion Joint Manufacturers Association, bellows resources.
<https://www.ejma.org/bellows/> · squirm/instability explainer at
<https://usbellows.com/resources/squirm-or-instability/> and failure causes at
<https://usbellows.com/resources/installation-maintenance-metallic-ej/typical-causes-of-failure/> **[free]**
**EJMA requires a safety factor of 3 against squirm** — the citable rule behind why
bellows in VJ piping are a design quantity, not an afterthought. The failure-mode
pages are trade explanatory material (**confidence C** for specific numbers).

`[PERLITE-INSTITUTE]` — Perlite Institute, *Super-insulating perlite for evacuated
cryogenic service*.
<https://www.perlite.org/wp-content/uploads/2018/03/super-insulating-perlite-evacuated-cryogenic-service.pdf> **[free]**
Why big tanks use evacuated perlite rather than MLI: performance versus density and
interstitial pressure, and the 0.1 % by weight moisture limit — wet perlite cannot
be pumped down.

`[PARKER-ORD-5712]` — Parker Hannifin, *O-Ring Material Offering Guide*, ORD 5712.
<https://www.parker.com/content/dam/Parker-com/Literature/O-Ring-Division-Literature/ORD-5712-Parker-O-Ring-Material-Offering-Guide.pdf> **[free]**
**The verified elastomer service-temperature table**, and the source of the
teaching point that every conventional elastomer's low-temperature service limit is
120–180 K above cryogenic service temperature. *Note:* the fuller O-Ring Handbook
(ORD 5700) could not be retrieved, so **numeric glass-transition temperatures for
NBR, FKM, EPDM and silicone are deliberately absent from this course.**

`[SWAGELOK-VCR]` — Swagelok, gasket face seal fittings catalogue MS-13-150.
<https://www.swagelok.com/downloads/webcatalogs/en/ms-13-150.pdf> **[free]**
How a metal gasket face seal actually seals — the manufacturer's own description,
used alongside `[NASA-VCR-FITTINGS]` for the joint-selection material.

`[LAKESHORE-SENSORS]` — Lake Shore Cryotronics, cryogenic temperature sensor
selection guide.
<https://www.lakeshore.com/docs/default-source/product-downloads/literature/lstc_sensorselection_l.pdf> **[free]**
Which sensor works over which cryogenic range, and why — the practical basis for
the temperature-instrumentation material.

`[LINDE-PURGE]` — Linde, *Inerting gases for purging spacecraft gas lines*.
<https://www.linde-gas.com/industries/space/engine-testing-and-launch-gases/inerting-gases-purging> **[free]**
Industrial-supplier confirmation of the helium-not-nitrogen rule for LH₂ systems.
**Confidence B** — supplier marketing literature supporting a conclusion that the
property data in `properties.md` §11.3 establishes independently.

`[TRADE-EXPLANATORY]` — Assorted trade and vendor explanatory pages used for
mechanism wording only, all **confidence C**: MTM Inc. on
[sudden loss of isolation vacuum](http://www.mtm-inc.com/ac-20130930-sudden-loss-of-isolation-vacuum-in-cryogenic-liquid-dewars.html)
and [how bayonets work](https://www.mtm-inc.com/how-cryogenic-bayonets-work.html);
Crane Cryogenics on [normal evaporation rate](https://cranecryogenics.com/normal-evaporation-rate-ner-for-dewars/);
Habonim on [bi-directional cryogenic valves](https://blog.habonim.com/cryogenic-bi-directional);
Fike [TB8100 on ASME code and rupture discs](https://my.fike.com/_fike_docs/Pressure_Protection/_GLOBAL_Pressure_Protection/Technical_Bulletins/TB8100_ASME_Code_and_Rupture_Discs.pdf);
RC Systems on [gas detector placement](https://www.rcsystemsco.com/gas-detector-placement);
Crowcon on [what LEL means](https://www.crowcon.com/us-en/article/what-is-lel/);
Canyon Components on [low-temperature sealing](https://www.canyoncomponents.com/post/low-temperature-sealing-o-rings-and-materials-for-cryogenic-and-arctic-applications);
Advanced EMC on [PTFE seals for cryogenic applications](https://advanced-emc.com/ptfe-seals-for-cryogenic-applications/);
BeaconMedaes, [cryogenic delivery systems design guide](https://www.beaconmedaes.com/content/dam/brands/beacon-medaes/documents/laboratory/guidebooks/BMed_Cryogenic_Design_Guide_%20Book_2021.pdf.coredownload.inline.pdf).
**[free]**
Use these for how to *explain* a mechanism, never as the authority for a number.

---

## 8. Incident and mishap reports

`[APOLLO-204-BOARD]` — *Report of Apollo 204 Review Board to the Administrator,
NASA*, 5 April 1967. NASA-TM-84105, NTRS 19820066930 (also catalogued as
NASA-TM-108667, NTRS 19930078717).
[PDF](https://ntrs.nasa.gov/api/citations/19820066930/downloads/19820066930.pdf) ·
[NASA-hosted Findings, Determinations and Recommendations](https://www.nasa.gov/wp-content/uploads/static/history/Apollo204/find.html) **[free]**
**The oxygen-enriched-atmosphere case.** Verbatim from the Findings page: the test
was conducted at 16.7 psia, 100 % oxygen; "the test conditions were extremely
hazardous"; evidence of several arcs; "the Command Module contained many types and
classes of combustible material in areas contiguous to possible ignition sources";
deficiencies in wiring design, manufacture, installation, rework and quality
control. *Caveat:* the widely-quoted "overconfidence and complacency" finding and
the "the test configuration was not classified as potentially hazardous" clause
were read from a summary of the NASA pages, **not** from the report text —
**confidence B. Quote them from the report itself.**

`[APOLLO-13-BOARD]` — *Report of Apollo 13 Review Board* (the Cortright Report),
NASA-TM-X-65270, 15 June 1970. NTRS 19700076776.
[PDF](https://ntrs.nasa.gov/api/citations/19700076776/downloads/19700076776.pdf) **[free]**
**The only cryogenic-oxygen incident in the set**, and textbook electrical-arc
ignition inside an oxygen-wetted pressure vessel. *Caveat:* the Cortright "unusual
combination of mistakes coupled with a somewhat deficient and unforgiving design"
quote and the "remove all electrical equipment from inside the pressure vessel"
recommendation are **confidence B** as reported here — pull them from
TM-X-65270 directly before quoting.

`[ANDERSON-APOLLO13]` — Anderson, B. L., *A Case Study of the Failure on Apollo 13:
Based on TMX-65270, Report of Apollo 13 Review Board*, NASA MSFC, M11-0349,
8 August 2011. NTRS 20110015690.
[PDF](https://ntrs.nasa.gov/api/citations/20110015690/downloads/20110015690.pdf) **[free]**
**A NASA document that summarises the Board report, read directly** — the source of
the failure chain used in this course: 28 V thermostatic switches powered from 65 V
GSE, switches never qualified at 65 V, heaters reaching ~1000 °F during detanking,
Teflon insulation destroyed, the information never reaching the pre-launch
decision, the 46:40:02 MET quantity-gauge anomaly, and the 55:54:53 GET failure.

`[GRAF-OXYGEN-CANDLES]` — Graf, J., *Oxygen Candle Background for Subs and Space*
(internal title: *Chlorate Oxygen Generator (Oxygen Candle) Review of the History
of Candle Development*), NASA JSC, JSC-CN-38913, February 2017. NTRS 20170002051.
[PDF](https://ntrs.nasa.gov/api/citations/20170002051/downloads/20170002051.pdf) **[free]**
**The Mir SFOG/Vika fire (24 February 1997), from a NASA primary source.** A
lithium perchlorate TGK unit burned through its thin stainless steel wall; the
investigation concluded the generator was probably contaminated during manufacture
(a hydrocarbon or a fragment of a technician's chemical glove), and the shell fire
was due in part to "its extreme thinness since thinner metals have been shown to be
more flammable". Also documents related candle failures, a Dutch submarine
over-pressure event (2007), and **ValuJet Flight 592** (11 May 1996), citing NTSB
report PB97-910406.

`[CSB-WILLIAMS-OLEFINS]` — U.S. Chemical Safety Board, final case study into the
13 June 2013 explosion and fire at the Williams Olefins plant, Geismar, Louisiana,
released 19 October 2016.
<https://www.csb.gov/csb-releases-final-case-study-into-2013-explosion-and-fire-at-williams-olefins-plant-in-geismar-louisiana/> **[free]**
**The best-documented trapped-liquid / isolated-vessel overpressure case**, from
the federal investigator. Also a management-of-change and process-hazard-analysis
case study, which is why it appears in both the hazards and the hazard-analysis
material.

`[TX-FIRE-MARSHAL-2006]` — Texas State Fire Marshal's Alert, 22 February 2006.
<https://www.tdi.texas.gov/fire/documents/fmred022206.pdf> **[free]**
The 12 January 2006 university LN₂ dewar cylinder rupture — a regulator's own
account, and a usable worked example of a pressure-relief path defeated in an
ordinary laboratory setting.

`[LAUTKASKI-2008]` — Lautkaski, R., "Investigation of a large industrial oxygen
valve fire", *J. Loss Prev. Process Ind.* **21**(4), 466–471 (2008).
DOI 10.1016/j.jlp.2008.03.002. **[paywalled]**
Bibliographic data verified via CrossRef and Semantic Scholar. **The content
description in circulation** — a 300 mm butterfly valve igniting during start-up,
three fatalities, operators forcing a stuck valve with pipe tongs — **comes from a
search summary, not the paper. Confidence C. Obtain the paper before any module
uses this incident.**

`[FAILURE-KNOWLEDGE-DB]` — Japanese Failure Knowledge Database, *Brittle fracture
of Liberty Ships*. <https://shippai.org/fkd/en/hfen/HB1011020.pdf> **[free]**
The historical framing for the ductile-to-brittle transition. **Confidence C** —
used for narrative, not for numbers. The quantitative Charpy and metallurgical
account is in `[NIST-TITANIC]`.

`[NIST-TITANIC]` — Foecke, T., *Metallurgy of the RMS Titanic*, NIST-IR 6118.
<https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=852863> **[free]**
Charpy impact data across the transition temperature, and the historical case that
makes the ductile-to-brittle transition memorable — from a NIST report rather than
from folklore.

---

## Sources located but deliberately not used

Recorded so nobody re-finds them and assumes they were missed.

- **DTIC AD1104981**, *Explosive Equivalence of Hydrocarbon Propellants* — returns
  HTTP 403 to automated fetches. A lead only.
- **SSCMAN 91-710 Vol. 7** (launch-site explosive siting), at
  static.e-publishing.af.mil — HTTP 403. The explosive-siting material in this
  course rests on secondary reporting of DESR 6055.09 and SSCMAN 91-710 and should
  be upgraded before use.
- **Baker & Creed**, *Stratification and rollover in liquefied natural gas storage
  tanks*, IChemE Symposium Series 139 (1995) —
  <https://www.icheme.org/media/25371/major-hazards-onshore-and-offshore-ii-icheme-symposium-series-139-1995-46-baker.pdf>
  URL resolves; **paper not read.** Anything attributed to it specifically is
  confidence C.
- **AIAA 2021-3273**, safety processes for small liquid propellant engines.
  DOI 10.2514/6.2021-3273 — **paywalled, title only.** Worth obtaining: no verified
  primary example of a university rocket-propulsion-lab safety framework was found.
- **Air Liquide Gas Encyclopedia** (`encyclopedia.airliquide.com`) — refused
  automated fetches. Would be a useful independent cross-check on the fluid
  property tables if someone can open it manually.
- **CCPS**, *Layer of Protection Analysis* — the proper citation for the LOPA
  material, not yet obtained.
- **Parker O-Ring Handbook ORD 5700** — every reachable mirror was HTTP 403 or an
  unextractable scan. See `[PARKER-ORD-5712]` for what was obtained instead.
- Several oxygen incidents widely retold online were **omitted rather than
  included with a hedge**, because no documentation could be verified. The route to
  more incidents is `[ASTM-STP-OXYGEN]` and NASA WSTF's published work — not
  general web sources.
