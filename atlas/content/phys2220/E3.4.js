// Conductors in electrostatic equilibrium: the free charge in a metal moves
// until the field inside the metal is zero. Gauss's law then puts any net
// charge on the surface, makes the field outside perpendicular with E = σ/ε₀,
// and shields an empty cavity.
import { lesson, mcq, num } from '../../src/core/content.js';
import { K, EPS0, tn, s3, field, fieldLive } from './_efield.js';

const t = String.raw;

// the worked example: a neutral thick metal shell, a = 4.0 cm, b = 6.0 cm, +3.0 nC at its centre
const WX = { q: 3e-9, a: 0.04, b: 0.06 };
WX.sin = -WX.q / (4 * Math.PI * WX.a ** 2);
WX.sout = WX.q / (4 * Math.PI * WX.b ** 2);
WX.E2 = (K * WX.q) / 0.02 ** 2;
WX.E10 = (K * WX.q) / 0.1 ** 2;
WX.Eb = WX.sout / EPS0;
const ray = (r, deg = 35) => ({ x: +(r * Math.cos((deg * Math.PI) / 180)).toFixed(3), y: +(r * Math.sin((deg * Math.PI) / 180)).toFixed(3) });

// a solid disk of metal and a circle, for the hand-drawn pictures (radius 1)
const disk = { fn: 'sqrt(max(0, 1 - x^2))', lower: '-sqrt(max(0, 1 - x^2))', from: -1, to: 1, color: 'ink3', alpha: 0.35 };
const circle = (r, o = {}) => ({ param: [`${r}*cos(t)`, `${r}*sin(t)`], t: [0, 6.2832], color: 'ink2', width: 1.6, ...o });

// distinct, nonzero slips that are not the answer
const slips = (answer, list) => {
  const out = [];
  for (const e of list) if (Math.abs(e.value - answer) > 1e-9 * Math.max(1, Math.abs(answer)) && !out.some((o) => Math.abs(o.value - e.value) < 1e-12)) out.push(e);
  return out;
};

