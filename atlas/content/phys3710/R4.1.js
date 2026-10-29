// Testing special relativity with three kinds of clock: unstable particles
// (Frisch and Smith's muon counts on Mount Washington; pion decay in a beam
// line), atomic clocks flown round the world (Hafele and Keating, split into
// its velocity and gravity parts in a simplified equatorial model), and
// particles in accelerators (Bertozzi's time-of-flight test of the
// speed–energy relation; how far a 50 GeV electron trails light down SLAC's
// linac). Builds on gr.S02.i (cosmic muons at 0.995c from 15 km, storage-ring
// lifetimes, GPS's velocity term), phys2710.MP2.2 (the 2010 aluminium-ion
// clocks, muon fractions) and gr.S23.i (GPS, Pound–Rebka) without repeating
// their examples.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, fmt, tex } from '../../src/core/format.js';
import { C, r6, st, label } from './_geom.js';

const t = String.raw;
const TAU = 2.1969811e-6;              // s, muon mean lifetime at rest (PDG)
const CTAU = C * TAU;                  // m, 658.6
const TAU_PI = 2.6033e-8;              // s, charged-pion mean lifetime (PDG)
const M_PI = 139.57039;                // MeV
const ME = 0.51099895;                 // MeV
const V_EQ = 465.1;                    // m/s, Earth's rotation speed at the equator
const R_EQ = 6.378e6;                  // m
const G0 = 9.81;

// Frisch & Smith (1963): counts per hour at the summit and at sea level, 1907 m apart
const FS = { top: 563, bottom: 408, h: 1907, b: 0.995 };
FS.own = TAU * Math.log(FS.top / FS.bottom);
FS.lab = FS.h / (FS.b * C);
FS.none = FS.top * Math.exp(-FS.lab / TAU);

// the worked example: an idealized equatorial circumnavigation
const HK = { v: 230, h: 10000 };
HK.T = 2 * Math.PI * (R_EQ + HK.h) / HK.v;
HK.east = -((V_EQ + HK.v) ** 2 - V_EQ ** 2) / (2 * C * C) * HK.T * 1e9;
HK.west = -((V_EQ - HK.v) ** 2 - V_EQ ** 2) / (2 * C * C) * HK.T * 1e9;
HK.grav = G0 * HK.h / (C * C) * HK.T * 1e9;

/** Muon survival against distance travelled, with and without time dilation. */
function survival({ g = null, sliders = null, readouts = null, data = true, caption }) {
  const G = g === null ? 'g' : r6(g);
  return {
    type: 'graph',
    params: {
      x: [0, 4], y: [0, 1.08], aspect: 'wide', xlabel: 'distance travelled (km)', ylabel: 'fraction still alive',
      curves: [
        { fn: `exp(-x*1000/(sqrt(${G}^2 - 1)*${r6(CTAU)}))`, color: 'accent', width: 2.4, label: 'with time dilation', labelAt: 3, labelDy: -12 },
        { fn: `exp(-x*1000/(sqrt(1 - 1/${G}^2)*${r6(CTAU)}))`, color: 'bad', dash: true, width: 2, label: 'if moving clocks kept lab time', labelAt: 0.75, labelDx: 8, labelDy: -4 },
      ],
      ...(data ? { points: [{ x: 0, y: 1, color: 'gold', r: 5, label: 'summit: 563 per hour', labelDx: 10, labelDy: 10 }, { x: r6(FS.h / 1000), y: r6(FS.bottom / FS.top), color: 'gold', r: 5, label: 'sea level: 408', labelDx: 10, labelDy: 14 }], vlines: [{ x: r6(FS.h / 1000), label: '1907 m', color: 'ink3' }] } : {}),
      ...(sliders ? { sliders } : {}), ...(readouts ? { readouts } : {}),
    },
    caption: caption ?? t`Fraction of muons surviving after travelling a given distance, for a fixed speed. Gold: Frisch and Smith’s counts (1963), normalized to the summit. The model ignores the muons’ slowing in the air, which the real analysis corrected for.`,
  };
}

