// Functional derivatives: δF/δφ(x) defined by the first variation
// δF = ∫(δF/δφ)η dx, the Euler–Lagrange operator ∂L/∂φ − (∂L/∂φ′)′ for local
// functionals, δφ(y)/δφ(x) = δ(x − y), gradient flows (the heat equation as
// steepest descent of the Dirichlet energy), the Beltrami first integral, and
// the catenary as the profile of a soap film between two rings (catenoid),
// with Goldschmidt's limit d/R ≈ 1.3255 and the unstable second branch.
// Overlaps: phys3550 M3 (Euler–Lagrange, brachistochrone, the hanging chain)
// and st-g G5.1 (functional derivatives of fields) are linked.
import { lesson, mcq, num } from '../../src/core/content.js';
import { SF, SRC, gpic, r3, r4, PI } from './_sf.js';

const t = String.raw;
const sep = (c) => 2 * c * Math.acosh(1 / c);                        // ring separation for neck radius c (R = 1)
const C_MAX = SF.roots((c) => Math.acosh(1 / c) - 1 / Math.sqrt(1 - c * c), 0.2, 0.95, 0.001)[0];
const D_MAX = sep(C_MAX);                                            // Goldschmidt's limit
const area = (c, d) => PI * c * (d + c * Math.sinh(d / c));
const EXC = SF.roots((c) => c * Math.cosh(1 / (2 * c)) - 1, 0.05, 2, 0.001);   // d = 1: both branches
const P_SAIL = (2 * 1361) / 299792458;
const EXVIS = gpic({ x: [-0.75, 0.75], y: [-1.2, 1.2], equal: true, xlabel: 'x', curves: EXC.flatMap((c, i) => [1, -1].map((sg) => ({ fn: `${sg}*${c}*cosh(x/${c})`, domain: [-0.5, 0.5], color: i ? 'accent' : 'warn', width: i ? 2.4 : 1.6, dash: i ? [] : [6, 4] }))), points: [-0.5, 0.5].flatMap((x) => [1, -1].map((y) => ({ x, y, color: 'gold', r: 5 }))) }, `Both catenaries through the rings at d = 1: the stable one (blue, neck ${r3(EXC[1])}) and the unstable one (dashed, neck ${r3(EXC[0])}).`);                              // Pa: perfectly reflecting sail at 1 AU

