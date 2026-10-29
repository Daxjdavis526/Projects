// Michelson and Fabry–Pérot interferometers (Hecht §9.4, §9.6). PHYS 2220
// O3.3 counted Michelson fringes (2ΔL = Nλ) and met LIGO. Here: the Michelson's
// circular fringes, 2d cos θ = mλ, with rings crowding outward (θ_p ≈ √(pλ/d));
// then multiple-beam interference between two parallel mirrors of
// reflectance R: the Airy function T = 1/(1 + F sin²(δ/2)), F = 4R/(1 − R)²,
// δ = 4πnd cos θ/λ₀; free spectral range c/(2nd); finesse ℱ = π√R/(1 − R)
// (unequal mirrors: π(R₁R₂)^{1/4}/(1 − √(R₁R₂))); linewidth FSR/ℱ; resolving
// power mℱ. Worked example: an Advanced LIGO arm cavity (3994.5 m, ITM
// transmission 1.4 %, finesse 450 — LSC, CQG 32, 074001, 2015): FSR 37.5 kHz,
// linewidth ≈ 84 Hz, phase gain (1 + r₁)/(1 − r₁) ≈ 2ℱ/π ≈ 280. Transfers: a
// detector's arm-cavity linewidth, a solar Hα etalon's spacing.
import { lesson, mcq, num } from '../../src/core/content.js';
import { C, nOf, sf } from './_op.js';
import { seg, word, pic } from './_op3.js';

const t = String.raw;
const finesse = (R1, R2 = R1) => (Math.PI * (R1 * R2) ** 0.25) / (1 - Math.sqrt(R1 * R2));

// the worked example: an Advanced LIGO arm cavity
const EX = { L: 3994.5, T1: 0.014, R2: 1 };
EX.R1 = 1 - EX.T1;
EX.fsr = C / (2 * EX.L);
EX.F = finesse(EX.R1, EX.R2);
EX.fwhm = EX.fsr / EX.F;
EX.r1 = Math.sqrt(EX.R1);
EX.gain = (1 + EX.r1) / (1 - EX.r1);

/** A Fabry–Pérot: two parallel mirrors and a beam bouncing between them, leaking out at each bounce. */
function fpPic(caption, labels = true) {
  const curves = [seg([3, -1.6], [3, 2.4], 'ink2', { width: 5 }), seg([6, -1.6], [6, 2.4], 'ink2', { width: 5 }), seg([0, 2.1], [3, 1.8], 'gold', { width: 2.6 })];
  let y = 1.8, w = 2.4;
  for (let k = 0; k < 6; k++) {
    const x0 = k % 2 ? 6 : 3, x1 = k % 2 ? 3 : 6;
    curves.push(seg([x0, y], [x1, y - 0.3], 'gold', { width: w }));
    y -= 0.3;
    if (!(k % 2)) curves.push(seg([6, y], [9, y - 0.3], 'accent', { width: Math.max(0.8, w - 0.3) }));
    w = Math.max(0.8, w - 0.3);
  }
  return {
    type: 'graph', caption,
    params: pic([-0.3, 9.6], [-1.9, 2.7], {
      curves,
      points: labels ? [word(3, -1.85, 'mirror (R)', 'ink3'), word(6, -1.85, 'mirror (R)', 'ink3'), word(4.5, 2.45, 'd', 'ink'), word(8.2, 1.5, 'transmitted', 'accent'), word(0.8, 2.45, 'in', 'gold')] : [],
      arrows: labels ? [{ from: [4.2, 2.45], to: [3.05, 2.45], color: 'ink3', width: 1 }, { from: [4.8, 2.45], to: [5.95, 2.45], color: 'ink3', width: 1 }] : [],
    }),
  };
}

