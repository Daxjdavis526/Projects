// Simultaneity, contraction and dilation read from one Minkowski diagram:
// a rod's worldsheet cut by two observers' lines of "now", calibrated by the
// spacelike and timelike hyperbolae; the pole in the barn and the twin
// paradox read with hyperbolae. Builds on phys2710.MP2.4 (pole and barn with
// 10 m / 8 m at 0.6c, the twins' jump in "now") and phys2220.R1.2 without
// reusing their numbers.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { C, r6, st, label } from './_geom.js';

const t = String.raw;
const gam = (b) => 1 / Math.sqrt(1 - b * b);
const CNS = C / 1e9;                      // metres per nanosecond
const PB = { LP: 17, LB: 15, b: 8 / 17 }; // worked example: a 17 m pole, a 15 m barn, at 8/17 c
PB.g = gam(PB.b);

/** The barn's frame (x and ct in metres): doors, the pole's two ends, both frames' "now" through E1, and the pole's proper-length hyperbola. */
function barnPicture({ LP, LB, b, numbers = true, hyper = true, caption }) {
  const g = gam(b), top = LB * 1.0, bot = -LB * 0.6;
  return st({
    x: [-LB * 0.35, LB * 1.6], t: [bot, top], xlabel: 'x (m, barn frame)', ylabel: 'ct (m)', numbers, aspect: 'wide',
    lines: [
      { pts: [[0, bot], [0, top]], color: 'ink2', width: 3 },
      { pts: [[LB, bot], [LB, top]], color: 'ink2', width: 3 },
      { pts: [[b * bot, bot], [b * top, top]], color: 'accent', width: 2.2 },
      { pts: [[LP / g + b * bot, bot], [LP / g + b * top, top]], color: 'accent', width: 2.2 },
      { pts: [[-LB * 0.35, 0], [LB * 1.6, 0]], color: 'ink3', width: 1.2, dash: true },
    ],
    simul: [{ at: [0, 0], beta: b, color: 'gold' }],
    hyper: hyper ? [{ s: LP, kind: 'space', color: 'violet', width: 1.4 }] : [],
    events: [[0, 0, 'E1', 'accent2', -9, 14, 'right'], [LB, 0, 'E2', 'accent2', 9, 14]],
    extra: { points: [label(0, top * 0.9, 'front door', 'ink2', -8, 0, 'right'), label(LB, top * 0.9, 'back door', 'ink2', 8, 0), label(b * top * 0.55, top * 0.55, 'back of pole', 'accent', -8, 0, 'right'), label(LP / g + b * top * 0.3, top * 0.3, 'front of pole', 'accent', 8, 0), label(LB * 1.55, b * LB * 1.55, 'pole’s “now”', 'gold', 0, -12, 'right')] },
    caption: caption ?? t`The barn’s frame, time drawn as $ct$ in metres. Grey: the doors. Blue: the ends of the pole. Dashed grey: the barn’s “now” through E1; gold: the pole’s.${hyper ? ' Violet: the hyperbola $x^2 - (ct)^2 = L_{\\text{pole}}^2$, which the pole’s own “now” meets at its front end.' : ''}`,
  });
}

/** Twins read with hyperbolae: the traveller ages τ₁ out and τ₁ back at speed β (years and light-years). */
function twinHyper({ b, tau, numbers = true, caption }) {
  const g = gam(b), T1 = g * tau, D = b * T1;
  return st({
    x: [-0.35 * Math.max(D, 0.4 * T1), Math.max(1.35 * D, 0.6 * T1)], t: [-0.05 * T1, 2.15 * T1], numbers,
    hyper: [{ s: tau, color: 'violet', width: 1.3 }, { s: tau, at: [D, T1], color: 'teal', width: 1.3 }],
    lines: [{ pts: [[0, 0], [0, 2.1 * T1]], color: 'accent', width: 2.2, label: 'Earth', at: 0, dx: -8, dy: -30, align: 'right' }, { pts: [[0, 0], [D, T1], [0, 2 * T1]], color: 'gold', width: 2.4, label: 'traveller', at: 0, dx: 10, dy: 6 }],
    events: [[0, 0, 'departure', 'ink2', 9, 12], [D, T1, 'turnaround', 'gold', 9, 0], [0, 2 * T1, 'reunion', 'ink2', -9, -6, 'right']],
    caption: caption ?? t`Earth’s frame ($c = 1$). Violet: every event a clock leaving the departure can reach having aged exactly the traveller’s outbound time; teal: the same hyperbola from the turnaround. The turnaround sits on the violet one and the reunion on the teal one: each leg lasts the same proper time.`,
  });
}

