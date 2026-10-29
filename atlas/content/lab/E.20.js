// Fibre optics — the lab view: a plastic optical fibre at 650 nm. The cut-
// back method: output power in dBm against length is a straight line whose
// slope is the attenuation, while the unknown launch loss — the same for every
// cut — sits in the intercept. Cladding light from an overfilled launch as
// the systematic (residuals curling up at short lengths, α too high), and the
// numerical aperture from the far-field spot, compared with √(n₁² − n₂²).
// A spectrograph's fibre feed and a telescope's f-ratio as the transfer.
// Every number is computed from the seeded model the labg-classics
// simulation draws with.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, tex, colTable, SIMNOTE, SRC } from './_classic.js';

const t = String.raw;
const PC = M.EXPERIMENTS.cutback.defaults, PN = M.EXPERIMENTS.na.defaults;
const NA0 = M.naOf(PN.n1, PN.n2);

// the worked example: seed 4, with a mode stripper
const EX = M.run('cutback', { seed: 4, flags: { clad: false } });
const EXa = EX.results[0], EXp = EX.results[1];
const loss50 = -EX.fit.b * 50;
const runCut = (seed, flags = {}) => M.run('cutback', { seed, flags });

export default lesson({
  id: 'lab.E.20',
  title: 'Fibre optics',
  minutes: 16, difficulty: 2,
  lab: true,
  intro: t`An optical fibre traps light by total internal reflection: a core of index $n_1$ inside a cladding of lower index $n_2$. Light entering within a cone of half-angle $\theta_a$ is guided, where $\sin\theta_a = \text{NA} = \sqrt{n_1^2 - n_2^2}$, the numerical aperture. Along the fibre the power fades exponentially, so in decibels it falls in a straight line. **The cut-back method** measures the output, cuts a length off at the far end, measures again, and so on: the launch into the fibre — its losses unknown and unrepeatable — is never touched, so it lands in the intercept, and the slope is the attenuation alone.`,
  equation: t`P(L) = P_0 - \alpha L`,
  symbols: [
    { tex: 'P(L)', text: 'the power out of a length $L$ of fibre, in dBm: decibels relative to 1 mW, $10\\log_{10}(P/1\\ \\text{mW})$' },
    { tex: 'P_0', text: 'the power actually launched into the core, in dBm — unknown, since the coupling loss at the input is' },
    { tex: '\\alpha', text: 'the attenuation, in dB/m: the loss per metre of fibre' },
    { tex: 'L', text: 'the length of fibre remaining, in m' },
    { tex: '\\text{NA}', text: 'the numerical aperture, $\\sin\\theta_a$: the sine of the widest angle (in air) at which light is accepted and guided' },
    { tex: 'n_1,\\ n_2', text: 'the refractive indices of core and cladding (typical plastic fibre: PMMA, 1.492, in a fluorinated polymer, 1.402)' },
  ],
  why: t`Decibel budgets run every optical link, from data buses in launch vehicles to fibre-optic gyroscopes in spacecraft and the fibre feeds of astronomical spectrographs.`,
  visual: {
    type: 'labg-classics',
    title: 'The bench: cutting back a fibre',
    lead: t`Start with 50 m of fibre and take a reading, then shorten it and read again — a real cut-back only goes from long to short. The power meter’s readings, in dBm, fall on a line whose slope is $-\alpha$. As set up, there is no mode stripper: watch the residuals at the shortest lengths.`,
    tasks: [
      'With the cladding light present, the three shortest lengths sit above the line and the residuals curl up at the left; α comes out several σ high.',
      'Switch off “No cladding-mode stripper” (fit one): the curl disappears, χ²/ν falls to about 1, and α agrees with the specification.',
      'Notice that the intercept — the launched power — moves too: the cladding light was being counted as launched power.',
    ],
    params: { exp: 'cutback', seed: 2, expected: true },
    caption: t`Simulated readings: $\alpha = 0.180$ dB/m (an illustrative value for PMMA fibre at 650 nm), $-3.00$ dBm launched into the core, each re-cleave and re-seat scattering the reading by $\sigma = 0.08$ dB; 0.9 dB of cladding light at the launch, dying away over 3 m. Dashed green: the line with no cladding light. ${SIMNOTE}`,
  },
  example: {
    prompt: t`A cut-back with a mode stripper fitted. Each reading is good to $\sigma = 0.08$ dB (the scatter of re-cleaving and re-seating the end):

${colTable([[t`L\ (\text{m})`, ...EX.R.map((q) => String(q.L))], [t`P\ (\text{dBm})`, ...EX.R.map((q) => q.p.toFixed(2))]])}

Find $\alpha$ and the launched power, each with its uncertainty, and compare $\alpha$ with the specification, 0.180 dB/m.`,
    visual: rigPlot('cutback', { seed: 4, flags: { clad: false }, expected: true }, t`Power against length with ±1σ bars, the weighted fit (gold) and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Why decibels', text: t`Power decays as $P = P_\text{in}e^{-\kappa L}$. In decibels, $10\log_{10}P$, a product becomes a sum and the exponential becomes a straight line: $P_\text{dBm}(L) = P_0 - \alpha L$, with $\alpha = 10\kappa\log_{10}e = 4.34\kappa$.` },
      { label: 'Why cut back', text: t`The coupling loss at the input — how well the light is focused into a 1 mm core — is unknown and changes every time the end is re-seated. Cutting at the *far* end leaves the launch alone, so its loss is the same for every reading and goes into $P_0$, not into the slope.` },
      { label: 'Fit', text: t`Equal bars: slope $${pmT(EX.fit.b, EX.fit.sb)}$ dB/m, intercept $${pmT(EX.fit.a, EX.fit.sa)}$ dBm, $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ for $\nu = 8$. The residuals scatter with no pattern.` },
      { label: 'Read it', text: t`$\alpha = ${pmT(EXa.value, EXa.sigma)}$ dB/m: 50 m loses $${loss50.toFixed(2)}$ dB, leaving $10^{-${(loss50 / 10).toFixed(3)}} = ${(100 * 10 ** (-loss50 / 10)).toFixed(1)}\%$ of the light. The launched power is $${pmT(EXp.value, EXp.sigma)}$ dBm, or $${(10 ** (EXp.value / 10)).toFixed(3)}$ mW.` },
      { label: 'Compare', text: t`$z = (${EXa.value.toFixed(4)} - 0.180)/${EXa.sigma.toFixed(4)} = ${EXa.z.toFixed(2)}$: consistent with the specification. The precision, about 1%, comes from the long lever arm: 49 m between the shortest and longest lengths.` },
    ],
    answer: t`$\alpha = ${pmT(EXa.value, EXa.sigma)}$ dB/m ($${Math.abs(EXa.z).toFixed(1)}\sigma$ from 0.180 dB/m); launched power $${pmT(EXp.value, EXp.sigma)}$ dBm.`,
  },
  practice: [
    num({
      id: 'dB', difficulty: 1,
      gen(r) {
        const p1 = r.pick([-2, -3, -4]), loss = r.pick([3, 6, 9, 10, 13]);
        const ans = 100 * 10 ** (-loss / 10);
        return {
          prompt: t`A meter reads $${p1}$ dBm at the input of a link and $${p1 - loss}$ dBm at its output. What percentage of the power arrives?`,
          visual: rigRaw('cutback', { seed: 1, settings: [50] }, 'The cut-back set-up: source, a coil of fibre and the power meter (not to scale).'),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [
            { value: 100 * 10 ** (-loss / 20), feedback: t`Power decibels use $10\log_{10}$: the ratio is $10^{-\text{loss}/10}$, not $10^{-\text{loss}/20}$ (that is for amplitudes).` },
            { value: 100 - loss, feedback: 'Decibels are logarithmic: a loss in dB is not a percentage.' },
          ],
          hints: [t`The loss is $${loss}$ dB; the power ratio is $10^{-\text{loss}/10}$.`],
          teach: t`A loss of $X$ dB leaves a fraction $10^{-X/10}$ of the power: 3 dB is a half, 10 dB a tenth.`,
          explain: t`$10^{-${loss}/10} = ${(ans / 100).toFixed(4)}$, so $${ans.toPrecision(3)}\%$ arrives.`,
        };
      },
    }),
    num({
      id: 'alpha', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = runCut(seed, { clad: false });
        const b = +A.fit.b.toFixed(4), Lx = r.pick([20, 30, 40]);
        const ans = -b * Lx;
        return {
          prompt: t`A cut-back fit gives a slope of $${b.toFixed(4)}$ dB/m. How much power, in dB, does a $${Lx}$ m run of this fibre lose (connectors aside)?`,
          visual: rigPlot('cutback', { seed, flags: { clad: false } }, t`The cut-back data with the weighted fit. ${SIMNOTE}`),
          answer: ans, units: 'dB', tol: { rel: 0.005 },
          errors: [{ value: 100 * (1 - 10 ** (b * Lx / 10)), feedback: 'That is the percentage of power lost; the question asks for the loss in dB, which is simply α times the length.' }],
          hints: [t`$\alpha = -\text{slope}$; the loss in dB is $\alpha L$.`],
          teach: 'In decibels, losses along a fibre simply add: α times the length.',
          explain: t`$\alpha L = ${(-b).toFixed(4)} \times ${Lx} = ${ans.toFixed(2)}$ dB — a fraction $10^{-${(ans / 10).toFixed(3)}} = ${(10 ** (-ans / 10)).toFixed(3)}$ of the power survives.`,
        };
      },
    }),
    num({
      id: 'na', difficulty: 2,
      gen(r) {
        const n1 = r.pick([1.462, 1.475, 1.492]), dn = r.pick([0.010, 0.015, 0.020]);
        const n2 = +(n1 - dn).toFixed(3);
        const na = M.naOf(n1, n2), ans = Math.asin(na) * 180 / Math.PI;
        return {
          prompt: t`A step-index fibre has a core of index $${n1}$ and a cladding of index $${n2}$. What is the widest angle from the axis, in air, at which entering light is guided? Answer in degrees.`,
          visual: { type: 'optics-rays', params: { mode: 'fibre', nCore: n1, nClad: n2, angle: 5, controls: false, readout: false, hide: ['acceptance'] }, caption: 'A ray launched into the fibre at 5°, bouncing by total internal reflection (the fibre is drawn much shorter and wider than it is).' },
          answer: ans, units: 'deg', tol: { rel: 0.01 },
          errors: [
            { value: Math.asin(n2 / n1) * 180 / Math.PI, feedback: t`That is the critical angle at the core–cladding wall, measured from the wall’s normal. The acceptance angle in air is $\arcsin\sqrt{n_1^2 - n_2^2}$.` },
            { value: Math.asin(n1 - n2) * 180 / Math.PI, feedback: t`Square first: $\text{NA} = \sqrt{n_1^2 - n_2^2}$, not $n_1 - n_2$.` },
          ],
          hints: [t`$\text{NA} = \sqrt{n_1^2 - n_2^2} = \sin\theta_a$ (in air).`],
          teach: t`The acceptance half-angle in air is $\arcsin\sqrt{n_1^2 - n_2^2}$: Snell’s law at the end face plus total internal reflection at the wall.`,
          explain: t`$\text{NA} = \sqrt{${n1}^2 - ${n2}^2} = ${na.toFixed(4)}$, so $\theta_a = ${ans.toFixed(2)}^\circ$. A small index step makes a narrow cone — telecom glass fibres have NA near 0.1–0.2.`,
        };
      },
    }),
    num({
      id: 'na-fit', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 9999), A = M.run('na', { seed });
        const b = +A.fit.b.toFixed(3);
        const ans = Math.sin(Math.atan(b));
        return {
          prompt: t`The far-field spot of a fibre is measured on a card at several distances $z$, and a fit of spot radius against $z$ gives a slope of $${b.toFixed(3)}$. What is the fibre’s numerical aperture?`,
          visual: rigPlot('na', { seed }, t`Spot radius against card distance, the fit and residuals. ${SIMNOTE}`),
          answer: ans, tol: { rel: 0.003 },
          errors: [
            { value: b, feedback: t`The slope is $\tan\theta_a$, and the NA is $\sin\theta_a$: $\text{NA} = \sin(\arctan b)$.` },
            { value: Math.sin(Math.atan(b / 2)), feedback: 'The slope of radius (not diameter) against distance is already tan θ: no factor of 2.' },
          ],
          hints: [t`The spot’s edge follows the cone: radius $= r_\text{core} + z\tan\theta_a$.`, t`$\text{NA} = \sin\theta_a = \sin(\arctan b) = b/\sqrt{1 + b^2}$.`],
          teach: t`The spot radius grows as $z\tan\theta_a$; the NA is $\sin\theta_a$.`,
          explain: t`$\theta_a = \arctan ${b.toFixed(3)} = ${(Math.atan(b) * 180 / Math.PI).toFixed(2)}^\circ$, so $\text{NA} = ${ans.toFixed(4)}$ (from the indices: $${NA0.toFixed(4)}$). The intercept is the core’s radius — where the cone starts.`,
        };
      },
    }),
    mcq({
      id: 'cladding', difficulty: 3,
      prompt: t`Without a mode stripper, the shortest lengths read above the fitted line, the residuals curl upward at the left, and $\chi^2/\nu$ is about 6. What is going on, and which way is $\alpha$ biased?`,
      visual: rigPlot('cutback', { seed: 7, expected: true }, t`A cut-back with no mode stripper: data, fit (gold), the line without cladding light (dashed) and residuals. ${SIMNOTE}`),
      choices: [
        'Light launched into the cladding still reaches the meter through short fibres but leaks away over a few metres; the extra power at the left steepens the line, so α comes out too high',
        'The meter saturates at high power, so short lengths read low and α comes out too low',
        'The fibre is more lossy near its input end, so α should be fitted only to short lengths',
        'Re-cleaving is less repeatable for short pieces, so those points simply need bigger error bars',
      ],
      answer: 0,
      why: {
        1: 'Saturation would push the short-length points *below* the line, not above it.',
        2: 'The fibre is uniform. The excess is light outside the core, which a uniform fibre sheds in its first few metres.',
        3: 'Bigger bars would hide a pattern that is real: the excess is systematic, the same in every run, and it decays smoothly with length.',
      },
      hints: ['Which points sit above the line: short or long lengths?', 'What light could reach the end of a short fibre but not a long one?'],
      teach: 'A pattern in the residuals that is the same in every run means the model is missing something physical — here, cladding light.',
      explain: t`An overfilled launch puts some power into the cladding; it travels a few metres before leaking out. At 1–5 m the meter sees it; at 50 m it is gone. Lifting the left end of the line makes it steeper: $\alpha$ is biased high, and $P_0$ too. A mode stripper (index-matching gel on a stretch of bare cladding) removes the cladding light; dropping the shortest lengths from the fit is the second-best cure.`,
    }),
    mcq({
      id: 'eye', difficulty: 2,
      prompt: t`A student marks the spot’s edge on the card where it *looks* dim, by eye. The fitted NA comes out 0.48 against 0.51 from the fibre’s indices. Which explanation fits?`,
      visual: rigRaw('na', { seed: 3, settings: [30], flags: { eye: true } }, 'Side view, to scale: the guided cone (dashed), its true edge (gold) and where the spot looks dim (orange).'),
      choices: [
        'The intensity falls off gradually toward the rim; the eye marks a point inside the true cone, so every radius reads short and the NA low',
        'The card was not perpendicular to the fibre, so the spot is an ellipse',
        'The fibre’s indices are wrong: the measured NA is the true one',
        'The fit intercept, the core radius, absorbs the error, so the NA is unaffected',
      ],
      answer: 0,
      why: {
        1: 'A tilted card makes the spot longer in one direction; it does not shrink every radius by the same fraction.',
        2: 'The indices are known well; a 6% gap with a clear mechanism points at the method, not the material.',
        3: 'Marking the edge at a smaller angle scales every radius with distance: it changes the slope, not the intercept.',
      },
      hints: ['Is the edge of the spot sharp?', 'If you consistently mark a smaller angle, does that change the slope or the intercept?'],
      teach: 'A threshold judged by eye is a systematic: define the edge (the standard uses 5% of the peak intensity) and measure it with a detector.',
      explain: t`The far field of a multimode fibre fades smoothly toward the rim. Marking where it looks dim is marking a smaller angle at every distance — a slope, hence NA, that is consistently low. The standard method scans a detector across the spot and takes the radius where the intensity falls to 5% of the centre.`,
    }),
    mcq({
      id: 'why-cutback', difficulty: 2,
      prompt: t`Why measure the output of one fibre at several lengths, cutting at the far end, rather than comparing the power going into a single fibre with the power coming out?`,
      visual: rigRaw('cutback', { seed: 1, settings: [12] }, 'The cut-back set-up: the launch at the left is never touched (not to scale).'),
      choices: [
        'The coupling loss at the input is unknown and changes whenever the input is re-seated; cutting at the far end keeps it fixed, so it lands in the intercept and the slope is the fibre’s loss alone',
        'A single fibre cannot be measured at both ends with one meter',
        'Cutting makes the fibre’s loss smaller, which is easier to measure',
        'Several lengths average away the coupling loss, which is random',
      ],
      answer: 0,
      why: {
        1: 'One meter can be moved from end to end. The problem is not the meter but what happens to the light at the input face.',
        2: 'The loss per metre does not change when the fibre is shortened; only the total does.',
        3: 'With the launch untouched, the coupling loss is not random from reading to reading: it is one constant offset, which is why it goes into the intercept.',
      },
      hints: ['What is unknown about light entering a fibre?', 'Which coefficient of the line does a constant offset change?'],
      teach: 'Arrange the measurement so the unknown you cannot control is a constant: then the fit puts it in the intercept.',
      explain: t`“Power in” is not the power in the core: some light misses it or enters at too steep an angle, by an amount that changes every time the end is handled. Leave the launch alone and cut at the far end, and that loss is one constant in $P_0$ — the same trick as fitting $1/r$ against $I$ in the [$e/m$ experiment](#/lesson/lab.E.1).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 9999), A = M.run('na', { seed });
        const v = +A.results[0].value.toFixed(4), s = +A.results[0].sigma.toFixed(4);
        const ans = (v - NA0) / s;
        return {
          prompt: t`A far-field measurement gives $\text{NA} = ${v.toFixed(4)} \pm ${s.toFixed(4)}$. The core and cladding indices, 1.492 and 1.402, predict $\sqrt{n_1^2 - n_2^2}$. Find $z$, with its sign, taking the indices as exact.`,
          visual: rigPlot('na', { seed }, t`The measurement: spot radius against distance, fit and residuals. ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.08 },
          errors: [{ value: (v - 0.5) / s, feedback: t`Work out the prediction: $\sqrt{1.492^2 - 1.402^2} = ${NA0.toFixed(4)}$, not 0.5.` }].filter((e) => Math.abs(e.value - ans) > 0.2),
          hints: [t`Prediction: $\sqrt{1.492^2 - 1.402^2}$.`, t`$z = (\text{NA} - \text{NA}_\text{pred})/\sigma$.`],
          teach: 'Compare a measurement with a prediction in units of the uncertainty.',
          explain: t`$\text{NA}_\text{pred} = ${NA0.toFixed(4)}$, so $z = (${v.toFixed(4)} - ${NA0.toFixed(4)})/${s.toFixed(4)} = ${ans.toFixed(2)}$. Real index values carry their own uncertainty (the third decimal varies between makers), which would widen σ.`,
        };
      },
    }),
    num({
      id: 'cp-budget', difficulty: 3,
      gen(r) {
        const P = r.pick([0, -3]), L = r.pick([15, 25, 40]), con = r.pick([1, 2, 3]), cl = r.pick([0.5, 1.0]);
        const a = 0.18;
        const ans = P - a * L - con * cl;
        return {
          prompt: t`A link launches $${P}$ dBm into $${L}$ m of this fibre ($\alpha = 0.18$ dB/m) with ${con} connector${con > 1 ? 's' : ''} along the way, each losing $${cl}$ dB. What power reaches the detector? Give it as a number of dBm.`,
          visual: rigPlot('cutback', { seed: 3, flags: { clad: false }, residuals: false }, t`A cut-back of this fibre: the slope is $-\alpha$. ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.02 },
          errors: [{ value: P - a * L, feedback: 'Include the connectors: every loss in dB subtracts.' }, { value: P - a * L * 10 - con * cl, feedback: 'α is per metre, not per tenth of a metre: multiply by the length in metres.' }],
          hints: ['In dB, every loss subtracts.', t`$P_\text{out} = P_\text{in} - \alpha L - (\text{connectors})$.`],
          teach: 'A decibel power budget is bookkeeping: subtract each loss from the launched power.',
          explain: t`$${P} - 0.18 \times ${L} - ${con} \times ${cl} = ${ans.toFixed(2)}$ dBm, or $${tex(10 ** (ans / 10), 3)}$ mW.`,
        };
      },
    }),
    num({
      id: 'cp-fratio', difficulty: 3, transfer: true,
      gen(r) {
        const na = r.pick([0.12, 0.15, 0.22, 0.26]);
        const ans = 1 / (2 * Math.tan(Math.asin(na)));
        return {
          prompt: t`An astronomical spectrograph is fed by fibres of $\text{NA} = ${na}$ placed at a telescope’s focus. A telescope of focal ratio $N$ (focal length over aperture) delivers a cone of half-angle $\arctan\bigl(1/(2N)\bigr)$. What is the smallest $N$ — the “fastest” beam — the fibres can accept without losing light?`,
          visual: { type: 'optics-rays', params: { mode: 'fibre', nCore: 1.457, nClad: +Math.sqrt(1.457 ** 2 - na * na).toFixed(4), angle: 6, controls: false, readout: false, hide: ['acceptance'] }, caption: 'Light entering a fibre of this NA at 6° (drawn short and wide). Steeper rays escape into the cladding.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [
            { value: 1 / (2 * na), feedback: t`The cone’s half-angle satisfies $\tan\theta = 1/(2N)$ while $\sin\theta = \text{NA}$: convert through the angle, $N = 1/(2\tan(\arcsin\text{NA}))$.` },
            { value: 1 / Math.tan(Math.asin(na)), feedback: t`The half-angle uses half the aperture: $\tan\theta = (D/2)/f = 1/(2N)$.` },
          ].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`The fibre accepts half-angles up to $\arcsin(\text{NA})$.`, t`Set $\arctan(1/2N) = \arcsin(\text{NA})$ and solve: $N = 1/\bigl(2\tan(\arcsin\text{NA})\bigr)$.`],
          teach: 'A fibre’s NA sets the fastest beam it can swallow: matching the telescope’s focal ratio to the fibre is part of instrument design.',
          explain: t`$\theta_a = \arcsin ${na} = ${(Math.asin(na) * 180 / Math.PI).toFixed(2)}^\circ$; $N = 1/(2\tan\theta_a) = ${ans.toFixed(2)}$. A slower beam ($N$ larger) fits easily; in practice fibres also degrade a beam’s focal ratio, so designers feed them at about f/3–f/5.`,
        };
      },
    }),
  ],
  sources: [
    SRC.os3('1.4', '1-4-total-internal-reflection'),
    SRC.taylor('ch. 8 (least-squares fitting)'),
    { label: 'N. Sultanova, S. Kasarova & I. Nikolov, Dispersion properties of optical polymers, Acta Physica Polonica A 116, 585 (2009) — PMMA’s index', url: 'https://refractiveindex.info/?shelf=organic&book=poly%28methyl_methacrylate%29&page=Sultanova' },
    SRC.usu,
  ],
});
