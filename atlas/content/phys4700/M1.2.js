// Spin states as vectors (McIntyre ch. 1–2, Townsend ch. 1–2). The
// Stern–Gerlach data fix the kets: |±x⟩ = (|+⟩ ± |−⟩)/√2 and, forced by a
// third unbiased axis, |±y⟩ = (|+⟩ ± i|−⟩)/√2 — complex numbers are not
// optional. The general state cos(θ/2)|+⟩ + e^{iφ} sin(θ/2)|−⟩ on the Bloch
// sphere; overall phase is invisible, relative phase is physical. Every
// number is computed here.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { fmt, nice } from '../../src/core/format.js';
import { GAMMA_P_HZ, blochPic, argand, cx, cmul, conj, abs2, r6 } from './_qm.js';

const t = String.raw;
const D = Math.PI / 180;
const S2 = Math.SQRT1_2;

/** Nice (cos θ/2, sin θ/2) pairs as TeX, by θ. */
const HALF = {
  60: [t`\tfrac{\sqrt3}{2}`, t`\tfrac12`],
  90: [t`\tfrac{1}{\sqrt2}`, t`\tfrac{1}{\sqrt2}`],
  120: [t`\tfrac12`, t`\tfrac{\sqrt3}{2}`],
  74: [t`\tfrac45`, t`\tfrac35`],
  106: [t`\tfrac35`, t`\tfrac45`],
  45: [t`\cos 22.5^\circ`, t`\sin 22.5^\circ`],
};
const THETA = { 60: 60, 90: 90, 120: 120, 74: 2 * Math.acos(0.8) / D, 106: 2 * Math.acos(0.6) / D };
const PHASE = [[0, '', ''], [90, 'i', 'i'], [180, '-', '(−1)'], [270, '-i', '(−i)'], [45, 'e^{i\\pi/4}', 'e^(iπ/4)'], [135, 'e^{3i\\pi/4}', 'e^(3iπ/4)']];

/** The Bloch vector of (cos θ/2, e^{iφ} sin θ/2). */
const bv = (th, ph) => [Math.sin(th * D) * Math.cos(ph * D), Math.sin(th * D) * Math.sin(ph * D), Math.cos(th * D)];

/** A complex number given as a modulus and a phase in degrees, with its TeX. */
const PHASORS = [
  { z: cx(1), tex: '1', deg: 0 }, { z: cx(0, 1), tex: 'i', deg: 90 }, { z: cx(-1), tex: '-1', deg: 180 }, { z: cx(0, -1), tex: '-i', deg: 270 },
  { z: cx(1, 1), tex: '1 + i', deg: 45 }, { z: cx(-1, 1), tex: '-1 + i', deg: 135 }, { z: cx(1, -1), tex: '1 - i', deg: 315 }, { z: cx(-1, -1), tex: '-1 - i', deg: 225 },
];

