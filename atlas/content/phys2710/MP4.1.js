// The photoelectric effect, in full — the three ways a classical wave fails,
// the current–voltage curve of a phototube, Millikan’s straight line
// eV₀ = hf − φ fitted by least squares for h/e, work functions, and the
// one-photon–one-electron accounting of photocathodes and photodiodes.
// Builds on phys2220.Q1.1 without repeating its examples. Every number is
// computed here or in model/qm-photoelectric.js.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt, tex } from '../../src/core/format.js';
import { C, QE, H, H_EVS, HC_EVNM } from './_constants.js';
import { seg, label, frame, r6 } from './_diagrams.js';
import { METALS } from '../../src/viz/model/qm-photoelectric.js';

const t = String.raw;
const PHI = (k) => METALS[k].phi;
const PHIT = (k) => METALS[k].phi.toFixed(2);
const eV = (nm) => HC_EVNM / nm;                     // photon energy, eV
const fHz = (nm) => C / (nm * 1e-9);                 // frequency, Hz
const F14 = 1e14;

/** A least-squares straight line y = m x + b, with the sums that make it. */
function fit(xs, ys) {
  const n = xs.length, xb = xs.reduce((a, b) => a + b) / n, yb = ys.reduce((a, b) => a + b) / n;
  const sxx = xs.reduce((s, x) => s + (x - xb) ** 2, 0), sxy = xs.reduce((s, x, i) => s + (x - xb) * (ys[i] - yb), 0);
  const m = sxy / sxx, b = yb - m * xb;
  const s2 = xs.reduce((s, x, i) => s + (ys[i] - m * x - b) ** 2, 0) / (n - 2);
  return { m, b, xb, yb, sxx, sxy, sm: Math.sqrt(s2 / sxx) };
}

// Millikan-style readings for a freshly scraped sodium surface (φ = 2.75 eV):
// stopping potentials at five mercury lines, already corrected for the
// contact potential, with a realistic ±0.01 V scatter. Simulated from the
// exact h, not Millikan's own numbers.
const NA_LINES = [435.83, 404.66, 365.02, 312.57, 253.65];
const NA_NOISE = [0.012, -0.008, 0.005, -0.011, 0.004];
const NA = NA_LINES.map((nm, i) => ({ nm, f: fHz(nm), V: +(eV(nm) - PHI('sodium') + NA_NOISE[i]).toFixed(2) }));
const NAF = fit(NA.map((p) => p.f), NA.map((p) => p.V));
const NA_F0 = -NAF.b / NAF.m;

// six readings for cesium (φ = 2.14 eV), for fitting by eye
const CS_LINES = [546.07, 435.83, 404.66, 365.02, 312.57, 253.65];
const CS_NOISE = [-0.01, 0.015, -0.006, 0.009, -0.012, 0.005];
const CS = CS_LINES.map((nm, i) => ({ f: fHz(nm) / F14, V: +(eV(nm) - PHI('cesium') + CS_NOISE[i]).toFixed(2) }));
const CSF = fit(CS.map((p) => p.f), CS.map((p) => p.V));
const CS_SLOPE = CSF.m * 10;                         // in units of 10⁻¹⁵ V s (f is in 10¹⁴ Hz)
const MISFIT = CS.map((p) => `(${p.V} - (0.1*s*${r6(p.f)} + b))^2`).join(' + ');

/** Stopping potential against frequency: data points and (optionally) a fitted line, in 10¹⁴ Hz and volts. */
function vfPlot({ pts = [], lines = [], extraPoints = [], x = [0, 13], y = [-3.2, 2.7], caption, arrows }) {
  return {
    type: 'graph',
    params: {
      x, y, aspect: 'wide', xlabel: 'frequency f (10¹⁴ Hz)', ylabel: 'V₀ (V)',
      curves: lines,
      points: [...pts.map(([f, V]) => ({ x: r6(f), y: r6(V), color: 'gold', r: 5 })), ...extraPoints],
      ...(arrows ? { arrows } : {}),
    },
    caption,
  };
}

/**
 * One photoelectron’s energy budget, schematic: the photon lifts an electron
 * from the top of the metal’s electrons by hf; φ of that is spent escaping;
 * what is left is its kinetic energy. Not to scale.
 */
