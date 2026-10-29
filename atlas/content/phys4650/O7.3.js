// Thin films (Hecht §9.4, §9.7, §9.9). PHYS 2220 O3.2 did soap films, single
// AR coatings and air wedges. Here: the optical path difference
// Δ = 2n_f d cos θ_t; fringes of equal inclination (a uniform plate: rings at
// infinity, Haidinger) against fringes of equal thickness (wedges, Newton's
// rings r_m = √(mλR), flatness testing, λ/2 of height per fringe); the exact
// quarter-wave reflectance ((n₀n_s − n₁²)/(n₀n_s + n₁²))², the absentee
// half-wave layer; and the quarter-wave stack: each quarter-wave layer turns
// an admittance Y into n²/Y, so (HL)^N on a substrate reflects
// ((n₀ − Y)/(n₀ + Y))² with Y = (n_H/n_L)^{2N} n_s — checked against
// characteristic matrices (stackR in _op3.js). Worked example: a tantala/silica
// mirror at 1064 nm (the kind of coating on LIGO's test masses, numbers
// illustrative). Transfers: a solar cell's nitride AR coating, the number of
// layer pairs a low-loss mirror needs.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { sf } from './_op.js';
import { seg, arc, word, pic, hatCurve, stackR } from './_op3.js';

const t = String.raw;
const qwR = (n0, n1, ns) => ((n0 * ns - n1 * n1) / (n0 * ns + n1 * n1)) ** 2;
const stackY = (nH, nL, ns, N) => (nH / nL) ** (2 * N) * ns;
const stackLayers = (nH, nL, N, lam) => Array.from({ length: 2 * N }, (_, k) => (k % 2 ? { n: nL, d: lam / (4 * nL) } : { n: nH, d: lam / (4 * nH) }));

// the worked example: a tantala/silica quarter-wave mirror for 1064 nm on fused silica
const EX = { lam: 1064, nH: 2.05, nL: 1.45, ns: 1.45, Ns: [5, 10, 15] };
EX.dH = EX.lam / (4 * EX.nH);
EX.dL = EX.lam / (4 * EX.nL);
EX.R = EX.Ns.map((N) => { const Y = stackY(EX.nH, EX.nL, EX.ns, N); return ((1 - Y) / (1 + Y)) ** 2; });
EX.Rm = EX.Ns.map((N) => stackR(1, stackLayers(EX.nH, EX.nL, N, EX.lam), EX.ns, EX.lam));
EX.Y15 = stackY(EX.nH, EX.nL, EX.ns, 15);
// R against wavelength for the three stacks, sampled for the picture
const LGRID = { x0: 750, h: 5, n: 141 };
const stackCurve = (N) => hatCurve(LGRID.x0, LGRID.h, Array.from({ length: LGRID.n }, (_, i) => stackR(1, stackLayers(EX.nH, EX.nL, N, EX.lam), EX.ns, LGRID.x0 + i * LGRID.h)));

/** A cross-section of a layer stack: N pairs of high (H) and low (L) index layers on a substrate. */
function stackPic(N, caption, single = false) {
  const shown = Math.min(N, 5), curves = [], h = 0.32;
  let y = 0;
  curves.push(seg([0, -0.9], [8, -0.9], 'ink3', { width: 36 }));      // substrate (a thick band)
  for (let k = 0; k < (single ? 1 : 2 * shown); k++) {
    curves.push(seg([0, y + h / 2 - 0.4], [8, y + h / 2 - 0.4], single || k % 2 ? 'violet' : 'teal', { width: 13 }));
    y += h;
  }
  return {
    type: 'graph', caption,
    params: pic([-1.6, 9.6], [-1.6, 3.6], {
      curves,
      points: [word(4, -1.0, 'substrate', 'ink'), ...(single ? [] : [word(9.0, -0.24, 'L', 'teal'), word(9.0, 0.08, 'H', 'violet')]), word(6.6, y + 0.1, single ? 'coating' : N > shown ? `… ${N} pairs in all` : `${N} pairs`, 'ink2'), word(-0.9, y + 0.5, 'air', 'ink3')],
      arrows: [{ from: [1.5, 3.4], to: [2.5, y - 0.4], color: 'gold', width: 2 }, { from: [2.5, y - 0.4], to: [3.5, 3.4], color: 'gold', width: 2 }],
    }),
  };
}

