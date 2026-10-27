// The Kerr metric in Boyer–Lindquist coordinates, dissected (G = c = 1, so M
// is the length GM/c² and a = J/M the spin as a length, J/(Mc) in SI).
// Verified with sympy: vacuum (Ricci = 0 at a test point, exact arithmetic);
// a → 0 gives Schwarzschild; Δ = 0 at r± = M ± √(M² − a²); g_tt = 0 at
// r_E = M + √(M² − a²cos²θ); ω = −g_tφ/g_φφ, Ω_H = a/(r₊² + a²) = a/(2Mr₊);
// g_tφ → −2J sin²θ/r far away; M → 0 is flat space in oblate spheroidal
// coordinates. Agrees with gr.S26.i; avoids repeating its items.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { G, C, M_SUN, AU, sci, round, mLen, kerr } from './_eq.js';

const t = String.raw;

const KERR_TT = t`-\left(1 - \frac{2Mr}{\Sigma}\right)dt^2`;
const KERR_TPHI = t`- \frac{4Mar\sin^2\theta}{\Sigma}\,dt\,d\phi`;

// a slice through the hole containing the spin axis, drawn with the flat-space map
// x = √(r² + a²) sin θ, z = r cos θ (exact when M → 0): a picture of the coordinates, not of true distances
const horizonCurve = (sign) => [`sqrt((1 ${sign} sqrt(1 - a^2))^2 + a^2)*sin(t)`, `(1 ${sign} sqrt(1 - a^2))*cos(t)`];
const kerrSlice = ({ a, slider = false, caption }) => ({
  type: 'graph',
  params: {
    x: [-4.4, 4.4], y: [-2.5, 2.7], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    ...(slider
      ? {
        sliders: [{ key: 'a', label: 'Spin $a$ (in units of $M$)', min: 0, max: 0.999, step: 0.001, value: a, explain: '$a = J/M$, the angular momentum per unit mass, as a length. Horizons exist only up to $a = M$.' }],
        readouts: [
          { label: 'outer horizon $r_+$', expr: '1 + sqrt(1 - a^2)', unit: 'M', digits: 4 },
          { label: 'inner horizon $r_-$', expr: '1 - sqrt(1 - a^2)', unit: 'M', digits: 4 },
          { label: 'ergosphere edge at the equator', expr: '2', unit: 'M', digits: 3 },
          { label: 'horizon spin rate $\\Omega_H = a/(2Mr_+)$', expr: 'a/(2*(1 + sqrt(1 - a^2)))', unit: 'c^3/GM', digits: 3 },
        ],
      }
      : { constants: { a } }),
    curves: [
      { param: ['sqrt((1 + sqrt(1 - a^2*cos(t)^2))^2 + a^2)*sin(t)', '(1 + sqrt(1 - a^2*cos(t)^2))*cos(t)'], t: [0, 6.2832], color: 'bad', width: 2.4 },
      { param: horizonCurve('+'), t: [0, 6.2832], color: 'ink', width: 3 },
      { param: horizonCurve('-'), t: [0, 6.2832], color: 'ink3', width: 1.4, dash: true },
    ],
    arrows: [{ from: [0, 2.15], to: [0, 2.65], color: 'gold', label: 'spin axis', labelDx: 8, labelDy: 0 }],
    points: [{ x: 'a', y: 0, color: 'violet', r: 4 }, { x: '-a', y: 0, color: 'violet', r: 4 }],
  },
  caption: caption ?? t`A slice through a spinning black hole containing its spin axis (vertical). Thick solid curve: the outer horizon, where $\Delta = 0$; dashed: the inner one; red: the edge of the ergosphere, where $g_{tt} = 0$; violet dots: where the ring singularity $\Sigma = 0$ crosses the slice. Boyer–Lindquist $(r, \theta)$ are drawn as if space were flat — a map of the coordinates, not of true distances.`,
});

