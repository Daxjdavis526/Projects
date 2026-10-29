// The Hall effect — the lab view: a slab of n-type germanium carrying a
// current across a magnetic field; the Hall voltage against B, the Hall
// coefficient R_H = (slope)·t/I, the carrier density and its sign, and the
// Hall mobility with the resistivity. The systematic: voltage contacts that
// are not exactly opposite add an offset proportional to the current, and as
// the current warms the slab that offset drifts — so a run that steps the
// field up in time order turns the drift into a false slope. Reversing the
// field at each step and taking half the difference removes offset, drift
// and magnetoresistance together. Copper's tiny Hall voltage, and the Hall
// sensors in a reaction wheel's motor as the transfer. Theory:
// phys2220.B1.3, phys2710.MP12.2. Every number is computed here from the
// seeded model the labg-rig simulation draws with (_labg.js).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { G, rig, pmT, resT, f, tex, zT, SIMNOTE, SRC } from './_labg.js';
import { r6, table } from './_labf.js';

const t = String.raw;
const H = G.HL, E = G.K.e;
const RH0 = G.hallRH(), RHO = G.hallRho();

// ── the worked example: seed 3, the field reversed at each step ──
const EX = G.run('hall', { seed: 3, analysis: 'reverse' });
const EXs = G.run('hall', { seed: 3, analysis: 'single' });
const Rr = EX.results[0], Rm = EX.results[1], Rs = EXs.results[0];
const pairs = H.fields.map((B, i) => ({ B, Vp: 1000 * EX.readings[2 * i].V, Vm: 1000 * EX.readings[2 * i + 1].V }));
const Vl = H.I * RHO * H.l / (H.w * H.t);                    // V: the longitudinal voltage

// ── the code exercise: seed 7, readings printed and analysed ──
const CR = G.run('hall', { seed: 7, analysis: 'reverse' });
const CRD = CR.readings.map((q) => [+q.B.toFixed(4), +(1000 * q.V).toFixed(3)]);
const CX = H.fields.map((_, i) => (CRD[2 * i][0] - CRD[2 * i + 1][0]) / 2), CY = H.fields.map((_, i) => (CRD[2 * i][1] - CRD[2 * i + 1][1]) / 2);
const CF = G.fitLine(CX, CY);
const CRH = (CF.b / 1000) * H.t / H.I, CN = -1 / (CRH * E);

