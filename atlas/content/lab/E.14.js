// Pulsed NMR — the lab view: protons in a permanent magnet, the Larmor
// frequency, a free-induction decay after a 90° pulse, and the spin–lattice
// relaxation time T₁ by inversion recovery (180°–τ–90°). Three analyses of
// the same recovery curve: the null point (T₁ = τ₀/ln 2), a straight line in
// ln(M∞ − M) against τ, and a three-parameter fit. The systematic: a
// "180°" pulse that is really 160°, which biases the null point but only
// moves the semilog line's intercept — and the fit's k measures the pulse
// itself. Error bars through a logarithm, FID versus T₂, and a proton
// precession magnetometer as the transfer. Theory: phys4710.M7.1.
// Every number is computed here from the seeded model the labg-rig
// simulation draws with (_labg.js).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { G, rig, pmT, resT, f, tex, zT, SIMNOTE, SRC } from './_labg.js';
import { r6, table } from './_labf.js';

const t = String.raw;
const NM = G.NM;
const GPW = G.K.gpw;                                   // MHz/T, protons in water
const D2R = Math.PI / 180;

// ── the worked example: seed 3, a 160° "inversion" pulse ──
const EXn = G.run('nmr', { seed: 3, analysis: 'null' });
const EXs = G.run('nmr', { seed: 3, analysis: 'semilog' });
const EXf = G.run('nmr', { seed: 3, analysis: 'fit3' });
const T1n = EXn.results[0], T1s = EXs.results[0], ks = EXs.results[1], T1f = EXf.results[0];
const thetaK = (k) => Math.acos(1 - k) / D2R;

// ── the code exercise: seed 9, the 17 delays printed and fitted ──
const CR = G.run('nmr', { seed: 9, analysis: 'fit3' });
const CM = CR.M.map((v) => +v.toFixed(4));
const CF = G.lm((x, p) => p[0] * (1 - p[1] * Math.exp(-x / p[2])), NM.delays, CM, NM.delays.map(() => NM.sM), [1, 2, 30]);

const recPic = (k, T1, caption, extra = {}) => ({ type: 'graph', params: { aspect: 'wide', x: [0, 140], y: [-1.1, 1.15], xlabel: 'delay τ (ms)', ylabel: 'M / M∞', axesAt: 'edge', curves: [{ fn: `1 - ${r6(k)}*exp(-x/${r6(T1)})`, color: 'accent' }], hlines: [{ y: 0, color: 'ink3' }], ...extra }, caption });

