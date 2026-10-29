// The Lorentz transformation — the one rule behind time dilation, length
// contraction and simultaneity, in ordinary units: x′ = γ(x − vt),
// t′ = γ(t − vx/c²). Its Galilean limit, velocity addition (differentiate it
// along a worldline) and the relativistic Doppler shift. The derivation from
// the postulates lives in gr.S02.d; this lesson uses the rule.
import { lesson, mcq, num, expr, order } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { gamma, addVelocities, doppler } from '../../src/viz/model/relativity.js';
import { C, seg, label, st, shipCurves, r6 } from './_modern.js';

const t = String.raw;

const CU = C / 1e6;                       // m per μs
const g = gamma;
const GAMMA_TEX = { 0.6: '1.25', 0.8: t`\tfrac{5}{3}` };
/** Keep only the slips that differ from the key by more than the tolerance. */
const apart = (errs, key, rel = 0.03) => errs.filter((e) => Math.abs(e.value - key) > rel * Math.max(Math.abs(key), 1e-9));

// the worked example: a beacon 4.5 km ahead flashes at t = 20 μs; the rocket passes at 0.8c
const EX = { b: 0.8, x: 4500, t: 20 };
EX.g = g(EX.b); EX.vt = EX.b * CU * EX.t; EX.vxc2 = EX.b * EX.x / CU;
EX.xp = EX.g * (EX.x - EX.vt); EX.tp = EX.g * (EX.t - EX.vxc2);

/** An event and the axes of S′ on a diagram in kilometres (ct in km), c = 1. */
function framesKm(b, events, R, caption) {
  return st({
    range: R, top: R * 1.25, bottom: -0.3 * R, xlabel: 'x (km)', ylabel: 'ct (km)',
    lines: [[-0.3 * R, -0.3 * R * b, 1.25 * R, 1.25 * R * b, 'gold', false, 2], [-R * b, -R, R * b, R, 'gold', false, 2]],
    events, caption, extra: { points: [label(1.15 * R * b, 1.15 * R, 't′ axis', 'gold', 8, 0), label(0.95 * R, 0.95 * R * b, 'x′ axis', 'gold', -20, -14)] },
  });
}

/**
 * Ships, pulses and speeds along a line, with an optional station at the left.
 *   rows: [{ x0, len, y, color, text, dir = 1, pulse = false }, …] — a ship (or, with pulse, just an arrow) and its speed label
 */
function arrowsPicture(rows, caption, station = true) {
  const curves = [], arrows = [], points = [];
  if (station) {
    curves.push(seg(-1.6, -0.5, -0.6, -0.5, 'ink2'), seg(-1.6, 0.5, -0.6, 0.5, 'ink2'), seg(-1.6, -0.5, -1.6, 0.5, 'ink2'), seg(-0.6, -0.5, -0.6, 0.5, 'ink2'));
    points.push(label(-1.1, 0.5, 'station', 'ink2', -22, -14));
  }
  for (const { x0, len, y = 0, color, text, dir = 1, pulse = false } of rows) {
    if (pulse) { arrows.push({ from: [r6(x0), y], to: [r6(x0 + len), y], color }); points.push(label(x0 + len / 2, y - 0.5, text, color, 0, 10, 'center')); continue; }
    curves.push(...shipCurves(x0, len, y, 0.42, color, false, dir));
    const a0 = dir > 0 ? x0 + 0.1 * len : x0 + 0.9 * len, a1 = dir > 0 ? x0 + len + 0.6 : x0 - 0.6;
    arrows.push({ from: [r6(a0), r6(y + 0.5)], to: [r6(a1), r6(y + 0.5)], color });
    points.push(label(x0 + len / 2, y - 0.5, text, color, 0, 10, 'center'));
  }
  return { type: 'graph', params: { x: [-1.9, 9.4], y: [-1.2, 2.6], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows, points }, caption };
}

