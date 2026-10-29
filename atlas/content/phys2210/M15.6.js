// Driven oscillations and resonance: a periodic push near the natural
// frequency builds a large response; damping sets the height and width of
// the peak (Q). With the honest stories of pogo and the Tacoma Narrows Bridge.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, pn, springPic } from './_osc.js';

const t = String.raw;
const TAU = 2 * Math.PI;
const r4 = (v) => +(+v).toPrecision(6);

/** Steady-state amplitude of a driven, damped oscillator, per unit of F0/m. */
const amp = (w, w0, g2) => 1 / Math.sqrt((w0 * w0 - w * w) ** 2 + (g2 * w) ** 2);   // g2 = b/m

/** The four sides of a rectangle, as curves for a graph. */
const box = (x0, x1, y0, y1, color) => [[x0, y0, x1, y0], [x1, y0, x1, y1], [x1, y1, x0, y1], [x0, y1, x0, y0]]
  .map(([a, b, c, d]) => ({ param: [`${a} + t*${r4(c - a)}`, `${b} + t*${r4(d - b)}`], t: [0, 1], color, width: 1.8 }));

/** A resonance curve A(ω) for F0/m = f, ω0 = w0, b/m = g2. */
function resonance({ curves, x = [0, 20], y, numbers = true, points = [], hlines = [], caption, ylabel = 'amplitude A (m)' }) {
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x, y, xlabel: 'driving angular frequency ω (rad/s)', ylabel, ...(numbers ? { xticks: 10 } : { xticks: 0.001, yticks: 0.001 }),
      curves: curves.map((c) => ({ fn: `${r4(c.f)}/sqrt((${r4(c.w0 * c.w0)} - x^2)^2 + (${r4(c.g2)}*x)^2)`, color: c.color || 'accent', width: 2.4, label: c.label, labelAt: c.labelAt, labelDx: c.labelDx ?? 6, labelDy: c.labelDy ?? -10 })),
      points, hlines,
    },
    caption,
  };
}

