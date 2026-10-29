// Total internal reflection and dispersion: the critical angle
// sin θc = n₂/n₁, light trapped in fibres and gems, the index depending on
// wavelength (prisms, rainbows, chromatic aberration). Indices of real
// materials from the Sellmeier formulas in model/optics-rays.js (tested
// against catalogue values).
import { lesson, mcq, num } from '../../src/core/content.js';
import { indexOf, fibreAcceptance, minDeviation, criticalAngle, DEG } from '../../src/viz/model/optics-rays.js';
import { tn, apart, sind, asind, tand, iface, prismPic, fibrePic, bars, label, seg, r6 } from './_optics.js';

const t = String.raw;

/** The index of crown glass (BK7) against wavelength, from its Sellmeier formula, with optional marks. */
function crownCurve(caption, marks = []) {
  const u = '(x/1000)^2';
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [380, 760], y: [1.508, 1.534], xlabel: 'wavelength in vacuum (nm)', ylabel: 'refractive index n',
      curves: [{ fn: `sqrt(1 + 1.03961212*${u}/(${u} - 0.00600069867) + 0.231792344*${u}/(${u} - 0.0200179144) + 1.01046945*${u}/(${u} - 103.560653))`, color: 'accent', width: 2.6 }],
      points: marks.map(([l, text, color]) => ({ x: l, y: r6(indexOf('crown', l)), color: color || 'gold', r: 5, label: text })),
    },
    caption,
  };
}

/** A diver under a flat water surface and the cone of directions through which the sky is seen. */
function snellWindow(d, caption) {
  const tc = asind(1 / 1.33), w = 2.9;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [-4.2, 4.2], y: [-d - 0.6, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '',
      shade: [{ fn: '0', lower: `${-d - 2}`, from: -30, to: 30, color: 'accent', alpha: 0.22 }],
      curves: [seg([-30, 0], [30, 0], { color: 'ink3', width: 1.6 }), seg([0, -d], [-d * tand(tc), 0], { color: 'gold', width: 2 }), seg([0, -d], [d * tand(tc), 0], { color: 'gold', width: 2 }),
        seg([0, -d], [0, 0.9], { color: 'ink3', width: 1.1, dash: true }), seg([-d * tand(tc), 0], [-d * tand(tc) - w * 0.25, 0.08], { color: 'gold', width: 1.4, dash: true }), seg([d * tand(tc), 0], [d * tand(tc) + w * 0.25, 0.08], { color: 'gold', width: 1.4, dash: true })],
      points: [{ x: 0, y: -d, color: 'good', r: 6, label: 'diver’s eye', labelDx: 10, labelDy: -2 }, label(-4.0, 0.25, 'air', 'ink2'), label(-4.0, -0.3, 'water', 'ink2'), label(0.12, 0.75, 'normal', 'ink3'),
        label(d * tand(tc) * 0.5 + 0.25, -d * 0.5, 'critical angle', 'gold')],
    },
    caption,
  };
}

