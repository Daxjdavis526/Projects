# USU follow-up (round two): math/CS course record, advanced courses and their 2026–27 status, and USU open materials for The Physics Atlas

> **How this was verified (read first).**
> - **Network.** On 2026-10-27 (08:57 UTC) both `https://catalog.usu.edu/` and `https://digitalcommons.usu.edu/` still failed with `curl: (56) CONNECT tunnel failed, response 403`. The agent proxy logged each as "gateway answered 403 to CONNECT (policy denial or upstream failure)". WebFetch failed with `getaddrinfo ENOTFOUND digitalcommons.usu.edu`. Following the proxy README, the denial was not retried or routed around, and Playwright was not attempted.
> - **Every fact below comes from the WebSearch tool.** It returns result URLs plus a model-written summary of indexed snippets, not the page itself. 52 queries were used.
> - **What changed from round one.** The tool's `allowed_domains` filter (`catalog.usu.edu`, `digitalcommons.usu.edu`, `coursicle.com`) worked where the `site:` operator had not. That surfaced many official pages round one never saw.
> - **Quotation marks** mark snippet text as the tool relayed it. Check the wording against the live page before the app presents it as official USU text.
> - **Scope.** These notes record only findings that are new relative to round one or correct it, plus the consolidated table in section 5. Round one is in `usu_math_cs_and_advanced_courses.md`; the CS 1400 notes are in `labs_research_and_computing.md`. PHYS undergraduate core courses and the program's block structure belong to the parallel researcher and are cross-referenced only where needed.
>
> **Evidence levels used throughout**
> - **CD**: an official course page on USU's current Coursedog platform (`catalog.usu.edu/courses/{CODE}`) appeared in results with its title, credits or description. This is the closest available evidence for the 2026–27 catalog. No page's "active" flag or year label was visible.
> - **AC40**: an official page of the Acalog **2025–2026** catalog (catoid 40). Acalog course listings carrying `filter[only_active]=1` list that edition's active courses.
> - **AC39**: an official page of the Acalog **2024–2025** catalog (catoid 39).
> - **OLD**: seen only in older Acalog editions (catoid 35 or 12; their years were not pinned down). Treat as historical.
> - **LIST**: an official USU course list or program table named the course, but the tool did not say which edition's page carried it.
> - **3P**: third-party corroboration (Coursicle). Never official.
> - **INF**: my inference.

## 1. Which courses make up the 13-credit "Professional Emphasis Math Requirements" block, is MATH 2250 accepted in place of MATH 2270 + MATH 2280, and what is MATH 2270's official record?

### Takeaway
- **MATH 2270 is now verified.** It is Linear Algebra (QI), **3 credits**, with an official description, on both the Coursedog page and the 2025–26 Acalog page.
- **The block arithmetic now closes.** MATH 1220 (4) + MATH 2210 (3) + MATH 2270 (3) + MATH 2280 (3) = 13, every value now verified. No snippet printed the block's course lines, though, so the contents remain a strong inference.
- **USU routinely treats "MATH 2250, or MATH 2270 and MATH 2280" as interchangeable** in prerequisites. Whether MATH 2250 may be counted *inside* the physics block, and how the resulting 2-credit gap would be handled, was still not visible.

