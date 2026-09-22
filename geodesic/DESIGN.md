# GEODESIC — design and physics assumptions

A sandbox for gravitational dynamics and spacetime curvature. This document
is the honest account of what it computes, what it draws, and where each
stops corresponding to general relativity.

---

## 1. Physics model and assumptions

### 1.1 The layered model

No single model serves the whole simulator. GEODESIC uses three, each chosen
because it is *exact or near-exact in the regime it is asked about*, and the
UI names which one is speaking at any moment.

| Layer | Model | Used for | Regime of validity |
|---|---|---|---|
| **A. Orbits** | Newtonian N-body, optional 1PN | trajectories of massive bodies | v ≪ c, weak field |
| **B. Curvature field** | Tidal tensor E_ij from the Newtonian potential; exact Schwarzschild near a single compact body | the 3D field visualization | linear superposition valid while Φ/c² ≪ 1 |
| **C. Test particles** | Exact Schwarzschild / Kerr geodesics | probe trajectories near one compact body | exact, for a test mass around an isolated body |

This layering is the central design decision and deserves defending.

Full numerical relativity — evolving the Einstein field equations on a 3+1
grid — is what LIGO-era binary-merger simulations do. It costs millions of
CPU-hours per merger, needs adaptive mesh refinement, constraint damping and
excision or moving punctures, and solves the Hamiltonian and momentum
constraints at every step. It is categorically not a browser workload, and
attempting a toy version would produce constraint violations that look like
physics but are not. It is excluded deliberately, not for convenience.

What matters is that excluding it costs almost nothing *for the questions
this simulator asks*. For a solar system, Newtonian gravity is accurate to
around one part in 10⁸; the entire relativistic correction to Mercury's orbit
is 43 arcseconds per century. A model that gets orbits Newtonian-right and
then *derives the curvature fields from that same potential* is internally
consistent and honest, so long as it never claims the curvature picture is
driving the motion.

### 1.2 Layer A — orbital dynamics

Newtonian N-body, computed pairwise:

```
a_i = Σ_{j≠i}  G m_j (r_j − r_i) / |r_j − r_i|³
```

Optional **1PN correction**, applied as a Schwarzschild-like term relative to
the dominant mass:

```
a_rel = (GM / c²r³) · [ (4GM/r − v²) · r  +  4 (r·v) · v ]
```

This reproduces the relativistic perihelion advance

```
Δϖ = 6πGM / (c² a (1 − e²))   per orbit
```

which for Mercury gives **42.99 arcsec/century** against the measured
GR contribution of 42.98 — verified in the test suite, not asserted.

Full Einstein–Infeld–Hoffmann N-body 1PN (with all pairwise cross terms) is
implemented for the dominant-mass case only. For mutually comparable masses
the simulator says so rather than silently applying a term outside its
validity.

### 1.3 Layer B — the curvature field

The **tidal field** is the electric part of the Weyl tensor,

```
E_ij = C_i0j0 ,   Newtonian limit:  E_ij = ∂_i ∂_j Φ
```

For a point mass, Φ = −GM/r gives

```
E_ij = (GM / r³) (δ_ij − 3 n_i n_j) ,      n = r̂
```

with eigenvalues

```
radial:      E_rr = −2GM/r³      (negative ⇒ stretch)
transverse:  E_θθ = E_φφ = +GM/r³ (positive ⇒ squeeze)
```

traceless, as vacuum requires. Three facts make this the right thing to draw:

1. **It is curvature.** The leading term of the Riemann tensor in the
   Newtonian limit *is* the tidal tensor. Tides are not a consequence of
   curvature; at leading order they are curvature.
2. **It cannot be transformed away.** Gravitational "force" is coordinate
   dependent — the equivalence principle says a freely falling observer sees
   none. Tidal deformation survives in every frame. Drawing E_ij draws the
   part that is really there.
