// Lab 2 of PHYS 2225 (virtual): Ohm’s law and resistivity with a thin copper
// wire. V against I at one length is a straight line through the origin
// whose slope is R; R against L has slope ρ/A, so ρ = slope × πd²/4, with an
// uncertainty budget ruled by the squared diameter. The systematic is where
// the voltage is sensed: a voltmeter clipped outside the ammeter tilts the
// V–I slope invisibly, and a two-wire measurement puts the leads in the R–L
// intercept — the four-wire principle. Joule heating bends the V–I line.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { B, sf, pmTeX, plot, apparatus, SOURCES } from '../phys2210/_lab.js';
import { run, apart, budget } from './_lab2225.js';

const t = String.raw;
const P0 = B.EXPERIMENTS.ohm.defaults;
const A0 = B.wireA(P0), R0 = B.wireR(P0), RHO = 1.68e-8, ALPHA = 0.0039;

// the worked example: R against L measured two-wire (seed 9)
const EX = (() => {
  const rows = B.makeData('resistivity', { seed: 9, sys: 'wiring' }).rows;
  const an = B.analyse('resistivity', rows, { sys: 'wiring' });
  const f = an.series[0].fit, q = an.results[0];
  const rho = f.b * A0, pctB = (100 * f.sb) / f.b, pctD = 200 * (P0.sd / P0.d), pct = Math.hypot(pctB, pctD);
  const one = rows[3];                                   // the single reading at 1.00 m
  return { rows, f, q, rho, pctB, pctD, pct, s: (rho * pct) / 100, one, rhoOne: (one.R[0] * A0) / one.s };
})();
const e8 = (x) => (x * 1e8).toFixed(3);                  // a resistivity in units of 10⁻⁸ Ω·m

