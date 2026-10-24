# General Relativistic Cosmology and the Experimental Evidence for General Relativity (state of the field, October 2026)

Notes for Ch. 8 "General Relativity and the Universe" and Ch. 9 "Experimental Evidence and Real-World Applications". Audience: first-year university student (Calculus I–II, intro Newtonian physics).

Labels used on every finding:
- **[VERIFIED]** = experimentally or observationally established result.
- **[MODEL]** = theoretical prediction, framework, or interpretation within a model (may be extremely well supported, but it is a model statement).
- **[OPEN]** = unresolved question / active dispute.
- **(checked)** = number or claim confirmed against a source opened or searched during this research session (Oct 2026).
- **(ref)** = standard literature value cited to its primary paper; I did not re-open that paper in this session. These are well-known values, but the writer may want to spot-check them.
- Arithmetic marked "(computed)" was done by me from the stated formula and constants (G = 6.674×10⁻¹¹ m³ kg⁻¹ s⁻², c = 2.998×10⁸ m/s, M☉ = 1.989×10³⁰ kg, R☉ = 6.957×10⁸ m, 1 Mpc = 3.086×10²² m ≈ 3.26 million light-years).

---

## Q1. Cosmological principle; Einstein's 1917 static universe, Λ, and the "biggest blunder" story

### Takeaway
Modern cosmology rests on the assumption that, on scales above a few hundred million light-years, the universe is the same everywhere (homogeneous) and in every direction (isotropic). Einstein's 1917 model applied GR to the whole universe but added a cosmological constant Λ to keep it static. The "biggest blunder" quote comes only via George Gamow, and historians disagree about whether Einstein actually said it.