// the frame-dragging rate ω = −g_tφ/g_φφ at the equator, with its far-field form 2J/r³
const omegaGraph = (a) => ({
  type: 'graph',
  params: {
    x: [0, 12], y: [0, 0.36], xlabel: 'r / M (equator)', ylabel: 'ω (units of c³/GM)',
    curves: [
      { fn: `2*${a}/(x^3 + ${round(a * a, 6)}*x + ${round(2 * a * a, 6)})`, domain: [round(kerr.rPlus(a), 5), 12], color: 'accent' },
      { fn: `2*${a}/x^3`, domain: [1.6, 12], color: 'ink3', dash: true },
    ],
    vlines: [{ x: round(kerr.rPlus(a), 4), label: 'horizon' }],
  },
  caption: t`How fast a body that has no angular momentum is carried round the spin axis, $\omega = -g_{t\phi}/g_{\phi\phi}$, at the equator of a hole with $a = ${a}M$. Dashed: the far-field form $2J/r^3$, the same for any spinning body.`,
});

// Δ(r) = r² − 2Mr + a² in units of M
const deltaGraph = (chi) => ({
  type: 'graph',
  params: {
    x: [0, 2.6], y: [-0.6, 1.8], xlabel: 'r / M', ylabel: 'Δ / M²',
    curves: [{ fn: `x^2 - 2x + ${round(chi * chi, 6)}`, color: 'accent' }],
    hlines: [{ y: 0 }],
  },
  caption: t`$\Delta = r^2 - 2Mr + a^2$ for a hole with $a = ${chi}M$. Wherever it crosses zero, $g_{rr} = \Sigma/\Delta$ blows up: those radii are the horizons.`,
});

// the two horizons against spin
const horizonsVsSpin = {
  type: 'graph',
  params: {
    x: [0, 1.4], y: [0, 2.25], xlabel: 'spin χ = a/M', ylabel: 'radius / M',
    curves: [
      { fn: '1 + sqrt(1 - x^2)', domain: [0, 1], color: 'ink', width: 2.6, label: 'r₊', labelAt: 0.3, labelDy: -12 },
      { fn: '1 - sqrt(1 - x^2)', domain: [0, 1], color: 'ink3', dash: true, label: 'r₋', labelAt: 0.6, labelDy: 14 },
    ],
    vlines: [{ x: 1, label: 'χ = 1' }],
  },
  caption: 'The roots of Δ = 0 against spin: the outer and inner horizons. They merge at χ = 1; beyond it there is no real root — no horizon at all.',
};

// flat space (M → 0) in Boyer–Lindquist's oblate spheroidal coordinates, a = 1
const oblate = {
  type: 'graph',
  params: {
    x: [-3.4, 3.4], y: [-2.3, 2.3], equal: true, aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [
      ...[0.5, 1, 1.5, 2].map((r) => ({ param: [`${round(Math.sqrt(r * r + 1), 6)}*sin(t)`, `${r}*cos(t)`], t: [0, 6.2832], color: 'ink3', width: 1.4 })),
      { param: ['t', '0'], t: [-1, 1], color: 'accent', width: 4 },
    ],
    points: [
      { x: 1, y: 0, color: 'violet', r: 5, label: 'Σ = 0', labelDx: 8, labelDy: -10 },
      { x: -1, y: 0, color: 'violet', r: 5 },
      { x: 0, y: 0.05, r: 0.01, color: 'accent', label: 'r = 0', labelDx: -16, labelDy: -12 },
    ],
  },
  caption: t`With the mass switched off ($M \to 0$) the Kerr metric is flat space in Boyer–Lindquist coordinates, here in a slice containing the spin axis. Grey: surfaces of constant $r$ = 0.5, 1, 1.5 and 2 (in units of $a$) — flattened spheroids. Blue: $r = 0$, a disk of radius $a$. Violet: its rim.`,
};

