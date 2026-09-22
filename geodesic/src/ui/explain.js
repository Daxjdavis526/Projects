/* =============================================================================
   EXPLAIN — "why is it doing this?"
   -----------------------------------------------------------------------------
   One explainer per visualization mode. Each says what is drawn, what it means
   physically, and — the part most simulators omit — exactly where the picture
   stops corresponding to general relativity.
   ========================================================================== */

export const EXPLAIN = {
  none: `
<h3>Bodies only</h3>
<p>Masses moving under Newtonian gravity, integrated with a symplectic method
so orbits stay closed indefinitely rather than slowly spiralling.</p>
<p>Turn on a field mode to see what the gravity is doing to spacetime — or,
more precisely, to see quantities derived from the same potential that is
moving these bodies.</p>`,

  tendex: `
<h3>Tidal curvature — the honest picture</h3>
<p>These are <b>tendex lines</b>: the integral curves of the eigenvector fields
of the tidal tensor E<sub>ij</sub>. Follow a
<span class="bad">red line</span> and you are following the direction spacetime
stretches you; follow a <span class="good">blue line</span> and you are
following the direction it squeezes you.</p>
<p>Around one mass the red lines come out radial and the blue ones lie on
spheres — gravity stretches you along the line to the mass and squeezes you
across it. Put a second mass in and the same curves bend toward it. Nothing was
added to make that happen; it is what superposing the field does.</p>

<h3>Why this and not a bent grid</h3>
<ul>
<li><b>This is curvature, not a metaphor for it.</b> In the Newtonian limit
E<sub>ij</sub> = ∂<sub>i</sub>∂<sub>j</sub>Φ is precisely the leading term of the
Riemann tensor. Tides are not caused by curvature — at leading order they
<i>are</i> curvature.</li>
<li><b>It cannot be transformed away.</b> Gravitational force is
coordinate-dependent: a freely falling observer feels none, which is the
equivalence principle. Tidal stretching survives in every frame. Drawing what
survives is drawing what is really there.</li>
<li><b>No extra dimension needed.</b> Curvature is intrinsic. Nothing has to
bend "into" anything.</li>
<li><b>It adds up.</b> Because Φ superposes in the weak field, so does
E<sub>ij</sub> — so many bodies give one coherent field.</li>
</ul>

<h3>Read it physically</h3>
<p>Two freely falling particles separated by <code>ξ</code> drift apart at
<code>Δa = −E·ξ</code>. A person of height <i>L</i> lying along a red line feels
their head and feet pulled apart with acceleration difference <code>|E|·L</code>.
That is what spaghettification is, and it is the same quantity that raises the
ocean twice a day. The eigenvalues come in the ratio −2 : +1 : +1, which is why
a falling sphere becomes a cigar and not a pancake.</p>

<h3>Where it stops being literal</h3>
<ul>
<li><b>Length means nothing.</b> An integral curve has no natural length. The
magnitude is carried by <b>brightness</b>, log-scaled over five decades and
anchored to 2GM/R³ at the surface of the strongest body — so brightness means
the same thing from one frame to the next, and watching the field fade as you
zoom out is reading the r⁻³ falloff, not watching an auto-exposure.</li>
<li><b>The blue direction is not unique.</b> For a spherical source the two
squeezing eigenvalues are exactly equal, so <i>every</i> direction
perpendicular to the radius is an eigenvector. The tracer continues in the
direction closest to the one it arrived in, which is one valid integral curve
out of infinitely many. The degeneracy is the physics: the squeeze is the same
in every direction across the radius.</li>
<li>The lines are a sampling of a field, not a substance. Space is not made of
anything and these curves are not in it.</li>
<li>Values come from a weak-field superposition of Newtonian potentials, which
is excellent everywhere except very close to a compact object, where the exact
Schwarzschild expressions differ. Inside a body the field is computed for
uniform density — finite at the centre, not divergent.</li>
</ul>`,

  dilation: `
<h3>Gravitational time dilation</h3>
<p>Brightness shows how much slower a clock ticks at rest at that point, dτ/dt.
Near Earth's surface the effect is 7 parts in 10<sup>10</sup>; at a neutron star
surface clocks run at about 0.79 of their rate at infinity; at a horizon they
stop entirely relative to a distant observer.</p>

<h3>This is why things fall</h3>
<p>This is the single most important and least drawn fact about gravity. In the
weak field the geodesic equation reduces to</p>
<p><code>d²xⁱ/dt² = −Γⁱ₀₀c² = −∂ⁱΦ</code></p>
<p>and that Γⁱ₀₀ comes from <code>g₀₀ = −(1 + 2Φ/c²)</code> — the <b>time–time</b>
component of the metric. Spatial curvature contributes at order (v/c)², which
for Earth is one part in 10<sup>8</sup>.</p>
<p><b>Orbits are caused almost entirely by the curvature of time, not of
space.</b> The famous bent-sheet picture shows dented space: the component that
barely matters.</p>
<p>The cleanest evidence is starlight grazing the Sun. Counting only the time
part gives 0.87 arcseconds of deflection. The measured value is 1.75. The
missing half is spatial curvature — which matters for light because light moves
at <i>c</i>, and not for planets because they don't.</p>`,

  potential: `
<h3>Newtonian potential</h3>
<p>Brightness shows the depth of the gravitational potential well Φ. This is a
<b>Newtonian</b> quantity, included for comparison rather than as curvature.</p>
<p>Note that potential depth and curvature are genuinely different things. Deep
inside a very large black hole the tidal field is mild even though the potential
is extreme — you could cross a supermassive horizon without noticing. Conversely
a small dense body has fierce tides near it without an especially deep well by
comparison. Switch between this and the tidal mode over the same system to see
them disagree.</p>`,

  field: `
<h3>Gravitational field vectors</h3>
<p>The Newtonian field <b>g</b> = −∇Φ: the acceleration a stationary test mass
would feel.</p>
<p><b>This is the quantity general relativity says is not fundamental.</b> Its
value depends entirely on your frame — step into free fall and it becomes zero
everywhere around you, which is what an astronaut in orbit experiences. That is
the equivalence principle in one sentence, and it is why the tidal mode, not
this one, is the honest picture of curvature.</p>
<p>It remains genuinely useful: it is what you feel standing on a planet, and
it is what the simulation integrates to move the bodies.</p>`,

  drag: `
<h3>Frame dragging</h3>
<p>A rotating mass drags inertial frames around with it. The arrows show the
Lense–Thirring angular velocity</p>
<p><code>Ω = (G/c²r³)[3(S·n)n − S]</code></p>
<p>Unlike the tidal field, which has no <i>c</i> in it at all, this is
irreducibly relativistic: there is no Newtonian counterpart. Newton's gravity
does not care whether a mass spins.</p>
<p>It is also tiny. Gravity Probe B measured Earth's frame dragging at 37 ± 7
milliarcseconds per year — four orbiting gyroscopes, and a decade of analysis,
to see it at all.</p>
<p>Give a body spin in the inspector to make anything appear here.</p>`,

  embedding: `
<h3>Flamm's paraboloid — the famous picture, and its problem</h3>
<p>This is the rubber sheet, drawn correctly. The surface
<code>z(r) = 2√(r<sub>s</sub>(r − r<sub>s</sub>))</code> is the exact isometric
embedding of one equatorial spatial slice of Schwarzschild spacetime. As a
statement about the geometry of that slice it is <b>completely true</b>.</p>

<h3>And it still does not explain orbits</h3>
<ul>
<li><b>It shows space, and orbits come from time.</b> This is the deep problem.
The dip you see contributes at order (v/c)²; the thing that actually holds
planets in orbit is the time dilation mode.</li>
<li><b>The vertical axis is not a direction.</b> It is a bookkeeping dimension
invented so a curved 2D slice can be drawn on flat paper. Nothing moves along
it. Curvature is intrinsic — it needs no space to bend into.</li>
<li><b>The usual demo explains gravity using gravity.</b> A marble on a rubber
sheet rolls into the dip because the real Earth pulls it down. Remove Earth's
gravity and the demo stops working, which rather gives the game away.</li>
<li><b>It is one slice of four dimensions</b>, at one instant, in the equatorial
plane only.</li>
</ul>
<p>The vertical scale here is exaggerated by the factor shown on screen — for
an ordinary star the true dip is far too shallow to see.</p>`,

  grid: `
<h3>The 3D grid — and why it is allowed to bend</h3>
<p>Every node is a <b>freely falling test particle</b>. Not a coordinate, not a
point on a fabric: a marker, released from rest, that then does nothing but
fall. When this grid deforms, the deformation is a measurement — something you
could go out and confirm with real markers and a stopwatch.</p>
<p>That is the whole difference between this and the rubber sheet. A
coordinate grid must never bend, because bending one says space is a substance
with a shape, and then explains orbits by appealing to a gravity outside the
picture. This grid bends because the things it is made of are <i>falling</i>,
and they fall along different paths. The equation for how those paths separate
is <code>d²ξ/dt² = −E·ξ</code> — geodesic deviation. Watching the cube distort
is watching the tidal tensor act, with no analogy in between.</p>

<h3>Two frames</h3>
<ul>
<li><b class="good">Tidal</b> subtracts the cube's own centroid motion, which
is to say it draws the markers in their own falling frame. The bulk fall
disappears and pure deformation is left. This is the equivalence principle as
a picture: take away the part any change of frame can remove, and what remains
is curvature.</li>
<li><b>Infall</b> draws the markers where they actually go. For a single body
this is exactly the Gullstrand–Painlevé <i>river</i> picture, in which space
falls inward at the escape velocity — an exact rewriting of the Schwarzschild
metric, not a cartoon. It shreds eventually, and that is true too.</li>
</ul>

<h3>The two things it proves</h3>
<p><b>The shape.</b> Stretch along the line to the mass, squeeze across it, in
the ratio <code>2 : 1</code> — because E<sub>ij</sub> is trace-free, so the one
stretching direction must exactly balance the two squeezing ones. This is why
anything falling into a black hole becomes a cigar and never a pancake, and
why there are two tides a day rather than one.</p>
<p><b>The volume.</b> In vacuum the cell volume is conserved <i>exactly</i>.
Where matter is present it shrinks, at</p>
<p><code>(1/V) d²V/dt² = −4πG⟨ρ⟩</code></p>
<p>which is Einstein's field equation in the form John Baez states it: mass is
the thing that makes a ball of freely falling particles begin to lose volume.
For a cube of any size the ⟨ρ⟩ is the <i>mean</i> density inside it, which
follows from Gauss — so the same expression covers empty space, a cube immersed
in rock, and a cube with a planet loose inside it. The panel reports the
measured rate beside the predicted one.</p>

<h3>Where it stops being literal</h3>
<ul>
<li><b>The markers are massless.</b> They fall in the field of the bodies but
pull on nothing, including each other. A real dust cloud would also collapse
under its own weight, and this one never does.</li>
<li><b>The cube is not infinitesimal.</b> Both statements above are local, and
this cube is about a fifth as wide as its distance from the mass — so the
ratio reads nearer 1.9 : 1 than 2 : 1, and a few percent of volume change
shows up in vacuum where the true answer is zero. That residual is the cube's
own width, not physics. The sharp version is in the test suite, where the cube
can be made as small as the argument needs.</li>
<li><b>Time runs on the lattice's clock here</b>, not the orbits'. Deformation
becomes obvious after roughly one tidal time, which near the Earth is days and
near a black hole is microseconds — so in this mode the planets barely move,
and the time multiplier is capped so the markers stay as carefully integrated
as the bodies.</li>
<li><b>It re-releases itself</b> once it has deformed as far as it can and
still be read. Press <b>R</b> or <i>Re-release</i> to do it by hand, after
moving the camera somewhere new.</li>
<li>The field is the Newtonian one, as everywhere else in the simulator. Close
to a compact object the exact Schwarzschild tidal field differs.</li>
</ul>`,

  geodesic: `
<h3>Geodesics — Newton against Einstein, same initial conditions</h3>
<p>Two curves are drawn from the selected body's current position and velocity
about the dominant mass. <b class="good">Amber</b> is the exact timelike
geodesic of the Schwarzschild metric. <b>Grey</b> is the Newtonian orbit. The
gap between them is general relativity, and nothing else.</p>

<h3>How it is computed</h3>
<p>The orbit shape obeys one exact ordinary differential equation:</p>
<p><code>d²u/dφ² + u = GM/L² + 3GMu²/c²</code>, with <code>u = 1/r</code>.</p>
<p>The first term on the right is Newton. The second is the entire GR
correction for a test particle around a static spherical mass. Drop it and the
ellipse closes forever; keep it and the ellipse turns, by
<code>6πGM / c²a(1−e²)</code> per orbit. That is where Mercury's 43 arcseconds
per century comes from, and the headless test suite checks that the integrated
curve reproduces the closed form to five decimal places.</p>
<p>The two rings mark the <b>photon sphere</b> at 1.5 r<sub>s</sub>, where light
orbits, and the <b>ISCO</b> at 3 r<sub>s</sub>, inside which no stable circular
orbit exists at all. Newtonian gravity has nothing to say about either; there
is no radius around a Newtonian mass where orbiting becomes impossible.</p>

<h3>Where it stops being literal</h3>
<ul>
<li><b>This is a comparison, not the simulation.</b> The bodies on screen keep
moving under the Newtonian integrator. These curves are drawn beside them.</li>
<li>Both curves are <b>test-particle</b> orbits about the dominant mass alone.
They ignore every other body. Where the amber curve and the body's actual trail
disagree, that is usually the other planets, not relativity.</li>
<li>Schwarzschild is the metric of a <i>static, non-spinning, isolated</i> mass.
Give the central body spin and the real answer is Kerr, which adds frame
dragging the amber curve does not contain.</li>
<li>The initial angular momentum is taken from the coordinate-time state
vector. The geodesic equation wants it per unit proper time; the two differ by
the local time dilation factor, which is parts in 10⁸ for a planet and matters
only very close to a horizon.</li>
</ul>`,

  waves: `
<h3>Gravitational waves — why there is no ripple on screen</h3>
<p>The lobe is the <b>angular pattern of radiated power</b> for the dominant
pair. Its radius in each direction is the relative power emitted that way:
<code>[(1+cos²θ)/2]² + cos²θ</code>, eight times larger along the orbital axis
than in the orbital plane. That is a real, static, direction-dependent fact
about the system.</p>
<p>The <b>radius is not a distance and the surface is not a wave.</b> A wave
would have to be animated, and at any scale you could actually see the
amplitude would be a lie: the strain of a close binary neutron star measured
from a hundred kiloparsecs is around 10⁻²³. Drawing a visible ripple means
exaggerating by twenty orders of magnitude, so this mode prints the amplitude
as a number instead and draws only the part that can be drawn truthfully.</p>

<h3>The numbers</h3>
<p>All from the quadrupole formula (Peters &amp; Mathews 1963), which is exact
at leading post-Newtonian order for two point masses. The test suite checks it
against the Hulse–Taylor pulsar, whose orbit decays at
−2.40 × 10⁻¹² s/s — a number measured to four figures, and the first evidence
gravitational waves exist at all.</p>

<h3>Where it stops being literal</h3>
<ul>
<li><b>There is no radiation reaction in the integrator.</b> The panel tells you
how long coalescence would take; the orbit on screen will never get there,
because nothing is removing energy from it. Adding the 2.5PN reaction term
would change that. Until it is added, the simulator must not imply otherwise.</li>
<li>The quoted strain is the <b>optimally oriented</b> amplitude. A real
detector sees less, by its antenna pattern and the binary's inclination —
which is most of the factor of two between this figure and LIGO's published
peak strain for the same system.</li>
<li>Coalescence time uses the circular-orbit formula. An eccentric binary
merges sooner, by up to the eccentricity enhancement factor shown in the
power.</li>
<li>The quadrupole formula is a weak-field, slow-motion result. In the last
orbits before a merger it stops being accurate, which is exactly the regime
numerical relativity exists for and this simulator does not attempt.</li>
</ul>`,
};

