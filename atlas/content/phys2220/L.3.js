// Lab 3 of PHYS 2225 (virtual): the RC time constant from a capacitor’s
// discharge. ln V against t is a straight line of slope −1/τ, with error bars
// σ_V/V that grow tenfold as the voltage falls, so the fit must be weighted;
// a 10 MΩ voltmeter in parallel with R shortens τ while the line stays
// perfectly straight (a silent systematic, found only by comparing with RC);
// a zero offset bends the tail of the log plot and shows in the residuals.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from '../phys2210/_lab.js';
import { run, apart } from './_lab2225.js';

const t = String.raw;
const P0 = B.EXPERIMENTS.rc.defaults;
const RC = P0.R * P0.C;

// the worked example: an ordinary 10 MΩ multimeter across the capacitor (seed 25)
const EX = (() => {
  const rows = B.makeData('rc', { seed: 25, sys: 'meter' }).rows;
  const an = B.analyse('rc', rows, { sys: 'meter' });
  const f = an.series[0].fit, q = an.results[0];
  return { rows, f, q, tauL: B.rcTau(P0, true), last: rows[rows.length - 1] };
})();

/** The decay V₀e^(−t/τ) as a graph curve, with optional extras. */
function decay({ V0 = 10, tau = 10, tmax = 40, hl = [], pts = [], ylabel = 'V (V)', caption, ...extra }) {
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [0, tmax], y: [0, +(1.1 * V0).toPrecision(3)], xlabel: 't (s)', ylabel,
      curves: [{ fn: `${V0}*e^(-x/${+tau.toPrecision(6)})`, color: 'accent', width: 2.4 }],
      hlines: hl, points: pts, ...extra,
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.L.3',
  title: 'RC time constants',
  minutes: 15, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A capacitor $C$, charged to $V_0 = 10.00$ V, is switched across a resistor $R$ and discharges through it while a data logger records its voltage. The bench computes each reading with realistic noise.

The current $V/R$ drains the charge $Q = CV$, so the voltage falls by the same *fraction* in every equal interval of time — an exponential decay. Taking the natural log turns it into a straight line:

$$V = V_0\,e^{-t/\tau}, \qquad \ln V = \ln V_0 - \frac{t}{\tau}, \qquad \tau = RC$$

So plot $\ln V$ against $t$: the slope is $-1/\tau$. (Lab skills trained: linearizing an exponential and carrying the error bars through the logarithm; spotting an instrument that changes what it measures; and an offset that only shows at the end of the decay.)`,
  symbols: [
    { tex: 'V', text: 'the capacitor’s voltage at time $t$, in volts' },
    { tex: 'V_0', text: 'its voltage when the discharge starts: 10.00 V' },
    { tex: 't', text: 'the time since the switch moved, in s' },
    { tex: '\\tau', text: 'the time constant, in s: the time for $V$ to fall to $1/e$ (37%) of its value' },
    { tex: 'R,\\ C', text: 'the resistance (1.00 MΩ) and the capacitance (10.0 µF); their product is in seconds, since Ω·F = (V/A)(C/V) = C/A = s' },
    { tex: '\\ln', text: 'the natural logarithm. Its error bar is relative: $\\sigma_{\\ln V} = \\sigma_V/V$' },
  ],
  why: 'Every bleeder resistor on a high-voltage supply, every timing circuit and every sensor’s response time is an RC decay — and fitting ln V against t is how its time constant is measured.',
  visual: {
    type: 'lab-bench',
    title: 'Discharge the capacitor, log its voltage',
    lead: t`Eight readings, 4 s apart, are in the table. The plot shows $\ln V$ against $t$ with the weighted least-squares line and its residuals; the readout turns the slope into $\tau$ and compares it with $RC$.`,
    tasks: [
      'Switch the plot to V against t: an exponential curve. Back on ln V against t, it is a straight line of slope −1/τ, and τ comes out at 10.0 s, matching RC.',
      'Compare the error bars on ln V: tiny at the start, about sixteen times bigger at the end — the same ±0.010 V is a much bigger fraction of 0.6 V than of 10 V.',
      'Turn on the systematic (an ordinary 10 MΩ multimeter in place of the logger): the line stays perfectly straight, but τ drops to 9.1 s, dozens of σ from RC.',
    ],
    params: { exp: 'rc', seed: 14, residuals: true },
  },
  example: {
    prompt: t`A student logs the discharge with an ordinary multimeter instead of the logger. The readings are in the table, each uncertain by 0.010 V. A weighted fit of $\ln V$ against $t$ gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\text{s}^{-1}`)}$ with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. Find $\tau$ with its uncertainty and compare it with $RC = (1.00\ \text{M}\Omega)(10.0\ \mu\text{F})$. The meter’s input resistance is 10 MΩ.`,
    visual: plot('rc', EX.rows, { sys: true, table: true, residuals: true, expected: true, caption: 'ln V against t with ±1σ error bars, the weighted least-squares line (gold), the line τ = RC predicts (dashed), and residuals.' }),
    steps: [
      { label: 'Linearize', text: t`Take $\ln V$ of each reading. Its error bar is $\sigma_V/V$: $0.010/10.0 = 0.001$ at the start, $0.010/${EX.last.R[0].toFixed(3)} = ${(0.01 / EX.last.R[0]).toFixed(3)}$ at 28 s. The fit must weight the points by $1/\sigma^2$, or the noisy tail would steer it.` },
      { label: 'Check the fit', text: t`$\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$ and the residuals show no pattern: the decay is a clean exponential.` },
      { label: 'Time constant', text: t`$\tau = -1/\text{slope} = 1/${(-EX.f.b).toFixed(5)} = ${EX.q.value.toFixed(3)}$ s. A reciprocal keeps the relative uncertainty: $\sigma_\tau = \sigma_b/b^2 = ${EX.q.sigma.toFixed(3)}$ s. So $\tau = ${pmTeX(EX.q.value, EX.q.sigma, t`\text{s}`)}$.` },
      { label: 'Compare', text: t`$RC = (1.00\times10^{6}\ \Omega)(10.0\times10^{-6}\ \text{F}) = 10.0$ s. Even allowing the components’ 1% tolerances (±0.14 s), $\tau$ is far too short — and the straight line gives no hint of why.` },
      { label: 'Find the cause', text: t`The meter is part of the circuit: its 10 MΩ input sits in parallel with $R$, a second path for the charge. The capacitor really discharges through $R\,R_V/(R + R_V) = 0.909$ MΩ, so $\tau = (0.909\ \text{M}\Omega)(10.0\ \mu\text{F}) = ${EX.tauL.toFixed(3)}$ s — exactly what was measured.` },
      { label: 'Sense check', text: t`The voltage halves every $\tau\ln 2 \approx 6.3$ s: from 10.0 V at 0 s to 6.4 V at 4 s and about 4.1 V at 8 s, as in the table. A logger with a 10 GΩ input would change $\tau$ by only 0.01%.` },
    ],
    answer: t`$\tau = ${pmTeX(EX.q.value, EX.q.sigma, t`\text{s}`)}$, not $RC = 10.0$ s: the multimeter’s 10 MΩ input in parallel with $R$ gives $(R \parallel R_V)C = ${EX.tauL.toFixed(2)}$ s, which matches.`,
  },
  practice: [
    num({
      id: 'tau-from-slope', difficulty: 1,
      gen(r) {
        const { rows, f } = run(r, 'rc');
        const b = +f.b.toFixed(5);
        return {
          prompt: t`The weighted fit of $\ln V$ against $t$ has slope $${b.toFixed(5)}\ \text{s}^{-1}$. What is the time constant?`,
          answer: -1 / b, units: 's', tol: { rel: 0.002 },
          errors: [{ value: -b, feedback: t`That is the slope itself. The slope is $-1/\tau$, so $\tau = -1/\text{slope}$.` }],
          hints: [t`Match $\ln V = \ln V_0 - t/\tau$ with a line of slope $b$: $b = -1/\tau$.`],
          teach: 'On a plot of ln V against t, the slope is −1/τ.',
          explain: t`$\tau = -1/(${b.toFixed(5)}\ \text{s}^{-1}) = ${(-1 / b).toFixed(3)}$ s.`,
          visual: plot('rc', rows, { caption: 'ln V against t with the weighted least-squares line.' }),
        };
      },
    }),
    num({
      id: 'sigma-lnV', difficulty: 2,
      gen(r) {
        const { rows } = run(r, 'rc');
        const row = r.pick(rows.slice(4)), V = row.R[0];
        return {
          prompt: t`At $t = ${row.s}$ s the logger reads ${V.toFixed(3)} V, uncertain by $\pm0.010$ V. What is the uncertainty of $\ln V$ at that point?`,
          answer: 0.01 / V, tol: { rel: 0.01 },
          errors: [{ value: 0.01, feedback: t`That is $\sigma_V$ itself. Through a logarithm, an uncertainty becomes *relative*: $\sigma_{\ln V} = \sigma_V/V$.` }],
          hints: [t`$\dfrac{d(\ln V)}{dV} = \dfrac{1}{V}$, so a small change $\sigma_V$ in $V$ moves $\ln V$ by $\sigma_V/V$.`],
          teach: 'The error bar on ln V is the relative error of V, so it grows as V gets small.',
          explain: t`$\sigma_{\ln V} = 0.010/${V.toFixed(3)} = ${(0.01 / V).toFixed(4)}$ — ${(0.01 / V / 0.001).toFixed(0)} times the 0.001 at the start, when $V = 10$ V. That is why the late points carry little weight in the fit.`,
          visual: plot('rc', rows, { caption: 'ln V against t: notice how the error bars grow as V falls.' }),
        };
      },
    }),
    num({
      id: 'time-to-fraction', difficulty: 2,
      gen(r) {
        const tau = +(r.pick([9.8, 10.0, 10.2])).toFixed(1), [p, name] = r.pick([[0.5, 'half'], [0.1, '10%'], [0.01, '1%'], [0.25, 'a quarter']]);
        const T = tau * Math.log(1 / p);
        return {
          prompt: t`A discharge has $\tau = ${tau.toFixed(1)}$ s. How long after the switch moves does the voltage fall to ${name} of its starting value?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: apart([
            { value: tau * p, feedback: t`Solve $V/V_0 = e^{-t/\tau}$ for $t$: take logarithms, $t = \tau\ln(V_0/V)$.` },
            { value: tau * Math.log10(1 / p), feedback: t`The exponential is base $e$: use the natural logarithm, $\ln$, not $\log_{10}$.` },
          ], T),
          hints: [t`$V/V_0 = e^{-t/\tau}$, so $t = \tau\ln(V_0/V)$.`],
          teach: 'An exponential decay takes the same time, τ ln(V₀/V), to fall by a given factor, whatever the starting voltage.',
          explain: t`$t = \tau\ln(V_0/V) = ${tau.toFixed(1)}\ \text{s}\times\ln(${+(1 / p).toFixed(2)}) = ${T.toFixed(1)}$ s.${p === 0.5 ? ' This is the half-life, τ ln 2 ≈ 0.69τ.' : ''}`,
          visual: decay({ tau, tmax: Math.max(40, Math.ceil(T / 10) * 10 + 10), hl: [{ y: 10 * p, label: `${name} of V₀`, color: 'violet' }], caption: 'The discharge, with the level asked about. Read the time off the curve, or compute it.' }),
        };
      },
    }),
    num({
      id: 'C-from-tau', difficulty: 2,
      gen(r) {
        const C = r.pick([4.7e-6, 6.8e-6, 15e-6, 22e-6]);
        const scale = C / 10e-6, settings = [0, 4, 8, 12, 16, 20, 24, 28].map((x) => +(x * scale).toFixed(1));
        const rows = B.makeData('rc', { seed: r.int(1, 999999), params: { C }, settings }).rows;
        const an = B.analyse('rc', rows, { params: { C } });
        const tau = +an.results[0].value.toPrecision(4);
        return {
          prompt: t`An unmarked capacitor discharges through the 1.00 MΩ resistor, read by the logger. The fit gives $\tau = ${tau.toPrecision(4)}$ s. What is its capacitance, in µF?`,
          answer: tau, units: 'uF', tol: { rel: 0.003 },
          hints: [t`$C = \tau/R$, with $R$ in ohms: the answer comes out in farads.`],
          teach: 'With a known resistor, measuring τ measures C: C = τ/R.',
          explain: t`$C = \tau/R = ${tau.toPrecision(4)}\ \text{s}/(1.00\times10^{6}\ \Omega) = ${tau.toPrecision(4)}\ \mu\text{F}$ — a standard ${(C * 1e6).toFixed(1)} µF part. Electrolytic capacitors are often marked only to ±20%, so a timing measurement is a better way to know $C$.`,
          visual: plot('rc', rows, { params: { C }, caption: 'ln V against t for the unmarked capacitor, with the weighted least-squares line.' }),
        };
      },
    }),
    mcq({
      id: 'unweighted', difficulty: 3,
      ...(() => {
        const rows = B.makeData('rc', { seed: 61 }).rows;
        return {
          prompt: t`A classmate fits $\ln V$ against $t$ with \`np.polyfit(t, np.log(V), 1)\` and no weights. Why is that a poor choice for these data?`,
          choices: [
            t`The late readings have much larger error bars in $\ln V$ ($\sigma_V/V$ grows as $V$ falls), but equal weights let them pull the slope as hard as the precise early points`,
            'Logarithms may only be taken of exact numbers, not of measurements with errors',
            'Weights change only the intercept of a straight-line fit, never the slope',
            t`Without weights the fit is forced through the origin`,
          ],
          answer: 0,
          why: {
            1: t`You may take the log of a measurement; you just carry its uncertainty along: $\sigma_{\ln V} = \sigma_V/V$.`,
            2: 'Weights change which points the line follows, and so both its slope and its intercept.',
            3: t`\`np.polyfit\` keeps an intercept with or without weights; weights decide how much each point counts.`,
          },
          hints: ['Look at the error bars in the picture: are they all the same size?', 'A least-squares fit should trust each point in proportion to 1/σ².'],
          teach: 'A log transform turns equal error bars into unequal ones (σ/V), so the fit of ln V must be weighted by V²/σ².',
          explain: t`The uncertainty of $\ln V$ runs from 0.001 at 10 V to about 0.016 at 0.6 V. A weighted fit (\`w = V/0.010\` in \`np.polyfit\`, which takes $1/\sigma$) trusts the first point about 270 times more than the last; an unweighted fit lets the noisy tail tilt the line, inflating the scatter of $\tau$.`,
          visual: plot('rc', rows, { caption: 'ln V against t with ±1σ error bars. They are not all the same size.' }),
        };
      })(),
    }),
    mcq({
      id: 'offset', difficulty: 3,
      gen(r) {
        const { rows, f, q } = run(r, 'rc', { sys: 'offset' });
        return {
          prompt: t`Another run gives $\tau = ${pmTeX(q.value, q.sigma, t`\text{s}`)}$ against $RC = 10.0$ s, with $\chi^2/\text{dof} = ${f.chi2r.toFixed(1)}$; the residuals drift upward at late times. Long after the discharge is over, the logger still reads 0.050 V. What is going on, and what is the fix?`,
          choices: [
            'A zero offset: every reading is 0.050 V high, which matters only when V is small and bends the tail of ln V upward. Subtract 0.050 V from every reading before taking logs',
            'The capacitor leaks: a leak is a second path, so it bends the tail of ln V upward. Use a better capacitor',
            'The resistor heats up and its resistance rises. Use a larger resistor',
            'Random scatter: take more readings and the residuals will flatten',
          ],
          answer: 0,
          why: {
            1: t`A leak is a second path for the charge: it makes the decay *faster*, and it keeps it exponential — a straight, steeper line, not a bent one.`,
            2: t`The resistor dissipates at most $V^2/R = 100\ \mu\text{W}$: it does not warm measurably.`,
            3: t`$\chi^2/\text{dof}$ of several, with the same smooth pattern every run, is a wrong model, not scatter.`,
          },
          hints: ['A constant added to V: does it matter more when V is 10 V or 0.5 V?', t`What should the logger read at $t \to \infty$, and what does it read?`],
          teach: 'A constant offset is invisible at large V and bends a log plot at small V: measure it at the end of the decay and subtract it.',
          explain: t`$\ln(V + 0.050)$ differs from $\ln V$ by about $0.050/V$: 0.005 at 10 V, but 0.08 at 0.6 V. The tail lifts, the fit flattens and $\tau$ comes out long. The reading after many time constants is the offset itself: subtract it and the line straightens.`,
          visual: plot('rc', rows, { sys: true, sysKind: 'offset', residuals: true, caption: 'ln V against t for the run with the offset, the weighted fit and its residuals.' }),
        };
      },
    }),
    num({
      id: 'loading', difficulty: 3,
      gen(r) {
        const R = r.pick([1.0e6, 2.2e6, 4.7e6]), RV = r.pick([1.0e6, 10e6]), C = 10e-6;
        const tau = ((R * RV) / (R + RV)) * C;
        return {
          prompt: t`A ${(C * 1e6).toFixed(1)} µF capacitor discharges through a ${(R / 1e6).toFixed(1)} MΩ resistor while a voltmeter with a ${(RV / 1e6).toFixed(0)} MΩ input resistance is connected across it. What time constant will you measure?`,
          answer: tau, units: 's', tol: { rel: 0.005 },
          errors: apart([
            { value: R * C, feedback: t`That ignores the meter. It is connected across the capacitor, so it is a second path for the charge, in parallel with $R$.` },
            { value: (R + RV) * C, feedback: t`The meter is in parallel with $R$, not in series: the charge can flow through either, so the combined resistance is *less* than $R$.` },
            ...(RV !== R ? [{ value: RV * C, feedback: 'The resistor is still there: the meter and the resistor share the discharge.' }] : []),
          ], tau),
          hints: [t`Two paths in parallel: $R_{\text{eff}} = \dfrac{R\,R_V}{R + R_V}$.`, t`Then $\tau = R_{\text{eff}}\,C$.`],
          teach: t`A voltmeter across a capacitor is a resistor in parallel with the circuit’s own: $\tau = (R \parallel R_V)C$.`,
          explain: t`$R_{\text{eff}} = \dfrac{(${R / 1e6})(${RV / 1e6})}{${R / 1e6} + ${RV / 1e6}}\ \text{M}\Omega = ${((R * RV) / (R + RV) / 1e6).toFixed(3)}$ MΩ, so $\tau = ${tau.toFixed(2)}$ s instead of $RC = ${(R * C).toFixed(1)}$ s — ${(100 * (1 - tau / (R * C))).toFixed(0)}% short. The higher $R$ is, the more a meter matters.`,
          visual: apparatus('rc', { sys: true, at: 12 }, 'The voltmeter across the capacitor is itself a resistor: a second path for the charge (amber). Not to scale.'),
        };
      },
    }),
    code({
      id: 'weighted-tau', difficulty: 2,
      gen(r) {
        const rows = B.makeData('rc', { seed: r.int(1, 999999) }).rows;
        const ts = rows.map((q) => q.s), Vs = rows.map((q) => q.R[0]);
        const f = B.fitLine(ts, Vs.map(Math.log), Vs.map((v) => 0.01 / v));
        const tau = -1 / f.b, V0 = Math.exp(f.a);
        const data = t`import numpy as np

t = np.array([${ts.join(', ')}])   # s
V = np.array([${Vs.map((v) => v.toFixed(3)).join(', ')}])   # V, ±0.010 each
`;
        return {
          prompt: t`Fit $\ln V$ against $t$ with \`np.polyfit\`, **weighting** each point by $1/\sigma_{\ln V} = V/0.010$ (the \`w\` argument). Set \`tau\` to the time constant in seconds and \`V0\` to the starting voltage the fit implies.`,
          starter: t`${data}
tau = 0.0
V0 = 0.0
print(tau, V0)
`,
          answer: t`${data}
slope, intercept = np.polyfit(t, np.log(V), 1, w=V / 0.010)
tau = -1 / slope
V0 = np.exp(intercept)
print(f"tau = {tau:.3f} s, V0 = {V0:.3f} V")
`,
          tests: [
            { name: t`\`tau\` is −1/slope of the weighted fit (${tau.toFixed(3)} s)`, code: `abs(tau - ${tau}) < 1e-6 * ${tau}` },
            { name: t`\`V0\` is e to the intercept (${V0.toFixed(3)} V)`, code: `abs(V0 - ${V0}) < 1e-6 * ${V0}` },
          ],
          hints: [t`\`np.polyfit(t, np.log(V), 1, w=V / 0.010)\` returns the slope, then the intercept.`, t`\`tau = -1 / slope\` and \`V0 = np.exp(intercept)\`.`],
          teach: t`\`numpy.polyfit\` takes weights $w = 1/\sigma$; for $\ln V$, $\sigma = \sigma_V/V$, so $w = V/\sigma_V$.`,
          explain: t`The weighted fit gives $\tau = ${tau.toFixed(3)}$ s and $V_0 = ${V0.toFixed(3)}$ V. Note that \`polyfit\` wants $1/\sigma$, not $1/\sigma^2$: it squares the weights itself.`,
          visual: plot('rc', rows, { fit: false, caption: 'The readings your program fits, with their error bars on ln V.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-bleeder', difficulty: 3, transfer: true,
      gen(r) {
        const C = r.pick([1.0, 2.0, 4.7]), V0 = r.pick([1000, 1100, 1200]), Rb = r.pick([5, 10, 22]), Vs = 50;
        const tau = Rb * C, T = tau * Math.log(V0 / Vs);
        return {
          prompt: t`After an ion engine’s power processor is switched off, its ${C.toFixed(1)} µF high-voltage filter capacitor, charged to ${V0} V, drains through a ${Rb} MΩ bleeder resistor. Technicians may touch it once it is below ${Vs} V. How long must they wait?`,
          answer: T, units: 's', tol: { rel: 0.005 },
          errors: apart([
            { value: tau, feedback: t`That is one time constant: the voltage has fallen only to 37% of ${V0} V by then.` },
            { value: tau * Math.log10(V0 / Vs), feedback: t`Use the natural logarithm: $t = \tau\ln(V_0/V)$.` },
          ], T),
          hints: [t`$\tau = RC$ — MΩ times µF gives seconds directly.`, t`$t = \tau\ln(V_0/V_{\text{safe}})$.`],
          teach: 'A bleeder resistor empties a capacitor exponentially: the wait is RC ln(V₀/V_safe).',
          explain: t`$\tau = (${Rb}\ \text{M}\Omega)(${C.toFixed(1)}\ \mu\text{F}) = ${tau.toFixed(1)}$ s, so $t = ${tau.toFixed(1)}\ln(${V0}/${Vs}) = ${T.toFixed(0)}$ s. In practice a margin is added: a bleeder can fail open, so procedures also call for checking with a meter.`,
          visual: decay({ V0, tau, tmax: Math.ceil((1.3 * T) / 10) * 10, hl: [{ y: Vs, label: `${Vs} V`, color: 'warn' }], caption: 'The capacitor’s voltage after switch-off, with the safe level. Read the time off the curve, or compute it.' }),
        };
      },
    }),
    num({
      id: 'cp-two-readings', difficulty: 2,
      gen(r) {
        const { rows } = run(r, 'rc');
        const i = r.int(0, 2), j = r.int(i + 3, 6);
        const [t1, V1, t2, V2] = [rows[i].s, rows[i].R[0], rows[j].s, rows[j].R[0]];
        const tau = (t2 - t1) / Math.log(V1 / V2);
        return {
          prompt: t`During a discharge the logger reads ${V1.toFixed(3)} V at $t = ${t1}$ s and ${V2.toFixed(3)} V at $t = ${t2}$ s. Estimate the time constant from these two readings.`,
          answer: tau, units: 's', tol: { rel: 0.005 },
          errors: apart([{ value: (t2 - t1) / (V1 / V2), feedback: t`Take the logarithm of the ratio: $V_1/V_2 = e^{(t_2 - t_1)/\tau}$.` }, { value: (t2 - t1) / Math.log10(V1 / V2), feedback: 'The natural logarithm, ln, not log base 10.' }], tau),
          hints: [t`$\dfrac{V_1}{V_2} = e^{(t_2 - t_1)/\tau}$.`, t`So $\tau = \dfrac{t_2 - t_1}{\ln(V_1/V_2)}$.`],
          teach: 'Any two points of an exponential decay give τ = Δt / ln(V₁/V₂).',
          explain: t`$\tau = \dfrac{${t2} - ${t1}}{\ln(${V1.toFixed(3)}/${V2.toFixed(3)})} = ${tau.toFixed(2)}$ s.`,
          visual: plot('rc', [rows[i], rows[j]], { axes: 'raw', fit: false, caption: 'The two readings on V against t.' }),
        };
      },
    }),
    mcq({
      id: 'cp-silent', difficulty: 2,
      prompt: t`Which fault would change the fitted $\tau$ while leaving $\ln V$ against $t$ a perfectly straight line?`,
      choices: [
        'A 10 MΩ voltmeter connected across the capacitor',
        'A logger that reads 0.050 V too high at every point',
        'A logger whose clock starts 1.0 s after the switch moves',
        'A voltmeter that reads 2% high at every point',
      ],
      answer: 0,
      why: {
        1: t`A constant offset is not a factor: $\ln(V + 0.05)$ bends upward where $V$ is small, so the line curves and $\chi^2$ rises.`,
        2: t`A late start shifts every time by the same amount, which moves only the intercept: the slope, and $\tau$, are unchanged.`,
        3: t`A gain error multiplies every $V$ by 1.02, which adds $\ln 1.02$ to every $\ln V$: the intercept moves, the slope does not.`,
      },
      hints: [t`Write what each fault does to $\ln V$: an added constant, a factor, a shift in $t$ — or a change in the decay itself?`],
      teach: 'On ln V against t, factors and time shifts move only the intercept, an offset bends the line, and only a change in the circuit changes the slope.',
      explain: t`The meter adds a second path, so the circuit really decays with $\tau = (R \parallel R_V)C$: still a pure exponential, just faster. That is why it hides — only comparing $\tau$ with $RC$ exposes it.`,
      visual: apparatus('rc', { at: 12 }, 'The discharge circuit with its high-impedance logger. Not to scale.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §10.5 RC Circuits', url: 'https://openstax.org/books/university-physics-volume-2/pages/10-5-rc-circuits' },
    SOURCES.taylor('ch. 3 (propagation) and ch. 8 (weighted least squares)'),
    SOURCES.polyfit,
    SOURCES.aapt,
  ],
});