3. **It superposes linearly** in the weak field, because Φ does. So a
   multi-body system has a well-defined total tidal field, which is exactly
   what a sandbox needs.

Its physical meaning is direct: two freely falling particles separated by
ξ have relative acceleration

```
Δa^j = −E^j_k ξ^k
```

so a body of height ℓ aligned with a tendex line of tendicity E_pp feels
Δa = −E_pp ℓ head-to-foot. That is a number the UI can show.

**Frame dragging** is the magnetic part of the Weyl tensor. For a spinning
body of angular momentum S the frame-dragging angular velocity is

```
Ω_fd = (G / c²r³) [ 3(S·n)n − S ]        (Lense–Thirring)
B_ij = ∇_(j Ω_i)
```

Unlike E_ij this carries an explicit c², i.e. it is genuinely a relativistic
effect with no Newtonian counterpart — worth stating in the UI, since the
tidal field has no c² at all.

**Gravitational time dilation**, weak field and exact:

```
weak:   dτ/dt = √(1 + 2Φ/c²) ≈ 1 + Φ/c²
exact:  dτ/dt = √(1 − r_s/r)              (Schwarzschild, static observer)
```

### 1.4 Layer C — geodesics

For a test particle around one compact body, the Schwarzschild radial
equation is integrated exactly via the effective potential:

```
(dr/dτ)² = E² − (1 − r_s/r)(1 + L²/(c²r²))
```

giving, without approximation, the photon sphere at **1.5 r_s**, the ISCO at
**3 r_s**, capture below the critical impact parameter, and precessing
non-closing orbits. Kerr adds the spin term for frame-dragged orbits.

### 1.5 Units

Internal units are **AU, solar masses, years**, giving

```
G = 4π² ≈ 39.478 AU³ M☉⁻¹ yr⁻²
c = 63 241 AU/yr
r_s(Sun) = 1.97×10⁻⁸ AU = 2.95 km
```

chosen so solar-system quantities are order unity and float64 keeps ~15
significant digits across the whole range from a black hole horizon to a
wide binary.

---

## 2. What a 3D spacetime grid can and cannot truthfully represent

This is the part most simulators get wrong, so it is stated plainly.

### 2.1 What the rubber sheet gets wrong

The bowling-ball-on-a-trampoline picture is wrong in four independent ways:

1. **It explains gravity using gravity.** The marble rolls toward the dip
   because the real Earth pulls it down. The analogy presupposes what it
   claims to explain.
2. **It is a 2D slice pretending to be space.** The sheet is two-dimensional
   and bends into a third. Space is three-dimensional; spacetime is four.
   Nothing bends "into" anything — curvature is intrinsic, measurable from
   inside, and needs no higher dimension to exist in.
3. **It shows the wrong component.** This is the deep error. In the weak
   field the geodesic equation gives

   ```
   d²x^i/dt² ≈ −Γ^i_00 c² = −∂_i Φ
   ```

   The acceleration comes from **Γ^i_00, which derives from g_00** — the
   *time* part of the metric. For slow-moving bodies the spatial curvature
   contributes at order (v/c)² and is negligible. **Orbits are caused almost
   entirely by the curvature of time, not of space.** A grid depicting dented
   *space* is depicting the component that barely matters.

   The cleanest evidence: light deflection by the Sun. A Newtonian
   calculation — effectively time-curvature only — gives 0.87 arcsec. GR
   gives 1.75. The missing half is exactly the spatial curvature, which
   matters for light because light moves at c, and not for planets because
   they don't.

4. **It implies a substance.** Nothing flows, nothing is sucked in, nothing
   is made of anything. There is no aether. The grid is a coordinate
   scaffold drawn for the viewer's benefit.

### 2.2 What GEODESIC draws instead

