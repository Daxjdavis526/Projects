// Conics in polar form, r = p/(1 + e cos θ) with the focus at the pole, and
// Kepler's first law: orbits are conics with the Sun at a focus.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';

const t = String.raw;

const polar = (x, y, params, caption) => ({ type: 'calc-polar', params: { grid: 'polar', aspect: 'wide', x, y, ...params }, caption });
const round = (v, d = 4) => +v.toFixed(d);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
// n/d as TeX, reduced: 6/4 → \tfrac{3}{2}, 4/2 → 2
const fracTeX = (n, d) => { const g = gcd(n, d), a = n / g, b = d / g; return b === 1 ? `${a}` : t`\tfrac{${a}}{${b}}`; };

const ORBIT = ['e', 1];
const RE = 6371;   // Earth's mean radius, km

export default lesson({
  id: 'math1220.C2-6.6',
  title: 'Conics in polar form and Kepler’s first law',
  minutes: 11, difficulty: 3,
  intro: t`Put the focus at the pole and the directrix on the vertical line $x = d$. A point at distance $r$ in direction $\theta$ has $PF = r$ and $PD = d - r\cos\theta$, so $PF = e\cdot PD$ becomes $r = e(d - r\cos\theta)$. Solve for $r$:

$$r = \frac{p}{1 + e\cos\theta}, \qquad p = ed$$

This is exactly the path that Newton’s inverse-square gravity produces. Every planet moves on such an ellipse with the Sun at the pole — **Kepler’s first law** — while a body with $e \ge 1$ swings past the Sun once and leaves.`,
  symbols: [
    { tex: 'r', text: 'the distance from the focus (the Sun) to the body, in AU or km' },
    { tex: '\\theta', text: 'the angle from the direction of closest approach (astronomers call it the *true anomaly*), in radians' },
    { tex: 'e', text: 'the **eccentricity**: Earth $0.0167$, Mercury $0.2056$, Halley’s comet $0.967$; $e \\ge 1$ means the body does not return' },
    { tex: 'p', text: 'the **semi-latus rectum**: the distance $r$ when $\\theta = \\pm 90^\\circ$. For an ellipse $p = a(1 - e^2)$' },
    { tex: 'd', text: 'the distance from the focus to the directrix. (OpenStax writes the numerator as $ep$ with its $p$ meaning this $d$ — watch the letters.)' },
  ],
  why: t`Kepler found the ellipses in Tycho Brahe’s measurements of Mars (1609); Newton derived them from the inverse-square law (1687). General relativity adds a slow turning of the ellipse — Mercury’s perihelion advances an extra 43″ per century — which this formula leaves out.`,
  visual: {
    type: 'calc-polar',
    title: 'One equation, every orbit',
    lead: t`The curve is $r = 1/(1 + e\cos\theta)$, with the Sun at the pole. In **Focus and directrix** view the gold ray picks a point $P$; its distance to the Sun and to the directrix (teal) are always in the ratio $e$. In **Equal times** view, the coloured sectors are swept in equal times — Kepler’s second law.`,
    tasks: [
      t`Choose **Any e** and slide $e$ up from $0$: circle, then ellipses, then at $e = 1$ the far end opens into a parabola, and beyond it a hyperbola. The readout $PF/PD$ always equals $e$.`,
      t`Choose **Halley’s comet**, switch to **Equal times** and press Play: the twelve sectors have equal areas, so the comet whips round the Sun and crawls at the far end.`,
      t`Choose **ʻOumuamua** ($e \approx 1.20$): a hyperbola. It arrived from interstellar space in 2017, swung past the Sun, and left for good.`,
    ],
    params: {
      grid: 'polar', aspect: 'wide', x: [-4.6, 2.4], y: [-2.6, 2.6], rstep: 1,
      presetLabel: 'Orbit',
      presets: [
        { label: 'Any e', x: [-4.6, 2.4], y: [-2.6, 2.6], rstep: 1 },
        { label: 'Earth', set: { e: 0.0167 }, x: [-1.9, 1.9], y: [-1.25, 1.25], rstep: 0.5 },
        { label: 'Mercury', set: { e: 0.2056 }, x: [-2, 1.6], y: [-1.35, 1.35], rstep: 0.5 },
        { label: 'Halley’s comet', set: { e: 0.967 }, x: [-32, 3], y: [-7, 7], rstep: 5 },
        { label: 'ʻOumuamua', set: { e: 1.2 }, x: [-4.6, 2.4], y: [-2.8, 2.8], rstep: 1 },
      ],
      choices: [{ key: 'mode', label: 'Show', options: [[0, 'Focus and directrix'], [1, 'Equal times (Kepler’s second law)']], value: 0 }],
      sliders: [
        { key: 'e', label: 'Eccentricity $e$', min: 0, max: 1.6, step: 0.0001, value: 0.6, explain: t`$0$ circle, below $1$ ellipse, $1$ parabola, above $1$ hyperbola.` },
        { key: 'th', label: 'Angle $\\theta$ of $P$', min: -3.1, max: 3.1, step: 0.01, value: 1.2, unit: t`\text{rad}`, explain: 'Measured from the direction of closest approach (perihelion).' },
        { key: 'tau', label: 'Time since perihelion', min: 0, max: 1, step: 0.005, value: 0.3, unit: t`\times T`, explain: 'In Equal times view: the fraction of one orbital period T. Play runs it.' },
      ],
      curves: [{ conic: ORBIT, color: 'accent', width: 2.6 }],
      vlines: [{ x: '1/e', color: 'teal', label: 'directrix', when: 'e*max(0, 1 - mode)' }],
      rays: [{ conic: ORBIT, at: 'th', when: '1 - mode', label: 'P' }],
      segments: [{ from: ['rx', 'ry'], to: ['1/e', 'ry'], color: 'teal', width: 1.8, dash: true, when: 'e*max(0, 1 - mode)' }],
      kepler: { e: 'e', p: 1, n: 12, at: 'tau', play: true, when: 'mode' },
      points: [{ x: 0, y: 0, color: 'gold', size: 7, label: 'Sun', labelDx: 8, labelDy: 14 }],
      readouts: [
        { label: 'shape', classify: 'e' },
        { label: t`perihelion $q = \tfrac{p}{1 + e}$`, expr: '1/(1 + e)', digits: 4 },
        { label: t`aphelion $Q = \tfrac{p}{1 - e}$`, expr: '1/(1 - e) + 0*sqrt(1 - e)', digits: 4 },
        { label: t`$PF/PD$`, expr: 'abs(rr)/(1/e - rx)', digits: 4 },
      ],
    },
    caption: t`Every orbit is drawn with $p = 1$, so only its shape changes (rings 1 apart, Halley: 5). The orbits are Newtonian two-body ellipses; real ones are nudged by the other planets and, slightly, by relativity. Equal-time sectors need a closed orbit, so they are shown only for $e < 1$.`,
  },
  example: {
    prompt: t`Halley’s comet comes within $q = 0.586$ AU of the Sun, and its orbit has $e = 0.967$. Find $p$, its farthest distance $Q$ and the semi-major axis $a$.`,
    visual: polar([-37, 4], [-8, 8], {
      rstep: 10, angles: 'none',
      curves: [{ conic: [0.967, 1.152662], color: 'accent' }, { polar: '30.07', theta: [0, '2*pi'], color: 'violet', width: 1.3, dash: true }, { polar: '1', theta: [0, '2*pi'], color: 'teal', width: 1.4 }],
      points: [{ x: 0, y: 0, color: 'gold', size: 6 }, { x: -34.93, y: 0, color: 'accent2', label: 'aphelion', labelDx: -20, labelDy: -12 }],
      texts: [{ text: 'Neptune’s orbit', x: -20, y: 6.6, color: 'violet', size: 11.5 }, { text: 'Sun, Earth’s orbit', x: 1.5, y: -2.4, color: 'teal', size: 11.5 }],
    }, t`Halley’s orbit to scale (AU), with Earth’s orbit (teal, radius 1) and Neptune’s (violet dashed, radius 30.07).`),
    steps: [
      { label: 'Perihelion is θ = 0', text: t`$r(0) = \dfrac{p}{1 + e} = q$, so $p = q(1 + e) = 0.586 \times 1.967 = 1.153$ AU.` },
      { label: 'Aphelion is θ = π', text: t`$Q = r(\pi) = \dfrac{p}{1 - e} = \dfrac{1.153}{0.033} \approx 34.9$ AU.` },
      { label: 'Semi-major axis', text: t`The long axis runs from perihelion to aphelion, so $a = \tfrac12(q + Q) \approx 17.8$ AU — the same as $p/(1 - e^2)$.` },
      { label: 'Sense check', text: t`$Q$ lies beyond Neptune’s orbit (30.1 AU), as observed. Kepler’s third law (period in years $= a^{3/2}$ with $a$ in AU) gives $17.76^{3/2} \approx 75$ years — Halley returned in 1910 and 1986 and is due in 2061 ✓. (With the more precise $e = 0.96714$, $Q = 35.1$ AU.)` },
    ],
    answer: t`$p \approx 1.153$ AU, $Q \approx 34.9$ AU, $a \approx 17.8$ AU.`,
  },
  practice: [
    mcq({
      id: 'classify-polar', difficulty: 2,
      gen(r) {
        const [A, B, N] = r.pick([[1, 2, 4], [3, 3, 6], [4, 2, 8], [2, 5, 10], [5, 3, 10], [2, 1, 6]]);
        const e = B / A, p = N / A, d = N / B;
        const type = e > 1 ? 'hyperbola' : e < 1 ? 'ellipse' : 'parabola';
        const choices = ['an ellipse', 'a parabola', 'a hyperbola', 'a circle'];
        const answer = ['ellipse', 'parabola', 'hyperbola'].indexOf(type);
        const why = {
          0: t`An ellipse needs $e < 1$. Write the equation as $\dfrac{p}{1 + e\cos\theta}$ first: here $e = ${nice(e)}$.`,
          1: t`A parabola needs $e = 1$; here $e = ${nice(e)}$ once the constant in the denominator is made $1$.`,
          2: B > 1 && e <= 1 ? t`$${B}$ is not $e$: divide top and bottom by ${A} so the denominator starts with $1$. Then $e = ${fracTeX(B, A)}$.` : t`A hyperbola needs $e > 1$; here $e = ${nice(e)}$.`,
          3: t`A circle has $e = 0$: no $\cos\theta$ term at all.`,
        };
        delete why[answer];
        return {
          prompt: t`Which conic is $r = \dfrac{${N}}{${A} + ${B === 1 ? '' : B}\cos\theta}$?`,
          visual: polar([-d - 1.5, d + 2.2], [-1.2, p + 1.2], {
            rstep: 1,
            vlines: [{ x: d, color: 'teal', label: 'directrix' }],
            points: [{ x: 0, y: 0, color: 'gold', label: 'F', labelDy: 14 }, { x: 0, y: p, color: 'ink', label: 'P' }],
            segments: [{ from: [0, 0], to: [0, p], color: 'violet', label: `PF = ${nice(p)}`, labelDx: 6, labelDy: 0 }, { from: [0, p], to: [d, p], color: 'teal', dash: true, label: `PD = ${nice(d)}`, labelDx: -20, labelDy: -10 }],
          }, t`The focus at the pole, the directrix, and the point of the curve at $\theta = 90^\circ$.`),
          choices, answer, why,
          hints: [t`Divide numerator and denominator by ${A} so the denominator reads $1 + e\cos\theta$.`, t`Then $e$ is the coefficient of $\cos\theta$ — or measure it in the picture: $e = PF/PD$.`],
          teach: 'Make the constant term of the denominator 1; the coefficient of cos θ is then the eccentricity.',
          explain: t`$r = \dfrac{${nice(p)}}{1 + ${nice(e)}\cos\theta}$, so $e = ${nice(e)}$: ${choices[answer]}. (Check: $PF/PD = ${nice(p)}/${nice(d)} = ${nice(e)}$.)`,
        };
      },
    }),
    num({
      id: 'perihelion', difficulty: 2,
      gen(r) {
        const p = r.pick([2, 3, 5, 8]), e = r.pick([0.25, 0.5, 0.6, 0.8]), q = p / (1 + e), Q = p / (1 - e);
        return {
          prompt: t`An orbit is $r = \dfrac{${p}}{1 + ${e}\cos\theta}$ (in AU), with the Sun at the pole. How close does the body come to the Sun? Give 3 significant figures.`,
          visual: polar([-1.08 * Q, 1.5 * q], [-0.75 * Q, 0.75 * Q], { rstep: Q > 12 ? 5 : Q > 5 ? 2 : 1, angles: 'none', curves: [{ conic: [e, p], color: 'accent' }], points: [{ x: 0, y: 0, color: 'gold', size: 6, label: 'Sun', labelDy: 14 }, { x: round(q), y: 0, color: 'accent2', label: 'closest', labelDy: -12 }] }, 'The orbit, with the Sun at the pole and the closest point marked.'),
          answer: q, units: 'AU', tol: { rel: 0.005 },
          errors: [{ value: Q, feedback: t`That is the **farthest** distance, at $\theta = \pi$ where $\cos\theta = -1$. The closest is at $\theta = 0$.` }, { value: p, feedback: t`That is $r$ at $\theta = 90^\circ$. The closest point is at $\theta = 0$, where the denominator is largest.` }],
          hints: [t`$r$ is smallest where the denominator $1 + ${e}\cos\theta$ is largest.`, t`That is $\theta = 0$: $r = \dfrac{${p}}{1 + ${e}}$.`],
          teach: 'For r = p/(1 + e cos θ), perihelion is at θ = 0 (q = p/(1 + e)) and aphelion at θ = π (Q = p/(1 − e)).',
          explain: t`At $\theta = 0$: $q = \dfrac{${p}}{${1 + e}} \approx ${fmt(q)}$ AU. (The farthest point, at $\theta = \pi$, is $${fmt(Q)}$ AU.)`,
        };
      },
    }),
    expr({
      id: 'write-polar', difficulty: 3,
      gen(r) {
        const [en, ed] = r.pick([[1, 2], [2, 3], [1, 1], [3, 2], [2, 1]]), d = r.pick([2, 3, 4, 6]);
        const e = en / ed, p = e * d, eT = fracTeX(en, ed), pT = fracTeX(en * d, ed);
        const errors = [{ answer: `(${en * d}/${ed})/(1 - (${en}/${ed})*cos(theta))`, feedback: t`With the directrix to the **right** of the focus, $PD = d - r\cos\theta$, which gives a plus sign: $1 + e\cos\theta$.` }];
        if (en !== ed) errors.push({ answer: `${d}/(1 + (${en}/${ed})*cos(theta))`, feedback: t`The numerator is $p = ed$, not $d$: from $r = e(d - r\cos\theta)$, $r(1 + e\cos\theta) = ed$.` });
        const Rt = (th) => p / (1 + e * Math.cos(th));
        const th0 = 1.1, P = [Rt(th0) * Math.cos(th0), Rt(th0) * Math.sin(th0)];
        return {
          prompt: t`A conic has its focus at the pole, its directrix on the line $x = ${d}$, and eccentricity $e = ${eT}$. Write its polar equation, $r$ in terms of $\theta$.`,
          visual: polar([-Math.min(3.2 * d, 12), d + 1.5], [-0.62 * Math.min(3.2 * d, 12) - 1, 0.62 * Math.min(3.2 * d, 12) + 1], {
            rstep: d > 3 ? 2 : 1, angles: 'none',
            curves: [{ conic: [round(e, 6), round(p, 6)], color: 'accent' }],
            vlines: [{ x: d, color: 'teal', label: `x = ${d}` }],
            points: [{ x: 0, y: 0, color: 'gold', label: 'F', labelDy: 14 }, { x: round(P[0]), y: round(P[1]), color: 'ink', label: 'P' }],
            segments: [{ from: [0, 0], to: [round(P[0]), round(P[1])], color: 'violet' }, { from: [round(P[0]), round(P[1])], to: [d, round(P[1])], color: 'teal', dash: true }],
          }, t`The conic, its focus and directrix, and one point with its two distances ($PF = e\cdot PD$).`),
          answer: `(${en * d}/${ed})/(1 + (${en}/${ed})*cos(theta))`,
          answerTeX: t`r = \dfrac{${pT}}{1 + ${eT}\cos\theta}`, lhs: 'r',
          vars: { theta: [-1, 1] },
          errors,
          hints: [t`For a point $(r, \theta)$: $PF = r$ and $PD = ${d} - r\cos\theta$.`, t`Set $r = ${eT}\,(${d} - r\cos\theta)$ and solve for $r$.`],
          teach: 'With the focus at the pole and the directrix x = d, PF = e·PD gives r = ed/(1 + e cos θ).',
          explain: t`$r = e(d - r\cos\theta) \Rightarrow r(1 + e\cos\theta) = ed$, so $r = \dfrac{${pT}}{1 + ${eT}\cos\theta}$ — ${e < 1 ? 'an ellipse' : e === 1 ? 'a parabola' : 'a hyperbola'}.`,
        };
      },
    }),
    num({
      id: 'perigee-altitude', difficulty: 2,
      gen(r) {
        const [P, E] = r.pick([[7700, 0.1], [8000, 0.15], [7500, 0.05], [9000, 0.2]]), q = P / (1 + E), h = q - RE;
        const Q = P / (1 - E), S = 1 / 1000;
        return {
          prompt: t`A satellite’s orbit about the Earth’s centre is $r = \dfrac{${P}}{1 + ${E}\cos\theta}$ km. The Earth’s radius is ${RE} km. How high above the ground is the satellite at its lowest point (perigee)? Give 3 significant figures.`,
          visual: polar([-1.12 * Q * S, 1.3 * q * S], [-0.8 * Q * S, 0.8 * Q * S], {
            rstep: 2, angles: 'none',
            curves: [{ conic: [E, P * S], color: 'accent' }, { polar: `${RE * S}`, theta: [0, '2*pi'], color: 'teal', width: 2 }],
            segments: [{ from: [RE * S, 0], to: [round(q * S), 0], color: 'gold', width: 3, label: 'altitude', labelDx: -10, labelDy: -12 }],
          }, 'The orbit around the Earth (teal), in thousands of km, to scale. The gold stretch is the perigee altitude.'),
          answer: h, units: 'km', tol: { rel: 0.005 },
          errors: [{ value: q, feedback: 'That is the distance from the Earth’s centre. Altitude is measured from the ground: subtract the Earth’s radius.' }, { value: P - RE, feedback: t`At perigee $\theta = 0$, so $r = \dfrac{${P}}{1 + ${E}}$, not ${P}.` }],
          hints: [t`Perigee is at $\theta = 0$: $r = \dfrac{${P}}{1 + ${E}}$.`, 'Altitude = r − (Earth’s radius).'],
          teach: 'Orbits are measured from the centre of the attracting body; altitude is that distance minus the planet’s radius.',
          explain: t`$r_p = \dfrac{${P}}{${1 + E}} \approx ${fmt(q, 4)}$ km, so the altitude is $${fmt(q, 4)} - ${RE} \approx ${fmt(h)}$ km.`,
        };
      },
    }),
    num({
      id: 'escape-direction', difficulty: 3,
      gen(r) {
        const [name, E] = r.pick([['1I/ʻOumuamua, the first known interstellar object,', 1.2], ['2I/Borisov, an interstellar comet,', 3.36], ['A spacecraft on a hyperbolic flyby', 2]]);
        const thInf = Math.acos(-1 / E), deg = (thInf * 180) / Math.PI;
        return {
          prompt: t`${name} follows the hyperbola $r = \dfrac{p}{1 + ${E}\cos\theta}$ round the Sun. As it recedes, its direction from the Sun approaches the angle $\theta_\infty$ at which $r$ becomes infinite. Find $\theta_\infty$, in degrees, between $0^\circ$ and $180^\circ$.`,
          visual: polar([-4.6, 2.2], [-2.8, 2.8], {
            rstep: 1, spokes: 30,
            curves: [{ conic: [E, 1], color: 'accent' }],
            segments: [{ from: [0, 0], to: [round(6 * Math.cos(thInf)), round(6 * Math.sin(thInf))], color: 'gold', dash: true }, { from: [0, 0], to: [round(6 * Math.cos(thInf)), round(-6 * Math.sin(thInf))], color: 'gold', dash: true }],
            points: [{ x: 0, y: 0, color: 'gold', size: 6, label: 'Sun', labelDy: 14 }],
          }, t`The path (drawn with $p = 1$) and, dashed, the two directions it approaches far from the Sun: in from one, out along the other.`),
          answer: deg, units: 'deg', tol: { abs: 0.3 },
          errors: [{ value: (Math.acos(1 / E) * 180) / Math.PI, feedback: t`Check the sign: $r$ is infinite where $1 + e\cos\theta = 0$, i.e. $\cos\theta = -1/e$.` }],
          hints: [t`$r \to \infty$ when the denominator $1 + ${E}\cos\theta \to 0$.`, t`$\cos\theta_\infty = -1/${E}$, so $\theta_\infty = \arccos(-1/${E})$.`],
          teach: 'A hyperbolic orbit r = p/(1 + e cos θ) only reaches the angles with 1 + e cos θ > 0; it escapes along cos θ = −1/e.',
          explain: t`$\theta_\infty = \arccos(-1/${E}) \approx ${fmt(deg, 4)}^\circ$. Coming in along $-\theta_\infty$ and leaving along $+\theta_\infty$, its path is bent by $2\theta_\infty - 180^\circ \approx ${fmt(2 * deg - 180)}^\circ$ — the larger $e$, the gentler the turn.`,
        };
      },
    }),
    mcq({
      id: 'minus-sign', difficulty: 3,
      prompt: t`An orbit is written $r = \dfrac{p}{1 - e\cos\theta}$ with $0 < e < 1$. At which angle is the body closest to the focus?`,
      visual: polar([-3.6, 3.6], [-2.2, 2.2], { rstep: 1, vlines: [{ x: -2.5, color: 'teal', label: 'directrix' }], points: [{ x: 0, y: 0, color: 'gold', label: 'focus', labelDy: 14 }] }, t`For this form the directrix is the line $x = -p/e$, to the **left** of the focus.`),
      choices: [t`$\theta = \pi$`, t`$\theta = 0$`, t`$\theta = \pi/2$`, 'It is equally close at every angle'],
      answer: 0,
      why: {
        1: t`At $\theta = 0$ the denominator is $1 - e$, its smallest value, so $r$ is **largest** there.`,
        2: t`At $\theta = \pi/2$, $r = p$: that is the semi-latus rectum, neither closest nor farthest.`,
        3: t`That is a circle, $e = 0$. Here $0 < e < 1$.`,
      },
      hints: [t`$r$ is smallest where the denominator $1 - e\cos\theta$ is largest.`, t`$1 - e\cos\theta$ is largest when $\cos\theta = -1$.`],
      teach: 'The sign in front of e cos θ decides which side the directrix and the perihelion are on: minus puts the closest point at θ = π.',
      explain: t`$1 - e\cos\theta$ is largest at $\theta = \pi$, where it equals $1 + e$: the closest distance is $p/(1 + e)$, on the side away from the directrix.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-aphelion', difficulty: 2,
      gen(r) {
        const p = r.pick([1.5, 2, 3, 4]), e = r.pick([0.2, 0.4, 0.5, 0.75]), Q = p / (1 - e), q = p / (1 + e);
        return {
          prompt: t`An asteroid’s orbit is $r = \dfrac{${p}}{1 + ${e}\cos\theta}$ AU, with the Sun at the pole. How far from the Sun does it get? Give 3 significant figures.`,
          visual: polar([-1.12 * Q, 1.6 * q], [-0.8 * Q, 0.8 * Q], { rstep: Q > 6 ? 2 : 1, angles: 'none', curves: [{ conic: [e, p], color: 'accent' }], points: [{ x: 0, y: 0, color: 'gold', size: 6, label: 'Sun', labelDy: 14 }, { x: round(-Q), y: 0, color: 'accent2', label: 'farthest', labelDy: -12 }] }, 'The orbit and its farthest point.'),
          answer: Q, units: 'AU', tol: { rel: 0.005 },
          errors: [{ value: q, feedback: t`That is the closest distance, at $\theta = 0$. The farthest is at $\theta = \pi$.` }],
          hints: [t`The farthest point is at $\theta = \pi$, where $\cos\theta = -1$.`],
          teach: 'Aphelion: θ = π, Q = p/(1 − e).',
          explain: t`$Q = \dfrac{${p}}{1 - ${e}} \approx ${fmt(Q)}$ AU.`,
        };
      },
    }),
    num({
      id: 'cp-gto', difficulty: 3, transfer: true,
      gen(r) {
        const alt = r.pick([185, 250, 300]), rp = RE + alt, ra = 42164;
        const e = (ra - rp) / (ra + rp), p = (2 * rp * ra) / (rp + ra), S = 1 / 1000;
        return {
          prompt: t`A satellite bound for geostationary orbit is first put into a transfer orbit with perigee ${alt} km above the ground and apogee at the geostationary radius, ${'42\\,164'} km from the Earth’s centre. Taking the Earth’s radius as ${RE} km, how far from the Earth’s centre is the satellite when it is $90^\circ$ past perigee? Give 3 significant figures.`,
          visual: polar([-46, 10], [-14, 14], {
            rstep: 10, angles: 'none',
            curves: [{ conic: [round(e, 6), round(p * S, 4)], color: 'accent' }, { polar: '42.164', theta: [0, '2*pi'], color: 'violet', width: 1.3, dash: true }, { polar: '6.371', theta: [0, '2*pi'], color: 'teal', width: 2 }],
            segments: [{ from: [0, 0], to: [0, round(p * S, 3)], color: 'gold', width: 2.2, label: '?', labelDx: 8, labelDy: 0 }],
          }, 'The transfer orbit (blue) between the Earth (teal) and the geostationary orbit (violet dashed), in thousands of km, to scale.'),
          answer: p, units: 'km', tol: { rel: 0.005 },
          errors: [
            { value: (rp + ra) / 2, feedback: 'That is the semi-major axis a. At 90° past perigee the distance is the semi-latus rectum p = a(1 − e²), which is shorter.' },
            { value: (2 * alt * ra) / (alt + ra), feedback: 'Measure the perigee from the Earth’s centre: add the Earth’s radius to the altitude.' },
          ],
          hints: [t`At $90^\circ$, $\cos\theta = 0$, so $r = p$. Find $p$ from the perigee and apogee radii.`, t`$r_p = \dfrac{p}{1 + e}$ and $r_a = \dfrac{p}{1 - e}$, so $\dfrac{1}{r_p} + \dfrac{1}{r_a} = \dfrac{2}{p}$.`],
          teach: 'The semi-latus rectum p is the harmonic mean of the closest and farthest distances: 2/p = 1/q + 1/Q.',
          explain: t`$r_p = ${rp}$ km and $r_a = 42\,164$ km give $e = \dfrac{r_a - r_p}{r_a + r_p} \approx ${fmt(e)}$ and $p = \dfrac{2r_pr_a}{r_p + r_a} \approx ${fmt(p, 4)}$ km.`,
        };
      },
    }),
    mcq({
      id: 'cp-escape', difficulty: 2,
      prompt: t`Four bodies orbit the Sun with these eccentricities. Which one will never come back?`,
      visual: polar([-6, 2.6], [-3, 3], {
        rstep: 1, angles: 'none',
        curves: [{ conic: [0.5, 1.5], color: 'accent' }, { conic: [1, 1.5], color: 'warn' }, { conic: [1.5, 1.5], color: 'bad' }],
        points: [{ x: 0, y: 0, color: 'gold', size: 6, label: 'Sun', labelDy: 14 }],
        texts: [{ text: 'e = 0.5', x: -2.4, y: 1.95, color: 'accent' }, { text: 'e = 1', x: -4.4, y: 2.7, color: 'warn' }, { text: 'e = 1.5', x: -1.3, y: 2.7, color: 'bad' }],
      }, t`Three conics with the same $p$ round the same focus: only $e < 1$ closes.`),
      choices: [t`ʻOumuamua, $e = 1.20$`, t`Halley’s comet, $e = 0.967$`, t`Mercury, $e = 0.206$`, t`A comet with $e = 0.995$`],
      answer: 0,
      why: { 1: t`$e = 0.967 < 1$: a long ellipse, but closed — Halley returns every 75 years or so.`, 2: 'A gently elongated ellipse: Mercury has orbited the Sun for billions of years.', 3: t`Even $e = 0.995$ is below $1$: an extremely long ellipse, with a period of thousands of years, but closed.` },
      hints: ['Only one kind of conic is a closed curve.'],
      teach: 'e < 1 is a closed (bound) orbit; e ≥ 1 is an open path that escapes.',
      explain: t`Only $e \ge 1$ gives an open curve. ʻOumuamua’s $e = 1.20$ is a hyperbola: it passed the Sun once, in 2017, and is leaving the Solar System.`,
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 2, §7.5 Conic Sections (polar equations of conics)', url: 'https://openstax.org/books/calculus-volume-2/pages/7-5-conic-sections' },
    { label: 'JPL Small-Body Database: 1P/Halley, 1I/ʻOumuamua, 2I/Borisov', url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html' },
  ],
});
