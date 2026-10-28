// Fermat's principle (Taylor §6.2 problems; Hecht ch. 4): light takes a path
// of stationary travel time, T = (1/c)∫ n ds. The lifeguard problem — run on
// sand, swim in water — gives sin θ₁/v₁ = sin θ₂/v₂, which with v = c/n is
// Snell's law. In a graded medium n(y), the integrand n(y)√(1 + y′²) has no
// x, so Beltrami gives n cos φ = const (φ above the horizontal): rays bend
// toward higher index. Mirages (hot road: n grows with height, rays curve up),
// a graded-index fibre (transfer), stationary-not-least reflection inside an
// ellipse, and the bridge to gravitational lensing (an effective index
// 1 + 2GM/rc² near a mass, weak field only).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sci, r6, gpic, seg, lab, distinct } from './_cm.js';

const t = String.raw;
const DEG = Math.PI / 180;
const deg = (x) => x / DEG;

/** Least-time crossing for the lifeguard at (0, a) and swimmer at (d, −b): bisection on dT/dx = 0. */
function lifeguard(a, b, d, v1, v2) {
  const T = (x) => Math.hypot(a, x) / v1 + Math.hypot(b, d - x) / v2;
  const dT = (x) => x / (v1 * Math.hypot(a, x)) - (d - x) / (v2 * Math.hypot(b, d - x));
  let lo = 0, hi = d;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (dT(m) < 0) lo = m; else hi = m; }
  const x = (lo + hi) / 2;
  return { x, T: T(x), Tline: T((d * a) / (a + b)), Tswim: T(d), xline: (d * a) / (a + b), s1: x / Math.hypot(a, x), s2: (d - x) / Math.hypot(b, d - x), Tof: T };
}

const EX = (() => { const a = 20, b = 15, d = 50, v1 = 7, v2 = 1.5; return { a, b, d, v1, v2, ...lifeguard(a, b, d, v1, v2) }; })();

// the beach as a graph: sand above y = 0, water below, the lifeguard L and the swimmer S
function beach({ a, b, d, x = null, extra = {}, caption, alt = 'A beach with a lifeguard on the sand and a swimmer in the water' }) {
  return gpic({
    x: [-5, d + 6], y: [-b - 8, a + 6], xlabel: 'along the shore (m)', ylabel: '', yticks: 0,
    shade: [{ fn: `${a + 6}`, lower: '0', from: -5, to: d + 6, color: 'gold', alpha: 0.12 }, { fn: '0', lower: `${-b - 8}`, from: -5, to: d + 6, color: 'accent', alpha: 0.16 }],
    curves: x === null ? [] : [seg([0, a], [x, 0], 'warn', 2.2), seg([x, 0], [d, -b], 'warn', 2.2)],
    points: [{ x: 0, y: a, color: 'ink', label: 'lifeguard', labelDx: 8, labelDy: -10 }, { x: d, y: -b, color: 'bad', label: 'swimmer', labelDx: -60, labelDy: 14 }, lab(d - 2, 3, 'sand', 'gold'), lab(d - 2, -3, 'water', 'accent')],
    ...extra,
  }, caption, alt);
}

const iface = (params, caption) => ({ type: 'optics-rays', params: { mode: 'interface', controls: false, readout: false, waves: false, fresnel: false, ...params }, caption });