| Mode | What it shows | Truthfulness |
|---|---|---|
| **Tidal tendexes** | integral curves of the eigenvector fields of E_ij | **Real and gauge-robust.** This is curvature itself, in 3D, multi-body. |
| **Free-fall lattice** | a cube of test particles, integrated and drawn | **Real and measurable.** The nodes are objects, not coordinates, so the deformation is an observation. Volume conserved in vacuum, shrinking at −4πG⟨ρ⟩ where mass is enclosed. |
| **Time dilation** | iso-surfaces of dτ/dt | **Real.** And it is the component that actually causes orbits. |
| **Geodesics** | exact Schwarzschild orbit against the Newtonian one | **Exact** for a test particle about a static spherical mass. |
| **Gravitational waves** | quadrupole radiation *pattern*; amplitude as a number | Pattern is real and static; the wave itself is deliberately not drawn. |
| **Frame drag** | Ω_fd around spinning mass | **Real**, first-order in spin, weak field. |
| **Newtonian field/potential** | g and equipotential surfaces of Φ | Real Newtonian quantities, labelled as such — *not* curvature. |
| **Embedding diagram** | Flamm's paraboloid, z(r) = 2√(r_s(r−r_s)) | **Exactly true** as the geometry of one equatorial spatial slice — and explicitly *not* an explanation of orbits. |

The embedding-diagram mode exists precisely so the familiar picture can be
shown *and then dismantled*: it is mathematically exact, and it still does
not explain why planets orbit. Showing both, side by side, is more honest
than refusing to draw the famous image.

### 2.3 The honest headline view

Two real, 3D, multi-body quantities carry the argument, in two modes:

- **Tidal curvature** — tendex lines, the integral curves of the eigenvector
  fields of E_ij. What curvature actually is.
- **Time dilation** — iso-surfaces of dτ/dt. Why things fall.

Neither requires an embedding dimension, both superpose over many bodies,
and both are computed from the same potential that moves the bodies.

**As built**, the tendex mode traces genuine integral curves rather than
drawing a lattice of principal-axis crosses. Two consequences follow, and both
are stated in the mode's explainer:

- *Length carries nothing.* An integral curve has no natural length. Magnitude
  is carried by brightness, log-scaled over five decades and anchored to
  2GM/R³ at the surface of the strongest body — a physical anchor, so
  brightness means the same thing frame to frame and the r⁻³ falloff is
  legible rather than chased by an auto-exposure.
- *The squeeze direction is degenerate.* For a spherical source the two
  squeezing eigenvalues are exactly equal, so every direction perpendicular to
  the radius is an eigenvector. The tracer continues in the direction closest
  to the one it arrived in: one valid integral curve out of infinitely many.
  The degeneracy is the physics, and the drawing does not pretend to pick a
  winner.

---

## 3. Simulation architecture

```
geodesic/
  index.html            markup, CSS, importmap
  src/
    config.js           units, constants, presets of material density
    physics/            NO DOM, NO three.js — headless testable
      constants.js      G, c, unit conversions, derived quantities
      body.js           body model: mass/radius/density/spin, derived r_s, compactness
      nbody.js          pairwise forces, 1PN term, energy/momentum diagnostics
      integrators.js    velocity Verlet, Yoshida-4, adaptive RK-Fehlberg fallback
      relativity.js     E_ij, B_ij, Omega_fd, time dilation, Schwarzschild scalars
      geodesic.js       exact Schwarzschild/Kerr test-particle integration
      collisions.js     merge, Roche limit, Buchdahl bound, horizon formation
      presets.js        Earth, Earth-Moon, Solar System, binaries, NS, BH
      engine.js         the only object the renderer sees
    render/             three.js
      renderer.js scene.js bodies.js trails.js
      field.js          the lattice: tendex / time-dilation / potential modes
      vectors.js        velocity, acceleration, field arrows
      embedding.js      Flamm paraboloid
      probes.js         geodesic test particles
    ui/                 inspector, timeline, mode switcher, explainers, readouts
    camera/             orbit + follow rigs, inertial vs body-centred frames
  test/physics.test.mjs headless validation
```

