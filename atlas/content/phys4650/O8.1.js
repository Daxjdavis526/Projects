// Fraunhofer diffraction from slits and apertures (Hecht §10.1–10.2). PHYS
// 2220 O4.1/O4.3 did the single slit's zeros a sin θ = mλ, its (sin β/β)²
// intensity and Rayleigh's 1.22λ/D. Here: when the far field applies — the
// Fresnel number N_F = a²/(Lλ) ≪ 1 (a the half-width or radius) — and what it
// is: the far field is the Fourier transform of the aperture (preview of O9).
// Rectangular apertures factor into two sinc² patterns, wide where the
// aperture is narrow; a circular one gives Airy's [2J₁(u)/u]² with
// u = (πD/λ) sin θ, first zero 1.22λ/D, 83.8 % of the power inside it; a
// lens brings the far field to its focal plane (Airy radius 1.22λN for
// f-number N). Babinet: a wire diffracts like a slit of its width. Double
// slit = single-slit envelope × array factor. Transfers: JWST's diffraction
// spikes (edges diffract perpendicular to themselves), an orbiter camera's
// ground resolution, where the far field of a 6.5 m mirror starts.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { sf } from './_op.js';
import { seg, word, pic } from './_op3.js';

const t = String.raw;
const J1Z = 1.2196698912665045;        // first zero of J₁(πx): 3.8317/π

// the worked example: a 1.0 mm pinhole, 633 nm, screen 5.0 m away
const EX = { D: 1e-3, lam: 633e-9, L: 5 };
EX.NF = (EX.D / 2) ** 2 / (EX.L * EX.lam);
EX.r1 = (J1Z * EX.lam * EX.L) / EX.D;

/** The Airy profile against radius in units of λN (focal plane) or any scale s (first zero at 1.22 s). */
const airyProfile = (caption, xlabel = 'radius in the focal plane / (λN)', extra = {}) => ({
  type: 'graph', caption: `${caption} Dashed: the rings magnified 30 times.`,
  params: { x: [0, 3.6], y: [0, 1.1], aspect: 'wide', xlabel, ylabel: 'I / I₀', xticks: 6, yticks: 2,
    curves: [{ fn: '(2*besselj(1, pi*x + 0.000001)/(pi*x + 0.000001))^2', color: 'gold', width: 2.4 }, { fn: 'min(1.2, 30*(2*besselj(1, pi*x + 0.000001)/(pi*x + 0.000001))^2)', domain: [1, 3.6], color: 'ink3', width: 1.2, dash: [4, 4], label: '×30', labelAt: 1.9 }], ...extra },
});

/** An aperture and the regions where the Fresnel and the Fraunhofer approximations hold. */
const regimePic = (caption) => ({
  type: 'graph', caption,
  params: pic([-0.5, 10.5], [-2.4, 2.4], {
    curves: [
      seg([0.5, 2.2], [0.5, 0.45], 'ink2', { width: 4 }), seg([0.5, -0.45], [0.5, -2.2], 'ink2', { width: 4 }),
      seg([0.5, 0.45], [10, 0.45], 'gold', { dash: [4, 4] }), seg([0.5, -0.45], [10, -0.45], 'gold', { dash: [4, 4] }),
      seg([0.5, 0.45], [10, 1.9], 'accent', { width: 1.4 }), seg([0.5, -0.45], [10, -1.9], 'accent', { width: 1.4 }),
      seg([4.2, -2.3], [4.2, 2.3], 'ink3', { dash: [3, 5] }),
    ],
    points: [word(2.4, 1.6, 'near field (Fresnel)', 'ink2'), word(7.3, 2.1, 'far field (Fraunhofer)', 'ink2'), word(0.5, 0, 'aperture', 'ink3'), word(4.2, -2.2, 'Fresnel number ≈ 1', 'ink3', { labelDy: -12 })],
  }),
});

