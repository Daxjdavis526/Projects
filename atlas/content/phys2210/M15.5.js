// Damped oscillations: a drag force −bv makes the amplitude decay as
// e^(−bt/2m), slows the oscillation slightly, and — at b = 2√(km) — stops it
// oscillating at all.
import { lesson, mcq, num } from '../../src/core/content.js';
import { s3, tn, pn, springPic, dampedGraph } from './_osc.js';

const t = String.raw;
const LN2 = Math.LN2;

// the three regimes for ω₀ = 2 rad/s, released from rest at x = 1
const REGIMES = {
  type: 'graph',
  params: {
    aspect: 'wide', x: [0, 6], y: [-0.75, 1.15], xlabel: 't (s)', ylabel: 'x / x₀',
    curves: [
      { fn: 'exp(-0.3*x)*(cos(1.977*x) + 0.1517*sin(1.977*x))', color: 'accent', width: 2.2, label: 'under-damped', labelAt: 1.55, labelDy: 16 },
      { fn: '(1 + 2*x)*exp(-2*x)', color: 'good', width: 2.4, label: 'critical', labelAt: 1.2, labelDx: 4, labelDy: -6 },
      { fn: '1.07735*exp(-0.5359*x) - 0.07735*exp(-7.4641*x)', color: 'warn', width: 2.2, label: 'over-damped', labelAt: 3.3, labelDy: -10 },
    ],
  },
  caption: 'The same mass and spring (ω₀ = 2 rad/s), released from rest, with light damping (blue), critical damping (green) and heavy damping (amber). Critical damping returns to rest fastest without overshooting.',
};

