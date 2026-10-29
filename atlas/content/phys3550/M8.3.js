// Many coupled oscillators and the continuum limit (Taylor §11.6–11.7 and
// problems; the hanging chain is Daniel Bernoulli's 1733 problem, the first
// appearance of what became the Bessel function J₀). N beads on light rods
// hanging from a pivot: in the beads' sideways positions M is diagonal and K
// tridiagonal, with the tension growing upward, T_j = (beads below)·mg. As N
// → ∞ at fixed length and mass this becomes μ y_tt = ∂_z(T(z) y_z) with
// T = μgz (z up from the free end); a mode y = Y(z) cos ωt obeys
// (gzY′)′ + ω²Y = 0, solved by Y = J₀(2ω√(z/g)); the fixed top gives
// ω_n = (j₀,ₙ/2)√(g/L): 1.2024, 2.7600, 4.3268 times √(g/L) — NOT harmonic.
// PHYS 3750 W3–W4 did the uniform chain and string (equal tension, harmonic
// overtones, the wave equation); here the tension varies, and the matrix
// eigenproblem becomes a differential one. Explore: cm4-modes (chain, N
// slider, gallery and the ladder against j₀,ₙ/2). Practice: the rope's period,
// overtones not harmonic, T(z), the order of the limit, a pulse's travel time
// ∫dz/√(gz) = 2√(L/g), counting modes. Transfer: a long line hanging from a
// helicopter. Links: phys3750.W3.1–W4.2, phys3550.M13.1 (field Lagrangians).
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { sci, distinct, G } from './_cm.js';
import { eigGen, modesPic } from './_cm4.js';

const t = String.raw;
const J0 = [2.404825557695773, 5.520078110286311, 8.653727912911013, 11.791534439014281];

// the bead chain's frequencies (N equal beads, total length L, rods L/N), from the angle-coordinate M and K
function beadChain(N, L) {
  const m = Array(N).fill(1 / N), l = Array(N).fill(L / N), M = [], K = [];
  for (let i = 0; i < N; i++) {
    M.push([]); K.push(Array(N).fill(0));
    for (let j = 0; j < N; j++) { let s = 0; for (let k = Math.max(i, j); k < N; k++) s += m[k]; M[i].push(l[i] * l[j] * s); }
    let below = 0; for (let k = i; k < N; k++) below += m[k];
    K[i][i] = G * l[i] * below;
  }
  return eigGen(K, M).w2.map(Math.sqrt);
}

const EX = (() => {
  const L = 2, s = Math.sqrt(G / L), w = J0.slice(0, 3).map((j) => (j / 2) * s);
  return { L, s, w, T: w.map((x) => (2 * Math.PI) / x), b4: beadChain(4, L), b8: beadChain(8, L), b24: beadChain(24, L) };
})();

