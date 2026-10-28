// Measurement and probability for spin ½ (McIntyre ch. 2, Townsend ch. 3):
// the postulates in their two-state form — Hermitian spin operators, the Born
// rule P(a) = |⟨a|ψ⟩|², projection onto the result, expectation values and
// spreads — and why the unobserved "both beams" loop of M1.1 gives no −z:
// amplitudes for indistinguishable paths add before squaring. Every number
// is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { sgPic, blochPic, seg, label, r6 } from './_qm.js';

const t = String.raw;
const D = Math.PI / 180;

/** A normalized state (p|+⟩ + q e^{iφ}|−⟩)/√(p² + q²): its TeX, amplitudes and Bloch angles. */
const PH = [[0, '', '+'], [90, 'i', '+'], [180, '', '-'], [270, 'i', '-'], [60, 'e^{i\\pi/3}', '+'], [120, 'e^{2i\\pi/3}', '+']];
function state(r, { phases = PH } = {}) {
  const [p, q] = r.pick([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [3, 4], [4, 3], [1, 1]]);
  const [ph, phTeX, sign] = r.pick(phases);
  const N2 = p * p + q * q, a = p / Math.sqrt(N2), b = q / Math.sqrt(N2);
  const bRe = b * Math.cos(ph * D), bIm = b * Math.sin(ph * D);
  const x = 2 * a * bRe, y = 2 * a * bIm, z = a * a - b * b;
  const th = Math.acos(Math.max(-1, Math.min(1, z))) / D, phi = ph;
  const c = (n) => (n === 1 ? '' : `${n}\\,`);
  const tex = t`\tfrac{1}{\sqrt{${N2}}}\big(${c(p)}|+\rangle ${sign} ${c(q)}${phTeX ? phTeX + '\\,' : ''}|-\rangle\big)`;
  return { p, q, ph, N2, a, b, x, y, z, th, phi, tex };
}

/** Two bars at the eigenvalues ±ħ/2. */
function spinBars(pPlus, caption, axis = 'z') {
  return {
    type: 'graph',
    params: {
      x: [-1, 1], y: [0, 1.1], aspect: 'wide', xlabel: `measured spin component along ${axis} (units of ħ)`, ylabel: 'probability', axesAt: 'edge', xticks: 4,
      curves: [seg(-0.5, 0, -0.5, 1 - pPlus, 'violet', 9), seg(0.5, 0, 0.5, pPlus, 'gold', 9)],
      points: [label(-0.5, 1 - pPlus, fmt(1 - pPlus, 3), 'violet', 0, -12, 'center'), label(0.5, pPlus, fmt(pPlus, 3), 'gold', 0, -12, 'center')],
    },
    caption,
  };
}

