// From a chain to a string: beads of mass m = μa on a string of tension T are
// a chain with k = T/a; Taylor-expanding the second difference and letting
// a → 0 at fixed μ and T gives μ y_tt = T y_xx. The chain's dispersion
// relation (2v/a) sin(qa/2) tends to vq, and the error, about (qa)²/24, says
// when the continuum picture fails: wavelengths of a few spacings.
import { lesson, mcq, num, order } from '../../src/core/content.js';
import { tn, chainPic, curvesPic } from './_wv.js';

const t = String.raw;
const sinc = (u) => Math.sin(u) / u;
// the u > 0 with sin u / u = r (0 < r < 1), by bisection
function sincInv(r) { let lo = 1e-9, hi = Math.PI; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (sinc(m) > r) lo = m; else hi = m; } return (lo + hi) / 2; }

// the worked example: a 2 km tether carrying 19 instrument beads
const EX = (() => {
  const L = 2000, N = 19, m = 5, T = 200, a = L / (N + 1), mu = m / a, v = Math.sqrt(T / mu), k = T / a, w0 = Math.sqrt(k / m);
  const chain = (n) => 2 * w0 * Math.sin((n * Math.PI) / (2 * (N + 1))), str = (n) => (n * Math.PI * v) / L;
  return { L, N, m, T, a, mu, v, k, w0, c1: chain(1), s1: str(1), c10: chain(10), s10: str(10) };
})();

