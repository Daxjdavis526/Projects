// Coupled oscillators and normal modes: M x″ = −K x, the eigenproblem
// K v = ω² M v, the in-phase and out-of-phase modes of two masses, beats and
// energy sloshing, unequal masses, the zero mode of a free system, and the
// stretching modes of CO₂ as a ball-and-spring preview of molecular spectra
// (with an honest look at where that model misses).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { M, V, n, r6 } from './_systems.js';
import { modes, chainK } from '../../src/viz/model/de-modes.js';

const t = String.raw;

// the pair of masses as a still picture (no motion, no numbers)
const pairPic = (o, caption) => ({ type: 'de-modes', params: { system: 'pair', controls: [], starts: false, play: false, graph: false, readout: false, energy: false, ...o }, caption });

export default lesson({
  id: 'math2280.DE-4.5',
  title: 'Coupled oscillators and normal modes',
  minutes: 15, difficulty: 3,
  intro: t`Join two masses with a spring and neither can move alone: each one’s motion pushes on the other. Newton’s law for every mass at once is the second-order system

$$M\mathbf x'' = -K\mathbf x,$$

with $M$ the diagonal matrix of masses and $K$ the **stiffness matrix**. Look for motions in which everything swings at one frequency, $\mathbf x = \mathbf v\cos\omega t$: substituting gives $K\mathbf v = \omega^2M\mathbf v$, an eigenvalue problem. Each eigenvalue $\omega^2$ gives a **normal-mode frequency** and each eigenvector $\mathbf v$ a **mode shape** — the pattern in which the masses move together. Every motion is a sum of modes, so a system that looks complicated is a few simple oscillators in disguise. (As a first-order system in $(\mathbf x, \mathbf x')$, each mode is a pair of eigenvalues $\pm i\omega$ — the centres of DE-4.3.)`,
  symbols: [
    { tex: '\\mathbf x', text: 'the displacements of the masses from equilibrium, $(x_1, x_2, \\dots)$, in m' },
    { tex: 'M', text: 'the **mass matrix**: the masses on the diagonal, in kg' },
    { tex: 'K', text: 'the **stiffness matrix**, in N/m: entry $K_{ij}$ is minus the force on mass $i$ when mass $j$ alone moves 1 m' },
    { tex: '\\omega', text: 'a normal-mode angular frequency, in rad/s ($f = \\omega/2\\pi$ in Hz)' },
    { tex: '\\mathbf v', text: 'a mode shape: the ratios in which the masses move in that mode (any multiple is the same mode)' },
  ],
  why: t`Normal modes are how every vibrating structure is analysed — a rocket’s pogo oscillation, a wing’s flutter, a bridge in the wind, a molecule’s infrared spectrum — and in a crystal they become phonons; in quantum mechanics each mode is an independent oscillator with energies $\hbar\omega(n + \tfrac12)$.`,
  visual: {
    type: 'de-modes',
    title: 'Two masses, three springs',
    lead: t`Two 1 kg masses between walls on springs of 10 N/m, joined by a coupling spring $k_c$ (gold). Choose a starting state: one mass pulled aside alone, or one of the two normal modes. The graph shows both displacements; the bars, the energy each oscillator holds.`,
    tasks: [
      'Pull mass 1 alone and press Play: its swing dies away as mass 2’s grows, then the energy comes back — beats.',
      'Choose Mode 1 or Mode 2: each swings at a single frequency forever, and no energy moves between the masses.',
      t`Raise $k_c$: the two frequencies separate and the energy sloshes faster. Make $m_2$ heavier: the mode shapes are no longer $(1, 1)$ and $(1, -1)$.`,
    ],
    params: { system: 'pair', m: 1, m2: 1, k: 10, kc: 1, controls: ['kc', 'm2'], start: 'one', play: true },
    caption: 'Frictionless masses on ideal springs; displacements exaggerated. Energy bars: ½mv² + ½kx² of each mass with its wall spring (the coupling spring’s small share is not shown).',
  },
  example: {
    prompt: t`Two 0.5 kg masses sit between walls on springs of $k = 50$ N/m and are joined by a weak spring of $k_c = 5$ N/m. Find the normal modes, and describe the motion when mass 1 is pulled 2 cm aside and both are released from rest.`,
    visual: { type: 'de-modes', params: { system: 'pair', m: 0.5, m2: 0.5, k: 50, kc: 5, controls: [], start: 'one', starts: false, play: true }, caption: 'The motion from mass 1 pulled aside alone: the energy moves to mass 2 and back. Frictionless, ideal springs.' },
    steps: [
      { label: 'Newton for each mass', text: t`Mass 1 feels its wall spring, $-50x_1$, and the coupling spring, which is stretched by $x_2 - x_1$: $0.5\,x_1'' = -50x_1 + 5(x_2 - x_1)$. Likewise $0.5\,x_2'' = -50x_2 - 5(x_2 - x_1)$.` },
      { label: 'Matrices', text: t`$M = ${M([[0.5, 0], [0, 0.5]])}$ and $K = ${M([[55, -5], [-5, 55]])}$ N/m. $K$ is symmetric — Newton’s third law: the coupling spring pulls the two masses equally.` },
      { label: 'The eigenproblem', text: t`$K\mathbf v = \omega^2M\mathbf v$ means $M^{-1}K\mathbf v = \omega^2\mathbf v$ with $M^{-1}K = ${M([[110, -10], [-10, 110]])}\ \text{s}^{-2}$. Its eigenvalues are $100$ with $\mathbf v = (1, 1)$ and $120$ with $\mathbf v = (1, -1)$.` },
      { label: 'The two modes', text: t`**Mode 1**, $(1, 1)$: the masses move together, the coupling spring never stretches, $\omega_1 = \sqrt{100} = 10$ rad/s — just $\sqrt{k/m}$. **Mode 2**, $(1, -1)$: they move oppositely, the coupling spring is stretched from both ends, $\omega_2 = \sqrt{120} = 10.95$ rad/s $= \sqrt{(k + 2k_c)/m}$.` },
      { label: 'Combine', text: t`$\mathbf x(0) = (2, 0)$ cm $= (1, 1) + (1, -1)$, from rest, so $\mathbf x = (1, 1)\cos 10t + (1, -1)\cos 10.95t$ cm. By the sum-to-product formula, $x_1 = 2\cos(0.477t)\cos(10.48t)$ and $x_2 = 2\sin(0.477t)\sin(10.48t)$: a fast swing inside a slow envelope.` },
      { label: 'Beats', text: t`$x_1$’s envelope reaches zero when $0.477t = \pi/2$, at $t = \pi/(\omega_2 - \omega_1) = 3.29$ s: all the energy is in mass 2. It returns after $2\pi/(\omega_2 - \omega_1) = 6.58$ s.` },
      { label: 'Sense check', text: t`A weaker coupling spring brings $\omega_2$ closer to $\omega_1$ and the transfer takes longer; with $k_c = 0$ it never happens — two independent oscillators. The mode shapes are perpendicular, as eigenvectors of a symmetric matrix always are.` },
    ],
    answer: t`Modes $(1, 1)$ at 10 rad/s and $(1, -1)$ at 10.95 rad/s. From mass 1 alone the energy moves completely to mass 2 in 3.29 s and back in 6.58 s.`,
  },
  practice: [
    num({
      id: 'out-of-phase', difficulty: 1,
      gen(r) {
        const m = r.pick([0.2, 0.5, 2]), k = r.pick([20, 40, 80]), kc = r.pick([4, 10, 15]);
        const w2 = Math.sqrt((k + 2 * kc) / m);
        return {
          prompt: t`Two equal masses $m = ${m}$ kg between walls on springs $k = ${k}$ N/m are joined by a spring $k_c = ${kc}$ N/m. What is the angular frequency of the mode in which they move **oppositely**, in rad/s?`,
          answer: w2, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt((k + kc) / m), feedback: t`When the masses move oppositely by $x$, the coupling spring stretches by $2x$, so it pulls each with $2k_cx$: $\omega^2 = (k + 2k_c)/m$.` }, { value: Math.sqrt(k / m), feedback: t`That is the in-phase mode, where the coupling spring never stretches.` }],
          hints: [t`In the out-of-phase mode $x_2 = -x_1$, so the coupling spring’s stretch is $x_2 - x_1 = -2x_1$.`, t`$m x_1'' = -kx_1 + k_c(x_2 - x_1) = -(k + 2k_c)x_1$, so $\omega = \sqrt{(k + 2k_c)/m}$.`],
          teach: 'For two equal masses the modes are (1, 1) at $\\sqrt{k/m}$ and (1, −1) at $\\sqrt{(k + 2k_c)/m}$: the coupling spring works only in the second, and works from both ends.',
          explain: t`$\omega_2 = \sqrt{(${k} + 2\times${kc})/${m}} = ${fmt(w2, 4)}$ rad/s, against $\sqrt{k/m} = ${fmt(Math.sqrt(k / m), 4)}$ rad/s for the in-phase mode.`,
          visual: pairPic({ m, m2: m, k, kc, start: 'mode2' }, 'The two masses displaced in opposite directions, squeezing the coupling spring (gold) from both ends. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'which-faster', difficulty: 2,
      prompt: t`Two equal pendulums hang side by side, joined by a light spring. Which normal mode has the higher frequency, and why?`,
      choices: [
        'The mode where they swing in opposite directions: only then does the spring stretch and add to the restoring force',
        'The mode where they swing together: both pendulums push the spring the same way',
        'Neither: equal pendulums have equal frequencies however they are joined',
        'Whichever mode is started with the larger amplitude',
      ],
      answer: 0,
      why: {
        1: 'Swinging together, the two ends of the spring move the same distance, so it never stretches and adds nothing: that mode keeps the bare pendulum frequency.',
        2: 'Each pendulum alone has the same frequency, but the coupled system has two modes, and the spring affects only one of them.',
        3: 'For small, linear oscillations the frequency of a mode does not depend on its amplitude.',
      },
      hints: ['In which mode is the spring stretched or squeezed?', 'More restoring force for the same displacement means a stiffer oscillator and a higher frequency.'],
      teach: 'A coupling spring raises only the frequency of the modes that stretch it; a mode in which it keeps its length runs at the uncoupled frequency.',
      explain: t`In the in-phase mode the spring keeps its length, so the frequency is the single pendulum’s $\sqrt{g/L}$. In the anti-phase mode the spring adds a restoring force, so $\omega^2$ exceeds $g/L$ (by $2k_c/m$ if the spring joins the bobs themselves) — a higher frequency. This pair is the classic demonstration of beats: start one pendulum alone and the swing passes back and forth between them.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2.2, 2.2], y: [-2.3, 0.3], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [
            { param: ['-1 + 1.8*sin(0.25)*t', '-1.8*cos(0.25)*t'], t: [0, 1], color: 'ink2', width: 2 },
            { param: ['1 - 1.8*sin(0.25)*t', '-1.8*cos(0.25)*t'], t: [0, 1], color: 'ink2', width: 2 },
            { param: ['-1 + 1.8*sin(0.25)*0.55 + t*(2 - 2*1.8*sin(0.25)*0.55)', '-1.8*cos(0.25)*0.55 + 0.04*sin(40*t)'], t: [0, 1], color: 'gold', width: 1.6 },
            { param: ['-1.6 + 3.2*t', '0'], t: [0, 1], color: 'ink3', width: 3 },
          ],
          points: [{ x: r6(-1 + 1.8 * Math.sin(0.25)), y: r6(-1.8 * Math.cos(0.25)), r: 9, color: 'accent' }, { x: r6(1 - 1.8 * Math.sin(0.25)), y: r6(-1.8 * Math.cos(0.25)), r: 9, color: 'violet' }],
        },
        caption: 'Two pendulums joined by a spring (gold), here swinging toward each other. Not to scale.',
      },
    }),
    num({
      id: 'transfer-time', difficulty: 2,
      gen(r) {
        const m = r.pick([0.1, 0.25, 1]), k = r.pick([10, 25, 40]), kc = r.pick([0.5, 1, 2]);
        const w1 = Math.sqrt(k / m), w2 = Math.sqrt((k + 2 * kc) / m), tt = Math.PI / (w2 - w1);
        return {
          prompt: t`Two masses of ${m} kg, each on a wall spring of ${k} N/m, are joined by a weak spring of ${kc} N/m. Mass 1 is pulled aside and both are released from rest. How long until mass 1 is (momentarily) almost still and mass 2 holds the energy?`,
          answer: tt, units: 's', tol: { rel: 0.005 },
          errors: [{ value: 2 * tt, feedback: t`That is the full beat, there and back. The energy reaches mass 2 halfway: $t = \pi/(\omega_2 - \omega_1)$.` }, { value: Math.PI / w1, feedback: t`That is half a period of one mode. The transfer is set by the *difference* of the two mode frequencies.` }],
          hints: [t`$\omega_1 = \sqrt{k/m}$ and $\omega_2 = \sqrt{(k + 2k_c)/m}$.`, t`$x_1 = \tfrac{A}{2}(\cos\omega_1t + \cos\omega_2t) = A\cos\!\left(\tfrac{\omega_2 - \omega_1}{2}t\right)\cos\!\left(\tfrac{\omega_1 + \omega_2}{2}t\right)$: the envelope vanishes when $\tfrac{\omega_2 - \omega_1}{2}t = \tfrac{\pi}{2}$.`],
          teach: 'Starting one of two weakly coupled equal oscillators alone gives beats: the energy crosses over in π/(ω₂ − ω₁) and returns after 2π/(ω₂ − ω₁).',
          explain: t`$\omega_1 = ${fmt(w1, 4)}$, $\omega_2 = ${fmt(w2, 4)}$ rad/s, so $t = \pi/(${fmt(w2 - w1, 3)}) = ${fmt(tt, 3)}$ s — about ${Math.round((tt * w1) / (2 * Math.PI))} swings of mass 1 while its energy drains away.`,
          visual: pairPic({ m, m2: m, k, kc, start: 'one' }, 'Mass 1 pulled aside, mass 2 at rest. Not to scale.'),
        };
      },
    }),
    num({
      id: 'unequal', difficulty: 3,
      gen(r) {
        const m2 = r.pick([2, 3, 4]), k = r.pick([6, 8, 12]), kc = r.pick([2, 3, 4]);
        const ms = modes([1, m2], chainK([k, kc, k])), w = ms[1].omega;
        const a = m2, b = -(m2 * (k + kc) + (k + kc)), c = (k + kc) ** 2 - kc * kc;   // m₂ω⁴ + bω² + c = 0 in ω²
        return {
          prompt: t`A 1 kg mass and a ${m2} kg mass sit between walls on springs of ${k} N/m, joined by a spring of ${kc} N/m. Find the **higher** normal-mode frequency, in rad/s.`,
          answer: w, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(k + 2 * kc), feedback: t`That formula is for equal masses. With unequal masses solve $\det(K - \omega^2M) = 0$.` }, { value: ms[0].omega, feedback: 'That is the lower of the two frequencies.' }],
          hints: [t`$K = ${M([[k + kc, -kc], [-kc, k + kc]])}$, $M = ${M([[1, 0], [0, m2]])}$. Solve $\det(K - \omega^2M) = 0$.`, t`$(${k + kc} - \omega^2)(${k + kc} - ${m2}\omega^2) - ${kc * kc} = 0$, a quadratic in $\omega^2$: $${a}\omega^4 ${b < 0 ? '-' : '+'} ${Math.abs(b)}\omega^2 + ${c} = 0$.`],
          teach: 'With unequal masses the modes solve det(K − ω²M) = 0, a quadratic in ω² for two masses; the mode shapes are no longer symmetric.',
          explain: t`$\omega^2 = \dfrac{${-b} \pm \sqrt{${b * b} - ${4 * a * c}}}{${2 * a}}$ gives $\omega = ${fmt(ms[0].omega, 4)}$ and $${fmt(w, 4)}$ rad/s. In the fast mode the shape is $(1, ${fmt(ms[1].shape[1] / ms[1].shape[0], 3)})$: the light mass does most of the moving.`,
          visual: pairPic({ m: 1, m2, k, kc, start: 'one' }, `The light (blue) and heavy (violet) masses, drawn larger for more mass. Not to scale.`),
        };
      },
    }),
    num({
      id: 'isotope', difficulty: 2,
      gen(r) {
        const [label, mC, mO] = r.pick([['¹²C¹⁶O₂', 12, 16], ['¹³C¹⁶O₂', 13, 16], ['¹²C¹⁸O₂', 12, 18], ['¹³C¹⁸O₂', 13, 18]]);
        const ratio = Math.sqrt(1 + (2 * mO) / mC);
        return {
          prompt: t`In the ball-and-spring model of a linear molecule O–C–O (two equal springs, motion along the axis), the stretching modes have $\omega_{\text{sym}} = \sqrt{k/m_{\text O}}$ and $\omega_{\text{anti}} = \sqrt{\dfrac{k}{m_{\text O}}\left(1 + \dfrac{2m_{\text O}}{m_{\text C}}\right)}$. For the isotopologue ${label} (carbon ${mC} u, oxygen ${mO} u), what ratio $\omega_{\text{anti}}/\omega_{\text{sym}}$ does the model predict?`,
          answer: ratio, tol: { rel: 0.002 },
          errors: [{ value: Math.sqrt(1 + mO / mC), feedback: t`The carbon is pushed by both springs at once in the antisymmetric stretch: the factor is $1 + 2m_{\text O}/m_{\text C}$.` }, { value: 1 + (2 * mO) / mC, feedback: 'That is the ratio of the squared frequencies. Take the square root.' }],
          hints: [t`The ratio is $\sqrt{1 + 2m_{\text O}/m_{\text C}}$ — the spring constant cancels.`, t`$\sqrt{1 + 2\times${mO}/${mC}}$.`],
          teach: t`In the symmetric stretch the carbon stands still; in the antisymmetric one it moves against both oxygens, which raises the frequency by the factor $\sqrt{1 + 2m_{\text O}/m_{\text C}}$.`,
          explain: t`$\sqrt{1 + ${2 * mO}/${mC}} = ${fmt(ratio, 4)}$. A heavier carbon moves less and lowers the antisymmetric frequency; heavier oxygens lower both. Spectroscopists use exactly such isotope shifts to assign bands — though, as the checkpoint shows, this simple model is off by several per cent for real CO₂.`,
          visual: { type: 'de-modes', params: { system: 'co2', ratio: r6(mC / mO), controls: [], start: 'mode2', starts: false, play: false, graph: false, readout: false }, caption: 'The antisymmetric stretch: the two oxygens (red) move one way while the carbon moves the other. Displacements exaggerated.' },
        };
      },
    }),
    mcq({
      id: 'zero-mode', difficulty: 2,
      prompt: t`The ball-and-spring CO₂ molecule, with free ends, has $K = k${M([[1, -1, 0], [-1, 2, -1], [0, -1, 1]])}$. One of its three normal-mode frequencies is $\omega = 0$, with mode shape $(1, 1, 1)$. What motion is that?`,
      choices: ['The whole molecule sliding along its axis without stretching any bond', 'A vibration so slow it cannot be measured', 'A mistake: ω = 0 means the system has no third mode', 'The bending of the molecule'],
      answer: 0,
      why: {
        1: t`$\omega = 0$ is not a slow vibration: with no restoring force at all, the motion is $\mathbf x = (a + bt)(1, 1, 1)$ — steady drift, not oscillation.`,
        2: 'Three masses always have three modes; this one is real. It just has no restoring force.',
        3: 'Bending moves the atoms sideways, off the axis. This one-dimensional model has no sideways motion at all; it misses the bending mode (667 cm⁻¹ in real CO₂).',
      },
      hints: [t`Compute $K(1, 1, 1)$.`, 'If every atom moves by the same amount, how much does each spring stretch?'],
      teach: 'A zero eigenvalue of K is a motion that costs no spring energy — for a free molecule or a free spacecraft, the whole thing moving at once.',
      explain: t`$K(1, 1, 1) = (0, 0, 0)$: moving all three atoms together stretches nothing, so there is no restoring force and $\omega = 0$. Its motion is $(a + bt)(1, 1, 1)$ — the molecule drifting. Two docked spacecraft have the same zero mode: they can drift together, and only their relative motion vibrates.`,
      visual: { type: 'de-modes', params: { system: 'co2', controls: [], start: 'mode0', starts: false, play: false, graph: true, readout: false, T: 30 }, caption: 'Started in the zero mode, all three atoms move together: their displacements grow in step and no bond ever stretches.' },
    }),
    code({
      id: 'co2-eigh', difficulty: 3,
      prompt: t`Compute the normal modes of the ball-and-spring CO₂ molecule with SciPy. With bond stiffness $k = 1675$ N/m, oxygen 16 u and carbon 12 u, solve the generalized eigenproblem $K\mathbf v = \omega^2M\mathbf v$ with \`scipy.linalg.eigh(K, M)\` and convert each $\omega$ to a wavenumber $\tilde\nu = \omega/(2\pi c)$ in cm⁻¹, with $c = 2.998\times10^{10}$ cm/s.`,
      starter: t`import numpy as np
from scipy.linalg import eigh

u = 1.66054e-27            # kg
k = 1675.0                 # N/m
mO, mC = 16 * u, 12 * u
c = 2.998e10               # cm/s

M = np.diag([mO, mC, mO])
K = k * np.array([[1, -1, 0], [-1, 2, -1], [0, -1, 1]])

w2, V = None, None         # replace: the eigenvalues (omega squared) and mode shapes
omega = None               # replace: angular frequencies (clip tiny negative rounding to 0)
nu = None                  # replace: wavenumbers in cm^-1

print(np.round(nu, 1))
print(np.round(V / np.abs(V).max(axis=0), 3))
`,
      answer: t`import numpy as np
from scipy.linalg import eigh

u = 1.66054e-27            # kg
k = 1675.0                 # N/m
mO, mC = 16 * u, 12 * u
c = 2.998e10               # cm/s

M = np.diag([mO, mC, mO])
K = k * np.array([[1, -1, 0], [-1, 2, -1], [0, -1, 1]])

w2, V = eigh(K, M)
omega = np.sqrt(np.clip(w2, 0, None))
nu = omega / (2 * np.pi * c)

print(np.round(nu, 1))
print(np.round(V / np.abs(V).max(axis=0), 3))
`,
      tests: [
        { name: 'three frequencies, in increasing order, the first zero (translation)', code: 'nu is not None and len(nu) == 3 and abs(nu[0]) < 1 and nu[0] <= nu[1] <= nu[2]' },
        { name: 'symmetric stretch near 1333 cm⁻¹', code: 'abs(nu[1] - np.sqrt(k / mO) / (2 * np.pi * c)) < 0.5 and abs(nu[1] - 1333) < 3' },
        { name: 'antisymmetric stretch = symmetric × √(1 + 2m(O)/m(C)) ≈ 2552 cm⁻¹', code: 'abs(nu[2] / nu[1] - np.sqrt(1 + 2 * 16 / 12)) < 1e-6' },
      ],
      hints: [t`\`eigh(K, M)\` returns the eigenvalues $\omega^2$ in increasing order and the mode shapes as the columns of \`V\`.`, t`The zero mode may come out as $-10^{-12}$ or so: \`np.clip(w2, 0, None)\` before \`np.sqrt\`. Then \`nu = omega / (2 * np.pi * c)\`.`],
      teach: 'scipy.linalg.eigh(K, M) solves the generalized symmetric eigenproblem Kv = ω²Mv directly — the standard tool for normal modes of any size.',
      explain: t`The wavenumbers are about $0$, $1333$ and $2552$ cm⁻¹, with shapes $(1, 1, 1)$, $(1, 0, -1)$ and $(0.375, -1, 0.375)$. The stiffness was chosen to match the measured symmetric stretch (1333 cm⁻¹); the model then predicts the antisymmetric stretch at 2552 cm⁻¹, while the measured band is at 2349 cm⁻¹ — 8% lower, because real bonds interact (stretching one softens the other), which two independent springs cannot capture.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-docked', difficulty: 3, transfer: true,
      gen(r) {
        const m1 = r.pick([10, 12, 15]), m2 = r.pick([20, 25, 40]), kk = r.pick([4, 5, 8]);
        const mu = (m1 * m2) / (m1 + m2) * 1000, k = kk * 1e6, f = Math.sqrt(k / mu) / (2 * Math.PI);
        return {
          prompt: t`A ${m1}-tonne capsule docks with a ${m2}-tonne module far from any planet. Treat the docking adapter as a spring of axial stiffness $${kk}\times10^6$ N/m and the two vehicles as rigid masses, free at both ends. At what frequency (in Hz) do they vibrate against each other along the docking axis?`,
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(k / (m1 * 1000)) / (2 * Math.PI), feedback: t`That treats the module as an immovable wall. Both vehicles move: the mode has $\omega^2 = k(1/m_1 + 1/m_2)$.` }, { value: Math.sqrt(k / mu), feedback: t`That is $\omega$ in rad/s. The question asks for $f = \omega/2\pi$ in Hz.` }],
          hints: [t`$M = \text{diag}(m_1, m_2)$ and $K = k${M([[1, -1], [-1, 1]])}$. One mode is $\omega = 0$ (drifting together).`, t`$\det(K - \omega^2M) = 0$ gives $\omega^2 = k\left(\tfrac{1}{m_1} + \tfrac{1}{m_2}\right) = k/\mu$, with the reduced mass $\mu = m_1m_2/(m_1 + m_2)$.`],
          teach: 'Two free bodies joined by a spring have a zero mode (drifting together) and one vibration at ω = √(k/μ), with μ the reduced mass.',
          explain: t`$\mu = ${m1}\times${m2}/${m1 + m2} = ${fmt(mu / 1000, 4)}$ t, so $\omega = \sqrt{${kk}\times10^6/${fmt(mu, 4)}} = ${fmt(2 * Math.PI * f, 4)}$ rad/s and $f = ${fmt(f, 3)}$ Hz. In the mode the vehicles move oppositely, the lighter one ${fmt(m2 / m1, 3)} times as far. Real stacks have many more modes (flexible structures, solar arrays), which is why docking loads are analysed with exactly this eigenproblem at much larger size.`,
          visual: pairPic({ m: 1, m2: r6(m2 / m1), k: 0, kc: 1, start: 'one' }, 'The capsule (blue) and module (violet) joined by the adapter (gold), free at both ends. Masses drawn to their ratio; not to scale.'),
        };
      },
    }),
    num({
      id: 'cp-co2-sensor', difficulty: 3, transfer: true,
      prompt: t`Infrared (NDIR) gas sensors detect CO₂ by its strong absorption at the antisymmetric stretch. Its symmetric stretch is measured at 1333 cm⁻¹. Using the ball-and-spring model’s ratio $\omega_{\text{anti}}/\omega_{\text{sym}} = \sqrt{1 + 2m_{\text O}/m_{\text C}}$ (16 u and 12 u), at what wavelength, in μm, would the model put the antisymmetric band?`,
      answer: 1e4 / (1333 * Math.sqrt(1 + 32 / 12)), units: 'um', tol: { rel: 0.005 },
      errors: [{ value: 1e4 / 1333, feedback: 'That is the wavelength of the symmetric stretch itself. Scale the wavenumber up by the model’s ratio first.' }, { value: 1e4 / 2349, feedback: 'That is the real, measured band (2349 cm⁻¹). The question asks what the simple model predicts.' }],
      hints: [t`$\tilde\nu_{\text{anti}} = 1333\times\sqrt{1 + 32/12}$ cm⁻¹.`, t`A wavenumber $\tilde\nu$ in cm⁻¹ is a wavelength $\lambda = 1/\tilde\nu$ cm $= 10^4/\tilde\nu$ μm.`],
      teach: 'Mode frequencies predicted by a ball-and-spring model are a first guess; the real spectrum includes effects the model leaves out.',
      explain: t`$\tilde\nu = 1333\times1.915 = 2552$ cm⁻¹, so $\lambda = 10^4/2552 = 3.92$ μm. The measured band is at 2349 cm⁻¹, $\lambda = 4.26$ μm — the wavelength real sensors use. The model’s 8% error comes from treating the two bonds as independent springs; real CO₂ also bends (at 15 μm), which the one-dimensional model cannot show.`,
      visual: { type: 'de-modes', params: { system: 'co2', controls: [], start: 'mode2', starts: false, play: false, graph: false, readout: false }, caption: 'The antisymmetric stretch of the ball-and-spring CO₂ model. Displacements exaggerated.' },
    }),
    mcq({
      id: 'cp-no-sloshing', difficulty: 2,
      prompt: t`Two equal masses between walls are joined by a coupling spring. From which starting displacement (both released from rest) does the coupling spring keep its natural length for all time?`,
      choices: [t`$(x_1, x_2) = (2, 2)$ cm`, t`$(2, -2)$ cm`, t`$(2, 0)$ cm`, t`$(2, 1)$ cm`],
      answer: 0,
      why: {
        1: t`$(2, -2)$ is the other pure mode: it also never sloshes energy, but the coupling spring is stretched and squeezed by $4$ cm in every swing.`,
        2: t`$(2, 0) = (1, 1) + (1, -1)$ mixes both modes: the masses beat, and the spring stretches as their motions drift apart.`,
        3: t`$(2, 1)$ is $1.5(1, 1) + 0.5(1, -1)$: a mix of both modes, so the spring stretches.`,
      },
      hints: ['The coupling spring keeps its length only if x₁ = x₂ at every moment.', t`Which start is a multiple of the mode shape $(1, 1)$?`],
      teach: 'A start that is a multiple of one mode shape stays in that mode forever: the system moves in that pattern at that one frequency.',
      explain: t`$(2, 2) = 2(1, 1)$ is pure mode 1, so $\mathbf x = 2(1, 1)\cos\omega_1t$: the masses move in lockstep and the coupling spring never changes length.`,
      visual: pairPic({ m: 1, m2: 1, k: 10, kc: 1, start: 'one' }, 'The two masses and three springs (coupling spring gold). Not to scale.'),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §3.6 Second-order systems and applications', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'NIST CCCBDB: experimental vibrational frequencies of CO₂', url: 'https://cccbdb.nist.gov/exp2x.asp?casno=124389' },
    { label: 'SciPy reference: scipy.linalg.eigh', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.linalg.eigh.html' },
  ],
});
