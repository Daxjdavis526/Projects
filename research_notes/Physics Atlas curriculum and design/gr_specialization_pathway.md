# The Road to Einstein's Field Equations: a design-ready content map for the 37-step GR specialization of The Physics Atlas (research notes, state of the field 27 Oct 2026)

**Reading key.**
- **Status badges** (the labelling scheme proposed in Q5): **[EST-OBS]** established and observed; **[EST-DER]** established mathematical consequence of GR (derivation or theorem); **[MATH]** mathematically allowed, with no evidence it exists or requiring conditions not known to occur; **[SPEC]** speculative proposal or research programme; **[OPEN]** contested data or tension below discovery level; **[REFUTED]** published claim since shown wrong; **[MODEL]** teaching model or analogy, not physics.
- **[C]** = computed for these notes in Python/SciPy. **[V]** = verified symbolically in SymPy, or numerically for Kerr and Alcubierre. **[S]** = standard textbook result whose printed form was not re-fetched this session; most [S] items are also [V]-checked. The scripts and their outputs are in `/tmp/claude-0/-home-user-Projects/c2b332c4-63d7-5ab0-a04b-b5c77d4e25cb/scratchpad/gr/`: `symbolic_checks.py`, `symbolic_checks2.py`, `numeric_answers.py`, `numeric_tail.py` and `extra_checks.py`, with results in `symbolic_results.txt`, `symbolic_results2.txt` and `numeric_results.txt`.
- **Constants used:** G = 6.67430×10⁻¹¹ m³ kg⁻¹ s⁻², c = 299 792 458 m/s, ħ = 1.054571817×10⁻³⁴ J s, GM☉ = 1.3271244×10²⁰ m³ s⁻², R☉ = 6.957×10⁸ m, GM⊕ = 3.986004418×10¹⁴ m³ s⁻², mean R⊕ = 6371 km. These are the CODATA-2018 and IAU-2015 nominal values from memory; they were not re-fetched. **Conventions:** signature (−,+,+,+); Christoffel, Riemann and Ricci conventions as in Carroll's notes, which are MTW-compatible. G = c = 1 only where stated.
- **Access caveat.** In this session arXiv and every other host were unreachable by fetch (proxy and DNS refusals), and the shared web-search budget ran out after 14 searches. Facts therefore come from three places:
  1. those 14 searches, which covered the warp-drive, wormhole and energy-condition literature;
  2. original sources already verified and cited in this repository's earlier GR notes (`research_notes/Beginners guide to general relativity/`). I cite the original sources, not the report;
  3. computation and symbolic verification done here.

  Anything else is listed under Gaps.

---

## Q1. Is the 37-step order pedagogically sound? Physics-first (Hartle; Taylor–Wheeler–Bertschinger) vs math-first (Carroll; Schutz), and recommended reordering

### Takeaway
The 37 steps form a sound *dependency* order for Derivation Mode. The spine is Carroll's math-first sequence (SR → geometry → curvature → field equations → solutions), opened by a physics-first block in Hartle's style (equivalence principle and "gravity as geometry" before tensors).

The weakness is for Intuition Mode and for this learner: steps 10–19, ten abstract lessons in a row, stand between the metric and the black holes and gravitational waves the learner cares about. Inside the solutions block, the order also puts horizons (22) before the weak-field tests (23–25).

