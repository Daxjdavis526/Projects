// Effective potentials for massive and massless particles — Derivation Mode.
// From the radial equation of step 25, (dr/dλ)² = E² − (1 − 2M/r)(ε + L²/r²),
// Carroll's form ½ṙ² + V = ½E² with V = ½ε − εM/r + L²/2r² − ML²/r³.
// Circular orbits: V′ = 0 ⇔ εMr² − L²r + 3ML² = 0, r± = [L² ± L√(L² − 12M²)]/2M
// for bodies; V″ on circular orbits = M(r − 6M)/[r³(r − 3M)], so stable only
// for r > 6M; the roots merge at L = 2√3 M, r = 6M (ISCO), E = 2√2/3, 5.72%.
// L² = Mr²/(r − 3M), E = (1 − 2M/r)/√(1 − 3M/r), dφ/dt = √(M/r³) exactly.
// Light (ε = 0): V′ = 0 at r = 3M for every L, a maximum. Schwarzschild–de
// Sitter leaves the photon sphere at 3M. All checked with SymPy. G = c = 1.
// Avoids gr.S21.i (ISCO in km, frequencies, local speed, Interstellar, quasar
// power) and gr.EQ.14 (term ratios, stable radius for given L, capture, the
// marginally bound orbit, neutron-star ISCO).
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { LAMBDA, M_SUN, T_SUN, sci, round, circ } from './_classic.js';

const t = String.raw;

const V = (r, L) => 0.5 - 1 / r + (L * L) / (2 * r * r) - (L * L) / r ** 3;     // M = 1
const vExpr = (L) => `0.5 - 1/x + ${round(L * L / 2, 6)}/x^2 - ${round(L * L, 6)}/x^3`;
const rPlus = (L) => (L * L + L * Math.sqrt(L * L - 12)) / 2, rMinus = (L) => (L * L - L * Math.sqrt(L * L - 12)) / 2;
const SGR = 4.30e6;                                                            // Sgr A*, solar masses

// V(r) for one or more angular momenta, with the circular orbits marked if asked
const vGraph = ({ Ls, marks = false, y = [0.42, 0.6], x = [2, 30], caption, labels, at = [14, 20, 25], dy = [16, -12, 16] }) => ({
  type: 'graph',
  params: {
    x, y, xlabel: 'r / M', ylabel: 'V(r)',
    curves: Ls.map((L, k) => ({ fn: vExpr(L), domain: [2.4, x[1]], color: ['gold', 'accent', 'violet'][k], label: labels ? labels[k] : `L = ${L}M`, labelAt: at[k], labelDy: dy[k] })),
    points: marks ? Ls.flatMap((L) => (L * L >= 12 ? [{ x: round(rPlus(L), 5), y: round(V(rPlus(L), L), 6), color: 'good', r: 5 }, { x: round(rMinus(L), 5), y: round(V(rMinus(L), L), 6), color: 'bad', r: 5 }] : [])) : [],
    hlines: [{ y: 0.5, label: 'V far away' }],
  },
  caption: caption ?? t`The effective potential $V(r) = \tfrac12 - M/r + L^2/2r^2 - ML^2/r^3$ for a body ($G = c = 1$, $r$ in units of $M$).`,
});