export const HELP = `
<h3>Controls</h3>
<p><b>On a phone:</b> one finger orbits, two fingers pinch to zoom and pan, a
tap selects a body. The five tabs along the bottom open the panels one at a
time — <b>View</b> picks the visualization, <b>Bodies</b> holds the list and
the preset picker, <b>Edit</b> the selected body, <b>Data</b> the numbers.
Tap the strip at the top of the screen for the full explanation of whatever
mode is running.</p>
<ul>
<li><b>Drag</b> to orbit, <b>scroll</b> to zoom, <b>click a body</b> to select it.</li>
<li><b>Space</b> play/pause. The transport buttons step forward and rewind;
rewind restores a saved state rather than running the integrator backwards.</li>
<li><b>[</b> and <b>]</b> change the time multiplier. Accelerating time takes
<i>more</i> steps, never bigger ones — a symplectic integrator loses its
conservation the moment the step size varies.</li>
<li><b>1</b>–<b>0</b> switch visualization mode. In the <b>3D grid</b>, <b>R</b> releases a fresh cube of markers.</li>
<li><b>+ Add</b> then click on the grid to place a body; drag before releasing
to give it a velocity, or release on the spot for a circular orbit.</li>
<li><b>F</b> follow the selected body (body-centred frame), <b>T</b> trails,
<b>D</b> duplicate, <b>Delete</b> remove, <b>Esc</b> cancel.</li>
</ul>

<h3>What this is</h3>
<p>A sandbox for gravitational dynamics with genuinely three-dimensional
curvature visualization. It is built in three layers, and the UI says which
layer any given number came from:</p>
<ul>
<li><b>Orbits</b> — Newtonian N-body, integrated symplectically, with an
optional first post-Newtonian correction.</li>
<li><b>Fields</b> — the tidal tensor, potential, time dilation and frame
dragging, computed from the same masses using expressions taken from general
relativity.</li>
<li><b>Exact GR</b> — Schwarzschild geodesics and the quadrupole radiation
formula, evaluated exactly and drawn <i>beside</i> the simulation for
comparison, never fed back into it.</li>
</ul>
<p>That split is deliberate. Full numerical relativity — actually evolving
Einstein's field equations — costs millions of CPU-hours for a single black
hole merger, and a toy version would produce constraint violations that look
like physics but are not. What a browser <i>can</i> do exactly is solve the
geodesic equation of a known metric, and that is what it does.</p>

<h3>What is approximated</h3>
<ul>
<li>Orbits are <b>Newtonian</b>. The 1PN term assumes one dominant mass; with
comparable masses the full EIH equations would be needed, and the panel warns
when that assumption is shaky.</li>
<li>There is <b>no radiation reaction</b>. Binaries do not inspiral here, no
matter what the gravitational-wave panel says about coalescence time.</li>
<li>Curvature fields use a <b>weak-field superposition</b> of Newtonian
potentials. Very close to a compact object the exact Schwarzschild values
differ.</li>
<li>Bodies are <b>uniform-density spheres</b>. Interior fields assume it, and
nothing is oblate.</li>
<li>Frame dragging is the <b>Lense–Thirring</b> far-field form, not Kerr.</li>
<li>Collisions <b>merge</b> and conserve mass, momentum and angular momentum.
Nothing tidally disrupts, even when the panel says it is inside its Roche
limit — that warning is a statement about reality, not about the model.</li>
<li>Bodies smaller than a few pixels are drawn as <b>markers</b>, not to scale.
The inspector always says which one you are looking at.</li>
<li>Every physical formula in the simulator is checked against a measured
number in <code>test/physics.test.mjs</code>, which runs in Node with no
browser.</li>
</ul>

<h3>Things worth trying</h3>
<ul>
<li>Load the Solar System, turn on <b>Tidal curvature</b>, and watch the field
move with the planets.</li>
<li>Take the Sun and shrink its radius toward its Schwarzschild radius. The
orbits <b>do not change at all</b> — mass is unchanged — but the surface time
dilation and tidal field climb without limit. That is the difference between
how much gravity there is and how compact the source is.</li>
<li>Load <b>Sgr A* and S2</b> and switch to <b>Geodesics</b>. The gap between
the amber and grey curves is 13 arcminutes per orbit, and it was measured in
2020.</li>
<li>Open the <b>3D grid</b> and watch a cube of falling markers stretch toward
the mass and squeeze across it, in the ratio 2 : 1. Then switch it to
<b>Infall</b> and watch the same cube pour into the planet.</li>
<li>Compare <b>Embedding</b> with <b>Time dilation</b>. The famous funnel is a
picture of <i>space</i>; the orbits are caused by the curvature of <i>time</i>.
That is why the rubber sheet cannot explain them.</li>
<li>Turn on <b>1PN</b> with the inner Solar System and watch Mercury's
perihelion creep — 43 arcseconds per century, the first evidence for general
relativity.</li>
</ul>`;
