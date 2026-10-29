// The PHYS 4650 boss, "Einstein Ring Observatory": a galaxy halfway across the
// universe bends a background quasar's light into two images and a ring; you
// design the instrument that studies it. Round 1 (O3.2): Fermat's principle in
// weak gravity — images at stationary points of the arrival time, the Einstein
// radius of a point-mass lens with given angular-diameter distances, the image
// separation for a source offset u (θ_E√(u² + 4)). Round 2 (O8.1, O4.3, O4.1):
// the aperture that resolves detail a tenth of θ_E, the Cassegrain secondary
// magnification for Nyquist-sampled pixels, and a find-the-error: a Barlow
// lens's virtual object taken with the wrong sign. Round 3 (O7.2, O6.2): a
// Fabry–Pérot's spacing from its free spectral range, a polarized image
// through a quarter-wave plate and an analyser. Round 4 (O10.1, O3.2): the
// baseline where a ring's visibility first vanishes (J₀), the path matching a
// broad band demands, and the time delay between the images from the
// point-lens Fermat potential. The lens is a point mass and the numbers are
// illustrative — real lens galaxies are extended, which changes the details,
// not the physics.
import { boss, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { C, GM_SUN, ARCSEC, sf } from './_op.js';
import { seg, arc, word, pic } from './_op3.js';
import { bench, hubbleEls } from './_op2.js';

const t = String.raw;
const GPC = 3.0857e25;            // m
const DAY = 86400;
const MAS = ARCSEC / 1000;

/** θ_E (rad) of a point mass M (solar masses) with angular-diameter distances in Gpc. */
const thetaE = (M, DL, DS, DLS) => Math.sqrt(((4 * GM_SUN * M) / (C * C)) * (DLS / (DL * DS)) / GPC);
/** The lens system the boss uses: M (solar masses within the ring), distances (Gpc). */
const SYSTEMS = [
  { M: 2e11, DL: 1.2, DS: 1.7, DLS: 0.9, zl: 0.45 },
  { M: 5e11, DL: 1.3, DS: 1.8, DLS: 1.0, zl: 0.55 },
  { M: 1e12, DL: 1.1, DS: 1.6, DLS: 0.8, zl: 0.4 },
];
const lensPic = (beta, caption) => ({ type: 'gr-lensing', params: { beta, size: 0.12, system: 'galaxy' }, caption: caption || t`A point-mass lens, ray-traced in the weak-field approximation: drag the background source behind it to see two images merge into a ring. The simulation’s own lens has its own mass and distances; side-view angles are hugely exaggerated.` });

/** The sky round a point lens: the Einstein ring (dashed), the lens, the source's true position (hollow) and its two images, for offset u (schematic). */
function skyPic(u, caption) {
  const w = Math.sqrt(u * u + 4), p = (u + w) / 2, m = (u - w) / 2;
  return {
    type: 'graph', caption,
    params: pic([-2.2, 2.2], [-1.3, 1.3], {
      curves: [arc([0, 0], 1, u === 0 ? 'gold' : 'ink3', 0, 6.2832, u === 0 ? { width: 4 } : { dash: [5, 5], width: 1.4 })],
      points: [
        { x: 0, y: 0, r: 6, color: 'ink2', label: 'lens', labelAlign: 'center', labelDx: 0, labelDy: 18 },
        ...(u === 0 ? [] : [
          { x: sf(u, 4), y: 0, r: 4, color: 'gold', hollow: true },
          { x: sf(p, 4), y: 0, r: 6, color: 'gold', label: 'image', labelAlign: 'center', labelDx: 0, labelDy: -16 },
          { x: sf(m, 4), y: 0, r: 5, color: 'gold', label: 'image', labelAlign: 'center', labelDx: 0, labelDy: -16 },
        ]),
      ],
    }),
  };
}

/** Two telescopes a baseline apart, looking at a ring on the sky (schematic). */
const baselinePic = (caption) => ({
  type: 'graph', caption,
  params: pic([-5, 5], [-2.2, 2.6], {
    curves: [
      arc([0, 1.9], 0.5, 'gold', 0, 6.2832, { width: 3 }),
      arc([-3, -1.4], 0.55, 'accent', 3.1416, 6.2832, { width: 2.4 }), arc([3, -1.4], 0.55, 'accent', 3.1416, 6.2832, { width: 2.4 }),
      seg([0, 1.4], [-3, -1.2], 'ink3', { dash: [4, 4], width: 1 }), seg([0, 1.4], [3, -1.2], 'ink3', { dash: [4, 4], width: 1 }),
      seg([-3, -2.05], [3, -2.05], 'ink2', { width: 1.4 }),
    ],
    points: [word(1.3, 2.45, 'Einstein ring', 'gold'), word(0, -1.8, 'baseline B', 'ink2'), word(-3, -0.55, 'telescope 1', 'accent'), word(3, -0.55, 'telescope 2', 'accent')],
  }),
});

export default boss({
  title: 'Einstein Ring Observatory',
  intro: t`Halfway across the observable universe a massive galaxy sits almost exactly in front of a distant quasar, and its gravity bends the quasar’s light into two bright images and a faint **Einstein ring**. You are building the observatory that will study it: a Cassegrain telescope, its camera and filters, and a second telescope to join it as an interferometer. First you must understand the lens itself — with Fermat’s principle — then design the instrument, analyse the light, and finally time the flicker that passes from one image to the other. Four rounds, eleven problems, no hints, one try each. The lens is modelled as a single point mass and its numbers are illustrative.`,
  pass: 0.7,
  rounds: [
    {
      title: 'The lens in the sky',
      story: t`In weak gravity, light behaves as though space had a refractive index $n \approx 1 + 2GM/(rc^2)$ — a model of curved spacetime, not a real medium. Fermat’s principle does the rest: light from the quasar reaches you along every path whose travel time is stationary.`,
      items: [
        mcq({
          id: 'r1-fermat', skill: 'phys4650.O3.2', difficulty: 3,
          prompt: t`A quasar sits a little to one side of the line through a lensing galaxy. Using the effective index $n \approx 1 + 2GM/(rc^2)$ and Fermat’s principle, where do its images appear?`,
          visual: lensPic(0.4),
          choices: [
            'In every direction where the light’s total travel time is stationary — one image on each side of the lens, at a minimum and a saddle of the arrival time.',
            'Only along the path of least geometric length, so there is a single image, displaced toward the lens.',
            'Directly behind the lens, where the index is greatest.',
            'Only where the index is smallest, far from the lens, so the images are pushed outward without bending.',
          ],
          answer: 0,
          why: { 1: 'Fermat’s principle is about optical path — time — not geometric length, and it asks only for stationary paths, of which there can be several.', 2: 'The index is greatest near the mass, but light does not simply go where the index is high; it goes where the travel time is stationary.', 3: 'Paths far from the mass are fast but long; the stationary paths balance the extra geometric length against the delay near the mass.' },
          hints: ['Fermat: light takes paths whose travel time does not change to first order when the path is varied.', 'A path bending round one side of the mass and a path round the other side can both be stationary.', 'The image on the far side of the source lies at a saddle of the arrival time; the near one at a minimum.'],
          teach: 'Lensed images sit at stationary points of the light-travel time — Fermat’s principle in curved spacetime.',
          explain: t`The arrival time is the geometric delay (longer for a bent path) plus the gravitational delay (larger close to the mass, where $n > 1$). Its stationary points are the images: for a point lens, a minimum outside the Einstein ring on the source’s side and a saddle inside it on the other side. Perfect alignment turns the saddle and minimum into a whole ring of stationary paths.`,
        }),
        num({
          id: 'r1-thetaE', skill: 'phys4650.O3.2', difficulty: 3,
          gen(r) {
            const s = r.pick(SYSTEMS), th = thetaE(s.M, s.DL, s.DS, s.DLS) / ARCSEC;
            return {
              prompt: t`Integrating the index gradient gives a bending of $4GM/(c^2b)$, and with the geometry of source, lens and observer this makes a ring of angular radius $\theta_E = \sqrt{\dfrac{4GM}{c^2}\dfrac{D_{LS}}{D_LD_S}}$. The galaxy holds $M = ${tex(s.M, 2)}$ solar masses within the ring; the angular-diameter distances are $D_L = ${s.DL}$ Gpc, $D_S = ${s.DS}$ Gpc and $D_{LS} = ${s.DLS}$ Gpc. What is $\theta_E$, in arcseconds? ($GM_\odot = ${tex(GM_SUN, 5)}$ m³/s², 1 Gpc $= 3.086\times10^{25}$ m.)`,
              visual: skyPic(0, t`A source directly behind a point lens appears as a ring of angular radius $\theta_E$ (schematic).`),
              answer: th, units: 'arcsec', tol: { rel: 0.01 },
              errors: [
                { value: th / Math.SQRT2, feedback: t`$2GM/(c^2b)$ is the Newtonian half; light bending in general relativity is $4GM/(c^2b)$, and it is under the square root.` },
                { value: (th * ARCSEC) ** 2 / ARCSEC, feedback: t`Take the square root: the formula gives $\theta_E^2$ inside the brackets.` },
                { value: th * ARCSEC, feedback: 'That is in radians; 1 rad = 206 265″.' },
              ].filter((e) => Math.abs(e.value - th) > 0.02 * th),
              hints: [t`$4GM/c^2 = 4(${tex(GM_SUN, 5)})(${tex(s.M, 2)})/(2.998\times10^8)^2$ m.`, t`$D_{LS}/(D_LD_S) = ${s.DLS}/(${s.DL}\times${s.DS})$ per Gpc; convert to metres.`, t`Take the square root for radians, then multiply by 206 265.`],
              teach: t`An Einstein ring’s angular radius is $\sqrt{(4GM/c^2)\,D_{LS}/(D_LD_S)}$: about an arcsecond for a galaxy halfway to a quasar.`,
              explain: t`$4GM/c^2 = ${tex((4 * GM_SUN * s.M) / (C * C), 3)}$ m and $D_{LS}/(D_LD_S) = ${tex(s.DLS / (s.DL * s.DS) / GPC, 3)}\ \text{m}^{-1}$, so $\theta_E = ${tex(thetaE(s.M, s.DL, s.DS, s.DLS), 3)}$ rad $= ${sf(th, 3)}''$. In cosmology $D_{LS} \ne D_S - D_L$: angular-diameter distances do not add.`,
            };
          },
        }),
        num({
          id: 'r1-images', skill: 'phys4650.O3.2', difficulty: 3,
          gen(r) {
            const thE = r.pick([0.8, 1.2, 1.6]), u = r.pick([0.2, 0.3, 0.5, 0.8]);
            const sep = thE * Math.sqrt(u * u + 4);
            return {
              prompt: t`For a point lens the images lie where $\beta = \theta - \theta_E^2/\theta$, with $\beta$ the source’s true offset from the lens: $\theta_\pm = \tfrac12\bigl(\beta \pm \sqrt{\beta^2 + 4\theta_E^2}\bigr)$. With $\theta_E = ${thE}''$ and the quasar offset by $\beta = ${u}\,\theta_E$, how far apart on the sky are its two images, in arcseconds?`,
              visual: skyPic(u, t`The sky round a point lens: the Einstein ring (dashed), the source’s true position (hollow) and its two images on either side (schematic, no scale given).`),
              answer: sep, units: 'arcsec', tol: { rel: 0.01 },
              errors: [{ value: thE * (u + Math.sqrt(u * u + 4)) / 2, feedback: t`That is only the outer image’s distance from the lens; the inner one is on the other side, so add their distances.` }, { value: 2 * thE, feedback: t`$2\theta_E$ holds only for perfect alignment; the separation is $\sqrt{\beta^2 + 4\theta_E^2}$.` }].filter((e) => Math.abs(e.value - sep) > 0.01 * sep),
              hints: [t`$\theta_+ > 0$ and $\theta_- < 0$: the images are on opposite sides of the lens.`, t`$\theta_+ - \theta_- = \sqrt{\beta^2 + 4\theta_E^2}$.`, t`$= \theta_E\sqrt{u^2 + 4}$ with $u = ${u}$.`],
              teach: t`A point lens’s two images straddle it, separated by $\sqrt{\beta^2 + 4\theta_E^2}$ — close to two Einstein radii for any small offset.`,
              explain: t`$\theta_+ - \theta_- = \theta_E\sqrt{u^2 + 4} = ${thE}''\sqrt{${sf(u * u + 4, 4)}} = ${sf(sep, 3)}''$. The separation barely depends on the offset: measuring it weighs the lens.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Design the telescope',
      story: t`The two images are easy to split; the ring’s structure is not. You need a mirror big enough to resolve detail along the ring, a camera that samples what the mirror delivers, and relay optics that put the focus where the instruments are.`,
      items: [
        num({
          id: 'r2-aperture', skill: 'phys4650.O8.1', difficulty: 3,
          gen(r) {
            const thE = r.pick([0.8, 1.2, 1.6]), lam = r.pick([0.5, 1.6, 2.2]);
            const D = (1.22 * lam * 1e-6) / (0.1 * thE * ARCSEC);
            return {
              prompt: t`To map the ring you want to resolve, by Rayleigh’s criterion, detail one tenth of the Einstein radius $\theta_E = ${thE}''$. Working at $${lam}\ \mu$m with a perfect telescope above the atmosphere, what is the smallest mirror diameter, in metres?`,
              visual: { type: 'optics-waves', params: { mode: 'airy', preset: 'jwst', controls: ['sep'], readout: false }, caption: t`Two point sources through a round aperture: their Airy patterns and the Rayleigh criterion (JWST’s 6.5 m at 2 μm shown; slide the separation).` },
              answer: D, units: 'm', tol: { rel: 0.01 },
              errors: [{ value: D / 1.22, feedback: 'A round aperture’s first dark ring is at 1.22λ/D.' }, { value: D / 10, feedback: t`The detail is a tenth of $\theta_E$: $${sf(0.1 * thE, 3)}''$.` }],
              hints: [t`Rayleigh: $\theta = 1.22\lambda/D$.`, t`$\theta = 0.1\times${thE}'' = ${sf(0.1 * thE, 3)}''$; convert to radians (1″ $= 4.848\times10^{-6}$ rad).`, t`$D = 1.22\lambda/\theta$.`],
              teach: 'Rayleigh’s criterion sets the mirror: D = 1.22λ/θ for detail of angular size θ.',
              explain: t`$\theta = ${sf(0.1 * thE, 3)}'' = ${tex(0.1 * thE * ARCSEC, 3)}$ rad, so $D = 1.22(${lam}\times10^{-6})/\theta = ${sf(D, 3)}$ m. From the ground the atmosphere blurs to about $1''$ unless adaptive optics corrects it — which is why lens mapping leans on space telescopes and adaptive optics.`,
            };
          },
        }),
        num({
          id: 'r2-cass', skill: 'phys4650.O4.3', difficulty: 3,
          gen(r) {
            const D = r.pick([2.4, 4, 6.5]), N1 = r.pick([1.2, 1.5, 2.3]), p = r.pick([10, 15, 18]), lam = r.pick([1.6, 2.2]);
            const F = (2 * p * 1e-6 * D) / (lam * 1e-6), f1 = N1 * D, m = F / f1;
            return {
              prompt: t`Your Cassegrain’s ${D} m primary is f/${N1}. The camera’s pixels are $${p}\ \mu$m. For Nyquist sampling at $${lam}\ \mu$m, one pixel must span $\lambda/(2D)$ on the sky. What magnification must the convex secondary provide?`,
              visual: bench({ elements: hubbleEls(), source: 'inf', rays: 7, unit: 'm', readouts: [], marks: [] }, t`A Cassegrain telescope (Hubble’s prescription, traced paraxially): the secondary turns the primary’s fast cone into a slow one, multiplying the focal length.`),
              answer: m, tol: { rel: 0.01 },
              errors: [{ value: m / 2, feedback: t`Nyquist puts one pixel on $\lambda/(2D)$, not $\lambda/D$: the plate scale $1/F$ times the pixel must equal $\lambda/(2D)$.` }, { value: F, feedback: 'That is the system’s focal length in metres; divide by the primary’s focal length.' }].filter((e) => Math.abs(e.value - m) > 0.01 * m),
              hints: [t`The plate scale is $1/F$ radians per metre in the focal plane; one pixel $p$ subtends $p/F$.`, t`Set $p/F = \lambda/(2D)$: $F = 2pD/\lambda$.`, t`The secondary’s magnification is $F/f_1$ with $f_1 = ${N1}\times${D}$ m.`],
              teach: 'A Cassegrain’s secondary multiplies the primary’s focal length; choose it so the plate scale matches the pixels to the diffraction limit.',
              explain: t`$F = 2pD/\lambda = 2(${p}\times10^{-6})(${D})/(${lam}\times10^{-6}) = ${sf(F, 3)}$ m, i.e. f/${sf(F / D, 3)}. The primary gives $f_1 = ${sf(f1, 3)}$ m, so the secondary must magnify $${sf(m, 3)}$ times.`,
            };
          },
        }),
        mcq({
          id: 'r2-barlow', skill: 'phys4650.O4.1', difficulty: 3, kind: 'error',
          prompt: t`To lengthen the focus, a diverging relay lens ($f = -50$ mm) is put in the converging beam $30$ mm before the telescope’s focus. A colleague writes:

1. The lens meets light converging toward a point $30$ mm beyond it, so $s_o = +30$ mm.
2. $\dfrac{1}{s_i} = \dfrac{1}{f} - \dfrac{1}{s_o} = -\dfrac{1}{50} - \dfrac{1}{30}$.
3. So $s_i = -18.75$ mm.
4. A negative $s_i$ means a virtual image $18.75$ mm in front of the lens, so the camera cannot record it.

Which step is wrong?`,
          visual: bench({ elements: [{ kind: 'thin', z: -70, f: 100, ap: 14, label: 'objective' }, { kind: 'thin', z: 0, f: -50, ap: 9, label: 'relay' }], source: 'inf', rays: 5, unit: 'mm', readouts: [], marks: [], x: [-80, 110] }, t`An objective and a diverging relay lens, traced paraxially (schematic of the problem’s arrangement).`),
          choices: [t`Step 1: light converging toward a point beyond the lens is a virtual object, $s_o = -30$ mm.`, 'Step 2: for a diverging lens the thin-lens equation changes sign.', 'Step 3: the arithmetic is wrong.', 'Step 4: a negative image distance means a real image.'],
          answer: 0,
          why: { 1: t`The thin-lens equation is the same for every lens; the sign lives in $f$.`, 2: t`With $s_o = +30$ mm, $-1/50 - 1/30 = -8/150$ and $s_i = -18.75$ mm: the arithmetic follows from the wrong sign.`, 3: t`In Hecht’s convention a negative $s_i$ is virtual; step 4 reads it correctly — it is the input that is wrong.` },
          hints: ['Is the light reaching the relay lens diverging from a point, or converging toward one?', t`Converging light makes a virtual object: $s_o$ is negative.`, t`Redo it with $s_o = -30$ mm.`],
          teach: t`Light converging into a lens is a virtual object: $s_o < 0$. A Barlow lens then makes a real, magnified image further back.`,
          explain: t`With $s_o = -30$ mm: $1/s_i = -1/50 + 1/30 = 1/75$, so $s_i = +75$ mm, a **real** image $75$ mm behind the relay, magnified $-s_i/s_o = 2.5$ times. That is a Barlow lens: it stretches the focal length without a longer tube.`,
        }),
      ],
    },
    {
      title: 'Filters and polarization',
      story: t`The quasar’s broad emission lines, stretched by the expansion of the universe, land in the near infrared. A tunable Fabry–Pérot isolates one; a polarimeter asks whether the light from the jets in the lensed images is polarized.`,
      items: [
        num({
          id: 'r3-fp', skill: 'phys4650.O7.2', difficulty: 3,
          gen(r) {
            const z = r.pick([1.2, 1.5, 2.0]), W = r.pick([5, 8, 12]);
            const lam = 656.28 * (1 + z), d = (lam * lam) / (2 * W) * 1e-6;     // nm, mm
            return {
              prompt: t`The quasar’s hydrogen-alpha line, $656.28$ nm when emitted, arrives redshifted by $1 + z = ${1 + z}$. An order-sorting filter in front of your air-spaced Fabry–Pérot passes a band $${W}$ nm wide, so the étalon’s free spectral range must be at least that. What is the largest mirror spacing allowed, in millimetres?`,
              visual: { type: 'graph', caption: t`A Fabry–Pérot’s transmission peaks (gold) under an order-sorting filter (dashed): only one peak may fall inside it.`, params: { x: [-1.6, 1.6], y: [0, 1.15], aspect: 'wide', xlabel: 'wavelength offset (free spectral ranges)', ylabel: 'T', xticks: 6, yticks: 2,
                curves: [{ fn: '1/(1 + 400*sin(pi*x)^2)', color: 'gold', width: 2.2, samples: 3000 }, { fn: 'exp(-(x/0.55)^8)', color: 'ink3', width: 1.6, dash: [5, 5] }] } },
              answer: d, units: 'mm', tol: { rel: 0.01 },
              errors: [{ value: d * 2, feedback: t`The round trip is $2d$: FSR $= \lambda^2/(2d)$.` }, { value: (656.28 ** 2 / (2 * W)) * 1e-6, feedback: 'Use the observed (redshifted) wavelength.' }],
              hints: [t`Observed wavelength $\lambda = 656.28\times${1 + z}$ nm.`, t`Free spectral range in wavelength: $\lambda^2/(2d)$.`, t`Set $\lambda^2/(2d) \ge ${W}$ nm and solve for $d$.`],
              teach: 'A Fabry–Pérot’s free spectral range λ²/(2d) must exceed the order-sorting filter’s band, which caps its spacing.',
              explain: t`$\lambda = ${sf(lam, 5)}$ nm, so $d \le \lambda^2/(2W) = (${sf(lam, 5)})^2/(2\times${W})$ nm $= ${sf(d, 3)}$ mm. With a finesse of 40 its passband would then be $${sf(W / 40, 2)}$ nm — narrow enough to map one emission line across the ring.`,
            };
          },
        }),
        num({
          id: 'r3-jones', skill: 'phys4650.O6.2', difficulty: 3,
          gen(r) {
            const th = r.pick([20, 30, 60, 70]), ph = r.pick([30, 45, 60]);
            const c = Math.cos, s = Math.sin, D = Math.PI / 180;
            const I = c(th * D) ** 2 * c(ph * D) ** 2 + s(th * D) ** 2 * s(ph * D) ** 2;
            return {
              prompt: t`Light from one image is fully linearly polarized at $${th}^\circ$ from horizontal. It passes a quarter-wave plate with its fast axis horizontal, then a polarizer at $${ph}^\circ$ from horizontal. What fraction of its irradiance gets through?`,
              visual: { type: 'op2-jones', params: { input: { angle: th }, elements: [{ kind: 'qwp', angle: 0 }, { kind: 'pol', angle: ph }], view: 'chain', readout: false, hide: ['intensity', 'out'] }, caption: t`The polarimeter’s chain (Hecht’s convention); the output irradiance is the question.` },
              answer: I, tol: { rel: 0.01 },
              errors: [{ value: c((th - ph) * D) ** 2, feedback: 'That ignores the wave plate: it shifts the vertical component by a quarter wave, so the two components no longer add in phase at the polarizer.' }].filter((e) => Math.abs(e.value - I) > 0.01 * I),
              hints: [t`Input $(\cos\theta, \sin\theta)$; the plate multiplies the $y$ component by $i$.`, t`The polarizer at $\varphi$ projects onto $(\cos\varphi, \sin\varphi)$: $E = \cos\theta\cos\varphi + i\sin\theta\sin\varphi$.`, t`$|E|^2 = \cos^2\theta\cos^2\varphi + \sin^2\theta\sin^2\varphi$.`],
              teach: 'Jones calculus: multiply the matrices right to left, then take |E|²; a quarter-wave plate keeps the two components from interfering at the analyser.',
              explain: t`After the plate the field is $(\cos ${th}^\circ,\ i\sin ${th}^\circ)$; projecting on the polarizer gives $\cos ${th}^\circ\cos ${ph}^\circ + i\sin ${th}^\circ\sin ${ph}^\circ$, whose squared modulus is $${sf(I, 3)}$. Turning the analyser and the plate maps out all four Stokes parameters.`,
            };
          },
        }),
      ],
    },
    {
      title: 'Two telescopes and a clock',
      story: t`A second telescope joins the first as an interferometer, to measure the ring directly from its fringes. Then the quasar flickers — and you wait for the other image to repeat the flicker.`,
      items: [
        num({
          id: 'r4-null', skill: 'phys4650.O10.1', difficulty: 3,
          gen(r) {
            const thE = r.pick([0.8, 1.2, 1.6]), lam = r.pick([1.6, 2.2]);
            const B = (2.4048 * lam * 1e-6) / (Math.PI * 2 * thE * ARCSEC);
            return {
              prompt: t`By the van Cittert–Zernike theorem, a thin ring of angular **diameter** $\theta$ gives fringe visibility $|J_0(\pi\theta B/\lambda)|$ on a baseline $B$, and $J_0$ first vanishes at $2.405$. Your ring has radius $\theta_E = ${thE}''$. At $${lam}\ \mu$m, at what baseline do the fringes first disappear, in metres?`,
              visual: baselinePic(t`Two telescopes a baseline apart observe the Einstein ring (schematic).`),
              answer: B, units: 'm', tol: { rel: 0.01 },
              errors: [{ value: B * 2, feedback: t`The formula uses the ring’s diameter, $2\theta_E$.` }, { value: (1.22 * lam * 1e-6) / (2 * thE * ARCSEC), feedback: t`$1.22\lambda/\theta$ is for a filled disc; a thin ring transforms to $J_0$, first zero at $\pi\theta B/\lambda = 2.405$.` }],
              hints: [t`$\theta = 2\theta_E$ in radians.`, t`$\pi\theta B/\lambda = 2.405$.`, t`$B = 2.405\lambda/(\pi\theta)$.`],
              teach: 'An interferometer reads a source’s shape from where its fringes vanish; a thin ring’s first null is at B = 2.405λ/(πθ).',
              explain: t`$\theta = ${sf(2 * thE, 3)}'' = ${tex(2 * thE * ARCSEC, 3)}$ rad, so $B = 2.405(${lam}\times10^{-6})/(\pi\theta) = ${sf(B, 3)}$ m — a modest baseline for an arcsecond ring, the same physics the Event Horizon Telescope used across the whole Earth for M87*’s 46 μas.`,
            };
          },
        }),
        num({
          id: 'r4-band', skill: 'phys4650.O10.1', difficulty: 3,
          gen(r) {
            const [lam, dl, band] = r.pick([[2.2, 0.4, 'K'], [1.65, 0.3, 'H'], [1.25, 0.25, 'J']]);
            const Lc = (lam * lam) / dl;     // µm
            return {
              prompt: t`The interferometer observes the whole ${band} band, centred on $${lam}\ \mu$m and $${dl}\ \mu$m wide. Delay lines keep the two telescopes’ light paths equal. Within roughly what path difference must they hold them for fringes to be seen at all — the band’s coherence length $\lambda^2/\Delta\lambda$ — in micrometres?`,
              visual: { type: 'graph', caption: t`Fringe visibility against path difference for a broad band (Gaussian spectrum, logarithmic axis).`, params: { x: [-1, 3], y: [0, 1.1], xlog: true, axesAt: 'edge', aspect: 'wide', xlabel: 'path difference (µm)', ylabel: 'visibility', yticks: 2,
                curves: [{ fn: `exp(-(pi*${dl}*(10^x)/${sf(lam * lam, 4)})^2/(4*ln(2)))`, color: 'gold', width: 2.4 }] } },
              answer: Lc, units: 'um', tol: { rel: 0.01 },
              errors: [{ value: lam / dl, feedback: t`That is $\lambda/\Delta\lambda$, a number of waves; multiply by $\lambda$ for a length.` }],
              hints: [t`Coherence length $\approx \lambda^2/\Delta\lambda$.`, t`$(${lam}\ \mu\text{m})^2/(${dl}\ \mu\text{m})$.`],
              teach: 'A broad band is coherent over only λ²/Δλ: interferometers must match paths to micrometres.',
              explain: t`$\lambda^2/\Delta\lambda = ${lam}^2/${dl} = ${sf(Lc, 3)}\ \mu$m. As the Earth turns, the delay lines move continuously, metres at a time, to keep the paths equal to this precision.`,
            };
          },
        }),
        num({
          id: 'r4-delay', skill: 'phys4650.O3.2', difficulty: 4,
          gen(r) {
            const s = r.pick(SYSTEMS), u = r.pick([0.2, 0.3, 0.5]);
            const w = Math.sqrt(u * u + 4), bracket = (u * w) / 2 + Math.log((w + u) / (w - u));
            const T = ((4 * GM_SUN * s.M) / C ** 3) * (1 + s.zl) * bracket / DAY;
            return {
              prompt: t`Fermat’s arrival-time surface puts the two images at different travel times. For a point lens of mass $M$ at redshift $z_L$, with the source offset by $u = \beta/\theta_E$, the delay is
$$\begin{gathered}\Delta t = \frac{4GM}{c^3}(1 + z_L)\,F(u), \\ F(u) = \frac{u\sqrt{u^2 + 4}}{2} + \ln\frac{\sqrt{u^2 + 4} + u}{\sqrt{u^2 + 4} - u}\end{gathered}$$
With $M = ${tex(s.M, 2)}$ solar masses, $z_L = ${s.zl}$ and $u = ${u}$, how many days after the first image does the second repeat a flicker of the quasar?`,
              visual: lensPic(u, t`The two images of a source offset by ${u} Einstein radii; their light paths differ in length and in gravitational delay (the simulation’s own lens).`),
              answer: T, units: 'd', tol: { rel: 0.01 },
              errors: [{ value: T / (1 + s.zl), feedback: t`Keep the factor $1 + z_L$: the delay accrues near the lens and is stretched by the expansion on its way to us.` }, { value: ((4 * GM_SUN * s.M) / C ** 3) * (1 + s.zl) * ((u * w) / 2) / DAY, feedback: 'Both terms count: the geometric one (the first) and the gravitational one (the logarithm).' }].filter((e) => Math.abs(e.value - T) > 0.01 * T),
              hints: [t`$4GM_\odot/c^3 = ${sf((4 * GM_SUN) / C ** 3 * 1e6, 4)}\ \mu$s; multiply by $M$ in solar masses.`, t`$\sqrt{u^2 + 4} = ${sf(w, 5)}$.`, t`Evaluate $F(u)$, multiply, and divide by 86 400 s per day.`],
              teach: 'Lensed images arrive at different times — the stationary points of Fermat’s arrival-time surface — and the delay weighs the lens.',
              explain: t`$4GM/c^3 = ${sf((4 * GM_SUN * s.M) / C ** 3, 3)}$ s; $F(u) = ${sf((u * w) / 2, 4)} + ${sf(Math.log((w + u) / (w - u)), 4)} = ${sf(bracket, 4)}$; with $1 + z_L = ${1 + s.zl}$ the delay is $${sf(T, 3)}$ days. Real lensed quasars show delays of days to months; with the image positions they measure the lens’s mass and even the expansion rate of the universe.`,
            };
          },
        }),
      ],
    },
  ],
});
