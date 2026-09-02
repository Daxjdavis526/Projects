# Annotated Bibliography

Every module in this course cites into this file by **tag** — the short bracketed
key at the head of each entry, e.g. `[SB]`, `[SP-8089]`, `[Bartz57]`. Tags are
stable; the entries under them may gain editions or better links over time.

Each entry was checked against a live catalogue record (NTRS, a DOI landing
page, a publisher page, or a search result naming the item explicitly) before
being listed here. Items that could not be confirmed are quarantined in
[Unverified](#unverified) at the bottom with whatever is actually known about
them. Nothing in the verified sections carries an invented report number or DOI.

Sections 1–7 hold that standard. **Sections 8 and 9 do not, deliberately.**
Section 8 collects the failure-investigation record, where the only public
account of a finding is often a press statement or a trade-news article, and it
labels which is which. Section 9 collects the short tags the two verification
worksheets used for manufacturer pages, agency fact sheets and tertiary
compilations — several of which could not be fetched at all — and states the
reliability caveat that applies to all of them. Both sections exist so that every
tag used anywhere in the course resolves to something honest about its own
provenance.

## How to read the report numbers

American propulsion literature is a stack of overlapping numbering schemes, and
knowing which one you are looking at tells you roughly what kind of document it
is before you open it.

**NASA** publications carry a series letter after the centre or agency prefix.
**SP** (Special Publication) is a curated, edited, book-length document — the
design-criteria monographs (`SP-80xx`), the history series (`SP-4xxx`), and
one-off references like `SP-125` and `SP-194` are all SPs, and they are the most
polished things NASA puts out. **RP** (Reference Publication) is a long-lived
data or code reference, e.g. `RP-1311` for CEA. **TM** (Technical Memorandum) is
in-house work, often preliminary, often a conference paper in agency clothing.
**TN** (Technical Note) is older, shorter, and usually a single result. **CR**
(Contractor Report) was written by a contractor under a NASA contract and is
where an enormous amount of the real engineering detail lives — the contract
number is in the record and often tells you which company. Pre-1958 documents
carry **NACA** prefixes instead: **RM** (Research Memorandum, originally
restricted), **TN**, and **TR** (Technical Report, the most formal). Modern NASA
numbers are dated, e.g. `NASA/SP-2004-4230`, and a `/REV n` suffix means a
genuine revision, not a reprint. Separately, every NTRS item has a **document
ID** — a 13-digit number whose first four digits are the accession year, e.g.
`19760023196`. That ID, not the report number, is what the URL uses.

**AIAA** conference papers are numbered `AIAA <year>-<sequence>`, e.g.
`AIAA 2000-3871`, and get DOIs of the form `10.2514/6.<year>-<sequence>`. AIAA
journal articles get `10.2514/1.<n>` (modern), `10.2514/3.<n>` (mid-era), or
`10.2514/8.<n>` (the 1950s *Jet Propulsion* / *ARS Journal* back catalogue) —
so a `10.2514/8.` DOI is a reliable sign you are reading something from the
Eisenhower administration. AIAA books in the *Progress in Astronautics and
Aeronautics* series have a volume number and a `10.2514/4.<n>` DOI.

**JANNAF** (Joint Army-Navy-NASA-Air Force) documents were published through
**CPIA** (the Chemical Propulsion Information Agency at JHU/APL) as `CPIA
Publication <n>`. Some, like `CPIA 246`, are public and mirrored on NTRS; most
JANNAF proceedings are distribution-limited and you will not get them from a web
search no matter how the search result is titled. **MIL-STD** / **MIL-HDBK** are
DoD documents; the space-vehicle test standard migrated from `MIL-STD-1540` to
the Air Force `SMC-S-016`, and the metallic materials handbook from
`MIL-HDBK-5` to the industry-run `MMPDS`.

**NTRS full text is free.** <https://ntrs.nasa.gov> requires no account, no
institutional login, and no payment. Every `ntrs.nasa.gov/citations/<id>` link
below has a PDF attached (also reachable at
`ntrs.nasa.gov/api/citations/<id>/downloads/<id>.pdf`). Everything with only a
DOI — AIAA, ASME, Elsevier, Springer, Wiley — is paywalled unless your library
has it. Where both exist, the NTRS link is given first.

**A unit warning that applies to the whole 1960s–70s corpus.** The SP-80xx
monographs, SP-125, CPIA 246 and most NACA/NASA propulsion work predate SI
adoption: pressures in psia, thrust in lbf, heat flux in Btu/in²·s, temperature
in °R. Do not mix them with a modern SI text mid-derivation.

---

## 1. Textbooks and reference books

**[Anderson-MCF]** — Anderson, J. D., Jr., *Modern Compressible Flow: With
Historical Perspective*, 4th ed., McGraw-Hill, 2021. ISBN 978-1-260-47144-1.
<https://www.mheducation.com/highered/product/modern-compressible-flow-with-historical-perspective-anderson.html>
The cleanest treatment of quasi-1D nozzle flow, normal and oblique shocks, and
the method of characteristics that a propulsion student needs. The historical
asides are not padding — they explain why the conventions are what they are.
Earlier editions (2nd 1990, 3rd 2003) are fine for everything this course uses.

**[Bendsoe]** — Bendsøe, M. P., and Sigmund, O., *Topology Optimization: Theory,
Methods, and Applications*, 2nd ed., Springer, Berlin, 2003. DOI:
[10.1007/978-3-662-05086-6](https://doi.org/10.1007/978-3-662-05086-6)
The reference for SIMP: element pseudo-densities, the penalisation exponent, and
the filtering that stops checkerboarding and mesh dependence. **Caveat that
matters in propulsion:** the book's worked objective is compliance minimisation,
and almost nothing in an engine is sized by compliance. A manifold, a gimbal
bracket or an injector body is sized by pressure, thermal gradient, fatigue life
and manufacturability. Read chapter 1 for the mechanics, then treat a
compliance-optimal shape as a starting geometry, not an answer.

**[Bergman]** — Bergman, T. L., Lavine, A. S., Incropera, F. P., and DeWitt,
D. P., *Fundamentals of Heat and Mass Transfer*, 8th ed., Wiley, 2017.
ISBN 978-1-118-98917-3.
<https://www.wiley.com/en-us/Fundamentals+of+Heat+and+Mass+Transfer,+8th+Edition-p-9781119353881>
The standard source for the convective correlations, fin analysis and conduction
solutions that regenerative-cooling design leans on. Older editions are still
labelled "Incropera & DeWitt"; the correlations barely move between editions, so
cite the equation and the edition, not just the book. Note the separate
*Incropera's Principles of Heat and Mass Transfer* Global Edition — different
book, different problem numbering.

**[Brennen-Pumps]** — Brennen, C. E., *Hydrodynamics of Pumps*, Concepts ETI,
1994 (ISBN 0-933283-07-5); reissued by Cambridge University Press.
Free full text from the author: <http://brennen.caltech.edu/INTPump/pumbook.pdf>
and chapter-by-chapter at <http://brennen.caltech.edu/HTMPUM/chap1.htm>
The reference for inducer cavitation, suction specific speed, rotordynamic
forces and cavitation-induced instabilities — exactly the failure modes that
turbopump inducers actually exhibit. Written by someone who worked on rocket
turbopumps, so the examples are relevant rather than municipal water supply.

**[Brown]** — Brown, C. D., *Spacecraft Propulsion*, AIAA Education Series,
1996. ISBN 978-1-56347-128-5. DOI:
[10.2514/4.862441](https://arc.aiaa.org/doi/book/10.2514/4.862441)
Short, practical, and aimed squarely at conceptual design of small on-board
systems: cold gas, monopropellant, bipropellant, solid apogee motors. Best used
for sizing tanks, blowdown behaviour and mass estimating relationships. Its
component data are a 1990s snapshot; do not treat the thruster tables as
current.

**[Clark]** — Clark, J. D., *Ignition! An Informal History of Liquid Rocket
Propellants*, Rutgers University Press, 1972; reissued in the Rutgers University
Press Classics series, 2018, ISBN 978-0-8135-9583-2.
<https://www.jstor.org/stable/j.ctt189ttdk>
The only genuinely funny book in this bibliography, and also the best account of
why the propellant combinations that survived are the ones that survived. Read
it for hypergolic ignition chemistry, storability, and the human cost of
chlorine trifluoride. It is a memoir, not a data source — do not cite its
numbers.

**[Davenas]** — Davenas, A. (ed.), *Solid Rocket Propulsion Technology*,
Pergamon Press, 1993. ISBN 978-0-08-040999-3. 606 pp. Translated from
*Technologie des Propergols Solides*.
<https://search.worldcat.org/title/22888497>
The most complete open treatment of solid propellant chemistry, processing,
ballistics and case/nozzle design in one volume, with a European (SEP/SNPE)
perspective that usefully complements the American literature. Out of print and
expensive; a library copy is the realistic route.

**[Forrester08]** — Forrester, A. I. J., Sóbester, A., and Keane, A. J.,
*Engineering Design via Surrogate Modelling: A Practical Guide*, Wiley,
Chichester, 2008. DOI:
[10.1002/9780470770801](https://doi.org/10.1002/9780470770801)
The practical companion to [Rasmussen06]: sampling plans, kriging construction,
infill criteria (expected improvement and its relatives), and how to spend a
small CFD budget so the surrogate is informative where the optimiser will go.
Read it before wrapping any optimiser around an expensive simulation. Its
worked examples are low-dimensional; a 30-parameter engine balance behaves
worse than anything in the book.

**[GradlAM]** — Gradl, P. R., Protz, C. S., Mireles, O. R., and Garcia, C. P.
(eds.), *Metal Additive Manufacturing for Propulsion Applications*, Progress in
Astronautics and Aeronautics, AIAA, 2022. ISBN 978-1-62410-626-2. DOI:
[10.2514/4.106279](https://arc.aiaa.org/doi/book/10.2514/4.106279)
The current reference for how AM is actually qualified for combustion devices:
process selection, alloy behaviour (including GRCop), post-processing, NDE and
part-to-part variability. This is a fast-moving field and this book is the
snapshot with the most engineering rigour; expect the process-capability numbers
to age faster than the methodology.

**[HH]** — Huzel, D. K., and Huang, D. H., *Modern Engineering for Design of
Liquid-Propellant Rocket Engines*, revised and enlarged ed., Progress in
Astronautics and Aeronautics Vol. 147, AIAA, 1992. ISBN 978-1-56347-013-4.
<https://ui.adsabs.harvard.edu/abs/1992PrAA..147.....H/abstract>
The single most useful design book in this list: real sizing procedures for
injectors, thrust chambers, turbopumps, valves, gimbals and tanks, with worked
examples for a hypothetical engine family carried through the whole book. It is
a revision of [SP-125] with the same authors — if you own this you mostly do not
need the SP, though the SP is free. Units are US customary throughout, and the
engine practice described is Rocketdyne circa 1965–1985.

**[HP]** — Hill, P. G., and Peterson, C. R., *Mechanics and Thermodynamics of
Propulsion*, 2nd ed., Addison-Wesley, 1992. ISBN 978-0-201-14659-2.
<https://www.pearson.com/en-us/subject-catalog/p/mechanics-and-thermodynamics-of-propulsion/P200000003466/9780201146592>
Mostly an airbreathing text, but its chapters on chemical rocket thermochemistry,
nozzle flow, solid propellant ballistics and turbomachinery fundamentals are
unusually clear and derive things [SB] asserts. Use it when you want to see the
derivation rather than the design rule.

**[Humble]** — Humble, R. W., Henry, G. N., and Larson, W. J. (eds.), *Space
Propulsion Analysis and Design*, McGraw-Hill, 1995. ISBN 978-0-07-031320-0.
<https://search.library.wisc.edu/catalog/9910162099802121>
Structured as a design handbook with explicit step-by-step procedures and
mass-estimating relationships for liquid, solid, hybrid, and electric systems.
The best complement to [SB] when you have to actually produce numbers for a
concept. A later reprint exists as "LSC Space Propulsion Analysis and Design"
(ISBN 978-0-07-723029-6) with the same content.

**[Japikse]** — Japikse, D., Marscher, W. D., and Furst, R. B., *Centrifugal
Pump Design and Performance*, Concepts ETI, 1997. ISBN 978-0-933283-09-1.
<https://search.worldcat.org/title/38157355>
Practical impeller and diffuser design, loss models, and rotordynamic/mechanical
integration. Written for industrial pumps, so translate the specific-speed
ranges before applying them to a LOX pump; the loss physics carries over
unchanged.

**[Kubota]** — Kubota, N., *Propellants and Explosives: Thermochemical Aspects
of Combustion*, 3rd ed., Wiley-VCH, 2015. ISBN 978-3-527-33178-9. DOI:
[10.1002/9783527693481](https://onlinelibrary.wiley.com/doi/book/10.1002/9783527693481)
The chemistry-side companion to [Davenas]: burning-rate mechanisms, AP/HTPB and
double-base combustion, catalysts and burn-rate modifiers, energetics. Stronger
on combustion physics than on motor hardware. The 3rd edition adds green
propellants.

**[LM]** — Lefebvre, A. H., and McDonell, V. G., *Atomization and Sprays*,
2nd ed., CRC Press, 2017. ISBN 978-1-4987-3625-1. DOI:
[10.1201/9781315120911](https://www.taylorfrancis.com/books/mono/10.1201/9781315120911/atomization-sprays-arthur-lefebvre-vincent-mcdonell)
The source of the SMD correlations used for injector spray sizing, plus breakup
regimes, sheet and jet instability, and measurement technique. Most of the
correlations were fitted to gas-turbine atomizers at modest pressure — check the
stated validity range before using one at rocket chamber conditions.

**[LRECI]** — Yang, V., and Anderson, W. E. (eds.), *Liquid Rocket Engine
Combustion Instability*, Progress in Astronautics and Aeronautics Vol. 169,
AIAA, 1995. ISBN 978-1-56347-183-4. 577 pp. DOI:
[10.2514/4.866371](https://arc.aiaa.org/doi/book/10.2514/4.866371)
The successor to [SP-194] and the standard modern reference: engine case
studies, driving mechanisms, analysis methods, and stability-rating test
practice. Chapters are by different authors and vary in depth; read the case
studies first, they are what make the theory legible.

**[LRTC]** — Yang, V., Habiballah, M., Hulka, J., and Popp, M. (eds.), *Liquid
Rocket Thrust Chambers: Aspects of Modeling, Analysis, and Design*, Progress in
Astronautics and Aeronautics Vol. 200, AIAA, 2004. ISBN 978-1-56347-223-7.
725 pp. DOI:
[10.2514/4.866760](https://arc.aiaa.org/doi/book/10.2514/4.866760)
26 chapters covering injector element physics (including swirl and coaxial
elements), atomization and mixing, supercritical injection, heat transfer, and
chamber modelling — the most current comprehensive treatment of combustion
devices. This is where to look for swirl-injector design theory; see the
Unverified section regarding the specific Bazarov attribution.

**[Martins]** — Martins, J. R. R. A., and Ning, A., *Engineering Design
Optimization*, Cambridge University Press, 2021. Author-hosted free PDF:
<https://mdobook.github.io/>
The current textbook for gradient-based and gradient-free design optimisation,
including adjoints, constraint handling and the practicalities of coupling
disciplinary solvers. The free PDF is the authors' own. Aerospace examples are
mostly aerodynamic rather than propulsive, but the machinery transfers directly
to a cycle-balance or nozzle-contour problem.

**[MIT16512]** — Martinez-Sanchez, M., *16.512 Rocket Propulsion*, MIT
OpenCourseWare, Fall 2005.
<https://ocw.mit.edu/courses/16-512-rocket-propulsion-fall-2005/>
Free graduate lecture notes covering thermochemistry, nozzle flow with real-gas
and kinetic effects, cooling and wall stresses, turbomachinery, pressurization,
and solid/hybrid ballistics. Terse and mathematical — best used alongside a
textbook rather than instead of one. Lecture PDFs download individually.

**[Peters00]** — Peters, N., *Turbulent Combustion*, Cambridge University Press,
Cambridge, 2000. DOI:
[10.1017/CBO9780511612701](https://doi.org/10.1017/CBO9780511612701)
The flamelet concept and its regime diagram, which is where the assumption
"chemistry is fast compared with the resolved flow" gets made explicit. Read it
to know what a flamelet closure is claiming. **Caveat:** the classical
formulation assumes a single conserved scalar, and a staged-combustion chamber
with three feed streams (oxidiser, fuel, preburner gas) violates that
assumption before the first cell is meshed.

**[Poinsot]** — Poinsot, T., and Veynante, D., *Theoretical and Numerical
Combustion*, 3rd ed., 2011.
The other standard text, and the one to read for the numerics rather than the
theory: boundary conditions for compressible reacting flow (the NSCBC
treatment), acoustic reflection at inlets and outlets, and the discretisation
choices that decide whether a reacting simulation is even well-posed. If a
combustion CFD result looks like an instability, this is where you check
whether the boundary condition invented it.

**[Rasmussen06]** — Rasmussen, C. E., and Williams, C. K. I., *Gaussian Processes
for Machine Learning*, MIT Press, Cambridge, MA, 2006. Author-hosted free PDF:
<http://gaussianprocess.org/gpml/>
The reference for Gaussian-process regression, which is the surrogate most used
for expensive propulsion simulations because it returns a variance as well as a
mean. **The caveat is the whole point:** that variance is conditional on the
kernel, so a confidently wrong kernel produces confidently wrong error bars, and
fitting cost is O(n³) in the number of training points.

**[Saltelli08]** — Saltelli, A., Ratto, M., Andres, T., Campolongo, F., Cariboni,
J., Gatelli, D., Saisana, M., and Tarantola, S., *Global Sensitivity Analysis:
The Primer*, Wiley, Chichester, 2008. DOI:
[10.1002/9780470725184](https://doi.org/10.1002/9780470725184)
Short, readable, and the book that makes one-factor-at-a-time sensitivity
studies indefensible. Read it for the practical estimators of the [Sobol01]
indices and for the sample sizes they actually need. **Caveat:** variance-based
indices lose their clean interpretation when inputs are strongly correlated,
which in an engine model they usually are.

**[SB]** — Sutton, G. P., and Biblarz, O., *Rocket Propulsion Elements*, Wiley.
7th ed. 2001 (ISBN 978-0-471-32642-7); 8th ed. 2010 (ISBN 978-0-470-08024-5);
9th ed. 2017 (ISBN 978-1-118-75365-1); 10th ed. 2026 with J. H. Morehart
(ISBN 978-1-394-18720-1).
<https://www.wiley.com/en-ie/rocket-propulsion-elements-9th-edition-p-9781394187201>
The default first reference for the entire field and the book this course cites
most. *This is one book, not two* — it appears twice in many reading lists
because the edition changed, not because there are two works.
Edition differences matter: chapter and equation numbering shifts between 7th,
8th and 9th, so always cite the edition. The 8th and 9th expand electric
propulsion and update the engine tables; the 10th adds additive manufacturing,
stage recovery and reuse, and current launch vehicles. Any of 7–10 is adequate
for the fundamentals; use the newest you can get for the hardware tables.

**[SLPRE]** — Sutton, G. P., *History of Liquid Propellant Rocket Engines*,
Library of Flight, AIAA, 2006. ISBN 978-1-56347-649-5. DOI:
[10.2514/4.868870](https://arc.aiaa.org/doi/10.2514/4.868870)
Country-by-country and company-by-company account of who built what and why,
covering the US, Russia, Ukraine, Germany, France, Japan, the UK, China and
India. Unmatched for tracing why a particular cycle or injector style became
house practice at a given organisation. It is history written by an engineer, so
the technical claims are trustworthy; it stops in the mid-2000s and so predates
the entire commercial-launch era.

**[SMAD]** — Larson, W. J., and Wertz, J. R. (eds.), *Space Mission Analysis and
Design*, 3rd ed., Space Technology Library Vol. 8, Microcosm/Kluwer, 1999.
ISBN 978-1-881883-10-4.
<https://spacetechnologyseries.com/books/Space-Mission-Analysis-and-Design.html>
Cited here only for its propulsion chapter and its ΔV budgeting, which are the
standard first-cut method for sizing a spacecraft propulsion system in mission
context. For propulsion depth go to [Brown] or [Humble]; SMAD's value is that it
puts propulsion in the same units and framework as the rest of the spacecraft.

**[SP-125]** — Huzel, D. K., and Huang, D. H., *Design of Liquid Propellant
Rocket Engines*, 2nd ed., NASA SP-125, NASA, 1967.
<https://ntrs.nasa.gov/citations/19710019929>
The free ancestor of [HH], and still an excellent design text in its own right.
Everything is US customary and the technology baseline is early-1960s
Rocketdyne. Note the bibliographic tangle: the NTRS record is titled "Second
Edition" and dated 1967, while its NTRS accession is 1971 — which is why the
same book is cited in the literature as 1967 and as 1971. Cite it as "NASA
SP-125 (2nd ed.)" and give the NTRS ID.

**[SP-194]** — Harrje, D. T., and Reardon, F. H. (eds.), *Liquid Propellant
Rocket Combustion Instability*, NASA SP-194, NASA, 1972.
<https://ntrs.nasa.gov/citations/19720026079>
The foundational compendium: sensitive time lag theory, mechanisms, acoustic
modes, baffles and absorbers, and the stability-rating methods (bombs, pulse
guns, directed flow) still used today. Free, and superseded in currency but not
in coverage by [LRECI]. Its analysis chapters assume linear acoustics; read them
knowing that the nonlinear picture came later.

**[Turner]** — Turner, M. J. L., *Rocket and Spacecraft Propulsion: Principles,
Practice and New Developments*, 3rd ed., Springer-Praxis, 2009.
ISBN 978-3-540-69202-7. DOI:
[10.1007/978-3-540-69203-4](https://link.springer.com/book/10.1007/978-3-540-69203-4)
A readable single-volume survey — lighter than [SB], stronger on launch-vehicle
context and on European hardware (Ariane, Vega). Good as a first pass or a
sanity check; not detailed enough to design from.

**[Zandbergen]** — Zandbergen, B. T. C., *Thermal Rocket Propulsion*, course
reader AE4-S01, Delft University of Technology (multiple versions, e.g. v2.01
2004, v2.04). Related: Zandbergen, *Modern Liquid Propellant Rocket Engines,
2000 Outlook*, TU Delft, 2000.
<https://research.tudelft.nl/en/publications/modern-liquid-propellant-rocket-engines-2000-outlook/>
European course notes with unusually good tabulated engine data and a systematic
approach to engine selection. Caveat: this circulates as a versioned reader
rather than a fixed publication, so always record the version number you used;
copies found loose on the web are frequently the wrong version.

**[ZH]** — Zucrow, M. J., and Hoffman, J. D., *Gas Dynamics*, Vol. 1 (1976,
ISBN 978-0-471-98440-5) and Vol. 2: *Multi-Dimensional Flow* (1977,
ISBN 978-0-471-01806-3), Wiley; reprinted by Krieger.
<https://www.wiley.com/en-us/Gas+Dynamics,+Volume+1-p-9780471984405>
Volume 2 is the reason to seek this out: it is the definitive engineering
treatment of the method of characteristics for axisymmetric nozzle design, which
is what actually lies behind [Rao58]. Volume 1 covers 1D and wave flow. Long out
of print; library or used only.

---

## 2. NASA SP-8000 design criteria monographs (chemical propulsion)

These are the "Space Vehicle Design Criteria" series, written 1965–1980 by
contractor teams and NASA reviewers. Each one states recommended practice, the
failures that motivated it, and the criteria a design must satisfy. They are
the closest thing the field has to a codified body of practice, they are all
free on NTRS, and they are all frozen in the technology of their date. Two
standing caveats apply to every entry below: **units are US customary**, and
**materials, NDE and analysis capability have moved on** — the design *logic*
ages far better than the design *allowables*.

There is no single NTRS index record for the series. To enumerate it, search
NTRS for the report number pattern `NASA-SP-80` and filter, or step through the
numbers directly; the 31 propulsion-relevant volumes this course uses are all
listed here.

**[SP-8007]** — Weingarten, V. I., Seide, P., and Peterson, J. P., *Buckling of
Thin-Walled Circular Cylinders*, NASA SP-8007, Aug. 1968.
<https://ntrs.nasa.gov/citations/19690013955>
**This is a structures monograph, not a propulsion one** — it is in this list
only because pressure-fed tanks, motor cases and thrust structures are
thin-walled cylinders and this is where the classical knockdown factors come
from. Its empirical knockdown factors are famously and deliberately
conservative. Superseded for current work by *Buckling of Thin-Walled Circular
Cylinders*, NASA/SP-8007-2020/REV 2, Hilburger, Dec. 2020,
<https://ntrs.nasa.gov/citations/20205011530> — use Rev 2 for design, the 1968
original for understanding where the old factors came from.

**[SP-8025]** — *Solid Rocket Motor Metal Cases*, NASA SP-8025, Apr. 1970.
<https://ntrs.nasa.gov/citations/19700020430>
Case material selection, fracture control, proof testing, and the design of
joints, ports and attachments for steel and titanium cases. Predates the general
adoption of filament-wound composite cases, so read it as the metal-case
baseline that composites were measured against.

**[SP-8039]** — *Solid Rocket Motor Performance Analysis and Prediction*, NASA
SP-8039, May 1971. <https://ntrs.nasa.gov/citations/19720011135>
How to predict delivered Isp and the pressure-time trace, and how to account for
the loss mechanisms (two-phase flow, divergence, kinetics, heat loss, erosive
burning). The single best free explanation of why a motor never delivers its
theoretical performance.

**[SP-8041]** — Keller, R. B., Jr., and Kordig, J. W., Jr., *Captive-Fired
Testing of Solid Rocket Motors*, NASA SP-8041, Mar. 1971.
<https://ntrs.nasa.gov/citations/19710021390>
Static-test-stand design, thrust and pressure measurement, instrumentation and
data reduction for SRMs. Valuable for understanding what a published motor test
curve does and does not measure. Instrumentation technology is thoroughly dated;
the measurement *logic* is not.

**[SP-8051]** — *Solid Rocket Motor Igniters*, NASA SP-8051, Mar. 1971.
<https://ntrs.nasa.gov/citations/19710020870>
Pyrogen and pyrotechnic igniter sizing, ignition transient prediction, and the
failure modes (hangfire, overpressure, hot-gas erosion). Still the standard
reference for ignition-transient design logic.

**[SP-8052]** — Jakobsen, J. K., and Keller, R. B., Jr., *Liquid Rocket Engine
Turbopump Inducers*, NASA SP-8052, May 1971.
<https://ntrs.nasa.gov/citations/19710025474>
Inducer hydrodynamic design, suction performance, cavitation limits and
rotating-cavitation behaviour. Pairs directly with [Brennen-Pumps]; the SP gives
the design rules, Brennen gives the physics behind them.

**[SP-8064]** — *Solid Propellant Selection and Characterization*, NASA SP-8064,
June 1971. <https://ntrs.nasa.gov/citations/19720006088>
How to choose a propellant family and what properties must be measured to
characterise it: burn rate and its exponent, mechanical properties, ageing,
hazard classification. Formulation-level detail is deliberately limited, which
suits this course's scope boundary.

**[SP-8073]** — *Solid Propellant Grain Structural Integrity Analysis*, NASA
SP-8073, June 1973. <https://ntrs.nasa.gov/citations/19740011276>
Viscoelastic analysis of the grain under cure shrinkage, thermal cycling,
storage, ignition pressurisation and flight loads — i.e. why grains crack.
Analysis methods predate general FEA; the loading cases and failure criteria are
still the right ones.

**[SP-8075]** — *Solid Propellant Processing Factors in Rocket Motor Design*,
NASA SP-8075, Oct. 1971. <https://ntrs.nasa.gov/citations/19720024117>
The design-for-manufacture volume: how mixing, casting, curing and mandrel
extraction constrain what grain geometry you are allowed to draw. Explains a
large fraction of otherwise mysterious real-motor design choices.

**[SP-8076]** — *Solid Propellant Grain Design and Internal Ballistics*, NASA
SP-8076, Mar. 1972. <https://ntrs.nasa.gov/citations/19730007077>
Grain geometry families, burn-back and web analysis, thrust-time tailoring, and
equilibrium chamber pressure. With [SP-8039] this is the core of solid internal
ballistics and the primary source behind this course's Part III ballistics
modules.

**[SP-8080]** — *Liquid Rocket Pressure Regulators, Relief Valves, Check Valves,
Burst Disks, and Explosive Valves*, NASA SP-8080, Mar. 1973.
<https://ntrs.nasa.gov/citations/19740002611>
Design and failure modes of the pressurisation-system components everyone
forgets until they leak. Regulator droop, lockup, chatter and cracking-pressure
behaviour are all treated properly.

**[SP-8081]** — *Liquid Propellant Gas Generators*, NASA SP-8081, Mar. 1972.
<https://ntrs.nasa.gov/citations/19730018978>
Gas generator design for turbine drive: mixture-ratio control, temperature
uniformity, injector design and start behaviour. Essential background for
gas-generator-cycle engines.

**[SP-8087]** — *Liquid Rocket Engine Fluid-Cooled Combustion Chambers*, NASA
SP-8087, Apr. 1972. <https://ntrs.nasa.gov/citations/19730022965>
Regenerative and film cooling: channel sizing, coolant-side heat transfer and
pressure drop, wall temperature and stress, low-cycle fatigue life. The design
counterpart to [Bartz57]'s gas-side coefficient. Materials coverage predates
GRCop and additive manufacturing entirely — see [GRCop] and [Gradl18].

**[SP-8088]** — Wagner, W. A., and Keller, R. B., *Liquid Rocket Metal Tanks and
Tank Components*, NASA SP-8088, May 1974.
<https://ntrs.nasa.gov/citations/19750004950>
Tank shell design, membrane and discontinuity stresses, slosh baffles,
antivortex devices, sumps and outlets. Modern pressure-vessel work is governed
instead by [AIAA-S-080]; this is the propulsion-side rationale behind it.

**[SP-8089]** — Gill, G. S., and Nurick, W. H., *Liquid Rocket Engine
Injectors*, NASA SP-8089, Mar. 1976. Contract NAS3-12014.
<https://ntrs.nasa.gov/citations/19760023196>
The single most important free document on injector design: element types
(impinging, coaxial, showerhead, splash plate), mixing and atomization,
performance versus stability trade-offs, chamber compatibility and wall
streaking. Used heavily throughout Part II of this course. Pintle elements are
essentially absent — for those go to [Dressler00] and [LRTC].

**[SP-8090]** — *Liquid Rocket Actuators and Operators*, NASA SP-8090, May 1973.
<https://ntrs.nasa.gov/citations/19740009672>
Pneumatic, hydraulic and electromechanical actuation for valves and gimbals:
sizing, response, and failure modes. Read with [SP-8094] and [SP-8097].

**[SP-8094]** — *Liquid Rocket Valve Components*, NASA SP-8094, Aug. 1973.
<https://ntrs.nasa.gov/citations/19740019163>
Component level: seats, seals, poppets, bellows, springs, bearings. Where valve
leakage and galling actually come from.

**[SP-8097]** — *Liquid Rocket Valve Assemblies*, NASA SP-8097, Nov. 1973.
<https://ntrs.nasa.gov/citations/19740018866>
Assembly level: main propellant valves, sequencing, water-hammer and surge on
opening/closing, cryogenic chilldown effects. Together with [SP-8094] this is
the reference for engine start and shutdown sequencing hardware.

**[SP-8100]** — *Liquid Rocket Engine Turbopump Gears*, NASA SP-8100, Mar. 1974.
<https://ntrs.nasa.gov/citations/19750002094>
Narrow but definitive: gear-train design for geared turbopumps, tooth loading,
lubrication in a cryogenic environment, dynamic loads. Relevant mainly to
historical engines and to modern small-pump architectures that revive gearing.

**[SP-8101]** — *Liquid Rocket Engine Turbopump Shafts and Couplings*, NASA
SP-8101, Sept. 1972. <https://ntrs.nasa.gov/citations/19740006328>
Shaft sizing, critical speeds, torsional dynamics, and coupling design.
Rotordynamics coverage is pre-modern; use it with [Brennen-Pumps] and
[SP-8107].

**[SP-8107]** — *Turbopump Systems for Liquid Rocket Engines*, NASA SP-8107,
Aug. 1974. <https://ntrs.nasa.gov/citations/19750012398>
The system-level turbopump volume: architecture selection, shaft arrangement,
axial thrust balance, seals and bearing systems, and interaction with the engine
cycle. Start here before the component monographs [SP-8052], [SP-8100],
[SP-8101], [SP-8109], [SP-8110], [SP-8125].

**[SP-8109]** — *Liquid Rocket Engine Centrifugal Flow Turbopumps*, NASA
SP-8109, Dec. 1973. <https://ntrs.nasa.gov/citations/19740020848>
Centrifugal pump stage design for rocket service: impeller and diffuser sizing,
head-flow prediction, off-design and stall behaviour, and material choice for
LOX and LH2.

**[SP-8110]** — *Liquid Rocket Engine Turbines*, NASA SP-8110, Jan. 1974.
<https://ntrs.nasa.gov/citations/19740026132>
Turbine stage design and efficiency prediction for the partial-admission,
high-pressure-ratio turbines rocket engines actually use — a regime the
gas-turbine literature does not cover well. Includes blade stress and thermal
issues.

**[SP-8112]** — *Pressurization Systems for Liquid Rockets*, NASA SP-8112,
Oct. 1975. <https://ntrs.nasa.gov/citations/19760015212>
Stored-gas, autogenous and chemical pressurisation: gas requirement
calculations, collapse factors, heat and mass transfer in the ullage. The
reference for sizing a helium bottle honestly rather than with a rule of thumb.

**[SP-8113]** — *Liquid Rocket Engine Combustion Stabilization Devices*, NASA
SP-8113, Nov. 1974. <https://ntrs.nasa.gov/citations/19750020175>
Baffles, acoustic cavities and absorbers: how to size them, what they cost in
performance and cooling, and how to rate the result. The hardware complement to
[SP-194] and [LRECI].

**[SP-8115]** — Ellis, R. A., and Keller, R. B., Jr., *Solid Rocket Motor
Nozzles*, NASA SP-8115, June 1975.
<https://ntrs.nasa.gov/citations/19760013126>
Ablative and carbon-carbon nozzle design, throat erosion prediction, insulation,
and submerged and movable nozzle configurations. Still the standard free
reference for SRM nozzle thermostructural design.

**[SP-8119]** — *Liquid Rocket Disconnects, Couplings, Fittings, Fixed Joints,
and Seals*, NASA SP-8119, Sept. 1976.
<https://ntrs.nasa.gov/citations/19770017247>
The plumbing-integrity volume: joint types, seal selection, leakage criteria,
and cryogenic and vibration effects. Unglamorous and responsible for a large
share of real test failures.

**[SP-8120]** — *Liquid Rocket Engine Nozzles*, NASA SP-8120, July 1976.
<https://ntrs.nasa.gov/citations/19770009165>
Contour design (including bell/thrust-optimised contours descended from
[Rao58]), performance losses, extension design, and separation and side-load
considerations. The design-practice bridge between [Rao58] and [SFS54].

**[SP-8123]** — *Liquid Rocket Lines, Bellows, Flexible Hoses, and Filters*,
NASA SP-8123, Apr. 1977. <https://ntrs.nasa.gov/citations/19780008146>
Line sizing, flow-induced vibration, bellows fatigue and squirm, and filtration
requirements. Directly relevant to POGO and to feed-system dynamics.

**[SP-8124]** — *Liquid Rocket Engine Self-Cooled Combustion Chambers*, NASA
SP-8124, Sept. 1977. <https://ntrs.nasa.gov/citations/19780013268>
Ablative, radiation-cooled and refractory-metal chambers — the architecture used
by nearly every small storable-propellant engine. Complements [SP-8087], which
covers only fluid-cooled designs.

**[SP-8125]** — Scheer, D. D., Huppert, M. C., Viteri, F., Farquhar, J., and
Keller, R. B., Jr., *Liquid Rocket Engine Axial-Flow Turbopumps*, NASA SP-8125,
Apr. 1978. <https://ntrs.nasa.gov/citations/19780023221>
Multistage axial pump design, mostly relevant to LH2 service (J-2, SSME class).
The last of the propulsion monographs to be issued, and the one with the
narrowest application.

---

## 3. Classic papers

**[Bartz57]** — Bartz, D. R., "A Simple Equation for Rapid Estimation of Rocket
Nozzle Convective Heat Transfer Coefficients," *Jet Propulsion*, Vol. 27, No. 1,
Jan. 1957, pp. 49–51. DOI:
[10.2514/8.12572](https://arc.aiaa.org/doi/pdfplus/10.2514/8.12572)
The correlation every preliminary cooling calculation still starts from. Three
pages long. Caveats the paper itself states and users routinely forget: it is a
*rapid estimate*, it assumes an attached turbulent boundary layer with
Dittus-Boelter-type behaviour, and it does not know about film cooling,
curvature effects, injector-driven maldistribution or streaking. Real throat
fluxes deviate substantially. Use it to size, not to certify.

**[BDP70]** — Beckstead, M. W., Derr, R. L., and Price, C. F., "A Model of
Composite Solid-Propellant Combustion Based on Multiple Flames," *AIAA Journal*,
Vol. 8, No. 12, 1970, pp. 2200–2207. DOI:
[10.2514/3.6087](https://arc.aiaa.org/doi/10.2514/3.6087)
The BDP model: three flames (primary binder-oxidizer, AP monopropellant, final
diffusion) surrounding each oxidizer crystal, from which burning rate and its
pressure dependence emerge rather than being fitted. The reason a composite
propellant's burn-rate exponent has a physical explanation. Later work has
refined the flame structure; the framework survives.

**[CC56]** — Crocco, L., and Cheng, S.-I., *Theory of Combustion Instability in
Liquid Propellant Rocket Motors*, AGARDograph No. 8, Butterworths, London, 1956.
DTIC copy: <https://apps.dtic.mil/sti/tr/pdf/AD0688924.pdf>
Origin of the sensitive time-lag (n-τ) model, still the primary analytical tool
for low- and intermediate-frequency instability and the reason "n and tau"
appear in every stability discussion since. It is a linear theory with an
empirically determined pair of parameters — it tells you whether a mode is
driven, not what the limit-cycle amplitude will be.

**[Culick68]** — Culick, F. E. C., "A Review of Calculations for Unsteady
Burning of a Solid Propellant," *AIAA Journal*, Vol. 6, No. 12, 1968,
pp. 2241–2255. DOI:
[10.2514/3.4980](https://arc.aiaa.org/doi/abs/10.2514/3.4980)
Unifies the competing quasi-steady models of unsteady solid propellant burning
and produces the pressure-coupled response function that solid motor stability
analysis is built on. Culick's later work on acoustic mode expansion is the
other half of the solid-instability toolkit.

**[Dressler00]** — Dressler, G. A., and Bauer, J. M., "TRW Pintle Engine
Heritage and Performance Characteristics," AIAA Paper 2000-3871, 36th
AIAA/ASME/SAE/ASEE Joint Propulsion Conference, July 2000. DOI:
[10.2514/6.2000-3871](https://arc.aiaa.org/doi/10.2514/6.2000-3871)
The open-literature account of pintle injectors: why a single central element
behaves so differently from a multi-element face, why pintles are inherently
stable and deeply throttleable, and the TRW/LMDE lineage that leads to the Apollo
descent engine and, later, Merlin. It is a heritage-and-performance survey by the
vendor, not a design method — take the design guidance as directional.

**[Grisnik87]** — Grisnik, S. P., Smith, T. A., and Saltz, L. E., "Experimental
Study of Low Reynolds Number Nozzles," NASA TM-89858 / AIAA-87-0992, 1987.
NTRS: <https://ntrs.nasa.gov/citations/19870010950>. DOI:
[10.2514/6.1987-992](https://doi.org/10.2514/6.1987-992)
Conical, bell, trumpet and modified-trumpet nozzles plus a sharp-edged orifice,
tested with unheated nitrogen and hydrogen over throat Reynolds numbers of
roughly 500–9,000. Together with [Spisz65] it is the experimental basis for the
viscous-efficiency correlation used in Module 29, and it is the source for the
result that contour refinement stops paying at low Re because the boundary layer
has already eaten the divergent section.

**[LR57]** — Lenoir, J. M., and Robillard, G., "A Mathematical Method to Predict
the Effects of Erosive Burning in Solid-Propellant Rockets," *Sixth Symposium
(International) on Combustion*, 1957, pp. 667–683. DOI:
[10.1016/S0082-0784(57)80092-7](https://www.sciencedirect.com/science/article/abs/pii/S0082078457800927);
NTRS: <https://ntrs.nasa.gov/citations/19630038229>
The heat-transfer-based erosive burning model (r = r₀ + αG^0.8 e^(−βr₀ρ/G) in
its usual form) that is still the most widely used engineering correlation for
erosive burning. Its constants are propellant- and geometry-specific and must be
fitted; treat published values as starting guesses only.

**[Menter94]** — Menter, F. R., "Two-Equation Eddy-Viscosity Turbulence Models
for Engineering Applications," *AIAA Journal*, Vol. 32, No. 8, 1994,
pp. 1598–1605. DOI:
[10.2514/3.12149](https://arc.aiaa.org/doi/10.2514/3.12149)
The SST k–ω model: k–ω near the wall, k–ε in the free stream, blended, with the
shear-stress-transport limiter on eddy viscosity. It is the RANS workhorse for
nozzle and cooling-channel work because it handles adverse pressure gradients
and separation onset better than standard k–ε. It remains a two-equation
eddy-viscosity model: it will not tell you about combustion-driven unsteadiness,
and its separation prediction is a calibrated behaviour, not a derived one.

**[Nurick76]** — Nurick, W. H., "Orifice Cavitation and Its Effect on Spray
Mixing," *Journal of Fluids Engineering*, Vol. 98, No. 4, Dec. 1976,
pp. 681–687. DOI:
[10.1115/1.3448452](https://asmedigitalcollection.asme.org/fluidsengineering/article/98/4/681/440036/Orifice-Cavitation-and-Its-Effect-on-Spray-Mixing)
Where the cavitation number K and the "Cd ≈ 0.61·√K" hydraulic-flip behaviour of
sharp-edged injector orifices comes from, plus the finding that cavitation
degrades mixing uniformity in circular orifices but not rectangular ones. The
reason injector orifice L/d and inlet radius are design parameters and not
details. Same author as [SP-8089]; a published discussion of the paper appeared
in the same journal the following year.

**[OY93]** — Oefelein, J. C., and Yang, V., "Comprehensive Review of
Liquid-Propellant Combustion Instabilities in F-1 Engines," *Journal of
Propulsion and Power*, Vol. 9, No. 5, 1993, pp. 657–677. DOI:
[10.2514/3.23674](https://arc.aiaa.org/doi/10.2514/3.23674)
The definitive account of the F-1 instability programme: ~2000 tests, the baffle
and injector-pattern evolution, and what "dynamic stability" was actually
demonstrated to mean. The best available case study of an instability fix
achieved by systematic testing rather than by theory, and honest about that.

**[Priem60]** — Priem, R. J., and Heidmann, M. F., *Propellant Vaporization as a
Design Criterion for Rocket-Engine Combustion Chambers*, NASA TR R-67, NASA
Lewis Research Center, 1960. Catalogue record:
<https://catalog.hathitrust.org/Record/011432577>
The vaporisation-limited chamber-length analysis: compute the fraction of the
spray vaporised along the chamber and correlate performance against an effective
length. This is where the modern habit of sizing L* against a vaporisation
criterion rather than a residence-time rule of thumb comes from, and the paper is
explicit that a small number of large drops, not the mean drop size, is what
costs performance. **Caveat:** it is a subcritical, discrete-droplet picture. It
does not describe what a supercritical LOX jet does above the critical pressure,
which is the regime almost every engine above ~60 bar operates in. No NTRS
document ID was confirmed for this report in this session; cite the report
number.

**[Quentmeyer77]** — Quentmeyer, R. J., "Experimental Fatigue Life Investigation of
Cylindrical Thrust Chambers," NASA TM X-73665 / AIAA 77-893, 1977.
NTRS: <https://ntrs.nasa.gov/citations/19770024295>
Twenty-one cylindrical liners (OFHC copper, Amzirc, NARloy-Z) cycled to failure
with hydrogen–oxygen at ~54 MW/m² average throat flux. The source of the
"doghouse" failure mode: progressive thinning and bulging of the cooling-channel
land at the centreline, ending in tensile rupture. Cite it for what low-cycle
thermal fatigue does to a regeneratively cooled wall, and for the observation
that isothermal coupon tests rank alloys differently from cycled chambers.

**[Rao58]** — Rao, G. V. R., "Exhaust Nozzle Contour for Optimum Thrust,"
*Journal of Jet Propulsion*, Vol. 28, No. 6, June 1958, pp. 377–382. DOI:
[10.2514/8.7324](https://arc.aiaa.org/doi/10.2514/8.7324)
The variational solution for the maximum-thrust nozzle contour at a fixed length
and ambient pressure, constructed by method of characteristics. Effectively every
bell nozzle designed since about 1960 descends from this. Assumes isentropic,
adiabatic, frictionless, chemically frozen flow — real contours are corrected for
boundary layer and kinetics afterwards.

**[Rao60]** — Rao, G. V. R., "Approximation of Optimum Thrust Nozzle Contour,"
*ARS Journal*, Vol. 30, No. 6, June 1960, p. 561.
<https://cir.nii.ac.jp/crid/1572261550453372544>
The one-page follow-up that made [Rao58] usable: a parabolic approximation to
the optimum contour, defined by initial and exit wall angles and percentage
length. This — not the full characteristics solution — is what "80% bell" means
and what almost every textbook nozzle contour actually is. A research note, not a
full paper; check the length ratio conventions of whatever chart you are reading
before trusting it.

**[Ricciardi92]** — Ricciardi, A., "Generalized Geometric Analysis of Right
Circular Cylindrical Star Perforated and Tapered Grains," *Journal of Propulsion
and Power*, Vol. 8, No. 1, 1992, pp. 51–58. DOI:
[10.2514/3.23441](https://arc.aiaa.org/doi/10.2514/3.23441)
Closed-form burn-back for star and tapered grains, taken far enough to cover the
sliver phase and the transitions between burning-surface regimes. The reference
for why a star grain's burn-area history has corners in it, and the analytical
check to run before trusting a numerical burn-back code.

**[Rothe71]** — Rothe, D. E., "Electron-Beam Studies of Viscous Flow in Supersonic
Nozzles," *AIAA Journal*, Vol. 9, No. 5, 1971, pp. 804–811. DOI:
[10.2514/3.6279](https://arc.aiaa.org/doi/10.2514/3.6279)
Non-intrusive electron-beam density measurements inside small supersonic nozzles,
showing boundary layers from opposite walls merging so that the "nozzle" is
better described as a viscous duct. The experimental evidence behind the
statement in Module 29 that below a throat Reynolds number of order 10³ there is
no isentropic core left to expand.

**[Rupe65]** — Rupe, J. H., *An Experimental Correlation of the Nonreactive
Properties of Injection Schemes and Combustion Effects in a Liquid-Propellant
Rocket Engine, Part I: The Application of Nonreactive-Spray Properties to
Rocket-Motor Injector Design*, JPL TR 32-255, July 1965.
<https://ntrs.nasa.gov/citations/19650023528>
Rupe's cold-flow mixing work at JPL established that impinging-element mixing
uniformity measured non-reactively predicts combustion performance, and gave the
momentum-ratio criterion for like- and unlike-doublet design that [SP-8089] later
codified. Parts II, V and VI are also on NTRS
(<https://ntrs.nasa.gov/citations/19670017903>,
<https://ntrs.nasa.gov/citations/19690010929>,
<https://ntrs.nasa.gov/citations/19660006048>). Rupe's earliest 1953 JPL progress
report on the subject is listed under Unverified.

**[Schmucker73]** — Schmucker, R. H., *Flow Processes in Overexpanded Chemical
Rocket Nozzles, Part 1: Flow Separation*, NASA CR-143044, July 1973
(<https://ntrs.nasa.gov/citations/19750017939>); English translation reissued as
NASA TM-77396, 1984 (<https://ntrs.nasa.gov/citations/19840011402>). See also
*Status of Flow Separation Prediction in Liquid Propellant Rocket Nozzles*, NASA
TM X-64890, Nov. 1974 (<https://ntrs.nasa.gov/citations/19750003989>), and Part 3
on side-load reduction, NASA TM-77048
(<https://ntrs.nasa.gov/citations/19830022246>).
The systematic survey of separation-pressure criteria — Summerfield, Schilling,
Kalt-Badal and others — with their scatter shown honestly. The right document to
read before choosing a separation criterion, because it makes clear that they
disagree by tens of percent and that the choice matters for side-load prediction.

**[SFS54]** — Summerfield, M., Foster, C. R., and Swan, W. C., "Flow Separation
in Overexpanded Supersonic Exhaust Nozzles," *Jet Propulsion*, Vol. 24, 1954,
pp. 319–321.
<https://asmedigitalcollection.asme.org/appliedmechanicsreviews/article/58/3/143/443735/Supersonic-Flow-Separation-with-Application-to>
(cited and summarised in [OMK05])
The original separation criterion: flow separates when wall pressure falls to
roughly 0.4 of ambient. Crude, still quoted, and still roughly right for a first
cut on a conical nozzle. Modern practice uses pressure-ratio correlations from
[Schmucker73] or [OMK05] instead; keep Summerfield as the sanity check. The
original 1954 article is not on NTRS and has no DOI; it is verified here through
its citation in the peer-reviewed review literature.
**[Spisz65]** — Spisz, E. W., Brinich, P. F., and Jack, J. R., *Thrust
Coefficients of Low-Thrust Nozzles*, NASA TN D-3056, NASA Lewis Research Center,
1965. NTRS: <https://ntrs.nasa.gov/citations/19650027295>
Seven nozzles, area ratios 25–150, resistance-heated hydrogen, propellant
temperatures 530–4000 °R, with losses correlated against throat Reynolds number
and area ratio. The original demonstration that C_F falls steeply below
Re_t ≈ 10³ and that the optimum area ratio collapses with it. Paired with
[Grisnik87] throughout Module 29.

---

## 4. NASA historical and program reports

**[Biggs89]** — Biggs, R. E., "Space Shuttle Main Engine: The First Ten Years,"
in Doyle, S. E. (ed.), *History of Liquid Rocket Engine Development in the United
States, 1955–1980*, AAS History Series Vol. 13, American Astronautical Society,
1989, pp. 69–122. Full text:
<https://www.enginehistory.org/Rockets/SSME/SSME1.pdf>
An insider's account of the SSME development failures — turbopump bearings and
whirl, the main injector LOX post failures, the 1979 and 1980 test-stand
incidents — by someone on the management team. The best available narrative of
what it actually costs to develop a staged-combustion engine. Extended later as
*Space Shuttle Main Engine: The First Twenty Years and Beyond*, AAS History
Series Vol. 29, ISBN 978-0-87703-547-3.

**[F1-R3896]** — Rocketdyne, *F-1 Rocket Engine Technical Manual*, report series
R-3896 (multiple volumes: R-3896-1 *Engine Data*, R-3896-1A *Technical Manual
Supplement*, R-3896-6 *Thermal Insulation*, and others), 1967.
R-3896-1: <https://archive.org/details/r-3896-1-technical-manual-engine-data-f-1-rocket-engine-31-mar-1967>
R-3896-1A: <http://heroicrelics.org/info/f-1/f-1-supp.html>
Familiarization manual: <https://archive.org/details/rocketdyne-f1-engine-familiarization-manual>
Primary-source engine data at a level of detail almost nothing modern matches:
schematics, sequencing, component drawings, operating parameters. The R-3896-1A
supplement was originally classified specifically because of the injector design
and the combustion-instability fix, and is now the best hardware complement to
[OY93]. Caveat: these are scans hosted on enthusiast and archive sites, not on
NTRS; verify any number against a second source before publishing it.

**[Gradl18]** — Gradl, P., Greene, S. E., Protz, C., and Bullard, B., "Additive
Manufacturing of Liquid Rocket Engine Combustion Devices: A Summary of Process
Developments and Hot-Fire Testing Results," report M18-6805, July 2018.
<https://ntrs.nasa.gov/citations/20180006344>
NASA MSFC's consolidated results on AM injectors, chambers and nozzles including
hot-fire data — the document to cite for "AM combustion devices have actually
been fired, here is what happened." See [GradlAM] for the book-length treatment
and [RAMPT] for the large-scale follow-on.

**[GRCop]** — Ellis, D. L., and Nathal, M. V., *Development of GRCop-84 for
Rocket Engine Applications*, 2007
(<https://ntrs.nasa.gov/citations/20070005011>); see also Ellis, *GRCop-84: A
High Temperature Copper-based Alloy for High Heat Flux Applications*, 2005
(<https://ntrs.nasa.gov/citations/20050196725>) and the *Aerospace Structural
Materials Handbook Supplement: GRCop-84*, 2001
(<https://ntrs.nasa.gov/citations/20020070630>).
The Cu-Cr-Nb dispersion-strengthened alloy family behind modern regeneratively
cooled liners: conductivity, creep, low-cycle fatigue and blanching resistance
versus NARloy-Z. GRCop-42 is the later, more printable variant used in most
current AM chambers; treat the GRCop-84 property data as the well-documented
baseline and GRCop-42 data as still consolidating.

**[Hunley07]** — Hunley, J. D., *The Development of Propulsion Technology for
U.S. Space-Launch Vehicles, 1926–1991*, Centennial of Flight Series No. 17, Texas
A&M University Press, 2007. ISBN 978-1-60344-987-6.
<https://www.tamupress.com/book/9781603449878/the-development-of-propulsion-technology-for-u-s-space-launch-vehicles-1926-1991/>
The scholarly technical history of American launch propulsion, solid and liquid,
with real engineering content and proper sourcing. The best single source for how
solid-motor technology moved between the missile programmes and the space
launchers. See also Hunley, "The History of Solid-Propellant Rocketry: What We Do
and Do Not Know," AIAA Paper 99-2925, 1999,
<https://ntrs.nasa.gov/citations/19990047654> — a candid survey of the gaps in
the open record, which is itself useful for calibrating how much of the solid
literature is publicly knowable.

**[MarCO]** — VACCO Industries, *JPL MarCO Micro CubeSat Propulsion System*,
product documentation and mission datasheet.
<https://www.vacco.com/images/uploads/pdfs/JPL_MarCO_-_Micro_CubeSat_Propulsion_System_datasheet.pdf>
and <https://cubesat-propulsion.com/marco-cubesat-propulsion-system/>
The flight-proven cold-gas system for the first interplanetary CubeSats (MarCO-A
and -B, launched with InSight in May 2018): a stored-liquid refrigerant
propellant (R-134a class), ~40 s Isp, ~68.6 m/s total ΔV in a self-contained "system in a tank"
module. Useful as a real, cited data point for Part IV cold-gas sizing. It is
vendor literature — the performance figures are nominal, not measured flight
data. For broader context see NASA's *State of the Art of Small Spacecraft
Technology*, propulsion chapter: <https://sst-soa.arc.nasa.gov/04-propulsion>

**[NTRS-20140011656]** — NASA, *Waking a Giant: Bringing the Saturn F-1 Engine
Back to Life*, NTRS document ID 20140011656.
<https://ntrs.nasa.gov/citations/20140011656>
The F-1 gas-generator-cycle teardown and hot-fire revival work, cited in this
course for F-1 chamber pressure and for the measurement-station question behind
the 965 vs 1,125 psia spread. **Tagged by its NTRS document ID rather than an
author-year key** because that is how `reference/engine-database.md` §E.2 records
it; the report number and full author list were not established here, and the PDF
returned binary rather than extractable text during the verification pass.

**[RAMPT]** — Fikes, J. C., *Rapid Analysis and Manufacturing Propulsion
Technology (RAMPT)*, NASA Space Technology Mission Directorate / Game Changing
Development, 2018–present. <https://ntrs.nasa.gov/citations/20190002477>,
<https://ntrs.nasa.gov/citations/20180002825>
NASA's project for large-scale AM of regeneratively cooled channel-wall nozzles
and chambers by blown-powder directed energy deposition and composite overwrap.
The main open source on where large AM combustion devices are going. Project
reports are progress snapshots; expect the numbers to be superseded.

**[Rogers86]** — Rogers, W. P., et al., *Report of the Presidential Commission on
the Space Shuttle Challenger Accident*, Vol. 1, June 1986.
<https://ntrs.nasa.gov/citations/19860015255> (Vols. 4 and 5:
<https://ntrs.nasa.gov/citations/19860019504>,
<https://ntrs.nasa.gov/citations/19860019505>)
Chapter IV is the technical account of the SRM field joint: the tang-and-clevis
geometry, joint rotation under ignition pressurisation, O-ring resiliency versus
temperature, and putty blow-by. Required reading for Part III's failure-analysis
module, and the best case study in the book of a known technical problem being
managed rather than fixed. Volume 2's appendices contain the supporting test
data; Volume 1 alone is enough for the engineering argument.

**[SAFER95]** — Meade, C. J., "First Flight Test Results of the Simplified Aid
For EVA Rescue (SAFER) Propulsion Unit," Sept. 1995.
<https://ntrs.nasa.gov/citations/19960020257>
Flight results for the GN2 cold-gas EVA self-rescue backpack — a genuinely
small, genuinely flown cold-gas system with published performance. For its much
larger predecessor see the Manned Maneuvering Unit literature on NTRS, e.g.
Stewart, "Orbital Flight Test of the Manned Maneuvering Unit," 1984,
<https://ntrs.nasa.gov/citations/19860036330>, and the earlier MMU technology
survey NASA CR-144444, <https://ntrs.nasa.gov/citations/19750024686>.

**[SaturnV-Man]** — *Saturn V Flight Manual, SA-503*, MSFC-MAN-503, NASA
Marshall Space Flight Center, Nov. 1968.
<https://ntrs.nasa.gov/citations/19750063889>
The operational description of the vehicle: stage-by-stage propulsion, propellant
loading, pressurisation, sequencing and flight profile. Excellent for seeing how
the F-1 and J-2 engines fit into a vehicle rather than sitting on a test stand.

**[SP-4206]** — Bilstein, R. E., *Stages to Saturn: A Technological History of
the Apollo/Saturn Launch Vehicles*, NASA SP-4206, 1980.
<https://ntrs.nasa.gov/citations/19970009949>
The standard institutional history of the Saturn programme, with substantial
propulsion content: F-1 combustion instability, J-2 development, LH2 handling,
and the industrial base behind them. History rather than engineering — pair it
with [F1-R3896] and [OY93] when you need numbers.

**[SP-4230]** — Dawson, V. P., and Bowles, M. D., *Taming Liquid Hydrogen: The
Centaur Upper Stage Rocket, 1958–2002*, NASA/SP-2004-4230, 2004.
<https://ntrs.nasa.gov/citations/20040084080>
The history of the first LH2 stage and of the RL10, including the structural
pressure-stabilised tank, insulation, and the long grind of making hydrogen
operationally routine. **Note:** this is the Dawson & Bowles volume; it is
frequently confused with [SP-4404], which is a different book by a different
author. (A second NTRS record for the same work exists under NASA/SP-2004-4606:
<https://ntrs.nasa.gov/citations/20050070711>.)

**[SP-4404]** — Sloop, J. L., *Liquid Hydrogen as a Propulsion Fuel, 1945–1959*,
NASA SP-4404, 1978. <https://ntrs.nasa.gov/citations/19790008823>
The prehistory: how LH2 went from laboratory curiosity to propellant, written by
a participant at NACA Lewis. The authoritative account of the early
hydrogen-oxygen combustion and cooling experiments. **Author is Sloop, not
Dawson** — see the note under [SP-4230].

**[SSME-Orient]** — Boeing/Rocketdyne Propulsion & Power, *Space Shuttle Main
Engine Orientation*, presentation BC98-04, June 1998, 105 pp.
<http://large.stanford.edu/courses/2011/ph240/nguyen1/docs/SSME_PRESENTATION.pdf>
The clearest available walk-through of a staged-combustion engine: flow schematic,
preburners, turbopumps, the main injector, the controller, and the start and
shutdown sequences, all in diagrams. The best single document for understanding
what a fuel-rich staged-combustion cycle actually does, valve by valve. It is a
training handout, so it simplifies; for depth go to [Biggs89]. Complementary:
Jue, F. H., "Space Shuttle Main Engine — Thirty Years of Innovation," 2002,
<https://ntrs.nasa.gov/citations/20020046693>.

---

## 5. Standards and handbooks

**[AIAA-S-080]** — ANSI/AIAA S-080A-2018, *Space Systems — Metallic Pressure
Vessels, Pressurized Structures, and Pressure Components* (revision of AIAA
S-080-1998).
<https://webstore.ansi.org/preview-pages/AIAA/preview_ANSI+AIAA+S-080A-2018.pdf>
The governing requirements document for metallic tanks, pressurised structures
and pressure components in launch vehicles and spacecraft: design factors, damage
tolerance and fracture control, proof and burst testing, and life. This, not
[SP-8088], is what a modern programme is actually held to. Paid standard;
the ANSI preview shows scope and contents.

**[AIAA-S-081]** — ANSI/AIAA S-081B-2018 (reaffirmed 2024), *Space Systems —
Composite Overwrapped Pressure Vessels (COPVs)* (revision of AIAA S-081A-2006).
DOI: [10.2514/4.105425.001](https://arc.aiaa.org/doi/10.2514/4.105425.001)
The COPV counterpart to [AIAA-S-080], covering metal-lined carbon/polymer
vessels: stress-rupture life, liner buckling, impact damage control, and
qualification testing. NASA's COPV standards page collects related agency
guidance: <https://www.nasa.gov/centers-and-facilities/white-sands/copv-standards/>
Implementation guidance for the earlier revision is public via DTIC:
<https://apps.dtic.mil/sti/tr/pdf/ADA413531.pdf>

**[ASME-V&V-20]** — ASME V&V 20-2009 (reaffirmed 2021), *Standard for Verification
and Validation in Computational Fluid Dynamics and Heat Transfer*, American
Society of Mechanical Engineers, New York, 2009.
The standard that defines validation uncertainty u_val — the combination of
numerical, input and experimental uncertainties against which a
simulation-to-test comparison error E must be judged. Its single most useful
consequence: the accuracy you are entitled to claim is |E| + u_val, never zero,
and a 4 % agreement with a test point measured to ±3 % is not a 4 % model. Paid
standard; check institutional access before designing a V&V plan around it.

**[CPIA-245]** — Evans, S. A., Gross, K. W., Combs, L. P., and Geniec, W.,
*JANNAF Rocket Engine Performance Test Data Acquisition and Interpretation
Manual*, CPIA Publication 245, JHU/APL, Apr. 1975.
<https://ntrs.nasa.gov/citations/19770083458>
The companion to [CPIA-246]: how to instrument a hot-fire test, reduce the data,
and propagate the uncertainty so that a measured Isp means something. Read
together with [SP-8041] for the solid-motor equivalent.

**[CPIA-246]** — *JANNAF Rocket Engine Performance Prediction and Evaluation
Manual*, CPIA Publication 246, JHU/APL, Apr. 1975.
<https://ntrs.nasa.gov/citations/19770083457>
The US national standard method for predicting and evaluating liquid engine
performance: the reference One-Dimensional Equilibrium baseline, the
simplified/reference engine methodology, and the efficiency decomposition
(energy release, divergence, boundary layer, kinetics) that "c* efficiency" and
"nozzle efficiency" are defined by. If you want to know what a quoted efficiency
number legally means, it is defined here. Distribution is public but DTIC does
not serve a PDF; the NTRS record is the reliable route. Most other JANNAF
publications are *not* public — do not assume a CPIA number implies availability.

**[DoD-DES]** — U.S. Department of Defense, Office of the Deputy Assistant
Secretary of Defense for Systems Engineering, *Digital Engineering Strategy*,
June 2018.
The policy document that turned model-based systems engineering from an option
into a contractual expectation on many US programmes, and the reason propulsion
suppliers are now asked for authoritative digital models rather than documents.
It is a strategy, not a specification: it states five goals and no method, so
treat it as the reason a programme demands MBSE, not as guidance on how to do
it.

**[G-095]** — ANSI/AIAA G-095A-2017, *Guide to Safety of Hydrogen and Hydrogen
Systems* (revision of AIAA G-095-2004), 236 pp. DOI:
[10.2514/4.105197](https://arc.aiaa.org/doi/book/10.2514/4.105197)
The reference for hydrogen hazards: embrittlement, flammability and detonability
limits, invisible flames, detection, cryogenic handling and facility design.
Descended from NASA's own hydrogen safety standard and still the most complete
open treatment. Preview: <https://webstore.ansi.org/preview-pages/AIAA/preview_ANSI+AIAA+G-095A-2017.pdf>

**[MMPDS]** — *Metallic Materials Properties Development and Standardization
(MMPDS) Handbook*, Battelle Memorial Institute (current edition MMPDS-2024,
issued in two volumes; distributed by SAE International).
<https://www.mmpds.org/> and <https://www.sae.org/publications/books/content/b-984/>
The source of statistically derived A- and B-basis design allowables for
aerospace metals, recognised by the FAA, DoD and NASA. **It supersedes
MIL-HDBK-5** — MMPDS-12 (2017) formally superseded all editions of MIL-HDBK-5, so
citing MIL-HDBK-5 for current design is an error, though it remains valid for
reading legacy analyses. Volume II of the 2024 edition adds process-intensive
materials and joining, which is where additively manufactured alloys are heading.

**[Roache98]** — Roache, P. J., *Verification and Validation in Computational
Science and Engineering*, Hermosa Publishers, Albuquerque, NM, 1998.
The book behind the Grid Convergence Index. Read it for the distinction that
gets blurred in practice — verification asks whether you solved the equations
right, validation asks whether they were the right equations — and for the
procedure that turns three systematically refined meshes into a numerical
uncertainty band. Companion to [ASME-V&V-20], which formalises the validation
half.

**[SMC-S-016]** — SMC-S-016 (2014), *Test Requirements for Launch, Upper-Stage
and Space Vehicles*, US Air Force Space and Missile Systems Center, 5 Sept. 2014.
<https://apps.dtic.mil/sti/pdfs/ADA619375.pdf>
The environmental and structural qualification/acceptance test standard for
launch and space vehicles: vibration, acoustics, thermal vacuum, shock, and the
protoflight logic. **Successor to MIL-STD-1540** and to SMC-S-016 (2008).
Tailoring guidance is public at
<https://apps.dtic.mil/sti/pdfs/AD1112315.pdf>. Cite MIL-STD-1540 only when
discussing a programme that was actually built to it.

**[STD-5001]** — NASA-STD-5001, *Structural Design and Test Factors of Safety for
Spaceflight Hardware*, NASA (original 21 June 1996; later revisions B and C).
Historical baseline:
<https://standards.nasa.gov/sites/default/files/standards/NASA/B-w/CHANGE-2/2/Historical/nasa-std-5001.pdf>
Defines the design and test factors of safety NASA hardware must meet, including
the separate treatment of pressurised hardware. Always check
<https://standards.nasa.gov> for the current revision before quoting a factor —
the numbers have changed between revisions, which is exactly the sort of detail
that invalidates a margin calculation.

**[STD-7001]** — NASA-STD-7001, *Payload Vibroacoustic Test Criteria*, NASA
(original 21 June 1996; current revision 7001B, 2017).
Historical baseline:
<https://standards.nasa.gov/sites/default/files/standards/NASA/B/0/Historical/nasa-std-7001.pdf>
Standardises the acoustic and random-vibration verification of payload hardware,
including the maximum expected flight level (MEFL) enveloping requirement.
Relevant to propulsion mainly for feedline, valve and tank qualification. As with
[STD-5001], get the current revision from standards.nasa.gov.
**[STD-7009]** — NASA-STD-7009 (revision A with Change 1, 2016; original 2008),
*Standard for Models and Simulations*, NASA.
<https://standards.nasa.gov>
Written because models were entering flight-decision processes with no traceable
statement of how far they should be trusted. Its central artefact is the
Credibility Assessment Scale: eight factors (verification, validation, input
pedigree, results uncertainty, results robustness, use history, M&S management,
people qualification) each scored on a defined ladder, reported alongside the
answer. Scoring a model you have actually used is uncomfortable and is the
fastest way to learn what the standard is for. Always check
<https://standards.nasa.gov> for the current revision before quoting a level
definition.

---

## 6. Data and tools

**[Astronautix]** — Wade, M., *Encyclopedia Astronautica*.
<http://www.astronautix.com/>
Vast single-author catalogue of engines, stages, vehicles and programmes,
especially strong on Soviet and Russian hardware that is documented nowhere else
in English. It won the AAS Ordway Award and is cited in NASA technical reports.
**Caveat, and it matters:** it has no peer review, one maintainer, and known
stale entries, and its numbers frequently disagree with primary sources. Use it
to find out that a thing exists and what it is called; then verify every number
against a primary source before putting it in a calculation. This course treats
Astronautix figures as leads, never as data. (The site did not respond to a
fetch from this session; it is reachable via search caches.)

**[B14643]** — Brügge, N., *Space Launch Vehicles / Rocket Engine Data*.
<https://b14643.com/> (formerly b14643.de)
Detailed engine and stage compilations with cutaway diagrams, again notably good
on Russian, Chinese and Indian hardware. Same caveat as [Astronautix] and for the
same reasons: privately compiled, unreferenced in places, occasionally
contradicts primary sources. Excellent for orientation and diagrams, not for
citation.

**[Cantera]** — Goodwin, D. G., Moffat, H. K., Schoegl, I., Speth, R. L., and
Weber, B. W., *Cantera: An Object-Oriented Software Toolkit for Chemical
Kinetics, Thermodynamics, and Transport Processes*. <https://cantera.org/>
Open-source, scriptable, and the right tool when [CEA] cannot answer the
question: finite-rate kinetics with a real mechanism, one-dimensional flames,
reactor networks, and equilibrium as a special case. In this course it is the
way to march composition down a nozzle streamline and find where the chemistry
actually freezes, instead of choosing "equilibrium" or "frozen" by assertion.
**Caveat:** the answer is only as good as the mechanism and the thermodynamic
data you load, and neither ships validated for rocket conditions.

**[CEA]** — Gordon, S., and McBride, B. J., *Chemical Equilibrium with
Applications (CEA)*, NASA Glenn Research Center. Current documentation:
<https://nasa.github.io/cea/>; source: <https://github.com/nasa/cea>; NASA
software catalogue entry LEW-17687-1:
<https://software.nasa.gov/software/LEW-17687-1>
The standard tool for theoretical rocket performance: equilibrium composition by
free-energy minimisation over 2000+ species, then c*, Isp, γ, and transport
properties versus area ratio, for equilibrium or frozen expansion. Everything in
this course labelled "theoretical" comes from here. **Caveat:** CEA gives you an
idealised one-dimensional answer. Real engines deliver 92–99% of CEA c*
depending on injector and chamber; the loss decomposition is defined in
[CPIA-246], not in CEA.

**[CEARUN]** — *CEARUN*, NASA Glenn Research Center web interface to CEA.
<https://cearun.grc.nasa.gov/> (introduction: <https://cearun.grc.nasa.gov/intro.html>)
Browser front end for CEA with no installation. The fastest way to get a c* or
Isp number, and the right tool for coursework. Input options are a subset of the
full code — for parametric sweeps, custom species or scripted runs, use the
standalone CEA or [RPA].

**[ESPSS]** — *European Space Propulsion System Simulation (ESPSS)*, EcosimPro
component library, developed for ESA by Empresarios Agrupados.
An equation-based differential-algebraic modelling environment with a validated
propulsion component library — tanks, lines, valves, turbomachinery, combustion
chambers — used across ESA programmes for transient system analysis: start-up,
shutdown, water-hammer, priming and cycle balance. The European counterpart to
[NPSS]. Commercial licence; the component library, not the solver, is what makes
it worth the money.

**[JANAF]** — Chase, M. W., Jr., *NIST-JANAF Thermochemical Tables*, 4th ed.,
*Journal of Physical and Chemical Reference Data* Monograph No. 9, Parts I and
II, ACS/AIP for NIST, 1998. ISBN 1-56396-831-2. Online:
<https://janaf.nist.gov/> (NIST Standard Reference Database 13, DOI
[10.18434/T42S31](https://doi.org/10.18434/T42S31))
The critically evaluated thermochemical data (Cp, S, H, ΔfH, log Kf versus
temperature) underlying equilibrium calculations, with references and revision
dates per substance. SI units, 1 bar standard state. Data content was last
updated in 1998, so for species where the thermochemistry has been revised since,
CEA's own thermodynamic database may be more current than the printed tables.

**[NIST-WB]** — *NIST Chemistry WebBook*, NIST Standard Reference Database 69.
<https://webbook.nist.gov/chemistry/>
Free thermophysical property data for pure fluids, including saturation and
supercritical properties for oxygen, hydrogen, methane, nitrogen and helium —
enough for most feed-system and cooling-jacket calculations. Free but limited to
pure fluids and a fixed set of state-point queries.

**[NPSS]** — *Numerical Propulsion System Simulation (NPSS)*, originated at NASA
Glenn Research Center, now maintained through an industry consortium managed by
Southwest Research Institute.
An object-oriented engine-cycle framework, originally for airbreathing engines
and extended to rockets. Assemble components, impose conservation at the
interfaces, and solve the balance; the value is in the standardised component
interfaces and the solver, not in any physics you could not write yourself.
Licensed, US-export-controlled in practice. See [ESPSS] for the European
equivalent.

**[P120C]** — Avio, *P120C solid rocket motor*.
<https://www.avio.com/p120c>
Manufacturer page for the largest monolithic carbon-fibre-cased solid motor
flying, used as Vega-C first stage and Ariane 6 booster. Cited here as a
current-practice data point for filament-wound cases and large SRM design.
Manufacturer marketing material: the headline figures are nominal and the
detailed design data are not public.

**[REFPROP]** — *NIST Reference Fluid Thermodynamic and Transport Properties
Database (REFPROP)*, NIST Standard Reference Database 23.
<https://www.nist.gov/srd/refprop>
The authoritative equation-of-state package for cryogens and mixtures — what you
need for a real regenerative-cooling calculation with supercritical hydrogen or
methane, where ideal-gas or incompressible assumptions fail badly. Paid, unlike
[NIST-WB]; check whether your institution has a licence before designing a
workflow around it.

**[RP-1311]** — Gordon, S., and McBride, B. J., *Computer Program for Calculation
of Complex Chemical Equilibrium Compositions and Applications*, NASA RP-1311:
Part I, *Analysis*, Oct. 1994, <https://ntrs.nasa.gov/citations/19950013764>;
Part II, *Users Manual and Program Description*, June 1996,
<https://ntrs.nasa.gov/citations/19960044559>.
The documentation for [CEA] and, more importantly, the derivation of the method:
Part I is the actual theory of free-energy minimisation, the rocket-performance
formulation, and the frozen-versus-equilibrium distinction. Read Part I before
trusting any CEA output; Part II when you need input syntax. Both free.

**[RPA]** — Ponomarenko, A., *RPA: Rocket Propulsion Analysis*, RP
Software+Engineering UG, Cologne. <https://www.rocket-propulsion.com/>
(user manual: <https://www.rocket-propulsion.com/downloads/2/docs/RPA_2_User_Manual.pdf>;
technical papers: <https://www.rocket-propulsion.com/publications.htm>)
Practical engine analysis on top of a CEA-equivalent equilibrium solver: thrust
chamber sizing, nozzle contour generation, regenerative cooling and thermal
analysis, and engine cycle balance. The fastest route from propellant choice to a
credible preliminary engine. It is a conceptual/preliminary design tool by the
author's own description, and a commercial product with a limited free tier —
its outputs need the same scepticism as any other one-dimensional estimate.

---

## 7. Theses and modern review papers

**[Bayt99]** — Bayt, R. L., *Analysis, Fabrication and Testing of a MEMS-Based
Micropropulsion System*, Ph.D. thesis, Dept. of Aeronautics and Astronautics,
Massachusetts Institute of Technology, 1999 (also issued as FDRL TR 99-1).
<https://dspace.mit.edu/handle/1721.1/8970>
DRIE-etched silicon micronozzles with throat widths of order 20–35 µm, analysed
and hot-fired. The document that confirms both the Re^(-1/2) scaling of the
viscous loss and the collapse of the optimum area ratio at low Reynolds number,
and the reference for why a micronozzle contour is an etching problem rather
than a machining one. Read it with [Rothe71], [Spisz65] and [Grisnik87] before
quoting any low-Re nozzle efficiency.

**[Casiano10]** — Casiano, M. J., Hulka, J. R., and Yang, V.,
"Liquid-Propellant Rocket Engine Throttling: A Comprehensive Review," *Journal of
Propulsion and Power*, Vol. 26, No. 5, 2010, pp. 897–923. DOI:
[10.2514/1.49791](https://arc.aiaa.org/doi/10.2514/1.49791). Free preprint (AIAA
2009-5135) on NTRS: <https://ntrs.nasa.gov/citations/20090037061>
The reference review of deep throttling: why injector pressure drop collapses
faster than thrust, and the full catalogue of mitigations (pintles, dual
manifolds, gas injection, variable-area elements) with the historical engines
that used each. Directly relevant to lander and reusable-booster design, and the
best single entry point to the throttling literature.

**[Culick06]** — Culick, F. E. C., *Unsteady Motions in Combustion Chambers for
Propulsion Systems*, RTO AGARDograph AG-AVT-039, NATO Research and Technology
Organisation, Neuilly-sur-Seine, 2006. DOI:
[10.14339/RTO-AG-AVT-039](https://doi.org/10.14339/RTO-AG-AVT-039);
open-access PDF:
<https://publications.sto.nato.int/publications/STO%20Technical%20Reports/RTO-AG-AVT-039/$$AG-AVT-039-ALL.pdf>
Culick's book-length synthesis of combustion instability: spatial averaging, the
modal expansion, the response function, and nonlinear limit-cycle behaviour, for
both liquid and solid chambers. The successor in coverage to [Culick68] and the
place to go for what the response function measured in a T-burner is and is not
telling you. Free.

**[Glaessgen12]** — Glaessgen, E. H., and Stargel, D. S., "The Digital Twin
Paradigm for Future NASA and U.S. Air Force Vehicles," AIAA 2012-1818, 53rd
AIAA/ASME/ASCE/AHS/ASC Structures, Structural Dynamics and Materials Conference,
Honolulu, HI, 2012. DOI:
[10.2514/6.2012-1818](https://doi.org/10.2514/6.2012-1818)
The paper that put "digital twin" into aerospace vocabulary, with a far more
disciplined definition than the term now carries: an ultra-high-fidelity model of
a *specific* vehicle, updated by that vehicle's own sensor and maintenance
history. Read it, then compare it with what vendors sell. If the model does not
change when a particular engine serial number runs a hot fire, it is a model, not
that engine's twin.

**[Hulka08]** — Hulka, J. R., "Scaling of Performance in Liquid Propellant Rocket
Engine Combustion Devices," AIAA 2008-5113, 44th AIAA/ASME/SAE/ASEE Joint
Propulsion Conference, Hartford, CT, 2008. DOI:
[10.2514/6.2008-5113](https://doi.org/10.2514/6.2008-5113). NTRS:
<https://ntrs.nasa.gov/citations/20090001888>
The review of what actually scales between a subscale combustor and a flight
chamber: the 1950s–60s scaling research, the individual performance losses and
how each depends on size, and the development programmes where the scaling
assumption failed. The key result for this course is that c* efficiency and
stability scale differently, so a stable single-element test is weak evidence
about a full injector.

**[Martins13]** — Martins, J. R. R. A., and Lambe, A. B., "Multidisciplinary Design
Optimization: A Survey of Architectures," *AIAA Journal*, Vol. 51, No. 9, 2013,
pp. 2049–2075. DOI:
[10.2514/1.J051895](https://doi.org/10.2514/1.J051895)
The taxonomy of MDO architectures — monolithic (MDF, IDF, SAND) versus
distributed — with a consistent notation and a clear statement of what each
assumes about solver coupling and gradient availability. Read it for why the
architecture choice is driven by organisational and solver constraints at least
as much as by mathematics.

**[OMK05]** — Östlund, J., and Muhammad-Klingmann, B., "Supersonic Flow
Separation with Application to Rocket Engine Nozzles," *Applied Mechanics
Reviews*, Vol. 58, No. 3, May 2005, pp. 143–177. DOI:
[10.1115/1.1894402](https://appliedmechanicsreviews.asmedigitalcollection.asme.org/article.aspx?articleid=1398265)
The modern review that supersedes casual use of [SFS54]: free shock separation
versus restricted shock separation, the transition between them in thrust-
optimised contours, side-load generation mechanisms, and a critical comparison of
every separation criterion in the literature. Read this before choosing a
criterion for a real nozzle.

**[Ostlund02]** — Östlund, J., *Flow Processes in Rocket Engine Nozzles with
Focus on Flow Separation and Side-Loads*, Ph.D. dissertation, KTH Royal Institute
of Technology, Stockholm, 2002.
<https://kth.diva-portal.org/smash/get/diva2:9646/FULLTEXT01>
The full-length treatment behind [OMK05], free and open access, with the
experimental and analytical detail the review compresses. The best single
document on why overexpanded nozzles generate side loads during start-up and how
those loads are estimated. Note that the DiVA record and the review use slightly
different titles for related documents in the same series.
**[Pitsch06]** — Pitsch, H., "Large-Eddy Simulation of Turbulent Combustion,"
*Annual Review of Fluid Mechanics*, Vol. 38, 2006, pp. 453–482. DOI:
[10.1146/annurev.fluid.38.050304.092133](https://doi.org/10.1146/annurev.fluid.38.050304.092133)
The review of what LES combustion closures assume and where they fail. Read it
for the honest statement of the subgrid problem: the flame is always smaller than
the filter, so every LES of a reacting flow is reporting a model of the flame,
not the flame. Read with [Peters00] for the flamelet basis and [Slotnick14] for
the cost trend.
**[RL10B2-CC]** — *Testing of the RL10B-2 carbon–carbon nozzle extension*, Acta
Astronautica, 2001.
<https://www.sciencedirect.com/science/article/abs/pii/S0094576501001783>
The source for the RL10B-2 extendible nozzle figures used in this course: 77:1
retracted, 285:1 with the carbon–carbon extension deployed, with 280:1 a rounding
that circulates widely. **Locator taken from `reference/engine-database.md` §E.2**;
the full author list and volume/page range were not confirmed in this session, and
the article is paywalled.
**[Slotnick14]** — Slotnick, J., Khodadoust, A., Alonso, J., Darmofal, D., Gropp,
W., Lurie, E., and Mavriplis, D., *CFD Vision 2030 Study: A Path to Revolutionary
Computational Aerosciences*, NASA/CR-2014-218178, NASA Langley Research Center,
March 2014. <https://ntrs.nasa.gov/citations/20140003093>
The sober agency assessment of what CFD can and cannot do, the cost scaling of
DNS, wall-resolved LES and wall-modelled LES, and how slowly the hard parts
(turbulence, combustion, multiphase, mesh generation, uncertainty) are actually
moving. Cite it for the *ordering* of the cost estimates; the absolute numbers
are indicative and were already a decade old when this course was written.
**[Sobol01]** — Sobol', I. M., "Global sensitivity indices for nonlinear
mathematical models and their Monte Carlo estimates," *Mathematics and Computers
in Simulation*, Vol. 55, Nos. 1–3, 2001, pp. 271–280. DOI:
[10.1016/S0378-4754(00)00270-6](https://doi.org/10.1016/S0378-4754(00)00270-6)
The variance decomposition behind first-order and total-effect sensitivity
indices — the output that tells a programme which input to spend money measuring.
The estimators and their sample-size requirements are in [Saltelli08]; the
interpretation degrades when inputs are correlated, and a generalised
decomposition is then required.
**[Yu12]** — Yu, Y. C., Sisco, J. C., Rosen, S., Madhav, A., and Anderson, W. E.,
"Spontaneous Longitudinal Combustion Instability in a Continuously Variable
Resonance Combustor," *Journal of Propulsion and Power*, Vol. 28, No. 5, 2012,
pp. 876–887. DOI:
[10.2514/1.B34308](https://doi.org/10.2514/1.B34308)
The CVRC: a single-element combustor whose oxidiser-post length can be varied
continuously, so the same hardware crosses from stable to unstable during a run.
The best-documented model instability experiment in the open literature, and the
template for how a validation experiment is designed to be informative rather
than merely realistic. Read it before believing any LES that claims to have
predicted an instability.

---

## 8. Failure investigations and contemporaneous reporting

Sources for Module 34. Two different kinds of document sit here and they are not
interchangeable. **Investigation reports and official statements** — an accident
board report, an agency or manufacturer press statement closing an inquiry — are
primary within their scope, and where a manufacturer and an independent board
disagreed (Antares Orb-3, Vega-C VV22) this course reports the disagreement
rather than picking a winner. **Contemporaneous trade reporting** — *SpaceNews*,
*Spaceflight Now*, *Spaceflight Insider*, *SpacePolicyOnline*, *Payload*,
NASASpaceflight.com, UPI — is secondary: it is often the only public record of a
finding, it is written to a deadline, and its technical detail should be treated
as a lead. Wikipedia-derived tags are marked as such and are third-hand. Where a
figure from any of these enters a module, the module says so.

**[Avio-VV15]** — Avio S.p.A., statement on VV15 root cause (thermal protection of
the Z23 forward dome), 6 Dec. 2019.
The manufacturer's attribution, which is narrower than the Commission's
"thermo-structural failure in the forward dome area" ([ESA-VV15]). Company
statement; no independent verification.

**[CORDIS-V157]** — European Commission CORDIS, "Ariane 5 explosion caused by
fault in main engine cooling system," 9 Jan. 2003.
Contemporaneous summary of the Flight 157 inquiry finding. Secondary; use
[ESA-V157] for the finding itself.

**[Cortright70]** — Cortright, E. M., et al., *Report of the Apollo 13 Review
Board*, NASA, June 1970. <https://ntrs.nasa.gov/citations/19700076776>
The full accident board report: the oxygen tank No. 2 heater-thermostat damage
during detanking, the resulting insulation failure, and the pressure history.
Primary, free, and the model for what a failure report should contain — the
"what evidence" sections are worth reading purely as a template.

**[ESA-V157]** — ESA/Arianespace, "Arianespace Flight 157 — Inquiry Board submits
findings," press release, 7 Jan. 2003.
The Vulcain 2 nozzle thermo-structural failure finding. Agency statement
summarising an inquiry board; the board's own report is not public.

**[ESA-VV15]** — ESA/Arianespace, "Vega flight VV15: findings of the Independent
Inquiry Commission's investigations," 5 Sept. 2019.
The Z23 forward-dome finding. Compare [Avio-VV15].

**[ESA-VV22]** — ESA/Arianespace, "Loss of flight VV22: Independent Enquiry
Commission announces conclusions," 3 Mar. 2023.
The Zefiro-40 carbon–carbon throat insert finding, and a *qualification-method*
conclusion rather than a materials conclusion. The supplier publicly contested
the attribution; see [PL-VV22].

**[FAA-Starship]** — Federal Aviation Administration, "FAA Closes SpaceX Starship
Mishap Investigation," 8 Sept. 2023.
Regulatory closure listing corrective actions, including changes to the
autonomous flight safety system and to change-control practice. A regulatory
finding is a statement about the licensee's process, not a root-cause analysis of
the hardware; read it for what it actually claims.

**[GS-Titan]** — GlobalSecurity.org, Titan IV programme summaries (citing
USAF/DOT&E material).
Secondary compilation. Useful for programme-level context on the Titan solid
motors; verify any number against the underlying USAF or DOT&E document before
quoting it.

**[NSF-CRS7]** — NASASpaceflight.com, "SpaceX Falcon 9 failure investigation
focuses on COPV struts," July 2015; and "NASA's IRT publishes report on SpaceX's
CRS-7 failure," Mar. 2018.
Trade reporting, including coverage of the NASA Independent Review Team report
that differed in emphasis from SpaceX's own conclusion. Secondary.

**[Orb3-IRT]** — NASA Independent Review Team, *Orb–3 Accident Investigation
Report*, Executive Summary, 9 Oct. 2015.
<https://sma.nasa.gov/SignificantIncidents/assets/orb3_accident_investigation_report.pdf>
The IRT executive summary on the Antares AJ-26 turbopump failure. Primary within
its scope, and notable because three parties (the IRT, Orbital's own board, and
Aerojet Rocketdyne) reached three different proximate causes; see [SFN-Orb3] and
[SN-Orb3].

**[PL-VV22]** — *Payload*, "Ukraine contests findings of Vega-C independent
inquiry," Mar. 2023.
Records the supplier's dissent from the [ESA-VV22] conclusion. Secondary, and
cited here specifically so the disagreement is visible rather than smoothed over.

**[SFI-Proton15]** — *Spaceflight Insider*, "Third stage engine blamed for Russian
Proton-M rocket crash," 2015. Secondary trade reporting.

**[SFN-Orb3]** — *Spaceflight Now*, "Two Antares failure probes produce different
results," 1 Nov. 2015.
The clearest public account of the disagreement between the investigation teams.
Secondary.

**[SFN-Proton15]** — *Spaceflight Now*, "Roscosmos: Design flaw brought down
Proton rocket," 1 June 2015.
The RD-0214 turbopump shaft/rotordynamic finding as reported at the time. No
public primary report exists in English; this and [SFI-Proton15],
[SPO-Proton15] are the record.

**[SN-Orb3]** — *SpaceNews*, "Turbopump in AJ-26 engine implicated in Antares
failure," 2014. Secondary.

**[SN-Solder]** — *SpaceNews*, "ILS still planning three commercial launches this
year despite Proton engine recall," 2016.
The engine-recall episode in which a workmanship substitution was invisible to
the inspection in use. Secondary; cited for the class of failure, not for
figures.

**[SN-Titan93]** — *SpaceNews*, "Aug. 2, 1993: Death of a Titan." Secondary
retrospective on the Titan IV/UA1207 failure.

**[SN-V157]** — *SpaceNews*, "Arianespace Flight 157: The Inquiry Board Submits
its Findings," Jan. 2003. Secondary.

**[SN-VV22]** — *SpaceNews*, "Independent Enquiry Commission conclusions on loss
of Vega-C flight VV22," Mar. 2023. Secondary.

**[SPO-Proton15]** — *SpacePolicyOnline*, "Proton-M Failure Due to Same Design
Flaw that Doomed 1988 Mission," 2015.
The repeat-mechanism-across-decades observation. Secondary, and the claim that
the 1988 and 2015 failures share a mechanism is the reporting's, not a published
board's.

**[SpaceX-AMOS6]** — SpaceX, "Anomaly Updates" (AMOS-6), 2 Jan. 2017.
The COPV liner buckle / solid-oxygen mechanism. Company statement, and the most
instructive materials-compatibility account in the modern public record — but it
is the operator investigating itself, with no independent board report.

**[SpaceX-CRS7]** — SpaceX / NASA, "SpaceX Details Preliminary Investigation
Findings" (CRS-7), NASA blog, 21 July 2015, together with SpaceX's final CRS-7
statement.
The strut-failure attribution and the ~0.893 s anomaly development. Company
statement; NASA's IRT emphasised different contributing factors ([NSF-CRS7]).

**[SpaceX-F1]** — SpaceX Falcon 1 flight update statements, 2006–2008.
Company statements covering the Flight 1 corroded nut, Flight 2 slosh and
Flight 3 residual-thrust recontact. Cited for the failure classes; the technical
detail is thin and unverified.

**[UPI-Titan34D]** — UPI Archives, reporting on the Titan 34D-9 accident
investigation findings, 2 July 1986.
The SRM case-bond debonding finding. Contemporaneous news reporting of a
military investigation whose report is not public. Secondary.

**[VO-2023]** — Virgin Orbit, "Virgin Orbit update on UK mission anomaly,"
14 Feb. 2023.
The dislodged fuel-filter finding, with the company noting that ground testing
reproduced the downstream behaviour. Company statement.

**[WP-GPSIIR1]** — Wikipedia, *GPS IIR-1* and *List of Delta II launches* (citing
Boeing/USAF material).
Third-hand. Used only for the outline of the Delta II GEM case-rupture event, and
flagged in the module text as such. Verify anything load-bearing against the USAF
accident record.

**[WP-LE7]** — Wikipedia, *LE-7* (citing JAXA/MHI material).
Third-hand. Used for the H-II Flight 8 LE-7 turbopump inducer cavitation /
high-cycle fatigue sequence and the engine's recovery from ~3,000 m of water. The
primary JAXA/MHI material is recorded as NEEDS PRIMARY in
`reference/_verify-liquid.md`.

**[YA95-class]** — Yang, V., and Anderson, W. E. (eds.), *Liquid Rocket Engine
Combustion Instability*, Progress in Astronautics and Aeronautics Vol. 169, AIAA,
1995 — cited in Module 34 for the Rayleigh-criterion treatment. Same book as
[LRECI]; the suffixed tag marks the citation as being to the general class of
instability treatment rather than to a specific chapter.

---

## 9. Worksheet and secondary-source tags

These tags come from the two verification worksheets
(`reference/_verify-liquid.md`, `reference/_verify-solid-coldgas.md`) and are
reproduced with their expansions from `reference/engine-database.md` §E. They are
kept separate from sections 1–8 because **none of them meets the standard applied
above**: several are manufacturer marketing pages, several are tertiary
compilations known to propagate errors, one is a computation rather than a
source, and several could not be fetched at all during the verification passes
(recorded there as 403, 503 or "would not text-extract"). They are listed so that
every tag used in the course resolves to something, not because they are good
citations.

**Reliability caveat — applies to every tag in this section.** Treat a figure
carrying only one of these tags as **confidence B at best**, and never as the
sole basis for a calculation that leaves this repository. Where a module quotes
one, it is because no primary source was found, and the module says so. If you
need the number for real work, chase the primary document first.

**[CALC]** — Computed in the worksheet from stated inputs, not a source at all.
The cold-gas script is archived under `propulsion/tools/`. **Reproduce the
calculation before quoting the result**; a [CALC] figure inherits every
assumption of its inputs and none of the authority of a measurement.

**[EA]** — *Encyclopedia Astronautica* (astronautix.com). Secondary,
single-maintainer, **known to propagate errors**, and returned 503 on all direct
fetches during the verification pass, so the values that reached the worksheet
came from search summaries rather than the pages themselves. See [Astronautix]
in section 6 for the fuller assessment. Leads only.

**[ESA-EAP]** — ESA, *Ariane 5 boosters (EAP)* page, plus ESA Bulletin 104,
"First Test Firing of an Ariane-5 Production Booster"
(esa.int/esapub/bulletin/bullet104/gonzalez104.pdf). The EAP page returned
**403 from the verification environment**; figures used came from search-result
extracts, which is why nothing sourced to it exceeds confidence B.

**[FAA-SS]** — FAA Starship licensing and environmental documents. The only
independent corroboration of Raptor thrust available in the open literature, and
it corroborates thrust *only*, and indirectly. Not a propulsion datasheet: it is
a regulatory record that quotes vehicle-level numbers supplied by the operator.

**[FAS]** — Federation of American Scientists and GlobalSecurity.org
nuclear-forces pages (fas.org, globalsecurity.org). Secondary compilations of
US defence-motor programme material. Used in this course for **architecture and
family-level statements only** — stage counts, propellant class, rough eras —
never for motor performance figures.

**[JAXA]** — JAXA / ISAS / MHI published programme material (LE-7A, LE-9, H3,
M-V, Epsilon). **A pointer, not a citation:** neither worksheet records a URL for
it, and the ISAS/JAXA M-V papers are marked NEEDS PRIMARY. Anything tagged
[JAXA] alone is awaiting a primary source.

**[JM-LV]** — McDowell, J., *General Catalogue of Artificial Space Objects* and
the associated launch-vehicle motor lists (planet4589.org). A carefully
maintained secondary catalogue and much better than most, but still a
compilation: it is authoritative about *what flew and when*, and derivative about
motor performance.

**[L3H]** — L3Harris Aerojet Rocketdyne product pages for the RL10 and RS-25
(l3harris.com). Manufacturer datasheets — the source of the RS-25 thrust, Pc,
Isp, ε = 69:1 and 7,775 lb dry-mass figures, and of the RL10 family table.
Manufacturer marketing material: headline figures are nominal, the conditions
behind them are usually unstated, and where the same quantity has more than one
defensible definition (RS-25 expansion ratio) the page picks one silently.

**[NASA-SLS-SRB]** — NASA SLS Solid Rocket Booster reference page
(nasa.gov/reference/space-launch-system-solid-rocket-booster/) plus the 2015 and
2024 SLS SRB fact sheets. Agency public-affairs material rather than engineering
documentation; the fact-sheet PDFs would not text-extract during the pass and one
extraction was visibly corrupted, so figures were read from the web page.

**[NASA-SRB]** — NASA Space Shuttle SRB news reference / fact-sheet material
(propellant composition, grain geometry, burn time). The
`science.ksc.nasa.gov` STS news reference returned **503 during the pass** and
web.archive.org was unreachable from that environment, so this tag rests on
widely reproduced extracts of a document that could not be re-read. The PBAN
composition figures it carries are consistent across every secondary source, which
is reassuring but is not verification.

**[NASA-SOA]** — NASA, *State of the Art of Small Spacecraft Technology*,
propulsion chapter (ch. 4, In-Space Propulsion). An agency survey of flown and
offered small-spacecraft propulsion, revised roughly annually. Better than the
rest of this section — it is edited and referenced — but it is a survey of
*manufacturer-supplied* envelopes, so its performance ranges are what suppliers
claim, not what an independent test measured. Quote it for class envelopes
(e.g. the 10 µN – 3.6 N cold-gas band), not for a specific unit.

**[NG-BOLE]** — Northrop Grumman BOLE DM-1 press material
(news.northropgrumman.com). Manufacturer press release on a motor still in
development; every figure from it is a claim, and the modules label it so.

**[NG-COMM]** — Northrop Grumman commercial rocket motor product pages (GEM and
Star families). Manufacturer datasheets. The *Propulsion Products Catalog* PDF
would not text-extract during the pass, so the product pages are what was
actually read.

**[Rogers Commission]** — *Report of the Presidential Commission on the Space
Shuttle Challenger Accident*, Vol. I, ch. IV (field joint, O-ring seal dynamics,
STS-51-L failure). **The exception in this section:** this is a primary
government investigation report and is entirely citable. It is listed here only
because the tag entered the course through the solid-motor worksheet. See
[Rogers86] in section 4 for the entry with a link.

**[VACCO]** — VACCO Industries CubeSat propulsion data sheets
(cubesat-propulsion.com system pages), plus the JPL MarCO data sheet. Supplier
datasheets: thrust, total impulse and wet mass as offered, with test conditions
usually unstated. See [MarCO] in section 4 for the one unit in this family with
flight data behind it.

**[WP]** — Wikipedia. Used **only** where the article itself cites a source, and
flagged as [WP] wherever it appears so the reader knows the chain is third-hand.
Where a [WP] figure mattered, the module pairs it with a second tag (e.g. the
GEM-40 propellant mass and burn time carry `[WP]`/`[NG-COMM]` at confidence B).
Never cite it onward without following its reference.

### 9.1 Alternative tag forms used in module text

Several modules were drafted with a different short form for a source that is
already in this bibliography. The tags below are aliases, kept so that the text
resolves without rewriting citations; **cite the canonical tag in new material.**

- **[Gradl22]** — alias for [GradlAM]: Gradl, P. R., Protz, C. S., Mireles,
  O. R., and Garcia, C. P. (eds.), *Metal Additive Manufacturing for Propulsion
  Applications*, AIAA, 2022.
- **[HHL]** — alias for [Humble]: Humble, R. W., Henry, G. N., and Larson, W. J.
  (eds.), *Space Propulsion Analysis and Design*, McGraw-Hill, 1995. (The tag is
  the three authors' initials.)
- **[Lenoir57]** — alias for [LR57]: Lenoir, J. M., and Robillard, G., "A
  Mathematical Method to Predict the Effects of Erosive Burning in
  Solid-Propellant Rockets," *Sixth Symposium (International) on Combustion*,
  1957.
- **[NIST]** — alias for [NIST-WB] (the free *NIST Chemistry WebBook*, SRD 69)
  and, where a real equation of state is required, [REFPROP] (SRD 23). Which one
  is meant depends on the calculation: WebBook for a property lookup, REFPROP for
  a supercritical cooling-jacket or feed-system model.
- **[YA95]** — alias for [LRECI]: Yang, V., and Anderson, W. E. (eds.), *Liquid
  Rocket Engine Combustion Instability*, Progress in Astronautics and
  Aeronautics Vol. 169, AIAA, 1995. See also [YA95-class] in section 8.

---

## Unverified

Items the user asked about, or that a propulsion engineer would reasonably want,
that could **not** be confirmed to a catalogue record, DOI or working link from
this session. Everything known about each is stated; no link is given where none
was seen. Treat these as leads to chase in a library, not as citations.

- **ASM Handbooks** (ASM International, e.g. Vol. 1 *Properties and Selection:
  Irons, Steels, and High-Performance Alloys*, Vol. 2 *Nonferrous Alloys*).
  Real and widely used for materials data, but no specific volume/edition was
  verified here, so no citation is offered. Subscription product.
- **Bazarov swirl injector chapter.** V. G. Bazarov is the recognised authority
  on liquid-liquid and gas-liquid swirl (centrifugal) injectors, and swirl
  injector theory is covered in [LRTC]. The specific chapter authorship and page
  range in Vol. 200 could not be confirmed from the table of contents in this
  session. Cite [LRTC] and the chapter you actually have in hand.
- **CPIA solid propellant handbook** (e.g. a "Solid Propellant Rocket Motor
  Propellant Handbook"). No public record found under CPIA 246 or a neighbouring
  number; CPIA 246 is the *liquid* engine performance manual ([CPIA-246]). Most
  JANNAF solid propellant handbooks are distribution-limited.
- **"Hulka & Hutt"** — likely Hutt, J. J., and Hulka, J. R. on LOX/hydrogen
  combustion stability, probably as a chapter in [LRECI]. Exact title, venue and
  year not confirmed.
- **J-2 engine familiarization manual** (Rocketdyne). The F-1 equivalent is
  verified as [F1-R3896]; the J-2 manual is widely circulated on archive and
  enthusiast sites but was not confirmed against a catalogue record here.
- **JANNAF Liquid Rocket Engine Test Facility handbook.** No public record found.
  Probably distribution-limited if it exists under that name.
- **Kalt, S., and Badal, D. L.**, on conical nozzle performance under separated
  flow (commonly cited as a 1965 report giving a separation-pressure criterion).
  Cited secondhand in [Schmucker73] and the separation literature; the original
  document was not located. Use the criterion as reported in [Schmucker73] or
  [OMK05] and cite those.
- **Minuteman / Peacekeeper propulsion histories.** Open official histories at
  the level of the Saturn or Shuttle literature were not found. [Hunley07] is the
  best verified substitute for US solid-motor development history.
- **NASA-HDBK-8739 series** (NASA quality/workmanship handbooks, e.g. soldering,
  crimping, staking). Real NASA handbook series, but the specific number and
  revision the user intended could not be pinned down; check
  <https://standards.nasa.gov>.
- **NASA CR-184345 and TEA-TEB ignition CRs.** No matching record surfaced for
  the specific CR number, and NTRS returned nothing for TEA-TEB ignition system
  queries. TEA-TEB (triethylaluminium/triethylborane) hypergolic slug ignition is
  well documented in engine-specific literature ([F1-R3896], [SSME-Orient])
  rather than in a dedicated public report.
- **Price, E. W.**, review of solid propellant combustion instability. Price's
  work is foundational (and is covered in the solid-instability chapters of the
  standard references), but no specific review paper was verified here.
- **RL10 history / "RL10 Liquid Rocket Engine" reports** (Pratt & Whitney). The
  RL10 story is covered substantially in [SP-4230]; a standalone P&W history
  report was not verified.
- **Rupe, J. H.**, JPL Progress Report 20-195 (1953), "The Liquid-Phase Mixing of
  a Pair of Impinging Streams," and the 1956 follow-on. Widely cited; the
  original progress reports were not located on NTRS in this session. The
  verified, substantively equivalent source is [Rupe65].
- **Stangeland, M. L.**, "Turbopumps for Liquid Rocket Engines," *Threshold*
  (Rocketdyne), 1988. Frequently cited in turbopump literature; *Threshold* was a
  Rocketdyne in-house journal and no public record was located.
- **Stepanoff, A. J.**, *Centrifugal and Axial Flow Pumps*, Wiley, 1957 (2nd ed.).
  A genuine classic, but no catalogue record was confirmed in this session.
  [Japikse] and [Brennen-Pumps] cover the same ground and are verified.
- **[Summerfield60]** — Summerfield, M., et al., granular diffusion flame (GDF)
  model of composite propellant burning, c. 1960, in the ARS *Progress in
  Astronautics and Rocketry* series. The model is standard and is the origin of
  the p^(1/3)-plus-linear burning-rate form used in Module 20; the original
  publication could not be located from this session, so no volume, page range or
  link is offered. [BDP70] is the verified modern successor, and [SB] §12.2
  reproduces the GDF derivation. Cite the tag only alongside one of those.
- **Summerfield granular diffusion flame (GDF) model** (Summerfield et al.,
  c. 1960, in the ARS *Progress in Astronautics and Rocketry* series). The model
  — which yields the p^(1/3)-plus-linear burning-rate form — is standard, but the
  original publication was not located. [BDP70] is the verified modern successor.
- **Thiokol/ATK RSRM and SLS booster design-overview papers.** NTRS has related
  material (e.g. an RSRM CFD overview, <https://ntrs.nasa.gov/citations/19960029273>),
  but no single authoritative public RSRM design-overview paper or current SLS
  booster fact sheet was confirmed here.
- **Vieille (1893) and Saint-Robert** — the origin of the r = a·p^n burning-rate
  law. Universally attributed in the secondary literature (Vieille's work on
  burning rate of nitrocellulose powders; Saint-Robert's earlier exponential
  form), but no primary citation was verified. State the law as [E] empirical and
  attribute it via a modern text ([Kubota], [Davenas]) rather than to a
  19th-century paper you have not read.

---

*Last verified: 2026-09-02. Links and editions decay; re-check before quoting a
report number in anything that leaves this repository.*
