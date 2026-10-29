// Parseval's theorem: Bessel's inequality from orthogonality, completeness
// turning it into an equality — Pythagoras with infinitely many axes — the
// polarized form for inner products, sums of series as energy balances, and
// power bookkeeping for sampled signals.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import * as FS from '../../src/viz/model/fa-series.js';
import { SRC, series, r3, r4 } from './_fa.js';

const t = String.raw;
const PI = Math.PI;

export default lesson({
  id: 'st-e.E2.3',
  title: 'Parseval’s theorem',
  minutes: 15, difficulty: 3,
  intro: t`In ordinary space, the squared length of a vector is the sum of the squares of its components along perpendicular axes. Parseval’s theorem says the same for functions, with the harmonics as axes:

$$\frac{1}{2\pi}\int_{-\pi}^{\pi}|f(x)|^2\,dx = \sum_{n=-\infty}^{\infty}|c_n|^2 = \Big(\frac{a_0}{2}\Big)^2 + \frac12\sum_{n=1}^{\infty}\big(a_n^2 + b_n^2\big)$$

Half of it is easy. Expanding $0 \le \int|f - S_Nf|^2$ and using orthogonality gives **Bessel’s inequality**, $\sum_{|n| \le N}|c_n|^2 \le \frac1{2\pi}\int|f|^2$: the components can never hold more energy than the vector. Equality needs the axes to be **complete** — no direction of function space left out — which is exactly mean-square convergence ([E2.1](#/lesson/st-e.E2.1)). The mean square is a signal’s power, so Parseval is how a spectrum shares out power; and it sums series that have no other easy proof.`,
  symbols: [
    { tex: '\\tfrac{1}{2\\pi}\\int|f|^2dx', text: 'the mean square of $f$ over a period, $\\langle |f|^2\\rangle$ — a signal’s average power (in units of $f^2$)' },
    { tex: 'c_n', text: 'the complex Fourier coefficients; $|c_n|^2$ is the power at harmonic $n$ (half of a real harmonic’s power sits at $+n$, half at $-n$)' },
    { tex: 'a_n,\\ b_n', text: 'the real coefficients; a real harmonic $a_n\\cos nx + b_n\\sin nx$ has mean square $\\tfrac12(a_n^2 + b_n^2)$' },
  ],
  why: t`Every power spectrum — of combustion noise, of detector noise in LIGO, of a pulsar’s timing residuals — is Parseval’s theorem: total power is the sum (or integral) of the power in each frequency.`,
  visual: {
    type: 'fa-series',
    title: 'Bessel’s sum climbing to Parseval’s total',
    lead: t`Bottom: the share of $\langle f^2\rangle$ in each harmonic; the kept ones are blue. The readout adds them up: Bessel’s sum, always below 100%, and approaching it.`,
    tasks: [
      'Square wave: the fundamental alone carries 81% (8/π²); the rest crawls in slowly, 1/n² at a time.',
      'Triangle: the fundamental already carries 98.6% — smoothness puts the power at low n.',
      'Pulse: a quarter of the power is the constant term; watch which harmonics are missing (n = 4, 8, …).',
    ],
    params: { wave: 'square', waves: ['square', 'triangle', 'pulse', 'smooth'], N: 1, Nmax: 60, panels: ['x', 'spec'], nshow: 15, readouts: ['N', 'energy', 'rms'] },
    caption: 'Shares of the mean square ⟨f²⟩: (a₀/2)² for the constant, (aₙ² + bₙ²)/2 for harmonic n. Exact coefficients; the rms error is the square root of what is left over.',
  },
  example: {
    prompt: t`Use Parseval’s theorem with the series $x^2 \sim \dfrac{\pi^2}{3} + 4\displaystyle\sum_{n \ge 1}\dfrac{(-1)^n}{n^2}\cos nx$ (from [Computing Fourier coefficients](#/lesson/st-e.E1.2)) to find $\displaystyle\sum_{n=1}^\infty\frac1{n^4}$.`,
    visual: series({ wave: 'parabola', N: 3, panels: ['x', 'spec'], probe: false, nshow: 10 }, 'The same parabola scaled to (x/π)²: its mean (the n = 0 bar) carries most of the power, and the harmonics fall off like 1/n⁴ in power.'),
    steps: [
      { label: 'Mean square', text: t`$\dfrac1{2\pi}\displaystyle\int_{-\pi}^{\pi}x^4\,dx = \dfrac{1}{2\pi}\cdot\dfrac{2\pi^5}{5} = \dfrac{\pi^4}{5}$.` },
      { label: 'Power in the harmonics', text: t`$\Big(\dfrac{a_0}{2}\Big)^2 = \dfrac{\pi^4}{9}$ and $\tfrac12a_n^2 = \tfrac12\cdot\dfrac{16}{n^4} = \dfrac{8}{n^4}$.` },
      { label: 'Balance', text: t`$\dfrac{\pi^4}{5} = \dfrac{\pi^4}{9} + 8\displaystyle\sum\frac{1}{n^4}$, so $8\sum\frac1{n^4} = \pi^4\Big(\frac15 - \frac19\Big) = \dfrac{4\pi^4}{45}$.` },
      { label: 'Result', text: t`$\displaystyle\sum_{n=1}^\infty\frac{1}{n^4} = \frac{\pi^4}{90} = ${r4(PI ** 4 / 90)}$. Check: $1 + \tfrac1{16} + \tfrac1{81} + \tfrac1{256} = ${r4(1 + 1 / 16 + 1 / 81 + 1 / 256)}$ already — the tail is small.` },
      { label: 'Why it works', text: t`Parseval is Pythagoras: $f$ is a vector, the harmonics are perpendicular axes, and the squared length equals the sum of squared components — once no axis is missing.` },
    ],
    answer: t`$\displaystyle\sum_{n \ge 1}\frac1{n^4} = \frac{\pi^4}{90} \approx ${r4(PI ** 4 / 90)}$.`,
  },
  practice: [
    num({
      id: 'tri-share', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 3, 5]);
        const ans = 96 / (PI ** 4 * n ** 4);
        return {
          prompt: t`The triangle wave $1 - \tfrac2\pi|x|$ has mean square $\tfrac13$ and coefficients $a_n = \dfrac{8}{\pi^2n^2}$ for odd $n$. What fraction of its mean square is in harmonic $n = ${n}$?`,
          visual: series({ wave: 'triangle', N: n, panels: ['x', 'spec'], probe: false, nshow: 9 }, `The triangle wave and its partial sum up to n = ${n}; bars show each harmonic’s share.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 2 * ans, feedback: t`A real harmonic’s mean square is $\tfrac12a_n^2$ — the average of $\cos^2$ is $\tfrac12$.` }, { value: (8 / (PI * PI * n * n)) * 3, feedback: 'Power goes with the square of the coefficient.' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`Harmonic $n$ carries $\tfrac12a_n^2 = \dfrac{32}{\pi^4n^4}$.`, t`Divide by the total, $\tfrac13$.`],
          teach: 'A harmonic’s share of the power is ½(aₙ² + bₙ²) divided by the mean square.',
          explain: t`$\dfrac{32/(\pi^4n^4)}{1/3} = \dfrac{96}{\pi^4n^4} = ${r4(ans)}$ for $n = ${n}$. The fundamental alone has $${r3(100 * 96 / PI ** 4)}\%$.`,
        };
      },
    }),
    num({
      id: 'odd-quartic', difficulty: 3,
      prompt: t`Apply Parseval to the triangle wave (mean square $\tfrac13$, $a_n = \frac{8}{\pi^2n^2}$ for odd $n$, all else zero) to find $\displaystyle\sum_{n\ \text{odd}}\frac{1}{n^4} = 1 + \frac1{81} + \frac1{625} + \cdots$.`,
      visual: series({ wave: 'triangle', N: 3, panels: ['spec'], probe: false, nshow: 9, spec: 'log' }, 'The triangle’s harmonic amplitudes on a log scale: odd only, falling like 1/n².'),
      answer: PI ** 4 / 96, tol: { rel: 0.002 },
      errors: [{ value: PI ** 4 / 90, feedback: 'That is the sum over every n. Here only odd n appear.' }, { value: PI ** 4 / 192, feedback: t`Check the balance: $\tfrac13 = \tfrac12\cdot\frac{64}{\pi^4}\sum_{\text{odd}}\frac1{n^4}$.` }],
      hints: [t`$\tfrac13 = \tfrac12\sum_{\text{odd}}a_n^2$ (the constant term is 0).`, t`$\tfrac12a_n^2 = \dfrac{32}{\pi^4n^4}$, so $\tfrac13 = \dfrac{32}{\pi^4}\sum_{\text{odd}}\dfrac1{n^4}$.`],
      teach: 'Parseval turns a known Fourier series into the exact value of a sum of squares of its coefficients.',
      explain: t`$\sum_{\text{odd}}\frac1{n^4} = \frac{\pi^4}{96} = ${r4(PI ** 4 / 96)}$. Consistent with the worked example: the even terms add $\tfrac1{16}\cdot\frac{\pi^4}{90}$, and $\frac{\pi^4}{96} + \frac{\pi^4}{1440} = \frac{\pi^4}{90}$.`,
    }),
    mcq({
      id: 'bessel', difficulty: 3,
      prompt: t`You expand $f(x) = e^{x/2}$ on $(-\pi, \pi)$ using only the functions $1, \cos x, \cos 2x, \dots$ (no sines), computing $a_n$ in the usual way. How does $\big(\frac{a_0}{2}\big)^2 + \tfrac12\sum a_n^2$ compare with $\langle f^2\rangle$?`,
      visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-1.5, 5.2], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'e^(x/2)', color: 'ink3', dash: [5, 4], width: 1.5, label: 'f', labelAt: 2.4, labelDy: -10 }, { fn: 'cosh(x/2)', color: 'accent', width: 2.2, label: 'even part', labelAt: -2.6, labelDy: -12 }, { fn: 'sinh(x/2)', color: 'warn', width: 1.8, label: 'odd part', labelAt: -2.2, labelDy: 14 }] }, caption: '$f = e^{x/2}$ is its even part cosh(x/2) plus its odd part sinh(x/2).' },
      choices: ['strictly less: the cosines miss the odd part sinh(x/2), whose power is lost', 'equal: Parseval holds for any orthogonal set', 'strictly greater, because the cosines overlap', 'equal, because $e^{x/2}$ is positive'],
      answer: 0,
      why: {
        1: 'Parseval needs a complete set. The cosines alone are orthogonal but not complete: they cannot represent odd functions.',
        2: 'Bessel’s inequality forbids that: the components along orthogonal axes never hold more than the whole.',
        3: 'Positivity is irrelevant; what matters is whether the axes span every direction f has.',
      },
      hints: ['Write f as an even part plus an odd part. Which part can cosines build?', 'Bessel: for any orthonormal set, the sum of squared components is at most the squared length, with equality only if the set is complete for f.'],
      teach: 'Bessel’s inequality holds for any orthogonal set; Parseval’s equality is the test of completeness.',
      explain: t`The cosine coefficients capture exactly the even part $\cosh(x/2)$, so the sum equals $\langle\cosh^2(x/2)\rangle$, short of $\langle f^2\rangle$ by the odd part’s power $\langle\sinh^2(x/2)\rangle$. Bessel’s inequality is strict, which proves the cosines alone are **incomplete** on $(-\pi, \pi)$.`,
    }),
    num({
      id: 'polarized', difficulty: 2,
      gen(r) {
        const A = r.int(1, 4), B = r.intExcept(-3, 3, [0]), C = r.intExcept(-2, 3, [0]);
        const D = r.int(1, 3), E = r.intExcept(-3, 4, [0]), G = r.intExcept(-2, 2, [0]);
        const ans = A * D + 0.5 * B * E + 0.5 * C * G;
        return {
          prompt: t`Let $f = ${A} ${B < 0 ? '-' : '+'} ${Math.abs(B)}\cos x ${C < 0 ? '-' : '+'} ${Math.abs(C)}\sin 2x$ and $g = ${D} ${E < 0 ? '-' : '+'} ${Math.abs(E)}\cos x ${G < 0 ? '-' : '+'} ${Math.abs(G)}\sin 2x$. Find the average of their product over a period, $\dfrac1{2\pi}\displaystyle\int_{-\pi}^{\pi}f\,g\,dx$.`,
          visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-0.6 * (A + Math.abs(B) + Math.abs(C)) * (D + Math.abs(E) + Math.abs(G)), 1.1 * (A + Math.abs(B) + Math.abs(C)) * (D + Math.abs(E) + Math.abs(G))], aspect: 'wide', xlabel: 'x (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: `(${A} + ${B}*cos(x) + ${C}*sin(2x))*(${D} + ${E}*cos(x) + ${G}*sin(2x))`, color: 'accent', width: 2.2 }], shade: [{ fn: `(${A} + ${B}*cos(x) + ${C}*sin(2x))*(${D} + ${E}*cos(x) + ${G}*sin(2x))`, from: -3.1416, to: 3.1416, color: 'accent', alpha: 0.18 }] }, caption: 'The product f g over one period; its average is the signed area ÷ 2π.' },
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: A * D + B * E + C * G, feedback: t`Each matching pair of harmonics contributes the **average** of $\cos^2$ or $\sin^2$, which is $\tfrac12$.` }].filter((e) => Math.abs(e.value - ans) > 0.02),
          hints: ['Cross terms between different harmonics average to zero (orthogonality).', t`Matching harmonics contribute $\tfrac12a_nb_n$; the constants contribute their product.`],
          teach: 'The polarized Parseval identity: the average of f g is the sum of products of matching coefficients.',
          explain: t`$${A}\cdot${D} + \tfrac12(${B})(${E}) + \tfrac12(${C})(${G}) = ${ans}$. In complex form, $\frac1{2\pi}\int f\bar g = \sum c_n\overline{d_n}$ — the dot product of the coefficient vectors.`,
        };
      },
    }),
    num({
      id: 'rms-lines', difficulty: 2,
      gen(r) {
        const dc = r.pick([0, 0.5, 1.2]), A = [r.pick([3, 4, 6]), r.pick([1, 1.5, 2]), r.pick([0.4, 0.8])];
        const ans = Math.sqrt(dc * dc + A.reduce((s, a) => s + (a * a) / 2, 0));
        return {
          prompt: t`An accelerometer on an engine mount records a steady periodic vibration: a constant offset of $${dc}\ \text{m/s}^2$ plus harmonics of amplitude $${A[0]}$, $${A[1]}$ and $${A[2]}\ \text{m/s}^2$ (phases unknown). What is its rms acceleration?`,
          visual: { type: 'graph', params: { x: [0, 2], y: [dc - 10, dc + 10], aspect: 'wide', xlabel: 't / T', ylabel: 'm/s²', axesAt: 'edge', curves: [{ fn: `${dc} + ${A[0]}*cos(2*pi*x) + ${A[1]}*cos(4*pi*x + 1) + ${A[2]}*cos(6*pi*x + 2.3)`, color: 'accent', width: 2 }] }, caption: 'One possible waveform (phases chosen arbitrarily): the phases change the shape, not the rms.' },
          answer: ans, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(dc * dc + A.reduce((s, a) => s + a * a, 0)), feedback: 'Each harmonic’s mean square is half its squared amplitude.' }, { value: dc + A.reduce((s, a) => s + a / Math.SQRT2, 0), feedback: 'rms values of different harmonics do not add; their mean squares do.' }],
          hints: ['Mean squares of orthogonal pieces add (Parseval).', t`Mean square $= ${dc}^2 + \tfrac12(${A[0]}^2 + ${A[1]}^2 + ${A[2]}^2)$; take the square root.`],
          teach: 'Power adds across harmonics regardless of their phases: rms = √(DC² + Σ A²/2).',
          explain: t`$\sqrt{${dc}^2 + \tfrac12(${A[0] ** 2} + ${A[1] ** 2} + ${r4(A[2] ** 2)})} = ${r4(ans)}\ \text{m/s}^2$. Adding the rms values instead would overestimate it: harmonics are orthogonal, so their powers add like squared sides of a right angle.`,
        };
      },
    }),
    code({
      id: 'parseval-fft', difficulty: 3,
      prompt: t`Check Parseval on a sampled signal. The program builds 2 s of synthetic chamber-pressure data at $f_s = 8000$ Hz: an offset, a strong combustion-instability tone at 1800 Hz, a weaker one at 600 Hz, and noise. Write

- \`power_time(x)\`: the mean square of the samples;
- \`power_spec(x)\`: the power in each \`rfft\` bin, $P_k = |X_k|^2/M^2$, doubled for every bin except $k = 0$ and (for even $M$) the last, so that $\sum_k P_k$ is the mean square;
- \`band_fraction(x, fs, f1, f2)\`: the share of the total power in bins with $f_1 \le f \le f_2$.`,
      starter: t`import numpy as np

fs = 8000.0
M = 16000
t = np.arange(M) / fs
rng = np.random.default_rng(1)
x = 0.4 + 2 * np.sin(2*np.pi*1800*t) + 0.5 * np.sin(2*np.pi*600*t + 1) + 0.3 * rng.standard_normal(M)

def power_time(x):
    pass

def power_spec(x):
    pass

def band_fraction(x, fs, f1, f2):
    pass

print("mean square, time:     ", power_time(x))
print("sum of the spectrum:   ", power_spec(x).sum())
print("share in 1700–1900 Hz: ", band_fraction(x, fs, 1700, 1900))
`,
      answer: t`import numpy as np

fs = 8000.0
M = 16000
t = np.arange(M) / fs
rng = np.random.default_rng(1)
x = 0.4 + 2 * np.sin(2*np.pi*1800*t) + 0.5 * np.sin(2*np.pi*600*t + 1) + 0.3 * rng.standard_normal(M)

def power_time(x):
    return np.mean(x**2)

def power_spec(x):
    M = len(x)
    P = np.abs(np.fft.rfft(x))**2 / M**2
    P[1:] *= 2
    if M % 2 == 0:
        P[-1] /= 2
    return P

def band_fraction(x, fs, f1, f2):
    P = power_spec(x)
    f = np.fft.rfftfreq(len(x), 1/fs)
    band = (f >= f1) & (f <= f2)
    return P[band].sum() / P.sum()

print("mean square, time:     ", power_time(x))
print("sum of the spectrum:   ", power_spec(x).sum())
print("share in 1700–1900 Hz: ", band_fraction(x, fs, 1700, 1900))
`,
      tests: [
        { name: 'Parseval: the spectrum sums to the mean square', code: 'abs(power_spec(x).sum() - power_time(x)) < 1e-9 * power_time(x)' },
        { name: 'works for an odd number of samples too', code: 'abs(power_spec(x[:999]).sum() - power_time(x[:999])) < 1e-9 * power_time(x[:999])' },
        { name: 'the mean square is about 2.372', code: 'abs(power_time(x) - 2.37207) < 1e-4' },
        { name: 'about 84.6% of the power is in the 1700–1900 Hz band', code: 'abs(band_fraction(x, fs, 1700, 1900) - 0.84570) < 1e-3' },
        { name: 'the 0 Hz bin holds the offset’s power 0.4² (approximately)', code: 'abs(power_spec(x)[0] - 0.16) < 0.005' },
      ],
      hints: ['`np.mean(x**2)` is the mean square. For the spectrum, `P = np.abs(np.fft.rfft(x))**2 / M**2`.', 'rfft keeps only k ≥ 0: each positive frequency stands for itself and its negative twin, so double P[1:], then undo it for the Nyquist bin when M is even.'],
      teach: t`For sampled data Parseval reads $\overline{x^2} = \sum_k|X_k|^2/M^2$ over all bins; one-sided spectra double every bin except 0 and Nyquist.`,
      explain: t`The two sums agree to round-off. The 1800 Hz tone has mean square $2^2/2 = 2$ out of about $2.372$ — $84.3\%$ — and the noise inside the 200 Hz band adds a little more. Engineers watch exactly this band power to detect a combustion instability growing.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pulse-band', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([1, 2, 3]);
        const ans = 100 * FS.captured('pulse', N);
        return {
          prompt: t`A telemetry line carries a pulse train that is on (level 1) for a quarter of each period and off otherwise. Its mean square is $\tfrac14$, its mean is $\tfrac14$, and $a_n = \dfrac{2\sin(n\pi/4)}{n\pi}$. A narrow channel passes only the constant and harmonics $n \le ${N}$. What percentage of the signal’s power gets through?`,
          visual: series({ wave: 'pulse', N, panels: ['x', 'spec'], probe: false, nshow: 12 }, `The pulse train and what a channel passing n ≤ ${N} delivers; bars show each harmonic’s share of the power.`),
          answer: ans, units: '%', tol: { rel: 0.005 },
          errors: [{ value: ans - 25, feedback: 'Do not forget the constant term: (a₀/2)² = 1/16 is a quarter of the power.' }],
          hints: [t`Power through $= \big(\tfrac14\big)^2 + \tfrac12\sum_{n \le ${N}}a_n^2$.`, t`Divide by $\langle f^2\rangle = \tfrac14$.`],
          teach: 'Parseval makes channel budgets exact: the power through a band is the sum of the powers of the harmonics inside it.',
          explain: t`$\Big[\tfrac1{16} + \tfrac12\sum_{n \le ${N}}\big(\frac{2\sin(n\pi/4)}{n\pi}\big)^2\Big]\big/\tfrac14 = ${r4(ans)}\%$. A quarter of the power is just the average level; the sharp edges hide the rest in high harmonics.`,
        };
      },
    }),
    mcq({
      id: 'cp-phases', difficulty: 2, transfer: true,
      prompt: t`A pulsar timing team publishes only the power spectrum $|c_n|^2$ of a pulse profile, not the phases of the $c_n$. What can be recovered from it?`,
      visual: { type: 'graph', params: { x: [-3.1416, 3.1416], y: [-1.6, 2.4], aspect: 'wide', xlabel: 'phase (rad)', ylabel: '', axesAt: 'edge', curves: [{ fn: 'cos(x) + 0.6*cos(2x) + 0.4*cos(3x)', color: 'accent', width: 2.2, label: 'P', labelAt: 0.3, labelDy: -12 }, { fn: 'cos(x + 1.3) + 0.6*cos(2x - 2) + 0.4*cos(3x + 0.7)', color: 'warn', width: 1.8, dash: [6, 4], label: 'Q', labelAt: 2.3, labelDy: -12 }] }, caption: 'P and Q have identical |cₙ| for every n — and so the same power — but different phases and shapes.' },
      choices: ['the profile’s mean square power and its distribution over harmonics, but not its shape', 'the full pulse profile', 'nothing, since the phases carry the power', 'the shape but not the power'],
      answer: 0,
      why: {
        1: 'P and Q in the picture share every |cₙ| yet look different: the shape needs the phases.',
        2: 'Power is |cₙ|², which is exactly what was published; phases carry timing and shape.',
        3: 'It is the other way round: the power survives, the shape is lost.',
      },
      hints: ['Parseval involves only |cₙ|².', 'Change the phase of one harmonic: does the mean square change? Does the shape?'],
      teach: 'Parseval’s theorem sees only |cₙ|²: power is phase-blind, shape is not.',
      explain: t`$\langle|f|^2\rangle = \sum|c_n|^2$ is unchanged by any phases, so total power and its share per harmonic survive. Shifting phases reshapes the profile without changing its power, as P and Q show — which is why timing (a phase measurement) needs the complex coefficients.`,
    }),
  ],
  sources: [SRC.stein, SRC.korner, SRC.boas],
});
