// The contour integral as a sum of little arrows: cut the path into pieces
// Δzₖ, turn and stretch each by the value f(zₖ), and lay the products head to
// tail. Parametrising z(t) turns it into an ordinary integral of f(z(t))z′(t).
// The archetypes: ∮dz/z = 2πi (every arrow points straight up), ∮z² dz = 0
// (the arrows close into a loop), ∮z̄ dz = 2πir² (not analytic: the answer
// depends on the circle), and path independence when f has an antiderivative.
import { lesson, mcq, num } from '../../src/core/content.js';
import { cTeX, num as nm, argand, apart } from './_cx.js';
import { C, contour, integral, circle } from './_cx2.js';

const t = String.raw;
const PI = Math.PI;
const lin = (a) => (a === 1 ? 't' : a === -1 ? '-t' : `${a}t`);
const pole0 = [{ x: 0, y: 0, label: '0', kind: 'pole' }];

export default lesson({
  id: 'st-d.D5.1',
  title: 'Integrating along a path',
  minutes: 14, difficulty: 3,
  intro: t`Walk along a path $\gamma$ in the plane and cut it into short pieces $\Delta z_k$ — little arrows from one cut to the next. At each piece, take the value $f(z_k)$ and multiply: $f(z_k)\,\Delta z_k$ is the piece **turned and stretched** by $f$ (D1.1). Lay all these arrows head to tail and see where you end up. As the pieces shrink, that end point is the **contour integral**:

$$\int_\gamma f(z)\,dz = \lim_{\Delta z_k \to 0}\sum_k f(z_k)\,\Delta z_k = \int_a^b f\big(z(t)\big)\,z'(t)\,dt$$

The last form is how you compute it: describe the path as $z(t)$, $a \le t \le b$, and the arrow $dz$ becomes $z'(t)\,dt$. The answer is a complex number — a place in the plane, not an area.`,
  symbols: [
    { tex: t`\gamma`, text: 'the path (contour): a curve in the complex plane with a direction. A small circle on the integral sign, $\\oint$, says the path is closed' },
    { tex: t`z(t)`, text: t`a parametrisation of $\gamma$: the point reached at parameter $t$, running from $z(a)$ to $z(b)$` },
    { tex: t`z'(t)`, text: t`the velocity along the path, $x'(t) + i\,y'(t)$ — an arrow tangent to $\gamma$` },
    { tex: t`\Delta z_k`, text: t`the $k$-th small piece of the path, as an arrow (a complex number)` },
    { tex: t`f(z_k)`, text: t`the value of the function at that piece: a complex number that turns the piece by $\arg f$ and stretches it by $|f|$` },
    { tex: t`dz`, text: t`the limit of $\Delta z_k$: an infinitesimal arrow along the path, $dz = z'(t)\,dt$` },
  ],
  why: t`Contour integrals are the engine of everything that follows — Cauchy’s theorem, residues, real integrals that resist every calculus trick — and in two-dimensional flow the integral of the complex velocity round a wing is its circulation, which sets its lift.`,
  visual: {
    type: 'cx2-contour',
    title: 'Little arrows, head to tail',
    lead: t`Left: a circle cut into pieces, each carrying its arrow $f(z_k)\,\Delta z_k$ (coloured blue to orange along the way). Right: the same arrows laid head to tail from $0$; the gold ring is the exact integral. Press **Walk the contour** and watch the chain grow. Drag the circle’s centre (hollow ring) or its rim (solid handle).`,
    tasks: [
      t`For $1/z$, every arrow points straight up — $\Delta z/z = i\,\Delta\theta$ — so the chain climbs to $2\pi i \approx 6.28i$, whatever the radius. Drag the circle off the origin: the chain bends and ends at $0$.`,
      t`For $z^2$, the arrows turn three times as you go round, and the chain closes up into a loop: $\oint z^2\,dz = 0$, wherever you drag the circle.`,
      t`For $\bar z$, the unit circle gives $2\pi i$ again — but pull the rim out to radius 2 and it becomes $8\pi i$: $\bar z$ is not analytic, and the answer depends on the circle.`,
    ],
    params: {
      fns: [
        { f: '1/z', label: '$1/z$', marks: pole0 },
        { f: 'z^2', label: '$z^2$', marks: [] },
        { f: 'conj(z)', label: t`$\bar z$`, marks: [] },
        { f: '1/z^2', label: '$1/z^2$', marks: pole0 },
      ],
      contour: { kind: 'circle', c: [0, 0], r: 1 }, drag: true, x: [-2.2, 2.2], y: [-2.2, 2.2],
      n: 24, nSlider: true, walk: true, play: true, readout: ['I', 'sum'],
    },
    caption: t`The arrows on the left are drawn longer than true, all by one factor, so their directions and relative sizes show; the chain on the right is to scale. The sum of $N$ arrows samples $f$ at the middle of each piece, so it misses the integral by an amount that shrinks like $1/N^2$.`,
  },
  example: {
    prompt: t`Compute $\displaystyle\oint_{|z| = r} \frac{dz}{z}$, once anticlockwise round the circle of radius $r$ about $0$.`,
    visual: contour({ f: '1/z', contour: circle(1), marks: pole0, x: [-1.8, 1.8], y: [-1.8, 1.8], n: 16, readout: ['I'] }, t`Sixteen arrows $\Delta z/z$: each is $i\,\Delta\theta$, pointing straight up, so the chain is a vertical line of length $2\pi$.`),
    steps: [
      { label: 'Parametrise', text: t`$z(\theta) = re^{i\theta}$ for $0 \le \theta \le 2\pi$, so $z'(\theta) = ire^{i\theta}$ and $dz = ire^{i\theta}\,d\theta$.` },
      { label: 'Substitute', text: t`$\dfrac{dz}{z} = \dfrac{ire^{i\theta}\,d\theta}{re^{i\theta}} = i\,d\theta$. The radius cancels: a small piece of the circle is perpendicular to $z$ and $r\,d\theta$ long, so dividing by $z$ leaves $i\,d\theta$.` },
      { label: 'Integrate', text: t`$\displaystyle\oint \frac{dz}{z} = \int_0^{2\pi} i\,d\theta = 2\pi i$.` },
      { label: 'Picture', text: t`Every arrow points straight up, so nothing cancels: the chain climbs straight to $2\pi i \approx 6.28i$. Clockwise, every arrow points down and the answer is $-2\pi i$.` },
      { label: 'Compare', text: t`For $z^n$ with any other whole $n$, $z^n\,dz = ir^{n+1}e^{i(n+1)\theta}d\theta$ turns $n + 1$ times round, and the arrows cancel: $\oint z^n\,dz = 0$ for $n \ne -1$. This one fact powers the rest of the course.` },
    ],
    answer: t`$\oint_{|z| = r} dz/z = 2\pi i$ for every radius $r$.`,
  },
  practice: [
    {
      type: 'point', id: 'segment-z', difficulty: 2,
      gen(r) {
        const w = r.pick([[1, 1], [2, 1], [1, 2], [1, -1], [2, -1], [-1, 1]]);
        const ans = integral('z', { kind: 'segment', from: [0, 0], to: w });
        return {
          prompt: t`Parametrise the straight segment from $0$ to $w = ${cTeX(w)}$ as $z(t) = wt$, $0 \le t \le 1$, and compute $\displaystyle\int_\gamma z\,dz$. Drag the point to your answer.`,
          visual: argand({ view: 2.6, curves: [{ param: [`${w[0]}*t`, `${w[1]}*t`], t: [0, 1], color: 'violet', width: 2.6 }], arrows: [{ from: [w[0] * 0.4, w[1] * 0.4], to: [w[0] * 0.62, w[1] * 0.62], color: 'violet' }], pts: [{ z: w, label: 'w', color: 'violet' }], extra: { drag: [{ key: 'p', x: -2.5, y: -2, snap: 0.25 }] }, caption: t`The path (violet) from $0$ to $w$. The draggable point is your answer, a complex number on the same plane (snaps to quarters).` }),
          answer: { x: ans[0], y: ans[1] }, tol: { x: 0.13, y: 0.13 },
          instruction: 'Drag the point to the value of the integral, then check.',
          hints: [t`$z(t) = wt$ gives $z'(t) = w$, so $z\,dz = (wt)(w)\,dt = w^2 t\,dt$.`, t`$\int_0^1 w^2t\,dt = w^2/2$, and $w^2 = ${cTeX(C.mul(w, w))}$.`],
          teach: t`To integrate along a path, write $z = z(t)$ and $dz = z'(t)\,dt$; then it is an ordinary integral in $t$.`,
          explain: t`$\int_0^1 w^2t\,dt = \tfrac12 w^2 = \tfrac12(${cTeX(C.mul(w, w))}) = ${cTeX(ans)}$. It matches the antiderivative $z^2/2$ evaluated at the ends — no accident (see the last problems).`,
        };
      },
    },
    mcq({
      id: 'why-up', difficulty: 2,
      prompt: t`On a circle round $0$, every arrow $\Delta z_k/z_k$ of $\oint dz/z$ points straight up (the picture). Why?`,
      visual: contour({ f: '1/z', contour: circle(1.3), marks: pole0, x: [-2, 2], y: [-2, 2], n: 12, panel: 'none' }, t`Twelve pieces of the circle $|z| = 1.3$ with their arrows $\Delta z/z$ (drawn longer than true).`),
      choices: [
        t`Each piece $\Delta z$ is perpendicular to $z$, and dividing by $z$ turns $z$’s own direction to $1$ — so it turns $\Delta z$ to $i$, straight up`,
        t`Because $1/z$ has a pole at $0$, and poles always give vertical arrows`,
        t`Because the circle is traversed anticlockwise, which always gives imaginary arrows`,
        t`Because $|1/z|$ is the same all round the circle`,
      ],
      answer: 0,
      why: {
        1: t`$1/z^2$ also has a pole at $0$, and its arrows turn round and cancel: the direction comes from the geometry of $\Delta z/z$, not from “having a pole”.`,
        2: t`Anticlockwise only fixes up rather than down; for $z^2$ the same anticlockwise circle gives arrows in every direction.`,
        3: t`Equal sizes explain why the arrows are equally long, not why they all point the same way.`,
      },
      hints: [t`On a circle, the tangent direction at $z$ is $z$ turned by $90^\circ$: $\Delta z \approx i\,z\,\Delta\theta$.`, t`Divide by $z$.`],
      teach: t`On a circle round $0$, $dz = iz\,d\theta$, so $dz/z = i\,d\theta$ points straight up everywhere.`,
      explain: t`$\Delta z \approx iz\,\Delta\theta$: the piece is $z$ shrunk to length $|z|\Delta\theta$ and turned $90^\circ$. Dividing by $z$ undoes $z$’s own length and angle and leaves $i\,\Delta\theta$. All the arrows agree, so they add to $2\pi i$ with nothing cancelling.`,
    }),
    num({
      id: 'zbar-circle', difficulty: 2,
      gen(r) {
        const R = r.pick([0.5, 1.5, 2, 2.5, 3]);
        const ans = integral('conj(z)', circle(R))[1];
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\oint_{|z| = ${R}} \bar z\,dz$, once anticlockwise. (3 significant figures.)`,
          visual: contour({ f: 'conj(z)', contour: circle(R), x: [-3.3, 3.3], y: [-3.3, 3.3], n: 20, panel: 'none', ticks: true }, t`The circle $|z| = ${R}$ with its arrows $\bar z\,\Delta z$ (drawn shorter or longer than true, all by one factor).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 2 * PI, feedback: t`That is the unit circle’s answer. On $|z| = r$, $\bar z = r^2/z$, so the answer grows like $r^2$.` }, { value: 2 * PI * R, feedback: t`You have one factor of $r$ too few: $\bar z = re^{-i\theta}$ and $dz = ire^{i\theta}d\theta$ each carry an $r$.` }]),
          hints: [t`$z = ${R}e^{i\theta}$: then $\bar z = ${R}e^{-i\theta}$ and $dz = ${R}ie^{i\theta}\,d\theta$.`, t`Their product is $${nm(R * R, 4)}\,i\,d\theta$; integrate from $0$ to $2\pi$.`],
          teach: t`$\bar z$ is not analytic, and its loop integral depends on the loop: on $|z| = r$ it is $2\pi i r^2$.`,
          explain: t`$\bar z\,dz = r^2 i\,d\theta$, so $\oint \bar z\,dz = 2\pi i r^2 = ${nm(ans, 4)}i$ — twice $i$ times the enclosed area. (That is no coincidence: Green’s theorem gives $\oint \bar z\,dz = 2i \times$ area for any loop.)`,
        };
      },
    }),
    num({
      id: 'arc-dz-z', difficulty: 2,
      gen(r) {
        const [from, to, s0, s1, how] = r.pick([[0, PI / 2, '', 'i', 'anticlockwise'], [0, PI, '', '-', 'anticlockwise (the upper half)'], [0, -PI, '', '-', 'clockwise (the lower half)'], [PI / 2, -PI / 2, 'i', '-i', 'clockwise (the right half)'], [0, 1.5 * PI, '', '-i', 'anticlockwise (three quarters of a turn)']]);
        const R = r.pick([1, 1.5, 2]);
        const pt = (s) => (s === '' ? `${R}` : s === '-' ? `-${R}` : s === 'i' ? `${R === 1 ? '' : R}i` : `-${R === 1 ? '' : R}i`);
        const desc = t`from $${pt(s0)}$ ${how} to $${pt(s1)}$`;
        const spec = { kind: 'arc', c: [0, 0], r: R, from, to };
        const ans = integral('1/z', spec)[1];
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\int_\gamma \frac{dz}{z}$, where $\gamma$ is the arc of the circle $|z| = ${R}$ ${desc}. (3 significant figures.)`,
          visual: contour({ f: '1/z', contour: spec, marks: pole0, x: [-2.4, 2.4], y: [-2.4, 2.4], n: 12, panel: 'none' }, t`The arc with its arrows $\Delta z/z$ (drawn longer than true). The violet chevrons give the direction.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: -ans, feedback: 'Check the direction: anticlockwise turning makes Δz/z point up (positive imaginary), clockwise down.' }, { value: ans * R, feedback: t`The radius cancels in $dz/z = i\,d\theta$.` }]),
          hints: [t`On the circle, $dz/z = i\,d\theta$: the integral is $i$ times the angle turned.`, t`The angle turned is ${nm(to - from, 3)} radians (negative for clockwise).`],
          teach: t`Along any arc of a circle round $0$, $\int dz/z = i\,\Delta\theta$, the angle swept (with its sign).`,
          explain: t`$\int dz/z = i\,\Delta\theta = ${nm(to - from, 4)}\,i$: imaginary part $${nm(ans, 4)}$. This is the logarithm again — $\int dz/z$ along a path is the change in $\log z$, whose imaginary part is the angle.`,
        };
      },
    }),
    num({
      id: 'path-indep', difficulty: 3,
      gen(r) {
        const end = r.pick([[1, 1], [2, 1], [1, -1], [2, 0.5]]), h = r.pick([0.6, 1, -0.8]);
        const spec = { kind: 'param', param: [`${end[0]}*t`, `${end[1]}*t + ${h}*sin(pi*t)`], t: [0, 1] };
        const zt = (s) => [end[0] * s, end[1] * s + h * Math.sin(PI * s)];
        const ans = integral('2z + 1', { kind: 'param', z: zt, t: [0, 1] })[0];
        return {
          prompt: t`$\gamma$ is the wavy path $z(t) = ${lin(end[0])} + i\big(${lin(end[1])} ${h < 0 ? '-' : '+'} ${Math.abs(h)}\sin\pi t\big)$, $0 \le t \le 1$, from $0$ to $${cTeX(end)}$. Find $\operatorname{Re}\displaystyle\int_\gamma (2z + 1)\,dz$ without parametrising the integral.`,
          visual: contour({ f: '2z + 1', contour: spec, x: [-0.8, 2.8], y: [-2.1, 2.1], n: 14, panel: 'none' }, t`The wavy path with its arrows $(2z + 1)\Delta z$ (drawn larger than true).`),
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: apart(ans, [{ value: C.mul(end, end)[0], feedback: t`You found $\operatorname{Re} z^2$ at the end. The antiderivative of $2z + 1$ is $z^2 + z$.` }]),
          hints: [t`$2z + 1$ has an antiderivative, $F(z) = z^2 + z$, with $F' = 2z + 1$.`, t`Then $\int_\gamma (2z + 1)\,dz = F(\text{end}) - F(\text{start})$ for any path: only the end points matter.`],
          teach: t`If $f = F'$ on a region containing the path, $\int_\gamma f\,dz = F(\text{end}) - F(\text{start})$ — the path’s wiggles do not matter.`,
          explain: t`$F(${cTeX(end)}) - F(0)$ with $F = z^2 + z$: $(${cTeX(C.mul(end, end))}) + (${cTeX(end)}) = ${cTeX(C.add(C.mul(end, end), end))}$, real part $${nm(ans, 4)}$. The fundamental theorem of calculus works along complex paths, because $\frac{d}{dt}F(z(t)) = F'(z(t))\,z'(t)$.`,
        };
      },
    }),
    mcq({
      id: 'zbar-antideriv', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “$\bar z$ has antiderivative $\tfrac12\bar z^2$, so $\int_\gamma \bar z\,dz = \tfrac12\overline{(1 + i)}^{\,2} - 0 = -i$ along **any** path from $0$ to $1 + i$.” The picture shows two paths; along the straight one the integral is $1$, along the L-shaped one $1 + i$. What went wrong?`,
      visual: argand({ view: 1.4, center: [0.5, 0.5], curves: [{ param: ['t', 't'], t: [0, 1], color: 'violet', width: 2.6 }, { param: ['min(2t, 1)', 'max(2t - 1, 0)'], t: [0, 1], color: 'gold', width: 2.6 }], pts: [{ z: [1, 1], label: '1 + i', color: 'ink2' }, { z: [0, 0], label: '0', color: 'ink2' }], caption: t`Two paths from $0$ to $1 + i$: straight (violet) and through $1$ (gold). Their integrals of $\bar z$ differ, computed by quadrature: $1$ and $1 + i$.` }),
      choices: [
        t`$\tfrac12\bar z^2$ is not an antiderivative: $\bar z$ has no complex derivative, so $\frac{d}{dz}\tfrac12\bar z^2$ does not exist, and no function has derivative $\bar z$`,
        t`The antiderivative is right, but the student mis-evaluated $\overline{(1 + i)}^{\,2}$`,
        'Contour integrals never depend only on the end points',
        t`The paths must be closed for the antiderivative rule to apply`,
      ],
      answer: 0,
      why: {
        1: t`$\tfrac12(1 - i)^2 = -i$ is evaluated correctly — and still disagrees with both paths. The rule itself does not apply.`,
        2: t`They do, whenever $f$ has an antiderivative on a region holding the path — $\int (2z + 1)\,dz$, for instance.`,
        3: t`The end-point rule is for open paths; for a closed path it gives $0$.`,
      },
      hints: [t`The rule $\int_\gamma F'(z)\,dz = F(\text{end}) - F(\text{start})$ needs $F$ to be complex-differentiable with $F' = f$.`, t`Is $\bar z^2$ complex-differentiable? (Think of the amplitwist of $\bar z$.)`],
      teach: t`Path independence needs a genuine (complex-differentiable) antiderivative; $\bar z$ has none, so its integrals depend on the path.`,
      explain: t`If $\int \bar z\,dz$ were path independent, its value round every closed loop would be $0$ — but round the unit circle it is $2\pi i$. The student treated $\bar z$ like a real variable. Along the straight path $z = (1 + i)t$: $\bar z\,dz = (1 - i)(1 + i)t\,dt = 2t\,dt$, giving $1$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mixed', difficulty: 3,
      gen(r) {
        const a = r.pick([2, 3, -1, 0.5]), b = r.pick([4, -2, 5]), c = r.pick([3, -3, 1]);
        const R = r.pick([1, 2]);
        const src = `${a}/z + ${b}*z^2 + ${c}/z^2`;
        const ans = integral(src, circle(R))[1];
        return {
          prompt: t`Compute $\operatorname{Im}\displaystyle\oint_{|z| = ${R}} \left(\frac{${a}}{z} ${b < 0 ? '-' : '+'} ${Math.abs(b)}z^2 ${c < 0 ? '-' : '+'} \frac{${Math.abs(c)}}{z^2}\right)dz$, once anticlockwise. (3 significant figures.)`,
          visual: contour({ f: src, contour: circle(R), marks: pole0, x: [-2.4, 2.4], y: [-2.4, 2.4], n: 24, panel: 'none' }, t`The circle and its arrows $f\,\Delta z$ (drawn larger than true).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: 2 * PI * (a + c), feedback: t`$\oint dz/z^2 = 0$: only the power $z^{-1}$ survives a lap.` }, { value: 2 * PI * (a + b + c), feedback: t`$\oint z^n\,dz = 0$ for every whole $n$ except $-1$.` }, { value: a, feedback: t`$\oint dz/z = 2\pi i$, not $i$.` }]),
          hints: [t`Integrate term by term: $\oint z^n\,dz$ is $2\pi i$ for $n = -1$ and $0$ for every other whole $n$.`, t`Only the $${a}/z$ term survives.`],
          teach: t`Round a circle about $0$, every power $z^n$ integrates to zero except $z^{-1}$, which gives $2\pi i$.`,
          explain: t`$${a}\times 2\pi i + 0 + 0 = ${nm(2 * a, 3)}\pi i$: imaginary part $${nm(ans, 4)}$. The radius does not matter.`,
        };
      },
    }),
    num({
      id: 'cp-exp-path', difficulty: 2,
      gen(r) {
        const [w, wi] = r.pick([[[1, PI / 2], t`\tfrac{\pi}{2}i`], [[1, PI], t`\pi i`], [[0.5, PI], t`\pi i`], [[1.5, PI / 3], t`\tfrac{\pi}{3}i`], [[2, PI / 2], t`\tfrac{\pi}{2}i`]]);
        const ans = integral('exp(z)', { kind: 'poly', pts: [[0, 0], [w[0], 0], w], closed: false })[0];
        const wt = `${nm(w[0], 3)} + ${wi}`;
        return {
          prompt: t`Find $\operatorname{Re}\displaystyle\int_\gamma e^z\,dz$ along the path that runs straight from $0$ to $${nm(w[0], 3)}$ and then straight up to $${wt}$. (3 significant figures.)`,
          visual: contour({ f: 'exp(z)', contour: { kind: 'poly', pts: [[0, 0], [w[0], 0], w], closed: false }, x: [-1, 3], y: [-0.8, 3.6], n: 14, panel: 'none' }, t`The two-leg path with its arrows $e^z\,\Delta z$ (drawn smaller than true).`),
          answer: ans, tol: { rel: 0.005, abs: 0.005 },
          errors: apart(ans, [{ value: Math.exp(w[0]) * Math.cos(w[1]), feedback: t`That is $\operatorname{Re} e^{w}$; subtract the value at the start, $e^0 = 1$.` }]),
          hints: [t`$e^z$ is its own antiderivative, everywhere.`, t`$\int_\gamma e^z\,dz = e^{w} - e^0$, with $e^w = e^{${nm(w[0], 3)}}(\cos ${nm(w[1], 3)} + i\sin ${nm(w[1], 3)})$.`],
          teach: t`An entire function with an antiderivative integrates to $F(\text{end}) - F(\text{start})$ along any path.`,
          explain: t`$e^{w} - 1$ has real part $e^{${nm(w[0], 3)}}\cos(${nm(w[1], 3)}) - 1 = ${nm(ans, 4)}$. The two legs are irrelevant; any path to the same end gives the same.`,
        };
      },
    }),
    num({
      id: 'cp-lift', difficulty: 3, transfer: true,
      gen(r) {
        const U = r.pick([50, 70, 90]), k = r.pick([6, 8, 10]), rho = 1.225;
        const ans = rho * U * integral(`${U} - ${k}i/z + 3/z^2`, circle(5))[0];
        return {
          prompt: t`In ideal two-dimensional airflow, the **complex velocity** $w(z) = v_x - i\,v_y$ has a remarkable loop integral: $\oint w\,dz = \Gamma + iQ$, where $\Gamma$ is the circulation round the loop and $Q$ the volume flux out of it (per metre of span). Far from a wing section in a $${U}$ m/s airstream, $w(z) \approx ${U} - \dfrac{${k}i}{z} + \dfrac{3}{z^2}$, with $z$ in metres. By the Kutta–Joukowski theorem the lift per metre of span is $L' = \rho U \Gamma$. Find $L'$ for sea-level air, $\rho = 1.225\ \text{kg/m}^3$, using a circle of radius $5$ m round the wing.`,
          visual: contour({ f: `${U} - ${k}i/z + 3/z^2`, contour: circle(5), x: [-7, 7], y: [-7, 7], n: 24, panel: 'none', marks: [{ x: 0, y: 0, label: 'wing', kind: 'point' }], arrowsOn: 'f' }, t`The measuring circle (radius 5 m) with the flow’s complex velocity $w$ at 24 points (drawn as arrows of $w$, to one scale). The wing sits at the centre, far smaller than the circle. Ideal flow: no viscosity, no wake.`),
          answer: ans, units: 'N/m', tol: { rel: 0.01 },
          errors: apart(ans, [{ value: rho * U * k, feedback: t`The circulation is $\oint w\,dz$, which turns the coefficient $-${k}i$ of $1/z$ into $2\pi i(-${k}i) = ${nm(2 * PI * k, 4)}$; you dropped the $2\pi$.` }, { value: rho * U * U * 2 * PI * 5, feedback: t`The constant term $${U}$ integrates to zero round a closed loop.` }]),
          hints: [t`Integrate term by term round the circle: constants and $1/z^2$ give $0$; $1/z$ gives $2\pi i$.`, t`$\oint w\,dz = 2\pi i\times(-${k}i) = 2\pi\times${k}$, which is real: $\Gamma = ${nm(2 * PI * k, 4)}\ \text{m}^2/\text{s}$, $Q = 0$.`],
          teach: t`Only the $1/z$ term of a flow’s complex velocity survives a loop: its coefficient times $2\pi i$ gives circulation (and source strength).`,
          explain: t`$\Gamma = 2\pi\times${k} = ${nm(2 * PI * k, 4)}\ \text{m}^2/\text{s}$, so $L' = 1.225\times${U}\times${nm(2 * PI * k, 4)} = ${nm(ans, 4)}$ N/m. Any loop round the wing gives the same $\Gamma$ — the next lesson says why. This is an ideal-flow model: real lift needs viscosity to set $\Gamma$ (the Kutta condition), a story for conformal maps (D10).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 8 (complex integration)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), ch. 4', url: 'https://openlibrary.org/isbn/9780073383170' },
    { label: 'Anderson, Fundamentals of Aerodynamics, ch. 3 (circulation and the Kutta–Joukowski theorem)', url: 'https://openlibrary.org/search?q=Anderson+Fundamentals+of+Aerodynamics' },
  ],
});
