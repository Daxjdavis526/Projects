// Time dilation and length contraction — proper time and proper length, the
// two factors of γ, the low-speed approximation γ − 1 ≈ v²/2c², and the
// "two stories, one answer" bookkeeping between frames. Particle lifetimes
// from the PDG (π±: 26.033 ns; K±: 12.380 ns). Every number is computed here.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { fmt, nice, tex } from '../../src/core/format.js';
import { gamma } from '../../src/viz/model/relativity.js';
import { C, seg, label, shipCurves, r6 } from './_modern.js';

const t = String.raw;

const TAU_PI = 2.6033e-8;          // s, charged pion mean life at rest (PDG)
const TAU_K = 1.2380e-8;           // s, charged kaon mean life at rest (PDG)
const g = gamma;
/** 1 − 1/γ = 1 − √(1 − β²), without cancellation at small speeds: the fraction a moving clock falls behind. */
const lagFraction = (b) => (b * b) / (1 + Math.sqrt(1 - b * b));

// the worked example: pions at 0.99c
const EXB = 0.99;
const EX = { g: g(EXB), life: g(EXB) * TAU_PI, d: EXB * g(EXB) * C * TAU_PI, d0: EXB * C * TAU_PI };

// decay length against speed, with and without time dilation
const decayGraph = (tau, b, caption, top = 120) => ({
  type: 'graph',
  params: {
    x: [0.9, 1], y: [0, top], xlabel: 'speed v / c', ylabel: 'average decay length (m)',
    constants: { ct: r6(C * tau) },
    curves: [
      { fn: 'x*ct', color: 'ink3', dash: true, domain: [0.9, 0.9995], label: 'if its clock kept the lab’s time', labelAt: 0.905, labelDy: -10 },
      { fn: 'x*ct/sqrt(1 - x^2)', color: 'accent', domain: [0.9, 0.9995], label: 'with time dilation', labelAt: 0.94, labelDx: -40, labelDy: -14 },
    ],
    ...(b !== undefined ? { vlines: [{ x: b, color: 'gold' }] } : {}),
  },
  caption,
});

// a ship at rest with its proper length marked, and its velocity
const shipAtRest = (L0, b, caption) => ({
  type: 'graph',
  params: {
    x: [-0.6, 5.0], y: [-1.5, 1.6], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
    curves: [...shipCurves(0, 4, 0, 0.8), seg(0, -0.75, 4, -0.75, 'ink2', 1.4), seg(0, -0.9, 0, -0.6, 'ink2', 1.4), seg(4, -0.9, 4, -0.6, 'ink2', 1.4)],
    points: [label(2, -0.75, `L₀ = ${L0} m (proper length)`, 'ink2', -78, 14)],
    arrows: [{ from: [1.2, 1.15], to: [2.8, 1.15], color: 'gold', label: `v = ${b}c`, labelDx: 8, labelDy: 0 }],
  },
  caption: caption ?? 'The ship in its own rest frame, where its length is the proper length. Not to scale.',
});