export default lesson({
  id: 'phys3550.M3.4',
  title: 'Fermat’s principle: Snell’s law from least time',
  minutes: 16, difficulty: 3,
  intro: t`Light in a medium of refractive index $n$ travels at $c/n$. **Fermat's principle** says that between two points light follows the path whose travel time is **stationary** — usually, but not always, the least. The travel time is a functional of the path, exactly like the brachistochrone's, with $n$ in place of $1/\sqrt{2gy}$. A lifeguard who runs fast on sand and swims slowly in water faces the same problem: crossing the shore where the time is stationary gives $\sin\theta_1/v_1 = \sin\theta_2/v_2$ — and with $v = c/n$, **Snell's law** ([PHYS 2220](#/lesson/phys2220.O1.1); [MATH 2210](#/lesson/math2210.C3-3.8) found it as a constrained minimum). In a medium whose index changes smoothly, the same principle bends rays into curves: mirages, and — with an effective index near a mass — gravitational lenses.`,
  equation: t`T[\text{path}] = \frac1c\int n\,ds \quad\Longrightarrow\quad n_1\sin\theta_1 = n_2\sin\theta_2`,
  symbols: [
    { tex: 'T', text: 'the light’s travel time along a path, in s' },
    { tex: 'n', text: 'the refractive index at each point (dimensionless): light moves at $c/n$ there' },
    { tex: 'c', text: 'the speed of light in vacuum, $2.998\\times10^8$ m/s' },
    { tex: 'ds', text: 'a short piece of the path, in m; $\\int n\\,ds$ is the **optical path length**' },
    { tex: '\\theta_1,\\ \\theta_2', text: 'the angles the ray makes with the **normal** to the boundary, on each side' },
    { tex: 'n_1,\\ n_2', text: 'the indices on each side of the boundary' },
  ],
  why: t`Fermat's principle is the optical twin of the action principle, and in general relativity both become one statement: light follows null geodesics, which is why it bends round the Sun.`,
  visual: {
    type: 'graph',
    title: 'The lifeguard problem',
    lead: t`The lifeguard (top) runs on sand, crosses the shore at the ring — drag it — and swims to the swimmer. Watch the total time, and the two ratios $\sin\theta/v$ on each side of the shore.`,
    tasks: [
      t`Drag the crossing point until the time is least: there the two ratios $\sin\theta_1/v_1$ and $\sin\theta_2/v_2$ are equal — Snell's law.`,
      t`The straight line to the swimmer (crossing near 29 m) is not the fastest: it wastes time swimming. Neither is running all the way along the shore: it wastes time running.`,
      t`Make the swimming speed equal to the running speed: the best path becomes the straight line.`,
    ],
    params: {
      x: [-5, 56], y: [-23, 26], xlabel: 'along the shore (m)', ylabel: '', yticks: 0,
      sliders: [
        { key: 'v1', label: 'Running speed $v_1$', min: 2, max: 9, step: 0.1, value: 7, unit: '\\mathrm{m/s}', explain: 'Her speed on the sand.' },
        { key: 'v2', label: 'Swimming speed $v_2$', min: 0.5, max: 9, step: 0.1, value: 1.5, unit: '\\mathrm{m/s}', explain: 'Her speed in the water.' },
      ],
      shade: [{ fn: '26', lower: '0', from: -5, to: 56, color: 'gold', alpha: 0.12 }, { fn: '0', lower: '-23', from: -5, to: 56, color: 'accent', alpha: 0.16 }],
      drag: [{ key: 'p', x: 30, y: 0, lockY: true, snap: 0.1 }],
      curves: [
        { param: ['t*px', '20 - 20*t'], t: [0, 1], color: 'warn', width: 2.4 },
        { param: ['px + t*(50 - px)', '-15*t'], t: [0, 1], color: 'warn', width: 2.4 },
        { param: ['50*t', '20 - 35*t'], t: [0, 1], color: 'ink4', width: 1, dash: true },
        { param: ['px', 't'], t: [-12, 12], color: 'ink4', width: 1, dash: true },
      ],
      points: [{ x: 0, y: 20, color: 'ink', label: 'lifeguard', labelDx: 8, labelDy: -10 }, { x: 50, y: -15, color: 'bad', label: 'swimmer', labelDx: -60, labelDy: 14 }, { x: 53, y: 3, r: 0, label: 'sand', color: 'gold', labelAlign: 'right' }, { x: 53, y: -3, r: 0, label: 'water', color: 'accent', labelAlign: 'right' }],
      readouts: [
        { label: 'time T', expr: 'sqrt(400 + px^2)/v1 + sqrt(225 + (50 - px)^2)/v2', unit: '\\mathrm{s}', digits: 4 },
        { label: 'sin θ₁ / v₁', expr: 'px/sqrt(400 + px^2)/v1', unit: '\\mathrm{s/m}', digits: 3 },
        { label: 'sin θ₂ / v₂', expr: '(50 - px)/sqrt(225 + (50 - px)^2)/v2', unit: '\\mathrm{s/m}', digits: 3 },
      ],
    },
    caption: t`The lifeguard starts 20 m from the water's edge; the swimmer is 50 m along the shore and 15 m out. Straight runs and swims at constant speed; the dashed vertical line is the normal at the crossing, from which both angles are measured. Not to scale vertically.`,
  },
  example: {
    prompt: t`A lifeguard 20 m from the water's edge runs at $${EX.v1}$ m/s and swims at $${EX.v2}$ m/s. A swimmer is 50 m along the shore and 15 m out. Where should she enter the water, how long does she take, and what law does the best path obey?`,
    visual: beach({ a: EX.a, b: EX.b, d: EX.d, x: r6(EX.x), caption: t`The least-time path (orange), to scale.` }),
    steps: [
      { label: 'Time as a function', text: t`Cross at distance $x$ along the shore: $T(x) = \dfrac{\sqrt{20^2 + x^2}}{v_1} + \dfrac{\sqrt{15^2 + (50 - x)^2}}{v_2}$. A path of two straight legs reduces the functional to a function of one number.` },
      { label: 'Stationary', text: t`$\dfrac{dT}{dx} = \dfrac{x}{v_1\sqrt{20^2 + x^2}} - \dfrac{50 - x}{v_2\sqrt{15^2 + (50 - x)^2}} = 0$.` },
      { label: 'Read the angles', text: t`$x/\sqrt{20^2 + x^2} = \sin\theta_1$ and $(50 - x)/\sqrt{15^2 + (50 - x)^2} = \sin\theta_2$, angles from the normal to the shore. So $\dfrac{\sin\theta_1}{v_1} = \dfrac{\sin\theta_2}{v_2}$.` },
      { label: 'Solve', text: t`Numerically (bisection on $dT/dx$): $x = ${sci(EX.x, 3)}$ m, with $\theta_1 = ${sci(deg(Math.asin(EX.s1)), 3)}^\circ$ and $\theta_2 = ${sci(deg(Math.asin(EX.s2)), 3)}^\circ$. Time: $T = ${sci(EX.T, 3)}$ s.` },
      { label: 'Compare', text: t`Straight at the swimmer (crossing at $x = ${sci(EX.xline, 3)}$ m): $${sci(EX.Tline, 3)}$ s. Running to the point nearest the swimmer, then swimming straight out: $${sci(EX.Tswim, 3)}$ s. The best path bends at the shore toward the normal on the slow side.` },
      { label: 'Light', text: t`For light $v = c/n$, so $\sin\theta_1/v_1 = \sin\theta_2/v_2$ becomes $n_1\sin\theta_1 = n_2\sin\theta_2$: Snell's law is what least time looks like at a boundary.` },
    ],
    answer: t`Enter the water $${sci(EX.x, 3)}$ m along the shore; it takes $${sci(EX.T, 3)}$ s, and the path obeys $\sin\theta_1/v_1 = \sin\theta_2/v_2$ — Snell's law.`,
  },
  practice: [
    num({
      id: 'snell-angle', difficulty: 1,
      gen(r) {
        const [what, n2] = r.pick([['water', 1.333], ['crown glass', 1.52], ['diamond', 2.42]]), th = r.pick([20, 35, 50, 65]);
        const th2 = deg(Math.asin(Math.sin(th * DEG) / n2));
        return {
          prompt: t`Light in air ($n = 1.000$) meets a flat surface of ${what} ($n = ${n2}$) at $${th}^\circ$ from the normal. At what angle from the normal does it travel in the ${what}?`,
          answer: th2, units: 'deg', tol: { rel: 0.005, abs: 0.1 },
          errors: distinct([{ value: th / n2, feedback: t`Snell's law relates the **sines**: $\sin\theta_2 = \sin\theta_1/n_2$, not $\theta_2 = \theta_1/n_2$.` }, { value: 90 - deg(Math.asin(Math.cos(th * DEG) / n2)), feedback: t`Measure angles from the normal, not from the surface.` }], th2, 0.04),
          hints: [t`$n_1\sin\theta_1 = n_2\sin\theta_2$.`, t`$\sin\theta_2 = \sin ${th}^\circ/${n2}$.`],
          teach: t`Least time bends light toward the normal as it enters a slower medium: $n_1\sin\theta_1 = n_2\sin\theta_2$.`,
          explain: t`$\sin\theta_2 = \sin${th}^\circ/${n2} = ${sci(Math.sin(th * DEG) / n2, 4)}$, so $\theta_2 = ${sci(th2, 3)}^\circ$ — closer to the normal, as the lifeguard's swim is.`,
          visual: iface({ n1: 1, n2, angle: th, hide: ['refracted', 'theta2'] }, t`The incoming ray and the surface; the refracted ray is hidden.`),
        };
      },
    }),
    {
      type: 'point', id: 'drag-crossing', difficulty: 2,
      prompt: t`Here the lifeguard runs at 6 m/s and swims at 2 m/s. The readout shows the two ratios $\sin\theta/v$ for your crossing point. Drag the crossing point to where the time is least.`,
      visual: {
        type: 'graph',
        params: {
          x: [-5, 56], y: [-23, 26], xlabel: 'along the shore (m)', ylabel: '', yticks: 0,
          shade: [{ fn: '26', lower: '0', from: -5, to: 56, color: 'gold', alpha: 0.12 }, { fn: '0', lower: '-23', from: -5, to: 56, color: 'accent', alpha: 0.16 }],
          drag: [{ key: 'p', x: 15, y: 0, lockY: true, snap: 0.5 }],
          curves: [{ param: ['t*px', '20 - 20*t'], t: [0, 1], color: 'warn', width: 2.4 }, { param: ['px + t*(50 - px)', '-15*t'], t: [0, 1], color: 'warn', width: 2.4 }],
          points: [{ x: 0, y: 20, color: 'ink', label: 'lifeguard', labelDx: 8, labelDy: -10 }, { x: 50, y: -15, color: 'bad', label: 'swimmer', labelDx: -60, labelDy: 14 }],
          readouts: [{ label: 'sin θ₁ / v₁', expr: 'px/sqrt(400 + px^2)/6', unit: '\\mathrm{s/m}', digits: 3 }, { label: 'sin θ₂ / v₂', expr: '(50 - px)/sqrt(225 + (50 - px)^2)/2', unit: '\\mathrm{s/m}', digits: 3 }],
        },
        caption: t`Lifeguard 20 m up the beach, swimmer 50 m along and 15 m out. The time itself is not shown.`,
      },
      answer: { x: r6(lifeguard(20, 15, 50, 6, 2).x), y: 0 }, tol: { x: 1.5, y: 1 },
      instruction: 'Drag the crossing point along the shore, then check.',
      hints: [t`At the least-time point $\sin\theta_1/v_1 = \sin\theta_2/v_2$. Move the point until the two readouts agree.`, t`Moving the point toward the swimmer raises $\sin\theta_1$ and lowers $\sin\theta_2$.`],
      teach: t`The least-time crossing is where the two sides' $\sin\theta/v$ agree — Snell's law.`,
      explain: t`The ratios agree at $x \approx ${sci(lifeguard(20, 15, 50, 6, 2).x, 3)}$ m, where $T = ${sci(lifeguard(20, 15, 50, 6, 2).T, 3)}$ s — less than the straight line's $${sci(lifeguard(20, 15, 50, 6, 2).Tline, 3)}$ s.`,
    },
    expr({
      id: 'dTdx', difficulty: 2,
      gen(r) {
        const v1 = r.pick([5, 6, 7]), v2 = r.pick([1, 1.5, 2]);
        const src = `sqrt(400 + x^2)/${v1} + sqrt(225 + (50 - x)^2)/${v2}`;
        return {
          prompt: t`A lifeguard's time to cross the shore at $x$ (in m) is $T(x) = \dfrac{\sqrt{400 + x^2}}{${v1}} + \dfrac{\sqrt{225 + (50 - x)^2}}{${v2}}$ seconds. Find $dT/dx$.`,
          answer: `x/(${v1}*sqrt(400 + x^2)) - (50 - x)/(${v2}*sqrt(225 + (50 - x)^2))`,
          answerTeX: t`\frac{x}{${v1}\sqrt{400 + x^2}} - \frac{50 - x}{${v2}\sqrt{225 + (50 - x)^2}}`,
          lhs: 'dT/dx', vars: { x: [1, 49] }, derivativeOf: src,
          errors: [{ answer: `x/(${v1}*sqrt(400 + x^2)) + (50 - x)/(${v2}*sqrt(225 + (50 - x)^2))`, feedback: t`The chain rule on $(50 - x)^2$ brings a factor $-1$: the second term enters with a minus sign.` }],
          hints: [t`$\frac{d}{dx}\sqrt{u} = \frac{u'}{2\sqrt u}$.`, t`For the second term $u = 225 + (50 - x)^2$, so $u' = -2(50 - x)$.`],
          teach: t`Setting $dT/dx = 0$ balances the two legs: each term is a $\sin\theta/v$.`,
          explain: t`$dT/dx = \dfrac{x}{${v1}\sqrt{400 + x^2}} - \dfrac{50 - x}{${v2}\sqrt{225 + (50 - x)^2}}$: the first term is $\sin\theta_1/v_1$, the second $\sin\theta_2/v_2$. Zero means Snell's law.`,
          visual: gpic({ x: [0, 50], y: [r6(lifeguard(20, 15, 50, v1, v2).T * 0.95), r6(lifeguard(20, 15, 50, v1, v2).T * 1.6)], xlabel: 'crossing point x (m)', ylabel: 'T (s)', curves: [{ fn: src, color: 'accent', width: 2.4 }] }, t`$T(x)$ for every crossing point: the least time is where its slope vanishes.`, 'Travel time against crossing point, a curve with a minimum'),
        };
      },
    }),
    mcq({
      id: 'mirage', difficulty: 3,
      prompt: t`On a hot day a road far ahead looks wet: you see the sky “reflected” in it. The air just above the hot road is hotter and thinner, so its index $n$ is slightly **lower** than the air above. By Fermat's principle, why do you see the sky there?`,
      visual: gpic({
        x: [0, 100], y: [-0.4, 3], xlabel: 'distance (m)', ylabel: 'height (m)',
        shade: [{ fn: '0.8', lower: '0', from: 0, to: 100, color: 'warn', alpha: 0.15 }],
        curves: [seg([0, 0], [100, 0], 'ink2', 3), { fn: '0.25 + 0.00095*(x - 40)^2', domain: [2, 100], color: 'accent', width: 2.2 }],
        points: [{ x: 2, y: 1.7, color: 'ink', label: 'eye', labelDx: 8, labelDy: -8 }, lab(70, 0.45, 'hot, low-n air', 'warn'), lab(68, 2.4, 'from the sky', 'accent')],
      }, t`A ray from the sky reaching the eye. The vertical scale is greatly exaggerated: real mirage rays bend by well under a degree.`, 'A light ray from the sky dipping toward a hot road and rising to an eye'),
      choices: [
        t`Light from the sky dips into the faster, low-$n$ air near the road and curves back up: the least-time path, so the eye sees sky light arriving from below the horizon`,
        t`The hot road reflects light like a mirror because heat makes asphalt shiny`,
        t`Light bends **toward** the road because the hot air has a higher index`,
        t`Water vapour from the road condenses into a thin film that reflects the sky`,
      ],
      answer: 0,
      why: {
        1: t`Asphalt does not become a mirror; move closer and the "water" vanishes, which a real reflector would not do.`,
        2: t`Hot air is less dense, so its index is *lower*; and least time makes rays bend away from low $n$ toward high $n$ — here, upward.`,
        3: t`There is no film: photographs and the geometry of the image are explained entirely by refraction in air.`,
      },
      hints: [t`Light is fastest where $n$ is lowest. A path that dips into the low-$n$ layer near the road can save time even though it is longer.`, t`In a layered medium $n\cos\phi$ is constant ($\phi$ above the horizontal): where $n$ is smaller, $\cos\phi$ must be larger — the ray flattens and turns back up.`],
      teach: t`Rays bend toward higher index; a hot road puts the low index at the bottom, so rays curve upward — an inferior mirage.`,
      explain: t`The integrand $n(y)\sqrt{1 + y'^2}$ has no $x$, so $n\cos\phi$ is constant along a ray. Going down, $n$ falls, so $\phi$ must flatten to zero and the ray turns up. Your eye traces the ray back along its final direction — downward — and sees the sky below the horizon, shimmering as the hot air churns.`,
    }),
    num({
      id: 'glass-speed', difficulty: 2,
      gen(r) {
        const th1 = r.pick([40, 50, 60]), n = r.pick([1.46, 1.52, 1.65]);
        const th2 = deg(Math.asin(Math.sin(th1 * DEG) / n)), th2r = Math.round(th2 * 10) / 10;
        const v = (2.998e8 * Math.sin(th2r * DEG)) / Math.sin(th1 * DEG);
        return {
          prompt: t`A laser beam in air hits a glass block at $${th1}^\circ$ from the normal and travels inside at $${th2r}^\circ$ from the normal. Using least time ($\sin\theta_1/v_1 = \sin\theta_2/v_2$), how fast does light travel in the glass? Give it in units of $10^8$ m/s.`,
          answer: v / 1e8, tol: { rel: 0.005 },
          errors: [{ value: (2.998 * Math.sin(th1 * DEG)) / Math.sin(th2r * DEG), feedback: t`Upside down: the beam bends toward the normal, so it is **slower** in the glass: $v_2 = c\,\sin\theta_2/\sin\theta_1$.` }],
          hints: [t`$v_1 = c = 2.998\times10^8$ m/s in air (very nearly).`, t`$v_2 = c\,\sin${th2r}^\circ/\sin${th1}^\circ$.`],
          teach: t`Snell's law in least-time form compares speeds directly: $v_2/v_1 = \sin\theta_2/\sin\theta_1$.`,
          explain: t`$v_2 = 2.998\times10^8\times\sin${th2r}^\circ/\sin${th1}^\circ = ${sci(v / 1e8, 3)}\times10^8$ m/s, so $n = c/v_2 = ${sci(2.998e8 / v, 3)}$.`,
          visual: iface({ n1: 1, n2: n, angle: th1 }, t`The beam entering the glass, bending toward the normal.`),
        };
      },
    }),
    mcq({
      id: 'ellipse', difficulty: 3,
      prompt: t`Light leaves one focus of an elliptical mirror and reaches the other focus after one reflection. Every point of the ellipse gives the same path length (that is what an ellipse is). What does this say about Fermat's principle?`,
      visual: gpic({
        x: [-2.4, 2.4], y: [-1.5, 1.5], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
        curves: [{ param: ['2*cos(t)', '1.2*sin(t)'], t: [0, 6.2832], color: 'ink2', width: 2.6 }, seg([-1.6, 0], [0.8, 1.0998], 'gold', 1.4), seg([0.8, 1.0998], [1.6, 0], 'gold', 1.4), seg([-1.6, 0], [-0.9, -1.0717], 'gold', 1.4), seg([-0.9, -1.0717], [1.6, 0], 'gold', 1.4)],
        points: [{ x: -1.6, y: 0, color: 'warn', label: 'F₁', labelDx: -6, labelDy: -12 }, { x: 1.6, y: 0, color: 'warn', label: 'F₂', labelDx: -4, labelDy: -12 }],
      }, t`An elliptical mirror with its two foci; two of the infinitely many reflected paths from one focus to the other.`, 'An ellipse with two foci and two reflected rays'),
      choices: [
        t`The principle asks only that the time be **stationary**: here it is stationary for every reflection point at once, so light from one focus reaches the other by every route`,
        t`It shows Fermat's principle fails for mirrors`,
        t`Light picks the shortest of these paths, the one along the major axis`,
        t`Light cannot reach the second focus, because no path is uniquely least`,
      ],
      answer: 0,
      why: {
        1: t`Reflection obeys Fermat's principle exactly; the ellipse is the borderline case where every point is stationary.`,
        2: t`They all have the same length — that is the defining property of the ellipse. None is shorter.`,
        3: t`Uniqueness is not required. Light goes by all stationary paths; this is why an ellipse focuses light from one focus to the other.`,
      },
      hints: [t`What does "stationary" require: a unique minimum, or a zero first derivative?`, t`A mirror curved more strongly than the ellipse makes the reflected path a local **maximum** of time — and light still follows it.`],
      teach: t`Fermat's principle is about stationary time; minimum, maximum and "flat everywhere" are all allowed.`,
      explain: t`On the ellipse the time is the same for every reflection point, so it is stationary everywhere and all those paths are taken: the ellipse focuses. A mirror more curved than the ellipse would make the reflected path a time **maximum** — the optical version of the long-arc saddle in [M3.1](#/lesson/phys3550.M3.1).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fibre', difficulty: 3, transfer: true,
      gen(r) {
        const n0 = r.pick([1.46, 1.48, 1.5]), a = r.pick([4, 6, 8, 10]);
        const nt = n0 * Math.cos(a * DEG);
        return {
          prompt: t`In a graded-index optical fibre the index is highest on the axis, $n_0 = ${n0}$, and falls smoothly outward. A ray crosses the axis at $${a}^\circ$ to it. Since the integrand $n(r)\sqrt{1 + r'^2}$ has no $z$ (the distance along the fibre), $n\cos\phi$ is constant along the ray, $\phi$ being the angle to the axis. What is the index where the ray turns back toward the axis? Give 5 significant figures.`,
          answer: nt, tol: { rel: 2e-5 },
          errors: distinct([{ value: n0 * Math.sin(a * DEG), feedback: t`$\phi$ is measured from the axis, so the invariant is $n\cos\phi$; the ray turns where $\phi = 0$, i.e. $\cos\phi = 1$.` }, { value: n0 / Math.cos(a * DEG), feedback: t`The ray turns where the index is **lower** than on the axis: $n_{\text{turn}} = n_0\cos\phi_0$.` }], nt, 1e-4),
          hints: [t`On the axis $n\cos\phi = ${n0}\cos${a}^\circ$. At the turning point the ray runs parallel to the axis.`, t`So $n_{\text{turn}} = ${n0}\cos${a}^\circ$.`],
          teach: t`A missing coordinate gives a conserved quantity: in a graded fibre $n\cos\phi$ is fixed, so each ray turns back at a definite index.`,
          explain: t`$n_{\text{turn}} = ${n0}\cos${a}^\circ = ${nt.toFixed(5)}$. Rays steeper than the acceptance angle reach the cladding before turning and leak out; those that turn are trapped, snaking along the core. Graded fibres also equalize the transit times of steep and shallow rays — Fermat again — which reduces pulse spreading.`,
          visual: gpic({
            x: [0, 20], y: [-1.5, 1.5], xlabel: 'along the fibre', ylabel: '', yticks: 0, xticks: 0,
            shade: [{ fn: '0.4', lower: '-0.4', from: 0, to: 20, color: 'accent', alpha: 0.18 }, { fn: '0.8', lower: '-0.8', from: 0, to: 20, color: 'accent', alpha: 0.12 }, { fn: '1.2', lower: '-1.2', from: 0, to: 20, color: 'accent', alpha: 0.08 }],
            curves: [{ fn: '0.9*sin(2*pi*x/8)', domain: [0, 20], color: 'gold', width: 2.2 }, seg([0, 0], [20, 0], 'ink4', 1, true)],
            points: [lab(19.5, 1.3, 'lower n', 'ink3', -40), lab(19.5, 0.12, 'highest n', 'accent', -60)],
          }, t`A ray snaking along a graded-index core (darker = higher index). Schematic: a real core is about 50 μm across and the wavelength of the snake is millimetres.`, 'A sinusoidal ray in a graded-index fibre'),
        };
      },
    }),
    num({
      id: 'cp-lifeguard', difficulty: 3,
      gen(r) {
        const v1 = r.pick([5, 6, 7.5]), v2 = r.pick([1.2, 1.8, 2.5]);
        const L = lifeguard(20, 15, 50, v1, v2);
        return {
          prompt: t`A lifeguard 20 m from the water's edge runs at $${v1}$ m/s and swims at $${v2}$ m/s to a swimmer 50 m along the shore and 15 m out. What is her least possible time?`,
          answer: L.T, units: 's', tol: { rel: 0.005 },
          errors: distinct([{ value: L.Tline, feedback: t`That is the straight line at the swimmer. Bend the path at the shore so that $\sin\theta_1/v_1 = \sin\theta_2/v_2$.` }, { value: L.Tswim, feedback: t`Running to the nearest point and swimming straight out spends too long running. Solve $dT/dx = 0$.` }], L.T, 0.005),
          hints: [t`$T(x) = \sqrt{400 + x^2}/${v1} + \sqrt{225 + (50 - x)^2}/${v2}$; find where $dT/dx = 0$ numerically.`, t`The root lies between $x = 30$ and $x = 50$ m: the slow swim pulls the crossing toward the swimmer.`],
          teach: t`Minimize $T(x)$ by solving $dT/dx = 0$ — Snell's condition — numerically.`,
          explain: t`$dT/dx = 0$ at $x = ${sci(L.x, 3)}$ m, giving $T = ${sci(L.T, 3)}$ s (straight line: $${sci(L.Tline, 3)}$ s).`,
          visual: beach({ a: 20, b: 15, d: 50, caption: t`The beach, to scale; the path is yours to find.` }),
        };
      },
    }),
    mcq({
      id: 'cp-lensing', difficulty: 3, transfer: true,
      prompt: t`In weak gravity, light near a mass $M$ behaves as if space had an effective refractive index $n \approx 1 + 2GM/(rc^2)$ — a little above 1, largest close to the mass. (This is a weak-field teaching model of general relativity's null geodesics, not a literal medium.) By Fermat's principle, how does starlight passing the Sun bend?`,
      visual: { type: 'gr-lensing', params: {}, caption: t`A point-mass lens bending light from a background source into images. Ray-traced in the weak-field approximation.` },
      choices: [
        t`Toward the Sun: rays bend toward higher index, so the star appears shifted **away** from the Sun — 1.75 arcseconds at the Sun's edge, as measured since 1919`,
        t`Away from the Sun: the index is higher there, so light avoids it`,
        t`Not at all: light has no mass, so gravity cannot affect it`,
        t`Toward the Sun, so the star appears shifted **toward** the Sun`,
      ],
      answer: 0,
      why: {
        1: t`Least time bends rays toward higher index — the slower region — as at a water surface. The Sun's side is "slower", so the ray curves toward it.`,
        2: t`Light follows the geometry of spacetime, mass or not; the deflection has been measured, from Eddington's 1919 eclipse to radio interferometry, which agrees with general relativity to better than 0.1%.`,
        3: t`The ray bends toward the Sun, but you see the star along the ray's final direction, traced back: that points farther from the Sun than the star's true position.`,
      },
      hints: [t`At a water surface the ray bends toward the normal on the high-$n$ side. Which side of a passing ray has the higher effective $n$?`, t`Then think about where your eye traces the incoming ray back to.`],
      teach: t`Rays bend toward higher index; near a mass the effective index is higher, so light bends round it — a lens.`,
      explain: t`Integrating the bend gives the deflection $4GM/(c^2b)$ — 1.75 arcseconds for a ray grazing the Sun, twice Newton's naive value and confirmed by measurement. The star appears pushed outward. In general relativity this is a [null geodesic](#/lesson/gr.S24.i): Fermat's principle survives as a statement about spacetime.`,
    }),
  ],
  sources: [
    { label: 'J. R. Taylor, Classical Mechanics (University Science Books, 2005), ch. 6 (Fermat’s principle problems)', url: 'https://uscibooks.aip.org/?p=2549' },
    { label: 'Feynman Lectures on Physics, Vol. I, ch. 26: Optics — the principle of least time', url: 'https://www.feynmanlectures.caltech.edu/I_26.html' },
    { label: 'V. Perlick, Gravitational lensing from a spacetime perspective, Living Rev. Relativ. 7 (2004) 9', url: 'https://link.springer.com/article/10.12942/lrr-2004-9' },
  ],
});
