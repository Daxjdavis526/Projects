# Core mathematics sequence for a physics B.S.: per-course content map for The Physics Atlas (M0 · MATH 1210 · 1220 · 2210 · 2270 · 2280 · 2250)

## 0. What source base supports this map, and how far could it be verified?

### Takeaway
The topic trees are reconciled mainly against four sources that could be read in full, or close to it, in this session:
- **OpenStax Calculus Vols. 1–3, Precalculus 2e and Algebra & Trigonometry 2e**, read from OpenStax's own GitHub source. This gave chapter structure and section counts for all five books, plus the full text of the hard Calc II sections.
- **MIT 18.06 Spring 2025**, lecture by lecture, with its Strang 6e readings.
- **Lebl's *Notes on Diffy Qs***: every section, with cross-references to Edwards–Penney (EP) and Boyce–DiPrima (BD) section numbers and per-section lecture budgets.
- **USU's official course descriptions**, as recorded by the companion catalog notes.

Stewart, Lay, Strang, Axler, Boyce–DiPrima–Meade and Edwards–Penney–Calvis were confirmed only in part, from search snippets of publisher, retailer and syllabus pages. No math-education research on misconceptions could be retrieved. The session's egress policy blocked most academic hosts, and the shared web-search budget ran out after the first batch of searches. The misconception lists below are therefore synthesized from standard instructional practice and flagged as such.

### Cited Findings
**OpenStax Calculus** (module counts as listed in the collection files):
- **Volume 1** — [Calc v1 collection file](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-1.collection.xml)
  - Functions and Graphs (6 modules)
  - Limits (6)
  - Derivatives (10)
  - Applications of Derivatives (11)
  - Integration (8)
  - Applications of Integration (10)
- **Volume 2** — [Calc v2 collection file](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-2.collection.xml)
  - Integration (8)
  - Applications of Integration (10)
  - Techniques of Integration (8)
  - Introduction to Differential Equations (6)
  - Sequences and Series (7)
  - Power Series (5)
  - Parametric Equations and Polar Coordinates (6)
- **Volume 3** — [Calc v3 collection file](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-3.collection.xml)
  - Parametric Equations and Polar Coordinates (6)
  - Vectors in Space (8)
  - Vector-Valued Functions (5)
  - Differentiation of Functions of Several Variables (9)
  - Multiple Integration (8)
  - Vector Calculus (9)
  - Second-Order Differential Equations (5)
- **Shared modules across volumes.** OpenStax reuses identical module IDs across volume boundaries — [v1](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-1.collection.xml), [v2](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-2.collection.xml), [v3](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-3.collection.xml).
  - Vol. 1's Integration and Applications of Integration chapters (m53623…m53636 and m53638…m53653) are the same modules as Vol. 2's first two chapters.
  - Vol. 3's first chapter (m53831…m53846) is the same as Vol. 2's last chapter.