function budget({ hf = 'hf', phi = 'φ', K = 'Kₘₐₓ = eV₀', caption } = {}) {
  return {
    type: 'graph',
    params: frame([-0.6, 7.6], [-2.4, 4.2], {
      aspect: 'wide',
      shade: [{ fn: '0', lower: '-2.3', from: -0.3, to: 3.1, color: 'accent', alpha: 0.18 }],
      curves: [seg(-0.3, 0, 3.1, 0, 'accent', 2.4), seg(3.1, 0, 3.1, 2, 'ink2', 2), seg(3.1, 2, 7.2, 2, 'ink2', 2, true)],
      arrows: [
        { from: [1.3, 0.05], to: [1.3, 3.3], color: 'gold' },
        { from: [1.4, 3.3], to: [5.9, 3.3], color: 'accent' },
        { from: [3.55, 0.08], to: [3.55, 1.92], color: 'violet' }, { from: [3.55, 1.92], to: [3.55, 0.08], color: 'violet' },
        { from: [6.4, 2.06], to: [6.4, 3.24], color: 'good' }, { from: [6.4, 3.24], to: [6.4, 2.06], color: 'good' },
      ],
      points: [
        label(1.4, -1.2, 'electrons in the metal', 'accent', 0, 0, 'center'), label(5.2, 2, 'vacuum level', 'ink2', 0, 12, 'center'),
        label(1.3, 1.7, hf, 'gold', -10, 0, 'right'), label(3.55, 1, phi, 'violet', 8, 0), label(6.4, 2.65, K, 'good', -8, 0, 'right'),
        label(3.7, 3.3, 'the electron escapes', 'accent', 0, -12, 'center'),
      ],
    }),
    caption: caption ?? 'One photoelectron’s energy budget: a photon gives an electron at the top of the metal’s electrons its whole energy hf; φ of it is spent escaping, and the rest leaves as kinetic energy. Schematic, not to scale.',
  };
}

/** The phototube with no graph and no numbers: a setting for a question. */
const bench = (metal, nm, caption) => ({ type: 'qm-photoelectric', params: { metal, lambda: nm, intensity: 55, V: 0, graph: false, controls: false, readout: false }, ...(caption ? { caption } : {}) });

/** Photons in, electrons out: the counting behind any photon detector. */
const counting = (P, nm, eta) => ({
  type: 'graph',
  params: frame([-0.4, 10.4], [-1.6, 2.4], {
    aspect: 'wide',
    curves: [
      { fn: '0.28*sin(2*pi*(x - 0.2)/0.42)', domain: [0.2, 3.1], color: 'bad', width: 2 },
      seg(3.6, -0.9, 3.6, 0.9, 'ink', 4), seg(4.1, -0.9, 4.1, 0.9, 'ink3', 2),
      seg(4.1, 0.9, 9.6, 0.9, 'ink2', 1.6), seg(9.6, 0.9, 9.6, -0.9, 'ink2', 1.6), seg(9.6, -0.9, 4.1, -0.9, 'ink2', 1.6),
    ],
    arrows: [{ from: [6.2, 0.9], to: [7.6, 0.9], color: 'accent' }],
    points: [
      label(1.65, 0.75, `${P} of ${nm} nm light`, 'bad', 0, -6, 'center'), label(3.85, -1.25, `detector, η = ${eta}`, 'ink', 0, 0, 'center'),
      label(6.9, 0.9, 'electrons: current I = ?', 'accent', 0, -14, 'center'), label(6.9, -0.2, 'one electron for each detected photon', 'ink3', 0, 0, 'center'),
    ],
  }),
  caption: 'Light on a photon detector: each photon either frees one electron or none. The quantum efficiency η is the fraction that do. Schematic.',
});

