// Functionals and the shortest path (Taylor ch. 6.1): a functional eats a
// whole path and returns a number — length, travel time, action. Vary the
// path as y + αη with η = 0 at the ends and the functional becomes an
// ordinary function F(α); the true path is where dF/dα = 0 for every η. Done
// by hand for the straight line (the first variation integrates to
// η(x₂) − η(x₁) = 0), with the second variation showing it is a minimum and
// the α² growth of the excess length. Seeds: stationary is not always minimal
// (the long way round a great circle), geodesics on an unrolled tank, and the
// worldline of maximal proper time. Uses the cm2-vary sim.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import * as V from '../../src/viz/model/cm2-var.js';
import { sci, r6, gpic, seg, lab } from './_cm.js';

const t = String.raw;

// the worked example: A = (0, 0) to B = (1, 0.5) m, varied by α sin πx
const EX = (() => {
  const m = 0.5, al = 0.1;
  const L0 = Math.hypot(1, m), L1 = V.F('length', 1, al, 0, { N: 4000 });
  const k = (Math.PI * Math.PI) / 2 / (1 + m * m) ** 1.5;          // ∫η′² dx / (1 + m²)^{3/2}
  return { m, al, L0, L1, dL: L1 - L0, est: 0.5 * al * al * k, k };
})();

// a still functional-explorer picture
const vary = (params, caption) => ({ type: 'cm2-vary', params: { sliders: [], modes: false, readouts: [], ...params }, caption });

// a straight segment A→B and varied paths y = m x + a sin(nπx) as graph curves
function pathsPic({ m = 0.5, n = 1, amps = [0.12, -0.12], caption, extra = {} }) {
  return gpic({
    x: [-0.08, 1.12], y: [-0.35, 0.85], xlabel: 'x (m)', ylabel: 'y (m)',
    curves: [
      ...amps.map((a) => ({ fn: `${m}*x + ${a}*sin(${n}*pi*x)`, domain: [0, 1], color: 'ink3', width: 1.6 })),
      { fn: `${m}*x`, domain: [0, 1], color: 'accent', width: 2.6 },
    ],
    points: [{ x: 0, y: 0, color: 'ink', label: 'P', labelDx: -14, labelDy: -10 }, { x: 1, y: m, color: 'ink', label: 'Q', labelDx: 8, labelDy: -10 }],
    ...extra,
  }, caption, 'A straight path between two points and varied paths that share its end points');
}

