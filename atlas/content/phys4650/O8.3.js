// Fresnel diffraction (Hecht §10.3). The near field, where the Fresnel number
// N_F = a²/(λL) is about 1 or more: half-period zones of radii √(mλL), the
// on-axis irradiance behind a round hole 4I₀ sin²(πN_F/2) (four times the
// unobstructed light with one zone open, darkness with two), Arago/Poisson's
// bright spot behind a disc, zone plates (focus ρ₁²/λ; outer-zone width Δr
// gives f = 4NΔr²/λ), and the straight edge on the Cornu spiral (¼ of I₀ at
// the shadow's edge, a first fringe of 1.37 I₀ at v = 1.217, v = y√(2/(λL))).
// Uses the new op3-fresnel sim (zones with the vibration curve; Cornu spiral
// with the pattern). Transfers: a proposed exoplanet starshade's Fresnel
// number, an X-ray zone plate's focal length, the fringes a lunar occultation
// sweeps across the Earth.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { sf } from './_op.js';

const t = String.raw;
const V1 = 1.2172;             // the edge's first maximum, in units of v (model/op3-fresnel.js: edgeFirstMax)
const holeI = (NF) => 4 * Math.sin((Math.PI * NF) / 2) ** 2;

// the worked example: a 1.0 mm radius hole in 633 nm light
const EX = { a: 1e-3, lam: 633e-9 };
EX.L1 = EX.a ** 2 / EX.lam;
EX.L2 = EX.L1 / 2;
EX.L3 = EX.L1 / 3;

/** An op3-fresnel picture. */
const fz = (params, caption) => ({ type: 'op3-fresnel', params: { controls: false, readout: false, ...params }, caption });