export default lesson({
  id: 'phys3710.R2.3',
  title: 'Simultaneity, contraction and dilation from one diagram',
  minutes: 13, difficulty: 3,
  intro: t`Three effects that usually get three formulas are one picture. Draw a moving rod’s **worldsheet** — the strip between the worldlines of its two ends — and the two observers’ lines of “now”. Your “now” cuts the strip short: **contraction**. The rod’s “now” is tilted, so events you call simultaneous are not simultaneous for it: **relativity of simultaneity**. And the moving clock’s ticks sit on hyperbolae farther up your page than your own: **dilation**. With $c = 1$, a rod of proper length $L_0$ moving at $\beta$:

$$L = \frac{L_0}{\gamma}, \qquad \Delta t' = -\gamma\beta\,\Delta x \ \ (\text{for } \Delta t = 0), \qquad \Delta t = \gamma\,\Delta\tau$$

You met the formulas in [Time dilation and length contraction](#/lesson/phys2220.R1.2) and the pole in the barn in [Spacetime diagrams and the interval](#/lesson/phys2710.MP2.4). Here every number comes off one diagram, read with the calibration hyperbolae of lesson R2.2.`,
  symbols: [
    { tex: 'L_0', text: 'the rod’s proper length, measured in its own rest frame, in light-years (or metres with time as ct)' },
    { tex: 'L', text: 'its length in your frame: the distance between its ends at one instant of **your** time' },
    { tex: "\\Delta t'", text: 'the time between two events in the rod’s frame' },
    { tex: '\\Delta x', text: 'their separation in your frame, for events simultaneous for you' },
    { tex: '\\Delta\\tau', text: 'the proper time between two ticks of a moving clock' },
    { tex: '\\gamma', text: t`the Lorentz factor $1/\sqrt{1 - \beta^2} = \cosh\varphi$` },
  ],
  why: 'Paradoxes in relativity are always a question about which events count as “at the same time”; a diagram with both frames’ lines of “now” answers it at a glance.',
  visual: {
    type: 'graph',
    title: 'Three effects, one picture',
    lead: t`The blue strip is the worldsheet of a rod 3 light-years long in its own frame, moving at $\beta$. Teal: the rod as **you** see it at $t = 0$. Gold: the rod at one instant of **its** time, reaching the violet hyperbola $x^2 - t^2 = 9$. The violet curve above is $t^2 - x^2 = 4$, where the rod’s rear clock reads 2 years.`,
    tasks: [
      'The gold “now” always reaches the violet hyperbola at the rod’s front end: its proper length stays 3. Your teal cut shrinks as β grows.',
      'Read the front end’s time t′ on your teal line from the readout: negative — for the rod, that event happened earlier.',
      'Follow the rear clock to its 2-year tick (on the upper violet curve): your horizontal “now” through it meets your time axis at 2γ.',
    ],
    params: {
      x: [-2.5, 6.5], y: [-1.5, 5.5], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x (light-years)', ylabel: 't (years)',
      sliders: [{ key: 'b', label: t`Speed of the rod $\beta$`, min: 0.15, max: 0.85, step: 0.01, value: 0.6, explain: 'The rod and its clocks move along +x at this speed.' }],
      shade: [{ fn: 'x/b', lower: '(x - 3*sqrt(1 - b^2))/b', from: -2.5, to: 6.5, color: 'accent', alpha: 0.16 }],
      curves: [
        { fn: 'x', color: 'warn', dash: true, width: 1 }, { fn: '-x', color: 'warn', dash: true, width: 1 },
        { param: ['b*t', 't'], t: [-2, 6], color: 'accent', width: 2 }, { param: ['3*sqrt(1 - b^2) + b*t', 't'], t: [-2, 6], color: 'accent', width: 2 },
        { param: ['3*cosh(t)', '3*sinh(t)'], t: [-0.6, 1.2], color: 'violet', width: 1.4, dash: [4, 3] },
        { param: ['2*sinh(t)', '2*cosh(t)'], t: [-0.6, 1.5], color: 'violet', width: 1.4, dash: [4, 3] },
        { param: ['3*sqrt(1 - b^2)*t', '0'], t: [0, 1], color: 'teal', width: 4 },
        { param: ['3*t/sqrt(1 - b^2)', '3*b*t/sqrt(1 - b^2)'], t: [0, 1], color: 'gold', width: 3 },
        { param: ['t', '2/sqrt(1 - b^2)'], t: [0, '2*b/sqrt(1 - b^2)'], color: 'ink3', width: 1.2, dash: [2, 3] },
      ],
      points: [
        { x: '2*b/sqrt(1 - b^2)', y: '2/sqrt(1 - b^2)', color: 'violet', r: 4, label: 'rear clock: 2 yr', labelDx: 8, labelDy: -4 },
        { x: 0, y: '2/sqrt(1 - b^2)', color: 'ink2', r: 3.5, label: 'you: 2γ', labelDx: -8, labelAlign: 'right' },
        { x: '3*sqrt(1 - b^2)', y: 0, color: 'teal', r: 4 },
        { x: '3/sqrt(1 - b^2)', y: '3*b/sqrt(1 - b^2)', color: 'gold', r: 4 },
      ],
      readouts: [
        { label: t`$\gamma$`, expr: '1/sqrt(1 - b^2)', digits: 4 },
        { label: t`your length $L = L_0/\gamma$`, expr: '3*sqrt(1 - b^2)', digits: 4, unit: t`\text{ly}` },
        { label: t`$t'$ of the front end on your $t = 0$`, expr: '-3*b', digits: 4, unit: t`\text{yr}` },
        { label: 'your time at its 2-year tick', expr: '2/sqrt(1 - b^2)', digits: 4, unit: t`\text{yr}` },
      ],
    },
    caption: t`Units with $c = 1$ (dashed orange: light). The rod’s ends are its worldlines; the two cuts across the strip are two observers’ ideas of “the rod now”. Both are right; they are different sets of events.`,
  },
  example: {
    prompt: t`A pole ${PB.LP} m long (in its own frame) runs at $\beta = \tfrac{8}{17}$ into a barn ${PB.LB} m long with a door at each end. Read off the diagram whether the pole is ever entirely inside the barn — in the barn’s frame, and in the pole’s.`,
    visual: barnPicture(PB),
    steps: [
      { label: 'Barn frame', text: t`$\gamma = \tfrac{17}{15}$, so the pole’s ends are $17/\gamma = 15$ m apart along any horizontal line: the barn’s “now”. At $ct = 0$ the back passes the front door (E1) and the front reaches the back door (E2) together. Both doors could be shut at that instant.` },
      { label: 'Pole frame', text: t`The pole’s “now” through E1 is the gold line, slope $\beta$. It reaches the back door’s worldline at $ct = \beta\times15 = ${fmt(PB.b * 15, 4)}$ m, **above** E2. For the pole, the front reached the back door earlier: $c\,\Delta t' = -\gamma\beta\times15\ \text{m} = -8$ m, so E2 is ${fmt(8 / CNS, 3)} ns before E1.` },
      { label: 'Read the proper length', text: t`Along the gold line the pole’s front end sits where it meets the violet hyperbola $x^2 - (ct)^2 = 17^2$: the pole is 17 m long in its own frame, and on its “now” its front is already well past the back door.` },
      { label: 'The barn, contracted', text: t`In the pole’s frame the barn moves and is $15/\gamma = ${fmt(15 / PB.g, 4)}$ m long. When its back is at the front door the front is $17 - ${fmt(15 / PB.g, 4)} = ${fmt(17 - 15 / PB.g, 4)}$ m beyond the back door — that is $L_{\text{pole}}\beta^2 = 17\times\tfrac{64}{289}$.` },
      { label: 'Sense check', text: t`E1 and E2 are spacelike: $-(ct)^2 + x^2 = 225\ \text{m}^2$ in both frames. Their order is not physical, so neither answer to “is the pole inside?” contradicts the other. Whether a door hits the pole is an event, and every frame agrees on it.` },
    ],
    answer: t`In the barn’s frame, yes, for an instant at $ct = 0$. In the pole’s frame never: its front leaves through the back door ${fmt(8 / CNS, 3)} ns before its back enters.`,
  },
  practice: [
    num({
      id: 'cut-length', difficulty: 1,
      gen(r) {
        const [b, bs] = r.pick([[0.6, '0.6'], [8 / 17, t`\tfrac{8}{17}`], [12 / 13, t`\tfrac{12}{13}`], [0.28, '0.28']]);
        const L0 = r.pick([3, 5, 6]);
        const ans = L0 / gam(b);
        return {
          prompt: t`A train of cargo pods ${L0} light-hours long in its own frame passes a station at $\beta = ${bs}$. How long is it at one instant of the station’s time? (Read it as your horizontal “now” cutting its worldsheet.)`,
          visual: st({ x: [-0.6 * L0, 1.8 * L0], t: [-0.4 * L0, 1.2 * L0], xlabel: 'x (light-hours)', ylabel: 't (hours)', numbers: false,
            lines: [{ pts: [[-0.4 * L0 * b, -0.4 * L0], [1.2 * L0 * b, 1.2 * L0]], color: 'accent' }, { pts: [[ans - 0.4 * L0 * b, -0.4 * L0], [ans + 1.2 * L0 * b, 1.2 * L0]], color: 'accent' }, { pts: [[-0.6 * L0, 0], [1.8 * L0, 0]], color: 'teal', width: 1.4, dash: true }],
            hyper: [{ s: L0, kind: 'space', color: 'violet' }], simul: [{ at: [0, 0], beta: r6(b), color: 'gold' }],
            caption: 'The station’s frame (c = 1): the pods’ ends (blue), the station’s “now” (teal), the pods’ “now” (gold) and the hyperbola x² − t² = L₀² (violet).' }),
          answer: ans, units: 'h', tol: { rel: 0.003 },
          errors: [{ value: L0 * gam(b), feedback: 'That is longer than its proper length; your horizontal cut is the shorter one.' }],
          hints: [t`The station’s cut is $L_0/\gamma$; the pods’ own cut reaches the violet hyperbola at length $L_0$.`, t`$\gamma = ${fmt(gam(b), 4)}$.`],
          teach: 'Your horizontal “now” cuts a moving worldsheet in a length L₀/γ; the object’s own “now” cuts it in L₀.',
          explain: t`$L = ${L0}/${fmt(gam(b), 4)} = ${fmt(ans, 4)}$ light-hours. Both cuts are honest: they are different sets of events.`,
        };
      },
    }),
    num({
      id: 'lag', difficulty: 2,
      gen(r) {
        const [b, bs] = r.pick([[0.6, '0.6'], [0.28, '0.28'], [12 / 13, t`\tfrac{12}{13}`]]);
        const L0 = r.pick([2, 4, 5]);
        const ans = b * L0;
        return {
          prompt: t`A fleet ${L0} light-years long (in its own frame) has synchronized clocks at its front and rear. It passes you at $\beta = ${bs}$. At the instant your clocks read 0, the rear clock (beside you) reads 0. What does the front clock read? Give the magnitude of the lag, in years.`,
          visual: st({ x: [-0.5 * L0, 1.6 * L0], t: [-0.9 * L0, 1.1 * L0], numbers: false,
            lines: [{ pts: [[-0.6 * L0 * b, -0.6 * L0], [L0 * b, L0]], color: 'accent' }, { pts: [[L0 / gam(b) - 0.6 * L0 * b, -0.6 * L0], [L0 / gam(b) + L0 * b, L0]], color: 'accent' }, { pts: [[-0.5 * L0, 0], [1.6 * L0, 0]], color: 'teal', width: 1.4, dash: true }],
            simul: [{ at: [0, 0], beta: r6(b), color: 'gold' }],
            events: [[0, 0, 'rear: 0', 'accent2', -9, 12, 'right'], [L0 / gam(b), 0, 'front: ?', 'accent2', 9, 12]],
            caption: 'Your frame (c = 1). Gold: the fleet’s “now” through the rear clock at 0. The front event on your “now” lies below it.' }),
          answer: ans, units: 'yr', tol: { rel: 0.003 },
          errors: [{ value: b * L0 / gam(b), feedback: t`The lag is $\gamma\beta\,\Delta x$ with $\Delta x = L_0/\gamma$: the $\gamma$s cancel, leaving $\beta L_0$.` }],
          hints: [t`$t' = \gamma(t - \beta x)$ with $t = 0$ and $x = L_0/\gamma$.`, t`$t' = -\beta L_0$.`],
          teach: 'Clocks synchronized in a moving frame are out of step in yours: the leading clock lags by βL₀/c.',
          explain: t`$t' = -\gamma\beta\times L_0/\gamma = -${nice(ans, 4)}$ years: the front clock reads $-${nice(ans, 4)}$ yr. On the diagram, the front event on your “now” sits below the gold line through the rear clock.`,
        };
      },
    }),
    mcq({
      id: 'reciprocity', difficulty: 2,
      prompt: 'You and a moving observer each find the other’s clock running slow. How does one diagram make both true at once?',
      visual: st({ x: [-1, 4], t: [-0.3, 4], numbers: true, boosted: { beta: 0.6, ticks: 2 }, hyper: [{ s: 1 }, { s: 2 }],
        simul: [{ at: [0.75, 1.25], beta: 0, color: 'teal' }, { at: [0, 1], beta: 0.6, color: 'violet' }],
        caption: 'Your frame (c = 1). Teal: your “now” through the moving clock’s 1-year tick. Violet: the moving observer’s “now” through your 1-year tick.' }),
      choices: ['The two observers use different lines of “now” to compare distant clocks', 'One of the two clocks really runs slow, and the other only appears to', 'The light from each clock takes time to arrive, which fakes the slowing', 'The effect cancels, so neither clock really runs slow'],
      answer: 0,
      why: {
        1: 'Neither frame is preferred; each statement is about comparing a distant clock along that observer’s own “now”.',
        2: 'Light-travel delays are corrected for; the effect remains after the correction.',
        3: 'Both statements are true at once; they are not in conflict, because they compare different pairs of events.',
      },
      hints: ['Comparing two separated clocks needs a rule for “at the same time”.', 'The teal and violet lines are two different rules.'],
      teach: 'Time dilation is reciprocal because each observer compares clocks along their own line of simultaneity.',
      explain: 'Your horizontal “now” through the moving clock’s 1-year tick meets your clock at t = 1.25: you say it runs slow. Its tilted “now” through your 1-year tick meets its own worldline at t′ = 1.25: it says yours runs slow. Different events are being compared, so both can be right.',
    }),
    num({
      id: 'twin-hyper', difficulty: 2,
      gen(r) {
        const [b, bs, g] = r.pick([[12 / 13, t`\tfrac{12}{13}`, 13 / 5], [0.28, '0.28', 25 / 24], [8 / 17, t`\tfrac{8}{17}`, 17 / 15], [0.96, '0.96', 25 / 7]]);
        const tau = r.pick([3, 5, 6]);
        const ans = 2 * g * tau;
        return {
          prompt: t`A traveller flies out at $\beta = ${bs}$, turns round, and flies home at the same speed. Each leg lasts ${tau} years on the traveller’s clock, so the turnaround lies on the hyperbola “${tau} years of proper time from the departure”. How much has Earth aged at the reunion?`,
          visual: twinHyper({ b, tau, numbers: false }),
          answer: ans, units: 'yr', tol: { rel: 0.003 },
          errors: [{ value: 2 * tau, feedback: 'That is the traveller’s time. Earth’s worldline is straight and longer.' }, { value: 2 * tau / g, feedback: 'The traveller’s legs are the shorter ones: Earth’s time is γ times longer, not shorter.' }],
          hints: [t`The turnaround is where the traveller’s worldline crosses the violet hyperbola: at Earth time $t = \gamma\tau$.`, t`$\gamma = ${fmt(g, 4)}$; the return leg mirrors the outbound one.`],
          teach: 'With hyperbolae, the twins are read at a glance: each leg’s end lies on the hyperbola of its proper time.',
          explain: t`Each leg’s end is at Earth time $\gamma\tau = ${fmt(g * tau, 4)}$ yr after its start, so Earth ages $${fmt(ans, 4)}$ years while the traveller ages ${2 * tau}.`,
        };
      },
    }),
    num({
      id: 'pole-overhang', difficulty: 3,
      gen(r) {
        const [LP, LB] = r.pick([[5, 4], [10, 6], [25, 24], [26, 10]]);
        const g = LP / LB, b = Math.sqrt(1 - 1 / (g * g)), ans = LP - LB / g;
        return {
          prompt: t`A pole ${LP} m long runs through a barn ${LB} m long at exactly the speed that makes it ${LB} m in the barn’s frame ($\beta = ${fmt(b, 4)}$). In the **pole’s** frame, how far beyond the back door is the pole’s front at the moment its back passes the front door?`,
          visual: barnPicture({ LP, LB, b, numbers: false, hyper: true, caption: t`The barn’s frame (ct in metres, numbers hidden). Gold: the pole’s “now” through E1; violet: the pole’s proper length $x^2 - (ct)^2 = L_{\text{pole}}^2$.` }),
          answer: ans, units: 'm', tol: { rel: 0.003 },
          errors: [{ value: LP - LB, feedback: t`In the pole’s frame the barn is contracted to $L_{\text{barn}}/\gamma$, not ${LB} m.` }, { value: LP - LB * g, feedback: 'The barn is shorter in the pole’s frame, not longer.' }],
          hints: [t`In the pole’s frame the barn is $${LB}/\gamma$ long with $\gamma = ${LP}/${LB}$.`, t`Overhang $= L_{\text{pole}} - L_{\text{barn}}/\gamma = ${LP} - ${LB}\times${LB}/${LP}$.`],
          teach: t`In the pole’s frame the barn is contracted, so a pole that “fits” in the barn’s frame overhangs by $L_{\text{pole}}\beta^2$.`,
          explain: t`$${LP} - ${fmt(LB / g, 4)} = ${fmt(ans, 4)}$ m $= L_{\text{pole}}\beta^2$. On the diagram: the gold line meets the back door’s worldline above E2, after the front has passed it.`,
        };
      },
    }),
    mcq({
      id: 'pole-agree', difficulty: 2,
      prompt: 'In the pole-and-barn puzzle, the farmer slams both doors shut and holds them shut. Which statement is frame-independent?',
      visual: barnPicture({ ...PB, numbers: false, hyper: false, caption: 'The barn’s frame (ct in metres): doors grey, pole ends blue, the two frames’ “now” through E1.' }),
      choices: ['Whether the pole hits a closed door', 'Whether both doors were shut at the same time', 'How long the pole is', 'How long the barn is'],
      answer: 0,
      why: {
        1: 'Door shuttings at the two ends are spacelike-separated events: their order depends on the frame.',
        2: 'Its length depends on the frame; only its proper length is fixed.',
        3: 'The barn is contracted in the pole’s frame.',
      },
      hints: ['Which of these is about a single event (a place and a time), rather than a comparison of separated events?'],
      teach: 'Frames agree on events — collisions, readings of a clock beside you — and disagree about simultaneity, lengths and durations.',
      explain: 'A collision between door and pole is one event: every frame agrees whether it happens. Both doors “at once”, and both lengths, are comparisons across a distance, which depend on the frame’s “now”.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-convoy', difficulty: 3, transfer: true,
      gen(r) {
        const [b, bs] = r.pick([[0.8, '0.8'], [0.6, '0.6'], [12 / 13, t`\tfrac{12}{13}`]]);
        const L0 = r.pick([2, 3]);
        const ans = b * L0;
        return {
          prompt: t`A convoy of supply ships is ${L0} light-hours long in its own frame, with clocks synchronized in that frame. It passes a relay station at $${bs}c$. At the moment the station sees (correcting for light delay) its own clock and the rear ship’s clock both at noon, by how many hours does the lead ship’s clock lag behind noon?`,
          visual: st({ x: [-0.5 * L0, 1.6 * L0], t: [-0.9 * L0, 1.1 * L0], xlabel: 'x (light-hours)', ylabel: 't (hours)', numbers: false,
            lines: [{ pts: [[-0.6 * L0 * b, -0.6 * L0], [L0 * b, L0]], color: 'accent', label: 'rear', at: 0, dx: -8, align: 'right' }, { pts: [[L0 / gam(b) - 0.6 * L0 * b, -0.6 * L0], [L0 / gam(b) + L0 * b, L0]], color: 'accent', label: 'lead', at: 0, dx: 8 }],
            simul: [{ at: [0, 0], beta: r6(b), color: 'gold' }], caption: 'The station’s frame (c = 1). Gold: the convoy’s “now” through the rear ship at noon.' }),
          answer: ans, units: 'h', tol: { rel: 0.003 },
          hints: [t`The lag is $\beta L_0/c$.`, t`$t' = \gamma(0 - \beta\,L_0/\gamma)$.`],
          teach: 'The leading clock of a moving, internally synchronized fleet lags by βL₀/c in your frame.',
          explain: t`$${nice(b, 4)}\times${L0} = ${nice(ans, 4)}$ hours behind noon.`,
        };
      },
    }),
    num({
      id: 'cp-twin', difficulty: 2,
      gen(r) {
        const [b, bs, g] = r.pick([[0.6, '0.6', 1.25], [0.8, '0.8', 5 / 3]]);
        const tau = r.pick([4, 7]);
        const ans = 2 * g * tau;
        return {
          prompt: t`A traveller ages ${tau} years on the way out and ${tau} on the way back, at $${bs}c$ both ways. How many years pass on Earth?`,
          visual: twinHyper({ b, tau, numbers: false }),
          answer: ans, units: 'yr', tol: { rel: 0.003 },
          hints: [t`Each leg ends at Earth time $\gamma\tau$ after it starts.`],
          teach: 'Each leg of proper time τ takes γτ of Earth time.',
          explain: t`$2\gamma\tau = 2\times${fmt(g, 4)}\times${tau} = ${fmt(ans, 4)}$ years.`,
        };
      },
    }),
    mcq({
      id: 'cp-which-cut', difficulty: 2,
      prompt: 'On a diagram of a moving rod’s worldsheet, which cut across the strip has the length that every observer agrees to call the rod’s proper length?',
      visual: st({ x: [-1, 5], t: [-1, 3], numbers: false, lines: [{ pts: [[-0.6, -1], [1.8, 3]], color: 'accent' }, { pts: [[1.8, -1], [4.2, 3]], color: 'accent' }, { pts: [[-1, 0], [5, 0]], color: 'teal', width: 1.4, dash: true }], simul: [{ at: [0, 0], beta: 0.6, color: 'gold' }], caption: 'A rod moving at 0.6c (c = 1): its ends in blue, your “now” in teal, the rod’s “now” in gold.' }),
      choices: ['The cut along the rod’s own line of “now”', 'The horizontal cut along your “now”', 'The shortest cut on paper', 'Any cut: they all have the same length'],
      answer: 0,
      why: {
        1: 'Your cut gives the length in your frame, L₀/γ — a frame-dependent quantity.',
        2: 'Paper lengths are Euclidean and mean nothing in spacetime.',
        3: 'Different cuts are different sets of events and have different spacetime lengths.',
      },
      hints: ['Proper length is measured in the frame where the rod is at rest.'],
      teach: 'Proper length is the interval along the rod’s own line of simultaneity; it is the longest cut in spacetime terms.',
      explain: t`Along the gold line the two ends are simultaneous for the rod, so the interval between them is its proper length $L_0$; every observer computes that same interval. Your teal cut gives $L_0/\gamma$.`,
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, §5.4 (time dilation, length contraction, simultaneity)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 5 (the pole and barn and other paradoxes)', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'Scherr, Shaffer & Vokos (2001), Student understanding of time in special relativity, Am. J. Phys. 69, S24', url: 'https://doi.org/10.1119/1.1371254' },
  ],
});