export default lesson({
  id: 'phys2220.L.2',
  title: 'Ohm’s law and resistivity',
  minutes: 16, difficulty: 2,
  lab: true,
  intro: t`**This is a virtual experiment.** A copper wire 0.200 mm across carries a current from a power supply; an ammeter measures the current $I$ through it and a voltmeter the voltage $V$ across it. The bench computes each reading with realistic meter scatter.

**Ohm’s law** says the current is proportional to the voltage: the ratio $R = V/I$, the resistance, does not depend on $I$. For a uniform wire, $R$ grows with length and shrinks with cross-section, through a property of the metal alone, its **resistivity** $\rho$:

$$V = IR, \qquad R = \frac{\rho L}{A}, \qquad A = \frac{\pi d^2}{4}$$

So $V$ against $I$ is a straight line of slope $R$, and $R$ against $L$ a straight line of slope $\rho/A$. (Lab skills trained: where to connect a voltmeter, an uncertainty budget with a squared dimension, and reading a systematic error from an intercept.)`,
  symbols: [
    { tex: 'V', text: 'the voltage across the wire, in volts' },
    { tex: 'I', text: 'the current through it, in amperes' },
    { tex: 'R', text: 'its resistance, in ohms (Ω = V/A): the slope of $V$ against $I$' },
    { tex: '\\rho', text: 'the resistivity of the metal, in Ω·m: copper at 20 °C has $1.68\\times10^{-8}$ Ω·m (CRC Handbook)' },
    { tex: 'L', text: 'the length of wire between the voltage contacts, in m' },
    { tex: 'A', text: 'the wire’s cross-sectional area, in m²' },
    { tex: 'd', text: 'the wire’s diameter, measured with a micrometer: $0.200 \\pm 0.002$ mm' },
  ],
  why: 'Every power harness on a spacecraft, every strain gauge on a test stand and every heater on a propellant line is sized with R = ρL/A — and every precise resistance measurement uses the four-wire trick this lab uncovers.',
  visual: {
    type: 'lab-bench',
    title: 'Drive a current, read the meters',
    lead: t`Seven readings of $V$ and $I$ are in the table, with the least-squares line and residuals; the readout gives $R$ = slope and compares it with $\rho L/A$. The Method switch changes to resistance against length, where the readout gives $\rho$ in nΩ·m (16.8 nΩ·m is $1.68\times10^{-8}$ Ω·m).`,
    tasks: [
      'V against I is a straight line through the origin: its slope, about 1.07 Ω, is the same at every current. That is Ohm’s law.',
      'Turn on the systematic (the voltmeter clipped outside the ammeter): the line stays perfectly straight, but R jumps by 0.100 Ω — the ammeter’s own resistance, now inside the measurement.',
      'Switch to R against L: the slope is ρ/A. Its uncertainty is about 2% — nearly all of it from the wire’s diameter, which enters squared. With the systematic on, the line rises by 0.250 Ω (the leads) but keeps its slope.',
    ],
    params: { exp: ['ohm', 'resistivity'], seed: 24, residuals: true },
  },
  example: {
    prompt: t`Measured with an ordinary two-wire ohmmeter, the wire’s resistance at seven lengths is in the table. A fit of $R$ against $L$ gives slope $${pmTeX(EX.f.b, EX.f.sb, t`\Omega/\text{m}`)}$ and intercept $${pmTeX(EX.f.a, EX.f.sa, t`\Omega`)}$, with $\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$. The diameter is $0.200 \pm 0.002$ mm. Find the resistivity with its uncertainty, compare it with copper’s $1.68\times10^{-8}$ Ω·m, and explain the intercept.`,
    visual: plot('resistivity', EX.rows, { sys: true, table: true, residuals: true, caption: 'R against L with ±1σ error bars (smaller than the dots), the least-squares line and residuals.' }),
    steps: [
      { label: 'Check the fit', text: t`$\chi^2/\text{dof} = ${EX.f.chi2r.toFixed(2)}$, residuals without a pattern: $R$ grows linearly with $L$. But the line does not pass through the origin — at zero length it still reads $${EX.f.a.toFixed(3)}$ Ω.` },
      { label: 'Area', text: t`$A = \pi d^2/4 = \pi(0.200\times10^{-3}\ \text{m})^2/4 = ${tex(A0, 4)}\ \text{m}^2$.` },
      { label: 'Resistivity', text: t`The slope is $\rho/A$, so $\rho = \text{slope}\times A = (${EX.f.b.toFixed(4)}\ \Omega/\text{m})(${tex(A0, 4)}\ \text{m}^2) = ${e8(EX.rho)}\times10^{-8}\ \Omega\cdot\text{m}$.` },
      { label: 'Budget', text: t`Slope: $${EX.f.sb.toFixed(4)}/${EX.f.b.toFixed(4)}$ = ${EX.pctB.toFixed(2)}% (Type A, from the fit). Diameter: 1.0%, **doubled** to ${EX.pctD.toFixed(1)}% because $A \propto d^2$ (Type B, from the micrometer). In quadrature: ${EX.pct.toFixed(2)}%, so $\sigma_\rho = ${(EX.s * 1e8).toFixed(3)}\times10^{-8}$ Ω·m. The diameter is nearly all of it.` },
      { label: 'Compare', text: t`$\rho = (${pmTeX(EX.rho * 1e8, EX.s * 1e8)})\times10^{-8}$ Ω·m against copper’s 1.68: ${(Math.abs(EX.rho - RHO) / EX.s).toFixed(1)}σ apart — agreement.` },
      { label: 'The intercept', text: t`$${EX.f.a.toFixed(3)}$ Ω at zero length is the meter’s own leads and clips: a two-wire meter measures them along with the wire. In the fit they sit in the intercept and cost $\rho$ nothing — but one reading alone, $R/L$ at 1.00 m, gives $\rho = ${e8(EX.rhoOne)}\times10^{-8}$ Ω·m, ${Math.round(100 * (EX.rhoOne / RHO - 1))}% too high.` },
      { label: 'Sense check', text: t`Copper is among the best conductors, so even this hair-thin wire has only about half an ohm per metre. A four-wire measurement — separate leads for the current and for the voltage — would remove the intercept altogether.` },
    ],
    answer: t`$\rho = (${pmTeX(EX.rho * 1e8, EX.s * 1e8)})\times10^{-8}$ Ω·m, agreeing with copper; the diameter dominates the uncertainty. The $${EX.f.a.toFixed(2)}$ Ω intercept is the resistance of the leads and clips.`,
  },
  practice: [
    num({
      id: 'current-at', difficulty: 1,
      gen(r) {
        const { rows, f } = run(r, 'ohm');
        const b = +f.b.toFixed(4), V = r.pick([0.30, 0.45, 0.60, 0.75]);
        return {
          prompt: t`The least-squares slope of $V$ against $I$ for the wire is $${b.toFixed(4)}$ Ω. What current flows when the voltage across it is ${V.toFixed(2)} V?`,
          answer: V / b, units: 'A', tol: { rel: 0.003 },
          errors: [{ value: V * b, feedback: t`Ohm’s law is $V = IR$, so $I = V/R$: divide by the resistance, do not multiply.` }],
          hints: [t`The slope of $V$ against $I$ is the resistance: $V = IR$.`],
          teach: 'The slope of V against I is the resistance, the same at every current for an ohmic conductor.',
          explain: t`$I = V/R = ${V.toFixed(2)}/${b.toFixed(4)} = ${(V / b).toFixed(3)}$ A — read straight off the line, since $R$ does not change with the current.`,
          visual: plot('ohm', rows, { caption: 'V against I for the wire, with the least-squares line through the readings.' }),
        };
      },
    }),
    num({
      id: 'rho-from-R', difficulty: 2,
      gen(r) {
        const { rows, f } = run(r, 'ohm');
        const R = +f.b.toFixed(4), rho = (R * A0) / P0.L;
        return {
          prompt: t`The fit gives $R = ${R.toFixed(4)}$ Ω for 2.000 m of the wire, which is 0.200 mm in diameter. What resistivity does that give, in Ω·m?`,
          answer: rho, units: 'ohm m', tol: { rel: 0.003 },
          errors: [
            { value: (R * Math.PI * P0.d ** 2) / P0.L, feedback: t`That uses $\pi d^2$ — the area of a circle of *radius* $d$. The radius is $d/2$, so $A = \pi d^2/4$.` },
            { value: (R * Math.PI * (P0.d / 2)) / P0.L, feedback: t`Square the radius: $A = \pi r^2$.` },
          ],
          hints: [t`Rearrange $R = \rho L/A$: $\rho = RA/L$.`, t`$A = \pi d^2/4 = ${tex(A0, 4)}\ \text{m}^2$.`],
          teach: 'Resistivity is resistance scaled to unit length and unit area: ρ = RA/L.',
          explain: t`$\rho = \dfrac{RA}{L} = \dfrac{(${R.toFixed(4)})(${tex(A0, 4)})}{2.000} = $ $${tex(rho, 3)}$ Ω·m — copper’s $1.68\times10^{-8}$ within the diameter’s 2%.`,
          visual: apparatus('ohm', {}, 'The wire on its frame, with the supply, the ammeter (A) in series and the voltmeter (V) across the wire. Not to scale.'),
        };
      },
    }),
    num({
      id: 'budget-rho', difficulty: 2,
      gen(r) {
        const sd = r.pick([0.001, 0.002, 0.003, 0.004]), pb = r.pick([0.3, 0.4, 0.6, 0.8]);
        const pd = (100 * sd) / 0.2, ans = Math.hypot(pb, 2 * pd);
        return {
          prompt: t`The slope of $R$ against $L$ is uncertain by ${pb.toFixed(1)}%. The micrometer gives the diameter as $0.200 \pm ${sd.toFixed(3)}$ mm. What is the relative uncertainty of the resistivity $\rho = \text{slope}\times\pi d^2/4$, in percent?`,
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: apart([
            { value: Math.hypot(pb, pd), feedback: t`$\rho \propto d^2$, so the diameter’s ${pd.toFixed(1)}% counts twice: ${(2 * pd).toFixed(1)}%.` },
            { value: pb + 2 * pd, feedback: 'Independent uncertainties add in quadrature, not straight.' },
          ], ans, 0.02),
          hints: [t`For a product of powers, relative uncertainties add in quadrature, each multiplied by its power: $\dfrac{\sigma_\rho}{\rho} = \sqrt{\left(\dfrac{\sigma_b}{b}\right)^2 + \left(2\dfrac{\sigma_d}{d}\right)^2}$.`, t`$\sigma_d/d = ${sd.toFixed(3)}/0.200 = ${pd.toFixed(1)}$%, doubled to ${(2 * pd).toFixed(1)}%.`],
          teach: 'A quantity that depends on the square of a measured length carries twice that length’s relative uncertainty.',
          explain: t`$\sqrt{${pb.toFixed(1)}^2 + (2\times${pd.toFixed(1)})^2}$ = ${ans.toFixed(2)}%. ${2 * pd > 2 * pb ? 'The diameter dominates: a better micrometer reading — or the mass of a measured length of wire, which gives A without a squared diameter — would help far more than more resistance readings.' : 'Here the two terms are comparable.'}`,
          visual: budget([{ label: 'slope of R against L (Type A)', pct: pb }, { label: 'diameter, doubled (Type B)', pct: 2 * pd, color: 'violet' }], 'The two parts of the resistivity’s uncertainty. Combining them is your job.', { total: false }),
        };
      },
    }),
    num({
      id: 'subtract-ammeter', difficulty: 2,
      gen(r) {
        const { rows, f } = run(r, 'ohm', { sys: 'wiring' });
        const b = +f.b.toFixed(4);
        return {
          prompt: t`In this circuit the voltmeter is clipped outside the ammeter, whose resistance is 0.100 Ω. The fit of $V$ against $I$ gives a slope of $${b.toFixed(4)}$ Ω. What is the resistance of the wire itself?`,
          answer: b - 0.1, units: 'ohm', tol: { rel: 0.002 },
          errors: [{ value: b, feedback: 'That is the resistance of everything between the voltmeter’s clips: the ammeter as well as the wire.' }, { value: b + 0.1, feedback: 'The ammeter’s drop is included in the reading, so it must be taken away, not added.' }],
          hints: [t`The voltmeter reads the drop across the ammeter and the wire together: $V = I(R + R_A)$.`],
          teach: t`A voltmeter reads everything between its clips: with the ammeter inside them, the slope is $R + R_A$.`,
          explain: t`The slope is $R + R_A$, so $R = ${b.toFixed(4)} - 0.100 = ${(b - 0.1).toFixed(4)}$ Ω. Better: clip the voltmeter onto the wire’s own terminals, and the ammeter drops out of the measurement.`,
          visual: apparatus('ohm', { at: 0.55, sys: true }, 'The voltmeter’s left lead (amber) is clipped before the ammeter, so the ammeter sits inside the measurement. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'how-to-tell', difficulty: 3,
      gen(r) {
        const { rows, f, q } = run(r, 'ohm', { sys: 'wiring' });
        return {
          prompt: t`Your $V$ against $I$ fit is excellent — $\chi^2/\text{dof} = ${f.chi2r.toFixed(2)}$, intercept $${pmTeX(f.a, f.sa, t`\text{V}`)}$ — but $R = ${pmTeX(q.value, q.sigma, t`\Omega`)}$ is 9% above $\rho L/A = 1.07$ Ω. Either the voltmeter is clipped outside the ammeter, or it reads 9% high. Which test tells the two apart?`,
          choices: [
            'Clip the voltmeter directly onto the wire’s terminals and repeat: a placement error disappears, a calibration error stays',
            'Take three times as many readings',
            'Look closely at the residuals',
            'Reverse the current and repeat',
          ],
          answer: 0,
          why: {
            1: 'Both faults are systematic: more readings shrink the error bar on the same wrong slope.',
            2: 'Both faults scale every voltage in proportion to the current, so both give a straight line through the origin with identical, patternless residuals.',
            3: 'Reversing the current reverses V and I together, and both faults with them: the slope comes out the same.',
          },
          hints: ['Do the two faults leave any difference in the data you already have?', 'Change the one thing that only one of the faults depends on.'],
          teach: 'When two systematic errors leave the same fingerprint in the data, change the apparatus so that only one of them is affected.',
          explain: t`An ammeter drop of $IR_A$ and a 9% calibration error both make $V \propto I$ with too steep a slope: the data cannot separate them. Moving the voltmeter’s clips onto the wire removes $R_A$ from the measurement — if $R$ falls to 1.07 Ω, it was the placement; if not, check the meter against a standard.`,
          visual: plot('ohm', rows, { sys: true, expected: true, caption: 'Your readings, the least-squares line (gold) and V = IR with R = ρL/A (dashed).' }),
        };
      },
    }),
    mcq({
      id: 'heating', difficulty: 2,
      gen(r) {
        const { rows, f } = run(r, 'ohm', { sys: 'heating' });
        return {
          prompt: t`With the current left on between readings, $V$ against $I$ gives $\chi^2/\text{dof} = ${f.chi2r.toFixed(1)}$, and the residuals form a smile: high at both ends, low in the middle. What is happening?`,
          choices: [
            'The wire warms as I²R grows, and copper’s resistance rises with temperature, so V curves upward at large currents',
            'Copper does not obey Ohm’s law at any temperature',
            'The meters’ error bars are too small: enlarge them until χ²/dof is 1',
            'The ammeter reads low at large currents',
          ],
          answer: 0,
          why: {
            1: 'At a fixed temperature copper is ohmic to high precision. Here the temperature is not fixed: it rises with the current.',
            2: 'Scatter would not form the same smooth smile in every run. Inflating the error bars would hide a real effect.',
            3: 'Possible in principle, but it would not explain why the trouble vanishes when the current is switched on only briefly for each reading.',
          },
          hints: ['Look at the residual panel: random, or a curve?', t`The power dissipated is $I^2R$. What does heat do to a metal’s resistance?`],
          teach: 'Residuals with a smooth pattern say the model is wrong: here the resistance is not constant because the wire heats up.',
          explain: t`At 1 A the wire dissipates over a watt and warms by about 12 K; copper’s resistance rises by 0.39% per kelvin, so $R$ is about 5% higher at the top of the range. $V = IR(I)$ curves upward, the straight-line slope comes out too high, and $\chi^2$ flags it. Short current pulses, or smaller currents, keep the wire at room temperature.`,
          visual: plot('ohm', rows, { sys: true, sysKind: 'heating', residuals: true, caption: 'V against I with the current left on, the least-squares line, and the residuals.' }),
        };
      },
    }),
    num({
      id: 'lead-two-point', difficulty: 2,
      gen(r) {
        const rows = B.makeData('resistivity', { seed: r.int(1, 999999), sys: 'wiring', settings: [0.5, 1.5] }).rows;
        const [R1, R2] = rows.map((q) => q.R[0]);
        const b = (R2 - R1) / 1.0, Rl = R1 - b * 0.5;
        return {
          prompt: t`With a two-wire meter, the wire reads ${R1.toFixed(3)} Ω at $L = 0.50$ m and ${R2.toFixed(3)} Ω at $L = 1.50$ m. Assuming $R = \rho L/A + R_{\text{leads}}$, find the resistance of the leads.`,
          answer: Rl, units: 'ohm', tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: R1, feedback: 'That is the whole first reading. Find how much of it the wire accounts for, and subtract.' }, { value: b, feedback: 'That is the wire’s resistance per metre (the slope). The leads are what is left at zero length.' }],
          hints: [t`The wire adds $(${R2.toFixed(3)} - ${R1.toFixed(3)})$ Ω per extra metre.`, t`Subtract the wire’s share of the first reading: $R_{\text{leads}} = R_1 - (\text{slope})(0.50\ \text{m})$.`],
          teach: 'The intercept of R against L — the resistance at zero length — is whatever the meter measures besides the wire.',
          explain: t`Slope $= ${b.toFixed(3)}$ Ω/m, so $R_{\text{leads}} = ${R1.toFixed(3)} - ${b.toFixed(3)}\times0.50 = ${Rl.toFixed(3)}$ Ω — half as big as a whole metre of this wire.`,
          visual: apparatus('resistivity', { at: 0.5, sys: true, data: [[0.5, R1]] }, 'The two-wire meter on 0.50 m of the wire: the same two leads carry the current and sense the voltage. Not to scale.'),
        };
      },
    }),
    code({
      id: 'rho-fit', difficulty: 3,
      gen(r) {
        const rows = B.makeData('resistivity', { seed: r.int(1, 999999), sys: 'wiring' }).rows;
        const Ls = rows.map((q) => q.s), Rs = rows.map((q) => q.R[0]);
        const f = B.fitLine(Ls, Rs), rho = f.b * A0;
        const data = t`import numpy as np

L = np.array([${Ls.map((v) => v.toFixed(2)).join(', ')}])          # m
R = np.array([${Rs.map((v) => v.toFixed(3)).join(', ')}])   # ohm, two-wire
d = 0.200e-3                                                  # m
`;
        return {
          prompt: t`Fit $R$ against $L$ with \`np.polyfit\`. Set \`rho\` to the resistivity in Ω·m (from the slope and $A = \pi d^2/4$) and \`R_leads\` to the resistance at zero length, in ohms.`,
          starter: t`${data}
rho = 0.0
R_leads = 0.0
print(rho, R_leads)
`,
          answer: t`${data}
slope, intercept = np.polyfit(L, R, 1)
A = np.pi * d**2 / 4
rho = slope * A
R_leads = intercept
print(f"rho = {rho:.3e} ohm m, leads = {R_leads:.3f} ohm")
`,
          tests: [
            { name: t`\`rho\` is slope × A (${(rho * 1e8).toFixed(3)}×10⁻⁸ Ω·m)`, code: `abs(rho - ${rho}) < 1e-6 * ${rho}` },
            { name: t`\`R_leads\` is the intercept (${f.a.toFixed(3)} Ω)`, code: `abs(R_leads - ${f.a}) < 1e-6` },
          ],
          hints: [t`\`slope, intercept = np.polyfit(L, R, 1)\` returns the slope first.`, t`\`rho = slope * np.pi * d**2 / 4\` and \`R_leads = intercept\`.`],
          teach: 'One fit of R against L separates the wire (the slope, ρ/A) from the leads (the intercept).',
          explain: t`The slope is $${f.b.toFixed(4)}$ Ω/m, so $\rho = $ $${tex(rho, 3)}$ Ω·m, and the leads add $${f.a.toFixed(3)}$ Ω. The fit puts the leads in the intercept, so they do not bias $\rho$.`,
          visual: plot('resistivity', rows, { sys: true, fit: false, caption: 'The two-wire readings your program fits.' }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-harness', difficulty: 3, transfer: true,
      gen(r) {
        const [awg, dmm] = r.pick([[22, 0.6438], [24, 0.5106], [20, 0.8128]]);
        const run1 = r.pick([3.0, 4.0, 5.0]), I = r.pick([1.5, 2.0, 2.5]), T = r.pick([50, 60, 70]);
        const A = (Math.PI * (dmm / 1000) ** 2) / 4, rhoT = RHO * (1 + ALPHA * (T - 20));
        const V = (I * rhoT * 2 * run1) / A;
        return {
          prompt: t`A spacecraft’s reaction wheel draws ${I.toFixed(1)} A through a harness of AWG ${awg} copper wire (diameter ${dmm.toFixed(4)} mm). The wheel is ${run1.toFixed(1)} m from the power bus, and the current must go out and back. In sunlight the harness runs at ${T} °C. What voltage is lost along the harness? Copper: $\rho = 1.68\times10^{-8}$ Ω·m at 20 °C, rising by 0.39% per kelvin.`,
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: apart([
            { value: V / 2, feedback: 'The current flows out to the wheel and back: that is twice the distance.' },
            { value: V / (1 + ALPHA * (T - 20)), feedback: t`That uses the 20 °C resistivity. At ${T} °C it is $(1 + 0.0039\times${T - 20})$ times larger.` },
            { value: V / 4, feedback: t`That treats the diameter as the radius. With $d$ the diameter, $A = \pi d^2/4$.` },
          ], V),
          hints: [t`$R = \rho_T\,(2L)/A$, with $A = \pi d^2/4$ and $\rho_T = \rho_{20}[1 + \alpha(T - 20\ ^\circ\text{C})]$.`, t`Then the voltage lost is $IR$.`],
          teach: 'A harness loses I·ρL/A along its whole length, out and back, with ρ evaluated at its working temperature.',
          explain: t`$A = ${tex(A, 3)}\ \text{m}^2$; $\rho_T = 1.68\times10^{-8}(1 + 0.0039\times${T - 20}) = ${tex(rhoT, 3)}$ Ω·m; $R = \rho_T(2\times${run1.toFixed(1)})/A = ${(rhoT * 2 * run1 / A).toFixed(3)}$ Ω; $\Delta V = IR = ${V.toFixed(2)}$ V — a noticeable share of a 28 V bus, which is why harness gauges are chosen for the hottest case.`,
          visual: {
            type: 'graph',
            params: {
              aspect: 'wide', x: [0, 80], y: [0, 2.4], xlabel: 'harness temperature (°C)', ylabel: 'ρ (10⁻⁸ Ω·m)', xticks: 8,
              curves: [{ fn: '1.68*(1 + 0.0039*(x - 20))', color: 'accent', width: 2.4 }],
              points: [{ x: 20, y: 1.68, r: 4, color: 'good', label: '20 °C: 1.68', labelDx: 8, labelDy: 12 }],
              vlines: [{ x: T, color: 'warn', label: `${T} °C` }],
            },
            caption: 'Copper’s resistivity rises about linearly with temperature (α = 0.0039 per kelvin over this range).',
          },
        };
      },
    }),
    mcq({
      id: 'cp-4wire', difficulty: 2,
      prompt: 'A four-wire measurement uses one pair of leads to carry the current through the wire and a separate pair, clipped just inside them, to sense the voltage. Why does it remove the lead resistance?',
      choices: [
        'The voltage leads carry almost no current, so there is no voltage drop along them: the meter senses the potential difference right at the wire',
        'Four leads in parallel have a quarter of the resistance of one',
        'The meter averages two readings, which cancels the leads',
        'The current leads are made of thicker wire',
      ],
      answer: 0,
      why: {
        1: 'The leads are not in parallel: two carry the current, two sense the voltage. The point is which pair carries current.',
        2: 'Averaging cancels random error, not a fixed extra resistance.',
        3: 'Thick current leads still drop some voltage — but in a four-wire meter that drop is outside the sensing clips, so it does not matter how thick they are.',
      },
      hints: ['A lead only adds to the reading if there is a voltage drop along it. When is the drop along a lead zero?'],
      teach: 'Sense the voltage with leads that carry no current, and their resistance cannot enter the reading: the four-wire (Kelvin) method.',
      explain: 'The voltmeter draws a tiny current (its resistance is megohms), so the drop along its leads is negligible: it reads only the voltage between its own clips. The current leads drop voltage too, but outside the sensing clips. The R–L line then passes through the origin.',
      visual: apparatus('resistivity', { at: 1.0 }, 'Four-wire: grey leads carry the current, violet leads sense the voltage. Not to scale.'),
    }),
    num({
      id: 'cp-heat-rise', difficulty: 2,
      gen(r) {
        const heat = r.pick([8, 10, 12, 15]);
        const P = { ...P0, heat };
        const Rhot = +(B.wireR(P) * (1 + ALPHA * heat)).toFixed(4), Rcold = +B.wireR(P).toFixed(4);
        const dT = (Rhot / Rcold - 1) / ALPHA;
        return {
          prompt: t`With brief pulses of current, the wire’s resistance is ${Rcold.toFixed(4)} Ω at room temperature. With 1.00 A left on, $V/I$ gives ${Rhot.toFixed(4)} Ω. Copper’s resistance rises by 0.39% per kelvin. How much has the wire warmed?`,
          answer: dT, units: 'K', difference: true, tol: { rel: 0.01 },
          errors: [{ value: (Rhot - Rcold) / ALPHA, feedback: t`Use the *fractional* change: $\Delta R/R_0 = \alpha\,\Delta T$, so divide $\Delta R$ by $R_0$ first.` }],
          hints: [t`$R = R_0(1 + \alpha\,\Delta T)$, so $\Delta T = (R/R_0 - 1)/\alpha$.`],
          teach: 'A resistance thermometer in reverse: the fractional rise in R divided by α is the temperature rise.',
          explain: t`$\Delta T = \dfrac{${Rhot.toFixed(4)}/${Rcold.toFixed(4)} - 1}{0.0039} = ${dT.toFixed(1)}$ K. Platinum resistance thermometers use exactly this effect, deliberately.`,
          visual: plot('ohm', B.makeData('ohm', { seed: 77, sys: 'heating', params: { heat } }).rows, { sys: true, sysKind: 'heating', params: { heat }, residuals: true, caption: 'V against I with the current left on: the line bends upward as the wire warms.' }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §9.3 Resistivity and Resistance', url: 'https://openstax.org/books/university-physics-volume-2/pages/9-3-resistivity-and-resistance' },
    { label: 'OpenStax University Physics Vol. 2, §9.4 Ohm’s Law', url: 'https://openstax.org/books/university-physics-volume-2/pages/9-4-ohms-law' },
    { label: 'CRC Handbook of Chemistry and Physics: electrical resistivity of pure metals (copper, 1.68×10⁻⁸ Ω·m at 20 °C)', url: 'https://hbcp.chemnetbase.com/' },
    SOURCES.taylor('ch. 3 (propagation) and ch. 8 (least squares)'),
    SOURCES.aapt,
  ],
});