/** A double slit drawn as an aperture: two openings of width a, centres d apart. */
const doubleSlitPic = (caption) => ({
  type: 'graph', caption,
  params: pic([-5, 5], [-1.6, 2.0], {
    curves: [
      seg([-4.8, 0], [-2.0, 0], 'ink2', { width: 7 }), seg([-1.2, 0], [1.2, 0], 'ink2', { width: 7 }), seg([2.0, 0], [4.8, 0], 'ink2', { width: 7 }),
      seg([-2.0, 0.55], [-1.2, 0.55], 'gold', { width: 1.5 }), seg([-1.6, -0.6], [1.6, -0.6], 'accent', { width: 1.5 }),
      seg([-1.6, -0.45], [-1.6, -0.75], 'accent', { width: 1.5 }), seg([1.6, -0.45], [1.6, -0.75], 'accent', { width: 1.5 }),
    ],
    points: [word(-1.6, 0.95, 'a', 'gold'), word(0, -1.0, 'd', 'accent'), word(3.4, 0.5, 'opaque', 'ink3')],
  }),
});

/** JWST's primary mirror as 18 hexagonal segments (flat-topped, drawn schematically) and the secondary's struts. */
function hexMirrorPic(caption) {
  const s = 1, curves = [];
  for (let q = -2; q <= 2; q++) for (let rr = -2; rr <= 2; rr++) {
    const dist = Math.max(Math.abs(q), Math.abs(rr), Math.abs(-q - rr));
    if (dist < 1 || dist > 2) continue;
    const cx = 1.5 * s * q, cy = Math.sqrt(3) * s * (rr + q / 2), R = 0.94 * s;
    for (let k = 0; k < 6; k++) {
      const a0 = (k * Math.PI) / 3, a1 = ((k + 1) * Math.PI) / 3;
      curves.push(seg([cx + R * Math.cos(a0), cy + R * Math.sin(a0)], [cx + R * Math.cos(a1), cy + R * Math.sin(a1)], 'gold', { width: 2 }));
    }
  }
  curves.push(seg([0, 0], [0, 4.6], 'ink3', { width: 2 }), seg([0, 0], [-2.3, -3.98], 'ink3', { width: 2 }), seg([0, 0], [2.3, -3.98], 'ink3', { width: 2 }));
  return { type: 'graph', caption, params: pic([-6.5, 6.5], [-4.8, 4.8], { curves, points: [{ x: 0, y: 0, r: 7, color: 'ink2' }] }) };
}