/** LIGO's layout: a Michelson whose arms are Fabry–Pérot cavities (input and end test masses). */
const ligoPic = (caption) => ({
  type: 'graph', caption,
  params: pic([-3.6, 10.4], [-2.3, 4.9], {
    curves: [
      seg([-3, 0], [0, 0], 'gold', { width: 2.6 }), seg([0, 0], [9.6, 0], 'gold', { width: 2.6 }), seg([0, 0], [0, 4.4], 'gold', { width: 2.6 }), seg([0, 0], [0, -1.5], 'gold', { width: 1.6, dash: [4, 4] }),
      seg([-0.45, -0.45], [0.45, 0.45], 'ink', { width: 3 }),
      seg([1.3, -0.5], [1.3, 0.5], 'accent', { width: 5 }), seg([9.6, -0.5], [9.6, 0.5], 'accent', { width: 5 }),
      seg([-0.5, 1.2], [0.5, 1.2], 'accent', { width: 5 }), seg([-0.5, 4.4], [0.5, 4.4], 'accent', { width: 5 }),
    ],
    points: [
      word(-2.4, 0.4, 'laser', 'gold'), word(-1.7, -0.75, 'beam splitter', 'ink3'),
      word(1.3, -0.85, 'ITM', 'accent'), word(9.6, -0.85, 'ETM', 'accent'), word(1.05, 1.2, 'ITM', 'accent'), word(1.05, 4.4, 'ETM', 'accent'),
      word(5.45, 0.4, 'arm cavity, 4 km', 'ink2'), { x: 0, y: -1.7, r: 6, color: 'violet', label: 'photodetector', labelDx: 12, labelDy: 4 },
    ],
  }),
});

/** The Airy transmission against round-trip phase, in free spectral ranges. */
const airyPic = (R, caption, extra = {}) => ({
  type: 'graph', caption,
  params: { x: [0, 2.5], y: [0, 1.12], aspect: 'wide', xlabel: 'round-trip phase δ / 2π', ylabel: 'T', xticks: 5, yticks: 2,
    curves: [{ fn: `1/(1 + ${sf((4 * R) / (1 - R) ** 2, 6)}*sin(pi*x)^2)`, color: 'gold', width: 2.4, samples: 4000 }], ...extra },
});