The **seam** is `engine.snapshot()` — a plain object. `physics/` imports
nothing from three.js and touches no DOM, so the whole model runs in Node.
That is enforced by the test suite existing at all.

---

## 4. Numerical methods

### 4.1 Integrator choice

| Method | Order | Symplectic | Verdict |
|---|---|---|---|
| Euler | 1 | no | Energy grows without bound. Never. |
| RK4 | 4 | no | Accurate per step, but energy drifts secularly — orbits spiral over long runs. Wrong tool for bound orbits. |
| **Velocity Verlet** | 2 | **yes** | Energy error is *bounded and oscillatory*, not cumulative. Time-reversible, cheap, one force evaluation per step. Selectable. |
| **Yoshida-4** | 4 | **yes** | **Default, as built.** Three Verlet sub-steps with the standard w₀,w₁ coefficients. |
| Wisdom–Holman | 2+ | yes | Excellent *if* one mass dominates — it splits Kepler motion from perturbations. Rejected as the default because a sandbox lets users build equal-mass binaries, which violate its premise. |
| IAS15 / Gauss-Radau | 15 | no (adaptive) | Machine precision, handles close encounters. Reserved as a fallback during encounters. |

**Measured, at the timestep the simulator actually picks** (20,000 steps, relative
energy error):

| | Earth–Moon | Solar System | Sgr A* / S2 (e = 0.885) | figure-eight |
|---|---|---|---|---|
| Velocity Verlet | 1.8e−5 | 9.6e−8 | 7.7e−4 | 8.1e−5 |
| **Yoshida-4** | **8.4e−9** | **2.9e−11** | **6.0e−8** | **5.6e−8** |
| RK4 | 2.2e−8 | 2.7e−11 | 2.7e−8 | 5.9e−7 |

Verlet's error is dominated by the eccentric cases, where a fixed step that is
1/320 of the *mean* dynamical time is far coarser than that near perihelion —
(1−e)^1.5 is 0.04 for S2. Yoshida-4 costs three force evaluations instead of
one and buys three to four orders of magnitude, which at these body counts is
free, so it is the default. RK4 matches it over 20,000 steps and then loses,
because its error is secular rather than bounded; it is kept in the selector
so that can be watched happening.

The governing insight is that for long-term orbital work, **symplecticity
beats order**. A 2nd-order symplectic integrator holds a planet in its orbit
for a million years; a 4th-order non-symplectic one lets it spiral away.

Velocity Verlet:

```
v(t + h/2) = v(t) + (h/2) a(t)
r(t + h)   = r(t) + h v(t + h/2)
a(t + h)   = A(r(t + h))
v(t + h)   = v(t + h/2) + (h/2) a(t + h)
```

### 4.2 Timestep

Symplectic integrators require a **fixed** step — varying it breaks the
property that gives bounded energy error. So the step is chosen from the
system rather than adapted per-step:

```
h = η · min_pairs √( |r_ij|³ / (G(m_i + m_j)) )
```

i.e. a fraction of the shortest dynamical time present, recomputed only when
the user edits the system. η ≈ 1/64 gives ~100 steps per tightest orbit.

Accelerated time (1× … 10⁶×) advances *more steps per frame*, never a larger
step. Beyond a cap, the simulation reports that it is step-limited rather
than silently integrating garbage.

### 4.3 Close encounters

Two strategies, switched by separation:

- **Softening** (Plummer): |r|³ → (|r|² + ε²)^{3/2}, with ε shown in the UI
  because it is a lie about the physics at small r.
- **Merge** when surfaces touch, conserving mass, momentum and — for the
  merged spin — angular momentum about the new centre of mass.

### 4.4 Conserved-quantity diagnostics

The UI continuously displays fractional drift in total energy and angular
momentum. A simulation that silently stops conserving them is the main way
these toys mislead, so the drift is on screen rather than hidden.

---