export default lesson({
  id: 'phys2220.O1.2',
  title: 'Total internal reflection and dispersion',
  minutes: 12, difficulty: 2,
  intro: t`Going from a slower medium into a faster one ($n_1 > n_2$), light bends *away* from the normal. At one angle of incidence, the **critical angle** $\theta_c$, the refracted ray skims along the surface; beyond it, no light crosses at all and every bit is reflected — **total internal reflection**. Setting $\theta_2 = 90°$ in Snell's law gives

$$\sin\theta_c = \frac{n_2}{n_1}\qquad (n_1 > n_2)$$

A second effect rides along: $n$ depends slightly on wavelength — **dispersion** — so violet light bends more than red, and a prism or a raindrop spreads white light into its colours.`,
  symbols: [
    { tex: '\\theta_c', text: 'the critical angle, measured from the normal. Beyond it, light is totally reflected back into the first medium' },
    { tex: 'n_1', text: 'the index of the medium the light is in (the slower one, the larger index)' },
    { tex: 'n_2', text: 'the index of the medium beyond the surface. With $n_1 \\le n_2$ there is no critical angle: light always gets through' },
    { tex: 'n(\\lambda)', text: 'dispersion: the index depends on the vacuum wavelength $\\lambda$. In glass and water it is larger for violet (400 nm) than for red (700 nm), by about 1%' },
  ],
  why: 'Total internal reflection carries the internet through optical fibres and folds the light in binoculars and periscopes; dispersion is what lets a spectrometer read a star’s spectrum — and what blurs simple lenses into coloured fringes.',
  visual: {
    type: 'optics-rays',
    title: 'White light through a prism',
    lead: t`A beam of white light enters a 60° prism of real crown glass. Inside, the colours have barely separated; leaving, they fan out. Change the angle of incidence, the glass, and the apex angle.`,
    tasks: [
      t`Lower $\theta_1$ slowly toward 29°: violet is trapped first (at about 30°), then every colour — total internal reflection at the second face.`,
      t`Switch to flint glass: the spread of colours nearly triples, from 1.6° to 4.4° at $\theta_1 = 50°$.`,
      t`Choose diamond: no colour can leave at any angle, because its critical angle is only 24°. Cut the apex angle to 40° and raise $\theta_1$ to 60°: now it scatters colours widely — its "fire".`,
    ],
    params: { mode: 'prism', apex: 60, angle: 50, mat: 'crown', light: 'white' },
  },
  example: {
    prompt: t`Light inside a diamond ($n = 2.42$) reaches one of its faces. Find the critical angle when the diamond is in air ($n = 1.00$) and when it is under water ($n = 1.33$). Why does a diamond sparkle less under water?`,
    visual: iface({ n1: 2.42, n2: 1, angle: 30 }, 'Light inside diamond meeting a face at 30°, beyond the critical angle (red dashes): all of it is reflected back inside.'),
    steps: [
      { label: 'In air', text: t`$\sin\theta_c = \dfrac{n_2}{n_1} = \dfrac{1.00}{2.42} = 0.413$, so $\theta_c = 24.4°$.` },
      { label: 'Under water', text: t`$\sin\theta_c = \dfrac{1.33}{2.42} = 0.550$, so $\theta_c = 33.3°$.` },
      { label: 'Sparkle', text: t`A gem's facets are cut so that light entering the top hits the back faces beyond $\theta_c$ and bounces back out toward you. With the larger critical angle under water, more rays meet a back face *inside* $\theta_c$ and leak out of the back: less light returns.` },
      { label: 'Sense check', text: t`The ratio $n_2/n_1$ grows as the outside medium's index approaches the diamond's, and $\theta_c$ grows toward 90°. For equal indices the boundary vanishes and nothing reflects at all.` },
    ],
    answer: t`$\theta_c = 24.4°$ in air and $33.3°$ in water; with a larger critical angle, more light escapes through the back of the stone.`,
  },
  practice: [
    num({
      id: 'critical', difficulty: 1,
      gen(r) {
        const [mat, n] = r.pick([['water', 1.33], ['fused silica', 1.46], ['crown glass', 1.52], ['flint glass', 1.62], ['sapphire', 1.77]]);
        const tc = asind(1 / n);
        return {
          prompt: t`What is the critical angle for light inside ${mat} ($n = ${n.toFixed(2)}$) meeting a surface with air?`,
          answer: tc, units: 'deg', tol: { rel: 0.005 },
          errors: apart([{ value: 90 - tc, feedback: 'That is measured from the surface. The critical angle is measured from the normal.' }], tc),
          hints: [t`$\sin\theta_c = n_2/n_1$, with the light inside the ${mat} ($n_1 = ${n.toFixed(2)}$) and air outside ($n_2 = 1.00$).`],
          teach: t`The critical angle satisfies $\sin\theta_c = n_2/n_1$; it exists only going toward a lower index.`,
          explain: t`$\sin\theta_c = 1.00/${n.toFixed(2)} = ${tn(1 / n, 4)}$, so $\theta_c = ${tn(tc)}°$. Any ray meeting the surface farther from the normal than this is totally reflected.`,
          visual: iface({ n1: n, n2: 1, angle: Math.round(tc) - 8, hide: ['critical'] }, `Light inside the ${mat} meeting the surface with air, part of it escaping. The angle at which the escaping ray would skim the surface is what you are finding.`),
        };
      },
    }),
    mcq({
      id: 'which-tir', difficulty: 1,
      prompt: 'Total internal reflection can happen when light travels from:',
      choices: ['Water into air', 'Air into water', 'Air into glass', 'Glass into diamond'],
      answer: 0,
      why: {
        1: 'Going into the higher index, the ray bends toward the normal and always gets through.',
        2: 'Air into glass is also into a higher index: there is no critical angle.',
        3: t`Diamond ($n = 2.42$) has a higher index than glass, so light from glass into diamond always gets through.`,
      },
      hints: [t`$\sin\theta_c = n_2/n_1$ must be less than 1. Which way round does that need the indices?`],
      teach: 'Total internal reflection needs light heading from a higher index toward a lower one.',
      explain: t`Only water ($n = 1.33$) into air ($n = 1.00$) has $n_2/n_1 < 1$: $\theta_c = 48.8°$. In the other three the light goes into a larger index, bends toward the normal, and always crosses.`,
      visual: bars([['air: n = 1.00', 1, 'ink2'], ['water: n = 1.33', 1.33, 'accent'], ['glass: n = 1.52', 1.52, 'teal'], ['diamond: n = 2.42', 2.42, 'violet']], { caption: 'The four refractive indices, to scale.' }),
    }),
    num({
      id: 'measure-crit', difficulty: 2,
      gen(r) {
        const [what, n] = r.pick([['a semicircular glass block', 1.52], ['an acrylic block', 1.49], ['a block of flint glass', 1.62], ['a polycarbonate block', 1.585]]);
        const tc = Math.round(asind(1 / n) * 10) / 10;
        const key = 1 / sind(tc);
        return {
          prompt: t`In the lab, a laser beam inside ${what} is turned until the ray leaving the flat face just skims along it. That happens at $${tc.toFixed(1)}°$ from the normal. What is the block's refractive index?`,
          answer: key, tol: { rel: 0.003 },
          errors: [{ value: sind(tc), feedback: t`Upside down: $\sin\theta_c = 1/n$, so $n = 1/\sin\theta_c$, which must exceed 1.` }],
          hints: ['The ray skimming the surface means the angle inside is the critical angle.', t`$\sin\theta_c = n_\text{air}/n = 1/n$, so $n = 1/\sin\theta_c$.`],
          teach: 'Measuring the critical angle is a quick way to find a material’s index: n = 1/sin θc against air.',
          explain: t`$n = 1/\sin ${tc.toFixed(1)}° = 1/${tn(sind(tc), 4)} = ${tn(key)}$.`,
          visual: iface({ n1: n, n2: 1, angle: Math.round((tc - 0.25) * 10) / 10, labels: false, hide: ['critical'] }, 'The beam at the critical angle: the refracted ray just skims the surface (no labels: the index is what you are finding).'),
        };
      },
    }),
    num({
      id: 'fibre-accept', difficulty: 2,
      gen(r) {
        const [nc, nk] = r.pick([[1.48, 1.46], [1.50, 1.47], [1.46, 1.44], [1.52, 1.49]]);
        const acc = fibreAcceptance(nc, nk), deg = acc.thetaMax / DEG;
        return {
          prompt: t`An optical fibre has a core of index $${nc.toFixed(2)}$ and cladding of $${nk.toFixed(2)}$. Light enters its flat end from air. What is the largest angle to the fibre's axis at which a ray is still trapped by total internal reflection? Use $\sin\theta_\text{max} = \sqrt{n_\text{core}^2 - n_\text{clad}^2}$.`,
          answer: deg, units: 'deg', tol: { rel: 0.01 },
          errors: apart([{ value: criticalAngle(nc, nk) / DEG, feedback: 'That is the critical angle at the core–cladding boundary, measured from its normal. The question asks for the launch angle in air.' }, { value: asind(nc - nk), feedback: t`Square the indices before subtracting: $\sqrt{n_\text{core}^2 - n_\text{clad}^2}$.` }], deg),
          hints: [t`$n_\text{core}^2 - n_\text{clad}^2 = ${tn(nc * nc, 4)} - ${tn(nk * nk, 4)} = ${tn(nc * nc - nk * nk, 3)}$.`, t`Take the square root (the **numerical aperture**, here $${tn(acc.NA, 3)}$), then the inverse sine.`],
          teach: t`A fibre accepts rays within a cone of half-angle $\theta_\text{max}$, where $\sin\theta_\text{max} = \sqrt{n_\text{core}^2 - n_\text{clad}^2}$, its numerical aperture.`,
          explain: t`$\sin\theta_\text{max} = \sqrt{${tn(nc * nc, 4)} - ${tn(nk * nk, 4)}} = ${tn(acc.NA, 3)}$, so $\theta_\text{max} = ${tn(deg)}°$. It comes from Snell's law at the end face, $\sin\theta_\text{max} = n_\text{core}\sin(90° - \theta_c)$, with $\sin\theta_c = n_\text{clad}/n_\text{core}$.`,
          solution: t`At the end face, $1.00\sin\theta_0 = n_\text{core}\sin\theta_1$. The ray then meets the cladding at $90° - \theta_1$ from that boundary's normal, which must be at least $\theta_c$: $\cos\theta_1 \ge n_\text{clad}/n_\text{core}$. So $\sin\theta_0 \le n_\text{core}\sqrt{1 - (n_\text{clad}/n_\text{core})^2} = \sqrt{n_\text{core}^2 - n_\text{clad}^2}$.`,
          visual: fibrePic({ nCore: nc, nClad: nk, angle: 6, hide: ['acceptance'] }, 'A ray launched into the fibre at 6° (cross-section, enormously widened). The largest angle that stays trapped is what you are finding.'),
        };
      },
    }),
    mcq({
      id: 'most-bent', difficulty: 1,
      prompt: 'White light passes through a glass prism. Which colour is bent through the largest angle?',
      choices: ['Violet', 'Red', 'Green, in the middle of the spectrum', 'All colours equally; the prism only separates them in time'],
      answer: 0,
      why: {
        1: 'Red has the smallest index in glass, so it is bent least.',
        2: 'The index changes steadily across the spectrum; it is largest at the violet end.',
        3: 'If every colour bent equally, they would leave together and no spectrum would form.',
      },
      hints: ['Read the graph: which wavelength has the largest index?', 'A larger index means a larger change of direction at each face.'],
      teach: 'In glass and water the index is largest for violet, so violet light is bent most (normal dispersion).',
      explain: t`For crown glass $n = 1.531$ at 400 nm but $1.513$ at 700 nm. A larger index bends light more at each face, so violet is deviated most and red least — about 1.6° apart for a 60° prism.`,
      visual: crownCurve('The refractive index of crown glass (BK7) against wavelength, from its catalogue formula.'),
    }),
    num({
      id: 'min-dev', difficulty: 2,
      gen(r) {
        const [mat, n] = r.pick([['crown glass', 1.52], ['flint glass', 1.62], ['fused silica', 1.46]]);
        const A = r.pick([45, 50, 60]);
        const d = minDeviation(A * DEG, n) / DEG;
        return {
          prompt: t`A ${A}° prism of ${mat} ($n = ${n.toFixed(2)}$ for yellow light) is turned until yellow light is deviated as little as possible. Then the ray crosses the prism symmetrically, and the deviation is $\delta_\text{min} = 2\arcsin\!\big(n\sin(A/2)\big) - A$. Find it.`,
          answer: d, units: 'deg', tol: { rel: 0.005 },
          errors: apart([{ value: 2 * asind(n * sind(A)) - A, feedback: t`Use half the apex angle inside the sine: $\sin(A/2)$.` }, { value: 2 * asind(n * sind(A / 2)), feedback: t`Subtract the apex angle $A$ at the end.` }], d),
          hints: [t`$\sin(A/2) = \sin ${A / 2}° = ${tn(sind(A / 2), 4)}$; multiply by $n$.`, t`Take the inverse sine, double it, and subtract $${A}°$.`],
          teach: 'At minimum deviation the ray crosses the prism parallel to its base: δmin = 2 arcsin(n sin(A/2)) − A.',
          explain: t`$n\sin(A/2) = ${tn(n * sind(A / 2), 4)}$, $\arcsin = ${tn(asind(n * sind(A / 2)), 4)}°$, so $\delta_\text{min} = 2(${tn(asind(n * sind(A / 2)), 4)}°) - ${A}° = ${tn(d)}°$. Measuring $\delta_\text{min}$ with a spectrometer and solving for $n$ is how glass indices are measured to five decimals.`,
          visual: prismPic({ apex: A, mat: mat === 'flint glass' ? 'flint' : mat === 'fused silica' ? 'silica' : 'crown', light: 'mono', lambda: 589, angle: Math.round(asind(n * sind(A / 2))) }, `Yellow light through the ${A}° prism, close to the symmetric path. The deviation is what you are finding.`),
        };
      },
    }),
    num({
      id: 'snell-window', difficulty: 3,
      gen(r) {
        const d = r.pick([1.5, 2.0, 3.0, 4.0]);
        const tc = asind(1 / 1.33), R = d * tand(tc);
        return {
          prompt: t`A diver ${d} m below a calm water surface ($n = 1.33$) looks up. Light from the whole sky reaches her through a bright circle on the surface — "Snell's window" — and outside it she sees only reflections of the water below. What is the circle's radius?`,
          answer: R, units: 'm', tol: { rel: 0.01 },
          errors: apart([{ value: d * tand(90 - tc), feedback: 'Measure the angle from the vertical (the normal), not from the surface.' }, { value: d / tand(tc), feedback: t`The radius is opposite the angle at the diver: $r = d\tan\theta_c$.` }], R),
          hints: ['Light from a horizon-grazing source enters the water at 90° from the normal, so it travels underwater at the critical angle.', t`$\theta_c = \arcsin(1/1.33) = ${tn(tc)}°$ from the vertical.`, t`The edge of the window is where a line from the diver at $\theta_c$ from the vertical meets the surface: $r = d\tan\theta_c$.`],
          teach: 'Run backwards, total internal reflection squeezes the whole sky into a cone of half-angle θc as seen from under water.',
          explain: t`$r = d\tan\theta_c = ${d}\tan ${tn(tc)}° = ${tn(R)}$ m. Rays from the sky, even grazing ones, bend into the water within $${tn(tc)}°$ of the vertical; beyond that cone, a diver sees light from below totally reflected at the surface, like a mirror.`,
          visual: snellWindow(d, `A diver ${d} m down and the critical angle on each side of the vertical (to scale). The width of the window is what you are finding.`),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-core', difficulty: 2,
      gen(r) {
        const [nc, nk] = r.pick([[1.48, 1.46], [1.50, 1.47], [1.4475, 1.4440]]);
        const tc = criticalAngle(nc, nk) / DEG;
        return {
          prompt: t`Inside an optical fibre, light in the core ($n = ${nc}$) meets the cladding ($n = ${nk}$). What is the critical angle at that boundary?`,
          answer: tc, units: 'deg', tol: { rel: 0.002 },
          errors: apart([{ value: 90 - tc, feedback: 'That is measured from the boundary itself; the critical angle is measured from the normal.' }], tc),
          hints: [t`$\sin\theta_c = n_\text{clad}/n_\text{core}$.`],
          teach: 'A fibre’s core and cladding differ by only about 1%, so its critical angle is large: only rays nearly parallel to the axis are trapped.',
          explain: t`$\sin\theta_c = ${nk}/${nc} = ${tn(nk / nc, 5)}$, so $\theta_c = ${tn(tc, 4)}°$: rays must stay within $${tn(90 - tc, 3)}°$ of the fibre's axis to be guided.`,
          visual: fibrePic({ nCore: Math.max(1.4, nc), nClad: Math.max(1.3, nk), angle: 8, hide: ['acceptance'] }, 'A ray bouncing along a fibre’s core (cross-section, enormously widened).'),
        };
      },
    }),
    num({
      id: 'cp-tracker', difficulty: 3, transfer: true,
      gen(r) {
        const f0 = r.pick([25, 35, 50]);
        const nd = 1.5168, nF = 1.5224, nC = 1.5143;
        const fF = (f0 * (nd - 1)) / (nF - 1), fC = (f0 * (nd - 1)) / (nC - 1), df = fC - fF;
        return {
          prompt: t`A spacecraft's star tracker images stars with a single lens of crown glass, $f = ${f0}.0$ mm at the yellow sodium line, where $n = 1.5168$. A lens's focal length is proportional to $1/(n - 1)$ (the lensmaker's formula). With $n = 1.5224$ for blue light (486 nm) and $1.5143$ for red (656 nm), how far apart are the blue and red foci?`,
          answer: df, units: 'mm', tol: { rel: 0.01 },
          errors: [{ value: f0 * (nF - nC), feedback: t`The focal length goes as $1/(n - 1)$, not as $n$: compute each focal length from $f = f_\text{yellow}(n_\text{yellow} - 1)/(n - 1)$.` }],
          hints: [t`Each focal length is $f = ${f0}.0\ \text{mm} \times \dfrac{0.5168}{n - 1}$.`, t`Blue: $${f0}.0 \times 0.5168/0.5224$; red: $${f0}.0 \times 0.5168/0.5143$.`, 'Subtract the two.'],
          teach: 'Dispersion gives a simple lens a different focal length for each colour — chromatic aberration.',
          explain: t`$f_\text{blue} = ${tn(fF, 4)}$ mm and $f_\text{red} = ${tn(fC, 4)}$ mm: $${tn(df, 3)}$ mm apart, about 1.6% of $f$. With the detector at one focus, the other colours land as blurred rings around each star. Real trackers use achromatic lens groups — glasses of different dispersion cancelling — or mirrors, which reflect every colour alike.`,
          visual: crownCurve('The index of the lens glass across the spectrum: blue light (486 nm) meets a larger index than red (656 nm), so it focuses closer to the lens.', [[486, 'blue, 486 nm', 'accent'], [589, 'yellow, 589 nm', 'gold'], [656, 'red, 656 nm', 'bad']]),
        };
      },
    }),
    mcq({
      id: 'cp-cladding', difficulty: 2, transfer: true,
      prompt: t`A bare glass rod in air also traps light by total internal reflection (glass to air: $\theta_c \approx 42°$). Why do telecom fibres wrap the light-carrying core in a cladding of slightly lower index?`,
      choices: [
        'Anything touching a bare surface — dust, water, a support — would let light leak out there; the cladding keeps the reflecting boundary clean and buried',
        'Glass cannot reflect totally into air, so a second glass is needed',
        'The cladding has a higher index than the core, which is what traps the light',
        'The cladding absorbs the light that would otherwise reflect, cleaning up the signal',
      ],
      answer: 0,
      why: {
        1: 'It can: glass into air has a critical angle of about 42°.',
        2: 'Total internal reflection needs the outside index to be *lower*; the cladding is lower, by about 1%.',
        3: 'Light reflected at the core–cladding boundary is the signal; it is not absorbed.',
      },
      hints: ['Total internal reflection depends on what is on the other side of the surface. What could end up touching a bare rod?'],
      teach: 'Total internal reflection depends on the medium just outside the surface, so fibres bury that surface inside a cladding.',
      explain: 'A water droplet (n = 1.33) or a plastic support touching bare glass lowers the index difference — or reverses it — and light escapes at that spot. The cladding makes the reflecting boundary a permanent glass-to-glass interface that nothing can touch. Its small index step also keeps the acceptance angle small, which limits how many different zigzag paths (modes) the light can take, and so how much a short pulse spreads out over long distances.',
      visual: fibrePic({ nCore: 1.48, nClad: 1.46, angle: 10 }, 'A step-index fibre: the core, its cladding, and a protective jacket (cross-section, enormously widened).'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §1.4 Total Internal Reflection', url: 'https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection' },
    { label: 'OpenStax University Physics Vol. 3, §1.5 Dispersion', url: 'https://openstax.org/books/university-physics-volume-3/pages/1-5-dispersion' },
    { label: 'SCHOTT optical glass data sheets (N-BK7, F2): Sellmeier coefficients', url: 'https://www.schott.com/en-gb/products/optical-glass-p1000267' },
  ],
});
