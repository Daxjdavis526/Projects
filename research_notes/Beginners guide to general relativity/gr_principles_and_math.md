# General Relativity: Core Physical Principles and Conceptual Mathematics (research notes for Ch. 4 "Einstein's Revolutionary Theory of Gravity" and Ch. 5 "The Geometry and Mathematics of General Relativity")

Audience reminder for the writer: the reader has Calculus I, is taking Calculus II, and knows calculus-based Newtonian mechanics. They have not seen linear algebra, multivariable calculus, differential geometry or tensors. Everything below is written so it can be explained with single-variable calculus, Taylor approximations and Pythagoras.

Conventions used in these notes (state them in the book):
- Signature (−,+,+,+) ("mostly plus"), the Misner–Thorne–Wheeler (MTW) convention, which is also Carroll's and Wikipedia's. Particle-physics books use (+,−,−,−); the physics is identical, only signs move. — [Wikipedia, Einstein field equations](https://en.wikipedia.org/wiki/Einstein_field_equations); [Carroll lecture notes, gr-qc/9712019, eq. 1.8 and remark](https://arxiv.org/abs/gr-qc/9712019)
- Baez & Bunn and Carroll often set c = 1 (and Baez & Bunn also 8πG = 1). In these notes c and G are restored everywhere so numbers can be plugged in.
- Numerical constants used in the computed examples (standard reference values, not separately sourced in this session): G = 6.67430×10⁻¹¹ m³ kg⁻¹ s⁻², c = 299,792,458 m/s, g = 9.80665 m/s², GM_Earth = 3.986004418×10¹⁴ m³/s², mean Earth radius 6,371 km, GM_Sun = 1.32712440018×10²⁰ m³/s², solar radius 6.957×10⁸ m, 1 AU = 1.495978707×10¹¹ m. All "computed for these notes" values were evaluated in Python and are reproducible.

---

## Key question 1: The equivalence principle and its direct consequences (Einstein's elevator, the "happiest thought," free fall as the natural state, accelerated frames, light bending, gravitational time dilation, gravitational redshift)

### Takeaway
All bodies fall the same way regardless of composition (tested to about 1 part in 10¹⁵), so in a small freely falling laboratory gravity disappears, and in a small accelerating laboratory it appears. From this alone, with no field equations, Einstein got two real predictions: light bends (although the elevator argument gives only half of the correct bending) and clocks lower in a gravitational field run slow by a fraction ΔΦ/c² ≈ gh/c². That second prediction is now everyday engineering: GPS satellite clocks gain about 38.6 μs per day compared with ground clocks.

### Cited Findings

**Three forms of the equivalence principle (standard definitions, Clifford Will, *Living Reviews in Relativity*, 2014):**
- **Weak equivalence principle (WEP):** "the trajectory of a freely falling 'test' body (one not acted upon by such forces as electromagnetism and too small to be affected by tidal gravitational forces) is independent of its internal structure and composition. In the simplest case of dropping two different bodies in a gravitational field, WEP states that the bodies fall with the same acceleration (this is often termed the Universality of Free Fall, or UFF)." Will also gives the older Newtonian phrasing: a body's "mass" is proportional to its "weight." — [Will 2014, arXiv:1403.7377, §2.1](https://arxiv.org/abs/1403.7377)
- **Einstein equivalence principle (EEP):** "1. WEP is valid. 2. The outcome of any local non-gravitational experiment is independent of the velocity of the freely-falling reference frame in which it is performed. 3. The outcome of any local non-gravitational experiment is independent of where and when in the universe it is performed." Part 2 is called *local Lorentz invariance* and part 3 *local position invariance*. Will's example: measuring the electric force between two charges is a local non-gravitational experiment, while a Cavendish experiment, which measures the gravitational force between two bodies, is not. — [Will 2014, §2.1](https://arxiv.org/abs/1403.7377)
- **Strong equivalence principle (SEP):** "1. WEP is valid for self-gravitating bodies as well as for test bodies. 2. The outcome of any local test experiment is independent of the velocity of the (freely falling) apparatus. 3. The outcome of any local test experiment is independent of where and when in the universe it is performed." SEP extends EEP to bodies with their own gravity (planets, stars) and to gravitational experiments (Cavendish experiments, gravimeters). SEP contains EEP as the special case where local gravitational forces are ignored. Will: "General relativity seems to be the only viable metric theory that embodies SEP completely." — [Will 2014, §3.1.2](https://arxiv.org/abs/1403.7377)
- **Why EEP leads to curved spacetime:** "if EEP is valid, then gravitation must be a 'curved spacetime' phenomenon, in other words, the effects of gravity must be equivalent to the effects of living in a curved spacetime." Theories that satisfy EEP are "metric theories," whose postulates are: "1. Spacetime is endowed with a symmetric metric. 2. The trajectories of freely falling test bodies are geodesics of that metric. 3. In local freely falling reference frames, the non-gravitational laws of physics are those written in the language of special relativity." — [Will 2014, §2.1](https://arxiv.org/abs/1403.7377)
- **Universal coupling** (good for the "geometry, not force" story): because all matter and fields couple to gravity the same way, "one can discuss the metric as a property of spacetime itself rather than as a field over spacetime… the proper time between two events is a characteristic of spacetime and of the location of the events, not of the clocks used to measure it." — [Will 2014, §3.1.1](https://arxiv.org/abs/1403.7377)

**How well the WEP is tested:**
- The MICROSCOPE satellite (final results in *Phys. Rev. Lett.* 129, 121102, Sept 2022) compared free fall of titanium and platinum test masses in orbit. It found an Eötvös parameter η(Ti,Pt) = [−1.5 ± 2.3 (stat) ± 1.5 (syst)] × 10⁻¹⁵, i.e. no violation at about 1 part in 10¹⁵. — [MICROSCOPE collaboration, arXiv:2209.15487](https://arxiv.org/abs/2209.15487); [APS PRL PDF](https://physics.aps.org/featured-article-pdf/10.1103/PhysRevLett.129.121102)
- Earlier, ground-based "Eöt-Wash" torsion-balance experiments (University of Washington) "reached levels of 2 × 10⁻¹³." — [Will 2014, §2.1.1](https://arxiv.org/abs/1403.7377)
- Lunar laser ranging tests whether the Earth and Moon, which carry different amounts of gravitational self-energy, fall equally toward the Sun (the "Nordtvedt effect," an SEP test). The bound on the Nordtvedt parameter is |η_N| = (4.4 ± 4.5) × 10⁻⁴, and GR predicts η_N = 0. — [Will 2014, §4.3.1](https://arxiv.org/abs/1403.7377)

**The "happiest thought" and the elevator:**
- In 1907 Johannes Stark asked Einstein, then a patent examiner, to write a review of relativity for the *Jahrbuch der Radioaktivität und Elektronik*. The last nine pages of the 52-page paper, "Principle of Relativity and Gravitation," laid the foundation of his theory of gravity. "Fifteen years later he called the epiphany that inspired him *der glücklichste Gedanke meines Lebens*, the happiest thought of my life." — [Schücking, "Einstein's Apple and Relativity's Gravitational Field," arXiv:0903.3768](https://arxiv.org/abs/0903.3768) (citing *Collected Papers of Albert Einstein* Vol. 2, English trans., pp. 252, 265)
- Einstein's own recollection in a speech in Kyoto on 14 December 1922 (as translated in Pais, *Subtle is the Lord*, p. 179): "I was sitting in a chair in my patent office in Bern. Suddenly a thought struck me: if a man falls freely, he would not feel his weight. I was taken aback. The simple thought experiment made a deep impression on me. It was what led me to the theory of gravity." — [Schücking, arXiv:0903.3768](https://arxiv.org/abs/0903.3768)
- A 1920 passage attributed to Einstein: "The gravitational field has only a relative existence… Because for an observer freely falling from the roof of a house… there exists no gravitational field." — [Smoot, UC Berkeley/LBL course page "The happiest thought of my life"](https://aether.lbl.gov/www/classes/p10/gr/Thehappiestthoughtofmylife.html) (the page gives no document citation; see Gaps)
- Caution: Walter Isaacson has argued that popular versions of the falling-man story (e.g., a painter falling off a roof) are embellished. — [3 Quarks Daily excerpt of Isaacson in *Scientific American*](https://3quarksdaily.com/?p=10099) (seen as a search-result summary only; not read in full)
- Schücking's "Einstein's Chest" (the elevator) spacetime-diagram argument: "of two identical clocks, one at the floor and one at the ceiling of Einstein's Chest, the clock at the ceiling goes faster." — [Schücking, arXiv:0903.3768](https://arxiv.org/abs/0903.3768)

**Free fall as the natural (inertial) state; inertial frames only local:**
- "A particle is said to be in 'free fall' when its motion is affected by no forces except gravity. In general relativity, a test particle in free fall will trace out a 'geodesic'… A geodesic is the closest thing there is to a straight line in curved spacetime." — [Baez & Bunn, "The Meaning of Einstein's Equation," arXiv:gr-qc/0103044, §2](https://arxiv.org/abs/gr-qc/0103044)
- In GR "the concept of inertial frame, so important in special relativity, is banned… we can still talk about… a 'local' inertial coordinate system. However… this notion makes perfect sense only in the limit where the region of spacetime covered by the coordinate system goes to zero in size." — [Baez & Bunn §2](https://arxiv.org/abs/gr-qc/0103044)
- Carroll derives the geodesic law from the equivalence principle: "In general relativity, therefore, free particles move along geodesics." — [Carroll notes, ch. 4](https://arxiv.org/abs/gr-qc/9712019)

**Light bending, and the "half" that the elevator gives:**
- A light ray grazing the Sun is deflected by δθ ≈ ½(1+γ) × 1.7505 arcseconds. In GR γ = 1, giving 1.75″. — [Will 2014, eqs. 59–60](https://arxiv.org/abs/1403.7377)
- Key nuance: derivations using only the corpuscular theory (Cavendish 1784, von Soldner 1803) "or the principle of equivalence (Einstein 1911), yield only the '1/2' part of the coefficient… But the result of these calculations is the deflection of light relative to local straight lines… because of space curvature around the Sun, determined by the PPN parameter γ, local straight lines are bent relative to asymptotic straight lines far from the Sun by just enough to yield the remaining factor 'γ/2'." — [Will 2014, §4.1.1](https://arxiv.org/abs/1403.7377)
- A 2004 analysis of almost 2 million VLBI (radio-interferometry) observations of 541 radio sources gave (1+γ)/2 = 0.99992 ± 0.00023. — [Will 2014, §4.1.1](https://arxiv.org/abs/1403.7377)

**Gravitational redshift / time dilation:**
- The frequency shift between an emitter and a receiver at different gravitational potentials is Z = ΔU/c², where ΔU is the Newtonian potential difference. Violations of local position invariance would show up as Z = (1+α)ΔU/c². — [Will 2014, eq. 6](https://arxiv.org/abs/1403.7377)
- Pound–Rebka–Snider (1960–1965): measured the frequency shift of ⁵⁷Fe gamma rays going up and down the Jefferson Physical Laboratory tower at Harvard, using the Mössbauer effect, to 1% accuracy. — [Will 2014, §2.1.3](https://arxiv.org/abs/1403.7377)
- Gravity Probe A (June 1976): a hydrogen-maser clock launched on a rocket to about 10,000 km altitude was compared with a ground maser, giving |α| < 2 × 10⁻⁴. — [Will 2014, §2.1.3](https://arxiv.org/abs/1403.7377)
- Chou, Hume, Rosenband & Wineland (*Science* 329, 1630, 2010), using NIST aluminium-ion optical clocks, detected the rate change when one clock was raised by 33 cm. The fractional shift was about 4 × 10⁻¹⁷, in agreement with GR. Physics World put this at about 90 billionths of a second over an 80-year lifetime. — [Physics World](https://physicsworld.com/?p=21414); [Physics Today](https://physicstoday.aip.org/news/relativistic-effects-seen-at-everyday-distances-and-speeds); [Will 2014 cites it as "1/3 of a meter"](https://arxiv.org/abs/1403.7377)

**GPS:**
- Relativity makes GPS satellite clocks gain "a whopping 39 microseconds per day (46 µs from the gravitational redshift, and −7 µs from time dilation). If these effects were not accurately accounted for, GPS would fail to function at its stated accuracy." — [Will 2014, §2.1.3](https://arxiv.org/abs/1403.7377)
- Ashby (*Living Reviews in Relativity*, 2003): GPS semi-major axis a = 2.656175 × 10⁷ m. The effective potential on the geoid (Earth's gravity plus rotation) is Φ₀/c² = −6.969290134 × 10⁻¹⁰, so clocks on the geoid "run slow compared to clocks at rest at infinity by about seven parts in 10¹⁰." A timing error of 1 ns gives a position error of about 30 cm. The orbital-eccentricity correction reaches about 23 ns for e = 0.01. The nominal GPS clock frequency is f₀ = 10.23 MHz. — [Ashby 2003, PMC5253894](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)

### Inferences

**A. The elevator thought experiments, step by step (for the writer to narrate):**
1. *Free-falling elevator (cable cut):* you, your keys and a dropped apple all fall with the same acceleration (WEP), so relative to the elevator everything floats. No experiment inside a small, short-lived box can tell this from floating in deep space. "Gravity has disappeared." This is the happiest thought.
2. *Rocket accelerating at g in deep space:* a released apple simply keeps moving inertially while the floor accelerates up to meet it. Inside, it looks exactly like falling at 9.8 m/s², and it looks the same for every apple of every material, because the apples aren't doing anything; the floor is. "Gravity has appeared."
3. Lesson: the 9.8 m/s² "pull" you feel standing on Earth is the floor pushing you off your natural free-fall path. In GR the *standing* person is accelerating (proper acceleration, which an accelerometer reads) and the *falling* person is inertial. That inverts Newton's picture, and it is the conceptual heart of Ch. 4.
4. *The fine print, "local":* equivalence holds only in a small region for a short time. A large falling elevator betrays itself through tidal effects (see Key question 2). Example computed for these notes: two balls 10 m apart horizontally, released from rest near Earth's surface, both fall toward Earth's centre and converge with relative acceleration (GM/R³)·d = 1.54×10⁻⁶ s⁻² × 10 m = 1.5×10⁻⁵ m/s². After 2 s they are about 31 μm closer. That is tiny but nonzero, and it cannot be removed by any choice of frame.

**B. Why light must bend (elevator argument):** in the rocket, a light pulse crosses the cabin horizontally. During the crossing time t = L/c the floor accelerates upward, so relative to the cabin the beam lands lower by ½gt². The equivalence principle says the same must happen in a lab at rest on Earth, so light falls. Numbers computed for these notes: for a 3 m wide cabin at 1 g, the drop is ½·9.81·(3/c)² ≈ 4.9×10⁻¹⁶ m, about a thousandth of a proton's diameter. Hence nobody sees it in an elevator, and one needs the Sun (1.75″). Flag for the writer: the elevator argument captures only half of the true solar deflection (Will, above). The other half comes from the curvature of space near the Sun. This is the cleanest "accurate version" of the space-curvature-versus-time-curvature story (Key question 2).

**C. Deriving gravitational time dilation from the elevator (algebra plus first-order Doppler only):**
- Rocket of height h with acceleration g. A light signal is sent from floor to ceiling and takes time ≈ h/c. During that time the ceiling gains speed Δv = g·h/c relative to the floor's speed at emission. To first order the ceiling receives the signal Doppler-shifted to a lower frequency: Δf/f ≈ −Δv/c = −gh/c².
- Equivalence principle: the same holds in a lab of height h at rest in gravity g. Since the field is static, no wave crests can pile up between floor and ceiling. So the only consistent interpretation is that the lower clock really ticks slower: (rate_top − rate_bottom)/rate ≈ gh/c².
- General weak-field version: Δτ/τ ≈ ΔΦ/c², where Φ is the Newtonian potential (−GM/r outside a sphere). Near Earth's surface ΔΦ ≈ gh. "Gravitational redshift" (light climbing out loses frequency) and "gravitational time dilation" (low clocks run slow) are the same fact described two ways.
- Common oversimplification to flag: "time slows down where gravity is *stronger*." Strictly, the clock rate depends on the *potential* Φ, not the field strength g. A clock at the centre of a hollow shell feels zero g but still runs slow compared with a distant clock. Near Earth's surface "lower = slower" is correct.

**D. Worked numbers, computed for these notes (fractional rate difference gh/c² with g = 9.80665 m/s²):**

| Height difference | Fractional rate gh/c² | Gain of upper clock per day | per year | over 80 years |
|---|---|---|---|---|
| 33 cm (Chou et al. 2010) | 3.6 × 10⁻¹⁷ | 3.1 ps | 1.1 ns | 91 ns (matches Physics World's "90 billionths of a second over 80 years") |
| 1 m | 1.09 × 10⁻¹⁶ | 9.4 ps | 3.4 ns | 275 ns |
| 22.5 m (often-quoted Pound–Rebka tower height; see Gaps) | 2.46 × 10⁻¹⁵ | 0.21 ns | 77 ns | 6.2 μs |
| 8,848 m (Everest summit) | 9.65 × 10⁻¹³ | 83 ns | 30 μs | 2.4 ms |
| 10 km (airliner altitude) | 1.09 × 10⁻¹² | 94 ns | 34 μs | 2.8 ms |

- At 10 km the exact potential difference GM(1/R − 1/(R+h))/c² = 1.0909×10⁻¹² differs from gh/c² = 1.0911×10⁻¹² by only 0.02%, so gh/c² is an excellent approximation at airliner heights. At GPS heights it is not, and one must use GM/r.
- Airliner: the gravitational gain at 10 km is 3.9 ns per hour. An airspeed of 250 m/s causes a special-relativistic loss of v²/2c² = 3.5×10⁻¹³, or 1.25 ns per hour (ignoring Earth's rotation, which in reality matters for east versus west flights).

**E. GPS full calculation (computed for these notes, using Ashby's orbit radius and geoid potential):**
- Orbit radius a = 26,561.75 km. Circular orbital speed v = √(GM/a) = 3,874 m/s, period ≈ 11.97 h (half a sidereal day).
- Gravitational term: [Φ(sat) − Φ(geoid)]/c² = −GM/(ac²) + 6.969290×10⁻¹⁰ = −1.6697×10⁻¹⁰ + 6.9693×10⁻¹⁰ = **+5.300×10⁻¹⁰** → × 86,400 s = **+45.8 μs/day** (the satellite clock runs fast).
- Velocity term: −v²/(2c²) = −GM/(2ac²) = **−8.35×10⁻¹¹** → **−7.2 μs/day** (the satellite clock runs slow).
- Net: **+4.465×10⁻¹⁰ → +38.6 μs/day.** This matches Will's rounded 46 − 7 = 39 μs/day.
- Engineering fix: the satellite oscillators are set before launch to 10.23 MHz × (1 − 4.465×10⁻¹⁰) = **10.229 999 995 43 MHz**, so that from the ground they appear to tick at exactly 10.23 MHz.
- Flag the popular claim "uncorrected, GPS would drift ~10 km per day." c × 38.6 μs ≈ 11.6 km, which is the *range-equivalent* of one day's clock offset. The actual navigation error from failing to correct would depend on receiver clock solutions and ephemeris handling, and is not simply this number. Ashby only says "unacceptably large errors in GPS navigation and time transfer will result." The writer should present 11.6 km as "light travels 11.6 km in 38.6 μs," not as a precise drift rate.
- Contrast: ISS (about 400 km altitude, v ≈ 7.67 km/s). Gravitational +3.6 μs/day, velocity −28.3 μs/day, net −24.7 μs/day. ISS clocks run *slow*, GPS clocks run *fast*. For circular orbits (ignoring Earth's rotation) the two effects cancel at r = 1.5 R_Earth, about 3,190 km altitude.
- Another nice number: at ISS altitude, gravity is still (6371/6771)² ≈ 0.885 of its surface value. Astronauts are weightless because they are in free fall, not because there is "no gravity in space." This is an excellent equivalence-principle example and corrects a common misconception that Pössel also notes.

**F. Common oversimplifications to flag in Ch. 4:**
- "Gravity and acceleration are the same thing." They are equivalent *locally* (small region, short time). Tidal effects distinguish them over larger regions.
- "The equivalence principle predicts all of light bending." It predicts half; space curvature gives the other half.
- "Gravitational time dilation proves spacetime is curved." Not by itself: an accelerated rocket in flat spacetime shows the same floor–ceiling clock difference. Marsh & Nissim-Sabat (AJP 1975) argued that "no argument that attempts to infer space-time curvature solely from the gravitational red shift can be valid" ([search-result abstract](https://www.gemarsh.com/archives/61)). It is the *variation* of this effect from place to place (tides) that signals curvature.

### Gaps
- I could not verify the exact source document of the 1920 "relative existence / falling from the roof" quote. It is widely attributed to Einstein's unpublished 1920 manuscript "Fundamental Ideas and Methods of the Theory of Relativity, Presented in Their Development" (*Collected Papers* Vol. 7), but I did not confirm this in a primary or archival source. The writer should verify before giving a full citation.
- The commonly quoted Pound–Rebka tower height of 22.5 m (and the measured fractional shift ≈ 2.5 × 10⁻¹⁵) were not confirmed in the sources read. Will gives the setup and 1% accuracy only.
- I did not research Hafele–Keating (1971 airborne clocks) for exact numbers.
- Physical constants listed under Conventions are standard reference values used for computation. They were not individually re-sourced in this session.

---

## Key question 2: Why Einstein replaced Newton's force with spacetime curvature; Wheeler's slogan; tidal forces as the true signature of curvature; and the accurate version of "everyday gravity is mostly time curvature"

### Takeaway
Because every body falls identically, gravity can be "switched off" locally by free fall, which no genuine force allows. That makes gravity a property of spacetime geometry rather than a force. What *cannot* be switched off is the tidal (relative) acceleration between nearby free-fallers, and that is what curvature (the Riemann tensor) measures. For slowly moving objects in weak fields, essentially all of Newtonian gravity comes from the position dependence of clock rates (the g_tt part of the metric). Space curvature is equally large in the metric but affects slow bodies only at order (v/c)², while for light it contributes exactly as much as the time part.

### Cited Findings

**Gravity as geometry rather than force:**
- Baez & Bunn's two-traveller picture: "Suppose two people stand side-by-side on the equator and start walking north, both following geodesics. Though they start out walking parallel to each other, the distance between them will gradually start to shrink, until finally they bump into each other at the north pole. If they didn't understand the curved geometry of the sphere, they might think a 'force' was pulling them together. Similarly, in general relativity gravity is not really a 'force', but just a manifestation of the curvature of spacetime. Note: not the curvature of space, but of spacetime. The distinction is crucial." — [Baez & Bunn §2](https://arxiv.org/abs/gr-qc/0103044)
- The thrown-ball argument: "If you toss a ball, it follows a parabolic path. This is far from being a geodesic in space: space is curved by the Earth's gravitational field, but it is certainly not so curved as all that! The point is that while the ball moves a short distance in space, it moves an enormous distance in time, since one second equals about 300,000 kilometers in units where c = 1. This allows a slight amount of spacetime curvature to have a noticeable effect." — [Baez & Bunn §2](https://arxiv.org/abs/gr-qc/0103044)
- Curvature defined by parallel transport: "When spacetime is curved, the result of parallel transport from one point to another depends on the path taken! In fact, this is the very definition of what it means for spacetime to be curved." Consequently, in GR "we cannot even talk about relative velocities, except for two particles at the same point of spacetime." — [Baez & Bunn §2](https://arxiv.org/abs/gr-qc/0103044)
- Eddington's map parable (as retold by Pössel): flat-map makers who must explain distant travellers' odd distances invent "a demon that influences travellers' propagation… In this simile, the demon is Newton's gravitational force, while Einstein's geometric theory amounts to realizing that the Earth is, really, a sphere (Eddington 1922)." — [Pössel 2018, arXiv:1812.11589, §4.3](https://arxiv.org/abs/1812.11589)
- Empirical motivation: Mercury's anomalous perihelion advance; "The modern value for this discrepancy is 43 arcseconds per century," which GR explains. — [Will 2014, §4.2](https://arxiv.org/abs/1403.7377)
- The elastic-sheet discussion notes that a field picture "avoid[s] the idea of an action-at-a-distance" and prepares the idea of "a finite speed of propagation for gravity." Newton's instantaneous action at a distance is in tension with special relativity, one of the motivations for a field or geometric theory. — [Pössel 2018, §4.1](https://arxiv.org/abs/1812.11589)

**Wheeler's slogan, its wording and its source:**
- Pössel attributes "spacetime tells matter how to move; matter tells spacetime how to curve" to Wheeler, *A Journey into Gravity and Spacetime* (W. H. Freeman, 1990). — [Pössel 2018, §4.1 and references](https://arxiv.org/abs/1812.11589)
- A quotation compendium gives the exact line "Spacetime tells matter how to move; matter tells spacetime how to curve" from Wheeler with Kenneth Ford, *Geons, Black Holes, and Quantum Foam: A Life in Physics* (1998), p. 235, and notes that it was adapted from MTW's *Gravitation* (1973), p. 5. — [Today in Science, Spacetime Quotations](https://todayinsci.com/QuotationsCategories/S_Cat/Spacetime-Quotations.htm)
- Wikiquote lists the variant "Space tells matter how to move / Matter tells space how to curve" as a right-hand margin note in *Gravitation* (1973), p. 5. — [Wikiquote, John Archibald Wheeler](https://en.wikiquote.org/wiki/John_Archibald_Wheeler)

**Tidal forces = curvature; the uniform part is frame-removable:**
- Pössel (footnote 7): "In a general spacetime, distortions can be made to vanish at least locally by choosing a reference frame that is in free fall. The only distortions that remain are those directly due to curvature; physically speaking, those correspond to tidal forces, that is, to gravitational influence varying with location or over time. Gravity as we know it… is made up of both kinds of effect." Curvature has a precise meaning: "spacetime is curved unless the Riemann tensor vanishes everywhere." — [Pössel 2018, §4.1, fn. 7](https://arxiv.org/abs/1812.11589)
- Carroll: "even in a curved space it is still possible to make the Christoffel symbols vanish at any one point… [but] this can only be established at a point, not in some neighborhood." The Riemann tensor's 20 components "are precisely the 20 degrees of freedom in the second derivatives of the metric which we could not set to zero by a clever choice of coordinates." — [Carroll notes §3.2, §3.6](https://arxiv.org/abs/gr-qc/9712019)
- Baez & Bunn's coffee-grain example: in vacuum a falling ball of coffee grains stretches vertically and squashes horizontally, and "Einstein's equation says that if we treat the coffee grains as test particles, these two effects cancel each other when we calculate the second derivative of the ball's volume, leaving us with V̈|ₜ₌₀ = 0… This stretching/squashing… is an example of what people call 'tidal forces'." The Ricci tensor governs volume change, while "the 'Weyl tensor'… says how any such ball starts changing in shape. The Weyl tensor describes tidal forces, gravitational waves and the like." — [Baez & Bunn §4, §5](https://arxiv.org/abs/gr-qc/0103044)

**Time curvature versus space curvature (the accurate version):**
- Pössel: "In the usual Newtonian limit of general relativity… (slowly moving particles, weak gravitational field, coordinates adapted to those of classical mechanics), the Newtonian part of gravity is purely an effect of time distortion, encoded in the metric coefficient g_tt. In other words: in the coordinate description arguably closest to classical physics, the familiar part of gravity, which makes planets orbit the Sun, and objects fall to the ground here on Earth, is not a distortion of space, but of time." He cites Bennett 2014, Gould 2016, Kaur et al. 2017 and Stannard et al. 2017 as making the same point. — [Pössel 2018, §4.2](https://arxiv.org/abs/1812.11589)
- Carroll's Newtonian-limit derivation (slow motion, weak field, static field) reduces the geodesic equation to d²xⁱ/dt² = ½ ∂ᵢh₀₀ (Carroll's c = 1 notation). This is Newton's law once h₀₀ = −2Φ, i.e., g₀₀ = −(1 + 2Φ). Only the time–time component of the metric enters. — [Carroll notes §4.1, eqs. 4.10–4.21](https://arxiv.org/abs/gr-qc/9712019)
- Carroll's full weak-field metric for a star or planet: ds² = −(1 + 2Φ)dt² + (1 − 2Φ)(dx² + dy² + dz²) (c = 1). The spatial part *is* perturbed, by the same order of magnitude as the time part. — [Carroll notes §6.1, eq. 6.29](https://arxiv.org/abs/gr-qc/9712019)
- For light, the space part contributes equally: the equivalence-principle/time part gives the "1/2" and space curvature the other "γ/2" of the 1.75″ solar deflection. — [Will 2014, §4.1.1](https://arxiv.org/abs/1403.7377)
- Pössel on the Flamm paraboloid (the embedding diagram of black-hole spatial geometry): "The spatial geometry shown does contribute a little bit to the black hole's gravitational attraction, but… the main contribution in this case that includes the well-known Newtonian effects amounts to time distortion." — [Pössel 2018, §4.2](https://arxiv.org/abs/1812.11589)
- Pössel's "procrastination principle" narrative (after Wheeler 1990; worked out mathematically by Gould 2016; cf. Stannard et al. 2017): free particles follow worldlines of maximal proper time ("free particles procrastinate"). Combined with "regions where time passes more quickly and regions where time passes more slowly," this yields "the Newtonian limit of general relativity: classical gravity encoded in the time-time coefficient of the metric." — [Pössel 2018, §2.2](https://arxiv.org/abs/1812.11589)

### Inferences

**Why replacing force with geometry was natural (four arguments for the writer):**
1. *Universality:* every other force affects different bodies differently (charge/mass ratios differ), but gravity does not. A "force" that every object responds to identically looks more like a feature of the arena than a push. (WEP, MICROSCOPE 10⁻¹⁵.)
2. *Removability:* you can cancel gravity at a point by falling, which is impossible for electromagnetism. Real forces can't be transformed away; geometry's "apparent forces" (like Coriolis or centrifugal forces in a rotating frame) can.
3. *Relativity:* Newton's law F = GMm/r² acts instantaneously and uses "mass" as source. Special relativity forbids instantaneous influence and says energy and momentum, not just rest mass, are what is conserved and frame-related. GR's source is the full stress-energy tensor, and gravitational influences propagate at c.
4. *Data:* Mercury's 43″/century, then light bending (1919), then everything since (Will's review).

**The accurate statement of "everyday gravity is time curvature" (recommended wording):**
- In the weak-field metric, *both* g_tt and the spatial g_ij differ from flat by about 2Φ/c², which is about 1.4×10⁻⁹ at Earth's surface (Φ/c² ≈ −7×10⁻¹⁰ from Ashby).
- In the geodesic equation, the time part enters multiplied by (c dt/dτ)², which is about c². The space part enters multiplied by (dx/dτ)², which is about v². So for a body moving at speed v, the spatial curvature's effect on its path is smaller than the Newtonian (time) effect by about (v/c)². For a thrown ball at 10 m/s that is about 10⁻¹⁵. For Earth orbiting the Sun at 30 km/s it is 10⁻⁸. For light it is 1, which is why light bends twice as much as the equivalence principle alone suggests.
- So the honest formulation is: "For slow objects in weak gravity, using the natural 'Newtonian' coordinates, falling is almost entirely caused by the fact that clocks tick at different rates at different heights. Space is warped by a comparable amount, but slow objects barely notice it; light notices it fully."
- Language caution: "curvature of time" is loose. A one-dimensional time line cannot be intrinsically curved, and the split of spacetime curvature into "space" and "time" parts depends on the chosen coordinates (Pössel's phrase is "time distortion" in "the coordinate description arguably closest to classical physics"). Safer phrases: "warping of time," "position-dependent clock rates," "the g_tt part of the metric." The coordinate-independent object is spacetime curvature.
- A subtler point worth a sidebar: the uniform 9.8 m/s² is precisely the part that *can* be removed by free fall (Pössel's "distortion"). Curvature proper is the tidal part. A uniformly accelerating rocket in flat spacetime has the same clock-rate gradient (gh/c²) and zero curvature. So "gravity = curvature" really means "gravity = a geometry that can be flattened only locally, never globally, and the obstruction is curvature."

**Calculus-level link between clock rates and falling (preview of Key question 4, example 3):** with dτ ≈ (1 + gh/c² − v²/2c²) dt, maximizing total proper time τ between a fixed launch and landing is the same as making ∫(½v² − gh) dt stationary, which is Newton's action. The Euler–Lagrange equation gives ḧ = −g. So "free bodies maximize their aging," together with "high clocks run fast," *is* Newtonian gravity. A thrown ball arcs upward because it gains proper time up high, faster than it loses it by moving fast.

**Tidal numbers (computed for these notes):** Earth's vertical tidal gradient at the surface is 2GM/R³ = 3.1×10⁻⁶ s⁻², so the head–foot acceleration difference for a 2 m person is about 6×10⁻⁶ m/s², roughly 6×10⁻⁷ g. The horizontal convergence gradient is GM/R³ = 1.5×10⁻⁶ s⁻². In Newtonian terms the tidal tensor is ∂ᵢ∂ⱼΦ (the second derivatives of the potential). In GR its relativistic counterpart is the Riemann components R^i_{0j0} ≈ ∂ᵢ∂ⱼΦ/c² that appear in the geodesic-deviation equation d²ξⁱ/dt² = −c²R^i_{0j0} ξʲ. (This is the standard weak-field correspondence; I did not extract it verbatim from a source. Baez & Bunn's §5 uses exactly these R^α_{tβt} components.)

### Gaps
- I did not obtain the full text of Price (2016), "Spatial curvature, spacetime curvature, and gravity," *Am. J. Phys.* 84, 588 (doi:10.1119/1.4955154), which is the dedicated AJP treatment of the time-versus-space-curvature question. Pössel cites it for the "double role of gravity" critique. The writer may want its quantitative examples.
- The exact first printed appearance of Wheeler's sentence remains uncertain. Sources disagree between *Gravitation* (1973) p. 5 (variant wording, "space" not "spacetime"), *A Journey into Gravity and Spacetime* (1990), and *Geons, Black Holes, and Quantum Foam* (1998) p. 235 (the latter only via a quotation site). Safest attribution: "John Archibald Wheeler's well-known summary," noting that wording varies.

---

## Key question 3: The rubber-sheet analogy — what it gets right, its specific flaws, and better alternatives used by educators

### Takeaway
The stretched-sheet demo correctly conveys that mass distorts the medium, that motion follows the distortion, that gravity has no cutoff distance, and Wheeler's two-way relationship. It is misleading in at least six documented ways: it uses gravity to explain gravity, shows space but not time (yet time distortion produces Newtonian gravity), relies on an extra embedding dimension and extrinsic curvature, introduces a preferred rest frame, gives the wrong orbits, and has been shown to plant misconceptions in students. Better tools are geodesics on real curved surfaces (great circles, travellers converging, triangles and circles drawn on balloons), sector models, and spacetime "time-warp" diagrams based on maximal aging.

### Cited Findings
(Main source: Markus Pössel, "Relatively complicated? Using models to teach general relativity at different levels," arXiv:1812.11589, based on an invited talk at the 2017 DPG Spring Meeting. Citations of other papers below come from Pössel's reference list; I did not read those papers individually.)

**Prevalence:** the sheet appears in textbooks (Berry 1976; Bennett et al. 2017), popular books (from Harrow 1920 and Gamow 1947 to Greene 1999/2004, Hawking 2001), education and outreach, and Carl Sagan's *Cosmos* (1980). A Dan Burns (Los Gatos High School) spandex demo video had more than 53 million YouTube views by December 2018. "Swimwear fabric is a suitable material for demonstration experiments." — [Pössel §4](https://arxiv.org/abs/1812.11589)

**What it gets right (Pössel §4.1):**
- "Masses distort the surrounding spacetime; the spheres distort the elastic sheet. Spacetime distortion decreases as you move away from a mass; so does sheet distortion." It reproduces straight motion with no mass, curved orbits near a mass, approximate angular-momentum conservation, a qualitative Kepler's second law, and "John Wheeler's famous two-sentence version of general relativity." — [Pössel §4.1](https://arxiv.org/abs/1812.11589)
- It shows "gravity doesn't just stop at a certain distance," countering misconceptions such as "no gravity in space," or that ISS astronauts are weightless because they are beyond Earth's gravity. — [Pössel §4.1](https://arxiv.org/abs/1812.11589)
- It shows gravity mediated by the environment rather than action at a distance, and can prepare students for a finite propagation speed and gravitational waves. — [Pössel §4.1](https://arxiv.org/abs/1812.11589)
- Evidence: a pillow-and-spheres "Einstein before Newton" approach outperformed a variant of teaching Newton's law to French 9th-graders (Baldy 2007, *Int. J. Sci. Educ.* 29, 1767). — [Pössel §4.1](https://arxiv.org/abs/1812.11589)

**Specific flaws (Pössel §4.2):**
1. *Gravity explains gravity:* "Probably the most common objection… is the confusing double role played by gravity (Greene 1999, Price 2016, Janis 2018). The heavy sphere distorts the elastic sheet because of its weight, in other words: because of the Earth's gravity. We are presupposing the existence of gravity in order to explain gravity." (xkcd #895 lampoons this.) — [Pössel §4.2](https://arxiv.org/abs/1812.11589)
2. *Space, not spacetime; time omitted:* "the model, by its nature, emphasises the role of distorted space over the role of time, and students might be confused whether it is space or spacetime that is curved." Sagan's line "gravity is only a pucker in the fabric of space" implies "that time is not affected." Yet in the Newtonian limit "the Newtonian part of gravity is purely an effect of time distortion, encoded in the metric coefficient g_tt… This time distortion… is not shown directly in the model." — [Pössel §4.2](https://arxiv.org/abs/1812.11589)
3. *Preferred rest frame:* "Any material medium, such as the elastic sheet, introduces a privileged standard of rest," contrary to relativity. — [Pössel §4.2](https://arxiv.org/abs/1812.11589)
4. *Dimensional mismatch:* masses should be 2D objects within the 2D "space," but the spheres are 3D and sit on top. The special plane of the sheet also hides the spherical symmetry of a mass's gravity (Gould 2016). — [Pössel §4.2](https://arxiv.org/abs/1812.11589)
5. *Embedding and extrinsic curvature:* one dimension of the demo "does not correspond to any physical space dimension, but is merely an auxiliary dimension." More fundamentally, "In general relativity, what counts is the intrinsic curvature… But in the elastic sheet model, the embedding, and thus extrinsic curvature, is an integral part of the model… the angle between the surface normal and the vertical direction defined by Earth's gravity determines the acceleration. Gravity, in this model, is not just geometry." — [Pössel §4.2](https://arxiv.org/abs/1812.11589)
6. *Wrong dynamics:* there is friction, and "even without friction, motion on a distorted elastic sheet differs significantly from motion in a gravitational field… notably concerning the shape of the orbit and the orbital speed" (Hähnel 2007; Middleton & Langston 2014; Middleton & Weller 2016). — [Pössel §4.2](https://arxiv.org/abs/1812.11589); primary papers: [Middleton & Langston, "Circular orbits on a warped spandex fabric," *Am. J. Phys.* 82, 287 (2014)](https://doi.org/10.1119/1.4848635); [Middleton & Weller, *Am. J. Phys.* 84, 284 (2016)](https://doi.org/10.1119/1.4940246)
7. *Confusion with other diagrams:* the sheet resembles a "gravity well" plot of potential, and half of the Flamm paraboloid (the embedding of black-hole spatial geometry). These are different things. — [Pössel §4.2](https://arxiv.org/abs/1812.11589)
8. *Measured misconceptions:* "some of the misunderstandings have been reproduced 'in the field,' in tests on upper secondary school students who had been taught about gravity using the elastic sheet model" (Kersting & Steier 2018, "Understanding Curved Spacetime: The Role of the Rubber Sheet Analogy in Learning General Relativity," *Science & Education* 27, 593). — [Pössel §4.2](https://arxiv.org/abs/1812.11589); [Kersting & Steier 2018, doi](https://doi.org/10.1007/s11191-018-9997-4)
- Other critiques cited: [Price 2016, *Am. J. Phys.* 84, 588](https://doi.org/10.1119/1.4955154); [Janis 2018, "On Mass, Spacetime Curvature, and Gravity," *Phys. Teach.* 56, 12](https://doi.org/10.1119/1.5018679)

**Better alternatives used by educators:**
- *Geodesics on Earth:* great-circle flight routes (Gould 2016; Stannard et al. 2017). Weinberg's exercise (1972) asks readers to determine from four mutual distances whether Tolkien's Middle-earth is flat. — [Pössel §4.3](https://arxiv.org/abs/1812.11589)
- *Two travellers heading north from the equator* converge without any force. — [Baez & Bunn §2](https://arxiv.org/abs/gr-qc/0103044)
- *Russell's lantern parable (1925):* night-time travellers avoiding a hill around a beacon trace curved paths, and an observer in a balloon infers "something" around the beacon. Lindemann's golf-course image is similar. — [Pössel §4.3](https://arxiv.org/abs/1812.11589)
- *Hands-on intrinsic-curvature measurements (the "ants on a surface" approach):* draw circles on a squash or balloon and measure radius with a paper strip and circumference with a map-measurer (opisometer), then infer curvature from C/r (Effing 1977). Tape paper-strip triangles on spherical or saddle surfaces and sum their angles (Wood, Smith & Jackson 2016; Sellentin 2013). A model "Chinese South-Seeking Chariot" physically parallel-transports a pointer (Santander 1992). — [Pössel §4.3](https://arxiv.org/abs/1812.11589)
- *Sector models (Zahn & Kraus):* curved 2D or 3D space is cut into small flat pieces (polyhedra) that fit together only with gaps or overlaps when curvature is present, so students "build" a black hole's spatial geometry and draw geodesics. (Based on diSessa's 1981 "wedgie calculus," a play on Regge calculus.) — [Pössel §5](https://arxiv.org/abs/1812.11589); [Zahn & Kraus 2014, "Sector models – A toolkit for teaching general relativity: I," *Eur. J. Phys.* 35, 055020](https://doi.org/10.1088/0143-0807/35/5/055020)
- *Time-warp / maximal-aging narrative:* the "procrastination principle" (Wheeler 1990; Gould 2016; Stannard et al. 2017, "Why did the apple fall? A new model to explain Einstein's gravity," *Eur. J. Phys.* 38, 015603) puts time distortion, which the sheet omits, at the centre. Also part of the Australian "Einstein-First" school program (Kaur et al. 2017, *Phys. Educ.* 52, 065012). — [Pössel §2.2](https://arxiv.org/abs/1812.11589); [Stannard et al. 2017](https://doi.org/10.1088/0143-0807/38/1/015603); [Kaur et al. 2017](https://doi.org/10.1088/1361-6552/aa83e4)
- *River model* of black holes (space "flowing" inward), which Pössel notes reproduces orbits faithfully, unlike the sheet. — [Pössel §5.4 and fn. 9](https://arxiv.org/abs/1812.11589)

### Inferences
- Suggested teaching sequence for Ch. 4/5: (1) show the sheet briefly, *naming* its flaws (the "gravity explains gravity" circularity is a good discussion question); (2) switch to intrinsic geometry with ants or travellers on a sphere, triangles summing to more than 180°, and circles with C < 2πr; (3) introduce the time dimension with a spacetime diagram and the "maximal aging" principle; (4) note that light, moving at c, also feels the spatial warping, giving the factor of 2 in light bending.
- A good one-line verdict: "The rubber sheet is a picture of the *answer* for orbits, drawn with the wrong *mechanism*."
- Flag "embedding diagrams" (funnel pictures of black holes) as legitimate, but explain that they show only the curved geometry of a 2D *spatial slice*, not spacetime, and that the "up/down" direction is fictitious.

### Gaps
- I did not read the primary papers by Price (2016), Janis (2018), Kersting & Steier (2018), Middleton & Langston (2014) or Stannard et al. (2017). Their content is reported via Pössel's review. Kersting & Steier's specific misconception categories and statistics are therefore not given here.
- Pössel's paper is an arXiv preprint with no journal listed on the abstract page.

---

## Key question 4: The mathematics, conceptually — coordinates; scalars, vectors and tensors without linear algebra; the metric from Pythagoras to g_μν; index notation and summation; geodesics and Christoffel symbols; intrinsic versus extrinsic curvature; the Riemann and Ricci tensors and Ricci scalar; the stress-energy tensor and why pressure gravitates; Einstein's field equations; the size of 8πG/c⁴; and the Newtonian limit

### Takeaway
GR's mathematics is a disciplined way of measuring distances and times with a position-dependent "table of coefficients," the metric g_μν. Free bodies follow the straightest possible paths (geodesics) in it. Curvature (Riemann) measures how nearby straight paths converge or diverge, i.e., tides. Einstein's equation says one particular average of that curvature equals the local energy, momentum, pressure and stress, scaled by the tiny constant 8πG/c⁴ ≈ 2.1×10⁻⁴³ N⁻¹. Baez & Bunn's plain-English form makes the equation accessible: a small ball of free-falling particles starts to shrink at a rate set by (energy density + the three pressures). In the weak, slow limit it reduces exactly to Newton's ∇²Φ = 4πGρ.

### Cited Findings

**The metric and its many roles (Carroll):**
- The metric "supplies a notion of 'past' and 'future'; (2)… allows the computation of path length and proper time; (3)… determines the 'shortest distance' between two points (and therefore the motion of test particles); (4)… replaces the Newtonian gravitational field φ; (5)… provides a notion of locally inertial frames and therefore a sense of 'no rotation'; (6)… determines causality, by defining the speed of light…; (7)… replaces the traditional Euclidean three-dimensional dot product." The line element is written ds² = g_μν dx^μ dx^ν, and "metric" and "line element" are used interchangeably. Euclidean example: ds² = (dx)² + (dy)² + (dz)². Unit 2-sphere: ds² = dθ² + sin²θ dφ² (eq. 2.33). — [Carroll notes §2.5, eqs. 2.29–2.33](https://arxiv.org/abs/gr-qc/9712019)
- Minkowski metric: η_μν = diag(−1, 1, 1, 1) in (t, x, y, z) with c = 1, and s² = η_μν Δx^μ Δx^ν. — [Carroll notes §1, eqs. 1.8–1.9](https://arxiv.org/abs/gr-qc/9712019)

**Index notation and summation:**
- "we use the summation convention, in which indices which appear both as superscripts and subscripts are summed over." — [Carroll notes §1](https://arxiv.org/abs/gr-qc/9712019)

**Coordinates carry no physical meaning by themselves:**
- "if a metric is a solution to Einstein's equation in one coordinate system x^μ it should also be a solution in any other coordinate system x^μ′. This means that there are four unphysical degrees of freedom in g_μν (represented by the four functions x^μ′(x^μ))." — [Carroll notes §4.4](https://arxiv.org/abs/gr-qc/9712019)
- Christoffel symbols are nonzero in curvilinear coordinates even in flat space. In flat polar coordinates Γ^θ_rθ = Γ^θ_θr = 1/r (and Γ^r_θθ = −r). "The existence of nonvanishing connection coefficients in curvilinear coordinate systems is the ultimate cause of the formulas for the divergence and so on that you find in books on electricity and magnetism." Conversely, in curved space they can be made to vanish at any one point, but not throughout a neighbourhood. — [Carroll notes §3.2, eq. 3.25](https://arxiv.org/abs/gr-qc/9712019)
- Smallness of the metric perturbation h_μν "doesn't really make sense in other coordinates" than Cartesian. Coordinate-dependence again. — [Carroll notes §4.1](https://arxiv.org/abs/gr-qc/9712019)

**Vectors as arrows at a point (non-linear-algebra framing):**
- "in general relativity, we take very seriously the notion that a vector is a little arrow sitting at a particular point in spacetime. To compare vectors at different points of spacetime, we must carry one over to the other… 'parallel transport'." Curved spacetime "need not be embedded in some higher-dimensional flat spacetime for us to understand its curvature… The mathematics of tensor calculus is designed to let us handle these concepts 'intrinsically'." — [Baez & Bunn §2](https://arxiv.org/abs/gr-qc/0103044)

**Geodesics and proper time:**
- A test particle in free fall traces a geodesic: "its velocity vector is parallel transported along the curve it traces out… the closest thing there is to a straight line." A person "walking on a sphere 'following their nose' will trace out a geodesic — that is, a great circle." — [Baez & Bunn §2](https://arxiv.org/abs/gr-qc/0103044)
- Timelike geodesics "cannot… be curves of minimum proper time, since they are always infinitesimally close to curves of zero proper time; in fact they maximize the proper time. (This is how you can remember which twin in the twin paradox ages more — the one who stays home is basically on a geodesic, and therefore experiences more proper time.)" The maximum is local: e.g., two great-circle routes between points on a sphere. — [Carroll notes §3.3](https://arxiv.org/abs/gr-qc/9712019)
- Newtonian-limit geodesic equation: d²x^μ/dτ² + Γ^μ₀₀ (dt/dτ)² = 0 (slow motion), with Γ^μ₀₀ = −½ g^μλ ∂_λ g₀₀ for a static field. — [Carroll notes §4.1, eqs. 4.11–4.12](https://arxiv.org/abs/gr-qc/9712019)

**Flatness and curvature:**
- Signs of flatness: "parallel transport around a closed loop leaves a vector unchanged… covariant derivatives of tensors commute, and… initially parallel geodesics remain parallel." In curved space, parallel transport around a loop transforms the vector, by an amount that "depends on the total curvature enclosed by the loop." The Riemann tensor is the local (per-point) description. — [Carroll notes §3.6](https://arxiv.org/abs/gr-qc/9712019)
- Sphere illustration: parallel-transporting a tangent vector from the North Pole straight down one meridian to the equator gives a different result than going down another meridian and then along the equator. — [Baez & Bunn §2](https://arxiv.org/abs/gr-qc/0103044)
- Intrinsic versus extrinsic: "realising the difference between intrinsic curvature as a property of a curved two-dimensional surface…, and extrinsic curvature as a property of the embedding of that two-dimensional surface in space, was the key idea that allowed Gauss to develop differential geometry." GR uses intrinsic curvature. — [Pössel §4.2](https://arxiv.org/abs/1812.11589)

**Riemann tensor:**
- The number of independent components in n dimensions is n²(n² − 1)/12. "In four dimensions, therefore, the Riemann tensor has 20 independent components. (In one dimension it has none.) These twenty functions are precisely the 20 degrees of freedom in the second derivatives of the metric which we could not set to zero by a clever choice of coordinates." — [Carroll notes §3.6, eq. 3.85](https://arxiv.org/abs/gr-qc/9712019)

**Ricci tensor and the falling ball (Baez & Bunn):**
- In local inertial coordinates where a small ball of test particles starts at rest, lim(V→0) V̈/V|ₜ₌₀ = −R_tt. "In short, the Ricci tensor says how our ball of freely falling test particles starts changing in volume. The Ricci tensor only captures some of the information in the Riemann curvature tensor. The rest is captured by… the 'Weyl tensor', which says how any such ball starts changing in shape." The Ricci tensor is the contraction R_βδ = R^α_βαδ. — [Baez & Bunn §5, eq. 7](https://arxiv.org/abs/gr-qc/0103044)
- **The plain-English Einstein equation:** "Given a small ball of freely falling test particles initially at rest with respect to each other, the rate at which it begins to shrink is proportional to its volume times: the energy density at the center of the ball, plus the pressure in the x direction at that point, plus the pressure in the y direction, plus the pressure in the z direction." In units c = 8πG = 1: V̈/V|ₜ₌₀ = −½(ρ + P_x + P_y + P_z). It contains *all* of Einstein's equation provided one considers "small balls with all possible initial velocities." Isotropic version: "the energy density at the center of the ball plus three times the pressure." — [Baez & Bunn §3, eq. 2](https://arxiv.org/abs/gr-qc/0103044)
- With c and G restored and ρ = ρ_m c²: V̈/V|ₜ₌₀ = −4πG[ρ_m + (P_x + P_y + P_z)/c²]. "On the human scale all of the terms on the right are small, since G is very small… the pressure terms are much smaller than the mass density term, since they are divided by an extra factor of c²." — [Baez & Bunn §4](https://arxiv.org/abs/gr-qc/0103044)
- Before the volume starts changing, the ball distorts into an ellipsoid only "to second order in time," because the particles start with zero relative velocity. — [Baez & Bunn §3](https://arxiv.org/abs/gr-qc/0103044)

**Stress-energy tensor:**
- "The components T_αβ of this matrix say how much momentum in the α direction is flowing in the β direction through a given point of spacetime… The flow of t-momentum in the t-direction is just the energy density, often denoted ρ. The flow of x-momentum in the x-direction is the 'pressure in the x direction' denoted P_x." "It takes a while to figure out why pressure is really the flow of momentum… Most texts explain this fact by considering the example of an ideal gas." — [Baez & Bunn §3](https://arxiv.org/abs/gr-qc/0103044)
- Carroll: T^μν is "a symmetric (2, 0) tensor which tells us all we need to know about the energy-like aspects of a system: energy density, pressure, stress, and so forth. A general definition of T^μν is 'the flux of four-momentum p^μ across a surface of constant x^ν'." A perfect fluid ("isotropic in its rest frame") has a diagonal T^μν = diag(ρ, p, p, p) in its rest frame. Dust is a perfect fluid with zero pressure. — [Carroll notes §1.9, eq. 1.107](https://arxiv.org/abs/gr-qc/9712019)
- Why pressure gravitates, with examples: "not only energy density but also pressure causes gravitational attraction… In a neutron star… pressure and energy density contribute comparably… above a mass of about 2 solar masses a nonrotating neutron star will inevitably collapse to form a black hole, thanks in part to the gravitational attraction caused by pressure." — [Baez & Bunn §4](https://arxiv.org/abs/gr-qc/0103044)
- Negative pressure and the cosmological constant: the vacuum's stress-energy is diag(Λ, −Λ, −Λ, −Λ) (energy density Λ, pressure −Λ), so "ρ + 3P for the vacuum is −2Λ. Here pressure effects dominate because there are more dimensions of space than of time!" With Λ > 0, "a roughly exponential expansion will then ensue." — [Baez & Bunn §4, "The Cosmological Constant"](https://arxiv.org/abs/gr-qc/0103044)

**Einstein's field equations:**
- Usual form (c = 8πG = 1): G_αβ = T_αβ, with G_αβ = R_αβ − ½ g_αβ R (R = R^γ_γ, the Ricci scalar). Taking the trace gives −R = T, so equivalently R_αβ = T_αβ − ½ g_αβ T. This is the "trace-reversed" form, which "gives a formula for the Ricci tensor, which has a simple geometrical meaning." — [Baez & Bunn §5, eqs. 8–9](https://arxiv.org/abs/gr-qc/0103044)
- With units: R_μν − ½ R g_μν = 8πG T_μν (Carroll, c = 1). "Einstein's equations may be thought of as second-order differential equations for the metric tensor field g_μν. There are ten independent equations (since both sides are symmetric two-index tensors)… However, the Bianchi identity ∇^μ G_μν = 0 represents four constraints… so there are only six truly independent equations." This matches the four coordinate freedoms. — [Carroll notes §4.4, eq. 4.52](https://arxiv.org/abs/gr-qc/9712019); also [Wikipedia: "four Bianchi identities reduce the number of independent equations from 10 to 6"](https://en.wikipedia.org/wiki/Einstein_field_equations)
- κ = 8πG/c⁴ ≈ 2.07665 × 10⁻⁴³ N⁻¹. The G_μν + Λg_μν = κT_μν form shown on Wikipedia follows the MTW sign conventions. — [Wikipedia, Einstein field equations](https://en.wikipedia.org/wiki/Einstein_field_equations)
- Normalization is fixed by the Newtonian limit: the 00 component gives ∇²h₀₀ = −κT₀₀, which matches Poisson's equation when κ = 8πG (c = 1). — [Carroll notes §4.4, eqs. 4.50–4.52](https://arxiv.org/abs/gr-qc/9712019)

**Newtonian limit:**
- Three conditions: particles move slowly compared with c, the field is weak (a perturbation of flat space), and the field is static. Then d²xⁱ/dt² = ½∂ᵢh₀₀, which is Newton's law with h₀₀ = −2Φ, i.e., g₀₀ = −(1 + 2Φ), and Φ = −GM/r. — [Carroll notes §4.1, eqs. 4.10–4.22](https://arxiv.org/abs/gr-qc/9712019)
- Newton's law from the falling-ball form (Baez & Bunn): fill a sphere S of radius r around a planet with test particles. Tiny balls inside the planet shrink (V̈/V = −½ρ in their units), tiny balls outside don't change volume (only shape), so S shrinks by exactly the planet's share. Equating this to the radial infall 4πr²δr with δr = ½aδt² gives a = −M/(8πr²) in units 8πG = 1, i.e., a = −GM/r², "just as Newton said." — [Baez & Bunn §4](https://arxiv.org/abs/gr-qc/0103044)
- Schwarzschild metric (vacuum outside any spherical mass): ds² = −(1 − 2GM/r)dt² + (1 − 2GM/r)⁻¹dr² + r²dΩ² (c = 1). M is the mass measured by distant orbits, and as r → ∞ it becomes flat ("asymptotic flatness"). — [Carroll notes §7.1, eq. 7.29](https://arxiv.org/abs/gr-qc/9712019). Schwarzschild radius R = 2GM/c². — [Baez & Bunn §4](https://arxiv.org/abs/gr-qc/0103044)

### Inferences (explanations and examples, built from the cited facts)

**1. Coordinates.** Coordinates are labels, like house numbers, not measurements. The *same* point in a plane is (x, y) = (1, 1) or (r, θ) = (√2, 45°). A change Δθ of 0.01 rad means 1 cm of real distance at r = 1 m but 1 m at r = 100 m. To turn coordinate changes into real distances you need the metric. In GR this is unavoidable: the Schwarzschild "r" is *defined* so that a circle has circumference 2πr, but radial distance between r₁ and r₂ is *not* r₂ − r₁ (see Key question 5, example 5). Lesson: physics lives in the metric and in invariants, not in coordinate values.

**2. Scalars, vectors, tensors without linear algebra.**
- *Scalar:* one number at each point that every observer agrees on. Examples: the temperature reading on a thermometer, the proper time a clock records between two events, the Ricci scalar R.
- *Vector:* an arrow at one point (Baez & Bunn). Its components (how much "east," how much "north") depend on your axes, but the arrow does not. In spacetime it has four components (t, x, y, z), e.g., the 4-velocity.
- *Tensor:* a "machine" that eats arrows and returns numbers, or equivalently a table of components that changes in a definite way when you change coordinates. The number of indices is the rank. Examples a first-year student already knows: (a) the metric is a 2-slot machine that takes two displacement arrows and returns their "dot product." Feed it the same arrow twice and you get its squared length (Carroll's role (7)). (b) The engineering stress tensor: give it a surface orientation and it returns the force per area across that surface. Pressure in a fluid is the special case where the answer is the same in every direction. Baez & Bunn's "momentum in direction α flowing through direction β" is the spacetime version.
- Why physicists insist on tensors: an equation of the form "tensor = tensor" that holds in one coordinate system holds in all of them, so the law cannot secretly depend on labels. Baez & Bunn use exactly this when they say Einstein's equation holds if one component holds "in all local inertial coordinate systems."

**3. The metric ladder (each rung is calculus plus Pythagoras):**
- *Flat plane, Cartesian:* ds² = dx² + dy². This is Pythagoras for an infinitesimal right triangle. Arc length L = ∫ √(1 + (dy/dx)²) dx is the Calc II formula; it *is* this line element.
- *Flat plane, polar:* ds² = dr² + r²dθ². The plane is still flat, but the coefficient of dθ² now depends on position. Lesson: position-dependent coefficients do not, by themselves, imply curvature. The coefficient table is g_rr = 1, g_θθ = r², g_rθ = 0.
- *Skewed axes (shows off-diagonal entries):* if the x- and y-axes meet at angle α, the law of cosines gives ds² = dx² + 2cos α dx dy + dy². In the table this is g_xx = g_yy = 1 and g_xy = g_yx = cos α, and the "2" comes from summing g_xy and g_yx. (Derived here; elementary geometry.)
- *Surface of a sphere of radius R:* ds² = R²(dθ² + sin²θ dφ²), with θ the polar angle (colatitude) and φ the longitude. A step in longitude is worth less distance near the poles, since sin θ → 0 there. Unlike polar coordinates, *no* change of coordinates can turn this into dx² + dy² everywhere, because the sphere is intrinsically curved (Carroll's unit-sphere eq. 2.33 times R²).
- *Minkowski spacetime:* ds² = −c²dt² + dx² + dy² + dz². The minus sign is all of special relativity. For a clock, proper time is dτ = √(−ds²)/c. A clock at rest has dτ = dt; a moving clock has dτ = √(1 − v²/c²) dt.
- *Weak gravity (Carroll's eq. 6.29 with c restored):* ds² = −(1 + 2Φ/c²)c²dt² + (1 − 2Φ/c²)(dx² + dy² + dz²). For a clock at rest, dτ = √(1 + 2Φ/c²) dt ≈ (1 + Φ/c²) dt. That is the gravitational time-dilation formula of Key question 1, read straight off the metric. Lower Φ (more negative) means slower clocks.
- *Schwarzschild:* ds² = −(1 − r_s/r)c²dt² + dr²/(1 − r_s/r) + r²(dθ² + sin²θ dφ²), with r_s = 2GM/c². Computed: r_s(Earth) = 8.87 mm, r_s(Sun) = 2.95 km.
- *General metric tensor g_μν:* a 4×4 table of position-dependent coefficients with indices μ, ν ∈ {0, 1, 2, 3} = {t, x, y, z}. It is symmetric (g_μν = g_νμ), so 10 independent entries. These 10 functions of (t, x, y, z) are the unknowns Einstein's equations solve for.

**4. Index notation and summation, simply.** ds² = g_μν dx^μ dx^ν means: "for every pair (μ, ν), multiply the table entry g_μν by the two coordinate steps and add all 16 products." For a diagonal table (Cartesian, polar, sphere, Minkowski, Schwarzschild), only the 4 "matching" terms survive. Up versus down indices: coordinates and displacements carry upper indices (dx^μ), the metric lower ones. The rule "a repeated index, once up and once down, means sum over it" (Carroll) saves writing Σ signs. A first exercise for the reader: expand ds² = g_μν dx^μ dx^ν for the polar metric and confirm you get dr² + r²dθ².

**5. Geodesics and Christoffel symbols, in words.**
- A geodesic is the "straightest possible" path: one that never turns left or right *within* the surface (an ant walking straight ahead; Baez & Bunn's "following their nose"). On a sphere these are great circles, which is why flight routes from New York to Europe arc north.
- In space, geodesics are locally shortest. In spacetime, timelike geodesics are locally *longest* in proper time (Carroll), so free bodies "age the most."
- Schematic geodesic equation: d²x^μ/dτ² + Γ^μ_αβ (dx^α/dτ)(dx^β/dτ) = 0. In words: "coordinate acceleration + (correction terms built from how the metric coefficients change from place to place) × (velocity)(velocity) = 0." The Christoffel symbols Γ are built from first derivatives of the metric. They describe how your coordinate grid stretches and twists, plus gravity's local pull. They are *not* tensors and can be made zero at any single point by choosing a free-falling frame (Carroll), which is the equivalence principle in mathematical form.
- Calc-level demo that Christoffel symbols appear even in flat space: a straight line in polar coordinates obeys r̈ − r θ̇² = 0 and θ̈ + (2/r)ṙθ̇ = 0. These are the polar geodesic equations, using Carroll's Γ^r_θθ = −r and Γ^θ_rθ = 1/r. The "r θ̇²" term is the familiar centrifugal term, a coordinate effect rather than a force. Students can check this by plugging in the line x = 1, i.e., r = 1/cos θ. This is the perfect bridge: "gravity" in GR is to Christoffel symbols what centrifugal force is to polar coordinates, except that curvature prevents removing it everywhere at once.

**6. Intrinsic versus extrinsic curvature: cylinder versus sphere.**
- A cylinder can be unrolled into a flat sheet without stretching. Ants on it measure triangle angle sums of exactly 180° and circle circumferences of exactly 2πr. Its curvature is entirely *extrinsic* (it only looks bent from 3D outside). Its Gaussian curvature K = 1/(R₁R₂) = 1/(R·∞) = 0.
- A sphere cannot be flattened without tearing or stretching (which is why every world map distorts). Ants measure angle sums greater than 180° and circumferences less than 2πr. Its curvature is *intrinsic*, with K = 1/R². A saddle has K < 0: angle sums less than 180° and C > 2πr.
- Triangle angle excess on a sphere (Girard's theorem): (sum of angles − π) = Area/R². Example: North Pole plus two equator points 90° of longitude apart gives three 90° angles (270°). The area is 1/8 of the sphere = πR²/2, so the excess = π/2 = 90°. ✓
- Parallel transport around that same triangle rotates a carried arrow by 90°, equal to the enclosed area/R². This is the angle-excess fact again, and it ties directly to the Baez & Bunn and Carroll definitions of curvature as path dependence.
- (Gauss's Theorema Egregium, K = 1/(R₁R₂) and Girard's theorem are standard results not separately sourced here; Pössel's statement on Gauss is cited above.)

**7. Riemann, Ricci, Ricci scalar: what each measures (beginner framing).**
- *Riemann R^ρ_σμν (4 indices, 20 independent numbers in 4D):* the complete local curvature. Operationally it is the tidal tensor: it tells you how the separation between two nearby free-falling particles accelerates (geodesic deviation), and how much an arrow rotates when carried around a tiny loop. Component count from Carroll's n²(n²−1)/12: 1 in 2D (just the Gaussian curvature), 6 in 3D, 20 in 4D.
- *Ricci R_μν (10 numbers):* an average ("trace") of Riemann. It measures the *volume* change of a small ball of free-falling particles, i.e., focusing (Baez & Bunn, V̈/V = −R_tt).
- *Weyl tensor (the remaining 10 = 20 − 10):* shape change at fixed volume, i.e., tidal stretching and squeezing in vacuum and gravitational waves (Baez & Bunn). In empty space around Earth Ricci = 0 but Weyl ≠ 0. That is why the Moon raises tides on Earth through vacuum. The 10 + 10 split is arithmetic from the component counts.
- *Ricci scalar R (1 number):* the trace of Ricci, an overall "how curved, on average" number at a point. For a 2D surface R = 2K (standard result). In Einstein's equation it appears in the Einstein tensor.
- Analogy: Riemann is a full weather report, Ricci is the local pressure-driven "squeeze" of a ball of air, and Weyl is the wind shear that distorts its shape.

**8. The stress-energy tensor, as a 4×4 table (c restored).**

| | t column | x, y, z columns |
|---|---|---|
| **t row** | T^00 = energy density (for ordinary matter ≈ ρ_m c²) | T^0i = energy flux / c = momentum density × c |
| **x, y, z rows** | T^i0 = momentum density × c (equal to T^0i; T is symmetric) | T^ij = momentum flux = stress. Diagonal T^xx, T^yy, T^zz = pressures; off-diagonal = shear stresses |

- Perfect fluid at rest: diag(ρc², P, P, P). Dust: P = 0. Vacuum energy / Λ: P = −ρc² (Baez & Bunn).
- *Why pressure gravitates:* in the falling-ball equation the source is ρ + (P_x + P_y + P_z)/c². Everyday sizes (computed for these notes): air pressure 1.013×10⁵ Pa divided by c² is 1.1×10⁻¹² kg/m³, against air's mass density of 1.2 kg/m³. So pressure's gravity is about 10⁻¹² of mass's. In neutron stars it is comparable, and it helps push stars above about 2 solar masses into collapse (Baez & Bunn). Negative pressure (Λ) makes ρ + 3P/c² negative, so gravity *repels*, which is accelerating cosmic expansion.
- Radiation (light gas) has P = ρc²/3, so ρ + 3P/c² = 2ρ. A box of light attracts twice as strongly as the same energy in cold dust. This links to light deflecting twice the "Newtonian" amount. (P = ρc²/3 for radiation is standard; not separately sourced.)
- Common oversimplification: "pressure pushes outward, so it must fight gravity." Pressure *gradients* push matter outward (that holds stars up), while pressure *itself* is a source of gravity. Both are true at once.

**9. Einstein's field equations, every symbol.**

G_μν + Λ g_μν = (8πG/c⁴) T_μν, where G_μν ≡ R_μν − ½ R g_μν

- μ, ν: labels running over 0, 1, 2, 3 (t, x, y, z). One equation per (μ, ν) pair, 16 in all, but symmetry leaves 10 distinct ones. The Bianchi identity makes 4 of those automatically consistent (they encode energy–momentum conservation), leaving 6 that constrain geometry. The other 4 functions are the coordinate freedom (Carroll; Wikipedia).
- g_μν: the metric, the unknown (10 functions of spacetime).
- R_μν: Ricci tensor, built from first and second derivatives of g_μν (focusing/volume change).
- R: Ricci scalar = g^μν R_μν (overall curvature).
- G_μν: the Einstein tensor, the specific combination whose "divergence" is identically zero. That property is why it, and not R_μν alone, must sit opposite T_μν, whose divergence is zero by energy–momentum conservation. (This motivation is standard; Carroll's notes mention the Bianchi identity ∇^μ G_μν = 0.)
- Λ: the cosmological constant (units m⁻²). Moved to the right-hand side, it acts like vacuum energy with negative pressure (Baez & Bunn).
- T_μν: stress-energy tensor (energy density, momentum density and flux, pressure, stress).
- 8πG/c⁴: the coupling constant κ ≈ 2.08×10⁻⁴³ N⁻¹ (equivalently m/J or s²/(kg·m)). G is Newton's constant and c the speed of light. The 8π is fixed by requiring the Newtonian limit (Carroll).
- Character: 10 coupled, nonlinear, second-order partial differential equations for g_μν (Carroll: "second-order differential equations for the metric").

**10. How big is 8πG/c⁴, and the "stiff spacetime" picture (computed for these notes).**
- κ = 8πG/c⁴ = 2.0766×10⁻⁴³ N⁻¹, matching Wikipedia. Its inverse c⁴/(8πG) = 4.8×10⁴² N (newtons). Units check: curvature (m⁻²) = κ (N⁻¹) × energy density (J/m³ = N/m²) ✓.
- Interpretation as an elastic modulus: Einstein's equation reads "curvature = (1/stiffness) × energy density," with the stiffness c⁴/(8πG) ≈ 5×10⁴² Pa. Compare steel's Young's modulus of about 2×10¹¹ Pa: spacetime is about 10³¹ times "stiffer." (The "stiffness" language is a pedagogical metaphor, not a standard technical term.)
- Concrete scale: inside a medium with the density of water (energy density ρc² ≈ 9×10¹⁹ J/m³), the curvature scale is 1/√(κρc²) ≈ 2.3×10¹¹ m ≈ 1.5 AU. At Earth's mean density (5,514 kg/m³) it is about 1×10¹¹ m, some 15,000 Earth radii. That is why spacetime around everyday objects is so nearly flat, and why it took a planet or star to notice anything.
- Related dimensionless measure of field strength: GM/(Rc²) ≈ 7×10⁻¹⁰ at Earth's surface, 2.1×10⁻⁶ at the Sun's surface, and about 0.1–0.2 for neutron stars (the neutron-star range is approximate and not computed here). GR corrections to Newton scale with this number.

**11. The Newtonian limit: how GR reduces to Newton (outline for Ch. 5).**
- Step 1 (motion): slow particles in a weak static field obey d²x/dt² = −∇Φ if g_tt = −(1 + 2Φ/c²). Only the clock-rate part of the metric matters (Carroll).
- Step 2 (field): the 00 component of Einstein's equation becomes ∇²Φ = 4πGρ, Newton's law in Poisson (Gauss) form. For a point mass outside the source this gives Φ = −GM/r and g = −GM/r² (Carroll; Baez & Bunn).
- Calculus-student version of Step 2 (Baez & Bunn's falling ball): Newtonian gravity says the "divergence" of the gravity field is −4πGρ. A ball of free particles then has V̈/V = −4πGρ_m, which is exactly Baez & Bunn's equation with the pressure terms dropped. Their sphere-filling argument turns this into a = −GM/r² with only volume formulas (4πr²δr) and δr = ½aδt².
- What is *lost* in the limit: pressure as a source, gravitomagnetism (moving masses), light bending's second half, perihelion precession, gravitational waves and black holes. These are the "beyond Newton" topics.

### Gaps
- I did not source a numerical value of Λ (about 1.1×10⁻⁵² m⁻² from Planck-era cosmology) in this session. Verify before quoting.
- The neutron-star compactness range (0.1–0.3) is from general knowledge, not a fetched source.
- Gaussian curvature formulas, Girard's theorem, "R = 2K in 2D," and P = ρc²/3 for radiation are standard textbook results not explicitly extracted from a fetched source.
- The geodesic-deviation formula with R^i_{0j0} ≈ ∂ᵢ∂ⱼΦ/c² is standard (e.g., MTW, Carroll ch. 3.10) but was not quoted verbatim here.

---

## Key question 5: Calculus-accessible worked examples (with numbers)

### Takeaway
Five self-contained examples need only single-variable calculus: (1) circles on a sphere (C = 2πR sin(r/R) < 2πr), (2) proper time τ = ∫√(1 − v²/c²) dt, (3) a thrown ball maximizing its proper time, which reproduces ḧ = −g, (4) the GPS clock budget, and (5) the Schwarzschild radial proper-distance integral (e.g., 7.9 km of "extra" distance between the Sun's surface and Earth). All numbers below were computed for these notes and are reproducible from the stated formulas.

### Cited Findings
- Unit-sphere line element ds² = dθ² + sin²θ dφ², to be scaled by R² for a sphere of radius R. — [Carroll notes eq. 2.33](https://arxiv.org/abs/gr-qc/9712019)
- Timelike geodesics maximize proper time (twin paradox: the stay-at-home twin ages more). — [Carroll notes §3.3](https://arxiv.org/abs/gr-qc/9712019)
- "Free particles procrastinate": maximal proper time plus position-dependent clock rates yields the Newtonian limit encoded in g_tt. — [Pössel §2.2](https://arxiv.org/abs/1812.11589)
- Weak-field metric ds² = −(1 + 2Φ)dt² + (1 − 2Φ)(dx² + dy² + dz²), c = 1. — [Carroll notes eq. 6.29](https://arxiv.org/abs/gr-qc/9712019)
- Schwarzschild metric ds² = −(1 − 2GM/r)dt² + (1 − 2GM/r)⁻¹dr² + r²dΩ², c = 1. — [Carroll notes eq. 7.29](https://arxiv.org/abs/gr-qc/9712019)
- GPS inputs: a = 2.656175×10⁷ m and Φ₀/c² = −6.969290134×10⁻¹⁰ — [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/). Result cross-check: 46 − 7 ≈ 39 μs/day — [Will 2014](https://arxiv.org/abs/1403.7377).
- Hands-on version of example 1 (measuring circles on a squash with an opisometer): Effing 1977, cited in [Pössel §4.3](https://arxiv.org/abs/1812.11589).

### Inferences (the worked examples themselves; all derivations and numbers computed for these notes)

**Example 1: Circles on a sphere (arc length with the line element).**
- Set-up: on a sphere of radius R, draw the circle of all points at surface distance r from the North Pole. Along the circle θ = θ₀ is fixed (dθ = 0), so ds = R sin θ₀ dφ.
- Circumference: C = ∫₀^{2π} R sin θ₀ dφ = 2πR sin θ₀. The radius measured *along the surface* is r = Rθ₀, so **C = 2πR sin(r/R)**.
- Taylor (Calc II): sin x ≈ x − x³/6, so C ≈ 2πr(1 − r²/(6R²)). The circle is short by about πr³/(3R²).
- Curvature from measurement: K = (3/π) lim_{r→0} (2πr − C)/r³ = 1/R² (the Bertrand–Diguet–Puiseux formula; the limit is a nice exercise). An ant who cannot leave the surface can measure R this way.
- Numbers on Earth (R = 6,371 km):
  - r = 100 km: C = 628.293 km against 2πr = 628.319 km, a shortfall of **25.8 m**.
  - r = 1,000 km: shortfall 25.8 km.
  - The equator viewed as a circle around the North Pole: r = πR/2 = 10,008 km, C = 40,030 km against 2πr = 62,879 km (ratio 2/π ≈ 0.64).
- Contrast with flat polar coordinates: ds = r dθ along a circle gives C = 2πr exactly.

**Example 2: Proper time integral, τ = ∫√(1 − v(t)²/c²) dt (special relativity), plus gravity.**
- Derivation via light clock: a light pulse bounces between mirrors a distance L apart. In the clock's frame one tick is 2L/c. Seen moving at v, the pulse travels a diagonal; Pythagoras gives (c·Δt/2)² = L² + (v·Δt/2)², so Δt = (2L/c)/√(1 − v²/c²). Hence dτ = √(1 − v²/c²) dt.
- Weak-gravity extension (from the weak-field metric, dropping terms of order 1/c⁴): dτ ≈ [1 + Φ/c² − v²/(2c²)] dt.
- ISS (h ≈ 400 km, v = 7,673 m/s): velocity term −v²/2c² = −3.3×10⁻¹⁰ (−28.3 μs/day), gravitational term +3.6 μs/day, net **−24.7 μs/day** relative to the ground. Over a 6-month mission that is about 4.5 ms younger.
- For a calculus exercise with non-constant v, use Example 3.

**Example 3: The thrown ball ages more, and that *is* Newton's law (maximal aging).**
- A ball is thrown straight up at v₀ and caught at the same height after T = 2v₀/g. Height h(t) = v₀t − ½gt², speed v(t) = v₀ − gt.
- Extra proper time relative to a clock left on the ground: Δτ = (1/c²)∫₀ᵀ [g·h(t) − ½v(t)²] dt.
  - ∫₀ᵀ g·h dt = 2v₀³/(3g) (gain from being high up)
  - ∫₀ᵀ ½v² dt = v₀³/(3g) (loss from moving)
  - **Δτ = v₀³/(3gc²) > 0.** The high-clock gain beats the speed loss 2:1.
  - Numbers: v₀ = 10 m/s gives T = 2.04 s and Δτ = 3.8×10⁻¹⁶ s (checked by numerical integration).
- Why the parabola: try any other path with the same launch and catch, h(t) = h₀(t) + ε η(t) with η(0) = η(T) = 0. Integrate by parts:

  τ(ε) − τ(0) = (ε/c²)∫(g + ḧ₀)η dt − (ε²/2c²)∫η̇² dt.

  The first-order term vanishes for every η only if **ḧ₀ = −g**, which is Newton's free fall. The second-order term is negative, so the true path is a *maximum* of proper time.
  - Concrete: with η = sin(πt/T), the second-order loss is ε²π²/(4Tc²).
- Interpretation: τ ≈ T − (1/c²)∫(½v² − gh)dt. Maximizing proper time is the same as making Newton's action ∫(KE − PE)dt stationary. This is the "principle of least action," and it explains why Lagrangian mechanics is on the GR prerequisite list.

**Example 4: GPS clock budget.** See Key question 1, Inferences E: +45.8 μs/day (gravity), −7.2 μs/day (speed), net +38.6 μs/day, factory frequency 10.229 999 995 43 MHz, crossover altitude about 3,190 km.

**Example 5: Schwarzschild radial proper distance (the "r is not distance" lesson).**
- Along a radial line at fixed time, dℓ = dr/√(1 − r_s/r), so L = ∫_{r₁}^{r₂} dr/√(1 − r_s/r).
- Exact antiderivative (verify by differentiating; a good Calc II exercise): F(r) = √(r(r − r_s)) + r_s ln(√r + √(r − r_s)).
- Weak-field approximation (binomial expansion, Calc II): 1/√(1 − x) ≈ 1 + x/2, so L ≈ (r₂ − r₁) + (r_s/2) ln(r₂/r₁). The extra distance grows only logarithmically.
- Numbers:
  - Sun's surface to Earth's orbit: r_s = 2.953 km, ln(1 AU/R_⊙) = ln 215 = 5.37, so the extra distance is **7.93 km** beyond the coordinate difference of 1.489×10⁸ km (fractional 5×10⁻⁸). The exact and approximate values agree to 1 mm.
  - Earth's surface to GPS orbit: r_s = 8.87 mm, so the extra distance is **6.3 mm**.
  - Black hole (r_s = 1): proper distance from the horizon to r = 2r_s is **2.30** against a coordinate difference of 1. To 3r_s: 3.60 against 2. To 10r_s: 11.31 against 9. Near the hole, space "has more room" radially than the circumferences suggest. This is what the funnel-shaped embedding diagram depicts.
- Related classic (Feynman Lectures Vol. II ch. 42, "excess radius"): for a uniform-density ball, the measured radius exceeds √(area/4π) by GM/(3c²). Computed: **1.48 mm for Earth** (and about 490 m for the Sun if it were uniform, which it is not, so treat the solar figure as illustrative only). See Gaps.

### Gaps
- Feynman's *Lectures on Physics* Vol. II ch. 42 (curved space, hot-plate bugs, excess radius) could not be fetched (HTTP 403). The formula excess radius = GM/(3c²) and the "≈1.5 mm for Earth" figure are given from memory and reproduced by calculation above. Verify against the text before citing. Feynman's "bugs on a hot plate" (rulers that expand with temperature) is a well-known alternative curved-space analogy worth checking.
- No textbook source was fetched for the "thrown ball maximizes proper time" calculation specifically. It is a standard exercise (the Taylor–Wheeler "principle of maximal aging"), but the derivation here is my own. Pössel's §2.2 narrative supports the concept.

---

## Key question 6: What mathematics is needed to study GR rigorously, and in what order

### Takeaway
Conceptual GR (metrics, geodesics, time dilation, the Schwarzschild metric) needs only single-variable calculus plus special relativity. A real first course additionally needs multivariable/vector calculus, linear algebra, ODEs/PDEs and Lagrangian mechanics. Graduate GR is built on differential geometry and tensor calculus on manifolds, which most courses teach inside the GR course itself.

### Cited Findings
- Baez & Bunn: in technical introductions "the geometry is often hidden under piles of tensor calculus," and "One needs a lot of mathematics to derive all the consequences" of Einstein's equation. The precession of Mercury and light deflection "really call for the full apparatus of tensor calculus." — [Baez & Bunn §1, §4](https://arxiv.org/abs/gr-qc/0103044)
- Carroll's graduate notes are organized as: special relativity and flat spacetime → manifolds → curvature (connections, parallel transport, geodesics, Riemann) → gravitation (equivalence principle, Newtonian limit, Einstein's equations) → more geometry → weak fields and gravitational radiation → the Schwarzschild solution and black holes → cosmology. — [Carroll notes, table of contents and chapter headers](https://arxiv.org/abs/gr-qc/9712019)
- Carroll introduces the summation convention, coordinate transformations and calculus of variations (geodesics as extrema of the length functional) as tools along the way, and refers to the theorems of Green, Gauss and Stokes "familiar from vector calculus." — [Carroll notes §§1, 2.8, 3.3](https://arxiv.org/abs/gr-qc/9712019)
- The University of Cambridge Part III (graduate) GR course lists familiarity with Newtonian gravity, special relativity, finite-dimensional vector spaces (linear algebra) and the Euler–Lagrange equations as essential prerequisites. The first half of the course is an introduction to differential geometry. — [Cambridge Part III guide, General Relativity](https://www.maths.cam.ac.uk/postgrad/part-iii/files/misc/2020-21%20Guide/Relativity%20and%20Gravitation/General%20Relativity.pdf) (seen via search summary)
- Community advice (low-authority, forum opinions) converges on calculus → vector calculus → linear algebra → differential equations → tensors/differential geometry. Taylor & Wheeler's *Exploring Black Holes* is described as among the most elementary GR books, needing little beyond calculus. — [PhysicsForums thread](https://www.physicsforums.com/threads/mathematical-prerequisites-for-general-relativity.939528/post-5943148); [PhysicsForums thread 2](https://www.physicsforums.com/threads/what-math-do-i-need-to-know-to-understand-general-relativity.864822/post-5428321) (search-summary level only)
- Einstein's equations are second-order differential equations for the metric (Carroll). Gravitational waves come from a wave equation □h̄_μν = −16πG T_μν (Carroll eq. 6.22, c = 1), i.e., PDEs. — [Carroll notes §4.4, §6.1](https://arxiv.org/abs/gr-qc/9712019)

### Inferences (recommended roadmap for a student currently in Calculus II)
1. **Now (Calc II):** Taylor series and binomial approximations (√(1 − x) ≈ 1 − x/2 is used everywhere in weak-field GR), arc length and integration techniques (Key question 5 examples 1, 2, 5), polar coordinates and parametric curves. Alongside: **special relativity** (spacetime diagrams, Lorentz transformations, proper time, E = mc²). This is the most important physics prerequisite.
2. **Next year:** **multivariable/vector calculus** (partial derivatives, gradient, divergence, Laplacian ∇², Gauss's divergence theorem, so that ∇²Φ = 4πGρ makes sense) and **linear algebra** (vectors, matrices, basis changes, eigenvalues: the language for "components change, the object doesn't"). These can run in parallel.
3. **Ordinary differential equations** (geodesic equations and orbits are ODEs), then **classical mechanics with Lagrangians / calculus of variations** (Euler–Lagrange equations: geodesics extremize proper time, as in Example 3). The Cambridge prerequisite list explicitly includes Euler–Lagrange.
4. **Electromagnetism at the level of Maxwell's equations as field equations**: the prototype of a relativistic field theory, and the source of the "Gauss's law" intuition.
5. **Partial differential equations**: Poisson, wave and diffusion equations. Einstein's equations are nonlinear PDEs, and gravitational waves obey a wave equation.
6. **Differential geometry of curves and surfaces** (Gaussian curvature, geodesics on surfaces, Theorema Egregium), ideally before or alongside the first GR course.
7. **First GR course**, where tensor calculus on manifolds (covariant derivatives, Christoffel symbols, Riemann tensor) is usually taught in context. Typical textbook ladder: Taylor–Wheeler(–Bertschinger) *Exploring Black Holes* (calculus-level, metric-first) → Hartle *Gravity* or Schutz *A First Course* (advanced undergraduate) → Carroll *Spacetime and Geometry* / his free notes (graduate) → Wald, or Misner–Thorne–Wheeler *Gravitation* (advanced/reference).
8. **Optional and advanced:** group theory and representation theory (Lorentz group, symmetries, spinors), complex analysis (some exact solutions, black-hole perturbation theory), topology (global structure, singularity theorems), functional analysis and numerical methods (numerical relativity).
- Message for Ch. 5: "You can *understand* GR's ideas with the calculus you have. You can *compute* GR's predictions after about two more years of math. You can *do research* in GR after differential geometry."

### Gaps
- I did not fetch the prefaces of Hartle, Schutz, Carroll's textbook or Taylor–Wheeler–Bertschinger to quote their stated prerequisites. The textbook-ladder characterizations above (e.g., Hartle's "physics-first" approach that introduces metrics and geodesics before tensors; *Exploring Black Holes* needing only calculus) reflect widely held descriptions, but I did not verify them in this session.
- The Cambridge prerequisite list was seen only through a search-result summary of the course-guide PDF.
- No authoritative source prescribes a single ordering. The roadmap is a synthesis.
