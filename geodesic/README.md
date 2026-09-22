# GEODESIC

An interactive sandbox for gravitational dynamics and spacetime curvature,
running entirely in a browser with no build step.

Build a system — empty universe, or one of ten presets from the Earth–Moon
pair to Sgr A* and the star S2 — set every body's mass, radius, density, spin
and velocity, run it, and look at what its gravity is doing to spacetime nine
different ways.

**Live:** https://daxjdavis526.github.io/Projects/geodesic/

---

## The argument this project is built around

Almost every picture of curved spacetime is the same picture: a rubber sheet
with a bowling ball on it. It is wrong in four independent ways.

1. **It shows space, not spacetime.** Orbits are caused by the curvature of
   *time* — in the weak field `d²xⁱ/dt² = −Γⁱ₀₀c²  = −∂ⁱΦ`, and `Γⁱ₀₀` comes
   entirely from `g₀₀`. Spatial curvature only enters at order `(v/c)²`. The
   evidence is sitting in the textbooks: Newtonian gravity deflects starlight
   by 0.87″, GR by 1.75″, and the factor of two is exactly the spatial part
   the rubber sheet is drawing.
2. **It needs gravity to explain gravity.** The ball rolls downhill because
   something is pulling it down, out of the picture.
3. **It is two-dimensional.** Real curvature is three-dimensional and
   intrinsic — it needs no surrounding space to bend into.
4. **It cannot superpose.** Two dents in a sheet do not add up to the field of
   two masses.

The honest alternative, and the default mode here, is the **tidal field**
`E_ij = ∂ᵢ∂ⱼΦ` — the leading term of the Riemann tensor in the Newtonian
limit. It is not an analogy for curvature; it *is* curvature. It cannot be
transformed away (a freely falling observer feels no force but still gets
stretched), it is genuinely 3D, it needs no embedding dimension, and it
superposes. Its integral curves are the **tendex lines** of Nichols et al.,
and they come out as radial red rays (stretch) and blue curves lying on
spheres (squeeze) around a single mass — which is a picture of gravity you can
read directly, and which bends toward a companion the moment you add one.

The **3D grid** mode makes the same point a different way. Every node is a
freely falling test particle, so the grid is allowed to bend: the things it is
made of are falling, along paths that diverge. It stretches toward a mass and
squeezes across it in the ratio 2 : 1 — E_ij is trace-free, so one stretching
direction must balance two squeezing ones — and its volume is conserved in
vacuum but shrinks at `−4πG⟨ρ⟩` where mass is enclosed, which is Einstein's
equation in the form Baez states it. Both numbers are on screen, and both are
checked in the test suite. You can also watch it in the Gullstrand–Painlevé
infall frame, where space genuinely pours inward at the escape velocity.

The rubber sheet is still in here, as the **Embedding** mode. It draws Flamm's
paraboloid, which is a genuinely exact object: the isometric embedding of one
equatorial spatial slice of Schwarzschild. The mode exists to show you the
famous picture and then tell you what it does not explain.

---

## The three layers, and which one any number came from

| Layer | What | Used for |
|---|---|---|
| **A — Orbits** | Newtonian N-body, velocity Verlet or Yoshida-4, optional 1PN correction | every body's motion |
| **B — Fields** | `E_ij`, `Φ`, `dτ/dt`, Lense–Thirring `Ω`, from the same masses | the field visualizations |
| **C — Exact GR** | Schwarzschild geodesics, Peters & Mathews quadrupole formula | the comparison overlays |

Layer C never feeds back into layer A. That is the point: the amber geodesic
is drawn *beside* the Newtonian orbit so you can see the difference, and the
gravitational-wave panel tells you how fast the binary would inspiral while
the binary visibly does not.

There is no numerical relativity here and there is not going to be. Evolving
Einstein's field equations costs millions of CPU-hours for one black-hole
merger, and a toy version produces constraint violations that look like
physics and are not. What a browser *can* do exactly is integrate the geodesic
equation of a known metric, and that is what it does.

---

## Modes

| # | Mode | What is drawn | Honest? |
|---|---|---|---|
| 1 | Bodies only | masses, orbits, trails | yes |
| 2 | Tidal curvature | tendex lines — integral curves of `E_ij` | **this is curvature** |
| 3 | 3D grid | a cube of freely falling markers, deforming | **real and measurable** |
| 4 | Time dilation | iso-surfaces of `dτ/dt` | exact Schwarzschild outside a body |
| 5 | Potential | equipotential surfaces of `Φ` | Newtonian, shown for comparison |
| 6 | Field vectors | `g = −∇Φ` | coordinate-dependent, and labelled so |
| 7 | Frame drag | Lense–Thirring `Ω` around spinning mass | far-field form, not Kerr |
| 8 | Geodesics | exact Schwarzschild orbit vs the Newtonian one | exact, but test-particle |
| 9 | Gravitational waves | quadrupole radiation *pattern*, amplitude as a number | pattern real, no ripple drawn |
| 10 | Embedding | Flamm's paraboloid | exact geometry, wrong lesson |

