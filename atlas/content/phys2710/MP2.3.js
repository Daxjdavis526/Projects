// Lorentz transformations — derived from length contraction and the
// symmetry between frames (phys2220.R1.3 used the rule; gr.S02.d derives it
// as a matrix from linearity — this is a third route), then applied to pairs
// of events: time order, the relativity of simultaneity as "leading clocks
// lag", and which separations can have their order reversed. Units with
// c = 1 where stated (seconds and light-seconds, years and light-years).
// Every number is computed here.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, MPC2 } from './_constants.js';
import { seg, label, frame, minkowski, r6 } from './_diagrams.js';

const t = String.raw;
const g = (b) => 1 / Math.sqrt(1 - b * b);
const GT = { 0.6: '1.25', 0.8: t`\tfrac53`, 0.5: '1.155' };
const MOON = 384400e3 / C;                       // light-seconds
const CU = C / 1e6;                              // m per μs
const LHC_G = 6.8e6 / MPC2, IP = 26659 / Math.PI; // ATLAS and CMS sit across the ring's diameter, m

/** A Lorentz grid: the lines of constant x′ and t′ of a frame moving at b, over your axes (c = 1). */
function grid(b, events = [], caption, { span = b < 0 ? [-7, 3] : [-3, 7], top = 8, ks = [-2, -1, 0, 1, 2, 3, 4, 5, 6], names = ['t′ axis', 'x′ axis'], axes = ['x (light-seconds)', 't (s)'] } = {}) {
  const G = g(b), curves = [];
  for (const k of ks) {
    curves.push({ param: [`t`, `${r6(b)}*t + ${r6(k / G)}`], t: [span[0] - 2, span[1] + 2], color: 'gold', width: k === 0 ? 2 : 0.9, dash: k !== 0 });
    curves.push({ param: [`${r6(b)}*t + ${r6(k / G)}`, `t`], t: [-2, top + 2], color: 'gold', width: k === 0 ? 2 : 0.9, dash: k !== 0 });
  }
  return minkowski({
    x: span, t: [-1, top], xlabel: axes[0], ylabel: axes[1], cones: [[0, 0, 'future']],
    events, extra: { curves, points: [label(b * (top - 0.6), top - 0.6, names[0], 'gold', b < 0 ? -8 : 8, 0, b < 0 ? 'right' : undefined), b < 0 ? label(span[0] + 0.5, b * (span[0] + 0.5), names[1], 'gold', 4, -12, 'left') : label(span[1] - 0.5, b * (span[1] - 0.5), names[1], 'gold', -4, -12, 'right')] },
    caption: caption ?? `Your frame S with c = 1 (seconds up, light-seconds across); light runs along the dashed 45° lines. Gold: the grid of a frame S′ moving at ${b}c — lines of constant t′ (shallow) and constant x′ (steep), one unit apart.`,
  });
}

