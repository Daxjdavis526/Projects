// Compton scattering — the lab view: Cs-137's 662 keV gammas scattered by an
// aluminium rod into a NaI(Tl) detector on a turntable arm; the scattered
// photopeak's energy at seven angles, the linearization 1/E′ − 1/E against
// 1 − cos θ whose slope is 1/(m_e c²), and the result against CODATA. The
// systematic: the photomultiplier's gain drifting through a day of
// counting, which — because the angles were taken in order — masquerades as
// slope and leaves the residuals clean; recalibrating on the Cs-137 line at
// every angle removes it. The Compton edge, background subtraction, and a
// Compton telescope's angle reconstruction as the transfer. Theory:
// phys2710.MP4.2. Every number is computed here from the seeded model the
// labg-rig simulation draws with (_labg.js).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { G, rig, pmT, resT, f, tex, zT, SIMNOTE, SRC } from './_labg.js';
import { r6, table } from './_labf.js';

const t = String.raw;
const E0 = G.CP.E0, MC2 = G.K.mec2;
const D2R = Math.PI / 180;

// ── the worked example: seed 3, gain drifting, first calibrated once, then at every angle ──
const EXo = G.run('compton', { seed: 3, analysis: 'once' });
const EXe = G.run('compton', { seed: 3, analysis: 'each' });
const Ro = EXo.results[0], Re = EXe.results[0];
const R90 = EXe.rows[4];

// ── the code exercise: seed 12, recalibrated energies, printed and re-fitted ──
const CD = G.run('compton', { seed: 12, analysis: 'each' });
const CTH = CD.rows.map((q) => q.th), CE = CD.rows.map((q) => +q.Eused.toFixed(1)), CSE = CD.rows.map((q) => +q.sE.toFixed(2));
const CX = CTH.map((th) => 1 - Math.cos(th * D2R)), CY = CE.map((e) => 1 / e - 1 / E0), CSY = CE.map((e, i) => CSE[i] / e ** 2);
const CF = G.fitLine(CX, CY, CSY);
const CM = 1 / CF.b, CSM = CF.sb / CF.b ** 2;

const eCurve = (lo = 0, hi = 180) => ({ fn: `${E0}/(1 + ${r6(E0 / MC2)}*(1 - cos(x*pi/180)))`, color: 'accent', domain: [lo, hi] });

