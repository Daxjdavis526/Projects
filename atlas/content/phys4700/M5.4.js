// Spherical harmonics (Griffiths & Schroeter §4.1.2 and §4.3.2). The
// eigenfunctions of L̂² and L̂_z: Y_l^m = N_lm e^{imφ} P_l^m(cos θ),
// orthonormal on the sphere, parity (−1)^l; L̂_z = −iħ∂_φ makes m the number
// of phase turns round the z-axis; L̂± in spherical coordinates walk between
// them. Measurement: an angular wave function's components along the Y_l^m
// give the probabilities of L² and L_z — worked for cos θ + sin θ cos φ,
// and with different normalizations tripping the unwary. |Y_l^l|² ∝ sin^{2l} θ
// crowds onto the equator as l grows (the classical orbit). Explore: |Y_l^m|²
// as a 3D shape for l ≤ 3. Transfer: GRACE gravity fields expanded in
// spherical harmonics, resolution ≈ πR/l. The mathematician's view (Legendre
// functions, completeness, multipoles) is st-e.E6–E7; the chemist's orbitals
// are phys2710.MP8.2. Every formula was checked against
// src/viz/model/mp-orbitals.js.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { seg, label, r6 } from './_qm.js';

const t = String.raw;
const D = Math.PI / 180;
// 4π|Y_l^m|² as expressions of u = θ, with their maxima
const Y2 = [
  ['0', 0, '1', 1], ['1', 0, '3*cos(u)^2', 3], ['1', 1, '1.5*sin(u)^2', 1.5],
  ['2', 0, '1.25*(3*cos(u)^2 - 1)^2', 5], ['2', 1, '7.5*sin(u)^2*cos(u)^2', 1.875], ['2', 2, '1.875*sin(u)^4', 1.875],
  ['3', 0, '1.75*(5*cos(u)^3 - 3*cos(u))^2', 7], ['3', 1, '1.3125*sin(u)^2*(5*cos(u)^2 - 1)^2', 2.48889], ['3', 2, '13.125*sin(u)^4*cos(u)^2', 1.94444], ['3', 3, '2.1875*sin(u)^6', 2.1875],
];
const yShape = (k) => `(${Y2[k][2]})/${Y2[k][3]}`;
/** A shape r(θ, φ) drawn as a parametric surface, u = θ, v = φ. */
const shape = (r, { sliders, choices, caption, yaw = 0.6, pitch = 0.35, dist = 3.4 } = {}) => ({
  type: 'surface3d',
  params: {
    surface: [`(${r})*sin(u)*cos(v)`, `(${r})*sin(u)*sin(v)`, `(${r})*cos(u)`], domain: [[0, 3.14159], [0, 6.28319]], n: 40,
    yaw, pitch, dist, axisLen: 1.4, ...(sliders ? { sliders } : {}), ...(choices ? { choices } : {}),
  },
  caption,
});
const yPic = (l, m, caption) => shape(yShape(Y2.findIndex((y) => +y[0] === l && y[1] === Math.abs(m))), { caption });
/** P(|θ − 90°| < δ) for |Y_l^l|² ∝ sin^{2l}θ (Simpson's rule). */
function equatorP(l, d) {
  const f = (th) => Math.sin(th) ** (2 * l + 1), S = (a, b) => { const N = 2000, h = (b - a) / N; let s = f(a) + f(b); for (let i = 1; i < N; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return (s * h) / 3; };
  return S((90 - d) * D, (90 + d) * D) / S(0, Math.PI);
}

export default lesson({
  id: 'phys4700.M5.4',
  title: 'Spherical harmonics',
  minutes: 16, difficulty: 3,
  intro: t`The simultaneous eigenfunctions of $\hat L^2$ and $\hat L_z$ for orbital motion are the **spherical harmonics**, functions of direction alone:

$$Y_l^m(\theta, \phi) = \epsilon\,\sqrt{\frac{2l + 1}{4\pi}\frac{(l - |m|)!}{(l + |m|)!}}\;e^{im\phi}\,P_l^{|m|}(\cos\theta)$$

They are orthonormal over the sphere, $\int Y_l^{m*}Y_{l'}^{m'}\,d\Omega = \delta_{ll'}\delta_{mm'}$, and complete: any angular wave function is a sum of them. Its components are measurement amplitudes — $|c_{lm}|^2$ is the probability of finding $L^2 = \hbar^2l(l+1)$ **and** $L_z = \hbar m$. The integer $m$ counts how many times the phase turns round the $z$-axis; $l - |m|$ counts the circles of latitude where $Y$ vanishes.`,
  symbols: [
    { tex: 'Y_l^m(\\theta, \\phi)', text: t`the spherical harmonic: eigenfunction of $\hat L^2$ (eigenvalue $\hbar^2l(l+1)$) and $\hat L_z$ (eigenvalue $\hbar m$), dimensionless per steradian$^{1/2}$` },
    { tex: '\\theta,\\ \\phi', text: t`the polar angle from $+z$ ($0$ to $\pi$) and the azimuth from $+x$ ($0$ to $2\pi$)` },
    { tex: 'P_l^{|m|}', text: t`an associated Legendre function: a polynomial in $\cos\theta$ times $\sin^{|m|}\theta$` },
    { tex: '\\epsilon', text: t`a sign: $(-1)^m$ for $m > 0$ and $1$ otherwise (the Condon–Shortley phase, used by Griffiths and by SciPy)` },
    { tex: 'd\\Omega', text: t`the element of solid angle, $\sin\theta\,d\theta\,d\phi$` },
    { tex: 'l,\\ m', text: t`integers with $l \ge 0$ and $-l \le m \le l$` },
  ],
  why: 'Every central-force problem, every multipole expansion — from atomic orbitals to Earth’s gravity field and the cosmic microwave background — is written in spherical harmonics.',
  visual: {
    type: 'surface3d',
    title: 'The shapes of the spherical harmonics',
    lead: t`Each surface is drawn so that its distance from the centre in each direction is $|Y_l^m(\theta, \phi)|^2$ (rescaled so every shape is the same size). Pick a state.`,
    tasks: [
      t`Every shape is a body of revolution about $z$: $|Y|^2$ does not depend on $\phi$, because $\phi$ enters only through the phase $e^{im\phi}$.`,
      'Compare m = 0 with m = l at the same l: m = 0 crowds toward the poles, m = l toward the equator — angular momentum pointing up the z-axis means motion round it.',
      'Count the cones and planes where the surface pinches to the centre: l − |m| of them, the zeros of the Legendre function.',
    ],
    params: {
      surface: [`(${Y2.map((y, k) => `step(0.5 - abs(s - ${k}))*${yShape(k)}`).join(' + ')})*sin(u)*cos(v)`, `(${Y2.map((y, k) => `step(0.5 - abs(s - ${k}))*${yShape(k)}`).join(' + ')})*sin(u)*sin(v)`, `(${Y2.map((y, k) => `step(0.5 - abs(s - ${k}))*${yShape(k)}`).join(' + ')})*cos(u)`],
      domain: [[0, 3.14159], [0, 6.28319]], n: 44, yaw: 0.6, pitch: 0.35, dist: 3.4, axisLen: 1.4,
      choices: [{ key: 's', label: 'State', value: 3, options: Y2.map((y, k) => [k, t`$l = ${y[0]},\ m = ${y[1] ? '\\pm' : ''}${y[1]}$`]) }],
    },
    caption: t`Exact shapes, each scaled to the same maximum size; $|Y_l^{-m}|^2 = |Y_l^m|^2$, so one shape serves $\pm m$. Not shown: the phase $e^{im\phi}$, which winds $m$ times round the $z$-axis. Colour shows height only. Drag to rotate.`,
  },
  example: {
    prompt: t`A particle’s angular wave function is $f(\theta, \phi) = N(\cos\theta + \sin\theta\cos\phi)$ — a p orbital pointing midway between $z$ and $x$. Normalize it, expand it in spherical harmonics, and give the probabilities of each result for $L^2$ and $L_z$.`,
    visual: shape(`(cos(u) + sin(u)*cos(v))^2/2`, { caption: t`$|f|^2$ as a shape: two lobes along the direction $(1, 0, 1)/\sqrt2$. Drag to rotate.` }),
    steps: [
      { label: 'The harmonics needed', text: t`$Y_1^0 = \sqrt{\tfrac{3}{4\pi}}\cos\theta$ and $Y_1^{\pm1} = \mp\sqrt{\tfrac{3}{8\pi}}\sin\theta\,e^{\pm i\phi}$. So $\cos\theta = \sqrt{\tfrac{4\pi}{3}}Y_1^0$ and $\sin\theta\cos\phi = \sqrt{\tfrac{2\pi}{3}}\,\big(Y_1^{-1} - Y_1^1\big)$.` },
      { label: 'Expand', text: t`$f = N\sqrt{\tfrac{2\pi}{3}}\,\big(\sqrt2\,Y_1^0 + Y_1^{-1} - Y_1^1\big)$: only $l = 1$ appears.` },
      { label: 'Normalize', text: t`Orthonormality gives $\int|f|^2d\Omega = N^2\tfrac{2\pi}{3}(2 + 1 + 1) = N^2\tfrac{8\pi}{3}$, so $N = \sqrt{3/8\pi}$.` },
      { label: 'Probabilities', text: t`The normalized coefficients are $\tfrac{1}{2}(\sqrt2, 1, -1)$ for $m = 0, -1, +1$: $P(m = 0) = \tfrac12$ and $P(m = \pm1) = \tfrac14$ each. $L^2 = 2\hbar^2$ with certainty.` },
      { label: 'Check', text: t`$\langle L_z\rangle = \hbar\big(\tfrac14 - \tfrac14\big) = 0$, as it must be for a real wave function. Watch the normalizations: $\cos\theta$ and $\sin\theta\cos\phi$ have equal norms ($\int\cos^2\theta\,d\Omega = \int\sin^2\theta\cos^2\phi\,d\Omega = 4\pi/3$), so $m = 0$ and $m = \pm1$ share the probability equally; but $\sin\theta\,e^{\pm i\phi}$ has twice the norm of $\cos\theta$.` },
      { label: 'Geometry', text: t`The lobes point along $\hat n = (1, 0, 1)/\sqrt2$, at $45^\circ$ to $z$: this is the $m = 0$ state about $\hat n$. Measured along $z$, its angular momentum component is $0$ half the time and $\pm\hbar$ a quarter each — the rotation of an $l = 1$ state, exactly like the spin-1 analyser of an earlier lesson.` },
    ],
    answer: t`$f = \tfrac{1}{2}\big(\sqrt2\,Y_1^0 + Y_1^{-1} - Y_1^1\big)$ with $N = \sqrt{3/8\pi}$: $L^2 = 2\hbar^2$ for certain; $L_z = 0$ with probability $\tfrac12$, $\pm\hbar$ with $\tfrac14$ each.`,
  },
  practice: [
    num({
      id: 'lz-prob', difficulty: 3,
      gen(r) {
        const [a, b, c] = r.pick([[1, 1, 0], [2, 1, 0], [1, 0, 1], [1, 1, 1], [2, 1, 1], [1, 2, 0], [3, 1, 1], [1, 2, 1]]);
        const w = { 0: a * a, 1: 2 * b * b, '-1': 2 * c * c }, tot = w[0] + w[1] + w['-1'];
        const ms = ['0', '1', '-1'].filter((k) => w[k] > 0);
        const mq = r.pick(ms), ans = w[mq] / tot;
        const terms = [a ? `${a === 1 ? '' : a}\\cos\\theta` : '', b ? `${b === 1 ? '' : b}\\sin\\theta\\,e^{i\\phi}` : '', c ? `${c === 1 ? '' : c}\\sin\\theta\\,e^{-i\\phi}` : ''].filter(Boolean).join(' + ');
        const shp = `(${a * a}*cos(u)^2 + ${b * b + c * c}*sin(u)^2 + ${2 * a * (b + c)}*sin(u)*cos(u)*cos(v) + ${2 * b * c}*sin(u)^2*cos(2*v))/${r6(Math.max(a * a, (b + c) ** 2) + 2 * a * (b + c) + 0.001)}`;
        return {
          prompt: t`A particle’s angular wave function is proportional to $${terms}$. What is the probability that a measurement of $L_z$ gives $${mq === '0' ? '0' : mq === '1' ? '+\\hbar' : '-\\hbar'}$? (Recall $Y_1^0 = \sqrt{3/4\pi}\cos\theta$ and $Y_1^{\pm1} = \mp\sqrt{3/8\pi}\sin\theta\,e^{\pm i\phi}$.)`,
          visual: shape(shp, { caption: 'The angular probability |f|² as a shape (scaled). Drag to rotate.' }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: ({ 0: a * a, 1: b * b, '-1': c * c })[mq] / (a * a + b * b + c * c), feedback: t`The functions $\cos\theta$ and $\sin\theta\,e^{\pm i\phi}$ are not equally normalized: $\cos\theta = \sqrt{4\pi/3}\,Y_1^0$ but $\sin\theta\,e^{\pm i\phi} = \mp\sqrt{8\pi/3}\,Y_1^{\pm1}$. Weight $\sin\theta\,e^{\pm i\phi}$ twice as heavily.` }].filter((e) => Math.abs(e.value - ans) > 0.005),
          hints: [t`Rewrite each term as a multiple of a normalized $Y_1^m$; the factors are $\sqrt{4\pi/3}$ for $\cos\theta$ and $\sqrt{8\pi/3}$ for $\sin\theta\,e^{\pm i\phi}$.`, t`Weights: $${a}^2$ for $m = 0$, $2\times${b}^2$ for $m = 1$, $2\times${c}^2$ for $m = -1$; divide by their sum.`],
          teach: 'Measurement probabilities come from coefficients of normalized harmonics; unnormalized angular functions carry different weights.',
          explain: t`The weights are $${w[0]}$ ($m = 0$), $${w[1]}$ ($m = +1$) and $${w['-1']}$ ($m = -1$), out of $${tot}$: $P = ${fmt(ans, 4)}$. Every term has $l = 1$, so $L^2 = 2\hbar^2$ for certain.`,
        };
      },
    }),
    mcq({
      id: 'parity', difficulty: 2,
      prompt: t`Under inversion through the origin, $\theta \to \pi - \theta$ and $\phi \to \phi + \pi$. What happens to $Y_l^m$?`,
      visual: { type: 'mp-orbitals', params: { n: 3, l: 2, m: 1, real: true, panels: ['angular'], controls: false, readout: false }, caption: 'The real orbital d(xz), coloured by the sign of the angular function: opposite lobes have the same sign for l = 2.' },
      choices: [t`It is multiplied by $(-1)^l$`, t`It is multiplied by $(-1)^m$`, t`It is unchanged`, t`It becomes $Y_l^{-m}$`],
      answer: 0,
      why: {
        1: t`$e^{im\phi}$ gives $(-1)^m$, but $P_l^m(-\cos\theta)$ gives another $(-1)^{l+m}$: together $(-1)^l$.`,
        2: t`True only for even $l$; the p orbitals ($l = 1$) change sign, which is why their two lobes are drawn in opposite colours.`,
        3: t`Inversion reverses $\vec r$ but not $\vec L = \vec r\times\vec p$; it cannot change $L_z$, so $m$ stays.`,
      },
      hints: [t`$e^{im(\phi + \pi)} = (-1)^me^{im\phi}$.`, t`$P_l^m(-x) = (-1)^{l+m}P_l^m(x)$.`],
      teach: t`Spherical harmonics have definite parity $(-1)^l$: even $l$ are symmetric under inversion, odd $l$ antisymmetric.`,
      explain: t`$(-1)^m\cdot(-1)^{l+m} = (-1)^l$. Parity is why electric-dipole transitions need $\Delta l = \pm1$: the dipole operator $\vec r$ is odd, so it connects only states of opposite parity.`,
    }),
    num({
      id: 'equator', difficulty: 3,
      gen(r) {
        const l = r.pick([1, 2, 3]), d = r.pick([10, 20, 30]);
        const ans = equatorP(l, d);
        return {
          prompt: t`The state $Y_l^l \propto \sin^l\theta\,e^{il\phi}$ has the largest $L_z$ possible. With $l = ${l}$, what is the probability that the particle is found within $${d}^\circ$ of the equatorial plane ($|\theta - 90^\circ| < ${d}^\circ$)? Remember $d\Omega = \sin\theta\,d\theta\,d\phi$.`,
          visual: { type: 'graph', params: { x: [0, 180], y: [0, 1.1], aspect: 'wide', xlabel: 'θ (degrees)', ylabel: 'probability per θ (scaled)', xticks: 6, yticks: 0, axesAt: 'edge', curves: [{ fn: `sin(x*pi/180)^${2 * l + 1}`, color: 'accent', width: 2.4 }], shade: [{ fn: `sin(x*pi/180)^${2 * l + 1}`, from: 90 - d, to: 90 + d, color: 'gold', alpha: 0.45 }] }, caption: t`The probability per unit $\theta$, $|Y_l^l|^2\sin\theta \propto \sin^{${2 * l + 1}}\theta$, with the band shaded.` },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.sin(d * D), feedback: t`That is the fraction of the sphere’s area in the band (a uniform distribution); weight it by $\sin^{2l}\theta$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$P = \dfrac{\int_{90^\circ - ${d}^\circ}^{90^\circ + ${d}^\circ}\sin^{${2 * l + 1}}\theta\,d\theta}{\int_0^\pi\sin^{${2 * l + 1}}\theta\,d\theta}$.`, t`With $x = \cos\theta$ both become polynomial integrals: $P = \dfrac{\int_{-s}^{s}(1 - x^2)^{${l}}dx}{\int_{-1}^{1}(1 - x^2)^{${l}}dx}$ with $s = \sin ${d}^\circ$.`],
          teach: t`As $l$ grows, $Y_l^l$ concentrates on the equator: the quantum state approaches a classical orbit in the $xy$-plane.`,
          explain: t`$P = ${fmt(ans, 4)}$, against $${fmt(Math.sin(d * D), 3)}$ for a uniform distribution. At $l = 20$ the same band would hold $${fmt(equatorP(20, d), 3)}$: the angular width shrinks as $1/\sqrt l$ — the same $1/\sqrt l$ as the tilt of the vector-model cone.`,
        };
      },
    }),
    mcq({
      id: 'which-shape', difficulty: 2,
      prompt: t`Which spherical harmonic has this $|Y|^2$: two lobes along the $z$-axis and a ring round the equator?`,
      visual: yPic(2, 0, 'The shape in question. Drag to rotate.'),
      choices: [t`$Y_2^0$`, t`$Y_1^0$`, t`$Y_2^{\pm1}$`, t`$Y_2^{\pm2}$`],
      answer: 0,
      why: {
        1: t`$|Y_1^0|^2 \propto \cos^2\theta$ has two lobes and no ring: it vanishes on the whole equator.`,
        2: t`$|Y_2^{\pm1}|^2 \propto \sin^2\theta\cos^2\theta$ vanishes on the $z$-axis and on the equator: four lobes at $45^\circ$, forming a double cone.`,
        3: t`$|Y_2^{\pm2}|^2 \propto \sin^4\theta$ is a ring only, with nothing along $z$.`,
      },
      hints: [t`Along the $z$-axis ($\theta = 0$) only $m = 0$ harmonics are nonzero.`, t`$l - |m|$ nodal cones: two cones for $Y_2^0$, at $\cos^2\theta = \tfrac13$.`],
      teach: 'Only m = 0 harmonics reach the z-axis; l − |m| is the number of nodal cones.',
      explain: t`$|Y_2^0|^2 \propto (3\cos^2\theta - 1)^2$: large at the poles, zero on two cones at $54.7^\circ$, and nonzero again at the equator — the $d_{z^2}$ shape.`,
    }),
    num({
      id: 'l2-mix', difficulty: 2,
      gen(r) {
        const st = r.pick([[[1, 1, 2], [2, -1, 1]], [[1, 0, 1], [3, 2, 1]], [[2, 2, 1], [1, -1, 2]], [[0, 0, 1], [2, 1, 1]], [[3, -3, 2], [1, 0, 1]]]);
        const tot = st.reduce((s, [, , c]) => s + c * c, 0);
        const L2 = st.reduce((s, [l, , c]) => s + c * c * l * (l + 1), 0) / tot;
        const ket = st.map(([l, m, c]) => `${c === 1 ? '' : c}\\,Y_${l}^{${m}}`).join(' + ');
        return {
          prompt: t`A particle’s angular state is $\tfrac{1}{\sqrt{${tot}}}\big(${ket}\big)$. What is $\langle L^2\rangle$, in units of $\hbar^2$?`,
          visual: { type: 'graph', params: { x: [-0.5, 3.5], y: [0, 1.1], aspect: 'wide', xlabel: 'l', ylabel: 'probability', xticks: 4, yticks: 2, axesAt: 'edge', curves: st.map(([l, , c]) => seg(l, 0, l, (c * c) / tot, 'gold', 10)), points: st.map(([l, m, c]) => label(l, (c * c) / tot, `m = ${m}`.replace('-', '−'), 'gold', 0, -14, 'center')) }, caption: 'The probability of each component, placed at its l.' },
          answer: L2, tol: { rel: 0.002 },
          errors: [{ value: st.reduce((s, [l, , c]) => s + c * c * l * l, 0) / tot, feedback: t`Each $Y_l^m$ has $L^2 = \hbar^2l(l+1)$, not $\hbar^2l^2$.` }, { value: st.reduce((s, [l, , c]) => s + c * l * (l + 1), 0) / st.reduce((s, [, , c]) => s + c, 0), feedback: 'Weight by the squared coefficients, the probabilities.' }].filter((e) => Math.abs(e.value - L2) > 0.01),
          hints: [t`$\langle L^2\rangle = \sum P_{lm}\,\hbar^2l(l+1)$ with $P_{lm} = |c_{lm}|^2/${tot}$.`],
          teach: 'An expectation value is a probability-weighted sum of eigenvalues: here l(l + 1)ħ² for each harmonic.',
          explain: t`$\langle L^2\rangle = \tfrac{1}{${tot}}\big(${st.map(([l, , c]) => `${c * c}\\cdot${l * (l + 1)}`).join(' + ')}\big) = ${fmt(L2, 4)}\,\hbar^2$. No single measurement gives this value: each gives one of $${st.map(([l]) => l * (l + 1)).join(', ')}$ (times $\hbar^2$).`,
        };
      },
    }),
    mcq({
      id: 'raise-y10', difficulty: 3,
      prompt: t`In spherical coordinates $\hat L_+ = \hbar e^{i\phi}\big(\partial_\theta + i\cot\theta\,\partial_\phi\big)$. Apply it to $Y_1^0 = \sqrt{3/4\pi}\cos\theta$.`,
      visual: yPic(1, 1, t`$|Y_1^{\pm1}|^2$: a ring round the $z$-axis — where $\hat L_+$ takes $Y_1^0$. Drag to rotate.`),
      choices: [t`$\sqrt2\,\hbar\,Y_1^1$`, t`$-\sqrt2\,\hbar\,Y_1^1$`, t`$\hbar\,Y_1^1$`, t`$0$`],
      answer: 0,
      why: {
        1: t`$\hat L_+Y_1^0 = -\hbar\sqrt{3/4\pi}\sin\theta\,e^{i\phi}$, and with the Condon–Shortley sign $Y_1^1 = -\sqrt{3/8\pi}\sin\theta\,e^{i\phi}$, the two minus signs cancel.`,
        2: t`The coefficient is $\sqrt{l(l+1) - m(m+1)} = \sqrt2$ for $l = 1$, $m = 0$.`,
        3: t`$\hat L_+$ annihilates only the top rung, $m = l$; $m = 0$ is not the top for $l = 1$.`,
      },
      hints: [t`$\partial_\theta\cos\theta = -\sin\theta$ and $\partial_\phi$ of $Y_1^0$ is zero.`, t`Compare $-\hbar\sqrt{3/4\pi}\sin\theta\,e^{i\phi}$ with $Y_1^1 = -\sqrt{3/8\pi}\sin\theta\,e^{i\phi}$.`],
      teach: 'The ladder operators act on spherical harmonics with the same coefficients the algebra predicts, ħ√(l(l + 1) − m(m ± 1)).',
      explain: t`$\hat L_+Y_1^0 = \hbar e^{i\phi}\sqrt{\tfrac{3}{4\pi}}(-\sin\theta)$ $= \sqrt2\,\hbar\Big(-\sqrt{\tfrac{3}{8\pi}}\sin\theta\,e^{i\phi}\Big)$ $= \sqrt2\,\hbar\,Y_1^1$ — the coefficient the ladder algebra gave, $\sqrt{1\cdot2 - 0}$, and the Condon–Shortley phase is chosen precisely so that it comes out positive.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pxyz', difficulty: 3,
      gen(r) {
        const [a, b, c] = r.pick([[1, 1, 1], [1, 0, 1], [2, 1, 2], [1, 2, 2], [0, 1, 1], [3, 0, 1]]);
        const ans = ((a * a + b * b) / 2) / (a * a + b * b + c * c);
        return {
          prompt: t`An angular wave function is proportional to $${a}x + ${b}y + ${c}z$ on the unit sphere, i.e. $${a}\sin\theta\cos\phi + ${b}\sin\theta\sin\phi + ${c}\cos\theta$. What is the probability that $L_z = +\hbar$?`,
          visual: shape(`(${a}*sin(u)*cos(v) + ${b}*sin(u)*sin(v) + ${c}*cos(u))^2/${a * a + b * b + c * c}`, { caption: t`$|f|^2$: a p orbital along $(${a}, ${b}, ${c})$. Drag to rotate.` }),
          answer: ans, tol: { rel: 0.005, abs: 1e-6 },
          errors: [{ value: (a * a) / (a * a + b * b + c * c), feedback: t`$\sin\theta\cos\phi$ is not a single harmonic: it is half $\sin\theta\,e^{i\phi}$ and half $\sin\theta\,e^{-i\phi}$, as is $\sin\theta\sin\phi$.` }].filter((e) => Math.abs(e.value - ans) > 0.005),
          hints: [t`Write $\sin\theta\cos\phi$ and $\sin\theta\sin\phi$ in terms of $\sin\theta\,e^{\pm i\phi}$; the coefficient of $\sin\theta\,e^{i\phi}$ is $(${a} - ${b}i)/2$.`, t`Weights: $2|(${a} - ${b}i)/2|^2$ for $m = +1$, the same for $m = -1$, and $${c}^2$ for $m = 0$.`],
          teach: t`A p orbital pointing along any direction is a superposition of $m = -1, 0, +1$; only one along $z$ has definite $L_z$.`,
          explain: t`$P(+1) = \dfrac{(${a}^2 + ${b}^2)/2}{${a}^2 + ${b}^2 + ${c}^2} = ${fmt(ans, 4)}$, equal to $P(-1)$ because the function is real. A $p_x$ orbital is half $m = +1$ and half $m = -1$: definite shape, indefinite $L_z$.`,
        };
      },
    }),
    num({
      id: 'cp-grace', difficulty: 2, transfer: true,
      gen(r) {
        const l = r.pick([60, 90, 120, 180]);
        const ans = (Math.PI * 6371) / l;
        return {
          prompt: t`The GRACE and GRACE-FO satellites map Earth’s gravity — and the water moving through it — as a sum of spherical harmonics, $V = \sum C_{lm}Y_l^m$ (in real form), truncated at degree $l_{\max}$. A harmonic of degree $l$ has about $l$ wavelengths round a great circle, so the finest feature it resolves is half a wavelength, $\pi R/l$. With $R = 6371$ km, what resolution does a monthly field to $l_{\max} = ${l}$ give, in km?`,
          visual: shape(`0.6 + 0.4*${yShape(9)}*cos(3*v)`, { caption: t`A sphere with a degree-3 ripple ($l = m = 3$) exaggerated: three wavelengths round the equator. Degree ${l} has ${l}. Drag to rotate.` }),
          answer: ans, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: 2 * ans, feedback: t`A full wavelength is $2\pi R/l$; the resolvable feature is half of it.` }],
          hints: [t`Half a wavelength at degree $l$ is $\pi R/l$.`],
          teach: 'A spherical-harmonic expansion to degree l resolves features about πR/l across.',
          explain: t`$\pi\times6371/${l} = ${fmt(ans, 3)}$ km. Such a field needs $(l_{\max} + 1)^2 = ${(l + 1) ** 2}$ coefficients. The largest after the monopole is $l = 2$, $m = 0$ — Earth’s equatorial bulge ($J_2$), which turns the orbital planes of sun-synchronous satellites by about a degree a day.`,
        };
      },
    }),
    mcq({
      id: 'cp-winding', difficulty: 2,
      prompt: t`What does $m$ tell you about the function $Y_l^m(\theta, \phi)$ on a circle of latitude?`,
      visual: { type: 'graph', params: { x: [0, 6.2832], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'φ (rad)', ylabel: 'value', xticks: 4, yticks: 2, axesAt: 'edge', curves: [{ fn: 'cos(2*x)', color: 'accent', width: 2.4 }, { fn: 'sin(2*x)', color: 'warn', width: 2, dash: [6, 4] }], legend: [{ label: 'real part', color: 'accent' }, { label: 'imaginary part', color: 'warn', dash: [6, 4] }], legendAt: 'tr' }, caption: 'The φ-dependence of an m = 2 harmonic once round a circle of latitude.' },
      choices: [
        t`Its phase turns through $2\pi m$ once round, while its modulus stays constant`,
        t`Its modulus has $m$ maxima round the circle`,
        t`It vanishes at $m$ points round the circle`,
        t`Nothing: $m$ affects only the $\theta$ dependence`,
      ],
      answer: 0,
      why: {
        1: t`That describes the real orbitals ($\cos m\phi$), which mix $+m$ and $-m$. $|e^{im\phi}| = 1$ everywhere.`,
        2: t`$e^{im\phi}$ never vanishes; zeros come only from the $\theta$ part.`,
        3: t`$m$ also sets $e^{im\phi}$ — that is what $L_z = -i\hbar\,\partial_\phi$ reads.`,
      },
      hints: [t`$Y_l^m \propto e^{im\phi}$; what is $|e^{im\phi}|$?`],
      teach: 'm counts the phase windings round the z-axis: angular momentum about z is a phase gradient in φ.',
      explain: t`$\hat L_zY = -i\hbar\,\partial_\phi Y = m\hbar\,Y$: angular momentum about $z$ is $\hbar$ times the rate at which the phase winds with $\phi$, just as linear momentum $\hbar k$ is a phase winding along $x$. Single-valuedness forces a whole number of windings.`,
    }),
  ],
  sources: [
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §4.1.2 and §4.3.2', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'NASA/JPL, GRACE Tellus: gravity recovery data products', url: 'https://grace.jpl.nasa.gov/' },
  ],
});
