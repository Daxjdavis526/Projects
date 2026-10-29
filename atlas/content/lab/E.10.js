// Blackbody radiation — the lab view of the Stefan–Boltzmann law: a cavity
// source at a controlled temperature, a thermopile behind an aperture, and σ
// recovered from the slope of V against T⁴ − T₀⁴ with the geometry and the
// thermopile's responsivity. The room's own radiation (why ln V against ln T
// gives n > 4 and curved residuals), a thermocouple off the cavity floor
// (T⁴ multiplies a temperature error by four), a Type B budget dominated by
// the responsivity, Wien's law and why the detector must be broadband. A
// spacecraft radiator as the transfer. Theory: phys2710.MP1.1, phys3700.T7.4.
// Every number is computed here from the seeded model the labg-rig
// simulation draws with (_labg.js).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { G, rig, pmT, resT, f, tex, zT, SIMNOTE, SRC } from './_labg.js';
import { r6, table, dataGraph } from './_labf.js';
import { budget } from './_unc.js';

const t = String.raw;
const BB = G.BB;
const GF = G.bbG();                                   // m²
const KV = BB.S * BB.eps * GF;                         // V per (W m⁻²)

// ── the worked example: seed 4, thermocouple on the floor (no gradient) ──
const EX = G.run('blackbody', { seed: 4, flags: { gradient: false }, analysis: 'net' });
const EXs = EX.results[0];
const EXrel = EXs.sStat / EXs.value, EXB = G.bbTypeB();

// ── the code exercise: the same kind of run, printed and re-fitted from the printed numbers ──
const CD = G.run('blackbody', { seed: 9, flags: { gradient: false }, analysis: 'net' });
const CT = CD.rows.map((r) => r.Tr), CV = CD.rows.map((r) => +(1000 * r.V).toFixed(4)), CS = CD.rows.map((r) => +(1000 * r.sV).toFixed(4));
const CX = CT.map((T) => T ** 4 - BB.T0 ** 4);
const CF = G.fitLine(CX, CV, CS);
const CSIG = (CF.b / 1000) / KV, CSIGs = (CF.sb / 1000) / KV;

// Planck's curve, normalized to its peak, for a temperature T (x in μm)
const C2 = (G.K.h * G.K.c) / G.K.kB * 1e6;              // μm K
const planckPeak = (T) => { const x = (G.K.wien * 1e6) / T; return 1 / (x ** 5 * (Math.exp(C2 / (x * T)) - 1)); };
const planckFn = (T) => `1/(x^5*(exp(${r6(C2 / T)}/x) - 1))/${r6(planckPeak(T))}`;