export default lesson({
  id: 'st-e.E11.1',
  title: 'Functional derivatives',
  minutes: 16, difficulty: 3,
  intro: t`A **functional** $F[\varphi]$ turns a whole function into a number: a length, an area, an energy, an action. Its derivative with respect to the function is defined by how it responds to a small change $\varphi \to \varphi + \epsilon\eta$:

$$\delta F = \epsilon\int\frac{\delta F}{\delta\varphi(x)}\,\eta(x)\,dx + O(\epsilon^2), \qquad F = \int L(x, \varphi, \varphi')\,dx \;\Rightarrow\; \frac{\delta F}{\delta\varphi} = \frac{\partial L}{\partial\varphi} - \frac{d}{dx}\frac{\partial L}{\partial\varphi'}$$

for every $\eta$ vanishing at the ends — the integral of $\eta'$ is moved onto $\eta$ by parts. So $\delta F/\delta\varphi(x)$ is a **gradient with one component per point** $x$: the infinite-dimensional version of $\partial f/\partial x_i$, with $\int dx$ replacing $\sum_i$. Setting it to zero gives the Euler–Lagrange equation ([PHYS 3550](#/lesson/phys3550.M3.2)); following it downhill, $\partial_t\varphi = -\delta F/\delta\varphi$, gives diffusion; and in field theory and general relativity the field equations are $\delta S/\delta\varphi = 0$ for an action $S$ ([ST-G](#/lesson/st-g.G5.1)). This lesson’s example is a soap film stretched between two rings — the **catenary** as a minimal surface.`,
  symbols: [
    { tex: 'F[\\varphi]', text: 'a functional: a number that depends on the whole function $\\varphi$' },
    { tex: '\\frac{\\delta F}{\\delta\\varphi(x)}', text: 'the functional derivative: the change in $F$ per unit change of $\\varphi$ near the point $x$, per unit length' },
    { tex: 'L(x, \\varphi, \\varphi\')', text: 'the density (Lagrangian) being integrated' },
    { tex: '\\eta(x)', text: 'an arbitrary variation, zero at the ends; $\\epsilon$ is its small size' },
  ],
  why: t`Every field equation in physics — Maxwell’s, Schrödinger’s, Einstein’s — is a functional derivative set to zero, and every gradient-descent relaxation (heat flow, phase separation, numerical minimizers) follows $-\delta F/\delta\varphi$.`,
  visual: {
    type: 'graph',
    title: 'A soap film between two rings',
    lead: t`Two coaxial rings of radius $R = 1$ (gold) hold a soap film whose profile is a catenary $y = c\cosh(x/c)$ — the surface of revolution of least area, a **catenoid**. Choose the neck radius $c$; the rings sit wherever the catenary reaches height 1, a distance $d = 2c\operatorname{arcosh}(1/c)$ apart.`,
    tasks: [
      `Find the largest separation: d peaks at about ${r4(D_MAX)} when c ≈ ${r3(C_MAX)}. Pull the rings further apart and no catenoid exists — the film snaps into two discs.`,
      'Every d below the peak is reached twice: a fat-necked catenoid (large c) and a thin-necked one. Compare their areas.',
      'At small d the fat catenoid has less area than the two discs (2π ≈ 6.283); near the peak the discs win, so the film is only metastable there.',
    ],
    params: {
      x: [-1, 1], y: [-1.25, 1.25], equal: true, xlabel: 'x (along the axis)', ylabel: '', aspect: 'wide', axesAt: 'edge',
      sliders: [{ key: 'c', label: 'Neck radius $c$', min: 0.15, max: 0.98, step: 0.005, value: 0.75, unit: '', explain: 'The film’s radius at its narrowest point, in units of the ring radius.' }],
      curves: [
        { param: ['c*t*acosh(1/c)', 'c*cosh(t*acosh(1/c))'], t: [-1, 1], color: 'accent', width: 2.4 },
        { param: ['c*t*acosh(1/c)', '-c*cosh(t*acosh(1/c))'], t: [-1, 1], color: 'accent', width: 2.4 },
      ],
      vlines: [{ x: '-c*acosh(1/c)', color: 'ink4' }, { x: 'c*acosh(1/c)', color: 'ink4' }],
      points: [{ x: '-c*acosh(1/c)', y: 1, color: 'gold', r: 5 }, { x: 'c*acosh(1/c)', y: 1, color: 'gold', r: 5 }, { x: '-c*acosh(1/c)', y: -1, color: 'gold', r: 5 }, { x: 'c*acosh(1/c)', y: -1, color: 'gold', r: 5 }],
      readouts: [
        { label: 'separation $d =$', expr: '2*c*acosh(1/c)', digits: 4 },
        { label: 'film area $=$', expr: 'pi*c*(2*c*acosh(1/c) + c*sinh(2*acosh(1/c)))', digits: 4 },
        { label: 'two discs $2\\pi R^2 =$', expr: '2*pi', digits: 4 },
      ],
    },
    caption: 'A cross-section through the axis: the film’s profile above and below, the rings’ planes as thin lines and their edges as gold dots. Ideal film: constant surface tension, no gravity, no pressure difference.',
  },
  example: {
    prompt: t`Find the shape of a soap film between two coaxial rings of radius $R = 1$ a distance $d = 1$ apart: minimize the area $A[y] = 2\pi\displaystyle\int_{-1/2}^{1/2}y\sqrt{1 + y'^2}\,dx$ with $y(\pm\tfrac12) = 1$.`,
    visual: EXVIS,
    steps: [
      { label: 'Functional derivative', text: t`With $L = y\sqrt{1 + y'^2}$: $\dfrac{\delta A}{\delta y} \propto \sqrt{1 + y'^2} - \dfrac{d}{dx}\dfrac{yy'}{\sqrt{1 + y'^2}}$, which must vanish.` },
      { label: 'A first integral', text: t`$L$ has no explicit $x$, so the **Beltrami identity** applies: $L - y'\dfrac{\partial L}{\partial y'} = \dfrac{y}{\sqrt{1 + y'^2}}$ is constant along the solution — call it $c$.` },
      { label: 'Integrate', text: t`$y' = \sqrt{y^2/c^2 - 1}$ separates to $y = c\cosh\big((x - x_0)/c\big)$; symmetry puts $x_0 = 0$. The constant $c$ is the neck radius.` },
      { label: 'Fit the rings', text: t`$1 = c\cosh\big(1/(2c)\big)$ has two roots: $c = ${r4(EXC[1])}$ and $c = ${r4(EXC[0])}$.` },
      { label: 'Compare areas', text: t`$A = \pi c\big(d + c\sinh(d/c)\big)$ gives $${r4(area(EXC[1], 1))}$ and $${r4(area(EXC[0], 1))}$; two flat discs would cost $2\pi = ${r4(2 * PI)}$. Only the fat catenoid beats the discs — the thin one is a stationary point with more area (a saddle).` },
    ],
    answer: t`$y = c\cosh(x/c)$ with $c = ${r4(EXC[1])}$, area $${r4(area(EXC[1], 1))}$. A vanishing functional derivative means **stationary**, not minimal: the second root is stationary too, and beyond $d = ${r4(D_MAX)}$ no catenoid exists at all (Goldschmidt’s solution: two discs).`,
  },
  practice: [
    mcq({
      id: 'el-form', difficulty: 2,
      prompt: t`What is $\dfrac{\delta F}{\delta\varphi(x)}$ for $F[\varphi] = \displaystyle\int\Big(\tfrac12\varphi'^2 + V(\varphi)\Big)dx$?`,
      visual: gpic({ x: [0, 1], y: [-0.2, 1.3], xlabel: 'x', curves: [{ fn: 'sin(pi*x)', color: 'accent', width: 2.3, label: 'φ', labelAt: 0.25, labelDy: -6 }, { fn: 'sin(pi*x) + 0.15*e^(-((x - 0.6)/0.06)^2)', color: 'warn', width: 1.6, dash: [5, 4], label: 'φ + εη', labelAt: 0.75, labelDx: 6 }] }, 'A field φ and a varied field φ + εη, with η a narrow bump.'),
      choices: [t`$-\varphi'' + V'(\varphi)$`, t`$\varphi'' + V'(\varphi)$`, t`$-\varphi''$`, t`$\varphi' + V'(\varphi)$`],
      answer: 0,
      why: {
        1: t`Moving the derivative from $\eta'$ to $\eta$ by parts costs a minus sign: $\int\varphi'\eta' = -\int\varphi''\eta$.`,
        2: t`$V(\varphi)$ contributes $\partial L/\partial\varphi = V'(\varphi)$.`,
        3: t`$\partial L/\partial\varphi' = \varphi'$, but it still has to be differentiated: $-\frac{d}{dx}\varphi'$.`,
      },
      hints: [t`$\partial L/\partial\varphi = V'(\varphi)$ and $\partial L/\partial\varphi' = \varphi'$.`],
      teach: 'δF/δφ = ∂L/∂φ − d/dx ∂L/∂φ′: the second term comes from integrating by parts.',
      explain: t`$\dfrac{\delta F}{\delta\varphi} = V'(\varphi) - \varphi''$. Setting it to zero gives $\varphi'' = V'(\varphi)$ — a particle in the potential $-V$, with $x$ playing time. This is how static field solutions (kinks, domain walls) are found.`,
    }),
    num({
      id: 'fd-value', difficulty: 2,
      gen(r) {
        const x0 = r.pick([0.2, 0.25, 0.4, 0.5, 0.7]);
        const ans = PI * PI * Math.sin(PI * x0) + Math.sin(PI * x0) ** 2;
        return {
          prompt: t`For $F[\varphi] = \displaystyle\int_0^1\Big(\tfrac12\varphi'^2 + \tfrac13\varphi^3\Big)dx$, evaluate $\dfrac{\delta F}{\delta\varphi(x)}$ at $x = ${x0}$ for $\varphi = \sin\pi x$.`,
          visual: gpic({ x: [0, 1], y: [-0.1, 1.15], xlabel: 'x', curves: [{ fn: 'sin(pi*x)', color: 'accent', width: 2.3 }], vlines: [{ x: x0, color: 'gold' }] }, t`$\varphi = \sin\pi x$, with $x = ${x0}$ marked.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -PI * PI * Math.sin(PI * x0) + Math.sin(PI * x0) ** 2, feedback: t`$-\varphi'' = +\pi^2\sin\pi x$: two minus signs.` }, { value: PI * PI * Math.sin(PI * x0), feedback: t`Add $\partial L/\partial\varphi = \varphi^2$.` }, { value: PI * PI * Math.sin(PI * x0) + Math.sin(PI * x0) ** 3 / 3, feedback: t`Differentiate $\tfrac13\varphi^3$: it gives $\varphi^2$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$\delta F/\delta\varphi = -\varphi'' + \varphi^2$.`, t`$\varphi'' = -\pi^2\sin\pi x$.`],
          teach: 'A functional derivative is a function of x: evaluate it like any other once φ is given.',
          explain: t`$\pi^2\sin(${x0}\pi) + \sin^2(${x0}\pi) = ${r4(ans)}$. It is positive everywhere inside: increasing $\varphi$ anywhere would raise $F$, so $\sin\pi x$ is not stationary.`,
        };
      },
    }),
    mcq({
      id: 'delta', difficulty: 2,
      prompt: t`Treat the value of $\varphi$ at one point, $F[\varphi] = \varphi(y)$, as a functional. What is $\dfrac{\delta F}{\delta\varphi(x)}$?`,
      visual: gpic({ x: [0, 1], y: [-0.2, 1.3], xlabel: 'x', curves: [{ fn: '0.5 + 0.3*sin(2*pi*x)', color: 'accent', width: 2.3 }, { fn: '0.5 + 0.3*sin(2*pi*x) + 0.5*e^(-((x - 0.3)/0.03)^2)', color: 'warn', width: 1.6, dash: [5, 4] }], vlines: [{ x: 0.6, color: 'gold', label: 'y' }] }, 'A bump at x = 0.3 changes φ there but not at y = 0.6.'),
      choices: [t`$\delta(x - y)$`, t`$1$`, t`$0$`, t`$\varphi'(y)$`],
      answer: 0,
      why: { 1: 'A variation far from y does not change φ(y), so the derivative cannot be 1 everywhere.', 2: 'A variation at y does change φ(y).', 3: 'That is the ordinary derivative of φ, not the response of φ(y) to changing φ.' },
      hints: [t`$\delta F = \epsilon\eta(y)$. Which kernel $K(x)$ gives $\int K(x)\eta(x)\,dx = \eta(y)$ for every $\eta$?`],
      teach: 'δφ(y)/δφ(x) = δ(x − y): the continuum version of ∂xᵢ/∂xⱼ = δᵢⱼ.',
      explain: t`$\int\delta(x - y)\eta(x)dx = \eta(y)$. This is the starting point of field theory: functional derivatives of fields at different points are independent, like components of an infinite vector.`,
    }),
    num({
      id: 'first-var', difficulty: 3,
      gen(r) {
        const [p, n] = r.pick([[2, 1], [2, 3], [3, 1], [3, 2], [3, 3], [4, 1], [4, 2]]);
        const xp = p === 2 ? '' : p === 3 ? 'x' : `x^{${p - 2}}`;
        const fd = `${-2 * p * (p - 1)}*x^${p - 2}*sin(${n}*pi*x)`;
        const ans = SF.integrate((x) => -2 * p * (p - 1) * x ** (p - 2) * Math.sin(n * PI * x), 0, 1, 40);
        return {
          prompt: t`For $F[\varphi] = \displaystyle\int_0^1\varphi'^2dx$, the rate of change $\dfrac{d}{d\epsilon}F[\varphi + \epsilon\eta]\Big|_{\epsilon = 0}$ equals $\displaystyle\int_0^1\frac{\delta F}{\delta\varphi}\eta\,dx$ when $\eta(0) = \eta(1) = 0$. Compute it for $\varphi = x^{${p}}$ and $\eta = \sin ${n}\pi x$.`,
          visual: gpic({ x: [0, 1], y: [-1.1, 1.3], xlabel: 'x', curves: [{ fn: `x^${p}`, color: 'accent', width: 2.3, label: 'φ', labelAt: 0.85, labelDx: -18 }, { fn: `sin(${n}*pi*x)`, color: 'warn', width: 1.6, dash: [5, 4], label: 'η', labelAt: 0.5 / n, labelDy: -8 }] }, 'The function φ and the variation η, which vanishes at both ends.'),
          answer: ans, tol: { rel: 0.005 },
          integrand: fd, limits: [0, 1], vars: { x: [0.1, 0.9] },
          errors: [{ value: -ans, feedback: t`$\delta F/\delta\varphi = -2\varphi''$: the sign comes from the integration by parts.` }, { value: ans / 2, feedback: t`$\partial L/\partial\varphi' = 2\varphi'$, so $\delta F/\delta\varphi = -2\varphi''$.` }],
          hints: [t`$\delta F/\delta\varphi = -2\varphi'' = ${-2 * p * (p - 1)}${xp}$.`, t`Or directly: $\int_0^12\varphi'\eta'\,dx$ — the two must agree.`],
          teach: 'The functional derivative turns a directional derivative of F into an integral against the direction η.',
          explain: t`$\displaystyle\int_0^1(${-2 * p * (p - 1)}${xp})\sin(${n}\pi x)\,dx = ${r4(ans)}$. Computing $\int 2\varphi'\eta'$ directly gives the same — the boundary term vanished because $\eta(0) = \eta(1) = 0$.`,
        };
      },
    }),
    mcq({
      id: 'beltrami', difficulty: 2,
      prompt: t`The Beltrami identity $L - \varphi'\,\partial L/\partial\varphi' = \text{const}$ is a first integral of the Euler–Lagrange equation when $L$ does not depend explicitly on $x$. For which functional does it apply?`,
      visual: gpic({ x: [-0.5, 0.5], y: [0, 1.2], xlabel: 'x', curves: [{ fn: '0.848*cosh(x/0.848)', color: 'accent', width: 2.3 }] }, 'A catenary: the profile of the soap film of the worked example.'),
      choices: [t`$\int y\sqrt{1 + y'^2}\,dx$ (the film area)`, t`$\int x\sqrt{1 + y'^2}\,dx$`, t`$\int\big(y'^2 + xy\big)\,dx$`, t`$\int e^x y'^2\,dx$`],
      answer: 0,
      why: { 1: 'The weight x makes L depend explicitly on x.', 2: 'The term xy depends explicitly on x.', 3: 'eˣ depends explicitly on x.' },
      hints: ['Look for an explicit x in L — not inside y(x).'],
      teach: 'No explicit x in L means a conserved “energy” L − y′∂L/∂y′ — Noether’s theorem for translations in x.',
      explain: t`$y\sqrt{1 + y'^2}$ has no explicit $x$, so $y/\sqrt{1 + y'^2}$ is constant along the extremal — which integrated to the catenary. In mechanics, with time in place of $x$, the same identity is conservation of energy.`,
    }),
    num({
      id: 'goldschmidt', difficulty: 3,
      gen(r) {
        const R = r.pick([2, 3, 5, 8]), ans = D_MAX * R;
        return {
          prompt: t`Two coaxial wire rings of radius $R = ${R}$ cm hold a soap film. The catenoid profile through them is $y = c\cosh(x/c)$, with ring separation $d = 2c\operatorname{arcosh}(R/c)$. What is the largest separation, in cm, at which a catenoid film can exist? (Maximize $d$ over $c$ numerically or with calculus.)`,
          visual: gpic({ x: [0.1, 0.99], y: [0, 1.5], yticks: 0, xlabel: 'c / R', curves: [{ fn: '2*x*acosh(1/x)', color: 'accent', width: 2.3 }] }, 'Separation d/R against neck radius c/R (vertical scale hidden): it rises, peaks and falls.'),
          answer: ans, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: 2 * R, feedback: 'The film does not survive until the rings are a diameter apart; it pinches off well before.' }, { value: R, feedback: 'Close, but compute the maximum of 2c arcosh(R/c).' }],
          hints: [t`In units of $R$: maximize $d(c) = 2c\operatorname{arcosh}(1/c)$; $d'(c) = 0$ gives $\operatorname{arcosh}(1/c) = 1/\sqrt{1 - c^2}$.`, t`That equation has its root at $c \approx ${r3(C_MAX)}$, where $d \approx ${r4(D_MAX)}$.`],
          teach: 'Beyond a critical separation no stationary surface of revolution exists — the minimizer jumps to two discs.',
          explain: t`$d_{\max} = ${r4(D_MAX)}R = ${r4(ans)}$ cm. Pull the rings further and the film necks down and splits into two flat discs — Goldschmidt’s discontinuous solution, which a smooth Euler–Lagrange equation cannot describe.`,
        };
      },
    }),
    mcq({
      id: 'flow', difficulty: 3,
      prompt: t`Let a field relax by steepest descent, $\partial_t\varphi = -\dfrac{\delta F}{\delta\varphi}$, with $F[\varphi] = \displaystyle\int\tfrac{D}{2}\varphi_x^2\,dx$ (the Dirichlet energy). Which equation results, and what happens to $F$?`,
      visual: gpic({ x: [0, 1], y: [-0.1, 1.2], xlabel: 'x', curves: [0, 0.01, 0.03, 0.08].map((tt, i) => ({ fn: `(e^(-pi^2*${tt})*sin(pi*x) + 0.4*e^(-25*pi^2*${tt})*sin(5*pi*x))`, color: ['accent', 'violet', 'teal', 'gold'][i], width: 2 })) }, 'A field relaxing: the wiggles (high gradient energy) die first.'),
      choices: [t`The heat equation $\partial_t\varphi = D\varphi_{xx}$; $F$ never increases`, t`The wave equation $\partial_t^2\varphi = D\varphi_{xx}$; $F$ is conserved`, t`$\partial_t\varphi = -D\varphi_{xx}$; $F$ decreases`, t`$\partial_t\varphi = D\varphi_x$; $F$ is conserved`],
      answer: 0,
      why: {
        1: 'Steepest descent is first order in time; the wave equation comes from an action, not from minimizing.',
        2: t`$\delta F/\delta\varphi = -D\varphi_{xx}$, so $-\delta F/\delta\varphi = +D\varphi_{xx}$. The sign you chose is the backward heat equation, which is ill-posed.`,
        3: 'That is transport, not descent; it does not follow from this F.',
      },
      hints: [t`$\delta F/\delta\varphi = -D\varphi_{xx}$.`, t`$\dfrac{dF}{dt} = \displaystyle\int\frac{\delta F}{\delta\varphi}\partial_t\varphi\,dx = -\int\Big(\frac{\delta F}{\delta\varphi}\Big)^2dx$.`],
      teach: 'Diffusion is gradient descent of the Dirichlet energy: dF/dt = −∫(δF/δφ)² ≤ 0.',
      explain: t`$\partial_t\varphi = D\varphi_{xx}$, and $dF/dt = -\int(\delta F/\delta\varphi)^2dx \le 0$ — the chain rule with $\int dx$ in place of $\sum_i$. Every gradient flow decreases its functional; that is why heat smooths.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sail', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([5, 8, 10, 15]), T = r.pick([0.02, 0.05, 0.1]);
        const ans = ((P_SAIL * L * L) / (8 * T)) * 1000;
        return {
          prompt: t`A strip of solar-sail film of span $L = ${L}$ m is held at both ends with tension $T = ${T}$ N per metre of width. Sunlight at 1 AU on a perfect reflector exerts $p = 2S/c = ${(P_SAIL * 1e6).toFixed(2)}\ \mu\text{Pa}$. Its deflection $w(x)$ makes the energy $E[w] = \displaystyle\int_0^L\Big(\tfrac T2w'^2 - p\,w\Big)dx$ stationary, with $w(0) = w(L) = 0$. Set $\delta E/\delta w = 0$ and find the sag at mid-span, in mm.`,
          visual: gpic({ x: [0, L], y: [-0.2, 1.3], yticks: 0, xlabel: 'x (m)', curves: [{ fn: `4*x*(${L} - x)/${L * L}`, color: 'accent', width: 2.3 }], arrows: [0.2, 0.4, 0.6, 0.8].map((f) => ({ from: [f * L, -0.15], to: [f * L, 0.12], color: 'gold', width: 1.4 })) }, 'The deflected strip (vertical scale hidden, much exaggerated) and the radiation pressure (gold arrows).'),
          answer: ans, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: ((P_SAIL * L * L) / (2 * T)) * 1000, feedback: t`Solve $-Tw'' = p$ properly: $w = \frac{p}{2T}x(L - x)$, so at mid-span $w = pL^2/8T$.` }, { value: ((P_SAIL * L * L) / (4 * T)) * 1000, feedback: t`$\frac{p}{2T}\cdot\frac L2\cdot\frac L2 = \frac{pL^2}{8T}$.` }, { value: (P_SAIL * L * L) / (8 * T), feedback: 'That is in metres; the question asks for millimetres.' }],
          hints: [t`$\delta E/\delta w = -Tw'' - p = 0$.`, t`$w = \dfrac{p}{2T}x(L - x)$; evaluate at $x = L/2$.`],
          teach: 'Minimizing an energy functional gives the equilibrium equation: here −Tw″ = p, a parabola.',
          explain: t`$w_{\max} = \dfrac{pL^2}{8T} = ${r4(ans)}$ mm. Light pressure is tiny, so even a slack membrane barely bows — but over a 100 m sail the same formula gives centimetres, which matter for the thrust direction.`,
        };
      },
    }),
    num({
      id: 'cp-neck', difficulty: 2,
      gen(r) {
        const c = r.pick([0.6, 0.7, 0.8, 0.9]), ans = sep(c);
        return {
          prompt: t`A soap-film catenoid between rings of radius $R = 1$ has neck radius $c = ${c}$. How far apart are the rings? (The profile is $y = c\cosh(x/c)$; the rings sit where $y = 1$.)`,
          visual: gpic({ x: [-1, 1], y: [-1.2, 1.2], equal: true, xlabel: 'x', curves: [1, -1].map((sg) => ({ param: [`${c}*t*acosh(1/${c})`, `${sg * c}*cosh(t*acosh(1/${c}))`], t: [-1, 1], color: 'accent', width: 2.3 })), hlines: [{ y: c, color: 'ink4' }] }, 'The film’s profile; the thin line marks the neck radius.'),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: c * Math.acosh(1 / c), feedback: 'That is half the separation: the rings sit at ±c arcosh(1/c).' }],
          hints: [t`Solve $c\cosh(x/c) = 1$: $x = \pm c\operatorname{arcosh}(1/c)$.`, t`$\operatorname{arcosh}u = \ln\big(u + \sqrt{u^2 - 1}\big)$.`],
          teach: 'The neck radius fixes the whole catenoid; the ring separation follows from where it reaches the ring radius.',
          explain: t`$d = 2c\operatorname{arcosh}(1/c) = ${r4(ans)}$. ${c < C_MAX ? 'This thin-necked film is the unstable branch: the same separation also has a fatter, stable catenoid.' : 'This fat-necked film is the stable branch.'}`,
        };
      },
    }),
    mcq({
      id: 'cp-saddle', difficulty: 3,
      prompt: t`At ring separation $d = 1$ the area functional has two stationary catenoids (necks $${r3(EXC[1])}$ and $${r3(EXC[0])}$). A film is observed in only one shape. Why?`,
      visual: EXVIS,
      choices: [
        'δA/δy = 0 only says the area is stationary; the thin-necked catenoid is a saddle — some variation lowers its area — so it is unstable',
        'The Euler–Lagrange equation picks the smallest-area solution automatically',
        'The thin-necked solution violates the boundary conditions',
        'Both are minima; which one forms depends only on how the film is made',
      ],
      answer: 0,
      why: {
        1: 'Euler–Lagrange finds every stationary function — minima, maxima and saddles alike.',
        2: 'Both pass through both rings: both satisfy y(±½) = 1.',
        3: 'The thin one has a variation (squeezing the neck) that lowers the area: it cannot be a minimum.',
      },
      hints: ['Compare the two areas with each other.', 'A first derivative of zero says nothing about the second variation.'],
      teach: 'A vanishing functional derivative marks a stationary point; the second variation decides whether it is a minimum.',
      explain: t`The fat catenoid (area $${r4(area(EXC[1], 1))}$) is a local minimum; the thin one (area $${r4(area(EXC[0], 1))}$) is a saddle, and a real film there collapses. The same distinction — stationary versus minimal — matters for geodesics in relativity: proper time along a geodesic is stationary, and can be a maximum or a saddle.`,
    }),
  ],
  sources: [SRC.gelfand, SRC.boas, SRC.rhb],
});
