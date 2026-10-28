// The circular membrane: separating the wave equation in polar coordinates
// gives Θ = cos mθ and Bessel's equation for R(r); keeping the solution
// finite at the centre picks J_m(kr), and the fixed rim quantizes k = j_mn/a.
// What a physicist reads from J_m: r^m near the centre (only m = 0 modes
// move the middle), a 1/√r cosine far out (cylindrical waves; line sources
// fall 3 dB per doubling), and zeros spaced ≈ π (McMahon). Zeros are computed
// by model/pde2-membrane.js, never typed. Worked example: a measurement
// microphone's diaphragm. (Drum overtone ratios and mode identification are
// st-b B7.3's.)
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { tn, curvesPic } from './_wv.js';
import { besselZero } from '../../src/viz/model/pde2-membrane.js';

const t = String.raw;
const mcm = (m, n) => (n + m / 2 - 0.25) * Math.PI;    // McMahon's leading estimate of j_mn

// the worked example: a model of a half-inch measurement microphone's diaphragm
const EX = (() => {
  const a = 4.5e-3, h = 5e-6, rho = 8900, T = 2500;
  const s = rho * h, v = Math.sqrt(T / s), j01 = besselZero(0, 1), j11 = besselZero(1, 1), j02 = besselZero(0, 2);
  const f = (j) => (j * v) / (2 * Math.PI * a);
  return { a, h, rho, T, s, v, j01, j11, j02, f01: f(j01), f11: f(j11), f02: f(j02), m01: mcm(0, 1) };
})();

const jPic = (ms, caption, more = {}) => curvesPic(
  ms.map((m, i) => ({ fn: `besselj(${m}, x)`, color: ['accent', 'gold', 'violet', 'teal'][i % 4], width: 2.2, label: `J${'₀₁₂₃₄₅'[m]}`, labelAt: [1.2, 2.4, 3.6, 5][i % 4], labelDy: -14 })),
  [0, more.xmax ?? 14], [-0.5, 1.1], caption, { xlabel: 'x', ylabel: '', ...more.params },
);

