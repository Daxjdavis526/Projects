// Einstein's postulates — why Galileo's transformation had to go: Maxwell's
// c names no frame; the ether hypothesis; the evidence (aberration,
// Michelson–Morley, de Sitter's binary-star argument, CERN's pions); the two
// postulates; and what they make of an "observer": a lattice of clocks
// synchronized by Einstein's light-signal rule. The train-and-lightning
// argument and the Michelson–Morley numbers are in phys2220.R1.1, not
// repeated here. Every number is computed here.
import { lesson, mcq, num, match, order } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, LY } from './_constants.js';
import { seg, label, frame, circle, disc, minkowski, r6 } from './_diagrams.js';

const t = String.raw;
const AS = 206264.80625;                         // arcseconds per radian
const DAY = 86400;
// de Sitter's binary: 1000 ly away, orbital speed 100 km/s, period 3 days
const DS = { d: 1000, V: 100, P: 3 };
DS.A = (DS.d * LY * DS.V * 1e3) / (C * C * DS.P * DAY);   // arrival-time shift, in periods, per unit κ
// the worked example: synchronizing a lunar lander
const EX = { t3: 2.564, tR: 1.5 };
EX.t2 = EX.t3 / 2; EX.off = EX.tR - EX.t2; EX.d = (C * EX.t3) / 2;

/** Earth's radar pulse out to a remote clock and back, on a diagram in light-seconds. */
function radar(dist, t3, caption, numbers = false) {
  const top = t3 * 1.12;
  return minkowski({
    x: [-0.25 * dist, 1.3 * dist], t: [-0.08 * t3, top], xlabel: 'distance from Earth', ylabel: 'Earth time', numbers, aspect: 'wide',
    lines: [
      { pts: [[0, -0.1 * t3], [0, top]], color: 'accent', width: 2.6 },
      { pts: [[dist, -0.1 * t3], [dist, top]], color: 'violet', width: 2.6 },
      { pts: [[0, 0], [dist, t3 / 2]], color: 'gold', width: 2, arrow: true },
      { pts: [[dist, t3 / 2], [0, t3]], color: 'gold', width: 2, arrow: true },
    ],
    events: [[0, 0, 'pulse sent', 'accent2', -10, 12, 'right'], [dist, t3 / 2, 'reflected', 'gold', 10, 0], [0, t3, 'echo back', 'accent2', -10, 0, 'right']],
    extra: { points: [label(0, top * 0.94, 'Earth', 'accent', 8, 0), label(dist, top * 0.94, 'remote clock', 'violet', 8, 0)] },
    caption: caption ?? 'Earth (blue) and a distant clock (violet), both at rest; the radar pulse (gold) runs out and back at 45°. Not to scale.',
  });
}

/** A binary star whose two members swing toward and away from Earth. */
const binary = {
  type: 'graph',
  params: frame([-1.2, 9.4], [-1.8, 1.8], {
    aspect: 'wide',
    shade: [disc(7.2, 0.9, 0.28, 'warn', 0.8), disc(7.2, -0.9, 0.2, 'gold', 0.8), disc(0, 0, 0.45, 'accent', 0.5)],
    curves: [circle(7.2, 0, 0.9, 'ink3', 1.2, true), seg(0.6, 0, 6.2, 0, 'ink3', 1.2, true)],
    arrows: [{ from: [7.2, 0.9], to: [6.2, 0.9], color: 'warn', width: 2.2, label: 'approaching', labelDx: -78, labelDy: -12 }, { from: [7.2, -0.9], to: [8.2, -0.9], color: 'gold', width: 2.2, label: 'receding', labelDx: -10, labelDy: 18 }],
    points: [label(0, -0.45, 'Earth', 'accent', 0, 14, 'center'), label(3.4, 0, 'light, d light-years', 'ink3', 0, -12, 'center')],
  }),
  caption: 'A binary star: as its members orbit, one swings toward Earth while the other swings away. Hugely out of scale — real binaries are thousands of light-years off and a few million kilometres across.',
};

