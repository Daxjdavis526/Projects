# Black Holes and Gravitational Waves in General Relativity: research notes for Ch. 6 "Black Holes" and Ch. 7 "Gravitational Waves" (state of the field as of 24 Oct 2026)

Tag legend used on every bullet: **[GR]** = a mathematical prediction or result of general relativity (GR); **[OBS]** = directly observed or measured; **[SPEC]** = speculative, hypothetical or not yet confirmed; **[HIST]** = history or bibliography; **[MYTH]** = a common misconception and its correction. "Computed here" means I did the arithmetic in this session with G = 6.674×10⁻¹¹ m³ kg⁻¹ s⁻², c = 2.998×10⁸ m/s, M☉ = 1.989×10³⁰ kg, ħ = 1.055×10⁻³⁴ J s, k_B = 1.381×10⁻²³ J/K. Access notes: nobelprize.org, ligo.caltech.edu and observing.docs.ligo.org refused automated fetches (403/503 errors, or Anubis bot protection that I did not try to get around). Facts from those pages come from search-engine summaries and are flagged as such.

---

## Q1. How do black holes form? (stellar collapse, Chandrasekhar limit, TOV limit, Oppenheimer–Snyder, Penrose)

### Takeaway
When a massive star's core runs out of fuel, gravity wins if the core is heavier than any pressure can support. Electron degeneracy pressure fails above about 1.4 M☉ (Chandrasekhar limit). Neutron degeneracy pressure plus nuclear forces fail somewhere above about 2.2–2.35 M☉ (TOV limit, still uncertain). Oppenheimer and Snyder (1939) showed in GR that an idealized collapsing star cuts itself off from the outside universe. Penrose (1965, Nobel 2020) showed that black-hole formation is a robust prediction of GR, not an artifact of perfect symmetry.

