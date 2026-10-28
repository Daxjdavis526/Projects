// Lines, slopes and distance — the slope as rise over run, the equation of a line, and distance as Pythagoras on a grid.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sig, frac } from '../../src/core/format.js';
import { N, lab, thou } from './_m0kit.js';
import { seg, plane, fit, dot, note, ptTeX, ptText } from './_m0geo.js';

const t = String.raw;
const TRIPLES = [[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6], [2, 3], [1, 4], [4, 7]];
// two points with the right triangle under the segment joining them
const triPic = (P, Q, caption, { legs = true, names = ['P', 'Q'], extra = {} } = {}) => {
  const W = fit([P, Q], 1.6);
  const curves = [seg(P, Q, { color: 'accent', width: 2.6 })];
  if (legs) curves.push(seg(P, [Q[0], P[1]], { color: 'accent2', width: 2, dash: true }), seg([Q[0], P[1]], Q, { color: 'warn', width: 2, dash: true }));
  return plane({ ...W, curves, points: [dot(P, `${names[0]}${ptText(P)}`, { labelDx: -10, labelAlign: 'right' }), dot(Q, `${names[1]}${ptText(Q)}`)], caption, extra });
};

export default lesson({
  id: 'm0.M0-9.1',
  title: 'Lines, slopes and distance',
  minutes: 9, difficulty: 1,
  intro: t`Two points $P(x_1, y_1)$ and $Q(x_2, y_2)$ on a grid make a right triangle: a horizontal leg $\Delta x = x_2 - x_1$ (the **run**) and a vertical leg $\Delta y = y_2 - y_1$ (the **rise**). Everything in this lesson is read off that triangle:

$$m = \frac{\Delta y}{\Delta x}, \qquad d = \sqrt{(\Delta x)^2 + (\Delta y)^2}$$

The **slope** $m$ is the rise per unit run; it is the same between any two points of a straight line, which is what makes it a line. The **distance** $d$ is Pythagoras on the grid. A line through $(x_1, y_1)$ with slope $m$ is $y - y_1 = m(x - x_1)$, or $y = mx + b$ with $b$ the height where it crosses the $y$-axis. Lines with slopes $m_1$ and $m_2$ are perpendicular when $m_1 m_2 = -1$.`,
  symbols: [
    { tex: '(x_1, y_1),\\ (x_2, y_2)', text: 'the coordinates of the two points, in whatever unit the axes carry (metres, kilometres, or none)' },
    { tex: '\\Delta x,\\ \\Delta y', text: 'the run and the rise, “change in $x$” and “change in $y$”: end minus start, signs included' },
    { tex: 'm', text: 'the **slope**: rise per unit run; its unit is the $y$-unit per $x$-unit (m/s on a position–time graph). Positive slopes climb to the right' },
    { tex: 'd', text: 'the straight-line **distance** between the points, in the axes’ unit; never negative' },
    { tex: 'b', text: 'the **$y$-intercept**: the value of $y$ where the line crosses $x = 0$' },
  ],
  why: t`Slope is the first rate you meet — on a position–time graph it is a velocity, on a velocity–time graph an acceleration — and it becomes the derivative in calculus. The distance formula grows into the length of a vector, the modulus of a complex number, and finally the spacetime interval of relativity, which is Pythagoras with a minus sign.`,
  visual: {
    type: 'graph',
    title: 'Rise, run and the hypotenuse',
    lead: t`Drag $P$ and $Q$ (they snap to the grid). The dashed legs are the run $\Delta x$ (teal) and the rise $\Delta y$ (orange); the blue segment is the hypotenuse, of length $d$. The faint line runs on through both points.`,
    tasks: [
      t`Put $P$ at $(1, 1)$ and $Q$ at $(4, 5)$: the legs are $3$ and $4$, so $d = 5$ and $m = \tfrac43$.`,
      t`Swap the points (drag $Q$ to $(1, 1)$ and $P$ to $(4, 5)$): $\Delta x$ and $\Delta y$ both change sign, so the slope and the distance stay the same.`,
      t`Make the line fall to the right: the slope turns negative. Make it horizontal: $m = 0$. Make it vertical: $\Delta x = 0$ and the slope is not defined.`,
    ],
    params: {
      x: [-7, 7], y: [-3, 7], equal: true, aspect: 'wide',
      drag: [{ key: 'p', x: -2, y: 0, snap: 1 }, { key: 'q', x: 3, y: 4, snap: 1 }],
      curves: [
        { param: ['px + t*(qx - px)', 'py + t*(qy - py)'], t: [-20, 20], color: 'ink4', width: 1.2 },
        { param: ['px + t*(qx - px)', 'py'], t: [0, 1], color: 'accent2', width: 2.4, dash: true },
        { param: ['qx', 'py + t*(qy - py)'], t: [0, 1], color: 'warn', width: 2.4, dash: true },
        { param: ['px + t*(qx - px)', 'py + t*(qy - py)'], t: [0, 1], color: 'accent', width: 3 },
      ],
      points: [
        { x: '(px + qx)/2', y: 'py', r: 0, label: 'Δx', color: 'accent2', labelAlign: 'center', labelDx: 0, labelDy: 14 },
        { x: 'qx', y: '(py + qy)/2', r: 0, label: 'Δy', color: 'warn', labelDx: 8, labelDy: 0 },
        { x: 'px', y: 'py', r: 0, label: 'P', color: 'ink', labelDx: -16, labelDy: -10 },
        { x: 'qx', y: 'qy', r: 0, label: 'Q', color: 'ink', labelDx: 10, labelDy: -10 },
      ],
      readouts: [
        { label: t`$\Delta x$`, expr: 'qx - px', digits: 3 },
        { label: t`$\Delta y$`, expr: 'qy - py', digits: 3 },
        { label: t`slope $m = \Delta y/\Delta x$`, expr: '(qy - py)/(qx - px)', digits: 3 },
        { label: t`distance $d$`, expr: 'sqrt((qx - px)^2 + (qy - py)^2)', digits: 4 },
      ],
    },
    caption: t`To scale: one grid step is the same length across and up, so the hypotenuse really is $\sqrt{\Delta x^2 + \Delta y^2}$ steps long. When $\Delta x = 0$ the slope readout has no sensible value — a vertical line has no slope.`,
  },
  example: {
    prompt: t`A survey drone takes off from pad $P(-2, 1)$ and flies straight to a marker at $Q(4, 9)$ (coordinates in km, east and north). Find the slope of its track, the equation of the track, its midpoint, and how far it flies.`,
    visual: triPic([-2, 1], [4, 9], t`The track from $P$ to $Q$ with its run (teal, $6$ km) and rise (orange, $8$ km). To scale.`),
    steps: [
      { label: 'Rise and run', text: t`$\Delta x = 4 - (-2) = 6$ km and $\Delta y = 9 - 1 = 8$ km. Always end minus start, in the same order for both.` },
      { label: 'Slope', text: t`$m = \dfrac{8}{6} = \dfrac43$: the drone gains $\tfrac43$ km of northing per km of easting.` },
      { label: 'Equation', text: t`Point–slope form through $P$: $y - 1 = \tfrac43(x + 2)$, which tidies to $y = \tfrac43 x + \tfrac{11}{3}$. Check $Q$: $\tfrac43(4) + \tfrac{11}{3} = \tfrac{27}{3} = 9$ ✓.` },
      { label: 'Midpoint', text: t`Average the coordinates: $\left(\tfrac{-2 + 4}{2},\ \tfrac{1 + 9}{2}\right) = (1, 5)$ — halfway along the track.` },
      { label: 'Distance', text: t`Pythagoras on the legs: $d = \sqrt{6^2 + 8^2} = \sqrt{100} = 10$ km.` },
      { label: 'Sense check', text: t`$d$ is longer than either leg ($8$ km) and shorter than their sum ($14$ km) — a straight line beats going round the corner, but not by more than that.` },
    ],
    answer: t`$m = \tfrac43$, track $y = \tfrac43 x + \tfrac{11}{3}$, midpoint $(1, 5)$, distance $10$ km.`,
  },
  practice: [
    num({
      id: 'distance', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick(TRIPLES), sx = r.sign(), sy = r.sign();
        const P = [r.int(-4, 2), r.int(-3, 2)], Q = [P[0] + sx * a, P[1] + sy * b], ans = Math.hypot(a, b);
        const errors = [
          { value: a + b, feedback: t`You added the legs. The straight line is the hypotenuse: $\sqrt{\Delta x^2 + \Delta y^2}$, always shorter than $|\Delta x| + |\Delta y|$.` },
          { value: a * a + b * b, feedback: t`That is $d^2$. Take the square root.` },
          { value: Math.hypot(P[0] + Q[0], P[1] + Q[1]), feedback: t`You added the coordinates. The legs are the **differences** $x_2 - x_1$ and $y_2 - y_1$.` },
        ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans);
        return {
          prompt: t`How far apart are $P${ptTeX(P)}$ and $Q${ptTeX(Q)}$? Give 3 significant figures if the answer is not whole.`,
          answer: ans, tol: { rel: 0.005 }, errors,
          hints: [t`Find $\Delta x = x_2 - x_1$ and $\Delta y = y_2 - y_1$ — the dashed legs.`, t`$d = \sqrt{(${Q[0] - P[0]})^2 + (${Q[1] - P[1]})^2}$.`],
          teach: t`Distance is the hypotenuse of the triangle whose legs are $\Delta x$ and $\Delta y$; the signs vanish when you square.`,
          explain: t`$\Delta x = ${Q[0] - P[0]}$, $\Delta y = ${Q[1] - P[1]}$, so $d = \sqrt{${a * a} + ${b * b}} = ${sig(ans, 4)}$.`,
          visual: triPic(P, Q, t`The two points and the legs of the right triangle between them. One grid step is one unit both ways.`),
        };
      },
    }),
    num({
      id: 'slope', difficulty: 1,
      gen(r) {
        const dx = r.pick([2, 3, 4, 5]), dy = r.intExcept(-6, 6, [0, dx, -dx]), P = [r.int(-4, 1), r.int(-3, 2)], Q = [P[0] + dx, P[1] + dy];
        const swap = r.bool(0.5), A = swap ? Q : P, B = swap ? P : Q, ans = dy / dx;
        return {
          prompt: t`Find the slope of the line through $${ptTeX(A)}$ and $${ptTeX(B)}$.`,
          answer: ans, tol: { rel: 0.005 },
          errors: [
            { value: dx / dy, feedback: t`Run over rise is upside down: slope is **rise over run**, $\Delta y / \Delta x$.` },
            { value: -ans, feedback: t`Sign slip: take both differences in the same order — $(y_2 - y_1)/(x_2 - x_1)$ — and the sign looks after itself.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01),
          hints: [t`Pick one point as the start. Then $\Delta y = y_{\text{end}} - y_{\text{start}}$ and $\Delta x = x_{\text{end}} - x_{\text{start}}$, in the same order.`],
          teach: t`The slope is $\Delta y / \Delta x$, and it does not matter which point you start from — as long as you use the same one top and bottom.`,
          explain: t`$m = \dfrac{${B[1]} - (${A[1]})}{${B[0]} - (${A[0]})} = \dfrac{${B[1] - A[1]}}{${B[0] - A[0]}} = ${frac(ans)}$. The line ${ans > 0 ? 'climbs' : 'falls'} to the right, as the picture shows.`,
          visual: plane({ ...fit([P, Q], 1.6), curves: [{ fn: `${N(P[1])} + ${N(ans)}*(x - (${P[0]}))`, color: 'accent', width: 2.4 }], points: [dot(A, ptText(A), { labelDx: -8, labelAlign: 'right' }), dot(B, ptText(B))], caption: t`The line through the two points, on a square grid.` }),
        };
      },
    }),
    expr({
      id: 'line-eq', difficulty: 2,
      gen(r) {
        const [mn, md] = r.pick([[2, 1], [-3, 1], [1, 2], [-1, 2], [2, 3], [-3, 4], [3, 2]]), m = mn / md;
        const P = [r.intExcept(-3, 3, [0]), r.intExcept(-3, 3, [0])], mT = frac(m), b = P[1] - m * P[0];
        const end = [P[0] + md, P[1] + mn];
        return {
          prompt: t`Write the equation of the line through $${ptTeX(P)}$ with slope $${mT}$.`,
          answer: `y = ${N(m)}*(x - (${P[0]})) + (${P[1]})`, answerTeX: t`y = ${mT}x ${b < 0 ? '-' : '+'} ${frac(Math.abs(b))}`, mode: 'equation',
          vars: { x: [-5, 5], y: [-5, 5] },
          errors: [
            { answer: `y = ${N(m)}*(x + (${P[0]})) + (${P[1]})`, feedback: t`The shift has the wrong sign: through $(x_1, y_1)$ the line is $y - y_1 = m(x - x_1)$, so $x_1 = ${P[0]}$ enters as $x - (${P[0]})$.` },
            { answer: `y = ${N(m)}*x + (${P[1]})`, feedback: t`That line has the right slope but crosses the $y$-axis at $${P[1]}$; it misses the point $${ptTeX(P)}$. Use $y - y_1 = m(x - x_1)$.` },
          ],
          hints: [t`Point–slope form: $y - y_1 = m(x - x_1)$.`, t`$y - (${P[1]}) = ${mT}\,(x - (${P[0]}))$ — now tidy it up, or type it as it is.`],
          teach: t`A point and a slope fix a line: $y - y_1 = m(x - x_1)$.`,
          explain: t`$y - (${P[1]}) = ${mT}(x - (${P[0]}))$, so $y = ${mT}x ${b < 0 ? '-' : '+'} ${frac(Math.abs(b))}$. Check: at $x = ${P[0]}$ this gives $y = ${P[1]}$ ✓.`,
          visual: plane({ ...fit([P, end], 1.8), curves: [seg(P, [end[0], P[1]], { color: 'accent2', width: 2, dash: true }), seg([end[0], P[1]], end, { color: 'warn', width: 2, dash: true })], points: [dot(P, ptText(P), { labelDx: -8, labelAlign: 'right' }), note([P[0] + md / 2, P[1]], `run ${md}`, { color: 'accent2', labelDy: mn > 0 ? 13 : -13 }), note([end[0], P[1] + mn / 2], `rise ${lab(mn)}`, { color: 'warn', labelAlign: 'left', labelDx: 8 })], caption: t`The point, and one slope triangle from it: run $${md}$, rise $${mn}$.` }),
        };
      },
    }),
    mcq({
      id: 'perp-slope', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[2, 3], [3, 4], [1, 3], [5, 2], [4, 1], [3, 5]]), s = r.sign(), m = (s * a) / b, c = r.intExcept(-3, 3, [0]);
        return {
          prompt: t`A line has equation $y = ${frac(m)}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}$. What is the slope of every line perpendicular to it?`,
          choices: [t`$${frac(-1 / m)}$`, t`$${frac(1 / m)}$`, t`$${frac(-m)}$`, t`$${frac(m)}$`],
          answer: 0,
          why: {
            1: t`You flipped the fraction but kept the sign. Perpendicular slopes multiply to $-1$, so one must be negative when the other is positive.`,
            2: t`Changing the sign alone gives the mirror-image line, at the same angle to the axis — not at right angles.`,
            3: t`That is the same slope: a **parallel** line.`,
          },
          hints: [t`Perpendicular slopes satisfy $m_1 m_2 = -1$.`, t`So $m_2 = -1/m_1$: flip the fraction **and** change its sign.`],
          teach: t`Turning a line through $90^\circ$ swaps rise and run and flips one sign: $m \to -1/m$.`,
          explain: t`$m_2 = -\dfrac{1}{${frac(m)}} = ${frac(-1 / m)}$, and $${frac(m)} \times (${frac(-1 / m)}) = -1$ ✓.`,
          visual: plane({ x: [-6, 6], y: [-4, 4], curves: [{ fn: `${N(m)}*x + ${c}`, color: 'accent', width: 2.4 }], caption: t`The given line on a square grid. A perpendicular meets it at a right angle.` }),
        };
      },
    }),
    num({
      id: 'collinear', difficulty: 3,
      gen(r) {
        const dx = r.pick([2, 3, 4]), dy = r.intExcept(-5, 5, [0]), P = [r.int(-4, -1), r.int(-2, 2)], Q = [P[0] + dx, P[1] + dy];
        const x3 = Q[0] + r.pick([2, 3, 5]), m = dy / dx, ans = P[1] + m * (x3 - P[0]);
        return {
          prompt: t`The point $(${x3},\ k)$ lies on the line through $${ptTeX(P)}$ and $${ptTeX(Q)}$. Find $k$.`,
          answer: ans, tol: { rel: 0.005, abs: 0.01 },
          errors: [
            { value: Q[1] + m * (x3 - P[0]), feedback: t`You stepped from $Q$’s height but measured the run from $P$. Use one point for both: $k = y_1 + m(x_3 - x_1)$.` },
            { value: P[1] + (x3 - P[0]) / m, feedback: t`The slope is upside down: $m = \Delta y/\Delta x = ${frac(m)}$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * Math.max(1, Math.abs(ans))),
          hints: [t`Find the slope first: $m = \dfrac{${Q[1]} - (${P[1]})}{${Q[0]} - (${P[0]})}$.`, t`The same slope must carry you from $P$ to $(${x3}, k)$: $k - (${P[1]}) = m\,(${x3} - (${P[0]}))$.`],
          teach: t`Three points are on one line exactly when the slope between every pair is the same.`,
          explain: t`$m = ${frac(m)}$, so $k = ${P[1]} + ${frac(m)}\times${x3 - P[0]} = ${sig(ans, 4)}$.`,
          visual: plane({ ...fit([P, Q, [x3, ans]], 1.6), curves: [seg(P, Q, { color: 'accent', width: 2.4 })], points: [dot(P, ptText(P), { labelDx: -8, labelAlign: 'right' }), dot(Q, ptText(Q))], extra: { vlines: [{ x: x3, color: 'ink3', label: `x = ${lab(x3)}` }] }, caption: t`The segment between the two given points; the point you want is where the line, extended, crosses the dashed vertical.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rover', difficulty: 2, transfer: true,
      gen(r) {
        const A = [r.int(20, 60) * 10, r.int(-40, 40) * 10], [a, b] = r.pick([[3, 4], [5, 12], [8, 15], [7, 24], [2, 3], [5, 6]]), k = r.pick([20, 30, 40]);
        const B = [A[0] - a * k * r.pick([1, -1]), A[1] + b * k * r.sign()], ans = Math.hypot(B[0] - A[0], B[1] - A[1]);
        return {
          prompt: t`A lunar rover’s map has the lander at the origin, $x$ east and $y$ north, in metres. The rover parks at $(${thou(A[0])},\ ${thou(A[1])})$, then is sent to a crater rim at $(${thou(B[0])},\ ${thou(B[1])})$. How far is the drive in a straight line, in metres?`,
          answer: ans, units: 'm', tol: { rel: 0.005 },
          errors: [
            { value: Math.abs(B[0] - A[0]) + Math.abs(B[1] - A[1]), feedback: t`That is the distance driving east–west and then north–south. The straight line is $\sqrt{\Delta x^2 + \Delta y^2}$.` },
            { value: Math.hypot(B[0], B[1]), feedback: t`That is the rim’s distance from the lander. Measure from the rover’s parking spot: subtract its coordinates first.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\Delta x$ and $\Delta y$ are the differences between the rim’s and the parking spot’s coordinates.`],
          teach: t`On any flat map with equal scales, distance is $\sqrt{\Delta x^2 + \Delta y^2}$.`,
          explain: t`$\Delta x = ${thou(B[0] - A[0])}$ m, $\Delta y = ${thou(B[1] - A[1])}$ m, so $d = ${thou(ans)}$ m. (On the Moon’s scale of a few hundred metres the ground is flat enough for the map to be exact; over tens of kilometres the curvature would matter.)`,
          visual: plane({ ...fit([[0, 0], A, B], 120, 300), xlabel: 'east (m)', ylabel: 'north (m)', points: [dot([0, 0], 'lander', { color: 'ink2' }), dot(A, 'rover', { labelDx: -8, labelAlign: 'right' }), dot(B, 'rim', { color: 'warn' })], caption: t`The rover’s map, to scale (grid in metres).` }),
        };
      },
    }),
    num({
      id: 'cp-sled', difficulty: 2, transfer: true,
      gen(r) {
        const t1 = r.int(1, 3), t2 = t1 + r.int(3, 6), v1 = r.int(2, 8) * 10, a = r.pick([25, 30, 40, 45, 60]), v2 = v1 + a * (t2 - t1);
        return {
          prompt: t`A rocket sled’s speed rises in a straight line on a speed–time graph, from $${v1}$ m/s at $t = ${t1}$ s to $${v2}$ m/s at $t = ${t2}$ s. Its acceleration is the slope of that line. Find it, in $\text{m/s}^2$.`,
          answer: a, units: 'm/s^2', tol: { rel: 0.005 },
          errors: [
            { value: v2 / t2, feedback: t`Speed divided by time at one instant is not the slope: the line does not pass through the origin. Use the changes, $\Delta v / \Delta t$.` },
            { value: (t2 - t1) / (v2 - v1), feedback: t`Rise over run: the rise is the change in speed, the run the change in time.` },
          ],
          hints: [t`Slope $= \dfrac{\Delta v}{\Delta t}$ between the two marked points.`],
          teach: t`The slope of a graph carries units: (units up) per (unit across) — here (m/s) per s.`,
          explain: t`$a = \dfrac{${v2} - ${v1}}{${t2} - ${t1}} = \dfrac{${v2 - v1}}{${t2 - t1}} = ${a}\ \text{m/s}^2$ — about $${sig(a / 9.81, 2)}g$.`,
          visual: { type: 'graph', params: { x: [0, t2 + 2], y: [0, v2 * 1.2], aspect: 'wide', xlabel: 't (s)', ylabel: 'v (m/s)', curves: [{ fn: `${v1} + ${a}*(x - ${t1})`, domain: [t1 - 0.6, t2 + 0.6], color: 'accent', width: 2.6 }], points: [dot([t1, v1], `(${t1} s, ${v1} m/s)`, { labelDx: 8, labelDy: 14 }), dot([t2, v2], `(${t2} s, ${v2} m/s)`, { labelDx: -8, labelAlign: 'right' })] }, caption: t`The sled’s speed against time: a straight line between the two readings.` },
        };
      },
    }),
    mcq({
      id: 'cp-perp', difficulty: 2,
      prompt: t`Which line is perpendicular to $y = \tfrac23 x + 1$?`,
      choices: [t`$y = -\tfrac32 x + 4$`, t`$y = \tfrac32 x - 1$`, t`$y = -\tfrac23 x + 2$`, t`$y = \tfrac23 x - 5$`],
      answer: 0,
      why: {
        1: t`Flipping the fraction is half the job: $\tfrac23 \times \tfrac32 = +1$, not $-1$.`,
        2: t`Changing the sign alone mirrors the line; $\tfrac23 \times (-\tfrac23) = -\tfrac49$, not $-1$.`,
        3: t`Same slope, different intercept: that line is parallel.`,
      },
      hints: [t`Multiply each slope by $\tfrac23$; perpendicular needs the product $-1$.`],
      teach: t`Perpendicular lines have $m_1 m_2 = -1$; the intercepts do not matter.`,
      explain: t`$\tfrac23 \times (-\tfrac32) = -1$ ✓. The intercept $4$ only slides the line; it does not turn it.`,
      visual: plane({ x: [-6, 6], y: [-4, 4], curves: [{ fn: '2/3*x + 1', color: 'accent', width: 2.4, label: 'y = ⅔x + 1', labelAt: -4.5, labelDy: 14 }], caption: t`The given line on a square grid.` }),
    }),
  ],
  sources: [
    { label: 'OpenStax College Algebra 2e, §2.1 The Rectangular Coordinate Systems and Graphs (distance and midpoint)', url: 'https://openstax.org/books/college-algebra-2e/pages/2-1-the-rectangular-coordinate-systems-and-graphs' },
    { label: 'OpenStax Precalculus 2e, §2.1 Linear Functions', url: 'https://openstax.org/books/precalculus-2e/pages/2-1-linear-functions' },
  ],
});