export default lesson({
  id: 'phys2710.MP2.1',
  title: 'Einstein’s postulates',
  minutes: 12, difficulty: 2,
  intro: t`Galileo’s relativity says the laws of mechanics are the same in every inertial frame. Changing frames is the **Galilean transformation**, and under it velocities simply subtract:

$$x' = x - vt, \qquad t' = t \qquad\Longrightarrow\qquad u' = u - v$$

Maxwell’s equations broke the pattern: they predict light moving at $c = 1/\sqrt{\mu_0\varepsilon_0}$ without naming any frame, while Galileo’s rule would give it $c - v$ in a frame moving at $v$. Either Maxwell’s equations hold in only one special frame — the “ether” — or Galileo’s transformation is wrong. Every search for the ether failed, and in 1905 Einstein took the second road with two postulates: **(1) the laws of physics are the same in every inertial frame; (2) light in vacuum moves at $c$ in every inertial frame, whatever the motion of its source.**

> You met the postulates and the train-and-lightning argument in [The postulates and simultaneity](#/lesson/phys2220.R1.1). This lesson weighs the evidence that forced them, and what “observer” and “time” must mean once you accept them.`,
  symbols: [
    { tex: 'x,\\ t', text: 'where and when an event happens in frame $S$, in m and s' },
    { tex: "x',\\ t'", text: t`the same event’s position and time in frame $S'$, which moves at velocity $v$ along the $x$ axis of $S$ (origins together at $t = 0$)` },
    { tex: 'v', text: t`the velocity of frame $S'$ relative to $S$, in m/s` },
    { tex: "u,\\ u'", text: t`the velocity of some object along $x$, measured in $S$ and in $S'$` },
    { tex: 'c', text: t`the speed of light in vacuum, $299\,792\,458$ m/s — exact, because since 1983 the metre is *defined* as the distance light travels in $1/299\,792\,458$ s` },
  ],
  why: 'Everything else in this module — time dilation, the Lorentz transformation, E = mc² — is derived from these two sentences; and radar, GPS and the definition of the metre lean on the second every day.',
  visual: {
    type: 'graph',
    title: 'If light kept its source’s speed: de Sitter’s binary stars',
    lead: t`In 1913 Willem de Sitter turned binary stars into a test of the second postulate. Suppose light left a star at $c + \kappa v$, where $v$ is the star’s velocity along our line of sight. Light from the approaching part of the orbit would then outrun light from the receding part on its long way to Earth. The blue curve is the velocity we would *see* against the time its light *arrives*; the dashed curve is the truth.`,
    tasks: [
      'At κ = 0 — Einstein’s postulate — the curve is the clean, repeating orbit (dashed).',
      'Raise κ to 0.002: the curve leans over — light from the receding half arrives late, from the approaching half early.',
      'Past κ ≈ 0.004 the curve folds back on itself: we would see one star in several places at once. Real binaries show clean orbits, so κ must be far smaller.',
    ],
    params: {
      x: [0, 3], y: [-1.5, 1.7], aspect: 'wide', xlabel: 'arrival time at Earth (orbital periods)', ylabel: 'radial velocity seen (× 100 km/s)',
      constants: { A: r6(DS.A) },
      sliders: [{ key: 'k', label: 'Share $\\kappa$ of the source’s speed that light inherits', min: 0, max: 0.02, step: 0.0005, value: 0, unit: '', explain: 'Light would leave the star at $c + \\kappa v$. Einstein’s second postulate says $\\kappa = 0$.' }],
      curves: [
        { fn: 'sin(2*pi*x)', color: 'ink3', dash: true, width: 1.4 },
        { param: ['t + A*k*sin(2*pi*t)', 'sin(2*pi*t)'], t: [-1, 4], color: 'accent', width: 2.4 },
      ],
      readouts: [
        { label: 'largest arrival-time shift (days)', expr: `${DS.P}*A*k`, digits: 3 },
        { label: t`fold parameter $2\pi A\kappa$ (the curve folds above 1)`, expr: '2*pi*A*k', digits: 3 },
      ],
    },
    caption: t`One star of a binary ${DS.d} light-years away, orbiting at ${DS.V} km/s with a ${DS.P}-day period (illustrative numbers): its velocity along the line of sight (positive: receding) against the arrival time of its light, if light left it at $c + \kappa v$. Here $A = dV/(c^2P) = ${fmt(DS.A, 3)}$. Gas around a star absorbs and re-emits light, which would mask the effect in visible light; X-ray binaries avoid that and give $\kappa < 2\times10^{-9}$.`,
  },
  example: {
    prompt: t`Mission control wants a lander on the Moon to keep Earth’s time. A radio pulse leaves Earth when the Earth clock reads $t_1 = 0$. The lander’s transponder bounces it straight back and records that its own clock read ${EX.tR.toFixed(3)} s at that instant. The echo is back on Earth at $t_3 = ${EX.t3}$ s. Is the lander’s clock synchronized with Earth’s? How far away is the lander? (Treat the Earth and the Moon as at rest relative to each other.)`,
    visual: radar(EX.t3 / 2, EX.t3, 'Earth (blue) and the lander (violet) at rest, in light-seconds and seconds: the pulse (gold) goes out and comes back at 45°. Not to scale.', false),
    steps: [
      { label: 'Einstein’s rule', text: t`By the second postulate light takes as long to go out as to come back, so in Earth’s frame the reflection happened halfway between sending and receiving: $t_2 = \tfrac12(t_1 + t_3) = ${EX.t2.toFixed(3)}$ s.` },
      { label: 'Compare the clocks', text: t`At that event the lander’s clock read ${EX.tR.toFixed(3)} s, so it runs ${EX.off.toFixed(3)} s **ahead** of Earth’s. Set it back by ${EX.off.toFixed(3)} s and the two clocks are synchronized in Earth’s frame.` },
      { label: 'The distance', text: t`$d = \tfrac12 c\,(t_3 - t_1) = \tfrac12(2.998\times10^{8}\ \text{m/s})(${EX.t3}\ \text{s}) = ${tex(EX.d, 4)}$ m, about ${Math.round(EX.d / 1e6) * 1000} km: the Moon’s distance.` },
      { label: 'What the rule assumes', text: t`You cannot time light over a one-way trip with a single clock: you would need an already synchronized clock at the far end — the very thing you are setting up. So Einstein’s rule *defines* simultaneity at a distance, and the postulates guarantee it is consistent: clocks synchronized this way agree with each other in pairs, all across the frame. Every measurement of light’s round-trip speed gives $c$.` },
      { label: 'Sense check', text: t`In relativity a **frame** is a lattice of rulers and clocks synchronized like this, and an **observer** records each event with the clock right beside it — no light delays left to subtract. What anyone *sees* is something else: the light reaches their eyes later. Lunar laser ranging times such echoes to a few picoseconds, giving the Moon’s distance to millimetres.` },
    ],
    answer: t`No: the lander’s clock is ${EX.off.toFixed(3)} s fast. The reflection happened at $t_2 = ${EX.t2.toFixed(3)}$ s Earth time, ${Math.round(EX.d / 1e6) * 1000} km away.`,
  },
  practice: [
    mcq({
      id: 'galileo-same', difficulty: 1,
      prompt: t`Under the Galilean transformation $x' = x - vt$, $t' = t$ (with $v$ constant), which of these is the **same** in both frames — which is why Newton’s $F = ma$ looks the same to every inertial observer?`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 3], y: [-1.6, 4.6], aspect: 'wide', xlabel: 'time t (s)', ylabel: 'position (m)',
          curves: [{ fn: '0.5*x^2', color: 'accent', width: 2.6, label: 'from the ground', labelAt: 2.6, labelDx: -20, labelDy: -14 }, { fn: '0.5*x^2 - 1.5*x', color: 'gold', width: 2.6, label: 'from a train at 1.5 m/s', labelAt: 2.2, labelDx: 10, labelDy: 14 }],
        },
        caption: 'One accelerating cart described from the ground (blue) and from a train moving at a steady 1.5 m/s (gold). The curves differ by a straight line.',
      },
      choices: ['The acceleration', 'The position', 'The velocity', 'The momentum'],
      answer: 0,
      why: {
        1: t`Positions differ by $vt$, which grows with time.`,
        2: t`Velocities differ by $v$: $u' = u - v$.`,
        3: t`Momentum is mass times velocity, so it differs by $mv$ too.`,
      },
      hints: [t`Differentiate $x' = x - vt$ twice with respect to $t' = t$.`],
      teach: 'A constant-velocity change of frame shifts positions and velocities but leaves accelerations alone, so Newton’s laws keep their form.',
      explain: t`$\dfrac{dx'}{dt'} = \dfrac{dx}{dt} - v$ and $\dfrac{d^2x'}{dt'^2} = \dfrac{d^2x}{dt^2}$: the curves differ by the straight line $vt$, which has no curvature. Same acceleration, same force, same $F = ma$ — Galileo’s relativity of mechanics. Maxwell’s equations are *not* unchanged by this transformation; that was the crisis.`,
    }),
    num({
      id: 'aberration', difficulty: 2,
      gen(r) {
        const [what, v, note] = r.pick([
          ['Earth’s orbital motion around the Sun, 29.78 km/s', 29.78e3, 'James Bradley found this annual swing of star positions in 1727 — the first measurement of Earth’s motion.'],
          ['Earth’s rotation at the equator, 0.465 km/s', 465, 'This “diurnal aberration” is small, but precise astrometry corrects for it.'],
          ['Parker Solar Probe at its fastest, 190 km/s', 190e3, 'Star trackers that steer the probe must correct for it.'],
        ]);
        const a = (v / C) * AS;
        return {
          prompt: t`A telescope moving across the direction of incoming starlight must be tilted forward by a small angle $\alpha \approx v/c$ (in radians), as you tilt an umbrella when you walk through vertical rain. How big is the tilt caused by ${what}? Answer in arcseconds.`,
          answer: a, units: 'arcsec', tol: { rel: 0.01 },
          errors: [{ value: (v / C), feedback: 'That is the angle in radians. One radian is 206 265 arcseconds.' }, { value: (v / C) * (180 / Math.PI), feedback: 'That is in degrees; multiply by 3600 for arcseconds.' }],
          hints: [t`$\alpha = v/c$ in radians; multiply by $206\,265$ to get arcseconds.`],
          teach: t`Stellar aberration: an observer moving at $v$ across a starlight beam sees it arrive tilted forward by about $v/c$.`,
          explain: t`$\alpha = \dfrac{${tex(v, 4)}\ \text{m/s}}{2.998\times10^{8}\ \text{m/s}} = ${tex(v / C, 3)}$ rad $= ${fmt(a, 3)}''$. ${note} Aberration also told the ether theorists that Earth does *not* drag the ether along with it — while Michelson and Morley’s null result said it must. Relativity drops the ether and keeps both observations.`,
          visual: {
            type: 'graph',
            params: frame([-1.6, 4.6], [-0.3, 3.6], {
              aspect: 'wide',
              curves: [seg(1.5, 0.2, 2.1, 3.1, 'ink', 7), seg(1.5, 0.2, 2.1, 3.1, 'accent', 3), ...[2.9, 3.4, 3.9].map((x) => seg(x, 3.4, x, 1.2, 'gold', 1.6, true))],
              arrows: [{ from: [-1.2, 0.4], to: [0.6, 0.4], color: 'violet', width: 2.2, label: 'telescope moves at v', labelDx: -130, labelDy: 18 }],
              points: [label(2.1, 3.1, 'telescope, tilted by α', 'accent', 10, -4), label(3.4, 1.2, 'starlight', 'gold', 0, 16, 'center')],
            }),
            caption: 'A telescope moving to the right must lean forward so that light entering its top reaches the bottom. The tilt is drawn hugely exaggerated: it is a few hundred-thousandths of a radian.',
          },
        };
      },
    }),
    num({
      id: 'see-vs-observe', difficulty: 2,
      gen(r) {
        const d = r.pick([1.5, 3.0, 4.5, 6.0]), seen = r.pick([20, 25, 30, 40]);
        const delay = (d * 1e3 / C) * 1e6, ans = seen - delay;
        return {
          prompt: t`You stand beside a firework that bursts at $t = 0$ on your watch. A second firework, ${d} km away and at rest relative to you, bursts too, and you **see** its flash ${seen} μs after the first. In your frame, when did the second firework burst? Answer in microseconds.`,
          answer: ans, units: 'μs', tol: { rel: 0.01 },
          errors: [{ value: seen, feedback: 'That is when its light reached you. Subtract the time the light spent crossing the distance.' }, { value: seen + delay, feedback: 'The light left the firework *before* it reached you: subtract the travel time.' }],
          hints: [t`Light needs $d/c$ to cross ${d} km: $\dfrac{${d * 1000}\ \text{m}}{2.998\times10^{8}\ \text{m/s}}$.`, t`The burst happened ${fmt(delay, 4)} μs before you saw it.`],
          teach: 'What an observer sees is delayed by light travel; what a frame records is the time on the clock at the event, after that delay is removed.',
          explain: t`The light took $${fmt(delay, 4)}\ \mu\text{s}$ to cover ${d} km, so the burst happened at $t = ${seen} - ${fmt(delay, 4)} = ${fmt(ans, 3)}\ \mu\text{s}$ in your frame. A clock beside the second firework, synchronized with yours by Einstein’s rule, would have read exactly that. Confusing what is seen with what is observed is the classic source of false “paradoxes” in relativity.`,
          visual: minkowski({
            x: [-0.6, d * 1.35], t: [-1.2, seen * 0.3 * 1.15], xlabel: 'x (km)', ylabel: 'ct (km)', numbers: false, aspect: 'wide',
            lines: [{ pts: [[0, -1], [0, seen * 0.3 * 1.12]], color: 'accent', width: 2.6 }, { pts: [[d, -1], [d, seen * 0.3 * 1.12]], color: 'violet', width: 2 }, { pts: [[d, ans * 0.29979], [0, seen * 0.29979]], color: 'gold', width: 2, arrow: true }],
            events: [[0, 0, 'first burst', 'accent2', 10, 4], [d, ans * 0.29979, 'second burst', 'gold', 10, 0], [0, seen * 0.29979, 'you see it', 'accent2', 10, 0]],
            caption: 'Your frame, with time drawn as ct so light runs at 45°: you (blue), the second firework (violet) and its flash travelling to you (gold). Not to scale; numbers hidden.',
          }),
        };
      },
    }),
    num({
      id: 'de-sitter', difficulty: 3,
      gen(r) {
        const [d, V] = r.pick([[1000, 100], [500, 50], [3000, 200], [200, 150]]);
        const dt = (2 * d * LY * V * 1e3) / (C * C) / DAY;
        return {
          prompt: t`Suppose light left a star at $c + v$, where $v$ is the star’s velocity toward Earth. A binary star ${d} light-years away has members orbiting at ${V} km/s. Light sent while a star approaches us at ${V} km/s and light sent half an orbit later, while it recedes at ${V} km/s, would make the trip at $c + v$ and $c - v$. How much sooner would the first arrive, compared with travelling at $c$ both times? Use $\Delta t \approx 2dv/c^2$ and answer in days.`,
          answer: dt, units: 'day', tol: { rel: 0.01 },
          errors: [{ value: dt / 2, feedback: t`Both signals are shifted, one earlier and one later, by $dv/c^2$ each: the difference is $2dv/c^2$.` }],
          hints: [t`$\dfrac{d}{c - v} - \dfrac{d}{c + v} = \dfrac{2dv}{c^2 - v^2} \approx \dfrac{2dv}{c^2} = 2\times\dfrac{d}{c}\times\dfrac{v}{c}$.`, t`$d/c = ${d}$ years $= ${tex(d * 365.25, 6)}$ days, and $v/c = ${tex(V * 1e3 / C, 3)}$.`],
          teach: 'Over interstellar distances even a tiny dependence of light’s speed on its source would scramble binary-star orbits beyond recognition.',
          explain: t`$\Delta t = 2\times${tex(d * 365.25, 6)}\ \text{d}\times${tex(V * 1e3 / C, 3)} = ${fmt(dt, 3)}$ days — while such orbits last a few days. Light from different parts of the orbit would arrive jumbled together, and we would see stars in several places at once. Instead binary orbits look clean and obey Kepler’s laws: light’s speed does not depend on its source’s.`,
          visual: binary,
        };
      },
    }),
    mcq({
      id: 'midpoint-sync', difficulty: 2,
      prompt: 'Two clocks stand 1.00 km apart, at rest in your frame. A lamp exactly midway between them flashes, and each clock is started reading 1.668 μs (the time light takes to cover 500 m) when the flash reaches it. Are the clocks now synchronized?',
      visual: minkowski({
        x: [-0.85, 0.85], t: [-0.1, 0.95], xlabel: 'x (km)', ylabel: 'ct (km)', aspect: 'wide',
        lines: [{ pts: [[-0.5, -0.1], [-0.5, 0.95]], color: 'violet', width: 2.4 }, { pts: [[0.5, -0.1], [0.5, 0.95]], color: 'violet', width: 2.4 }, { pts: [[0, 0], [-0.5, 0.5]], color: 'gold', arrow: true, width: 2 }, { pts: [[0, 0], [0.5, 0.5]], color: 'gold', arrow: true, width: 2 }],
        events: [[0, 0, 'flash', 'gold', 0, 16, 'center'], [-0.5, 0.5, 'start', 'accent2', -10, 0, 'right'], [0.5, 0.5, 'start', 'accent2', 10, 0]],
        caption: 'Your frame, with ct in km: the two clocks (violet) and the flash from the midpoint (gold) reaching both.',
      }),
      choices: [
        'Yes — in this frame the flash reaches both clocks at the same moment, because light moves at c in both directions',
        'No — clocks can be synchronized only by bringing them together side by side',
        'Only if the two clocks are of the same make',
        'Yes — and they are then synchronized for every observer, however that observer moves',
      ],
      answer: 0,
      why: {
        1: 'Carrying a clock disturbs its rate (moving clocks run slow, as the next lesson shows). Light signals are the clean way to synchronize.',
        2: 'Any two good clocks tick at the same rate in the same frame; what needs fixing is their setting.',
        3: 'Observers moving along the line between the clocks disagree: in their frame the flash does not reach the two clocks at once. That is the relativity of simultaneity.',
      },
      hints: ['Where is the lamp, and how fast does its light travel each way in your frame?'],
      teach: 'Clocks at rest in one frame are synchronized by light signals; the result is valid in that frame and not in frames moving along the line between them.',
      explain: 'In your frame each half of the flash covers 500 m at c, so it reaches both clocks at the same moment, and both start at 1.668 μs: synchronized, in your frame. A rocket flying along the line would find the flash reaching the trailing clock first — its own lines of simultaneity tilt. Synchronization is a property of a frame, not of the clocks alone.',
    }),
    match({
      id: 'which-test', difficulty: 2,
      prompt: 'Match each historical experiment to what it established.',
      visual: {
        type: 'graph',
        params: {
          x: [1700, 1990], y: [-1, 1.5], aspect: 'wide', axesAt: 'edge', xlabel: 'year', ylabel: '', yticks: 0, grid: false,
          points: [[1727, 'Bradley', 0.6], [1851, 'Fizeau', -0.5], [1887, 'Michelson–Morley', 0.6], [1913, 'de Sitter', -0.5], [1964, 'CERN pions', 0.6]].map(([x, s, y]) => ({ x, y: 0, r: 5, color: 'accent', label: s, labelDx: 0, labelDy: y > 0 ? -16 : 18, labelAlign: 'center' })),
          curves: [seg(1700, 0, 1990, 0, 'ink3', 1.4)],
          arrows: [{ from: [1905, 1.2], to: [1905, 0.15], color: 'gold', width: 2, label: 'Einstein, 1905', labelDx: 8, labelDy: -6 }],
        },
        caption: 'The experiments on a timeline, with Einstein’s 1905 paper.',
      },
      left: ['Bradley’s stellar aberration (1727)', 'Fizeau’s light in flowing water (1851)', 'Michelson and Morley’s interferometer (1887)', 'de Sitter’s binary stars (1913)'],
      right: [
        'A moving observer sees starlight arrive from a shifted direction',
        'Moving water drags light along only partly',
        'Light’s speed is the same along and across Earth’s motion',
        'Light’s speed does not depend on its source’s speed',
        'Light slows down after travelling far through empty space',
      ],
      answer: [0, 1, 2, 3],
      hints: ['Which experiment involved a moving source? Which a moving medium? Which an observer moving across the light?', 'Michelson and Morley compared two perpendicular arms on the moving Earth.'],
      teach: 'Each classic experiment closed a different escape route for the ether and for source-dependent light speeds.',
      explain: 'Aberration: the moving Earth sees starlight shifted. Fizeau: moving water carries light along by only 1 − 1/n² of its own speed — a puzzle for the ether that relativistic velocity addition explains (lesson MP2.5). Michelson–Morley: no change of light’s speed with direction. De Sitter: no dependence on the source’s motion. Nothing suggests light slows down in empty space.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-sync-probe', difficulty: 2, transfer: true,
      gen(r) {
        const [what, t3, ahead] = r.pick([['a probe orbiting Jupiter', 5400, 6.5], ['a rover on Mars', 1520, -4.0], ['a probe near Saturn', 9120, 12.0], ['a spacecraft at the Sun–Earth L2 point', 10.02, 0.25]]);
        const tR = t3 / 2 + ahead;
        return {
          prompt: t`A radio pulse leaves Earth at $t_1 = 0$ on the Earth clock, is returned at once by ${what}, and is back at $t_3 = ${t3}$ s. The spacecraft logged the moment of reflection as ${fmt(tR, 6)} s on its own clock. By how many seconds is the spacecraft clock **ahead** of Earth’s, using Einstein’s rule? (Negative if it is behind; treat both as at rest.)`,
          answer: ahead, units: 's', tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: tR - t3, feedback: t`The reflection happened halfway between sending and receiving, at $t_3/2$, not at $t_3$.` }, { value: tR, feedback: 'Compare the spacecraft reading with the Earth time of the same event, (t₁ + t₃)/2.' }],
          hints: [t`Einstein’s rule puts the reflection at $t_2 = (t_1 + t_3)/2$ on Earth’s time.`],
          teach: 'Einstein synchronization: a signal reflected from a distant clock is assigned the time halfway between its sending and its return.',
          explain: t`$t_2 = ${t3}/2 = ${fmt(t3 / 2, 6)}$ s, while the spacecraft read ${fmt(tR, 6)} s: it is ${ahead > 0 ? `ahead by ${fmt(ahead, 3)} s` : `behind by ${fmt(-ahead, 3)} s`}. The distance is $c\,t_3/2 = ${tex((C * t3) / 2, 3)}$ m. Deep-space networks keep spacecraft clocks this way (with corrections for motion and gravity that later lessons supply).`,
          visual: radar(t3 / 2, t3, 'Earth (blue) and the spacecraft (violet), with the pulse (gold) out and back. Not to scale; numbers hidden.', false),
        };
      },
    }),
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([600, 750, 900]);
        const d = 20.2e6, err = (d * v) / C;
        return {
          prompt: t`A GPS receiver works out its distance to each satellite from the signal’s travel time, assuming the signal moves at $c$. Suppose instead it moved at $c + v_r$, where $v_r$ is the satellite’s speed toward the receiver — here ${v} m/s — over a distance of 20 200 km. Roughly how many metres would the computed distance be off? (The travel time would be short by about $(d/c)(v_r/c)$.)`,
          answer: err, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (d * v * v) / (C * C), feedback: t`The error is first order in $v_r/c$: $c\times(d/c)(v_r/c) = d\,v_r/c$.` }],
          hints: [t`Distance error $= c\times\Delta t = c\times\dfrac{d}{c}\dfrac{v_r}{c} = \dfrac{d\,v_r}{c}$.`, t`$\dfrac{(2.02\times10^{7}\ \text{m})(${v}\ \text{m/s})}{2.998\times10^{8}\ \text{m/s}}$.`],
          teach: 'If light inherited its source’s speed, satellite ranging would be off by tens of metres, changing as each satellite rose and set.',
          explain: t`$\dfrac{d\,v_r}{c} = ${fmt(err, 3)}$ m. Each satellite’s error would grow and shrink as it rose and set, and positions would wander by tens of metres; instead GPS routinely fixes positions to a few metres — to centimetres with careful processing — while assuming that every signal travels at exactly $c$.`,
          visual: {
            type: 'graph',
            params: frame([-1.6, 5.6], [-1.6, 3.2], {
              aspect: 'wide',
              shade: [disc(0, -2.6, 2.4, 'accent', 0.35)],
              curves: [{ fn: '-2.6 + sqrt(max(0, 5.76 - x^2))', color: 'accent', width: 2, domain: [-1.6, 2.4] }, seg(4.2, 2.4, 0.4, -0.15, 'gold', 1.6, true)],
              points: [{ x: 4.2, y: 2.4, r: 6, color: 'ink', label: 'GPS satellite', labelDx: -10, labelDy: -14, labelAlign: 'right' }, { x: 0.4, y: -0.15, r: 4, color: 'good', label: 'receiver', labelDx: -10, labelDy: -12, labelAlign: 'right' }, label(2.3, 1.1, 'signal, 20 200 km', 'gold', 12, 0)],
              arrows: [{ from: [4.2, 2.4], to: [3.35, 1.83], color: 'violet', width: 2.2, label: 'v toward receiver', labelDx: 8, labelDy: 14 }],
            }),
            caption: 'A GPS satellite, its signal to a receiver, and the satellite’s velocity component toward the receiver. Not to scale.',
          },
        };
      },
    }),
    order({
      id: 'cp-crisis', difficulty: 2,
      prompt: 'Put the argument that led to Einstein’s postulates in order.',
      visual: {
        type: 'graph',
        params: {
          x: [-0.3, 3.3], y: [-0.2, 3.3], equal: true, aspect: 'wide', xlabel: 'distance', ylabel: 'time', axesAt: 'edge', xticks: 0, yticks: 0,
          curves: [{ fn: 'x', domain: [0, 3.2], color: 'warn', width: 2.4, label: 'light: c in frame S', labelAt: 2.6, labelDx: 10, labelDy: 10 }, { fn: 'x/0.6', domain: [0, 1.95], color: 'violet', width: 2.4, dash: true, label: 'the same light by Galileo, in S′: c − v', labelAt: 1.6, labelDx: -12, labelDy: -6, labelAlign: 'right' }],
        },
        caption: 'Galileo’s rule applied to light: a frame S′ moving at v would see it go slower (steeper worldline). The second postulate says it does not.',
      },
      items: [
        t`Maxwell’s equations predict electromagnetic waves moving at $c = 1/\sqrt{\mu_0\varepsilon_0}$, without naming a frame.`,
        t`Galileo’s rule $u' = u - v$ would give light a different speed in every frame.`,
        'So Maxwell’s equations could hold exactly in only one frame — the ether’s.',
        'Experiments (aberration, Michelson–Morley, binary stars) find no trace of a special frame.',
        t`Einstein keeps Maxwell’s equations in every frame and gives up Galileo’s $t' = t$.`,
      ],
      hints: ['Start with the theory that names a speed, and end with what Einstein abandoned.'],
      teach: 'Einstein resolved the clash between Maxwell and Galileo by keeping Maxwell and replacing Galileo’s transformation.',
      explain: 'Maxwell’s c names no frame; Galileo’s addition would make c frame-dependent; so there must be an ether frame — which no experiment can find. Einstein’s way out keeps Maxwell’s equations true in every frame, and the price is Galileo’s absolute time, t′ = t. The next lessons work out what replaces it.',
    }),
  ],
  sources: [
    { label: 'Einstein (1905), On the electrodynamics of moving bodies (English translation)', url: 'https://www.fourmilab.ch/etexts/einstein/specrel/www/' },
    { label: 'de Sitter (1913), A proof of the constancy of the velocity of light, Proc. KNAW 15, 1297', url: 'https://dwc.knaw.nl/DL/publications/PU00012414.pdf' },
    { label: 'Brecher (1977), Is the speed of light independent of the velocity of the source?, Phys. Rev. Lett. 39, 1051', url: 'https://doi.org/10.1103/PhysRevLett.39.1051' },
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 2 (clock lattices and synchronization)', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'OpenStax University Physics Vol. 3, §5.1 Invariance of physical laws', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-1-invariance-of-physical-laws' },
  ],
});
