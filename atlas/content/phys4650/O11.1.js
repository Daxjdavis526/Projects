// Stimulated emission and laser cavities (Hecht §13.1; enrichment). PHYS 2710
// MP10.3 did Einstein's coefficients, inversion, three- and four-level
// pumping, the threshold gain and the Doppler width. Here the optics of the
// resonator: A₂₁/B₂₁ = 8πhν³/c³ (why short-wavelength lasers are hard); the
// two-mirror cavity's stability 0 ≤ g₁g₂ ≤ 1 with gᵢ = 1 − L/Rᵢ (planar,
// confocal, concentric, hemispherical); its fundamental Gaussian mode — waist
// w₀, Rayleigh range z_R = πw₀²/λ, w(z) = w₀√(1 + (z/z_R)²), far-field
// half-angle λ/(πw₀); plano-concave waist w₀² = (λ/π)√(L(R − L));
// longitudinal modes c/(2nL) and single-mode length. Worked example: a HeNe
// cavity. Transfers: lunar laser ranging's spot on the Moon, Advanced LIGO's
// arm cavity (L = 3994.5 m, R_ITM = 1934 m, R_ETM = 2245 m — LSC, CQG 32,
// 074001, 2015) as a near-concentric stable resonator.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, H, sf } from './_op.js';
import { seg, arc, word, pic } from './_op3.js';

const t = String.raw;

// the worked example: a plano-concave HeNe cavity
const EX = { L: 0.3, R: 1.0, lam: 633e-9, gain: 1.5e9 };
EX.g1 = 1; EX.g2 = 1 - EX.L / EX.R;
EX.w0 = Math.sqrt((EX.lam / Math.PI) * Math.sqrt(EX.L * (EX.R - EX.L)));
EX.zR = (Math.PI * EX.w0 ** 2) / EX.lam;
EX.th = EX.lam / (Math.PI * EX.w0);
EX.fsr = C / (2 * EX.L);
// LIGO
const LIGO = { L: 3994.5, R1: 1934, R2: 2245 };
LIGO.g1 = 1 - LIGO.L / LIGO.R1; LIGO.g2 = 1 - LIGO.L / LIGO.R2;

/** A Gaussian beam's envelope ±w(z), in units of w₀ against z/z_R. */
const beamPic = (caption, extra = {}) => ({
  type: 'graph', caption,
  params: { x: [-3.2, 3.2], y: [-3.6, 3.6], aspect: 'wide', xlabel: 'z ÷ Rayleigh range', ylabel: 'w / w₀', xticks: 6, yticks: 4,
    curves: [
      { fn: 'sqrt(1 + x^2)', color: 'gold', width: 2.4 }, { fn: '-sqrt(1 + x^2)', color: 'gold', width: 2.4 },
      { fn: 'x', color: 'ink3', width: 1.2, dash: [4, 4] }, { fn: '-x', color: 'ink3', width: 1.2, dash: [4, 4] },
    ],
    shade: [{ fn: 'sqrt(1 + x^2)', lower: '-sqrt(1 + x^2)', from: -3.2, to: 3.2, color: 'gold', alpha: 0.12 }],
    vlines: [{ x: 1, color: 'ink3' }, { x: -1, color: 'ink3' }],
    ...extra },
});

/** A two-mirror cavity: left mirror (flat if R1 is null), right concave mirror, a beam inside (schematic). */
function cavityPic(caption, flatLeft = true) {
  const curves = [
    flatLeft ? seg([0, -1.4], [0, 1.4], 'accent', { width: 5 }) : arc([3.2, 0], 3.4, 'accent', Math.PI - 0.42, Math.PI + 0.42, { width: 5 }),
    arc([1.6, 0], 6.4, 'accent', -0.22, 0.22, { width: 5 }),
    { fn: '0.45*sqrt(1 + ((x - 0.1)/3.2)^2)', domain: [0.1, 7.9], color: 'gold', width: 1.8 },
    { fn: '-0.45*sqrt(1 + ((x - 0.1)/3.2)^2)', domain: [0.1, 7.9], color: 'gold', width: 1.8 },
    seg([0.1, -1.75], [7.9, -1.75], 'ink3', { width: 1 }),
  ];
  return {
    type: 'graph', caption,
    params: pic([-0.8, 9], [-2.1, 1.9], { curves, points: [word(flatLeft ? -0.45 : -0.35, 1.6, flatLeft ? 'flat' : 'R₁', 'accent'), word(8.4, 1.6, flatLeft ? 'R' : 'R₂', 'accent'), word(4, -2.0, 'L', 'ink2'), word(4, 0, 'gain medium + mode', 'ink3')] }),
  };
}

