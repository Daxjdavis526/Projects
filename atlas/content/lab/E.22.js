// Thermal noise (Johnson noise) — the lab view: the mean-square noise voltage
// of resistors at room temperature, through an amplifier and a band-limiting
// filter, plotted against resistance: a straight line whose slope is
// 4k_BTΔf and whose intercept is the amplifier's own noise. Boltzmann's
// constant from noise, with a Type B budget (gain, bandwidth, temperature);
// shunt capacitance as the systematic that bends the high-R points down;
// averaging time; noise thermometry; and a deep-space receiver's noise floor
// as the transfer. Every number is computed from the seeded model the
// labg-classics simulation draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, tex, colTable, SIMNOTE, SRC } from './_classic.js';
import { budget } from './_unc.js';

const t = String.raw;
const PJ = M.EXPERIMENTS.johnson.defaults;
const kB = M.K.kB;

// the worked example: seed 3, resistor mounted at the input (no cable capacitance)
const EX = M.run('johnson', { seed: 3, flags: { cap: false } });
const EXk = EX.results[0], EXe = EX.results[1];
const rG = 0.005, rB = 0.005, sT = 0.5;
const relS = EXk.sigma / EXk.value, relT = sT / PJ.T;
const relAll = Math.hypot(relS, 2 * rG, rB, relT);
const sAll = relAll * EXk.value, zAll = (EXk.value - kB) / sAll;
const runJ = (seed, flags = {}) => M.run('johnson', { seed, flags });