export default lesson({
  id: 'phys2210.M15.5',
  title: 'Damped oscillations',
  minutes: 11, difficulty: 3,
  intro: t`Real oscillators run down. Add a drag force proportional to the velocity, $F = -bv$ — air or oil resistance at low speed — and Newton’s second law becomes $m\ddot x + b\dot x + kx = 0$. For light damping its solution is

$$x(t) = A\,e^{-bt/2m}\cos(\omega' t + \phi), \qquad \omega' = \sqrt{\omega_0^2 - \left(\frac{b}{2m}\right)^2}$$

The oscillation keeps its rhythm, a little slower than the undamped $\omega_0 = \sqrt{k/m}$, inside an **exponentially shrinking envelope**. Increase the damping to $b = 2\sqrt{km}$ — **critical damping** — and it no longer oscillates at all: it returns to rest in the shortest time without overshooting. Beyond that it is **over-damped** and creeps back more slowly.`,
  symbols: [
    { tex: 'b', text: 'the damping coefficient, in kg/s: the drag force per unit speed' },
    { tex: 'A\\,e^{-bt/2m}', text: 'the amplitude, shrinking exponentially; it falls by a factor $e$ every $2m/b$ seconds' },
    { tex: '\\omega_0 = \\sqrt{k/m}', text: 'the natural angular frequency the system would have with no damping, in rad/s' },
    { tex: "\\omega'", text: 'the damped angular frequency, in rad/s — slightly less than $\\omega_0$' },
    { tex: 'b_c = 2\\sqrt{km}', text: 'the critical damping coefficient: below it the system oscillates, at or above it it does not' },
    { tex: 'm,\\ k', text: 'the mass (kg) and the spring constant (N/m)' },
  ],
  why: 'Damping is designed in everywhere something must stop moving quickly — car suspensions, instrument needles, door closers, landing gear — and its absence is why a satellite’s solar panels, with no air around them, ring for minutes after a thruster firing.',
  visual: {
    type: 'oscillator',
    title: 'Turn up the damping',
    lead: t`A 1 kg mass on a 4 N/m spring (so $\omega_0 = 2$ rad/s), with a damping force $-bv$. Watch the position graph and the energy bars, and read the damping ratio $b/2\sqrt{km}$ in the readout.`,
    tasks: [
      'Light damping, b = 0.2: the swings shrink steadily; the “lost” bar shows energy turning into heat.',
      'Set b = 4.0, where the damping ratio is 1: critical — the mass returns without crossing x = 0.',
      'Set b = 6: over-damped — it never overshoots, but takes longer to settle than at b = 4.',
    ],
    params: { kind: 'spring', m: 1, k: 4, b: 0.4, F0: 0, x0: 1 },
    caption: 'Linear spring and a damping force proportional to velocity, integrated numerically. Leave the driving amplitude at zero for now (driving is the next lesson). The energy “lost” goes into heat in the damper.',
  },
  example: {
    prompt: t`A $0.50$ kg mass on a spring with $k = 50$ N/m is damped with $b = 0.40$ kg/s and released from $0.10$ m. Find $\omega_0$ and $\omega'$, the amplitude after $5.0$ s, the time for the amplitude to halve, and the damping that would make it critical.`,
    visual: dampedGraph({ A: 0.1, gamma: 0.4, w1: 9.992, tmax: 6, marks: [{ t: 0, label: 'release' }, { t: 5.0, label: 't = 5.0 s' }], caption: 'The motion: x = 0.10 e^(−0.40t) cos(9.99t) m, inside its envelope (dashed).' }),
    steps: [
      { label: 'Frequencies', text: t`$\omega_0 = \sqrt{50/0.50} = 10.0$ rad/s; $b/2m = 0.40$ s⁻¹, so $\omega' = \sqrt{10.0^2 - 0.40^2} = 9.992$ rad/s — only 0.08% slower.` },
      { label: 'Amplitude at 5.0 s', text: t`$A = (0.10\ \text{m})\,e^{-0.40\times5.0} = 0.10\,e^{-2.0} = 0.0135\ \text{m}$ — about 14% of the start.` },
      { label: 'Halving time', text: t`$e^{-bt/2m} = \tfrac12 \Rightarrow t = \dfrac{2m}{b}\ln2 = \dfrac{\ln 2}{0.40} = 1.73\ \text{s}$, the same for every halving.` },
      { label: 'Critical damping', text: t`$b_c = 2\sqrt{km} = 2\sqrt{(50)(0.50)} = 10\ \text{kg/s}$. This damper is at 4% of critical: lightly damped, so it rings for many cycles.` },
    ],
    answer: t`$\omega_0 = 10.0$, $\omega' = 9.99$ rad/s; $A(5\ \text{s}) = 1.35$ cm; halves every $1.73$ s; $b_c = 10$ kg/s.`,
  },
  practice: [
    num({
      id: 'amp-later', difficulty: 1,
      gen(r) {
        const m = r.pick([0.5, 1.0, 2.0]), b = r.pick([0.2, 0.4, 0.6]), A0 = r.pick([5, 8, 12]), tt = r.pick([3, 5, 8]);   // A0 in cm
        const A = A0 * Math.exp((-b * tt) / (2 * m));
        return {
          prompt: t`A ${m} kg mass on a spring, damped with $b = ${b}$ kg/s, starts with an amplitude of ${A0} cm. What is its amplitude after ${tt} s?`,
          answer: A, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: A0 * Math.exp((-b * tt) / m), feedback: t`The amplitude decays as $e^{-bt/2m}$ — the 2 matters. ($e^{-bt/m}$ is how the *energy* decays.)` }, { value: A0 * (1 - (b * tt) / (2 * m)), feedback: 'The decay is exponential, not a straight line.' }],
          hints: [t`$A(t) = A_0\,e^{-bt/2m}$.`],
          teach: 'With linear damping the amplitude decays exponentially, as e^(−bt/2m).',
          explain: t`$A = ${A0}\,e^{-${b}\times${tt}/(2\times${m})} = ${A0}\,e^{-${tn((b * tt) / (2 * m))}} = ${tn(A)}\ \text{cm}$.`,
          visual: springPic({ damper: true, m: `${m} kg`, k: 'k', b: `b = ${b} kg/s`, arrow: `${A0} cm` }),
        };
      },
    }),
    num({
      id: 'half-time', difficulty: 2,
      gen(r) {
        const m = r.pick([0.2, 0.8, 1.5]), b = r.pick([0.05, 0.1, 0.3]);
        const th = ((2 * m) / b) * LN2;
        return {
          prompt: t`A ${m} kg oscillator has damping $b = ${b}$ kg/s. How long does it take for its amplitude to fall to half?`,
          answer: th, units: 's', tol: { rel: 0.005 },
          errors: [{ value: (m / b) * LN2, feedback: t`The amplitude goes as $e^{-bt/2m}$: the time constant is $2m/b$, not $m/b$.` }, { value: (2 * m) / b, feedback: t`That is the time to fall by a factor of $e$. For a half, multiply by $\ln 2$.` }],
          hints: [t`Set $e^{-bt/2m} = \tfrac12$ and take logs.`, t`$t = \dfrac{2m}{b}\ln 2$.`],
          teach: 'An exponential decay halves in equal intervals: t½ = (2m/b) ln 2 for the amplitude.',
          explain: t`$t_{1/2} = \dfrac{2(${m})}{${b}}\ln2 = ${tn(th)}\ \text{s}$ — and it halves again every ${tn(th)} s after that.`,
          visual: dampedGraph({ A: 1, gamma: b / (2 * m), w1: 6, tmax: 2.6 * th, numbers: false, hl: [{ y: 0.5, label: 'A₀/2', color: 'gold' }], caption: 'A lightly damped oscillation and its envelope; the dashed gold line marks half the starting amplitude. No numbers on the axes.' }),
        };
      },
    }),
    mcq({
      id: 'regime', difficulty: 1,
      gen(r) {
        const [m, k] = r.pick([[2, 50], [1, 100], [4, 25]]);
        const bc = 2 * Math.sqrt(k * m), f = r.pick([0.3, 1, 2.5]);
        const b = +(bc * f).toFixed(1), ans = f < 1 ? 0 : f === 1 ? 1 : 2;
        const choices = ['Under-damped: it oscillates as it dies away', 'Critically damped: it returns without overshooting, as fast as possible', 'Over-damped: it creeps back without overshooting', 'Undamped: it oscillates for ever'];
        return {
          prompt: t`A ${m} kg mass on a spring with $k = ${k}$ N/m has damping $b = ${b}$ kg/s. Released from rest away from equilibrium, how does it move?`,
          choices, answer: ans, fixedOrder: true,
          why: Object.fromEntries([0, 1, 2, 3].filter((i) => i !== ans).map((i) => [i, i === 3 ? 'Any damping at all removes energy, so the motion dies away.' : t`Compare $b$ with $b_c = 2\sqrt{km} = ${tn(bc)}$ kg/s: here $b ${f < 1 ? '<' : f === 1 ? '=' : '>'} b_c$.`])),
          hints: [t`Find the critical value $b_c = 2\sqrt{km}$ and compare.`],
          teach: 'Below b = 2√(km) a system oscillates; at it, it is critically damped; above it, over-damped.',
          explain: t`$b_c = 2\sqrt{(${k})(${m})} = ${tn(bc)}$ kg/s, and $b = ${b}$ kg/s is ${f < 1 ? 'below it: under-damped' : f === 1 ? 'equal to it: critically damped' : 'above it: over-damped'}.`,
          visual: REGIMES,
        };
      },
    }),
    num({
      id: 'omega-prime', difficulty: 2,
      gen(r) {
        const m = r.pick([0.5, 1.0]), k = r.pick([8, 18, 32]), f = r.pick([0.3, 0.5, 0.8]);
        const w0 = Math.sqrt(k / m), b = +(2 * m * w0 * f).toFixed(2), g = b / (2 * m), w1 = Math.sqrt(w0 * w0 - g * g);
        return {
          prompt: t`A ${m} kg mass on a spring ($k = ${k}$ N/m) is damped with $b = ${b}$ kg/s. At what angular frequency does it oscillate?`,
          answer: w1, units: 'rad/s', tol: { rel: 0.005 },
          errors: [{ value: w0, feedback: t`That is the undamped $\omega_0$. Damping slows the oscillation: $\omega' = \sqrt{\omega_0^2 - (b/2m)^2}$.` }, { value: Math.sqrt(w0 * w0 - (b / m) ** 2), feedback: t`The damping term is $(b/2m)^2$, not $(b/m)^2$.` }],
          hints: [t`$\omega_0 = \sqrt{k/m}$ and $b/2m$ first.`, t`$\omega' = \sqrt{\omega_0^2 - (b/2m)^2}$.`],
          teach: 'Damping lowers the frequency: ω′ = √(ω₀² − (b/2m)²).',
          explain: t`$\omega_0 = ${tn(w0)}$ rad/s and $b/2m = ${tn(g)}$ s⁻¹, so $\omega' = \sqrt{${tn(w0 * w0)} - ${tn(g * g)}} = ${tn(w1)}\ \text{rad/s}$ — ${s3(100 * (1 - w1 / w0))}% below $\omega_0$.`,
          visual: springPic({ damper: true, m: `${m} kg`, k: `k = ${k} N/m`, b: `b = ${b} kg/s`, arrow: 'released' }),
        };
      },
    }),
    num({
      id: 'suspension', difficulty: 2,
      gen(r) {
        const m = r.pick([300, 350, 400]), k = r.pick([20000, 30000, 40000]);
        const bc = 2 * Math.sqrt(k * m);
        return {
          prompt: t`One corner of a car carries ${m} kg on a spring with $k = ${tn(k)}$ N/m. What damping coefficient would make that corner critically damped?`,
          answer: bc, units: 'kg/s', tol: { rel: 0.005 },
          errors: [{ value: Math.sqrt(k * m), feedback: t`Critical damping is $2\sqrt{km}$: keep the 2.` }, { value: 2 * Math.sqrt(k / m), feedback: t`That is $2\omega_0$, in s⁻¹. Critical damping is $b_c = 2m\omega_0 = 2\sqrt{km}$.` }],
          hints: [t`$b_c = 2\sqrt{km}$.`],
          teach: 'Critical damping is b_c = 2√(km) = 2mω₀.',
          explain: t`$b_c = 2\sqrt{(${tn(k)})(${m})} = ${tn(bc)}\ \text{kg/s}$. Real cars are tuned below this, at roughly 20–40% of critical: a little overshoot buys a softer ride.`,
          visual: springPic({ damper: true, m: `${m} kg`, k: `k = ${pn(k)} N/m`, b: 'shock absorber: b = ?', arrow: null, x: 0.4 }),
        };
      },
    }),
    mcq({
      id: 'energy-half', difficulty: 2,
      prompt: t`A damped oscillator’s amplitude has fallen to half its starting value. What fraction of its starting energy is left?`,
      choices: ['A quarter', 'A half', t`$1/\sqrt2$`, 'All of it: damping only slows it down'],
      answer: 0,
      why: {
        1: t`Energy goes as the amplitude squared, $E = \tfrac12kA^2$: half the amplitude leaves $(\tfrac12)^2$ of the energy.`,
        2: t`That would be the amplitude left when half the energy is gone, the other way round.`,
        3: 'The damping force does negative work on every swing: that energy becomes heat.',
      },
      hints: [t`$E = \tfrac12kA^2$.`],
      teach: 'Energy goes as A², so it decays twice as fast as the amplitude: as e^(−bt/m).',
      explain: t`$E \propto A^2$: half the amplitude, a quarter of the energy. The energy envelope is $e^{-bt/m}$, the square of the amplitude’s $e^{-bt/2m}$.`,
      visual: dampedGraph({ A: 1, gamma: 0.25, w1: 5, tmax: 8, numbers: false, hl: [{ y: 0.5, label: 'half the amplitude', color: 'gold' }], caption: 'A damped oscillation and its envelope. No numbers on the axes.' }),
    }),
    num({
      id: 'log-dec', difficulty: 3,
      gen(r) {
        const m = r.pick([0.2, 0.5]), T = r.pick([0.5, 0.8, 1.2]), [A1, A2] = r.pick([[5.0, 4.0], [6.0, 4.5], [8.0, 7.0]]);
        const b = ((2 * m) / T) * Math.log(A1 / A2);
        return {
          prompt: t`A ${m} kg damped oscillator has period ${T} s. Two successive peaks of its motion reach ${A1.toFixed(1)} cm and ${A2.toFixed(1)} cm. Find the damping coefficient $b$.`,
          answer: b, units: 'kg/s', tol: { rel: 0.005 },
          errors: [{ value: (m / T) * Math.log(A1 / A2), feedback: t`The envelope is $e^{-bt/2m}$, so $b = \dfrac{2m}{T}\ln\dfrac{A_1}{A_2}$: keep the 2.` }, { value: ((2 * m) / T) * (A1 / A2 - 1), feedback: 'Use the natural log of the ratio, not the ratio minus one.' }],
          hints: [t`Successive peaks are one period apart: $\dfrac{A_2}{A_1} = e^{-bT/2m}$.`, t`So $b = \dfrac{2m}{T}\ln\dfrac{A_1}{A_2}$.`],
          teach: 'The ratio of successive peaks, e^(bT/2m), measures the damping.',
          explain: t`$\ln\dfrac{${A1.toFixed(1)}}{${A2.toFixed(1)}} = ${tn(Math.log(A1 / A2))}$, so $b = \dfrac{2(${m})}{${T}}\times${tn(Math.log(A1 / A2))} = ${tn(b)}\ \text{kg/s}$.`,
          visual: dampedGraph({ A: A1 / 100, gamma: Math.log(A1 / A2) / T, w1: (2 * Math.PI) / T, tmax: 3.2 * T, ylabel: 'x (m)', marks: [{ t: 0, label: `${A1.toFixed(1)} cm` }, { t: T, label: `${A2.toFixed(1)} cm` }], caption: 'The measured motion, with two successive peaks one period apart.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-amp', difficulty: 2,
      gen(r) {
        const m = r.pick([0.4, 1.0]), b = r.pick([0.1, 0.25]), A0 = r.pick([10, 20]), tt = r.pick([4, 10]);
        const A = A0 * Math.exp((-b * tt) / (2 * m));
        return {
          prompt: t`A ${m} kg oscillator with $b = ${b}$ kg/s starts with amplitude ${A0} cm. What is its amplitude ${tt} s later?`,
          answer: A, units: 'cm', tol: { rel: 0.005 },
          errors: [{ value: A0 * Math.exp((-b * tt) / m), feedback: 'Amplitude decays as e^(−bt/2m).' }],
          hints: [t`$A = A_0e^{-bt/2m}$.`],
          teach: 'A(t) = A₀ e^(−bt/2m).',
          explain: t`$A = ${A0}\,e^{-${tn((b * tt) / (2 * m))}} = ${tn(A)}\ \text{cm}$.`,
          visual: springPic({ damper: true, m: `${m} kg`, k: 'k', b: `b = ${b} kg/s`, arrow: `${A0} cm` }),
        };
      },
    }),
    mcq({
      id: 'cp-needle', difficulty: 2,
      prompt: t`An instrument’s needle should settle on a new reading as quickly as possible without swinging past it. How should it be damped?`,
      choices: ['Critically, or just below critical', 'As lightly as possible, so it moves freely', 'Heavily over-damped, so it can never overshoot', 'Not at all: friction in the bearings is enough'],
      answer: 0,
      why: {
        1: 'A lightly damped needle swings back and forth around the reading for a long time before settling.',
        2: 'Over-damping does stop the overshoot, but the needle then creeps up to the reading more slowly than at critical damping.',
        3: 'Bearing friction is small and erratic; the needle would oscillate before settling, or stick short of the reading.',
      },
      hints: ['Which regime settles fastest without overshooting?'],
      teach: 'Critical damping returns a system to equilibrium fastest without overshoot.',
      explain: t`Critical damping is the dividing line: any less and the needle oscillates about the reading; any more and it approaches it sluggishly. Meters, car suspensions and door closers are all tuned near it.`,
      visual: REGIMES,
    }),
    num({
      id: 'cp-panel', difficulty: 3, transfer: true,
      gen(r) {
        const th = r.pick([30, 40, 60]), pct = r.pick([1, 5, 10]);
        const tt = th * Math.log2(100 / pct);
        return {
          prompt: t`After a thruster firing, a satellite’s solar panel vibrates at 0.2 Hz. With no air in orbit, only the panel’s own structure damps it, and its amplitude halves every ${th} s. How long until the amplitude is down to ${pct}% of its starting value?`,
          answer: tt, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (th * (100 - pct)) / 50, feedback: 'The decay is exponential: each halving takes the same time, so count halvings — log₂ of the ratio.' }, { value: th * Math.log(100 / pct), feedback: 'That uses ln of the ratio; with a halving time you need log₂ (or ln ratio / ln 2).' }],
          hints: [t`After $n$ halvings the amplitude is $(\tfrac12)^n$ of the start.`, t`$(\tfrac12)^n = ${pct / 100} \Rightarrow n = \log_2 ${100 / pct}$; the time is $n\times${th}$ s.`],
          teach: 'An exponential decay is counted in halvings: t = t½ log₂(A₀/A).',
          explain: t`$n = \log_2(${100 / pct}) = ${tn(Math.log2(100 / pct))}$ halvings, so $t = ${tn(Math.log2(100 / pct))}\times${th} = ${tn(tt)}\ \text{s}$ — about ${s3(tt / 60)} minutes of ringing, which is why spacecraft pointing systems wait, or actively damp, after a manoeuvre.`,
          visual: dampedGraph({ A: 1, gamma: LN2 / th, w1: 2 * Math.PI * 0.2, tmax: 4 * th, ylabel: 'panel tip (relative)', numbers: true, caption: 'The panel’s vibration: 0.2 Hz inside an envelope that halves at regular intervals.' }),
        };
      },
    }),
  ],
  sources: [{ label: 'OpenStax University Physics Vol. 1, §15.5 Damped Oscillations', url: 'https://openstax.org/books/university-physics-volume-1/pages/15-5-damped-oscillations' }],
});
