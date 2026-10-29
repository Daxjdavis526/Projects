// Gamma-ray spectroscopy — the lab view of a NaI(Tl) scintillation
// spectrometer: what a single line's spectrum holds (photopeak, Compton
// continuum and edge, backscatter peak), peak centroids and net areas by the
// region-of-interest method with their Poisson uncertainties, a linear energy
// calibration from known sources (Am-241, Na-22, Cs-137, Co-60) with its
// covariance, resolution, and identifying an unknown. The systematic: the
// gain shifting between the calibration and the unknown's run, which turns
// Mn-54 (834.8 keV) into something that looks like Co-56 (846.8 keV); the
// K-40 line from the building's concrete, present in every spectrum, as the
// check that catches it. Activity from a peak area, and in-flight
// calibration of a planetary gamma-ray spectrometer as the transfer.
// Theory: phys3710.N2.2. Every number is computed here from the seeded model
// the labg-rig simulation draws with (_labg.js).
import { lesson, mcq, num, match, code } from '../../src/core/content.js';
import { G, rig, pmT, resT, f, tex, zT, SIMNOTE, SRC } from './_labg.js';
import { r6, table } from './_labf.js';

const t = String.raw;
const L = G.LINES;
const CO56 = 846.770;                                  // keV, Co-56's strongest line (NNDC)

// ── the worked example: seed 4, the gain shifted before the unknown's run ──
const EX = G.run('gamma', { seed: 4, analysis: 'cal' });
const EXk = G.run('gamma', { seed: 4, analysis: 'k40' });
const EXu = EX.results[0], EXK = EX.results[1], EXc = EXk.results[0];
const calRows = EX.cal.map((c) => [`${c.src === 'am241' ? 'Am-241' : c.src === 'na22' ? 'Na-22' : c.src === 'cs137' ? 'Cs-137' : 'Co-60'}`, c.E, c.c, c.sc]);

// ── the code exercise: seed 8 calibration, printed and re-fitted ──
const CD = G.run('gamma', { seed: 8, flags: { drift: false } });
const CC = CD.cal.map((c) => +c.c.toFixed(2)), CSC = CD.cal.map((c) => +c.sc.toFixed(3)), CE = CD.cal.map((c) => c.E);
const CPK = +CD.peak.c.toFixed(2);
const CF = G.fitLine(CC, CE, CSC.map((s) => 1.55 * s));
const CEU = CF.a + CF.b * CPK, CSEU = Math.sqrt(CF.sa ** 2 + CPK ** 2 * CF.sb ** 2 + 2 * CPK * CF.cov);