export default lesson({
  id: 'phys4650.O8.1',
  title: 'Fraunhofer diffraction from slits and apertures',
  minutes: 17, difficulty: 3,
  intro: t`Every point of an aperture re-radiates a wavelet (Huygens–Fresnel), and the pattern is their sum. Far enough away — once the **Fresnel number** $N_F = a^2/(L\lambda)$ is small, for an aperture of half-width $a$ at distance $L$ — the wavelets travel effectively parallel, their path differences become linear in the aperture coordinate, and the pattern stops changing shape, only growing: the **Fraunhofer** far field. It is the **Fourier transform** of the aperture. A slit of width $b$ gives $(\sin\beta/\beta)^2$; a circle of diameter $D$ gives the Airy pattern

$$I(\theta) = I_0\left[\frac{2J_1(u)}{u}\right]^2, \qquad u = \frac{\pi D}{\lambda}\sin\theta$$

with its first dark ring at $\sin\theta_1 = 1.22\,\lambda/D$. A lens of focal length $f$ brings the far field to its focal plane, so every telescope sees it.`,
  symbols: [
    { tex: 'I(\\theta)', text: 'the irradiance at angle $\\theta$ from the axis' },
    { tex: 'I_0', text: 'the irradiance at the centre' },
    { tex: 'J_1', text: 'the Bessel function of order one ($J_1(u) \\approx u/2$ for small $u$, so the bracket is 1 at the centre)' },
    { tex: 'u', text: 'the phase across the aperture’s radius (dimensionless)' },
    { tex: 'D', text: 'the aperture’s diameter' },
    { tex: '\\lambda', text: 'the wavelength' },
    { tex: 'N_F', text: 'the Fresnel number: well below 1 for Fraunhofer, near or above 1 for Fresnel (O8.3)' },
  ],
  why: t`The Airy pattern is the sharpest point any telescope or camera can make; its width, $1.22\lambda/D$, is why astronomers build ever bigger mirrors and link radio dishes across the Earth.`,
  visual: {
    type: 'graph',
    title: 'Slit against circle',
    lead: t`The far-field irradiance of a slit of width $D$ and of a circular hole of diameter $D$, against angle. Same width, different shapes: the circle’s first zero sits $1.22$ times further out.`,
    tasks: [
      t`Double $D$: both patterns shrink to half the width — the inverse relation between an aperture and its far field.`,
      t`Compare the side lobes: the slit’s first is $4.7\%$ of the centre, the circle’s only $1.75\%$.`,
      t`Turn the wavelength from blue to red: the pattern widens in proportion.`,
    ],
    params: {
      x: [-10, 10], y: [0, 1.1], aspect: 'wide', xlabel: 'angle θ (mrad)', ylabel: 'I / I₀', xticks: 10, yticks: 2,
      sliders: [
        { key: 'D', label: 'Aperture width $D$', min: 100, max: 1000, step: 10, value: 200, unit: '\\mu\\mathrm{m}', explain: 'The slit’s width, or the hole’s diameter.' },
        { key: 'lam', label: 'Wavelength $\\lambda$', min: 400, max: 700, step: 1, value: 633, unit: '\\mathrm{nm}', explain: 'The light’s wavelength.' },
      ],
      choices: [{ key: 'sh', label: 'Aperture', options: [[0, 'Slit'], [1, 'Circle'], [2, 'Both']], value: 2, explain: 'Which far field to draw.' }],
      curves: [
        { fn: '(sin(pi*D*x/lam + 0.000001)/(pi*D*x/lam + 0.000001))^2', color: 'accent', width: 2, when: 'step(0.5 - sh) + step(sh - 1.5)', label: 'slit', labelAt: 4.5 },
        { fn: '(2*besselj(1, pi*D*x/lam + 0.000001)/(pi*D*x/lam + 0.000001))^2', color: 'gold', width: 2.4, when: 'step(sh - 0.5)', label: 'circle', labelAt: -4.2 },
      ],
      readouts: [
        { label: 'slit’s first zero $\\lambda/D$', expr: 'lam/D', unit: '\\mathrm{mrad}', digits: 3 },
        { label: 'circle’s first zero $1.22\\lambda/D$', expr: '1.2197*lam/D', unit: '\\mathrm{mrad}', digits: 3 },
      ],
    },
    caption: t`Fraunhofer (far-field) patterns, normalized to the same central irradiance; small angles. A real circle of the same width passes less light than the slit (per unit length), but the shapes are what matter here.`,
  },
  example: {
    prompt: t`A $${EX.D * 1e3}$ mm pinhole is lit by a $633$ nm laser and a screen stands $${EX.L}$ m away. Check that the Fraunhofer approximation holds, then find the radius of the first dark ring and the fraction of the light inside it.`,
    visual: { type: 'optics-waves', params: { mode: 'airy', preset: 'custom', D: EX.D, lambda: EX.lam, single: true, controls: false, readout: false }, caption: t`The Airy pattern of a single point source through a circular aperture (the simulation draws it as a telescope would see a star).` },
    steps: [
      { label: 'Regime', text: t`With half-width $a = ${EX.D * 500}$ mm, $N_F = \dfrac{a^2}{L\lambda} = \dfrac{(5\times10^{-4})^2}{(${EX.L})(633\times10^{-9})} = ${sf(EX.NF, 2)}$, well below 1: the edge of the hole is only $${sf(EX.NF / 2, 2)}$ of a wavelength further from the centre of the screen than the hole’s centre is. Fraunhofer holds.` },
      { label: 'First dark ring', text: t`$\sin\theta_1 = 1.22\lambda/D = 1.22(633\times10^{-9})/(10^{-3}) = ${sf((J1Z * EX.lam) / EX.D * 1e3, 3)}$ mrad, so on the screen $r_1 = L\theta_1 = ${sf(EX.r1 * 1e3, 3)}$ mm.` },
      { label: 'Encircled power', text: t`Integrating $[2J_1(u)/u]^2$ over the disc inside the first zero gives $1 - J_0^2(3.832) - J_1^2(3.832) = 0.838$: about $84\%$ of the light is in the central spot, $7\%$ in the first bright ring.` },
      { label: 'Sense check', text: t`The spot, $${sf(2 * EX.r1 * 1e3, 2)}$ mm across, is about eight times the hole: far from the hole the light spreads at an angle of order $\lambda/D$, as it must.` },
    ],
    answer: t`$N_F \approx ${sf(EX.NF, 2)}$, so Fraunhofer holds; the first dark ring has radius $${sf(EX.r1 * 1e3, 3)}$ mm and holds $84\%$ of the light.`,
  },
  practice: [
    num({
      id: 'far-distance', difficulty: 1,
      gen(r) {
        const [w, wu, a] = r.pick([[2, 'mm', 1e-3], [0.5, 'mm', 0.25e-3], [100, '\\mu\\text{m}', 50e-6], [5, 'mm', 2.5e-3]]), lam = r.pick([532, 633]);
        const L = (a * a) / (0.1 * lam * 1e-9);
        return {
          prompt: t`Light of $${lam}$ nm passes a slit $${w}\ ${wu}$ wide. Beyond what distance is the Fresnel number $N_F = a^2/(L\lambda)$ (with $a$ the half-width) below $0.1$, so that the Fraunhofer pattern is a good description?`,
          visual: regimePic(t`Near the aperture the light keeps its shape (Fresnel); far away it spreads at angles of order λ/a (Fraunhofer). The changeover is gradual; not to scale.`),
          answer: L, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: L * 4, feedback: t`Use the half-width, $a = ${w / 2}\ ${wu}$, not the full width.` }, { value: L / 10, feedback: t`That is where $N_F = 1$; for $N_F < 0.1$ you need ten times further.` }],
          hints: [t`Solve $a^2/(L\lambda) = 0.1$ for $L$.`, t`$L = 10a^2/\lambda$ with $a = ${w / 2}\ ${wu}$.`],
          teach: t`The far field starts at distances of order $a^2/\lambda$ — short for a hair, enormous for a telescope mirror.`,
          explain: t`$L = \dfrac{a^2}{0.1\lambda} = ${sf(L, 3)}$ m. A lens moves this far field to its focal plane, which is why a lab demonstration needs no long corridor.`,
        };
      },
    }),
    num({
      id: 'fnumber', difficulty: 2,
      gen(r) {
        const N = r.pick([2.8, 4, 8, 11, 16]), lam = r.pick([450, 550, 650]);
        const d = 2 * J1Z * (lam / 1000) * N;
        return {
          prompt: t`A camera lens is set to f-number $N = f/D = ${N}$. What is the **diameter** of the Airy disc (to its first dark ring) that it makes from a distant point of $${lam}$ nm light, in micrometres?`,
          visual: airyProfile(t`The Airy profile in a lens’s focal plane, against radius in units of λN.`),
          answer: d, units: 'um', tol: { rel: 0.01 },
          errors: [{ value: 2 * (lam / 1000) * N, feedback: 'A round aperture’s first zero is at 1.22λ/D, not λ/D.' }],
          hints: [t`In the focal plane, radius $= f\theta$, and $\theta_1 = 1.22\lambda/D$.`, t`So $r_1 = 1.22\lambda f/D = 1.22\lambda N$; double it for the diameter.`],
          teach: t`A lens of f-number $N$ makes an Airy disc of radius $1.22\lambda N$ — set by the ratio $f/D$ alone.`,
          explain: t`$2r_1 = 2(1.22)(${lam}\ \text{nm})(${N}) = ${sf(d, 3)}\ \mu$m. Stopping a lens down past about f/8 starts to blur detail on sensors with pixels of a few micrometres: diffraction, not aberration, then limits it.`,
        };
      },
    }),
    mcq({
      id: 'rect', difficulty: 2,
      prompt: t`Laser light passes a rectangular hole four times wider (horizontally) than it is tall. What does the central spot of its far-field pattern look like?`,
      visual: { type: 'graph', caption: t`The aperture, seen face on.`, params: pic([-4, 4], [-1.6, 1.6], { curves: [seg([-2, -0.5], [2, -0.5], 'gold', { width: 2.4 }), seg([2, -0.5], [2, 0.5], 'gold', { width: 2.4 }), seg([2, 0.5], [-2, 0.5], 'gold', { width: 2.4 }), seg([-2, 0.5], [-2, -0.5], 'gold', { width: 2.4 })], points: [word(0, -0.9, 'width 4b', 'ink3'), word(2.6, 0, 'height b', 'ink3')] }) },
      choices: ['Four times taller than it is wide: the narrow direction of the hole spreads most.', 'Four times wider than it is tall, the same shape as the hole.', 'Round, because diffraction blurs every shape into a disc.', 'Square, because each direction is diffracted equally.'],
      answer: 0,
      why: { 1: 'That is the geometric shadow. In the far field each dimension spreads as λ divided by that dimension.', 2: 'A round spot comes from a round aperture; a rectangle factors into two independent sinc² patterns.', 3: 'The spread in each direction is inversely proportional to the aperture in that direction.' },
      hints: ['The pattern factors: sinc² in x set by the width, sinc² in y set by the height.', 'Each spreads as λ divided by its own dimension.'],
      teach: 'The far field is the aperture’s Fourier transform: narrow in one direction means wide in that direction.',
      explain: t`$I \propto \mathrm{sinc}^2(\pi w\sin\theta_x/\lambda)\,\mathrm{sinc}^2(\pi h\sin\theta_y/\lambda)$: the central spot spans $2\lambda/w$ horizontally and $2\lambda/h$ vertically, four times as much — a vertical stripe of light from a horizontal slot.`,
    }),
    num({
      id: 'wire', difficulty: 2,
      gen(r) {
        const L = r.pick([1.5, 2]), dy = r.pick([8, 10, 12, 15]);
        const D = ((633e-9 * L) / (dy * 1e-3)) * 1e6;
        return {
          prompt: t`A $633$ nm laser shines on a single human hair, and on a screen $${L}$ m away the dark fringes beside the bright centre are $${dy}$ mm apart. By Babinet’s principle the hair diffracts like a slit of the same width. How thick is the hair?`,
          visual: { type: 'optics-waves', params: { mode: 'slits', N: 1, a: sf(D, 3), d: 400, lambda: 633, L, controls: false, readout: false, phasors: false }, caption: t`A slit as wide as the hair: away from the centre the hair’s pattern is the same (Babinet’s principle).` },
          answer: D, units: 'um', tol: { rel: 0.01 },
          errors: [{ value: D / 2, feedback: 'Neighbouring dark fringes are λL/D apart; the gap across the bright centre is twice that, but you were given the spacing.' }],
          hints: [t`Dark fringes sit at $\sin\theta = m\lambda/D$, so on the screen they are $\lambda L/D$ apart.`, t`$D = \lambda L/\Delta y$.`],
          teach: 'Babinet’s principle: an obstacle and the hole it would fill have the same diffraction pattern away from the direct beam.',
          explain: t`$D = \lambda L/\Delta y = (633\times10^{-9})(${L})/(${dy}\times10^{-3})\ \text{m} = ${sf(D, 3)}\ \mu$m — typical of hair. The complementary screens’ fields add to the unobstructed beam, which is zero away from the centre, so their irradiances match there.`,
        };
      },
    }),
    num({
      id: 'envelope-count', difficulty: 3,
      gen(r) {
        const a = r.pick([0.06, 0.08, 0.1]), ratio = r.pick([3.4, 4.3, 5.5, 6.25]);
        const d = sf(a * ratio, 3), n = 2 * Math.floor(d / a) + 1;
        return {
          prompt: t`A double slit has slits $a = ${a}$ mm wide with centres $d = ${d}$ mm apart. How many bright interference fringes lie inside the central maximum of the single-slit envelope?`,
          visual: doubleSlitPic(t`The double-slit aperture: openings of width $a$ with centres $d$ apart (not to scale).`),
          answer: n, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: Math.floor(d / a), feedback: 'Count both sides of the centre, and the central fringe itself.' }, { value: 2 * Math.floor(d / a) - 1, feedback: `Only orders with |m| equal to d/a exactly are missing; here d/a = ${sf(d / a, 3)} is not a whole number, so order ${Math.floor(d / a)} survives.` }].filter((e) => Math.abs(e.value - n) > 0.5),
          hints: [t`The pattern is the single-slit envelope (zero at $\sin\theta = \lambda/a$) times the two-slit fringes (bright at $\sin\theta = m\lambda/d$).`, t`Count the integers $m$ with $|m| < d/a = ${sf(d / a, 3)}$.`],
          teach: 'A double slit’s pattern is the product of the single-slit envelope and the array factor: the Fourier transform of a convolution.',
          explain: t`Bright fringes inside the envelope need $|m|\lambda/d < \lambda/a$, i.e. $|m| < d/a = ${sf(d / a, 3)}$: $m = -${Math.floor(d / a)}, \dots, ${Math.floor(d / a)}$, so ${n} fringes. The aperture is a narrow slit convolved with two points, so its far field is a sinc² multiplied by cos².`,
        };
      },
    }),
    mcq({
      id: 'encircled', difficulty: 2,
      prompt: t`What fraction of the light focused by a perfect circular lens falls inside the first dark ring of its Airy pattern?`,
      visual: airyProfile(t`The Airy profile along a radius. Light far out counts for more than the curve suggests: a ring at radius $r$ has circumference $2\pi r$.`),
      choices: ['About 84%.', 'About 50%: the edge of the disc is where the irradiance has fallen to half.', 'All of it: the dark ring is the edge of the image.', 'About 68%, as within one standard deviation of a Gaussian.'],
      answer: 0,
      why: { 1: 'Half the peak irradiance is reached at a radius of 0.51λ/D, well inside the first zero, and that point holds less than half the power.', 2: 'The bright rings outside carry the rest — about 7% in the first ring alone.', 3: 'The Airy pattern is not a Gaussian; that number belongs to a different distribution.' },
      hints: ['The rings are faint, but they are large circles.', 'Integrate [2J₁(u)/u]² over the disc to the first zero.'],
      teach: 'An Airy disc holds about 84% of the light; the rest is spread through the rings.',
      explain: t`Lord Rayleigh’s result: the encircled energy is $1 - J_0^2(u) - J_1^2(u)$, which is $0.838$ at the first zero $u = 3.832$. The first ring adds about $7\%$, the second $3\%$.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-spikes', difficulty: 2, transfer: true,
      prompt: t`Bright stars in James Webb Space Telescope images wear six large spikes (plus two small horizontal ones). Its primary mirror is 18 hexagonal segments; three struts hold its secondary mirror. Where do the six large spikes come from?`,
      visual: hexMirrorPic(t`JWST’s primary mirror (18 hexagonal segments, schematic) and the three struts holding the secondary (grey).`),
      choices: ['The segments’ straight edges: each diffracts light perpendicular to itself, and the hexagons’ edges point in three directions, giving six spikes.', 'One spike from each of the six segments nearest the centre.', 'Twinkling in Earth’s atmosphere, spread into rays by the camera.', 'Only the three struts: three straight edges give six spikes and nothing else matters.'],
      answer: 0,
      why: { 1: 'All 18 segments diffract the same way; spikes come from the directions of edges, not from how many segments there are.', 2: 'JWST is in space, a million and a half kilometres from Earth: no atmosphere.', 3: 'No strut is horizontal, so the struts cannot make the vertical pair of large spikes: those come from the hexagons’ horizontal edges. The struts reinforce the diagonal spikes and add the small horizontal pair.' },
      hints: ['A straight edge’s far field is a streak perpendicular to the edge.', 'How many distinct edge directions does a hexagon have?'],
      teach: 'Straight edges diffract light into streaks perpendicular to themselves: the shape of an aperture is written into every star image.',
      explain: t`A hexagon’s six edges point in three directions; each direction streaks the light both ways perpendicular to it, giving six spikes. The struts reinforce two of those directions and add the faint horizontal pair. Hubble’s round mirror and four struts give its four-pointed stars.`,
    }),
    num({
      id: 'cp-orbiter', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([0.3, 0.5, 1.0]), h = r.pick([250, 300, 400]);
        const g = (J1Z * 550e-9 * h * 1e3) / D;
        return {
          prompt: t`A Mars orbiter’s camera has a $${D}$ m mirror and looks straight down from $${h}$ km. At $550$ nm, what is the smallest ground separation (Rayleigh criterion) at which it could tell two points apart, in metres?`,
          visual: airyProfile(t`Each ground point is imaged as an Airy pattern; two are just resolved when one’s peak sits on the other’s first zero.`, 'angle / (λ/D)'),
          answer: g, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: g / J1Z, feedback: 'A round mirror’s first zero is at 1.22λ/D.' }],
          hints: [t`Rayleigh: $\theta = 1.22\lambda/D$.`, t`Ground separation $= h\theta$.`],
          teach: t`An orbiting camera’s best ground resolution is $1.22\lambda h/D$.`,
          explain: t`$\theta = 1.22(550\times10^{-9})/${D} = ${tex((J1Z * 550e-9) / D)}$ rad, times $${h}$ km is $${sf(g, 3)}$ m. Real cameras also need pixels and pointing stability to match.`,
        };
      },
    }),
    num({
      id: 'cp-farfield', difficulty: 3, transfer: true,
      gen(r) {
        const [D, nm] = r.pick([[6.5, 'JWST’s 6.5 m mirror'], [2.4, 'Hubble’s 2.4 m mirror'], [39, 'a 39 m extremely large telescope']]), lam = r.pick([0.5, 2]);
        const L = (D / 2) ** 2 / (lam * 1e-6) / 1e3;      // km
        return {
          prompt: t`Without its focus, how far from ${nm} would you have to go, at $${lam}\ \mu$m, before the Fresnel number $N_F = a^2/(L\lambda)$ (with $a$ the radius) fell to 1? Give the answer in kilometres.`,
          visual: regimePic(t`Near and far field of an aperture (schematic). A telescope’s focus brings the far field to its focal plane.`),
          answer: L, units: 'km', tol: { rel: 0.01 },
          errors: [{ value: L * 4, feedback: 'Use the radius, half the diameter.' }],
          hints: [t`$N_F = 1$ means $L = a^2/\lambda$.`, t`$a = ${D / 2}$ m and $\lambda = ${lam}\times10^{-6}$ m.`],
          teach: t`A telescope’s natural far field is millions of kilometres away; its focusing optics bring the Fraunhofer pattern to the focal plane.`,
          explain: t`$L = a^2/\lambda = (${D / 2})^2/(${lam}\times10^{-6})\ \text{m} = ${tex(L)}$ km. A focusing mirror cancels the quadratic phase across the aperture, which is exactly what made the near field differ from the far field (O9.1).`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §10.1–10.2 (Fraunhofer diffraction, rectangular and circular apertures, Babinet)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'Astronomy magazine, “Ask Astro: What causes the pattern of diffraction spikes?” (2023), on JWST’s segments and struts', url: 'https://www.astronomy.com/observing/ask-astro-what-causes-the-pattern-of-diffraction-spikes/' },
  ],
});