/** Newton's rings: a convex lens on a flat (side view, gap exaggerated) and the ring pattern from above. */
function newtonPic(caption) {
  const rings = [1, 2, 3, 4, 5, 6, 7].map((m) => arc([7.2, 0.9], 0.55 * Math.sqrt(m), m % 2 ? 'ink' : 'ink3', 0, 6.2832, { width: 2.2 }));
  return {
    type: 'graph', caption,
    params: pic([-0.4, 9.4], [-1.1, 2.6], {
      curves: [
        seg([0, 0], [4.4, 0], 'ink3', { width: 6 }),
        { param: ['2.2 + 4*sin(t)', '4.02 - 4*cos(t)'], t: [-0.55, 0.55], color: 'accent', width: 2.5 },
        seg([2.2 - 4 * Math.sin(0.55), 4.02 - 4 * Math.cos(0.55)], [2.2 - 4 * Math.sin(0.55), 2.0], 'accent', { width: 2.5 }),
        seg([2.2 + 4 * Math.sin(0.55), 4.02 - 4 * Math.cos(0.55)], [2.2 + 4 * Math.sin(0.55), 2.0], 'accent', { width: 2.5 }),
        seg([2.2 - 4 * Math.sin(0.55), 2.0], [2.2 + 4 * Math.sin(0.55), 2.0], 'accent', { width: 2.5 }),
        ...rings,
      ],
      points: [word(2.2, -0.45, 'optical flat', 'ink3'), word(2.2, 2.35, 'lens', 'accent'), word(7.2, -0.85, 'from above', 'ink3'), { x: 7.2, y: 0.9, r: 4, color: 'void' }],
    }),
  };
}