export default lesson({
  id: 'phys4700.M1.2',
  title: 'Spin states as vectors',
  minutes: 14, difficulty: 3,
  intro: t`The Stern–Gerlach results fix the mathematics. Call the two outcomes along $z$ the kets $|+\rangle$ and $|-\rangle$: an orthonormal basis, since a $+z$ atom never comes out $-z$. Every spin state is a combination $a|+\rangle + b|-\rangle$ with $|a|^2 + |b|^2 = 1$, and the state that an analyser along $\hat n(\theta, \phi)$ passes from its + port is

$$|{+n}\rangle = \cos\frac{\theta}{2}\,|+\rangle + e^{i\phi}\sin\frac{\theta}{2}\,|-\rangle$$

The **half-angle** is why opposite directions in space ($\theta$ and $\theta + 180^\circ$) give orthogonal kets. Two rules about phase matter from here on. An **overall phase**, $e^{i\alpha}|\psi\rangle$, changes nothing measurable. A **relative phase**, the $e^{i\phi}$ between the two terms, is physical: it is all that separates $|{+x}\rangle$ from $|{+y}\rangle$. Drawn with $(\theta, \phi)$ as polar angles, the states fill a sphere, the **Bloch sphere**.`,
  symbols: [
    { tex: '|+\\rangle,\\ |-\\rangle', text: t`spin up and spin down along $z$ (also written $|{+z}\rangle$, $|{-z}\rangle$): the basis kets, $(1, 0)$ and $(0, 1)$ as columns` },
    { tex: '|{+n}\\rangle', text: t`the state with spin component $+\hbar/2$ along the unit vector $\hat n$` },
    { tex: '\\theta', text: t`the polar angle of $\hat n$ from the $+z$ axis, $0$ to $180^\circ$; the ket uses half of it` },
    { tex: '\\phi', text: t`the azimuth of $\hat n$ around $z$, measured from $+x$ toward $+y$` },
    { tex: 'e^{i\\phi}', text: t`a complex number of modulus 1: the relative phase between the two amplitudes` },
  ],
  why: 'Spin-½ is the simplest quantum system there is: a qubit, an MRI proton, an atomic-clock atom. Its two complex amplitudes carry everything that can be known about it.',
  visual: {
    type: 'calc-vectors3d',
    title: 'The Bloch sphere',
    lead: t`The gold arrow is the state $|{+n}\rangle$ for the angles you set. The readouts give its two amplitudes and, as a preview of the next lesson, the chance it would pass a $+x$, $+y$ or $+z$ analyser.`,
    tasks: [
      'Set θ = 90° and turn φ all the way round: |a| and |b| never change, yet the x and y readouts swing. That is the relative phase at work.',
      'Set θ = 180°: the arrow points to −z and the state is |−⟩. The ket turned through only 90° (θ/2) to get there.',
      'Find the state that is 50:50 for z and for x but certain for y.',
    ],
    params: {
      range: 1.4, yaw: 0.55, pitch: 0.32,
      sliders: [
        { key: 'th', label: 'Polar angle $\\theta$', min: 0, max: 180, step: 5, value: 60, unit: '^\\circ', explain: 'How far the spin direction tips from +z; the amplitudes are cos(θ/2) and sin(θ/2).' },
        { key: 'ph', label: 'Azimuth (relative phase) $\\phi$', min: 0, max: 355, step: 5, value: 100, unit: '^\\circ', explain: 'The phase of the down amplitude relative to the up amplitude.' },
      ],
      spheres: [{ centre: [0, 0, 0], radius: 1, color: 'ink3' }],
      points: [
        { at: [0, 0, 1], label: '+z', color: 'accent' }, { at: [0, 0, -1], label: '-z', color: 'accent' },
        { at: [1, 0, 0], label: '+x', color: 'warn' }, { at: [-1, 0, 0], label: '-x', color: 'warn' },
        { at: [0, 1, 0], label: '+y', color: 'good' }, { at: [0, -1, 0], label: '-y', color: 'good' },
      ],
      vectors: [{ to: ['sin(th*pi/180)*cos(ph*pi/180)', 'sin(th*pi/180)*sin(ph*pi/180)', 'cos(th*pi/180)'], color: 'gold', label: '|{+n}\\rangle' }],
      readouts: [
        { label: '$a = \\cos(\\theta/2)$', expr: 'cos(th*pi/360)', digits: 3 },
        { label: '$|b| = \\sin(\\theta/2)$', expr: 'sin(th*pi/360)', digits: 3 },
        { label: '$|\\langle{+z}|\\psi\\rangle|^2$', expr: 'cos(th*pi/360)^2', digits: 3 },
        { label: '$|\\langle{+x}|\\psi\\rangle|^2$', expr: '(1 + sin(th*pi/180)*cos(ph*pi/180))/2', digits: 3 },
        { label: '$|\\langle{+y}|\\psi\\rangle|^2$', expr: '(1 + sin(th*pi/180)*sin(ph*pi/180))/2', digits: 3 },
      ],
    },
    caption: t`The sphere is a map of states, not of space: the ket’s angles are half the arrow’s, so opposite points are orthogonal states. Drag to rotate.`,
  },
  example: {
    prompt: t`Use only Stern–Gerlach data to find the kets $|{\pm x}\rangle$ and $|{\pm y}\rangle$ in the $|\pm\rangle$ basis. The data: an atom prepared along any one of $x$, $y$, $z$ and measured along another goes + or − with probability $\tfrac12$ each.`,
    visual: blochPic({ states: [{ v: [1, 0, 0], label: '|{+x}\\rangle', color: 'warn' }, { v: [0, 1, 0], label: '|{+y}\\rangle', color: 'good' }], caption: t`The six states on the Bloch sphere. $+x$ and $+y$ are $90^\circ$ apart there, so their kets have overlap $\cos^2 45^\circ = \tfrac12$. Drag to rotate.` }),
    steps: [
      { label: 'Sizes from z data', text: t`$|\langle\pm|{+x}\rangle|^2 = \tfrac12$, so both amplitudes have size $\tfrac{1}{\sqrt2}$: $|{+x}\rangle = \tfrac{1}{\sqrt2}\big(|+\rangle + e^{i\alpha}|-\rangle\big)$. The first amplitude can be made real because an overall phase is free.` },
      { label: 'The partner', text: t`$|{-x}\rangle$ must be orthogonal to $|{+x}\rangle$ and also half-and-half in $z$: $|{-x}\rangle = \tfrac{1}{\sqrt2}\big(|+\rangle - e^{i\alpha}|-\rangle\big)$. Choosing $\alpha = 0$ fixes the convention: $|{\pm x}\rangle = \tfrac{1}{\sqrt2}\big(|+\rangle \pm |-\rangle\big)$.` },
      { label: 'Try the same for y', text: t`$|{+y}\rangle = \tfrac{1}{\sqrt2}\big(|+\rangle + e^{i\beta}|-\rangle\big)$. Now the x–y data: $|\langle{+x}|{+y}\rangle|^2 = \tfrac14|1 + e^{i\beta}|^2 = \tfrac{2 + 2\cos\beta}{4}$ must be $\tfrac12$.` },
      { label: 'Solve', text: t`$\cos\beta = 0$, so $\beta = \pm 90^\circ$ and $e^{i\beta} = \pm i$. Taking $+i$ for $+y$ (the right-handed choice): $|{\pm y}\rangle = \tfrac{1}{\sqrt2}\big(|+\rangle \pm i|-\rangle\big)$.` },
      { label: 'Why it matters', text: t`Only $\beta = \pm 90^\circ$ works, and $e^{\pm i90^\circ} = \pm i$ is not real. Three axes that are mutually “half-and-half” cannot be built from real vectors in two dimensions: **quantum amplitudes must be complex.**` },
    ],
    answer: t`$|{\pm x}\rangle = \tfrac{1}{\sqrt2}\big(|+\rangle \pm |-\rangle\big)$ and $|{\pm y}\rangle = \tfrac{1}{\sqrt2}\big(|+\rangle \pm i|-\rangle\big)$.`,
  },
  practice: [
    num({
      id: 'normalize', difficulty: 1,
      gen(r) {
        const p = r.int(1, 4), q = r.intExcept(1, 4, [p]), [ph, phTeX, phPlain] = r.pick(PHASE.slice(1));
        const ans = 1 / Math.hypot(p, q);
        const bz = cmul(cx(q), [Math.cos(ph * D), Math.sin(ph * D)]);
        return {
          prompt: t`Find the positive constant $N$ that normalizes $|\psi\rangle = N\big(${p}\,|+\rangle + ${q}\,${phTeX === '-' ? '(-1)' : phTeX}\,|-\rangle\big)$.`,
          visual: argand([{ title: 'up amplitude', arrows: [{ z: [p, 0.001], color: 'gold', label: String(p) }] }, { title: 'down amplitude', arrows: [{ z: bz, color: 'gold', label: `${q}·${phPlain}` }] }], { R: Math.max(p, q) + 0.4, caption: 'The two amplitudes before normalizing; the phase turns the down amplitude but does not change its length.' }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1 / (p + q), feedback: t`Lengths add as squares: $\langle\psi|\psi\rangle = N^2(${p}^2 + ${q}^2)$.` }, { value: 1 / (p * p + q * q), feedback: t`Take the square root: $N = 1/\sqrt{${p * p + q * q}}$.` }],
          hints: [t`$\langle\psi|\psi\rangle = N^2\big(|${p}|^2 + |${q}\,e^{i\phi}|^2\big) = 1$.`, t`A phase factor has modulus 1, so it drops out.`],
          teach: 'Normalizing uses the squared moduli of the amplitudes; phases never change a length.',
          explain: t`$N^2(${p * p} + ${q * q}) = 1$, so $N = 1/\sqrt{${p * p + q * q}} = ${fmt(ans, 4)}$. The phase $${phTeX === '-' ? '-1' : phTeX}$ has modulus 1 and drops out.`,
        };
      },
    }),
    num({
      id: 'bloch-theta', difficulty: 2,
      gen(r) {
        const key = r.pick([60, 90, 120, 74, 106]), [ph, phTeX] = r.pick(PHASE.slice(1, 4)), [ca, sa] = HALF[key];
        const th = THETA[key];
        const a = Math.cos((th * D) / 2), b = Math.sin((th * D) / 2);
        return {
          prompt: t`A spin is in the state $|\psi\rangle = ${ca}\,|+\rangle ${phTeX === '-' || phTeX === '-i' ? '-' : '+'} ${sa}\,${phTeX.replace('-', '')}\,|-\rangle$. At what polar angle $\theta$ from $+z$ does it point on the Bloch sphere, in degrees?`,
          visual: argand([{ title: 'up amplitude', circle: 1, arrows: [{ z: [a, 0.001], color: 'gold' }] }, { title: 'down amplitude', circle: 1, arrows: [{ z: [b * Math.cos(ph * D) + 0.001, b * Math.sin(ph * D)], color: 'gold' }] }], { R: 1.15, caption: 'The two amplitudes; the dotted circles have radius 1.' }),
          answer: th, units: 'deg', tol: { rel: 0, abs: 0.6 },
          errors: [{ value: th / 2, feedback: t`That is $\theta/2$. The amplitude is $\cos(\theta/2)$, so double the angle you found.` }],
          hints: [t`Match the up amplitude to $\cos(\theta/2)$.`, t`$\cos(\theta/2) = ${ca}$, so $\theta/2 = ${fmt(th / 2, 3)}^\circ$.`],
          teach: t`The Bloch angle is twice the angle in the amplitudes: $|a| = \cos(\theta/2)$.`,
          explain: t`$\cos(\theta/2) = ${nice(a, 4)}$ gives $\theta/2 = ${fmt(th / 2, 3)}^\circ$, so $\theta = ${fmt(th, 3)}^\circ$. The phase sets the azimuth, $\phi = ${ph}^\circ$, not $\theta$.`,
        };
      },
    }),
    mcq({
      id: 'global-phase', difficulty: 2,
      prompt: t`Are $|\psi\rangle$ and $e^{i\pi/3}|\psi\rangle$ different physical states?`,
      visual: blochPic({ states: [{ v: bv(70, 40), label: '|\\psi\\rangle,\\ e^{i\\pi/3}|\\psi\\rangle' }], caption: 'Both kets map to the same point of the Bloch sphere. Drag to rotate.' }),
      choices: [
        t`No: every probability $|\langle a|\psi\rangle|^2$ is the same for both, so no measurement can tell them apart`,
        t`Yes: they give different results for an $x$ measurement`,
        t`Yes: the phase rotates the spin by $60^\circ$ about $z$`,
        'Only if the state is a superposition of up and down',
      ],
      answer: 0,
      why: {
        1: t`An overall factor multiplies every amplitude by the same $e^{i\pi/3}$, whose modulus is 1: $|\langle{+x}|e^{i\pi/3}\psi\rangle|^2 = |\langle{+x}|\psi\rangle|^2$.`,
        2: t`A rotation about $z$ changes the *relative* phase of the two amplitudes. Here both get the same factor.`,
        3: 'Superposition or not, the common factor drops out of every squared modulus.',
      },
      hints: [t`Compute $|\langle a|e^{i\alpha}\psi\rangle|^2$ for any $|a\rangle$.`],
      teach: 'An overall phase multiplies every amplitude alike and cancels from every probability; it is not physical.',
      explain: t`$|\langle a|e^{i\pi/3}\psi\rangle|^2 = |e^{i\pi/3}|^2|\langle a|\psi\rangle|^2 = |\langle a|\psi\rangle|^2$ for every $|a\rangle$. A state is a ket up to an overall phase — a ray, not a single vector.`,
    }),
    mcq({
      id: 'relative-phase', difficulty: 2,
      prompt: t`The states $\tfrac{1}{\sqrt2}\big(|+\rangle + |-\rangle\big)$ and $\tfrac{1}{\sqrt2}\big(|+\rangle - |-\rangle\big)$ differ only in the sign of one amplitude. Which measurement tells them apart with certainty, one atom at a time?`,
      visual: blochPic({ states: [{ v: [1, 0, 0], label: '\\tfrac{1}{\\sqrt2}(|+\\rangle + |-\\rangle)', color: 'gold' }, { v: [-1, 0, 0], label: '\\tfrac{1}{\\sqrt2}(|+\\rangle - |-\\rangle)', color: 'violet' }], marks: false, caption: 'The two states on the Bloch sphere: opposite ends of a diameter. Drag to rotate.' }),
      choices: [t`$S_x$: the first always gives $+\hbar/2$, the second always $-\hbar/2$`, t`$S_z$: the first gives + and the second −`, 'None: a sign is an overall phase', t`$S_y$: the first gives + and the second −`],
      answer: 0,
      why: {
        1: t`Both are half up and half down along $z$: $|\pm\tfrac{1}{\sqrt2}|^2 = \tfrac12$. The sign is invisible to $S_z$.`,
        2: t`The minus sign sits on one term only, so it is a *relative* phase: $e^{i\pi}$ between the two amplitudes.`,
        3: t`Both have their Bloch vectors in the xz-plane, on the equator at $\pm x$: an $S_y$ measurement gives 50:50 for each.`,
      },
      hints: ['These are two kets you derived in the worked example.', t`$\tfrac{1}{\sqrt2}(|+\rangle \pm |-\rangle) = |{\pm x}\rangle$.`],
      teach: 'A relative phase is invisible to a measurement along z but decisive along other axes.',
      explain: t`They are $|{+x}\rangle$ and $|{-x}\rangle$: orthogonal states, perfectly distinguishable by an $x$ analyser, yet identical in their $z$ statistics.`,
    }),
    mcq({
      id: 'partner', difficulty: 3,
      prompt: t`Which ket is orthogonal to $|{+n}\rangle = \cos\tfrac{\theta}{2}|+\rangle + e^{i\phi}\sin\tfrac{\theta}{2}|-\rangle$ for every $\theta$ and $\phi$?`,
      visual: blochPic({ states: [{ v: bv(55, 35), label: '|{+n}\\rangle' }], points: [{ at: bv(125, 215).map(r6), label: '?', color: 'violet' }], caption: 'The partner state sits at the opposite end of the diameter (violet). Drag to rotate.' }),
      choices: [
        t`$\sin\tfrac{\theta}{2}|+\rangle - e^{i\phi}\cos\tfrac{\theta}{2}|-\rangle$`,
        t`$\cos\tfrac{\theta}{2}|+\rangle - e^{i\phi}\sin\tfrac{\theta}{2}|-\rangle$`,
        t`$\sin\tfrac{\theta}{2}|+\rangle + e^{i\phi}\cos\tfrac{\theta}{2}|-\rangle$`,
        t`$\cos\theta\,|+\rangle + e^{i\phi}\sin\theta\,|-\rangle$`,
      ],
      answer: 0,
      why: {
        1: t`Its overlap with $|{+n}\rangle$ is $\cos^2\tfrac{\theta}{2} - \sin^2\tfrac{\theta}{2} = \cos\theta$, zero only at $\theta = 90^\circ$. It is the point turned $180^\circ$ about the z-axis, not the opposite point.`,
        2: t`Its overlap is $2\sin\tfrac{\theta}{2}\cos\tfrac{\theta}{2} = \sin\theta$, zero only at the poles.`,
        3: t`Full angles make the state $|{+n'}\rangle$ for the direction at $2\theta$, not the opposite one: generally not orthogonal.`,
      },
      hints: [t`Compute $\langle{+n}|\chi\rangle$ for each candidate; the bra conjugates $e^{i\phi}$ to $e^{-i\phi}$.`, t`The opposite point on the sphere is $\theta \to 180^\circ - \theta$, $\phi \to \phi + 180^\circ$.`],
      teach: t`$|{-n}\rangle$, the state opposite $|{+n}\rangle$ on the Bloch sphere, is $\sin\tfrac{\theta}{2}|+\rangle - e^{i\phi}\cos\tfrac{\theta}{2}|-\rangle$.`,
      explain: t`$\langle{+n}|\chi\rangle = \cos\tfrac{\theta}{2}\sin\tfrac{\theta}{2} + e^{-i\phi}\sin\tfrac{\theta}{2}\cdot\big(-e^{i\phi}\cos\tfrac{\theta}{2}\big) = 0$. It is the − port’s state of the same analyser, $|{-n}\rangle$, up to an overall phase.`,
    }),
    num({
      id: 'amp-x', difficulty: 2,
      gen(r) {
        const key = r.pick([60, 120, 74, 106]), [ph, phTeX] = r.pick(PHASE.slice(1, 4)), [ca, sa] = HALF[key];
        const th = THETA[key], a = Math.cos((th * D) / 2), b = Math.sin((th * D) / 2);
        const amp = [S2 * (a + b * Math.cos(ph * D)), S2 * b * Math.sin(ph * D)], ans = Math.hypot(...amp);
        const sgn = phTeX === '-' || phTeX === '-i' ? '-' : '+';
        return {
          prompt: t`For $|\psi\rangle = ${ca}\,|+\rangle ${sgn} ${sa}\,${phTeX.replace('-', '')}\,|-\rangle$, find the size $|\langle{+x}|\psi\rangle|$ of its amplitude along $|{+x}\rangle = \tfrac{1}{\sqrt2}(|+\rangle + |-\rangle)$.`,
          visual: argand([{ title: '⟨+x|ψ⟩ as a sum', circle: 1, arrows: [{ z: [S2 * a, 0.001], color: 'accent', label: 'a/√2' }, { z: [S2 * b * Math.cos(ph * D) + 0.001, S2 * b * Math.sin(ph * D)], from: [S2 * a, 0], color: 'warn', label: 'b/√2', ldx: 6, ldy: -8 }] }], { R: 1.15, caption: 'The two terms of the amplitude, added tip to tail: the gap from the origin to the last tip is the answer. Dotted circle: radius 1.' }),
          answer: ans, tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: S2 * (a + b), feedback: 'You dropped the phase of the down amplitude: it turns the second arrow before the two are added.' }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`$\langle{+x}|\psi\rangle = \tfrac{1}{\sqrt2}(a + b)$, where $a$ and $b$ are the full (complex) amplitudes.`, t`Here $b = ${sa}\times ${phTeX === '-' ? '(-1)' : phTeX}$.`],
          teach: 'An amplitude along a new basis vector is a sum of complex terms, so the phases decide how big it is.',
          explain: t`$\langle{+x}|\psi\rangle = \tfrac{1}{\sqrt2}\big(${nice(a, 4)} + ${nice(b, 4)}\,e^{i${ph}^\circ}\big)$, of size $${fmt(ans, 3)}$. Its square, $${fmt(ans * ans, 3)}$, is the probability of + along $x$ — the next lesson’s rule.`,
        };
      },
    }),
    code({
      id: 'bloch-code', difficulty: 2,
      prompt: t`Write \`ket(theta, phi)\`, returning the NumPy complex array $\big(\cos\tfrac{\theta}{2},\ e^{i\phi}\sin\tfrac{\theta}{2}\big)$ for angles in **degrees**, and \`bloch(psi)\`, returning the Bloch vector $(x, y, z) = \big(2\operatorname{Re}(a^*b),\ 2\operatorname{Im}(a^*b),\ |a|^2 - |b|^2\big)$ of a state $(a, b)$ after normalizing it.`,
      starter: t`import numpy as np

def ket(theta, phi):
    pass

def bloch(psi):
    pass

print(bloch(ket(90, 90)))
`,
      answer: t`import numpy as np

def ket(theta, phi):
    th, ph = np.radians(theta), np.radians(phi)
    return np.array([np.cos(th / 2), np.exp(1j * ph) * np.sin(th / 2)])

def bloch(psi):
    a, b = psi / np.sqrt(np.sum(np.abs(psi) ** 2))
    ab = np.conj(a) * b
    return np.array([2 * ab.real, 2 * ab.imag, abs(a) ** 2 - abs(b) ** 2])

print(bloch(ket(90, 90)))`,
      tests: [
        { name: 'ket(90, 0) is |+x⟩ = (1, 1)/√2', code: 'np.allclose(ket(90, 0), np.array([1, 1]) / np.sqrt(2))' },
        { name: 'ket(90, 90) is |+y⟩ = (1, i)/√2', code: 'np.allclose(ket(90, 90), np.array([1, 1j]) / np.sqrt(2))' },
        { name: 'bloch(ket(θ, φ)) points along (sin θ cos φ, sin θ sin φ, cos θ)', code: 'np.allclose(bloch(ket(70, 130)), [np.sin(np.radians(70)) * np.cos(np.radians(130)), np.sin(np.radians(70)) * np.sin(np.radians(130)), np.cos(np.radians(70))])' },
        { name: 'an overall phase does not move the Bloch vector', code: 'np.allclose(bloch(np.exp(0.7j) * ket(40, 250)), bloch(ket(40, 250)))' },
        { name: 'bloch normalizes first: (3, 4i) points along +y-ish with length 1', code: 'abs(np.linalg.norm(bloch(np.array([3, 4j]))) - 1) < 1e-12' },
      ],
      hints: ['`np.radians` converts degrees; `np.exp(1j * ph)` is the phase factor.', 'Normalize with `psi / np.sqrt(np.sum(np.abs(psi)**2))`, then use `np.conj(a) * b`.'],
      teach: 'Two complex amplitudes, up to an overall phase, are two real angles: a point on the Bloch sphere.',
      explain: t`$a^*b = \cos\tfrac{\theta}{2}\sin\tfrac{\theta}{2}e^{i\phi} = \tfrac12\sin\theta\,e^{i\phi}$, so $2a^*b$ gives $x$ and $y$; $|a|^2 - |b|^2 = \cos\theta$ gives $z$. An overall phase cancels in $a^*b$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-phi', difficulty: 2,
      gen(r) {
        const A = r.pick(PHASORS.slice(0, 4)), B = r.pick(PHASORS.filter((p) => (p.deg - A.deg + 360) % 360 !== 0));
        const ans = (B.deg - A.deg + 360) % 360;
        return {
          prompt: t`A spin state is $|\psi\rangle \propto (${A.tex})\,|+\rangle + (${B.tex})\,|-\rangle$. What is its azimuth $\phi$ on the Bloch sphere, between $0^\circ$ and $360^\circ$?`,
          visual: argand([{ title: 'up amplitude', arrows: [{ z: A.z, color: 'gold' }] }, { title: 'down amplitude', arrows: [{ z: B.z, color: 'gold' }] }], { R: 1.6, caption: 'The two (unnormalized) amplitudes in their complex planes.' }),
          answer: ans, units: 'deg', tol: { rel: 0, abs: 1 },
          errors: [{ value: B.deg, feedback: t`That is the phase of the down amplitude alone. $\phi$ is the phase *relative to* the up amplitude, $${B.deg}^\circ - ${A.deg}^\circ$.` }].filter((e) => Math.abs(e.value - ans) > 2),
          hints: [t`Factor out the up amplitude’s phase as an overall phase.`, t`$\phi = \arg(b) - \arg(a)$.`],
          teach: 'The Bloch azimuth is the relative phase: the down amplitude’s phase minus the up amplitude’s.',
          explain: t`$\arg(${A.tex}) = ${A.deg}^\circ$ and $\arg(${B.tex}) = ${B.deg}^\circ$, so $\phi = ${ans}^\circ$. Multiplying the whole ket by $e^{-i\arg a}$ makes the up amplitude real without changing the state.`,
        };
      },
    }),
    mcq({
      id: 'cp-same', difficulty: 2,
      prompt: 'Which pair of kets describes the same physical state?',
      visual: blochPic({ caption: 'The Bloch sphere with the six axis states marked. Drag to rotate.' }),
      choices: [
        t`$\tfrac{1}{\sqrt2}(|+\rangle + i|-\rangle)$ and $\tfrac{1}{\sqrt2}(i|+\rangle - |-\rangle)$`,
        t`$\tfrac{1}{\sqrt2}(|+\rangle + i|-\rangle)$ and $\tfrac{1}{\sqrt2}(|+\rangle - i|-\rangle)$`,
        t`$\tfrac{1}{\sqrt2}(|+\rangle + |-\rangle)$ and $\tfrac{1}{\sqrt2}(|+\rangle + i|-\rangle)$`,
        t`$|+\rangle$ and $-|-\rangle$`,
      ],
      answer: 0,
      why: {
        1: t`These are $|{+y}\rangle$ and $|{-y}\rangle$: the relative phase differs by $180^\circ$. Orthogonal states.`,
        2: t`$|{+x}\rangle$ and $|{+y}\rangle$: the relative phases are $0$ and $90^\circ$, different points on the sphere.`,
        3: t`The minus sign is an overall phase here, but $|+\rangle$ and $|-\rangle$ are different (orthogonal) states to begin with.`,
      },
      teach: 'Two kets are the same state exactly when one is the other times a single phase factor.',
      hints: [t`Multiply the first ket of each pair by a phase and see whether you can get the second.`],
      explain: t`$i\cdot\tfrac{1}{\sqrt2}(|+\rangle + i|-\rangle) = \tfrac{1}{\sqrt2}(i|+\rangle - |-\rangle)$: one overall factor of $i$. Both are $|{+y}\rangle$.`,
    }),
    num({
      id: 'cp-mri', difficulty: 3, transfer: true,
      gen(r) {
        const B = r.pick([0.55, 1.5, 3, 7]);
        const f = GAMMA_P_HZ * B, tns = 1e9 / (4 * f);
        return {
          prompt: t`In an MRI scanner with field $B = ${B}$ T along $z$, a radio pulse leaves a proton’s spin in $|{+x}\rangle = \tfrac{1}{\sqrt2}(|+\rangle + |-\rangle)$. The field then winds the relative phase steadily: $\phi$ changes at the Larmor angular frequency $\omega = \gamma_p B$, with $\gamma_p/2\pi = ${fmt(GAMMA_P_HZ / 1e6, 8)}$ MHz/T for a free proton. How long, in nanoseconds, until the spin first lies along the $y$ axis (pointing to $+y$ or $-y$)?`,
          visual: blochPic({ states: [{ v: [1, 0, 0], label: '|{+x}\\rangle' }], extra: { curves: [{ param: ['cos(t)', 'sin(t)', '0'], t: [0, 6.2832], color: 'gold' }] }, caption: 'The spin starts at +x and precesses round the equator (gold); its relative phase is its longitude. Drag to rotate.' }),
          answer: tns, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: 1e9 / (4 * GAMMA_P_HZ * B * 2 * Math.PI), feedback: t`You divided by $2\pi$ twice: $\omega = 2\pi f$, and a quarter turn takes $\tfrac{\pi/2}{\omega} = \tfrac{1}{4f}$.` }, { value: 1e9 / (2 * f), feedback: t`That is half a turn, to $-x$. The $y$ axis is a quarter turn away.` }],
          hints: [t`The $y$ axis is $90^\circ$ of longitude from $+x$.`, t`$t = \dfrac{\pi/2}{\omega} = \dfrac{1}{4f}$ with $f = \gamma_p B/2\pi$.`],
          teach: 'Precession in a magnetic field is the relative phase of the two spin amplitudes winding at the Larmor frequency.',
          explain: t`$f = ${fmt(GAMMA_P_HZ / 1e6, 6)}\times${B} = ${fmt(f / 1e6, 4)}$ MHz, so a quarter turn takes $1/(4f) = ${fmt(tns, 3)}$ ns. The scanner’s coil picks up exactly this rotating magnetization. (Protons in tissue are shielded by their electrons by some tens of parts per million, too little to change these figures.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'McIntyre, Quantum Mechanics: A Paradigms Approach, §1.2–1.3 and §2.2', url: 'https://www.cambridge.org/9781009310611' },
    { label: 'Townsend, A Modern Approach to Quantum Mechanics, 2nd ed., ch. 1–2', url: 'https://uscibooks.aip.org/books/a-modern-approach-to-quantum-mechanics-2nd-edition/' },
    { label: 'CODATA 2022: proton gyromagnetic ratio (NIST)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?gammapbar' },
  ],
});