export default lesson({
  id: 'lab.E.12',
  title: 'Compton scattering',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`A photon that scatters off a free electron through an angle $\theta$ loses energy as a billiard ball would — the proof that light carries momentum in lumps ([the theory](#/lesson/phys2710.MP4.2)). In the lab, a Cs-137 source sends 661.7 keV gammas at an aluminium rod; a NaI(Tl) scintillation detector on a turntable arm records the energy $E'$ of those scattered toward it. Inverting the Compton formula makes it a straight line:

$$\frac{1}{E'} - \frac{1}{E} = \frac{1}{m_ec^2}\,(1 - \cos\theta)$$

The slope is $1/(m_ec^2)$, the intercept should be zero, and the result is the electron’s rest energy — measured with gamma rays and a protractor. **The detector’s gain must hold still** for the whole day it takes.`,
  symbols: [
    { tex: 'E', text: 'the incident photon energy: 661.657 keV, Cs-137’s gamma line (strictly, the line of its daughter Ba-137m)' },
    { tex: "E'", text: 'the scattered photon’s energy, in keV: the centroid of the photopeak the detector records at angle θ' },
    { tex: '\\theta', text: 'the scattering angle between the beam and the detector arm' },
    { tex: 'm_ec^2', text: 'the electron’s rest energy; CODATA 2022: 510.998 950 69 keV' },
  ],
  why: t`Compton scattering is how gamma-ray telescopes image the sky and how most of a radiation dose is deposited in tissue — and the measurement teaches the commonest trap in a long run: a slow drift that lines up with the order of the data.`,
  visual: {
    type: 'labg-rig',
    title: 'The bench: Cs-137 gammas scattered into a NaI(Tl) detector',
    lead: t`Seven angles from 30° to 120°, an hour of counting each, taken in that order. The top panel is one angle’s spectrum: the scattered photopeak on a smooth background, with the energy the Compton formula predicts dashed. Below: $1/E' - 1/E$ against $1 - \cos\theta$, the weighted line and its residuals; the readout turns the slope into $m_ec^2$.`,
    tasks: [
      'With the gain drifting and one calibration at the start, the rest energy comes out near 493 keV — 12σ low — while χ²/ν stays near 1. Look at the 120° spectrum: the peak sits left of the dashed prediction.',
      'Switch to “Recalibrate on Cs-137 at each angle”: the result returns to about 511 keV. The uncertainty barely changes; the bias disappears.',
      'Turn the drift off and compare the two analyses: now they agree. Recalibrating costs almost nothing and protects against what you cannot see.',
    ],
    params: { exp: 'compton', seed: 3 },
    caption: t`Simulated photopeak centroids: Gaussian peaks with a NaI resolution of 7 % FWHM at 662 keV growing as $\sqrt E$ (a teaching model), counts following the Klein–Nishina cross-section, a 0.15 % calibration uncertainty, and a gain that falls 2.5 % over the day when the drift is on. ${SIMNOTE}`,
  },
  example: {
    prompt: t`The same day’s data, now with the Cs-137 line re-read before each angle (the gain had drifted). Energies corrected by that line:

${table([[t`\theta\ (^\circ)`, ...EXe.rows.map((q) => String(q.th))], [t`E'\ (\text{keV})`, ...EXe.rows.map((q) => q.Eused.toFixed(1))], [t`\sigma_{E'}\ (\text{keV})`, ...EXe.rows.map((q) => q.sE.toFixed(2))]])}

Find $m_ec^2$ and compare it with CODATA — and with the $${resT(Ro)}$ keV that a single calibration at the start of the day gave.`,
    visual: rig('compton', { seed: 3, analysis: 'each', raw: false }, t`The recalibrated data as $1/E' - 1/E$ against $1 - \cos\theta$ (MeV⁻¹), the weighted line and the residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Correct for gain', text: t`At 90° the raw centroid was $${R90.Em.toFixed(1)}$ keV and the Cs-137 line read $${R90.Ecs.toFixed(1)}$ keV just before, so $E' = ${R90.Em.toFixed(1)} \times 661.657/${R90.Ecs.toFixed(1)} = ${R90.Eused.toFixed(1)}$ keV. A gain change scales every energy alike, so one known line fixes it.` },
      { label: 'Linearize', text: t`At 90°: $x = 1 - \cos 90^\circ = 1$ and $y = 1/${R90.Eused.toFixed(1)} - 1/661.657 = ${(1000 * (1 / R90.Eused - 1 / E0)).toFixed(4)}\ \text{MeV}^{-1}$.` },
      { label: 'Error bars', text: t`$\sigma_y = \sigma_{E'}/E'^2$: at 90°, $${R90.sE.toFixed(2)}/${R90.Eused.toFixed(1)}^2 \times 1000 = ${(1000 * R90.sE / R90.Eused ** 2).toFixed(4)}\ \text{MeV}^{-1}$. Low-energy points have the biggest $y$ bars.` },
      { label: 'Fit', text: t`The weighted line gives slope $b = ${pmT(EXe.fit.b, EXe.fit.sb)}\ \text{MeV}^{-1}$ and intercept $${pmT(EXe.fit.a, EXe.fit.sa)}\ \text{MeV}^{-1}$ (consistent with zero), $\chi^2/\nu = ${EXe.fit.chi2r.toFixed(2)}$.` },
      { label: 'Rest energy', text: t`$m_ec^2 = 1/b = ${(1000 / EXe.fit.b).toFixed(1)}$ keV, with $\sigma = \sigma_b/b^2 = ${Re.sigma.toFixed(1)}$ keV: $z = ${zT(Re.z, 2)}$ against 510.999 keV.` },
      { label: 'What drift did', text: t`Calibrated once, every later angle read low by up to 2.5 %, the low-energy (large-angle) points most. That steepened the line: $${resT(Ro)}$ keV, $z = ${zT(Ro.z, 0)}$ — with $\chi^2/\nu = ${EXo.fit.chi2r.toFixed(2)}$, because a drift that grows with the angle looks exactly like extra slope.` },
    ],
    answer: t`$m_ec^2 = ${resT(Re)}$ keV, $z = ${zT(Re.z, 1)}$ against CODATA. Without recalibration, $${resT(Ro)}$ keV — a $${Math.abs(Ro.z).toFixed(0)}\sigma$ error that the residuals never showed.`,
  },
  practice: [
    num({
      id: 'eprime', difficulty: 1,
      gen(r) {
        const th = r.pick([20, 35, 50, 70, 80, 100, 110, 135, 150]);
        const ans = G.comptonE(th);
        return {
          prompt: t`What energy does a 661.7 keV Cs-137 photon have after Compton scattering through ${th}° off a free electron?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 180], y: [0, 700], xlabel: 'scattering angle θ (°)', ylabel: "E′ (keV)", axesAt: 'edge', curves: [eCurve()], vlines: [{ x: th, color: 'gold' }] }, caption: 'The scattered energy against angle for 661.7 keV photons; the gold line marks the angle asked about.' },
          answer: ans, units: 'keV', tol: { rel: 0.003 },
          errors: [{ value: E0 - MC2 * (1 - Math.cos(th * D2R)), feedback: t`The shift is in $1/E$, not in $E$: $1/E' = 1/E + (1 - \cos\theta)/m_ec^2$.` }, { value: E0 / (1 + (E0 / MC2) * (1 - Math.cos(th))), feedback: 'Your calculator was in radians: convert the angle.' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$E' = E/\bigl[1 + (E/m_ec^2)(1 - \cos\theta)\bigr]$ with $m_ec^2 = 511.0$ keV.`],
          teach: 'The Compton formula fixes the scattered energy by the angle alone.',
          explain: t`$E/m_ec^2 = ${(E0 / MC2).toFixed(4)}$ and $1 - \cos ${th}^\circ = ${(1 - Math.cos(th * D2R)).toFixed(4)}$, so $E' = 661.66/${(1 + (E0 / MC2) * (1 - Math.cos(th * D2R))).toFixed(4)} = ${ans.toFixed(1)}$ keV.`,
        };
      },
    }),
    num({
      id: 'edge', difficulty: 2,
      gen(r) {
        const [name, E] = r.pick([['Cs-137', 661.657], ['Mn-54', 834.848], ['Na-22’s 1274.5 keV', 1274.537], ['Co-60’s 1332.5 keV', 1332.492], ['Am-241', 59.5409]]);
        const ans = E - E / (1 + (2 * E) / MC2);
        return {
          prompt: t`In a detector’s spectrum, the **Compton edge** is the highest energy a photon can leave behind when it scatters once and escapes: the energy of the electron after a 180° scatter. Where is the edge for ${name} (${E} keV)?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1.15 * E], y: [0, 1.2], xlabel: 'energy deposited (keV)', ylabel: 'counts (sketch)', yticks: 0, axesAt: 'edge', curves: [{ fn: `0.25*(1 - step(x - ${r6(ans)}))*(1 + 0.5*x/${E}) + exp(-((x - ${E})/${r6(0.03 * E)})^2/2)`, color: 'accent', samples: 1500 }] }, caption: 'A sketch of one line’s spectrum: the photopeak, and the Compton continuum ending at the edge (sharp here; a real detector rounds it).' },
          answer: ans, units: 'keV', tol: { rel: 0.003 },
          errors: [{ value: E / (1 + (2 * E) / MC2), feedback: 'That is the backscattered photon’s energy. The edge is what the electron keeps: E minus that.' }, { value: E - E / (1 + E / MC2), feedback: 'At 180°, 1 − cos θ = 2.' }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`At $\theta = 180^\circ$, $E' = E/(1 + 2E/m_ec^2)$.`, 'The electron takes the rest: E − E′.'],
          teach: 'The Compton edge, E − E/(1 + 2E/mc²), marks where single-scatter events stop in a spectrum.',
          explain: t`$E'(180^\circ) = ${E}/(1 + 2 \times ${E}/511.0) = ${(E / (1 + (2 * E) / MC2)).toFixed(1)}$ keV, so the edge is at $${ans.toFixed(1)}$ keV. For a low-energy line the continuum is small and the edge close to zero; for high energies it approaches $E - 256$ keV.`,
        };
      },
    }),
    num({
      id: 'linearize', difficulty: 2,
      gen(r) {
        const th = r.pick([45, 60, 75, 90, 105, 120]);
        const Ep = +(G.comptonE(th) * r.float(0.994, 1.006, 0.001)).toFixed(1);
        const ans = 1000 * (1 / Ep - 1 / E0);
        return {
          prompt: t`At $\theta = ${th}^\circ$ the scattered photopeak sits at $E' = ${Ep}$ keV. What is the point’s $y = 1/E' - 1/E$ in MeV⁻¹ (with $E = 661.657$ keV)?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1.6], y: [0, 3.2], xlabel: '1 − cos θ', ylabel: '1/E′ − 1/E (MeV⁻¹)', axesAt: 'edge', curves: [{ fn: `x/${r6(MC2 / 1000)}`, color: 'gold', dash: [6, 4] }], vlines: [{ x: r6(1 - Math.cos(th * D2R)), color: 'accent' }] }, caption: 'The straight line the Compton formula predicts (dashed); your point sits on the blue line at this angle’s 1 − cos θ.' },
          answer: ans, units: 'MeV^-1', tol: { rel: 0.003 },
          errors: [{ value: 1 / Ep - 1 / E0, feedback: 'That is in keV⁻¹: multiply by 1000 for MeV⁻¹.' }, { value: 1000 * (1 / E0 - 1 / Ep), feedback: t`Sign: $E' < E$, so $1/E' > 1/E$ and $y$ is positive.` }].filter((e) => Math.abs(e.value - ans) > 0.006 * ans),
          hints: [t`$1/E'$ and $1/E$ in keV⁻¹, subtract, then × 1000.`],
          teach: t`Linearizing turns the Compton formula into a straight line through the origin with slope $1/(m_ec^2)$.`,
          explain: t`$1/${Ep} - 1/661.657$ $= ${tex(ans / 1000, 4)}\ \text{keV}^{-1}$ $= ${ans.toFixed(4)}\ \text{MeV}^{-1}$; the line predicts $${((1 - Math.cos(th * D2R)) / (MC2 / 1000)).toFixed(4)}$ here.`,
        };
      },
    }),
    num({
      id: 'recal', difficulty: 2,
      gen(r) {
        const th = r.pick([60, 75, 90, 105, 120]);
        const g = r.float(0.975, 0.993, 0.001);
        const Em = +(G.comptonE(th) * g).toFixed(1), Ecs = +(E0 * g).toFixed(1);
        const ans = (Em * E0) / Ecs;
        return {
          prompt: t`Using the morning’s calibration, the photopeak at ${th}° reads $${Em}$ keV — but the Cs-137 line, read just before, now appears at $${Ecs}$ keV instead of 661.657 keV. Assuming the gain changed and the offset did not, what is the corrected $E'$?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 720], y: [0, 1.2], xlabel: 'energy on the morning’s scale (keV)', ylabel: 'counts (sketch)', yticks: 0, axesAt: 'edge', curves: [{ fn: `exp(-((x - ${Ecs})/19)^2/2) + 0.8*exp(-((x - ${Em})/${r6(0.03 * Em)})^2/2)`, color: 'accent', samples: 1500 }], vlines: [{ x: E0, color: 'good', label: '661.7' }] }, caption: 'Sketch: the Cs-137 check line and the scattered peak, both read on the morning’s scale; green marks where the Cs-137 line belongs.' },
          answer: ans, units: 'keV', tol: { rel: 0.001 },
          errors: [{ value: Em + (E0 - Ecs), feedback: 'A gain change scales energies; it does not add a constant. Multiply by 661.657/(Cs reading).' }, { value: Em, feedback: 'The gain has drifted: correct the reading with the Cs-137 line.' }].filter((e) => Math.abs(e.value - ans) > 0.0015 * ans),
          hints: ['A gain change multiplies every channel number by the same factor.', t`Corrected $E' = E'_{\text{read}} \times 661.657/E_{\text{Cs, read}}$.`],
          teach: 'A known line read alongside the data turns a gain drift into a correction factor.',
          explain: t`$E' = ${Em} \times 661.657/${Ecs} = ${ans.toFixed(1)}$ keV (the formula predicts $${G.comptonE(th).toFixed(1)}$). An uncorrected $${(100 * (1 - Ecs / E0)).toFixed(1)}\,\%$ gain loss would have pulled this point — and the slope — low.`,
        };
      },
    }),
    mcq({
      id: 'drift-hides', difficulty: 3,
      prompt: t`The angles were measured in order, 30° first and 120° last, while the gain fell steadily. Why does $\chi^2/\nu$ stay near 1 even though $m_ec^2$ comes out 12σ low?`,
      visual: rig('compton', { seed: 3, analysis: 'once', raw: false }, t`The drifting run calibrated once: a clean-looking line with clean residuals. ${SIMNOTE}`),
      choices: ['The drift grows with the measurement order, which grows with 1 − cos θ, so it adds a nearly linear term the fitted slope absorbs', 'The error bars were overestimated, hiding the misfit', 'Gain drift only affects the intercept', 'χ² cannot detect errors smaller than the scatter of one point'],
      answer: 0,
      why: {
        1: 'The bars are honest (χ²/ν ≈ 1 with no drift too). The misfit is not hidden; it is absorbed.',
        2: 'A gain change scales each energy, and the scaling here grows from point to point: it tilts the line.',
        3: 'χ² detects misfits of any size if they have a shape the model cannot follow. This one has the model’s own shape.',
      },
      hints: ['Write the bias in y caused by a gain loss g at each point, and ask how it varies with x.', 'If a systematic error looks like a straight line in x, what part of the fit takes it up?'],
      teach: 'A drift correlated with the variable you sweep is absorbed by the fit as signal — randomize the order, or monitor a reference, to break the correlation.',
      explain: t`The gain loss at the $k$-th angle makes $1/E'$ too large by about $(\text{loss}_k)/E'$, and both the loss and $1/E'$ rise along the run. The extra $y$ is close to a straight line in $1 - \cos\theta$, so the fit simply tilts. Taking the angles in a random order would have turned the bias into scatter (and a bad $\chi^2$) — see [choosing what to vary](#/lesson/lab.A10.1).`,
    }),
    code({
      id: 'fit-mc2', difficulty: 3,
      prompt: t`Recalibrated energies \`E\` (keV) with uncertainties \`sE\` at angles \`th\`. Make \`x\` $= 1 - \cos\theta$ and \`y\` $= 1/E' - 1/E_0$ (keV⁻¹) with \`sy\` $= \sigma_{E'}/E'^2$, fit a weighted line with \`np.polyfit(..., w=1/sy, cov='unscaled')\`, and set \`mc2\` $= 1/\text{slope}$ (keV) and \`s_mc2\` its standard uncertainty.`,
      starter: t`import numpy as np

th = np.array([${CTH.join(', ')}])             # degrees
E  = np.array([${CE.join(', ')}])   # keV
sE = np.array([${CSE.join(', ')}])  # keV
E0 = 661.657                                     # keV

# your code: x, y, sy, the fit, mc2 and s_mc2
mc2, s_mc2 = 0.0, 0.0
print(f"m_e c^2 = {mc2:.1f} ± {s_mc2:.1f} keV")`,
      answer: t`import numpy as np

th = np.array([${CTH.join(', ')}])             # degrees
E  = np.array([${CE.join(', ')}])   # keV
sE = np.array([${CSE.join(', ')}])  # keV
E0 = 661.657                                     # keV

x = 1 - np.cos(np.radians(th))
y = 1 / E - 1 / E0
sy = sE / E**2
(b, a), cov = np.polyfit(x, y, 1, w=1/sy, cov='unscaled')
mc2 = 1 / b
s_mc2 = np.sqrt(cov[0, 0]) / b**2
print(f"m_e c^2 = {mc2:.1f} ± {s_mc2:.1f} keV")`,
      tests: [
        { name: t`$m_ec^2$ matches the reference fit, $${CM.toFixed(2)}$ keV`, code: `abs(mc2 - ${CM}) < 1e-6` },
        { name: t`its uncertainty is $\sigma_b/b^2$ from the unscaled covariance`, code: `abs(s_mc2 - ${CSM}) < 1e-6` },
      ],
      hints: [t`\`x = 1 - np.cos(np.radians(th))\`; \`y = 1/E - 1/E0\`; \`sy = sE / E**2\`.`, t`\`(b, a), cov = np.polyfit(x, y, 1, w=1/sy, cov='unscaled')\`; \`mc2 = 1/b\`, \`s_mc2 = np.sqrt(cov[0, 0]) / b**2\`.`],
      teach: t`Error bars travel through a transformation: the σ of $1/E'$ is $\sigma_{E'}/E'^2$.`,
      explain: t`$m_ec^2 = ${CM.toFixed(1)} \pm ${CSM.toFixed(1)}$ keV, $z = ${((CM - MC2) / CSM).toFixed(1)}$ against CODATA. The intercept, $${pmT(CF.a * 1000, CF.sa * 1000)}\ \text{MeV}^{-1}$, is consistent with zero — a check that the energy scale has no offset.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-slope', difficulty: 2,
      gen(r) {
        const b = r.float(1.92, 2.0, 0.001), sb = r.float(0.004, 0.012, 0.001);
        const ans = 1000 / b;
        return {
          prompt: t`A Compton fit gives slope $b = ${b.toFixed(3)} \pm ${sb.toFixed(3)}\ \text{MeV}^{-1}$. What is $m_ec^2$ in keV? (Its uncertainty would be $\sigma_b/b^2$.)`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1.6], y: [0, 3.3], xlabel: '1 − cos θ', ylabel: '1/E′ − 1/E (MeV⁻¹)', axesAt: 'edge', curves: [{ fn: `${b}*x`, color: 'gold' }] }, caption: t`The fitted line; its slope is $1/(m_ec^2)$ in MeV⁻¹.` },
          answer: ans, units: 'keV', tol: { rel: 0.002 },
          errors: [{ value: 1 / b, feedback: 'That is in MeV. The question asks for keV.' }, { value: b * 1000, feedback: t`The slope is $1/(m_ec^2)$: invert it.` }].filter((e) => Math.abs(e.value - ans) > 0.003 * ans),
          hints: [t`$m_ec^2 = 1/b$; $1/\text{MeV}^{-1}$ is MeV.`],
          teach: 'The rest energy is the reciprocal of the slope.',
          explain: t`$m_ec^2 = 1/${b.toFixed(3)}\ \text{MeV} = ${ans.toFixed(1)}$ keV, $\pm ${(1000 * sb / b ** 2).toFixed(1)}$ keV: $z = ${((ans - MC2) / (1000 * sb / b ** 2)).toFixed(1)}$ against 511.0 keV.`,
        };
      },
    }),
    num({
      id: 'cp-telescope', difficulty: 3, transfer: true,
      gen(r) {
        const E = 1808.65, E1 = r.pick([300, 450, 600, 750, 900, 1050]);
        const Ep = E - E1;
        const ans = Math.acos(1 - MC2 * (1 / Ep - 1 / E)) / D2R;
        return {
          prompt: t`A Compton telescope in orbit (like COMPTEL or COSI) records a photon scattering in one detector, which absorbs the recoil electron’s ${E1} keV, and then stopping in a second. If the photon came from the 1808.65 keV line of interstellar aluminium-26, through what angle did it scatter?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-1.5, 2.6], y: [-0.45, 1.1], axes: false, xticks: 0, yticks: 0, xlabel: '', ylabel: '', curves: [{ param: ['1.6*t', '0'], t: [0, 1], color: 'ink3', dash: [5, 4], width: 1.4 }, { param: ['0.45*cos(t)', '0.45*sin(t)'], t: [0, 0.4636], color: 'gold', width: 1.6 }], arrows: [{ from: [-1.4, 0], to: [-0.05, 0], color: 'gold' }, { from: [0, 0], to: [1.55, 0.775], color: 'accent' }], points: [{ x: 0, y: 0, r: 7, color: 'violet', label: 'D1 absorbs E₁', labelDy: 18, labelDx: -30 }, { x: 1.6, y: 0.8, r: 7, color: 'violet', label: 'D2 absorbs E′', labelDx: 10 }, { x: -1.3, y: 0, r: 0, label: 'γ, 1808.65 keV', labelDy: -14 }, { x: 0.5, y: 0.12, r: 0, label: 'θ', labelDy: 0 }] }, caption: 'Two-detector geometry, schematic: the angle at D1 is what the energies give. The source lies somewhere on a cone of that half-angle.' },
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.4 },
          errors: [{ value: Math.acos(1 - MC2 * (1 / E1 - 1 / E)) / D2R, feedback: 'E′ is the scattered photon’s energy: what is left after the electron took its share, E − E₁.' }].filter((e) => Number.isFinite(e.value) && Math.abs(e.value - ans) > 1),
          hints: [t`The scattered photon has $E' = 1808.65 - ${E1}$ keV.`, t`$\cos\theta = 1 - m_ec^2\,(1/E' - 1/E)$.`],
          teach: 'Turned around, the Compton formula gives the scattering angle from two measured energies — the basis of every Compton telescope.',
          explain: t`$E' = ${Ep.toFixed(2)}$ keV, $\cos\theta = 1 - 511.0\,(1/${Ep.toFixed(1)} - 1/1808.65) = ${(1 - MC2 * (1 / Ep - 1 / E)).toFixed(4)}$, so $\theta = ${ans.toFixed(1)}^\circ$. Each photon places its source on a cone of that half-angle; many cones intersect at the source — how COMPTEL mapped Al-26 across the Galaxy.`,
        };
      },
    }),
    mcq({
      id: 'cp-order', difficulty: 3,
      prompt: t`You must run the Compton experiment again next week with the same slowly drifting electronics, and no time to re-read the Cs-137 line at every angle. Which plan best protects $m_ec^2$?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [0, 8], y: [0.97, 1.005], xlabel: 'hour of the day', ylabel: 'relative gain', axesAt: 'edge', curves: [{ fn: '1 - 0.025*x/7', color: 'warn', domain: [0, 7] }] }, caption: 'A gain that falls steadily through a day of counting (illustrative).' },
      choices: ['Take the angles in a shuffled order, and read Cs-137 at the start, middle and end to model the drift', 'Take the angles in increasing order, as before, but count twice as long at each', 'Fit only the three largest angles, where the shift is biggest', 'Force the fitted line through the origin'],
      answer: 0,
      why: {
        1: 'Longer counting shrinks the statistical bars, so the same bias becomes even more significant.',
        2: 'The largest angles are the last measured — the most drifted — and fewer points give a worse slope.',
        3: 'Forcing the intercept does not remove a drift that tilts the line.',
      },
      hints: ['What made the drift harmful was its correlation with the angle. How do you break that?', 'A reference line read now and then measures the drift itself, so it can be divided out.'],
      teach: 'Randomize the order of settings so a drift becomes scatter, and monitor a reference so you can correct it.',
      explain: t`Shuffling decorrelates time from angle: the drift then shows up as excess scatter ($\chi^2/\nu > 1$) instead of a false slope, and three Cs-137 readings let you correct it outright. This is the design rule of [choosing what to vary](#/lesson/lab.A10.1).`,
    }),
  ],
  sources: [
    SRC.codata,
    SRC.nndc,
    SRC.knoll,
    { label: 'V. Schönfelder et al., Instrument description and performance of the Imaging Gamma-Ray Telescope COMPTEL, ApJS 86, 657 (1993)', url: 'https://doi.org/10.1086/191794' },
  ],
});
