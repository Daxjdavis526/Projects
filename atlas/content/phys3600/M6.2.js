// The Biot–Savart law (Griffiths §5.2): steady currents (line, surface,
// volume), the law as a line integral with the cross product, the finite
// straight segment (sin θ₂ − sin θ₁) on and off its bisector, the square
// loop's centre built from four segments, the loop on its axis and where its
// field halves, Helmholtz spacing from the vanishing second derivative, a
// spinning charged disk (a surface current K = σωs), and why Ampère's law
// cannot be used on a lone segment. Transfer: the storm-time ring current
// from Earth's Dst index. Numbers cross-checked by quadrature (_mag.js). The
// intro version (wire, loop centre, the formula on the axis) is phys2220.B2.1.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, tex } from '../../src/core/format.js';
import { MU0, KM, PI, DEG, sf, biotSavart, loopAxis, circle, polygon, bare } from './_mag.js';

const t = String.raw;
const RE = 6371e3;

/** B (T) of a straight segment from x1 to x2 on the x-axis at (px, s), s > 0, by the closed form. */
const segB = (I, x1, x2, px, s) => ((KM * I) / s) * ((x2 - px) / Math.hypot(x2 - px, s) - (x1 - px) / Math.hypot(x1 - px, s));
/** The same by quadrature, for checking. */
const segBnum = (I, x1, x2, px, s) => biotSavart([[x1, 0, 0], [x2, 0, 0]], I, [px, s, 0])[2];

/** A segment on the x-axis (cm) with a field point P and the lines from P to its ends. */
function segPic(x1, x2, px, s, caption, extra = {}) {
  const xa = Math.min(x1, px) - 1.5, xb = Math.max(x2, px) + 1.5, H = Math.max((xb - xa) / 2.1, (s + 1.2) / 0.78);
  return {
    type: 'graph',
    params: bare([xa, xb], [-0.22 * H, 0.78 * H], {
      curves: [
        { param: [`${x1} + t*(${x2 - x1})`, '0'], t: [0, 1], color: 'warn', width: 4 },
        { param: [`${x1} + t*(${px - x1})`, `t*${s}`], t: [0, 1], color: 'ink3', width: 1.2, dash: [4, 4] },
        { param: [`${x2} + t*(${px - x2})`, `t*${s}`], t: [0, 1], color: 'ink3', width: 1.2, dash: [4, 4] },
        { param: [`${px}`, `t*${s}`], t: [0, 1], color: 'ink4', width: 1, dash: [2, 4] },
      ],
      arrows: [{ from: [(x1 + x2) / 2 - 0.6, 0], to: [(x1 + x2) / 2 + 0.6, 0], color: 'warn', width: 3, label: 'I', labelDx: 4, labelDy: 14 }],
      points: [{ x: px, y: s, r: 5, color: 'violet', label: 'P', labelDx: 8 }],
      ...extra,
    }),
    caption,
  };
}

/** A square loop of side 2 (drawn), current anticlockwise. */
const SQ = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
const squareArrows = [[0, -1, 1, 0], [1, 0, 0, 1], [0, 1, -1, 0], [-1, 0, 0, -1]].map(([x, y, dx, dy]) => ({ from: [x - 0.25 * dx, y - 0.25 * dy], to: [x + 0.25 * dx, y + 0.25 * dy], color: 'warn', width: 3 }));

