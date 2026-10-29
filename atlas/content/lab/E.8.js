// Coupled pendulums — the lab view: two pendulums joined by a spring at a
// height ℓ below the pivots; the in-phase and out-of-phase normal-mode
// periods timed at several ℓ; ω₂² against ℓ² a straight line whose intercept
// gives g/L and whose slope gives the spring constant; ω₁² flat (the spring
// never stretches in phase); beats and energy exchange; timing uncertainty
// carried into ω²; the large-amplitude period stretch as the systematic.
// Huygens's sympathetic clocks as the transfer. Every number is computed
// from the seeded model the labe-rig simulation draws with (_labe.js).
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, resT, tex, table, SIMNOTE, SRC } from './_labe.js';

const t = String.raw;
const P0 = M.EXPERIMENTS.coupled.defaults;
const TAU = 2 * Math.PI;
const F15 = M.amplitudeFactor((15 * Math.PI) / 180);

// ── the worked example: seven spring heights, seed 7 ──
const EX = M.run('coupled', { seed: 7 });
const EXg = EX.results[0], EXk = EX.results[1];
const W1 = M.analyse('coupled', EX.rows, { axes: 'w1' });
const q6 = EX.R[3];                                   // ℓ = 0.6 m
const w1x = TAU / q6.T1, w2x = TAU / q6.T2;

/** A mass–spring analogue (de-modes) of the pendulum pair at spring height ℓ. */
const analogue = (l, extra = {}, caption) => ({
  type: 'de-modes',
  params: { system: 'pair', m: 1, m2: 1, k: P0.g / P0.L, kc: +((P0.k * l * l) / (P0.m * P0.L * P0.L)).toFixed(4), controls: [], readout: false, ...extra },
  caption: caption ?? t`A mass–spring analogue of the pendulum pair at $\ell = ${l}$ m: the same two mode frequencies. Displacements are exaggerated.`,
});