export default lesson({
  id: 'lab.E.14',
  title: 'Pulsed NMR',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`Protons in a magnetic field $B$ precess at the Larmor frequency $f = \gamma B/2\pi$ — 42.58 MHz per tesla. A radio-frequency pulse at that frequency rotates their net magnetization ([the two-level picture](#/lesson/phys4710.M7.1)): a **90° pulse** tips it into the transverse plane, where it induces a decaying signal in a pick-up coil (the free-induction decay, FID); a **180° pulse** inverts it. After inversion the magnetization relaxes back toward equilibrium with the spin–lattice time $T_1$. Read it with a 90° pulse after a delay $\tau$, repeat for many delays, and you trace

$$M(\tau) = M_\infty\bigl(1 - k\,e^{-\tau/T_1}\bigr)$$

with $k = 2$ for a perfect inversion. **The pulse is set by hand**, so $k$ is rarely exactly 2 — and the analysis decides whether that matters.`,
  symbols: [
    { tex: 'M(\\tau)', text: 'the signal (the FID’s starting height, phase-corrected so it keeps its sign) after delay τ, in volts at the receiver' },
    { tex: 'M_\\infty', text: 'the fully recovered signal, read at a delay of many $T_1$' },
    { tex: 'k', text: 'the depth of the inversion: $1 - \\cos\\theta$ for a pulse of angle θ; 2 at 180°, 1.94 at 160°' },
    { tex: '\\tau', text: 'the delay between the inverting pulse and the 90° read pulse, in ms' },
    { tex: 'T_1', text: 'the spin–lattice relaxation time, in ms: how fast the spins give energy to their surroundings. It depends on the sample (viscosity, dissolved paramagnetic ions), not on a constant of nature' },
  ],
  why: t`T₁ and T₂ are the contrast in every MRI image, NMR magnetometers calibrate the Hall probes of other experiments, and inversion recovery is a model of a measurement whose nuisance parameter you fit rather than assume.`,
  visual: {
    type: 'labg-rig',
    title: 'The bench: inversion recovery of protons',
    lead: t`Seventeen delays from 1 to 130 ms, plus four readings at 300 ms for $M_\infty$. The top panel is the receiver’s output for one delay — a decaying beat whose starting height is $M(\tau)$. Below, the analysis you choose: the recovery curve with a three-parameter fit, the semilog line, or the null point.`,
    tasks: [
      'With the 160° pulse, compare the three analyses: the fit and the semilog line give T₁ near 32 ms; the null point comes out lower, about 31 ms on this seed — some 2σ low, and the bias does not average away.',
      'On the semilog view, read k from the intercept: about 1.95. That is the pulse angle measured from the data — cos θ = 1 − k, θ ≈ 160°.',
      'Turn the pulse error off: now all three agree, and k is 2. The null point is right only when the pulse is.',
    ],
    params: { exp: 'nmr', seed: 3, at: 4 },
    caption: t`Simulated phase-sensitive readings with noise of 0.012 $M_0$; $T_1 = 32$ ms (the simulation’s true value, a typical order of magnitude for a viscous sample). The FID is drawn off resonance with a dephasing time of 0.25 ms. ${SIMNOTE}`,
  },
  example: {
    prompt: t`The 17 delays were read after a pulse set “by eye”. The signal crosses zero between 20 and 25 ms, at $\tau_0 = ${EXn.tn.toFixed(2)}$ ms by linear interpolation. With $M_\infty = ${EXs.Minf.toFixed(3)} \pm ${EXs.sMinf.toFixed(3)}$ V from four long-delay readings, a weighted line of $\ln(M_\infty - M)$ against $\tau$ (for $\tau \le 100$ ms) has slope $${pmT(EXs.fit.b, EXs.fit.sb)}\ \text{ms}^{-1}$ and intercept $${pmT(EXs.fit.a, EXs.fit.sa)}$. Find $T_1$ both ways, and the pulse angle.`,
    visual: rig('nmr', { seed: 3, analysis: 'semilog', raw: false }, t`The semilog analysis: $\ln(M_\infty - M)$ against $\tau$, the weighted line and its residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Null point', text: t`$M = 0$ when $e^{-\tau_0/T_1} = 1/k$. Assuming $k = 2$: $T_1 = \tau_0/\ln 2 = ${EXn.tn.toFixed(2)}/0.6931 = ${T1n.value.toFixed(1)}$ ms.` },
      { label: 'Linearize', text: t`$M_\infty - M = kM_\infty e^{-\tau/T_1}$, so $\ln(M_\infty - M) = \ln(kM_\infty) - \tau/T_1$: a straight line whose slope is $-1/T_1$ — **whatever $k$ is**.` },
      { label: 'Semilog T1', text: t`$T_1 = -1/\text{slope} = 1/${(-EXs.fit.b).toFixed(5)} = ${T1s.value.toFixed(2)}$ ms, with $\sigma = \sigma_b/b^2 = ${T1s.sigma.toFixed(2)}$ ms.` },
      { label: 'The pulse', text: t`The intercept is $\ln(kM_\infty)$, so $k = e^{${EXs.fit.a.toFixed(4)}}/${EXs.Minf.toFixed(3)} = ${ks.value.toFixed(3)} \pm ${ks.sigma.toFixed(3)}$ — not 2. Then $\cos\theta = 1 - k$ gives $\theta = ${thetaK(ks.value).toFixed(0)}^\circ$.` },
      { label: 'Fix the null', text: t`With that $k$, $T_1 = \tau_0/\ln k = ${EXn.tn.toFixed(2)}/${Math.log(ks.value).toFixed(4)} = ${(EXn.tn / Math.log(ks.value)).toFixed(1)}$ ms — now consistent. The null point had silently assumed a perfect pulse.` },
      { label: 'Cross-check', text: t`A three-parameter fit of $M_\infty(1 - ke^{-\tau/T_1})$ to every reading gives $T_1 = ${resT(T1f)}$ ms and $k = ${resT(EXf.results[1])}$, agreeing with the semilog line.` },
    ],
    answer: t`$T_1 = ${resT(T1s)}$ ms (semilog; the fit agrees); the null point’s $${T1n.value.toFixed(1)}$ ms is biased by a $${thetaK(ks.value).toFixed(0)}^\circ$ pulse ($k = ${ks.value.toFixed(2)}$).`,
  },
  practice: [
    num({
      id: 'larmor', difficulty: 1,
      gen(r) {
        const B = r.pick([0.35, 0.47, 0.5, 1.0, 1.5, 3.0]);
        const ans = GPW * B;
        return {
          prompt: t`At what frequency do protons in water precess in a ${B} T field? ($\gamma/2\pi = 42.576$ MHz/T for protons in water.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 3.2], y: [0, 140], xlabel: 'B (T)', ylabel: 'f (MHz)', axesAt: 'edge', curves: [{ fn: `${GPW}*x`, color: 'accent' }], vlines: [{ x: B, color: 'gold' }] }, caption: 'The Larmor frequency is proportional to the field; the gold line marks this magnet.' },
          answer: ans, units: 'MHz', tol: { rel: 0.003 },
          errors: [{ value: 2 * Math.PI * ans, feedback: 'γ/2π already gives cycles per second (Hz): do not multiply by 2π.' }, { value: ans / (2 * Math.PI), feedback: 'The constant given is already γ/2π; just multiply by B.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$f = (\gamma/2\pi)\,B$.`],
          teach: 'Protons precess at 42.58 MHz per tesla: an NMR frequency is a field measurement.',
          explain: t`$f = 42.576 \times ${B} = ${ans.toFixed(2)}$ MHz${B === 3 ? ' — the frequency of a 3 T clinical MRI scanner' : B === 1.5 ? ' — a 1.5 T MRI scanner’s' : ''}. Pulsed teaching spectrometers with 0.5 T permanent magnets work near 21 MHz.`,
        };
      },
    }),
    num({
      id: 'null', difficulty: 2,
      gen(r) {
        const t0 = r.float(8, 60, 0.1);
        const ans = t0 / Math.LN2;
        return {
          prompt: t`After a perfect 180° pulse, the recovering signal passes through zero at $\tau_0 = ${t0}$ ms. What is $T_1$?`,
          visual: recPic(2, ans, 'The recovery after a perfect inversion; it crosses zero at the null point.', { x: [0, r6(4 * ans)] }),
          answer: ans, units: 'ms', tol: { rel: 0.003 },
          errors: [{ value: t0, feedback: t`The null is not at $T_1$: $1 - 2e^{-\tau/T_1} = 0$ at $\tau = T_1\ln 2$.` }, { value: t0 * Math.LN2, feedback: t`Inverted: $\tau_0 = T_1\ln 2$, so $T_1 = \tau_0/\ln 2$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`Set $1 - 2e^{-\tau_0/T_1} = 0$ and solve for $T_1$.`],
          teach: 'With a perfect inversion the signal is zero at τ = T₁ ln 2.',
          explain: t`$e^{-\tau_0/T_1} = 1/2$ gives $T_1 = \tau_0/\ln 2 = ${t0}/0.6931 = ${ans.toFixed(1)}$ ms. Fast and appealing — and exact only if the pulse is exactly 180°.`,
        };
      },
    }),
    num({
      id: 'bad-null', difficulty: 3,
      gen(r) {
        const th = r.pick([150, 155, 160, 165, 170]), T1 = r.float(20, 80, 0.5);
        const k = 1 - Math.cos(th * D2R);
        const t0 = +(T1 * Math.log(k)).toFixed(2);
        const ans = t0 / Math.log(k);
        return {
          prompt: t`The “inverting” pulse is really ${th}°. The signal crosses zero at $\tau_0 = ${t0}$ ms. What is $T_1$? (After a pulse of angle θ, $M(0) = M_\infty\cos\theta$.)`,
          visual: recPic(k, ans, t`The recovery after a ${th}° pulse: it starts above $-M_\infty$, so it reaches zero sooner.`, { x: [0, r6(3.5 * ans)], hlines: [{ y: 0, color: 'ink3' }, { y: -1, color: 'ink4' }] }),
          answer: ans, units: 'ms', tol: { rel: 0.003 },
          errors: [{ value: t0 / Math.LN2, feedback: t`That assumes $k = 2$. Here $k = 1 - \cos ${th}^\circ = ${k.toFixed(4)}$, so $T_1 = \tau_0/\ln k$.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$M(\tau) = M_\infty(1 - ke^{-\tau/T_1})$ with $k = 1 - \cos\theta$.`, t`Zero at $\tau_0 = T_1\ln k$.`],
          teach: 'An imperfect inversion moves the null point to T₁ ln(1 − cos θ): the null-point method needs the pulse angle.',
          explain: t`$k = 1 - \cos ${th}^\circ = ${k.toFixed(4)}$, $T_1 = ${t0}/\ln ${k.toFixed(4)} = ${ans.toFixed(1)}$ ms. The naive $\tau_0/\ln 2$ gives $${(t0 / Math.LN2).toFixed(1)}$ ms, ${(100 * (1 - Math.log(k) / Math.LN2)).toFixed(1)} % low.`,
        };
      },
    }),
    num({
      id: 'slope', difficulty: 2,
      gen(r) {
        const T1 = r.float(15, 90, 0.1), sb = r.float(0.008, 0.02, 0.001);
        const b = -1 / T1;
        const bb = +b.toPrecision(4), sbb = +(sb * Math.abs(bb)).toPrecision(2);
        const ans = -1 / bb;
        return {
          prompt: t`A weighted line of $\ln(M_\infty - M)$ against $\tau$ (in ms) has slope $${bb} \pm ${sbb}\ \text{ms}^{-1}$. What is $T_1$?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, r6(3 * ans)], y: [-3.5, 0.9], xlabel: 'τ (ms)', ylabel: 'ln(M∞ − M)', axesAt: 'edge', curves: [{ fn: `0.67 + (${bb})*x`, color: 'gold' }] }, caption: 'The semilog line: straight, with slope −1/T₁.' },
          answer: ans, units: 'ms', tol: { rel: 0.003 },
          errors: [{ value: -bb, feedback: 'The slope is −1/T₁: take the reciprocal.' }, { value: ans * Math.LN2, feedback: 'No ln 2 here: that belongs to the null-point method.' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$\ln(M_\infty - M) = \ln(kM_\infty) - \tau/T_1$.`],
          teach: 'In the semilog plot the slope is −1/T₁ and the pulse’s k hides in the intercept.',
          explain: t`$T_1 = -1/(${bb}) = ${ans.toFixed(1)}$ ms, with $\sigma = \sigma_b/b^2 = ${(sbb / bb ** 2).toFixed(1)}$ ms.`,
        };
      },
    }),
    num({
      id: 'log-bar', difficulty: 2,
      gen(r) {
        const Minf = r.float(0.95, 1.05, 0.001), M = r.float(0.2, 0.93, 0.01), sM = r.pick([0.008, 0.012, 0.02]);
        const ans = sM / (Minf - M);
        return {
          prompt: t`With $M_\infty = ${Minf}$ V and a reading $M = ${M}$ V, each with $\sigma = ${sM}$ V (ignore the uncertainty in $M_\infty$), what is the error bar on $y = \ln(M_\infty - M)$?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1], y: [0, 0.5], xlabel: 'M (V)', ylabel: 'σ of ln(M∞ − M)', axesAt: 'edge', curves: [{ fn: `${sM}/(${Minf} - x)`, color: 'accent', domain: [0, 0.99 * Minf] }], vlines: [{ x: M, color: 'gold' }] }, caption: 'The error bar on the logarithm grows without bound as M approaches M∞.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: sM, feedback: t`A logarithm turns an absolute error into a relative one: $\sigma_y = \sigma_M/(M_\infty - M)$.` }, { value: Math.log(sM), feedback: 'The error bar is σ divided by the quantity, not the log of σ.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$dy = dM/(M_\infty - M)$ for $y = \ln(M_\infty - M)$.`],
          teach: 'Through a logarithm, σ becomes σ divided by the quantity: points near M∞ carry huge error bars and must be weighted down — or left out.',
          explain: t`$\sigma_y = ${sM}/(${Minf} - ${M}) = ${ans.toFixed(4)}$. Late delays, where $M \to M_\infty$, have bars so large that an unweighted semilog fit would be dragged by noise — the reason the Explore’s line stops at 100 ms.`,
        };
      },
    }),
    mcq({
      id: 'why-robust', difficulty: 3,
      prompt: t`Why does the slope of $\ln(M_\infty - M)$ against $\tau$ give the right $T_1$ even when the inverting pulse is 160°, while the null point does not?`,
      visual: rig('nmr', { seed: 5, analysis: 'semilog', raw: false, residuals: false }, t`The semilog line from a run with a 160° pulse. ${SIMNOTE}`),
      choices: ['The pulse angle only scales M∞ − M by k, which shifts the line up or down without changing its slope; the null-point formula assumes k = 2', 'Taking logarithms reduces the noise', 'The semilog line uses more data points than the null point, so its errors average out', 'A 160° pulse changes T₁ itself, and only the semilog fit sees the new value'],
      answer: 0,
      why: {
        1: 'The logarithm does not reduce noise; it reshapes the error bars (larger near M∞).',
        2: 'More points shrink the random error, but the null-point bias is systematic — it would remain with any number of points.',
        3: 'T₁ is a property of the sample; the pulse only sets where recovery starts.',
      },
      hints: [t`Write $\ln(M_\infty - M)$ with $k$ in it.`, 'Which feature of a straight line does a multiplicative constant inside a logarithm change?'],
      teach: 'Choose an analysis in which the nuisance parameter separates from the one you want: here k lands in the intercept.',
      explain: t`$\ln(M_\infty - M) = \ln k + \ln M_\infty - \tau/T_1$: $k$ is only in the intercept. The null point uses $\tau_0 = T_1\ln k$ and assumes $\ln k = \ln 2$ — a 160° pulse makes that 3 % wrong in $\ln k$ and 4 % wrong in $T_1$.`,
    }),
    code({
      id: 'fit-t1', difficulty: 3,
      prompt: t`Fit $M(\tau) = M_\infty(1 - k\,e^{-\tau/T_1})$ to the 17 readings with \`scipy.optimize.curve_fit\`, each reading’s $\sigma = 0.012$ V and \`absolute_sigma=True\`. Set \`T1\`, \`k\` and \`sT1\` (the standard uncertainty of $T_1$). Start from a sensible guess: \`p0 = [1, 2, 30]\`.`,
      starter: t`import numpy as np
from scipy.optimize import curve_fit

tau = np.array([${NM.delays.join(', ')}], float)   # ms
M   = np.array([${CM.join(', ')}])   # V

def model(t, Minf, k, T1):
    return Minf * (1 - k * np.exp(-t / T1))

# your code: the fit
T1, k, sT1 = 0.0, 0.0, 0.0
print(f"T1 = {T1:.2f} ± {sT1:.2f} ms, k = {k:.3f}")`,
      answer: t`import numpy as np
from scipy.optimize import curve_fit

tau = np.array([${NM.delays.join(', ')}], float)   # ms
M   = np.array([${CM.join(', ')}])   # V

def model(t, Minf, k, T1):
    return Minf * (1 - k * np.exp(-t / T1))

popt, pcov = curve_fit(model, tau, M, p0=[1, 2, 30], sigma=np.full(tau.size, 0.012), absolute_sigma=True)
Minf, k, T1 = popt
sT1 = np.sqrt(pcov[2, 2])
print(f"T1 = {T1:.2f} ± {sT1:.2f} ms, k = {k:.3f}")`,
      tests: [
        { name: t`$T_1$ matches the reference fit, $${CF.p[2].toFixed(3)}$ ms`, code: `abs(T1 - ${CF.p[2]}) < 1e-3` },
        { name: t`$k$ matches, $${CF.p[1].toFixed(4)}$`, code: `abs(k - ${CF.p[1]}) < 1e-4` },
        { name: t`$\sigma_{T_1}$ uses the stated σ (absolute_sigma=True)`, code: `abs(sT1 - ${CF.sp[2]}) < 1e-3` },
      ],
      hints: [t`\`popt, pcov = curve_fit(model, tau, M, p0=[1, 2, 30], sigma=np.full(tau.size, 0.012), absolute_sigma=True)\`.`, t`\`Minf, k, T1 = popt\`; \`sT1 = np.sqrt(pcov[2, 2])\`.`],
      teach: 'Fit the nuisance parameter instead of assuming it: k comes out of the data, and T₁ stops depending on the pulse.',
      explain: t`$T_1 = ${CF.p[2].toFixed(2)} \pm ${CF.sp[2].toFixed(2)}$ ms and $k = ${CF.p[1].toFixed(3)}$: the pulse was about $${thetaK(CF.p[1]).toFixed(0)}^\circ$. Without \`absolute_sigma=True\`, curve_fit would rescale $\sigma_{T_1}$ by $\sqrt{\chi^2/\nu}$ ([the defaults that bite](#/lesson/lab.A12.1)).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-magnetometer', difficulty: 2, transfer: true,
      gen(r) {
        const fHz = r.int(1900, 2600);
        const ans = fHz / (GPW * 1e6) * 1e6;          // μT
        return {
          prompt: t`A proton precession magnetometer — the workhorse of geophysical surveys and magnetic observatories — polarizes a bottle of water, lets it precess in Earth’s field, and counts the frequency: ${fHz} Hz. What is the field’s magnitude, in μT?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 4], y: [-1.1, 1.1], xlabel: 't (ms)', ylabel: 'coil signal', axesAt: 'edge', curves: [{ fn: `exp(-x/2.5)*sin(2*pi*${fHz / 1000}*x)`, color: 'accent', samples: 1500 }] }, caption: 'The precession signal decaying in the pick-up coil; its frequency is what the instrument counts.' },
          answer: ans, units: 'uT', tol: { rel: 0.002 },
          errors: [{ value: fHz / GPW, feedback: 'Units: 42.576 MHz/T is 42.576 Hz per μT.' }, { value: (2 * Math.PI * fHz) / (GPW * 1e6) * 1e6, feedback: 'The frequency counted is f, not ω: B = f/(γ/2π).' }].filter((e) => Math.abs(e.value - ans) > 0.004 * ans),
          hints: [t`$B = f/(\gamma/2\pi)$, and $42.576\ \text{MHz/T} = 42.576\ \text{Hz}/\mu\text{T}$.`],
          teach: 'The Larmor frequency is a field measurement that needs no calibration but a constant of nature.',
          explain: t`$B = ${fHz}/42.576 = ${ans.toFixed(2)}\ \mu\text{T}$ — within Earth’s 25–65 μT range. Its accuracy rests on γ, known to parts in $10^8$, which is why NMR is the reference that calibrates Hall probes.`,
        };
      },
    }),
    mcq({
      id: 'cp-fid', difficulty: 3,
      prompt: t`In the Explore, the FID decays in about 0.25 ms, yet the sample’s $T_1$ is 32 ms and a spin echo shows its $T_2$ is tens of milliseconds. Why is the FID so short?`,
      visual: rig('nmr', { seed: 3, data: false, at: 2 }, t`The receiver’s output after the 90° read pulse. ${SIMNOTE}`),
      choices: ['The field is not uniform across the sample, so spins precess at slightly different rates and dephase (T₂*); an echo refocuses that', 'The 90° pulse is too short to tip all the spins', 'The protons’ magnetization relaxes back to the field within 0.25 ms', 'The receiver’s filter cuts the signal off'],
      answer: 0,
      why: {
        1: 'A mis-set pulse changes the FID’s starting height, not how fast it decays.',
        2: 'Return to equilibrium along the field is T₁ = 32 ms — a hundred times slower.',
        3: 'A filter would distort the beat, not impose a decay that an echo can undo.',
      },
      hints: ['What does a spin echo undo that an FID cannot?', 'If each proton feels a slightly different field, what happens to the sum of their signals?'],
      teach: 'An FID decays with T₂*, set by field inhomogeneity; the echo removes that part and reveals the true T₂.',
      explain: t`A spread $\Delta B$ across the sample gives a spread of Larmor frequencies $\gamma\Delta B/2\pi$; the signals fall out of step in a time of order $1/(\gamma\Delta B/2\pi)$ — 0.25 ms means a spread of about 4 kHz, or 0.1 mT in 0.5 T. A 180° pulse at $\tau$ reverses the phases and they line up again at $2\tau$: the Hahn echo, whose height decays only with the true $T_2$.`,
    }),
    mcq({
      id: 'cp-report', difficulty: 2,
      prompt: t`Your three analyses of one run give $T_1 = ${resT(T1n)}$ ms (null point, assuming $k = 2$), $${resT(T1s)}$ ms (semilog, with $k = ${resT(ks)}$), and $${resT(T1f)}$ ms (three-parameter fit). What should you report?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [30, 33], y: [0, 4], xlabel: 'T₁ (ms)', ylabel: '', yticks: 0, axesAt: 'edge', curves: [{ param: [`${r6(T1n.value - T1n.sigma)} + ${r6(2 * T1n.sigma)}*t`, '3'], t: [0, 1], color: 'warn', width: 3 }, { param: [`${r6(T1s.value - T1s.sigma)} + ${r6(2 * T1s.sigma)}*t`, '2'], t: [0, 1], color: 'accent', width: 3 }, { param: [`${r6(T1f.value - T1f.sigma)} + ${r6(2 * T1f.sigma)}*t`, '1'], t: [0, 1], color: 'accent', width: 3 }], points: [{ x: r6(T1n.value), y: 3, r: 5, color: 'warn', label: 'null point' }, { x: r6(T1s.value), y: 2, r: 5, color: 'accent', label: 'semilog' }, { x: r6(T1f.value), y: 1, r: 5, color: 'accent', label: 'three-parameter fit' }] }, caption: 'The three results with their ±1σ bars.' },
      choices: ['The fit (or semilog) value, noting that k ≈ 1.95 shows the null-point method was biased by the pulse', 'The weighted mean of all three', 'The null-point value, since it is the simplest and needs fewest assumptions', 'The mean of the three with their spread as the uncertainty'],
      answer: 0,
      why: {
        1: 'Averaging a biased result with unbiased ones just dilutes the bias into the answer.',
        2: 'The null point makes the strongest assumption of the three: that the pulse is exactly 180°. The data say it was not.',
        3: 'The spread mixes a known bias with random error; it is neither.',
      },
      hints: ['Which method’s assumption did the data themselves refute?'],
      teach: 'When the data measure a nuisance parameter and show an assumption is false, report the analysis that does not need it — and say why.',
      explain: t`$k = ${resT(ks)}$ is $${((2 - ks.value) / ks.sigma).toFixed(1)}\sigma$ from 2, so the null point’s assumption fails; corrected with that $k$ it agrees. Report $${resT(T1f)}$ ms and the pulse angle (about $${thetaK(ks.value).toFixed(0)}^\circ$) as a finding about the apparatus.`,
    }),
  ],
  sources: [
    SRC.codata,
    { label: 'E. Fukushima & S. B. W. Roeder, Experimental Pulse NMR: A Nuts and Bolts Approach (Addison-Wesley, 1981)', url: 'https://doi.org/10.1201/9780429500886' },
    { label: 'E. L. Hahn, Spin echoes, Phys. Rev. 80, 580 (1950)', url: 'https://doi.org/10.1103/PhysRev.80.580' },
    SRC.melissinos,
  ],
});