export default lesson({
  id: 'phys3750.W8.2',
  title: 'The circular membrane and Bessel functions',
  minutes: 17, difficulty: 4,
  intro: t`On a drum the natural coordinates are polar, where $\nabla^2u = u_{rr} + \tfrac1ru_r + \tfrac{1}{r^2}u_{\theta\theta}$. Separating $u = R(r)\cos(m\theta)\cos\omega t$ with whole $m$ leaves, for $k = \omega/v$, **Bessel’s equation**

$$\begin{gathered}r^2R'' + rR' + (k^2r^2 - m^2)R = 0 \\ \Rightarrow\ R = J_m(kr), \quad \omega_{mn} = \frac{v\,j_{mn}}{a}\end{gathered}$$

Of its two solutions only $J_m$ stays finite at the centre. The rim $r = a$ is fixed, so $ka$ must be a zero of $J_m$: $j_{mn}$, the $n$-th one. Bessel functions are just what sines become in polar coordinates — they wiggle like $\cos$, but start like $r^m$ and fade like $1/\sqrt r$. Mode shapes, overtone ratios and why drums are inharmonic are in [disks, spheres and special functions](#/lesson/st-b.B7.3); here we read the functions themselves.`,
  symbols: [
    { tex: 'R(r),\\ \\cos m\\theta', text: 'the radial and angular parts of a mode; $m$ (a whole number) counts nodal diameters' },
    { tex: 'J_m(x)', text: 'the Bessel function of order $m$: the solution of Bessel’s equation that is finite at $x = 0$' },
    { tex: 'j_{mn}', text: 'the $n$-th positive zero of $J_m$ (computed numerically: $j_{01} \\approx 2.405$)' },
    { tex: 'a', text: 'the drum’s radius, in m' },
    { tex: 'v = \\sqrt{T/\\sigma}', text: 'the membrane’s wave speed: tension per length (N/m) over mass per area (kg/m²)' },
    { tex: 'k = \\omega/v', text: 'the wavenumber, in rad/m' },
  ],
  why: t`Bessel functions describe every wave with a circular edge or axis: drums and microphones, optical fibres, the Airy disc of a telescope, waves round a cylinder — and their asymptotic $1/\sqrt r$ is the cylindrical wave.`,
  visual: {
    type: 'pde2-membrane',
    title: 'Drum modes are Bessel functions',
    lead: t`One mode $J_m(j_{mn}r/a)\cos m\theta$ seen from above or in 3D, and the ladder of the lowest modes. Watch how each mode behaves at the centre.`,
    tasks: [
      t`Step $n$ with $m = 0$: the centre moves in every one; each new zero of $J_0$ adds a nodal circle.`,
      t`Set $m = 1, 2, 3$: the centre is now still — near it $J_m \propto r^m$, flatter the higher $m$.`,
      t`On the ladder, the gaps between modes of the same $m$ settle toward equal steps: zeros of $J_m$ end up $\pi$ apart.`,
    ],
    params: { shape: 'disk', m: 0, n: 2, controls: ['m', 'n'], count: 12 },
    caption: t`An ideal membrane fixed at its rim: no stiffness, no air loading, small displacements (exaggerated). Bessel zeros are computed by bisection, not taken from a table.`,
  },
  example: {
    prompt: t`Model the diaphragm of a half-inch measurement microphone as a nickel membrane of radius ${tn(EX.a * 1e3)} mm and thickness ${tn(EX.h * 1e6)} μm (density ${EX.rho} kg/m³) under a tension of ${EX.T} N/m. Find its fundamental and its next two modes.`,
    steps: [
      { label: 'Wave speed', text: t`$\sigma = \rho h = ${tn(EX.s)}$ kg/m², so $v = \sqrt{T/\sigma} = ${tn(EX.v)}$ m/s.` },
      { label: 'First zero', text: t`$J_0$ first crosses zero at $j_{01} = ${tn(EX.j01, 5)}$ (found numerically). McMahon’s estimate $(n + \tfrac m2 - \tfrac14)\pi$ gives $\tfrac34\pi = ${tn(EX.m01, 4)}$ — already within 2%.` },
      { label: 'Fundamental', text: t`$f_{01} = \dfrac{j_{01}v}{2\pi a} = ${tn(EX.f01 / 1e3)}$ kHz.` },
      { label: 'Next modes', text: t`$(1, 1)$: $j_{11} = ${tn(EX.j11, 4)}$, $f = ${tn(EX.f11 / 1e3)}$ kHz — a rocking mode with a still centre and a nodal diameter. $(0, 2)$: $j_{02} = ${tn(EX.j02, 4)}$, $f = ${tn(EX.f02 / 1e3)}$ kHz, with one nodal circle.` },
      { label: 'Sense check', text: t`A uniform sound pressure pushes every point the same way, so it drives only the symmetric $m = 0$ modes; the rocking $(1, 1)$ mode stays nearly silent. The microphone is flat below $f_{01}$ and is designed with $f_{01}$ near the top of its band. (Real diaphragms are also stiffened and damped by the air film behind them.)` },
    ],
    answer: t`$f_{01} \approx ${tn(EX.f01 / 1e3, 3)}$ kHz, then $f_{11} \approx ${tn(EX.f11 / 1e3, 3)}$ kHz and $f_{02} \approx ${tn(EX.f02 / 1e3, 3)}$ kHz — in the ratios $1 : ${tn(EX.j11 / EX.j01, 3)} : ${tn(EX.j02 / EX.j01, 3)}$, not whole numbers.`,
    visual: jPic([0, 1], t`$J_0$ and $J_1$ against $x = kr$. The rim sits at a zero: $x = j_{01}$ for the fundamental, $j_{11}$ for the rocking mode.`, { params: { points: [{ x: EX.j01, y: 0, color: 'accent', label: 'j₀₁', labelDy: 14 }, { x: EX.j11, y: 0, color: 'gold', label: 'j₁₁', labelDy: 14 }] } }),
  },
  practice: [
    order({
      id: 'derive-bessel', difficulty: 3,
      prompt: 'Put the steps from the wave equation on a drum to its mode frequencies in order.',
      visual: { type: 'pde2-membrane', params: { shape: 'disk', m: 2, n: 1, ladder: false, readout: false, controls: [] }, caption: 'A mode with two nodal diameters, cos 2θ, from above.' },
      items: [
        t`Write $\nabla^2u$ in polar coordinates`,
        t`Try $u = R(r)\Theta(\theta)\cos\omega t$`,
        t`$\Theta'' = -m^2\Theta$, $m$ whole`,
        t`Bessel’s equation for $R$, with $k = \omega/v$`,
        t`Keep $J_m(kr)$, finite at the centre`,
        t`Fixed rim: $ka = j_{mn}$`,
      ],
      hints: ['Coordinates first, then the product guess, then the angle, then the radius.', 'The rim condition comes last: it quantizes the k that Bessel’s equation leaves free.'],
      teach: 'Separation in polar coordinates: angle first (whole m), then Bessel’s equation in r, then the boundary quantizes k.',
      explain: t`The angular equation fixes $m$; Bessel’s equation of order $m$ then has $J_m$ as its only well-behaved solution; and $J_m(ka) = 0$ gives $\omega_{mn} = vj_{mn}/a$.`,
    }),
    mcq({
      id: 'reject-y', difficulty: 2,
      prompt: t`Bessel’s equation has a second solution, $Y_m(kr)$, which behaves like $\ln r$ (for $m = 0$) or $r^{-m}$ near $r = 0$. Why is it left out for a drum?`,
      visual: jPic([0, 1, 2], t`$J_0$, $J_1$, $J_2$: all finite at $x = 0$; the discarded $Y_m$ (not drawn) diverges there.`),
      choices: [
        'It would make the displacement infinite at the centre of the drumhead',
        'It does not satisfy Bessel’s equation exactly, only approximately',
        'It is always zero at the rim, so it cannot carry a mode',
        'It describes waves travelling inward, which a drum cannot have',
      ],
      answer: 0,
      why: {
        1: t`$Y_m$ solves Bessel’s equation exactly; it is excluded by behaviour at the centre, not by the equation.`,
        2: t`$Y_m$ has its own zeros, but it need not vanish at the rim; that is not the reason.`,
        3: t`Inward and outward travelling waves are combinations $J_m \pm iY_m$ (Hankel functions); a drum’s standing modes need only finiteness.`,
      },
      hints: [t`The centre $r = 0$ is part of the drumhead.`, t`$\ln r \to -\infty$ and $r^{-m} \to \infty$ as $r \to 0$.`],
      teach: t`Boundary conditions include regularity: a solution must stay finite at the centre, which keeps $J_m$ and drops $Y_m$.`,
      explain: t`A real membrane has finite displacement everywhere, so only $J_m$ survives. For an annulus — a drum with a hole — the centre is not part of the membrane and $Y_m$ comes back.`,
    }),
    {
      type: 'point', id: 'find-zero', difficulty: 2,
      gen(r) {
        const m = r.int(0, 3), n = r.int(1, 2), z = besselZero(m, n);
        return {
          prompt: t`The curve is $J_{${m}}(x)$. Drag the point to its ${n === 1 ? 'first' : 'second'} positive zero, $j_{${m}${n}}$ — where a drum’s rim must sit for the mode $(${m}, ${n})$.`,
          visual: curvesPic([{ fn: `besselj(${m}, x)`, color: 'accent', width: 2.4 }], [0, 14], [-0.5, 1.1], t`$J_{${m}}(x)$ for $0 \le x \le 14$.`, { xlabel: 'x', ylabel: '', drag: [{ key: 'p', x: 0.5, y: 0.6, snap: 0.02 }] }),
          answer: { x: z, y: 0 }, tol: { x: 0.12, y: 0.06 },
          instruction: 'Drag the point onto the zero, then check.',
          hints: [t`Count the crossings of the axis, ignoring $x = 0$${m > 0 ? t` (where $J_{${m}}$ only touches zero)` : ''}.`, t`McMahon’s estimate: $(n + \tfrac m2 - \tfrac14)\pi = ${tn(mcm(m, n), 3)}$.`],
          teach: t`The zeros $j_{mn}$ are where the curve crosses the axis; a drum with its rim there vibrates in mode $(m, n)$.`,
          explain: t`$j_{${m}${n}} = ${tn(z, 4)}$ (McMahon: $${tn(mcm(m, n), 4)}$). The drum’s frequency is $vj_{${m}${n}}/2\pi a$.`,
        };
      },
    },
    mcq({
      id: 'centre-strike', difficulty: 3,
      prompt: t`A drumhead is struck exactly at its centre. Which modes can the blow excite?`,
      visual: jPic([0, 1, 2], t`Near $x = 0$: $J_0 \to 1$, while $J_1 \propto x$ and $J_2 \propto x^2$ start at zero.`, { xmax: 6 }),
      choices: [t`Only the $m = 0$ modes: every mode with $m \ge 1$ is still at the centre`, t`Every mode, but the $m = 0$ ones most strongly`, t`Only the fundamental $(0, 1)$, since it is the largest mode at the centre`, t`Only the modes with $m \ge 1$, because $J_0$ is flat at the centre`],
      answer: 0,
      why: {
        1: t`A mode at whose centre the drum does not move cannot be pushed from there: $J_m(0) = 0$ for $m \ge 1$ gives exactly zero.`,
        2: t`Every $(0, n)$ mode moves at the centre ($J_0(0) = 1$), so all of them are excited, not just the fundamental.`,
        3: t`Flat means zero slope, not zero displacement: $J_0(0) = 1$, the centre moves.`,
      },
      hints: [t`A force at a point excites a mode in proportion to the mode’s displacement there.`, t`$J_m(x) \approx (x/2)^m/m!$ near $x = 0$.`],
      teach: t`Only $m = 0$ modes move the centre, since $J_m \propto r^m$ there: striking a drum at its centre excites only those.`,
      explain: t`So a centre strike gives the $(0, n)$ series only — $f$ in the ratios $j_{0n}/j_{01} = 1, ${tn(besselZero(0, 2) / besselZero(0, 1), 3)}, ${tn(besselZero(0, 3) / besselZero(0, 1), 3)}, \ldots$ — a dull thud. Drummers strike off-centre to bring in the $m \ge 1$ modes.`,
    }),
    num({
      id: 'line-source', difficulty: 3,
      gen(r) {
        const L1 = r.pick([72, 78, 84]), r1 = r.pick([20, 30, 50]), m = r.pick([2, 4, 8, 10]);
        const L2 = L1 - 10 * Math.log10(m);
        return {
          prompt: t`Far from a line source the waves are cylindrical, with amplitude $\propto 1/\sqrt r$ — the envelope of $J_0$ pictured. A busy straight highway produces ${L1} dB at ${r1} m. Treating it as a long line source in open ground, what level is heard at ${r1 * m} m?`,
          visual: curvesPic([{ fn: 'besselj(0, x)', color: 'accent', width: 2.2, domain: [0, 40] }, { fn: 'sqrt(2/(pi*x))', color: 'gold', dash: [5, 4], width: 1.2, domain: [0.3, 40] }, { fn: '-sqrt(2/(pi*x))', color: 'gold', dash: [5, 4], width: 1.2, domain: [0.3, 40] }], [0, 40], [-1, 1.2], t`$J_0(x)$ and its envelope $\sqrt{2/\pi x}$: amplitude $\propto 1/\sqrt r$, intensity $\propto 1/r$.`, { xlabel: 'x = k r', ylabel: '' }),
          answer: L2, units: 'dB', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: L1 - 20 * Math.log10(m), feedback: t`That is a **point** source (intensity $\propto 1/r^2$). A line source spreads over cylinders: intensity $\propto 1/r$.` }],
          hints: [t`Power through a cylinder of radius $r$ and length $\ell$: $I \times 2\pi r\ell$ is constant, so $I \propto 1/r$.`, t`$\Delta L = 10\log_{10}(r_2/r_1)$.`],
          teach: t`Cylindrical waves: amplitude $\propto 1/\sqrt r$, intensity $\propto 1/r$ — 3 dB per doubling instead of 6.`,
          explain: t`$${L1} - 10\log_{10}${m} = ${tn(L2)}$ dB. Bessel’s asymptotic form $J_0(x) \approx \sqrt{2/\pi x}\cos(x - \pi/4)$ is this $1/\sqrt r$ in disguise.`,
        };
      },
    }),
    num({
      id: 'mode-from-fund', difficulty: 2,
      gen(r) {
        const f01 = r.pick([90, 140, 220]), [m, n] = r.pick([[1, 1], [2, 1], [0, 2], [1, 2], [3, 1]]);
        const ratio = besselZero(m, n) / besselZero(0, 1), f = f01 * ratio;
        return {
          prompt: t`A tom-tom’s fundamental is ${f01} Hz. Treating its head as an ideal membrane, what is the frequency of its $(m, n) = (${m}, ${n})$ mode, in Hz? (The $j_{mn}$ are the zeros of $J_m$: $j_{01} = ${tn(besselZero(0, 1), 4)}$, $j_{${m}${n}} = ${tn(besselZero(m, n), 4)}$.)`,
          visual: { type: 'pde2-membrane', params: { shape: 'disk', m, n, ladder: false, readout: false, controls: [] }, caption: `Mode (${m}, ${n}) from above (blue up, orange down).` },
          answer: f, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: f01 * (m + n), feedback: 'Drum overtones are not whole multiples of the fundamental: scale by the ratio of Bessel zeros.' }],
          hints: [t`Every mode has $f_{mn} = vj_{mn}/2\pi a$, with the same $v/2\pi a$.`, t`$f_{${m}${n}} = f_{01}\,j_{${m}${n}}/j_{01}$.`],
          teach: t`Frequencies scale with the Bessel zeros: $f_{mn}/f_{01} = j_{mn}/j_{01}$.`,
          explain: t`$${f01} \times ${tn(besselZero(m, n), 4)}/${tn(besselZero(0, 1), 4)} = ${tn(f)}$ Hz. A real drum’s air load shifts these — tuned timpani deliberately bring the $m = 1, 2, 3$ modes nearly into the ratios 2 : 3 : 4.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-graphene', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([1.5, 2.5, 4]) * 1e-6, T = r.pick([0.02, 0.05, 0.1]), s = 7.6e-7;
        const v = Math.sqrt(T / s), f = (besselZero(0, 1) * v) / (2 * Math.PI * a);
        return {
          prompt: t`A graphene drum — one atomic layer, $\sigma = 7.6 \times 10^{-7}$ kg/m² — is stretched over a hole of radius ${tn(a * 1e6)} μm with tension ${T} N/m, as in nanomechanical mass sensors. What is its fundamental frequency, in MHz? ($j_{01} = ${tn(besselZero(0, 1), 4)}$.)`,
          visual: { type: 'pde2-membrane', params: { shape: 'disk', m: 0, n: 1, ladder: false, readout: false, controls: [] }, caption: 'The fundamental (0, 1): the whole drum moves together.' },
          answer: f / 1e6, units: 'MHz', tol: { rel: 0.01 },
          errors: [{ value: (besselZero(0, 1) * v) / a / 1e6, feedback: t`That is $\omega$; divide by $2\pi$.` }, { value: v / (2 * a) / 1e6, feedback: t`That is a string’s $v/2L$ with $L = a$. A drum’s fundamental is $j_{01}v/2\pi a$.` }],
          hints: [t`$v = \sqrt{T/\sigma}$.`, t`$f_{01} = j_{01}v/(2\pi a)$.`],
          teach: t`$f_{01} = j_{01}v/2\pi a$ at every scale, from timpani to graphene.`,
          explain: t`$v = ${tn(v)}$ m/s; $f_{01} = ${tn(besselZero(0, 1), 4)} \times ${tn(v)}/(2\pi \times ${tn(a)}) = ${tn(f / 1e6)}$ MHz. A molecule landing on the drum adds mass and lowers this frequency measurably.`,
        };
      },
    }),
    mcq({
      id: 'cp-zero-spacing', difficulty: 3,
      prompt: t`For large $n$, consecutive zeros of $J_m$ are almost exactly $\pi$ apart. Why?`,
      visual: jPic([0], t`$J_0(x)$ out to $x = 30$: its zeros settle into an even spacing.`, { xmax: 30 }),
      choices: [
        t`Far from the centre $J_m(x) \approx \sqrt{2/\pi x}\cos(x - m\pi/2 - \pi/4)$, a cosine whose zeros are $\pi$ apart`,
        t`Bessel functions are periodic with period $2\pi$, like sines`,
        t`Because the drum’s rim forces equally spaced zeros`,
        t`The zeros are exactly $\pi$ apart for every $n$; the first one is just shifted`,
      ],
      answer: 0,
      why: {
        1: t`They are not periodic: the amplitude keeps shrinking like $1/\sqrt x$ and the early zeros are not $\pi$ apart.`,
        2: t`The zeros belong to the function $J_m$ alone; the rim only chooses which one it sits at.`,
        3: t`Early gaps differ from $\pi$: $j_{02} - j_{01} = ${tn(besselZero(0, 2) - besselZero(0, 1), 4)}$, $j_{03} - j_{02} = ${tn(besselZero(0, 3) - besselZero(0, 2), 4)}$.`,
      },
      hints: ['What does Bessel’s equation look like when x is large, so that m²/x² is negligible?', t`With $R = w/\sqrt x$ it becomes $w'' + w \approx 0$.`],
      teach: t`Far out, a Bessel function is a cosine under a $1/\sqrt x$ envelope, so its zeros approach a spacing of $\pi$ (McMahon: $j_{mn} \approx (n + \tfrac m2 - \tfrac14)\pi$).`,
      explain: t`For $J_0$: gaps $${tn(besselZero(0, 2) - besselZero(0, 1), 4)}$, $${tn(besselZero(0, 3) - besselZero(0, 2), 4)}$, …, $j_{0,10} - j_{0,9} = ${tn(besselZero(0, 10) - besselZero(0, 9), 5)}$ → $\pi$. High drum modes therefore form an evenly spaced ladder in each $m$.`,
    }),
    num({
      id: 'cp-mcmahon', difficulty: 2,
      gen(r) {
        const m = r.int(0, 2), n = r.int(3, 5);
        const est = mcm(m, n), z = besselZero(m, n), err = ((est - z) / z) * 100;
        return {
          prompt: t`McMahon’s estimate of the zeros of $J_m$ is $j_{mn} \approx (n + \tfrac m2 - \tfrac14)\pi$. Evaluate it for $(m, n) = (${m}, ${n})$.`,
          visual: curvesPic([{ fn: `besselj(${m}, x)`, color: 'accent', width: 2.2 }], [0, 20], [-0.5, 1.1], t`$J_{${m}}(x)$; count its zeros from the left (not $x = 0$).`, { xlabel: 'x', ylabel: '' }),
          answer: est, tol: { rel: 0.003 },
          errors: [{ value: (n + m / 2 + 0.25) * Math.PI, feedback: t`The correction is $-\tfrac14$, not $+\tfrac14$.` }, { value: (n + m - 0.25) * Math.PI, feedback: t`The order enters as $m/2$.` }].filter((e) => Math.abs(e.value - est) > 0.01 * est),
          hints: [t`Substitute: $(${n} + ${m}/2 - 1/4)\pi$.`, t`$= ${tn(n + m / 2 - 0.25)}\pi$.`],
          teach: t`McMahon: $j_{mn} \approx (n + \tfrac m2 - \tfrac14)\pi$, better for larger $n$.`,
          explain: t`$${tn(n + m / 2 - 0.25)}\pi = ${tn(est, 4)}$; the true zero, computed numerically, is $${tn(z, 5)}$ — an error of $${tn(err, 2)}\%$.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 12–13 (DigitalCommons@USU)', url: 'https://digitalcommons.usu.edu/foundation_wave/1/' },
    { label: 'NIST Digital Library of Mathematical Functions, §10.21: zeros of Bessel functions (McMahon’s expansion)', url: 'https://dlmf.nist.gov/10.21' },
    { label: 'Bunch et al., Electromechanical resonators from graphene sheets, Science 315, 490 (2007)', url: 'https://doi.org/10.1126/science.1136836' },
  ],
});