Recommendation: keep all 37 nodes and their numbers, and change the routes through them:
1. In Intuition Mode, teach geodesics as "maximal aging" straight after proper time. A Calc-II-level black-hole fast track, 9 → 12 → 20 → 23 → 21 → 22 → 24, then becomes possible.
2. Run the Schwarzschild block weak-field first: 20 → 23 → 25 → 24 → 21 → 22 → 26.
3. In Derivation Mode, teach 28 (linearized gravity) before 27 (gravitational waves). Intuition Mode may lead with 27.
4. Move 29 (Einstein's equations as a PDE system) so it sits directly before 32 (numerical relativity), after cosmology.
5. Add previews: SR stress-energy after step 4, and energy conditions at steps 16 and 22.

### Cited Findings
**Physics-first (Hartle) and its rationale**
- Hartle's physics-first course order is:
  1. present the simplest important spacetime geometries without derivation;
  2. derive orbits of particles and light (stationary proper time, effective potentials);
  3. apply these to astrophysics and observations;
  4. only then motivate and solve the Einstein equation.

  "Only one tensor — the metric — is ever used." The only essential prerequisite is "an intermediate course in mechanics", and "neither quantum mechanics nor electrodynamics are necessary". The UCSB version is a one-quarter elective of about 28 lectures — [Hartle, "General Relativity in the Undergraduate Physics Curriculum" (AJP 2006)](https://ar5iv.arxiv.org/html/gr-qc/0506075)
- Courses taught "at the level of" Hartle require classical mechanics and SR; E&M is "useful" but not required (Cornell PHYS/ASTRO 4445) — [Cornell class roster](https://classes.cornell.edu/browse/roster/FA21/class/PHYS/4445)
- In the usual Newtonian limit, "the Newtonian part of gravity is purely an effect of time distortion, encoded in the metric coefficient g_tt". Free particles follow worldlines of maximal proper time ("free particles procrastinate"). Together with regions where time passes at different rates, this "yields the Newtonian limit of general relativity". This is the case for teaching proper time and maximal aging before tensors — [Pössel 2018, §2.2, §4.2](https://arxiv.org/abs/1812.11589)
- Timelike geodesics "maximize the proper time" — [Carroll lecture notes §3.3](https://arxiv.org/abs/gr-qc/9712019)
- School-level evidence that geometry-first teaching works:
  - a pillow-and-spheres "Einstein before Newton" approach outperformed a variant of teaching Newton's law with French 9th-graders (Baldy 2007) — [Pössel 2018 §4.1](https://arxiv.org/abs/1812.11589)
  - Australia's "Einstein-First" programme builds on the same maximal-aging ideas — [Kaur et al. 2017](https://doi.org/10.1088/1361-6552/aa83e4); [Stannard et al. 2017, "Why did the apple fall?"](https://doi.org/10.1088/0143-0807/38/1/015603)

**Physics-first texts with free access**
- Taylor, Wheeler & Bertschinger, *Exploring Black Holes* 2nd ed., is free online only, under CC BY 4.0 — [eftaylor.com](https://www.eftaylor.com/exploringblackholes)
- Community descriptions (a low-authority forum) call Taylor & Wheeler's black-hole book one of the most elementary GR texts, needing little beyond calculus — [PhysicsForums](https://www.physicsforums.com/threads/mathematical-prerequisites-for-general-relativity.939528/post-5943148)

**Math-first (Carroll, Schutz)**
- Carroll's notes are ordered: SR and flat spacetime → manifolds → curvature (connections, parallel transport, geodesics, Riemann) → gravitation (equivalence principle, Newtonian limit, Einstein's equations) → more geometry → weak fields and gravitational radiation → Schwarzschild and black holes → cosmology — [Carroll notes](https://arxiv.org/abs/gr-qc/9712019)
- Schutz's *A First Course* assumes SR, vector calculus and electrostatics — [Iberlibro listing](https://www.iberlibro.com/9780521277037/First-Course-General-Relativity-Bernard-0521277035/plp)
- Schutz's 3rd ed. (Cambridge 2022) adds two chapters on gravitational waves and has more than 300 exercises — [Cambridge](https://www.cambridge.org/highereducation/isbn/9781108610865)
- Cambridge Part III GR lists Newtonian gravity, SR, linear algebra and Euler–Lagrange equations as essential prerequisites. Its first half is an introduction to differential geometry — [Cambridge Part III guide](https://www.maths.cam.ac.uk/postgrad/part-iii/files/misc/2020-21%20Guide/Relativity%20and%20Gravitation/General%20Relativity.pdf) (seen via search summary in the earlier notes)

**Dependency facts that drive the reordering**
- Gravitational waves are derived from the linearized equation □h̄_μν = −16πG T_μν, so linearized gravity is the derivational prerequisite of GWs — [Carroll notes §6.1](https://arxiv.org/abs/gr-qc/9712019)
- Einstein's equations comprise 10 equations. The Bianchi identity leaves 6 truly independent ones, matching the 4 coordinate freedoms — [Carroll §4.4](https://arxiv.org/abs/gr-qc/9712019)
- In 3+1 form the equations split into evolution and constraint equations. Numerical error makes the constraints drift, gauge (lapse and shift) must be chosen, and the original ADM form is only weakly hyperbolic. These three issues are the content step 29 should hand to step 32 — [Baumgarte & Shapiro 1998](https://arxiv.org/abs/gr-qc/9810065); [Centrella et al. 2010](https://arxiv.org/abs/1010.5260)

### Inferences
**1. Diagnosis of the given order: four regimes.**

| Steps | Character | Verdict |
|---|---|---|
| 1–9 | Physics-first (Hartle/TWB style): Newton → SR → Minkowski → four-vectors → EP → geometry → coordinates → metric → proper time | Sound. Proper time (9) is the right gateway, because everyday gravity *is* g_tt (Pössel) |
| 10–19 | Math-first machinery (Carroll/Schutz style) | Logically sound, but 10 lessons before any black-hole payoff. Too long a "desert" for a Calc-II learner in Intuition Mode |
| 20–31 | Applications | Two problems: horizons (22) come before the weak-field tests (23–25), and GWs (27) come before their derivation (28) |
| 32–37 | Frontier | Sound: energy conditions (33) → exotic geometries (34) → wormholes (35) → warp (36) → open questions (37). The judging tool comes before the claims it judges |

**2. What each tradition contributes to the two modes.**

| | Physics-first (Hartle; TWB) | Math-first (Carroll; Schutz) | Use in the Atlas |
|---|---|---|---|
| Entry | Metric given, interpreted operationally (rulers, clocks) | Manifolds, tensors, connections built first | Intuition Mode = physics-first; Derivation Mode = math-first for 10–19 |
| Geodesics | Variational: stationary proper time, Euler–Lagrange, effective potentials | Autoparallel (parallel transport of the tangent vector) | Teach both. Variational first (Intuition) and as the fastest computational route (Derivation: read Γ off the Lagrangian), then autoparallel in 13 |
| Field equations | Last, after the observational payoff | Before solutions | Derivation Mode keeps 16–19 before 20. Intuition Mode can show 18 "in words" (Baez–Bunn ball) whenever reached |
| Risk | Metrics feel like black boxes; Einstein's equation an afterthought | Delayed physics; high cognitive load | Spiral: Schwarzschild is *used* in Intuition Mode and *derived* in Derivation Mode at step 20 |

**3. Recommended Derivation-Mode sequence** (same 37 nodes):

1 → 2 → 3 → 4 (+ an SR stress-energy preview micro-lesson) → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19
→ **20 → 23 → 25 → 24 → 21 → 22 → 26** (Schwarzschild weak-field tests first, then strong field, then spin)
→ **30 → 31** (the other symmetry-based exact solution)
→ **28 → 27 → 29 → 32** (dynamics without symmetry: linearize → waves → the full PDE problem → numerical relativity)
→ 33 → 34 → 35 → 36 → 37

Why each change:
- **(a) 23–25 before 21–22.** The redshift, precession and light-bending lessons use the same metric in the regime where precision data exist (Pound–Rebka, GPS, Mercury, Cassini). The learner meets "GR is tested" before "GR predicts horizons". The ISCO and horizon lessons (21, 22) then reuse the effective-potential machinery built in 25 and 24. This mirrors Hartle's spherical-star → solar-system tests → black holes progression; that table-of-contents detail is from memory, see Gaps.
- **(b) 28 before 27.** The wave equation, gauge and TT polarizations are derived, not asserted, which is Carroll's order. Intuition Mode may run 27 first: ring of particles, LIGO, chirp.
- **(c) 29 adjacent to 32.** The ideas that make step 29 worth having (constraints vs evolution, gauge, hyperbolicity) are exactly the ideas step 32 needs. In the original list cosmology sits between them and breaks the thread.
- **(d) 30–31 after 26.** FLRW is, like Schwarzschild and Kerr, a solution found by imposing symmetry, so the "exact solutions" arc stays together. The original position (after 29) is also defensible; this is a preference, not a correction.
- **(e) Steps 10–13.** The given 10 → 11 → 12 → 13 order works in Derivation Mode if 12 is derived via Euler–Lagrange, so the learner *finds* the Christoffel symbols of a given metric. Step 13 then re-reads geodesics as autoparallels and leads directly into curvature (holonomy → Riemann, step 14). Carroll does parallel transport before geodesics; either order is acceptable, but 13 should sit right before 14.

**4. Intuition-Mode route** (no tensor calculus; Calc II plus Physics I):

1 → 2 → 3 → 4 → 5 → 6 → (7 merged into 8) → 8 → 9 → **12 as "maximal aging"** → **20 → 23 → 25 → 24 → 21 → 22 → 26** → 27 → 30 → 31

followed by the concept versions of 14–19 (tides, the falling-ball statement of Einstein's equation, what gravitates), then 28 → 29 → 32 → 33–37.

Steps 10, 11, 13 and 17 become short concept cards in Intuition Mode ("what this machine measures"), not omitted lessons. Their Derivation versions are gated by the math track (point 5).

**5. Math gating for a learner now in Calc II and Physics I** (map these tags onto the math track's real module IDs; tags are mine):

| Derivation Mode of steps | Needs (math-track tags) |
|---|---|
| 1–6, 9, 20–25 (most of each) | M:Calc-II (Taylor/binomial series, integration, arc length), M:Polar/parametric, M:ODE-basics, M:Variations (Euler–Lagrange) for 6, 9, 12 and 21 |
| 7, 8, 10–15, 17 | M:Multivar (partials, chain rule, Jacobians), M:LinAlg (matrices, basis change, inverse), M:Index-notation/tensors, M:DiffGeo (connections, curvature) |
| 16, 18, 19, 28 | M:VecCalc (divergence, Laplacian, Gauss), M:Tensors |
| 26, 30, 31 | M:Multivar + M:ODE (Friedmann as ODE; numerical integration) |
| 27, 29, 32 | M:PDE (wave and elliptic equations, characteristics, hyperbolicity), M:Numerics (RK4, finite differences, CFL), M:Fourier |
| 33–36 | M:Tensors + M:DiffGeo; 36 needs multivariable integration |

**6. Prerequisite graph** (arrows mean "needed by"):
- 1 → 5, 19, 25
- 2 → 3 → 4 → {9, 16}
- {3, 5} → 6 → 7 → 8 → 9 → 12 (variational)
- 8 → 10 → 11 → 12 (general) → 13 → 14 → 15 → 17 → 18 → 19
- 4 → 16 → {17, 18, 33}
- {8, 9, 12} → 20 → {21, 22, 23, 24, 25} → 26
- 18 → {28, 30} → 31
- 28 → 27 → 29 → 32
- {16, 22} → 33 → {34, 35, 36} → 37
- {22, 26, 27, 31, 32} → 37

**7. Granularity.** Steps 7 and 8 can be one lesson in Intuition Mode. Step 19 should appear twice: as the motion half (geodesic → Newton) inside 12, and as the field half (Einstein's equation → Poisson) at 19.

### Gaps
- Hartle's, Schutz's, Moore's and TWB's tables of contents were **not re-verified this session** (web budget exhausted, arXiv unreachable). These descriptions are recalled, not checked:
  - Hartle Part II (curved-spacetime description → geodesics → spherical star → solar-system tests → black holes → rotation → GWs → cosmology), then Part III (curvature and Einstein equation → source of curvature → GW emission → relativistic stars);
  - Moore's *General Relativity Workbook* putting Schwarzschild orbits before the Riemann tensor, with GWs and Kerr late;
  - TWB using local-observer frames throughout.

  Verify before the final report cites them.
- No published comparative study (PER) was found that measures physics-first vs math-first GR outcomes at university level. The ordering advice above is reasoned, not empirically validated.

---

## Q2. The 37-step content map: goals, Intuition vs Derivation Mode, prerequisites, answer-keyed problem archetypes, misconceptions and honest visualizations

### Takeaway
Every one of the 37 steps can be anchored to something it *accomplishes physically*: a measured number, a working technology, or a capability such as predicting an orbit, reading a clock or detecting a wave. Each step can be taught in two modes from the same visual:
- **Intuition Mode** uses pictures, words and arithmetic.
- **Derivation Mode** uses calculus, index notation and PDEs, gated by the math track.

Each card below gives 2–5 problem archetypes. All their answers were recomputed or symbolically verified for these notes (tags [C]/[V]); where a measured value exists, the computed prediction is set against it. The verifications caught one trap worth building into the question bank:
- the solar deflection of a star seen at **90° elongation from Earth** is **4.07 mas**, not 8.14 mas. The observer is at 1 AU, not at infinity, which brings in the (1 + cos Φ)/2 factor in Will's formula.

Two of the misconception-busting numbers come out especially well, to be used deliberately:
- tidal stretching at the horizon of a 10 M☉ hole is ≈2×10⁸ m/s², versus ≈1×10⁻³ m/s² for Sgr A*;
- the negative energy density a 1 m wormhole throat needs is 10³⁸–10⁴⁶ times larger in magnitude than laboratory Casimir energy densities.

### Cited Findings
(Numerical facts are tabulated with sources in Q4. These are the pedagogical and conceptual sources the cards lean on.)

**What the metric is and does**
- Carroll lists seven roles of the metric. It supplies past and future; computes path length and proper time; determines geodesics and hence the motion of test particles; replaces the Newtonian potential; provides local inertial frames; fixes causality and the speed of light; and replaces the Euclidean dot product — [Carroll notes §2.5](https://arxiv.org/abs/gr-qc/9712019)
- Christoffel symbols are non-zero in curvilinear coordinates even in flat space (polar Γ^θ_rθ = 1/r, Γ^r_θθ = −r). In curved space they can be made to vanish at any single point but not throughout a neighbourhood. The Riemann tensor's 20 independent components are "precisely the 20 degrees of freedom in the second derivatives of the metric which we could not set to zero by a clever choice of coordinates" — [Carroll notes §3.2, §3.6](https://arxiv.org/abs/gr-qc/9712019)

**Curvature, tides and the source of gravity (Baez & Bunn)**
- A small ball of freely falling test particles initially at rest shrinks at a rate set by energy density plus the three principal pressures. With units restored, V̈/V = −4πG[ρ + (P_x + P_y + P_z)/c²]. This "contains all of Einstein's equation" if balls with all initial velocities are considered.
- The Ricci tensor governs a ball's volume change; the Weyl tensor its change of shape, which carries tides and gravitational waves.
- Vacuum stress-energy has ρ + 3P = −2Λ, i.e. it repels.
- Pressure gravitates, and helps push neutron stars above about 2 M☉ into collapse.
- Sources for all four points: [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044)

**Rubber-sheet flaws and their evidence**
- Pössel documents the rubber sheet's flaws:
  - gravity is used to explain gravity;
  - it shows space, not spacetime (time is omitted);
  - it introduces a privileged rest frame;
  - the dimensions are mismatched;
  - it relies on embedding and extrinsic curvature;
  - its orbit dynamics are wrong;
  - it is easily confused with potential-well plots and the Flamm paraboloid — [Pössel 2018 §4.2](https://arxiv.org/abs/1812.11589)
- Misconceptions from the sheet have been reproduced in upper-secondary students taught with it — [Kersting & Steier 2018, *Science & Education* 27, 593](https://doi.org/10.1007/s11191-018-9997-4)
- Motion on a warped spandex sheet gives the wrong orbit shapes and speeds — [Middleton & Langston 2014](https://doi.org/10.1119/1.4848635); [Middleton & Weller 2016](https://doi.org/10.1119/1.4940246)

**Alternatives used by educators**
- Pössel collects these alternatives:
  - geodesics on real curved surfaces (great circles, converging travellers);
  - circles and triangles drawn on balloons;
  - sector models;
  - the maximal-aging "time-warp" narrative;
  - the river model of black holes, which reproduces orbits faithfully — [Pössel 2018 §4.3, §5](https://arxiv.org/abs/1812.11589)
- Sector models are a hands-on toolkit for building curved spatial geometries out of flat pieces — [Zahn & Kraus 2014, *Eur. J. Phys.* 35, 055020](https://doi.org/10.1088/0143-0807/35/5/055020)

**Equivalence principle and clocks**
- "No argument that attempts to infer space-time curvature solely from the gravitational red shift can be valid": a uniformly accelerated rocket in flat spacetime shows the same clock-rate gradient (Marsh & Nissim-Sabat, AJP 1975) — [abstract](https://www.gemarsh.com/archives/61)
- GPS satellite clocks gain "39 microseconds per day (46 µs from the gravitational redshift, and −7 µs from time dilation)" — [Will 2014 §2.1.3](https://arxiv.org/abs/1403.7377)
- Ashby gives the GPS orbit radius a = 2.656175×10⁷ m and the geoid potential Φ₀/c² = −6.969290134×10⁻¹⁰. A 1 ns timing error gives about 30 cm of position error, and the nominal clock frequency is 10.23 MHz — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)

**Geodesics, orbits and horizons**
- Christoffel symbols in the Newtonian limit: d²xⁱ/dt² = ½∂ᵢh₀₀ with g₀₀ = −(1 + 2Φ) — [Carroll notes §4.1](https://arxiv.org/abs/gr-qc/9712019)
- Photon sphere at 3GM/c² and ISCO at 6GM/c²; for maximal Kerr the prograde ISCO tends to GM/c² and the retrograde to 9GM/c² — [Carroll ch. 7](https://arxiv.org/abs/gr-qc/9712019); [Wikipedia: ISCO](https://en.wikipedia.org/wiki/Innermost_stable_circular_orbit)
- r = 2GM/c² is a coordinate singularity; Kruskal coordinates are smooth there; true singularities are diagnosed by curvature scalars such as R_μνρσR^μνρσ — [Carroll ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- *Interstellar*'s 1 h : 7 yr is possible only for a planet very close to the horizon of a rapidly spinning hole — [arXiv:2606.01921](https://arxiv.org/abs/2606.01921)

**Cosmology misconceptions**
- Galaxies at z ≳ 1.5 recede faster than light today in standard ΛCDM, without violating relativity; the observable universe has a comoving radius of about 46 Gly — [Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808); [Planck 2018 VI](https://arxiv.org/abs/1807.06209)

**In-repo precedents the Atlas can reuse**
These are already "honest by construction": DOM-free physics modules tested headlessly, with every exaggeration labelled on screen.
- **`geodesic/`** — the default view is the tidal field E_ij = ∂ᵢ∂ⱼΦ, not a rubber sheet. A falling 3D grid shows stretch-to-squeeze in the ratio 2:1, with volume conserved in vacuum and shrinking at −4πGρ inside matter. A Flamm "Embedding" mode is explicitly framed as the famous picture plus what it fails to explain. Its 95 headless checks include Mercury's 42.98″/century and the Earth's 196 W of GW emission — [geodesic README](/home/user/Projects/geodesic/README.md); [live](https://daxjdavis526.github.io/Projects/geodesic/)
- **`blackhole/`** — per-pixel null geodesics through exact Kerr in Kerr–Schild form (Hamiltonian RK4 on the GPU), with an in-app "Model & assumptions" panel — [blackhole README](/home/user/Projects/blackhole/README.md)
- **`worldline/`** — every narrated number is either a sourced fact or test-listed. Exaggerations are labelled (e.g. Mercury's precession shown about 300,000× too fast; GW stretching about 10²⁰×) — [worldline README](/home/user/Projects/worldline/README.md)

### Inferences
**How to read the cards.** Cards appear in the recommended Derivation-Mode order from Q1: 1–20, then 23 → 25 → 24 → 21 → 22 → 26 → 30 → 31 → 28 → 27 → 29 → 32 → 33–37. Each step lists:
- **Accomplishes**: the physical payoff, which is the lesson's opening hook;
- **Goals**;
- **Intuition Mode** and **Derivation Mode**, sharing one manipulable visual;
- **Prereqs**: physics steps plus math-track tags as in Q1;
- **Worked example** and **Practice archetypes**: each archetype has an answer key with a provenance tag, a hint, and the one-sentence micro-teaching shown after a wrong answer. Parameter variants generate the 4–8 practice items per lesson;
- **Misconceptions** to target in the checkpoint quiz;
- **Visualization**: what is drawn exactly vs schematically;
- **Badge**: the status label.

Suggested answer tolerance is ±1% for computed numbers unless stated, because inputs are rounded.

#### Step 1 — Newtonian gravity and its limitations · [EST-OBS] (weak-field regime)
- **Accomplishes:** predicts orbits and tides, and sets the benchmark GR must reproduce in the weak field. Its failures (Mercury, light, clocks, causality) motivate everything after.
- **Goals:**
  - Use F = GMm/r², **g** = −∇Φ and ∇²Φ = 4πGρ.
  - See that equal inertial and gravitational mass is an unexplained coincidence in Newton's theory.
  - Compute tides.
  - List the cracks: instantaneous action vs SR; Mercury's anomaly; no clock effects; no prediction for the speed of gravity; the "dark star" puzzle.
- **Intuition:** an orbit sandbox (Newtonian), a "dark star" thought experiment, and Mercury's anomaly framed as Le Verrier's 1859 mystery, unsolved until 1915.
- **Derivation:** Gauss's law → Poisson equation; the tidal tensor ∂ᵢ∂ⱼΦ, previewing the Riemann tensor (step 14); a precession budget.
- **Prereqs:** Physics I (Newton's laws, circular motion); M:Calc-I/II. Derivation needs M:VecCalc (flag "later").
- **Worked example:** escape speed, and Michell's dark-star radius for the Sun.
- **Practice archetypes:**
  1. Surface gravity and escape speed of Earth: **g = GM/R² = 9.82 m/s², v_esc = 11.2 km/s** [C]. *Hint:* set ½v² = GM/R. *Micro-teach:* escape speed depends only on M/R, the same combination that will measure "how relativistic" gravity is.
  2. Compactness ladder GM/(Rc²): **Earth 6.96×10⁻¹⁰; Sun 2.12×10⁻⁶; white dwarf (1 M☉, 7000 km) 2.1×10⁻⁴; neutron star (1.4 M☉, 12 km) 0.172** [C]. *Micro-teach:* GR corrections scale with this number, which is why Newton works for planets but not for neutron stars.
  3. Michell's dark star (Newtonian escape speed = c): **R = 2GM/c² = 2.95 km for the Sun** [C]. *Micro-teach:* the formula matches the Schwarzschild radius by coincidence. In GR, light cannot escape *at all* from inside, and the local speed of light is still c.
  4. Mercury budget (Earth-equinox frame): observed ≈ 5600″/cy, of which ≈ 5025″ is precession of the equinoxes and ≈ 532″ is planetary tugs. **Residual ≈ 43″/cy** (rounded budget: [Clemence 1947](https://doi.org/10.1103/RevModPhys.19.361); the modern 43″ value: [Will 2014](https://arxiv.org/abs/1403.7377)). *Micro-teach:* GR explains a sub-1% residual, not "the precession".
  5. Lunar tidal acceleration at Earth's surface, 2GM_moon R⊕/d³: **1.1×10⁻⁶ m/s²** [C].
- **Misconceptions:**
  - "There is no gravity in orbit." At ISS altitude g is still about 0.885 of surface gravity [C].
  - "Newton was wrong." Newton's theory is GR's weak-field, slow-motion limit.
  - "All of Mercury's precession is relativistic."
- **Visualization:** orbit sandbox with a "residual precession" overlay. Any potential-well curve is labelled **"graph of Φ(r) — not a picture of space."**

#### Step 2 — Special relativity review · [EST-OBS]
- **Accomplishes:** fixes the speed limit and the clock and rod behaviour that every GR test relies on. It also explains why Newtonian gravity's instantaneous action cannot be the final theory.
- **Goals:** the two postulates; time dilation; length contraction; relativity of simultaneity; Lorentz transformation; velocity addition; relativistic Doppler shift.
- **Intuition:** light-clock animation; the train and lightning; "two stories" of the muons.
- **Derivation:** the Lorentz transformation from invariance of light speed (or of the interval); composition of velocities; the Doppler factor.
- **Prereqs:** Physics I kinematics; algebra; M:Calc-Taylor for small-v expansions.
- **Worked example:** cosmic-ray muons.
- **Practice archetypes:**
  1. Muons at 0.995c (τ = 2.197 μs): **γ = 10.01; dilated lifetime 22.0 μs; mean decay length 6.56 km**, against 655 m without dilation [C].
  2. Velocity addition: **0.6c ⊕ 0.6c = 0.882c** [C]. *Micro-teach:* velocities don't add; rapidities do (step 3).
  3. Lorentz transform of the event (t = 5 s, x = 3 light-s) at v = 0.6c: **t′ = 4 s, x′ = 0** [C]. *Hint:* this event lies on the moving origin's worldline.
  4. Doppler factor approaching at 0.6c: **√((1+β)/(1−β)) = 2** [C].
  5. Twins: 0.8c to a star 4 ly away and back. **Earth ages 10 yr; traveller 6 yr** [C].
- **Misconceptions:**
  - Time dilation is a signal-delay illusion.
  - SR "cannot handle acceleration".
  - Length contraction physically squeezes objects.
  - "Relativistic mass" increases (teach invariant mass instead).
- **Visualization:** a light clock beside a spacetime diagram, sharing one boost slider; lines of simultaneity tilt as v changes.

#### Step 3 — Minkowski spacetime · [EST-OBS]
- **Accomplishes:** the geometry on which all inertial observers agree: interval, proper time and causal order. It is the local template that GR curves.
- **Goals:** events, worldlines and light cones; the interval with signature (−+++); timelike, null and spacelike classification; hyperbolic calibration; rapidity.
- **Intuition:** a draggable-event Minkowski diagram. The longer-looking zig-zag worldline has *less* proper time.
- **Derivation:** η_μν = diag(−1, 1, 1, 1); boosts as hyperbolic rotations (cosh φ, sinh φ); additivity of rapidity.
- **Prereqs:** step 2; M:Calc (hyperbolic functions).
- **Practice archetypes:**
  1. Δt = 3 s, Δx = 4 light-s: **s² = +7 (light-s)², spacelike**, so no causal link [C].
  2. Δt = 5 yr, Δx = 3 ly: **proper time 4 yr** [C].
  3. Rapidity of 0.8c is **1.0986**; composition gives **0.8c ⊕ 0.8c = tanh(2.197) = 0.9756c** [C].
- **Misconceptions:**
  - Diagram lengths are Euclidean.
  - The light cone is a cone in space.
  - "Everything moves through spacetime at c". Allowed only with the honest formula (dτ/dt)² + (v/c)² = 1.
- **Visualization:** invariant hyperbolae calibrate the tick marks; dragging events updates the interval class live; the boost animates the scissoring axes.

#### Step 4 — Four-vectors and intervals · [EST-OBS]
- **Accomplishes:** writes physics so all observers agree. It also gives energy–momentum conservation in collisions and decays (accelerator physics) and shows mass to be an invariant.
- **Goals:**
  - The 4-velocity u^μ = γ(c, **v**) with u·u = −c².
  - p^μ = m u^μ, and E² = (pc)² + (mc²)².
  - Invariant mass.
  - Raising and lowering indices with η.
  - **Preview micro-lesson:** dust T^μν = ρ u^μ u^ν, which prepares step 16.
- **Intuition:** a mass-shell hyperbola with draggable momentum; a collider invariant-mass widget.
- **Derivation:** normalization and conservation; two-body decay kinematics.
- **Prereqs:** step 3; M:LinAlg-vectors; M:Index-notation (intro).
- **Practice archetypes:**
  1. LHC proton at 6.8 TeV: **γ = 7247; 1 − β = 9.5×10⁻⁹**. At 6.5 TeV: γ = 6928, 1 − β = 1.04×10⁻⁸ [C].
  2. Two 1 GeV photons: **head-on M = 2 GeV/c²; at 90°, M = 1.414 GeV/c²** [C]. *Micro-teach:* massless particles can make a massive system.
  3. π⁺ → μ⁺ν at rest: **muon kinetic energy 4.12 MeV, momentum 29.8 MeV/c** [C].
  4. Show u·u = −c² (symbolic).
- **Misconceptions:**
  - Mass increases with speed.
  - Photons "have mass E/c²".
  - The "magnitude" of the 4-velocity is the speed.
- **Visualization:** energy–momentum hyperbola; dragging along it shows γ and β, and invariant mass stays fixed under the boost slider.

#### Step 5 — Equivalence principle · [EST-OBS] (WEP to ~10⁻¹⁵)
- **Accomplishes:** turns the universality of free fall into "gravity can be transformed away locally". Gravity therefore belongs to geometry. It predicts gravitational redshift and (half of) light bending.
- **Goals:** WEP, EEP and SEP; local inertial frames; the Einstein elevator; consequences; limits (tidal effects).
- **Evidence to show:**
  - MICROSCOPE: η(Ti, Pt) = [−1.5 ± 2.3 (stat) ± 1.5 (syst)]×10⁻¹⁵ — [Touboul et al. 2022](https://arxiv.org/abs/2209.15487)
  - Pound–Rebka–Snider reached 1% — [Will 2014](https://arxiv.org/abs/1403.7377)
  - optical clocks resolved 33 cm — [Chou et al. 2010](https://doi.org/10.1126/science.1192720)
  - and then 1 mm — [Bothwell et al. 2022](https://arxiv.org/abs/2109.12238)
- **Intuition:** a three-mode elevator (rocket in deep space / box on Earth / freely falling box) with a light pulse and two dropped balls. A "grow the box" slider makes the balls converge: tides, the part that cannot be transformed away.
- **Derivation:** light drop ½g(L/c)² in an accelerating cabin; redshift gh/c² from the Doppler shift in an accelerating rocket.
- **Prereqs:** steps 1–2.
- **Practice archetypes:**
  1. Light drop across a 3 m cabin at 1 g: **4.9×10⁻¹⁶ m** [C]. *Micro-teach:* real, but you need the Sun to see it (step 24).
  2. Fractional shift over 22.5 m, gh/c²: **2.46×10⁻¹⁵**; the up-vs-down comparison doubles it to **4.9×10⁻¹⁵** [C].
  3. Optical clocks 33 cm apart: **3.6×10⁻¹⁷** [C]. Detected in 2010 ([Chou et al.](https://doi.org/10.1126/science.1192720)).
  4. A clock atop a 330 m tower gains **3.1 ns per day** [C].
- **Misconceptions:**
  - The equivalence principle holds globally.
  - Astronauts float because there is "no gravity".
  - The EP predicts all of light bending (it predicts half).
  - Redshift alone proves curvature. It doesn't — see Marsh & Nissim-Sabat above.
- **Visualization:** the elevator; every tiny effect is shown with a stated exaggeration factor, as `worldline/` already does.

#### Step 6 — Gravity as geometry · [EST-DER] (with [MODEL] surface analogies)
- **Accomplishes:**
  - Replaces "force" with free fall along geodesics, which explains why everything falls alike.
  - Identifies curvature with tides.
  - Shows everyday gravity is mostly position-dependent clock rates.
- **Goals:** geodesics on surfaces; convergence without forces; maximal aging; time warping vs space warping; Wheeler's slogan (wording varies by source).
- **Intuition:** two walkers heading north from the equator converge. The thrown ball's worldline is the straightest path in a (t, height) diagram shaded by clock rate: "time runs faster upstairs."
- **Derivation:** Δτ of a thrown ball, Δτ = (1/c²)∫(gh − ½v²)dt. Maximizing τ over paths gives ḧ = −g, i.e. Newton's action principle.
- **Prereqs:** steps 3, 5; M:Calc-II integration; M:Variations (Derivation).
- **Practice archetypes:**
  1. Walkers 1 km apart at the equator: **0.5 km apart at 60°N** [C]. *Micro-teach:* convergence without force is geometry.
  2. Thrown ball at v₀ = 10 m/s versus a clock left on the ground: **Δτ = v₀³/(3gc²) = 3.78×10⁻¹⁶ s** [C; checked by numerical integration]. *Micro-teach:* the high-clock gain beats the speed loss 2:1, and that *is* the parabola.
  3. Triangle with one vertex at the pole and two on the equator 90° apart: angle excess **90° = area/R²** [C].
  4. Head-to-foot tidal difference for a 2 m person on Earth: **6.2×10⁻⁶ m/s²** [C].
- **Misconceptions:**
  - The rubber sheet is the mechanism.
  - "Space curvature makes the apple fall" (the g_tt part dominates).
  - Geodesics are shortest paths. In spacetime, timelike geodesics are *longest* in proper time.
- **Visualization:** a "maximal-aging path editor": drag the ball's worldline and a τ meter peaks on the true parabola. Sphere walkers are badged [MODEL].

#### Step 7 — Coordinate systems and transformations · [EST-DER]
- **Accomplishes:** separates physics (invariants) from labels. This lets the learner use adapted coordinates (polar, Rindler, Schwarzschild, Eddington–Finkelstein, Kruskal, comoving) and recognize coordinate singularities.
- **Goals:** Jacobians; contravariant vs covariant transformation; Rindler observers; the "horizon" of a uniformly accelerated observer.
- **Intuition:** a grid-morph tool (Cartesian ↔ polar ↔ Rindler) showing the same arrow with changing components.
- **Derivation:**
  - V′^μ = (∂x′^μ/∂x^ν)V^ν and ω′_μ = (∂x^ν/∂x′^μ)ω_ν.
  - The hyperbolic-motion worldline x = (c²/α)cosh(ατ/c), ct = (c²/α)sinh(ατ/c).
- **Prereqs:** step 3; M:Multivar (chain rule, Jacobian); M:Polar.
- **Practice archetypes:**
  1. Unit Cartesian e_x at (x, y) = (1, 1) in polar coordinate-basis components: **V^r = 0.7071, V^θ = −0.5** [C].
  2. det ∂(x,y)/∂(r,θ) = **r** (derive).
  3. A 1 g rocket (aerospace hook) for 1 year of ship time: **1.187 yr Earth time, 0.564 ly, final speed 0.775c**. For 10 ship-years: **14,783 yr and 14,782 ly** [C].
  4. Flip-and-burn at 1 g to α Cen (4.37 ly): **3.58 yr ship time, 6.00 yr Earth time, peak 0.952c** [C].
- **Misconceptions:**
  - Coordinate time is what clocks read.
  - A metric singularity is a physical one.
  - Coordinates must be orthogonal or Cartesian.
- **Visualization:** grid morph. The Rindler horizon appears as a null line: events beyond it can never send signals to the rocket.

#### Step 8 — Metric tensors and line elements · [EST-DER]
- **Accomplishes:** the metric *is* the gravitational field. It converts coordinate differences into measured times and lengths, sets light cones (causality) and replaces Φ (Carroll's seven roles).
- **Goals:**
  - Read ds² = g_μν dx^μ dx^ν.
  - Climb the metric ladder: Cartesian → polar → skew axes → sphere → Minkowski → weak field → Schwarzschild.
  - Use the inverse metric and the volume element √|g|.
  - Read embedding diagrams correctly.
- **Intuition:** a "ruler-field" overlay: draw any path and the app integrates ds. Switch metrics to see what changes.
- **Derivation:** compute lengths and areas; show that polar coordinates have position-dependent coefficients without curvature; obtain curvature from a circumference deficit; compute the Schwarzschild radial proper distance.
- **Prereqs:** step 7; M:Calc-II arc length; M:LinAlg (matrix inverse).
- **Practice archetypes:**
  1. A circle of surface radius 100 km on Earth is shorter than 2πr by **25.8 m** (1000 km: 25.8 km) [C]. *Micro-teach:* ants can measure the curvature of their world without leaving it.
  2. Schwarzschild proper radial distance (in units of r_s):

     | From r_s to | Proper distance | Coordinate difference |
     |---|---|---|
     | 2r_s | **2.296** | 1 |
     | 3r_s | **3.596** | 2 |
     | 10r_s | **11.31** | 9 |

     [C]. *Micro-teach:* the Schwarzschild "r" is defined by circumference, not by distance to the centre.
  3. Sun's surface to 1 AU: **7.93 km** of extra proper distance [C].
  4. Skewed axes at angle α: **g_xy = cos α**, from the law of cosines.
- **Misconceptions:**
  - The metric is a fixed matrix rather than a field.
  - Position-dependent components imply curvature.
  - The embedding funnel shows spacetime.
  - r is distance to the centre.
- **Visualization:** the path integrator. The Flamm paraboloid is labelled **"geometry of the equatorial plane at one instant (t = const); the vertical direction is fictitious; time is not shown."**

#### Step 9 — Proper time · [EST-OBS]
- **Accomplishes:** proper time is what clocks measure. Every clock test is a proper-time comparison — GPS, Pound–Rebka, Hafele–Keating, optical clocks, S2 — and free fall maximizes it.
- **Goals:** τ = (1/c)∫√(−g_μν dx^μ dx^ν); the weak-field form dτ ≈ (1 + Φ/c² − v²/2c²)dt; GPS budget; twins; maximal aging.
- **Intuition:** a twin-path editor; a GPS clock widget with an altitude slider and the crossover point.
- **Derivation:** the weak-field expansion; the GPS calculation from Ashby's inputs; sign logic of Hafele–Keating.
- **Prereqs:** steps 3, 8; M:Calc-II (binomial expansion √(1 − x) ≈ 1 − x/2).
- **Practice archetypes:**
  1. GPS: **+45.8 μs/day (gravity), −7.2 μs/day (speed), net +38.6 μs/day; factory frequency 10.22999999543 MHz** [C from Ashby's a and Φ₀; matches Will's 46 − 7 ≈ 39]. *Micro-teach:* light travels 11.6 km in 38.6 μs. That is the scale of the effect, not a precise "drift per day".
  2. ISS (400 km): **+3.6, −28.3, net −24.7 μs/day; −4.5 ms over a 182.6-day stay** [C].
  3. Crossover altitude where the two effects cancel for circular orbits (non-rotating Earth): **r = 1.5 R⊕, altitude 3186 km** [C].
  4. Hafele–Keating (1971) interpretation:
     - eastward: observed −59 ± 10 ns vs predicted −40 ± 23 ns;
     - westward: +273 ± 7 ns vs +275 ± 21 ns.

     Explain the signs — [Hafele & Keating 1972](https://doi.org/10.1126/science.177.4044.168).
- **Misconceptions:**
  - The twin asymmetry is "caused by acceleration".
  - Uncorrected GPS "would drift 10 km/day".
  - Time dilation depends on g; it depends on Φ.
- **Visualization:** the twin editor (the τ readout per path); the GPS widget (two curves crossing at 3186 km).

#### Step 10 — Covariant derivatives · [EST-DER]
- **Accomplishes:** lets you differentiate vectors and tensors so the result means the same thing in every coordinate system. Without it you cannot write energy–momentum conservation (∇_μT^μν = 0) or equations of motion in curved spacetime.
- **Goals:**
  - See why ∂_μV^ν is not a tensor.
  - Use ∇_μV^ν = ∂_μV^ν + Γ^ν_μλV^λ, and ∇_μω_ν = ∂_μω_ν − Γ^λ_μνω_λ.
  - Metric compatibility ∇g = 0.
  - The divergence ∇_μV^μ = (1/√|g|)∂_μ(√|g| V^μ).
- **Intuition:** a constant arrow field drawn on a polar grid. Its *components* change from point to point while the arrows don't. The covariant derivative subtracts the "turning of the grid".
- **Derivation:** the transformation law of ∂_μV^ν (the extra second-derivative term); defining ∇; the Leibniz rule; the divergence and Laplacian formulas.
- **Prereqs:** steps 7–8; M:Multivar, M:LinAlg, M:Index-notation.
- **Practice archetypes:**
  1. The constant Cartesian field e_x written in polar components (V^r = cos θ, V^θ = −sin θ/r): **every ∇_μV^ν = 0** [V]. *Micro-teach:* "constant" is a statement about the arrow, not its components.
  2. Divergence of V^r = r, V^θ = 0: **∇·V = (1/r)∂_r(r·r) = 2** [V]. This equals the Cartesian ∇·(x, y) = 2.
  3. Derive the spherical-coordinate Laplacian from (1/√g)∂_i(√g g^{ij}∂_j f). The result is the E&M-textbook formula, which is Carroll's point that curvilinear Christoffels are why those formulas look the way they do.
  4. Show ∂_μV^ν picks up a ∂²x′/∂x∂x term under a coordinate change.
- **Misconceptions:**
  - The Γ terms are forces.
  - The covariant derivative is path-dependent (parallel transport is; ∇ is local).
  - In flat space ∇ = ∂ in any coordinates.
- **Visualization:** a polar-grid vector field with a "naive derivative / covariant derivative" toggle; the covariant one reads zero for the constant field.

#### Step 11 — Connections and Christoffel symbols · [EST-DER]
- **Accomplishes:** the unique torsion-free, metric-compatible connection (Levi-Civita) is fixed by the metric. Γ encodes the frame-dependent "gravitational field strength", and vanishes at a point in a freely falling frame: the equivalence principle in mathematical form.
- **Goals:**
  - The Christoffel formula.
  - Symmetry in the lower indices; non-tensor character.
  - Local inertial frames.
  - Counting: 4 × 10 = 40 independent components in 4D.
- **Intuition:** basis vectors turning and stretching as you move across a grid. "Γ measures how your rulers rotate and stretch from point to point."
- **Derivation:** solve ∇g = 0 plus zero torsion for Γ. Compute Γ for polar coordinates, the sphere and Schwarzschild. Show Γ can be made zero at a point (Riemann normal coordinates), but its derivatives cannot all be removed.
- **Prereqs:** step 10.
- **Practice archetypes:**
  1. Polar: **Γ^r_θθ = −r, Γ^θ_rθ = 1/r** [V].
  2. Sphere of radius a: **Γ^θ_φφ = −sin θ cos θ, Γ^φ_θφ = cot θ** [V].
  3. Schwarzschild (G = c = 1) [V]:
     - **Γ^r_tt = M(r − 2M)/r³**
     - **Γ^t_tr = M/[r(r − 2M)]**
     - **Γ^r_rr = −M/[r(r − 2M)]**
     - **Γ^r_θθ = −(r − 2M)**

     *Micro-teach:* far away, Γ^r_tt ≈ M/r², the Newtonian acceleration, in disguise.
  4. Count the independent components in n dimensions: **n²(n+1)/2**, which is 40 for n = 4.
- **Misconceptions:**
  - Γ is a tensor.
  - Γ ≠ 0 means curved.
  - Γ = 0 at a point means flat there.
- **Visualization:** a "grid-stretch meter": hover a point to see the basis arrows and the Γ components update. A tiny symbolic engine, or a precomputed table for the five library metrics, is enough.

#### Step 12 — Geodesic equations · [EST-DER] (universality of free fall [EST-OBS])
- **Accomplishes:** the equation of motion for free fall and for light. It replaces Newton's second law plus a gravitational force, and reduces to Newton in the weak field.
- **Goals:**
  - d²x^λ/dτ² + Γ^λ_μν (dx^μ/dτ)(dx^ν/dτ) = 0.
  - Derivation from δ∫dτ = 0, using Euler–Lagrange with L = g_μν ẋ^μẋ^ν.
  - Conserved E and L from symmetries.
  - Null geodesics with an affine parameter.
  - The Newtonian limit.
- **Intuition:** "free bodies take the straightest path, which is the path of maximal aging" ("free particles procrastinate").
- **Derivation:**
  - Euler–Lagrange on a metric gives its geodesic equations, from which the learner *reads off* the Γ.
  - Straight lines in polar coordinates.
  - The weak-field metric gives Γ^i_tt ≈ ∂_iΦ, hence d²x^i/dt² = −∂_iΦ.
- **Prereqs:** steps 9, 11 (or 9 alone in Intuition Mode); M:Variations; M:ODE.
- **Practice archetypes:**
  1. Verify that the line x = 1 (r = √(1+s²), θ = arctan s) satisfies r̈ − rθ̇² = 0 and θ̈ + 2ṙθ̇/r = 0: **both residuals are 0** [V]. *Micro-teach:* the "rθ̇²" term is the centrifugal effect, a coordinate effect rather than a force.
  2. Is the circle of latitude θ₀ ≠ 90° a geodesic? **No**: the θ-equation needs Γ^θ_φφφ̇² = −sin θ₀ cos θ₀ φ̇² = 0 [V]. Only the equator passes.
  3. Weak-field metric: **Γ^x_tt = ∂_xΦ to first order**, so d²x/dt² = −∂_xΦ [V].
  4. Static mass at r = 4r_s: energy at infinity **E/mc² = √(1 − r_s/r) = 0.866**. An ideal rope could therefore extract **13.4%** of the rest energy by lowering it [C].
- **Misconceptions:**
  - Geodesics are shortest paths.
  - A planet's spatial orbit is a geodesic of *space*.
  - Light bends because of a force.
- **Visualization:**
  - a geodesic "shooter" on curved surfaces;
  - a "maximal-aging relaxer" that animates a trial worldline relaxing into the geodesic by gradient ascent on τ;
  - in Derivation Mode, a split screen showing the Euler–Lagrange output next to the Christoffel table.

#### Step 13 — Parallel transport · [EST-DER]; geodetic precession [EST-OBS]
- **Accomplishes:**
  - Defines what it means to "keep a vector the same" in curved spacetime.
  - Path dependence *is* curvature.
  - Predicts gyroscope precession, which Gravity Probe B measured: geodetic −6601.8 ± 18.3 mas/yr vs GR −6606.1 — [Everitt et al. 2011](https://arxiv.org/abs/1105.3456).
- **Goals:** DV^μ/dλ = dV^μ/dλ + Γ^μ_αβ(dx^α/dλ)V^β = 0; holonomy; geodesics as autoparallels; geodetic precession.
- **Intuition:** carry an arrow around loops on a sphere, a saddle and a cone. The link to the Foucault pendulum is the hook.
- **Derivation:**
  - Holonomy around a latitude circle is 2π(1 − cos θ₀).
  - Small-loop holonomy ≈ curvature × area, the bridge to Riemann.
  - Geodetic precession for a circular orbit: Ω = (3/2)(GM)^{3/2}/(c² r^{5/2}).
- **Prereqs:** steps 11–12.
- **Practice archetypes:**
  1. Triangle 90°–90°–90°: the arrow rotates **90° = area × K** [C].
  2. Circle at 60°N: **48.2° = 360°(1 − sin 60°)** [C]. *Micro-teach:* this is why a Foucault pendulum at latitude λ falls short of a full turn in a sidereal day by 360°(1 − sin λ).
  3. GP-B geodetic precession, circular orbit at r = 7027 km: **6.60″/yr** [C]. The GR prediction was 6606.1 mas/yr and the measurement 6601.8 ± 18.3 mas/yr ([Everitt et al.](https://arxiv.org/abs/1105.3456)).
  4. Cone with deficit angle δ: the holonomy around the apex is **δ**, even though the curvature is zero everywhere except the apex. This previews cosmic strings (step 34).
- **Misconceptions:**
  - "Parallel" means "parallel to a fixed external direction".
  - A free gyroscope keeps a fixed orientation relative to the stars.
- **Visualization:** a parallel-transport sandbox: draw a loop and read the holonomy alongside the enclosed ∫K dA.

#### Step 14 — Curvature tensors (Riemann) · [EST-DER]
- **Accomplishes:** the coordinate-independent measure of gravity is tidal acceleration. It decides whether spacetime is really curved, and geodesic deviation is how both gravitational-wave detectors and spaghettification work.
- **Goals:**
  - The definition via commutator or loop holonomy.
  - Symmetries; 20 independent components in 4D.
  - Geodesic deviation.
  - The Kretschmann scalar.
  - The Newtonian tidal tensor: R^i_0j0 ≈ ∂_i∂_jΦ/c².
- **Intuition:** a ring of particles falling toward a mass is stretched radially and squeezed sideways in the ratio 2:1. A "can a better grid make it flat?" test.
- **Derivation:**
  - Riemann of the sphere: R_θφθφ = a² sin²θ [V].
  - Schwarzschild orthonormal tidal components: **R^r̂_t̂r̂t̂ = −2M/r³ and R^θ̂_t̂θ̂t̂ = +M/r³** [V]. Via D²ξ/dτ² = R^μ_νρσu^νu^ρξ^σ these give radial stretch +2GM ξ/r³ and transverse squeeze −GM ξ/r³.
  - Kretschmann: **48G²M²/(c⁴r⁶)** [V].
- **Prereqs:** step 13; M:DiffGeo.
- **Practice archetypes:**
  1. Independent components n²(n²−1)/12: **1, 6, 20** for n = 2, 3, 4.
  2. Head-to-foot (2 m) tidal difference at the horizon [C]:

     | Hole | Tidal difference | In g |
     |---|---|---|
     | 10 M☉ | **2.1×10⁸ m/s²** | ≈2×10⁷ g |
     | Sgr A* | **1.1×10⁻³ m/s²** | ≈10⁻⁴ g |
     | M87* | **4.9×10⁻¹⁰ m/s²** | — |

     *Micro-teach:* tides at the horizon scale as 1/M², so the bigger the hole, the gentler its horizon.
  3. For 10 M☉, where does the 2 m tidal difference reach 10 g? **r ≈ 3,780 km ≈ 128 r_s** [C].
  4. Kretschmann at the 10 M☉ horizon: **1.6×10⁻¹⁷ m⁻⁴, finite** [C]. *Micro-teach:* the horizon is not a curvature singularity.
- **Misconceptions:**
  - Curvature is the Christoffel symbols.
  - Curvature is infinite at the horizon.
  - Flat spacetime has zero Riemann only in Cartesian coordinates (it is zero in all).
- **Visualization:** the ring-of-particles deformer, with mass and distance sliders and an exaggeration readout. A Riemann component explorer in Derivation Mode. Reuse `geodesic/`'s tidal-field and tendex-line mode.

#### Step 15 — Ricci curvature and scalar curvature · [EST-DER]
- **Accomplishes:** Ricci is the part of curvature tied directly to local matter (volume focusing). "Vacuum" means Ricci = 0, while Weyl curvature (tides, gravitational waves) survives. The scalar R summarizes the average curvature.
- **Goals:** R_μν = R^λ_μλν; R = g^μνR_μν; the Baez–Bunn falling ball; Ricci = 0 vs Weyl ≠ 0; R for spheres.
- **Intuition:** a ball-of-dust volume meter, run outside a planet (shape changes, volume constant) and inside matter (volume shrinks).
- **Derivation:**
  - [V]:
    - 2-sphere R = 2/a²
    - 3-sphere R = 6/a²
    - Schwarzschild Ricci = 0
    - FLRW R = 6(ä/a + ȧ²/a² + k/a²) (c = 1)
  - From Baez & Bunn: V̈/V|₀ = −R_tt.
- **Prereqs:** step 14.
- **Practice archetypes:**
  1. Ricci scalar of an Earth-radius 2-sphere: **4.93×10⁻¹⁴ m⁻²** [C].
  2. Test ball inside a water-density medium: **V̈/V = −4πGρ = −8.39×10⁻⁷ s⁻²**, a timescale of about **1,090 s** [C]. *Micro-teach:* that is Einstein's equation, in Baez–Bunn form, for slow matter.
  3. Schwarzschild: Ricci = 0 but Riemann ≠ 0 [V]. *Micro-teach:* empty space can still squeeze and stretch you; it just can't change your volume to first order.
  4. Weyl components: **20 − 10 = 10**.
- **Misconceptions:**
  - Ricci = 0 means no gravity.
  - The Ricci scalar alone characterizes curvature.
- **Visualization:** dust ball with separate "shape" and "volume" gauges. The `geodesic/` 3D falling grid already shows both.

#### Step 16 — Stress-energy tensor · [EST-DER]
- **Accomplishes:** the complete source of gravity — energy density, momentum flux, pressure and stress. It explains:
  - why pressure gravitates (neutron-star collapse);
  - why a box of light attracts twice as strongly as the same energy in dust;
  - why Λ repels.
- **Goals:**
  - T^μν as the flux of 4-momentum.
  - Dust, perfect fluid, radiation, vacuum.
  - ∇_μT^μν = 0.
  - Behaviour under boosts.
  - Energy-condition *preview*: what "ρ ≥ 0" and "ρ + 3p ≥ 0" mean (full treatment in step 33).
- **Intuition:** a 4×4 "flow table" heat map with a boost slider; a "what weighs?" sorting game.
- **Derivation:**
  - T^μν = (ρ + p/c²)u^μu^ν + p g^μν; in the rest frame, diag(ρc², p, p, p).
  - Boosted energy density T^00 = γ²(ρc² + p) − p; for dust, γ²ρc².
  - Conservation gives continuity and the Euler equation. In FLRW this is ρ̇ + 3H(ρ + p/c²) = 0, which is identically the Bianchi identity [V].
- **Prereqs:** step 4, and step 10 for curved spacetime.
- **Practice archetypes:**
  1. Sunlight at 1 AU: **u = S/c = 4.54×10⁻⁶ J/m³** [C].
  2. Air: (p/c²)/ρ ≈ **9.4×10⁻¹³**, so pressure's gravity is negligible in everyday matter [C].
  3. Boosted dust: **T^00 = γ²ρc²**. *Micro-teach:* one γ comes from each particle's energy, the other from length contraction of the volume.
  4. The trace T = −ρc² + 3p: dust −ρc²; radiation **0**; vacuum (p = −ρc²) **−4ρc²**. Source strength ρ + 3p/c²: dust ρ; radiation **2ρ**; vacuum **−2ρ**, i.e. repulsive.
- **Misconceptions:**
  - Only mass gravitates.
  - Pressure "counteracts gravity". Pressure *gradients* support stars; pressure itself gravitates.
  - T^μν is the engineering stress tensor. It contains that as its spatial block.
- **Visualization:** the heat-map table with a source-strength gauge ρ + 3p/c² that turns negative for vacuum energy.

#### Step 17 — Einstein tensor · [EST-DER]
- **Accomplishes:** G_μν is the unique divergence-free curvature combination built from the metric and its first two derivatives (adding Λg_μν is the only freedom). Energy–momentum conservation is therefore automatic.
- **Goals:**
  - G_μν = R_μν − ½Rg_μν.
  - The contracted Bianchi identity ∇^μG_μν ≡ 0.
  - Trace: G = −R in 4D.
  - Why "R_μν = κT_μν" fails: it would force ∇_νT = 0, a constant trace, for any matter.
- **Intuition:** "a balance with a built-in conservation valve."
- **Derivation:**
  - The Bianchi identity, its contraction, and the trace.
  - [V]:
    - G ≡ 0 for any 2D surface, so 2D GR is empty (sphere checked);
    - FLRW G_tt = 3(ȧ² + k)/a²;
    - FLRW G^r_r = −(2aä + ȧ² + k)/a².
- **Prereqs:** steps 15–16.
- **Practice archetypes:**
  1. Trace of G in 4D: **−R**.
  2. Einstein tensor of the 2-sphere: **0** [V].
  3. FLRW G_tt **= 3(ȧ² + k)/a²** [V], which becomes the Friedmann equation in step 31.
  4. Show that R_μν = κT_μν together with ∇·T = 0 implies ∇_ν T = 0, which no realistic star satisfies.
- **Misconceptions:**
  - The "G" in G_μν is Newton's constant.
  - The Bianchi identity is a physical law (it is a geometric identity).
- **Visualization:** an FLRW "geometry vs matter" balance. Change a(t) and watch G_tt demand a ρ.

#### Step 18 — Einstein field equations · [EST-OBS] (Λ as phenomenology [EST-OBS]; its physical nature [OPEN])
- **Accomplishes:** the law of gravity. Matter–energy fixes curvature. Together with step 12 this is the whole classical theory, and it even implies matter's equations of motion.
- **Goals:**
  - G_μν + Λg_μν = (8πG/c⁴)T_μν (see Q3).
  - 10 equations: 6 independent plus 4 gauge freedoms.
  - κ.
  - Trace-reversed form.
  - Baez–Bunn plain-English form.
  - Λ as vacuum energy.
- **Intuition:** the falling-ball statement, V̈/V = −4πG[ρ + (p_x + p_y + p_z)/c²] + Λc², with sliders. Λ makes the ball *grow*.
- **Derivation:** assemble the equation; trace-reverse; show Λ behaves as a fluid with p = −ρc². Einstein–Hilbert action as an optional preview.
- **Prereqs:** step 17.
- **Practice archetypes:**
  1. **κ = 8πG/c⁴ = 2.0766×10⁻⁴³ N⁻¹; 1/κ = 4.8×10⁴² N** [C]. *Micro-teach:* spacetime is about 10³¹ times "stiffer" than steel (a metaphor).
  2. Curvature radius inside water-density matter: **1/√(κρc²) ≈ 2.3×10¹¹ m ≈ 1.5 AU** [C].
  3. Λ from Planck 2018 (H₀ = 67.4, Ω_Λ = 0.685): **Λ = 1.09×10⁻⁵² m⁻²; ρ_Λ = 5.8×10⁻²⁷ kg/m³ (5.3×10⁻¹⁰ J/m³)** [C].
  4. Count: **10 − 4 = 6** independent equations; 4 gauge functions.
- **Misconceptions:**
  - Einstein's equation is one equation.
  - Matter curves *space*.
  - Λ is merely a fudge factor.
  - G_μν is "the curvature".
- **Visualization:** the Baez–Bunn ball with ρ, p and Λ sliders. The same ball reappears in steps 31 and 33.

#### Step 19 — Newtonian limit · [EST-DER]
- **Accomplishes:**
  - Shows GR contains Newton.
  - Fixes the 8π.
  - Quantifies when corrections matter.
  - Lists exactly what is new beyond Newton.
- **Goals:**
  - Weak, slow, static conditions.
  - g₀₀ = −(1 + 2Φ/c²); the geodesic gives **a** = −∇Φ.
  - The 00-component of Einstein's equation gives ∇²Φ = 4πGρ.
- **Intuition:** a "compactness → 0" slider morphs a GR orbit into Newton's.
- **Derivation:** linearize and trace-reverse: ∇²h̄₀₀ = −16πGρ/c², giving h̄₀₀ = 4GM/(c²r). Then **h₀₀ = h_xx = 2GM/(c²r)** [V], which is the weak-field metric.
- **Prereqs:** step 18; M:VecCalc.
- **Practice archetypes:**
  1. h₀₀ at Earth's surface: **1.39×10⁻⁹** [C].
  2. (v/c)² for Earth's orbit: **9.9×10⁻⁹**, the size of spatial curvature's effect relative to the Newtonian (time) part [C].
  3. Fix κ by matching ∇²Φ = 4πGρ (symbolic).
  4. List what is lost in the limit: pressure as a source, the second half of light bending, precession, gravitational waves, horizons.
- **Misconceptions:**
  - The Newtonian limit is just "c → ∞".
  - Newtonian gravity is spatial curvature.
- **Visualization:** a morph slider with h₀₀ contours and an orbit overlay. Reuse `geodesic/`'s Newtonian-vs-exact-geodesic overlay, which already reproduces 42.98″/cy.

#### Step 20 — Schwarzschild metric · [EST-DER] (exterior tested [EST-OBS])
- **Accomplishes:** by Birkhoff's theorem, this is the exact exterior of *any* spherically symmetric mass. It is the arena for every solar-system test and for non-spinning black holes.
- **Goals:**
  - The metric and its symbols (Q3).
  - r_s = 2GM/c²; areal r.
  - Coordinate vs curvature singularity.
  - Vacuum check.
- **Intuition:** two maps side by side: a clock-rate map (g_tt) and a ruler-stretch map (g_rr). The labelled Flamm embedding is the ruler map's picture.
- **Derivation:** static spherically symmetric ansatz → vacuum Einstein equations → Schwarzschild. Verify R_μν = 0 and K = 48M²/r⁶ [V].
- **Prereqs:** steps 8, 15, 18; M:ODE.
- **Practice archetypes:**
  1. r_s values: **Sun 2.953 km; Earth 8.87 mm; Sgr A* (4.30×10⁶ M☉) 1.27×10¹⁰ m = 0.085 AU; M87* (6.5×10⁹ M☉) 1.92×10¹³ m = 128 AU** [C].
  2. Heuristic "mean density" inside r_s: **Sun 1.8×10¹⁹; Sgr A* 1.0×10⁶; M87* 0.44 kg/m³** [C]. *Micro-teach:* big black holes are not necessarily dense; mean density scales as 1/M².
  3. Proper radial distance from r_s to 2r_s: **2.30 r_s** [C] (step 8).
  4. Show R_μν = 0 [V].
- **Misconceptions:**
  - The metric holds inside the star.
  - r = r_s is a physical singularity.
  - Black holes "suck".
- **Visualization:** the two-map view, with the embedding badge "spatial slice, t = const".

#### Step 23 (recommended next) — Gravitational time dilation and redshift · [EST-OBS]
- **Accomplishes:** the most precisely and most often tested GR effect: GPS, Pound–Rebka, Gravity Probe A, Galileo satellites, optical clocks, S2, white-dwarf and neutron-star spectra.
- **Goals:**
  - Static observers: dτ/dt = √(1 − r_s/r).
  - 1 + z = [(1 − r_s/r_obs)/(1 − r_s/r_em)]^{1/2}.
  - The weak-field form gh/c².
  - The S2 combined redshift.
- **Intuition:** a tower of clocks with a compactness slider; a spectral line sliding red.
- **Derivation:** the conserved photon frequency from the time-translation Killing vector; the weak-field limit.
- **Prereqs:** steps 9, 20.
- **Practice archetypes:**
  1. Light from the Sun's surface: **z = 2.12×10⁻⁶ (≈ 636 m/s)** [C].
  2. Neutron star of 1.4 M☉, R = 12 km: **1 + z = 1.235** [C].
  3. Static emitter at 3r_s: **z = 0.2247**. A static clock at 1.5r_s runs at **0.577** [C].
  4. Pound–Rebka (22.5 m): predicted 2gh/c² = **4.9×10⁻¹⁵**. The 1960 result was 1.05 ± 0.10 of prediction; the 1965 result 0.9990 ± 0.0076 [C + [Will 2014](https://arxiv.org/abs/1403.7377)].
  5. S2 at pericentre: combined redshift f = 0.90 ± 0.09 ± 0.15, where 1 = GR — [GRAVITY 2018](https://arxiv.org/abs/1807.09409).
- **Misconceptions:**
  - "Photons lose energy climbing" is wrong. It is a fine description for static observers; just say that it is frame-dependent.
  - Dilation depends on g; it depends on Φ.
  - The infaller sees time stop.
- **Visualization:** a clock tower with the exaggeration factor shown; the redshift dial is linked to step 22's infall split screen.

#### Step 25 (recommended next) — Precession of planetary orbits · [EST-OBS]
- **Accomplishes:** Einstein's first success (November 1915), and a precision test of β. S2 and binary pulsars carry it into strong fields.
- **Goals:**
  - The Binet equation u″ + u = GM/L² + 3GMu²/c².
  - Δφ = 6πGM/[c²a(1 − e²)] per orbit.
  - Precession budgets.
  - The PPN scaling (2 + 2γ − β)/3 — [Will 2014](https://arxiv.org/abs/1403.7377).
- **Intuition:** a rosette orbit with an exaggeration slider; Mercury's budget as a stacked bar.
- **Derivation:** first-order perturbation theory on the Binet equation. A numerical check is built in: integrating the exact Binet equation at p = 10³, 10⁴, 10⁵ M gives relative deviations of 7.9×10⁻³, 7.8×10⁻⁴, 7.8×10⁻⁵ from 6πM/p, converging as the next-order term predicts [C].
- **Prereqs:** steps 12, 20; M:ODE (perturbation series).
- **Practice archetypes:**
  1. Mercury (a = 5.7909×10¹⁰ m, e = 0.2056, P = 87.969 d): **42.98″/century** [C]. Will quotes 42.98.
  2. Venus **8.62″/cy**; Earth **3.84″/cy** [C].
  3. S2: pericentre 120 AU, e = 0.88, so a ≈ 1000 AU. Predicted precession **12.2′ per orbit** [C], against the measured ≈12′ (f_SP = 1.10 ± 0.19) — [GRAVITY 2020](https://arxiv.org/abs/2004.07187); [ESO](https://www.eso.org/public/news/eso2006/).
  4. Hulse–Taylor periastron advance (P_b = 7.7519 h, e = 0.617, M = 2.828 M☉): **4.23°/yr** [C], against ~4.2°/yr observed — [Wikipedia: Hulse–Taylor](https://en.wikipedia.org/wiki/Hulse%E2%80%93Taylor_pulsar). *Micro-teach:* about 4°/yr versus Mercury's 43″/century shows how much stronger gravity is in a compact binary.
- **Misconceptions:**
  - All of the precession is GR.
  - The precession comes from solar rotation.
  - GR orbits are closed ellipses.
- **Visualization:** a rosette. State the exaggeration: the `worldline/` film shows Mercury about 300,000× too fast, and the GR excess is ~0.10″ per orbit.

#### Step 24 (recommended next) — Light bending and lensing · [EST-OBS]
- **Accomplishes:**
  - Tests space curvature (γ).
  - Produces Einstein rings, microlensing exoplanet searches, dark-matter maps and black-hole shadows.
  - The Shapiro delay is today's best γ test: Cassini gave γ − 1 = (2.1 ± 2.3)×10⁻⁵ — [Will 2014](https://arxiv.org/abs/1403.7377).
- **Goals:**
  - Null geodesics.
  - Deflection 4GM/(c²b), twice the "Newtonian" value.
  - Lens equation and Einstein radius.
  - Photon sphere and shadow.
  - Shapiro delay.
- **Intuition:** a ray-traced star field around a draggable lens; a deflection-vs-b plot with the Newtonian curve for comparison.
- **Derivation:**
  - The massless effective potential; the weak-field integral.
  - **Exact null-geodesic integration reproduces 4M/b + 15πM²/(4b²) to ~10⁻⁵ at b = 10³–10⁴ M** [C].
  - Shadow from b_c = 3√3 GM/c² [V].
- **Prereqs:** steps 12, 20.
- **Practice archetypes:**
  1. Grazing the solar limb: **1.751″**; Newtonian half **0.876″** [C]. Will gives 1.7505″ with R☉ = 6.96×10⁸ m.
  2. Star at 90° elongation seen from Earth: **4.07 mas**, using δθ = (4GM/c²d)(1 + cos Φ)/2 with d = 1 AU [C]. This matches Will's "~4 mas". *Micro-teach:* a common error is to use 4GM/(c²·1 AU) = 8.14 mas, which assumes an observer at infinity.
  3. Einstein radius of a 0.5 M☉ lens at 4 kpc, source at 8 kpc: **0.71 mas** (2.85 AU at the lens) [C]. This is why microlensing images are unresolved.
  4. Shadow diameter 2√27 GM/(c²D) [C, compared with the EHT rings]:

     | | Predicted shadow | EHT ring |
     |---|---|---|
     | Sgr A* (4.30×10⁶ M☉, 8.275 kpc) | **53.3 μas** | 51.8 ± 2.3 μas |
     | M87* (6.5×10⁹ M☉, 16.8 Mpc) | **39.7 μas** | 42 ± 3 μas |

  5. Shapiro round trip Earth → Mars → Earth at superior conjunction, ray grazing the Sun: **247 μs** [C]. This matches Will's "up to ~250 μs".
- **Misconceptions:**
  - Photons have mass.
  - Newtonian physics gets the deflection right.
  - "The EHT photographed the horizon". The shadow is ≈2.6× the horizon diameter [C: √27/2], and the ring is lensed emission.
- **Visualization:** a GPU ray tracer, reusing `blackhole/`'s Kerr–Schild integrator at a = 0. Weak-field and strong-field modes; an Einstein ring when aligned.

#### Step 21 (recommended next) — Orbits around black holes · [EST-DER]; disk inner edge inferred [EST-OBS]
- **Accomplishes:**
  - Predicts the ISCO, the inner edge of thin accretion disks.
  - Sets the radiative efficiency that powers quasars: 5.7% for Schwarzschild.
  - Predicts zoom-whirl orbits.
  - Sets the GW frequency at which inspiral ends.
- **Goals:** E and L; the effective potential; circular orbits; ISCO = 6GM/c²; marginally bound orbit at 4GM/c²; plunge; local speeds.
- **Intuition:** draggable E and L on a V_eff plot, linked to a live orbit integrator.
- **Derivation:** circular orbits at r = [L² ± L√(L² − 12M²)]/(2M), which merge at L = 2√3 M, r = 6M [V]. E_isco = 2√2/3 and r_mb = 4M [V].
- **Prereqs:** steps 12, 20, 25.
- **Practice archetypes:**
  1. 10 M☉ hole: **ISCO 88.6 km; f_orb = 220 Hz; f_GW = 440 Hz**. In general **f_GW,ISCO ≈ 4.40 kHz × (M☉/M)** [C]. For 62 M☉: 71 Hz. *Micro-teach:* that is why stellar-mass mergers sit in LIGO's band.
  2. Thin-disk efficiency **1 − 2√2/3 = 5.72%** [C/V], against 0.7% for hydrogen fusion.
  3. Local orbital speed at the ISCO as measured by a static observer: **v = √(M/(r − 2M)) = c/2** [V]. At the photon sphere it is c.
  4. dτ/dt on the ISCO is **0.707**, so *Interstellar*'s 61,000× factor is impossible for a non-spinning hole [C; [arXiv:2606.01921](https://arxiv.org/abs/2606.01921)].
- **Misconceptions:**
  - Black holes suck matter in.
  - There are no stable orbits near black holes.
  - Black-hole orbits are ellipses.
- **Visualization:** V_eff plus orbit, with markers at 3M (photon sphere), 4M and 6M.

#### Step 22 (recommended next) — Event horizons · [EST-DER]
Horizon-scale observations are consistent [EST-OBS]. Hawking radiation is a semiclassical derivation that has not been observed astrophysically [EST-DER, unobserved].
- **Accomplishes:**
  - Defines a black hole: the boundary of the region that cannot signal to infinity.
  - Explains infinite redshift together with finite infall time.
  - With the singularity theorems, makes singularity formation inevitable.
  - Sets up the area theorem, tested by GW250114.
- **Goals:**
  - The horizon as a null surface.
  - Light cones in ingoing Eddington–Finkelstein coordinates.
  - Kruskal and Penrose diagrams.
  - Trapped surfaces; the area theorem.
  - Penrose's theorem: a trapped surface plus positive energy implies an incomplete geodesic — [Penrose 1965](https://doi.org/10.1103/PhysRevLett.14.57).
- **Intuition:**
  - a light-cone field whose cones tip over;
  - an infall split screen: the infaller's own clock vs the redshifting, dimming image a distant observer receives;
  - "the singularity is a *time*, not a place."
- **Derivation:**
  - Tortoise coordinate; IEF metric ds² = −(1 − 2M/r)dv² + 2dv dr + r²dΩ².
  - Outgoing null slope **dr/dv = (1 − 2M/r)/2** [V]: zero at the horizon, negative inside.
  - In (t* = v − r, r) coordinates the ingoing rays are always at 45°, and the outgoing slope is (1 − 2M/r)/(1 + 2M/r).
- **Prereqs:** steps 7, 20, 21.
- **Practice archetypes:**
  1. Maximum proper time from horizon to singularity, πGM/c³: **10 M☉: 0.155 ms; Sgr A*: 66.5 s; M87*: 1.0×10⁵ s (≈28 h)** [C].
  2. Falling from rest at infinity, horizon to singularity takes (4/3)GM/c³: **10 M☉: 66 μs; Sgr A*: 28 s** [C].
  3. Area theorem, GW250114:
     - initial horizon areas for non-spinning 33.6 + 32.2 M☉ holes: **2.37×10⁵ km²** [C];
     - quoted values: ≈240,000 km² → ≈400,000 km² afterwards — [Virgo](https://www.virgo-gw.eu/news/ligo-virgo-and-kagra-complete-the-richest-observation-run-to-date/);
     - the theorem confirmed at high credibility — [LVK, arXiv:2509.08054](https://arxiv.org/abs/2509.08054).
  4. Hawking temperature ħc³/(8πGMk_B): **1 M☉: 6.2×10⁻⁸ K; Sgr A*: 1.4×10⁻¹⁴ K** [C]. Both are far colder than the 2.7 K CMB, so these holes *absorb* more than they emit today.
- **Misconceptions:**
  - Time stops at the horizon.
  - An infaller sees the universe's entire future.
  - The horizon is a material membrane.
  - The EHT imaged the horizon.
  - Hawking radiation has been observed. Only *analog* horizons show Hawking-like radiation — [Steinhauer 2016](https://arxiv.org/abs/1510.00621).
- **Visualization:**
  - IEF or Painlevé–Gullstrand light-cone field; the river model is legitimate here, badged [MODEL] with what it gets right.
  - Clickable Penrose diagram (eternal vs collapse).
  - Split-screen infall.

#### Step 26 — Kerr geometry · [EST-DER]
Spins are measured and ringdowns are consistent [EST-OBS]. The region inside r₋ is [MATH]: the inner (Cauchy) horizon is expected to be unstable, an open question tied to strong cosmic censorship (Q7).
- **Accomplishes:**
  - Describes every astrophysical black hole by two numbers, mass and spin.
  - Frame dragging.
  - Ergosphere energy extraction (Penrose process; likely jet power).
  - A spin-dependent ISCO, giving disk efficiency up to 42%.
  - Ringdown frequencies that test the no-hair theorem.
- **Goals:**
  - Boyer–Lindquist metric (Q3).
  - Horizons r± = M ± √(M² − a²).
  - Ergosphere.
  - ω = −g_tφ/g_φφ.
  - ISCO as a function of spin.
  - Irreducible mass.
  - Ring singularity; extremality.
- **Intuition:** a spin-slider cross-section showing horizons, ergosphere, prograde and retrograde ISCO, and frame-dragging arrows; a ray-traced D-shaped shadow at high spin.
- **Derivation:**
  - Vacuum check (numerical Ricci ≈ 3×10⁻²⁶ at a test point) [V].
  - Δ = 0 gives the horizons [V]; g_tt = 0 gives the ergosurface [V].
  - Ω_H = a/(2Mr₊) [V].
  - Bardeen–Press–Teukolsky ISCO formula [C].
- **Prereqs:** steps 20–22.
- **Practice archetypes (G = c = 1 units of M):**
  1. χ = 0.9: **r₊ = 1.436, r₋ = 0.564**; ergosphere at the equator **2.0** [C/V].
  2. ISCO and thin-disk efficiency (1 − E_isco) [C]:

     | Spin χ | ISCO prograde | ISCO retrograde | Efficiency prograde | Efficiency retrograde |
     |---|---|---|---|---|
     | 0.5 | 4.233 | 7.555 | 8.2% | 4.5% |
     | 0.9 | 2.321 | 8.717 | 15.6% | 3.9% |
     | 0.998 | 1.237 | — | 32.1% | — |
     | 1 | → 1 | → 9 | **42.3% = 1 − 1/√3** | — |

  3. Extractable rotational energy, 1 − M_irr/M with M_irr = M√[(1 + √(1 − χ²))/2]: **χ = 0.9: 15.3%; χ = 1: 29.3%** [C].
  4. Horizon angular velocity for 10 M☉, χ = 0.9: **6.36×10³ rad/s (rotation frequency 1.01 kHz)** [C].
- **Misconceptions:**
  - A Kerr hole is a spinning ball.
  - The ergosphere is the horizon.
  - The singularity is a point.
  - χ > 1 is reachable astrophysically. There are no horizons then: a naked singularity, [MATH] and unobserved.
- **Visualization:** the cross-section plus `blackhole/`'s GPU Kerr shadow. Label everything inside r₋ "mathematical extension; expected unstable".


#### Step 30 — Cosmology and the FLRW metric · [EST-OBS]
- **Accomplishes:** applies GR to the whole universe. It explains the Hubble–Lemaître law, cosmological redshift, the CMB temperature falling as 1/a, horizons, and why distant galaxies can recede faster than light.
- **Goals:** the cosmological principle; the FLRW metric (Q3); comoving coordinates; 1 + z = a₀/a; v = Hd for proper distance; particle and Hubble horizons.
- **Intuition:** a comoving grid with a scale-factor slider: galaxies keep their grid labels while the rulers stretch, and a photon's wavelength stretches with a.
- **Derivation:** FLRW from homogeneity and isotropy; null geodesics give 1 + z = 1/a; the Hubble law from proper distance d = a(t)χ.
- **Prereqs:** steps 8, 12, 18.
- **Practice archetypes:**
  1. z = 1 corresponds to **a = 1/2**, when the universe was half its present linear size.
  2. CMB emitted at z = 1089.9 (Planck), today 2.725 K: **T_emit ≈ 2,973 K** [C].
  3. Hubble time 1/H₀: **14.5 Gyr for H₀ = 67.4; 13.4 Gyr for 73.0**. Hubble radius **4,448 Mpc ≈ 14.5 Gly** [C].
  4. Recession speed at 100 Mpc (H₀ = 67.4): **6,740 km/s** [C].
- **Misconceptions** (all from the earlier notes' box, sourced to [Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808)):
  - The Big Bang was an explosion at a point.
  - Space expands *into* something.
  - Faster-than-light recession violates SR.
  - Atoms and the Solar System expand.
  - "13.8 Gyr old means 13.8 Gly in radius" (it is ≈46 Gly comoving).
- **Visualization:** the comoving grid, plus a conformal past-light-cone diagram (the "teardrop" in proper distance) in the style of Davis & Lineweaver.

#### Step 31 — Friedmann equations · [EST-OBS] (ΛCDM fits); H₀ and evolving dark energy [OPEN]
- **Accomplishes:** gives a(t) from Einstein's equations: the age, the fate, the critical density, and the switch from deceleration to acceleration. It ties Λ to the observed acceleration (Nobel 2011).
- **Goals:**
  - Friedmann, acceleration and continuity equations (Q3).
  - Equation of state w; ρ ∝ a^{−3(1+w)}.
  - The Ω's; q₀.
  - Redshifts of matter–Λ equality and of the onset of acceleration.
  - The current tensions.
- **Intuition:** an a(t) plotter with Ω_m, Ω_Λ, Ω_r and Ω_k sliders, showing the age and fate. An H₀ whisker plot of the 2026 measurements (Q4).
- **Derivation:** from the FLRW Einstein tensor [V]; scaling laws; age integrals (numerical).
- **Prereqs:** steps 17, 30; M:ODE; M:Numerics (quadrature).
- **Practice archetypes:**
  1. Critical density for H₀ = 67.4: **8.53×10⁻²⁷ kg/m³ ≈ 5.1 protons/m³** [C].
  2. Ages, compared with Planck's 13.787 ± 0.020 Gyr — [Planck 2018 VI](https://arxiv.org/abs/1807.06209):
     - Einstein–de Sitter, 2/(3H₀): **9.67 Gyr** [C];
     - flat ΛCDM with Ω_m = 0.315 and Ω_Λ = 0.685: **13.80 Gyr**, or **13.79 Gyr** with Ω_r = 9.1×10⁻⁵ [C].

     *Micro-teach:* Λ reconciles the age with the oldest stars.
  3. Today's expansion history [C]:
     - **q₀ = Ω_m/2 − Ω_Λ = −0.53**;
     - acceleration began at **z = (2Ω_Λ/Ω_m)^{1/3} − 1 = 0.63**;
     - matter–Λ equality at **z = 0.30**.
  4. To z = 1: **comoving distance 3.40 Gpc; lookback time 7.95 Gyr** [C].
  5. Tension arithmetic (√(σ₁² + σ₂²) combination) [C]:
     - SH0ES 73.04 ± 1.04 vs Planck 67.4 ± 0.5: **4.9σ**;
     - H0DN 73.50 ± 0.81 vs CMB combined 67.19 ± 0.38: **7.05σ**, matching the 7.1σ quoted — [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1).

     *Micro-teach:* σ counts assume Gaussian, independent errors. The dispute is precisely about systematics — the CCHP gets 70.39 — [Freedman et al. 2025](https://iopscience.iop.org/article/10.3847/1538-4357/adce78).
- **Misconceptions:**
  - Dark energy is a force pushing galaxies.
  - Λ dilutes as space expands.
  - The expansion is still slowing.
  - The Friedmann equation is "just Newtonian": the pressure term and the meaning of k are relativistic.
  - The Hubble tension "proves GR wrong".
- **Visualization:** the a(t) plotter; an H₀ whisker plot with "early-universe inference" and "local measurement" groups visibly separated, badged [OPEN]; DESI w₀–w_a ellipses badged [OPEN] and "<5σ".

#### Step 28 (Derivation Mode: before 27) — Linearized gravity · [EST-DER]
- **Accomplishes:**
  - Derives gravitational waves from Einstein's equations and shows there are exactly two physical polarizations.
  - Recovers the weak-field metric.
  - Introduces gravitomagnetism: the far-field frame dragging that GP-B measured, −37.2 ± 7.2 mas/yr vs −39.2 predicted — [Everitt et al. 2011](https://arxiv.org/abs/1105.3456).
- **Goals:**
  - g = η + h; gauge transformations.
  - Trace-reversed h̄; Lorenz (harmonic) gauge.
  - □h̄_μν = −16πGT_μν/c⁴.
  - TT gauge; counting degrees of freedom.
  - The static solution.
- **Intuition:** a "gauge playground". The same wave is shown in TT coordinates, where free masses keep fixed coordinates but light-travel times oscillate, and in the detector's local frame, where the masses visibly move.
- **Derivation:** linearize Ricci; apply the gauge choice; derive the wave equation; plane-wave and TT solutions; the point-mass solution [V].
- **Prereqs:** steps 18–19; M:PDE (wave equation); M:Fourier.
- **Practice archetypes:**
  1. Degrees of freedom: **10 − 4 (gauge) − 4 (residual) = 2** (h₊, h×).
  2. Static source: **h̄₀₀ = 4GM/(c²r) solves ∇²h̄₀₀ = 0 off-source** [V], giving h₀₀ = h_ii = 2GM/(c²r).
  3. A + wave along z: the x-arm's proper length changes by **+h₊L/2** and the y-arm's by **−h₊L/2**, so the differential is **h₊L**.
  4. Show the Riemann components of a TT wave are non-zero. *Micro-teach:* gauge freedom does not make the wave a coordinate artefact.
- **Misconceptions:**
  - Gravitational waves are gauge artefacts.
  - Linearized gravity is "wrong because GR is nonlinear". It is valid far from sources.
- **Visualization:** the gauge playground, plus the ring of particles from step 14 driven by h₊ and h×.

#### Step 27 — Gravitational waves · [EST-OBS]
- **Accomplishes:**
  - Carry orbital energy away (Hulse–Taylor decay).
  - Let us hear black-hole and neutron-star mergers.
  - Measure masses, spins and distances, and H₀ via standard sirens.
  - Test strong-field GR: ringdown, area theorem, c_GW = c.
- **Goals:** polarizations; strain; ring of particles; chirp; interferometer principle; energy loss; sources; catalogs (Q4, Q7).
- **Intuition:**
  - the ring of particles;
  - an L-shaped interferometer with exaggerated arms;
  - chirp audio clearly labelled **"sonification — GWs are not sound"**;
  - a waveform builder with a chirp-mass slider.
- **Derivation:** the chirp-mass relation; leading-order amplitude; time to coalescence; Peters–Mathews eccentric enhancement.
- **Prereqs:** step 28 in Derivation Mode; steps 14 and 21 in Intuition Mode.
- **Practice archetypes:**
  1. Arm change ΔL = hL for h = 10⁻²¹, L = 4 km: **4×10⁻¹⁸ m** [C]. LIGO's own comparison is ~1/200 of a proton diameter — [LIGO](https://ligo.org/science-summaries/gw150914detector/).
  2. GW150914 chirp mass from 36 + 29 M☉: **28.1 M☉ in the source frame; 30.6 M☉ in the detector frame** (z = 0.09) [C]. Recovering it from f and ḟ: at f = 100 Hz, ḟ = 3.7×10³ Hz/s gives back 30.6 M☉ [C].
  3. Leading-order time from 35 Hz to merger: **0.16 s, about 9 cycles to 250 Hz** [C]. The observed sweep was 35 → 250 Hz in about 0.2 s — [LVK 2016](https://arxiv.org/abs/1602.03837).
  4. Strain at 410 Mpc: **h ≈ 0.9×10⁻²¹ at 35 Hz and 2.5×10⁻²¹ at 150 Hz** (optimally oriented, leading order) [C]. The measured peak was 1.0×10⁻²¹; orientation and antenna pattern reduce it.
  5. Hulse–Taylor [C]:
     - **Ṗ_b = −2.40×10⁻¹² (−75.7 μs/yr)**, against the GR prediction −2.4025×10⁻¹² — [Will](https://arxiv.org/abs/1403.7377) — and an observed/GR ratio of 0.9983 ± 0.0016 — [Weisberg & Huang](https://arxiv.org/abs/1606.02744);
     - GW power **7.8×10²⁴ W**;
     - Peters integration gives merger in **301 Myr**.
  6. Earth–Sun GW power: **196 W** [C], matching the "~200 W" quoted — [Wikipedia: GW](https://en.wikipedia.org/wiki/Gravitational_wave).
- **Misconceptions:**
  - Gravitational waves are sound.
  - "The laser stretches too, so nothing can be measured".
  - LIGO "sees" black holes.
  - Gravitational waves are the same as fluid "gravity waves".
- **Visualization:** ring plus interferometer. Every stretch shows its true size (10⁻²¹) beside the drawn exaggeration (about 10²⁰×, as in `worldline/`).

#### Step 29 (recommended: right before 32) — Einstein equations as a PDE system · [EST-DER]
- **Accomplishes:** explains several things at once:
  - why GR is a predictive, causal theory (initial data plus evolution);
  - why some of the equations are constraints;
  - why the choice of gauge matters;
  - why numerical relativity took decades to make work (it succeeded only in 2005; Q6).
- **Goals:**
  - 10 second-order PDEs for g_μν.
  - The G^{0μ} components contain no second time derivatives, so they are constraints. The remaining six are evolution equations.
  - Hyperbolicity in harmonic gauge.
  - Constraint propagation via the Bianchi identity.
  - Counting.
- **Intuition:** "GR is like Maxwell." Gauss's law ∇·E = ρ/ε₀ is a constraint on each time slice; Faraday and Ampère evolve the fields; charge conservation keeps Gauss's law true as time runs.
- **Derivation:**
  - The principal part in harmonic gauge, g^αβ∂_α∂_βg_μν + (lower-order terms), is a wave operator.
  - The FLRW toy model:
    - the Friedmann equation has only ȧ, so it is the Hamiltonian constraint;
    - the acceleration equation is the evolution equation;
    - continuity preserves the constraint [V].
- **Prereqs:** steps 17–18 and 28; M:PDE (classification, characteristics, Cauchy problem); M:Numerics.
- **Practice archetypes:**
  1. Count: **10 = 4 constraints + 6 evolution equations; 4 gauge functions (lapse plus 3 shift); 2 radiative degrees of freedom**.
  2. Show the Friedmann constraint stays satisfied when a(t) obeys the acceleration equation and ρ obeys continuity [V].
  3. The Maxwell analogue: ∂_t(∇·E − ρ/ε₀) = 0 given ∂_tρ + ∇·J = 0. Derive it.
  4. Classify u_tt = c²u_xx (hyperbolic: finite signal speed) against ∇²Φ = 4πGρ (elliptic: instantaneous). *Micro-teach:* Newtonian gravity is elliptic, which is why it acts instantaneously; GR is hyperbolic, so gravity propagates at c.
- **Misconceptions:**
  - You "plug in T and solve".
  - Coordinates are given in advance.
  - The constraints are optional extras.
- **Visualization:** a toy 1D evolution with a constraint-violation meter that turns red when the gauge or numerics are poor; a slicing animation (lapse and shift arrows) that hands off to step 32.

#### Step 32 — Numerical relativity introduction · [EST-OBS] (essential to GW astronomy; detail in Q6)
- **Accomplishes:** solves Einstein's equations where no exact solution exists — binary mergers, collapse — and produces the waveforms that make LVK detections and parameter estimates possible.
- **Goals:**
  - The 3+1 split; lapse α and shift β^i; γ_ij and K_ij.
  - Constraints vs evolution.
  - The BSSN and generalized-harmonic formulations.
  - Punctures and excision.
  - The 2005 breakthroughs.
  - Waveform catalogs and surrogates.
  - How templates are used.
- **Intuition:** a foliation movie (stacked 3D slices advanced by the lapse, shifted by the shift); puncture trajectories spiralling in; an NR waveform overlaid on whitened GW150914 data (GWOSC).
- **Derivation:** the ADM line element; Schwarzschild in Painlevé–Gullstrand slicing; the time-symmetric Hamiltonian constraint ∇²ψ = 0 for conformally flat vacuum data; quasinormal modes.
- **Prereqs:** steps 22, 26 and 29; M:PDE; M:Numerics.
- **Practice archetypes:**
  1. Painlevé–Gullstrand slicing of Schwarzschild: **α = 1, β^r = c√(r_s/r)**, a metric verified to be vacuum [V]. At r = 4r_s the inflow speed is **c/2** [C]. *Micro-teach:* "space falls in at the Newtonian escape speed", the river model, made exact.
  2. Brill–Lindquist two-hole data, ψ = 1 + m₁/(2r₁) + m₂/(2r₂): **flat Laplacian = 0 away from the punctures** [V]. It therefore satisfies the time-symmetric constraint, and is the classic initial data for a head-on collision.
  3. Quasinormal ringing of a non-spinning remnant, computed by Leaver's continued fraction: **Mω = 0.3737 − 0.0890i** (2Mω = 0.747343 − 0.177925i) [C]. For 62 M☉: **f = 195 Hz, τ = 3.4 ms** [C]. *Micro-teach:* GW150914's real remnant spins (χ ≈ 0.67; value not re-verified), and spin raises the frequency to ~250 Hz in the detector frame. This uses a spin fit not verified here — see Gaps.
  4. Counting: 6 evolution equations for γ_ij, 6 for K_ij (first-order form), 4 constraints, 4 gauge choices.
- **Misconceptions:**
  - NR is "just plugging into a big computer".
  - LIGO templates are pure NR simulations (most are NR-calibrated analytic or surrogate models; Q6).
  - Simulations "prove" what the black holes are doing beyond GR.
- **Visualization:** foliation, punctures and a waveform overlay. Constraint-violation plots shown honestly. The in-repo `geodesic/` README's warning applies: a toy browser NR solver "produces constraint violations that look like physics and are not". The Atlas should *replay* published catalog waveforms (SXS) rather than run NR live.

#### Step 33 — Energy conditions · [EST-DER] as definitions; violations by quantum fields [EST-OBS] (Casimir)
- **Accomplishes:** decides which matter is "reasonable". The singularity theorems, the area theorem and the topological censorship theorem all assume an energy condition. The conditions are also the tool for judging every wormhole and warp-drive claim in steps 34–36. Detail in Q5.
- **Goals:**
  - NEC, WEC, SEC, DEC and ANEC.
  - Perfect-fluid forms.
  - What each is used for.
  - Known violations (Λ violates the SEC; quantum fields violate every pointwise condition — [Kontou & Sanders 2020](https://arxiv.org/abs/2003.01815)).
  - Quantum inequalities.
- **Intuition:** a (ρ, p) map with shaded allowed regions. Drag dust, radiation, Λ, a phantom fluid, Casimir vacuum, a wormhole throat or an Alcubierre wall onto it and see which conditions light up red.
- **Derivation:**
  - Contract T_μν with null and timelike vectors.
  - Perfect-fluid reductions:
    - NEC: ρc² + p ≥ 0;
    - WEC: also ρ ≥ 0;
    - SEC: ρc² + 3p ≥ 0 and ρc² + p ≥ 0;
    - DEC: ρc² ≥ |p|.
  - The Raychaudhuri focusing argument (qualitative).
- **Prereqs:** steps 16, 22.
- **Practice archetypes:**
  1. Classify (answers [S]):
     - dust, radiation and stiff matter (p = ρc²): **satisfy all four**;
     - Λ (p = −ρc²): **satisfies NEC, WEC and DEC; violates SEC**;
     - phantom fluid (w = −1.2): **violates NEC**, and therefore all four.
  2. Casimir plates 1 μm apart: **ρ = −π²ħc/(720d⁴) = −4.3×10⁻⁴ J/m³; attractive pressure 1.3 mPa**. At 10 nm, **ρ = −4.3×10⁴ J/m³** [C]. The effect is measured — [Lamoreaux 1997](https://doi.org/10.1103/PhysRevLett.78.5).
  3. Show that SEC violation (ρc² + 3p < 0) is exactly what makes ä > 0 (step 31).
  4. Gap to wormholes: |Casimir ρ| at 10 nm divided by |ρc²| at a 1 m Ellis-wormhole throat (4.8×10⁴² J/m³) is **≈ 9×10⁻³⁹** [C].
- **Misconceptions:**
  - Energy conditions are laws of nature. They are assumptions; the averaged and quantum versions are the robust ones.
  - Negative energy is antimatter.
  - Dark energy is "exotic matter" (Λ satisfies the NEC).
- **Visualization:** the (ρ, p) map with condition overlays, plus a quantum-inequality "time–magnitude budget" slider (more negative energy allows less duration).

#### Step 34 — Exotic spacetime geometries · mostly [MATH]
Black-hole exteriors are [EST-OBS]; maximal extensions, Gödel and time machines are [MATH]; cosmic strings are [SPEC/unobserved].
- **Accomplishes:** shows what Einstein's equations *allow*, and teaches the discipline of separating "a solution exists" from "nature makes it".
- **Goals:** a gallery, each piece badged:
  - de Sitter and anti-de Sitter;
  - Reissner–Nordström;
  - the maximally extended Schwarzschild (Einstein–Rosen bridge);
  - Kerr's interior, with closed timelike curves near the ring;
  - Gödel's rotating universe;
  - cosmic strings (conical deficit);
  - time-machine constructions and chronology protection — [Hawking 1992](https://doi.org/10.1103/PhysRevD.46.603).
- **Intuition:** a Penrose-diagram gallery, and a paper cone made by cutting out a wedge (a cosmic string).
- **Derivation:**
  - RN horizons r± = M ± √(M² − Q²) (geometric units).
  - The cosmic-string deficit δ = 8πGμ/c².
  - Why the ER bridge pinches off — [Fuller & Wheeler 1962](https://doi.org/10.1103/PhysRev.128.919).
- **Prereqs:** steps 22, 26, 33.
- **Practice archetypes:**
  1. Cosmic string with Gμ/c² = 10⁻⁷: **δ = 2.5×10⁻⁶ rad = 0.52″**; with 10⁻⁶: **5.2″** [C]. This sets the scale of the double-image splitting; the actual separation depends on the geometry and is at most of order δ.
  2. RN with Q = 0.6M: **r₊ = 1.8M, r₋ = 0.2M** [C].
  3. Classify each gallery item by badge. Model answers:
     - Schwarzschild exterior **[EST-OBS]**;
     - white-hole region **[MATH]**;
     - Kerr interior beyond r₋ **[MATH, expected unstable]**;
     - Gödel **[MATH]** (wrong cosmology for our universe);
     - cosmic strings **[SPEC]**.
  4. Maximum proper time inside a Schwarzschild ER bridge, πGM/c³ (step 22). *Micro-teach:* nothing crosses before it pinches off.
- **Misconceptions:**
  - Every solution exists somewhere.
  - Closed-timelike-curve solutions mean time travel is possible.
  - White holes are observed.
- **Visualization:** a gallery of Penrose diagrams, each with a status badge and a "what would have to be true" list.

#### Step 35 — Traversable wormhole models · macroscopic traversable [MATH, needs exotic matter; no evidence]; holographic quantum traversable [SPEC]
- **Accomplishes:** the cleanest worked case of how energy conditions police geometry. Making a throat requires the null energy condition to fail there. Detail in Q5.
- **Goals:**
  - The Morris–Thorne metric with redshift function Φ(r) and shape function b(r).
  - Throat condition b(r₀) = r₀; flare-out b′(r₀) < 1.
  - NEC violation at the throat.
  - Ford–Roman thin-band constraint; Visser–Kar–Dadhich "arbitrarily small" violation.
  - Gao–Jafferis–Wall and its successors.
  - The 2022 "wormhole on a chip" controversy.
- **Intuition:** an embedding diagram of the throat (spatial slice, labelled) with the exotic band highlighted; a ray-traced view *through* a wormhole.
- **Derivation:** the Einstein tensor of the MT metric with Φ = 0 [V]:
  - **ρ = b′/(8πr²);**
  - **p_r = −b/(8πr³);**
  - **p_t = (b − rb′)/(16πr³);**
  - **ρ + p_r = (rb′ − b)/(8πr³)**, which is negative at the throat by flare-out (G = c = 1).
- **Prereqs:** steps 20, 33.
- **Practice archetypes:**
  1. From the formulas above, show ρ + p_r < 0 at r₀ when b′(r₀) < 1 [V].
  2. Ellis (Bronnikov) wormhole, b = r₀²/r: **ρ = p_r = −r₀²/(8πr⁴)**; the integrated energy per side is **−(π/4) r₀c²/G** [V]:

     | Throat r₀ | Negative mass per side |
     |---|---|
     | 1 m | **−1.06×10²⁷ kg ≈ −0.56 Jupiter masses** |
     | 1 km | **−1.06×10³⁰ kg ≈ −0.53 M☉** |

     [C].
  3. Radial tension at the throat, c⁴/(8πG r₀²): **4.8×10⁴² Pa at 1 m; 4.8×10³⁶ Pa at 1 km** [C].
  4. Compare with step 33, item 4 (the Casimir gap of ~10³⁸).
- **Misconceptions:**
  - GR predicts that wormholes exist.
  - Black holes are wormholes.
  - Google "created a wormhole". It simulated a toy model on a 9-qubit processor, and the claim was disputed — [Jafferis et al. 2022](https://doi.org/10.1038/s41586-022-05424-3); [Kobrin et al. 2023](https://arxiv.org/abs/2302.07897).
  - The 2016 traversable constructions are shortcuts. They are not: traversal takes longer than going around — [Maldacena, Milekhin & Popov 2018](https://arxiv.org/abs/1807.04726).
- **Visualization:** the throat embedding plus a ray-traced view. Every frame carries "[MATH] — requires exotic matter; none known in the needed amount".

#### Step 36 — The Alcubierre warp-drive metric and its limitations · superluminal [MATH, needs NEC violation]; positive-energy superluminal claims [REFUTED as stated]; subluminal positive-energy "warp shells" [MATH, no FTL]
- **Accomplishes:** a vivid, honest case study of how GR is used and abused in the popular press. It makes energy conditions, horizons and the ADM mass concrete. Detail in Q5.
- **Goals:**
  - The metric and its shape function.
  - The expansion θ: contraction in front, expansion behind. This depends on the slicing; Natário's construction has zero expansion.
  - The negative Eulerian energy density.
  - Total-energy estimates (Pfenning–Ford, Van Den Broeck).
  - The horizon and causality problem for v > c.
  - The semiclassical instability.
  - The 2021–2026 literature and its critiques.
- **Intuition:**
  - the "moving walkway" analogy, badged [MODEL];
  - a York-time (expansion) surface plot like Alcubierre's figure;
  - an energy-density "doughnut" around the wall;
  - an observer toggle: "Eulerian observers only" vs "all observers", which shows Santiago–Schuster–Visser's point.
- **Derivation:**
  - Verify that G^{tt} = −(v_s²/4)(ρ²/r_s²)(df/dr_s)² (G = c = 1, ρ² = y² + z²) for the tanh top-hat [V, numerically at two points]. The Eulerian energy density is this divided by 8π, so it is negative wherever f′ ≠ 0.
  - Verify the expansion θ = v_s[(x − x_s)/r_s] df/dr_s [V].
  - The total-energy integral (below).
- **Prereqs:** steps 22, 29, 33.
- **Practice archetypes:**
  1. Sign of the Eulerian energy density: **negative wherever f′ ≠ 0** [V].
  2. Thin-wall energy: E/c² ≈ −β²c²R²σ/(36G), with β = v_s/c and wall slope set by σ (a derivation for these notes). For R = 100 m, σ = 1 m⁻¹, β = 1: **−3.7×10²⁹ kg ≈ −0.19 M☉**; the exact integral agrees to 10⁻⁴ [C]. Scaling **∝ β²σR²**.
  3. With a quantum-inequality-limited wall thickness Δ ≈ 2/σ of ~100 Planck lengths: **E/c² ≈ −4.6×10⁶² kg** [C]. That is the same order as Pfenning & Ford's **−6.2×10⁶² kg** for a 100 m bubble at v = c, "ten orders of magnitude" above the visible universe's mass — [Pfenning & Ford 1997](https://arxiv.org/abs/gr-qc/9702026).
  4. Proper time aboard the bubble's centre equals the coordinate time of the distant frame: **dτ = dt**. The crew feels no acceleration and no time dilation. *Micro-teach:* that is why the idea is attractive, and why the cost lies entirely in the wall.
- **Misconceptions:**
  - "NASA is building a warp drive". White's 2021 paper was a Casimir-geometry calculation whose energy-density *shape* resembled Alcubierre's; it was not a warp bubble — [White et al. 2021](https://epjc.epj.org/articles/epjc/abs/2021/07/10052_2021_Article_9484/10052_2021_Article_9484.html).
  - The 2021 papers showed positive-energy faster-than-light drives work.
  - The bubble moves faster than light locally.
  - A warp metric is a propulsion system. Bobrick & Martire argue any warp drive is a shell moving inertially and still needs propulsion — [Monash record](https://research.monash.edu/en/publications/introducing-physical-warp-drives/).
- **Visualization:** the York-time plot, labelled "θ of the Eulerian slicing — not essential (Natário)". An energy-density plot with an observer toggle. A permanent status strip: "No known physical route to superluminal travel; all superluminal constructions violate the NEC for some observers."

#### Step 37 — Open questions in gravitation · status per item (Q7)
- **Accomplishes:** trains the learner to read the frontier honestly: what is measured, what is theorem, what is hint, what is speculation.
- **Goals:** the topics are quantum gravity, singularities and cosmic censorship, the information paradox, the cosmological-constant problem, dark matter and dark energy, the Hubble tension, no-hair and ringdown tests, the EHT, and the GW catalog highlights. Each is presented with evidence status, latest date checked and badge (Q7).
- **Intuition:** an "evidence ladder": each question placed on an axis running established → hint → speculative, with dated status chips, and a "what would change our minds" panel.
- **Derivation:** order-of-magnitude estimates (below), plus how to read σ, Bayes factors and credibility.
- **Prereqs:** whichever earlier steps each question touches.
- **Practice archetypes:**
  1. The cosmological-constant mismatch, Planck density c⁵/(ħG²) divided by ρ_Λ: **8.8×10¹²² (10^122.9)** [C]. *Micro-teach:* depending on the cutoff, the quoted mismatch ranges from ~10⁵⁵ to ~10¹²⁰ — [Martin 2012](https://arxiv.org/abs/1205.3365); [Carroll 2001](https://arxiv.org/abs/astro-ph/0004075). It is "the worst prediction" only under a Planck cutoff.
  2. A 1 M☉ black hole: Hawking evaporation time (photon/graviton-only formula 5120πG²M³/(ħc⁴)) **2.1×10⁶⁷ yr**; Bekenstein–Hawking entropy **1.05×10⁷⁷ k_B** [C].
  3. Planck scale: **ℓ_P = 1.616×10⁻³⁵ m; E_P = 1.22×10¹⁹ GeV** [C], matching NIST — [NIST](https://physics.nist.gov/cgi-bin/cuu/Value?plkl). The LHC reaches ~10⁴ GeV.
  4. Read GW250114's result — "remnant area larger than the sum of initial areas to high credibility" — and explain why press headlines saying "finally proved" overstate it — [LVK](https://arxiv.org/abs/2509.08054); [Cornell](https://as.cornell.edu/news/10th-anniversary-ligo-verifies-hawkings-theorem).
- **Misconceptions:**
  - The information paradox is solved.
  - Hawking radiation has been observed.
  - String theory has been confirmed.
  - The Hubble tension proves new physics.
  - DESI has discovered evolving dark energy (it is <5σ).
- **Visualization:** the evidence ladder and a dated changelog. 2026 items to flag:
  - GWTC-5.0 (May 2026);
  - the DES full-survey analysis (May 2026);
  - DESI's Lyman-α result (July 2026);
  - the Cai & Wang Hubble-tension review (June 2026);
  - the EHT M87* jet-base result (January 2026);
  - the warp-drive review by Barzegar, Buchert & Vigneron (February 2026);
  - the LVK plan update (October 2026).

### Gaps
- The (1 + cos Φ)/2 elongation factor in step 24 is taken from Will's deflection formula as summarized in the earlier notes ("~4 mas at 90°"). Its exact printed form was not re-read this session.
- The final spin of the GW150914 remnant (≈0.67) and the Kerr quasinormal-mode fit coefficients (Berti, Cardoso & Will 2006: f₁ = 1.5251, f₂ = −1.1568, f₃ = 0.1292) are **from memory, not verified**. The "~250 Hz" Kerr ringdown estimate in step 32 depends on both, so use the verified Schwarzschild value (195 Hz) in graded items until checked.
- The Pound–Rebka tower height (22.5 m) appears in the earlier notes but was flagged there as not confirmed in the sources they read. The Pound & Rebka (1960) and Pound & Snider (1965) ratios are cited as "ref" there, via Will.
- The Peters–Mathews formulas, the leading-order chirp formulas, the Casimir formula and the perfect-fluid energy-condition reductions are standard [S]. Their normalization is cross-checked against observations (Hulse–Taylor decay to 0.14%, GW150914 duration and strain, Earth–Sun 196 W), but the printed sources were not re-fetched.
- Physical constants were not re-fetched from CODATA or IAU this session.
- The in-repo `geodesic/` README quotes the S2 precession as "~13′ per orbit". ESO and GRAVITY quote ≈12′, and my computation from the rounded orbit gives 12.2′. Reconcile before reusing that module's text.

---

## Q3. Symbol-by-symbol dissections of the famous equations

### Takeaway
All fourteen requested equations can be dissected in a single, consistent convention set:
- signature (−,+,+,+);
- Christoffel symbols from the metric;
- Riemann tensor R^ρ_σμν = ∂_μΓ^ρ_νσ − …;
- Ricci tensor R_μν = R^λ_μλν.

This is the convention of Carroll and MTW. In it, positive energy focuses geodesics and Λ > 0 accelerates expansion. Each dissection below states:
- what every symbol and index means and its units;
- the sign traps;
- what the equation *accomplishes*;
- at least one verification run for these notes ([V]/[C]).

The app should show the convention badge on every equation card, because textbooks differ in up to three signs and these sign differences are the commonest source of "wrong" answers.

### Cited Findings
- Line element ds² = g_μν dx^μ dx^ν; Minkowski η_μν = diag(−1, 1, 1, 1); summation over repeated upper and lower indices — [Carroll notes §1, §2.5](https://arxiv.org/abs/gr-qc/9712019)
- Einstein's equations as R_μν − ½Rg_μν = 8πGT_μν (c = 1):
  - second-order PDEs for g_μν;
  - 10 equations, of which the Bianchi identity ∇^μG_μν = 0 leaves 6 independent;
  - the normalization 8πG is fixed by the Newtonian limit: the 00-component reduces to ∇²h₀₀ = −8πGT₀₀, which is Poisson's equation with h₀₀ = −2Φ — [Carroll §4.4](https://arxiv.org/abs/gr-qc/9712019)
- With c and G restored, κ = 8πG/c⁴ ≈ 2.07665×10⁻⁴³ N⁻¹. The G_μν + Λg_μν = κT_μν form follows MTW sign conventions — [Wikipedia: Einstein field equations](https://en.wikipedia.org/wiki/Einstein_field_equations)
- The trace-reversed form R_αβ = T_αβ − ½g_αβT (with 8πG = c = 1) "gives a formula for the Ricci tensor, which has a simple geometrical meaning" — [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044)
- Riemann has n²(n² − 1)/12 independent components (20 in 4D) — [Carroll §3.6](https://arxiv.org/abs/gr-qc/9712019)
- The Ricci tensor is R_βδ = R^α_βαδ; for a small ball at rest, V̈/V = −R_tt — [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044)
- Stress-energy:
  - T^μν is "the flux of four-momentum p^μ across a surface of constant x^ν";
  - a perfect fluid is diag(ρ, p, p, p) in its rest frame;
  - dust has p = 0 — [Carroll §1.9](https://arxiv.org/abs/gr-qc/9712019)
- The vacuum stress-energy is diag(Λ, −Λ, −Λ, −Λ) in Baez–Bunn units — [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044)
- Schwarzschild metric ds² = −(1 − 2GM/r)dt² + (1 − 2GM/r)⁻¹dr² + r²dΩ² (c = 1), asymptotically flat — [Carroll eq. 7.29](https://arxiv.org/abs/gr-qc/9712019)
- Kerr:
  - spin parameter a = J/(Mc);
  - horizons r± = [r_s ± √(r_s² − 4a²)]/2;
  - ergosphere boundary r_E = 1 + √(1 − a²cos²θ) (G = c = M = 1);
  - ring singularity at r = 0, θ = π/2 — [Wikipedia: Kerr metric](https://en.wikipedia.org/wiki/Kerr_metric); [Carroll ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- FLRW (flat, beginner form) ds² = −c²dt² + a(t)²(dx² + dy² + dz²); H = ȧ/a; critical density ρ_c = 3H²/(8πG); Ω_k = −kc²/(a₀²H₀²) — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (as summarized in the earlier notes)
- Linearized gravity: □h̄_μν = −16πGT_μν (c = 1) — [Carroll eq. 6.22](https://arxiv.org/abs/gr-qc/9712019)
- The quadrupole formula (Carroll eq. 6.85, c = 1): the radiation field is proportional to the second time derivative of the energy-density quadrupole moment at retarded time — [Carroll ch. 6](https://arxiv.org/abs/gr-qc/9712019)
- Binary orbital shrinkage dr/dt = −(64/5)(G³/c⁵)m₁m₂(m₁+m₂)/r³; the Earth–Sun system radiates ~200 W — [Wikipedia: Gravitational wave](https://en.wikipedia.org/wiki/Gravitational_wave)
- Effective-potential maximum for light at r = 3GM; ISCO at r = 6GM (Carroll eq. 7.55) — [Carroll ch. 7](https://arxiv.org/abs/gr-qc/9712019)

### Inferences
The dissections are synthesized from the cited forms. Every formula below was checked symbolically or numerically for these notes, as tagged. G = c = 1 unless SI is shown.

#### (1) Einstein field equations with Λ
**G_μν + Λ g_μν = (8πG/c⁴) T_μν, where G_μν ≡ R_μν − ½ R g_μν**

| Symbol | Meaning | Units / range | Notes |
|---|---|---|---|
| μ, ν | spacetime indices 0, 1, 2, 3 (t, x, y, z or t, r, θ, φ) | — | one equation per pair; symmetric, so 10 distinct |
| g_μν | metric: the unknown field (rulers, clocks, causal cones) | dimensionless in Cartesian-like coordinates | 10 functions of 4 coordinates |
| R_μν | Ricci tensor: the volume-focusing part of curvature | m⁻² | built from g and its 1st and 2nd derivatives |
| R | Ricci scalar g^μνR_μν | m⁻² | |
| G_μν | Einstein tensor | m⁻² | ∇^μG_μν ≡ 0 (identity) |
| Λ | cosmological constant | m⁻² | Planck 2018 values give **Λ ≈ 1.09×10⁻⁵² m⁻²** [C] |
| 8πG/c⁴ | coupling κ | **2.0766×10⁻⁴³ N⁻¹** [C] | the 8π is fixed by the Newtonian limit |
| T_μν | stress-energy (energy density, momentum flux, pressure, stress) | J/m³ = Pa | its divergence vanishes |

- **Signs.** With (−+++) and these Riemann/Ricci conventions, Λ > 0 on the left equals vacuum energy ρ_Λ = Λc²/(8πG) > 0 with p = −ρ_Λc² on the right. The −½R g_μν term in G_μν is what makes ∇^μG_μν ≡ 0.
- **What it accomplishes.**
  - Geometry is determined by local energy–momentum.
  - Through ∇^μG_μν ≡ 0 it *forces* ∇^μT_μν = 0, so matter's equations of motion follow.
  - Only 6 equations are independent; 4 functions remain as gauge (coordinate) freedom.
- **Trace-reversed form:** R_μν = κ(T_μν − ½T g_μν) + Λg_μν. In vacuum with Λ = 0 this is R_μν = 0.
- **Checks:**
  - 00-component in the weak field → ∇²Φ = 4πGρ [V via the h̄₀₀ solution].
  - Schwarzschild satisfies R_μν = 0 [V].
  - FLRW gives the Friedmann equations [V].
- **Trap:** it is not "curvature = mass". The source includes pressure: ρ + 3p/c² in the focusing equation.

#### (2) Geodesic equation
**d²x^μ/dτ² + Γ^μ_αβ (dx^α/dτ)(dx^β/dτ) = 0**, with g_μν (dx^μ/dτ)(dx^ν/dτ) = −c² (timelike) or 0 (null, using an affine λ in place of τ).

- **x^μ(τ):** the worldline.
- **τ:** proper time, the reading of the traveller's clock.
- **dx^μ/dτ = u^μ:** the 4-velocity.
- **Γ^μ_αβ:** the connection. It carries one upper "output" index μ and two lower "velocity" indices, symmetric in α and β.
- **Plus sign:** with this sign, the Γ term acts like minus a force: d²x/dτ² = −Γ(u, u).
- **What it accomplishes:** free fall for every body — the universality of free fall built in — and for light. In the weak static field it gives d²xⁱ/dt² ≈ −c²Γⁱ₀₀ = −∂ᵢΦ [V].
- **Origin:** stationary proper time, δ∫dτ = 0. Timelike geodesics are *local maxima* of τ.
- **Trap:** Γ is not a tensor. It vanishes at a point in a freely falling frame (the equivalence principle), while tidal effects (Riemann) do not.

#### (3) Christoffel symbols (Levi-Civita connection)
**Γ^λ_μν = ½ g^λσ (∂_μ g_νσ + ∂_ν g_μσ − ∂_σ g_μν)**

- **g^λσ:** the inverse metric, which raises the index.
- **∂_μ:** partial derivative with respect to x^μ.
- **The "+ + −" pattern:** the unique combination that is torsion-free (Γ^λ_μν = Γ^λ_νμ) and metric-compatible (∇g = 0).
- **Count:** 40 independent components in 4D.
- **What it accomplishes:** turns the metric into a rule for differentiating vectors and for free fall.
- **Verified examples** [V]:
  - polar: Γ^r_θθ = −r, Γ^θ_rθ = 1/r;
  - sphere: Γ^θ_φφ = −sin θ cos θ, Γ^φ_θφ = cot θ;
  - Schwarzschild: Γ^r_tt = M(r − 2M)/r³, Γ^t_tr = M/[r(r − 2M)], Γ^r_rr = −M/[r(r − 2M)], Γ^r_θθ = −(r − 2M).
- **Trap:** a non-zero Γ does not mean curvature (polar coordinates), and a zero Γ at a point does not mean flatness.

#### (4) Riemann curvature tensor
**R^ρ_σμν = ∂_μ Γ^ρ_νσ − ∂_ν Γ^ρ_μσ + Γ^ρ_μλ Γ^λ_νσ − Γ^ρ_νλ Γ^λ_μσ**

- **Index roles:**
  - ρ: output (the change of the vector);
  - σ: input (the vector being transported);
  - μ, ν: the two directions spanning the infinitesimal loop. The tensor is antisymmetric in μν.
- **Operational meanings:**
  - [∇_μ, ∇_ν]V^ρ = R^ρ_σμν V^σ;
  - the loop holonomy is δV^ρ ≈ R^ρ_σμν V^σ (area)^μν;
  - geodesic deviation is **D²ξ^μ/dτ² = R^μ_νρσ u^ν u^ρ ξ^σ** (Carroll's index order).
- **Symmetries:** R_ρσμν = −R_σρμν = −R_ρσνμ = R_μνρσ, and R_ρ[σμν] = 0. These leave 20 independent components in 4D.
- **What it accomplishes:** the complete, coordinate-independent local gravitational field, i.e. the tides.
- **Verified:**
  - sphere R_θφθφ = a²sin²θ;
  - Schwarzschild static-frame components R^r̂_t̂r̂t̂ = −2M/r³ and R^θ̂_t̂θ̂t̂ = +M/r³. With the deviation equation these give radial stretching +2M ξ/r³ and transverse squeezing −M ξ/r³, exactly the Newtonian tidal tensor −∂ᵢ∂ⱼΦ;
  - Kretschmann R_αβγδR^αβγδ = 48M²/r⁶ [V].
- **Trap:** sign conventions. Some texts define Riemann with the opposite overall sign, or contract Ricci on different slots. Always state the convention.

#### (5) Ricci tensor and Ricci scalar
**R_μν = R^λ_μλν; R = g^μν R_μν**

- **Meaning:**
  - R_μν is the trace of Riemann over the "output" and first "loop" slots. It measures the initial volume change of a small ball of freely falling particles: V̈/V = −R_tt for a ball at rest (Baez & Bunn).
  - The traceless remainder is the Weyl tensor (10 components): shape change, tides in vacuum, gravitational waves.
- **What it accomplishes:** the part of curvature that matter controls *locally*. "Vacuum" means R_μν = 0, and Riemann can still be non-zero.
- **Verified values** [V]:
  - 2-sphere R = 2/a²;
  - 3-sphere R = 6/a²;
  - flat-k FLRW R = 6(ä/a + ȧ²/a²);
  - Schwarzschild R_μν = 0.

#### (6) Einstein tensor
**G_μν = R_μν − ½ R g_μν**

- **Why this combination:** the contracted Bianchi identity ∇^μR_μν = ½∂_νR makes ∇^μG_μν ≡ 0 for *any* metric. A field equation G = κT is therefore automatically consistent with energy–momentum conservation; R_μν = κT_μν is not.
- **Trace:** g^μνG_μν = −R.
- **2D:** G_ab ≡ 0 identically [V], so there is no 2D GR.
- **FLRW** [V]:
  - G_tt = 3(ȧ² + k)/a²;
  - G^r_r = −(2aä + ȧ² + k)/a².
- **What it accomplishes:** the geometric side of the field equation, with conservation built in.

#### (7) Perfect-fluid stress-energy tensor
**T^μν = (ρ + p/c²) u^μ u^ν + p g^μν**

- **ρ:** rest-frame mass density (ρc² is the energy density, including internal energy).
- **p:** isotropic rest-frame pressure.
- **u^μ:** the fluid 4-velocity, with u·u = −c².
- **g^μν:** inverse metric.
- **Rest frame:** diag(ρc², p, p, p).
- **Under a boost:** T^00 = γ²(ρc² + p) − p.
- **Special cases:**
  - dust (p = 0);
  - radiation (p = ρc²/3; traceless);
  - vacuum (p = −ρc², T^μν = −ρc²g^μν, the same for every observer).
- **Conservation ∇_μT^μν = 0** gives the relativistic continuity and Euler equations. In FLRW it gives ρ̇ + 3H(ρ + p/c²) = 0 [V].
- **What it accomplishes:** the simplest realistic source — stars, cosmological fluids, dark energy. It also shows that pressure gravitates (ρ + 3p/c²).

#### (8) Schwarzschild metric
**ds² = −(1 − r_s/r) c²dt² + (1 − r_s/r)⁻¹ dr² + r²(dθ² + sin²θ dφ²), with r_s = 2GM/c²**

| Symbol | Meaning |
|---|---|
| t | time of static observers far away (not the time read by a nearby clock) |
| r | areal radius: a sphere at r has area 4πr² (not distance to the centre) |
| θ, φ | angles on the spheres |
| M | the mass measured by distant Keplerian orbits |
| (1 − r_s/r) in −g_tt | the clock-rate factor squared: (dτ/dt)² for static clocks |
| (1 − r_s/r)⁻¹ | radial ruler stretch |

- **What it accomplishes:** the unique spherically symmetric vacuum solution (Birkhoff). It describes the exterior of the Sun, the planets and non-spinning black holes.
- **Singularities:** r = r_s is a coordinate singularity (the Kretschmann scalar there is finite, [V]); r = 0 is a curvature singularity (K → ∞).
- **Checks:** R_μν = 0 [V]; it reduces to the weak-field metric for r ≫ r_s.
- **Traps:** using it inside matter; treating t as anyone's clock reading near the hole.

#### (9) Kerr metric (Boyer–Lindquist, G = c = 1)
**ds² = −(1 − 2Mr/Σ) dt² − (4Mar sin²θ/Σ) dt dφ + (Σ/Δ) dr² + Σ dθ² + (r² + a² + 2Ma²r sin²θ/Σ) sin²θ dφ²**
with **Σ = r² + a²cos²θ** and **Δ = r² − 2Mr + a²**.

- **a = J/M:** a length. In SI, a = J/(Mc); the dimensionless spin is χ = a/M ∈ [0, 1].
- **The dt dφ cross term:** frame dragging. ω = −g_tφ/g_φφ is the angular velocity of zero-angular-momentum observers.
- **Σ = 0** (r = 0, θ = π/2) is the ring singularity.
- **Δ = 0** gives the horizons **r± = M ± √(M² − a²)** [V].
- **g_tt = 0** gives the ergosurface **r_E = M + √(M² − a²cos²θ)** [V]. It touches the horizon at the poles and reaches 2M at the equator.
- **Horizon angular velocity:** Ω_H = a/(2Mr₊) = a/(r₊² + a²) [V].
- **Checks:**
  - vacuum: the numerical Ricci at a test point is ~10⁻²⁶ [V];
  - a = 0 recovers Schwarzschild [V];
  - the alternative g_φφ = [(r² + a²)² − a²Δ sin²θ]sin²θ/Σ is identical [V].
- **What it accomplishes:** describes all astrophysical black holes (no-hair: M and a only, with charge negligible). Spin-dependent ISCO, efficiency and ringdown.
- **Traps:**
  - BL "r" is not areal and r = 0 is a disk;
  - the region inside r₋ (inner horizon, closed timelike curves near the ring) is [MATH] and expected to be unstable;
  - χ > 1 gives no horizon.

#### (10) FLRW metric
**ds² = −c²dt² + a(t)² [ dr²/(1 − kr²) + r²(dθ² + sin²θ dφ²) ]**

- **a(t):** the scale factor.
- **t:** cosmic time, the proper time of comoving observers.
- **r, θ, φ:** comoving coordinates; galaxies keep their labels.
- **k:** spatial curvature.
- **Conventions:** two are in common use, and the app should pick one and badge it.
  - (A) a dimensionless with a₀ = 1, r a length, k in m⁻²;
  - (B) a a length, r dimensionless, k ∈ {−1, 0, +1}.
- **What it accomplishes:** the most general homogeneous, isotropic spacetime. Redshift 1 + z = a₀/a(t_emit) follows from its null geodesics, and the Hubble law v = Hd from its proper distance d = aχ.
- **Checks:** its Einstein tensor gives the Friedmann equations [V].
- **Trap:** "the universe expands into something". The metric has no outside; only the spatial rulers change with time.

#### (11) Friedmann, acceleration and continuity equations
- **(ȧ/a)² = (8πG/3)ρ − kc²/a² + Λc²/3** — this is the 00-component, a *constraint*.
- **ä/a = −(4πG/3)(ρ + 3p/c²) + Λc²/3** — the evolution equation.
- **ρ̇ + 3(ȧ/a)(ρ + p/c²) = 0** — energy conservation.

Symbols:
- H = ȧ/a is the Hubble parameter (H₀ today).
- ρ is the *total* mass-equivalent density: matter, radiation, and anything not written as Λ.
- p is the total pressure.
- The equation of state p = wρc² gives ρ ∝ a^{−3(1+w)}: matter w = 0, radiation w = 1/3, Λ w = −1.
- Density parameters Ω_i = ρ_i/ρ_c, with ρ_c = 3H²/(8πG) (**8.53×10⁻²⁷ kg/m³** for H₀ = 67.4 [C]).
- Ω_k = −kc²/(a₀²H₀²).

What they accomplish:
- the age (**13.80 Gyr** for Ω_m = 0.315 [C], versus Planck's 13.787 ± 0.020);
- the deceleration parameter q₀ = Ω_m/2 − Ω_Λ (**−0.53** [C]);
- the onset of acceleration at z ≈ 0.63 [C];
- the fate.

[V]: the three equations follow from G_μν + Λg_μν = 8πGT_μν for FLRW, and the continuity equation is the Bianchi identity.

Trap: the "+Λ" sign. With ρ + 3p/c² > 0 the expansion decelerates; Λ, i.e. SEC violation, accelerates it.

#### (12) Linearized field equations in Lorenz (harmonic) gauge
**□ h̄_μν = −(16πG/c⁴) T_μν, with ∂^μ h̄_μν = 0**

- **h_μν:** the small perturbation, g = η + h with |h| ≪ 1.
- **h̄_μν = h_μν − ½η_μν h:** the trace-reversed perturbation, with h = η^μνh_μν.
- **□ = η^αβ∂_α∂_β = −(1/c²)∂_t² + ∇²:** the flat wave operator.
- **Lorenz gauge** uses up 4 of the 10 components. **TT gauge** (in vacuum) removes 4 more, leaving h₊ and h×.
- **Sign check:** for a static point mass ∇²h̄₀₀ = −16πGρ/c², so h̄₀₀ = 4GM/(c²r) and h₀₀ = h_ii = 2GM/(c²r) [V]. That is exactly the weak-field metric g₀₀ = −(1 + 2Φ/c²), g_ii = 1 − 2Φ/c².
- **What it accomplishes:** gravitational waves travelling at c; the weak-field metric (hence light bending's factor of 2); gravitomagnetism.
- **Trap:** gauge freedom is not "unphysical waves". The Riemann tensor of a TT wave is non-zero.

#### (13) Quadrupole formula (strain and power)
- **h_ij^TT(t, r) = (2G/(c⁴ r)) Ï_ij^TT(t − r/c)**
- **P = (G/(5c⁵)) ⟨ d³Q_ij/dt³ · d³Q_ij/dt³ ⟩**

Symbols:
- I_ij = ∫ρ x_i x_j d³x is the second mass moment.
- Q_ij = I_ij − ⅓δ_ij I_kk is its trace-free part (Carroll writes q_ij = 3I_ij, hence his 2G/3R).
- TT means the transverse-traceless projection.
- t − r/c is the retarded time.
- ⟨…⟩ is an average over several periods.

Why a quadrupole: monopole radiation is forbidden by mass conservation (Birkhoff), and dipole radiation by momentum conservation. Spherical collapse does not radiate.

Circular binary: **P = (32/5)(G⁴/c⁵)(m₁m₂)²(m₁+m₂)/a⁵**. The GW frequency is 2× the orbital frequency, and the chirp is **ḟ = (96/5)π^{8/3}(G𝓜/c³)^{5/3}f^{11/3}** with 𝓜 = (m₁m₂)^{3/5}/(m₁+m₂)^{1/5}.

Checks [C]:
- Earth–Sun radiates **196 W** (cited: ~200 W).
- Hulse–Taylor, with the Peters–Mathews enhancement f(e = 0.617) = 11.84: Ṗ_b = −2.40×10⁻¹², against GR −2.4025×10⁻¹² and the observed ratio 0.9983 ± 0.0016.
- GW150914: 0.16 s from 35 Hz to merger, against the observed ~0.2 s.

What it accomplishes: turns orbital dynamics into a predicted waveform and energy loss. It is the first test of GR's radiative sector.

Traps:
- it needs slow motion and weak internal fields; the merger needs numerical relativity;
- the factor-of-3 convention difference between I and q.

#### (14) Schwarzschild effective potentials (massive and massless)
With conserved **E = (1 − 2M/r) dt/dλ** (energy per unit mass at infinity) and **L = r² dφ/dλ** (angular momentum per unit mass), in the equatorial plane:

**½ (dr/dλ)² + V(r) = ½E², V(r) = ½ε − εM/r + L²/(2r²) − ML²/r³**

where ε = 1 for massive particles (λ = τ) and ε = 0 for light.

- **Term by term** (massive case):
  - ½ε: rest-energy offset;
  - −M/r: Newtonian gravity;
  - +L²/2r²: centrifugal barrier;
  - **−ML²/r³: the GR term.** It dominates at small r, removes the centrifugal barrier's protection, causes the precession, and creates the ISCO.
- **SI form per unit mass:** V = −GM/r + L²/(2r²) − GML²/(c²r³).
- **Results** [V]:
  - circular orbits at r = [L² ± L√(L² − 12M²)]/(2M);
  - **ISCO** where these merge, at L = 2√3 M and **r = 6M**, with **E = 2√2/3**, giving 5.72% efficiency;
  - **marginally bound orbit r = 4M**;
  - **photon sphere** at the maximum of the massless potential, **r = 3M**;
  - **critical impact parameter b_c = 3√3 M**, so the shadow diameter is 2√27 GM/c².
- **What it accomplishes:** a one-dimensional "ball in a valley" picture that turns orbits, capture, light bending, ISCO and shadows into calculus-level problems. It is the core of Hartle's and TWB's physics-first approach.
- **Trap:** λ is proper time only for massive particles. For light it is an affine parameter, and only the ratio b = L/E matters.

### Gaps
- Textbook equation numbers (Carroll's notes eqs. 6.22, 6.85, 7.29 and 7.55) come from the earlier notes. The printed Kerr metric, the FLRW form and the effective-potential normalization in Carroll were not re-read this session; their correctness is established instead by the [V] checks.
- MTW's sign-convention table and the precise sign choices of Weinberg, Landau–Lifshitz and Wald were not re-verified. The app should cite one text's conventions explicitly — Carroll or MTW recommended — and say that others differ.

---

## Q4. Verified numerical facts and test values for the question banks (with authoritative sources)

### Takeaway
The classic tests can all be stated with primary or review-level sources, and the computed GR predictions match the measurements:
- Mercury 42.98″/cy;
- 1.75″ deflection;
- the GPS +45.8/−7.2/+38.6 μs/day budget;
- Pound–Rebka at 1%;
- Shapiro (Cassini γ − 1 = (2.1 ± 2.3)×10⁻⁵);
- the Hulse–Taylor decay ratio 0.9983 ± 0.0016;
- the double pulsar at 1.3×10⁻⁴.

These are safe for graded items. The strong-field numbers are also solid, with the caveat that horizon-scale tests are ~10%-level consistency checks:
- ISCO 6GM/c², photon sphere 3GM/c², Kerr r± = M ± √(M² − a²);
- GW150914 and GW250114 parameters;
- Sgr A* and M87* masses and ring sizes.

The cosmology numbers must carry dates and status labels:
- Planck 2018 parameters are stable;
- the Hubble tension (67–68 vs 73–73.5 km/s/Mpc, 5–7σ depending on the combination, with the CCHP dissenting at 70.4) is [OPEN] as of October 2026;
- DESI's evolving-dark-energy preference (2.8–4.2σ in DR2, ~3σ after 2025–26 recalibrations, with July 2026 Lyα moving toward ΛCDM) is [OPEN, <5σ].

### Cited Findings
Each row gives the measured or authoritative value, its source and the steps that use it. [C] predictions in the "check" column were computed for these notes.

**A. Solar-system and laboratory tests**

| Quantity | Value | Source | Check / note | Steps |
|---|---|---|---|---|
| Mercury anomalous perihelion advance | ≈43″/century (modern value); GR predicts 42.98″ | [Will 2014](https://arxiv.org/abs/1403.7377) | [C] 42.98″/cy from 6πGM/[c²a(1−e²)] | 1, 25 |
| Mercury budget (Earth/equinox frame) | total ≈5600″/cy (Clemence 1947: 5599.74 ± 0.41); equinox precession ≈5025″; planetary ≈532″ | [Clemence 1947](https://doi.org/10.1103/RevModPhys.19.361) (via earlier notes) | residual ≈43″ | 1, 25 |
| Mercury budget (inertial frame) | planetary 532.3035; oblateness 0.0286; GR 42.9799; Lense–Thirring −0.0020; predicted 575.31 vs observed 574.10 ± 0.65 ″/cy | [Wikipedia: Tests of GR](https://en.wikipedia.org/wiki/Tests_of_general_relativity) (secondary) | prefer the Will/Clemence framing for grading | 25 |
| Solar-limb deflection | ½(1+γ)×1.7505″ = 1.75″ in GR; 1911 EP-only value 0.83–0.87″ | [Will 2014](https://arxiv.org/abs/1403.7377); [Wikipedia: Eddington experiment](https://en.wikipedia.org/wiki/Eddington_experiment) | [C] 1.751″ (R☉ = 6.957×10⁸ m); 90° elongation 4.07 mas | 5, 24 |
| VLBI deflection bound | \|γ − 1\| < 2×10⁻⁴ | [Will 2014](https://arxiv.org/abs/1403.7377) | | 24 |
| Shapiro delay | up to ~250 μs round trip, grazing the Sun | [Will 2014](https://arxiv.org/abs/1403.7377) | [C] 247 μs (Earth–Mars, superior conjunction) | 24 |
| Cassini | γ − 1 = (2.1 ± 2.3)×10⁻⁵ | [Bertotti, Iess & Tortora 2003](https://doi.org/10.1038/nature01997); [Will 2014](https://arxiv.org/abs/1403.7377) | Wikipedia reports later studies suggesting the error may be underestimated by up to ~10×; not traced to a primary source | 24 |
| PPN β | \|β − 1\| < 8×10⁻⁵ (perihelion); MESSENGER fit β − 1 = (−4.1 ± 7.8)×10⁻⁵ | [Will 2014](https://arxiv.org/abs/1403.7377) | | 25 |
| GPS clocks | gravity ≈ +46 μs/day, speed ≈ −7 μs/day, net ≈ +39 μs/day; a = 2.656175×10⁷ m; Φ₀/c² = −6.969290134×10⁻¹⁰; 1 ns ≈ 30 cm | [Will 2014](https://arxiv.org/abs/1403.7377); [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/) | [C] +45.79, −7.21, +38.58 μs/day; 10.22999999543 MHz | 9 |
| NTS-2 (1977) | measured +442.5 vs predicted +446.5 parts in 10¹² | [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/) | ~1% test | 9 |
| Hafele–Keating (1971) | east −59 ± 10 ns (pred. −40 ± 23); west +273 ± 7 ns (pred. +275 ± 21) | [Hafele & Keating 1972](https://doi.org/10.1126/science.177.4044.168) | | 9 |
| Pound–Rebka / Pound–Snider | 1960: 1.05 ± 0.10 of prediction; 1965: 0.9990 ± 0.0076; series reached 1% | [Will 2014](https://arxiv.org/abs/1403.7377) (PRL 4, 337; Phys. Rev. 140, B788 as references) | [C] 2gh/c² = 4.9×10⁻¹⁵ for 22.5 m (height flagged) | 5, 23 |
| Gravity Probe A (1976) | \|α\| < 2×10⁻⁴ | [Will 2014](https://arxiv.org/abs/1403.7377) | | 23 |
| Galileo eccentric satellites (2018) | (0.19 ± 2.48)×10⁻⁵ | [Delva et al. 2018](https://arxiv.org/abs/1812.03711) | | 23 |
| Optical clocks 33 cm (NIST 2010) | redshift resolved for ~33 cm (≈4×10⁻¹⁷) | [Chou et al. 2010](https://doi.org/10.1126/science.1192720) | [C] 3.6×10⁻¹⁷ | 5, 23 |
| JILA 1 mm (2022) | gradient across a ~1 mm Sr sample; uncertainty 7.6×10⁻²¹ | [Bothwell et al. 2022](https://arxiv.org/abs/2109.12238) | [C] expected 1.1×10⁻¹⁹ | 5 |
| MICROSCOPE | η(Ti,Pt) = [−1.5 ± 2.3 (stat) ± 1.5 (syst)]×10⁻¹⁵ | [Touboul et al. 2022](https://arxiv.org/abs/2209.15487) | | 5 |
| Gravity Probe B | geodetic −6601.8 ± 18.3 mas/yr (GR −6606.1); frame dragging −37.2 ± 7.2 mas/yr (GR −39.2) | [Everitt et al. 2011](https://arxiv.org/abs/1105.3456) | [C] geodetic 6604 mas/yr (circular, r = 7027 km) | 13, 28 |
| Second redefinition | the 28th CGPM (Oct 2026) Resolution 4 prepares a redefinition based on optical standards, for adoption at the 29th CGPM in 2030 | [BIPM Resolution 4](https://www.bipm.org/en/cgpm-2026/resolution-4) | context only: GR-sensitive clocks become the definition | 9 |

**B. Binary pulsars and gravitational waves**

| Quantity | Value | Source | Check / note | Steps |
|---|---|---|---|---|
| Hulse–Taylor PSR B1913+16 | m_p = 1.438 ± 0.001, m_c = 1.390 ± 0.001 M☉; observed/GR decay 0.9983 ± 0.0016 | [Weisberg & Huang 2016](https://arxiv.org/abs/1606.02744) | | 25, 27 |
| Hulse–Taylor (Will) | Ṗ_b(GR) = −2.402531 ± 0.000014×10⁻¹²; observed/GR 0.997 ± 0.002; ω̇ ≈ 4.2°/yr | [Will 2014](https://arxiv.org/abs/1403.7377) | [C] −2.40×10⁻¹², 4.23°/yr, merger in 301 Myr, P_GW = 7.8×10²⁴ W | 25, 27 |
| Hulse–Taylor orbit | P_b = 7.7519 h; e = 0.617; ~76.5 μs/yr period decrease; ~300 Myr to merger | [Wikipedia: Hulse–Taylor](https://en.wikipedia.org/wiki/Hulse%E2%80%93Taylor_pulsar) | [C] 75.7 μs/yr | 27 |
| Double pulsar J0737−3039A/B | 2.45 h orbit; e = 0.088; ω̇ = 16.9°/yr; quadrupole formula validated to 1.3×10⁻⁴ (95%) | [Kramer et al. 2021](https://arxiv.org/abs/2112.06795) | | 25, 27 |
| GW150914 | 14 Sep 2015; 35→250 Hz; peak strain 1.0×10⁻²¹; SNR 24; 410 (+160/−180) Mpc; z = 0.09; 36 (+5/−4) + 29 ± 4 → 62 ± 4 M☉; 3.0 ± 0.5 M☉c² radiated; >5.1σ | [LVK 2016](https://arxiv.org/abs/1602.03837) | [C] 𝓜 = 28.1 (source), 30.6 (detector) M☉; 5.4×10⁴⁷ J; 1.34 Gly | 27 |
| LIGO arm change | ~4×10⁻¹⁸ m ≈ 1/200 proton diameter; 4 km arms; ~100 kW circulating (2015) | [LIGO detector summary](https://ligo.org/science-summaries/gw150914detector/) | [C] hL = 4×10⁻¹⁸ m | 27 |
| GW170817 | GRB +1.74 ± 0.05 s; −3×10⁻¹⁵ ≤ (v_GW − c)/c ≤ +7×10⁻¹⁶; ~40 Mpc | [LVK et al. 2017](https://arxiv.org/abs/1710.05834) | | 27, 37 |
| GW standard siren H₀ | 70.0 (+12.0/−8.0) (GW170817); 71.0 (+9/−7) (GWTC-5.0, 2026); dark sirens 69.9 ± 4.1 | [LVK 2017](https://arxiv.org/abs/1710.05835); [Virgo GWTC-5 release](https://www.virgo-gw.eu/news/the-new-ligo-virgo-kagra-catalog-sets-new-records-in-precision-gravitational-astronomy/); [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) | | 31, 37 |
| GW250114 | SNR ≈ 80 (76.9 in GWTC-5.0); 33.6 (+1.2/−0.8) + 32.2 (+0.8/−1.3) M☉; χ ≤ 0.26; area theorem at high credibility; ≥2 QNMs; frequencies within ±30% of Kerr | [LVK, arXiv:2509.08054](https://arxiv.org/abs/2509.08054); [arXiv:2509.08099](https://arxiv.org/abs/2509.08099); [GWTC-5.0](https://arxiv.org/abs/2605.27225) | [C] initial area 2.37×10⁵ km² (cited ≈240,000 → ≈400,000 km²) | 22, 26, 37 |
| GW231123 | 137 (+23/−18) + 101 (+22/−50) M☉; total 190–265 M☉; spins 0.90 / 0.80; large systematics | [LVK, arXiv:2507.08219](https://arxiv.org/abs/2507.08219) | | 26, 37 |
| GW241011 / GW241110 | 2nd-generation BH evidence; ultralight bosons 10⁻¹³–10⁻¹² eV excluded (GW241011) | [LVK, arXiv:2510.26931](https://arxiv.org/abs/2510.26931) | | 37 |
| Catalogs | GWTC-4.0: 128 new O4a candidates (218 total); GWTC-5.0 (26 May 2026): 161 new O4b candidates, 390 through Jan 2025; O4 ended 18 Nov 2025 | [arXiv:2508.18082](https://arxiv.org/abs/2508.18082); [arXiv:2605.27225](https://arxiv.org/abs/2605.27225); [Virgo O4 release](https://www.virgo-gw.eu/news/ligo-virgo-and-kagra-complete-the-richest-observation-run-to-date/) | O4c not yet cataloged; IR1 planned mid-Jan 2027 ([LVK plans](https://observing.docs.ligo.org/plan/), via search summary) | 27, 37 |
| GWTC-4 tests of GR | 91 confident signals; >90% consistent with GR at 90% credibility; no post-merger echoes | [TGR I](https://arxiv.org/pdf/2603.19019); [TGR III](https://arxiv.org/pdf/2603.19021) | | 37 |
| Graviton mass | m_g ≤ 1.27×10⁻²³ eV/c² (GWTC-3) | [arXiv:2112.06861](https://arxiv.org/abs/2112.06861) | | 37 |
| NANOGrav 15-yr | HD-correlated background, 67 pulsars; ~3–4σ; A = 2.4 (+0.7/−0.6)×10⁻¹⁵ at 1/yr | [NANOGrav 2023](https://arxiv.org/abs/2306.16213) | no 5σ update found | 37 |

**C. Black holes and strong-field orbits**

| Quantity | Value | Source | Check / note | Steps |
|---|---|---|---|---|
| ISCO / photon sphere (Schwarzschild) | 6GM/c² / 3GM/c² | [Carroll ch. 7](https://arxiv.org/abs/gr-qc/9712019); [Wikipedia: ISCO](https://en.wikipedia.org/wiki/Innermost_stable_circular_orbit) | [V] also r_mb = 4M, E_isco = 2√2/3, b_c = 3√3 M | 21, 24 |
| Kerr ISCO limits | prograde → GM/c²; retrograde → 9GM/c² | [Wikipedia: ISCO](https://en.wikipedia.org/wiki/Innermost_stable_circular_orbit) | [C] χ = 0.9: 2.321 / 8.717 | 26 |
| Kerr horizons, ergosphere | r± = [r_s ± √(r_s² − 4a²)]/2 = M ± √(M² − a²); r_E = M + √(M² − a²cos²θ) | [Wikipedia: Kerr metric](https://en.wikipedia.org/wiki/Kerr_metric); [Carroll ch. 7](https://arxiv.org/abs/gr-qc/9712019) | [V] | 26 |
| Disk efficiency | 5.7% (Schwarzschild) to ~42% (maximal prograde Kerr) | earlier notes (lecture-note sources, e.g. [arXiv:1810.07032](https://arxiv.org/abs/1810.07032)) | [C] 5.72%, 42.26% | 21, 26 |
| Sgr A* mass, distance | 4.30×10⁶ M☉ (±0.25%); R₀ = 8275 ± 9 ± 33 pc | [GRAVITY 2022](https://arxiv.org/abs/2112.07478); [MPE](https://www.mpe.mpg.de/6588951/The-black-hole) | [C] r_s = 0.085 AU | 20 |
| Sgr A* EHT ring | 51.8 ± 2.3 μas (2017 data; May 2022); shadow consistent with GR to ~10% | [EHT 2022 Paper I](https://iopscience.iop.org/article/10.3847/2041-8213/ac6674); [arXiv:2311.08680](https://arxiv.org/abs/2311.08680) | [C] predicted shadow 53.3 μas | 24 |
| M87* mass, distance, ring | 6.5 ± 0.7×10⁹ M☉; 16.8 Mpc; 42 ± 3 μas (2017); persistent 43.9 ± 0.6 μas (2017/18/21) | [EHT 2019 Paper I](https://arxiv.org/abs/1906.11238); [Paper VI](https://arxiv.org/abs/1906.11243); [EHT 2025](https://arxiv.org/abs/2509.24593) | [C] predicted 39.7 μas; the mass is partly ring-derived | 24 |
| M87* jet base (Jan 2026) | compact component ~0.09 ly from the hole | [NRAO via Newswise](https://www.newswise.com/articles/new-event-horizon-telescope-results-trace-m87-jet-back-to-its-black-hole) | | 37 |
| S2 star | pericentre 120 AU, ~7650 km/s, e ≈ 0.88; redshift f = 0.90 ± 0.09 ± 0.15; precession 12′/orbit, f_SP = 1.10 ± 0.19 | [GRAVITY 2018](https://arxiv.org/abs/1807.09409); [GRAVITY 2020](https://arxiv.org/abs/2004.07187); [ESO](https://www.eso.org/public/news/eso2006/) | [C] 12.2′ | 23, 25 |
| Cygnus X-1 | 21.2 ± 2.2 M☉ at 2.22 kpc | [Miller-Jones et al. 2021](https://arxiv.org/abs/2102.09091) | a 2025 lower-mass claim is unverified | 20 |

**D. Cosmology**

| Quantity | Value | Source | Steps |
|---|---|---|---|
| Planck 2018 (TT,TE,EE+lowE+lensing) | H₀ = 67.4 ± 0.5; Ω_m = 0.315 ± 0.007; Ω_bh² = 0.0224 ± 0.0001; Ω_ch² = 0.120 ± 0.001; n_s = 0.965 ± 0.004; age 13.787 ± 0.020 Gyr; z* = 1089.9; r_drag = 147.09 ± 0.26 Mpc; with BAO: H₀ = 67.66 ± 0.42, Ω_m = 0.311 ± 0.006, Ω_K = 0.001 ± 0.002 | [Planck 2018 VI](https://arxiv.org/abs/1807.06209) | 30, 31 |
| Other early-universe H₀ | Planck TT,TE,EE+lowE 67.27 ± 0.60; ACT DR6 68.3 ± 1.1; SPT-3G 66.81 ± 0.81; Planck+ACT+SPT 67.19 ± 0.38 | [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) | 31, 37 |
| Local distance ladder | SH0ES 73.04 ± 1.04; with JWST Cepheids 73.49 ± 0.93; HST+JWST Cepheid+TRGB 73.18 ± 0.88; H0DN 73.50 ± 0.81 (7.1σ vs CMB-ΛCDM) | [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) | 31, 37 |
| CCHP | TRGB 70.39 ± 1.22 (stat) ± 1.33 (sys) ± 0.70 (σ_SN); JWST-only 68.81; JAGB ≈ 67.8 | [Freedman et al. 2025](https://iopscience.iop.org/article/10.3847/1538-4357/adce78) | 31, 37 |
| Other H₀ probes | TDCOSMO 71.6 (+3.9/−3.3); megamasers 73.9 ± 3.0 | [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) | 37 |
| DESI DR2 (Mar 2025) | w₀w_a preferred at 3.1σ (BAO+CMB); 2.8σ / 3.8σ / 4.2σ with Pantheon+ / Union3 / DES-Y5 | [DESI DR2](https://arxiv.org/abs/2503.14738) | 31, 37 |
| DES recalibration and full survey | DES-Dovekie: 3.2σ (from 4.2σ); DES full multi-probe (May 2026): 2.2–3.0σ | [arXiv:2511.07517](https://arxiv.org/abs/2511.07517v2); [arXiv:2605.27221](https://arxiv.org/abs/2605.27221) | 37 |
| DESI Lyα full-shape (30 Jul 2026) | central value shifts toward ΛCDM | [DESI news](https://www.desi.lbl.gov/2026/07/30/new-desi-dr2-lyman-alpha-results-shed-light-on-dark-energy/) | 37 |
| Euclid DR1 | DR1-Foundation planned Nov 2026; cosmology products mid-2027 | [ESA timeline](https://www.cosmos.esa.int/web/euclid/dr1-timeline) | 37 |
| Cosmological-constant mismatch | ~10¹²⁰ (Planck cutoff) to ~10⁵⁵–10⁶⁰ depending on cutoff/method | [Martin 2012](https://arxiv.org/abs/1205.3365); [Carroll 2001](https://arxiv.org/abs/astro-ph/0004075) | 37 |

**E. Constants and derived reference values** (all [C] unless cited)

| Quantity | Value | Use |
|---|---|---|
| κ = 8πG/c⁴ | 2.0766×10⁻⁴³ N⁻¹ (also [Wikipedia: EFE](https://en.wikipedia.org/wiki/Einstein_field_equations)) | 18 |
| Λ (Planck values) | 1.09×10⁻⁵² m⁻²; ρ_Λ = 5.8×10⁻²⁷ kg/m³ | 18, 31 |
| ρ_c (H₀ = 67.4) | 8.53×10⁻²⁷ kg/m³ ≈ 5.1 protons/m³ | 31 |
| Hubble time / radius (67.4) | 14.5 Gyr / 4,448 Mpc | 30 |
| GM☉/c³ | 4.925 μs | 21, 27 |
| r_s | Sun 2.953 km; Earth 8.87 mm | 20 |
| Planck length / energy | 1.616×10⁻³⁵ m ([NIST](https://physics.nist.gov/cgi-bin/cuu/Value?plkl)) / 1.22×10¹⁹ GeV ([NIST](https://physics.nist.gov/cgi-bin/cuu/Value?plkmc2gev)) | 37 |
| Schwarzschild QNM (ℓ = 2, n = 0) | Mω = 0.37367 − 0.08896i (Leaver continued fraction, computed here) | 32 |
| Hawking temperature | 6.17×10⁻⁸ K × (M☉/M) | 22 |

### Inferences
**Question-bank rules.**
1. Store each item with:
   - the measured value with its uncertainty and source;
   - the GR prediction with its formula and inputs;
   - a "checked on" date;
   - a status badge.
2. Grade against the *computed* value using the stated inputs, with ±1% tolerance. Separately, show the *measured* value as context.

**Safe vs unsafe items.**
- Safe for graded items:
  - all of Table A;
  - binary-pulsar and GW150914 parameters;
  - Planck 2018 numbers;
  - ISCO, photon sphere and Kerr formulas.
- Use only with dates and [OPEN] badges: the H₀ tension, DESI w₀w_a and GW-catalog counts. These move every few months.
- Avoid in graded items until verified:
  - the "10 km/day" GPS claim (use "light travels 11.6 km in 38.6 μs");
  - the Cassini "error underestimated" claim;
  - the 2025 Cygnus X-1 lower mass;
  - the M87* gas-dynamics mass.

**Sigma arithmetic** [C]. Simple quadrature gives:
- SH0ES vs Planck: 4.9σ;
- SH0ES HST+JWST vs CMB combined: 6.2σ;
- H0DN vs CMB combined: 7.05σ.

These match published claims ("almost 6σ", "7.1σ"). They are a good exercise in why the choice of combination matters.

### Gaps
- Pound–Rebka's 22.5 m tower height, the Cassini error-underestimation claim, the 2025 Cygnus X-1 mass and the M87* mass tension were not verified, all for lack of a primary source this session.
- GW150914's final spin, peak luminosity (often quoted as ~3.6×10⁴⁹ W) and inter-site delay (~7 ms) were not verified.
- The exact current SH0ES 2025/26 primary paper was not opened; its values come via the June 2026 review.
- No authoritative statement was found of a combined post-July-2026 DESI significance.

---

## Q5. Energy conditions, quantum inequalities, wormholes and warp drives: what the literature actually claims, the consensus, and a labelling scheme

### Takeaway
**Energy conditions** are assumptions about "reasonable" matter, not laws of nature. Every pointwise condition (NEC, WEC, SEC, DEC) is violated by quantum fields, and some by simple classical fields. The robust survivors are averaged conditions, especially the achronal ANEC, and quantum energy inequalities, which bound how negative and for how long.

**Wormholes.** Traversable Morris–Thorne wormholes are exact *geometries*, but the flare-out of the throat forces NEC violation there. Quantum inequalities confine such exotic matter to absurdly thin bands. The only well-founded traversable constructions (holographic, Gao–Jafferis–Wall and successors) are microscopic, need non-local couplings, and are *slower* than going around.

**Warp drives.** Alcubierre's metric is a legitimate exact geometry with negative Eulerian energy density. The quantum-inequality-limited energy for a 100 m bubble at c is ~−6×10⁶² kg, against my independent estimate of −4.6×10⁶²; superluminal bubbles are also causally cut off from their pilots and semiclassically unstable. The 2021 "positive-energy" claims fall into two groups:
- **refuted:** the superluminal ones. Generic warp drives violate the NEC for some observer (Santiago–Schuster–Visser 2022);
- **subluminal:** Bobrick & Martire 2021; Fuchs et al. 2024 (constant velocity, matter shell, no acceleration mechanism).

A February 2026 review finds viability "highly challenging", for reasons beyond the energy conditions.

Consensus: **no known physical route to faster-than-light travel.** Present wormholes and warp drives as [MATH] geometries that teach energy conditions, never as technology.

### Cited Findings
**Energy conditions and quantum inequalities**
- "All pointwise energy conditions are systematically violated by quantum fields and also by some rather simple classical fields." Weaker replacements — quantum energy inequalities and averaged energy conditions — were introduced. The *achronal* ANEC "is expected to be a universal property of the dynamics of all gravitating physical matter, even in the context of semiclassical or quantum gravity" — [Kontou & Sanders 2020, CQG 37, 193001](https://arxiv.org/abs/2003.01815v2)
- The Casimir effect is a real, measured negative-energy-density configuration: uncharged plates attract because the vacuum energy between them is lower — [Lamoreaux 1997](https://doi.org/10.1103/PhysRevLett.78.5)
- Quantum inequalities limit how much negative energy can exist and for how long. For wormholes, the exotic matter must be confined to a band many orders of magnitude thinner than the throat — [Ford & Roman 1996](https://arxiv.org/abs/gr-qc/9510071)
- The amount of violation can in principle be made small with fine-tuned geometry — [Visser, Kar & Dadhich 2003](https://arxiv.org/abs/gr-qc/0301003)
- Topological censorship: with the ANEC, observers cannot traverse non-trivial topology — [Friedman, Schleich & Witt 1993](https://arxiv.org/abs/gr-qc/9305017)
- Penrose's 1965 theorem needs a trapped surface plus positive energy to force geodesic incompleteness — [Penrose 1965](https://doi.org/10.1103/PhysRevLett.14.57). The area theorem: in classical GR, total horizon area never decreases — [Hawking 1971](https://doi.org/10.1103/PhysRevLett.26.1344)
- Vacuum energy has ρ + 3P = −2Λ, so it repels — [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044)

**Wormholes**
- Einstein–Rosen bridge (1935) — [Phys. Rev. 48, 73](https://doi.org/10.1103/PhysRev.48.73). The Schwarzschild bridge pinches off too fast for anything, even light, to cross — [Fuller & Wheeler 1962](https://doi.org/10.1103/PhysRev.128.919)
- Morris & Thorne (1988, AJP 56, 395): traversable wormholes require "exotic" matter with negative energy density as seen by some observers — [doi:10.1119/1.15620](https://doi.org/10.1119/1.15620)
- With Yurtsever, they showed such wormholes could become time machines — [PRL 61, 1446](https://doi.org/10.1103/PhysRevLett.61.1446). Hawking's chronology-protection conjecture argues physics prevents this — [PRD 46, 603](https://doi.org/10.1103/PhysRevD.46.603)
- Morris–Thorne metric components (from this session's search results): redshift function Φ(r) and shape function b(r); throat b(r₀) = r₀ and flare-out (b − rb′)/b² > 0, i.e. b′(r₀) < 1; Φ finite so there is no horizon. The Einstein equations then force ρ + p_r < 0 at the throat — ["Inflating Lorentzian wormholes", arXiv:gr-qc/9211012](https://arxiv.org/pdf/gr-qc/9211012); ["Modelling Casimir wormholes in extended gravity", arXiv:2004.14801](https://arxiv.org/pdf/2004.14801)
- Gao, Jafferis & Wall (2016): coupling the two boundaries of an AdS black hole produces negative null energy that makes the Einstein–Rosen bridge slightly traversable — [arXiv:1608.05687](https://arxiv.org/abs/1608.05687)
- Maldacena, Milekhin & Popov (2018): 4D traversable wormholes with Standard-Model-like fields, but traversal takes longer than going outside — no shortcut, causality safe — [arXiv:1807.04726](https://arxiv.org/abs/1807.04726)
- Google Sycamore (2022) "wormhole": a machine-learning-simplified SYK-type model (7 Majorana fermions, 5 terms) — [Jafferis et al. 2022](https://doi.org/10.1038/s41586-022-05424-3)
  - Critique: the learned Hamiltonian does not thermalize, and "perfect size winding" is generic to small commuting models — [Kobrin, Schuster & Yao 2023](https://arxiv.org/abs/2302.07897)
  - Reply — [Jafferis et al. 2023](https://arxiv.org/abs/2303.15423)

**Alcubierre and the warp-drive literature**
- Alcubierre (1994), "The warp drive: hyper-fast travel within general relativity", CQG 11, L73 — [arXiv:gr-qc/0009013](https://arxiv.org/abs/gr-qc/0009013)
- Pfenning & Ford (1997), "The unphysical nature of 'Warp Drive'", CQG 14, 1743. Applying quantum-inequality restrictions, "the bubble wall thickness is on the order of only a few hundred Planck lengths", and "the total integrated energy density needed to maintain the warp metric with such thin walls is physically unattainable." For a 100 m bubble with v = c they estimate **≈6.2×10⁶² kg of negative energy, ~10 orders of magnitude more than the mass of the visible universe** — [arXiv:gr-qc/9702026](https://arxiv.org/pdf/gr-qc/9702026) (via search summary); restated in [Helfer, gr-qc/9906050](https://arxiv.org/pdf/gr-qc/9906050)
  - The energy depends strongly on the geometry, and the authors note microscopic bubbles remain conceivable.
  - A 2004 paper argues one quantum inequality fails in 2D de Sitter space — [arXiv:gr-qc/0409007](https://arxiv.org/pdf/gr-qc/0409007)
- Van Den Broeck (1999), CQG 16, 3973. A "pocket" geometry with a tiny external surface and large interior volume. The final version (v5) needs negative mass **of order a few solar masses**, with a comparable positive energy. An earlier version's "grams" figure was corrected — [arXiv:gr-qc/9905084](https://arxiv.org/abs/gr-qc/9905084)
- Natário (2002), "Warp drive with zero expansion", CQG 19, 1157–1166. The expansion and contraction of space usually credited to Alcubierre's drive is a side effect of his particular choice; a zero-expansion warp spacetime exists. The paper also covers global and optical properties — [arXiv:gr-qc/0110086](https://arxiv.org/abs/gr-qc/0110086)
- Causality: for a superluminal bubble, the front is causally disconnected from the interior, so a crew could neither create nor steer it (Krasnikov-tube analysis) — [Everett & Roman 1997](https://arxiv.org/abs/gr-qc/9702049)
- Semiclassical instability: the renormalized stress-energy grows exponentially at the front of superluminal bubbles — [Finazzi, Liberati & Barceló 2009](https://arxiv.org/abs/0904.0141)
- **Lentz (2021)**, "Breaking the warp barrier: hyper-fast solitons in Einstein–Maxwell-plasma theory", CQG (March 2021, doi:10.1088/1361-6382/abe692). Claims superluminal solitons sourced by *positive* energy density alone, potentially from a conducting plasma plus classical EM fields — [arXiv:2006.07125](https://arxiv.org/abs/2006.07125v2)
- **Bobrick & Martire (2021)**, "Introducing physical warp drives", CQG 38, 105009 (20 May 2021):
  - a general model of spherically symmetric, *subluminal*, positive-energy warp drives, buildable "in principle" with known physics;
  - superluminal solutions satisfying quantum-inequality constraints (still negative energy);
  - an Alcubierre modification reducing the negative-energy requirement by about two orders of magnitude;
  - "any warp drive is a shell of material moving inertially", so it needs propulsion.
  - The authors do not claim FTL is achievable; press coverage was more enthusiastic — [Monash record](https://research.monash.edu/en/publications/introducing-physical-warp-drives/); [arXiv:2102.06824](https://arxiv.org/abs/2102.06824v2)
- **Fell & Heisenberg (2021)**, "Positive energy warp drive from hidden geometric structures", CQG 38, 155020. A superluminal soliton with positive *semi-definite Eulerian* energy, whose example configurations need total energy ~4 orders of magnitude below a solar mass — [arXiv:2104.06488](https://arxiv.org/pdf/2104.06488)
- **Santiago, Schuster & Visser (2022)**, "Generic warp drives violate the null energy condition", PRD 105, 064038. The three positive-energy papers checked only one family of observers, the co-moving Eulerian ones, whereas the WEC requires positive energy density for *all* timelike observers. Generic warp drives violate the NEC, and hence the WEC, SEC and DEC — [arXiv:2105.03079](https://arxiv.org/abs/2105.03079v2)
  - Lentz reportedly accepted the criticism but argued a sub-class might still satisfy the WEC; SSV disagreed (secondary source) — [Interesting Engineering](https://interestingengineering.com/science/fact-check-do-warp-drive-engines-violate-the-laws-of-physics)
- **Schuster, Santiago & Visser (2023)**, "ADM mass in warp drive spacetimes", GRG 55, 14. Examines what it means for a bubble to have mass and to move relative to the fixed stars, using generic zero-vorticity Natário drives — [Springer](https://link.springer.com/article/10.1007/s10714-022-03061-9); [arXiv:2205.15950](https://arxiv.org/pdf/2205.15950)
- **Fuchs, Helmerich, Bobrick, Sellers, Melcher & Martire (2024)**, "Constant velocity physical warp drive solution". A *subluminal*, constant-velocity solution satisfying all energy conditions: a stable shell of ordinary matter with an Alcubierre-like shift vector inside, and positive (ADM) mass. It was built with the "Warp Factory" numerical toolkit. Press coverage stressed it is not practical and that the authors plan to study higher velocities and acceleration — [arXiv:2405.02709](https://arxiv.org/abs/2405.02709v1); [ScienceAlert](https://sciencealert.com/wild-discovery-suggests-a-warp-drive-is-possible-within-known-physics); [The Debrief](https://thedebrief.org/warp-drive-breakthrough-could-enable-constant-velocity-subluminal-travel-physics-team-says/)
- **Barzegar, Buchert & Vigneron (Feb 2026)**, "General formalism, classification, and demystification of the current warp-drive spacetimes":
  - classify warp models and prove several new no-go theorems;
  - highlight "misconceptions, misunderstandings, and errors" used to support physicality claims;
  - conclude most such claims must be reassessed;
  - name obstacles beyond energy conditions: global hyperbolicity, asymptotic flatness, and the notion of mass and energy (ADM).
  - The earlier notes record that they find SSV's critiques "correct in large part" and criticize SSV's use of the Misner–Sharp mass — [arXiv:2602.16495](https://arxiv.org/abs/2602.16495)
- Continuing literature includes a 2025 UFRJ doctoral thesis treating fluid matter as the source of Alcubierre-type metrics — [arXiv:2508.20348](https://arxiv.org/html/2508.20348v1)
- White et al. (2021, EPJC 81, 677) numerically modelled a Casimir geometry whose energy-density pattern was "qualitatively quite similar" to Alcubierre's requirements; it was widely misreported as a "warp bubble" — [EPJC abstract](https://epjc.epj.org/articles/epjc/abs/2021/07/10052_2021_Article_9484/10052_2021_Article_9484.html); [NASA NTRS 20110015936](https://ntrs.nasa.gov/citations/20110015936) (earlier claims)

### Inferences
**A. Energy conditions: definitions and perfect-fluid forms** [S]. Here k^μ is any null vector and t^μ any timelike vector.

| Condition | Definition | Perfect fluid (ρ = energy density/c², p) | Used for | Violated by |
|---|---|---|---|---|
| NEC | T_μν k^μ k^ν ≥ 0 | ρc² + p ≥ 0 | Penrose singularity theorem; area theorem (classical); wormhole no-go | phantom fluids (w < −1); wormhole throats; Alcubierre walls; quantum states locally (Casimir, near horizons) |
| WEC | T_μν t^μ t^ν ≥ 0 | ρ ≥ 0 and ρc² + p ≥ 0 | "energy density non-negative for every observer" | Casimir vacuum; anything violating the NEC |
| SEC | (T_μν − ½T g_μν) t^μ t^ν ≥ 0 | ρc² + 3p ≥ 0 and ρc² + p ≥ 0 | Hawking–Penrose cosmological singularity theorems; "gravity attracts" | **Λ and inflation** (this is why the expansion accelerates); potential-dominated scalar fields |
| DEC | WEC + energy flux non-spacelike | ρc² ≥ \|p\| | positive-mass and energy arguments; causal propagation of energy | NEC violators; p > ρc² fluids |
| ANEC | ∫ T_μν k^μ k^ν dλ ≥ 0 along complete (achronal) null geodesics | — | topological censorship; no traversable wormholes in classical GR | believed universal in its achronal form (Kontou & Sanders); generic violations require exotic set-ups |

Teaching points:
- Λ satisfies the NEC (ρc² + p = 0), so dark energy is *not* "exotic matter" in the wormhole sense.
- The SEC is the one cosmology already violates.
- The NEC is the one wormholes and warp drives must violate.

Verified examples [V/C]:
- A Morris–Thorne throat gives ρ + p_r = (rb′ − b)/(8πr³) < 0.
- The Ellis wormhole needs −(π/4)r₀c²/G of negative mass per side: −0.56 Jupiter masses for r₀ = 1 m.
- Casimir plates 1 μm to 10 nm apart give −4.3×10⁻⁴ to −4.3×10⁴ J/m³. That is 10⁴⁶ to 10³⁸ times smaller in magnitude than the −4.8×10⁴² J/m³ a 1 m throat requires (step 33).

Quantum inequality, qualitative form [S]. For a massless field in flat spacetime, the time-averaged energy density seen by an observer over a sampling time t₀ is bounded below by ≈ −(const)·ħ/(c³t₀⁴). Deeper negativity must be shorter-lived. The exact Ford–Roman constant was not re-verified (Gaps).

**B. Morris–Thorne wormhole, dissected** (G = c = 1). ds² = −e^{2Φ(r)}dt² + dr²/(1 − b(r)/r) + r²dΩ².
- **Φ:** redshift function. It must be finite everywhere, so there is no horizon.
- **b:** shape function. It sets the embedding funnel z(r) of the t = const spatial slice.
- **Throat:** b(r₀) = r₀. Flare-out: b′(r₀) < 1.
- With Φ = 0, the stress-energy is [V]: ρ = b′/(8πr²), p_r = −b/(8πr³), p_t = (b − rb′)/(16πr³).
- At the throat, p_r = −1/(8πr₀²): a *tension* that exceeds the energy density there. In SI that is c⁴/(8πG r₀²) = 4.8×10⁴² Pa for r₀ = 1 m [C].
- Traversability adds engineering constraints (tidal accelerations, crossing time), which are not reproduced here.
- Status:
  - **[MATH, requires NEC violation; no candidate matter in the needed amount; no observational evidence]** for macroscopic wormholes;
  - **[SPEC]** for holographic or quantum traversable versions, which are not shortcuts;
  - **[MODEL]** for "wormhole on a chip" claims: a simulation of a toy model, and a disputed one.

**C. Alcubierre metric, dissected** (G = c = 1). ds² = −dt² + (dx − v_s f(r_s) dt)² + dy² + dz².
- **x_s(t):** the bubble centre's trajectory.
- **v_s = dx_s/dt:** the bubble's coordinate speed, which may exceed 1.
- **r_s = √((x − x_s)² + y² + z²).**
- **f:** a top-hat, f(r_s) = [tanh(σ(r_s + R)) − tanh(σ(r_s − R))]/[2 tanh(σR)], equal to 1 inside the bubble and 0 outside.
- **R:** the bubble radius. **σ:** the wall steepness; the wall thickness is ≈2/σ, defining it as 1/\|f′(R)\|.
- **3+1 reading:** lapse 1; flat spatial slices; shift β^x = −v_s f.
- **Interior observers are in free fall** with dτ = dt: no g-forces, no time dilation.
- **Eulerian energy density** (verified numerically for these notes): ρ_E = G^{tt}/(8π) = −(1/8π)(v_s²/4)(y² + z²)/r_s² (df/dr_s)². It is negative in a torus around the wall.
- **Expansion of Eulerian volume elements:** θ = v_s (x − x_s)/r_s · df/dr_s [V]. Space contracts in front and expands behind — but Natário shows this is not essential.
- **Energy scale** [C]: E/c² ≈ −β²c²R²σ/(36G) for σR ≫ 1.
  - R = 100 m, wall 2 m, β = 1: about −0.19 M☉.
  - Pfenning–Ford's quantum-inequality-limited walls (~10² Planck lengths): ~−10⁶² kg.
  - Van Den Broeck's pocket: a few M☉.
- **The physics obstacles, ranked for the app:**
  1. NEC violation for some observer (generic; SSV 2022).
  2. Quantum-inequality energy budgets (Pfenning–Ford).
  3. Horizons: a superluminal bubble's front cannot be reached or controlled from inside (Everett–Roman); this is the control problem.
  4. Semiclassical instability (Finazzi et al.).
  5. No mechanism to *start or accelerate* the bubble. "Physical" drives are inertial shells that need propulsion (Bobrick–Martire; Fuchs et al.).
  6. Global-structure and mass issues: ADM mass, asymptotic flatness, global hyperbolicity (Schuster et al. 2023; Barzegar et al. 2026).

**D. Paper-by-paper status summary for the app**

| Work | What it actually claims | Status (Oct 2026) | Badge |
|---|---|---|---|
| Alcubierre 1994 | An exact GR geometry with an FTL bubble, requiring negative energy density | Correct as mathematics | [MATH] |
| Pfenning & Ford 1997 | Quantum inequalities force Planck-thin walls and ~10⁶² kg of negative energy | Widely accepted order-of-magnitude argument; depends on applying flat-space QIs and on geometry | [EST-DER] (as a bound) |
| Van Den Broeck 1999 | A pocket geometry cuts the requirement to a few M☉ (negative) | Still exotic; fine-tuned | [MATH] |
| Natário 2002 | Expansion/contraction is not essential; zero-expansion warp drives exist | Accepted; NEC still violated (generic drives, SSV) | [MATH] |
| Everett & Roman 1997; Finazzi et al. 2009 | Causal disconnection of the front; quantum instability | Accepted | [EST-DER] |
| Lentz 2021 | Positive-energy *superluminal* solitons from an Einstein–Maxwell plasma | Rebutted: only Eulerian observers checked; NEC violated generically | [REFUTED as stated] |
| Fell & Heisenberg 2021 | Positive semi-definite Eulerian energy for a superluminal soliton | Same rebuttal (SSV 2022) | [REFUTED as stated] |
| Bobrick & Martire 2021 | Subluminal positive-energy spherically symmetric drives possible in principle; superluminal ones still need negative energy; all are inertial shells needing propulsion | Subluminal part plausible as mathematics; no FTL claimed | [MATH] (subluminal) |
| Santiago, Schuster & Visser 2022 | Generic warp drives violate the NEC (hence WEC, SEC, DEC) | Mainstream; endorsed "in large part" by the 2026 review | [EST-DER] |
| Schuster, Santiago & Visser 2023 | How mass is defined for warp bubbles (ADM) | Partially criticized (Misner–Sharp usage) | [EST-DER] / debated |
| Fuchs et al. 2024 | A constant-velocity *subluminal* warp shell satisfying all energy conditions | Plausible as a constant-velocity solution; no acceleration, no FTL; journal details not verified here | [MATH] (subluminal, inertial) |
| Barzegar, Buchert & Vigneron 2026 | Classification and new no-go theorems; errors in the pro-warp literature; viability highly challenging beyond energy conditions | Most recent comprehensive review | [EST-DER] (review) |
| White et al. 2021 | A Casimir-cavity energy-density *shape* resembling Alcubierre's | Not a warp bubble | [MODEL]; press misreport |

**E. Proposed labelling scheme for the whole app.** Three primary badges as the brief requires, each with sub-tags, plus a separate teaching-model badge.

1. **ESTABLISHED** (green)
   - *Observed* — measured, with uncertainty and date; e.g. Mercury, GW detections.
   - *Derived* — a theorem or exact consequence of GR; e.g. Birkhoff, singularity theorems, ISCO.
2. **MATHEMATICALLY ALLOWED** (amber) — "an exact solution exists; no evidence nature realizes it"
   - *Exotic matter required* — e.g. wormholes, warp drives;
   - *Unstable or non-generic* — e.g. Kerr inner region, naked singularities;
   - *Wrong cosmology* — e.g. Gödel.
3. **SPECULATIVE** (violet)
   - *Research programme* — e.g. string theory, LQG, islands in 4D;
   - *Hint* — <5σ, e.g. DESI w₀w_a, PTA background before 5σ;
   - *Refuted claim* — a red strike-through, e.g. positive-energy superluminal warp claims.
4. **TEACHING MODEL** (grey) — analogies, always with a "gets right / gets wrong" pair: rubber sheet, river model, moving walkway, folded-paper wormhole.

Authoring rules:
1. Never write "possible" for an amber item without "no known physical way" next to it.
2. Every numerical claim carries a source and a "checked on" date.
3. [OPEN] tensions show both camps' numbers.
4. Badges propagate: a lesson that mixes categories shows each badge inline, at the sentence where it applies.
5. Press-release language ("finally proved", "warp bubble created") is quoted only inside a "how this was reported vs what was shown" box.

### Gaps
- The arXiv abstracts could not be fetched directly. Lentz, Bobrick–Martire, Fell–Heisenberg, SSV, Fuchs and Natário are summarized from search-engine abstract summaries, cross-checked against the earlier notes.
- Fuchs et al.'s journal publication (believed CQG 2024) and the Warp Factory toolkit paper were not verified.
- The exact Ford–Roman quantum-inequality constant (often quoted as −3/(32π²t₀⁴) for a Lorentzian sampling function) and Pfenning–Ford's precise wall-thickness definition were not re-verified. The 2/σ wall thickness used here is my definition.
- Lentz's 2022 follow-up ("Hyper-fast positive energy warp drives", arXiv:2201.00652) and the 2024 paper "On restrictions of current warp drive spacetimes" (arXiv:2407.00720) appeared only as titles in search results. Their content is unverified.
- The Morris–Thorne paper's own numerical examples (throat tensions, traversal-time budgets) were not re-read; the tension values here are computed.
- Whether the Hawking-radiation NEC violation near horizons and the positive-mass theorem's DEC assumption should be cited in the app needs primary sources (not fetched).

---

## Q6. Numerical relativity introduction: 3+1/ADM, lapse and shift, constraints vs evolution, BSSN, moving punctures, the 2005 breakthroughs, and how waveforms reach LIGO–Virgo–KAGRA analyses

### Takeaway
Numerical relativity (NR) rewrites Einstein's equations as an initial-value problem:
- choose a 3D slice;
- solve the **constraint** equations for valid initial data;
- march the 3-metric and extrinsic curvature forward with the **evolution** equations;
- use a freely chosen **lapse** (how far each point advances in proper time) and **shift** (how the spatial coordinates slide).

Decades of instability ended in 2005:
- **Pretorius**: generalized-harmonic coordinates plus constraint damping and excision;
- the **moving-puncture** groups (**Campanelli et al.; Baker et al.**), using the BSSN-type formulation (see the Centrella et al. review).

NR waveforms now underpin LVK analysis. NR merger waveforms calibrate the analytic waveform families and train surrogate models used in matched filtering and Bayesian parameter estimation; GW150914 was compared directly with NR. The 2025 SXS catalog holds 3,756 binary configurations.

For the Atlas: teach 3+1 and the constraint/evolution split *conceptually and with exact toy cases*, and replay published catalog waveforms. Do not run a toy NR solver in the browser; its constraint violations "look like physics and are not."

### Cited Findings
- **ADM 3+1 formulation:** Arnowitt, Deser & Misner recast GR as the evolution of spatial slices in time — [reprint, arXiv:gr-qc/0405109](https://arxiv.org/abs/gr-qc/0405109)
- **Why NR was hard:**
  - the equations split into evolution and constraint equations, and numerical error makes the constraints drift;
  - coordinates (lapse and shift, the "gauge") are free and must be chosen so the grid neither hits the singularity nor stretches pathologically;
  - the original ADM form is only weakly hyperbolic, which motivated the BSSN reformulation — [Baumgarte & Shapiro 1998 (BSSN)](https://arxiv.org/abs/gr-qc/9810065); [Centrella, Baker, Kelly & van Meter 2010 (Rev. Mod. Phys. review)](https://arxiv.org/abs/1010.5260)
- **Breakthrough 1 (2005):** Pretorius, "Evolution of binary black-hole spacetimes", PRL 95, 121101. Generalized harmonic coordinates, constraint damping and excision — [arXiv:gr-qc/0507014](https://arxiv.org/abs/gr-qc/0507014)
- **Breakthrough 2 (2005; PRL 96, 2006), "moving punctures":**
  - Campanelli, Lousto, Marronetti & Zlochower — [arXiv:gr-qc/0511048](https://arxiv.org/abs/gr-qc/0511048)
  - Baker, Centrella, Choi, Koppitz & van Meter — [arXiv:gr-qc/0511103](https://arxiv.org/abs/gr-qc/0511103)
- **GW150914** "matches the waveform predicted by general relativity for the inspiral and merger of a pair of black holes and the ringdown of the resulting single black hole", and was compared with NR waveforms — [LVK 2016](https://arxiv.org/abs/1602.03837)
- **Surrogate models** (fast interpolants trained on NR runs), e.g. NRSur7dq4 for precessing binaries — [Varma et al. 2019](https://arxiv.org/abs/1905.09300)
- **SXS third catalog** (2025, CQG 42) — [arXiv:2505.13378](https://arxiv.org/abs/2505.13378):
  - 2,018 → **3,756** binary configurations;
  - precessing runs to mass ratio 8 and spins 0.8;
  - more than 250 eccentric simulations;
  - public via the `sxs` Python package.
- **Codes:**
  - SpECTRE's first full binary-black-hole inspiral–merger–ringdown (~18 orbits) — [Lovelace et al. 2024](https://arxiv.org/abs/2410.00265)
  - Einstein Toolkit — [einsteintoolkit.org](https://einsteintoolkit.org/)
  - GRChombo (adaptive mesh refinement) — [Clough et al. 2015](https://arxiv.org/abs/1503.03436)
  - SpEC (spectral; SXS's workhorse) — [black-holes.org](https://www.black-holes.org/)
- **Machine learning:** DINGO-BNS characterizes binary-neutron-star mergers in ~1 s instead of ~1 h, with ~30% better sky localization (Nature 639, 2025) — [Tübingen release](https://uni-tuebingen.de/en/research/core-research/cluster-of-excellence-machine-learning/news/newsfullview-news/article/neural-network-deciphers-gravitational-waves-from-merging-neutron-stars-in-a-second/)
- **Open-data teaching assets:** the GWOSC tutorials include a binary-black-hole matched-filtering tutorial — [GWOSC tutorials](https://gwosc.org/tutorials/). The GWOSC Data Guide reproduces GW150914 plots, including likelihood maximization with NR templates — [gwosc-tutorial/Data_Guide](https://github.com/gwosc-tutorial/Data_Guide)
- **Three signal phases:** inspiral (post-Newtonian), merger (needs NR) and ringdown (quasinormal modes); black-hole spectroscopy tests no-hair with two or more QNMs — [Dreyer et al. 2004](https://arxiv.org/abs/gr-qc/0309007); [Berti, Cardoso & Starinets 2009](https://arxiv.org/abs/0905.2975)
- **GW250114** needed at least two QNMs, consistent with Kerr; some tests are 2–3× more stringent than GWTC-4.0 combined — [LVK, arXiv:2509.08099](https://arxiv.org/abs/2509.08099)
- **Future detectors** (higher SNR) will make waveform-model error a limiting systematic. That is why catalog growth and surrogate accuracy are priorities (the earlier notes' inference from the catalog and surrogate literature) — [SXS 2025](https://arxiv.org/abs/2505.13378)

### Inferences
**1. The 3+1 equations, dissected** [S] (G = c = 1). The canonical forms are as in Baumgarte & Shapiro, Alcubierre and Gourgoulhon; these texts were not re-fetched this session.

**ds² = −α² dt² + γ_ij (dx^i + β^i dt)(dx^j + β^j dt)**
- **α (lapse):** the proper time between neighbouring slices per unit coordinate time, as measured by "Eulerian" observers moving normal to the slices. A small α near a black hole "freezes" evolution there; this is singularity avoidance.
- **β^i (shift):** how spatial coordinates are relabelled from slice to slice. In moving-puncture gauges this is what lets the punctures move across the grid.
- **γ_ij:** the 3-metric of the slice.
- **K_ij:** extrinsic curvature, i.e. how the slice bends in spacetime. It plays the role of the "time derivative of γ": ∂_tγ_ij = −2αK_ij + D_iβ_j + D_jβ_i.

**Constraints** (no time derivatives; they must hold on every slice):
- Hamiltonian: ⁽³⁾R + K² − K_ijK^ij = 16πρ
- Momentum: D_j(K^ij − γ^ij K) = 8πS^i

**Evolution:** 6 equations for γ_ij and 6 for K_ij. The Bianchi identity guarantees the constraints stay satisfied *if they are solved exactly*; numerically they drift, which is why constraint damping matters.

**BSSN** evolves conformally rescaled variables — a conformal factor, the conformal metric, the trace of K, the traceless conformal extrinsic curvature and auxiliary connection functions — to obtain a strongly hyperbolic, stable system.

**Moving-puncture gauge:** "1+log" slicing for α and a "Γ-driver" shift. The puncture singularity is never resolved and simply moves through the grid.

**Generalized-harmonic** (Pretorius) instead adds gauge source functions and constraint-damping terms, and *excises* the region inside the horizon.

**2. Exact toy cases the app can compute** (all verified for these notes):
- **Schwarzschild in Painlevé–Gullstrand slicing:** α = 1, β^r = √(2M/r), flat γ_ij. Verified to be vacuum [V]. The shift equals the Newtonian escape speed, so the river model is just this 3+1 decomposition — honest, and badged [MODEL] only for the "flowing space" language.
- **Time-symmetric, conformally flat vacuum data:** with K_ij = 0 and γ_ij = ψ⁴δ_ij, the Hamiltonian constraint reduces to ∇²ψ = 0 [S]. The Brill–Lindquist two-hole ψ = 1 + m₁/(2r₁) + m₂/(2r₂) satisfies it away from the punctures [V]. This lets the learner build valid initial data and see that "a binary at an instant" is a constraint-solving problem.
- **Ringdown QNM** of a Schwarzschild remnant (Leaver continued fraction, computed here): Mω = 0.37367 − 0.08896i. For 62 M☉: f = 195 Hz, τ = 3.4 ms [C]. Spin raises f (see the Gaps on the Kerr fit).
- **Inspiral leading-order chirp** (step 27): 0.16 s from 35 Hz for GW150914's chirp mass [C].

**3. How waveforms are used in LVK analysis** (a didactic summary of the cited points):
1. **Search:** matched filtering against template banks of inspiral–merger–ringdown waveforms (the GWOSC BBH tutorial).
2. **Parameter estimation:** Bayesian sampling with waveform models. These are analytic families calibrated to NR, or NR surrogates such as NRSur7dq4, trained directly on SXS runs.
3. **Tests of GR:** inspiral–merger–ringdown consistency, ringdown spectroscopy and the area theorem (GW250114).
4. **ML acceleration:** e.g. DINGO-BNS.

The merger portion of every template relies on NR, directly or through calibration.

**4. Visualization design:**
- foliation slices stacked in 3D, with α shown as slice spacing and β as arrows;
- puncture trajectories from a published SXS run (replayed);
- a waveform overlay on whitened GW150914 data, with the residual;
- an animated "constraint-violation" panel from a deliberately bad gauge choice in a *1D toy*, labelled as numerical error, not physics. This is the in-repo `geodesic/` README's warning made into a lesson.

### Gaps
- The names and versions of the LVK production waveform families used in GWTC-4.0/5.0 (e.g. SEOBNRv5, IMRPhenomXPHM) were not verified this session; the description above is generic.
- The ADM/BSSN equations are given in standard form [S]. Gourgoulhon's "3+1 formalism" notes and Alcubierre's or Baumgarte–Shapiro's textbooks were not re-fetched.
- How much O4 parameter estimation ran on ML pipelines in production is not documented in the sources found.

---

## Q7. Open questions in gravitation as of October 2026, each with its evidence status

### Takeaway
GR as tested is [EST-OBS] from 10⁻¹⁵-level free-fall tests up to horizon-scale shadows and ringdowns. No confirmed deviation exists. The open questions fall into three groups:
- **Theory gaps:** quantum gravity; singularity resolution; strong cosmic censorship; the information paradox's microscopic mechanism; the cosmological-constant problem.
- **Data tensions below discovery level:**
  - H₀: 5–7σ depending on the combination, disputed by the CCHP;
  - evolving dark energy: 2–4σ, trending weaker after 2025–26 recalibrations and the July 2026 Lyα result;
  - PTA background: ~3–4σ.
- **Precision frontiers:**
  - no-hair and ringdown tests at the tens-of-percent level (GW250114);
  - EHT shadows at ~10%;
  - GW population puzzles (GW231123 in the pair-instability gap; hierarchical mergers).

Items that changed in 2025–26 and must carry dates:
- GWTC-4.0 (Aug 2025);
- GW250114 (Sep 2025);
- GWTC-5.0 (May 2026);
- the DES full survey (May 2026);
- the Cai & Wang review (Jun 2026);
- DESI Lyα (Jul 2026);
- EHT M87* multi-year (Sep 2025) and jet base (Jan 2026);
- the warp-drive review (Feb 2026);
- LVK plans, with IR1 in mid-January 2027 (Oct 2026).

### Cited Findings

| Question | Current evidence status (Oct 2026) | Sources | Badge |
|---|---|---|---|
| **Quantum gravity** | No approach has experimental confirmation. GR is a good effective field theory below the Planck scale (1.6×10⁻³⁵ m, 1.2×10¹⁹ GeV) but non-renormalizable at two loops. A 2025 survey (1,675 respondents, not a random sample): string/M-theory 18.9%, LQG 12.7%, "gravity is not quantum" 17.7%, no opinion 28.7%. Gravity-mediated entanglement (BMV) tests are proposed, not yet done; the smallest measured source mass is ~90 mg | [Goroff & Sagnotti 1986](https://doi.org/10.1016/0550-3213(86)90193-8); [Donoghue 1995](https://arxiv.org/abs/gr-qc/9512024); [survey, arXiv:2605.11058](https://arxiv.org/html/2605.11058v1); [Bose et al. 2017](https://arxiv.org/abs/1707.06050); [Westphal et al. 2021](https://arxiv.org/abs/2009.09546) | [SPEC] |
| **Singularities** | Formation is a theorem: Penrose 1965 (Nobel 2020) and Hawking–Penrose 1970. The theorems prove geodesic incompleteness, not infinite density. Resolution by quantum gravity is expected but unknown | [Penrose 1965](https://doi.org/10.1103/PhysRevLett.14.57); [Nobel 2020](https://www.nobelprize.org/prizes/physics/2020/summary/); [Hawking & Penrose 1970](https://doi.org/10.1098/rspa.1970.0021) | [EST-DER] / resolution [SPEC] |
| **Cosmic censorship** | Weak CC is an open conjecture. Fine-tuned 4D counterexamples exist (Choptuik critical collapse; Christodoulou), as do higher-dimensional ones (Lehner–Pretorius black strings). The C⁰ form of strong CC is false for Kerr (Dafermos–Luk 2017); weaker forms are open. The third law of BH thermodynamics was disproved (Kehle–Unger, JEMS 2025). Nonlinear stability of slowly rotating Kerr was proved (Klainerman–Szeftel et al., final part 2024) | [Wald review](https://arxiv.org/abs/gr-qc/9710068); [Choptuik 1993](https://doi.org/10.1103/PhysRevLett.70.9); [Lehner & Pretorius 2010](https://arxiv.org/abs/1006.5960); [Dafermos & Luk](https://arxiv.org/abs/1710.01722); [Kehle & Unger](https://arxiv.org/abs/2211.15742); [Kerr stability](https://arxiv.org/abs/2205.14808) | [OPEN] (math) |
| **Information paradox** | Hawking (1975–76) argued information is lost. Page (1993): a unitary process gives the Page curve. Island and replica-wormhole calculations (2019–20) reproduce the Page curve in toy models (2D JT gravity, AdS plus bath); realistic 4D and the microscopic mechanism remain unsettled. 2025 survey: 54.2% "information preserved", 18.8% "lost" | [Hawking 1976](https://doi.org/10.1103/PhysRevD.14.2460); [Page 1993](https://arxiv.org/abs/hep-th/9306083); [Penington 2019](https://arxiv.org/abs/1905.08255); [Almheiri et al. 2019](https://arxiv.org/abs/1911.12333); [RMP review](https://arxiv.org/abs/2006.06872); [Raju critique](https://arxiv.org/abs/2012.05770) | [EST-DER as a calculation in toy models]; physical resolution [SPEC] |
| **Hawking radiation** | Unobserved for astrophysical holes (T_H ≈ 60 nK × M☉/M). Analog BEC horizons show Hawking-like spontaneous, thermal radiation (Steinhauer 2016–2021); other physicists call the results "not clear-cut" | [Steinhauer 2016](https://arxiv.org/abs/1510.00621); [Muñoz de Nova et al. 2019](https://arxiv.org/abs/1809.00913); [Physics World](https://physicsworld.com/?p=17162) | [EST-DER] (semiclassical) / unobserved |
| **Cosmological-constant problem** | Acceleration discovered in 1998 (Nobel 2011). Naive QFT vacuum energy exceeds the observed value by ~10¹²⁰ with a Planck cutoff (~10⁵⁵–10⁶⁰ with other cutoffs and methods). No accepted explanation; plus the "coincidence problem" | [Riess et al. 1998](https://arxiv.org/abs/astro-ph/9805201); [Perlmutter et al. 1999](https://arxiv.org/abs/astro-ph/9812133); [Martin 2012](https://arxiv.org/abs/1205.3365); [Carroll 2001](https://arxiv.org/abs/astro-ph/0004075) | [OPEN] |
| **Dark matter** | Gravitational evidence is multiple and independent: CMB peaks need Ω_ch² = 0.120 ± 0.001; the Bullet Cluster lensing offset. Particle nature unknown; not directly detected. MOND fits rotation curves but struggles with clusters and the CMB; the wide-binary test is contested (Chae vs Banik et al., 19σ for Newton) | [Planck 2018 VI](https://arxiv.org/abs/1807.06209); [Clowe et al. 2006](https://arxiv.org/abs/astro-ph/0608407); [Banik et al. 2024](https://research-repository.st-andrews.ac.uk/bitstream/10023/28927/1/Banik-2023-Strong-constraints-on-the-MNRAS-527-3-4573-CCBY.pdf); [Chae et al. 2025](https://arxiv.org/pdf/2502.09373v3) | existence [EST-OBS]; nature [OPEN]; MOND [SPEC] |
| **Dark energy: Λ or evolving?** | DESI DR2: 2.8–4.2σ preference for w₀w_a. After recalibration (DES-Dovekie) 3.2σ; DES full survey (May 2026) 2.2–3.0σ; DESI Lyα (July 2026) moves toward ΛCDM. No 5σ result | [DESI DR2](https://arxiv.org/abs/2503.14738); [DES-Dovekie](https://arxiv.org/abs/2511.07517v2); [DES 2026](https://arxiv.org/abs/2605.27221); [DESI Lyα](https://www.desi.lbl.gov/2026/07/30/new-desi-dr2-lyman-alpha-results-shed-light-on-dark-energy/) | [OPEN] (hint <5σ) |
| **Hubble tension** | Early-universe 67–68 vs local ladder 73–73.5 km/s/Mpc: ~5σ (some combinations 6–7σ). The CCHP's TRGB value of 70.39 disputes the significance. JWST rejected Cepheid crowding at 7–8σ. A June 2026 review calls it "likely a real crisis" | [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1); [Freedman et al. 2025](https://iopscience.iop.org/article/10.3847/1538-4357/adce78) | [OPEN] |
| **No-hair / ringdown spectroscopy** | GW250114: at least 2 QNMs (the fundamental (2,2,0) plus its overtone), consistent with Kerr; frequencies within ±30% (some tests 2–3× tighter than the GWTC-4.0 combination). The area theorem confirmed at high credibility (Cornell: ~99.999%). The earlier GW150914 overtone claim was disputed | [arXiv:2509.08054](https://arxiv.org/abs/2509.08054); [arXiv:2509.08099](https://arxiv.org/abs/2509.08099); [Cornell](https://as.cornell.edu/news/10th-anniversary-ligo-verifies-hawkings-theorem); [Isi 2019](https://arxiv.org/abs/1905.00869) vs [Cotesta 2022](https://arxiv.org/abs/2201.00822) | [EST-OBS] at current precision |
| **EHT** | M87* (2019) and Sgr A* (2022) shadows consistent with Kerr at ~10–17%. M87* ring persistent at 43.9 ± 0.6 μas across 2017/18/21, with polarization helicity reversed in 2021. Jet base detected (Jan 2026); July 2026 EAS session on new results | [EHT 2019](https://arxiv.org/abs/1906.11238); [EHT 2022](https://iopscience.iop.org/article/10.3847/2041-8213/ac6674); [EHT 2025](https://arxiv.org/abs/2509.24593); [NRAO 2026](https://www.newswise.com/articles/new-event-horizon-telescope-results-trace-m87-jet-back-to-its-black-hole) | [EST-OBS] (~10% level) |
| **GW catalog highlights** | 390 candidates through Jan 2025 (GWTC-5.0, May 2026); O4 ended 18 Nov 2025. GW231123: most massive (190–265 M☉; primary in the pair-instability gap; formation [SPEC]). GW241011/GW241110: second-generation black holes; ultralight bosons excluded in a mass window. GWTC-4.0 TGR: >90% of events consistent; no echoes | [GWTC-5.0](https://arxiv.org/abs/2605.27225); [GW231123](https://arxiv.org/abs/2507.08219); [GW241011](https://arxiv.org/abs/2510.26931); [TGR I](https://arxiv.org/pdf/2603.19019) | [EST-OBS]; interpretations [SPEC] |
| **Modified gravity** | GW170817 pinned c_GW = c to ~10⁻¹⁵, eliminating much of Horndeski/beyond-Horndeski and TeVeS-type DM emulators. Caveat: LIGO frequencies may lie above some theories' cutoffs | [arXiv:1710.05834](https://arxiv.org/abs/1710.05834); [Ezquiaga & Zumalacárregui](https://arxiv.org/abs/1710.05901); [Creminelli & Vernizzi](https://arxiv.org/abs/1710.05877) | alternatives [SPEC]; the specific exclusions are [EST-OBS] |
| **nHz GW background** | NANOGrav 15-yr: Hellings–Downs correlation, ~3–4σ; likely supermassive-BH binaries; cosmological sources not excluded | [NANOGrav 2023](https://arxiv.org/abs/2306.16213); [new-physics fits](https://arxiv.org/abs/2306.16219) | [OPEN] (strong evidence, <5σ) |
| **Future facilities** | LISA adopted 25 Jan 2024, launch ~2035 (US funding contested). Einstein Telescope site decision 2027. Cosmic Explorer in the 2030s. LVK IR1 planned mid-Jan 2027 | [ESA](https://www.esa.int/Science_Exploration/Space_Science/Capturing_the_ripples_of_spacetime_LISA_gets_go-ahead); [European Spaceflight](https://europeanspaceflight.com/?p=6457); [Cosmic Explorer](https://cosmicexplorer.org/); [ICRR](https://gwcenter.icrr.u-tokyo.ac.jp/en/archives/2069) | planned (no badge; "targeted") |

### Inferences
- **Presentation pattern for step 37.** Each question gets five parts:
  1. what is established;
  2. what is the open problem;
  3. what would change our minds (the decisive observation or theorem);
  4. the latest dated evidence;
  5. a "how it gets misreported" box.

  For example, for the Hubble tension the decisive evidence would be independent distance-ladder anchors converging, or CMB experiments (ACT, SPT) finding an early-universe modification. The misreport is "Hubble tension proves GR wrong", but the tension is a ΛCDM-parameter problem and does not single out GR.
- **The computed exercises tie open questions to calculation:**
  - the Planck-vs-Λ density ratio (10^122.9);
  - Hawking temperature and evaporation time;
  - the tension-σ arithmetic;
  - BH entropy, ~10⁷⁷ k_B for 1 M☉.
- **Volatility.** The volatile items — DESI significance, H₀ values, catalog counts, EHT releases, LISA and LIGO funding — should live in a dated data file the app refreshes, not in lesson prose. This mirrors `worldline/`'s rule that every narrated number is a sourced fact checked by a test.

### Gaps
- Not verified this session:
  - a 5σ PTA update;
  - EHT results announced at or after the July 2026 EAS session;
  - Sgr A* multi-year EHT results;
  - the final FY2027 US budget outcomes for LIGO and LISA.
- No authoritative 2026 review was located for "what islands did not settle". The list above combines individual critiques.

---

## Q8. Honest visualization: why the rubber sheet misleads, what to use instead, and existing interactive GR tools worth learning from

### Takeaway
The rubber sheet is a picture of the right answer for orbits, drawn with the wrong mechanism. It uses gravity to explain gravity, omits time (which carries Newtonian gravity), relies on extrinsic curvature and an extra dimension, adds a preferred rest frame, gets orbit dynamics wrong, and measurably plants misconceptions.

The honest toolkit is:
- **tidal-field and ring-of-particles views** (curvature as it is actually measured);
- **proper-time comparisons and maximal-aging editors** (time warping);
- **spatial embedding diagrams labelled as t = const spatial slices**;
- **light-cone fields in horizon-penetrating coordinates** (Eddington–Finkelstein or Painlevé–Gullstrand);
- **Kruskal and Penrose diagrams** for global structure;
- **GPU ray-traced lensing and shadows**, with the ring correctly identified as lensed emission around the shadow, not the horizon.

This repository already contains three working, tested precedents (`geodesic/`, `blackhole/`, `worldline/`) that implement much of this honestly. The Atlas should reuse their DOM-free physics modules and their "computed vs drawn" labelling discipline.

### Cited Findings
**The rubber sheet's flaws** (Pössel's review of the literature):
1. "The confusing double role played by gravity": the sheet is distorted by Earth's gravity — [Pössel 2018 §4.2](https://arxiv.org/abs/1812.11589); critiques in [Price 2016](https://doi.org/10.1119/1.4955154) and [Janis 2018](https://doi.org/10.1119/1.5018679)
2. It emphasizes space over time, although in the Newtonian limit gravity is "purely an effect of time distortion, encoded in g_tt" — [Pössel 2018](https://arxiv.org/abs/1812.11589)
3. Any material medium introduces "a privileged standard of rest" — [Pössel 2018](https://arxiv.org/abs/1812.11589)
4. Dimensional mismatch: the masses are 3D objects sitting on a 2D "space" — [Pössel 2018](https://arxiv.org/abs/1812.11589)
5. "In general relativity, what counts is the intrinsic curvature… [in the sheet model] the embedding, and thus extrinsic curvature, is an integral part" — [Pössel 2018](https://arxiv.org/abs/1812.11589)
6. Wrong orbit shapes and speeds even without friction — [Middleton & Langston 2014](https://doi.org/10.1119/1.4848635); [Middleton & Weller 2016](https://doi.org/10.1119/1.4940246)
7. Easily confused with potential-well plots and with half of the Flamm paraboloid — [Pössel 2018](https://arxiv.org/abs/1812.11589)
8. Misconceptions reproduced in upper-secondary students taught with the sheet — [Kersting & Steier 2018](https://doi.org/10.1007/s11191-018-9997-4)

**What the sheet gets right:** distortion falls off with distance; gravity doesn't "stop" in space; gravity is mediated locally rather than by action at a distance; the two-way slogan — [Pössel 2018 §4.1](https://arxiv.org/abs/1812.11589)

**Better alternatives used by educators** — [Pössel 2018 §4.3, §5](https://arxiv.org/abs/1812.11589):
- geodesics on Earth;
- converging travellers;
- circles and triangles on balloons (intrinsic curvature measured from inside);
- a parallel-transporting "south-seeking chariot";
- **sector models** — [Zahn & Kraus 2014](https://doi.org/10.1088/0143-0807/35/5/055020);
- the maximal-aging "time-warp" narrative — [Stannard et al. 2017](https://doi.org/10.1088/0143-0807/38/1/015603); [Kaur et al. 2017](https://doi.org/10.1088/1361-6552/aa83e4);
- the **river model** (Pössel notes it reproduces orbits faithfully, unlike the sheet).

**Curvature as tides; Weyl vs Ricci:** the Ricci tensor governs a falling ball's volume and the Weyl tensor its shape (tides, gravitational waves) — [Baez & Bunn](https://arxiv.org/abs/gr-qc/0103044). Curvature means the Riemann tensor is non-zero, and the remaining physical distortion is tidal — [Pössel 2018 fn. 7](https://arxiv.org/abs/1812.11589)

**Horizons, coordinates and the EHT image**
- r = 2GM is a coordinate singularity, smooth in Kruskal–Szekeres coordinates — [Carroll ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- The Flamm paraboloid's spatial geometry "does contribute a little bit… but… the main contribution… amounts to time distortion" — [Pössel 2018](https://arxiv.org/abs/1812.11589)
- EHT: the ring brightness asymmetry comes from "relativistic beaming of the emission from a plasma rotating close to the speed of light"; the ring is lensed emission around the shadow — [EHT M87 Paper I](https://arxiv.org/abs/1906.11238)

**Professional and student ray tracing**
- *Interstellar*'s images used the DNGR code, ray-tracing light bundles in Kerr — [James, von Tunzelmann, Franklin & Thorne 2015](https://arxiv.org/abs/1502.03808)
- Student-level Python null-geodesic ray tracers (Schwarzschild and Kerr, RK4(5)) — [Berkeley ULAB poster](https://ulab.berkeley.edu/static/doc/posters/s234.pdf)
- An open-source Schwarzschild ray tracer aimed at undergraduates — [APS April 2024](https://archive.aps.org/apr/2024/e00/65)
- Advanced references — ["Seeing relativity I"](https://arxiv.org/pdf/1511.06025); [GPU geodesic ray tracing in Python](https://arxiv.org/pdf/2310.15183)

**Other existing teaching resources**
- Einstein Online (Max Planck Institute for Gravitational Physics; "Elementary Einstein" track) — [Einstein Online](https://www.einstein-online.info/en/?p=4504)
- Epstein's picture-based *Relativity Visualized* — [AbeBooks listing](https://www.abebooks.com/9780935218053/Relativity-Visualized-Epstein-Lewis-Carroll-093521805X/plp)
- Free *Exploring Black Holes* — [eftaylor.com](https://www.eftaylor.com/exploringblackholes)
- GWOSC tutorials and Data Guide — [GWOSC](https://gwosc.org/tutorials/); [Data Guide](https://github.com/gwosc-tutorial/Data_Guide)
- Gravity Spy citizen science — [Zooniverse](https://www.zooniverse.org/projects/zooniverse/gravity-spy)

**In-repo precedents**
- **`geodesic/`** — [README](/home/user/Projects/geodesic/README.md):
  - default "tidal field" mode E_ij = ∂ᵢ∂ⱼΦ with tendex lines;
  - a 3D grid of freely falling nodes (stretch/squeeze 2:1; volume conserved in vacuum, shrinking at −4πG⟨ρ⟩ inside matter);
  - a Gullstrand–Painlevé infall frame;
  - a Flamm "Embedding" mode framed as the famous picture plus what it fails to explain;
  - layers keep Newtonian N-body, field and exact-GR overlays separate; exact GR "never feeds back";
  - 95 headless checks, including Mercury 42.98″/cy, Hulse–Taylor −2.40×10⁻¹², GW150914 chirp mass 28 M☉, GP-B frame dragging 39 mas/yr, Earth 196 W;
  - an explicit list of approximations ("orbits are Newtonian… frame dragging is the far-field Lense–Thirring form, not Kerr");
  - and "the reference grid never bends. It is a ruler, not spacetime."
- **`blackhole/`** — [README](/home/user/Projects/blackhole/README.md):
  - every pixel a null geodesic in exact Kerr (Cartesian Kerr–Schild, Hamiltonian RK4, WebGL2);
  - disk on circular Kerr geodesics, Ω = (r^{3/2} + a)⁻¹, with the g³ beaming factor;
  - an in-app "Model & assumptions" panel;
  - known limitations listed (coordinate-direction camera aiming; residual bending beyond 140 r_g ignored).
- **`worldline/`** — [README](/home/user/Projects/worldline/README.md):
  - a "computed vs drawn" ledger;
  - exaggerations stated (Mercury about 300,000×; GW and LIGO about 10²⁰×);
  - merger and ring-down marked as sketched because they need NR;
  - EHT images marked as illustrations;
  - a test verifies every narrated number is sourced.

### Inferences
**1. Design specifications for the honest visual set.** Each item lists what is exact, what is schematic, and its mandatory label.

| Visual | Steps | Exact content | Mandatory label |
|---|---|---|---|
| **Tidal field / ring of particles** | 6, 14, 15, 27 | Geodesic deviation with the verified static-frame components (+2GM/r³ radial, −GM/r³ transverse); GW h₊/h× rings; the volume-vs-shape split (Ricci vs Weyl) | "This is curvature: it cannot be removed by free fall. Exaggerated ×N." |
| **Proper-time / maximal-aging editor** | 6, 9, 12 | Δτ along user-drawn worldlines in the weak-field or Schwarzschild metric; the parabola maximizes τ (3.78×10⁻¹⁶ s for v₀ = 10 m/s) | "Free fall = maximal aging. Clock-rate differences exaggerated ×N." |
| **Embedding diagram (Flamm)** | 8, 20, 35 | z(r) = 2√(r_s(r − r_s)), the isometric embedding of the equatorial t = const slice; proper radial distances (2.30 r_s from r_s to 2r_s) | "Spatial slice at one instant. The vertical direction is fictitious. Time — which causes most of the attraction — is not shown." |
| **Clock-rate map** | 9, 20, 23 | dτ/dt = √(1 − r_s/r), colour-mapped beside the embedding | "This, not the funnel, makes apples fall." |
| **Light-cone field** (IEF / PG) | 22 | In (t* = v − r, r) coordinates: ingoing rays at 45°; outgoing slope (1 − 2M/r)/(1 + 2M/r): zero at the horizon, negative inside [derived from the verified dr/dv = (1 − 2M/r)/2] | "Cones tip because of the coordinates chosen; their *meaning* (no escape inside r_s) is coordinate-independent." |
| **Kruskal and Penrose diagrams** | 22, 26, 34 | Causal structure; eternal vs collapse versions | White-hole and second-exterior regions badged [MATH] ("not formed by collapse") |
| **Ray-traced lensing and shadow** | 24, 26 | Null geodesics (Schwarzschild: u″ + u = 3Mu²; Kerr: Hamiltonian); ring = lensed emission; shadow diameter 2√27 GM/c² ≈ 2.6× the horizon | "The dark region is the shadow, not the horizon. Disk physics is simplified." |
| **Effective-potential plot** | 21, 24, 25 | V(r) with ISCO 6M, photon sphere 3M, marginally bound 4M | "A 1D picture of a 4D motion; not a 'hill' in space." |
| **Comoving grid and a(t)** | 30, 31 | Exact FLRW kinematics; Friedmann integrator | "Galaxies don't move through the grid; the grid's rulers stretch." |
| **Warp and wormhole plots** | 35, 36 | York-time θ; Eulerian ρ_E; MT throat embedding | "[MATH] — requires negative energy for some observers; no known source; not technology." |

**2. Rules that keep visuals honest** (inferred from the cited critiques and the in-repo practice):
1. Every exaggerated effect shows its true size and the exaggeration factor on screen.
2. Every diagram names its slice and its coordinates. "Spatial slice at t = const, Schwarzschild coordinates" beats an unlabelled funnel.
3. Never let a visual imply a mechanism the theory doesn't have. No balls rolling on sheets; no "space flowing" without the [MODEL] badge and the honest "this is a choice of slicing" note.
4. Separate *computed* layers from *illustrative* ones, and never let an illustrative layer feed numbers back (the `geodesic/` layer rule).
5. Pair every analogy with "what it gets right / what it gets wrong", using Pössel's list for the sheet.
6. For shadows and EHT images, show the computed shadow, the photon ring and the observed ring side by side, with the ~10% consistency stated.

**3. Where the rubber sheet may appear.** Once, in step 6 or 8, as a [MODEL] artefact in a "spot the flaws" exercise:
- Why does the ball roll? Gravity, which is circular reasoning.
- Where is time? Missing.
- What happens to light? It needs the full metric.

Then it is replaced by the tidal and clock-rate pair. The sequence — show briefly → name the flaws → intrinsic geometry → spacetime and maximal aging — is the one the earlier GR notes in this repository derived from Pössel's critique. It is a recommendation, not a tested protocol.

### Gaps
- Not verified this session (web budget exhausted), but worth checking as further precedents:
  - Andrew Hamilton's black-hole flight simulator (JILA);
  - Ute Kraus's "Space Time Travel" site (the sector-model and relativistic-visualization group);
  - MIT Game Lab's *A Slower Speed of Light* and OpenRelativity;
  - ANU's Real Time Relativity;
  - TestTube Games' *Velocity Raptor*;
  - the Norwegian ReleQuant GR learning environment (Kersting, Henriksen et al.);
  - Bandyopadhyay & Kumar's study of student difficulties with GR.

  Do not cite these until verified.
- Kersting & Steier's specific misconception categories and statistics were not read (they come via Pössel's review).
- No controlled study was found comparing learning gains from tidal-field or embedding visuals against the rubber sheet at university level. The recommendation rests on documented flaws and expert practice, not on an RCT.
