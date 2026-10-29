// Two-beam interference (Hecht §9.1–9.3). PHYS 2220 O3.1 did Young's slits
// (d sin θ = mλ, spacing λL/d); PHYS 4650 O5.1 added phasors and visibility.
// This lesson makes it general: two beams of one frequency give
// I = I₁ + I₂ + 2√(I₁I₂) cos δ, provided their phase difference holds still
// and their polarizations are not perpendicular (Fresnel–Arago: the
// interference term goes as the dot product of the fields, cos φ). Two plane
// waves crossing at full angle α make straight fringes Λ = λ/(2 sin(α/2)) —
// Young's slits, Lloyd's mirror and Fresnel's biprism are all this formula
// with α ≈ (source separation)/L. Lloyd's mirror has a dark fringe at the
// mirror (the π flip). A plate of index n and thickness t in one beam shifts
// the pattern by (n − 1)t/λ fringes. Transfers: laser Doppler velocimetry
// (flow speed from fringe-crossing frequency), a cliff-top radio "sea
// interferometer".
import { lesson, mcq, num } from '../../src/core/content.js';
import { DEG, nOf, sf } from './_op.js';
import { seg, arc, word, pic, fringeCurve } from './_op3.js';

const t = String.raw;
const spacing = (lam, aDeg) => lam / (2 * Math.sin((aDeg * DEG) / 2));

// the worked example: Lloyd's mirror with a HeNe laser
const EX = { lam: 633e-9, h: 0.5e-3, L: 1.0 };
EX.Lam = (EX.lam * EX.L) / (2 * EX.h);     // m
EX.alpha = (2 * EX.h) / EX.L;              // rad
EX.check = EX.lam / (2 * Math.sin(EX.alpha / 2));

/** Two beams crossing at full angle α (drawn at no less than 36° so the fringes show). */
function crossPic(aDeg, caption, extra = {}) {
  const a = (Math.max(aDeg, 36) / 2) * DEG, w = 0.6, L = 4.6;
  const curves = [];
  for (const [sgn, col] of [[1, 'accent'], [-1, 'violet']]) {
    const dir = [Math.cos(a), -sgn * Math.sin(a)], nrm = [Math.sin(a), sgn * Math.cos(a)];
    for (const o of [-w, 0, w]) {
      const p0 = [o * nrm[0] - L * dir[0], o * nrm[1] - L * dir[1]], p1 = [o * nrm[0] + L * dir[0], o * nrm[1] + L * dir[1]];
      curves.push(seg(p0, p1, col, { width: o === 0 ? 2 : 1.2, dash: o === 0 ? undefined : [4, 4] }));
    }
  }
  // horizontal fringes inside the overlap |x| sin a ≤ w − |y| cos a
  const ymax = w / Math.cos(a), step = ymax / 3.5;
  for (let k = -3; k <= 3; k++) {
    const y = k * step, half = (w - Math.abs(y) * Math.cos(a)) / Math.sin(a);
    if (half > 0.05) curves.push(seg([-half, y], [half, y], 'gold', { width: 2.6 }));
  }
  return {
    type: 'graph', caption,
    params: pic([-4.8, 4.8], [-2.3, 2.3], { curves: [...curves, arc([0, 0], 1.1, 'ink', Math.PI - a, Math.PI + a)], points: [word(-1.45, 0, 'α', 'ink'), word(-3.9, 2.05, 'beam 1', 'accent'), word(-3.9, -2.05, 'beam 2', 'violet'), ...(extra.points || [])], arrows: extra.arrows || [] }),
  };
}