/** Earth seen from above the North Pole, in the non-rotating frame: ground, eastbound and westbound speeds as arrows. */
function equator({ v = HK.v, caption }) {
  const s = 1 / 600;                   // arrow length per m/s
  return {
    type: 'graph',
    params: {
      x: [-1.7, 1.3], y: [-1.15, 1.45], equal: true, aspect: 'wide', axes: false, grid: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '',
      curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'accent', width: 2 }, { param: ['0.35*cos(t)', '0.35*sin(t)'], t: [0.3, 2.6], color: 'ink3', width: 1.4 }],
      arrows: [
        { from: [0, 1.0], to: [r6(-V_EQ * s), 1.0], color: 'ink2', width: 2.4, label: `ground ${V_EQ} m/s`, labelDx: -6, labelDy: 14, labelAlign: 'right' },
        { from: [0, 1.17], to: [r6(-(V_EQ + v) * s), 1.17], color: 'gold', width: 2.4, label: `eastbound ${nice(V_EQ + v, 4)} m/s`, labelDx: -6, labelDy: -8, labelAlign: 'right' },
        { from: [0, 1.34], to: [r6(-(V_EQ - v) * s), 1.34], color: 'violet', width: 2.4, label: `westbound ${nice(V_EQ - v, 4)} m/s`, labelDx: -6, labelDy: -8, labelAlign: 'right' },
        { from: [-0.2706, 0.232], to: [-0.3221, 0.1463], color: 'ink3', width: 1.6 },
      ],
      points: [label(0, 0, 'North Pole', 'ink3', 0, 16, 'center'), { x: 0, y: 1, r: 4, color: 'ink2' }],
    },
    caption: caption ?? t`The equator seen from above the North Pole, in the frame that does not rotate with the Earth (the grey arrow shows the spin, eastward). Speeds at one instant, to scale with each other; the planes’ altitude is not drawn.`,
  };
}

