// The speed of sound — the lab view: a resonance tube closed by a water
// surface, struck tuning forks, and the first two resonance lengths for each.
// L = v(2n − 1)/4f − e is a straight line whose slope is the speed of sound
// and whose intercept is minus the end correction; forcing it through the
// origin is the classic mistake. The comparison value is the ideal-gas
// √(γRT/M) at the thermometer's temperature — so a thermometer reading the
// wrong air is the systematic. A rocket nozzle's sonic throat as the
// transfer. Every number is computed from the seeded model the labg-classics
// simulation draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, tex, colTable, SIMNOTE, SRC } from './_classic.js';

const t = String.raw;
const PS = M.EXPERIMENTS.sound.defaults;
const vAcc = M.vSound(PS.Tc);
const eAcc = 610 * PS.rt;                        // mm
const sTc = 0.5;
const sVacc = M.vSound(PS.Tc + sTc) - vAcc;      // m/s from the thermometer's ±0.5 °C

// the worked example: seed 1
const EX = M.run('sound', { seed: 1 });
const EXv = EX.results[0], EXe = EX.results[1];
const sComb = Math.hypot(EXv.sigma, sVacc), zEX = (EXv.value - vAcc) / sComb;
const runS = (seed, flags = {}, axes = null) => M.run('sound', { seed, flags, axes });
// the warm-tube question's run (seed 2, tube air 4 °C warm)
const WM = runS(2, { warm: true }), wv = +WM.results[0].value.toFixed(1);
const wFrac = wv / +vAcc.toFixed(1) - 1;

