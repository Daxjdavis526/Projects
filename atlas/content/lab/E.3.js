// The photoelectric effect and Planck's constant — the lab view of
// Millikan's 1916 test: stopping voltages for five mercury lines, a weighted
// straight line of V₀ against ν whose slope is h/e, and the systematic that
// lives in the intercept: the contact potential, which makes the intercept
// the anode's work function rather than the cathode's. Reading V₀ off a soft
// knee as a frequency-dependent bias that does reach the slope; intensity;
// Millikan's h and his e. A sunlit spacecraft charging up as the transfer.
// Every number is computed from the seeded model the labe-rig simulation
// draws with (_labe.js).
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, rigPlot, rigRaw, pmT, resT, tex, table, SIMNOTE, SRC } from './_labe.js';
import { compare } from '../phys2210/_lab.js';

const t = String.raw;
const P0 = M.EXPERIMENTS.photo.defaults;
const LINES = M.HG_LINES;
const nuOf = (lam) => M.K.c / (lam * 1e-9 * M.K.nAir);
const HE = M.K.he, H = M.K.h, e = M.K.e;

// ── the worked example: one reading per line, seed 5 ──
const EX = M.run('photo', { seed: 5 });
const EXhe = EX.results[0], EXphi = EX.results[1];
const EXh = { v: EXhe.value * e, s: EXhe.sigma * e };

// Millikan's e (1913) and h (1916, about 6.57×10⁻²⁷ erg s)
const E_MIL = (4.774e-10) / (10 * M.K.c);
const H_MIL = 6.57e-34;