/** A source S above a mirror (or a sea) and its image S′ below, with the direct and reflected rays to a point P on a screen. */
function mirrorPic(caption) {
  const S = [0.6, 1.0], Si = [0.6, -1.0], P = [9.6, 1.9];
  const M = [Si[0] + ((P[0] - Si[0]) * (0 - Si[1])) / (P[1] - Si[1]), 0];
  return {
    type: 'graph', caption,
    params: pic([-0.4, 10.4], [-1.5, 2.6], {
      curves: [
        seg([1.2, 0], [8.4, 0], 'ink2', { width: 3.5 }),
        seg([9.6, -0.3], [9.6, 2.5], 'ink3', { width: 3 }),
        seg(S, P, 'accent', { width: 2 }),
        seg(S, M, 'teal', { width: 2 }), seg(M, P, 'teal', { width: 2 }),
        seg(Si, M, 'ink3', { dash: [4, 4] }),
      ],
      points: [
        { x: S[0], y: S[1], r: 5, color: 'gold', label: 'S', labelDx: -22 },
        { x: Si[0], y: Si[1], r: 5, color: 'gold', hollow: true, label: 'S′ (image)', labelDx: 10, labelDy: 4 },
        { x: P[0], y: P[1], r: 4, color: 'ink', label: 'P', labelDx: -18, labelDy: -6 },
        word(5.2, -0.35, 'mirror', 'ink3'),
        word(9.6, -0.65, 'screen', 'ink3'),
      ],
    }),
  };
}

/** A cliff-top antenna A, the sea, the image A′ and two parallel rays from a distant source at elevation e (drawn at 12°). */
function cliffPic(caption) {
  const e = 12 * DEG, A = [0.6, 1.0], Ai = [0.6, -1.0], M = [0.6 + 1 / Math.tan(e), 0];
  const far = (p, s) => [p[0] + s * Math.cos(e), p[1] + s * Math.sin(e)];
  return {
    type: 'graph', caption,
    params: pic([-0.4, 10.4], [-1.4, 3.1], {
      curves: [
        seg([0.6, 0], [0.6, 1.0], 'ink3', { width: 5 }), seg([0.6, 0], [10.2, 0], 'teal', { width: 2.5 }),
        seg(M, A, 'violet', { width: 2 }), seg(Ai, M, 'ink3', { dash: [4, 4] }),
        arc(M, 1.1, 'ink3', 0, e),
      ],
      arrows: [
        { from: far(A, 9.2), to: A, color: 'accent', width: 2 },
        { from: far(M, 4.6), to: M, color: 'violet', width: 2 },
      ],
      points: [
        { x: A[0], y: A[1], r: 5, color: 'gold', label: 'A', labelDx: -20 },
        { x: Ai[0], y: Ai[1], r: 5, color: 'gold', hollow: true, label: 'A′ (image)', labelDx: 10, labelDy: 4 },
        word(M[0] + 1.45, 0.14, 'e', 'ink'), word(8.6, -0.4, 'sea', 'teal'), word(0.6, -0.4, 'cliff', 'ink3'),
      ],
    }),
  };
}

/** Young's two slits with an optional thin plate over the upper one. */
function youngPic(caption, plate = false) {
  const S = [0, 0], A = [3, 0.55], B = [3, -0.55], P = [9.6, 1.2];
  const curves = [
    seg([3, 2.2], [3, 0.7], 'ink2', { width: 3 }), seg([3, 0.4], [3, -0.4], 'ink2', { width: 3 }), seg([3, -0.7], [3, -2.2], 'ink2', { width: 3 }),
    seg([9.6, -2.2], [9.6, 2.2], 'ink3', { width: 3 }),
    seg(S, A, 'ink3'), seg(S, B, 'ink3'),
    seg(A, P, 'accent', { width: 2 }), seg(B, P, 'teal', { width: 2 }),
  ];
  if (plate) curves.push(seg([3.25, 0.32], [3.25, 0.8], 'violet', { width: 5 }));
  return {
    type: 'graph', caption,
    params: pic([-0.5, 10.4], [-2.4, 2.4], {
      curves,
      points: [
        { x: 0, y: 0, r: 5, color: 'gold', label: 'source', labelDy: 14, labelDx: -18 },
        { x: P[0], y: P[1], r: 4, color: 'ink', label: 'P', labelDx: -18, labelDy: -6 },
        ...(plate ? [word(4.3, 1.1, 'plate', 'violet')] : []),
        word(9.6, -2.35, 'screen', 'ink3', { labelDy: 4 }),
      ],
    }),
  };
}

