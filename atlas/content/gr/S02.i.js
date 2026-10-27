// Light clocks, time dilation and the muon — Intuition Mode.
// Every number a learner reads is computed here (c = 299 792 458 m/s exactly;
// muon lifetime from the PDG).
import { lesson, mcq, num } from '../../src/core/content.js';
import { fmt, tex, nice } from '../../src/core/format.js';
import { gamma } from '../../src/viz/model/relativity.js';

const t = String.raw;

const C = 299792458;                  // m/s
const TAU_MU = 2.1969811e-6;          // s, muon mean lifetime at rest (PDG)
const DAY = 86400;                    // s
const GM_EARTH = 3.986004418e14;      // m³/s²
const A_GPS = 2.656175e7;             // m, GPS orbit radius (Ashby 2003)
const V_GPS = Math.sqrt(GM_EARTH / A_GPS);   // ≈ 3874 m/s
const H_ATM = 15e3;                   // m, a typical height at which cosmic-ray muons are made

const g = (v) => gamma(v);

// γ against speed, with the chosen speed marked
const gammaGraph = (v) => ({
  type: 'graph',
  params: {
    x: [0, 1], y: [0, 8], xlabel: 'v / c', ylabel: 'γ',
    curves: [{ fn: '1/sqrt(1 - x^2)', color: 'accent', domain: [0, 0.992] }],
    hlines: [{ y: 1, label: 'γ = 1 at rest', color: 'ink3' }],
    vlines: [{ x: 1, label: 'c', color: 'warn' }],
    points: v === undefined ? [] : [{ x: v, y: g(v), color: 'gold', label: `v = ${v}c` }],
  },
  caption: 'The Lorentz factor stays close to 1 until speeds are a sizeable fraction of light’s, then grows without limit.',
});

