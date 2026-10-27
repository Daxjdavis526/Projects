// The Riemann curvature tensor, dissected: its definition from the
// Christoffel symbols (Carroll's and MTW's convention) and what it does — the
// geodesic deviation equation, D²ξ^ρ/dτ² = R^ρ_σμν u^σ u^μ ξ^ν, written with
// the same index roles. Verified with sympy: sphere R^θ_φθφ = sin²θ;
// Schwarzschild static-frame R^r̂_0̂r̂0̂ = −2GM/(c²r³), R^θ̂_0̂θ̂0̂ = +GM/(c²r³);
// Kretschmann 48G²M²/(c⁴r⁶). Agrees with gr.S14.i (tides) and gr.S13.i.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, C, M_SUN, sci, round, rs, dustBall } from './_eq.js';

const t = String.raw;
const DEG = Math.PI / 180;

const RIEM = t`R^\rho{}_{\sigma\mu\nu} = \partial_\mu\Gamma^\rho{}_{\nu\sigma} - \partial_\nu\Gamma^\rho{}_{\mu\sigma} + \Gamma^\rho{}_{\mu\lambda}\Gamma^\lambda{}_{\nu\sigma} - \Gamma^\rho{}_{\nu\lambda}\Gamma^\lambda{}_{\mu\sigma}`;

// tidal curvature settings the dust-ball simulation can draw: [description, GM, r (m), body, r in its unit]
const GM_E = 3.986e14, R_E = 6.371e6;
const RS10 = rs(10 * M_SUN), RSG = rs(4.30e6 * M_SUN);
const TIDES = [
  ['at Earth’s surface ($GM = 3.986\\times10^{14}\\ \\text{m}^3/\\text{s}^2$, $r = 6.371\\times10^{6}$ m)', GM_E, R_E, 'earth', 1],
  ['at the height of the GPS satellites ($GM = 3.986\\times10^{14}\\ \\text{m}^3/\\text{s}^2$, $r = 2.656\\times10^{7}$ m)', GM_E, 2.656e7, 'earth', round(2.656e7 / R_E, 3)],
  [`ten horizon radii from a 10-solar-mass black hole ($GM = ${sci(10 * G * M_SUN, 4)}\\ \\text{m}^3/\\text{s}^2$, $r = ${sci(10 * RS10, 4)}$ m)`, 10 * G * M_SUN, 10 * RS10, 'bh', 10],
  [`at the horizon of Sagittarius A* ($GM = ${sci(4.30e6 * G * M_SUN, 4)}\\ \\text{m}^3/\\text{s}^2$, $r = ${sci(RSG, 4)}$ m)`, 4.30e6 * G * M_SUN, RSG, 'sgra', 1],
];

// Kretschmann scalar R_ρσμν R^ρσμν = 48 G²M²/(c⁴r⁶): at the horizon it is 12/r_s⁴
const kretschGraph = {
  type: 'graph',
  params: {
    x: [0, 4], y: [0, 3.2], xlabel: 'r / r_s', ylabel: 'K / K(horizon)',
    curves: [{ fn: '1/x^6', domain: [0.62, 4], color: 'bad' }],
    vlines: [{ x: 1, label: 'horizon' }],
    hlines: [{ y: 1 }],
  },
  caption: t`The curvature invariant $K = R_{\rho\sigma\mu\nu}R^{\rho\sigma\mu\nu}$ of a non-spinning black hole against $r$, in units of its value at the horizon. Every observer computes the same $K$; it grows as $1/r^6$ and is infinite only at $r = 0$.`,
};