export default lesson({
  id: 'phys3600.M6.2',
  title: 'The Biot–Savart law',
  minutes: 17, difficulty: 3,
  equation: t`\vec B(\vec r) = \frac{\mu_0}{4\pi}\int\frac{\vec I\times\hat{\mathcal R}}{\mathcal R^2}\,dl'`,
  intro: t`Steady currents — charge flowing at the same rate everywhere, so none piles up — make the magnetic field of the Biot–Savart law: each piece $dl'$ of a wire, carrying current $\vec I$ along it, adds $\dfrac{\mu_0}{4\pi}\dfrac{\vec I\times\hat{\mathcal R}}{\mathcal R^2}dl'$, with $\vec{\mathcal R}$ running from the piece to the field point (the separation vector of [M0.1](#/lesson/phys3600.M0.1)). It is the magnetic Coulomb’s law — inverse square — but the **cross product** makes each piece’s field circle its own line. For a sheet or a volume of current, replace $\vec I\,dl'$ by $\vec K\,da'$ or $\vec J\,d\tau'$. You used the results in [Physics II](#/lesson/phys2220.B2.1); here you evaluate the integral, the way [M1.1](#/lesson/phys3600.M1.1) did for Coulomb’s law, and the finite straight segment becomes the building block for any circuit made of straight wires.`,
  symbols: [
    { tex: '\\mu_0', text: t`the vacuum permeability, $${tex(MU0, 9)}\ \text{N/A}^2$ — within a part in $10^9$ of $4\pi\times10^{-7}$` },
    { tex: '\\vec I', text: 'the current, in A, pointing along the wire the way it flows' },
    { tex: 'dl\'', text: 'the length of a small piece of the wire, in m (primes mark the source)' },
    { tex: '\\vec{\\mathcal R} = \\vec r - \\vec r\\,\'', text: t`the separation from the piece to the field point, length $\mathcal R$ in m, direction $\hat{\mathcal R}$` },
    { tex: '\\vec B', text: 'the magnetic field at the field point, in T' },
  ],
  why: t`Every coil in a magnetometer, an MRI scanner or a satellite’s attitude-control torquer is designed with this integral — and Helmholtz coils, which make the most uniform field two loops can, come from setting one of its derivatives to zero.`,
  visual: {
    type: 'graph',
    title: 'Where a segment’s field comes from',
    lead: t`A straight wire (orange) from $x = a$ to $x = b$ carries current $I$ to the right; lengths in cm. Drag the point P. Below the wire, the blue curve shows how much each piece of wire adds to $B$ at P; the faint dashed curve is what the rest of an infinitely long wire would add. Above the wire $\vec B$ at P points out of the page; below, into it.`,
    tasks: [
      t`Put P 1 cm above the middle and pull the ends out to $\pm5.5$ cm: the segment gives almost all of the infinite wire’s $\mu_0I/2\pi s$ — the far pieces add little.`,
      t`Now raise P to 4 cm: the blue hump widens past the ends and the ratio drops. “Long” means long **compared with the distance**.`,
      t`Drag P beyond the right end of the wire, still above its line: the field is weaker but not zero. Then slide P down onto the line itself: every $d\vec l\,'$ is parallel to $\vec{\mathcal R}$ and $B = 0$.`,
    ],
    params: {
      ...bare([-6, 6], [-1.5, 4.2]),
      sliders: [
        { key: 'a', label: t`Left end $a$`, min: -5.5, max: -0.5, step: 0.1, value: -3, unit: t`\text{cm}`, explain: 'Where the wire starts.' },
        { key: 'b', label: t`Right end $b$`, min: 0.5, max: 5.5, step: 0.1, value: 3, unit: t`\text{cm}`, explain: 'Where the wire ends.' },
        { key: 'I', label: t`Current $I$`, min: 1, max: 20, step: 1, value: 10, unit: t`\text{A}`, explain: 'Steady current along the wire. (A lone segment cannot carry one: imagine the rest of the circuit far away.)' },
      ],
      drag: [{ key: 'p', x: 0.8, y: 1.6 }],
      curves: [
        { fn: '-1.2*abs(py)^3/((x - px)^2 + py^2)^1.5', domain: [-6, 6], color: 'ink4', width: 1.2, dash: [4, 4] },
        { fn: '-1.2*abs(py)^3/((x - px)^2 + py^2)^1.5', domain: ['a', 'b'], color: 'accent', width: 2.2 },
        { param: ['a + t*(b - a)', '0'], t: [0, 1], color: 'warn', width: 4 },
        { param: ['a + t*(px - a)', 't*py'], t: [0, 1], color: 'ink3', width: 1.2, dash: [4, 4] },
        { param: ['b + t*(px - b)', 't*py'], t: [0, 1], color: 'ink3', width: 1.2, dash: [4, 4] },
      ],
      shade: [{ fn: '0', lower: '-1.2*abs(py)^3/((x - px)^2 + py^2)^1.5', from: 'a', to: 'b', color: 'accent', alpha: 0.2 }],
      arrows: [{ from: ['(a + b)/2 - 0.5', 0], to: ['(a + b)/2 + 0.5', 0], color: 'warn', width: 3, label: 'I', labelDx: 4, labelDy: -10 }],
      points: [{ x: 'px', y: 'py', r: 0, label: 'P', labelDx: 12, labelDy: -8 }],
      readouts: [
        { label: t`$B$ from the segment`, expr: '10*I/abs(py)*abs((b - px)/sqrt((b - px)^2 + py^2) - (a - px)/sqrt((a - px)^2 + py^2))', unit: t`\mu\text{T}`, digits: 3 },
        { label: t`$B$ of an infinite wire, $\mu_0I/2\pi s$`, expr: '20*I/abs(py)', unit: t`\mu\text{T}`, digits: 3 },
        { label: 'segment ÷ infinite wire', expr: '0.5*abs((b - px)/sqrt((b - px)^2 + py^2) - (a - px)/sqrt((a - px)^2 + py^2))', digits: 3 },
      ],
    },
    caption: t`Exact: $B = \dfrac{\mu_0I}{4\pi s}(\sin\theta_2 - \sin\theta_1)$, with $s$ the distance from the wire’s line and $\theta_1$, $\theta_2$ the angles of the two ends seen from P, measured from the perpendicular. The blue curve is $s/\mathcal R^3$, scaled to fit: the integrand of that formula.`,
  },
  example: {
    prompt: t`A square loop of wire, 10 cm on a side, carries 5.0 A. Find the magnetic field at its centre, and compare it with a circular loop.`,
    visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { curves: [...polygon(SQ, 'warn'), { param: ['-t', '-t'], t: [0, 1], color: 'ink3', width: 1, dash: [4, 4] }, { param: ['t', '-t'], t: [0, 1], color: 'ink3', width: 1, dash: [4, 4] }, { param: ['0', '-t'], t: [0, 1], color: 'ink4', width: 1, dash: [2, 4] }], arrows: squareArrows, points: [{ x: 0, y: 0, r: 5, color: 'violet', label: 'centre', labelDx: 8 }, { x: 0.12, y: -0.42, r: 0, label: '45°', labelDx: 0, color: 'ink2' }, { x: 0, y: -0.75, r: 0, label: 's = a/2', labelDx: -60, color: 'ink3' }] }), caption: t`The square (current anticlockwise) and, for its bottom side, the perpendicular from the centre and the lines to the side’s two ends, each at 45°. The field at the centre points out of the page.` },
    steps: [
      { label: 'One side', text: t`The bottom side is a segment seen from distance $s = a/2$, its ends at $\theta = \pm45°$: $B = \dfrac{\mu_0I}{4\pi(a/2)}(\sin45° + \sin45°) = \dfrac{\sqrt2\,\mu_0I}{2\pi a}$.` },
      { label: 'Direction', text: t`$d\vec l\,'\times\hat{\mathcal R}$ for the bottom side (current to the right, centre above it) points out of the page. By symmetry every side gives the same, also out of the page.` },
      { label: 'Add them', text: t`$B = 4\cdot\dfrac{\sqrt2\,\mu_0I}{2\pi a} = \dfrac{2\sqrt2\,\mu_0I}{\pi a} = \dfrac{2\sqrt2(${tex(MU0, 5)})(5.0)}{\pi(0.10)} \approx ${nice(sf(((2 * Math.SQRT2 * MU0 * 5) / (PI * 0.1)) * 1e6, 3))}\ \mu\text{T}$.` },
      { label: 'Check by computer', text: t`Summing $d\vec B$ numerically round the square (Gauss–Legendre quadrature on each side) gives $${nice(sf(biotSavart([[-0.05, -0.05, 0], [0.05, -0.05, 0], [0.05, 0.05, 0], [-0.05, 0.05, 0], [-0.05, -0.05, 0]], 5, [0, 0, 0])[2] * 1e6, 6))}\ \mu\text{T}$ ✓.` },
      { label: 'Compare', text: t`A circle of the same perimeter (radius $2a/\pi$) gives $\mu_0I/2R \approx ${nice(sf((MU0 * 5) / (2 * ((2 * 0.1) / PI)) * 1e6, 3))}\ \mu\text{T}$: less, because the circle keeps all its wire farther from the centre than the square’s nearest points. For comparison, Earth’s field is about 50 μT.` },
    ],
    answer: t`$B = \dfrac{2\sqrt2\,\mu_0I}{\pi a} \approx ${nice(sf(((2 * Math.SQRT2 * MU0 * 5) / (PI * 0.1)) * 1e6, 3))}\ \mu\text{T}$, out of the page for anticlockwise current.`,
  },
  practice: [
    num({
      id: 'bisector', difficulty: 2,
      gen(r) {
        const L = r.pick([10, 20, 40]), s = r.pick([2, 5, 10]), I = r.pick([2, 5, 10]);
        const B = segB(I, -L / 200, L / 200, 0, s / 100);
        return {
          prompt: t`A straight wire ${L} cm long carries ${I} A. How strong is its magnetic field ${s} cm from its midpoint, on the perpendicular bisector? (The rest of the circuit is far away.)`,
          visual: segPic(-L / 4, L / 4, 0, s / 2, t`The segment (orange), the point P on its bisector, and the lines to its ends (dashed). Drawn at half scale.`),
          answer: B * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: ((2 * KM * I) / (s / 100)) * 1e6, feedback: t`That is the infinite wire’s $\mu_0I/2\pi s$. A ${L} cm wire seen from ${s} cm is not infinitely long: use the angles of its ends.` }, { value: (B / 2) * 1e6, feedback: t`Both halves of the wire contribute: $\sin\theta_2 - \sin\theta_1 = 2\sin\theta$.` }].filter((e) => Math.abs(e.value - B * 1e6) > 0.02 * B * 1e6),
          hints: [t`$B = \dfrac{\mu_0I}{4\pi s}(\sin\theta_2 - \sin\theta_1)$, and on the bisector $\sin\theta_2 = -\sin\theta_1 = \dfrac{L/2}{\sqrt{(L/2)^2 + s^2}}$.`, t`$\dfrac{L/2}{\sqrt{(L/2)^2 + s^2}} = ${nice(sf(L / 2 / Math.hypot(L / 2, s), 4))}$, and $\mu_0/4\pi = 10^{-7}$ T·m/A.`],
          teach: 'A finite straight segment gives (μ₀I/4πs)(sin θ₂ − sin θ₁); it approaches the infinite wire only when it is long compared with s.',
          explain: t`$B = \dfrac{\mu_0I}{4\pi s}\cdot\dfrac{2(L/2)}{\sqrt{(L/2)^2 + s^2}} \approx ${nice(sf(B * 1e6, 3))}\ \mu\text{T}$ — ${nice(sf((100 * L) / 2 / Math.hypot(L / 2, s), 3))}% of an infinite wire’s.`,
        };
      },
    }),
    num({
      id: 'beyond', difficulty: 3,
      gen(r) {
        const L = r.pick([10, 20]), dx = r.pick([2, 5]), s = r.pick([3, 5]), I = r.pick([5, 10]);
        const px = L + dx, B = segB(I, 0, L / 100, px / 100, s / 100);
        if (Math.abs(B - segBnum(I, 0, L / 100, px / 100, s / 100)) > 1e-6 * B) throw new Error('segment check');
        return {
          prompt: t`A straight wire runs from $x = 0$ to $x = ${L}$ cm along the $x$-axis, carrying ${I} A in the $+x$ direction. Find the size of its magnetic field at the point $x = ${px}$ cm, $y = ${s}$ cm — beyond the wire’s end.`,
          visual: segPic(0, L / 2, px / 2, s / 2, t`The wire, the point P beyond its end, and the lines from P to its two ends (dashed). Half scale.`),
          answer: B * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: segB(I, -L / 200, L / 200, 0, s / 100) * 1e6, feedback: 'That is the field on the bisector. Here P is off to one side: both ends are behind it, at different angles.' }, { value: ((KM * I) / (s / 100)) * (Math.abs((L - px) / Math.hypot(L - px, s)) + Math.abs(px / Math.hypot(px, s))) * 1e6, feedback: t`Both ends lie on the same side of P’s perpendicular, so the angles have the same sign: subtract, $\sin\theta_2 - \sin\theta_1$.` }],
          hints: [t`Measure each angle from the perpendicular dropped from P to the wire’s line (at $x = ${px}$ cm): $\sin\theta = \dfrac{x - ${px}}{\sqrt{(x - ${px})^2 + s^2}}$ for the end at $x$.`, t`$\sin\theta_2 = ${nice(sf((L - px) / Math.hypot(L - px, s), 4))}$ (the end at ${L} cm) and $\sin\theta_1 = ${nice(sf(-px / Math.hypot(px, s), 4))}$ (the end at 0).`],
          teach: 'The segment formula works from any point: measure both end angles from the same perpendicular, with signs.',
          explain: t`$B = \dfrac{\mu_0I}{4\pi s}(\sin\theta_2 - \sin\theta_1) = \dfrac{10^{-7}(${I})}{${s / 100}}(${nice(sf((L - px) / Math.hypot(L - px, s), 4))} + ${nice(sf(px / Math.hypot(px, s), 4))}) \approx ${nice(sf(B * 1e6, 3))}\ \mu\text{T}$, out of the page. A numerical Biot–Savart sum agrees.`,
        };
      },
    }),
    num({
      id: 'half-axis', difficulty: 3,
      gen(r) {
        const R = r.pick([3, 5, 8, 12]);
        const z = R * Math.sqrt(2 ** (2 / 3) - 1);
        return {
          prompt: t`A circular loop of radius ${R} cm carries a steady current. How far from its centre, along its axis, has the field fallen to half its value at the centre?`,
          visual: { type: 'em-bfield', params: { unit: 'cm', x: [-3 * R, 3 * R], y: [-1.6 * R, 1.6 * R], loops: [{ x: 0, R, I: 10 }], static: true, readouts: [], labels: false, density: 1.1 }, caption: 'The loop seen edge-on (its axis horizontal) with its field lines. The field along the axis is strongest at the centre.' },
          answer: z, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: R, feedback: t`At $z = R$ the field is $(1 + 1)^{-3/2} = 0.354$ of the centre value — less than half.` }, { value: R * Math.sqrt(2 ** 0.5 - 1), feedback: t`The power is $3/2$: $(1 + z^2/R^2)^{3/2} = 2$, so $1 + z^2/R^2 = 2^{2/3}$.` }],
          hints: [t`On the axis $B(z) = \dfrac{\mu_0IR^2}{2(R^2 + z^2)^{3/2}}$, so $B(z)/B(0) = (1 + z^2/R^2)^{-3/2}$.`, t`Set it to $\tfrac12$: $1 + z^2/R^2 = 2^{2/3} \approx 1.587$.`],
          teach: 'On a loop’s axis B falls as (1 + z²/R²)^−3/2: to half at z ≈ 0.77R, and as 1/z³ far away.',
          explain: t`$z = R\sqrt{2^{2/3} - 1} \approx 0.766R = ${nice(sf(z, 3))}$ cm. (Derivation: by symmetry the parts of $d\vec B$ across the axis cancel round the loop, and each piece adds $\dfrac{\mu_0I\,dl'}{4\pi\mathcal R^2}\cdot\dfrac{R}{\mathcal R}$ along it.)`,
        };
      },
    }),
    {
      type: 'slider', id: 'helmholtz', difficulty: 3,
      prompt: t`Two identical coaxial loops of radius $R$ carry equal currents the same way. Set their separation $d$ so that the field near the midpoint is as **uniform** as possible.`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.3, 1.3], y: [0.6, 1.25], aspect: 'wide', xlabel: 'z / R (along the axis, from the midpoint)', ylabel: 'B / B(midpoint)',
          sliders: [{ key: 'd', label: t`Separation $d/R$`, min: 0.4, max: 2, step: 0.02, value: 1.6, explain: 'The distance between the two coils, in units of their radius.' }],
          curves: [{ fn: '((1 + (x - d/2)^2)^(-1.5) + (1 + (x + d/2)^2)^(-1.5))/(2*(1 + d^2/4)^(-1.5))', color: 'accent', width: 2.6 }],
          vlines: [{ x: 'd/2', color: 'warn', label: 'coil' }, { x: '-d/2', color: 'warn', label: 'coil' }],
          hlines: [{ y: 1, color: 'ink3' }],
        },
        caption: t`The exact on-axis field of the pair, divided by its value at the midpoint. Coils marked in orange.`,
      },
      param: 'd', answer: [0.96, 1.04],
      instruction: 'Slide the separation until the curve is flattest at the middle, then check.',
      hints: [t`Too far apart, the field sags between the coils; too close, it peaks in the middle. In between, the bump turns into a dip.`, t`At the best spacing the second derivative of $B(z)$ vanishes at the midpoint: $d^2B/dz^2 = 0$.`],
      teach: 'Two coils one radius apart (Helmholtz coils) make the field’s second derivative vanish at the midpoint, so it is flat to fourth order.',
      explain: t`For one loop, $B''(z) \propto (4z^2 - R^2)$, which is zero at $z = R/2$. Put each coil $R/2$ from the midpoint — $d = R$ — and the curvatures of the two fields cancel there, while odd derivatives cancel by symmetry. The first surviving term is $z^4$: the field is uniform to 0.01% within $\pm0.1R$. Magnetometer test labs build three such pairs at right angles to cancel Earth’s field.`,
    },
    mcq({
      id: 'ampere-segment', difficulty: 3,
      prompt: t`For a finite straight wire carrying $I$, the Biot–Savart law gives $B = \dfrac{\mu_0I}{4\pi s}(\sin\theta_2 - \sin\theta_1)$. A student instead draws an Amperian circle of radius $s$ round the wire’s middle and gets $B = \mu_0I/2\pi s$. Which is right?`,
      visual: segPic(-2.5, 2.5, 0, 1.8, t`The segment and a field point at distance $s$ from its middle. An Amperian circle round the wire would pass through P.`, { curves: [{ param: ['-2.5 + 5*t', '0'], t: [0, 1], color: 'warn', width: 4 }, { param: ['0.35*cos(t)', '1.8*sin(t)'], t: [0, 2 * PI], color: 'violet', width: 1.6, dash: [5, 4] }] }),
      choices: [
        'Biot–Savart: Ampère’s law needs the whole steady circuit; a lone segment cannot carry a steady current, and the rest of the circuit adds field round the circle too',
        'Ampère: it is exact for any loop enclosing the current',
        'Both: they agree when the wire is finite',
        'Neither: magnetic fields of finite wires cannot be found',
      ],
      answer: 0,
      why: {
        1: t`$\oint\vec B\cdot d\vec l = \mu_0I$ is true for the whole circuit’s field, but $\vec B$ is not constant round the circle, so it cannot be pulled out of the integral — and the segment alone violates $\nabla\cdot\vec J = 0$ at its ends.`,
        2: t`They disagree unless the segment is infinitely long ($\theta \to \pm90°$).`,
        3: 'The segment formula is the field of that piece of a circuit; adding every piece gives the whole field.',
      },
      hints: ['Ampère’s law is derived from Biot–Savart for steady currents. Is a current that starts and stops at the ends of a segment steady?', t`Even for a whole circuit, Ampère’s law gives $B$ only if $\vec B$ is constant and tangent all round the loop. Is it, round a short wire?`],
      teach: 'Ampère’s law holds for complete steady circuits and gives B only with symmetry; a finite segment has neither.',
      explain: t`Charge would pile up at the ends of a lone segment, so its “current” is not steady and Ampère’s law (which assumes $\nabla\cdot\vec J = 0$) does not apply to it alone. In a real circuit the segment’s Biot–Savart field is one honest piece of the total, and only the total satisfies $\oint\vec B\cdot d\vec l = \mu_0I_{\text{enc}}$.`,
    }),
    num({
      id: 'disk', difficulty: 3,
      gen(r) {
        const sig = r.pick([20, 50, 100]), R = r.pick([5, 10, 20]), rpm = r.pick([3000, 6000, 12000]);
        const w = (2 * PI * rpm) / 60, B = (MU0 * sig * 1e-6 * w * (R / 100)) / 2;
        return {
          prompt: t`A plastic disk of radius ${R} cm carries a uniform surface charge of $${sig}\ \mu\text{C/m}^2$ and spins at ${rpm} rpm. Find the magnetic field at its centre.`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { shade: [{ fn: 'sqrt(max(1.21 - x^2, 0))', lower: '-sqrt(max(1.21 - x^2, 0))', from: -1.1, to: 1.1, color: 'gold', alpha: 0.18 }], curves: [circle(1.1, 'gold'), circle(0.6, 'violet', { width: 1.6 }), circle(0.72, 'violet', { width: 1.6 })], arrows: [{ from: [1.25, -0.5], to: [1.25, 0.5], color: 'warn', width: 2.4, label: 'ω', labelDx: 8 }], points: [{ x: 0, y: 0, r: 4, color: 'ink' }, { x: 0.66, y: 0.66, r: 0, label: 'ring s to s + ds', labelDx: 14, color: 'violet' }] }), caption: t`The disk from above, spinning anticlockwise. One thin ring (violet) carries current $dI = K\,ds$, with $K = \sigma\omega s$.` },
          answer: B * 1e9, units: 'nT', tol: { rel: 0.01 },
          errors: [{ value: 2 * B * 1e9, feedback: t`Each ring gives $\mu_0\,dI/2s$ — keep the 2. $\int_0^R\dfrac{\mu_0\sigma\omega s\,ds}{2s} = \dfrac{\mu_0\sigma\omega R}{2}$.` }, { value: (B / 2) * 1e9, feedback: t`That treats all the charge as sitting at the rim. Inner rings are closer to the centre and count for more per unit charge: integrate over rings.` }],
          hints: [t`A ring at radius $s$, width $ds$, carries $dI = K\,ds$ with surface current $K = \sigma v = \sigma\omega s$. Its field at the centre is $\mu_0\,dI/2s$.`, t`$B = \displaystyle\int_0^R\frac{\mu_0\sigma\omega s}{2s}\,ds = \frac{\mu_0\sigma\omega R}{2}$, with $\omega = 2\pi\times${rpm}/60$ rad/s.`],
          teach: 'A moving surface charge is a surface current K = σv; build its field from rings, each a loop of the Biot–Savart law.',
          explain: t`$\omega = ${nice(sf(w, 4))}$ rad/s, so $B = \tfrac12\mu_0\sigma\omega R \approx ${nice(sf(B * 1e9, 3))}$ nT — tiny: Rowland showed in 1876 that moving charge makes a magnetic field using exactly such a disk and a delicate compass needle.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ring-current', difficulty: 3, transfer: true,
      gen(r) {
        const dst = r.pick([50, 100, 200, 400]), n = r.pick([3, 4, 5]);
        const R = n * RE, I = (2 * R * dst * 1e-9) / MU0;
        return {
          prompt: t`During a geomagnetic storm, ions and electrons trapped in Earth’s magnetosphere drift round the planet, ions westward and electrons eastward: a westward **ring current**. Magnetometers near the equator then see the horizontal field drop; the averaged drop is the Dst index. Model the ring current as one circular loop of radius ${n} Earth radii (6371 km each), centred on Earth in the equatorial plane. What current makes Dst $= -${dst}$ nT at Earth’s centre?`,
          visual: { type: 'graph', params: bare([-5.6, 5.6], [-2.7, 2.7], { shade: [{ fn: 'sqrt(max(1 - x^2, 0))', lower: '-sqrt(max(1 - x^2, 0))', from: -1, to: 1, color: 'accent', alpha: 0.35 }], curves: [circle(1, 'accent'), { param: [`${n}*cos(t)`, `${n * 0.32}*sin(t)`], t: [0, 2 * PI], color: 'warn', width: 2.6 }], arrows: [{ from: [0.3, -n * 0.32], to: [-0.3, -n * 0.32], color: 'warn', width: 3, label: 'westward', labelDx: -30, labelDy: 16 }, { from: [0, 1.1], to: [0, 2.4], color: 'teal', width: 2.2, label: 'north', labelDx: 6 }], points: [{ x: n, y: 0, r: 0, label: `${n} Earth radii`, labelDx: 6, color: 'warn' }] }), caption: t`Earth (blue) and the ring current (orange) seen obliquely, to scale in radius. Real ring currents are broad, lopsided bands; one loop is a model, and part of a real Dst comes from other currents and from currents induced inside Earth.` },
          answer: I / 1e6, units: 'MA', tol: { rel: 0.01 },
          errors: [{ value: (2 * PI * R * dst * 1e-9) / MU0 / 1e6, feedback: t`That is Ampère-style $B = \mu_0I/2\pi s$, the straight-wire field. A ring at its centre gives $\mu_0I/2R$.` }, { value: (2 * RE * dst * 1e-9) / MU0 / 1e6, feedback: t`Use the ring’s radius, ${n} Earth radii, not Earth’s.` }],
          hints: [t`At the centre of a circular loop, $B = \dfrac{\mu_0I}{2R}$ (Biot–Savart: every piece is at distance $R$ and perpendicular to $\hat{\mathcal R}$).`, t`$I = \dfrac{2R\,|\text{Dst}|}{\mu_0}$ with $R = ${n}\times6.371\times10^{6}$ m.`],
          teach: 'At the centre of a loop B = μ₀I/2R, so a field change of tens of nanotesla at Earth means megaamperes circling thousands of kilometres out.',
          explain: t`$I = \dfrac{2(${tex(R, 3)})(${dst}\times10^{-9})}{${tex(MU0, 5)}} \approx ${nice(sf(I / 1e6, 3))}$ MA. The westward current makes a field pointing south at Earth’s centre — opposite to Earth’s own northward field at the equator — hence the drop. Earth’s surface lies ${['', '', '', 'a third', 'a quarter', 'a fifth'][n]} of the way to the ring, where this one-loop model’s field differs from the centre’s by under 10%.`,
        };
      },
    }),
    num({
      id: 'cp-rect', difficulty: 3,
      gen(r) {
        const a = r.pick([8, 10, 20]), b = r.pick([4, 5, 6]), I = r.pick([2, 5, 10]);
        const A = a / 100, Bb = b / 100;
        const B = (2 * MU0 * I * Math.hypot(A, Bb)) / (PI * A * Bb);
        const Bn = biotSavart([[-A / 2, -Bb / 2, 0], [A / 2, -Bb / 2, 0], [A / 2, Bb / 2, 0], [-A / 2, Bb / 2, 0], [-A / 2, -Bb / 2, 0]], I, [0, 0, 0])[2];
        if (Math.abs(B - Bn) > 1e-6 * B) throw new Error('rectangle check');
        return {
          prompt: t`A rectangular loop ${a} cm by ${b} cm carries ${I} A. How strong is the magnetic field at its centre?`,
          visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { curves: polygon([[-a / 10, -b / 10], [a / 10, -b / 10], [a / 10, b / 10], [-a / 10, b / 10]].map(([x, y]) => [x * (1.1 / Math.max(a / 10, b / 10 * 2)), y * (1.1 / Math.max(a / 10, b / 10 * 2))]), 'warn'), points: [{ x: 0, y: 0, r: 4, color: 'violet', label: 'centre', labelDx: 8 }] }), caption: t`The ${a} cm × ${b} cm loop, to scale.` },
          answer: B * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: ((2 * Math.SQRT2 * MU0 * I) / (PI * ((A + Bb) / 2))) * 1e6, feedback: 'That is the square formula with an averaged side. Treat the long and short sides separately: they sit at different distances and subtend different angles.' }, { value: (B / 2) * 1e6, feedback: 'Each pair of opposite sides contributes twice — include all four sides.' }],
          hints: [t`Each side is a segment seen from its perpendicular bisector at distance half the other side. For a side of length $\ell$ at distance $h$: $B = \dfrac{\mu_0I}{4\pi h}\cdot\dfrac{\ell}{\sqrt{(\ell/2)^2 + h^2}}$.`, t`All four point the same way; the total simplifies to $\dfrac{2\mu_0I\sqrt{a^2 + b^2}}{\pi ab}$.`],
          teach: 'A loop of straight wires is a sum of segments; at the centre of a rectangle all four add in the same direction.',
          explain: t`$B = \dfrac{2\mu_0I\sqrt{a^2 + b^2}}{\pi ab} \approx ${nice(sf(B * 1e6, 3))}\ \mu\text{T}$ (a numerical Biot–Savart sum agrees). The short sides, though shorter, are farther away and add less.`,
        };
      },
    }),
    mcq({
      id: 'cp-square-circle', difficulty: 2,
      prompt: t`A circular loop and a square loop are bent from wires of the same length and carry the same current. At which centre is the field stronger?`,
      visual: { type: 'graph', params: bare([-2.6, 2.6], [-1.25, 1.25], { curves: [circle(1.0, 'warn', {}, -1.3, 0), ...polygon([[0.515, -0.785], [2.085, -0.785], [2.085, 0.785], [0.515, 0.785]], 'warn')], points: [{ x: -1.3, y: 0, r: 4, color: 'violet' }, { x: 1.3, y: 0, r: 4, color: 'violet' }] }), caption: 'The two loops drawn to scale: the same perimeter.' },
      choices: [t`The square’s, by about 15%: its sides come closer to the centre than the circle’s rim`, t`The circle’s: it is the more efficient shape`, 'They are equal, since the wire length and current are equal', t`The square’s, by a factor of $\sqrt2$`],
      answer: 0,
      why: {
        1: t`The circle maximises the area for a given perimeter (and so the magnetic moment), not the field at the centre.`,
        2: t`The field depends on how far each piece is from the centre and at what angle, not only on the total length.`,
        3: t`Compute it: $\dfrac{2\sqrt2\mu_0I}{\pi a}$ with $a = P/4$ against $\dfrac{\mu_0I}{2R}$ with $R = P/2\pi$ — a ratio of $${nice(sf((8 * Math.SQRT2) / PI / PI, 3))}$.`,
      },
      hints: [t`Same perimeter $P$: square side $a = P/4$, circle radius $R = P/2\pi$.`, t`Compare $\dfrac{2\sqrt2\,\mu_0I}{\pi a}$ with $\dfrac{\mu_0I}{2R}$.`],
      teach: 'The field at a loop’s centre depends on how close its wire runs to the centre: shape matters, not just length.',
      explain: t`Square: $\dfrac{8\sqrt2\,\mu_0I}{\pi P}$; circle: $\dfrac{\pi\mu_0I}{P}$. The ratio is $8\sqrt2/\pi^2 \approx ${nice(sf((8 * Math.SQRT2) / PI / PI, 3))}$. The square’s side midpoints sit at $P/8 = 0.125P$ from the centre, nearer than the circle’s $0.159P$, and the near pieces dominate.`,
    }),
  ],
  sources: [
    { label: 'Griffiths, Introduction to Electrodynamics (4th ed.), §5.2, Example 5.5 and Problem 5.8', url: 'https://www.cambridge.org/highereducation/books/introduction-to-electrodynamics/3AB220820DE2F5CB2A5F8E1E2C27C2EC' },
    { label: 'Sugiura, Hourly values of equatorial Dst (WDC for Geomagnetism, Kyoto)', url: 'https://wdc.kugi.kyoto-u.ac.jp/dstdir/' },
    { label: 'CODATA 2022 recommended values (NIST)', url: 'https://physics.nist.gov/cuu/Constants/' },
  ],
});
