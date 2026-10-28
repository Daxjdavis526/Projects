// Diffraction gratings: thousands of lines, bright maxima at d sin θ = mλ made
// sharp by the number of lines N, lines per millimetre, the highest order,
// white-light spectra and overlapping orders, and the resolving power
// R = λ/Δλ = mN — the sodium doublet, deuterium's discovery, and separating
// the two stars of a spectroscopic binary. Pictures from optics-waves (slits
// mode with many slits) and graph sketches drawn here.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, apart, asind, sind, slitsPic, seg, tag, r6 } from './_optics.js';

const t = String.raw;

/**
 * A grating from above (not to scale), lit straight on, with its bright beams at the angles where d sin θ = mλ for
 * d = ratio·λ. reflect: the beams come back on the light's side, as from a CD.
 */
function gratingGeom({ ratio = 2.4, reflect = false, name = 'grating: lines d apart', caption }) {
  const gx = reflect ? 5.6 : 0, s = reflect ? -1 : 1, R = 5.0, M = Math.floor(ratio);
  const curves = [seg([gx, -2.9], [gx, 2.9], { color: 'ink2', width: 2 })];
  for (let k = -11; k <= 11; k++) curves.push(seg([gx - 0.17, k * 0.25], [gx + 0.17, k * 0.25], { color: 'ink2', width: 1.3 }));
  const th1 = Math.asin(1 / ratio);
  curves.push({ param: [`${gx} + ${s * 2.1}*cos(t)`, '2.1*sin(t)'], t: [0, r6(th1)], color: 'violet', width: 1.6 });
  const arrows = [], points = [reflect ? tag(gx + 0.45, 2.7, name, 'ink2') : tag(gx - 0.45, 2.7, name, 'ink2', 'right')];
  if (reflect) {
    arrows.push({ from: [-0.4, 0.13], to: [gx - 0.25, 0.13], color: 'gold', width: 2.4 });
    points.push(tag(1.0, 0.55, 'light, λ', 'gold'));
  } else {
    arrows.push({ from: [-3.9, 0], to: [-0.3, 0], color: 'gold', width: 2.4 });
    points.push(tag(-3.9, 0.42, 'light, λ', 'gold'));
  }
  for (let m = -M; m <= M; m++) {
    const th = Math.asin(m / ratio), y0 = reflect && m === 0 ? -0.13 : 0;
    const tip = [r6(gx + s * R * Math.cos(th)), r6(y0 + R * Math.sin(th))];
    arrows.push({ from: [gx, y0], to: tip, color: m === 0 ? 'gold' : 'accent', width: m === 0 ? 1.6 : 2 });
    const lx = gx + s * (R + 0.35) * Math.cos(th), ly = y0 + (R + 0.35) * Math.sin(th);
    points.push(tag(lx, ly, `m = ${minus(m)}`, m === 0 ? 'gold' : 'accent', reflect ? 'right' : 'left'));
  }
  points.push(tag(gx + s * 2.45 * Math.cos(th1 / 2), 2.45 * Math.sin(th1 / 2), 'θ₁', 'violet', reflect ? 'right' : 'left'));
  return {
    type: 'graph',
    params: { x: reflect ? [-0.8, 7.6] : [-4.3, 7.3], y: [-4.9, 4.9], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', curves, arrows, points },
    caption,
  };
}

/** Two close spectral lines through gratings of N lines (one curve per N) in order m, around the pair. */
function twoLines({ l1, l2, m, N, caption }) {
  const dl = l2 - l1;
  const one = (n, l) => `(sin(${n}*pi*(${m}*x/${l} + 1e-9))/(${n}*sin(pi*(${m}*x/${l} + 1e-9))))^2`;
  return {
    type: 'graph',
    params: {
      aspect: 'wide', x: [r6(l1 - 2.2 * dl), r6(l2 + 2.2 * dl)], y: [0, 2.25], axesAt: 'edge',
      xlabel: 'place in the spectrum, labelled by wavelength (nm)', ylabel: 'brightness',
      curves: N.map((n, i) => ({ fn: `${one(n, l1)} + ${one(n, l2)}`, color: i ? 'gold' : 'accent', width: i ? 2 : 2.4 })),
      vlines: [{ x: l1, color: 'ink3' }, { x: l2, color: 'ink3' }],
    },
    caption,
  };
}

const minus = (m) => (m < 0 ? '−' + -m : String(m));

export default lesson({
  id: 'phys2220.O4.2',
  title: 'Diffraction gratings',
  minutes: 14, difficulty: 3,
  intro: t`A **diffraction grating** is a plate ruled with thousands of equally spaced lines — slits that let light through, or grooves that reflect it — a distance $d$ apart. As with two slits, light from neighbouring lines arrives in step where

$$d\sin\theta = m\lambda \qquad (m = 0, \pm1, \pm2, \ldots)$$

but with $N$ lines all in step, these **principal maxima** are $N$ times narrower, and between them almost nothing is left. The angle depends on $\lambda$, so a grating spreads mixed light into a spectrum in every order $m$ — which is why gratings sit inside most spectrometers. Gratings are labelled by their lines per millimetre: 600 lines/mm means $d = 1/600$ mm $= 1.67\ \mu$m.`,
  symbols: [
    { tex: 'd', text: 'the spacing between neighbouring lines, in m: one over the number of lines per metre' },
    { tex: '\\theta', text: 'the angle from the straight-through direction' },
    { tex: 'm', text: 'the order: 0 straight through; ±1, ±2, … on either side' },
    { tex: '\\lambda', text: 'the wavelength, in m' },
    { tex: 'N', text: 'the number of lines the light covers' },
    { tex: 'R = \\lambda/\\Delta\\lambda', text: 'the resolving power: two wavelengths $\\Delta\\lambda$ apart can just be told apart when $R = mN$' },
  ],
  why: t`Gratings read the light of the universe: a spectrograph's grating spreads starlight into the [spectral lines](#/lesson/phys2220.A1.1) that reveal a star's elements, its speed toward or away from us, and the planets tugging on it.`,
  visual: {
    type: 'optics-waves',
    title: 'From two slits to a grating',
    lead: t`The same picture as for two slits, with more of them: the pattern, its intensity against angle, and the phasors at the probe — one arrow per slit.`,
    tasks: [
      'Raise the number of slits from 2 to 20, keeping the spacing: the bright maxima stay at the same angles, d sin θ = mλ, but grow far narrower, with N − 2 faint maxima between each pair.',
      'With many slits, drag the probe just off a bright maximum: the phasors fan out round a polygon and nearly cancel. A tiny change of angle is enough, which is why a grating’s lines are sharp.',
      'Halve the spacing $d$: the orders move out to larger angles, and fewer of them fit before 90°.',
      'Switch to white light: each order becomes a spectrum, violet on the inside. The second and third orders overlap.',
    ],
    params: { mode: 'slits', N: 6, a: 0, d: 2, lambda: 633, controls: ['N', 'd', 'lambda', 'light'] },
  },
  example: {
    prompt: t`A grating with 600 lines per millimetre is lit by hydrogen's red line ($656.3$ nm) and its blue-green line ($486.1$ nm). (a) What is the spacing of its lines? (b) At what angles do the two lines appear in first order? (c) What is the highest order in which the red line appears?`,
    visual: slitsPic({ N: 12, a: 0, d: r6(1000 / 600), lambda: 656, marks: 'bright' }, 'The grating’s pattern for hydrogen’s red line, with its orders marked. Twelve slits are drawn; a real grating has thousands, making each maximum far sharper.'),
    steps: [
      { label: 'Spacing', text: t`$d = \dfrac{1}{600}$ mm $= 1.667\times10^{-6}$ m.` },
      { label: 'First order', text: t`$\sin\theta = \dfrac{\lambda}{d}$: for the red line $\dfrac{656.3}{1667} = 0.394$, so $\theta = 23.2°$; for the blue-green line $0.292$, so $\theta = 17.0°$. The two colours leave the grating $6.2°$ apart.` },
      { label: 'Highest order', text: t`$\sin\theta = m\lambda/d$ cannot exceed 1, so $m \le d/\lambda = 1667/656.3 = 2.54$. The red line appears in orders 1 and 2 (at $52.0°$); a third order would need $\sin\theta = 1.18$.` },
      { label: 'Sense check', text: t`In second order the two lines leave $16.3°$ apart, more than twice the first-order gap: higher orders spread the colours more, which measures wavelengths more finely, but fewer orders fit before $90°$.` },
    ],
    answer: t`(a) $1.67\ \mu\text{m}$; (b) $23.2°$ (red) and $17.0°$ (blue-green); (c) the second order.`,
  },
  practice: [
    num({
      id: 'first-order', difficulty: 1,
      gen(r) {
        const lpm = r.pick([300, 600, 1200]), lam = r.pick([450, 532, 633]);
        const dum = 1000 / lpm, s = lam / 1000 / dum, key = asind(s);
        return {
          prompt: t`Light of wavelength ${lam} nm falls straight onto a grating with ${lpm} lines per millimetre. At what angle is the first-order maximum?`,
          answer: key, units: 'deg', tol: { rel: 0.01 },
          errors: apart([
            { value: asind(lam * 1e-9 * lpm), feedback: t`The spacing is one over the number of lines per *metre*: ${lpm} lines/mm is ${lpm * 1000} lines/m, so $d = ${tn(dum)}\times10^{-6}$ m.` },
            { value: asind(2 * s), feedback: t`That is the second order. First order: $d\sin\theta = \lambda$.` },
          ], key),
          hints: [t`$d = \dfrac{1}{${lpm}}$ mm $= ${tn(dum)}\ \mu\text{m}$.`, t`First order: $\sin\theta = \lambda/d$.`],
          teach: 'A grating’s first order sits where neighbouring lines differ by one wavelength: d sin θ = λ, with d = 1/(lines per metre).',
          explain: t`$d = 1/${lpm}$ mm $= ${tn(dum)}\ \mu\text{m}$, so $\sin\theta = \dfrac{${lam}\times10^{-9}}{${tn(dum)}\times10^{-6}} = ${tn(s)}$ and $\theta = ${tn(key)}°$.`,
          visual: gratingGeom({ caption: 'A grating from above (not to scale): light from neighbouring lines is in step at the angles where d sin θ = mλ, one bright beam for each order m.' }),
        };
      },
    }),
    mcq({
      id: 'sharper', difficulty: 1,
      prompt: 'Two slits 2 µm apart give these broad fringes. Keeping the same spacing, you replace them with a grating of 1000 such slits. What happens to the bright maxima?',
      choices: [
        'They stay at the same angles but become far narrower and brighter',
        'They move closer together, since there are more slits',
        'They spread farther apart, since there are more slits',
        'They merge into one broad bright band',
      ],
      answer: 0,
      why: {
        1: 'Their angles come from d sin θ = mλ, and neither d nor λ has changed.',
        2: 'Their angles come from d sin θ = mλ, and neither d nor λ has changed: the maxima stay put.',
        3: 'The opposite: more slits make each maximum narrower, and the dark gaps between them wider.',
      },
      hints: ['Which quantities set the angles of the bright maxima?', 'What does adding slits do to the phasors just off a maximum?'],
      teach: 'More lines at the same spacing: the maxima keep their angles (d sin θ = mλ) but become N times narrower.',
      explain: t`At a principal maximum every slit's light arrives in step, wherever $d\sin\theta = m\lambda$ — that depends only on $d$ and $\lambda$. Just off it, the phasors from $N$ slits fan out; with 1000 slits they wrap round a closed polygon after an angle change only $1/1000$ as big. The maxima become narrow lines, with nearly all the light concentrated in them.`,
      visual: slitsPic({ N: 2, a: 0, d: 2, lambda: 633, axis: 'angle' }, 'Two narrow slits 2 µm apart: broad fringes.'),
    }),
    num({
      id: 'measure-lambda', difficulty: 2,
      gen(r) {
        const lpm = r.pick([600, 1200]);
        const [lam0, src] = r.pick([[532, 'a green laser pointer'], [405, 'a violet laser diode'], [589, 'a sodium street lamp'], [650, 'a red laser pointer']]);
        const dnm = 1e6 / lpm, th = Math.round(asind(lam0 / dnm) * 10) / 10;
        const key = dnm * sind(th);
        return {
          prompt: t`A student spectrometer has a grating with ${lpm} lines per millimetre. The first-order line from ${src} appears at ${th}°. What is its wavelength, in nm?`,
          answer: key, units: 'nm', tol: { rel: 0.005 },
          errors: apart([{ value: dnm * Math.tan(th * Math.PI / 180), feedback: t`The grating equation uses $\sin\theta$: $\lambda = d\sin\theta$.` }], key),
          hints: [t`$d = 1/${lpm}$ mm $= ${tn(dnm, 4)}$ nm.`, t`$\lambda = d\sin\theta$ in first order.`],
          teach: 'A grating turns an angle into a wavelength: λ = d sin θ / m.',
          explain: t`$\lambda = d\sin\theta = (${tn(dnm, 4)}\ \text{nm})\sin ${th}° = ${tn(key)}$ nm.`,
          visual: slitsPic({ N: 12, a: 0, d: r6(1000 / lpm), lambda: lam0, marks: 'bright' }, 'What the spectrometer sees: the line in each order, at the angles the grating equation gives (12 slits drawn).'),
        };
      },
    }),
    num({
      id: 'max-order', difficulty: 2,
      gen(r) {
        const [lpm, lam] = r.pick([[300, 450], [400, 650], [600, 450], [300, 633], [500, 532], [1200, 405]]);
        const dnm = 1e6 / lpm, ratio = dnm / lam, key = Math.floor(ratio);
        return {
          prompt: t`Light of wavelength ${lam} nm falls straight onto a grating with ${lpm} lines per millimetre. What is the highest order of bright maximum that leaves the grating?`,
          answer: key, tol: { rel: 0, abs: 0.1 },
          errors: [
            { value: key + 1, feedback: t`Round down: order ${key + 1} would need $\sin\theta = ${tn(((key + 1) * lam) / dnm)}$, more than 1.` },
            { value: 2 * key + 1, feedback: 'That counts every bright beam, on both sides and straight through. The question asks for the highest order.' },
          ],
          hints: [t`$\sin\theta = m\lambda/d$ can be at most 1.`, t`So $m \le d/\lambda$, rounded down.`],
          teach: 'Orders exist only while mλ/d ≤ 1: the highest is d/λ rounded down.',
          explain: t`$d = ${tn(dnm, 4)}$ nm, and $m \le \dfrac{d}{\lambda} = ${tn(ratio)}$: the highest order is $m = ${key}$, at $\theta = ${tn(asind((key * lam) / dnm))}°$. Counting both sides and the straight-through beam, ${2 * key + 1} bright beams emerge.`,
          visual: gratingGeom({ caption: 'An example with a different grating, d = 2.4λ: orders up to m = 2 leave it; a third would need sin θ = 3/2.4, more than 1. Not to scale.' }),
        };
      },
    }),
    num({
      id: 'overlap', difficulty: 2,
      gen(r) {
        const l2 = r.pick([600, 660, 690]), key = (2 * l2) / 3;
        return {
          prompt: t`In white light, a grating's second-order spectrum overlaps its third. Which wavelength in the third order lands at the same angle as ${l2} nm in the second?`,
          answer: key, units: 'nm', tol: { rel: 0.005 },
          errors: [{ value: 1.5 * l2, feedback: t`Higher order, shorter wavelength: at a given angle $m\lambda$ is fixed, so $3\lambda = 2(${l2}$ nm$)$.` }],
          hints: [t`At one angle, $d\sin\theta$ is fixed, so $m\lambda$ is the same for both orders.`, t`$3\lambda = 2\times${l2}$ nm.`],
          teach: 'At a given angle mλ is fixed: higher orders bring shorter wavelengths to the same place.',
          explain: t`$3\lambda = 2(${l2}\ \text{nm})$, so $\lambda = ${tn(key)}$ nm — whatever the grating. Spectrometers block the unwanted order with a filter, or use a second grating or prism to separate the orders.`,
          visual: slitsPic({ N: 12, a: 0, d: 2, light: 'white' }, 'A grating in white light: the first-order spectrum stands alone, but the second and third orders overlap.'),
        };
      },
    }),
    num({
      id: 'resolve', difficulty: 2,
      gen(r) {
        const [s1, s2, what, note] = r.pick([
          ['589.0', '589.6', 'the two yellow lines of sodium', ''],
          ['656.10', '656.28', 'the red lines of deuterium and ordinary hydrogen', ' Separating these two lines is how deuterium was discovered, in 1931.'],
          ['576.96', '579.07', 'mercury’s two yellow lines', ''],
        ]);
        const l1 = +s1, l2 = +s2;
        const m = r.pick([1, 2]), lav = (l1 + l2) / 2, dl = l2 - l1, R = lav / dl, key = R / m;
        const lo = Math.round(key / 2.5 / 10) * 10, hi = Math.round((key * 2.5) / 100) * 100;
        return {
          prompt: t`To separate ${what} (${s1} nm and ${s2} nm) in order $m = ${m}$, how many lines of a grating must the light cover, at least?`,
          answer: key, tol: { rel: 0.01 },
          errors: apart([
            { value: R, feedback: t`That is the resolving power $R = \lambda/\Delta\lambda$. With $R = mN$, order ${m} needs $N = R/${m}$.` },
            { value: 1 / R, feedback: t`Upside down: $R = \lambda/\Delta\lambda$ is a large number.` },
          ], key),
          hints: [t`$R = \lambda/\Delta\lambda$, using the average wavelength.`, t`$R = mN$.`],
          teach: 'A grating separates wavelengths Δλ apart when mN ≥ λ/Δλ.',
          explain: t`$R = \dfrac{\lambda}{\Delta\lambda} = \dfrac{${tn(lav, 4)}}{${tn(dl)}} = ${tn(R)}$, and $N = \dfrac{R}{m} = ${tn(key)}$ lines.${note}`,
          visual: twoLines({ l1, l2, m, N: [lo, hi], caption: `The two lines in order ${m}, seen through ${lo} grating lines (blue: blurred into one) and through ${hi} (gold: two clear peaks). Thin lines mark the two wavelengths.` }),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-second', difficulty: 2,
      gen(r) {
        const lpm = r.pick([300, 500, 600]), lam = r.pick([450, 589, 633]);
        const dnm = 1e6 / lpm, s = (2 * lam) / dnm, key = asind(s);
        return {
          prompt: t`At what angle does the second-order maximum of ${lam} nm light leave a grating with ${lpm} lines per millimetre?`,
          answer: key, units: 'deg', tol: { rel: 0.01 },
          errors: apart([{ value: asind(s / 2), feedback: 'That is the first order. Second order: d sin θ = 2λ.' }, { value: 2 * asind(s / 2), feedback: t`Angles do not double: $\sin\theta$ does. Use $\sin\theta = 2\lambda/d$.` }], key),
          hints: [t`$d\sin\theta = 2\lambda$.`],
          teach: 'Order m sits where d sin θ = mλ: it is sin θ, not θ, that grows in proportion to m.',
          explain: t`$d = ${tn(dnm, 4)}$ nm, so $\sin\theta = \dfrac{2(${lam})}{${tn(dnm, 4)}} = ${tn(s)}$ and $\theta = ${tn(key)}°$ — not twice the first-order angle of ${tn(asind(s / 2))}°.`,
          visual: gratingGeom({ caption: 'A grating from above (not to scale): each order’s beam leaves where d sin θ = mλ.' }),
        };
      },
    }),
    num({
      id: 'cp-binary', difficulty: 3, transfer: true,
      prompt: t`In a double star, one star moves along our line of sight 30 km/s faster than the other, so the Doppler effect separates their hydrogen lines by $\Delta\lambda = \lambda v/c$. To see the two lines separately in the second order of a spectrograph's grating, how many grating lines must the starlight cover, at least? (Take $c = 3.00\times10^5$ km/s.)`,
      answer: 5000, tol: { rel: 0.01 },
      errors: [
        { value: 10000, feedback: t`That is the resolving power $R = \lambda/\Delta\lambda = c/v$. In second order, $R = 2N$.` },
        { value: 20000, feedback: t`$R = mN$: in second order you need half of $R$, not twice.` },
      ],
      hints: [t`$R = \dfrac{\lambda}{\Delta\lambda} = \dfrac{c}{v}$.`, t`$N = R/m$ with $m = 2$.`],
      teach: 'To separate lines whose Doppler shifts differ by v, a grating needs mN ≥ c/v.',
      explain: t`$R = \dfrac{c}{v} = \dfrac{3.00\times10^5}{30} = 10\,000$, so $N = R/2 = 5000$ lines — a centimetre of a grating with 500 lines per mm. Planet-hunting spectrographs reach $R \approx 10^5$ and then go further, tracking the *positions* of thousands of lines to a tiny fraction of their width to detect stellar wobbles of a metre per second.`,
      visual: twoLines({ l1: 656.3, l2: r6(656.3 * (1 + 30 / 3e5)), m: 2, N: [2000, 12000], caption: 'The two stars’ hydrogen lines in second order, 0.066 nm apart: through 2000 grating lines (blue) they blur into one; through 12 000 (gold) they separate.' }),
    }),
    num({
      id: 'cp-cd', difficulty: 2, transfer: true,
      prompt: t`The rainbow on a CD comes from its spiral track: neighbouring turns are $1.6\ \mu$m apart and act as a reflection grating. A red laser pointer ($650$ nm) shines straight onto the disc. At what angle from the straight-back direction is the first-order reflection?`,
      answer: asind(0.65 / 1.6), units: 'deg', tol: { rel: 0.01 },
      errors: [{ value: asind(0.65 / 1.6 / 2), feedback: t`A reflection grating obeys the same rule as a transmission one: $d\sin\theta = m\lambda$, with no factor of 2.` }],
      hints: [t`$d\sin\theta = \lambda$, with $d = 1.6\ \mu$m.`],
      teach: 'Grooves that reflect light diffract it exactly like slits: d sin θ = mλ.',
      explain: t`$\sin\theta = \dfrac{0.650}{1.6} = 0.406$, so $\theta = ${tn(asind(0.65 / 1.6))}°$. A DVD's tracks are $0.74\ \mu$m apart, spreading its colours much farther; a Blu-ray's are only $0.32\ \mu$m apart — closer than any visible wavelength — so lit straight on it sends back no first order at all.`,
      visual: gratingGeom({ reflect: true, name: 'CD tracks, 1.6 µm apart', caption: 'Light reflecting from the tracks of a CD, seen from the side (not to scale): each order returns at its own angle.' }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 3, §4.4 Diffraction Gratings', url: 'https://openstax.org/books/university-physics-volume-3/pages/4-4-diffraction-gratings' },
    { label: 'Hecht, Optics (5th ed.), §10.2.8 The Diffraction Grating', url: 'https://www.pearson.com/en-us/subject-catalog/p/optics/P200000006793' },
    { label: 'Urey, Brickwedde & Murphy, “A Hydrogen Isotope of Mass 2”, Phys. Rev. 39, 164 (1932)', url: 'https://doi.org/10.1103/PhysRev.39.164' },
  ],
});