export default lesson({
  id: 'lab.E.13',
  title: 'Gamma-ray spectroscopy',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`Every gamma-emitting nucleus announces itself by the energies of its lines ([the decays behind them](#/lesson/phys3710.N2.2)). A NaI(Tl) crystal turns each photon’s deposited energy into a flash of light, a photomultiplier into a pulse, and a multichannel analyser sorts the pulses by height into channels. A line shows up as a **photopeak** (all its energy absorbed) on top of a **Compton continuum** (it scattered once and escaped). To read energies you calibrate with sources whose lines are known:

$$E = a + b\,c$$

where $c$ is a peak’s centroid channel. Then any peak’s channel gives its energy, with an uncertainty from its own centroid and from the calibration’s covariance — and a list of known lines gives its name. **The calibration only holds while the gain holds.**`,
  symbols: [
    { tex: 'E', text: 'the photon energy, in keV' },
    { tex: 'c', text: 'a peak’s centroid: the mean channel of its net counts above the local background' },
    { tex: 'a', text: 'the calibration’s offset, in keV (the energy of channel 0; a few keV, from the electronics’ zero)' },
    { tex: 'b', text: 'the gain, in keV per channel: set by the photomultiplier’s voltage and the amplifier, and it drifts with temperature' },
  ],
  why: t`Gamma spectrometers identify isotopes in reactor coolant, at borders and in fallout, measure what elements make up the surface of the Moon and Mars from orbit, and calibrate every nuclear experiment.`,
  visual: {
    type: 'labg-rig',
    title: 'The bench: a NaI(Tl) spectrometer, four sources and an unknown',
    lead: t`The top panel shows one source’s spectrum on a log scale (choose which). Below: the six calibration peaks’ energies against their centroid channels, the weighted line and its residuals (in keV). The readout gives the unknown’s line and the K-40 line that every spectrum holds, each against its tabulated energy.`,
    tasks: [
      'Look at Cs-137: the photopeak near channel 430, the flat Compton continuum ending at the edge near channel 310, the small backscatter bump near 120, and the K-40 line far right.',
      'With the gain shift on, the unknown reads about 847 keV — close to Co-56’s 846.8 keV. But the K-40 line reads about 1482 keV instead of 1460.8: the gain moved, not the physics.',
      'Choose “Calibration + K-40 line as a check”: rescaling the unknown’s channels so K-40 lands at 1460.8 keV brings the unknown back to Mn-54’s 834.8 keV.',
    ],
    params: { exp: 'gamma', seed: 4 },
    caption: t`Simulated spectra in 1024 channels with Poisson counts. The line shapes are a teaching model (a Gaussian photopeak with 7 % FWHM at 662 keV growing as $\sqrt E$, a flat Compton continuum with a smeared edge, a small backscatter peak, a falling room background); real NaI responses are measured, not assumed. Centroids by the region-of-interest method. ${SIMNOTE}`,
  },
  example: {
    prompt: t`Six calibration peaks were counted in the morning:

${table([[t`\text{line}`, ...calRows.map((q) => t`\text{${q[0]}}`)], [t`E\ (\text{keV})`, ...calRows.map((q) => q[1].toFixed(1))], [t`c\ (\text{ch})`, ...calRows.map((q) => q[2].toFixed(2))]])}

Overnight, an unknown source shows a single strong peak at channel $${EX.peak.c.toFixed(2)} \pm ${EX.peak.sc.toFixed(2)}$, and the room’s K-40 line at channel $${EX.k40.c.toFixed(1)}$. Identify the unknown.`,
    visual: rig('gamma', { seed: 4, raw: false }, t`The calibration: tabulated energy against measured centroid, the weighted line and its residuals in keV. ${SIMNOTE}`),
    steps: [
      { label: 'Calibrate', text: t`A weighted straight line through the six points gives $E = (${pmT(EX.fit.a, EX.fit.sa)}) + (${pmT(EX.fit.b, EX.fit.sb)})\,c$ keV, with $\chi^2/\nu = ${EX.fit.chi2r.toFixed(2)}$. The residuals stay within about 1 keV.` },
      { label: 'Read the peak', text: t`$E = ${EX.fit.a.toFixed(2)} + ${EX.fit.b.toFixed(5)} \times ${EX.peak.c.toFixed(2)} = ${EXu.value.toFixed(1)}$ keV.` },
      { label: 'Its uncertainty', text: t`$\sigma_E^2 = \sigma_a^2 + c^2\sigma_b^2 + 2c\,\text{cov}(a, b) + (b\,\sigma_c)^2$ — the covariance is negative and matters: dropping it would inflate $\sigma_E$. With a 0.05 % allowance for the response’s curvature, $E = ${resT(EXu)}$ keV.` },
      { label: 'A tempting match', text: t`Co-56’s strongest line is at 846.8 keV — within $${((EXu.value - CO56) / EXu.sigma).toFixed(1)}\sigma$. But Co-56 also emits a 1238 keV line two-thirds as often, and the spectrum has none. One matching energy is not an identification.` },
      { label: 'Check the scale', text: t`The K-40 line, which belongs at 1460.82 keV, reads $${resT(EXK)}$ keV: $z = ${zT(EXK.z, 0)}$. Something moved every energy up by about $${(100 * (EXK.value / L.k40 - 1)).toFixed(1)}\,\%$ — the gain, not the source.` },
      { label: 'Correct', text: t`Rescale the night’s channels by the factor that puts K-40 where the calibration says 1460.82 keV belongs, and the unknown becomes $${resT(EXc)}$ keV: Mn-54 at 834.85 keV ($z = ${zT(EXc.z, 1)}$), whose single line matches the single peak.` },
    ],
    answer: t`Mn-54 (834.85 keV): the raw $${EXu.value.toFixed(1)}$ keV was a gain shift, exposed by the K-40 line and corrected to $${resT(EXc)}$ keV.`,
  },
  practice: [
    match({
      id: 'features', difficulty: 2,
      prompt: t`Match each feature of a Cs-137 spectrum to where it sits.`,
      visual: rig('gamma', { seed: 2, src: 'cs137', data: false }, t`A Cs-137 spectrum (log scale) from the simulated spectrometer, which also holds the room’s K-40 line. ${SIMNOTE}`),
      left: ['the photopeak', 'the Compton edge', 'the backscatter peak', 'the K-40 line from the concrete'],
      right: ['662 keV', '477 keV', '184 keV', '1461 keV', '511 keV'],
      answer: [0, 1, 2, 3],
      hints: ['The edge is the most energy an electron can take in one scatter: a 180° scatter.', 'The backscatter peak is the 180°-scattered photon itself, coming back from the shielding into the crystal.'],
      teach: 'One line makes a photopeak, a continuum ending at the Compton edge, and a backscatter peak at E − (edge).',
      explain: t`At 180° the photon keeps $661.7/(1 + 2 \times 661.7/511.0) = 184.3$ keV (the backscatter peak) and the electron takes $477.3$ keV (the edge). 511 keV is annihilation radiation — it belongs to positron emitters like Na-22, not Cs-137.`,
    }),
    num({
      id: 'two-point', difficulty: 2,
      gen(r) {
        const b = r.float(1.40, 1.70, 0.001), a = r.float(-6, 4, 0.1);
        const cCs = +((L.cs137 - a) / b).toFixed(1), cCo = +((L.co60b - a) / b).toFixed(1);
        const E = r.pick([L.mn54, L.zn65, 765.8, 898.0, 1063.656]);
        const cx = +((E - a) / b).toFixed(1);
        const bb = (L.co60b - L.cs137) / (cCo - cCs), aa = L.cs137 - bb * cCs;
        const ans = aa + bb * cx;
        return {
          prompt: t`Cs-137’s photopeak (661.66 keV) is at channel ${cCs} and Co-60’s upper line (1332.49 keV) at channel ${cCo}. Assuming a straight-line calibration, what energy is a peak at channel ${cx}?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1000], y: [0, 1500], xlabel: 'channel', ylabel: 'E (keV)', axesAt: 'edge', points: [{ x: cCs, y: L.cs137, r: 5, color: 'accent', label: 'Cs-137' }, { x: cCo, y: L.co60b, r: 5, color: 'accent', label: 'Co-60', labelDy: 14 }], vlines: [{ x: cx, color: 'gold' }] }, caption: 'Two calibration points; the gold line marks the unknown peak’s channel.' },
          answer: ans, units: 'keV', tol: { rel: 0.0015 },
          errors: [{ value: (L.cs137 / cCs) * cx, feedback: 'A calibration has an offset: the line through two points need not pass through channel 0 at 0 keV.' }].filter((e) => Math.abs(e.value - ans) > 0.003 * ans),
          hints: [t`Gain $b = (1332.49 - 661.66)/(${cCo} - ${cCs})$ keV per channel.`, t`$E = 661.66 + b\,(c - ${cCs})$.`],
          teach: 'Two known lines fix a linear calibration: the gain from their spacing, the offset from either one.',
          explain: t`$b = 670.83/${(cCo - cCs).toFixed(1)} = ${bb.toFixed(4)}$ keV/ch, so $E = 661.66 + ${bb.toFixed(4)} \times (${cx} - ${cCs}) = ${ans.toFixed(1)}$ keV.`,
        };
      },
    }),
    num({
      id: 'resolution', difficulty: 1,
      gen(r) {
        const b = r.float(1.45, 1.65, 0.01), fw = r.float(26, 34, 0.1);
        const ans = (100 * fw * b) / L.cs137;
        return {
          prompt: t`The Cs-137 photopeak has a full width at half maximum of ${fw} channels, and the gain is $${b}$ keV per channel. What is the detector’s resolution at 662 keV, as FWHM/E in percent?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [360, 500], y: [0, 1.15], xlabel: 'channel', ylabel: 'counts (scaled)', axesAt: 'edge', curves: [{ fn: `exp(-((x - 428)/${r6(fw / 2.3548)})^2/2)`, color: 'accent' }], hlines: [{ y: 0.5, color: 'gold', label: 'half maximum' }] }, caption: 'The photopeak; its width at half height, in channels, is given.' },
          answer: ans, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (100 * fw) / L.cs137, feedback: 'Convert the width to keV first: multiply channels by keV per channel.' }, { value: (100 * fw * b) / 2.3548 / L.cs137, feedback: 'That uses σ. Resolution is quoted as FWHM, which is 2.355σ.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`FWHM in keV $= ${fw} \times ${b}$.`],
          teach: 'Resolution is FWHM/E: about 7 % at 662 keV for NaI(Tl), about 0.2 % for germanium.',
          explain: t`FWHM $= ${(fw * b).toFixed(1)}$ keV, so $${(fw * b).toFixed(1)}/661.66 = ${ans.toFixed(2)}\,\%$. Two lines closer than about one FWHM blend into one peak — the reason high-purity germanium detectors exist.`,
        };
      },
    }),
    num({
      id: 'net-area', difficulty: 3,
      gen(r) {
        const Gc = r.int(3000, 12000), nR = r.pick([40, 50, 60]), nS = r.pick([10, 20]), S = r.int(300, 1500);
        const k = nR / (2 * nS);
        const net = Gc - k * S, ans = Math.sqrt(Gc + k * k * S);
        return {
          prompt: t`A peak’s region of interest spans ${nR} channels and holds $${Gc}$ counts in all. The background is estimated from ${nS} channels on each side, which hold $${S}$ counts together. What is the standard uncertainty of the net peak area?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1], y: [0, 1.2], xlabel: 'channel (schematic)', ylabel: 'counts', xticks: 0, yticks: 0, axesAt: 'edge', curves: [{ fn: '0.25 + 0.75*exp(-((x - 0.5)/0.07)^2/2)', color: 'accent' }, { fn: '0.25', color: 'gold', dash: [5, 4], domain: [0.1, 0.9] }], shade: [{ fn: '0.25', from: 0.05, to: 0.18, color: 'violet', alpha: 0.35 }, { fn: '0.25', from: 0.82, to: 0.95, color: 'violet', alpha: 0.35 }, { fn: '0.25 + 0.75*exp(-((x - 0.5)/0.07)^2/2)', lower: '0.25', from: 0.25, to: 0.75, color: 'accent', alpha: 0.3 }] }, caption: 'The region of interest (net area shaded blue above the dashed background) and the two sidebands (violet) that estimate the background.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(net), feedback: 'The net area is a difference of two counts; both fluctuate. Its variance is G + k²S, not the net itself.' }, { value: Math.sqrt(Gc + k * S), feedback: t`The background counts are scaled by $k = ${k}$, so their variance scales by $k^2$.` }, { value: Math.sqrt(Gc), feedback: 'The background estimate has its own Poisson uncertainty: add it.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`The background under the peak is $kS$ with $k = ${nR}/(2 \times ${nS}) = ${k}$.`, t`Net $= G - kS$; independent Poisson counts: $\sigma^2 = G + k^2S$.`],
          teach: 'A net area is gross minus scaled background; its variance is the gross plus the background’s variance times the scale factor squared.',
          explain: t`Net $= ${Gc} - ${k} \times ${S} = ${net.toFixed(0)}$ counts, with $\sigma = \sqrt{${Gc} + ${k}^2 \times ${S}} = ${ans.toFixed(0)}$ — a ${(100 * ans / net).toFixed(1)} % uncertainty. Wider sidebands (larger $n_S$) would shrink the background’s share.`,
        };
      },
    }),
    num({
      id: 'centroid-sigma', difficulty: 2,
      gen(r) {
        const fw = r.pick([20, 26, 32, 40]), N = r.pick([900, 2500, 6400, 10000, 22500]);
        const ans = fw / 2.3548 / Math.sqrt(N);
        return {
          prompt: t`A Gaussian photopeak ${fw} channels wide (FWHM) holds $${N}$ net counts on a negligible background. Roughly how well is its centroid known, in channels?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-50, 50], y: [0, 1.15], xlabel: 'channel − centre', ylabel: 'counts (scaled)', axesAt: 'edge', curves: [{ fn: `exp(-(x/${r6(fw / 2.3548)})^2/2)`, color: 'accent' }] }, caption: 'The peak’s shape: each count is one draw from this Gaussian.' },
          answer: ans, units: '', tol: { rel: 0.01 },
          errors: [{ value: fw / Math.sqrt(N), feedback: 'Use σ, not the FWHM: σ = FWHM/2.355.' }, { value: fw / 2.3548 / N, feedback: 'A mean of N draws is uncertain by σ/√N, not σ/N.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: ['The centroid is the mean of N draws from a Gaussian of standard deviation σ.', t`$\sigma_c = \sigma/\sqrt N$ with $\sigma = \text{FWHM}/2.355$.`],
          teach: 'A centroid is a mean: its uncertainty is the peak’s σ over √N — far finer than the peak’s width.',
          explain: t`$\sigma = ${fw}/2.355 = ${(fw / 2.3548).toFixed(2)}$ channels, so $\sigma_c = ${(fw / 2.3548).toFixed(2)}/\sqrt{${N}} = ${ans.toFixed(3)}$ channels. That is why a 7 % detector can still place a line to a fraction of a keV.`,
        };
      },
    }),
    num({
      id: 'activity', difficulty: 3,
      gen(r) {
        const N = r.int(4000, 40000), eff = r.pick([0.012, 0.018, 0.025, 0.031]), tl = r.pick([300, 600, 1200, 1800]);
        const I = 0.851;
        const ans = N / (eff * I * tl);
        return {
          prompt: t`In ${tl} s of live time, the Cs-137 photopeak holds $${N}$ net counts. The detector’s full-energy-peak efficiency at 662 keV in this geometry is ${eff}, and 85.1 % of Cs-137 decays emit the 662 keV gamma. What is the source’s activity, in Bq?`,
          visual: rig('gamma', { seed: 6, src: 'cs137', data: false }, t`A Cs-137 spectrum: only the photopeak’s counts are full-energy events. ${SIMNOTE}`),
          answer: ans, units: 'Bq', tol: { rel: 0.01 },
          errors: [{ value: N / (eff * tl), feedback: 'Not every decay emits the 662 keV gamma: divide by the emission probability 0.851 too.' }, { value: N / tl, feedback: 'That is the counting rate. Divide by the efficiency and the emission probability to get decays per second.' }, { value: (N * eff * I) / tl, feedback: 'Efficiency reduces counts below decays: divide by it.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: ['Counts = activity × time × (photons per decay) × (fraction of photons counted in the peak).', t`$A = N/(\varepsilon I_\gamma t)$.`],
          teach: 'Activity is peak counts divided by live time, efficiency and the line’s emission probability.',
          explain: t`$A = ${N}/(${eff} \times 0.851 \times ${tl}) = ${ans.toFixed(0)}$ Bq $= ${(ans / 3.7e4).toFixed(2)}\ \mu\text{Ci}$. The efficiency is the weak link: it comes from a calibrated source in the same geometry, typically known to 3–5 %.`,
        };
      },
    }),
    code({
      id: 'calibrate', difficulty: 3,
      prompt: t`Fit the calibration $E = a + bc$ to the six peaks with weights (each energy’s σ is $1.55 \times$ the centroid’s σ in channels: about the gain times $\sigma_c$), using \`np.polyfit(..., w=1/sE, cov='unscaled')\`. Then predict the unknown’s energy \`E_u\` at channel \`c_u\`, and its uncertainty \`s_u\` from the covariance (ignore the unknown’s own centroid error).`,
      starter: t`import numpy as np

c  = np.array([${CC.join(', ')}])          # centroid, channels
sc = np.array([${CSC.join(', ')}])          # its σ, channels
E  = np.array([${CE.join(', ')}])   # keV
c_u = ${CPK}                                       # the unknown's peak

sE = 1.55 * sc
# your code: the fit, then E_u and s_u
E_u, s_u = 0.0, 0.0
print(f"E = {E_u:.2f} ± {s_u:.2f} keV")`,
      answer: t`import numpy as np

c  = np.array([${CC.join(', ')}])          # centroid, channels
sc = np.array([${CSC.join(', ')}])          # its σ, channels
E  = np.array([${CE.join(', ')}])   # keV
c_u = ${CPK}                                       # the unknown's peak

sE = 1.55 * sc
p, cov = np.polyfit(c, E, 1, w=1/sE, cov='unscaled')
b, a = p
E_u = a + b * c_u
J = np.array([c_u, 1.0])                 # dE/db, dE/da (polyfit's order: slope first)
s_u = np.sqrt(J @ cov @ J)
print(f"E = {E_u:.2f} ± {s_u:.2f} keV")`,
      tests: [
        { name: t`the unknown’s energy matches the reference calibration, $${CEU.toFixed(2)}$ keV`, code: `abs(E_u - ${CEU}) < 1e-6` },
        { name: t`its uncertainty includes the slope–intercept covariance ($${CSEU.toFixed(3)}$ keV)`, code: `abs(s_u - ${CSEU}) < 1e-6` },
      ],
      hints: [t`\`p, cov = np.polyfit(c, E, 1, w=1/sE, cov='unscaled')\`; \`p\` is \`[b, a]\`, slope first.`, t`With \`J = np.array([c_u, 1.0])\`, the variance is \`J @ cov @ J\` — that includes $2c_u\,\text{cov}(a, b)$.`],
      teach: 'A calibrated value’s uncertainty is JᵀCJ: the covariance of the calibration, carried through.',
      explain: t`$E_u = ${CEU.toFixed(2)} \pm ${CSEU.toFixed(2)}$ keV from the calibration alone; adding the peak’s own centroid error and the curvature allowance gives about $\pm 0.8$ keV — Mn-54 at 834.85 keV. Without the covariance term, $\sigma$ would be $${Math.sqrt(CF.sa ** 2 + CPK ** 2 * CF.sb ** 2).toFixed(2)}$ keV: the slope and intercept errors partly cancel.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-identify', difficulty: 3,
      prompt: t`An unknown’s only strong peak reads $${resT(EXu)}$ keV on yesterday’s calibration; Co-56’s main line is at 846.8 keV and Mn-54’s at 834.8 keV. The same spectrum’s K-40 line reads $${resT(EXK)}$ keV (tabulated 1460.8). No peak appears near 1238 keV. What do you conclude?`,
      visual: rig('gamma', { seed: 4, data: false }, t`The unknown’s spectrum on a log scale: one strong peak, and the K-40 line near the right edge. ${SIMNOTE}`),
      choices: ['Mn-54: the gain rose about 1.5 % overnight, as the K-40 line shows; corrected, the peak is near 835 keV', 'Co-56: 847.4 keV agrees with 846.8 keV within 1σ', 'A mixture of Co-56 and Mn-54 whose peaks have blended', 'Nothing can be said until the detector is recalibrated from scratch'],
      answer: 0,
      why: {
        1: 'Co-56 would also show its 1238 keV line at two-thirds the intensity, and the K-40 line says the whole energy scale is 1.5 % high.',
        2: 'The peak has the width of one line, and a blend would not move K-40.',
        3: 'The K-40 line is an internal calibration point: it measures the gain shift you need, right in the spectrum.',
      },
      hints: ['What does the K-40 line tell you about the energy scale in this run?', 'Which candidate is consistent with the missing 1238 keV line?'],
      teach: 'Identify isotopes by all their lines, and check the energy scale on a line that must be there.',
      explain: t`K-40 at $${EXK.value.toFixed(1)}/1460.8 = ${(EXK.value / L.k40).toFixed(3)}$ times its energy means every reading is about ${(100 * (EXK.value / L.k40 - 1)).toFixed(1)} % high: $${EXu.value.toFixed(1)}/${(EXK.value / L.k40).toFixed(3)} \approx ${(EXu.value * L.k40 / EXK.value).toFixed(0)}$ keV, Mn-54’s line — and Mn-54 has no other strong line, matching the spectrum.`,
    }),
    num({
      id: 'cp-orbit', difficulty: 3, transfer: true,
      gen(r) {
        const b = r.float(0.48, 0.62, 0.001), a = r.float(-8, 8, 0.1);
        const cK = +((L.k40 - a) / b).toFixed(1), cT = +((2614.511 - a) / b).toFixed(1);
        const E = r.pick([2223.25, 1764.49, 1778.99, 2204.21]);
        const cx = +((E - a) / b).toFixed(1);
        const bb = (2614.511 - L.k40) / (cT - cK), aa = L.k40 - bb * cK;
        const ans = aa + bb * cx;
        return {
          prompt: t`A planetary gamma-ray spectrometer in orbit cannot carry calibration sources, so it calibrates on lines the surface provides: K-40 (1460.82 keV) at channel ${cK} and Tl-208 from the thorium chain (2614.51 keV) at channel ${cT}. What energy is a peak at channel ${cx}?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [r6(0.6 * cK), r6(1.1 * cT)], y: [1200, 2800], xlabel: 'channel', ylabel: 'E (keV)', axesAt: 'edge', points: [{ x: cK, y: L.k40, r: 5, color: 'accent', label: 'K-40' }, { x: cT, y: 2614.511, r: 5, color: 'accent', label: 'Tl-208', labelDx: -60 }], vlines: [{ x: cx, color: 'gold' }] }, caption: 'The two in-flight calibration lines; the gold line marks the peak to identify.' },
          answer: ans, units: 'keV', tol: { rel: 0.0008 },
          errors: [{ value: (L.k40 / cK) * cx, feedback: 'Allow for an offset: use both lines to fix the gain and the offset.' }].filter((e) => Math.abs(e.value - ans) > 0.0015 * ans),
          hints: [t`Gain $= (2614.51 - 1460.82)/(${cT} - ${cK})$.`, t`$E = 1460.82 + \text{gain} \times (${cx} - ${cK})$.`],
          teach: 'With no calibration sources aboard, natural lines in the spectrum are the calibration.',
          explain: t`Gain $= ${bb.toFixed(4)}$ keV/ch, so $E = 1460.82 + ${bb.toFixed(4)} \times ${(cx - cK).toFixed(1)} = ${ans.toFixed(1)}$ keV — ${E === 2223.25 ? 'the 2223 keV line of neutron capture on hydrogen, how Mars Odyssey mapped buried water ice' : E === 2204.21 ? 'Bi-214’s 2204 keV line, from the uranium chain' : E === 1764.49 ? 'Bi-214’s 1764 keV line, from the uranium chain' : 'Al-28’s 1779 keV line, made by cosmic-ray neutrons on aluminium'}.`,
        };
      },
    }),
    num({
      id: 'cp-energy-sigma', difficulty: 2,
      gen(r) {
        const sa = r.float(0.05, 0.12, 0.01), sb = r.float(0.0003, 0.0006, 0.00001), c = r.int(450, 650);
        const rho = r.float(-0.9, -0.75, 0.01);
        const cov = rho * sa * sb;
        const ans = Math.sqrt(sa ** 2 + c * c * sb ** 2 + 2 * c * cov);
        return {
          prompt: t`A calibration $E = a + bc$ has $\sigma_a = ${sa}$ keV, $\sigma_b = ${sb.toFixed(5)}$ keV/ch and correlation coefficient $\rho_{ab} = ${rho}$. What is the calibration’s contribution to the uncertainty of an energy read at channel ${c}?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1000], y: [0, 1.5], xlabel: 'channel', ylabel: 'σ of E (keV)', axesAt: 'edge', curves: [{ fn: `sqrt(${sa}^2 + x^2*${sb}^2 + 2*x*${r6(cov)})`, color: 'accent' }], vlines: [{ x: c, color: 'gold' }] }, caption: 'The calibration’s uncertainty across the channels: smallest near the centre of the calibration points, where slope and intercept errors cancel.' },
          answer: ans, units: 'keV', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(sa ** 2 + c * c * sb ** 2), feedback: t`You dropped the covariance term $2c\,\rho\,\sigma_a\sigma_b$, which is negative here.` }, { value: sa + c * sb, feedback: 'Combine in quadrature, with the covariance term.' }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\sigma_E^2 = \sigma_a^2 + c^2\sigma_b^2 + 2c\,\rho\,\sigma_a\sigma_b$.`],
          teach: 'Slope and intercept errors are correlated; the covariance term usually shrinks the uncertainty inside the calibrated range.',
          explain: t`$\sigma_E = \sqrt{${sa}^2 + ${c}^2(${sb.toFixed(5)})^2 + 2(${c})(${rho})(${sa})(${sb.toFixed(5)})} = ${ans.toFixed(3)}$ keV. See [covariance and correlated errors](#/lesson/lab.A6.3).`,
        };
      },
    }),
  ],
  sources: [
    SRC.nndc,
    SRC.knoll,
    { label: 'W. V. Boynton et al., Distribution of hydrogen in the near surface of Mars, Science 297, 81 (2002)', url: 'https://doi.org/10.1126/science.1073722' },
    SRC.gum,
  ],
});