export default lesson({
  id: 'phys4650.O7.3',
  title: 'Thin films',
  minutes: 17, difficulty: 3,
  equation: t`\Delta = 2n_f d\cos\theta_t`,
  intro: t`Light reflected from the top and the bottom of a film of index $n_f$ and thickness $d$ splits one wavefront’s **amplitude** into two beams, which recombine with an optical path difference $\Delta$. Add $\pi$ for each reflection off a higher index, and the film reflects strongly where the total phase is a whole number of cycles and weakly where it is a half. Two families of fringes follow: in a **uniform** plate, $\Delta$ depends only on the angle — rings of **equal inclination**; in a **wedge**, it depends on the local thickness — fringes of **equal thickness**, one per $\lambda/(2n_f)$ of height. Stack many layers a quarter-wave thick and the reflections all add in phase: a mirror made of glass.`,
  symbols: [
    { tex: '\\Delta', text: 'the optical path difference between the two reflected beams (before any reflection flips)' },
    { tex: 'n_f', text: 'the refractive index of the film' },
    { tex: 'd', text: 'the film’s thickness' },
    { tex: '\\theta_t', text: 'the angle of the light inside the film, from the normal (0 at normal incidence)' },
  ],
  why: t`Every coated lens, laser mirror, telescope filter and solar panel is a stack of thin films; LIGO’s test masses reflect all but a few millionths of the light with nothing but layers of glassy oxides.`,
  visual: {
    type: 'optics-waves',
    title: 'One film, many colours',
    lead: t`Two reflections from a thin film: their phase flips, the reflected spectrum, and the colour it makes in white light. Below, Newton’s colour scale: the colour against thickness.`,
    tasks: [
      t`Thin the soap film toward zero: it turns black — both beams nearly in step in path, but one is flipped by $\pi$.`,
      t`Put the film on glass (index below 1.52) with $n = 1.38$ and $d \approx 100$ nm: a magnesium fluoride anti-reflection coating, with its faint purple residue.`,
      t`Tilt the view: $\cos\theta_t$ shrinks the path difference and the colours slide toward blue.`,
    ],
    params: { mode: 'film', t: 300, nFilm: 1.33, nSub: 1 },
    caption: t`One uniform, non-absorbing layer; the reflectance includes every internal bounce (Fresnel coefficients). The colour is computed for a white source and an sRGB screen, so it is approximate.`,
  },
  example: {
    prompt: t`**A mirror made of glass.** A laser mirror for $1064$ nm is built from alternating quarter-wave layers of tantala ($n_H = ${EX.nH}$) and silica ($n_L = ${EX.nL}$) on a fused-silica substrate ($n_s = ${EX.ns}$), with a high-index layer facing the air. How thick is each layer, and what is the reflectance with 5, 10 and 15 pairs?`,
    visual: {
      type: 'graph',
      caption: t`Reflectance against wavelength for 5, 10 and 15 pairs, computed with characteristic matrices (lossless layers, indices taken constant — real ones vary slightly with wavelength).`,
      params: { x: [750, 1450], y: [0, 1.08], aspect: 'wide', xlabel: 'wavelength (nm)', ylabel: 'R', xticks: 5, yticks: 4,
        curves: [{ fn: stackCurve(5), color: 'teal', width: 1.8 }, { fn: stackCurve(10), color: 'accent', width: 1.8 }, { fn: stackCurve(15), color: 'gold', width: 2.4 }],
        vlines: [{ x: 1064, color: 'ink3' }],
        legend: [{ label: '5 pairs', color: 'teal' }, { label: '10 pairs', color: 'accent' }, { label: '15 pairs', color: 'gold' }], legendAt: 'tr' },
    },
    steps: [
      { label: 'Layer thicknesses', text: t`A quarter wave in each material: $d_H = \lambda_0/(4n_H) = ${sf(EX.dH, 4)}$ nm and $d_L = \lambda_0/(4n_L) = ${sf(EX.dL, 4)}$ nm.` },
      { label: 'Why they add', text: t`Every interface reflects, alternately from low to high index (flip $\pi$) and high to low (no flip), and each layer adds a half-cycle round trip. So every reflected beam returns in phase with the first: they all build up.` },
      { label: 'Admittance', text: t`A quarter-wave layer of index $n$ turns the effective index $Y$ beneath it into $n^2/Y$. Working up from the substrate, each pair multiplies $Y$ by $(n_H/n_L)^2 = ${sf((EX.nH / EX.nL) ** 2, 4)}$: $Y = (n_H/n_L)^{2N}n_s$.` },
      { label: 'Reflectance', text: t`$R = \left(\dfrac{1 - Y}{1 + Y}\right)^2$: $${sf(EX.R[0], 4)}$ for 5 pairs, $${sf(EX.R[1], 5)}$ for 10 and $${sf(EX.R[2], 6)}$ for 15 (a matrix calculation agrees: $${sf(EX.Rm[2], 6)}$).` },
      { label: 'Sense check', text: t`For large $Y$ the transmission is $1 - R \approx 4/Y = ${sf((4 / EX.Y15) * 1e6, 2)}$ ppm with 15 pairs, and each extra pair divides it by $${sf((EX.nH / EX.nL) ** 2, 3)}$. The high band is only a few hundred nanometres wide: outside it the stack is nearly transparent.` },
    ],
    answer: t`$d_H = ${sf(EX.dH, 4)}$ nm, $d_L = ${sf(EX.dL, 4)}$ nm; $R = ${sf(EX.R[0], 3)}$, $${sf(EX.R[1], 4)}$ and $${sf(EX.R[2], 5)}$ for 5, 10 and 15 pairs.`,
  },
  practice: [
    num({
      id: 'qw-R', difficulty: 2,
      gen(r) {
        const [ns, sub] = r.pick([[1.52, 'crown glass'], [1.77, 'sapphire'], [1.78, 'dense flint glass'], [2.42, 'diamond']]);
        const n1 = r.pick([1.38, 1.46]), R = qwR(1, n1, ns);
        return {
          prompt: t`A quarter-wave layer of index $${n1}$ coats ${sub} ($n_s = ${ns}$). What is the reflectance at the design wavelength, at normal incidence? Give it in percent.`,
          visual: { type: 'optics-waves', params: { mode: 'film', t: sf(550 / (4 * n1), 4), nFilm: n1, nSub: ns, design: 550, controls: false, readout: false, hide: ['spectrum'] }, caption: t`The coating’s two reflections (design wavelength 550 nm).` },
          answer: R * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: ((ns - 1) / (ns + 1)) ** 2 * 100, feedback: 'That is the bare surface. The coating’s two reflections cancel in part: the quarter-wave layer turns the substrate’s index into n₁²/nₛ.' }],
          hints: [t`A quarter-wave layer makes the substrate look like a medium of index $n_1^2/n_s$.`, t`$R = \left(\dfrac{n_0n_s - n_1^2}{n_0n_s + n_1^2}\right)^2$.`],
          teach: t`A single quarter-wave layer reflects $\bigl((n_0n_s - n_1^2)/(n_0n_s + n_1^2)\bigr)^2$: zero when $n_1 = \sqrt{n_0n_s}$.`,
          explain: t`$R = \left(\dfrac{${ns} - ${n1}^2}{${ns} + ${n1}^2}\right)^2 = ${sf(R * 100, 3)}\%$, against $${sf(((ns - 1) / (ns + 1)) ** 2 * 100, 3)}\%$ bare. The perfect index would be $\sqrt{${ns}} = ${sf(Math.sqrt(ns), 3)}$.`,
        };
      },
    }),
    num({
      id: 'newton', difficulty: 2,
      gen(r) {
        const R = r.pick([0.5, 1, 2, 5]), m = r.pick([5, 10, 20]);
        const rm = Math.sqrt(m * 589e-9 * R) * 1e3;
        return {
          prompt: t`A plano-convex lens with a $${R}$ m radius of curvature rests on an optical flat, lit from above by $589$ nm sodium light. The centre of the reflected pattern is dark (count it as ring 0). What is the radius of dark ring number ${m}?`,
          visual: newtonPic(t`Newton’s rings: the air gap under the lens (side view, gap hugely exaggerated) and the rings seen from above.`),
          answer: rm, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: rm * Math.SQRT2, feedback: t`The light crosses the gap twice: dark rings sit where $2t = m\lambda$, and the gap is $t \approx r^2/(2R)$.` }, { value: rm / Math.SQRT2, feedback: t`Check the gap: a sphere of radius $R$ rises $t \approx r^2/(2R)$ above the flat at radius $r$, and $2t = m\lambda$.` }],
          hints: [t`At radius $r$ the air gap is $t \approx r^2/(2R)$.`, t`Reflection off the flat flips one beam, so dark rings sit at $2t = m\lambda$: $r_m = \sqrt{m\lambda R}$.`],
          teach: t`Newton’s rings are fringes of equal thickness: dark at $r_m = \sqrt{m\lambda R}$, crowding outward as $\sqrt m$.`,
          explain: t`$r_{${m}} = \sqrt{${m}(589\times10^{-9}\ \text{m})(${R}\ \text{m})} = ${sf(rm, 3)}$ mm. Opticians read a lens’s curvature — and its flaws — from these rings.`,
        };
      },
    }),
    num({
      id: 'step-height', difficulty: 2,
      gen(r) {
        const f = r.pick([0.2, 0.3, 0.4, 0.6]), lam = r.pick([546, 633]);
        const hgt = (f * lam) / 2;
        return {
          prompt: t`An optical flat laid at a slight tilt on a coated wafer shows straight fringes of equal thickness in $${lam}$ nm light. Where the fringes cross the edge of the coating they jump sideways by $${f}$ of the spacing between fringes. How thick is the coating?`,
          visual: {
            type: 'graph', caption: t`Fringes of equal thickness across the coating’s edge (dashed); the jump is drawn to scale for this problem.`,
            params: pic([0, 10], [0, 4], { curves: [
              ...[0, 1, 2, 3, 4].map((k) => seg([0.8 + 2 * k, 0.2], [0.8 + 2 * k, 2], 'gold', { width: 4 })),
              ...[0, 1, 2, 3, 4].map((k) => seg([0.8 + 2 * k + 2 * f, 2], [0.8 + 2 * k + 2 * f, 3.8], 'gold', { width: 4 })),
              seg([0, 2], [10, 2], 'ink3', { dash: [5, 5] }),
            ], points: [word(9.3, 1.75, 'bare', 'ink3'), word(9.3, 2.25, 'coated', 'ink3')] }),
          },
          answer: hgt, units: 'nm', tol: { rel: 0.01 },
          errors: [{ value: f * lam, feedback: 'The light crosses the air gap twice: one whole fringe is λ/2 of height.' }],
          hints: [t`Neighbouring fringes of equal thickness differ by $\lambda/2$ in air-gap height.`, t`A jump of a fraction $f$ of a fringe is a height of $f\lambda/2$.`],
          teach: t`Fringes of equal thickness are a contour map: one fringe per $\lambda/2$ of air gap.`,
          explain: t`$${f}\times ${lam}\ \text{nm}/2 = ${sf(hgt, 3)}$ nm. Interference microscopes measure steps and surface roughness this way, to a nanometre.`,
        };
      },
    }),
    num({
      id: 'stack-R', difficulty: 3,
      gen(r) {
        const [nH, nL, nm] = r.pick([[2.35, 1.46, 'titania and silica'], [2.05, 1.46, 'tantala and silica'], [2.35, 1.38, 'zinc sulfide and magnesium fluoride']]);
        const N = r.pick([4, 6, 8]), ns = 1.52;
        const Y = stackY(nH, nL, ns, N), R = ((1 - Y) / (1 + Y)) ** 2;
        return {
          prompt: t`A quarter-wave stack of ${nm} ($n_H = ${nH}$, $n_L = ${nL}$), ${N} pairs with a high-index layer facing the air, coats glass ($n_s = ${ns}$). What fraction of the light does it transmit at the design wavelength (ignoring absorption)? Give it in percent.`,
          visual: stackPic(N, t`The stack in cross-section: alternating high- (H) and low-index (L) quarter-wave layers. Thicknesses not to scale.`),
          answer: (1 - R) * 100, units: '%', tol: { rel: 0.01 },
          errors: [{ value: (1 - ((1 - (nH / nL) ** N * ns) / (1 + (nH / nL) ** N * ns)) ** 2) * 100, feedback: t`Each pair multiplies the admittance by $(n_H/n_L)^2$ — squared, because each of the two layers inverts it.` }],
          hints: [t`Each quarter-wave layer turns the admittance $Y$ below it into $n^2/Y$; start from $Y = n_s$.`, t`After $N$ pairs, $Y = (n_H/n_L)^{2N}n_s$; then $R = \bigl((1 - Y)/(1 + Y)\bigr)^2$.`],
          teach: t`A quarter-wave stack’s admittance grows by $(n_H/n_L)^2$ per pair, so its transmission falls geometrically.`,
          explain: t`$Y = (${nH}/${nL})^{${2 * N}}\times ${ns} = ${sf(Y, 4)}$, so $R = \bigl((1 - Y)/(1 + Y)\bigr)^2 = ${sf(R * 100, 5)}\%$ and $T = 1 - R = ${sf((1 - R) * 100, 3)}\%$. A larger index contrast needs fewer pairs.`,
        };
      },
    }),
    mcq({
      id: 'absentee', difficulty: 2,
      prompt: t`A layer of magnesium fluoride exactly half a wave thick (optically, $n_f d = \lambda_0/2$) is deposited on glass. At that wavelength, how does the coated glass reflect compared with bare glass?`,
      visual: { type: 'optics-waves', params: { mode: 'film', t: sf(550 / (2 * 1.38), 4), nFilm: 1.38, nSub: 1.52, design: 550, controls: false, readout: false, hide: ['spectrum'] }, caption: t`A half-wave layer on glass (design wavelength 550 nm).` },
      choices: ['Exactly the same: a half-wave layer is “absent” at its design wavelength.', 'Not at all: the two reflections cancel.', 'More strongly than bare glass, as a quarter-wave layer of high index would.', 'Twice as strongly: there are now two reflecting surfaces.'],
      answer: 0,
      why: { 1: 'Cancellation needs a quarter-wave layer (a half-cycle round trip). A half-wave layer adds a whole cycle: the beams add as if the layer were not there.', 2: 'That is what a quarter-wave layer of index above the substrate does; a half-wave layer of any index does nothing at its design wavelength.', 3: 'The reflections are amplitudes with phases; at a whole-cycle round trip they reproduce the bare surface exactly.' },
      hints: ['A half-wave layer’s round trip is one whole wavelength of phase.', 'With a whole cycle of round trip, the layer’s characteristic matrix is minus the identity.'],
      teach: 'A half-wave layer is an absentee: at its design wavelength the surface reflects as if it were bare.',
      explain: t`The round trip through the layer is a full cycle, so its characteristic matrix is $-I$ and the reflectance is the bare glass’s, $${sf(((1.52 - 1) / 2.52) ** 2 * 100, 2)}\%$. Absentee layers still matter away from the design wavelength — designers use them to flatten a coating’s spectrum.`,
    }),
    mcq({
      id: 'haidinger', difficulty: 2,
      prompt: t`You look into a perfectly flat, uniform glass plate lit by a broad sodium lamp, with your eye focused at infinity. What fringes do you see?`,
      visual: { type: 'optics-waves', params: { mode: 'michelson', d0: 400, lambda: 589, controls: false, readout: false, hide: [] }, caption: t`A Michelson’s ring pattern — the same kind of fringe, from the same kind of path difference, $2d\cos\theta$.` },
      choices: ['Concentric rings, each a single angle of view: fringes of equal inclination.', 'Straight, parallel fringes across the plate: fringes of equal thickness.', 'No fringes: a uniform plate has the same thickness everywhere.', 'Random speckle, because the lamp is broad.'],
      answer: 0,
      why: { 1: 'Equal-thickness fringes need a thickness that varies — a wedge. Here d is fixed and only the angle varies.', 2: 'The thickness is uniform, but the path difference 2n d cos θₜ still varies with the angle of view.', 3: 'Speckle comes from rough surfaces in laser light; a broad lamp is what makes the rings visible over a wide field.' },
      hints: ['In a uniform plate, Δ = 2n d cos θₜ depends only on the angle.', 'All light leaving at one angle focuses to one circle in your eye.'],
      teach: 'A uniform plate gives rings of equal inclination, seen at infinity; a wedge gives fringes of equal thickness, seen at the film.',
      explain: t`Every ray leaving at angle $\theta$ has the same $\Delta = 2n d\cos\theta_t$, and a lens (your eye, focused at infinity) collects each angle into one circle: Haidinger’s rings. They are the same fringes a Michelson shows.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-solar', difficulty: 2, transfer: true,
      gen(r) {
        const nSi = 3.9, nc = r.pick([1.9, 2.0, 2.1]), lam = r.pick([550, 600, 650]);
        const R = qwR(1, nc, nSi), d = lam / (4 * nc);
        return {
          prompt: t`A satellite’s silicon solar cells ($n \approx ${nSi}$ near ${lam} nm) carry a quarter-wave silicon nitride coating ($n = ${nc}$) designed for $${lam}$ nm. What fraction of that light does the coated cell still reflect, in percent? (Bare silicon reflects about $${sf(((nSi - 1) / (nSi + 1)) ** 2 * 100, 2)}\%$.)`,
          visual: stackPic(1, t`A single coating layer on the cell. Not to scale.`, true),
          answer: R * 100, units: '%', tol: { rel: 0.02 },
          errors: [{ value: ((nSi - 1) / (nSi + 1)) ** 2 * 100, feedback: 'That is bare silicon; the coating’s two reflections nearly cancel.' }, { value: ((nc - 1) / (nc + 1)) ** 2 * 100, feedback: 'That is only the top surface; the reflection from the silicon below interferes with it.' }],
          hints: [t`$R = \bigl((n_0n_s - n_1^2)/(n_0n_s + n_1^2)\bigr)^2$ at the design wavelength.`, t`Here $n_0 = 1$, $n_s = ${nSi}$, $n_1 = ${nc}$: compare $n_1^2$ with $n_s$.`],
          teach: t`A quarter-wave layer of index near $\sqrt{n_s}$ all but removes a surface’s reflection at its design wavelength.`,
          explain: t`$R = \bigl((${nSi} - ${sf(nc * nc, 3)})/(${nSi} + ${sf(nc * nc, 3)})\bigr)^2 = ${sf(R * 100, 2)}\%$ — the layer is $${sf(d, 3)}$ nm thick. Away from $${lam}$ nm the reflection rises again; cells are also textured to trap what is left.`,
        };
      },
    }),
    num({
      id: 'cp-pairs', difficulty: 3, transfer: true,
      gen(r) {
        const ppm = r.pick([1000, 100, 10]), nH = 2.05, nL = 1.45, ns = 1.45;
        let N = 1;
        while (1 - ((1 - stackY(nH, nL, ns, N)) / (1 + stackY(nH, nL, ns, N))) ** 2 >= ppm * 1e-6) N++;
        return {
          prompt: t`A gravitational-wave detector’s end mirror must transmit less than $${ppm}$ ppm of $1064$ nm light. With quarter-wave tantala/silica pairs ($n_H = ${nH}$, $n_L = ${nL}$) on fused silica ($n_s = ${ns}$), high index facing the light, and ignoring absorption, how many pairs are needed at least?`,
          visual: stackPic(N, t`A quarter-wave stack in cross-section. Thicknesses not to scale; the number of pairs is the question.`),
          answer: N, tol: { rel: 0, abs: 0.5 },
          errors: [{ value: N - 1, feedback: `With ${N - 1} pairs the transmission is still ${sf((4 * stackY(nH, nL, ns, N - 1)) / (1 + stackY(nH, nL, ns, N - 1)) ** 2 * 1e6, 3)} ppm, above the limit.` }],
          hints: [t`$T = 1 - R \approx 4/Y$ with $Y = (n_H/n_L)^{2N}n_s$ (in air).`, t`Solve $4/\bigl((n_H/n_L)^{2N}n_s\bigr) < ${ppm}\times10^{-6}$ for $N$ and round up.`],
          teach: t`Each pair cuts a quarter-wave mirror’s transmission by $(n_H/n_L)^2$: the layer count grows only logarithmically with the required quality.`,
          explain: t`$T \approx 4/Y$ with $Y = (${sf(nH / nL, 4)})^{2N}\times ${ns}$: $N = ${N}$ pairs give $T = ${sf((4 * stackY(nH, nL, ns, N)) / (1 + stackY(nH, nL, ns, N)) ** 2 * 1e6, 3)}$ ppm. Real mirrors also lose a little to absorption and scatter, which sets the true floor.`,
        };
      },
    }),
    mcq({
      id: 'cp-tilt', difficulty: 2,
      prompt: t`A camera lens’s anti-reflection coating shows a faint magenta reflection when viewed face on. Viewed at a steep angle, which way does the colour of its residual reflection move?`,
      visual: { type: 'optics-waves', params: { mode: 'film', t: 100, nFilm: 1.38, nSub: 1.52, controls: false, readout: false, hide: ['spectrum'] }, caption: t`A single magnesium fluoride coating on glass, seen face on.` },
      choices: ['Toward shorter wavelengths: the path difference 2n d cos θₜ shrinks, so every feature moves bluer.', 'Toward longer wavelengths: the light crosses the film on a longer, slanted path.', 'It does not change: the thickness is the same at any angle.', 'It turns white, because the reflections stop interfering at large angles.'],
      answer: 0,
      why: { 1: 'The slanted path inside is longer, but the second beam also starts further along the surface; the net optical path difference is 2n d cos θₜ, which falls.', 2: 'The path difference depends on the angle through cos θₜ.', 3: 'The film is still thin compared with the light’s coherence length; the fringes persist, shifted.' },
      hints: ['Write the path difference at an angle.', t`$\Delta = 2n_f d\cos\theta_t$: what does tilting do to $\cos\theta_t$?`],
      teach: 'Tilting a film shortens its optical path difference by cos θₜ, so its spectral features slide toward the blue.',
      explain: t`The design wavelength scales with $\cos\theta_t$, so the reflectance minimum moves to shorter wavelengths, and the residual colour shifts from magenta toward green and blue. The same shift makes interference filters for telescopes tunable by tilting them.`,
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §9.4–9.5 (fringes of equal inclination and thickness, Newton’s rings) and §9.7 (single and multilayer films)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
  ],
});
