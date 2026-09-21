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
<p>At every lattice point the <b>tidal field</b> E<sub>ij</sub> is computed and
eigen-decomposed. The three segments are its principal axes.
<span class="bad">Red stretches</span>, <span class="good">blue squeezes</span>.
Segment length carries the magnitude, so you can read the shape of the local
tidal ellipsoid directly.</p>

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
ocean twice a day.</p>

<h3>Where it stops being literal</h3>
<p>The lattice is a sampling grid, not a substance — space is not made of
anything and these lines are not in it. Values come from a weak-field
superposition of Newtonian potentials, which is excellent everywhere except
very close to a compact object, where the exact Schwarzschild expressions
differ. Inside a body the field is computed for uniform density.</p>`,

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
};

export const HELP = `
<h3>Controls</h3>
<ul>
<li><b>Drag</b> to orbit, <b>scroll</b> to zoom, <b>click a body</b> to select it.</li>
<li><b>Space</b> play/pause. <b>← →</b> step one frame.</li>
<li><b>+ Add</b> places a body where you are looking; then drag the velocity
arrow to launch it, or type numbers into the inspector.</li>
<li><b>F</b> follow the selected body (body-centred frame), <b>Esc</b> to release.</li>
<li><b>Delete</b> removes the selected body, <b>D</b> duplicates it.</li>
</ul>

<h3>What this is</h3>
<p>A sandbox for gravitational dynamics with genuinely three-dimensional
curvature visualization. Orbits are integrated with Newtonian N-body gravity
(optionally with a first post-Newtonian correction); the curvature fields are
computed from the same potential using expressions taken from general
relativity.</p>
<p>That split is deliberate and is stated wherever it matters. Full numerical
relativity — actually evolving Einstein's field equations — costs millions of
CPU-hours for a single black hole merger, and a toy version would produce
constraint violations that look like physics but are not.</p>

<h3>Things worth trying</h3>
<ul>
<li>Load the Solar System, turn on <b>Tidal curvature</b>, and watch the field
move with the planets.</li>
<li>Take the Sun and shrink its radius toward its Schwarzschild radius. The
orbits <b>do not change at all</b> — mass is unchanged — but the surface time
dilation and tidal field climb without limit. That is the difference between
how much gravity there is and how compact the source is.</li>
<li>Switch between <b>Potential</b> and <b>Tidal curvature</b> on a black hole.
They disagree, and the disagreement is the point.</li>
<li>Turn on <b>1PN</b> with the inner Solar System and watch Mercury's
perihelion creep — 43 arcseconds per century, the first evidence for general
relativity.</li>
</ul>`;
