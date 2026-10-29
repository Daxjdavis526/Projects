// The Zeeman effect — the lab view: the cadmium red line (643.8 nm, a singlet
// transition, so the normal Zeeman pattern) in an electromagnet, viewed
// across the field through a polarizer and a Fabry–Pérot etalon. The σ
// components' ring shift as a fraction of the order spacing gives the
// frequency shift; a line through the shifts against B gives μ_B/h and e/m.
// The systematic: the probe calibrated at the gap centre, the lamp's glowing
// column where the field is 3 % weaker — invisible in the residuals, found
// only by mapping the field. Orders overlapping at high field, the free
// spectral range, and interstellar Zeeman splitting of the 21-cm line as the
// transfer. Theory: phys4700.M8.4. Every number is computed here from the
// seeded model the labg-rig simulation draws with (_labg.js).
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { G, rig, pmT, resT, f, tex, zT, SIMNOTE, SRC } from './_labg.js';
import { r6, table } from './_labf.js';

const t = String.raw;
const Z = G.ZM;
const FSR = G.zmFSR(), DEL = G.zmDelta();
const MUBH = G.K.muBh;

// ── the worked example: seed 6, lamp off centre ──
const EXc = G.run('zeeman', { seed: 6, analysis: 'centre' });
const EXm = G.run('zeeman', { seed: 6, analysis: 'mapped' });
const EX6 = EXc.rows[4];                                   // B = 0.60 T
const Rc = EXc.results[0], Rm = EXm.results[0], Em = EXm.results[1];

// ── the code exercise: lamp centred, seed 7, printed numbers re-fitted ──
const CD = G.run('zeeman', { seed: 7, flags: { gradient: false } });
const CB = CD.rows.map((q) => q.B), CS = CD.rows.map((q) => +q.split.toFixed(3)), CDl = CD.rows.map((q) => +q.delta.toFixed(3));
const CDV = CS.map((s, i) => (s / CDl[i]) * FSR / 2);
const CF = G.fitLine(CB, CDV);

// a ring-profile picture: two σ components per order at shift dv (GHz)
const profile = (dv) => {
  const F = (4 * Z.R) / (1 - Z.R) ** 2;
  return `0.5/(1 + ${r6(F)}*sin(pi*(${Z.eps0} + x/${r6(DEL)} + ${r6(dv / FSR)}))^2) + 0.5/(1 + ${r6(F)}*sin(pi*(${Z.eps0} + x/${r6(DEL)} - ${r6(dv / FSR)}))^2)`;
};
const ringPic = (dv, caption) => ({ type: 'graph', params: { aspect: 'wide', x: [0, r6(3.3 * DEL)], y: [0, dv < 0.6 ? 1.1 : 0.62], xlabel: 'r² (mm²)', ylabel: 'intensity', axesAt: 'edge', curves: [{ fn: profile(dv), color: 'teal', width: 1.6, samples: 2000 }] }, caption });