export default lesson({
  id: 'phys2220.R1.2',
  title: 'Time dilation and length contraction',
  minutes: 12, difficulty: 2,
  intro: t`A clock always runs at its own normal rate in its own frame; the time it reads between two of its ticks is its **proper time** $\Delta\tau$. Timed from a frame in which the clock moves at speed $v$, the same two ticks are farther apart — and an object’s length along its motion is shorter than its **proper length** $L_0$, the length measured where it is at rest:

$$\Delta t = \gamma\,\Delta\tau, \qquad L = \frac{L_0}{\gamma}, \qquad \gamma = \frac{1}{\sqrt{1 - v^2/c^2}}$$

Both follow from the two postulates: the light clock below shows the first, and the second must hold so that both frames agree on everything that actually happens. They are tiny at everyday speeds and enormous near $c$, where unstable particles live and travel many times longer than their rest lifetimes allow.

> Continue on the Road to Einstein: [Light clocks, time dilation and the muon](#/lesson/gr.S02.i), then [Proper time: the time your own clock keeps](#/lesson/gr.S09.i).`,
  symbols: [
    { tex: '\\Delta\\tau', text: 'the proper time: the time between two events that happen at the same place in the clock’s own frame, read by a clock present at both, in seconds' },
    { tex: '\\Delta t', text: t`the time between the same two events in a frame where the clock moves at speed $v$, in seconds — always at least $\Delta\tau$` },
    { tex: 'L_0', text: 'the proper length: an object’s length measured in its own rest frame, in metres' },
    { tex: 'L', text: 'its length along the direction of motion, measured in a frame where it moves — both ends marked at the same time in that frame — in metres' },
    { tex: '\\gamma', text: t`the Lorentz factor: 1 at rest, 1.25 at $0.6c$, ${fmt(g(0.99), 3)} at $0.99c$, growing without limit as $v \to c$` },
    { tex: 'v', text: 'the speed of the clock or object relative to the observer, in m/s' },
    { tex: 'c', text: t`the speed of light, $299\,792\,458$ m/s` },
  ],
  why: 'Particle accelerators, cosmic-ray detectors and GPS all correct for these two factors every day; and proper time — the time a clock carries along its own path — is the quantity general relativity is built on.',
  visual: {
    type: 'gr-light-clock',
    title: 'Same light, longer path',
    lead: t`Two identical light clocks: a pulse bouncing between mirrors, one tick per round trip. In both, the pulse moves at $c$. In your frame the moving clock’s pulse runs along a slanted zigzag, so each of its ticks takes longer — by exactly $\gamma$.`,
    tasks: [
      'At v = 0.80c, γ = 1.667: the moving clock ticks 3 times while the clock beside you ticks 5.',
      'Push v to 0.99c: γ ≈ 7.1, and the moving clock barely ticks at all.',
      'Switch on the half-tick triangle: legs L and v·Δt/2, hypotenuse c·Δt/2. Pythagoras on it gives Δt = γΔτ.',
    ],
    params: { beta: 0.8, triangle: false },
  },
  example: {
    prompt: t`Charged pions live on average $\tau = ${fmt(TAU_PI * 1e9, 3)}$ ns at rest. A beam of them leaves a target at $${EXB}c$. (a) In the laboratory, how far does a typical pion travel before decaying? (b) Tell the same story in the pion’s own frame.`,
    visual: decayGraph(TAU_PI, EXB, t`Average distance a pion travels before decaying, against its speed. Dashed: $v\tau$, if its clock kept the lab’s time. Solid: $\gamma v\tau$. Gold: this beam. Real beams have a spread of speeds.`),
    steps: [
      { label: 'Name the proper time', text: t`The ${fmt(TAU_PI * 1e9, 3)} ns lifetime is measured in the pion’s rest frame, where its creation and its decay happen at one place: it is the proper time $\Delta\tau$.` },
      { label: 'The Lorentz factor', text: t`$\gamma = 1/\sqrt{1 - ${EXB}^2} = 1/\sqrt{${fmt(1 - EXB * EXB, 3)}} = ${fmt(EX.g, 3)}$.` },
      { label: 'Lifetime in the lab', text: t`$\Delta t = \gamma\,\Delta\tau = ${fmt(EX.g, 3)} \times ${fmt(TAU_PI * 1e9, 3)}\ \text{ns} = ${fmt(EX.life * 1e9, 4)}$ ns.` },
      { label: 'Distance in the lab', text: t`$d = v\,\Delta t = ${EXB} \times (2.998\times10^8\ \text{m/s}) \times (${fmt(EX.life * 1e9, 4)}\times10^{-9}\ \text{s}) = ${fmt(EX.d, 3)}$ m — ${fmt(EX.d / EX.d0, 3)} times the ${fmt(EX.d0, 3)} m it would cover if its clock kept the lab’s time.` },
      { label: 'The pion’s story', text: t`In its own frame the pion’s clock is normal and it lives ${fmt(TAU_PI * 1e9, 3)} ns. Instead the beamline rushes past it, contracted: ${fmt(EX.d, 3)} m of lab (a proper length, since the beamline is at rest in the lab) becomes $${fmt(EX.d, 3)}/${fmt(EX.g, 3)} = ${fmt(EX.d / EX.g, 3)}$ m, which passes in $${fmt(EX.d / EX.g, 3)}\ \text{m}/(${EXB}c) = ${fmt(TAU_PI * 1e9, 3)}$ ns.` },
      { label: 'Sense check', text: t`Two stories, one answer: both frames agree that the pion decays as it passes the lab marker ${fmt(EX.d, 3)} m downstream. Beam designers rely on exactly this when they decide where to put their detectors.` },
    ],
    answer: t`(a) About ${fmt(EX.d, 3)} m. (b) In the pion’s frame that stretch of beamline is only ${fmt(EX.d / EX.g, 3)} m long and passes by in its ${fmt(TAU_PI * 1e9, 3)} ns lifetime.`,
  },
  practice: [
    num({
      id: 'contract', difficulty: 1,
      gen(r) {
        const L0 = r.pick([80, 120, 150, 200, 250]), b = r.pick([0.6, 0.8, 0.28, 0.96, 0.5]);
        const L = L0 * Math.sqrt(1 - b * b);
        return {
          prompt: t`A spaceship is ${L0} m long in its own rest frame. It flies past a space station at $${b}c$. What length does the station measure for it?`,
          answer: L, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: L0 * g(b), feedback: t`Moving objects are measured *shorter*, not longer: divide by $\gamma$.` }, { value: L0 * (1 - b * b), feedback: t`Take the square root: $L = L_0\sqrt{1 - v^2/c^2}$.` }, { value: L0, feedback: 'That is the proper length, measured where the ship is at rest. The station sees it moving.' }],
          hints: [t`$L = L_0/\gamma = L_0\sqrt{1 - v^2/c^2}$.`, t`$\sqrt{1 - ${b}^2} = ${nice(Math.sqrt(1 - b * b), 4)}$.`],
          teach: 'An object moving along its length is measured shorter than its proper length by the factor γ.',
          explain: t`$L = ${L0}\ \text{m} \times \sqrt{1 - ${b}^2} = ${L0} \times ${nice(Math.sqrt(1 - b * b), 4)} = ${fmt(L, 3)}$ m. Its height and width, across the motion, are unchanged.`,
          visual: shipAtRest(L0, b),
        };
      },
    }),
    mcq({
      id: 'proper-which', difficulty: 2,
      prompt: 'A rocket flies at constant speed from Earth to Mars (treat the two planets as at rest relative to each other during the trip). Which observer measures the proper time of the trip, and which measures the proper length of the route?',
      choices: [
        'Proper time: the rocket’s crew. Proper length: observers on the planets',
        'Proper time: observers on the planets. Proper length: the rocket’s crew',
        'Both: the rocket’s crew',
        'Both: observers on the planets',
      ],
      answer: 0,
      why: {
        1: 'Swapped. Departure and arrival happen at one place only for the crew (the rocket), and the route is at rest only for the planets.',
        2: 'The crew is present at departure and arrival, so it has the proper time — but for the crew the route rushes past, so its length is contracted.',
        3: 'The planets hold the route at rest, so they have its proper length — but departure and arrival happen at two different places for them.',
      },
      hints: ['Proper time belongs to the observer for whom both events happen at the same place.', 'Proper length belongs to the observer for whom the thing being measured is at rest.'],
      teach: 'Proper time is measured by a clock present at both events; proper length is measured in the frame where the object is at rest.',
      explain: 'The rocket’s clock is present at departure and at arrival, so it records the proper time — the shortest time anyone measures for the trip. The Earth–Mars distance is at rest in the planets’ frame, so they measure its proper length; the crew measures it contracted by γ.',
      visual: {
        type: 'graph',
        params: {
          x: [-0.8, 9.2], y: [-1.4, 1.6], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [...shipCurves(3.4, 1.5, 0.5, 0.42), seg(0, -0.8, 8.2, -0.8, 'ink3', 1.3, true)],
          points: [{ x: 0, y: 0, r: 13, color: 'accent', label: 'Earth', labelDx: -16, labelDy: -24 }, { x: 8.2, y: 0, r: 9, color: 'bad', label: 'Mars', labelDx: -14, labelDy: -20 }, label(4.1, -0.8, 'the route, at rest in the planets’ frame', 'ink3', -110, 14)],
          arrows: [{ from: [3.3, 1.15], to: [5.1, 1.15], color: 'gold', label: 'v', labelDx: 8, labelDy: 0 }],
        },
        caption: 'Earth, Mars and the rocket between them. Not to scale.',
      },
    }),
    num({
      id: 'pion-length', difficulty: 2,
      gen(r) {
        const b = r.pick([0.9, 0.95, 0.98, 0.995]);
        const d = b * g(b) * C * TAU_PI, d0 = b * C * TAU_PI;
        return {
          prompt: t`Charged pions live ${fmt(TAU_PI * 1e9, 3)} ns on average at rest. In a beam moving at $${b}c$, how far does a typical pion travel in the laboratory before it decays?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: d0, feedback: t`That ignores time dilation. In the lab the pion lives $\gamma$ times longer than at rest.` }, { value: d0 / g(b), feedback: t`The moving pion’s clock runs slow, so it lives *longer* in the lab: multiply by $\gamma$.` }],
          hints: [t`First $\gamma = 1/\sqrt{1 - ${b}^2}$; the lab lifetime is $\gamma\tau$.`, t`Distance $= v\gamma\tau = ${b}\times(2.998\times10^8\ \text{m/s})\times${fmt(g(b), 4)}\times(${fmt(TAU_PI * 1e9, 3)}\times10^{-9}\ \text{s})$.`],
          teach: 'An unstable particle moving at v travels γvτ on average before decaying, where τ is its lifetime at rest.',
          explain: t`$\gamma = ${fmt(g(b), 4)}$, so the lab lifetime is $${fmt(g(b) * TAU_PI * 1e9, 4)}$ ns and the decay length is $${b}c \times ${fmt(g(b) * TAU_PI * 1e9, 4)}\ \text{ns} = ${fmt(d, 3)}$ m, against ${fmt(d0, 3)} m without dilation.`,
          visual: decayGraph(TAU_PI, b, t`Average decay length of a pion against its speed; gold: this beam’s speed. Dashed: without time dilation.`, Math.max(120, d * 1.3)),
        };
      },
    }),
    num({
      id: 'slow-clock', difficulty: 2,
      gen(r) {
        const v = r.pick([230, 250, 270]), hrs = r.pick([6, 8, 10, 12]);
        const lag = lagFraction(v / C) * hrs * 3600 * 1e9;      // Δt − Δτ = Δt(1 − 1/γ) ≈ Δt·v²/2c²
        return {
          prompt: t`An airliner cruises at ${v} m/s for ${hrs} hours. Counting only its speed (not gravity), by how many nanoseconds does a clock on board fall behind a clock on the ground? For speeds far below $c$, $\gamma - 1 \approx \dfrac{v^2}{2c^2}$.`,
          answer: lag, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: (v / C) * hrs * 3600 * 1e9, feedback: t`Square the ratio: the fraction is $v^2/(2c^2)$, not $v/c$.` }],
          hints: [t`The lag is $(\gamma - 1)\times$ the flight time $\approx \dfrac{v^2}{2c^2}\times(${hrs}\times3600\ \text{s})$.`, t`$\dfrac{v^2}{2c^2} = \dfrac{${v}^2}{2(2.998\times10^8)^2}$.`],
          teach: 'At everyday speeds a moving clock falls behind by the tiny fraction v²/2c² of the elapsed time.',
          explain: t`$\dfrac{v^2}{2c^2} = ${fmt((v * v) / (2 * C * C) * 1e13, 3)}\times10^{-13}$; times $${hrs * 3600}$ s gives ${fmt(lag, 3)} ns. Atomic clocks flown around the world (Hafele and Keating, 1971) measured effects of this size — with gravity’s larger, opposite effect added in.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 0.6], y: [0, 0.27], xlabel: 'speed v / c', ylabel: 'fraction lost',
              curves: [{ fn: '1/sqrt(1 - x^2) - 1', color: 'accent', label: 'exact: γ − 1', labelAt: 0.5, labelDx: -96, labelDy: -14 }, { fn: '0.5*x^2', color: 'gold', dash: true, label: 'approximation: v²/2c²', labelAt: 0.56, labelDx: -150, labelDy: 18 }],
            },
            caption: 'The exact fraction γ − 1 and its approximation v²/2c². An airliner sits at v/c ≈ 10⁻⁶, far to the left, where the two agree to about one part in a million million.',
          },
        };
      },
    }),
    mcq({
      id: 'square-sail', difficulty: 2,
      prompt: t`A square light sail, 10 m by 10 m in its own frame, moves edge-first at $0.8c$ along one of its sides. What shape does an observer at rest measure?`,
      choices: [
        'A rectangle: 6 m along the motion, 10 m across it',
        'A smaller square, 6 m by 6 m',
        'A 10 m square — contraction is only an optical illusion',
        'A rectangle: 16.7 m along the motion, 10 m across it',
      ],
      answer: 0,
      why: {
        1: 'Only lengths along the motion contract. Across the motion both observers must agree, or a moving pipe could not slide over a resting one without each claiming to fit inside the other.',
        2: 'Contraction is a measured result — both ends marked at the same time in the observer’s frame — not an illusion. (What a camera records is something else again, because light from the far side left earlier.)',
        3: 'That multiplies by γ = 1.67. Moving lengths are shorter: divide by γ.',
      },
      hints: ['Which dimension lies along the motion?', t`At $0.8c$, $\gamma = 1/\sqrt{1 - 0.64} = 5/3$.`],
      teach: 'Length contraction acts only along the direction of motion; perpendicular lengths are unchanged.',
      explain: t`Along the motion: $10\ \text{m}/\gamma = 10 \times 0.6 = 6$ m. Across it: still 10 m. The observer measures a 6 m × 10 m rectangle.`,
      visual: {
        type: 'graph',
        params: {
          x: [-1.4, 5.2], y: [-1.6, 1.6], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [seg(0, -1.2, 2.4, -1.2, 'accent', 2.4), seg(0, 1.2, 2.4, 1.2, 'accent', 2.4), seg(0, -1.2, 0, 1.2, 'accent', 2.4), seg(2.4, -1.2, 2.4, 1.2, 'accent', 2.4)],
          shade: [{ fn: '1.2', lower: '-1.2', from: 0, to: 2.4, color: 'accent', alpha: 0.12 }],
          points: [label(1.2, -1.2, '10 m', 'ink2', -14, 14), label(0, 0, '10 m', 'ink2', -40, 0)],
          arrows: [{ from: [2.9, 0], to: [4.6, 0], color: 'gold', label: '0.8c', labelDx: -24, labelDy: -16 }],
        },
        caption: 'The sail in its own rest frame, moving edge-first in the direction of the arrow.',
      },
    }),
    mcq({
      id: 'runway', difficulty: 2,
      prompt: t`A ship with a proper length of 100 m flies at $0.6c$ along a runway that is 100 m long on the ground. Observers on the ground measure the ship as 80 m long. What length does the ship’s crew measure for the runway?`,
      choices: ['80 m', '100 m', '125 m', '64 m'],
      answer: 0,
      why: {
        1: 'The runway is at rest on the ground — but not in the crew’s frame. For the crew the runway moves at 0.6c, so they measure it contracted.',
        2: 'Nothing is stretched. Each frame measures the other’s objects shorter, by the same factor.',
        3: 'Contraction acts once, by γ = 1.25 for the runway as measured by the crew; it does not compound.',
      },
      hints: ['In the crew’s frame, which object is moving?', 'The situation is symmetric: swap “ship” and “runway”.'],
      teach: 'Length contraction is symmetric: each frame measures the other’s moving objects shorter by γ.',
      explain: t`For the crew the runway moves at $0.6c$, so its 100 m proper length is measured as $100/1.25 = 80$ m. There is no contradiction: each frame marks the two ends at the same time in *its own* frame, and the two frames disagree about simultaneity.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.6, 8.6], y: [-1.4, 1.8], aspect: 'wide', equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [seg(0, -0.6, 8, -0.6, 'ink3', 5), ...shipCurves(1.6, 4.8, 0.7, 0.6)],
          points: [label(4, -0.6, 'runway, 100 m on the ground', 'ink2', -86, 16), label(4, 0.7, 'ship', 'accent', -14, -26)],
          arrows: [{ from: [6.6, 0.7], to: [8, 0.7], color: 'gold', label: '0.6c', labelDx: -20, labelDy: -16 }],
        },
        caption: 'The ship passing over the runway, seen from the ground. Not to scale.',
      },
    }),
    num({
      id: 'find-speed', difficulty: 3,
      gen(r) {
        const ratio = r.pick([0.5, 0.6, 0.8, 0.25, 0.1]);
        const b = Math.sqrt(1 - ratio * ratio);
        const [ab, ar] = ratio === 0.6 || ratio === 0.8 ? [0.866, 0.5] : [0.6, 0.8];
        return {
          prompt: t`How fast must a ship move for a station to measure it at ${Math.round(ratio * 100)}% of its proper length? Give $v/c$.`,
          answer: b, tol: { rel: 0.002 },
          errors: [{ value: 1 - ratio, feedback: t`Contraction is not linear in speed: solve $\sqrt{1 - v^2/c^2} = ${ratio}$.` }, { value: Math.sqrt(1 - ratio), feedback: t`Square both sides first: $1 - v^2/c^2 = ${ratio}^2$.` }],
          hints: [t`$L/L_0 = \sqrt{1 - v^2/c^2} = ${ratio}$.`, t`Square: $v^2/c^2 = 1 - ${ratio}^2 = ${nice(1 - ratio * ratio)}$, then take the square root.`],
          teach: 'Inverting L = L₀√(1 − v²/c²) gives v/c = √(1 − (L/L₀)²).',
          explain: t`$v/c = \sqrt{1 - ${ratio}^2} = \sqrt{${nice(1 - ratio * ratio)}} = ${fmt(b, 4)}$. Plotted against speed, $L/L_0$ traces a quarter circle: it barely shrinks at first, then plunges as $v \to c$.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 1.05], y: [0, 1.08], equal: true, xlabel: 'speed v / c', ylabel: 'L / L₀',
              curves: [{ fn: 'sqrt(1 - x^2)', color: 'accent', domain: [0, 1] }],
              points: [{ x: ab, y: ar, color: 'ink3', label: `for example ${ab}c → ${Math.round(ar * 100)}%`, labelDx: 10, labelDy: -12 }],
            },
            caption: 'Measured length as a fraction of proper length, against speed: a quarter circle.',
          },
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-parker', difficulty: 3, transfer: true,
      prompt: t`At its closest to the Sun, NASA’s Parker Solar Probe moves at about 190 km/s, the fastest any spacecraft has flown. If it kept that speed for a whole day, by how many milliseconds would its clock fall behind one at rest, counting the speed effect only? Use $\gamma - 1 \approx v^2/2c^2$.`,
      answer: lagFraction(190e3 / C) * 86400 * 1e3, units: 'ms', tol: { rel: 0.01 },
      errors: [{ value: (190e3 / C) * 86400 * 1e3, feedback: t`Square the ratio: the fraction is $v^2/(2c^2)$.` }],
      hints: [t`$v/c = 1.90\times10^5/(2.998\times10^8)$; square it and halve it.`, t`Multiply that fraction by the 86 400 s in a day, then convert to milliseconds.`],
      teach: 'Even the fastest spacecraft move slowly enough that v²/2c² gives time dilation to high accuracy.',
      explain: t`$v^2/2c^2 = ${tex(lagFraction(190e3 / C), 3)}$, and $86\,400\ \text{s} \times ${tex(lagFraction(190e3 / C), 3)} = ${fmt(lagFraction(190e3 / C) * 86400 * 1e3, 3)}$ ms. In reality the probe holds its top speed only for hours around each close pass, and the Sun’s gravity slows its clock further — a general-relativity effect of similar size.`,
      visual: {
        type: 'graph',
        params: {
          x: [-0.8, 0.8], y: [-0.78, 0.78], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
          curves: [{ polar: '0.388*(1 - 0.882^2)/(1 + 0.882*cos(theta))', theta: [0, 6.2832], color: 'gold', width: 2 }, { polar: '0.723', theta: [0, 6.2832], color: 'ink3', width: 1.2, dash: true }],
          points: [{ x: 0, y: 0, r: 7, color: 'warn', label: 'Sun', labelDx: -12, labelDy: -16 }, { x: 0.0459, y: 0, r: 4, color: 'gold', label: 'closest pass: about 190 km/s', labelDx: -60, labelDy: 18 }, label(-0.511, 0.511, 'Venus’s orbit', 'ink3', -96, -10)],
        },
        caption: 'Parker Solar Probe’s final orbit around the Sun, roughly to scale: it dips to about 6 million km above the Sun’s surface and swings out to near Venus’s orbit (dashed).',
      },
    }),
    num({
      id: 'cp-kaon', difficulty: 2,
      gen(r) {
        const G = r.pick([3, 5, 8, 10]);
        const b = Math.sqrt(1 - 1 / (G * G)), d = G * b * C * TAU_K;
        return {
          prompt: t`Charged kaons live ${fmt(TAU_K * 1e9, 4)} ns on average at rest. A beam of them moves with $\gamma = ${G}$. What is their average decay length in the laboratory?`,
          answer: d, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: b * C * TAU_K, feedback: 'That leaves out time dilation: the lab lifetime is γ times longer.' }],
          hints: [t`$v/c = \sqrt{1 - 1/\gamma^2}$, and the decay length is $\gamma v\tau$.`],
          teach: 'Decay length in the lab = γvτ: dilated lifetime times speed.',
          explain: t`$v = c\sqrt{1 - 1/${G * G}} = ${fmt(b, 4)}c$; decay length $= ${G}\times${fmt(b, 4)}\times(2.998\times10^8\ \text{m/s})\times(${fmt(TAU_K * 1e9, 4)}\times10^{-9}\ \text{s}) = ${fmt(d, 3)}$ m.`,
          visual: decayGraph(TAU_K, r6(b), t`Average decay length of a kaon against its speed; gold: this beam. Dashed: without time dilation.`, Math.max(60, d * 1.3)),
        };
      },
    }),
    multi({
      id: 'cp-agree', difficulty: 2,
      prompt: 'A pion is created at a target and decays 55 m downstream, as measured in the laboratory. Which of these do the laboratory and the pion’s own frame agree on? Select every one.',
      choices: [
        'That the pion decays',
        'What the pion’s own clock reads at the moment it decays',
        'Which lab marker the pion is passing when it decays',
        'How much time passes between creation and decay',
        'How long the stretch of beamline between the target and the decay point is',
      ],
      answer: [0, 1, 2],
      why: { 3: 'The lab measures γ times the pion’s proper time; the pion measures the proper time itself.', 4: 'The lab measures the proper length of its own beamline; the pion measures it contracted by γ.' },
      hints: ['Events — things that happen at one place and moment — are agreed by everyone.', 'Durations and lengths between events depend on the frame.'],
      teach: 'Observers agree on events and on what any one clock reads at an event; they disagree about times and lengths between events.',
      explain: 'The decay is an event, the pion’s clock reading is a fact about that event, and the lab marker beside it is at the same place: all frames agree on these. The time between creation and decay, and the length of beamline in between, are frame-dependent — dilated for one, contracted for the other.',
      visual: {
        type: 'graph',
        params: {
          x: [-4, 62], y: [-7, 9], aspect: 'wide', xlabel: 'distance along the beamline (m)', ylabel: '', yticks: 0.001,
          curves: [seg(0, 0, 55, 0, 'accent', 2.4, true)],
          points: [{ x: 0, y: 0, r: 7, color: 'ink2', label: 'target', labelDx: -16, labelDy: -16 }, { x: 55, y: 0, r: 7, color: 'warn', label: 'decay', labelDx: -16, labelDy: -16 }, ...[10, 20, 30, 40, 50].map((m) => ({ x: m, y: -2.5, r: 3, color: 'ink3' }))],
        },
        caption: 'The pion’s path in the laboratory (dashed), with marker posts every 10 m.',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §5.3 Time dilation', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-3-time-dilation' },
    { label: 'OpenStax University Physics Vol. 3, §5.4 Length contraction', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-4-length-contraction' },
    { label: 'Particle Data Group, Review of Particle Physics: π± and K± mean lives', url: 'https://pdg.lbl.gov/' },
    { label: 'NASA, Parker Solar Probe', url: 'https://science.nasa.gov/mission/parker-solar-probe/' },
  ],
});
