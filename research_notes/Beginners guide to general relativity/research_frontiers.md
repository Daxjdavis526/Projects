# Ch. 10 — The Frontiers of General Relativity Research (research notes, state of field as of Oct 2026)

Reading key for the report writer:
- **[V26]** = a 2023–2026 claim that was checked in this research pass against a primary or near-primary source (journal page, arXiv abstract, collaboration/agency page, or dated news report quoting officials).
- **[LM]** = a landmark paper cited by its standard arXiv ID / DOI. These are long-established references, included so the chapter can cite originals. They were not re-fetched in this pass.
- **[UNV]** = something seen only in a weak or secondary source, or not confirmed. Do not state these as fact.
- Status labels used throughout: **ESTABLISHED** (an observed or proven result) / **SERIOUS-SPECULATIVE** (a mainstream research program with no experimental confirmation yet) / **NO-FEASIBILITY** (mathematically writable, but no demonstrated physical route; science-fiction territory).
- Analogies are suggestions by the researcher, not sourced facts, so they sit under "Inferences".

---

## 1. Quantum gravity — why GR and quantum mechanics conflict, the main approaches, and tabletop tests

### Takeaway
GR works very well as a low-energy theory. Quantised naively, though, it is non-renormalizable: its predictions break down near the Planck scale (~1.6×10⁻³⁵ m, ~1.2×10¹⁹ GeV), and that is where singularities, the Big Bang and black-hole interiors need both theories at once. No approach (string theory, LQG, asymptotic safety, CDT, causal sets, holography) has experimental confirmation. Status: **SERIOUS-SPECULATIVE** for every approach. Holography/AdS–CFT is the most mathematically developed tool, but it describes a universe with negative cosmological constant, not ours. The newest and most concrete work is *experimental*: tabletop efforts to show whether gravity can entangle masses. None has succeeded yet.

