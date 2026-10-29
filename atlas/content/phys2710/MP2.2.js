// Time dilation, length contraction and the muon — the transverse light
// clock gives Δt = γΔτ; a light clock lying along the motion ticks in step
// with it only if its length contracts, L = L₀/γ (the worked example). The
// muon from 15 km at 0.998c told twice, with survival fractions in both
// frames and the clock bookkeeping that makes them agree (ground clocks are
// out of step in the muon's frame by vh/c²). Muon mean life: PDG 2024.
// Every number is computed here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, TAU_MU, MPC2 } from './_constants.js';
import { seg, label, frame, minkowski, r6 } from './_diagrams.js';

const t = String.raw;
const g = (b) => 1 / Math.sqrt(1 - b * b);
const TAU = TAU_MU * 1e6;                        // μs
const CK = C / 1e9;                              // km per μs
/** The muon from height h (km) at speed b: everything both frames say. */
function muon(b, h) {
  const G = g(b), T = h / (b * CK);              // flight time on Earth's clocks, μs
  return { G, T, life: G * TAU, own: T / G, L: h / G, surv: Math.exp(-T / (G * TAU)), naive: Math.exp(-T / TAU), offset: (b * h) / CK, advance: T / (G * G) };
}
const EXM = muon(0.998, 15);

// the worked example: two light clocks of proper length 1.00 m on a ship at 0.6c
const LC = { b: 0.6, L0: 1 };
LC.G = g(LC.b); LC.tr = (2 * LC.L0 / C) * LC.G * 1e9;
LC.longL0 = LC.G ** 2 * (2 * LC.L0 / C) * 1e9; LC.L = LC.L0 / LC.G;
LC.t1 = (LC.L / ((1 - LC.b) * C)) * 1e9; LC.t2 = (LC.L / ((1 + LC.b) * C)) * 1e9;

const LHC_G = 6.8e6 / MPC2;                      // a 6.8 TeV proton

/** Earth's frame (schematic, drawn at 0.6c): the muon falls from the top of the atmosphere to the ground. */
function muonEarth(caption, { simul = false } = {}) {
  const b = 0.6, h = 6, T = h / b;
  return minkowski({
    x: [-1.2, 8.2], t: [-0.6, T + 1.4], xlabel: 'height', ylabel: 'ct (Earth)', numbers: false, aspect: 'wide',
    lines: [
      { pts: [[0, -0.5], [0, T + 1.2]], color: 'accent', width: 2.6 },
      { pts: [[h, -0.5], [h, T + 1.2]], color: 'violet', width: 2.2 },
      { pts: [[h, 0], [0, T]], color: 'gold', width: 2.6 },
    ],
    simul: simul ? [{ at: [h, 0], beta: -b, color: 'warn' }] : [],
    events: [[h, 0, 'muon made', 'gold', 10, 12], [0, T, 'muon lands', 'gold', 10, -10], ...(simul ? [[0, b * h, '“now” for the muon', 'warn', -10, 10, 'right']] : [])],
    extra: { points: [label(0, 0.5, 'ground clock', 'accent', 8, 0), label(h, 0.72 * T, 'clock at the top', 'violet', 8, 0)] },
    caption: caption ?? 'Earth’s frame: the muon (gold) falls from the top of the atmosphere (violet) to the ground (blue). Drawn at 0.6c for clarity; real muons fly at 0.99c and more, nearly along the 45° light lines.',
  });
}
/** The muon's frame (schematic, at 0.6c): the muon stays put while the atmosphere rushes up past it. */
function muonFrame(caption) {
  const b = 0.6, G = 1.25, L = 6 / G, T = L / b;
  return minkowski({
    x: [-5.2, 4.2], t: [-0.6, T + 1.2], xlabel: 'height (muon frame)', ylabel: 'ct (muon)', numbers: false, aspect: 'wide',
    lines: [
      { pts: [[0, -0.5], [0, T + 1]], color: 'gold', width: 2.6 },
      { pts: [[-L - 0.3 * b, -0.3], [-L + b * (T + 1), T + 1]], color: 'accent', width: 2.4 },
      { pts: [[-0.3 * b, -0.3], [b * (T + 1), T + 1]], color: 'violet', width: 2.2 },
    ],
    events: [[0, 0, 'muon made', 'gold', -10, 14, 'right'], [0, T, 'ground arrives', 'gold', -10, -6, 'right']],
    extra: { points: [label(0, 0.56 * T, 'muon, at rest', 'gold', 8, 0), label(-L + b * 0.4 * T, 0.4 * T, 'ground', 'accent', -10, 0, 'right'), label(b * 0.75 * T, 0.75 * T, 'top of the atmosphere', 'violet', 10, 0)] },
    caption: caption ?? 'The muon’s frame: the muon (gold) is at rest and the atmosphere rushes up past it — ground (blue), top (violet) — contracted. Drawn at 0.6c for clarity.',
  });
}
/** Muon survival against distance fallen, with and without dilation (a still picture). */
const survival = (b, h, caption) => ({
  type: 'graph',
  params: {
    x: [0, Math.max(16, h * 1.1)], y: [0, 1.05], aspect: 'wide', xlabel: 'distance fallen (km)', ylabel: 'fraction still alive',
    constants: { L1: r6(b * CK * TAU), L2: r6(g(b) * b * CK * TAU) },
    curves: [{ fn: 'e^(-x/L1)', color: 'ink3', dash: true, width: 2, label: 'clock kept Earth’s time', labelAt: 0.9, labelDx: 8, labelDy: -2 }, { fn: 'e^(-x/L2)', color: 'gold', width: 2.6, label: 'with time dilation', labelAt: Math.min(10, h * 0.6), labelDx: 6, labelDy: -12 }],
    vlines: [{ x: h, label: 'ground', color: 'accent' }],
  },
  caption,
});