export default lesson({
  id: 'phys4650.O11.1',
  title: 'Stimulated emission and laser cavities',
  minutes: 16, difficulty: 3,
  equation: t`0 \le g_1 g_2 \le 1, \qquad g_i = 1 - \frac{L}{R_i}`,
  intro: t`An excited atom struck by a photon of the right frequency can be **stimulated** to emit a second photon identical to the first — same direction, frequency, phase and polarization. With more atoms up than down (an inversion) light is amplified; Einstein’s relation $A_{21}/B_{21} = 8\pi h\nu^3/c^3$ says spontaneous emission, which wastes the inversion, grows as $\nu^3$. A **cavity** of two mirrors a distance $L$ apart feeds the light back through the gain, and it must refocus it, or the beam walks out after a few bounces. Mirrors of radii $R_1$, $R_2$ trap a beam only when the condition above holds. The light they trap is a **Gaussian beam**: narrowest at a waist $w_0$, it stays nearly parallel for a Rayleigh range $z_R = \pi w_0^2/\lambda$ and then spreads at an angle $\lambda/(\pi w_0)$.`,
  symbols: [
    { tex: 'g_1,\\ g_2', text: 'the two mirrors’ stability parameters (dimensionless)' },
    { tex: 'L', text: 'the distance between the mirrors' },
    { tex: 'R_i', text: 'mirror $i$’s radius of curvature: positive for a concave mirror facing the other, infinite for a flat one' },
  ],
  why: t`Every laser — from a pointer to LIGO’s 4 km arms — is a gain medium inside a stable cavity, and the Gaussian beam it makes sets how far a beam can go before it spreads: to a satellite, or to the Moon and back.`,
  visual: {
    type: 'graph',
    title: 'The stability diagram',
    lead: t`Each two-mirror cavity is a point $(g_1, g_2)$. It is stable — it traps a beam — inside the shaded region between the axes and the hyperbola $g_1g_2 = 1$.`,
    tasks: [
      t`Make both mirrors flat ($R \to$ the slider’s maximum): the point sits at $(1, 1)$, on the edge — a flat–flat cavity is only marginally stable and very sensitive to tilt.`,
      t`Set $R_1 = R_2 = L$: the confocal cavity, $(0, 0)$, the most forgiving point.`,
      t`Lengthen $L$ past $R_1 + R_2$: the point leaves the shaded region — the beam no longer stays in.`,
    ],
    params: {
      x: [-2.2, 2.2], y: [-2.2, 2.2], equal: true, aspect: 'wide', xlabel: 'g₁', ylabel: 'g₂', xticks: 8, yticks: 8,
      sliders: [
        { key: 'L', label: 'Mirror spacing $L$', min: 0.05, max: 2.5, step: 0.01, value: 0.5, unit: '\\mathrm{m}', explain: 'The cavity’s length.' },
        { key: 'R1', label: 'Mirror 1 radius $R_1$', min: 0.1, max: 100, value: 1, logScale: true, unit: '\\mathrm{m}', explain: 'Concave toward mirror 2; 100 m is nearly flat.' },
        { key: 'R2', label: 'Mirror 2 radius $R_2$', min: 0.1, max: 100, value: 1, logScale: true, unit: '\\mathrm{m}', explain: 'Concave toward mirror 1.' },
      ],
      shade: [{ fn: 'min(1/x, 2.2)', lower: '0', from: 0.001, to: 2.2, color: 'good', alpha: 0.22 }, { fn: '0', lower: 'max(1/x, -2.2)', from: -2.2, to: -0.001, color: 'good', alpha: 0.22 }],
      curves: [{ fn: '1/x', color: 'good', width: 1.4, domain: [0.45, 2.2] }, { fn: '1/x', color: 'good', width: 1.4, domain: [-2.2, -0.45] }],
      points: [
        { x: 1, y: 1, r: 3, color: 'ink3', label: 'planar', labelDx: 6, labelDy: -6 }, { x: 0, y: 0, r: 3, color: 'ink3', label: 'confocal', labelDx: 6, labelDy: 12 },
        { x: -1, y: -1, r: 3, color: 'ink3', label: 'concentric', labelDx: 6, labelDy: 12 }, { x: 1, y: 0, r: 3, color: 'ink3', label: 'hemispherical', labelDx: 6, labelDy: 12 },
        { x: '1 - L/R1', y: '1 - L/R2', r: 6, color: 'gold' },
      ],
      readouts: [
        { label: '$g_1$', expr: '1 - L/R1', digits: 3, zero: 0.0005 }, { label: '$g_2$', expr: '1 - L/R2', digits: 3, zero: 0.0005 },
        { label: '$g_1g_2$', expr: '(1 - L/R1)*(1 - L/R2)', digits: 3, zero: 0.0005 },
      ],
    },
    caption: t`Paraxial ray optics of an empty two-mirror resonator; stable means a ray stays near the axis for ever. Points on the boundary (planar, confocal, concentric) are only marginally stable.`,
  },
  example: {
    prompt: t`A helium–neon laser’s cavity has a flat mirror and a concave mirror of radius $R = ${EX.R}$ m, $L = ${EX.L * 100}$ cm apart. Is it stable? Find the beam’s waist, its Rayleigh range and divergence at $633$ nm, and the spacing of its longitudinal modes. About how many fit under neon’s $1.5$ GHz gain bandwidth?`,
    visual: cavityPic(t`A plano-concave cavity: the mode’s waist sits on the flat mirror (schematic; the beam is drawn far too wide).`),
    steps: [
      { label: 'Stability', text: t`$g_1 = 1$ (flat), $g_2 = 1 - ${EX.L}/${EX.R} = ${sf(EX.g2, 3)}$: $g_1g_2 = ${sf(EX.g1 * EX.g2, 3)}$, between 0 and 1. Stable.` },
      { label: 'Waist', text: t`For a plano-concave cavity the waist is on the flat mirror, with $w_0^2 = \dfrac{\lambda}{\pi}\sqrt{L(R - L)}$, so $w_0 = ${sf(EX.w0 * 1e3, 3)}$ mm.` },
      { label: 'Rayleigh range and divergence', text: t`$z_R = \pi w_0^2/\lambda = ${sf(EX.zR, 3)}$ m, and far away the beam spreads at a half-angle $\lambda/(\pi w_0) = ${sf(EX.th * 1e3, 3)}$ mrad.` },
      { label: 'Modes', text: t`Round-trip resonance repeats every $c/(2L) = ${sf(EX.fsr / 1e6, 3)}$ MHz. Under a $1.5$ GHz gain curve that leaves room for about $${sf(EX.gain / EX.fsr, 2)}$ modes — a typical HeNe runs on two or three at once.` },
      { label: 'Sense check', text: t`A third of a millimetre waist and a milliradian of spread: a laser pointer’s spot grows to about a centimetre across ten metres away — as you see.` },
    ],
    answer: t`Stable ($g_1g_2 = ${sf(EX.g1 * EX.g2, 3)}$); $w_0 = ${sf(EX.w0 * 1e3, 3)}$ mm, $z_R = ${sf(EX.zR, 3)}$ m, divergence $${sf(EX.th * 1e3, 3)}$ mrad; modes $${sf(EX.fsr / 1e6, 3)}$ MHz apart, about three under the gain curve.`,
  },
  practice: [
    num({
      id: 'g1g2', difficulty: 2,
      gen(r) {
        const R1 = r.pick([0.5, 1, 2]), R2 = r.pick([0.75, 1.5, 3]), L = r.pick([0.4, 0.6, 1.2]);
        const g = (1 - L / R1) * (1 - L / R2);
        return {
          prompt: t`Two concave mirrors of radii $R_1 = ${R1}$ m and $R_2 = ${R2}$ m face each other $${L}$ m apart. What is $g_1g_2$? (The cavity is stable if it lies between 0 and 1.)`,
          visual: cavityPic(t`Two concave mirrors facing each other (schematic).`, false),
          answer: g, tol: { rel: 0.01, abs: 0.001 },
          errors: [{ value: (L / R1) * (L / R2), feedback: t`Each $g$ is $1 - L/R$, not $L/R$.` }].filter((e) => Math.abs(e.value - g) > 0.01 + 0.01 * Math.abs(g)),
          hints: [t`$g_i = 1 - L/R_i$.`],
          teach: t`A two-mirror cavity traps a beam when $0 \le g_1g_2 \le 1$.`,
          explain: t`$g_1 = 1 - ${L}/${R1} = ${sf(1 - L / R1, 3)}$, $g_2 = 1 - ${L}/${R2} = ${sf(1 - L / R2, 3)}$, so $g_1g_2 = ${sf(g, 3)}$: ${g >= 0 && g <= 1 ? 'stable' : 'unstable — a ray walks away from the axis'}.`,
        };
      },
    }),
    num({
      id: 'zR', difficulty: 2,
      gen(r) {
        const w0 = r.pick([0.25, 0.5, 1, 2]), lam = r.pick([532, 1064, 1550]);
        const zR = (Math.PI * (w0 * 1e-3) ** 2) / (lam * 1e-9);
        return {
          prompt: t`A Gaussian beam of $${lam}$ nm light has a waist radius $w_0 = ${w0}$ mm. Over what distance either side of the waist does it stay within $\sqrt2$ of its waist size (the Rayleigh range), in metres?`,
          visual: beamPic(t`A Gaussian beam’s width against distance, in units of its waist and Rayleigh range; dashed: the far-field cone.`),
          answer: zR, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: zR / Math.PI, feedback: t`$z_R = \pi w_0^2/\lambda$: keep the $\pi$.` }],
          hints: [t`$z_R = \pi w_0^2/\lambda$, with $w(z_R) = \sqrt2\,w_0$.`],
          teach: t`A beam stays collimated for a Rayleigh range $\pi w_0^2/\lambda$: twice as wide, four times as far.`,
          explain: t`$z_R = \pi(${w0}\times10^{-3})^2/(${lam}\times10^{-9}) = ${sf(zR, 3)}$ m.`,
        };
      },
    }),
    num({
      id: 'w-far', difficulty: 2,
      gen(r) {
        const w0 = r.pick([0.5, 1, 2]), z = r.pick([10, 50, 200]), lam = 633;
        const zR = (Math.PI * (w0 * 1e-3) ** 2) / (lam * 1e-9), w = w0 * Math.sqrt(1 + (z / zR) ** 2);
        return {
          prompt: t`A $633$ nm laser beam has its waist, $w_0 = ${w0}$ mm, at the laser. What is its radius $w$ (to $1/e^2$ of the peak irradiance) $${z}$ m away, in millimetres?`,
          visual: beamPic(t`A Gaussian beam’s envelope (in units of $w_0$ and $z_R$).`),
          answer: w, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: w0 * (z / zR), feedback: t`That is the far-field cone alone; near the Rayleigh range, use $w_0\sqrt{1 + (z/z_R)^2}$.` }, { value: w0 + ((lam * 1e-9) / (Math.PI * w0 * 1e-3)) * z * 1e3, feedback: t`The width does not add linearly to the waist: $w = w_0\sqrt{1 + (z/z_R)^2}$.` }].filter((e) => Math.abs(e.value - w) > 0.01 * w),
          hints: [t`First $z_R = \pi w_0^2/\lambda$.`, t`$w(z) = w_0\sqrt{1 + (z/z_R)^2}$.`],
          teach: t`A Gaussian beam widens as $w_0\sqrt{1 + (z/z_R)^2}$: flat near the waist, a cone of half-angle $\lambda/(\pi w_0)$ far away.`,
          explain: t`$z_R = ${sf(zR, 3)}$ m, so $w = ${w0}\sqrt{1 + (${z}/${sf(zR, 3)})^2} = ${sf(w, 3)}$ mm.`,
        };
      },
    }),
    num({
      id: 'single-mode', difficulty: 2,
      gen(r) {
        const dn = r.pick([0.5, 1, 2, 5]), n = r.pick([1, 1.82]);
        const L = (C / (2 * n * dn * 1e9)) * 100;      // cm
        return {
          prompt: t`A laser’s gain exceeds its losses only over a band $${dn}$ GHz wide. ${n === 1 ? 'Its cavity is filled with gas (n ≈ 1).' : 'Its cavity is a solid Nd:YAG crystal ($n = 1.82$) with mirrors coated on its faces.'} What is the longest cavity that guarantees only one longitudinal mode can lase, in centimetres?`,
          visual: { type: 'graph', caption: t`A gain curve (gold) with the cavity’s longitudinal modes (equally spaced lines) under it; only modes where the gain beats the loss (grey line) lase.`,
            params: { x: [-3, 3], y: [0, 1.25], aspect: 'wide', xlabel: 'frequency offset (GHz)', ylabel: 'gain', xticks: 6, yticks: 0,
              curves: [{ fn: `exp(-x^2/${sf(dn * dn / (4 * Math.LN2) * 2.2, 4)})`, color: 'gold', width: 2.4 }],
              hlines: [{ y: 0.5, color: 'ink3' }],
              vlines: [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].map((x) => ({ x, color: 'accent' })) } },
          answer: L, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: L * n * (n === 1 ? 2 : 1), feedback: n === 1 ? 'Mode spacing is c/(2L): the round trip is 2L.' : 'Inside the crystal the round trip takes 2nL/c: divide by n.' }].filter((e) => Math.abs(e.value - L) > 0.01 * L),
          hints: [t`Longitudinal modes are $\Delta\nu = c/(2nL)$ apart.`, t`For one mode at most, $\Delta\nu \ge ${dn}$ GHz: $L \le c/(2n\Delta\nu)$.`],
          teach: t`A cavity’s modes are $c/(2nL)$ apart; short cavities force a laser onto one frequency.`,
          explain: t`$L \le c/(2n\Delta\nu) = ${sf(C, 4)}/(2(${n})(${dn}\times10^9))\ \text{m} = ${sf(L, 3)}$ cm. Microchip lasers are millimetres long for exactly this reason.`,
        };
      },
    }),
    mcq({
      id: 'xray', difficulty: 3,
      prompt: t`Lasers in the infrared and visible are everyday; X-ray lasers need a particle accelerator (a free-electron laser) or a nuclear-scale pump. What does Einstein’s relation $A_{21}/B_{21} = 8\pi h\nu^3/c^3$ say about why?`,
      visual: { type: 'graph', caption: t`Spontaneous emission’s share against frequency, relative to the visible: it climbs as $\nu^3$ (logarithmic axes).`,
        params: { x: [-1, 3], y: [-3, 9], xlog: true, ylog: true, axesAt: 'edge', aspect: 'wide', xlabel: 'photon frequency ÷ visible light’s', ylabel: 'A/B, relative', yticks: 4,
          curves: [{ fn: '3*x', color: 'gold', width: 2.4 }], points: [{ x: 0, y: 0, r: 4, color: 'accent', label: 'visible' }, { x: 2.5, y: 7.5, r: 4, color: 'violet', label: 'X-rays', labelDx: -50 }] } },
      choices: ['Spontaneous emission grows as ν³ against stimulated emission, so an inversion drains away far faster at short wavelengths and needs enormous pump power.', 'Stimulated emission does not happen for X-ray photons.', 'Mirrors cannot reflect X-rays, and that is the only obstacle.', 'X-ray photons carry less energy than visible ones.'],
      answer: 0,
      why: { 1: 'Stimulated emission happens at every frequency; B₂₁ is what makes amplification possible at all.', 2: 'Mirrors are a real difficulty, which is why X-ray lasers are single-pass amplifiers — but the ν³ drain of the inversion is the deeper one.', 3: 'They carry about a thousand times more: E = hν.' },
      hints: ['A₂₁ is the spontaneous rate; B₂₁ (times the energy density) the stimulated one.', 'At fixed photon density, spontaneous emission’s advantage grows as ν³.'],
      teach: 'Spontaneous emission outpaces stimulated emission as ν³: the shorter the wavelength, the faster an inversion leaks away.',
      explain: t`Going from $500$ nm to $1$ nm multiplies $\nu^3$ by $500^3 \approx 10^8$: the upper level empties a hundred million times faster by spontaneous emission, so keeping an inversion takes a pump of matching power. Free-electron lasers sidestep it: they have no atomic levels at all.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-moon', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([1, 1.5, 3.5]), lam = 532e-9, z = 3.844e8;
        const w0 = D / 2, w = (lam * z) / (Math.PI * w0);
        return {
          prompt: t`**Lunar laser ranging.** A $532$ nm pulse leaves through a telescope that expands it to a Gaussian beam with waist radius $w_0 = ${w0}$ m (aperture $${D}$ m). With a perfect (airless) path, what would the beam’s radius be at the Moon, $384\,400$ km away, in metres?`,
          visual: beamPic(t`A Gaussian beam’s envelope; the Moon is thousands of Rayleigh ranges away, far out on the dashed cone (not to scale).`),
          answer: w, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: (1.22 * lam * z) / D, feedback: t`The Airy formula $1.22\lambda/D$ is for a uniformly lit aperture; a Gaussian beam spreads at $\lambda/(\pi w_0)$.` }].filter((e) => Math.abs(e.value - w) > 0.01 * w),
          hints: [t`$z \gg z_R$, so $w \approx w_0 z/z_R = \lambda z/(\pi w_0)$.`, t`$\lambda z/(\pi w_0) = (532\times10^{-9})(3.844\times10^8)/(\pi\times ${w0})$ m.`],
          teach: t`Far beyond its Rayleigh range a Gaussian beam’s radius is $\lambda z/(\pi w_0)$: a wider beam spreads less.`,
          explain: t`$w = \lambda z/(\pi w_0) = ${sf(w, 3)}$ m. In practice the atmosphere spreads the outgoing beam to about an arcsecond, a spot a couple of kilometres across, so only about one photon in $10^{17}$ or so comes back to the telescope — which is why ranging stations count single returning photons.`,
        };
      },
    }),
    num({
      id: 'cp-ligo', difficulty: 3, transfer: true,
      prompt: t`Advanced LIGO’s arm cavities are $L = 3994.5$ m long, between an input mirror of radius $R_1 = 1934$ m and an end mirror of radius $R_2 = 2245$ m (both concave, facing each other). What is $g_1g_2$?`,
      visual: cavityPic(t`An arm cavity: two concave mirrors (schematic, not to scale — the real mirrors are 34 cm across and 4 km apart).`, false),
      answer: LIGO.g1 * LIGO.g2, tol: { rel: 0.005 },
      errors: [{ value: (LIGO.L / LIGO.R1) * (LIGO.L / LIGO.R2), feedback: t`Each $g$ is $1 - L/R$; here both are negative.` }],
      hints: [t`$g_i = 1 - L/R_i$: both mirrors are closer than $L$ to their centres of curvature.`, t`$g_1 = ${sf(LIGO.g1, 4)}$, $g_2 = ${sf(LIGO.g2, 4)}$.`],
      teach: 'LIGO’s arm cavities are stable but near-concentric: g₁ and g₂ are both negative, their product between 0 and 1.',
      explain: t`$g_1 = 1 - 3994.5/1934 = ${sf(LIGO.g1, 4)}$, $g_2 = 1 - 3994.5/2245 = ${sf(LIGO.g2, 4)}$, so $g_1g_2 = ${sf(LIGO.g1 * LIGO.g2, 3)}$: stable, in the lower-left lobe. Near-concentric mirrors make the beam large on both test masses — several centimetres — which averages over the thermal jitter of their surfaces.`,
    }),
    mcq({
      id: 'cp-expand', difficulty: 2,
      prompt: t`A space laser-communication terminal wants its beam to spread as little as possible on the way to a distant receiver. At a fixed wavelength, what should it do?`,
      visual: beamPic(t`A Gaussian beam: the narrower the waist, the shorter the Rayleigh range and the wider the cone.`),
      choices: ['Send the beam out through a telescope, expanding the waist: the divergence λ/(πw₀) falls as the waist grows.', 'Focus the beam to the smallest possible waist at the transmitter.', 'Use a more powerful laser: a stronger beam spreads less.', 'Use a longer laser cavity.'],
      answer: 0,
      why: { 1: 'A small waist spreads fastest: divergence goes as 1/w₀.', 2: 'Power does not change the shape of a Gaussian beam; spreading is diffraction.', 3: 'Cavity length sets the mode spacing; the transmitted divergence is set by the waist that leaves the telescope.' },
      hints: ['The far-field half-angle is λ/(πw₀).', 'Which waist gives the smallest angle?'],
      teach: 'To keep a beam narrow far away, make it wide where it starts: divergence is λ/(πw₀).',
      explain: t`The far-field half-angle $\lambda/(\pi w_0)$ falls as the waist grows, so transmitters expand the beam through a telescope. A $10$ cm beam at $1550$ nm spreads by about $10\ \mu$rad — tens of metres across at a thousand kilometres.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §13.1 (lasers: stimulated emission, cavities, modes, Gaussian beams)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'A. E. Siegman, Lasers (University Science Books, 1986), ch. 17–19 (Gaussian beams, resonator stability)', url: 'https://openlibrary.org/search?q=Siegman+Lasers' },
    { label: 'LIGO Scientific Collaboration, “Advanced LIGO”, Class. Quantum Grav. 32, 074001 (2015): arm length 3994.5 m, mirror radii 1934 m and 2245 m', url: 'https://arxiv.org/abs/1411.4547' },
  ],
});