export default lesson({
  id: 'gr.EQ.9',
  kind: 'dissection',
  title: 'The Kerr metric',
  minutes: 10, difficulty: 4,
  badges: ['est-der', 'math'],
  equation: t`\begin{aligned} ds^2 = {}&\part{1}{-\left(1 - \frac{2Mr}{\Sigma}\right)dt^2} \part{2}{- \frac{4Mar\sin^2\theta}{\Sigma}\,dt\,d\phi} \part{3}{+ \frac{\Sigma}{\Delta}\,dr^2} \\ &\part{4}{+ \Sigma\,d\theta^2} \part{5}{+ \left(r^2 + a^2 + \frac{2Ma^2r\sin^2\theta}{\Sigma}\right)\sin^2\theta\,d\phi^2} \\[8pt] &\part{6}{\Sigma \equiv r^2 + a^2\cos^2\theta} \qquad \part{7}{\Delta \equiv r^2 - 2Mr + a^2} \qquad \part{8}{a \equiv J/M}\end{aligned}`,
  intro: t`Roy Kerr found this exact solution in 1963: the spacetime around a **spinning** black hole. Every black hole that has settled down after forming — with no electric charge, which astrophysical ones should not keep — is described by it, with just two numbers: its mass $M$ and its angular momentum $J$. It is written here in Boyer–Lindquist coordinates $(t, r, \theta, \phi)$, with the spin axis along $\theta = 0$.

**With $G = c = 1$**: $M$ stands for the length $GM/c^2$ (1.48 km per solar mass), $a$ for $J/(Mc)$, and $t$ for $ct$. Signature $(-,+,+,+)$. Each piece below gets its own card.`,
  parts: [
    {
      tex: KERR_TT, name: 'the time part', badge: 'est-der',
      text: t`$g_{tt} = -(1 - 2Mr/\Sigma)$. Far away it is Schwarzschild's $-(1 - 2M/r)$: clocks low in the well run slow. It **vanishes** where $r^2 - 2Mr + a^2\cos^2\theta = 0$, on the ergosurface $r_E = M + \sqrt{M^2 - a^2\cos^2\theta}$ — at $2M$ on the equator, touching the horizon at the poles.

Inside it, in the **ergosphere**, $g_{tt} > 0$: no observer can stay at rest relative to the distant stars, however hard their rocket pushes — everything must circle with the hole. It is not a horizon: from the ergosphere you can still escape.`,
    },
    {
      tex: KERR_TPHI, name: 'the cross term: frame dragging', badge: 'est-der',
      text: t`The signature of spin: a term that mixes $dt$ with $d\phi$, so the metric changes if you reverse time alone (reversing time also reverses the spin). It is $2g_{t\phi}\,dt\,d\phi$ with $g_{t\phi} = -2Mar\sin^2\theta/\Sigma$.

Its effect is **frame dragging**: a body with zero angular momentum is carried round the spin axis at $\omega = -g_{t\phi}/g_{\phi\phi}$, reaching $\Omega_H = a/(2Mr_+)$ at the horizon — the rate the horizon itself turns. Far away $g_{t\phi} \to -2J\sin^2\theta/r$: the drag of **any** spinning body, which Gravity Probe B measured around the Earth.`,
    },
    {
      tex: t`\frac{\Sigma}{\Delta}\,dr^2`, name: 'the radial part: the horizons', badge: 'est-der',
      text: t`Radial distances, stretched by $\Sigma/\Delta$. Where $\Delta = 0$, $g_{rr}$ blows up — as Schwarzschild's did at $2M$ — and these radii are the **horizons**: $r_\pm = M \pm \sqrt{M^2 - a^2}$. The outer one, $r_+$, is the event horizon; between $M$ and $2M$, depending on spin. As in Schwarzschild, the blow-up is a failure of the coordinates, not a curvature singularity.`,
    },
    {
      tex: t`\Sigma\,d\theta^2`, name: 'the polar part', badge: 'est-der',
      text: t`North–south distances along a line of longitude: $\Sigma = r^2 + a^2\cos^2\theta$ takes the place of Schwarzschild's $r^2$. Because $\Sigma$ depends on $\theta$, spin makes the geometry depend on latitude — the poles and the equator are no longer alike. $\theta$ is measured from the spin axis.`,
    },
    {
      tex: t`\left(r^2 + a^2 + \frac{2Ma^2r\sin^2\theta}{\Sigma}\right)\sin^2\theta\,d\phi^2`, name: 'the azimuthal part', badge: 'est-der',
      text: t`Distances around the spin axis: a circle at fixed $r$ and $\theta$ has circumference $2\pi\sqrt{g_{\phi\phi}}$, which on the equator is larger than $2\pi r$. So Boyer–Lindquist $r$ is **not** the areal radius of Schwarzschild's metric.

With the mass switched off ($M \to 0$) it becomes $(r^2 + a^2)\sin^2\theta$: flat space in flattened-sphere (oblate spheroidal) coordinates — the clue to what $r$ means.`,
      more: t`An equivalent form, often quoted: $g_{\phi\phi} = \dfrac{(r^2 + a^2)^2 - a^2\Delta\sin^2\theta}{\Sigma}\,\sin^2\theta$. Expand it and it is the same.`,
    },
    {
      tex: t`\Sigma \equiv r^2 + a^2\cos^2\theta`, name: 'Σ: where the ring singularity is', badge: 'math',
      text: t`$\Sigma$ is zero only where $r = 0$ **and** $\theta = 90^\circ$. In these coordinates $r = 0$ is not a point but a disk of radius $a$, and $\Sigma = 0$ is its rim: a **ring singularity**, where the curvature becomes infinite.

It lies inside the inner horizon, in a region the equations allow but which is expected to be unstable — real black holes formed by collapse probably do not contain it in this form. Badge: mathematically allowed, unobserved.`,
    },
    {
      tex: t`\Delta \equiv r^2 - 2Mr + a^2`, name: 'Δ: where the horizons are', badge: 'est-der',
      text: t`A quadratic in $r$ whose two roots are the horizons, $r_\pm = M \pm \sqrt{M^2 - a^2}$. For $a = 0$ it is $r(r - 2M)$: the single horizon at $2M$. Real roots need $a \le M$; for $a > M$, $\Delta$ is positive everywhere and there is **no horizon**.

The inner horizon $r_-$ is a mathematical feature of this exact solution; small disturbances are expected to destroy it in real black holes — an open question tied to cosmic censorship.`,
    },
    {
      tex: t`a \equiv J/M`, name: 'the spin', badge: 'est-obs', units: t`$\text{m}$ (as $J/(Mc)$)`,
      text: t`The angular momentum per unit mass, as a length: $a = J/(Mc)$ in SI. Its ratio to the mass length, $\chi = a/M = cJ/(GM^2)$, is the dimensionless **spin**, between 0 and 1 for a black hole. At $\chi = 1$ (extremal) the two horizons merge at $r = M$.

Spins are measured — from gravitational waves and from X-rays reflected off accretion disks. Some black holes seen merging by LIGO, Virgo and KAGRA are estimated to spin at $\chi \approx 0.8$–$0.9$ (GW231123, reported in 2025). None has been found above 1: a "naked" singularity is allowed on paper, never seen.`,
    },
  ],
  readAloud: t`Around a spinning black hole, spacetime is Schwarzschild's reshaped by the spin length $a = J/M$: a cross term drags everything round with the hole, $\Delta$ vanishes at the two horizons, the time part vanishes at the edge of the ergosphere, and $\Sigma$ vanishes on a ring.`,
  why: t`Every astrophysical black hole spins. This metric predicts its horizon size, its ergosphere, how it drags orbits and jets, its innermost stable orbit and the ringdown frequencies LIGO checks.`,
  visual: {
    title: 'A spinning black hole’s surfaces',
    lead: t`A slice through a spinning hole, spin axis vertical. The thick solid curve is the event horizon ($\Delta = 0$), dashed the inner horizon, red the edge of the ergosphere ($g_{tt} = 0$), violet the ring singularity ($\Sigma = 0$). Slide the spin from 0 toward its limit.`,
    tasks: [
      'At a = 0 the red curve and the solid horizon coincide at 2M and the ring shrinks to a point: Schwarzschild.',
      'Raise the spin: the horizon shrinks toward M, and the ergosphere — between the solid horizon and the red curve — opens up at the equator but still closes at the poles.',
      'Near a = M the inner and outer horizons approach each other and merge. Beyond, Δ = 0 has no solution.',
    ],
    ...kerrSlice({ a: 0.7, slider: true }),
  },
  practice: [
    mcq({
      id: 'drag-term', difficulty: 1,
      prompt: t`$$ds^2 = ${KERR_TT}\;\underbrace{${KERR_TPHI}}_{\text{?}} + \frac{\Sigma}{\Delta}\,dr^2 + \dots$$ What does the marked term do?`,
      choices: [
        t`It drags frames: a body with no angular momentum is carried round the spin axis, at $\omega = -g_{t\phi}/g_{\phi\phi}$`,
        'It makes clocks near the hole run slow',
        'It stretches radial distances near the horizons',
        'It is the centrifugal force of the spinning hole, pushing matter outward',
      ],
      answer: 0,
      why: {
        1: t`Clock rates come from the $dt^2$ term, $g_{tt}$.`,
        2: t`Radial stretch is the $dr^2$ term, $\Sigma/\Delta$.`,
        3: 'There is no force here, and the effect is a sideways carrying-round, not an outward push.',
      },
      hints: [t`The term mixes $dt$ with $d\phi$ — time with the angle around the spin axis.`],
      teach: 'The dt dφ cross term is spin’s signature in the metric: it drags local frames around the spin axis.',
      explain: t`A term in $dt\,d\phi$ links the passage of time with motion around the axis. A body released with zero angular momentum therefore circles at $d\phi/dt = \omega = -g_{t\phi}/g_{\phi\phi}$ — frame dragging, strongest at the horizon and fading as $2J/r^3$ far away.`,
      visual: omegaGraph(0.9),
    }),
    mcq({
      id: 'limit-a0', difficulty: 2,
      prompt: t`Set the spin to zero, $a = 0$, in the Kerr metric. What do you get?`,
      choices: [
        t`The Schwarzschild metric: $\Sigma \to r^2$, $\Delta \to r^2 - 2Mr$, the cross term vanishes and $g_{\phi\phi} \to r^2\sin^2\theta$`,
        'Flat spacetime: without spin there is no black hole',
        'Nothing sensible: the Kerr metric describes only spinning holes',
        'A ring singularity of zero radius, still surrounded by an ergosphere',
      ],
      answer: 0,
      why: {
        1: t`Switching off $M$, not $a$, gives flat spacetime. With $M$ kept, a non-spinning black hole remains.`,
        2: t`Kerr contains Schwarzschild as the special case $a = 0$; every term has a smooth limit.`,
        3: t`With $a = 0$ the ergosurface $r_E = M + \sqrt{M^2}$ coincides with the horizon at $2M$: no ergosphere is left.`,
      },
      hints: [t`Put $a = 0$ into $\Sigma$, $\Delta$ and each term one at a time.`],
      teach: 'The Kerr metric reduces to Schwarzschild when the spin is zero — a check that every term has the right meaning.',
      explain: t`With $a = 0$: $-(1 - 2M/r)\,dt^2 + \dfrac{dr^2}{1 - 2M/r} + r^2(d\theta^2 + \sin^2\theta\,d\phi^2)$ — Schwarzschild with $G = c = 1$. The horizon sits at $2M$ and the ring singularity collapses to the point $r = 0$.`,
      visual: kerrSlice({ a: 0.15, caption: t`A hole spinning very slowly ($a = 0.15M$): the horizon (thick solid curve) and the ergosphere's edge (red) nearly coincide, and the ring (violet) has almost shrunk to a point. Boyer–Lindquist coordinates drawn as if space were flat.` }),
    }),
    num({
      id: 'inner-horizon', difficulty: 2,
      gen(r) {
        const chi = r.pick([0.5, 0.8, 0.9, 0.99]);
        const rm = kerr.rMinus(chi);
        return {
          prompt: t`$\Delta = r^2 - 2Mr + a^2$ vanishes at two radii. For a hole with $a = ${chi}M$, find the smaller root — the inner horizon $r_-$ — in units of $M$.`,
          answer: rm, tol: { rel: 0.005 },
          errors: [{ value: kerr.rPlus(chi), feedback: 'That is the larger root, the outer (event) horizon r₊. The inner one takes the minus sign.' }, { value: 1 - (1 - chi * chi), feedback: 'Take the square root: r₋ = M − √(M² − a²).' }],
          hints: [t`Solve $r^2 - 2r + ${round(chi * chi, 6)} = 0$ (in units of $M$) with the quadratic formula.`, t`$r_\pm = 1 \pm \sqrt{1 - ${round(chi * chi, 6)}}$.`],
          teach: 'The horizons of a Kerr black hole are the roots of Δ: r± = M ± √(M² − a²).',
          explain: t`$r_- = 1 - \sqrt{1 - ${round(chi * chi, 6)}} = ${fmt(rm, 4)}\,M$ (and $r_+ = ${fmt(kerr.rPlus(chi), 4)}\,M$). The region inside $r_-$ is mathematically allowed but expected to be unstable in real black holes.`,
          visual: deltaGraph(chi),
        };
      },
    }),
    num({
      id: 'sun-spin', difficulty: 2,
      prompt: t`The Sun's angular momentum is about $J = 1.92\times10^{41}\ \text{kg m}^2/\text{s}$ (from helioseismology) and its mass $M = 1.989\times10^{30}$ kg. If it were somehow squeezed into a black hole without losing any spin, what would its dimensionless spin $\chi = cJ/(GM^2)$ be? Could it form a horizon?`,
      answer: (C * 1.92e41) / (G * M_SUN ** 2), tol: { rel: 0.02 },
      errors: [{ value: 1.92e41 / (M_SUN * C), feedback: 'That is a = J/(Mc) in metres. Divide by GM/c² = 1477 m to make it dimensionless.' }, { value: 1.92e41 / (G * M_SUN ** 2), feedback: 'Multiply by c: χ = cJ/(GM²).' }],
      hints: [t`$GM^2 = 6.674\times10^{-11}\times(1.989\times10^{30})^2$.`, t`Or: $a = J/(Mc) = ${sci(1.92e41 / (M_SUN * C), 3)}$ m and $GM/c^2 = 1477$ m; divide.`],
      teach: 'χ = cJ/(GM²) compares a body’s spin with the most a black hole of its mass can hold; horizons need χ ≤ 1.',
      explain: t`$\chi = ${sci((C * 1.92e41) / (G * M_SUN ** 2), 3)}$, comfortably below 1: the Sun's spin would fit inside a Kerr horizon. (The Earth, by contrast, has $\chi \approx 740$ — it would have to shed almost all its spin first.) Stars that do collapse spin up as they shrink, which is why newborn black holes can spin fast.`,
      visual: horizonsVsSpin,
    }),
    mcq({
      id: 'ergosurface', difficulty: 3,
      prompt: t`At the outer boundary of the ergosphere, which piece of the metric vanishes — and what follows inside it?`,
      choices: [
        t`The time part, $g_{tt} = -(1 - 2Mr/\Sigma)$: inside, no observer can stay at rest relative to the distant stars, though escape is still possible`,
        t`$\Delta$: it is the event horizon, from inside which nothing escapes`,
        t`$\Sigma$: there the curvature becomes infinite`,
        t`The cross term $g_{t\phi}$: frame dragging stops there`,
      ],
      answer: 0,
      why: {
        1: t`$\Delta = 0$ is the horizon $r_+$, which lies inside the ergosphere's edge everywhere except at the poles.`,
        2: t`$\Sigma = 0$ only on the ring at $r = 0$, deep inside the horizons.`,
        3: t`$g_{t\phi}$ is largest near the hole, not zero; it is what forces everything inside the ergosphere to co-rotate.`,
      },
      hints: [t`An observer at rest has $dr = d\theta = d\phi = 0$, so $ds^2 = g_{tt}\,dt^2$. For a real clock $ds^2$ must be negative.`, t`Where does $g_{tt}$ change sign?`],
      teach: t`The ergosphere’s edge is where $g_{tt} = 0$: inside, staying still is impossible, but leaving is not.`,
      explain: t`A clock at rest needs $ds^2 = g_{tt}\,dt^2 < 0$. Where $g_{tt} > 0$ that is impossible, so everything inside $r_E = M + \sqrt{M^2 - a^2\cos^2\theta}$ must move round with the hole. The horizon, where escape becomes impossible, is the smaller surface $\Delta = 0$.`,
      visual: kerrSlice({ a: 0.7, caption: t`A hole with $a = 0.7M$, spin axis vertical. Thick solid curve: the surface where $\Delta = 0$; dashed: the inner root; red: the outer boundary of the ergosphere. Boyer–Lindquist coordinates drawn as if space were flat.` }),
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-ring', difficulty: 2,
      prompt: t`Where is $\Sigma = r^2 + a^2\cos^2\theta$ zero, and what is there?`,
      choices: [
        t`Only where $r = 0$ and $\theta = 90^\circ$: the rim of the disk $r = 0$ — a ring singularity, inside the inner horizon`,
        t`At the point $r = 0$, as in Schwarzschild`,
        t`On the event horizon`,
        t`Along the spin axis, $\theta = 0$`,
      ],
      answer: 0,
      why: {
        1: t`With $a \neq 0$, $\Sigma = a^2\cos^2\theta$ at $r = 0$, which is zero only at $\theta = 90^\circ$. In these coordinates $r = 0$ is a whole disk, not a point.`,
        2: t`On the horizon $r = r_+ > 0$, so $\Sigma \ge r_+^2 > 0$.`,
        3: t`On the axis $\cos^2\theta = 1$, so $\Sigma = r^2 + a^2 > 0$.`,
      },
      hints: [t`$\Sigma$ is a sum of two squares. When is such a sum zero?`],
      teach: 'Σ vanishes only on a ring — the rim of the disk r = 0 — so a spinning black hole’s singularity is a ring, not a point.',
      explain: t`$r^2 + a^2\cos^2\theta = 0$ needs both $r = 0$ and $\cos\theta = 0$. Boyer–Lindquist $r = 0$ is a disk of radius $a$, and $\Sigma = 0$ on its edge: the ring singularity. It is hidden inside both horizons and belongs to the part of the solution that is mathematically allowed but expected to be unstable.`,
      visual: oblate,
    }),
    num({
      id: 'cp-m87', difficulty: 3, transfer: true,
      gen(r) {
        const chi = r.pick([0.6, 0.9, 0.99]);
        const [name, m] = r.pick([['M87*, the black hole imaged by the Event Horizon Telescope in 2019 (6.5 billion solar masses)', 6.5e9], ['Sagittarius A*, at the centre of the Milky Way (4.30 million solar masses)', 4.30e6]]);
        const Mlen = m * mLen(M_SUN), thick = (2 - kerr.rPlus(chi)) * Mlen;
        return {
          prompt: t`Suppose ${name} spins at $\chi = ${chi}$ (its spin is not yet measured precisely). How thick is its ergosphere at the equator — from the event horizon $r_+ = M(1 + \sqrt{1 - \chi^2})$ out to the ergosphere's edge at $2M$ — in km? ($GM_\odot/c^2 = 1476.6$ m)`,
          answer: thick / 1e3, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: (2 * Mlen) / 1e3, feedback: 'That is the ergosphere’s outer radius, 2GM/c². Subtract the horizon radius r₊.' }, { value: (kerr.rPlus(chi) * Mlen) / 1e3, feedback: 'That is the horizon radius r₊. The thickness is 2M − r₊.' }],
          hints: [t`$GM/c^2 = ${sci(m, 3)}\times1476.6\ \text{m} = ${sci(Mlen, 4)}$ m.`, t`Thickness $= (2 - r_+/M)\,GM/c^2$, with $r_+/M = ${fmt(kerr.rPlus(chi), 4)}$.`],
          teach: 'The ergosphere of a fast-spinning supermassive black hole is enormous — the region where jets are thought to draw on the hole’s spin.',
          explain: t`$r_+ = ${fmt(kerr.rPlus(chi), 4)}M$, so the thickness is $${fmt(2 - kerr.rPlus(chi), 4)}\times${sci(Mlen, 4)}$ m $= ${sci(thick / 1e3, 3)}$ km $= ${sci(thick / AU, 3)}$ AU. Energy can be extracted from this region (the Penrose process and, with magnetic fields, the Blandford–Znajek process thought to power jets like M87*'s).`,
          visual: kerrSlice({ a: chi, caption: t`A hole spinning at $\chi = ${chi}$: the ergosphere is the region between the solid horizon and the red edge, thickest at the equator. Boyer–Lindquist coordinates drawn as if space were flat.` }),
        };
      },
    }),
    mcq({
      id: 'cp-far', difficulty: 2,
      prompt: t`Far from the hole, the cross term becomes $-\dfrac{4J\sin^2\theta}{r}\,dt\,d\phi$, with no sign of a horizon in it. What does that tell you?`,
      choices: [
        'Any spinning body — planet, star or black hole — drags frames far away in the same way, set only by its angular momentum J',
        'Frame dragging happens only near black holes',
        'Far away the metric is exactly Schwarzschild, with no trace of the spin',
        'The cross term grows with distance, so frame dragging is strongest far away',
      ],
      answer: 0,
      why: {
        1: 'Gravity Probe B measured the Earth’s frame dragging — the same far-field term, with Earth’s J.',
        2: t`The trace is small but present: $g_{t\phi}$ falls off only as $1/r$.`,
        3: t`$1/r$ decreases with distance; the dragging rate $\omega$ falls as $2J/r^3$.`,
      },
      hints: [t`Which properties of the body appear in $-4J\sin^2\theta/r$?`],
      teach: 'Far from any spinning mass, frame dragging depends only on its angular momentum: the same law for the Earth and for a black hole.',
      explain: t`Only $J$ appears, so the far field cannot tell a spinning planet from a spinning black hole. Around Earth it was measured by Gravity Probe B: $37.2 \pm 7.2$ milliarcseconds per year of gyroscope drift, against $39.2$ predicted. Close to a black hole the full $\Sigma$, $\Delta$ structure takes over.`,
      visual: omegaGraph(0.9),
    }),
  ],
  sources: [
    { label: 'Kerr, “Gravitational field of a spinning mass…”, Phys. Rev. Lett. 11, 237 (1963)', url: 'https://doi.org/10.1103/PhysRevLett.11.237' },
    { label: 'Carroll, Spacetime and Geometry, §6.6 (rotating black holes)', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Visser, “The Kerr spacetime: a brief introduction” (2007)', url: 'https://arxiv.org/abs/0706.0622' },
    { label: 'Everitt et al., Gravity Probe B final results (2011)', url: 'https://arxiv.org/abs/1105.3456' },
  ],
});