export default lesson({
  id: 'phys3550.M3.1',
  title: 'Functionals and the shortest path',
  minutes: 16, difficulty: 3,
  intro: t`A function eats a number and returns a number. A **functional** eats a whole function — a path $y(x)$ — and returns a number: the length of the path, the time a bead takes to slide along it, or (in [M4.2](#/lesson/phys3550.M4.2)) the action of a motion. The calculus of variations asks which path makes a functional **stationary**. The trick that turns it into ordinary calculus: push the true path by a small amount $\alpha$ along any shape $\eta(x)$ that vanishes at both ends, and the functional becomes an ordinary function $F(\alpha)$. The true path is where $dF/d\alpha = 0$ at $\alpha = 0$, for *every* $\eta$.`,
  equation: t`L[y] = \int_{x_1}^{x_2}\sqrt{1 + y'(x)^2}\,dx, \qquad F(\alpha) = L[\,y + \alpha\eta\,]`,
  symbols: [
    { tex: 'L[y]', text: 'the length functional, in m: the square brackets say it depends on the whole path $y(x)$, not on one number' },
    { tex: 'y(x)', text: 'a path from $(x_1, y_1)$ to $(x_2, y_2)$, in m' },
    { tex: "y'(x)", text: 'its slope $dy/dx$ (dimensionless): $\\sqrt{1 + y\'^2}\\,dx$ is the length $ds$ of a short piece of the path' },
    { tex: 'x_1,\\ x_2', text: 'the end points’ horizontal positions, in m — fixed' },
    { tex: '\\eta(x)', text: 'the variation’s shape: any smooth function with $\\eta(x_1) = \\eta(x_2) = 0$, so every varied path has the same ends' },
    { tex: '\\alpha', text: 'how far the path is pushed along $\\eta$; $\\alpha = 0$ is the path being tested' },
  ],
  why: t`Every law of motion in this course — and the geodesic equation of general relativity, where a free particle's worldline makes its **proper time** stationary — is the answer to "which path makes this functional stationary?"`,
  visual: {
    type: 'cm2-vary',
    title: 'A family of paths and their lengths',
    lead: t`Top: the straight path from A to B (blue), faint members of the family $y + \alpha\sin(n\pi x)$, and the path at your $\alpha$ (orange). Bottom: the length $L(\alpha)$ of every member. The gold line is its tangent at your $\alpha$.`,
    tasks: [
      t`Slide $\alpha$ either way from 0: the length only grows. At $\alpha = 0$ the tangent is flat — $dL/d\alpha = 0$.`,
      t`Switch to $n = 2$ and $n = 3$: the wigglier variations grow faster, but every curve is flat at $\alpha = 0$.`,
      t`Set the base offset $\beta$ to 0.1 m: now the family starts from a bent path, and the curve is **not** flat at $\alpha = 0$ — a bent path is not stationary.`,
    ],
    params: { preset: 'length', sliders: ['alpha', 'beta'], readouts: ['F', 'dF', 'slope'] },
    caption: t`Paths in a plane from A $= (0, 0)$ to B $= (1, 0.5)$ m; $\eta_n = \sin(n\pi x)$, zero at both ends. Lengths computed numerically from 300 chords.`,
  },
  example: {
    prompt: t`Show that the straight line from P $= (0, 0)$ to Q $= (1\ \text{m}, ${EX.m}\ \text{m})$ makes the length stationary, that it is a minimum, and estimate how much longer the path $y = ${EX.m}x + ${EX.al}\sin\pi x$ is.`,
    visual: pathsPic({ amps: [EX.al], caption: t`The straight line (blue) and the varied path $y = ${EX.m}x + ${EX.al}\sin\pi x$ (grey), which shares its ends.` }),
    steps: [
      { label: 'The family', text: t`Write every competitor as $y = mx + \alpha\eta(x)$, with $m = ${EX.m}$ and $\eta(0) = \eta(1) = 0$. Then $y' = m + \alpha\eta'$ and $L(\alpha) = \int_0^1\sqrt{1 + (m + \alpha\eta')^2}\,dx$.` },
      { label: 'First derivative', text: t`Differentiate under the integral sign: $\dfrac{dL}{d\alpha} = \int_0^1 \dfrac{(m + \alpha\eta')\,\eta'}{\sqrt{1 + (m + \alpha\eta')^2}}\,dx$.` },
      { label: 'At alpha = 0', text: t`The fraction becomes the constant $m/\sqrt{1 + m^2}$, so $\dfrac{dL}{d\alpha}\Big|_0 = \dfrac{m}{\sqrt{1 + m^2}}\int_0^1\eta'\,dx = \dfrac{m}{\sqrt{1 + m^2}}\big[\eta(1) - \eta(0)\big] = 0$. Zero for **every** $\eta$: the line is stationary.` },
      { label: 'Second derivative', text: t`Differentiate again and set $\alpha = 0$: $\dfrac{d^2L}{d\alpha^2}\Big|_0 = \int_0^1\dfrac{\eta'^2}{(1 + m^2)^{3/2}}\,dx > 0$ for any $\eta$ that is not zero. Every direction curves up: a **minimum**.` },
      { label: 'Estimate', text: t`So $L(\alpha) \approx L(0) + \tfrac12\alpha^2\int\eta'^2\,dx\,/(1 + m^2)^{3/2}$. With $\eta = \sin\pi x$, $\int_0^1\pi^2\cos^2\pi x\,dx = \pi^2/2$, and $\Delta L \approx \tfrac12(${EX.al})^2(${sci(Math.PI * Math.PI / 2, 4)})/${sci(1.25 ** 1.5, 4)} = ${sci(EX.est, 3)}$ m.` },
      { label: 'Sense check', text: t`Numerically, $L(${EX.al}) - L(0) = ${sci(EX.L1, 6)} - ${sci(EX.L0, 6)} = ${sci(EX.dL, 3)}$ m. The excess is **second order** in $\alpha$: double the push and the extra length quadruples. That is what “stationary” means.` },
    ],
    answer: t`$dL/d\alpha = 0$ at $\alpha = 0$ for every $\eta$ (the line is stationary) and $d^2L/d\alpha^2 > 0$ (a minimum); the wiggled path is longer by about $${sci(EX.est, 2)}$ m, or ${Math.round(EX.dL * 1000)} mm.`,
  },
  practice: [
    mcq({
      id: 'which-functional', difficulty: 1,
      prompt: t`Which of these is a **functional** — a rule that takes a whole path $y(x)$ and returns one number?`,
      visual: vary({ preset: 'brach', alpha: 0.3, n: 2, ghosts: true, panels: ['path'] }, t`Many wires from the start to B; each one has its own travel time. Depth measured down from the start.`),
      choices: [
        t`The time a bead takes to slide from A to B along the wire $y(x)$: $T[y] = \displaystyle\int \frac{\sqrt{1 + y'^2}}{\sqrt{2gy}}\,dx$`,
        t`The bead's speed at depth $y$: $v(y) = \sqrt{2gy}$`,
        t`The slope of the wire at each point, $y'(x)$`,
        t`The number $\displaystyle\int_0^1 x^2\,dx = \tfrac13$`,
      ],
      answer: 0,
      why: {
        1: t`$v(y)$ takes one number (a depth) and returns one number: an ordinary function.`,
        2: t`$y'(x)$ takes a path and returns another *function* — a derivative is an operator, not a functional.`,
        3: t`That is a fixed number that depends on no path at all.`,
      },
      hints: [t`Ask of each: what goes in, and what comes out? A functional takes a function in and gives a number out.`],
      teach: t`A functional maps a whole function to a number; the square brackets in $T[y]$ are the reminder.`,
      explain: t`Change the wire anywhere and $T[y]$ changes: it depends on the whole of $y(x)$ and returns one number, a time. That is a functional, and finding the wire that minimizes it is the brachistochrone problem of [M3.3](#/lesson/phys3550.M3.3).`,
    }),
    num({
      id: 'parabola-length', difficulty: 2,
      gen(r) {
        const c = r.pick([0.5, 0.75, 1, 1.25, 1.5]);
        const L = 0.5 * Math.sqrt(1 + 4 * c * c) + Math.asinh(2 * c) / (4 * c);
        return {
          prompt: t`A wire runs along $y = ${c}x^2$ (x and y in metres) from $(0, 0)$ to $(1, ${c})$ m. Evaluate the length functional $L[y] = \int_0^1\sqrt{1 + y'^2}\,dx$ for it.`,
          answer: L, units: 'm', tol: { rel: 0.005 }, integrand: `sqrt(1 + 4*${c}^2*x^2)`, limits: [0, 1],
          errors: [{ value: Math.hypot(1, c), feedback: t`That is the straight chord from end to end. The wire is curved: integrate $\sqrt{1 + y'^2}$ along it.` }, { value: 1 + c, feedback: t`Adding $|dx| + |dy|$ walks along the axes. A short piece has length $\sqrt{dx^2 + dy^2}$.` }],
          hints: [t`$y' = ${2 * c}x$, so the integrand is $\sqrt{1 + ${sci(4 * c * c, 3)}x^2}$.`, t`Integrate numerically, or use $\int\sqrt{1 + k^2x^2}\,dx = \tfrac{x}{2}\sqrt{1 + k^2x^2} + \tfrac{1}{2k}\sinh^{-1}kx$ with $k = ${2 * c}$.`],
          teach: t`To evaluate a functional, put the path in: here $y' = 2cx$ turns $L[y]$ into an ordinary definite integral.`,
          explain: t`$L = \int_0^1\sqrt{1 + ${sci(4 * c * c, 3)}x^2}\,dx = ${sci(L, 4)}$ m, longer than the chord $\sqrt{1 + ${c}^2} = ${sci(Math.hypot(1, c), 4)}$ m — as it must be.`,
          visual: gpic({ x: [-0.1, 1.15], y: [-0.1, c + 0.25], equal: true, xlabel: 'x (m)', ylabel: 'y (m)', curves: [{ fn: `${c}*x^2`, domain: [0, 1], color: 'accent', width: 2.6 }, seg([0, 0], [1, c], 'ink3', 1.4, true)], points: [{ x: 0, y: 0, color: 'ink' }, { x: 1, y: c, color: 'ink' }] }, t`The wire (blue) and the straight chord between its ends (dashed).`, 'A parabolic wire and its chord'),
        };
      },
    }),
    mcq({
      id: 'why-zero-ends', difficulty: 2,
      prompt: t`In the family $y(x) + \alpha\eta(x)$, why must the variation satisfy $\eta(x_1) = \eta(x_2) = 0$?`,
      visual: pathsPic({ n: 2, amps: [0.15, -0.15, 0.08], caption: t`Varied paths $y + \alpha\sin 2\pi x$: every one is pinned to P and Q.` }),
      choices: [
        t`So that every varied path still joins the same two end points — the problem fixes them`,
        t`So that the integral $\int\sqrt{1 + y'^2}\,dx$ converges`,
        t`So that $\eta$ is small compared with $y$`,
        t`So that $F(\alpha)$ comes out symmetric in $\alpha$`,
      ],
      answer: 0,
      why: {
        1: t`The integrand is a continuous function on a closed interval; it converges whatever $\eta$ does at the ends.`,
        2: t`Smallness is what $\alpha \to 0$ is for. $\eta$ can be any size; $\alpha$ scales it.`,
        3: t`$F(\alpha)$ is not symmetric in general — the brachistochrone's $T(\alpha)$ is lopsided — and nothing requires it.`,
      },
      hints: [t`What would $y + \alpha\eta$ do at $x_1$ if $\eta(x_1) = 0.3$?`],
      teach: t`The competitors must obey the same boundary conditions as the answer: same start, same finish.`,
      explain: t`The question is "which path from P to Q?", so every competitor must start at P and end at Q. With $\eta(x_1) = \eta(x_2) = 0$, $y + \alpha\eta$ does for every $\alpha$. In the worked example this is exactly what killed the first variation: $\int\eta'\,dx = \eta(x_2) - \eta(x_1) = 0$.`,
    }),
    expr({
      id: 'time-integrand', difficulty: 2,
      gen(r) {
        const v0 = r.pick([2, 3, 4]), h = r.pick([5, 10, 20]);
        return {
          prompt: t`A rover's speed over sloping ground depends only on its height $y$: $v = ${v0}\,(1 + y/${h})$ m/s. Write the integrand $f(y, y')$ of the travel-time functional $T[y] = \int f\,dx$ for a route $y(x)$. Type $y'$ as $p$.`,
          answer: `sqrt(1 + p^2)/(${v0}*(1 + y/${h}))`,
          answerTeX: t`\frac{\sqrt{1 + y'^2}}{${v0}\,(1 + y/${h})}`,
          lhs: 'f(y, p)', vars: { y: [0, 5], p: [-2, 2] },
          errors: [{ answer: `${v0}*(1 + y/${h})*sqrt(1 + p^2)`, feedback: t`Time is distance over speed: divide by $v$, do not multiply.` }, { answer: `1/(${v0}*(1 + y/${h}))`, feedback: t`That is time per unit $x$ only for a level route. A tilted piece is longer: $ds = \sqrt{1 + y'^2}\,dx$.` }],
          hints: [t`A short piece of route has length $ds = \sqrt{1 + y'^2}\,dx$ and takes time $ds/v$.`, t`$f = \sqrt{1 + p^2}\,/\,v(y)$.`],
          teach: t`Every travel-time functional has the form $\int ds/v$; only the speed law changes.`,
          explain: t`$dt = ds/v = \dfrac{\sqrt{1 + y'^2}}{${v0}(1 + y/${h})}\,dx$. The same shape — $\sqrt{1 + y'^2}$ over a speed — gives the brachistochrone ($v = \sqrt{2gy}$) and Fermat's principle ($v = c/n$) in [M3.3](#/lesson/phys3550.M3.3) and [M3.4](#/lesson/phys3550.M3.4).`,
          visual: gpic({
            x: [0, 10], y: [0, 6], xlabel: 'x (m)', ylabel: 'y (m)',
            shade: [{ fn: '6', lower: '4', from: 0, to: 10, color: 'good', alpha: 0.18 }, { fn: '4', lower: '2', from: 0, to: 10, color: 'good', alpha: 0.11 }, { fn: '2', lower: '0', from: 0, to: 10, color: 'good', alpha: 0.05 }],
            curves: [{ fn: '0.5 + 4*sin(pi*x/10)^2*(1 - x/20)', domain: [0, 10], color: 'accent', width: 2.4 }],
            points: [lab(8.6, 5.4, 'faster', 'good'), lab(6.6, 0.45, 'slower', 'ink3')],
          }, t`A possible route (blue) over ground where higher means faster (darker band). Schematic.`, 'A route crossing bands of increasing speed'),
        };
      },
    }),
    num({
      id: 'excess-length', difficulty: 3,
      gen(r) {
        const m = r.pick([0, 0.5, 1]), n = r.pick([1, 2, 3]), al = r.pick([0.01, 0.02, 0.03]);
        const est = (al * al * n * n * Math.PI * Math.PI) / (4 * (1 + m * m) ** 1.5);
        return {
          prompt: t`A straight line $y = ${m}x$ (in m) runs from $x = 0$ to $x = 1$ m. It is varied to $y = ${m}x + ${al}\sin(${n}\pi x)$. Use the second-order estimate $\Delta L \approx \tfrac12\alpha^2\int_0^1\eta'^2\,dx\,/\,(1 + m^2)^{3/2}$ to find how much longer the varied path is, in **millimetres**.`,
          answer: est * 1000, units: 'mm', tol: { rel: 0.02 },
          errors: [{ value: (al * al * n * n * Math.PI * Math.PI) / (4 * Math.sqrt(1 + m * m)) * 1000, feedback: t`The power is $3/2$: $(1 + m^2)^{3/2}$ comes from differentiating $1/\sqrt{1 + y'^2}$.` }, { value: (al * al * n * n * Math.PI * Math.PI) / (2 * (1 + m * m) ** 1.5) * 1000, feedback: t`$\int_0^1\cos^2(n\pi x)\,dx = \tfrac12$, so $\int\eta'^2\,dx = n^2\pi^2/2$ — and there is a $\tfrac12$ in front as well.` }].filter((e) => Math.abs(e.value - est * 1000) > 0.03 * est * 1000),
          hints: [t`$\eta = \sin(${n}\pi x)$, so $\eta' = ${n}\pi\cos(${n}\pi x)$ and $\int_0^1\eta'^2\,dx = ${n * n}\pi^2/2$.`, t`$\Delta L \approx \tfrac12(${al})^2\cdot\dfrac{${n * n}\pi^2/2}{(1 + ${m}^2)^{3/2}}$ m; convert to mm.`],
          teach: t`Near a stationary path the functional changes only at second order: $\Delta L \propto \alpha^2$.`,
          explain: t`$\Delta L \approx \tfrac12(${al})^2(${sci((n * n * Math.PI * Math.PI) / 2, 4)})/${sci((1 + m * m) ** 1.5, 4)} = ${sci(est * 1000, 3)}$ mm. Halve the ${al * 1000} mm wiggle and the extra length falls to a quarter: a change of second order in $\alpha$ is what stationary means.`,
          visual: vary({ preset: 'length', n, alpha: Math.min(0.3, al * 6), ghosts: false, panels: ['path'] }, t`The shape of a mode-${n} variation, exaggerated six times (and drawn on a line of slope 0.5).`),
        };
      },
    }),
    order({
      id: 'method', difficulty: 2,
      prompt: t`Put the steps of the variational method in order.`,
      visual: vary({ preset: 'length', alpha: 0.2, n: 1 }, t`A family of paths (top) and the functional along it (bottom): flat at the true path.`),
      items: [
        t`Write the quantity to be made stationary as a functional $F[y] = \int f\,dx$.`,
        t`Form the family $y + \alpha\eta$ with $\eta = 0$ at both ends.`,
        t`Write $F(\alpha)$ and differentiate under the integral sign.`,
        t`Set $dF/d\alpha = 0$ at $\alpha = 0$ for every allowed $\eta$.`,
        t`Turn that condition into an equation for $y(x)$ and solve it.`,
      ],
      hints: [t`You cannot differentiate $F$ with respect to $\alpha$ until the family exists.`, t`The last step is the Euler–Lagrange equation of [M3.2](#/lesson/phys3550.M3.2).`],
      teach: t`The method turns "find the best function" into "set an ordinary derivative to zero".`,
      explain: t`Functional, family, $F(\alpha)$, stationarity for every $\eta$, then an equation for the path. Doing the last two steps once and for all, for any integrand $f(y, y', x)$, gives the Euler–Lagrange equation of [M3.2](#/lesson/phys3550.M3.2).`,
    }),
    mcq({
      id: 'long-way', difficulty: 3,
      prompt: t`On a sphere the shortest path between two points is the shorter arc of the great circle through them. The **longer** arc of the same great circle also makes the length stationary. What kind of stationary point is it?`,
      visual: gpic({
        x: [-1.5, 1.5], y: [-1.25, 1.25], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [{ param: ['cos(t)', 'sin(t)'], t: [0.5, 2.0], color: 'accent', width: 3 }, { param: ['cos(t)', 'sin(t)'], t: [2.0, 6.7832], color: 'warn', width: 2.4 }],
        points: [{ x: r6(Math.cos(0.5)), y: r6(Math.sin(0.5)), color: 'ink', label: 'P', labelDx: 8, labelDy: -6 }, { x: r6(Math.cos(2)), y: r6(Math.sin(2)), color: 'ink', label: 'Q', labelDx: -16, labelDy: -6 }, lab(0.15, 1.17, 'short arc', 'accent'), lab(0.1, -1.15, 'long arc', 'warn')],
      }, t`One great circle seen face-on: the short arc from P to Q (blue) and the long way round (orange).`, 'A great circle split into a short arc and a long arc between two points'),
      choices: [
        t`A saddle: most wiggles make it longer, but one family of variations — possible because the arc passes the point opposite P — makes it shorter`,
        t`A maximum: every nearby path is shorter`,
        t`A minimum, just a higher one: every nearby path is longer`,
        t`It is not stationary; only the short arc is`,
      ],
      answer: 0,
      why: {
        1: t`Small sideways wiggles of a great-circle arc always lengthen it, so it cannot be a maximum in every direction.`,
        2: t`Every half great circle from P to the point opposite P has the same length, $\pi R$. Swing the long arc's first half round to another one, then cut the corner this leaves at the opposite point: the path gets shorter. Some variations decrease the length.`,
        3: t`Any great-circle arc is stationary: the first variation vanishes along its whole length. Being stationary does not require being the shortest.`,
      },
      hints: [t`The long arc passes through the point opposite P. How many different half great circles join P to that point, and how long is each?`, t`All of them have length $\pi R$. Swap the long arc's first half for a neighbouring one: no change in length, but now there is a corner — and cutting a corner shortens a path.`],
      teach: t`Stationary means the first variation vanishes; it can be a minimum, a maximum or a saddle.`,
      explain: t`The long arc is a saddle of the length: most variations lengthen it, but swinging its first half and cutting the corner shortens it. In mechanics the same thing happens to the action (the spring in [M4.2](#/lesson/phys3550.M4.2)), which is why the principle is "stationary action", not "least action".`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tank-wire', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([0.8, 1.2, 1.85, 2.6]), h = r.pick([1.5, 2, 3, 4]);
        const L = Math.hypot(Math.PI * R, h);
        return {
          prompt: t`A sensor cable must be bonded to the outside of a cylindrical propellant tank of radius ${R} m, from a point on one side to the point exactly opposite (half-way round) and ${h} m higher. What is the shortest cable that can lie on the tank's surface?`,
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: Math.PI * R + h, feedback: t`Going round and then straight up is two legs of a right triangle; the geodesic is its hypotenuse.` }, { value: Math.hypot(2 * R, h), feedback: t`That straight line passes through the tank. The cable must stay on the surface.` }, { value: Math.hypot(2 * Math.PI * R, h), feedback: t`Half-way round is $\pi R$ of arc, not the full circumference $2\pi R$.` }],
          hints: [t`A cylinder can be unrolled flat without stretching: lengths on it are lengths on a flat sheet.`, t`Unrolled, the two points are $\pi R$ apart sideways and $h$ apart vertically; the shortest path on a flat sheet is a straight line.`],
          teach: t`Unroll a cylinder and its geodesics become straight lines; rolled up again they are helices.`,
          explain: t`Unrolled, the cable is the hypotenuse of a triangle with legs $\pi R = ${sci(Math.PI * R, 4)}$ m and ${h} m: $L = ${sci(L, 4)}$ m. Rolled back up it is a helix. A cylinder is intrinsically flat, which is why this works; a sphere cannot be unrolled, and its geodesics need the calculus of variations.`,
          visual: gpic({
            x: [-0.4, Math.PI * R + 0.6], y: [-0.5, h + 0.6], equal: true, xlabel: 'distance round the tank (m)', ylabel: 'height (m)',
            shade: [{ fn: `${h}`, lower: '0', from: 0, to: r6(Math.PI * R), color: 'ink3', alpha: 0.12 }],
            points: [{ x: 0, y: 0, color: 'ink', label: 'start', labelDx: 8, labelDy: 10 }, { x: r6(Math.PI * R), y: h, color: 'ink', label: 'end', labelDx: -30, labelDy: -10 }],
          }, t`Half of the tank's surface, unrolled flat (grey). Drawn to scale.`, 'Half of a cylindrical tank surface unrolled into a rectangle with start and end points at opposite corners'),
        };
      },
    }),
    (() => {
      const d = 0.05, b = 0.08, Fm = V.F('length', 1, -d, b, { N: 4000 }), F0 = V.F('length', 1, 0, b, { N: 4000 }), Fp = V.F('length', 1, d, b, { N: 4000 });
      const slope = (Fp - Fm) / (2 * d);
      return mcq({
        id: 'cp-candidate', difficulty: 3,
        prompt: t`A program tests a candidate path from P to Q by computing the length of the family candidate $+\ \alpha\sin\pi x$: it finds $L(-${d}) = ${sci(Fm, 5)}$ m, $L(0) = ${sci(F0, 5)}$ m and $L(${d}) = ${sci(Fp, 5)}$ m. What do the numbers say?`,
        visual: gpic({ x: [-0.07, 0.07], y: [r6(Fm - 0.004), r6(Fp + 0.004)], xlabel: 'α (m)', ylabel: 'L (m)', points: [{ x: -d, y: r6(Fm), color: 'warn' }, { x: 0, y: r6(F0), color: 'warn' }, { x: d, y: r6(Fp), color: 'warn' }] }, t`The three computed lengths against $\alpha$.`, 'Three computed lengths against the variation amplitude'),
        choices: [
          t`It is not the stationary path: $L$ changes at **first** order — $dL/d\alpha \approx ${sci(slope, 2)}$, not 0`,
          t`It is the stationary path: $L(0)$ is the smallest of the three`,
          t`It is the stationary path: the changes are only a few millimetres`,
          t`Nothing can be concluded without the second derivative`,
        ],
        answer: 0,
        why: {
          1: t`$L(0)$ is not the smallest — $L(-${d})$ is smaller. And even a smallest sample would not prove stationarity; the slope at $\alpha = 0$ must vanish.`,
          2: t`Small is not the test; the *order* of the change is. Here the two sides differ by about $${sci(Fp - Fm, 2)}$ m, which is first order in $\alpha$.`,
          3: t`The first derivative is the test of stationarity, and these numbers give it: $\big(L(${d}) - L(-${d})\big)/${2 * d} \ne 0$.`,
        },
        hints: [t`Estimate $dL/d\alpha$ at 0 by a central difference: $\big(L(\delta) - L(-\delta)\big)/2\delta$.`, t`For a stationary path the two sides would be equal to first order, $L(\delta) \approx L(-\delta)$.`],
        teach: t`Stationarity is a first-derivative test: $L(\delta) - L(-\delta)$ must vanish faster than $\delta$.`,
        explain: t`$\big(${sci(Fp, 5)} - ${sci(Fm, 5)}\big)/${2 * d} = ${sci(slope, 2)}$: pushing along $-\sin\pi x$ shortens the path, so the candidate is bent. (It was the straight line pushed ${b * 100} cm along $\sin\pi x$.)`,
      });
    })(),
    mcq({
      id: 'cp-proper-time', difficulty: 2, transfer: true,
      prompt: t`In special relativity a clock's elapsed time between two events is the functional $\tau[x] = \int\sqrt{1 - \dot x^2/c^2}\,dt$ of its worldline $x(t)$. Two clocks start together and meet again, one staying put, one travelling out and back. Which statement is the variational principle at work?`,
      visual: { type: 'worldlines', params: { T: 10, tx: 3, tt: 5 }, caption: t`Two worldlines between the same two events, with $c = 1$. Ticks mark each clock's own time.` },
      choices: [
        t`The unaccelerated worldline makes $\tau$ stationary — a **maximum**: the stay-at-home clock records the most time`,
        t`The unaccelerated worldline makes $\tau$ a minimum, like the shortest path in a plane`,
        t`Both worldlines record the same time, because they join the same two events`,
        t`The travelling clock records more time, because it covers more distance`,
      ],
      answer: 0,
      why: {
        1: t`The minus sign inside $\sqrt{1 - \dot x^2/c^2}$ flips the geometry: any wiggle *reduces* $\tau$. Straight worldlines are the longest in proper time.`,
        2: t`Proper time depends on the path, not just its ends — that is the twin paradox, and it is measured (muon storage rings, airborne atomic clocks).`,
        3: t`More distance means more speed, and speed *slows* a clock: $\sqrt{1 - \dot x^2/c^2} < 1$.`,
      },
      hints: [t`Which worldline keeps $\dot x = 0$, making the integrand as large as it can be?`],
      teach: t`Free motion in relativity makes proper time stationary — a maximum — the seed of the geodesic principle.`,
      explain: t`$\sqrt{1 - \dot x^2/c^2} \le 1$ with equality only for $\dot x = 0$, so the straight worldline maximizes $\tau$. In general relativity free fall is exactly this: the worldline of stationary (maximal) proper time — see [maximal aging](#/lesson/gr.S12.i), [the twin paradox](#/lesson/phys3710.R1.3) and, in this course, [the relativistic Lagrangian](#/lesson/phys3550.M12.1).`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), §6.1: two examples', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'MIT OCW 8.09 Classical Mechanics III: the calculus of variations', url: 'https://ocw.mit.edu/courses/8-09-classical-mechanics-iii-fall-2014/' },
  ],
});