export default lesson({
  id: 'phys4650.O8.3',
  title: 'Fresnel diffraction',
  minutes: 17, difficulty: 3,
  equation: t`I_{\text{axis}} = 4I_0\sin^2\!\left(\frac{\pi a^2}{2\lambda L}\right)`,
  intro: t`Close to an aperture — when the **Fresnel number** $N_F = a^2/(\lambda L)$ is about 1 or more — the far-field shortcut fails, and the pattern still looks like the aperture, fringed. Fresnel’s trick is to divide the wavefront into **half-period zones**: rings, seen from a point on the axis, whose distances differ by $\lambda/2$, with radii $\rho_m = \sqrt{m\lambda L}$. Neighbouring zones nearly cancel, so a round hole holding $N_F$ zones gives on its axis the irradiance above — four times the unobstructed light when it holds one zone, darkness when it holds two. Block every other zone and the rest add: a **zone plate**, a lens made of rings. Behind an opaque disc, the zones outside it add to a **bright spot** on the axis.`,
  symbols: [
    { tex: 'I_{\\text{axis}}', text: 'the irradiance on the axis behind a round hole' },
    { tex: 'I_0', text: 'the irradiance with no screen at all' },
    { tex: 'a', text: 'the hole’s radius' },
    { tex: '\\lambda', text: 'the wavelength (a plane wave arrives)' },
    { tex: 'L', text: 'the distance from the hole to the point on the axis' },
  ],
  why: t`Near-field diffraction decides how a starshade can hide a star to reveal its planets, how X-ray zone plates focus, and what fringes a star makes as the Moon’s edge slides across it.`,
  visual: {
    type: 'op3-fresnel',
    title: 'Fresnel’s zones',
    lead: t`A plane wave meets a round hole. Seen from a point on the axis a distance $L$ behind it, the opening divides into half-period zones; their contributions, laid head to tail, run round a circle. The resultant arrow is the field on the axis.`,
    tasks: [
      t`Move the screen until exactly one zone fills the hole ($N_F = 1$): the arrow spans the circle’s diameter — twice the unobstructed field, four times the irradiance.`,
      t`Halve $L$ so two zones fit: the arrow closes back to zero and the axis goes dark.`,
      t`Switch to a disc: whatever its size, the arrow from the rim to the centre has length 1 — the Arago spot is as bright as no disc at all.`,
    ],
    params: { mode: 'zones', a: 1, L: 2.5, lambda: 633 },
  },
  example: {
    prompt: t`A plane wave of $633$ nm light falls on a round hole of radius $a = 1.0$ mm. Where on the axis behind it is the light brightest, and where does it vanish? What happens further away?`,
    visual: fz({ mode: 'zones', a: 1, L: sf(EX.L1, 3), lambda: 633, panels: ['face', 'phasor'] }, t`The hole seen from the axis $${sf(EX.L1, 3)}$ m behind it: one zone fills it, and its contributions run halfway round the circle.`),
    steps: [
      { label: 'Zones', text: t`From a point at distance $L$, the hole holds $N_F = a^2/(\lambda L)$ zones, and $I = 4I_0\sin^2(\pi N_F/2)$.` },
      { label: 'Brightest', text: t`One zone exactly: $L = a^2/\lambda = (10^{-3})^2/(633\times10^{-9}) = ${sf(EX.L1, 3)}$ m. Every part of the zone arrives within half a cycle of the rest, and $I = 4I_0$. Three zones, at $L = ${sf(EX.L3, 3)}$ m, give $4I_0$ again.` },
      { label: 'Dark', text: t`Two zones at $L = ${sf(EX.L2, 3)}$ m: the second cancels the first and the axis is dark — with light all around it in rings.` },
      { label: 'Far away', text: t`Beyond $${sf(EX.L1, 3)}$ m less than one zone fits; $I \approx \pi^2N_F^2I_0$ falls as $1/L^2$ — the Fraunhofer far field, where the light spreads into an Airy pattern (O8.1).` },
      { label: 'Sense check', text: t`Brighter than no screen? Energy is conserved: the hole funnels light toward the axis and away from rings around it. Averaged over the screen, the light is just what passes the hole.` },
    ],
    answer: t`Brightest ($4I_0$) at $L = ${sf(EX.L1, 3)}$ m and $${sf(EX.L3, 3)}$ m; dark at $${sf(EX.L2, 3)}$ m; beyond $${sf(EX.L1, 3)}$ m it fades smoothly into the far field.`,
  },
  practice: [
    num({
      id: 'zone-radius', difficulty: 1,
      gen(r) {
        const m = r.pick([1, 4, 9, 10]), L = r.pick([0.5, 1, 2]), lam = r.pick([500, 633]);
        const rho = Math.sqrt(m * lam * 1e-9 * L) * 1e3;
        return {
          prompt: t`A plane wave of $${lam}$ nm light. Seen from a point on the axis $${L}$ m behind a screen, what is the outer radius of the ${m === 1 ? 'first' : `${m}th`} half-period zone, in millimetres?`,
          visual: fz({ mode: 'zones', a: sf(Math.max(0.2, rho * 1.1), 3), L, lambda: lam, panels: ['face'], labels: false }, t`The zones from this point, coloured alternately (the opening is drawn a little larger than the zone asked about).`),
          answer: rho, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((m * lam * 1e-9 * L) / 2) * 1e3, feedback: t`Each zone adds half a wavelength to the distance: $\sqrt{L^2 + \rho^2} - L = m\lambda/2$ gives $\rho^2 \approx m\lambda L$.` }],
          hints: [t`The $m$-th zone’s rim is $m\lambda/2$ further from the point than the centre is.`, t`$\sqrt{L^2 + \rho_m^2} - L \approx \rho_m^2/(2L) = m\lambda/2$, so $\rho_m = \sqrt{m\lambda L}$.`],
          teach: t`Half-period zone radii grow as $\sqrt m$: $\rho_m = \sqrt{m\lambda L}$, so every zone has the same area, $\pi\lambda L$.`,
          explain: t`$\rho_{${m}} = \sqrt{${m}(${lam}\times10^{-9})(${L})}\ \text{m} = ${sf(rho, 3)}$ mm. Equal areas mean nearly equal contributions; their alternating phases do the rest.`,
        };
      },
    }),
    num({
      id: 'hole-axis', difficulty: 2,
      gen(r) {
        const a = r.pick([0.5, 0.8, 1, 1.5]), L = r.pick([0.6, 1, 1.5, 2.5]), lam = 633;
        const NF = (a * 1e-3) ** 2 / (lam * 1e-9 * L), I = holeI(NF);
        return {
          prompt: t`A plane wave of $633$ nm light meets a round hole of radius $${a}$ mm. What is the irradiance on the axis $${L}$ m behind it, in units of the unobstructed irradiance $I_0$?`,
          visual: fz({ mode: 'zones', a, L, lambda: lam, panels: ['face'] }, t`The hole and the zones it holds, seen from that point.`),
          answer: I, tol: { rel: 0.01, abs: 0.01 },
          errors: [{ value: 4 * Math.sin(Math.PI * NF) ** 2, feedback: t`The phase across the hole’s rim is $\pi N_F$; the argument of the sine is half of it, $\pi N_F/2$.` }].filter((e) => Math.abs(e.value - I) > 0.05 + 0.02 * I),
          hints: [t`First the Fresnel number: $N_F = a^2/(\lambda L)$.`, t`Then $I = 4I_0\sin^2(\pi N_F/2)$.`],
          teach: t`On the axis behind a round hole, $I = 4I_0\sin^2(\pi N_F/2)$: it swings between $0$ and $4I_0$ as $L$ changes.`,
          explain: t`$N_F = (${a}\times10^{-3})^2/((633\times10^{-9})(${L})) = ${sf(NF, 3)}$, so $I = 4\sin^2(${sf((Math.PI * NF) / 2, 3)}\ \text{rad})\,I_0 = ${sf(I, 3)}\,I_0$.`,
        };
      },
    }),
    mcq({
      id: 'arago', difficulty: 2,
      prompt: t`In 1818 Poisson argued that Fresnel’s wave theory must be wrong, because it predicted something absurd in the shadow of a small opaque disc. Arago looked, and found it. What is at the centre of the shadow?`,
      visual: fz({ mode: 'zones', obstacle: 'disc', a: 1, L: 0.8, lambda: 633, panels: ['face'] }, t`An opaque disc and the zones around it, seen from the centre of its shadow.`),
      choices: ['A bright spot, as bright as if the disc were not there.', 'Perfect darkness: the disc blocks the direct light.', 'A dim spot, a quarter as bright as with no disc.', 'A bright spot, but only when the disc covers an odd number of zones.'],
      answer: 0,
      why: { 1: 'Light from the zones around the rim reaches the axis, and on the axis those contributions are all equally far away: they add.', 2: 'One quarter belongs to the edge of a straight edge’s shadow, not to the axis behind a round disc.', 3: 'Behind a hole the number of zones matters; behind a disc the uncovered zones always sum to the same magnitude.' },
      hints: ['Every point on the disc’s rim is the same distance from a point on the axis.', 'On the vibration circle, the uncovered zones run from the rim’s point to the centre: what is that length?'],
      teach: 'Behind a round disc the zones outside it add on the axis to the full unobstructed field: Arago’s (or Poisson’s) spot.',
      explain: t`The uncovered zones run on the vibration circle from the disc’s rim to the centre, a chord of length 1 whatever the disc’s size: $I = I_0$ on the axis. Poisson’s “absurd” prediction became the proof of the wave theory. Real discs need smooth, round edges, and the spot is tiny.`,
    }),
    num({
      id: 'zone-plate', difficulty: 2,
      gen(r) {
        const rho1 = r.pick([0.2, 0.3, 0.5, 0.8]), lam = r.pick([532, 633]);
        const f = (rho1 * 1e-3) ** 2 / (lam * 1e-9);
        return {
          prompt: t`A zone plate is made by blackening alternate zones of a pattern whose first zone has radius $${rho1}$ mm. Where does it focus a plane wave of $${lam}$ nm light (its primary focus)?`,
          visual: fz({ mode: 'zones', a: sf(rho1 * 3.2, 3), L: sf(f, 3), lambda: lam, panels: ['face'] }, t`A zone pattern of this design; a zone plate blackens every other ring.`),
          answer: f, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: f / 2, feedback: t`From the focus, the first zone is half a wavelength further at its rim: $\rho_1^2/(2f) = \lambda/2$.` }],
          hints: [t`A zone plate focuses where its rings are exactly the half-period zones: $\rho_1 = \sqrt{\lambda f}$.`, t`$f = \rho_1^2/\lambda$.`],
          teach: t`A zone plate focuses at $f = \rho_1^2/\lambda$ — and also at $f/3, f/5, \dots$, where each ring holds 3, 5, … zones.`,
          explain: t`$f = (${rho1}\times10^{-3})^2/(${lam}\times10^{-9})\ \text{m} = ${sf(f, 3)}$ m. Its focal length goes as $1/\lambda$: violently chromatic, which matters little for X-rays from a narrow line.`,
        };
      },
    }),
    mcq({
      id: 'edge-quarter', difficulty: 2,
      prompt: t`Light from a distant point source passes a straight, opaque edge. How bright is the screen exactly at the edge of the geometric shadow, compared with the unobstructed light?`,
      visual: fz({ mode: 'edge', kind: 'edge', y: 0, panels: ['cornu'] }, t`The Cornu spiral, with the part of the wavefront the edge leaves open, seen from the shadow’s edge (gold), and its chord.`),
      choices: ['A quarter as bright.', 'Half as bright: half the wavefront is blocked.', 'Fully bright: the edge of the shadow is the edge of the light.', 'Dark: the shadow begins there.'],
      answer: 0,
      why: { 1: 'Half the wavefront gives half the field — and irradiance goes as the field squared.', 2: 'The blocked half of the wavefront is missing, so the field there is halved.', 3: 'Light bends into the shadow: the irradiance fades over a few fringe widths, not at once.' },
      hints: ['At the shadow’s edge the edge removes exactly half the wavefront.', 'Half the field means a quarter of the irradiance.'],
      teach: 'At the edge of a geometric shadow the field is halved and the irradiance is a quarter of the unobstructed value.',
      explain: t`On the spiral the open half runs from the centre $(0, 0)$ to the eye at $(\tfrac12, \tfrac12)$: half the full chord, so $I = \tfrac14 I_0$. Outside the shadow the light overshoots in fringes, the first at $1.37I_0$; inside it fades smoothly.`,
    }),
    num({
      id: 'edge-fringe', difficulty: 3,
      gen(r) {
        const L = r.pick([0.5, 1, 2, 4]), lam = r.pick([532, 633]);
        const y = V1 * Math.sqrt((lam * 1e-9 * L) / 2) * 1e3;
        return {
          prompt: t`A $${lam}$ nm laser beam, expanded to a plane wave, grazes a razor blade. The brightest fringe outside the shadow is at $v = 1.217$ on the Cornu spiral, where $v = y\sqrt{2/(\lambda L)}$. How far from the edge of the geometric shadow is it on a screen $${L}$ m away, in millimetres?`,
          visual: fz({ mode: 'edge', kind: 'edge', L, lambda: lam, y: 0, panels: ['cornu'] }, t`The Cornu spiral seen from the shadow’s edge; moving out into the light slides the gold stretch’s start along the spiral.`),
          answer: y, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: V1 * Math.sqrt(lam * 1e-9 * L) * 1e3, feedback: t`Invert $v = y\sqrt{2/(\lambda L)}$: $y = v\sqrt{\lambda L/2}$.` }],
          hints: [t`$y = v\sqrt{\lambda L/2}$.`, t`$\sqrt{\lambda L/2} = \sqrt{(${lam}\times10^{-9})(${L})/2}$ m.`],
          teach: t`Fresnel fringes scale as $\sqrt{\lambda L}$: four times further, twice as wide.`,
          explain: t`$y = 1.217\sqrt{(${lam}\times10^{-9})(${L})/2}\ \text{m} = ${sf(y, 3)}$ mm. Not in proportion to $L$, as far-field fringes would be: near-field patterns grow as its square root.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-starshade', difficulty: 3, transfer: true,
      gen(r) {
        const D = r.pick([26, 52, 72]), L = r.pick([20000, 40000, 76000]), lam = r.pick([0.5, 1]);
        const NF = (D / 2) ** 2 / (lam * 1e-6 * L * 1e3);
        return {
          prompt: t`A proposed exoplanet **starshade** — an opaque screen $${D}$ m across — would fly $${L}$ km in front of a space telescope to block a star’s light. What is its Fresnel number at $${lam}\ \mu$m, seen from the telescope?`,
          visual: fz({ mode: 'zones', obstacle: 'disc', a: 1, L: 0.3, lambda: 633, panels: ['face', 'phasor'] }, t`A round disc in a plane wave: its uncovered zones still add to a bright Arago spot on the axis (illustrative scale).`),
          answer: NF, tol: { rel: 0.01 },
          errors: [{ value: NF * 4, feedback: 'Use the radius, half the diameter.' }],
          hints: [t`$N_F = a^2/(\lambda L)$ with $a$ the radius.`, t`$a = ${D / 2}$ m, $L = ${L}\times10^3$ m, $\lambda = ${lam}\times10^{-6}$ m.`],
          teach: t`A starshade works in the near field ($N_F \sim 10$): a plain disc would leave an Arago spot, so its edge is cut into petals that smear the zones out.`,
          explain: t`$N_F = (${D / 2})^2/((${lam}\times10^{-6})(${L}\times10^{3})) = ${sf(NF, 3)}$. With that many zones a round disc would still put an Arago spot as bright as the star on the telescope; the petal-shaped edge is designed so the light diffracted into the shadow cancels to about $10^{-10}$ of the star’s.`,
        };
      },
    }),
    num({
      id: 'cp-xray', difficulty: 3, transfer: true,
      gen(r) {
        const dr = r.pick([25, 30, 50]), N = r.pick([200, 500, 1000]), lam = r.pick([2.4, 1.0]);
        const f = (4 * N * (dr * 1e-9) ** 2) / (lam * 1e-9) * 1e3;
        return {
          prompt: t`An X-ray microscope focuses $${lam}$ nm X-rays with a zone plate of ${N} zones whose outermost zone is $\Delta r = ${dr}$ nm wide. For many zones, $\Delta r \approx \rho_N/(2N)$. What is its focal length, in millimetres?`,
          visual: fz({ mode: 'zones', a: 1, L: 0.2, lambda: 633, panels: ['face'] }, t`A zone pattern (illustrative scale, far fewer zones than the problem’s).`),
          answer: f, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: f / 4, feedback: t`With $\rho_N = 2N\Delta r$, $f = \rho_N^2/(N\lambda) = 4N\Delta r^2/\lambda$.` }],
          hints: [t`For the focus, $\rho_N^2 = N\lambda f$.`, t`Put $\rho_N = 2N\Delta r$: $f = 4N(\Delta r)^2/\lambda$.`],
          teach: t`A zone plate’s focal length is $4N(\Delta r)^2/\lambda$; its resolution is set by the outermost zone width, about $1.22\Delta r$.`,
          explain: t`$f = 4(${N})(${dr}\times10^{-9})^2/(${lam}\times10^{-9})\ \text{m} = ${sf(f, 3)}$ mm, and the plate is $2\rho_N = ${sf(4 * N * dr * 1e-3, 3)}\ \mu$m across. Lenses barely bend X-rays; rings of gold this fine are how X-ray microscopes reach tens of nanometres.`,
        };
      },
    }),
    num({
      id: 'cp-occultation', difficulty: 3, transfer: true,
      gen(r) {
        const lam = r.pick([450, 550, 700]), L = 3.844e8;
        const s = Math.sqrt((lam * 1e-9 * L) / 2), y = V1 * s;
        return {
          prompt: t`During a lunar occultation the Moon’s edge — a straight edge $384\,400$ km away — slides across a star. Its Fresnel pattern sweeps across the Earth. At $${lam}$ nm, how far from the edge of the geometric shadow is the first (brightest) fringe, in metres? ($v = 1.217$, with $v = y\sqrt{2/(\lambda L)}$.)`,
          visual: fz({ mode: 'edge', kind: 'edge', y: 1, panels: ['cornu', 'pattern'], hide: ['I', 'v'] }, t`A straight edge’s Fresnel pattern (laboratory scale; the Moon’s is the same shape, metres wide).`),
          answer: y, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: V1 * Math.sqrt(lam * 1e-9 * L), feedback: t`$y = v\sqrt{\lambda L/2}$: mind the 2.` }],
          hints: [t`The Moon’s edge is a straight edge and the star a plane wave: invert $v = y\sqrt{2/(\lambda L)}$.`, t`$y = v\sqrt{\lambda L/2}$ with $L = 3.844\times10^8$ m.`],
          teach: t`Fresnel fringes from the Moon’s edge are about ten metres wide on the ground — swept past a telescope in milliseconds, they reveal a star’s angular size.`,
          explain: t`$y = 1.217\sqrt{(${lam}\times10^{-9})(3.844\times10^{8})/2}\ \text{m} = ${sf(y, 3)}$ m. The shadow moves at up to about a kilometre per second, so the fringes flicker past in hundredths of a second; a star’s finite size smears them, which is how occultations measure stellar diameters of milliarcseconds.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'E. Hecht, Optics, 5th ed. (Pearson, 2017), §10.3 (Fresnel diffraction: zones, zone plates, the Cornu spiral, the straight edge)', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'M. Abramowitz and I. Stegun, Handbook of Mathematical Functions, §7.3 (Fresnel integrals), NIST DLMF §7.2', url: 'https://dlmf.nist.gov/7.2' },
  ],
});