export default lesson({
  id: 'phys4700.M1.3',
  title: 'Measurement and probability',
  minutes: 15, difficulty: 3,
  intro: t`The Stern–Gerlach rules, written in kets, are the **postulates of quantum mechanics** in miniature. A spin component is a Hermitian operator: $\hat S_z = \tfrac{\hbar}{2}\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$, $\hat S_x = \tfrac{\hbar}{2}\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$, $\hat S_y = \tfrac{\hbar}{2}\begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}$. A measurement gives one of its eigenvalues, never anything between, with the **Born rule**’s probability, and leaves the system in that eigenvalue’s eigenstate:

$$P(a) = |\langle a|\psi\rangle|^2, \qquad \langle A\rangle = \sum_a a\,P(a) = \langle\psi|\hat A|\psi\rangle$$

The expectation value $\langle A\rangle$ is the average over many identically prepared systems — usually **not** a possible result of any one. One more rule explains the analyser loop of [Stern–Gerlach experiments](#/lesson/phys4700.M1.1): when nothing records which of several paths a system took, their **amplitudes** add, and only then is the sum squared.`,
  symbols: [
    { tex: 'P(a)', text: t`the probability that a measurement of $\hat A$ gives the result $a$` },
    { tex: '|a\\rangle', text: t`the eigenstate of $\hat A$ with eigenvalue $a$; the state right after that result` },
    { tex: '\\langle a|\\psi\\rangle', text: 'the probability amplitude: a complex number whose squared modulus is the probability' },
    { tex: '\\langle A\\rangle', text: t`the expectation value: the mean of many results, in the units of $A$ (J s for spin)` },
    { tex: '\\hat A', text: t`the observable’s Hermitian operator, here $\hat S_x$, $\hat S_y$, $\hat S_z$ or $\hat S_n = \hat n\cdot\vec S$` },
    { tex: '\\hbar/2', text: t`the size of each spin-½ eigenvalue: $\pm\hbar/2$ along every axis` },
  ],
  why: 'These few rules — results are eigenvalues, probabilities are squared amplitudes, and measuring resets the state — carry over unchanged to energy, position and momentum.',
  visual: {
    type: 'qm4-sg',
    title: 'Prepare a state, then measure it',
    lead: t`The source prepares every atom in the same state $|\psi\rangle$, at Bloch angles $\theta_\psi$ and $\phi_\psi$. One analyser measures it along the axis you choose. Send atoms one at a time and then by thousands, and compare the bars with the gold marks, $|\langle\pm n|\psi\rangle|^2$.`,
    tasks: [
      'Send single atoms: each one leaves by + or by −, never anything in between.',
      'Set θψ = 60°, φψ = 0° and measure along z: about ¾ come out +. Switch to x: now about 0.93 do.',
      'Set θψ = 90° and φψ = 90°: the state is +y. Along x it is 50:50; along y every atom goes +.',
    ],
    params: { source: 'state', st: 60, sp: 0, analysers: [{ axis: 'z' }], controls: ['st', 'sp', 'a1'], N: 0 },
  },
  example: {
    prompt: t`A spin is prepared in $|\psi\rangle = \tfrac{1}{\sqrt5}\big(2|+\rangle + i|-\rangle\big)$. Find the probabilities of each result along $z$, $x$ and $y$; then $\langle S_y\rangle$ and $\Delta S_y$; then the state after a $y$ measurement gives $+\hbar/2$.`,
    visual: blochPic({ states: [{ v: [0, 0.8, 0.6], label: '|\\psi\\rangle' }], caption: t`The state’s Bloch vector is $(0,\ 0.8,\ 0.6)$: nearer $+y$ than $+z$, and on the great circle that misses $\pm x$ equally. Drag to rotate.` }),
    steps: [
      { label: 'Along z', text: t`$P(+z) = \big|\tfrac{2}{\sqrt5}\big|^2 = \tfrac45$ and $P(-z) = \big|\tfrac{i}{\sqrt5}\big|^2 = \tfrac15$.` },
      { label: 'Along x', text: t`$\langle{+x}|\psi\rangle = \tfrac{1}{\sqrt{10}}(2 + i)$, so $P(+x) = \tfrac{|2 + i|^2}{10} = \tfrac{5}{10} = \tfrac12$, and $P(-x) = \tfrac12$.` },
      { label: 'Along y', text: t`$\langle{+y}| = \tfrac{1}{\sqrt2}(1,\ -i)$, so $\langle{+y}|\psi\rangle = \tfrac{1}{\sqrt{10}}\big(2 + (-i)(i)\big) = \tfrac{3}{\sqrt{10}}$: $P(+y) = \tfrac{9}{10}$, $P(-y) = \tfrac{1}{10}$.` },
      { label: 'Mean and spread', text: t`$\langle S_y\rangle = \tfrac{\hbar}{2}\big(\tfrac{9}{10} - \tfrac{1}{10}\big) = 0.4\,\hbar$. With $S_y^2 = \hbar^2/4$ always, $\Delta S_y = \sqrt{\tfrac{\hbar^2}{4} - (0.4\hbar)^2} = 0.3\,\hbar$.` },
      { label: 'Check by matrix', text: t`$\hat S_y|\psi\rangle = \tfrac{\hbar}{2}\tfrac{1}{\sqrt5}(1,\ 2i)$, and $\langle\psi|$ is $\tfrac{1}{\sqrt5}(2,\ -i)$: $\langle\psi|\hat S_y|\psi\rangle = \tfrac{\hbar}{2}\cdot\tfrac{2 + 2}{5} = 0.4\,\hbar$. ✓` },
      { label: 'After the measurement', text: t`A result of $+\hbar/2$ along $y$ leaves the spin in $|{+y}\rangle$. A second $y$ measurement then gives $+\hbar/2$ for certain; the earlier $\tfrac45 : \tfrac15$ split along $z$ is gone, replaced by $\tfrac12 : \tfrac12$.` },
    ],
    answer: t`$z$: $\tfrac45$, $\tfrac15$; $x$: $\tfrac12$, $\tfrac12$; $y$: $\tfrac{9}{10}$, $\tfrac{1}{10}$. $\langle S_y\rangle = 0.4\hbar$, $\Delta S_y = 0.3\hbar$; afterwards the state is $|{+y}\rangle$.`,
  },
  practice: [
    num({
      id: 'p-plus-x', difficulty: 2,
      gen(r) {
        const s = state(r);
        const ans = (1 + s.x) / 2;
        return {
          prompt: t`A spin is in the state $|\psi\rangle = ${s.tex}$. What is the probability that a measurement of $S_x$ gives $+\hbar/2$?`,
          visual: sgPic([{ axis: 'x' }], { source: 'state', st: r6(s.th), sp: s.phi % 360, caption: 'The prepared state meets an x analyser. Schematic; the beams are drawn equal.' }),
          answer: ans, tol: { rel: 0.01, abs: 1e-3 },
          errors: [
            { value: s.a * s.a, feedback: t`That is $P(+z) = |\langle +|\psi\rangle|^2$. Along $x$ you need $|\langle{+x}|\psi\rangle|^2$.` },
            { value: (s.p + s.q) ** 2 / (2 * s.N2), feedback: t`You added $${s.p}$ and $${s.q}$ as if the down amplitude had no phase. Keep the phase: $|${s.p} + ${s.q}e^{i${s.ph}^\circ}|^2$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`$\langle{+x}| = \tfrac{1}{\sqrt2}(1,\ 1)$, so $\langle{+x}|\psi\rangle = \tfrac{1}{\sqrt{2}\sqrt{${s.N2}}}\big(${s.p} + ${s.q}e^{i${s.ph}^\circ}\big)$.`, t`$|p + qe^{i\phi}|^2 = p^2 + q^2 + 2pq\cos\phi$.`],
          teach: t`The probability of a result is the squared modulus of the amplitude $\langle a|\psi\rangle$, phases included.`,
          explain: t`$P(+x) = \dfrac{${s.p * s.p} + ${s.q * s.q} + 2(${s.p})(${s.q})\cos${s.ph}^\circ}{2\times${s.N2}} = ${fmt(ans, 3)}$.`,
        };
      },
    }),
    num({
      id: 'expect-sz', difficulty: 2,
      gen(r) {
        const s = state(r, { phases: PH.filter((x) => x[0] !== 0) });
        const ans = s.z / 2;
        return {
          prompt: t`For $|\psi\rangle = ${s.tex}$, find $\langle S_z\rangle$ in units of $\hbar$.`,
          visual: sgPic([{ axis: 'z' }], { source: 'state', st: r6(s.th), sp: s.phi % 360, caption: 'The prepared state meets a z analyser. Schematic; the beams are drawn equal.' }),
          answer: ans, tol: { rel: 0.01, abs: 1e-3 },
          errors: [
            { value: s.z, feedback: t`You used results $\pm1$; the eigenvalues are $\pm\hbar/2$, so halve it.` },
            { value: (s.p - s.q) / Math.sqrt(s.N2) / 2, feedback: 'Weight the eigenvalues with probabilities, the squared amplitudes, not the amplitudes themselves.' },
          ].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\langle S_z\rangle = \tfrac{\hbar}{2}P(+) - \tfrac{\hbar}{2}P(-)$.`, t`$P(+) = ${s.p * s.p}/${s.N2}$ and $P(-) = ${s.q * s.q}/${s.N2}$; the phase does not matter along $z$.`],
          teach: 'An expectation value weights each eigenvalue by its probability.',
          explain: t`$\langle S_z\rangle = \tfrac{\hbar}{2}\cdot\dfrac{${s.p * s.p} - ${s.q * s.q}}{${s.N2}} = ${fmt(ans, 3)}\,\hbar$${Math.abs(ans) > 1e-9 ? ' — between the only two possible results, and equal to neither' : ''}.`,
        };
      },
    }),
    mcq({
      id: 'sx-on-up', difficulty: 1,
      prompt: t`A spin is in $|{+z}\rangle$, and $S_x$ is measured once. What can the result be?`,
      visual: sgPic([{ axis: 'x' }], { source: 'z+', caption: 'A +z atom meets an x analyser. Schematic.' }),
      choices: [t`$+\hbar/2$ or $-\hbar/2$, each with probability $\tfrac12$`, t`$0$, since the spin points along $z$`, t`$+\hbar/2$ for certain`, t`Any value between $-\hbar/2$ and $+\hbar/2$`],
      answer: 0,
      why: {
        1: t`$0$ is $\langle S_x\rangle$, the average over many atoms. No single result is ever 0: the eigenvalues of $\hat S_x$ are $\pm\hbar/2$.`,
        2: t`The state is an eigenstate of $\hat S_z$, not of $\hat S_x$; only for an eigenstate is the result certain.`,
        3: 'Results are always eigenvalues; the Stern–Gerlach plate shows two spots, not a smear.',
      },
      hints: ['What are the eigenvalues of Sₓ?', t`$|\langle{\pm x}|{+z}\rangle|^2 = \tfrac12$.`],
      teach: 'A single result is always an eigenvalue; the expectation value is only the average of many.',
      explain: t`$\hat S_x$ has eigenvalues $\pm\hbar/2$, and $|\langle{\pm x}|{+z}\rangle|^2 = \tfrac12$. The average, $\langle S_x\rangle = 0$, is a result no atom ever gives.`,
    }),
    mcq({
      id: 'collapse', difficulty: 2,
      prompt: t`A spin in $|{+z}\rangle$ is measured along $x$ and gives $+\hbar/2$. It is measured along $x$ again at once, and then along $z$. What do those two measurements give?`,
      visual: sgPic([{ axis: 'x', pass: '+' }, { axis: 'x', pass: '+' }, { axis: 'z' }], { source: 'z+', caption: 'x, x again, then z, on an atom prepared +z. Schematic.' }),
      choices: [
        t`$x$: $+\hbar/2$ for certain; then $z$: $\pm\hbar/2$ with probability $\tfrac12$ each`,
        t`$x$: $\pm$ with $\tfrac12$ each; then $z$: $+\hbar/2$ for certain`,
        t`$x$: $+\hbar/2$ for certain; then $z$: $+\hbar/2$ for certain`,
        t`Both are $\pm$ with $\tfrac12$ each`,
      ],
      answer: 0,
      why: {
        1: 'After the first x result the state is |+x⟩, an eigenstate of Sₓ: repeating the x measurement cannot change the answer.',
        2: t`The first $x$ measurement replaced $|{+z}\rangle$ with $|{+x}\rangle$; the $z$ value was not kept underneath.`,
        3: t`A repeated measurement of the same observable, with nothing in between, agrees with the first.`,
      },
      hints: ['What state does the atom leave the first x analyser in?', 'Repeat measurements agree; a different axis starts afresh.'],
      teach: 'A measurement leaves the system in the eigenstate of its result, so repeating it agrees; measuring another axis starts from that new state.',
      explain: t`The state after the first result is $|{+x}\rangle$. Measuring $x$ again gives $+\hbar/2$ with probability $|\langle{+x}|{+x}\rangle|^2 = 1$; measuring $z$ then gives $\pm$ with $|\langle\pm|{+x}\rangle|^2 = \tfrac12$.`,
    }),
    num({
      id: 'spread-sz', difficulty: 2,
      gen(r) {
        const s = state(r, { phases: PH.filter((x) => x[0] !== 0) });
        const pairs = s.p !== s.q;
        const ans = 0.5 * Math.sqrt(1 - s.z * s.z);
        return {
          prompt: t`For $|\psi\rangle = ${s.tex}$, find the spread $\Delta S_z = \sqrt{\langle S_z^2\rangle - \langle S_z\rangle^2}$, in units of $\hbar$.`,
          visual: spinBars(s.a * s.a, t`The probabilities of the two results, $\pm\hbar/2$: the spread measures how far they scatter about their mean.`),
          answer: ans, tol: { rel: 0.01, abs: 1e-3 },
          errors: [
            { value: Math.sqrt(1 - s.z * s.z), feedback: t`Use eigenvalues $\pm\tfrac12$ (in units of $\hbar$): $\langle S_z^2\rangle = \tfrac14$.` },
            { value: 0.25 - (s.z / 2) ** 2, feedback: t`That is the variance, $(\Delta S_z)^2$. Take its square root.` },
          ].filter((e) => pairs && Math.abs(e.value - ans) > 0.01),
          hints: [t`Every result squares to $\hbar^2/4$, so $\langle S_z^2\rangle = \hbar^2/4$.`, t`$\langle S_z\rangle = \tfrac{\hbar}{2}\cdot\tfrac{${s.p * s.p} - ${s.q * s.q}}{${s.N2}}$.`],
          teach: t`For spin ½, $\langle S^2_z\rangle = \hbar^2/4$ always, so $\Delta S_z = \tfrac{\hbar}{2}\sqrt{1 - (2\langle S_z\rangle/\hbar)^2}$.`,
          explain: t`$\langle S_z\rangle = ${fmt(s.z / 2, 3)}\,\hbar$, so $\Delta S_z = \sqrt{\tfrac14 - ${fmt((s.z / 2) ** 2, 3)}}\;\hbar = ${fmt(ans, 3)}\,\hbar$. It is largest, $\hbar/2$, for a 50:50 state and zero only in $|{\pm z}\rangle$.`,
        };
      },
    }),
    code({
      id: 'measure-code', difficulty: 3,
      prompt: t`Born’s rule by eigen-decomposition. Write \`outcomes(psi, theta, phi)\`: build $\hat S_n = \hat n\cdot\vec S$ (units of $\hbar$, with the matrices \`Sx\`, \`Sy\`, \`Sz\` given) for the direction at polar angle \`theta\` and azimuth \`phi\` (degrees), diagonalize it with \`np.linalg.eigh\`, and return the eigenvalues and the probabilities $|\langle a|\psi\rangle|^2$ (normalize \`psi\` first). Then write \`mean(psi, theta, phi)\`, the expectation value $\sum a\,P(a)$.`,
      starter: t`import numpy as np

Sx = np.array([[0, 1], [1, 0]]) / 2
Sy = np.array([[0, -1j], [1j, 0]]) / 2
Sz = np.array([[1, 0], [0, -1]]) / 2

def outcomes(psi, theta, phi):
    pass

def mean(psi, theta, phi):
    pass

print(outcomes(np.array([2, 1j]), 90, 90))
`,
      answer: t`import numpy as np

Sx = np.array([[0, 1], [1, 0]]) / 2
Sy = np.array([[0, -1j], [1j, 0]]) / 2
Sz = np.array([[1, 0], [0, -1]]) / 2

def outcomes(psi, theta, phi):
    th, ph = np.radians(theta), np.radians(phi)
    Sn = np.sin(th) * np.cos(ph) * Sx + np.sin(th) * np.sin(ph) * Sy + np.cos(th) * Sz
    vals, vecs = np.linalg.eigh(Sn)
    psi = psi / np.linalg.norm(psi)
    probs = np.abs(vecs.conj().T @ psi) ** 2
    return vals, probs

def mean(psi, theta, phi):
    vals, probs = outcomes(psi, theta, phi)
    return np.sum(vals * probs)

print(outcomes(np.array([2, 1j]), 90, 90))`,
      tests: [
        { name: 'along any axis the results are −½ and +½ (units of ħ)', code: 'np.allclose(outcomes(np.array([1, 0]), 37, 122)[0], [-0.5, 0.5])' },
        { name: 'the probabilities add to 1', code: 'abs(np.sum(outcomes(np.array([3, 1 + 2j]), 70, 20)[1]) - 1) < 1e-12' },
        { name: '(2|+⟩ + i|−⟩)/√5 along y: probabilities 0.1 and 0.9', code: 'np.allclose(outcomes(np.array([2, 1j]), 90, 90)[1], [0.1, 0.9])' },
        { name: t`its $\langle S_y\rangle$ is $0.4\,\hbar$`, code: 'abs(mean(np.array([2, 1j]), 90, 90) - 0.4) < 1e-12' },
        { name: '|+z⟩ along x averages to 0', code: 'abs(mean(np.array([1, 0]), 90, 0)) < 1e-12' },
      ],
      hints: [t`$\hat S_n = \sin\theta\cos\phi\,S_x + \sin\theta\sin\phi\,S_y + \cos\theta\,S_z$.`, '`vecs.conj().T @ psi` gives every amplitude ⟨a|ψ⟩ at once (one per eigenvector column); square their moduli.'],
      teach: 'Diagonalize the observable, then project the state onto each eigenvector: the squared projections are the probabilities.',
      explain: t`\`eigh\` returns the eigenvalues $\mp\tfrac12$ (ascending) and orthonormal eigenvectors as columns; the rows of \`vecs.conj().T\` are the bras $\langle a|$. The same three lines work for any observable of any size.`,
    }),
    mcq({
      id: 'add-amplitudes', difficulty: 3, kind: 'error',
      prompt: t`Atoms in $|{+z}\rangle$ pass an $x$ analyser that sends **both** beams on, recombined, with no record of the path; then a $z$ analyser. A student predicts the − fraction:

$$P(-z) = P(+x)\,P(-z \mid +x) + P(-x)\,P(-z \mid -x) = \tfrac12\cdot\tfrac12 + \tfrac12\cdot\tfrac12 = \tfrac12.$$

The experiment gives 0. Where is the mistake?`,
      visual: sgPic([{ axis: 'x', pass: 'both' }, { axis: 'z' }], { source: 'z+', caption: 'Both x beams recombined, unobserved, then z. Schematic.' }),
      choices: [
        t`With no record of the path, the **amplitudes** add: $\langle -|{+x}\rangle\langle{+x}|+\rangle + \langle -|{-x}\rangle\langle{-x}|+\rangle = \tfrac12 - \tfrac12 = 0$`,
        t`$P(-z \mid +x)$ should be 0, not $\tfrac12$`,
        t`The $x$ analyser flips half the spins, so the probabilities should be multiplied, not added`,
        'The probabilities are right; the experiment must have lost the − atoms',
      ],
      answer: 0,
      why: {
        1: t`$|\langle -|{+x}\rangle|^2 = \tfrac12$ is correct. The error is adding probabilities for paths nobody distinguished.`,
        2: 'Nothing flips. The same analyser, with the path recorded, gives ½ exactly as the student computed.',
        3: 'The zero is real and reproducible: it is the signature of interference.',
      },
      hints: [t`Write $|+\rangle = |{+x}\rangle\langle{+x}|+\rangle + |{-x}\rangle\langle{-x}|+\rangle$ and project onto $\langle -|$.`, t`$\langle -|{\pm x}\rangle = \pm\tfrac{1}{\sqrt2}$, $\langle{\pm x}|+\rangle = \tfrac{1}{\sqrt2}$.`],
      teach: 'For alternatives nobody can tell apart, add the amplitudes and then square; add probabilities only for alternatives that are recorded.',
      explain: t`The amplitude is $\big(-\tfrac{1}{\sqrt2}\big)\tfrac{1}{\sqrt2} + \tfrac{1}{\sqrt2}\cdot\tfrac{1}{\sqrt2} = 0$ — completeness, $\sum|{\pm x}\rangle\langle{\pm x}| = 1$, turns it back into $\langle -|+\rangle = 0$. Record the path, and the two cases become distinguishable: then the probabilities add, and $\tfrac12$ is right.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sx', difficulty: 2,
      gen(r) {
        const s = state(r, { phases: PH.filter((x) => x[0] !== 90 && x[0] !== 270) });
        const ans = s.x / 2;
        return {
          prompt: t`Find $\langle S_x\rangle$, in units of $\hbar$, for $|\psi\rangle = ${s.tex}$.`,
          visual: blochPic({ states: [{ v: [s.x, s.y, s.z] }], caption: 'The state on the Bloch sphere. Drag to rotate.' }),
          answer: ans, tol: { rel: 0.01, abs: 1e-3 },
          errors: [{ value: s.x, feedback: t`The eigenvalues are $\pm\hbar/2$: halve your answer.` }, { value: (s.z) / 2, feedback: t`That is $\langle S_z\rangle$.` }].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`$\langle S_x\rangle = \tfrac{\hbar}{2}\big[P(+x) - P(-x)\big]$, or $\langle\psi|\hat S_x|\psi\rangle$ with $\hat S_x$ swapping the two amplitudes.`],
          teach: t`$\langle S_x\rangle = \hbar\,\operatorname{Re}(a^*b)$ for a state $a|+\rangle + b|-\rangle$: half the Bloch vector’s x-component, in units of $\hbar$.`,
          explain: t`$\langle\psi|\hat S_x|\psi\rangle = \tfrac{\hbar}{2}(a^*b + b^*a) = \hbar\operatorname{Re}(a^*b) = ${fmt(ans, 3)}\,\hbar$ — half the Bloch vector’s $x$-component, $${fmt(s.x, 3)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-mean-vs-result', difficulty: 2,
      prompt: t`A state has $\langle S_z\rangle = 0.3\,\hbar$. What does **one** measurement of $S_z$ on it give?`,
      visual: spinBars(0.8, 'The probabilities of the two possible results for this state.'),
      choices: [t`$+\hbar/2$ (with probability 0.8) or $-\hbar/2$ (0.2)`, t`$0.3\,\hbar$`, t`$0.3\,\hbar$ give or take $\Delta S_z$`, t`$+\hbar/2$, since the average is positive`],
      answer: 0,
      why: {
        1: t`$0.3\hbar$ is the average over many atoms; it is not an eigenvalue of $\hat S_z$.`,
        2: t`Results are eigenvalues exactly; the spread describes how the $\pm\hbar/2$ results scatter, not a blur around the mean.`,
        3: 'A positive average makes + more likely, not certain.',
      },
      hints: [t`$\tfrac{\hbar}{2}(P_+ - P_-) = 0.3\hbar$ with $P_+ + P_- = 1$.`],
      teach: 'Each measurement gives an eigenvalue; the expectation value is their probability-weighted average.',
      explain: t`$P_+ - P_- = 0.6$ and $P_+ + P_- = 1$ give $P_+ = 0.8$, $P_- = 0.2$. Every single result is $\pm\hbar/2$; only the average is $0.3\hbar$.`,
    }),
    num({
      id: 'cp-interferometer', difficulty: 3, transfer: true,
      gen(r) {
        const [n1, phi] = r.pick([[2500, 60], [5000, 90], [7500, 120], [1464, 45], [670, 30], [9330, 150]]);
        const exactPhi = Math.acos(1 - 2 * n1 / 1e4) / D;
        return {
          prompt: t`An atom interferometer splits each rubidium atom’s wave into two paths and recombines them, so each atom leaves by port 1 or port 2 — a two-outcome measurement, like a Stern–Gerlach analyser. Port 1’s probability is $P_1 = \tfrac12(1 - \cos\Phi)$, where $\Phi$ is the phase difference the two paths pick up (from gravity, in a gravimeter). NASA’s Cold Atom Lab ran the first such interferometer in orbit; space-borne gravimeters built on it are still in development. Of 10 000 atoms, ${n1.toLocaleString('en-US')} are counted at port 1. Find $\Phi$, in degrees, between $0^\circ$ and $180^\circ$.`,
          visual: {
            type: 'graph',
            params: { x: [0, 180], y: [0, 1.05], aspect: 'wide', xlabel: 'phase Φ (degrees)', ylabel: 'P₁', xticks: 6, curves: [{ fn: '(1 - cos(x*pi/180))/2', color: 'accent', width: 2.4, label: 'P₁ = (1 − cos Φ)/2', labelAt: 40, labelDy: -14 }] },
            caption: 'The port-1 probability against the phase. Atom counting turns a phase into a measured fraction.',
          },
          answer: exactPhi, units: 'deg', tol: { rel: 0, abs: 0.6 },
          errors: [{ value: Math.acos(n1 / 1e4) / D, feedback: t`Solve $\tfrac12(1 - \cos\Phi) = ${n1 / 1e4}$ for $\cos\Phi$ first: $\cos\Phi = 1 - 2P_1$.` }].filter((e) => Math.abs(e.value - exactPhi) > 1.5),
          hints: [t`The measured fraction estimates the probability: $P_1 \approx ${n1 / 1e4}$.`, t`$\cos\Phi = 1 - 2P_1$.`],
          teach: 'A two-port interferometer is a two-outcome measurement: counting atoms in each port estimates a probability, and the probability fixes the phase.',
          explain: t`$\cos\Phi = 1 - 2(${n1 / 1e4}) = ${fmt(1 - 2 * n1 / 1e4, 3)}$, so $\Phi = ${fmt(exactPhi, 3)}^\circ$ (about $${phi}^\circ$). With $N$ atoms the fraction scatters by about $\sqrt{P_1(1 - P_1)/N}$, here $${fmt(Math.sqrt((n1 / 1e4) * (1 - n1 / 1e4) / 1e4), 2)}$ — quantum projection noise, the floor every atom sensor works against.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'McIntyre, Quantum Mechanics: A Paradigms Approach, ch. 2', url: 'https://www.cambridge.org/9781009310611' },
    { label: 'Griffiths & Schroeter, Introduction to Quantum Mechanics, 3rd ed., §3.4 and §4.4.1', url: 'https://www.cambridge.org/9781316995433' },
    { label: 'Williams et al., “Pathfinder experiments with atom interferometry in the Cold Atom Lab onboard the International Space Station”, Nat. Commun. 15, 6414 (2024)', url: 'https://doi.org/10.1038/s41467-024-50585-6' },
  ],
});