export default lesson({
  id: 'lab.E.22',
  title: 'Thermal noise (Johnson noise)',
  minutes: 17, difficulty: 3,
  lab: true,
  intro: t`In 1926 John B. Johnson found that every resistor is a tiny noise generator: its electrons jostle with thermal energy, and the voltage across it flickers even with nothing connected. Harry Nyquist explained it from thermodynamics: in a bandwidth $\Delta f$ the mean-square voltage is proportional to the temperature, the resistance and the bandwidth — and Boltzmann’s constant sets the scale. **Plot $\langle V^2\rangle$ against $R$** at fixed temperature: the slope is $4k_BT\Delta f$, and the intercept is the noise the amplifier adds on its own. Measuring a few microvolts of noise weighs the energy of thermal motion.`,
  equation: t`\langle V^2\rangle = 4k_BT\Delta f\,R + e_n^2\,\Delta f`,
  symbols: [
    { tex: '\\langle V^2\\rangle', text: 'the mean-square noise voltage, averaged over time, referred to the amplifier’s input, in $\\mu\\text{V}^2$' },
    { tex: 'k_B', text: 'Boltzmann’s constant: exactly $1.380\\,649\\times10^{-23}$ J/K since the 2019 SI' },
    { tex: 'T', text: 'the resistor’s absolute temperature, in K (295 K here)' },
    { tex: '\\Delta f', text: 'the equivalent noise bandwidth of the filter, in Hz (10 kHz here): the width of a perfect brick-wall filter that passes the same noise power' },
    { tex: 'R', text: 'the resistance across the amplifier’s input, in Ω' },
    { tex: 'e_n', text: 'the amplifier’s own voltage noise density, in $\\text{nV}/\\sqrt{\\text{Hz}}$ — uncorrelated with the resistor’s, so the two add in mean square' },
  ],
  why: t`Johnson noise is the floor under every sensitive measurement — a radio telescope’s receiver, a spacecraft’s downlink, a strain gauge — and today noise thermometry measures temperature from $k_B$ itself.`,
  visual: {
    type: 'labg-classics',
    title: 'The bench: the noise of resistors',
    lead: t`Choose a resistor and take a reading: the upper panel shows 2 ms of its noise at the amplifier input, with the rms level dashed. Each reading is the mean square over 10 s. Below, $\langle V^2\rangle$ against $R$ with the weighted fit; the readout turns the slope into $k_B$ and the intercept into the amplifier’s noise density.`,
    tasks: [
      t`As set up, 50 pF of cable shunts the resistor: the 90 and 100 kΩ points sag below the line, the residuals arch, and $k_B$ comes out several percent low.`,
      t`Switch the capacitance off (the resistor mounted right at the input): the residuals flatten, $\chi^2/\nu$ drops to about 1 and $k_B$ agrees with its exact value.`,
      'Compare the intercept with and without the capacitance: a bent line fitted straight spoils both coefficients.',
    ],
    params: { exp: 'johnson', seed: 2, expected: true },
    caption: t`Simulated: $T = 295$ K, a brick-wall band of 10 kHz, an amplifier adding $4\ \text{nV}/\sqrt{\text{Hz}}$, each mean square averaged for 10 s (relative σ 0.32%); the gain is taken as exactly calibrated. Dashed green: the line the exact $k_B$ predicts. ${SIMNOTE}`,
  },
  example: {
    prompt: t`With each resistor mounted at the amplifier’s input, at $T = 295.0 \pm 0.5$ K and a noise bandwidth of $10.00$ kHz, the mean squares (σ = 0.32% each) are:

${colTable([[t`R\ (\text{k}\Omega)`, ...EX.R.map((q) => String(q.R))], [t`\langle V^2\rangle\ (\mu\text{V}^2)`, ...EX.R.map((q) => q.v2.toFixed(3))]])}

The amplifier’s gain is known to 0.5% and the bandwidth to 0.5%. Find $k_B$ with its full uncertainty.`,
    visual: rigPlot('johnson', { seed: 3, flags: { cap: false }, expected: true }, t`Mean-square noise against resistance, the weighted fit (gold), the line the exact $k_B$ predicts (dashed) and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Why a line', text: t`The resistor’s noise and the amplifier’s are independent, so their mean squares add: $\langle V^2\rangle = (4k_BT\Delta f)R + e_n^2\Delta f$. Slope: $4k_BT\Delta f$. Intercept: the amplifier alone.` },
      { label: 'Fit', text: t`The bars grow with $\langle V^2\rangle$ (a fixed relative σ), so weight: slope $${pmT(EX.fit.b, EX.fit.sb)}\ \mu\text{V}^2/\text{k}\Omega$, intercept $${pmT(EX.fit.a, EX.fit.sa)}\ \mu\text{V}^2$, $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$.` },
      { label: 'Boltzmann', text: t`$1\ \mu\text{V}^2/\text{k}\Omega = 10^{-15}\ \text{V}^2/\Omega$, so $k_B = b/(4T\Delta f)$ $= ${tex(EX.fit.b * 1e-15, 5)}/(4 \times 295.0 \times 10^4)$ $= ${tex(EXk.value, 5)}$ J/K, statistical σ $${(100 * relS).toFixed(2)}\%$.` },
      { label: 'Type B', text: t`The gain $G$ is squared in $\langle V^2\rangle$, so its 0.5% counts as 1%; the bandwidth gives 0.5%; the temperature $0.5/295 = ${(100 * relT).toFixed(2)}\%$. In quadrature with the fit: $${(100 * relAll).toFixed(2)}\%$. **The calibration, not the noise, limits the result.**` },
      { label: 'Compare', text: t`$k_B = ${pmT(EXk.value * 1e23, sAll * 1e23)}\times10^{-23}$ J/K against the exact $1.380\,649\times10^{-23}$: $z = ${zAll.toFixed(2)}$.` },
      { label: 'Amplifier', text: t`The intercept gives $e_n = \sqrt{a/\Delta f} = \sqrt{${tex(EX.fit.a * 1e-12, 3)}/10^4} = ${EXe.value.toFixed(2)}\ \text{nV}/\sqrt{\text{Hz}}$ — the same noise as a ${(EXe.value ** 2 * 1e-18 / (4 * kB * PJ.T) / 1e3).toFixed(1)} kΩ resistor would make.` },
    ],
    answer: t`$k_B = ${pmT(EXk.value * 1e23, sAll * 1e23)}\times10^{-23}$ J/K (fit, gain, bandwidth and temperature combined), $${Math.abs(zAll).toFixed(1)}\sigma$ from the exact value; amplifier noise $${EXe.value.toFixed(1)}\ \text{nV}/\sqrt{\text{Hz}}$.`,
  },
  practice: [
    num({
      id: 'vrms', difficulty: 1,
      gen(r) {
        const R = r.pick([1, 10, 50, 100]), T = r.pick([77, 295, 300]), B = r.pick([1, 10, 20]);
        const ans = Math.sqrt(4 * kB * T * R * 1e3 * B * 1e3) * 1e6;
        return {
          prompt: t`What is the rms Johnson noise voltage of a $${R}\ \text{k}\Omega$ resistor at $${T}$ K in a bandwidth of $${B}$ kHz? Answer in μV.`,
          visual: rigRaw('johnson', { seed: 1, settings: [Math.min(100, R)] }, 'The noise at an amplifier input over 2 ms (simulated, 295 K, 10 kHz band); dashed lines at ± the rms.'),
          answer: ans, units: 'uV', tol: { rel: 0.01 },
          errors: [
            { value: ans ** 2, feedback: t`That is the mean square in $\mu\text{V}^2$: take the square root for the rms.` },
            { value: Math.sqrt(kB * T * R * 1e3 * B * 1e3) * 1e6, feedback: t`Nyquist’s formula has a factor 4: $V_\text{rms} = \sqrt{4k_BTR\Delta f}$.` },
          ],
          hints: [t`$V_\text{rms} = \sqrt{4k_BTR\Delta f}$, everything in SI units.`],
          teach: t`$V_\text{rms} = \sqrt{4k_BTR\Delta f}$: about 1.3 μV for 10 kΩ at room temperature in 10 kHz.`,
          explain: t`$\sqrt{4(1.381\times10^{-23})(${T})(${tex(R * 1e3, 2)})(${tex(B * 1e3, 2)})} = ${tex(ans * 1e-6, 3)}$ V $= ${ans.toFixed(3)}\ \mu\text{V}$.`,
        };
      },
    }),
    num({
      id: 'kB-slope', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = runJ(seed, { cap: false });
        const b = +A.fit.b.toFixed(5);
        const ans = (b * 1e-15) / (4 * PJ.T * PJ.B);
        return {
          prompt: t`At $T = 295.0$ K with $\Delta f = 10.00$ kHz, a fit of $\langle V^2\rangle$ (in $\mu\text{V}^2$) against $R$ (in kΩ) has slope $${b.toFixed(5)}$. What value of $k_B$ does it give? Answer in J/K.`,
          visual: rigPlot('johnson', { seed, flags: { cap: false } }, t`The run: mean-square noise against resistance, the weighted fit and residuals. ${SIMNOTE}`),
          answer: ans, units: 'J/K', tol: { rel: 0.002 },
          errors: [
            { value: (b * 1e-12) / (4 * PJ.T * PJ.B), feedback: t`Convert both units: $\mu\text{V}^2 = 10^{-12}\ \text{V}^2$ and $\text{k}\Omega = 10^3\ \Omega$, so the slope is $b\times10^{-15}\ \text{V}^2/\Omega$.` },
            { value: (b * 1e-15) / (PJ.T * PJ.B), feedback: t`The slope is $4k_BT\Delta f$: divide by the 4 as well.` },
          ],
          hints: [t`Slope $= 4k_BT\Delta f$, in $\text{V}^2/\Omega$.`, t`$1\ \mu\text{V}^2/\text{k}\Omega = 10^{-15}\ \text{V}^2/\Omega$.`],
          teach: t`The slope of $\langle V^2\rangle$ against $R$ is $4k_BT\Delta f$; mind the units.`,
          explain: t`$k_B = ${tex(b * 1e-15, 5)}/(4 \times 295.0 \times 10\,000) = ${tex(ans, 5)}$ J/K.`,
        };
      },
    }),
    num({
      id: 'en', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = runJ(seed, { cap: false });
        const a = +A.fit.a.toFixed(3);
        const ans = Math.sqrt((a * 1e-12) / PJ.B) * 1e9;
        return {
          prompt: t`The same fit has intercept $${a.toFixed(3)}\ \mu\text{V}^2$ with $\Delta f = 10.00$ kHz. What is the amplifier’s input noise density $e_n$? Give it as a number of $\text{nV}/\sqrt{\text{Hz}}$.`,
          visual: rigPlot('johnson', { seed, flags: { cap: false }, residuals: false }, t`The fitted line, extended to $R = 0$: what is left when the resistor is a short circuit. ${SIMNOTE}`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: (a * 1e-12) / PJ.B * 1e18, feedback: t`$e_n^2\Delta f$ is the intercept; take the square root after dividing by $\Delta f$.` }, { value: Math.sqrt(a * 1e-12) * 1e9, feedback: t`Divide by the bandwidth first: $e_n$ is a density, per $\sqrt{\text{Hz}}$.` }],
          hints: [t`Intercept $= e_n^2\Delta f$.`, t`$e_n = \sqrt{a/\Delta f}$, with $a$ in $\text{V}^2$.`],
          teach: t`The intercept is the amplifier’s own mean square, $e_n^2\Delta f$.`,
          explain: t`$e_n = \sqrt{${tex(a * 1e-12, 4)}/10^4} = ${tex(ans * 1e-9, 3)}\ \text{V}/\sqrt{\text{Hz}} = ${ans.toFixed(2)}\ \text{nV}/\sqrt{\text{Hz}}$.`,
        };
      },
    }),
    mcq({
      id: 'cap', difficulty: 3,
      prompt: t`With the resistors connected through a metre of cable, the highest-resistance points sit below the line, the residuals arch, and $k_B$ comes out 2% low. What explains it?`,
      visual: rigPlot('johnson', { seed: 5, expected: true }, t`Readings through the cable: data, fit (gold), the exact-$k_B$ line (dashed) and residuals. ${SIMNOTE}`),
      choices: [
        t`The cable’s capacitance shunts the resistor: with $R$ it forms a low-pass filter of corner $1/(2\pi RC)$, which for large $R$ cuts into the band and removes noise`,
        t`Large resistors are colder than small ones`,
        'The amplifier saturates on the largest signals',
        t`Johnson’s formula fails above about 50 kΩ`,
      ],
      answer: 0,
      why: {
        1: 'All the resistors sit at the same room temperature.',
        2: 'The largest signal is about 4 μV rms — far below anything that saturates an amplifier.',
        3: t`Nyquist’s formula holds for any resistance; what changes is the circuit around it. With the resistor at the input the line stays straight to 100 kΩ.`,
      },
      hints: [t`What does a capacitance $C$ in parallel with $R$ do to signals above $1/(2\pi RC)$?`, t`For $C = 50$ pF, where is the corner for 10 kΩ, and for 100 kΩ?`],
      teach: 'Stray capacitance makes the bandwidth depend on R: the biggest resistors lose their high-frequency noise.',
      explain: t`For 100 kΩ and 50 pF the corner is $1/(2\pi \cdot 10^5 \cdot 5\times10^{-11}) = 32$ kHz, close enough to the 10 kHz band to remove about 3% of the noise; for 10 kΩ the corner is 320 kHz and nothing is lost. The line bends down at the right, and a straight fit through it is too shallow. Mount the resistor at the input, or fit only small $R$.`,
    }),
    num({
      id: 'average', difficulty: 3,
      gen(r) {
        const p = r.pick([0.1, 0.2, 0.5]), B = r.pick([1, 10, 20]);
        const ans = 1 / (B * 1e3 * (p / 100) ** 2);
        return {
          prompt: t`Averaging the square of band-limited noise of bandwidth $B$ for a time $\tau$ gives the mean square with relative uncertainty $1/\sqrt{B\tau}$. How long must you average to know $\langle V^2\rangle$ to $${p}\%$ with $B = ${B}$ kHz? Answer in s.`,
          visual: rigRaw('johnson', { seed: 1, settings: [30] }, 'Noise has no memory longer than about 1/B: averaging for τ collects about Bτ independent samples of it.'),
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [
            { value: 1 / (B * 1e3 * (p / 100)), feedback: t`Square the precision: $\tau = 1/(B\,\epsilon^2)$.` },
            { value: 1 / (B * (p / 100) ** 2), feedback: 'Put the bandwidth in hertz.' },
          ],
          hints: [t`Set $1/\sqrt{B\tau} = ${p / 100}$.`, t`$\tau = 1/(B\epsilon^2)$ with $\epsilon = ${p / 100}$.`],
          teach: t`Noise averages down as $1/\sqrt{B\tau}$: a tenfold better precision costs a hundredfold longer.`,
          explain: t`$\tau = 1/(${tex(B * 1e3, 2)} \times ${tex((p / 100) ** 2, 2)}) = ${tex(ans, 3)}$ s. Wider bandwidth means more independent samples per second ([averaging and filtering](#/lesson/lab.A8.2)).`,
        };
      },
    }),
    num({
      id: 'gain', difficulty: 2,
      gen(r) {
        const g = r.pick([0.2, 0.5, 1.0]), stat = r.pick([0.1, 0.2]), bw = r.pick([0.3, 0.5]);
        const ans = Math.hypot(stat, 2 * g, bw);
        return {
          prompt: t`The amplifier’s voltage gain is known to $${g}\%$, the noise bandwidth to $${bw}\%$, and the fit gives the slope to $${stat}\%$. With the temperature exact, what is the relative uncertainty of $k_B$, in percent?`,
          visual: budget([{ label: 'the fit', u: stat }, { label: `gain, squared (2 × ${g}%)`, u: 2 * g }, { label: `bandwidth (${bw}%)`, u: bw }], { unit: '%', caption: 'Each contribution to scale; the gain enters squared, because the meter reads G²⟨V²⟩.' }),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: Math.hypot(stat, g, bw), feedback: t`The measured mean square is $G^2\langle V^2\rangle$: the gain’s relative uncertainty counts twice.` },
            { value: stat + 2 * g + bw, feedback: 'Independent uncertainties add in quadrature.' },
          ].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$k_B \propto (\text{slope})/(G^2\Delta f)$.`, t`Relative: $\sqrt{s^2 + (2g)^2 + b^2}$.`],
          teach: 'A squared input doubles its relative uncertainty; then combine in quadrature.',
          explain: t`$\sqrt{${stat}^2 + (2 \times ${g})^2 + ${bw}^2} = ${ans.toFixed(2)}\%$ — the gain calibration dominates unless it is good to a few parts in $10^3$.`,
        };
      },
    }),
    mcq({
      id: 'thermometer', difficulty: 2,
      prompt: t`The same 10 kΩ resistor is measured at room temperature and then dipped in liquid nitrogen (77 K). With the amplifier’s own noise subtracted, how does the resistor’s mean-square noise compare?`,
      visual: rigRaw('johnson', { seed: 2, settings: [10] }, 'The 10 kΩ resistor’s noise at 295 K (simulated).'),
      choices: [
        t`It falls in proportion to $T$: to $77/295 = 0.26$ of its room-temperature value — a thermometer that needs no calibration but $k_B$`,
        t`It falls to $\sqrt{77/295} = 0.51$ of its room-temperature value`,
        'It does not change: Johnson noise is a property of the resistance',
        t`It vanishes: noise needs electrons to move, and they freeze at 77 K`,
      ],
      answer: 0,
      why: {
        1: t`That is the rms voltage’s ratio. The mean square is proportional to $T$ itself.`,
        2: t`The noise is thermal: $\langle V^2\rangle = 4k_BTR\Delta f$ is proportional to $T$.`,
        3: 'Electrons still move at 77 K; the noise shrinks in proportion to T, it does not vanish (nor would a metal’s electrons freeze).',
      },
      hints: [t`Which power of $T$ appears in $\langle V^2\rangle = 4k_BTR\Delta f$?`],
      teach: t`$\langle V^2\rangle \propto T$: Johnson noise is a primary thermometer.`,
      explain: t`$\langle V^2\rangle \propto T$, so the ratio is $77/295 = 0.261$ (the rms falls to 0.51). Noise thermometers use exactly this: since 2019, with $k_B$ fixed, a noise measurement defines a temperature directly. (A real resistor’s $R$ also changes when cooled: measure it too.)`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 9999), A = runJ(seed, { cap: false });
        const v = +(A.results[0].value * 1e23).toFixed(4);
        const s = +(v * Math.hypot(A.results[0].sigma / A.results[0].value, 2 * rG, rB, relT)).toFixed(3);
        const ans = (v - 1.380649) / s;
        return {
          prompt: t`A Johnson-noise run gives $k_B = (${v.toFixed(4)} \pm ${s.toFixed(3)})\times10^{-23}$ J/K (fit and calibration combined). The 2019 SI fixes $k_B = 1.380\,649\times10^{-23}$ J/K exactly. Give $z$, with its sign.`,
          visual: rigPlot('johnson', { seed, flags: { cap: false }, expected: true }, t`The run, with the line the exact $k_B$ predicts (dashed). ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.05 },
          errors: [{ value: (100 * (v - 1.380649)) / 1.380649, feedback: 'That is the percentage difference: divide the difference by σ.' }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: ['The exact value has no uncertainty.', t`$z = (k_B - 1.380\,649)/\sigma$, in units of $10^{-23}$ J/K.`],
          teach: t`Against an exact constant, $z$ is the difference over your own σ.`,
          explain: t`$z = (${v.toFixed(4)} - 1.3806)/${s.toFixed(3)} = ${ans.toFixed(2)}$.`,
        };
      },
    }),
    num({
      id: 'cp-noiseT', difficulty: 3,
      gen(r) {
        const Tref = 295, V1 = r.pick([1.60, 1.63, 1.66]), fl = 0.16, ratio = r.pick([0.30, 0.42, 1.25, 1.35]);
        const V2 = +(fl + (V1 - fl) * ratio).toFixed(3);
        const ans = Tref * (V2 - fl) / (V1 - fl);
        return {
          prompt: t`A 10 kΩ resistor reads $\langle V^2\rangle = ${V1.toFixed(3)}\ \mu\text{V}^2$ at 295 K, and $${V2.toFixed(3)}\ \mu\text{V}^2$ inside an oven of unknown temperature (its resistance checked unchanged). The amplifier adds $0.160\ \mu\text{V}^2$ in both. What is the oven’s temperature? Answer in K.`,
          visual: rigPlot('johnson', { seed: 4, flags: { cap: false }, residuals: false }, t`The room-temperature calibration line: its intercept is the amplifier’s $0.16\ \mu\text{V}^2$. ${SIMNOTE}`),
          answer: ans, units: 'K', tol: { rel: 0.005 },
          errors: [{ value: Tref * V2 / V1, feedback: 'Subtract the amplifier’s own noise from both readings first: only the resistor’s part is proportional to T.' }, { value: Tref * Math.sqrt((V2 - fl) / (V1 - fl)), feedback: 'The mean square, not the rms, is proportional to T.' }],
          hints: [t`The resistor’s part is $\langle V^2\rangle - 0.160$, proportional to $T$.`, t`$T = 295\ \text{K} \times (V_2^2 - 0.160)/(V_1^2 - 0.160)$.`],
          teach: 'Noise thermometry: subtract the amplifier floor, then the resistor’s mean square scales with T.',
          explain: t`$T = 295 \times (${V2.toFixed(3)} - 0.160)/(${V1.toFixed(3)} - 0.160) = ${ans.toFixed(1)}$ K.`,
        };
      },
    }),
    num({
      id: 'cp-dsn', difficulty: 3, transfer: true,
      gen(r) {
        const Ts = r.pick([15, 20, 25, 40]), B = r.pick([0.1, 1, 10]);
        const ans = kB * Ts * B * 1e6;
        return {
          prompt: t`A deep-space ground station’s cooled receiver has a system noise temperature of $${Ts}$ K: it delivers the noise power of a matched resistor at that temperature, $P = k_BT\Delta f$ (the 4 of Nyquist’s formula and a factor ¼ for matching cancel). What noise power does it deliver in a $${B}$ MHz bandwidth? Answer in W.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 50], y: [0, 0.75], xlabel: 'system temperature (K)', ylabel: 'noise power per MHz (fW)', axesAt: 'edge', curves: [{ fn: `${(kB * 1e6 * 1e15).toFixed(6)}*x`, color: 'accent' }] }, caption: t`Noise power per megahertz of bandwidth, $k_BT$, against the receiver’s noise temperature ($1\ \text{fW} = 10^{-15}$ W).` },
          answer: ans, units: 'W', tol: { rel: 0.005 },
          errors: [{ value: 4 * ans, feedback: t`Into a matched load the available power is $k_BT\Delta f$; $4k_BTR\Delta f$ is the open-circuit mean-square *voltage*.` }],
          hints: [t`$P = k_BT\Delta f$.`, t`$\Delta f = ${B}$ MHz $= ${tex(B * 1e6, 2)}$ Hz.`],
          teach: t`A receiver’s noise floor is $k_BT\Delta f$: cool it (small $T$) and narrow the band (small $\Delta f$) to hear weak signals.`,
          explain: t`$P = 1.381\times10^{-23} \times ${Ts} \times ${tex(B * 1e6, 2)} = ${tex(ans, 3)}$ W. A spacecraft’s whisper from beyond the planets has to be dug out from under this floor — by cooling the amplifier, narrowing the bandwidth and coding the data.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'J. B. Johnson, Thermal agitation of electricity in conductors, Phys. Rev. 32, 97 (1928)', url: 'https://doi.org/10.1103/PhysRev.32.97' },
    { label: 'H. Nyquist, Thermal agitation of electric charge in conductors, Phys. Rev. 32, 110 (1928)', url: 'https://doi.org/10.1103/PhysRev.32.110' },
    SRC.codata,
    SRC.taylor('ch. 3 (propagation)'),
  ],
});
