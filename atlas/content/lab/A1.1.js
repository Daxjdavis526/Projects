// Precision, accuracy and resolution — three different things a reading can
// lack. The target picture (bias against scatter, plus a grid for
// resolution), then real instrument specifications: a handheld multimeter's
// ±(0.05 % of reading + 1 digit), a display whose last digit hides the
// scatter, a calibrated reference exposing a bias, and a pressure transducer
// specified in % of full scale as the transfer.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { M, sf, stat, SRC } from './_unc.js';

const t = String.raw;

// the worked example: a handheld DMM on its 6 V range (resolution 1 mV, spec ±(0.05 % + 1 digit))
const EX = (() => {
  const P = { truth: 5.1253, bias: 0.0011, sd: 0.0004, res: 0.001, n: 20, seed: 41 };
  const xs = M.instrumentReadings(P);
  const st = M.stats(xs);
  const lim = M.specLimit(st.mean, { pct: 0.05, digits: 1, res: 0.001 });
  return { P, xs, st, lim, pctPart: 0.0005 * st.mean };
})();
const readingsPic = (P, extra = {}, caption) => stat('readings', { truth: P.truth, bias: P.bias, sd: P.sd, res: P.res, n: P.n, seed: P.seed, unit: 'V', ...extra }, caption);

const FLUKE = { label: 'Fluke 87V specifications: DC volts, 6.000 V range, resolution 0.001 V, accuracy ±(0.05 % + 1)', url: 'https://www.manualsdir.com/manuals/318904/atec-fluke-87v.html?page=2' };