export default lesson({
  id: 'phys2220.E3.4',
  title: 'Conductors in electrostatic equilibrium',
  minutes: 14, difficulty: 3,
  intro: t`In a metal, some electrons are free to move. Put a piece of metal in a field and they drift, piling up on its surface, until the field of that surface charge cancels the applied field everywhere inside the metal. Then nothing moves: the conductor is in **electrostatic equilibrium**, and Gauss's law tells you the rest.

1. The field is zero everywhere inside the metal.
2. Any net charge sits on the surface: a Gaussian surface drawn inside the metal has no flux, so it encloses no net charge.
3. Just outside, the field is perpendicular to the surface, and its size is set by the surface charge right there:

$$E = \frac{\sigma}{\varepsilon_0}$$

4. An empty hole in the metal has no field in it, whatever is outside. A charge $q$ placed in the hole draws $-q$ onto the hole's wall, and the outer surface gains $+q$.`,
  symbols: [
    { tex: 'E', text: 'the size of the field just outside the conductor’s surface, in N/C; it points straight out of the surface (into it where σ is negative)' },
    { tex: '\\sigma', text: 'the surface charge density at that spot: charge per unit area, in C/m². It can differ from place to place on the surface' },
    { tex: '\\varepsilon_0', text: 'the permittivity of free space, $8.854\\times10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)$' },
    { tex: 'q', text: 'a charge in a hole (a cavity) inside the metal, in C' },
  ],
  why: 'Shielded cables, the metal boxes around sensitive electronics, and an airliner’s skin carrying a lightning strike around its passengers all work by these rules. They also set how much charge a smooth metal dome can hold before the air beside it sparks.',
  visual: {
    type: 'em-field',
    title: 'Metal in a field',
    lead: t`The grey sphere is metal; the + and − marks are the charge its free electrons have moved onto its surfaces (more marks where σ is larger). Drag the charges, the probe and the green Gaussian sphere.`,
    tasks: [
      'Charge in a hollow sphere: drag the charge around the hole. The charge on the hole’s wall follows it, but the outer surface’s charge stays evenly spread, and the field outside does not change at all.',
      'Resize the Gaussian sphere so that it lies wholly in the metal. The flux is zero, so the hole’s wall must carry exactly −3 nC.',
      'Neutral sphere in a uniform field: drag the probe into the metal — the field there is zero. Outside, every field line meets the surface at a right angle.',
    ],
    params: {
      unit: 'cm', x: [-10, 10], y: [-6, 6],
      presets: [
        { id: 'cavity', label: 'Charge in a hollow sphere', conductor: { x: 0, y: 0, R: 4.2, a: 2.8, Q: 0 }, charges: [{ x: 1.1, y: 0.6, q: 3 }], gauss: { shape: 'sphere', x: 0, y: 0, r: 3.5 }, probe: { x: 6.5, y: 3.5 } },
        { id: 'charged', label: 'Charged sphere and a charge', conductor: { x: -2.5, y: 0, R: 3, Q: 4 }, charges: [{ x: 5, y: 0, q: -3 }], gauss: { shape: 'sphere', x: -2.5, y: 0, r: 2.2 }, probe: { x: -2, y: 1.2 } },
        { id: 'field', label: 'Neutral sphere in a uniform field', conductor: { x: 0, y: 0, R: 3, Q: 0 }, uniform: [3000, 0], gauss: { shape: 'sphere', x: 0, y: 0, r: 2 }, probe: { x: 1.2, y: 1 } },
      ],
      preset: 'cavity', readouts: ['E', 'flux', 'Qenc'], arrows: false, fieldLines: true, density: 12,
    },
    caption: 'Charges in nC; the uniform field is 3000 N/C. The surface charges are exact (the method of image charges), and the flux is integrated numerically over the 3D Gaussian sphere.',
  },
  example: {
    prompt: t`A neutral metal shell has inner radius 4.0 cm and outer radius 6.0 cm. A $+3.0$ nC point charge sits at the centre of its hollow. Find (a) the charge and the surface charge density on the inner and the outer surface, and (b) the field 2.0 cm, 5.0 cm and 10 cm from the centre.`,
    visual: field({ unit: 'cm', x: [-12, 12], y: [-7.5, 7.5], conductor: { x: 0, y: 0, R: 6, a: 4, Q: 0 }, charges: [{ x: 0, y: 0, q: 3 }], fieldLines: true, density: 12, notes: { points: [{ ...ray(2), label: '2 cm', color: 'gold' }, { ...ray(5), label: '5 cm', color: 'gold' }, { ...ray(10), label: '10 cm', color: 'gold' }] } }, 'The shell in cross-section, with the charge it gathers on each surface and its field lines: they stop at the inner wall and start again at the outer surface. Gold dots: the three points.'),
    steps: [
      { label: 'In the metal', text: t`The field in the metal is zero, so a Gaussian sphere of radius 5.0 cm, lying in the metal, has no flux and encloses no net charge. It encloses the $+3.0$ nC, so the inner surface must carry $-3.0$ nC.` },
      { label: 'Outer surface', text: t`The shell is neutral: $-3.0$ nC on the inside leaves $+3.0$ nC on the outside. Spread over each sphere: $\sigma_\text{in} = \dfrac{-3.0\times10^{-9}}{4\pi(0.040)^2} = ${tn(WX.sin)}$ C/m², $\sigma_\text{out} = \dfrac{3.0\times10^{-9}}{4\pi(0.060)^2} = ${tn(WX.sout)}$ C/m².` },
      { label: 'Fields', text: t`At 2.0 cm a Gaussian sphere encloses only the point charge: $E = \dfrac{kq}{r^2} = \dfrac{(8.988\times10^{9})(3.0\times10^{-9})}{(0.020)^2} = ${tn(WX.E2)}$ N/C. At 5.0 cm, in the metal: $E = 0$. At 10 cm it encloses $3.0 - 3.0 + 3.0 = 3.0$ nC: $E = ${tn(WX.E10)}$ N/C, outward.` },
      { label: 'Check', text: t`Just outside the outer surface, $E = \sigma_\text{out}/\varepsilon_0 = ${tn(WX.Eb)}$ N/C, the same as $kq/b^2$. The metal does not hide the charge from the outside world: its field outside is just as if the shell were not there. Connecting the shell to the ground would let the outer $+3.0$ nC flow away; only then would the field outside vanish.` },
    ],
    answer: t`(a) Inner surface $-3.0$ nC, $\sigma = ${tn(WX.sin)}$ C/m²; outer surface $+3.0$ nC, $\sigma = ${tn(WX.sout)}$ C/m². (b) $${tn(WX.E2)}$ N/C, $0$, $${tn(WX.E10)}$ N/C.`,
  },
  practice: [
    mcq({
      id: 'why-zero', difficulty: 1,
      prompt: 'A metal sphere sits in a steady field. Why is the field zero everywhere inside the metal once things settle?',
      choices: [
        'Free electrons drift until the charge they pile up on the surface cancels the applied field inside; any field left would keep them moving',
        'The metal soaks up the field lines that enter it',
        'Because the sphere is electrically neutral',
        'It is not: it is zero only at the very centre',
      ],
      answer: 0,
      why: {
        1: 'Field lines are not a substance. The applied field still acts in the metal; it is cancelled there by the field of the induced surface charge.',
        2: 'A charged metal sphere has zero field inside too. Neutral or not, the free charge arranges itself on the surface until the field inside vanishes.',
        3: 'Any field at any point in the metal would push the free electrons there. Equilibrium needs E = 0 at every point inside.',
      },
      hints: ['What would the free electrons do if there were a field in the metal?'],
      teach: 'In equilibrium nothing in the metal moves, so the field in the metal must be zero: the induced surface charge cancels the applied field there.',
      explain: 'A field in the metal would push its free electrons, so in equilibrium there can be none. The electrons drift — almost instantly — until the charge they leave on the surface (− on one side, + on the other) makes a field that exactly cancels the applied one inside.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 3, Q: 0 }, uniform: [3000, 0], fieldLines: true, density: 14 }, 'A neutral metal sphere in a field pointing right: the induced surface charge, and the field lines outside.'),
    }),
    mcq({
      id: 'where-charge', difficulty: 1,
      prompt: 'You put an extra 5 nC on a solid metal sphere. Where is it once it settles?',
      choices: [
        'On the outer surface, spread evenly over it',
        'Spread evenly through the whole sphere, like charge on a plastic ball',
        'Gathered at the centre',
        'Mostly on the surface, with some left inside to keep the field there zero',
      ],
      answer: 0,
      why: {
        1: 'In the metal E = 0, so a Gaussian surface just beneath the surface has no flux and encloses no net charge. The plastic ball is different: its charge cannot move.',
        2: 'Like charges repel, and here they are free to move: they spread as far apart as they can, onto the surface.',
        3: 'Charge left inside would need flux around it, and flux needs a field — but the field in the metal is zero.',
      },
      hints: ['Draw a Gaussian surface just inside the metal’s surface. What is the field on it?'],
      teach: 'A conductor’s net charge lives on its surface: a Gaussian surface inside the metal has no flux, so it encloses no charge.',
      explain: 'The field everywhere in the metal is zero, so the flux through the dashed Gaussian surface — just beneath the surface, wholly in the metal — is zero, and it encloses no net charge. All 5 nC is on the surface; on an isolated sphere, by symmetry, spread evenly.',
      visual: {
        type: 'graph',
        params: {
          x: [-1.8, 1.8], y: [-1.2, 1.2], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
          shade: [disk],
          curves: [circle(1), circle(0.88, { color: 'good', width: 2.2, dash: true, label: 'Gaussian surface', labelAt: 5.6, labelDx: 8, labelDy: 10 })],
        },
        caption: 'The metal sphere (grey) and a Gaussian surface (green, dashed) just beneath its surface, wholly in the metal.',
      },
    }),
    num({
      id: 'sigma-to-E', difficulty: 2,
      gen(r) {
        const sig = r.pick([1.5, 2, 4, 8]), E = (sig * 1e-6) / EPS0;
        return {
          prompt: t`At one spot on a charged metal tank, the surface charge density is $${sig}\ \mu\text{C/m}^2$. How strong is the field just outside the tank, there?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: E / 2, feedback: t`That is the field of a thin sheet of charge, which points away on both sides: $\sigma/2\varepsilon_0$. A conductor has no field on its inner side, so all the flux goes out through one face: $E = \sigma/\varepsilon_0$.` }],
          hints: ['Use a small box (a pillbox) with one face in the metal and one face just outside.', t`Only the outside face has flux: $EA = \sigma A/\varepsilon_0$.`],
          teach: 'Just outside a conductor E = σ/ε₀: the pillbox’s face in the metal has no flux, so the outside face carries it all.',
          explain: t`The pillbox encloses charge $\sigma A$. Its face in the metal has no field and its sides lie along the field, so all the flux leaves through the outer face: $EA = \sigma A/\varepsilon_0$, and $E = \dfrac{${sig}\times10^{-6}}{8.854\times10^{-12}} = ${tn(E)}$ N/C, pointing straight out of the surface. (Twice a lone sheet's field: the conductor's charge sends all its flux one way.)`,
          visual: field({ unit: 'cm', x: [-5, 5], y: [-2.6, 3.6], conductor: { x: 0, y: -20, R: 20, Q: 750 }, gauss: { shape: 'box', x: 0, y: 0, w: 2.4, h: 1.6, depth: 2.4 }, fieldLines: true, density: 110 }, 'A small patch of the tank’s surface (grey: metal) and a pillbox (green) straddling it. The field lines leave the surface at right angles.'),
        };
      },
    }),
    num({
      id: 'surface-charges', difficulty: 2,
      gen(r) {
        let q, Q;
        do { q = r.pick([2, 3, -2]); Q = r.pick([0, 5, -1, 4]); } while (Q + q === 0 || Q === -2 * q);
        const out = Q + q;
        return {
          prompt: t`A metal shell carries a net charge of $${Q}$ nC. A $${q > 0 ? '+' : ''}${q}$ nC point charge is placed in its hollow, without touching it. How much charge ends up on the shell's outer surface?`,
          answer: out, units: 'nC', tol: { rel: 0, abs: 0.01 },
          errors: slips(out, [
            { value: Q, feedback: 'The shell’s own charge is not all of it: the charge in the hollow draws an equal and opposite charge onto the inner wall, and the shell must make that up from its outer surface.' },
            { value: Q - q, feedback: t`Check the sign. The inner wall takes $-q$; the shell's net charge is fixed, so the outer surface carries $Q - (-q) = Q + q$.` },
            { value: -q, feedback: t`$-q$ is on the inner wall. The outer surface carries the rest of the shell's charge.` },
          ]),
          hints: ['A Gaussian surface inside the metal has no flux: what charge must the inner wall carry?', t`Inner wall $+$ outer surface $=$ the shell's net charge.`],
          teach: 'A charge q in a conductor’s hollow puts −q on the hollow’s wall and leaves Q + q on the outer surface.',
          explain: t`A Gaussian surface in the metal encloses $q$ plus the inner wall's charge, and has no flux, so the inner wall carries $${-q}$ nC. The shell's net charge is $${Q}$ nC, so the outer surface carries $${Q} - (${-q}) = ${out}$ nC.`,
          visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 4.5, a: 3, Q }, charges: [{ x: 1.1, y: 0.5, q, label: 'q' }], fieldLines: false }, 'The shell (grey) in cross-section, with the point charge in its hollow.'),
        };
      },
    }),
    num({
      id: 'outside-shell', difficulty: 3,
      gen(r) {
        const q = r.pick([2, 4, 5]), a = r.pick([3, 4]), b = a + 1.5, d = 1.5, R = r.pick([8, 10, 12]);
        const E = (K * q * 1e-9) / (R / 100) ** 2;
        return {
          prompt: t`A neutral metal shell has inner radius ${a} cm and outer radius ${s3(b, 2)} cm. A $+${q}$ nC charge sits in its hollow, ${d} cm off-centre. How strong is the field at P, ${R} cm from the shell's centre, on the side toward which the charge is shifted?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [
            { value: (K * q * 1e-9) / ((R - d) / 100) ** 2, feedback: 'That measures from the charge. Outside, only the outer surface’s charge is felt, and it is spread evenly over the sphere: measure from the shell’s centre.' },
            { value: 0, feedback: 'A metal shell shields its hollow from charges outside it, but not the outside from a charge within: the outer surface carries +q.' },
          ],
          hints: [t`The inner wall's $-q$ cancels the field of $q$ everywhere outside the hollow — in the metal and beyond.`, t`So outside, only the outer surface's $+q$ counts, spread evenly over a sphere: $E = kq/r^2$ with $r$ from the centre.`],
          teach: 'Outside a closed conducting shell, the field of a charge in its hollow is that of the outer surface’s evenly spread charge: centred on the shell, wherever the charge sits.',
          explain: t`The inner wall's induced charge, $-${q}$ nC, arranges itself so that it and the point charge together make no field anywhere outside the hollow. The outer surface's $+${q}$ nC then feels nothing of where the charge sits and spreads evenly. So $E = \dfrac{kq}{r^2} = \dfrac{(8.988\times10^{9})(${q}\times10^{-9})}{(${R / 100})^2} = ${tn(E)}$ N/C — exactly as if the charge were at the centre.`,
          visual: field({ unit: 'cm', x: [-14, 14], y: [-8.75, 8.75], conductor: { x: 0, y: 0, R: b, a, Q: 0 }, charges: [{ x: d, y: 0, q }], probe: { x: R, y: 0, label: 'P' }, probeArrow: false, fieldLines: true, density: 12 }, 'The shell and the off-centre charge, with field lines and the induced surface charge.'),
        };
      },
    }),
    mcq({
      id: 'sketch-error', difficulty: 2, kind: 'error',
      prompt: 'A student sketches the field just outside a positively charged metal sphere, as shown. What is wrong with the sketch?',
      choices: [
        'The field lines must leave the metal at right angles: a field along the surface would push the free charges along it',
        'Field lines should not touch a conductor; they should curve around it',
        'The lines should carry on through the metal to the centre',
        'Nothing: the angle depends on where other charges are',
      ],
      answer: 0,
      why: {
        1: 'Field lines begin and end on charge — here on the surface charge itself. They do touch the metal, at right angles.',
        2: 'Inside the metal E = 0: field lines stop at the surface.',
        3: 'Other charges change how much charge sits where on the surface, and so how strong the field is there — never its angle. In equilibrium it is always perpendicular.',
      },
      hints: ['If the field just outside had a part along the surface, what would the free charges on the surface do?'],
      teach: 'In equilibrium the field at a conductor’s surface is perpendicular to it: any part along the surface would move the surface charge.',
      explain: 'The surface charge is free to slide along the surface. A field with a part along the surface would push it, so in equilibrium that part is zero and the field leaves the surface at a right angle — the size, σ/ε₀, can vary from place to place, but never the angle.',
      visual: {
        type: 'graph',
        params: {
          x: [-2.2, 2.2], y: [-1.6, 1.6], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
          shade: [disk], curves: [circle(1)],
          arrows: [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
            const a = (k * Math.PI) / 4 + Math.PI / 8, b = a + (40 * Math.PI) / 180;
            return { from: [+Math.cos(a).toFixed(3), +Math.sin(a).toFixed(3)], to: [+(Math.cos(a) + 0.55 * Math.cos(b)).toFixed(3), +(Math.sin(a) + 0.55 * Math.sin(b)).toFixed(3)], color: 'accent' };
          }),
        },
        caption: 'The student’s sketch: the charged metal sphere (grey) and the field (blue) just outside it.',
      },
    }),
    mcq({
      id: 'cavity-shield', difficulty: 2,
      prompt: 'A sensitive instrument sits at P, in an empty hollow inside a closed metal box. A strongly charged object is brought up outside. What field does the instrument feel?',
      choices: [
        'None: the charge induced on the box’s outer surface cancels the outside field everywhere within it',
        'A weaker field: the metal blocks part of it',
        'None, but only if the box is connected to the ground',
        'The same field as without the box: fields pass through metal',
      ],
      answer: 0,
      why: {
        1: 'The cancellation is exact, not partial: any field left in the metal would move charge until it was gone, and the empty hollow inside shares that zero.',
        2: 'Grounding changes how much charge the outer surface carries, not the field within. The hollow is field-free either way.',
        3: 'The field of the outside charge does reach in — but the induced surface charge’s field cancels it exactly.',
      },
      hints: ['The metal’s field is zero. Is there any charge in the hollow, or on its wall, to make a field there?'],
      teach: 'An empty hollow in a conductor is field-free, whatever charges sit outside: this is a Faraday cage.',
      explain: 'The outside charge induces − and + charge on the box’s outer surface, and their field cancels the outside charge’s field everywhere inside the outer surface — in the metal and in the hollow alike. The hollow holds no charge and its wall gathers none, so nothing else makes a field there: P feels none. This is a Faraday cage; screened rooms, cable shields and instrument cases work this way.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], conductor: { x: -2, y: 0, R: 4, a: 2.6, Q: 0 }, charges: [{ x: 5.5, y: 0.5, q: 4 }], probe: { x: -1.4, y: 0.7, label: 'P' }, probeArrow: false, fieldLines: false }, 'The metal box (drawn as a sphere, grey), the empty hollow with P in it, and the charged object outside.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-field-mill', difficulty: 2, transfer: true,
      gen(r) {
        const [E, when] = r.pick([[120, 'In fair weather the field is'], [2000, 'With a thunderstorm building nearby the field is'], [8000, 'Under a thunderstorm the field is']]);
        const A = r.pick([20, 50]), q = -EPS0 * E * A * 1e-4;
        return {
          prompt: t`Launch sites measure the field at the ground with field mills. A grounded metal sensor plate faces the sky; a spinning, grounded metal vane keeps covering and uncovering it. ${when} ${E} N/C, pointing down. How much charge gathers on the plate's ${A} cm² of exposed area while it is uncovered? Give the sign.`,
          answer: q / 1e-12, units: 'pC', tol: { rel: 0.01 },
          errors: [{ value: -q / 1e-12, feedback: 'The field points down, into the plate: field lines end on negative charge.' }],
          hints: [t`The plate is part of a conductor (the ground), so just above it $E = \sigma/\varepsilon_0$.`, t`$q = \sigma A = \varepsilon_0EA$, negative where the field points into the surface.`],
          teach: 'A grounded plate in a field E carries σ = ε₀E: a field mill measures E by collecting that charge.',
          explain: t`$|q| = \varepsilon_0EA = (8.854\times10^{-12})(${E})(${A}\times10^{-4}) = ${tn(-q / 1e-12)}$ pC, negative because the field ends on the plate. Covering the plate lets that charge flow back to the ground, so the spinning vane turns the field into an alternating current through a meter: a few picocoulombs each turn in fair weather. US launch rules hold a launch while nearby mills read more than about 1000 N/C.`,
          visual: field({ unit: 'cm', x: [-10, 10], y: [-3, 9], sheets: [{ x: 0, y: 0, angle: 0, sigma: -1 }], uniform: [0, -56.47], fieldLines: true, density: 14, ref: [0, 0], notes: { lines: [{ from: [-2.5, 0.25], to: [2.5, 0.25], color: 'gold', width: 5 }], points: [{ x: 0, y: 0.25, label: 'sensor plate', color: 'gold', r: 0.1, ldx: -36, ldy: 20 }] } }, 'The field at the ground, pointing down; the ground and the plate are conductors, so the field lines end on negative charge at their surface. The vane is not drawn.'),
        };
      },
    }),
    num({
      id: 'cp-breakdown', difficulty: 3, transfer: true,
      gen(r) {
        const R = r.pick([10, 15, 20, 25]), Eb = 3.0e6, Q = 4 * Math.PI * EPS0 * (R / 100) ** 2 * Eb;
        return {
          prompt: t`Dry air sparks over (breaks down) where the field reaches about $3.0\times10^{6}$ N/C. What is the most charge the smooth spherical metal dome of a Van de Graaff generator, ${R} cm in radius, can hold?`,
          answer: Q / 1e-6, units: 'μC', tol: { rel: 0.01 },
          errors: [{ value: (2 * Q) / 1e-6, feedback: t`That uses a lone sheet's $E = \sigma/2\varepsilon_0$. Just outside a conductor, $E = \sigma/\varepsilon_0$.` }],
          hints: [t`The field is strongest just outside the dome: $E = \sigma/\varepsilon_0$, with $\sigma = Q/4\pi R^2$.`, t`Set $E = 3.0\times10^{6}$ N/C and solve for $Q$: $Q = 4\pi\varepsilon_0R^2E$.`],
          teach: 'A smooth conductor sparks when σ/ε₀ at its surface reaches the breakdown field of the air around it; for a sphere that caps the charge at 4πε₀R² times that field.',
          explain: t`$\sigma_\text{max} = \varepsilon_0E_b = ${tn(EPS0 * Eb)}$ C/m², so $Q_\text{max} = 4\pi R^2\sigma_\text{max} = 4\pi(${R / 100})^2(${tn(EPS0 * Eb)}) = ${tn(Q / 1e-6)}$ μC. A bigger dome holds more, in proportion to its area. Electrostatic accelerators enclose their high-voltage terminal in a tank of pressurised sulfur hexafluoride, which withstands fields several times stronger.`,
          visual: field({ unit: 'cm', x: [-2.6 * R, 2.6 * R], y: [-1.6 * R, 1.6 * R], conductor: { x: 0, y: 0, R, Q: 1 }, fieldLines: true, density: 16 }, 'The charged dome and its field lines, crowded closest together right at its surface, where the air breaks down first.'),
        };
      },
    }),
    num({
      id: 'cp-shell', difficulty: 3,
      gen(r) {
        let q, Q;
        do { q = r.pick([-1, 2, -3]); Q = r.pick([4, 6, -2]); } while (Q + q === 0);
        const a = 3, b = r.pick([4, 5]), sig = (Q + q) * 1e-9 / (4 * Math.PI * (b / 100) ** 2);
        return {
          prompt: t`A metal shell with inner radius ${a} cm and outer radius ${b} cm carries a net charge of $${Q}$ nC. A $${q > 0 ? '+' : ''}${q}$ nC point charge sits in its hollow, off-centre. What is the surface charge density on the shell's outer surface?`,
          answer: sig / 1e-9, units: 'nC/m^2', tol: { rel: 0.01 },
          errors: slips(sig / 1e-9, [
            { value: (Q * 1e-9) / (4 * Math.PI * (b / 100) ** 2) / 1e-9, feedback: t`The hollow's charge $q$ draws $-q$ onto the inner wall, so the outer surface carries $Q + q$, not $Q$.` },
            { value: ((Q - q) * 1e-9) / (4 * Math.PI * (b / 100) ** 2) / 1e-9, feedback: t`Check the sign: the inner wall carries $-q$, so the outer surface carries $Q - (-q) = Q + q$.` },
            { value: ((Q + q) * 1e-9) / (4 * Math.PI * (a / 100) ** 2) / 1e-9, feedback: 'Spread it over the outer sphere, of radius b.' },
          ]),
          hints: ['First find the charge on the outer surface: the inner wall carries −q.', t`The outer charge $Q + q$ is spread evenly — even with $q$ off-centre — over $4\pi b^2$.`],
          teach: 'The outer surface of a closed shell carries Q + q, spread evenly however the charge in the hollow is placed.',
          explain: t`The inner wall carries $${-q}$ nC, so the outer surface carries $${Q} - (${-q}) = ${Q + q}$ nC. The wall's charge screens the hollow completely, so the outer charge spreads evenly: $\sigma = \dfrac{${Q + q}\times10^{-9}}{4\pi(${b / 100})^2} = ${tn(sig / 1e-9)}$ nC/m².`,
          visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: b, a, Q }, charges: [{ x: -1.2, y: 0.9, q, label: 'q' }], fieldLines: true, density: 12 }, 'The shell, its hollow and the off-centre charge, with field lines and induced surface charge.'),
        };
      },
    }),
    mcq({
      id: 'cp-ice-pail', difficulty: 2,
      prompt: 'A small metal ball carrying +5 nC hangs on an insulating thread. It is lowered through a narrow opening into a closed, uncharged metal can and touches the inside wall. When it is lifted out again, how much charge does it carry?',
      choices: [
        'None: all 5 nC passes to the can and ends up on its outer surface',
        'About 2.5 nC: touching shares the charge equally',
        'A little, in proportion to the ball’s size compared with the can',
        'All 5 nC: the −5 nC induced on the inside wall holds it in place',
      ],
      answer: 0,
      why: {
        1: 'Two equal spheres touching in the open share equally. Here the ball becomes part of the can’s inner wall, and an inner wall with nothing in the hollow carries no charge.',
        2: 'That sharing rule is for two separate conductors. Touching the inside wall, the ball is part of the hollow’s wall, where Gauss’s law allows no net charge.',
        3: 'On contact the ball’s +5 nC and the wall’s induced −5 nC cancel each other. The +5 nC already on the outer surface stays there.',
      },
      hints: ['Before contact: what charge sits on the inner wall, and on the outer surface?', 'After contact the ball is part of the wall of an empty hollow. What does a Gaussian surface in the metal say about it?'],
      teach: 'Charge delivered to the inside of a closed conductor ends up entirely on its outside.',
      explain: 'Before contact the ball induces −5 nC on the inner wall and +5 nC on the outer surface. On contact, the ball’s +5 nC and the wall’s −5 nC cancel; the ball is now part of an empty hollow’s wall, which a Gaussian surface in the metal shows has no net charge. The can is left with +5 nC on its outside, and the ball with none. Faraday showed this with an ice pail in 1843. A Van de Graaff generator works the same way: its belt carries charge inside the dome and leaves it there, so the dome keeps charging — until the air around it breaks down.',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-6, 6], conductor: { x: 0, y: 0, R: 4.6, a: 3.2, Q: 0 }, charges: [{ x: 0, y: 1.4, q: 5, label: 'ball' }], fieldLines: true, density: 12 }, 'Before contact: the ball in the closed can (cross-section), and the charge it induces on the can. The narrow opening is not drawn.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §6.4 Conductors in Electrostatic Equilibrium', url: 'https://openstax.org/books/university-physics-volume-2/pages/6-4-conductors-in-electrostatic-equilibrium' },
  ],
});