/** The fringe pattern across a screen (y in the units given). */
const fringePic = (I1, I2, L, mix, caption, xlabel, extra = {}) => ({
  type: 'graph', caption,
  params: { x: [sf(-2.5 * L, 4), sf(2.5 * L, 4)], y: [0, sf((I1 + I2 + 2 * Math.sqrt(I1 * I2)) * 1.12, 3)], aspect: 'wide', xlabel, ylabel: 'irradiance', yticks: 0,
    curves: [{ fn: fringeCurve(I1, I2, L, mix), color: 'gold', width: 2.4 }], ...extra },
});

/** Two field directions at angle φ (degrees). */
const polPic = (phi, caption) => ({
  type: 'graph', caption,
  params: pic([-1.9, 1.9], [-0.25, 1.25], {
    arrows: [
      { from: [0, 0], to: [0, 1.1], color: 'accent', width: 2.4, label: 'E₁' },
      { from: [0, 0], to: [sf(1.1 * Math.sin(phi * DEG), 4), sf(1.1 * Math.cos(phi * DEG), 4)], color: 'violet', width: 2.4, label: 'E₂' },
    ],
    curves: [{ param: ['0.45*sin(t)', '0.45*cos(t)'], t: [0, sf(phi * DEG, 4)], color: 'ink3', width: 1.4 }],
    points: [word(0.42 * Math.sin((phi / 2) * DEG) + 0.12, 0.6 * Math.cos((phi / 2) * DEG), 'φ', 'ink')],
  }),
});

