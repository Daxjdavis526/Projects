# General Relativity: A Beginner's Guide to Understanding Spacetime, Gravity, and the Universe

*Written for a university student with Calculus I–II and introductory calculus-based physics. Current to October 2026.*

General relativity (GR) replaces Newton's gravitational force with geometry: matter and energy curve four-dimensional spacetime, and anything falling freely, from an apple to a light beam, follows the straightest path that curved spacetime allows. Einstein completed it in November 1915 ([Kennefick, Princeton UP](https://press.princeton.edu/node/4545)), and no test since has found a confirmed deviation from it ([Will 2014](https://arxiv.org/abs/1403.7377); [LVK GR tests 2026](https://arxiv.org/abs/2603.19019)), from Mercury's orbit to atomic clocks a millimetre apart ([Bothwell et al. 2022](https://arxiv.org/abs/2109.12238)) to the **390 gravitational-wave candidates cataloged by May 2026** ([LVK GWTC-5.0 2026](https://arxiv.org/abs/2605.27225)). It is also everyday engineering: **GPS satellite clocks gain about 38.6 microseconds per day** (calculation: Ashby's net rate offset, 4.4647 × 10⁻¹⁰, times 86,400 s in a day) and are deliberately mistuned before launch to compensate ([Ashby 2003](https://doi.org/10.12942/lrr-2003-1)). Yet GR is visibly incomplete. It predicts its own breakdown inside black holes and at the Big Bang ([Hawking & Penrose 1970](https://doi.org/10.1098/rspa.1970.0021)), it has no accepted quantum version ([Carlip et al. 2015](https://arxiv.org/abs/1507.08194)), and it needs dark matter and dark energy, whose natures are unknown ([NASA](https://science.nasa.gov/dark-energy/)). That mix of engineering-grade precision and open foundations is why it remains a thriving research field. You can understand its core ideas with the calculus you already have; computing with it takes about two more years of mathematics; doing research in it usually takes a PhD (the guide's estimates; Chapter 11 gives the details).

**How to read this guide.** Each hard idea follows the same sequence: intuition in plain language, an analogy or example, the technical term, its role in GR, and then, only where it helps, a little mathematics with every symbol defined. Numbers marked "(calculation)" were computed from the formula shown. Claims about nature carry one of three labels:

| Label | Meaning | Example |
|---|---|---|
| **Established** | Measured or observed, repeatedly | Clocks run slower lower in a gravitational field ([Will 2014](https://arxiv.org/abs/1403.7377)) |
| **Predicted** | Follows from GR (or GR plus quantum theory) but not yet observed | Hawking radiation from black holes ([Physics World 2016](https://physicsworld.com/a/entangled-hawking-radiation-spotted-in-analogue-black-hole/)) |
| **Speculative** | No experimental support yet; ranges from serious research to science fiction | Quantum-gravity theories ([Addazi et al. 2022](https://arxiv.org/abs/2111.05659)); warp drives |

**Contents**

| Chapter | Title | Core question |
|---|---|---|
| 1 | A brief history of relativity | Why did Newton's picture need replacing? |
| 2 | Special relativity | Why aren't time and distance absolute? |
| 3 | Spacetime | What does it mean that space and time are one thing? |
| 4 | Einstein's theory of gravity | Why is gravity curvature rather than a force? |
| 5 | Geometry and mathematics | What do the metric and Einstein's equations say? |
| 6 | Black holes | What happens when curvature becomes extreme? |
| 7 | Gravitational waves | How does spacetime ripple, and how do we detect it? |
| 8 | GR and the universe | How does GR describe cosmic history and fate? |
| 9 | Evidence and applications | How do we know GR is right, and where is it used? |
| 10 | Research frontiers | What is still unsolved? |
| 11 | Studying GR | What would you actually do as a student and researcher? |
| 12 | Putting it all together | Glossary, key ideas, questions, open problems, pathway, resources |

---

## 1. A brief history of relativity: two cracks in Newton's universe

Relativity grew out of two cracks in Newton's enormously successful picture. The first concerned motion and light. In 1632 Galileo argued that in a closed cabin on a smoothly sailing ship, insects, fish and dripping water behave exactly as in port, so **no experiment inside can reveal uniform motion** ([Galileo's *Dialogue*, MacTutor](https://mathshistory.st-andrews.ac.uk/Extras/Galileo_Dialogue/)). Then Maxwell's 1865 electromagnetism predicted light waves moving at one fixed speed, in today's notation c = 1/√(μ₀ε₀), set by two constants of nature ([Maxwell 1865](https://doi.org/10.1098/rstl.1865.0008)). Fixed relative to what? A motionless "aether" was assumed to fill space, but in 1887 Michelson and Morley's interferometer failed to detect Earth's motion through it ([HyperPhysics](https://hyperphysics.gsu.edu/hbase/Relativ/mmhist.html)). Building on mathematics partly anticipated by Lorentz and Poincaré, Einstein in 1905 explained everything from two postulates with no aether at all ([Darrigol 2005](https://seminaire-poincare.pages.math.cnrs.fr/darrigol2.pdf)). His paper was received on **30 June 1905**, in a "miracle year" that also produced E = mc² ([Singh 2007](https://arxiv.org/abs/physics/0701240)). In 1908 Hermann Minkowski recast the theory as geometry, declaring that "space by itself, and time by itself, are doomed to fade away into mere shadows, and only a kind of union of the two will preserve an independent reality" ([Minkowski 1908, tr. 1923](https://archive.org/details/principleofrelat0000halo)).

The second crack was gravity. Newton's law, F = Gm₁m₂/r², acts instantly across empty space, which troubled Newton himself ([Newton to Bentley, Newton Project](https://www.newtonproject.ox.ac.uk/view/texts/normalized/THEM00258)) and clashes with relativity's rule that no influence outruns light. Nature also disagreed: the point of Mercury's orbit closest to the Sun creeps around **43 arcseconds per century** more than Newton allows ([Will 2014](https://arxiv.org/abs/1403.7377)). Urbain Le Verrier, who had predicted Neptune from Uranus's wobbles ([NASA](https://science.nasa.gov/neptune/facts/)), blamed an unseen planet, "Vulcan," that was never found ([PBS NOVA](https://www.pbs.org/wgbh/nova/article/hunt-for-vulcan/); [Will 2014](https://arxiv.org/abs/1403.7377)); this time the theory, not the solar system's inventory, was at fault. Einstein's route began in 1907 with what he called "the happiest thought of my life": a person falling freely does not feel their own weight ([Schücking 2009](https://arxiv.org/abs/0903.3768)). He presented the final field equations on **25 November 1915** ([Kennefick, Princeton UP](https://press.princeton.edu/node/4545)). David Hilbert submitted related work five days earlier, but his surviving page proofs lack the explicit equations, and the historians who found them concluded that Hilbert did not anticipate Einstein; pieces of the proofs are missing, though, so the question cannot be closed completely ([Corry, Renn & Stachel 1997](https://doi.org/10.1126/science.278.5341.1270); [Kennefick, Princeton UP](https://press.princeton.edu/node/4545)). The major confirmations followed:

| Year | Milestone | Why it mattered |
|---|---|---|
| 1916 | Karl Schwarzschild, serving on the Russian front, publishes the first exact solution ([Weinstein 2023](https://arxiv.org/abs/2312.01865)) | It later turned out to describe black holes |
| 1919 | Eclipse expeditions measure starlight bending of 1.98″ ± 0.12″ and 1.61″ ± 0.30″ (probable errors), against GR's 1.75″ and a Newtonian-style 0.87″ ([Physics Today 2019](https://physicstoday.aip.org/reviews/the-significance-of-the-1919-total-solar-eclipse); [Kennefick 2007](https://arxiv.org/abs/0709.0685)) | Made Einstein famous; rough data, but a 1979 re-analysis backed the result ([Will 2014](https://arxiv.org/abs/1403.7377); [Kennefick 2007](https://arxiv.org/abs/0709.0685)) |
| 1960 | Pound and Rebka measure gravity's effect on the frequency of gamma rays (very high-frequency light) in a Harvard tower ([Will 2014](https://arxiv.org/abs/1403.7377)) | First precise laboratory test of gravitational time dilation |
| 1974 | Hulse and Taylor find a binary pulsar whose orbit decays as GR predicts ([Physics Today 1993](https://doi.org/10.1063/1.2809120); [Weisberg & Huang 2016](https://arxiv.org/abs/1606.02744)) | Indirect discovery of gravitational waves, first reported in 1978 (Nobel Prize 1993) |
| 2015 | LIGO detects GW150914 ([LIGO & Virgo 2016](https://arxiv.org/abs/1602.03837)) | First direct detection of gravitational waves (Nobel Prize 2017, [NobelPrize.org](https://www.nobelprize.org/prizes/physics/2017/summary/)) |
| 2019 | The Event Horizon Telescope images M87* ([EHT 2019](https://arxiv.org/abs/1906.11238)) | First image of a black hole's shadow ([ESO 2019](https://www.eso.org/public/news/eso1907/)) |

> **Think about it:** "Add an unseen planet" worked for Neptune and failed for Vulcan. Astronomers now add unseen dark matter to explain how galaxies move (Chapter 8). How would you tell whether it is a Neptune or a Vulcan?

---

## 2. Understanding special relativity: why time and distance are not absolute

### Two postulates that break common sense

A **reference frame** is a grid of rulers and synchronized clocks that labels every event with a position and a time. In an **inertial frame**, a free object moves in a straight line at constant speed; an **inertial observer** rests in such a frame and feels no acceleration, like Galileo's sailor. Einstein built special relativity (SR) on two **postulates**: the laws of physics are the same in every inertial frame, and **light in vacuum travels at c = 299,792,458 m/s for every inertial observer**, however the source or observer moves ([Tong lectures](https://davidtong.org/pdfs/teaching/dynamics-and-relativity/dynrel7.pdf); [NIST](https://physics.nist.gov/cgi-bin/cuu/Value?c)). Chase a light beam at 0.9c and you still measure it receding at c. Since speed is distance divided by time, distance and time themselves must differ between observers.

### Time dilation from a light clock

A light pulse bouncing between mirrors a distance L apart makes a clock that ticks once per round trip. Watch it fly past at speed v: the pulse follows a longer diagonal, still at speed c, so each tick takes longer.

```
 CLOCK'S OWN FRAME              GROUND FRAME: the same clock moves right at speed v

  ======  top mirror                                B
    ^ |                                           / | \
    | |                   light: c·Δt/2         /   |   \   light: c·Δt/2
    | |  L                                    /     |L    \
    | |                                     /       |       \
    | v                                   /         |         \
  ======  bottom mirror                 A-----------+-----------C
                                        |<-v·Δt/2-->|<-v·Δt/2-->|
  one tick: Δτ = 2L/c                   one tick (A -> B -> C) takes Δt

 Pythagoras on half a tick (A -> B):  (c·Δt/2)² = L² + (v·Δt/2)²   =>   Δt = γ·Δτ
```

```
Δt = γ·Δτ ,        γ = 1 / √(1 − v²/c²)
```

**Δτ is the proper time**, measured by the clock present at both ticks; Δt is the time between the same ticks in a frame where the clock moves; and γ (gamma), the **Lorentz factor**, is never less than 1 ([Tong lectures](https://davidtong.org/pdfs/teaching/dynamics-and-relativity/dynrel7.pdf)). By the first postulate, every clock, atomic or biological, must slow identically, or comparing clocks would reveal your motion ([Tong lectures](https://davidtong.org/pdfs/teaching/dynamics-and-relativity/dynrel7.pdf)). This is **time dilation**: γ is 1.25 at 0.6c and about 7.1 at 0.99c (calculation). A Calculus II connection: the Taylor series γ ≈ 1 + ½(v/c)² shows why the effect is invisible at everyday speeds, and multiplying by mc² gives mc² + ½mv², so **Newton's kinetic energy is hiding inside Einstein's E = γmc²** ([Tong lectures](https://davidtong.org/pdfs/teaching/dynamics-and-relativity/dynrel7.pdf)).

### Muons: one fact, two stories

Muons created by cosmic rays high in the atmosphere decay in about 2.2 μs on average ([PDG 2025](https://pdg.lbl.gov/2025/listings/rpp2025-list-muon.pdf)). In an experiment published in 1963, Frisch and Smith selected muons moving at about 0.995c on top of Mount Washington and counted how many still arrived near sea level in Cambridge, Massachusetts ([Frisch & Smith 1963](https://doi.org/10.1119/1.1969508)). The summit is 6,288 feet (about 1.9 km) up ([Mount Washington Observatory](https://mountwashington.org/special-relativity-and-mount-washington)), a descent of about 6.4 μs at 0.995c, so without time dilation only **about 5%** should survive, e^(−6.4/2.2) ≈ 0.05 (calculation). Far more did, implying that the muons' clocks ran slow by a factor of **8.8 ± 0.8**, against relativity's predicted **8.4 ± 2** ([Frisch & Smith 1963](https://doi.org/10.1119/1.1969508)). That is the ground's story. From a muon's viewpoint its clock is normal but the mountain is shorter: **length contraction**, L = L₀/γ, where the **proper length** L₀ is measured at rest and only lengths along the motion shrink ([Tong lectures](https://davidtong.org/pdfs/teaching/dynamics-and-relativity/dynrel7.pdf)). Different stories, same count.

### Simultaneity and the Lorentz transformations

Lightning strikes both ends of a moving train. A platform observer midway between the marks sees the flashes arrive together. A passenger at the train's middle, moving toward the front flash, sees it first and, since light moves at c for her too, concludes it struck first. Both are right: **simultaneity is relative**. The **Lorentz transformations** convert one observer's coordinates of an event, (x, t), into another's, (x′, t′), for frame S′ moving at speed v along x ([Tong lectures](https://davidtong.org/pdfs/teaching/dynamics-and-relativity/dynrel7.pdf)):

```
x′ = γ (x − v·t)          t′ = γ (t − v·x/c²)          y′ = y ,   z′ = z
```

At low speeds they reduce to Galileo's x′ = x − vt and t′ = t, which is why Newton never noticed. The v·x/c² term is the relativity of simultaneity.

### The spacetime interval and the twin paradox

What all observers agree on is the **spacetime interval** between two events:

```
Δs² = −(c·Δt)² + (Δx)² + (Δy)² + (Δz)²
```

For two ticks of one clock, Δs² = −(c·Δτ)², so everyone agrees on the proper time the clock records ([Tong lectures](https://davidtong.org/pdfs/teaching/dynamics-and-relativity/dynrel7.pdf)). (Some books, Tong's among them, flip every sign; the physics is identical.) The minus sign is what makes time different from a fourth direction of space. A twin who flies at 0.8c to a star 4 light-years away and back ages 6 years while 10 pass on Earth (calculation: Earth time = 8 light-years ÷ 0.8c = 10 years; her proper time = 10 years ÷ γ, with γ = 5/3 at 0.8c, = 6 years). The twins are not symmetric: she turned around and felt it, and SR handles that acceleration without any general relativity ([Tong lectures](https://davidtong.org/pdfs/teaching/dynamics-and-relativity/dynrel7.pdf); [Gibbs 1996, Physics FAQ](https://math.ucr.edu/home/baez/physics/Relativity/SR/acceleration.html)). What SR cannot handle is gravity.

| | Special relativity (1905) | General relativity (1915) |
|---|---|---|
| Spacetime | Flat, a fixed stage | Curved by matter and energy; dynamic |
| Gravity | Not included | Is the curvature; free fall follows the straightest paths |
| Inertial frames | Extend everywhere | Exist only locally, in small freely falling labs |
| Mathematics | Algebra, Pythagoras, simple integrals | Differential geometry and tensor calculus |
| Relationship | GR's local limit | Reduces to SR in any small freely falling lab |

SR matters because GR is built on it: in GR, every small, freely falling laboratory obeys special relativity exactly ([Will 2014](https://arxiv.org/abs/1403.7377)).

---

## 3. What is spacetime? Events, worldlines and light cones

**Spacetime** joins three space dimensions and one time dimension into a single arena whose points are **events**, places at instants: a firecracker bursting, a clock ticking. In a **spacetime diagram**, time runs up the page as ct (so it is measured in metres) and space runs across. Each object's history is a line, its **worldline**, Minkowski's term ([Minkowski 1908](https://archive.org/details/principleofrelat0000halo_n7a8)): a resting object draws a vertical line, a steadily moving one a tilted line, and light a 45° line.

```
                             ct
light ray: x = -ct            ^            light ray: x = +ct
                    \         | FUTURE  /
                      \       |       /
  ELSEWHERE             \     |     /         ELSEWHERE
  (spacelike)             \   |   /           (spacelike)
                            \ | /
------------------------------O--------------------------------------> x (space)
                            / | \
                          /   |   \
                        /     |     \
                      /       |       \
                    /         | PAST    \

O = one event (here and now). Light moves along the 45-degree lines because ct and x
share units. Events inside the cones are timelike-separated from O; outside, spacelike.
```

The light rays through an event form its **light cone**. Inside the upper cone lies the event's **future**, which it can influence; inside the lower cone its **past**; outside, "elsewhere." Separations are **timelike** (Δs² < 0), **lightlike** (Δs² = 0) or **spacelike** (Δs² > 0). All observers agree on the time order of timelike-separated events but not of spacelike ones ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)), so a faster-than-light signal would, for some observer, arrive before it was sent, violating **causality**, the rule that causes precede effects. In GR, light cones tilt near a black hole, and inside its horizon every future direction points inward ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)).

A clock carried along a worldline records its **proper time**, as a car's odometer records the road actually driven:

```
τ = ∫ √(1 − v(t)²/c²) dt          compare Calc II arc length:   L = ∫ √(1 + (dy/dx)²) dx
```

Here t is an inertial observer's time and v(t) the clock's speed. The minus sign flips the geometry: in space the straight path is the *shortest*, but in spacetime **the unaccelerated worldline between two events has the longest proper time**, which is the twin paradox in one line ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)).

What does "space and time are connected" mean? Two surveyors whose compasses point slightly differently disagree about how far north and how far east a tree is, but agree on its straight-line distance. Observers in relative motion likewise split the same separation into different amounts of time and space but agree on Δs²; one observer's pure time interval is another's mixture of time and space. You are always travelling through spacetime toward your future, and for any inertial observer a moving clock obeys (dτ/dt)² + (v/c)² = 1 (calculation, squaring the τ formula above): the faster it moves through space, the slower it ticks. Observers therefore disagree on durations, lengths, simultaneity and energies but agree on c, intervals, proper times, the order of cause and effect, and the laws of physics ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). Minkowski called this the "postulate of the absolute world" ([Minkowski 1908](https://archive.org/details/principleofrelat0000halo_n7a8)): relativity is really a theory of what is absolute.

> **Think about it:** In flat spacetime the unaccelerated worldline has the most proper time. Guess what path a falling apple takes through *curved* spacetime.

---

## 4. Einstein's revolutionary theory of gravity: falling is the natural state

### The clue: everything falls alike

Gravity accelerates every object identically: the MICROSCOPE satellite found titanium and platinum falling alike to within a few **parts in 10¹⁵** ([MICROSCOPE 2022](https://arxiv.org/abs/2209.15487)). No other force behaves this way (an electric field accelerates a proton and an electron very differently), so this **universality of free fall**, or weak equivalence principle ([Will 2014](https://arxiv.org/abs/1403.7377); [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)), hints that gravity belongs to the arena rather than to the objects.

### Einstein's elevator

```
 (a) ELEVATOR, CABLE CUT       (b) ROCKET, DEEP SPACE         (c) LAB ON EARTH
     falling near Earth            accelerating at 9.8 m/s²       standing still
   +-----------------+          +-----------------+          +-----------------+
   |   o      apple  |          |   o             |          |   o             |
   |  /|\       o    |          |  /|\      o     |          |  /|\      o     |
   |  / \  (floats)  |          |  / \      |     |          |  / \      |     |
   |    (you float)  |          |           v     |          |           v     |
   +-----------------+          +-----------------+          +-----------------+
           |                            ^^^                    ////// Earth //////
           v  whole box falls           thrust
   Inside (a): no experiment       Inside (b) and (c): the apple "falls" at 9.8 m/s²
   tells you you're not floating   and your feet press on the floor. No experiment
   in empty space.                 in a small, short-lived lab tells them apart.
```

In a falling elevator, you, your keys and an apple fall together and float: gravity has vanished. In a rocket accelerating at 9.8 m/s² through deep space, a released apple keeps moving while the floor rushes up to meet it, so it "falls" exactly as on Earth: gravity has appeared. The **Einstein equivalence principle** states that in a small laboratory over a short time, gravity cannot be distinguished from acceleration, and a freely falling laboratory obeys special relativity ([Will 2014](https://arxiv.org/abs/1403.7377); [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). This inverts Newton: standing on Earth, *you* are the one accelerating, pushed off your free-fall path by the floor, while astronauts on the International Space Station, where gravity is still about 87–89% as strong as at the surface, float because they are falling (calculation: (R/(R + h))² with R = 6,371 km from the [NASA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) and the station's 370–460 km altitude from [NASA](https://www.nasa.gov/reference/international-space-station/)). "Small" matters: two balls released side by side 10 m apart accelerate toward each other at about 1.5×10⁻⁵ m/s² as each falls toward Earth's centre (calculation: (GM/R³) × 10 m, with Earth's GM and R from the [NASA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)). No frame removes such **tidal effects**, and they turn out to be curvature ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)).

### Light bends and low clocks run slow

A light beam crossing the accelerating rocket lands slightly lower on the far wall, because the floor speeds up during the crossing; by the equivalence principle, light must fall in gravity too. Caution: this elevator argument predicts **only half** of the 1.75″ bending measured at the Sun's edge, and the curvature of space supplies the other half ([Will 2014](https://arxiv.org/abs/1403.7377)). Similarly, a signal sent from the rocket's floor to its ceiling arrives Doppler-shifted to a lower frequency, because the ceiling speeds up while the signal travels ([Will 2014](https://arxiv.org/abs/1403.7377)). By the equivalence principle the same shift must occur in a building on Earth, where nothing moves, so **the lower clock really ticks slower**:

```
Δτ/τ  ≈  g·h / c²          (more generally ΔΦ/c², where Φ is the gravitational potential)
```

Δτ/τ is the fractional difference in the clocks' rates, g the gravitational acceleration, h their height difference and Φ the Newtonian potential ([Will 2014](https://arxiv.org/abs/1403.7377)): about 1.1×10⁻¹⁶ per metre near Earth (g/c²; calculation). This is **established**. NIST's optical clocks detected it over a 33 cm height difference in 2010 ([Chou 2010](https://doi.org/10.1126/science.1192720); [Physics World 2010](https://physicsworld.com/a/relativity-with-a-human-touch/)), and JILA resolved it across a millimetre-scale cloud of atoms in 2022 ([Bothwell 2022](https://arxiv.org/abs/2109.12238)). **Gravitational redshift**, the loss of frequency by light climbing out of a gravitational field, is the same effect ([Will 2014](https://arxiv.org/abs/1403.7377)).

GPS satellite clocks gain about 45.8 μs per day from weaker gravity and lose about 7.2 μs per day from their orbital speed, for a **net gain of about 38.6 μs per day** (calculation from the orbit radius, ground potential and net rate offset of 4.4647×10⁻¹⁰ given by [Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/); [Will 2014](https://arxiv.org/abs/1403.7377) rounds these to 46, 7 and 39 μs). The fix is to set a clock before launch to tick at 10.22999999543 MHz rather than 10.23 MHz so that it reads correctly from the ground; for rubidium clocks, whose rate can jump during launch, the rate is instead measured in orbit and corrected in the clock data the satellites broadcast ([Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)). The figure "GPS would drift about 10 km a day" is simply the day's offset multiplied by c (38.6 μs × c ≈ 11.6 km; calculation), and Ashby himself says uncorrected clock errors from one day "would cause navigational errors of more than 11 km" ([Ashby 2002](https://doi.org/10.1063/1.1485583)); since 1 ns of timing error means about 30 cm of position error, ignoring relativity would cause "unacceptably large errors" ([Ashby 2003](https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/)).

### From force to geometry

Gravity is universal, cancellable at any point by falling (like a turning car's "centrifugal force"), incompatible with relativity as an instantaneous force, and wrong for Mercury ([Fleury 2019](https://arxiv.org/abs/1902.07287); [Will 2014](https://arxiv.org/abs/1403.7377)). So in GR, **every form of energy, momentum, pressure and stress curves spacetime** (Chapter 5), and free bodies follow **geodesics**, the straightest paths that curved spacetime allows ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)).

```
                N   <- they collide at the North Pole
               / \
              /   \          Each walker heads due north and never turns:
             /     \         each follows a geodesic (a great circle).
            /       \        Nothing pushes them together, yet their
           |         |       separation shrinks. The curvature of the
           |         |       surface does it. In GR, nearby free-falling
   --------A---------B-----  bodies converge in exactly this way (tides),
           equator           and that convergence IS spacetime curvature.
```

John Wheeler summed up GR in two clauses: "space tells matter how to move and matter tells space how to curve" ([Misner, Thorne & Zurek 2009](https://doi.org/10.1063/1.3120895)), a line also given with "spacetime" in place of "space" ([Pössel 2018](https://arxiv.org/abs/1812.11589)). A thrown ball's parabola counts as "straight" because in one second the ball travels a few metres through space but 300,000 km through time (ct), so slight spacetime curvature bends its worldline visibly ([Baez & Bunn 2005](https://arxiv.org/abs/gr-qc/0103044)). More precisely, **for slow objects in weak gravity, almost all of everyday gravity is the warping of time**, clocks ticking at different rates at different heights ([Pössel 2018](https://arxiv.org/abs/1812.11589); [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). Free bodies follow the worldline of maximum proper time ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)), and because higher clocks run faster, a thrown ball arcs upward ([Pössel 2018](https://arxiv.org/abs/1812.11589); Worked Example 2 in Chapter 5 proves this gives Newton's law). Light, moving at c, also feels the warping of space fully, which supplies the other half of its bending ([Will 2014](https://arxiv.org/abs/1403.7377)).

### The rubber sheet: right picture, wrong mechanism

The heavy ball denting a stretched sheet correctly shows mass distorting its surroundings, a distortion that weakens with distance but never stops, and motion following the local shape ([Pössel 2018](https://arxiv.org/abs/1812.11589)). But it uses gravity to explain gravity (Earth pulls the ball down), omits warped time, and needs a fictitious extra dimension, whereas GR's curvature is **intrinsic**, measurable from inside ([Pössel 2018](https://arxiv.org/abs/1812.11589)). Its orbits have the wrong shapes and speeds ([Middleton & Langston 2014](https://doi.org/10.1119/1.4848635)), and in a classroom study, students working with it formed some conceptions of gravity that differ from physicists' ([Kersting & Steier 2018](https://doi.org/10.1007/s11191-018-9997-4)). It is a picture of the answer for orbits, drawn with the wrong mechanism.

> **Think about it:** Falling cancels the uniform 9.8 m/s² inside an elevator. Why can no choice of frame cancel the squeeze between the two balls?

---

## 5. The geometry and mathematics of general relativity

### Coordinates and the metric

**Coordinates** are labels, like house numbers: the same point is (x, y) = (1, 1) or, in polar coordinates, (r, θ) = (√2, 45°). The **metric** converts coordinate changes into real distances and times, written as a **line element** ds²:

| Space | Line element | Lesson |
|---|---|---|
| Flat plane, Cartesian | ds² = dx² + dy² | Pythagoras for a tiny triangle; the basis of Calc II arc length |
| Flat plane, polar | ds² = dr² + r² dθ² | Coefficients can vary with position without curvature |
| Sphere of radius R | ds² = R² (dθ² + sin²θ dφ²) | No coordinate change makes this flat everywhere: real curvature ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)) |
| Flat spacetime | ds² = −c²dt² + dx² + dy² + dz² | The minus sign is all of special relativity |
| Weak gravity | ds² = −(1 + 2Φ/c²) c²dt² + (1 − 2Φ/c²)(dx² + dy² + dz²) | A resting clock ticks at dτ ≈ (1 + Φ/c²) dt: gravitational time dilation ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)) |

(θ is the angle from the north pole, φ the longitude, Φ the Newtonian potential.) The **metric tensor** g_μν is a 4×4 table of position-dependent coefficients, with μ, ν = 0–3 standing for t, x, y, z. It is symmetric, so it holds **10 independent functions**, the unknowns of Einstein's equations ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). Physicists write ds² = g_μν dx^μ dx^ν, where an index repeated once up and once down is summed over all its values (the **summation convention**). The metric gives lengths and proper times, fixes the light cones and defines the straightest paths ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)).

### Scalars, vectors and tensors

A **scalar** is one number all observers agree on, such as a clock's proper time. A **vector** is an arrow at a point whose components depend on your axes but whose arrow does not. A **tensor** is a machine that takes in arrows and returns numbers; the engineering **stress tensor**, which takes a surface orientation and returns force per area, is one. Laws written as "tensor = tensor" hold in every coordinate system, so they cannot depend on arbitrary labels ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)).

### Geodesics

A **geodesic** never turns within its space, like an ant walking straight ahead on a ball; on a sphere, geodesics are great circles ([Baez & Bunn 2005](https://arxiv.org/abs/gr-qc/0103044)). In spacetime, the geodesics of massive bodies maximize proper time ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)):

```
d²x^μ/dτ²  +  Γ^μ_αβ (dx^α/dτ)(dx^β/dτ)  =  0
```

x^μ(τ) is the body's position as a function of its proper time, and the **Christoffel symbols** Γ are built from how the metric changes from place to place. Even flat polar coordinates have them: with Γ^r_θθ = −r, a straight line obeys r̈ − r·θ̇² = 0, where r·θ̇² is the familiar "centrifugal" effect of the coordinates, not a force ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). Gravity is similar, except that a freely falling frame cancels the Christoffel symbols only at a single point (the equivalence principle in mathematical form), never everywhere at once ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)).

### Intrinsic curvature: Worked Example 1

A cylinder unrolls flat, and ants on it find triangles whose angles sum to 180°, so its curvature is only **extrinsic** ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). A sphere cannot be flattened, and its triangles exceed 180°: that is **intrinsic curvature**, the kind GR uses and the key idea behind Gauss's differential geometry ([Pössel 2018](https://arxiv.org/abs/1812.11589)). On a sphere of radius R, take all points a surface distance r from the north pole. Along that circle θ = r/R, so the line element gives ds = R sin(r/R) dφ, and integrating φ from 0 to 2π:

```
C = 2πR·sin(r/R)  ≈  2πr·(1 − r²/(6R²))          (Taylor series: sin x ≈ x − x³/6)
```

On Earth, a circle of radius 100 km measured along the ground is **25.8 m shorter than 2πr** (calculation, with Earth's mean radius R = 6,371 km from [NASA](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html)). An ant that never leaves the surface can measure curvature this way, and physicists measure spacetime curvature the same intrinsic way.

### Curvature tensors

| Object | Numbers per point (4D) | What it measures |
|---|---|---|
| **Riemann curvature tensor** R^ρ_σμν | 20 | The complete local curvature: how nearby free-falling particles accelerate apart or together (tides) ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019); [Hughes 2024](https://web.mit.edu/sahughes/www/8.962/lec11.pdf)) |
| **Ricci tensor** R_μν | 10 | How the *volume* of a small ball of free-falling particles starts to change ([Baez & Bunn 2005](https://arxiv.org/abs/gr-qc/0103044); [Hughes 2024](https://web.mit.edu/sahughes/www/8.962/lec11.pdf)) |
| **Weyl tensor** (the remainder) | 10 | How the ball's *shape* changes at fixed volume: tides and gravitational waves ([Baez & Bunn 2005](https://arxiv.org/abs/gr-qc/0103044); [Hughes 2024](https://web.mit.edu/sahughes/www/8.962/lec11.pdf)) |
| **Ricci scalar** R | 1 | One overall average of the curvature at a point ([Hughes 2024](https://web.mit.edu/sahughes/www/8.962/lec11.pdf)) |

In the empty space around Earth, the Ricci tensor is zero but the Weyl tensor is not, which is how the Moon raises tides across a vacuum ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019); [Baez & Bunn 2005](https://arxiv.org/abs/gr-qc/0103044)).

### The stress-energy tensor

The source of curvature is the **stress-energy tensor** T_μν, the engineering stress tensor extended to include energy and momentum. Its entries are **energy density**, momentum density and energy flow, **pressures** and **shear stresses** ([Baez & Bunn 2005](https://arxiv.org/abs/gr-qc/0103044); [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). **Pressure gravitates.** In daily life its effect is negligible, about 3×10⁻¹² of the gravity of air's own mass (calculation: 3P/(ρc²) with P = 1.0×10⁵ Pa and ρ = 1.2 kg/m³, since the source is ρ + (Px + Py + Pz)/c²), but inside neutron stars it rivals energy density and helps push stars above about two solar masses into collapse ([Baez & Bunn 2005](https://arxiv.org/abs/gr-qc/0103044)). Negative pressure makes gravity repel (Chapter 8).

### Einstein's field equations

```
G_μν  +  Λ·g_μν  =  (8πG / c⁴) · T_μν ,          where   G_μν = R_μν − ½·R·g_μν
```

| Symbol | Name | Plain English |
|---|---|---|
| μ, ν | indices | Each runs over t, x, y, z: 10 distinct equations ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)) |
| g_μν | metric tensor | The unknown geometry |
| R_μν, R | Ricci tensor and scalar | Curvature, from first and second derivatives of the metric ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)) |
| G_μν | Einstein tensor | The curvature combination that automatically conserves energy and momentum ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)) |
| Λ | cosmological constant | Built-in curvature of empty space; acts like vacuum energy with negative pressure ([Baez & Bunn 2005](https://arxiv.org/abs/gr-qc/0103044); [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)) |
| T_μν | stress-energy tensor | Energy, momentum, pressure and stress of everything present |
| 8πG/c⁴ | coupling constant | About 2.1×10⁻⁴³ per newton (calculation); 8π is fixed by matching Newton's law ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)) |

The left side is geometry and the right side is contents. Because the coupling is so tiny, spacetime around us is nearly flat: even inside matter as dense as water, the radius of curvature, roughly 1/√(8πGρ/c²), would be about 1.5 times the Earth–Sun distance (calculation). Baez and Bunn give an exact plain-English version: for a small ball of free-falling particles initially at rest, "the rate at which it begins to shrink is proportional to its volume times: the energy density at the center of the ball, plus the pressure in the x direction at that point, plus the pressure in the y direction, plus the pressure in the z direction" ([Baez & Bunn 2005](https://arxiv.org/abs/gr-qc/0103044)). They are 10 coupled partial differential equations (6 independent once coordinate freedom is removed), nonlinear because gravity's own energy gravitates; exact solutions need high symmetry, merger simulations run on supercomputers, and weak, slow fields recover Newton's ∇²Φ = 4πGρ ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019); [NASA 2006](https://www3.nasa.gov/vision/universe/starsgalaxies/gwave.html)).

### Worked Example 2: a thrown ball maximizes its own aging

A ball thrown straight up at v₀ returns after T = 2v₀/g, with height h = v₀t − ½gt² and speed v = v₀ − gt. Since dτ ≈ (1 + gh/c² − v²/2c²) dt, the ball's clock gains on a ground clock by

```
Δτ = (1/c²) ∫₀ᵀ [ g·h − ½·v² ] dt  =  (1/c²) [ 2v₀³/(3g) − v₀³/(3g) ]  =  v₀³ / (3g·c²)
```

which is about 4×10⁻¹⁶ s for v₀ = 10 m/s (calculation). Vary the path slightly with the same launch and catch, integrate by parts, and the proper time is maximal only when ḧ = −g (calculation). So **Newtonian gravity is "free bodies maximize their own elapsed time," in a world where higher clocks run faster** ([Pössel 2018](https://arxiv.org/abs/1812.11589)), which is the principle of least action you will meet in Lagrangian mechanics (the integrand above is minus the Newtonian Lagrangian ½v² − gh).

### The mathematics you'll eventually need

You can *understand* GR's ideas with calculus now. You can *compute* its predictions after multivariable calculus, linear algebra, differential equations and Lagrangian mechanics. You can *do research* after partial differential equations, differential geometry and tensor calculus. MIT's graduate GR course, for example, requires differential equations, linear algebra and advanced electromagnetism ([MIT OCW 8.962](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus)). Chapter 12 turns this into a timeline.

---

## 6. Black holes: where curvature wins

### Gravitational collapse

When a massive star's core runs out of fuel, electron pressure cannot support it above about **1.4 solar masses** ([Chandrasekhar 1931](https://doi.org/10.1086/143324); [Chandrasekhar 1983](https://www.nobelprize.org/uploads/2018/06/chandrasekhar-lecture.pdf)), and neutron pressure fails somewhere around **2.0–2.3 solar masses**, a limit still uncertain ([Oppenheimer & Volkoff 1939](https://doi.org/10.1103/PhysRev.55.374); [Rezzolla et al. 2018](https://arxiv.org/abs/1711.00314)). Beyond that, nothing known stops the collapse, and Roger Penrose proved in 1965 that a singularity must then form even without perfect symmetry (Nobel Prize 2020; [Penrose 1965](https://doi.org/10.1103/PhysRevLett.14.57); [NobelPrize.org](https://www.nobelprize.org/prizes/physics/2020/popular-information/)).

### The Schwarzschild solution and the event horizon

```
ds² = −(1 − r_s/r)·c²dt²  +  dr²/(1 − r_s/r)  +  r²·(dθ² + sin²θ dφ²) ,        r_s = 2GM/c²
```

This is Schwarzschild's 1916 solution for spacetime outside a spherical, non-rotating mass M ([Schwarzschild 1916](https://arxiv.org/abs/physics/9905030); [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). Here t is the time on a far-away clock, r is defined so that a sphere has area 4πr² (it is not ruler distance from the centre), θ and φ are angles, and r_s is the **Schwarzschild radius**, about 3 km per solar mass: **2.95 km for the Sun and 8.9 mm for Earth** (calculation; [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). If a mass is squeezed inside r_s, that sphere becomes an **event horizon**, where light cones tip so far that every future direction points inward ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). The metric's apparent blow-up there is an artifact of these coordinates, and a falling astronaut notices nothing locally special ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). Inside, as Carroll puts it, "you can no more stop moving toward the singularity than you can stop getting older" ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). At r = 0, the **singularity** is where curvature becomes infinite and GR stops making predictions (**predicted**; [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019); [NobelPrize.org](https://www.nobelprize.org/prizes/physics/2020/popular-information/)). It lies in the infaller's future, not at a place, and many physicists hope a quantum theory of gravity will replace it (**speculative**; [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)).

### Time and orbits near a black hole

```
Non-rotating black hole along one radial line (not to scale); r_s = 2GM/c²

r = 0      r = r_s           r = 1.5 r_s          r = 3 r_s
 *===========|------------------:--------------------|---------------->  r
singularity event horizon   photon sphere        innermost stable
                                                 circular orbit
inside: every path          light can circle     planets/gas orbit
ends at r = 0               (unstably)           stably only outside
```

A clock hovering at radius r ticks at dτ/dt = √(1 − r_s/r) relative to a distant clock: 0.82 at 3 r_s, 0.30 at 1.1 r_s and zero at the horizon (calculation). Light can circle the hole at the **photon sphere** (1.5 r_s), and stable orbits exist only beyond the **innermost stable circular orbit**, or ISCO (3 r_s) ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019); [Bambi & Nampalliwar 2020](https://arxiv.org/abs/1810.07032)). That is why the planet in *Interstellar* where an hour equals seven years needs a rapidly spinning black hole ([Dhingra et al. 2026](https://arxiv.org/abs/2606.01921)).

### Spinning black holes, frame dragging and accretion disks

Roy Kerr's 1963 solution describes spinning black holes ([Kerr 1963](https://doi.org/10.1103/PhysRevLett.11.237)). Spin drags spacetime around like stirred honey, an effect called **frame dragging**. In the **ergosphere**, just outside the horizon, nothing can stay still relative to the distant stars; at maximum spin the horizon shrinks to r_s/2; and in any spinning hole the singularity is a ring rather than a point ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). Frame dragging around Earth is **established**: Gravity Probe B measured −37.2 ± 7.2 milliarcseconds per year against GR's −39.2 ([Everitt et al. 2011](https://arxiv.org/abs/1105.3456)). The **no-hair theorem** says a settled black hole is fully described by its mass, spin and electric charge ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). Infalling gas forms a hot, glowing **accretion disk**, and before it plunges past the ISCO it can radiate about **5.7% of its rest-mass energy around a non-spinning hole and up to 42% around a maximally spinning one**, against 0.7% for hydrogen fusion (calculation: efficiency = 1 − E_ISCO, the gas's energy per unit rest energy at the ISCO, giving 1 − 2√2/3 and 1 − 1/√3; [Bambi & Nampalliwar 2020](https://arxiv.org/abs/1810.07032)). That is why quasars, accreting supermassive black holes, can outshine whole galaxies ([NobelPrize.org](https://www.nobelprize.org/prizes/physics/2020/popular-information/)).

### Observed versus predicted, and common myths

| Status | Claim | Evidence |
|---|---|---|
| Established | Objects too heavy to be neutron stars exist | Cygnus X-1, discovered 1964, weighs 21.2 ± 2.2 solar masses ([MacLeod & Grindlay 2023](https://arxiv.org/abs/2304.09368); [Miller-Jones et al. 2021](https://arxiv.org/abs/2102.09091)) |
| Established | A 4.3-million-solar-mass object at the Milky Way's centre bends orbits as GR predicts | Star S2 shows GR's redshift (2018) and orbital precession (2020) ([GRAVITY 2018](https://arxiv.org/abs/1807.09409); [GRAVITY 2020](https://arxiv.org/abs/2004.07187); [GRAVITY 2022](https://arxiv.org/abs/2112.07478)) |
| Established | Shadows have the size GR predicts | EHT rings: M87* 42 ± 3 μas, Sgr A* 51.8 ± 2.3 μas; M87*'s ring kept its size from 2017 to 2021 while its bright spot moved ([EHT 2019](https://arxiv.org/abs/1906.11238); [EHT 2022](https://arxiv.org/abs/2311.08680); [EHT 2025](https://arxiv.org/abs/2509.24593)) |
| Predicted | Hawking radiation | About 60 billionths of a kelvin for a solar-mass hole (calculation: T = ħc³/(8πGMk_B); [Hawking 1974](https://doi.org/10.1038/248030a0); [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)); seen only in laboratory analogues, such as sound in an ultracold atomic gas ([Steinhauer 2016](https://arxiv.org/abs/1510.00621); [Drori et al. 2019](https://arxiv.org/abs/1808.09244); [Physics World 2016](https://physicsworld.com/a/entangled-hawking-radiation-spotted-in-analogue-black-hole/)) |
| Speculative | What replaces the singularity | No observational access (Chapter 10; [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)) |

| Myth | Reality |
|---|---|
| Black holes suck everything in | Far away they pull like any equal mass; swap the Sun for a one-solar-mass black hole and Earth's orbit would not change ([NASA](https://imagine.gsfc.nasa.gov/educators/blackholes/imagine/page26.html); [Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)) |
| The EHT photographed the horizon | It imaged glowing gas lensed into a ring around the shadow, which is larger than the horizon ([EHT 2019](https://arxiv.org/abs/1906.11238)) |
| Black holes are infinitely dense | Only the singularity is; the average density inside M87*'s horizon, M/(4πr_s³/3) for M = 6.5 billion solar masses, is lower than air's (rough calculation; [EHT 2019](https://arxiv.org/abs/1906.11238)) |
| Crossing the horizon kills you instantly | Near a 10-solar-mass hole, tides of about 2×10⁷ g shred you outside the horizon; at Sgr A*'s horizon the stretch is only about 10⁻⁴ g (calculation: Δa ≈ 2GML/r³ for a 2 m body at r = r_s) |

---

## 7. Gravitational waves: spacetime that rings

### What they are and how masses make them

A **gravitational wave** is a ripple in spacetime curvature moving at the speed of light ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). It stretches distances in one direction while squeezing them in the perpendicular one, in two patterns, "plus" and "cross," rotated 45° apart ([Sathyaprakash & Schutz 2009](https://arxiv.org/abs/0903.0338)).

```
  A ring of free-floating particles, seen face-on, as a "plus"-polarized wave
  passes straight into the page (one full cycle, left to right):

      phase 0         quarter cycle       half cycle      three-quarter cycle
        o o o              o                o o o
      o       o          o   o            o       o        o o o o o o o
      o       o          o   o            o       o      o               o
      o       o          o   o            o       o        o o o o o o o
        o o o            o   o              o o o
                           o
       circle         stretched up-down,     circle      stretched left-right,
                      squeezed left-right                squeezed up-down
  The "cross" polarization does the same pattern rotated by 45 degrees.
```

Momentum conservation forbids the simplest ("dipole") radiation, and perfectly spherical motion emits nothing ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). Waves come from a changing **quadrupole**, an elongated mass distribution such as two orbiting stars ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)):

```
h  ≈  (2G / (c⁴·R)) · d²I/dt²
```

h is the **strain** (the fractional change in length), R the distance to the source, and I measures how the mass is spread out (I = ∫ρ·xᵢxⱼ d³x) ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)). Because G/c⁴ is tiny, the whole Earth–Sun system radiates only about 200 watts (calculation: the circular-orbit power P = (32/5)(G⁴/c⁵)(m₁m₂)²(m₁+m₂)/r⁵ from [LIGO & Virgo 2017](https://arxiv.org/abs/1608.01940) gives ≈ 196 W); detectable waves need huge masses moving near light speed ([Sathyaprakash & Schutz 2009](https://arxiv.org/abs/0903.0338)). The first evidence was indirect: the Hulse–Taylor pulsar's orbital period shrinks at **0.9983 ± 0.0016** times the rate GR predicts for energy lost to gravitational waves ([Weisberg & Huang 2016](https://arxiv.org/abs/1606.02744); [NobelPrize.org](https://www.nobelprize.org/prizes/physics/1993/press-release/)).

### How LIGO detects a change hundreds of times smaller than a proton

```
                     [=]  end mirror (hanging test mass)
                      |
                      |   arm Y: 4 km of ultra-high vacuum
                      |
   LASER ======>     [/]---------------------------------------[=]  end mirror
                      |   beam splitter          arm X: 4 km
                      v
               [ photodetector ]   kept dark while the arms are equal; a passing wave
                                   lengthens one arm and shortens the other, so light
                                   leaks out in a pattern that traces the wave
```

LIGO's two detectors, in Washington and Louisiana, are interferometers with 4 km arms ([Abbott et al. 2016](https://arxiv.org/abs/1602.03837)), tuned so that the recombined light cancels ([Sathyaprakash & Schutz 2009](https://arxiv.org/abs/0903.0338)). A passing wave lengthens one arm and shortens the other, and light leaks out; for the first detection the change was about **4×10⁻¹⁸ m, a few hundred times smaller than a proton** ([LIGO](https://ligo.org/science-summaries/gw150914detector/)). Measuring that takes mirrors hung from four-stage pendulums, hundreds of kilowatts of laser light circulating in the arms and "squeezed" light that suppresses quantum noise, used since 2019 and made frequency-dependent for the run that began in 2023 ([LIGO](https://ligo.org/science-summaries/gw150914detector/); [Tse et al. 2019](https://doi.org/10.1103/PhysRevLett.123.231107); [Capote et al. 2025](https://arxiv.org/abs/2411.14607)). Two distant sites reject local noise and help locate the source ([Abbott et al. 2016](https://arxiv.org/abs/1602.03837)).

### Black-hole and neutron-star mergers

On **14 September 2015** LIGO recorded a 0.2-second "chirp" rising from 35 to 250 Hz: black holes of about 36 and 29 solar masses, 1.3 billion light-years away, merging into one of 62 and radiating **3 solar masses of energy** as gravitational waves ([Abbott et al. 2016](https://arxiv.org/abs/1602.03837); [NobelPrize.org](https://www.nobelprize.org/prizes/physics/2017/press-release/)). Its inspiral, merger and "ringdown" (the new hole ringing like a struck bell) matched GR ([Abbott et al. 2016](https://arxiv.org/abs/1602.03837); Nobel Prize 2017, [NobelPrize.org](https://www.nobelprize.org/prizes/physics/2017/press-release/)). On 17 August 2017 merging neutron stars produced a gamma-ray burst **1.7 seconds** after the waves, showing that gravity travels at light speed to about one part in 10¹⁵ ([Abbott et al. 2017](https://arxiv.org/abs/1710.05834)), along with a **kilonova** whose light, according to models, showed freshly forged heavy elements such as gold and platinum ([Kasen et al. 2017](https://arxiv.org/abs/1710.05463)). GWTC-5.0 (May 2026) lists **390 candidate signals through January 2025** ([LVK 2026](https://arxiv.org/abs/2605.27225)), and the fourth observing run (May 2023 to November 2025) alone yielded **about 300 significant signals** ([ICRR](https://gwcenter.icrr.u-tokyo.ac.jp/en/archives/2069)). Highlights include GW231123, the most massive black-hole merger detected so far ([LIGO 2025](https://ligo.org/ligo-virgo-kagra-detect-most-massive-black-hole-merger-to-date/)), which left a black hole of roughly 220 solar masses ([LVK 2025](https://arxiv.org/abs/2507.08219)), and GW250114, the loudest signal catalogued so far (signal-to-noise ratio about 77–80), which rang down like a Kerr black hole and confirmed, at high credibility, Hawking's theorem that total horizon area never decreases ([LVK 2025](https://arxiv.org/abs/2509.08054); [LVK 2026](https://arxiv.org/abs/2605.27225)). The detectors are now being upgraded: a six-month interim run is targeted to start in mid-January 2027, and the timing of the fifth full run (O5), earlier planned for 2028, is under discussion ([AEI](https://www.aei.mpg.de/gwastronomy); [ICRR](https://gwcenter.icrr.u-tokyo.ac.jp/en/archives/2069)).

### Why gravitational-wave astronomy matters

Gravitational waves reveal dark objects, test GR where gravity is strongest, weigh black-hole populations, probe neutron-star matter, trace where heavy elements are made, and measure cosmic expansion independently ([Sathyaprakash & Schutz 2009](https://arxiv.org/abs/0903.0338); [Abbott et al. 2017, H₀](https://arxiv.org/abs/1710.05835)). Different detectors hear different frequencies:

| Detector | Band | Main sources | Status (October 2026) |
|---|---|---|---|
| LIGO, Virgo, KAGRA; LIGO-India under construction since April 2026 | ~10 Hz to kHz | Stellar-mass black holes, neutron stars | Established; upgrading for O5 ([Sathyaprakash & Schutz 2009](https://arxiv.org/abs/0903.0338); [ICRR](https://gwcenter.icrr.u-tokyo.ac.jp/en/archives/2069); [Caltech 2026](https://www.caltech.edu/about/news/ligo-india-breaks-ground-on-new-observatory)) |
| Pulsar timing arrays, e.g. NANOGrav | Nanohertz | Pairs of supermassive black holes (most likely) | 3–4σ evidence for a background since 2023, short of a 5σ detection ([NANOGrav 2023](https://arxiv.org/abs/2306.16213); [Yu & Allen 2025](https://arxiv.org/abs/2512.08666)) |
| LISA (space, 2.5-million-km arms) | Millihertz | Merging supermassive black holes | Adopted by ESA in 2024; launch planned around 2035 ([ESA](https://www.esa.int/Science_Exploration/Space_Science/LISA/Capturing_the_ripples_of_spacetime_LISA_gets_go-ahead); [Colpi et al. 2024](https://arxiv.org/abs/2402.07571)) |
| Einstein Telescope, Cosmic Explorer | Ground band, much more sensitive | Mergers across cosmic history | Planned for the mid-2030s at the earliest; ET site decision expected in 2027 ([Physics World 2025](https://physicsworld.com/a/physicists-set-to-decide-location-for-next-generation-einstein-telescope/); [ET Meuse-Rhine 2026](https://www.einsteintelescope-emr.eu/en/2026/10/05/maximising-opportunities-the-einstein-telescope-in-a-triangular-or-l-shaped-configuration/); [Cosmic Explorer](https://cosmicexplorer.org/)) |

> **Think about it:** A wave stretches a 4 km arm and a 1 m ruler by the same *fraction*. Why, then, do LIGO's arms need to be kilometres long?

---

## 8. General relativity and the universe: an expanding spacetime

### One function for the whole universe

The **cosmological principle** holds that on the largest scales the universe is the same everywhere and in every direction ([PDG cosmology review](https://pdg.lbl.gov/2024/reviews/rpp2024-rev-bbang-cosmology.pdf)), a view supported by a cosmic microwave background uniform to about 1 part in 10⁵ ([PDG CMB review](https://pdg.lbl.gov/2024/reviews/rpp2024-rev-cosmic-microwave-background.pdf)). It reduces cosmic geometry to a constant curvature and a single function, the **scale factor** a(t), which multiplies every large distance (a = 1 today) ([PDG cosmology review](https://pdg.lbl.gov/2024/reviews/rpp2024-rev-bbang-cosmology.pdf)). Einstein's 1917 static model needed the cosmological constant Λ and proved unstable; the tale that he called Λ his "biggest blunder" comes secondhand from George Gamow and has been doubted, though a 2018 historical study judged it very likely true ([O'Raifeartaigh & Mitton 2018](https://arxiv.org/abs/1804.06768)). Friedmann (1922) and Lemaître (1927) found expanding solutions, and Lemaître and Hubble found galaxies receding at speeds proportional to their distance: the **Hubble–Lemaître law**, v = H₀·d ([O'Raifeartaigh & Mitton 2018](https://arxiv.org/abs/1804.06768); [IAU 2018](https://www.iau.org/Iau/Publications/List-of-Resolutions)).

```
   EARLIER (scale factor a = 0.5)            TODAY (a = 1)

     G---G---G---G                             G-------G-------G-------G
     |   |   |   |            ===>             |       |       |       |
     G---G---G---G                             G-------G-------G-------G
    you  1   2   3                            you      2       4       6
   (distance of each galaxy from "you", arbitrary units)

   Every spacing doubled in the same time, so the galaxy 3 units away receded 3 units
   while the one 1 unit away receded 1: speed is proportional to distance (v = H·d).
```

If every distance is d(t) = a(t)·χ with χ fixed, then v = (ȧ/a)·d, so H = ȧ/a and every galaxy sees the same law ([Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808)). There is no centre and nothing to expand "into"; the Big Bang happened everywhere ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019); [PDG cosmology review](https://pdg.lbl.gov/2024/reviews/rpp2024-rev-bbang-cosmology.pdf)).

### The Friedmann equations

```
H²  =  (ȧ/a)²  =  (8πG/3)·ρ  −  k·c²/a²  +  Λ·c²/3              (expansion rate)
           ä/a  =  −(4πG/3)·(ρ + 3p/c²)  +  Λ·c²/3              (acceleration)
```

H is the expansion rate (H₀ today); ȧ and ä are the first and second time derivatives of a; ρ is the density of matter and radiation; p is their pressure; k is the curvature of space today (positive closed, 0 flat, negative open); and Λ is the cosmological constant ([Carroll 2001](https://arxiv.org/abs/astro-ph/0004075), eqs. 8–9, written there with c = 1). The first equation works like a ball thrown upward: expansion against gravitational pull, with curvature playing the role of total energy. The second shows **pressure gravitates** (ρ + 3p/c²), so matter and radiation slow the expansion while strongly negative pressure, like Λ's, speeds it up. Space is measured to be flat to within about 0.2% ([Planck 2018](https://arxiv.org/abs/1807.06209)).

### Redshift, the Big Bang and the dark universe

Light's wavelength stretches along with space: **1 + z = a(now)/a(then)**, where z is the cosmological redshift ([Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808)). This is not an ordinary Doppler shift: distant galaxies can recede faster than light without breaking relativity, whose speed limit applies to local motion ([Davis & Lineweaver 2004](https://arxiv.org/abs/astro-ph/0310808)), and bound systems such as atoms, planetary orbits and galaxies do not expand ([Cooperstock et al. 1998](https://arxiv.org/abs/astro-ph/9803097)).

Four pillars support the Big Bang model ([PDG cosmology review](https://pdg.lbl.gov/2024/reviews/rpp2024-rev-bbang-cosmology.pdf)): the expansion; the **cosmic microwave background (CMB)**, 2.725 K light released when the universe was about 1,090 times smaller ([Fixsen 2009](https://arxiv.org/abs/0911.1955); [Planck 2018](https://arxiv.org/abs/1807.06209)); light elements forged in the first minutes, about 24.5% helium by mass ([PDG BBN review](https://pdg.lbl.gov/2024/reviews/rpp2024-rev-bbang-nucleosynthesis.pdf)); and large-scale structure ([Eisenstein et al. 2005](https://arxiv.org/abs/astro-ph/0501171)). The universe is **13.787 ± 0.020 billion years** old in the standard model ([Planck 2018](https://arxiv.org/abs/1807.06209)). Its t = 0 "singularity" marks where the model fails, not an observed event ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)), and **inflation**, an early burst of accelerated expansion, fits the data but is unconfirmed ([Planck 2018 X](https://arxiv.org/abs/1807.06211); [BICEP/Keck 2021](https://arxiv.org/abs/2110.00483)).

The universe's energy budget is about **5% ordinary matter, 26% dark matter and 69% dark energy** (calculation from the fitted densities in [Planck 2018](https://arxiv.org/abs/1807.06209): Ω_b ≈ 0.049, Ω_c ≈ 0.261, Ω_Λ ≈ 0.689). **Dark matter** is seen only through its gravity: cluster galaxies move too fast ([Zwicky 1933](https://www.e-periodica.ch/digbib/view?pid=hpa-001:1933:6::115); [Bertone & Hooper 2018](https://arxiv.org/abs/1605.04909)), galaxies' outer stars orbit too fast ([Rubin et al. 1980](https://doi.org/10.1086/158003)), and in the colliding Bullet Cluster the mass mapped by lensing sits apart from the ordinary gas at 8σ ([Clowe et al. 2006](https://arxiv.org/abs/astro-ph/0608407)). **Dark energy** was inferred in 1998 from unexpectedly dim distant supernovae, which showed the expansion accelerating (Nobel Prize 2011) ([NobelPrize.org](https://www.nobelprize.org/prizes/physics/2011/press-release/)). Its simplest explanation is Λ, yet quantum estimates of the vacuum's energy overshoot the observed value by roughly 55 to 120 orders of magnitude, depending on how the estimate is made: the **cosmological constant problem** ([Carroll 2001](https://arxiv.org/abs/astro-ph/0004075); [Martin 2012](https://arxiv.org/abs/1205.3365)). Over billions of years gravity grew the CMB's tiny ripples into the **cosmic web** of filaments and voids, which still carries a 147 Mpc "standard ruler" imprinted by sound waves in the early universe ([Eisenstein et al. 2005](https://arxiv.org/abs/astro-ph/0501171); [Planck 2018](https://arxiv.org/abs/1807.06209)).

### Open tensions and possible futures

The **Hubble tension**: early-universe data imply an expansion rate of about 67 km/s/Mpc, the leading local measurement gives about 73 (roughly 5σ apart), and another team finds about 70; it is still debated whether a measurement error or new physics is to blame ([Cai & Wang 2026](https://arxiv.org/abs/2606.20434); [Freedman et al. 2025](https://arxiv.org/abs/2408.06153)). **Evolving dark energy**: in 2025, DESI's galaxy maps combined with other data preferred a weakening dark energy at 2.8–4.2σ ([DESI 2025](https://arxiv.org/abs/2503.14738)); recalibrated supernova data cut the strongest case to about 3.2σ ([Popovic et al. 2025](https://arxiv.org/abs/2511.07517)), and a July 2026 DESI result moved back toward a constant ([DESI](https://www.desi.lbl.gov/2026/07/30/new-desi-dr2-lyman-alpha-results-shed-light-on-dark-energy/)), all short of the 5σ discovery standard. The universe's fate depends on the answer. A true constant Λ means eternal expansion into a cold "Big Freeze," dark energy that strengthens could cause a "Big Rip" ([Caldwell et al. 2003](https://arxiv.org/abs/astro-ph/0302506)), and dark energy that decays and turns negative could end in a "Big Crunch" ([Kallosh et al. 2003](https://arxiv.org/abs/astro-ph/0307185)).

---

## 9. Experimental evidence and real-world applications

GR is tested by asking how far nature deviates from its predictions. Solar System tests are summarized by a few parameters; the most important, γ, measures how much space curvature a unit of mass produces, and equals exactly 1 in GR ([Will 2014](https://arxiv.org/abs/1403.7377)). Every row below is **established**.

| Test | GR's prediction | Best measurement | Agreement |
|---|---|---|---|
| Universality of free fall | All bodies fall identically | MICROSCOPE satellite, 2022 ([Touboul et al. 2022](https://arxiv.org/abs/2209.15487)) | ~10⁻¹⁵ |
| Mercury's perihelion | An extra 42.98″ per century | Matches the observed 43″ anomaly ([Will 2014](https://arxiv.org/abs/1403.7377)) | ~10⁻⁴ |
| Light bending by the Sun | 1.75″ at the Sun's edge | Radio interferometry of hundreds of distant radio sources ([Will 2014](https://arxiv.org/abs/1403.7377)) | ~0.02% |
| Shapiro time delay | Radar echoes grazing the Sun return ~230–290 μs late, depending on the target's distance (calculation from Will's formula) | Cassini, 2003: γ − 1 = (2.1 ± 2.3)×10⁻⁵ ([Will 2014](https://arxiv.org/abs/1403.7377)) | ~10⁻⁵ |
| Gravitational redshift | Lower clocks run slow by gh/c² | Galileo satellites, 2018 ([Delva et al. 2018](https://arxiv.org/abs/1812.03711)); lab clocks 33 cm apart ([NIST 2010](https://www.nist.gov/news-events/news/2010/09/nist-pair-aluminum-atomic-clocks-reveal-einsteins-relativity-personal)) and across a 1 mm atom cloud ([Bothwell et al. 2022](https://arxiv.org/abs/2109.12238)) | ~10⁻⁵ |
| Flying clocks | Speed and altitude change clock rates | Hafele–Keating, 1971: eastbound −59 ± 10 ns vs −40 ± 23 predicted; westbound +273 ± 7 vs +275 ± 21 ([Hafele & Keating 1972a](https://doi.org/10.1126/science.177.4044.166); [Hafele & Keating 1972b](https://doi.org/10.1126/science.177.4044.168)) | Within errors |
| Frame dragging | Earth's spin twists gyroscopes | Gravity Probe B, 2011 ([Everitt et al. 2011](https://arxiv.org/abs/1105.3456)) | ~20% |
| Gravitational-wave emission | Binary orbits shrink at a set rate | Double Pulsar, 16 years ([Kramer et al. 2021](https://arxiv.org/abs/2112.06795)) | ~0.013% |

Black-hole observations (Chapter 6) and gravitational-wave detections (Chapter 7) extend these tests into strong gravity: shadow sizes and the orbit of S2 agree with GR to roughly 10–20% ([EHT 2022](https://doi.org/10.3847/2041-8213/ac6756); [GRAVITY 2020](https://arxiv.org/abs/2004.07187)), and gravitational waves travel at c to about one part in 10¹⁵ ([Abbott et al. 2017](https://arxiv.org/abs/1710.05834)).

**Gravitational lensing** is both a test and a tool. Galaxies and clusters bend light from objects behind them; the first such lens, found in 1979, showed one quasar twice ([Walsh et al. 1979](https://doi.org/10.1038/279381a0); [Treu 2010](https://arxiv.org/abs/1003.5567)). Strong lensing makes arcs and "Einstein rings" ([Treu 2010](https://arxiv.org/abs/1003.5567)), weak lensing maps dark matter statistically ([Clowe et al. 2006](https://arxiv.org/abs/astro-ph/0608407)), and microlensing, the brief brightening as one star passes in front of another, can even reveal planets ([Bond et al. 2004](https://arxiv.org/abs/astro-ph/0404309)).

**Applications.** Every satellite navigation system applies the clock corrections of Chapter 4 ([Ashby 2003](https://doi.org/10.12942/lrr-2003-1); [ESA Navipedia](https://gssc.esa.int/navipedia/index.php/Relativistic_Clock_Correction)). Optical clocks precise to about 10⁻¹⁸ can sense a 1 cm height difference through gravitational time dilation (calculation from gh/c²; [McGrew et al. 2018](https://arxiv.org/abs/1807.11282)), a technique called relativistic geodesy ([Grotti et al. 2018](https://arxiv.org/abs/1705.04089)). In October 2026 the General Conference on Weights and Measures asked for a proposal for a new definition of the second, based on optical clocks, to be presented at its 2030 meeting, a change it says requires "mastering the relativistic effects at the appropriate uncertainty level" ([BIPM 2026](https://www.bipm.org/en/cgpm-2026/resolution-4)).

**Verified versus open.** In weak gravity, GR is confirmed to parts in 10⁵ or better ([Will 2014](https://arxiv.org/abs/1403.7377)); in strong gravity no confirmed deviation has been found so far ([LVK 2026](https://arxiv.org/abs/2603.19019); [Kramer et al. 2021](https://arxiv.org/abs/2112.06795)), but some properties, such as whether black holes truly have "no hair," are checked only to tens of percent ([LVK 2025](https://arxiv.org/abs/2509.08099)). The open question is whether GR is the final word, and the dark sector, the Hubble tension and the quantum regime are where physicists look for a crack ([Ishak 2019](https://arxiv.org/abs/1806.10122); [Abdalla et al. 2022](https://arxiv.org/abs/2203.06142); [Donoghue 1995](https://arxiv.org/abs/gr-qc/9512024)).

---

## 10. The frontiers of general relativity research

These topics differ enormously in status. **Serious but speculative** means a mainstream research programme without experimental confirmation; **science fiction** means mathematically writable but with no demonstrated physical route to reality.

| Frontier | Question | Kind of work | Status (October 2026) |
|---|---|---|---|
| Quantum gravity | What theory describes gravity at the smallest scales? | Mathematical, some computational | Serious but speculative |
| GR and quantum mechanics | Is gravity quantum? Can it entangle two masses? | Experimental and theoretical | Experiments under way; no result yet |
| Information paradox | Does information escape evaporating black holes? | Mathematical | Page curve derived in model universes; realistic case open |
| Singularities, cosmic censorship | Are singularities always hidden behind horizons? | Pure mathematics, some numerical | Formation proven; censorship unproven |
| Alternative theories | Does GR need modifying for the dark sector? | Theory checked by observation | Constrained, not excluded |
| Wormholes | Can spacetime shortcuts exist and be crossed? | Mathematical | No evidence; macroscopic traversable ones are science fiction |
| Warp drives | Can spacetime be engineered for faster-than-light travel? | Mathematical | Science fiction |
| Numerical relativity | How do black holes and neutron stars merge? | Computational | Established and essential |
| Strong-field gravity | Does GR hold near horizons and in mergers? | Observational, data analysis | Passes so far |
| Tests of GR | Where could GR fail first? | Experimental, observational | No confirmed deviation; new instruments planned |
| Unified theory | One framework for all forces? | Mathematical | Serious but speculative |

**Quantum gravity and quantum mechanics.** GR treats spacetime as smooth and definite; quantum mechanics says everything fluctuates. At everyday energies GR works fine as an "effective" quantum theory with tiny corrections ([Donoghue 1995](https://arxiv.org/abs/gr-qc/9512024)), but the conflict becomes unavoidable near the **Planck length**, 1.6×10⁻³⁵ m ([NIST](https://physics.nist.gov/cgi-bin/cuu/Value?plkl)), exactly where singularities, the Big Bang and black-hole interiors lie. Candidates include string theory, loop quantum gravity, asymptotic safety and causal sets, none confirmed; in a 2025 open online survey of 1,675 readers of APS's *Physics Magazine* and APS members, none won even 20% support, and "no opinion" was the largest answer (28.7%) ([Afshordi et al. 2026](https://arxiv.org/abs/2605.11058)). The most concrete new work is experimental: put two tiny masses into quantum superpositions and test whether gravity alone entangles them, which, its proposers argue, would show gravity has quantum features ([Bose et al. 2017](https://arxiv.org/abs/1707.06050)). Gravity has been measured between gold spheres of about 90 mg ([Westphal et al. 2021](https://arxiv.org/abs/2009.09546)), but gravity-induced entanglement was still at the proposal stage in a 2025 review and in 2026 papers, with no successful experiment reported as of October 2026 ([Bose et al. 2025](https://arxiv.org/abs/2311.09218); [Williams 2026](https://arxiv.org/abs/2605.00967)).

**Black-hole information.** Hawking argued in 1976 that evaporating black holes destroy information, violating quantum mechanics ([Hawking 1976](https://doi.org/10.1103/PhysRevD.14.2460)). If information survives, the radiation's entanglement must rise and then fall, tracing a "Page curve" ([Page 1993](https://arxiv.org/abs/hep-th/9306083)). The 2019–20 "island" calculations derived that curve from gravity itself ([Penington 2019](https://arxiv.org/abs/1905.08255); [Quanta 2020](https://www.quantamagazine.org/the-black-hole-information-paradox-comes-to-an-end-20201029/)), but mainly in simplified model universes, and they do not show how information is physically encoded in real Hawking radiation ([Almheiri et al. 2021](https://arxiv.org/abs/2006.06872)).

**Singularities and cosmic censorship.** Penrose's theorem proves that collapse in GR produces a singularity once a trapped surface forms ([Penrose 1965](https://doi.org/10.1103/PhysRevLett.14.57)). **Cosmic censorship**, the conjecture that realistic singularities are always hidden inside horizons, is unproven; known violations are fine-tuned or occur in settings unlike our universe, such as five-dimensional spacetimes ([Ong 2020](https://arxiv.org/abs/2005.07032); [Lehner & Pretorius 2010](https://arxiv.org/abs/1006.5960)). In 2017 Dafermos and Luk showed that, if rotating black holes are stable from outside (as widely expected), the strongest form of a related conjecture about rotating black-hole interiors is false ([Dafermos & Luk 2017](https://arxiv.org/abs/1710.01722)), and the stability of slowly rotating Kerr black holes was proved in a series of papers whose final part was published in 2024 ([Giorgi, Klainerman & Szeftel 2024](https://arxiv.org/abs/2205.14808)). This is one of GR's most purely mathematical corners.

**Alternative theories.** GR passes every precision test ([Will 2014](https://arxiv.org/abs/1403.7377)), but the dark sector keeps alternatives alive ([Ishak 2019](https://arxiv.org/abs/1806.10122)), and one observation can sweep many away: GW170817's proof that gravitational waves travel at light speed eliminated large families of dark-energy-motivated theories almost overnight, leaving only a few classes standing ([Ezquiaga & Zumalacárregui 2017](https://arxiv.org/abs/1710.05901)). MOND fits galaxy rotation well but struggles with galaxy clusters, the Bullet Cluster and the CMB ([Famaey & McGaugh 2012](https://arxiv.org/abs/1112.3960); [PDG 2026](https://pdg.lbl.gov/2026/reviews/rpp2026-rev-dark-matter.pdf)).

**Wormholes and warp drives: serious mathematics versus science fiction.** Wormholes are legitimate solutions of Einstein's equations, but lensing searches have found none ([Takahashi & Asada 2013](https://arxiv.org/abs/1303.1301)); the original Einstein–Rosen bridge pinches off faster than light can cross it ([Fuller & Wheeler 1962](https://doi.org/10.1103/PhysRev.128.919)), and a traversable wormhole needs "exotic" matter with negative energy ([Morris & Thorne 1988](https://doi.org/10.1119/1.15620)). Quantum effects allow small negative energies, but "quantum inequalities" strictly limit them ([Ford & Roman 1995](https://arxiv.org/abs/gr-qc/9510071)), and even the quantum-assisted traversable wormholes found in theory take longer to cross than going around ([Maldacena et al. 2018](https://arxiv.org/abs/1807.04726)). Google's 2022 "wormhole" was a small quantum-computer simulation of a simplified model, not a hole in spacetime ([Jafferis et al. 2022](https://doi.org/10.1038/s41586-022-05424-3); [Kobrin et al. 2023](https://arxiv.org/abs/2302.07897); [Quanta 2023](https://www.quantamagazine.org/wormhole-experiment-called-into-question-20230323/)). The Alcubierre warp drive (1994) would move a bubble faster than light by contracting space ahead and expanding it behind ([Alcubierre 1994](https://arxiv.org/abs/gr-qc/0009013)), but it needs negative energy that early estimates put beyond the mass-energy of the visible universe ([Pfenning & Ford 1997](https://arxiv.org/abs/gr-qc/9702026)), and claimed "positive-energy" versions still violate the energy conditions or travel slower than light ([Santiago et al. 2022](https://arxiv.org/abs/2105.03079); [Fuchs et al. 2024](https://arxiv.org/abs/2405.02709); [Barzegar et al. 2026](https://arxiv.org/abs/2602.16495)). **Macroscopic traversable wormholes and warp drives are science fiction** ([Ford & Roman 1995](https://arxiv.org/abs/gr-qc/9510071); [Barzegar et al. 2026](https://arxiv.org/abs/2602.16495)), though their mathematics is a fine teaching tool ([Morris & Thorne 1988](https://doi.org/10.1119/1.15620)).

**Numerical relativity, strong fields and future tests.** Einstein's equations for merging black holes cannot be solved by hand; decades of crashing codes ([Centrella et al. 2010](https://arxiv.org/abs/1010.5260)) ended in 2005 with the first complete simulated mergers ([Pretorius 2005](https://arxiv.org/abs/gr-qc/0507014); [Campanelli et al. 2006](https://arxiv.org/abs/gr-qc/0511048)). The SXS collaboration's 2025 catalogue holds 3,756 simulated binaries ([SXS 2025](https://arxiv.org/abs/2505.13378)), GW250114 gave the most stringent single-event strong-field test of GR yet ([LVK 2025](https://arxiv.org/abs/2509.08099)), and tests on the 91 confident events of the latest catalogue still find GR consistent with the data ([LVK 2026](https://arxiv.org/abs/2603.19019)). Future tests rely on LISA, the Einstein Telescope, Cosmic Explorer and pulsar timing arrays ([ESA 2024](https://www.esa.int/Science_Exploration/Space_Science/Capturing_the_ripples_of_spacetime_LISA_gets_go-ahead); [ET](https://www.et-gw.eu/); [Cosmic Explorer](https://cosmicexplorer.org/); [NANOGrav 2023](https://arxiv.org/abs/2306.16213)), and on funding: the US budget request for fiscal 2026 proposed cutting LIGO by about 40% and running only one of its two sites ([Physics World 2025](https://physicsworld.com/a/us-astronomy-facing-extinction-level-event-following-trumps-2026-budget-request/); [AIP FYI 2025](https://www.aip.org/fyi/the-week-of-june-2-2025)), and the fiscal 2027 request repeats the cut while keeping both sites at reduced tempo ([NSF 2026](https://nsf-gov-resources.nsf.gov/files/FY-2027-NSF-Budget-Request-to-Congress.pdf)). Congress provided at least $49 million to run both sites in fiscal 2026 ([Congressional Record 2026](https://www.govinfo.gov/content/pkg/CREC-2026-01-08/pdf/CREC-2026-01-08-bk3.pdf); [CRS 2026](https://www.congress.gov/crs-product/R48783)), while fiscal 2027 was undecided as of October 2026, with a stopgap funding law running to 11 December ([CRA 2026](https://cra.org/govaffairs/blog/2026/09/fy2027-sept-update/)).

**A unified theory.** The Standard Model of particles and GR are each confirmed ([PDG 2026](https://pdg.lbl.gov/2026/reviews/rpp2026-rev-standard-model.pdf); [Will 2014](https://arxiv.org/abs/1403.7377)) but clash at the Planck scale ([Donoghue 1995](https://arxiv.org/abs/gr-qc/9512024)). String theory, long hailed as the leading unifying candidate ([Quanta 2025](https://www.quantamagazine.org/will-we-ever-prove-string-theory-20250529/)), includes the graviton ([Schwarz 2007](https://arxiv.org/abs/0708.1917)), has reproduced the entropy of certain black holes by counting their microscopic states ([Strominger & Vafa 1996](https://arxiv.org/abs/hep-th/9601029)), and produced the "holographic" link between gravity and quantum field theory ([Maldacena 1997](https://arxiv.org/abs/hep-th/9711200)). It has no experimental confirmation ([Quanta 2025](https://www.quantamagazine.org/will-we-ever-prove-string-theory-20250529/)), and a 2018 conjecture suggests it may struggle to accommodate our accelerating universe ([Obied et al. 2018](https://arxiv.org/abs/1806.08362)). No unified theory is accepted ([Afshordi et al. 2026](https://arxiv.org/abs/2605.11058)).

---

## 11. What studying general relativity actually looks like

### Undergraduate and graduate study

Where it is offered, undergraduate GR is a junior or senior elective lasting a quarter or a semester ([Hartle 2005](https://arxiv.org/abs/gr-qc/0506075); [Cornell PHYS 4445](https://classes.cornell.edu/browse/roster/FA25/class/PHYS/4445)); an informal survey of 32 Midwestern research universities, reported in 2005, found "only a handful" that offered one ([Hartle 2005](https://arxiv.org/abs/gr-qc/0506075)). Hartle's "physics-first" approach, which his undergraduate text *Gravity* follows, needs only intermediate mechanics as a physics prerequisite and no general theory of tensors, because "only one tensor — the metric — is ever used" ([Hartle 2005](https://arxiv.org/abs/gr-qc/0506075)). An illustrative US sequence, synthesized by this guide from published prerequisites ([Cornell PHYS 4445](https://classes.cornell.edu/browse/roster/FA25/class/PHYS/4445); [MIT OCW 8.962](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus/)):

| Year | Physics | Mathematics |
|---|---|---|
| 1 | Calculus-based mechanics, electricity and magnetism | Calculus I–II |
| 2 | Modern physics (includes special relativity) | Multivariable calculus, differential equations, linear algebra |
| 3 | Classical mechanics (Lagrangian), electromagnetism, quantum mechanics, thermal physics | Mathematical methods |
| 4 | GR elective, astrophysics or cosmology, senior research | Optional differential geometry, partial differential equations |

This guide estimates that much of an engineering curriculum would transfer, putting a GR course two to three years after switching. A US physics PhD then involves graduate courses, a qualifying exam and joining a research group, which at Stanford typically happens "during or near the end of the first year" ([Stanford Physics](https://physics.stanford.edu/graduate/graduate-resources/advising); [Stanford Physics](https://physics.stanford.edu/graduate/graduate-students-overview/graduate-resources-forms/qualifying-exam)), followed by research, for a median of about **six years** in total ([AIP 2021](https://www.aip.org/statistics/trends-in-physics-phds); [NSF NCSES 2025](https://ncses.nsf.gov/pubs/nsf25349/assets/data-tables/tables/nsf25349-tab008-011.pdf)). MIT's graduate GR course, for example, is taught from Carroll's *Spacetime and Geometry* ([MIT OCW 8.962](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus/)). The median age of 2024 US physics doctorate recipients was 29.6 ([NSF NCSES 2025](https://ncses.nsf.gov/pubs/nsf25349/assets/data-tables/tables/nsf25349-tab008-011.pdf)). On this guide's estimates, starting at 26 would make you about 35–36 at graduation; in 2024 about 7.5% of US physical-sciences doctorates went to people over 35 ([NSF NCSES 2025](https://ncses.nsf.gov/pubs/nsf25349/assets/data-tables/tables/nsf25349-tab003-007.pdf)), so you would be in a small minority, but not alone.

### What the work feels like

| Mode | A typical day | Tools |
|---|---|---|
| Theory, mathematical relativity | Long blocks of calculation and reading; stuck most days ([Verostek et al. 2023](https://arxiv.org/abs/2304.13684)) | Pen and paper; Mathematica with the free xAct packages ([xAct](https://het.physics.ntua.gr/konstant/GR/xAct.html)) |
| Numerical relativity | Developing and running large simulations of merging black holes and neutron stars ([Cornell SXS](https://physics.cornell.edu/nils-deppe)) | Parallel C++ codes on supercomputers, e.g. SpEC, SpECTRE, Einstein Toolkit ([SpECTRE](https://spectre-code.org/); [Löffler et al. 2012](https://arxiv.org/abs/1111.3344)) |
| Gravitational-wave data analysis | Statistical inference on detector data; "poring over plots and graphs"; constant contact with other sites ([LSU Reveille 2016](https://lsureveille.com/220429/news/lsu-students-alumni-involved-in-ligo-reflect-on-discovery/)) | Python: GWpy, PyCBC, Bilby ([GWpy](https://gwpy.readthedocs.io/en/latest/quickstart/); [PyCBC](https://pycbc.org/); [Ashton et al. 2019](https://arxiv.org/abs/1811.02042)) |
| Experiment | Installing, commissioning and debugging lasers, optics and controls; unpredictable hours ([LSU Reveille 2016](https://lsureveille.com/220429/news/lsu-students-alumni-involved-in-ligo-reflect-on-discovery/)) | Lasers and optics, electronics, vibration isolation, control systems ([LIGO Laboratory 2026](https://academicjobsonline.org/ajo/jobs/29381)) |
| Observation | Observing campaigns; reconstructing images from interferometer data, cross-checked by independent teams ([EHT Paper IV](https://arxiv.org/abs/1906.11241)) | Very-long-baseline radio interferometry, e.g. the Event Horizon Telescope ([EHT Paper II](https://arxiv.org/abs/1906.11239)) |

Eleven theoretical-physics faculty interviewed about their work (not all of them in GR) agreed that the foremost requirement is "blocks of uninterrupted time," and one admitted that "most days you are stuck and you're struggling with something" ([Verostek et al. 2023](https://arxiv.org/abs/2304.13684)). At LIGO's Louisiana site, graduate student Terra Hardwick told LSU's student newspaper that the first half of her days typically involved "running cables, measuring sensor placements or blasting music on loudspeakers" to measure how noise affected the detector ([LSU Reveille 2016](https://lsureveille.com/220429/news/lsu-students-alumni-involved-in-ligo-reflect-on-discovery/)). Across modes, **building a model** follows one cycle: simplify the problem until it is solvable (spherical symmetry, weak fields, slow motion), solve it with pencil or computer, compare with data or a fuller simulation, find where the approximation fails, and refine.

### Projects, PhD topics and careers

You can start early. LIGO's ten-week Summer Undergraduate Research Fellowship (SURF) offers lab, data-analysis and source-modelling projects, with travel, housing and a stipend of $8,110 in 2026 ([LIGO SURF](https://ligosurf.caltech.edu/program-overview); [LIGO SURF](https://ligosurf.caltech.edu/information-for-fellows)). For summer 2027 (15 June–20 August), applications open in November 2026 and close in January 2027, and US applicants must be citizens, nationals or permanent residents ([LIGO SURF](https://ligosurf.caltech.edu/apply)). SURF is funded in part by NSF's Research Experiences for Undergraduates (REU) program ([LIGO SURF](https://ligosurf.caltech.edu/program-overview)), whose participants must meet the same citizenship rule ([NSF](https://www.nsf.gov/funding/opportunities/reu-research-experiences-undergraduates)); other universities run REU sites in the field, such as RIT's in multimessenger astrophysics ([RIT](https://www.rit.edu/ccrg/research-experience-undergraduates-multimessenger-astrophysics)). On your own, you can help sort LIGO's noise "glitches" and trace their causes in Gravity Spy ([Gravity Spy](https://www.zooniverse.org/projects/zooniverse/gravity-spy)), find the GW150914 signal in public LIGO data with the free GWOSC tutorials or the GWpy quickstart ([GWOSC](https://gwosc.org/tutorials/); [GWpy](https://gwpy.readthedocs.io/en/latest/quickstart/)), write a Python program that traces orbits and light rays around a black hole, as a team of Berkeley undergraduates did ([Berkeley ULAB](https://ulab.studentorg.berkeley.edu/static/doc/posters/s234.pdf)), or fit cosmological parameters to the public Pantheon+ supernova data ([Brout et al. 2022](https://arxiv.org/abs/2202.04077)). Recent PhD theses include *Robustly Measuring the Spins of Binary Black Holes with Gravitational Waves* (2026) and *Controlling and Calibrating Interferometric Gravitational Wave Detectors* (2021) ([CaltechTHESIS](https://thesis.caltech.edu/view/group/LIGO.html)), alongside mathematical work such as Siyuan Ma's prize-winning thesis on the stability of slowly rotating black holes ([AEI](https://www.aei.mpg.de/234242/otto-hahn-medal-for-siyuan-ma)).

Permanent academic jobs are a minority outcome. One year after the degree, 50% of US physics PhDs from the academic years 2020–21 and 2021–22 (those educated and still living in the US) held postdocs and 43% held potentially permanent jobs; of those permanent jobs only 15% were academic, 73% were in the private sector and 63% were outside physics, led by data science, engineering and software ([AIP 2024](https://www.aip.org/statistics/physics-phds-initial-employment-booklet-academic-years-2020-21-and-2021-22)). Your engineering background is an asset: Dennis Coyne, the LIGO Laboratory's long-time chief engineer, holds bachelor's and master's degrees in mechanical engineering ([IEEE CSS](https://ieeecss.org/contact/dennis-coyne)), and a 2026 LIGO Laboratory postdoc posting lists expertise in "electronics, laser and quantum optics, vibration isolation and control systems" as desirable ([LIGO Laboratory 2026](https://academicjobsonline.org/ajo/jobs/29381)).

---

## 12. Putting it all together

### 12.1 Glossary

| Term | Definition |
|---|---|
| Accretion disk | Gas spiralling into a compact object, heated until it glows; powers quasars |
| Big Bang model | The established theory that the universe evolved from a hot, dense, nearly uniform early state |
| Black hole | A region of spacetime from which nothing, not even light, can escape |
| Chirp | The rising frequency and loudness of gravitational waves from a binary nearing merger |
| Christoffel symbols (Γ) | Terms built from derivatives of the metric in the geodesic equation; removable at one point by free fall |
| Cosmic censorship | The unproven conjecture that realistic singularities are always hidden inside horizons |
| Cosmic microwave background (CMB) | The 2.725 K afterglow of the hot early universe |
| Cosmological constant (Λ) | A constant in Einstein's equations acting like energy of empty space with negative pressure |
| Cosmological principle | On the largest scales, the universe is the same everywhere and in every direction |
| Curvature (intrinsic) | Departure from flat geometry measurable from inside a space |
| Dark energy | Whatever drives the accelerating expansion; about 69% of the universe's energy |
| Dark matter | Unseen matter detected only by its gravity; about 26% of the universe's energy |
| Einstein field equations | G_μν + Λg_μν = (8πG/c⁴)T_μν: curvature on the left, energy and momentum on the right |
| Equivalence principle | Locally, gravity is indistinguishable from acceleration; free fall obeys special relativity |
| Ergosphere | The region outside a spinning black hole's horizon where nothing can stay at rest relative to the distant stars; everything is dragged around with the hole |
| Event | A single point in spacetime: a place at an instant |
| Event horizon | The one-way boundary of a black hole |
| Frame dragging | The dragging of local inertial frames (for example, gyroscope axes) around a rotating mass |
| Friedmann equations | GR's equations for how the universe's expansion depends on its contents and curvature |
| Geodesic | The straightest possible path in curved space or spacetime |
| Gravitational lensing | Bending of light by mass, producing multiple images, arcs, rings or distortions |
| Gravitational time dilation | Lower clocks in a gravitational field tick slower; light climbing out is redshifted |
| Gravitational wave | A ripple in spacetime curvature travelling at the speed of light |
| Hawking radiation | The predicted faint quantum glow of black holes; never observed from a real one |
| Hubble–Lemaître law | v = H₀d: galaxies recede at speeds proportional to distance |
| Inertial frame | A frame where free objects move straight at constant speed; in GR, only local |
| Invariant | A quantity all observers agree on, such as c or the spacetime interval |
| ISCO | Innermost stable circular orbit; 3 r_s around a non-spinning black hole |
| Kerr solution | Roy Kerr's 1963 exact solution for a rotating black hole |
| Length contraction | Moving objects are measured shorter along their motion by the factor γ |
| Light cone | The light paths through an event, dividing spacetime into future, past and "elsewhere" |
| Lorentz factor (γ) | γ = 1/√(1 − v²/c²), the factor governing time dilation and length contraction |
| Lorentz transformation | Equations converting one inertial observer's event coordinates into another's |
| Metric tensor (g_μν) | The table of coefficients that turns coordinate differences into real distances and times |
| Neutron star | The ultra-dense collapsed core of a massive star, supported mainly by neutron degeneracy pressure and nuclear forces |
| No-hair theorem | A settled black hole is fully described by its mass, spin and charge |
| Numerical relativity | Solving Einstein's equations on computers, e.g. for merging black holes |
| Planck length | About 1.6×10⁻³⁵ m, where quantum gravity should matter |
| Proper time (τ) | The time recorded by a clock carried along a worldline |
| Quantum gravity | The sought-after theory uniting GR with quantum mechanics |
| Redshift, cosmological (z) | Stretching of light by expansion: 1 + z = a(now)/a(then) |
| Reference frame | Rulers plus synchronized clocks used to assign coordinates to events |
| Relativity of simultaneity | Separated events simultaneous for one observer need not be for another |
| Ricci tensor and scalar | Traces ("averages") of the Riemann tensor; the tensor gives the volume change of a small falling ball of particles |
| Riemann curvature tensor | The complete curvature at a point (20 numbers in 4D); measures tides |
| Scale factor a(t) | The number multiplying all cosmic distances; a = 1 today |
| Schwarzschild radius (r_s) | 2GM/c², the horizon radius of a non-spinning black hole; 2.95 km for the Sun |
| Schwarzschild solution | The 1916 exact solution outside a spherical, non-rotating mass |
| Singularity | Where paths through spacetime end, usually with curvature growing without limit, so GR stops making predictions |
| Spacetime | The four-dimensional union of space and time |
| Spacetime interval (Δs²) | The observer-independent separation of two events: −(cΔt)² + Δx² + Δy² + Δz² |
| Strain (h) | The fractional length change a gravitational wave causes; about 10⁻²¹ at Earth |
| Stress-energy tensor (T_μν) | The table of energy, momentum, pressure and stress that sources curvature |
| Tensor | A geometric object whose components change predictably between coordinate systems |
| Tidal force | The difference in gravity across an object; the physical signature of curvature |
| Time dilation | Moving clocks run slow by γ relative to the observers they pass |
| Wormhole | A hypothetical spacetime shortcut allowed by GR; no evidence exists |
| Worldline | An object's path through spacetime: its whole history |

### 12.2 The ten most important ideas

| # | Idea | In one sentence |
|---|---|---|
| 1 | Gravity is geometry | Matter and energy curve spacetime, and force-free bodies follow the straightest available paths. |
| 2 | Free fall is natural | A falling body is inertial; standing on the ground, you are the one being accelerated. |
| 3 | Time is personal | Each clock measures its own proper time, which depends on its motion and its height in a gravitational field. |
| 4 | Measurements differ, reality doesn't | Observers disagree about durations and lengths but agree on c, intervals, proper times and the laws of physics. |
| 5 | Light cones enforce causality | Nothing outruns light locally, which fixes what can affect what. |
| 6 | Curvature is tides | Uniform gravity vanishes in free fall; the leftover stretching and squeezing is curvature. |
| 7 | Everything gravitates | Energy, momentum, pressure and stress all curve spacetime, and negative pressure makes gravity repel. |
| 8 | Newton lives inside GR | For weak fields and slow motion GR becomes Newton, and everyday gravity is mostly time running at different rates. |
| 9 | Spacetime is dynamic | It ripples, traps and expands, and gravitational waves, black holes and cosmic expansion are all observed. |
| 10 | Superbly tested, visibly incomplete | No test has found a confirmed deviation from GR, yet it predicts its own breakdown at singularities and has no quantum version. |

### 12.3 Ten questions to ask a professor who researches GR

Before asking, do your homework: read the professor's group page and one or two of their recent papers, even if you cannot follow all of it, and make any first email personal and specific rather than a form letter ([Penn State](https://science.psu.edu/current-students/undergraduate-research/contacting-faculty/dos-donts); [Ohio State Physics](https://physics.osu.edu/sites/default/files/2024-03/Undergraduate_Research_Guide.pdf)).

| # | Question | What the answer tells you |
|---|---|---|
| 1 | What central open question is your group working on, and what would count as real progress in five years? | The field seen from inside |
| 2 | In your recent paper on [topic], what was the hardest step: a calculation, a numerical problem or a data issue? | What daily work in the subfield is like |
| 3 | Which upcoming result are you watching most (the next LIGO–Virgo–KAGRA run ([LVK](https://observing.docs.ligo.org/plan/)), LISA, pulsar timing, black-hole imaging), and what would surprise you? | Where they expect discoveries |
| 4 | In GW250114, ringdown tests matched the Kerr prediction only to tens of percent ([LVK 2025](https://arxiv.org/abs/2509.08099)). What precision would make a deviation from GR believable to you? | How the field weighs evidence |
| 5 | Have the 2019–20 island calculations ([Almheiri et al. 2021](https://arxiv.org/abs/2006.06872)) effectively solved the information paradox, or does a realistic black hole still pose a genuine puzzle? | Their view of a major debate |
| 6 | Are the Hubble tension ([Brout et al. 2022](https://arxiv.org/abs/2202.04077)) and the evolving-dark-energy hints ([DESI 2025](https://arxiv.org/abs/2503.14738)) more likely errors or signs that gravity needs modifying on cosmic scales? | How they reason about anomalies |
| 7 | What does a typical week look like for your graduate students: derivations, coding, data analysis or lab work? | Whether you would enjoy the job |
| 8 | Which tools does your group rely on, and what should I learn first? | A concrete preparation plan |
| 9 | What could an undergraduate realistically contribute, perhaps by reproducing a figure from one of your papers? | A way into research |
| 10 | Would my engineering background in controls, electronics or signal processing help in your area, and where have your recent students gone? | Fit, and honest career outcomes |

**Making contact.** Practical steps from university undergraduate-research guides:

| Step | What to do |
|---|---|
| First email | Write a separate email to each professor: your major and year, relevant courses and skills (programming, data analysis, electronics), and why *their* research interests you. Ask to meet and talk about their work rather than asking for a lab position outright, and list a few times you are free. Be specific, not long ([Penn State](https://science.psu.edu/current-students/undergraduate-research/contacting-faculty/writing-your-email); [Ohio State Physics](https://physics.osu.edu/sites/default/files/2024-03/Undergraduate_Research_Guide.pdf)) |
| The meeting | Have an up-to-date résumé ready. Faculty know what undergraduates do and do not yet know, and report that enthusiasm for the project is the main thing they look for ([Ohio State Physics](https://physics.osu.edu/sites/default/files/2024-03/Undergraduate_Research_Guide.pdf)) |
| No reply | Follow up after three to five days, or try someone else; a professor may simply have no suitable project at the moment ([Penn State](https://science.psu.edu/current-students/undergraduate-research/contacting-faculty/dos-donts); [UC Irvine Physics](https://www.physics.uci.edu/node/13099)) |
| No opening | Ask whom else you should contact, and look at summer REUs ([Penn State](https://science.psu.edu/current-students/undergraduate-research/contacting-faculty/dos-donts); [Ohio State Physics](https://physics.osu.edu/sites/default/files/2024-03/Undergraduate_Research_Guide.pdf)) |

### 12.4 Five fascinating unanswered questions

| Question | Why it is hard | Where answers may come from |
|---|---|---|
| What is the quantum theory of gravity, and what replaces singularities? | The natural scale is the Planck length, 1.6×10⁻³⁵ m ([NIST](https://physics.nist.gov/cgi-bin/cuu/Value?plkl)); direct laboratory tests have only recently been proposed ([Bose et al. 2017](https://arxiv.org/abs/1707.06050)), and a 2025 survey of physicists found no dominant candidate theory ([Afshordi et al. 2026](https://arxiv.org/abs/2605.11058)) | Proposed tabletop tests of gravity-induced entanglement ([Bose et al. 2017](https://arxiv.org/abs/1707.06050)), black-hole physics, early-universe signals |
| Does information escape black holes, and how is it encoded? | The 2019–20 island calculations give the entropy of the radiation but not its exact quantum state, and are best understood in simplified settings such as anti-de Sitter space ([Almheiri et al. 2021](https://arxiv.org/abs/2006.06872)) | Holography and quantum information theory |
| What is dark energy, and is it changing? | Vacuum-energy estimates exceed the measured value by about 55 to 120 orders of magnitude, depending on the method ([Martin 2012](https://arxiv.org/abs/1205.3365)); the 2025–26 hints of change sit at about 2–4σ ([DESI 2025](https://arxiv.org/abs/2503.14738); [DES 2026](https://arxiv.org/abs/2605.27221)) | DESI's full survey, mapping through 2028 ([DESI 2026](https://www.desi.lbl.gov/2026/04/15/desi-reaches-mapping-milestone-surpassing-expectations/)); Euclid's galaxy-clustering and weak-lensing data, due mid-2027 ([ESA Euclid](https://www.cosmos.esa.int/web/euclid/dr1-timeline)) |
| What is dark matter? | Its presence is inferred from its gravity, and what most of it is made of is still unknown ([PDG 2025](https://pdg.lbl.gov/2025/reviews/rpp2025-rev-dark-matter.pdf)) | Particle experiments, lensing maps, galaxy dynamics |
| Are singularities always hidden, and is GR exact in the strongest fields? | Cosmic censorship is still a conjecture ([Landsman 2021](https://arxiv.org/abs/2101.02687)); ringdown tests of the Kerr description reach only tens of percent ([LVK 2025](https://arxiv.org/abs/2509.08099)) | Mathematical proofs; the planned Einstein Telescope and Cosmic Explorer ([Physics World 2025](https://physicsworld.com/a/physicists-set-to-decide-location-for-next-generation-einstein-telescope/)) and LISA ([ESA](https://www.esa.int/Science_Exploration/Space_Science/LISA/Capturing_the_ripples_of_spacetime_LISA_gets_go-ahead)) |

### 12.5 A learning pathway from Calculus II to graduate GR

Times are estimates for a full-time student, or for 5–10 hours a week of self-study alongside courses.

| Phase | When | Coursework | Self-study and projects | Milestone |
|---|---|---|---|---|
| 0 | Now | Calculus II: Taylor series, arc length, polar coordinates | Taylor & Wheeler, *Spacetime Physics*, chapters 1–3; Einstein Online | Derive time dilation; use the interval |
| 1 | Next 2–3 semesters | Multivariable calculus, linear algebra, differential equations, modern physics | Finish *Spacetime Physics*; *Exploring Black Holes* or *Gravity from the Ground Up*; learn Python; GWOSC tutorial; a geodesic integrator | Compute Schwarzschild orbits; find GW150914 in public data |
| 2 | Years 2–3 of a physics major | Lagrangian mechanics, electromagnetism, quantum mechanics, mathematical methods | Hartle's *Gravity*, ideally with a GR elective; MIT OCW 8.286, an undergraduate cosmology course ([MIT OCW 8.286](https://ocw.mit.edu/courses/8-286-the-early-universe-fall-2013/pages/syllabus/)); apply to REUs and LIGO SURF | Undergraduate GR completed |
| 3 | Senior year | Optional differential geometry, partial differential equations | Carroll's free lecture notes ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)); MIT OCW 8.962 videos ([MIT OCW 8.962](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus/)); a senior thesis | Graduate applications |
| 4 | Graduate school, a median of about 6 years ([AIP 2021](https://www.aip.org/statistics/trends-in-physics-phds)) | Core courses, qualifying exam, graduate GR (e.g. Carroll, then Wald or Misner–Thorne–Wheeler; [MIT OCW 8.962](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus/); [University of Chicago Press](https://press.uchicago.edu/ucp/books/book/chicago/G/bo5952261.html); [Princeton University Press](https://press.princeton.edu/books/hardcover/9780691177793/gravitation)) | Choose a subfield and advisor by year one or two ([Stanford Physics](https://physics.stanford.edu/graduate/graduate-resources/advising)) | PhD research |

On these estimates you would reach a solid undergraduate GR course in about 2.5–3 years and a bachelor's degree in about 3.5–4, followed by a PhD with a median length of about six years ([AIP 2021](https://www.aip.org/statistics/trends-in-physics-phds)). Hartle notes that many students need considerable practice before they can manipulate tensor expressions, and argues that a "physics-first" course, which needs only intermediate mechanics, is "a surer and more direct route" when time is limited ([Hartle 2005](https://arxiv.org/abs/gr-qc/0506075)); the books in phases 0–2 let you start long before the tensor-heavy graduate texts.

### 12.6 Five recommended resources

| Resource | Level | Why it fits you | Access |
|---|---|---|---|
| Taylor & Wheeler, *Spacetime Physics* (2nd ed., 1992) | Introductory, mostly algebra; first developed with first-year students | Makes special relativity intuitive before GR | Free PDF under a Creative Commons (CC BY 4.0) licence since 2019 ([Internet Archive](https://archive.org/details/spacetime_physics)) |
| Taylor, Wheeler & Bertschinger, *Exploring Black Holes* (2nd ed.) | Calculus, no tensors | Real GR calculations using only calculus and the metric | Free online ([ComPADRE](https://www.compadre.org/Relativity/items/detail.cfm?ID=8551); [Internet Archive](https://archive.org/details/exploringblackholes)) |
| Schutz, *Gravity from the Ground Up* (2003) | High-school mathematics | A broad tour of stars, black holes, waves and cosmology | Book, with optional computer programs ([Cambridge](https://www.cambridge.org/core/books/gravity-from-the-ground-up/CF740CFC905E33C1453B48E06D98D9B2)) |
| Einstein Online, Max Planck Institute for Gravitational Physics | General audience | A step-by-step introduction, stand-alone topic articles and a glossary of about 500 terms | Free website ([Einstein Online](https://www.einstein-online.info/en/?p=4504)) |
| Hartle, *Gravity: An Introduction to Einstein's General Relativity* | Upper undergraduate | The pioneering physics-first course text | Book, Cambridge reissue 2021 ([Cambridge](https://www.cambridge.org/highereducation/books/gravity/F9085ABB699F7A3A05ADD0B3930D98E0); [Hartle 2005](https://arxiv.org/abs/gr-qc/0506075)) |

For motivation, Kip Thorne's popular account *Black Holes and Time Warps* (1994) is still in print ([W. W. Norton](https://wwnorton.com/books/9780393312768); [ComPADRE](https://www.compadre.org/Relativity/items/detail.cfm?ID=8533)), though it predates LIGO's first detection in 2015 ([Abbott et al. 2016](https://arxiv.org/abs/1602.03837)). For graduate level, Carroll's free lecture notes for beginning graduate students ([Carroll 1997](https://arxiv.org/abs/gr-qc/9712019)) and the MIT 8.962 lectures ([MIT OCW 8.962](https://ocw.mit.edu/courses/8-962-general-relativity-spring-2020/pages/syllabus/)) are the natural next step.

---

## Conclusion

The most useful thing to carry into a professor's office is that "general relativity" is not one job but a shared subject behind five very different working lives, from proving theorems about black-hole stability to commissioning lasers and control systems at a detector site. Whether you would enjoy it depends less on loving black holes than on which of those workdays you would choose. The cheap experiments in Chapter 11, such as an hour of Gravity Spy, the GWOSC tutorial, a Schwarzschild orbit integrator or one theory paper read line by line, let you sample each mode before committing. Your engineering training counts in the experimental and computational modes ([LIGO Laboratory 2026](https://academicjobsonline.org/ajo/jobs/29381)), and in this guide's judgement the main costs of switching are time and money rather than age.

Timing favours you too. On this guide's estimates, a student who switches now would reach graduate research between about 2030 and 2035, just as a new generation of data arrives: the fifth LIGO–Virgo–KAGRA run, sketched for about 2029–2031 with its timeline still under discussion ([LVK](https://observing.docs.ligo.org/plan/)); LISA, planned for launch in 2035 ([ESA](https://www.esa.int/Science_Exploration/Space_Science/LISA/Capturing_the_ripples_of_spacetime_LISA_gets_go-ahead)); the Einstein Telescope, whose site is due to be chosen in 2027 and which is unlikely to be ready before 2035, and the proposed US Cosmic Explorer ([Physics World 2025](https://physicsworld.com/a/physicists-set-to-decide-location-for-next-generation-einstein-telescope/)); and the full DESI and Euclid surveys, with DESI mapping through 2028 and Euclid on a nominal six-year mission that began routine observations in 2024 ([DESI 2026](https://www.desi.lbl.gov/2026/04/15/desi-reaches-mapping-milestone-surpassing-expectations/); [ESA](https://www.esa.int/Science_Exploration/Space_Science/Euclid_overview)). The questions this guide marks open in October 2026 (whether dark energy evolves ([DES 2026](https://arxiv.org/abs/2605.27221)), whether black-hole ringdowns match Kerr beyond today's tens-of-percent precision ([LVK 2025](https://arxiv.org/abs/2509.08099)), whether gravity can entangle two masses ([Bose et al. 2017](https://arxiv.org/abs/1707.06050))) are the ones your generation is best placed to settle. General relativity has been around since 1915 ([W. W. Norton](https://wwnorton.com/books/9780393312768)), and its most decisive tests are still ahead.