const slabPic = (caption) => ({ type: 'graph', params: { aspect: 'wide', x: [-1.6, 5.6], y: [-0.5, 2.6], equal: true, axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['4*t', '0'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['4', '2*t'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['4 - 4*t', '2'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['0', '2 - 2*t'], t: [0, 1], color: 'ink2', width: 2 }], arrows: [{ from: [-1.3, 1], to: [-0.1, 1], color: 'gold' }, { from: [1.2, 1.6], to: [1.2, 0.4], color: 'accent' }], points: [{ x: -1.3, y: 1, r: 0, label: 'current I', labelDy: -14 }, { x: 1.3, y: 1.0, r: 0, label: 'force on the carriers', color: 'accent' }, { x: 2, y: 2.2, r: 0, label: 'contact', labelAlign: 'center', labelDx: 0 }, { x: 2, y: -0.25, r: 0, label: 'contact', labelAlign: 'center', labelDx: 0 }, { x: 0.15, y: 1.75, r: 0, label: 'B out of the page', labelDx: 0 }, { x: 2, y: 2, r: 4, color: 'violet' }, { x: 2, y: 0, r: 4, color: 'violet' }] }, caption });

export default lesson({
  id: 'lab.E.16',
  title: 'The Hall effect',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`Send a current $I$ along a slab in a magnetic field $B$ perpendicular to it, and the magnetic force on the moving carriers ([forces on currents](#/lesson/phys2220.B1.3)) piles charge on one edge until an electric field balances it. The voltage across the slab is the **Hall voltage**:

$$V_H = \frac{R_H\,I B}{t}, \qquad R_H = \frac{1}{nq}$$

Its size counts the carriers, its **sign** says whether they are electrons or holes — a question no resistance measurement can answer. In a semiconductor $n$ is small and $V_H$ is tens of millivolts; in a metal it is microvolts ([why](#/lesson/phys2710.MP12.2)). Real voltage contacts are never exactly opposite each other, so the reading also carries an offset that follows the current and drifts as the slab warms: **reversing the field** separates the Hall voltage, which changes sign, from everything that does not.`,
  symbols: [
    { tex: 'V_H', text: 'the Hall voltage across the slab, in V — the part of the reading that reverses with $B$' },
    { tex: 'R_H', text: 'the Hall coefficient, in m³/C: negative for electrons, positive for holes' },
    { tex: 'I', text: 'the current along the slab, in A (30.0 mA here)' },
    { tex: 'B', text: 'the field perpendicular to the slab, in T, read by a teslameter (1 % calibration)' },
    { tex: 't', text: 'the slab’s thickness along $B$, in m (1.00 mm, known to 1 %)' },
    { tex: 'n', text: 'the density of charge carriers, in m⁻³' },
    { tex: 'q', text: 'each carrier’s charge: $-e$ for electrons, $+e$ for holes, with $e = 1.602\\,176\\,634\\times10^{-19}$ C' },
  ],
  why: t`Hall measurements characterize every semiconductor wafer, and Hall sensors read fields and currents everywhere from car engines to spacecraft — and reversal is the general trick for pulling a signal out of offsets.`,
  visual: {
    type: 'labg-rig',
    title: 'The bench: a germanium slab in an electromagnet',
    lead: t`The top panel shows the raw voltage readings in the order they were taken, blue at $+B$ and violet at $-B$; the dashed line is the offset from the misaligned contacts. Below, the Hall voltage against $B$ as the chosen analysis forms it, the fit and residuals; the readout turns the slope into $R_H$ and the Hall mobility.`,
    tasks: [
      'With the sample warming and “One polarity”, $R_H$ comes out about 5 % small in magnitude, z ≈ 4, and the residuals curve. Switch to “Reverse the field at each step”: the true value returns.',
      'Turn the warming off: now one polarity also gives the right slope (the intercept absorbs a steady offset), but its residuals still bend — magnetoresistance makes the offset grow with B².',
      'Look at the raw panel: the readings are dominated by an offset of about 9 mV that has nothing to do with the Hall effect.',
    ],
    params: { exp: 'hall', seed: 3 },
    caption: t`Simulated readings: n-type Ge with $n = 1.20\times10^{21}\ \text{m}^{-3}$ and Hall mobility $0.36\ \text{m}^2/(\text{V s})$, 1.00 mm thick, 30.0 mA; contacts misaligned by 0.2 mm (a 9 mV offset), drifting by 0.2 mV per minute when warming is on; a 20 μV voltmeter noise. The readout’s “true value” is the simulated sample’s. ${SIMNOTE}`,
  },
  example: {
    prompt: t`At each field, the voltage across the slab is read with the field forward and, half a minute later, reversed (in mV):

${table([[t`B\ (\text{T})`, ...pairs.map((q) => q.B.toFixed(2))], [t`V(+B)`, ...pairs.map((q) => q.Vp.toFixed(3))], [t`V(-B)`, ...pairs.map((q) => q.Vm.toFixed(3))]])}

With $I = 30.0$ mA and $t = 1.00$ mm, find $R_H$, the carrier type and density, and — with the resistivity $\rho = ${tex(RHO, 4)}\ \Omega\,\text{m}$ from the voltage along the slab — the Hall mobility.`,
    visual: rig('hall', { seed: 3 }, t`The raw readings in time order (top), the half-differences against $B$ with the fit, and residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Half-differences', text: t`$V_H = [V(+B) - V(-B)]/2$: at 0.30 T, $(${pairs[5].Vp.toFixed(3)} - ${pairs[5].Vm.toFixed(3)})/2 = ${((pairs[5].Vp - pairs[5].Vm) / 2).toFixed(3)}$ mV. Everything that does not reverse with $B$ — the contacts’ offset, its drift over half a minute, magnetoresistance — cancels.` },
      { label: 'Fit', text: t`A line through the six half-differences against $B$ has slope $${pmT(EX.fit.b, EX.fit.sb)}$ mV/T and an intercept consistent with zero, $${pmT(EX.fit.a, EX.fit.sa)}$ mV.` },
      { label: 'Hall coefficient', text: t`$R_H = \text{slope}\times t/I = (${(EX.fit.b / 1000).toFixed(5)}\ \text{V/T})(1.00\times10^{-3}\ \text{m})/(0.0300\ \text{A}) = ${tex(Rr.value, 4)}\ \text{m}^3/\text{C}$. Its uncertainty is mostly Type B: 1 % each from the teslameter and the thickness: $R_H = (${resT(Rr)})\times10^{-3}\ \text{m}^3/\text{C}$.` },
      { label: 'Carriers', text: t`Negative: the carriers are electrons, as for n-type germanium. $n = 1/(e|R_H|) = ${tex(-1 / (Rr.value * E), 3)}\ \text{m}^{-3}$ — about one electron per $${tex(4.4e28 / (-1 / (Rr.value * E)), 2)}$ germanium atoms.` },
      { label: 'Mobility', text: t`$\mu_H = |R_H|/\rho = ${tex(-Rr.value, 4)}/${tex(RHO, 4)} = ${Rm.value.toFixed(3)}\ \text{m}^2/(\text{V s})$, i.e. $${(1e4 * Rm.value).toFixed(0)}\ \text{cm}^2/(\text{V s})$.` },
      { label: 'Compare', text: t`Tabulated electron mobility in *pure* germanium at 300 K is about $3900\ \text{cm}^2/(\text{V s})$. A doped sample scatters electrons off its impurities too, and the Hall mobility differs from the drift mobility by a factor of order one, so somewhat lower is expected — a sample property, not a constant to agree with.` },
      { label: 'One polarity', text: t`Had you stepped the field up from 0 to 0.30 T without reversing, the offset’s drift (it grew as the slab warmed) would have added a slope: $R_H = (${resT(Rs)})\times10^{-3}$, $z = ${zT(Rs.z)}$ against the sample’s true value.` },
    ],
    answer: t`$R_H = (${resT(Rr)})\times10^{-3}\ \text{m}^3/\text{C}$: electrons, $n = ${tex(-1 / (Rr.value * E), 3)}\ \text{m}^{-3}$, $\mu_H = ${resT(Rm)}\ \text{m}^2/(\text{V s})$ — below pure germanium’s 0.39, as a doped sample should be.`,
  },
  practice: [
    num({
      id: 'rh', difficulty: 2,
      gen(r) {
        const slope = -r.float(80, 260, 0.1), tt = r.pick([0.5, 0.8, 1.0, 1.5]), I = r.pick([10, 20, 30, 50]);
        const ans = (slope / 1000) * (tt * 1e-3) / (I * 1e-3);
        return {
          prompt: t`The Hall voltage against $B$ has slope $${slope}$ mV/T for a slab $${tt}$ mm thick carrying ${I} mA. What is $R_H$, in m³/C?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 0.32], y: [r6(slope * 0.34), 5], xlabel: 'B (T)', ylabel: 'Hall voltage (mV)', axesAt: 'edge', curves: [{ fn: `${slope}*x`, color: 'gold' }] }, caption: 'The fitted line: Hall voltage against field.' },
          answer: ans, units: 'm^3/C', tol: { rel: 0.005 },
          errors: [{ value: (slope / 1000) * (I * 1e-3) / (tt * 1e-3), feedback: t`Inverted: $V_H = R_HIB/t$, so $R_H = \text{slope}\times t/I$.` }, { value: slope * (tt * 1e-3) / (I * 1e-3), feedback: 'Convert the slope to V/T first.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * Math.abs(ans)),
          hints: [t`$V_H = R_H IB/t$, so the slope $dV_H/dB = R_H I/t$.`, t`$R_H = \text{slope}\times t/I$ in SI units: V/T, m, A.`],
          teach: 'The Hall coefficient is the slope of $V_H$ against B, times thickness, divided by current.',
          explain: t`$R_H = (${(slope / 1000).toFixed(4)})(${tt}\times10^{-3})/(${I}\times10^{-3}) = ${tex(ans, 4)}\ \text{m}^3/\text{C}$ — negative: electrons.`,
        };
      },
    }),
    num({
      id: 'density', difficulty: 2,
      gen(r) {
        const R = r.float(1.5, 12, 0.01) * 1e-3 * r.sign();
        const ans = 1 / (E * Math.abs(R));
        return {
          prompt: t`A Hall coefficient of $R_H = ${tex(R, 3)}\ \text{m}^3/\text{C}$: what is the carrier density, in m⁻³? (And are the carriers electrons or holes? Decide, but enter only $n$.)`,
          visual: slabPic('The slab seen along B: the current, and the magnetic force that pushes the carriers toward one contact — the same edge for electrons and holes, so the sign of the voltage tells them apart. Schematic.'),
          answer: ans, units: 'm^-3', tol: { rel: 0.005 },
          errors: [{ value: Math.abs(R) / E, feedback: t`$R_H = 1/(nq)$: $n = 1/(e|R_H|)$.` }, { value: 1 / Math.abs(R), feedback: 'Divide by the carrier charge too.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$n = 1/(|q|\,|R_H|)$ with $|q| = e$.`],
          teach: 'The Hall coefficient counts carriers: n = 1/(e|$R_H$|); its sign names them.',
          explain: t`$n = 1/(1.602\times10^{-19} \times ${tex(Math.abs(R), 3)}) = ${tex(ans, 3)}\ \text{m}^{-3}$; ${R < 0 ? 'negative $R_H$: electrons (n-type).' : 'positive $R_H$: holes (p-type).'}`,
        };
      },
    }),
    num({
      id: 'half-diff', difficulty: 1,
      gen(r) {
        const VH = -r.float(10, 50, 0.001), V0 = r.float(4, 15, 0.001);
        const Vp = +(VH + V0).toFixed(3), Vm = +(-VH + V0).toFixed(3);
        const ans = (Vp - Vm) / 2;
        return {
          prompt: t`At $+B$ the voltage across the slab reads $${Vp}$ mV; with the field reversed, $${Vm}$ mV. What is the Hall voltage at $+B$, in mV?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1, 2], y: [r6(Math.min(Vp, Vm) - 8), r6(Math.max(Vp, Vm) + 8)], xlabel: '', ylabel: 'V (mV)', xticks: 0, axesAt: 'edge', points: [{ x: 0, y: Vp, r: 6, color: 'accent', label: '+B' }, { x: 1, y: Vm, r: 6, color: 'violet', label: '−B' }], hlines: [{ y: 0, color: 'ink3' }] }, caption: 'The two readings; the offset is common to both, the Hall voltage changes sign.' },
          answer: ans, units: 'mV', tol: { rel: 0.002 },
          errors: [{ value: (Vp + Vm) / 2, feedback: 'The half-sum is the offset — the part that does not reverse.' }, { value: Vp - Vm, feedback: 'Halve the difference: each reading contains $V_H$ once, with opposite signs.' }].filter((e) => Math.abs(e.value - ans) > 0.004 * Math.abs(ans)),
          hints: [t`$V(\pm B) = V_0 \pm V_H$.`],
          teach: 'Half the difference keeps what reverses with the field; half the sum is the offset.',
          explain: t`$V_H = (${Vp} - ${Vm})/2 = ${ans.toFixed(3)}$ mV, and the offset is $(${Vp} + ${Vm})/2 = ${((Vp + Vm) / 2).toFixed(3)}$ mV — here a large fraction of each raw reading.`,
        };
      },
    }),
    num({
      id: 'offset', difficulty: 3,
      gen(r) {
        const d = r.pick([0.05, 0.1, 0.2, 0.3]), rho = r.float(0.005, 0.03, 0.001), I = r.pick([10, 20, 30]);
        const ans = (I * 1e-3 * rho * (d * 1e-3)) / (H.w * H.t) * 1000;
        return {
          prompt: t`The two Hall contacts on a slab 10.0 mm wide and 1.00 mm thick are ${d} mm apart along the current direction. With resistivity $\rho = ${rho}\ \Omega\,\text{m}$ and $I = ${I}$ mA, how big is the offset voltage between them, in mV?`,
          visual: slabPic('Two contacts not exactly opposite: part of the voltage drop along the slab appears between them. Schematic.'),
          answer: ans, units: 'mV', tol: { rel: 0.01 },
          errors: [{ value: ans / 10, feedback: 'Check the area: the current flows through w × t = 10 mm × 1 mm.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: ['Along the slab the field is E = J ρ = Iρ/(wt).', 'The offset is that field times the contacts’ separation along the current.'],
          teach: 'Misaligned contacts see a slice of the ohmic drop: an offset ∝ I that reversing B leaves untouched.',
          explain: t`$E = I\rho/(wt) = ${tex((I * 1e-3 * rho) / (H.w * H.t), 3)}$ V/m; over ${d} mm that is $${ans.toFixed(2)}$ mV — comparable to the Hall voltage itself. Reversing the current flips both, so only reversing $B$ separates them.`,
        };
      },
    }),
    mcq({
      id: 'drift', difficulty: 3,
      prompt: t`The field was stepped up from 0 to 0.30 T over 12 minutes without reversal, while the offset drifted up by 0.2 mV per minute. Why does the fit of $V$ against $B$ give a slope about 5 % too small in magnitude?`,
      visual: rig('hall', { seed: 3, analysis: 'single' }, t`One polarity: raw readings in time order (top), $V$ against $B$ with its fit and residuals. ${SIMNOTE}`),
      choices: ['B rose steadily with time, so the drift — linear in time — is linear in B too, and adds a positive slope to the negative Hall slope', 'The drift adds random scatter that weakens the slope', 'The offset is subtracted by the intercept, but the intercept is wrong', 'Magnetoresistance reduces the Hall voltage at high field'],
      answer: 0,
      why: {
        1: 'Random scatter would widen the uncertainty, not pull the slope one way.',
        2: 'A constant offset goes into the intercept harmlessly; a drift that grows with B does not.',
        3: 'Magnetoresistance changes the offset (even in B) and bends the line slightly, but the 5 % comes from the drift.',
      },
      hints: ['If time and field rise together, what does the fit see a time drift as?', '0.2 mV per minute, 2 minutes per 0.05 T step: how many mV per tesla is that?'],
      teach: 'A drift aligned with the order of the settings is indistinguishable from a slope — reverse, randomize, or monitor.',
      explain: t`0.2 mV/min × 2 min per 0.05 T = 8 mV/T, against a Hall slope of about −156 mV/T: about 5 %. Reversing at each step measures $\pm B$ half a minute apart, so the drift between them is tiny and cancels in the half-difference.`,
    }),
    num({
      id: 'mobility', difficulty: 2,
      gen(r) {
        const R = -r.float(2, 9, 0.01) * 1e-3, rho = r.float(0.008, 0.04, 0.0001);
        const ans = Math.abs(R) / rho;
        return {
          prompt: t`A sample has $R_H = ${tex(R, 3)}\ \text{m}^3/\text{C}$ and resistivity $\rho = ${rho}\ \Omega\,\text{m}$. What is its Hall mobility $\mu_H = |R_H|/\rho$, in m²/(V s)?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 0.5], y: [0, 1.2], xlabel: 'mobility (m²/(V s))', ylabel: '', yticks: 0, axesAt: 'edge', vlines: [{ x: 0.39, color: 'good', label: 'pure Ge electrons' }, { x: 0.14, color: 'ink3', label: 'pure Si electrons' }] }, caption: 'Tabulated electron mobilities at 300 K for pure germanium and silicon, for scale.' },
          answer: ans, units: 'm^2/(V s)', tol: { rel: 0.005 },
          errors: [{ value: rho / Math.abs(R), feedback: 'Inverted: $\\mu = |R_H|/\\rho = |R_H|\\sigma$.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\sigma = 1/\rho = ne\mu$ and $|R_H| = 1/(ne)$, so $|R_H|\sigma = \mu$.`],
          teach: 'Hall coefficient times conductivity is the mobility: how fast carriers drift per volt per metre.',
          explain: t`$\mu_H = ${tex(Math.abs(R), 3)}/${rho} = ${ans.toFixed(3)}\ \text{m}^2/(\text{V s}) = ${(1e4 * ans).toFixed(0)}\ \text{cm}^2/(\text{V s})$.`,
        };
      },
    }),
    code({
      id: 'hall-fit', difficulty: 3,
      prompt: t`The readings below alternate $+B$ and $-B$ (each row: field in T, voltage in mV). Form the half-differences \`B_H\` (the mean $|B|$ of each pair) and \`V_H\` (mV), fit a line with \`np.polyfit\`, and compute \`R_H\` (m³/C) and the carrier density \`n\` (m⁻³, positive). $I = 30.0$ mA, $t = 1.00$ mm.`,
      starter: t`import numpy as np

data = np.array(${JSON.stringify(CRD)})   # [B (T), V (mV)], +B then -B
I, t = 30.0e-3, 1.00e-3
e = 1.602176634e-19

# your code: half-differences, the slope, R_H and n
R_H, n = 0.0, 0.0
print(f"R_H = {R_H:.4e} m^3/C, n = {n:.3e} m^-3")`,
      answer: t`import numpy as np

data = np.array(${JSON.stringify(CRD)})   # [B (T), V (mV)], +B then -B
I, t = 30.0e-3, 1.00e-3
e = 1.602176634e-19

plus, minus = data[0::2], data[1::2]
B_H = (plus[:, 0] - minus[:, 0]) / 2
V_H = (plus[:, 1] - minus[:, 1]) / 2
slope, intercept = np.polyfit(B_H, V_H, 1)
R_H = slope * 1e-3 * t / I
n = 1 / (e * abs(R_H))
print(f"R_H = {R_H:.4e} m^3/C, n = {n:.3e} m^-3")`,
      tests: [
        { name: 'the half-differences remove the offset (checked at 0.15 T)', code: `abs(V_H[2] - ${CY[2]}) < 1e-9` },
        { name: t`$R_H$ matches the reference fit, $${tex(CRH, 4)}$ m³/C`, code: `abs(R_H / ${CRH} - 1) < 1e-9` },
        { name: t`$n$ is positive and matches, $${tex(CN, 4)}$ m⁻³`, code: `abs(n / ${CN} - 1) < 1e-9` },
      ],
      hints: [t`\`plus, minus = data[0::2], data[1::2]\`; then \`V_H = (plus[:, 1] - minus[:, 1]) / 2\` and the same for $B$.`, t`\`slope, intercept = np.polyfit(B_H, V_H, 1)\` in mV/T; \`R_H = slope * 1e-3 * t / I\`; \`n = 1/(e*abs(R_H))\`.`],
      teach: 'Pair the readings, keep what reverses, then fit: three lines of NumPy implement the reversal technique.',
      explain: t`$R_H = ${tex(CRH, 4)}\ \text{m}^3/\text{C}$ (negative: electrons), $n = ${tex(CN, 4)}\ \text{m}^{-3}$. With 1 % each on $B$ and $t$, the result is good to about 1.4 % — the teslameter and the calipers, not the voltmeter, set the uncertainty.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-copper', difficulty: 2,
      gen(r) {
        const tt = r.pick([10, 25, 50]), I = r.pick([1, 2, 5]), B = r.pick([0.5, 1.0]);
        const n = 8.49e28;
        const ans = (I * B) / (n * E * tt * 1e-6) * 1e6;
        return {
          prompt: t`A copper foil ${tt} μm thick carries ${I} A across a ${B} T field. Copper has $8.49\times10^{28}$ free electrons per m³. How big is the Hall voltage, in μV?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [19, 30], y: [-7, 2], xlabel: 'log₁₀ n (m⁻³)', ylabel: 'log₁₀ Hall voltage (V)', axesAt: 'edge', curves: [{ fn: `log10(${I}*${B}/(1.602e-19*${tt}e-6)) - x`, color: 'accent' }], vlines: [{ x: 21.08, color: 'ink3', label: 'doped Ge' }, { x: 28.93, color: 'gold', label: 'copper' }] }, caption: 'The Hall voltage falls as 1/n for this foil’s thickness, current and field (log–log axes).' },
          answer: ans, units: 'uV', tol: { rel: 0.01 },
          errors: [{ value: ans * 1e-3, feedback: 'Check the thickness: micrometres, not millimetres.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$V_H = IB/(net)$.`],
          teach: 'Metals have so many carriers that their Hall voltage is microvolts — measurable, but only with care over thermal EMFs.',
          explain: t`$V_H = ${I} \times ${B}/(8.49\times10^{28} \times 1.602\times10^{-19} \times ${tt}\times10^{-6}) = ${ans.toFixed(2)}\ \mu\text{V}$ — thousands of times smaller than in germanium, and comparable to thermoelectric voltages at the contacts. That is why practical Hall sensors are semiconductors.`,
        };
      },
    }),
    num({
      id: 'cp-wheel', difficulty: 3, transfer: true,
      gen(r) {
        const n = r.pick([2e22, 5e22, 1e23]), tt = r.pick([1, 2, 5]), I = r.pick([2, 5, 10]), B = r.pick([0.03, 0.05, 0.08]);
        const ans = (I * 1e-3 * B) / (n * E * tt * 1e-6) * 1000;
        return {
          prompt: t`The brushless motors of a spacecraft’s reaction wheels use Hall sensors to read the rotor’s position. A sensor element ${tt} μm thick with $n = ${tex(n, 1)}\ \text{m}^{-3}$ carries ${I} mA; the passing rotor magnet gives $B = ${B}$ T. What Hall voltage does it produce, in mV?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1], y: [-1.2, 1.2], xlabel: 'rotor angle (turns)', ylabel: 'Hall voltage (scaled)', axesAt: 'edge', curves: [{ fn: 'max(-1, min(1, 3*sin(2*pi*2*x)))', color: 'accent', samples: 800 }] }, caption: 'Schematic: the sensor’s output as the rotor’s magnets pass — the motor controller switches the coils on its sign.' },
          answer: ans, units: 'mV', tol: { rel: 0.01 },
          errors: [{ value: (I * 1e-3 * B) / (n * E * tt * 1e-3) * 1000, feedback: 'The thickness is in micrometres.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$V_H = IB/(net)$ with SI units throughout.`, 'Convert: mA to A, μm to m; the answer comes out in volts.'],
          teach: 'Thin, lightly doped elements give Hall voltages of millivolts from small fields — enough to switch a motor’s coils.',
          explain: t`$V_H = (${I}\times10^{-3})(${B})/(${tex(n, 1)} \times 1.602\times10^{-19} \times ${tt}\times10^{-6}) = ${ans.toFixed(2)}$ mV. Only its sign matters to the motor controller, so offsets and drifts that would ruin a measurement are tolerable there.`,
        };
      },
    }),
    mcq({
      id: 'cp-reverse-what', difficulty: 2,
      prompt: t`Which reversal removes the misaligned contacts’ offset from a Hall measurement?`,
      visual: slabPic('The slab, its current, its field and its two Hall contacts. Schematic.'),
      choices: ['Reversing B: the Hall voltage changes sign, the ohmic offset does not', 'Reversing I: the offset changes sign, the Hall voltage does not', 'Averaging many readings at the same B', 'Swapping the voltmeter leads'],
      answer: 0,
      why: {
        1: 'Both the offset (∝ I) and the Hall voltage (∝ IB) change sign with I; half the difference keeps both.',
        2: 'Averaging shrinks random noise; the offset is the same in every reading and survives any amount of averaging.',
        3: 'Swapping leads flips everything at once, including the Hall voltage.',
      },
      hints: ['Write each piece’s dependence on I and B: $V_H$ ∝ IB, offset ∝ I, thermoelectric ∝ neither.'],
      teach: 'Reverse the quantity that only the signal depends on oddly: here B.',
      explain: t`$V = R_HIB/t + I\rho\,\delta/(wt) + V_{\text{th}}$. Under $B \to -B$ only the first term flips, so $[V(B) - V(-B)]/2$ is the Hall voltage alone. Full four-way reversal ($\pm I$, $\pm B$) is the standard practice when thermal EMFs also matter.`,
    }),
  ],
  sources: [
    { label: 'S. M. Sze & K. K. Ng, Physics of Semiconductor Devices, 3rd ed. (Wiley, 2007): mobilities of Ge and Si', url: 'https://doi.org/10.1002/0470068329' },
    { label: 'ASTM F76: Standard Test Methods for Measuring Resistivity and Hall Coefficient in Single-Crystal Semiconductors', url: 'https://www.astm.org/f0076-08r16e01.html' },
    SRC.melissinos,
    SRC.gum,
  ],
});