### Cited Findings
- **MATH 2270 credits and designation.** "MATH 2270 - Linear Algebra (QI)", 3 credits, Mathematics & Statistics. — [CD: catalog.usu.edu/courses/MATH2270](https://catalog.usu.edu/courses/MATH2270); [AC40: MATH 2270 (catoid 40, coid 338004)](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338004). This corrects round one, where MATH 2270's credits were only inferred.
- **MATH 2270 description** (snippet; check wording): "solutions of linear systems, matrix operations, matrix factorization, vector spaces, subspaces, linear independence, bases, linear transformations, eigensystems, orthogonality, Gram-Schmidt orthogonalization, and projections". The AC40 entry also says the course is not repeatable for credit. — same two sources.
- **MATH 2270 prerequisite (conflict between platforms):**
  - **2025–26 Acalog entry:** "MATH 1210 with a grade of C- or better or AP Math score of 3-4 on the BC exam". — [AC40 coid 338004](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338004)
  - **Coursedog page:** "a minimum grade of C- in" a course whose name was cut off in the snippet, or a sufficient AP score. — [CD MATH2270](https://catalog.usu.edu/courses/MATH2270)
  - The 2026–27 prerequisite course is therefore not visible.
- **The 13-credit block is re-confirmed in the 2025–26 edition.** Snippet: "Professional Emphasis Math Requirements (13 credits) All courses must be passed with a C- or better." The same snippet names MATH 2280 as the highest math requirement. — [AC40 Physics: Professional Emphasis – BS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40466&returnto=30826). The Coursedog program page also appeared in results, but its block contents were not shown. — [CD PHYX_PROF_BS](https://catalog.usu.edu/programs/PHYX-PHYX_PROF_BS-MAJOR)
- **The plain Physics BS (2024–25) has a 13-credit math block too.** Snippet: "Required Math Courses (13 credits)", with C- or better required and MATH 2280 the highest math requirement. — [AC39 Physics – BS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39042&returnto=30112). This is new: the 13-credit math block is shared with the plain BS, at least in 2024–25.
- **"MATH 2250, or MATH 2270 and MATH 2280" as alternatives in USU prerequisites:**
  - **A 3000-level PHYS course** (search summary): "Prerequisite(s): MATH 2210 MATH 2250 or MATH 2270 and MATH 2280". The tool did not say which course or page this was. It is very probably PHYS 3750. Candidate pages in the results: [AC39 4-Year Degree Map](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015); [AC39 Course Descriptions page](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=24&print=&expand=1)
  - **MATH 5410:** "2210 with a C- or better, 2250 or 2270 and 2280 with a C- or better". — [AC40 MATH 5410](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338028)
  - **MATH 4610:** relayed as "MATH 1220 with a C- or better in MATH 2250 or MATH 2270 with a C- or better". The grouping is ambiguous; the most likely reading is MATH 1220 (C-) plus MATH 2250 or MATH 2270 (C-). — [AC39 MATH 4610](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=332980)
  - **An MAE (engineering) course:** "MATH 2210; MATH 2250 (may be taken concurrently) or both MATH 2270 and MATH 2280 (may be taken concurrently)". The page was not identified; a candidate is [AC39 Mechanical Engineering – BS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39016&returnto=30406). This adds to round one's ME Aerospace statement that "both MATH 2270 and MATH 2280 may be taken in place of MATH 2250".

### Inferences
- **INF: the block is most likely MATH 1220 + 2210 + 2270 + 2280.** All four credit values are now official and sum exactly to 13. MATH 1210 sits outside the block as an admission prerequisite (round one).
- **INF: MATH 2250 is very probably an accepted substitute for 2270 + 2280.** USU writes "2250 or (2270 and 2280)" into prerequisites across physics, math and engineering. On the 2250 route the block would total 11 credits. Whether the program then requires 2 more credits is unknown.
- **INF: MATH 2270 can be taken early.** In 2025–26 it required only Calculus I. A learner can therefore start linear algebra alongside MATH 1220, and the Atlas's LA track need not wait for multivariable calculus.
- **INF: the 2270 + 2280 route keeps more doors open.** MATH 5110 Differential Geometry names **MATH 2270** (not 2250) as a prerequisite (section 3, 3P). That strengthens round one's recommendation of this route for the "Mathematics of Spacetime" track.

### Gaps
- **The block's printed course lines** and any "or" wording (e.g. "MATH 2250 OR MATH 2270 and MATH 2280") were not seen on any platform after four more targeted queries. Also unseen: any credit-shortfall rule for the 2250 route.
- **Possible future fetch.** The Coursedog platform has per-course program sub-pages (e.g. [MEEN_BS/MATH2250](https://catalog.usu.edu/programs/MEEN-MEEN_BS-MAJOR/MATH2250)). An equivalent such as `catalog.usu.edu/programs/PHYX-PHYX_PROF_BS-MAJOR/MATH2270` would settle the question if the host becomes reachable.
- **MATH 2270's 2026–27 prerequisite** (the course named on the Coursedog page) was not captured.

## 2. Prerequisites, terms offered, learning objectives and textbooks for MATH 1210, 1220, 2210, 2250, 2270, 2280 and CS 1400; CS 1400's language

### Takeaway
New this round:
- MATH 2250's prerequisite, which has been **MATH 1220** (or AP) since Summer 2023.
- MATH 2270's prerequisite (section 1).
- A cleaner official MATH 2210 description.
- A textbook alignment for MATH 2280: the tutoring centre's materials follow Kenneth Howell's *Ordinary Differential Equations*.

Still not found for any of the seven courses:
- **Course-level learning objectives:** none surfaced on either platform.
- **Terms offered:** no official data.

CS 1400's language is still **not stated** by the catalog. The only USU statement is that the CS 1400 challenge exam "is currently available only in Python", so Python is a strong inference, not a verified fact.

### Cited Findings
- **MATH 2250 prerequisite (since Summer 2023).** MATH 1220 with a C- or better, *or* AP Calculus AB 4–5, *or* AP Calculus BC 3–5. The search summary says the change took effect in Summer 2023. — [AC39 MATH 2250 (coid 329829)](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=329829)
  - An older version required "MATH 1210 with a grade of C- or better". The tool called these the "current" and an "older catalog version" without naming the pages, and these are the two MATH 2250 entries in the results, so the attribution is mine. — [OLD catoid 35 MATH 2250](https://catalog.usu.edu/preview_course_nopop.php?catoid=35&coid=288262)
- **MATH 2210 description (2025–26, snippet).** "partial differentiation and optimization of functions of several variables, multiple integration, calculus of vector fields, including line and surface integrals, and theorems of Green, Gauss, and Stokes". It "builds on material from Math 1210 and Math 1220". The prerequisite requires "a minimum grade of C-" in a course whose name was cut off. — [AC40 MATH 2210 (coid 338001)](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338001); [CD MATH2210](https://catalog.usu.edu/courses/MATH2210)
- **MATH 2280 prerequisite:** still not captured after a third targeted query. The search tool stated that no result showed MATH 2280's own prerequisite line. — query results incl. [CD MATH2280](https://catalog.usu.edu/courses/MATH2280)
- **Learning objectives.** A query aimed at "course learning objectives … students will be able to" for MATH 2210, 2270 and 2280 returned only content descriptions. The tool stated that no formal objectives appeared. — [CD MATH2270](https://catalog.usu.edu/courses/MATH2270); [CD MATH2280](https://catalog.usu.edu/courses/MATH2280); [AC40 MATH 2210](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338001)
- **Department competencies (older edition).** The Mathematics & Statistics department page lists general competencies expected of math majors, among them linear algebra/matrices, eigenvalues/eigenvectors, determinant, rank and ordinary differential equations. These are program expectations, not course objectives. — [OLD catoid 35 Mathematics and Statistics](https://catalog.usu.edu/preview_entity.php?catoid=35&ent_oid=3565&returnto=26547)
- **MATH 2280 textbook alignment.** The tutoring centre (AMLC) page for Math 2280 says its content is "closely aligned with the textbook 'Ordinary Differential Equations' by Kenneth Howell". It is organised by chapter (topics such as substitutions, exact equations and slope fields), and it includes a "Chapter 27" reminder sheet on Laplace transforms of piecewise and periodic functions. — [AMLC Math 2280](https://www.usu.edu/math/amlc/course-materials/math-2280/math-2280); [Chapter 27 Reminder Sheet (PDF)](https://artsci.usu.edu/math-stats/amlc/course-materials/math-2280/Chapter-27-Reminder-Sheet.pdf)
- **MATH 2210 and 2270 materials.** AMLC lists a "Calculus 3 • Math 2210 | Reference Guide" study aid, not a textbook. For Math 2270 the results showed only tutoring and recitation information; the search summary reported that materials for some courses are still under development. — [AMLC Class Resources](https://artsci.usu.edu/math-stats/amlc/course-materials/)
- **CS 1400 catalog record (confirms round one):**
  - 4 credits. Description: "Introduction to science of problem solving, programming, program development, algorithm analysis, and data structures. Students learn to develop correct software in a current programming language environment."
  - Prerequisite: MATH 1050 (C- or better), *or* Math ACT ≥ 25, an equivalent SAT score, *or* AP Calculus AB ≥ 3.
  - — [CD CS1400](https://catalog.usu.edu/courses/CS1400); [AC39 CS 1400 (coid 328234)](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=328234)
- **CS 1400 challenge exam (the only USU language statement found):**
  - "The CS 1400 Challenge Exam is currently available only in Python."
  - It has two parts, a written section and a programming section.
  - Passing gives credit for CS 1400 and lets the student enrol in CS 1410 and CS 1440.
  - The process starts by contacting Dr. Chad Mano.
  - — [USU CS Challenge and Competency Exams](https://www.usu.edu/cs/students/undergraduate/challenge-exams)
- **CS 1400 delivery.** A Spring 2022 online section listed Chad Mano as instructor; its syllabus did not load in results. — [USU-RCDE course search](https://rcde.usu.edu/coursesearch/course.cfm?s=474539)
- **Other schools' CS 1400 excluded.** A search for USU CS 1400 Python materials returned only other schools' different CS 1400 courses: UVU syllabi, SUU syllabi (Python, *How to Think Like a Computer Scientist*), and the University of Utah handbook (Python then Java). These are different institutions and were excluded as evidence for USU. — e.g. [U of Utah CS handbook](https://handbook.cs.utah.edu/2024-2025/CS/Prospective_Students/choosing_between_1400_1420.php)

### Inferences
- **INF: USU's CS 1400 is very probably taught in Python**, because the department offers its challenge exam only in Python. Present it in the Atlas as "the USU CS 1400 challenge exam is Python-only", not as "USU CS 1400 is taught in Python".
- **INF: Howell's text is a usable anchor for the Atlas's MATH 2280 module**, since USU's tutoring materials follow its chapter numbering. Label it "aligned with USU tutoring materials", not "the USU textbook": sections may differ.
- **INF: the Atlas's math sequence should treat MATH 1220 as the gate to MATH 2250** (current rule), while MATH 2270 (2025–26 rule) needs only MATH 1210.

### Gaps
- **Not captured from the catalog:** the full prerequisite lists for MATH 1210, 1220 and 2280, and the course named in MATH 2210's prerequisite.
- **Terms offered:** no official data for any of the seven courses. The only term evidence is round one's Spring 2026 MATH 2270 recitations.
- **Course learning objectives:** none found for any of the seven courses. The Coursedog sub-page pattern from round one (`/courses/{CODE}/course-learning-objectives-…`) never surfaced for a MATH or CS course.
- **Textbooks:** none found for MATH 1210 (in person), 2210, 2250, 2270 or CS 1400.
- **CS 1400 syllabus:** no USU syllabus naming the language was found.
- **CS 1405:** still no evidence that it exists (not re-searched).

## 3. Which advanced courses are active in the current (2026–2027) catalog, with number, title, credits, description, prerequisites and frequency?

### Takeaway
USU's catalog holds a deep ladder for a GR and mathematical-physics track. Verified this round, at the evidence levels shown:
- **PDE:** MATH 5420 (3), plus the graduate courses MATH 6420, 6450 and 6620.
- **Applied methods:** MATH 5410.
- **Differential geometry:** MATH 5110 (curves and surfaces) and MATH 6110 (manifolds, tensors, forms, Lie groups, Riemannian geometry, per 3P), plus MATH 6120 and Advanced Differential Geometry I/II (MATH 6130/6140).
- **Real analysis:** MATH 4200, MATH 5210/5220, MATH 6210/6220.
- **Topology:** MATH 5510 and MATH 6510.
- **Algebra:** MATH 4310 and MATH 5310.
- **Representation and Lie theory:** MATH 6370.
- **Numerical analysis:** MATH 4610, MATH 5610/5620 and MATH 6620.
- **Probability and statistics:** MATH 5710/5720.
- **Physics methods:** PHYS 5340/5350 Methods of Theoretical Physics.
- **General relativity:** **PHYS 5910/6910 Relativity I (3)** and PHYS 6920 Relativity II.

How current the evidence is:
- **No graduate (6000-level) course page surfaced on the Coursedog (2026–27) platform.** Their newest official evidence is the 2025–26 (AC40) or 2024–25 (AC39) edition.
- **Only MATH 4200, 4310, 5270, 5340 and 5710 (plus MAE 2450 and PHYS 1040) have CD pages.**
- **Third-party term data:** MATH 5420 has a Spring 2027 listing and MATH 6110 a Spring 2026 section (3P).

Not found anywhere:
- a functional analysis course
- a classical field theory course
- an upper-division cosmology or astrophysics course

### Cited Findings
**Catalog edition key (new; resolves a round-one gap)**
- **catoid 40 = 2025–2026.** Its pages include the "2025-2026 Academic Calendar" and the 2025–2026 alphabetical program list. — [2025-2026 Academic Calendar (catoid 40)](https://catalog.usu.edu/content.php?catoid=40&navoid=31007); [Programs listed alphabetically (catoid 40)](https://catalog.usu.edu/content.php?catoid=40&navoid=30650)
- **catoid 39 = 2024–2025.** — [2024-2025 Academic Calendar (catoid 39)](https://catalog.usu.edu/content.php?catoid=39&navoid=30439)
- **The Coursedog site's "Archived Catalogs" page lists 2025–2026 among archived catalogs**, going back to 2019–2020. — [Archived Catalogs](https://catalog.usu.edu/pages/qkt6LJxwcPkbFi9EsnMB)
- **A catoid-40 page carried a banner** "Under Revision: Information not finalized until official publication" (as reported by the tool; which page was not identified).

**Partial differential equations and applied methods**
- **MATH 5420 Partial Differential Equations, 3 credits.**
  - The Industrial Mathematics MS lists it as a first-year core option: "one of MATH 5410 … or MATH 5420". — [AC40 Industrial Mathematics – MS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40274&print=)
  - Its official description was not captured.
  - **3P:** Coursicle describes "physically relevant PDEs": transport, diffusion, wave and Laplace equations, characteristics, Fourier series, transform methods and fundamental solutions. It shows 3 credits, classes of about 40–60, semesters listed from Spring 2023 through Spring 2027, and recent instructors Jim Powell, Nghiem Nguyen, Joseph Koebbe and Luis Gordillo. — [Coursicle USU MATH 5420](https://www.coursicle.com/usu/courses/MATH/5420/)
- **MATH 5410 Methods of Applied Mathematics, 3 credits.**
  - Description: "traditional approaches in applied mathematics, including dimensional analysis, the Buckingham Pi Theorem, perturbation methods, singular perturbations and boundary layer problems, variational methods, and Hamiltonian systems".
  - Prerequisites as in section 1.
  - — [AC40 MATH 5410](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338028)
- **MATH 6450 Analysis of PDE, 2 credits.**
  - Description: Sobolev spaces, embedding theorems, interpolation inequalities, weak solutions of linear and nonlinear PDEs, calculus of variations, and existence theory for nonlinear elliptic PDEs.
  - Prerequisite as printed: "MATH 5420 MATH 5210 or MATH 6420 or MATH 6210".
  - — [AC39 MATH 6450](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=329885)
- **MATH 6420 Classical Methods in PDE, 2 credits** (title only). — [AC39 course list](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=45&coid%5B0%5D=329885&display_location=filter_template)
- **Graduate ODE courses** (titles only): MATH 6410 Existence and Uniqueness of Solutions to ODE, and MATH 6440 ODE and Dynamics. They were listed with MATH 6420. The tool did not say which edition's page carried the list. A 2025–26 active-course page was among the results, as were older-edition pages. — [AC40 course list (candidate)](https://catalog.usu.edu/content.php?catoid=40&catoid=40&filter%5B3%5D=1&filter%5Bcpage%5D=48&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&navoid=30491&print=)
- **MATH 6620 Finite Difference Approximations for Solutions to PDE.** Prerequisite: "MATH 5620 or equivalent MATH 5420 or equivalent". — [AC40 MATH 6620](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338064)

**Differential geometry**
- **MATH 6110 Differential Geometry, 3 credits.**
  - The 2025–26 active-course list shows it with **MATH 6120 Differential Geometry**, **MATH 6130 Advanced Differential Geometry I** and **MATH 6140 Advanced Differential Geometry II**. — [AC40 course list (cpage 48)](https://catalog.usu.edu/content.php?catoid=40&catoid=40&filter%5B3%5D=1&filter%5Bcpage%5D=48&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&navoid=30491&print=)
  - The MS and PhD programs list a "Geometry & Topology 6110/6510" topic track. The PhD marks it recommended for the Pure track, not the Applied track. — [AC40 Mathematics – MS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40308&returnto=30826); [AC40 Mathematical Sciences – PhD](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40303&print=&returnto=30826)
  - The MS page lists the department's research areas as including "differential geometry, computer-aided algebra and mathematical physics". — [AC40 Mathematics – MS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40308&returnto=30826)
  - **3P (Coursicle):**
    - Topics: "manifolds, calculus on manifolds, tensor calculus and differential forms, Lie groups, Riemannian geometry, deRham's Theorem, and Hodge theory".
    - Prerequisite: C- or better in MATH 5110 or MATH 5220.
    - Delivery: 3 credits, usually MWF, one Logan section.
    - Terms: a Spring 2026 section; earlier Spring 2023, Fall 2020, Fall 2018 and Fall 2016, an irregular pattern of roughly every 2–3 years.
    - — [Coursicle USU MATH 6110](https://www.coursicle.com/usu/courses/MATH/6110/)
- **MATH 5110 Differential Geometry.**
  - The 2024–25 MS lists a 5000-level "Geometry and Topology 5110/5510" track (6 credits). — [AC39 Mathematics – MS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39013)
  - **3P:** Coursicle gives the title "Differential Geometry" and describes "an introduction to the geometry of curves and surfaces in three dimensions using graphic and symbolic software". Prerequisites: MATH 2210, MATH 2270, and one of MATH 4200, MATH 4310 or MATH 5340, or instructor permission, all at C- or better. — [Coursicle USU MATH 5110](https://www.coursicle.com/usu/courses/MATH/5110/)

**Real analysis**
- **MATH 4200 Foundations of Analysis (CI), 3 credits.** "Rigorous development of the real number system and calculus. Emphasis is placed on learning how to construct proofs." — [CD MATH4200](https://catalog.usu.edu/courses/MATH4200)
- **MATH 5210 / 5220 Introduction to Analysis I / II.** The 2024–25 MS lists a 5000-level "Advanced Calculus 5210/5220" track (6 credits). — [AC39 Mathematics – MS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39013)
- **MATH 6210 / 6220 Real Analysis** (graduate; titles only). — LIST: [AC39 course list](https://catalog.usu.edu/content.php?catoid=39&coid%5B0%5D=329885&contract=&display_location=filter_template&filter%5B3%5D=1&filter%5Bcpage%5D=45&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&navoid=30109&print=); [AC40 course list](https://catalog.usu.edu/content.php?catoid=40&catoid=40&filter%5B3%5D=1&filter%5Bcpage%5D=48&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&navoid=30491&print=)

**Topology** (corrects round one, whose MATH 5510 probe found nothing)
- **MATH 5510 Introduction to Topology, 3 credits** (no description). It sits in the 2024–25 MS track "Geometry and Topology 5110/5510". — [AC39 Mathematics – MS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39013); [OLD catoid 35 course list](https://catalog.usu.edu/content.php?catoid=35&catoid=35&navoid=26241&filter%5Bitem_type%5D=3&filter%5Bcpage%5D=41)
- **MATH 6510 Topology, 3 credits.**
  - Description: "homotopy theory, fundamental groups, covering spaces, singular homology with applications to spheres and Euclidean spaces, CW complexes, cohomology ring, and Poincare duality".
  - Prerequisites: "C- or better in MATH 4310, MATH 5510; and C- or better in MATH 5310 or consent of instructor".
  - MATH 6510 must be completed before MATH 6520.
  - — [AC40 MATH 6510](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338061)
  - An old MATH 6520 Topology entry shows similar prerequisites. — [OLD catoid 12 MATH 6520](https://catalog.usu.edu/preview_course_nopop.php?catoid=12&coid=90623)

**Abstract algebra, group theory, Lie theory**
- **MATH 4310 Introduction to Algebraic Structures, 3 credits:** basic group and ring theory (summary). — [CD MATH4310](https://catalog.usu.edu/courses/MATH4310)
- **MATH 5310 Introduction to Modern Algebra, 3 credits.** "Continuation of MATH 4310. Topics include: Sylow theory for finite groups, factorization theory for commutative rings, and Galois theory. Prerequisite(s): C- or better in MATH 4310." — [AC39 MATH 5310](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=329853)
- **MATH 5340 Theory of Linear Algebra** (no description captured). The 2024–25 MS track "Algebra & Linear Algebra 5310/5340" carries 6 credits. — [CD MATH5340](https://catalog.usu.edu/courses/MATH5340); [AC39 MATH 5340](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=329854); [AC39 Mathematics – MS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39013)
- **MATH 6370 Advanced Multilinear Algebra and Representation Theory II** (graduate). Topics include representations of groups, Lie theory, and connections to algebraic geometry (summary). — [AC40 MATH 6370](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=342880)
- **No standalone Lie groups / Lie algebras course** surfaced. Lie groups appear inside MATH 6110 (3P) and Lie theory inside MATH 6370 (AC40). A probe for "MATH 6360" (a presumed part I of MATH 6370) found nothing.

**Functional analysis**
- **No USU course found.** A `catalog.usu.edu`-restricted query on Banach and Hilbert spaces returned no USU page. MATH 6210/6220 Real Analysis exist, but their contents were not captured.

**Numerical analysis** (corrects round one's "personal page only" status)
- **MATH 4610 Fundamentals of Numerical Analysis** is in the official 2024–25 catalog. Prerequisites as in section 1. Credits and description were not captured. — [AC39 MATH 4610](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=332980)
- **MATH 5610 Computational Linear Algebra (2 credits)** and **MATH 5620 Numerical Algorithms for Approximate Solutions of DE (2 credits).**
  - The Industrial Mathematics MS titles 5620 "Numerical Solution of Differential Equations", so the title varies by page.
  - The MS lists the pair as a "Computational Mathematics 5610/5620" track (4 credits).
  - — [AC40 Industrial Mathematics – MS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40274&print=); [AC40 Mathematics – MS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40308&returnto=30826)
  - The older Computational Mathematics BS accepts "MATH 4610 - Fundamentals of Numerical Analysis or MATH 5610 - Computational Linear Algebra". — [OLD catoid 35 Mathematics: Computational – BA, BS](https://catalog.usu.edu/preview_program.php?catoid=35&poid=34167)
- **MAE 2450 Engineering Numerical Methods, 3 credits** (engineering): "basic tools of numerical analysis, solution to ordinary and partial differential equations, and software development". — [CD MAE2450](https://catalog.usu.edu/courses/MAE2450); [AC40 MAE 2450](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=337923)
- Round one's "Math 6610 Introduction to Numerical Analysis" (from a personal page) did not appear in any official result.

**Probability and statistics**
- **MATH 5710 Introduction to Probability, 3 credits:** probability theory from the discrete and continuous cases through the central limit theorem, including random variables, Bayes' theorem and moment generating functions (summary). — [CD MATH5710](https://catalog.usu.edu/courses/MATH5710)
- **MATH 5720 Introduction to Mathematical Statistics, 3 credits.**
  - The Statistics MS requires MATH 5710/5720 or STAT 6710/6720 (Mathematical Statistics I/II), with a B or better in both semesters.
  - The Statistics BA/BS names MATH 5720 as its highest math requirement.
  - — [AC39 Statistics – MS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39097); [AC39 Statistics – BA, BS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39096)
- **STAT 6645 Mathematical Methods for Data Science** (title only; data science, not physics). — [AC40 STAT 6645](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=342130)

**Mathematical methods of physics**
- **PHYS 5340 Methods of Theoretical Physics I (3)** and **PHYS 5350 Methods of Theoretical Physics II (3)**: titles and credits only. — [OLD catoid 12 course list](https://catalog.usu.edu/content.php?catoid=12&catoid=12&navoid=3321&filter[item_type]=3&filter[only_active]=1&filter[3]=1&filter[cpage]=52)
  - PHYS 5350 appears among the course options of the 2025–26 Physics MS. — [AC40 Physics – MS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40338&print=&returnto=30650)
  - No description or prerequisites were found for either course.
- The program's own undergraduate methods course, PHYS 3750, belongs to the parallel researcher.

**General relativity** (corrects round one's "none in the catalog")
- **PHYS 6910 Relativity I, 3 credits** (2024–25 entry):
  - "Foundations of spacetime physics", covering special and general relativity, the description of curved spacetime, and the Einstein equations.
  - Prerequisites: PHYS 3710 and PHYS 4600.
  - Dual-listed as **PHYS 5910**; 6000-level students have additional assignments.
  - — [AC39 PHYS 6910 (coid 330749)](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330749)
  - It also appears in older listings. — [OLD catoid 12 list](https://catalog.usu.edu/content.php?catoid=12&catoid=12&navoid=3321&filter[item_type]=3&filter[only_active]=1&filter[3]=1&filter[cpage]=52); [OLD catoid 35 list](https://catalog.usu.edu/content.php?catoid=35&catoid=35&navoid=26241&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=50)
- **PHYS 6920 Relativity II, 3 credits** (no description). — LIST: same result set as [AC39 PHYS 6910](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330749) and the older lists above.
- **3P:** Coursicle's USU PHYS list shows both PHYS 5910 and PHYS 6910 titled "Relativity I". A PHYS 6930 entry sits near a "Relativity I" label with unclear mapping. — [Coursicle USU PHYS](https://www.coursicle.com/usu/courses/PHYS/)
- **Conflict, resolved in favour of the official entry.** An earlier Coursicle-restricted search summary claimed PHYS 6910 "appears next to Optics II" and that Relativity I is "PHYS 6930". The narrower follow-up query contradicted it, and the official 2024–25 entry names PHYS 6910 Relativity I explicitly. I treat the first summary as a misreading of the list layout.

**Classical field theory, cosmology, astrophysics, graduate physics core**
- **Classical field theory: no catalog course found.** Torre's monograph says it grew from lecture notes for a course on classical field theory that he teaches "from time to time" at USU. — [DigitalCommons: Introduction to Classical Field Theory](https://digitalcommons.usu.edu/lib_mono/3/)
- **Cosmology and astrophysics: no upper-division course found.**
  - The only astronomy-type courses found are **PHYS 1040** (intro astronomy: the solar system and wider universe, laws of motion, electromagnetic radiation, models of celestial motion; 3 credits, general education) and **PHYS 3010 Space Exploration from Earth to the Solar System (DSC/QI)**. — [CD PHYS1040](https://catalog.usu.edu/courses/PHYS1040); [AC39 PHYS 3010](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330702)
  - Cosmology does appear inside PHYS 3710's GR notes (section 4).
- **Graduate physics core** (titles, 3 credits each): PHYS 6010/6020 Classical Mechanics I/II, PHYS 6110/6120 Electrodynamics I/II, PHYS 6210/6220 Quantum Mechanics I/II. The tool did not say which edition's list carried them. — LIST: [Course Descriptions (catoid 39)](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1); [OLD catoid 12 list](https://catalog.usu.edu/content.php?catoid=12&catoid=12&navoid=3321&filter[item_type]=3&filter[only_active]=1&filter[3]=1&filter[cpage]=52)
  - An older Physics MS (Plan A) requires 30 credits, 6–15 of them thesis research, and "a minimum of 4 (out of 10) core PhD courses". — [OLD catoid 35 Physics – MS](https://catalog.usu.edu/preview_program.php?catoid=35&poid=33918&returnto=28333)
  - The physics department page lists "mathematical physics, computer algebra" among theoretical research areas. — [Physics department (catoid 38)](https://catalog.usu.edu/preview_entity.php?catoid=38&ent_oid=3949)

### Inferences
- **INF: three labels for the Atlas.**
  - (1) **"USU required"**: the Professional Emphasis courses.
  - (2) **"USU course, not required by the BS"**: the official electives and graduate courses above, each tagged with the newest catalog edition seen.
  - (3) **"Supplementary (non-USU)"**.
- **INF: proposed official anchors for the "Mathematics of Spacetime" / GR modules:**
  - curves and surfaces → MATH 5110
  - manifolds, tensors, forms, Lie groups, Riemannian geometry → MATH 6110 (its topic list is 3P only)
  - PDE → MATH 5420 (methods) and MATH 6450 (analysis)
  - analysis → MATH 4200 → MATH 5210/5220
  - topology → MATH 5510 → MATH 6510
  - algebra → MATH 4310 → MATH 5310
  - representation and Lie theory → MATH 6370
  - numerics → MATH 4610/5610/5620/6620
  - complex variables → MATH 5270
  - physics methods → PHYS 5340/5350
  - GR → PHYS 5910/6910 → PHYS 6920

  Functional analysis, classical field theory and cosmology have no official USU course, so those modules should carry label (3). Classical field theory can still cite USU-authored open text (section 4).
- **INF: PHYS 5910 is reachable within the emphasis.** Its prerequisites, PHYS 3710 and PHYS 4600, are both physics courses in the program per the parallel notes, so a senior can take it. Whether it counts toward any program elective is for the PHYS/program researcher.
- **INF: MATH 6110 runs irregularly** (3P history). The app should not present it as an annual course.

### Gaps
- **2026–27 "active" status cannot be confirmed for any course without a CD page.** That covers every 6000-level MATH and PHYS course here, plus MATH 5110, 5210/5220, 5310, 5410, 5420, 5510, 5610/5620, 5720 and PHYS 5340/5350/5910. Their newest official evidence is AC40 or AC39. "PHYS6910 Course"-style queries returned no Coursedog page.
- **Official descriptions not captured:** MATH 5420, 5510, 5340, 6110, 6120, 6130, 6140, 6210/6220, 6410, 6440, 4610; PHYS 5340/5350 and 6920. The MATH 5420, 5110 and 6110 descriptions are third-party only.
- **Frequency:** official data for none of these courses; 3P only for MATH 5420 and 6110.
- **Not found:** MATH 5320, MATH 6360 and MATH 6610 (round one's background leads), and any functional analysis, classical field theory or upper-division cosmology/astrophysics course.

## 4. USU faculty open course materials (with links and licences)

### Takeaway
All four leads from round one are now verified on DigitalCommons@USU.

| Resource | Author | Version / date | Licence |
|---|---|---|---|
| *Foundations of Wave Phenomena* (complete version) | Charles Torre | v8.3.1, 2023 | CC BY-NC-ND 3.0 |
| *Introduction to Classical Field Theory* | Charles Torre | v1.41, Dec 2023 | CC BY-NC-ND 4.0 |
| Intermediate Modern Physics notes, incl. a General Relativity set (GR 1–9 + an inflation spreadsheet) | David Peak, for PHYS 3710, Spring 2018 | 2018 | Not visible |
| DifferentialGeometry Maple package: downloads, tutorials and the 2012 *J. Math. Phys.* paper | Ian Anderson and Charles Torre | DG2022 release | Not visible |

No dedicated Torre GR lecture-note set was found; only GR tutorials and the field-theory monograph.

### Cited Findings
**Charles G. Torre, *Foundations of Wave Phenomena***
- **Complete Version:** Version 8.3.1, 2023. Licence on the record page: Creative Commons Attribution-Noncommercial-No Derivative Works 3.0. — [record](https://digitalcommons.usu.edu/foundation_wave/1/); [PDF (Waves_8_3.pdf)](https://digitalcommons.usu.edu/context/foundation_wave/article/1000/viewcontent/Waves_8_3.pdf)
- **Collection:** [digitalcommons.usu.edu/foundation_wave](https://digitalcommons.usu.edu/foundation_wave/). Per-chapter records (Version 8.2, 2014) seen:
  - [01 Harmonic Oscillations](https://digitalcommons.usu.edu/foundation_wave/22/)
  - [02 Coupled Oscillators](https://digitalcommons.usu.edu/foundation_wave/21/) (with appendices on harmonic oscillations and vector spaces)
  - [04 Linear Chain of Coupled Oscillators](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1004&context=foundation_wave)
  - [05 The Continuum Limit and the Wave Equation](https://digitalcommons.usu.edu/foundation_wave/18/)
  - [06 Elementary Solutions to the Wave Equation](https://digitalcommons.usu.edu/foundation_wave/17/)
  - [09 The Wave Equation in 3 Dimensions](https://digitalcommons.usu.edu/foundation_wave/14/)
  - [12 Cylindrical Coordinates](https://digitalcommons.usu.edu/foundation_wave/11/)
  - [16 The Curl](https://digitalcommons.usu.edu/foundation_wave/7/)
  - [18 The Electromagnetic Wave Equation](https://digitalcommons.usu.edu/foundation_wave/5/)
  - [20 Polarization](https://digitalcommons.usu.edu/foundation_wave/3/)
  - [21 Non-Linear Wave Equations and Solitons](https://digitalcommons.usu.edu/foundation_wave/2/)
- **Chapter licences.** The chapter excerpts showed no licence statement, so the 3.0 licence on the complete version is the one confirmed.
- **Numbering.** The tool noted that the chapter numbers and the numbers in the page titles do not always match.

**Charles G. Torre, *Introduction to Classical Field Theory***
- **Record:** in USU's "All Complete Monographs" series. Version 1.4 is dated June 2022 and version 1.41 December 2023. — [record](https://digitalcommons.usu.edu/lib_mono/3/); [PDF](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1002&context=lib_mono)
- **Licence:** Creative Commons Attribution-Noncommercial-No Derivative Works 4.0. — [record](https://digitalcommons.usu.edu/lib_mono/3/)
- **Scope:** a "brief, informal introduction" to classical relativistic field theory covering scalar, spinor, gauge and gravitational fields.
- **Topics:** the Klein–Gordon field, electromagnetic field, scalar electrodynamics, Dirac field, Yang–Mills field and gravitational field; Noether's theorems; spontaneous symmetry breaking; Lagrangian and Hamiltonian formalisms.
- **Origin:** based on lecture notes for a course on classical field theory that Torre teaches from time to time at USU. — [record](https://digitalcommons.usu.edu/lib_mono/3/)

**David Peak, "Intermediate Modern Physics" (PHYS 3710, Spring 2018)**
- **Collection:** [digitalcommons.usu.edu/intermediate_modernphysics](https://digitalcommons.usu.edu/intermediate_modernphysics/). Its breadcrumb is Open Educational Resources > Additional Course Materials > Intermediate Modern Physics. Sub-collections:
  - [syllabus](https://digitalcommons.usu.edu/intermediate_modernphysics_syllabus/1/), dated 8 January 2018. It describes PHYS 3710 as "the principles and applications of special and general relativity and of the nuclear and sub-nuclear structures of matter".
  - [Special Relativity](https://digitalcommons.usu.edu/intermediate_modernphysics_special/)
  - [General Relativity](https://digitalcommons.usu.edu/intermediate_modernphysics_general/)
  - [Problems](https://digitalcommons.usu.edu/intermediate_modernphysics_problems/)
  - exams, e.g. [this record](https://digitalcommons.usu.edu/intermediate_modernphysics_exams/3/)
- **The General Relativity section** holds "General relativity, 1" through "General relativity, 9" plus ["Inflation (Excel)"](https://digitalcommons.usu.edu/intermediate_modernphysics_general/10/). Notes whose content surfaced:
  - [GR 2](https://digitalcommons.usu.edu/intermediate_modernphysics_general/2/): "Newton's law of gravitostatics is incompatible with special relativity".
  - [GR 5](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1004&context=intermediate_modernphysics_general): black holes and the Schwarzschild radius.
  - [GR 6](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1005&context=intermediate_modernphysics_general): "modern cosmography" in one summary, "galactic structure" in another. This conflict is unresolved.
  - GR 7: redshift and cosmology. This is inferred from a [problem set](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1009&context=intermediate_modernphysics_problems) that refers back to "GR7".
  - [GR 8](https://digitalcommons.usu.edu/intermediate_modernphysics_general/8/): the cosmic microwave background.
  - [GR 9](https://digitalcommons.usu.edu/intermediate_modernphysics_general/9/): cosmic development via the Friedmann equation.
  - GR 1, 3 and 4: contents not seen.
- **Licence and textbook:** neither was visible in any snippet.
- **Related lead for the PHYS researcher:** Peak also has an introductory modern physics collection, e.g. ["Foundations, 2"](https://digitalcommons.usu.edu/intro_modernphysics_foundations/2/).

**Ian M. Anderson and Charles G. Torre, DifferentialGeometry (Maple)**
- **Downloads:** ["DifferentialGeometry in Maple, Software Downloads"](https://digitalcommons.usu.edu/dg_downloads/).
  - ["The DifferentialGeometry Package"](https://digitalcommons.usu.edu/dg_downloads/4/) is a zip. It contains the Maple library `DifferentialGeometryUSU.mla`, a Maple help file, and a second library (`DGApplications.mla`; the snippet spells it "DGApplicatons.mla").
  - The [Installation Instructions](https://digitalcommons.usu.edu/dg_downloads/5/) say to load it with `with(DifferentialGeometry)` and check the build with `DGbuild`.
- **Tutorials:**
  - ["What's new in DifferentialGeometry Release DG2022"](https://digitalcommons.usu.edu/dg_tutorial/11/), a Maple worksheet demonstrating the 2022 release.
  - ["Lessons from GR 20 Workshop, Warsaw, July 2013"](https://digitalcommons.usu.edu/dg_tutorial/1/), six downloadable worksheets.
  - ["Introduction to the USU Library of Solutions to the Einstein Field Equations"](https://digitalcommons.usu.edu/dg_tutorial/8/).
- **Paper:** Anderson & Torre, "New symbolic tools for differential geometry, gravitation, and field theory", *Journal of Mathematical Physics* 53 (2012). — [PDF on DigitalCommons](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1193&context=mathsci_facpub); [arXiv:1103.1608](https://arxiv.org/pdf/1103.1608); a presentation record of the same title: [dg_pres/1](https://digitalcommons.usu.edu/dg_pres/1/)
  - It describes the package as performing "fundamental operations of calculus on manifolds, differential geometry, tensor calculus, spinor calculus", together with Lie groups, jet spaces and the variational calculus.
  - It also covers tools for Killing vectors and isometry groups, Killing tensors, algebraic classification of Einstein solutions, and symmetry reduction. The code of every command can be displayed.
  - Round one's article number "013511" was not visible this round.
- **Licence:** not visible in any snippet.

**Further Torre and Anderson items**
- **Torre's DigitalCommons author page** lists GR-related items, including a 2017 tutorial "Perihelion Precession in the General Theory of Relativity" and a 2017 tutorial on the USU Library of Solutions to the Einstein Field Equations. — [Charles Torre author listing](https://digitalcommons.usu.edu/do/discipline_browser/author_articles?discipline_key=114&author_display=Charles+Torre&aka=Charles+G.+Torre)
- **Torre, "Asymptotic Conservation Laws in Classical Field Theory".** — [PDF](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1036&context=physics_facpub)
- **Anderson, "Introduction to the Variational Bicomplex",** *Contemporary Mathematics* 132 (1992). — [PDF record](https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1170&amp=&context=mathsci_facpub)
- **Anderson & Kamran, "Conservation Laws and the Variational Bicomplex for Second Order Scalar …"** (the title was truncated in the result). — [record](https://digitalcommons.usu.edu/mathsci_facpub/34/)
- **Anderson & Torre (1996), "The Classification of Local Generalized Symmetries for the Einstein Equations",** *Communications in Mathematical Physics*, per the search summary of the faculty publication lists. — [Physics faculty publications](https://digitalcommons.usu.edu/physics_facpub/index.3.html); [Math & Stats faculty publications](https://digitalcommons.usu.edu/mathsci_facpub/index.3.html)
- **A student research item:** Leiter & Torre, "For the Dissertation: A Classification of Tensors in ECSK Theory". — [record](https://digitalcommons.usu.edu/phys_stures/39/)

### Inferences
- **INF: PHYS 3750 probably uses Torre's book.** The book's chapter arc (oscillators → continuum limit → wave equation → 3D and coordinates → curl and EM waves → polarization → solitons) and its title match PHYS 3750 "Foundations of Wave Phenomena". That makes it very probably the course's text, but no syllabus confirming it was found.
- **INF: what the licences allow the Atlas to do.**
  - Both Torre texts are NonCommercial-NoDerivatives. The safe pattern is to **link out to the unmodified PDFs with attribution**, not to adapt, excerpt-edit or remix them inside the app.
  - Treat Peak's notes and the DifferentialGeometry package as all rights reserved until their licences are checked.
- **INF: DifferentialGeometry is a validation tool, not an embeddable one.** It needs proprietary Maple (`.mla` libraries), so it cannot run inside a browser app. It can serve as the "USU-built" reference for checking the Atlas's tensor and curvature computations, and the USU Library of Solutions to the Einstein Field Equations could seed test cases.
- **INF: Peak's GR notes are the best official-USU anchor for the GR pathway's introductory tier.** They are undergraduate-level, tied to PHYS 3710, and cover Schwarzschild, redshift, CMB, Friedmann and inflation. Torre's field-theory text anchors the advanced tier.

### Gaps
- **Licences not visible:** Peak's collection, the DifferentialGeometry package, and the tutorials.
- **Peak's notes:** GR 1, 3 and 4 contents not seen, and the GR 6 conflict unresolved.
- **No dedicated Torre (or other USU) GR or differential-geometry lecture-note set** was found beyond the tutorials and the field-theory monograph. Anderson's *The Variational Bicomplex* book manuscript was not found this round.
- **Maple's own DifferentialGeometry.** Whether the version shipped inside Maple matches the USU DG2022 release, and since which Maple release it has shipped (round one's "Maple 11", still unverified), was not checked.

## 5. Best current record: every MATH/CS course in the program and every advanced course found

### Takeaway
The table consolidates round one and this round. "Newest evidence" gives the strongest official level seen, plus any third-party data. Every row was read through search snippets, not from the page itself (see the note at the top). Rows marked OLD or LIST only, or 3P only, must not be presented as current 2026–27 USU offerings without a check.

### Cited Findings
**A. MATH and CS courses in (or around) the Physics: Professional Emphasis BS**

| Course | Title (gen-ed) | Cr | Program role | Prerequisites (as found) | Terms / LOs / textbook | Newest evidence | Sources |
|---|---|---|---|---|---|---|---|
| MATH 1210 | Calculus I (QL) | 4 | Admission prerequisite for all USU physics programs; assumed passed | Catalog fragment only: taken within 2 years / 6 consecutive semesters, C-; qualifying list not captured | Terms: not found. LOs: none found. Textbook: none (in person) | CD (round one) | [CD MATH1210](https://catalog.usu.edu/courses/MATH1210); [USU Physics BS/BA](https://www.usu.edu/degrees-majors/physics_bs_ba) |
| MATH 1220 | Calculus II (QL) | 4 | In the 13-cr block (INF) | One online syllabus (2021): MATH 1210 C-, AP AB ≥4 or BC ≥3; catalog line not captured | Terms: not found. LOs: none. Textbook: Sisson & Szarvas (one online section, 2021 only) | CD (round one) | [CD MATH1220](https://catalog.usu.edu/courses/MATH1220); [Heal syllabus](https://www.usu.edu/math/rheal/math1220/syllabus) |
| MATH 2210 | Multivariable Calculus (QI) | 3 | In the 13-cr block (INF) | "minimum grade of C-" in a course cut off; builds on 1210 and 1220 | Terms: not found. LOs: none. AMLC reference guide only | CD + AC40 | [CD MATH2210](https://catalog.usu.edu/courses/MATH2210); [AC40 MATH 2210](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338001) |
| MATH 2270 | Linear Algebra (QI) | **3** (new) | In the 13-cr block (INF), default route with 2280 | 2025–26: MATH 1210 C- or AP BC 3–4; Coursedog list truncated | Terms: Spring 2026 recitations (round one). LOs: none. Textbook: none found | CD + AC40 | [CD MATH2270](https://catalog.usu.edu/courses/MATH2270); [AC40 MATH 2270](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338004) |
| MATH 2280 | Ordinary Differential Equations (QI) | 3 | Highest math requirement; in the 13-cr block | Not captured (fragment "Earn a minimum grade of C- in the following:") | Terms: not found. LOs: none. Textbook: AMLC materials aligned with Howell, *Ordinary Differential Equations* | CD (round one) + AC40 program text | [CD MATH2280](https://catalog.usu.edu/courses/MATH2280); [AMLC Math 2280](https://www.usu.edu/math/amlc/course-materials/math-2280/math-2280) |
| MATH 2250 | Linear Algebra and Differential Equations (QI) | 4 | Alternative to 2270 + 2280 in the degree-map sequencing rule; block status not shown | MATH 1220 C-, or AP AB 4–5, or BC 3–5 (since Summer 2023); formerly MATH 1210 | Terms: not found. LOs: none. Textbook: none found; AMLC calls it "primarily oriented towards students in engineering" | CD (round one) + AC39 | [CD MATH2250](https://catalog.usu.edu/courses/MATH2250); [AC39 MATH 2250](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=329829); [AC39 degree map](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015) |
| CS 1400 | Introduction to Computer Science–CS 1 | 4 | Not shown to be required by the program (round one) | MATH 1050 C-, or Math ACT ≥25 / equivalent SAT, or AP Calc AB ≥3 | Terms: online section Spring 2022 (Mano). LOs: none. Language: challenge exam "only in Python"; catalog says "a current programming language environment" | CD + AC39 | [CD CS1400](https://catalog.usu.edu/courses/CS1400); [CS challenge exams](https://www.usu.edu/cs/students/undergraduate/challenge-exams) |

**B. Advanced and graduate courses found (all outside the BS requirements)**

| Course | Title | Cr | Content (official unless marked 3P) | Prerequisites (as found) | Offering / frequency | Newest evidence | Sources |
|---|---|---|---|---|---|---|---|
| MATH 4200 | Foundations of Analysis (CI) | 3 | Rigorous development of the reals and calculus; proofs | Not captured | Not found | CD | [CD MATH4200](https://catalog.usu.edu/courses/MATH4200) |
| MATH 4310 | Introduction to Algebraic Structures | 3 | Basic group and ring theory | Not captured | Not found | CD | [CD MATH4310](https://catalog.usu.edu/courses/MATH4310) |
| MATH 4610 | Fundamentals of Numerical Analysis | n/c | Not captured | MATH 1220 C-; MATH 2250 or 2270 C- | Not found | AC39 | [AC39 MATH 4610](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=332980) |
| MATH 5110 | Differential Geometry | 3 (INF from 6-cr track) | 3P: curves and surfaces in 3D with graphic/symbolic software | 3P: MATH 2210, MATH 2270, and one of 4200/4310/5340 or permission; C- | Not found | AC39 (MS track) + 3P | [AC39 Math MS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39013); [Coursicle 5110](https://www.coursicle.com/usu/courses/MATH/5110/) |
| MATH 5210 / 5220 | Introduction to Analysis I / II | 6 total | Not captured | Not captured | Not found | AC39 (MS track) | [AC39 Math MS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39013) |
| MATH 5270 | Complex Variables | 3 | Analytic functions, contour integration, residues, conformal maps | Not captured | Not found | CD (round one) | [CD MATH5270](https://catalog.usu.edu/courses/MATH5270) |
| MATH 5310 | Introduction to Modern Algebra | 3 | Sylow theory, factorization in commutative rings, Galois theory | MATH 4310 C- | Not found | AC39 | [AC39 MATH 5310](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=329853) |
| MATH 5340 | Theory of Linear Algebra | 3 (INF from 6-cr track) | Not captured | Not captured | Not found | CD + AC39 | [CD MATH5340](https://catalog.usu.edu/courses/MATH5340) |
| MATH 5410 | Methods of Applied Mathematics | 3 | Dimensional analysis, Buckingham Pi, perturbation and boundary layers, variational methods, Hamiltonian systems | MATH 2210 C-; 2250, or 2270 and 2280, C- | Not found | AC40 | [AC40 MATH 5410](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338028) |
| MATH 5420 | Partial Differential Equations | 3 | 3P: transport, diffusion, wave and Laplace equations; characteristics; Fourier series; transforms; fundamental solutions | Not captured | 3P: semesters Spring 2023 – Spring 2027 | AC40 (program) + 3P | [AC40 Industrial Math MS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40274&print=); [Coursicle 5420](https://www.coursicle.com/usu/courses/MATH/5420/) |
| MATH 5510 | Introduction to Topology | 3 | Not captured | Not captured | Not found | AC39 (MS track) + OLD | [AC39 Math MS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39013) |
| MATH 5610 / 5620 | Computational Linear Algebra / Numerical Algorithms for Approximate Solutions of DE | 2 + 2 | Titles only | Not captured | Not found | AC40 (programs) | [AC40 Industrial Math MS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40274&print=) |
| MATH 5710 | Introduction to Probability | 3 | Discrete and continuous probability through the CLT | Not captured | Not found | CD | [CD MATH5710](https://catalog.usu.edu/courses/MATH5710) |
| MATH 5720 | Introduction to Mathematical Statistics | 3 | Not captured | Not captured | Not found | AC39 (programs) | [AC39 Statistics MS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39097) |
| MATH 6110 | Differential Geometry | 3 | 3P: manifolds, tensor calculus, forms, Lie groups, Riemannian geometry, de Rham, Hodge | 3P: MATH 5110 or MATH 5220, C- | 3P: Spring 2026; earlier Spring 2023, Fall 2020, 2018, 2016 | AC40 (active list) + 3P | [AC40 list](https://catalog.usu.edu/content.php?catoid=40&catoid=40&filter%5B3%5D=1&filter%5Bcpage%5D=48&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&navoid=30491&print=); [Coursicle 6110](https://www.coursicle.com/usu/courses/MATH/6110/) |
| MATH 6120 / 6130 / 6140 | Differential Geometry / Advanced Differential Geometry I / II | n/c | Titles only | Not captured | Not found | AC40 (active list) | [AC40 list](https://catalog.usu.edu/content.php?catoid=40&catoid=40&filter%5B3%5D=1&filter%5Bcpage%5D=48&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&navoid=30491&print=) |
| MATH 6210 / 6220 | Real Analysis | n/c | Titles only | Not captured | Not found | LIST | [AC39 list](https://catalog.usu.edu/content.php?catoid=39&coid%5B0%5D=329885&contract=&display_location=filter_template&filter%5B3%5D=1&filter%5Bcpage%5D=45&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&navoid=30109&print=) |
| MATH 6370 | Advanced Multilinear Algebra and Representation Theory II | n/c | Group representations, Lie theory, links to algebraic geometry | Not captured | Not found | AC40 | [AC40 MATH 6370](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=342880) |
| MATH 6410 / 6440 | Existence and Uniqueness of Solutions to ODE / ODE and Dynamics | n/c | Titles only | Not captured | Not found | LIST (likely AC40) | [AC40 list](https://catalog.usu.edu/content.php?catoid=40&catoid=40&filter%5B3%5D=1&filter%5Bcpage%5D=48&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&navoid=30491&print=) |
| MATH 6420 | Classical Methods in PDE | 2 | Title only | Not captured | Not found | AC39 (active list) | [AC39 list](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=45&coid%5B0%5D=329885&display_location=filter_template) |
| MATH 6450 | Analysis of PDE | 2 | Sobolev spaces, embeddings, weak solutions, calculus of variations, nonlinear elliptic existence | "MATH 5420 MATH 5210 or MATH 6420 or MATH 6210" | Not found | AC39 | [AC39 MATH 6450](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=329885) |
| MATH 6510 | Topology | 3 | Homotopy, fundamental group, covering spaces, singular homology, CW complexes, cohomology ring, Poincaré duality | MATH 4310, MATH 5510; MATH 5310 or consent; C- | Not found | AC40 | [AC40 MATH 6510](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338061) |
| MATH 6520 | Topology (sequel) | n/c | Not captured | Similar to 6510 (old entry) | Not found | OLD; named in the AC40 6510 entry | [OLD MATH 6520](https://catalog.usu.edu/preview_course_nopop.php?catoid=12&coid=90623) |
| MATH 6620 | Finite Difference Approximations for Solutions to PDE | n/c | Title only | MATH 5620 or equivalent; MATH 5420 or equivalent | Not found | AC40 | [AC40 MATH 6620](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=338064) |
| STAT 6710 / 6720 | Mathematical Statistics I / II | n/c | Not captured | Not captured | Not found | AC39 (program) | [AC39 Statistics MS](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39097) |
| STAT 6645 | Mathematical Methods for Data Science | n/c | Title only (tangential) | Not captured | Not found | AC40 | [AC40 STAT 6645](https://catalog.usu.edu/preview_course_nopop.php?catoid=40&coid=342130) |
| MAE 2450 | Engineering Numerical Methods | 3 | Numerical analysis tools; ODE and PDE solution; software development | Not captured | Not found | CD + AC40 | [CD MAE2450](https://catalog.usu.edu/courses/MAE2450) |
| PHYS 5340 / 5350 | Methods of Theoretical Physics I / II | 3 + 3 | Titles only | Not captured | Not found | OLD (5340); AC40 program (5350) | [OLD list](https://catalog.usu.edu/content.php?catoid=12&catoid=12&navoid=3321&filter[item_type]=3&filter[only_active]=1&filter[3]=1&filter[cpage]=52); [AC40 Physics MS](https://catalog.usu.edu/preview_program.php?catoid=40&poid=40338&print=&returnto=30650) |
| PHYS 5910 / 6910 | Relativity I (dual-listed) | 3 | Spacetime physics: special and general relativity, curved spacetime, Einstein equations; extra work at the 6000 level | PHYS 3710 and PHYS 4600 | Not found | AC39 + OLD + 3P | [AC39 PHYS 6910](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330749); [Coursicle PHYS](https://www.coursicle.com/usu/courses/PHYS/) |
| PHYS 6920 | Relativity II | 3 | Not captured | Not captured | Not found | LIST/OLD | [OLD catoid 35 list](https://catalog.usu.edu/content.php?catoid=35&catoid=35&navoid=26241&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=50) |
| PHYS 6010/6020, 6110/6120, 6210/6220 | Classical Mechanics I/II; Electrodynamics I/II; Quantum Mechanics I/II | 3 each | Titles only | Not captured | Not found | LIST | [Course Descriptions (catoid 39)](https://catalog.usu.edu/content.php?catoid=39&navoid=30109&filter%5Bitem_type%5D=3&filter%5Bonly_active%5D=1&filter%5B3%5D=1&filter%5Bcpage%5D=55&print=&expand=1) |
| PHYS 1040 | Introductory astronomy (general education) | 3 | Solar system and wider universe; motion, radiation, celestial models | High-school math | Not found | CD | [CD PHYS1040](https://catalog.usu.edu/courses/PHYS1040) |
| PHYS 3010 | Space Exploration from Earth to the Solar System (DSC/QI) | n/c | Planets and spacecraft instrumentation | Not captured | Not found | AC39 | [AC39 PHYS 3010](https://catalog.usu.edu/preview_course_nopop.php?catoid=39&coid=330702) |

"n/c" = not captured.

**C. Subjects with no USU course found**
- **Functional analysis:** no USU course found.
- **Standalone Lie groups / Lie algebras:** none. The topics appear inside MATH 6110 (3P) and MATH 6370 (AC40).
- **Classical field theory:** no catalog course. Torre teaches it "from time to time" and his text is open (section 4).
- **Upper-division cosmology / astrophysics:** none. Cosmology content sits in PHYS 3710's open notes (section 4).
- **Not seen in any official result:** MATH 5320, MATH 6360, MATH 6610, CS 1405.

### Inferences
- **INF: the Atlas's "official" badge should carry the newest evidence level.**
  - Courses with **CD** pages can be presented as current USU courses, with wording to be checked.
  - **AC40** rows can be presented as "in USU's 2025–26 catalog".
  - **AC39** rows as "in USU's 2024–25 catalog".
  - **LIST, OLD and 3P** rows only as "listed by USU in past catalogs" or "reported offered (third-party)".
- **INF: the only program-required math is the 13-credit block plus MATH 1210 as an entry prerequisite.** Everything in table B is optional for the BS. The GR-relevant ladder (MATH 5110 → 6110; PHYS 5910) is therefore "USU course, not required".

### Gaps
- **Every snippet-level row needs a word-for-word check** against the live catalog before publication, once `catalog.usu.edu` is reachable. Rendering the Coursedog `/courses/{CODE}` pages with Playwright would also reveal any "typically offered" and learning-objective fields that the search index never showed.
- **Credits not captured** (table "n/c") for MATH 4610, 6120–6140, 6210/6220, 6370, 6410/6440, 6520, 6620, STAT 6710/6720 and 6645, and PHYS 3010.