**OpenStax precalculus books:**
- **Precalculus 2e** — [Precalculus 2e collection file](https://github.com/openstax/osbooks-college-algebra-bundle/blob/main/collections/precalculus-2e.collection.xml)
  - Functions (8)
  - Linear Functions (5)
  - Polynomial and Rational Functions (10)
  - Exponential and Logarithmic Functions (9)
  - Trigonometric Functions (5)
  - Periodic Functions (4)
  - Trigonometric Identities and Equations (7)
  - Further Applications of Trigonometry (9)
  - Systems of Equations and Inequalities (9)
  - Analytic Geometry (6)
  - Sequences, Probability and Counting Theory (8)
  - Introduction to Calculus (5)
- **Algebra and Trigonometry 2e** opens with Prerequisites (7) and Equations and Inequalities (8) before Functions. It has no calculus-preview chapter — [A&T 2e collection file](https://github.com/openstax/osbooks-college-algebra-bundle/blob/main/collections/algebra-and-trigonometry-2e.collection.xml)

**Linear algebra and ODE sources:**
- **MIT 18.06 Spring 2025** (Prof. Nike Sun) uses Strang, *Introduction to Linear Algebra*, 6th ed. It runs 36 lectures, each with the Strang section to read. The catalog line reads: "Compared with 18.700, more emphasis on matrix algorithms and many applications." — [mitmath/1806](https://github.com/mitmath/1806)
- **Lebl, *Notes on Diffy Qs*** — [Lebl ch-intro.tex](https://github.com/jirilebl/diffyqs/blob/master/ch-intro.tex)
  - The book calls itself "a more or less drop-in replacement for Edwards and Penney, or Boyce and DiPrima".
  - It began as notes for UIUC Math 286, and the author also taught UIUC Math 285, UCSD Math 20D and Oklahoma State Math 2233/4233 from it.
  - The whole book is about 76 lectures, or about 86 with the linear-algebra appendix.
  - Each section of the source carries EP and BD section cross-references and a suggested lecture count — [Lebl repository](https://github.com/jirilebl/diffyqs)

**USU course descriptions** (catalog snippets as recorded in the companion notes; [MATH 1210](https://catalog.usu.edu/courses/MATH1210), [MATH 1220](https://catalog.usu.edu/courses/MATH1220), [MATH 2210](https://catalog.usu.edu/courses/MATH2210), [MATH 2250](https://catalog.usu.edu/courses/MATH2250), [MATH 2280](https://catalog.usu.edu/courses/MATH2280)):
- **MATH 1210 Calculus I (4 cr):** "limits, continuity, derivatives, derivative formulas, derivative applications, indefinite and definite integrals and the basics of integration". — [USU catalog MATH 1210](https://catalog.usu.edu/courses/MATH1210)
- **MATH 1220 Calculus II (4 cr):** "Integration, integration techniques, infinite series, introduction to vectors, and applications". — [USU catalog MATH 1220](https://catalog.usu.edu/courses/MATH1220)
- **MATH 2210 Multivariable Calculus (3 cr):** "partial derivatives, optimization of functions of several variables, multiple integrals, vector fields including line and surface integrals, and the theorems of Green, Gauss and Stokes". — [USU catalog MATH 2210](https://catalog.usu.edu/courses/MATH2210)
- **MATH 2250 (4 cr):** catalog title "Linear Algebra and Differential Equations". Description: "Linear systems, abstract vector spaces, matrices through eigenvalues and eigenvectors, solutions of ODEs, Laplace transforms, first-order systems". — [USU catalog MATH 2250](https://catalog.usu.edu/courses/MATH2250)
- **MATH 2280 Ordinary Differential Equations (3 cr):** "Analytic solution techniques for ODEs; initial value and boundary value problems with applications; higher-order scalar equations; first-order linear systems; Laplace transforms". — [USU catalog MATH 2280](https://catalog.usu.edu/courses/MATH2280)
- **MATH 2270:** catalog entry not retrieved; the course is active, with recitation leaders assigned for Spring 2026 (per the companion notes) — [AMLC recitation leaders](https://artsci.usu.edu/math-stats/amlc/recitation/leaders/index)

### Inferences
**How to read the course trees below.** These conventions are used throughout.
- **Module codes:**
  - M0-n: refresher
  - C1-n: MATH 1210
  - C2-n: MATH 1220
  - C3-n: MATH 2210
  - LA-n: MATH 2270
  - DE-n: MATH 2280
  - P-n: the MATH 2250 pathway
- **Status tags:**
  - **[C] standard core:** present in every reconciled source.
  - **[O] optional or variable:** in the standard textbooks, but routinely cut or moved between courses.
  - **[E] enrichment:** beyond the standard course, included for the physics or general-relativity goal.
  - **[USU]:** placement driven by USU's catalog description where it departs from textbook norms.
- **Lesson granularity:**
  - Inside each submodule, the items after "Lessons:" are separated by semicolons. Each is sized for one 3–8-minute lesson (intro → manipulable visual → one worked example → 4–8 practice items → checkpoint).
  - "×2" marks an item that needs two lessons.
  - A typical 50-minute lecture corresponds to roughly 3–5 such lessons. Lebl's lecture budgets and MIT 18.06's 36-lecture allocation are therefore usable as weighting proxies.
- **Source tags:**
  - **OS1/OS2/OS3 §x.y:** OpenStax Calculus volume and section.
  - **OSP chN / OSAT chN:** Precalculus 2e and Algebra & Trigonometry 2e chapters.
  - **ST:** Stewart, *Calculus: Early Transcendentals* 9e.
  - **LAY:** Lay–Lay–McDonald 6e.
  - **STR:** Strang 6e, with section numbers as used in the MIT 18.06 S25 readings.
  - **MIT06 Ln:** MIT 18.06 lecture n.
  - **AX:** Axler 4e.
  - **LEB:** Lebl. Section titles are verified; section numbers are reconstructed from chapter order.
  - **EP and BD:** section numbers exactly as Lebl cross-references them.
    - Lebl's EP is evidently an Edwards–Penney differential-equations-and-boundary-value-problems text (Laplace in ch. 7, power series in ch. 8, Fourier in ch. 9). Its chapter numbers differ from Edwards–Penney–Calvis *Differential Equations and Linear Algebra*, which inserts linear-algebra chapters.
    - Lebl's BD numbering may drift by a section in places relative to the 12th edition.
- **Section titles:**
  - OpenStax section titles quoted below match the published tables of contents to the best of my knowledge. They are consistent with the verified module counts: count minus one, because the first module of each chapter is the introduction.
  - Only the sections named in each course's Cited Findings were individually opened.
  - That rule also explains a numbering conflict. The Open Textbook Library catalog numbers Vol. 3's Divergence Theorem and Series Solutions as 6.9 and 7.5. The book's own TOC numbers them 6.8 and 7.4, which matches intro-plus-sections counts of 9 and 5 (see §4).

### Gaps
**Unreachable sources:**
- The egress policy refused connections (HTTP 403 on CONNECT) to openstax.org, math.libretexts.org, ocw.mit.edu, math.mit.edu, tutorial.math.lamar.edu (Paul's Notes), pearson.com, en.wikipedia.org and 3blue1brown.com. WebFetch reached github.com and raw.githubusercontent.com; every other host tried failed DNS resolution.
- The per-turn shared web-search budget was exhausted after about 10 searches.

**Not verified this session:**
- Stewart 9e beyond §7.7 and §8.2.
- Thomas' Calculus (not consulted).
- Lay 6e chapters 1–6 and 8; only chapter 7 is confirmed.
- Strang 6e chapters beyond what the MIT readings imply.
- Axler 4e's duality section.
- Boyce–DiPrima–Meade 12e at section level; chapter titles only.
- Edwards–Penney–Calvis *Differential Equations and Linear Algebra* 4e beyond chapters 1–2.
- MIT 18.01, 18.02 and 18.03 syllabi.
- Paul's Online Notes.
- Strogatz.
- 3Blue1Brown episode lists.
- MIT Mathlets.
- All math-education research (concept inventories, misconception studies).

**USU-specific gaps:**
- USU textbooks for MATH 1210 (in-person), 2210, 2250, 2270 and 2280 are unknown. The only one found is Sisson & Szarvas, *Single Variable Calculus* (Hawkes), for one online MATH 1220 section around 2021, per the companion notes.
- USU's official learning objectives for these courses were not retrieved by anyone.

## 1. M0 Foundations refresher: what should a compact, skippable, diagnostic-driven refresher contain, and which items make good placement questions?

### Takeaway
M0 should be a diagnostic-gated repair kit of 14 short modules (about 60–70 lessons in total, most of them skipped by a strong learner), not a course.
- **Core content:** OpenStax Algebra & Trigonometry / Precalculus.
- **Three additions that precalculus books do not foreground but physics and the later courses need:**
  - quantitative reasoning: units, dimensional analysis, scientific notation, estimation;
  - notation literacy: Σ, indices, subscripts and superscripts;
  - a short logic and proof primer: quantifiers, contrapositive, counterexample.
- **Diagnostic design:** the best items have a wrong answer that exposes one specific misconception that will block calculus, such as (a+b)²=a²+b², ln(a+b)=ln a+ln b, sin⁻¹x=1/sin x, or √(x²)=x.

### Cited Findings
- **Precalculus 2e structure.** Its 12 chapters run Functions → Linear Functions → Polynomial and Rational Functions → Exponential and Logarithmic Functions → Trigonometric Functions → Periodic Functions → Trigonometric Identities and Equations → Further Applications of Trigonometry → Systems of Equations and Inequalities → Analytic Geometry → Sequences, Probability and Counting Theory → Introduction to Calculus — [Precalculus 2e collection](https://github.com/openstax/osbooks-college-algebra-bundle/blob/main/collections/precalculus-2e.collection.xml)
- **Algebra & Trigonometry 2e structure** — [A&T 2e collection](https://github.com/openstax/osbooks-college-algebra-bundle/blob/main/collections/algebra-and-trigonometry-2e.collection.xml)
  - It adds a "Prerequisites" chapter of 6 sections and an "Equations and Inequalities" chapter of 7 sections before Functions.
  - It splits trigonometry into "The Unit Circle: Sine and Cosine Functions", "Periodic Functions", "Trigonometric Identities and Equations" and "Further Applications of Trigonometry".
  - Its last two chapters are Analytic Geometry and Sequences, Probability, and Counting Theory.
- **Calculus Vol. 1 review chapter.** Vol. 1 opens with a 5-section review chapter, "Functions and Graphs", so OpenStax places a function refresher inside Calc I as well — [Calc v1 collection](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-1.collection.xml)
- **USU entry requirement.** USU's MATH 1210 description stresses "algebraic and transcendental functions". The companion notes report that MATH 1210 is assumed passed on entry to the physics BS. M0 therefore serves as remediation, not as a USU course — [MATH 1210 catalog](https://catalog.usu.edu/courses/MATH1210)

### Inferences
#### (1) Course identity
- "M0 — Foundations Refresher" is internal to the Atlas and is not a USU course.
- It covers the content of college algebra plus trigonometry/precalculus (OpenStax A&T 2e, Precalculus 2e).
- Its job is to repair, quickly, whatever blocks MATH 1220, PHYS 2210/2220 and later courses.

#### (2) Major subjects
1. Number and notation
2. Algebraic manipulation
3. Equations and inequalities
4. Functions and graphs
5. Polynomial and rational functions
6. Exponentials and logarithms
7. Trigonometry, including inverse trig and identities
8. Polar and parametric curves and 2-D vectors
9. Complex numbers
10. Analytic geometry and conics
11. Sequences, series and the binomial theorem
12. Quantitative reasoning for physics
13. Logic and proof basics

#### (3) Module → submodule → lesson tree (each module = 3–6-item pretest; only failed submodules unlock)
- **M0-1 Numbers & notation [C]** [OSAT ch1]
  Lessons:
  - real-number system and number line;
  - order of operations and fraction fluency;
  - absolute value as distance (|x−a|<δ as an interval: an ε–δ seed);
  - interval and set-builder notation;
  - function notation f(x) versus f·x;
  - Σ-notation, index shifting and dummy indices [C, series prep];
  - subscripts/superscripts and Greek letters as names [E, prep for index notation x^μ, g_μν];
  - scientific notation and significant figures;
  - SI prefixes and unit-conversion chains.
- **M0-2 Algebraic manipulation [C]** [OSAT ch1]
  Lessons:
  - exponent laws, including zero and negative exponents;
  - rational exponents and radicals;
  - rationalizing, including the numerator (a limit technique);
  - expanding and special products;
  - factoring: GCF, grouping, trinomials, difference of squares, sum/difference of cubes;
  - rational expressions and compound fractions;
  - completing the square ×2 (vertex form; circles and integrals of 1/(x²+bx+c)).
- **M0-3 Equations & inequalities [C]** [OSAT ch2; OSP ch9]
  Lessons:
  - linear and *literal* equations (solve v²=v₀²+2aΔx for Δx);
  - quadratic formula and discriminant;
  - rational and radical equations, including extraneous roots;
  - absolute-value equations and inequalities;
  - polynomial/rational inequalities by sign chart;
  - 2×2 systems (substitution, elimination, geometric meaning);
  - 3×3 systems and augmented matrices with Gaussian elimination [bridge to LA-2];
  - nonlinear systems (line–circle, circle–ellipse);
  - partial-fraction decomposition [O; OSP ch9 includes it, and Calc II re-teaches it].
- **M0-4 Functions & graphs [C]** [OSP ch1–2]
  Lessons:
  - definition, domain and range (natural domain from √, ÷ and ln);
  - reading graphs: increasing, extrema, average rate of change;
  - **the difference quotient [f(x+h)−f(x)]/h** (the single most predictive algebra skill for Calc I);
  - composition and *decomposition* (seeing sin(x²) as an outer function of an inner one: chain-rule prep);
  - transformations y=a·f(b(x−h))+k ×2;
  - even/odd symmetry;
  - piecewise and absolute-value functions;
  - inverse functions (one-to-one, restricting the domain, reflection in y=x);
  - linear models and slope as a rate with units.
- **M0-5 Polynomial & rational functions [C]** [OSP ch3]
  Lessons:
  - quadratics in vertex form;
  - power functions and end behavior;
  - zeros and multiplicity (touch versus cross);
  - long and synthetic division;
  - remainder, factor and rational-root theorems;
  - fundamental theorem of algebra and conjugate pairs;
  - rational functions: vertical, horizontal and slant asymptotes and holes;
  - direct and inverse variation (inverse-square laws).
- **M0-6 Exponential & logarithmic functions [C]** [OSP ch4]
  Lessons:
  - growth/decay and e (continuous compounding);
  - logs as inverses;
  - log laws and change of base;
  - solving exponential/log equations;
  - half-life and doubling time;
  - log scales (dB, magnitudes, pH);
  - semi-log and log-log linearization; fitting power laws (Kepler III, T²∝a³, from planetary data) [physics].
- **M0-7 Trigonometric functions [C]** [OSP ch5–6]
  Lessons:
  - radians as ratios, arc length s=rθ, angular speed ω;
  - unit-circle definitions;
  - special and reference angles;
  - right-triangle trigonometry and vector components;
  - sinusoid parameters (amplitude, period, phase, midline) ×2;
  - graphs of tan, sec, csc and cot;
  - inverse trig functions: principal ranges and compositions such as sin(arccos x)=√(1−x²).
- **M0-8 Trig identities & equations [C]** [OSP ch7]
  Lessons:
  - Pythagorean and reciprocal identities;
  - a strategy for verifying identities;
  - sum and difference formulas;
  - double-angle and half-angle/power-reduction formulas (needed for ∫sin²x);
  - product-to-sum and sum-to-product (beats in acoustics, Fourier orthogonality later);
  - solving trig equations (general solution versus solutions in an interval);
  - a·sin x+b·cos x = R·sin(x+φ) (amplitude–phase form of oscillator solutions) [C for physics].
- **M0-9 Triangles, polar, parametric, 2-D vectors [C]** [OSP ch8]
  Lessons:
  - law of sines and law of cosines;
  - polar ↔ Cartesian conversion, including quadrant-correct angles (atan2);
  - polar graphs (circles, cardioids, roses);
  - parametric equations and eliminating the parameter (projectile path);
  - vectors in 2-D: components, magnitude/direction, unit vectors; dot-product preview.
- **M0-10 Complex numbers [C]** [OSP ch3, ch8]
  Lessons:
  - arithmetic and conjugates;
  - the complex plane and modulus;
  - polar form, and multiplication as rotation-plus-scaling;
  - De Moivre's theorem and roots of unity;
  - e^{iθ}=cos θ+i sin θ as notation (proved in C2 by series; used in DE-3 for complex roots).
- **M0-11 Analytic geometry & conics [C/O]** [OSP ch10]
  Lessons:
  - distance and midpoint;
  - circles by completing the square;
  - parabola via focus–directrix (reflector property);
  - ellipse (a, b, c; foci; orbit shapes);
  - hyperbola (asymptotes);
  - rotation of axes and the xy-term [O; C2 revisits];
  - polar conics with eccentricity [O; C2 revisits].
- **M0-12 Sequences, series, binomial theorem [C/O]** [OSP ch11]
  Lessons:
  - sequences and recursion;
  - arithmetic and geometric sequences;
  - finite and infinite geometric series (|r|<1; Zeno);
  - binomial theorem and Pascal's triangle (seed for the binomial series);
  - counting and probability [O, off the calculus path].
- **M0-13 Quantitative reasoning for physics [E-physics; no precalculus chapter covers it]**
  Lessons:
  - dimensional analysis as a check and as a derivation tool (pendulum period ∝√(L/g));
  - order-of-magnitude (Fermi) estimation;
  - scaling laws (double r → force ¼);
  - first-order approximations (sin θ≈θ, (1+x)ⁿ≈1+nx) previewed as Taylor seeds;
  - graphs with units and log axes;
  - natural/geometrized units preview (c=1; G=c=1) [E, GR].
- **M0-14 Logic & proof basics [C for LA/analysis readiness]**
  Lessons:
  - statements and implications; converse versus contrapositive ("differentiable ⇒ continuous");
  - quantifiers ∀/∃ and negating nested quantifiers (the ε–δ sentence);
  - counterexamples;
  - direct proof and proof by contradiction (√2 irrational);
  - induction [O];
  - checking a definition ("is this set closed under addition?": subspace prep).
- **M0-15 Introduction to calculus [O]** [OSP ch12]
  - Skip for this learner; C1 supersedes it.

#### (4) Mathematical skills needed and (5) prerequisites
- **Skills:**
  - symbol manipulation without sign or distribution errors;
  - graph literacy (reading rates and intercepts);
  - unit-aware arithmetic;
  - translating words into equations;
  - recognizing function families and compositions.
- **Prerequisites:**
  - arithmetic;
  - plane geometry (similar triangles, Pythagoras, area and volume formulas);
  - first-year algebra.

#### (6) Foundational ideas rarely stated in catalog descriptions
- **Function as process, and covariation.** How does the output change as the input changes? This is the conceptual root of rate, derivative and integral.
- **Equivalence-preserving versus non-equivalence-preserving steps.**
  - Squaring both sides can add solutions.
  - Dividing by a variable expression can lose solutions.
- **Roles of letters in a formula.** Variables, parameters and constants play different roles, and physics formulas mix them freely.
- **Units are algebraic objects.** Dimensional homogeneity is a free error detector.
- **Approximation is a legitimate mathematical act** when it comes with error control (the seed of Taylor and numerical methods).
- **Radians are a ratio.** This is why d/dx sin x = cos x holds only in radians.
- **Notation literacy.** Σ, dummy indices, subscripts and function-composition notation; reading a formula as a machine.

#### (7) Problem-solving techniques and representative archetypes
- **M0-2/3:**
  - (a) Simplify (x⁻¹+y⁻¹)⁻¹ (trap answer: x+y).
  - (b) Solve √(x+3)=x−3 and reject the extraneous root.
  - (c) Solve T=2π√(L/g) for g.
  - (d) Sign-chart (x−1)(x+2)/(x−3)≥0.
- **M0-4/5:**
  - (a) Simplify [f(x+h)−f(x)]/h for f=1/x and f=√x.
  - (b) Find the inverse of (2x+1)/(x−3) and its domain.
  - (c) Locate the hole versus the asymptote of (x²−1)/(x²−x).
- **M0-6:**
  - (a) Solve 2^{x+1}=5·3^x.
  - (b) Carbon-14 age from a remaining fraction.
  - (c) Read the exponent of a power law from the slope of a log-log plot.
- **M0-7/8:**
  - (a) All solutions of 2sin²x−sin x−1=0 on [0,2π).
  - (b) Rewrite 3sin t+4cos t as 5sin(t+φ).
  - (c) Evaluate tan(arcsin(x/3)) by drawing a triangle (a trig-substitution seed).
- **M0-9/10:**
  - (a) Components of a 12 N force at 30°.
  - (b) (1+i)⁸ via polar form.
  - (c) The cube roots of 8i.
- **M0-13:**
  - (a) Which expression can be a speed: √(GM/r) or √(Gr/M)?
  - (b) Estimate the number of heartbeats in a lifetime.

#### (8) Interactive visualization ideas
- **Transformation playground.**
  - Draws: y=a·f(b(x−h))+k over a ghost of f.
  - Learner controls: sliders for a, b, h, k; a choice of base f (x², |x|, √x, sin x, eˣ, ln x).
  - Teaches: inside changes act opposite to intuition (h>0 shifts right; b>1 compresses).
  - Simplified: nothing.
- **Unit-circle unwrapper.**
  - Draws: a point moving on the unit circle, with its x and y coordinates traced out as cos and sin graphs.
  - Learner controls: drag θ; toggle degrees/radians; inverse mode highlights the principal branch.
  - Teaches: radians as arc length, reference angles, why arcsin returns values in [−π/2, π/2].
- **Log-axis lab.**
  - Draws: real planetary (a, T) data on linear, semi-log and log-log axes.
  - Learner controls: fit a line.
  - Teaches: power laws become straight lines; slope = exponent (Kepler III gives 3/2).
  - Simplified: circular-orbit approximation.
- **Complex multiplier.**
  - Draws: a shape in the complex plane before and after multiplication by z=re^{iθ}.
  - Learner controls: r and θ.
  - Teaches: multiplication = rotation × scaling; roots of unity as a regular polygon.
- **Sign-chart builder.**
  - Draws: factors as draggable cards on a number line.
  - Teaches: sign changes at zeros and poles, and multiplicity effects.
- **Dimension checker.**
  - Draws: an equation, with each term's units displayed.
  - Learner controls: drag quantities into the equation.
  - Teaches: dimensional homogeneity; Buckingham-style derivation of the pendulum period.
- **Hyperbola-vs-circle preview [E].**
  - Draws: x²+y²=1 next to x²−y²=1.
  - Learner controls: a parameter point moving along each curve.
  - Teaches: cos/sin versus cosh/sinh as coordinates. This seeds C2's hyperbolic functions and special relativity's "unit hyperbola".

#### (9) Connections to physics and onward to GR
- Unit circle and sinusoids → oscillations, waves, AC phasors.
- Vectors → forces and kinematics.
- Log-log fits → empirical power laws (Kepler III).
- Complex numbers → phasors, damped oscillators, quantum amplitudes.
- Conics → orbits.
- Σ and index notation → the Einstein summation convention.
- Dimensional analysis → geometrized units (G=c=1).
- The hyperbola x²−y²=1 → the Minkowski interval, whose "unit circles" are hyperbolas.

#### (10) Appropriate depth and rigor
- Procedural fluency plus one-sentence conceptual explanations.
- Proofs appear only in M0-14.
- Target 2–4 lessons per repaired weakness; mastery-gated, not time-gated.
- A learner who has passed Calc I should clear M0 mostly by pretest.

#### (11) Common misconceptions and error patterns (distractor and identify-the-error material; synthesized from standard practice, not from verified research this session)
- **Algebra:**
  - (a+b)²→a²+b²;
  - √(a²+b²)→a+b;
  - 1/(a+b)→1/a+1/b;
  - (x+3)/3→x by "cancelling" across a sum;
  - −x² read as (−x)²;
  - (x^a)^b→x^{a+b} and x^a·x^b→x^{ab};
  - √(x²)→x (should be |x|);
  - dividing by x and losing x=0;
  - not flipping an inequality when multiplying by a negative;
  - squaring both sides without checking.
- **Functions:**
  - f(x+h)→f(x)+h or f(x)+f(h);
  - f⁻¹(x)→1/f(x);
  - f(g(x))→f(x)·g(x);
  - y=f(x−2) shifts left;
  - reading the domain off the simplified expression (losing a hole).
- **Exponentials and logs:**
  - ln(a+b)→ln a+ln b;
  - ln a/ln b→ln(a/b);
  - log(ab)→log a·log b;
  - e^{a+b}→e^a+e^b;
  - taking the log of a negative number.
- **Trigonometry:**
  - calculator in degree mode;
  - sin⁻¹x→1/sin x;
  - sin 2x→2 sin x;
  - sin(x+y)→sin x+sin y;
  - period of sin 3x→6π;
  - arcsin(sin(5π/6))→5π/6;
  - arctan(y/x) used for a point in quadrant II or III;
  - cos²x read as cos(x²).
- **Physics numeracy:**
  - adding quantities with different units;
  - (10³)²→10⁵;
  - reporting 9 significant figures;
  - reading a log-scale slope as a linear rate.

#### Placement-diagnostic item bank for M0 (each item → module it gates; the trap answer is the distractor)
1. **Simplify (x⁻¹+y⁻¹)⁻¹** → M0-2. Answer: xy/(x+y). Trap: x+y.
2. **Is √(x²)=x for all real x?** → M0-2. Answer: no, it equals |x|.
3. **Expand (2a−3b)²** → M0-2. Trap: 4a²−9b².
4. **Solve √(x+3)=x−3** → M0-3. Answer: x=6 only. Trap: also listing x=1.
5. **Solve |2x−3|<5** → M0-3. Answer: −1<x<4.
6. **Simplify [f(2+h)−f(2)]/h for f(x)=x²** → M0-4. Answer: 4+h.
7. **Domain of √(4−x²)/(x−1)** → M0-4. Answer: [−2,1)∪(1,2].
8. **Graph y=−2cos(3(x−π/6))+1:** amplitude, period, phase shift → M0-7.
9. **sin(arccos(3/5))** → M0-7. Answer: 4/5. Trap: 3/5.
10. **All x in [0,2π) with 2sin²x=sin x+1** → M0-8.
11. **ln(e²·√e)** → M0-6. Answer: 5/2.
12. **Solve 3e^{2t}=12** → M0-6. Answer: t=ln 2. Trap: t=2 (reading e^{2t}=4 as 2t=4, i.e. dropping the logarithm).
13. **Center and radius of x²+y²−4x+6y=3** → M0-11.
14. **Write 3sin t+4cos t in amplitude-phase form** → M0-8.
15. **(1+i)⁸** → M0-10. Answer: 16.
16. **Polar angle of (−1,−√3)** → M0-9. Answer: 4π/3. Trap: π/3 from arctan.
17. **Which could be the period of a pendulum: 2π√(L/g) or 2π√(g/L)?** → M0-13.
18. **Negate "for every ε>0 there is δ>0 such that…"** → M0-14.
19. **Contrapositive of "if f is differentiable at a then f is continuous at a"** → M0-14. Trap: the converse.
20. **Sum of 1+1/3+1/9+…** → M0-12. Answer: 3/2.

### Gaps
- No research-based instrument was retrieved, so the item bank above is a design proposal, not a validated instrument.
  - The Precalculus Concept Assessment (Carlson, Oehrtman & Engelke, *Cognition and Instruction*, 2010) is the obvious candidate to adapt. It could not be retrieved, and its item content should be checked before use.
- OpenStax Precalculus section titles were not individually verified; chapters and section counts were.
- USU's own precalculus course numbers and placement rules were not checked. That belongs to the catalog researcher.

## 2. MATH 1210 Calculus I: what is the complete content map?

### Takeaway
MATH 1210 corresponds to OpenStax Calculus Vol. 1 chapters 1–5 (function review, limits, derivatives, applications of derivatives, and integration through substitution). USU's description ends at "indefinite and definite integrals and the basics of integration". Applications of integration therefore belong to MATH 1220 at USU, and OpenStax deliberately ships those same modules in both volumes.

For this learner, who has completed Calc I, the course is a diagnostic-and-repair layer. Testing out is realistic, but five competencies that Calc II and Physics I lean on must be *verified*, not assumed:
- FTC with variable limits
- substitution
- linearization and differentials
- L'Hôpital's rule across all indeterminate forms
- related rates

### Cited Findings
- **OS1 structure (module counts):** Functions and Graphs 6, Limits 6, Derivatives 10, Applications of Derivatives 11, Integration 8, Applications of Integration 10. That is an introduction plus 5/5/9/10/7/9 sections, consistent with the published numbering — [Calc v1 collection](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-1.collection.xml)
- **The integration chapters are shared.** OS1's Integration and Applications of Integration chapters are the same modules as OS2 chapters 1–2 (m53623–m53636, m53638–m53653). OpenStax treats the Calc I/II boundary as movable — [v1](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-1.collection.xml); [v2](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-2.collection.xml)
- **USU MATH 1210 (4 cr) description.** "Students work with algebraic and transcendental functions while learning the concepts of limits, continuity, derivatives, derivative formulas, derivative applications, indefinite and definite integrals and the basics of integration" — [MATH 1210 catalog](https://catalog.usu.edu/courses/MATH1210)
- **USU's MATH 1220 prerequisite.** One online-section syllabus states it as C- or better in MATH 1210, or AP Calculus AB ≥4, or BC ≥3 (per the companion notes) — [Heal MATH 1220 syllabus](https://www.usu.edu/math/rheal/math1220/syllabus)

### Inferences
#### (1) Course identity
- USU MATH 1210 Calculus I (4 credits, QL).
- Standard equivalents:
  - OpenStax Vol. 1 ch. 1–5;
  - Stewart *Early Transcendentals* ch. 1–5 (structure from general knowledge, not verified this session);
  - the first half of a single-variable course such as MIT 18.01 (not verified this session).

#### (2) Major subjects
1. Functions review
2. Limits and continuity, including the precise definition
3. The derivative, with all differentiation rules for algebraic and transcendental functions
4. Applications of derivatives: related rates, linearization, extrema and the MVT, shape and sketching, optimization, L'Hôpital, Newton's method
5. Antiderivatives
6. Riemann sums and the definite integral
7. FTC
8. Substitution

#### (3) Module → submodule → lesson tree
- **C1-1 Functions toolkit [C, diagnostic-gated → M0-4/6/7]** [OS1 §1.1–1.5]
  Lessons:
  - function classes as models;
  - composition and decomposition;
  - inverse and inverse-trig functions;
  - exponentials, logs and e.
- **C1-2 Limits [C]** [OS1 §2.1–2.5, §4.6]
  - **2.1 Why limits** [OS1 §2.1]. Lessons:
    - secant → tangent slope;
    - average → instantaneous velocity;
    - the area problem previewed.
  - **2.2 Limits from graphs and tables** [§2.2]. Lessons:
    - two-sided and one-sided limits;
    - how limits fail (jump, blow-up, oscillation sin(1/x));
    - infinite limits and vertical asymptotes.
  - **2.3 Limit laws and algebra** [§2.3]. Lessons:
    - limit laws and direct substitution;
    - 0/0 by factor-and-cancel;
    - rationalizing;
    - combining fractions;
    - the squeeze theorem;
    - lim sin θ/θ=1 and lim (1−cos θ)/θ=0 from unit-circle areas.
  - **2.4 Continuity** [§2.4]. Lessons:
    - the three-part definition;
    - classifying discontinuities (removable, jump, infinite);
    - continuity of compositions;
    - the IVT and bisection.
  - **2.5 Precise definition** [§2.5]. Lessons:
    - reading the ε–δ sentence as a challenge-response game;
    - finding δ for linear f;
    - finding δ for f(x)=x² [C as interpretation; written proofs O];
    - one-sided and infinite-limit versions [O].
  - **2.6 Limits at infinity** [§4.6]. Lessons:
    - horizontal asymptotes;
    - the growth hierarchy ln x ≪ x^p ≪ eˣ ≪ x^x [C].
- **C1-3 The derivative [C]** [OS1 §3.1–3.9]
  - **3.1 Definition** [§3.1]. Lessons:
    - derivative at a point as the limit of a difference quotient;
    - the tangent-line equation;
    - units of f′ (m/s, N/m, …).
  - **3.2 Derivative as a function** [§3.2]. Lessons:
    - graphical differentiation (sketch f′ from f);
    - differentiability versus continuity (corner, cusp, vertical tangent);
    - higher derivatives (acceleration, jerk);
    - notations (f′, dy/dx, ẋ).
  - **3.3 Rules** [§3.3]. Lessons:
    - constant, power, sum and multiple rules;
    - product rule;
    - quotient rule.
  - **3.4 Rates of change** [§3.4]. Lessons:
    - position–velocity–acceleration (sign analysis of v and a: speeding up versus slowing down);
    - rates in other sciences (I=dq/dt, P=dW/dt, linear density).
  - **3.5 Trig derivatives** [§3.5]. Lessons:
    - d/dx sin and cos from limits;
    - the other four trig functions.
  - **3.6 Chain rule** ×2 [§3.6]. Lessons:
    - Leibniz form dy/dx=(dy/du)(du/dx);
    - nested compositions and the "outside-in" procedure.
  - **3.7 Inverse functions** [§3.7]. Lessons:
    - (f⁻¹)′=1/f′(f⁻¹);
    - derivatives of arcsin, arctan and arcsec.
  - **3.8 Implicit differentiation** [§3.8]. Lessons:
    - implicit dy/dx;
    - tangent lines to circles and ellipses;
    - second derivatives implicitly [O].
  - **3.9 Exponential and log derivatives** [§3.9]. Lessons:
    - d/dx eˣ, aˣ, ln x and log_a x;
    - logarithmic differentiation (x^x, messy products).
  - **3.10 Hyperbolic derivatives [O in Calc I].** Stewart places hyperbolic functions in its differentiation chapter (unverified). OpenStax places them at OS1 §6.9 / OS2 §2.9, so they are taught in C2-1.10.
- **C1-4 Applications of derivatives [C]** [OS1 §4.1–4.10]
  - **4.1 Related rates** ×2 [§4.1]. Lessons:
    - strategy (relate, *then* differentiate, *then* substitute);
    - geometric setups (ladder, cone);
    - kinematic setups (radar, shadow).
  - **4.2 Linearization and differentials** [§4.2]. Lessons:
    - L(x)=f(a)+f′(a)(x−a);
    - differentials dy=f′dx;
    - **error propagation** (relative error in V=4πr³/3) [C, physics-lab critical].
  - **4.3 Extreme values** [§4.3]. Lessons:
    - EVT and its hypotheses;
    - critical points;
    - the closed-interval method.
  - **4.4 Mean Value Theorem** [§4.4]. Lessons:
    - Rolle's theorem and the MVT (geometric and kinematic statements);
    - consequences (f′=0 ⇒ constant; f′>0 ⇒ increasing; antiderivatives differ by a constant).
  - **4.5 Shape of a graph** [§4.5]. Lessons:
    - the first-derivative test;
    - concavity and inflection;
    - the second-derivative test.
  - **4.6 Curve sketching synthesis** [§4.5–4.6]. Lessons:
    - a full sketch with asymptotes;
    - oblique asymptotes [O].
  - **4.7 Optimization** ×2 [§4.7]. Lessons:
    - modeling and domain;
    - classic problems (box, can, fence);
    - physics optimization (Fermat's principle ⇒ Snell's law; maximum projectile range).
  - **4.8 L'Hôpital's rule** [§4.8]. Lessons:
    - 0/0 and ∞/∞;
    - 0·∞ and ∞−∞ by rewriting;
    - 1^∞, 0⁰ and ∞⁰ by logarithms (lim (1+1/x)^x=e).
  - **4.9 Newton's method** [§4.9]. Lessons:
    - the tangent-line iteration;
    - failure modes (bad start, cycling, f′≈0);
    - an application: Kepler's equation E−e sin E=M [E-physics].
  - **4.10 Antiderivatives** [§4.10]. Lessons:
    - antiderivative families (+C);
    - initial-value problems;
    - motion from acceleration (a→v→x).
- **C1-5 Integration [C]** [OS1 §5.1–5.7 = OS2 §1.1–1.7]
  - **5.1 Approximating area** [§5.1]. Lessons:
    - Σ-notation and sum formulas;
    - left, right and midpoint sums;
    - upper and lower sums.
  - **5.2 The definite integral** [§5.2]. Lessons:
    - the limit of Riemann sums;
    - net signed area;
    - properties (additivity, comparison);
    - average value of a function.
  - **5.3 FTC** ×2 [§5.3]. Lessons:
    - FTC1: accumulation functions and d/dx∫_a^{g(x)} f = f(g(x))g′(x);
    - FTC2: evaluation;
    - MVT for integrals.
  - **5.4 Net change** [§5.4]. Lessons:
    - the net change theorem;
    - **displacement versus total distance** (∫v versus ∫|v|).
  - **5.5 Substitution** ×2 [§5.5]. Lessons:
    - indefinite substitution;
    - definite substitution with changed limits.
  - **5.6 Exponential and log integrals** [§5.6]. Lessons:
    - ∫dx/x=ln|x|+C;
    - ∫aˣdx.
  - **5.7 Inverse-trig integrals** [§5.7]. Lessons:
    - ∫dx/√(a²−x²);
    - ∫dx/(a²+x²), including completing the square.
- **C1-6 Applications of integration [USU: MATH 1220]** [OS1 ch. 6 = OS2 ch. 2]
  - Listed here only as a boundary pointer to C2-1. USU's MATH 1210 description stops at "the basics of integration".

#### (4) Mathematical skills needed
- M0 algebra and trigonometry at automatic speed.
- Recognizing composite structure.
- Sign analysis.
- Translating word problems into functions with domains.
- Estimation and unit tracking.
- Reading and producing graphs.

#### (5) Prerequisite knowledge
- M0-2 to M0-8: functions, exponentials and logs, trigonometry, and inverse functions.
- M0-14 logic (for ε–δ and theorem hypotheses).

#### (6) Foundational ideas rarely stated in catalog descriptions
- **Local linearity.** A differentiable function looks linear under magnification. This is the real meaning of the derivative, and it leads directly to multivariable derivatives and to tangent spaces.
- **The derivative is a function and a rate with units.** It is not just "the slope".
- **Leibniz notation behaves like a ratio** (chain rule, separation of variables, substitution), within limits.
- **Theorems have hypotheses.** The EVT, IVT and MVT fail when continuity or differentiability fails. They assert existence, not location.
- **A limit is controlled approximation, not motion toward a value.**
- **The definite integral is defined as a limit of sums**; "area" is one interpretation.
- **The FTC links two independently defined ideas.** Accumulation functions are its key object.

#### (7) Problem-solving techniques and archetypes
- **C1-2 Limits:**
  - (a) lim_{x→2}(x²−4)/(x−2), explaining why f(2) being undefined is irrelevant;
  - (b) find δ for ε=0.01 for f(x)=3x−1 at x=2;
  - (c) use the IVT to show x³+x−1=0 has a root in (0,1);
  - (d) choose k to make a piecewise function continuous.
- **C1-3 Derivatives:**
  - (a) the derivative of √x from the definition;
  - (b) d/dx e^{sin(x²)};
  - (c) the implicit tangent line to x²+xy+y²=7;
  - (d) given s(t), find when the particle is at rest and when it is speeding up.
- **C1-4 Applications:**
  - (a) water level rate in a draining conical tank;
  - (b) estimate √4.1 and bound the error;
  - (c) minimum-material can of fixed volume;
  - (d) lim (1+a/x)^x;
  - (e) three Newton iterations on E−0.2 sin E=1.
- **C1-5 Integration:**
  - (a) midpoint sum M₄ for ∫₀²x²dx;
  - (b) d/dx∫₁^{x²}cos t dt;
  - (c) displacement versus distance for v=t²−4 on [0,3];
  - (d) ∫x·e^{x²}dx;
  - (e) average value of sin on [0,π].

#### (8) Interactive visualization ideas
- **Secant-to-tangent zoom.**
  - Draws: a curve, a fixed point P, a movable Q, and the secant slope readout.
  - Learner controls: slide Q toward P; a zoom slider.
  - Teaches: the derivative as a limit; local linearity. |x| never straightens at 0.
  - Simplified: a finite zoom range.
- **ε–δ game.**
  - Draws: a graph with a horizontal ε-band around L.
  - Learner controls: choose a δ-window; the app then shrinks ε adversarially.
  - Teaches: quantifier order; why the limit fails for a jump.
- **Derivative tracer.**
  - Draws: the slope of the tangent to f plotted live as f′.
  - Learner controls: a learner-sketch mode in which they draw f′ and are scored.
  - Teaches: graphical differentiation; where f′=0, f′>0, and so on.
- **Chain-rule nudges.**
  - Draws: three linked number lines x→u→y, with a small nudge dx propagating as du=g′dx and dy=f′du.
  - Teaches: derivatives multiply under composition.
  - Simplified: linearized nudges.
- **Related-rates rigs.**
  - Draws: a ladder sliding, a cone filling, and a plane passing a radar station.
  - Learner controls: rate sliders and the geometry.
  - Teaches: which quantities are constant and which vary; differentiate before substituting.
- **Optimization box.**
  - Draws: a sheet with corner squares of size x and the folded box, linked to a graph of V(x).
  - Teaches: domain restriction and the closed-interval method.
- **Newton's-method iterator.**
  - Draws: tangent lines from successive guesses; a basin-of-attraction colouring along the x-axis.
  - Learner controls: the starting value; the function choice.
  - Teaches: convergence speed and failure modes.
- **Riemann-sum lab.**
  - Draws: rectangles; an error-versus-n plot.
  - Learner controls: n; left/right/mid.
  - Teaches: integral as a limit; error shrinks like 1/n for endpoint sums.
- **Accumulation machine.**
  - Draws: a shaded area A(x)=∫_a^x f, with A(x) plotted beside it as x moves.
  - Teaches: FTC1 (the height of f is the slope of A); negative areas.
- **Velocity-to-position.**
  - Draws: a v(t) graph with signed shading; a car on a track.
  - Teaches: displacement versus distance.

#### (9) Connections to physics and onward to tensors/GR
- **Kinematics** (v=ẋ, a=v̇) and **Newton's second law** need derivatives as functions of time.
- **The work–energy theorem** W=∫F dx=ΔK is an FTC statement (developed in C2-1.6).
- **Linearization** gives small-angle physics and lab uncertainty propagation.
- **Optimization → Fermat's principle → the principle of least action.** In GR, free particles follow paths that extremize proper time. Seed the idea that physics laws can be stated as optimization.
- **Newton's method → Kepler's equation** for orbital position.
- **Related rates → cosmology hook [E].** Physical distance d=a(t)χ gives ḋ=(ȧ/a)d, which is Hubble's law v=H d.
- **Differentials dx, dy → the line element ds.** This becomes the central object of GR (ds²=g_μν dx^μ dx^ν).

#### (10) Appropriate depth and rigor
- **Standard (OpenStax/Stewart) depth:**
  - limits handled intuitively and algebraically;
  - ε–δ read, interpreted and done for linear or quadratic f;
  - EVT/IVT/MVT stated with hypotheses; the MVT proved from Rolle [O];
  - a few rule derivations (power rule for positive integers, product rule, d/dx sin x);
  - no integrability theory.
- **Atlas guidance:** core lessons stay computational and conceptual; optional "why it works" proof cards [E] serve the analysis- and GR-bound learner.

#### (11) Common misconceptions and error patterns (synthesized; flagged literature to verify listed in Gaps)
- **Limits:**
  - "lim_{x→a}f(x) is just f(a)";
  - "a limit can never be reached";
  - 0/0=1 or 0;
  - ∞−∞=0;
  - 1^∞=1;
  - concluding a two-sided limit exists from one side.
- **Derivatives:**
  - d/dx sin(x²)=cos(x²) (missing the inner derivative);
  - (fg)′=f′g′;
  - quotient-rule sign or order swapped;
  - d/dx aˣ=x·a^{x−1} (power rule misapplied to an exponential);
  - d/dx x^x=x·x^{x−1};
  - d/dx ln(5x)=5/x;
  - d/dx eˣ²=eˣ²;
  - "continuous ⇒ differentiable";
  - "f′(c)=0 ⇒ extremum";
  - "f″(c)=0 ⇒ inflection".
- **Applications:**
  - substituting numerical values *before* differentiating in related rates;
  - not checking endpoints or the domain in optimization;
  - L'Hôpital applied to a non-indeterminate form, or computed as (f/g)′;
  - Newton's method expected to always converge;
  - linear approximation used far from a.
- **Integrals:**
  - "the integral is the area" (losing the sign);
  - d/dx∫₁^{x²}f(t)dt=f(x²) (missing ·2x);
  - in substitution, forgetting du or keeping the old limits;
  - ∫x⁻¹dx=x⁰/0;
  - ∫1/x²dx=ln x²;
  - missing +C;
  - displacement confused with distance;
  - average value taken as (f(a)+f(b))/2.

### Gaps
- Not verified this session: Stewart chapters 1–5, Thomas, and MIT 18.01 contents.
- Calc I misconception research is unverified. To check: Tall & Vinner 1981 (concept image/definition, limits and continuity); Orton 1983 (differentiation; integration); Thompson 1994 (rate and the FTC); Oehrtman 2009 (limit metaphors); Zandieh 2000 (derivative framework); Epstein's Calculus Concept Inventory, 2013. No URLs could be retrieved, so these should not be cited until checked.
- Whether a given USU MATH 1210 section covers ε–δ formally is unknown; it depends on the syllabus.

## 3. MATH 1220 Calculus II: what is the complete content map?

### Takeaway
MATH 1220 corresponds to OpenStax Calc Vol. 2 chapters 2–7, plus USU's catalog-specific "introduction to vectors" (OS3 ch. 2):
- applications of integration, including physical applications and hyperbolic functions;
- techniques, including numerical integration with error bounds and improper integrals with comparison;
- a DE preview;
- sequences and series;
- power and Taylor series, including the Lagrange remainder and the binomial series;
- parametric, polar and conics.

Every "must-not-omit" Calc II topic named in the brief is fully present in OpenStax's source, as verified in the module text. Weight the course on three hard clusters:
- integration strategy;
- convergence reasoning;
- approximation with explicit error control (numerical rules, Taylor remainder, alternating and integral remainders).

### Cited Findings
- **OS2 chapter structure (module counts):** Integration 8 · Applications of Integration 10 · Techniques of Integration 8 · Introduction to Differential Equations 6 · Sequences and Series 7 · Power Series 5 · Parametric Equations and Polar Coordinates 6. That is an introduction plus 7/9/7/5/6/4/5 sections — [Calc v2 collection](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-2.collection.xml)
- **Placement of the hard sections.** Numerical Integration is §3.6 and Improper Integrals §3.7 (both in Techniques of Integration); Working with Taylor Series is §6.4 (after §6.3 Taylor and Maclaurin Series). The volume's scope is integration, differential equations, sequences and series, and parametric equations and polar coordinates — [OpenStax index](https://openstax.org/books/calculus-volume-2/pages/index); [OTL catalog TOC](https://oalib-perpustakaan.upi.edu/Record/OTLid0000370/TOC)
- **OS2 §3.6 Numerical Integration** — [module m53685](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53685/index.cnxml)
  - Its sections are The Midpoint Rule, The Trapezoidal Rule, Absolute and Relative Error, and Simpson's Rule.
  - The trapezoidal rule is the average of the left and right sums. It overestimates where f is concave up and underestimates where it is concave down; the midpoint rule is generally more accurate.
  - Error bounds:
    - midpoint: M(b−a)³/(24n²), with M=max|f″|;
    - trapezoidal: M(b−a)³/(12n²), with M=max|f″|;
    - Simpson: M(b−a)⁵/(180n⁴), with M=max|f⁽⁴⁾|. Simpson needs even n and is a weighted average of the midpoint and trapezoidal estimates.
  - Worked items:
    - ∫₀¹x²dx with n=4 gives M₄=21/64 and T₄=11/32;
    - S₂ is exact for ∫₀¹x³dx;
    - S₆ gives the arc length of y=½x² on [1,4] ≈8.14594;
    - an exercise finds the trapezoid n for error <0.0001 on ∫₁⁴(5x²+8)dx (answer 475).
- **OS2 §3.7 Improper Integrals** — [module m53686](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53686/index.cnxml)
  - Its sections are Integrating over an Infinite Interval, Integrating a Discontinuous Integrand, and A Comparison Theorem. The theorem: 0≤f≤g on [a,∞); if ∫g converges, ∫f converges; if ∫f diverges, ∫g diverges.
  - It uses Gabriel's horn (infinite area under 1/x on [1,∞) but finite volume π).
  - It also has an exponential-distribution traffic-accident opener.
- **OS2 §6.3 Taylor and Maclaurin Series** — [module m53817](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53817/index.cnxml)
  - It includes "Taylor's Theorem with Remainder" in Lagrange form: R_n(x)=f^{(n+1)}(c)/(n+1)!·(x−a)^{n+1}, with the bound M/(n+1)!·|x−a|^{n+1}.
  - The theorem is used both to estimate approximation error and to prove that a Taylor series converges to f.
  - Examples: ln x about 1; the Maclaurin polynomials of eˣ, sin x and cos x.
- **OS2 §6.4 Working with Taylor Series** — [module m53769](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53769/index.cnxml)
  - It contains The Binomial Series (for any real r, interval (−1,1), endpoint behavior depending on r; √1.5 approximated to third order with an error bound).
  - It contains Common Functions Expressed as Taylor Series (1/(1−x), eˣ, sin, cos, ln(1+x), arctan, (1+x)^r), with derived series such as cos√x and sinh x.
  - Its stated objectives include solving differential equations with Taylor series and evaluating nonelementary integrals.
- **OS2 §7.5 Conic Sections** — [module m53846](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53846/index.cnxml)
  - Sections: Parabolas, Ellipses, Hyperbolas, Eccentricity and Directrix, Polar Equations of Conic Sections, and General Equations of Degree Two.
  - Polar equations use the focal parameter p, in the form r=ep/(1±e cos θ) and its sin variant.
  - Rotation of axes uses cot 2θ=(A−C)/B, with a worked 60° example.
  - The discriminant test is written as **4AC−B²**: >0 ellipse, =0 parabola, <0 hyperbola.
  - Applications: Kepler's first law and whispering galleries; the reflective property of parabolas; comets fast enough to escape the Sun follow hyperbolic paths. Halley's comet is not used.
- **Stewart 9e** has §7.7 Approximate Integration (ch. 7, Techniques of Integration) and §8.2 Area of a Surface of Revolution (ch. 8, Further Applications of Integration) — [Loyola MATH 162](https://www.luc.edu/math/academics/courses/math162/); [Tennessee State MATH 1920](https://www.tnstate.edu/mathematics/MATH1920Syllabus.aspx)
- **A "10th edition" listing returned for the Stewart query** (ISBN 9780470647691) places numerical integration at 7.7, titled "Numerical Integration; Simpson's Rule", and surface of revolution at 6.5 — [Miami University store](https://campusstore.miamioh.edu/calculus-early-transcendentals-10th/bk/9780470647691)
- **A departmental Calc II syllabus at another university** (UGA MATH 2260) specifies numerical integration as "trapezoidal and Simpson's rules, with error bounds" and improper integrals over infinite intervals and with infinite discontinuities — [UGA MATH 2260 syllabus](https://math.franklin.uga.edu/sites/default/files/MATH2260_departmental_syllabus%2C%20effective%20Fall%202023.pdf)
- **USU MATH 1220 (4 cr).** "Integration, integration techniques, infinite series, introduction to vectors, and applications" — [MATH 1220 catalog](https://catalog.usu.edu/courses/MATH1220)
- **OS2 ch. 7 is shared.** It is the same module set as OS3 ch. 1, so polar, parametric and conics are also treated as a movable Calc II/III boundary topic — [v3 collection](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-3.collection.xml)

### Inferences
#### (1) Course identity
- USU MATH 1220 Calculus II (4 credits, QL).
- Standard equivalents:
  - OpenStax Vol. 2 ch. 2–7;
  - Stewart ch. 6–8, 10–11 (with ch. 9's DEs as a preview);
  - plus USU's "introduction to vectors", which matches OS3 §2.1–2.5 / Stewart ch. 12.
- The ISBN in the "10th edition" listing appears to be a Wiley title, probably Anton–Bivens–Davis, not Stewart. Treat it as a third textbook data point, not as Stewart.

#### (2) Major subjects
1. Applications of the definite integral (geometry and physics)
2. Hyperbolic functions
3. Integration techniques and strategy
4. Numerical integration with error bounds
5. Improper integrals
6. Introduction to differential equations [O at USU]
7. Sequences and series and convergence tests
8. Power, Taylor and binomial series with remainder estimates
9. Parametric and polar calculus
10. Conics
11. Introduction to vectors [USU]

#### (3) Module → submodule → lesson tree
- **C2-0 Integration review gate [C, diagnostic only]** [OS2 §1.1–1.7]
  - Re-test C1-5. Unlock only failed lessons.
- **C2-1 Applications of integration [C]** [OS2 §2.1–2.9; ST ch. 6, 8]
  - **1.1 Area between curves** [§2.1]. Lessons:
    - top-minus-bottom with intersections;
    - dy-slicing versus dx-slicing (choosing the variable);
    - regions that need splitting.
  - **1.2 Volumes by slicing; disks and washers** ×2 [§2.2]. Lessons:
    - known cross-sections (squares or semicircles on a base);
    - disks;
    - washers;
    - rotation about y=k or x=h.
  - **1.3 Cylindrical shells** [§2.3]. Lessons:
    - shell radius and height;
    - choosing shells versus washers.
  - **1.4 Arc length** [§2.4]. Lessons:
    - L=∫√(1+f′²)dx;
    - "most arc-length integrals are not elementary", which leads to Simpson's rule (link 2.6).
  - **1.5 Surface area of revolution [C, must-not-omit]** [§2.4; ST §8.2]. Lessons:
    - the frustum derivation S=2π∫f√(1+f′²)dx;
    - why 2π∫f dx is wrong (cylinder-band approximation);
    - rotation about the y-axis.
  - **1.6 Physical applications** ×2 [§2.5]. Lessons:
    - mass from linear and radial density;
    - work: springs (Hooke's law);
    - work: lifting cables or chains and pumping liquids;
    - hydrostatic force on a plate (p=ρgh strips).
  - **1.7 Moments and centers of mass** [§2.6]. Lessons:
    - discrete systems in 1-D and 2-D;
    - centroids of laminae (symmetry shortcuts);
    - Pappus' theorem [O].
  - **1.8 Logarithm defined as an integral** [§2.7] [O-rigor]. Lessons:
    - ln x:=∫₁ˣdt/t;
    - e and exp as its inverse.
  - **1.9 Exponential growth and decay** [§2.8]. Lessons:
    - doubling time and half-life;
    - Newton's law of cooling (links to C2-3/DE-2).
  - **1.10 Hyperbolic functions [C, must-not-omit]** [§2.9; OS1 §6.9]. Lessons:
    - definitions and the identity cosh²−sinh²=1 (the unit hyperbola);
    - derivatives and integrals;
    - inverse hyperbolic functions as logarithms;
    - the catenary;
    - rapidity [E-GR]: a Lorentz boost written with cosh φ=γ and sinh φ=γβ.
- **C2-2 Techniques of integration [C]** [OS2 §3.1–3.7; ST ch. 7]
  - **2.1 Integration by parts** ×2 [§3.1]. Lessons:
    - derived from the product rule;
    - choosing u (LIATE as a heuristic, not a law);
    - definite-integral form;
    - tabular and repeated parts;
    - cyclic integrals (eˣ sin x);
    - reduction formulas [O].
  - **2.2 Trigonometric integrals** [§3.2]. Lessons:
    - sin^m cos^n with an odd power;
    - both powers even (power reduction);
    - tan^m sec^n, and ∫sec x and ∫sec³x;
    - sin(mx)cos(nx) by product-to-sum (a seed for Fourier orthogonality).
  - **2.3 Trigonometric substitution** [§3.3]. Lessons:
    - √(a²−x²), √(a²+x²), √(x²−a²) and the reference triangle for back-substitution;
    - completing the square first;
    - hyperbolic substitution as an alternative [O].
  - **2.4 Partial fractions** [§3.4]. Lessons:
    - distinct linear factors;
    - repeated linear factors;
    - irreducible quadratics;
    - improper rational functions (divide first).
  - **2.5 Strategy, tables and CAS** [§3.5]. Lessons:
    - a decision procedure;
    - using tables;
    - checking CAS output by differentiation.
  - **2.6 Numerical integration [C, must-not-omit]** ×2 [§3.6; ST §7.7]. Lessons:
    - midpoint and trapezoidal rules (concavity predicts over- or underestimation);
    - Simpson's rule (parabolic arcs; even n);
    - absolute and relative error;
    - **error bounds** and choosing n for a tolerance;
    - order of accuracy (error ∝1/n² versus 1/n⁴; log-log slope).
  - **2.7 Improper integrals [C, must-not-omit]** ×2 [§3.7]. Lessons:
    - infinite intervals;
    - infinite discontinuities, including interior ones;
    - the p-integral benchmarks ∫₁^∞x^{−p} and ∫₀¹x^{−p};
    - the **comparison theorem** (and limit comparison [O]);
    - Gabriel's horn paradox;
    - escape velocity and potential energy (∫_R^∞GMm/r²dr) [physics];
    - probability densities [O];
    - Laplace-transform preview [E → DE-6].
- **C2-3 Introduction to differential equations [O at USU: not in the 1220 description; preview only]** [OS2 §4.1–4.5; ST ch. 9]. Lessons:
  - what a DE and a solution are (verify by substitution);
  - direction fields;
  - Euler's method;
  - separable equations;
  - the logistic equation;
  - first-order linear equations (integrating factor).
  - These link forward to DE-2 / P-1, where mastery is assessed.
- **C2-4 Sequences and series [C]** [OS2 §5.1–5.6; ST ch. 11]
  - **4.1 Sequences** [§5.1]. Lessons:
    - limits of sequences;
    - monotone bounded convergence;
    - recursive sequences;
    - ε–N [O].
  - **4.2 Series** [§5.2]. Lessons:
    - partial sums as a sequence;
    - geometric series;
    - telescoping series;
    - the harmonic series diverges.
  - **4.3 Divergence and integral tests** [§5.3]. Lessons:
    - the nth-term test (one-way logic);
    - the integral test and p-series;
    - the integral remainder bound ∫_{n+1}^∞f ≤ R_n ≤ ∫_n^∞f.
  - **4.4 Comparison tests** [§5.4]. Lessons:
    - direct comparison;
    - limit comparison.
  - **4.5 Alternating series** [§5.5]. Lessons:
    - the alternating series test (both conditions);
    - the remainder bound |R_n|≤b_{n+1};
    - absolute versus conditional convergence;
    - Riemann rearrangement [E].
  - **4.6 Ratio and root tests; strategy** [§5.6]. Lessons:
    - the ratio test (L=1 is inconclusive);
    - the root test;
    - test-selection strategy ×2.
- **C2-5 Power and Taylor series [C]** [OS2 §6.1–6.4; ST §11.8–11.11]
  - **5.1 Power series** [§6.1]. Lessons:
    - radius and interval of convergence (the ratio test, then checking endpoints);
    - functions as geometric-series variants.
  - **5.2 Properties** [§6.2]. Lessons:
    - term-by-term differentiation and integration (the radius is preserved; endpoints can change);
    - series for ln(1+x) and arctan x.
  - **5.3 Taylor and Maclaurin series** ×2 [§6.3]. Lessons:
    - coefficients from derivatives (uniqueness);
    - Taylor polynomials (degree versus number of nonzero terms);
    - **Taylor's theorem with Lagrange remainder [must-not-omit]**;
    - proving that eˣ, sin and cos equal their series.
  - **5.4 Working with Taylor series** ×2 [§6.4]. Lessons:
    - **the binomial series [must-not-omit]**;
    - the standard series table and building new series by substitution and multiplication;
    - nonelementary integrals (∫e^{−x²});
    - series solutions of DEs [O preview → DE-7];
    - Euler's formula from series [C-physics].
  - **5.5 Why the radius of convergence is what it is [E].** 1/(1+x²) has R=1 because of the complex singularities at ±i.
- **C2-6 Parametric, polar and conics [C per brief; USU placement unconfirmed]** [OS2 §7.1–7.5 = OS3 ch. 1; ST ch. 10]
  - **6.1 Parametric curves** [§7.1]. Lessons:
    - tracing and orientation;
    - eliminating the parameter;
    - the cycloid.
  - **6.2 Calculus of parametric curves** [§7.2]. Lessons:
    - dy/dx=(dy/dt)/(dx/dt) and d²y/dx²;
    - area under a parametric curve;
    - arc length and speed;
    - surface area [O].
  - **6.3 Polar coordinates** [§7.3]. Lessons:
    - plotting and converting;
    - families of curves (roses, cardioids, limaçons, spirals);
    - symmetry tests.
  - **6.4 Polar area and arc length [C, must-not-omit]** ×2 [§7.4]. Lessons:
    - A=½∫r²dθ;
    - area between polar curves (intersection pitfalls, including the pole);
    - polar arc length;
    - Kepler's second law as dA/dt=½r²θ̇ [physics].
  - **6.5 Conic sections [C, must-not-omit]** ×2 [§7.5]. Lessons:
    - focus–directrix definitions and standard forms;
    - eccentricity e=c/a;
    - polar form r=ep/(1±e cos θ);
    - the general second-degree equation, rotation of axes and the discriminant;
    - orbits (Kepler I; e<1 bound, e≥1 escape) [physics].
- **C2-7 Introduction to vectors [USU]** [OS3 §2.1–2.5; ST ch. 12]. Lessons:
  - vectors in 2-D and 3-D;
  - the dot product, projections and work;
  - the cross product, torque and area;
  - lines and planes [O, may sit in 2210].
  - The MATH 2210 tree treats this module as its gate (C3-1).

#### (4) Mathematical skills needed
- Fluent differentiation and substitution.
- Algebra of rational functions (partial fractions).
- Trig identities (power reduction, Pythagorean substitutions).
- Inequality reasoning (comparison and bounding).
- Limits at infinity and growth rates.
- Setting up an integral from a "slice, approximate, sum" model.
- Factorial and index manipulation.

#### (5) Prerequisite knowledge
- C1 in full, especially FTC, substitution, L'Hôpital and growth rates.
- M0-8 identities.
- M0-11 conics.
- M0-12 geometric series.

#### (6) Foundational ideas rarely stated in catalog descriptions
- **The slice–approximate–integrate paradigm.** Every application (volume, work, force, mass, moment) is "Riemann sum of a local linear model → integral". Learners should derive the integral, not memorize formulas.
- **Approximation with certified error.** Numerical rules, Taylor polynomials and the alternating and integral remainders all answer "how wrong can this be?".
- **A series is the limit of its partial sums.** Sequence convergence and series convergence are different questions.
- **Convergence tests are comparisons to benchmark series** (geometric, p-series).
- **A power series is a function with a domain.**
- **Parametrization is a choice; geometry is not.** The same curve can carry different parametrizations, a seed of reparametrization invariance in GR.
- **Hyperbolic functions are the "circular functions" of the hyperbola x²−y²=1.**

#### (7) Problem-solving techniques and archetypes
- **C2-1 Applications:**
  - (a) area between y=x² and y=x+2, by dx and by dy;
  - (b) the region under √x on [0,4] rotated about y=−1 (washers) and about x=5 (shells);
  - (c) surface area of y=√x on [0,1] about the x-axis;
  - (d) work to pump water out of an inverted cone over a 1 m spout; a leaking bucket on a rope;
  - (e) hydrostatic force on a submerged triangular plate;
  - (f) centroid of a semicircular lamina; the volume of a torus by Pappus;
  - (g) arc length of the catenary y=a cosh(x/a).
- **C2-2 Techniques:**
  - (a) ∫x e^{2x}dx, ∫ln x dx, ∫eˣcos x dx;
  - (b) ∫sin³x cos²x dx, ∫sec³x dx;
  - (c) ∫dx/(x²√(x²+4));
  - (d) ∫(3x+5)/((x−1)(x+2)²)dx;
  - (e) a mixed "which technique?" set;
  - (f) find n so that the trapezoidal error is <10⁻⁴ (OpenStax: ∫₁⁴(5x²+8)dx → n=475); show Simpson is exact for cubics;
  - (g) ∫₁^∞dx/x^p; ∫₀¹dx/√x; the trap ∫₋₁¹dx/x²; comparison for ∫₁^∞e^{−x²}dx and ∫₁^∞(1+sin²x)/√x dx.
- **C2-4 Series:**
  - (a) lim(1+2/n)ⁿ;
  - (b) the telescoping sum Σ1/(n(n+1));
  - (c) a repeating decimal as a geometric series;
  - (d) choose and apply a test: Σn/(n³+1), Σ(−1)ⁿ/√n, Σn!/nⁿ, Σ1/(n ln n);
  - (e) estimate Σ1/n³ to 10⁻³ with the integral remainder.
- **C2-5 Power and Taylor series:**
  - (a) interval of convergence of Σ(x−2)ⁿ/(n3ⁿ) with endpoint analysis;
  - (b) arctan series and π/4;
  - (c) ∫₀¹e^{−x²}dx to 10⁻⁴ via series and the alternating-series bound;
  - (d) the Lagrange bound: degree of sin x needed for 10⁻⁶ at x=0.5;
  - (e) √1.5 by the binomial series with an error bound (OpenStax);
  - (f) relativistic KE=(γ−1)mc²≈½mv²+⅜mv⁴/c².
- **C2-6 Parametric, polar and conics:**
  - (a) the tangent line to a cycloid; the arc length of one arch (8r);
  - (b) the area of the cardioid r=1+cos θ (3π/2); one petal of r=sin 3θ; the area inside r=3sin θ and outside r=1+sin θ;
  - (c) classify r=4/(1+2cos θ) (a hyperbola, e=2);
  - (d) rotate away the xy-term of x²+xy+y²=1 and classify with 4AC−B²;
  - (e) from perihelion and aphelion distances, find e and the polar orbit equation.

#### (8) Interactive visualization ideas
- **Solid-of-revolution builder.**
  - Draws: a region, an axis, and a rotating 3-D solid with a highlighted slice (disk, washer or shell) whose volume element is shown symbolically.
  - Learner controls: region curves; the axis (y=k or x=h); disk/washer/shell; n slices.
  - Teaches: choosing the method; radius and height bookkeeping.
  - Simplified: a faceted rendering.
- **Surface-area trap demo.**
  - Draws: a rotated curve approximated by cylinder bands and, alternatively, by frustum bands. A numeric readout shows both converging.
  - Teaches: why ds rather than dx. The cylinder bands converge to the wrong value.
- **Work rig.**
  - Draws: a tank (cylinder, cone or trough) with a liquid level and a spout height; an animated slab rising, with its work contribution added to a running total.
  - Learner controls: tank shape, fill level, spout height, density.
  - Teaches: distance moved varies by slice.
- **Hydrostatic plate.**
  - Draws: a plate shape and depth in a water tank, with a pressure-strip heat map.
  - Teaches: force = ∫ρg·depth·width d(depth).
- **Balance lamina.**
  - Draws: an editable polygonal or curve-bounded plate on a pin at the computed centroid.
  - Teaches: moments; symmetry; Pappus.
- **Circle-versus-hyperbola functions.**
  - Draws: a point on the unit hyperbola with the hyperbolic sector area u shaded, linked to the graphs of cosh u and sinh u. A Minkowski-diagram toggle shows a boost as a "hyperbolic rotation" [E].
  - Teaches: the identity cosh²−sinh²=1; rapidity adds where velocity does not.
- **Integration-strategy navigator.**
  - Draws: an integrand card; the learner picks a technique and the app shows the resulting integral, with dead ends allowed.
  - Teaches: strategy as search.
- **Numerical-integration error lab.**
  - Draws: midpoint, trapezoid and Simpson approximations shaded on f; a log-log error-versus-n plot showing slopes −2 and −4; the error-bound curve overlaid.
  - Learner controls: f, [a,b], n.
  - Teaches: order of accuracy; how conservative a bound is.
- **Improper-integral tails.**
  - Draws: 1/x^p with a slider for p and a sliding upper limit b; the area readout either converging or diverging. A 3-D Gabriel's-horn mode shows finite volume with infinite area.
  - Teaches: the p-benchmarks; the comparison theorem (overlay f≤g).
- **Partial-sums plotter.**
  - Draws: terms as bars and partial sums as dots, against the limit line; side-by-side harmonic versus alternating harmonic; a rearrangement demo [E].
  - Teaches: aₙ→0 is not enough; conditional convergence.
- **Taylor approximator.**
  - Draws: f, Taylor polynomials p_n about a, the actual error |f−p_n|, and the Lagrange-bound envelope; for 1/(1+x²), divergence beyond |x|=1, with an optional complex-plane inset showing the poles at ±i.
  - Learner controls: f, center a, degree n.
  - Teaches: local versus global approximation; how sharp the remainder bound is; the radius of convergence.
- **Relativity series slider.**
  - Draws: γ(v), its expansion 1+v²/2c²+…, and kinetic energy curves.
  - Learner controls: v/c and the expansion order.
  - Teaches: binomial-series validity (|v/c|<1); the classical limit.
- **Polar sweep.**
  - Draws: r(θ) traced as θ sweeps, with area wedges ½r²Δθ accumulating; Kepler mode with a planet on an orbit of chosen eccentricity, equal-time wedges of equal area.
  - Teaches: polar area; Kepler II.
  - Simplified: a two-body, Newtonian orbit.
- **Conic morpher.**
  - Draws: r=ep/(1+e cos θ) with the focus at the origin and the directrix shown.
  - Learner controls: an eccentricity slider from 0 to 2; a "energy" mode linking e to orbit energy.
  - Teaches: one family covers ellipse, parabola and hyperbola; bound versus escape orbits.
- **Cycloid generator.**
  - Draws: a rolling wheel tracing a point, with velocity vectors.
  - Teaches: parametric derivatives; zero speed at the cusps.

#### (9) Connections to physics and onward to tensors/GR
- **Work–energy, springs, pumping, hydrostatics, center of mass, and single-variable moments of inertia** (rods; disks by shells). These are the calculus core of Physics I.
- **Improper integrals → gravitational potential −GMm/r and escape velocity.** Probability densities preview |ψ|² in quantum mechanics.
- **Taylor and binomial series → the language of physical approximation:**
  - sin θ≈θ;
  - g(h)≈g(1−2h/R);
  - γ≈1+v²/2c²;
  - dipole fields;
  - the GR weak-field metric g_tt≈−(1+2Φ/c²).
  - Perturbation theory is "keep the first few Taylor terms".
- **Euler's formula → phasors, AC circuits, and complex solutions of oscillator ODEs (DE-3).**
- **Hyperbolic functions → special relativity.**
  - Lorentz boosts are hyperbolic rotations: x′=x cosh φ−ct sinh φ.
  - A uniformly accelerated worldline is x²−c²t²=(c²/a)², i.e. x=(c²/a)cosh(aτ/c) (Rindler/"hyperbolic motion") [E].
  - The catenary appears in cable statics.
- **Conics, polar area and orbits.**
  - Kepler I (orbit = conic with the Sun at a focus).
  - Kepler II (polar area rate = L/2m).
  - Escape on parabolic or hyperbolic paths.
  - GR's perihelion precession appears as a slowly rotating ellipse, r=p/(1+e cos((1−δ)θ)) [E; derived in DE-5/§9].
- **Arc length and parametrized curves → proper length, worldlines, and reparametrization by proper time τ.**

#### (10) Appropriate depth and rigor
- **Standard:**
  - convergence tests applied *with stated justification* (hypotheses checked);
  - Taylor remainder used rigorously to bound errors and prove convergence for eˣ, sin and cos;
  - error bounds for numerical rules applied, not derived (derivation [E]).
- **Excluded:**
  - uniform convergence and term-by-term theorems' proofs [E];
  - ε–N [O].
- **Atlas emphasis:** derivation of application integrals from slicing; strategy over memorization.

#### (11) Common misconceptions and error patterns
- **Applications:**
  - S=2π∫f dx (missing √(1+f′²));
  - shell radius measured from the origin when the axis is x=h;
  - washer volume computed as π(R−r)² instead of π(R²−r²);
  - work: treating all liquid as lifted the same distance;
  - hydrostatics: using height from the bottom instead of depth;
  - center of mass: dividing by area when density varies.
- **Techniques:**
  - integration-by-parts sign slips;
  - u chosen so that ∫v du is harder;
  - dropping |·| in ln|x|;
  - trig substitution not converted back (θ left in the answer) or with a wrong triangle;
  - wrong partial-fraction form (A/(x+2)² without B/(x+2); Bx+C over an irreducible quadratic written as B);
  - forgetting long division for improper rational functions.
- **Numerical:**
  - "the trapezoid always overestimates";
  - "Simpson works with odd n";
  - error bound computed with max|f″| for Simpson (it needs f⁽⁴⁾);
  - doubling n is thought to halve the Simpson error (actually ÷16).
- **Improper integrals:**
  - ∫₋₁¹dx/x²=−2 (ignoring the interior discontinuity);
  - ∫₋∞^∞x dx=0 "by symmetry" (confusing it with a principal value);
  - reversed comparison logic (if the bigger converges, so does the smaller — correct; but "if the smaller converges, the bigger converges" is false).
- **Series:**
  - "aₙ→0 ⇒ Σaₙ converges";
  - confusing the sequence of terms with the sequence of partial sums;
  - ratio-test L=1 taken as divergence;
  - the alternating series test applied without decreasing terms;
  - "absolutely convergent" confused with "convergent";
  - Σ1/n^p converges for p≥1 (p=1 is wrong);
  - the geometric sum computed as 1/(1−r) when the first term ≠1.
- **Power and Taylor series:**
  - endpoints not checked;
  - the radius taken from L=|x|;
  - missing factorials;
  - "degree-n Taylor polynomial has n terms";
  - Lagrange bound using the n-th instead of the (n+1)-th derivative, or bounding |f^{(n+1)}| at the wrong point;
  - binomial coefficients for non-integer r computed as integers;
  - applying a series outside its interval (γ expansion at v>c).
- **Parametric and polar:**
  - dy/dx=(dx/dt)/(dy/dt);
  - d²y/dx²=(d²y/dt²)/(d²x/dt²);
  - A=½∫r dθ, or ∫r²dθ without ½;
  - integrating over 2π for r=sin 3θ (double counting);
  - missing intersections at the pole;
  - conic discriminant sign convention confusion (OpenStax's 4AC−B²>0 is the same test as the common B²−4AC<0);
  - "e>1 means a bigger ellipse".

### Gaps
- Not verified this session:
  - the full Stewart 9e table of contents (only §7.7 and §8.2);
  - Thomas;
  - MIT 18.01's second half;
  - the AP Calculus BC Course and Exam Description (relevant to which Calc II topics a high-school BC student has seen).
- USU MATH 1220's ordering is unconfirmed: whether polar, parametric and conics are taught at all (the catalog description does not name them), and whether a DE preview is included.
- Series-misconception research (e.g., work on Taylor-series convergence images) could not be retrieved, so the series distractors above are practice-derived, not research-cited.

## 4. MATH 2210 Multivariable Calculus: what is the complete content map?

### Takeaway
MATH 2210 corresponds to OpenStax Calc Vol. 3 chapters 2–6. USU's description emphasizes partial derivatives, optimization, multiple integrals, vector fields, line and surface integrals, and the theorems of Green, Gauss and Stokes. The 3-D vector basics may already be covered in USU's MATH 1220 ("introduction to vectors"). Vector-valued functions, curvature and motion are standard in every textbook but are not named in USU's description, so their USU placement needs a syllabus check.

For a learner heading to GR, this course is where the first real geometric objects appear:
- line elements and Jacobians;
- the gradient as a covector;
- curvature of curves;
- the Laplacian and Poisson's equation;
- the unified "boundary integral = interior derivative" pattern behind Green, Stokes and Gauss.

### Cited Findings
- **OS3 structure (module counts):** Parametric Equations and Polar Coordinates 6 (shared with OS2 ch. 7) · Vectors in Space 8 · Vector-Valued Functions 5 · Differentiation of Functions of Several Variables 9 · Multiple Integration 8 · Vector Calculus 9 · Second-Order Differential Equations 5. That is an introduction plus 5/7/4/8/7/8/4 sections — [Calc v3 collection](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-3.collection.xml)
- **Numbering of the last sections.** The book's own TOC places "The Divergence Theorem" at §6.8 (p. 722) and "Series Solutions of Differential Equations" at §7.4 (p. 786). An Open Textbook Library catalog record numbers them 6.9 and 7.5 — [OTL v3 record](https://oalib-perpustakaan.upi.edu/Record/OTLid0000371/TOC); [OpenStax v3 preface](https://openstax.org/books/calculus-volume-3/pages/preface)
- **USU MATH 2210 (3 cr).** "Builds on MATH 1210 and 1220: partial derivatives, optimization of functions of several variables, multiple integrals, vector fields including line and surface integrals, and the theorems of Green, Gauss and Stokes" — [MATH 2210 catalog](https://catalog.usu.edu/courses/MATH2210)
- **USU MATH 1220 includes "introduction to vectors"** — [MATH 1220 catalog](https://catalog.usu.edu/courses/MATH1220)

### Inferences
#### (1) Course identity
- USU MATH 2210 Multivariable Calculus (3 credits, QI).
- Standard equivalents: OpenStax Vol. 3 ch. 2–6; Stewart ch. 12–16 (from general knowledge; unverified this session); MIT 18.02 (unverified).
- Three credits is lean for this scope. Expect the vector basics to be fast review, given USU's 1220 coverage.

#### (2) Major subjects
1. 3-D vectors and geometry of space
2. Vector-valued functions and motion
3. Partial derivatives, gradient and directional derivatives
4. Optimization, including Lagrange multipliers
5. Double and triple integrals in Cartesian, polar, cylindrical and spherical coordinates, with applications to mass and inertia
6. Change of variables and Jacobians
7. Vector fields and line integrals
8. Conservative fields
9. Divergence and curl
10. Surface integrals and flux
11. Green's, Stokes' and the Divergence (Gauss) theorems

#### (3) Module → submodule → lesson tree
- **C3-0 Gate [C, diagnostic only].** Re-test the C2-6 parametric/polar and C2-7 vector lessons. OS3 ch. 1 is the same module set as OS2 ch. 7.
- **C3-1 Vectors & geometry of space [C; partly USU 1220]** [OS3 §2.1–2.7]
  - **1.1 3-D coordinates & vectors** [§2.1–2.2]. Lessons:
    - right-handed axes, distance and spheres;
    - component algebra and unit vectors.
  - **1.2 Dot product** [§2.3]. Lessons:
    - angle and orthogonality;
    - scalar and vector projections;
    - work W=F·d;
    - direction cosines [O].
  - **1.3 Cross product** [§2.4]. Lessons:
    - definition via a determinant, and the right-hand rule;
    - |a×b| as parallelogram area;
    - torque τ=r×F and angular momentum L=r×p;
    - the triple scalar product (volume, coplanarity).
  - **1.4 Lines & planes** [§2.5]. Lessons:
    - vector, parametric and symmetric lines;
    - a plane from a point and a normal;
    - intersections and angles;
    - distances (point–plane, skew lines).
  - **1.5 Quadric surfaces & cylinders** [§2.6]. Lessons:
    - traces;
    - the six quadric types.
  - **1.6 Cylindrical & spherical coordinates** [§2.7]. Lessons:
    - conversions and coordinate surfaces;
    - **the math-versus-physics convention** for which angle is θ and which is φ [C, a concrete pitfall].
- **C3-2 Vector-valued functions & motion [C; USU placement unconfirmed]** [OS3 §3.1–3.4]
  - **2.1 Space curves** [§3.1]. Lessons:
    - vector functions (helix; curves of intersection).
  - **2.2 Calculus of vector functions** [§3.2]. Lessons:
    - derivative as tangent vector;
    - product rules for dot and cross products;
    - integrals (recovering r from a).
  - **2.3 Arc length & curvature** ×2 [§3.3]. Lessons:
    - arc-length parametrization;
    - the unit tangent T and normal N;
    - curvature κ=|T′|/|r′|=|r′×r″|/|r′|³;
    - the osculating circle;
    - the binormal, torsion and Frenet–Serret [O/E].
  - **2.4 Motion in space** ×2 [§3.4]. Lessons:
    - velocity, speed and acceleration;
    - tangential and normal components (a_T=d|v|/dt, a_N=κ|v|²);
    - projectile and circular motion;
    - central forces give planar motion and equal areas (Kepler II from r×v=const) [E; Stewart includes a Kepler derivation (unverified)].
- **C3-3 Partial derivatives & optimization [C]** [OS3 §4.1–4.8]
  - **3.1 Functions of several variables** [§4.1]. Lessons:
    - graphs;
    - level curves and contour maps;
    - level surfaces.
  - **3.2 Limits & continuity** [§4.2]. Lessons:
    - limits that depend on the path (lines y=mx, parabolas);
    - the polar-substitution technique;
    - continuity.
  - **3.3 Partial derivatives** [§4.3]. Lessons:
    - definition and slopes of traces;
    - higher-order partials and Clairaut's theorem;
    - PDE previews (heat, wave, Laplace equations).
  - **3.4 Tangent planes & linear approximation** ×2 [§4.4]. Lessons:
    - the tangent plane;
    - linearization and differentials;
    - **multivariable error propagation** (e.g., g=4π²L/T²) [physics];
    - differentiability is stronger than "the partials exist".
  - **3.5 Chain rule** ×2 [§4.5]. Lessons:
    - tree diagrams (one and two independent parameters);
    - implicit differentiation;
    - the Jacobian-matrix form, chain rule = matrix product [E → LA-4].
  - **3.6 Directional derivatives & gradient** ×2 [§4.6]. Lessons:
    - D_u f=∇f·u (u a unit vector);
    - steepest ascent and its rate |∇f|;
    - ∇f is perpendicular to level curves and surfaces;
    - tangent planes to level surfaces.
  - **3.7 Extrema** ×2 [§4.7]. Lessons:
    - critical points;
    - the second-derivative test D=f_xx f_yy−f_xy²;
    - the Hessian-eigenvalue view [E → LA-11];
    - absolute extrema on closed, bounded regions (boundary parametrization).
  - **3.8 Lagrange multipliers** ×2 [§4.8]. Lessons:
    - the geometry ∇f=λ∇g (tangency of a level curve to the constraint);
    - one constraint;
    - two constraints [O].
- **C3-4 Multiple integrals [C]** [OS3 §5.1–5.7]
  - **4.1 Double integrals over rectangles** [§5.1]. Lessons:
    - Riemann sums;
    - Fubini's theorem;
    - average value.
  - **4.2 General regions** ×2 [§5.2]. Lessons:
    - type I and type II regions;
    - **reversing the order of integration** (∫₀¹∫_y¹e^{x²}dx dy).
  - **4.3 Polar double integrals** [§5.3]. Lessons:
    - dA=r dr dθ;
    - the Gaussian integral ∫e^{−x²}dx=√π.
  - **4.4 Triple integrals** [§5.4]. Lessons:
    - boxes and general regions;
    - choosing among the six orders.
  - **4.5 Cylindrical & spherical triple integrals** ×2 [§5.5]. Lessons:
    - dV=r dz dr dθ;
    - dV=ρ²sin φ dρ dφ dθ (derivation from a "box").
  - **4.6 Mass, center of mass & moment of inertia** ×2 [§5.6]. Lessons:
    - laminae and solids with variable density;
    - I=∫r_⊥²dm for a disk, sphere and cylinder;
    - the parallel-axis theorem [O];
    - joint probability densities [O].
  - **4.7 Change of variables** ×2 [§5.7]. Lessons:
    - transformations of the plane;
    - the Jacobian determinant |∂(x,y)/∂(u,v)| (link LA-8);
    - deriving the polar and spherical factors;
    - ellipse and parallelogram regions.
  - **4.8 Surface area of graphs and parametric surfaces** [OS3 places this in §6.6].
- **C3-5 Vector calculus [C]** [OS3 §6.1–6.8]
  - **5.1 Vector fields** [§6.1]. Lessons:
    - plotting fields;
    - radial and inverse-square fields;
    - gradient fields;
    - flow lines.
  - **5.2 Line integrals** ×2 [§6.2]. Lessons:
    - scalar ∫f ds (mass of a wire);
    - vector ∫F·dr (work, circulation);
    - flux across a plane curve;
    - independence of parametrization but dependence on orientation.
  - **5.3 Conservative fields** ×2 [§6.3]. Lessons:
    - the fundamental theorem for line integrals;
    - path independence ⇔ zero closed-loop circulation;
    - finding potentials;
    - the mixed-partials test **and the simply-connected caveat** (vortex field (−y,x)/(x²+y²) has circulation 2π);
    - conservation of energy [physics].
  - **5.4 Green's theorem** ×2 [§6.4]. Lessons:
    - circulation form;
    - flux form;
    - area as a line integral (the planimeter);
    - regions with holes.
  - **5.5 Divergence & curl** ×2 [§6.5]. Lessons:
    - definitions;
    - physical meaning (flux density, circulation density, paddle-wheel picture);
    - identities curl(∇f)=0 and div(curl F)=0;
    - the Laplacian ∇².
  - **5.6 Surface integrals** ×3 [§6.6]. Lessons:
    - parametric surfaces;
    - surface area;
    - scalar surface integrals;
    - orientation and flux ∬F·dS.
  - **5.7 Stokes' theorem** [§6.7]. Lessons:
    - statement and orientation (right-hand rule);
    - surface independence ("butterfly nets");
    - Faraday's and Ampère's laws [physics].
  - **5.8 Divergence theorem** [§6.8]. Lessons:
    - statement;
    - Gauss's law for a point charge (flux independent of the surface);
    - the continuity equation;
    - sources and sinks.
  - **5.9 One theorem in four costumes [E]:**
    - FTC, the gradient theorem, Green/Stokes and Gauss as ∫_∂M ω=∫_M dω (a differential-forms preview);
    - grad, div and curl in curvilinear coordinates via scale factors.
- **C3-6 Second-order linear ODEs [O for 2210]** [OS3 §7.1–7.4]
  - Cross-list only; taught in DE-3 / P-5.

#### (4) Mathematical skills needed
- 3-D visualization.
- Vector algebra.
- Parametrizing curves, surfaces and regions.
- Setting integration limits.
- Determinants (cross products, Jacobians).
- Multivariable chain-rule bookkeeping.
- Orientation reasoning (right-hand rule).

#### (5) Prerequisite knowledge
- C1, and C2 especially substitution, polar and parametric curves, arc length and C2-7 vectors.
- 2×2 and 3×3 determinants (LA-8 basics). These can be taught just-in-time if LA comes later; USU's degree map places 2210 before or alongside 2270, per the companion notes.

#### (6) Foundational ideas rarely stated in catalog descriptions
- **The derivative of a map ℝⁿ→ℝᵐ is a linear map (the Jacobian matrix).** Gradient, chain rule and change of variables are all faces of this. Textbooks at this level rarely say it, and it is the bridge to tangent spaces.
- **Coordinates are maps and have scale factors.** dA=r dr dθ is a Jacobian. The line element ds²=dr²+r²dθ² is the first metric a learner meets.
- **Orientation is part of the data** of curves and surfaces. Signs in flux and circulation are not bookkeeping noise.
- **Scalar fields and vector fields are different kinds of objects.** ∇f comes from df (a covector) via the dot product, a GR distinction.
- **Topology matters.** Simply-connected domains decide whether curl-free implies conservative.
- **The four integral theorems share one structure:** boundary integral = integral of the derivative over the interior.

#### (7) Problem-solving techniques and archetypes
- **C3-1:**
  - (a) the angle between two cube diagonals; work along a ramp;
  - (b) torque on a wrench; the area of the triangle through 3 points; the volume of a parallelepiped;
  - (c) the line of intersection of two planes; the distance from a point to a plane;
  - (d) identify x²−y²+z²=1 by its traces;
  - (e) convert ρ=2cos φ to Cartesian form.
- **C3-2:**
  - (a) velocity, acceleration and speed on a helix;
  - (b) reparametrize the helix by arc length;
  - (c) the curvature of y=x² at the vertex, and the osculating circle;
  - (d) decompose a projectile's acceleration into a_T and a_N;
  - (e) show that a central force gives constant r×v.
- **C3-3:**
  - (a) level curves of x²−y² (saddle);
  - (b) show lim xy/(x²+y²) does not exist;
  - (c) linearize √(x²+y²) at (3,4) to estimate f(3.02,3.97); propagate the uncertainty in g=4π²L/T²;
  - (d) dz/dt by the chain rule; ∂z/∂s in a polar change of variables;
  - (e) steepest-ascent direction on a terrain map; the tangent plane to x²+y²+z²=14 at (1,2,3);
  - (f) classify the critical points of x³−3xy+y³;
  - (g) Lagrange multipliers: the largest box inscribed in an ellipsoid; the closest point on a plane.
- **C3-4:**
  - (a) reverse the order of ∫₀¹∫_y¹e^{x²}dx dy;
  - (b) the Gaussian integral via polar coordinates;
  - (c) the volume of an ice-cream cone in spherical coordinates; the mass of a variable-density ball;
  - (d) the moment of inertia of a solid sphere (2/5 MR²); of a cylinder about its axis;
  - (e) the area of an ellipse via u=x/a, v=y/b; an integral over a parallelogram via u=x+y, v=x−y.
- **C3-5:**
  - (a) find the potential of F=(2xy+z, x², x); evaluate ∫F·dr along any path;
  - (b) the circulation of the vortex field around the unit circle (2π, despite zero curl);
  - (c) the area of an ellipse via ½∮(x dy−y dx);
  - (d) div and curl of r/|r|³ (zero away from the origin);
  - (e) the flux of F=(x,y,z) through a sphere (direct, and by Gauss); through a paraboloid cap, with orientation;
  - (f) Stokes: the circulation around a circle equals the flux of the curl through a hemisphere or through a disk;
  - (g) derive the continuity equation ∂ρ/∂t+∇·(ρv)=0 from the divergence theorem.

#### (8) Interactive visualization ideas
- **3-D vector sandbox.**
  - Draws: vectors a and b, the projection "shadow" of a on b, the cross product with its parallelogram, a right-hand-rule cue, and a wrench-torque mode.
  - Learner controls: drag the arrowheads; rotate the camera.
  - Teaches: the dot product as projection; the cross product's direction and magnitude.
  - Simplified: rigid-body intuition only.
- **Quadric explorer.**
  - Draws: a surface with movable trace planes; trace curves projected onto the coordinate planes.
  - Teaches: recognizing surfaces from equations.
- **Frenet frame rider.**
  - Draws: a space curve with a moving T–N–B frame and the osculating circle; curvature and speed readouts; an acceleration split into a_T and a_N.
  - Learner controls: the curve (helix pitch, a knot), the parameter speed.
  - Teaches: curvature is geometric, but a_N=κv² depends on speed.
- **Contour–surface linked view.**
  - Draws: a contour map and a 3-D surface, linked; gradient arrows on the map; a compass dial for a unit direction u showing D_u f=|∇f|cos θ.
  - Teaches: ∇f is perpendicular to the contours; the directional derivative is a cosine projection.
- **Path-limit tester.**
  - Draws: approach paths to the origin (lines y=mx, parabolas y=kx²) and the limiting values of f along each.
  - Teaches: why xy²/(x²+y⁴) fools straight-line checks.
- **Tangent-plane zoom.**
  - Draws: a surface magnified around a point until it flattens to its tangent plane; a non-differentiable cone example that never flattens.
  - Teaches: what differentiability means.
- **Lagrange tangency.**
  - Draws: a constraint curve g=c and level curves of f, with ∇f and ∇g arrows.
  - Learner controls: slide the level f=k until it touches the constraint.
  - Teaches: ∇f=λ∇g at constrained extrema.
- **Saddle/bowl Hessian.**
  - Draws: a quadratic surface z=ax²+bxy+cy² with its Hessian eigenvectors as principal curvature directions.
  - Learner controls: a, b, c.
  - Teaches: the second-derivative test as a sign classification of the Hessian (link LA-11).
- **Iterated-integral slicer.**
  - Draws: a region with sweeping slice lines, which switch orientation when the order of integration is reversed; integrand bars.
  - Teaches: limits of integration; type I versus type II regions.
- **Volume-element magnifier.**
  - Draws: a polar wedge or spherical "box" with its edge lengths dr, r dθ, r sinθ dφ labeled.
  - Teaches: where r and ρ²sin φ come from.
- **Change-of-variables grid.**
  - Draws: a (u,v) grid mapped to (x,y), with each cell coloured by its Jacobian area ratio.
  - Learner controls: choose or define the transformation.
  - Teaches: the Jacobian as a local area-scaling factor (the same object as det in LA-8). It previews √|g|.
- **Vector-field lab.**
  - Draws: an editable field F=(P,Q) with particle flow; a divergence heat map (sources and sinks); curl "paddle wheels"; a drawable path whose work integral accumulates live.
  - Learner controls: field presets (uniform, radial, vortex, shear, gradient fields).
  - Teaches: path independence; why the vortex field breaks the curl test.
- **Green's-theorem cells.**
  - Draws: a region tiled into small circulation cells whose interior edges cancel; the boundary circulation compared with the sum of the cells.
  - Teaches: why Green's theorem holds; the idea behind Stokes.
- **Flux & Gauss.**
  - Draws: a closed surface around a point charge (or charges), deformable, with a flux readout that stays constant while the charge is inside; arrows through surface patches.
  - Learner controls: move the charge in and out; flip the orientation.
  - Teaches: the divergence theorem and Gauss's law; orientation sign.
  - Simplified: point charges.
- **Butterfly nets (Stokes).**
  - Draws: several surfaces sharing one boundary loop, with equal flux of curl F through each.
  - Teaches: surface independence; orientation coupling to the boundary direction.

#### (9) Connections to physics and onward to tensors/GR
- **Mechanics and fields:**
  - work and energy along paths;
  - conservative forces F=−∇U;
  - torque and angular momentum (cross products);
  - centers of mass and moments of inertia (the inertia *tensor* needs LA-11);
  - Kepler and central forces.
- **Electromagnetism and fluids:**
  - flux;
  - Gauss's law (divergence theorem);
  - Ampère and Faraday (Stokes);
  - continuity equations;
  - potentials and the Laplacian.
- **Newtonian gravity in field form.** ∇·g=−4πGρ, ∇²Φ=4πGρ. This is exactly the equation Einstein's field equations generalize (G_μν=8πG T_μν/c⁴); its weak-field limit is ∇²Φ=4πGρ.
- **Metric seeds.**
  - The line elements of polar, cylindrical and spherical coordinates (ds²=dr²+r²dθ²+r²sin²θ dφ²) are metric tensors in disguise.
  - The Jacobian determinant is the √|det g| volume factor.
  - Schwarzschild's metric is "spherical coordinates with modified g_tt and g_rr".
- **Covectors.** df=∂_i f dx^i is the coordinate-free object. ∇f needs the metric to become a vector, and D_u f=df(u) is the first pairing of a covector with a vector.
- **Curvature.** The curvature of curves (κ, Frenet) leads to the curvature of surfaces (Gaussian curvature [E]) and then to the Riemann tensor. Constrained optimization and the shortest path on a surface lead to geodesics [E].

#### (10) Appropriate depth and rigor
- **Standard:**
  - computational fluency plus geometric and physical interpretation;
  - theorem statements with hypotheses (orientation, piecewise smooth boundaries, simply connected domains);
  - Green's theorem proved for rectangles or type I/II regions [O];
  - divergence and curl motivated as limits of flux and circulation per unit volume or area.
- **Excluded:** manifold-level rigor.
- **Enrichment:** differential forms as a capstone [E] for the GR track.

#### (11) Common misconceptions and error patterns
- **Vectors:**
  - "a×b=b×a";
  - "the dot product gives a vector";
  - |a×b|=|a||b|cos θ;
  - the plane's normal confused with a direction vector in the plane;
  - the right-hand rule applied left-handed.
- **Limits and partials:**
  - checking only straight-line paths and concluding the limit exists;
  - "the partials exist ⇒ differentiable (or continuous)";
  - chain rule missing a branch;
  - "the gradient lives on the surface z=f(x,y)" (it lives in the domain);
  - "∇f is tangent to the level curves";
  - directional derivative computed with a non-unit vector;
  - second-derivative test with D<0 read as an extremum;
  - Lagrange multipliers forgetting the constraint equation or the boundary.
- **Integrals:**
  - outer limits that contain the inner variable;
  - reversed order with the wrong limits;
  - dA=dr dθ (missing r);
  - spherical dV missing ρ²sin φ;
  - θ and φ swapped between math and physics sources;
  - using the Jacobian of the inverse map or forgetting the absolute value.
- **Vector calculus:**
  - assuming path independence for any field;
  - "curl F=0 ⇒ conservative" on a domain with a hole;
  - flux sign with the wrong normal;
  - Stokes with the boundary traversed opposite to the right-hand rule;
  - the divergence theorem applied to an open surface;
  - div F and curl F swapped as scalar and vector;
  - "field lines spread ⇒ nonzero divergence" read visually. Field-line curvature is not curl: a field can have curved lines and zero curl, like the vortex away from its axis. This visual-reading error is reported in physics-education research (unverified this session; see Gaps).

### Gaps
- Not verified this session: MIT 18.02, Stewart ch. 12–16, Thomas, Kepler's-laws placement in Stewart §13.4.
- USU-specific placement is unconfirmed: whether vector-valued functions and curvature are in 1220 or 2210, and whether polar and parametric are reviewed.
- Physics-education research on divergence and curl was not retrieved, so it must be checked before citing. Bollen, van Kampen & De Cock (2015), *Phys. Rev. ST PER*, on vector calculus in electrodynamics, is the expected source of the field-line misreadings. Martínez-Planell & Trigueros (2012) is the expected source on functions of two variables.

## 5. MATH 2270 Linear Algebra: what is the complete content map?

### Takeaway
A standard sophomore linear algebra course (Lay; Strang/MIT 18.06) covers:
- systems and elimination;
- matrix algebra;
- linear transformations;
- subspaces and the four fundamental subspaces;
- determinants;
- eigenvalues and diagonalization;
- orthogonality, projections and least squares;
- and, at the end, symmetric matrices, quadratic forms and the SVD (Lay ch. 7; MIT 18.06 L23–28).

MIT 18.06 S25 shows that change of basis, Jordan form, the spectral theorem, positive definiteness, the SVD, the pseudoinverse and PCA are core in a modern course, not extras.

For a physics learner aiming at GR, the Atlas should go further than the median course in three places: abstract vector spaces (function spaces), change of basis with transformation laws, and an enrichment module on duality and bilinear forms (covectors, metric, signature). That module is the bridge to tensors.

### Cited Findings
- **MIT 18.06 Spring 2025 lecture sequence** (Strang 6e readings) — [mitmath/1806](https://github.com/mitmath/1806)
  - **L1:** vectors, linear combinations, span, Ax.
  - **L2:** dot products; Gaussian elimination and REF with back-substitution; AB; elimination as matrix multiplication.
  - **L3:** Gauss–Jordan and RREF; non-commutativity; inverses.
  - **L4:** linear dependence; column space; general vector spaces and subspaces (Strang 3.1).
  - **L5:** null space; row operations preserve it; dim C(A)+dim N(A)=n.
  - **L6:** complete solution of Ax=b.
  - **L7:** independence, basis, rank, rank–nullity; matrices as maps ℝⁿ→ℝᵐ.
  - **L8–L9:** transpose and symmetric matrices; the four fundamental subspaces; orthogonal complements.
  - **L10–L12:** projections; P=A(AᵀA)⁻¹Aᵀ; least squares and curve fitting.
  - **L13:** Gram–Schmidt and QR.
  - **L14:** minimum-norm solutions and the pseudoinverse.
  - **L15–L19:** determinants (signed volume, product formula, big formula, cofactors, adjugate, Cramer).
  - **L20:** diagonalizability A=EDE⁻¹, eigenbasis, **change of basis**.
  - **L21:** eigenvalues over ℂ; characteristic polynomial; trace; algebraic and geometric multiplicity.
  - **L22:** diagonalizability criterion; **Jordan canonical form**.
  - **L23:** complex eigenvalues of real matrices; **spectral theorem for real symmetric matrices**.
  - **L24:** PD and PSD matrices; MMᵀ and MᵀM; introduction to the **SVD**.
  - **L25–L27:** computing the SVD; geometry; operator norm; pseudoinverse via SVD; low-rank approximation; Eckart–Young; image compression.
  - **L28:** PCA.
  - **L29–L36:** complex vector spaces; unitary, Hermitian and normal matrices; Fourier basis; DFT as a change of basis; circulant matrices and convolution.
- **Lay, Lay & McDonald 6e, chapter 7, "Symmetric Matrices and Quadratic Forms":** 7.1 diagonalization of symmetric matrices, 7.2 quadratic forms, 7.3 constrained optimization, 7.4 the singular value decomposition, 7.5 applications to image processing and statistics. The structure is the same in the US and Global editions — [Pearson US](https://www.pearson.com/en-us/subject-catalog/p/linear-algebra-and-its-applications/P200000006235/9780135851203); [Pearson Global](https://www.pearson.com/en-gb/subject-catalog/p/linear-algebra-and-its-applications-global-edition/P200000004712/9781292351216)
- **Strang 6e (Wellesley-Cambridge, Jan 2023, 440 pp.)** — [MAA review](https://maa.org/?p=10733); [retailer TOC excerpt](https://www.tenlong.com.tw/products/9787302668077)
  - It changed the starting point from systems of linear equations (5th ed.) to "early vector spaces".
  - It added chapters on optimization and on learning from data.
  - It opens with "Vectors and Matrices" (1.1 Vectors and Linear Combinations), then "Solving Linear Equations Ax = b".
- **Axler, *Linear Algebra Done Right* 4e (Springer, 2024; open access).** It expands the treatment of the SVD and adds a chapter on multilinear algebra (bilinear forms, quadratic forms, tensor products, and determinants via alternating multilinear forms). The book starts from vector spaces, linear independence, span, basis and dimension, then linear maps — [OAPEN PDF](https://library.oapen.org/bitstream/20.500.12657/85067/1/978-3-031-41026-0.pdf); [freetechbooks listing](https://www.freetechbooks.com/linear-algebra-done-right-t1389.html)
- **Lebl's linear-algebra appendix (for combined DE+LA courses)** — [Lebl ap-linear-algebra.tex](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ap-linear-algebra.tex)
  - Sections and lecture budgets: Vectors, mappings, and matrices (2); Matrix algebra (2–3); Elimination (2–3); Subspaces, dimension, and the kernel (1); Inner product and projections, including Gram–Schmidt (1–2); Determinant (1).
  - Determinants are taught as signed area or volume scaling, with cofactor expansion and det(AB)=det A det B.
  - Eigenvalues are handled in the systems chapter instead.
- **USU MATH 2250's description explicitly includes "abstract vector spaces"** — [MATH 2250 catalog](https://catalog.usu.edu/courses/MATH2250)

### Inferences
#### (1) Course identity
- USU MATH 2270 Linear Algebra. Credits and description were not retrieved; the companion notes infer 3 credits.
- Standard equivalents: Lay 6e ch. 1–7; Strang 6e ch. 1–7 (MIT 18.06); with Axler as the "abstract framing" reference.

#### (2) Major subjects
1. Vectors and linear combinations
2. Linear systems and elimination
3. Matrix algebra and inverses
4. Linear transformations
5. Subspaces, basis, dimension, rank and the four subspaces
6. Abstract vector spaces
7. Change of basis and similarity
8. Determinants
9. Eigenvalues, eigenvectors and diagonalization
10. Orthogonality, Gram–Schmidt, QR and least squares
11. Inner product spaces
12. Symmetric matrices, the spectral theorem and quadratic forms
13. SVD and PCA
14. [O] Complex vector spaces
15. [E] Duality and multilinear algebra

#### (3) Module → submodule → lesson tree
- **LA-1 Vectors & linear combinations [C]** [MIT06 L1–2; STR ch. 1]. Lessons:
  - vectors in ℝⁿ;
  - linear combinations;
  - span as a line, a plane or all of ℝ³;
  - dot product, length, angle and unit vectors;
  - Cauchy–Schwarz and triangle inequalities;
  - Ax as a combination of columns (column picture) versus row dot products (row picture).
- **LA-2 Linear systems & elimination [C]** [MIT06 L2–3, L6; STR 2.1–2.3, 3.3]. Lessons:
  - systems in row and column pictures;
  - elimination to REF with pivots and back-substitution;
  - RREF and Gauss–Jordan;
  - free variables and parametric vector form;
  - existence and uniqueness (pivot in every row or column);
  - homogeneous systems; solution set = particular + null space;
  - elimination matrices and LU [C in Strang, O in Lay];
  - applications: Kirchhoff circuits, network flow, chemical balancing, polynomial interpolation.
- **LA-3 Matrix algebra [C]** [MIT06 L2–3; STR 2.2–2.4]. Lessons:
  - four views of AB (entries, columns, rows, sum of outer products);
  - non-commutativity;
  - transpose and symmetric matrices;
  - inverses (2×2 formula, Gauss–Jordan) and (AB)⁻¹=B⁻¹A⁻¹;
  - the Invertible Matrix Theorem web ×2;
  - block multiplication [O];
  - permutation matrices [O].
- **LA-4 Linear transformations [C]** [MIT06 L7; STR ch. 8]. Lessons:
  - linearity as superposition;
  - the matrix of T from the images of the basis vectors;
  - geometric gallery (rotation, reflection, shear, projection, scaling);
  - composition = product, in the right order;
  - one-to-one and onto via pivots;
  - kernel and range;
  - homogeneous coordinates for graphics [O].
- **LA-5 Subspaces, basis, dimension in ℝⁿ [C]** [MIT06 L4–L9; STR 3.1–3.5, 4.1]. Lessons:
  - the subspace test (contains 0; closure);
  - column space;
  - null space;
  - linear independence ×2;
  - basis: **pivot columns of A, not of its RREF**;
  - dimension and rank;
  - rank–nullity;
  - row space and left null space: the four fundamental subspaces ×2;
  - orthogonal complements (row space ⊥ null space);
  - coordinates relative to a basis.
- **LA-6 Abstract vector spaces [C — USU 2250 names it; essential for physics]** [MIT06 L4 "general vector spaces"; AX ch. 1–3; Lay ch. 4 (section numbers unverified)]. Lessons:
  - axioms and examples (P_n, M_{m×n}, C[a,b], sequences);
  - **function spaces: the solution set of y″+y=0 is a 2-D subspace** (bridge to DE-3);
  - span and independence for polynomials and functions (the Wronskian [O]);
  - basis and dimension, including infinite-dimensional examples;
  - linear maps between abstract spaces (d/dx on P_n; the integral operator);
  - isomorphism and the coordinate map;
  - kernel, range and rank–nullity in the abstract.
- **LA-7 Change of basis & similarity [C — must-not-omit]** [MIT06 L20; Lay ch. 4–5 (unverified section numbers)]. Lessons:
  - one vector, two coordinate columns;
  - the change-of-coordinates matrix P_{C←B} and its inverse ×2;
  - the matrix of a linear map in another basis, [T]_B=P⁻¹AP;
  - **similarity = the same map in a different basis**;
  - similarity invariants (trace, determinant, characteristic polynomial, eigenvalues, rank) and what is *not* invariant (entries, symmetry under non-orthogonal P);
  - transformation laws [E-GR]: basis vectors transform with P, components with P⁻¹ ("contravariant"), which leads to LA-14.
- **LA-8 Determinants [C]** [MIT06 L15–19; STR 5.1–5.3]. Lessons:
  - signed volume scaling and orientation;
  - row-operation rules;
  - computation by elimination or triangular form;
  - cofactor expansion;
  - det(AB)=det A·det B, det Aᵀ=det A, det A⁻¹=1/det A;
  - the invertibility criterion;
  - Cramer's rule and the adjugate [O];
  - the permutation "big formula" [O];
  - the Jacobian link (C3-4.7).
- **LA-9 Eigenvalues & eigenvectors [C]** [MIT06 L20–23; STR 6.1–6.2]. Lessons:
  - invariant directions Ax=λx;
  - the characteristic polynomial;
  - eigenspaces;
  - algebraic versus geometric multiplicity;
  - diagonalization A=PDP⁻¹ ×2;
  - powers and discrete dynamical systems (Leslie population models; Fibonacci);
  - Markov chains and steady states;
  - complex eigenvalues (rotation–scaling; spirals);
  - trace = sum and determinant = product of the eigenvalues;
  - defective matrices and an introduction to Jordan form [O; in MIT06 L22];
  - x′=Ax solved by eigenvectors (bridge to DE-4);
  - the power method [O].
- **LA-10 Orthogonality & least squares [C]** [MIT06 L9–14; STR 4.1–4.5]. Lessons:
  - orthogonal sets and orthonormal bases (coefficients by dot products);
  - orthogonal matrices (QᵀQ=I, length-preserving);
  - projection onto a line;
  - projection onto a subspace P=A(AᵀA)⁻¹Aᵀ ×2;
  - Gram–Schmidt and QR ×2;
  - least squares via AᵀAx̂=Aᵀb ×2 (fitting Hooke's-law or Ohm's-law lab data; a parabola fit);
  - minimum-norm solutions and the pseudoinverse [O];
  - inner-product spaces (⟨f,g⟩=∫fg; weights) [C];
  - **Fourier series as orthogonal projection** [C-physics, bridge to DE-8].
- **LA-11 Symmetric matrices & quadratic forms [C — must-not-omit]** [LAY 7.1–7.3; MIT06 L23–24]. Lessons:
  - the spectral theorem (real eigenvalues, orthonormal eigenbasis);
  - orthogonal diagonalization A=QΛQᵀ ×2;
  - the spectral decomposition Σλᵢqᵢqᵢᵀ;
  - quadratic forms xᵀAx and the principal-axes change of variables ×2 (a rotated conic from C2-6.5 becomes diagonal);
  - definiteness classes by eigenvalues (leading minors [O]);
  - constrained optimization on the unit sphere (the Rayleigh quotient; max = λ_max);
  - the Hessian test re-seen (C3-3.7);
  - the inertia tensor and principal axes [physics];
  - Sylvester's law of inertia: signature is invariant under congruence [E-GR].
- **LA-12 Singular value decomposition [C — must-not-omit]** [LAY 7.4–7.5; MIT06 L24–28]. Lessons:
  - A=UΣVᵀ built from AᵀA;
  - geometry (circle → rotate → stretch → rotate → ellipse);
  - singular values versus eigenvalues;
  - rank-k approximation and Eckart–Young;
  - image compression;
  - PCA ×2;
  - the pseudoinverse via the SVD;
  - condition number [O].
- **LA-13 Complex vector spaces [O for 2270; C before quantum mechanics]** [MIT06 L29–36]. Lessons:
  - complex inner product and conjugate transpose;
  - Hermitian (real eigenvalues) and unitary matrices;
  - the spectral theorem for normal matrices;
  - the DFT as a change of basis;
  - circulants and convolution [E].
- **LA-14 Duality, bilinear forms & the bridge to tensors [E-GR — must-not-omit for this learner]** [AX 4e duality section (location unverified) and multilinear chapter]. Lessons:
  - linear functionals and the dual space V*;
  - the dual basis (eⁱ(e_j)=δⁱ_j);
  - row vectors as covectors, and the pairing ⟨ω,v⟩;
  - the dual map is the transpose;
  - **components of vectors versus covectors transform oppositely** under a change of basis ×2;
  - bilinear forms and their matrices;
  - **two transformation laws:** P⁻¹AP (linear operators, similarity) versus PᵀGP (bilinear forms, congruence) ×2;
  - an inner product is a symmetric positive-definite bilinear form; the metric identifies V with V* ("lowering an index");
  - indefinite forms: Minkowski η=diag(−1,1,1,1); timelike, spacelike and null vectors;
  - tensor products and multilinear maps [E];
  - the determinant as an alternating multilinear form [E, AX 4e].

#### (4) Mathematical skills needed
- Systematic row reduction.
- Matrix multiplication fluency.
- Reading and writing definitions and short proofs ("show W is a subspace"; "show the set is independent").
- Geometric visualization in 2-D and 3-D.
- Polynomial root-finding (characteristic polynomials).
- Complex arithmetic (M0-10).

#### (5) Prerequisite knowledge
- M0-3 systems.
- M0-10 complex numbers.
- M0-14 logic.
- Calc I–II for function-space examples.
- C3-1 vector geometry is helpful but not required.

#### (6) Foundational ideas rarely stated in catalog descriptions
- **Linearity is superposition.** It is why linear ODEs and quantum mechanics have vector-space solution sets.
- **A vector is not its coordinate column.** The column depends on a basis, the vector does not. This is the single most GR-relevant idea in the course.
- **A matrix can represent different things:** a linear map (transforms by similarity) or a bilinear form (transforms by congruence). The metric tensor is the latter.
- **Dimension counting (rank–nullity) predicts solution structure** before any computation.
- **The Invertible Matrix Theorem is a web of equivalences** to be navigated, not a list to memorize.
- **The determinant means volume scaling and orientation.**
- **Orthogonality is what makes projection, least squares and Fourier series computable** by dot products.
- **The spectral theorem says symmetric operators have perpendicular principal axes.** Physically: normal modes, principal moments, observables.

#### (7) Problem-solving techniques and archetypes
- **LA-1:**
  - (a) Is b in span{v₁,v₂}? Interpret geometrically.
  - (b) Project a force onto an incline; check Cauchy–Schwarz.
  - (c) Write Ax as a column combination.
- **LA-2:**
  - (a) RREF for a 3×4 system → parametric vector form.
  - (b) For which h is the system consistent?
  - (c) LU-solve with two right-hand sides.
  - (d) Kirchhoff currents in a two-loop circuit.
- **LA-3:**
  - (a) A pair with AB≠BA.
  - (b) A 3×3 inverse by Gauss–Jordan.
  - (c) True/false items on the Invertible Matrix Theorem.
- **LA-4:**
  - (a) The standard matrix of "rotate by θ, then reflect over y=x".
  - (b) Is T one-to-one or onto?
  - (c) Show T(x)=x+b is not linear.
- **LA-5:**
  - (a) Is W={(x,y,z): x+y=z²} a subspace? Give a counterexample.
  - (b) Bases of all four fundamental subspaces of a 3×4 matrix.
  - (c) A is 5×7 with rank 3: find dim N(A) and dim N(Aᵀ).
- **LA-6:**
  - (a) Is {p∈P₂: p(1)=0} a subspace? Find a basis.
  - (b) Coordinates of a polynomial in the basis {1, 1+t, 1+t+t²}.
  - (c) The matrix of d/dx on P₃; its kernel and range.
  - (d) Show the solutions of y″+y=0 form a 2-D space.
- **LA-7:**
  - (a) P_{C←B} for two bases of ℝ².
  - (b) The matrix of a shear in an eigenbasis.
  - (c) Show similar matrices share trace and determinant.
  - (d) Are [[1,1],[0,1]] and I similar? (No.)
- **LA-8:**
  - (a) Cofactor expansion along a sparse row.
  - (b) det(2A) for a 3×3 A (8·det A).
  - (c) The volume of a parallelepiped; the sign of an orientation flip.
  - (d) The Jacobian of the polar map.
- **LA-9:**
  - (a) Eigenpairs of a 2×2 and a 3×3 matrix.
  - (b) A¹⁰ by diagonalization.
  - (c) The Markov steady state.
  - (d) Eigenvalues a±bi of a rotation–scaling matrix.
  - (e) Show [[2,1],[0,2]] is not diagonalizable.
- **LA-10:**
  - (a) The orthogonal complement of a plane.
  - (b) Distance from a point to a subspace.
  - (c) QR by Gram–Schmidt.
  - (d) The least-squares spring constant from noisy data.
  - (e) Fourier coefficients as ⟨f, sin nx⟩/⟨sin nx, sin nx⟩.
- **LA-11:**
  - (a) Orthogonally diagonalize a symmetric 3×3.
  - (b) Principal axes of 5x²−4xy+8y²=36.
  - (c) Classify definiteness; the maximum of xᵀAx on |x|=1.
  - (d) Principal moments of inertia of a rigid body from its inertia matrix.
- **LA-12:**
  - (a) The SVD of a 2×2 by hand.
  - (b) Interpret the circle → ellipse picture.
  - (c) Best rank-1 approximation; the error equals σ₂.
  - (d) PCA of 2-D data; the pseudoinverse solution.
- **LA-14 [E]:**
  - (a) The dual basis to {(1,1),(1,−1)}.
  - (b) Show ⟨ω,v⟩ is unchanged by a change of basis while the components change.
  - (c) Transform a bilinear form: G′=PᵀGP versus A′=P⁻¹AP.
  - (d) Classify four-vectors with η; show the signature is basis-independent.

#### (8) Interactive visualization ideas
- **Transformation canvas.**
  - Draws: a 2-D grid deformed by A; î and ĵ draggable; the unit-square image showing det (with an orientation-flip colour); eigen-lines highlighted (they stay on their own span); a composition panel.
  - Teaches: matrix = map; det = area scaling; eigenvectors.
  - Simplified: 2-D only, with a 3-D mode optional.
- **Span builder 3-D.**
  - Draws: two or three vectors and their span as a line, plane or space.
  - Learner controls: drag the vectors; an "is b reachable?" target.
  - Teaches: span, independence, dependence.
- **Row-reduction stepper with geometry.**
  - Draws: each elementary row operation applied, while three planes in 3-D move but keep the same intersection (a point, a line or nothing).
  - Teaches: row operations preserve the solution set but not the column space.
- **Column picture versus row picture.**
  - Draws: the same 2×2 system as intersecting lines (rows) and as a combination of column vectors reaching b.
  - Teaches: two readings of Ax=b.
- **Four-subspaces diagram (Strang).**
  - Draws: for an editable A, the row space ⊥ null space in ℝⁿ and the column space ⊥ left null space in ℝᵐ, with x=x_r+x_n mapping to b.
  - Teaches: rank–nullity and orthogonality structure.
- **Two-grids change of basis.**
  - Draws: a fixed vector over the standard grid and a custom-basis grid, with both coordinate readouts; a "same map, different basis" mode showing A and P⁻¹AP acting identically; a covector mode [E] showing level-line stacks whose spacing changes oppositely to the basis.
  - Teaches: coordinates are basis-dependent; similarity; contra- versus covariance.
- **Projection & least squares 3-D.**
  - Draws: b, the plane Col A, the projection p, and the residual b−p perpendicular to the plane; a linked scatterplot fit.
  - Teaches: the normal equations geometrically.
- **Gram–Schmidt animator.**
  - Draws: successive subtraction of projections.
- **Eigen-dynamics iterator.**
  - Draws: x_{k+1}=Ax_k orbits converging to the dominant eigendirection; complex eigenvalues giving spirals; a Markov mode with a population bar chart.
  - Teaches: what eigenvalues do over time.
- **Quadratic-form explorer.**
  - Draws: the level set xᵀAx=1 (ellipse or hyperbola) with a "rotate to principal axes" animation and the eigenvectors; a surface view z=xᵀAx (bowl or saddle).
  - Teaches: the spectral theorem; definiteness; the link to conics and the Hessian.
- **SVD factorizer.**
  - Draws: the unit circle mapped stepwise by Vᵀ (rotate), Σ (stretch) and U (rotate); an image-compression slider for k with the error readout.
  - Teaches: the geometry of the SVD; low-rank approximation.
- **Function-space projector.**
  - Draws: f(x) approximated by its projection onto span{1, sin x, cos x, …, sin nx}, with the coefficient bar chart.
  - Teaches: inner products of functions; Fourier series as projection.
- **Metric morpher [E].**
  - Draws: the "unit circle" {v: vᵀGv=1} for a user-chosen symmetric G, which becomes a hyperbola when G is indefinite (Minkowski).
  - Teaches: inner products as bilinear forms; signature; the bridge to spacetime.

#### (9) Connections to physics and onward to tensors/GR
- **Normal modes of coupled oscillators** are an eigenproblem (DE-4).
- **The inertia tensor and principal axes** are a symmetric eigenproblem.
- **Stress and strain tensors** (in the same family).
- **Quantum mechanics:** Hermitian operators, real eigenvalues as observables, unitary evolution, change of basis between representations.
- **Kirchhoff networks.**
- **Least-squares fitting of lab data.**
- **Markov models** in statistical mechanics.
- **The DFT** in signal analysis.
- **The GR path:**
  - Lorentz transformations are matrices Λ with ΛᵀηΛ=η (an isometry of a bilinear form).
  - Tensors are multilinear maps on V and V*.
  - Index placement records co- versus contravariance.
  - The metric g_μν is a symmetric bilinear form. Diagonalizing it at a point is Sylvester's law and gives local inertial frames.
  - Determinants become volume forms and the Levi-Civita symbol.
  - Eigenvalue problems of the metric and Ricci tensors [E].

#### (10) Appropriate depth and rigor
- **Baseline: Lay or Strang level.** Computation plus geometric meaning plus short proofs (subspace, independence, invertibility arguments).
- **Abstract framing (Axler style)** enters via LA-6, LA-7 and LA-14 without requiring proof-heavy determinant theory.
- **Determinants:** properties and geometry; the permutation formula is optional.

#### (11) Common misconceptions and error patterns
- **Algebra:**
  - "AB=BA";
  - (AB)⁻¹=A⁻¹B⁻¹;
  - det(A+B)=det A+det B;
  - det(cA)=c·det A (it should be cⁿ det A);
  - cancelling matrices (AB=AC ⇒ B=C without invertibility);
  - "A²=0 ⇒ A=0".
- **Elimination and subspaces:**
  - "row operations change the solution set" (they do not) versus "row operations preserve the column space" (they do not, which is why the pivot columns *of A* form the basis);
  - rank read from the nonzero rows of A rather than of its echelon form;
  - "more vectors ⇒ independent";
  - "a set containing 0 can be a basis";
  - "a plane in ℝ³ is 3-dimensional because its vectors have 3 components";
  - "a subspace need not contain 0";
  - span and independence conflated.
- **Transformations:** "T(x)=Ax+b is linear"; composition order reversed.
- **Eigenvalues:**
  - "an eigenvector can be 0";
  - "λ=0 means there is no eigenvalue";
  - "eigenvalues of A+B are sums of eigenvalues";
  - "same eigenvalues ⇒ similar" (necessary, not sufficient);
  - "every matrix is diagonalizable";
  - "distinct eigenvalues are *required* for diagonalizability";
  - "real matrices have real eigenvalues";
  - "eigenvalues are unchanged by row reduction".
- **Orthogonality:**
  - "orthogonal matrix = orthogonal columns" (they must be orthonormal);
  - projecting onto a subspace by summing projections onto a *non*-orthogonal basis;
  - "least squares solves Ax=b exactly";
  - "singular values are eigenvalues of A" (true only for symmetric PSD A).
- **Change of basis:**
  - P_{B←C} versus P_{C←B} direction errors;
  - confusing a vector with its coordinate column;
  - applying P⁻¹AP to a bilinear form (it should be PᵀGP).

### Gaps
- USU MATH 2270's official description, credits and textbook were not retrieved.
- Not verified this session:
  - Lay 6e chapters 1–6 section titles (in particular, where change of basis sits: 4.6 in 6e or 4.7 in 5e is my recollection, unverified);
  - Strang 6e chapter 8 ("Linear Transformations", including "the search for a good basis") and the new optimization and learning chapters' sections;
  - Axler 4e's duality section location (from memory: chapter 3, unverified).
- 3Blue1Brown's "Essence of Linear Algebra" titles (including a dot-products-and-duality episode, from memory) were not verified, so the canvas designs above are not attributed.
- Linear-algebra misconception research was not retrieved and should be checked before citing:
  - Dorier (ed.), *On the Teaching of Linear Algebra* (2000);
  - Sierpinska (2000) on modes of thinking;
  - Wawro et al. (2012), the "Magic Carpet Ride" span/independence task;
  - Thomas & Stewart (2011) on eigenvectors.

## 6. MATH 2280 Ordinary Differential Equations: what is the complete content map, and is Frobenius standard at this level?

### Takeaway
A standard sophomore ODE course covers:
- first-order equations, including existence/uniqueness, exact equations and numerical methods;
- higher-order linear equations with vibrations and resonance;
- linear systems via eigenvalues, including the phase-plane gallery and the matrix exponential;
- Laplace transforms with step and impulse forcing and convolution;
- some mix of nonlinear phase-plane analysis, series solutions, and boundary-value/Fourier topics.

The three standard texts (Lebl, Edwards–Penney, Boyce–DiPrima) contain every must-not-omit item in the brief, with cross-referenced section numbers. USU's 2280 description explicitly names boundary value problems, higher-order equations, first-order linear systems and Laplace transforms. It does not name series solutions, numerical methods or nonlinear systems.

On Frobenius: the method (regular singular points, indicial equation, Bessel functions) is standard *in the textbooks* (EP §8.3–8.4; BD §5.4–5.7; Lebl's power-series chapter) but optional *in practice*. Lebl's own syllabi treat the power-series chapter as an interchangeable "topic" and recommend only its first two sections (ordinary points) when time is short. The Atlas should make ordinary-point series [O] and Frobenius/Bessel an [E] physics-track module.

### Cited Findings
- **USU MATH 2280 (3 cr).** "Analytic solution techniques for ODEs; initial value and boundary value problems with applications; higher-order scalar equations; first-order linear systems; Laplace transforms" — [MATH 2280 catalog](https://catalog.usu.edu/courses/MATH2280)
- **Lebl, first-order chapter (sections with EP/BD cross-references and lecture budgets)** — [Lebl ch-first-order-ode.tex](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-first-order-ode.tex)
  - Sections:
    - Integrals as solutions (EP §1.2; BD §1.2, §2.1; ≤1 lecture)
    - Slope fields, including "Existence and uniqueness" (EP §1.3; BD §1.1; 1)
    - Separable equations (EP §1.4; BD §2.2; 1)
    - Linear equations and the integrating factor (EP §1.5; BD §2.1; 1)
    - Substitution: Bernoulli, homogeneous (EP §1.6; not in BD; "can safely be skipped")
    - Autonomous equations, including logistic with harvesting x′=kx(M−x)−h (EP §2.2; BD §2.5; 1)
    - Numerical methods: Euler's method (EP §2.4; BD §8.1; "can safely be skipped")
    - Exact equations, with integrating factors (EP §1.6; BD §2.6; 1–2, "can safely be skipped")
    - First-order linear PDE (transport, characteristics; skippable)
  - **Existence and uniqueness:** f and ∂f/∂y continuous near (x₀,y₀) gives a unique local solution.
    - y′=1/x, y(0)=0 has no solution.
    - y′=2√|y|, y(0)=0 has the solutions 0 and the piecewise x|x|.
    - y′=y², y(0)=1 blows up at x=1.
  - **Exactness and integrating factors:**
    - The exactness test is M_y=N_x, with a potential F such that F(x,y)=C (local; global on regions without holes).
    - An integrating factor u(x) exists when (M_y−N_x)/N depends on x only, and u(y) when (M_y−N_x)/M depends on y only.
  - **Numerical error orders:**
    - Euler is first order (halving h roughly halves the error); a table shows error ratios moving from about 0.74 toward 0.51.
    - Improved Euler is second order (error about ¼ when h halves).
    - RK4 is fourth order (error about 1/16).
- **Lebl, higher-order chapter** — [Lebl ch-higher-order-ode.tex](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-higher-order-ode.tex)
  - Sections:
    - Second-order linear ODEs (EP §3.1; BD §3.1–3.2; reduction of order optional)
    - Constant-coefficient second-order (complex roots via Euler's formula; EP §3.1; BD §3.1)
    - Higher-order linear ODEs (EP §3.2–3.3; BD §4.1–4.2; Wronskians deliberately avoided because "it is difficult to see why they work")
    - Mechanical vibrations (EP §3.4; BD §3.7; 2 lectures; over/critical/underdamping)
    - Nonhomogeneous equations: undetermined coefficients and variation of parameters, worked on y″+y=tan x (EP §3.5; BD §3.5–3.6; 2)
    - Forced oscillations and resonance: pure resonance t·sin ωt, beats, practical resonance (EP §3.6; BD §3.8; 2)
  - The RLC circuit LI″+RI′+I/C=E′ is presented as the analog (L↔m, R↔c, 1/C↔k).
  - The pendulum is linearized for small angles.
  - Cauchy–Euler equations are handled through y=x^r in exercises.
- **Lebl, systems chapter** — [Lebl ch-systems.tex](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-systems.tex)
  - Sections:
    - Introduction to systems, with reduction to first order, autonomous vector fields and Picard's theorem (EP §4.1; BD §7.1)
    - Matrices and linear systems (EP §5.1; BD §7.2–7.3)
    - Linear systems of ODEs (EP §5.1; BD §7.4)
    - Eigenvalue method, real and complex (EP §5.2; BD §7.3, §7.5–7.6; 2)
    - Two-dimensional systems and their vector fields: source, sink, saddle, center, spiral source and spiral sink in a table (EP §6.2; BD §7.5–7.6; 1)
    - Second-order systems and applications: M x″=Kx normal modes; a rail-car example with a zero eigenvalue; forced resonance (EP §5.4; not in BD)
    - Repeated eigenvalues: geometric and algebraic multiplicity; defective eigenvalues and generalized eigenvectors, giving (v₂+v₁t)e^{λt} (EP §5.5; BD §7.8)
    - Matrix exponentials: series definition; e^{A+B}=e^Ae^B only for commuting A and B; computation by diagonalization; e^{tA}=X(t)X(0)⁻¹ (EP §5.6; BD §7.7; 2)
    - Nonhomogeneous systems: integrating factor, eigenvector decomposition, undetermined coefficients, and variation of parameters X∫X⁻¹f (EP §5.7; BD §7.9; 3)
- **Lebl, nonlinear chapter** — [Lebl ch-nonlin-systems.tex](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-nonlin-systems.tex)
  - Sections:
    - Linearization, critical points and equilibria (EP §6.1–6.2; BD §9.2–9.3; 1)
    - Stability and classification of isolated critical points ("almost linear" means isolated with an invertible Jacobian), including "The trouble with centers" and Conservative equations (1.5–2)
    - Applications: pendulum; predator–prey (Lotka–Volterra) (EP §6.3–6.4; BD §9.3, §9.5; 2)
    - Limit cycles: Van der Pol, Poincaré–Bendixson, Bendixson–Dulac (EP §6.1, §6.4; BD §9.7; <1)
    - Chaos: Duffing x″+0.05x′+x³=8cos t, Poincaré sections, Lorenz, double pendulum (EP §6.5; BD §9.8; 1)
  - **The trouble with centers:** x′=y, y′=−x+y³ has a linearized center but is a spiral source.
  - **Conservative equations:** x″+f(x)=0 has only saddles and centers.
  - **Pendulum:** centers at even multiples of π and saddles at odd multiples; the linear-period error is about 15% at amplitude π/2.
  - **Lotka–Volterra:** a saddle at the origin; the coexistence point has a linearized center; a constant of motion shows closed orbits.
- **Lebl, Laplace chapter** — [Lebl ch-laplace.tex](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-laplace.tex)
  - Sections:
    - The Laplace transform: existence and uniqueness (exponential order), inverse transform with partial fractions, first shift (EP §7.1; BD §6.1–6.2; 1.5–2)
    - Transforms of derivatives and ODEs: Heaviside function and second shift, transforms of integrals, transfer functions, periodic functions (EP §7.2–7.3; BD §6.2–6.3; 2)
    - Convolution, including Volterra integral equations (EP §7.2; BD §6.6; 1–1.5)
    - Dirac delta and impulse response: delta as a limit of rectangular pulses, three-point beam bending (EP §7.6; BD §6.5; 1–1.5)
    - Solving PDEs with the Laplace transform (skippable)
  - Physics examples include a forced mass–spring with a rocket firing for a fixed time, and an RLC analogy.
- **Lebl, power-series chapter** — [Lebl ch-power-ser.tex](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-power-ser.tex)
  - Sections:
    - Power series (EP §8.1; BD §5.1; 1.5–2)
    - Series solutions of linear second-order ODEs: ordinary points only (EP §8.2; BD §5.2–5.3; 1.5–2)
    - Singular points and the method of Frobenius: regular singular points via limits of (x−x₀)Q/P and (x−x₀)²R/P; the indicial equation; Bessel functions J_p, J_{−p} and Y_n; the gamma function (EP §8.3–8.4; BD §5.4–5.7; 1.5–2)
- **Lebl, Fourier and PDE chapter** — [Lebl ch-fourier-and-pde.tex](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-fourier-and-pde.tex)
  - Sections:
    - Boundary value problems: eigenvalue problems, orthogonality of eigenfunctions, Fredholm alternative (EP ≈§3.8; BD §10.1, §11.1; 2)
    - The trigonometric series (EP §9.1; BD §10.2; 2)
    - More on the Fourier series: convergence, Gibbs, differentiation and integration, smoothness versus decay (EP §9.2–9.3; BD §10.3; 2)
    - Sine and cosine series (EP §9.3; BD §10.4; 2)
    - Applications of Fourier series: periodically forced oscillation, resonance (EP §9.4; not in BD; 2)
    - Heat equation by separation of variables (EP §9.5; BD §10.5; 2)
    - One-dimensional wave equation (EP §9.6; BD §10.7; 1)
    - D'Alembert solution (BD part of §10.7; 1)
    - Steady-state temperature and the Laplacian (EP §9.7; BD §10.8; 1)
    - Dirichlet problem in the circle and the Poisson kernel (EP §9.7; BD §10.8; 2)
- **Lebl, eigenvalue-problems chapter** — [Lebl ch-eigenvalue-probs.tex](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-eigenvalue-probs.tex)
  - Sections:
    - Sturm–Liouville problems: regular SL; weighted orthogonality; Fredholm alternative; eigenfunction series; Robin-type conditions giving transcendental eigenvalue equations such as h/√λ=tan√λ (EP §10.1; BD §11.2; 2)
    - Higher-order eigenvalue problems: hinged beam with eigenvalues n⁴π⁴ (EP §10.2; 1)
    - Steady periodic solutions: forced vibrating string; underground temperature oscillations (EP §10.3; not in BD; 1–2)
- **Lebl's typical-course schedules** — [Lebl ch-intro.tex](https://github.com/jirilebl/diffyqs/blob/master/ch-intro.tex)
  - UIUC Math 286 (4 h/week): introduction, first-order, second-order, systems, Fourier (BVPs through Dirichlet problems), then one of Sturm–Liouville, Laplace, power series or nonlinear.
  - UIUC Math 285 (3 h/week): introduction, first-order, second-order, Fourier, and possibly Sturm–Liouville, Laplace or power series.
  - A no-systems course: first-order, second-order, Laplace, power series.
  - A systems course "likely skip[s] Laplace and power series".
  - The Laplace, Sturm–Liouville, power-series and nonlinear chapters are "more or less interchangeable".
  - "the first two sections of the power series chapter form a reasonable self-contained unit".
  - The cut-down core consists of: introduction; integral solutions through integrating factors; autonomous equations; linear and constant-coefficient solutions; mechanical vibrations; forced oscillations.
- **Boyce–DiPrima–Meade 12e** — [Perlego SSM listing](https://www.perlego.com/book/3884500/elementary-differential-equations-and-boundary-value-problems-student-solutions-manual-pdf); [Miami store TOC](https://campusstore.miamioh.edu/elementary-differential-equations-boundary/bk/9781119777694)
  - It runs from Ch. 1 Introduction to Ch. 11 Boundary Value Problems and Sturm–Liouville Theory, covering first-order, second-order linear, Laplace, systems, numerical methods, nonlinear equations and stability, and PDEs/Fourier series.
  - Opening sections: 1.1 basic models and direction fields, 1.2 solutions, 1.3 classification, 2.1 linear equations with integrating factors, 2.2 separable, 2.3 modeling.
  - Meade added concept questions and worksheets for each chapter.

### Inferences
#### (1) Course identity
- USU MATH 2280 Ordinary Differential Equations (3 credits, QI). Per the companion notes, it is the highest math required for the physics BS.
- Standard equivalents: Boyce–DiPrima ch. 1–7 plus parts of ch. 9–10; Edwards–Penney ch. 1–7 plus parts of ch. 3.8/9; Lebl ch. 0–4/6 by schedule; MIT 18.03 (unverified).

#### (2) Major subjects
1. Modeling and classification
2. First-order methods: separable, linear, exact, substitution
3. Existence and uniqueness
4. Autonomous equations and stability
5. Numerical methods and their error
6. Linear higher-order theory and constant-coefficient methods
7. Vibrations and resonance (mechanical and RLC)
8. Undetermined coefficients and variation of parameters
9. Linear systems: eigenvalue method, phase portraits, matrix exponential
10. Laplace transforms with step and impulse forcing and convolution
11. Boundary-value and eigenvalue problems [USU-named]
12. [O] Nonlinear systems, linearization and classification
13. [O] Series solutions and Frobenius
14. [O] Fourier series and PDEs

#### (3) Module → submodule → lesson tree
- **DE-1 Introduction & classification [C]** [LEB 0.2–0.3; BD 1.1–1.3]. Lessons:
  - what a DE and a solution are (verification by substitution);
  - general versus particular solutions and IVPs;
  - order, linear versus nonlinear, autonomous, ODE versus PDE;
  - the modeling grammar "rate of change = in − out";
  - nondimensionalization [E-physics].
- **DE-2 First-order equations [C]** [LEB ch. 1; EP §1.2–2.6; BD ch. 2, §8.1–8.3]
  - **2.1 Integrals as solutions** [LEB 1.1]. Lessons:
    - y′=f(x);
    - kinematics x″=f(t).
  - **2.2 Slope fields & existence/uniqueness [C, must-not-omit]** ×2 [LEB 1.2; BD 2.8]. Lessons:
    - reading and sketching slope fields (isoclines);
    - Picard's theorem: hypotheses and conclusion;
    - the three counterexample archetypes (no solution, y′=2√|y| non-uniqueness, y′=y² blow-up);
    - consequence: solution curves of nice equations cannot cross;
    - Picard iteration [E].
  - **2.3 Separable** [LEB 1.3; BD 2.2]. Lessons:
    - separate and integrate, with implicit solutions;
    - the lost equilibrium solution (dividing by y);
    - applications: decay, Newton cooling, Torricelli.
  - **2.4 Linear & integrating factor** [LEB 1.4; BD 2.1]. Lessons:
    - standard form and μ=e^{∫p};
    - mixing tanks;
    - RC and RL circuits (transient and steady state).
  - **2.5 Exact equations & integrating factors [C for Atlas, must-not-omit; O in many syllabi]** ×2 [LEB 1.8; EP 1.6; BD 2.6]. Lessons:
    - M dx+N dy=0 as dF=0 for a potential F (the same object as C3-5.3);
    - the test M_y=N_x and solving for F;
    - integrating factors μ(x) and μ(y).
  - **2.6 Substitution [O]** [LEB 1.5; EP 1.6]. Lessons:
    - Bernoulli (logistic as Bernoulli);
    - homogeneous y′=F(y/x).
  - **2.7 Autonomous equations [C]** [LEB 1.6; EP 2.2; BD 2.5]. Lessons:
    - phase lines and stability;
    - the logistic equation;
    - harvesting and the saddle-node bifurcation at the critical h [O/E].
  - **2.8 First-order modeling [C]** [EP 2.1, 2.3; BD 2.3]. Lessons:
    - population models;
    - linear and quadratic drag with terminal velocity;
    - variable-gravity escape velocity [O];
    - compartment models.
  - **2.9 Numerical methods & error [C for Atlas, must-not-omit]** ×2 [LEB 1.7; EP 2.4–2.6; BD 8.1–8.3]. Lessons:
    - Euler's method;
    - local versus global error, and first order;
    - improved Euler/Heun (second order);
    - RK4 (fourth order);
    - estimating order from error ratios at h and h/2;
    - stability and stiffness [O].
  - **2.10 First-order linear PDE (transport, characteristics) [E]** [LEB 1.9].
- **DE-3 Higher-order linear equations [C]** [LEB ch. 2; EP ch. 3; BD ch. 3–4]
  - **3.1 Linear theory** [LEB 2.1; BD 3.1–3.2]. Lessons:
    - the operator L[y] and superposition;
    - existence and uniqueness for linear IVPs (continuous coefficients ⇒ a solution on the whole interval);
    - **the solution set is a 2-D vector space** (link LA-6);
    - reduction of order [O].
  - **3.2 Constant coefficients** ×2 [LEB 2.2; BD 3.1, 3.3–3.4]. Lessons:
    - the characteristic equation and distinct real roots;
    - complex roots via Euler's formula (e^{αx}cos βx, e^{αx}sin βx);
    - repeated roots (x·e^{rx});
    - Cauchy–Euler equations [O].
  - **3.3 Higher order & independence** [LEB 2.3; BD 4.1–4.2]. Lessons:
    - nth-order theory;
    - independence by definition (Wronskian [O]);
    - higher-order constant-coefficient equations.
  - **3.4 Mechanical vibrations** ×2 [LEB 2.4; BD 3.7]. Lessons:
    - deriving mx″+cx′+kx=F(t);
    - free undamped motion (amplitude, ω₀=√(k/m), phase; the R cos(ω₀t−δ) form);
    - damping regimes from c²−4mk (over, critical, under);
    - the RLC analogy;
    - the small-angle pendulum.
  - **3.5 Nonhomogeneous equations** ×2 [LEB 2.5; BD 3.5–3.6]. Lessons:
    - y=y_c+y_p;
    - undetermined coefficients (trial table; multiply by x on duplication);
    - **variation of parameters [must-not-omit]** (y″+y=tan x; a Wronskian formula);
    - the impulse-response/Green's-function view [E → DE-6].
  - **3.6 Forced oscillations & resonance** ×2 [LEB 2.6; BD 3.8]. Lessons:
    - beats (sum-to-product);
    - pure resonance (t·sin ωt);
    - damped forcing: transient plus steady periodic;
    - amplitude and phase response and practical resonance (the peak shifts below ω₀ as damping grows);
    - an energy view [O].
- **DE-4 Linear systems [C]** [LEB ch. 3; EP ch. 4–5; BD ch. 7] — needs LA-9
  - **4.1 Systems & reduction** [LEB 3.1]. Lessons:
    - higher-order equations as first-order systems;
    - autonomous vector fields;
    - Picard for systems;
    - coupled-tank and predator–prey previews.
  - **4.2 Linear-system theory** [LEB 3.3; BD 7.4]. Lessons:
    - superposition and fundamental matrices.
  - **4.3 Eigenvalue method** ×2 [LEB 3.4; BD 7.5–7.6]. Lessons:
    - distinct real eigenvalues;
    - complex eigenvalues (real and imaginary parts).
  - **4.4 Phase-plane gallery & trace–determinant classification [C, must-not-omit]** ×2 [LEB 3.5]. Lessons:
    - source, sink, saddle, center and spirals;
    - the trace–determinant plane (Δ<0 saddle; τ²−4Δ>0 nodes; <0 spirals; τ=0 centers; τ²=4Δ degenerate or star nodes; Δ=0 lines of equilibria);
    - nullclines and eigen-lines.
  - **4.5 Second-order systems & normal modes** ×2 [LEB 3.6; EP 5.4]. Lessons:
    - Mx″=Kx and the mode frequencies;
    - mode shapes as eigenvectors and beats between modes;
    - forced coupled systems and resonance;
    - zero-eigenvalue drift.
  - **4.6 Repeated eigenvalues** [LEB 3.7; BD 7.8]. Lessons:
    - complete versus defective eigenvalues;
    - generalized eigenvectors and (v₂+v₁t)e^{λt};
    - degenerate nodes.
  - **4.7 Matrix exponential** ×2 [LEB 3.8; BD 7.7]. Lessons:
    - the series definition and d/dt e^{tA}=Ae^{tA};
    - computation by diagonalization and nilpotent parts;
    - e^{A+B}=e^Ae^B only when A and B commute;
    - e^{tA}=X(t)X(0)⁻¹.
  - **4.8 Nonhomogeneous systems [O]** ×2 [LEB 3.9; BD 7.9]. Lessons:
    - integrating factor e^{−tA};
    - eigenvector decomposition;
    - undetermined coefficients;
    - variation of parameters X∫X⁻¹f.
- **DE-5 Nonlinear systems & stability [C for Atlas physics; not named in USU's 2280 description]** [LEB ch. 8; EP ch. 6; BD ch. 9]
  - **5.1 Critical points & linearization [must-not-omit]** [LEB 8.1]. Lessons:
    - equilibria and the Jacobian;
    - almost-linear systems.
  - **5.2 Classification & persistence** ×2 [LEB 8.2]. Lessons:
    - which linear types survive linearization (nodes, saddles, spirals);
    - **centers need not** survive (the "trouble with centers" example);
    - conservative systems and energy level sets (only saddles and centers);
    - Hartman–Grobman by name [E].
  - **5.3 Physical and ecological applications** ×2 [LEB 8.3; BD 9.3–9.5]. Lessons:
    - pendulum phase portrait (separatrix; period integral; ≈15% error at π/2);
    - damped pendulum;
    - Lotka–Volterra (constant of motion);
    - competing species (nullclines; coexistence versus exclusion) [BD 9.4].
  - **5.4 Limit cycles [O]** [LEB 8.4]. Lessons:
    - Van der Pol;
    - Poincaré–Bendixson and Bendixson–Dulac.
  - **5.5 Chaos [E]** [LEB 8.5]. Lessons:
    - Lorenz and sensitive dependence;
    - Duffing and Poincaré sections;
    - the double pendulum.
  - **5.6 Lyapunov functions [O]** [BD ch. 9; section number unverified].
- **DE-6 Laplace transform [C]** [LEB ch. 6; EP ch. 7; BD ch. 6]
  - **6.1 Transform & inverse** ×2 [LEB 6.1]. Lessons:
    - the definition as an improper integral (C2-2.7);
    - exponential order and existence;
    - table and linearity;
    - first shift;
    - inverse by partial fractions.
  - **6.2 Solving IVPs; step functions** ×2 [LEB 6.2]. Lessons:
    - L{y′}, L{y″} and solving IVPs;
    - the Heaviside function and second shift (switched and piecewise forcing);
    - transfer functions and pole locations;
    - periodic inputs [O].
  - **6.3 Convolution [must-not-omit]** [LEB 6.3]. Lessons:
    - definition and the theorem L{f*g}=FG;
    - solving with a general forcing via the impulse response;
    - Volterra equations [O].
  - **6.4 Dirac delta & impulse response [must-not-omit]** [LEB 6.4]. Lessons:
    - delta as a limit of pulses (hammer blows, kicks);
    - L{δ(t−a)}=e^{−as};
    - impulse response and convolution for any input;
    - beam bending [O].
  - **6.5 Laplace for PDEs [E]** [LEB 6.5].
- **DE-7 Power-series methods [O; Frobenius E-physics]** [LEB ch. 7; EP ch. 8; BD ch. 5]
  - **7.1 Power series review** [LEB 7.1]. Lessons:
    - analytic functions and manipulating series.
  - **7.2 Ordinary points [O]** ×2 [LEB 7.2]. Lessons:
    - series solutions and recurrences (y″+y=0 recovers cos and sin; Airy);
    - radius of convergence and singular points;
    - Legendre and Hermite equations [E-physics].
  - **7.3 Regular singular points & Frobenius [E-physics]** ×2 [LEB 7.3; BD 5.4–5.7]. Lessons:
    - classifying singular points and Euler (equidimensional) equations;
    - the indicial equation and the root cases (including roots differing by an integer, with log terms);
    - Bessel functions and the gamma function.
- **DE-8 Boundary-value problems, Fourier series & PDEs** [LEB ch. 4; EP 3.8, ch. 9; BD ch. 10]
  - **8.1 BVPs & eigenvalue problems [C — USU names BVPs; must-not-omit]** ×2 [LEB 4.1; BD 10.1, 11.1]. Lessons:
    - BVP versus IVP (existence and uniqueness can fail);
    - y″+λy=0 with Dirichlet, Neumann and periodic conditions;
    - orthogonality of eigenfunctions and the Fredholm alternative;
    - the whirling string and buckling applications.
  - **8.2–8.4 Fourier series [O]** ×4 [LEB 4.2–4.4]. Lessons:
    - inner products and coefficients;
    - 2L-periodic series;
    - convergence and Gibbs;
    - smoothness versus coefficient decay;
    - even and odd extensions (sine and cosine series).
  - **8.5 Fourier-forced oscillators [O]** [LEB 4.5].
  - **8.6 Heat equation [O]** [LEB 4.6]. Lessons:
    - derivation;
    - separation with Dirichlet and insulated ends.
  - **8.7 Wave equation [O]** ×2 [LEB 4.7–4.8]. Lessons:
    - modes;
    - d'Alembert traveling waves.
  - **8.8 Laplace equation [O]** [LEB 4.9–4.10]. Lessons:
    - steady state;
    - the disk Dirichlet problem and the Poisson kernel [E].
- **DE-9 Sturm–Liouville & eigenfunction expansions [E]** [LEB ch. 5; BD 11.2]. Lessons:
  - regular SL problems with a weight;
  - eigenfunction series;
  - beam eigenvalues;
  - steady periodic solutions (forced string, underground temperature).

#### (4) Mathematical skills needed
- Integration techniques (C2-2), especially partial fractions for Laplace.
- Complex exponentials.
- Linear algebra: eigenvalues and eigenvectors, determinants, solving linear systems.
- Series manipulation and index shifting.
- Multivariable partial derivatives (exactness, Jacobians).
- Qualitative graph reasoning.

#### (5) Prerequisite knowledge
- C2 in full, including series (for DE-7) and improper integrals (for DE-6).
- LA-2/3/8/9 for DE-4. Teach it just-in-time if the learner takes 2280 before 2270.
- C3-3 partials and C3-5.3 potentials (for exactness and linearization).

#### (6) Foundational ideas rarely stated in catalog descriptions
- **The linear-operator viewpoint.** L[y]=f has a solution set y_p+ker L, an *affine* space whose dimension equals the order. Linear algebra is the grammar of ODEs.
- **Existence/uniqueness is a modeling statement.** Determinism, and the non-crossing of trajectories, make phase portraits readable.
- **Qualitative analysis over formulas.** Most nonlinear ODEs have no closed form; equilibria, stability, energy and numerics are the real toolkit.
- **Physics through the lens of linear equations.** Transient versus steady state, the frequency response, and the impulse response as "the system's fingerprint", with convolution as superposition of kicks.
- **Error order.** A numerical method's error order is an empirically checkable scaling law.
- **Equations take boundary conditions as well as initial conditions.** Eigenvalue problems quantize, foreshadowing quantum mechanics and normal modes.

#### (7) Problem-solving techniques and archetypes
- **DE-2:**
  - (a) dy/dx=xy², y(0)=1 (blow-up at x=√2);
  - (b) a mixing tank with time-varying inflow concentration; RC charging;
  - (c) exact: (2xy+3)dx+(x²−1)dy=0; find μ(x) for a non-exact equation;
  - (d) does y′=y^{1/3}, y(0)=0 have a unique solution? (no);
  - (e) phase line of x′=x(1−x)−h; the critical harvest h=¼;
  - (f) two Euler steps by hand; from an error table, decide the method's order;
  - (g) terminal velocity with quadratic drag.
- **DE-3:**
  - (a) y″−3y′+2y=0; y″+4y′+13y=0; y″+6y′+9y=0;
  - (b) the damping regime for m=1, k=4, c∈{2,4,6};
  - (c) y″+y=cos t (resonance → (t/2)sin t);
  - (d) variation of parameters for y″+y=tan x and y″−2y′+y=eᵗ/t;
  - (e) an RLC charge response; the practical-resonance frequency;
  - (f) x²y″−xy′+y=0 (Cauchy–Euler).
- **DE-4:**
  - (a) convert y″+3y′+2y=0 to a system;
  - (b) x′=[[1,2],[2,1]]x (saddle); [[−1,2],[−2,−1]] (spiral sink); [[0,1],[−1,0]] (center);
  - (c) defective [[3,1],[0,3]];
  - (d) e^{tA} by diagonalization;
  - (e) normal modes of two masses with three springs;
  - (f) classify from trace and determinant alone.
- **DE-5:**
  - (a) equilibria, Jacobian and classification for the damped pendulum;
  - (b) Lotka–Volterra: linearization is inconclusive at coexistence; use the constant of motion;
  - (c) competing species via nullclines;
  - (d) an energy function for x″+x−x³=0;
  - (e) Bendixson–Dulac ruling out cycles.
- **DE-6:**
  - (a) L{t e^{2t}sin t}; an inverse via partial fractions;
  - (b) y″+y=u(t−π), zero initial data;
  - (c) y″+2y′+5y=δ(t−1);
  - (d) y′+y=f(t) solved as y=e^{−t}*f;
  - (e) a square-wave forced RC circuit.
- **DE-7:**
  - (a) Airy's equation series to order x⁶;
  - (b) classify the singular points of Bessel's equation;
  - (c) Frobenius roots and the first terms for x²y″+xy′+(x²−¼)y=0.
- **DE-8:**
  - (a) eigenvalues of y″+λy=0 with y(0)=y(L)=0, and with Neumann conditions;
  - (b) the Fourier series of a square wave, showing Gibbs;
  - (c) heat in a rod with ends at 0;
  - (d) a plucked string by modes and by d'Alembert.

#### (8) Interactive visualization ideas
- **Slope-field explorer.**
  - Draws: a field with draggable initial points spawning solution curves.
  - Learner controls: "existence/uniqueness mode" with presets y′=2√|y| (dragging onto y=0 reveals branching families), y′=y² (blow-up time readout) and y′=1/x.
  - Teaches: what Picard guarantees and what fails.
  - Simplified: numerical curves at a fixed tolerance.
- **Phase-line & bifurcation slider.**
  - Draws: x′=f(x;h) with its equilibria and stability arrows, plus a bifurcation diagram traced as h moves.
  - Teaches: stability; saddle-node bifurcation.
- **Method race (Euler/Heun/RK4).**
  - Draws: approximate trajectories versus the exact one, and a log-log error-versus-h plot with fitted slopes 1, 2 and 4. An orbit mode integrates a Kepler orbit and shows energy drift for each method.
  - Learner controls: step size h.
  - Teaches: order of accuracy; why RK4 is the default.
  - Simplified: non-adaptive steps.
- **Spring–mass–damper / RLC twin.**
  - Draws: an animated mass and its x(t) graph, with the characteristic roots plotted in the complex plane. Roots move as c increases: a complex pair collides on the real axis at critical damping, then splits. A toggle relabels the symbols as L, R, 1/C.
  - Learner controls: m, c, k and the initial conditions.
  - Teaches: damping regimes, root–behavior correspondence, the mechanical–electrical analogy.
- **Resonance sweep.**
  - Draws: forcing at frequency ω; the steady-state amplitude curve C(ω) built live; separate transient and steady-state traces; a beats mode near ω₀.
  - Learner controls: ω and the damping c.
  - Teaches: practical resonance, phase lag, transients.
- **Undetermined-coefficients card game.**
  - Draws: a forcing term, a trial-form card chosen by the learner, and the app's duplication check against y_c.
  - Teaches: the multiply-by-t rule.
- **Trace–determinant navigator.**
  - Draws: the phase portrait of the matching matrix, with eigen-lines, as the learner drags a point in the (τ,Δ) plane; the parabola τ²=4Δ drawn on the plane; matrix-entry sliders as an alternative input.
  - Teaches: the whole classification at once.
- **Normal-mode lab.**
  - Draws: two or three coupled masses, with mode buttons that excite one eigenvector; energy sloshing between masses for mixed initial conditions.
  - Teaches: eigenvectors as physical shapes.
- **Matrix-exponential flow.**
  - Draws: the unit square carried by the flow e^{tA} (rotating, shearing, spiraling).
  - Learner controls: a t slider.
  - Teaches: e^{tA} as a time-evolution map, which later becomes the flow of a vector field.
- **Pendulum phase plane.**
  - Draws: energy contours, the separatrix and a live pendulum animation; a linearization magnifier at each equilibrium; the "trouble with centers" example side by side with its linearization.
  - Learner controls: damping.
  - Teaches: nonlinear versus linear behavior; when linearization lies.
- **Ecology plane.**
  - Draws: Lotka–Volterra closed orbits; competing species with nullclines and basins.
  - Learner controls: parameter sliders.
- **Van der Pol and Lorenz.**
  - Draws: a limit cycle with a μ slider; two Lorenz trajectories started 10⁻⁸ apart diverging.
  - Teaches: attractors; sensitive dependence.
- **Laplace s-plane ↔ time response.**
  - Draws: draggable poles and zeros, with the impulse and step responses updating; a convolution "sliding flipped kernel" animation.
  - Teaches: transfer functions; impulse response; convolution.
- **Shooting for eigenvalues.**
  - Draws: solutions of y″+λy=0 launched from y(0)=0, with a λ slider; only discrete λ hit y(L)=0; the string modes animated.
  - Teaches: why BVPs quantize.
- **Fourier builder / heat / wave.**
  - Draws: partial sums of a Fourier series (Gibbs overshoot stays at about 9% of the jump); heat-equation smoothing; d'Alembert pulses splitting.
  - Learner controls: the number of partial-sum terms.

#### (9) Connections to physics and onward to GR
- **Oscillators (free, damped, driven, coupled), RLC circuits, mechanical systems, population models and orbital mechanics** are the core of this course.
- **Bessel and Legendre functions** come from Frobenius and series. They are the radial and angular functions of electromagnetism, quantum mechanics and multipole expansions [E].
- **Eigenvalue BVPs** lead to quantum mechanics (particle in a box ⇔ y″+λy=0 with Dirichlet conditions) and to normal modes.
- **Laplace transforms and convolution** lead to Green's functions, which lead to retarded potentials.
- **GR:**
  - The geodesic equation ẍ^μ+Γ^μ_αβ ẋ^α ẋ^β=0 is a second-order nonlinear ODE system.
  - The orbit equation u″+u=GM/h²+3GMu²/c² (the Binet form with the Schwarzschild correction) is solved by perturbation, giving perihelion precession.
  - Effective-potential phase-plane analysis gives circular-orbit stability and the ISCO at r=6GM/c² (linearization about equilibria).
  - The Friedmann equation is a first-order nonlinear ODE for the scale factor a(t).
  - Linearized gravity, i.e. gravitational waves, is "linearize, then solve a wave equation".
  - RK4 is the workhorse of black-hole ray tracing and orbit integration.

#### (10) Appropriate depth and rigor
- **Theorems:** stated and used (existence/uniqueness, linear-theory structure, Laplace uniqueness). Proofs are excluded, apart from Picard iteration as [E].
- **Methods:** computational fluency, plus qualitative reasoning (phase lines, phase portraits).
- **Numerics:** error order demonstrated empirically.
- **Series and Frobenius:** procedural.

#### (11) Common misconceptions and error patterns
- **First order:**
  - dividing by y and losing y=0;
  - a misplaced constant (y=e^{x²}+C instead of Ce^{x²});
  - an integrating factor used before writing standard form;
  - "superposition works for nonlinear ODEs";
  - "an equilibrium is a solution that eventually stops" (equilibria are constant solutions; for nice f, other solutions approach them only asymptotically and never reach them in finite time);
  - a slope field read as a graph of y.
- **Linear higher order:**
  - characteristic roots of y″+4y=0 taken as ±4 (they are ±2i);
  - the general solution missing y_c;
  - an undetermined-coefficients guess that duplicates y_c without a factor t;
  - complex exponentials left unconverted to real form;
  - "damped resonance ⇒ infinite amplitude";
  - "the resonance peak is always at ω₀".
- **Systems:**
  - eigenvectors "wrong" because they are scaled differently (any scalar multiple is right);
  - "trajectories can cross";
  - classifying by the sign of the determinant alone;
  - "a center in the linearization ⇒ a center in the nonlinear system";
  - e^{A+B}=e^Ae^B for non-commuting matrices;
  - e^{tA} computed entrywise.
- **Laplace:**
  - L{fg}=FG (only convolution transforms to a product);
  - dropping the initial values in L{y′};
  - second shift applied without shifting f (L{u(t−a)f(t)}≠e^{−as}F(s));
  - δ treated as a function with δ(0)=1.
- **Series:**
  - index-shift errors in recurrences;
  - Frobenius used at an ordinary point (unnecessary) or ordinary-point series at a singular point.
- **BVPs:** "BVPs have unique solutions like IVPs"; "λ can be any number".
- **Numerics:** "Euler error is independent of h"; "a smaller h is always better, regardless of round-off and stability".

### Gaps
- Not verified this session: MIT 18.03, Paul's Online Notes (DE), and Strogatz's chapter list. The trace–determinant presentation is standard but its Strogatz citation is unverified.
- USU MATH 2280's textbook is unknown, so it is unclear which of the [O] chapters (nonlinear, series, Fourier) USU covers.
- Differential-equations misconception research is unverified and should be checked before citing: Rasmussen (2001), *Journal of Mathematical Behavior*, a framework for students' understandings of DEs and equilibrium solutions; the inquiry-oriented differential equations literature.
- Exact edition alignment: Lebl's BD/EP numbers may refer to earlier editions than BD 12e.

## 7. MATH 2250 Linear Algebra and Differential Equations: what is the combined pathway's content map?

### Takeaway
USU MATH 2250 (4 credits; catalog title "Linear Algebra and Differential Equations"; the brief calls it "Differential Equations & Linear Algebra") is an engineering-oriented compression of MATH 2270+2280 into one course. Its description names:
- linear systems;
- abstract vector spaces;
- matrices through eigenvalues and eigenvectors;
- solutions of ODEs;
- Laplace transforms;
- first-order systems.

It does not mention boundary-value problems, series solutions, orthogonality and least squares, quadratic forms or the SVD.

The Atlas should model 2250 as a curated path through the LA and DE modules, plus a "2250 → physics/GR bridge pack" that restores the omitted pieces for learners who take 2250 instead of 2270+2280. The companion notes report that USU's physics BS accepts either route.

### Cited Findings
- **USU MATH 2250 description (4 cr).** "Linear systems, abstract vector spaces, matrices through eigenvalues and eigenvectors, solutions of ODEs, Laplace transforms, first-order systems" — [MATH 2250 catalog](https://catalog.usu.edu/courses/MATH2250)
- **USU's AMLC course-materials page** says the course is "primarily oriented towards students in engineering" (per the companion notes) — [AMLC MATH 2250](https://artsci.usu.edu/math-stats/amlc/course-materials/math-2250/index.php)
- **Degree map** (per the companion notes): "MATH 2250 or MATH 2270 /MATH 2280 must be taken before PHYS 3750" — [USU degree map](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015)
- **Another USU program** states that "both MATH 2270 and MATH 2280 may be taken in place of MATH 2250" (per the companion notes) — [USU ME Aerospace](https://catalog.usu.edu/preview_program.php?catoid=39&poid=39206&returnto=30341)
- **Snow College's MATH 2250 entry** — [Snow College 2250](https://snow.edu/academics/science_math/math/syllabus.html?q=4622)
  - It lists systems of linear equations, matrix operations, vector spaces and eigensystems, initial-value problems, Laplace transforms, numerical methods and modeling.
  - It says the course is required for specific engineering and science majors at Utah's senior institutions, "particularly Utah State University".
- **University of Utah MATH 2250 syllabi** describe "a hybrid course which teaches the allied subjects of linear algebra and differential equations" (search summary; the specific page was not identified) — [U of Utah 2250 (Hernandez)](https://www.math.utah.edu/~dhernan/math2250.html); [U of Utah 2250 syllabus (2019)](https://www.sci.utah.edu/~akil/docs/courses/2019fall/math2250/syllabus.pdf)
- **Edwards–Penney–Calvis, *Differential Equations and Linear Algebra* 4e** — [Pearson DE&LA 4e](https://www.pearson.com/en-us/subject-catalog/p/differential-equations-and-linear-algebra/P200000006173/9780137313617); [MathWorks listing](https://ch.mathworks.com/academia/books/differential-equations-and-linear-algebra-edwards.html)
  - It "combines core topics in elementary differential equations with concepts and methods of elementary linear algebra".
  - Its first chapters are First-Order Differential Equations and Mathematical Models and Numerical Methods (population models; equilibrium solutions and stability).
- **Lebl's suggested schedule for a combined ODE+linear-algebra course:** introduction, first-order, second-order, the linear-algebra appendix, systems (without the matrix review), and possibly nonlinear — [Lebl ch-intro.tex](https://github.com/jirilebl/diffyqs/blob/master/ch-intro.tex)

### Inferences
#### (1) Course identity
- USU MATH 2250 Linear Algebra and Differential Equations (4 credits, QI), engineering-oriented.
- Standard equivalent: Edwards–Penney–Calvis *DE&LA*. Its chapters, from memory and verified only through ch. 2:
  1. First-Order DEs
  2. Models & Numerical Methods
  3. Linear Systems & Matrices
  4. Vector Spaces
  5. Higher-Order Linear DEs
  6. Eigenvalues & Eigenvectors
  7. Linear Systems of DEs
  8. Matrix Exponential Methods
  9. Nonlinear Systems
  10. Laplace Transform Methods
  11. Power Series Methods
- USU's description lists linear algebra first. The Utah 2250 tradition (Edwards–Penney) interleaves the two: DE → LA → DE.

#### (2) Major subjects
1. First-order ODEs and models
2. Numerical methods
3. Linear systems and matrices
4. Determinants
5. Vector spaces (ℝⁿ and abstract)
6. Higher-order linear ODEs and vibrations
7. Eigenvalues and diagonalization
8. First-order linear systems of ODEs
9. [O] Matrix exponential
10. [O] Nonlinear systems
11. Laplace transforms

#### (3) Pathway tree (P-n), composed from the 2270/2280 modules above
- **P-1 First-order ODEs [C]:**
  - DE-1;
  - DE-2.1–2.4;
  - DE-2.7;
  - DE-2.2 existence/uniqueness;
  - DE-2.5 exact [O];
  - DE-2.6 substitution [O].
- **P-2 Models & numerics [C]:**
  - DE-2.8 (population, drag);
  - DE-2.9 (Euler, improved Euler, RK4).
  - The Snow entry names numerical methods; USU's description does not.
- **P-3 Linear systems & matrices [C]:**
  - LA-1;
  - LA-2;
  - LA-3;
  - LA-8 (determinants, without the big formula);
  - curve fitting (polynomial interpolation).
- **P-4 Vector spaces [C — "abstract vector spaces" is named]:**
  - LA-5;
  - LA-6, including function spaces and the solution space of L[y]=0;
  - LA-4 linear maps (light);
  - orthogonality in ℝⁿ (LA-10, first two lessons) [O].
- **P-5 Higher-order linear ODEs [C]:**
  - DE-3.1–3.6, taught in vector-space language (dim of the solution space = order).
- **P-6 Eigenvalues & eigenvectors [C — "through eigenvalues and eigenvectors"]:**
  - LA-9 (diagonalization; powers; Markov [O]).
- **P-7 First-order linear systems [C — named]:**
  - DE-4.1–4.6 (eigenvalue method, phase-plane gallery, normal modes, repeated eigenvalues).
- **P-8 Matrix exponential & nonhomogeneous systems [O]:**
  - DE-4.7–4.8.
- **P-9 Nonlinear systems [O]:**
  - DE-5.1–5.3.
- **P-10 Laplace transforms [C — named]:**
  - DE-6.1–6.4, including step, delta and convolution.
- **Usually absent from 2250:**
  - DE-7 series;
  - DE-8 BVP/Fourier (USU names BVPs only for 2280);
  - LA-7 beyond the eigenbasis idea;
  - LA-10 least squares and Gram–Schmidt;
  - LA-11 spectral theorem and quadratic forms;
  - LA-12 SVD;
  - LA-13 complex spaces;
  - LA-14 duality.
- **"2250 → physics/GR bridge pack" [E-for-2250 learners]:**
  - LA-7 full;
  - LA-10;
  - LA-11;
  - LA-12;
  - LA-14;
  - DE-8.1 BVPs and eigenfunctions;
  - DE-7.2 ordinary-point series.
  - This is roughly the content gap between 2250 and 2270+2280. For a GR-bound learner, LA-7, LA-11 and LA-14 matter most.

#### (4)–(11) Skills, prerequisites, foundations, techniques, visualizations, physics/GR links, depth and misconceptions
These are inherited from the LA and DE modules above. The pathway-specific points:
- **Depth:** one semester carries both subjects, so depth is lower per topic. Expect computation-first linear algebra (fewer proofs) and abstract spaces at the "verify the axioms; find a basis" level.
- **A hidden foundation 2250 makes explicit:** solution sets of homogeneous linear ODEs *are* vector spaces, and x′=Ax *is* an eigenproblem. Lessons should exploit this in both directions, as the integration point of the two subjects.
- **Pathway misconceptions** come mainly at the seams:
  - treating a function space's "vectors" as columns;
  - thinking the Wronskian test proves *dependence* when it is zero at a point;
  - applying matrix eigen-methods to non-constant-coefficient systems.

### Gaps
- USU 2250's textbook, syllabus and whether it covers nonlinear systems or the matrix exponential are unknown.
- Edwards–Penney–Calvis *DE&LA* chapters 3–11 are unverified this session.
- Which route USU physics advisors recommend is the catalog researcher's domain.

## 8. Which difficult or under-emphasized topics must not be omitted? (cross-course checklist)

### Takeaway
Every must-not-omit topic named in the brief has a verified home in at least one standard source. The most commonly skipped ones are the Atlas's biggest leverage points, because physics and GR use them:
- numerical error bounds;
- the Taylor remainder;
- polar area and conics;
- exact equations;
- variation of parameters;
- delta and convolution;
- BVP eigenvalue problems;
- linearization caveats;
- change of basis and similarity;
- quadratic forms;
- the SVD;
- duality.

### Cited Findings
**Calc II:**
- Numerical integration with error bounds, ∝1/n² (midpoint, trapezoid) and ∝1/n⁴ (Simpson), with formulas and choose-n exercises — [OS2 m53685](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53685/index.cnxml); [UGA syllabus](https://math.franklin.uga.edu/sites/default/files/MATH2260_departmental_syllabus%2C%20effective%20Fall%202023.pdf)
- Surface area of revolution — Stewart 9e §8.2 [Loyola](https://www.luc.edu/math/academics/courses/math162/); OS2 ch. 2 "Applications of Integration" (module present in the [v2 collection](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-2.collection.xml))
- Improper-integral comparison theorem and Gabriel's horn — [OS2 m53686](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53686/index.cnxml)
- Taylor's theorem with Lagrange remainder — [OS2 m53817](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53817/index.cnxml)
- Binomial series — [OS2 m53769](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53769/index.cnxml)
- Conics: eccentricity, polar form, rotation and the discriminant — [OS2 m53846](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53846/index.cnxml)

**Linear algebra:**
- Change of basis, Jordan form, the spectral theorem, PD/PSD, the SVD, the pseudoinverse and PCA as standard lectures — [MIT 18.06 S25](https://github.com/mitmath/1806)
- Orthogonal diagonalization, quadratic forms, constrained optimization and the SVD — [Lay 6e ch. 7](https://www.pearson.com/en-us/subject-catalog/p/linear-algebra-and-its-applications/P200000006235/9780135851203)
- Bilinear forms, quadratic forms and tensor products in a dedicated multilinear chapter — [Axler 4e](https://library.oapen.org/bitstream/20.500.12657/85067/1/978-3-031-41026-0.pdf)

**ODEs:**
- Existence and uniqueness with counterexamples, exact equations and integrating factors, and the Euler/improved Euler/RK4 error orders — [Lebl first-order](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-first-order-ode.tex)
- Variation of parameters — [Lebl higher-order](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-higher-order-ode.tex)
- Step functions, delta and convolution — [Lebl Laplace](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-laplace.tex)
- Frobenius — [Lebl power series](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-power-ser.tex)
- BVP eigenvalue problems — [Lebl Fourier/BVP](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-fourier-and-pde.tex); [Lebl SL](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-eigenvalue-probs.tex)
- Linearization, classification and the "trouble with centers" — [Lebl nonlinear](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-nonlin-systems.tex)
- The phase-plane gallery — [Lebl systems](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-systems.tex)

**Where textbooks themselves mark these as skippable:**
- Lebl marks substitution, Euler's method, exact equations and first-order PDE as "can safely be skipped" — [Lebl first-order](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-first-order-ode.tex)
- Lebl treats Laplace, Sturm–Liouville, power series and nonlinear as interchangeable optional "topics" — [Lebl ch-intro.tex](https://github.com/jirilebl/diffyqs/blob/master/ch-intro.tex)

### Inferences
**Checklist.** Each entry gives the topic, its Atlas home, why it is often skipped, and how to keep it.

**Calc II**
- **Numerical integration error bounds** — C2-2.6
  - Often skipped as "just calculator work".
  - Keep it: frame it as certified approximation; use the log-log error-slope lab; give choose-n items.
- **Surface area of revolution** — C2-1.5
  - Often cut for time; formula confusion.
  - Keep it: the cylinder-band trap demo shows why ds.
- **Hyperbolic functions** — C2-1.10
  - They fall between Calc I and II (placement varies).
  - Keep it: teach via the unit hyperbola; tie to rapidity and the catenary.
- **Improper-integral comparison** — C2-2.7
  - Logic direction errors.
  - Keep it: overlay f≤g plots and give "which conclusion follows?" items.
- **Lagrange remainder** — C2-5.3
  - It is abstract (the unknown c).
  - Keep it: use the error-envelope visual; make bound-versus-actual comparisons.
- **Binomial series** — C2-5.4
  - Often rushed.
  - Keep it: use the relativity γ-expansion lesson.
- **Conics and polar area** — C2-6.4–6.5
  - Polar is often moved to Calc III; conics are assumed from precalculus.
  - Keep it: run Kepler II and Kepler I as a two-lesson arc.

**Calc III**
- **Path-dependent limits; differentiability versus partials** — C3-3.2/3.4
  - Skipped as "pathological".
  - Keep it: path tester; tangent-plane zoom.
- **Jacobians and change of variables** — C3-4.7
  - Often the end-of-term casualty.
  - Keep it: grid-mapping visual; link to det and to √|g|.
- **Orientation and simple connectivity** — C3-5.3/5.6
  - Treated as fine print.
  - Keep it: vortex counterexample; flip-normal items.

**Linear algebra**
- **Abstract vector spaces** — LA-6
  - Feared as "too abstract" in applied courses.
  - Keep it: use ODE solution spaces and polynomial spaces as the motivating examples.
- **Change of basis and similarity** — LA-7
  - Notation-heavy; direction errors.
  - Keep it: two-grids visual; "same map, different basis".
- **Orthogonal diagonalization and quadratic forms** — LA-11
  - End-of-semester position (Lay ch. 7).
  - Keep it: rotate-the-conic lesson; inertia-tensor application.
- **SVD** — LA-12
  - End-of-semester position.
  - Keep it: circle-to-ellipse factorization visual.
- **Duality** — LA-14
  - Absent from most sophomore courses.
  - Keep it: add as [E]; it is the shortest path to tensors.

**ODE**
- **Existence and uniqueness** — DE-2.2
  - Stated, never used.
  - Keep it: three counterexample archetypes; non-crossing consequence.
- **Exact equations** — DE-2.5
  - "Can safely be skipped" (Lebl).
  - Keep it: link to potentials (C3-5.3), which makes it a cheap two-lesson reuse.
- **Variation of parameters** — DE-3.5
  - Algebra-heavy.
  - Keep it: worked tan x example; contrast with undetermined coefficients.
- **Laplace with step, impulse and convolution** — DE-6.2–6.4
  - Delta feels non-rigorous.
  - Keep it: pulse-limit visual; s-plane ↔ response.
- **Series and Frobenius** — DE-7
  - Interchangeable topic; often dropped.
  - Keep it: [O]/[E] physics track via Bessel.
- **BVPs and eigenvalue problems** — DE-8.1
  - Sits in the "Fourier" chapter that systems courses skip; USU names BVPs.
  - Keep it: the shooting-for-eigenvalues visual.
- **Linearization and phase-plane classification** — DE-4.4, DE-5.1–5.2
  - USU's 2280 description is silent.
  - Keep it: trace–determinant navigator; trouble-with-centers item.
- **Numerical methods and error** — DE-2.9
  - "Can safely be skipped" (Lebl); USU says "analytic".
  - Keep it: method race and orbit-energy drift, which also feeds the learner's Python skills.

### Gaps
- Whether USU's sections actually cover the [O] items (polar, Frobenius, nonlinear, numerical) cannot be determined without syllabi.

## 9. How should the required physics applications be woven in, and what is the onward path to tensors, differential geometry and GR?

### Takeaway
Each required physics application has a natural earliest home and a deepening sequence across courses. The Atlas should thread them as recurring "storylines" rather than one-off examples:
- the oscillator (C1 → C2 → DE-3 → DE-4 → DE-5);
- the orbit (C2 conics/polar → C3 vector functions → DE-5 → GR precession);
- the field (C3 potentials/flux → DE-8 Laplace/heat/wave).

In parallel, a GR "spine" of ten bridge ideas runs through the courses: differentials, line elements, Jacobians, covectors, transformation laws, bilinear forms/signature, geodesic ODEs, curvature, PDEs. It turns the core sequence into tensor-ready preparation without adding a course.

### Cited Findings
- **Integration applications, conics and orbits** — [OS2 collection](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-2.collection.xml); [OS2 m53846](https://github.com/openstax/osbooks-calculus-bundle/blob/main/modules/m53846/index.cnxml)
  - OpenStax Calc Vol. 2's applications chapter has a "Physical Applications" section and a "Moments and Centers of Mass" section.
  - Its conic-sections section invokes Kepler's first law and notes that comets fast enough to escape the Sun follow hyperbolic paths.
- **OpenStax Calc Vol. 3** has sections on calculating centers of mass and moments of inertia, and on motion in space (counts verified; titles per TOC) — [OS3 collection](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-3.collection.xml)
- **Lebl's mechanical and electrical applications** — [Lebl higher-order](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-higher-order-ode.tex); [Lebl systems](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-systems.tex); [Lebl Laplace](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-laplace.tex)
  - RLC as the analog of the mass–spring–damper.
  - The linearized pendulum.
  - Coupled-mass normal modes with forced resonance.
  - A rocket firing for a fixed time as a Laplace example.
  - Beam bending by delta loads.
- **Lebl's nonlinear and PDE applications** — [Lebl nonlinear](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-nonlin-systems.tex); [Lebl Fourier/PDE](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-fourier-and-pde.tex); [Lebl SL](https://raw.githubusercontent.com/jirilebl/diffyqs/master/ch-eigenvalue-probs.tex)
  - The nonlinear pendulum, with its ≈15% period error at π/2.
  - Lotka–Volterra.
  - Duffing, Lorenz and the double pendulum.
  - Heat, wave and Laplace equations.
  - Underground temperature waves.

### Inferences
**Physics-application weave.** Each storyline below lists its homes across the courses, its best visual, and its onward link toward GR.

- **Population models**
  - Homes: C1 (exponential) → C2-1.9 and C2-3 (logistic) → DE-2.7 (harvesting, bifurcation) → DE-5.3 (Lotka–Volterra, competition) → LA-9 (Leslie and Markov matrices).
  - Best visual: phase line with bifurcation slider; ecology plane.
  - Onward: stability analysis carries over to cosmological fixed points [E].
- **Oscillators** (free, damped, driven, resonance)
  - Homes: M0-8 (amplitude–phase) → C1 (SHM derivatives) → C2-5 (small-angle via Taylor; Euler's formula) → DE-3.4–3.6 → DE-4.5 (normal modes) → DE-5.3 (nonlinear pendulum) → DE-8.5 (Fourier forcing).
  - Best visual: spring–damper/RLC twin; resonance sweep; normal-mode lab.
  - Onward: harmonic oscillators underlie quantum mechanics and field theory; gravitational-wave detectors are driven damped oscillators.
- **Orbital dynamics**
  - Homes: M0-6 (Kepler III by log-log) → C1-4.9 (Kepler's equation by Newton) → C2-6.4–6.5 (Kepler II by polar area; Kepler I conics) → C3-2.4 (central force ⇒ planar, equal areas) → DE-2.9 (RK4 orbit integration, energy drift) → DE-5 (effective potential; stability of circular orbits).
  - Best visual: polar sweep; conic morpher; method race (orbit mode).
  - Onward: Schwarzschild orbits; the 3GMu²/c² term; perihelion precession; the ISCO.
- **RLC circuits**
  - Homes: DE-2.4 (RC/RL) → DE-3.4–3.6 (RLC) → DE-6 (transfer functions, step inputs) → LA-2 (Kirchhoff networks).
  - Best visual: RLC twin; s-plane ↔ response.
  - Onward: the analogy carries into linear response theory.
- **Mechanical systems**
  - Homes: C2-1.6 (springs, cables) → C3-1.3 (torque) → DE-3/DE-4.5 (coupled masses) → DE-6.4 and DE-9 (beams).
  - Best visual: normal-mode lab; shooting eigenvalues.
  - Onward: Lagrangian mechanics, where configuration space is a manifold.
- **Work, center of mass, moments of inertia**
  - Homes: C2-1.6–1.7 (single-variable) → C3-4.6 (multivariable; inertia) → LA-11 (inertia tensor, principal axes).
  - Best visual: balance lamina; quadratic-form explorer.
  - Onward: the inertia tensor is the first rank-2 tensor most learners meet.
- **Flux**
  - Homes: C3-5.2 (flux across curves) → C3-5.6–5.8 (surface flux, Gauss's law, continuity).
  - Best visual: flux and Gauss; butterfly nets.
  - Onward: the stress–energy tensor's conservation, ∇_μT^{μν}=0, is a continuity equation.
- **Potentials**
  - Homes: C2-2.7 (gravitational PE via an improper integral) → C3-5.3 (conservative fields) → C3-5.5 (Laplacian) → DE-2.5 (exactness = potential) → DE-8.8 (Laplace equation).
  - Best visual: vector-field lab; pendulum energy contours.
  - Onward: Poisson's equation ∇²Φ=4πGρ becomes Einstein's equations; the weak-field limit is g_tt≈−(1+2Φ/c²).

**GR spine.** Each bridge idea, where it is taught, and what it becomes later:
1. **Differentials and local linearity** (C1-4.2, C3-3.4) → tangent spaces; dx^μ as basis covectors.
2. **Arc length and the line element** (C2-1.4, C2-6.2, C3-2.3) → ds²=g_μν dx^μ dx^ν; proper time.
3. **Coordinate line elements and Jacobians** (C3-1.6, C3-4.5, C3-4.7) → metric components in curvilinear coordinates; √|g| d⁴x.
4. **The derivative as a linear map; the gradient as a covector** (C3-3.5–3.6, LA-4) → df versus ∇f; index raising.
5. **Change of basis and transformation laws** (LA-7) → tensor transformation laws; general covariance.
6. **Dual spaces, bilinear forms, signature** (LA-14, LA-11) → one-forms, the metric tensor, Minkowski space, local inertial frames.
7. **Hyperbolic functions and rapidity** (C2-1.10) → Lorentz boosts as hyperbolic rotations; Rindler hyperbolic motion.
8. **ODE systems, linearization, stability** (DE-4, DE-5) → the geodesic equation; orbit stability; perturbation theory.
9. **Curvature of curves and surfaces** (C3-2.3, an [E] Gaussian-curvature lesson) → the Riemann tensor via parallel transport [handled by the GR-track researcher].
10. **PDEs: Laplace, heat, wave** (C3-5.5, DE-8) → linearized gravity and gravitational waves; the Einstein equations as PDEs.

### Gaps
- The GR-track content beyond the spine is another researcher's scope (task: "Mathematics of Spacetime track").
- The physics claims in the spine (Binet correction, ISCO, weak-field metric) are standard GR results stated from domain knowledge, not from sources retrieved this session. The GR-track researcher should cite them.

## 10. Which topics could a learner who has finished Calculus I likely test out of, and what diagnostic items would verify that?

### Takeaway
This learner has completed Calc I, is in Calc II and calculus-based Physics I, and has engineering/aerospace experience.
- **Likely test-outs:**
  - most of M0;
  - all of MATH 1210 content;
  - Calc II's integration-review gate (C2-0).
- **Likely M0 holes:** trig identities and inverse trig, conics and rotation, complex polar form, and logic/proof.
- **Fast-tracks, not test-outs** (expect partial knowledge with theory gaps):
  - 3-D vectors, dot and cross products (C2-7/C3-1);
  - basic matrix arithmetic (LA-2/3);
  - constant-coefficient vibration and RLC ODEs (DE-3.2–3.4).
- **No test-out** for the rest of Calc II, which is in progress.

Test-out should require mastery on a short adaptive diagnostic weighted toward the Calc I competencies that downstream courses actually consume. A module-level "skip" should be granted only when no *critical* item is missed.

### Cited Findings
- **USU accepts AP scores for the Calc II prerequisite.** One USU MATH 1220 syllabus lists C- or better in MATH 1210, *or* AP Calculus AB ≥4, *or* BC ≥3, as satisfying the prerequisite (per the companion notes) — [Heal MATH 1220 syllabus](https://www.usu.edu/math/rheal/math1220/syllabus)
- **USU's physics BS assumes MATH 1210 is passed on entry** (per the companion notes) — [USU degree map](https://catalog.usu.edu/preview_program.php?catoid=39&poid=40015)
- **OpenStax ships the Calc I integration and applications chapters again at the start of Vol. 2.** That makes the review explicit at the Calc II entry point — [v2 collection](https://github.com/openstax/osbooks-calculus-bundle/blob/main/collections/calculus-volume-2.collection.xml)

### Inferences
**Test-out policy (design proposal):**
- **Gating:** module-level pretests of 4–8 items. A module is skipped at ≥85% *and* no miss on items tagged "critical".
- **Calibration:** short "confirm" retests are spaced 1–2 weeks later, so a lucky pass does not permanently hide a gap.
- **Fast-track:** a failed critical item unlocks only its lesson, not the whole module.

**Calc I verification diagnostic** (each item → competency verified; ★ = critical; the trap shows what a wrong answer reveals):
1. ★ lim_{x→0} sin(3x)/x → limits via the standard limit. Trap: 1.
2. lim_{x→∞}(3x²−x)/(5x²+2) → limits at infinity.
3. ★ For which k is a piecewise function continuous at 1? → continuity.
4. Interpret "for every ε>0 there is δ>0…" for f(x)=2x+1 at x=3 and find δ for ε=0.1 → ε–δ.
5. ★ d/dx[x²·e^{sin x}] → product and chain rules.
6. ★ d/dx arctan(√x) → chain rule plus inverse trig.
7. dy/dx for x³+y³=6xy at (3,3) → implicit differentiation.
8. d/dx x^x → logarithmic differentiation. Trap: x·x^{x−1}.
9. ★ A spherical balloon's radius grows at 2 cm/s. Find dV/dt at r=10 → related rates. Trap: substituting r before differentiating.
10. ★ Estimate (8.1)^{1/3} by linearization, and find the relative error in V when r has 1% error → linearization and differentials.
11. f(x)=x³−3x on [−2,3]: absolute extrema → closed-interval method. Trap: ignoring endpoints.
12. Does the MVT apply to f(x)=|x| on [−1,1]? → theorem hypotheses.
13. Sketch from sign charts of f′ and f″ → shape of the graph.
14. ★ An optimization word problem (minimum-cost cylinder) → modeling plus domain.
15. ★ lim_{x→0⁺} x ln x and lim (1+2/x)^x → L'Hôpital, including 0·∞ and 1^∞.
16. Two Newton iterations for x²−2 from x₀=1 → Newton's method.
17. ★ v(t)=t²−4t+3 on [0,4]: displacement and total distance → net change.
18. ★ d/dx∫₂^{x³}√(1+t²)dt → FTC1 with the chain rule. Trap: missing 3x².
19. ★ ∫₀^{π/2} sin x cos²x dx with changed limits → definite substitution.
20. ∫dx/(x²+4x+5) → inverse-trig integral via completing the square.
21. Left Riemann sum L₄ for ∫₀²x²dx, and whether it over- or underestimates → Riemann sums.
22. Average value of f on [a,b] → definite-integral meaning. Trap: (f(a)+f(b))/2.

**M0 spot-checks for this profile:** items 8–10, 13–16 and 18–19 of the M0 bank in §1 (trig, conics, complex numbers, logic). These are the likely holes for an engineering-trained learner who has done Calc I.

**Fast-track probes (engineering background):**
- **Vectors:**
  - torque r×F with a sign or orientation check;
  - the projection of a force;
  - the plane through three points.
- **Matrices:**
  - multiply 2×3·3×2;
  - invert a 2×2;
  - "is AB=BA?";
  - interpret det=0.
- **ODEs:**
  - solve x″+2x′+5x=0;
  - classify the damping;
  - the RLC analog;
  - the resonance frequency.
- Expect these to pass computationally. Probe theory separately:
  - why superposition holds;
  - what existence/uniqueness guarantees;
  - what e^{tA} means.
- Failing a theory probe routes the learner to the [C] theory lessons only.

**Calc II items already reachable** (to place the learner within C2, since they are mid-course):
- integration by parts with a cyclic integral;
- a partial-fraction form;
- a trig-substitution triangle;
- a series-test choice;
- an interval of convergence with endpoints;
- a Lagrange bound;
- a polar area with petals.
Use results to start the learner at their current frontier, not to grant test-out.

### Gaps
- No validated instrument was retrieved for this purpose (concept inventories such as Epstein's Calculus Concept Inventory, or the PCA). The item sets above are design proposals and need piloting.
- The AP Calculus BC Course and Exam Description was not retrieved. It would document exactly which Calc II topics (series, parametric/polar, Euler's method, logistic) a BC student has seen.
- USU's credit-by-exam or challenge-exam policy for MATH 1220+ was not checked; it belongs to the catalog researcher.