export default lesson({
  id: 'lab.E.3',
  title: 'The photoelectric effect and Planck’s constant',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`Einstein’s 1905 photon picture predicts that the fastest electrons knocked out of a metal by light of frequency $\nu$ carry $h\nu - \phi$, so the reverse voltage $V_0$ that just stops them rises in a straight line with $\nu$, with slope $h/e$ for every metal. Millikan, who expected it to fail, spent ten years testing it, and in 1916 confirmed it and measured $h$. In the lab you isolate mercury lines with filters and read $V_0$ for each. **The slope is the physics; the intercept is not what it seems**: the electrons have to climb to the anode, so the contact potential between anode and cathode puts the anode’s work function in the intercept.`,
  equation: t`V_0 = \frac{h}{e}\,\nu - \frac{\phi_A}{e}`,
  symbols: [
    { tex: 'V_0', text: 'the stopping voltage, in V: the reverse voltage at which the photocurrent falls to zero' },
    { tex: 'h', text: 'Planck’s constant, $6.626\\,070\\,15\\times10^{-34}$ J s (exact since 2019)' },
    { tex: 'e', text: 'the elementary charge, $1.602\\,176\\,634\\times10^{-19}$ C (exact)' },
    { tex: 'h/e', text: 'the slope, $4.135\\,667\\,696\\times10^{-15}$ V s' },
    { tex: '\\nu', text: 'the light’s frequency, in Hz: $c/\\lambda$ with $\\lambda$ the vacuum wavelength (the tabulated air wavelength times 1.00028)' },
    { tex: '\\phi_A', text: 'the anode’s work function, in J (or eV, dividing by $e$): it, not the cathode’s, sets the intercept once the contact potential is counted' },
  ],
  why: t`Most precision measurements are slopes for exactly this reason — offsets nobody can calculate (contact potentials, cable delays, zero errors) end up in an intercept you are free to ignore.`,
  visual: {
    type: 'labe-rig',
    title: 'The bench: stopping voltages for the mercury lines',
    lead: t`Pick a line and take a reading: above, the photocurrent against the reverse voltage with the stopping voltage marked; below, $V_0$ against $\nu$ with the weighted fit. The readout turns the slope into $h/e$ and the intercept into a “work function”, and compares each with its true value.`,
    tasks: [
      'Turn off the contact potential: every point drops by 0.5 V, the slope does not change, and the intercept now gives the cathode’s 1.90 eV. With it on — as in every real tube — the intercept gives 1.40 eV, the anode’s.',
      'Clear the table and take five readings of the green and yellow lines only: the slope’s uncertainty grows several-fold. The UV line’s leverage matters.',
      'Run the series three more times: σ of h/e falls by about 2, as √4.',
    ],
    params: { exp: 'photo', seed: 1, residuals: true, expected: true },
    caption: t`Simulated stopping voltages, each read with $\sigma = 0.02$ V; cathode work function 1.90 eV and anode 1.40 eV (illustrative). Dashed green: the line with the cathode’s work function and the exact $h/e$. The current curves above are drawn, not computed: real tubes have a soft knee and a small reverse current. ${SIMNOTE}`,
  },
  example: {
    prompt: t`Stopping voltages for the five lines (air wavelengths from the NIST tables):

${table([[t`\lambda\ (\text{nm})`, ...EX.R.map((q) => q.lam.toFixed(1))], [t`\nu\ (10^{14}\ \text{Hz})`, ...EX.R.map((q) => (q.nu / 1e14).toFixed(4))], [t`V_0\ (\text{V})`, ...EX.R.map((q) => q.V.toFixed(3))]])}

Each $V_0$ has $\sigma = 0.020$ V. Find $h/e$ and $h$ with their uncertainties, and say what the intercept means.`,
    visual: rigPlot('photo', { seed: 5, expected: true }, t`The five stopping voltages against frequency, the fit (gold), and the line the cathode’s work function would give (dashed). ${SIMNOTE}`),
    steps: [
      { label: 'Frequencies', text: t`$\nu = c/\lambda_\text{vac}$ with $\lambda_\text{vac} = 1.00028\,\lambda_\text{air}$: the UV line at $365.015$ nm gives $${tex(EX.R[0].nu, 5)}$ Hz. (Ignoring air shifts $\nu$ by 0.03%, well below this experiment’s precision.)` },
      { label: 'Fit', text: t`Equal error bars, so the weighted fit is the ordinary one: slope $${pmT(EX.fit.b, EX.fit.sb)}$ V per $10^{14}$ Hz, intercept $${pmT(EX.fit.a, EX.fit.sa)}$ V, $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$ for 3 degrees of freedom.` },
      { label: 'h over e', text: t`$h/e = ${pmT(EXhe.value / 1e-15, EXhe.sigma / 1e-15)}\times10^{-15}$ V s. Its relative uncertainty, $${(100 * EXhe.sigma / EXhe.value).toFixed(1)}\%$, comes from five points of $\pm 0.02$ V over a 1.0 V span.` },
      { label: 'h', text: t`$e$ is exact, so $h = e \times (h/e) = (${pmT(EXh.v / 1e-34, EXh.s / 1e-34)})\times10^{-34}$ J s, against the exact $${tex(H, 9)}$ J s: $z = ${((EXh.v - H) / EXh.s).toFixed(2)}$.` },
      { label: 'Intercept', text: t`$-\phi_A/e = ${pmT(EX.fit.a, EX.fit.sa)}$ V, so the “work function” is $${resT(EXphi)}$ eV. The cathode’s is 1.90 eV. The difference is the contact potential: in equilibrium the Fermi levels of the two metals line up, so an electron leaving the cathode with $h\nu - \phi_C$ must climb $eV_0 + (\phi_A - \phi_C)$ to reach the anode.` },
      { label: 'Sense check', text: t`The slope never saw the contact potential — it is the same for any anode, and any cathode. That universality was Millikan’s test of Einstein’s prediction; the measured offset is a property of the tube.` },
    ],
    answer: t`$h/e = (${pmT(EXhe.value / 1e-15, EXhe.sigma / 1e-15)})\times10^{-15}$ V s; $h = (${pmT(EXh.v / 1e-34, EXh.s / 1e-34)})\times10^{-34}$ J s; the intercept gives the anode’s work function, $${resT(EXphi)}$ eV, not the cathode’s.`,
  },
  practice: [
    num({
      id: 'nu', difficulty: 1,
      gen(r) {
        const L = r.pick(LINES);
        const ans = nuOf(L.lam);
        return {
          prompt: t`Mercury’s ${L.name.split(' ')[0]} line has an air wavelength of $${L.lam.toFixed(3)}$ nm. With air’s refractive index 1.00028, what is its frequency? Answer in Hz.`,
          visual: rigRaw('photo', { seed: r.int(1, 999), settings: [L.lam] }, 'The photocurrent against reverse voltage for this line, with the stopping voltage marked.'),
          answer: ans, units: 'Hz', tol: { rel: 0.001 },
          errors: [],
          hints: [t`$\nu = c/\lambda_\text{vac}$ and $\lambda_\text{vac} = 1.00028\,\lambda_\text{air}$.`],
          teach: t`Frequency is $c$ over the *vacuum* wavelength; tables of lines usually give air wavelengths.`,
          explain: t`$\nu = 299\,792\,458/(1.00028 \times ${tex(L.lam * 1e-9, 6)}) = ${tex(ans, 5)}$ Hz.`,
        };
      },
    }),
    num({
      id: 'two-lines', difficulty: 2,
      gen(r) {
        const [A, B] = r.shuffle([0, 1, 2, 3, 4]).slice(0, 2).sort((a, b) => a - b).map((i) => LINES[i]);
        const seed = r.int(1, 99999);
        const R = M.readRows('photo', M.makeRows('photo', { seed, settings: [A.lam, B.lam] }));
        const ans = (R[0].V - R[1].V) / (R[0].nu - R[1].nu);
        return {
          prompt: t`Two stopping voltages: $${R[0].V.toFixed(3)}$ V for the ${A.name} line ($\nu = ${tex(R[0].nu, 5)}$ Hz) and $${R[1].V.toFixed(3)}$ V for the ${B.name} line ($\nu = ${tex(R[1].nu, 5)}$ Hz). What value of $h/e$ do they give? Answer in V s.`,
          visual: rigPlot('photo', { seed, settings: [A.lam, B.lam], residuals: false }, t`The two points; two points always fit a line, so they cannot say how good it is. ${SIMNOTE}`),
          answer: ans, units: 'V s', tol: { rel: 0.005 },
          errors: [{ value: R[0].V / R[0].nu, feedback: t`$V_0/\nu$ would be the slope only if the line passed through the origin; the work function puts it well below. Use the difference: $\Delta V_0/\Delta\nu$.` }],
          hints: ['The work function is the same for both: subtract to remove it.', t`$h/e = (V_{0,1} - V_{0,2})/(\nu_1 - \nu_2)$.`],
          teach: 'A difference of two readings removes every offset they share — the contact potential and the work function included.',
          explain: t`$(${R[0].V.toFixed(3)} - ${R[1].V.toFixed(3)})/(${tex(R[0].nu - R[1].nu, 4)}) = ${tex(ans, 4)}$ V s, against $${tex(HE, 6)}$. Lines close in frequency give a short lever arm and a large uncertainty.`,
        };
      },
    }),
    num({
      id: 'h-from-slope', difficulty: 2,
      gen(r) {
        const seed = r.int(1, 99999), A = M.run('photo', { seed });
        const b = +A.fit.b.toFixed(4);
        const ans = b * 1e-14 * e;
        return {
          prompt: t`A fit of $V_0$ against $\nu$ (in units of $10^{14}$ Hz) gives a slope of $${b.toFixed(4)}$ V per $10^{14}$ Hz. What value of Planck’s constant does it give? Answer in J s.`,
          visual: rigPlot('photo', { seed }, t`The run and its fit. ${SIMNOTE}`),
          answer: ans, units: 'J s', tol: { rel: 0.003 },
          errors: [{ value: b * e, feedback: t`The slope is per $10^{14}$ Hz: in V s it is $${b.toFixed(4)}\times10^{-14}$.` }, { value: (b * 1e-14) / e, feedback: t`$h = e \times$ slope: $e$ multiplies.` }],
          hints: [t`Convert the slope to V s: divide by $10^{14}$.`, t`The slope is $h/e$, so $h = e \times \text{slope}$ with $e = 1.602\times10^{-19}$ C.`],
          teach: t`The slope of $V_0$ against $\nu$ is $h/e$; multiply by the exact $e$ for $h$.`,
          explain: t`$h = ${b.toFixed(4)}\times10^{-14} \times 1.602\,177\times10^{-19} = ${tex(ans, 4)}$ J s.`,
        };
      },
    }),
    mcq({
      id: 'intercept', difficulty: 3,
      prompt: t`A fit of $V_0$ against $\nu$ has intercept $-1.40$ V. The cathode is known (from another method) to have a work function of 1.90 eV. What does the intercept tell you?`,
      visual: rigPlot('photo', { seed: 3, expected: true, residuals: false }, t`Data and fit (gold); dashed green: the line with the cathode’s work function. ${SIMNOTE}`),
      choices: [
        'The anode’s work function, 1.40 eV: the electrons must climb to the anode, whose Fermi level lines up with the cathode’s',
        'The cathode’s work function, with a 0.5 eV statistical error in the extrapolation to ν = 0',
        'The cathode’s work function minus the electrons’ average kinetic energy',
        'Nothing physical: an intercept beyond the data is meaningless',
      ],
      answer: 0,
      why: {
        1: 'The extrapolation’s σ is about 0.05 V here, ten times smaller than the gap.',
        2: t`$V_0$ stops the *fastest* electrons, those with $h\nu - \phi$; the average does not enter.`,
        3: 'It is a real quantity — just not the one the textbook equation names. Knowing what it is lets you check the tube.',
      },
      hints: ['Where do the electrons have to get to, to count as current?', t`In equilibrium the two metals’ Fermi levels line up, so the potential difference they see is $V + (\phi_A - \phi_C)/e$.`],
      teach: t`With the contact potential counted, $eV_0 = h\nu - \phi_A$: the intercept measures the collector, not the emitter.`,
      explain: t`An electron leaves the cathode with up to $h\nu - \phi_C$ and must climb $eV + (\phi_A - \phi_C)$; it just fails when $eV_0 = h\nu - \phi_A$. So the intercept is $-\phi_A/e$. The slope is untouched, which is why Millikan’s test of Einstein rested on it.`,
    }),
    mcq({
      id: 'intensity', difficulty: 1,
      prompt: 'You open the lamp’s aperture so twice as much light of the same line reaches the cathode. What happens to the stopping voltage?',
      visual: { type: 'qm-photoelectric', params: { metal: 'potassium', lambda: 405, panel: 'iv', controls: false, readout: false }, caption: 'Photocurrent against retarding voltage for one line (a separate simulation of the same physics).' },
      choices: ['It stays the same; only the current doubles', 'It doubles', 'It rises by a factor of √2', 'It falls, because more electrons repel one another'],
      answer: 0,
      why: { 1: 'Brighter light means more photons, not more energetic ones: each electron still gets hν.', 2: 'There is no square-root law here: V₀ depends on one photon’s energy.', 3: 'Space charge can distort the curve at high currents, but it is not the photon picture’s prediction and is kept small by design.' },
      hints: ['What does a brighter beam of one colour change: the number of photons, or the energy of each?'],
      teach: 'Intensity sets how many electrons come out; frequency sets how fast the fastest ones are.',
      explain: 'V₀ measures the most energetic electron, hν − φ. Doubling the light doubles the number of photons, and so the current, but not any one photon’s energy — the observation that wave theory could not explain.',
    }),
    num({
      id: 'knee', difficulty: 3,
      gen(r) {
        const dUV = r.pick([0.06, 0.08, 0.10, 0.12]), dY = r.pick([0.01, 0.02, 0.03]);
        const nU = nuOf(LINES[0].lam), nY = nuOf(LINES[4].lam);
        const ans = (100 * (-(dUV - dY) / (nU - nY))) / HE;
        return {
          prompt: t`Reading $V_0$ where the current curve meets the axis is hard on a soft knee. Suppose the UV line’s $V_0$ is read $${dUV.toFixed(2)}$ V too low and the yellow line’s $${dY.toFixed(2)}$ V too low (a dim line has a softer-looking knee), with a straight-line change in between. By what percentage does the slope — and so $h/e$ — come out wrong? (Negative for too low.) The two lines are at $${tex(nU, 4)}$ and $${tex(nY, 4)}$ Hz.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [5, 8.5], y: [0, 2.4], xlabel: 'ν (10¹⁴ Hz)', ylabel: 'V₀ (V)', axesAt: 'edge', curves: [{ fn: `${(HE * 1e14).toFixed(5)}*x - 1.4`, color: 'good', dash: true, label: 'true', labelAt: 5.6, labelDy: -10 }, { fn: `${(HE * 1e14).toFixed(5)}*x - 1.4 - (${dY} + (${dUV - dY})*(x - ${(nY / 1e14).toFixed(4)})/${((nU - nY) / 1e14).toFixed(4)})`, color: 'warn', label: 'as read', labelAt: 7.6, labelDy: 14 }] }, caption: t`The true line and the line through the biased readings; a constant bias would only shift it, a bias that changes with $\nu$ tilts it.` },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: 'A bias the same for every line would leave the slope alone — but these biases differ, so the line tilts.' }, { value: -ans, feedback: 'Sign: the UV end drops more than the yellow end, so the line gets shallower — the slope comes out low.' }],
          hints: [t`The slope error is the difference of the biases divided by the frequency span: $-(\delta_\text{UV} - \delta_\text{Y})/(\nu_\text{UV} - \nu_\text{Y})$.`, t`Divide that by $h/e = 4.1357\times10^{-15}$ V s and multiply by 100.`],
          teach: 'A bias that is the same for every point moves the intercept; one that changes with the knob changes the slope too.',
          explain: t`$\Delta b = -(${dUV} - ${dY})/${tex(nU - nY, 4)} = ${tex(-(dUV - dY) / (nU - nY), 3)}$ V s, which is $${ans.toFixed(1)}\%$ of $h/e$. Real photocells show slopes off by several per cent for this reason: Millikan spent years making clean cathode surfaces and studying where the current truly stops.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-h-z', difficulty: 3,
      gen(r) {
        const seed = r.int(1, 99999), A = M.run('photo', { seed });
        const he = A.results[0];
        const hv = he.value * e, hs = he.sigma * e;
        const ans = (hv - H) / hs;
        return {
          prompt: t`A run gives $h/e = (${pmT(he.value / 1e-15, he.sigma / 1e-15)})\times10^{-15}$ V s. How many standard uncertainties is the $h$ it implies from the exact value $6.626\,070\,15\times10^{-34}$ J s? Give $z$ with its sign.`,
          visual: rigPlot('photo', { seed }, t`The run behind the result. ${SIMNOTE}`),
          answer: ans, tol: { rel: 0, abs: 0.08 },
          errors: [{ value: (100 * (hv - H)) / H, feedback: 'That is the percentage difference; divide the difference by σ instead.' }].filter((x) => Math.abs(x.value - ans) > 0.3),
          hints: [t`$h = e \times (h/e)$ and $\sigma_h = e\,\sigma_{h/e}$, since $e$ is exact.`, t`$z = (h - h_\text{exact})/\sigma_h$ — the same as working with $h/e$ throughout.`],
          teach: 'Multiplying by an exact constant leaves z unchanged: compare in whichever quantity is convenient.',
          explain: t`$z = (${tex(he.value, 5)} - ${tex(HE, 6)})/(${tex(he.sigma, 2)})$, $= ${ans.toFixed(2)}$.`,
        };
      },
    }),
    num({
      id: 'cp-millikan-h', difficulty: 3,
      prompt: t`Millikan’s photoelectric method measures $h/e$; he turned it into $h$ with his own oil-drop value, $e = 1.5924\times10^{-19}$ C. Had his $h/e$ been exactly today’s $4.135\,667\,7\times10^{-15}$ V s, what $h$ would he have reported? Answer in J s.`,
      visual: compare([{ v: H_MIL / 1e-34, s: 0.03, label: 'Millikan 1916', color: 'warn' }, { v: H / 1e-34, s: 0.0005, label: 'exact (2019 SI)', color: 'good' }], { xlabel: 'h (10⁻³⁴ J s)', caption: t`Millikan’s 1916 result, about $6.57\times10^{-27}$ erg s, against the exact value. His bar is drawn as an illustrative ±0.5%.` }),
      answer: HE * E_MIL, units: 'J s', tol: { rel: 0.001 },
      errors: [{ value: H, feedback: t`That uses today’s $e$; the question is what his $e$ does to $h$.` }],
      hints: [t`$h = (h/e) \times e$.`, t`Use $e = 1.5924\times10^{-19}$ C.`],
      teach: 'A derived constant inherits every error of the constants it is built from.',
      explain: t`$4.135\,667\,7\times10^{-15} \times 1.5924\times10^{-19} = ${tex(HE * E_MIL, 4)}$ J s — 0.6% low, close to his $6.57\times10^{-34}$. Part of the gap between his $h$ and today’s was his $e$, not his photocells.`,
    }),
    num({
      id: 'cp-spacecraft', difficulty: 3, transfer: true,
      gen(r) {
        const mat = r.pick([['gold', 5.1], ['aluminium', 4.2], ['indium tin oxide', 4.7]]);
        const lam = 121.567;           // Lyman-alpha, vacuum, nm
        const E = (M.K.h * M.K.c) / (lam * 1e-9) / e;
        const ans = E - mat[1];
        return {
          prompt: t`In sunlight, a spacecraft’s surfaces emit photoelectrons, mostly driven by the Sun’s strong Lyman-α line at $121.567$ nm (vacuum). A surface of ${mat[0]} (work function about $${mat[1]}$ eV, illustrative) charges positive until the fastest photoelectrons are pulled back. Treating the surface as a cathode with nothing else charging it, what potential does it reach? Answer in V.`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 20], y: [-6, 4], xlabel: 'ν (10¹⁴ Hz)', ylabel: 'V₀ (V)', axesAt: 'edge', curves: [{ fn: `${(HE * 1e14).toFixed(5)}*x - ${mat[1]}`, color: 'accent' }], hlines: [{ y: 0, color: 'ink3' }] }, caption: t`The photoelectric line for this surface, drawn up to $2\times10^{15}$ Hz. Lyman-α lies off the right edge, at about $2.5\times10^{15}$ Hz.` },
          answer: ans, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: E, feedback: 'The photon energy is not all available: the work function is spent getting out of the surface.' }],
          hints: [t`Photon energy $hc/\lambda$ in eV: $1239.84/\lambda_\text{nm}$.`, t`The surface stops its photoelectrons at $V = (h\nu - \phi)/e$.`],
          teach: 'The stopping voltage of the photoelectric effect is also how far sunlight alone charges a conducting surface in space.',
          explain: t`$h\nu = 1239.84/121.567 = ${E.toFixed(2)}$ eV, so $V = ${E.toFixed(2)} - ${mat[1]} = ${ans.toFixed(1)}$ V. Sunlit spacecraft in the solar wind do float a few volts positive; the plasma’s electrons pull it back down, which is why the real value is a balance of currents, and why science instruments that measure low-energy electrons care about it.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'R. A. Millikan, A direct photoelectric determination of Planck’s h, Physical Review 7, 355 (1916)', url: 'https://doi.org/10.1103/PhysRev.7.355' },
    { label: 'A. Einstein, Über einen die Erzeugung und Verwandlung des Lichtes betreffenden heuristischen Gesichtspunkt, Annalen der Physik 17, 132 (1905)', url: 'https://doi.org/10.1002/andp.19053220607' },
    SRC.asd,
    SRC.codata,
  ],
});
