// Rectangles and the vibrating membrane: separation in two dimensions. Laplace
// on a rectangle (sines one way, sinh the other); the membrane's modes
// sin(mπx/a) sin(nπy/b) with ω_mn = cπ√((m/a)² + (n/b)²); nodal lines,
// inharmonic overtones, degenerate modes on a square and the Chladni-like
// patterns their mixtures make.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const r4 = (x) => +x.toPrecision(4);
const mem = (params, caption) => ({ type: 'pde2-membrane', params: { shape: 'rect', readout: false, ...params }, caption });
const centreSq = 1 / (2 * Math.cosh(Math.PI / 2));     // centre of the unit square with top edge sin(πx): sinh(π/2)/sinh(π)
// worked example: a square membrane, 0.5 m, tension 2000 N/m, areal density 0.2 kg/m²
const WE = { a: 0.5, T: 2000, s: 0.2 };
WE.c = Math.sqrt(WE.T / WE.s);
const fr = (m, n) => (WE.c / 2) * Math.hypot(m / WE.a, n / WE.a);

export default lesson({
  id: 'st-b.B7.2',
  title: 'Rectangles and the vibrating membrane',
  minutes: 15, difficulty: 3,
  intro: t`A drumhead, a tensioned film, a thin stretched panel: a **membrane** whose sideways displacement $u(x, y, t)$ obeys the two-dimensional wave equation $u_{tt} = c^2(u_{xx} + u_{yy})$, with $c = \sqrt{T/\sigma}$. Fix its edges on the rectangle $0 \le x \le a$, $0 \le y \le b$, and separate in all three variables, $u = X(x)Y(y)T(t)$: each spatial factor is a sine that fits the edges, and the **normal modes** are

$$u_{mn} = \sin\frac{m\pi x}{a}\,\sin\frac{n\pi y}{b}\,\cos\omega_{mn}t, \qquad \omega_{mn} = c\pi\sqrt{\frac{m^2}{a^2} + \frac{n^2}{b^2}} .$$

Unlike a string’s, these frequencies are **not** whole multiples of the lowest. Where a mode’s sines vanish — straight lines across the membrane — it never moves: the **nodal lines**. The same separation solves Laplace’s equation on a rectangle, with $\sinh$ replacing $\cos\omega t$ in the second direction.`,
  symbols: [
    { tex: 'u(x, y, t)', text: 'the membrane’s sideways displacement (m)' },
    { tex: t`c = \sqrt{T/\sigma}`, text: 'the wave speed on the membrane (m/s), from the tension $T$ (N/m: force per unit length of any cut) and the areal density $\\sigma$ (kg/m²)' },
    { tex: 'a,\\ b', text: 'the side lengths (m)' },
    { tex: 'm,\\ n', text: 'whole numbers ≥ 1: the number of half-waves across the $x$ and $y$ directions. The mode has $m - 1$ and $n - 1$ interior nodal lines' },
    { tex: t`\omega_{mn}`, text: 'the mode’s angular frequency (rad/s); its frequency is $f_{mn} = \\omega_{mn}/2\\pi$ (Hz)' },
  ],
  why: t`A gravitational wave detector is a set of test masses, but the signals it searches for are sums of modes — the ringing of a newly formed black hole is a set of damped normal modes whose frequencies, like a drum’s, are fixed by the geometry. Reading a shape from its frequencies (“can one hear the shape of a drum?”) is the same inverse problem.`,
  visual: {
    type: 'pde2-membrane',
    title: 'The modes of a rectangle',
    lead: t`One mode of a membrane fixed along its edges. Bold lines are nodal lines. Below, the frequency ladder: the lowest ten modes, with dashed ticks at whole multiples of the fundamental.`,
    tasks: [
      'Step m and n: the mode has m − 1 vertical and n − 1 horizontal nodal lines, and its stem climbs the ladder.',
      'On the square (b/a = 1), (1, 2) and (2, 1) sit on one stem: two shapes, one frequency. Stretch the side ratio and watch them split.',
      'Look at the ladder: only a few stems land on the dashed whole-number ticks — the overtones are inharmonic.',
    ],
    params: { shape: 'rect', m: 2, n: 1, aspect: 1, controls: ['m', 'n', 'aspect'] },
    caption: t`An ideal membrane: uniform tension, no bending stiffness, no air loading, small amplitude. The ladder shows $\omega_{mn}/\omega_{11}$. Animation slowed to a fraction of a hertz.`,
  },
  example: {
    prompt: t`A square membrane ${WE.a} m on a side is stretched to a tension of ${WE.T} N/m and has areal density ${WE.s} kg/m². Find its four lowest distinct frequencies. Which of them belong to more than one mode, and what does the membrane look like when such a frequency is excited?`,
    visual: mem({ m: 1, n: 2, mix: [2, 1, 1], aspect: 1, ladder: true }, t`The mixture $u_{12} + u_{21}$ on the square: one frequency, and a nodal line along a diagonal that neither mode has on its own.`),
    steps: [
      { label: 'Separate', text: t`$u = X(x)Y(y)T(t)$ gives $\dfrac{T''}{c^2T} = \dfrac{X''}{X} + \dfrac{Y''}{Y}$. Each ratio depends on one variable, so each is a constant: $X'' = -k_x^2X$, $Y'' = -k_y^2Y$, $T'' = -c^2(k_x^2 + k_y^2)T$.` },
      { label: 'Fit the edges', text: t`$X(0) = X(a) = 0$ forces $X = \sin(m\pi x/a)$, and likewise $Y = \sin(n\pi y/a)$. So $\omega_{mn} = \dfrac{c\pi}{a}\sqrt{m^2 + n^2}$.` },
      { label: 'Wave speed', text: t`$c = \sqrt{${WE.T}/${WE.s}} = ${r3(WE.c)}$ m/s, and $f_{mn} = \dfrac{c}{2a}\sqrt{m^2 + n^2} = ${r3(WE.c / (2 * WE.a))}\sqrt{m^2 + n^2}$ Hz.` },
      { label: 'Lowest four', text: t`$m^2 + n^2 = 2$: $f_{11} = ${r4(fr(1, 1))}$ Hz. $m^2 + n^2 = 5$: $f_{12} = f_{21} = ${r4(fr(1, 2))}$ Hz. $m^2 + n^2 = 8$: $f_{22} = ${r4(fr(2, 2))}$ Hz. $m^2 + n^2 = 10$: $f_{13} = f_{31} = ${r4(fr(1, 3))}$ Hz.` },
      { label: 'Degeneracy', text: t`(1, 2) and (2, 1) share a frequency, so does (1, 3) and (3, 1): the square’s symmetry under swapping $x$ and $y$. Any mixture $u_{12} + s\,u_{21}$ is then also a mode, with nodal lines that depend on $s$ — for $s = 1$, the diagonal $y = a - x$.` },
      { label: 'Honesty', text: t`Chladni’s famous sand figures come from stiff *plates* with free edges, governed by a fourth-order equation, not from membranes. They show the same two ideas — sand collects on nodal lines, and mixtures of degenerate modes make the striking figures — but not these exact shapes.` },
    ],
    answer: t`$f \approx ${r4(fr(1, 1))}$, ${r4(fr(1, 2))}, ${r4(fr(2, 2))} and ${r4(fr(1, 3))} Hz, in the ratios $1 : 1.581 : 2 : 2.236$. The second and fourth belong to two modes each, and mixtures of the pair have nodal lines (such as a diagonal) that neither mode has alone.`,
  },
  practice: [
    mcq({
      id: 'read-mode', difficulty: 1,
      prompt: t`The picture shows one normal mode of a rectangular membrane, $\sin(m\pi x/a)\sin(n\pi y/b)$, with $x$ across and $y$ up. What are $m$ and $n$?`,
      visual: mem({ m: 3, n: 2, aspect: 0.8, ladder: false }, 'Shading: blue displaced up, orange down. Bold lines: nodal lines; the outline is the fixed edge.'),
      choices: ['m = 3, n = 2', 'm = 2, n = 1', 'm = 2, n = 3', 'm = 4, n = 3'],
      answer: 0,
      why: {
        1: 'You counted nodal lines. m counts half-waves — patches of one colour — across x: one more than the interior nodal lines.',
        2: 'Swapped: m counts the patches along x (across), n along y (up).',
        3: 'You counted the fixed edges as nodal lines too.',
      },
      hints: ['Count the patches of alternating colour along a horizontal line: that is m.', 'Interior nodal lines: m − 1 vertical, n − 1 horizontal.'],
      teach: 'Mode (m, n) has m half-waves across x and n along y, so m − 1 and n − 1 interior nodal lines.',
      explain: t`Three patches across (two vertical nodal lines) and two up (one horizontal nodal line): $(m, n) = (3, 2)$.`,
    }),
    num({
      id: 'panel-frequency', difficulty: 2,
      gen(r) {
        const a = r.pick([0.4, 0.6, 0.8]), ratio = r.pick([0.5, 0.75]), b = +(a * ratio).toFixed(2), T = r.pick([500, 1000, 2000]), s = r.pick([0.1, 0.2, 0.5]);
        const m = r.pick([1, 2]), n = r.pick([1, 2]), c = Math.sqrt(T / s), f = (c / 2) * Math.hypot(m / a, n / b);
        return {
          prompt: t`A membrane ${a} m × ${b} m ($a \times b$) is stretched to $T = ${T}$ N/m and has $\sigma = ${s}$ kg/m². What is the frequency of its $(m, n) = (${m}, ${n})$ mode, in Hz?`,
          visual: mem({ m, n, aspect: b / a, ladder: false }, `The (${m}, ${n}) mode on a ${a} m × ${b} m membrane.`),
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: c * Math.hypot(m / a, n / b) * Math.PI, feedback: t`That is the angular frequency $\omega$ in rad/s. Divide by $2\pi$ for hertz.` }, { value: (c / 2) * (m / a + n / b), feedback: t`The wavenumbers add like the sides of a right triangle: $\sqrt{(m/a)^2 + (n/b)^2}$, not $m/a + n/b$.` }],
          hints: [t`$c = \sqrt{T/\sigma}$.`, t`$f_{mn} = \dfrac{c}{2}\sqrt{\dfrac{m^2}{a^2} + \dfrac{n^2}{b^2}}$.`],
          teach: 'Membrane frequency: f = (c/2)√((m/a)² + (n/b)²), with c = √(T/σ).',
          explain: t`$c = \sqrt{${T}/${s}} = ${r3(c)}$ m/s; $f_{${m}${n}} = \tfrac{${r3(c)}}{2}\sqrt{(${m}/${a})^2 + (${n}/${b})^2} = ${r3(f)}$ Hz.`,
        };
      },
    }),
    num({
      id: 'laplace-rectangle', difficulty: 3,
      gen(r) {
        const asp = r.pick([0.5, 1, 2]), A = r.pick([50, 80, 100]);
        const val = A * Math.sinh((Math.PI * asp) / 2) / Math.sinh(Math.PI * asp);
        return {
          prompt: t`A plate occupies $0 \le x \le a$, $0 \le y \le b$ with $b = ${asp}a$. Its top edge is held at $u = ${A}\sin(\pi x/a)$ (°C) and the other three edges at 0. Separation gives $u = ${A}\,\dfrac{\sinh(\pi y/a)}{\sinh(\pi b/a)}\sin\dfrac{\pi x}{a}$. What is the steady temperature at the centre, in °C?`,
          visual: { type: 'c3-contour', params: { f: `${A}*sinh(pi*y)/sinh(pi*${asp})*sin(pi*x)`, x: [0, 1], y: [0, asp], levels: 8, labels: false, xlabel: 'x / a', ylabel: 'y / a', points: [{ x: 0.5, y: asp / 2, color: 'gold' }] }, caption: 'The steady temperature (shaded, contours) with the centre marked; hottest along the top edge.' },
          answer: val, units: '°C', tol: { rel: 0.005 },
          errors: [{ value: A / 2, feedback: t`Halfway up is not half the top temperature: the $\sinh$ profile sags toward the cold bottom.` }],
          hints: [t`At the centre $x = a/2$ (so the sine is 1) and $y = b/2$.`, t`$u = ${A}\,\sinh\big(\pi b/(2a)\big)/\sinh(\pi b/a)$ — equivalently $${A}\big/\big(2\cosh(\pi b/2a)\big)$.`],
          teach: 'On a rectangle the separated Laplace solution is a sine along the edge with data and a sinh across, which decays away from it.',
          explain: t`$u = ${A}\,\dfrac{\sinh(${tex((Math.PI * asp) / 2)})}{\sinh(${tex(Math.PI * asp)})} = ${r3(val)}$ °C. For a square this is ${A}×${r4(centreSq)}: the data’s pattern fades into the plate over a distance of about $a/\pi$.`,
        };
      },
    }),
    multi({
      id: 'degenerate', difficulty: 2,
      prompt: t`On a square membrane, $\omega_{mn} \propto \sqrt{m^2 + n^2}$. Which modes share the frequency of the $(5, 5)$ mode? (Select all that apply.)`,
      visual: { type: 'graph', params: { x: [0, 8.2], y: [0, 8.2], aspect: '', equal: true, xlabel: 'm', ylabel: 'n', axesAt: 'edge', curves: [{ param: ['sqrt(50)*cos(t)', 'sqrt(50)*sin(t)'], t: [0, 1.5708], color: 'gold', width: 2 }], points: Array.from({ length: 64 }, (_, i) => ({ x: 1 + (i % 8), y: 1 + Math.floor(i / 8), r: 2.5, color: 'ink3' })) }, caption: 'Each mode is a lattice point (m, n); the gold quarter-circle is √(m² + n²) = √50. Modes on it share one frequency.' },
      choices: ['(1, 7)', '(7, 1)', '(3, 6)', '(4, 6)', '(2, 7)'],
      answer: [0, 1],
      why: { 2: t`$9 + 36 = 45 \ne 50$.`, 3: t`$16 + 36 = 52 \ne 50$.`, 4: t`$4 + 49 = 53 \ne 50$.` },
      hints: [t`$5^2 + 5^2 = 50$. Which other pairs of whole numbers have squares adding to 50?`],
      teach: 'On a square, modes with equal m² + n² share a frequency — and sometimes (as for 50 = 1 + 49 = 25 + 25) not only the swapped pair.',
      explain: t`$1 + 49 = 50$: $(1, 7)$ and $(7, 1)$ share the frequency of $(5, 5)$. That triple degeneracy is “accidental” — it comes from number theory, not from the square’s symmetry.`,
    }),
    mcq({
      id: 'chladni', difficulty: 2,
      prompt: t`On the unit square, the mixture $u_{12} + u_{21}$ (pictured) has its nodal line along the diagonal from top-left to bottom-right. Where is the nodal line of $u_{12} - u_{21}$?`,
      visual: mem({ m: 1, n: 2, mix: [2, 1, 1], aspect: 1, ladder: false }, t`The mixture $\sin\pi x\sin2\pi y + \sin2\pi x\sin\pi y$.`),
      choices: [t`along the other diagonal, $y = x$`, 'along the same diagonal', 'along both diagonals, making a cross', 'it has no interior nodal line'],
      answer: 0,
      why: {
        1: 'Changing the sign of one mode moves the nodal line: the two mixtures are different shapes.',
        2: 'A cross would need the (2, 2)-like pattern; this mixture is only of the pair (1, 2), (2, 1).',
        3: t`Factor it: it vanishes wherever $\cos\pi x = \cos\pi y$, which is a line inside the square.`,
      },
      hints: [t`$\sin2\theta = 2\sin\theta\cos\theta$: factor $\sin\pi x\sin2\pi y - \sin2\pi x\sin\pi y = 2\sin\pi x\sin\pi y\,(\cos\pi y - \cos\pi x)$.`],
      teach: 'Mixtures of degenerate modes are modes too, and their nodal lines depend on the mixture.',
      explain: t`$u_{12} - u_{21} = 2\sin\pi x\sin\pi y\,(\cos\pi y - \cos\pi x)$, zero inside only where $\cos\pi x = \cos\pi y$, i.e. $y = x$. Likewise $u_{12} + u_{21}$ carries $(\cos\pi y + \cos\pi x)$, zero on $y = 1 - x$.`,
    }),
    num({
      id: 'aspect-split', difficulty: 2,
      gen(r) {
        const q = r.pick([1.2, 1.5, 2, 2.5]);
        const ratio = Math.hypot(2, 1 / q) / Math.hypot(1, 2 / q);
        return {
          prompt: t`A rectangular membrane has $b = ${q}\,a$. By what factor does the frequency of the $(2, 1)$ mode exceed that of the $(1, 2)$ mode?`,
          visual: mem({ m: 2, n: 1, aspect: Math.min(2, q), ladder: false }, `The (2, 1) mode on a rectangle with b = ${q}a${q > 2 ? ' (drawn at b = 2a)' : ''}.`),
          answer: ratio, tol: { rel: 0.002 },
          errors: [{ value: 1 / ratio, feedback: 'Inverted: the (2, 1) mode has its two half-waves along the shorter side, so it is the higher one.' }],
          hints: [t`$\omega_{mn} \propto \sqrt{(m/a)^2 + (n/b)^2}$. Set $a = 1$, $b = ${q}$.`, t`Ratio $= \sqrt{4 + 1/${q}^2}\big/\sqrt{1 + 4/${q}^2}$.`],
          teach: 'Stretching a square breaks its degeneracy: modes with more half-waves along the short side rise above their partners.',
          explain: t`$\dfrac{\omega_{21}}{\omega_{12}} = \dfrac{\sqrt{4 + 1/${tex(q * q)}}}{\sqrt{1 + 4/${tex(q * q)}}} = ${r4(ratio)}$. At $b = a$ the ratio is 1: the degenerate pair.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sail', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([5, 10, 20]), T = r.pick([2, 5, 10]), s = 0.01;
        const c = Math.sqrt(T / s), f = (c / 2) * Math.SQRT2 / a;
        return {
          prompt: t`A square membrane ${a} m on a side — a ground-test article for a solar sail — is tensioned to $T = ${T}$ N/m along its edges. The film and its coatings weigh $\sigma = ${s * 1000}\ \text{g/m}^2$. What is its fundamental frequency, in Hz?`,
          visual: mem({ m: 1, n: 1, aspect: 1, ladder: false }, 'The fundamental (1, 1) mode: the whole membrane moves in one piece. Real sails are triangular quadrants with uneven tension and wrinkles; this is the idealized square.'),
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: (c / 2) / a, feedback: t`The fundamental is $(1, 1)$: $\sqrt{1^2 + 1^2} = \sqrt2$, not 1.` }, { value: c * Math.SQRT2 / a * Math.PI, feedback: t`That is $\omega_{11}$ in rad/s; divide by $2\pi$.` }],
          hints: [t`$c = \sqrt{T/\sigma}$ with $\sigma$ in kg/m².`, t`$f_{11} = \dfrac{c}{2a}\sqrt2$.`],
          teach: 'Large, light, lightly tensioned membranes have very low fundamentals — a structural-dynamics concern for sails and sunshields.',
          explain: t`$c = \sqrt{${T}/${s}} = ${r3(c)}$ m/s and $f_{11} = \dfrac{${r3(c)}\sqrt2}{2\times${a}} = ${r3(f)}$ Hz. Attitude-control thrusters and reaction wheels must avoid exciting such low frequencies.`,
        };
      },
    }),
    mcq({
      id: 'cp-inharmonic', difficulty: 2,
      prompt: t`Why does a square drum sound unlike a guitar string, even when both have the same lowest note?`,
      visual: mem({ m: 1, n: 1, aspect: 1, ladder: true, count: 12 }, 'The square’s frequency ladder: overtones at √(5/2), 2, √5, √(13/2)… times the fundamental, mostly off the whole-number ticks.'),
      choices: ['Its overtones are not whole-number multiples of the fundamental, so they do not blend into one pitch', 'It has fewer overtones than a string', 'Its fundamental is a different shape', 'A membrane vibrates only in its fundamental'],
      answer: 0,
      why: {
        1: 'In two dimensions the modes crowd together: there are more overtones per octave, not fewer.',
        2: 'The shape of a mode does not by itself set the timbre; the mix of frequencies does.',
        3: 'Struck membranes vibrate in many modes at once, like strings.',
      },
      hints: [t`Compare the string’s $f_n = n f_1$ with the square’s $f_{mn} \propto \sqrt{m^2 + n^2}$.`],
      teach: 'A string’s overtones are harmonic (n f₁); a membrane’s, √(m² + n²)-like, are not — which is why drums sound percussive.',
      explain: t`A string’s overtones $2f_1, 3f_1, \dots$ line up with the harmonic series, and the ear fuses them into one pitch. The square’s $\sqrt{5/2} \approx 1.58$, 2, $\sqrt5 \approx 2.24$… mostly miss it, so the sound is a clang rather than a note.`,
    }),
    num({
      id: 'cp-two-edges', difficulty: 3,
      gen(r) {
        const A = r.pick([40, 60, 100]), Bv = r.pick([20, 30, 50]);
        const val = (A + Bv) * centreSq;
        return {
          prompt: t`A square plate of side $a$ has its top edge held at $${A}\sin(\pi x/a)$ °C, its bottom edge at $${Bv}\sin(\pi x/a)$ °C and its two sides at 0 °C. What is the steady temperature at its centre, in °C?`,
          visual: { type: 'c3-contour', params: { f: `(${A}*sinh(pi*y) + ${Bv}*sinh(pi*(1 - y)))/sinh(pi)*sin(pi*x)`, x: [0, 1], y: [0, 1], levels: 8, labels: false, xlabel: 'x / a', ylabel: 'y / a', points: [{ x: 0.5, y: 0.5, color: 'gold' }] }, caption: 'The steady temperature with the centre marked.' },
          answer: val, units: '°C', tol: { rel: 0.005 },
          errors: [{ value: (A + Bv) / 2, feedback: 'The centre is not the average of the two edges’ peaks: each edge’s pattern decays as sinh toward the middle.' }, { value: A * centreSq, feedback: 'Include the bottom edge too: solve each edge separately and add.' }],
          hints: ['Superpose: the problem with only the top edge hot, plus the one with only the bottom edge hot.', t`For a square with one edge at $A\sin(\pi x/a)$, the centre value is $A\sinh(\pi/2)/\sinh\pi \approx ${r4(centreSq)}A$; by symmetry the same holds for the bottom edge.`],
          teach: 'Linear boundary-value problems superpose: split the boundary data edge by edge and add the solutions.',
          explain: t`Each edge contributes ${r4(centreSq)} times its peak value at the centre: $(${A} + ${Bv})\times${r4(centreSq)} = ${r3(val)}$ °C.`,
        };
      },
    }),
  ],
  sources: [SRC.strauss, { label: 'R. Haberman, Applied Partial Differential Equations, 5th ed. (Pearson, 2013), ch. 7 (the vibrating rectangular membrane)', url: 'https://openlibrary.org/isbn/9780321797056' }, { label: 'M. Kac, “Can one hear the shape of a drum?”, Amer. Math. Monthly 73, 1 (1966)', url: 'https://doi.org/10.2307/2313748' }],
});