export default lesson({
  id: 'gr.S02.i',
  title: 'Light clocks, time dilation and the muon',
  minutes: 8, difficulty: 2, mode: 'intuition', badges: ['est-obs'],
  intro: t`A **light clock** is the simplest clock there is: a pulse of light bouncing between two mirrors a distance $L$ apart, one tick per round trip. Now watch the same kind of clock fly past at speed $v$. Its pulse must run along a slanted zigzag — a longer path — yet light moves at the same speed $c$ for every observer, so **each tick of the moving clock takes longer**. Pythagoras on half a tick gives the factor:

$$\Delta t = \frac{\Delta\tau}{\sqrt{1 - v^2/c^2}}$$

Every kind of clock must slow by the same factor, or you could tell who is "really" moving. Muons — unstable particles made by cosmic rays high in the atmosphere — show it all day long: they reach the ground only because, to us, their clocks run slow.`,
  equation: t`\Delta t = \gamma\,\Delta\tau, \qquad \gamma = \frac{1}{\sqrt{1 - v^2/c^2}}`,
  symbols: [
    { tex: '\\Delta\\tau', text: t`one tick of the clock in its own rest frame — its **proper time**; $2L/c$ for a light clock` },
    { tex: '\\Delta t', text: t`the time between the same two ticks, measured in a frame where the clock moves at speed $v$` },
    { tex: '\\gamma', text: t`the Lorentz factor: 1 at rest, ${nice(g(0.6))} at $0.6c$, ${fmt(g(0.995), 3)} at $0.995c$, growing without limit as $v \to c$` },
    { tex: 'v', text: 'the clock’s speed relative to you, in m/s (or as a fraction of $c$)' },
    { tex: 'c', text: t`the speed of light, $299\,792\,458$ m/s — the same for every observer, however they move` },
  ],
  why: 'Every precision test of relativity — muons, atomic clocks flown on jets, GPS — compares clocks, and this is the first rule for how moving clocks disagree.',
  visual: {
    type: 'gr-light-clock',
    title: 'Two identical clocks, one moving',
    lead: t`The gold pulse moves at the same speed in both panels — but on the right it has farther to go on every tick. Watch the tick counters.`,
    tasks: [
      `At v = 0.60c the moving clock ticks ${nice(10 / (2 * g(0.6)))} times while the resting one ticks 5 (γ = ${nice(g(0.6))}).`,
      `Push v to 0.99c: the moving clock almost stops ticking (γ ≈ ${fmt(g(0.99), 2)}).`,
      'With the triangle on, check Pythagoras: (cΔt/2)² = L² + (vΔt/2)².',
    ],
    params: { beta: 0.6, triangle: true },
  },
  example: {
    prompt: t`Cosmic rays striking the upper atmosphere make muons about 15 km up. At rest a muon lives ${fmt(TAU_MU * 1e6, 4)} μs on average before decaying. One comes straight down at $0.995c$. How far does it travel on average before decaying — first ignoring relativity, then with time dilation?`,
    visual: {
      type: 'graph',
      params: {
        x: [0.9, 1], y: [0, 16], xlabel: 'muon speed v / c', ylabel: 'average distance before decay (km)',
        constants: { tc: C * TAU_MU / 1000 },
        curves: [{ fn: 'x*tc', color: 'ink3', dash: true, domain: [0.9, 0.9995], label: 'without dilation: vτ', labelAt: 0.95 }, { fn: 'x*tc/sqrt(1 - x^2)', color: 'accent', domain: [0.9, 0.9995], label: 'with dilation: γvτ', labelAt: 0.903 }],
        hlines: [{ y: H_ATM / 1000, label: 'where muons are made', color: 'warn' }],
        points: [{ x: 0.995, y: 0.995 * g(0.995) * C * TAU_MU / 1000, color: 'gold' }, { x: 0.995, y: 0.995 * C * TAU_MU / 1000, color: 'gold' }],
      },
      caption: t`Gold dots: a muon at $0.995c$. Dashed: $v\tau$, what it would cover if its clock ran at our rate. Solid: $\gamma v\tau$, what it covers on average. Real muons are made over a range of heights and speeds; 15 km is typical.`,
    },
    steps: [
      { label: 'Without relativity', text: t`Distance $= v\tau = 0.995\times(2.998\times10^8\ \text{m/s})\times(${fmt(TAU_MU * 1e6, 4)}\times10^{-6}\ \text{s}) = ${Math.round(0.995 * C * TAU_MU)}$ m. Fifteen kilometres would be ${Math.round(H_ATM / (0.995 * C * TAU_MU))} average lifetimes — essentially none would survive.` },
      { label: 'The Lorentz factor', text: t`$\gamma = 1/\sqrt{1 - 0.995^2} = 1/\sqrt{${fmt(1 - 0.995 ** 2, 4)}} = ${fmt(g(0.995), 4)}$.` },
      { label: 'The muon’s clock runs slow', text: t`In Earth’s frame its average life is $\gamma\tau = ${fmt(g(0.995) * TAU_MU * 1e6, 3)}\ \mu\text{s}$, so it covers $\gamma v\tau = ${fmt(0.995 * g(0.995) * C * TAU_MU / 1000, 3)}$ km on average — ten times farther.` },
      { label: 'Sense check: two stories, one answer', text: t`About one muon per square centimetre per minute reaches sea level, so they do survive. Riding with the muon, its clock is perfectly normal; instead the atmosphere rushing past is *shorter* by the same factor $\gamma$ — 15 km becomes ${fmt(H_ATM / g(0.995) / 1000, 3)} km. Both stories predict the same number of muons at the ground.` },
    ],
    answer: t`Ignoring relativity: about ${Math.round(0.995 * C * TAU_MU)} m. With time dilation ($\gamma \approx ${fmt(g(0.995), 3)}$): about ${fmt(0.995 * g(0.995) * C * TAU_MU / 1000, 3)} km.`,
  },
  practice: [
    num({
      id: 'gamma', difficulty: 1,
      gen(r) {
        const v = r.pick([0.6, 0.8, 0.28, 0.96, 0.5, 0.98]);
        return {
          prompt: t`Find the Lorentz factor $\gamma = 1/\sqrt{1 - v^2/c^2}$ for a clock moving at $v = ${v}c$.`,
          answer: g(v), tol: { rel: 0.005 },
          errors: [{ value: 1 / g(v), feedback: 'That is √(1 − v²/c²) itself — γ is one divided by it, so γ ≥ 1.' }, { value: 1 / (1 - v * v), feedback: 'Take the square root of 1 − v²/c² before dividing.' }],
          hints: [t`With $v$ as a fraction of $c$, $v^2/c^2 = ${v}^2 = ${nice(v * v)}$.`, t`$\gamma = 1/\sqrt{1 - ${nice(v * v)}} = 1/\sqrt{${nice(1 - v * v)}}$.`],
          teach: 'The Lorentz factor γ = 1/√(1 − v²/c²) is never less than 1, and it grows without limit as v approaches c.',
          explain: t`$\gamma = 1/\sqrt{1 - ${nice(v * v)}} = 1/\sqrt{${nice(1 - v * v)}} = ${fmt(g(v), 4)}$.`,
          visual: gammaGraph(v),
        };
      },
    }),
    num({
      id: 'tick', difficulty: 2,
      gen(r) {
        const Lm = r.pick([0.3, 0.6, 1.5, 3]), v = r.pick([0.6, 0.8]);
        const rest = 2 * Lm / C * 1e9, moving = rest * g(v);
        return {
          prompt: t`A light clock has mirrors ${Lm} m apart. It flies past you at $${v}c$. How long does one of its ticks (a round trip of the light) last, timed in your frame? Answer in nanoseconds.`,
          answer: moving, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: rest, feedback: 'That is the tick in the clock’s own frame. In your frame the moving clock’s tick is longer by γ.' }, { value: rest / g(v), feedback: 'Moving clocks tick slower, not faster: multiply by γ.' }],
          hints: [t`At rest one tick is $2L/c = 2\times${Lm}/(2.998\times10^8)$ s.`, t`Multiply the rest tick by $\gamma = ${nice(g(v))}$.`],
          teach: 'A moving clock’s tick, timed by you, is γ times its tick at rest.',
          explain: t`At rest: $2L/c = ${fmt(rest, 3)}$ ns. Moving at $${v}c$: $${nice(g(v))}\times${fmt(rest, 3)} = ${fmt(moving, 3)}$ ns.`,
          visual: { type: 'gr-light-clock', params: { beta: v, slider: false, triangle: true } },
        };
      },
    }),
    num({
      id: 'pythagoras', difficulty: 2,
      gen(r) {
        const [a, b, h] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 5, 13]]);
        return {
          prompt: t`Freeze a moving light clock halfway through a tick. In your frame, the mirrors are ${b} light-nanoseconds apart (the distance light covers in ${b} ns), the clock has moved ${a} light-nanoseconds sideways, and the pulse has run straight along the slanted path. How long is that slanted path, and so what is $\gamma$, the ratio of the moving clock’s half tick to the resting clock’s?`,
          answer: h / b, tol: { rel: 0.005 },
          errors: [{ value: h / a, feedback: 'The resting clock’s half tick corresponds to the mirror gap, not the sideways distance.' }, { value: b / h, feedback: 'That is 1/γ: the moving half tick is the longer one.' }],
          hints: [t`Pythagoras: slanted path $= \sqrt{${a}^2 + ${b}^2}$ light-ns.`, t`Light covers the slanted path in $\sqrt{${a}^2+${b}^2} = ${h}$ ns, but the gap of ${b} light-ns in ${b} ns at rest: $\gamma = ${h}/${b}$.`],
          teach: 'Half a tick of a moving light clock is a right triangle whose hypotenuse is γ times the mirror gap.',
          explain: t`Slanted path $= \sqrt{${a}^2 + ${b}^2} = ${h}$ light-ns, so half a tick lasts ${h} ns in your frame against ${b} ns at rest: $\gamma = ${h}/${b} = ${fmt(h / b, 4)}$. The clock moves at $v = ${a}/${h} = ${fmt(a / h, 3)}c$, and indeed $1/\sqrt{1 - (${a}/${h})^2} = ${fmt(h / b, 4)}$.`,
          visual: { type: 'gr-light-clock', params: { beta: a / h, slider: false, triangle: true, labels: false, readout: false } },
        };
      },
    }),
    num({
      id: 'muon-distance', difficulty: 2,
      gen(r) {
        const v = r.pick([0.98, 0.99, 0.995, 0.998]);
        const d = v * g(v) * C * TAU_MU / 1000;
        return {
          prompt: t`A cosmic-ray muon moves at $${v}c$. Its average lifetime at rest is ${fmt(TAU_MU * 1e6, 4)} μs. In Earth’s frame, how far does it travel on average before it decays? Answer in kilometres.`,
          answer: d, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: v * C * TAU_MU / 1000, feedback: 'That ignores time dilation: in Earth’s frame the muon lives γ times longer than at rest.' }, { value: v * C * TAU_MU / g(v) / 1000, feedback: 'The moving muon’s clock runs slow, so it lives longer in our frame: multiply by γ, don’t divide.' }],
          hints: [t`First find $\gamma = 1/\sqrt{1 - ${v}^2}$.`, t`Distance $= v\times\gamma\tau = ${v}\times(2.998\times10^8)\times${fmt(g(v), 4)}\times(${fmt(TAU_MU * 1e6, 4)}\times10^{-6})$ m.`],
          teach: 'In Earth’s frame a fast muon lives γ times its rest lifetime, so it travels γ times farther before decaying.',
          explain: t`$\gamma = ${fmt(g(v), 4)}$; lifetime in Earth’s frame $\gamma\tau = ${fmt(g(v) * TAU_MU * 1e6, 3)}\ \mu\text{s}$; distance $= ${fmt(d, 3)}$ km, against ${fmt(v * C * TAU_MU / 1000, 3)} km without dilation.`,
          visual: {
            type: 'graph',
            params: {
              x: [0.9, 1], y: [0, Math.max(16, d * 1.2)], xlabel: 'muon speed v / c', ylabel: 'average distance (km)',
              constants: { tc: C * TAU_MU / 1000 },
              curves: [{ fn: 'x*tc', color: 'ink3', dash: true, domain: [0.9, 0.9995], label: 'without dilation', labelAt: 0.95 }, { fn: 'x*tc/sqrt(1 - x^2)', color: 'accent', domain: [0.9, 0.9995], label: 'with dilation', labelAt: 0.903 }],
              vlines: [{ x: v, color: 'gold' }],
            },
            caption: t`Gold line: this muon’s speed. Dashed: $v\tau$ (no dilation). Solid: $\gamma v\tau$.`,
          },
        };
      },
    }),
    mcq({
      id: 'who-is-slow', difficulty: 2,
      prompt: 'Ana and Ben coast past each other at 0.6c, each carrying an identical light clock. Ana measures Ben’s clock ticking slow, by a factor of 1.25. What does Ben measure about Ana’s clock?',
      choices: ['Ana’s clock ticks slow, by the same factor 1.25', 'Ana’s clock ticks fast, by a factor of 1.25', 'Ana’s clock ticks normally — Ben is the one really moving', 'Ana’s clock ticks slow by 1.25², since the effects add'],
      answer: 0,
      why: { 1: 'If dilation made the other clock fast, the two frames would not be equivalent. Each observer finds the other’s clock slow.', 2: 'There is no “really moving”: each can say they are at rest and the other moves. That is the first postulate.', 3: 'Each measurement involves one factor of γ = 1.25; nothing compounds.' },
      hints: ['In Ben’s own frame, who is moving?', 'The situation is perfectly symmetric: swap the names and the physics is the same.'],
      teach: 'Time dilation is symmetric between inertial observers: each measures the other’s clock running slow.',
      explain: 'In Ben’s frame Ana’s clock is the moving one, so its light runs the longer zigzag and it ticks slow by γ = 1.25. There is no contradiction: each measurement compares one moving clock with two separated clocks of the measuring frame, and the two frames disagree about which distant events are simultaneous. The asymmetric twin paradox needs one twin to turn around.',
      visual: { type: 'gr-light-clock', params: { beta: 0.6, slider: false, triangle: false, readout: false, titles: ['Ben’s clock, in Ben’s frame', 'Ana’s clock, seen by Ben (Ana moves at 0.60c)'] } },
    }),
    mcq({
      id: 'illusion', difficulty: 2,
      prompt: 'Someone says: “Moving clocks only *look* slow because their light takes longer and longer to reach you as they move away.” What is wrong with this?',
      choices: [
        'Time dilation remains after the light-travel delay is subtracted, and it happens for clocks approaching you as well as receding',
        'Nothing — time dilation is a signal-delay effect and vanishes once the delay is corrected',
        'Light from a moving clock travels faster than c, so there is no delay to correct',
        'The delay only matters for light clocks; atomic clocks are not affected',
      ],
      answer: 0,
      why: { 1: 'Muons physically survive to the ground, and atomic clocks flown around the world came back out of step with ground clocks — no signal delay explains that.', 2: 'Light always moves at c in every inertial frame, whatever the motion of its source.', 3: 'If one kind of clock slowed and another did not, comparing them would reveal absolute motion. All clocks slow alike.' },
      hints: ['Does an approaching clock’s signal delay grow or shrink?', 'Think of the muons: does a signal delay change how many reach the ground?'],
      teach: 'Time dilation is what remains after light-travel delays are accounted for; it is a real difference in elapsed time.',
      explain: 'Signal delays make an approaching clock look fast and a receding one look slow (the Doppler effect). Time dilation is what is left once those delays are removed, and it makes both run slow by γ. Its effects are physical: more muons reach the ground, and atomic clocks flown around the world (Hafele and Keating, 1971) came back out of step with ground clocks by the amounts relativity predicts.',
      visual: {
        type: 'graph',
        params: {
          x: [0, 0.95], y: [0, 3.2], xlabel: 'speed v / c', ylabel: 'apparent tick rate ÷ rate at rest',
          curves: [
            { fn: 'sqrt((1+x)/(1-x))', color: 'warn', label: 'approaching: looks fast', labelAt: 0.5, labelDx: 8, labelDy: -14 },
            { fn: 'sqrt((1-x)/(1+x))', color: 'violet', label: 'receding: looks slow', labelAt: 0.62, labelDx: 6, labelDy: 14 },
            { fn: 'sqrt(1-x^2)', color: 'good', label: 'delays removed: slow either way', labelAt: 0.1, labelDx: 4, labelDy: -14 },
          ],
          hlines: [{ y: 1, color: 'ink3' }],
        },
        caption: 'What you see (Doppler-shifted by the light-travel delay) depends on the direction of motion; what remains after the delay is removed is the same slowing, √(1 − v²/c²), for approaching and receding clocks alike.',
      },
    }),
    num({
      id: 'cern', difficulty: 3,
      gen(r) {
        const G = r.pick([29.3, 12, 20]);
        const life = G * TAU_MU * 1e6;
        return {
          prompt: t`A storage ring keeps muons circling at nearly the speed of light, with $\gamma = ${G}$. Their lifetime at rest is ${fmt(TAU_MU * 1e6, 4)} μs. What average lifetime should the laboratory measure?`,
          answer: life, units: 'μs', tol: { rel: 0.01 },
          errors: [{ value: TAU_MU * 1e6 / G, feedback: 'Moving clocks run slow, so the muons live longer in the lab: multiply by γ.' }, { value: TAU_MU * 1e6, feedback: 'That is the lifetime at rest; the lab sees it stretched by γ.' }],
          hints: ['The lab sees the muon’s internal clock running slow by γ.', t`Lab lifetime $= \gamma\tau = ${G}\times${fmt(TAU_MU * 1e6, 4)}\ \mu\text{s}$.`],
          teach: 'An unstable particle moving with Lorentz factor γ lives γ times its rest lifetime in the lab.',
          explain: t`$\gamma\tau = ${G}\times${fmt(TAU_MU * 1e6, 4)} = ${fmt(life, 3)}\ \mu\text{s}$. CERN’s 1970s ring ran at $\gamma = 29.3$, where this gives ${fmt(29.3 * TAU_MU * 1e6, 3)} μs; the measured lifetimes agreed to about 0.1%, even though the muons were moving in a circle — only their speed mattered.`,
          visual: {
            type: 'graph',
            params: { x: [0, 32], y: [0, 75], xlabel: 'Lorentz factor γ', ylabel: 'lifetime in the lab (μs)', constants: { tau: TAU_MU * 1e6 }, curves: [{ fn: 'tau*x', color: 'accent', domain: [1, 32] }], points: [{ x: G, y: life, color: 'gold', label: `γ = ${G}` }] },
            caption: t`A moving particle’s lifetime, as the lab measures it, is $\gamma$ times its lifetime at rest: a straight line through $\gamma = 1$.`,
          },
        };
      },
    }),
    mcq({
      id: 'muon-view', difficulty: 3,
      prompt: t`Ride along with a muon falling at $0.995c$. Its own clock runs normally and it lives only ${fmt(TAU_MU * 1e6, 2)} μs on average. How does it nevertheless reach the ground, 15 km below in Earth’s frame?`,
      choices: [
        `In its frame the atmosphere rushes past and is shorter by γ ≈ ${fmt(g(0.995), 2)} — about ${fmt(H_ATM / g(0.995) / 1000, 2)} km thick`,
        'It doesn’t: muons detected at the ground are made near the ground',
        'Its clock secretly runs slow even in its own frame',
        'In its frame it moves faster than light, covering 15 km in 2.2 μs',
      ],
      answer: 0,
      why: { 1: 'Most are made 10–20 km up by cosmic rays; their numbers at mountain tops and at sea level were compared directly.', 2: 'In its own frame a clock always runs at its normal rate — dilation is about a clock seen from another frame.', 3: `Nothing outruns light in any frame; 15 km in ${fmt(TAU_MU * 1e6, 2)} μs would need ${fmt(H_ATM / (TAU_MU * C), 2)} times c.` },
      hints: ['In the muon’s frame the clock is fine, so something else must change.', 'Lengths along the direction of motion are shorter by γ for the observer who sees them moving.'],
      teach: 'What one observer calls time dilation, another calls length contraction; both predict the same events.',
      explain: t`In the muon’s frame the ground races up at $0.995c$ and the atmosphere is contracted to $15/${fmt(g(0.995), 3)} = ${fmt(H_ATM / g(0.995) / 1000, 3)}$ km, which passes in about ${fmt(H_ATM / g(0.995) / (0.995 * C) * 1e6, 2)} μs — a couple of lifetimes. The two frames tell different stories but agree on every event: the muon reaching the ground, or not.`,
      visual: {
        type: 'graph',
        params: { x: [0.9, 1], y: [0, 17], xlabel: 'muon speed v / c', ylabel: 'thickness of the atmosphere (km)', constants: { h: H_ATM / 1000 }, curves: [{ fn: 'h*sqrt(1 - x^2)', color: 'accent', domain: [0.9, 0.9999], label: 'in the muon’s frame', labelAt: 0.92 }], hlines: [{ y: H_ATM / 1000, label: 'in Earth’s frame', color: 'ink3' }], points: [{ x: 0.995, y: H_ATM / g(0.995) / 1000, color: 'gold' }] },
        caption: t`The ${H_ATM / 1000} km of atmosphere above the ground, measured in the falling muon’s frame: shorter by the factor $\gamma$. Gold: a muon at $0.995c$.`,
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ship', difficulty: 2,
      gen(r) {
        const v = r.pick([0.6, 0.8, 0.96, 0.28]);
        const hrs = r.pick([1, 2, 3, 5]);
        return {
          prompt: t`A spacecraft coasts past Earth at $${v}c$. The pilot’s watch shows ${hrs} hour${hrs > 1 ? 's' : ''} passing. How much time passes meanwhile in Earth’s frame?`,
          answer: hrs * g(v), units: 'h', tol: { rel: 0.005 },
          errors: [{ value: hrs / g(v), feedback: 'The pilot’s watch is the moving clock, so it records less time than Earth’s frame: multiply by γ.' }],
          hints: ['The pilot’s watch measures proper time Δτ; Earth’s frame measures Δt = γΔτ.'],
          teach: 'Earth-frame time is γ times the proper time shown by a moving clock.',
          explain: t`$\gamma = 1/\sqrt{1 - ${v}^2} = ${nice(g(v))}$, so $\Delta t = ${nice(g(v))}\times${hrs} = ${nice(hrs * g(v))}$ h.`,
          visual: { type: 'gr-light-clock', params: { beta: v, slider: false, triangle: false, readout: false, titles: ['a clock in Earth’s frame', 'the pilot’s clock, seen from Earth'] } },
        };
      },
    }),
    num({
      id: 'cp-gps', difficulty: 3, transfer: true,
      prompt: t`A GPS satellite moves at ${fmt(V_GPS / 1000, 4)} km/s. For speeds far below $c$, a moving clock falls behind by a fraction $\gamma - 1 \approx \dfrac{v^2}{2c^2}$ of the elapsed time. How many microseconds per day does the satellite’s clock lose because of its speed alone?`,
      answer: DAY * V_GPS ** 2 / (2 * C ** 2) * 1e6, units: 'μs', tol: { rel: 0.01 },
      errors: [{ value: DAY * V_GPS ** 2 / C ** 2 * 1e6, feedback: 'Keep the ½: the fraction is v²/(2c²).' }, { value: DAY * V_GPS / C * 1e6, feedback: 'Square the ratio v/c.' }],
      hints: [t`$v/c = ${fmt(V_GPS, 4)}/(2.998\times10^8) = ${tex(V_GPS / C, 3)}$.`, t`Fraction $= \tfrac12 (v/c)^2 = ${tex(V_GPS ** 2 / (2 * C ** 2), 3)}$; multiply by the ${DAY.toLocaleString('en-US')} s in a day and convert to μs.`],
      teach: 'At everyday speeds time dilation is the tiny fraction v²/(2c²) — still microseconds per day for a satellite.',
      explain: t`$\tfrac12(v/c)^2 = ${tex(V_GPS ** 2 / (2 * C ** 2), 3)}$; times 86 400 s gives ${fmt(DAY * V_GPS ** 2 / (2 * C ** 2) * 1e6, 3)} μs per day. Light travels about ${fmt(DAY * V_GPS ** 2 / (2 * C ** 2) * C / 1000, 2)} km in that time, so it matters. Gravity has a larger, opposite effect (+46 μs/day, step 23); the net +38 μs/day is corrected in every GPS satellite.`,
    }),
    mcq({
      id: 'cp-why', difficulty: 2,
      prompt: 'In your frame, why does a light clock that moves sideways past you tick more slowly than an identical clock at rest beside you?',
      choices: ['Its light runs along a longer, slanted path, but still at speed c', 'Its light moves more slowly than c because the clock is moving', 'Motion pushes its mirrors farther apart', 'You see its ticks late because its light takes time to reach you'],
      answer: 0,
      why: { 1: 'Light moves at c in every inertial frame, whatever the motion of its source — that is the second postulate.', 2: 'The mirror gap lies across the motion, and lengths across the motion are unchanged.', 3: 'Signal delays are corrected for; the slowdown is what remains.' },
      hints: ['Which two things set a tick’s duration: the length of the light’s path and…?'],
      teach: 'Same speed of light, longer path: the moving clock’s tick takes longer, by γ.',
      explain: t`A tick lasts (path length)/c. In your frame the pulse runs along the hypotenuse of a right triangle whose upright side is the mirror gap $L$, so its path is longer by $\gamma$ while its speed is still $c$.`,
      visual: { type: 'gr-light-clock', params: { beta: 0.6, slider: false, triangle: true, labels: false, readout: false } },
    }),
  ],
  sources: [
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 1–3', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'OpenStax University Physics Vol. 3, §5.3 Time dilation', url: 'https://openstax.org/books/university-physics-volume-3/pages/5-3-time-dilation' },
    { label: 'Bailey et al. (1977), relativistic time dilatation of muons in a circular orbit, Nature 268, 301', url: 'https://doi.org/10.1038/268301a0' },
    { label: 'Ashby (2003), Relativity in the Global Positioning System, Living Reviews', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5253894/' },
  ],
});