export default lesson({
  id: 'lab.A1.1',
  title: 'Precision, accuracy and resolution',
  minutes: 13, difficulty: 2,
  lab: true,
  intro: t`Every reading an instrument gives you is the true value disturbed in two ways and then rounded:

$$x_i = x_{\text{true}} + b + \varepsilon_i, \quad \text{shown to the nearest } \delta$$

**Accuracy** is closeness to the true value: it fails when the bias $b$ is large. **Precision** is how closely repeated readings agree: it fails when the random errors $\varepsilon_i$ are large. **Resolution** is the smallest change the display can show. They are independent — a meter can show six digits (fine resolution), repeat to the last one (precise) and still read 1% high (inaccurate). Repeating reveals precision; only comparison with a better reference reveals accuracy, and a maker’s **accuracy specification** is a promise about $b$ you cannot check on your own bench.`,
  symbols: [
    { tex: 'x_i', text: 'the $i$-th reading, as displayed' },
    { tex: t`x_{\text{true}}`, text: 'the true value of the quantity — never known exactly' },
    { tex: 'b', text: 'the bias: an error that is the same in every reading (zero offset, calibration error). It sets the **accuracy**' },
    { tex: t`\varepsilon_i`, text: t`the random error of reading $i$, different every time, with standard deviation $\sigma$. It sets the **precision**` },
    { tex: t`\delta`, text: 'the resolution: one step of the last displayed digit (0.001 V on a display that shows 5.127 V)' },
  ],
  why: 'Before you can put an honest number on an uncertainty you must know which of the three limits you are fighting: averaging cures one of them, a better display another, and only calibration the third.',
  visual: {
    type: 'labx-stats',
    title: 'The target: bias, scatter and resolution',
    lead: t`Each dot is one shot; the bullseye is the true value and the gold × the mean of the shots. **Bias** moves the whole group, **scatter** spreads it, and **resolution** snaps every shot to the centre of a grid square.`,
    tasks: [
      'Set the bias to 2 rings with a small scatter: precise but not accurate. Press “4× as many” — the × stays put.',
      'Set the bias to 0 and the scatter to 1.5: accurate on average but imprecise. More shots pull the × toward the centre.',
      'Raise the resolution to 2 rings: shots pile onto a few squares, and small biases vanish into the grid.',
    ],
    params: { mode: 'target', bias: 1.2, spread: 0.5, res: 0, seed: 7 },
  },
  example: {
    prompt: t`A handheld multimeter on its 6 V range (display step 0.001 V; accuracy specified as ±(0.05% of reading + 1 digit)) measures a battery 20 times. The readings run from ${sf(Math.min(...EX.xs), 4)} to ${sf(Math.max(...EX.xs), 4)} V with mean ${EX.st.mean.toFixed(4)} V and standard deviation ${EX.st.sd.toFixed(4)} V. What limits this measurement: resolution, precision or accuracy?`,
    visual: readingsPic(EX.P, { specPct: 0.05, specDigits: 1 }, 'The 20 readings rounded to the display’s 1 mV step, their mean, and the band the specification allows around it. The simulation knows the true value (green); you never would.'),
    steps: [
      { label: 'Resolution', text: t`One display step is $\delta = 0.001$ V. A reading rounded to the nearest step is off by at most $\delta/2 = 0.0005$ V.` },
      { label: 'Precision', text: t`The readings scatter with $s = ${EX.st.sd.toFixed(4)}$ V — comparable to one step — so the mean of 20 is pinned down to $s/\sqrt{20} = ${(EX.st.sem * 1000).toFixed(2)}$ mV.` },
      { label: 'Accuracy', text: t`The specification allows $0.05\% \times ${EX.st.mean.toFixed(3)}\ \text{V} + 1 \times 0.001\ \text{V} = ${(EX.pctPart * 1000).toFixed(2)} + 1.00 = ${(EX.lim * 1000).toFixed(2)}$ mV: the meter’s bias may be anything up to $\pm ${(EX.lim * 1000).toFixed(1)}$ mV, the same for every reading.` },
      { label: 'Compare', text: t`$${(EX.lim * 1000).toFixed(1)}$ mV from the specification against $${(EX.st.sem * 1000).toFixed(2)}$ mV from the scatter: **accuracy dominates** by about ${Math.round(EX.lim / EX.st.sem)} times. Averaging more readings would shrink only the smaller term.` },
      { label: 'Report', text: t`The battery reads $${EX.st.mean.toFixed(3)}$ V within the meter’s specification of $\pm ${(EX.lim * 1000).toFixed(1)}$ mV. (The next lesson turns that limit into a standard uncertainty.)` },
    ],
    answer: t`Accuracy: the specification’s $\pm ${(EX.lim * 1000).toFixed(1)}$ mV dwarfs both the 1 mV resolution step’s rounding and the $${(EX.st.sem * 1000).toFixed(2)}$ mV scatter of the mean.`,
  },
  practice: [
    mcq({
      id: 'four-targets', difficulty: 1,
      prompt: 'Four groups shoot at the same target. Which group is precise but not accurate?',
      visual: stat('target', { targets: [{ bias: 0, spread: 0.35, label: 'group P' }, { bias: 2.2, spread: 0.3, label: 'group Q', angle: 40 }, { bias: 0.1, spread: 1.6, label: 'group R' }, { bias: 2, spread: 1.3, label: 'group S', angle: 210 }], n: 12, seed: 3 }, 'Four groups of twelve shots; the gold × is each group’s mean.'),
      choices: ['Group Q', 'Group P', 'Group R', 'Group S'],
      answer: 0,
      why: {
        1: 'Group P is tight and centred: precise and accurate.',
        2: 'Group R is centred on average but widely spread: accurate (unbiased) but imprecise.',
        3: 'Group S is both spread out and off-centre: neither precise nor accurate.',
      },
      hints: ['Precision is how tight a group is; accuracy is whether its centre sits on the bullseye.'],
      teach: 'A tight group far from the centre is precise but biased: repeat measurements agree with each other, not with the truth.',
      explain: 'Group Q’s shots agree closely with each other, but their mean sits about two rings off the bullseye — a bias that more shots would never remove.',
    }),
    num({
      id: 'dmm-spec', difficulty: 2,
      gen(r) {
        const v = +(r.int(1200, 5900) / 1000).toFixed(3);
        const lim = M.specLimit(v, { pct: 0.05, digits: 1, res: 0.001 });
        return {
          prompt: t`The multimeter reads ${v.toFixed(3)} V on its 6 V range (step 0.001 V, accuracy ±(0.05% of reading + 1 digit)). What is the specification limit, in millivolts?`,
          visual: stat('readings', { truth: v, sd: 0.0003, res: 0.001, n: 12, seed: r.int(1, 9999), unit: 'V' }, 'Twelve readings: they agree to the last digit, which says nothing about how far they all are from the truth.'),
          answer: lim * 1000, units: 'mV', tol: { rel: 0.01 },
          errors: [
            { value: 0.05 / 100 * v * 1000, feedback: 'Add the “+1 digit”: one step of the last digit, 0.001 V on this range.' },
            { value: (0.05 / 100 * 6 + 0.001) * 1000, feedback: 'The percentage is of the reading, not of the 6 V range.' },
          ],
          hints: [t`Percent of reading: $0.0005 \times ${v.toFixed(3)}$ V.`, 'One digit is one step of the display: 0.001 V. Add the two.'],
          teach: 'A “% of reading + digits” specification has two parts: one proportional to the reading, one fixed by the display step.',
          explain: t`$0.0005 \times ${v.toFixed(3)} + 0.001 = ${(lim * 1000).toFixed(2)}$ mV. At small readings the digit term dominates; at large ones the percentage does.`,
        };
      },
    }),
    mcq({
      id: 'hidden-scatter', difficulty: 2,
      prompt: t`Ten readings of a sensor on a meter showing two decimal places all read 2.47 V. What can you say about its precision?`,
      visual: stat('readings', { truth: 2.4712, sd: 0.0012, res: 0.01, n: 10, seed: 5, unit: 'V', xr: [2.44, 2.50] }, 'Ten readings that all round to the same displayed value.'),
      choices: [
        'Only that the scatter is small compared with the 0.01 V step; the display hides it, so zero scatter does not mean zero uncertainty',
        'The sensor is perfectly precise: the standard deviation is exactly zero',
        'The sensor is perfectly accurate, since every reading agrees',
        'The readings are useless and must be discarded',
      ],
      answer: 0,
      why: {
        1: 's = 0 here is an artefact of rounding: the true scatter is below the display’s resolution, not absent. The rounding itself still leaves an uncertainty of up to half a step.',
        2: 'Agreement among readings says nothing about bias: every reading could be off by the same amount.',
        3: 'They are perfectly good readings; their uncertainty is set by the resolution (the next lesson shows how to evaluate it).',
      },
      hints: ['What does rounding to 0.01 V do to scatter much smaller than 0.01 V?'],
      teach: 'When the scatter is below the resolution, repeated readings agree exactly and the resolution, not the scatter, limits precision.',
      explain: 'The true readings vary by about a millivolt, but each is rounded to the nearest 0.01 V, so they all land on 2.47. The precision is “better than the display can show”, and the resolution supplies the uncertainty.',
    }),
    num({
      id: 'reference-bias', difficulty: 2,
      gen(r) {
        const bias = r.pick([-1, 1]) * r.int(25, 60) / 1e5, n = r.pick([10, 16, 25]);
        const P = { truth: 10.0, bias, sd: 0.0002, res: 0.0001, n, seed: r.int(1, 9999) };
        const xs = M.instrumentReadings(P), st = M.stats(xs);
        const mean = +st.mean.toFixed(5);
        const b = (mean - 10) * 1000;
        return {
          prompt: t`To check a meter, you read a calibrated 10.0000 V reference standard ${n} times. The mean is ${mean.toFixed(5)} V and the standard deviation 0.0002 V. Estimate the meter’s bias at 10 V, in millivolts (with its sign).`,
          visual: stat('readings', { ...P, unit: 'V', xr: [9.9988, 10.0012] }, 'Readings of the reference standard; green is its calibrated value.'),
          answer: b, units: 'mV', tol: { rel: 0.02, abs: 0.002 },
          errors: [{ value: -b, feedback: 'Bias is reading minus true value: a meter reading high has a positive bias.' }],
          hints: ['Bias = mean reading − true value.'],
          teach: 'Reading a known reference is how accuracy is checked: the mean minus the reference value estimates the bias.',
          explain: t`$b \approx ${mean.toFixed(5)} - 10.0000 = ${b.toFixed(2)}$ mV, known to about $0.2/\sqrt{${n}} = ${(0.2 / Math.sqrt(n)).toFixed(2)}$ mV from the scatter — a bias more than ten times that is real. Correct for it, or quote it.`,
        };
      },
    }),
    match({
      id: 'terms', difficulty: 1,
      prompt: 'Match each term to what it describes.',
      visual: stat('target', { targets: [{ bias: 0, spread: 0.3, label: 'precise, accurate' }, { bias: 2, spread: 0.3, label: 'precise, biased', angle: 20 }, { bias: 0, spread: 0.5, res: 2, label: 'coarse resolution' }], n: 12, seed: 9 }, 'Three groups: one good, one biased, one recorded on a coarse grid.'),
      left: ['Resolution', 'Precision', 'Accuracy', 'Bias'],
      right: ['the smallest step the instrument can display', 'how closely repeated readings agree', 'how close a result is to the true value', 'the error common to every reading', 'the number of digits written in the report'],
      answer: [0, 1, 2, 3],
      hints: ['Two of these are about the display and the scatter; two are about the true value.'],
      teach: 'Resolution is the display step, precision the repeatability, accuracy the closeness to truth, and bias the shared error that spoils it.',
      explain: 'Resolution belongs to the display, precision to the scatter, accuracy to the result against the truth, and bias is the constant error that makes a precise instrument inaccurate. The number of digits written is a reporting choice, which should follow the uncertainty.',
    }),
    mcq({
      id: 'digits-claim', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “My meter displays 4 decimal places, so my voltage 1.2486 V is accurate to 0.0001 V.” What is wrong?`,
      visual: stat('readings', { truth: 1.2479, bias: 0.0007, sd: 0.00008, res: 0.0001, n: 15, seed: 11, unit: 'V', specPct: 0.05, specDigits: 2, xr: [1.2455, 1.2502] }, 'Fifteen readings to 0.1 mV, tightly grouped — and the band a typical specification allows. Green is the true value.'),
      choices: [
        'Displayed digits set the resolution, not the accuracy; the accuracy is the maker’s specification, which is several times larger',
        'Nothing: a meter cannot display digits it does not measure',
        'Four decimal places means an accuracy of 0.0005 V, half the last digit',
        'They should have quoted 1.249 V, which would then be accurate to 0.001 V',
      ],
      answer: 0,
      why: {
        1: 'A meter displays every digit its converter produces. Whether those digits are true depends on its calibration, which the display cannot show.',
        2: 'Half a step is the rounding error, one contribution to the uncertainty; the bias the specification allows is separate and usually larger.',
        3: 'Rounding the reading does not make the meter more accurate; it only throws away resolution.',
      },
      hints: ['Which of resolution, precision and accuracy does the number of displayed digits tell you?'],
      teach: 'More digits mean finer resolution, never by themselves better accuracy.',
      explain: t`Here the readings repeat to about 0.1 mV, yet sit about 0.7 mV above the true value — inside the specification band of $\pm(0.05\% \times 1.2486\ \text{V} + 2 \times 0.1\ \text{mV}) \approx \pm 0.8$ mV, so the meter is working exactly as specified. The voltage is known to about $\pm 0.8$ mV, not $\pm 0.1$ mV.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-fullscale', difficulty: 2, transfer: true,
      gen(r) {
        const fs = r.pick([1000, 2000, 3000, 5000]), pct = r.pick([0.25, 0.5]), p = r.pick([0.05, 0.08, 0.1, 0.15]) * fs;
        const lim = (pct / 100) * fs, frac = (100 * lim) / p;
        return {
          prompt: t`A propellant-tank pressure transducer has a range of 0–${fs} psi and an accuracy of ±${pct}% of full scale. During tank chill-down it reads ${p} psi. What is the accuracy limit as a percentage of this reading?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, fs], y: [-2.2 * lim, 2.2 * lim], xlabel: 'reading (psi)', ylabel: 'allowed error (psi)', xticks: 5, yticks: 4, axesAt: 'edge', shade: [{ fn: String(lim), lower: String(-lim), from: 0, to: fs, color: 'violet', alpha: 0.2 }], vlines: [{ x: p, color: 'gold', label: `${p} psi` }] }, caption: 'A % of full scale specification allows the same error band at every reading — small next to a large pressure, large next to a small one.' },
          answer: frac, units: '%', tol: { rel: 0.01 },
          errors: [{ value: pct, feedback: 'That is the limit as a percentage of full scale; as a percentage of this small reading it is much larger.' }],
          hints: [t`The limit is $${pct}\% \times ${fs}$ psi at every reading.`, 'Divide it by the reading and multiply by 100.'],
          teach: 'A % of full scale specification is a fixed limit, so its relative size grows at the low end of the range.',
          explain: t`$\pm${pct}\% \times ${fs} = \pm${lim}$ psi, which is $${lim}/${p} = ${frac.toFixed(1)}\%$ of the reading. Choose a transducer whose range suits the pressures that matter.`,
        };
      },
    }),
    mcq({
      id: 'cp-average', difficulty: 2,
      prompt: 'A group of shots is tight but two rings off-centre. You take a hundred more shots and average them all. What improves?',
      visual: stat('target', { bias: 2, spread: 0.6, n: 40, seed: 21, angle: 300 }, 'Forty shots with a bias of two rings.'),
      choices: [
        'The mean is located more precisely — but it converges on the biased point, not the bullseye',
        'The mean moves toward the bullseye as the errors average out',
        'Both precision and accuracy improve by a factor of ten',
        'Nothing at all',
      ],
      answer: 0,
      why: {
        1: 'Averaging cancels errors that go both ways at random. The bias pushes every shot the same way, so it survives.',
        2: 'Only the random part improves, and by √(140/40) ≈ 1.9, not 10.',
        3: 'The random uncertainty of the mean does shrink, as 1/√N.',
      },
      hints: ['Which kind of error goes both ways at random, and which is the same every shot?'],
      teach: 'Averaging improves precision of the mean, never accuracy.',
      explain: 'The mean’s scatter falls as $1/\\sqrt N$, so you learn ever more exactly where the biased group is centred. Finding the bias needs a reference: a calibration.',
    }),
    num({
      id: 'cp-range', difficulty: 3,
      gen(r) {
        const v = +(r.int(2000, 5800) / 1000).toFixed(2);
        const l6 = M.specLimit(v, { pct: 0.05, digits: 1, res: 0.001 }), l60 = M.specLimit(v, { pct: 0.05, digits: 1, res: 0.01 });
        return {
          prompt: t`The same multimeter has the same ±(0.05% of reading + 1 digit) specification on its 60 V range, where one digit is 0.01 V. Measuring about ${v.toFixed(2)} V there instead of on the 6 V range, what is the specification limit, in millivolts?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 6], y: [0, 14], xlabel: 'reading (V)', ylabel: 'spec limit (mV)', xticks: 6, yticks: 7, axesAt: 'edge', curves: [{ fn: '0.5x + 1', color: 'accent', label: '6 V range', labelAt: 4.6, labelDy: 14 }], vlines: [{ x: v, color: 'gold' }] }, caption: 'The specification limit against the reading on the 6 V range; gold marks this reading. Where would the 60 V range’s line sit?' },
          answer: l60 * 1000, units: 'mV', tol: { rel: 0.01 },
          errors: [{ value: l6 * 1000, feedback: 'That is the limit on the 6 V range. On the 60 V range one digit is 0.01 V.' }],
          hints: ['On the 60 V range the display step is 0.01 V, so “1 digit” is 10 mV.', t`$0.0005 \times ${v.toFixed(2)}$ V $+ 0.01$ V.`],
          teach: 'The digit term of a specification is set by the range, so the lowest range that holds the reading gives the smallest limit.',
          explain: t`$0.0005 \times ${v.toFixed(2)} + 0.010 = ${(l60 * 1000).toFixed(1)}$ mV, against $${(l6 * 1000).toFixed(2)}$ mV on the 6 V range: about ${(l60 / l6).toFixed(1)} times worse for the same voltage.`,
        };
      },
    }),
  ],
  sources: [SRC.gum, FLUKE, SRC.taylor('ch. 1, 4')],
});