export default lesson({
  id: 'lab.E.8',
  title: 'Coupled pendulums',
  minutes: 16, difficulty: 3,
  lab: true,
  intro: t`Join two identical pendulums with a light spring and they no longer swing independently. There are two **normal modes**: swinging in phase, the spring never stretches, and each pendulum keeps its own $\omega_1^2 = g/L$; swinging in opposition, the spring adds its stiffness, more the lower you clip it. Start one pendulum alone and the motion is a mix of both, so the energy beats back and forth between the two. In the lab you time each mode at several clip heights $\ell$: $\omega_2^2$ against $\ell^2$ is a straight line whose intercept is $g/L$ and whose slope measures the spring.`,
  equation: t`\omega_1^2 = \frac{g}{L}, \qquad \omega_2^2 = \frac{g}{L} + \frac{2k\ell^2}{mL^2}, \qquad T_\text{beat} = \frac{2\pi}{\omega_2 - \omega_1}`,
  symbols: [
    { tex: '\\omega_1,\\ \\omega_2', text: 'the angular frequencies of the in-phase and out-of-phase normal modes, in rad/s ($\\omega = 2\\pi/T$)' },
    { tex: 'g', text: 'the local gravitational acceleration, 9.80 m/s² at this bench' },
    { tex: 'L', text: 'each pendulum’s length from pivot to the bob’s centre, in m (1.000 m here)' },
    { tex: 'k', text: 'the coupling spring’s constant, in N/m' },
    { tex: '\\ell', text: 'how far below the pivots the spring is clipped to the rods, in m' },
    { tex: 'm', text: 'each bob’s mass, in kg (the rods taken as massless)' },
    { tex: 'T_\\text{beat}', text: 'the beat period: the time for the energy to go from one pendulum to the other and back' },
  ],
  why: t`Normal modes are how every coupled system — molecules, bridges, a spacecraft’s structure, LIGO’s suspensions — is understood: measure the modes, and you have measured the couplings.`,
  visual: {
    type: 'labe-rig',
    title: 'The bench: mode periods against spring height',
    lead: t`Pick a clip height and take a reading: both modes are timed (ten swings each), and above you see pendulum 1 pulled aside and released, the energy beating over to pendulum 2 and back. Below, $\omega_2^2$ against $\ell^2$ with the fit: the intercept gives $g$, the slope gives $k$.`,
    tasks: [
      'Lower the spring (raise ℓ): the beats quicken — the beat period falls from minutes at ℓ = 0.3 m to about 16 s at 0.8 m.',
      'Switch Plot to ω₁² against ℓ²: a flat line. In phase, the spring is never stretched.',
      'Switch on the 15° release: every period lengthens by about 0.43%, and g comes out about 0.9% low — while k barely moves.',
    ],
    params: { exp: 'coupled', seed: 1, residuals: true, expected: true },
    caption: t`Simulated periods: $L = 1.000$ m, $m = 1.00$ kg, $k = 2.00$ N/m (illustrative), each period from ten swings timed with $\sigma = 0.06$ s, so $\sigma_T = 0.006$ s. Small-angle modes unless the 15° switch is on; no damping. ${SIMNOTE}`,
  },
  example: {
    prompt: t`Periods of the out-of-phase mode at seven clip heights (each from ten swings, $\sigma_T = 0.006$ s), with $L = 1.000$ m and $m = 1.00$ kg:

${table([[t`\ell\ (\text{m})`, ...EX.R.map((q) => q.l.toFixed(1))], [t`T_2\ (\text{s})`, ...EX.R.map((q) => q.T2.toFixed(3))]])}

Find $g$ and the spring constant $k$, with uncertainties.`,
    visual: rigPlot('coupled', { seed: 7 }, t`$\omega_2^2$ against $\ell^2$ with the weighted fit and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Transform', text: t`$\omega_2^2 = (2\pi/T_2)^2$: at $\ell = 0.6$ m, $(2\pi/${q6.T2.toFixed(3)})^2 = ${(w2x ** 2).toFixed(3)}\ \text{s}^{-2}$. Its σ is $2\omega_2^2\,\sigma_T/T_2 = ${(2 * w2x ** 2 * q6.sT / q6.T2).toFixed(3)}\ \text{s}^{-2}$: squaring doubles the relative error.` },
      { label: 'Fit', text: t`The weighted line gives intercept $a = ${pmT(EX.fit.a, EX.fit.sa)}\ \text{s}^{-2}$ and slope $b = ${pmT(EX.fit.b, EX.fit.sb)}\ \text{s}^{-2}\text{m}^{-2}$, $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$.` },
      { label: 'g', text: t`$a = g/L$, so $g = aL = ${resT(EXg)}$ m/s², against 9.80: $z = ${EXg.z.toFixed(2)}$.` },
      { label: 'k', text: t`$b = 2k/(mL^2)$, so $k = bmL^2/2 = ${resT(EXk)}$ N/m. A static stretch test gave 2.00 N/m: $z = ${EXk.z.toFixed(2)}$.` },
      { label: 'Check the other mode', text: t`The in-phase periods give $\omega_1^2$ against $\ell^2$ with slope $${pmT(W1.fit.b, W1.fit.sb)}$ — zero, as it should be — and $g = ${resT(W1.results[0])}$ m/s² independently.` },
      { label: 'Beats', text: t`At $\ell = 0.6$ m, $\omega_1 = ${w1x.toFixed(4)}$ and $\omega_2 = ${w2x.toFixed(4)}$ rad/s, so $T_\text{beat} = 2\pi/(\omega_2 - \omega_1) = ${(TAU / (w2x - w1x)).toFixed(1)}$ s: released alone, pendulum 1 hands all its energy to pendulum 2 in half that.` },
    ],
    answer: t`$g = ${resT(EXg)}$ m/s² and $k = ${resT(EXk)}$ N/m.`,
  },
  practice: [
    num({
      id: 'w2', difficulty: 1,
      gen(r) {
        const l = r.pick([0.4, 0.5, 0.6, 0.7, 0.8]), k = r.pick([1.5, 2.0, 3.0]);
        const ans = P0.g / P0.L + (2 * k * l * l) / (P0.m * P0.L ** 2);
        return {
          prompt: t`Two 1.00 kg pendulums 1.000 m long are joined by a spring of $k = ${k}$ N/m clipped $${l}$ m below the pivots. What is $\omega_2^2$ for the out-of-phase mode, with $g = 9.80$ m/s²? Answer in s⁻².`,
          visual: analogue(l, { start: 'mode2', starts: false, energy: false }, t`The out-of-phase mode (mass–spring analogue): the two move in opposition, stretching and squeezing the coupling.`),
          answer: ans, units: 's^-2', tol: { rel: 0.003 },
          errors: [{ value: P0.g / P0.L + (k * l * l) / (P0.m * P0.L ** 2), feedback: t`In opposition, each bob moves the spring’s end, so the spring stretches by twice one bob’s share: the term is $2k\ell^2/(mL^2)$.` }, { value: P0.g / P0.L + (2 * k) / P0.m, feedback: t`The spring acts at $\ell$, not at the bob: its torque scales as $\ell^2$, so the term is $2k\ell^2/(mL^2)$.` }],
          hints: [t`$\omega_2^2 = g/L + 2k\ell^2/(mL^2)$.`],
          teach: 'The out-of-phase mode adds the spring’s stiffness to gravity’s, weighted by where the spring acts.',
          explain: t`$9.80 + 2(${k})(${l})^2/(1.00 \times 1.000^2) = ${ans.toFixed(3)}\ \text{s}^{-2}$, so $\omega_2 = ${Math.sqrt(ans).toFixed(4)}$ rad/s and $T_2 = ${(TAU / Math.sqrt(ans)).toFixed(3)}$ s.`,
        };
      },
    }),
    num({
      id: 'beat', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), l = r.pick([0.5, 0.6, 0.7, 0.8, 0.9]);
        const q = M.readRows('coupled', M.makeRows('coupled', { seed, settings: [l] }))[0];
        const ans = (q.T1 * q.T2) / (q.T1 - q.T2);
        return {
          prompt: t`At one clip height the modes have periods $T_1 = ${q.T1.toFixed(3)}$ s (in phase) and $T_2 = ${q.T2.toFixed(3)}$ s (out of phase). One pendulum is pulled aside and released. What is the beat period — the time for its swing to die away, return, and reach full size again? Answer in s.`,
          visual: analogue(l, { start: 'one', starts: false }, 'One mass released alone (mass–spring analogue): the energy sloshes between the two.'),
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: 'That is the time for the energy to move across once. The full beat — gone and back — is twice that.' }, { value: q.T1 - q.T2, feedback: t`Subtract frequencies, not periods: $T_\text{beat} = 2\pi/(\omega_2 - \omega_1) = T_1T_2/(T_1 - T_2)$.` }],
          hints: [t`$T_\text{beat} = 2\pi/(\omega_2 - \omega_1)$ with $\omega = 2\pi/T$.`, t`That simplifies to $T_1T_2/(T_1 - T_2)$.`],
          teach: 'Two close frequencies beat at their difference: T(beat) = 2π/(ω₂ − ω₁).',
          explain: t`$T_\text{beat} = ${q.T1.toFixed(3)} \times ${q.T2.toFixed(3)}/${(q.T1 - q.T2).toFixed(3)} = ${ans.toFixed(1)}$ s. The difference of the periods is small and poorly known (a 0.006 s σ on each), so timing the beat directly can be the better measurement of the coupling.`,
        };
      },
    }),
    num({
      id: 'g', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = M.run('coupled', { seed });
        const a = +A.fit.a.toFixed(3);
        const L = r.pick([0.800, 1.000, 1.200]);
        return {
          prompt: t`For pendulums of length $L = ${L.toFixed(3)}$ m, a fit of $\omega_2^2$ against $\ell^2$ has intercept $${(a * P0.L / L).toFixed(3)}\ \text{s}^{-2}$. What value of $g$ does it give? Answer in m/s².`,
          visual: rigPlot('coupled', { seed }, t`A run of this kind, fitted. ${SIMNOTE}`),
          answer: +(a * P0.L / L).toFixed(3) * L, units: 'm/s^2', tol: { rel: 0.002 },
          errors: [{ value: +(a * P0.L / L).toFixed(3) / L, feedback: t`The intercept is $g/L$: multiply by $L$.` }].filter((x) => Math.abs(x.value - +(a * P0.L / L).toFixed(3) * L) > 0.003 * 9.8),
          hints: [t`At $\ell = 0$ the spring has no lever arm: $\omega_2^2 = g/L$.`],
          teach: t`The intercept at $\ell = 0$ is the uncoupled pendulum: $g/L$.`,
          explain: t`$g = ${(a * P0.L / L).toFixed(3)} \times ${L.toFixed(3)} = ${(+(a * P0.L / L).toFixed(3) * L).toFixed(3)}$ m/s².`,
        };
      },
    }),
    num({
      id: 'k', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = M.run('coupled', { seed });
        const b = +A.fit.b.toFixed(3), m = r.pick([0.5, 1.0, 2.0]);
        const bb = b / m;
        const ans = (bb * m * P0.L ** 2) / 2;
        return {
          prompt: t`With bobs of $${m.toFixed(2)}$ kg on 1.000 m pendulums, the slope of $\omega_2^2$ against $\ell^2$ is $${bb.toFixed(3)}\ \text{s}^{-2}\text{m}^{-2}$. What is the spring constant? Answer in N/m.`,
          visual: rigPlot('coupled', { seed }, t`A run of this kind, fitted. ${SIMNOTE}`),
          answer: ans, units: 'N/m', tol: { rel: 0.003 },
          errors: [{ value: bb * m * P0.L ** 2, feedback: t`The slope is $2k/(mL^2)$: divide by 2.` }, { value: (bb * P0.L ** 2) / (2 * m), feedback: t`Multiply by $m$: $k = bmL^2/2$.` }].filter((x) => Math.abs(x.value - ans) > 0.004 * ans),
          hints: [t`Slope $= 2k/(mL^2)$.`, t`$k = \text{slope} \times mL^2/2$.`],
          teach: t`The slope of $\omega_2^2$ against $\ell^2$ is $2k/(mL^2)$.`,
          explain: t`$k = ${bb.toFixed(3)} \times ${m.toFixed(2)} \times 1.000^2/2 = ${ans.toFixed(3)}$ N/m.`,
        };
      },
    }),
    num({
      id: 'sigma-w2', difficulty: 2,
      gen(r) {
        const T = r.float(1.75, 1.97, 0.001), sT = r.pick([0.006, 0.01, 0.02]);
        const w2 = (TAU / T) ** 2, ans = 2 * w2 * (sT / T);
        return {
          prompt: t`A mode’s period is $T = ${T.toFixed(3)} \pm ${sT}$ s. What is the standard uncertainty of $\omega^2 = (2\pi/T)^2$? Answer in s⁻².`,
          visual: rigPlot('coupled', { seed: r.int(1, 999), residuals: false }, t`Points like this one, with their error bars in $\omega^2$. ${SIMNOTE}`),
          answer: ans, units: 's^-2', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: t`$\omega^2 \propto T^{-2}$: the power is $-2$, so the relative uncertainty doubles.` }, { value: w2 * (sT / T), feedback: 'Double the relative uncertainty for the square.' }],
          hints: [t`$\omega^2 \propto T^{-2}$, so $\sigma_{\omega^2}/\omega^2 = 2\sigma_T/T$.`],
          teach: 'A power multiplies a relative uncertainty by its size, whatever its sign.',
          explain: t`$\omega^2 = ${w2.toFixed(3)}\ \text{s}^{-2}$; $2 \times ${sT}/${T.toFixed(3)} = ${(2 * sT / T * 100).toFixed(2)}\%$, so $\sigma = ${ans.toFixed(3)}\ \text{s}^{-2}$. Timing ten swings instead of one cuts σ of T tenfold.`,
        };
      },
    }),
    mcq({
      id: 'amplitude', difficulty: 3,
      prompt: 'A student releases the pendulums at 15° to make the swings easy to see. How does that affect g and k from the ω₂²-against-ℓ² fit?',
      visual: rigPlot('coupled', { seed: 3, flags: { amp: true }, expected: true }, t`The fit with a 15° release (gold) against the small-angle expectation (dashed). ${SIMNOTE}`),
      choices: [
        'g comes out about 0.9% low; k is nearly unaffected, because the stretch slows gravity’s part, which is the intercept',
        'Both come out about 0.43% low, because every period is 0.43% long',
        'Neither changes: amplitude does not affect a pendulum’s period',
        'k comes out low and g is unaffected',
      ],
      answer: 0,
      why: {
        1: t`The periods lengthen by 0.43%, but $\omega^2$ goes as $1/T^2$ — 0.86% — and only gravity’s part of $\omega_2^2$ is stretched; the spring’s part is linear.`,
        2: 'It does, at second order: about θ₀²/16 of the period, 0.43% at 15°. Isochronism is a small-angle approximation.',
        3: 'The opposite: the stretch acts on the gravitational term, which the intercept carries.',
      },
      hints: ['How much longer is a pendulum’s period at 15° than at small angles?', 'Which term of ω₂² = g/L + 2kℓ²/(mL²) does the amplitude stretch?'],
      teach: 'A systematic that acts on one term of the model shows up in the parameter that carries that term.',
      explain: t`At 15° the period is ${((F15 - 1) * 100).toFixed(2)}% longer, so $g/L$ appears ${((1 - 1 / F15 ** 2) * 100).toFixed(2)}% smaller: $g$ low. In this model the spring’s term is untouched, so $k$ barely moves. Releasing at 3° makes the effect 25 times smaller.`,
    }),
    mcq({
      id: 'mode-start', difficulty: 2,
      prompt: 'You pull both pendulums aside by the same amount in the same direction and release them together. What happens?',
      visual: analogue(0.6, { start: 'mode1', starts: false }, 'Both released together (mass–spring analogue).'),
      choices: [
        'They swing together forever (ignoring damping) at ω₁ = √(g/L): a normal mode, with no beats',
        'They beat, exchanging energy every half beat period',
        'They swing together at ω₂, the higher frequency',
        'The spring makes them drift out of phase within a few swings',
      ],
      answer: 0,
      why: {
        1: 'Beats need both modes present. Starting exactly in one mode excites only that one.',
        2: 'In phase, the spring is never stretched, so it adds nothing: the frequency is the uncoupled one.',
        3: 'A normal mode keeps its shape: nothing in the equations pushes the pendulums apart.',
      },
      hints: ['Is the spring ever stretched in this motion?'],
      teach: 'A normal mode keeps its shape and its single frequency; any other start is a mix of modes, and mixes beat.',
      explain: 'Displaced equally, the pendulums stay equal, the spring keeps its length, and each swings at √(g/L). This is how ω₁ is timed in the lab — and the opposite start, equal and opposite, isolates ω₂.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-transfer-time', difficulty: 3,
      gen(r) {
        const l = r.pick([0.5, 0.6, 0.7, 0.8]), k = r.pick([1.5, 2.0, 2.5]);
        const w1 = Math.sqrt(P0.g / P0.L), w2 = Math.sqrt(P0.g / P0.L + (2 * k * l * l) / (P0.m * P0.L ** 2));
        const ans = Math.PI / (w2 - w1);
        return {
          prompt: t`Two 1.00 kg, 1.000 m pendulums are coupled by a $${k}$ N/m spring at $\ell = ${l}$ m. Pendulum 1 is released alone. How long until pendulum 1 is momentarily still and pendulum 2 has all the energy? Answer in s.`,
          visual: analogue(l, { start: 'one', starts: false, energy: true }, t`One released alone (mass–spring analogue with the same mode frequencies), with each oscillator’s share of the energy.`),
          answer: ans, units: 's', tol: { rel: 0.01 },
          errors: [{ value: 2 * ans, feedback: 'That is the full beat period, there and back. The energy reaches pendulum 2 halfway through it.' }],
          hints: [t`Find $\omega_1 = \sqrt{g/L}$ and $\omega_2 = \sqrt{g/L + 2k\ell^2/(mL^2)}$.`, t`The energy crosses in half a beat: $\pi/(\omega_2 - \omega_1)$.`],
          teach: 'Complete energy transfer between identical coupled oscillators takes half a beat period.',
          explain: t`$\omega_1 = ${w1.toFixed(4)}$, $\omega_2 = ${w2.toFixed(4)}$ rad/s, so $\pi/(\omega_2 - \omega_1) = ${ans.toFixed(1)}$ s.`,
        };
      },
    }),
    mcq({
      id: 'cp-flat', difficulty: 2,
      prompt: t`Your plot of $\omega_1^2$ (in-phase mode) against $\ell^2$ has slope $-0.02 \pm 0.06\ \text{s}^{-2}\text{m}^{-2}$. What does that tell you?`,
      visual: rigPlot('coupled', { seed: 2, axes: 'w1' }, t`The in-phase mode’s $\omega_1^2$ against $\ell^2$, fitted. ${SIMNOTE}`),
      choices: [
        'It is consistent with zero, as the model predicts: in phase, the spring keeps its length, so the coupling does not enter',
        'The spring is too weak to measure; use a stiffer one',
        'The timing is biased at low clip heights',
        'The spring constant is −0.02 N/m',
      ],
      answer: 0,
      why: {
        1: 'The out-of-phase mode shows the spring clearly; this mode is blind to it by symmetry.',
        2: 'A slope consistent with zero is no evidence of bias; it is the model’s prediction confirmed.',
        3: 'A negative spring constant is unphysical, and this slope is zero within its uncertainty anyway.',
      },
      hints: ['In the in-phase mode, does the spring ever stretch?'],
      teach: 'A null result predicted by the model is a test passed — and the in-phase mode gives g independently of the spring.',
      explain: t`$-0.02 \pm 0.06$ is $0.3\sigma$ from zero: consistent. The intercept of this line gives $g/L$ with no spring involved — a cross-check on the out-of-phase fit’s intercept.`,
    }),
    num({
      id: 'cp-huygens', difficulty: 3, transfer: true,
      gen(r) {
        const T1 = 2.0000, T2 = r.pick([1.9990, 1.9980, 1.9960]);
        const ans = ((T1 * T2) / (T1 - T2)) / 60;
        return {
          prompt: t`In 1665 Christiaan Huygens noticed that two pendulum clocks hanging from the same beam kept time together: the beam coupled them. Suppose two such clocks’ pendulums, weakly coupled, have mode periods $T_1 = ${T1.toFixed(4)}$ s and $T_2 = ${T2.toFixed(4)}$ s. If only one were set swinging, how long would a full beat take? Answer in minutes.`,
          visual: analogue(0.2, { start: 'one', starts: false }, 'Weak coupling: the energy creeps slowly from one oscillator to the other (analogue, coupling exaggerated).'),
          answer: ans, units: 'min', tol: { rel: 0.01 },
          errors: [{ value: ans / 2, feedback: 'Half a beat moves the energy across once; the question asks for the full beat.' }],
          hints: [t`$T_\text{beat} = T_1T_2/(T_1 - T_2)$.`],
          teach: 'Weak coupling means close mode frequencies — and slow beats.',
          explain: t`$T_\text{beat} = ${T1.toFixed(4)} \times ${T2.toFixed(4)}/${(T1 - T2).toFixed(4)} = ${(ans * 60).toFixed(0)}$ s $= ${ans.toFixed(1)}$ min. A real clock’s escapement keeps feeding energy and its friction removes it, which is what locks two coupled clocks into step — a story beyond the free-oscillator model.`,
        };
      },
    }),
  ],
  sources: [
    SRC.usu,
    SRC.taylor('ch. 8'),
  ],
});
