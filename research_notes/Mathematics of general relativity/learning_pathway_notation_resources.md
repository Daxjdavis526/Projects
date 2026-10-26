# Learning Pathway, Prerequisites, Notation Conventions and Study Resources for the Mathematics of General Relativity

Scope note for the report writer: these notes support the front and back matter of "The Mathematics of General Relativity: From Calculus to Einstein's Field Equations", written for a US student who has finished Calculus I and is now taking Calculus II and calculus-based Physics I. All equations use the metric signature $(-,+,+,+)$ and the MTW/Carroll sign conventions unless a finding says otherwise. Every URL below was fetched or resolved during this research (October 2026) unless a Gap entry says it could not be reached.

---

## 1. What do real university GR courses list as prerequisites, and what is the usual US course order leading to GR?

### Takeaway
Stated prerequisites converge on the same short list: multivariable calculus, linear algebra, ordinary differential equations, Lagrangian (intermediate) mechanics with the calculus of variations, and special relativity. Electromagnetism is required for graduate courses (MIT, Caltech) but not for "physics-first" undergraduate courses (Hartle). For a student now in Calculus II, a realistic US route is about 4 to 6 semesters of math and physics before an undergraduate GR course (junior/senior year), and graduate GR after that.

### Cited Findings

#### Stated prerequisites by institution
- **MIT 8.962 General Relativity (graduate, Spring):** "Prereq: 8.07, 18.03, and 18.06", that is, Electromagnetism II, Differential Equations and Linear Algebra. Catalog description: "The basic principles of Einstein's general theory of relativity, differential geometry, experimental tests of general relativity, black holes, and cosmology." — [MIT Course Catalog, Physics (Course 8)](https://catalog.mit.edu/subjects/8/)
- The MIT OCW 8.962 (Spring 2020, Prof. Scott Hughes) syllabus adds: "Students should also be familiar with Lagrangians and action principles, Green's functions, and numerical analysis." It says some homework requires solving systems of differential equations numerically. The required text is Carroll, *Spacetime and Geometry* (Cambridge UP, 2019). It describes itself as "MIT's graduate course in general relativity". — [MIT OCW 8.962 syllabus](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus/)
- **MIT 8.286 The Early Universe (undergraduate, Alan Guth):** "Prereq: Physics II (GIR) and 18.03". Topics include "special relativity and the Doppler effect, Newtonian cosmological models, introduction to non-Euclidean spaces…". So it is a cosmology course that needs no prior GR. — [MIT Course Catalog, Physics](https://catalog.mit.edu/subjects/8/); [MIT OCW 8.286 Fall 2013](https://ocw.mit.edu/courses/8-286-the-early-universe-fall-2013/)
- **MIT 8.033 Relativity (undergraduate):** "Prereq: Calculus II (GIR) and Physics II (GIR)". It covers Lorentz transformations, four-vectors and Minkowski diagrams, and ends with an "Introduction to some concepts of general relativity; principle of equivalence. The Schwarzschild metric; gravitational red shift; particle and light trajectories; geodesics; Shapiro delay." **MIT 8.20 Introduction to Special Relativity** needs only "Calculus I (GIR) and Physics I (GIR)" and is "Intended for freshmen and sophomores." — [MIT Course Catalog, Physics](https://catalog.mit.edu/subjects/8/)
- **Important US-terminology caveat:** at MIT, "Calculus II (GIR)" is **18.02, multivariable calculus** ("Calculus of several variables. Vector algebra in 3-space, determinants, matrices… partial differentiation, gradient…"). That corresponds to a typical US university's *Calculus III*, not the single-variable Calculus II this reader is taking. 18.06 Linear Algebra and 18.03 Differential Equations both build on it (18.03 takes it as a corequisite). — [MIT Course Catalog, Mathematics (Course 18)](https://catalog.mit.edu/subjects/18/)
- **Caltech Ph 236 abc General Relativity (graduate):** "Prerequisites: a mastery of special relativity at the level of Goldstein's Classical Mechanics, or of Jackson's Classical Electrodynamics." Its description is "A systematic exposition of Einstein's general theory of relativity and its applications to gravitational waves, black holes, relativistic stars, causal structure of space-time, cosmology and brane worlds." It is given in alternate years and is not offered 2026–27. — [Caltech Physics course catalog, Ph 236 abc](https://physics.caltech.edu/academics/course-catalog/ph-236-abc)
- **Stanford PHYSICS 262 General Relativity (Autumn 2026, P. Graham):** the catalog entry lists **no formal prerequisite**. Its sequence runs from an overview of special relativity through "Riemannian geometry and the geodesic equations, to curvature, the energy-momentum tensor, and the Einstein field equations", followed by black holes (Schwarzschild, Reissner–Nordström, Kerr), gravitational waves and cosmology. — [Stanford ExploreCourses, PHYSICS 262](https://explorecourses.stanford.edu/search?view=catalog&filter-coursestatus-Active=on&q=PHYSICS%20262)
- **University of Chicago PHYS 26400 Spacetime and Black Holes (undergraduate):** "an introduction to general relativity, focusing on metrics and geodesics… It will begin by fully exploring special relativity, and will then introduce the basic tools of physics in curved spacetime." Prerequisite: "PHYS 18500 or consent of instructor". PHYS 18500 Intermediate Mechanics covers "the calculus of variations, Lagrangian and Hamiltonian mechanics, generalized coordinates…". Its own prerequisites are introductory mechanics plus MATH 18400 or 20300. — [UChicago College Catalog, Physics](http://collegecatalog.uchicago.edu/thecollege/physics/)
- **UC Santa Cruz PHYS 171 General Relativity, Black Holes, and Cosmology (a typical public-university undergraduate course):** prerequisites are "PHYS 105, PHYS 110A, and PHYS 110B; and PHYS 116A or MATH 21 and MATH 24". — [UCSC catalog, PHYS 171](https://catalog.ucsc.edu/en/current/general-catalog/courses/phys-physics/upper-division/phys-171)
  - PHYS 105 Mechanics covers "Lagrange's equations, and Hamiltonian dynamics". — [UCSC PHYS 105](https://catalog.ucsc.edu/en/current/general-catalog/courses/phys-physics/upper-division/phys-105)
  - PHYS 110A Electricity, Magnetism, and Optics. — [UCSC PHYS 110A](https://catalog.ucsc.edu/en/current/general-catalog/courses/phys-physics/upper-division/phys-110a)
  - PHYS 116A Mathematical Methods covers linear algebra, eigenvalue problems, ODEs and Laplace transforms, and requires MATH 23A, which is vector calculus including "The derivative of functions from n-dimensional to m-dimensional Euclidean space… as a linear transformation having matrix representation". — [UCSC PHYS 116A](https://catalog.ucsc.edu/en/current/general-catalog/courses/phys-physics/upper-division/phys-116a); [UCSC MATH 23A](https://catalog.ucsc.edu/en/current/general-catalog/courses/math-mathematics/lower-division/math-23a)
  - MATH 21 is Linear Algebra and MATH 24 is Ordinary Differential Equations. — [UCSC MATH 21](https://catalog.ucsc.edu/en/current/general-catalog/courses/math-mathematics/lower-division/math-21); [UCSC MATH 24](https://catalog.ucsc.edu/en/current/general-catalog/courses/math-mathematics/lower-division/math-24)
  - PHYS 116C covers Fourier series, Green's functions, special functions and PDEs. — [UCSC PHYS 116C](https://catalog.ucsc.edu/en/current/general-catalog/courses/phys-physics/upper-division/phys-116c)
- **UNC Wilmington (public; Hartle text):** "Prerequisites: Junior/Senior Standing. Preferably, students should have had a course in classical dynamics and should have completed Calculus III." Required text: Hartle, *Gravity*. — [UNCW GR syllabus (R. Herman)](https://people.uncw.edu/hermanr/GR/syllabus.htm)
- **University of Maryland PHYS 675 (public; Hartle text; archived Fall 2004/2007 pages, T. Jacobson):** "Stated prerequisites: PHYS 601 and PHYS 606, but undergraduate Lagrangian mechanics (PHYS 410) and electrodynamics (PHYS 411) should suffice." It is suitable for "advanced undergraduates". Wald is the "Track 2" text. — [UMD PHYS 675 syllabus](https://physics.umd.edu/grt/taj/675a/syllabus.html)
- **Cambridge Part II General Relativity (3rd-year undergraduate, 24 lectures, Lent Term; schedule for the Mathematical Tripos 2026–27):** "Part IB Methods and Variational Principles are very useful." The syllabus order is:
  1. a brief review of special relativity, with the "Equation of motion for free point particle derivable from a variational principle";
  2. curved spaces, geodesics and the equivalence principle;
  3. tensor calculus ("Covariant and contravariant tensors… Metric tensor… Connection, Christoffel symbols, covariant derivatives, parallel transport… Riemann and Ricci tensors, geodesic deviation");
  4. Schwarzschild;
  5. the Einstein equations with matter;
  6. linearized theory;
  7. black holes.
  Listed books: Carroll, Hartle, Hughston & Tod, d'Inverno, Rindler, Stephani, Wald. The Part IA Dynamics and Relativity course recommends Taylor & Wheeler *Spacetime Physics*. — [Cambridge Faculty of Mathematics, Schedules 2026–27 (PDF)](https://www.maths.cam.ac.uk/undergrad/files/schedules.pdf)
- **Cambridge Part III General Relativity (master's level):** "Familiarity with Newtonian gravity, special relativity, finite-dimensional vector spaces and the Euler-Lagrange equations is essential. Knowledge of the relativistic formulation of Maxwell's equations is highly desirable." It calls itself "a second course on General Relativity, albeit one that could just about be followed without prior exposure". Students without prior GR "should read an introductory book (e.g. Hartle or Rindler)". The first half is differential geometry, and the approach "is based on Wald and Misner, Thorne and Wheeler". — [Part III guide, General Relativity (H. Reall, 2020–21 PDF)](https://www.maths.cam.ac.uk/postgrad/part-iii/files/misc/2020-21%20Guide/Relativity%20and%20Gravitation/General%20Relativity.pdf)
- The Cambridge Part III preparation page says successful students "found it extremely useful to work through the Differential Geometry part of the course" over the summer. It also recommends drawing pictures for abstract definitions, being confident with special relativity, and practising Euler–Lagrange equations and index notation; it supplies exercise sheets for both. — [Cambridge Part III Relativity & Cosmology preparation page](https://www.maths.cam.ac.uk/postgrad/part-iii/node/63)

#### Hartle on what is essential
- Hartle (Am. J. Phys. 74, 14–21, 2006): "the only essential prerequisite to a 'physics first' exposition of general relativity is an intermediate course in mechanics. Neither quantum mechanics nor electrodynamics are necessary… Intermediate mechanics is thus the single essential physics prerequisite." He adds that special relativity "is usually necessary to develop… de novo at the beginning of an introductory course". He says important phenomena can be introduced "with just a basic background in mechanics and a minimum of mathematics beyond the usual advanced calculus tool kit." — [Hartle, arXiv gr-qc/0506075](https://arxiv.org/abs/gr-qc/0506075); [DOI 10.1119/1.2110581](https://doi.org/10.1119/1.2110581)
- Hartle cites an informal survey by William Hiscock of 32 midwestern research universities. It "found only a handful that offered an intermediate (junior/senior) course in general relativity". At UCSB, a one-quarter (~28 lectures) physics-first GR course "has been a standard junior/senior elective". — [Hartle, arXiv gr-qc/0506075](https://arxiv.org/abs/gr-qc/0506075)

#### Published "learning order" advice
- John Baez's "customary track through math" for physics: "To do physics you need calculus, multivariable calculus and linear algebra… you also need to know about ordinary differential equations… Most of the fundamental laws of physics are partial differential equations; these rely on multivariable calculus." He places GR after classical mechanics, E&M, special relativity (recommending Taylor & Wheeler) and quantum mechanics, in three tiers:
  - "to get intuition": Thorne; Wald's *Space, Time, and Gravity*; Geroch;
  - "for when you get serious": d'Inverno, Hartle, Schutz;
  - "for when you get really serious": MTW, Wald, Blau's notes.
  — [John Baez, "How to Learn Math and Physics" (updated Oct 14, 2024)](https://math.ucr.edu/home/baez/books.html)
- Gerard 't Hooft's ordered curriculum, "How to become a GOOD Theoretical Physicist", runs: Primary Mathematics, then Classical Mechanics, …, then Advanced Mathematics (which includes "Vectors and tensors" and "Extremum principle and approximation techniques"), then Special Relativity ("4-vectors and 4-tensors"), and later General Relativity ("The metric tensor; Space-time curvature; Einstein's gravity equation…"). He recommends Carroll's lecture notes for GR. — ['t Hooft site home](https://www.goodtheorist.science/); [GR page](https://www.goodtheorist.science/gr.html); [Advanced Mathematics page](https://www.goodtheorist.science/advmath.html); [Special Relativity page](https://www.goodtheorist.science/specialrel.html)

### Inferences

**Recommended US sequence from the reader's current position.** This synthesis rests on the MIT, UCSC, Chicago and Hartle findings above. Semester labels are typical, not universal.

| Stage | Math | Physics | What it unlocks for GR |
|---|---|---|---|
| Now (Year 1, sem. 2) | Calculus II (integration techniques, sequences/series, Taylor series) | Physics I (calculus-based mechanics) | Taylor expansion (weak-field limits), integrals for proper time |
| Year 2, sem. 1 | Calculus III (multivariable: partial derivatives, chain rule, gradient, Jacobians, multiple/line integrals) | Physics II (E&M) | partial derivatives $\partial_\mu$, coordinate changes |
| Year 2, sem. 2 | Linear Algebra; Ordinary Differential Equations (often in either order) | Modern Physics (usually includes special relativity) | matrices, bases, dual spaces, determinants; solving geodesic/orbit ODEs |
| Year 3 | Mathematical Methods (Boas-level: tensors, calculus of variations, PDEs) | Classical Mechanics (Lagrangian/Hamiltonian); upper-division E&M (relativistic form of Maxwell) | Euler–Lagrange to geodesics; index notation; wave equation to gravitational waves |
| Year 3–4 | (optional) Differential Geometry (math dept.) | **Undergraduate GR** (Hartle / Schutz / Moore) | full chain metric → Christoffel → Riemann → Einstein |
| Graduate | Differential geometry / topology | **Graduate GR** (Carroll; then Wald / MTW) | manifolds, abstract index notation, action principle |

- A self-studying student can start special relativity (Taylor & Wheeler; MIT's 8.20 assumes only Calculus I and Physics I) and a physics-first GR text (Hartle; Taylor/Wheeler/Bertschinger *Exploring Black Holes*) earlier than this table suggests. Math-first texts (Schutz, Carroll) realistically need Calculus III and linear algebra first.
- UK equivalents, briefly: Cambridge's sequence runs IA Dynamics & Relativity (special relativity), then IB Methods and Variational Principles, then Part II GR (undergraduate), then Part III GR (master's). This roughly matches the US sequence of modern physics/SR, math methods plus mechanics, undergraduate GR, then graduate GR.

### Gaps
- I did not find an official Stanford or Chicago prerequisite statement for their *graduate* GR courses; Stanford PHYSICS 262 lists none.
- The Cambridge Part III guide quoted is the 2020–21 version (lecturer H. Reall). Search results indicate later guides (Skinner, Warnick) keep the same prerequisite wording, but I could not open those PDFs to confirm.
- No source gives the percentage of US physics departments offering undergraduate GR today. The only figure found is Hiscock's informal survey, as reported by Hartle in 2006.

---

## 2. Which mathematical topics are prerequisites for which? (dependency map from derivatives to the field equations, plus variational calculus to the action principle)

### Takeaway
The logical chain in every standard text is:

metric $g_{\mu\nu}$ → Christoffel symbols $\Gamma^\lambda_{\mu\nu}$ (first derivatives of $g$) → covariant derivative $\nabla_\mu$ and parallel transport → geodesics. In parallel, $\nabla$ leads to the Riemann tensor (commutator of covariant derivatives) → Ricci tensor → Ricci scalar → Einstein tensor (divergence-free by the Bianchi identity), which is set equal to $8\pi G\,T_{\mu\nu}$.

That chain rests on multivariable calculus (partial derivatives, chain rule, Jacobians), linear algebra (bases, matrices, inverses, determinants) and index notation. A second, independent strand, the calculus of variations, gives the geodesic equation (stationary proper time) and the field equations (the Einstein–Hilbert action).

### Cited Findings

#### The canonical chain, with equation numbers from Carroll's free notes (arXiv gr-qc/9712019)
- Minkowski metric $\eta_{\mu\nu}=\mathrm{diag}(-1,+1,+1,+1)$ and interval $s^2=\eta_{\mu\nu}\Delta x^\mu\Delta x^\nu$ with the summation convention (eqs. 1.8–1.9). Carroll warns: "Some references, especially field theory books, define the metric with the opposite sign, so be careful." — [Carroll, Lecture Notes on GR, arXiv gr-qc/9712019](https://arxiv.org/abs/gr-qc/9712019)
- Inverse metric: $g^{\mu\nu}g_{\nu\sigma}=\delta^\mu_\sigma$ (eq. 2.28). The determinant $g=|g_{\mu\nu}|$ is a tensor density, and $\sqrt{|g|}$ turns densities into tensors (eqs. 2.41–2.42). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Christoffel symbols: $\Gamma^\sigma_{\mu\nu}=\tfrac12 g^{\sigma\rho}\left(\partial_\mu g_{\nu\rho}+\partial_\nu g_{\rho\mu}-\partial_\rho g_{\mu\nu}\right)$ (eq. 3.21). Carroll: "This is one of the most important formulas in this subject; commit it to memory." — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Covariant derivative of a general tensor (eq. 3.13): $\nabla_\sigma T^{\mu}{}_{\nu}=\partial_\sigma T^\mu{}_\nu+\Gamma^\mu_{\sigma\lambda}T^\lambda{}_\nu-\Gamma^\lambda_{\sigma\nu}T^\mu{}_\lambda$, with one $+\Gamma$ term per upper index and one $-\Gamma$ term per lower index. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Geodesic equation (eqs. 3.46–3.47): $\frac{D}{d\lambda}\frac{dx^\mu}{d\lambda}=0$, equivalently $\frac{d^2x^\mu}{d\lambda^2}+\Gamma^\mu_{\rho\sigma}\frac{dx^\rho}{d\lambda}\frac{dx^\sigma}{d\lambda}=0$ ("another one which you should memorize"). Carroll also shows that extremizing proper time (the variational route) gives the same equation (eqs. 3.55–3.56). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Riemann tensor from the commutator of covariant derivatives (eqs. 3.66–3.67): $[\nabla_\mu,\nabla_\nu]V^\rho=R^\rho{}_{\sigma\mu\nu}V^\sigma$ for zero torsion, with $R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\partial_\nu\Gamma^\rho_{\mu\sigma}+\Gamma^\rho_{\mu\lambda}\Gamma^\lambda_{\nu\sigma}-\Gamma^\rho_{\nu\lambda}\Gamma^\lambda_{\mu\sigma}$. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Bianchi identity $\nabla_{[\lambda}R_{\rho\sigma]\mu\nu}=0$ (eq. 3.88). Ricci tensor $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$ (eq. 3.90), "the only independent contraction (modulo conventions for the sign, which of course change from place to place)". Ricci scalar $R=g^{\mu\nu}R_{\mu\nu}$ (eq. 3.92). Contracted Bianchi identity: $\nabla^\mu R_{\rho\mu}=\tfrac12\nabla_\rho R$ (eqs. 3.93–3.94). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Energy–momentum conservation $\nabla_\mu T^{\mu\nu}=0$ (eq. 4.38). Requiring the Newtonian limit $\nabla^2 h_{00}=-8\pi G T_{00}$ fixes $\kappa=8\pi G$. Result (eq. 4.52): $R_{\mu\nu}-\tfrac12 R g_{\mu\nu}=8\pi G T_{\mu\nu}$; trace-reversed form (eqs. 4.44–4.45): $R_{\mu\nu}=8\pi G\left(T_{\mu\nu}-\tfrac12 T g_{\mu\nu}\right)$. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Action route: the Hilbert action $S_H=\int d^nx\,\sqrt{-g}\,R$ (eq. 4.54ff). With a cosmological constant, $S=\int d^nx\sqrt{-g}\,(R-2\Lambda)$ gives $R_{\mu\nu}-\tfrac12 R g_{\mu\nu}+\Lambda g_{\mu\nu}=0$ in vacuum (eqs. 4.73–4.74). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)

#### Where the prerequisite mathematics is taught (Boas, 3rd ed., chapter list verified)
| Boas chapter | Topics |
|---|---|
| Ch. 1 | infinite and power series (Taylor) |
| Ch. 3 | Linear Algebra: matrices, determinants, linear operators, "Linear Vector Spaces", eigenvalues and diagonalization, "General Vector Spaces" |
| Ch. 4 | Partial Differentiation: "Chain Rule", "More Chain Rule", Lagrange multipliers, "Change of Variables" |
| Ch. 5 | Multiple Integrals: "Change of Variables in Integrals; Jacobians" |
| Ch. 6 | Vector Analysis |
| Ch. 8 | Ordinary Differential Equations |
| Ch. 9 | Calculus of Variations: "The Euler Equation", "Several Dependent Variables; Lagrange's Equations" |
| Ch. 10 | Tensor Analysis: "Cartesian Tensors", "Tensor Notation and Operations", "Kronecker Delta and Levi-Civita Symbol", "Curvilinear Coordinates", "Non-Cartesian Tensors" |
| Ch. 13 | Partial Differential Equations |

— [Boas, 3rd ed., table of contents (CERN library PDF)](https://catalogue.library.cern/api/files/6a4048af-55df-435a-b604-b40f796b11c9/1.%20Table%20of%20contents.pdf). Wiley says the book is "intended for students who have had a two-semester or three-semester introductory calculus course". — [Wiley product page](https://www.wiley.com/en-us/Mathematical+Methods+in+the+Physical+Sciences%2C+3rd+Edition-p-9780471198260)

#### Published roadmaps / orderings that a writer can cite
- Cambridge Part II order: SR review plus the variational principle for free particles, then curved spaces and geodesics, then tensor calculus (covariant/contravariant, metric, connection, Christoffel, covariant derivative, parallel transport, Riemann, Ricci, geodesic deviation), then vacuum field equations, then the Einstein equations with matter (Bianchi identities, cosmological term), then linearized theory, then black holes. — [Cambridge Schedules 2026–27](https://www.maths.cam.ac.uk/undergrad/files/schedules.pdf)
- Moore's 13-week undergraduate syllabus interleaves the math with the physics. Index notation, arbitrary coordinates and tensor equations come in week 2 and geodesics in week 3, before Schwarzschild orbits. The absolute (covariant) gradient, geodesic deviation and the Riemann tensor come in week 8, the stress–energy tensor and Einstein equation in week 9, and linearized gravity in week 12. — [Moore, "Tips on Teaching General Relativity (with Tensors) to Undergraduates", AAPT TGRU 2006](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- Hartle's physics-first logic: the variational principle for stationary proper time, $\delta\int d\tau=0$, has "the same form as the variational principle for stationary action in classical mechanics… Lagrange's equations are the geodesic equations of motion." Hence "the geodesic equations are enough to explore most of the important applications". Curvature and the Einstein equation come last. — [Hartle 2006, arXiv gr-qc/0506075](https://arxiv.org/abs/gr-qc/0506075)
- Hartle on the mathematical gap: "Differential geometry… [is] not a part of the typical advanced calculus tool kit acquired by physics majors in their first few years. This is 'new math'." Introducing "manifolds, vectors, dual vectors, tensors, metric, covariant derivative, and curvature… does take time. It also must be practiced." — [Hartle 2006](https://arxiv.org/abs/gr-qc/0506075)

### Inferences

**Dependency map for the document.** Arrows mean "is needed for". Each node is grounded in the findings above.

```
Calc I/II: derivative, integral, Taylor series ──────────────┐
        │                                                     │
Calc III: partial derivative ∂/∂x^μ, multivariable chain rule,│
          Jacobian / change of variables, gradient            │
        │                                                     │
Linear algebra: vectors & bases, matrices, inverse,           │
          determinant, linear maps, dual vectors              │
        │                                                     │
Index notation: summation convention, δ^μ_ν, ε, free vs dummy │
          indices, upper vs lower indices                     │
        │                                                     │
Special relativity: η_μν, 4-vectors, Lorentz transformations  │
        │                                                     │
Metric tensor g_μν, line element ds², g^μν, det g, √−g        │
        │                                                     │
Christoffel symbols Γ^λ_μν  (first derivatives of g)          │
        │                         ┌──────────────────────────┘
Covariant derivative ∇_μ,         │ Calculus of variations / Euler–Lagrange
parallel transport, D/dτ          │ (Calc II + Calc III + ODEs)
        │          │              │        │
        │          └── Geodesic equation ◄─┘ (stationary proper time)
        │                                  │
Riemann tensor R^ρ_σμν ([∇_μ,∇_ν])        │ Action principle:
        │  └─ geodesic deviation           │ S = ∫ √−g (R − 2Λ) d⁴x
Ricci tensor R_μν → Ricci scalar R         │
        │                                  │
Bianchi identity → Einstein tensor G_μν, ∇^μ G_μν = 0
        │                                  │
Stress–energy T_μν, ∇_μ T^μν = 0 ── Newtonian limit fixes 8πG
        │                                  │
Einstein field equations  G_μν + Λ g_μν = 8πG T_μν  ◄──────┘
```

- ODEs sit beside the chain rather than in it. They are needed to *solve* geodesic equations (orbits, light bending). PDEs (the wave equation $\Box\bar h_{\mu\nu}=-16\pi T_{\mu\nu}$) are needed for linearized gravity and gravitational waves, which come after the field equations.

### Gaps
- I found no single authoritative published diagram that runs from "derivative" all the way to "Einstein equations". The map above is a synthesis of Carroll's derivation order, the Cambridge schedule, Moore's syllabus, Boas's chapter structure and Hartle's variational route.
- Collier's *A Most Incomprehensible Thing* is reported to be organized as exactly such a ladder (foundation mathematics, Newtonian mechanics, SR, manifold, tensors, GR, Schwarzschild, cosmology) per a library catalogue summary relayed by search. I could not open its table of contents directly.

---

## 3. What is the standard textbook ladder (publisher, year, edition, level and assumed prerequisites)?

### Takeaway
The ladder runs roughly as follows:
1. Special relativity: Taylor & Wheeler.
2. Gentle tensor/maths primers: Fleisch; Collier.
3. Physics-first or interleaved undergraduate GR: Taylor/Wheeler/Bertschinger, Hartle, Moore; and Susskind & Cabannes for the general reader.
4. Math-first undergraduate/first-graduate GR: Schutz, then Carroll; Zee as a discursive alternative.
5. Advanced: MTW, Wald.
6. Practice throughout: Lightman et al.; math support from Boas.

Carroll's own difficulty stars, normalized to his notes at [**], put Schutz and Taylor & Wheeler at [*], MTW and Lightman et al. at [**], and Wald at [***].

### Cited Findings

#### Book-by-book
1. **Taylor & Wheeler, *Spacetime Physics: Introduction to Special Relativity*, 2nd ed.**, W. H. Freeman, New York, 1992 (ISBN 0-7167-2327-1).
   - The whole book is now free under CC BY 4.0. It "has become a standard for modern physics and relativity courses, as well as introductory physics." — [eftaylor.com/spacetimephysics](https://www.eftaylor.com/spacetimephysics/)
   - Carroll rates it [*]: "A good introduction to special relativity." — [Carroll notes bibliography](https://arxiv.org/abs/gr-qc/9712019)
   - Cambridge recommends it for Part IA (first-year) Dynamics and Relativity. — [Cambridge Schedules](https://www.maths.cam.ac.uk/undergrad/files/schedules.pdf)
   - Level: first/second year, algebra and calculus.
2. **Taylor, Wheeler (& Bertschinger), *Exploring Black Holes: Introduction to General Relativity*.**
   - 1st ed.: Benjamin Cummings / Addison Wesley Longman, 2000, 352 pp. — [Open Library ISBN 9780201384239](https://openlibrary.org/isbn/9780201384239)
   - The 2nd edition (EBH2e, revised by Taylor and Edmund Bertschinger) has "no published hard copy… you may freely download the online version" (CC BY 4.0).
   - The first edition "used calculus and algebra, rather than tensors, to make general relativity accessible to second- and third-year students." — [eftaylor.com/exploringblackholes](https://www.eftaylor.com/exploringblackholes/)
3. **Daniel A. Fleisch, *A Student's Guide to Vectors and Tensors***, Cambridge University Press.
   - The copyright page gives first publication as 2012 (hardback 978-0-521-19369-6, paperback 978-0-521-17190-8). — [CUP copyright page](https://assets.cambridge.org/97805211/93696/copyright/9780521193696_copyright_info.pdf)
   - Open Library lists 2011, 197 pp. — [Open Library ISBN 9780521171908](https://openlibrary.org/isbn/9780521171908)
   - An Institute of Mathematics and its Applications review calls it highly readable with no formal prerequisites, though differential vector operators help for the application chapters. — [IMA review](https://ima.org.uk/?p=225)
   - Level: undergraduate; suitable during or just after Calculus III.
4. **Peter Collier, *A Most Incomprehensible Thing: Notes Towards a Very Gentle Introduction to the Mathematics of Relativity***, Incomprehensible Books (self-published).
   - Editions: 1st ed. 2012 (Kindle) / 2013 (paperback); 2nd ed. paperback June 30, 2014 (ISBN 9780957389458); 3rd ed. paperback March 26, 2017 (ISBN 9780957389465, 275 pp). — [Goodreads editions list](https://www.goodreads.com/work/editions/23855407-a-most-incomprehensible-thing-notes-towards-a-very-gentle-introduction); [Open Library ISBN 9780957389465](https://openlibrary.org/isbn/9780957389465)
   - Level: self-study, aimed at readers with modest mathematics; see Gaps.
5. **Thomas A. Moore, *A General Relativity Workbook***, University Science Books, 2013, 476 pp. — [Open Library ISBN 9781891389825](https://openlibrary.org/isbn/9781891389825)
   - Physics Today review (O. Sarbach, May 1, 2014): "The book assumes only a basic knowledge of calculus, classical mechanics, and electromagnetism." It has 39 chapters, each corresponding "to a 50-minute class section", and is "ideally suited for a one-semester, undergraduate-level introductory course". — [Physics Today review](https://physicstoday.aip.org/reviews/a-general-relativity-workbook)
   - Teaches tensors throughout (Moore's "third way"). — [Moore TGRU article](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
6. **James B. Hartle, *Gravity: An Introduction to Einstein's General Relativity***.
   - 1st printing Addison-Wesley, 2003, 582 pp. — [Open Library ISBN 9780805386622](https://openlibrary.org/isbn/9780805386622)
   - The Cambridge schedule cites it as 2002, and UNCW cites 2003.
   - Reissued by Cambridge University Press (hardback published 2 Sept 2021, 602 pp). — [CUP page](https://www.cambridge.org/highereducation/isbn/9781009042604)
   - CUP: it "helped to bring general relativity into the undergraduate curriculum, making it accessible to virtually all physics majors"; "One of the pioneers of the 'physics-first' approach"; usable "from junior level to introductory graduate level"; "accessible to physics students with typical calculus knowledge." — [CUP page](https://www.cambridge.org/highereducation/isbn/9781009042604)
   - Hartle's paper states that intermediate mechanics is the one essential physics prerequisite. — [Hartle 2006](https://arxiv.org/abs/gr-qc/0506075)
7. **Bernard F. Schutz, *A First Course in General Relativity***, Cambridge University Press.
   - 1st ed. 1985 (cited in Carroll's bibliography); 2nd ed. 2009, 393 pp. — [Open Library ISBN 9780521887052](https://openlibrary.org/isbn/9780521887052)
   - 3rd ed.: hardback 25 Aug 2022, 512 pp. "the first step into general relativity for advanced undergraduates with a minimal background in mathematics", with "a typical background in mathematics". — [CUP page, 3rd ed.](https://www.cambridge.org/highereducation/isbn/9781108610865)
   - Carroll rates it [*]: "a very nice introductory text. Especially useful if… you aren't quite clear on what the energy-momentum tensor really means." — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
   - Moore classes it as a "first generation… 'math first'" undergraduate text. — [Moore TGRU article](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
8. **Sean M. Carroll, *Spacetime and Geometry: An Introduction to General Relativity***.
   - 1st ed. Addison Wesley, 2004, 513 pp. — [Open Library ISBN 9780805387322](https://openlibrary.org/isbn/9780805387322)
   - Reissued by Cambridge University Press in 2019 (ISBN 9781108488396; DOI 10.1017/9781108770385). — [CUP copyright page](https://assets.cambridge.org/97811084/88396/copyright/9781108488396_copyright_info.pdf); [MIT 8.962 syllabus (lists CUP 2019)](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus/); [author's book page](https://www.preposterousuniverse.com/spacetimeandgeometry/)
   - Level: first-year graduate (MIT 8.962's required text), also used in Cambridge Part II. Tong calls it "A straightforward and clear introduction to the subject." — [Tong GR notes](https://davidtong.org/teaching/general-relativity/)
   - The free precursor is Carroll's 1997 *Lecture Notes on General Relativity* (238 pp), "approximately one semester's worth of lectures on introductory general relativity for beginning graduate students in physics". It is "a lightly edited version of notes I handed out while teaching Physics 8.962… Spring of 1996". — [arXiv gr-qc/9712019](https://arxiv.org/abs/gr-qc/9712019)
9. **A. Zee, *Einstein Gravity in a Nutshell***, Princeton University Press, May 5, 2013, 888 pp (ISBN 9780691145587).
   - "accessible to anyone familiar with classical mechanics and electromagnetism"; "The ideal textbook for undergraduate and graduate students". — [PUP page](https://press.princeton.edu/books/hardcover/9780691145587/einstein-gravity-in-a-nutshell)
   - Tong: "Professor Zee likes a bit of a chat… entertaining, but not particularly concise". — [Tong GR notes PDF](https://davidtong.org/pdfs/teaching/general-relativity/gr.pdf)
10. **Misner, Thorne & Wheeler, *Gravitation***.
    - W. H. Freeman, 1973, 1279 pp. — [Open Library ISBN 9780716703440](https://openlibrary.org/isbn/9780716703440)
    - Reissued by Princeton UP Oct 24, 2017 (1,336 pp, ISBN 9780691177793), with a new preface by David Kaiser and an introduction by Misner and Thorne. PUP calls it "a landmark graduate-level textbook". Track 1 "formulates an appropriate one-semester graduate-level course" and Track 2 offers advanced topics, "with Track 1 sections serving as prerequisites." — [PUP page](https://press.princeton.edu/books/hardcover/9780691177793/gravitation)
    - Carroll [**]: "A heavy book, in various senses." — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
11. **Robert M. Wald, *General Relativity***, University of Chicago Press, 1984 (ISBN 9780226870335).
    - The table of contents includes "2.4 The Abstract Index Notation". — [UChicago Press page](https://press.uchicago.edu/ucp/books/book/chicago/G/bo5952261.html)
    - Carroll [***]: "more mathematically demanding than the previous books, and the basics are covered pretty quickly." — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
    - Tong: "The go-to relativity book for relativists." — [Tong notes](https://davidtong.org/pdfs/teaching/general-relativity/gr.pdf)
12. **Lightman, Press, Price & Teukolsky, *Problem Book in Relativity and Gravitation***.
    - Princeton UP, Dec 1975, 616 pp. — [Open Library ISBN 9780691081625](https://openlibrary.org/isbn/9780691081625)
    - Reissued Sept 26, 2017 (paperback ISBN 9780691177786, 616 pp): "some 475 problems—with solutions", "arranged by subject and graded by difficulty" (Wheeler blurb). — [PUP page](https://press.princeton.edu/books/paperback/9780691177786/problem-book-in-relativity-and-gravitation)
    - Carroll [**]: "fully worked solutions". — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
13. **Mary L. Boas, *Mathematical Methods in the Physical Sciences*, 3rd ed.**, Wiley.
    - July 2005 hardcover, 864 pp (ISBN 978-0-471-19826-0), "intended for students who have had a two-semester or three-semester introductory calculus course". — [Wiley page](https://www.wiley.com/en-us/Mathematical+Methods+in+the+Physical+Sciences%2C+3rd+Edition-p-9780471198260)
    - Covers chain rule/Jacobians, linear algebra, calculus of variations (Ch. 9) and tensor analysis (Ch. 10). — [Boas TOC (CERN)](https://catalogue.library.cern/api/files/6a4048af-55df-435a-b604-b40f796b11c9/1.%20Table%20of%20contents.pdf)
14. **Leonard Susskind & André Cabannes, *General Relativity: The Theoretical Minimum***, Basic Books, Jan 10, 2023, 400 pp (ISBN 9781541601772).
    - It starts from "the equivalence principle and covering the necessary mathematics of Riemannian spaces and tensor calculus". Physics Today: "an excellent volume for readers who know physics but aren't familiar with GR." It is the fourth volume of the Theoretical Minimum series (after classical mechanics, quantum mechanics, and special relativity & classical field theory). — [Hachette/Basic Books page](https://www.hachettebookgroup.com/titles/leonard-susskind/general-relativity/9781541601772); [Publishers Weekly](https://www.publishersweekly.com/9781541601772)
    - It grew from Susskind's Stanford continuing-studies lectures. — [Theoretical Minimum GR course page](https://theoreticalminimum.com/courses/general-relativity/2012/fall)

#### Carroll's difficulty rating key (useful for the document's ratings)
- "The typical level of difficulty (especially mathematical) of the books is indicated by a number of asterisks, one meaning mostly introductory and three being advanced. The asterisks are normalized to these lecture notes, which would be given [**]." Ratings: Schutz [*], Taylor & Wheeler [*], Weinberg [**], MTW [**], d'Inverno [**], Lightman et al. [**], Wald [***], Straumann [***], Hawking & Ellis [***]. — [Carroll notes bibliography](https://arxiv.org/abs/gr-qc/9712019)

### Inferences

**Suggested ladder for this reader, with prerequisites inferred from the publisher statements above.**

| Rung | Book | Approx. level | Math the reader should have first |
|---|---|---|---|
| 1 | Taylor & Wheeler, *Spacetime Physics* (free) | 1st–2nd year | algebra, Calc I |
| 2 | Fleisch, *Student's Guide to Vectors and Tensors* | 2nd year | Calc III in progress |
| 2 | Collier, *A Most Incomprehensible Thing* | self-study bridge | Calc I–II (unverified, see Gaps) |
| 3 | Taylor/Wheeler/Bertschinger, *Exploring Black Holes* (free) | 2nd–3rd year | calculus only, no tensors |
| 3 | Susskind & Cabannes | general reader with some physics | calculus; the book teaches the tensor calculus it uses |
| 4 | Hartle, *Gravity* | junior/senior | Calc III + intermediate mechanics |
| 4 | Moore, *Workbook* | junior/senior | calculus, mechanics, E&M (per PT review) |
| 5 | Schutz, *First Course* | advanced undergraduate | Calc III + linear algebra |
| 6 | Carroll, *Spacetime and Geometry* / notes | first-year graduate | above + Lagrangians, E&M (MIT 8.962 prerequisites) |
| 6 | Zee, *Nutshell* | undergraduate–graduate | classical mechanics + E&M |
| 7 | MTW, *Gravitation* | graduate | Track 1 needs the above |
| 8 | Wald, *General Relativity* | advanced graduate | comfort with abstract math (manifolds) |
| always | Lightman et al. *Problem Book*; Boas | support | — |

**Compact bibliography for the back matter (core texts and free resources).**
- Taylor, E. F. & Wheeler, J. A. (1992). *Spacetime Physics*, 2nd ed. W. H. Freeman. Free: https://www.eftaylor.com/spacetimephysics/
- Taylor, E. F., Wheeler, J. A. & Bertschinger, E. *Exploring Black Holes*, 2nd ed. (online). Free: https://www.eftaylor.com/exploringblackholes/
- Fleisch, D. A. (2012). *A Student's Guide to Vectors and Tensors*. Cambridge UP.
- Hartle, J. B. (2003; reissued CUP 2021). *Gravity: An Introduction to Einstein's General Relativity*. Addison-Wesley / Cambridge UP.
- Moore, T. A. (2013). *A General Relativity Workbook*. University Science Books.
- Schutz, B. F. (2022). *A First Course in General Relativity*, 3rd ed. Cambridge UP.
- Carroll, S. M. (2004; reissued CUP 2019). *Spacetime and Geometry*. Addison-Wesley / Cambridge UP. Free notes: Carroll (1997), arXiv:gr-qc/9712019.
- Misner, C. W., Thorne, K. S. & Wheeler, J. A. (1973; reissued 2017). *Gravitation*. W. H. Freeman / Princeton UP.
- Wald, R. M. (1984). *General Relativity*. University of Chicago Press.
- Lightman, A. P., Press, W. H., Price, R. H. & Teukolsky, S. A. (1975; reissued 2017). *Problem Book in Relativity and Gravitation*. Princeton UP.
- Boas, M. L. (2005). *Mathematical Methods in the Physical Sciences*, 3rd ed. Wiley.
- Hartle, J. B. (2006). "General relativity in the undergraduate physics curriculum." *Am. J. Phys.* 74, 14–21. doi:10.1119/1.2110581.

### Gaps
- **Collier:** I could not find a publisher or author statement of the mathematics Collier assumes. The publisher site (incomprehensiblebooks.com) did not resolve from this environment, and the Amazon and Goodreads pages fetched had no description. Treat "accessible with Calc I–II" as unverified.
- **Moore:** the publisher (University Science Books) page and Moore's Pomona workbook page (pages.pomona.edu/~tmoore/grw/) could not be reached from here. Prerequisites come from the Physics Today review instead.
- **Edition-date discrepancies:**
  - Hartle: Cambridge schedule says 2002; Open Library and UNCW say 2003.
  - Fleisch: 2011 vs 2012.
  - Carroll CUP reissue: 2019 (MIT, CUP copyright page) vs 2020 (Open Library).
  - Hartle CUP reissue: CUP page says 2 Sept 2021; one retailer says 24 June 2021.
- **Not verified:** a Susskind & Cabannes paperback dated 2025 (ISBN 9781541601789) appeared only in search results, and I did not open that listing.

---

## 4. Which free lecture notes and video courses are reputable, and do their URLs resolve?

### Takeaway
All requested free resources exist, and their URLs were verified in October 2026. The notes are Carroll's arXiv notes, Tong's Cambridge Part III notes, Blau's 1000+-page notes and Taylor's free books. The videos are Hughes's MIT 8.962 (23 lectures on OCW), Susskind's Stanford GR (10 lectures), Schuller's two series, eigenchris's tensor series and Flournoy's Mines GR courses. They range from "first-semester tensor primer" (eigenchris) to "mathematically rigorous graduate" (Schuller, Blau, Tong).

### Cited Findings

#### Lecture notes (all resolved, HTTP 200)
- **Carroll, *Lecture Notes on General Relativity*** (Dec 1997, 238 pp): "approximately one semester's worth of lectures on introductory general relativity for beginning graduate students… manifolds, Riemannian geometry, Einstein's equations, and three applications: gravitational radiation, black holes, and cosmology." — [arXiv:gr-qc/9712019](https://arxiv.org/abs/gr-qc/9712019). Author's notes page: [preposterousuniverse.com/grnotes](https://preposterousuniverse.com/grnotes/). This page resolved but blocked automated text extraction.
- **David Tong, *General Relativity*** (Cambridge Part III, Michaelmas 2019): "given to Part III (i.e. masters level) students. It covers advanced material, but is designed to be understandable for students who haven't had a first course in the subject." Chapters: Geodesics; Introducing Differential Geometry; Introducing Riemannian Geometry; The Einstein Equations; When Gravity is Weak; Black Holes. Signature is $(-,+,+,+)$. Also available in HTML. — [davidtong.org/teaching/general-relativity](https://davidtong.org/teaching/general-relativity/); [PDF](https://davidtong.org/pdfs/teaching/general-relativity/gr.pdf). The old DAMTP URL (damtp.cam.ac.uk/user/tong/gr.html) now redirects to davidtong.org.
- **Matthias Blau, *Lecture Notes on General Relativity*** (University of Bern): "Size ca 8 MB, 1000+ Pages. Latest Update: July 2025", with updates to Lie derivatives, action principles and boundary terms, and Kaluza–Klein. — [blau.itp.unibe.ch/GRLecturenotes.html](http://blau.itp.unibe.ch/GRLecturenotes.html); [PDF](http://blau.itp.unibe.ch/newlecturesGR.pdf). Note: the `https://www.` form of the PDF URL failed; the `http://blau.itp.unibe.ch/...` form works. Baez lists Blau under "for when you get really serious". — [Baez](https://math.ucr.edu/home/baez/books.html)
- **Taylor & Wheeler, *Spacetime Physics*** and **Taylor/Wheeler/Bertschinger, *Exploring Black Holes*** (2nd ed.), both free under CC BY 4.0. — [Spacetime Physics](https://www.eftaylor.com/spacetimephysics/); [Exploring Black Holes](https://www.eftaylor.com/exploringblackholes/)

#### Video courses (playlist titles, owners and counts verified from YouTube page metadata)
- **MIT OCW 8.962 General Relativity, Spring 2020, Prof. Scott Hughes:** 23 lecture videos, from "Lecture 1: Introduction and The Geometric Viewpoint on Physics", "Lecture 3: Tensors Continued", "Lecture 5: The Stress Energy Tensor and the Christoffel Symbol", "Lecture 9: Geodesics", "Lecture 10: Spacetime Curvature" and "Lecture 12: The Einstein Field Equation" through "Lecture 23: Black Holes II". — [OCW 8.962 lecture videos](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/video_galleries/lecture-videos/)
- **Leonard Susskind, Stanford "General Relativity" (The Theoretical Minimum, Fall 2012):** YouTube playlist "Lecture Collection | General Relativity", owner Stanford, 10 videos. Lecture 1 is "The equivalence principle and tensor analysis" and lecture 2 "Tensor mathematics". "This course uses the physics of black holes extensively to develop and illustrate the concepts". — [Theoretical Minimum course page](https://theoreticalminimum.com/courses/general-relativity/2012/fall); [YouTube playlist](https://www.youtube.com/playlist?list=PLpGHT1n4-mAvcXwzOIz3dHnGZaQP1LEib). Susskind also recorded an earlier GR course in 2008–09, reported by [Open Culture](https://www.openculture.com/2009/01/einsteins_general_theory_of_relativity_a_new_stanford_course.html).
- **Frederic Schuller:**
  - "Lectures on Geometrical Anatomy of Theoretical Physics": owner Frederic Schuller, 28 videos. — [YouTube playlist](https://www.youtube.com/playlist?list=PLPH7f_7ZlzxTi6kS4vCmv4ZKm9u8g5yic)
  - The GR-specific companion is the **WE-Heraeus International Winter School on Gravity and Light (2015) "Central Lecture Course"**: owner "The WE-Heraeus International Winter School on Gravity and Light", 28 videos. — [YouTube playlist](https://www.youtube.com/playlist?list=PLFeEvEPtX_0S6vxxiiNPrJbLu9aK1UVC_)
- **eigenchris:** "Tensors for Beginners", 18 videos — [playlist](https://www.youtube.com/playlist?list=PLJHszsWbB6hrkmmq57lX8BV-o-YIOFsiG); "Tensor Calculus", 29 videos — [playlist](https://www.youtube.com/playlist?list=PLJHszsWbB6hpk5h8lSfBkVrpjsqvUGTCx). Channel: [youtube.com/@eigenchris](https://www.youtube.com/@eigenchris)
- **Alex Flournoy (Colorado School of Mines):** the channel description says the lectures "are from Particle Physics, General Relativity, and Mathematical Methods in Physics courses taught to undergraduate and graduate students at the Colorado School of Mines". It points to the GR course site http://inside.mines.edu/~aflourno/GR/418.shtml. — [Channel @AlexFlournoyTeacher](https://www.youtube.com/@AlexFlournoyTeacher)
  - Playlists owned by Flournoy: "General Relativity 2021" (28 videos; first is "General Relativity Lecture 1: Introduction to the Course") — [playlist](https://www.youtube.com/playlist?list=PLDlWMHnDwyljkfy3EBSMlM5D5KQiUSpsB); "General Relativity 2019" (28) — [playlist](https://www.youtube.com/playlist?list=PLDlWMHnDwyliMevB36wgRbjXhJkoN_RUQ); "General Relativity 2017" (30) — [playlist](https://www.youtube.com/playlist?list=PLDlWMHnDwyliqBCB4JaugtpCZXR9-k7s0)

#### Other reputable starting points
- Cambridge's Part III preparation page links exercise sheets on special relativity, Euler–Lagrange equations and index notation, plus Gibbons's 2004 Part II notes. — [Cambridge Part III prep](https://www.maths.cam.ac.uk/postgrad/part-iii/node/63)
- The AAPT "Teaching General Relativity to Undergraduates" workshop (Syracuse, July 20–21, 2006) archive hosts talks by Hartle, Moore, Vokos and others. — [AAPT TGRU](https://www.aapt.org/doorway/TGRU/index.htm)

### Inferences
- **Suggested order for a self-studier:**
  1. eigenchris "Tensors for Beginners" (linear-algebra-level tensors), alongside Fleisch.
  2. Susskind's Stanford GR or Flournoy's undergraduate-graduate course.
  3. Hughes's MIT 8.962 (graduate, paired with Carroll).
  4. Schuller (Gravity and Light) or Tong/Blau for the rigorous differential-geometry view.
- Carroll's 1997 notes are the best free match to the MIT 8.962 videos: they began as the 8.962 handouts and the book they grew into is 8.962's required text.

### Gaps
- Flournoy's course website (inside.mines.edu/~aflourno/GR/418.shtml) did not respond from this environment, and the Mines physics faculty pages returned HTTP 403, so the affiliation rests on his channel's own description.
- Playlist video counts were read from YouTube metadata on 26 Oct 2026 and can change.
- I did not verify the stated prerequisites of the eigenchris or Schuller series; neither publishes a formal prerequisite list that I found.

---

## 5. Notation reference: standard meanings, where conventions differ, and geometric units

### Takeaway
With signature $(-,+,+,+)$ and MTW sign conventions, the conventions used by Carroll, Tong and MTW are all the same: $\eta=\mathrm{diag}(-1,1,1,1)$, $R^\rho{}_{\sigma\mu\nu}=\partial_\mu\Gamma^\rho_{\nu\sigma}-\cdots$, $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$, $G_{\mu\nu}=+8\pi G T_{\mu\nu}$. MTW's classification calls this "$(+,+,+)$". Other books flip one or more of these three signs, so the reader must check every book's convention page.

In geometric units ($G=c=1$):
- $1\,M_\odot = 1.4766$ km $= 4.9255\ \mu$s using the IAU nominal $GM_\odot$;
- 1 m of mass $=1.3466\times10^{27}$ kg.

The brief's "4.926 μs" is reproduced only if $M_\odot\approx1.988\text{–}1.989\times10^{30}$ kg is multiplied by $G$. The more precise figure, from the IAU nominal $GM_\odot$, is 4.9255 μs, which rounds to 4.925 μs (or 4.93 μs to three figures).

### Cited Findings

#### Index and derivative notation
- **Coordinates and index alphabets:**
  - Greek indices run 0–3 with 0 the time coordinate, $x^0=ct$; Latin indices $i,j$ run over space, 1–3. Carroll: "Don't start thinking of the superscripts as exponents." Units with $c=1$ are adopted immediately. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
  - Tong is the same: "spacetime indices are greek $\mu,\nu=0,1,2,3$, spatial indices are roman $i,j=1,2,3$." — [Tong notes PDF](https://davidtong.org/pdfs/teaching/general-relativity/gr.pdf)
  - **Exception:** in Carroll's tetrad (orthonormal-frame) formalism, Latin $a,b$ label orthonormal-basis indices: "the Greek indices are sometimes referred to as 'curved' and the Latin ones as 'flat.'" — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
  - In Wald's abstract index notation, Latin letters $a,b,c$ are slot labels, not numbers (see below).
- **Partial derivative and comma notation:** $\partial_\mu\equiv\partial/\partial x^\mu$; "when it is in the denominator of a derivative it implies a lower index". Comma notation $\phi_{,\mu}\equiv\partial_\mu\phi$; Carroll: "I'm not a big fan of the comma notation, but we will use $\partial_\mu$ all the time." — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- **Covariant derivative and semicolon notation:** "just as commas are used for partial derivatives, semicolons are used for covariant ones": $\nabla_\sigma T^{\mu_1\cdots}{}_{\nu_1\cdots}\equiv T^{\mu_1\cdots}{}_{\nu_1\cdots;\sigma}$ (eq. 3.14). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- **Derivative along a curve, $D/d\lambda$ or $D/d\tau$:** the geodesic condition is $\frac{D}{d\lambda}\frac{dx^\mu}{d\lambda}=0$ (eq. 3.46), the directional covariant derivative along the tangent $dx^\mu/d\lambda$. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- **Dot notation:** Hartle writes the proper-time variational principle with "a dot denot[ing] a derivative with respect to λ", e.g. $\dot t, \dot r, \dot\phi$; when $\lambda=\tau$, $\dot x^\alpha=dx^\alpha/d\tau=u^\alpha$. — [Hartle 2006](https://arxiv.org/abs/gr-qc/0506075)
- **Kronecker delta:** $\delta^\mu_\nu$ is "the traditional Kronecker delta symbol in four dimensions"; $g^{\mu\nu}g_{\nu\sigma}=\delta^\mu_\sigma$. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019). Moore lists believing "$\delta^\mu_\mu=1$, not 4" as a standard student error. — [Moore TGRU article](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)

#### Metric objects
- **Minkowski metric** $\eta_{\mu\nu}=\mathrm{diag}(-1,+1,+1,+1)$ (eq. 1.8); **general metric** $g_{\mu\nu}$ ("$\eta_{\mu\nu}$ is reserved specifically for the Minkowski metric"); inverse $g^{\mu\nu}$; determinant $g=|g_{\mu\nu}|$. For Lorentzian metrics $g<0$, hence the factors $\sqrt{-g}=\sqrt{|g|}$ (eqs. 2.28, 2.41–2.42). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- **Levi-Civita symbol vs tensor:** the symbol $\tilde\epsilon_{\mu\nu\rho\sigma}$ is $+1$ for even permutations of 0123, $-1$ for odd and $0$ otherwise (eq. 2.38). It is a tensor density. The tensor is $\epsilon_{\mu\nu\rho\sigma}=\sqrt{|g|}\,\tilde\epsilon_{\mu\nu\rho\sigma}$ (eq. 2.42), and with upper indices $\epsilon^{\mu\nu\rho\sigma}=\frac{\mathrm{sgn}(g)}{\sqrt{|g|}}\tilde\epsilon^{\mu\nu\rho\sigma}$ (eq. 2.43). In Lorentzian signature, $\mathrm{sgn}(g)=-1$. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- **Symmetrization and antisymmetrization:** $T_{(\mu_1\cdots\mu_n)}=\frac{1}{n!}(\text{sum over permutations})$ and $T_{[\mu_1\cdots\mu_n]}=\frac{1}{n!}(\text{alternating sum})$ (eqs. 1.67–1.69). For two indices, $T_{(\mu\nu)}=\tfrac12(T_{\mu\nu}+T_{\nu\mu})$ and $T_{[\mu\nu]}=\tfrac12(T_{\mu\nu}-T_{\nu\mu})$. "Vertical bars" exclude indices: $T_{(\mu|\nu|\rho)}=\tfrac12(T_{\mu\nu\rho}+T_{\rho\nu\mu})$. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)

#### Curvature objects and the field equations
- **Christoffel symbols** $\Gamma^\lambda_{\mu\nu}$ (eq. 3.21). Carroll avoids the older brace notation: "we won't use the funny notation". — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- **Riemann** $R^\rho{}_{\sigma\mu\nu}$ (eq. 3.67), **Ricci** $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$ (eq. 3.90), **Ricci scalar** $R=g^{\mu\nu}R_{\mu\nu}$ (eq. 3.92), **Einstein tensor** $G_{\mu\nu}=R_{\mu\nu}-\tfrac12 Rg_{\mu\nu}$, **field equations** $G_{\mu\nu}=8\pi G T_{\mu\nu}$ (eq. 4.52). With the cosmological constant from the action $\int\sqrt{-g}(R-2\Lambda)$: $G_{\mu\nu}+\Lambda g_{\mu\nu}=8\pi G T_{\mu\nu}$ (eqs. 4.73–4.74). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- In SI units Hartle writes $R_{\alpha\beta}-\tfrac12 g_{\alpha\beta}R=\frac{8\pi G}{c^4}T_{\alpha\beta}$, "10 non-linear, partial differential equations for the metric". — [Hartle 2006](https://arxiv.org/abs/gr-qc/0506075)
- **d'Alembertian:** $\Box=\nabla^\mu\nabla_\mu$, "the covariant D'Alembertian" (eq. 4.84). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)

#### Abstract index notation (Wald)
- Wald's §2.4 is "The Abstract Index Notation". — [UChicago Press TOC](https://press.uchicago.edu/ucp/books/book/chicago/G/bo5952261.html)
- Cross-check: abstract indices "are mere placeholders, not related to any basis and, in particular, are non-numerical"; e.g. $h=h_{ab}$ labels the two slots of a bilinear form. The notation was introduced by Penrose (Penrose & Rindler, *Spinors and Space-Time* vol. 1, 1984). — [Wikipedia, Abstract index notation (cross-check only)](https://en.wikipedia.org/wiki/Abstract_index_notation)

#### Where conventions vary (MTW's three-sign classification)
MTW sort conventions by three signs, [S1], [S2] and [S3], defined by:

$$g_{\mu\nu}=[S1]\,\mathrm{diag}(-1,+1,+1,+1)$$
$$R^\mu{}_{\alpha\beta\gamma}=[S2]\left(\Gamma^\mu_{\alpha\gamma,\beta}-\Gamma^\mu_{\alpha\beta,\gamma}+\Gamma^\mu_{\sigma\beta}\Gamma^\sigma_{\gamma\alpha}-\Gamma^\mu_{\sigma\gamma}\Gamma^\sigma_{\beta\alpha}\right)$$
$$G_{\mu\nu}=[S3]\,\kappa T_{\mu\nu},\qquad R_{\mu\nu}=[S2][S3]\,R^\alpha{}_{\mu\alpha\nu}$$

- Classifications: MTW are $(+,+,+)$; Weinberg (1972) $(+,-,-)$; Peebles (1980) $(-,+,+)$; Rindler (2006) and Peacock (1999) $(-,+,-)$.
- Some authors, including Einstein, used a Ricci sign that makes the right-hand side $-\kappa T_{\mu\nu}$, and the cosmological-term sign also flips under the $(+,-,-,-)$ signature.
- MTW's own table is in the book (cited by Wikipedia as MTW 1973, p. 501ff and endpapers). — [Wikipedia, Einstein field equations §Sign convention (cross-check)](https://en.wikipedia.org/wiki/Einstein_field_equations#Sign_convention)
- Signature camps: $(-,+,+,+)$ ("East coast", "mostly plus") is used by MTW, Carroll and Wald (Wald switches for Chapter 13 only); $(+,-,-,-)$ ("West coast", "mostly minus") by Landau & Lifshitz, d'Inverno and Hobson–Efstathiou–Lasenby, among others. — [Wikipedia, Sign convention (cross-check)](https://en.wikipedia.org/wiki/Sign_convention)
- Carroll's notes confirm $(-,+,+,+)$, the MTW-sign Riemann (eq. 3.67), $R_{\mu\nu}=R^\lambda{}_{\mu\lambda\nu}$ and $+8\pi G$, i.e. MTW $(+,+,+)$. — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Tong uses $(-,+,+,+)$ and explains: "When thinking about geometry, the choice $(-+++)$ is preferable as it ensures that spatial distances are positive; when thinking about quantum physics, the choice $(+---)$ is preferable as it ensures that frequencies and energies are positive… Ultimately you just need to get used to both conventions." His own SR and QFT notes use the opposite signature. — [Tong notes PDF](https://davidtong.org/pdfs/teaching/general-relativity/gr.pdf)
- Index placement on Lorentz-transformation matrices also varies: "Schutz uses a different convention, always arranging the two indices northwest/southeast". — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)

#### Constants used for geometric units
- $G=6.674\,30(15)\times10^{-11}\ \mathrm{m^3\,kg^{-1}\,s^{-2}}$ (relative standard uncertainty $2.2\times10^{-5}$). — [NIST CODATA, G](https://physics.nist.gov/cgi-bin/cuu/Value?bg)
- $c=299\,792\,458\ \mathrm{m\,s^{-1}}$ (exact). — [NIST CODATA, c](https://physics.nist.gov/cgi-bin/cuu/Value?c)
- IAU 2015 Resolution B3 nominal solar mass parameter $(GM)^{\rm N}_\odot=1.327\,124\,4\times10^{20}\ \mathrm{m^3\,s^{-2}}$; nominal terrestrial $(GM)^{\rm N}_{\rm E}=3.986\,004\times10^{14}\ \mathrm{m^3\,s^{-2}}$. — [Prša et al. 2016, IAU 2015 Resolution B3, arXiv:1605.09788](https://arxiv.org/abs/1605.09788)

#### Geometric-unit conversion table (computed in Python 3 from the constants above; this session)

| Quantity | Conversion ($G=c=1$) | Value |
|---|---|---|
| time ↔ length | $1\ \mathrm{s}=c\times1\ \mathrm{s}$ | $1\ \mathrm{s}=2.99792458\times10^{8}$ m; $1\ \mathrm{m}=3.33564\ \mathrm{ns}$; $1\ \mathrm{km}=3.33564\ \mu\mathrm{s}$ |
| mass → length | $M\to GM/c^2$ | $1\ \mathrm{kg}=7.42616\times10^{-28}$ m; **1 m of mass $=c^2/G=1.346591\times10^{27}$ kg** ($=6.7722\times10^{-4}\,M_\odot$) |
| mass → time | $M\to GM/c^3$ | 1 s of mass $=c^3/G=4.036978\times10^{35}$ kg ($\approx2.0303\times10^{5}\,M_\odot$) |
| Sun (IAU $GM_\odot$) | $GM_\odot/c^2$, $GM_\odot/c^3$ | **1 $M_\odot$ = 1476.625 m ≈ 1.477 km = 4.92549 μs**; Schwarzschild radius $2GM_\odot/c^2=2.95325$ km |
| Sun via $G\times M$ | with $M_\odot=1.98847\times10^{30}$ kg | 1476.670 m; 4.92564 μs (rounds to 4.926 μs) |
| implied $M_\odot$ | $(GM)^{\rm N}_\odot/G$ | $1.988410\times10^{30}$ kg |
| Earth (IAU $GM_{\rm E}$) | $GM_{\rm E}/c^2$ | 4.435 mm (Schwarzschild radius ≈ 8.870 mm) |
| energy → length | $E\to GE/c^4$ | $1\ \mathrm{J}=8.262718\times10^{-45}$ m; 1 m of energy $=c^4/G=1.210256\times10^{44}$ J |
| mass density → curvature | $\rho\to G\rho/c^2$ | $1\ \mathrm{kg\,m^{-3}}=7.42616\times10^{-28}\ \mathrm{m^{-2}}$ |
| pressure / energy density → curvature | $p\to Gp/c^4$ | $1\ \mathrm{Pa}=8.262718\times10^{-45}\ \mathrm{m^{-2}}$ |
| field-equation coupling (SI) | $8\pi G/c^4$ | $2.07665\times10^{-43}\ \mathrm{m\,J^{-1}}$ (i.e. $\mathrm{s^2\,kg^{-1}\,m^{-1}}$) |

### Inferences

**Notation reference table for the document**, in signature $(-,+,+,+)$ with MTW conventions. Entries restate the cited definitions; formulas such as $\Box$ in flat space follow directly from them.

| Symbol | Name / meaning |
|---|---|
| $x^\mu$, $\mu=0..3$ | spacetime coordinates; $x^0=ct$ ($=t$ when $c=1$); $x^i$, $i=1..3$, spatial |
| $\partial_\mu\equiv\partial/\partial x^\mu$; $A_{,\mu}$ | partial derivative; comma form |
| $\nabla_\mu$; $A_{;\mu}$ | covariant derivative; semicolon form. $\nabla_\mu V^\nu=\partial_\mu V^\nu+\Gamma^\nu_{\mu\lambda}V^\lambda$, $\nabla_\mu\omega_\nu=\partial_\mu\omega_\nu-\Gamma^\lambda_{\mu\nu}\omega_\lambda$ |
| $D/d\tau$ | covariant derivative along a curve: $\frac{DV^\mu}{d\tau}=\frac{dV^\mu}{d\tau}+\Gamma^\mu_{\nu\lambda}\frac{dx^\nu}{d\tau}V^\lambda=u^\nu\nabla_\nu V^\mu$ |
| $\dot x^\mu$ | $dx^\mu/d\lambda$ (or $d/d\tau$); in Newtonian contexts $d/dt$ |
| $\delta^\mu_\nu$ | Kronecker delta; $\delta^\mu_\mu=4$ |
| $\eta_{\mu\nu}$ | Minkowski metric $\mathrm{diag}(-1,1,1,1)$ |
| $g_{\mu\nu}$, $g^{\mu\nu}$ | metric, inverse metric; $g^{\mu\lambda}g_{\lambda\nu}=\delta^\mu_\nu$; raise/lower: $V_\mu=g_{\mu\nu}V^\nu$ |
| $g$, $\sqrt{-g}$ | $\det g_{\mu\nu}$ ($<0$); invariant volume element $\sqrt{-g}\,d^4x$ |
| $\Gamma^\lambda_{\mu\nu}$ | Christoffel symbols (Levi-Civita connection), symmetric in $\mu\nu$ |
| $R^\rho{}_{\sigma\mu\nu}$ | Riemann tensor, $[\nabla_\mu,\nabla_\nu]V^\rho=R^\rho{}_{\sigma\mu\nu}V^\sigma$ |
| $R_{\mu\nu}$, $R$ | Ricci tensor $R^\lambda{}_{\mu\lambda\nu}$; Ricci scalar $g^{\mu\nu}R_{\mu\nu}$ |
| $G_{\mu\nu}$ | Einstein tensor $R_{\mu\nu}-\frac12Rg_{\mu\nu}$; $\nabla^\mu G_{\mu\nu}=0$ |
| $T_{\mu\nu}$ | stress–energy tensor (perfect fluid $T^{\mu\nu}=(\rho+p)u^\mu u^\nu+pg^{\mu\nu}$; $T^\mu{}_\nu=\mathrm{diag}(-\rho,p,p,p)$ in the rest frame, as in Carroll) |
| $\Lambda$ | cosmological constant: $G_{\mu\nu}+\Lambda g_{\mu\nu}=8\pi GT_{\mu\nu}$ ($=8\pi T_{\mu\nu}$ with $G=c=1$) |
| $\Box$ | d'Alembertian $\nabla^\mu\nabla_\mu$; flat space: $-\partial_t^2+\nabla^2$ |
| $T_{(\mu\nu)}$, $T_{[\mu\nu]}$ | symmetric / antisymmetric parts, with factor $1/n!$ |
| $\tilde\epsilon_{\mu\nu\rho\sigma}$ vs $\epsilon_{\mu\nu\rho\sigma}$ | Levi-Civita symbol ($\pm1,0$) vs tensor $\sqrt{-g}\,\tilde\epsilon$ |
| $T_{ab}$ (Wald) vs $T_{\mu\nu}$ | abstract slot labels (basis-free) vs numerical components |

- **"Check the conventions page" checklist for any new book:**
  1. signature, $\pm$ diag;
  2. Riemann sign/index order;
  3. which index pair Ricci contracts;
  4. sign of $8\pi G$ and of $\Lambda$;
  5. whether $c$ and $G$ are set to 1;
  6. Greek vs Latin index alphabets;
  7. placement of indices on Lorentz matrices;
  8. sign of $\epsilon_{0123}$.
- **Rounding:** the figures 1.477 km and $1.347\times10^{27}$ kg/m are correct to the stated precision. The solar-mass time should be printed as 4.925 μs (or 4.93 μs). "4.926 μs" corresponds to using $M_\odot\approx1.988\text{–}1.989\times10^{30}$ kg with CODATA $G$ instead of the IAU $GM_\odot$. Because $GM_\odot$ is known far more precisely than $G$, astronomers convert with $GM_\odot$ directly.

### Gaps
- I could not open MTW's own sign-convention table (inside front cover and §§ cited as p. 501ff). The three-sign definitions above come via Wikipedia, which cites MTW, and they are consistent with Carroll's explicit formulas.
- I did not verify the sign conventions of Hartle, Schutz, Zee, Moore or Susskind from the books themselves. Hartle's 2006 paper is consistent with $(-,+,+,+)$ and $+8\pi G/c^4$, but a convention table for every book in the ladder still needs checking against each book's front matter.
- I found no source giving Zee's signature choice.

---

## 6. Physics-education research on student difficulties with tensors, index notation and GR

### Takeaway
GR-specific PER is thin but consistent:
- Undergraduates hold many "alternative conceptions" after standard instruction (Bandyopadhyay & Kumar 2010).
- Many cannot connect local measurements with Schwarzschild coordinates (Vokos).
- Index notation is a recognized barrier ("bulkiness", "cumbersome"), with a known catalogue of specific errors: implied sums, free vs dummy indices, index renaming (Moore).
- Conceptual understanding of curvature depends heavily on the external representations used, such as the rubber-sheet analogy (Kersting & Steier 2018; de Souza et al. 2026).
- Hartle and Moore, from long teaching experience, agree that the tensor mathematics "does take time" and "must be practiced" with drills.

### Cited Findings
- **Bandyopadhyay & Kumar (2010)**, "Probing students' understanding of some conceptual themes in general relativity", *Phys. Rev. ST Phys. Educ. Res.* 6, 020104. A case-study method focused in depth on about six students "who had just finished a one semester course on special relativity", using text-comprehension questionnaires and clinical interviews. "The aim was not to investigate the technical proficiency of the students, but to probe in detail the nuances of their conceptions". The analysis "reveals a large number of 'alternative conceptions' of students in the domain." — [DOI 10.1103/PhysRevSTPER.6.020104](https://doi.org/10.1103/PhysRevSTPER.6.020104) (abstract read via the Semantic Scholar API; the APS page and DOI resolver return 403 to automated fetches, but the DOI is canonical)
- **Vokos (AAPT TGRU 2006):** after instruction on the Schwarzschild metric, "47 out of 49 students" in a junior-level relativity course could not satisfactorily answer a basic question connecting local and Schwarzschild coordinates.
  - Both graduate and undergraduate students showed "generally poor understanding" of simultaneity.
  - Preconceptions strongly affect learning of SR and GR. Traditional instruction gave small gains; research-based tutorials gave larger ones.
  - Spacetime events, reference frames and clock synchronization are named as the SR foundations GR needs.
  — [Vokos talk, AAPT TGRU](https://aapt.org/doorway/TGRUTalks/Vokos/Vokos1of5.htm)
- **Moore (TGRU 2006 article)**, from teaching undergraduate GR "roughly 13 times in the past 24 years". Common tensor-notation errors:
  - believing "$\delta^\mu_\mu=1$, not 4";
  - writing $\eta_{\mu\nu}A^\mu B^\nu=\eta_{\mu\mu}A^\mu B^\mu$;
  - finding "$g_{\alpha\beta}=g_{\mu\nu}\delta^\mu_\sigma\delta^\nu_\gamma$" reasonable;
  - not seeing why $d(p_\mu p^\mu)/d\tau=2p_\mu\,dp^\mu/d\tau$.

  Underlying causes: "Failing to recognize implied sums; Failing to distinguish between free and summed indices; Failing to understand how index renaming works". His prescriptions:
  - drill students to identify free and summed indices, write out implied sums, check free-index consistency, rename indices and spot nonsensical equations;
  - use two-dimensional examples ("polar coordinates in flat space and longitude/latitude coordinates on a sphere"), including non-orthogonal coordinates;
  - "Undergraduates can be taught tensor calculus, but just barely", so keep the formalism simple;
  - interleave math and physics, since "a long mathematical preamble can be deadly".

  — [Moore TGRU article](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- **Hartle (2006):** "many students at this level need considerable exercise before they are able to accurately and efficiently manipulate tensorial expressions and feel at home with the four-dimensional mathematical concepts necessary to formulate Einstein's equation." Physics-first "is probably not indicated when the mathematics is of central interest", as for mathematics students or those heading to string theory. — [Hartle 2006](https://arxiv.org/abs/gr-qc/0506075)
- **Kim, Oh & Kim (2021)**, "Boosting vector calculus with the graphical notation", *Am. J. Phys.* 89, 200–209: "beginners report various difficulties dealing with the index notation due to its bulkiness." They propose graphical (diagrammatic) tensor notation. This is a pedagogical proposal, not a controlled study. — [DOI 10.1119/10.0002142](https://doi.org/10.1119/10.0002142); [arXiv:1911.00892](https://arxiv.org/abs/1911.00892)
- **Battaglia & George (2013)**, "Tensors: A guide for undergraduate students", *Am. J. Phys.* 81, 498–511. Ties tensors to vector calculus in orthonormal coordinates: "once orthonormality is relaxed, a dual basis, together with the contravariant and covariant components, naturally emerges." Manipulating them is "otherwise a cumbersome algebra" without a careful notation. — [DOI 10.1119/1.4802811](https://doi.org/10.1119/1.4802811); [author version](https://iris.unimore.it/handle/11380/976503)
- **Kersting, Henriksen, Bøe & Angell (2018)**, *Phys. Rev. Phys. Educ. Res.* 14, 010130 (Norwegian upper-secondary students). "Design choices on different levels can support or hinder understanding of general relativity". Students "can obtain a qualitative understanding of general relativity when provided with appropriately designed learning resources and sufficient scaffolding". — [DOI 10.1103/PhysRevPhysEducRes.14.010130](https://doi.org/10.1103/PhysRevPhysEducRes.14.010130)
- **Kersting & Steier (2018)**, "Understanding Curved Spacetime: the role of the rubber sheet analogy in learning general relativity", *Science & Education* 27, 593–623. — [DOI 10.1007/s11191-018-9997-4](https://doi.org/10.1007/s11191-018-9997-4) (bibliographic data verified via Crossref; abstract not read)
- **de Souza, Serrano, Treagust & Won (2026)**, *Research in Science Education* 56, 85–115 (Year-12 students). Students with accurate understanding used imagery tied to the rubber-sheet analogy. Those with limited understanding "attributed spatial effects to forces and linked time dilation to being in 'outer space'". The authors recommend careful choice of external representations. — [Monash research portal](https://research.monash.edu/en/publications/conceptions-of-curved-spacetime-relating-students-mental-represen/); DOI 10.1007/s11165-025-10254-0
- **Alstein, Krijtenburg-Lewerissa & van Joolingen (2021) review of special-relativity education** (*Phys. Rev. Phys. Educ. Res.*): students at all levels have difficulties with "the use of frames of reference, the postulates of SRT, and relativistic effects". Read only via the search-indexed abstract. — [DOAJ record](https://doaj.org/article/bc3cf32b53fb4932be63957ef13dd235)

### Inferences

**Study advice for a self-studying student, synthesized from the findings.**
1. Secure special relativity first: events, frames, simultaneity, spacetime diagrams. The PER shows these misconceptions carry into GR (Vokos; Alstein et al.).
2. Drill index notation on purpose:
   - write out every implied sum by hand for small cases;
   - label free vs dummy indices;
   - check index balance on both sides;
   - practise renaming dummy indices (Moore).
3. Do every new object in 2D first: the polar-coordinate plane and the 2-sphere for metric, Christoffel symbols, geodesics and curvature (Moore; Cambridge "draw pictures").
4. Compute Christoffel symbols and Riemann components by hand a few times, then use computer algebra or a worksheet (Moore: after a few times "there is not much more to be learned").
5. Use pictures such as the rubber sheet with care. They help, but force-based readings of curvature are a documented misconception (de Souza et al.).
6. Expect tensor fluency to take sustained practice rather than one reading (Hartle).

### Gaps
- I found no large-N quantitative PER study measuring undergraduate errors with tensor index notation specifically. The specific error catalogue comes from Moore's experience-based teaching article and is not a controlled study.
- I could not read the full text of Bandyopadhyay & Kumar (APS returned 403), so the specific alternative conceptions they list are not reported here.
- Vokos's slides are a talk summary, not a peer-reviewed paper; the underlying papers are listed on the TGRU "Articles" page, which I did not open.

---

## 7. How hard is each topic relative to Calculus II (1–10 scale), and which topics do students find hardest?

### Takeaway
Sources agree on the hardest parts:
- index manipulation, which is new and error-prone (Moore, Kim et al., Hartle);
- the shift from Cartesian to general coordinates with dual/covariant components (Battaglia & George);
- covariant derivatives and the differential-geometry layer ("new math", Hartle; the thing to prepare over summer, Cambridge);
- the tedium of computing Riemann/Ricci components (Moore, Carroll);
- solving the nonlinear field equations (Hartle).

Nobody publishes numeric ratings, so the 1–10 scale below is an inference anchored to those qualitative statements and to Carroll's book stars.

### Cited Findings
- **Tensor manipulation needs extended practice:** "many students at this level need considerable exercise before they are able to accurately and efficiently manipulate tensorial expressions". — [Hartle 2006](https://arxiv.org/abs/gr-qc/0506075)
- **Differential geometry is "new math"**, outside the typical "advanced calculus tool kit… In contrast, the vector calculus central to electromagnetism is part of this tool kit." — [Hartle 2006](https://arxiv.org/abs/gr-qc/0506075)
- **Solving the field equations is hard:** "solving the Einstein equation to exhibit physically relevant spacetime geometries is a difficult matter. Their nonlinear nature means that there is no known general solution outside of linearized gravity." — [Hartle 2006](https://arxiv.org/abs/gr-qc/0506075)
- **Index notation:**
  - "Tensor notation is new and strange for undergraduates" (standard errors listed in Question 6);
  - computing Christoffel symbols and Riemann/Ricci components is "tedious", so "use tricks and tools"; worksheets handle Christoffel and Ricci components for diagonal metrics;
  - "Undergraduates can be taught tensor calculus, but just barely."
  — [Moore TGRU article](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
- "beginners report various difficulties dealing with the index notation due to its bulkiness." — [Kim, Oh & Kim 2021](https://doi.org/10.1119/10.0002142)
- Multiple indices make the algebra "an unnecessarily cumbersome process" without good notation; contravariant/covariant components emerge once orthonormality is dropped. — [Battaglia & George 2013](https://doi.org/10.1119/1.4802811)
- **Differential geometry is the main preparation target:** students who did well "found it extremely useful to work through the Differential Geometry part of the course" before Part III. — [Cambridge Part III prep page](https://www.maths.cam.ac.uk/postgrad/part-iii/node/63)
- **Christoffel formula and computations:** "commit it to memory". Checking that it transforms like a connection is "for those of you without enough tedious computation in your lives". The Weyl tensor formula is "messy". — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- **Book-level difficulty stars:** Schutz and Taylor & Wheeler [*], Carroll's notes [**], MTW [**], Wald [***]. Wald's approach is "more mathematically demanding… and the basics are covered pretty quickly." — [Carroll notes bibliography](https://arxiv.org/abs/gr-qc/9712019)
- **Variational methods are a stated prerequisite** at Cambridge (Part II: IB "Methods and Variational Principles are very useful"; Part III: "Euler-Lagrange equations is essential") and Chicago (PHYS 18500 calculus of variations before PHYS 26400). — [Cambridge Schedules](https://www.maths.cam.ac.uk/undergrad/files/schedules.pdf); [Part III guide](https://www.maths.cam.ac.uk/postgrad/part-iii/files/misc/2020-21%20Guide/Relativity%20and%20Gravitation/General%20Relativity.pdf); [UChicago catalog](http://collegecatalog.uchicago.edu/thecollege/physics/)
- **Coordinate interpretation in Schwarzschild is hard:** 47 of 49 junior-level students could not connect local and Schwarzschild coordinates after instruction. — [Vokos, AAPT TGRU](https://aapt.org/doorway/TGRUTalks/Vokos/Vokos1of5.htm)
- **Index-notation and Euler–Lagrange fluency are flagged for advance practice**: Cambridge provides dedicated exercise sheets for both. — [Cambridge Part III prep page](https://www.maths.cam.ac.uk/postgrad/part-iii/node/63)

### Inferences

**Proposed difficulty ratings**, relative to Calculus II = 5 for a student currently taking it. These are the researcher's judgments, grounded in the sources cited in each row; label them as such in the report.

| Topic | Typical course | Rating (1–10) | Grounding |
|---|---|---|---|
| Single-variable derivatives, chain rule | Calc I | 3 | already completed |
| Integration techniques, Taylor series | Calc II | 5 (anchor) | — |
| Partial derivatives, multivariable chain rule, gradient | Calc III | 5 | Boas Ch. 4; standard US course |
| Jacobians, change of variables | Calc III | 6 | Boas Ch. 5 §4; precursor of coordinate transformations |
| Vectors, matrices, determinants, inverses | Linear Algebra | 5 | MIT 18.06; Boas Ch. 3 |
| Vector spaces, bases, dual vectors, change of basis | Linear Algebra / Methods | 6–7 | Battaglia & George (dual basis emerges); Part III "finite-dimensional vector spaces essential" |
| Summation convention, free vs dummy indices, $\delta$, $\epsilon$ | Methods / SR | 6 at first, falling to 4 with drill | Moore error catalogue; Kim et al. |
| Special relativity: 4-vectors, $\eta_{\mu\nu}$, Lorentz matrices, spacetime diagrams | Modern Physics / SR | 6 | Vokos; Alstein et al. (conceptual traps) |
| Calculus of variations, Euler–Lagrange | Mechanics / Methods | 6 | Cambridge and Chicago prerequisites; Boas Ch. 9 |
| Metric tensor, line elements, raising/lowering indices | Undergraduate GR | 6–7 | Moore weeks 2–3; Carroll ch. 1–2 |
| Christoffel symbols (formula and computation) | Undergraduate GR | 7 (tedious more than deep) | Carroll "commit to memory"; Moore worksheets |
| Geodesic equation (via variational principle) | Undergraduate GR | 6–7 | Hartle: "Lagrange's equations are the geodesic equations" |
| Covariant derivative, parallel transport, $D/d\tau$ | Undergraduate GR | 8 | Hartle "new math"; Moore week 8 |
| Riemann tensor: definition, symmetries, computing components | Undergraduate GR | 8–9 | Moore "tedious"; Carroll eq. 3.67 |
| Ricci, Ricci scalar, Einstein tensor, Bianchi identity | Undergraduate GR | 7–8 | Carroll eqs. 3.88–3.94 |
| Stress–energy tensor | Undergraduate GR | 7 | Carroll recommends Schutz if $T_{\mu\nu}$ is unclear |
| Einstein field equations: meaning, Newtonian limit | Undergraduate GR | 8 | Carroll eqs. 4.36–4.52 |
| Solving EFE (e.g. deriving Schwarzschild) | Undergraduate / graduate GR | 9 | Hartle: "a difficult matter… nonlinear" |
| Einstein–Hilbert action variation | Graduate GR | 9 | Carroll §4 (Hilbert action); MIT 8.962 "action principles" |
| Manifolds, forms, abstract index notation (Wald) | Graduate GR / Differential Geometry | 9–10 | Carroll stars Wald [***]; Cambridge Part III advice |

- **Practical reading of the table:** the two biggest jumps are (i) from Cartesian-vector thinking to index notation with upper and lower indices, and (ii) from partial to covariant derivatives and curvature. That is where the document should slow down and add 2D worked examples, as Moore and Cambridge recommend.

### Gaps
- No source assigns numerical difficulty ratings to these topics. The ratings are inferences.
- I found no survey data ranking which GR topic students find hardest. The evidence is instructor experience (Hartle, Moore, Carroll), small-N PER (Bandyopadhyay & Kumar; Vokos) and AJP pedagogy papers.

---

## 8. Good questions a beginning student can ask a GR professor about the mathematics

### Takeaway
The sources frame several real choices a student can ask about:
- physics-first (Hartle) vs math-first (Schutz/Carroll) vs Moore's interleaved "third way";
- how much linear algebra and differential equations matter (MIT lists both; Cambridge calls "finite-dimensional vector spaces" essential);
- whether to take differential geometry from the mathematics department (Cambridge advises working through differential geometry in advance; Hartle notes physics-first is less suitable for students with strong DG preparation or mathematical interests);
- which sign conventions the course uses (Tong, MTW).

I found no published list of "questions to ask your professor". The list below is synthesized from these documented choices.

### Cited Findings
- **Physics-first vs math-first:**
  - Hartle's AJP paper "makes the case for a 'physics first' approach". Its comparison is explicitly "not an even-handed comparison". He says physics-first is not indicated "when students already have significant preparation in differential geometry" (even then it remains "a possible alternative") or when "the mathematics is of central interest". — [Hartle 2006](https://arxiv.org/abs/gr-qc/0506075)
  - Moore argues the math-first approach's "long mathematical preamble can be deadly". He also argues that physics-first without tensors leaves students "rudderless in the sea of applications", and he proposes to "Use physics to motivate the math; then develop math and extend the physics." — [Moore TGRU article](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf)
  - The AAPT 2006 workshop on Teaching General Relativity to Undergraduates (about 45 faculty) featured Hartle ("The Case for GR for Undergraduates") and Moore ("Teaching General Relativity with Tensors"). — [AAPT TGRU](https://www.aapt.org/doorway/TGRU/index.htm)
- **Which linear algebra and differential equations:**
  - MIT 8.962 requires 18.06 (matrix theory, vector spaces, determinants, eigenvalues) and 18.03 (ODEs, including "modeling physical systems"), and expects "Green's functions, and numerical analysis". — [MIT Course Catalog, Math](https://catalog.mit.edu/subjects/18/); [MIT OCW 8.962 syllabus](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus/)
  - Cambridge Part III: "finite-dimensional vector spaces and the Euler-Lagrange equations is essential". — [Part III guide](https://www.maths.cam.ac.uk/postgrad/part-iii/files/misc/2020-21%20Guide/Relativity%20and%20Gravitation/General%20Relativity.pdf)
- **Differential geometry from the math department:**
  - Cambridge advises working through the differential-geometry material in advance and points to Carroll's manifolds chapter as "slightly less advanced". — [Cambridge Part III prep](https://www.maths.cam.ac.uk/postgrad/part-iii/node/63)
  - Tong's Part III notes devote two full chapters to differential and Riemannian geometry (manifolds, tangent spaces, forms, connections) before the Einstein equations. — [Tong GR course page](https://davidtong.org/teaching/general-relativity/)
  - Carroll's notes list mathematical background references (Schutz *Geometrical Methods* [**], Guillemin & Pollack [**], Nash & Sen [***], Warner [***]). — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
  - Carroll's preface: "The primary question facing any introductory treatment of general relativity is the level of mathematical rigor at which to operate. There is no uniquely proper solution". — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- **Is E&M needed?** Required at MIT (8.07) and Caltech (special relativity "at the level of… Jackson") and "highly desirable" at Cambridge Part III. Hartle: "Neither quantum mechanics nor electrodynamics are necessary" for physics-first. — [MIT catalog](https://catalog.mit.edu/subjects/8/); [Caltech Ph 236](https://physics.caltech.edu/academics/course-catalog/ph-236-abc); [Part III guide](https://www.maths.cam.ac.uk/postgrad/part-iii/files/misc/2020-21%20Guide/Relativity%20and%20Gravitation/General%20Relativity.pdf); [Hartle 2006](https://arxiv.org/abs/gr-qc/0506075)
- **Conventions:** Tong: "Ultimately you just need to get used to both conventions." — [Tong notes PDF](https://davidtong.org/pdfs/teaching/general-relativity/gr.pdf). Signs also differ between MTW, Weinberg, Peebles and Rindler. — [Wikipedia EFE sign convention (cross-check)](https://en.wikipedia.org/wiki/Einstein_field_equations#Sign_convention)
- **Hand computation vs computer algebra:** Moore recommends Mathematica/Maple worksheets, citing examples on Hartle's website, or a paper worksheet for diagonal metrics. — [Moore TGRU article](https://aapt.org/doorway/TGRU/articles/Moore%20GRArticle.pdf). MIT 8.962 homework includes numerically solving systems of differential equations. — [MIT OCW 8.962 syllabus](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus/)

### Inferences

**Suggested questions for the document**, each tied to the source that motivates it.
1. "Does your course take a physics-first (Hartle), math-first (Schutz/Carroll) or interleaved (Moore) approach, and why?" [Hartle 2006; Moore 2006]
2. "Which linear-algebra topics should I be fluent in: change of basis, dual spaces, determinants, eigenvalues?" [MIT 18.06; Cambridge "finite-dimensional vector spaces"; Battaglia & George]
3. "How much ODE technique, and how much numerical solving, will the problem sets need?" [MIT 8.962 syllabus]
4. "Should I take upper-division classical mechanics (Lagrangians, calculus of variations) before your course?" [Hartle: the "single essential physics prerequisite"; Chicago PHYS 18500; Cambridge]
5. "Do I need relativistic electromagnetism first?" [MIT/Caltech require it; Hartle says no for physics-first]
6. "Is it worth taking differential geometry from the math department before or after GR, or is the course self-contained?" [Cambridge Part III advice; Tong chs. 2–3; Hartle on when physics-first is not indicated]
7. "Which signature and Riemann/Ricci sign conventions do you use, and which textbook's conventions should I follow?" [Tong; MTW classification]
8. "Will we compute Christoffel symbols and curvature by hand, or use computer algebra (Mathematica, SymPy, Maple)?" [Moore]
9. "How should I practise index notation, and do you have drill problems?" [Moore; Cambridge index-notation sheet]
10. "Will we use abstract index notation (Wald) or component notation, and does it matter for graduate study?" [Wald §2.4; Carroll stars]
11. "If I am self-studying now, should I start with special relativity (Taylor & Wheeler) or go straight to Hartle?" [Vokos: SR foundations; Taylor & Wheeler free; Cambridge IA recommends it]

### Gaps
- I found no published source listing "questions to ask a GR professor". The list above is synthesized from documented curricular choices.
- I did not find a US department "how to prepare for GR" page equivalent to Cambridge's Part III preparation page. A department-level US source on whether to take differential geometry from the mathematics department remains unfound.