export default lesson({
  id: 'phys2210.M15.6',
  title: 'Driven oscillations and resonance',
  minutes: 12, difficulty: 3,
  intro: t`Push an oscillator with a periodic force $F_0\cos\omega t$. Once the start-up wobble has died away it swings at the **driving** frequency $\omega$ — not its own — with a steady amplitude

$$A = \frac{F_0/m}{\sqrt{(\omega_0^2 - \omega^2)^2 + (b\omega/m)^2}}$$

Near the natural frequency $\omega_0 = \sqrt{k/m}$ the first term in the root vanishes and the amplitude can become very large: **resonance**. Only the damping limits it: at $\omega = \omega_0$ the amplitude is $F_0/(b\omega_0)$ — for light damping, the height of the peak to within a fraction of a percent. Its sharpness is measured by the **quality factor** $Q = m\omega_0/b$: the peak is $Q$ times the static stretch $F_0/k$, and about $\omega_0/Q$ wide. At resonance the push is always in step with the velocity, so it feeds energy in on every cycle.`,
  symbols: [
    { tex: 'F_0', text: 'the amplitude of the driving force, in N' },
    { tex: '\\omega', text: 'the driving angular frequency, in rad/s (set from outside)' },
    { tex: '\\omega_0 = \\sqrt{k/m}', text: 'the natural angular frequency of the undamped oscillator, in rad/s' },
    { tex: 'b', text: 'the damping coefficient, in kg/s' },
    { tex: 'A', text: 'the steady amplitude of the response, in m' },
    { tex: 'Q = m\\omega_0/b', text: 'the quality factor: high Q, a tall narrow peak; low Q, a low broad one' },
  ],
  why: 'Resonance is why engineers shake every spacecraft on a vibration table before launch, why a rocket can tear itself apart in a pogo oscillation, why radios can pick one station out of many — and, in reverse, why LIGO’s mirrors hang on pendulums tuned far from the frequencies they must ignore.',
  visual: {
    type: 'oscillator',
    title: 'Push at the right rhythm',
    lead: t`A 1 kg mass on a 4 N/m spring ($\omega_0 = 2$ rad/s), lightly damped, driven by a force $F_0\cos\omega_d t$. Change the driving frequency and watch the amplitude grow — or not. Press **Restart** after each change to see the start-up from rest.`,
    tasks: [
      t`Drive at $\omega_d = 2.0$ rad/s, right at $\omega_0$: the swings build up over many cycles to a large steady amplitude.`,
      'Drive at 1.0 or 4.0 rad/s: after a messy start the mass settles into small swings at the driving frequency.',
      'At resonance, double the damping b: the final amplitude halves, and it gets there sooner.',
    ],
    params: { kind: 'spring', m: 1, k: 4, b: 0.3, F0: 1, wd: 1.6, x0: 0 },
    caption: 'Linear spring, viscous damping and a sinusoidal driving force, integrated numerically from rest. The early motion mixes the natural and the driven oscillation; only the driven one survives.',
  },
  example: {
    prompt: t`A $1.0$ kg mass on a spring with $k = 16$ N/m and damping $b = 0.40$ kg/s is driven by a force of amplitude $F_0 = 1.0$ N. Find its natural frequency, its steady amplitude when driven at resonance and at $\omega = 2.0$ rad/s, and its $Q$.`,
    visual: resonance({ curves: [{ f: 1, w0: 4, g2: 0.4 }], x: [0, 8], y: [0, 0.75], points: [{ x: 4, y: 0.625, color: 'gold', label: 'ω = ω₀' }, { x: 2, y: r4(amp(2, 4, 0.4)), color: 'violet', label: 'ω = 2.0 rad/s', labelDx: -44, labelDy: -14 }], caption: 'The steady amplitude against the driving frequency for this oscillator: a resonance peak at ω₀ = 4 rad/s.' }),
    steps: [
      { label: 'Natural frequency', text: t`$\omega_0 = \sqrt{16/1.0} = 4.0$ rad/s.` },
      { label: 'At resonance', text: t`With $\omega = \omega_0$ the first term vanishes: $A = \dfrac{F_0/m}{b\omega_0/m} = \dfrac{F_0}{b\omega_0} = \dfrac{1.0}{(0.40)(4.0)} = 0.625\ \text{m}$.` },
      { label: 'Off resonance', text: t`$A = \dfrac{1.0}{\sqrt{(16 - 4.0)^2 + (0.40\times2.0)^2}} = \dfrac{1.0}{12.03} = 0.083\ \text{m}$ — only about 13 % as much.` },
      { label: 'Quality factor', text: t`$Q = m\omega_0/b = (1.0)(4.0)/0.40 = 10$. Check: the static stretch is $F_0/k = 0.0625$ m, and the resonant amplitude is $Q$ times it. ✓` },
    ],
    answer: t`$\omega_0 = 4.0$ rad/s; $A = 0.63$ m at resonance, $0.083$ m at 2.0 rad/s; $Q = 10$.`,
  },
  practice: [
    num({
      id: 'natural-f', difficulty: 1,
      gen(r) {
        const m = r.pick([0.25, 0.5, 2.0]), k = r.pick([100, 400, 900]);
        const f0 = Math.sqrt(k / m) / TAU;
        return {
          prompt: t`A ${m} kg mass on a spring with $k = ${k}$ N/m is lightly damped. At what driving frequency, in Hz, does it resonate?`,
          answer: f0, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(k / m), feedback: t`That is $\omega_0$ in rad/s. In hertz, divide by $2\pi$.` }],
          hints: [t`Resonance is at the natural frequency: $f_0 = \dfrac{1}{2\pi}\sqrt{k/m}$.`],
          teach: 'A lightly damped oscillator resonates when driven at its natural frequency.',
          explain: t`$f_0 = \dfrac{1}{2\pi}\sqrt{${k}/${m}} = \dfrac{${tn(Math.sqrt(k / m))}}{2\pi} = ${tn(f0)}\ \text{Hz}$.`,
          visual: springPic({ m: `${m} kg`, k: `k = ${k} N/m`, arrow: null, x: 0.3, v: 'F₀ cos ωt', vdir: 1, caption: 'A block on a spring, pushed back and forth by a periodic force (green); the light damping is not drawn. Not to scale.' }),
        };
      },
    }),
    mcq({
      id: 'which-curve', difficulty: 1,
      prompt: t`The graph shows the steady amplitude of the same mass and spring with three different dampers, driven by the same force. Which curve has the **least** damping?`,
      choices: ['U', 'W', 'V', 'None: all three have the same damping, since damping does not change a resonance curve'],
      answer: 0,
      why: {
        1: 'More damping removes more energy each cycle, so it limits the peak more: W, the low, broad curve, is the most heavily damped.',
        2: 'V is in between: more damped than U, less than W.',
        3: t`Damping is the only thing that limits the peak: its height is $F_0/(b\omega_0)$.`,
      },
      hints: [t`The peak height is $F_0/(b\omega_0)$.`],
      teach: 'Light damping gives a tall, narrow resonance peak; heavy damping a low, broad one.',
      explain: t`The peak height goes as $1/b$ and its width as $b/m$, so the least-damped oscillator, U, has the tallest and sharpest peak — the highest $Q$.`,
      visual: resonance({
        curves: [{ f: 1, w0: 10, g2: 0.8, label: 'U', labelAt: 10.4, labelDy: -2 }, { f: 1, w0: 10, g2: 2.5, label: 'V', labelAt: 10, labelDx: -3, labelDy: -12 }, { f: 1, w0: 10, g2: 6, label: 'W', labelAt: 9, labelDx: -3, labelDy: 16 }],
        y: [0, 0.14], numbers: false, caption: 'Resonance curves for three amounts of damping (no numbers on the axes). Same mass, spring and driving force.',
      }),
    }),
    num({
      id: 'amp-res', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 1.0, 2.0]), k = r.pick([50, 200]), b = r.pick([0.2, 0.5, 1.0]), F0 = r.pick([0.5, 1.0, 2.0]);
        const w0 = Math.sqrt(k / m), A = F0 / (b * w0);
        return {
          prompt: t`A ${m} kg mass on a spring ($k = ${k}$ N/m), with damping $b = ${b}$ kg/s, is driven at its natural frequency by a force of amplitude ${F0} N. What is its steady amplitude?`,
          answer: A, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: F0 / k, feedback: t`That is the static stretch $F_0/k$. At resonance the response is $Q$ times larger: $A = F_0/(b\omega_0)$.` }, { value: F0 / b, feedback: t`At resonance $A = F_0/(b\omega_0)$: divide by $\omega_0$ too.` }],
          hints: [t`At $\omega = \omega_0$ the formula reduces to $A = \dfrac{F_0}{b\omega_0}$.`, t`$\omega_0 = \sqrt{k/m}$.`],
          teach: 'At resonance only damping limits the amplitude: A = F₀/(bω₀).',
          explain: t`$\omega_0 = \sqrt{${k}/${m}} = ${tn(w0)}$ rad/s, so $A = \dfrac{${F0}}{${b}\times${tn(w0)}} = ${tn(A)}\ \text{m}$ — $Q = ${tn((m * w0) / b)}$ times the static stretch.`,
          visual: resonance({ curves: [{ f: F0 / m, w0, g2: b / m }], x: [0, 2 * w0], y: [0, 1.2 * A], numbers: false, caption: 'The resonance curve of this oscillator (no numbers on the axes): the peak is at the natural frequency.' }),
        };
      },
    }),
    num({
      id: 'q-from-graph', difficulty: 2,
      gen(r) {
        const Qd = r.pick([4, 5, 8]), w0 = 10, g2 = w0 / Qd, f = 10;
        // half-power points: A = A(ω0)/√2, solved exactly
        const Amax = amp(w0, w0, g2), target = 2 / (Amax * Amax);
        const B = 2 * w0 * w0 - g2 * g2, disc = Math.sqrt(B * B - 4 * (w0 ** 4 - target));
        const w1 = +Math.sqrt((B - disc) / 2).toFixed(2), w2 = +Math.sqrt((B + disc) / 2).toFixed(2);
        const Q = w0 / (w2 - w1);
        return {
          prompt: t`The resonance curve below peaks at $\omega_0 = 10.0$ rad/s. The amplitude falls to $1/\sqrt2$ of its peak at ${w1} rad/s and ${w2} rad/s. Estimate the quality factor $Q \approx \omega_0/\Delta\omega$.`,
          answer: Q, tol: { rel: 0.01 },
          errors: [{ value: (w2 - w1) / w0, feedback: 'Upside down: Q is the peak frequency divided by the width.' }, { value: w0 / (2 * (w2 - w1)), feedback: 'Δω is the full width between the two points, not half of it.' }],
          hints: [t`$\Delta\omega = ${w2} - ${w1}$.`],
          teach: 'Q is the resonance frequency divided by the peak’s full width at 1/√2 of its height.',
          explain: t`$\Delta\omega = ${w2} - ${w1} = ${tn(w2 - w1)}$ rad/s, so $Q \approx ${w0}/${tn(w2 - w1)} = ${tn(Q)}$ (the formula $m\omega_0/b$ gives ${Qd}).`,
          visual: resonance({
            curves: [{ f, w0, g2 }], x: [0, 20], y: [0, r4(1.2 * f * Amax)],
            points: [{ x: w1, y: r4((f * Amax) / Math.SQRT2), color: 'gold', label: `${w1}`, labelDx: -36 }, { x: w2, y: r4((f * Amax) / Math.SQRT2), color: 'gold', label: `${w2}` }],
            hlines: [{ y: r4((f * Amax) / Math.SQRT2), label: 'peak/√2', color: 'gold' }],
            caption: 'The measured resonance curve, with the two points where the amplitude is 1/√2 of its peak.',
          }),
        };
      },
    }),
    mcq({
      id: 'in-step', difficulty: 2,
      prompt: t`An oscillator is driven exactly at resonance. How does the driving force line up with the motion?`,
      choices: ['The force is in step with the velocity: it pushes forward all the way through each swing', 'The force is in step with the displacement: it pushes hardest at the ends', 'The force opposes the velocity, like friction', 'There is no fixed relation: they drift in and out of step'],
      answer: 0,
      why: {
        1: 'In step with the displacement is how a slow push behaves (well below resonance). At the ends the mass is at rest, and a force there does no work.',
        2: 'Then the drive would take energy out, not put it in — the amplitude would fall.',
        3: 'In the steady state the response locks onto the driving frequency with a fixed phase.',
      },
      hints: ['Energy flows in fastest when the force does positive work at every instant. When is F·v always positive?'],
      teach: 'At resonance the drive is in phase with the velocity (90° ahead of the displacement), so it does positive work all cycle.',
      explain: t`Power delivered is $Fv$. At resonance the displacement lags the force by 90°, which puts the velocity exactly in step with it: $Fv \ge 0$ throughout, so energy flows in on every swing — like pushing a swing as it moves away from you.`,
      visual: springPic({ x: 0, arrow: null, v: 'v', vdir: 1, damper: true, caption: 'The driven mass passing through equilibrium at full speed, moving right. The driving force is not drawn: which way, and how hard, should it push at this instant?' }),
    }),
    mcq({
      id: 'tacoma', difficulty: 3, kind: 'error',
      prompt: t`A popular account says: *“The Tacoma Narrows Bridge collapsed in 1940 because the wind pushed it in gusts at its natural frequency, like a child pumping a swing — a textbook case of resonance.”* What is wrong with it?`,
      choices: [
        'The wind was steady, not rhythmic: the bridge’s own twisting changed the airflow so that the wind fed energy into each twist — a self-excited oscillation called flutter',
        'Nothing: it is exactly forced resonance',
        'The bridge fell because of an earthquake, not the wind',
        'The wind was too gentle to matter; the steel simply wore out from fatigue over many years',
      ],
      answer: 0,
      why: {
        1: 'Forced resonance needs a push that repeats at the natural frequency. The wind that day was a fairly steady 60–70 km/h; nothing outside the bridge was oscillating at its frequency.',
        2: 'There was no earthquake: the collapse was filmed in a steady wind.',
        3: 'The wind was strong, and the twisting that destroyed the deck began that morning and grew to failure in about an hour, on film. Fatigue does not make a twist grow cycle by cycle.',
      },
      hints: ['In forced resonance, the push repeats at the natural frequency. Was anything repeating?', 'What if the motion itself shapes the force that drives it?'],
      teach: 'Tacoma Narrows was aeroelastic flutter — a self-excited oscillation fed by a steady wind — not simple forced resonance.',
      explain: t`In flutter the structure’s motion changes the aerodynamic forces in just the way that adds energy on each cycle, so a steady flow acts like negative damping and the amplitude grows at the structure’s own frequency. It looks like resonance, and the natural frequency matters, but the cause is a feedback loop. Modern bridge decks are wind-tunnel tested and shaped to avoid it; aircraft wings are designed against the same instability.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 20], y: [-1.15, 1.15], xticks: 0.001, yticks: 0.001, xlabel: 'time', ylabel: 'twist',
          curves: [{ fn: '0.08*exp(0.13*x)*sin(2.4*x)', color: 'accent', width: 2 }, { fn: '0.08*exp(0.13*x)', color: 'bad', width: 1.2, dash: true }, { fn: '-0.08*exp(0.13*x)', color: 'bad', width: 1.2, dash: true }],
        },
        caption: 'Self-excited flutter, sketched: in a steady wind the twisting grows on every cycle, as if the damping were negative. Not data.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bracket', difficulty: 2, transfer: true,
      gen(r) {
        const m = r.pick([0.2, 0.5, 1.2]), k = r.pick([5e4, 2e5, 8e5]);
        const f0 = Math.sqrt(k / m) / TAU;
        return {
          prompt: t`Before launch, a satellite is shaken on a vibration table that sweeps through frequencies, to find resonances that the rocket’s vibration could excite. An instrument of mass ${m} kg sits on a bracket that acts as a spring with $k = ${tn(k)}$ N/m. Near what frequency will it resonate, in Hz?`,
          answer: f0, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(k / m), feedback: 'That is ω₀ in rad/s; divide by 2π for hertz.' }],
          hints: [t`$f_0 = \dfrac{1}{2\pi}\sqrt{k/m}$.`],
          teach: 'A mounted part resonates at f₀ = (1/2π)√(k/m); vibration tests look for exactly these peaks.',
          explain: t`$f_0 = \dfrac{1}{2\pi}\sqrt{\dfrac{${tn(k)}}{${m}}} = ${tn(f0)}\ \text{Hz}$. A launch shakes its payload at everything from a few hertz to about 2000 Hz, so designers keep each part’s resonances away from the strongest bands — usually by stiffening its mounts — and add damping to lower the peaks.`,
          visual: springPic({ m: `${m} kg`, k: `bracket: k = ${pn(k)} N/m`, arrow: null, x: 0.3, caption: 'The instrument (block) on its bracket (spring), mounted on the satellite’s structure (wall), which the vibration table shakes back and forth. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'cp-q', difficulty: 3,
      gen(r) {
        const Q = r.pick([20, 50, 120]), x0 = r.pick([0.1, 0.2, 0.5]);   // static amplitude, mm
        return {
          prompt: t`A lightly damped structure with $Q = ${Q}$ is shaken very slowly by a force of fixed amplitude and moves ${x0} mm. The same force is then applied at its natural frequency. What steady amplitude does it reach?`,
          answer: Q * x0, units: 'mm', tol: { rel: 0.005 },
          errors: [{ value: x0, feedback: 'Driving at resonance multiplies the response: that is the whole danger of resonance.' }, { value: x0 * Math.sqrt(Q), feedback: t`The amplification at resonance is $Q$ itself, not $\sqrt{Q}$.` }],
          hints: ['Driven very slowly, the structure just stretches statically: A = F₀/k.', t`At resonance $A = F_0/(b\omega_0) = Q\,F_0/k$.`],
          teach: 'At resonance the amplitude is Q times the static (slow-push) displacement.',
          explain: t`$A_\text{res} = Q\,\dfrac{F_0}{k} = ${Q}\times${x0}\ \text{mm} = ${tn(Q * x0)}\ \text{mm}$.`,
          visual: resonance({ curves: [{ f: 1, w0: 10, g2: 10 / Q }], x: [0, 20], y: [0, r4(1.15 * amp(10, 10, 10 / Q))], numbers: false, ylabel: 'amplitude', caption: 'The structure’s resonance curve (no numbers on the axes): flat and low far below ω₀, a tall spike at ω₀.' }),
        };
      },
    }),
    mcq({
      id: 'cp-pogo', difficulty: 3, transfer: true,
      prompt: t`In a liquid-fuelled rocket, **pogo** is a lengthwise vibration that feeds itself: the structure vibrates, which makes the pressure at the pump inlets oscillate, which makes the thrust oscillate, which drives the structure. On Apollo 13 it shook the second stage’s centre engine so hard that the engine shut down early. Which fix attacks the cause?`,
      choices: [
        'Gas-filled accumulators in the propellant lines, so the feed system’s resonant frequency no longer matches the structure’s',
        'Burning the engines at higher thrust, to push through the vibration faster',
        'Strengthening the engine mounts and tank walls so they can survive the shaking',
        'Making the propellant tanks larger, so they hold more fuel',
      ],
      answer: 0,
      why: {
        1: 'More thrust adds more energy to the same loop; the oscillation is fed by the coupling, not by a lack of thrust.',
        2: 'That treats the symptom, not the cause: the loop would still pump energy into the vibration, which shakes the crew, the engines and their sensors.',
        3: 'Bigger tanks change the masses but not the coupling, and as propellant burns the frequencies sweep through each other anyway.',
      },
      hints: ['Pogo grows when two oscillating systems with matching frequencies drive each other.', 'Break the match between the structure’s frequency and the feed system’s.'],
      teach: 'Pogo is a resonance-coupled feedback loop; it is cured by detuning or damping the propellant feed system.',
      explain: t`A gas pocket in the feed line acts as a soft spring, lowering the line’s resonant frequency well below the structure’s, so the loop can no longer pump energy in step. NASA added accumulators like this after Apollo 13; pogo suppressors are standard on liquid-fuelled launchers.`,
      visual: {
        type: 'graph',
        params: {
          aspect: 'wide', x: [0, 10], y: [0, 5], equal: true, xlabel: '', ylabel: '', axes: false, grid: false,
          curves: [
            ...box(3.2, 6.8, 3.6, 4.6, 'accent'), ...box(0.2, 4.2, 0.6, 1.6, 'warn'), ...box(5.8, 9.8, 0.6, 1.6, 'good'),
          ],
          arrows: [{ from: [4.2, 3.5], to: [2.6, 1.7], color: 'ink2' }, { from: [4.3, 1.1], to: [5.7, 1.1], color: 'ink2' }, { from: [7.4, 1.7], to: [5.8, 3.5], color: 'ink2' }],
          points: [{ x: 4.3, y: 4.1, r: 0.01, color: 'accent', label: 'structure vibrates' }, { x: 0.45, y: 1.1, r: 0.01, color: 'warn', label: 'pump inlet pressure swings' }, { x: 6.85, y: 1.1, r: 0.01, color: 'good', label: 'thrust oscillates' }],
        },
        caption: 'The pogo feedback loop. Each link passes the oscillation on; if the loop’s gain exceeds the damping at a shared frequency, the vibration grows.',
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §15.6 Forced Oscillations', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations' },
    { label: 'K. Y. Billah and R. H. Scanlan, “Resonance, Tacoma Narrows bridge failure, and undergraduate physics textbooks”, Am. J. Phys. 59, 118 (1991)', url: 'https://doi.org/10.1119/1.16590' },
  ],
});