export default lesson({
  id: 'phys4650.O7.1',
  title: 'Two-beam interference',
  minutes: 16, difficulty: 3,
  intro: t`Split one beam of light in two, send the halves along different paths and bring them back together: where they overlap the irradiances do **not** simply add. With a phase difference $\delta$ between them,

$$I = I_1 + I_2 + 2\sqrt{I_1 I_2}\,\cos\delta$$

The cross term is the interference. It survives only if $\delta$ holds still for longer than the detector looks (the beams are **coherent**, O10) and the two fields are not perpendicular — the term is really $2\langle\vec E_1\cdot\vec E_2\rangle$, so it scales with $\cos\varphi$ for linear fields at angle $\varphi$. Geometry then sets the fringes: two plane waves crossing at a full angle $\alpha$ make straight fringes spaced $\Lambda = \lambda/\bigl(2\sin(\alpha/2)\bigr)$, and Young’s slits, Lloyd’s mirror and Fresnel’s biprism are all that formula in disguise.`,
  symbols: [
    { tex: 'I', text: 'the irradiance where the beams overlap, in W/m²' },
    { tex: 'I_1,\\ I_2', text: 'the irradiances of the two beams on their own' },
    { tex: '\\delta', text: 'their phase difference: $\\delta = 2\\pi\\,\\Delta/\\lambda_0$ for an optical path difference $\\Delta$, plus $\\pi$ for each reflection that flips one beam and not the other' },
    { tex: '\\Lambda', text: 'the fringe spacing, bright to bright, in metres' },
    { tex: '\\alpha', text: 'the full angle between the two beams’ directions' },
    { tex: '\\lambda', text: 'the wavelength in the medium where the beams cross ($\\lambda_0/n$)' },
  ],
  why: t`Every interferometer — from a laser velocimeter in a wind tunnel to LIGO — reads a phase difference through that cosine; the fringe spacing tells you how finely it can measure.`,
  visual: {
    type: 'graph',
    title: 'Two beams, one pattern',
    lead: t`The irradiance across the overlap of two crossing beams. The fringe spacing depends only on the crossing angle and the wavelength; the contrast depends on how unequal the beams are and on the angle between their polarizations.`,
    tasks: [
      t`Double the crossing angle: the fringes crowd to about half the spacing (exactly, for small angles).`,
      t`Turn the polarization angle to $90^\circ$: the fringes vanish and the two irradiances simply add — perpendicular fields do not interfere.`,
      t`Make beam 2 a hundred times fainter ($I_2/I_1 = 0.01$): the fringes still have visibility $0.2$ — a faint beam is easy to detect by interference.`,
    ],
    params: {
      x: [0, 40], y: [0, 4.2], aspect: 'wide', xlabel: 'position across the fringes (µm)', ylabel: 'I / I₁', xticks: 8, yticks: 4,
      sliders: [
        { key: 'al', label: 'Crossing angle $\\alpha$', min: 1.5, max: 30, step: 0.5, value: 4, unit: '^\\circ', explain: 'The full angle between the two beams.' },
        { key: 'lam', label: 'Wavelength $\\lambda$', min: 400, max: 1100, step: 1, value: 633, unit: '\\mathrm{nm}', explain: '532 nm green, 633 nm helium–neon red, 1064 nm Nd:YAG infrared.' },
        { key: 'r', label: 'Ratio $I_2/I_1$', min: 0, max: 1, step: 0.01, value: 1, explain: 'How bright beam 2 is compared with beam 1.' },
        { key: 'ph', label: 'Polarization angle $\\varphi$', min: 0, max: 90, step: 1, value: 0, unit: '^\\circ', explain: 'The angle between the two beams’ (linear) electric fields.' },
      ],
      curves: [{ fn: '1 + r + 2*sqrt(r)*cos(ph*pi/180)*cos(2*pi*x/(lam/1000/(2*sin(al*pi/360))))', color: 'gold', width: 2.4 }],
      hlines: [{ y: '1 + r', color: 'ink3' }],
      readouts: [
        { label: 'fringe spacing $\\Lambda$', expr: 'lam/1000/(2*sin(al*pi/360))', unit: '\\mu\\mathrm{m}', digits: 3 },
        { label: 'visibility $V$', expr: '2*sqrt(r)*cos(ph*pi/180)/(1 + r)', digits: 3, zero: 0.0005 },
      ],
    },
    caption: t`Two ideal plane waves of one frequency, perfectly coherent. The grey line is $I_1 + I_2$, what incoherent beams would give. Real beams are finite, so the fringes fill only their overlap.`,
  },
  example: {
    prompt: t`**Lloyd’s mirror.** A point source of $633$ nm light sits $h = ${sf(EX.h * 1e3, 2)}$ mm above a flat mirror, and a screen stands $L = ${sf(EX.L, 2)}$ m away, perpendicular to the mirror. Light reaches the screen directly and after a grazing reflection. Find the fringe spacing and say whether the fringe right at the mirror’s plane is bright or dark.`,
    visual: mirrorPic(t`Lloyd’s mirror: the reflected light seems to come from the image $S'$, so the screen sees two sources $2h$ apart. Heights hugely exaggerated.`),
    steps: [
      { label: 'Two sources', text: t`The reflected light seems to come from the mirror image $S'$, a distance $h$ below the mirror. So the screen is lit by two coherent sources $2h = ${sf(2 * EX.h * 1e3, 2)}$ mm apart: Young’s geometry with slit separation $2h$.` },
      { label: 'Spacing', text: t`$\Lambda = \dfrac{\lambda L}{2h} = \dfrac{(633\times10^{-9}\ \text{m})(${sf(EX.L, 2)}\ \text{m})}{${sf(2 * EX.h * 1e3, 2)}\times10^{-3}\ \text{m}} = ${sf(EX.Lam * 1e3, 3)}\ \text{mm}$.` },
      { label: 'Same as crossing beams', text: t`The two waves reach the screen at a full angle $\alpha \approx 2h/L = ${sf(EX.alpha * 1e3, 2)}$ mrad, and $\lambda/\bigl(2\sin(\alpha/2)\bigr) = ${sf(EX.check * 1e3, 3)}$ mm — the same answer.` },
      { label: 'The mirror’s plane', text: t`At the mirror the two paths are equal, $\Delta = 0$. But the grazing reflection off the denser mirror flips the reflected wave by $\pi$, so $\delta = \pi$ and the fringe there is **dark**. Bright fringes sit at $y = \Lambda/2, 3\Lambda/2, \dots$ above it.` },
      { label: 'Sense check', text: t`A fringe a little over half a millimetre wide is easy to see; doubling $h$ would halve it. Lloyd used this in 1834 as direct evidence that reflection from a denser medium flips the phase.` },
    ],
    answer: t`$\Lambda = ${sf(EX.Lam * 1e3, 3)}$ mm; the fringe at the mirror is dark, and the first bright one is $${sf(EX.Lam * 1e3 / 2, 3)}$ mm above it.`,
  },
  practice: [
    num({
      id: 'cross-spacing', difficulty: 1,
      gen(r) {
        const lam = r.pick([532, 633, 1064]), a = r.pick([2, 5, 10, 20, 30]);
        const L = spacing(lam / 1000, a);
        return {
          prompt: t`Two beams of $${lam}$ nm light from the same laser cross at a full angle of $${a}^\circ$. What is the spacing of the fringes where they overlap?`,
          visual: crossPic(a, t`Two beams crossing; the fringes (gold) run along the bisector of the beams. ${a < 36 ? 'The angle is exaggerated and the' : 'Not to scale: the'} fringes are far finer than drawn.`),
          answer: L, units: 'um', tol: { rel: 0.01 },
          errors: [{ value: lam / 1000 / (2 * Math.sin(a * DEG)), feedback: t`Use half the crossing angle: each beam is tilted by $\alpha/2$ from the bisector, and $\Lambda = \lambda/\bigl(2\sin(\alpha/2)\bigr)$.` }],
          hints: [t`Each beam is tilted by $\alpha/2$ from their bisector, so across the fringes their wave vectors differ by $2k\sin(\alpha/2)$.`, t`$\Lambda = \lambda/\bigl(2\sin(\alpha/2)\bigr)$ with $\alpha = ${a}^\circ$.`],
          teach: t`Two plane waves crossing at full angle $\alpha$ make fringes $\Lambda = \lambda/\bigl(2\sin(\alpha/2)\bigr)$ apart.`,
          explain: t`$\Lambda = \dfrac{${lam}\ \text{nm}}{2\sin ${sf(a / 2, 3)}^\circ} = ${sf(L, 3)}\ \mu\text{m}$. At $\alpha = 180^\circ$ (two beams meeting head on) it falls to $\lambda/2$: a standing wave.`,
        };
      },
    }),
    num({
      id: 'young-water', difficulty: 2,
      gen(r) {
        const d = r.pick([0.2, 0.25, 0.4, 0.5]), L = r.pick([1, 1.5, 2]), lam = r.pick([532, 633]);
        const n = nOf('water', lam), sp = (lam * 1e-6 * L * 1e3) / (n * d);       // mm
        return {
          prompt: t`Young’s two slits $${d}$ mm apart are lit by a $${lam}$ nm laser, and the screen is $${L}$ m away. The whole apparatus is then submerged in a tank of water ($n = ${sf(n, 4)}$). What is the fringe spacing now?`,
          visual: { type: 'optics-waves', params: { mode: 'slits', N: 2, a: 20, d: d * 1000, lambda: lam, L, controls: false, readout: false, hide: ['spacing'] }, caption: t`The same slits and screen in air (the simulation has no tank).` },
          answer: sp, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: sp * n, feedback: t`That is the spacing in air. In water every wavelength shrinks to $\lambda_0/n$, and the fringes with it.` }, { value: sp * n * n, feedback: t`Divide by $n$, do not multiply: the light’s wavelength is shorter in water.` }],
          hints: [t`In a medium the wavelength is $\lambda_0/n$; the geometry is unchanged.`, t`$\Lambda = \lambda_0 L/(n d)$.`],
          teach: t`Fringe spacing goes with the wavelength in the medium where the beams cross, $\lambda_0/n$.`,
          explain: t`$\Lambda = \dfrac{\lambda_0 L}{n d} = \dfrac{(${lam}\times10^{-9})(${L})}{${sf(n, 4)}\times ${d}\times10^{-3}}\ \text{m} = ${sf(sp, 3)}$ mm, against $${sf(sp * n, 3)}$ mm in air.`,
        };
      },
    }),
    mcq({
      id: 'lloyd-dark', difficulty: 2,
      prompt: t`In Lloyd’s mirror, what does the screen show right at the plane of the mirror, where the direct and reflected paths are exactly equal?`,
      visual: mirrorPic(t`Lloyd’s mirror. Heights exaggerated.`),
      choices: ['A dark fringe: the reflection flips the reflected wave by π, so equal paths cancel.', 'A bright fringe: equal paths mean the waves arrive in step.', 'Nothing in particular: the reflected light is incoherent with the direct light.', 'A bright or dark fringe depending on the wavelength.'],
      answer: 0,
      why: { 1: 'That forgets the phase flip on reflection from a denser medium — Lloyd’s point exactly.', 2: 'Both come from the same source: they are as coherent as the source allows.', 3: 'The phase difference is π at zero path difference for every wavelength — even white light gives a dark fringe there.' },
      hints: ['Count the phase difference as path difference plus reflection flips.', 'Grazing reflection off glass or metal turns the field over: δ = π even when Δ = 0.'],
      teach: 'A π flip on one beam swaps bright and dark fringes everywhere in the pattern.',
      explain: t`With $\Delta = 0$ and one flip, $\delta = \pi$: dark, for every colour. Lloyd’s dark fringe was direct evidence for the flip, which the Fresnel equations (O3.4) now give: $r_s \to -1$ at grazing incidence.`,
    }),
    num({
      id: 'pol-vis', difficulty: 2,
      gen(r) {
        const I2 = r.pick([1, 0.64, 0.36, 0.25]), phi = r.pick([30, 45, 60, 70]);
        const V = (2 * Math.sqrt(I2) * Math.cos(phi * DEG)) / (1 + I2);
        return {
          prompt: t`Two coherent beams of linearly polarized light overlap. Beam 2 has ${I2 === 1 ? 'the same irradiance as' : t`$${I2}$ times the irradiance of`} beam 1, and its field is turned $${phi}^\circ$ from beam 1’s. What is the visibility $V = (I_{\max} - I_{\min})/(I_{\max} + I_{\min})$ of the fringes?`,
          visual: polPic(phi, t`The two beams’ fields, seen along the light.`),
          answer: V, tol: { rel: 0.005 },
          errors: [
            { value: (2 * Math.sqrt(I2)) / (1 + I2), feedback: t`That is the visibility for parallel fields. Only the parallel components interfere: the cross term carries $\cos\varphi$.` },
            { value: (2 * Math.sqrt(I2) * Math.cos(phi * DEG) ** 2) / (1 + I2), feedback: t`The cross term is $2\langle\vec E_1\cdot\vec E_2\rangle$, linear in the fields: one factor $\cos\varphi$, not Malus’s $\cos^2\varphi$.` },
          ],
          hints: [t`The interference term is $2\langle\vec E_1\cdot\vec E_2\rangle = 2\sqrt{I_1I_2}\cos\varphi\cos\delta$.`, t`$V = 2\sqrt{I_1I_2}\cos\varphi/(I_1 + I_2)$.`],
          teach: t`Fields at angle $\varphi$ interfere only through their parallel components: visibility $2\sqrt{I_1I_2}\cos\varphi/(I_1 + I_2)$.`,
          explain: t`$V = \dfrac{2\sqrt{${I2}}\cos${phi}^\circ}{1 + ${I2}} = ${sf(V, 3)}$. The perpendicular component of beam 2 adds a uniform background that washes the fringes out.`,
        };
      },
    }),
    num({
      id: 'plate-shift', difficulty: 3,
      gen(r) {
        const lam = r.pick([532, 633]), tt = r.pick([5, 8, 10, 15]);
        const n = nOf('bk7', lam), N = ((n - 1) * tt * 1000) / lam;
        return {
          prompt: t`A cover slip of N-BK7 glass ($n = ${sf(n, 4)}$ at $${lam}$ nm), $${tt}\ \mu$m thick, is laid over one slit of a Young’s experiment. By how many fringes does the pattern shift?`,
          visual: youngPic(t`Young’s slits with a thin plate (violet) over the upper slit. Not to scale.`, true),
          answer: N, tol: { rel: 0.01 },
          errors: [{ value: (n * tt * 1000) / lam, feedback: t`The plate replaces $${tt}\ \mu$m of air: the extra optical path is $(n - 1)t$, not $nt$.` }],
          hints: [t`The plate adds optical path to one beam only. How much more than the air it replaces?`, t`Extra path $(n - 1)t$; each $\lambda_0$ of it moves the pattern by one fringe.`],
          teach: t`A plate of index $n$ and thickness $t$ in one beam shifts the fringes by $(n - 1)t/\lambda_0$ — toward the side of the plate.`,
          explain: t`$N = (n - 1)t/\lambda_0 = (${sf(n - 1, 4)})(${tt}\ \mu\text{m})/(${lam}\ \text{nm}) = ${sf(N, 3)}$ fringes, toward the covered slit (its light is delayed, so equal phase is reached nearer that side). Counting such shifts measures the thickness of thin layers, or the index of a gas filling a cell.`,
        };
      },
    }),
    mcq({
      id: 'two-lasers', difficulty: 2,
      prompt: t`Two separate helium–neon lasers of the same nominal wavelength light the same patch of a screen. What does a camera with a $1/60$ s exposure record?`,
      visual: {
        type: 'graph', caption: t`Snapshots of what the two lasers’ fields would make at three instants a microsecond apart (thin), with their relative phase wandering — and the average over the exposure (gold).`,
        params: { x: [0, 10], y: [0, 4.4], aspect: 'wide', xlabel: 'position on the screen', ylabel: 'irradiance', xticks: 0, yticks: 0,
          curves: [{ fn: fringeCurve(1, 1, 3, 1, 0.4), color: 'accent', width: 1.2, dash: [4, 4] }, { fn: fringeCurve(1, 1, 3, 1, 2.6), color: 'teal', width: 1.2, dash: [4, 4] }, { fn: fringeCurve(1, 1, 3, 1, 4.5), color: 'violet', width: 1.2, dash: [4, 4] }, { fn: '2', color: 'gold', width: 3 }] },
      },
      choices: ['A uniform patch with the two irradiances added: any fringes move far too fast to record.', 'Steady fringes, since both lasers are monochromatic.', 'Darkness, since the two waves cancel on average.', 'Steady fringes, but only if the lasers have the same power.'],
      answer: 0,
      why: { 1: 'No laser is perfectly monochromatic: their frequencies differ by megahertz and their phases drift, so the fringes sweep past millions of times during the exposure.', 2: 'The cross term averages to zero, not the whole irradiance: the energy is still there, as I₁ + I₂.', 3: 'Power sets the contrast, not whether the fringes hold still.' },
      hints: ['Stable fringes need a phase difference that holds still for the whole exposure.', 'Two independent lasers differ in frequency by at least kilohertz; their relative phase runs round many times in 1/60 s.'],
      teach: 'Independent sources interfere at every instant, but their fringes move: a slow detector averages the cross term away.',
      explain: t`Light from independent sources does interfere at each instant, but the pattern drifts as their relative phase wanders, and a slow detector records only $I_1 + I_2$. With fast detectors and very faint, short exposures, fringes between two independent lasers were indeed recorded (Magyar and Mandel, 1963).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-ldv', difficulty: 3, transfer: true,
      gen(r) {
        const a = r.pick([6, 8, 10, 12]), f = r.pick([8, 12, 20, 30]);
        const L = spacing(0.532, a), v = f * L;           // µm × MHz = m/s
        return {
          prompt: t`**Laser Doppler velocimetry.** To measure the flow in a wind tunnel without a probe, two $532$ nm beams cross at a full angle of $${a}^\circ$ inside the test section. A smoke particle drifting across the fringes scatters light that flickers at $${f}$ MHz. How fast is the particle moving across the fringes?`,
          visual: crossPic(a, t`The probe volume where the beams cross; a particle (dot) crosses the fringes. Angle exaggerated, fringes far finer in reality.`, { points: [{ x: 1.3, y: -0.9, r: 4, color: 'ink' }], arrows: [{ from: [1.3, -0.9], to: [1.3, 0.25], color: 'ink', width: 2, label: 'v' }] }),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: f * 0.532, feedback: t`The flicker is one cycle per fringe crossed: $v = f\Lambda$ with the fringe spacing, not the wavelength.` },
            { value: f * (0.532 / (2 * Math.sin(a * DEG))), feedback: t`Use half the crossing angle in the fringe spacing: $\Lambda = \lambda/\bigl(2\sin(\alpha/2)\bigr)$.` },
          ],
          hints: [t`First find the fringe spacing $\Lambda$ in the crossing region.`, t`Each fringe crossed is one flicker: $v = f\Lambda$.`],
          teach: t`A particle crossing fringes $\Lambda$ apart at speed $v$ flickers at $f = v/\Lambda$ — the principle of laser Doppler velocimetry.`,
          explain: t`$\Lambda = 532\ \text{nm}/(2\sin ${a / 2}^\circ) = ${sf(L, 3)}\ \mu$m, so $v = f\Lambda = (${f}\times10^6\ \text{s}^{-1})(${sf(L, 3)}\times10^{-6}\ \text{m}) = ${sf(v, 3)}$ m/s. Only the velocity component across the fringes counts; real systems shift one beam’s frequency so that the sign of the motion shows too.`,
        };
      },
    }),
    num({
      id: 'cp-cliff', difficulty: 3, transfer: true,
      gen(r) {
        const h = r.pick([60, 80, 100, 120]), lam = r.pick([1.5, 3]);
        const e = Math.asin(lam / (4 * h)) / DEG;
        return {
          prompt: t`**A sea interferometer.** A radio antenna on a cliff $${h}$ m above the sea receives a cosmic radio source both directly and by reflection off the sea, which flips the reflected wave by $\pi$. The wavelength is $${lam}$ m. As the source rises from the horizon, at what elevation angle does the signal first reach a maximum?`,
          visual: cliffPic(t`The cliff-top antenna A, the sea and the antenna’s mirror image A′. A distant source’s rays arrive parallel at elevation $e$, one directly and one off the sea. Angles and heights hugely exaggerated.`),
          answer: e, units: 'deg', tol: { rel: 0.01 },
          errors: [{ value: Math.asin(lam / (2 * h)) / DEG, feedback: t`That would be a maximum if the reflection did not flip the wave. With the flip, maxima are at $2h\sin e = (m + \tfrac12)\lambda$.` }],
          hints: [t`The direct and reflected paths differ by $2h\sin e$ for a distant source at elevation $e$ — the antenna and its image are $2h$ apart.`, t`With the $\pi$ flip, the first maximum is where $2h\sin e = \lambda/2$.`],
          teach: t`Lloyd’s mirror at radio wavelengths: a source rising over the sea sweeps through fringes $\lambda/(2h)$ radians apart, starting dark at the horizon.`,
          explain: t`$\sin e = \lambda/(4h) = ${lam}/${4 * h}$, so $e = ${sf(e, 3)}^\circ$. The fringes repeat every $\lambda/(2h) = ${sf((lam / (2 * h)) / DEG, 3)}^\circ$ of elevation; Australian radio astronomers used exactly this cliff-top interferometer in the 1940s to show that solar and cosmic radio sources were small.`,
        };
      },
    }),
    mcq({
      id: 'cp-arago', difficulty: 2,
      prompt: t`Two beams from one laser are made to have perpendicular linear polarizations (one passes a half-wave plate) and then overlap on a screen: no fringes. Which single addition, placed where they overlap, brings fringes back?`,
      visual: polPic(90, t`The two beams’ fields after the half-wave plate, seen along the light.`),
      choices: ['A polarizer with its axis at 45° to both fields.', 'A polarizer with its axis along one beam’s field.', 'A stronger laser.', 'A more careful match of the two path lengths.'],
      answer: 0,
      why: { 1: 'That passes one beam and blocks the other: a uniform patch, no fringes.', 2: 'Brightness does not help: the cross term is zero for perpendicular fields at any power.', 3: 'The paths can match perfectly and the fields still have no common component.' },
      hints: ['Perpendicular fields have no common component, so the cross term vanishes.', 'Something must project both fields onto one shared direction.'],
      teach: 'Perpendicular polarizations do not interfere; projecting both onto a common axis restores fringes (the Fresnel–Arago laws).',
      explain: t`A polarizer at $45^\circ$ passes $\cos 45^\circ$ of each field along the same axis, so the transmitted beams are parallel, equal and coherent: full-visibility fringes, at a quarter of the total irradiance. This is how polarization interferometers and the Nomarski microscope work.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §9.1–9.3 (conditions for interference, wavefront splitting, Lloyd’s mirror)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'G. Magyar and L. Mandel, “Interference fringes produced by superposition of two independent maser light beams”, Nature 198, 255 (1963)', url: 'https://doi.org/10.1038/198255a0' },
  ],
});
