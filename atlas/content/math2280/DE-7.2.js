// Frobenius' method at a regular singular point — y = x^r Σ aₙxⁿ, the
// indicial equation, the logarithm when the roots coincide — and Bessel's
// equation with its series J_ν. Bessel zeros as the tones of a drum (not
// harmonic), the 1.22 of the Airy disk as j₁,₁/π, and the tangential acoustic
// mode of a rocket combustion chamber.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, tex, frac } from '../../src/core/format.js';
import { r6, jExpr, y0Expr, besselJ, besselZero, besselZeroP } from './_second.js';

const t = String.raw;
const TAU = 6.283185307;

const JNU = '(-1)^k*(x/2)^(2k + nu)/(gamma(k + 1)*gamma(k + nu + 1))';

/** The (m, n) mode of a circular drumhead, z = J_m(j_{m,n} r) cos mθ, as a still 3D picture. */
function drumPic(m, n, { kind = 'membrane', caption } = {}) {
  const j = kind === 'membrane' ? besselZero(m, n) : besselZeroP(m, n);
  let big = 0;
  for (let i = 0; i <= 200; i++) big = Math.max(big, Math.abs(besselJ(m, (j * i) / 200)));
  const amp = r6(0.42 / big);
  return {
    type: 'surface3d',
    params: {
      aspect: 'wide', surface: ['u*cos(v)', 'u*sin(v)', `${amp}*${jExpr(m, `${r6(j)}*u`, j + 0.3)}*cos(${m}*v)`],
      domain: [[0, 1], [0, TAU]], n: 40, axes: false, dist: 3.6, pitch: kind === 'membrane' ? 0.42 : 0.7, yaw: kind === 'membrane' ? -0.7 : 0.25, alpha: 0.92,
      curves: [{ param: ['cos(t)', 'sin(t)', '0'], t: [0, TAU], color: kind === 'membrane' ? 'ink2' : 'ink3', width: kind === 'membrane' ? 2 : 1.2 }],
    },
    caption,
  };
}

/** Airy-disk intensity [2J₁(u)/u]² against u. */
const AIRY_I = `(2*${jExpr(1, 'x', 13)}/x)^2`;

