// Surface area of revolution: bands are frustums, whose width is ds, not dx.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { along, revolve, ring, bandSides } from './_revolve.js';

const t = String.raw;

// Explore: the frustum swept by y = 0.4 + m x (0 ≤ x ≤ 2) about the x-axis.
const cone = (x) => `(0.4 + m*(${x}))`;
const SH = [-1, 0, 0];
// Worked example: the dish swept by y = √x (0 ≤ x ≤ 2).
const dish = (x) => `sqrt(${x})`;

export default lesson({
  id: 'math1220.C2-1.5',
  title: 'Surface area of revolution',
  minutes: 10, difficulty: 3,
  intro: t`Rotate a curve $y = f(x) \ge 0$ about the $x$-axis and it sweeps out a surface. Cut the surface into thin bands. Each band is very nearly a **frustum** — a slice of a cone — whose width along the surface is the arc-length element $ds = \sqrt{1 + f'^2}\,dx$, not $dx$. A frustum’s area is its circumference times its slant width, so

$$S = \int_a^b 2\pi f(x)\,\sqrt{1 + \big[f'(x)\big]^2}\,dx$$

Using $dx$ instead of $ds$ — pretending every band is a short cylinder — gives the wrong answer wherever the curve slopes.`,
  symbols: [
    { tex: 'S', text: 'the area of the surface, in square units (m²)' },
    { tex: 'f(x)', text: 'the radius of the band at $x$: its distance from the axis of rotation' },
    { tex: '2\\pi f(x)', text: 'the circumference of the band' },
    { tex: "\\sqrt{1 + [f'(x)]^2}\\,dx", text: 'the band’s **slant width** $ds$ — the length of curve it contains, from the arc-length lesson' },
    { tex: 'a,\\ b', text: 'where the surface starts and ends along the axis' },
  ],
  why: t`Heat-shield and nozzle-liner areas, the skin of a fairing and the insulation on a tank all come from this integral — and its frustum bookkeeping returns as surface integrals in multivariable calculus.`,
  visual: {
    type: 'surface3d',
    title: 'Slanted bands are wider than dx',
    lead: t`The surface swept by the line $y = 0.4 + mx$ ($0 \le x \le 2$) about the $x$-axis: a frustum, like a conical nozzle. The gold cage is one thin band. Its width along the surface is the slanted $ds$, longer than the step $dx$ along the axis.`,
    tasks: [
      t`Set the slope $m$ to $0$: the surface is a cylinder, every band is a true cylinder, and the true and naive areas agree.`,
      t`Raise $m$: the bands tilt and the naive formula $2\pi\int f\,dx$ falls short by the factor $\sqrt{1 + m^2}$.`,
      t`At $m = 1$ (a 45° cone) the naive answer is about 29% too small; at the 15° half-angle of a typical conical nozzle ($m \approx 0.27$) it is only about 3.5% low.`,
    ],
    params: {
      surface: revolve([along(cone, 0, 2)], { axis: 'x', at: 0, sweep: 'sw', shift: SH }),
      domain: [[0, 1], [0, 1]], n: 40, colorBy: false, alpha: 0.72, axes: false,
      yaw: -1.25, pitch: 0.42, dist: 6.3,
      sliders: [
        { key: 'm', label: 'Slope $m$', min: 0, max: 1.2, step: 0.02, value: 0.6, explain: t`How fast the radius grows along the axis; the half-angle of the cone is $\arctan m$.` },
        { key: 'xs', label: 'Band at $x$', min: 0, max: 1.85, step: 0.05, value: 1, explain: 'Where the sample band sits (drawn 0.15 wide so you can see it).' },
        { key: 'sw', label: 'Revolve by', min: 30, max: 360, step: 5, value: 300, unit: '^\\circ', explain: 'Leave a gap to look inside.' },
      ],
      curves: [
        ring('xs', cone('xs'), { shift: SH }),
        ring('xs + 0.15', cone('xs + 0.15'), { shift: SH }),
        ...bandSides(cone, 'xs', 'xs + 0.15', { shift: SH, count: 8 }),
        { param: ['t - 1', '0', '0'], t: [-0.4, 2.4], color: 'bad', width: 2 },
      ],
      readouts: [
        { label: t`true area $S$`, expr: '2*pi*sqrt(1 + m^2)*(0.8 + 2*m)' },
        { label: t`naive $2\pi\int f\,dx$`, expr: '2*pi*(0.8 + 2*m)' },
        { label: t`ratio $\sqrt{1 + m^2}$`, expr: 'sqrt(1 + m^2)' },
      ],
    },
    caption: 'Drag to turn the surface. Only the curved surface is counted, not the end discs. The red line is the axis of rotation; the readouts are exact.',
  },
  example: {
    prompt: t`A dish antenna is the paraboloid swept out by rotating $y = \sqrt{x}$, $0 \le x \le 2$ (in metres), about the $x$-axis. Find its surface area.`,
    visual: {
      type: 'surface3d',
      params: {
        surface: revolve([along(dish, 0, 2)], { axis: 'x', at: 0, sweep: '360', shift: SH }),
        domain: [[0, 1], [0, 1]], n: 36, colorBy: false, alpha: 0.85, axes: false, yaw: -1.05, pitch: 0.32, dist: 5.6,
        curves: [{ param: ['t - 1', '0', '0'], t: [-0.4, 2.6], color: 'bad', width: 2 }],
      },
      caption: 'The dish, opening to the right, seen from the side; the red line is its axis. Drag to turn it.',
    },
    steps: [
      { label: 'Pieces', text: t`$f(x) = \sqrt{x}$ and $f'(x) = \dfrac{1}{2\sqrt{x}}$, so $1 + f'^2 = 1 + \dfrac{1}{4x}$.` },
      { label: 'Simplify the integrand', text: t`$f\sqrt{1 + f'^2} = \sqrt{x}\sqrt{1 + \dfrac{1}{4x}} = \sqrt{x + \dfrac14}$. The awkward $\tfrac{1}{\sqrt x}$ has cancelled.` },
      { label: 'Integrate', text: t`$S = 2\pi\displaystyle\int_0^2\sqrt{x + \tfrac14}\,dx = 2\pi\cdot\frac23\left[\left(x + \tfrac14\right)^{3/2}\right]_0^2 = \frac{4\pi}{3}\left(\frac{27}{8} - \frac18\right) = \frac{13\pi}{3}.$` },
      { label: 'Sense check', text: t`$\tfrac{13\pi}{3} \approx 13.6$ m². The naive “cylinder” formula gives $2\pi\int_0^2\sqrt{x}\,dx \approx 11.8$ m² — too small, because every band of the dish is slanted.` },
    ],
    answer: t`$S = \dfrac{13\pi}{3} \approx 13.6\ \text{m}^2$`,
  },
  practice: [
    mcq({
      id: 'pick-formula', difficulty: 1,
      prompt: t`The curve $y = x^2$, $0 \le x \le 1$, is rotated about the $x$-axis. Which integral gives the area of the surface?`,
      choices: [
        t`$2\pi\displaystyle\int_0^1 x^2\sqrt{1 + 4x^2}\,dx$`,
        t`$2\pi\displaystyle\int_0^1 x^2\,dx$`,
        t`$\pi\displaystyle\int_0^1 x^4\,dx$`,
        t`$2\pi\displaystyle\int_0^1 x\sqrt{1 + 4x^2}\,dx$`,
      ],
      answer: 0,
      why: {
        1: t`That treats every band as a cylinder of width $dx$. The bands slant, so their width is $ds = \sqrt{1 + 4x^2}\,dx$.`,
        2: t`That is the *volume* of the solid (disks of radius $x^2$), not the area of its surface.`,
        3: t`That uses radius $x$, the distance to the $y$-axis — the surface made by rotating about the $y$-axis.`,
      },
      hints: ['The radius of a band is its distance from the x-axis.', t`The width of a band is the arc-length element $\sqrt{1 + (f')^2}\,dx$.`],
      teach: 'Surface area = ∫ circumference × slant width = ∫ 2π (radius) ds.',
      explain: t`Radius $f(x) = x^2$, slant width $\sqrt{1 + (2x)^2}\,dx$: $S = 2\pi\int_0^1 x^2\sqrt{1 + 4x^2}\,dx \approx 3.81$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-0.3, 1.4], y: [-0.2, 1.2], curves: [{ fn: 'x^2', color: 'accent', domain: [0, 1] }], hlines: [{ y: 0, color: 'bad', label: 'axis' }] } },
    }),
    num({
      id: 'cone', difficulty: 2,
      gen(r) {
        const [R, h] = r.pick([[3, 4], [5, 12], [6, 8], [8, 15]]);
        const l = Math.hypot(R, h), S = Math.PI * R * l;
        return {
          prompt: t`Rotating $y = \tfrac{${R}}{${h}}x$, $0 \le x \le ${h}$, about the $x$-axis sweeps out a cone of radius ${R} and height ${h}. Use the surface-area integral to find its lateral (curved) area. Give 3 significant figures.`,
          answer: S, tol: { rel: 0.005 },
          errors: [{ value: Math.PI * R * h, feedback: t`That is the naive $2\pi\int f\,dx$, which ignores the slant. Include $\sqrt{1 + (f')^2} = \sqrt{1 + (${R}/${h})^2}$.` }],
          hints: [t`$f' = \tfrac{${R}}{${h}}$ is constant, so $\sqrt{1 + f'^2} = \tfrac{${l}}{${h}}$.`, t`$S = 2\pi\cdot\tfrac{${l}}{${h}}\int_0^{${h}}\tfrac{${R}}{${h}}x\,dx$.`],
          teach: 'For a straight-line profile the slant factor is a constant, and the integral reproduces the cone formula πrℓ.',
          explain: t`$S = 2\pi\cdot\tfrac{${l}}{${h}}\cdot\tfrac{${R}}{${h}}\cdot\tfrac{${h * h}}{2} = \pi(${R})(${l}) \approx ${fmt(S)}$ — exactly $\pi r\ell$, with slant height $\ell = \sqrt{${R}^2 + ${h}^2} = ${l}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.1 * h, 1.15 * h], y: [-1.2 * R, 1.2 * R], equal: true, curves: [{ fn: `${R / h}*x`, color: 'accent', domain: [0, h] }, { fn: `-${R / h}*x`, color: 'accent', dash: true, domain: [0, h] }], hlines: [{ y: 0, color: 'bad', label: 'axis' }] }, caption: 'Side view of the cone: the profile line (solid) and its mirror image (dashed).' },
        };
      },
    }),
    expr({
      id: 'sphere-area', difficulty: 2,
      prompt: t`Rotating $y = \sqrt{a^2 - x^2}$, $-a \le x \le a$, about the $x$-axis gives a sphere. Find its surface area in terms of $a$.`,
      answer: '4 pi a^2', answerTeX: t`4\pi a^2`,
      vars: { a: [0.5, 3] },
      errors: [{ answer: '2 pi a^2', feedback: t`Integrate over the whole interval, $-a$ to $a$.` }, { answer: '4/3 pi a^3', feedback: 'That is the volume of the ball, not the area of its surface.' }],
      hints: [t`$f' = \dfrac{-x}{\sqrt{a^2 - x^2}}$, so $1 + f'^2 = \dfrac{a^2}{a^2 - x^2}$.`, t`Then $f\sqrt{1 + f'^2} = \sqrt{a^2 - x^2}\cdot\dfrac{a}{\sqrt{a^2 - x^2}} = a$ — a constant.`],
      teach: 'For a sphere the integrand f√(1 + f′²) is constant: every band of equal width along the axis has equal area.',
      explain: t`$S = \int_{-a}^{a} 2\pi a\,dx = 2\pi a\cdot 2a = 4\pi a^2$.`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-1.7, 1.7], y: [-0.2, 1.25], equal: true, curves: [{ fn: 'sqrt(1 - x^2)', color: 'accent', domain: [-1, 1] }], hlines: [{ y: 0, color: 'bad', label: 'axis' }] }, caption: 'Drawn with a = 1.' },
    }),
    num({
      id: 'zone', difficulty: 3,
      gen(r) {
        const [a, c, d] = r.pick([[3, 1, 2.5], [5, -2, 1], [4, 0.5, 3], [2, -1.5, 0.5]]);
        const S = 2 * Math.PI * a * (d - c);
        return {
          prompt: t`A spherical propellant tank has radius ${a} m. Two parallel planes, at $x = ${c}$ m and $x = ${d}$ m from its centre, cut a band out of its surface. What is the band’s area? Give 3 significant figures.`,
          answer: S, units: 'm^2', tol: { rel: 0.005 },
          hints: [
            t`The surface is the rotation of $y = \sqrt{${a * a} - x^2}$ about the $x$-axis, from $x = ${c}$ to $x = ${d}$.`,
            t`As for the whole sphere, $f\sqrt{1 + f'^2} = ${a}$ — constant.`,
            t`$S = \int_{${c}}^{${d}} 2\pi(${a})\,dx$.`,
          ],
          teach: 'On a sphere, a band’s area depends only on the distance between the cutting planes, not on where they cut — Archimedes’ hat-box theorem.',
          explain: t`$S = 2\pi(${a})(${c < 0 ? `${d} + ${-c}` : `${d} - ${c}`}) = ${fmt(S)}$ m². Surprisingly, any band of the same width ${d - c} m has the same area, whether it is near the equator or near a pole.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-a * 1.7, a * 1.7], y: [-a * 1.15, a * 1.15], equal: true, curves: [{ param: [`${a}*cos(t)`, `${a}*sin(t)`], t: [0, '2*pi'], color: 'accent' }, { param: [`${a}*cos(t)`, `${a}*sin(t)`], t: [Math.acos(d / a), Math.acos(c / a)], color: 'gold', width: 5 }, { param: [`${a}*cos(t)`, `-${a}*sin(t)`], t: [Math.acos(d / a), Math.acos(c / a)], color: 'gold', width: 5 }], vlines: [{ x: c }, { x: d }] }, caption: 'Side view of the tank. The gold arcs are the cross-section of the band between the two planes.' },
        };
      },
    }),
    num({
      id: 'about-y', difficulty: 3,
      gen(r) {
        const b = r.pick([1, 2]), S = (Math.PI / 6) * ((1 + 4 * b * b) ** 1.5 - 1);
        return {
          prompt: t`The curve $y = x^2$, $0 \le x \le ${b}$, is rotated about the **$y$-axis**, making a bowl. Find the area of the bowl’s surface. Give 3 significant figures.`,
          answer: S, tol: { rel: 0.005 },
          hints: [
            t`About the $y$-axis, the radius of the band at $x$ is $x$ (its distance from that axis). The slant width is still $\sqrt{1 + (2x)^2}\,dx$.`,
            t`$S = \int_0^{${b}} 2\pi x\sqrt{1 + 4x^2}\,dx$; substitute $u = 1 + 4x^2$.`,
          ],
          teach: 'The radius is always the distance to the axis of rotation; the slant width ds is the same whichever axis you use.',
          explain: t`With $u = 1 + 4x^2$, $x\,dx = \tfrac18du$: $S = \tfrac{\pi}{4}\int_1^{${1 + 4 * b * b}}u^{1/2}du = \tfrac{\pi}{6}\left(${1 + 4 * b * b}^{3/2} - 1\right) \approx ${fmt(S)}$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-b * 1.6, b * 1.6], y: [-0.2, b * b * 1.2], equal: true, curves: [{ fn: 'x^2', color: 'accent', domain: [0, b] }, { fn: 'x^2', color: 'accent', dash: true, domain: [-b, 0] }], vlines: [{ x: 0, color: 'bad', label: 'axis' }] }, caption: 'The profile (solid) and its mirror image (dashed) after half a turn.' },
        };
      },
    }),
    mcq({
      id: 'why-not-naive', difficulty: 2,
      prompt: t`Why is the surface area not simply $2\pi\displaystyle\int_a^b f(x)\,dx$?`,
      choices: [
        t`Each band is slanted, so its width along the surface is $ds = \sqrt{1 + f'^2}\,dx$, which is longer than $dx$ wherever $f' \ne 0$`,
        t`Because $2\pi\int f\,dx$ is the volume of the solid`,
        t`Because the radius should be squared, as in the disk method`,
        t`It is the same thing, as long as $f$ is increasing`,
      ],
      answer: 0,
      why: {
        1: t`The volume is $\pi\int f^2\,dx$. $2\pi\int f\,dx$ is the area of a stack of cylinders — the wrong shape for slanted bands.`,
        2: 'Squaring belongs to areas of disks. A band is a thin strip: circumference × width.',
        3: 'An increasing curve slopes, so its bands are slanted and wider than dx.',
      },
      hints: ['Compare a thin slice of a cone with a thin slice of a cylinder.', 'How wide is a slanted band, measured along the surface?'],
      teach: 'A band’s area is circumference × slant width; the slant width is ds, not dx.',
      explain: t`Volumes are forgiving — a slanted slab and a straight one differ by a negligible sliver — but areas are not: the slanted band really is $\sqrt{1 + f'^2}$ times wider. That factor survives in the limit.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-paraboloid', difficulty: 2,
      gen(r) {
        const b = r.pick([6, 12, 20]), S = ((4 * Math.PI) / 3) * ((b + 0.25) ** 1.5 - 0.125);
        return {
          prompt: t`Find the area of the surface swept out by rotating $y = \sqrt{x}$, $0 \le x \le ${b}$, about the $x$-axis. Give 3 significant figures.`,
          answer: S, tol: { rel: 0.005 },
          errors: [{ value: ((4 * Math.PI) / 3) * b ** 1.5, feedback: t`That is the naive $2\pi\int\sqrt{x}\,dx$. Include the slant factor: $f\sqrt{1 + f'^2} = \sqrt{x + \tfrac14}$.` }],
          hints: [t`As in the worked example, $f\sqrt{1 + f'^2} = \sqrt{x + \tfrac14}$.`],
          teach: 'For y = √x, the slant factor turns the integrand into √(x + 1/4).',
          explain: t`$S = 2\pi\cdot\tfrac23\left[\left(x + \tfrac14\right)^{3/2}\right]_0^{${b}} = \tfrac{4\pi}{3}\left(${b + 0.25}^{3/2} - \tfrac18\right) \approx ${fmt(S)}$.`,
        };
      },
    }),
    num({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      gen(r) {
        const [r1, r2, L] = r.pick([[0.1, 0.42, 1.2], [0.15, 0.55, 1.5], [0.05, 0.25, 0.75]]);
        const S = Math.PI * (r1 + r2) * Math.hypot(L, r2 - r1);
        return {
          prompt: t`A conical nozzle extension flares from radius ${r1} m to radius ${r2} m over a length of ${L} m (a 15° half-angle, typical of conical nozzles). Its inner wall needs a thermal coating. Model the wall as the line $f(x) = ${r1} + \tfrac{${nice2(r2 - r1)}}{${L}}x$ rotated about the axis, and find the area to coat. Give 3 significant figures.`,
          answer: S, units: 'm^2', tol: { rel: 0.005 },
          errors: [{ value: Math.PI * (r1 + r2) * L, feedback: t`That is the naive $2\pi\int f\,dx$. Even at 15° the slant matters at the 3% level: include $\sqrt{1 + f'^2}$.` }],
          hints: [
            t`$f' = \tfrac{${nice2(r2 - r1)}}{${L}}$ is constant, so $\sqrt{1 + f'^2}$ comes out of the integral.`,
            t`$S = 2\pi\sqrt{1 + f'^2}\int_0^{${L}} f(x)\,dx$, and $\int_0^{${L}} f\,dx = \tfrac{(${r1} + ${r2})}{2}\cdot ${L}$.`,
          ],
          teach: 'A frustum’s lateral area is π(r₁ + r₂) × slant height — what the integral gives for a straight profile.',
          explain: t`$S = \pi(${r1} + ${r2})\sqrt{${L}^2 + ${nice2(r2 - r1)}^2} \approx ${fmt(S)}$ m². The naive formula would say ${fmt(Math.PI * (r1 + r2) * L)} m², about 3% short. (Real nozzles are often bell-shaped; then the integral has to be done numerically.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-0.15 * L, 1.2 * L], y: [-r2 * 1.5, r2 * 1.5], equal: true, xlabel: 'x (m)', curves: [{ fn: `${r1} + ${(r2 - r1) / L}*x`, color: 'accent', domain: [0, L] }, { fn: `-${r1} - ${(r2 - r1) / L}*x`, color: 'accent', domain: [0, L] }], hlines: [{ y: 0, color: 'bad', label: 'axis' }] }, caption: 'Side view of the nozzle extension; the flow runs left to right.' },
        };
      },
    }),
    mcq({
      id: 'cp-tower', difficulty: 3, transfer: true,
      prompt: t`A cooling tower’s wall is the surface traced when the curve $x = g(y)$, $0 \le y \le H$, is rotated about the vertical $y$-axis. Which integral gives the wall’s area?`,
      choices: [
        t`$2\pi\displaystyle\int_0^H g(y)\sqrt{1 + g'(y)^2}\,dy$`,
        t`$2\pi\displaystyle\int_0^H g(y)\,dy$`,
        t`$\pi\displaystyle\int_0^H g(y)^2\,dy$`,
        t`$2\pi\displaystyle\int_0^H y\sqrt{1 + g'(y)^2}\,dy$`,
      ],
      answer: 0,
      why: {
        1: 'That ignores the slant of the wall — it would be right only for a straight cylindrical tower.',
        2: 'That is the volume of air inside the tower (disks of radius g(y)), not the area of its wall.',
        3: t`The radius of a band is its distance from the axis, $g(y)$ — not the height $y$.`,
      },
      hints: ['Integrate in y: the curve is given as x = g(y).', 'Band radius = distance from the axis; band width = ds along the curve.'],
      teach: 'With the curve written as x = g(y), surface area is ∫ 2π g(y) √(1 + g′(y)²) dy.',
      explain: t`Each horizontal band has circumference $2\pi g(y)$ and slant width $ds = \sqrt{1 + g'(y)^2}\,dy$. (A real tower’s hyperbolic profile makes the integral one for numerical methods.)`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-4, 4], y: [-0.3, 5.3], equal: true, curves: [{ param: ['1.6*sqrt(1 + (t - 3.2)^2/2.2)', 't'], t: [0, 5], color: 'accent' }, { param: ['-1.6*sqrt(1 + (t - 3.2)^2/2.2)', 't'], t: [0, 5], color: 'accent', dash: true }], vlines: [{ x: 0, color: 'bad', label: 'axis' }] }, caption: 'Profile of a cooling tower (solid) and its mirror image (dashed). Not to scale.' },
    }),
  ],
  sources: [{ label: 'OpenStax Calculus Vol. 2, §2.4 Arc Length of a Curve and Surface Area', url: 'https://openstax.org/books/calculus-volume-2/pages/2-4-arc-length-of-a-curve-and-surface-area' }],
});

function nice2(x) { return String(+x.toFixed(4)); }
