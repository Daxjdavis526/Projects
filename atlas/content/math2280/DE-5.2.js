// The trace–determinant map: every 2×2 linear system classified by two
// numbers, τ and Δ — saddles below the axis, nodes and spirals either side of
// the parabola τ² = 4Δ, centres on the positive Δ axis, degenerate nodes and
// stars on the parabola, lines of equilibria on Δ = 0 — which regions are
// robust and which borders are not, and paths across the map as a parameter
// changes (a damper, a circuit, a seismometer).
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { M, n, r6 } from './_systems.js';

const t = String.raw;

// the map alone, with fixed marks (no draggable point)
const mapPic = (o, caption) => ({ type: 'de-tracedet', params: { drag: false, readout: false, panels: 'map', ...o }, caption });

export default lesson({
  id: 'math2280.DE-5.2',
  title: 'Phase-plane classification: the trace–determinant map',
  minutes: 12, difficulty: 3,
  intro: t`The eigenvalues of a 2×2 matrix solve $\lambda^2 - \tau\lambda + \Delta = 0$, so they depend on only two numbers, the trace $\tau$ and the determinant $\Delta$:

$$\lambda = \frac{\tau \pm \sqrt{\tau^2 - 4\Delta}}{2}, \qquad \lambda_1 + \lambda_2 = \tau, \quad \lambda_1\lambda_2 = \Delta.$$

So every linear system $\mathbf x' = A\mathbf x$ is a point $(\tau, \Delta)$ on one map, and the point decides the portrait. $\Delta < 0$: eigenvalues of opposite signs — a **saddle**. $\Delta > 0$: both eigenvalues have the sign of $\tau$, so $\tau < 0$ is stable and $\tau > 0$ unstable; above the parabola $\tau^2 = 4\Delta$ they are complex (**spirals**), below it real (**nodes**). The borders — the positive $\Delta$ axis (**centres**), the parabola (**degenerate nodes and stars**) and the line $\Delta = 0$ (**lines of equilibria**) — are thin: the slightest change of $A$ moves a system off them.`,
  symbols: [
    { tex: '\\tau', text: 'the trace $a + d$ of $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$: the sum of the eigenvalues, in 1/time. Its sign is the stability, when $\\Delta > 0$' },
    { tex: '\\Delta', text: 'the determinant $ad - bc$: the product of the eigenvalues, in 1/time². Negative means a saddle' },
    { tex: '\\tau^2 - 4\\Delta', text: 'the discriminant: positive for real eigenvalues (nodes, saddles), negative for complex ones (spirals, centres)' },
    { tex: '\\lambda', text: 'the eigenvalues, from the quadratic formula' },
  ],
  why: t`One picture holds the whole classification, and it is the picture engineers use: tuning a controller or a suspension moves a point across this map, and a nonlinear system’s equilibria can be placed on it through their Jacobians — trusted wherever they land inside a region.`,
  visual: {
    type: 'de-tracedet',
    title: 'Every 2×2 system on one map',
    lead: t`Drag the point $(\tau, \Delta)$ on the left; the right shows the phase portrait of $\mathbf x' = A\mathbf x$ for $A = ${M([[0, 1], ['-\\Delta', '\\tau']])}$ — the system of $x'' - \tau x' + \Delta x = 0$, with $x$ across and $x'$ up — and the readout gives its eigenvalues.`,
    tasks: [
      'Drag the point below the horizontal axis: a saddle, whatever the trace.',
      'From a stable spiral, drag down across the parabola: the spiral straightens into a node — at the parabola itself one eigenvector line remains, a degenerate node.',
      'Put the point on the gold half-line (τ = 0): closed orbits, a centre. A hair to either side and the orbits open into spirals.',
    ],
    params: { tau: -1, Delta: 2, snap: 0.05 },
    caption: 'Left: the trace–determinant map (green tint: stable; red: unstable; orange: saddles). Right: a representative portrait — any matrix with the same τ and Δ has the same type, though its eigenvector lines may point elsewhere. Arrows show direction only; time is scaled so each type shows clearly.',
  },
  example: {
    prompt: t`A 1 kg mass on a 4 N/m spring with a damper, $x'' + c\,x' + 4x = 0$, becomes $\mathbf x' = ${M([[0, 1], [-4, '-c']])}\mathbf x$. Follow its point on the map as the damping $c$ grows from 0, and find where its type changes.`,
    visual: {
      type: 'de-tracedet',
      params: {
        matrix: [[0, 1], ['-k', '-c']],
        sliders: [
          { key: 'c', label: 'Damping $c$', min: 0, max: 6, step: 0.1, value: 1, unit: '\\mathrm{kg/s}', explain: 'Moves the point left along the line Δ = k.' },
          { key: 'k', label: 'Spring constant $k$', min: -2, max: 5, step: 0.1, value: 4, unit: '\\mathrm{N/m}', explain: 'A negative $k$ pushes the mass away from equilibrium (an inverted pendulum).' },
        ],
        paths: [{ tau: '-t', Delta: '4', t: [0, 6], color: 'violet' }],
        map: { tau: [-6.5, 3], Delta: [-3, 7] }, ylabel: 'x′',
      },
      caption: 'The violet line is the path for k = 4 N/m as c runs from 0 to 6 kg/s. Slide c and watch the point and the portrait.',
    },
    steps: [
      { label: 'Trace and determinant', text: t`$\tau = -c$ and $\Delta = 4$. So as $c$ grows the point slides left along the horizontal line $\Delta = 4$, starting on the $\Delta$ axis.` },
      { label: 'No damping', text: t`$c = 0$: $(\tau, \Delta) = (0, 4)$, on the centre line. $\lambda = \pm2i$: closed orbits, period $\pi$ s.` },
      { label: 'Light damping', text: t`$0 < c < 4$: $\tau^2 = c^2 < 16 = 4\Delta$, above the parabola: a **stable spiral**. At $c = 1$, $\lambda = -0.5 \pm 1.936i$ — it rings while it decays.` },
      { label: 'Critical damping', text: t`$c = 4$: $\tau^2 = 16 = 4\Delta$, on the parabola: $\lambda = -2$ twice, a **degenerate node**. This is the critically damped oscillator of DE-3.5: the fastest return without overshoot.` },
      { label: 'Heavy damping', text: t`$c > 4$: below the parabola, a **stable node**. At $c = 5$, $\lambda = -1$ and $-4$: no ringing, and the slow eigenvalue $-1$ makes the return sluggish.` },
      { label: 'Sense check', text: t`The path never crosses $\Delta = 0$, so no amount of damping can make the rest position unstable. Only a negative $k$ — try it — drops the point below the axis into the saddles.` },
    ],
    answer: t`Centre at $c = 0$, stable spiral for $0 < c < 4$, degenerate node at $c = 4$ (critical damping, where $c^2 = 4k$), stable node for $c > 4$ kg/s.`,
  },
  practice: [
    {
      type: 'point', id: 'place', difficulty: 2,
      prompt: t`Drag the point to where $A = ${M([[1, -2], [3, -2]])}$ sits on the trace–determinant map.`,
      visual: { type: 'de-tracedet', params: { tau: 1.5, Delta: -1, panels: 'map', readout: false, snap: 0.05 }, caption: 'The trace–determinant map. Drag the point.' },
      answer: { x: -1, y: 4 }, tol: { x: 0.15, y: 0.15 },
      instruction: 'Drag the point to (τ, Δ) for this matrix, then check.',
      hints: ['τ is the sum of the diagonal entries; Δ = ad − bc.', t`$\tau = 1 + (-2)$ and $\Delta = (1)(-2) - (-2)(3)$.`],
      teach: 'A matrix’s place on the map is (trace, determinant) — two numbers you can read off without solving anything.',
      explain: t`$\tau = -1$ and $\Delta = -2 + 6 = 4$, so the point is $(-1, 4)$: above the parabola ($\tau^2 = 1 < 16$) and left of the axis — a stable spiral, with $\lambda = -0.5 \pm 1.94i$.`,
    },
    mcq({
      id: 'from-td', difficulty: 2,
      gen(r) {
        const [tau, Delta, kind] = r.pick([[-3, 2, 1], [-1, 3, 2], [2, 5, 3], [1, -4, 0], [-0.5, -1, 0], [-4, 3, 1], [0.5, 1, 3]]);
        const choices = ['A saddle', 'A stable node', 'A stable spiral', 'An unstable spiral'];
        const whyAll = {
          0: t`A saddle needs $\Delta < 0$; here $\Delta = ${n(Delta)}$.`,
          1: t`A stable node needs $\tau < 0$, $\Delta > 0$ and $\tau^2 > 4\Delta$; here $\tau^2 - 4\Delta = ${n(tau * tau - 4 * Delta)}$.`,
          2: t`A stable spiral needs $\tau < 0$ and $0 < \tau^2 < 4\Delta$; here $\tau = ${n(tau)}$ and $\tau^2 - 4\Delta = ${n(tau * tau - 4 * Delta)}$.`,
          3: t`An unstable spiral needs $\tau > 0$ and $\tau^2 < 4\Delta$; here $\tau = ${n(tau)}$ and $\Delta = ${n(Delta)}$.`,
        };
        const why = {}; for (const k of [0, 1, 2, 3]) if (k !== kind) why[k] = whyAll[k];
        return {
          prompt: t`A linear system has trace $\tau = ${n(tau)}$ and determinant $\Delta = ${n(Delta)}$. What is its equilibrium?`,
          choices, answer: kind, why,
          hints: ['First the sign of Δ: negative means a saddle.', t`If $\Delta > 0$: compare $\tau^2 = ${n(tau * tau)}$ with $4\Delta = ${n(4 * Delta)}$, and look at the sign of $\tau$.`],
          teach: 'Read the map in order: Δ < 0 saddle; otherwise τ² vs 4Δ picks node or spiral, and the sign of τ picks stable or unstable.',
          explain: t`$\Delta = ${n(Delta)}$${Delta < 0 ? ' < 0: a saddle, whatever the trace.' : t`$ > 0$, $\tau^2 - 4\Delta = ${n(tau * tau - 4 * Delta)}$ ${tau * tau - 4 * Delta > 0 ? '> 0 (real eigenvalues, a node)' : '< 0 (complex eigenvalues, a spiral)'}, and $\tau ${tau < 0 ? '< 0$: stable.' : '> 0$: unstable.'}`}`,
          visual: mapPic({ tau, Delta, labels: false, map: { tau: [-4.5, 4.5], Delta: [-5, 6] } }, 'The point (τ, Δ) on the map, with the region names left off.'),
        };
      },
    }),
    num({
      id: 'critical-R', difficulty: 3,
      gen(r) {
        const L = r.pick([0.2, 0.5, 1]), Cm = r.pick([1, 2, 5]), C = Cm * 1e-3;
        const R = 2 * Math.sqrt(L / C), D = 1 / (L * C), s = 2 * Math.sqrt(D);
        return {
          prompt: t`A series circuit with $L = ${L}$ H and $C = ${Cm}$ mF has $L\,q'' + R\,q' + q/C = 0$. Its point on the map is $(\tau, \Delta) = (-R/L,\ 1/LC)$. For which resistance does the point sit on the parabola, so that the circuit is critically damped?`,
          answer: R, units: 'Ω', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(L / C), feedback: t`On the parabola $\tau^2 = 4\Delta$: $R^2/L^2 = 4/(LC)$, so $R = 2\sqrt{L/C}$ — keep the 2.` }, { value: 2 * Math.sqrt(1 / (L * C)), feedback: t`That is $2\sqrt\Delta$, the size of $\tau$ at the border. Since $\tau = -R/L$, multiply by $L$.` }].filter((e) => Math.abs(e.value - R) > 0.01 * R),
          hints: [t`The parabola is $\tau^2 = 4\Delta$.`, t`$\left(\dfrac{R}{L}\right)^2 = \dfrac{4}{LC}$, so $R = 2\sqrt{L/C}$.`],
          teach: 'Critical damping is the point where the path crosses the parabola τ² = 4Δ; for a series RLC circuit that is R = 2√(L/C).',
          explain: t`$R = 2\sqrt{${L}/(${Cm}\times10^{-3})} = ${fmt(R, 3)}$ Ω. Less resistance and the charge rings (a spiral, above the parabola); more and it creeps back (a node, below). Every value of $R$ keeps $\Delta = 1/LC = ${fmt(D, 3)}$ s⁻², so the point slides along a horizontal line.`,
          visual: mapPic({ labels: true, marker: false, map: { tau: [r6(-2 * s), r6(0.6 * s)], Delta: [r6(-0.4 * D), r6(1.6 * D)] }, paths: [{ tau: `-${r6(2 * s)}*t`, Delta: `${r6(D)}`, t: [0, 1], color: 'violet', label: 'R increasing' }] }, 'The circuit’s path (violet) as R grows from zero: it starts on the centre line and runs left along Δ = 1/LC.'),
        };
      },
    }),
    mcq({
      id: 'det-alone', difficulty: 2, kind: 'error',
      prompt: t`A student reasons: “$A = ${M([[2, -5], [1, -1]])}$ has $\Delta = -2 + 5 = 3 > 0$, so it is not a saddle — so the origin is stable.” What is wrong?`,
      choices: [
        t`$\Delta > 0$ rules out a saddle, but stability needs $\tau < 0$; here $\tau = 1 > 0$, an unstable spiral`,
        t`Nothing: $\Delta > 0$ means both eigenvalues are negative`,
        t`The determinant is wrong: it is $-2 - 5 = -7$, a saddle`,
        t`$\Delta > 0$ means a centre`,
      ],
      answer: 0,
      why: {
        1: t`$\Delta > 0$ means the eigenvalues have the **same** sign (or are complex) — both positive is just as possible. The trace decides which.`,
        2: t`$\Delta = ad - bc = (2)(-1) - (-5)(1) = -2 + 5 = 3$. The student’s determinant is right.`,
        3: t`A centre needs $\Delta > 0$ **and** $\tau = 0$ exactly.`,
      },
      hints: ['What does Δ > 0 say about the signs of the two eigenvalues?', t`The trace is $2 + (-1) = 1$.`],
      teach: 'The determinant’s sign separates saddles from the rest; the trace’s sign then separates stable from unstable — you need both.',
      explain: t`$\tau = 1$, $\Delta = 3$, $\tau^2 - 4\Delta = -11$: $\lambda = 0.5 \pm 1.66i$, an **unstable** spiral. Classifying by the sign of the determinant alone is a common slip.`,
      visual: mapPic({ tau: 1, Delta: 3, labels: false }, 'The point (τ, Δ) = (1, 3) on the map, region names left off.'),
    }),
    multi({
      id: 'robust', difficulty: 3,
      prompt: t`An engineer’s matrix is only known to within small measurement errors in every entry. For which types can she still be sure of the type? Select all.`,
      choices: ['A saddle', 'A stable spiral', 'An unstable node', 'A centre', 'A degenerate node', 'A line of equilibria (Δ = 0)'],
      answer: [0, 1, 2],
      why: {
        3: 'Centres lie on the half-line τ = 0: any small change of the trace tips them into a spiral, in or out.',
        4: 'Degenerate nodes lie on the parabola τ² = 4Δ: a small change makes a node or a spiral.',
        5: 'Δ = 0 is a line on the map: a small change gives a saddle or a node instead.',
      },
      hints: ['Small changes in the entries move the point (τ, Δ) a little. Which types fill whole regions, and which sit on curves?', 'A point inside a region stays inside after a small move; a point on a curve does not.'],
      teach: 'Saddles, nodes and spirals fill open regions of the map and survive small changes; centres, degenerate nodes and lines of equilibria sit on borders and do not.',
      explain: t`Saddles, nodes and spirals occupy open regions, so a small error keeps the point inside. The border types — centres, degenerate nodes and stars, lines of equilibria — are knife-edges. They are exactly the non-hyperbolic cases where a nonlinear system’s linearization cannot be trusted (DE-5.1).`,
      visual: mapPic({ labels: true, marker: false }, 'The trace–determinant map: three open regions and the borders between them.'),
    }),
    mcq({
      id: 'path', difficulty: 3,
      prompt: t`The matrix $A = ${M([['a', 1], [-1, 'a']])}$ changes as $a$ goes from $-1$ to $1$. What happens to the equilibrium at the origin?`,
      choices: ['A stable spiral becomes a centre at a = 0, then an unstable spiral', 'A stable node becomes a saddle, then an unstable node', 'It stays a centre throughout', 'A stable spiral becomes a stable node, then an unstable node'],
      answer: 0,
      why: {
        1: t`$\Delta = a^2 + 1 > 0$ for every $a$, so it is never a saddle.`,
        2: t`Only at $a = 0$ is the trace zero; on either side it is not, so the orbits are spirals.`,
        3: t`$\tau^2 - 4\Delta = 4a^2 - 4(a^2 + 1) = -4 < 0$ always: always complex eigenvalues, so never a node.`,
      },
      hints: [t`$\tau = 2a$ and $\Delta = a^2 + 1$.`, t`$\tau^2 - 4\Delta = -4$: which side of the parabola? Then the sign of $\tau$ decides stability.`],
      teach: 'As a parameter changes, a system traces a path on the map; its type changes only where the path crosses a border.',
      explain: t`$\lambda = a \pm i$: the path $(2a, a^2 + 1)$ stays above the parabola and crosses the centre line at $a = 0$. A stable spiral turns into an unstable one — in a nonlinear system this is the birth of a limit cycle, a **Hopf bifurcation** (DE-5.5).`,
      visual: mapPic({ labels: true, marker: false, paths: [{ tau: '2*t', Delta: 't^2 + 1', t: [-1, 1], color: 'violet', label: 'a = 1' }], points: [{ tau: -2, Delta: 2, label: 'a = −1', color: 'violet' }] }, 'The path of (τ, Δ) as a runs from −1 to 1 (violet).'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-seismometer', difficulty: 3, transfer: true,
      gen(r) {
        const T0 = r.pick([1, 2, 5, 10]), w0 = (2 * Math.PI) / T0, c = 2 * w0;
        return {
          prompt: t`A seismometer’s pendulum, read as an angle, obeys $\theta'' + c\,\theta' + \omega_0^2\theta = 0$ with an undamped period of ${T0} s. Instrument makers tune $c$ close to the value where it stops ringing. At what $c$, in s⁻¹, does its point on the trace–determinant map reach the parabola?`,
          answer: c, units: 's^-1', tol: { rel: 0.005 },
          errors: [{ value: w0, feedback: t`On the parabola $\tau^2 = 4\Delta$: $c^2 = 4\omega_0^2$, so $c = 2\omega_0$.` }, { value: 2 / T0, feedback: t`$\omega_0$ is $2\pi/T$, an angular frequency: $c = 2\omega_0 = 4\pi/T$.` }],
          hints: [t`$\tau = -c$ and $\Delta = \omega_0^2$, with $\omega_0 = 2\pi/${T0}$ rad/s.`, t`On the parabola, $c^2 = 4\omega_0^2$.`],
          teach: 'For x″ + cx′ + ω₀²x = 0 the map point is (−c, ω₀²), and it meets the parabola — critical damping — at c = 2ω₀.',
          explain: t`$\omega_0 = 2\pi/${T0} = ${fmt(w0, 4)}$ rad/s, so $c = 2\omega_0 = ${fmt(c, 4)}$ s⁻¹. Real seismometers are usually set a little below this (damping ratio about 0.7), where the response is flattest across frequencies — just inside the spirals.`,
          visual: mapPic({ labels: true, marker: false, map: { tau: [r6(-3 * w0), r6(w0)], Delta: [r6(-0.5 * w0 * w0), r6(2 * w0 * w0)] }, paths: [{ tau: `-${r6(3 * w0)}*t`, Delta: `${r6(w0 * w0)}`, t: [0, 1], color: 'violet', label: 'c increasing' }] }, 'The seismometer’s path as its damping c grows (violet).'),
        };
      },
    }),
    mcq({
      id: 'cp-type', difficulty: 2,
      gen(r) {
        const [A, kind] = r.pick([[[[3, -1], [2, 1]], 3], [[[-2, 1], [-1, -3]], 1], [[[1, 4], [1, -2]], 0], [[[-5, 2], [1, -4]], 2], [[[0, 2], [-3, 0]], 4]]);
        const tr = A[0][0] + A[1][1], det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
        const names = ['a saddle', 'a stable spiral', 'a stable node', 'an unstable spiral', 'a centre'];
        const pick = [kind, ...[0, 1, 2, 3, 4].filter((k) => k !== kind).slice(0, 3)];
        const choices = pick.map((k) => names[k][0].toUpperCase() + names[k].slice(1));
        const why = {};
        pick.forEach((k, i) => { if (i) why[i] = t`That needs ${k === 0 ? '$\\Delta < 0$' : k === 4 ? '$\\tau = 0$ and $\\Delta > 0$' : k === 2 ? '$\\tau < 0$ and $0 < 4\\Delta < \\tau^2$' : k === 1 ? '$\\tau < 0$ and $\\tau^2 < 4\\Delta$' : '$\\tau > 0$ and $\\tau^2 < 4\\Delta$'}; here $\tau = ${tr}$, $\Delta = ${det}$.`; });
        return {
          prompt: t`Classify the origin of $\mathbf x' = ${M(A)}\,\mathbf x$.`,
          choices, answer: 0, why,
          hints: ['Compute τ and Δ, then read the map.'],
          teach: 'Two numbers, τ and Δ, place any 2×2 system on the map and fix its type.',
          explain: t`$\tau = ${tr}$, $\Delta = ${det}$, $\tau^2 - 4\Delta = ${tr * tr - 4 * det}$: ${names[kind]}.`,
          visual: mapPic({ labels: true, marker: false }, 'The trace–determinant map, for reference.'),
        };
      },
    }),
    num({
      id: 'cp-border', difficulty: 3,
      gen(r) {
        const p = r.pick([2, 3, 4]), q = r.pick([3, 5]), d = r.pick([-4, -2]);
        // A = [[a, p], [−q, d]]: Δ = ad + pq, zero at a = −pq/d
        const a = -(p * q) / d;
        return {
          prompt: t`For $A = ${M([['a', p], [-q, d]])}$, the origin is stable for small $a$. Above which value of $a$ is it a saddle?`,
          answer: a, tol: { rel: 1e-3, abs: 1e-6 },
          errors: [{ value: -d, feedback: t`$a = ${-d}$ makes the trace zero, but the trace is not what makes a saddle. A saddle needs $\Delta = ${d}a + ${p * q} < 0$.` }],
          hints: [t`$\Delta = ad - bc = ${d}a + ${p * q}$.`, t`A saddle needs $\Delta < 0$: solve $${d}a + ${p * q} < 0$.`],
          teach: 'The path of a one-parameter family enters the saddle region where it crosses Δ = 0.',
          explain: t`$\Delta = ${d}a + ${p * q} < 0$ when $a > ${n(a)}$. At $a = ${n(a)}$ exactly, $\Delta = 0$: one eigenvalue is zero and there is a whole line of equilibria — the border the path crosses.`,
          visual: mapPic({ labels: true, marker: false, map: { tau: [-8, 6], Delta: [-8, 20] }, paths: [{ tau: `t + (${d})`, Delta: `(${d})*t + ${p * q}`, t: [-2, 8], color: 'violet', label: 'a increasing' }] }, 'The path of (τ, Δ) as a increases (violet).'),
        };
      },
    }),
  ],
  sources: [
    { label: 'J. Lebl, Notes on Diffy Qs, §3.5 Two-dimensional systems and their vector fields', url: 'https://www.jirka.org/diffyqs/' },
    { label: 'MIT OpenCourseWare 18.03SC, Linear phase portraits: the trace–determinant plane', url: 'https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/' },
  ],
});
