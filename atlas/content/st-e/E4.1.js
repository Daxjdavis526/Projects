// Transforms, poles and stability: the Laplace transform as a Fourier
// transform of a damped, switched-on signal; its half-plane of convergence;
// inversion by the Bromwich integral and residues, so each pole p contributes
// e^(pt); BIBO stability ⇔ poles in the open left half-plane; when the
// Fourier transform (frequency response) exists; the final-value theorem's
// fine print; a feedback loop whose poles cross the axis.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { SRC, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;

// roots of s³ + a s² + b s + c (Durand–Kerner), as [re, im] pairs
function roots3(a, b, c) {
  const P = (z) => { const [x, y] = z; const z2 = [x * x - y * y, 2 * x * y], z3 = [z2[0] * x - z2[1] * y, z2[0] * y + z2[1] * x]; return [z3[0] + a * z2[0] + b * x + c, z3[1] + a * z2[1] + b * y]; };
  const mul = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]];
  const div = (p, q) => { const d = q[0] * q[0] + q[1] * q[1]; return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d]; };
  let z = [[0.4, 0.9], [-0.65, 0.72], [-0.4, -0.95]];
  for (let it = 0; it < 500; it++) z = z.map((zi, i) => { let den = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = mul(den, [zi[0] - zj[0], zi[1] - zj[1]]); }); const d = div(P(zi), den); return [zi[0] - d[0], zi[1] - d[1]]; });
  return z.map(([x, y]) => [Math.abs(x) < 1e-12 ? 0 : x, Math.abs(y) < 1e-12 ? 0 : y]).sort((p, q) => p[0] - q[0]);
}
// closed-loop poles of K/(s(s+1)(s+2)) under unity feedback, as de-poles pole specs
const loopPoles = (K) => {
  const z = roots3(3, 2, K), real = z.filter((p) => p[1] === 0), cx = z.filter((p) => p[1] > 0);
  return [...real.map((p) => ({ re: +p[0].toFixed(4) })), ...cx.map((p) => ({ re: +p[0].toFixed(4), im: +p[1].toFixed(4) }))];
};
const P2 = roots3(3, 2, 2);