### Cited Findings
**The scales**
- Planck length = 1.616255×10⁻³⁵ m (CODATA) — [NIST: Planck length](https://physics.nist.gov/cgi-bin/cuu/Value?plkl)
- Planck mass energy equivalent ≈ 1.22×10¹⁹ GeV (CODATA) — [NIST: Planck mass energy equivalent in GeV](https://physics.nist.gov/cgi-bin/cuu/Value?plkmc2gev)

**Why they conflict (non-renormalizability)**
- Perturbatively quantised pure GR has an ultraviolet divergence at two loops that cannot be absorbed by renormalising a finite number of parameters (Goroff & Sagnotti, 1986) [LM] — [Nucl. Phys. B 266, 709](https://doi.org/10.1016/0550-3213(86)90193-8)
- GR is nonetheless a perfectly good *effective field theory* at energies far below the Planck scale. Quantum corrections can be computed there, and they are tiny. The problem is the high-energy completion, not quantum gravity per se [LM] — [Donoghue 1995, "Introduction to the effective field theory description of gravity", arXiv:gr-qc/9512024](https://arxiv.org/abs/gr-qc/9512024)
- "Quantum gravity lives at the Planck scale, difficult to constrain phenomenologically." Turning high-energy details into low-energy predictions is the central challenge (2025 talk) — [Danish QFT meeting slides, Aug 2025](https://indico.nbi.ku.dk/event/2167/contributions/16336/attachments/5104/8207/2025-08%20-%20Danish%20QFT.pdf)

**Main approaches (landmarks)**
- *String theory*: the five superstring theories were unified as limits of "M-theory" (Witten 1995) [LM] — [arXiv:hep-th/9503124](https://arxiv.org/abs/hep-th/9503124). Its signature success: a microscopic count of black-hole entropy reproducing Bekenstein–Hawking S = A/4 for certain supersymmetric black holes (Strominger & Vafa 1996) [LM] — [arXiv:hep-th/9601029](https://arxiv.org/abs/hep-th/9601029)
- *Holography / AdS–CFT*: Maldacena (1997) conjectured that string theory in anti-de Sitter space is exactly equivalent to a non-gravitational quantum field theory on its boundary [LM] — [arXiv:hep-th/9711200](https://arxiv.org/abs/hep-th/9711200)
- *"It from qubit" / spacetime from entanglement*: the Ryu–Takayanagi formula relates entanglement entropy in the boundary theory to minimal-surface areas in the bulk geometry [LM] — [arXiv:hep-th/0603001](https://arxiv.org/abs/hep-th/0603001); Van Raamsdonk argued spacetime connectivity is built from entanglement [LM] — [arXiv:1005.3035](https://arxiv.org/abs/1005.3035); ER=EPR (Maldacena & Susskind 2013) conjectures that entangled particles are connected by (non-traversable) Einstein–Rosen bridges [LM] — [arXiv:1306.0533](https://arxiv.org/abs/1306.0533)
- *Loop quantum gravity (LQG)*: background-independent quantisation that predicts discrete spectra for area and volume (Rovelli & Smolin 1995) [LM] — [arXiv:gr-qc/9411005](https://arxiv.org/abs/gr-qc/9411005); overview in [Rovelli, Living Reviews in Relativity "Loop Quantum Gravity"](https://link.springer.com/article/10.12942/lrr-2008-5)
- *Asymptotic safety*: gravity might be renormalizable *non-perturbatively* if it flows to an ultraviolet fixed point (Weinberg's 1979 idea; functional RG implementation by Reuter 1998) [LM] — [arXiv:hep-th/9605030](https://arxiv.org/abs/hep-th/9605030). A 2010 asymptotic-safety argument predicted a Higgs mass of ~126 GeV before the 2012 discovery (Shaposhnikov & Wetterich) [LM] — [arXiv:0912.0208](https://arxiv.org/abs/0912.0208). A 2026 review says the approach has been "remarkably successful in making contact with particle physics," but its phase diagram has only been mapped in restricted, truncated settings [V26] — [arXiv:2606.21522](https://arxiv.org/pdf/2606.21522)
- *Causal dynamical triangulations (CDT)*: a lattice-style sum over spacetime geometries. A key finding: the "spectral dimension" runs from ~4 at large scales to ~2 at short scales (Ambjørn, Jurkiewicz, Loll 2005) [LM] — [arXiv:hep-th/0505113](https://arxiv.org/abs/hep-th/0505113)
- *Causal sets*: spacetime is a discrete set of events ordered by cause and effect (Bombelli, Lee, Meyer, Sorkin 1987). Review in [Surya, Living Reviews 2019, arXiv:1903.11544](https://arxiv.org/abs/1903.11544) [LM]
- *"Gravity may not be quantum at all"*: Oppenheim's "postquantum theory of classical gravity" (Physical Review X, 2023) keeps spacetime classical and modifies quantum theory instead. It predicts random spacetime fluctuations that would make the weight of objects unpredictable at high enough precision. A companion Nature Communications paper proposes a test, and existing coherence-time data already exclude some parameter ranges [V26] — [APS Physics Viewpoint, Physics 16, 203](https://physics.aps.org/articles/v16/203); [UCL press release Dec 2023](https://www.ucl.ac.uk/news/2023/dec/new-theory-seeks-unite-einsteins-gravity-quantum-mechanics)
- Gravity-related wavefunction-collapse models (Diósi–Penrose) were tested underground at Gran Sasso. The simplest parameter-free version was ruled out (Donadi et al., Nature Physics 2021) [LM] — [arXiv:2111.13490](https://arxiv.org/abs/2111.13490)

**What physicists actually believe (2025 survey, published May 2026)** [V26]
- APS *Physics Magazine* "Big Mysteries" survey: 1,675 respondents, open online survey (not a random sample), 28 Jul–9 Sep 2025. Preferred quantum-gravity candidate: String/M-theory 18.9%; Loop QG 12.7%; Asymptotic safety 5.3%; Causal sets 2.8%; Hořava–Lifshitz 1.3%; CDT 1.0%; "Gravity is not quantum" 17.7%; Other 11.5%; **No opinion 28.7% (the largest single response)** — [Afshordi, Halper, Rini, Schirber, arXiv:2605.11058](https://arxiv.org/html/2605.11058v1)

**Experimental efforts on quantum aspects of gravity**
- Bose et al. (2017) and Marletto & Vedral (2017) proposed the "BMV" test. Put two masses each in a spatial superposition, let them interact *only* gravitationally, and check for entanglement. Because local operations and classical communication cannot create entanglement, observing it would show that the gravitational field has non-classical features [LM] — [Bose et al., arXiv:1707.06050](https://arxiv.org/abs/1707.06050); [Marletto & Vedral, arXiv:1707.06036](https://arxiv.org/abs/1707.06036)
- Caveat: what a positive result would actually prove (quantised gravitons, or just a non-classical Newtonian field) is debated [LM] — [Martín-Martínez & Perche, "What gravity mediated entanglement can really tell us about quantum gravity", arXiv:2208.09489](https://arxiv.org/abs/2208.09489)
- Smallest source mass whose gravity has been measured: 2021 Vienna (Aspelmeyer group) torsion-balance measurement of gravitational coupling between ~90 mg gold spheres (Westphal et al., Nature 591, 225) [LM] — [arXiv:2009.09546](https://arxiv.org/abs/2009.09546)
- 2024: a submillimetre magnet levitated in a type-I superconducting trap detected the gravitational pull of kg source masses ~0.5 m away, reaching attonewton forces (Fuchs, Ulbricht et al., *Science Advances* 10, eadk2949, 23 Feb 2024). The authors frame it as a step toward probing superposition and entanglement in gravitating systems [V26] — [PMC full text](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10889343/)
- Ongoing (2025): a Padua group has a 1 mg torsional pendulum at 18 Hz laser-cooled to 240 µK. Their stated aim is gravity-limited coupling between two ~1 mg pendulums. This is a step, not a result [V26] — [Padua seminar listing](https://indico.dfa.unipd.it/event/1666/event.ics)
- No completed gravitationally-induced-entanglement experiment was found as of Oct 2026. Recent papers are proposals: a LISA-Pathfinder-style space proposal with mg gold–platinum masses (2025 preprint) [V26] — [arXiv:2507.12899](https://arxiv.org/html/2507.12899v1); an atom-interferometry version (Howl, Cooper, Hackermüller, Phys. Rev. A, 2026) noting solid-mass versions need ~10⁻¹⁵ kg in superposition [V26, abstract-level] — [PRA 10.1103/l62d-gz5c](https://journals.aps.org/pra/pdf/10.1103/l62d-gz5c)

### Inferences
- **Type of work**: mostly mathematical/theoretical (string theory, LQG, holography). CDT and asymptotic safety are heavily computational. The BMV programme is experimental (tabletop quantum optomechanics) and is the one area where an actual 2020s–2030s result is plausible.
- **Gap to close**: the LHC reaches ~10⁴ GeV; the Planck energy is ~10¹⁹ GeV, about 15 orders of magnitude higher. This is why tests target *indirect* signatures (entanglement, black-hole entropy, cosmology) rather than direct Planck-energy collisions.
- The measured-gravity frontier is at milligrams. BMV-type proposals need ~10⁻¹⁴–10⁻¹⁵ kg masses held in superposition across micrometres. Both "make gravity measurable for tiny masses" and "make big masses quantum" must improve to meet in the middle.
- **Analogy**: GR as a superb street map (accurate at the scale you walk) that becomes useless if you zoom in to individual atoms of the pavement. Quantum gravity is the missing "atomic" map underneath, and nobody has yet checked which candidate map is right.
- **Analogy for BMV**: two coins that each "flip in superposition". If they end up correlated *only* because they felt each other's gravity, then gravity must be able to carry quantum information.

### Gaps
- No primary-source confirmation of any 2025–2026 *experimental* GIE milestone beyond the Fuchs et al. 2024 levitation result. Search coverage of conference results may be incomplete.
- The Howl et al. 2026 PRA was seen only at abstract/snippet level.
- No reliable 2026 Quanta/Physics Today overview of LQG-specific progress was found.

---

## 2. The black hole information paradox

### Takeaway
Hawking (1974–76) showed black holes radiate thermally and argued that evaporation destroys information, which contradicts quantum unitarity. Page (1993) showed what a unitary process would look like: the "Page curve". The 2019–2020 "islands"/replica-wormhole calculations reproduced the Page curve from a semiclassical gravity calculation. That is a major, widely accepted **ESTABLISHED (as a calculation)** result in toy models (2D JT gravity, AdS with a bath). It has not been derived for a realistic 4D astrophysical black hole, and it does not explain the microscopic mechanism by which information gets out. Firewalls (AMPS 2012) and soft hair (2016) remain **SERIOUS-SPECULATIVE**. Analog experiments (Steinhauer's BEC) observe Hawking-*like* radiation in sound. They are **ESTABLISHED as analog physics**, but they say nothing direct about information loss in gravitational black holes.

### Cited Findings
**Origins**
- Hawking 1974, "Black hole explosions?" (Nature 248, 30) [LM] — [doi:10.1038/248030a0](https://doi.org/10.1038/248030a0); full derivation in Hawking 1975, "Particle creation by black holes" (Commun. Math. Phys. 43, 199) [LM] — [doi:10.1007/BF02345020](https://doi.org/10.1007/BF02345020)
- Hawking 1976, "Breakdown of predictability in gravitational collapse" (PRD 14, 2460): pure states evolve to mixed states, i.e. information loss, non-unitarity [LM] — [doi:10.1103/PhysRevD.14.2460](https://doi.org/10.1103/PhysRevD.14.2460)
- Page 1993: if evaporation is unitary, the entanglement entropy of the radiation must rise and then fall back to zero, turning over at the "Page time" (roughly when half the black hole's entropy has been radiated) [LM] — [Page, "Information in black hole radiation", arXiv:hep-th/9306083](https://arxiv.org/abs/hep-th/9306083)
- Black-hole complementarity (Susskind, Thorlacius, Uglum 1993) [LM] — [arXiv:hep-th/9306069](https://arxiv.org/abs/hep-th/9306069)

**Firewalls**
- Almheiri, Marolf, Polchinski, Sully (AMPS 2012): unitarity + effective field theory outside the horizon + "no drama" for an infalling observer cannot all hold. They proposed the infaller instead burns up at a "firewall" at the horizon [LM] — [arXiv:1207.3123](https://arxiv.org/abs/1207.3123)

**Islands and replica wormholes (2019–2020)**
- Penington (2019), "Entanglement wedge reconstruction and the information paradox" [LM] — [arXiv:1905.08255](https://arxiv.org/abs/1905.08255)
- Almheiri, Engelhardt, Marolf, Maxfield (2019), "The entropy of bulk quantum fields and the entanglement wedge of an evaporating black hole" [LM] — [arXiv:1905.08762](https://arxiv.org/abs/1905.08762)
- Replica wormholes, two simultaneous groups: Penington, Shenker, Stanford, Yang [LM] — [arXiv:1911.11977](https://arxiv.org/abs/1911.11977); Almheiri, Hartman, Maldacena, Shaghoulian, Tajdini, done in 2D Jackiw–Teitelboim gravity coupled to matter [LM] — [arXiv:1911.12333](https://arxiv.org/abs/1911.12333)
- Accessible summary: Quanta (Oct 2020), "The Most Famous Paradox in Physics Nears Its End" — [Quanta Magazine](https://www.quantamagazine.org/the-black-hole-information-paradox-comes-to-an-end-20201029/); technical review: Almheiri et al., "The entropy of Hawking radiation", Rev. Mod. Phys. 2021 [LM] — [arXiv:2006.06872](https://arxiv.org/abs/2006.06872)
- What remains unsettled, per critics and follow-ups:
  - It is unclear whether the island is physical or an artefact of the gravitational path integral — [arXiv:2107.09228](https://arxiv.org/pdf/2107.09228)
  - The original calculations are 2D toy models, and extending them to realistic 4D black holes is a separate question — [researchseminars.org abstract](https://researchseminars.org/talk/RENC-THEO/2/); [arXiv:1911.12333](https://arxiv.org/abs/1911.12333)
  - JT gravity turns out to be dual to an *ensemble* of quantum systems, not a single one (the "factorization puzzle") [LM] — [Saad, Shenker, Stanford, arXiv:1903.11115](https://arxiv.org/abs/1903.11115)
  - Some argue islands need a non-gravitating "bath", or effectively massive gravitons [LM] — [Geng & Karch, "Massive islands", arXiv:2006.02438](https://arxiv.org/abs/2006.02438)
  - A sceptical critique of the whole framing [LM] — [Raju, "Lessons from the information paradox", arXiv:2012.05770](https://arxiv.org/abs/2012.05770)
- Some 2025 authors already describe the paradox as "resolved within the modern approach through islands" [V26] — [arXiv:2510.21985](https://arxiv.org/pdf/2510.21985). This is a framing, not a consensus.
- Community opinion (2025 survey, 1,675 respondents): information preserved in Hawking radiation 30.5%; preserved in a remnant 23.7% (54.2% "preserved" combined); irretrievably lost 18.8%; other 10.4%; no opinion 16.6% [V26] — [arXiv:2605.11058](https://arxiv.org/html/2605.11058v1)

**Soft hair**
- Hawking, Perry, Strominger (2016), "Soft hair on black holes": black holes carry infinitely many zero-energy "soft" charges tied to asymptotic symmetries, which might store information [LM] — [arXiv:1601.00921](https://arxiv.org/abs/1601.00921)

**Analog Hawking radiation (lab "dumb holes")**
- Unruh (1981) proposed sonic black-hole analogues; overview in [Barceló, Liberati, Visser, Living Reviews "Analogue gravity", arXiv:gr-qc/0505065](https://arxiv.org/abs/gr-qc/0505065) [LM]
- Steinhauer (Technion) 2016: spontaneous Hawking radiation from quantum vacuum fluctuations in a Bose–Einstein condensate, with entanglement between phonons on either side of the sonic horizon (Nature Physics 12, 959) [LM] — [arXiv:1510.00621](https://arxiv.org/abs/1510.00621)
- 2019: thermal spectrum and Hawking temperature measured (Muñoz de Nova et al., Nature 569, 688) [LM] — [arXiv:1809.00913](https://arxiv.org/abs/1809.00913)
- 2021: stationary spontaneous Hawking radiation and its time evolution (Kolobov et al., Nature Physics) [LM] — [arXiv:1910.09363](https://arxiv.org/abs/1910.09363)
- Caveats from other physicists: "results are not clear-cut," and a Physics Today commentary said the claim needs verification [V26-secondary] — [Physics World](https://physicsworld.com/?p=17162); [Physics Today opinion "Experimental black hole evaporation"](https://physicstoday.aip.org/opinion/experimental-black-hole-evaporation)
- A 2025 colloquium (Lisbon, 30 Apr 2025) presented the work as spontaneous, thermal, stationary Hawking radiation with observed ramp-up "similar to a real black hole" [V26] — [Técnico Lisboa event page](https://fisica.tecnico.ulisboa.pt/en/events/spontaneous-hawking-radiation-in-a-sonic-black-hole)

### Inferences
- **Type of work**: overwhelmingly mathematical/theoretical (holography, path integrals, quantum information). The analog experiments are experimental but test the *kinematics* of horizons (Hawking's mechanism is about horizons plus quantum fields, not about gravity's dynamics), so they cannot settle information loss.
- **Honest summary**: post-2019, most specialists believe information *comes out* (unitarity holds), and the island calculation shows how gravity's own path integral "knows" this. *How* the information is physically encoded in the radiation of a real astrophysical black hole is still not understood.
- **Analogy (Page curve)**: burning an encyclopedia. The smoke looks random, but in principle the information is all in the smoke and ash. Early on you can't reconstruct anything. After roughly the halfway point (the Page time), the smoke starts "giving back" the information.
- **Analogy (analog BH)**: a fish swimming upstream in a river that flows faster than the fish can swim past a certain point. Sound waves in a fast-flowing fluid have a "point of no return" just as light does at a black-hole horizon.

### Gaps
- No primary 2024–2026 Steinhauer publication was located in this pass. Status beyond 2021 rests on the 2025 colloquium abstract.
- No authoritative 2026 review listing "what islands did not settle" was found. The list above is assembled from individual critiques.

---

## 3. Singularities and cosmic censorship

### Takeaway
That singularities form in GR is a proven theorem: Penrose 1965 (Nobel 2020), and Hawking–Penrose 1970. They are **ESTABLISHED (mathematical theorems)**. Whether singularities are always hidden inside horizons (weak cosmic censorship), and whether GR stays deterministic inside black holes (strong cosmic censorship), are **open mathematical problems**. There are known counterexamples in higher dimensions (Lehner–Pretorius black strings) and in fine-tuned settings (Christodoulou, Choptuik). Dafermos–Luk (2017) showed the *strongest (C⁰) form* of strong cosmic censorship is false for Kerr interiors, while weaker forms may survive. Recent landmarks: the Kehle–Unger disproof of the "third law" of black-hole thermodynamics (JEMS 2025) and the proof of nonlinear stability of slowly rotating Kerr (Klainerman–Szeftel–Giorgi–Shen, 2022–2024).

### Cited Findings
- Penrose (1965), "Gravitational collapse and space-time singularities" (PRL 14, 57): once a trapped surface forms (and energy is positive), spacetime must contain an incomplete geodesic, i.e. a singularity [LM] — [doi:10.1103/PhysRevLett.14.57](https://doi.org/10.1103/PhysRevLett.14.57)
- Nobel Prize in Physics 2020: half to Roger Penrose "for the discovery that black hole formation is a robust prediction of the general theory of relativity"; the other half to Reinhard Genzel and Andrea Ghez for the Milky Way's central compact object [LM] — [NobelPrize.org](https://www.nobelprize.org/prizes/physics/2020/summary/)
- Hawking & Penrose (1970), singularity theorem covering cosmology/Big Bang (Proc. R. Soc. A 314, 529) [LM] — [doi:10.1098/rspa.1970.0021](https://doi.org/10.1098/rspa.1970.0021)
- Penrose's original cosmic-censorship proposal (1969, reprinted in Gen. Rel. Grav. 2002) [LM] — [doi:10.1023/A:1016578408204](https://doi.org/10.1023/A:1016578408204); review of weak cosmic censorship: [Wald, "Gravitational collapse and cosmic censorship", arXiv:gr-qc/9710068](https://arxiv.org/abs/gr-qc/9710068) [LM]
- Fine-tuned counterexamples in 4D: Choptuik's critical collapse of a scalar field (PRL 70, 9, 1993) produces arbitrarily small black holes at the threshold, and a naked singularity exactly at it [LM] — [doi:10.1103/PhysRevLett.70.9](https://doi.org/10.1103/PhysRevLett.70.9). Christodoulou constructed naked singularities in spherical scalar-field collapse (Annals of Math. 1994) and then proved they are *non-generic* (unstable) (Annals 1999). Both cited via [Wald review, arXiv:gr-qc/9710068](https://arxiv.org/abs/gr-qc/9710068) [LM]
- Higher-dimensional violation: Lehner & Pretorius (2010) simulated the Gregory–Laflamme instability of 5D black strings. The string pinches off into a fractal chain of "black-hole beads" and reaches zero thickness in finite time, i.e. a naked singularity from generic-looking initial data [LM] — [arXiv:1006.5960](https://arxiv.org/abs/1006.5960). Similar result for 5D black rings: [Figueras, Kunesch, Tunyasuvunakool 2016, arXiv:1512.04532](https://arxiv.org/abs/1512.04532) [LM]
- Strong cosmic censorship, Kerr interiors: Dafermos & Luk (2017) proved the Kerr Cauchy horizon is C⁰-stable. The metric extends *continuously* beyond it, so the C⁰ formulation of strong cosmic censorship is false. Weaker formulations (e.g. requiring blow-up of curvature or of locally square-integrable Christoffel symbols) remain open [LM] — [arXiv:1710.01722](https://arxiv.org/abs/1710.01722); accessible coverage: [Quanta, "Mathematicians Disprove Conjecture Made to Save Black Holes" (2018)](https://www.quantamagazine.org/mathematicians-disprove-conjecture-made-to-save-black-holes-20180517/)
- Positive cosmological constant: for charged (Reissner–Nordström–de Sitter) black holes near extremality, even weaker formulations of strong cosmic censorship appear violated (Cardoso, Costa, Destounis, Hintz, Jansen, PRL 2018) [LM] — [arXiv:1711.10502](https://arxiv.org/abs/1711.10502)
- 2022–2025: Kehle & Unger constructed collapse solutions (Einstein–Maxwell–charged scalar field) that form an *exactly extremal* black hole in finite time. This disproves Bardeen–Carter–Hawking's 1973 "third law of black hole thermodynamics" (published J. Eur. Math. Soc. 2025) [V26] — [EMS Press, doi:10.4171/JEMS/1591](https://ems.press/doi/10.4171/jems/1591); [arXiv:2211.15742](https://arxiv.org/abs/2211.15742). Follow-up: Reall showed this needs matter with large charge-to-mass ratio [V26] — [arXiv:2410.11956](https://arxiv.org/html/2410.11956v2)
- Nonlinear stability of slowly rotating Kerr: proved in a five-paper series by Klainerman & Szeftel, with Giorgi and Shen. The final part is published in Pure and Applied Mathematics Quarterly 20(7), 2024 (arXiv May 2022). Work on charged (Kerr–Newman) extensions continues (2026 APS talk) [V26] — [arXiv:2205.14808](https://arxiv.org/abs/2205.14808); [APS 2026 abstract](https://meetings-archive.aps.org/smt/2026/apr-w77/1/)

### Inferences
- **Type of work**: primarily mathematical (hyperbolic PDE analysis, geometric analysis), with numerical relativity used for higher-dimensional counterexamples. This is the most "pure math" corner of GR research and a natural fit for students who like proofs.
- **Status**: theorems that singularities form = ESTABLISHED. Weak cosmic censorship in 4D for generic, physically reasonable matter = OPEN conjecture, widely believed. Strong cosmic censorship = OPEN. Its C⁰ form is disproved for Kerr, and its weaker forms are under active study.
- The theorems prove geodesic *incompleteness*, not infinite density. Most physicists expect quantum gravity to replace the singularity. That ties this topic to Topic 1.
- **Analogy**: weak cosmic censorship as "nature's modesty rule". A breakdown point in the laws is always wrapped in a black-hole horizon, so outsiders never see it. Counterexamples are like finding that, in special, perfectly balanced situations (or in a 5D universe), the wrapping can tear.

### Gaps
- Could not confirm a single 2025 publication date for the *complete* Kerr-stability series; only the 2024 PAMQ final paper is confirmed.
- No 2025–2026 major result on weak cosmic censorship in 4D was found in this pass.

---

## 4. Alternative / modified theories of gravity

### Takeaway
GR passes every precision test, but dark energy, dark matter and the Hubble tension keep alternatives alive. In 2017, GW170817's measurement that gravitational waves travel at the speed of light (to ~10⁻¹⁵) removed large classes of dark-energy-motivated theories (much of Horndeski/beyond-Horndeski, quartic/quintic Galileons) and TeVeS-type MOND "dark matter emulators". Status: GR as tested = **ESTABLISHED**. All alternatives = **SERIOUS-SPECULATIVE** at best. MOND fits galaxy rotation curves but struggles with clusters and the CMB, and the 2023–2025 wide-binary test is contested. DESI's 2025 hint of evolving dark energy (2.8–4.2σ) has revived interest but is not a detection of modified gravity.

### Cited Findings
- Precision tests overview: [Will, "The Confrontation between General Relativity and Experiment", Living Reviews, arXiv:1403.7377](https://arxiv.org/abs/1403.7377) [LM]
- *Scalar–tensor (Brans–Dicke 1961)*: adds a scalar field with coupling ω, and GR is recovered as ω→∞ [LM] — [Phys. Rev. 124, 925](https://doi.org/10.1103/PhysRev.124.925). The Cassini Shapiro-delay measurement gives |γ−1| ≲ 2×10⁻⁵, implying ω ≳ 40,000 [LM] — [Bertotti, Iess, Tortora, Nature 425, 374 (2003)](https://doi.org/10.1038/nature01997); [Will review](https://arxiv.org/abs/1403.7377)
- *f(R) gravity*: replaces the Ricci scalar R in the action with a function f(R), originally to drive cosmic acceleration without Λ [LM] — [De Felice & Tsujikawa, Living Reviews, arXiv:1002.4928](https://arxiv.org/abs/1002.4928)
- *Horndeski (1974)*: the most general scalar–tensor theory with second-order equations of motion [LM] — [Int. J. Theor. Phys. 10, 363](https://doi.org/10.1007/BF01807638)
- *Massive gravity*: ghost-free dRGT theory [LM] — [de Rham, Gabadadze, Tolley 2011, arXiv:1011.1232](https://arxiv.org/abs/1011.1232); review [de Rham, Living Reviews, arXiv:1401.4173](https://arxiv.org/abs/1401.4173). LIGO–Virgo–KAGRA's GWTC-3 bound on graviton mass is m_g ≤ 1.27×10⁻²³ eV/c² [LM] — [GWTC-3 tests of GR, arXiv:2112.06861](https://arxiv.org/abs/2112.06861)
- *MOND (Milgrom 1983)*: modifies dynamics below an acceleration a₀ ≈ 10⁻¹⁰ m/s² [LM] — [ApJ 270, 365](https://ui.adsabs.harvard.edu/abs/1983ApJ...270..365M). *TeVeS* (Bekenstein 2004), its relativistic version [LM] — [arXiv:astro-ph/0403694](https://arxiv.org/abs/astro-ph/0403694). Bullet Cluster lensing offset from gas is usually cited as direct evidence for dark matter [LM] — [Clowe et al. 2006, arXiv:astro-ph/0608407](https://arxiv.org/abs/astro-ph/0608407). A newer relativistic MOND (Skordis & Złośnik's "AeST", PRL 2021) fits CMB spectra *and* has c_GW = c [LM] — [arXiv:2007.00082](https://arxiv.org/abs/2007.00082)

**GW170817 (17 Aug 2017)**
- A binary-neutron-star merger, with the gamma-ray burst arriving ~1.7 s after the merger signal from ~40 Mpc away. This constrains −3×10⁻¹⁵ ≤ (v_GW − c)/c ≤ +7×10⁻¹⁶ [LM] — [LIGO/Virgo/Fermi/INTEGRAL, ApJL 848, L13, arXiv:1710.05834](https://arxiv.org/abs/1710.05834)
- Immediately eliminated: large parts of Horndeski/beyond-Horndeski, including quartic/quintic Galileons and many "self-accelerating" dark-energy models [LM] — [Ezquiaga & Zumalacárregui, arXiv:1710.05901](https://arxiv.org/abs/1710.05901); [Creminelli & Vernizzi, arXiv:1710.05877](https://arxiv.org/abs/1710.05877); [Baker et al., arXiv:1710.06394](https://arxiv.org/abs/1710.06394); [Sakstein & Jain, arXiv:1710.05893](https://arxiv.org/abs/1710.05893)
- TeVeS-type "dark matter emulators" falsified, because gravitons and photons would arrive years apart [LM] — [Boran et al., "GW170817 Falsifies Dark Matter Emulators", arXiv:1710.06168](https://arxiv.org/abs/1710.06168)
- Caveat: LIGO frequencies (~100 Hz) may lie *above* the cutoff of some dark-energy effective theories, so the bound may not apply to them at cosmological scales [LM] — [de Rham & Melville, "Gravitational Rainbows", arXiv:1806.09417](https://arxiv.org/abs/1806.09417)

**Current motivations (2023–2026)**
- *Evolving dark energy*: DESI DR2 BAO (March 2025) prefers time-varying dark energy over Λ at 2.8–4.2σ depending on which supernova sample is combined [LM/V26] — [DESI DR2 Results II, arXiv:2503.14738](https://arxiv.org/abs/2503.14738); [secondary discussion, arXiv:2504.04417](https://arxiv.org/html/2504.04417v4). Sceptics (Ó Colgáin et al.) argue the conclusion depends on priors — [arXiv:2504.04417](https://arxiv.org/html/2504.04417v4)
- *Hubble tension*: SH0ES (Riess) ≈73 km/s/Mpc vs CMB-inferred ≈67–68. Freedman's CCHP (JWST + HST, tip-of-red-giant-branch) gets 70.39 km/s/Mpc and argues there is no strong tension; Scolnic says that result "is sort of in the middle." Unresolved as of 2026 [V26] — [Physics World, "Cosmic conflict continues"](https://physicsworld.com/a/cosmic-conflict-continues-new-data-fuel-the-hubble-tension-debate/); [Space.com](https://www.space.com/hubble-tension-cepheid-variables-type-1a-supernovas)
- A 2026 talk argues that modifying the expansion history alone cannot fix H₀. A shift in supernova absolute magnitude is needed, achievable in a modified-gravity model "with some degree of tuning" [V26] — [indico.global abstract, Aug 2026](https://indico.global/event/15863/contributions/155909/)
- *Wide binaries as a MOND test (contested)*: Chae (2023–2025, Gaia DR3) reports a ~40% gravity boost at low acceleration, consistent with MOND. Banik et al. (MNRAS 527, 2024) find Newtonian dynamics preferred at 19σ. Methodology is disputed; McGaugh (a MOND proponent) urged caution [V26] — [Banik et al. 2024 (St Andrews repository)](https://research-repository.st-andrews.ac.uk/bitstream/10023/28927/1/Banik-2023-Strong-constraints-on-the-MNRAS-527-3-4573-CCBY.pdf); [Physics World coverage](https://physicsworld.com/?p=109496); [Chae et al. 2025, arXiv:2502.09373](https://arxiv.org/pdf/2502.09373v3)
- Community opinion (2025 survey): cause of cosmic acceleration — time-varying dark energy 25.9%, cosmological constant 24.0%, "other modification to gravity" 13.0%, quantum-gravity effect 12.9%. On galactic "gravitational anomalies", MOND 11.5% and hybrid model 20.6% [V26] — [arXiv:2605.11058](https://arxiv.org/html/2605.11058v1)

### Inferences
- **Type of work**: mixed. Theory proposes models; observation (GW speed, Solar-System tests, cosmological surveys such as DESI/Euclid/Rubin, galaxy dynamics) kills them. GW170817 is the textbook example of a *single observation* eliminating hundreds of papers' worth of models, which is a good teaching point about falsifiability.
- Any viable modified gravity must now hide its effects in the Solar System (screening), keep c_GW = c, and fit the CMB. That combination is very restrictive.
- **Analogy**: GR is the incumbent champion. Challengers keep entering the ring, and in 2017 one gravitational-wave event knocked out a whole weight class at once.

### Gaps
- A 2026 consensus statement on DESI + supernova significance (e.g. DESI DR3/Year-5) was not found.
- The status of AeST and other post-2017 relativistic MOND theories against 2024–2026 data was not checked.

---

## 5. Wormholes

### Takeaway
Wormholes are allowed solutions of Einstein's equations, but **there is no observational evidence for any**. Classic Einstein–Rosen bridges are non-traversable: they pinch off faster than light can cross. Traversable (Morris–Thorne) wormholes need "exotic" matter that violates the averaged null energy condition. Quantum effects (Casimir) give small, real negative energies, but quantum inequalities sharply limit them. Gao–Jafferis–Wall (2016) found quantum-traversable wormholes in holography, but they are *not shortcuts*: crossing takes longer than going around. Google's 2022 Sycamore "wormhole" was a 9-qubit quantum simulation of a highly simplified toy model, and was criticised. Status: macroscopic traversable wormholes = **NO-FEASIBILITY**. Quantum/holographic traversable wormholes = **SERIOUS-SPECULATIVE theory**.

### Cited Findings
- Einstein & Rosen (1935), "The particle problem in the general theory of relativity" (Phys. Rev. 48, 73) [LM] — [doi:10.1103/PhysRev.48.73](https://doi.org/10.1103/PhysRev.48.73)
- Fuller & Wheeler (1962): the Schwarzschild bridge pinches off too fast for anything, even light, to cross [LM] — [Phys. Rev. 128, 919](https://doi.org/10.1103/PhysRev.128.919)
- Morris & Thorne (1988), "Wormholes in spacetime and their use for interstellar travel" (Am. J. Phys. 56, 395): traversable wormholes require "exotic" matter with negative energy density as seen by some observers [LM] — [doi:10.1119/1.15620](https://doi.org/10.1119/1.15620). With Yurtsever, they showed such wormholes could be turned into time machines [LM] — [PRL 61, 1446](https://doi.org/10.1103/PhysRevLett.61.1446). Hawking's "chronology protection conjecture" argues physics prevents this [LM] — [PRD 46, 603 (1992)](https://doi.org/10.1103/PhysRevD.46.603)
- Topological censorship: in GR with the averaged null energy condition, observers cannot traverse non-trivial topology [LM] — [Friedman, Schleich, Witt 1993, arXiv:gr-qc/9305017](https://arxiv.org/abs/gr-qc/9305017)
- Casimir effect: two uncharged plates in vacuum attract because the vacuum energy between them is *lower* than outside, a real and measured negative-energy-density effect (Lamoreaux 1997, PRL 78, 5) [LM] — [doi:10.1103/PhysRevLett.78.5](https://doi.org/10.1103/PhysRevLett.78.5)
- Quantum inequalities: QFT limits how much negative energy can exist and for how long. For wormholes, the exotic matter must be confined to a band many orders of magnitude thinner than the throat [LM] — [Ford & Roman, "Quantum field theory constrains traversable wormhole geometries", arXiv:gr-qc/9510071](https://arxiv.org/abs/gr-qc/9510071). The amount of violation can in principle be made small with fine-tuned geometry [LM] — [Visser, Kar, Dadhich 2003, arXiv:gr-qc/0301003](https://arxiv.org/abs/gr-qc/0301003)
- Gao, Jafferis, Wall (2016): coupling the two boundaries of an AdS black hole produces negative null energy that makes the Einstein–Rosen bridge *slightly* traversable [LM] — [arXiv:1608.05687](https://arxiv.org/abs/1608.05687)
- Maldacena, Milekhin, Popov (2018) built traversable wormholes in 4D with Standard-Model-like fields, but the trip through takes longer than the trip outside, so there is no shortcut and causality is safe [LM] — [arXiv:1807.04726](https://arxiv.org/abs/1807.04726)

**2022 Google Sycamore "wormhole"**
- Jafferis et al., "Traversable wormhole dynamics on a quantum processor", Nature 612, 51 (Nov 2022). Used Google's Sycamore with a machine-learning-simplified SYK-type Hamiltonian (7 Majorana fermions, 5 terms) to show teleportation signatures matching the holographic wormhole picture [LM] — [doi:10.1038/s41586-022-05424-3](https://doi.org/10.1038/s41586-022-05424-3)
- Kobrin, Schuster, Yao (Feb 2023) comment: the learned Hamiltonian does not thermalise (it is not chaotic like a real holographic system). The signal resembles SYK mainly for operators used in training. The "perfect size winding" is a generic feature of small commuting models, not evidence of gravity [V26] — [arXiv:2302.07897](https://arxiv.org/abs/2302.07897)
- Jafferis et al. reply (Mar 2023): the comment agrees on key points (size winding as the mechanism), and its objections concern counterfactual protocols not implemented [V26] — [arXiv:2303.15423](https://arxiv.org/abs/2303.15423)
- Philosopher-of-physics analyses of the dispute — [Weinstein, arXiv:2301.03522](https://arxiv.org/pdf/2301.03522); [Weinstein, arXiv:2308.00697](https://arxiv.org/pdf/2308.00697); critical blog coverage: [Woit, "Not Even Wrong"](https://www.math.columbia.edu/~woit/wordpress/?p=13405)

### Inferences
- **Type of work**: mathematical (GR solutions, energy-condition theorems, holography) plus quantum *simulation* (quantum computers simulating toy models). There is no observational programme because nothing has been seen. Lensing searches for exotic wormhole signatures exist but have found nothing (not sourced here).
- **Blunt bottom line for students**: the Google experiment did not create a wormhole in spacetime. At most it simulated a tiny quantum system whose *mathematics* is (under a conjectured duality) analogous to a wormhole in a toy universe with a different cosmological constant from ours. Even the theoretical traversable wormholes are slower than the normal route.
- **Analogy**: the classic "fold the paper and poke a pencil through" picture is fine for geometry. But the "tunnel" collapses instantly unless propped open by a material that would have to weigh *less than nothing*, and nature seems to ration that material very strictly.

### Gaps
- Did not verify whether Quanta Magazine or Nature formally amended their 2022 coverage (reported in various places; unconfirmed here).
- No 2024–2026 experimental wormhole-related claims of note were found.

---

## 6. Alcubierre warp drive and "spacetime engineering"

### Takeaway
Alcubierre (1994) wrote down a spacetime in which a "bubble" moves at any speed by contracting space ahead and expanding it behind. It is a **mathematical exercise with no demonstrated physical feasibility (NO-FEASIBILITY)**. It requires negative energy density. Early estimates exceeded the mass-energy of the observable universe. Later geometric tricks (Van Den Broeck, White) lowered the estimate on paper but did not remove the need for exotic matter. Superluminal bubbles have horizon/causality problems: the pilot cannot signal the bubble's front, and quantum instabilities arise. The 2021 "positive-energy" claims (Lentz; Bobrick & Martire; Fell & Heisenberg) were rebutted: generic warp drives still violate the null energy condition, and the positive-energy constructions that do work are subluminal. White's 2021 "warp bubble" was a numerical calculation of Casimir-cavity energy density whose *shape* resembled the Alcubierre profile. It was not a warp bubble.

### Cited Findings
- Alcubierre (1994), "The warp drive: hyper-fast travel within general relativity" (Class. Quantum Grav. 11, L73) [LM] — [arXiv:gr-qc/0009013](https://arxiv.org/abs/gr-qc/0009013)
- Pfenning & Ford (1997), "The unphysical nature of 'warp drive'": quantum inequalities force the bubble wall to be extremely thin, which pushes total negative energy to an absurd magnitude (they estimate far more than the mass-energy of the visible universe for a macroscopic bubble) [LM] — [arXiv:gr-qc/9702026](https://arxiv.org/abs/gr-qc/9702026)
- Van Den Broeck (1999): a "pocket" geometry (tiny external bubble, large internal volume) reduces the requirement to roughly solar-mass scales of negative energy, still exotic [LM] — [arXiv:gr-qc/9905084](https://arxiv.org/abs/gr-qc/9905084)
- Causality/horizons: for a superluminal bubble, the front is causally disconnected from the interior, so a crew could neither create nor steer it [LM] — [Everett & Roman, "Superluminal subway: the Krasnikov tube", arXiv:gr-qc/9702049](https://arxiv.org/abs/gr-qc/9702049). Semiclassical quantum effects make superluminal bubbles unstable: the renormalised stress-energy grows exponentially at the front [LM] — [Finazzi, Liberati, Barceló 2009, arXiv:0904.0141](https://arxiv.org/abs/0904.0141)
- Harold "Sonny" White (NASA JSC Eagleworks, 2011+) claimed that bubble-thickness oscillation could cut the requirement to roughly spacecraft-mass scales ("Warp Field Mechanics 101") [LM, NTRS record] — [NASA NTRS 20110015936](https://ntrs.nasa.gov/citations/20110015936). No peer-reviewed confirmation of those reductions was found in this pass.
- White et al. (2021, EPJ C 81, 677), "Worldline numerics applied to custom Casimir geometry generates unanticipated intersection with Alcubierre warp metric". A *numerical* model of a 1 µm sphere in a 4 µm cylinder produced an energy-density pattern "qualitatively quite similar" to the Alcubierre requirements. It was reported in the press as "first real warp bubble." Ethan Siegel: "We didn't make a warp bubble." White conceded this does not mean a warp drive is near [V26] — [EPJ C abstract](https://epjc.epj.org/articles/epjc/abs/2021/07/10052_2021_Article_9484/10052_2021_Article_9484.html); [Gigazine summary of the rebuttal](https://gigazine.net/gsc_news/en/20211217-warp-bubble); [Inverse](https://www.inverse.com/innovation/warp-bubble-space-time)

**2021 "physical / positive-energy" warp drives and rebuttals**
- Lentz (2021), "Breaking the warp barrier: hyper-fast solitons in Einstein–Maxwell-plasma theory" (CQG) claimed positive-energy superluminal solitons [LM] — [arXiv:2006.07125](https://arxiv.org/abs/2006.07125)
- Bobrick & Martire (2021), "Introducing physical warp drives" (CQG). They argue warp drives are shells of matter moving inertially and that some subluminal configurations can satisfy (or minimise violation of) the weak energy condition. They did not produce a superluminal positive-energy solution [LM] — [arXiv:2102.06824](https://arxiv.org/abs/2102.06824)
- Fell & Heisenberg (2021), "Positive energy warp drive from hidden geometric structures" (CQG) [LM] — [arXiv:2104.06488](https://arxiv.org/abs/2104.06488)
- Rebuttal: Santiago, Schuster, Visser (2022, PRD 105, 064038), "Generic warp drives violate the null energy condition". The positive-energy claims checked only one family of observers (Eulerian), whereas energy conditions require *all* observers. They conclude all physically reasonable warp drives violate the NEC, hence also the WEC, SEC and DEC [V26] — [arXiv:2105.03079](https://arxiv.org/abs/2105.03079). Lentz reportedly accepted the criticism but argued a sub-class might still satisfy the WEC; Santiago et al. disagreed [V26-secondary] — [Interesting Engineering fact-check](https://interestingengineering.com/science/fact-check-do-warp-drive-engines-violate-the-laws-of-physics)
- 2024: Fuchs, Helmerich, Bobrick, Sellers, Melcher, Martire, "Constant velocity physical warp drive solution" (CQG): a *subluminal* matter shell with a shift vector satisfying the energy conditions [LM] — [arXiv:2405.02709](https://arxiv.org/abs/2405.02709)
- 2026 review: Barzegar, Buchert, Vigneron (Feb 2026), "General formalism, classification, and demystification of the current warp-drive spacetimes". When GR is applied correctly, viability is "highly challenging to support, not merely due to the violation of energy conditions." It calls out misconceptions and errors in the pro-warp literature, finds the Santiago et al. critiques "correct in large part" (with minor errors), and notes some critiques were ignored by later warp-drive supporters [V26] — [arXiv:2602.16495](https://arxiv.org/abs/2602.16495)

### Inferences
- **Type of work**: purely mathematical (exact solutions, energy-condition analysis). No experiment has produced or detected any spacetime-warping effect beyond ordinary gravity. Calling Casimir-cavity calculations "warp experiments" is a category error.
- **Blunt verdict**: there is no known physical way to build a faster-than-light warp drive. Every superluminal construction requires negative energy in quantities and configurations no known physics provides. The bubble's front would be causally cut off from its pilot, and quantum effects appear to destroy it. The "positive-energy" results are either wrong or subluminal, i.e. a heavy shell of ordinary matter that offers no advantage over a rocket. This is science-fiction territory, though the mathematics is a legitimate teaching tool for the energy conditions.
- **Analogy**: a moving walkway at an airport. You stand still while the walkway carries you, so your local speed is never "illegal". But nobody knows how to build the walkway; its "motor" would have to run on fuel that weighs less than nothing.

### Gaps
- The NTRS record for White's 2011 paper was not fetched; the specific "~700 kg" figure often quoted in press should not be used without checking it.
- Could not confirm whether arXiv:2405.02709 was refereed and published (believed CQG 2024; unverified in this pass).

---

## 7. Numerical relativity

### Takeaway
Einstein's equations for merging black holes cannot be solved by hand. Decades of instabilities ended in 2005 with Pretorius's generalized-harmonic simulation and the "moving puncture" method of the Campanelli et al. and Baker et al. groups. Status: **ESTABLISHED and essential**. Without NR-calibrated waveforms (catalogs like SXS, surrogate models), LIGO could not have identified GW150914 or measured masses and spins precisely. The frontier is mainly computational: bigger catalogs (SXS third catalog 2025: 3,756 configurations), next-generation codes (SpECTRE's first BBH merger 2024), extreme mass ratios for LISA, and machine learning that infers source parameters in about a second (DINGO-BNS, Nature 2025).

### Cited Findings
- 3+1 (ADM) split: Arnowitt, Deser, Misner recast GR as evolving spatial slices in time [LM] — [arXiv:gr-qc/0405109 (reprint)](https://arxiv.org/abs/gr-qc/0405109). Why it is hard:
  - the equations split into *evolution* and *constraint* equations, and numerical error makes constraints drift ("constraint violation");
  - coordinates (lapse/shift, "gauge") are free and must be chosen so the grid neither hits the singularity nor stretches pathologically;
  - the original ADM form is only weakly hyperbolic, which motivated the BSSN reformulation.
  Sources: [Baumgarte & Shapiro 1998 (BSSN), arXiv:gr-qc/9810065](https://arxiv.org/abs/gr-qc/9810065); review [Centrella, Baker, Kelly, van Meter, Rev. Mod. Phys. 2010, arXiv:1010.5260](https://arxiv.org/abs/1010.5260) [LM]
- 2005 breakthrough #1: Pretorius, "Evolution of binary black-hole spacetimes" (PRL 95, 121101), using generalized harmonic coordinates, constraint damping and excision [LM] — [arXiv:gr-qc/0507014](https://arxiv.org/abs/gr-qc/0507014)
- 2005 breakthrough #2 ("moving punctures"), published back-to-back in PRL 96 (2006): Campanelli, Lousto, Marronetti, Zlochower [LM] — [arXiv:gr-qc/0511048](https://arxiv.org/abs/gr-qc/0511048); Baker, Centrella, Choi, Koppitz, van Meter [LM] — [arXiv:gr-qc/0511103](https://arxiv.org/abs/gr-qc/0511103)
- GW150914 (2016 discovery paper) compared the signal directly to numerical-relativity waveforms [LM] — [Abbott et al., PRL 116, 061102, arXiv:1602.03837](https://arxiv.org/abs/1602.03837)
- Surrogate models (fast interpolants trained on NR runs), e.g. NRSur7dq4 for precessing binaries [LM] — [Varma et al. 2019, arXiv:1905.09300](https://arxiv.org/abs/1905.09300)
- SXS Collaboration third catalog (arXiv May 2025; Class. Quantum Grav. 42, 2025): nearly doubles the catalog from 2,018 to 3,756 binary configurations; precessing runs to mass ratio 8 and spins 0.8; >250 eccentric simulations; public via the `sxs` Python package and data.black-holes.org [V26] — [arXiv:2505.13378](https://arxiv.org/abs/2505.13378)
- SpECTRE (open-source, discontinuous-Galerkin, task-based parallelism) completed its first full BBH inspiral–merger–ringdown (~18 orbits) [V26] — [Lovelace et al., arXiv:2410.00265](https://arxiv.org/abs/2410.00265); spinning-binary work continues [V26] — [APS April 2026 abstract](https://meetings-archive.aps.org/smt/2026/apr-v94/3/)
- Other codes: Einstein Toolkit (open community framework) — [einsteintoolkit.org](https://einsteintoolkit.org/); GRChombo (adaptive mesh refinement; used for cosmic strings, boson stars, higher-D) [LM] — [Clough et al. 2015, arXiv:1503.03436](https://arxiv.org/abs/1503.03436); SpEC (spectral, SXS's workhorse) — [black-holes.org](https://www.black-holes.org/)
- Machine learning: DINGO-BNS characterises binary-neutron-star mergers in ~1 s vs ~1 hour for the fastest traditional methods, with ~30% better sky localisation than low-latency methods. This supports rapid telescope follow-up (Dax, Green, Gair, Buonanno, Schölkopf et al., Nature 639, 49–53, March 2025) [V26] — [Tübingen release](https://uni-tuebingen.de/en/research/core-research/cluster-of-excellence-machine-learning/news/newsfullview-news/article/neural-network-deciphers-gravitational-waves-from-merging-neutron-stars-in-a-second/); [Bernstein Network](https://bernstein-network.de/en/newsroom/news/20250305/). Earlier deep-learning detection work: [George & Huerta 2018, arXiv:1711.03121](https://arxiv.org/abs/1711.03121) [LM]

### Inferences
- **Type of work**: computational (HPC on national supercomputers), plus mathematical (well-posedness, formulations) and directly feeding observation (waveform templates).
- **For a prospective student**: this is one of the most employable GR specialities. It combines PDEs, numerical analysis, HPC/GPU programming and data science, with direct impact on LIGO/LISA science.
- Next-generation detectors (ET/CE/LISA) will see signals with much higher SNR, so waveform-model errors will become the limiting systematic. That is why catalog growth and surrogate accuracy are active priorities (inferred from the catalog and surrogate literature cited).
- **Analogy**: weather forecasting for spacetime. You split the 4D problem into 3D "snapshots" stepped forward in time, and you must keep the model from blowing up while two whirlpools (the black holes) spiral together.

### Gaps
- Specific supercomputer names and allocations for 2024–2026 NR campaigns were not collected.
- No verified source on how much of O4 parameter estimation used ML pipelines in production.

---

## 8. Strong-field gravity

### Takeaway
"Strong field" means the compactness GM/(rc²) approaches order 1. It is ~10⁻⁶ for the Sun's surface, ~0.1–0.3 for neutron stars, and ~0.5 at a Schwarzschild horizon. GR now passes strong-field tests from gravitational waves (inspiral–merger–ringdown consistency, quasinormal-mode "spectroscopy", Hawking's area theorem), from EHT shadows, from the double pulsar, and from stars orbiting Sgr A*. The landmark 2025 result: GW250114 (SNR ~80) confirmed Hawking's 1971 area theorem at ~99.999% credibility (PRL 135, 111403) and resolved at least two ringdown modes consistent with Kerr. Status: GR's strong-field predictions = **ESTABLISHED to current precision**. The no-hair theorem is tested only at the tens-of-percent level. The neutron-star equation of state is **actively measured, not settled**.

### Cited Findings
- Compactness as the strong-field parameter, and electromagnetic strong-field tests [LM] — [Psaltis, Living Reviews 2008, arXiv:0806.1531](https://arxiv.org/abs/0806.1531)
- Hawking area theorem (1971, PRL 26, 1344): in classical GR, total horizon area never decreases [LM] — [doi:10.1103/PhysRevLett.26.1344](https://doi.org/10.1103/PhysRevLett.26.1344). First test with GW150914 data (Isi et al., PRL 2021) [LM] — [arXiv:2012.04486](https://arxiv.org/abs/2012.04486); about 95% confidence per Cornell's summary [V26] — [Cornell A&S news](https://as.cornell.edu/news/10th-anniversary-ligo-verifies-hawkings-theorem)
- **GW250114 (detected 14 Jan 2025)**: LVK paper "GW250114: Testing Hawking's Area Law and the Kerr Nature of Black Holes", PRL 135, 111403 (Sept 2025; DOI 10.1103/kw5g-d732). SNR ≈ 80, the loudest event to date. The area theorem is confirmed to ~99.999% credibility, and the result holds even after excluding up to five of the strongest merger cycles [V26] — [Cornell A&S news](https://as.cornell.edu/news/10th-anniversary-ligo-verifies-hawkings-theorem); [Penn State record](https://pure.psu.edu/en/publications/gw250114-testing-hawkings-area-law-and-the-kerr-nature-of-black-h/). (Press headlines saying "finally confirmed" overstate the paper's own "test at high credibility" language.)
- GW250114 ringdown: at least two quasinormal modes are needed to fit the post-merger data. The fundamental (2,2,0) mode and its first overtone match Kerr predictions "to tens of percent" [V26, abstract-level] — [GWTC-4.0 TGR III, arXiv:2603.19021](https://arxiv.org/pdf/2603.19021) and the separate GW250114 overtone paper (seen via NSF PAR listing; not fetched in full)
- Black-hole spectroscopy concept (test no-hair by measuring ≥2 QNM frequencies) [LM] — [Dreyer et al. 2004, arXiv:gr-qc/0309007](https://arxiv.org/abs/gr-qc/0309007); QNM review [Berti, Cardoso, Starinets 2009, arXiv:0905.2975](https://arxiv.org/abs/0905.2975). Example of a contested claim: an overtone in GW150914 [LM] — [Isi et al. 2019, arXiv:1905.00869](https://arxiv.org/abs/1905.00869), disputed by [Cotesta et al. 2022, arXiv:2201.00822](https://arxiv.org/abs/2201.00822)
- GWTC-4.0 tests of GR (2025–2026): 91 confident signals including 42 from O4a. Over 90% of events are consistent with GR at 90% credibility. One combined ringdown analysis puts GR in the tails, attributed partly to catalog variance; including GW250114 lowers that significance to 92.2% (96.2%). No evidence for post-merger echoes [V26] — [GWTC-4.0 TGR I, arXiv:2603.19019](https://arxiv.org/pdf/2603.19019); [TGR III, arXiv:2603.19021](https://arxiv.org/pdf/2603.19021)
- EHT shadows: M87* (2019) [LM] — [arXiv:1906.11238](https://arxiv.org/abs/1906.11238); Sgr A* (2022) ring diameter 51.8 ± 2.3 µas, consistent with GR's prediction for a 4×10⁶ M☉ black hole [V26-secondary] — [EHT Sgr A* Paper I listing](https://www.knmi.nl/research/publications/first-sagittarius-a-event-horizon-telescope-results-i-the-shadow-of-the-supermassive-black-hole-in-the-center-of-the-milky-way); constraints on alternative theories from the Sgr A* shadow [LM] — [Vagnozzi et al. 2022, arXiv:2205.07787](https://arxiv.org/pdf/2205.07787). A July 2026 EAS session announced new EHT results on M87*, Sgr A* and AGN from post-2017 campaigns [V26] — [EAS 2026 SS14](https://eas.unige.ch/EAS2026/session.jsp?id=SS14)
- Stars around Sgr A*: GRAVITY measured the Schwarzschild (relativistic) precession of star S2's orbit [LM] — [arXiv:2004.07187](https://arxiv.org/abs/2004.07187)
- Double pulsar (PSR J0737−3039A/B): 16-year timing confirms GR's quadrupole radiation prediction to ~0.013% [LM] — [Kramer et al., PRX 2021, arXiv:2112.06795](https://arxiv.org/abs/2112.06795)
- Neutron-star equation of state (NICER X-ray pulse-profile modelling): PSR J0030+0451 (2019) [LM] — [Riley et al., arXiv:1912.05702](https://arxiv.org/abs/1912.05702); [Miller et al., arXiv:1912.05705](https://arxiv.org/abs/1912.05705); PSR J0740+6620 (2021, ~2.1 M☉) [LM] — [Miller et al., arXiv:2105.06979](https://arxiv.org/abs/2105.06979); [Riley et al., arXiv:2105.06980](https://arxiv.org/abs/2105.06980)
- PSR J0437−4715 (2024): M ≈ 1.418 M☉, R ≈ 11.4 (+0.95/−0.63) km, favouring a "softer" equation of state and consistent with GW constraints [V26] — [Choudhury et al., arXiv:2407.06789](https://arxiv.org/html/2407.06789v1). A Dec 2025 reanalysis adding a nonthermal emission component finds a much wider 68% range of 11.8–15.1 km, showing the results remain model-dependent [V26] — [arXiv:2512.08790](https://arxiv.org/html/2512.08790v1)

### Inferences
- **Type of work**: observational and data-analysis heavy (GW, VLBI, X-ray timing, radio pulsar timing), backed by theory (QNM calculations, alternative-theory predictions) and NR.
- "GR passes" means "no deviation detected at current precision". For no-hair/ringdown that precision is still tens of percent, so next-generation detectors (Topic 9) are expected to tighten it substantially.
- **Analogy (black-hole spectroscopy)**: striking a bell. The pitch and how fast it fades reveal the bell's size and shape. GR says a black-hole "bell" is completely determined by just mass and spin ("no hair"), so every overtone must match those two numbers.
- **Analogy (area theorem)**: like entropy in thermodynamics, the total "surface area" of black holes can only go up, even when two merge and radiate away ~5% of their mass as waves.

### Gaps
- The full GW250114 overtone paper (title, arXiv ID, exact numbers) was not fetched.
- 2025–2026 EHT result contents (the July 2026 releases) were not retrieved.

---

## 9. Tests of GR going forward — facilities, timelines, and funding risk

### Takeaway
The next 10–15 years bring a new generation of gravity detectors:
- **Ground**: LIGO O5 (~2028), LIGO-India (groundbreaking Apr 2026, target 2030), Einstein Telescope (site decision expected 2027, ops ≥2035), Cosmic Explorer (design phase, 2030s).
- **Space**: LISA (ESA-adopted Jan 2024, launch ~2035).
- **Other probes**: pulsar timing arrays (3–4σ evidence for a nHz background since 2023, not yet 5σ), ngEHT/BHEX, and atomic clocks.

US funding has been seriously threatened. The FY2026 and FY2027 President's budget requests proposed cutting LIGO ~40% and closing one of its two sites, and cutting NASA's LISA contribution. Congress rejected the FY2026 cuts: the enacted FY2026 act provides "not less than $49 million" for LIGO and $80.5 M for NASA's LISA work. FY2027 is unresolved as of Oct 2026, and ESA is developing backup European hardware for LISA.

### Cited Findings
**LIGO–Virgo–KAGRA status**
- O4 ran 25 May 2023 – 18 Nov 2025 and produced ~300 significant GW signals. O5 is currently planned to start in 2028; a short run of up to six months in 2026 is under discussion (not confirmed) [V26] — [LVK/KAGRA announcement, 19 Nov 2025](https://gwcenter.icrr.u-tokyo.ac.jp/en/archives/2069)
- GWTC-4.0 tests of GR cover 91 events [V26] — [arXiv:2603.19019](https://arxiv.org/pdf/2603.19019)
- LIGO Lab maintains a public statement on long-term observing plans (not fetched in this pass) — [ligo.caltech.edu](https://www.ligo.caltech.edu/page/ligo-lab-statement-long-term-future-observing-plans); the LVK observing-plan page — [observing.docs.ligo.org/plan](https://observing.docs.ligo.org/plan)

**US budget threats (verify-carefully item)**
- FY2026 President's Budget Request (May 2025): cut LIGO from ~$48 M to ~$29 M (−39.6%), operate only one of the two sites (the site was not specified), reduce technology development. Part of a proposed ~57% NSF cut [V26] — [AAS FY26 PBR summary](https://aas.org/posts/news/2025/06/fy26-presidents-budget-request); [Science/AAAS](https://www.science.org/content/article/trump-s-proposed-cut-giant-physics-experiment-could-snuff-out-new-form-astronomy); [Sky & Telescope](https://skyandtelescope.org/astronomy-news/shattering-nsf-budget-proposal-threatens-gravitational-wave-science/)
- FY2026 enacted: the joint explanatory statement accompanying the FY2026 appropriations act "provides not less than $49 million for the year" for LIGO, on par with prior years. NSF total $8.75 B. LIGO Executive Director David Reitze said LIGO can "carry out our scientific program as planned in 2026." As of 29 Jan 2026, NSF had not finalised how it would distribute FY2026 funds [V26] — [The Advocate (Baton Rouge), 29 Jan 2026](https://www.theadvocate.com/baton_rouge/news/louisiana-ligo-scientists-nsf-funding-congress/article_3221e0f3-3abf-4449-838d-d1f4da5b067b.html); a CRS report records committee language of "not less than $49 million to operate both LIGO facilities" rejecting the one-site closure — [CRS R48783](https://www.everycrsreport.com/reports/R48783.html)
- FY2027 President's Budget Request (spring 2026): again ~55% NSF cut, ~40% LIGO cut, and again proposes closing one LIGO site (and Green Bank Observatory). The House Appropriations Committee's FY27 CJS bill rejects the LIGO closure. As of the latest found reporting (May 2026), Senate action and the final law were pending [V26] — [Astrobites, Apr 2026](https://astrobites.org/2026/04/16/budget-request-fy2027/); [AGU The Bridge, 26 May 2026](https://thebridge.agu.org/2026/05/26/fy2027-appropriations-update-nasa-noaa-and-nsf/)

**LISA (space, mHz band)**
- ESA adopted LISA on 25 Jan 2024. Launch on Ariane 6 around 2035; three spacecraft in a triangle with 2.5-million-km arms [LM] — [ESA, "Capturing the ripples of spacetime: LISA gets go-ahead"](https://www.esa.int/Science_Exploration/Space_Science/Capturing_the_ripples_of_spacetime_LISA_gets_go-ahead)
- NASA was to supply the lasers, telescopes (Goddard) and charge-management devices. The FY2026 request proposed eliminating NASA's LISA support; Congress rejected it and allocated $80.5 M (FY2026 approps law of 23 Jan 2026). The FY2027 request again proposes cancelling most of NASA's LISA participation, leaving only $2.4 M of generic "Physics of the Cosmos" technology funding [V26] — [European Spaceflight, 8 May 2026](https://europeanspaceflight.com/?p=6457); [SpacePolicyOnline](https://spacepolicyonline.com/news/esa-moves-forward-while-nasa-prepares-to-step-back-in-st/)
- ESA hedging: on 5 May 2026 it awarded a €26.1 M contract to Thales Alenia Space for LISA telescopes (phased, starting with breadboard), and opened a European charge-management-device tender (Nov 2025). ESA expects to decide the way forward by ~mid-2027 [V26] — [European Spaceflight](https://europeanspaceflight.com/?p=6457)
- Oct 2026: NASA's astrophysics director (Shawn Domagal-Goldman) reportedly tied NASA's LISA commitment to funding staying at current levels, e.g. under a continuing resolution [V26-secondary/UNV] — [Neoteo report](https://www.neoteo.com/en/nasa-reportedly-ties-its-lisa-commitment-to-current-funding)

**Third-generation ground detectors**
- Einstein Telescope (Europe, underground). Candidate sites: Sardinia (Sos Enattos), the Belgian–German–Dutch Meuse–Rhine border region, and Saxony/Lusatia (Germany). Bid books are due by end-2026 and site selection is expected in 2027 (one source says Q2 2027; another says ~Dec 2026). Cost ~€2 B, not fully funded. Geometry debate: a 10 km triangle vs two separated L's with 15 km arms. Not before ~2035 [V26] — [Physics World, 10 Sep 2025](https://physicsworld.com/a/physicists-set-to-decide-location-for-next-generation-einstein-telescope/); [Nikhef slides, Jan 2026](https://indico.nikhef.nl/event/7509/contributions/28333/attachments/10479/15977/20260113-noise.pdf)
- Cosmic Explorer (US, above ground): two L-shaped detectors with 40 km and 20 km arms; design phase; operations in the 2030s; cost estimated >$1 B. NSF-funded siting study (U. Arizona, $655k) narrowing 20 candidate locations through July 2028 [V26] — [cosmicexplorer.org](https://cosmicexplorer.org/); [APS April 2026 abstract](https://meetings-archive.aps.org/smt/2026/apr-v91/4/); [U. Arizona news, Aug 2026](https://gis.arizona.edu/news/chris-lukinbeal-awarded-655k-nsf-grant-siting-next-gen-observatory-site-selection); [CSU Fullerton](https://news.fullerton.edu/?p=47475)
- LIGO-India (Aundha, Hingoli district, Maharashtra): groundbreaking 23 Apr 2026 per Caltech; official completion target 2030 [V26] — [LIGO Caltech news, 23 Apr 2026](https://ligo.caltech.edu/news/ligo20260423); [Drishti IAS, Mar 2026](https://www.drishtiias.com/daily-updates/daily-news-analysis/ligo-indias-1st-gravitational-wave-observatory/print_manually). Construction-contract status is conflicting: reports of an L&T award (Feb 2026) vs RTI-based reports that it was unawarded [UNV] — [Swarajya](https://swarajyamag.com/amp/story/news-brief/indias-rs-1600-crore-gravitational-wave-lab-in-maharashtra-hits-roadblock-as-tender-remains-unawarded-report); [Indian Defense News](https://www.indiandefensenews.in/2026/02/l-secures-significant-2500-crore.html)

**Pulsar timing arrays (nHz band)**
- June 2023: NANOGrav 15-yr (3–4σ for Hellings–Downs correlations), EPTA+InPTA (~3σ), PPTA (~2σ), CPTA (~4.6σ) reported evidence for a nanohertz GW background, most likely from supermassive black-hole binaries; MPTA (MeerKAT) followed in Dec 2024 [LM/V26] — [NANOGrav, arXiv:2306.16213](https://arxiv.org/abs/2306.16213); [EPTA, arXiv:2306.16214](https://arxiv.org/abs/2306.16214); [PPTA, arXiv:2306.16215](https://arxiv.org/abs/2306.16215); [CPTA, arXiv:2306.16216](https://arxiv.org/abs/2306.16216); [review, arXiv:2511.08966](https://arxiv.org/pdf/2511.08966)
- No 5σ detection had been confirmed as of the latest sources found. IPTA DR3 (combined data) was described in April 2026 as "preliminary." A June 2026 preprint reanalysis of NANOGrav 15-yr claims a ~8× larger Hellings–Downs Bayes factor (≈1571) from better noise modelling [UNV — single preprint, seen via aggregator] — [APS April 2026 NANOGrav abstract](https://meetings-archive.aps.org/smt/2026/apr-b74/3/); [emergentmind listing](https://www.emergentmind.com/papers/2606.28554)

**Imaging, clocks and others**
- ngEHT: adds dishes and simultaneous 86/230/345 GHz; commissioning no earlier than ~2027. BHEX (Black Hole Explorer): space-VLBI concept being developed for NASA's Small Explorer programme, aiming to detect the photon ring of M87* (and possibly Sgr A*) [V26] — [arXiv:2406.17754](https://arxiv.org/pdf/2406.17754); [BHEX paper, arXiv:2608.16983](https://arxiv.org/pdf/2608.16983)
- Atomic clocks now resolve gravitational redshift across a *millimetre*-scale atomic sample (JILA, Bothwell et al., Nature 2022) [LM] — [arXiv:2109.12238](https://arxiv.org/abs/2109.12238)
- MICROSCOPE satellite final result: weak equivalence principle holds to ~10⁻¹⁵ [LM] — [Touboul et al., PRL 2022, arXiv:2209.15487](https://arxiv.org/abs/2209.15487)

### Inferences
- **Type of work**: experimental and observational instrumentation (lasers, quantum optics, cryogenics, space engineering), with large data-analysis and theory components.
- Funding is a real risk factor for students to know about. The pattern in FY2026 was "administration proposes deep cuts; Congress restores." FY2027 was not settled as of Oct 2026, so the chapter should avoid stating any final FY2027 outcome. For LISA the risk is mainly to the *timeline and US role*, since ESA is building backups; for LIGO it is the two-site operation that coincidence detection and sky localisation depend on.
- **Analogy (frequency bands)**: different detectors are like different ears. Ground detectors hear the "chirps" of stellar-mass mergers (tens to thousands of Hz). LISA hears the low hum of massive black holes (mHz). Pulsar timing arrays hear the deepest "bass" (nHz) from supermassive black-hole pairs. The galaxy's pulsars act as a clock network the size of the Milky Way.

### Gaps
- Final FY2027 appropriation for NSF/LIGO and NASA/LISA: not found (Senate action/enactment pending in sources found). Must be checked before publication.
- Whether NSF actually distributed FY2026 funds to keep both LIGO sites operating: implied by the Reitze quote, not explicitly confirmed.
- LIGO A# timeline/specs: not verified in this pass (LIGO Lab statement page exists but was not fetched).
- A search summary attributed to a 2025 LIGO talk a warning that the proposed cuts, if enacted, would delay later O5 upgrade components. The specific talk could not be identified, so treat it as unverified.
- SKA construction milestones and its GR-test (pulsar) timeline: not researched in this pass.
- Exact IPTA DR3 significance: not available.

---

## 10. The search for a unified theory

### Takeaway
Physics currently rests on two separately confirmed frameworks: the Standard Model (quantum field theory of particles and three forces) and GR (classical gravity). Unification is sought because they are mathematically incompatible at the Planck scale (Topic 1) and because history (electromagnetism, electroweak theory) rewards unification. String/M-theory is the most developed candidate. It naturally contains a graviton and has produced deep mathematical results (black-hole entropy counting, AdS–CFT), but as of 2026 it has **no experimental confirmation**. It faces the "landscape" problem (an enormous number of possible vacua, often quoted as ~10⁵⁰⁰) and debates about whether it accommodates our accelerating universe (swampland conjectures). Status: **SERIOUS-SPECULATIVE**. A 2025 survey of 1,675 physicists found no candidate commanding even 20% support.

### Cited Findings
- M-theory unification of string theories (Witten 1995) [LM] — [arXiv:hep-th/9503124](https://arxiv.org/abs/hep-th/9503124); microscopic black-hole entropy (Strominger–Vafa 1996) [LM] — [arXiv:hep-th/9601029](https://arxiv.org/abs/hep-th/9601029); AdS/CFT (Maldacena 1997) [LM] — [arXiv:hep-th/9711200](https://arxiv.org/abs/hep-th/9711200)
- Landscape: flux compactifications give a huge discretuum of vacua, allowing a small cosmological constant (Bousso & Polchinski 2000) [LM] — [arXiv:hep-th/0004134](https://arxiv.org/abs/hep-th/0004134); de Sitter vacua construction (KKLT 2003) [LM] — [arXiv:hep-th/0301240](https://arxiv.org/abs/hep-th/0301240); "anthropic landscape" (Susskind 2003) [LM] — [arXiv:hep-th/0302219](https://arxiv.org/abs/hep-th/0302219)
- Swampland programme: not every effective theory can be completed in quantum gravity (Vafa 2005) [LM] — [arXiv:hep-th/0509212](https://arxiv.org/abs/hep-th/0509212). The 2018 de Sitter conjecture suggests stable de Sitter vacua may be impossible in string theory, which would favour *evolving* dark energy [LM] — [Obied, Ooguri, Spodyneiko, Vafa, arXiv:1806.08362](https://arxiv.org/abs/1806.08362). A 2021 forecast argued Euclid/SKA/Rubin could "severely constrain – if not exclude" some string-motivated scenarios [LM] — [arXiv:2101.02942](https://ar5iv.labs.arxiv.org/html/2101.02942). A Sept 2025 swampland review exists [V26] — [Lehnert, arXiv:2509.02632](https://arxiv.org/abs/2509.02632)
- Quanta (May 2025) "Joy of Why" episode with Cumrun Vafa, "Will We Ever Prove String Theory?": promise and controversy continue; Vafa searches for testable models amid the swampland [V26] — [Quanta string theory tag](https://www.quantamagazine.org/tag/sting-theory); [podcast listing](https://pocketcasts.com/podcast/the-joy-of-why/09d397a0-886a-013a-d805-0acc26574db2/will-we-ever-prove-string-theory/0c920927-4e7c-46af-9cab-324db3eae43c)
- No supersymmetric partner particles have been found at the LHC (supersymmetry is a generic but not strictly required ingredient of string phenomenology) — [ATLAS SUSY public results](https://twiki.cern.ch/twiki/bin/view/AtlasPublic/SupersymmetryPublicResults)
- Claims of "first observational evidence for string theory" (Dec 2025, tied to DESI evolving dark energy) appear only on low-quality aggregator pages [UNV — do not use] — [aggregator example](https://slbubble.studentbridge.com/celebnews055/7-shocking-string-theory-updates-for-2025-is-the-theory-of-everything-finally-proven-kjmzo.html)
- 2025 survey: String/M-theory is the top named candidate at 18.9%; "gravity is not quantum" 17.7%; LQG 12.7%; no opinion 28.7%. The authors note that positions publicly described as "field-wide" consensus are in practice narrower majorities or pluralities [V26] — [arXiv:2605.11058](https://arxiv.org/html/2605.11058v1)

### Inferences
- **Type of work**: overwhelmingly mathematical. String theory's biggest *confirmed* payoffs so far are mathematical tools (holography, dualities, insights in pure mathematics) and theoretical consistency checks, not experimental predictions. Cosmology (dark-energy evolution, primordial GWs) is the most plausible near-term arena for indirect tests.
- **Honest 2026 status for the student**: there is no accepted unified theory, no unique prediction from string theory that current experiments can check, and real disagreement in the community. That is also why this is an open frontier: the problem is genuinely unsolved.
- Note the distinction for the chapter: "unification" (one framework for all forces) is a broader goal than "quantum gravity" (a consistent quantum theory of gravity). LQG, asymptotic safety, CDT and causal sets address the latter without necessarily unifying the forces.
- **Analogy**: the Standard Model and GR are two excellent maps drawn in incompatible projections. Each is accurate on its own territory, but they cannot be taped together at the edges (the Planck scale). String theory proposes a single globe from which both maps would follow, but nobody has yet found the part of the globe that matches our world uniquely (the landscape problem), or checked the globe against reality.

### Gaps
- No authoritative 2026 overview (Physics Today/Quanta) of string theory's status was found. The status statement rests on the absence of any confirmed evidence, plus the 2025 survey and the Vafa interview.
- The ~10⁵⁰⁰ vacua figure is a commonly quoted estimate traceable to flux-compactification counting. Its exact provenance was not re-verified here, so present it as "often quoted".
