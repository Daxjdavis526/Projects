// The speed of light — the lab view: laser pulses timed on an oscilloscope
// to a retroreflector at ten distances; delay against distance, whose slope
// is 2/c and whose intercept collects every cable and electronics delay (so
// the measurement is differential by design); leading-edge time walk as the
// systematic — far returns are weaker and cross a fixed threshold late — and
// constant-fraction timing as its cure; air's index; what the experiment
// measures now that c is exact. Lunar laser ranging as the transfer. Every
// number is computed from the seeded model the labe-rig simulation draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, resT, tex, table, SIMNOTE, SRC } from './_labe.js';

const t = String.raw;
const P0 = M.EXPERIMENTS.light.defaults;
const C = M.K.c;

// ── the worked example: ten distances, seed 4 ──
const EX = M.run('light', { seed: 4 });
const EXc = EX.results[0], EXt0 = EX.results[1];
const WK = M.analyse('light', EX.rows, { flags: { walk: true } });

// Michelson 1927 (Mount Wilson to Mount San Antonio): 299 796 ± 4 km/s
const MICH = { v: 299796e3, s: 4e3 };

export default lesson({
  id: 'lab.E.9',
  title: 'The speed of light',
  minutes: 15, difficulty: 3,
  lab: true,
  intro: t`A laser diode fires pulses a few nanoseconds long; part of each goes straight to a fast photodiode, the rest travels to a retroreflector at distance $x$ and back to a second photodiode. An oscilloscope reads the delay between the two pulses. The delay includes the light’s extra trip, $2x/c$, plus every cable and electronic delay — which nobody can calculate to a fraction of a nanosecond. **So you move the reflector and fit**: the offsets fall into the intercept, and the slope is $2/c$. Light covers 30 cm in a nanosecond, so the timing, not the tape measure, is the whole game.`,
  equation: t`\Delta t = \frac{2x}{c} + t_0`,
  symbols: [
    { tex: '\\Delta t', text: 'the delay the oscilloscope reads between the reference pulse and the return, in s (ns in practice)' },
    { tex: 'x', text: 'the reflector’s distance beyond the reference point, in m: the light travels $2x$ more' },
    { tex: 'c', text: 'the speed of light, exactly $299\\,792\\,458$ m/s in vacuum (since 1983 it defines the metre); about 0.03% less in air' },
    { tex: 't_0', text: 'the fixed offset, in s: cables, photodiodes and amplifiers on the two channels' },
  ],
  why: t`Time of flight is how lidar, laser altimeters on spacecraft, GPS and lunar laser ranging measure distance — and every one of them fights the same offsets and the same time walk.`,
  visual: {
    type: 'labe-rig',
    title: 'The bench: pulses timed to a movable reflector',
    lead: t`Set the reflector’s distance and take a reading: above, the scope trace with the reference and return pulses and the instants the timing picks; below, delay against distance with the weighted fit. The readout turns the slope into $c$ and shows the offset.`,
    tasks: [
      'Run the series: c comes out within about 1% of 2.998 × 10⁸ m/s, and the intercept is the 12 ns of cables and electronics.',
      'Switch on leading-edge timing: the far, weaker returns cross the threshold later, the slope steepens, and c reads about 1% low — with residuals that curve slightly.',
      'Run the series several more times: σ of c shrinks, but the leading-edge bias does not — averaging cannot remove a systematic.',
    ],
    params: { exp: 'light', seed: 2, residuals: true, expected: true },
    caption: t`Simulated delays: Gaussian pulses 2 ns wide, a 12.0 ns offset, return height falling as $1/(1 + (x/8\ \text{m})^2)$ from beam spread, timing jitter $\sigma = 0.4$ ns per reading (illustrative). Air’s 0.03% is left out. ${SIMNOTE}`,
  },
  example: {
    prompt: t`Delays measured with a constant-fraction timer ($\sigma = 0.4$ ns each):

${table([[t`x\ (\text{m})`, ...EX.R.map((q) => q.x.toFixed(0))], [t`\Delta t\ (\text{ns})`, ...EX.R.map((q) => q.t.toFixed(1))]])}

Find $c$ with its uncertainty, and the offset.`,
    visual: rigPlot('light', { seed: 4, expected: true }, t`Delay against distance with the fit (gold), the line the exact $c$ predicts (dashed), and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Fit', text: t`Equal error bars: slope $b = ${pmT(EX.fit.b, EX.fit.sb)}$ ns/m, intercept $${resT(EXt0)}$ ns, $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$.` },
      { label: 'Speed', text: t`$b = 2/c$, so $c = 2/b = 2/(${EX.fit.b.toFixed(4)}\ \text{ns/m}) = ${tex(EXc.value, 4)}$ m/s; $\sigma_c/c = \sigma_b/b = ${(100 * EXc.sigma / EXc.value).toFixed(2)}\%$. So $c = (${resT(EXc)})\times10^8$ m/s.` },
      { label: 'Compare', text: t`Against $299\,792\,458$ m/s, $z = ${EXc.z.toFixed(2)}$. Ten readings with 0.4 ns of jitter over 18 m of extra path pin $c$ to about 0.7%.` },
      { label: 'Offset', text: t`The intercept, $${resT(EXt0)}$ ns, is the difference in the two channels’ delays — 12 ns is about 2.4 m of coaxial cable. It never needed to be known: the slope used only differences in $x$.` },
      { label: 'Leading edge', text: t`Timed instead where each pulse first crosses a fixed threshold, the same pulses give $c = ${tex(WK.results[0].value, 4)}$ m/s ($z = ${WK.results[0].z.toFixed(1)}$): a far return is only ${(100 * M.lightAmp(P0, 10)).toFixed(0)}% as tall at 10 m, crosses the threshold nearer its peak, and reads ${(M.lightDelay(P0, 10, true) - M.lightDelay(P0, 10, false)).toFixed(2)} ns late.` },
      { label: 'Sense check', text: t`Michelson’s 1926 measurement over the 35 km between two California mountains gave $299\,796 \pm 4$ km/s — the same idea, a known distance and a time, with a rotating mirror for the clock.` },
    ],
    answer: t`$c = (${resT(EXc)})\times10^8$ m/s ($z = ${EXc.z.toFixed(1)}$); offset $${resT(EXt0)}$ ns.`,
  },
  practice: [
    num({
      id: 'delay', difficulty: 1,
      gen(r) {
        const x = r.pick([2, 3.5, 5, 7.5, 9]);
        const ans = (2 * x) / C * 1e9;
        return {
          prompt: t`By how much does the return pulse’s delay grow when the reflector moves $${x}$ m farther away? Answer in ns.`,
          visual: rigRaw('light', { seed: r.int(1, 999), settings: [x] }, 'The scope trace: reference pulse, then the return.'),
          answer: ans, units: 'ns', tol: { rel: 0.005 },
          errors: [{ value: ans / 2, feedback: 'Out and back: the extra path is 2x.' }],
          hints: ['Light covers about 0.30 m per nanosecond.', t`$\Delta t = 2x/c$.`],
          teach: 'Light takes 3.34 ns per metre, 6.67 ns per metre of reflector distance there and back.',
          explain: t`$2 \times ${x}/299\,792\,458 = ${ans.toFixed(2)}$ ns.`,
        };
      },
    }),
    num({
      id: 'c-slope', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = M.run('light', { seed });
        const b = +A.fit.b.toFixed(4);
        const ans = 2 / (b * 1e-9);
        return {
          prompt: t`A fit of delay (ns) against reflector distance (m) has slope $${b.toFixed(4)}$ ns/m. What speed of light does it give? Answer in m/s.`,
          visual: rigPlot('light', { seed }, t`The run and its fit. ${SIMNOTE}`),
          answer: ans, units: 'm/s', tol: { rel: 0.002 },
          errors: [{ value: 1 / (b * 1e-9), feedback: t`The light goes out and back: the slope is $2/c$, so $c = 2/b$.` }],
          hints: [t`The slope is $2/c$.`, t`Convert ns/m to s/m first: multiply by $10^{-9}$.`],
          teach: t`The slope of delay against distance is $2/c$.`,
          explain: t`$c = 2/(${b.toFixed(4)}\times10^{-9}\ \text{s/m}) = ${tex(ans, 4)}$ m/s.`,
        };
      },
    }),
    mcq({
      id: 'offset', difficulty: 2,
      prompt: 'The fit’s intercept is about 12 ns — the delay at x = 0. Why is this no problem for measuring c?',
      visual: rigPlot('light', { seed: 6, expected: true }, t`A run whose fit crosses $x = 0$ at about 12 ns. ${SIMNOTE}`),
      choices: [
        'It is the fixed difference between the two channels’ cables and electronics; it shifts every delay equally, so it lands in the intercept and leaves the slope alone',
        'It is the time the laser takes to switch on, which must be subtracted from every reading before fitting',
        'It shows the light is slower near the source',
        'It is a statistical fluctuation and should be zero within σ',
      ],
      answer: 0,
      why: {
        1: 'Subtracting it is unnecessary: a fit with an intercept does that automatically, and the switch-on time is common to both channels anyway.',
        2: 'Light’s speed does not change along the path; an offset at x = 0 means something in the instruments.',
        3: 'With σ about 0.3 ns on the intercept, 12 ns is forty σ: it is real.',
      },
      hints: ['What else does a signal pass through between the photodiode and the scope?', 'Does that delay depend on where the reflector is?'],
      teach: 'Make the measurement differential: anything that does not change with the knob ends up in the intercept.',
      explain: 'Signals travel at about two-thirds of c in coaxial cable (about 5 ns per metre), and photodiodes and amplifiers add their own delays. All of it is fixed, the same at every distance: the fit absorbs it as t₀, and the slope measures only the change of path.',
    }),
    num({
      id: 'walk', difficulty: 3,
      gen(r) {
        const A1 = r.pick([1.0, 0.9]), A2 = r.pick([0.3, 0.4, 0.5]), thr = r.pick([0.1, 0.15]), w = 2.0;
        const lead = (A) => w * Math.sqrt(2 * Math.log(A / thr));
        const ans = lead(A1) - lead(A2);
        return {
          prompt: t`Gaussian pulses of width $w = ${w}$ ns cross a fixed threshold of $${thr}$ (in units of the reference pulse’s height) a time $w\sqrt{2\ln(A/\text{thr})}$ before their peak, where $A$ is the pulse’s height. A near return has $A = ${A1}$ and a far one $A = ${A2}$. By how much later, relative to its peak, is the far one timed? Answer in ns.`,
          visual: rigRaw('light', { seed: 3, settings: [10], flags: { walk: true } }, 'A weak return (right) crossing the dashed threshold close to its peak; the strong reference crosses early on its rising edge.'),
          answer: ans, units: 'ns', tol: { rel: 0.01 },
          errors: [{ value: w * (Math.log(A1 / thr) - Math.log(A2 / thr)), feedback: t`Keep the square root: $t = w\sqrt{2\ln(A/\text{thr})}$.` }],
          hints: [t`Work out $w\sqrt{2\ln(A/\text{thr})}$ for each pulse.`, 'The weaker pulse crosses closer to its peak: subtract.'],
          teach: 'Leading-edge timing makes weak pulses read late: the time walk.',
          explain: t`Near: $${lead(A1).toFixed(3)}$ ns before the peak; far: $${lead(A2).toFixed(3)}$ ns. The far one reads $${ans.toFixed(2)}$ ns late. Since the far pulses are the weak ones, the delays grow faster than $2x/c$: the slope is too steep and $c$ too low. A constant-fraction discriminator, which triggers at a fixed fraction of each pulse’s own height, removes it.`,
        };
      },
    }),
    num({
      id: 'sigma-c', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = M.run('light', { seed });
        const b = +A.fit.b.toFixed(4), sb = +A.fit.sb.toFixed(3);
        const c = 2 / (b * 1e-9), ans = c * (sb / b);
        return {
          prompt: t`A fit gives slope $${b.toFixed(4)} \pm ${sb.toFixed(3)}$ ns/m. What is the standard uncertainty of $c = 2/b$? Answer in m/s.`,
          visual: rigPlot('light', { seed }, t`The run and its fit. ${SIMNOTE}`),
          answer: ans, units: 'm/s', tol: { rel: 0.02 },
          errors: [{ value: 2 * ans, feedback: t`$c \propto b^{-1}$: the power is $-1$, so the relative uncertainty is the same, not doubled.` }],
          hints: [t`For $c = 2/b$, $\sigma_c/c = \sigma_b/b$.`],
          teach: 'An inverse keeps the relative uncertainty unchanged.',
          explain: t`$c = ${tex(c, 4)}$ m/s and $\sigma_b/b = ${(100 * sb / b).toFixed(2)}\%$, so $\sigma_c = ${tex(ans, 2)}$ m/s.`,
        };
      },
    }),
    num({
      id: 'air', difficulty: 2,
      gen(r) {
        const x = r.pick([5, 10, 20]);
        const ans = ((2 * x * 2.7e-4) / C) * 1e12;
        return {
          prompt: t`Air’s refractive index is about $1.00027$. By how much longer does light take over the extra $2x$ for $x = ${x}$ m in air than in vacuum? Answer in ps.`,
          visual: rigRaw('light', { seed: 4, settings: [Math.min(10, x)] }, 'A scope trace: the pulses are 2 ns wide.'),
          answer: ans, units: 'ps', tol: { rel: 0.01 },
          errors: [{ value: ans * 1000, feedback: 'Check the unit: the answer is a few picoseconds, not nanoseconds.' }],
          hints: [t`The extra time is $2x(n - 1)/c$.`],
          teach: 'Air slows light by 0.03%: real, but far below a nanosecond-timing experiment’s resolution.',
          explain: t`$2(${x})(2.7\times10^{-4})/c = ${ans.toFixed(1)}$ ps — against 0.4 ns of jitter per reading. Precision ranging (satellite and lunar) must model it; this bench may ignore it.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-two', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999);
        const [x1, x2] = r.pick([[1, 9], [2, 10], [1, 8], [3, 10]]);
        const R = M.readRows('light', M.makeRows('light', { seed, settings: [x1, x2] }));
        const ans = (2 * (x2 - x1)) / ((R[1].t - R[0].t) * 1e-9);
        return {
          prompt: t`Two readings: $${R[0].t.toFixed(1)}$ ns with the reflector at $${x1}$ m and $${R[1].t.toFixed(1)}$ ns at $${x2}$ m. What speed of light do they give? Answer in m/s.`,
          visual: rigPlot('light', { seed, settings: [x1, x2], residuals: false }, t`The two readings (two points: no fit drawn). ${SIMNOTE}`),
          answer: ans, units: 'm/s', tol: { rel: 0.003 },
          errors: [{ value: (2 * x2) / (R[1].t * 1e-9), feedback: 'A single reading includes the 12 ns offset: use the difference of the two readings, which cancels it.' }, { value: ans / 2, feedback: 'The extra path is twice the extra distance.' }],
          hints: ['The offset is the same in both readings.', t`$c = 2(x_2 - x_1)/(\Delta t_2 - \Delta t_1)$.`],
          teach: 'A difference of two readings cancels every offset they share.',
          explain: t`$c = 2(${x2 - x1})/(${(R[1].t - R[0].t).toFixed(1)}\times10^{-9}) = ${tex(ans, 4)}$ m/s — with two readings’ jitter in a ${(R[1].t - R[0].t).toFixed(0)} ns difference, uncertain by about ${(100 * 0.4 * Math.SQRT2 / (R[1].t - R[0].t)).toFixed(1)}%.`,
        };
      },
    }),
    num({
      id: 'cp-llr', difficulty: 3, transfer: true,
      gen(r) {
        const st = r.pick([10, 20, 50]);
        const ans = ((C * st * 1e-12) / 2) * 1000;
        return {
          prompt: t`Lunar laser ranging times pulses to retroreflectors left on the Moon by Apollo astronauts. If a single return photon’s arrival is timed with a standard uncertainty of $${st}$ ps, what is the corresponding uncertainty in the one-way distance? Answer in mm.`,
          visual: rigRaw('light', { seed: 5, settings: [10] }, 'The same measurement on a bench: a reference pulse and a weaker return. The Moon returns about one photon in many pulses.'),
          answer: ans, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: 2 * ans, feedback: 'The timing covers the round trip: divide by 2 for the one-way distance.' }],
          hints: ['The pulse’s time covers the trip there and back.', t`Distance $= c\,\Delta t/2$, so $\sigma_x = c\,\sigma_t/2$.`],
          teach: 'Ranging turns timing into distance at c/2: 1 ps is 0.15 mm.',
          explain: t`$\sigma_x = (299\,792\,458 \times ${st}\times10^{-12})/2 = ${ans.toFixed(1)}$ mm per photon; averaging thousands of photons, with careful modelling of the atmosphere and the reflector arrays, brings the Earth–Moon distance to millimetres — enough to test general relativity’s equivalence principle with the Moon’s orbit.`,
        };
      },
    }),
    mcq({
      id: 'cp-exact', difficulty: 3,
      prompt: 'Since 1983 the metre has been defined so that c is exactly 299 792 458 m/s. What does this bench experiment really measure today?',
      visual: rigPlot('light', { seed: 7, expected: true }, t`A run against the exact value (dashed). ${SIMNOTE}`),
      choices: [
        'The consistency of its own tape measure and oscilloscope timebase: a “wrong” c means one of them, or a systematic like time walk, is off',
        'A correction to the defined value of c',
        'Nothing: an experiment cannot measure a defined constant',
        'The speed of light in air, which is not defined',
      ],
      answer: 0,
      why: {
        1: 'A defined value has no uncertainty to correct; a disagreement is about the apparatus.',
        2: 'It measures something real — the calibration of its rulers and clocks against the definition.',
        3: 'Air changes c by 0.03%, far below this bench’s 1%; that is not what the result is telling you.',
      },
      hints: ['If c is fixed by definition, what must be wrong when your result differs from it?', 'Your c is a length from a tape divided by a time from a scope: which of those has an uncertainty now?'],
      teach: 'Once a constant is defined, measuring it becomes calibrating the instruments.',
      explain: 'The 1983 definition makes the metre the distance light travels in 1/299 792 458 s. A bench “measurement of c” is then a test of the tape measure, the scope’s timebase and the timing method — the same reinterpretation that came to e, h and k in 2019.',
    }),
  ],
  sources: [
    { label: 'A. A. Michelson, Measurement of the velocity of light between Mount Wilson and Mount San Antonio, Astrophysical Journal 65, 1 (1927)', url: 'https://doi.org/10.1086/143021' },
    { label: 'BIPM, The International System of Units (SI brochure, 9th ed., 2019): the definition of the metre', url: 'https://www.bipm.org/en/publications/si-brochure' },
    SRC.codata,
    SRC.usu,
  ],
});