export default lesson({
  id: 'lab.E.25',
  title: 'Speed of sound',
  minutes: 16, difficulty: 2,
  lab: true,
  intro: t`Strike a tuning fork over a tube whose bottom is closed by water, and lower the water: at certain lengths the air column booms. Sound resonates when the column holds an odd number of quarter wavelengths — a pressure antinode at the water, a displacement antinode at the open top. But the open end’s antinode sits a little *outside* the tube, by the **end correction** $e \approx 0.61r$ for a tube of radius $r$. Plot the resonance lengths against $(2n - 1)/4f$: the slope is the speed of sound, $v = f\lambda$, and the intercept is $-e$ — measured, not assumed.`,
  equation: t`L_n = v\,\frac{2n - 1}{4f} - e`,
  symbols: [
    { tex: 'L_n', text: 'the length of air from the tube’s mouth to the water at the $n$-th resonance, in mm' },
    { tex: 'n', text: 'the resonance number: 1 for the shortest column (a quarter wavelength), 2 for the next (three quarters)' },
    { tex: 'f', text: 'the tuning fork’s frequency, in Hz' },
    { tex: 'v', text: 'the speed of sound in the tube’s air, in m/s' },
    { tex: 'e', text: 'the end correction, in mm: how far beyond the mouth the effective open end lies, about $0.61r$ for an unflanged tube' },
    { tex: 'r', text: 'the tube’s inner radius, 20 mm here' },
  ],
  why: t`The speed of sound sets the choking of every rocket nozzle and jet intake, the timing of every sonic anemometer — and, through $v = \sqrt{\gamma RT/M}$, it is one of the most accurate thermometers there is.`,
  visual: {
    type: 'labg-classics',
    title: 'The bench: a resonance tube',
    lead: t`Choose a fork and take a reading: both resonance lengths go in the table, and the tube above shows the standing wave of the second one (the air’s motion is widest at antinodes). The plot puts every resonance at $x = (2n - 1)/4f$; the readout turns the slope into $v$ and the intercept into the end correction, and compares $v$ with the ideal-gas value at the thermometer’s 22.0 °C.`,
    tasks: [
      'Switch Plot to “forced through 0”: the line misses the points in a pattern, χ²/ν leaps to about 40, and v comes out about 2% low.',
      'Switch on “Tube air 4 °C warmer than the thermometer”: the fit is as good as ever, and v is now several σ above the comparison value.',
      'Read L₂ − L₁ for one fork: half a wavelength, with the end correction gone.',
    ],
    params: { exp: 'sound', seed: 2, expected: true },
    caption: t`Simulated: dry air at 22.0 °C as an ideal gas ($\gamma = 1.400$, $M = 28.965$ g/mol), a tube of radius 20 mm with end correction $0.61r$, each resonance found to $\sigma = 1$ mm. Humidity (which speeds sound by a few tenths of a percent) is left out. Dashed green: the line the ideal-gas $v$ predicts. ${SIMNOTE}`,
  },
  example: {
    prompt: t`The thermometer reads $22.0 \pm 0.5\ ^\circ$C. For eight forks the first two resonances, each to $\sigma = 1$ mm:

${colTable([[t`f\ (\text{Hz})`, ...EX.R.map((q) => String(q.f))], [t`L_1\ (\text{mm})`, ...EX.R.map((q) => String(q.L1))], [t`L_2\ (\text{mm})`, ...EX.R.map((q) => String(q.L2))]])}

Find $v$ and the end correction with their uncertainties, and compare $v$ with the ideal-gas value.`,
    visual: rigPlot('sound', { seed: 1, expected: true }, t`All sixteen resonances against $(2n - 1)/4f$, the weighted fit (gold), the ideal-gas line (dashed) and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Linearize', text: t`$L_n + e = (2n - 1)\lambda/4$ and $\lambda = v/f$, so $L_n = v\,x - e$ with $x = (2n - 1)/4f$. Both resonances of every fork go on one plot: sixteen points, $x$ from $${(250 / 512).toFixed(3)}$ to $${(750 / 256).toFixed(3)}$ ms.` },
      { label: 'Fit', text: t`With $L$ in mm and $x$ in ms, the slope is in mm/ms — which is m/s: $v = ${pmT(EXv.value, EXv.sigma)}$ m/s. The intercept is $${pmT(EX.fit.a, EX.fit.sa)}$ mm, so $e = ${pmT(EXe.value, EXe.sigma)}$ mm. $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ for $\nu = 14$.` },
      { label: 'Expected', text: t`$v = \sqrt{\gamma RT/M} = \sqrt{1.400 \times 8.3145 \times 295.15/0.028965} = ${vAcc.toFixed(2)}$ m/s. Since $v \propto \sqrt T$, the thermometer’s 0.5 K gives $\pm ${sVacc.toFixed(2)}$ m/s.` },
      { label: 'Compare', text: t`$z = (${EXv.value.toFixed(2)} - ${vAcc.toFixed(2)})/\sqrt{${EXv.sigma.toFixed(2)}^2 + ${sVacc.toFixed(2)}^2}$ $= ${zEX.toFixed(2)}$: agreement at the 0.1% level. And the end correction, ${EXe.value.toFixed(1)} mm, matches $0.61r = ${eAcc.toFixed(1)}$ mm.` },
      { label: 'Sense check', text: t`A sound wave at 512 Hz is ${(vAcc / 512 * 100).toFixed(0)} cm long; its quarter, ${(vAcc / 512 / 4 * 1000).toFixed(0)} mm, minus the end correction, is the first resonance in the table.` },
    ],
    answer: t`$v = ${pmT(EXv.value, EXv.sigma)}$ m/s ($${Math.abs(zEX).toFixed(1)}\sigma$ from the ideal-gas ${vAcc.toFixed(1)} m/s at 22.0 °C); end correction $${pmT(EXe.value, EXe.sigma)}$ mm.`,
  },
  practice: [
    num({
      id: 'difference', difficulty: 1,
      gen(r) {
        const seed = r.int(1, 9999), f = r.pick([288, 320, 384, 480]);
        const q = M.readRows('sound', M.makeRows('sound', { seed, settings: [f] }))[0];
        const ans = (f * 2 * (q.L2 - q.L1)) / 1000;
        return {
          prompt: t`With a $${f}$ Hz fork, the first resonance is at $L_1 = ${q.L1}$ mm and the second at $L_2 = ${q.L2}$ mm. What speed of sound do these two readings give? Answer in m/s.`,
          visual: rigRaw('sound', { seed, settings: [f] }, 'The tube at the second resonance (simulated, to scale): the gold curves show how far the air moves, widest at antinodes.'),
          answer: ans, units: 'm/s', tol: { rel: 0.003 },
          errors: [
            { value: (f * (q.L2 - q.L1)) / 1000, feedback: t`Neighbouring resonances are half a wavelength apart: $\lambda = 2(L_2 - L_1)$.` },
            { value: (f * 4 * q.L1) / 1000, feedback: t`$4L_1$ ignores the end correction: the difference $L_2 - L_1$ cancels it.` },
          ],
          hints: [t`$L_2 - L_1 = \lambda/2$: the end correction cancels in the difference.`, t`$v = f\lambda = 2f(L_2 - L_1)$.`],
          teach: t`Successive resonances are $\lambda/2$ apart, whatever the end correction: $v = 2f(L_2 - L_1)$.`,
          explain: t`$\lambda = 2(${q.L2} - ${q.L1}) = ${2 * (q.L2 - q.L1)}$ mm, so $v = ${f} \times ${(2 * (q.L2 - q.L1) / 1000).toFixed(3)} = ${ans.toFixed(1)}$ m/s. Two readings each to 1 mm give about 0.4%; the fit of sixteen does far better.`,
        };
      },
    }),
    num({
      id: 'ideal', difficulty: 2,
      gen(r) {
        const Tc = r.pick([0, 15, 20, 25, 30, -10]);
        const ans = M.vSound(Tc);
        return {
          prompt: t`Treating dry air as an ideal gas with $\gamma = 1.400$ and molar mass $M = 28.965$ g/mol, what is the speed of sound at $${Tc}\ ^\circ$C? ($R = 8.3145$ J mol⁻¹ K⁻¹.) Answer in m/s.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-20, 40], y: [315, 360], xlabel: 'air temperature (°C)', ylabel: 'v (m/s)', axesAt: 'edge', curves: [{ fn: `sqrt(1.4*8.314462618*(x + 273.15)/0.0289647)`, color: 'accent' }] }, caption: 'The ideal-gas speed of sound in dry air against temperature: about 0.6 m/s per kelvin near room temperature.' },
          answer: ans, units: 'm/s', tol: { rel: 0.002 },
          errors: [
            { value: Math.sqrt((1.4 * M.K.R * Math.max(Tc, 1)) / 0.0289647), feedback: 'Use the absolute temperature: add 273.15 to the Celsius reading.' },
            { value: Math.sqrt((1.4 * M.K.R * (Tc + 273.15)) / 28.965), feedback: 'Put the molar mass in kg/mol: 0.028965.' },
            { value: Math.sqrt((M.K.R * (Tc + 273.15)) / 0.0289647), feedback: t`That is Newton’s isothermal speed: sound is adiabatic, so include $\gamma$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$v = \sqrt{\gamma RT/M}$ with $T$ in kelvin and $M$ in kg/mol.`],
          teach: t`$v = \sqrt{\gamma RT/M}$: sound depends on temperature and on the gas, not on pressure.`,
          explain: t`$v = \sqrt{1.400 \times 8.3145 \times ${(Tc + 273.15).toFixed(2)}/0.028965} = ${ans.toFixed(1)}$ m/s.`,
        };
      },
    }),
    num({
      id: 'end', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = runS(seed);
        const a = +A.fit.a.toFixed(1);
        const ans = -a / 0.61;
        return {
          prompt: t`A resonance-tube fit gives an intercept of $${a.toFixed(1)}$ mm. If the end correction is $0.61r$, what is the tube’s inner radius? Answer in mm.`,
          visual: rigPlot('sound', { seed, residuals: false }, t`The fit, extended back to $x = 0$: it crosses below zero by the end correction. ${SIMNOTE}`),
          answer: ans, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: (-a / 0.61) * 2, feedback: 'That is the diameter; the end correction is 0.61 times the radius.' }, { value: -a * 0.61, feedback: t`Divide: $r = e/0.61$.` }],
          hints: [t`The intercept is $-e$.`, t`$r = e/0.61$.`],
          teach: 'The intercept of L against (2n − 1)/4f is minus the end correction: the open end acts as if it were a little beyond the mouth.',
          explain: t`$e = ${(-a).toFixed(1)}$ mm, so $r = ${(-a).toFixed(1)}/0.61 = ${ans.toFixed(1)}$ mm (the tube’s true radius is 20 mm; the intercept’s σ is about 0.5 mm).`,
        };
      },
    }),
    mcq({
      id: 'origin', difficulty: 3,
      prompt: t`A student forces the line through the origin (“no end correction”). The residuals form a tilted pattern instead of scattering about zero, and $\chi^2/\nu$ is about 40. What has happened to $v$?`,
      visual: rigPlot('sound', { seed: 3, axes: 'origin', expected: true }, t`The same sixteen resonances fitted through the origin, with the ideal-gas line (dashed). ${SIMNOTE}`),
      choices: [
        t`It comes out low: the true line has intercept $-e$, and a line pinned at the origin must be shallower to pass near points that all sit $e$ lower`,
        t`It comes out high: forcing the origin steepens the line`,
        'Nothing: the end correction only changes the intercept, and the slope is protected',
        'It is fine, but its σ is larger',
      ],
      answer: 0,
      why: {
        1: t`Pinning the line at $(0, 0)$ when the data aim for $(0, -e)$ lifts its left end: it tilts down, not up.`,
        2: t`The slope is protected only if the intercept is *free*. Forcing it to zero transfers the offset into the slope.`,
        3: t`The σ through the origin is actually smaller — and wrong. A huge $\chi^2/\nu$ is the warning.`,
      },
      hints: ['Where does the true line cross x = 0?', 'If a line must pass through (0, 0) but the points lie on a line that crosses at −12 mm, which way does it tilt?'],
      teach: 'Never force a fit through the origin unless the physics guarantees it: an ignored offset leaks into the slope.',
      explain: t`The best line through the origin trades the missing intercept for a lower slope — about 2% low here, tens of σ — and the residuals tilt and the $\chi^2$ explodes. Leave the intercept free; it measures the end correction instead of hiding it.`,
    }),
    mcq({
      id: 'warm', difficulty: 3,
      prompt: t`A run’s $v$ is $${wv.toFixed(1)} \pm ${WM.results[0].sigma.toFixed(1)}$ m/s, about ${Math.round((WM.results[0].value - vAcc) / WM.results[0].sigma)}σ above the ideal-gas value at the thermometer’s 22.0 °C. The fit is fine ($\chi^2/\nu \approx 1$) and the end correction looks right. Which explanation is most likely?`,
      visual: rigPlot('sound', { seed: 2, flags: { warm: true }, expected: true }, t`The run (gold fit) against the ideal-gas line at the thermometer’s reading (dashed). ${SIMNOTE}`),
      choices: [
        'The air in the tube is warmer than the air at the thermometer: a few kelvin would do it, since v grows by 0.17% per kelvin',
        'The tuning forks are 0.7% sharp, so every λ reads short',
        'The water surface is not flat, so every length reads long',
        'Sound travels faster in a narrow tube',
      ],
      answer: 0,
      why: {
        1: 'Tuning forks hold their stamped frequency to about 0.1% — far too good to explain a 0.6% excess.',
        2: 'A constant length error shifts the intercept (the end correction), not the slope.',
        3: 'Wall friction slows sound slightly in a narrow tube (by well under 0.1% here), it does not speed it up.',
      },
      hints: [t`How does $v$ depend on $T$?`, t`$v \propto \sqrt T$: what temperature makes $v = ${wv.toFixed(1)}$ m/s instead of ${vAcc.toFixed(1)}?`],
      teach: 'When the comparison value depends on a side measurement, a systematic can hide in that side measurement.',
      explain: t`$v \propto \sqrt T$: $${wv.toFixed(1)}/${vAcc.toFixed(1)}$ is ${(100 * wFrac).toFixed(2)}% faster, or $${(200 * wFrac).toFixed(2)}\%$ in $T$ — about ${(295.15 * ((1 + wFrac) ** 2 - 1)).toFixed(1)} K. A lamp near the tube or a draught at the thermometer is enough. Put the thermometer in the tube’s air.`,
    }),
    num({
      id: 'thermometer', difficulty: 2,
      gen(r) {
        const v = r.pick([340.1, 343.0, 345.5, 349.8, 331.8]);
        const ans = (0.0289647 * v * v) / (1.4 * M.K.R) - 273.15;
        return {
          prompt: t`Run the comparison backwards: if dry air’s $\gamma = 1.400$ and $M = 28.965$ g/mol are trusted, a measured $v = ${v}$ m/s implies what air temperature? Answer in °C.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [320, 360], y: [-20, 45], xlabel: 'v (m/s)', ylabel: 'T (°C)', axesAt: 'edge', curves: [{ fn: '0.0289647*x^2/(1.4*8.314462618) - 273.15', color: 'accent' }] }, caption: 'Temperature from the speed of sound in dry air (ideal gas): an acoustic thermometer.' },
          answer: ans, units: '°C', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: ans + 273.15, feedback: 'That is in kelvin: subtract 273.15 for °C.' }],
          hints: [t`$T = Mv^2/(\gamma R)$, in kelvin.`],
          teach: t`Inverting $v = \sqrt{\gamma RT/M}$ makes sound a thermometer: $T = Mv^2/\gamma R$.`,
          explain: t`$T = 0.028965 \times ${v}^2/(1.400 \times 8.3145) = ${(ans + 273.15).toFixed(2)}$ K $= ${ans.toFixed(1)}\ ^\circ$C. Acoustic gas thermometry, in a precisely machined resonator, measured $k_B$ to parts per million before the 2019 SI.`,
        };
      },
    }),
    mcq({
      id: 'humid', difficulty: 2,
      prompt: 'On a humid day, how does the speed of sound in the tube compare with the dry-air value at the same temperature?',
      visual: rigRaw('sound', { seed: 5, settings: [426.7] }, 'The tube at the second resonance of a 426.7 Hz fork (simulated).'),
      choices: [
        'A little faster: water molecules (18 g/mol) are lighter than nitrogen and oxygen, so humid air has a smaller molar mass',
        'A little slower: water vapour makes the air denser',
        'The same: only temperature matters',
        'Much slower: sound is absorbed by water vapour',
      ],
      answer: 0,
      why: {
        1: 'Humid air is *less* dense than dry air at the same temperature and pressure: water vapour replaces heavier molecules.',
        2: t`$v = \sqrt{\gamma RT/M}$ depends on the gas too, through $M$ and $\gamma$.`,
        3: 'Absorption weakens sound; it does not change its speed appreciably.',
      },
      hints: [t`$v = \sqrt{\gamma RT/M}$. What does water vapour do to $M$?`],
      teach: 'The speed of sound depends on the gas through γ/M: lighter gas, faster sound.',
      explain: t`Replacing some 29 g/mol air by 18 g/mol water lowers $M$; $\gamma$ falls slightly too, but the net effect is a few tenths of a percent faster at room temperature — comparable to this experiment’s precision, so it belongs in the uncertainty budget.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 9999), A = runS(seed);
        const v = +A.results[0].value.toFixed(2), s = +Math.hypot(A.results[0].sigma, sVacc).toFixed(2);
        const ans = (v - vAcc) / s;
        return {
          prompt: t`A run gives $v = ${v.toFixed(2)}$ m/s, with a combined σ (fit and thermometer) of $${s.toFixed(2)}$ m/s. The ideal-gas value at 22.0 °C is $${vAcc.toFixed(2)}$ m/s. Give $z$, with its sign.`,
          visual: rigPlot('sound', { seed, expected: true }, t`The run, with the ideal-gas line (dashed). ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.06 },
          errors: [{ value: (100 * (v - vAcc)) / vAcc, feedback: 'That is the percentage difference: divide by σ.' }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: ['Subtract the expected value.', t`$z = \Delta/\sigma$.`],
          teach: t`$z$ = difference ÷ combined uncertainty.`,
          explain: t`$z = (${v.toFixed(2)} - ${vAcc.toFixed(2)})/${s.toFixed(2)} = ${ans.toFixed(2)}$.`,
        };
      },
    }),
    num({
      id: 'cp-third', difficulty: 2,
      gen(r) {
        const f = r.pick([320, 384, 512]), e = r.pick([11.5, 12.2, 13.0]);
        const v = +vAcc.toFixed(1);
        const ans = (5 * v * 1000) / (4 * f) - e;
        return {
          prompt: t`With $v = ${v}$ m/s and an end correction of $${e}$ mm, where will the *third* resonance of a $${f}$ Hz fork be? Answer in mm.`,
          visual: rigRaw('sound', { seed: 6, settings: [f] }, 'The second resonance of this fork (simulated). The third needs a longer tube.'),
          answer: ans, units: 'mm', tol: { rel: 0.003 },
          errors: [{ value: (3 * v * 1000) / (4 * f) - e, feedback: t`The third resonance has $2n - 1 = 5$: five quarter wavelengths.` }, { value: (5 * v * 1000) / (4 * f), feedback: 'Subtract the end correction.' }],
          hints: [t`$L_3 = 5\lambda/4 - e$.`],
          teach: 'Resonances of a closed tube come at odd numbers of quarter wavelengths, less the end correction.',
          explain: t`$\lambda = ${v}/${f} = ${(v / f * 1000).toFixed(1)}$ mm; $L_3 = 5\lambda/4 - ${e} = ${ans.toFixed(1)}$ mm.`,
        };
      },
    }),
    num({
      id: 'cp-nozzle', difficulty: 3, transfer: true,
      gen(r) {
        const g = r.pick([1.20, 1.22, 1.25]), Mm = r.pick([0.0135, 0.022, 0.026]), T = r.pick([2800, 3100, 3300]);
        const ans = Math.sqrt((g * M.K.R * T) / Mm);
        return {
          prompt: t`In a rocket nozzle the flow is exactly sonic at the throat. If the exhaust there is at $${T}$ K with $\gamma = ${g}$ and mean molar mass $${(Mm * 1000).toFixed(1)}$ g/mol, how fast is it moving? Answer in m/s.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3500], y: [0, 2000], xlabel: 'gas temperature (K)', ylabel: 'speed of sound (m/s)', axesAt: 'edge', curves: [{ fn: `sqrt(${g}*8.314462618*x/${Mm})`, color: 'warn' }, { fn: 'sqrt(1.4*8.314462618*x/0.0289647)', color: 'accent', dash: true, label: 'air', labelAt: 3000, labelDy: 14 }] }, caption: 'The speed of sound against temperature for this exhaust (solid) and for air (dashed): ideal gases.' },
          answer: ans, units: 'm/s', tol: { rel: 0.003 },
          errors: [{ value: Math.sqrt((g * M.K.R * T) / (Mm * 1000)), feedback: 'Molar mass in kg/mol.' }, { value: Math.sqrt((1.4 * M.K.R * T) / 0.0289647), feedback: t`Use the exhaust’s own $\gamma$ and $M$, not air’s.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$a = \sqrt{\gamma RT/M}$.`, t`$M = ${Mm}$ kg/mol.`],
          teach: t`The speed of sound $\sqrt{\gamma RT/M}$ sets the throat velocity of every choked nozzle — hot, light exhaust is fast.`,
          explain: t`$a = \sqrt{${g} \times 8.3145 \times ${T}/${Mm}} = ${ans.toFixed(0)}$ m/s. Light, hot gas sounds fast — the reason hydrogen-rich exhaust gives high exhaust velocity, and the same formula your tuning forks checked.`,
        };
      },
    }),
  ],
  sources: [
    SRC.os1('17.2', '17-2-speed-of-sound'),
    SRC.os1('17.4', '17-4-normal-modes-of-a-standing-sound-wave'),
    { label: 'H. Levine & J. Schwinger, On the radiation of sound from an unflanged circular pipe, Phys. Rev. 73, 383 (1948)', url: 'https://doi.org/10.1103/PhysRev.73.383' },
    { label: 'O. Cramer, The variation of the specific heat ratio and the speed of sound in air with temperature, pressure, humidity, and CO₂ concentration, J. Acoust. Soc. Am. 93, 2510 (1993)', url: 'https://doi.org/10.1121/1.405827' },
    SRC.codata,
  ],
});