export default lesson({
  id: 'phys3710.R4.1',
  title: 'Muons, clocks on planes and particle accelerators',
  minutes: 12, difficulty: 2,
  intro: t`Special relativity makes sharp, testable claims, and three kinds of clock have tested them: **unstable particles**, whose decay is a clock; **atomic clocks** flown around the world; and **particles in accelerators**, whose measured energy fixes their speed. All of them check one relation, which links how fast a clock runs to the energy it carries:

$$\frac{d\tau}{dt} = \frac{1}{\gamma}, \qquad \gamma = \frac{1}{\sqrt{1 - v^2/c^2}} = \frac{E}{mc^2}$$

A clock moving at $v$ through an inertial frame records less time than that frame’s clocks, by the same factor $\gamma$ by which its energy exceeds its rest energy. [Light clocks, time dilation and the muon](#/lesson/gr.S02.i) met cosmic-ray muons; here are the experiments that turned the prediction into measurement, and how to read them.`,
  symbols: [
    { tex: '\\tau', text: 'proper time: what the moving clock (or the particle’s internal decay clock) records, in s' },
    { tex: 't', text: 'time in the inertial frame the clock moves through — the laboratory, or the frame of the Earth’s centre — in s' },
    { tex: 'v', text: 'the clock’s speed in that frame, in m/s' },
    { tex: 'c', text: t`the speed of light, $299{,}792{,}458$ m/s` },
    { tex: '\\gamma', text: 'the Lorentz factor: how much faster the frame’s clocks run than the moving one' },
    { tex: 'E,\\ mc^2', text: 'the particle’s total energy and its rest energy, in MeV: their ratio is γ, which is how accelerators measure it' },
  ],
  why: 'These tests are why GPS, particle accelerators and the timing of every deep-space mission build relativity in from the start — the effects are measured, not hypothetical.',
  visual: {
    ...survival({
      sliders: [{ key: 'g', label: t`Muon Lorentz factor $\gamma$`, min: 1.5, max: 30, step: 0.1, value: 9, explain: t`Muons at the speeds Frisch and Smith selected, about $0.995c$, would have $\gamma \approx 10$; slowing in the air brings the average down.` }],
      readouts: [
        { label: t`speed $v/c$`, expr: 'sqrt(1 - 1/g^2)', digits: 5 },
        { label: t`mean decay length $\gamma\beta c\tau$`, expr: `sqrt(g^2 - 1)*${r6(CTAU)}/1000`, digits: 3, unit: t`\text{km}` },
        { label: 'alive after 1907 m', expr: `exp(-1907/(sqrt(g^2 - 1)*${r6(CTAU)}))*100`, digits: 3, unit: t`\%` },
        { label: 'without dilation', expr: `exp(-1907/(sqrt(1 - 1/g^2)*${r6(CTAU)}))*100`, digits: 3, unit: t`\%` },
      ],
    }),
    title: 'Counting muons down a mountain',
    lead: t`In 1963 David Frisch and James Smith counted muons of one narrow speed band on the summit of Mount Washington and again at sea level, 1907 m lower. The red curve is what Newton’s absolute time predicts; the blue one includes time dilation. Slide $\gamma$ until the blue curve passes through the sea-level count.`,
    tasks: [
      t`At $\gamma \approx 9$ the blue curve meets the gold point: about 72% survive the trip.`,
      t`The red curve barely moves with $\gamma$: without time dilation only about 5% of the muons — around 30 an hour — would reach sea level, whatever their speed.`,
      t`Drop $\gamma$ to 2 and see how strongly survival depends on speed once time dilation is in: that is why the speed had to be selected.`,
    ],
  },
  example: {
    prompt: t`In an idealized version of Hafele and Keating’s 1971 experiment, atomic clocks fly once round the equator at ${HK.v} m/s relative to the ground, ${HK.h / 1000} km up, one eastward and one westward, and are compared with a clock left on the ground. Work in the non-rotating frame of the Earth’s centre, where the ground clock moves at ${V_EQ} m/s. Find each flying clock’s gain or loss.`,
    visual: equator({}),
    steps: [
      { label: 'Why that frame', text: t`A clock on the rotating Earth is not inertial, but the frame of the Earth’s centre is (to the accuracy needed here). In it all three clocks move, at ${V_EQ} m/s (ground), ${nice(V_EQ + HK.v, 4)} m/s (east) and ${nice(V_EQ - HK.v, 4)} m/s (west).` },
      { label: 'Flight time', text: t`Once round at ${HK.h / 1000} km altitude: $T = 2\pi(R + h)/v = ${tex(HK.T, 4)}$ s, about $${nice(HK.T / 3600, 3)}$ hours.` },
      { label: 'Velocity part', text: t`Each clock runs slow by $v^2/2c^2$, so a flying clock gains on the ground clock by $-\left[(V \pm v)^2 - V^2\right]T/2c^2$. East: $${nice(HK.east, 3)}$ ns. West: $+${nice(HK.west, 3)}$ ns — the westbound plane cancels part of the Earth’s spin and moves *slower* than the ground.` },
      { label: 'Gravity part', text: t`Higher up, a clock runs fast by $gh/c^2$ (general relativity, [Clocks run slow low down](#/lesson/gr.S23.i)): $+${nice(HK.grav, 3)}$ ns for either flight.` },
      { label: 'Compare', text: t`Net: east $${nice(HK.east + HK.grav, 3)}$ ns, west $+${nice(HK.west + HK.grav, 3)}$ ns. Hafele and Keating’s real flights — airliners with stops, at many latitudes and heights — predicted $-40 \pm 23$ ns and $+275 \pm 21$ ns, and their clocks measured $-59 \pm 10$ ns and $+273 \pm 7$ ns. The idealized model gets the signs and sizes right.` },
    ],
    answer: t`East: about $${nice(HK.east + HK.grav, 2)}$ ns (velocity $${nice(HK.east, 3)}$, gravity $+${nice(HK.grav, 3)}$). West: about $+${nice(HK.west + HK.grav, 3)}$ ns (velocity $+${nice(HK.west, 3)}$, gravity $+${nice(HK.grav, 3)}$).`,
  },
  practice: [
    num({
      id: 'muon-own-time', difficulty: 2,
      prompt: t`Frisch and Smith counted $563$ muons per hour on the summit and $408$ per hour at sea level, for muons in the same narrow speed band. A muon’s internal clock decays it with mean life $\tau_0 = 2.197\ \mu\text{s}$, so the surviving fraction is $e^{-\tau/\tau_0}$, where $\tau$ is the time on the muons’ own clocks. How much time passed on their clocks during the descent, in μs?`,
      visual: survival({ g: 9, caption: t`The two counts (gold), normalized to the summit, on the survival curve for $\gamma = 9$. The red curve is what absolute time would predict.` }),
      answer: FS.own * 1e6, units: 'us', tol: { rel: 0.005 },
      errors: [{ value: FS.lab * 1e6, feedback: 'That is the time in the Earth’s frame. The counts measure the muons’ own clock: solve $408/563 = e^{-\\tau/\\tau_0}$ for τ.' }],
      hints: [t`$\tau = \tau_0\ln(563/408)$.`, t`$\ln(563/408) = ${nice(Math.log(FS.top / FS.bottom), 4)}$.`],
      teach: 'Decay is a clock: the fraction of muons surviving tells you how much proper time they experienced.',
      explain: t`$\tau = 2.197\ \mu\text{s}\times${nice(Math.log(FS.top / FS.bottom), 4)} = ${nice(FS.own * 1e6, 3)}\ \mu\text{s}$. In the Earth’s frame the descent took $1907\ \text{m}/(0.995c) = ${nice(FS.lab * 1e6, 3)}\ \mu\text{s}$: the muons’ clocks ran about $${nice(FS.lab / FS.own, 2)}$ times slow.`,
    }),
    num({
      id: 'no-dilation', difficulty: 2,
      prompt: t`Suppose moving clocks kept the same time as the Earth’s. Muons at $0.995c$ take $1907\ \text{m}/(0.995c)$ to descend from the summit, where $563$ arrive per hour. How many per hour would reach sea level? (Mean life $2.197\ \mu\text{s}$; ignore their slowing in the air.)`,
      visual: survival({ g: 9, data: false, caption: t`Red dashed: survival if moving clocks kept laboratory time. Blue: with time dilation, $\gamma = 9$.` }),
      answer: FS.none, tol: { rel: 0.01 },
      errors: [{ value: FS.bottom, feedback: 'That is what was measured. The question asks what absolute time would predict.' }],
      hints: [t`The descent takes $${nice(FS.lab * 1e6, 4)}\ \mu\text{s}$ in the Earth’s frame.`, t`$563\,e^{-${nice(FS.lab * 1e6, 4)}/2.197}$.`],
      teach: 'Without time dilation, a muon’s survival would follow laboratory time — and almost none would reach the ground.',
      explain: t`$563\times e^{-${nice(FS.lab / TAU, 4)}} = ${nice(FS.none, 3)}$ per hour, against the $408$ measured. Frisch and Smith’s fuller analysis allowed for the muons’ slowing in the air; either way, the factor of more than ten between prediction and count is time dilation.`,
    }),
    num({
      id: 'bertozzi', difficulty: 2,
      gen(r) {
        const K = r.pick([0.5, 1, 1.5, 4.5, 15]);
        const g = 1 + K / ME, b = Math.sqrt(1 - 1 / (g * g)), ans = 8.4 / (b * C) * 1e9, vN = Math.sqrt(2 * K / ME);
        return {
          prompt: t`In 1964 William Bertozzi timed electrons from an accelerator over a flight path of about 8.4 m, after measuring their kinetic energy by the heat they deposited in a target. For electrons of kinetic energy ${K} MeV ($m_ec^2 = 0.511$ MeV), what flight time does relativity predict, in ns?`,
          visual: {
            type: 'graph',
            params: { x: [0, 16], y: [0, 2.2], aspect: 'wide', xlabel: 'kinetic energy (MeV)', ylabel: 'speed v/c',
              curves: [{ fn: `sqrt(1 - 1/(1 + x/${ME})^2)`, color: 'accent', width: 2.4, label: 'relativity: γ = 1 + K/mc²', labelAt: 9, labelDy: 18 }, { fn: `sqrt(2*x/${ME})`, color: 'bad', dash: true, domain: [0, 1.2], label: 'Newton: K = ½mv²', labelAt: 1.1, labelDx: 10 }],
              hlines: [{ y: 1, label: 'v = c', color: 'warn' }], vlines: [{ x: K, color: 'gold', label: `${K} MeV` }] },
            caption: 'Electron speed against kinetic energy. Bertozzi’s measured speeds followed the blue curve, levelling off at c, while kinetic energy grew without limit.',
          },
          answer: ans, units: 'ns', tol: { rel: 0.003 },
          errors: [{ value: 8.4 / (vN * C) * 1e9, feedback: t`That uses Newton’s $K = \tfrac12 mv^2$, which gives a speed of $${nice(vN, 3)}c$ — faster than light. Use $\gamma = 1 + K/mc^2$.` }, ...(K <= 1.5 ? [{ value: 8.4 / C * 1e9, feedback: 'That is light’s time. The electron is a little slower: find β from γ.' }] : [])],
          hints: [t`$\gamma = 1 + K/m_ec^2 = ${nice(g, 4)}$, so $\beta = \sqrt{1 - 1/\gamma^2}$.`, t`$t = 8.4\ \text{m}/(\beta c)$; light takes $28.02$ ns.`],
          teach: 'An accelerator measures energy; relativity turns it into speed through γ = E/mc² — and the speed never reaches c.',
          explain: t`$\beta = ${nice(b, 4)}$, so $t = ${nice(ans, 4)}$ ns. Newton would predict $${nice(8.4 / (vN * C) * 1e9, 3)}$ ns. Bertozzi’s times matched relativity: past a few MeV, more energy hardly changes the speed.`,
        };
      },
    }),
    num({
      id: 'plane-velocity', difficulty: 2,
      gen(r) {
        const v = r.pick([220, 250, 260]), dir = r.pick(['east', 'west']);
        const T = 2 * Math.PI * R_EQ / v, Vp = dir === 'east' ? V_EQ + v : V_EQ - v;
        const ans = -(Vp * Vp - V_EQ * V_EQ) / (2 * C * C) * T * 1e9;
        return {
          prompt: t`An atomic clock flies once round the equator heading ${dir}, at ${v} m/s relative to the ground (ignore its height). In the non-rotating frame of the Earth’s centre the ground clock moves at ${V_EQ} m/s. Counting only the velocity effect, how many nanoseconds does the flying clock gain on the ground clock? (Negative means it loses.)`,
          visual: equator({ v }),
          answer: ans, units: 'ns', tol: { rel: 0.005 },
          errors: [{ value: -(v * v) / (2 * C * C) * T * 1e9, feedback: 'That treats the ground as at rest. In the inertial frame of the Earth’s centre the ground moves too: compare (V ± v)² with V².' }, { value: -ans, feedback: 'Check the sign: the faster clock (in the non-rotating frame) runs slower.' }],
          hints: [t`Flight time $T = 2\pi R/v = ${tex(T, 4)}$ s with $R = 6378$ km.`, t`Gain $= -\left[(${V_EQ} ${dir === 'east' ? '+' : '-'} ${v})^2 - ${V_EQ}^2\right]T/2c^2$.`],
          teach: 'For clocks on a spinning Earth, compare speeds in the non-rotating frame: eastbound planes move faster than the ground there, westbound ones slower.',
          explain: t`$${nice(ans, 3)}$ ns. ${dir === 'east' ? 'Eastbound, the plane adds to the Earth’s spin, so its clock loses.' : 'Westbound, the plane subtracts from the Earth’s spin and moves slower than the ground clock, so it gains.'}`,
        };
      },
    }),
    mcq({
      id: 'why-east', difficulty: 2,
      prompt: 'In Hafele and Keating’s experiment, why did the eastbound clocks lose time on the ground clock while the westbound clocks gained?',
      visual: equator({}),
      choices: [
        'In the inertial frame of the Earth’s centre, eastbound planes move faster than the ground and westbound ones slower',
        'Eastbound planes fly against the Earth’s rotation',
        'The ground clock is the one at rest, so only the planes’ clocks are slowed, and westbound winds made those flights slower',
        'The acceleration of take-off and landing slowed the eastbound clocks more',
      ],
      answer: 0,
      why: {
        1: 'The Earth turns eastward, so eastbound planes fly *with* its rotation.',
        2: 'The ground clock is not inertial — it rides the spinning Earth — so it cannot be treated as at rest. Both directions slow by their speed in the non-rotating frame.',
        3: 'The clock hypothesis: a clock’s rate depends on its speed, not its acceleration. Take-offs were similar in both directions anyway.',
      },
      hints: ['Which frame here is inertial: the ground’s, or the non-rotating frame of the Earth’s centre?', 'In that frame, the ground moves east at 465 m/s at the equator.'],
      teach: 'Time-dilation comparisons must be made in an inertial frame; on the spinning Earth that is the frame of its centre.',
      explain: t`In the non-rotating frame the ground moves east at about 465 m/s. An eastbound plane adds its speed, so its clock runs slower than the ground’s; a westbound one subtracts, so its clock runs faster. Gravity (higher clocks run fast) adds a gain to both.`,
    }),
    num({
      id: 'slac', difficulty: 3,
      gen(r) {
        const [EGeV, L] = r.pick([[50, 3200], [30, 3200], [20, 3200]]);
        const g = EGeV * 1e3 / ME, oneMinusB = 1 / (g * g * (1 + Math.sqrt(1 - 1 / (g * g)))), ans = L * oneMinusB * 1e9;
        return {
          prompt: t`SLAC’s linear accelerator in California is 3.2 km long. An electron leaves the start together with a flash of light and is accelerated, but suppose for simplicity it had its final energy of ${EGeV} GeV the whole way. By how many nanometres does it trail the light at the end? ($m_ec^2 = 0.511$ MeV; for large $\gamma$, $1 - \beta \approx 1/2\gamma^2$.)`,
          visual: st({ x: [-0.2, 3.6], t: [-0.2, 3.8], cones: [[0, 0, 'future']], xlabel: 'x (km)', ylabel: 'ct (km)', numbers: false,
            lines: [{ pts: [[0, 0], [3.2, 3.2]], color: 'warn', width: 1.6 }, { pts: [[0, 0], [3.0, 3.2]], color: 'accent', width: 2.2, label: 'electron', at: 0, dx: 10, dy: 10 }],
            events: [[3.2, 3.2, 'end of the linac', 'gold', -10, -8, 'right']],
            caption: 'Light and an electron down the linac, c = 1 with distances in km. The gap is drawn hugely enlarged: really the two lines are indistinguishable.' }),
          answer: ans, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: ans * 2, feedback: t`$1 - \beta \approx 1/(2\gamma^2)$ — keep the 2.` }],
          hints: [t`$\gamma = ${EGeV}\ \text{GeV}/0.511\ \text{MeV} = ${nice(g, 4)}$.`, t`Gap $= L(1 - \beta) \approx L/2\gamma^2$.`],
          teach: 'At accelerator energies 1 − β ≈ 1/2γ² is tiny: the particles move at light’s speed to many decimal places, but never at it.',
          explain: t`$1 - \beta = ${tex(oneMinusB, 3)}$, so the gap is $${nice(ans, 3)}$ nm after 3.2 km — about the wavelength of light, or less. The electrons really did gain energy all along, so the true lag is larger, but the point stands: more energy no longer means more speed.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pions', difficulty: 3, transfer: true,
      gen(r) {
        const [p, L] = r.pick([[2, 200], [5, 200], [10, 200], [5, 675], [10, 675]]);
        const len = (p * 1e3 / M_PI) * C * TAU_PI, ans = (1 - Math.exp(-L / len)) * 100;
        return {
          prompt: t`An accelerator neutrino beam is made by sending charged pions down an evacuated decay pipe, where some decay to muons and neutrinos. The pions have momentum $${p}$ GeV/$c$ ($m_\pi c^2 = 139.57$ MeV, mean life $26.03$ ns) and the pipe is ${L} m long. What percentage of them decay inside it? (The mean decay length is $\gamma\beta c\tau = (p/mc)\,c\tau$.)`,
          visual: {
            type: 'graph',
            params: { x: [0, 1500], y: [0, 1.05], aspect: 'wide', xlabel: 'distance along the pipe (m)', ylabel: 'fraction still pions',
              curves: [{ fn: `exp(-x/${r6(len)})`, color: 'accent', width: 2.4 }], vlines: [{ x: L, label: 'end of pipe', color: 'gold' }] },
            caption: 'Pions surviving along the beam line. Without time dilation they would all be gone within a few tens of metres.',
          },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 100 * (1 - Math.exp(-L / (C * TAU_PI))), feedback: 'Without time dilation essentially all would decay. The pion’s clock runs slow by γ, so its decay length is γβcτ.' }],
          hints: [t`$c\tau = 7.80$ m and $p/mc = ${p}\ \text{GeV}/0.13957\ \text{GeV} = ${nice(p * 1e3 / M_PI, 4)}$.`, t`Fraction decayed $= 1 - e^{-L/(\gamma\beta c\tau)}$.`],
          teach: 'An unstable particle’s decay length is γβcτ: time dilation sets how long a decay pipe must be.',
          explain: t`Decay length $= ${nice(p * 1e3 / M_PI, 4)}\times7.80\ \text{m} = ${nice(len, 4)}$ m, so $1 - e^{-${L}/${nice(len, 4)}} = ${nice(ans, 3)}\%$ decay in the pipe. Neutrino-beam designers size their decay pipes with exactly this time dilation.`,
        };
      },
    }),
    num({
      id: 'cp-flight', difficulty: 3, transfer: true,
      gen(r) {
        const v = r.pick([240, 250]), hkm = r.pick([10, 12]);
        const T = 2 * Math.PI * (R_EQ + hkm * 1e3) / v;
        const vel = -((V_EQ - v) ** 2 - V_EQ ** 2) / (2 * C * C) * T * 1e9, grav = G0 * hkm * 1e3 / (C * C) * T * 1e9, ans = vel + grav;
        return {
          prompt: t`An atomic clock flies westward once round the equator at ${v} m/s relative to the ground, ${hkm} km up. Including both effects — the velocity effect in the non-rotating frame (the ground moves at ${V_EQ} m/s there) and the gravitational speed-up $gh/c^2$ with $g = 9.81\ \text{m/s}^2$ — how many nanoseconds does it gain on a clock that stayed on the ground? (Take the flight time as $2\pi(R + h)/v$ with $R = 6378$ km.)`,
          visual: equator({ v }),
          answer: ans, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: grav, feedback: 'That is the gravity part alone. Westbound, the velocity effect adds a gain too.' }, { value: vel, feedback: 'That is the velocity part alone; add the gravitational gain gh/c² × T.' }],
          hints: [t`$T = ${tex(T, 4)}$ s.`, t`Velocity: $-\left[(${V_EQ} - ${v})^2 - ${V_EQ}^2\right]T/2c^2$. Gravity: $ghT/c^2$.`],
          teach: 'A flown clock’s offset is the sum of a velocity term (in the non-rotating frame) and a gravitational term gh/c².',
          explain: t`Velocity $+${nice(vel, 3)}$ ns, gravity $+${nice(grav, 3)}$ ns: total $+${nice(ans, 3)}$ ns. Hafele and Keating’s westbound clocks gained $273 \pm 7$ ns.`,
        };
      },
    }),
    mcq({
      id: 'cp-bertozzi', difficulty: 2,
      prompt: 'Bertozzi gave electrons kinetic energies from 0.5 to 15 MeV — a factor of 30 — and timed them over the same path. What did he find?',
      visual: {
        type: 'graph',
        params: { x: [0, 16], y: [0, 1.2], aspect: 'wide', xlabel: 'kinetic energy (MeV)', ylabel: 'speed v/c',
          curves: [{ fn: `sqrt(1 - 1/(1 + x/${ME})^2)`, color: 'accent', width: 2.4 }], hlines: [{ y: 1, label: 'v = c', color: 'warn' }] },
        caption: 'The relativistic prediction for an electron’s speed against its kinetic energy.',
      },
      choices: ['The speed rose only from about 0.86c to 0.9995c, never reaching c, while the energy delivered to the target rose 30-fold', 'The speed rose about fivefold, as √K', 'The fastest electrons exceeded c', 'All the electrons arrived at exactly c'],
      answer: 0,
      why: {
        1: 'Newton’s K = ½mv² predicts v ∝ √K — about fivefold here, and faster than light above 0.26 MeV.',
        2: 'No electron was ever timed faster than light.',
        3: 'Their times were all a little longer than light’s, by amounts that shrank with energy as relativity predicts.',
      },
      hints: ['Use γ = 1 + K/mc² at both ends of the range.'],
      teach: 'Energy grows without limit while speed approaches c: the core prediction of relativistic dynamics, tested directly.',
      explain: t`At 0.5 MeV $\gamma = 1.98$ and $v = 0.86c$; at 15 MeV $\gamma = 30.4$ and $v = 0.9995c$. The calorimeter confirmed that the electrons really carried the extra energy — it went into $\gamma$, not into speed.`,
    }),
  ],
  sources: [
    { label: 'Frisch & Smith (1963), Measurement of the relativistic time dilation using μ-mesons, Am. J. Phys. 31, 342', url: 'https://doi.org/10.1119/1.1969508' },
    { label: 'Hafele & Keating (1972), Around-the-world atomic clocks: observed relativistic time gains, Science 177, 168', url: 'https://doi.org/10.1126/science.177.4044.168' },
    { label: 'Bertozzi (1964), Speed and kinetic energy of relativistic electrons, Am. J. Phys. 32, 551', url: 'https://doi.org/10.1119/1.1970770' },
    { label: 'Particle Data Group: muon and charged-pion lifetimes', url: 'https://pdg.lbl.gov/' },
  ],
});