export default lesson({
  id: 'phys2710.MP4.1',
  title: 'The photoelectric effect',
  minutes: 14, difficulty: 3,
  intro: t`Ultraviolet light on a clean metal in a vacuum knocks electrons out of it. Measured carefully, the effect breaks the classical wave picture of light on **three counts**: the fastest electrons’ energy does not depend on how bright the light is; below a threshold frequency no electrons come out at all, however bright the light; and they come out at once, with no time to soak up energy. Einstein’s 1905 explanation — light delivers energy in quanta $hf$, one quantum to one electron — predicts a straight line,

$$eV_0 = K_{\max} = hf - \varphi$$

whose slope, plotted as $V_0$ against $f$, is $h/e$ for every metal. Robert Millikan, who set out to refute the photon, spent ten years measuring that line and in 1916 had $h$ to better than 1%.

> The first look was [The photoelectric effect](#/lesson/phys2220.Q1.1) in PHYS 2220. Here: the full current–voltage curve, and Millikan’s fit.`,
  symbols: [
    { tex: 'e', text: t`the elementary charge, $1.602\,176\,634\times10^{-19}$ C exactly — the charge each photoelectron carries` },
    { tex: 'V_0', text: 'the stopping potential: the retarding voltage that just stops the fastest electrons reaching the collector, in volts' },
    { tex: 'K_{\\max}', text: 'the kinetic energy of the fastest photoelectrons, in eV — numerically equal to $V_0$ in volts' },
    { tex: 'h', text: t`Planck’s constant, $6.626\,070\,15\times10^{-34}$ J s exactly; $h/e = 4.136\times10^{-15}$ V s is the slope of the line` },
    { tex: 'f', text: t`the light’s frequency, in Hz: $f = c/\lambda$, and each photon carries $hf = hc/\lambda$, with $hc = 1239.8$ eV nm` },
    { tex: '\\varphi', text: t`the work function: the least energy that frees an electron from the surface, in eV — ${PHIT('cesium')} eV for cesium, ${PHIT('sodium')} eV for sodium, ${PHIT('copper')} eV for copper` },
  ],
  why: 'The photoelectric line is the cleanest bench measurement of Planck’s constant, and its accounting — one photon, at most one electron — sets the sensitivity of every photomultiplier, camera sensor and photodiode, LIGO’s included.',
  visual: {
    type: 'qm-photoelectric',
    title: 'The current–voltage curve of a phototube',
    lead: t`Light frees electrons from the cathode; the retarding voltage $V$ on the collector turns back the slower ones. The graph is the current through the tube against $V$. For one colour, every brightness gives a curve that reaches zero at the **same** $V_0$; only a change of colour moves $V_0$.`,
    tasks: [
      'Sodium at 365 nm: drop the brightness from 60% to 15%. The saturation current falls to a quarter, but V₀ stays at 0.647 V — the first classical failure.',
      'Shorten the wavelength to 313 nm: V₀ rises to 1.21 V, up by exactly the extra photon energy divided by e.',
      'Choose 546 nm green light at 100%: no current at any voltage, because each photon carries less than sodium’s 2.75 eV — the second failure.',
    ],
    params: { metal: 'sodium', lambda: 365, intensity: 60, V: 0, panel: 'iv' },
  },
  example: {
    prompt: t`Millikan-style readings for a freshly scraped sodium surface: the stopping potentials, corrected for the contact potential, at five mercury-lamp lines — ${NA.map((p) => `${p.nm} nm: ${p.V.toFixed(2)} V`).join('; ')}. (The green 546.07 nm line gave no current at all.) Fit the best straight line of $V_0$ against $f$, and find $h$, the work function and the threshold frequency.`,
    visual: vfPlot({
      pts: NA.map((p) => [p.f / F14, p.V]),
      lines: [
        { fn: `${r6(NAF.m * F14)}*x + ${r6(NAF.b)}`, domain: [r6(NA_F0 / F14), 13], color: 'accent', width: 2.4 },
        { fn: `${r6(NAF.m * F14)}*x + ${r6(NAF.b)}`, domain: [0, r6(NA_F0 / F14)], color: 'accent', width: 1.4, dash: true },
      ],
      extraPoints: [{ x: r6(NA_F0 / F14), y: 0, color: 'accent', r: 4, label: 'threshold f₀', labelDx: -8, labelDy: -14, labelAlign: 'right' }, { x: 0, y: r6(NAF.b), color: 'violet', r: 4, label: 'intercept −φ/e', labelDx: 10, labelDy: 0 }],
      caption: 'The five readings (gold) and their least-squares line, extended (dashed) back to zero frequency. The readings are simulated from today’s h with a scatter of about 0.01 V, the precision Millikan reached; they are not his own numbers.',
    }),
    steps: [
      { label: 'Why a straight line', text: t`Divide Einstein’s equation by $e$: $\;V_0 = \dfrac{h}{e}\,f - \dfrac{\varphi}{e}$. So $V_0$ against $f$ is a line of slope $h/e$ and intercept $-\varphi/e$ — if light really comes in quanta.` },
      { label: 'Frequencies', text: t`$f = c/\lambda$ turns the lines into $f = ${NA.map((p) => fmt(p.f / F14, 4)).join(',\\ ')}$ in units of $10^{14}$ Hz. Their mean is $\bar f = ${fmt(NAF.xb / F14, 4)}\times10^{14}$ Hz, and the mean stopping potential is $\bar V = ${fmt(NAF.yb, 3)}$ V.` },
      { label: 'Least squares', text: t`The best line makes the sum of the squared misfits as small as possible. Its slope is
$$m = \frac{\sum (f_i - \bar f)(V_i - \bar V)}{\sum (f_i - \bar f)^2} = \frac{${tex(NAF.sxy, 4)}\ \text{V Hz}}{${tex(NAF.sxx, 4)}\ \text{Hz}^2} = ${tex(NAF.m, 4)}\ \text{V s}.$$` },
      { label: 'Planck’s constant', text: t`$h = e\,m = (1.602\times10^{-19}\ \text{C})(${tex(NAF.m, 4)}\ \text{V s}) = ${tex(NAF.m * QE, 4)}$ J s. The points scatter by about 0.01 V, which leaves the slope uncertain by about $${fmt(100 * NAF.sm / NAF.m, 1)}\%$ — so this agrees with the exact $6.626\times10^{-34}$ J s.` },
      { label: 'Work function and threshold', text: t`The intercept is $b = \bar V - m\bar f = ${fmt(NAF.b, 3)}$ V, so $\varphi = ${fmt(-NAF.b, 3)}$ eV. The line reaches $V_0 = 0$ at $f_0 = -b/m = ${tex(NA_F0, 3)}$ Hz, a threshold wavelength $c/f_0 = ${fmt(C / NA_F0 * 1e9, 3)}$ nm — which is why the 546 nm line freed nothing.` },
      { label: 'Sense check', text: t`Millikan’s own 1916 value was $h = 6.57\times10^{-34}$ J s, quoted to 0.5%; most of the remaining gap came from his slightly low value of $e$, which turns the measured slope $h/e$ into $h$. And the slope does not depend on the metal: $h/e$ belongs to light and the electron, not to sodium.` },
    ],
    answer: t`Slope $h/e = ${tex(NAF.m, 3)}$ V s, so $h = ${tex(NAF.m * QE, 3)}$ J s; $\varphi = ${fmt(-NAF.b, 3)}$ eV; $f_0 = ${tex(NA_F0, 3)}$ Hz ($\lambda_0 = ${fmt(C / NA_F0 * 1e9, 3)}$ nm).`,
  },
  practice: [
    match({
      id: 'three-failures', difficulty: 1,
      prompt: 'Each observation contradicts something the classical wave picture of light predicted. Match each to the prediction it overturns.',
      left: [
        'Below a threshold frequency no electrons come out, however bright the light.',
        t`The fastest electrons’ energy $K_{\max}$ does not change with brightness.`,
        'Electrons appear within nanoseconds of switching on even very dim light.',
      ],
      right: [
        'A bright enough wave of any colour should free electrons eventually',
        'A stronger wave should shake electrons harder and free faster ones',
        'A dim wave spreads its energy thin, so atoms need time to gather enough',
        'A light wave should not be able to free electrons from a metal at all',
      ],
      answer: [0, 1, 2],
      hints: ['For each observation, ask what a smooth wave — whose energy grows with its brightness and arrives continuously — would have done instead.'],
      teach: 'A classical wave’s energy grows with brightness and arrives continuously; photons make the energy given to each electron depend on frequency alone, delivered in one lump.',
      explain: t`Classically a brighter wave carries more energy, so it should eventually free electrons at any frequency and should free faster ones, while a dim wave should need time to deliver enough. Photons explain all three: each electron gets one photon’s $hf$, at once, and brightness only sets how many photons arrive. (Classical physics had no objection to light freeing electrons at all — the fourth option is a decoy.)`,
      visual: bench('sodium', 365, 'The phototube: light from the lamp frees electrons from the sodium cathode; those that cross to the collector carry the current.'),
    }),
    {
      type: 'slider', id: 'fit-by-eye', difficulty: 2,
      prompt: t`A cesium photocathode gives the six stopping potentials plotted in gold. Move the two sliders until the line runs through the points as well as you can: the readout under the graph is the sum of the squared misfits, which the best line makes smallest. The slope of your line is $h/e$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 13], y: [-3, 3], aspect: 'wide', xlabel: 'frequency f (10¹⁴ Hz)', ylabel: 'V₀ (V)',
          sliders: [
            { key: 's', label: 'Slope $h/e$', min: 2, max: 6, step: 0.01, value: 3, unit: '\\times10^{-15}\\,\\mathrm{V\\,s}', explain: 'The stopping potential gained per hertz, in units of $10^{-15}$ V s.' },
            { key: 'b', label: 'Intercept at $f = 0$', min: -4, max: 0, step: 0.01, value: -1, unit: '\\mathrm{V}', explain: 'Where the line would cross zero frequency: $-\\varphi/e$.' },
          ],
          curves: [{ fn: '0.1*s*x + b', color: 'accent', width: 2.4 }],
          points: CS.map((p) => ({ x: r6(p.f), y: p.V, color: 'gold', r: 5 })),
          readouts: [{ label: 'sum of squared misfits', expr: MISFIT, unit: '\\mathrm{V}^2', digits: 3 }],
        },
        caption: 'Simulated stopping potentials for cesium (φ = 2.14 eV) at six mercury lines, with a scatter of about 0.01 V. The line is V₀ = (slope) f + (intercept).',
      },
      param: 's', answer: [+(CS_SLOPE * 0.965).toFixed(2), +(CS_SLOPE * 1.035).toFixed(2)],
      instruction: 'Set the slope first, then slide the intercept until the misfit is smallest, and check.',
      hints: ['Pick the two points farthest apart and estimate rise over run: that gets the slope close.', t`The rise from about 0.13 V to 2.75 V happens over about $6.3\times10^{14}$ Hz, so the slope is near $4\times10^{-15}$ V s; now move the intercept until the misfit is smallest.`],
      teach: 'The slope of stopping potential against frequency is h/e; a least-squares fit is just the line with the smallest summed squared misfit.',
      explain: t`The least-squares line has slope $${fmt(CS_SLOPE, 3)}\times10^{-15}$ V s and intercept $${fmt(CSF.b, 3)}$ V, so $h = e \times \text{slope} = ${tex(CSF.m * 1e-14 * QE, 3)}$ J s and $\varphi \approx ${fmt(-CSF.b, 3)}$ eV. A fit by eye within a few per cent of the slope is a good fit.`,
    },
    num({
      id: 'photocurrent', difficulty: 2,
      gen(r) {
        const P = r.pick([0.5, 1, 2, 5]), nm = r.pick([365.02, 404.66, 435.83]), eta = r.pick([0.1, 0.2, 0.25, 0.3]);
        const N = (P * 1e-6) / (eV(nm) * QE), I = eta * N * QE;
        return {
          prompt: t`A ${P} μW beam of ${nm} nm light from a mercury lamp falls on a photomultiplier’s photocathode, whose quantum efficiency — the fraction of photons that free an electron — is ${eta}. What current of photoelectrons leaves the photocathode, in nA?`,
          answer: I * 1e9, units: 'nA', tol: { rel: 0.005 },
          errors: [{ value: N * QE * 1e9, feedback: t`That counts one electron for every photon. Only a fraction $\eta = ${eta}$ of them free an electron.` }],
          hints: [t`Photons per second: $N = P/(hc/\lambda)$, with $hc/\lambda = 1239.8/${nm}$ eV $= ${fmt(eV(nm), 4)}$ eV $= ${tex(eV(nm) * QE, 4)}$ J.`, t`Electrons per second $= \eta N$; the current is $I = \eta N e$.`],
          teach: t`Each photon frees at most one electron, so a photocurrent counts photons: $I = \eta e P/hf$.`,
          explain: t`$N = \dfrac{${tex(P * 1e-6, 2)}\ \text{W}}{${tex(eV(nm) * QE, 4)}\ \text{J}} = ${tex(N, 3)}$ photons per second, so $I = ${eta}\times${tex(N, 3)}\times1.602\times10^{-19}\ \text{C} = ${fmt(I * 1e9, 3)}$ nA. A photomultiplier then multiplies each electron a million times or so in its dynode chain — which is how single photons are counted.`,
          visual: bench('cesium', nm, `Light of ${nm} nm on the photocathode. Photons are drawn as dots, slowed enormously.`),
        };
      },
    }),
    num({
      id: 'threshold-from-v0', difficulty: 2,
      gen(r) {
        const metal = r.pick(['cesium', 'potassium', 'sodium']);
        const nm = r.pick([253.65, 312.57, 365.02, 404.66].filter((l) => eV(l) > PHI(metal) + 0.3));
        const V0 = +(eV(nm) - PHI(metal)).toFixed(2), phi = eV(nm) - V0, l0 = HC_EVNM / phi;
        return {
          prompt: t`Light of wavelength ${nm} nm gives a stopping potential of ${V0.toFixed(2)} V on a clean metal surface. What is the longest wavelength that can eject any electrons from this metal, in nm?`,
          answer: l0, units: 'nm', tol: { rel: 0.005 },
          errors: [
            { value: HC_EVNM / (eV(nm) + V0), feedback: t`The electron *spends* $\varphi$ to escape, so $\varphi = hc/\lambda - eV_0$: subtract the stopping potential, do not add it.` },
            { value: HC_EVNM / V0, feedback: t`$V_0$ measures the energy left over after escaping, not the work function. First find $\varphi = hc/\lambda - eV_0$.` },
          ],
          hints: [t`First the work function: $\varphi = \dfrac{hc}{\lambda} - eV_0 = \dfrac{1239.8}{${nm}}\ \text{eV} - ${V0.toFixed(2)}\ \text{eV}$.`, t`Then the threshold, where a photon has just $\varphi$: $\lambda_0 = hc/\varphi$.`],
          teach: 'One stopping potential at one known wavelength gives the work function, and the work function gives the threshold wavelength.',
          explain: t`$\varphi = ${fmt(eV(nm), 4)} - ${V0.toFixed(2)} = ${fmt(phi, 3)}$ eV — ${metal}’s work function — so $\lambda_0 = 1239.8/${fmt(phi, 3)} = ${fmt(l0, 4)}$ nm.`,
          visual: budget({ hf: `hf (${nm} nm)`, phi: 'φ = ?', K: `eV₀ = ${V0.toFixed(2)} eV` }),
        };
      },
    }),
    mcq({
      id: 'gradual', difficulty: 2,
      prompt: t`On the current–voltage curve the photocurrent falls *gradually* as the retarding voltage rises from 0 to $V_0$, instead of staying level and then dropping to zero all at once at $V_0$. Why?`,
      choices: [
        'The electrons leave with a spread of energies, from almost zero up to Kₘₐₓ, and the slower ones are turned back first',
        'The retarding voltage slows the photons, so fewer of them reach the cathode',
        'The light dims as the voltage rises',
        'Every electron loses energy gradually as it crosses the tube, whatever the voltage',
      ],
      answer: 0,
      why: {
        1: 'Photons carry no charge: an electric field does not slow them, and the same number arrive at every voltage.',
        2: 'The lamp is untouched by the tube’s voltage; the light is the same along the whole curve.',
        3: 'In a good vacuum nothing takes energy from the electrons except the retarding field itself.',
      },
      hints: [t`Only the *fastest* electrons have $K_{\max}$. Where did the others start inside the metal, and in which directions did they leave?`],
      teach: 'Kₘₐₓ is a maximum: electrons from deeper in the metal, or leaving at an angle, arrive with less, so a rising retarding voltage cuts the current a little at a time.',
      explain: t`Only electrons from the very top of the metal’s energy distribution, leaving straight toward the collector, have the full $K_{\max}$. The rest carry less, so each step up in $V$ turns back another slice of them; the last ones stop at $V_0 = K_{\max}/e$. That is why the stopping potential, not the shape of the curve, is the clean measurement.`,
      visual: { type: 'qm-photoelectric', params: { metal: 'sodium', lambda: 313, intensity: 70, V: 0.6, panel: 'iv', controls: false, readout: false }, caption: 'Sodium lit at 313 nm: the current against the retarding voltage. The gold point is the present voltage.' },
    }),
    mcq({
      id: 'contact-offset', difficulty: 3,
      prompt: t`Millikan’s collector and his sodium surface were different metals, so a contact potential added the same extra voltage — say 0.50 V — to every stopping potential he read. What does that do to his straight line of $V_0$ against $f$?`,
      choices: [
        t`It shifts the whole line up by 0.50 V: the slope, and so $h$, is untouched, but the intercept — and the work function read from it — needs correcting`,
        t`It changes the slope, so his value of $h$ comes out wrong`,
        t`Nothing: a constant voltage cannot affect a stopping potential`,
        t`It changes the slope and the intercept by the same factor`,
      ],
      answer: 0,
      why: {
        1: 'The slope is built from differences between readings, and a shift common to every reading cancels from each difference.',
        2: 'It does affect each reading — by 0.50 V — and so it moves the line, just not its slope.',
        3: 'A shift is added, not multiplied: adding a constant to every y-value cannot change a slope.',
      },
      hints: ['What happens to a straight line when the same constant is added to every y-value?', t`The slope uses only differences, $V_2 - V_1$, between points.`],
      teach: 'An offset common to every reading moves a straight line without tilting it: the slope survives, the intercept does not.',
      explain: t`Every point rises by the same 0.50 V, so each difference $V_2 - V_1$ — and the slope $h/e$ — is unchanged, while the intercept moves by 0.50 V. That is why the photoelectric slope is such a robust measurement of $h$, and why a work function read from the intercept needs the contact potential measured separately.`,
      visual: vfPlot({
        pts: NA.map((p) => [p.f / F14, p.V + 0.5]),
        lines: [{ fn: `${r6(NAF.m * F14)}*x + ${r6(NAF.b)}`, domain: [4, 13], color: 'ink3', width: 1.6, dash: true, label: 'without the offset', labelAt: 10.4, labelDx: 8, labelDy: 12 }, { fn: `${r6(NAF.m * F14)}*x + ${r6(NAF.b + 0.5)}`, domain: [4, 13], color: 'accent', width: 2.2, label: 'read', labelAt: 7, labelDx: -40, labelDy: -10 }],
        x: [4, 13], y: [-0.5, 3.2],
        caption: 'Readings with a common offset (gold) and the line they would give without it (dashed). Illustrative numbers.',
      }),
    }),
    mcq({
      id: 'double-f', difficulty: 2, kind: 'error',
      prompt: t`A student writes: “Doubling the frequency of the light doubles the maximum kinetic energy of the photoelectrons.” What is wrong?`,
      choices: [
        t`$K_{\max} = hf - \varphi$ grows in a straight line but is not proportional to $f$: doubling $f$ gives $2K_{\max} + \varphi$, more than double`,
        t`Nothing: $K_{\max}$ is proportional to $f$`,
        t`Doubling $f$ leaves $K_{\max}$ unchanged; only the number of electrons changes`,
        t`Doubling $f$ halves $K_{\max}$, because the wavelength halves`,
      ],
      answer: 0,
      why: {
        1: t`Proportional would mean a line through the origin, but Einstein’s line has intercept $-\varphi$: it starts below zero.`,
        2: 'That is what brightness does. Frequency sets each photon’s energy, and so each electron’s.',
        3: t`A shorter wavelength means *more* energy per photon, $hc/\lambda$, not less.`,
      },
      hints: [t`Write $K_{\max}$ at $f$ and at $2f$ and compare: $h(2f) - \varphi$ against $2(hf - \varphi)$.`],
      teach: 'Kₘₐₓ is linear in f with a negative intercept −φ, so it is not proportional to f.',
      explain: t`$K'_{\max} = 2hf - \varphi = 2(hf - \varphi) + \varphi = 2K_{\max} + \varphi$. For sodium lit at $8\times10^{14}$ Hz, $K_{\max} = ${fmt(H_EVS * 8e14 - 2.75, 2)}$ eV; at $16\times10^{14}$ Hz it is $${fmt(H_EVS * 16e14 - 2.75, 3)}$ eV — about seven times as much.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 17.5], y: [-3.2, 4.6], aspect: 'wide', xlabel: 'frequency f (10¹⁴ Hz)', ylabel: 'Kₘₐₓ (eV)',
          curves: [{ fn: `${r6(H_EVS * F14)}*x - 2.75`, domain: [r6(2.75 / (H_EVS * F14)), 17.5], color: 'accent', width: 2.4 }, { fn: `${r6(H_EVS * F14)}*x - 2.75`, domain: [0, r6(2.75 / (H_EVS * F14))], color: 'accent', width: 1.3, dash: true }],
          points: [{ x: 8, y: r6(H_EVS * 8e14 - 2.75), color: 'gold', r: 5, label: 'at f', labelDx: 8, labelDy: 14 }, { x: 16, y: r6(H_EVS * 16e14 - 2.75), color: 'gold', r: 5, label: 'at 2f', labelDx: -10, labelDy: -12, labelAlign: 'right' }],
        },
        caption: 'Einstein’s line for sodium (φ = 2.75 eV), extended dashed below threshold to its intercept −φ. The two gold points are at f and at 2f.',
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-photodiode', difficulty: 2, transfer: true,
      gen(r) {
        const P = r.pick([10, 20, 40, 50]), eta = 0.98;
        const I = (eta * (P * 1e-3) * 1064) / HC_EVNM;
        return {
          prompt: t`LIGO measures the light leaving its interferometer with photodiodes. In a photodiode an absorbed photon frees an electron *inside* the semiconductor rather than out of it, but the accounting is the photoelectric effect’s: one photon, at most one electron. A photodiode with quantum efficiency ${eta} at 1064 nm receives ${P} mW. What current does it give, in mA?`,
          answer: I * 1e3, units: 'mA', tol: { rel: 0.005 },
          errors: [{ value: (I / eta) * 1e3, feedback: 'Include the quantum efficiency: only 98% of the photons free an electron.' }],
          hints: [t`Photons per second: $N = P\lambda/hc$; the current is $I = \eta e N$.`, t`Together $I = \eta P\lambda/(hc/e)$, with $hc/e = 1239.8$ V nm, so $I = ${eta}\times(${P}\times10^{-3}\ \text{W})\times1064/1239.8$.`],
          teach: 'A photon detector’s current is ηe times the photon rate, so its responsivity is ηλ/(hc/e) amperes per watt.',
          explain: t`$I = ${eta}\times${tex(P * 1e-3, 2)}\times\dfrac{1064}{1239.8}\ \text{A} = ${fmt(I * 1e3, 3)}$ mA — a responsivity of $${fmt(eta * 1064 / HC_EVNM, 3)}$ A/W. Because the current is a count of photons, it fluctuates like any count, and that “shot noise” is one of the limits on LIGO’s sensitivity at high frequencies.`,
          visual: counting(`${P} mW`, 1064, eta),
        };
      },
    }),
    num({
      id: 'cp-threshold', difficulty: 3,
      gen(r) {
        const metal = r.pick(['potassium', 'sodium', 'cesium']);
        const m15 = +(H_EVS * 1e15 * (1 + r.pick([-0.006, 0.004, 0.008]))).toFixed(3);
        const b = +(PHI(metal) * (1 + r.pick([-0.01, 0.01]))).toFixed(2);
        const f0 = b / (m15 * 1e-15), l0 = (C / f0) * 1e9;
        return {
          prompt: t`A least-squares fit to stopping potentials from a ${metal} surface gives $V_0 = (${m15.toFixed(3)}\times10^{-15}\ \text{V s})\,f - ${b.toFixed(2)}\ \text{V}$. What threshold wavelength does the fit imply, in nm?`,
          answer: l0, units: 'nm', tol: { rel: 0.005 },
          hints: [t`The line reaches $V_0 = 0$ at the threshold frequency: $f_0 = \dfrac{${b.toFixed(2)}\ \text{V}}{${m15.toFixed(3)}\times10^{-15}\ \text{V s}}$.`, t`Then $\lambda_0 = c/f_0$.`],
          teach: 'The threshold is where the fitted line crosses zero stopping potential: f₀ = (φ/e)/(h/e).',
          explain: t`$f_0 = ${b.toFixed(2)}/(${m15.toFixed(3)}\times10^{-15}) = ${tex(f0, 4)}$ Hz, so $\lambda_0 = c/f_0 = ${fmt(l0, 4)}$ nm. Using the fitted slope rather than the exact $h/e$ keeps the answer consistent with the data.`,
          visual: vfPlot({
            lines: [{ fn: `${r6(m15 * 0.1)}*x - ${b}`, domain: [r6(f0 / F14), 13], color: 'accent', width: 2.4 }, { fn: `${r6(m15 * 0.1)}*x - ${b}`, domain: [0, r6(f0 / F14)], color: 'accent', width: 1.3, dash: true }],
            extraPoints: [{ x: r6(f0 / F14), y: 0, color: 'gold', r: 5, label: 'f₀ = ?', labelDx: -6, labelDy: -14, labelAlign: 'right' }],
            caption: 'The fitted line, extended dashed to zero frequency. The threshold is where it crosses V₀ = 0.',
          }),
        };
      },
    }),
    mcq({
      id: 'cp-same-slope', difficulty: 2,
      prompt: t`Plot $V_0$ against $f$ for cesium, sodium and zinc. Why do all three lines have the same slope?`,
      choices: [
        t`The slope is $h/e$: it is set by the photon’s energy $hf$ and the electron’s charge, which are the same whatever the metal`,
        'All three metals happen to have the same work function',
        'The slope is set by the light’s brightness, which was the same for all three',
        'The lines only look parallel; each metal’s slope depends on how tightly it holds its electrons',
      ],
      answer: 0,
      why: {
        1: 'Their work functions differ (2.14, 2.75 and 4.33 eV): that is why the lines are shifted apart.',
        2: 'Brightness changes how many electrons come out, not their energies, so it cannot appear in the slope.',
        3: 'How tightly a metal holds its electrons is the work function, which sets the intercept, not the slope.',
      },
      hints: [t`Divide $hf - \varphi = eV_0$ by $e$. Which term holds the metal’s property?`],
      teach: 'In V₀ = (h/e)f − φ/e the metal enters only through φ, so every metal gives the same slope h/e and its own intercept.',
      explain: t`$V_0 = (h/e)f - \varphi/e$: the slope $h/e = 4.136\times10^{-15}$ V s is universal, and each metal enters only through its intercept $-\varphi/e$. Finding the same slope for different metals was strong evidence that it measures a property of light itself.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 16], y: [-5, 3.2], aspect: 'wide', xlabel: 'frequency f (10¹⁴ Hz)', ylabel: 'V₀ (V)',
          curves: ['cesium', 'sodium', 'zinc'].flatMap((k, i) => {
            const f0 = PHI(k) / (H_EVS * F14), col = ['accent', 'gold', 'violet'][i], [at, dy] = [[8.5, -14], [12, 16], [14.5, 16]][i];
            return [{ fn: `${r6(H_EVS * F14)}*x - ${PHI(k)}`, domain: [r6(f0), 16], color: col, width: 2.4, label: METALS[k].label, labelAt: at, labelDx: 4, labelDy: dy },
              { fn: `${r6(H_EVS * F14)}*x - ${PHI(k)}`, domain: [0, r6(f0)], color: col, width: 1.2, dash: true }];
          }),
        },
        caption: 'Einstein’s lines for three metals, extended dashed below each threshold.',
      },
    }),
  ],
  sources: [
    { label: 'Einstein (1905), on a heuristic point of view concerning the production and transformation of light, Ann. Phys. 17, 132', url: 'https://doi.org/10.1002/andp.19053220607' },
    { label: 'Millikan (1916), A direct photoelectric determination of Planck’s “h”, Phys. Rev. 7, 355', url: 'https://doi.org/10.1103/PhysRev.7.355' },
    { label: 'OpenStax University Physics Vol. 3, §6.2 Photoelectric effect', url: 'https://openstax.org/books/university-physics-volume-3/pages/6-2-photoelectric-effect' },
    { label: 'Michaelson (1977), The work function of the elements and its periodicity, J. Appl. Phys. 48, 4729', url: 'https://doi.org/10.1063/1.323539' },
  ],
});