export default lesson({
  id: 'phys2710.MP2.3',
  title: 'Lorentz transformations',
  minutes: 14, difficulty: 3,
  intro: t`Time dilation, length contraction and the relativity of simultaneity are three faces of one rule for translating an event’s coordinates between frames. With $S'$ moving at $v$ along the $x$ axis of $S$, and the origins together at $t = t' = 0$:

$$x' = \gamma\,(x - vt), \qquad t' = \gamma\left(t - \frac{vx}{c^2}\right), \qquad y' = y, \quad z' = z$$

The inverse is the same rule with the primes swapped and $v \to -v$. You can build it in four lines from length contraction and the symmetry between the two frames (the worked example). Applied to the *differences* between two events, $\Delta x' = \gamma(\Delta x - v\Delta t)$ and $\Delta t' = \gamma(\Delta t - v\Delta x/c^2)$, it settles who says which event came first — and shows that only events no signal could connect can trade places.

> You used this rule in [The Lorentz transformation](#/lesson/phys2220.R1.3) and met a matrix derivation in [Lorentz transformations and invariance, reviewed](#/lesson/gr.S02.d). Here it is assembled from the effects you derived in the last lesson.`,
  symbols: [
    { tex: 'x,\\ t', text: 'an event’s position and time in frame $S$, in m and s' },
    { tex: "x',\\ t'", text: t`the same event’s position and time in $S'$, which moves at $v$ in the $+x$ direction of $S$` },
    { tex: 'v', text: t`the velocity of $S'$ relative to $S$ (negative if $S'$ moves toward $-x$), in m/s` },
    { tex: '\\gamma', text: t`$1/\sqrt{1 - v^2/c^2}$: 1.25 at $0.6c$, $\tfrac53$ at $0.8c$` },
    { tex: 'c', text: t`the speed of light; with $c = 1$, times in seconds go with distances in light-seconds` },
    { tex: "\\Delta x,\\ \\Delta t", text: 'the separations between two events in one frame; they transform by the same rule, because it is linear' },
  ],
  why: 'Every relativistic formula still to come — velocity addition, the Doppler shift, how energy and momentum change between frames — is this transformation applied to something, and causality in relativity rests on its sign rules.',
  visual: {
    type: 'graph',
    title: 'Your coordinates and a moving frame’s, on one diagram',
    lead: t`Your frame’s grid is the plain one, with $c = 1$: seconds up, light-seconds across. The gold grid belongs to $S'$, moving at the slider’s $\beta = v/c$: its shallow lines are lines of constant $t'$, its steep ones lines of constant $x'$. Drag the event P and read its coordinates in both frames.`,
    tasks: [
      'At β = 0.6, drag P to (x, t) = (3, 5): it sits on the gold lines x′ = 0 and t′ = 4 — it happens where the moving observer is, 4 s after the origins met.',
      'Slide β: the gold grid shears toward the light cone and its spacing stretches, yet t² − x² never changes for P.',
      'Drag P outside the light cone, to (4, 1): for any β above 0.25 its t′ is negative — before the origins met, for S′.',
    ],
    params: {
      x: [-3, 7], y: [-1, 8], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x (light-seconds)', ylabel: 't (s)',
      sliders: [{ key: 'b', label: 'Velocity of $S\'$, $\\beta = v/c$', min: -0.9, max: 0.9, step: 0.01, value: 0.6, unit: '', explain: 'Positive: $S\'$ moves toward $+x$. Its $t\'$ axis is its own worldline, $x = \\beta t$.' }],
      curves: [
        { fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 },
        ...[-2, -1, 1, 2, 3, 4, 5, 6].flatMap((k) => [
          { param: ['t', `b*t + ${k}*sqrt(1 - b^2)`], t: [-6, 10], color: 'gold', width: 0.9, dash: true },
          { param: [`b*t + ${k}*sqrt(1 - b^2)`, 't'], t: [-3, 10], color: 'gold', width: 0.9, dash: true },
        ]),
        { param: ['t', 'b*t'], t: [-6, 10], color: 'gold', width: 2.2 }, { param: ['b*t', 't'], t: [-3, 10], color: 'gold', width: 2.2 },
      ],
      drag: [{ key: 'p', x: 3, y: 5, snap: 0.05 }],
      readouts: [
        { label: t`$x'$ (light-s)`, expr: '(px - b*py)/sqrt(1 - b^2)', digits: 3 },
        { label: t`$t'$ (s)`, expr: '(py - b*px)/sqrt(1 - b^2)', digits: 3 },
        { label: t`$\gamma$`, expr: '1/sqrt(1 - b^2)', digits: 4 },
        { label: t`$t^2 - x^2$`, expr: 'py^2 - px^2', digits: 4 },
        { label: t`$t'^2 - x'^2$`, expr: '((py - b*px)^2 - (px - b*py)^2)/(1 - b^2)', digits: 4 },
      ],
    },
    caption: t`Units with $c = 1$: light runs at 45° (dashed). The gold grid lines are one second and one light-second of $S'$ apart. The last two readouts are the same quantity computed in each frame — the spacetime interval, lesson MP2.4.`,
  },
  example: {
    prompt: t`Derive the Lorentz transformation from three facts: the origin of $S'$ moves along $x = vt$; a length at rest in $S'$ is contracted by $\gamma$ in $S$ (lesson MP2.2); and the two frames are equivalent (first postulate), so $S$ moves at $-v$ as seen from $S'$.`,
    visual: minkowski({
      x: [-1, 7], t: [-0.5, 6.5], xlabel: 'x (frame S)', ylabel: 't (frame S)', aspect: 'wide', boosted: { beta: 0.6 }, cones: [[0, 0, 'future']],
      lines: [{ pts: [[2.2 - 0.6 * 0.4, -0.4], [2.2 + 0.6 * 6.2, 6.2]], color: 'violet', width: 2.6 }],
      events: [[2.2 + 0.6 * 4, 4, 'event at fixed x′', 'violet', 10, 10]],
      extra: { arrows: [{ from: [0.6 * 4, 4], to: [2.2 + 0.6 * 4, 4], color: 'accent', width: 2, label: 'x′/γ', labelDx: -40, labelDy: -12 }], points: [label(2.2 + 0.6 * 5.6, 5.6, 'a point at rest in S′', 'violet', 10, 0)] },
      caption: 'Frame S with c = 1; gold: the axes of S′ at 0.6c. A point at rest in S′ (violet) stays a distance x′/γ ahead of the moving origin, measured in S at one moment of S. Not to scale.',
    }),
    steps: [
      { label: 'Follow a point of S′', text: t`Take a point at rest in $S'$ at $x'$. Its distance from the origin of $S'$ is a proper length $x'$, so in $S$ — where it moves — it is contracted to $x'/\gamma$. At time $t$ the origin of $S'$ is at $vt$, so the point is at $x = vt + x'/\gamma$.` },
      { label: 'Solve for x′', text: t`$x' = \gamma\,(x - vt)$ — the first half of the transformation.` },
      { label: 'Use the symmetry', text: t`From $S'$, frame $S$ moves at $-v$, and the same argument run backwards gives $x = \gamma\,(x' + vt')$.` },
      { label: 'Solve for t′', text: t`From the symmetric equation, $vt' = \dfrac{x}{\gamma} - x'$. Substitute $x' = \gamma(x - vt)$: $vt' = \dfrac{x}{\gamma} - \gamma(x - vt) = \gamma vt - \gamma x\left(1 - \dfrac{1}{\gamma^2}\right)$. Since $1 - 1/\gamma^2 = v^2/c^2$, dividing by $v$ gives $t' = \gamma\left(t - \dfrac{vx}{c^2}\right)$.` },
      { label: 'Check with light', text: t`A flash from the origin runs along $x = ct$. Then $x' = \gamma(c - v)t$ and $t' = \gamma(1 - v/c)t$, so $x'/t' = c$: light moves at $c$ in $S'$ too — the second postulate, built in.` },
      { label: 'Sense check', text: t`When $v \ll c$, $\gamma \to 1$ and $vx/c^2 \to 0$: Galileo’s $x' = x - vt$, $t' = t$. The only new ingredient is the term $vx/c^2$ — the relativity of simultaneity — and it is tiny at everyday speeds and distances.` },
    ],
    answer: t`$x' = \gamma(x - vt)$ and $t' = \gamma(t - vx/c^2)$, with the inverse $x = \gamma(x' + vt')$, $t = \gamma(t' + vx'/c^2)$.`,
  },
  practice: [
    order({
      id: 'derive-order', difficulty: 2,
      prompt: 'Put the steps of the derivation in order.',
      visual: grid(0.6, [], 'Your frame S with c = 1, and in gold the grid of S′ at 0.6c that the derivation produces.'),
      items: [
        t`A point at rest in $S'$ at $x'$ is a proper length $x'$ from the origin of $S'$.`,
        t`In $S$ that length is contracted, and the origin of $S'$ sits at $vt$: $x = vt + x'/\gamma$, so $x' = \gamma(x - vt)$.`,
        t`By symmetry, $S$ moves at $-v$ relative to $S'$: $x = \gamma(x' + vt')$.`,
        t`Eliminate $x'$ between the two and use $1 - 1/\gamma^2 = v^2/c^2$: $t' = \gamma(t - vx/c^2)$.`,
      ],
      hints: ['Start from a single point of the moving frame; end with the time equation.', 'The time equation needs both space equations.'],
      teach: 'The Lorentz transformation follows from length contraction, the moving origin, and the equivalence of the two frames.',
      explain: 'Contraction plus the moving origin gives x′ = γ(x − vt); the equivalence of frames gives the inverse with −v; eliminating x′ between them forces t′ = γ(t − vx/c²). The second postulate entered through length contraction, which came from light clocks.',
    }),
    num({
      id: 'moon-flash', difficulty: 2,
      gen(r) {
        const [b, tt] = r.pick([[0.6, 1], [0.6, 2], [0.6, 3], [0.8, 2], [0.8, 3]]);
        const tp = g(b) * (tt - b * MOON), xp = g(b) * (MOON - b * tt);
        return {
          prompt: t`A starship passes Earth at $${b}c$ ($\gamma = ${GT[b]}$), heading for the Moon, ${fmt(MOON, 4)} light-seconds away; the ship’s clocks and Earth’s read 0 as it passes. A lamp on the Moon flashes ${tt} s later on Earth–Moon clocks. When does the flash happen in the ship’s frame? Answer in seconds (negative if before the ship passed Earth).`,
          answer: tp, units: 's', tol: { rel: 0.01, abs: 0.003 },
          errors: [{ value: tt, feedback: t`That is Galileo’s $t' = t$. Use $t' = \gamma(t - vx/c^2)$.` }, { value: g(b) * (tt + b * MOON), feedback: t`Check the sign: the ship moves toward $+x$, where the Moon is, so $t' = \gamma(t - vx/c^2)$.` }],
          hints: [t`With $c = 1$: $t' = \gamma\,(t - \beta x)$, with $x = ${fmt(MOON, 4)}$ light-seconds.`, t`$t' = ${GT[b]}\times(${tt} - ${b}\times${fmt(MOON, 4)})$.`],
          teach: 't′ = γ(t − vx/c²): events far ahead along the motion happen later for you than for the moving frame.',
          explain: t`$t' = ${GT[b]}\times(${tt} - ${fmt(b * MOON, 4)}) = ${fmt(tp, 3)}$ s, and $x' = \gamma(x - \beta t) = ${fmt(xp, 3)}$ light-seconds${xp < 0 ? ' — behind the ship, which has already passed the Moon by then' : ' — still ahead of the ship'}.`,
          visual: grid(b, [[MOON, tt, 'flash on the Moon', 'accent2', 10, 0]], `Earth–Moon frame with c = 1 (seconds and light-seconds), and the ship’s grid in gold.`, { span: [-1.5, 3.5], top: 4 }),
        };
      },
    }),
    num({
      id: 'inverse', difficulty: 2,
      gen(r) {
        const b = r.pick([0.6, 0.8]), [xp, tp] = r.pick([[600, 4], [300, 2.5], [900, 1.5]]);
        const tt = g(b) * (tp + (b * xp) / CU);
        return {
          prompt: t`A ship moves at $${b}c$ ($\gamma = ${GT[b]}$) past a station; their origins meet at $t = t' = 0$. A beacon on the ship’s bow, ${xp} m ahead of the ship’s origin, flashes at $t' = ${tp}\ \mu\text{s}$ on the ship’s clocks. At what time does the station’s frame say the flash happened? (Take $c = 299.79$ m/μs.)`,
          answer: tt, units: 'μs', tol: { rel: 0.01 },
          errors: [{ value: g(b) * (tp - (b * xp) / CU), feedback: t`The inverse transformation flips the sign of $v$: $t = \gamma(t' + vx'/c^2)$.` }, { value: tp / g(b), feedback: t`Use the full inverse transformation, $t = \gamma(t' + vx'/c^2)$; the beacon is not at the ship’s origin.` }],
          hints: [t`Inverse transformation: $t = \gamma\left(t' + \dfrac{vx'}{c^2}\right)$.`, t`$\dfrac{vx'}{c^2} = ${b}\times\dfrac{${xp}\ \text{m}}{299.79\ \text{m/μs}} = ${fmt((b * xp) / CU, 4)}\ \mu\text{s}$.`],
          teach: 'The inverse Lorentz transformation is the same rule with the primes swapped and v replaced by −v.',
          explain: t`$t = ${GT[b]}\times(${tp} + ${fmt((b * xp) / CU, 4)}) = ${fmt(tt, 4)}\ \mu\text{s}$. The bow is ahead along the motion, so in the station’s frame its clock lags the ship’s origin clock by $vx'/c^2$: “leading clocks lag”.`,
          visual: {
            type: 'graph',
            params: frame([-0.5, 9.5], [-1.2, 1.6], {
              aspect: 'wide',
              curves: [seg(1, -0.4, 6.4, -0.4, 'accent', 2.2), seg(1, 0.4, 6.4, 0.4, 'accent', 2.2), seg(1, -0.4, 1, 0.4, 'accent', 2.2), seg(6.4, -0.4, 7.4, 0, 'accent', 2.2), seg(6.4, 0.4, 7.4, 0, 'accent', 2.2)],
              points: [{ x: 1.3, y: 0, r: 5, color: 'ink2', label: 'ship’s origin', labelDx: 8, labelDy: 0 }, { x: 7.3, y: 0, r: 6, color: 'gold', label: 'bow beacon', labelDx: 0, labelDy: -18, labelAlign: 'center' }],
              arrows: [{ from: [3, 1.2], to: [5, 1.2], color: 'violet', width: 2, label: `${b}c`, labelDx: 8, labelDy: 0 }],
            }),
            caption: 'The ship in its own frame, with the beacon on its bow. Not to scale.',
          },
        };
      },
    }),
    num({
      id: 'pulsar-order', difficulty: 3,
      gen(r) {
        const [dx, dt] = r.pick([[8, 3], [10, 4], [6, 2]]), b = r.pick([0.6, 0.8]);
        const dtp = g(b) * (dt - b * dx);
        return {
          prompt: t`In the Galaxy’s frame, pulsar P glitches, and ${dt} years later pulsar Q, ${dx} light-years away, glitches too. A ship flies from P toward Q at $${b}c$. In the ship’s frame, how long after P’s glitch does Q’s happen? Answer in years (negative if Q’s comes first).`,
          answer: dtp, units: 'yr', tol: { rel: 0.01 },
          errors: [{ value: g(b) * (dt + b * dx), feedback: t`The ship moves toward Q, along $+x$: $\Delta t' = \gamma(\Delta t - \beta\,\Delta x)$, with a minus sign.` }, { value: dt - b * dx, feedback: t`Include the factor $\gamma = ${GT[b]}$.` }],
          hints: [t`With $c = 1$ (years and light-years): $\Delta t' = \gamma(\Delta t - \beta\,\Delta x)$.`, t`$\Delta t' = ${GT[b]}\times(${dt} - ${b}\times${dx})$.`],
          teach: 'Two events farther apart in space than light could cross in the time between them can occur in either order, depending on the observer.',
          explain: t`$\Delta t' = ${GT[b]}\times(${dt} - ${fmt(b * dx, 3)}) = ${fmt(dtp, 3)}$ years: in the ship’s frame Q glitches **first**. No contradiction: light from P needs ${dx} years to reach Q, more than the ${dt} years between the glitches, so neither could have caused the other, and their order is not fixed.`,
          visual: minkowski({ x: [-1, dx + 1.5], t: [-0.8, Math.max(dx, 6)], events: [[0, 0, 'P glitches', 'accent2', 10, 12], [dx, dt, 'Q glitches', 'accent2', -10, -10, 'right']], cones: [[0, 0, 'future']], simul: [{ at: [0, 0], beta: b, color: 'violet', label: '“now” for the ship' }], caption: 'The Galaxy’s frame, years up and light-years across (c = 1). Dashed orange: P’s light cone. Dashed violet: the ship’s line of simultaneity through P’s glitch.' }),
        };
      },
    }),
    expr({
      id: 'dilation-from-lt', difficulty: 2,
      prompt: t`A clock sits at the origin of $S'$, so in $S$ it moves along $x = vt$. Using $t' = \gamma\left(t - \dfrac{vx}{c^2}\right)$, find the reading $t'$ of that clock at your time $t$, in terms of $t$, $v$ and $c$.`,
      answer: 't*sqrt(1 - v^2/c^2)', answerTeX: t`t\sqrt{1 - v^2/c^2}`, lhs: "t'",
      vars: { t: [0.5, 3], v: [0.1, 1.5], c: [2, 4] },
      errors: [{ answer: 't/sqrt(1 - v^2/c^2)', feedback: t`That would make the moving clock run fast. Substitute $x = vt$: $t' = \gamma t(1 - v^2/c^2) = t/\gamma$.` }, { answer: 't', feedback: 'That is Galileo’s answer; with x = vt the second term does not vanish.' }],
      hints: [t`Put $x = vt$: $t' = \gamma\left(t - \dfrac{v^2t}{c^2}\right) = \gamma t\left(1 - \dfrac{v^2}{c^2}\right)$.`, t`$\gamma\,(1 - v^2/c^2) = \sqrt{1 - v^2/c^2} = 1/\gamma$.`],
      teach: 'Time dilation is the Lorentz transformation applied to a clock’s own worldline: t′ = t/γ.',
      explain: t`$t' = \gamma t\left(1 - \dfrac{v^2}{c^2}\right) = t\sqrt{1 - v^2/c^2} = \dfrac{t}{\gamma}$: the moving clock shows less time than yours — time dilation, now a consequence of the transformation rather than of a light clock.`,
      visual: grid(0.6, [], 'Your frame with c = 1; gold: the grid of S′ at 0.6c. The clock at the origin of S′ moves up the thick gold t′ axis, crossing the lines t′ = 1, 2, 3… further apart than your seconds.'),
    }),
    num({
      id: 'leading-lag', difficulty: 2,
      gen(r) {
        const L = r.pick([150, 300, 450]), b = r.pick([0.6, 0.8]);
        const lag = (L * b) / C * 1e9;
        return {
          prompt: t`A ship ${L} m long (its proper length) has synchronized clocks at its tail and its nose, in its own frame. It passes a station at $${b}c$. In the station’s frame, by how many nanoseconds does the nose clock lag behind the tail clock?`,
          answer: lag, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: lag / g(b), feedback: t`Use the proper length $L_0$: from $t = \gamma(t' + vx'/c^2)$ at one station time, the offset is $vL_0/c^2$, with no extra $\gamma$.` }, { value: (L / C) * 1e9, feedback: t`That is $L_0/c$, the light-travel time along the ship. The offset is smaller by the factor $v/c$.` }],
          hints: [t`At one station time $t$, the inverse transformation gives $t' = t/\gamma - vx'/c^2$, so ship clocks at different $x'$ differ by $v\,\Delta x'/c^2$.`, t`$\dfrac{vL_0}{c^2} = ${b}\times\dfrac{${L}\ \text{m}}{2.998\times10^{8}\ \text{m/s}}$.`],
          teach: 'Leading clocks lag: clocks synchronized in a moving ship read behind toward its nose by vL₀/c² in the station’s frame.',
          explain: t`From $t' = \gamma(t - vx/c^2)$ at one instant $t$ of the station, the two clocks differ by $\gamma v\,\Delta x/c^2 = vL_0/c^2$, since $\Delta x = L_0/\gamma$. That is $${b}\times${fmt((L / C) * 1e9, 4)}\ \text{ns} = ${fmt(lag, 4)}$ ns, with the nose clock behind. This is the relativity of simultaneity in its most practical form.`,
          visual: {
            type: 'graph',
            params: frame([-0.6, 9.6], [-1.3, 1.5], {
              aspect: 'wide',
              curves: [seg(1, -0.45, 7, -0.45, 'accent', 2.2), seg(1, 0.45, 7, 0.45, 'accent', 2.2), seg(1, -0.45, 1, 0.45, 'accent', 2.2), seg(7, -0.45, 8.1, 0, 'accent', 2.2), seg(7, 0.45, 8.1, 0, 'accent', 2.2)],
              points: [{ x: 1.6, y: 0, r: 9, color: 'gold', label: 'tail clock', labelDx: 0, labelDy: 22, labelAlign: 'center' }, { x: 7.2, y: 0, r: 9, color: 'gold', label: 'nose clock', labelDx: 0, labelDy: 22, labelAlign: 'center' }],
              arrows: [{ from: [3.6, 1.15], to: [5.4, 1.15], color: 'violet', width: 2, label: `${b}c`, labelDx: 8, labelDy: 0 }],
            }),
            caption: 'The ship with a clock at each end, synchronized in its own frame. Not to scale.',
          },
        };
      },
    }),
    mcq({
      id: 'inverse-form', difficulty: 2,
      prompt: t`Given $x' = \gamma(x - vt)$ and $t' = \gamma(t - vx/c^2)$, which expression gives $x$ in terms of the primed coordinates?`,
      visual: grid(-0.6, [], 'Seen from S′, your frame S moves at −0.6c: drawn in S′’s coordinates (c = 1), your grid is the gold one, leaning the other way.', { names: ['your t axis', 'your x axis'], axes: ['x′ (light-seconds)', 't′ (s)'] }),
      choices: [t`$x = \gamma(x' + vt')$`, t`$x = \gamma(x' - vt')$`, t`$x = x'/\gamma + vt'$`, t`$x = (x' + vt')/\gamma$`],
      answer: 0,
      why: {
        1: t`That keeps the sign of $v$. Seen from $S'$, frame $S$ moves toward $-x$, so the inverse has $+v$.`,
        2: t`Mixing Galileo’s $+vt'$ with a contraction is not the inverse; solve the two equations, or use symmetry with $v \to -v$.`,
        3: t`Dividing by $\gamma$ instead of multiplying would make the transformation followed by its inverse shrink every coordinate by $\gamma^2$.`,
      },
      hints: ['The two frames are equivalent: what is the velocity of S as seen from S′?'],
      teach: 'The inverse Lorentz transformation has the same form with v replaced by −v.',
      explain: t`By symmetry $S$ moves at $-v$ relative to $S'$, so $x = \gamma(x' + vt')$ and $t = \gamma(t' + vx'/c^2)$. Check: substituting $x'$ and $t'$ gives $\gamma^2(x - vt + vt - v^2x/c^2) = \gamma^2 x(1 - v^2/c^2) = x$ ✓.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-transform', difficulty: 2,
      gen(r) {
        const b = r.pick([0.6, 0.8]), [x, tt] = r.pick([[3, 2], [5, 2], [2, 4], [4, 1]]);
        const xp = g(b) * (x - b * tt);
        return {
          prompt: t`With $c = 1$, an event happens at $x = ${x}$ light-seconds and $t = ${tt}$ s in your frame. Frame $S'$ moves at $${b}c$ along $+x$ ($\gamma = ${GT[b]}$), origins together at $t = t' = 0$. Where does the event happen in $S'$? Answer in light-seconds.`,
          answer: xp, tol: { rel: 0.01, abs: 0.002 },
          hints: [t`$x' = \gamma(x - \beta t)$ with $c = 1$.`],
          teach: 'x′ = γ(x − vt): the moving frame measures positions from its own, moving origin, and stretched by γ.',
          explain: t`$x' = ${GT[b]}\times(${x} - ${b}\times${tt}) = ${fmt(xp, 3)}$ light-seconds. For completeness, $t' = \gamma(t - \beta x) = ${fmt(g(b) * (tt - b * x), 3)}$ s.`,
          visual: grid(b, [[x, tt, 'the event', 'accent2', 10, 0]], `Your frame with c = 1, and the grid of S′ at ${b}c in gold.`),
        };
      },
    }),
    num({
      id: 'cp-lhc', difficulty: 3, transfer: true,
      prompt: t`The ATLAS and CMS detectors sit on opposite sides of CERN’s 26.659 km ring, ${fmt(IP, 4)} m apart across its diameter. Proton bunches collide in both at the same moment of the laboratory frame. An observer moves from ATLAS toward CMS with an LHC proton’s speed, $\gamma = ${fmt(LHC_G, 4)}$. In that observer’s frame, how many seconds before the ATLAS collision does the CMS collision happen?`,
      answer: (LHC_G * Math.sqrt(1 - 1 / LHC_G ** 2) * IP) / C, units: 's', tol: { rel: 0.01 },
      errors: [{ value: IP / C, feedback: t`That is the light-travel time. The shift is $\gamma\,v\,\Delta x/c^2$ — with $v \approx c$, that is $\gamma$ times larger.` }],
      hints: [t`$\Delta t' = \gamma\left(\Delta t - \dfrac{v\,\Delta x}{c^2}\right)$ with $\Delta t = 0$.`, t`$v \approx c$, so $|\Delta t'| \approx \gamma\,\Delta x/c = ${fmt(LHC_G, 4)}\times\dfrac{${fmt(IP, 4)}\ \text{m}}{2.998\times10^{8}\ \text{m/s}}$.`],
      teach: 'At γ in the thousands, the relativity of simultaneity turns a few kilometres into a sizeable fraction of a second.',
      explain: t`$|\Delta t'| = \gamma\beta\,\dfrac{\Delta x}{c} = ${fmt(LHC_G, 4)}\times${fmt((IP / C) * 1e6, 4)}\ \mu\text{s} = ${fmt((LHC_G * Math.sqrt(1 - 1 / LHC_G ** 2) * IP) / C, 3)}$ s. The CMS collision, ahead along the motion, comes first. (A real proton circles the ring, so its frame is not inertial; the observer here keeps a straight path at the same speed.)`,
      visual: {
        type: 'graph',
        params: frame([-1.6, 1.6], [-1.25, 1.25], {
          aspect: 'wide',
          curves: [{ polar: '1', theta: [0, 6.2832], color: 'accent', width: 2.2 }, seg(-1, 0, 1, 0, 'ink3', 1.2, true)],
          points: [{ x: -1, y: 0, r: 7, color: 'gold', label: 'ATLAS', labelDx: -10, labelDy: 0, labelAlign: 'right' }, { x: 1, y: 0, r: 7, color: 'gold', label: 'CMS', labelDx: 10, labelDy: 0 }],
          arrows: [{ from: [-0.6, 0.25], to: [0.4, 0.25], color: 'violet', width: 2, label: 'observer at γ = 7247', labelDx: -90, labelDy: -14 }],
        }),
        caption: 'The LHC ring, schematic, with ATLAS and CMS on opposite sides and an observer moving along the diameter between them.',
      },
    }),
    mcq({
      id: 'cp-which-flip', difficulty: 2,
      prompt: t`Event R happens 5 years after event P and 3 light-years from it, in some frame. Event Q happens 3 years after P and 5 light-years from it. Which of these can a fast enough observer find happening **before** P?`,
      visual: minkowski({ x: [-1.5, 6.5], t: [-0.8, 6.2], events: [[0, 0, 'P', 'accent2', -10, 12, 'right']], cones: [[0, 0, 'future']], caption: 'Event P with its future light cone (dashed); years up, light-years across (c = 1). Place R and Q yourself.' }),
      choices: ['Q only', 'R only', 'Both', 'Neither: the order of events is the same for everyone'],
      answer: 0,
      why: {
        1: t`R is inside P’s light cone ($3 < 5$): a signal from P could reach it, and every observer agrees P comes first.`,
        2: 'R lies inside P’s future light cone, so its order is fixed. Only Q, outside the cone, can trade places.',
        3: t`Order is absolute only for events a signal could connect. For Q, $\Delta x = 5$ ly exceeds $c\,\Delta t = 3$ ly, so an observer moving faster than $0.6c$ toward Q sees Q first.`,
      },
      hints: ['Compare each event’s distance from P with how far light travels in the time between them.', t`$\Delta t' = \gamma(\Delta t - \beta\,\Delta x)$ can turn negative only if $\Delta x > c\,\Delta t$.`],
      teach: 'Only spacelike-separated events can have their time order reversed; for timelike or lightlike pairs every observer agrees on the order.',
      explain: t`For Q, $\Delta t' = \gamma(3 - 5\beta) < 0$ when $\beta > 0.6$. For R, $\Delta t' = \gamma(5 - 3\beta) > 0$ for every $\beta < 1$. Causality survives: only events no signal could connect have no fixed order.`,
    }),
  ],
  sources: [
    { label: 'Einstein (1905), On the electrodynamics of moving bodies (English translation)', url: 'https://www.fourmilab.ch/etexts/einstein/specrel/www/' },
    { label: 'OpenStax University Physics Vol. 3, §5.5 The Lorentz transformation', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-5-the-lorentz-transformation' },
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 3 and L', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'CERN: the Large Hadron Collider (26.659 km circumference)', url: 'https://home.cern/science/accelerators/large-hadron-collider' },
  ],
});