export default lesson({
  id: 'phys2710.MP2.2',
  title: 'Time dilation, length contraction and the muon',
  minutes: 14, difficulty: 3,
  intro: t`A clock always runs normally in its own frame; the time between two of its ticks there is its **proper time** $\Delta\tau$. Timed from a frame in which the clock moves at $v$, the same two ticks are farther apart, and an object’s length along its motion is shorter than its **proper length** $L_0$:

$$\Delta t = \gamma\,\Delta\tau, \qquad L = \frac{L_0}{\gamma}, \qquad \gamma = \frac{1}{\sqrt{1 - v^2/c^2}}$$

The first comes from a light clock moving sideways. The second is **forced**: a light clock lying *along* the motion keeps step with its sideways twin only if its length shrinks by $\gamma$. Cosmic-ray muons show both at once — and show how two frames that each see the other’s clocks running slow can agree on everything that happens.

> You met both effects in [Time dilation and length contraction](#/lesson/phys2220.R1.2), and the muon in [Light clocks, time dilation and the muon](#/lesson/gr.S02.i). Here: why contraction must happen, and how the muon’s two stories fit together, clock by clock.`,
  symbols: [
    { tex: '\\Delta\\tau', text: 'proper time: the time between two events at the same place in the clock’s own frame, read by the one clock present at both, in s' },
    { tex: '\\Delta t', text: t`the time between the same two events in a frame where the clock moves at speed $v$, in s — always at least $\Delta\tau$` },
    { tex: 'L_0', text: 'proper length: an object’s length in its own rest frame, in m' },
    { tex: 'L', text: 'its length along the motion in a frame where it moves, both ends located at the same moment of that frame, in m' },
    { tex: '\\gamma', text: t`the Lorentz factor: 1.25 at $0.6c$, ${fmt(g(0.998), 4)} at $0.998c$` },
    { tex: 'v', text: 'the speed of the clock or object relative to the observer, in m/s' },
    { tex: 'c', text: t`the speed of light, $299\,792\,458$ m/s` },
  ],
  why: 'Accelerators, cosmic-ray detectors and satellite navigation all correct for these factors, and the bookkeeping between frames — who sees whose clock slow, and why both are right — is what the spacetime diagrams of lesson MP2.4 make visible.',
  visual: {
    type: 'graph',
    title: 'One muon, two stories, one survival rate',
    lead: t`Muons made by cosmic rays high in the atmosphere live $\tau = ${fmt(TAU, 5)}\ \mu\text{s}$ on average in their own frame. Choose their speed and the height where they are made. The gold curve is the fraction still alive after falling a given distance; the dashed one is what would happen if their clocks kept Earth’s time.`,
    tasks: [
      'At 0.998c from 15 km the fall takes 50.1 μs on Earth’s clocks — 23 mean lives — yet 23.6% survive: in Earth’s frame each lives γτ = 34.8 μs.',
      'Read the muon’s own story in the readout: 15 km of air is only 0.948 km thick in its frame and passes in 3.17 μs of its own time. Same survival, by a different route.',
      'Slow them to 0.99c: γ falls to 7.1 and only 3.9% reach the ground. Without time dilation, about one in ten billion would.',
    ],
    params: {
      x: [0, 20], y: [0, 1.05], aspect: 'wide', xlabel: 'distance fallen (km)', ylabel: 'fraction still alive',
      constants: { tau: r6(TAU), cc: r6(CK) },
      sliders: [
        { key: 'b', label: 'Muon speed $v/c$', min: 0.95, max: 0.9995, step: 0.0005, value: 0.998, unit: '', explain: 'Real cosmic-ray muons span a range of speeds; most that reach the ground move faster than 0.99c.' },
        { key: 'h', label: 'Height where they are made', min: 5, max: 20, step: 0.5, value: 15, unit: '\\mathrm{km}', explain: 'Cosmic-ray protons hit air nuclei around 10–20 km up, making pions that decay into muons.' },
      ],
      curves: [{ fn: 'e^(-x/(b*cc*tau))', color: 'ink3', dash: true, width: 2 }, { fn: 'e^(-x*sqrt(1 - b^2)/(b*cc*tau))', color: 'gold', width: 2.6 }],
      vlines: [{ x: 'h', label: 'ground', color: 'accent' }],
      points: [{ x: 'h', y: 'e^(-h*sqrt(1 - b^2)/(b*cc*tau))', color: 'gold', r: 5 }],
      readouts: [
        { label: t`$\gamma$`, expr: '1/sqrt(1 - b^2)', digits: 4 },
        { label: 'fall on Earth’s clocks (μs)', expr: 'h/(b*cc)', digits: 4 },
        { label: t`life in Earth’s frame, $\gamma\tau$ (μs)`, expr: 'tau/sqrt(1 - b^2)', digits: 4 },
        { label: 'fall on the muon’s clock (μs)', expr: 'h*sqrt(1 - b^2)/(b*cc)', digits: 4 },
        { label: 'air in the muon’s frame (km)', expr: 'h*sqrt(1 - b^2)', digits: 4 },
        { label: 'reach the ground', expr: 'e^(-h*sqrt(1 - b^2)/(b*cc*tau))', digits: 3 },
        { label: 'without dilation', expr: 'e^(-h/(b*cc*tau))', digits: 3 },
      ],
    },
    caption: t`Exponential decay of muons all made at one height and moving at one speed, ignoring the energy they lose to the air on the way (a few GeV, which matters for slow ones). Real showers make muons at many heights and speeds; Frisch and Smith’s 1963 measurement selected one narrow band of speeds.`,
  },
  example: {
    prompt: t`A spaceship carries two identical light clocks: mirrors $L_0 = ${LC.L0.toFixed(2)}$ m apart in the ship’s frame, one set across the direction of motion and one along it, both starting from a shared mirror at one corner. The ship passes a station at $${LC.b}c$. In the station’s frame the sideways clock ticks once every $\gamma\,(2L_0/c)$. Suppose the clock lying along the motion kept its length $L_0$ in the station’s frame: how long would its tick last? What length does the first postulate demand instead?`,
    visual: minkowski({
      x: [-0.5, 3.4], t: [-0.3, 3.4], xlabel: 'x (m, station frame)', ylabel: 'ct (m)', aspect: 'wide',
      lines: [
        { pts: [[-0.6 * 0.3, -0.3], [0.6 * 3.3, 3.3]], color: 'accent', width: 2.4, label: 'rear mirror', at: 0, dx: -10, dy: 40, align: 'right' },
        { pts: [[LC.L - 0.6 * 0.3, -0.3], [LC.L + 0.6 * 3.3, 3.3]], color: 'accent', width: 2.4, label: 'front mirror', at: 0, dx: 10, dy: 30 },
        { pts: [[0, 0], [LC.L / (1 - LC.b), LC.L / (1 - LC.b)]], color: 'gold', width: 2, arrow: true },
        { pts: [[LC.L / (1 - LC.b), LC.L / (1 - LC.b)], [LC.L / (1 - LC.b) - LC.L / (1 + LC.b), LC.L / (1 - LC.b) + LC.L / (1 + LC.b)]], color: 'gold', width: 2, arrow: true },
      ],
      events: [[0, 0, 'pulse leaves', 'gold', 10, 10], [LC.L / (1 - LC.b), LC.L / (1 - LC.b), 'reaches the front', 'gold', 10, 6], [LC.L / (1 - LC.b) - LC.L / (1 + LC.b), LC.L / (1 - LC.b) + LC.L / (1 + LC.b), 'back: one tick', 'gold', -10, 0, 'right']],
      caption: 'The clock lying along the motion, in the station’s frame, with its contracted length of 0.8 m and time drawn as ct in metres. The pulse (gold) chases the front mirror for a long time and meets the rear mirror quickly.',
    }),
    steps: [
      { label: 'The sideways clock', text: t`$\gamma = 1/\sqrt{1 - 0.36} = 1.25$, so it ticks every $1.25\times\dfrac{2(1.00\ \text{m})}{c} = ${fmt(LC.tr, 4)}$ ns in the station’s frame.` },
      { label: 'Along the motion: out', text: t`The pulse chases the front mirror, which runs ahead at $v$: the gap closes at $c - v$, taking $\dfrac{L}{c - v}$.` },
      { label: 'And back', text: t`The rear mirror rushes to meet it: $\dfrac{L}{c + v}$. Together $\dfrac{2Lc}{c^2 - v^2} = \gamma^2\,\dfrac{2L}{c}$.` },
      { label: 'If nothing contracted', text: t`With $L = L_0$ the tick is $1.25^2\times6.671$ ns $= ${fmt(LC.longL0, 4)}$ ns — longer than the sideways clock’s ${fmt(LC.tr, 4)} ns. Yet in the ship the two pulses return to the shared corner mirror together: that is one event at one place, and every frame must agree it happens.` },
      { label: 'So it must shrink', text: t`Set $\gamma^2\,\dfrac{2L}{c} = \gamma\,\dfrac{2L_0}{c}$: $L = \dfrac{L_0}{\gamma} = ${fmt(LC.L, 3)}$ m. Check: out $\dfrac{0.8\ \text{m}}{0.4c} = ${fmt(LC.t1, 4)}$ ns, back $\dfrac{0.8\ \text{m}}{1.6c} = ${fmt(LC.t2, 4)}$ ns, total ${fmt(LC.t1 + LC.t2, 4)} ns ✓.` },
      { label: 'Sense check', text: t`Only the length along the motion changes. The sideways clock’s mirror gap must be the same in both frames — otherwise a sideways rod passing another would be shorter by each frame’s account, and both could not be right — which is why it gave a clean factor of $\gamma$.` },
    ],
    answer: t`Unshrunk, the tick would last ${fmt(LC.longL0, 4)} ns instead of ${fmt(LC.tr, 4)} ns; the postulate requires $L = L_0/\gamma = ${fmt(LC.L, 2)}$ m.`,
  },
  practice: [
    num({
      id: 'optical-clock', difficulty: 2,
      gen(r) {
        const v = r.pick([4, 6, 10]);
        const frac = (v * v) / (2 * C * C);
        return {
          prompt: t`In 2010 physicists at NIST compared two aluminium-ion clocks, one of whose ions was set moving at about ${v} m/s. At such speeds a moving clock falls behind by the fraction $\gamma - 1 \approx \dfrac{v^2}{2c^2}$ of the elapsed time. What fraction is that? (A pure number: type, for example, \`3e-9\`.)`,
          answer: frac, tol: { rel: 0.01 },
          errors: [{ value: v / C, feedback: t`The effect is second order: $v^2/2c^2$, not $v/c$.` }, { value: (v * v) / (C * C), feedback: t`Keep the factor $\tfrac12$: $\gamma - 1 \approx \tfrac12 v^2/c^2$.` }],
          hints: [t`$\dfrac{v^2}{2c^2} = \dfrac{${v * v}}{2\times(2.998\times10^{8})^2}$.`],
          teach: t`At everyday speeds time dilation is the tiny fraction $v^2/2c^2$ — yet modern optical clocks can measure it.`,
          explain: t`$\dfrac{${v}^2}{2\,(2.998\times10^8)^2} = ${tex(frac, 3)}$. The NIST clocks resolve frequency shifts below $10^{-17}$, so they saw time dilation at the speed of a jogger or a bicycle — and, in the same paper, gravity’s effect on clocks raised by 33 cm.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 12], y: [0, 8.5e-16 * 1e16], aspect: 'wide', xlabel: 'speed of the clock (m/s)', ylabel: 'fraction lost (relative)', yticks: 0,
              curves: [{ fn: `x^2/(2*${r6(C * C)})*1e16`, color: 'accent', width: 2.6, label: 'v²/2c²', labelAt: 10.6, labelDx: -50, labelDy: -10 }],
              vlines: [{ x: v, label: `${v} m/s`, color: 'gold' }],
            },
            caption: 'How much a moving clock falls behind, against its speed: a parabola. The vertical scale is left unnumbered.',
          },
        };
      },
    }),
    num({
      id: 'survival', difficulty: 2,
      gen(r) {
        const b = r.pick([0.99, 0.995, 0.999]), h = r.pick([10, 12, 15]);
        const M = muon(b, h);
        return {
          prompt: t`Muons are made ${h} km above the ground and fall straight down at $${b}c$. Their mean life at rest is $${fmt(TAU, 5)}\ \mu\text{s}$, and the fraction alive after a time $t$ of their own is $e^{-t/\tau}$. What fraction reach the ground?`,
          answer: M.surv, tol: { rel: 0.01 },
          errors: [{ value: M.naive, feedback: 'That uses Earth’s time for the muon’s clock. In Earth’s frame each muon lives γ times longer (or, in its frame, the trip is γ times shorter).' }],
          hints: [t`On Earth’s clocks the fall takes $t = h/v = ${fmt(M.T, 4)}\ \mu\text{s}$; on the muon’s own clock it takes $t/\gamma$.`, t`$\gamma = ${fmt(M.G, 4)}$, so the fraction is $e^{-${fmt(M.own, 4)}/${fmt(TAU, 4)}}$.`],
          teach: t`Survival depends on the muon’s own elapsed time, $e^{-\Delta\tau/\tau}$ with $\Delta\tau = \Delta t/\gamma$.`,
          explain: t`$\Delta\tau = ${fmt(M.T, 4)}/${fmt(M.G, 4)} = ${fmt(M.own, 4)}\ \mu\text{s}$, so $e^{-${fmt(M.own, 4)}/${fmt(TAU, 4)}} = ${fmt(M.surv, 3)}$, or ${fmt(100 * M.surv, 3)}%. Without dilation it would be $${tex(M.naive, 2)}$.`,
          visual: muonEarth(),
        };
      },
    }),
    num({
      id: 'muon-frame', difficulty: 2,
      gen(r) {
        const b = r.pick([0.99, 0.995, 0.998, 0.999]), h = r.pick([10, 12, 15]);
        const M = muon(b, h);
        return {
          prompt: t`Ride with a muon made ${h} km up (in Earth’s frame) and falling at $${b}c$. In **its** frame, how thick is that layer of atmosphere as it rushes past? Answer in km.`,
          answer: M.L, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: h * M.G, feedback: t`Moving lengths are *shorter*: divide by $\gamma$.` }, { value: h, feedback: 'That is its proper length, measured in Earth’s frame where the air is at rest. For the muon, the air moves.' }],
          hints: [t`The atmosphere is at rest in Earth’s frame, so ${h} km is its proper length.`, t`$L = L_0/\gamma$ with $\gamma = ${fmt(M.G, 4)}$.`],
          teach: 'In the muon’s frame its clock is normal; the atmosphere is contracted instead, so it passes in less than a mean life.',
          explain: t`$L = ${h}/${fmt(M.G, 4)} = ${fmt(M.L, 3)}$ km, which rushes past at $${b}c$ in $${fmt(M.own, 3)}\ \mu\text{s}$ of the muon’s time — exactly the proper time Earth’s frame computes. Same survival, ${fmt(100 * M.surv, 3)}%, by a different route.`,
          visual: muonFrame(),
        };
      },
    }),
    num({
      id: 'ground-clock', difficulty: 3,
      gen(r) {
        const b = r.pick([0.99, 0.995, 0.998]), h = r.pick([10, 15]);
        const M = muon(b, h);
        return {
          prompt: t`A muon made ${h} km up falls at $${b}c$ ($\gamma = ${fmt(M.G, 4)}$); the fall lasts $${fmt(M.own, 4)}\ \mu\text{s}$ on its own clock. In the **muon’s** frame the ground clock is the one that moves, so it runs slow by $\gamma$. How much does the ground clock advance during the fall, in the muon’s frame? Answer in μs.`,
          answer: M.advance, units: 'μs', tol: { rel: 0.01 },
          errors: [{ value: M.own * M.G, feedback: t`A moving clock runs *slow*: divide the muon’s ${fmt(M.own, 3)} μs by $\gamma$, do not multiply.` }, { value: M.own, feedback: 'That is the muon’s own time. The ground clock moves in the muon’s frame, so it ticks less.' }],
          hints: [t`In the muon’s frame the ground clock moves at $${b}c$, so it advances $\Delta\tau_{\text{muon}}/\gamma$.`, t`$${fmt(M.own, 4)}/${fmt(M.G, 4)}$.`],
          teach: 'Time dilation is reciprocal: in the muon’s frame the ground clocks are the moving ones, and they run slow by γ.',
          explain: t`$${fmt(M.own, 4)}/${fmt(M.G, 4)} = ${fmt(M.advance, 3)}\ \mu\text{s}$. Yet both frames agree the ground clock reads $${fmt(M.T, 4)}\ \mu\text{s}$ when the muon lands — one event. So in the muon’s frame the ground clock must already have read $${fmt(M.T, 4)} - ${fmt(M.advance, 3)} = ${fmt(M.offset, 4)}\ \mu\text{s}$ when the muon was made: exactly $vh/c^2$, the amount by which clocks synchronized in Earth’s frame are out of step in the muon’s.`,
          visual: muonEarth('Earth’s frame, drawn at 0.6c for clarity. The dashed orange line is the muon’s “now” at its creation: it meets the ground clock’s worldline well above the bottom of the picture — in the muon’s frame that clock is already far ahead.', { simul: true }),
        };
      },
    }),
    mcq({
      id: 'reciprocity', difficulty: 3,
      prompt: t`In the muon’s frame the ground clock moves, so it runs slow by $\gamma = ${fmt(EXM.G, 4)}$: during the muon’s ${fmt(EXM.own, 3)} μs trip it advances only ${fmt(EXM.advance, 2)} μs. Yet Earth says the ground clock reads ${fmt(EXM.T, 3)} μs when the muon lands, and the muon agrees about what a clock beside it reads. How can both be right?`,
      visual: muonFrame(),
      choices: [
        t`In the muon’s frame the ground clock already read ${fmt(EXM.offset, 3)} μs when the muon was made: clocks synchronized in Earth’s frame are not synchronized in the muon’s`,
        'The ground clock speeds up as the muon approaches it',
        'Only the muon’s clock is really slowed; the ground clock just looks slow to the muon because of light delays',
        'The muon’s clock jumps forward when it lands',
      ],
      answer: 0,
      why: {
        1: 'A clock’s rate in a given frame depends only on its speed in that frame; nothing changes as the muon approaches.',
        2: 'Time dilation is symmetric and real, not a light-delay illusion: measured with synchronized clocks, each frame finds the other’s clocks slow.',
        3: 'The muon’s clock ticks steadily; no clock jumps. What differs between frames is which distant events count as simultaneous.',
      },
      hints: ['Both frames agree on what the ground clock reads at landing — that is a single event. Where can the difference come from?', t`Clocks synchronized in Earth’s frame are offset by $vh/c^2$ in the muon’s.`],
      teach: 'Reciprocal time dilation is consistent because the frames disagree about simultaneity: in the muon’s frame Earth’s clocks were never in step.',
      explain: t`In the muon’s frame the ground clock started at $vh/c^2 = ${fmt(EXM.offset, 3)}\ \mu\text{s}$, then advanced ${fmt(EXM.advance, 2)} μs: ${fmt(EXM.offset + EXM.advance, 4)} μs, matching Earth’s ${fmt(EXM.T, 4)} μs. Each frame sees the other’s clocks slow, and the relativity of simultaneity keeps the accounts consistent.`,
    }),
    num({
      id: 'pancake', difficulty: 2, transfer: true,
      gen(r) {
        const [where, G, d, what] = r.pick([['Brookhaven’s RHIC collider', 107, 2 * 1.2 * Math.cbrt(197), 'gold'], ['CERN’s LHC', 2900, 2 * 1.2 * Math.cbrt(208), 'lead']]);
        return {
          prompt: t`At ${where}, ${what} nuclei about ${fmt(d, 3)} fm across collide head on, each moving with $\gamma \approx ${G}$. In the laboratory, how thick is each nucleus along its direction of motion? Answer in fm.`,
          answer: d / G, units: 'fm', tol: { rel: 0.01 },
          errors: [{ value: d * G, feedback: t`Divide by $\gamma$: lengths along the motion shrink.` }],
          hints: [t`The nucleus’s proper diameter is ${fmt(d, 3)} fm; along the beam it is shortened by $\gamma$.`],
          teach: 'Ultrarelativistic nuclei are flattened along their motion into thin discs, while their width across the beam is unchanged.',
          explain: t`$${fmt(d, 3)}/${G} = ${fmt(d / G, 3)}$ fm: the nuclei meet as thin discs, ${fmt(d / G, 2)} fm thick but still ${fmt(d, 3)} fm wide. Their collision makes the quark–gluon plasma studied at both machines. (A nucleus is a fuzzy ball, so “diameter” here means about $2\times1.2\,A^{1/3}$ fm.)`,
          visual: {
            type: 'graph',
            params: frame([-4, 12], [-3, 3], {
              aspect: 'wide',
              shade: [{ fn: 'sqrt(max(0, 4 - x^2))', lower: '-sqrt(max(0, 4 - x^2))', from: -2, to: 2, color: 'warn', alpha: 0.45 }, { fn: '2*sqrt(max(0, 1 - ((x - 8)/0.18)^2))', lower: '-2*sqrt(max(0, 1 - ((x - 8)/0.18)^2))', from: 7.82, to: 8.18, color: 'warn', alpha: 0.6 }],
              arrows: [{ from: [8.6, 0], to: [10.8, 0], color: 'gold', width: 2.2, label: 'nearly c', labelDx: -60, labelDy: -14 }],
              points: [label(0, -2, 'at rest: a sphere', 'ink2', 0, 16, 'center'), label(8, -2, 'in the collider: a disc', 'ink2', 0, 16, 'center')],
            }),
            caption: 'A nucleus at rest and the same nucleus in the collider. The disc is drawn far thicker than it really is.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-atlas', difficulty: 2, transfer: true,
      prompt: t`A proton in CERN’s Large Hadron Collider has $\gamma = ${fmt(LHC_G, 4)}$ (an energy of 6.8 TeV). The ATLAS detector it flies through is 46 m long. How long is ATLAS in the proton’s frame? Answer in mm.`,
      answer: (46 / LHC_G) * 1e3, units: 'mm', tol: { rel: 0.01 },
      errors: [{ value: 46 * LHC_G * 1e3, feedback: t`Moving lengths are shorter: divide by $\gamma$.` }],
      hints: [t`ATLAS is at rest in the laboratory: 46 m is its proper length.`],
      teach: 'A detector at rest in the lab is contracted by γ in the frame of the particle crossing it.',
      explain: t`$46\ \text{m}/${fmt(LHC_G, 4)} = ${fmt((46 / LHC_G) * 1e3, 3)}$ mm. The proton crosses it in $${fmt((46 / LHC_G) / C * 1e12, 3)}$ ps of its own time, while lab clocks record $46\ \text{m}/c = ${fmt((46 / C) * 1e9, 3)}$ ns.`,
      visual: {
        type: 'graph',
        params: frame([-1, 13], [-2.4, 2.4], {
          aspect: 'wide',
          shade: [{ fn: '1.6', lower: '-1.6', from: 1, to: 11, color: 'accent', alpha: 0.18 }],
          curves: [seg(1, -1.6, 11, -1.6, 'accent', 2), seg(1, 1.6, 11, 1.6, 'accent', 2), seg(1, -1.6, 1, 1.6, 'accent', 2), seg(11, -1.6, 11, 1.6, 'accent', 2), seg(-0.8, 0, 12.8, 0, 'gold', 1.4, true)],
          arrows: [{ from: [-0.6, 0.4], to: [0.8, 0.4], color: 'gold', width: 2.2, label: 'proton', labelDx: -54, labelDy: -14 }],
          points: [label(6, -1.6, 'ATLAS, 46 m long in the laboratory', 'ink2', 0, 16, 'center')],
        }),
        caption: 'The ATLAS detector, schematic, with a proton entering along the beam line.',
      },
    }),
    num({
      id: 'cp-long-clock', difficulty: 3,
      prompt: t`A light clock lies along the motion of a ship moving at $0.8c$; its mirrors are 1.50 m apart in the ship’s frame. In the frame of a station the ship passes, how long does the light take to get from the rear mirror to the front one? Answer in ns.`,
      answer: (1.5 * 0.6) / (0.2 * C) * 1e9, units: 'ns', tol: { rel: 0.01 },
      errors: [{ value: 1.5 / (0.2 * C) * 1e9, feedback: t`In the station’s frame the clock is contracted: use $L = L_0/\gamma = 0.90$ m.` }, { value: (1.5 * 0.6) / C * 1e9, feedback: t`The front mirror runs away from the light: the gap closes at $c - v$, not $c$.` }],
      hints: [t`At $0.8c$, $\gamma = 5/3$, so the clock is $1.50/\gamma = 0.90$ m long in the station’s frame.`, t`The pulse chases the front mirror: the gap closes at $c - v = 0.2c$.`],
      teach: 'In a frame where a light clock moves along its length, the outward leg takes L/(c − v) and the return L/(c + v), with L contracted.',
      explain: t`$\dfrac{0.90\ \text{m}}{0.2\times2.998\times10^8\ \text{m/s}} = ${fmt((0.9 / (0.2 * C)) * 1e9, 3)}$ ns out, and $\dfrac{0.90}{1.8c} = ${fmt((0.9 / (1.8 * C)) * 1e9, 3)}$ ns back: one tick of ${fmt((0.9 / (0.2 * C) + 0.9 / (1.8 * C)) * 1e9, 4)} ns, which is $\gamma\times(2L_0/c)$ — in step with a sideways clock, as the first postulate demands.`,
      visual: {
        type: 'graph',
        params: frame([-0.6, 4.2], [-1, 1.4], {
          aspect: 'wide',
          curves: [seg(0.4, -0.6, 0.4, 0.6, 'ink', 4), seg(3.2, -0.6, 3.2, 0.6, 'ink', 4), seg(0.5, 0, 3.1, 0, 'gold', 1.6, true)],
          arrows: [{ from: [1.2, 0.95], to: [2.4, 0.95], color: 'violet', width: 2.2, label: '0.8c', labelDx: 8, labelDy: 0 }],
          points: [label(0.4, -0.6, 'rear mirror', 'ink2', 0, 16, 'center'), label(3.2, -0.6, 'front mirror', 'ink2', 0, 16, 'center'), label(1.8, 0, 'light pulse', 'gold', 0, -12, 'center')],
        }),
        caption: 'A light clock lying along the direction of motion. Not to scale.',
      },
    }),
    num({
      id: 'cp-decay-length', difficulty: 2,
      prompt: t`Cosmic-ray muons arriving at sea level typically have $\gamma \approx 40$ (energies of a few GeV). With a mean life of $${fmt(TAU, 5)}\ \mu\text{s}$ at rest, what is their mean decay length in Earth’s frame, $\gamma v\tau$? Answer in km.`,
      answer: 40 * Math.sqrt(1 - 1 / 1600) * CK * TAU, units: 'km', tol: { rel: 0.01 },
      errors: [{ value: Math.sqrt(1 - 1 / 1600) * CK * TAU, feedback: t`That leaves out time dilation: multiply by $\gamma$.` }],
      hints: [t`At $\gamma = 40$, $v/c = \sqrt{1 - 1/\gamma^2} = ${fmt(Math.sqrt(1 - 1 / 1600), 6)}$.`, t`$\gamma v\tau = 40\times${fmt(Math.sqrt(1 - 1 / 1600), 6)}\times(0.2998\ \text{km}/\mu\text{s})\times${fmt(TAU, 5)}\ \mu\text{s}$.`],
      teach: 'An unstable particle’s mean decay length in the lab is γvτ, which grows without limit as v → c.',
      explain: t`$40\times${fmt(Math.sqrt(1 - 1 / 1600), 5)}\times0.2998\times${fmt(TAU, 5)} = ${fmt(40 * Math.sqrt(1 - 1 / 1600) * CK * TAU, 3)}$ km — more than the whole height of the atmosphere, which is why such muons pour through it and even reach mines deep underground.`,
      visual: survival(Math.sqrt(1 - 1 / 1600), 15, 'Muons at γ = 40 (gold) and, for comparison, muons whose clocks kept Earth’s time (dashed), falling from 15 km.'),
    }),
  ],
  sources: [
    { label: 'Frisch & Smith (1963), Measurement of the relativistic time dilation using μ-mesons, Am. J. Phys. 31, 342', url: 'https://doi.org/10.1119/1.1969508' },
    { label: 'Chou, Hume, Rosenband & Wineland (2010), Optical clocks and relativity, Science 329, 1630', url: 'https://doi.org/10.1126/science.1192720' },
    { label: 'Particle Data Group (2024): muon mean life', url: 'https://pdg.lbl.gov/' },
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 4 (the muon in two frames)', url: 'https://www.eftaylor.com/spacetimephysics/' },
  ],
});