export default lesson({
  id: 'phys4650.O7.2',
  title: 'Michelson and Fabry–Pérot interferometers',
  minutes: 18, difficulty: 3,
  intro: t`A **Michelson** splits a beam in two and recombines it; with mirrors $d$ apart in effective length, light leaving at angle $\theta$ is bright where $2d\cos\theta = m\lambda$, so it shows circular fringes, and every $\lambda/2$ of mirror motion sweeps one fringe past. A **Fabry–Pérot** instead traps light between two parallel mirrors of reflectance $R$, a distance $d$ apart. Each round trip sends a little more out, and all those beams add — with a round-trip phase $\delta = 4\pi n d\cos\theta/\lambda_0$, the transmitted fraction is the **Airy function**

$$T = \frac{1}{1 + F\sin^2(\delta/2)}, \qquad F = \frac{4R}{(1 - R)^2}$$

Peaks sit at $\delta = 2\pi m$, a **free spectral range** $c/(2nd)$ apart in frequency, and each is narrower than that spacing by the **finesse** $\mathcal F = \pi\sqrt R/(1 - R)$.`,
  symbols: [
    { tex: 'T', text: 'the fraction of the light transmitted (ideal, lossless mirrors)' },
    { tex: 'F', text: 'the coefficient of finesse, $4R/(1 - R)^2$: large for good mirrors' },
    { tex: 'R', text: 'each mirror’s power reflectance' },
    { tex: '\\delta', text: 'the phase a wave gains in one round trip between the mirrors' },
    { tex: 'n,\\ d', text: 'the index of the medium between the mirrors and their spacing' },
    { tex: '\\theta', text: 'the angle of the light inside, from the mirrors’ normal' },
    { tex: '\\lambda_0', text: 'the vacuum wavelength' },
    { tex: '\\mathcal F', text: 'the finesse: free spectral range ÷ peak width (FWHM)' },
  ],
  why: t`Fabry–Pérot cavities are the arms of LIGO and Virgo, the resonators of every laser, the narrowest optical filters and the reference of optical clocks: one formula covers them all.`,
  visual: {
    type: 'graph',
    title: 'From two beams to many',
    lead: t`Transmission of a Fabry–Pérot against the round-trip phase (equivalently, the frequency in units of the free spectral range). The dashed curve is two-beam interference, a Michelson’s $\cos^2(\delta/2)$.`,
    tasks: [
      t`Start at $R = 0.04$ (bare glass): the peaks are barely there. Raise $R$ toward 0.99 and watch them sharpen while staying in place.`,
      t`At $R = 0.9$, read the finesse: about 30 — each peak is a thirtieth of the gap between peaks.`,
      t`Compare with the dashed Michelson curve: two beams give broad fringes; many beams give sharp ones. That is why a Fabry–Pérot resolves fine spectral detail.`,
    ],
    params: {
      x: [0, 2.5], y: [0, 1.12], aspect: 'wide', xlabel: 'round-trip phase δ / 2π', ylabel: 'T', xticks: 5, yticks: 4,
      sliders: [{ key: 'R', label: 'Mirror reflectance $R$', min: 0.04, max: 0.99, step: 0.01, value: 0.7, explain: 'Each mirror’s power reflectance. 0.04 is bare glass; good dielectric mirrors exceed 0.999.' }],
      curves: [
        { fn: 'cos(pi*x)^2', color: 'ink3', width: 1.4, dash: [5, 5] },
        { fn: '1/(1 + 4*R/(1 - R)^2*sin(pi*x)^2)', color: 'gold', width: 2.4, samples: 4000 },
      ],
      readouts: [
        { label: 'coefficient of finesse $F$', expr: '4*R/(1 - R)^2', digits: 3 },
        { label: 'finesse $\\mathcal F$', expr: 'pi*sqrt(R)/(1 - R)', digits: 3 },
        { label: 'lowest $T$', expr: '(1 - R)^2/(1 + R)^2', digits: 3, zero: 0 },
      ],
    },
    caption: t`Two identical lossless mirrors, plane waves at normal incidence. Real mirrors absorb and scatter a little, which lowers the peaks; unequal mirrors also stop the peaks reaching 1.`,
  },
  example: {
    prompt: t`**A LIGO arm.** Each 4 km arm of Advanced LIGO is a Fabry–Pérot cavity, $L = ${EX.L}$ m long, between an input test mass that transmits $${sf(EX.T1 * 100, 2)}\%$ of the power and an end test mass that reflects essentially all of it. Find the free spectral range, the finesse, the resonance linewidth, and how much the cavity multiplies the phase shift that a change in arm length produces.`,
    visual: ligoPic(t`Advanced LIGO’s core: a Michelson whose arms are Fabry–Pérot cavities between an input test mass (ITM) and an end test mass (ETM). Recycling mirrors and much else left out; not to scale.`),
    steps: [
      { label: 'Free spectral range', text: t`Resonances are a round trip apart in phase: $\Delta\nu_{\text{FSR}} = \dfrac{c}{2L} = \dfrac{${sf(C, 9)}\ \text{m/s}}{2(${EX.L}\ \text{m})} = ${sf(EX.fsr / 1000, 3)}$ kHz.` },
      { label: 'Finesse', text: t`With $R_1 = ${sf(EX.R1, 3)}$ and $R_2 \approx 1$: $\mathcal F = \dfrac{\pi(R_1R_2)^{1/4}}{1 - \sqrt{R_1R_2}} = \dfrac{\pi(${sf(EX.R1, 3)})^{1/4}}{1 - \sqrt{${sf(EX.R1, 3)}}} = ${sf(EX.F, 3)}$ — the design value is 450.` },
      { label: 'Linewidth', text: t`Each resonance is $\Delta\nu_{\text{FSR}}/\mathcal F = ${sf(EX.fsr, 4)}/${sf(EX.F, 3)} = ${sf(EX.fwhm, 2)}$ Hz wide (full width at half maximum). The laser must hold its frequency far better than that — LIGO locks it to the cavities.` },
      { label: 'Phase gain', text: t`On resonance, the light reflected from the cavity changes phase $(1 + r_1)/(1 - r_1)$ times faster than the round-trip phase, with $r_1 = \sqrt{R_1} = ${sf(EX.r1, 5)}$: a factor $${sf(EX.gain, 3)} \approx 2\mathcal F/\pi$. A strain shifts the output as if each arm were a few hundred times longer.` },
      { label: 'Sense check', text: t`The light makes about $\mathcal F/\pi \approx ${sf(EX.F / Math.PI, 2)}$ round trips before leaking out, $\sim ${sf((EX.F / Math.PI) * 2 * EX.L / 1000, 2)}$ km of path. The gain holds only for signals slower than the cavity can respond — up to roughly the half-linewidth, $${sf(EX.fwhm / 2, 2)}$ Hz; above that, the arm’s response falls (in the full detector a signal-recycling mirror widens this band).` },
    ],
    answer: t`FSR $= ${sf(EX.fsr / 1000, 3)}$ kHz, $\mathcal F \approx ${sf(EX.F, 3)}$, linewidth $\approx ${sf(EX.fwhm, 2)}$ Hz, and a phase gain of about $${sf(EX.gain, 3)}$.`,
  },
  practice: [
    num({
      id: 'mich-ring', difficulty: 2,
      gen(r) {
        const d = r.pick([0.2, 0.5, 1, 2]), p = r.pick([2, 3, 4]), lam = 633e-9;
        const th = Math.acos(1 - (p * lam) / (2 * d * 1e-3)) * (180 / Math.PI);
        return {
          prompt: t`A Michelson is lit by a spread of directions from a $633$ nm source, and its effective mirror separation is $d = ${d}$ mm. The centre of the ring pattern happens to be bright. What is the angular radius of the ${p === 2 ? 'second' : p === 3 ? 'third' : 'fourth'} bright ring out from the centre (not counting the centre)?`,
          visual: { type: 'optics-waves', params: { mode: 'michelson', d0: d * 1000, lambda: 633, controls: false, readout: false }, caption: t`A Michelson’s ring pattern (the simulation’s mirror separation may differ from the problem’s).` },
          answer: th, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: Math.acos(1 - (p * lam) / (d * 1e-3)) * (180 / Math.PI), feedback: t`The path difference is $2d\cos\theta$: a round trip covers the extra length twice.` }],
          hints: [t`At the centre $2d = m_0\lambda$; the $p$-th bright ring out has order $m_0 - p$.`, t`$2d\cos\theta_p = (m_0 - p)\lambda$, so $\cos\theta_p = 1 - p\lambda/(2d)$.`],
          teach: t`Michelson rings obey $2d\cos\theta = m\lambda$: the order falls outward, and ring radii grow as $\sqrt p$ ($\theta_p \approx \sqrt{p\lambda/d}$).`,
          explain: t`$\cos\theta_${p} = 1 - \dfrac{${p}(633\times10^{-9})}{2(${d}\times10^{-3})}$, so $\theta_${p} = ${sf(th, 3)}^\circ$. Move the mirrors closer together and the rings swell and swallow themselves at the centre.`,
        };
      },
    }),
    num({
      id: 'fp-finesse', difficulty: 1,
      gen(r) {
        const R = r.pick([0.8, 0.9, 0.95, 0.98, 0.99]);
        const Fn = (Math.PI * Math.sqrt(R)) / (1 - R);
        return {
          prompt: t`Both mirrors of a Fabry–Pérot have reflectance $R = ${R}$. What is its finesse $\mathcal F$?`,
          visual: airyPic(R, t`The Airy transmission for these mirrors, against round-trip phase.`),
          answer: Fn, tol: { rel: 0.005 },
          errors: [{ value: (4 * R) / (1 - R) ** 2, feedback: t`That is the coefficient of finesse $F = 4R/(1 - R)^2$. The finesse is $\mathcal F = \pi\sqrt F/2$.` }, { value: 1 / (1 - R), feedback: t`Close in spirit — $1/(1 - R)$ counts round trips — but $\mathcal F = \pi\sqrt R/(1 - R)$.` }],
          hints: [t`$\mathcal F = \pi\sqrt R/(1 - R)$.`],
          teach: t`The finesse $\pi\sqrt R/(1 - R)$ is the ratio of the peak spacing to the peak width; it grows without limit as $R \to 1$.`,
          explain: t`$\mathcal F = \pi\sqrt{${R}}/(1 - ${R}) = ${sf(Fn, 3)}$: each peak is $1/${sf(Fn, 3)}$ of a free spectral range wide.`,
        };
      },
    }),
    num({
      id: 'fp-fsr', difficulty: 2,
      gen(r) {
        const d = r.pick([1, 2, 5, 10]), n = nOf('silica', 633);
        const fsr = C / (2 * n * d * 1e-3) / 1e9;
        return {
          prompt: t`A solid etalon is a fused-silica plate ($n = ${sf(n, 4)}$ at $633$ nm) $${d}$ mm thick with both faces coated. What is its free spectral range at normal incidence, in GHz?`,
          visual: fpPic(t`Light bouncing inside an etalon; each bounce off the far face leaks a little out. Angles exaggerated.`),
          answer: fsr, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: fsr * n, feedback: 'The round trip is through glass: use the optical path 2nd, not 2d.' }],
          hints: [t`Adjacent resonances differ by one round-trip wavelength: $\Delta\nu = c/(2nd)$.`],
          teach: t`The free spectral range is $c/(2nd)$: the inverse of the round-trip time.`,
          explain: t`$\Delta\nu = \dfrac{${sf(C, 9)}}{2(${sf(n, 4)})(${d}\times10^{-3})}\ \text{Hz} = ${sf(fsr, 3)}$ GHz.`,
        };
      },
    }),
    num({
      id: 'fp-resolve', difficulty: 3,
      gen(r) {
        const d = r.pick([2, 5, 10]), Fn = r.pick([20, 30, 50]), lam = 589;
        const m = (2 * d * 1e-3) / (lam * 1e-9), dl = lam / (m * Fn) * 1000;     // pm
        return {
          prompt: t`An air-spaced Fabry–Pérot with mirrors $${d}$ mm apart and finesse $${Fn}$ is used near $589$ nm. What is the smallest wavelength difference it can resolve, in picometres?`,
          visual: fpPic(t`An air-spaced Fabry–Pérot; each round trip sends a weaker beam out. Angles exaggerated.`),
          answer: dl, units: 'pm', tol: { rel: 0.01 },
          errors: [{ value: lam / m * 1000, feedback: 'That is the free spectral range in wavelength. Two lines are resolved when they are one peak width apart: divide by the finesse too.' }],
          hints: [t`The order at the centre is $m = 2d/\lambda$.`, t`Resolving power $\lambda/\Delta\lambda = m\mathcal F$.`],
          teach: t`A Fabry–Pérot’s resolving power is $m\mathcal F$: a huge order times the finesse.`,
          explain: t`$m = 2d/\lambda = ${sf(m, 4)}$, so $\lambda/\Delta\lambda = m\mathcal F = ${sf(m * Fn, 3)}$ and $\Delta\lambda = ${sf(dl, 3)}$ pm. The sodium doublet, $0.6$ nm apart, is coarse to this instrument — a grating needs $N \approx 1000$ lines for it.`,
        };
      },
    }),
    num({
      id: 'airy-min', difficulty: 2,
      gen(r) {
        const R = r.pick([0.5, 0.7, 0.9, 0.95]);
        const Tmin = (1 - R) ** 2 / (1 + R) ** 2;
        return {
          prompt: t`An ideal Fabry–Pérot has mirrors of reflectance $R = ${R}$. What fraction of the light does it transmit midway between two resonances, where $\delta = \pi$?`,
          visual: airyPic(R, t`The transmission for these mirrors; the dashed line marks the midpoint between peaks.`, { vlines: [{ x: 0.5, color: 'ink3' }, { x: 1.5, color: 'ink3' }] }),
          answer: Tmin, tol: { rel: 0.005 },
          errors: [{ value: 1 - R, feedback: 'One mirror alone transmits 1 − R; between resonances the reflections from both mirrors cancel even more of the light.' }, { value: (1 - R) ** 2, feedback: t`That is the single pass through both mirrors; the bounced beams arrive out of phase and cut it further, to $1/(1 + F)$.` }],
          hints: [t`At $\delta = \pi$, $\sin^2(\delta/2) = 1$, so $T = 1/(1 + F)$.`, t`$1/(1 + F) = (1 - R)^2/(1 + R)^2$.`],
          teach: t`Between resonances a Fabry–Pérot transmits $1/(1 + F) = (1 - R)^2/(1 + R)^2$; on resonance, all of it.`,
          explain: t`$F = 4R/(1 - R)^2 = ${sf((4 * R) / (1 - R) ** 2, 3)}$, so $T_{\min} = 1/(1 + F) = ${sf(Tmin, 3)}$: a contrast of $${sf(1 / Tmin, 3)}$ to 1 between peak and trough.`,
        };
      },
    }),
    mcq({
      id: 'ligo-why', difficulty: 2,
      prompt: t`Why are LIGO’s 4 km arms built as Fabry–Pérot cavities rather than simple mirrors at the ends?`,
      visual: ligoPic(t`LIGO’s core layout (schematic, not to scale).`),
      choices: [
        'They store the light for hundreds of round trips, multiplying the phase shift that a change in arm length produces.',
        'They lengthen the light’s wavelength, so a 10⁻¹⁸ m change is a larger fraction of it.',
        'They let the arm-length change be read by counting whole fringes as they pass.',
        'They filter the laser to one frequency before it reaches the beam splitter.',
      ],
      answer: 0,
      why: { 1: 'The wavelength is set by the laser; a cavity only resonates at multiples of it.', 2: 'A gravitational wave changes the arms by about 10⁻¹⁸ m — a trillionth of a fringe. LIGO reads tiny changes of brightness, not fringe counts.', 3: 'That is the job of a separate cavity, the input mode cleaner; the arm cavities sit beyond the beam splitter.' },
      hints: ['Ask what the light does in a cavity of finesse about 450.', 'Each round trip adds the same tiny extra phase; the cavity adds up about 2𝓕/π of them.'],
      teach: 'An arm cavity multiplies a length change’s phase by about 2𝓕/π, like a much longer arm.',
      explain: t`With $\mathcal F \approx 450$ the light makes about $140$ round trips, and the phase gain is about $2\mathcal F/\pi \approx 280$: a 4 km arm acts like one over a thousand kilometres long, for signals slower than the cavity’s response time.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-arm', difficulty: 3, transfer: true,
      gen(r) {
        const L = r.pick([3000, 3995, 10000]), T1 = r.pick([0.007, 0.01, 0.014]);
        const F = finesse(1 - T1, 1), fsr = C / (2 * L), fw = fsr / F;
        return {
          prompt: t`A gravitational-wave detector’s arm cavity is $${L === 10000 ? '10\\ \\text{km}' : `${L}\\ \\text{m}`}$ long, with an input mirror transmitting $${sf(T1 * 100, 2)}\%$ and an end mirror reflecting essentially everything. What is the full width at half maximum of each cavity resonance, in hertz?`,
          visual: ligoPic(t`A Michelson with Fabry–Pérot arms (schematic).`),
          answer: fw, units: 'Hz', tol: { rel: 0.01 },
          errors: [{ value: fsr, feedback: 'That is the free spectral range; the resonances are narrower than their spacing by the finesse.' }, { value: C / (4 * L) / F, feedback: t`The free spectral range is $c/(2L)$: one round trip, $2L$.` }],
          hints: [t`Free spectral range $c/(2L)$; finesse $\pi(R_1R_2)^{1/4}/(1 - \sqrt{R_1R_2})$ with $R_1 = 1 - T_1$, $R_2 = 1$.`, t`Linewidth $= \Delta\nu_{\text{FSR}}/\mathcal F$.`],
          teach: t`A cavity’s linewidth is its free spectral range divided by its finesse.`,
          explain: t`$\Delta\nu_{\text{FSR}} = c/(2L) = ${sf(fsr, 4)}$ Hz, $\mathcal F = ${sf(F, 3)}$, so the linewidth is $${sf(fw, 3)}$ Hz. Signals well above half this frequency are averaged over the light’s storage time and lose the cavity’s gain.`,
        };
      },
    }),
    num({
      id: 'cp-halpha', difficulty: 3, transfer: true,
      gen(r) {
        const Fn = r.pick([15, 20, 25]), bw = r.pick([0.04, 0.05, 0.07]), lam = 656.28e-9;
        const d = (lam ** 2 / (2 * Fn * bw * 1e-9)) * 1e3;      // mm
        return {
          prompt: t`A solar telescope images the Sun in hydrogen’s H-alpha line ($656.28$ nm) through an air-spaced Fabry–Pérot of finesse $${Fn}$. To show the chromosphere the passband (FWHM) must be $${bw}$ nm. How far apart must the mirrors be, in millimetres?`,
          visual: fpPic(t`An air-spaced etalon (angles exaggerated). A broader filter in front blocks its other orders.`),
          answer: d, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: d * 2, feedback: t`The free spectral range in wavelength is $\lambda^2/(2d)$: the round trip is $2d$.` }, { value: d * Fn, feedback: 'The passband is the free spectral range divided by the finesse: the finesse belongs in the denominator.' }],
          hints: [t`In wavelength, the free spectral range is $\Delta\lambda_{\text{FSR}} = \lambda^2/(2nd)$.`, t`Passband $= \Delta\lambda_{\text{FSR}}/\mathcal F$, so $d = \lambda^2/(2\mathcal F\,\delta\lambda)$.`],
          teach: t`A Fabry–Pérot filter’s passband is $\lambda^2/(2nd\,\mathcal F)$: a narrower band needs wider spacing or higher finesse.`,
          explain: t`$d = \dfrac{(656.28\times10^{-9})^2}{2(${Fn})(${bw}\times10^{-9})}\ \text{m} = ${sf(d, 3)}$ mm. Its other orders lie $\lambda^2/(2d) = ${sf(bw * Fn, 3)}$ nm away, so a broader interference filter must block them.`,
        };
      },
    }),
    mcq({
      id: 'cp-raise-R', difficulty: 2,
      prompt: t`The mirrors of an ideal Fabry–Pérot are upgraded from $R = 0.90$ to $R = 0.99$. What happens to the spacing of its transmission peaks and to their width?`,
      visual: airyPic(0.9, t`The transmission with the original $R = 0.90$ mirrors.`),
      choices: ['The spacing stays the same; each peak becomes about 10 times narrower.', 'Both the spacing and the width shrink about 10 times.', 'The spacing shrinks; the width stays the same.', 'The peaks narrow, but their height falls to 1 − R.'],
      answer: 0,
      why: { 1: 'The spacing is the free spectral range c/(2nd): it depends on the spacing of the mirrors, not their reflectance.', 2: 'Reflectance sets the width through the finesse; the mirror spacing sets the peak spacing.', 3: 'For lossless identical mirrors every peak still reaches T = 1, however good the mirrors.' },
      hints: ['Which quantity depends on d, and which on R?', 'Finesse goes as 1/(1 − R): from about 30 to about 310.'],
      teach: 'Mirror spacing sets where the peaks are; mirror reflectance sets how sharp they are.',
      explain: t`The free spectral range $c/(2nd)$ is unchanged. The finesse goes from $\pi\sqrt{0.9}/0.1 \approx 29.8$ to $\pi\sqrt{0.99}/0.01 \approx 313$, so each peak narrows about tenfold — and still, ideally, transmits fully.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §9.4 (Michelson) and §9.6 (multiple-beam interference, the Fabry–Pérot)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'LIGO Scientific Collaboration, “Advanced LIGO”, Class. Quantum Grav. 32, 074001 (2015): arm length 3994.5 m, finesse 450, ITM transmission 1.4 %', url: 'https://arxiv.org/abs/1411.4547' },
  ],
});
