// The potential of point charges: V = kq/r, zero far away; potentials of
// several charges simply add, as numbers; a pair of charges has potential
// energy kq₁q₂/r; a charged conducting sphere sits at kQ/R, inside and out.
import { lesson, mcq, num } from '../../src/core/content.js';
import { K, QE, MP, tn, s3, r6, field, fieldLive } from './_efield.js';

const t = String.raw;

// the worked example: +5.0 nC at the origin, −3.0 nC at (8.0 cm, 0), P at (0, 6.0 cm)
const WX = { q1: 5e-9, q2: -3e-9, r1: 0.06, r2: 0.1, d: 0.08 };
WX.V1 = (K * WX.q1) / WX.r1;
WX.V2 = (K * WX.q2) / WX.r2;
WX.V = WX.V1 + WX.V2;
WX.W = 1e-9 * WX.V;
WX.U = (K * WX.q1 * WX.q2) / WX.d;

// two spheres joined by a wire, drawn on a graph (radii 1 and 0.25)
const ball = (cx, R, color) => ({ fn: `sqrt(max(0, ${R * R} - (x - ${cx})^2))`, lower: `-sqrt(max(0, ${R * R} - (x - ${cx})^2))`, from: cx - R, to: cx + R, color, alpha: 0.4 });

export default lesson({
  id: 'phys2220.E4.2',
  title: 'Potential of point charges',
  minutes: 14, difficulty: 3,
  intro: t`Integrate the field of a point charge $q$ in from far away, and the potential a distance $r$ from it comes out as

$$V = \frac{kq}{r}$$

taking $V = 0$ infinitely far away. It is positive near a positive charge and negative near a negative one. For several charges the potentials simply **add** — as numbers with signs, not as vectors: $V = \sum kq_i/r_i$, and for a continuous charge, $V = \int k\,dq/r$. Two charges a distance $r$ apart have potential energy $U = kq_1q_2/r$: the work it took to bring them together from far apart. And a charged metal sphere is at $V = kQ/R$ — at its surface and everywhere inside, where the field is zero but the potential is not.`,
  symbols: [
    { tex: 'V', text: 'the potential at a point, in volts, measured from zero far away from all the charges' },
    { tex: 'k', text: 'Coulomb’s constant, $8.988\\times10^{9}\\ \\text{N·m}^2/\\text{C}^2$' },
    { tex: 'q', text: 'the charge, in C, with its sign' },
    { tex: 'r', text: 'the distance from the charge to the point, in m (not squared, as it is in the field)' },
    { tex: 'U = kq_1q_2/r', text: 'the potential energy of two charges a distance $r$ apart: positive for like charges, negative for opposite ones' },
  ],
  why: 'Adding numbers is far easier than adding vectors, so the potential is often the quickest route to the field (next lessons). And kq₁q₂/r sets the energy scale of atoms — 27 eV between the electron and proton of hydrogen — and of nuclei, where it decides how close a fast alpha particle can get.',
  visual: {
    type: 'em-field',
    title: 'Potential is a number at every point',
    lead: t`Drag the probe: it reads $V$ and $|\vec E|$ there. The lower graph shows $V$ along the horizontal line through the probe. Switch the equipotentials on.`,
    tasks: [
      'One charge: move the probe away. V falls as 1/r — far more slowly than E, which falls as 1/r².',
      'Two equal charges: put the probe exactly midway. E is zero there, but V is twice one charge’s potential: E = 0 does not mean V = 0.',
      'Dipole: anywhere on the line midway between the charges V = 0, yet E is not zero there.',
      'Charged metal sphere: drag the probe inside. E = 0, and V stays at its value on the surface, kQ/R.',
    ],
    params: {
      unit: 'cm', x: [-10, 10], y: [-5, 5],
      presets: [
        { id: 'one', label: 'One charge', charges: [{ x: 0, y: 0, q: 2 }], probe: { x: 4, y: 0.01 } },
        { id: 'pair', label: 'Two equal charges', charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: 2 }], probe: { x: 0, y: 0.01 } },
        { id: 'dipole', label: 'Dipole', charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: -2 }], probe: { x: 0, y: 2 } },
        { id: 'sphere', label: 'Charged metal sphere', conductor: { x: 0, y: 0, R: 3, Q: 4 }, probe: { x: 1, y: 0.01 } },
      ],
      preset: 'one', readouts: ['V', 'E'], toggles: ['equip', 'fieldLines'], equip: false, fieldLines: true, density: 12, profile: true, arrows: false, labels: true,
    },
    caption: 'Charges in nC, distances in cm; V is zero far away. The equipotentials are drawn at a tidy spacing in volts.',
  },
  example: {
    prompt: t`A $+5.0$ nC charge sits at the origin and a $-3.0$ nC charge at $x = 8.0$ cm. The point P is at $(0, 6.0\ \text{cm})$. Find (a) the potential at P, (b) the work needed to bring a $+1.0$ nC charge from far away to P, (c) the potential energy of the original pair.`,
    visual: field({ unit: 'cm', x: [-5, 13], y: [-3, 8.25], charges: [{ x: 0, y: 0, q: 5, label: '+5.0 nC' }, { x: 8, y: 0, q: -3, label: '−3.0 nC' }], probe: { x: 0, y: 6, label: 'P' }, probeArrow: false, fieldLines: false, equip: true, equipLabels: false, notes: { lines: [{ from: [0, 0], to: [0, 6], color: 'gold', dash: true }, { from: [8, 0], to: [0, 6], color: 'gold', dash: true }], points: [{ x: 0, y: 3, label: '6.0 cm', color: 'gold', r: 0.1, ldx: 6 }, { x: 4, y: 3, label: '10 cm', color: 'gold', r: 0.1, ldx: 6, ldy: -2 }] } }, 'The two charges, the point P, the distances from each, and the equipotentials (violet).'),
    steps: [
      { label: 'Distances', text: t`From the $+5.0$ nC charge to P: 6.0 cm. From the $-3.0$ nC charge: $\sqrt{8.0^2 + 6.0^2} = 10$ cm. Directions do not matter for $V$ — only distances.` },
      { label: '(a) Add', text: t`$V = \dfrac{kq_1}{r_1} + \dfrac{kq_2}{r_2} = \dfrac{(8.988\times10^{9})(5.0\times10^{-9})}{0.060} + \dfrac{(8.988\times10^{9})(-3.0\times10^{-9})}{0.10} = ${tn(WX.V1)} - ${tn(-WX.V2)} = ${tn(WX.V)}$ V.` },
      { label: '(b) Work', text: t`Carrying the charge in slowly from where $V = 0$, your work equals its gain in potential energy: $W = q\,V = (1.0\times10^{-9})(${tn(WX.V)}) = ${tn(WX.W)}$ J.` },
      { label: '(c) The pair', text: t`$U = \dfrac{kq_1q_2}{r_{12}} = \dfrac{(8.988\times10^{9})(5.0\times10^{-9})(-3.0\times10^{-9})}{0.080} = ${tn(WX.U)}$ J. Negative: opposite charges attract, so pulling them apart takes work.` },
      { label: 'Compare', text: t`The field at P would have needed two vectors, each with its own direction, resolved into components. The potential took two numbers and one addition.` },
    ],
    answer: t`(a) $${tn(WX.V)}$ V; (b) $${tn(WX.W)}$ J; (c) $${tn(WX.U)}$ J.`,
  },
  practice: [
    num({
      id: 'point-V', difficulty: 1,
      gen(r) {
        const q = r.pick([2, -3, 5, -8]), d = r.pick([3, 5, 10, 20]), V = (K * q * 1e-9) / (d / 100);
        return {
          prompt: t`What is the potential ${d} cm from a $${q > 0 ? '+' : ''}${q}$ nC point charge, taking $V = 0$ far away?`,
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: [{ value: (K * q * 1e-9) / (d / 100) ** 2, feedback: t`That is the field's size, $kq/r^2$. The potential falls off as $1/r$.` }],
          hints: [t`$V = kq/r$, with $r$ in metres and $q$ with its sign.`],
          teach: 'The potential of a point charge is kq/r: it keeps the sign of the charge and falls off as 1/r.',
          explain: t`$V = \dfrac{kq}{r} = \dfrac{(8.988\times10^{9})(${q}\times10^{-9})}{${d / 100}} = ${tn(V)}$ V${q < 0 ? ' — negative, near a negative charge' : ''}.`,
          visual: field({ unit: 'cm', x: [-25, 25], y: [-15.6, 15.6], charges: [{ x: 0, y: 0, q }], probe: { x: d, y: 0, label: 'P' }, probeArrow: false, fieldLines: false, equip: true, equipLabels: false }, 'The charge, the point P and the equipotentials (violet): circles around the charge, crowded close to it.'),
        };
      },
    }),
    num({
      id: 'centre-square', difficulty: 2,
      gen(r) {
        const q = r.pick([2, 3]), a = r.pick([4, 6]), V = (4 * K * q * 1e-9) / (a / 100 / Math.SQRT2);
        return {
          prompt: t`Four equal charges, $+${q}$ nC each, sit at the corners of a square of side ${a} cm. The field at the square's centre is zero. What is the potential there?`,
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: [
            { value: 0, feedback: 'The four fields cancel at the centre, but potentials are numbers, not vectors: four positive potentials add up.' },
            { value: (4 * K * q * 1e-9) / (a / 100), feedback: t`Each corner is half a diagonal from the centre: $a/\sqrt2$, not $a$.` },
          ],
          hints: [t`Each corner is $a/\sqrt2$ from the centre.`, t`$V = 4\cdot\dfrac{kq}{a/\sqrt2}$ — potentials add as numbers.`],
          teach: 'Potentials add as numbers: where fields cancel, the potential need not be zero.',
          explain: t`Each corner is $${a}/\sqrt2 = ${s3(a / Math.SQRT2, 3)}$ cm from the centre, so $V = 4\cdot\dfrac{(8.988\times10^{9})(${q}\times10^{-9})}{${s3(a / 100 / Math.SQRT2, 4)}} = ${tn(V)}$ V. E is zero there because the four fields point in four opposite directions; V is a number with no direction, and four positive numbers do not cancel.`,
          visual: field({ unit: 'cm', x: [-a, a], y: [-0.625 * a, 0.625 * a], axes: false, grid: false, charges: [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => ({ x: (sx * a) / 2, y: (sy * a) / 2, q })), probe: { x: 0, y: 0.001, label: 'P' }, probeArrow: false, fieldLines: true, density: 8 }, 'The four charges, their field lines and the centre P, where the field is zero.'),
        };
      },
    }),
    {
      type: 'point', id: 'zero-V', difficulty: 2,
      prompt: t`A $+2.0$ nC charge sits at $x = 0$ and a $-4.0$ nC charge at $x = 9.0$ cm. Drag the probe to the point **between them** where the potential is zero.`,
      instruction: 'Drag the gold probe to where V = 0 between the charges, then check.',
      answer: { x: 3, y: 0 }, tol: { x: 0.3, y: 0.3 },
      visual: fieldLive({ unit: 'cm', x: [-3, 12], y: [-4, 4], charges: [{ x: 0, y: 0, q: 2, label: '+2.0 nC', drag: false }, { x: 9, y: 0, q: -4, label: '−4.0 nC', drag: false }], probe: { x: 6, y: 2.5 }, probeArrow: false, fieldLines: false }, 'The two charges on the x axis (in cm). The probe shows no readout: work out where the potentials cancel.'),
      hints: [
        'Between the charges, the + charge’s potential is positive and the − charge’s negative: they cancel where they are equal in size.',
        t`At distance $x$ from the $+2.0$ nC charge: $\dfrac{k(2.0)}{x} = \dfrac{k(4.0)}{9.0 - x}$.`,
      ],
      teach: 'V = 0 where the positive and negative charges’ potentials are equal in size: closer to the smaller charge.',
      explain: t`$2.0(9.0 - x) = 4.0x$ gives $x = 3.0$ cm, a third of the way along. The field there is anything but zero: both charges push a test charge the same way, toward the $-4.0$ nC. (V is also zero at $x = -9.0$ cm, and on a whole sphere around the smaller charge.)`,
    },
    num({
      id: 'hydrogen', difficulty: 2,
      gen(r) {
        const n = r.pick([1, 2, 3]), d = n * n * 5.29e-11, U = (-K * QE * QE) / d;
        return {
          prompt: t`In the Bohr model of the hydrogen atom, the electron in orbit number $n = ${n}$ circles the proton at a distance of $${tn(d)}$ m. What is the potential energy of the pair, in eV?`,
          answer: U / QE, units: 'eV', tol: { rel: 0.01 },
          errors: [{ value: -U / QE, feedback: 'Opposite charges: q₁q₂ is negative, so U is negative — it takes work to pull them apart.' }],
          hints: [t`$U = kq_1q_2/r$ with $q_1 = +e$ and $q_2 = -e$.`, t`Divide joules by $1.602\times10^{-19}$ to get eV.`],
          teach: 'Two opposite charges have negative potential energy kq₁q₂/r: energy must be supplied to separate them.',
          explain: t`$U = \dfrac{k(+e)(-e)}{r} = -\dfrac{(8.988\times10^{9})(1.602\times10^{-19})^2}{${tn(d)}} = ${tn(U)}$ J $= ${tn(U / QE)}$ eV. On its circular orbit the electron also has kinetic energy, half as much in size, so the atom's total energy is $${tn(U / QE / 2)}$ eV: ${tn(-U / QE / 2)} eV is what it takes to ionise it from this orbit.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 0.6], y: [-40, 5], aspect: 'wide', xlabel: 'distance between the electron and the proton (nm)', ylabel: 'U (eV)',
              curves: [{ fn: '-1.4398/max(x, 0.005)', domain: [0.03, 0.6], color: 'accent', width: 2.4 }],
              vlines: [{ x: r6(d * 1e9), label: `n = ${n}` }],
              hlines: [{ y: 0 }],
            },
            caption: 'The potential energy of an electron and a proton against their distance: zero far apart, falling steeply as they approach. The dashed line marks the orbit in the question.',
          },
        };
      },
    }),
    num({
      id: 'assemble', difficulty: 3,
      gen(r) {
        const [q1, q2, q3] = r.pick([[2, 2, 2], [3, 3, -2], [4, -1, -1]]), a = r.pick([3, 5]);
        const S = q1 * q2 + q1 * q3 + q2 * q3, U = (K * S * 1e-18) / (a / 100);
        return {
          prompt: t`How much work does it take to assemble charges of $${q1 > 0 ? '+' : ''}${q1}$, $${q2 > 0 ? '+' : ''}${q2}$ and $${q3 > 0 ? '+' : ''}${q3}$ nC, brought in from far apart, at the corners of an equilateral triangle of side ${a} cm?`,
          answer: U, units: 'J', tol: { rel: 0.01 },
          errors: [
            { value: 2 * U, feedback: 'Each pair counts once: three charges make three pairs, not six.' },
            { value: (K * (q1 * q2 + q1 * q3) * 1e-18) / (a / 100), feedback: 'Do not forget the pair that does not include the first charge: three pairs in all.' },
          ],
          hints: ['Bring the charges in one at a time: the first costs nothing, the second works against the first, the third against both.', t`Total: $U = k(q_1q_2 + q_1q_3 + q_2q_3)/a$.`],
          teach: 'The energy of a group of charges is the sum of kqᵢqⱼ/r over every pair, each counted once.',
          explain: t`$U = \dfrac{k(q_1q_2 + q_1q_3 + q_2q_3)}{a} = \dfrac{(8.988\times10^{9})(${S}\times10^{-18})}{${a / 100}} = ${tn(U)}$ J.${U < 0 ? ' Negative: the arrangement holds itself together — taking it apart would cost that much.' : ' Positive: like charges must be pushed together.'}`,
          visual: field({ unit: 'cm', x: [-a, a], y: [-0.625 * a, 0.625 * a], axes: false, grid: false, labels: true, charges: [[0, 0.577], [-0.5, -0.289], [0.5, -0.289]].map(([x, y], k) => ({ x: r6(x * a), y: r6(y * a), q: [q1, q2, q3][k] })), fieldLines: false, notes: { lines: [[[0, 0.577], [-0.5, -0.289]], [[-0.5, -0.289], [0.5, -0.289]], [[0.5, -0.289], [0, 0.577]]].map(([p, q2_]) => ({ from: [r6(p[0] * a), r6(p[1] * a)], to: [r6(q2_[0] * a), r6(q2_[1] * a)], color: 'ink3', dash: true })) } }, `The three charges, ${a} cm apart (labelled in nC).`),
        };
      },
    }),
    num({
      id: 'sphere-centre', difficulty: 2,
      gen(r) {
        const Q = r.pick([10, 20, 30]), R = r.pick([10, 15, 25]), V = (K * Q * 1e-9) / (R / 100);
        return {
          prompt: t`A hollow metal sphere of radius ${R} cm carries $${Q}$ nC. What is the potential at its centre?`,
          answer: V, units: 'V', tol: { rel: 0.01 },
          errors: [
            { value: 0, feedback: 'The field inside is zero, so V does not change from the surface inward: it stays at the surface value kQ/R. E = 0 does not mean V = 0.' },
            { value: (K * Q * 1e-9) / (R / 100) ** 2, feedback: 'That is the field just outside the surface, kQ/R². The potential is kQ/R.' },
          ],
          hints: [t`Outside, the sphere's potential is that of a point charge at its centre: $kQ/r$. At the surface, $kQ/R$.`, 'Inside, E = 0: moving inward changes V by nothing.'],
          teach: 'A charged conductor is at one potential throughout: for a sphere, kQ/R at the surface and everywhere inside.',
          explain: t`At the surface $V = kQ/R = \dfrac{(8.988\times10^{9})(${Q}\times10^{-9})}{${R / 100}} = ${tn(V)}$ V. Inside, $E = 0$, so $\Delta V = -\int\vec E\cdot d\vec s = 0$: the centre is at the same $${tn(V)}$ V.`,
          visual: field({ unit: 'cm', x: [-2.2 * R, 2.2 * R], y: [-1.375 * R, 1.375 * R], conductor: { x: 0, y: 0, R, a: r6(0.9 * R), Q }, probe: { x: 0.001, y: 0, label: 'centre' }, probeArrow: false, fieldLines: false, equip: true, equipLabels: false }, 'The charged hollow sphere in cross-section, its equipotentials outside (violet) and its centre.'),
        };
      },
    }),
    num({
      id: 'release', difficulty: 2,
      gen(r) {
        const Q = r.pick([5, 10]), d = r.pick([1, 2, 5]), v = Math.sqrt((2 * K * Q * 1e-9 * QE) / (MP * (d / 100)));
        return {
          prompt: t`A proton is released from rest ${d} cm from a fixed $+${Q}$ nC charge. How fast is it moving when it is very far away?`,
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt((K * Q * 1e-9 * QE) / (MP * (d / 100))), feedback: t`Kinetic energy is $\tfrac12mv^2$: $v = \sqrt{2U/m}$.` }],
          hints: [t`All of its starting potential energy, $U = kQe/r$, becomes kinetic energy far away (where $U = 0$).`, t`$\tfrac12mv^2 = kQe/r$.`],
          teach: 'Released from rest, a charge flying off to infinity turns its whole potential energy kQq/r into kinetic energy.',
          explain: t`$U = \dfrac{kQe}{r} = \dfrac{(8.988\times10^{9})(${Q}\times10^{-9})(1.602\times10^{-19})}{${d / 100}} = ${tn((K * Q * 1e-9 * QE) / (d / 100))}$ J, so $v = \sqrt{2U/m} = ${tn(v)}$ m/s. It gains most of that speed in the first few centimetres, where V falls fastest.`,
          visual: field({ unit: 'cm', x: [-6, 18], y: [-7.5, 7.5], charges: [{ x: 0, y: 0, q: Q, label: `+${Q} nC` }], fieldLines: true, density: 12, particle: { kind: 'proton', x: d, y: 0, speed: 0, path: true } }, 'The fixed charge and the proton’s path (gold), straight out along a field line.'),
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rutherford', difficulty: 3, transfer: true,
      gen(r) {
        const [Kmev, Z, name] = r.pick([[7.7, 79, 'gold'], [5.0, 79, 'gold'], [7.7, 47, 'silver']]);
        const d = (K * 2 * Z * QE * QE) / (Kmev * 1e6 * QE);
        return {
          prompt: t`An alpha particle (charge $+2e$) with ${Kmev} MeV of kinetic energy heads straight for a ${name} nucleus (charge $+${Z}e$), which barely moves. How close does it get before it stops and turns back? Give the answer in femtometres ($1\ \text{fm} = 10^{-15}$ m).`,
          answer: d * 1e15, units: 'fm', tol: { rel: 0.01 },
          errors: [{ value: (K * Z * QE * QE) / (Kmev * 1e6 * QE) * 1e15, feedback: 'The alpha particle carries 2e, not e.' }],
          hints: [t`At the closest point all of its kinetic energy has become potential energy: $K = \dfrac{k(2e)(${Z}e)}{d}$.`, t`Write $K$ in joules: ${Kmev} MeV $= ${Kmev}\times10^{6}\times1.602\times10^{-19}$ J.`],
          teach: 'A charged particle fired straight at another stops where its kinetic energy equals kq₁q₂/d.',
          explain: t`$d = \dfrac{k(2e)(${Z}e)}{K} = \dfrac{(8.988\times10^{9})(2)(${Z})(1.602\times10^{-19})^2}{(${Kmev}\times10^{6})(1.602\times10^{-19})} = ${tn(d)}$ m $= ${tn(d * 1e15)}$ fm. The ${name} nucleus is only about ${name === 'gold' ? 7 : 6} fm in radius, so the alpha particle never touches it: Geiger and Marsden's alpha particles bounced off gold nuclei by electric repulsion alone, which is how Rutherford could work out that the nucleus is tiny.`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 100], y: [0, 40], aspect: 'wide', xlabel: 'distance from the nucleus (fm)', ylabel: 'U (MeV)',
              curves: [{ fn: `${r6(2 * Z * 1.43996)}/max(x, 0.5)`, domain: [2, 100], color: 'accent', width: 2.4 }],
            },
            caption: `The alpha particle’s potential energy against its distance from the ${name} nucleus. It climbs this hill until its kinetic energy runs out.`,
          },
        };
      },
    }),
    mcq({
      id: 'cp-wicks', difficulty: 2, transfer: true,
      prompt: 'Two metal spheres, of radius 20 cm and 1.0 cm, far apart, are joined by a thin wire and given some charge. Which has the stronger field at its surface?',
      choices: [
        'The small one, 20 times stronger: both are at the same potential, so each one’s charge is in proportion to its radius',
        'The large one: it holds 20 times more charge',
        'Equal: they are at the same potential',
        'Equal: charge spreads evenly over a conductor',
      ],
      answer: 0,
      why: {
        1: 'It does hold 20 times more charge — spread over 400 times more area. Its σ, and so its surface field, is 20 times smaller.',
        2: 'The same potential, kQ/R, does not mean the same field, kQ/R²: the field depends on the radius too.',
        3: 'Over one isolated sphere, yes. Over this joined pair, the charge per unit area is 20 times higher on the small sphere.',
      },
      hints: ['Joined, they come to the same potential: kQ₁/R₁ = kQ₂/R₂.'],
      teach: 'On a conductor at one potential, the surface field is strongest where the surface curves most tightly: σ and E grow as 1/R.',
      explain: 'Joined by the wire, both are at one potential: kQ₁/R₁ = kQ₂/R₂, so Q ∝ R. The surface field kQ/R² is then ∝ 1/R: 20 times stronger on the small sphere. A sharp point is a sphere of tiny radius, so the field there can exceed the air’s breakdown field and the charge leaks off as a corona. Aircraft carry static dischargers — thin rods with sharp tips on the wings and tail — so the charge they pick up in flight bleeds away quietly instead of sparking and jamming the radios.',
      visual: {
        type: 'graph',
        params: {
          x: [-1.4, 4.2], y: [-1.3, 1.3], equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide',
          shade: [ball(0, 1, 'ink3'), ball(3.3, 0.25, 'ink3')],
          curves: [{ param: ['1 + 2.05*t', '0'], t: [0, 1], color: 'ink2', width: 1.6 }],
          points: [{ x: 0, y: 0, r: 0.01, label: 'R = 20 cm', color: 'ink', labelDx: -28, labelDy: 4 }, { x: 3.3, y: 0.3, r: 0.01, label: 'R = 1.0 cm', color: 'ink', labelDx: -26, labelDy: -6 }, { x: 2.1, y: 0, r: 0.01, label: 'wire', color: 'ink2', labelDx: -10, labelDy: -8 }],
        },
        caption: 'The two spheres joined by a wire. Not to scale: the small sphere is drawn larger than it is, and the two are really far apart.',
      },
    }),
    mcq({
      id: 'cp-zero-V', difficulty: 2,
      prompt: t`On the line midway between the two charges of a dipole, $V = 0$. What is true at the point P on that line?`,
      choices: [
        'Carrying a test charge in from far away to P takes no net work',
        'The field at P is zero',
        'A charge placed at P feels no force',
        'There is no charge close enough to P to matter',
      ],
      answer: 0,
      why: {
        1: 'V is zero at P, but it changes as you move toward either charge: the field points straight across the line, from + toward −.',
        2: 'Force follows the field, and the field at P is not zero.',
        3: 'Both charges matter: their potentials, +kq/r and −kq/r, are equal and opposite at P and add to zero.',
      },
      hints: ['V = 0 tells you about energy. What tells you about force?'],
      teach: 'V = 0 at a point says nothing about the field there: the field is how fast V changes, not V itself.',
      explain: 'With V = 0 at P and far away, bringing a test charge from far away to P takes no net work. But the field at P is how V changes from point to point, and V rises toward the + charge and falls toward the − charge: the field at P points from + toward −, and a charge there is pushed. (Just as E = 0 between two like charges does not make V zero there.)',
      visual: field({ unit: 'cm', x: [-10, 10], y: [-5, 5], charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: -2 }], probe: { x: 0, y: 3.4, label: 'P' }, probeArrow: false, fieldLines: false, equip: true, levels: [-1200, -600, -300, 0, 300, 600, 1200] }, 'A dipole, its equipotentials (violet, labelled in volts) and the point P on the 0 V line.'),
    }),
    num({
      id: 'cp-vdg', difficulty: 2, transfer: true,
      gen(r) {
        const R = r.pick([10, 20, 30]), V = 3.0e6 * (R / 100);
        return {
          prompt: t`The air around a Van de Graaff generator's smooth spherical dome, ${R} cm in radius, breaks down when the field at the dome's surface reaches $3.0\times10^{6}$ V/m. What is the highest potential the dome can reach?`,
          answer: V / 1000, units: 'kV', tol: { rel: 0.01 },
          errors: [{ value: (3.0e6 / (R / 100)) / 1000, feedback: t`At the surface $V = kQ/R$ and $E = kQ/R^2$, so $V = ER$ — multiply by the radius.` }],
          hints: [t`At the surface, $V = kQ/R$ and $E = kQ/R^2$.`, t`So $V = ER$.`],
          teach: 'A charged sphere’s potential and surface field are tied by V = ER: a bigger dome reaches a higher voltage before the air breaks down.',
          explain: t`$V = ER = (3.0\times10^{6})(${R / 100}) = ${tn(V)}$ V $= ${tn(V / 1000)}$ kV. To go higher you need a bigger dome — or a better insulator around it: electrostatic accelerators that reach tens of megavolts put huge terminals inside tanks of pressurised insulating gas.`,
          visual: field({ unit: 'cm', x: [-2.6 * R, 2.6 * R], y: [-1.625 * R, 1.625 * R], conductor: { x: 0, y: 0, R, Q: 1 }, fieldLines: true, density: 16, equip: true, equipLabels: false }, 'The charged dome, its field lines and its equipotentials (violet, dashed), crowded closest together at the surface.'),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §7.3 Calculations of Electric Potential', url: 'https://openstax.org/books/university-physics-volume-2/pages/7-3-calculations-of-electric-potential' },
  ],
});
