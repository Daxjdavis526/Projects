// Arc length and curvature — the length of a space curve, the arc-length
// function and unit-speed parametrization, curvature as the turning rate of
// the unit tangent per unit length, the osculating circle, and the curvature
// of graphs. Curvature is a property of the shape, not of the speed.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice } from '../../src/core/format.js';
import { sub, cross, norm, vecTeX, pickExpr } from './_space.js';

const t = String.raw;
const D = Math.PI / 180;
const near = (a, b) => Math.abs(a - b) <= 0.006 * Math.max(Math.abs(b), 1e-9);
// keep only the error values a grader could tell apart from the answer and each other
const distinct = (answer, errs) => errs.filter((e, k) => Number.isFinite(e.value) && !near(e.value, answer) && !errs.slice(0, k).some((f) => near(e.value, f.value)));

// the Explore's curves, all for 0 ≤ t ≤ 4π: a helix, the parabola y = x², an
// ellipse, and the same ellipse traced at an uneven pace u = t + 0.9 sin t
const X = '((t - 2*pi)/4)', UN = '(t + 0.9*sin(t))';
const CURVES = [
  ['2*cos(t)', '2*sin(t)', '0.4*t - 2.5'],
  [X, `${X}^2`, '0'],
  ['2.5*cos(t/2)', '1.2*sin(t/2)', '0'],
  [`2.5*cos(${UN}/2)`, `1.2*sin(${UN}/2)`, '0'],
];

// a clothoid (Euler spiral) with κ(s) = s/A², as a power series in u = s/A:
// x = A∫₀ᵘ cos(w²/2) dw, y = A∫₀ᵘ sin(w²/2) dw (six terms: error below 1e-6 A for u ≤ 2)
function clothoid(A) {
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1)), u = `(t/${A})`, xs = [], ys = [];
  for (let n = 0; n < 6; n++) {
    const sg = n % 2 ? '-' : '+';
    xs.push(`${sg} ${u}^${4 * n + 1}/${(4 * n + 1) * fact(2 * n) * 4 ** n}`);
    ys.push(`${sg} ${u}^${4 * n + 3}/${(4 * n + 3) * fact(2 * n + 1) * 2 ** (2 * n + 1)}`);
  }
  const body = (terms) => terms.join(' ').replace(/^\+ /, '');
  return [`${A}*(${body(xs)})`, `${A}*(${body(ys)})`, '0'];
}

const ARC = [
  { tex: t`\langle 2t,\ t^2,\ \tfrac13 t^3\rangle`, param: ['2*t', 't^2', 't^3/3'], f: (u) => [2 * u, u * u, u ** 3 / 3], a: 0, bs: [1, 2, 3], L: (a, b) => b ** 3 / 3 + 2 * b - (a ** 3 / 3 + 2 * a), hint: t`$|\vec r\,'(t)|^2 = 4 + 4t^2 + t^4 = (t^2 + 2)^2$, so $|\vec r\,'(t)| = t^2 + 2$.`, int: t`\int_{A}^{B} (t^2 + 2)\,dt` },
  { tex: t`\langle e^t\cos t,\ e^t\sin t,\ e^t\rangle`, param: ['exp(t)*cos(t)', 'exp(t)*sin(t)', 'exp(t)'], f: (u) => [Math.exp(u) * Math.cos(u), Math.exp(u) * Math.sin(u), Math.exp(u)], a: 0, bs: [1, 1.5, 2], L: (a, b) => Math.sqrt(3) * (Math.exp(b) - Math.exp(a)), hint: t`$\vec r\,'(t) = e^t\langle \cos t - \sin t,\ \sin t + \cos t,\ 1\rangle$ and $|\vec r\,'(t)| = \sqrt3\,e^t$.`, int: t`\int_{A}^{B} \sqrt3\,e^t\,dt` },
  { tex: t`\langle t^2,\ 2t,\ \ln t\rangle`, param: ['t^2', '2*t', 'ln(t)'], f: (u) => [u * u, 2 * u, Math.log(u)], a: 1, bs: [2, 3, 4], L: (a, b) => b * b - a * a + Math.log(b / a), hint: t`$|\vec r\,'(t)|^2 = 4t^2 + 4 + 1/t^2 = (2t + 1/t)^2$, so $|\vec r\,'(t)| = 2t + 1/t$.`, int: t`\int_{A}^{B} \left(2t + \frac1t\right)dt` },
];

