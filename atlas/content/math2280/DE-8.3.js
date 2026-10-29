// Fourier series for boundary-value problems: to release a string from any
// shape, superpose its modes. Orthogonality of the sines gives each
// coefficient as an integral; the plucked string worked in full; missing
// harmonics at the pluck point; smoothness against coefficient decay; the
// Gibbs overshoot at a jump; a numerical coefficient calculator in Python;
// and a pulsing thruster's harmonics as the transfer.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { co, sg, lead } from './_second.js';
import { fpic, n } from './_laplace.js';

const t = String.raw;

// the Explore: partial sums of the sine series on [0, 1] of a plucked string (c = 0) or of f = 1 (c = 1), at time tt (wave speed 1)
const COEF = '(step(0.5 - c)*2*sin(k*pi*a)/(k^2*pi^2*a*(1 - a)) + step(c - 0.5)*2*(1 - cos(k*pi))/(k*pi))';
const MODE = (j) => COEF.replace(/k/g, String(j)) + `*sin(${j}*pi*x)*cos(${j}*pi*tt)`;

export default lesson({
  id: 'math2280.DE-8.3',
  title: 'Fourier series for boundary-value problems',
  minutes: 15, difficulty: 3,
  intro: t`Each mode $\sin(n\pi x/L)\cos(n\pi ct/L)$ solves the wave equation with both ends fixed, and so does any sum of them. To release a string from rest in an arbitrary shape $f(x)$, choose the amounts $b_n$ so that the sum matches $f$ at $t = 0$:

$$f(x) = \sum_{n=1}^{\infty} b_n\sin\frac{n\pi x}{L}, \qquad b_n = \frac{2}{L}\int_0^L f(x)\sin\frac{n\pi x}{L}\,dx$$

This is a **Fourier sine series**. The formula for $b_n$ works because the eigenfunctions are **orthogonal**: $\int_0^L \sin\frac{m\pi x}{L}\sin\frac{n\pi x}{L}\,dx$ is $0$ when $m \ne n$ and $L/2$ when $m = n$, so multiplying the series by one sine and integrating kills every term but one. Then $u(x, t) = \sum b_n \sin\frac{n\pi x}{L}\cos\frac{n\pi ct}{L}$: every mode keeps its share and swings at its own frequency.`,
  symbols: [
    { tex: t`f(x)`, text: t`the initial shape on $[0, L]$, zero at both ends (the string released from rest)` },
    { tex: t`b_n`, text: t`the amount of mode $n$ in it — the Fourier sine coefficient, in the units of $f$` },
    { tex: t`\sin\frac{n\pi x}{L}`, text: t`the $n$-th eigenfunction of $X'' + \lambda X = 0$, $X(0) = X(L) = 0$` },
    { tex: t`L`, text: 'the length of the interval, in m' },
    { tex: t`c`, text: t`the wave speed, in m/s; mode $n$ swings at $\omega_n = n\pi c/L$` },
  ],
  why: t`Separation of variables plus a Fourier series solves the wave, heat and Laplace equations on intervals and boxes; and expanding in eigenfunctions is how quantum mechanics writes any state as a sum of energy states.`,
  visual: {
    type: 'graph',
    title: 'Building a shape out of modes',
    lead: t`The dashed curve is the initial shape; the blue curve is the sum of its first $N$ sine modes, and the three faint curves are modes 1, 2 and 3 on their own. Add terms, move the pluck point, switch to a shape with jumps, and let time run.`,
    tasks: [
      'Plucked string: raise N from 1. The sum closes in on the triangle fast, because the amounts fall like 1/n².',
      'Pluck at a = 0.5: modes 2, 4, 6 … are missing — the middle is one of their nodes. At a = 0.33 mode 3 vanishes.',
      'Choose the flat shape f = 1 (which jumps to 0 at the fixed ends): near each end the sum overshoots by about 18% of the height whatever N is — the Gibbs phenomenon.',
      'Plucked string, move the time t: each mode swings at its own rate; at t = 1, half a period, the string is the triangle upside down and mirrored end to end.',
    ],
    params: {
      x: [0, 1], y: [-1.35, 1.45], xlabel: 'x (L = 1)', ylabel: 'u',
      choices: [{ key: 'c', label: 'Initial shape', options: [[0, 'Plucked string'], [1, 'Flat, $f = 1$']], value: 0 }],
      sliders: [
        { key: 'N', label: 'Terms $N$', min: 1, max: 40, step: 1, value: 3, explain: 'How many sine modes are added.' },
        { key: 'a', label: 'Pluck point $a$', min: 0.1, max: 0.9, step: 0.01, value: 0.3, explain: 'Where the string is pulled aside (plucked string only); its height there is 1.' },
        { key: 'tt', label: 'Time $t$', min: 0, max: 2, step: 0.01, value: 0, unit: t`L/c`, explain: t`In units of $L/c$: every mode returns after $t = 2$.` },
      ],
      curves: [
        { fn: 'min(x/a, (1 - x)/(1 - a))', color: 'ink3', dash: true, width: 1.6, when: 'step(0.5 - c)' },
        { fn: '1', color: 'ink3', dash: true, width: 1.6, when: 'step(c - 0.5)', domain: [0.0005, 0.9995] },
        { fn: MODE(1), color: 'violet', width: 1.2, dash: true },
        { fn: MODE(2), color: 'teal', width: 1.2, dash: true },
        { fn: MODE(3), color: 'gold', width: 1.2, dash: true },
        { sum: `${COEF}*sin(k*pi*x)*cos(k*pi*tt)`, k: [1, 'N'], color: 'accent', width: 2.8 },
      ],
      readouts: [
        { label: 'amount of mode 1, $b_1$', expr: COEF.replace(/k/g, '1'), digits: 3 },
        { label: 'of mode $N$, $b_N$', expr: COEF.replace(/k/g, 'N'), digits: 3 },
      ],
    },
    caption: t`Units with $L = 1$ and $c = 1$; the string is released from rest at $t = 0$. The sums are exact, but only finitely many terms are ever drawn. An ideal string: no damping and no stiffness, so the modes never lose energy or shift in frequency.`,
  },
  example: {
    prompt: t`A string of length $L$ is pulled aside a height $h$ at its midpoint and released from rest. Find its Fourier sine coefficients and $u(x, t)$.`,
    visual: fpic('(8/pi^2)*(sin(pi*x) - sin(3*pi*x)/9 + sin(5*pi*x)/25)', [0, 1], [-0.15, 1.15], t`The plucked shape (dashed, $h = 1$, $L = 1$) and the sum of its first three nonzero modes (blue): already within 7% of the height everywhere, worst at the kink.`, { xlabel: 'x / L', ylabel: 'u / h', curves: [{ fn: 'min(2x, 2 - 2x)', color: 'ink3', dash: true, width: 1.6 }] }),
    steps: [
      { label: 'The shape', text: t`$f(x) = \dfrac{2h}{L}x$ for $x \le L/2$ and $\dfrac{2h}{L}(L - x)$ for $x \ge L/2$.` },
      { label: 'Coefficients', text: t`$b_n = \dfrac{2}{L}\displaystyle\int_0^L f(x)\sin\frac{n\pi x}{L}\,dx$. Integrate each half by parts ($\int x\sin kx\,dx = -\frac{x\cos kx}{k} + \frac{\sin kx}{k^2}$, $k = n\pi/L$): the cosine terms from the two halves cancel at $L/2$ and what remains is $\;b_n = \dfrac{8h}{n^2\pi^2}\sin\dfrac{n\pi}{2}$.` },
      { label: 'Read them', text: t`$\sin(n\pi/2)$ is $1, 0, -1, 0, 1, \ldots$: every **even** mode is missing — they all have a node at the middle, where the pluck is — and the odd ones fall like $1/n^2$: $\;b_1 = \frac{8h}{\pi^2}$, $b_3 = -\frac{8h}{9\pi^2}$, $b_5 = \frac{8h}{25\pi^2}$.` },
      { label: 'The motion', text: t`$u(x, t) = \dfrac{8h}{\pi^2}\left[\sin\dfrac{\pi x}{L}\cos\dfrac{\pi ct}{L} - \dfrac19\sin\dfrac{3\pi x}{L}\cos\dfrac{3\pi ct}{L} + \dfrac{1}{25}\sin\dfrac{5\pi x}{L}\cos\dfrac{5\pi ct}{L} - \cdots\right]$.` },
      { label: 'Sense check', text: t`At the midpoint and $t = 0$: $\frac{8h}{\pi^2}\big(1 + \frac19 + \frac1{25} + \cdots\big) = \frac{8h}{\pi^2}\cdot\frac{\pi^2}{8} = h$ ✓ — the sum of the odd $1/n^2$ is $\pi^2/8$. The fundamental carries 81% ($8/\pi^2$) of the height, which is why a guitar plucked at the middle sounds mellow.` },
    ],
    answer: t`$b_n = \dfrac{8h}{n^2\pi^2}\sin\dfrac{n\pi}{2}$ (odd $n$ only), and $u = \sum b_n\sin\dfrac{n\pi x}{L}\cos\dfrac{n\pi ct}{L}$.`,
  },
  practice: [
    num({
      id: 'coefficient', difficulty: 2,
      gen(r) {
        const L = r.pick([1, 2]), k = r.pick([1, 3]);
        const bn = (8 * L * L) / (k ** 3 * Math.PI ** 3);
        return {
          prompt: t`A string of length $L = ${L}$ m is released from rest in the parabolic shape $f(x) = x(${L} - x)$ (in m). Find its Fourier sine coefficient $b_${k}$.`,
          answer: bn, units: 'm', tol: { rel: 0.005 },
          integrand: `(2/${L})*x*(${L} - x)*sin(${k}*pi*x/${L})`, limits: [0, L],
          errors: [{ value: bn / 2, feedback: t`The formula has $\frac{2}{L}$ in front: $\int_0^L\sin^2\frac{n\pi x}{L}dx = \frac{L}{2}$, and you divide by it.` }, { value: (bn * k) / 2, feedback: 'Integrate by parts twice: the coefficient falls like 1/n³ for this smooth shape.' }],
          hints: [t`$b_${k} = \dfrac{2}{${L}}\displaystyle\int_0^{${L}} x(${L} - x)\sin\dfrac{${co(k)}\pi x}{${L}}\,dx$.`, t`Two integrations by parts give $b_n = \dfrac{4L^2}{n^3\pi^3}\big(1 - (-1)^n\big)$, which is $\dfrac{8L^2}{n^3\pi^3}$ for odd $n$.`],
          teach: t`Each coefficient is the overlap of the shape with one eigenfunction: $b_n = \frac{2}{L}\int_0^L f\sin\frac{n\pi x}{L}\,dx$.`,
          explain: t`$b_${k} = \dfrac{8\times${L * L}}{${k ** 3}\pi^3} = ${fmt(bn, 4)}$ m. A smooth shape (no kinks) has coefficients that fall like $1/n^3$, so a parabola is almost pure fundamental: $b_3/b_1 = 1/27$.`,
          visual: fpic(`x*(${L} - x)`, [0, L], [-0.6 * L * L / 4 - 0.1, 0.35 * L * L], t`The shape $f$ (blue), the eigenfunction $\sin(${co(k)}\pi x/${L})$ scaled to fit (dashed), and their product (shaded), whose area gives $b_${k}$.`, {
            xlabel: 'x (m)', ylabel: 'm',
            curves: [{ fn: `${(L * L) / 4 * 0.6}*sin(${k}*pi*x/${L})`, color: 'gold', dash: true, width: 1.6 }],
            shade: [{ fn: `x*(${L} - x)*sin(${k}*pi*x/${L})`, from: 0, to: L, color: 'accent', alpha: 0.22 }],
          }),
        };
      },
    }),
    mcq({
      id: 'orthogonal', difficulty: 1,
      prompt: t`What is $\displaystyle\int_0^{\pi}\sin 2x\,\sin 3x\,dx$?`,
      choices: ['0', t`$\pi/2$`, t`$6/5$`, t`$\pi$`],
      answer: 0,
      why: {
        1: t`That is $\int_0^\pi \sin^2 nx\,dx$, when the two modes are the **same**.`,
        2: t`Use $\sin A\sin B = \tfrac12[\cos(A - B) - \cos(A + B)]$: both cosines integrate to zero over $[0, \pi]$.`,
        3: 'The positive and negative parts of the product cancel exactly.',
      },
      hints: [t`$\sin 2x\sin 3x = \tfrac12\big[\cos x - \cos 5x\big]$.`],
      teach: t`Different eigenfunctions of the same problem are orthogonal: $\int_0^L \sin\frac{m\pi x}{L}\sin\frac{n\pi x}{L}\,dx = 0$ for $m \ne n$.`,
      explain: t`$\tfrac12\int_0^\pi(\cos x - \cos 5x)\,dx = \tfrac12\big[\sin x - \tfrac15\sin 5x\big]_0^\pi = 0$. This is what lets one coefficient be computed without knowing the others.`,
      visual: fpic('sin(2x)*sin(3x)', [0, Math.PI], [-1.1, 1.1], t`The product $\sin 2x\sin 3x$ on $[0, \pi]$, positive parts blue, negative red.`, { xlabel: 'x', ylabel: '', shade: [{ fn: 'max(sin(2x)*sin(3x), 0)', from: 0, to: 'pi', color: 'accent', alpha: 0.25 }, { fn: 'min(sin(2x)*sin(3x), 0)', from: 0, to: 'pi', color: 'bad', alpha: 0.25 }] }),
    }),
    mcq({
      id: 'missing', difficulty: 2,
      prompt: t`A string is plucked at one third of its length, $a = L/3$, so $b_n \propto \dfrac{1}{n^2}\sin\dfrac{n\pi}{3}$. Which modes are missing from its sound?`,
      choices: ['3, 6, 9, …: every mode with a node at the pluck point', '2, 4, 6, …: the even modes', 'None: a pluck excites every mode', '1: the fundamental, because the pluck is off-centre'],
      answer: 0,
      why: {
        1: t`Those vanish for a pluck at the **middle**, $a = L/2$, where every even mode has a node.`,
        2: t`$\sin(n\pi/3) = 0$ for $n = 3, 6, 9, \ldots$: those coefficients are exactly zero.`,
        3: t`$b_1 \propto \sin(\pi/3) \ne 0$: the fundamental is always present.`,
      },
      hints: [t`When is $\sin(n\pi/3) = 0$?`],
      teach: 'A pluck cannot excite a mode that has a node where the string is pulled.',
      explain: t`$\sin(n\pi/3) = 0$ exactly when $n$ is a multiple of 3, and those modes have a node at $x = L/3$. Guitarists use the effect: plucking nearer the bridge brings in more high harmonics.`,
      visual: fpic('min(3x, 1.5*(1 - x))', [0, 1], [-0.15, 1.2], t`The string plucked at $x = L/3$, just before release ($L = 1$).`, { xlabel: 'x / L', ylabel: 'u' }),
    }),
    mcq({
      id: 'decay', difficulty: 2,
      prompt: t`Three initial shapes on $[0, L]$: (P) the smooth parabola $x(L - x)$; (Q) a plucked triangle, with a kink; (R) the flat $f = 1$, which jumps to 0 at the fixed ends. How fast do their sine coefficients fall?`,
      choices: [t`P like $1/n^3$, Q like $1/n^2$, R like $1/n$: the rougher the shape, the slower`, t`All like $1/n^2$: every coefficient formula has $n^2\pi^2$`, t`R fastest, because a constant is the simplest function`, t`P like $1/n$, Q like $1/n^2$, R like $1/n^3$`],
      answer: 0,
      why: {
        1: 'Each integration by parts brings a factor 1/n, but only while the function stays smooth: a jump stops it after one, a kink after two.',
        2: t`The flat shape is constant inside, but its odd extension jumps at the ends: $b_n = 4/(n\pi)$ for odd $n$, the slowest decay.`,
        3: 'That is backwards: smoothness speeds the decay.',
      },
      hints: ['Integrate by parts: each step that produces no boundary term gives another factor 1/n.', 'A jump in f leaves a boundary term after one step; a jump in f′ (a kink) after two.'],
      teach: 'Smoothness and coefficient decay go together: a jump gives 1/n, a kink 1/n², a smooth shape with zero ends 1/n³ or faster.',
      explain: t`$b_n = \frac{8L^2}{n^3\pi^3}$ (odd $n$) for the parabola, $\propto \frac{1}{n^2}$ for the triangle, $\frac{4}{n\pi}$ for the flat shape. Slow decay means many terms are needed, and at a jump they never quite converge uniformly — the Gibbs overshoot.`,
      visual: fpic(null, [0, 1], [-0.1, 1.2], t`P: $4x(1 - x)$ (blue); Q: a plucked triangle (gold); R: the flat $f = 1$ (red), which must drop to 0 at the fixed ends. $L = 1$.`, { xlabel: 'x', ylabel: 'f', curves: [{ fn: '4x*(1 - x)', color: 'accent', width: 2.2 }, { fn: 'min(x/0.4, (1 - x)/0.6)', color: 'gold', width: 2.2 }, { fn: '1', color: 'bad', width: 2.2, domain: [0.002, 0.998] }] }),
    }),
    expr({
      id: 'two-modes', difficulty: 2,
      gen(r) {
        const A = r.int(2, 5), B = r.pick([0.5, 1, 1.5]), m = r.pick([2, 3, 4]), c = r.pick([1, 2, 3]);
        return {
          prompt: t`A string with $L = 1$ m and wave speed $c = ${c}$ m/s is released from rest in the shape $f(x) = ${A}\sin\pi x - ${B}\sin ${m}\pi x$ (in mm). Write $u(x, t)$.`,
          answer: `${A}*sin(pi*x)*cos(${c}*pi*t) - ${B}*sin(${m}*pi*x)*cos(${m * c}*pi*t)`, answerTeX: t`${A}\sin\pi x\cos ${co(c)}\pi t - ${B}\sin ${m}\pi x\cos ${m * c}\pi t`, lhs: 'u(x, t)',
          vars: { x: [0, 1], t: [0, 2] },
          errors: [
            { answer: `(${A}*sin(pi*x) - ${B}*sin(${m}*pi*x))*cos(${c}*pi*t)`, feedback: t`Each mode keeps its own frequency: mode ${m} swings ${m} times faster, $\cos(${m}\pi ct)$.` },
            { answer: `${A}*sin(pi*x)*sin(${c}*pi*t) - ${B}*sin(${m}*pi*x)*sin(${m * c}*pi*t)`, feedback: t`Released from **rest**, each mode starts at its full size: cosines in time, so that $u(x, 0) = f(x)$.` },
          ],
          hints: [t`The shape is already a sine series: $b_1 = ${A}$, $b_${m} = -${B}$, all others 0.`, t`Mode $n$ swings as $\cos(n\pi ct/L)$.`],
          teach: 'When the initial shape is already a sum of eigenfunctions, the coefficients can be read off; each mode then swings at its own frequency.',
          explain: t`$u = ${A}\sin\pi x\cos ${co(c)}\pi t - ${B}\sin ${m}\pi x\cos ${m * c}\pi t$: at $t = 0$ it is $f$, and the two modes drift in and out of step, so the shape changes as it vibrates.`,
          visual: fpic(`${A}*sin(pi*x) - ${B}*sin(${m}*pi*x)`, [0, 1], [-1.3 * (A + B), 1.3 * (A + B)], t`The initial shape (blue) and its two modes (dashed).`, { xlabel: 'x (m)', ylabel: 'mm', curves: [{ fn: `${A}*sin(pi*x)`, color: 'violet', dash: true, width: 1.4 }, { fn: `-${B}*sin(${m}*pi*x)`, color: 'teal', dash: true, width: 1.4 }] }),
        };
      },
    }),
    num({
      id: 'gibbs', difficulty: 3,
      gen(r) {
        const J = r.pick([40, 60, 80, 100]), what = r.pick([['a rod', 'K', 'temperature'], ['a sealed chamber', 'kPa', 'pressure disturbance']]);
        const peak = 1.17898 * J;
        return {
          prompt: t`The ${what[2]} along ${what[0]}, $0 < x < L$, starts at a uniform ${J} ${what[1]} above its surroundings, while both ends are held at 0. Its Fourier sine series is $\dfrac{4\times${J}}{\pi}\left(\sin\dfrac{\pi x}{L} + \dfrac13\sin\dfrac{3\pi x}{L} + \cdots\right)$. With very many terms, how high do the partial sums peak just inside the ends?`,
          answer: peak, units: what[1], tol: { rel: 0.01 },
          errors: [{ value: J, feedback: 'The partial sums do not settle onto the flat value near a jump: they overshoot it by about 9% of the jump, however many terms you add.' }, { value: 1.0895 * J, feedback: t`The overshoot is 9% of the **jump**, and the jump at $x = 0$ is from $-${J}$ to $+${J}$ in the odd extension: $2\times${J}$.` }],
          hints: ['Near a jump, the partial sums overshoot by about 8.95% of the size of the jump — the Gibbs phenomenon — and the overshoot does not shrink as terms are added.', t`A sine series treats $f$ as odd: just outside $x = 0$ it is $-${J}$, just inside $+${J}$, so the jump is ${2 * J} ${what[1]}.`],
          teach: 'At a jump, Fourier partial sums overshoot by about 9% of the jump, a ripple that narrows but never shrinks as terms are added.',
          explain: t`The peak tends to $\frac{2}{\pi}\mathrm{Si}(\pi)\times${J} \approx 1.179\times${J} = ${fmt(peak, 4)}$ ${what[1]}: an overshoot of $0.0895\times${2 * J}$. The series still converges at every interior point; it just never converges uniformly near the jump.`,
          visual: fpic(`(4/pi)*(sin(pi*x) + sin(3*pi*x)/3 + sin(5*pi*x)/5 + sin(7*pi*x)/7 + sin(9*pi*x)/9 + sin(11*pi*x)/11 + sin(13*pi*x)/13 + sin(15*pi*x)/15 + sin(17*pi*x)/17 + sin(19*pi*x)/19)`, [0, 1], [-0.2, 1.4], t`The flat initial profile (dashed) and the sum of its first ten nonzero terms (blue), in units of the starting value. Numbers on the vertical axis hidden.`, { xlabel: 'x / L', ylabel: '', yticks: 0, curves: [{ fn: '1', color: 'ink3', dash: true, width: 1.6, domain: [0.002, 0.998] }] }),
        };
      },
    }),
    code({
      id: 'fourier-numeric', difficulty: 3,
      prompt: t`Compute Fourier sine coefficients numerically. Write \`b(n, f, L)\` returning $\frac{2}{L}\int_0^L f(x)\sin\frac{n\pi x}{L}\,dx$ (use \`scipy.integrate.quad\`), and \`partial_sum(x, N, f, L)\` returning $\sum_{n=1}^{N} b_n\sin\frac{n\pi x}{L}$ for an array \`x\`. Check \`b\` on a string plucked at $a = 0.3$ ($L = 1$), then measure the Gibbs overshoot of the flat shape $f = 1$ with $N = 99$: set \`overshoot\` to the largest partial sum minus 1.`,
      starter: t`import numpy as np
from scipy.integrate import quad

def b(n, f, L=1.0):
    pass

def partial_sum(x, N, f, L=1.0):
    pass

pluck = lambda x: min(x / 0.3, (1 - x) / 0.7)
flat = lambda x: 1.0

x = np.linspace(0, 1, 4001)
overshoot = None
print([round(b(n, pluck), 5) for n in (1, 2, 3)], overshoot)
`,
      answer: t`import numpy as np
from scipy.integrate import quad

def b(n, f, L=1.0):
    val, err = quad(lambda s: f(s) * np.sin(n * np.pi * s / L), 0, L, limit=200)
    return 2 / L * val

def partial_sum(x, N, f, L=1.0):
    return sum(b(n, f, L) * np.sin(n * np.pi * x / L) for n in range(1, N + 1))

pluck = lambda x: min(x / 0.3, (1 - x) / 0.7)
flat = lambda x: 1.0

x = np.linspace(0, 1, 4001)
overshoot = partial_sum(x, 99, flat).max() - 1
print([round(b(n, pluck), 5) for n in (1, 2, 3)], overshoot)`,
      tests: [
        { name: t`$b_1$ of the plucked string is $\frac{2\sin(0.3\pi)}{\pi^2(0.3)(0.7)} \approx 0.78067$`, code: 'abs(b(1, pluck) - 0.780671995) < 1e-6' },
        { name: t`$b_5$ is about $-0.03860$`, code: 'abs(b(5, pluck) + 0.038598546) < 1e-6' },
        { name: t`\`partial_sum\` with 20 terms reproduces the plucked shape to within 0.05 (worst at the kink)`, code: 'np.max(np.abs(partial_sum(x, 20, pluck) - np.array([pluck(v) for v in x]))) < 0.05' },
        { name: t`the Gibbs overshoot with 99 terms is about 0.179 (9% of the jump of 2)`, code: 'abs(overshoot - 0.1790) < 0.002' },
      ],
      hints: [t`\`quad(g, 0, L)\` returns \`(value, error_estimate)\`; integrate \`lambda s: f(s) * np.sin(n * np.pi * s / L)\`.`, t`\`partial_sum\`: \`sum(b(n, f, L) * np.sin(n * np.pi * x / L) for n in range(1, N + 1))\` works on an array \`x\`. Then \`partial_sum(x, 99, flat).max() - 1\`.`],
      teach: 'Fourier coefficients are integrals, so any shape — measured, sampled or awkward — can be expanded numerically.',
      explain: t`For the pluck at 0.3, $b_n = \frac{2\sin(0.3n\pi)}{n^2\pi^2(0.3)(0.7)}$: 0.7807, 0.2294, 0.0331, …, with $b_{10} = 0$ (a node at the pluck point). For the flat shape the overshoot stays near 0.179 however large $N$ becomes — 8.95% of the jump of 2 in its odd extension — while the ripple squeezes towards the ends.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sawtooth', difficulty: 2,
      gen(r) {
        const L = r.pick([1, 2]), k = r.int(1, 3);
        const bn = ((2 * L) / (k * Math.PI)) * (k % 2 ? 1 : -1);
        return {
          prompt: t`Find the Fourier sine coefficient $b_${k}$ of $f(x) = x$ on $[0, ${L}]$.`,
          answer: bn, tol: { rel: 0.005 },
          integrand: `(2/${L})*x*sin(${k}*pi*x/${L})`, limits: [0, L],
          errors: [{ value: -bn, feedback: t`Check the sign: $\int_0^L x\sin\frac{n\pi x}{L}dx = -\frac{L^2}{n\pi}\cos n\pi = \frac{L^2}{n\pi}(-1)^{n+1}$.` }, { value: bn / 2, feedback: t`Multiply the integral by $\frac{2}{L}$.` }],
          hints: [t`$b_n = \dfrac{2}{L}\displaystyle\int_0^L x\sin\frac{n\pi x}{L}\,dx$; integrate by parts with $u = x$.`],
          teach: t`$b_n = \frac{2}{L}\int_0^L f\sin\frac{n\pi x}{L}\,dx$; for $f = x$ one integration by parts gives $\frac{2L}{n\pi}(-1)^{n+1}$.`,
          explain: t`$b_${k} = \dfrac{2\times${L}}{${k}\pi}(-1)^{${k + 1}} = ${fmt(bn, 4)}$. The $1/n$ decay comes from the jump at $x = ${L}$, where the odd, periodic extension of $x$ drops from $${L}$ to $-${L}$.`,
          visual: fpic('x', [0, L], [-0.2 * L, 1.15 * L], t`$f(x) = x$ on $[0, ${L}]$. Its sine series must vanish at $x = ${L}$, where $f$ does not.`, { xlabel: 'x', ylabel: 'f' }),
        };
      },
    }),
    num({
      id: 'cp-thruster', difficulty: 3, transfer: true,
      gen(r) {
        const F0 = r.pick([10, 22, 50]), fp = r.pick([4, 5, 10]);
        const A3 = (2 * F0) / (3 * Math.PI);
        return {
          prompt: t`A ${F0} N attitude thruster pulses on and off as a square wave at ${fp} Hz (on half of each cycle), so the thrust is $F(t) = ${F0}$ N half the time and 0 otherwise. A solar-array panel has a vibration mode at ${3 * fp} Hz. What is the amplitude of the thrust’s component at ${3 * fp} Hz, its third harmonic?`,
          answer: A3, units: 'N', tol: { rel: 0.005 },
          errors: [{ value: F0 / 3, feedback: t`The square wave about its mean has height $\pm F_0/2$, and its Fourier series is $\frac{4}{\pi}\cdot\frac{F_0}{2}\left(\sin\omega t + \frac13\sin 3\omega t + \cdots\right)$: there is a $4/\pi$.` }, { value: (4 * F0) / (3 * Math.PI), feedback: t`The square wave swings $\pm F_0/2$ about its mean $F_0/2$, not $\pm F_0$.` }],
          hints: [t`Subtract the mean $F_0/2$: what is left is an odd square wave of height $\pm F_0/2$.`, t`A square wave of height $\pm A$ is $\dfrac{4A}{\pi}\left(\sin\omega t + \dfrac13\sin 3\omega t + \dfrac15\sin 5\omega t + \cdots\right)$.`],
          teach: 'A periodic forcing is a Fourier series in time; a structure responds to whichever harmonic sits near one of its modes.',
          explain: t`With $A = F_0/2 = ${F0 / 2}$ N, the third harmonic has amplitude $\dfrac{4A}{3\pi} = \dfrac{2F_0}{3\pi} = ${fmt(A3, 3)}$ N — about a fifth of the thrust, and right at the panel’s ${3 * fp} Hz mode, where a lightly damped panel amplifies it many times. Same orthogonality as the string, with time in place of space; flight software chooses pulse rates to avoid such coincidences.`,
          visual: fpic(`${F0}*step(sin(2*pi*${fp}*x))`, [0, 3 / fp], [-0.2 * F0, 1.3 * F0], t`The thrust: on for half of each ${fp} Hz cycle. Its harmonics sit at ${fp}, ${3 * fp}, ${5 * fp} Hz, …`, { xlabel: 't (s)', ylabel: 'N' }),
        };
      },
    }),
    mcq({
      id: 'cp-why-orthogonal', difficulty: 2,
      prompt: t`Why can each Fourier coefficient $b_n$ be computed by one integral, without knowing the other coefficients?`,
      choices: [
        t`Because the sines are orthogonal: multiplying the series by $\sin\frac{m\pi x}{L}$ and integrating leaves only the $m$-th term`,
        'Because the series has only finitely many nonzero terms',
        t`Because $f$ is zero at the ends`,
        'Because the coefficients fall off fast enough to ignore the others',
      ],
      answer: 0,
      why: {
        1: 'Most series have infinitely many nonzero terms; the trick works term by term regardless.',
        2: 'The zero ends make a sine series natural, but they are not why the coefficients separate.',
        3: 'No approximation is involved: the other terms integrate to exactly zero.',
      },
      hints: [t`What is $\int_0^L \sin\frac{m\pi x}{L}\sin\frac{n\pi x}{L}\,dx$ for $m \ne n$?`],
      teach: 'Orthogonality makes each coefficient a projection: integrate against one eigenfunction and every other term drops out.',
      explain: t`$\int_0^L f\sin\frac{m\pi x}{L}dx = \sum_n b_n\int_0^L\sin\frac{n\pi x}{L}\sin\frac{m\pi x}{L}dx = b_m\cdot\frac{L}{2}$. It is the same as finding a vector’s components along perpendicular unit vectors with dot products — the subject of the next lesson.`,
      visual: fpic('sin(pi*x)*sin(2*pi*x)', [0, 1], [-1.1, 1.1], t`The product of modes 1 and 2 on $[0, 1]$: equal areas above and below the axis.`, { xlabel: 'x', ylabel: '', shade: [{ fn: 'max(sin(pi*x)*sin(2*pi*x), 0)', from: 0, to: 1, color: 'accent', alpha: 0.25 }, { fn: 'min(sin(pi*x)*sin(2*pi*x), 0)', from: 0, to: 1, color: 'bad', alpha: 0.25 }], curves: [{ fn: 'sin(pi*x)', color: 'violet', dash: true, width: 1.3 }, { fn: 'sin(2*pi*x)', color: 'teal', dash: true, width: 1.3 }] }),
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §4.2–4.4 (Fourier series, convergence, sine and cosine series) and §4.7', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'P. Dawkins, Paul’s Online Notes: Fourier sine series', url: 'https://tutorial.math.lamar.edu/Classes/DE/FourierSineSeries.aspx' },
    { label: 'SciPy documentation: scipy.integrate.quad', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.integrate.quad.html' },
  ],
});