export default lesson({
  id: 'phys3550.M8.3',
  title: 'Many coupled oscillators and the continuum limit',
  minutes: 20, difficulty: 4,
  intro: t`Hang $N$ beads one below another on light rods and you have $N$ coupled pendulums: $N$ coordinates, $N$ normal modes. Let $N$ grow while the total mass and length stay fixed and the chain becomes a hanging rope — a **continuous** system with infinitely many modes, and the matrix equation $(\mathbf K - \omega^2\mathbf M)\mathbf a = 0$ becomes a **differential** equation for the mode's shape. [PHYS 3750](#/lesson/phys3750.W4.1) took this limit for a uniform chain and got the wave equation, with overtones at whole multiples of the fundamental. A hanging rope is different in one way that changes everything: **its tension grows with height**, because each point holds up the rope below it. Its modes are Bessel functions, and its overtones are not harmonics.`,
  equation: t`\mu\,\frac{\partial^2y}{\partial t^2} = \frac{\partial}{\partial z}\Big(T(z)\,\frac{\partial y}{\partial z}\Big),\quad T = \mu gz\quad\Longrightarrow\quad \omega_n = \frac{j_{0,n}}{2}\sqrt{\frac gL}`,
  symbols: [
    { tex: 'y(z, t)', text: 'the rope’s sideways displacement at height $z$, in m' },
    { tex: 'z', text: 'height measured **up from the free bottom end**, in m ($0 \\le z \\le L$; the top, fixed, is at $z = L$)' },
    { tex: '\\mu', text: 'mass per unit length, kg/m (it cancels from the frequencies)' },
    { tex: 'T(z) = \\mu gz', text: 'the tension at height $z$: the weight of the rope below, in N' },
    { tex: 'L', text: 'the rope’s length, m' },
    { tex: 'j_{0,n}', text: 'the $n$-th zero of the Bessel function $J_0$: 2.405, 5.520, 8.654, …' },
    { tex: '\\omega_n', text: 'the $n$-th normal-mode angular frequency, rad/s' },
  ],
  why: t`Every continuous body — a beam, a wing, a launch vehicle, a star — is analysed both ways: as many coupled masses on a computer and as a differential equation on paper. Passing from one to the other is the step from particle mechanics to **field theory**, where the Lagrangian becomes a density ([M13.1](#/lesson/phys3550.M13.1)) and equations like this one become the wave equations of light and gravity.`,
  visual: {
    type: 'cm4-modes',
    title: 'From beads to a rope',
    lead: t`$N$ equal beads on equal rods, total length 1 m. Top: one mode swinging (press Play). Middle: the first eight modes. Bottom: each $\omega_n\sqrt{L/g}$ (dots) beside the continuous rope's $j_{0,n}/2$ (gold dashes).`,
    tasks: [
      t`$N = 2$ is the double pendulum: its slow mode sits 10% below the rope's.`,
      t`Raise $N$ to 24: the low modes close in on the gold dashes from below; high modes need many beads per wiggle before they converge.`,
      t`Look at the mode shapes: the wiggles are crowded toward the bottom, where the tension is low and waves are slow — a Bessel function, not a sine.`,
    ],
    params: { system: 'chain', N: 12, m: 0.1, l: null, start: 'mode', n: 2, panels: ['system', 'gallery', 'ladder'], controls: ['N', 'n'], maxN: 24 },
    caption: t`Equal point masses on light rigid rods (total length 1 m), small oscillations solved exactly as a sum of normal modes. Sideways swings exaggerated. The continuous rope's frequencies are Bernoulli's: $(j_{0,n}/2)\sqrt{g/L}$.`,
  },
  example: {
    prompt: t`A uniform chain $L = ${EX.L}$ m long hangs from a fixed hook. Derive its mode equation from the bead model and find its first three normal frequencies. Compare with chains of 4, 8 and 24 beads.`,
    visual: modesPic({ N: 24, m: 1 / 24, l: EX.L / 24, panels: ['gallery'] }, t`The first eight modes of a 24-bead chain, already close to the continuous rope's. Sideways swings exaggerated.`),
    steps: [
      { label: 'Beads', text: t`Use the beads' sideways positions $x_j$ as coordinates. Each rod pulls along itself with the weight hanging below it, $T_j = (\text{beads below})\,mg$, so for small angles $m\ddot x_j = \frac{T_j}{a}(x_{j-1} - x_j) - \frac{T_{j+1}}{a}(x_j - x_{j+1})$, with $a$ the rod length. Now $\mathbf M = m\mathbf 1$ and the coupling sits in a tridiagonal $\mathbf K$ — the same system as [M8.1](#/lesson/phys3550.M8.1)'s angles, in other coordinates.` },
      { label: 'Continuum', text: t`Let $a \to 0$ with $m = \mu a$ fixed per length. The differences become derivatives, $\frac1a\big[T(z + a)\,y' - T(z)\,y'\big] \to \partial_z(Ty')$, and $T(z) = \mu gz$ is the weight of rope below height $z$: $$\mu\,\ddot y = \partial_z(\mu gz\,\partial_zy).$$ With constant $T$ this would be the wave equation of [W4.1](#/lesson/phys3750.W4.1).` },
      { label: 'Modes', text: t`Try $y = Y(z)\cos\omega t$: $\;\dfrac{d}{dz}\Big(gz\,\dfrac{dY}{dz}\Big) + \omega^2Y = 0$, a differential eigenvalue problem — the $N\times N$ matrix has become an operator.` },
      { label: 'Bessel', text: t`Substitute $s = 2\omega\sqrt{z/g}$. The equation becomes $Y'' + Y'/s + Y = 0$ (primes now $d/ds$): Bessel's equation of order zero. The solution finite at the free end is $Y = J_0\big(2\omega\sqrt{z/g}\big)$.` },
      { label: 'Fixed top', text: t`$Y(L) = 0$ needs $2\omega\sqrt{L/g} = j_{0,n}$, so $\omega_n = \tfrac12 j_{0,n}\sqrt{g/L}$. With $\sqrt{g/L} = ${sci(EX.s, 4)}$ rad/s: $\omega_1 = ${sci(EX.w[0], 3)}$, $\omega_2 = ${sci(EX.w[1], 3)}$, $\omega_3 = ${sci(EX.w[2], 3)}$ rad/s (periods $${sci(EX.T[0], 3)}$, $${sci(EX.T[1], 3)}$, $${sci(EX.T[2], 3)}$ s).` },
      { label: 'Check the beads', text: t`Solving the bead matrices: $\omega_1 = ${sci(EX.b4[0], 3)}$, $${sci(EX.b8[0], 3)}$, $${sci(EX.b24[0], 3)}$ rad/s for 4, 8, 24 beads — creeping up to $${sci(EX.w[0], 3)}$. The ratios $\omega_2/\omega_1 = 2.295$ and $\omega_3/\omega_1 = 3.598$: not 2 and 3. The rope's overtones are not harmonics.` },
    ],
    answer: t`$\omega_n = \tfrac12j_{0,n}\sqrt{g/L}$: $${sci(EX.w[0], 3)}$, $${sci(EX.w[1], 3)}$ and $${sci(EX.w[2], 3)}$ rad/s for the 2 m chain. Bead chains approach these from below as the number of beads grows.`,
  },
  practice: [
    num({
      id: 'rope-period', difficulty: 2,
      gen(r) {
        const L = r.pick([0.5, 1, 1.5, 3, 4]);
        const w = (J0[0] / 2) * Math.sqrt(G / L), T = (2 * Math.PI) / w;
        return {
          prompt: t`A uniform chain $${L}\ \text{m}$ long hangs from a hook. What is the period of its slowest sideways swing?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: 2 * Math.PI * Math.sqrt(L / G), feedback: t`That is a simple pendulum of length $L$, all its mass at the bottom. A chain's mass is spread up its length: $\omega_1 = 1.2024\sqrt{g/L}$.` }, { value: 2 * Math.PI * Math.sqrt((2 * L) / (3 * G)), feedback: t`That treats the chain as a rigid rod swinging from its end ($\omega^2 = 3g/2L$). A chain bends: $\omega_1 = (j_{0,1}/2)\sqrt{g/L}$.` }, { value: (2 * Math.PI) / (J0[0] * Math.sqrt(G / L)), feedback: t`$\omega_n = \tfrac12j_{0,n}\sqrt{g/L}$: keep the $\tfrac12$.` }], T),
          hints: [t`$\omega_1 = \tfrac12j_{0,1}\sqrt{g/L}$ with $j_{0,1} = 2.405$.`],
          teach: t`A hanging chain's slowest mode is $\omega_1 = 1.2024\sqrt{g/L}$.`,
          explain: t`$\omega_1 = 1.2024\sqrt{9.8/${L}} = ${sci(w, 3)}$ rad/s, so $T_1 = ${sci(T, 3)}$ s — a little quicker than a simple pendulum of the same length ($${sci(2 * Math.PI * Math.sqrt(L / G), 3)}$ s), slower than a rigid rod ($${sci(2 * Math.PI * Math.sqrt((2 * L) / (3 * G)), 3)}$ s).`,
          visual: modesPic({ N: 24, m: 1 / 24, l: L / 24, panels: ['system'], start: 'mode', n: 1 }, t`A hanging chain (24 beads standing in for the rope) in its slowest mode. Swing exaggerated.`),
        };
      },
    }),
    mcq({
      id: 'not-harmonic', difficulty: 2,
      prompt: t`A guitar string's overtones are at $2, 3, 4, \ldots$ times its fundamental. A hanging chain's are at $2.295, 3.598, 4.903, \ldots$ times. Why the difference?`,
      visual: modesPic({ N: 24, m: 1 / 24, l: 1 / 24, panels: ['ladder'] }, t`A 24-bead chain's frequencies (dots) against the continuous rope's (dashes), in units of $\sqrt{g/L}$.`),
      choices: [t`The chain's tension grows with height, so waves travel faster near the top than near the bottom; the modes are Bessel functions, not sines`, t`The chain has one free end, which halves the frequencies`, t`Gravity adds a constant to every frequency`, t`The chain is made of discrete links, while the string is continuous`],
      answer: 0,
      why: { 1: t`A free end changes which sines fit (odd quarter-waves: 1, 3, 5…), but those would still be harmonic.`, 2: t`The frequencies are all proportional to $\sqrt{g/L}$; there is no additive shift.`, 3: t`The continuous rope, with no links at all, has these same non-harmonic ratios: they come from the varying tension.` },
      hints: [t`Wave speed on a string is $\sqrt{T/\mu}$. What is $T$ at the top of a hanging chain, and at the bottom?`],
      teach: t`Non-uniform tension gives non-sinusoidal modes and non-harmonic overtones.`,
      explain: t`With constant tension the mode equation is $Y'' = -k^2Y$: sines and harmonic overtones. With $T = \mu gz$ it is Bessel's equation, whose zeros are not evenly spaced (they become so only far out, $j_{0,n} \approx (n - \tfrac14)\pi$). Drums ([W8.2](#/lesson/phys3750.W8.2)) are not harmonic either, for a related reason.`,
    }),
    expr({
      id: 'tension', difficulty: 1,
      prompt: t`A uniform chain of mass per length $\mu$ hangs at rest. What is the tension at height $z$ above its free bottom end?`,
      answer: 'mu*g*z', answerTeX: t`\mu gz`, lhs: 'T(z)', vars: { mu: [0.1, 2], g: [9, 10], z: [0.1, 2], L: [2.5, 4] },
      errors: [{ answer: 'mu*g*(L - z)', feedback: t`$z$ is measured up from the bottom: the rope below height $z$ has length $z$.` }, { answer: 'mu*g*L', feedback: t`That is the tension at the top only, where the whole weight hangs. Lower down, less rope hangs below.` }],
      hints: [t`Each point holds up the rope below it: what length of rope is below height $z$?`],
      teach: t`In a hanging chain the tension at any point is the weight of the chain below it.`,
      explain: t`The length below is $z$, so $T = \mu gz$: zero at the free end and $\mu gL$ at the hook. The local wave speed $\sqrt{T/\mu} = \sqrt{gz}$ falls to zero at the bottom.`,
      visual: modesPic({ N: 12, m: 1 / 12, l: 1 / 12, panels: ['system'], start: 'mode', n: 1, amp: 0.05 }, t`A hanging chain (12 beads), barely displaced.`),
    }),
    num({
      id: 'travel-time', difficulty: 3,
      gen(r) {
        const L = r.pick([1, 2, 5, 10]);
        const tt = 2 * Math.sqrt(L / G);
        return {
          prompt: t`A sideways kink is made at the bottom of a hanging chain $${L}\ \text{m}$ long and travels up it at the local wave speed $v = \sqrt{T/\mu} = \sqrt{gz}$. How long does it take to reach the top?`,
          answer: tt, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: L / Math.sqrt(G * L), feedback: t`That uses the top's speed all the way. The kink starts slow: integrate $dt = dz/\sqrt{gz}$.` }, { value: Math.sqrt(L / G), feedback: t`$\int_0^L z^{-1/2}dz = 2\sqrt L$: the factor 2 matters.` }], tt),
          hints: [t`$t = \int_0^L\frac{dz}{v(z)} = \int_0^L\frac{dz}{\sqrt{gz}}$.`, t`$\int_0^Lz^{-1/2}\,dz = 2\sqrt L$.`],
          teach: t`When the wave speed varies along a medium, the travel time is $\int dz/v$.`,
          explain: t`$t = \frac{2\sqrt L}{\sqrt g} = 2\sqrt{L/g} = ${sci(tt, 3)}$ s — exactly the time a dropped stone takes to fall the chain's length. The slow, crowded wiggles at the bottom of every mode shape are this slow speed at work.`,
          visual: modesPic({ N: 24, m: 1 / 24, l: L / 24, panels: ['gallery'] }, t`The chain's modes: the wiggles crowd toward the bottom, where waves are slowest.`),
        };
      },
    }),
    order({
      id: 'limit', difficulty: 2,
      prompt: t`Put the steps from beads to a continuous rope in order.`,
      visual: modesPic({ N: 8, m: 1 / 8, l: 1 / 8, panels: ['ladder'] }, t`Eight beads (dots) against the rope's frequencies (dashes).`),
      items: [t`Write Newton (or Lagrange) for bead $j$, pulled by the rods above and below it`, t`Let the spacing $a \to 0$ with mass per length $\mu = m/a$ fixed: differences become derivatives`, t`Get the field equation $\mu\ddot y = \partial_z(T\,\partial_zy)$`, t`Separate $y = Y(z)\cos\omega t$ to get an eigenvalue equation for $Y$`, t`Apply the boundary conditions (finite at the free end, zero at the hook) to get the allowed $\omega_n$`],
      hints: [t`Discrete first, then the limit, then separate variables, then boundary conditions.`],
      teach: t`The continuum limit turns an $N\times N$ matrix eigenproblem into a differential eigenproblem with boundary conditions.`,
      explain: t`The boundary conditions play the role the matrix's size played: they make the allowed $\omega$'s discrete. In field theory the same limit is taken in the Lagrangian itself, giving a Lagrangian density ([M13.1](#/lesson/phys3550.M13.1)).`,
    }),
    mcq({
      id: 'count', difficulty: 1,
      prompt: t`A chain of 6 beads hangs from a hook and swings in one vertical plane. How many normal modes does it have, and how many does the continuous rope have?`,
      visual: modesPic({ N: 6, m: 1 / 6, l: 1 / 6, panels: ['gallery'] }, t`The modes of a six-bead hanging chain.`),
      choices: [t`6 and infinitely many: one mode per coordinate`, t`6 and 6: the rope inherits the beads' modes`, t`1 and 1: each is a single pendulum`, t`12 and infinitely many: two per bead`],
      answer: 0,
      why: { 1: t`The rope has a continuum of coordinates (one $y$ per height), so infinitely many modes; the beads approximate only its lowest ones well.`, 2: t`Each bead has its own coordinate; a rigid single pendulum would have only one mode.`, 3: t`In one plane each bead has one coordinate (its sideways position); swinging in both horizontal directions would double it.` },
      hints: [t`Count the coordinates: one sideways position per bead.`],
      teach: t`A system has one normal mode per degree of freedom.`,
      explain: t`Six coordinates, six modes; the rope has one coordinate per point, so infinitely many. That is why a bead chain reproduces the rope's low modes and fails for the high ones: mode $n$ needs several beads per wiggle.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-longline', difficulty: 2, transfer: true,
      gen(r) {
        const L = r.pick([15, 20, 30, 45]);
        const T = (2 * Math.PI) / ((J0[0] / 2) * Math.sqrt(G / L));
        return {
          prompt: t`A helicopter hovers with a $${L}\ \text{m}$ heavy, flexible line hanging from its hook and nothing on the end. Treating the helicopter as a fixed point, what is the period of the line's slowest sway?`,
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: distinct([{ value: 2 * Math.PI * Math.sqrt(L / G), feedback: t`That is a weight on a light line. A heavy line with nothing on the end is a hanging chain: $\omega_1 = 1.2024\sqrt{g/L}$.` }, { value: (2 * Math.PI) / ((J0[1] / 2) * Math.sqrt(G / L)), feedback: t`That is the second mode.` }], T),
          hints: [t`$\omega_1 = \tfrac12j_{0,1}\sqrt{g/L}$, $j_{0,1} = 2.405$.`, t`$T = 2\pi/\omega_1$.`],
          teach: t`An unloaded hanging line sways like Bernoulli's chain, $\omega_1 = 1.2024\sqrt{g/L}$.`,
          explain: t`$\omega_1 = 1.2024\sqrt{9.8/${L}} = ${sci((J0[0] / 2) * Math.sqrt(G / L), 3)}$ rad/s, so $T_1 = ${sci(T, 3)}$ s. Its higher modes are not harmonics of this, so a line excited by the rotor's buffeting does not ring like a string. (Real lines also feel the rotor's downwash and air drag.)`,
          visual: modesPic({ N: 24, m: 1 / 24, l: L / 24, panels: ['system'], start: 'mode', n: 1 }, t`The line (24 beads standing in for it) in its slowest sway. Swing exaggerated.`),
        };
      },
    }),
    num({
      id: 'cp-two-beads', difficulty: 3,
      prompt: t`Model a hanging rope of length $L$ crudely as two equal beads on two rods of length $L/2$ — the double pendulum, with $\omega_1^2 = (2 - \sqrt2)\,g/(L/2)$. What fraction of the true rope's $\omega_1 = 1.2024\sqrt{g/L}$ does the model give?`,
      answer: Math.sqrt(2 * (2 - Math.SQRT2)) / (J0[0] / 2), tol: { rel: 0.003 },
      errors: [{ value: Math.sqrt(2 - Math.SQRT2) / (J0[0] / 2), feedback: t`The rods are $L/2$ long: $\omega_1^2 = (2 - \sqrt2)g/(L/2) = 2(2 - \sqrt2)g/L$.` }, { value: (J0[0] / 2) / Math.sqrt(2 * (2 - Math.SQRT2)), feedback: t`That is the rope over the model. The model is the lower one.` }],
      hints: [t`$\omega_1^{\text{model}} = \sqrt{2(2 - \sqrt2)}\sqrt{g/L}$.`, t`Divide by $1.2024\sqrt{g/L}$.`],
      teach: t`Even two beads get a hanging rope's fundamental within about 10%, from below.`,
      explain: t`$\sqrt{2(2 - \sqrt2)} = 1.0824$, and $1.0824/1.2024 = 0.900$. Discrete models concentrate the mass at the beads, which here sit lower than the rope's spread mass on average; their frequencies approach the continuum's from below as beads are added.`,
      visual: modesPic({ N: 2, m: 0.5, l: 0.5, panels: ['ladder'] }, t`Two beads (dots) against the continuous rope (dashes).`),
    }),
    mcq({
      id: 'cp-ratio', difficulty: 2,
      prompt: t`For a uniform chain hanging from a fixed point, what is $\omega_2/\omega_1$?`,
      visual: modesPic({ N: 24, m: 1 / 24, l: 1 / 24, panels: ['gallery'] }, t`The modes of a long bead chain.`),
      choices: [t`$j_{0,2}/j_{0,1} \approx 2.295$`, t`2, as for any string`, t`3, because one end is free`, t`$\sqrt2$, as for the double pendulum's mode shapes`],
      answer: 0,
      why: { 1: t`Whole-number ratios belong to uniform tension; here the tension varies with height.`, 2: t`A free end on a uniform string gives 1 : 3 : 5…, but this string is not uniform.`, 3: t`$\sqrt2$ is the double pendulum's amplitude ratio in a mode, not a frequency ratio.` },
      hints: [t`$\omega_n \propto j_{0,n}$, the zeros of $J_0$: 2.405, 5.520, 8.654.`],
      teach: t`A hanging chain's frequency ratios are ratios of zeros of $J_0$.`,
      explain: t`$5.520/2.405 = 2.295$. Daniel Bernoulli found these modes in the early 1730s as a power series — the first appearance of what became the Bessel function $J_0$.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 11: coupled oscillators and normal modes', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'NIST Digital Library of Mathematical Functions, §10.21: zeros of Bessel functions', url: 'https://dlmf.nist.gov/10.21' },
  ],
});
