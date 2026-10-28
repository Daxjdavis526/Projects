// N coupled oscillators: the uniform chain with fixed ends. Newton for mass j,
// the tridiagonal stiffness matrix, the N×N eigenvalue problem, and the three
// modes of N = 3 worked by hand (a chain of tethered microsatellites).
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, chainPic } from './_wv.js';

const t = String.raw;
const S2 = Math.SQRT2;

// the worked example: three microsatellites on a tether between two massive end bodies
const EX = (() => {
  const m = 20, T = 40, a = 100, k = T / a, w0 = Math.sqrt(k / m);
  const lam = [2 - S2, 2, 2 + S2], w = lam.map((l) => w0 * Math.sqrt(l));
  return { m, T, a, k, w0, lam, w, P: w.map((x) => (2 * Math.PI) / x) };
})();

export default lesson({
  id: 'phys3750.W3.1',
  title: 'N coupled oscillators',
  minutes: 15, difficulty: 3,
  intro: t`Line up $N$ equal masses joined by equal springs, with the end springs tied to walls. Each mass is pulled only by its two neighbours, so Newton’s law for mass $j$ is

$$m\ddot x_j = k\,\big(x_{j+1} - 2x_j + x_{j-1}\big), \qquad j = 1, \ldots, N, \qquad x_0 = x_{N+1} = 0$$

The same equation describes $N$ beads on a light string under tension $T$, moving sideways, with $k = T/a$ for bead spacing $a$. Guess $\mathbf x = \mathbf a\,e^{-i\omega t}$ as before: the $N$ equations become an $N \times N$ eigenvalue problem with a **tridiagonal** matrix, and it has exactly $N$ normal modes. This lesson sets it up and solves small chains; [the next](#/lesson/phys3750.W3.2) finds every mode at once.`,
  symbols: [
    { tex: 'x_j', text: 'the displacement of mass $j$ from its rest position, in m' },
    { tex: 'm', text: 'each mass, in kg' },
    { tex: 'k', text: 'each spring constant, in N/m (for beads on a string, $k = T/a$)' },
    { tex: 'N', text: 'the number of moving masses' },
    { tex: 'x_0 = x_{N+1} = 0', text: 'the fixed ends: imaginary masses that never move, standing for the walls' },
    { tex: 'x_{j+1} - 2x_j + x_{j-1}', text: 'the second difference: how far mass $j$ sits from the average of its neighbours, times $-2$' },
  ],
  why: t`Let $N$ grow and this chain becomes a string, a rod or a crystal: the wave equation and phonons both start here.`,
  visual: {
    type: 'wv-chain',
    title: 'A chain of masses: modes and plucks',
    lead: t`Beads on a string between two walls, drawn sideways. Start the chain in one normal mode, or pluck a single bead and watch the disturbance spread to its neighbours.`,
    tasks: [t`$N = 3$: step through modes 1, 2, 3 — in mode 2 the middle bead never moves.`, 'Pluck bead 1 of a long chain: the disturbance travels along, one neighbour at a time.', t`Mode $n$ changes sign $n - 1$ times along the chain: count them for $N = 6$.`],
    params: { N: 3, maxN: 12, controls: ['N', 'start', 'n', 'pluck', 'view'], panels: ['chain'], readouts: ['N', 'n', 'omega', 'f'] },
  },
  example: {
    prompt: t`Three ${EX.m} kg microsatellites are strung on a tether between a space station above and a massive ballast body below (treat both ends as fixed). Gravity-gradient forces keep the tether taut at $T = ${EX.T}$ N, and the satellites are $a = ${EX.a}$ m apart. Find the normal modes of small sideways oscillations and their periods.`,
    steps: [
      { label: 'Spring constant', text: t`A satellite displaced $x$ sideways tilts the tether segments by about $x/a$, so each pulls back with $T(x/a)$: the effective spring is $k = T/a = ${EX.k}$ N/m, and $\sqrt{k/m} = ${tn(EX.w0, 4)}$ rad/s.` },
      { label: 'The matrix', text: t`With $\mathbf x = \mathbf a e^{-i\omega t}$ and $\lambda = m\omega^2/k$: $\begin{pmatrix} 2 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 2 \end{pmatrix}\mathbf a = \lambda\,\mathbf a$.` },
      { label: 'Determinant', text: t`Expanding along the first row: $(2 - \lambda)\big[(2 - \lambda)^2 - 1\big] - (2 - \lambda) = (2 - \lambda)\big[(2 - \lambda)^2 - 2\big] = 0$, so $\lambda = 2 - \sqrt2,\ 2,\ 2 + \sqrt2$.` },
      { label: 'Shapes', text: t`Put each $\lambda$ into the rows: $\lambda = 2 - \sqrt2$ gives $(1, \sqrt2, 1)$, all together; $\lambda = 2$ gives $(1, 0, -1)$, the middle satellite still; $\lambda = 2 + \sqrt2$ gives $(1, -\sqrt2, 1)$, neighbours opposite.` },
      { label: 'Periods', text: t`$\omega = \sqrt{\lambda k/m}$: $\omega_1 = ${tn(EX.w[0])}$, $\omega_2 = ${tn(EX.w[1])}$, $\omega_3 = ${tn(EX.w[2])}$ rad/s, so the periods $2\pi/\omega$ are $${tn(EX.P[0])}$ s, $${tn(EX.P[1])}$ s and $${tn(EX.P[2])}$ s.` },
      { label: 'Sense check', text: t`More sign changes, more bent tether, stiffer restoring force, higher frequency. A real tether in orbit also feels Coriolis and tidal forces in its sideways motion; this is the chain alone, a teaching model.` },
    ],
    answer: t`Shapes $(1, \sqrt2, 1)$, $(1, 0, -1)$, $(1, -\sqrt2, 1)$ with periods $${tn(EX.P[0])}$, $${tn(EX.P[1])}$ and $${tn(EX.P[2])}$ s.`,
    visual: chainPic({ N: 3, panels: ['gallery'], k: EX.k, m: EX.m, a: EX.a }, t`The three modes of three satellites on a tether, drawn as beads on a string; each row gives the mode’s $\omega$. Dashed: the sine curve each mode samples.`),
  },
  practice: [
    mcq({
      id: 'force-on-j', difficulty: 1,
      prompt: t`What is the net force on mass $j$ in the middle of a chain of equal masses and springs $k$?`,
      visual: chainPic({ N: 5, start: 'custom', x0: [0.2, 0.6, 1, 0.3, -0.2] }, 'Five beads on a string between walls, displaced sideways (exaggerated) at one instant.'),
      choices: [t`$k(x_{j+1} - 2x_j + x_{j-1})$`, t`$k(x_{j+1} - x_{j-1})$`, t`$-2k\,x_j$`, t`$k(x_{j+1} + x_{j-1} + 2x_j)$`],
      answer: 0,
      why: {
        1: t`This drops mass $j$’s own displacement: the springs stretch by *differences* $x_{j+1} - x_j$ and $x_j - x_{j-1}$.`,
        2: t`That would be right only if the neighbours never moved. Each spring pulls according to its own stretch.`,
        3: t`Signs: the left spring pulls with $-k(x_j - x_{j-1})$, which gives $-x_j$, not $+x_j$.`,
      },
      hints: [t`The right spring is stretched by $x_{j+1} - x_j$ and pulls mass $j$ toward $+x$ with $k(x_{j+1} - x_j)$.`, t`The left spring is stretched by $x_j - x_{j-1}$ and pulls mass $j$ toward $-x$.`],
      teach: t`Each spring pulls by $k$ times its stretch; the two together give $k$ times the second difference $x_{j+1} - 2x_j + x_{j-1}$.`,
      explain: t`$F_j = k(x_{j+1} - x_j) - k(x_j - x_{j-1}) = k(x_{j+1} - 2x_j + x_{j-1})$. It vanishes when $x_j$ is the average of its neighbours — a straight stretch of string.`,
    }),
    num({
      id: 'two-beads', difficulty: 2,
      gen(r) {
        const T = r.pick([30, 50, 80]), a = r.pick([0.2, 0.25, 0.4]), m = r.pick([0.05, 0.08, 0.1]);
        const k = T / a, w = Math.sqrt((3 * k) / m);
        return {
          prompt: t`Two instrument pods of ${m * 1000} g each are clamped to a taut line at tension ${T} N, dividing it into three equal segments of ${a} m between fixed anchors. What is the angular frequency of the **faster** sideways mode, in rad/s? (Ignore the line’s own mass.)`,
          visual: chainPic({ N: 2, start: 'pluck', pluck: 1 }, 'Two beads on a light line between fixed anchors, one pulled aside (exaggerated).'),
          answer: w, units: 'rad/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(k / m), feedback: t`That is the slower mode, $(1, 1)$, in which the middle segment never stretches.` }, { value: Math.sqrt(T / m), feedback: t`$T/m$ is not a spring constant per mass: the effective spring is $k = T/a$.` }],
          hints: [t`$k = T/a$. The matrix for $N = 2$ is $\begin{pmatrix} 2 & -1 \\ -1 & 2\end{pmatrix}$, times $k$.`, t`Its eigenvalues are $1$ and $3$: $\omega^2 = k/m$ and $3k/m$.`],
          teach: t`For two masses between walls, $\omega^2 = k/m$ (together) and $3k/m$ (opposite).`,
          explain: t`$k = ${T}/${a} = ${tn(k)}$ N/m; the opposite mode has $\omega = \sqrt{3k/m} = \sqrt{3 \times ${tn(k)}/${m}} = ${tn(w)}$ rad/s.`,
        };
      },
    }),
    num({
      id: 'three-top', difficulty: 2,
      gen(r) {
        const k = r.pick([40, 60, 90, 120]), m = r.pick([0.1, 0.2, 0.3]);
        const w = Math.sqrt(((2 + S2) * k) / m);
        return {
          prompt: t`Three ${m} kg carts are joined by four springs of $k = ${k}$ N/m between two walls. What is the frequency of the **highest** normal mode, in Hz?`,
          visual: chainPic({ N: 3, start: 'pluck', pluck: 2, view: 'longitudinal' }, 'Three carts on four springs between walls; the middle cart pulled aside along the line (exaggerated).'),
          answer: w / (2 * Math.PI), units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: w, feedback: 'That is ω in rad/s; divide by 2π.' }, { value: Math.sqrt((4 * k) / m) / (2 * Math.PI), feedback: t`$4k/m$ would need neighbours moving exactly opposite with equal amplitude, $(1, -1, 1)$ — not a mode for $N = 3$. The top eigenvalue is $2 + \sqrt2$.` }],
          hints: [t`The eigenvalues of $\begin{pmatrix} 2 & -1 & 0 \\ -1 & 2 & -1 \\ 0 & -1 & 2\end{pmatrix}$ are $2 - \sqrt2$, $2$ and $2 + \sqrt2$.`, t`$\omega_3 = \sqrt{(2 + \sqrt2)k/m}$, then $f = \omega/2\pi$.`],
          teach: t`For three masses the mode frequencies are $\sqrt{(2 - \sqrt2)k/m}$, $\sqrt{2k/m}$ and $\sqrt{(2 + \sqrt2)k/m}$.`,
          explain: t`$\omega_3 = \sqrt{3.414 \times ${k}/${m}} = ${tn(w)}$ rad/s, so $f_3 = ${tn(w / (2 * Math.PI))}$ Hz, with shape $(1, -\sqrt2, 1)$.`,
        };
      },
    }),
    mcq({
      id: 'matrix', difficulty: 2,
      prompt: t`For $N = 4$ masses with **fixed** ends, which matrix is $K/k$ (so that $m\ddot{\mathbf x} = -K\mathbf x$)?`,
      visual: chainPic({ N: 4, start: 'mode', n: 1 }, 'Four beads between two walls, in their slowest mode (exaggerated).'),
      choices: [
        t`$\begin{pmatrix} 2 & -1 & 0 & 0 \\ -1 & 2 & -1 & 0 \\ 0 & -1 & 2 & -1 \\ 0 & 0 & -1 & 2\end{pmatrix}$`,
        t`$\begin{pmatrix} 1 & -1 & 0 & 0 \\ -1 & 2 & -1 & 0 \\ 0 & -1 & 2 & -1 \\ 0 & 0 & -1 & 1\end{pmatrix}$`,
        t`$\begin{pmatrix} 2 & -1 & 0 & -1 \\ -1 & 2 & -1 & 0 \\ 0 & -1 & 2 & -1 \\ -1 & 0 & -1 & 2\end{pmatrix}$`,
        t`$\begin{pmatrix} 2 & 1 & 0 & 0 \\ 1 & 2 & 1 & 0 \\ 0 & 1 & 2 & 1 \\ 0 & 0 & 1 & 2\end{pmatrix}$`,
      ],
      answer: 0,
      why: {
        1: t`The corner 1s mean the end masses have a spring on one side only: that is a chain with **free** ends.`,
        2: t`The corner $-1$s join mass 4 to mass 1: a **ring** of four masses.`,
        3: t`The off-diagonal signs: a neighbour moving toward $+x$ pulls mass $j$ toward $+x$, so $-K_{j,j\pm1}$ must be positive and $K_{j,j\pm1} = -1$.`,
      },
      hints: [t`Row $j$ of $K/k$ is read from $-m\ddot x_j/k = 2x_j - x_{j+1} - x_{j-1}$.`, t`For the end masses, the missing neighbour is a wall at $x = 0$, but the wall spring is still there.`],
      teach: t`Fixed ends: every diagonal entry is 2 (two springs on every mass) and every neighbour entry is $-1$.`,
      explain: t`Mass 1 has a wall spring and a spring to mass 2: $m\ddot x_1 = -2kx_1 + kx_2$. Every row looks the same — that sameness (translation symmetry) is what the next lesson exploits.`,
    }),
    {
      type: 'slider', id: 'node-mode', difficulty: 2,
      prompt: t`A chain of $N = 3$ beads with fixed ends. Choose the mode in which the **middle bead never moves**.`,
      visual: { type: 'wv-chain', params: { N: 3, maxN: 3, controls: ['n'], panels: ['chain'], readouts: ['n'], ghost: false }, caption: 'Three beads between walls, moving sideways in the chosen mode (exaggerated).' },
      param: 'n', answer: [2, 2],
      instruction: 'Pick the mode, watch it, then check.',
      hints: [t`A middle bead at rest needs its neighbours to pull equally and oppositely.`, t`That means the outer beads move opposite to each other: shape $(1, 0, -1)$.`],
      teach: t`In the antisymmetric mode $(1, 0, -1)$ of three beads, the middle one sits on a node.`,
      explain: t`Mode 2, $(1, 0, -1)$, with $\omega = \sqrt{2k/m}$: the centre bead feels $k(x_3 - 2x_2 + x_1) = k(-1 + 0 + 1) = 0$ and stays put — exactly as a string’s second harmonic has a node at its middle.`,
    },
    num({
      id: 'shape-ratio', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 3]);
        const val = n === 1 ? S2 : -S2;
        return {
          prompt: t`In mode ${n} of a chain of three equal beads between fixed ends (${n === 1 ? 'the slowest' : 'the fastest'} mode), what is the ratio of the middle bead’s displacement to an end bead’s, $x_2/x_1$? Give a decimal.`,
          visual: chainPic({ N: 3, start: 'pluck', pluck: 1 }, 'Three beads between walls; bead 1 plucked (exaggerated). In a mode, every bead keeps a fixed ratio to the others.'),
          answer: val, tol: { rel: 0.005 },
          errors: [{ value: -val, feedback: n === 1 ? 'In the slowest mode all three beads move to the same side.' : 'In the fastest mode neighbours move to opposite sides.' }, { value: val / 2, feedback: t`Check the eigenvalue: $\lambda = ${n === 1 ? '2 - \\sqrt2' : '2 + \\sqrt2'}$, and the first row gives $x_2 = (2 - \lambda)x_1$.` }],
          hints: [t`The first row of $(K/k - \lambda)\mathbf a = 0$ reads $(2 - \lambda)a_1 - a_2 = 0$.`, t`For mode ${n}, $\lambda = ${n === 1 ? '2 - \\sqrt2' : '2 + \\sqrt2'}$.`],
          teach: t`Once you know $\lambda$, the first row gives the next bead: $a_2 = (2 - \lambda)a_1$.`,
          explain: t`$a_2/a_1 = 2 - \lambda = ${n === 1 ? '\\sqrt2' : '-\\sqrt2'} \approx ${tn(val, 4)}$. The middle bead moves the most: these are samples of a sine arch ${n === 1 ? '(one hump)' : '(three humps)'}.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([10, 15, 25]), T = r.pick([20, 30, 60]), a = r.pick([50, 80, 120]);
        const k = T / a, P = (2 * Math.PI) / Math.sqrt(((2 - S2) * k) / m);
        return {
          prompt: t`Three ${m} kg satellites hang on a taut tether ($T = ${T}$ N) between two very massive end bodies, ${a} m apart from each other and from the ends. What is the period of the **slowest** sideways normal mode, in s? (Ignore orbital effects and the tether’s mass.)`,
          visual: chainPic({ N: 3, start: 'custom', x0: [0.5, 0.9, 0.3] }, 'Three satellites as beads on a tether, displaced sideways (exaggerated); the end bodies are treated as fixed.'),
          answer: P, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (2 * Math.PI) / Math.sqrt(k / m), feedback: t`$\sqrt{k/m}$ is a single satellite on one spring. Each sits between two segments, and in the slow mode $(1, \sqrt2, 1)$ the eigenvalue is $2 - \sqrt2$.` }, { value: (2 * Math.PI) / Math.sqrt(((2 + S2) * k) / m), feedback: 'That is the fastest mode; the slowest has the longest period.' }],
          hints: [t`$k = T/a$, and the slowest mode has $\omega^2 = (2 - \sqrt2)k/m$.`, t`Period $= 2\pi/\omega$.`],
          teach: t`The slow mode of three beads has $\omega_1 = \sqrt{(2 - \sqrt2)T/(ma)}$.`,
          explain: t`$k = ${T}/${a} = ${tn(k)}$ N/m, $\omega_1 = \sqrt{0.586 \times ${tn(k)}/${m}} = ${tn((2 * Math.PI) / P)}$ rad/s, period $${tn(P)}$ s.`,
        };
      },
    }),
    mcq({
      id: 'cp-fastest', difficulty: 2,
      prompt: t`Which pattern of displacements is the **highest-frequency** normal mode of four beads between fixed ends?`,
      visual: chainPic({ N: 4, start: 'pluck', pluck: 2 }, 'Four beads between walls, bead 2 plucked (exaggerated).'),
      choices: [t`$(0.62,\ -1,\ 1,\ -0.62)$`, t`$(0.62,\ 1,\ 1,\ 0.62)$`, t`$(1,\ 0.62,\ -0.62,\ -1)$`, t`$(1,\ -0.62,\ -0.62,\ 1)$`],
      answer: 0,
      why: {
        1: 'All four on one side bends the string least: that is the slowest mode.',
        2: 'One sign change: the second mode.',
        3: 'Two sign changes: the third mode.',
      },
      hints: ['The restoring force on a bead grows with how sharply the string bends there.', 'Count sign changes between neighbours: the most bending comes with the most sign changes.'],
      teach: t`Higher modes have more sign changes; the top mode of a chain alternates bead by bead.`,
      explain: t`$(0.62, -1, 1, -0.62)$ flips sign at every step — three sign changes for four beads — so every spring is stretched as much as it can be: $\omega_4 = 2\sqrt{k/m}\sin(4\pi/10) = ${tn(2 * Math.sin((4 * Math.PI) / 10), 3)}\sqrt{k/m}$.`,
    }),
    num({
      id: 'cp-middle', difficulty: 2,
      gen(r) {
        const T = r.pick([100, 150, 200]), a = r.pick([0.1, 0.15, 0.2]), m = r.pick([0.02, 0.05]);
        const w = Math.sqrt((2 * T) / (a * m));
        return {
          prompt: t`Three ${m * 1000} g beads divide a wire under tension ${T} N into four ${a} m segments between fixed clamps. What is the frequency of the mode $(1, 0, -1)$, in Hz?`,
          visual: chainPic({ N: 3, start: 'mode', n: 2, ghost: false }, 'Three beads on a wire between clamps, in the mode (1, 0, −1) (exaggerated).'),
          answer: w / (2 * Math.PI), units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: w, feedback: 'That is ω in rad/s.' }, { value: Math.sqrt(T / (a * m)) / (2 * Math.PI), feedback: t`With the middle bead still, each outer bead has two springs on it: $\omega^2 = 2k/m$.` }],
          hints: [t`$k = T/a$.`, t`The middle mode has $\lambda = 2$: $\omega = \sqrt{2k/m}$.`],
          teach: t`Mode $(1, 0, -1)$ has $\omega = \sqrt{2k/m}$: each outer bead is held by two springs while the middle one rests.`,
          explain: t`$k = ${T}/${a} = ${tn(T / a)}$ N/m, $\omega = \sqrt{2 \times ${tn(T / a)}/${m}} = ${tn(w)}$ rad/s, $f = ${tn(w / (2 * Math.PI))}$ Hz.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 4: Linear Chain of Coupled Oscillators', url: 'https://digitalcommons.usu.edu/foundation_wave/19/' },
    { label: 'Georgi, The Physics of Waves, ch. 4 (free from the author)', url: 'https://www.people.fas.harvard.edu/~hgeorgi/new.htm' },
  ],
});