## 5. Edge cases and limitations

| Situation | Handling |
|---|---|
| Surfaces touch | Perfectly inelastic merge; mass and momentum conserved, radius from combined volume at the merged density. |
| Roche limit | d < 2.44 R_prim (ρ_prim/ρ_sat)^{1/3} flags tidal disruption (fluid); rigid-body form also shown. Flagged, not simulated — fragmentation is out of scope and pretending otherwise would be dishonest. |
| Compactness | C = r_s/R = 2GM/(Rc²) displayed for every body. Sun 4×10⁻⁶, neutron star ≈0.3, horizon at C = 1. |
| **Buchdahl bound** | No static sphere can exceed C = 8/9 ≈ 0.889. Exceeding it means collapse is unavoidable — the UI enforces and explains this rather than permitting impossible bodies. |
| Inside the horizon | Schwarzschild coordinates fail at r = r_s. The simulator does not pretend to integrate through it; it marks the horizon and stops the probe, noting the failure is in the coordinates, not in spacetime. |
| v → c | Newtonian layer is flagged invalid above ~0.1c; the readout turns red rather than quietly reporting nonsense. |
| Gravitational waves | Quadrupole formula only, h = (2G/c⁴d)·d²Q/dt². Shown as strain on a ring of test masses, with the true amplitude stated (~10⁻²¹) and the visual exaggeration factor printed on screen. |

---

## 6. Staged implementation

1. **G1** physics core + headless tests (Kepler, energy, Mercury) — *done*
2. **G2** 3D scene, bodies, trails, camera, time control — *done*
3. **G3** sandbox: place, edit, delete, presets, velocity arrow — *done*
4. **G4** tidal tendex field — the headline visualization — *done*
5. **G5** remaining modes + relativistic layer — *done*
6. **G6** explainers, docs, collisions — *done*
7. **G7** the 3D grid: a free-fall lattice, in both the tidal and the
   Gullstrand–Painlevé infall frames — *done*

Each stage leaves a working, openable app.

The grid mode is the one §2.2 originally called *lattice strain* and the
first build shipped without. It resolves the tension the whole document is
about — how to draw a grid that responds to mass without telling the
rubber-sheet lie — by drawing a grid that is not a coordinate grid at all.
The nodes are test particles; their deformation is geodesic deviation; and it
carries two checkable statements, the 2 : 1 stretch-to-squeeze ratio and the
volume law, both pinned down in the test suite.

Layer C arrived as `src/physics/geodesic.js`: the Schwarzschild shape equation
integrated in φ (which is what makes it cheap enough to redraw live) and the
Peters & Mathews quadrupole formulae. Both are validated in the test suite
against measured numbers — Mercury to five decimal places against the closed
form, the Hulse-Taylor decay to 0.2%, GW150914's chirp mass and strain.

---

## 7. Sources

- Nichols et al., *Visualizing Spacetime Curvature via Frame-Drag Vortexes
  and Tidal Tendexes I: General Theory and Weak-Gravity Applications*,
  Phys. Rev. D 84, 124014 (2011), arXiv:1108.5486 — E_ij and B_ij
  definitions, tendex/vortex lines, tendicity sign convention, Ω_fd.
- Owen et al., *Frame-Dragging Vortexes and Tidal Tendexes Attached to
  Colliding Black Holes*, Phys. Rev. Lett. 106, 151101 (2011).
- Rein & Spiegel, *IAS15: a fast, adaptive, high-order integrator*,
  MNRAS 446, 1424 (2015); Rein & Tamayo, *WHFast*, MNRAS 452, 376 (2015).
- REBOUND integrator documentation — integrator selection and close-encounter
  strategy.
- Misner, Thorne & Wheeler, *Gravitation* — geodesic deviation, Flamm's
  paraboloid, effective potential.
- Will, *Theory and Experiment in Gravitational Physics* — PN equations of
  motion, perihelion advance.