export default lesson({
  id: 'st-e.E4.1',
  title: 'Transforms, poles and stability',
  minutes: 16, difficulty: 3,
  intro: t`The Laplace transform is a Fourier transform with a safety net. Multiply a signal that starts at $t = 0$ by $e^{-\sigma t}$ and Fourier-transform it: that is $F(s)$ at $s = \sigma + i\omega$. The damping makes it converge for growing signals too, in a **half-plane** $\operatorname{Re}s > \sigma_c$. Inverting is a Fourier inversion along a vertical line in that half-plane (the Bromwich integral); close the line to the left and the residue theorem turns it into a sum over the poles of $F$:

$$F(s) = \int_0^\infty f(t)\,e^{-st}\,dt, \qquad f(t) = \sum_{\text{poles } p}\operatorname{Res}_{s = p}\big[F(s)\,e^{st}\big]$$

Each simple pole $p$ contributes a term $\propto e^{pt}$. So **where the poles sit decides everything**: left of the imaginary axis, the term dies; right, it grows; on it, it persists. A linear system with a rational transfer function $H(s)$ is bounded-input bounded-output (**BIBO**) **stable** exactly when every pole has $\operatorname{Re}p < 0$ — and then, and only then, its frequency response $H(i\omega)$ is the Fourier transform of its impulse response. ([MATH 2280](#/lesson/math2280.DE-6.5) uses the transform to solve equations; here the subject is what the poles mean.)`,
  symbols: [
    { tex: 'F(s)', text: 'the Laplace transform of $f$, a function of the complex frequency $s$' },
    { tex: 's = \\sigma + i\\omega', text: 'complex frequency: $\\sigma$ (s⁻¹) is a growth or decay rate, $\\omega$ (rad/s) an angular frequency' },
    { tex: 'p', text: 'a pole of $F$: a point where $F$ blows up; it contributes $e^{pt} = e^{\\operatorname{Re}p\\,t}e^{i\\operatorname{Im}p\\,t}$' },
    { tex: '\\operatorname{Res}_{s=p}', text: 'the residue at $p$ (for a simple pole, $\\lim_{s\\to p}(s - p)F(s)e^{st}$)' },
    { tex: 'f(t)', text: 'a signal that is zero for $t < 0$ (causal)' },
  ],
  why: t`A thrust-vector-control loop, a launch vehicle’s attitude autopilot and a black hole’s ringdown are all read off pole positions: the real part is the growth rate, the imaginary part the frequency.`,
  visual: {
    type: 'de-poles',
    title: 'A feedback loop’s poles crossing the axis',
    lead: t`A gimbal servo $G(s) = \frac{1}{s(s + 1)(s + 2)}$ under proportional feedback of gain $K$ has closed-loop poles at the roots of $s^3 + 3s^2 + 2s + K$. Step through the gains; drag a pole to explore further.`,
    tasks: [
      'K = 0.3: three real poles on the left, a sluggish, non-oscillating step response.',
      'K = 2 and 4: a complex pair creeps toward the axis; the step response rings longer.',
      'K = 6: the pair sits on the axis and the oscillation never dies; K = 8: it crosses and grows.',
    ],
    params: {
      presets: [0.3, 2, 4, 6, 8].map((K) => ({ label: `$K = ${K}$`, poles: loopPoles(K) })),
      response: 'step', terms: 'toggle', panels: ['s', 't', 'f'], T: 20, wmax: 3, w: 1, window: { re: [-3.6, 0.8], im: [-2, 2] },
    },
    caption: 'Exact responses from the partial-fraction expansion; the gain is normalized so H(0) = 1, which is true of this closed loop. Linear model: a real gimbal also saturates and has delays.',
  },
  example: {
    prompt: t`For the loop above, closed-loop $H(s) = \dfrac{K}{s^3 + 3s^2 + 2s + K}$: find the poles at $K = 2$, and the gain $K$ at which the loop becomes unstable, with the frequency of the oscillation at the boundary.`,
    visual: { type: 'de-poles', params: { poles: loopPoles(2), response: 'step', panels: ['s', 't'], drag: false, T: 20, window: { re: [-3.6, 0.8], im: [-2, 2] }, readout: false }, caption: 'K = 2: one real pole and a complex pair, with the step response they produce.' },
    steps: [
      { label: 'Poles at K = 2', text: t`The roots of $s^3 + 3s^2 + 2s + 2$ are $s = ${r4(P2[0][0])}$ and $s = ${r4(P2[1][0])} \pm ${r4(Math.abs(P2[1][1]))}i$. All have $\operatorname{Re}s < 0$: stable. The slow pair dominates — a ringing at $${r3(Math.abs(P2[1][1]))}$ rad/s decaying as $e^{${r3(P2[1][0])}t}$.` },
      { label: 'Boundary', text: t`Instability starts when a pole reaches the axis, $s = i\omega$: $\;-i\omega^3 - 3\omega^2 + 2i\omega + K = 0$.` },
      { label: 'Real and imaginary', text: t`Imaginary part: $\omega(2 - \omega^2) = 0$, so $\omega = \sqrt2$. Real part: $K = 3\omega^2 = 6$.` },
      { label: 'Read it off', text: t`For $0 < K < 6$ all poles are on the left (Routh–Hurwitz for a cubic $s^3 + as^2 + bs + c$: stable iff $a, b, c > 0$ and $ab > c$; here $3\times2 > K$). At $K = 6$ the loop oscillates at $\sqrt2 = ${r4(Math.SQRT2)}$ rad/s; beyond, it diverges.` },
      { label: 'Sense check', text: t`More gain means a faster but more oscillatory response — until the oscillation stops decaying. The phase lag of the three factors is what makes high gain dangerous.` },
    ],
    answer: t`At $K = 2$: $${r4(P2[0][0])}$ and $${r4(P2[1][0])} \pm ${r4(Math.abs(P2[1][1]))}i$ (stable). The loop goes unstable at $K = 6$, oscillating at $\omega = \sqrt2 \approx ${r4(Math.SQRT2)}$ rad/s.`,
  },
  practice: [
    num({
      id: 'roc', difficulty: 2,
      gen(r) {
        const a = r.pick([-3, -1, 0.5, 2]), b = r.pick([2, 4]);
        const ans = Math.max(-b, a);
        return {
          prompt: t`$f(t) = 3e^{-${b}t} + e^{${a}t}\cos 5t$ for $t \ge 0$. Its Laplace transform converges for $\operatorname{Re}s > \sigma_c$. What is $\sigma_c$, in s⁻¹?`,
          visual: { type: 'graph', params: { x: [-5, 3], y: [-6, 6], aspect: 'wide', equal: true, xlabel: 'Re s (s⁻¹)', ylabel: 'Im s (rad/s)', axesAt: 'edge', points: [{ x: -b, y: 0, color: 'bad', label: 'pole' }, { x: a, y: 5, color: 'bad' }, { x: a, y: -5, color: 'bad' }] }, caption: 'The poles of F(s) in the complex s-plane.' },
          answer: ans, units: 's^-1', tol: { rel: 0, abs: 0.01 },
          errors: [{ value: Math.min(-b, a), feedback: 'The transform must converge for every term, so the slowest-decaying (or fastest-growing) term decides: the largest real part.' }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: [t`$\int_0^\infty e^{(\alpha - s)t}dt$ converges when $\operatorname{Re}s > \alpha$.`, t`The poles are at $-${b}$ and $${a} \pm 5i$; the region is to the right of all of them.`],
          teach: 'A Laplace transform converges to the right of its rightmost pole.',
          explain: t`$\sigma_c = \max(-${b}, ${a}) = ${ans}$ s⁻¹: the half-plane lies right of the rightmost pole. ${ans < 0 ? t`It contains the imaginary axis, so $f$ also has a Fourier transform, $F(i\omega)$.` : t`It does not contain the imaginary axis: $F(i\omega)$ is **not** a Fourier transform of $f$.`}`,
        };
      },
    }),
    mcq({
      id: 'axis-poles', difficulty: 3,
      prompt: t`A lightly built structure has $H(s) = \dfrac{4}{s^2 + 4}$ (no damping). Its impulse response $2\sin 2t$ stays bounded. Is the system BIBO stable?`,
      visual: { type: 'de-poles', params: { poles: [{ re: 0, im: 2 }], response: 'impulse', panels: ['s', 't'], drag: false, T: 15, window: { re: [-2.5, 1], im: [-2.6, 2.6] }, readout: false }, caption: 'Poles at ±2i, on the axis, and the impulse response.' },
      choices: [t`No: the bounded input $\sin 2t$ produces $\propto t\cos2t$, which grows without bound`, 'Yes: a bounded impulse response means a stable system', t`Yes: the poles are not in the right half-plane`, 'No: every undamped system has poles on the right'],
      answer: 0,
      why: {
        1: t`BIBO needs $\int|h|\,dt < \infty$; $|2\sin2t|$ is bounded but not integrable.`,
        2: t`Poles on the axis are not enough: stability needs the **open** left half-plane.`,
        3: t`They are exactly on the axis, at $\pm2i$, not on the right.`,
      },
      hints: ['Try driving it at its own frequency.', t`$Y = H(s)\cdot\frac{2}{s^2 + 4}$ has a **double** pole at $\pm2i$: residues of double poles bring a factor $t$.`],
      teach: 'Poles on the imaginary axis make a system marginal, not stable: a bounded input at that frequency gives an unbounded output (resonance).',
      explain: t`With input $\sin2t$, $Y(s) = \frac{8}{(s^2 + 4)^2}$, whose double poles give $y = \tfrac12\sin2t - t\cos2t$: unbounded. BIBO stability is equivalent to $\int_0^\infty|h|\,dt < \infty$, which for a rational $H$ means every pole has $\operatorname{Re}p < 0$.`,
    }),
    mcq({
      id: 'fourier-exists', difficulty: 3,
      prompt: t`$f(t) = e^{t}$ for $t \ge 0$ (and $0$ before) has $F(s) = \dfrac{1}{s - 1}$. A student sets $s = i\omega$ and calls $\dfrac{1}{i\omega - 1}$ “the Fourier transform of $f$”. What is wrong?`,
      visual: { type: 'graph', params: { x: [-3, 3], y: [-2, 2], aspect: 'wide', equal: true, xlabel: 'Re s', ylabel: 'Im s', axesAt: 'edge', shade: [{ fn: '2', lower: '-2', from: 1, to: 3, color: 'good', alpha: 0.18 }], points: [{ x: 1, y: 0, color: 'bad', label: 'pole' }], vlines: [{ x: 0, label: 'iω axis' }] }, caption: 'The pole at s = 1 and the region of convergence Re s > 1 (shaded).' },
      choices: [t`The imaginary axis lies outside the region of convergence: $f$ has no Fourier transform, and $\frac{1}{i\omega - 1}$ is the transform of a different signal, $-e^{t}$ for $t < 0$`, 'Nothing: the Fourier transform is always the Laplace transform on the imaginary axis', 'Only the sign: the Fourier transform is 1/(iω + 1)', t`The 2π is missing`],
      answer: 0,
      why: {
        1: 'Only when the region of convergence contains the imaginary axis — for this f it does not.',
        2: t`$\frac1{i\omega + 1}$ is the transform of $e^{-t}$ for $t \ge 0$, a different (decaying) signal.`,
        3: 'The 2π sits in the inverse transform; it is not the problem here.',
      },
      hints: [t`Does $\int_0^\infty e^{t}e^{-i\omega t}dt$ converge?`, t`Which signal has Fourier transform $\frac1{i\omega - 1}$? Try $-e^{t}$ on $t < 0$.`],
      teach: 'F(iω) is the Fourier transform of f only when the region of convergence contains the imaginary axis — for a system, only when it is stable.',
      explain: t`$\int_0^\infty e^{(1 - i\omega)t}dt$ diverges, so a growing $f$ has no Fourier transform. The same formula $\frac{1}{i\omega - 1}$ belongs to the **anti-causal** signal $-e^{t}$, $t < 0$: an expression for a transform means nothing without its region of convergence — the same lesson as the contour closed above or below in [causality and Kramers–Kronig](#/lesson/st-d.D11.1).`,
    }),
    num({
      id: 'routh', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 4, 5, 6]), b = r.pick([3, 5, 8, 10]);
        return {
          prompt: t`An attitude-control loop has closed-loop characteristic polynomial $s^3 + ${a}s^2 + ${b}s + K$. Above what gain $K$ is it unstable?`,
          visual: { type: 'graph', params: { x: [-a - 1.5, 1.5], y: [-Math.sqrt(b) - 1.5, Math.sqrt(b) + 1.5], aspect: 'wide', equal: true, xlabel: 'Re s', ylabel: 'Im s', axesAt: 'edge', shade: [{ fn: `${Math.sqrt(b) + 1.5}`, lower: `${-Math.sqrt(b) - 1.5}`, from: 0, to: 1.5, color: 'bad', alpha: 0.12 }], vlines: [{ x: 0 }] }, caption: 'The s-plane: poles must stay out of the shaded right half-plane.' },
          answer: a * b, tol: { rel: 0.005 },
          errors: [{ value: b, feedback: t`At the boundary $s = i\omega$: the imaginary part gives $\omega^2 = ${b}$, and the real part $K = ${a}\omega^2$.` }],
          hints: [t`Put $s = i\omega$ and set real and imaginary parts to zero.`, t`Imaginary: $\omega(${b} - \omega^2) = 0$; real: $K - ${a}\omega^2 = 0$.`],
          teach: 'A pole crosses the imaginary axis where P(iω) = 0: split into real and imaginary parts.',
          explain: t`$\omega^2 = ${b}$ and $K = ${a}\times${b} = ${a * b}$. Below it all poles are on the left (Routh–Hurwitz: $${a}\times${b} > K$); at it, a pair sits at $\pm i\sqrt{${b}} = \pm${r3(Math.sqrt(b))}i$ and the loop oscillates.`,
        };
      },
    }),
    expr({
      id: 'residues', difficulty: 3,
      prompt: t`Invert $F(s) = \dfrac{s}{(s + 1)^2 + 4}$ by summing the residues of $F(s)e^{st}$ at its poles $-1 \pm 2i$.`,
      visual: { type: 'de-poles', params: { poles: [{ re: -1, im: 2 }], response: 'impulse', panels: ['s'], drag: false, window: { re: [-3, 1], im: [-2.6, 2.6] }, readout: false }, caption: 'The two poles of F, at −1 ± 2i.' },
      answer: 'e^(-t)*(cos(2t) - sin(2t)/2)', answerTeX: t`e^{-t}\big(\cos2t - \tfrac12\sin2t\big)`,
      vars: { t: [0, 5] },
      errors: [{ answer: 'e^(-t)*cos(2t)', feedback: t`Close: the numerator is $s = (s + 1) - 1$, and the $-1$ adds $-\tfrac12e^{-t}\sin2t$.` }, { answer: 'e^(-t)*(cos(2t) + sin(2t)/2)', feedback: 'Check the sign of the sine term: s = (s + 1) − 1.' }],
      hints: [t`At the simple pole $p = -1 + 2i$: $\operatorname{Res} = \dfrac{p\,e^{pt}}{p - \bar p} = \dfrac{(-1 + 2i)e^{(-1 + 2i)t}}{4i}$.`, t`The other residue is its complex conjugate, so the sum is twice the real part.`],
      teach: 'A conjugate pair of poles gives twice the real part of one residue: a damped sinusoid.',
      explain: t`$2\operatorname{Re}\Big[\frac{(-1 + 2i)}{4i}e^{-t}e^{2it}\Big] = e^{-t}\big(\cos2t - \tfrac12\sin2t\big)$. The real part of the poles, $-1$, is the decay rate; the imaginary part, $2$, the angular frequency.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ringdown', difficulty: 2, transfer: true,
      gen(r) {
        const f = r.pick([120, 250, 300, 550]), tau = r.pick([2, 4, 6]);
        const ans = -1000 / tau;
        return {
          prompt: t`A black hole formed in a merger rings down as $h(t) = e^{-t/\tau}\cos(2\pi f t)$ for $t \ge 0$, with $f = ${f}$ Hz and $\tau = ${tau}$ ms. Its Laplace transform has a pair of poles. What is their real part, in s⁻¹?`,
          visual: { type: 'graph', params: { x: [0, 5 * tau], y: [-1.1, 1.1], aspect: 'wide', xlabel: 't (ms)', ylabel: 'h', axesAt: 'edge', curves: [{ fn: `e^(-x/${tau})*cos(2*pi*${f}*x/1000)`, color: 'accent', width: 1.8, samples: 1500 }, { fn: `e^(-x/${tau})`, color: 'ink3', width: 1.2, dash: [5, 4] }] }, caption: 'The ringdown and its decaying envelope (one mode; a real ringdown is a sum of such modes).' },
          answer: ans, units: 's^-1', tol: { rel: 0.005 },
          errors: [{ value: 2 * PI * f, feedback: 'That is the imaginary part (the angular frequency). The real part is the decay rate.' }, { value: 1000 / tau, feedback: 'A decaying mode has its pole on the left: the real part is negative.' }],
          hints: [t`$\mathcal{L}\{e^{-t/\tau}\cos\omega t\} = \dfrac{s + 1/\tau}{(s + 1/\tau)^2 + \omega^2}$.`, t`The poles are at $s = -1/\tau \pm i\omega$.`],
          teach: 'A damped oscillation is a conjugate pair of poles: real part −1/τ, imaginary part ±ω.',
          explain: t`The poles are at $-1/\tau \pm 2\pi fi = ${r4(ans)} \pm ${r4(2 * PI * f)}i$ s⁻¹. Black-hole quasinormal modes are exactly such poles in the complex frequency plane; their positions encode the hole’s mass and spin ([quasinormal modes](#/lesson/st-d.D11.2)).`,
        };
      },
    }),
    mcq({
      id: 'cp-fvt', difficulty: 3,
      prompt: t`The final-value theorem says $\lim_{t\to\infty}f(t) = \lim_{s\to0}sF(s)$. For $F(s) = \dfrac{1}{s(s - 1)}$ it gives $-1$. What does $f(t)$ actually do?`,
      visual: { type: 'graph', params: { x: [-2, 2], y: [-1.5, 1.5], aspect: 'wide', equal: true, xlabel: 'Re s', ylabel: 'Im s', axesAt: 'edge', points: [{ x: 0, y: 0, color: 'bad', label: 'pole' }, { x: 1, y: 0, color: 'bad', label: 'pole' }] }, caption: 'The poles of F(s): at 0 and at +1.' },
      choices: [t`It grows without bound, $f = e^{t} - 1$: the theorem only applies when every pole of $sF(s)$ is in the open left half-plane`, t`It settles at $-1$, as the theorem says`, t`It oscillates forever`, t`It settles at $0$`],
      answer: 0,
      why: {
        1: 'The theorem’s hypothesis fails: sF(s) = 1/(s − 1) has a pole at +1, so the limit it computes is meaningless.',
        2: 'Oscillation would need poles off the real axis.',
        3: 'The pole at +1 forbids any finite limit.',
      },
      hints: ['Invert F by partial fractions or residues.', t`$\frac{1}{s(s - 1)} = \frac{1}{s - 1} - \frac1s$.`],
      teach: 'Check the poles before using the final-value theorem: a pole on or right of the axis (other than a simple one at 0 in F) voids it.',
      explain: t`$f = e^{t} - 1 \to \infty$. The final-value theorem needs $f$ to have a limit, which holds when all poles of $sF(s)$ lie in the open left half-plane; here $sF = \frac{1}{s - 1}$ has a pole at $+1$. The formula still returns a number — a wrong one.`,
    }),
  ],
  sources: [SRC.rhb, SRC.boas],
});