### Cited Findings
- [OBS/GR] The Chandrasekhar limit is about **1.44 M☉** (for an electron-to-nucleon ratio of about 1/2; the exact value depends on composition). Above it, electron degeneracy pressure, a quantum effect of the Pauli exclusion principle, can no longer balance gravity in the core, so the star cannot become a stable white dwarf. — [Wikipedia: Chandrasekhar limit](https://en.wikipedia.org/wiki/Chandrasekhar_limit)
- [HIST] Chandrasekhar began the calculation on a 1930 voyage from India to England and published between 1931 and 1935. He shared the 1983 Nobel Prize in Physics with W. A. Fowler. — [Wikipedia: Chandrasekhar limit](https://en.wikipedia.org/wiki/Chandrasekhar_limit)
- [GR/HIST] The Tolman–Oppenheimer–Volkoff (TOV) limit is the maximum mass of a cold, non-rotating neutron star, the neutron-star analog of the Chandrasekhar limit. Oppenheimer and Volkoff (1939) first got about **0.7 M☉** by modeling neutrons as a free degenerate Fermi gas. That is too low, because they ignored nuclear repulsion. — [Wikipedia: TOV limit](https://en.wikipedia.org/wiki/Tolman%E2%80%93Oppenheimer%E2%80%93Volkoff_limit)
- [GR/OBS] Modern TOV estimates: about 2.2–2.9 M☉ (a 1996 study). GW170817-based analyses give about **2.01–2.17 M☉**. Rigid rotation can raise the limit by up to about 18–20%. — [Wikipedia: TOV limit](https://en.wikipedia.org/wiki/Tolman%E2%80%93Oppenheimer%E2%80%93Volkoff_limit)
- [OBS] The heaviest well-measured neutron star is PSR J0952−0607 at **2.35 ± 0.17 M☉**. Combined with other pulsars, this implies the maximum neutron-star mass is above 2.19 M☉ (1σ) or above 2.09 M☉ (3σ). — [Romani et al. 2022, arXiv:2207.05124](https://arxiv.org/abs/2207.05124)
- [GR/HIST] The 2020 Nobel Prize in Physics went half to **Roger Penrose** "for the discovery that black hole formation is a robust prediction of the general theory of relativity", and half jointly to **Reinhard Genzel and Andrea Ghez** "for the discovery of a supermassive compact object at the centre of our galaxy". — [APS news on the 2020 Nobel](https://www.aps.org/about/news/2020/10/nobel-prize-black-hole) (press-release wording via search summary; nobelprize.org itself returned 403)
- [OBS] There is a "lower mass gap" between the heaviest neutron stars and the lightest known black holes. GW230529 involved a compact object of **2.5–4.5 M☉** (below 5 M☉ at 99% credibility) merging with a 1.2–2.0 M☉ object, most likely a neutron star. It is evidence that objects exist inside that gap. — [LVK, arXiv:2404.04248](https://arxiv.org/abs/2404.04248)
- [GR/OBS] There is a predicted upper "pair-instability mass gap" of roughly **60–130 M☉**, where black holes from ordinary stellar collapse "should be rare due to pair instability mechanisms". — [LVK GW231123 paper, arXiv:2507.08219](https://arxiv.org/abs/2507.08219)
- [GR] Birkhoff's theorem: the Schwarzschild metric is the *unique* spherically symmetric vacuum solution. The outside of any spherical collapsing star is therefore exactly Schwarzschild, and spherical collapse cannot emit gravitational waves (see Q10). — [Carroll, *Lecture Notes on General Relativity*, ch. 7, arXiv:gr-qc/9712019](https://arxiv.org/abs/gr-qc/9712019)

### Inferences
- A beginner-friendly chain: the core exceeds about 1.4 M☉, so no white dwarf forms. If the remnant then exceeds the TOV limit (about 2.2–2.3 M☉; this is the "~2–2.3 M☉" in the brief), no neutron star is stable either. GR then has no static solution with matter, and collapse continues inside a horizon.
- The TOV limit is *not* known precisely, because the equation of state of dense nuclear matter is uncertain. The guide should say "about 2.2–2.5 M☉, uncertain" rather than give a single number.
- The Oppenheimer–Snyder (1939) model is the idealized case: a pressureless, uniform-density, spherical dust ball. Penrose's theorem matters because it removed the objection that collapse only happens in perfectly symmetric toy models.

### Gaps
- [HIST] I did not fetch primary bibliographic pages for Oppenheimer & Snyder, "On Continued Gravitational Contraction", *Phys. Rev.* 56, 455 (1939), or for Penrose, "Gravitational Collapse and Space-Time Singularities", *PRL* 14, 57 (1965). Both are standard references, but I did not re-verify them this session.
- Exact present-day best estimate of the TOV limit: sources range from about 2.0 to 2.9 M☉ depending on method. No single consensus number exists.

---

## Q2. What is the event horizon, the Schwarzschild solution (1916), r_s, and the singularity?

### Takeaway
Schwarzschild found the exact GR solution for spacetime outside a spherical, non-rotating, uncharged mass in early 1916, within weeks of Einstein's field equations. Its characteristic radius is `r_s = 2GM/c²`. For a black hole, the sphere at r_s is the event horizon. It is a *coordinate* singularity, with nothing locally special there. The true curvature singularity is at r = 0, where GR's own predictions break down.

### Cited Findings
- [HIST] Karl Schwarzschild, "On the gravitational field of a mass point according to Einstein's theory" (*Sitzungsberichte der Preussischen Akademie der Wissenschaften*, 1916). An English translation is on arXiv. — [arXiv:physics/9905030 (Antoci & Loinger translation)](https://arxiv.org/abs/physics/9905030). Caution: the translators' abstract editorializes against black holes ("science fiction"). That is a fringe view; cite only the translation, not the commentary.
- [GR] **Schwarzschild metric** (Carroll eq. 7.29, written with c = 1; c restored here):
  `ds² = −(1 − r_s/r) c² dt² + (1 − r_s/r)⁻¹ dr² + r² (dθ² + sin²θ dφ²)`, with `r_s = 2GM/c²`. — [Carroll, ch. 7, arXiv:gr-qc/9712019](https://arxiv.org/abs/gr-qc/9712019)
  - `ds²` = squared spacetime interval between two nearby events. For a clock, `ds² = −c² dτ²`, where τ is the proper time the clock ticks.
  - `t` = time coordinate, which equals the time kept by a clock at rest very far away (r → ∞).
  - `r` = "areal" radial coordinate, defined so a sphere at r has area 4πr². It is *not* the distance measured with a ruler from the center.
  - `θ, φ` = ordinary polar and azimuthal angles; `dθ² + sin²θ dφ²` is often written dΩ².
  - `G` = Newton's gravitational constant; `M` = mass of the central body; `c` = speed of light.
  - Sign convention (−,+,+,+) as in Carroll. Some books use (+,−,−,−), which flips every sign.
- [GR] The metric is the unique spherically symmetric vacuum solution (Birkhoff's theorem). — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [GR] r = 2GM/c² "is simply a coordinate singularity in our original (t, r, θ, φ) system". Other coordinates (Kruskal–Szekeres) are perfectly smooth there. A true singularity is diagnosed by coordinate-independent curvature scalars, such as R_μνρσR^μνρσ, going to infinity at a point reachable in finite distance. — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [GR] Inside the horizon, "for r < 2GM, t becomes spacelike and r becomes timelike … you can no more stop moving toward the singularity than you can stop getting older". Also: "every future-directed path in region II ends up hitting the singularity at r = 0." — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [GR] Near the singularity, "tidal forces become infinite": the infaller's head and feet are pulled apart and the torso squeezed. — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)

### Inferences
- **Worked r_s values (computed here):**
  - Sun (1 M☉): **2.95 km**
  - Earth (5.97×10²⁴ kg): **8.87 mm**, about the size of a marble or a grape
  - 10 M☉ stellar black hole: 29.5 km
  - GW150914 remnant (62 M☉): 183 km
  - GW231123 remnant (~225 M☉): ~660 km
  - **Sgr A*** (4.30×10⁶ M☉, GRAVITY 2022 value): **1.27×10⁷ km ≈ 0.085 AU**, about 18 solar radii. That is well inside Mercury's orbit (0.39 AU).
  - **M87*** (6.5×10⁹ M☉, EHT 2019 value): **1.9×10¹⁰ km ≈ 128 AU**, roughly 3× Pluto's average orbital distance (~40 AU).
  - Rule of thumb: r_s ≈ 3 km × (M/M☉).
- The singularity should be presented as "the place where the classical theory stops making predictions". It is *not* a known physical object. Curvature diverges there, and most physicists expect a quantum theory of gravity to replace the description at extremely small scales. That expectation is [SPEC].
- The Kretschmann scalar for Schwarzschild is `R_μνρσR^μνρσ = 48G²M²/(c⁴r⁶)`. It is finite at r = r_s and infinite at r = 0, which is a neat one-line demonstration. This is a standard textbook result; Carroll's notes describe the method, but I did not find the explicit formula in the copy I searched.
- "Mean density inside r_s" (computed here, heuristic only, because the "volume inside a horizon" is not well defined in GR): 1 M☉: ~1.8×10¹⁹ kg/m³; Sgr A*: ~1×10⁶ kg/m³ (~1,000× water); M87*: **~0.44 kg/m³, less than air at sea level (~1.2 kg/m³)**. The value scales as 1/M². This is useful for the "black holes aren't necessarily super-dense" misconception.

### Gaps
- I did not verify the explicit date Schwarzschild's paper was communicated (commonly given as January 1916, with the field equations published November 1915).

---

## Q3. What happens to time and orbits near a black hole? (time dilation, photon sphere, ISCO, Interstellar's Miller's planet)

### Takeaway
A clock held at rest at radius r ticks slower than a far-away clock by the factor `√(1 − r_s/r)`, which falls to zero at the horizon. Light can circle the hole (unstably) at 1.5 r_s, the photon sphere. Massive bodies cannot orbit stably inside 3 r_s (= 6GM/c², the ISCO) for a non-spinning hole. *Interstellar*'s 1 hour : 7 years requires a near-maximally spinning hole; it is impossible around a non-spinning one.

### Cited Findings
- [GR] Photon sphere at **r = 3GM/c² = 1.5 r_s**. "Inside the photon sphere, no circular orbits exist." — [Wikipedia: ISCO](https://en.wikipedia.org/wiki/Innermost_stable_circular_orbit); Carroll derives the maximum of the effective potential at r = 3GM — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [GR] Innermost stable circular orbit (ISCO) for Schwarzschild: **r = 6GM/c² = 3 r_s**. There are stable orbits for r > 6GM and unstable circular orbits for 3GM < r < 6GM. — [Carroll eq. 7.55](https://arxiv.org/abs/gr-qc/9712019); [Wikipedia: ISCO](https://en.wikipedia.org/wiki/Innermost_stable_circular_orbit)
- [GR] For a maximally spinning (Kerr) hole, the prograde ISCO shrinks toward GM/c² (0.5 r_s) and the retrograde ISCO grows toward 9GM/c² (4.5 r_s). The ISCO "marks the inner edge of the disk". — [Wikipedia: ISCO](https://en.wikipedia.org/wiki/Innermost_stable_circular_orbit)
- [GR] *Interstellar*: the 1 hour : 7 years time dilation on Miller's planet "is possible only if the planet orbits the black hole very close to its horizon". For a non-rotating hole, the ISCO at 3 r_s rules out bound orbits closer in. General relativity "allows such orbits to exist if the black hole is spinning rapidly". — [arXiv:2606.01921 (2026)](https://arxiv.org/abs/2606.01921)
- [HIST] Kip Thorne's book gives Miller's planet an orbital speed of 0.55c. An APS talk recalculates the dilation factor, orbit location and speed to resolve inconsistencies in online discussions. — [APS Texas Section 2016 abstract](https://meetings-archive.aps.org/tss/2016/f1/6)
- [HIST] *Interstellar*'s black-hole images were made with a GR ray-tracing code (DNGR) for light bundles in the Kerr metric. The paper describes how the images of Gargantua and its accretion disk were generated. — [James, von Tunzelmann, Franklin & Thorne 2015, arXiv:1502.03808](https://arxiv.org/abs/1502.03808)

### Inferences
- **Time-dilation formula (derived from the metric above, setting dr = dθ = dφ = 0):** `dτ/dt = √(1 − r_s/r)`.
  - `dτ` = proper time on the hovering clock; `dt` = time on a clock far away.
  - Values computed here: r = 10 r_s → 0.949; r = 3 r_s → 0.816; r = 1.5 r_s → 0.577; r = 1.1 r_s → 0.30; r = 1.01 r_s → 0.0995; r = 1.0001 r_s → 0.01.
  - This applies only to *static (hovering)* observers, which needs a rocket. Orbiting observers also have motion-related time dilation.
- For a *circular geodesic orbit* in Schwarzschild, `dτ/dt = √(1 − 3r_s/(2r))` (standard textbook result). At the ISCO (r = 3 r_s), dτ/dt = 0.707, only a factor of about 1.4. So no stable orbit around a non-spinning hole comes close to Interstellar's factor.
- Miller's planet factor (computed here): 7 yr / 1 h = **61,362**. Some fan or Thorne-derived sources quote ~61,000–61,700. A *hovering* observer would need to sit at r − r_s ≈ 2.7×10⁻¹⁰ r_s. That is why the film needs a near-extremal Kerr hole, where the prograde ISCO approaches the horizon.
- What's exaggerated or idealized in the film: (1) the spin must be extraordinarily close to maximal; (2) tidal and orbital stability details are idealized; (3) per DNGR-paper commentary, the visuals simplified some relativistic effects. Points (2) and (3) are not verified this session; see Gaps.
- **Shadow size (computed here):** the apparent shadow diameter of a Schwarzschild hole is `2√27 GM/c² ≈ 5.2 r_s`, which is larger than the horizon because light bending magnifies it.
  - Sgr A* (4.30×10⁶ M☉ at 8.275 kpc): predicted ≈ **53 µas**; EHT ring measured 51.8 ± 2.3 µas.
  - M87* (6.5×10⁹ M☉ at 16.8 Mpc): predicted ≈ **40 µas**; ring measured 42 ± 3 µas.
  - Note that the EHT ring is emission *around* the shadow, and the M87* mass was itself derived partly from the ring.

### Gaps
- The often-quoted Gargantua spin "1 − 1.3×10⁻¹⁴ below maximal" and mass "10⁸ M☉" come from Thorne's *The Science of Interstellar*, which I could not access this session.
- I did not verify which specific visual effects (e.g., Doppler beaming or color shifts of the disk) were toned down in the film, which is often claimed.

---

## Q4. Rotating black holes: Kerr solution (1963), ergosphere, frame dragging, spin parameter, ring singularity, no-hair theorem

### Takeaway
Real black holes spin. Roy Kerr found the exact rotating solution in 1963. It has an outer horizon (smaller than r_s for a spinning hole) and, outside it, an **ergosphere** where spacetime is dragged so strongly that nothing can stay still relative to distant stars. Its singularity is a **ring**, not a point. The no-hair theorem says a settled black hole is fully described by **mass, spin and electric charge**.

### Cited Findings
- [HIST/GR] Roy Kerr found the exact solution for an uncharged rotating black hole in **1963**. — [Wikipedia: Kerr metric](https://en.wikipedia.org/wiki/Kerr_metric)
- [GR] Spin parameter `a = J/(Mc)`, where J = angular momentum and M = mass, so a has units of length. Horizons: `r_± = [r_s ± √(r_s² − 4a²)]/2`. Horizons exist only if a ≤ GM/c². For a > GM/c² there is no horizon, giving a hypothetical "naked singularity" [SPEC]. — [Wikipedia: Kerr metric](https://en.wikipedia.org/wiki/Kerr_metric); Carroll notes that the extremal case G²M² = a² is unstable — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [GR] Ergosphere outer boundary (in units G = c = M = 1): `r_E = 1 + √(1 − a² cos²θ)`, which reaches 2M (that is, 2GM/c² = r_s) at the equator. "Inside the ergosphere, you must move in the direction of the rotation of the black hole." — [Wikipedia: Kerr metric](https://en.wikipedia.org/wiki/Kerr_metric); [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [GR] Ring singularity: in Kerr, "the set of points r = 0, θ = π/2 is actually the ring … the rotation has 'softened' the Schwarzschild singularity, spreading it out over a ring." — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [GR] Frame dragging ("dragging of inertial frames"). Penrose (1969) proposed the **Penrose process**, which extracts rotational energy from the ergosphere. — [Wikipedia: Kerr metric](https://en.wikipedia.org/wiki/Kerr_metric); [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [OBS] Frame dragging around **Earth** (the Lense–Thirring effect) was measured by Gravity Probe B (launched 20 Apr 2004; results 4 May 2011): frame-dragging **−37.2 ± 7.2 mas/yr vs GR prediction −39.2 mas/yr**; geodetic effect −6601.8 ± 18.3 vs −6606.1 mas/yr. LAGEOS laser-ranging analyses claimed about 10–20% accuracy. — [Wikipedia: Gravity Probe B](https://en.wikipedia.org/wiki/Gravity_Probe_B)
- [GR] No-hair theorem: a hole formed from lumpy collapse "shakes off" any lumpiness by emitting gravitational radiation. "This is an example of a 'no-hair theorem'." After settling, only charged and rotating holes need to be considered. — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [OBS] Black-hole spins measured by gravitational waves: GW231123's components had dimensionless spins **χ₁ = 0.90 (+0.10/−0.19)** and **χ₂ = 0.80 (+0.20/−0.52)**, the highest measured by GWs. — [LVK, arXiv:2507.08219](https://arxiv.org/abs/2507.08219)
- [OBS] Testing "Kerr-ness" and no-hair: GW250114's ringdown is consistent with the dominant (ℓ = |m| = 2) mode of a Kerr black hole plus its first overtone, with frequencies constrained to **±30% of the Kerr spectrum**. — [LVK, arXiv:2509.08054](https://arxiv.org/abs/2509.08054)

### Inferences
- The dimensionless spin used in GW papers is `χ = a/(GM/c²) = cJ/(GM²)`, between 0 (no spin) and 1 (maximal).
- For a maximal hole the outer horizon is at GM/c² = r_s/2, half the Schwarzschild value. The ergosphere still reaches r_s at the equator.
- Astrophysical black holes are expected to have negligible net electric charge, because surrounding plasma would neutralize it. In practice, then, two numbers (M and χ) describe them. This is standard reasoning; I found no fetched source for it this session.
- Frame dragging has been *observed* around Earth (GP-B), which is weak field. Near black holes it is *inferred* from spins and ringdowns rather than measured directly.

### Gaps
- The Lense & Thirring 1918 paper and the "Thorne limit" (accreting holes spin up to about χ ≈ 0.998) were not verified with a fetched source this session.
- Penrose-process maximum efficiency (often quoted as ~20.7% per particle, or 29% of a maximal hole's mass being extractable rotational energy) was not verified.

---

## Q5. Accretion disks, how they glow, jets, quasars, radiative efficiency (~6% to ~42%)

### Takeaway
Gas spiraling into a black hole forms a disk. Friction and turbulence (viscosity) heat it until it glows: X-rays for stellar-mass holes, UV/optical for supermassive ones. The energy released per unit mass is set by how deeply bound the ISCO orbit is. It is about **5.7%** of rest-mass energy for non-spinning holes and up to **~42%** for maximally spinning ones (prograde disk), versus about 0.7% for hydrogen fusion. That efficiency is why quasars outshine whole galaxies.

### Cited Findings
- [GR] Radiative efficiency of a thin disk = 1 − (specific energy at the ISCO). For Schwarzschild, `1 − 2√2/3 ≈ 0.057` (5.7%). It rises with spin to about **42.3% at a* = 1** for prograde disks, about 40% if photons captured by the hole are counted, and falls to about 3.8% for a maximally *retrograde* disk. Realistic high spins give η ≈ 20–30%, since spinning a hole up to exactly 1 is impossible. — search-surfaced lecture notes and reviews: [arXiv:1810.07032](https://arxiv.org/abs/1810.07032), [arXiv:2201.07262](https://arxiv.org/abs/2201.07262), [arXiv:1410.8132](https://arxiv.org/abs/1410.8132) (attribution of each number to a specific one of these papers comes from a search summary and was not checked page by page)
- [OBS] EHT: >50% of M87's arcsecond-scale 1.3 mm flux comes from near the horizon. The brightness asymmetry of the ring is explained by "relativistic beaming of the emission from a plasma rotating close to the speed of light". This gives "powerful evidence for the presence of supermassive black holes in centers of galaxies and as the central engines of active galactic nuclei". — [EHT M87 Paper I, arXiv:1906.11238](https://arxiv.org/abs/1906.11238); [Paper VI, arXiv:1906.11243](https://arxiv.org/abs/1906.11243)
- [OBS] M87's jet extends about **3,000 light-years**. 2021 EHT data reveal a compact source about **0.09 light-years** from the black hole at the expected location of the jet's base (NRAO/MPIfR release, 28 Jan 2026). — [Newswise/NRAO release](https://www.newswise.com/articles/new-event-horizon-telescope-results-trace-m87-jet-back-to-its-black-hole)
- [OBS] M87* polarization shows spiraling, ordered magnetic fields. The pattern's direction *reversed* between 2017/2018 and 2021, evidence of a dynamic magnetized accretion flow (A&A vol. 701, 16 Sep 2025). — [MPG press release](https://www.mpg.de/25396624/eht-telescope-finds-changing-magnetic-fields-around-black-hole-m87); [EHT, arXiv:2509.24593](https://arxiv.org/abs/2509.24593)

### Inferences
- Exact formulas (computed here): Schwarzschild ISCO specific energy = √(8/9), so η = 1 − √(8/9) = 0.0572. For a maximal prograde Kerr ISCO, E = 1/√3, so η = 1 − 1/√3 = 0.4226. For comparison, hydrogen fusion (4 ¹H → ⁴He) releases 0.71% of rest mass (computed from atomic masses).
- The physical story for students: the closer the ISCO, the deeper the gas falls before plunging, and the more gravitational energy is radiated first. Spin moves the ISCO inward, so spin raises efficiency.
- Jets are widely thought to be powered by magnetic fields threading the spinning hole's ergosphere (the Blandford–Znajek mechanism). This is mainstream theory, but the detailed jet-launching mechanism is not directly observed, so it should be marked [GR+astrophysical model / partly SPEC].
- Quasars = the most luminous active galactic nuclei, i.e., accreting supermassive black holes. Their identification as such rests on the efficiency argument above plus EHT-type evidence.

### Gaps
- No fetched source this session for: the discovery of quasars (3C 273, Maarten Schmidt 1963); Blandford–Znajek 1977; typical quasar luminosities; disk temperatures as a function of mass.

---

## Q6. Hawking radiation and tidal forces (spaghettification)

### Takeaway
Combining quantum field theory with GR, Hawking (1974) predicted that black holes emit thermal radiation at a temperature inversely proportional to their mass. For any astrophysical hole this temperature is absurdly small (60 nK for 1 M☉), far colder than the 2.7 K cosmic microwave background. **It has never been observed from a real black hole.** Tidal stretching at the horizon scales as 1/M². A stellar-mass hole would spaghettify you well outside its horizon, while you could cross a supermassive hole's horizon without noticing.

### Cited Findings
- [GR+QFT prediction] Hawking temperature: `T_H = ħc³/(8πGMk_B)`. Symbols: ħ = reduced Planck constant, c = speed of light, G = gravitational constant, M = black-hole mass, k_B = Boltzmann constant. Hawking published in 1974 ("Black hole explosions?", *Nature*), with a fuller paper, "Particle creation by black holes", in 1975. — [Wikipedia: Hawking radiation](https://en.wikipedia.org/wiki/Hawking_radiation). Carroll gives the same formula in natural units, `T = ħ/(8πkGM)`, noting "the temperature goes down as the mass goes up, so for black holes of mass comparable to the sun it is completely negligible." — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [GR+QFT prediction] Evaporation time: `t_ev = 5120πG²M³/(ħc⁴) ≈ 2.1×10⁶⁷ yr × (M/M☉)³`, far longer than the age of the universe (~1.4×10¹⁰ yr). — [Wikipedia: Hawking radiation](https://en.wikipedia.org/wiki/Hawking_radiation)
- [SPEC] Primordial black holes (hypothetical) born with about **5×10¹¹ kg** would be finishing evaporation today (Page 1976 gave ~4×10¹¹ kg; a 2008 calculation gave 5.00 ± 0.04 ×10¹¹ kg). — [Wikipedia: Hawking radiation](https://en.wikipedia.org/wiki/Hawking_radiation)
- [OBS: null result] Hawking radiation "has not been directly observed". Fermi gamma-ray searches for evaporating primordial black holes had found none as of Jan 2024. The KM3-230213A neutrino event has been proposed as one possible explanation among several [SPEC]. — [Wikipedia: Hawking radiation](https://en.wikipedia.org/wiki/Hawking_radiation)
- [OBS: analog only] Steinhauer's sonic "black hole" in a Bose–Einstein condensate (about 8,000 rubidium atoms) showed thermal, entangled Hawking-like phonon pairs. Some physicists dispute how much this validates the real-black-hole prediction. — [Physics World](https://physicsworld.com/a/entangled-hawking-radiation-spotted-in-analogue-black-hole/); [Live Science](https://www.livescience.com/black-hole-analog-confirms-hawking.html)
- [GR] Hawking's *area theorem* (1971) is a separate, classical GR result: total horizon area cannot decrease. It *has* now been tested observationally (see Q8, GW250114). Do not confuse it with Hawking radiation, which actually makes holes shrink over enormous times, a quantum violation of the classical theorem's assumptions. — [LVK, arXiv:2509.08054](https://arxiv.org/abs/2509.08054) (area law described as "the second law of black hole mechanics")
- [GR] Tidal forces become infinite approaching the singularity: "your feet and head will be pulled apart from each other, while your torso is squeezed to infinitesimal thinness." — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)

### Inferences
- **Hawking temperatures (computed here):** 1 M☉: **6.2×10⁻⁸ K (62 nK)**; Sgr A*: 1.4×10⁻¹⁴ K; M87*: 9.5×10⁻¹⁸ K. Rule of thumb: T_H ≈ 60 nK × (M☉/M).
  - A hole is hotter than the CMB (2.725 K) only if M < 4.5×10²² kg, which is about 60% of the Moon's mass (7.35×10²² kg).
  - Every known black hole therefore currently *absorbs* more CMB energy than it emits.
- **Tidal acceleration (Newtonian estimate, standard):** `Δa ≈ 2GML/r³`. Symbols: Δa = difference in gravitational acceleration between head and feet, L = body length, r = distance from the center.
  - At r = r_s this becomes `Δa = c⁶L/(4G²M²)`, which scales as **1/M²**.
  - Computed for L = 2 m at the horizon: 10 M☉: **~2×10⁸ m/s² (~2×10⁷ g)**, which means spaghettification well before the horizon. Sgr A*: **~1×10⁻³ m/s² (~10⁻⁴ g)**, unnoticeable. M87*: ~5×10⁻¹⁰ m/s².
  - The horizon tide reaches 10 g over 2 m for M ≈ 1.4×10⁴ M☉.
  - Lesson: bigger holes are "gentler" at the horizon, but every infaller is eventually shredded near the singularity.
- **Maximum proper time from horizon to singularity** for free fall from rest at the horizon is `τ_max = πGM/c³` (a standard Schwarzschild result; not verified against a fetched source this session). Computed: 10 M☉: 0.15 ms; Sgr A*: ~66 s; M87*: ~28 hours.

### Gaps
- Hawking's 1974 *Nature* paper (vol. 248, p. 30) was not fetched directly.
- I found no 2025–2026 claim of a Hawking-radiation detection from an astrophysical object. Absence is consistent with all sources.

---

## Q7. Observational evidence for black holes: Cygnus X-1, stars orbiting Sgr A*, Event Horizon Telescope (2019–2026)

### Takeaway
The evidence comes in layers:
1. **Dynamical masses:** a compact object too heavy to be a neutron star (Cygnus X-1, about 21 M☉), and 4.3 million M☉ inside S2's orbit around Sgr A*.
2. **GR effects on orbits:** S2's gravitational redshift (2018) and Schwarzschild precession (2020).
3. **Horizon-scale images:** the EHT shadows of M87* (2019) and Sgr A* (2022), polarization maps (2021, 2024), multi-year M87* monitoring showing a stable ring size but a shifting bright spot and flipping magnetic-field pattern (2024–2025), and a jet-base detection (2026).

### Cited Findings
**Cygnus X-1**
- [OBS/HIST] Discovered in **1964** by X-ray detectors on a sounding rocket from White Sands. In 1971 radio detections pinpointed the optical companion HDE 226868. In 1972 Webster & Murdin and, independently, Bolton announced a massive unseen companion. By the end of 1973 it was generally accepted as most likely a black hole: "the first X-ray source widely accepted as a black hole". The orbital period is 5.6 days. In the Hawking–Thorne bet (written Dec 1974/1975) Hawking bet *against* it being a black hole, and he conceded in 1990. — [Wikipedia: Cygnus X-1](https://en.wikipedia.org/wiki/Cygnus_X-1)
- [OBS] Mass **21.2 ± 2.2 M☉**, at a distance of **2.22 (+0.18/−0.17) kpc** (≈7,200 ly) from radio astrometry (Miller-Jones et al. 2021, *Science*). — [arXiv:2102.09091](https://arxiv.org/abs/2102.09091). Possible conflict: Wikipedia mentions a 2025 study giving ~17.5 M☉ (possibly an upper limit) or 13.8 M☉ by another method. I could not verify that study. — [Wikipedia: Cygnus X-1](https://en.wikipedia.org/wiki/Cygnus_X-1)

**Stars orbiting Sgr A* (GRAVITY at ESO's VLT; Keck/UCLA group)**
- [OBS] S2: 16-yr, highly elliptical orbit (e = 0.88). Pericentre is **120 AU ≈ 1,400 Schwarzschild radii**, where its speed is **~7,650 km/s**. Pericentre passage was in May 2018. GRAVITY detected the combined gravitational redshift plus transverse Doppler shift (z ≈ 200 km/s / c), with **f = 0.90 ± 0.09 (stat) ± 0.15 (sys)**, where f = 0 is Newtonian and f = 1 is GR. "The S2 data are inconsistent with pure Newtonian dynamics." — [GRAVITY Collab. 2018, arXiv:1807.09409](https://arxiv.org/abs/1807.09409)
- [OBS] **Schwarzschild precession** of S2 (ESO release 16 Apr 2020): **δφ = 12′ (arcminutes) per orbit**, with **f_SP = 1.10 ± 0.19** (0 = Newton, 1 = GR). The orbit traces a rosette. Any extended mass inside S2's orbit is below ~0.1% of the central mass. — [GRAVITY Collab. 2020, arXiv:2004.07187](https://arxiv.org/abs/2004.07187); [ESO eso2006](https://www.eso.org/public/news/eso2006/) (>330 measurements over 27 years; GRAVITY, SINFONI and NACO instruments)
- [OBS] Central mass **M = 4.30×10⁶ M☉ (±0.25%)**; the Schwarzschild precession detection was improved to **7σ** (GRAVITY Collab. 2022). — [arXiv:2112.07478](https://arxiv.org/abs/2112.07478). Distance to Sgr A*: **8,275 ± 9 (stat) ± 33 (sys) pc** (≈27,000 ly). — [MPE Galactic Center page](https://www.mpe.mpg.de/6588951/The-black-hole). ESO's 2020 release rounds to "about 26,000 light-years" and "about 4 million" M☉. — [ESO eso2006](https://www.eso.org/public/news/eso2006/)
- [HIST] 2020 Nobel (half to Genzel & Ghez) for the "supermassive compact object at the centre of our galaxy". The Academy noted a supermassive black hole is the only currently known explanation. — [APS](https://www.aps.org/about/news/2020/10/nobel-prize-black-hole)

**Event Horizon Telescope (EHT)**
- [OBS] **M87*** (2017 data; first results published in ApJL, 10 Apr 2019): 1.3 mm VLBI. The ring diameter is **42 ± 3 µas** with a central brightness depression of about 10:1, consistent with a Kerr black hole's shadow. Mass **6.5 ± 0.7 ×10⁹ M☉**; distance 16.8 Mpc (~55 million ly). — [EHT Paper I, arXiv:1906.11238](https://arxiv.org/abs/1906.11238); [Paper VI, arXiv:1906.11243](https://arxiv.org/abs/1906.11243)
- [OBS] **Sgr A*** (2017 data; announced 12 May 2022): an 8-telescope array at 1.3 mm. Ring diameter **51.8 ± 2.3 µas**, intrahour variability, and consistency with a Kerr black hole of ~4×10⁶ M☉. Models disfavor high inclination (>50°), non-spinning holes and retrograde disks. Comparison with M87* shows GR consistency "spanning over three orders of magnitude in central mass". — [EHT Sgr A* Paper I, arXiv:2311.08680](https://arxiv.org/abs/2311.08680); [EHT blog](https://eventhorizontelescope.org/blog/astronomers-reveal-first-image-black-hole-heart-our-galaxy)
- [OBS] **Polarization:** M87* polarized image (2021). Sgr A* polarized image released **27 Mar 2024**, showing strong, spiral-shaped magnetic fields similar to M87*'s, which hints that Sgr A* may have an as-yet-unseen jet [SPEC]. — [EHT blog](https://eventhorizontelescope.org/blog/astronomers-unveil-strong-magnetic-fields-spiraling-edge-milky-way%E2%80%99s-central-black-hole); [ESO eso2406a](https://eso.org/public/poland/images/eso2406a); [Wikipedia: EHT](https://en.wikipedia.org/wiki/Event_Horizon_Telescope)
- [OBS] **M87* 2018 data (released Jan 2024):** the same ring size as 2017, as GR predicts, since mass and distance do not change. The **brightest region shifted by ~30°** in position angle, attributed to turbulent accretion and predicted in 2019. The Greenland Telescope was added. — [UCL news, Jan 2024](https://www.ucl.ac.uk/news/2024/jan/new-image-supermassive-m87-black-hole-one-year)
- [OBS] **M87* multi-year (2017, 2018, 2021; A&A, Sep 2025):**
  - Persistent ring diameter **43.9 ± 0.6 µas**.
  - The year-to-year brightness distribution varies, as expected for a stochastic accretion flow.
  - Linear polarization fraction ~15% (2017) vs ~5% (2018, 2021).
  - The **polarization spiral's helicity (EVPA) reversed in 2021**.
  - First EHT constraints on jet emission outside the ring (≲1 mas), enabled by adding Kitt Peak and NOEMA in 2021.
  - Despite a 2018 gamma-ray flare, the 2018 and 2021 images look remarkably similar.
  — [EHT, arXiv:2509.24593](https://arxiv.org/abs/2509.24593); [MPG release 16 Sep 2025](https://www.mpg.de/25396624/eht-telescope-finds-changing-magnetic-fields-around-black-hole-m87)
- [OBS] **2026:** the 28 Jan 2026 release (2021 data) found that the ring alone cannot explain all the radio emission; a compact component ~0.09 ly from the hole matches the jet base. — [Newswise/NRAO](https://www.newswise.com/articles/new-event-horizon-telescope-results-trace-m87-jet-back-to-its-black-hole). An A&A paper published online 12 Aug 2026 concludes the current EHT is already sensitive to weak horizon-scale jet emission in M87*, and that improved short-baseline coverage from 2022 makes faint inner-jet features easier to detect. — [A&A 2026, aa60438-26](https://www.aanda.org/articles/aa/full_html/2026/08/aa60438-26/aa60438-26.html) (content via search summary only)

### Inferences
- The EHT images the *shadow plus the lensed emission ring* (photon-ring region), **not the event horizon surface itself**. The horizon is smaller than the shadow (shadow ≈ 2.6× horizon diameter for Schwarzschild).
- A persistent ring diameter across 2017–2021, alongside a moving bright spot, is a nice beginner-level demonstration: the ring size is set by gravity (mass/distance), while the brightness pattern is set by turbulent "weather" in the gas.
- Cygnus X-1 vs Sgr A* vs M87*: the masses span ~21 M☉ to 6.5×10⁹ M☉, a factor of ~3×10⁸, and the same GR describes all of them.

### Gaps
- Exact date of the 2021 M87* polarization release (I believe 24 Mar 2021; not verified).
- Keck/UCLA (Ghez group) independent S2 redshift result (Do et al. 2019, *Science*): not fetched.
- I searched for 2026 EHT releases beyond the January jet-base result and found none. There may be results after my search index's coverage, such as Sgr A* multi-year results or a 345 GHz imaging campaign.
- M87* mass tension (stellar-dynamics ~6.6×10⁹ vs older gas-dynamics ~3.5×10⁹ M☉) was not verified this session.

---

## Q8. What have LIGO–Virgo–KAGRA detections revealed about black holes? (masses, GW231123, GW250114, GW241011/GW241110)

### Takeaway
Gravitational waves have now measured hundreds of black holes: 390 cataloged candidates through January 2025 (GWTC-5.0, May 2026), with O4c events still being analyzed. The mass range runs from ~5 M☉ to ~140 M☉ per component. Highlights: **GW231123** (announced 14 Jul 2025) is the most massive merger (total ~190–265 M☉, remnant ~225 M☉, components in the pair-instability gap, near-maximal spins). **GW250114** (announced 10 Sep 2025) is the loudest signal (SNR ~77–80); it confirmed Hawking's area theorem and showed the remnant rings like a Kerr black hole. **GW241011/GW241110** (Oct 2025) are the first strong evidence for "second-generation" black holes.

### Cited Findings
**GW231123: most massive merger**
- [OBS] Detected **23 Nov 2023** by both LIGO detectors. Masses **137 (+23/−18) M☉** and **101 (+22/−50) M☉** (90% credible). Total 190–265 M☉. Luminosity distance 0.7–4.1 Gpc, redshift 0.40 (+0.27/−0.25), network SNR ~20.7. Spins 0.9 (+0.10/−0.19) and 0.80 (+0.20/−0.52). An independent ringdown analysis supports a massive remnant. "Some properties … are subject to large systematic uncertainties." The primary lies within or above the 60–130 M☉ pair-instability gap. This suggests channels beyond standard stellar collapse, and that ~200 M☉ intermediate-mass black holes form through GW-driven mergers. — [LVK, arXiv:2507.08219](https://arxiv.org/abs/2507.08219)
- [OBS] Announced **14 Jul 2025**. Remnant ">225 M☉" ("about 225"). Previous record: **GW190521** (~140 M☉ total). The signal was very short. — [LIGO press release](https://ligo.org/?p=4077); [ICRR GW231123 page](https://gwcenter.icrr.u-tokyo.ac.jp/en/?p=2085)
- [SPEC] Leading explanation: hierarchical mergers (each component is itself a merger product). One study finds only p ≈ 5% that a cluster could produce spins like GW231123's from two second-generation holes. Formation remains debated. — [arXiv:2510.14363](https://arxiv.org/abs/2510.14363)

**GW250114: loudest signal; area theorem and Kerr test**
- [OBS] Observed by the two LIGO detectors (on 14 Jan 2025). Network SNR **80**. Masses **m₁ = 33.6 (+1.2/−0.8) M☉** and **m₂ = 32.2 (+0.8/−1.3) M☉**. Small spins (χ ≤ 0.26) and eccentricity e ≤ 0.03. Ringdown consistent with the Kerr (ℓ = |m| = 2) mode and first overtone, frequencies within **±30%** of Kerr. Area law: "A range of analyses that exclude up to 5 of the strongest merger cycles confirm that the remnant area is larger than the sum of the initial areas to high credibility." — [LVK, arXiv:2509.08054](https://arxiv.org/abs/2509.08054), published as *Phys. Rev. Lett.* 135, 111403 (DOI 10.1103/kw5g-d732) — [MPG release, 10 Sep 2025](https://www.mpg.de/25343549/clearest-gravitational-wave-signal)
- [OBS] Similar to GW150914 (both ~30–40 M☉ components at ~1.3 billion ly), but far clearer. — [MPG](https://www.mpg.de/25343549/clearest-gravitational-wave-signal). Combined horizon area grew from about **240,000 km² to about 400,000 km²**. — [Virgo O4-end release](https://www.virgo-gw.eu/news/ligo-virgo-and-kagra-complete-the-richest-observation-run-to-date/)
- [OBS] Companion spectroscopy paper: **at least two quasi-normal modes** are required. The (ℓ = m = 4) mode is constrained to tens of percent, and the quadrupolar frequency to within a few percent of GR. Some tests are **2–3× more stringent** than those combining dozens of GWTC-4.0 events: "the most stringent single-event verification of GR and the Kerr nature of black holes to date". — [LVK, arXiv:2509.08099](https://arxiv.org/abs/2509.08099). A search summary reports this paper gives area-theorem consistency at **4.8σ** (using the full signal); I did not verify that number in the paper text.
- [OBS] Confidence comparison: the 2021 GW150914 area-law test found agreement with **97% (95%)** probability including (excluding) overtones. — [Isi et al. 2021, arXiv:2012.04486](https://arxiv.org/abs/2012.04486). Cornell's 2025 release frames GW250114 as reaching **99.999%**. — [Cornell](https://as.cornell.edu/news/10th-anniversary-ligo-verifies-hawkings-theorem)
- [OBS: conflict] In GWTC-5.0 (May 2026), GW250114_082203 has SNR **76.9**, a re-analysis value versus 80 in the PRL. — [GWTC-5.0, arXiv:2605.27225](https://arxiv.org/abs/2605.27225). The May 2026 Virgo press release's intro claims "the first measurement of three vibrational modes", but its own detailed text says two tones measured plus a third constrained. The primary paper supports "two modes plus a constrained third". — [Virgo GWTC-5 release](https://www.virgo-gw.eu/news/the-new-ligo-virgo-kagra-catalog-sets-new-records-in-precision-gravitational-astronomy/)

**GW241011 and GW241110: second-generation black holes**
- [OBS] GW241011 (11 Oct 2024) and GW241110 (10 Nov 2024). Approximate masses ~20 + 6 M☉ and ~17 + 8 M☉. Rapid, precisely measured primary spins, misaligned with the orbit, and unequal masses. These are characteristic of a primary that was itself born in an earlier merger, suggesting dense stellar environments. GW241011 (SNR 36.0, the third-loudest published) constrains the Kerr nature and excludes ultralight bosons with masses **10⁻¹³–10⁻¹² eV** via superradiance. — [LVK, arXiv:2510.26931](https://arxiv.org/abs/2510.26931); [LIGO science summary](https://ligo.org/science-summaries/GW241011-GW241110/). Distances: roughly 700 million and 2.4 billion ly. — [Virgo GWTC-5 release](https://www.virgo-gw.eu/news/the-new-ligo-virgo-kagra-catalog-sets-new-records-in-precision-gravitational-astronomy/)
- [OBS?] Press reports say GW241110's primary spins *opposite* (retrograde) to the orbit, a first. — [Universe Today](https://www.universetoday.com/articles/when-black-holes-eat-their-own). The LIGO summary text only says "not perfectly aligned"; treat "first retrograde spin" as press-level, not confirmed by me.

**Population**
- [OBS] GWTC-4.0 (Aug 2025; O4a: 24 May 2023 – 16 Jan 2024): 128 new candidates. BBH median component masses range from **5.79 M☉ (GW230627) to 137 M☉ (GW231123)**. Two NSBH (neutron star–black hole) candidates. First BBH signals with SNR >30. — [arXiv:2508.18082](https://arxiv.org/abs/2508.18082)
- [OBS] GWTC-5.0 (26 May 2026; O4b: 10 Apr 2024 – 28 Jan 2025): 161 new candidates, **all consistent with binary black holes** (no new neutron-star events). Median component masses **5.14–70 M☉**. Five BBHs have SNR >30. Best-localized source: GW240615, about 6 deg². — [arXiv:2605.27225](https://arxiv.org/abs/2605.27225); [LIGO O4b catalog summary](https://ligo.org/science-summaries/o4b_catalog_omnibus/)

### Inferences
- Area-theorem check (computed here): a non-spinning hole has horizon area `A = 16πG²M²/c⁴`. For 33.6 + 32.2 M☉ that gives 1.24×10⁵ + 1.14×10⁵ ≈ **2.37×10⁵ km²**, matching the "~240,000 km²" quoted. The final spinning hole has a smaller area per unit mass, yet still ~400,000 km².
- For the guide: GW231123's 137 M☉ primary sits where single-star collapse "shouldn't" make black holes. The interpretation (hierarchical mergers, gas accretion, etc.) is [SPEC]; the masses themselves are [OBS] but carry large systematic uncertainty.

### Gaps
- GW250114 final mass and spin: not in the abstracts I retrieved. It is probably ~62–63 M☉ and χ ≈ 0.68, but that is unverified, so do not print it without checking the PRL.
- The exact "4.8σ" area-law figure was not checked in the paper text.

---

## Q9. Black-hole misconceptions (and corrections)

### Takeaway
Most black-hole misconceptions come from imagining a cosmic vacuum cleaner or a literal "hole". GR says: far away, a black hole's gravity is exactly that of any equal mass. The horizon is locally unremarkable for a big hole. The singularity is in your future, not at a place you could point to. Hawking radiation is unobserved theory.

### Cited Findings
- [MYTH] "Black holes suck everything in." Correction: our orbit "is determined only by the mass of the Earth and the Sun and the distance between them". If black holes sucked everything in, "wouldn't the entire Universe have been digested into one big black hole by now?" — [Chandra X-ray Center: "Lies about black holes"](https://chandra.si.edu/resources/flash/lies_about_blackholes.html)
- [MYTH] "If the Sun became a black hole, Earth would be swallowed." Correction: a black hole of the same mass would leave the Sun's pull on Earth unchanged. Only Earth's temperature would change, because it would go dark and cold. Caveat: the Sun is not massive enough to become a black hole; it will end as a white dwarf. — [NASA Imagine the Universe](https://imagine.gsfc.nasa.gov/educators/blackholes/imagine/page26.html); [Sky at Night](https://www.skyatnightmagazine.com/space-science/earth-swallowed-by-black-hole/)
- [MYTH] "The singularity is a point in space at the center." Correction: inside the horizon r becomes a *time* coordinate, so "you can no more stop moving toward the singularity than you can stop getting older". The r = 0 singularity is a moment in the infaller's future. — [Carroll, ch. 7](https://arxiv.org/abs/gr-qc/9712019)
- [MYTH] "Hawking radiation has been seen." Correction: never directly observed. Only analog laboratory systems show Hawking-like effects, and their interpretation is debated. — [Wikipedia: Hawking radiation](https://en.wikipedia.org/wiki/Hawking_radiation); [Physics World](https://physicsworld.com/a/entangled-hawking-radiation-spotted-in-analogue-black-hole/)
- [MYTH] "The EHT photographed the event horizon." Correction: it imaged a ring of lensed emission around the shadow. The ring diameter is set by light bending near the photon orbit, and it matches GR's prediction for the shadow. — [EHT M87 Paper I](https://arxiv.org/abs/1906.11238)

### Inferences
- [MYTH] "You'd notice crossing the horizon." For a supermassive hole the tidal stretch at the horizon is ~10⁻⁴ g for Sgr A* (computed in Q6). The equivalence principle says a freely falling observer feels nothing special locally. A *distant* observer instead sees the infaller's light redshifted and dimming, never quite crossing (the apparent "freezing").
- [MYTH] "Black holes are infinitely dense holes in space." The horizon encloses a region whose "mean density" falls as 1/M²: it is ~0.4 kg/m³ for M87* (less than air) by the heuristic calculation in Q2. "Infinite density" applies only to the singularity, where GR breaks down. A black hole is a region of spacetime, not a hole in space.
- [MYTH] "Black holes are cosmic vacuum cleaners that roam and eat." Outside about 3 r_s, orbits are stable just as in Newtonian gravity. Even at Sgr A*, stars like S2 have orbited stably for decades.
- [MYTH] "A 1 M☉ black hole replacing the Sun would move Earth's orbit." Earth is at ~5×10⁷ r_s from such a hole (1 AU / 2.95 km, computed). Out there the Schwarzschild geometry is indistinguishable from Newtonian gravity, apart from tiny GR corrections.

### Gaps
- I found no single authoritative misconceptions list (e.g., from NASA) covering all six brief items. Corrections are assembled from multiple sources above.

---

## Q10. What are gravitational waves and what generates them? (nature, polarizations, quadrupole formula, why no dipole, why spherical collapse doesn't radiate, strain)

### Takeaway
Gravitational waves (GWs) are ripples in spacetime curvature that travel at c. They are transverse and come in two polarizations, "plus" (+) and "cross" (×), rotated 45° from each other. A passing wave alternately stretches one direction and squeezes the perpendicular one. They are produced when a mass distribution's *quadrupole moment* changes with an accelerating second time derivative. Conservation of momentum forbids dipole radiation, and Birkhoff's theorem forbids radiation from perfectly spherical motion. Waves reaching Earth have strains h ~ 10⁻²¹.

### Cited Findings
- [HIST/GR] Einstein predicted GWs in June 1916, traveling at light speed. In 1936 Einstein and Rosen submitted a paper claiming they do not exist, then rewrote it with the opposite conclusion after a referee report (Robertson). — [Wikipedia: Gravitational wave](https://en.wikipedia.org/wiki/Gravitational_wave)
- [GR] Two polarizations, plus (h₊) and cross (h×). They are 45° apart (vs 90° for light polarizations). Test particles oscillate perpendicular to the propagation direction, with no motion along it. — [Wikipedia: Gravitational wave](https://en.wikipedia.org/wiki/Gravitational_wave); Carroll covers "gravitational plane waves — transverse traceless gauge — polarizations" in ch. 6 — [Carroll](https://arxiv.org/abs/gr-qc/9712019)
- [GR] **Quadrupole formula** (Carroll eq. 6.85, c = 1): the wave produced by an isolated nonrelativistic source is proportional to the second time derivative of the quadrupole moment of the energy density, evaluated at the retarded time t_r = t − R. — [Carroll, ch. 6](https://arxiv.org/abs/gr-qc/9712019)
- [GR] **Why no dipole:** "oscillation of the center of mass of an isolated system violates conservation of momentum. (You can shake a body up and down, but you and the earth shake ever so slightly in the opposite direction to compensate.)" GWs are typically much weaker than EM radiation, because the quadrupole is smaller than the dipole and gravity couples weakly to matter. — [Carroll, ch. 6](https://arxiv.org/abs/gr-qc/9712019)
- [GR] **Why spherical collapse doesn't radiate:** radiation requires asymmetric motion. A spherically pulsating star doesn't radiate (consistent with Birkhoff's theorem), so a perfectly symmetric supernova wouldn't either. A dumbbell spinning about its symmetry axis also doesn't radiate. — [Wikipedia: Gravitational wave](https://en.wikipedia.org/wiki/Gravitational_wave); [Carroll, ch. 7 (Birkhoff)](https://arxiv.org/abs/gr-qc/9712019)
- [GR] Binary orbital shrinkage from GW emission: `dr/dt = −(64/5)(G³/c⁵)(m₁m₂)(m₁+m₂)/r³`. Symbols: r = separation, m₁ and m₂ = masses. The Earth–Sun system radiates only **~200 W** in GWs, shrinking the orbit by ~10⁻¹⁵ m per day. — [Wikipedia: Gravitational wave](https://en.wikipedia.org/wiki/Gravitational_wave)
- [OBS] Typical strain: GW150914's peak strain was **1.0×10⁻²¹**. — [LVK, arXiv:1602.03837](https://arxiv.org/abs/1602.03837)
- [OBS] Speed: GW170817 constrains `(v_GW − c)/c` to between **−3×10⁻¹⁵ and +7×10⁻¹⁶**. — [LVK+Fermi+INTEGRAL, arXiv:1710.05834](https://arxiv.org/abs/1710.05834)

### Inferences
- **Quadrupole formula in SI form (standard):** `h_ij ≈ (2G/(c⁴ R)) · d²I_ij/dt²`, evaluated at the retarded time t − R/c and taking the transverse-traceless part.
  - h_ij = metric perturbation (strain) components.
  - R = distance to the source.
  - `I_ij = ∫ ρ x_i x_j d³x` = second mass moment, where ρ = mass density and x_i = position coordinates.
  - Carroll writes it with q_ij = 3I_ij, hence his factor 2G/3R.
  - The G/c⁴ ≈ 8×10⁻⁴⁵ s²/(kg·m) prefactor explains why only enormous, fast-moving masses produce measurable h.
- Radiated power (Einstein quadrupole formula, standard): `P = (G/(5c⁵)) ⟨d³Q_ij/dt³ · d³Q_ij/dt³⟩`, where Q_ij = trace-free quadrupole and ⟨⟩ = time average. I did not verify this against a fetched source this session; it is textbook-standard (Hartle ch. 23; Carroll).
- Stretch/squeeze geometry for an L-shaped detector with arms along the + axes: a + wave changes one arm by +hL/2 and the other by −hL/2. The *difference* ΔL = hL is what an interferometer measures. For h = 10⁻²¹ and L = 4 km, ΔL = 4×10⁻¹⁸ m (computed here).
- A GW binary emits at **twice the orbital frequency**, the quadrupole symmetry. This is standard; not separately sourced here.

### Gaps
- No fetched source gave the full SI power formula or a numeric example such as the Hulse–Taylor GW power (~7×10²⁴ W). Both are left as textbook-standard and unverified.

---

## Q11. The Hulse–Taylor binary pulsar (1974; Nobel 1993): indirect proof of GWs

### Takeaway
PSR B1913+16 is a pulsar orbiting another neutron star every 7.75 hours. Its orbit is shrinking at exactly the rate GR predicts for energy carried away by gravitational waves. The observed-to-predicted decay ratio is **0.9983 ± 0.0016**. This was the first (indirect) evidence that GWs exist, and earned the 1993 Nobel.

### Cited Findings
- [HIST/OBS] Discovered **1974** by Russell Hulse and Joseph Taylor Jr. (UMass Amherst) with the 305 m Arecibo dish. Pulsar spin period 59.03 ms; orbital period **7.7519 h**; eccentricity 0.617; periastron advance **~4.2°/yr**; the orbital period decreases by ~76.5 µs per year; final inspiral in ~300 million years. **1993 Nobel Prize in Physics** to Hulse and Taylor. — [Wikipedia: Hulse–Taylor pulsar](https://en.wikipedia.org/wiki/Hulse%E2%80%93Taylor_pulsar)
- [OBS] From 9,257 times-of-arrival over 35 years: pulsar mass **1.438 ± 0.001 M☉**, companion **1.390 ± 0.001 M☉**. Ratio of observed orbital decay (kinematically corrected) to the GR prediction = **0.9983 ± 0.0016**, "thereby confirming the existence and strength of gravitational radiation as predicted by general relativity". Shapiro delay parameters were also measured. — [Weisberg & Huang 2016, arXiv:1606.02744](https://arxiv.org/abs/1606.02744)

### Inferences
- This is "observed" evidence for energy loss consistent with GWs, not a direct detection of a wave. Direct detection came in 2015 (Q13). The guide should keep the indirect/direct distinction.
- Periastron advance of 4.2°/yr vs Mercury's 43″/century shows how much stronger relativistic effects are in a compact binary.

### Gaps
- Nobel 1993 official press text (nobelprize.org) returned 403. Citation wording was taken via Wikipedia.

---

## Q12. How does LIGO work? (Michelson interferometer, 4 km arms, Fabry–Pérot cavities, power recycling, squeezed light, seismic isolation, sensitivity)

### Takeaway
LIGO is a giant Michelson interferometer with two perpendicular 4 km arms. A passing GW lengthens one arm and shortens the other, shifting how the laser beams recombine. To reach strain ~10⁻²¹ it uses:
- Fabry–Pérot arm cavities (light bounces many times);
- a power-recycling mirror (hundreds of kW circulating);
- quadruple-pendulum seismic isolation;
- ultra-high vacuum;
- since O4, frequency-dependent squeezed light that beats quantum noise.

GW150914's arm-length difference was about 4×10⁻¹⁸ m.

### Cited Findings
- [OBS/tech] Each arm is 4 km long, L-shaped and perpendicular, with arm cavities formed by four test masses. An extra mirror between the laser and beamsplitter (power recycling) raises the power stored in the arms. In 2015: 20 W input, **~100 kW circulating** in the arms (7.5× below design, i.e., ~750 kW design). Main mirrors hang on a **four-stage pendulum** for seismic isolation. Shot noise limits sensitivity above 100 Hz; control noise below 20 Hz. — [LIGO science summary: GW150914 detectors](https://ligo.org/science-summaries/gw150914detector/)
- [OBS] GW150914 arm-length *difference*: **~4×10⁻¹⁸ m, about 1/200 of a proton diameter** (LIGO). Calibration needed precision of ~10⁻¹⁹ m (~1/10,000 of a proton diameter). — [LIGO detector summary](https://ligo.org/science-summaries/gw150914detector/); [Calibration paper, arXiv:1602.03845](https://arxiv.org/abs/1602.03845). Conflicting popular figure: Wikipedia says "about a thousandth of a proton's width". — [Wikipedia: First observation of GWs](https://en.wikipedia.org/wiki/First_observation_of_gravitational_waves)
- [OBS/tech] O4 upgrades: goal of doubling arm power from ~200 kW to **400 kW**. — [Advanced LIGO review, arXiv:2202.00847](https://arxiv.org/abs/2202.00847). A 2023 Hanford talk reports **~430 kW arm power with 75 W input** (vs O3: 200 kW with 34 W). — [LIGO talk G2301205](https://dcc-backup.ligo.org/public/0188/G2301205/001/GWANW_2023_v1.pdf)
- [OBS/tech] **Frequency-dependent squeezing** uses a **300 m filter cavity** added to each detector (A+ upgrade). Squeezing reduced noise amplitude by a factor of 1.6 (4.0 dB) at Hanford and 1.9 (5.8 dB) at Livingston near 1 kHz (*Phys. Rev. X*, 2023). — [VU research portal record](https://research.vu.nl/en/publications/broadband-quantum-enhancement-of-the-ligo-detectors-with-frequenc/) (numbers via search summary)

### Inferences
- Beginner explanation:
  - Light from one laser is split and sent down both arms, reflected back and recombined.
  - The output port is set "dark": the two waves cancel.
  - A GW makes one arm longer and the other shorter, so the waves no longer cancel perfectly and light leaks out in a pattern that follows the wave.
  - Fabry–Pérot cavities make the light "use" each arm hundreds of times, multiplying the phase shift.
  - Power recycling recycles the light that would otherwise exit back toward the laser.
  - Squeezed light redistributes quantum uncertainty between amplitude and phase to reduce photon shot noise. "Frequency-dependent" means it reduces phase noise at high frequency and radiation-pressure noise at low frequency.
- The brief's "~10⁻¹⁸ m, ~1/1000 of a proton" is the rounded popular version. LIGO's own number for GW150914 is ~4×10⁻¹⁸ m ≈ 1/200 proton diameter. Recommend using LIGO's phrasing, "a few ×10⁻¹⁸ m, a few-hundredths to a thousandth of a proton's width", or simply "~1/200 of a proton".
- Why two (or more) widely separated detectors: to reject local noise (earthquakes, trucks) and to triangulate the sky position from arrival-time differences. The light travel time between the LIGO sites is ~10 ms (computed from a ~3,000 km separation; the exact separation was not verified this session).

### Gaps
- Mirror (test mass) mass (commonly 40 kg fused silica), vacuum volume and number of Fabry–Pérot bounces were not verified; ligo.caltech.edu facts pages returned 503.
- Exact GW150914 inter-site arrival delay (commonly 6.9–7 ms, Livingston first): not verified.

---

## Q13. GW150914 (first direct detection) and "chirp" signals

### Takeaway
On 14 Sept 2015 both LIGO detectors recorded a ~0.2 s signal sweeping from 35 to 250 Hz: the "chirp" of two black holes (36 and 29 M☉) spiraling together ~1.3 billion light-years away. They merged into a 62 M☉ hole and radiated 3 M☉c² in GWs. It was the first direct GW detection *and* the first observation of a binary black hole. The 2017 Nobel Prize went to Weiss, Barish and Thorne.

### Cited Findings
- [OBS] Detected **14 Sep 2015 at 09:50:45 UTC** by both LIGO detectors. Frequency sweep **35 → 250 Hz**; peak strain **1.0×10⁻²¹**; SNR **24**; false-alarm rate < 1 per 203,000 yr (>5.1σ). Luminosity distance **410 (+160/−180) Mpc**, z = 0.09. Source-frame masses **36 (+5/−4) and 29 ± 4 M☉**; final **62 ± 4 M☉**; **3.0 ± 0.5 M☉c²** radiated in GWs. "First direct detection of gravitational waves and the first observation of a binary black hole merger." Announced 11 Feb 2016 (arXiv posting date). — [LVK, arXiv:1602.03837](https://arxiv.org/abs/1602.03837)
- [HIST] 2017 Nobel Prize in Physics: half to **Rainer Weiss**, half jointly to **Barry Barish and Kip Thorne**, "for decisive contributions to the LIGO detector and the observation of gravitational waves". — [nobelprize.org 2017 summary](https://www.nobelprize.org/prizes/physics/2017/summary/) (this URL returned 403 to automated fetch; the fact is standard but was not re-read this session)
- [GR] The signal "matches the waveform predicted by general relativity for the inspiral and merger of a pair of black holes and the ringdown of the resulting single black hole". — [arXiv:1602.03837](https://arxiv.org/abs/1602.03837)

### Inferences
- Computed here: 410 Mpc ≈ **1.34 billion light-years**. 3 M☉c² ≈ **5.4×10⁴⁷ J**, emitted in a fraction of a second.
- **Chirp explanation:** as the orbit shrinks, the orbital frequency rises and so does the GW frequency (2× orbital). Amplitude also rises, giving an up-sweeping "whoop" like a bird chirp. That is why the audio-band (35–250 Hz) signal can be played as sound. The sound is a *sonification*: GWs are not sound waves.
- **Chirp mass (standard; eq. 1 of the discovery paper, not re-read this session):** `𝓜 = (m₁m₂)^(3/5)/(m₁+m₂)^(1/5) = (c³/G)·[(5/96) π^(−8/3) f^(−11/3) ḟ]^(3/5)`. Here f = GW frequency and ḟ = its rate of change. Measuring how fast the frequency sweeps directly gives this mass combination; for GW150914 it is ~30 M☉. The discovery paper's argument for black holes was that this much mass orbiting at ~75 Hz must be packed within a few hundred km, too compact for anything but black holes (recalled, not re-read this session).
- Three phases for students: **inspiral** (well described by post-Newtonian approximations to GR), **merger** (needs numerical relativity), **ringdown** (quasi-normal modes of the final Kerr hole, i.e., black-hole "spectroscopy", see GW250114).

### Gaps
- GW150914 peak luminosity (often quoted ~3.6×10⁴⁹ W, more than all the stars in the observable universe combined) was not verified this session.

---

## Q14. GW170817: neutron-star merger, GRB 170817A, kilonova, multimessenger astronomy, standard sirens

### Takeaway
On 17 Aug 2017 LIGO and Virgo detected two neutron stars merging 40 Mpc (~130 million ly) away. Fermi saw a short gamma-ray burst **1.7 s** later, and telescopes found a kilonova in galaxy NGC 4993 within 11 hours. This was the birth of GW multimessenger astronomy. It proved that neutron-star mergers make short GRBs and forge r-process heavy elements (gold, platinum). It showed GWs travel at c to ~1 part in 10¹⁵, and gave an independent "standard siren" Hubble constant of 70 (+12/−8) km/s/Mpc.

### Cited Findings
- [OBS] **17 Aug 2017, 12:41:04 UTC**, Advanced LIGO + Advanced Virgo. Combined SNR **32.4**. Component masses 0.86–2.26 M☉ (1.17–1.60 M☉ assuming low spins); total mass **2.74 (+0.04/−0.01) M☉**. Sky area **28 deg²**; luminosity distance **40 (+8/−14) Mpc**, "the closest and most precisely localized gravitational-wave signal yet". — [LVK, arXiv:1710.05832](https://arxiv.org/abs/1710.05832)
- [OBS] GRB 170817A was detected by Fermi-GBM and INTEGRAL **(+1.74 ± 0.05) s** after the merger. The chance coincidence probability is 5.0×10⁻⁸, confirming that BNS mergers are a progenitor of short GRBs. The speed of gravity minus the speed of light is between **−3×10⁻¹⁵ and +7×10⁻¹⁶** times c. The burst was 2–6 orders of magnitude less energetic than other short GRBs. — [arXiv:1710.05834](https://arxiv.org/abs/1710.05834)
- [OBS] Optical transient **SSS17a / AT 2017gfo** was found in **NGC 4993** less than 11 hours after the merger (1M2H team, 1 m Swope telescope). It started as a blue UV transient fading within 48 h, then reddened over ~10 days. X-ray emission appeared at ~9 days and radio at ~16 days. No neutrinos were found. — [LVK + many teams, arXiv:1710.05833](https://arxiv.org/abs/1710.05833)
- [OBS + model] Kilonova models show two ejecta components, lighter (A < 140) and heavier (A > 140) r-process elements. They imply "such mergers are a dominant mode of r-process production in the Universe" (r-process = rapid neutron capture producing elements like gold and platinum). — [Kasen et al. 2017, arXiv:1710.05463](https://arxiv.org/abs/1710.05463)
- [OBS] Standard siren: **H₀ = 70.0 (+12.0/−8.0) km s⁻¹ Mpc⁻¹**, with no cosmic distance ladder needed. — [LVK et al., arXiv:1710.05835](https://arxiv.org/abs/1710.05835). Update: using GWTC-5.0 (May 2026), the LVK measured **H₀ = 71.0 (+9/−7) km/s/Mpc**, ~25% more precise than the previous release but not yet resolving the Hubble tension. — [Virgo GWTC-5 release](https://www.virgo-gw.eu/news/the-new-ligo-virgo-kagra-catalog-sets-new-records-in-precision-gravitational-astronomy/)

### Inferences
- Computed: 40 Mpc ≈ **130 million light-years**. The speed bound follows from a 1.7 s delay over ~1.3×10⁸ years of travel; the bound is ~10⁻¹⁵ even allowing for the delay being intrinsic to the burst.
- "Standard siren": the GW waveform itself encodes the luminosity distance (amplitude vs chirp rate), while the host galaxy's redshift gives the recession velocity. H₀ = velocity/distance.
- "r-process is the dominant source of heavy elements" is the paper's inference. Whether mergers are *the* dominant site (vs. rare supernova types) is still discussed [partly SPEC].
- As of GWTC-5.0, no new binary neutron-star event was found in O4b. GW170817 remains the only GW event with a well-observed EM counterpart in these catalogs. GW190425 is a second BNS (2019) without a counterpart; not verified this session.

### Gaps
- Whether any O4c (2025) event had an EM counterpart: no evidence found; the full O4c catalog is not yet published as of my search.

---

## Q15. Detector network, observing runs O1–O4, and status as of late 2026 (detection counts, catalogs)

### Takeaway
The network is LIGO Hanford + LIGO Livingston (USA, 4 km), Virgo (Italy) and KAGRA (Japan, 3 km, underground). LIGO-India broke ground in April 2026. The fourth observing run, **O4 (24 May 2023 – 18 Nov 2025)**, was the longest and richest ever. Cataloged totals: GWTC-3 had 90 candidates; GWTC-4.0 (Aug 2025) had 218; **GWTC-5.0 (May 2026) has 390** through Jan 2025, with O4c still to come. **As of late Oct 2026 the detectors are offline for upgrades.** A six-month **Intermediate Run 1 (IR1)** is currently targeted for **mid-January 2027** (slipped from earlier late-2026 plans). O5 timing is "in discussion".

### Cited Findings
- [OBS] **O4 ended 18 Nov 2025** after starting in May 2023, "the longest observing run ever conducted by the global gravitational-wave network". About **250** signals were detected in O4, and about **350** by LIGO, Virgo and KAGRA to date (O4 = over two-thirds of the total). Next: staged upgrades, plus "a new observation campaign … planned to start in late summer or early autumn 2026 and last about six months" (as of Nov 2025). — [Virgo release, 18 Nov 2025](https://www.virgo-gw.eu/news/ligo-virgo-and-kagra-complete-the-richest-observation-run-to-date/)
- [OBS] O4 sub-runs: **O4a 24 May 2023 – 16 Jan 2024** — [GWTC-4.0, arXiv:2508.18082](https://arxiv.org/abs/2508.18082). **O4b 10 Apr 2024 – 28 Jan 2025** (plus 4 days of engineering run) — [GWTC-5.0, arXiv:2605.27225](https://arxiv.org/abs/2605.27225). Only the two LIGOs contributed to O4a (KAGRA briefly observed with insufficient sensitivity); Virgo rejoined in April 2024 for O4b. — [LIGO O4a catalog summary](https://ligo.org/science-summaries/O4a_catalog_omnibus/); [Virgo GWTC-5 release](https://www.virgo-gw.eu/news/the-new-ligo-virgo-kagra-catalog-sets-new-records-in-precision-gravitational-astronomy/)
- [OBS] **Catalogs:**
  - **GWTC-3.0: 90 candidates.**
  - **GWTC-4.0** (Aug 2025): +128 O4a candidates (p_astro ≥ 0.5) → **218 total**; 86 with detailed parameters (FAR < 1/yr).
  - **GWTC-5.0** (26 May 2026): +161 O4b candidates; O4a list updated to 229 → **390 total**; 104 O4b candidates with FAR < 1/yr. O4 (a+b) ≈ 75% of all detections.
  - O4c candidates "will be analyzed and released in a subsequent version of the catalog".
  — [arXiv:2508.18082](https://arxiv.org/abs/2508.18082); [arXiv:2605.27225](https://arxiv.org/abs/2605.27225); [LIGO O4b catalog summary](https://ligo.org/science-summaries/o4b_catalog_omnibus/)
- [OBS] O4a public alerts: 1,697 alerts, of which 82 were highly likely astrophysical with no data-quality issues. — [LIGO O4a catalog summary](https://ligo.org/science-summaries/O4a_catalog_omnibus/)
- [OBS: current status, via search summary] The LVK observing-plans page, **updated 15 Oct 2026**, says IR1 (six months) is planned to start **mid-January 2027**. LIGO and Virgo will participate, potentially starting with two of the three detectors, and KAGRA will join later. The detectors are currently in upgrades and commissioning; short low-noise data windows may still produce public alerts for exceptional events. O5 plans "are in discussion". The June 2026 version had IR1 starting late Oct to mid-Nov 2026. — [LVK observing plans](https://observing.docs.ligo.org/plan/) (page is bot-protected; content via search-engine summary only, not opened directly)
- [OBS] The LIGO Laboratory statement on long-term plans expects O5 to last "until sometime in 2028". This is likely superseded given the IR1 slip. — [LIGO Lab statement](https://www.ligo.caltech.edu/page/ligo-lab-statement-long-term-future-observing-plans) (via search summary)
- [OBS] KAGRA is a **3 km** detector in Kamioka, Japan, hosted by ICRR (Univ. of Tokyo). Virgo is hosted by EGO near Pisa, Italy (~1,000 members). The LSC has >1,600 scientists. — [Virgo GWTC-5 release](https://www.virgo-gw.eu/news/the-new-ligo-virgo-kagra-catalog-sets-new-records-in-precision-gravitational-astronomy/). KAGRA was damaged by the 2024 Noto earthquake and recovered enough to join O4c in 2025. — [Wikipedia: KAGRA](https://en.wikipedia.org/wiki/KAGRA) (via search summary)
- [OBS] LIGO-India broke ground **23 Apr 2026** at Aundha, Hingoli district, Maharashtra, on a ~174-acre site chosen for low seismic noise. It will be an Advanced LIGO-design detector with two 4 km arms, funded by the Government of India. — [LIGO Caltech news](https://www.ligo.caltech.edu/news/ligo20260423) (503 on fetch; via search summary). The foundation stone was laid 11 May 2023, with a schedule to 30 Apr 2030. — [NSF presentation](https://www.nsf.gov/mps/phy/nggw/present_ligo_india.pdf). A March 2026 report cites significant implementation delays despite assurances of completion by 2030. — [Drishti IAS, Mar 2026](https://www.drishtiias.com/daily-updates/daily-news-analysis/ligo-indias-1st-gravitational-wave-observatory/print_manually) (secondary source)

### Inferences
- **How many detections? (be careful in the guide):** counts depend on the threshold.
  - Catalog (p_astro ≥ 0.5): **390 through Jan 2025** (O1–O4b), with O4c (Jan–Nov 2025) not yet cataloged.
  - Press totals: "~300 black-hole mergers" (LIGO, July 2025) and "~350 signals" (Virgo, Nov 2025, counting O4 real-time candidates).
  - Suggested wording: "**roughly 400 candidate signals by 2026, with the full O4 catalog still being completed**", or "about 390 cataloged as of May 2026".
- O4c presumably ran from the end of O4b (28 Jan 2025) to 18 Nov 2025, possibly with breaks. Exact O4c dates and interruptions are not verified.
- The network grows to five sites when LIGO-India operates, then likely ~2030 or later. Its value is better sky localization for multimessenger follow-up.

### Gaps
- O1–O3 dates, from memory and **not verified this session**: O1 12 Sep 2015 – 19 Jan 2016; O2 30 Nov 2016 – 25 Aug 2017; O3a 1 Apr – 1 Oct 2019; O3b 1 Nov 2019 – 27 Mar 2020 (ended early due to COVID-19). Verify before printing.
- Expected date of the full O4 catalog (a LIGO wiki notice reportedly said "by end of 2026"; unverified).
- Virgo arm length (3 km) and GEO600 (600 m, Germany) were not explicitly confirmed in fetched sources.

---

## Q16. Pulsar timing arrays (NANOGrav 15-year, 2023): evidence for a nanohertz GW background

### Takeaway
By timing dozens of millisecond pulsars across the Galaxy for 15 years, NANOGrav found correlated timing wobbles with the Hellings–Downs angular pattern, the fingerprint of a gravitational-wave background at nanohertz frequencies (periods of years). This is strong *evidence* (~3–4σ), not yet a 5σ detection. The most likely source is the population of supermassive black-hole binaries; exotic early-universe sources cannot be excluded.

### Cited Findings
- [OBS] Released **28 Jun 2023** (five ApJL papers). A signal correlated among **67 pulsars** follows the **Hellings–Downs** pattern. The background-plus-power-law model is favored over independent pulsar noise by a Bayes factor >10¹⁴, and over an uncorrelated common process by 200–1000. Significance: p ≈ 10⁻³ (~3σ, Bayesian background) and p = 5×10⁻⁵ to 1.9×10⁻⁴ (~3.5–4σ, frequentist). Characteristic strain amplitude **2.4 (+0.7/−0.6) ×10⁻¹⁵** at f = 1/yr. Consistent with supermassive black-hole binaries, "although more exotic cosmological and astrophysical sources cannot be excluded". — [NANOGrav, arXiv:2306.16213](https://arxiv.org/abs/2306.16213)
- [SPEC] Cosmological models (inflation, phase transitions, cosmic strings, domain walls) can also fit, some with Bayes factors of 10–100 vs SMBH binaries, but "should not be regarded as evidence for new physics". — [NANOGrav, arXiv:2306.16219](https://arxiv.org/abs/2306.16219)
- [OBS] 68 pulsars were timed in the data set; other PTAs in Europe/India, Australia and China reported similar results at the same time. — [NG15 press kit](https://www.astro.umd.edu/~eferrara/PDFs/NG15-PressKit_final_post-embargo_20230720.pdf); [Univ. Hamburg release](https://www.qu.uni-hamburg.de/research/highlights/23-06-29-nanograv.html)

### Inferences
- The "detector" is the Galaxy itself. A GW passing between Earth and a pulsar shifts pulse arrival times by up to tens to hundreds of nanoseconds. The Hellings–Downs curve, the correlation vs angle between pulsar pairs, is what distinguishes GWs from clock or solar-system errors.
- Frequency band: 1/(15 yr) to ~1/(weeks) ⇒ ~nHz–µHz, versus LIGO's ~10 Hz–kHz and LISA's mHz.

### Gaps
- I did not find a 2024–2026 update reaching 5σ (e.g., IPTA DR3 or NANOGrav 20-yr). Its existence and status as of Oct 2026 are unknown to me. Flag as "check before publication".

---

## Q17. Future detectors: LISA, Einstein Telescope, Cosmic Explorer (and LIGO-India)

### Takeaway
- **LISA** (ESA with NASA participation): three spacecraft in a 2.5-million-km triangle trailing Earth, formally adopted 25 Jan 2024, launch targeted **2035** on Ariane 6. It will hear massive black-hole mergers and other mHz sources.
- **Einstein Telescope** (Europe): underground, either a 10 km triangle or two 15 km L's. The site decision is expected **2027** among three candidates.
- **Cosmic Explorer** (US): 40 km + 20 km surface L-shaped detectors, aimed at the mid/late 2030s.

### Cited Findings
- [OBS: programmatic] LISA was selected as ESA's L3 mission on 20 Jun 2017 and **formally adopted 25 Jan 2024**. Each arm is **2.5 million km**, in an equilateral triangle trailing Earth. Launch is planned for **2035 on Ariane 6**; construction started after prime-contractor selection (Jan 2025). Conflict: some 2026 coverage says 2034; NextSpaceFlight lists NET 2037; CNES gives 2037 for final positioning and start of science operations. — [Physics World](https://physicsworld.com/a/european-space-agency-gives-construction-go-ahead-for-lisa-gravitational-wave-mission/); [Wikipedia: LISA](https://en.wikipedia.org/wiki/Laser_Interferometer_Space_Antenna); [CNES](https://cnes.fr/en/projects/lisa) (via search summary)
- [OBS: programmatic] **Einstein Telescope**: three candidate sites, Euregio Meuse-Rhine (BE/NL/DE), Lusatia (Saxony, DE) and Sos Enattos (Sardinia, IT). Bid books are due by end of 2026, with site selection in **2027**. The geometry is still open: a single ~10 km-arm triangle vs two 15 km L-shaped detectors ≥1,200 km apart. A geometry comparison report went to the board (BGR) on 7 Oct 2026, and the Meuse-Rhine office was asked (July 2026) to study an L-configuration in depth. — [Einstein Telescope EMR, 5 Oct 2026](https://www.einsteintelescope-emr.eu/en/2026/10/05/maximising-opportunities-the-einstein-telescope-in-a-triangular-or-l-shaped-configuration/); [ET candidate locations](https://einsteintelescope.eu/about-et/candidate-locations/); [Physics World](https://physicsworld.com/a/physicists-set-to-decide-location-for-next-generation-einstein-telescope/) (via search summary)
- [OBS: programmatic] **Cosmic Explorer**: two US surface L-shaped observatories with **40 km** and **20 km** arms at room temperature (1064 nm). Design work is underway in the 2020s for operations in the 2030s; an AIP report says between **2035 and 2040**. Cost estimates are ~$1 B (40 km) and ~$0.7 B (20 km). The 20 km site targets neutron-star post-merger oscillations at 2–4 kHz, and may be dropped if ET is built (sources differ). — [Cosmic Explorer](https://cosmicexplorer.org/); [AIP FYI](https://www.aip.org/fyi/aggressive-timeline-proposed-for-next-gen-gravitational-wave-detectors); [ET & CE review, arXiv:2505.11033](https://arxiv.org/abs/2505.11033) (via search summary)
- [OBS: programmatic] LIGO-India: see Q15 (groundbreaking Apr 2026; ~2030 target under pressure).

### Inferences
- Everything about LISA, ET and CE science returns is [SPEC/prediction] until they operate. Launch and site dates have slipped historically, so the guide should say "planned" or "targeted".
- Arm length matters because strain is ΔL/L. Longer arms give a bigger ΔL for the same h, hence ET's 10–15 km, CE's 40 km and LISA's 2.5 million km. Going to space escapes seismic noise and opens low (mHz) frequencies.

### Gaps
- LISA's frequency band (commonly ~0.1 mHz–1 Hz) and NASA's role were not verified in fetched text.
- ET's final cost and construction start (often "mid-2030s operations") were not verified.

---

## Q18. What does GW astronomy let scientists investigate? (plus GW misconceptions; observed vs predicted vs speculative ledger)

### Takeaway
GWs are a new sense for the universe. They "hear" dark objects (black-hole binaries) invisible to telescopes. They test GR where gravity is strongest (ringdown spectroscopy, area theorem, speed of gravity). They weigh black holes and expose mass gaps and second-generation mergers. They probe neutron-star matter and heavy-element factories, measure cosmic expansion without a distance ladder, and may one day probe the early universe.

### Cited Findings
- [OBS] Black-hole demographics: masses from ~5 to ~140 M☉; mass-gap objects (GW230529, 2.5–4.5 M☉; GW231123, 137 M☉); hierarchical-merger candidates (GW241011/GW241110). — [arXiv:2404.04248](https://arxiv.org/abs/2404.04248); [arXiv:2507.08219](https://arxiv.org/abs/2507.08219); [arXiv:2510.26931](https://arxiv.org/abs/2510.26931)
- [OBS] Strong-field GR tests: GW250114 is "the most stringent single-event verification of GR and the Kerr nature of black holes to date", and confirms the area law. — [arXiv:2509.08099](https://arxiv.org/abs/2509.08099); [arXiv:2509.08054](https://arxiv.org/abs/2509.08054)
- [OBS] Fundamental physics: speed of gravity = c to ~10⁻¹⁵ (GW170817) — [arXiv:1710.05834](https://arxiv.org/abs/1710.05834). Ultralight bosons of 10⁻¹³–10⁻¹² eV excluded by GW241011's spin — [arXiv:2510.26931](https://arxiv.org/abs/2510.26931). Axion superradiance limits from GW231123 — [arXiv:2507.21788](https://arxiv.org/abs/2507.21788)
- [OBS] Cosmology: standard-siren H₀ = 70 (+12/−8) (2017) → 71.0 (+9/−7) km/s/Mpc (GWTC-5.0, 2026). — [arXiv:1710.05835](https://arxiv.org/abs/1710.05835); [Virgo GWTC-5 release](https://www.virgo-gw.eu/news/the-new-ligo-virgo-kagra-catalog-sets-new-records-in-precision-gravitational-astronomy/)
- [OBS] Nucleosynthesis and GRBs: BNS mergers make short GRBs and r-process elements. — [arXiv:1710.05834](https://arxiv.org/abs/1710.05834); [arXiv:1710.05463](https://arxiv.org/abs/1710.05463)
- [OBS/SPEC] Supermassive-black-hole-binary population (or exotic early-universe sources) via PTAs. — [arXiv:2306.16213](https://arxiv.org/abs/2306.16213); [arXiv:2306.16219](https://arxiv.org/abs/2306.16219)

### Inferences
- **Ledger for the guide:**
  - **(a) GR predictions confirmed by observation:** GW existence and speed (c), the + and × pattern (consistent with all data), inspiral-merger-ringdown waveforms, the area theorem, Kerr ringdown, binary-pulsar decay, S2 redshift and precession, shadow size, frame dragging (Earth).
  - **(b) Directly observed objects and events:** ~390 cataloged compact-binary mergers; Cyg X-1; Sgr A* stellar orbits; EHT rings of M87* and Sgr A*; GW170817 + GRB + kilonova; nHz background *evidence* (3–4σ).
  - **(c) Unobserved predictions or speculation:** Hawking radiation; primordial black holes; what happens at or replaces the singularity; naked singularities; wormholes and white holes (Kerr interior analytic extensions); information paradox resolutions; cosmological origin of the PTA background; detailed jet-launching mechanism; formation channel of GW231123.
- **GW misconceptions:**
  - "Gravity waves" in fluids are a different phenomenon; physicists say *gravitational* waves.
  - The LIGO "chirp" sound is a sonification, not sound traveling through space.
  - GWs passing Earth are utterly harmless: h ~ 10⁻²¹ stretches a 1 m object by ~10⁻²¹ m.
  - LIGO does not "see" black holes; it measures spacetime strain, and parameters are inferred by matching GR waveforms.
  - Binary-pulsar evidence (1974–) was indirect; 2015 was the first direct detection.

### Gaps
- No fetched source this session ranked "what GW astronomy can investigate" officially (e.g., an LVK science-goals page). The list above is assembled from individual results.