export default lesson({
  id: 'phys2220.R1.3',
  title: 'The Lorentz transformation',
  minutes: 12, difficulty: 3,
  intro: t`Time dilation, length contraction and the relativity of simultaneity are three faces of a single rule. Let frame $S'$ move at speed $v$ along the $x$ axis of your frame $S$, with the two origins together at $t = t' = 0$. An event at position $x$ and time $t$ in $S$ has, in $S'$,

$$x' = \gamma\,(x - vt), \qquad t' = \gamma\left(t - \frac{v x}{c^2}\right)$$

and $y' = y$, $z' = z$. When $v \ll c$, $\gamma \to 1$ and the $vx/c^2$ term vanishes, leaving Galileo’s $x' = x - vt$, $t' = t$. Follow a moving object along its path and divide $dx'$ by $dt'$, and out comes the relativistic rule for adding velocities, $u' = \dfrac{u - v}{1 - uv/c^2}$ — which never gives a speed above $c$.

> Continue on the Road to Einstein: [Lorentz transformations and invariance, reviewed](#/lesson/gr.S02.d) derives the rule from the postulates, and [The interval: what every observer agrees on](#/lesson/gr.S04.i) finds what it leaves unchanged.`,
  symbols: [
    { tex: 'x,\\ t', text: 'an event’s position and time in your frame $S$, in m and s' },
    { tex: "x',\\ t'", text: t`the same event’s position and time in $S'$ (“S-prime”), which moves at speed $v$ in your $+x$ direction` },
    { tex: 'v', text: t`the velocity of $S'$ relative to $S$, along $x$, in m/s (negative if $S'$ moves toward $-x$)` },
    { tex: '\\gamma', text: t`the Lorentz factor $1/\sqrt{1 - v^2/c^2}$: 1.25 at $0.6c$, $\tfrac53$ at $0.8c$` },
    { tex: 'c', text: t`the speed of light, $299\,792\,458$ m/s — about 300 m per microsecond` },
    { tex: "u,\\ u'", text: t`an object’s velocity along $x$, measured in $S$ and in $S'$` },
  ],
  why: 'Requiring the laws of physics to keep their form under this transformation is how relativity tests a theory; Maxwell’s equations already pass, Newton’s mechanics had to be rebuilt (next lesson).',
  visual: {
    type: 'spacetime',
    title: 'One event, two sets of coordinates',
    lead: t`Your frame’s axes are the plain grey ones; the gold axes belong to $S'$, moving at the slider’s speed. The readout applies the Lorentz transformation to each event, in units with $c = 1$ — seconds up the page, light-seconds across.`,
    tasks: [
      'At β = 0.8 (γ = 5/3), event A at (t, x) = (5, 4) has x′ = 0 and t′ = 3: it happens right where the moving observer is, 3 s after the origins met.',
      'Drag B onto the gold x′ axis: its t′ becomes 0 — simultaneous with the origin for S′, though not for you.',
      'Slide β toward 0: the gold axes close up onto yours and t′ → t, x′ → x — Galileo’s world is the slow limit.',
    ],
    params: { beta: 0.8, events: [[5, 4], [2, 3]], simultaneity: false, hyperbolae: false, range: 5 },
    caption: t`Units with $c = 1$, so light runs at 45° (dashed). The gold dots mark one second and one light-second of $S'$’s own time and distance.`,
  },
  example: {
    prompt: t`A rocket passes an Earth station at $v = ${EX.b}c$; its nose passes the station at $t = t' = 0$ (the origins of the two frames). At $t = ${EX.t}\ \mu\text{s}$ on Earth’s clocks, a radio beacon ${EX.x / 1000} km ahead of the station — at $x = ${EX.x}$ m — flashes. Where and when does the flash happen in the rocket’s frame?`,
    visual: framesKm(EX.b, [[EX.t * CU / 1000, EX.x / 1000, 'beacon flash', 'accent2', -100, -12]], 6.8, t`Earth’s frame, with time drawn as $ct$ in km so light runs at 45° (dashed). Gold: the rocket’s axes. The flash lies just left of the rocket’s $t'$ axis: it happens behind the rocket.`),
    steps: [
      { label: 'Collect the pieces', text: t`$\gamma = ${GAMMA_TEX[EX.b]}$. In ${EX.t} μs the rocket covers $vt = 0.8 \times 299.79\ \text{m/μs} \times ${EX.t}\ \mu\text{s} = ${fmt(EX.vt, 4)}$ m, and $\dfrac{vx}{c^2} = 0.8 \times \dfrac{${EX.x}\ \text{m}}{299.79\ \text{m/μs}} = ${fmt(EX.vxc2, 4)}\ \mu\text{s}$.` },
      { label: 'Where', text: t`$x' = \gamma(x - vt) = \tfrac53\,(${EX.x} - ${fmt(EX.vt, 4)})\ \text{m} = ${fmt(EX.xp, 3)}$ m. Negative: the flash happens ${fmt(-EX.xp, 3)} m *behind* the rocket’s nose — by then the rocket has already passed the beacon.` },
      { label: 'When', text: t`$t' = \gamma\left(t - \dfrac{vx}{c^2}\right) = \tfrac53\,(${EX.t} - ${fmt(EX.vxc2, 4)})\ \mu\text{s} = ${fmt(EX.tp, 3)}\ \mu\text{s}$ — less than the ${EX.t} μs on Earth’s clocks.` },
      { label: 'Check an invariant', text: t`Both frames must agree on $(ct)^2 - x^2$, the spacetime interval: $(${fmt(EX.t * CU, 4)})^2 - ${EX.x}^2 = ${fmt(((EX.t * CU) ** 2 - EX.x ** 2) / 1e6, 4)}\times10^{6}\ \text{m}^2$, and $(${fmt(EX.tp * CU, 4)})^2 - (${fmt(EX.xp, 3)})^2 = ${fmt(((EX.tp * CU) ** 2 - EX.xp ** 2) / 1e6, 4)}\times10^{6}\ \text{m}^2$ ✓.` },
      { label: 'Sense check', text: t`The Earth station says the rocket reached $x = ${fmt(EX.vt, 4)}$ m by the time of the flash, beyond the beacon at ${EX.x} m — so a flash behind the rocket is what we should expect.` },
    ],
    answer: t`$x' = ${fmt(EX.xp, 3)}$ m (behind the nose) and $t' = ${fmt(EX.tp, 3)}\ \mu\text{s}$.`,
  },
  practice: [
    num({
      id: 'transform', difficulty: 2,
      gen(r) {
        const b = r.pick([0.6, 0.8]);
        let x, tt;
        do { x = r.pick([900, 1500, 2400, 3000]); tt = r.pick([2, 4, 6, 8, 10]); } while (Math.abs(x - b * CU * tt) < 150 || Math.abs(tt - b * x / CU) < 0.3);
        const askT = r.bool(0.5);
        const xp = g(b) * (x - b * CU * tt), tp = g(b) * (tt - b * x / CU);
        const key = askT ? tp : xp;
        return {
          prompt: t`Frame $S'$ moves at $${b}c$ along your $x$ axis ($\gamma = ${GAMMA_TEX[b]}$), and the origins coincide at $t = t' = 0$. An event happens at $x = ${x}$ m and $t = ${tt}\ \mu\text{s}$ in your frame. Find its ${askT ? t`time $t'$ in $S'$, in microseconds` : t`position $x'$ in $S'$, in metres`}. (Take $c = 299.79$ m/μs.)`,
          answer: key, units: askT ? 'μs' : 'm', tol: { rel: 0.01, abs: askT ? 0.005 : 1 },
          errors: apart(askT
            ? [{ value: tt, feedback: t`That is Galileo’s $t' = t$. In relativity time mixes with position: $t' = \gamma(t - vx/c^2)$.` }, { value: g(b) * (tt + b * x / CU), feedback: t`Check the sign: $S'$ moves toward $+x$, so $t' = \gamma(t - vx/c^2)$.` }, { value: tt - b * x / CU, feedback: t`You left out the factor $\gamma = ${GAMMA_TEX[b]}$.` }]
            : [{ value: x - b * CU * tt, feedback: t`That is Galileo’s $x - vt$; the Lorentz transformation multiplies it by $\gamma = ${GAMMA_TEX[b]}$.` }, { value: g(b) * (x + b * CU * tt), feedback: t`Check the sign: the origin of $S'$ moves toward $+x$, so $x' = \gamma(x - vt)$.` }], key),
          hints: [askT ? t`$t' = \gamma\,(t - vx/c^2)$, with $vx/c^2 = ${b}\times${x}\ \text{m}/(299.79\ \text{m/μs})$.` : t`$x' = \gamma\,(x - vt)$, with $vt = ${b}\times299.79\ \text{m/μs}\times${tt}\ \mu\text{s}$.`, askT ? t`$t' = ${GAMMA_TEX[b]}\times(${tt} - ${fmt(b * x / CU, 4)})\ \mu\text{s}$.` : t`$x' = ${GAMMA_TEX[b]}\times(${x} - ${fmt(b * CU * tt, 4)})$ m.`],
          teach: 'Each new coordinate is γ times a mixture of both old ones: x′ = γ(x − vt), t′ = γ(t − vx/c²).',
          explain: askT
            ? t`$t' = ${GAMMA_TEX[b]}\times(${tt} - ${fmt(b * x / CU, 4)}) = ${fmt(tp, 3)}\ \mu\text{s}$. (For the record, $x' = ${fmt(xp, 3)}$ m.)`
            : t`$x' = ${GAMMA_TEX[b]}\times(${x} - ${fmt(b * CU * tt, 4)}) = ${fmt(xp, 3)}$ m. (For the record, $t' = ${fmt(tp, 3)}\ \mu\text{s}$.)`,
          visual: framesKm(b, [[tt * CU / 1000, x / 1000, 'the event', 'accent2', 10, 10]], 3.6, t`Your frame, with time drawn as $ct$ in km (c = 1). Gold: the axes of $S'$ at $${b}c$.`),
        };
      },
    }),
    mcq({
      id: 'galilean-limit', difficulty: 1,
      prompt: t`For a frame moving at $v \ll c$ — a train, an aircraft, even a spacecraft — the Lorentz transformation becomes:`,
      choices: [t`$x' = x - vt$, $\;t' = t$`, t`$x' = x$, $\;t' = t - vx/c^2$`, t`$x' = \gamma x$, $\;t' = \gamma t$`, t`$x' = x + vt$, $\;t' = t$`],
      answer: 0,
      why: {
        1: t`The $vx/c^2$ term is the one that vanishes when $v \ll c$, and position certainly changes: the frame is moving.`,
        2: t`That just rescales both coordinates; it has lost the $-vt$ that follows the moving origin.`,
        3: t`The origin of $S'$ sits at $x = vt$, so $x'$ must be zero there: $x' = x - vt$.`,
      },
      hints: [t`When $v \ll c$, what are $\gamma$ and $vx/c^2$ close to?`],
      teach: 'At low speeds γ → 1 and vx/c² → 0, and the Lorentz transformation becomes Galileo’s.',
      explain: t`With $\gamma \approx 1$ and $vx/c^2 \approx 0$: $x' = x - vt$ and $t' = t$ — Newtonian physics, recovered as the slow limit. Even at a spacecraft’s 8 km/s, $\gamma - 1$ is only about $3.6\times10^{-10}$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 0.4], y: [0.99, 1.1], xlabel: 'speed v / c', ylabel: 'γ',
          curves: [{ fn: '1/sqrt(1 - x^2)', color: 'accent' }],
          hlines: [{ y: 1, label: 'γ = 1: Galileo', color: 'ink3' }],
          vlines: [{ x: 0.1, label: '0.1c', color: 'gold' }],
        },
        caption: 'γ stays within 0.5% of 1 up to a tenth of the speed of light; every vehicle ever built sits far to the left of this graph.',
      },
    }),
    num({
      id: 'velocity-add', difficulty: 2,
      gen(r) {
        const [v, up] = r.pick([[0.5, 0.5], [0.8, 0.8], [0.6, 0.6], [0.9, 0.5], [0.7, 0.4], [0.3, 0.8]]);
        const u = addVelocities(up, v);
        return {
          prompt: t`A starship moves at $${v}c$ relative to a space station. It launches a probe straight ahead at $${up}c$ relative to the ship. How fast does the probe move relative to the station? Give $u/c$.`,
          answer: u, tol: { rel: 0.003 },
          errors: [{ value: up + v, feedback: t`Galileo’s rule $u = u' + v$ fails near $c$ — here it would even exceed $c$. Use $u = \dfrac{u' + v}{1 + u'v/c^2}$.` }, { value: (up + v) / (1 - up * v), feedback: 'Check the sign in the denominator: speeds in the same direction give 1 + u′v/c².' }],
          hints: [t`Invert the rule: $u = \dfrac{u' + v}{1 + u'v/c^2}$, with $u' = ${up}c$ and $v = ${v}c$.`, t`$u/c = \dfrac{${up} + ${v}}{1 + ${up}\times${v}}$.`],
          teach: 'Velocities add as u = (u′ + v)/(1 + u′v/c²), which stays below c whenever both speeds do.',
          explain: t`$u/c = \dfrac{${nice(up + v)}}{1 + ${nice(up * v)}} = ${fmt(u, 4)}$ — below 1, as it must be, though Galileo would have said ${nice(up + v)}.`,
          visual: arrowsPicture([{ x0: 0.6, len: 2.2, color: 'accent', text: `ship: ${v}c` }, { x0: 4.6, len: 1.2, color: 'gold', text: `probe: ${up}c (ship frame)` }], 'The station, the ship and the probe it launches ahead. Not to scale.'),
        };
      },
    }),
    num({
      id: 'head-on', difficulty: 2,
      gen(r) {
        const u = r.pick([0.5, 0.6, 0.7, 0.9]);
        const rel = addVelocities(u, u);
        return {
          prompt: t`Two spacecraft approach a station from opposite sides, each at $${u}c$ relative to the station. How fast does one spacecraft move relative to the other? Give $v/c$.`,
          answer: rel, tol: { rel: 0.003 },
          errors: [{ value: 2 * u, feedback: t`Adding speeds Galileo’s way gives ${nice(2 * u)}${2 * u >= 1 ? ' — at or above c, which is impossible' : ''}. Use the relativistic rule.` }],
          hints: [t`Sit in one ship: the station approaches at $${u}c$, and the other ship approaches the station at $${u}c$ in the station’s frame.`, t`$v/c = \dfrac{${u} + ${u}}{1 + ${u}\times${u}}$.`],
          teach: 'Even head-on, relative speeds combine by the relativistic rule and never reach c.',
          explain: t`$v/c = \dfrac{${nice(2 * u)}}{1 + ${nice(u * u)}} = ${fmt(rel, 4)}$. The station measures the gap between the ships closing at $${nice(2 * u)}c$ — a *closing rate* between two moving things may exceed $c$; the speed of any one object relative to another may not.`,
          visual: arrowsPicture([{ x0: -0.4, len: 2.0, color: 'accent', text: `${u}c` }, { x0: 6.2, len: 2.0, color: 'violet', text: `${u}c`, dir: -1 }], 'Two ships approaching each other, each at the same speed relative to a station between them (not drawn). Not to scale.', false),
        };
      },
    }),
    expr({
      id: 'light-add', difficulty: 2,
      prompt: t`A ship moving at $v$ relative to a station fires a laser forward: in the ship’s frame the pulse moves at $u' = c$. Substitute into $u = \dfrac{u' + v}{1 + u'v/c^2}$ and simplify: what speed $u$ does the station measure?`,
      answer: 'c', answerTeX: 'c', lhs: 'u',
      vars: { c: [2, 4], v: [0.2, 1.5] },
      errors: [{ answer: 'c + v', feedback: t`That is Galileo’s answer. Simplify the full formula: $\dfrac{c + v}{1 + v/c} = \dfrac{c + v}{(c + v)/c}$.` }],
      hints: [t`With $u' = c$: $u = \dfrac{c + v}{1 + cv/c^2} = \dfrac{c + v}{1 + v/c}$.`, t`Multiply top and bottom by $c$: $\dfrac{c(c + v)}{c + v}$.`],
      teach: 'The velocity-addition rule turns c into c for every v: the second postulate is built into it.',
      explain: t`$u = \dfrac{c + v}{1 + v/c} = \dfrac{c\,(c + v)}{c + v} = c$, whatever $v$ is. The rule was derived from the Lorentz transformation, which was built so that light moves at $c$ in every frame — so this is a consistency check, and it passes.`,
      visual: arrowsPicture([{ x0: 0.6, len: 2.2, color: 'accent', text: 'ship: v' }, { x0: 3.3, len: 3.4, color: 'gold', text: 'pulse: c (ship frame)', pulse: true }], 'A ship firing a laser pulse ahead. Not to scale.'),
    }),
    order({
      id: 'contraction-order', difficulty: 2,
      prompt: 'Put the steps in order to derive length contraction from the Lorentz transformation.',
      items: [
        t`A rod lies at rest in $S'$, from $x' = 0$ to $x' = L_0$: its proper length is $L_0$.`,
        t`In $S$ the rod moves, so to measure it you mark both ends at the same time $t$: $\Delta t = 0$.`,
        t`Apply $x' = \gamma(x - vt)$ to each end and subtract: $\Delta x' = \gamma(\Delta x - v\,\Delta t) = \gamma\,\Delta x$.`,
        t`With $\Delta x' = L_0$ and $\Delta x = L$: $\;L = L_0/\gamma$.`,
      ],
      hints: ['Begin with the rod in its own frame; end with the formula.', 'The key choice is which two events count as “measuring the ends”.'],
      teach: 'Length is measured by marking both ends at the same time in the measuring frame — and that choice is what makes moving lengths shrink.',
      explain: t`Marking both ends at the same $t$ in $S$ makes $\Delta t = 0$, so $\Delta x' = \gamma\,\Delta x$, and the moving rod measures $L = L_0/\gamma$. In $S'$ those two marks are *not* simultaneous — which is why the frames can disagree without contradiction.`,
      visual: st({
        range: 3.6, xr: [-1, 4.4], top: 3, bottom: -0.6, cone: false, numbers: false, xlabel: 'x (frame S)', ylabel: 'ct (frame S)',
        lines: [[-0.5, -0.3, 2.8, 1.68, 'accent'], [-0.5, 1.7, 2.8, 3.68, 'accent'], [0, -0.8, 0, 4.2, 'ink2', true, 1.6], [-0.48, -0.8, 2.52, 4.2, 'gold', true, 1.6]],
        events: [[0, 0, 'rear end', 'accent2', -64, 14], [0, 2, 'front end, “now” in S', 'ink2', 10, 14], [1.875, 3.125, 'front end, “now” in S′', 'gold', -150, -12]],
        caption: 'The rod’s two ends (blue) moving through frame S at 0.6c. Grey dashed: one “now” of S; gold dashed: one “now” of S′. Each frame measures the rod along its own “now”, so they get different lengths. Not to scale.',
      }),
    }),
    num({
      id: 'doppler', difficulty: 2,
      gen(r) {
        const b = r.pick([0.1, 0.2, 0.5, 0.6]), f0 = r.pick([2.3, 8.4, 32]);
        const f = f0 * doppler(b);
        return {
          prompt: t`The Lorentz transformation also fixes the Doppler shift of light. A probe recedes from Earth at $${b}c$ and transmits at ${f0} GHz in its own frame. At what frequency does Earth receive it? For a receding source, $f = f_0\sqrt{\dfrac{1 - v/c}{1 + v/c}}$.`,
          answer: f, units: 'GHz', tol: { rel: 0.003 },
          errors: [{ value: f0 / doppler(b), feedback: 'A receding source is received at a *lower* frequency: the factor √((1 − β)/(1 + β)) is less than 1.' }, { value: f0 * (1 - b), feedback: t`$f_0(1 - v/c)$ is the first-order approximation; at $${b}c$ use the full formula.` }],
          hints: [t`$\sqrt{\dfrac{1 - ${b}}{1 + ${b}}} = \sqrt{${nice((1 - b) / (1 + b), 4)}}$.`],
          teach: 'Light from a receding source arrives at f₀√((1 − β)/(1 + β)): time dilation plus the growing light-travel distance.',
          explain: t`$f = ${f0}\ \text{GHz}\times\sqrt{${nice((1 - b) / (1 + b), 4)}} = ${f0}\times${fmt(doppler(b), 4)} = ${fmt(f, 4)}$ GHz. Unlike sound, there is no medium: only the relative velocity of source and receiver matters.`,
          visual: st({
            range: 3, xr: [-0.6, 3.4], top: 4.4, bottom: -0.3, cone: false, numbers: false, xlabel: 'x (Earth’s frame)', ylabel: 't (Earth’s frame)',
            lines: [[0, 0, 4.4, 0, 'accent'], [0, 0, 4.4, 2.2, 'violet'], [1.1547, 0.5774, 1.7321, 0, 'warn', false, 1.6], [2.3094, 1.1547, 3.4641, 0, 'warn', false, 1.6]],
            events: [[1.1547, 0.5774, 'crest 1 sent', 'violet', 10, 4], [2.3094, 1.1547, 'crest 2 sent', 'violet', 10, 4], [1.7321, 0, 'received', 'accent', -70, 0], [3.4641, 0, 'received', 'accent', -70, 0]],
            extra: { points: [label(0, 4.1, 'Earth', 'accent', 8, 0), label(2.05, 4.1, 'probe', 'violet', 10, 0)] },
            caption: 'Earth (blue) and a receding probe (violet), drawn at 0.5c with c = 1. The probe sends a crest every unit of its own time; each crest’s light (orange) takes longer to come back than the last, so they arrive spread out. Not to scale.',
          }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-transform', difficulty: 2,
      prompt: t`Frame $S'$ moves at $0.6c$ along your $x$ axis ($\gamma = 1.25$), origins together at $t = t' = 0$. An event happens at $x = 1200$ m and $t = 2.0\ \mu\text{s}$ in your frame. At what time $t'$ does it happen in $S'$? (Take $c = 299.79$ m/μs.)`,
      answer: g(0.6) * (2.0 - 0.6 * 1200 / CU), units: 'μs', tol: { rel: 0.01, abs: 0.005 },
      errors: [{ value: 2.0, feedback: t`Galileo’s $t' = t$ is wrong here: $t' = \gamma(t - vx/c^2)$.` }],
      hints: [t`$vx/c^2 = 0.6\times1200/299.79\ \mu\text{s}$.`, t`$t' = 1.25\,(2.0 - vx/c^2)$.`],
      teach: 't′ = γ(t − vx/c²): a large enough vx/c² makes t′ negative.',
      explain: t`$vx/c^2 = ${fmt(0.6 * 1200 / CU, 4)}\ \mu\text{s}$, so $t' = 1.25\times(2.0 - ${fmt(0.6 * 1200 / CU, 4)}) = ${fmt(g(0.6) * (2.0 - 0.6 * 1200 / CU), 3)}\ \mu\text{s}$. Negative: in $S'$ the event happens *before* the origins meet, although in your frame it happens after. That is allowed because light could not have linked the two events (it covers only 600 m in 2.0 μs).`,
      visual: framesKm(0.6, [[2.0 * CU / 1000, 1.2, 'the event', 'accent2', 10, 10]], 1.6, t`Your frame, with $ct$ in km. Gold: the axes of $S'$ at $0.6c$. The event lies below the $x'$ axis.`),
    }),
    num({
      id: 'cp-probe', difficulty: 2, transfer: true,
      prompt: t`A crewed mothership cruising at $0.4c$ relative to Earth launches an uncrewed probe straight ahead at $0.7c$ relative to itself. How fast is the probe moving relative to Earth? Give $v/c$.`,
      answer: addVelocities(0.7, 0.4), tol: { rel: 0.003 },
      errors: [{ value: 1.1, feedback: 'Galileo’s sum, 1.1c, is impossible. Use u = (u′ + v)/(1 + u′v/c²).' }],
      hints: [t`$u = \dfrac{0.7 + 0.4}{1 + 0.7\times0.4}\,c$.`],
      teach: 'Relativistic velocity addition: u = (u′ + v)/(1 + u′v/c²).',
      explain: t`$u = \dfrac{1.1}{1.28}\,c = ${fmt(addVelocities(0.7, 0.4), 4)}c$. Staging still helps — the probe ends up faster than either launch alone could make it — but the gains shrink as speeds approach $c$.`,
      visual: arrowsPicture([{ x0: 0.6, len: 2.2, color: 'accent', text: 'mothership: 0.4c' }, { x0: 4.6, len: 1.2, color: 'gold', text: 'probe: 0.7c (mothership frame)' }], 'Earth (the station at left), the mothership and its probe. Not to scale.'),
    }),
    num({
      id: 'cp-voyager', difficulty: 3, transfer: true,
      prompt: t`Voyager 1 transmits to Earth at 8.4 GHz. Suppose it recedes from Earth along the line of sight at 17 km/s (about its speed relative to the Sun; Earth’s own orbital motion adds or subtracts up to 30 km/s over a year). By how many kilohertz is the received frequency lower than 8.4 GHz?`,
      answer: 8.4e9 * (1 - doppler(17e3 / C)) / 1e3, units: 'kHz', tol: { rel: 0.01 },
      errors: [{ value: 8.4e9 * (17e3 / C) ** 2 / 2 / 1e3, feedback: 'At low speeds the shift is first order in v/c: Δf ≈ f₀·v/c.' }],
      hints: [t`At $v \ll c$, $\sqrt{(1 - \beta)/(1 + \beta)} \approx 1 - \beta$, so $\Delta f \approx f_0\,v/c$.`, t`$v/c = 1.7\times10^{4}/(2.998\times10^{8})$; multiply by $8.4\times10^{9}$ Hz.`],
      teach: 'At everyday speeds the relativistic Doppler shift reduces to Δf ≈ f₀v/c — and the deep-space network measures it to track spacecraft.',
      explain: t`$v/c = ${tex(17e3 / C, 3)}$, so $\Delta f \approx f_0\,v/c$; precisely, $\Delta f = f_0\left(1 - \sqrt{\tfrac{1-\beta}{1+\beta}}\right) = ${fmt(8.4e9 * (1 - doppler(17e3 / C)) / 1e3, 4)}$ kHz, against $f_0\beta = 476.33$ kHz: they agree to four figures. NASA’s Deep Space Network tracks such shifts to a fraction of a hertz — measuring a spacecraft’s speed along the line of sight to better than a millimetre per second.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 0.3], y: [0.7, 1.02], xlabel: 'recession speed v / c', ylabel: 'f / f₀',
          curves: [{ fn: 'sqrt((1 - x)/(1 + x))', color: 'accent', label: 'exact', labelAt: 0.08, labelDx: -10, labelDy: -24 }, { fn: '1 - x', color: 'gold', dash: true, label: 'first order: 1 − v/c', labelAt: 0.2, labelDx: -20, labelDy: 26 }],
        },
        caption: 'The relativistic Doppler factor for a receding source and its first-order approximation. Voyager’s v/c ≈ 6 × 10⁻⁵ is far to the left, where the two agree to parts in a billion.',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §5.5 The Lorentz transformation', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-5-the-lorentz-transformation' },
    { label: 'OpenStax University Physics Vol. 3, §5.6 Relativistic velocity transformation', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-6-relativistic-velocity-transformation' },
    { label: 'OpenStax University Physics Vol. 3, §5.7 Doppler effect for light', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-7-doppler-effect-for-light' },
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 3 and L', url: 'https://www.eftaylor.com/spacetimephysics/' },
  ],
});