export default lesson({
  id: 'gr.EQ.4',
  kind: 'dissection',
  title: 'The Riemann tensor',
  minutes: 9, difficulty: 3,
  badges: ['est-der'],
  equation: t`\begin{gathered}\part{1}{R^\rho{}_{\sigma\mu\nu}} = \part{2}{\partial_\mu\Gamma^\rho{}_{\nu\sigma} - \partial_\nu\Gamma^\rho{}_{\mu\sigma}} + \part{3}{\Gamma^\rho{}_{\mu\lambda}\Gamma^\lambda{}_{\nu\sigma} - \Gamma^\rho{}_{\nu\lambda}\Gamma^\lambda{}_{\mu\sigma}} \\[6pt] \part{4}{\frac{D^2\xi^\rho}{d\tau^2}} = \part{1}{R^\rho{}_{\sigma\mu\nu}}\,\part{5}{u^\sigma u^\mu\,\xi^\nu}\end{gathered}`,
  intro: t`The Riemann tensor is **curvature itself** — the part of gravity that no freely falling frame can remove. The first line builds it from the Christoffel symbols; the second says what it does: it sets the **relative acceleration of two neighbouring freely falling particles**, the tides. If every component vanishes, spacetime is flat, in any coordinates.

Conventions are Carroll's (the same as Misner, Thorne and Wheeler's): signature $(-,+,+,+)$, $x^0 = ct$, every index runs over $0, 1, 2, 3$, and an index repeated once up and once down is summed. Some books define the tensor with the opposite overall sign or a different slot order, so check the definition before comparing signs. Each symbol below gets its own card.`,
  parts: [
    {
      tex: t`R^\rho{}_{\sigma\mu\nu}`, name: 'the Riemann curvature tensor', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`Picture a tiny loop whose sides point along the directions $\mu$ and $\nu$. Carry a vector $V^\sigma$ around it without turning it: it comes back changed, by an amount proportional to $R^\rho{}_{\sigma\mu\nu}V^\sigma$ times the loop's area. So **$\sigma$ is the input** (the vector carried), **$\rho$ the output** (the change), and **$\mu\nu$ the plane of the loop**. Going round the other way reverses the change: the tensor is antisymmetric in $\mu$ and $\nu$.

Of its $4^4 = 256$ labels, its symmetries leave **20 independent components** in four dimensions. It is a true tensor: zero in one coordinate system means zero in all — the definition of flat.`,
      more: t`Equivalently, covariant derivatives fail to commute: $[\nabla_\mu, \nabla_\nu]V^\rho = R^\rho{}_{\sigma\mu\nu}V^\sigma$. With the first index lowered, $R_{\rho\sigma\mu\nu} = -R_{\sigma\rho\mu\nu} = -R_{\rho\sigma\nu\mu} = R_{\mu\nu\rho\sigma}$, and $R_{\rho\sigma\mu\nu} + R_{\rho\mu\nu\sigma} + R_{\rho\nu\sigma\mu} = 0$. Contracting the output with the first loop index gives the Ricci tensor, $R_{\sigma\nu} = R^\rho{}_{\sigma\rho\nu}$ — the next dissection.`,
    },
    {
      tex: t`\partial_\mu\Gamma^\rho{}_{\nu\sigma} - \partial_\nu\Gamma^\rho{}_{\mu\sigma}`, name: 'the derivative terms', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`How the connection **changes from place to place** — second derivatives of the metric. Step along $\mu$ and see how the symbols for $\nu$ change, then subtract the same with $\mu$ and $\nu$ swapped: that difference is what makes the result antisymmetric.

This is the part **no coordinate choice can remove**. In a freely falling frame the Christoffel symbols themselves vanish at your location, but these derivatives survive — and there they are the whole Riemann tensor.`,
    },
    {
      tex: t`\Gamma^\rho{}_{\mu\lambda}\Gamma^\lambda{}_{\nu\sigma} - \Gamma^\rho{}_{\nu\lambda}\Gamma^\lambda{}_{\mu\sigma}`, name: 'the connection-squared terms', badge: 'est-der', units: t`$\text{m}^{-2}$`,
      text: t`Products of two Christoffel symbols. In each product $\lambda$ appears once up and once down, so it is **summed** over its four values. These terms make the combination a genuine tensor in any coordinates: the derivative terms alone are not.

They vanish where the Christoffel symbols do — at the centre of a freely falling frame — but in ordinary coordinates they matter. On a sphere in latitude–longitude angles, the derivative terms alone give $R^\theta{}_{\phi\theta\phi} = -\cos 2\theta$; the products add $\cos^2\theta$, and only the sum, $\sin^2\theta$, is right.`,
    },
    {
      tex: t`\frac{D^2\xi^\rho}{d\tau^2}`, name: 'the relative acceleration (geodesic deviation)', badge: 'est-obs', units: t`$\text{m/s}^2$`,
      text: t`Two neighbouring particles fall freely side by side; $\xi^\rho$ is the small vector from one to the other. This is how their separation **accelerates**, measured with the covariant derivative $D/d\tau$ along their path (the version of $d/d\tau$ that allows for the turning grid), as their own clocks tick.

In flat spacetime it is zero: free particles drift apart or together only at a steady rate. Any relative acceleration is curvature. It is measured directly — ocean tides, satellite gravity gradiometers, and the free-falling mirrors of LIGO, Virgo and KAGRA.`,
    },
    {
      tex: t`u^\sigma u^\mu\,\xi^\nu`, name: 'velocity twice, separation once', badge: 'est-der', units: t`$\text{m}^3/\text{s}^2$`,
      text: t`The inputs: the particles' four-velocity $u$ in two slots and their separation $\xi$ in the last. All three indices are summed against the Riemann tensor, leaving one free index $\rho$ — the direction of the relative acceleration.

For particles released at rest at distance $r$ from a mass $M$, $u^0 = c$ and this gives $+2GM/r^3$ per metre of separation along the line to the mass (a stretch) and $-GM/r^3$ per metre across it (a squeeze): Newton's tides, here as curvature, $R^{\hat r}{}_{\hat 0\hat r\hat 0} = -2GM/(c^2r^3)$. For a non-spinning mass the result is exact all the way to the horizon.`,
    },
  ],
  readAloud: t`The Riemann tensor measures how the connection changes from place to place — how far a vector carried around a small loop comes back turned — and it is felt as the relative acceleration, the tides, of neighbouring freely falling particles.`,
  why: t`This is curvature itself: whether spacetime is flat, how strong a black hole's tides are, and what LIGO's mirrors feel are all read from it — and its contraction, the Ricci tensor, is what enters Einstein's equations.`,
  visual: {
    type: 'gr-dustball',
    title: 'Geodesic deviation: a ball of falling dust',
    lead: t`Every grain falls freely; the arrows show its acceleration **relative to the centre** — the left side of the second line, $D^2\xi^\rho/d\tau^2$, for each separation $\xi$. Gravity at the centre cannot be felt; these relative accelerations can, and they are the Riemann tensor at work.`,
    tasks: [
      'Set the time to 0: the stretch arrows along the line to the mass are exactly twice the squeeze arrows across it — 2GM/r³ against GM/r³.',
      'Choose the 10 M☉ black hole and move the ball inward: the relative accelerations grow as 1/r³.',
      'Watch the volume graph start out flat: in empty space the tides change the ball’s shape, not its volume — the Ricci part is zero there.',
    ],
    params: { mode: 'tides', body: 'earth', bodies: true, t: 0.6 },
  },
  practice: [
    mcq({
      id: 'survives', difficulty: 2,
      prompt: t`$$R^\rho{}_{\sigma\mu\nu} = \underbrace{\partial_\mu\Gamma^\rho{}_{\nu\sigma} - \partial_\nu\Gamma^\rho{}_{\mu\sigma}}_{\text{A}} + \underbrace{\Gamma^\rho{}_{\mu\lambda}\Gamma^\lambda{}_{\nu\sigma} - \Gamma^\rho{}_{\nu\lambda}\Gamma^\lambda{}_{\mu\sigma}}_{\text{B}}$$ In a freely falling laboratory you choose coordinates in which every Christoffel symbol is zero at the lab's centre. Which part of the formula can still be non-zero there?`,
      choices: [
        'Only A: the Christoffel symbols vanish at the point, but their rates of change do not',
        'Only B, because products of Christoffel symbols are larger than their derivatives',
        'Neither: in free fall the Riemann tensor is zero, which is why astronauts float',
        'Both, unchanged, because free fall cannot affect any part of a tensor',
      ],
      answer: 0,
      why: {
        1: 'At the point, every Christoffel symbol is zero, so every product of two of them is zero too.',
        2: 'Astronauts float because the connection vanishes at their location; curvature does not, and shows up as tides across the station.',
        3: 'The tensor’s value does not change, but how it is split between A and B depends on the coordinates: at this point B is zero and A carries it all.',
      },
      hints: ['Set every Γ to zero at the point. What happens to B? To A?', 'A zero function can still have a non-zero slope.'],
      teach: 'At the centre of a freely falling frame the Christoffel symbols vanish, but their derivatives — and so the Riemann tensor — do not.',
      explain: t`Each term of B is a product of two Christoffel symbols, so B $= 0$ at the point. A contains their first derivatives, which no coordinate choice can remove all of when spacetime is curved: there the Riemann tensor is A alone, felt as tides across the lab.`,
      visual: { type: 'gr-elevator', params: { mode: 'falling', tides: true }, caption: 'A box falling freely near Earth. Press Release: balls at the centre float — no gravity there — while over a larger box they drift into a stretched diamond. That drift is curvature (exaggerated).' },
    }),
    num({
      id: 'components', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 5]);
        const N = (n * n * (n * n - 1)) / 12;
        return {
          prompt: t`The symmetries of the Riemann tensor leave $\dfrac{n^2(n^2 - 1)}{12}$ independent components in $n$ dimensions (20 in spacetime, $n = 4$). How many are there for $n = ${n}$?`,
          answer: N, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: n ** 4, feedback: 'That counts every label; the symmetries make most of them repeats or zeros.' }],
          hints: [t`Put $n = ${n}$ into $n^2(n^2-1)/12$.`],
          teach: 'The Riemann tensor has n²(n² − 1)/12 independent components: 1 on a surface, 6 in three dimensions, 20 in spacetime.',
          explain: t`$\dfrac{${n * n}\times${n * n - 1}}{12} = ${N}$. ${n === 2 ? 'On a surface the single component is the Gaussian curvature: the sphere has nothing more to it than one number per point.' : n === 3 ? 'In three dimensions the Ricci tensor, with 6 components, already determines all of it.' : 'Each extra dimension adds many more ways for space to curve.'}`,
        };
      },
    }),
    num({
      id: 'tidal', difficulty: 2,
      gen(r) {
        const [where, GM, R, body, rr] = r.pick(TIDES);
        const val = (2 * GM) / (C * C * R ** 3);
        return {
          prompt: t`For particles released at rest at distance $r$ from a non-spinning mass, the radial curvature component in their own frame is $R^{\hat r}{}_{\hat 0\hat r\hat 0} = -\dfrac{2GM}{c^2r^3}$. Find its size ${where}, in $\text{m}^{-2}$ ($c = 2.998\times10^{8}$ m/s).`,
          answer: val, units: 'm^-2', tol: { rel: 0.01 },
          errors: [{ value: val / 2, feedback: 'That is the transverse component, GM/(c²r³). The radial one has the factor 2.' }, { value: val * C * C, feedback: 'That is 2GM/r³, the stretch per metre in s⁻². Divide by c² for the curvature in m⁻².' }],
          hints: [t`Work out $r^3$ first, then $2GM/(c^2r^3)$ with $c^2 = 8.988\times10^{16}\ \text{m}^2/\text{s}^2$.`, t`$2GM/(c^2r^3) = 2\times${sci(GM, 4)}/(8.988\times10^{16}\times${sci(R ** 3, 4)})$.`],
          teach: 'A curvature component times c² is a relative acceleration per metre: tiny curvatures in m⁻² make tides you can feel.',
          explain: t`$|R^{\hat r}{}_{\hat 0\hat r\hat 0}| = ${sci(val)}\ \text{m}^{-2}$. Multiplied by $c^2$ (the $u^0u^0$ of the deviation equation) it is a stretch of $${sci(val * C * C)}$ m/s² per metre of separation.`,
          visual: dustBall({ mode: 'tides', body, r: rr, t: 0.5 }, 'A ball of free-falling dust at that distance, a moment after release: stretched along the line to the mass (on the left) and squeezed across it.'),
        };
      },
    }),
    mcq({
      id: 'antisym', difficulty: 2,
      prompt: t`Because the Riemann tensor is antisymmetric in its last two indices, $R^\rho{}_{\sigma\mu\nu} = -R^\rho{}_{\sigma\nu\mu}$. What is $R^\rho{}_{\sigma\theta\theta}$ — both loop indices equal — on any surface or spacetime?`,
      choices: [
        'Zero: a “loop” spanned by one direction twice encloses no area, and antisymmetry forces it to vanish',
        t`$2\,\partial_\theta\Gamma^\rho{}_{\theta\sigma}$, from the two derivative terms adding`,
        'The Ricci tensor component with the same indices',
        'It depends on the coordinates you use',
      ],
      answer: 0,
      why: {
        1: t`With $\mu = \nu = \theta$ the two derivative terms are identical and subtract: $\partial_\theta\Gamma - \partial_\theta\Gamma = 0$. So do the two product terms.`,
        2: 'The Ricci tensor contracts the output index with a loop index; it is a sum, not one component with repeated loop indices.',
        3: 'Antisymmetry is a property of the tensor in every coordinate system, so the zero is too.',
      },
      hints: [t`Put $\nu = \mu$ into $R^\rho{}_{\sigma\mu\nu} = -R^\rho{}_{\sigma\nu\mu}$.`, 'A quantity equal to minus itself is zero.'],
      teach: 'The Riemann tensor is antisymmetric in its loop indices, so any component with them equal is zero: a degenerate loop turns nothing.',
      explain: t`$R^\rho{}_{\sigma\theta\theta} = -R^\rho{}_{\sigma\theta\theta}$, so it is zero. Geometrically, the change of a carried vector is proportional to the area of the loop, and a loop with both sides along $\theta$ has none.`,
      visual: { type: 'gr-sphere-transport', params: { mode: 'triangle', dphi: 60, colat: 60, colatSlider: true, progress: 1, readout: false }, caption: 'Carried around a loop on a sphere, an arrow comes back turned in proportion to the area enclosed. Shrink the loop with the slider: the turn shrinks with the area.' },
    }),
    num({
      id: 'sphere', difficulty: 3,
      gen(r) {
        const th = r.pick([20, 30, 60, 70]);
        const c = Math.cos(th * DEG), s = Math.sin(th * DEG);
        const dTerm = -Math.cos(2 * th * DEG), gg = c * c;
        return {
          prompt: t`On a unit sphere, $\Gamma^\theta{}_{\phi\phi} = -\sin\theta\cos\theta$ and $\Gamma^\phi{}_{\theta\phi} = \cot\theta$, and the only surviving terms of $R^\theta{}_{\phi\theta\phi}$ are $$R^\theta{}_{\phi\theta\phi} = \partial_\theta\Gamma^\theta{}_{\phi\phi} - \Gamma^\theta{}_{\phi\phi}\,\Gamma^\phi{}_{\theta\phi}.$$ Evaluate it at $\theta = ${th}^\circ$.`,
          answer: s * s, tol: { rel: 0.01 },
          errors: [{ value: dTerm, feedback: 'That is the derivative term alone. Subtract the product term, −Γ^θ_φφ Γ^φ_θφ = +cos²θ.' }, { value: gg, feedback: 'That is the product term alone. Add the derivative term, ∂_θ(−sin θ cos θ) = −cos 2θ.' }],
          hints: [t`$\partial_\theta(-\sin\theta\cos\theta) = -\cos 2\theta$.`, t`$-\Gamma^\theta{}_{\phi\phi}\Gamma^\phi{}_{\theta\phi} = -(-\sin\theta\cos\theta)\cot\theta = \cos^2\theta$. Add the two.`],
          teach: t`On a sphere both parts of the formula contribute: $-\cos 2\theta + \cos^2\theta = \sin^2\theta$, which is the sphere's constant curvature written in angles.`,
          explain: t`Derivative term: $-\cos(${2 * th}^\circ) = ${fmt(dTerm, 3)}$. Product term: $\cos^2 ${th}^\circ = ${fmt(gg, 3)}$. Sum: $${fmt(s * s, 3)} = \sin^2 ${th}^\circ$. Divided by $g_{\phi\phi} = \sin^2\theta$ it gives the Gaussian curvature $1$ at every point: a unit sphere is equally curved everywhere.`,
          visual: { type: 'gr-sphere-transport', params: { mode: 'cap', lat: 90 - th, transport: false, readout: false }, caption: t`Not to scale: the circle at $\theta = ${th}^\circ$ from the pole on a sphere.` },
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-flat', difficulty: 2,
      prompt: t`Polar coordinates on a flat plane have non-zero Christoffel symbols. Could the Riemann tensor be zero in Cartesian coordinates but non-zero in polar ones?`,
      choices: [
        'No: it is a tensor, so if every component vanishes in one coordinate system it vanishes in all — the plane is flat in every description',
        'Yes: like the Christoffel symbols, it depends on the coordinates',
        'Yes, but only near the origin, where polar coordinates break down',
        'No, because the Riemann tensor is always zero in two dimensions',
      ],
      answer: 0,
      why: {
        1: 'That is exactly the difference between the two: the Christoffel symbols are not tensors; the Riemann tensor is.',
        2: 'Polar coordinates fail at the origin, but the plane is flat there too; curvature is not created by a bad choice of labels.',
        3: t`A sphere is two-dimensional and curved: its single independent component, $R_{\theta\phi\theta\phi} = a^2\sin^2\theta$, is not zero.`,
      },
      hints: ['How does a tensor change between coordinate systems?'],
      teach: 'Flatness is the vanishing of the Riemann tensor, and a tensor that vanishes in one coordinate system vanishes in all.',
      explain: t`Tensor components in new coordinates are sums of the old components times Jacobian factors, so all-zero stays all-zero. In polar coordinates the derivative and product terms are both non-zero but cancel exactly — the plane is flat however it is labelled.`,
      visual: { type: 'gr-coordinates', params: { mode: 'basis', p: [2.5, 1.5], readout: false }, caption: t`A flat plane with a polar grid: the grid's arrows turn and stretch from point to point (non-zero Christoffel symbols), yet nothing carried around a loop on the plane comes back turned (zero Riemann tensor).` },
    }),
    num({
      id: 'cp-ligo', difficulty: 3, transfer: true,
      gen(r) {
        const f = r.pick([35, 100, 150, 250]);
        const w = 2 * Math.PI * f, h = 1e-21, L = 4000;
        const acc = 0.5 * w * w * h * L;
        return {
          prompt: t`A gravitational wave of strain amplitude $h = 1.0\times10^{-21}$ and frequency $f = ${f}$ Hz passes LIGO. Its curvature makes the two free-hanging mirrors at the ends of a $L = 4.0$ km arm accelerate relative to each other with amplitude $\tfrac12(2\pi f)^2 h L$ — the deviation equation with $c^2R^{\hat x}{}_{\hat 0\hat x\hat 0} = -\tfrac12\ddot h$. What is that relative acceleration, in m/s²?`,
          answer: acc, units: 'm/s^2', tol: { rel: 0.01 },
          errors: [{ value: 2 * acc, feedback: 'Keep the ½: R^x̂_0̂x̂0̂ carries half the second derivative of the strain.' }, { value: acc / (2 * Math.PI) ** 2, feedback: 'Use the angular frequency ω = 2πf, not f itself.' }],
          hints: [t`$\omega = 2\pi f = ${fmt(w, 4)}$ rad/s.`, t`$\tfrac12\omega^2 hL = \tfrac12\times(${fmt(w, 4)})^2\times10^{-21}\times4000$.`],
          teach: 'LIGO measures curvature: the Riemann tensor of a passing wave sets the relative acceleration of its free mirrors.',
          explain: t`$\tfrac12\omega^2hL = ${sci(acc)}\ \text{m/s}^2$. The curvature behind it is only $\tfrac12\omega^2h/c^2 = ${sci((0.5 * w * w * h) / (C * C))}\ \text{m}^{-2}$, yet the mirrors' $${sci(h * L)}$ m swing in arm length is measured.`,
          visual: dustBall({ mode: 'wave', pol: 'plus', h: 0.5, t: 0 }, 'A ring of free particles as a gravitational wave passes along the line of sight: stretched one way, squeezed the other, alternately. The drawn strain is hugely exaggerated — a real one is about 10⁻²¹.'),
        };
      },
    }),
    num({
      id: 'cp-kretschmann', difficulty: 3,
      gen(r) {
        const [name, m] = r.pick([['a 10-solar-mass black hole', 10], ['Sagittarius A* (4.30 million solar masses)', 4.30e6], ['a 1-solar-mass black hole', 1]]);
        const R = rs(m * M_SUN), K = 12 / R ** 4;
        return {
          prompt: t`The simplest number built from the Riemann tensor, $K = R_{\rho\sigma\mu\nu}R^{\rho\sigma\mu\nu}$, is the same for every observer. Outside a non-spinning mass $K = \dfrac{48G^2M^2}{c^4r^6}$, which at the horizon $r = r_s = 2GM/c^2$ equals $12/r_s^4$. Evaluate it at the horizon of ${name}, in $\text{m}^{-4}$ ($r_s = ${sci(R, 4)}$ m).`,
          answer: K, units: 'm^-4', tol: { rel: 0.01 },
          errors: [{ value: 48 / R ** 4, feedback: 'Use GM/c² = r_s/2: 48(r_s/2)²/r_s⁶ = 12/r_s⁴, not 48/r_s⁴.' }],
          hints: [t`$r_s^4 = (${sci(R, 4)})^4 = ${sci(R ** 4, 4)}\ \text{m}^4$.`, t`$K = 12/r_s^4$.`],
          teach: 'The curvature invariant is finite at a horizon and smaller for bigger black holes; only at r = 0 does it blow up.',
          explain: t`$K = 12/(${sci(R, 4)})^4 = ${sci(K)}\ \text{m}^{-4}$ — finite. The horizon is not a curvature singularity, and since $K \propto 1/M^4$ there, a giant black hole's horizon is far gentler than a small one's. At $r = 0$, $K \to \infty$: that is the real singularity.`,
          visual: kretschGraph,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry, §3.6–3.10 (curvature, geodesic deviation)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Carroll, Lecture Notes on GR, ch. 3', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Misner, Thorne & Wheeler, Gravitation (1973), ch. 11 and the sign-convention table', url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation' },
  ],
});