### Cited Findings
- [MODEL] **Cosmological principle**: on large scales the universe is *homogeneous* (same density/properties at every location) and *isotropic* (looks the same in every direction). It is an assumption that makes Einstein's equations solvable for the whole universe. It is supported by the near-uniformity of the CMB (temperature the same in all directions to about 1 part in 10⁵) and by galaxy surveys. — [Planck 2018 results VI, arXiv:1807.06209](https://arxiv.org/abs/1807.06209) (ref); [Davis & Lineweaver 2004, "Expanding Confusion", arXiv:astro-ph/0310808](https://arxiv.org/abs/astro-ph/0310808) (ref)
- [VERIFIED-history] Einstein, "Kosmologische Betrachtungen zur allgemeinen Relativitätstheorie" (Sitzungsberichte der Preussischen Akademie der Wissenschaften, Feb 1917). He added a term Λg_μν to his field equations so that a static, closed (finite but unbounded) universe was a solution. — [O'Raifeartaigh & Mitton 2018, "Interrogating the legend of Einstein's 'biggest blunder'", arXiv:1804.06768](https://arxiv.org/abs/1804.06768) (ref)
- [MODEL] Einstein's static solution is **unstable**: a slight expansion lowers the density, which lets Λ's repulsion win and makes the expansion run away; a slight contraction does the opposite. (Eddington, 1930.) — [O'Raifeartaigh & Mitton 2018](https://arxiv.org/abs/1804.06768) (ref)
- [OPEN-history] The "biggest blunder" remark is known only secondhand, from George Gamow (*My World Line*, 1970; also a 1956 Scientific American article). Mario Livio (*Brilliant Blunders*, 2013) argued Gamow probably made it up. O'Raifeartaigh & Mitton (2018) found supporting testimony (e.g., from Ralph Alpher and John Wheeler) and argued Einstein probably did regard Λ as a mistake and may well have used the phrase. Safe wording: "reportedly, according to Gamow; the quote's authenticity is debated." — [O'Raifeartaigh & Mitton 2018](https://arxiv.org/abs/1804.06768) (ref)
- [VERIFIED] Λ returned in 1998 as the simplest explanation of the accelerating expansion (see Q7). — [Nobel Prize in Physics 2011, summary](https://www.nobelprize.org/prizes/physics/2011/summary/) (ref)

### Inferences
- Teaching point: Λ was not removed from cosmology because it was wrong. It was set to zero because there was no evidence for it, and it came back when evidence appeared. The "blunder" story is best told as "a missed prediction": Einstein could have predicted an expanding universe in 1917.

### Gaps
- I did not open Einstein's 1917 paper or Gamow's book directly in this session.

---

## Q2. The discovery of expansion: Friedmann, Lemaître, Hubble, and the Hubble–Lemaître law

### Takeaway
Friedmann (1922, 1924) found expanding and contracting solutions of Einstein's equations. Lemaître (1927) linked expansion to the observed redshifts of galaxies and derived v ∝ d. Hubble (1929) published the observational velocity–distance relation. Since 2018 the IAU has recommended the name "Hubble–Lemaître law".

### Cited Findings
- [MODEL-history] Alexander Friedmann, Z. Phys. 10, 377 (1922): positively curved, non-static solutions. Friedmann, Z. Phys. 21, 326 (1924): negatively curved solutions. — [O'Raifeartaigh & Mitton 2018](https://arxiv.org/abs/1804.06768) (ref)
- [MODEL-history] Georges Lemaître (1927, Annales de la Société Scientifique de Bruxelles) independently derived expanding solutions, connected them to galaxy redshifts, and estimated an expansion rate of order 600 km/s/Mpc. Hubble (1929, PNAS 15, 168) published a velocity–distance relation with ~500 km/s/Mpc. Both were ~7× too large, mainly because of errors in distance calibration. — [Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808) (ref); [Hubble tension decade review, Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) (checked, general context)
- [VERIFIED-history] In 2018 the IAU membership voted (electronic ballot, ~78% in favour) to recommend renaming the Hubble law the "Hubble–Lemaître law". — [IAU press release iau1812](https://www.iau.org/news/pressreleases/detail/iau1812/) (ref)
- [VERIFIED/MODEL] **Hubble–Lemaître law: v = H₀ d**
  - v = recession velocity of a distant galaxy (km/s), inferred from its redshift;
  - d = its *proper* distance today (Mpc);
  - H₀ = Hubble constant, the present-day expansion rate (km/s/Mpc). Today's measured values are ≈ 67–73 km/s/Mpc (see Q8).
  - The law holds exactly for proper distance and recession velocity in an FLRW universe. As an *observed* redshift–distance relation it is linear only for nearby galaxies (z ≪ 1). — [Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808) (ref)
- [MODEL] Hubble time 1/H₀ ≈ 977.8/H₀ Gyr (H₀ in km/s/Mpc): 14.5 Gyr for H₀ = 67.4 and 13.4 Gyr for H₀ = 73.0. (computed) It sets the rough age scale. The actual age (13.8 Gyr) depends on how expansion changed over time.

### Inferences
- A 30-second derivation for students: if every distance scales as d(t) = a(t)·χ (χ fixed "comoving" separation), then v = dd/dt = ȧχ = (ȧ/a)·d. So uniform expansion *automatically* gives v ∝ d, with H = ȧ/a. Every observer sees the same law, so no galaxy is the "center".

### Gaps
- The exact value of Lemaître's 1927 estimate is quoted variously as 575 or 625 km/s/Mpc. I did not verify which, so I wrote "of order 600".

---

## Q3. The scale factor, FLRW metric, and the Friedmann equations (every symbol defined)

### Takeaway
Under the cosmological principle, GR reduces to one function, the scale factor a(t), which obeys the Friedmann equations. These say that the expansion rate is set by density and curvature, and that pressure gravitates, so negative pressure (dark energy) makes the expansion accelerate.

### Cited Findings
- [MODEL] **Scale factor a(t)**: dimensionless; it multiplies all large-scale distances. By convention a(today) = a₀ = 1. a = 0.5 means "when the universe was half its present linear size". Proper distance d(t) = a(t)χ, where χ = comoving distance (fixed for galaxies moving only with the expansion). — [Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808) (ref)
- [MODEL] **FLRW metric** (Friedmann–Lemaître–Robertson–Walker), simple form:
  ds² = −c²dt² + a(t)² [ dr²/(1 − k r²) + r²(dθ² + sin²θ dφ²) ]
  - ds = spacetime interval between two nearby events;
  - t = cosmic time (proper time of observers moving with the expansion);
  - c = speed of light;
  - r, θ, φ = comoving spherical coordinates (r dimensionless here);
  - k = spatial curvature: +1 closed (like a 3-sphere), 0 flat, −1 open (saddle-like). In this convention a carries units of length.
  - Beginner version for a flat universe: ds² = −c²dt² + a(t)²(dx² + dy² + dz²). Space is ordinary Euclidean space whose rulers all stretch by a(t). — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref; standard textbook form, e.g., Ryden *Introduction to Cosmology* ch. 3)
- [MODEL] **First Friedmann equation**:
  H² ≡ (ȧ/a)² = (8πG/3) ρ − k c²/a² + Λc²/3
  - H = ȧ/a = Hubble parameter at time t (H at today = H₀);
  - ȧ = da/dt;
  - G = Newton's gravitational constant, 6.674×10⁻¹¹ m³ kg⁻¹ s⁻²;
  - ρ = total mass-equivalent density of matter plus radiation (energy density ε divided by c²);
  - k = curvature constant (units of 1/length² if a is dimensionless with a₀ = 1; the sign is what matters);
  - c = speed of light;
  - Λ = cosmological constant (units of 1/length²). Writing Λ as a density gives ρ_Λ = Λc²/(8πG).
  - Newtonian analogy for students: it has the form of an energy equation for a test mass on the edge of an expanding sphere, (kinetic) − (potential) = constant. The curvature term plays the role of total energy. (Ryden ch. 4; ref)
- [MODEL] **Critical density** ρ_c = 3H²/(8πG), the density for which k = 0 (flat) when Λ = 0. For H₀ = 67.4 km/s/Mpc, ρ_c ≈ 8.5×10⁻²⁷ kg/m³, about 5 hydrogen atoms per cubic metre (computed). **Density parameters**: Ω_i = ρ_i/ρ_c. Today Ω_m + Ω_r + Ω_Λ + Ω_k = 1, where Ω_k = −kc²/(a₀²H₀²).
- [VERIFIED] Measured spatial curvature is consistent with flat: Ω_K = 0.001 ± 0.002 (Planck 2018 + BAO). — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref)
- [MODEL] **Second Friedmann (acceleration) equation**:
  ä/a = −(4πG/3)(ρ + 3p/c²) + Λc²/3
  - ä = d²a/dt² (positive means accelerating expansion);
  - p = pressure of the cosmic contents.
  - Key conceptual point: in GR **pressure gravitates** as well as mass-energy (the combination ρ + 3p/c²). Ordinary matter (p ≈ 0) and radiation (p = ρc²/3) both decelerate the expansion. A substance with p < −ρc²/3 (equation-of-state parameter w ≡ p/(ρc²) < −1/3) accelerates it. A cosmological constant has w = −1 exactly (p = −ρc²): its "negative pressure" produces repulsion. — [Carroll 2001, "The Cosmological Constant", Living Rev. Rel., arXiv:astro-ph/0004075](https://arxiv.org/abs/astro-ph/0004075) (ref)
- [MODEL] How densities dilute: matter ρ_m ∝ a⁻³ (volume grows as a³); radiation ρ_r ∝ a⁻⁴ (number dilutes as a⁻³ and each photon is also redshifted, a⁻¹); Λ: ρ_Λ = constant. So radiation dominated early, then matter, and Λ dominates now (matter–Λ equality at z ≈ 0.3). — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref)
- [MODEL] Dark-energy parametrisation used by DESI/DES (the "CPL" form): **w(a) = w₀ + w_a(1 − a)**. w₀ = equation of state today; w_a = how fast it changes. ΛCDM is w₀ = −1, w_a = 0. — [DES Collaboration 2026, arXiv:2605.27221](https://arxiv.org/abs/2605.27221) (checked)

### Inferences
- For a beginner chapter, the key logic chain is: cosmological principle → one function a(t) → Friedmann equation (expansion rate vs. contents) → acceleration equation (what makes it speed up or slow down). Every symbol above can be given in a table.

### Gaps
- None material. Sign/unit conventions for k vary between textbooks (Ryden uses κ and R₀), so the writer should pick one convention and state it.

---

## Q4. Cosmological redshift, "expanding space", "expanding into what?", and faster-than-light recession

### Takeaway
Cosmological redshift measures how much the universe has stretched since light was emitted, 1 + z = a_now/a_then. It is not a simple Doppler shift. Distant galaxies can recede faster than light without violating relativity, and the expansion is not "into" anything.

### Cited Findings
- [MODEL] **1 + z = λ_obs/λ_emit = a(t_obs)/a(t_emit)**, where λ_obs and λ_emit are the observed and emitted wavelengths and z is the redshift. Example: z = 1 means the universe has doubled in linear size since emission. The CMB comes from z ≈ 1090 (Planck: z* ≈ 1089.9), so it has stretched ~1090-fold, and its temperature has dropped by the same factor (T ∝ 1/a), from ~3000 K to 2.725 K. — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref)
- [MODEL] Cosmological redshift is not the special-relativistic Doppler formula. Using v = cz or the SR Doppler formula for distant galaxies gives wrong velocities. The redshift is set by the ratio of scale factors, not by velocity at emission. — [Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808) (ref)
- [MODEL] Caution on "space is expanding" language: it is a useful description in FLRW coordinates, but space is not a substance that drags things. Bound systems (atoms, the Solar System, the Milky Way, the Local Group) do **not** expand. Some relativists note that the redshift can equally be described as an accumulation of infinitesimal Doppler shifts between neighbouring observers along the light path. Both are coordinate-dependent descriptions of the same GR prediction. — [Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808) (ref)
- [MODEL] Expansion is not "into" anything. The FLRW model describes the intrinsic geometry of space (distances between comoving points grow). No outside or edge is required, and the Big Bang happened everywhere, not at a point. — [Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808) (ref)
- [MODEL] Faster-than-light recession: the **Hubble sphere** radius c/H₀ ≈ 4,450 Mpc ≈ 14.5 billion light-years (H₀ = 67.4; computed). Galaxies beyond it have recession velocities v = H₀d > c today. In standard ΛCDM, galaxies at redshift z ≳ 1.5 are receding faster than light today, and we still see many of them. This does not violate relativity: the speed limit applies to *local* motion through space, i.e., to objects passing each other at the same place. The observable universe's radius is ≈ 46 billion light-years (comoving), larger than 13.8 billion light-years because of expansion during light's journey. — [Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808) (ref; they quote z ≈ 1.46 for their adopted cosmology)

### Inferences
- A good "misconception box" for Ch. 8: (1) the Big Bang was not an explosion at a point; (2) the universe does not expand into anything; (3) recession faster than light is allowed; (4) you, your house and the Galaxy are not expanding; (5) 13.8 billion years ≠ a 13.8 billion light-year radius.

### Gaps
- The exact redshift for "recession speed = c today" depends on the cosmological parameters (≈1.4–1.6). I did not recompute it for Planck 2018 parameters.

---

## Q5. The Big Bang model: evidence, the "singularity", inflation, and the age of the universe

### Takeaway
"Big Bang" means the universe evolved from a hot, dense, nearly uniform early state. It is supported by four independent pillars: Hubble expansion, the CMB, light-element abundances, and large-scale structure. The t = 0 "singularity" is where the classical model breaks down, not an observed event. Inflation is a widely used extension that fits the data but is not confirmed. Age ≈ 13.8 Gyr.

### Cited Findings
- [VERIFIED] **CMB discovery**: Arno Penzias and Robert Wilson (Bell Labs) reported an isotropic "excess antenna temperature" of ~3.5 ± 1.0 K at 4080 MHz (ApJ 142, 419, 1965). Dicke, Peebles, Roll and Wilkinson interpreted it as Big Bang relic radiation in a companion paper. Penzias and Wilson received the 1978 Nobel Prize. — [Nobel Prize in Physics 1978](https://www.nobelprize.org/prizes/physics/1978/summary/) (ref)
- [VERIFIED] **CMB temperature today: T₀ = 2.72548 ± 0.00057 K** (Fixsen 2009, from COBE/FIRAS). The spectrum is the most perfect blackbody measured in nature. COBE's Mather and Smoot received the 2006 Nobel Prize for its blackbody form and anisotropy. — [Fixsen 2009, ApJ 707, 916, arXiv:0911.1955](https://arxiv.org/abs/0911.1955) (ref)
- [VERIFIED/MODEL] **Big Bang nucleosynthesis (BBN)**: in the first ~3–20 minutes, nuclear reactions produced about 24.5% helium-4 by mass, deuterium D/H ≈ 2.5×10⁻⁵, some helium-3 and traces of lithium-7. The predicted D and ⁴He agree with observations, using a baryon density that independently matches the CMB value. **Open problem**: the predicted ⁷Li is ~3× higher than observed in old halo stars (the "lithium problem"). — [Particle Data Group, Big-Bang Nucleosynthesis review](https://pdg.lbl.gov/2024/reviews/rpp2024-rev-bbang-nucleosynthesis.pdf) (ref)
- [VERIFIED] Large-scale structure and BAO (see Q10) and Hubble expansion (Q2) are the other pillars. — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref)
- [VERIFIED (model-dependent)] **Age of universe: 13.787 ± 0.020 Gyr** (Planck 2018, assuming ΛCDM). Independent lower limits from the oldest stars and globular clusters (~12–13+ Gyr) are consistent. — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref)
- [MODEL] **The singularity**: running the Friedmann equations backward gives a → 0 and infinite density at a finite time in the past. The Hawking–Penrose singularity theorems (1965–1970) show that classical GR plus reasonable energy conditions forces this. But at densities near the Planck scale (~10⁹⁶ kg/m³; t ~ 10⁻⁴³ s) quantum gravity effects are expected, and GR is not trusted there. So "t = 0" marks the limit of the model's validity, not an established event. Correct wording: "the hot Big Bang model describes the universe from a fraction of a second onward; what happened 'at' t = 0, or whether there was a t = 0, is unknown." — [Carroll 2001](https://arxiv.org/abs/astro-ph/0004075) (ref)
- [MODEL / OPEN] **Inflation** (Starobinsky 1980; Guth 1981; Linde 1982; Albrecht & Steinhardt 1982): a brief period of accelerated expansion before the hot Big Bang. It was proposed to explain the flatness and horizon problems and to seed structure from quantum fluctuations. Successes consistent with inflation: nearly flat geometry; nearly scale-invariant primordial fluctuations with spectral index n_s = 0.965 ± 0.004 (slightly below 1, as most inflation models predict); Gaussian, adiabatic fluctuations. Its "smoking gun", primordial gravitational waves (B-mode polarization), has **not** been detected: tensor-to-scalar ratio r < 0.036 (95%, BICEP/Keck 2021). Inflation is widely used but unconfirmed; alternatives (bouncing/cyclic models) are minority views. — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref); [BICEP/Keck 2021, PRL 127, 151301, arXiv:2110.00483](https://arxiv.org/abs/2110.00483) (ref)

### Inferences
- The strength of the Big Bang model is that independent probes (CMB physics at ~380,000 yr, nuclear physics at ~3 min, galaxy distances today) give the same baryon density and expansion history. That cross-agreement is the teaching point, more than any single measurement.

### Gaps
- I did not check whether any 2025–2026 CMB results (ACT DR6, SPT-3G, Simons Observatory early data) tightened r below 0.036. The writer should keep "r < 0.036 (2021)" or verify a newer bound.

---

## Q6. Composition of the universe and the evidence for dark matter

### Takeaway
In ΛCDM (Planck 2018), today's energy budget is ~5% ordinary (baryonic) matter, ~27% dark matter and ~68% dark energy. Dark matter is inferred from gravity alone, in many independent ways. Its particle nature is unknown, and it has not been directly detected.

### Cited Findings
- [VERIFIED (model-fit)] **Planck 2018 (TT,TE,EE+lowE+lensing+BAO) values**: H₀ = 67.66 ± 0.42 km/s/Mpc (67.4 ± 0.5 without BAO); Ω_m = 0.311 ± 0.006 (0.315 ± 0.007 without BAO); Ω_b h² = 0.0224 ± 0.0001; Ω_c h² = 0.120 ± 0.001; Ω_Λ ≈ 0.685–0.69. With h = H₀/100, this gives baryons ≈ 4.9%, cold dark matter ≈ 26.5%, dark energy ≈ 68.5%. Neutrinos and photons are <1%. — [Planck 2018 VI, arXiv:1807.06209](https://arxiv.org/abs/1807.06209) (ref); Planck H₀ values also quoted in [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) (checked: 67.27 ± 0.60 TT,TE,EE+lowE+lensing; 67.66 ± 0.42 with BAO)
- [VERIFIED] **Galaxy clusters (Zwicky 1933)**: galaxy velocities in the Coma cluster were far too high for the cluster to be bound by its visible mass. He called the missing component "dunkle Materie". — [Helvetica Physica Acta 6, 110 (1933), via ADS](https://ui.adsabs.harvard.edu/abs/1933AcHPh...6..110Z) (ref)
- [VERIFIED] **Rotation curves (Vera Rubin & Kent Ford, 1970 Andromeda; Rubin, Ford & Thonnard 1978–1980)**: stars and gas orbit at roughly constant speed far beyond where the visible light ends ("flat rotation curves"). Newtonian gravity with only visible mass predicts v ∝ 1/√r there. Radio 21-cm HI data (e.g., Bosma, Roberts) showed the same. — [Rubin, Ford & Thonnard 1980, ApJ 238, 471, via ADS](https://ui.adsabs.harvard.edu/abs/1980ApJ...238..471R) (ref)
- [VERIFIED] **Bullet Cluster (1E 0657−56)**: two clusters collided. The X-ray-emitting hot gas (most of the ordinary mass) was slowed and sits between the two groups of galaxies, but the weak-lensing mass map peaks on the galaxies. The offset of total mass from ordinary mass is detected at 8σ (Clowe et al. 2006, "A direct empirical proof of the existence of dark matter"). This is hard to explain with modified gravity alone. — [Clowe et al. 2006, ApJ 648, L109, arXiv:astro-ph/0608407](https://arxiv.org/abs/astro-ph/0608407) (ref)
- [VERIFIED] **CMB acoustic peaks**: the relative heights of the peaks require a non-baryonic, pressureless matter component (Ω_c h² = 0.120 ± 0.001) about 5× the baryon density. — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref)
- [VERIFIED] **Gravitational lensing** (strong and weak) of clusters and the cosmic web maps mass directly and finds far more than the visible mass (see Q18, Q21). — [Clowe et al. 2006](https://arxiv.org/abs/astro-ph/0608407) (ref)
- [OPEN] Dark matter particle identity unknown (WIMPs, axions, sterile neutrinos, primordial black holes, …). No confirmed direct detection in underground experiments. Modified-gravity alternatives (e.g., MOND) fit galaxy rotation curves well but struggle with clusters, the Bullet Cluster and the CMB. — [PDG Dark Matter review](https://pdg.lbl.gov/2024/reviews/rpp2024-rev-dark-matter.pdf) (ref)

### Inferences
- Pedagogically: "we are 5%" is a ΛCDM model-fit result. The *existence* of extra gravitating mass is observationally robust (many independent lines); its *nature* is open.

### Gaps
- I did not check 2025–2026 direct-detection results (LZ, XENONnT, PandaX). I am not aware of any claimed detection, but I did not verify this in this session.

---

## Q7. Dark energy: 1998 discovery and the cosmological constant problem

### Takeaway
In 1998–99 two teams found that distant Type Ia supernovae are fainter than expected, meaning the expansion is accelerating (2011 Nobel Prize). The simplest explanation, a cosmological constant/vacuum energy, is ~10¹²⁰ times smaller than naive quantum field theory estimates. That is the cosmological constant problem, one of the deepest open problems in physics.

### Cited Findings
- [VERIFIED] **Discovery**: High-z Supernova Search Team (Riess et al. 1998, AJ 116, 1009) and Supernova Cosmology Project (Perlmutter et al. 1999, ApJ 517, 565). Type Ia supernovae are "standardisable candles": their peak brightness can be calibrated from their light-curve shape. — [Riess et al. 1998, arXiv:astro-ph/9805201](https://arxiv.org/abs/astro-ph/9805201) (ref); [Perlmutter et al. 1999, arXiv:astro-ph/9812133](https://arxiv.org/abs/astro-ph/9812133) (ref)
- [VERIFIED] **Nobel Prize in Physics 2011**: one half to Saul Perlmutter, the other half jointly to Brian P. Schmidt and Adam G. Riess, "for the discovery of the accelerating expansion of the Universe through observations of distant supernovae". — [nobelprize.org 2011](https://www.nobelprize.org/prizes/physics/2011/summary/) (ref)
- [VERIFIED] Acceleration is now confirmed independently of supernovae (CMB + BAO + lensing require Ω_Λ ≈ 0.7 in a flat universe). — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref)
- [MODEL] Observed dark-energy density ρ_Λ ≈ 0.685 ρ_c ≈ 5.8×10⁻²⁷ kg/m³ ≈ 5×10⁻¹⁰ J/m³ (computed from Planck values).
- [OPEN] **Cosmological constant problem**: quantum field theory predicts that empty space has a zero-point (vacuum) energy that gravitates like Λ. Summing zero-point energies up to the Planck scale gives a vacuum energy ~10¹²⁰ times the observed value, "the worst theoretical prediction in the history of physics". The precise number depends on the assumed cutoff and on the method: with a TeV-scale cutoff the mismatch is ~10⁶⁰, and careful regularisation gives ~10⁵⁵. So the honest statement is "between ~50 and ~120 orders of magnitude, depending on assumptions; no accepted explanation". A second puzzle is the "coincidence problem": why ρ_Λ and ρ_matter are comparable *now*. — [Carroll 2001, Living Rev. Rel. 4, 1, arXiv:astro-ph/0004075](https://arxiv.org/abs/astro-ph/0004075) (ref); [Martin 2012, "Everything you always wanted to know about the cosmological constant problem", arXiv:1205.3365](https://arxiv.org/abs/1205.3365) (ref)

### Inferences
- Present 10¹²⁰ as "a famous estimate", not a precise prediction. The robust statement is that naive QFT gives an absurdly large number and nobody knows why the observed value is so small.

### Gaps
- None for the 1998 discovery. Whether dark energy is truly constant is now an active question (Q9).

---

## Q8. The Hubble tension (status as of mid/late 2026)

### Takeaway
Early-universe (CMB, BAO+BBN) inferences give H₀ ≈ 67–68 km/s/Mpc. The SH0ES Cepheid–supernova distance ladder gives ≈ 73. The difference is ~5σ (some combinations claim 6–7σ). JWST has confirmed that SH0ES's Hubble Cepheid photometry was not biased by crowding. However, the CCHP team's JWST red-giant-based distances give ~70 (68.8 JWST-only), and the two groups dispute each other's analyses. As of October 2026 the tension is unresolved, and a June 2026 review calls it "likely a real crisis".

### Cited Findings
- [VERIFIED] **Early-universe values**: Planck 2018 67.27 ± 0.60 (67.66 ± 0.42 with BAO); ACT 68.3 ± 1.1 (DR6 lensing + BAO + BBN prior); SPT-3G 66.81 ± 0.81 (66.66 ± 0.60 with lensing); Planck+ACT+SPT combined 67.19 ± 0.38; BAO+BBN (no CMB) ≈ 67.4–68.6. — [Cai & Wang, "The Hubble tension: A decade review", arXiv:2606.20434 (18 Jun 2026)](https://arxiv.org/html/2606.20434v1) (checked)
- [VERIFIED] **Late-universe distance ladder**: SH0ES 73.04 ± 1.04 (Riess et al. 2022); SH0ES with JWST Cepheids 73.49 ± 0.93; SH0ES combined HST+JWST Cepheid+TRGB 73.18 ± 0.88 ("almost 6σ" from Planck); "H0DN" Local Distance Network 73.50 ± 0.81 (7.1σ vs flat ΛCDM+CMB, 5.0σ vs BBN+BAO). — [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) (checked)
- [VERIFIED] **JWST check of crowding**: JWST Cepheid observations reject unrecognised crowding errors in HST Cepheid photometry at 7–8σ. — [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) (checked; primary: Riess et al. 2024, ApJL 962, L17)
- [OPEN] **CCHP (Freedman et al.)**: combined HST+JWST tip-of-the-red-giant-branch (TRGB) value H₀ = 70.39 ± 1.22 (stat) ± 1.33 (sys) ± 0.70 (σ_SN). JWST-only TRGB 68.81 ± 1.79 (stat) ± 1.32 (sys); JAGB (J-region asymptotic giant branch) ≈ 67.8. CCHP says this is consistent with ΛCDM. SH0ES counters that sample selection (variations of order 2.5 km/s/Mpc) explains the lower TRGB/JAGB values, and its own TRGB analysis gives 72.1–73.3 ± 1.8. — [Freedman et al. 2025, ApJ, "Status Report on the CCHP"](https://iopscience.iop.org/article/10.3847/1538-4357/adce78) (checked via search summary); [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) (checked)
- [VERIFIED/OPEN] **Independent methods** (larger error bars): TDCOSMO time-delay lensing 2025: 71.6 (+3.9/−3.3), and 74.3 (+3.1/−3.7) with SLACS+SL2S lenses; megamasers 73.9 ± 3.0; lensed supernovae Refsdal ≈ 66.6 (+4.1/−3.3) and H0pe 75.4 (+8.1/−5.5); gravitational-wave "standard sirens": GW170817 alone 70 (+12/−8), and dark sirens GWTC-4 + GW170817 69.9 ± 4.1. — [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) (checked)
- [OPEN] **Interpretations**: (a) unknown systematics in the distance ladder; (b) new physics before recombination (e.g., "early dark energy") that shrinks the sound horizon; (c) late-time modifications or interacting dark energy. Cai & Wang (2026) argue local-void explanations are ruled out and favour correlated early-and-late modifications. ACT DR6 and SPT-3G polarisation data constrain early-dark-energy models. — [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) (checked); [Physics World, "Cosmic conflict continues"](https://physicsworld.com/a/cosmic-conflict-continues-new-data-fuel-the-hubble-tension-debate/) (search result, not opened)

### Inferences
- For a beginner text: "Two good methods disagree: ~67 (inferred from the early universe assuming ΛCDM) versus ~73 (measured directly nearby). Either one method has a hidden error, or ΛCDM is missing something. As of 2026 there is no consensus." Note the asymmetry: the "early" values are *model-dependent inferences*, while the ladder is a *direct* measurement.
- The CCHP–SH0ES dispute means it is fair to say "most, but not all, local measurements give ~73".

### Gaps
- I did not open the latest SH0ES primary paper (2025/2026) directly. The SH0ES values here come via the June 2026 review. No 2026 consensus resolution was found.

---

## Q9. DESI (2024, 2025, 2026), DES, and the "evolving dark energy" hint; Euclid status

### Takeaway
DESI's baryon-acoustic-oscillation (BAO) maps, combined with the CMB and supernovae, prefer dark energy that weakens with time (w₀ > −1, w_a < 0) over a pure cosmological constant. The significance is 2.8–4.2σ in DR2 (March 2025), depending on the supernova sample. Supernova recalibrations in late 2025–2026 lowered the strongest combination from 4.2σ to ~3.2σ. DES's full-survey analysis (May 2026) found ~3.0σ. A July 2026 DESI Lyman-α full-shape result moved *toward* ΛCDM. No combination has reached the 5σ discovery threshold, so this remains an open hint, not a discovery. Euclid's first big data release (DR1) is split: imaging/catalogues in November 2026, cosmology-grade products in mid-2027.

### Cited Findings
- [VERIFIED-observation / OPEN-interpretation] **DESI DR1 (released 4 April 2024)**: w₀w_a preferred over ΛCDM at 2.5σ, 3.5σ and 3.9σ when DESI BAO + CMB are combined with the Pantheon+, Union3 or DES-Y5 supernovae respectively. — [DESI 2024 VI, arXiv:2404.03002](https://arxiv.org/abs/2404.03002) (ref)
- [VERIFIED-observation / OPEN-interpretation] **DESI DR2 BAO (submitted 18 March 2025; v3 Oct 2025)**: DESI BAO + CMB alone prefer w₀w_a at **3.1σ**. Adding supernovae gives **2.8σ (Pantheon+), 3.8σ (Union3), 4.2σ (DES-Y5)**. Mild 2.3σ tension between BAO-preferred and CMB-preferred ΛCDM parameters. Neutrino mass Σm_ν < 0.064 eV (95%, ΛCDM) or < 0.16 eV (w₀w_a). DR2 is based on the first three years of data, >14 million galaxies and quasars. — [DESI DR2 Results II, arXiv:2503.14738](https://arxiv.org/abs/2503.14738) (checked)
- [OPEN] Statistical critique: Cortês & Liddle argue one cannot pick among or average the three SN-dependent significances, and that the most secure DR2 number is the 3.1σ DESI+CMB exclusion of ΛCDM. — [Cortês & Liddle, arXiv:2504.15336](https://arxiv.org/html/2504.15336v3) (checked via search summary)
- [VERIFIED] **DES supernova recalibration ("DES-Dovekie", Nov 2025)**: improved photometric cross-calibration, new white-dwarf standards, retrained SALT3 light-curve model, and a fix to a host-galaxy colour approximation. With CMB (Planck+ACT+SPT) + DESI DR2 BAO it gives w₀ = −0.803 ± 0.054, w_a = −0.72 ± 0.21, a **3.2σ** preference (down from 4.2σ), which the authors call "weak", roughly 5:1 Bayesian odds. Reanalysed Pantheon+ and Union3.1 reportedly give similar ~3.2σ and ~3.4σ. — [DES-Dovekie, arXiv:2511.07517](https://arxiv.org/abs/2511.07517v2) (checked via search summary); [DES Collaboration 2026, arXiv:2605.27221](https://arxiv.org/abs/2605.27221) (the Pantheon+/Union3.1 figures came from a search summary, not the abstract I read)
- [VERIFIED] **DES full-survey multi-probe analysis (submitted 26 May 2026)**: SN + BAO + 3×2pt weak lensing/clustering, DES only: w₀ = −0.84 ± 0.10, w_a = −0.44 (+0.60/−0.55), **2.2σ**. DES + DESI DR2 BAO: **2.3σ**. DES + primary CMB: w₀ = −0.82 ± 0.05, w_a = −0.63 (+0.21/−0.18), **3.0σ**. Excluding supernovae: 2.6σ. Best fits consistently have w₀ > −1 and w_a < 0. The authors describe this as "a weak preference for evolving dark energy". — [DES Collaboration, arXiv:2605.27221](https://arxiv.org/abs/2605.27221) (checked)
- [VERIFIED] **DESI DR2 Lyman-α full-shape (Alcock–Paczyński) result, 30 July 2026**: the tightest Lyα cosmological constraints to date. The central value shifts toward ΛCDM with substantially smaller uncertainty. DESI's own release says this "could indicate that the current hints of evolving dark energy may fade away", or that a more complex model is needed. The release gives no updated σ value. — [DESI news, 30 Jul 2026](https://www.desi.lbl.gov/2026/07/30/new-desi-dr2-lyman-alpha-results-shed-light-on-dark-energy/) (checked)
- [VERIFIED] DESI survey status: an April 2026 DESI release reports a mapping milestone. Per a search summary, the survey is extended through 2028 with ~20% more sky area. — [DESI news, 15 Apr 2026](https://www.desi.lbl.gov/2026/04/15/desi-reaches-mapping-milestone-surpassing-expectations/) (search summary only, page not opened)
- [MODEL] Interpretation caveat: with w₀ > −1 and w_a < 0, the CPL fit implies w < −1 ("phantom") in the past, crossing −1 at z ~ 0.4–0.5. That is hard to obtain from simple physical fields, so many authors view CPL as a phenomenological fit rather than literal physics. — [DES Collaboration 2026](https://arxiv.org/abs/2605.27221) (checked for sign of w₀, w_a; the phantom-crossing statement is my inference from the CPL form)
- [VERIFIED] **Euclid** (ESA; launched 1 July 2023): "Quick release" Q1 (~63 deg², March 2025). Per ESA's update of 15 June 2026, DR1 is split into **DR1-Foundation, planned November 2026** (~1,900 deg²: raw data, calibrated images, catalogues, spectra; exact date TBA), and **full DR1 in mid-2027** (higher-level galaxy-clustering and weak-lensing products). So there will be no official Euclid DR1 cosmology results before mid-2027. The Caltech/IPAC page still listed 21 October 2026, which is outdated. — [ESA Euclid DR1 timeline](https://www.cosmos.esa.int/web/euclid/dr1-timeline) (checked); [Coles (Euclid Consortium member) blog, 16 Jun 2026](https://telescoper.blog/2026/06/16/euclid-update-revised-timeline/) (checked via search summary); [ESA Q1 release](https://www.esa.int/Science_Exploration/Space_Science/Euclid/Euclid_opens_data_treasure_trove_offers_glimpse_of_deep_fields) (ref, launch and Q1 dates)

### Inferences
- The honest 2026 summary: "Several independent analyses show a 2–4σ preference for dark energy that changes over time. The strongest numbers shrank after supernova recalibration, and a July 2026 DESI result leaned back toward a constant Λ. Physicists require 5σ for a discovery; this is not one. The question is open." Expect DESI's final data, Euclid (2027+), and the Rubin Observatory LSST supernova sample to settle it.
- If dark energy does evolve, the long-term fate of the universe (Q11) becomes uncertain.

### Gaps
- I could not confirm whether Euclid DR1-Foundation has been released yet (planned November 2026; today is 24 Oct 2026).
- I found no official combined σ value after the July 2026 Lyα result. Third-party blogs citing "3.2σ" were not authoritative and were excluded.

---

## Q10. Large-scale structure: the cosmic web and baryon acoustic oscillations

### Takeaway
Galaxies trace a "cosmic web" of filaments, walls, clusters (at the nodes) and huge voids, grown by gravity from tiny initial fluctuations. A preferred separation of ~150 Mpc (the BAO scale) is a "standard ruler" left by sound waves in the early plasma.

### Cited Findings
- [VERIFIED] BAO were first detected in 2005 by SDSS (Eisenstein et al.) and 2dFGRS (Cole et al.). They appear as a small excess of galaxy pairs separated by the sound horizon at the drag epoch, r_d ≈ 147 Mpc (≈ 480 million light-years today). The same physics produces the CMB acoustic peaks. — [Eisenstein et al. 2005, ApJ 633, 560, arXiv:astro-ph/0501171](https://arxiv.org/abs/astro-ph/0501171) (ref); [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref: r_drag = 147.09 ± 0.26 Mpc)
- [VERIFIED] DESI DR2 maps >14 million galaxies and quasars in 3D to measure BAO across ~11 billion years. — [DESI DR2 Results II](https://arxiv.org/abs/2503.14738) (checked)
- [MODEL] Structure formation: density contrasts δρ/ρ ~ 10⁻⁵ at recombination (seen as CMB anisotropy) grow by gravitational instability. With cold dark matter they become today's web. Simulations (e.g., Millennium, IllustrisTNG) reproduce the observed filament–void pattern. — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref)
- [OPEN] "S₈ tension": some weak-lensing surveys found matter ~5–10% less clumpy than ΛCDM+Planck predicts. Recent analyses (e.g., KiDS-Legacy 2025) report better agreement; status mixed. — not verified in this session (see Gaps)

### Inferences
- BAO is a beginner-friendly example of a "standard ruler": a known physical length whose apparent angular size gives distance, just as Type Ia supernovae are "standard candles".

### Gaps
- I did not verify the current (2026) status of the S₈ tension. The writer should treat it as "debated" or omit it.

---

## Q11. Possible futures: Big Freeze, Big Rip, Big Crunch

### Takeaway
The fate depends on dark energy's behaviour. A true cosmological constant (w = −1) gives eternal exponential expansion and a "Big Freeze"/heat death. Phantom energy (w < −1) gives a "Big Rip". Dark energy that decays or turns negative, or strong positive curvature, could permit a "Big Crunch". Current data are consistent with w ≈ −1, but the 2024–26 hints of evolution make long-range forecasts genuinely uncertain.

### Cited Findings
- [MODEL] With constant Λ, H → constant, a(t) ∝ e^{Ht} in the far future. Galaxies beyond the Local Group recede out of view. Stars burn out (~10¹⁴ yr), and the universe approaches maximum entropy ("heat death"/"Big Freeze"). — [Carroll 2001](https://arxiv.org/abs/astro-ph/0004075) (ref)
- [MODEL] **Big Rip**: if w < −1 (phantom energy), the dark-energy density *grows* with time. a(t) and the density diverge at a finite time, tearing apart galaxies, stars, planets and finally atoms. Example: w = −1.5 gives a rip ~22 Gyr from now (Caldwell, Kamionkowski & Weinberg 2003). — [Caldwell et al. 2003, PRL 91, 071301, arXiv:astro-ph/0302506](https://arxiv.org/abs/astro-ph/0302506) (ref)
- [MODEL] **Big Crunch**: recollapse requires total density large enough to halt expansion (closed universe without dominant Λ), or dark energy that decays or becomes negative. With Ω_K ≈ 0 and Λ > 0 constant, no crunch. — [Planck 2018 VI](https://arxiv.org/abs/1807.06209) (ref)
- [OPEN] DESI-type results (w₀ > −1 today, weakening dark energy) are *not* phantom today. If extrapolated they are compatible with eternal expansion, or in some models with eventual slowdown. Extrapolating the CPL fit far into the future is not justified by the data. — [DES Collaboration 2026](https://arxiv.org/abs/2605.27221) (checked for w₀ > −1, w_a < 0; the extrapolation caveat is my inference)

### Inferences
- Teach as a decision tree: w = −1 → freeze; w < −1 → rip; dark energy decays or turns negative → possible crunch. Then note that the data favour w ≈ −1 within ~10–20%, and that whether it changes over time is a live 2026 question.

### Gaps
- None critical.

---

## Q12. The PPN framework (beginner level)

### Takeaway
The parameterized post-Newtonian (PPN) framework lets experiments test GR against competing metric theories using a handful of numbers. The two most important are γ ("how much space curvature does a unit mass produce?") and β ("how nonlinear is gravity's superposition?"). GR predicts γ = β = 1. Measurements give γ − 1 ≲ 2×10⁻⁵ and β − 1 ≲ 10⁻⁴.

### Cited Findings
- [MODEL] PPN parameter meanings (Will, Table 2): **γ**: "How much space-curvature is produced by unit rest mass?" (GR: 1). **β**: "How much 'nonlinearity' in the superposition law for gravity?" (GR: 1). The other eight parameters (ξ, α₁–α₃, ζ₁–ζ₄) measure preferred-location effects, preferred-frame effects and violations of momentum conservation. All are 0 in GR. — [Will 2014, "The Confrontation between General Relativity and Experiment", Living Rev. Rel. 17, 4, arXiv:1403.7377](https://arxiv.org/abs/1403.7377) (checked)
- [MODEL] Where they appear: light deflection and Shapiro delay scale as (1 + γ)/2 relative to GR. Mercury's perihelion advance scales as (2 + 2γ − β)/3. The Nordtvedt parameter η_N = 4β − γ − 3 (in fully conservative theories). — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [VERIFIED] **Current limits** (Will 2014, Table 4): |γ − 1| < 2.3×10⁻⁵ (Cassini time delay) and < 2×10⁻⁴ (VLBI deflection); |β − 1| < 8×10⁻⁵ (perihelion, using solar J₂ = (2.2 ± 0.1)×10⁻⁷) and < 2.3×10⁻⁴ (Nordtvedt effect). Best perihelion fit with MESSENGER data: β − 1 = (−4.1 ± 7.8)×10⁻⁵. Mars Reconnaissance Orbiter: β − 1 = (0.4 ± 2.4)×10⁻⁴. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [MODEL] Newtonian-limit check: a "Newtonian" (corpuscular) theory of light bending corresponds to γ = 0, which gives half the GR deflection. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked: deflection ∝ (1+γ)/2)

### Inferences
- A beginner can think of γ as "space-warp strength" and β as "gravity-of-gravity strength". Experiments say both are 1 to better than 1 part in 10⁴–10⁵.

### Gaps
- Will's Living Review was last fully revised in 2014. I did not find a newer edition in this session. The writer may want to check whether BepiColombo or newer planetary ephemerides (INPOP, EPM) have tightened β and γ since then.

---

## Q13. Classic solar-system tests: Mercury, light deflection (1919 and VLBI), Shapiro delay (Cassini)

### Takeaway
GR explains Mercury's anomalous ~43″/century perihelion advance (GR: 42.98″). It predicts 1.75″ deflection of starlight at the Sun's limb, twice the Newtonian value: confirmed roughly in 1919 and now to ~10⁻⁴ by radio VLBI. It predicts an extra radar echo delay (Shapiro delay), measured by Cassini in 2002–03 to give γ − 1 = (2.1 ± 2.3)×10⁻⁵.

### Cited Findings
- [VERIFIED] **Mercury**: Le Verrier (1859) found an unexplained excess after accounting for planetary perturbations and the precession of the equinoxes. "The modern value for this discrepancy is 43 arcseconds per century." — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [VERIFIED] Breakdown, in the classic Earth-based (equinox) frame: total observed ≈ 5,600″/century (Clemence 1947: 5,599.74 ± 0.41″). Of this, ≈ 5,025″ comes from the precession of Earth's equinoxes (a coordinate effect), ≈ 532″ from other planets' tugs, and the residual ≈ 43″ is the GR effect. — [Clemence 1947, Rev. Mod. Phys. 19, 361](https://doi.org/10.1103/RevModPhys.19.361) (ref)
- [VERIFIED] Modern inertial-frame breakdown (arcsec/century): planetary tugs 532.3035; solar oblateness 0.0286; GR "gravitoelectric" 42.9799; Lense–Thirring −0.0020; total predicted 575.31 vs observed 574.10 ± 0.65. — [Wikipedia, Tests of general relativity](https://en.wikipedia.org/wiki/Tests_of_general_relativity) (checked; secondary source, numbers trace to modern ephemeris fits)
- [MODEL] **Perihelion formula** (per orbit): Δφ = 6πGM/[c²a(1 − e²)] × (2 + 2γ − β)/3
  - Δφ = advance of perihelion per orbit (radians);
  - M = Sun's mass; a = semi-major axis; e = eccentricity; G, c as before.
  - For Mercury (a = 5.79×10¹⁰ m, e = 0.2056, 415 orbits per century) this gives **42.98″/century** (computed; matches Will's 42.98″).
  - Will's form: ω̇ = 42.98″ × [(2 + 2γ − β)/3 + 3×10⁻⁴ (J₂/10⁻⁷)]. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [MODEL] **Light deflection**: δθ = (1 + γ)/2 × 4GM/(c²b), where b = impact parameter (closest approach). At the solar limb (b = R☉): **1.75″** (computed: 1.7515″). Newtonian/corpuscular value: 0.875″. At 90° from the Sun the deflection is still ~4 milliarcseconds. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [VERIFIED-history] **1919 eclipse** (Dyson, Eddington, Davidson): Sobral and Príncipe expeditions. Will: "only 30 percent accuracy". Later eclipse results scattered between half and twice the Einstein value. Commonly quoted results: Sobral ~1.98″ ± 0.12″, Príncipe ~1.61″ ± 0.30″ (ref). Modern re-analyses of the plates support Eddington's conclusion. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked for the 30% accuracy; individual station values are ref)
- [VERIFIED] **VLBI (radio)**: 1995 (3C273/3C279): γ − 1 = (−8 ± 34)×10⁻⁴. 2009 VLBA: (−2 ± 3)×10⁻⁴. 2004 analysis of ~2 million VLBI observations of 541 radio sources from 87 sites: (1 + γ)/2 = 0.99992 ± 0.00023, i.e. γ − 1 = (−1.7 ± 4.5)×10⁻⁴. Analysis with data through 2008 (Lambert & Le Poncin-Lafitte 2009): **γ − 1 = (−1.6 ± 1.5)×10⁻⁴**. VLBI deflection agrees with GR to ~0.02%. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked). A 2011 update by the same authors reports (−0.8 ± 1.2)×10⁻⁴ (ref, not checked).
- [VERIFIED] Galaxy-scale test: comparing strong lensing with stellar dynamics gives a ~10% bound on γ. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [MODEL/VERIFIED] **Shapiro time delay** (predicted by Irwin Shapiro, 1964): extra round-trip delay δt ≈ (1 + γ)/2 × [240 − 20 ln(d²/r)] μs, where d = closest approach of the ray in solar radii and r = distance of the planet/spacecraft from the Sun in AU. It is up to ~250 μs for a ray grazing the Sun. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [VERIFIED] **Cassini (2002 superior conjunction, published 2003)**: Doppler tracking at X- and Ka-band gave **γ − 1 = (2.1 ± 2.3)×10⁻⁵**, agreement with GR to 10⁻³ percent. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked); primary: Bertotti, Iess & Tortora, Nature 425, 374 (2003)
- [OPEN-minor] Wikipedia notes later studies suggesting the Cassini uncertainty may be underestimated by up to ~10×. — [Wikipedia, Tests of GR](https://en.wikipedia.org/wiki/Tests_of_general_relativity) (checked; secondary, primary reference not traced)

### Inferences
- The "factor of 2" in light bending is the cleanest beginner demonstration that GR is not just "Newton plus energy". Half comes from time curvature (like the Newtonian calculation) and half from space curvature (γ).

### Gaps
- I did not trace the primary source for the claim that Cassini's error bar may be underestimated.

---

## Q14. Gravitational redshift and time dilation: Pound–Rebka to optical clocks

### Takeaway
Clocks lower in a gravitational field run slower: Δν/ν ≈ gΔh/c² ≈ 1.1×10⁻¹⁶ per metre near Earth's surface. This was measured over a 22.5 m tower in 1960 (~10%, later 1%), with a rocket-borne maser in 1976 (~10⁻⁴), with clocks flown around the world (1971), over 33 cm with optical clocks (NIST 2010), across a 1 mm atom cloud (JILA 2022), and with eccentric Galileo satellites (2018, ~10⁻⁵).

### Cited Findings
- [MODEL] **Weak-field gravitational redshift**: Δν/ν ≈ ΔΦ/c² ≈ gΔh/c²
  - Δν/ν = fractional frequency difference between two clocks;
  - ΔΦ = difference in gravitational potential (J/kg);
  - g = 9.81 m/s²; Δh = height difference; c = speed of light.
  - Numbers (computed): 1 cm → 1.09×10⁻¹⁸; 33 cm → 3.6×10⁻¹⁷; 22.5 m → 2.46×10⁻¹⁵; 1 mm → 1.09×10⁻¹⁹.
  - Velocity (special-relativistic) time dilation: Δτ/τ ≈ −v²/(2c²).
- [VERIFIED] **Pound–Rebka (1959–60) and Pound–Snider (1964–65)**: γ-rays from ⁵⁷Fe sent up and down the 22.5 m Jefferson tower at Harvard, using the Mössbauer effect. The series "of 1960–1965" reached **1% accuracy**. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked). Pound & Rebka 1960 reported 1.05 ± 0.10 of the predicted shift; Pound & Snider 1965 reported 0.9990 ± 0.0076 (ref, PRL 4, 337; Phys. Rev. 140, B788).
- [VERIFIED] **Gravity Probe A (Vessot–Levine, June 1976)**: hydrogen maser on a rocket to ~10,000 km altitude, compared with a maser on the ground. Limit on deviation from GR **|α| < 2×10⁻⁴**. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked) (often quoted as ~1.4×10⁻⁴ or "70 ppm"; Will's figure is 2×10⁻⁴)
- [VERIFIED] **Galileo satellites (2018)**: two Galileo satellites accidentally left in eccentric orbits let their onboard clocks' redshift oscillation be measured. Result ≈ (0.19 ± 2.48)×10⁻⁵, about a 5× improvement on GP-A. — [Delva et al. 2018, PRL 121, 231101, arXiv:1812.03711](https://arxiv.org/abs/1812.03711) (ref); companion: Herrmann et al. 2018, PRL 121, 231102 (ref)
- [VERIFIED] **NTS-2 satellite (1977)**, the first GPS-type caesium clock in orbit: measured clock-rate offset +442.5 parts in 10¹² vs GR prediction +446.5 parts in 10¹², about a 1% verification of combined gravitational and velocity effects at 4.2 Earth radii. — [Ashby 2003, "Relativity in the Global Positioning System", Living Rev. Rel. 6, 1](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/) (checked)
- [VERIFIED] **Hafele–Keating (October 1971)**: caesium clocks flown around the world on commercial jets, compared with clocks at the US Naval Observatory. Eastward: predicted −40 ± 23 ns, observed −59 ± 10 ns. Westward: predicted +275 ± 21 ns, observed +273 ± 7 ns. The predictions combine the gravitational (altitude) and kinematic (velocity, including Earth's rotation) effects. — [Hafele & Keating 1972, Science 177, 166 & 168](https://doi.org/10.1126/science.177.4044.168) (ref)
- [VERIFIED] **NIST 2010 (Chou, Hume, Rosenband, Wineland)**: two aluminium-ion optical clocks detected the gravitational redshift from raising one clock by **~33 cm** (fractional shift ~4×10⁻¹⁷). They also detected velocity time dilation at speeds of a few m/s. — [Chou et al. 2010, Science 329, 1630, "Optical Clocks and Relativity"](https://doi.org/10.1126/science.1192720) (ref)
- [VERIFIED] **JILA 2022 (Bothwell, Ye et al.)**: "Resolving the gravitational redshift across a millimetre-scale atomic sample", Nature 602, 420 (Feb 2022), DOI 10.1038/s41586-021-04349-7. A single cloud of ultracold strontium atoms in an optical lattice acted as a stack of clocks. A frequency gradient consistent with the gravitational redshift was measured across ~1 mm, with frequency-measurement uncertainty reaching **7.6×10⁻²¹**. Expected shift over 1 mm ≈ 1.1×10⁻¹⁹ (computed). — [JILA publication page](https://jila.colorado.edu/bibcite/reference/12594) (checked via search); [paper PDF](https://jila.colorado.edu/sites/default/files/2022-02/Redshift%201%20mm_Nature%202022.pdf) (not opened)

### Inferences
- The progression 22.5 m (1960) → 33 cm (2010) → 1 mm (2022) is a beginner-friendly illustration of how clock precision turns GR into an everyday, tabletop effect. Your head ages faster than your feet, by ~10⁻¹⁶ s per second per metre.

### Gaps
- I did not verify the exact JILA measured gradient value (only the precision figure and the qualitative result). The Wisconsin group (Zheng et al., Nature 2022) did a related multiplexed-clock measurement that I did not check.

---

## Q15. GPS and GNSS: the relativistic corrections and what "10 km/day" really means

### Takeaway
GPS satellite clocks run fast relative to ground clocks by ~+45.7 μs/day (weaker gravity) and slow by ~−7.2 μs/day (orbital speed), a net ≈ +38.5 μs/day. This is corrected at the factory by tuning the clocks to 10.22999999543 MHz instead of 10.23 MHz. A smaller orbit-eccentricity term (up to tens of ns) is corrected in receivers. "~10 km per day of error" is the naive conversion 38 μs × c ≈ 11 km. It shows the scale of the effect, but it is not a careful prediction of how navigation would fail.

### Cited Findings
- [VERIFIED/MODEL] **Numbers**: gravitational ≈ +45 μs/day, velocity ≈ −7 μs/day, net ≈ +38 μs/day. — [Penn State GEOG 862, "The Satellite Clock"](https://courses.ems.psu.edu/geog862/node/1714) (checked via search summary); [ESA Navipedia, Relativistic Clock Correction](https://gssc.esa.int/navipedia/index.php/Relativistic_Clock_Correction) (checked via search summary)
  - My check (computed): orbit radius r ≈ 26,560 km, Earth radius R_E = 6,371 km, GM_E = 3.986×10¹⁴ m³/s². Gravitational term (GM_E/c²)(1/R_E − 1/r) × 86,400 s = **+45.7 μs/day**. Orbital speed v = √(GM_E/r) ≈ 3.87 km/s, so velocity term v²/(2c²) × 86,400 s = **−7.2 μs/day**. **Net ≈ +38.5 μs/day**. (Ignores the ground clock's rotation, a small refinement.)
- [VERIFIED] **Factory offset**: fractional shift ≈ 4.465×10⁻¹⁰. Satellite clocks are set to **10.22999999543 MHz** so that they tick at 10.23 MHz as seen on the ground. — [ESA Navipedia](https://gssc.esa.int/navipedia/index.php/Relativistic_Clock_Correction) (checked via search summary); [Pascual-Sánchez, arXiv:gr-qc/0507121](https://arxiv.org/pdf/gr-qc/0507121) (checked via search summary: factor [1 − 4.4647×10⁻¹⁰])
- [VERIFIED] **Eccentricity correction**: for e = 0.01 the periodic relativistic clock term reaches ~23 ns. For a satellite with e = 0.01486 it reaches 10.2 m of range. Receivers compute and remove it using broadcast orbit data. Penn State quotes up to ~45.8 ns (~14 m) for e = 0.02. — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/) (checked); [Penn State](https://courses.ems.psu.edu/geog862/node/1714) (checked via search)
- [VERIFIED] **Sagnac effect** (Earth's rotation during signal travel): a clock-synchronisation path once around the equator eastward accumulates 207.4 ns. The 1984 around-the-world time transfer had Sagnac corrections of 240–350 ns. — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/) (checked)
- [VERIFIED] Ashby: "Timing errors of one ns will lead to positioning errors of the order of 30 cm". If relativistic effects are not accounted for, "unacceptably large errors in GPS navigation and time transfer will result". — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/) (checked)
- [VERIFIED] Clocks on the rotating geoid run slow relative to clocks at infinity by ~7 parts in 10¹⁰. The gravitational and velocity effects on orbiting clocks cancel at orbital radius ≈ 9,545 km. — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/) (checked)

### Inferences
- **The "10 km/day" nuance** (my inference from Ashby's statements plus how GPS positioning works; I found no single authoritative source that spells it out):
  1. 38.5 μs × c ≈ 11.5 km (computed). That is the range error per day *if* a satellite clock drifted by that much and nothing else corrected it.
  2. A GPS receiver solves for four unknowns, x, y, z and its own clock offset. An error *common to all satellite clocks* behaves like a receiver clock error and is largely absorbed into the time solution, not the position.
  3. The GPS ground control segment uploads clock-correction coefficients (bias, drift, drift rate) to each satellite about daily, so it would also absorb much of a steady drift.
  4. So "your position would be off by 10 km by the end of the day" is an oversimplification. The accurate statement: relativistic effects are ~10⁴ times larger than the nanosecond-level timing GPS needs. Without modelling them, satellite clocks would drift from GPS/UTC time by tens of microseconds per day, wrecking GPS as a time service and forcing large, continual corrections. The parts that are *not* common to all satellites (eccentricity terms of tens of ns, i.e. metres to ~14 m; Sagnac) would directly corrupt positions.
- GPS is a working, everyday demonstration that both special- and general-relativistic clock effects are real and must be included. It is an engineering application, not a high-precision test (NTS-2 checked it to ~1%).

### Gaps
- I could not open Ashby's paper in full (the fetch was truncated). The μs/day values come from secondary educational sources plus my own arithmetic, which agree.
- I found no authoritative source quantifying the exact navigation degradation in a hypothetical "no relativity" GPS. The nuance above is reasoning, labelled as inference.

---

## Q16. Geodetic precession and frame dragging: Gravity Probe B, LAGEOS/LARES

### Takeaway
Gravity Probe B (launched 2004, results 2011) measured the geodetic precession (−6601.8 ± 18.3 mas/yr vs GR −6606.1) to ~0.3% and frame dragging (−37.2 ± 7.2 mas/yr vs GR −39.2) to ~20%. LAGEOS satellite-orbit analyses claim ~10% (later LARES claims of a few percent are disputed).

### Cited Findings
- [VERIFIED] **GP-B setup**: launched 20 April 2004 into a 642 km polar orbit. Four quartz gyroscope rotors (spherical and homogeneous to a few parts in 10⁷), niobium-coated, cooled by 2,200 litres of superfluid helium. Guide star IM Pegasi; its proper motion was measured by VLBI. Science phase ended September 2005 when the helium ran out. Unexpected "patch effect" torques complicated the analysis. Results were announced in 2010 and published in 2011: precision **0.3% (geodetic)** and **~20% (frame dragging)**. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [VERIFIED] **Final numbers**: geodetic −6601.8 ± 18.3 mas/yr (GR: −6606.1); frame dragging −37.2 ± 7.2 mas/yr (GR: −39.2). mas = milliarcseconds. — [Everitt et al. 2011, PRL 106, 221101, arXiv:1105.3456](https://arxiv.org/abs/1105.3456) (ref); [Wikipedia, Tests of GR](https://en.wikipedia.org/wiki/Tests_of_general_relativity) (checked: "~37 mas, ~19% error")
- [MODEL] Physical picture: **geodetic (de Sitter) precession** = a gyroscope's axis tilts because it is carried through curved space around Earth. **Frame dragging (Lense–Thirring)** = Earth's rotation "drags" local inertial frames. GR predicts both.
- [VERIFIED/OPEN] **LAGEOS**: the relative nodal precession from frame dragging is ~31 mas/yr, while Newtonian multipole precession is ~126°/yr and must be modelled away. Combining LAGEOS I/II with GRACE/CHAMP gravity models gives a "10 percent confirmation of GR" (Ciufolini et al.), with caveats about systematic errors. LAGEOS II perigee precession (3.4″/yr) agrees with GR to 0.2%. LARES (launched 13 Feb 2012) aims for ~1%. LARES claims at the few-percent level are disputed. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked); [Wikipedia, Tests of GR](https://en.wikipedia.org/wiki/Tests_of_general_relativity) (checked: "LARES … ~1% … disputed")

### Inferences
- GP-B is a good "how hard experiments are" story: ~50 years from conception, famous technical heroics, and an unexpected systematic. Frame dragging remains one of the less precisely measured GR effects in the Solar System.

### Gaps
- I did not verify the latest LARES/LARES-2 (LARES-2 launched July 2022) published precision claims.

---

## Q17. Equivalence principle tests: MICROSCOPE, torsion balances, lunar laser ranging (Nordtvedt effect)

### Takeaway
The weak equivalence principle (all bodies fall alike) is GR's foundation. It is verified to ~10⁻¹⁵ by the MICROSCOPE satellite (final results 2022) and to ~10⁻¹³ by torsion balances. Lunar laser ranging confirms that Earth and Moon fall alike toward the Sun (~2×10⁻¹³), so even gravitational self-energy falls the same way (strong equivalence principle).

### Cited Findings
- [VERIFIED] **MICROSCOPE (CNES/ESA-supported; launched 2016; ended 2018)**: final result **η(Ti, Pt) = [−1.5 ± 2.3 (stat) ± 1.5 (syst)]×10⁻¹⁵**, i.e., no violation. η = Eötvös parameter = fractional difference in free-fall acceleration of the two materials. ~2.5 years in orbit, ~5 months of free-fall science data. Systematics (largest from temperature variations) exceeded the original 0.2×10⁻¹⁵ specification. Published Phys. Rev. Lett. 129, 121102 (14 Sept 2022). — [Touboul et al. 2022, arXiv:2209.15487](https://arxiv.org/pdf/2209.15487) (checked via search); [APS press release](https://www.aps.org/about/news/2022/09/general-relativitys-weak-equivalence-principle) (checked via search)
- [VERIFIED] **Torsion balances (Eöt-Wash, U. Washington)**: WEP tests for laboratory bodies whose composition mimics Earth and Moon, at **1.4 parts in 10¹³**. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [VERIFIED] **Lunar laser ranging (LLR)**: retroreflectors left by Apollo 11, 14, 15 and Lunokhod. Earth and Moon accelerate equally toward the Sun to ~1.4×10⁻¹³. Combined with Eöt-Wash, the strong equivalence principle is tested at ~2×10⁻¹³. Nordtvedt parameter **|η_N| = (4.4 ± 4.5)×10⁻⁴**. The Nordtvedt effect would produce a lunar orbit polarisation δr = 13.1 η_N cos[(ω₀ − ω_s)t] metres. APOLLO (Apache Point) achieves mm-level ranging. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [VERIFIED] Strong-field strong equivalence principle test: pulsar triple system PSR J0337+1715 bounds the fractional acceleration difference to 2.6×10⁻⁶ (95%). LLR limits variation of G to ~1 part in 10¹¹ per year or better. — [Wikipedia, Tests of GR](https://en.wikipedia.org/wiki/Tests_of_general_relativity) (checked; secondary)

### Inferences
- MICROSCOPE's 10⁻¹⁵ is like comparing the falls of two objects and finding their accelerations equal to 15 decimal places.

### Gaps
- Post-2014 LLR analyses may have tightened η_N (I believe to ~10⁻⁴ or better), but I did not verify a specific newer value.

---

## Q18. Gravitational lensing: strong, weak, microlensing

### Takeaway
Mass bends light, so galaxies and clusters act as lenses. The first lens was discovered in 1979 (Twin Quasar Q0957+561). Lensing now produces Einstein rings and arcs, maps dark matter statistically (weak lensing), and finds exoplanets (microlensing).

### Cited Findings
- [VERIFIED] **First gravitational lens**: Walsh, Carswell & Weymann (1979, Nature 279, 381) found "twin" quasar images QSO 0957+561 A,B, one quasar imaged twice by a foreground galaxy. — [Walsh et al. 1979, via ADS](https://ui.adsabs.harvard.edu/abs/1979Natur.279..381W) (ref)
- [MODEL] **Einstein radius** (angular radius of a ring when source, lens and observer align): θ_E = √[(4GM/c²) · D_LS/(D_L D_S)], where M = lens mass, D_L = distance to lens, D_S = distance to source, D_LS = lens–source distance. — [Will 2014](https://arxiv.org/abs/1403.7377) (ref for formula; standard)
- [VERIFIED] **Regimes**: *strong lensing* (multiple images, arcs, Einstein rings, e.g., cluster arcs in Hubble/JWST images); *weak lensing* (tiny coherent distortions of millions of background galaxies, measured statistically, used by DES, KiDS, HSC, Euclid to map dark matter); *microlensing* (temporary brightening when a star passes in front of another star; a planet around the lens star adds a brief extra blip). — [Clowe et al. 2006](https://arxiv.org/abs/astro-ph/0608407) (ref)
- [VERIFIED] Strong lensing + stellar dynamics: ~10% bound on γ at galaxy scales. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked)
- [VERIFIED] Time-delay lensing gives H₀ (TDCOSMO 2025: 71.6 +3.9/−3.3). — [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) (checked)

### Inferences
- Lensing is both a *test* of GR (the deflection law) and a *tool* (mass maps, magnification). Chapter 9 can use it to bridge the "tests" and "applications" halves.

### Gaps
- I did not verify the current count of microlensing exoplanets or the first microlensing planet details (OGLE-2003-BLG-235/MOA-2003-BLG-53, Bond et al. 2004 is my recollection). The Nancy Grace Roman Space Telescope's launch status as of Oct 2026 was not checked.

---

## Q19. Binary pulsars and gravitational waves

### Takeaway
The Hulse–Taylor pulsar (discovered 1974) showed orbital decay matching GR's gravitational-wave emission to ~0.2% (1993 Nobel). The Double Pulsar tests GW emission to 1.3×10⁻⁴ (2021). LIGO/Virgo's direct GW detections since 2015, including the exceptionally clear GW250114 (2025), pass every GR consistency test applied so far.

### Cited Findings
- [VERIFIED] **Hulse–Taylor PSR B1913+16** (discovered 1974; 1993 Nobel Prize to Hulse and Taylor): masses m₁ = 1.4398 ± 0.0002 M☉, m₂ = 1.3886 ± 0.0002 M☉. GR-predicted orbital period decay Ṗ_b = −2.402531 ± 0.000014 ×10⁻¹². After correction for galactic acceleration, observed/GR = **0.997 ± 0.002**. The galactic correction is now the limiting factor. Periastron advances ~4.2°/yr. — [Will 2014](https://arxiv.org/abs/1403.7377) (checked). Updated: Weisberg & Huang 2016 report 0.9983 ± 0.0016 (ref, [arXiv:1606.02744](https://arxiv.org/abs/1606.02744)).
- [VERIFIED] **Double Pulsar PSR J0737−3039A/B** (discovered 2003): 2.45 h orbit, e = 0.088, periastron advance 16.9°/yr. 16-year timing campaign; 7 post-Keplerian parameters measured (more than any other binary pulsar). GR's quadrupole formula for gravitational-wave damping is validated at **1.3×10⁻⁴ (95% confidence)**, i.e. ~0.013%. Light propagation in strong fields (Shapiro delay, aberration) is measured too. — [Kramer et al. 2021, Phys. Rev. X 11, 041050, arXiv:2112.06795](https://arxiv.org/abs/2112.06795) (checked); [Wikipedia, Tests of GR](https://en.wikipedia.org/wiki/Tests_of_general_relativity) (checked: 16.90°/yr; Shapiro delay agrees with GR to 0.05%)
- [VERIFIED] **First direct detection**: GW150914 (14 Sept 2015; announced 11 Feb 2016), a binary black hole merger. 2017 Nobel Prize to Weiss, Barish and Thorne. — [Abbott et al. 2016, PRL 116, 061102](https://arxiv.org/abs/1602.03837) (ref)
- [VERIFIED] **GW170817** (neutron star merger plus gamma-ray burst 1.7 s later): speed of gravity equals the speed of light to within −3×10⁻¹⁵ to +7×10⁻¹⁶ (fractional). — [LIGO/Virgo/Fermi/INTEGRAL 2017, ApJL 848, L13, arXiv:1710.05834](https://arxiv.org/abs/1710.05834) (ref)
- [VERIFIED] **GW250114** (detected 14 Jan 2025; published PRL Sept 2025, DOI 10.1103/kw5g-d732): the clearest signal yet, signal-to-noise ratio ≈ 80 (vs 26 for GW150914). At least two ringdown modes (fundamental plus first overtone) detected at 4.1σ credibility, consistent with a Kerr black hole, with mode frequencies constrained to within ~30%. Hawking's area theorem (1971: total horizon area cannot decrease) is confirmed at high credibility (Cornell: ~99.999%). The signal is consistent with GR in every test reported. — [LIGO/Virgo/KAGRA, arXiv:2509.08054](https://arxiv.org/pdf/2509.08054) (checked via search); [APS press release](https://www.aps.org/about/news/2025/09/clearest-signal-hawkings-area-theorem) (checked via search); [LIGO science summary](https://ligo.org/?p=4505) (checked via search)
- [VERIFIED] GW standard sirens give H₀: GW170817 70 (+12/−8); dark sirens (GWTC-4 + GW170817) 69.9 ± 4.1. — [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) (checked)

### Inferences
- Binary pulsars test GR in the "strong-field, slow-motion" regime. GW mergers test the "strong-field, highly dynamical" regime. Together they confirm that gravitational waves exist, carry energy, and travel at c.

### Gaps
- A news aggregator's claim of "4.8σ" for the GW250114 area-theorem test conflicts with the primary framing. I used the Cornell/primary description instead. I did not verify the GWTC-4 tests-of-GR paper's summary numbers.

---

## Q20. Strong-field imaging and orbits: EHT black hole shadows and the S2 star

### Takeaway
The Event Horizon Telescope imaged the shadows of M87* (2019) and Sgr A* (2022). Their sizes match GR (Kerr) predictions to roughly 10–20%. The star S2 orbiting Sgr A* shows GR's gravitational redshift (2018) and Schwarzschild precession (2020).

### Cited Findings
- [VERIFIED] **EHT M87***: image released 10 April 2019 (data from April 2017); ring diameter 42 ± 3 μas, mass ≈ 6.5×10⁹ M☉. Shadow size consistent with GR; Psaltis et al. (2020) report consistency with Kerr to within ~17% (68%). — [EHT 2019 Paper I, ApJL 875, L1, arXiv:1906.11238](https://arxiv.org/abs/1906.11238) (ref); [Wikipedia, Tests of GR](https://en.wikipedia.org/wiki/Tests_of_general_relativity) (checked: release dates)
- [VERIFIED] **EHT Sgr A***: image released May 2022; ring diameter 51.8 ± 2.3 μas; consistent with a ~4×10⁶ M☉ Kerr black hole; shadow size agrees with GR prediction to ~10%. — [EHT 2022 Paper I, ApJL 930, L12](https://iopscience.iop.org/article/10.3847/2041-8213/ac6674) (ref)
- [VERIFIED] **S2 star** (16-year orbit around Sgr A*; pericentre May 2018 at ~120 AU, ~7,650 km/s ≈ 2.5% of c): GRAVITY collaboration measured the combined gravitational redshift plus transverse Doppler, f = 0.90 ± 0.09 (stat) ± 0.15 (sys), where f = 1 is GR and f = 0 is Newtonian (A&A 615, L15, 2018). Schwarzschild precession of the orbit (~12′ per orbit) gave f_SP = 1.10 ± 0.19 (A&A 636, L5, 2020). — [GRAVITY 2018, arXiv:1807.09409](https://arxiv.org/abs/1807.09409) (ref); [GRAVITY 2020, arXiv:2004.07187](https://arxiv.org/abs/2004.07187) (ref); [Wikipedia, Tests of GR](https://en.wikipedia.org/wiki/Tests_of_general_relativity) (checked: redshift and precession detected, no numbers)
- [VERIFIED] 2020 Nobel Prize in Physics: half to Roger Penrose (black-hole formation is a robust prediction of GR), half jointly to Reinhard Genzel and Andrea Ghez (supermassive compact object at the Galactic Centre). — [nobelprize.org 2020](https://www.nobelprize.org/prizes/physics/2020/summary/) (ref)

### Inferences
- EHT shadow tests are currently ~10% tests, much weaker than solar-system tests. Their value is that they probe the strongest fields, near horizons. Present them as "consistent with GR" rather than "high-precision confirmations".

### Gaps
- I did not check for EHT results published 2024–2026 (e.g., polarisation changes, multi-year M87* ring stability, 345 GHz observations), or newer S2/GRAVITY+ results.

---

## Q21. Real-world applications: GNSS, relativistic geodesy, the redefinition of the second, lensing as a telescope, dark-matter mapping

### Takeaway
GR is engineering-relevant. GNSS (GPS, Galileo, GLONASS, BeiDou) builds in relativistic clock corrections. Optical clocks are now precise enough (~10⁻¹⁸) to measure height differences of ~1 cm through gravitational redshift ("chronometric levelling"). The BIPM's 28th CGPM (October 2026) adopted a resolution preparing to redefine the second with optical clocks, with adoption targeted for 2030. Lensing magnifies the most distant galaxies and maps dark matter.

### Cited Findings
- [VERIFIED] **GNSS**: see Q15. All GNSS constellations must model the same relativistic clock effects (gravitational, velocity, eccentricity, Sagnac). Galileo's eccentric satellites even served as a redshift test (Q14). — [ESA Navipedia](https://gssc.esa.int/navipedia/index.php/Relativistic_Clock_Correction) (checked via search)
- [VERIFIED/MODEL] **Relativistic geodesy / chronometric levelling**: since Δν/ν ≈ gΔh/c² ≈ 1.1×10⁻¹⁸ per cm (computed), a clock at 10⁻¹⁸ accuracy measures its height in Earth's gravitational potential to ~1 cm. Comparing clocks thus measures geopotential (geoid) differences directly. Demonstrations include transportable optical clocks (e.g., PTB's strontium clock in the Fréjus tunnel, 2018; RIKEN's clocks at Tokyo Skytree, 2020). — [Chou et al. 2010](https://doi.org/10.1126/science.1192720) (ref); the 2018/2020 demonstrations are ref only (Grotti et al. 2018, Nature Physics 14, 437; Takamoto et al. 2020, Nature Photonics 14, 411) and their precision figures were not verified here.
- [VERIFIED] **Time scales**: International Atomic Time is defined on a rotating geoid. Clocks on the rotating geoid run slow relative to clocks at infinity by ~7×10⁻¹⁰, and every contributing clock's rate must be corrected for its height. — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/) (checked)
- [VERIFIED] **Redefinition of the second**: the BIPM's 28th General Conference on Weights and Measures (CGPM, Versailles; CCTF President's statement dated 15 Oct 2026) adopted three time-related resolutions. **Resolution 4 "On the future definition of the second"** lays the groundwork for a new definition based on optical frequency standards, to be presented for adoption at the **29th CGPM in 2030**. It cites optical standards that surpass the current caesium definition's realisation by "a factor of up to 100". The choice of a single atomic species vs. an ensemble of transitions remains open, and some optical clock comparisons show "noticeable inconsistencies". Caesium would remain a secondary representation. — [BIPM CGPM 2026 Resolution 4](https://www.bipm.org/en/cgpm-2026/resolution-4) (checked via search snippets only); [CCTF President statement](https://www.bipm.org/documents/d/guest/statement-cctf-president-cgpm-2026) (checked via search snippets); [BIPM FAQ on redefinition](https://www.bipm.org/en/faq-redefinition-second) (checked via search)
- [MODEL/VERIFIED] Link to GR: optical clocks at 10⁻¹⁸ are so sensitive to gravitational redshift that comparing them across continents requires knowing each clock's geopotential height to ~1 cm. GR is therefore built into the future definition of time. — [BIPM FAQ](https://www.bipm.org/en/faq-redefinition-second) (checked via search); the inference about the 1 cm requirement is computed.
- [VERIFIED] **Lensing as a cosmic telescope**: massive clusters magnify background galaxies, letting HST/JWST see objects otherwise too faint (e.g., the Hubble Frontier Fields; the strongly magnified star "Earendel" at z ≈ 6.2, Welch et al. 2022, Nature 603, 815). — ref only, not verified in this session
- [VERIFIED] **Dark-matter mapping**: weak lensing of large galaxy samples produces 2D/3D maps of total mass (Bullet Cluster; DES; KiDS; HSC; Euclid). Euclid's cosmology-grade weak-lensing products are due mid-2027. — [Clowe et al. 2006](https://arxiv.org/abs/astro-ph/0608407) (ref); [ESA Euclid DR1 timeline](https://www.cosmos.esa.int/web/euclid/dr1-timeline) (checked)
- [VERIFIED] **GW astronomy as an application**: standard sirens measure H₀ independently of the distance ladder (69.9 ± 4.1, Q19). — [Cai & Wang 2026](https://arxiv.org/html/2606.20434v1) (checked)

### Inferences
- A good closing message for Ch. 9: GR has gone from a 43″/century anomaly (1915) to a correction your phone relies on daily, and in the 2030s to the definition of the second itself.

### Gaps
- I saw only search snippets of CGPM 2026 Resolution 4, not its full text. Exact wording, and whether it names candidate species, is unverified.
- I did not verify precision figures for the 2018 Fréjus and 2020 Tokyo Skytree clock-geodesy demonstrations.