export default lesson({
  id: 'phys3750.W4.1',
  title: 'From a chain to a string',
  minutes: 15, difficulty: 3,
  intro: t`A string is a chain whose beads are too close together to tell apart. Give each bead mass $m = \mu a$ and the string tension $T$, so the effective spring is $k = T/a$. Treat the bead displacements as samples of one smooth curve, $y_j(t) = y(ja, t)$, and Taylor-expand: the second difference $y_{j+1} - 2y_j + y_{j-1}$ becomes $a^2\,\partial^2y/\partial x^2$. Divide by $a$ and let $a \to 0$ with $\mu$ and $T$ fixed:

$$\mu\,\frac{\partial^2 y}{\partial t^2} = T\,\frac{\partial^2 y}{\partial x^2}$$

— the wave equation, with speed $v = \sqrt{T/\mu}$. The chain’s dispersion relation agrees: $\omega = (2v/a)\sin(qa/2) \to vq$. The limit is good while the wavelength spans many beads; when it shrinks to a few spacings, the beads show. [The PDE course](#/lesson/st-b.B3.1) derives the same equation from the forces on a piece of string.`,
  symbols: [
    { tex: 'y(x, t)', text: 'the sideways displacement of the string at position $x$ and time $t$, in m' },
    { tex: '\\mu = m/a', text: 'the linear mass density, in kg/m: bead mass per spacing' },
    { tex: 'T = ka', text: 'the tension, in N (for beads on a string, the spring constant is $k = T/a$)' },
    { tex: 'a', text: 'the bead spacing, in m, which goes to zero in the limit' },
    { tex: 'v = \\sqrt{T/\\mu}', text: 'the wave speed, in m/s — the same as the chain’s long-wave speed $a\\sqrt{k/m}$' },
    { tex: '\\partial^2y/\\partial x^2', text: 'the curvature of the string: where it bends, it accelerates' },
  ],
  why: t`Every continuous medium — a rod, air, a crystal at long wavelengths, spacetime itself in gravitational waves — is described by a field obeying a wave equation that hides discreteness below some scale.`,
  visual: {
    type: 'wv-chain',
    title: 'When is a chain a string?',
    lead: t`A pulse launched to the right along a chain of beads. Its width is measured in bead spacings. Wide pulses travel like pulses on a string; narrow ones feel the beads.`,
    tasks: ['Set the width to 4 or more spacings: the pulse keeps its shape, reflects inverted from the wall and comes back.', 'Narrow it to 1 spacing: ripples trail behind — short waves on a chain are slower (the dots below the dashed line).', t`Switch to one mode with $n = 2$ and raise $N$: the ratio $\omega_n/vq_n$ in the readout climbs toward 1.`],
    params: { N: 40, maxN: 60, start: 'pulse', width: 3, controls: ['start', 'width', 'N', 'n'], readouts: ['N', 'n', 'omega', 'vq', 'ratio', 'v'] },
  },
  example: {
    prompt: t`A 2.0 km tether, its own mass negligible, carries ${EX.N} instrument beads of ${EX.m} kg, evenly spaced, between two fixed ends, at tension ${EX.T} N. Treat it as a continuous string: what are $\mu$ and $v$? Then compare the chain’s exact frequencies with the string’s for modes 1 and 10.`,
    steps: [
      { label: 'Spacing and density', text: t`${EX.N} beads divide the tether into ${EX.N + 1} gaps: $a = ${EX.a}$ m. Smeared out, $\mu = m/a = ${EX.m}/${EX.a} = ${tn(EX.mu)}$ kg/m.` },
      { label: 'Wave speed', text: t`$v = \sqrt{T/\mu} = \sqrt{${EX.T}/${tn(EX.mu)}} = ${tn(EX.v)}$ m/s — the same as the chain’s $a\sqrt{k/m}$ with $k = T/a = ${EX.k}$ N/m.` },
      { label: 'Taylor step', text: t`Why it works: $y(x \pm a) = y \pm ay' + \tfrac{a^2}{2}y'' \pm \tfrac{a^3}{6}y''' + \tfrac{a^4}{24}y'''' + \ldots$, so $y_{j+1} - 2y_j + y_{j-1} = a^2y'' + \tfrac{a^4}{12}y'''' + \ldots$ — the odd terms cancel. The first correction is down by $a^2$.` },
      { label: 'Mode 1', text: t`Chain: $\omega_1 = 2\sqrt{k/m}\,\sin\frac{\pi}{40} = ${tn(EX.c1, 4)}$ rad/s. String: $\omega_1 = \pi v/L = ${tn(EX.s1, 4)}$ rad/s. They agree to $${tn((1 - EX.c1 / EX.s1) * 100, 2)}\%$.` },
      { label: 'Mode 10', text: t`Chain: $2\sqrt{k/m}\,\sin\frac{10\pi}{40} = ${tn(EX.c10)}$ rad/s; string: $10\pi v/L = ${tn(EX.s10)}$ rad/s. Now the chain is $${tn((1 - EX.c10 / EX.s10) * 100, 2)}\%$ slower: mode 10 has a wavelength of only 4 spacings.` },
    ],
    answer: t`$\mu = ${tn(EX.mu)}$ kg/m and $v = ${tn(EX.v)}$ m/s. The string model is excellent for the fundamental (wavelength 40 spacings) and 10% off for mode 10 (wavelength 4 spacings).`,
    visual: chainPic({ N: EX.N, start: 'mode', n: 10, k: EX.k, m: EX.m, a: EX.a, panels: ['chain', 'disp'] }, t`Mode 10 of the beaded tether, and every mode on the chain’s dispersion curve: mode 10 (gold) sits well below the string’s line $\omega = vq$.`),
  },
  practice: [
    order({
      id: 'derive', difficulty: 2,
      prompt: 'Put the steps from the chain to the wave equation in order.',
      visual: chainPic({ N: 14, start: 'mode', n: 2 }, 'Fourteen beads on a string in mode 2: already close to a smooth curve (dashed).'),
      items: [
        t`Each bead: $m\ddot y_j = k(y_{j+1} - 2y_j + y_{j-1})$`,
        t`Write $m = \mu a$ and $k = T/a$`,
        t`Let a smooth $y(x, t)$ pass through every bead`,
        t`Taylor: $y_{j+1} - 2y_j + y_{j-1} \approx a^2\,y_{xx}$`,
        t`Divide by $a$; let $a \to 0$: $\mu\,y_{tt} = T\,y_{xx}$`,
      ],
      hints: ['Start from Newton for one bead and end with a partial differential equation.', 'You need a smooth function before you can Taylor-expand it.'],
      teach: 'Discrete Newton → continuum variables → smooth interpolation → Taylor → limit.',
      explain: t`The bead equation becomes $\mu a\,y_{tt} = (T/a)\,a^2y_{xx}$; one factor of $a$ cancels on each side and the limit leaves $\mu\,y_{tt} = T\,y_{xx}$.`,
    }),
    num({
      id: 'fundamental-gap', difficulty: 2,
      gen(r) {
        const N = r.pick([3, 4, 5, 7, 9]), u = Math.PI / (2 * (N + 1)), pct = (1 - sinc(u)) * 100;
        return {
          prompt: t`A string carrying $N = ${N}$ equal beads (its own mass negligible) between fixed ends is compared with a uniform string of the same total mass, length and tension. By what percentage is the beaded string’s fundamental frequency **lower**?`,
          visual: chainPic({ N, start: 'mode', n: 1 }, `The fundamental of ${N} beads (solid) and the smooth string shape it samples (dashed).`),
          answer: pct, units: '', tol: { rel: 0.02 },
          errors: [{ value: (1 - sinc(Math.PI / (2 * N))) * 100, feedback: t`The beads divide the string into $N + 1$ gaps: $q_1a = \pi/(N + 1)$.` }],
          hints: [t`Chain: $\omega_1 = (2v/a)\sin\frac{q_1a}{2}$. String: $\omega_1 = vq_1$. Same $v$, same $q_1 = \pi/L$.`, t`Ratio $= \sin u/u$ with $u = \frac{\pi}{2(N + 1)}$; the shortfall is $(1 - \sin u/u) \times 100\%$.`],
          teach: t`The chain’s mode sits below the string’s by the factor $\sin u/u$, $u = q a/2$.`,
          explain: t`$u = \pi/${2 * (N + 1)} = ${tn(u, 4)}$, $\sin u/u = ${tn(sinc(u), 5)}$: the beaded string is $${tn(pct, 3)}\%$ lower. Even ${N} beads make a decent string for the fundamental.`,
        };
      },
    }),
    num({
      id: 'beads-needed', difficulty: 3,
      gen(r) {
        const n = r.pick([1, 2, 3]), eps = r.pick([0.01, 0.005, 0.001]);
        let N = 1;
        while (1 - sinc((n * Math.PI) / (2 * (N + 1))) > eps) N++;
        return {
          prompt: t`How many equal beads $N$ (at least) must a beaded string have so that its mode $n = ${n}$ is within $${tn(eps * 100, 1)}\%$ of the continuous string’s frequency?`,
          visual: curvesPic([{ fn: 'sin(x)/x', color: 'accent', domain: [0.02, 1.6], label: 'sin u / u', labelAt: 1.2, labelDy: -10 }], [0, 1.6], [0.6, 1.05], t`$\omega_{\text{chain}}/\omega_{\text{string}} = \sin u/u$ against $u = q_na/2$.`, { xlabel: 'u', ylabel: 'ratio', hlines: [{ y: 1 - eps, label: `${+(100 - eps * 100).toFixed(1)}%`, color: 'gold' }] }),
          answer: N, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: N - 1, feedback: t`One short: check that with this many beads $1 - \sin u/u$ still exceeds $${tn(eps, 1)}$.` }],
          hints: [t`$1 - \sin u/u \approx u^2/6$ for small $u$, with $u = \frac{n\pi}{2(N + 1)}$.`, t`Need $u^2/6 \le ${tn(eps, 1)}$, i.e. $u \le ${tn(Math.sqrt(6 * eps), 3)}$; solve for $N$ and round up, then check exactly.`],
          teach: t`The continuum error falls as $1/N^2$: $1 - \sin u/u \approx \frac16\big(\frac{n\pi}{2(N + 1)}\big)^2$.`,
          explain: t`$N = ${N}$ gives $u = ${tn((n * Math.PI) / (2 * (N + 1)), 3)}$ and an error of $${tn((1 - sinc((n * Math.PI) / (2 * (N + 1)))) * 100, 2)}\%$; $N = ${N - 1}$ gives $${tn((1 - sinc((n * Math.PI) / (2 * N))) * 100, 2)}\%$, too much.`,
        };
      },
    }),
    mcq({
      id: 'fails-when', difficulty: 2,
      prompt: 'When does the continuous-string description of a beaded string fail?',
      visual: curvesPic([{ fn: 'sin(pi/x)/(pi/x)', color: 'accent', domain: [2, 30], label: 'ω(chain) ÷ v q', labelAt: 12, labelDy: -12 }], [0, 30], [0.55, 1.08], 'The chain’s frequency divided by the string’s, against the wavelength measured in bead spacings.', { xlabel: 'λ / a', ylabel: 'ratio', hlines: [{ y: 1, color: 'ink4' }] }),
      choices: ['When a wavelength spans only a few bead spacings', 'When the amplitude of the waves becomes large', 'When the number of beads is odd rather than even', 'When the tension in the string is made very small'],
      answer: 0,
      why: {
        1: t`Large amplitude breaks a *different* approximation (small slopes, $\sin\theta \approx \tan\theta$). The continuum step only needs the shape to vary slowly from bead to bead.`,
        2: 'Parity changes which modes have a bead at the centre; it does nothing to the continuum limit.',
        3: t`Low tension lowers every frequency in proportion ($v \propto \sqrt T$); the chain-to-string ratio depends only on $qa$.`,
      },
      hints: [t`The Taylor expansion dropped terms of relative size $(qa)^2$.`, 'Read the graph: where does the ratio leave 1?'],
      teach: t`The continuum limit needs $\lambda \gg a$: the error is about $(qa)^2/24 = \pi^2a^2/(6\lambda^2)$.`,
      explain: t`At $\lambda = 10a$ the chain is $${tn((1 - sinc(Math.PI / 10)) * 100, 2)}\%$ slow; at $\lambda = 4a$, $${tn((1 - sinc(Math.PI / 4)) * 100, 2)}\%$; at $\lambda = 2a$ (neighbours opposite), $${tn((1 - sinc(Math.PI / 2)) * 100, 2)}\%$.`,
    }),
    num({
      id: 'beaded-speed', difficulty: 2,
      gen(r) {
        const m = r.pick([0.2, 0.4, 0.6]), a = r.pick([10, 20, 25]), T = r.pick([400, 900, 1600]);
        const v = Math.sqrt((T * a) / m);
        return {
          prompt: t`An aerostat’s tether, light in itself, carries ${m} kg sensor packages every ${a} m and is held at ${T} N tension. At what speed do long sideways waves travel along it, in m/s?`,
          visual: chainPic({ N: 12, start: 'pulse', width: 3, time: 0 }, 'Sensor packages as beads on a light tether, with a long sideways pulse on it (exaggerated).'),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(T / m), feedback: t`$\sqrt{T/m}$ is not a speed: smear the mass out first, $\mu = m/a$.` }, { value: Math.sqrt(T / (m * a)), feedback: t`$\mu = m/a$ (mass per length), so $v = \sqrt{Ta/m}$.` }],
          hints: [t`$\mu = m/a$.`, t`$v = \sqrt{T/\mu}$.`],
          teach: t`For long waves, a beaded string acts like a uniform one with $\mu = m/a$.`,
          explain: t`$\mu = ${m}/${a} = ${tn(m / a)}$ kg/m, $v = \sqrt{${T}/${tn(m / a)}} = ${tn(v)}$ m/s.`,
        };
      },
    }),
    num({
      id: 'correction', difficulty: 3,
      gen(r) {
        const ratio = r.pick([5, 6, 8, 12, 20]), u = Math.PI / ratio, pct = (1 - sinc(u)) * 100;
        return {
          prompt: t`On a chain with spacing $a$, a wave of wavelength $\lambda = ${ratio}a$ travels. By what percentage is its frequency below the long-wave value $vq$?`,
          visual: chainPic({ N: 3 * ratio - 1, start: 'mode', n: 6, ghost: true }, `A wave six half-wavelengths long on ${3 * ratio - 1} beads: each wavelength spans ${ratio} spacings.`),
          answer: pct, units: '', tol: { rel: 0.03 },
          errors: [{ value: (1 - sinc(2 * u)) * 100, feedback: t`The argument is $qa/2 = \pi a/\lambda$, not $qa$.` }],
          hints: [t`$q = 2\pi/\lambda$, so $qa/2 = \pi/${ratio}$.`, t`$\omega/vq = \sin(qa/2)/(qa/2)$; or estimate $1 - (qa)^2/24$.`],
          teach: t`The chain’s fractional frequency deficit is about $(qa)^2/24$ — set by how many spacings fit in a wavelength.`,
          explain: t`$u = \pi/${ratio} = ${tn(u, 4)}$, $\sin u/u = ${tn(sinc(u), 5)}$: $${tn(pct, 3)}\%$ low (the estimate $u^2/6$ gives $${tn((u * u) / 6 * 100, 3)}\%$).`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-crystal', difficulty: 3, transfer: true,
      gen(r) {
        const [name, a] = r.pick([['silicon', 0.235], ['aluminium', 0.286], ['copper', 0.256]]), eps = r.pick([0.01, 0.02, 0.05]);
        const u = sincInv(1 - eps), lam = (Math.PI / u) * a;
        return {
          prompt: t`In a chain model of ${name} with atomic spacing ${a} nm, sound is “dispersionless” — $\omega = vq$ within $${eps * 100}\%$ — only for wavelengths longer than some $\lambda_{\min}$. Find $\lambda_{\min}$ in nm.`,
          visual: curvesPic([{ fn: 'sin(x)/x', color: 'accent', domain: [0.02, 1.6], label: 'ω/vq', labelAt: 1.25, labelDy: -10 }], [0, 1.6], [0.6, 1.05], t`The chain’s $\omega/vq = \sin u/u$ against $u = qa/2 = \pi a/\lambda$.`, { xlabel: 'u = π a / λ', ylabel: 'ratio' }),
          answer: lam, units: 'nm', tol: { rel: 0.02 },
          errors: [{ value: (2 * Math.PI) / u * a, feedback: t`$u = qa/2 = \pi a/\lambda$, so $\lambda = \pi a/u$.` }],
          hints: [t`Solve $\sin u/u = ${1 - eps}$ for $u$; for small $u$, $1 - u^2/6 \approx ${1 - eps}$ is a good start.`, t`Then $\lambda_{\min} = \pi a/u$.`],
          teach: 'Discreteness hides below a few lattice spacings: the dispersion error depends only on λ/a.',
          explain: t`$\sin u/u = ${1 - eps}$ at $u = ${tn(u, 4)}$, so $\lambda_{\min} = \pi(${a})/${tn(u, 4)} = ${tn(lam)}$ nm — about $${tn(lam / a, 2)}$ spacings. Audible and ultrasonic sound (micrometres to metres) is utterly continuous; terahertz phonons are not.`,
        };
      },
    }),
    num({
      id: 'cp-speed', difficulty: 2,
      gen(r) {
        const a = r.pick([0.25, 0.3]), k = r.pick([10, 20, 30]), A = r.pick([12, 24, 40]);
        const m = A * 1.66053906892e-27, v = a * 1e-9 * Math.sqrt(k / m);
        return {
          prompt: t`A chain of atoms of mass ${A} u, spacing ${a} nm, joined by springs of ${k} N/m. What is the speed of long-wavelength sound along it, in m/s?`,
          visual: chainPic({ N: 16, start: 'pulse', width: 4, view: 'longitudinal' }, 'A long compressional pulse on a chain of atoms (displacements exaggerated, also drawn sideways above).'),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(k / m), feedback: t`That is $\sqrt{k/m}$, a rate. Multiply by the spacing: $v = a\sqrt{k/m}$.` }],
          hints: [t`$v = a\sqrt{k/m}$ — equivalently $\sqrt{T/\mu}$ with $T = ka$, $\mu = m/a$.`, t`1 u $= 1.6605\times10^{-27}$ kg; 1 nm $= 10^{-9}$ m.`],
          teach: t`Long-wave speed of a chain: $v = a\sqrt{k/m}$.`,
          explain: t`$\sqrt{k/m} = ${tn(Math.sqrt(k / m))}$ rad/s, so $v = ${tn(a * 1e-9, 3)} \times ${tn(Math.sqrt(k / m))} = ${tn(v)}$ m/s.`,
        };
      },
    }),
    mcq({
      id: 'cp-what-fixed', difficulty: 3,
      prompt: t`In taking the continuum limit $a \to 0$, which quantities must be held fixed so that a finite wave equation survives?`,
      visual: chainPic({ N: 30, start: 'mode', n: 3 }, 'Thirty beads in mode 3: the more beads, the closer they hug the smooth curve.'),
      choices: [t`$\mu = m/a$ and $T = ka$`, t`$m$ and $k$, the bead and the spring`, t`$N$, the number of beads`, t`$\omega$, every mode’s frequency`],
      answer: 0,
      why: {
        1: t`With fixed $m$ and $k$, $v = a\sqrt{k/m} \to 0$ and the total mass $Nm$ blows up: nothing finite survives.`,
        2: t`$N$ must grow: a fixed length $L = (N + 1)a$ needs $N \to \infty$ as $a \to 0$.`,
        3: t`Frequencies are outputs, not inputs; the low ones do converge, to $n\pi v/L$, because $\mu$ and $T$ are held fixed.`,
      },
      hints: [t`The equation $\mu y_{tt} = Ty_{xx}$ contains only $\mu$ and $T$.`, t`As beads shrink and multiply, the mass per metre and the pull should stay what the real string has.`],
      teach: t`The limit keeps the string’s physical properties, $\mu$ and $T$; each bead gets lighter ($m = \mu a$) and each spring stiffer ($k = T/a$).`,
      explain: t`$m = \mu a \to 0$ and $k = T/a \to \infty$ together, so that $a\sqrt{k/m} = \sqrt{T/\mu}$ stays put. That is what “a string made of infinitely many infinitely light beads” means.`,
    }),
  ],
  sources: [
    { label: 'Torre, Foundations of Wave Phenomena, ch. 5: The Continuum Limit and the Wave Equation', url: 'https://digitalcommons.usu.edu/cgi/viewcontent.cgi?article=1005&context=foundation_wave' },
    { label: 'Georgi, The Physics of Waves, ch. 6 (free from the author)', url: 'https://www.people.fas.harvard.edu/~hgeorgi/new.htm' },
  ],
});