export default lesson({
  id: 'lab.E.10',
  title: 'Blackbody radiation',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`A small hole in a heated cavity is the nearest thing to a black body a lab can build: light that enters is absorbed after many bounces, so what leaves is the cavity’s thermal radiation, $\sigma T^4$ per unit area ([the theory](#/lesson/phys2710.MP1.1); [its statistical mechanics](#/lesson/phys3700.T7.4)). A thermopile — a stack of thermocouples behind a blackened disc — turns the power that reaches it into a voltage. But **the thermopile radiates too**, at room temperature $T_0$, so it measures the *net* exchange. For small apertures facing each other on axis:

$$V = S\,\varepsilon\,\sigma\,\frac{A_sA_d}{\pi d^2}\,\bigl(T^4 - T_0^4\bigr)$$

Plot $V$ against $T^4 - T_0^4$: a straight line through the origin whose slope, divided by the known geometry and responsivity, is the Stefan–Boltzmann constant.`,
  symbols: [
    { tex: 'V', text: 'the thermopile’s output voltage, in V (millivolts here)' },
    { tex: 'S', text: 'the thermopile’s responsivity, in V/W, from its calibration certificate (±3 %)' },
    { tex: '\\varepsilon', text: 'the cavity’s effective emissivity: 0.99 here (a cavity, not a bare surface; a tungsten filament is about 0.3)' },
    { tex: '\\sigma', text: 'the Stefan–Boltzmann constant, $5.670\\,374\\,419\\times10^{-8}\\ \\text{W m}^{-2}\\,\\text{K}^{-4}$ (exact in the 2019 SI)' },
    { tex: 'A_s,\\ A_d', text: 'the areas of the cavity’s aperture and the thermopile’s aperture, in m² (10.0 mm and 5.0 mm across)' },
    { tex: 'd', text: 'the distance between the two apertures, in m (200 mm)' },
    { tex: 'T', text: 'the cavity’s temperature, in K, read by a thermocouple in its wall' },
    { tex: 'T_0', text: 'the room’s (and the thermopile’s) temperature, in K: 296 K here' },
  ],
  why: t`Every infrared instrument — a pyrometer on a rocket nozzle, a satellite’s Earth sensor, a spacecraft’s radiator design — rests on this law, and on knowing that a detector sees net exchange, not emission.`,
  visual: {
    type: 'labg-rig',
    title: 'The bench: a cavity blackbody and a thermopile',
    lead: t`Thirteen cavity temperatures from 400 to 1000 K. The top panel is the raw record: thermopile voltage against the temperature the thermocouple reads. Below, the analysis you choose, with its fit and residuals; the readout turns the slope into $\sigma$ (statistical and Type B uncertainty combined) and compares it with CODATA.`,
    tasks: [
      'Switch the analysis to ln V against ln T: the slope n comes out near 4.2 and χ²/ν near 100 — the residuals curve. That is the T₀⁴ term, not a failure of the T⁴ law.',
      'Back on V against T⁴ − T₀⁴, turn the thermocouple gradient on and off: a 2 % low reading of the temperature rise moves σ by about 5 %, well past its 3 % uncertainty.',
      'Press New run a few times: σ’s statistical part stays near 0.1 %. The uncertainty is almost all the thermopile’s calibration.',
    ],
    params: { exp: 'blackbody', seed: 2 },
    caption: t`Simulated thermopile readings with noise of $2\ \mu\text{V} + 0.2\,\%$ and a thermocouple read to $\pm 0.4$ K. Apparatus values are illustrative: $S = 25.0$ V/W, apertures 10.0 and 5.0 mm, $d = 200$ mm. ${SIMNOTE}`,
  },
  example: {
    prompt: t`A run with the thermocouple correctly seated gives, for $V$ (in mV) against $X = T^4 - T_0^4$ (in units of $10^{10}\ \text{K}^4$), a weighted slope $b = ${pmT(EX.fit.b, EX.fit.sb)}$ mV per $10^{10}\ \text{K}^4$ and an intercept $${pmT(EX.fit.a, EX.fit.sa)}$ mV, with $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$. Find $\sigma$ with its uncertainty and compare it with CODATA.`,
    visual: rig('blackbody', { seed: 4, flags: { gradient: false }, raw: false }, t`The run as analysed: $V$ against $T^4 - T_0^4$, the weighted line (gold) and the residuals. ${SIMNOTE}`),
    steps: [
      { label: 'The model', text: t`$V = K(T^4 - T_0^4)$ with $K = S\varepsilon\sigma G$ and the geometric factor $G = A_sA_d/(\pi d^2)$. The slope is $K$; everything but $\sigma$ in it is apparatus.` },
      { label: 'Geometry', text: t`$A_s = \pi(5.0\ \text{mm})^2 = ${tex(BB.As, 4)}\ \text{m}^2$, $A_d = ${tex(BB.Ad, 4)}\ \text{m}^2$, so $G = ${tex(BB.As, 4)} \times ${tex(BB.Ad, 4)}/(\pi \times 0.200^2) = ${tex(GF, 4)}\ \text{m}^2$.` },
      { label: 'Units of the slope', text: t`$b = ${f(EX.fit.b, 5)}$ mV per $10^{10}\ \text{K}^4$ is $${tex(EX.fit.b * 1e-13, 5)}$ V/K⁴.` },
      { label: 'Sigma', text: t`$\sigma = b/(S\varepsilon G) = ${tex(EX.fit.b * 1e-13, 5)}/(25.0 \times 0.99 \times ${tex(GF, 4)}) = ${tex(EXs.value, 5)}\ \text{W m}^{-2}\text{K}^{-4}$.` },
      { label: 'Statistical part', text: t`$\sigma_b/b = ${(100 * EXrel).toFixed(2)}\,\%$: thirteen readings of a large, clean signal pin the slope very well.` },
      { label: 'Type B part', text: t`The responsivity (3 %), the distance (0.5 mm in 200 mm, doubled because $d$ enters squared: 0.5 %), each aperture’s area (0.5 %) and the emissivity (0.5 %) add in quadrature to $${(100 * EXB).toFixed(1)}\,\%$. That is the uncertainty, almost all of it.` },
      { label: 'Compare', text: t`$\sigma = (${resT(EXs)})\times10^{-8}$ against CODATA’s $5.670\,374\times10^{-8}$: $z = ${zT(EXs.z, 2)}$. The intercept, $${pmT(EX.fit.a, EX.fit.sa)}$ mV, is consistent with zero, as the model says.` },
    ],
    answer: t`$\sigma = (${resT(EXs)})\times10^{-8}\ \text{W m}^{-2}\text{K}^{-4}$, $z = ${zT(EXs.z, 2)}$ against CODATA: agreement, with an uncertainty set by the thermopile’s calibration.`,
  },
  practice: [
    mcq({
      id: 'net', difficulty: 2,
      prompt: t`Why is the thermopile’s voltage proportional to $T^4 - T_0^4$ rather than to $T^4$?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [250, 1050], y: [-0.05, 1.1], xlabel: 'cavity temperature T (K)', ylabel: 'signal (scaled)', axesAt: 'edge', curves: [{ fn: '(x/1000)^4', color: 'ink3', dash: [6, 4], label: 'T⁴', labelAt: 900, labelDy: -14 }, { fn: '(x/1000)^4 - (296/1000)^4', color: 'accent', label: 'T⁴ − T₀⁴', labelAt: 700, labelDy: 14 }], vlines: [{ x: 296, color: 'gold', label: 'room' }] }, caption: 'The two candidate models, scaled to 1 at 1000 K. They differ most near room temperature, where the net signal goes to zero.' },
      choices: ['The thermopile itself radiates at room temperature, so it measures the net exchange of radiation with the cavity', 'Air between the apertures absorbs a fixed amount of the radiation', 'The thermocouple in the cavity wall reads the temperature difference from the room', 'The cavity is not a perfect black body, so its emission is reduced by a constant'],
      answer: 0,
      why: {
        1: 'Absorption by air would scale the signal by a factor (and is negligible over 20 cm in the infrared here); it would not subtract a constant.',
        2: 'Thermocouples do measure a difference, but the meter adds the cold-junction temperature back: the reading is the cavity’s absolute temperature.',
        3: 'An emissivity below 1 multiplies the signal by ε; it does not subtract anything.',
      },
      hints: ['What happens to the signal when the cavity is at exactly room temperature?'],
      teach: 'A radiation detector measures the net exchange between source and detector: σ(T⁴ − T₀⁴), never σT⁴ alone.',
      explain: t`At $T = T_0$ the cavity and the thermopile exchange equal and opposite powers and the signal is zero. A detector at temperature $T_0$ receives $\sigma T^4$ from the cavity’s aperture and sends back $\sigma T_0^4$: only the difference heats its junctions. Leaving out $T_0^4$ is the most common blunder in this experiment.`,
    }),
    num({
      id: 'local-n', difficulty: 3,
      gen(r) {
        const T = r.pick([350, 400, 450, 500, 600, 700]);
        const T0 = BB.T0;
        const ans = (4 * T ** 4) / (T ** 4 - T0 ** 4);
        return {
          prompt: t`If you plot $\ln V$ against $\ln T$ for $V \propto T^4 - T_0^4$ with $T_0 = ${T0}$ K, what is the local slope $d\ln V/d\ln T$ at $T = ${T} $ K? (A fit of a power law $V \propto T^n$ near there would return this $n$.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [300, 1050], y: [3.5, 9], xlabel: 'T (K)', ylabel: 'local slope n', axesAt: 'edge', curves: [{ fn: `4*x^4/(x^4 - ${T0}^4)`, color: 'accent', domain: [320, 1050] }], hlines: [{ y: 4, color: 'good', label: 'n = 4' }], vlines: [{ x: T, color: 'gold' }] }, caption: 'The local slope of ln V against ln T across the range, with the temperature asked about marked.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 4, feedback: t`4 is the slope of $\ln T^4$. The room’s term changes the curve: differentiate $\ln(T^4 - T_0^4)$, not $\ln T^4$.` }, { value: (4 * T ** 3 * T) / (T ** 4 + T0 ** 4), feedback: 'Sign slip: the room term is subtracted, so the denominator is T⁴ − T₀⁴.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\dfrac{d\ln(T^4 - T_0^4)}{d\ln T} = T\,\dfrac{d}{dT}\ln(T^4 - T_0^4)$.`, t`That is $T \times \dfrac{4T^3}{T^4 - T_0^4} = \dfrac{4T^4}{T^4 - T_0^4}$.`],
          teach: t`Near room temperature the net signal falls to zero, so a power-law fit of $\ln V$ against $\ln T$ returns an exponent above 4 that changes along the range.`,
          explain: t`$n = 4T^4/(T^4 - T_0^4) = 4 \times ${T}^4/(${T}^4 - ${T0}^4) = ${ans.toFixed(3)}$. It falls toward 4 only when $T \gg T_0$: at 1000 K it is still $${(4e12 / (1e12 - T0 ** 4)).toFixed(3)}$. That is why the ln–ln fit in the Explore gives $n \approx 4.2$ with curved residuals.`,
        };
      },
    }),
    num({
      id: 'tbias', difficulty: 3,
      gen(r) {
        const fpc = r.pick([0.5, 1, 1.5, 2, 2.5, 3]);
        const fr = fpc / 100;
        const ans = 100 * ((1 - fr) ** -4 - 1);
        return {
          prompt: t`At high temperature, where $T_0^4$ is negligible, every cavity temperature is read ${fpc} % low. By what percentage is the inferred $\sigma$ too **high**?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [600, 1050], y: [0, 1.15], xlabel: 'T (K)', ylabel: 'V (scaled)', axesAt: 'edge', curves: [{ fn: '(x/1000)^4', color: 'accent', label: 'true T', labelAt: 980, labelDy: 14 }, { fn: `(x/(1000*(1 - ${fr})))^4`, color: 'warn', dash: [6, 4], label: 'plotted at the low reading', labelAt: 700, labelDy: -30 }] }, caption: 'The same voltages plotted against a temperature read too low: the curve looks steeper, so the fitted σ comes out too big.' },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: fpc, feedback: t`A temperature error enters as $T^4$: its effect on $\sigma$ is about four times as large.` }, { value: 4 * fpc, feedback: t`Close: $4\times$ is the linear estimate. Exactly, $\sigma \propto 1/T_{\text{read}}^4$, so the factor is $(1 - f)^{-4}$.` }].filter((e) => Math.abs(e.value - ans) > 0.012 * ans),
          hints: [t`$\sigma = V/(K'T^4)$: the voltage is fixed, the temperature you divide by is $(1 - f)T$.`, t`The factor is $(1 - f)^{-4}$; subtract 1 and express as a percentage.`],
          teach: 'Through T⁴, a fractional error in temperature becomes four times that in σ.',
          explain: t`$\sigma_{\text{inferred}}/\sigma = (1 - ${fr})^{-4} = ${(1 + ans / 100).toFixed(4)}$, so $${ans.toFixed(2)}\,\%$ high. Thermometry is the weak point of every Stefan–Boltzmann measurement — which is why the Explore’s 2 % gradient matters more than all the noise.`,
        };
      },
    }),
    num({
      id: 'budget', difficulty: 2,
      gen(r) {
        const uS = r.pick([2, 3, 4, 5]), d = r.pick([150, 200, 250, 300]);
        const ud = (2 * 0.5) / d * 100;
        const ans = Math.hypot(uS, ud, 0.5, 0.5, 0.5);
        return {
          prompt: t`The thermopile’s responsivity is known to ${uS} %, the distance $d = ${d}$ mm to $\pm 0.5$ mm, each aperture area to 0.5 % and the emissivity to 0.5 %. What is the combined Type B relative uncertainty of $\sigma$, in percent?`,
          visual: budget([{ label: 'responsivity S', u: uS }, { label: 'distance d (enters as d²)', u: ud }, { label: 'source aperture', u: 0.5 }, { label: 'detector aperture', u: 0.5 }, { label: 'emissivity', u: 0.5 }], { unit: '%', combined: false, caption: 'The Type B contributions, each drawn to scale as a relative uncertainty of σ.' }),
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: Math.hypot(uS, ud / 2, 0.5, 0.5, 0.5), feedback: t`$\sigma \propto d^2$, so a relative error in $d$ counts twice: $2 \times 0.5/${d}$.` }, { value: uS + ud + 1.5, feedback: 'Independent uncertainties add in quadrature, not linearly.' }].filter((e) => Math.abs(e.value - ans) > 0.012 * ans),
          hints: [t`$\sigma = Vd^2\pi/(S\varepsilon A_sA_d(T^4 - T_0^4))$: relative uncertainties of a product add in quadrature, a square doubling its term.`, t`The distance term is $2 \times 0.5/${d} = ${ud.toFixed(2)}\,\%$.`],
          teach: 'For a product of powers, relative uncertainties add in quadrature, each weighted by its power.',
          explain: t`$\sqrt{${uS}^2 + ${ud.toFixed(2)}^2 + 3 \times 0.5^2} = ${ans.toFixed(2)}\,\%$. The responsivity dominates: improving anything else barely moves the total. Calibrating the thermopile against a reference source would.`,
        };
      },
    }),
    num({
      id: 'wien', difficulty: 2,
      gen(r) {
        const T = r.pick([500, 600, 700, 800, 900, 1000, 1200]);
        const ans = (G.K.wien / T) * 1e6;
        return {
          prompt: t`At what wavelength does a cavity at ${T} K radiate most strongly (per unit wavelength)? Give it in μm.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0.3, 15], y: [0, 1.15], xlabel: 'wavelength (μm)', ylabel: 'spectral radiance (scaled)', axesAt: 'edge', curves: [{ fn: planckFn(T), color: 'accent', domain: [0.4, 15], samples: 800 }], vlines: [{ x: 1.1, color: 'warn', label: 'silicon stops' }] }, caption: t`Planck’s curve for the cavity, scaled to its own peak. A silicon photodiode responds only to the left of 1.1 μm.` },
          answer: ans, units: 'um', tol: { rel: 0.005 },
          errors: [{ value: (G.K.wien / (T - 273.15)) * 1e6, feedback: 'Wien’s law needs the absolute temperature in kelvin.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`Wien’s displacement law: $\lambda_{\max} = b/T$ with $b = 2.898\times10^{-3}$ m K.`],
          teach: 'Wien’s law puts the peak of a lab blackbody in the mid-infrared, far beyond what silicon can see.',
          explain: t`$\lambda_{\max} = 2.8978\times10^{-3}/${T} = ${tex(ans * 1e-6, 4)}$ m $= ${ans.toFixed(2)}\ \mu\text{m}$. A silicon detector would see only the far short-wavelength tail, a fraction that changes steeply with $T$ — useless for a total-power law. A thermopile’s blackened disc absorbs all wavelengths alike.`,
        };
      },
    }),
    code({
      id: 'fit-sigma', difficulty: 3,
      prompt: t`Fit the run below (thermocouple seated correctly). Make \`X\` $= T^4 - T_0^4$, fit $V = a + bX$ with weights, and turn the slope into \`sigma\` (W m⁻² K⁻⁴) with its statistical uncertainty \`s_sigma\`. Use \`np.polyfit\` — remember its \`w\` is $1/\sigma$, and \`cov='unscaled'\` keeps the stated error bars as they are.`,
      starter: t`import numpy as np

T  = np.array([${CT.join(', ')}])          # K, read by the thermocouple
V  = np.array([${CV.join(', ')}]) * 1e-3   # V
sV = np.array([${CS.join(', ')}]) * 1e-3   # V, one standard uncertainty each
T0 = ${BB.T0}                               # K
S, eps, d = ${BB.S}, ${BB.eps}, ${BB.d}      # V/W, -, m
As, Ad = np.pi * 0.005**2, np.pi * 0.0025**2 # m²

# your code: X, a weighted line, then sigma and s_sigma
sigma, s_sigma = 0.0, 0.0
print(f"sigma = {sigma:.4e} ± {s_sigma:.1e} W m^-2 K^-4 (statistical)")`,
      answer: t`import numpy as np

T  = np.array([${CT.join(', ')}])          # K, read by the thermocouple
V  = np.array([${CV.join(', ')}]) * 1e-3   # V
sV = np.array([${CS.join(', ')}]) * 1e-3   # V, one standard uncertainty each
T0 = ${BB.T0}                               # K
S, eps, d = ${BB.S}, ${BB.eps}, ${BB.d}      # V/W, -, m
As, Ad = np.pi * 0.005**2, np.pi * 0.0025**2 # m²

X = T**4 - T0**4
(b, a), cov = np.polyfit(X, V, 1, w=1/sV, cov='unscaled')
K = S * eps * As * Ad / (np.pi * d**2)
sigma = b / K
s_sigma = np.sqrt(cov[0, 0]) / K
print(f"sigma = {sigma:.4e} ± {s_sigma:.1e} W m^-2 K^-4 (statistical)")`,
      tests: [
        { name: t`$\sigma$ from the weighted slope matches the reference fit`, code: `abs(sigma / ${CSIG} - 1) < 2e-5` },
        { name: t`its statistical uncertainty uses the stated error bars (unscaled covariance)`, code: `abs(s_sigma / ${CSIGs} - 1) < 2e-3` },
        { name: 'the result is printed', code: '"sigma =" in _stdout' },
      ],
      hints: [t`\`X = T**4 - T0**4\`; \`(b, a), cov = np.polyfit(X, V, 1, w=1/sV, cov='unscaled')\` — the slope comes first.`, t`\`K = S * eps * As * Ad / (np.pi * d**2)\`; then \`sigma = b / K\` and \`s_sigma = np.sqrt(cov[0, 0]) / K\`.`],
      teach: 'The physics sits in the slope; the apparatus constants convert it — and their uncertainties, not the fit’s, usually dominate.',
      explain: t`The fit gives $\sigma = ${tex(CSIG, 5)}$ with a statistical $\pm ${tex(CSIGs, 2)}$ — about $${(100 * CSIGs / CSIG).toFixed(2)}\,\%$. Add the $${(100 * EXB).toFixed(1)}\,\%$ Type B budget and the result is $\sigma = (${pmT(CSIG * 1e8, Math.hypot(CSIGs, EXB * CSIG) * 1e8)})\times10^{-8}$, $z = ${((CSIG - G.K.sigma) / Math.hypot(CSIGs, EXB * CSIG)).toFixed(1)}$ against CODATA. Without \`cov='unscaled'\`, NumPy would rescale the covariance by $\chi^2/\nu$ ([the trap in A12.1](#/lesson/lab.A12.1)).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-z', difficulty: 2,
      gen(r) {
        const v = r.float(5.45, 5.95, 0.01), u = r.float(0.12, 0.25, 0.01);
        const ans = (v - 5.670374) / u;
        return {
          prompt: t`A lab group reports $\sigma = (${v.toFixed(2)} \pm ${u.toFixed(2)})\times10^{-8}\ \text{W m}^{-2}\text{K}^{-4}$ (standard uncertainty, all sources). How many standard uncertainties is it from the CODATA value $5.670\,374\times10^{-8}$? Give the signed $z$.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [5.0, 6.4], y: [0, 1], xlabel: 'σ (10⁻⁸ W m⁻² K⁻⁴)', ylabel: '', yticks: 0, axesAt: 'edge', curves: [{ param: [`${r6(v - u)} + ${r6(2 * u)}*t`, '0.5'], t: [0, 1], color: 'accent', width: 3 }], points: [{ x: v, y: 0.5, r: 5, color: 'accent', label: 'measured' }], vlines: [{ x: 5.670374, color: 'good', label: 'CODATA' }] }, caption: 'The result with its ±1σ bar, and the CODATA value.' },
          answer: ans, tol: { rel: 0, abs: 0.02 },
          errors: [{ value: -ans, feedback: 'Sign: z is (measured − accepted)/σ, positive when the measurement is high.' }].filter((e) => Math.abs(ans) > 0.05),
          hints: [t`$z = (\sigma_{\text{meas}} - \sigma_{\text{CODATA}})/u$.`],
          teach: 'Agreement is judged in standard uncertainties, not in percent.',
          explain: t`$z = (${v.toFixed(2)} - 5.6704)/${u.toFixed(2)} = ${ans.toFixed(2)}$. ${Math.abs(ans) < 2 ? 'Within 2σ: consistent.' : 'Beyond 2σ: look for a systematic — the thermometry first.'} The CODATA value has no uncertainty at all now: $\sigma$ is fixed by the exact $h$, $c$ and $k$ of the 2019 SI.`,
        };
      },
    }),
    num({
      id: 'cp-radiator', difficulty: 3, transfer: true,
      gen(r) {
        const A = r.pick([2, 4, 6, 8]), eps = r.pick([0.80, 0.85, 0.90]), T = r.pick([270, 290, 300, 310, 320]);
        const ans = eps * G.K.sigma * A * (T ** 4 - 3 ** 4);
        return {
          prompt: t`A spacecraft radiator panel of area $${A}\ \text{m}^2$ and emissivity ${eps} faces deep space (an effective sink at 3 K) from one side. At a panel temperature of ${T} K, how much heat does it reject, in W?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [200, 360], y: [0, 3.6], xlabel: 'panel temperature (K)', ylabel: 'rejected power (kW)', axesAt: 'edge', curves: [{ fn: `${eps}*5.670374e-8*${A}*(x^4 - 81)/1000`, color: 'accent' }], vlines: [{ x: T, color: 'gold' }] }, caption: 'Rejected heat against panel temperature for this panel (net exchange with a 3 K sink); the gold line marks the temperature asked about.' },
          answer: ans, units: 'W', tol: { rel: 0.01 },
          errors: [{ value: G.K.sigma * A * T ** 4, feedback: 'Include the emissivity: a real panel radiates εσT⁴.' }, { value: eps * G.K.sigma * A * (T ** 4 - BB.T0 ** 4), feedback: 'Space is the sink here, not a 296 K room.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: ['The same net-exchange law as the thermopile, with the sink at 3 K.', t`$P = \varepsilon\sigma A(T^4 - T_{\text{sink}}^4)$; the 3 K term is utterly negligible.`],
          teach: t`A radiator’s rejected heat is $\varepsilon\sigma A(T^4 - T_{\text{sink}}^4)$: the $T^4$ that makes thermometry critical in the lab makes radiators shrink fast as they run hotter.`,
          explain: t`$P = ${eps} \times 5.670\times10^{-8} \times ${A} \times ${T}^4 = ${ans.toFixed(0)}$ W. Ten per cent hotter rejects $1.1^4 \approx 1.46$ times as much — the reason spacecraft radiators run as hot as their electronics allow.`,
        };
      },
    }),
    mcq({
      id: 'cp-loglog', difficulty: 3,
      prompt: t`A student fits $\ln V$ against $\ln T$ from 400 to 1000 K and finds $n = 4.21 \pm 0.004$ with $\chi^2/\nu \approx 100$ and residuals shaped like a smile. What should the report conclude?`,
      visual: rig('blackbody', { seed: 3, analysis: 'loglog', raw: false }, t`The student’s fit: $\ln V$ against $\ln T$ with its residuals. ${SIMNOTE}`),
      choices: ['The model is wrong, not the law: V ∝ T⁴ − T₀⁴ is not a power law; refit V against T⁴ − T₀⁴', 'The Stefan–Boltzmann exponent is 4.21 ± 0.004 for this cavity', 'The error bars are 10 times too small; inflate them until χ²/ν = 1', 'Drop the lowest temperatures until the residuals look flat, and quote n from the rest'],
      answer: 0,
      why: {
        1: 'A tiny uncertainty on a wrong model is not a measurement: χ²/ν ≈ 100 and structured residuals say the model does not describe the data.',
        2: 'Inflating error bars hides a model failure; it does not fix it (see residual analysis, A6.2).',
        3: 'Cutting data until it agrees is choosing the answer. The curvature is real and explained by the room term.',
      },
      hints: ['What does a smooth pattern in the residuals mean, as opposed to random scatter?', t`Compute $d\ln(T^4 - T_0^4)/d\ln T$ at 400 K and at 1000 K.`],
      teach: 'Structured residuals and a huge χ²/ν mean the fitted model is wrong — here, a power law forced onto T⁴ − T₀⁴.',
      explain: t`The local slope of $\ln(T^4 - T_0^4)$ runs from about 5.7 at 400 K to 4.03 at 1000 K, so no single $n$ fits and the weighted fit settles near 4.2. Refitting against $T^4 - T_0^4$ gives a straight line with flat residuals and $\sigma$ consistent with CODATA.`,
    }),
  ],
  sources: [
    SRC.codata,
    SRC.melissinos,
    { label: 'R. Siegel & J. R. Howell, Thermal Radiation Heat Transfer (cavity emissivity, view factors between small apertures)', url: 'https://www.routledge.com/Thermal-Radiation-Heat-Transfer/Howell-Menguc-Daun-Siegel/p/book/9780367347079' },
    SRC.gum,
  ],
});