// a circular orbit around a black hole, to scale in units of M
const orbitCircle = (k, label = 'orbiting body') => ({
  type: 'graph',
  params: {
    x: [-k * 1.55, k * 1.55], y: [-k * 1.2, k * 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    shade: [{ fn: 'sqrt(max(4 - x^2, 0))', lower: '-sqrt(max(4 - x^2, 0))', from: -2, to: 2, color: '#000000', alpha: 0.9 }],
    curves: [
      { param: ['2*cos(t)', '2*sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.2 },
      { param: [`${k}*cos(t)`, `${k}*sin(t)`], t: [0, 6.2832], color: 'gold', width: 1.6, dash: true },
    ],
    points: [{ x: round(k * Math.cos(0.7), 4), y: round(k * Math.sin(0.7), 4), color: 'gold', r: 6, label }],
    arrows: [{ from: [round(k * Math.cos(0.7), 4), round(k * Math.sin(0.7), 4)], to: [round(k * Math.cos(0.7) - 0.3 * k * Math.sin(0.7), 4), round(k * Math.sin(0.7) + 0.3 * k * Math.cos(0.7), 4)], color: 'gold' }],
  },
  caption: t`A circular orbit at $r = ${k}M$ around a non-spinning black hole (black: the horizon, $2M$), to scale, seen from above.`,
});

// f(r) of Schwarzschild–de Sitter, Λ exaggerated
const sdsPic = {
  type: 'graph',
  params: {
    x: [0, 16], y: [-0.6, 1.1], xlabel: 'r / M', ylabel: 'f(r)',
    curves: [
      { fn: '1 - 2/x', domain: [1.4, 16], color: 'ink3', dash: true, width: 1.6, label: 'Λ = 0', labelAt: 13, labelDy: -12 },
      { fn: '1 - 2/x - 0.01*x^2/3', domain: [1.4, 16], color: 'violet', width: 2.2, label: 'Λ > 0 (exaggerated)', labelAt: 11.5, labelDy: 16 },
    ],
    hlines: [{ y: 0 }],
  },
  caption: t`$f = 1 - 2M/r - \Lambda r^2/3$ ($G = c = 1$) with $\Lambda$ exaggerated about $${sci(0.01 / (LAMBDA * (10 * M_SUN) ** 2), 1)}$ times for a 10-solar-mass black hole, so that its effect shows: a second horizon far out.`,
};

export default lesson({
  id: 'gr.S21.d',
  title: 'Effective potentials for massive and massless particles',
  minutes: 15, difficulty: 3, mode: 'derivation', badges: ['est-der'],
  intro: t`Steps 23 and 25 found two conserved quantities, $E$ and $L$, and turned the normalization of the four-velocity into a radial equation. Halve it and it reads like Newton's energy equation for a ball rolling in one dimension, in the **effective potential** $V(r)$ above. Everything about orbits around a non-spinning black hole can be read off this one curve: circular orbits sit at its extrema; the innermost stable one, at $6M$, is where the minimum disappears; light circles at $3M$, on top of its hump.

Conventions: Carroll's, signature $(-,+,+,+)$, **with $G = c = 1$**, so $M$ means $GM/c^2$. The orbit lies in the plane $\theta = \pi/2$.`,
  equation: t`\tfrac12\left(\frac{dr}{d\lambda}\right)^2 + V(r) = \tfrac12E^2, \qquad V(r) = \tfrac12\varepsilon - \frac{\varepsilon M}{r} + \frac{L^2}{2r^2} - \frac{ML^2}{r^3}`,
  symbols: [
    { tex: '\\lambda', text: t`the parameter along the path: the body's proper time $\tau$, or for light an affine parameter` },
    { tex: 'V(r)', text: 'the effective potential: what the radial motion "rolls" in' },
    { tex: 'E', text: t`$(1 - 2M/r)\,dt/d\lambda$, conserved: for a body, its energy per unit rest energy as measured far away ($E = 1$ for a body at rest at infinity)` },
    { tex: 'L', text: t`$r^2\,d\phi/d\lambda$, conserved: the angular momentum per unit mass (a length, with $G = c = 1$)` },
    { tex: '\\varepsilon', text: t`$1$ for a body, $0$ for light: minus the four-velocity's normalization, $g_{\mu\nu}\dot x^\mu\dot x^\nu = -\varepsilon$` },
    { tex: 'M', text: t`the mass as a length, $GM/c^2$: 14.8 km for a 10-solar-mass black hole` },
    { tex: 'r', text: t`the Schwarzschild (areal) radial coordinate` },
  ],
  why: t`The innermost stable circular orbit sets the inner edge of accretion disks and the share of rest energy a black hole can turn into light; the photon sphere sets the size of a black hole's shadow.`,
  visual: {
    type: 'graph',
    title: 'Where circular orbits live',
    lead: t`The effective potential of a body ($\varepsilon = 1$, $G = c = 1$, $r$ in units of $M$). Green: the **stable** circular orbit at the bottom of the well. Red: the **unstable** one on top of the hump. Lower the angular momentum $L$.`,
    tasks: [
      'Start at L = 4.5M: a deep well far out and a high hump close in.',
      'Lower L: the well rises and moves in, the hump sinks and moves out.',
      'At L = 2√3 M ≈ 3.46M they meet at r = 6M and vanish together: below that, no circular orbit is stable. The readout shows the energy there, E = 0.943 — 5.7% below the rest energy.',
    ],
    params: {
      x: [2, 30], y: [0.42, 0.62], xlabel: 'r / M', ylabel: 'V(r)',
      sliders: [{ key: 'L', label: 'Angular momentum $L$', min: 3.2, max: 4.8, step: 0.01, value: 4.5, unit: 'M', explain: 'Per unit mass, with $G = c = 1$; conserved along the orbit.' }],
      curves: [{ fn: '0.5 - 1/x + L^2/(2*x^2) - L^2/x^3', domain: [2.2, 30], color: 'gold', width: 2.4 }],
      points: [
        { x: '(L^2 + L*sqrt(L^2 - 12))/2', y: '0.5 - 2/(L^2 + L*sqrt(L^2 - 12)) + 2*L^2/(L^2 + L*sqrt(L^2 - 12))^2 - 8*L^2/(L^2 + L*sqrt(L^2 - 12))^3', color: 'good', r: 6, when: 'step(L^2 - 12)' },
        { x: '(L^2 - L*sqrt(L^2 - 12))/2', y: '0.5 - 2/(L^2 - L*sqrt(L^2 - 12)) + 2*L^2/(L^2 - L*sqrt(L^2 - 12))^2 - 8*L^2/(L^2 - L*sqrt(L^2 - 12))^3', color: 'bad', r: 6, when: 'step(L^2 - 12)' },
      ],
      vlines: [{ x: 6, label: '6M' }, { x: 3, label: '3M' }],
      hlines: [{ y: 0.5 }],
      readouts: [
        { label: 'stable circle at', expr: '(L^2 + L*sqrt(L^2 - 12))/2', unit: 'M', digits: 4 },
        { label: 'unstable circle at', expr: '(L^2 - L*sqrt(L^2 - 12))/2', unit: 'M', digits: 4 },
        { label: '$E$ on the stable circle', expr: 'sqrt((1 - 4/(L^2 + L*sqrt(L^2 - 12)))*(1 + 4*L^2/(L^2 + L*sqrt(L^2 - 12))^2))', digits: 4 },
      ],
    },
    caption: t`$V(r) = \tfrac12 - M/r + L^2/2r^2 - ML^2/r^3$; its extrema are the circular orbits $r_\pm = [L^2 \pm L\sqrt{L^2 - 12M^2}]/2M$. Readouts go blank when no circular orbit exists. Exact for a test body; a real disk's gas also feels pressure and magnetic fields.`,
  },
  example: {
    prompt: t`Derive the effective potential, find the circular orbits and the innermost stable one, its energy, and the photon sphere.`,
    visual: vGraph({ Ls: [4.5, 3.9, 2 * Math.sqrt(3)], y: [0.42, 0.58], labels: ['L = 4.5M', 'L = 3.9M', 'L = 2√3 M'], at: [3.4, 7, 24], dy: [-10, -12, 18], caption: t`$V(r)$ for $L = 4.5M$, $3.9M$ and $2\sqrt3\,M$ ($G = c = 1$): as $L$ falls, the well and the hump close in on each other and merge at $6M$.` }),
    steps: [
      { label: 'The energy equation', text: t`Step 25 gave, for a body, $\dot r^2 = E^2 - (1 - 2M/r)(1 + L^2/r^2)$; for light the normalization is $0$ instead of $-1$, so the $1$ becomes $\varepsilon$. Halving,
$$\tfrac12\dot r^2 + V(r) = \tfrac12E^2, \qquad V = \tfrac12\left(1 - \frac{2M}{r}\right)\left(\varepsilon + \frac{L^2}{r^2}\right) = \tfrac12\varepsilon - \frac{\varepsilon M}{r} + \frac{L^2}{2r^2} - \frac{ML^2}{r^3}.$$
Differentiating with respect to $\lambda$ gives $\ddot r = -V'(r)$: a ball in a potential.` },
      { label: 'Circular orbits', text: t`A circle needs $\dot r = 0$ and $\ddot r = 0$, so $V'(r) = 0$:
$$V' = \frac{\varepsilon Mr^2 - L^2r + 3ML^2}{r^4} = 0 \;\Rightarrow\; r_\pm = \frac{L^2 \pm L\sqrt{L^2 - 12M^2}}{2M} \quad(\varepsilon = 1).$$
Real roots need $L \ge 2\sqrt3\,M$. Far out, $r_+ \approx L^2/M$ — Newton's circular orbit.` },
      { label: 'Which are stable', text: t`Solving $V' = 0$ for $L^2$ gives $L^2 = Mr^2/(r - 3M)$; putting that into $V''$:
$$V''\big|_\text{circular} = \frac{M(r - 6M)}{r^3(r - 3M)}.$$
Positive — a minimum, stable — only for $r > 6M$. Between $3M$ and $6M$ the circles sit on the hump: a nudge sends the body in or out.` },
      { label: 'The innermost stable orbit', text: t`The two roots merge when $L^2 = 12M^2$, at $r = L^2/(2M) = 6M$: the **ISCO**, with $L = 2\sqrt3\,M$. There $V' = V'' = 0$ together (SymPy's \`solve\` finds exactly this pair).` },
      { label: 'Its energy', text: t`On a circle $\tfrac12E^2 = V$. At $r = 6M$, $L^2 = 12M^2$: $E^2 = \left(1 - \tfrac13\right)\left(1 + \tfrac{12}{36}\right) = \tfrac89$, so $E = \tfrac{2\sqrt2}{3} = ${sci(circ.E(6), 4)}$. Gas that spirals in slowly through a disk, from rest far away ($E = 1$), has radiated $1 - E = ${sci(100 * (1 - circ.E(6)), 3)}\%$ of its rest energy by the time it plunges.` },
      { label: 'Light', text: t`With $\varepsilon = 0$, $V = \dfrac{L^2}{2r^2}\left(1 - \dfrac{2M}{r}\right)$ and $V' = L^2\left(-\dfrac{1}{r^3} + \dfrac{3M}{r^4}\right) = 0$ at $r = 3M$, whatever $L$ is — the **photon sphere**. It is a maximum ($V'' = -L^2/81M^4 < 0$): light can circle there, but unstably.` },
      { label: 'Sense check', text: t`The order is horizon $2M$ < photon sphere $3M$ < ISCO $6M$, with no circular orbits at all inside $3M$. Far away the new term $-ML^2/r^3$ is $2M/r$ of the centrifugal term and Newton's potential returns.` },
    ],
    answer: t`$V = \tfrac12\varepsilon - \varepsilon M/r + L^2/2r^2 - ML^2/r^3$; circular orbits at $r_\pm = [L^2 \pm L\sqrt{L^2 - 12M^2}]/2M$, stable only for $r > 6M$; ISCO at $6M$ with $L = 2\sqrt3\,M$ and $E = 2\sqrt2/3$ ($${sci(100 * (1 - circ.E(6)), 3)}\%$ released); photon sphere at $3M$.`,
  },
  practice: [
    expr({
      id: 'v-prime', difficulty: 2,
      prompt: t`Differentiate the effective potential of a body, $V(r) = \tfrac12 - \dfrac{M}{r} + \dfrac{L^2}{2r^2} - \dfrac{ML^2}{r^3}$, with respect to $r$ ($M$ and $L$ are constants).`,
      answer: 'M/r^2 - L^2/r^3 + 3M L^2/r^4', answerTeX: t`\frac{M}{r^2} - \frac{L^2}{r^3} + \frac{3ML^2}{r^4}`, lhs: "V'(r)",
      vars: { r: [4, 20], M: [0.5, 1.5], L: [3, 6] },
      derivativeOf: '0.5 - M/r + L^2/(2r^2) - M L^2/r^3',
      errors: [
        { answer: 'M/r^2 - L^2/r^3 + M L^2/r^4', feedback: t`$\dfrac{d}{dr}\,r^{-3} = -3r^{-4}$: the last term carries a 3.` },
        { answer: '-M/r^2 + L^2/r^3 - 3M L^2/r^4', feedback: t`Check each sign: $\dfrac{d}{dr}\left(-\dfrac{M}{r}\right) = +\dfrac{M}{r^2}$.` },
      ],
      hints: [t`Write $V = \tfrac12 - Mr^{-1} + \tfrac12L^2r^{-2} - ML^2r^{-3}$ and use the power rule term by term.`],
      teach: 'Circular orbits sit where V′(r) = 0; over a common denominator V′ is a quadratic in r.',
      explain: t`$V' = \dfrac{M}{r^2} - \dfrac{L^2}{r^3} + \dfrac{3ML^2}{r^4} = \dfrac{Mr^2 - L^2r + 3ML^2}{r^4}$. Its numerator is a quadratic in $r$, whose two roots are the two circular orbits marked in the picture.`,
      visual: vGraph({ Ls: [4.2], marks: true, y: [0.44, 0.58], caption: t`$V(r)$ for $L = 4.2M$ ($G = c = 1$). Green and red: the two places where its slope is zero.` }),
    }),
    expr({
      id: 'L-circle', difficulty: 2,
      prompt: t`A body moves on a circular orbit of radius $r$ ($G = c = 1$). Solve $V'(r) = \dfrac{Mr^2 - L^2r + 3ML^2}{r^4} = 0$ for $L^2$.`,
      answer: 'M r^2/(r - 3M)', answerTeX: t`\frac{Mr^2}{r - 3M}`, lhs: 'L^2',
      vars: { M: [0.5, 1.5], r: [6, 20] },
      errors: [
        { answer: 'M r', feedback: t`That is Newton's $L^2 = Mr$. Keep the $3ML^2$ term: $L^2(r - 3M) = Mr^2$.` },
        { answer: 'M r^2/(r - 2M)', feedback: t`Collect the $L^2$ terms: $-L^2r + 3ML^2 = -L^2(r - 3M)$.` },
      ],
      hints: [t`$Mr^2 = L^2r - 3ML^2 = L^2(r - 3M)$.`],
      teach: 'A circular orbit at r needs L² = Mr²/(r − 3M) — more than Newton’s Mr, and infinite at r = 3M.',
      explain: t`$L^2 = \dfrac{Mr^2}{r - 3M}$, larger than Newton's $Mr$ by the factor $1/(1 - 3M/r)$. It is smallest at $r = 6M$, where $L^2 = 12M^2$, and grows without limit as $r \to 3M$: only light can circle there.`,
      visual: vGraph({ Ls: [4.5, 4, 3.6], caption: t`$V(r)$ for three angular momenta ($G = c = 1$). The bottom of each well is a stable circular orbit; a larger $L$ puts it farther out.` }),
    }),
    num({
      id: 'binding', difficulty: 3,
      gen(r) {
        const k = r.pick([7, 8, 10, 12, 20]);
        const E = circ.E(k), x = 100 * (1 - E);
        return {
          prompt: t`A small body circles a black hole at $r = ${k}M$ ($G = c = 1$). On a circle $\tfrac12E^2 = V(r)$; with $L^2 = Mr^2/(r - 3M)$ this gives $E = \dfrac{1 - 2M/r}{\sqrt{1 - 3M/r}}$. What percentage of its rest energy, $1 - E$, did the body give off in settling onto this orbit from rest far away?`,
          answer: x, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: 100 / (2 * k), feedback: t`That is Newton's binding energy, $M/(2r)$. Use the relativistic $E = (1 - 2M/r)/\sqrt{1 - 3M/r}$.` },
            { value: 100 * E, feedback: 'That is the energy it keeps. It gave off 1 − E.' },
          ],
          hints: [t`$E = (1 - 2/${k})/\sqrt{1 - 3/${k}}$.`, t`$E = ${sci(1 - 2 / k, 4)}/${sci(Math.sqrt(1 - 3 / k), 4)} = ${sci(E, 4)}$; then $1 - E$.`],
          teach: 'Deeper circular orbits are more tightly bound, down to 5.72% of the rest energy at the ISCO.',
          explain: t`$E = ${sci(E, 4)}$, so $1 - E = ${sci(x / 100, 3)}$: ${sci(x, 3)}% of the rest energy, against Newton's ${sci(100 / (2 * k), 3)}%. ${k <= 8 ? 'Close in, relativity binds less tightly than Newton would — and below 6M nothing stays.' : 'The two agree better farther out.'}`,
          visual: orbitCircle(k),
        };
      },
    }),
    expr({
      id: 'kepler', difficulty: 3,
      prompt: t`For a circular orbit at radius $r$ ($G = c = 1$), $\dfrac{d\phi}{d\tau} = \dfrac{L}{r^2}$ and $\dfrac{dt}{d\tau} = \dfrac{E}{1 - 2M/r}$, with $L^2 = \dfrac{Mr^2}{r - 3M}$ and $E^2 = \dfrac{(1 - 2M/r)^2}{1 - 3M/r}$. Find $\Omega^2$, the square of the angular velocity $\Omega = d\phi/dt$ seen by a clock far away.`,
      answer: 'M/r^3', answerTeX: t`\frac{M}{r^3}`, lhs: t`\Omega^2`,
      vars: { M: [0.5, 1.5], r: [6, 20] },
      errors: [
        { answer: 'M/(r^2 (r - 3M))', feedback: t`That is $(d\phi/d\tau)^2 = L^2/r^4$, per tick of the orbiting clock. Divide by $(dt/d\tau)^2$ to get far-away time.` },
        { answer: 'M (1 - 3M/r)/r^3', feedback: t`Check the $E^2$ factor: $(1 - 2M/r)^2/E^2 = 1 - 3M/r$, which cancels the $1/(r - 3M)$ in $L^2$ exactly.` },
      ],
      hints: [t`$\Omega = \dfrac{d\phi/d\tau}{dt/d\tau} = \dfrac{L}{r^2}\cdot\dfrac{1 - 2M/r}{E}$.`, t`$\Omega^2 = \dfrac{L^2}{r^4}\cdot\dfrac{(1 - 2M/r)^2}{E^2} = \dfrac{M}{r^2(r - 3M)}\left(1 - \dfrac{3M}{r}\right)$.`],
      teach: 'In Schwarzschild coordinates, circular orbits obey Kepler’s third law exactly: Ω² = GM/r³ in far-away time.',
      explain: t`$\Omega^2 = \dfrac{M}{r^2(r - 3M)}\cdot\dfrac{r - 3M}{r} = \dfrac{M}{r^3}$ — Kepler's third law, exactly, with $r$ the areal radius and $t$ far-away time. (The orbiting clock's own period is shorter by $\sqrt{1 - 3M/r}$.) It is why the gravitational-wave frequency at the ISCO comes out as Kepler's.`,
      visual: orbitCircle(10),
    }),
    mcq({
      id: 'unstable-band', difficulty: 2,
      prompt: t`On circular orbits $V'' = \dfrac{M(r - 6M)}{r^3(r - 3M)}$ ($G = c = 1$). A body is placed on a circular orbit at $r = 4.5M$, between the photon sphere and the ISCO. What happens if it is nudged slightly?`,
      choices: [
        t`It leaves the circle: there $V'' < 0$, the orbit sits on top of the hump, and the nudge grows — it either plunges in or escapes outward`,
        t`It oscillates gently about the circle, as orbits do around any star`,
        t`Nothing: circular orbits are stable everywhere outside the horizon`,
        t`It cannot be there at all: no circular orbits exist inside $6M$`,
      ],
      answer: 0,
      why: {
        1: t`Gentle oscillation needs a well, $V'' > 0$, which holds only for $r > 6M$.`,
        2: t`Outside the horizon there are circular orbits down to $3M$, but those inside $6M$ are unstable.`,
        3: t`Circular orbits exist for every $r > 3M$; inside $6M$ they are unstable, not absent.`,
      },
      hints: [t`At $r = 4.5M$, is $r - 6M$ positive or negative? And $r - 3M$?`],
      teach: 'Between 3M and 6M circular orbits exist but are unstable: they sit on the hump of the potential.',
      explain: t`With $r = 4.5M$, $r - 6M < 0$ and $r - 3M > 0$, so $V'' < 0$: a maximum. Like a ball balanced on a hilltop, the body stays only if placed perfectly; any nudge grows. That is why thin disks end at $6M$.`,
      visual: orbitCircle(4.5),
    }),
    code({
      id: 'isco-sympy', difficulty: 3,
      prompt: t`Find the ISCO with SymPy. The innermost stable circular orbit is where $V'(r) = 0$ and $V''(r) = 0$ at once. Use \`sp.solve([...], [r, L], dict=True)\` to find $r$ and $L$ there, then $E$ from $\tfrac12E^2 = V$ and the efficiency $1 - E$.`,
      starter: t`import sympy as sp

r, M, L = sp.symbols('r M L', positive=True)
V = sp.Rational(1, 2) - M/r + L**2/(2*r**2) - M*L**2/r**3    # massive particle, G = c = 1

# circular orbits need V'(r) = 0; the innermost stable one also has V''(r) = 0
solutions = []   # replace: solve the two conditions for r and L
r_isco = None
L_isco = None
E_isco = None    # from (1/2) E^2 = V on a circular orbit
efficiency = None
`,
      answer: t`import sympy as sp

r, M, L = sp.symbols('r M L', positive=True)
V = sp.Rational(1, 2) - M/r + L**2/(2*r**2) - M*L**2/r**3    # massive particle, G = c = 1

# circular orbits need V'(r) = 0; the innermost stable one also has V''(r) = 0
solutions = sp.solve([sp.diff(V, r), sp.diff(V, r, 2)], [r, L], dict=True)
r_isco = solutions[0][r]
L_isco = solutions[0][L]
E_isco = sp.sqrt(2*V.subs({r: r_isco, L: L_isco}))     # from (1/2) E^2 = V on a circular orbit
efficiency = 1 - E_isco
`,
      tests: [
        { name: t`$r_\text{ISCO} = 6M$`, code: 'sp.simplify(r_isco - 6*M) == 0' },
        { name: t`$L_\text{ISCO} = 2\sqrt3\,M$`, code: 'sp.simplify(L_isco - 2*sp.sqrt(3)*M) == 0' },
        { name: t`$E_\text{ISCO} = 2\sqrt2/3$`, code: 'sp.simplify(E_isco - 2*sp.sqrt(2)/3) == 0' },
        { name: 'the efficiency is 5.72%', code: 'abs(float(efficiency) - 0.0572) < 0.0005' },
      ],
      hints: [t`\`sp.diff(V, r)\` is $V'$ and \`sp.diff(V, r, 2)\` is $V''$. With \`positive=True\` symbols, \`solve\` returns just one solution.`, t`\`solutions = sp.solve([sp.diff(V, r), sp.diff(V, r, 2)], [r, L], dict=True)\`, then \`r_isco = solutions[0][r]\`, and \`E_isco = sp.sqrt(2*V.subs({r: r_isco, L: L_isco}))\`.`],
      teach: 'The ISCO is the point where the potential’s minimum and maximum merge: V′ = V″ = 0.',
      explain: t`SymPy returns $r = 6M$, $L = 2\sqrt3\,M$; then $E = \sqrt{2V} = 2\sqrt2/3$ and $1 - E = ${sci(1 - circ.E(6), 3)}$. Change \`V\` to light's potential, $\dfrac{L^2}{2r^2}(1 - 2M/r)$, and \`solve(sp.diff(V, r), r)\` returns the photon sphere, $3M$.`,
      visual: vGraph({ Ls: [4, 3.7, 3.3], y: [0.44, 0.56], x: [2, 25], caption: t`$V(r)$ for $L = 4M$, $3.7M$ and $3.3M$ ($G = c = 1$): somewhere between the last two the well disappears.` }),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-L', difficulty: 2,
      gen(r) {
        const k = r.pick([7, 9, 12, 15, 30]);
        const x = Math.sqrt(circ.L2(k));
        return {
          prompt: t`What angular momentum per unit mass, in units of $M$, does a body need for a circular orbit at $r = ${k}M$ around a black hole ($G = c = 1$)?`,
          answer: x, tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(k), feedback: t`That is Newton's $\sqrt{Mr}$. Relativity needs more: $L^2 = Mr^2/(r - 3M)$.` }],
          hints: [t`$L^2 = \dfrac{Mr^2}{r - 3M} = \dfrac{${k}^2}{${k} - 3}M^2$.`],
          teach: 'Circular orbits need L² = Mr²/(r − 3M): close in, much more than Newton’s Mr.',
          explain: t`$L = ${k}/\sqrt{${k - 3}}\,M = ${sci(x, 4)}M$, against Newton's $\sqrt{${k}}\,M = ${sci(Math.sqrt(k), 4)}M$.`,
          visual: orbitCircle(k),
        };
      },
    }),
    mcq({
      id: 'cp-lambda', difficulty: 3,
      prompt: t`Around a black hole in a universe with a cosmological constant, $f = 1 - 2M/r - \Lambda r^2/3$ (step 20), and light's effective potential becomes $V = \dfrac{L^2}{2r^2}f(r)$. Where is the photon sphere now?`,
      choices: [
        t`Still at exactly $r = 3M$: $f/r^2 = 1/r^2 - 2M/r^3 - \Lambda/3$, and the constant $-\Lambda/3$ does not move the maximum`,
        t`Slightly inside $3M$, because $\Lambda$ pushes outward`,
        t`Slightly outside $3M$, because $\Lambda$ adds an outward push`,
        t`There is none: with $\Lambda > 0$ light cannot circle`,
      ],
      answer: 0,
      why: {
        1: t`Differentiate $f/r^2$: the $\Lambda$ term is a constant, and drops out of $V'$.`,
        2: t`For light only $f/r^2$ matters, and there $\Lambda$ enters as a constant — no push at all at any particular radius.`,
        3: t`The maximum of $1/r^2 - 2M/r^3$ is still there, at $3M$; $\Lambda$ only lowers the whole curve.`,
      },
      hints: [t`Write out $V = \dfrac{L^2}{2}\left(\dfrac{1}{r^2} - \dfrac{2M}{r^3} - \dfrac{\Lambda}{3}\right)$.`, t`$V' = \dfrac{L^2}{2}\left(-\dfrac{2}{r^3} + \dfrac{6M}{r^4}\right)$ — where is it zero?`],
      teach: 'For light only f/r² matters, and Λ adds just a constant to it: the photon sphere stays at 3M.',
      explain: t`$V = \tfrac{L^2}{2}\left(\tfrac{1}{r^2} - \tfrac{2M}{r^3} - \tfrac{\Lambda}{3}\right)$, so $V' = \tfrac{L^2}{2}\left(-\tfrac{2}{r^3} + \tfrac{6M}{r^4}\right) = 0$ at $r = 3M$ exactly. (Bodies, by contrast, feel $\Lambda$ through the $\varepsilon f/2$ term, and their circular orbits do shift — by a fraction of order $\Lambda r^2$, about $${sci(LAMBDA * (6 * 10 * M_SUN) ** 2, 1)}$ at the ISCO of a 10-solar-mass black hole, given the measured $\Lambda \approx ${sci(LAMBDA, 2)}\ \text{m}^{-2}$.)`,
      visual: sdsPic,
    }),
    num({
      id: 'cp-sgr', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([6, 8, 10]);
        const T = (2 * Math.PI * k ** 1.5 * SGR * T_SUN) / 60;
        return {
          prompt: t`Flares from Sagittarius A* (4.30 million solar masses) have been traced to hot spots of gas orbiting close to its horizon. Using $\Omega^2 = GM/r^3$, exact in far-away time, how many minutes does a hot spot at $r = ${k}GM/c^2$ take to go once round, as clocked from Earth (ignoring the Earth's own motion)? ($GM_\odot/c^3 = 4.925\ \mu\text{s}$)`,
          answer: T, units: 'min', tol: { rel: 0.01 },
          errors: [
            { value: T * Math.sqrt(1 - 3 / k), feedback: t`That is the period on the hot spot's own clock, shorter by $\sqrt{1 - 3M/r}$. Far away, $\Omega^2 = M/r^3$ exactly.` },
            { value: T / (2 * Math.PI), feedback: t`That is $1/\Omega$. One turn takes $2\pi/\Omega$.` },
          ],
          hints: [t`$T = 2\pi\sqrt{r^3/GM} = 2\pi\,(${k})^{3/2}\,GM/c^3$, with $GM/c^3 = 4.30\times10^{6}\times4.925\ \mu\text{s} = ${sci(SGR * T_SUN, 4)}$ s.`, t`$(${k})^{3/2} = ${sci(k ** 1.5, 4)}$; multiply by $2\pi\times${sci(SGR * T_SUN, 4)}$ s and divide by 60.`],
          teach: 'Near a supermassive black hole Kepler’s law, exact in far-away time, gives orbital periods of tens of minutes.',
          explain: t`$T = 2\pi\times${sci(k ** 1.5, 4)}\times${sci(SGR * T_SUN, 4)}\ \text{s} = ${sci(T * 60, 4)}$ s $\approx ${sci(T, 3)}$ minutes. The GRAVITY instrument followed flares circling Sgr A* in 2018 at roughly this distance; the orbit at the ISCO, $6M$, takes about ${Math.round((2 * Math.PI * 6 ** 1.5 * SGR * T_SUN) / 60)} minutes.`,
          visual: orbitCircle(k, 'hot spot'),
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Lecture Notes on General Relativity, ch. 7 (geodesics of Schwarzschild)', url: 'https://arxiv.org/abs/gr-qc/9712019' },
    { label: 'Hartle, Gravity: An Introduction to Einstein’s General Relativity, ch. 9', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'GRAVITY Collaboration, “Detection of orbital motions near the last stable circular orbit of the massive black hole SgrA*” (2018)', url: 'https://arxiv.org/abs/1810.12641' },
  ],
});