// a uniformly scaled copy of a curve's samples fitting a box of half-width 2.6
const fitScale = (f, a, b) => {
  let m = 0;
  for (let k = 0; k <= 60; k++) m = Math.max(m, ...f(a + ((b - a) * k) / 60).map(Math.abs));
  return 2.6 / m;
};
// a curve whose length is asked for, scaled to fit, with the straight chord between its ends
function arcPic(param, f, a, b) {
  const s = +fitScale(f, a, b).toFixed(4), P = (u) => f(u).map((v) => +(v * s).toFixed(4));
  return {
    type: 'calc-vectors3d',
    params: {
      range: 3,
      curves: [{ param: param.map((p) => `${s}*(${p})`), t: [a, b], color: 'accent', width: 2.6 }],
      segments: [{ from: P(a), to: P(b), color: 'ink3', dash: true }],
      points: [{ at: P(a), color: 'gold' }, { at: P(b), color: 'gold' }],
    },
    caption: 'Drag to rotate. The curve (blue), scaled down to fit, and the straight chord between its ends (dashed).',
  };
}

export default lesson({
  id: 'math2210.C3-2.3',
  title: 'Arc length and curvature',
  minutes: 12, difficulty: 2,
  intro: t`The length of a curve is the integral of its speed:

$$L = \int_a^b |\vec r\,'(t)|\,dt, \qquad s(t) = \int_a^t |\vec r\,'(u)|\,du$$

The **arc-length function** $s(t)$ measures distance along the curve from its start. Solving it for $t$ and substituting gives the **arc-length parametrization** $\vec r(s)$, which runs at unit speed: $|d\vec r/ds| = 1$.

**Curvature** is how fast the unit tangent turns, per unit of length travelled:

$$\kappa = \left|\frac{d\vec T}{ds}\right| = \frac{|\vec T\,'(t)|}{|\vec r\,'(t)|} = \frac{|\vec r\,'\times\vec r\,''|}{|\vec r\,'|^3}$$

A circle of radius $R$ has $\kappa = 1/R$ everywhere; a straight line has $\kappa = 0$. At each point the **osculating circle**, of radius $1/\kappa$ and centred on the inside of the bend, is the circle that hugs the curve best. For a plane curve whose tangent makes the angle $\varphi$ with the $x$-axis, $\kappa = |d\varphi/ds|$: the turning rate. For a graph $y = f(x)$, $\kappa = |f''|/(1 + f'^2)^{3/2}$. Curvature belongs to the shape: tracing the same curve faster or slower changes $\vec r\,'$ but not $\kappa$.`,
  symbols: [
    { tex: 's', text: t`arc length: distance measured along the curve from its starting point` },
    { tex: 'L', text: t`the total length of the curve between $t = a$ and $t = b$` },
    { tex: '\\kappa', text: t`curvature, in units of 1/length: how many radians the tangent turns per unit of distance` },
    { tex: 'R = 1/\\kappa', text: t`the radius of curvature, the radius of the osculating circle` },
    { tex: '\\varphi', text: t`for a plane curve, the angle from the $x$-axis to the tangent` },
  ],
  why: t`Curvature sets how hard a path pushes on whatever follows it: at speed $v$ on a path of curvature $\kappa$ a car, train or aircraft needs the sideways acceleration $\kappa v^2$ (C3-2.4). That is why railways and highways specify a minimum radius, and why their transition curves let $\kappa$ grow gradually. In relativity a clock’s proper time is the “arc length” of its worldline through spacetime.`,
  visual: {
    type: 'c3-curve',
    title: 'The circle that hugs the curve',
    lead: t`The gold dashed circle is the osculating circle at the moving point: radius $1/\kappa$, centre on the inside of the bend. Pick a curve, press **Play**, and watch it grow on gentle stretches and shrink in tight ones. The readouts give the arc length $s$ travelled from $t = 0$, the speed, $\kappa$ and $R = 1/\kappa$.`,
    tasks: [
      t`**Helix**: the circle keeps one size all the way round, $\kappa = 2/(2^2 + 0.4^2) \approx 0.48$, and $s$ grows at the steady rate $\sqrt{4 + 0.16} \approx 2.04$ per unit of $t$.`,
      t`**Parabola** $y = x^2$: the circle is smallest at the vertex — radius $\frac12$, $\kappa = 2$ — and swells as the curve straightens out on either side.`,
      t`**Ellipse**, then **Ellipse, uneven pace**, both at $t = 2\pi$: the same point, the same circle and $\kappa \approx 1.74$, but different speeds. Curvature belongs to the curve, not to how fast it is traced.`,
    ],
    params: {
      curve: { param: [0, 1, 2].map((k) => pickExpr('q', CURVES.map((c) => c[k]))), t: [0, 4 * Math.PI] },
      choices: [{ key: 'q', label: 'Curve', options: [[0, 'Helix'], [1, 'Parabola'], [2, 'Ellipse'], [3, 'Ellipse, uneven pace']], value: 0, explain: 'Helix $\\langle 2\\cos t, 2\\sin t, 0.4t - 2.5\\rangle$; parabola $y = x^2$; ellipse $\\frac{x^2}{2.5^2} + \\frac{y^2}{1.2^2} = 1$, traced evenly or with its pace varying.' }],
      at: 1.5, show: ['T', 'N', 'circle', 'trail'], toggles: ['T', 'N', 'circle'], scale: { frame: 0.9 }, speed: 1.2,
      readouts: ['t', 's', 'speed', 'kappa', 'R'],
    },
    caption: 'Drag to rotate. T (blue) and N (orange) ride with the point; one grid square is one unit.',
  },
  example: {
    prompt: t`A coil spring is wound from wire along $\vec r(t) = \left\langle 15\cos t,\ 15\sin t,\ \frac{8}{2\pi}t\right\rangle$ mm: radius 15 mm, rising 8 mm per turn, 10 turns ($0 \le t \le 20\pi$). How long is the wire? Reparametrize it by arc length, and find how sharply the wire is bent — its curvature and radius of curvature.`,
    visual: {
      type: 'c3-curve',
      params: { curve: { param: ['1.5*cos(t)', '1.5*sin(t)', `${nice(0.8 / (2 * Math.PI), 5)}*t`], t: [0, 6 * Math.PI] }, at: 2, show: ['T', 'N', 'circle', 'trail'], toggles: ['circle'], readouts: ['s', 'kappa', 'R'], units: { len: '\\text{cm}' }, speed: 1.5, range: 2.2, target: [0, 0, 1.1] },
      caption: 'Drag to rotate; Play runs along the wire. The first 3 of the 10 turns, in centimetres, with the osculating circle at the moving point.',
    },
    steps: [
      { label: 'Speed', text: t`$\vec r\,'(t) = \langle -15\sin t,\ 15\cos t,\ c\rangle$ with $c = \frac{8}{2\pi} = 1.273$ mm, so $|\vec r\,'(t)| = \sqrt{225 + c^2} = 15.054$ mm per radian — the same at every $t$.` },
      { label: 'Length', text: t`$L = \int_0^{20\pi} 15.054\,dt = 20\pi(15.054) = 945.9$ mm. Ten circles of radius 15 mm would need $942.5$ mm; the climb adds about 3 mm.` },
      { label: 'Arc length', text: t`$s(t) = 15.054\,t$, so $t = s/15.054$ and $\vec r(s) = \left\langle 15\cos\frac{s}{15.054},\ 15\sin\frac{s}{15.054},\ \frac{c\,s}{15.054}\right\rangle$, $0 \le s \le 945.9$ — a unit-speed description.` },
      { label: 'Curvature', text: t`$\vec T = \vec r\,'/|\vec r\,'| = \langle -15\sin t, 15\cos t, c\rangle/15.054$, so $\vec T\,'(t) = \langle -15\cos t, -15\sin t, 0\rangle/15.054$ with length $15/15.054$. Then $\kappa = \frac{|\vec T\,'|}{|\vec r\,'|} = \frac{15}{15.054^2} = \frac{15}{226.62} = 0.06619$ mm⁻¹.` },
      { label: 'Read it', text: t`The radius of curvature is $1/\kappa = 15.11$ mm — a little more than the coil’s radius, because the wire also climbs. In general a helix $\langle a\cos t, a\sin t, ct\rangle$ has $\kappa = \frac{a}{a^2 + c^2}$, the same everywhere.` },
    ],
    answer: t`$L = 945.9$ mm; $\vec r(s) = \left\langle 15\cos\frac{s}{15.054},\ 15\sin\frac{s}{15.054},\ 0.0846\,s\right\rangle$; $\kappa = 0.0662$ mm⁻¹, so the wire is bent to a radius of $15.11$ mm.`,
  },
  practice: [
    num({
      id: 'arc-length', difficulty: 2,
      gen(r) {
        const F = r.pick(ARC), b = r.pick(F.bs), a = F.a, L = F.L(a, b);
        const chord = norm(sub(F.f(b), F.f(a)));
        const errors = distinct(L, [{ value: chord, feedback: 'That is the straight-line distance between the endpoints. The curve is longer than its chord: integrate the speed along the way.' }]);
        return {
          prompt: t`Find the length of the curve $\vec r(t) = ${F.tex}$ for $${a} \le t \le ${b}$. Give 3 significant figures.`,
          answer: L, tol: { rel: 0.005 }, errors,
          hints: [F.hint, t`$L = ${F.int.replace('A', a).replace('B', b)}$.`],
          teach: 'Arc length is the integral of the speed |r′(t)| over the parameter interval.',
          explain: t`$L = ${F.int.replace('A', a).replace('B', b)} = ${nice(L, 4)}$. For comparison, the straight chord between the endpoints is only $${nice(chord, 4)}$.`,
          visual: arcPic(F.param, F.f, a, b),
        };
      },
    }),
    expr({
      id: 'arc-param', difficulty: 2,
      gen(r) {
        const [a, b, c] = r.pick([[4, 3, 5], [8, 6, 10], [12, 5, 13], [24, 7, 25]]), k = r.int(0, 2), name = 'xyz'[k];
        const g = (m, n) => (n ? g(n, m % n) : m), q = g(b, c), bq = b / q, cq = c / q;
        const ans = [`${a}*cos(s/${c})`, `${a}*sin(s/${c})`, `${bq}*s/${cq}`][k];
        const ansTeX = [t`${a}\cos\frac{s}{${c}}`, t`${a}\sin\frac{s}{${c}}`, t`\frac{${bq}}{${cq}}s`][k];
        const errors = [
          { answer: [`${a}*cos(${c}*s)`, `${a}*sin(${c}*s)`, `${b * c}*s`][k], feedback: t`$s = ${c}t$ means $t = s/${c}$, not $${c}s$.` },
          { answer: [`${a}*cos(s)`, `${a}*sin(s)`, `${b}*s`][k], feedback: t`Replacing $t$ by $s$ is not a reparametrization: $t = s/${c}$, since the curve covers ${c} units of length per unit of $t$.` },
        ];
        // one turn, uniformly scaled, with points every twelfth of a turn: equal steps of arc length
        const sc = 2.4 / Math.max(a, Math.PI * b), pts = Array.from({ length: 13 }, (_, j) => (j * Math.PI) / 6);
        return {
          prompt: t`Reparametrize the helix $\vec r(t) = \langle ${a}\cos t,\ ${a}\sin t,\ ${b}t\rangle$ by arc length $s$ measured from $t = 0$. What is the $${name}$-component of $\vec r(s)$?`,
          answer: ans, answerTeX: ansTeX, lhs: name, vars: { s: [0, 3 * c] }, errors,
          hints: [t`$|\vec r\,'(t)| = \sqrt{${a * a} + ${b * b}} = ${c}$, so $s = ${c}t$.`, t`Substitute $t = s/${c}$.`],
          teach: 'To parametrize by arc length, find s(t), solve for t, and substitute.',
          explain: t`$|\vec r\,'(t)| = \sqrt{${a}^2\sin^2 t + ${a}^2\cos^2 t + ${b}^2} = ${c}$, so $s = ${c}t$ and $t = s/${c}$: $\vec r(s) = \left\langle ${a}\cos\frac{s}{${c}},\ ${a}\sin\frac{s}{${c}},\ \frac{${bq}}{${cq}}s\right\rangle$, which moves at unit speed. Its $${name}$-component is $${ansTeX}$.`,
          visual: {
            type: 'calc-vectors3d',
            params: {
              range: 2.8,
              curves: [{ param: [`${sc * a}*cos(t)`, `${sc * a}*sin(t)`, `${sc * b}*(t - pi)`], t: [0, 2 * Math.PI], color: 'accent', width: 2.4 }],
              points: pts.map((u) => ({ at: [sc * a * Math.cos(u), sc * a * Math.sin(u), sc * b * (u - Math.PI)], color: 'gold' })),
            },
            caption: `Drag to rotate. One turn of the helix, scaled down to fit, with a gold point every ${nice((c * Math.PI) / 6, 3)} units of arc length.`,
          },
        };
      },
    }),
    num({
      id: 'curvature-3d', difficulty: 2,
      gen(r) {
        const a = r.pick([1, 2]), b = r.pick([-1, 1, 2]), c = r.pick([-1, 1, 2]), t0 = r.pick([0, 1, -1]);
        const d1 = [a, 2 * b * t0, 3 * c * t0 * t0], d2 = [0, 2 * b, 6 * c * t0], cr = cross(d1, d2), v = norm(d1), kappa = norm(cr) / v ** 3;
        const errors = distinct(kappa, [
          { value: norm(cr) / v ** 2, feedback: t`The speed enters cubed: $\kappa = |\vec r\,'\times\vec r\,''|/|\vec r\,'|^3$.` },
          { value: norm(d2), feedback: t`$|\vec r\,''|$ depends on the speed as well as the bending. Divide the speed out: $\kappa = |\vec r\,'\times\vec r\,''|/|\vec r\,'|^3$.` },
        ]);
        const f = (u) => [a * u, b * u * u, c * u ** 3], sc = nice(fitScale(f, t0 - 0.9, t0 + 0.9), 3);
        return {
          prompt: t`Find the curvature of $\vec r(t) = \langle ${a === 1 ? '' : a}t,\ ${b === 1 ? '' : b === -1 ? '-' : b}t^2,\ ${c === 1 ? '' : c === -1 ? '-' : c}t^3\rangle$ at $t = ${t0}$, to 3 significant figures.`,
          answer: kappa, tol: { rel: 0.005, abs: 0.0005 }, errors,
          hints: [t`$\vec r\,'(${t0}) = ${vecTeX(d1)}$ and $\vec r\,''(${t0}) = ${vecTeX(d2)}$.`, t`$\kappa = |\vec r\,'\times\vec r\,''|/|\vec r\,'|^3$.`],
          teach: 'κ = |r′ × r″| / |r′|³ works for any parametrization.',
          explain: t`$\vec r\,'\times\vec r\,'' = ${vecTeX(cr)}$ with length $${nice(norm(cr), 4)}$, and $|\vec r\,'|^3 = ${nice(v ** 3, 4)}$, so $\kappa = ${nice(kappa, 3)}$ and the radius of curvature is $${nice(1 / kappa, 3)}$.`,
          visual: { type: 'c3-curve', params: { curve: { param: [`${sc}*${a}*t`, `${sc}*${b}*t^2`, `${sc}*${c}*t^3`], t: [t0 - 0.9, t0 + 0.9] }, at: t0, fixed: true, show: ['trail', 'T', 'N'], readouts: [] }, caption: 'Drag to rotate. The curve near the gold point, scaled down to fit, with T and N there.' },
        };
      },
    }),
    num({
      id: 'parabolic-flight', difficulty: 2,
      gen(r) {
        const K = r.pick([4000, 4600, 5200]), x0 = r.pick([-2000, -1000, 1000, 2000]), H = 9800;
        const f1 = (-2 * x0) / K, f2 = -2 / K, R = (1 + f1 * f1) ** 1.5 / Math.abs(f2), u = Math.sqrt((9.81 * K) / 2);
        const errors = distinct(R, [
          { value: K / 2, feedback: t`That is the radius at the top, where $f' = 0$. At $x = ${x0}$ the path is tilted, and the factor $(1 + f'^2)^{3/2}$ matters.` },
          { value: (1 + f1 * f1) / Math.abs(f2), feedback: t`The factor is $(1 + f'^2)^{3/2}$, not $(1 + f'^2)$.` },
        ]);
        return {
          prompt: t`On a reduced-gravity flight the aircraft flies the parabola $y = ${H} - \dfrac{x^2}{${K}}$ (metres; $y$ is altitude) so that the people inside float. What is the radius of curvature of its path at $x = ${x0}$ m? Give 3 significant figures.`,
          answer: R, units: 'm', tol: { rel: 0.005 }, errors,
          hints: [t`$f'(x) = -\dfrac{2x}{${K}}$ and $f''(x) = -\dfrac{2}{${K}}$.`, t`$R = \dfrac1\kappa = \dfrac{(1 + f'^2)^{3/2}}{|f''|}$.`],
          teach: t`For a graph $y = f(x)$, $\kappa = |f''|/(1 + f'^2)^{3/2}$: the slope stretches the radius of curvature.`,
          explain: t`At $x = ${x0}$: $f' = ${nice(f1, 4)}$ and $|f''| = 2/${K}$, so $R = \frac{(1 + ${nice(f1 * f1, 4)})^{3/2}}{2/${K}} = ${nice(R, 4)}$ m. At the top the radius is $${K}/2 = ${K / 2}$ m; flown at the horizontal speed $u = \sqrt{g(${K})/2} = ${nice(u, 3)}$ m/s, the centripetal acceleration there, $u^2/R$, is exactly $g$ — the aircraft is falling freely.`,
          visual: { type: 'graph', params: { x: [-2700, 2700], y: [7600, 10200], aspect: 'wide', xlabel: 'x (m)', ylabel: 'altitude (m)', curves: [{ fn: `${H} - x^2/${K}`, color: 'accent' }], points: [{ x: x0, y: H - (x0 * x0) / K, r: 4, color: 'gold' }] }, caption: 'The flight path, with the gold point where the radius is asked for. The axes have different scales.' },
        };
      },
    }),
    mcq({
      id: 'ellipse-tightest', difficulty: 2,
      prompt: t`An oval test track follows the ellipse $\dfrac{x^2}{400^2} + \dfrac{y^2}{150^2} = 1$ (metres). Where is the bend tightest — the curvature greatest?`,
      choices: [t`At the ends of the long axis, $(\pm 400, 0)$`, t`At the ends of the short axis, $(0, \pm 150)$`, t`Nowhere in particular: an ellipse is a stretched circle, so its curvature is constant`, t`Halfway round, where the track runs at $45^\circ$ to the axes`],
      answer: 0,
      why: {
        1: t`There the track is at its flattest: $\kappa = b/a^2 = 150/400^2 \approx 0.00094$ m⁻¹, a radius of over a kilometre.`,
        2: 'Stretching a circle one way flattens some parts and sharpens others; the curvature varies around an ellipse.',
        3: t`Curvature changes monotonically between the ends of the axes; its extremes sit at the axes themselves.`,
      },
      hints: [t`Parametrize: $\vec r(t) = \langle 400\cos t,\ 150\sin t\rangle$.`, t`$\kappa(t) = \dfrac{|x'y'' - y'x''|}{(x'^2 + y'^2)^{3/2}} = \dfrac{400\cdot150}{(400^2\sin^2 t + 150^2\cos^2 t)^{3/2}}$: when is the denominator smallest?`],
      teach: 'On an ellipse the curvature is greatest at the ends of the long axis, κ = a/b², and least at the ends of the short axis, κ = b/a².',
      explain: t`The denominator is smallest when $\sin t = 0$, at $(\pm400, 0)$: $\kappa = a/b^2 = 400/150^2 = 0.0178$ m⁻¹, a radius of $56$ m. At $(0, \pm150)$ the radius is $a^2/b \approx 1067$ m. A planet’s orbit, too, is most sharply bent at an end of its long axis — perihelion, where the planet is also fastest.`,
      visual: { type: 'c3-curve', params: { curve: { param: ['400*cos(t)', '150*sin(t)', '0'], t: [0, 2 * Math.PI] }, at: 0.8, fixed: true, plane: 'xy', show: [], readouts: [], xlabel: 'x (m)', ylabel: 'y (m)' }, caption: 'The track seen from above, to scale.' },
    }),
    mcq({
      id: 'speed-independence', difficulty: 1,
      prompt: t`A car takes the same bend twice along exactly the same line, first at 50 km/h, then at 100 km/h. How does the curvature of its path compare?`,
      choices: ['The same: curvature depends only on the shape of the path', 'Twice as large at 100 km/h', 'Four times as large at 100 km/h', 'Half as large at 100 km/h'],
      answer: 0,
      why: {
        1: t`Curvature measures turning per metre, not per second. Per second the car does turn twice as fast — but it also covers twice the distance.`,
        2: t`That is the sideways acceleration, $a_N = \kappa v^2$, which does quadruple. $\kappa$ itself is fixed by the line taken.`,
        3: 'Speed does not straighten a path; the line through the bend is the same line.',
      },
      hints: [t`$\kappa = |d\vec T/ds|$: a turning rate per unit of **distance**.`],
      teach: 'Curvature is a property of the path’s shape; speed changes the acceleration needed to follow it, not the curvature.',
      explain: t`Both times the tangent turns through the same angle over the same distance, so $\kappa$ is unchanged. What the speed changes is the grip needed: the sideways acceleration $\kappa v^2$ is four times larger at 100 km/h.`,
      visual: { type: 'c3-curve', params: { curve: { param: ['t', '0.4*t^2', '0'], t: [-3, 3] }, at: 0, fixed: true, plane: 'xy', show: ['T', 'N', 'circle'], readouts: [], xlabel: 'x', ylabel: 'y' }, caption: 'The line through the bend, with T, N and the osculating circle at its tightest point.' },
    }),
    num({
      id: 'helix-radius', difficulty: 2,
      gen(r) {
        const a = r.pick([4, 5, 6]), p = r.pick([15, 20, 25]), c = p / (2 * Math.PI), Rc = (a * a + c * c) / a, k = 2.2 / Math.max(a, Math.PI * c);
        const errors = distinct(Rc, [
          { value: a, feedback: 'The helix’s radius is not its radius of curvature: the path also climbs, which straightens it. R = (a² + c²)/a.' },
          { value: (a * a + p * p) / a, feedback: t`In $\langle a\cos t, a\sin t, ct\rangle$, $c$ is the rise per **radian**: $c = ${p}/(2\pi)$, not ${p}.` },
        ]);
        return {
          prompt: t`An electron spirals along a magnetic field line on a helix of radius $${a}$ mm that advances $${p}$ mm per turn: $\vec r(t) = \langle ${a}\cos t,\ ${a}\sin t,\ \frac{${p}}{2\pi}t\rangle$ mm. What is the radius of curvature of its path? Give 3 significant figures.`,
          answer: Rc, units: 'mm', tol: { rel: 0.005 }, errors,
          hints: [t`For $\langle a\cos t, a\sin t, ct\rangle$, $\kappa = \dfrac{a}{a^2 + c^2}$.`, t`Here $c = ${p}/(2\pi) = ${nice(c, 4)}$ mm.`],
          teach: 'A helix ⟨a cos t, a sin t, ct⟩ has κ = a/(a² + c²): its radius of curvature (a² + c²)/a exceeds its radius a.',
          explain: t`$c = ${p}/(2\pi) = ${nice(c, 4)}$ mm, so $R = \dfrac{a^2 + c^2}{a} = \dfrac{${a * a} + ${nice(c * c, 4)}}{${a}} = ${nice(Rc, 3)}$ mm — more than the ${a} mm radius of the cylinder it winds round. Detectors that measure a particle’s momentum from its track’s curvature have to allow for exactly this.`,
          visual: { type: 'c3-curve', params: { curve: { param: [`${nice(k * a, 4)}*cos(t)`, `${nice(k * a, 4)}*sin(t)`, `${nice(k * c, 4)}*(t - pi)`], t: [0, 2 * Math.PI] }, at: 2.2, fixed: true, show: ['trail', 'T', 'N'], readouts: [] }, caption: 'Drag to rotate. One turn of the path, to scale (shrunk to fit), with T and N at the electron.' },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-arc', difficulty: 2,
      gen(r) {
        const b = r.pick([1, 1.5, 2, 2.5]), L = Math.exp(b) - Math.exp(-b);
        const f = (u) => [Math.SQRT2 * u, Math.exp(u), Math.exp(-u)], chord = norm(sub(f(b), f(0)));
        const errors = distinct(L, [{ value: chord, feedback: 'That is the straight-line distance between the endpoints, which is shorter than the curve.' }]);
        return {
          prompt: t`Find the length of $\vec r(t) = \langle \sqrt2\,t,\ e^t,\ e^{-t}\rangle$ for $0 \le t \le ${b}$, to 3 significant figures.`,
          answer: L, tol: { rel: 0.005 }, errors,
          hints: [t`$|\vec r\,'(t)|^2 = 2 + e^{2t} + e^{-2t}$ — a perfect square.`],
          teach: 'When |r′|² is a perfect square, the arc-length integral becomes elementary.',
          explain: t`$|\vec r\,'(t)|^2 = 2 + e^{2t} + e^{-2t} = (e^t + e^{-t})^2$, so $L = \int_0^{${b}} (e^t + e^{-t})\,dt = e^{${b}} - e^{-${b}} = ${nice(L, 4)}$.`,
          visual: arcPic(['sqrt(2)*t', 'exp(t)', 'exp(-t)'], f, 0, b),
        };
      },
    }),
    num({
      id: 'cp-kappa', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 3, 4]), b = r.intExcept(1, 3, [a]), c = r.pick([1, 2]), half = r.bool();
        const t0 = half ? Math.PI / 2 : 0, kappa = half ? b / (a * a + c * c) : a / (b * b + c * c);
        const errors = distinct(kappa, [{ value: half ? b / (b * b + c * c) : a / (a * a + c * c), feedback: t`$a/(a^2 + c^2)$ is the curvature of a **circular** helix. Here the cross-section is an ellipse: work out $|\vec r\,'\times\vec r\,''|/|\vec r\,'|^3$.` }]);
        return {
          prompt: t`Find the curvature of the elliptical helix $\vec r(t) = \langle ${a}\cos t,\ ${b === 1 ? '' : b}\sin t,\ ${c === 1 ? '' : c}t\rangle$ at $t = ${half ? '\\pi/2' : '0'}$, to 3 significant figures.`,
          answer: kappa, tol: { rel: 0.005, abs: 0.0005 }, errors,
          hints: [t`Find $\vec r\,'$ and $\vec r\,''$ at $t = ${half ? '\\pi/2' : '0'}$.`],
          teach: 'κ = |r′ × r″| / |r′|³ at the given parameter value.',
          explain: half
            ? t`At $t = \pi/2$: $\vec r\,' = \langle -${a}, 0, ${c}\rangle$, $\vec r\,'' = \langle 0, -${b}, 0\rangle$, $\vec r\,'\times\vec r\,'' = \langle ${b * c}, 0, ${a * b}\rangle$, so $\kappa = \frac{${b === 1 ? '' : b}\sqrt{${a * a + c * c}}}{(${a * a + c * c})^{3/2}} = \frac{${b}}{${a * a + c * c}} = ${nice(kappa, 3)}$.`
            : t`At $t = 0$: $\vec r\,' = \langle 0, ${b}, ${c}\rangle$, $\vec r\,'' = \langle -${a}, 0, 0\rangle$, $\vec r\,'\times\vec r\,'' = \langle 0, -${a * c}, ${a * b}\rangle$, so $\kappa = \frac{${a}\sqrt{${b * b + c * c}}}{(${b * b + c * c})^{3/2}} = \frac{${a}}{${b * b + c * c}} = ${nice(kappa, 3)}$.`,
          visual: { type: 'c3-curve', params: { curve: { param: [`${a}*cos(t)`, `${b}*sin(t)`, `${c}*t`], t: [t0 - 2.5, t0 + 2.5] }, at: t0, fixed: true, show: ['trail', 'T', 'N'], readouts: [], range: 4, yaw: 1.1, target: [0, 0, c * t0] }, caption: 'Drag to rotate. Part of the elliptical helix, to scale, with T and N at the gold point.' },
        };
      },
    }),
    num({
      id: 'cp-clothoid', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([100, 150, 200]), deg = r.pick([15, 30, 45]), phi = deg * D, s = A * Math.sqrt(2 * phi);
        const errors = distinct(s, [
          { value: A * Math.sqrt(phi), feedback: t`$\varphi(s) = \int_0^s \kappa\,ds = \dfrac{s^2}{2A^2}$ — the integral brings a factor $\frac12$.` },
          { value: A * Math.sqrt(2 * deg), feedback: 'The turning angle must be in radians: κ is radians per metre.' },
          { value: A * A * phi, feedback: t`The curvature is not constant here: integrate $\kappa(s) = s/A^2$ rather than multiply.` },
        ]);
        return {
          prompt: t`Railways and highways join a straight to a bend with a **transition curve**, a clothoid, whose curvature grows in proportion to the distance $s$ travelled along it: $\kappa(s) = s/A^2$, with $A = ${A}$ m. How far along the transition has the track’s direction turned through $${deg}^\circ$? Give 3 significant figures.`,
          answer: s, units: 'm', tol: { rel: 0.005 }, errors,
          hints: [t`For a plane curve $\kappa = d\varphi/ds$: the direction angle turns at the rate $\kappa$ per metre.`, t`$\varphi(s) = \int_0^s \frac{u}{A^2}\,du = \frac{s^2}{2A^2}$; set it equal to $${deg}^\circ$ in radians.`],
          teach: 'For a plane curve the tangent’s angle turns at the rate dφ/ds = κ, so the total turn is the integral of κ along the arc.',
          explain: t`$\varphi = \frac{s^2}{2A^2} = ${deg}^\circ = ${nice(phi, 4)}$ rad gives $s = A\sqrt{2\varphi} = ${A}\sqrt{${nice(2 * phi, 4)}} = ${nice(s, 3)}$ m, where the radius of curvature has come down to $A^2/s = ${nice((A * A) / s, 3)}$ m. Because $\kappa$ grows steadily, a driver turns the wheel at a steady rate — and on a railway the cant can be ramped in evenly.`,
          visual: { type: 'c3-curve', params: { curve: { param: clothoid(A), t: [0, 1.9 * A] }, at: 1.75 * A, fixed: true, plane: 'xy', show: ['trail', 'T', 'circle'], readouts: [], x: [-0.15 * A, 1.75 * A], y: [-0.15 * A, 1.45 * A], xlabel: 'x (m)', ylabel: 'y (m)' }, caption: `The transition curve leaving the straight along the x-axis, for its first ${nice(1.9 * A, 3)} m, with the osculating circle near its end, where the track has turned through about 88°.` },
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Calculus Vol. 3, §3.3 Arc Length and Curvature', url: 'https://openstax.org/books/calculus-volume-3/pages/3-3-arc-length-and-curvature' },
    { label: 'Wikipedia: Euler spiral (track transition curves)', url: 'https://en.wikipedia.org/wiki/Euler_spiral' },
  ],
});