export default lesson({
  id: 'math2280.DE-7.2',
  title: 'Frobenius’ method and Bessel’s equation',
  minutes: 15, difficulty: 4,
  intro: t`At a **regular singular point** — say $x = 0$ for $x^2y'' + x\,p(x)\,y' + q(x)\,y = 0$ with $p$ and $q$ smooth — a plain power series can fail, but a **Frobenius series** $y = x^r\sum a_nx^n$ works. The power $r$ comes from the **indicial equation** $r(r - 1) + p(0)\,r + q(0) = 0$; when its two roots coincide (or differ by an integer) the second solution may carry a $\ln x$. The most important case is **Bessel’s equation**, the radial equation of anything round — a drumhead, a telescope’s aperture, the inside of a combustion chamber:

$$x^2y'' + x\,y' + (x^2 - \nu^2)\,y = 0, \qquad J_\nu(x) = \sum_{m=0}^{\infty}\frac{(-1)^m}{m!\,\Gamma(m + \nu + 1)}\left(\frac{x}{2}\right)^{2m + \nu}.$$

Its indicial roots are $r = \pm\nu$, and the root $r = \nu$ gives the Bessel function $J_\nu$, finite at the centre. Its zeros are not evenly spaced — which is why a drum does not sound like a string.`,
  symbols: [
    { tex: 'x', text: 'a scaled radius, $x = kr$: distance from the centre times a wavenumber' },
    { tex: '\\nu', text: 'the order: for a drum or an aperture, the number of nodal diameters of the pattern' },
    { tex: 'r', text: 'the Frobenius exponent: the solution starts like $x^r$ near the singular point' },
    { tex: 'p(0),\\ q(0)', text: 'the values at the singular point of $p = x\\cdot(\\text{coefficient of }y\')$ and $q = x^2\\cdot(\\text{coefficient of }y)$ in standard form; they fix the indicial equation' },
    { tex: '\\Gamma', text: 'the gamma function, which extends the factorial: $\\Gamma(n + 1) = n!$' },
    { tex: 'J_\\nu(x)', text: 'the Bessel function of the first kind: the solution of Bessel’s equation that is finite at $x = 0$' },
    { tex: 'j_{\\nu,n}', text: 'the $n$th positive zero of $J_\\nu$: $j_{0,1} = 2.405$, $j_{1,1} = 3.832$, …' },
  ],
  why: t`Bessel functions are the radial half of every wave in a cylinder or a disk — drum modes, optical fibres, waveguides, the diffraction rings of every telescope, the acoustic modes that can tear a rocket engine apart.`,
  visual: {
    type: 'graph',
    title: 'Bessel functions from their series',
    lead: t`The dashed curve is $J_\nu$ summed to 41 terms — exact on this picture — and the blue one the partial sum through the term $m = N$. The grey lines are $\pm\sqrt{2/(\pi x)}$, the envelope the swings settle into far out.`,
    tasks: [
      t`At $\nu = 0$, $J_0$ starts at 1 and swings inside a slowly shrinking envelope, like a damped cosine — but its zeros, 2.405, 5.520, 8.654, …, are not evenly spaced near the centre; only far out do they approach $\pi$ apart.`,
      t`Raise $\nu$: $J_\nu$ starts like $x^\nu$ — flatter at the centre — and its first zero moves out. At $\nu = 1$ the first zero is 3.832, and $3.832/\pi = 1.22$: the 1.22 of a telescope’s diffraction limit.`,
      t`Lower $N$: the partial sum follows $J_\nu$ only out to about $x \approx 0.8N$. The series converges everywhere — Bessel’s equation has no other singular point — but far out it needs many terms.`,
    ],
    params: {
      x: [0, 20], y: [-0.65, 1.15], aspect: 'wide', xlabel: 'x', ylabel: 'J',
      sliders: [
        { key: 'nu', label: 'Order $\\nu$', min: 0, max: 3, step: 0.1, value: 0, explain: 'Any real order is allowed; integer orders describe patterns with $\\nu$ nodal diameters.' },
        { key: 'N', label: 'Partial sum through $m = N$', min: 0, max: 30, step: 1, value: 8, explain: 'How many terms of the series are added.' },
      ],
      curves: [
        { fn: 'sqrt(2/(pi*x))', domain: [0.6, 20], color: 'ink4', width: 1.2, dash: true },
        { fn: '-sqrt(2/(pi*x))', domain: [0.6, 20], color: 'ink4', width: 1.2, dash: true },
        { sum: JNU, k: [0, 40], color: 'ink2', width: 1.6, dash: true },
        { sum: JNU, k: [0, 'N'], color: 'accent', width: 2.4 },
      ],
      points: [
        ...[2.4048, 5.5201, 8.6537].map((x) => ({ x, y: 0, color: 'gold', r: 4, label: String(x.toFixed(3)), labelDx: -14, labelDy: 16, when: 'step(0.05 - nu)' })),
        ...[3.8317, 7.0156].map((x) => ({ x, y: 0, color: 'gold', r: 4, label: String(x.toFixed(3)), labelDx: -14, labelDy: 16, when: 'step(0.05 - abs(nu - 1))' })),
      ],
    },
    caption: t`Dashed: $J_\nu$ (41 terms). Blue: the partial sum. Grey: the large-$x$ envelope $\pm\sqrt{2/\pi x}$. Gold: the first zeros, marked for $\nu = 0$ and $\nu = 1$.`,
  },
  example: {
    prompt: t`Find the Frobenius series of Bessel’s equation of order 0, $x^2y'' + xy' + x^2y = 0$, and use its first zero to find the lowest note of a drumhead of radius $a = 0.30$ m whose transverse waves travel at $c = 120$ m/s. Its displacement in the lowest mode is $u = J_0(kr)\cos\omega t$ with $\omega = ck$, and the rim cannot move.`,
    visual: drumPic(0, 1, { caption: 'The drumhead’s lowest mode, J₀(2.405 r/a): the whole skin moves together, most at the centre, not at all at the rim. Displacement greatly exaggerated; drag to turn.' }),
    steps: [
      { label: 'A regular singular point', text: t`In standard form $y'' + \tfrac1x y' + y = 0$: the coefficient $1/x$ blows up at 0, but $x\cdot\tfrac1x = 1$ and $x^2\cdot1 = x^2$ are smooth, so $p(0) = 1$, $q(0) = 0$. Try $y = \sum a_nx^{n+r}$.` },
      { label: 'Indicial equation', text: t`Substituting, the lowest power $x^r$ gives $\big[r(r - 1) + r\big]a_0 = r^2a_0 = 0$: $r = 0$, a **double** root.` },
      { label: 'Recurrence', text: t`The $x^{n+r}$ terms give $(n + r)^2a_n + a_{n-2} = 0$. With $r = 0$: $a_n = -\dfrac{a_{n-2}}{n^2}$, and $a_1 = 0$ kills every odd term.` },
      { label: 'The series', text: t`$a_2 = -\tfrac14$, $a_4 = \tfrac1{64}$, $a_6 = -\tfrac{1}{2304}$, …: $J_0(x) = 1 - \dfrac{x^2}{4} + \dfrac{x^4}{64} - \dfrac{x^6}{2304} + \cdots = \sum_m \dfrac{(-1)^m}{(m!)^2}\left(\dfrac x2\right)^{2m}$. The double root means the second solution, $Y_0$, contains $\ln x$ and is infinite at the centre — impossible for a drum.` },
      { label: 'The rim', text: t`The rim cannot move: $J_0(ka) = 0$. Summing the series and searching for its first zero gives $ka = 2.405$, so $k = 2.405/0.30 = 8.02$ m⁻¹.` },
      { label: 'The note', text: t`$f = \dfrac{\omega}{2\pi} = \dfrac{ck}{2\pi} = \dfrac{2.405\times120}{2\pi\times0.30} = 153$ Hz. Sense check: a string of length $2a$ with the same wave speed would give $c/(4a) = 100$ Hz; the round membrane is stiffer, and its overtones are not whole multiples of 153 Hz.` },
    ],
    answer: t`$J_0(x) = 1 - \tfrac{x^2}{4} + \tfrac{x^4}{64} - \cdots$; the drum’s lowest note is $f = 2.405\,c/(2\pi a) \approx 153$ Hz.`,
  },
  practice: [
    num({
      id: 'indicial', difficulty: 2,
      gen(r) {
        const V = r.pick([
          { A: 2, B: 3, C: -1, D: -1, r1: 0.5, r2: -1 },
          { A: 2, B: 1, C: 0, D: 1, r1: 0.5, r2: 0 },
          { A: 3, B: 2, C: 0, D: 1, r1: 1 / 3, r2: 0 },
          { A: 4, B: 0, C: -3, D: 1, r1: 1.5, r2: -0.5 },
          { A: 9, B: 9, C: -1, D: 1, r1: 1 / 3, r2: -1 / 3 },
        ]);
        const { A, B, C, D, r1, r2 } = V;
        const p0 = B / A, q0 = C / A;
        const wrongDisc = Math.sqrt(p0 * p0 - 4 * q0), wrong = (-p0 + wrongDisc) / 2;
        const term = (c, s) => (c === 0 ? '' : `${c < 0 ? ' - ' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}${s}`);
        const coefY = C === 0 ? `${D === 1 ? '' : D === -1 ? '-' : D}x` : `${C}${D > 0 ? ' + ' : ' - '}${Math.abs(D) === 1 ? '' : Math.abs(D)}x`;
        return {
          prompt: t`$x = 0$ is a regular singular point of $${A}x^2y''${term(B, 'x\\,y\'')} + (${coefY})\,y = 0$. What is the larger root $r$ of its indicial equation?`,
          answer: r1, tol: { rel: 1e-6, abs: 1e-6 },
          errors: [
            { value: r2, feedback: t`That is the smaller root. Both roots of $r(r - 1) + p(0)r + q(0) = 0$ matter; the question asks for the larger.` },
            ...(Number.isFinite(wrong) && Math.abs(wrong - r1) > 1e-6 && Math.abs(wrong - r2) > 1e-6 ? [{ value: wrong, feedback: t`The indicial equation is $r(r - 1) + p(0)\,r + q(0) = 0$ — the $r(r - 1)$ comes from $x^2y''$; it is not $r^2 + p(0)r + q(0)$.` }] : []),
          ],
          hints: [t`Divide by ${A}: $x^2y''${p0 === 0 ? '' : ` + ${p0 === 1 ? '' : `${frac(p0)}\,`}x\,y'`} + \tfrac{${coefY}}{${A}}\,y = 0$, so $p(0) = ${frac(p0)}$ and $q(0) = ${frac(q0)}$.`, t`Solve $r(r - 1) + ${frac(p0)}\,r ${q0 < 0 ? '-' : '+'} ${frac(Math.abs(q0))} = 0$, that is $${A}r^2${term(B - A, 'r')}${term(C, '')} = 0$.`],
          teach: 'The indicial equation r(r − 1) + p(0)r + q(0) = 0 comes from the lowest power of x when y = xʳ(a₀ + …) is substituted.',
          explain: t`$${A}r(r - 1) + ${B}r ${C < 0 ? '-' : '+'} ${Math.abs(C)} = ${A}r^2${term(B - A, 'r')}${term(C, '')} = 0$ has roots $r = ${frac(r1)}$ and $r = ${frac(r2)}$. Their difference, $${frac(r1 - r2)}$, ${Number.isInteger(r1 - r2) ? 'is an integer, so the second solution may need a logarithm' : 'is not an integer, so both give Frobenius series'}.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 2.5], y: [-3, 5], aspect: 'wide', xlabel: 'x', ylabel: '',
              curves: [
                { fn: `${p0}/x`, domain: [0.12, 2.5], color: 'warn', width: 2, dash: true, label: 'p(x)/x', labelAt: 0.25, labelDx: 8, labelDy: -2 },
                { fn: `${p0}`, color: 'accent', width: 2.4, label: 'x · (y′ coefficient)', labelAt: 1.6, labelDx: -40, labelDy: -10 },
                { fn: `(${C} + ${D}*x)/${A}`, color: 'violet', width: 2.4, label: 'x² · (y coefficient)', labelAt: 1.9, labelDx: -70, labelDy: 18 },
              ],
            },
            caption: 'In standard form the coefficient of y′ blows up at x = 0 (orange, dashed), but multiplied by x it is smooth (blue) — and so is x² times the coefficient of y (violet). That is what makes x = 0 a regular singular point.',
          },
        };
      },
    }),
    mcq({
      id: 'irregular', difficulty: 3,
      prompt: t`At $x = 0$, for which equation is Frobenius’ method **not** guaranteed to work?`,
      choices: [
        t`$x^3y'' + xy' + y = 0$`,
        t`$x^2y'' + xy' + (x^2 - 1)y = 0$`,
        t`$xy'' + y' + y = 0$`,
        t`$(1 + x^2)y'' + xy' + y = 0$`,
      ],
      answer: 0,
      why: {
        1: t`Bessel’s equation of order 1: $x\cdot\tfrac{x}{x^2} = 1$ and $x^2\cdot\tfrac{x^2 - 1}{x^2} = x^2 - 1$ are smooth, so 0 is a regular singular point.`,
        2: t`Standard form $y'' + \tfrac1x y' + \tfrac1x y = 0$: $x\cdot\tfrac1x = 1$ and $x^2\cdot\tfrac1x = x$ are smooth — regular.`,
        3: t`Here $x = 0$ is an ordinary point: the coefficients are smooth there, and a plain power series works (Frobenius is not even needed).`,
      },
      hints: [t`Divide by the coefficient of $y''$ and check whether $x\,p(x)$ and $x^2q(x)$ stay finite at 0.`, t`For $x^3y'' + xy' + y = 0$: $p = 1/x^2$, so $x\,p = 1/x$ — still infinite.`],
      teach: 'Frobenius works at a regular singular point — where x·p(x) and x²·q(x) are smooth; at an irregular one it can fail.',
      explain: t`$x^3y'' + xy' + y = 0$ gives $p = 1/x^2$ and $q = 1/x^3$: $x\,p = 1/x$ and $x^2q = 1/x$ both blow up, so $x = 0$ is an **irregular** singular point and no Frobenius series need exist. The others are regular singular (two) or ordinary (one).`,
    }),
    num({
      id: 'bessel-coefficient', difficulty: 2,
      gen(r) {
        const nu = r.pick([0, 1, 2]);
        const a2 = -1 / (2 * (2 + 2 * nu)), a4 = -a2 / (4 * (4 + 2 * nu));
        return {
          prompt: t`For Bessel’s equation of order $\nu = ${nu}$, the Frobenius series $y = ${nu ? `x^{${nu}}` : ''}\sum a_nx^n$ (with $r = \nu$) obeys $a_n = -\dfrac{a_{n-2}}{n(n + 2\nu)}$. Starting from $a_0 = 1$, find $a_4$.`,
          answer: a4, tol: { rel: 1e-6 },
          errors: nu > 0 ? [{ value: 1 / 64, feedback: t`That is the order-0 value. Here the denominators are $n(n + ${2 * nu})$: $a_2 = -\tfrac{1}{2\cdot${2 + 2 * nu}}$ and $a_4 = -\tfrac{a_2}{4\cdot${4 + 2 * nu}}$.` }] : [{ value: 1 / 16, feedback: t`Each step divides by $n(n + 2\nu) = n^2$ here: $a_2 = -\tfrac14$, then $a_4 = -\tfrac{a_2}{16}$.` }],
          hints: [t`$a_2 = -\dfrac{a_0}{2(2 + ${2 * nu})}$.`, t`$a_4 = -\dfrac{a_2}{4(4 + ${2 * nu})}$.`],
          teach: t`Bessel’s recurrence $a_n = -a_{n-2}/\big(n(n + 2\nu)\big)$ builds $J_\nu$ two powers at a time.`,
          explain: t`$a_2 = ${frac(a2)}$ and $a_4 = ${frac(a4)}$, so $y = x^{${nu}}\left(1 ${frac(a2).startsWith('-') ? '-' : '+'} ${frac(Math.abs(a2))}x^2 + ${frac(a4)}x^4 - \cdots\right)$ — a multiple of $J_{${nu}}(x)$ (which uses $a_0 = 1/(2^{${nu}}\,${nu}!)$).`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 6], y: [-0.6 * [1, 1.2, 4][nu], 1.15 * [1, 1.2, 4][nu]], aspect: 'wide', xlabel: 'x', ylabel: '',
              curves: [
                { sum: JNU.replace(/nu/g, String(nu)).replace('(-1)^k', `(-1)^k*${2 ** nu * [1, 1, 2][nu]}`), k: [0, 30], color: 'ink3', width: 1.4, dash: true },
                { fn: `x^${nu}*(1 + ${r6(a2)}*x^2)`, color: 'gold', width: 2, label: 'through a₂', labelAt: 2.6, labelDx: 6, labelDy: 0 },
              ],
            },
            caption: t`The series through the $a_2$ term (gold) against the whole series (dashed): the next term, $a_4x^4$, starts to bend it back.`,
          },
        };
      },
    }),
    num({
      id: 'drum-overtone', difficulty: 2,
      gen(r) {
        const [m, n, label] = r.pick([[1, 1, 'one nodal diameter'], [2, 1, 'two nodal diameters'], [0, 2, 'one nodal circle']]);
        const f0 = r.pick([90, 120, 150]);
        const ratio = besselZero(m, n) / besselZero(0, 1), f = f0 * ratio;
        return {
          prompt: t`A drumhead’s lowest mode sounds at ${f0} Hz. Its mode with ${label} has the radial shape $J_{${m}}(kr)$ with $ka = j_{${m},${n}}$. Using $j_{0,1} = 2.405$, $j_{1,1} = 3.832$, $j_{2,1} = 5.136$ and $j_{0,2} = 5.520$, at what frequency does that mode sound?`,
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: 2 * f0, feedback: 'A string’s overtones are whole multiples of its fundamental; a drum’s are not. Frequencies go as the Bessel zeros: f ∝ j.' }],
          hints: [t`Every mode has $\omega = ck$, so frequencies are in the ratio of the zeros: $f/f_{0,1} = j_{${m},${n}}/j_{0,1}$.`],
          teach: 'A circular membrane’s modes sound at frequencies proportional to Bessel zeros — not whole multiples of the fundamental.',
          explain: t`$f = ${f0}\times\dfrac{${besselZero(m, n).toFixed(3)}}{2.405} = ${tex(f, 4)}$ Hz, a ratio of ${ratio.toFixed(3)}. The overtones 1.593, 2.136, 2.295, … of a plain membrane are not harmonics, which is why most drums have no clear pitch.`,
          visual: drumPic(m, n, { caption: `The (${m}, ${n}) mode: ${label}, where the skin stays still. Displacement exaggerated; drag to turn.` }),
        };
      },
    }),
    mcq({
      id: 'log-solution', difficulty: 2,
      prompt: t`Bessel’s equation of order 0 has a double indicial root, $r = 0$. Its second solution, $Y_0(x)$, contains $\tfrac{2}{\pi}\ln x\,J_0(x)$. Why does the vibration of a drumhead use only $J_0$?`,
      choices: [
        t`$Y_0 \to -\infty$ at the centre, $x = 0$, but the skin’s displacement there must be finite`,
        t`$Y_0$ does not satisfy Bessel’s equation`,
        t`$Y_0$ is a constant multiple of $J_0$`,
        t`$Y_0$ never vanishes, so it cannot meet the rim condition`,
      ],
      answer: 0,
      why: {
        1: t`$Y_0$ is a genuine solution — the second member of a fundamental set — just not one that a drum allows.`,
        2: t`The $\ln x$ makes it independent of $J_0$: their Wronskian is $2/(\pi x) \neq 0$.`,
        3: t`$Y_0$ has infinitely many zeros, like $J_0$; it is ruled out by the centre, not by the rim.`,
      },
      hints: [t`What does $\ln x$ do as $x \to 0$?`, 'A physical drumhead has a finite displacement at its centre.'],
      teach: 'The logarithm of a repeated indicial root makes the second solution singular at the centre — a boundedness condition throws it out.',
      explain: t`Near 0, $Y_0 \approx \tfrac2\pi\ln x \to -\infty$. Finiteness at the centre forces the coefficient of $Y_0$ to vanish, leaving $J_0$; the rim then picks the allowed $k$. In a ring-shaped region (a washer, a coaxial cable) the centre is excluded and $Y_0$ comes back.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 15], y: [-1.6, 1.15], aspect: 'wide', xlabel: 'x', ylabel: '',
          curves: [
            { fn: jExpr(0, 'x', 15.5), color: 'accent', width: 2.4, label: 'J₀', labelAt: 0.6, labelDx: 6, labelDy: -10 },
            { fn: y0Expr('x', 15.5), domain: [0.06, 15], color: 'violet', width: 2.4, label: 'Y₀', labelAt: 0.45, labelDx: 8, labelDy: 6 },
          ],
        },
        caption: 'The two independent solutions of Bessel’s equation of order 0: J₀ (blue) and Y₀ (violet), which plunges to −∞ at x = 0.',
      },
    }),
    code({
      id: 'bessel-series', difficulty: 3,
      prompt: t`Write \`J(nu, x)\` that sums 60 terms of the series $J_\nu(x) = \sum_m \dfrac{(-1)^m}{m!\,\Gamma(m + \nu + 1)}\left(\dfrac x2\right)^{2m + \nu}$ (use \`math.factorial\` and \`math.gamma\`), and \`first_zero()\` that finds the first positive zero of $J_0$ by bisection on $[2, 3]$. Compare both with \`scipy.special.jv\` and \`scipy.special.jn_zeros\`.`,
      starter: t`import math
from scipy.special import jv, jn_zeros

def J(nu, x, terms=60):
    pass

def first_zero():
    pass
`,
      answer: t`import math
from scipy.special import jv, jn_zeros

def J(nu, x, terms=60):
    return sum((-1)**m * (x / 2)**(2*m + nu) / (math.factorial(m) * math.gamma(m + nu + 1))
               for m in range(terms))

def first_zero(a=2.0, b=3.0):
    for _ in range(60):
        c = (a + b) / 2
        if J(0, a) * J(0, c) <= 0:
            b = c
        else:
            a = c
    return (a + b) / 2

print(J(0, 2.5), jv(0, 2.5))
print(J(1.5, 7.0), jv(1.5, 7.0))
print(first_zero(), jn_zeros(0, 1)[0])`,
      tests: [
        { name: t`$J_0(0) = 1$`, code: 'abs(J(0, 0.0) - 1) < 1e-15' },
        { name: t`$J_0(2.5)$ agrees with \`scipy.special.jv\``, code: 'abs(J(0, 2.5) - jv(0, 2.5)) < 1e-12' },
        { name: t`a non-integer order works too: $J_{1.5}(7)$`, code: 'abs(J(1.5, 7.0) - jv(1.5, 7.0)) < 1e-10' },
        { name: t`the first zero of $J_0$ is 2.404825…`, code: 'abs(first_zero() - jn_zeros(0, 1)[0]) < 1e-10' },
      ],
      hints: [t`\`return sum((-1)**m * (x/2)**(2*m + nu) / (math.factorial(m) * math.gamma(m + nu + 1)) for m in range(terms))\`.`, t`Bisection: keep the half of $[a, b]$ on which $J_0$ changes sign — if \`J(0, a) * J(0, c) <= 0\` the zero is in $[a, c]$ — and repeat 60 times.`],
      teach: 'A special function is first of all a series you can sum; libraries add clever methods for large arguments, but they must agree with it.',
      explain: t`Sixty terms are far more than enough for $x \le 10$: the terms shrink like $(x/2)^{2m}/(m!)^2$. Bisection halves the bracket each step, so 60 steps pin the zero to machine precision: $j_{0,1} = 2.404825557695773$. Both agree with SciPy, which uses asymptotic and recurrence methods instead.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-airy-disk', difficulty: 3, transfer: true,
      gen(r) {
        const [name, D] = r.pick([['one of the VLT’s 8.2 m mirrors', 8.2], ['the 39 m Extremely Large Telescope', 39]]);
        const lam = r.pick([1.65, 2.2]);
        const u1 = besselZero(1, 1), th = (u1 * lam * 1e-6) / (Math.PI * D), mas = th * (180 / Math.PI) * 3600 * 1000;
        return {
          prompt: t`Through a circular aperture of diameter $D$, a star’s image has intensity $I(\theta) \propto \left[\dfrac{2J_1(u)}{u}\right]^2$ with $u = \dfrac{\pi D}{\lambda}\sin\theta$. The first dark ring falls at the first zero of $J_1$, $u = 3.8317$. For ${name} observing at $\lambda = ${lam}\ \mu\text{m}$, at what angle is the first dark ring, in milliarcseconds?`,
          answer: mas, units: 'mas', tol: { rel: 0.005 },
          errors: [
            { value: (lam * 1e-6 / D) * (180 / Math.PI) * 3600 * 1000, feedback: t`That is $\lambda/D$, a slit’s first dark fringe. For a circle the zero of $J_1$ gives $\sin\theta = \dfrac{3.8317}{\pi}\dfrac{\lambda}{D} = 1.22\,\dfrac{\lambda}{D}$.` },
            { value: ((2.4048 * lam * 1e-6) / (Math.PI * D)) * (180 / Math.PI) * 3600 * 1000, feedback: t`2.405 is the first zero of $J_0$. The aperture’s pattern involves $J_1$, whose first zero is 3.8317.` },
          ],
          hints: [t`$\sin\theta = \dfrac{3.8317\,\lambda}{\pi D}$; for small angles $\theta \approx \sin\theta$ in radians.`, t`Convert: 1 rad $= 206\,265$ arcseconds $= 2.063\times10^{8}$ mas.`],
          teach: 'The 1.22 in a telescope’s diffraction limit is j₁,₁/π: the first zero of J₁ divided by π.',
          explain: t`$\theta = \dfrac{3.8317}{\pi}\dfrac{\lambda}{D} = 1.2197\times\dfrac{${lam}\times10^{-6}}{${D}} = ${tex(th, 3)}$ rad $= ${tex(mas, 3)}$ mas. This is the Rayleigh limit of the resolution-limits lesson ([PHYS 2220, O4.3](#/lesson/phys2220.O4.3)): its 1.22 is a Bessel zero over $\pi$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 12], y: [-0.02, 1.08], aspect: 'wide', xlabel: 'u = (πD/λ) sin θ', ylabel: 'intensity',
              curves: [
                { fn: AIRY_I, domain: [0.01, 12], color: 'accent', width: 2.4 },
                { fn: `30*${AIRY_I}`, domain: [3.2, 12], color: 'ink3', width: 1.2, dash: true, label: '× 30', labelAt: 5.2, labelDx: 6, labelDy: -8 },
              ],
              points: [{ x: 3.8317, y: 0, color: 'gold', r: 4, label: 'u = 3.83', labelDx: -20, labelDy: 16 }, { x: 7.0156, y: 0, color: 'gold', r: 4, label: '7.02', labelDx: -10, labelDy: 16 }],
            },
            caption: t`The Airy pattern’s intensity across the star’s image (blue) and the faint rings magnified 30 times (dashed). Its dark rings are the zeros of $J_1$. Ideal optics, one wavelength.`,
          },
        };
      },
    }),
    num({
      id: 'cp-combustion', difficulty: 4, transfer: true,
      gen(r) {
        const R = r.pick([0.2, 0.3, 0.45]), c = r.pick([1000, 1200]);
        const jp = besselZeroP(1, 1), f = (jp * c) / (2 * Math.PI * R);
        return {
          prompt: t`The most dangerous acoustic mode in a rocket’s cylindrical combustion chamber is often the **first tangential** mode, a pressure wave sloshing round the chamber with the shape $p = J_1(kr)\cos\theta$. The rigid wall at $r = R$ allows no flow through it, so $\partial p/\partial r = 0$ there: $kR$ must be a zero of $J_1'$, the first being $j'_{1,1} = 1.8412$. For a chamber of radius ${R} m filled with hot gas in which sound travels at ${c} m/s, at what frequency does this mode oscillate? ($f = ck/2\pi$.)`,
          answer: f, units: 'Hz', tol: { rel: 0.005 },
          errors: [
            { value: (besselZero(1, 1) * c) / (2 * Math.PI * R), feedback: t`3.832 is a zero of $J_1$ itself — the condition for a wall where the pressure vanishes. A rigid wall needs a zero of $J_1'$: 1.8412.` },
            { value: c / (2 * Math.PI * R), feedback: t`$k$ is not $1/R$: the wall condition makes $kR = 1.8412$.` },
          ],
          hints: [t`$k = 1.8412/R$, then $f = \dfrac{ck}{2\pi}$.`, t`$f = \dfrac{1.8412\times${c}}{2\pi\times${R}}$.`],
          teach: 'Acoustic modes of a cylinder are Bessel functions; a rigid wall picks zeros of their derivative, and the first tangential mode sits at j′₁,₁ = 1.841.',
          explain: t`$k = 1.8412/${R} = ${tex(jp / R, 3)}$ m⁻¹ and $f = \dfrac{${c}\times${tex(jp / R, 3)}}{2\pi} = ${tex(f, 4)}$ Hz — kilohertz, as observed in combustion instability. If the burning couples to this frequency it can grow until it destroys the injector; large engines such as the F-1 of Saturn V needed baffles on the injector face to break up tangential modes.`,
          visual: drumPic(1, 1, { kind: 'neumann', caption: 'The first tangential mode across the chamber’s cross-section: pressure high on one side and low on the other, with a node line across the middle; the pattern spins or sloshes round. The grey circle marks the wall, where the pressure’s slope across the wall is zero because no gas can flow out. Amplitude exaggerated.' }),
        };
      },
    }),
    num({
      id: 'cp-indicial', difficulty: 2,
      gen(r) {
        const nu = r.pick([0.5, 1.5, 2.5, 1 / 3]);
        return {
          prompt: t`Bessel’s equation of order $\nu = ${frac(nu)}$, $x^2y'' + xy' + (x^2 - ${frac(nu * nu)})y = 0$, has a regular singular point at $x = 0$. What is the positive root of its indicial equation?`,
          answer: nu, tol: { rel: 1e-6 },
          errors: [{ value: nu * nu, feedback: t`The indicial equation is $r(r - 1) + r - \nu^2 = r^2 - \nu^2 = 0$, so $r = \pm\nu$ — not $\nu^2$.` }],
          hints: [t`$p(0) = 1$ and $q(0) = -\nu^2$, so the indicial equation is $r(r - 1) + r - \nu^2 = 0$.`],
          teach: t`For Bessel’s equation the indicial roots are $\pm\nu$, so $J_\nu$ starts like $x^\nu$.`,
          explain: t`$r^2 - ${frac(nu * nu)} = 0$ gives $r = \pm${frac(nu)}$. The positive root gives $J_{${frac(nu)}}$, which starts like $x^{${frac(nu)}}$; the roots differ by $${frac(2 * nu)}$${Number.isInteger(2 * nu) ? ', an integer — yet for half-integer orders the second series still exists, without a logarithm' : ''}.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 6], y: [-0.5, 1], aspect: 'wide', xlabel: 'x', ylabel: '',
              curves: [{ sum: JNU.replace(/nu/g, `(${r6(nu)})`), k: [0, 30], color: 'accent', width: 2.4 }],
            },
            caption: 'The Frobenius solution that stays finite at the centre, J of this order: near x = 0 it rises like a power of x.',
          },
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §7.3 Singular points and the method of Frobenius', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'NIST Digital Library of Mathematical Functions, Ch. 10 Bessel functions', url: 'https://dlmf.nist.gov/10' },
    { label: 'OpenStax University Physics Vol. 2, §4.6 Circular apertures and resolution', url: 'https://openstax.org/books/university-physics-volume-2/pages/4-6-circular-apertures-and-resolution' },
  ],
});