export default lesson({
  id: 'lab.E.11',
  title: 'The Zeeman effect',
  minutes: 18, difficulty: 3,
  lab: true,
  intro: t`In a magnetic field $B$ an atomic level with angular momentum splits by its magnetic moment ([the theory](#/lesson/phys4700.M8.4)). The cadmium red line at 643.8 nm joins two singlet levels (total spin zero), so it shows the **normal** Zeeman pattern: an unshifted π line polarized along $\vec B$, and two σ lines shifted by exactly $\pm\mu_B B/h$ — about 14 GHz per tesla, a few picometres. A grating cannot resolve that; a Fabry–Pérot etalon can ([the etalon itself](#/lesson/lab.E.6)). Its rings come in orders spaced by $\Delta$ in $r^2$, and a frequency shift moves a ring by the same fraction of that spacing as of the free spectral range $c/(2nd)$:

$$\Delta\nu = \frac{\delta}{2\Delta}\cdot\frac{c}{2nd} = \frac{\mu_B}{h}\,B$$

So you measure squared ring radii, not wavelengths, and a straight line of $\Delta\nu$ against $B$ has slope $\mu_B/h$.`,
  symbols: [
    { tex: '\\Delta\\nu', text: 'the shift of each σ line from the zero-field frequency, in GHz' },
    { tex: '\\delta', text: 'the difference in $r^2$ between the σ⁺ and σ⁻ rings of one order, in mm² (the two lines are $2\\Delta\\nu$ apart)' },
    { tex: '\\Delta', text: 'the spacing in $r^2$ between successive orders, in mm²: $f^2n\\lambda/d$ for a camera lens of focal length $f$' },
    { tex: 'c/(2nd)', text: 'the etalon’s free spectral range: the frequency shift that moves a ring onto the next order’s place. For $n = 1.457$ (fused silica) and $d = 3.000$ mm it is 34.29 GHz' },
    { tex: '\\mu_B', text: 'the Bohr magneton $e\\hbar/(2m_e)$; CODATA 2022: $\\mu_B/h = 13.996\\,244\\,9$ GHz/T' },
    { tex: 'h', text: 'Planck’s constant, $6.626\\,070\\,15\\times10^{-34}$ J s (exact)' },
    { tex: 'B', text: 'the magnetic field at the glowing atoms, in T — read with a Hall probe, which is where the trouble lies' },
  ],
  why: t`Zeeman splitting is how astronomers measure magnetic fields they can never visit — in sunspots, in interstellar clouds, around young stars — and the same etalon technique reads frequency shifts far below a grating’s reach.`,
  visual: {
    type: 'labg-rig',
    title: 'The bench: cadmium’s red line in a field, through an etalon',
    lead: t`Eight field settings from 0.20 to 0.90 T. The top panel is the ring profile at one field: each order’s ring split into a σ⁻ and σ⁺ pair. Below, the shift of each σ line against $B$, its fit and residuals; the readout gives $\mu_B/h$ and $e/m = 4\pi\mu_B/h$ against CODATA.`,
    tasks: [
      'Slide the profile’s field from 0.2 to 0.9 T: the pairs open up until, near 0.6 T, the σ⁺ ring of one order meets the σ⁻ ring of the next. Above that you must follow each ring up from low field to know which is which.',
      t`With the lamp off the gap centre, $\mu_B/h$ sits about 3 % low, z ≈ −2 to −3 — yet the residuals are flat and χ²/ν is fine. A scale error keeps a line straight.`,
      'Switch the analysis to “B corrected by a field map”: the slope returns to CODATA within its (slightly larger) uncertainty.',
    ],
    params: { exp: 'zeeman', seed: 6 },
    caption: t`Simulated ring positions: each $r^2$ read from a ring fit with $\sigma = 0.03$ mm² for the pair spacing and $0.012$ mm² for the order spacing; etalon $n = 1.457$, $d = 3.000$ mm, reflectance 0.85, camera lens 150 mm (illustrative). The probe’s calibration is a 1 % Type B uncertainty, included in the result. ${SIMNOTE}`,
  },
  example: {
    prompt: t`At the probe’s reading $B = 0.60$ T the order spacing is $\Delta = ${EX6.delta.toFixed(3)}$ mm² and the σ pair is $\delta = ${EX6.split.toFixed(3)}$ mm² apart. A straight line through all eight fields gives $\mu_B/h = ${resT(Rc)}$ GHz/T (probe calibration included) — $z = ${zT(Rc.z, 1)}$ against CODATA. A field map then shows the lamp’s glowing column sits where the field is $0.970 \pm 0.005$ of the gap centre’s. Convert the one point, then correct the result.`,
    visual: rig('zeeman', { seed: 6, raw: false }, t`The run as first analysed: the shift of each σ line against the probe’s reading of $B$ at the gap centre, the weighted line and the residuals. ${SIMNOTE}`),
    steps: [
      { label: 'Free spectral range', text: t`$c/(2nd) = 2.998\times10^8/(2 \times 1.457 \times 0.003\,000) = ${FSR.toFixed(2)}$ GHz.` },
      { label: 'One point', text: t`The pair is $2\Delta\nu$ apart, so $\Delta\nu = \dfrac{\delta}{2\Delta}\,\text{FSR} = \dfrac{${EX6.split.toFixed(3)}}{2 \times ${EX6.delta.toFixed(3)}} \times ${FSR.toFixed(2)} = ${EX6.dv.toFixed(2)}$ GHz.` },
      { label: 'Sense check', text: t`$\mu_B B/h = 13.996 \times 0.60 = ${(MUBH * 0.6).toFixed(2)}$ GHz. The point is about ${(100 * (1 - EX6.dv / (MUBH * 0.6))).toFixed(0)} % low — like the whole line.` },
      { label: 'Read the residuals', text: t`They scatter evenly with $\chi^2/\nu = ${EXc.fit.chi2r.toFixed(2)}$. A field that is 3 % weaker everywhere the atoms are just rescales the $B$ axis: the line stays straight, so no residual plot can reveal it.` },
      { label: 'Correct the field', text: t`Replace each probe reading by the field the atoms feel, $B_{\text{lamp}} = 0.970\,B_{\text{probe}}$, so the slope against $B_{\text{lamp}}$ is the old slope over 0.970. The map’s own $0.5\,\%$ joins the probe’s $1\,\%$ in quadrature.` },
      { label: 'Result', text: t`$\mu_B/h = ${resT(Rm)}$ GHz/T, $z = ${zT(Rm.z, 2)}$ against $13.9962$; and $e/m = 4\pi\mu_B/h = (${resT(Em)})\times10^{11}$ C/kg.` },
    ],
    answer: t`$\Delta\nu = ${EX6.dv.toFixed(2)}$ GHz at the probe’s 0.60 T; corrected for the field map, $\mu_B/h = ${resT(Rm)}$ GHz/T, consistent with CODATA ($z = ${zT(Rm.z, 1)}$).`,
  },
  practice: [
    num({
      id: 'fsr', difficulty: 1,
      gen(r) {
        const d = r.pick([2, 3, 4, 5, 8, 10]), n = r.pick([1.000, 1.457]);
        const ans = G.K.c / (2 * n * d * 1e-3) / 1e9;
        return {
          prompt: t`An etalon ${n === 1 ? 'of two mirrors with an air gap' : 'of solid fused silica ($n = 1.457$)'} is ${d} mm thick. What is its free spectral range $c/(2nd)$, in GHz?`,
          visual: ringPic(0, t`Rings of one unsplit line, as a profile in $r^2$: equally spaced orders. Moving the frequency by one free spectral range moves each ring onto the next.`),
          answer: ans, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: G.K.c / (n * d * 1e-3) / 1e9, feedback: 'The light crosses the gap twice per round trip: c/(2nd).' }, ...(n !== 1 ? [{ value: G.K.c / (2 * d * 1e-3) / 1e9, feedback: 'Inside glass the optical path is n times longer: include n.' }] : [])].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\text{FSR} = c/(2nd)$ with $d$ in metres.`],
          teach: 'The free spectral range c/(2nd) is the etalon’s ruler: shifts are measured as fractions of it.',
          explain: t`$c/(2nd) = 2.998\times10^8/(2 \times ${n} \times ${d}\times10^{-3}) = ${ans.toFixed(2)}$ GHz. A thicker etalon resolves finer shifts but its orders overlap sooner.`,
        };
      },
    }),
    num({
      id: 'one-point', difficulty: 2,
      gen(r) {
        const B = r.pick([0.25, 0.35, 0.45, 0.55]);
        const dv = MUBH * B * r.float(0.98, 1.02, 0.001);
        const Dl = +(DEL * r.float(0.99, 1.01, 0.001)).toFixed(3);
        const dl = +((2 * dv / FSR) * Dl).toFixed(3);
        const ans = (dl / (2 * Dl)) * FSR;
        return {
          prompt: t`With an etalon whose free spectral range is $${FSR.toFixed(2)}$ GHz, the order spacing is $\Delta = ${Dl}$ mm² and the σ⁺ and σ⁻ rings of one order are $\delta = ${dl}$ mm² apart. What is the shift $\Delta\nu$ of each σ line, in GHz?`,
          visual: ringPic((dl / (2 * Dl)) * FSR, t`The ring profile: each order split into a σ⁻ and σ⁺ pair.`),
          answer: ans, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: (dl / Dl) * FSR, feedback: t`$\delta$ separates σ⁺ from σ⁻: that is $2\Delta\nu$. Halve it.` }, { value: (dl / Dl), feedback: 'That is only the fraction of an order. Multiply by the free spectral range.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`A shift of one whole order spacing in $r^2$ is one free spectral range in frequency.`, t`$2\Delta\nu = (\delta/\Delta)\,\text{FSR}$.`],
          teach: 'A ring’s shift as a fraction of the order spacing is the frequency shift as a fraction of the free spectral range.',
          explain: t`$\Delta\nu = \dfrac{${dl}}{2 \times ${Dl}} \times ${FSR.toFixed(2)} = ${ans.toFixed(2)}$ GHz — at $${B}$ T that corresponds to $\mu_B/h \approx ${(ans / B).toFixed(2)}$ GHz/T.`,
        };
      },
    }),
    num({
      id: 'picometres', difficulty: 2,
      gen(r) {
        const B = r.pick([0.3, 0.5, 0.8, 1.0, 1.2]);
        const dv = MUBH * B * 1e9;
        const ans = (Z.lam ** 2 * dv) / G.K.c * 1e12;
        return {
          prompt: t`By how many picometres does each σ component of the cadmium 643.8 nm line move in $B = ${B}$ T?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-30, 30], y: [0, 1.15], xlabel: 'wavelength offset (pm)', ylabel: 'intensity', axesAt: 'edge', curves: [{ fn: `1/(1 + ((x - ${r6(ans)})/0.9)^2) + 1/(1 + ((x + ${r6(ans)})/0.9)^2)`, color: 'teal', samples: 2000 }] }, caption: 'The two σ lines, with an illustrative linewidth. The offsets on the axis are what is asked for.' },
          answer: ans, units: 'pm', tol: { rel: 0.01 },
          errors: [{ value: 2 * ans, feedback: 'That is the σ⁺–σ⁻ separation; each line moves half of it.' }, { value: (Z.lam * dv) / G.K.c * 1e12 * 1e-3, feedback: t`Use $\Delta\lambda = \lambda^2\Delta\nu/c$, not $\lambda\Delta\nu/c$.` }].filter((e) => Math.abs(e.value - ans) > 0.02 * ans),
          hints: [t`$\Delta\nu = \mu_B B/h$, and $\Delta\lambda = \lambda^2\Delta\nu/c$ (from $\lambda = c/\nu$).`, t`$\Delta\nu = 13.996 \times ${B} = ${(MUBH * B).toFixed(3)}$ GHz.`],
          teach: 'Zeeman shifts in a lab magnet are picometres: a fraction of a part in 10⁵ of the wavelength.',
          explain: t`$\Delta\lambda = (643.85\times10^{-9})^2 \times ${tex(dv, 4)}/2.998\times10^8 = ${ans.toFixed(2)}$ pm — about $${tex(ans * 1e-12 / Z.lam, 2)}$ of the wavelength. A good 1200 line/mm grating resolves about 20 pm; the etalon resolves under 1 pm.`,
        };
      },
    }),
    mcq({
      id: 'polarizer', difficulty: 2,
      prompt: t`You look at the lamp across the field (transverse to $\vec B$) through a polarizer. With the polarizer’s axis perpendicular to $\vec B$, what do you see in each order?`,
      visual: { type: 'graph', params: { aspect: 'wide', x: [-3, 3], y: [-1.6, 1.6], equal: true, xlabel: '', ylabel: '', xticks: 0, yticks: 0, axes: false, arrows: [{ from: [-2.4, -1.2], to: [-2.4, 1.2], color: 'gold', label: 'B' }, { from: [-0.4, 0], to: [2.4, 0], color: 'accent', label: 'to the etalon' }], points: [{ x: -1, y: 0, r: 9, color: 'teal', label: 'lamp', labelDy: -16 }] }, caption: 'Transverse viewing: the light travels perpendicular to the field. Schematic.' },
      choices: ['The two σ components only: the π line is polarized along B and is blocked', 'The π component only', 'All three components, equally bright', 'The two σ components, circularly polarized in opposite senses'],
      answer: 0,
      why: {
        1: 'The π line oscillates along B; a polarizer perpendicular to B blocks it. Turn the polarizer 90° to see π alone.',
        2: 'Without a polarizer you would see all three; the polarizer selects by direction.',
        3: 'Circular σ light is seen looking *along* the field (longitudinal view). Seen transversely, each σ line is linearly polarized perpendicular to B.',
      },
      hints: ['π transitions (Δm = 0) radiate like a dipole oscillating along B; σ transitions (Δm = ±1) like dipoles rotating in the plane perpendicular to B.'],
      teach: 'In transverse view π light is polarized along B and σ light perpendicular to it — a polarizer picks which you measure.',
      explain: t`Removing the unshifted π ring halves the clutter: each order shows just the σ⁻ and σ⁺ pair, whose separation $\delta$ you measure. Polarization is part of the evidence — it is how Hale knew in 1908 that sunspots are magnetic.`,
    }),
    mcq({
      id: 'scale-error', difficulty: 3,
      prompt: t`Your fit of $\Delta\nu$ against $B$ has flat residuals and $\chi^2/\nu = 1.1$, but $\mu_B/h$ comes out $3.0\,\%$ low ($z = -2.8$). Which explanation fits **all** of that?`,
      visual: rig('zeeman', { seed: 11, raw: false }, t`A run like the one described: shift against the probe’s reading, fit and residuals. ${SIMNOTE}`),
      choices: ['The field at the atoms is a fixed fraction of the probe’s reading (a calibration or position error)', 'The ring radii are read with too much noise', 'The etalon’s free spectral range is wrong because the rings are not exactly circular', 'The fit should have been forced through the origin'],
      answer: 0,
      why: {
        1: 'More noise would raise χ²/ν (or widen the error bars), not shift the slope.',
        2: 'Non-circular rings add scatter to individual readings; they do not make every point low by the same 3 %. (An FSR error is also a scale error — but it comes from n and d, which are known to 0.1 %.)',
        3: 'The intercept is already consistent with zero; forcing it through zero barely changes the slope.',
      },
      hints: ['What kind of error keeps a straight line straight but changes its slope?', 'Which input has a 1 % calibration and depends on where in the gap you measure?'],
      teach: 'A scale error in x keeps the data linear and χ² happy: only an independent check — here, mapping the field where the atoms are — exposes it.',
      explain: t`A field that is 3 % weaker at the lamp than at the probe’s calibration point multiplies every $B$ by 0.97 — the line stays straight, the slope reads 3 % high in $B$, so $\mu_B/h$ reads 3 % low. Residual plots cannot see a systematic that is the same shape as the model.`,
    }),
    num({
      id: 'em', difficulty: 2,
      gen(r) {
        const m = r.float(13.6, 14.4, 0.01);
        const ans = 4 * Math.PI * m * 1e9;
        return {
          prompt: t`Your slope is $\mu_B/h = ${m}$ GHz/T. Since $\mu_B = e\hbar/(2m_e)$, what value of $e/m_e$ does it imply, in C/kg?`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [0, 1], y: [0, 15], xlabel: 'B (T)', ylabel: 'Δν (GHz)', axesAt: 'edge', curves: [{ fn: `${m}*x`, color: 'gold' }] }, caption: t`The fitted line through the origin of $\Delta\nu$ against $B$: its slope is $\mu_B/h$.` },
          answer: ans, units: 'C/kg', tol: { rel: 0.005 },
          errors: [{ value: 2 * Math.PI * m * 1e9, feedback: t`$\mu_B/h = e\hbar/(2m_eh) = e/(4\pi m_e)$: the factor is $4\pi$.` }, { value: 4 * Math.PI * m, feedback: 'Convert GHz to Hz first.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\hbar = h/(2\pi)$, so $\mu_B/h = e/(4\pi m_e)$.`],
          teach: 'The normal Zeeman slope is e/(4πm): the etalon measures the electron’s charge-to-mass ratio from light alone.',
          explain: t`$e/m_e = 4\pi \times ${m}\times10^9 = ${tex(ans, 4)}$ C/kg, against CODATA’s $1.758\,82\times10^{11}$ — the same quantity Thomson bent a beam to measure ([E.1](#/lesson/lab.E.1)), here from atomic spectra.`,
        };
      },
    }),
    code({
      id: 'fit-zeeman', difficulty: 3,
      prompt: t`A run with the lamp centred: for each field, the σ pair spacing \`split\` and the order spacing \`Delta\` (both mm²). Compute each line’s shift \`dv\` (GHz), fit a straight line of \`dv\` against \`B\` with \`np.polyfit\` (unweighted is fine here), and set \`muBh\` to the slope.`,
      starter: t`import numpy as np

B     = np.array([${CB.join(', ')}])   # T
split = np.array([${CS.join(', ')}])   # mm²
Delta = np.array([${CDl.join(', ')}])  # mm²
FSR = 299792458 / (2 * 1.457 * 3.000e-3) / 1e9   # GHz

# your code: dv, then the slope muBh
muBh = 0.0
print(f"mu_B/h = {muBh:.3f} GHz/T  (CODATA 13.996)")`,
      answer: t`import numpy as np

B     = np.array([${CB.join(', ')}])   # T
split = np.array([${CS.join(', ')}])   # mm²
Delta = np.array([${CDl.join(', ')}])  # mm²
FSR = 299792458 / (2 * 1.457 * 3.000e-3) / 1e9   # GHz

dv = split / (2 * Delta) * FSR
muBh, intercept = np.polyfit(B, dv, 1)
print(f"mu_B/h = {muBh:.3f} GHz/T  (CODATA 13.996)")`,
      tests: [
        { name: t`each shift is half the pair spacing, as a fraction of an order, times the FSR`, code: `abs(dv[3] - ${CDV[3]}) < 1e-9` },
        { name: t`the slope matches the reference fit, $${CF.b.toFixed(3)}$ GHz/T`, code: `abs(muBh - ${CF.b}) < 1e-9` },
      ],
      hints: [t`\`dv = split / (2 * Delta) * FSR\`.`, t`\`muBh, intercept = np.polyfit(B, dv, 1)\` — the slope comes first.`],
      teach: 'Ring positions turn into frequencies through one ratio and one constant of the etalon.',
      explain: t`The slope is $${CF.b.toFixed(3)} \pm ${CF.sb.toFixed(3)}$ GHz/T (statistical), $${((CF.b - MUBH) / Math.hypot(CF.sb, 0.01 * CF.b)).toFixed(1)}\sigma$ from CODATA once the probe’s 1 % calibration is added.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-overlap', difficulty: 3,
      gen(r) {
        const d = r.pick([2, 3, 4, 5]);
        const fsr = G.K.c / (2 * 1.457 * d * 1e-3) / 1e9;
        const ans = fsr / (4 * MUBH);
        return {
          prompt: t`A fused-silica etalon ($n = 1.457$) is ${d} mm thick. At what field do the σ⁺ ring of one order and the σ⁻ ring of the next order coincide (normal Zeeman effect)?`,
          visual: ringPic(MUBH * 0.3, t`For comparison, a 3 mm etalon at 0.30 T: each order’s σ pair well clear of the next order’s.`),
          answer: ans, units: 'T', tol: { rel: 0.01 },
          errors: [{ value: fsr / (2 * MUBH), feedback: 'At FSR/2 per line, σ⁺ of one order lands on the unshifted position of the next. Each ring moves halfway to meet the other: 2Δν = FSR/2.' }, { value: fsr / MUBH, feedback: 'That moves each line by a whole order. They meet when the pair spacing 2Δν is half an order.' }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: ['σ⁺ of order p moves up by Δν; σ⁻ of order p + 1 starts one FSR above and moves down by Δν.', t`They meet when $2\Delta\nu = \text{FSR} - 2\Delta\nu$, i.e. $\Delta\nu = \text{FSR}/4$.`],
          teach: 'Orders overlap once the Zeeman shift reaches a quarter of the free spectral range: beyond that, rings must be followed up from low field.',
          explain: t`FSR $= ${fsr.toFixed(2)}$ GHz, so $\Delta\nu = \text{FSR}/4 = ${(fsr / 4).toFixed(2)}$ GHz at $B = ${ans.toFixed(3)}$ T. Above it the pattern looks like an unsplit set of rings and then reopens with the labels swapped — the classic way to misassign rings.`,
        };
      },
    }),
    num({
      id: 'cp-hi', difficulty: 3, transfer: true,
      gen(r) {
        const sep = r.pick([14, 20, 28, 42, 56]);
        const perMicroG = 2 * MUBH * 1e9 * 1e-10;          // Hz per μG between σ± for g_F = 1
        const ans = sep / perMicroG;
        return {
          prompt: t`Radio astronomers measure the magnetic field in cold interstellar clouds from the Zeeman splitting of the 21-cm hydrogen line. For its upper level $g_F = 1$, so the σ⁺ and σ⁻ components are $2\mu_B B/h$ apart. A cloud shows a separation of ${sep} Hz. What is the line-of-sight field? Give the number of microgauss ($1\ \mu\text{G} = 10^{-10}$ T).`,
          visual: { type: 'graph', params: { aspect: 'wide', x: [-60, 60], y: [-1.2, 1.2], xlabel: 'frequency offset (Hz)', ylabel: 'V (circular difference)', axesAt: 'edge', curves: [{ fn: `-(x/12)*exp(-(x/30)^2/2)`, color: 'accent' }] }, caption: 'Schematic: the split is far smaller than the line’s width, so it shows only as a faint S-shaped difference between the two circular polarizations.' },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: ans * 2, feedback: t`The separation is $2\mu_B B/h$; each component moves only half of it.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\mu_B/h = 13.996$ GHz/T $= 1.3996$ Hz/μG.`, t`$B = \text{separation}/(2 \times 1.3996\ \text{Hz}/\mu\text{G})$.`],
          teach: t`The same $\mu_B/h$ you measured with an etalon reads microgauss fields across the Galaxy: 2.8 Hz of splitting per microgauss.`,
          explain: t`$2\mu_B/h = ${perMicroG.toFixed(3)}$ Hz/μG, so $B = ${sep}/${perMicroG.toFixed(3)} = ${ans.toFixed(1)}\ \mu\text{G}$ — fields about $10^{4}$–$10^{5}$ times weaker than Earth’s, measured from 1.4 GHz with Hz precision.`,
        };
      },
    }),
    mcq({
      id: 'cp-check', difficulty: 2,
      prompt: t`Which check would best expose a systematic error in the field the atoms actually feel?`,
      visual: rig('zeeman', { seed: 6, raw: false, residuals: false }, t`A fit that looks clean but sits $3\sigma$ from CODATA. ${SIMNOTE}`),
      choices: ['Map the field with the probe at the lamp’s position, across the glowing column', 'Take each field setting five times and average', 'Repeat the fit with the intercept forced to zero', 'Read the ring radii from a higher-resolution camera'],
      answer: 0,
      why: {
        1: 'Repeats shrink random scatter; a systematic in B survives any amount of averaging.',
        2: 'The intercept is not the problem; the slope is scaled.',
        3: 'Better ring readings improve δ and Δ, not B.',
      },
      hints: ['Which measured quantity is uncertain in a way the fit cannot see?'],
      teach: 'A systematic is found by measuring the suspect quantity a second, independent way — not by taking more of the same data.',
      explain: t`Mapping the field where the atoms are (or swapping in a second, independently calibrated probe) tests exactly the assumption the analysis leans on. That is what the worked example did, and it moved $z$ from $${zT(Rc.z, 1)}$ to $${zT(Rm.z, 1)}$.`,
    }),
  ],
  sources: [
    SRC.codata,
    SRC.melissinos,
    { label: 'C. Heiles & T. H. Troland, The Millennium Arecibo 21 Centimeter Absorption-Line Survey. IV. Statistics of Magnetic Field, ApJ 624, 773 (2005)', url: 'https://doi.org/10.1086/428896' },
    { label: 'G. E. Hale, On the probable existence of a magnetic field in sun-spots, ApJ 28, 315 (1908)', url: 'https://doi.org/10.1086/141602' },
  ],
});