Every mode has a **"Why is it doing this?"** panel that says what is drawn,
what it means, and where it stops corresponding to general relativity.

---

## What is real and what is approximated

Real, and checked against a measured number:

- Mercury's perihelion advance, 42.98″/century, from the integrated geodesic
  and from the closed form independently
- Sgr A* / S2 apsidal advance, ~13′ per orbit (measured by GRAVITY in 2020)
- the Hulse–Taylor pulsar's orbital decay, −2.40 × 10⁻¹² s/s
- GW150914's chirp mass, 28 M☉, and its strain at 410 Mpc
- Gravity Probe B's frame-dragging rate, 39 mas/yr
- Saturn's fluid Roche limit at 129,000 km
- the Moon's tide being 2.18× the Sun's
- `E_ij` against a numerically differentiated Hessian of the potential
- a falling lattice conserving its volume in vacuum, shrinking at −4πGρ inside
  matter, and stretching to squeezing in the ratio 2.008 : 1
- the Earth radiating 196 W in gravitational waves

Approximated, and stated in the UI wherever it matters:

- **orbits are Newtonian.** The optional 1PN term assumes one dominant mass;
  the panel warns when that assumption is shaky
- **no radiation reaction** — binaries do not inspiral
- curvature fields use a **weak-field superposition** of Newtonian potentials
- bodies are **uniform-density spheres**; nothing is oblate
- frame dragging is the far-field Lense–Thirring form, not Kerr
- collisions **merge**, conserving mass, momentum and angular momentum.
  Nothing tidally disrupts, even inside its Roche limit — that warning is a
  statement about reality, not about the model
- bodies below a few pixels are drawn as **markers**, not to scale, and the
  inspector always says which you are looking at

The reference grid never bends. It is a ruler, not spacetime.

---

## Numerics

Accelerated time takes **more steps, never bigger ones**. A symplectic
integrator loses its conservation property the moment the step size varies,
and a gravity toy that silently stops conserving energy is the main way these
things mislead — so the energy drift is on screen at all times.

| Integrator | Order | Symplectic | Notes |
|---|---|---|---|
| Yoshida-4 | 4 | yes | **default**; three Verlet steps with the triple-jump coefficients |
| Velocity Verlet | 2 | yes | bounded energy error forever, at one force evaluation |
| RK4 | 4 | **no** | kept so you can watch a higher-order method lose energy |

Symplecticity beats order for bound orbits: Verlet's energy error oscillates
and stays bounded, RK4's drifts secularly. Timestep is chosen automatically at
about 1/320 of the shortest dynamical time, and the integrator is selectable
from the panel — swap to RK4 and watch the drift readout start climbing.

Across the ten presets, Yoshida-4 holds relative energy drift between 10⁻¹¹
and 10⁻⁸. Velocity Verlet at the same step size gives 10⁻⁸ to 10⁻⁴, the worst
cases being the eccentric ones, where a fixed step sized from the *mean*
dynamical time is far too coarse at perihelion.

Units are AU, solar masses and Julian years, so `G ≈ 4π²` — which keeps a
black hole horizon (2 × 10⁻⁸ AU) and a wide binary (10⁴ AU) representable in
the same float64 scene. Every constant is derived from SI values rather than
from the convenient fiction that `G = 4π²` exactly.

---

## Testing

```
node test/physics.test.mjs      # 92 checks, no browser
```

The physics layer imports no DOM and no three.js, which is what makes that
possible and what keeps it honest. Rendering is verified by screenshot in
headless Chromium — several bugs in this repo were only ever visible in a
picture.

## Running it

```
python3 -m http.server
```

No build step, no npm install. three.js is vendored locally.

## Sources

Misner, Thorne & Wheeler, *Gravitation* · Hartle, *Gravity* · Nichols et al.,
*Visualizing spacetime curvature via frame-drag vortexes and tidal tendexes*
(Phys. Rev. D 84, 124014) · Peters & Mathews (1963), Peters (1964) ·
Will, *The Confrontation between General Relativity and Experiment* ·
GRAVITY Collaboration (2020) on S2's precession · Everitt et al. (2011) on
Gravity Probe B · Yoshida (1990) on symplectic integrators.

See `DESIGN.md` for the full design record.
