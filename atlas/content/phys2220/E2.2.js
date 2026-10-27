// Fields of point charges and dipoles: kq/r² from each charge, added as
// vectors; the dipole p = qd, whose far field falls off as 1/r³; the torque a
// uniform field exerts on a dipole.
import { lesson, mcq, num } from '../../src/core/content.js';
import { K, tn, s3, field, fieldLive } from './_efield.js';

const t = String.raw;
const deg = (a) => (a * Math.PI) / 180;

// the worked example: +4.0 nC and −4.0 nC, 6.0 cm apart; P on the bisector, 4.0 cm out
const WX = { q: 4e-9, r: 0.05 };
WX.E1 = (K * WX.q) / WX.r ** 2;
WX.E = 2 * WX.E1 * 0.6;
WX.p = WX.q * 0.06;
WX.far = (K * WX.p) / 0.04 ** 3;

const MOLECULES = [['water', 6.2e-30], ['ammonia', 4.9e-30], ['hydrogen chloride', 3.6e-30]];

export default lesson({
  id: 'phys2220.E2.2',
  title: 'Fields of point charges and dipoles',
  minutes: 12, difficulty: 2,
  intro: t`The field of a point charge $q$ points straight away from it (toward it, if $q$ is negative) and falls off as the inverse square of the distance. With several charges, each makes its own field as if the others were not there, and the fields **add as vectors**:

$$\vec E = \sum_i \frac{k\,q_i}{r_i^2}\,\hat r_i$$

An equal and opposite pair of charges a small distance apart is an **electric dipole**. Close to it you see two charges; far away their fields nearly cancel, and what is left falls off as $1/r^3$ — faster than either charge's field alone. Molecules such as water are dipoles, and dipoles are how matter responds to a field.`,
  symbols: [
    { tex: 'k', text: 'the Coulomb constant, $8.988\\times10^{9}\\ \\text{N·m}^2/\\text{C}^2$ (it is $1/4\\pi\\varepsilon_0$)' },
    { tex: 'q_i', text: 'the $i$-th charge, in C, with its sign' },
    { tex: 'r_i', text: 'the distance from charge $i$ to the point where you want the field, in m' },
    { tex: '\\hat r_i', text: 'a unit vector (length 1) pointing from charge $i$ to that point: with a positive $q_i$ the field points along it, with a negative $q_i$ against it' },
    { tex: '\\sum_i', text: 'add the vectors from every charge — component by component, never by adding sizes' },
    { tex: '\\vec p = q\\vec d', text: 'the dipole moment of charges $\\pm q$ a distance $d$ apart, in C·m, pointing from the − charge to the + charge' },
  ],
  why: 'Superposition is the organising principle of electrostatics: once you can add the fields of point charges, every other field in this course is a sum (or an integral) of them.',
  visual: {
    type: 'em-field',
    title: 'Fields add as vectors',
    lead: t`Choose an arrangement, then drag the probe and the charges. The gold arrow is the total field at the probe; the readout gives its size and its $x$ and $y$ components.`,
    tasks: [
      'Dipole: move the probe along the vertical line midway between the charges. The field there always points the same way — parallel to the line from + to −.',
      'Like charges: find the point midway between them where the field is zero.',
      'Dipole: put the probe on the axis 6 cm from the centre, then 12 cm. |E| drops by a factor of nearly 9 — heading for 8, the 1/r³ of a distant dipole.',
    ],
    params: {
      unit: 'cm', x: [-14, 14], y: [-8, 8],
      presets: [
        { id: 'dipole', label: 'Dipole', charges: [{ x: -1.5, y: 0, q: 2 }, { x: 1.5, y: 0, q: -2 }], probe: { x: 0, y: 4 } },
        { id: 'like', label: 'Like charges', charges: [{ x: -3, y: 0, q: 2 }, { x: 3, y: 0, q: 2 }], probe: { x: 0, y: 3 } },
        { id: 'unequal', label: '+4 and −1', charges: [{ x: -3, y: 0, q: 4 }, { x: 3, y: 0, q: -1 }], probe: { x: 0, y: 4 } },
        { id: 'single', label: 'One charge', charges: [{ x: 0, y: 0, q: 2 }], probe: { x: 5, y: 3 } },
      ],
      preset: 'dipole', readouts: ['E', 'Ex', 'Ey'], arrows: true, fieldLines: true, edit: true, labels: true,
      toggles: ['fieldLines', 'arrows'],
    },
    caption: 'Field arrows are compressed so that weak and strong regions both show; the readout gives the true field. Field lines are drawn in the plane of the page: their number at each charge is proportional to its charge, but in a flat slice their spacing does not fall off as 1/r² the way the field does.',
  },
  example: {
    prompt: t`A charge of $+4.0$ nC sits at $(-3.0\ \text{cm}, 0)$ and $-4.0$ nC at $(+3.0\ \text{cm}, 0)$. Find the electric field at P $= (0, 4.0\ \text{cm})$, and compare it with the far-field dipole formula $E = kp/r^3$.`,
    visual: field({ unit: 'cm', x: [-8, 8], y: [-3, 6], charges: [{ x: -3, y: 0, q: 4, label: '+4.0 nC' }, { x: 3, y: 0, q: -4, label: '−4.0 nC' }], probe: { x: 0, y: 4, label: 'P' }, fieldLines: true, density: 10 }, 'The two charges and the point P, 5.0 cm from each, with the total field there (gold). Field lines are a sample in the plane of the page.'),
    steps: [
      { label: 'Each field alone', text: t`Both charges are 5.0 cm from P (a 3–4–5 triangle), so each field has the same size: $E_1 = \dfrac{kq}{r^2} = \dfrac{(8.988\times10^{9})(4.0\times10^{-9})}{(0.050)^2} = ${tn(WX.E1)}$ N/C.` },
      { label: 'Directions', text: t`The field of the + charge points away from it, along $(3, 4)/5$. The field of the − charge points toward it, along $(3, -4)/5$.` },
      { label: 'Add components', text: t`$E_x = 2 \times ${tn(WX.E1)} \times \tfrac35 = ${tn(WX.E)}$ N/C. The $y$ components, $\pm ${tn(WX.E1 * 0.8)}$ N/C, cancel.` },
      { label: 'Result', text: t`$\vec E = ${tn(WX.E)}$ N/C in the $+x$ direction: parallel to the line from + to −, so opposite to the dipole moment $\vec p$, which points from − to +.` },
      { label: 'Compare', text: t`$p = qd = (4.0\times10^{-9})(0.060) = ${tn(WX.p)}$ C·m, and $kp/r^3$ with $r = 4.0$ cm gives $${tn(WX.far)}$ N/C — twice the true value. The $1/r^3$ formula is for distances much larger than $d$; here $r$ is smaller than $d$.` },
    ],
    answer: t`$E = ${tn(WX.E)}$ N/C, pointing in $+x$ (from the + charge's side toward the − charge's side).`,
  },
  practice: [
    num({
      id: 'point-field', difficulty: 1,
      gen(r) {
        const q = r.pick([1.5, 2.0, 3.0, 5.0, 8.0]), d = r.pick([2.0, 3.0, 4.0, 6.0, 10]), E = (K * q * 1e-9) / (d / 100) ** 2;
        return {
          prompt: t`How strong is the electric field ${d} cm from a point charge of $${q}$ nC? ($k = 8.988\times10^{9}\ \text{N·m}^2/\text{C}^2$)`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (K * q * 1e-9) / (d / 100), feedback: t`Square the distance: $E = kq/r^2$.` }],
          hints: [t`$E = kq/r^2$ with $r$ in metres: ${d} cm $= ${d / 100}$ m.`],
          teach: 'A point charge’s field falls off as the inverse square of the distance: E = kq/r².',
          explain: t`$E = \dfrac{(8.988\times10^{9})(${q}\times10^{-9})}{(${d / 100})^2} = ${tn(E)}$ N/C, pointing away from the (positive) charge.`,
          visual: field({ charges: [{ x: -4, y: 0, q: 2 }], probe: { x: 4, y: 0, label: 'P' }, probeArrow: false, fieldLines: true, density: 12 }, `The charge and the point P, ${d} cm away. Not to scale.`),
        };
      },
    }),
    mcq({
      id: 'toward-negative', difficulty: 1,
      prompt: 'A single negative charge sits at the origin. Which way does the electric field point at P, to the upper right of it?',
      choices: [
        'Toward the charge: down and to the left',
        'Away from the charge: up and to the right',
        'Along the direction a negative test charge would be pushed',
        'Around the charge, at right angles to the line joining them',
      ],
      answer: 0,
      why: {
        1: 'That is the field of a positive charge. With q negative, kq/r² r̂ points against r̂.',
        2: 'The field is defined by the push on a positive test charge. A negative test charge is pushed the other way — here, away from the charge.',
        3: 'The field of a point charge is radial: along the line through the charge, never around it.',
      },
      hints: ['Which way would a small positive test charge at P be pushed?'],
      teach: 'Field lines point away from positive charges and toward negative ones: the push on a positive test charge.',
      explain: 'A positive test charge at P is attracted by the negative charge, so the field at P points straight at the charge: down and to the left.',
      visual: field({ charges: [{ x: 0, y: 0, q: -2 }], probe: { x: 3.5, y: 2.5, label: 'P' }, probeArrow: false, fieldLines: false, arrows: false }, 'A negative point charge at the origin and the point P.'),
    }),
    num({
      id: 'on-the-line', difficulty: 2,
      gen(r) {
        // q1 at 0, q2 at d, P at x between them; components along +x (a draw whose fields nearly cancel is redrawn)
        let q1, q2, d, x, E1, E2, Ex;
        for (let k = 0; k < 30; k++) {
          q1 = r.pick([2, 3, 4, 6]); q2 = r.pick([1, -1]) * r.pick([1, 2, 3, 5]); d = r.pick([6, 8, 10]); x = r.pick([0.25, 0.4, 0.5, 0.6]) * d;
          E1 = (K * q1 * 1e-9) / (x / 100) ** 2; E2 = -(K * q2 * 1e-9) / ((d - x) / 100) ** 2; Ex = E1 + E2;
          if (Math.abs(Ex) > 0.1 * Math.abs(E1)) break;
        }
        const name2 = q2 > 0 ? `+${q2}` : `${q2}`;
        return {
          prompt: t`A $+${q1}$ nC charge sits at $x = 0$ and a $${name2}$ nC charge at $x = ${d}$ cm. What is the $x$ component of the electric field at $x = ${s3(x, 3)}$ cm, between them? (Positive means pointing toward $+x$.)`,
          answer: Ex, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: E1 - E2, feedback: 'Check the direction of the second charge’s field: a positive charge pushes away from itself, a negative one pulls toward itself.' }, { value: Math.abs(E1) + Math.abs(E2), feedback: 'The fields point along the same line but not necessarily the same way: add them with signs.' }].filter((e) => Math.abs(e.value - Ex) > 0.01 * Math.abs(Ex)),
          hints: ['Find each field’s size from kq/r², then give it a sign by its direction.', t`At P, the $+${q1}$ nC charge's field points toward $+x$ (away from it). The $${name2}$ nC charge's field points ${q2 > 0 ? 'toward −x (away from it)' : 'toward +x (toward it)'}.`],
          teach: 'Add fields as vectors: on a line, give each one a sign according to which way it points.',
          explain: t`$E_1 = kq_1/r_1^2 = ${tn(E1)}$ N/C toward $+x$; $E_2 = k|q_2|/r_2^2 = ${tn(Math.abs(E2))}$ N/C toward ${q2 > 0 ? '−x' : '+x'}. Total: $E_x = ${tn(Ex)}$ N/C.`,
          visual: field({ x: [-2, d + 2], y: [-3, 3], charges: [{ x: 0, y: 0, q: q1, label: `+${q1} nC` }, { x: d, y: 0, q: q2, label: `${q2 > 0 ? '+' : '−'}${Math.abs(q2)} nC` }], probe: { x: +x.toFixed(3), y: 0, label: 'P' }, probeArrow: false, fieldLines: false }, 'The two charges on the x axis and the point P between them.'),
        };
      },
    }),
    {
      type: 'point', id: 'null-point', difficulty: 3,
      prompt: t`A $+1.0$ nC charge sits at $x = 0$ and a $+4.0$ nC charge at $x = 9.0$ cm. Drag the probe to the point where the electric field is **zero**.`,
      instruction: 'Drag the gold probe to where the field vanishes, then check.',
      answer: { x: 3, y: 0 }, tol: { x: 0.3, y: 0.3 },
      visual: fieldLive({ x: [-3, 12], y: [-4, 4], charges: [{ x: 0, y: 0, q: 1, label: '+1.0 nC', drag: false }, { x: 9, y: 0, q: 4, label: '+4.0 nC', drag: false }], probe: { x: 6, y: 2.5 }, probeArrow: false, fieldLines: false }, 'The two charges on the x axis (in cm). The probe shows no readout: work out where the fields cancel.'),
      hints: [
        'The two fields can cancel only on the line through the charges, and only between them, where they point in opposite directions.',
        t`At distance $x$ from the smaller charge: $\dfrac{k(1.0)}{x^2} = \dfrac{k(4.0)}{(9.0 - x)^2}$.`,
        t`Take square roots: $\dfrac{9.0 - x}{x} = 2$.`,
      ],
      teach: 'Between two like charges the fields cancel at a point closer to the smaller charge, where kq₁/x² = kq₂/(d − x)².',
      explain: t`$(9.0 - x)/x = \sqrt{4} = 2$ gives $x = 3.0$ cm: a third of the way from the smaller charge, because the field falls as $1/r^2$ and the charges differ by a factor of 4. Off the axis the two fields always have a sideways part that does not cancel.`,
    },
    num({
      id: 'dipole-axis', difficulty: 2,
      gen(r) {
        const [name, p] = r.pick(MOLECULES), rn = r.pick([2.0, 3.0, 5.0]), E = (2 * K * p) / (rn * 1e-9) ** 3;
        return {
          prompt: t`Treat a ${name} molecule as a point dipole with $p = ${tn(p, 2)}$ C·m. How strong is its field at a point on its axis ${rn} nm away? (On the axis, far from a dipole, $E = 2kp/r^3$.)`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (K * p) / (rn * 1e-9) ** 3, feedback: t`On the axis the far field is $2kp/r^3$; $kp/r^3$ is the field on the perpendicular bisector.` }, { value: (2 * K * p) / (rn * 1e-9) ** 2, feedback: t`A dipole's far field falls off as $1/r^3$, not $1/r^2$.` }],
          hints: [t`$E = 2kp/r^3$ with $r = ${rn}\times10^{-9}$ m.`],
          teach: 'Far from a dipole its field falls off as 1/r³: on the axis E = 2kp/r³, on the bisector kp/r³.',
          explain: t`$E = \dfrac{2(8.988\times10^{9})(${tn(p, 2)})}{(${rn}\times10^{-9})^3} = ${tn(E)}$ N/C. Huge by everyday standards — but it dies away so fast that a few nanometres further it is tiny. (So close to a molecule the point-dipole model is only a rough picture.)`,
          visual: field({ x: [-4, 12], y: [-3.5, 3.5], charges: [{ x: -0.4, y: 0, q: -1 }, { x: 0.4, y: 0, q: 1 }], probe: { x: 9, y: 0, label: 'P' }, probeArrow: false, fieldLines: true, density: 10, notes: { arrows: [{ from: [-1.4, -1.6], to: [1.4, -1.6], label: 'p', color: 'gold' }] } }, 'A dipole (− on the left, + on the right) and the point P on its axis. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'dipole-scaling', difficulty: 2,
      prompt: 'Far from a dipole, you move from a point 20 cm away to a point 40 cm away in the same direction. By what factor does the field’s size change?',
      choices: ['It falls to 1/8', 'It falls to 1/4', 'It falls to 1/2', 'It stays the same, since the dipole has zero net charge'],
      answer: 0,
      why: {
        1: 'That is the inverse-square law of a single charge. A dipole’s two fields nearly cancel, and the remainder falls faster: 1/r³.',
        2: 'Fields of charges never fall as slowly as 1/r; a dipole’s falls as 1/r³.',
        3: 'Zero net charge makes the field fall off faster, not vanish: the two charges are at slightly different distances.',
      },
      hints: ['Far from a dipole, E ∝ 1/r³.'],
      teach: 'A dipole’s far field falls off as 1/r³: double the distance, one eighth of the field.',
      explain: t`$E \propto 1/r^3$, so doubling $r$ divides $E$ by $2^3 = 8$. This holds only when $r \gg d$.`,
      visual: {
        type: 'graph',
        params: {
          x: [0, 5], y: [0, 1.2], aspect: 'wide', xlabel: 'distance (in units of the starting distance)', ylabel: 'field ÷ starting field',
          curves: [{ fn: '1/x^2', domain: [0.93, 5], color: 'ink3', width: 1.5, dash: true, label: '1/r², one charge', labelAt: 3.3, labelDy: -10 }, { fn: '1/x^3', domain: [0.95, 5], color: 'accent', width: 2.4, label: '1/r³, dipole', labelAt: 1.7, labelDy: -14 }],
          points: [{ x: 1, y: 1, color: 'gold', label: 'start' }],
        },
        caption: 'How a single charge’s field (dashed) and a distant dipole’s field (blue) fall with distance, each compared with its value at the start.',
      },
    }),
    num({
      id: 'torque', difficulty: 2,
      gen(r) {
        const [name, p] = r.pick(MOLECULES), E = r.pick([2.0e5, 5.0e5, 1.0e6]), th = r.pick([30, 45, 60, 90]);
        const tau = p * E * Math.sin(deg(th));
        return {
          prompt: t`A ${name} molecule ($p = ${tn(p, 2)}$ C·m) sits in a uniform field of $${tn(E)}$ N/C, its dipole moment at ${th}° to the field. How large is the torque on it?`,
          answer: tau, units: 'N m', tol: { rel: 0.01 },
          errors: Math.abs(Math.sin(deg(th)) - Math.cos(deg(th))) < 0.05 ? [] : [{ value: p * E * Math.cos(deg(th)), feedback: t`The torque is $pE\sin\theta$: largest when $\vec p$ is at right angles to $\vec E$, zero when they line up.` }],
          hints: [t`The two charges feel equal and opposite forces $\pm qE$, a couple. Its torque is $\tau = pE\sin\theta$.`],
          teach: 'A uniform field exerts no net force on a dipole, only a torque τ = pE sin θ that turns it to line up with the field.',
          explain: t`$\tau = pE\sin\theta = (${tn(p, 2)})(${tn(E)})\sin ${th}^\circ = ${tn(tau)}$ N·m. It turns $\vec p$ toward $\vec E$. This is how a microwave oven's oscillating field keeps water molecules twisting back and forth.`,
          visual: field({ x: [-6, 6], y: [-3.5, 3.5], uniform: [E, 0], fieldLines: true, density: 8, notes: {
            points: [{ x: -1.6 * Math.cos(deg(th)), y: -1.6 * Math.sin(deg(th)), color: 'accent', r: 7, label: '−', ldx: -16 }, { x: 1.6 * Math.cos(deg(th)), y: 1.6 * Math.sin(deg(th)), color: 'bad', r: 7, label: '+', ldx: 9 }],
            arrows: [{ from: [-1.1 * Math.cos(deg(th)), -1.1 * Math.sin(deg(th))], to: [1.1 * Math.cos(deg(th)), 1.1 * Math.sin(deg(th))], label: 'p', color: 'gold' },
              { from: [1.6 * Math.cos(deg(th)), 1.6 * Math.sin(deg(th))], to: [1.6 * Math.cos(deg(th)) + 2, 1.6 * Math.sin(deg(th))], label: '+qE', color: 'bad' },
              { from: [-1.6 * Math.cos(deg(th)), -1.6 * Math.sin(deg(th))], to: [-1.6 * Math.cos(deg(th)) - 2, -1.6 * Math.sin(deg(th))], label: '−qE', color: 'accent' }],
          } }, `A dipole at ${th}° to a uniform field pointing right: equal and opposite forces on its ends (a couple). The molecule is drawn hugely enlarged.`),
        };
      },
    }),
    mcq({
      id: 'add-sizes', difficulty: 3, kind: 'error',
      prompt: t`Two $+3.0$ nC charges sit at $(-4.0\ \text{cm}, 0)$ and $(+4.0\ \text{cm}, 0)$. A student finds the field at P $= (0, 3.0\ \text{cm})$ like this: “Each charge is 5.0 cm away, so each field is $kq/r^2 = ${tn((K * 3e-9) / 0.0025)}$ N/C, and the total is twice that, $${tn((2 * K * 3e-9) / 0.0025)}$ N/C.” What is wrong?`,
      choices: [
        t`The two fields point in different directions; their $x$ parts cancel and only the $y$ parts add, giving $${tn((2 * K * 3e-9 * 0.6) / 0.0025)}$ N/C`,
        'Like charges’ fields cancel completely: the field at P is zero',
        'The distance should be 3.0 cm, the height of P above the line',
        'Nothing: fields from charges of the same sign simply add up',
      ],
      answer: 0,
      why: {
        1: 'They cancel only at the midpoint between the charges, where the fields point in exactly opposite directions. At P they point up-left and up-right.',
        2: 'Each charge is 5.0 cm from P: the hypotenuse of a 3–4–5 triangle.',
        3: 'Fields add as vectors. Adding sizes is right only when the fields point the same way.',
      },
      hints: ['Draw each field at P: which way does each one point?', 'Split each into x and y parts: the x parts are equal and opposite.'],
      teach: 'Fields add as vectors: add components, never sizes, unless the fields point the same way.',
      explain: t`Each field points away from its charge, along $(\pm4, 3)/5$. The $x$ parts cancel; each $y$ part is $${tn((K * 3e-9) / 0.0025)} \times \tfrac35$, so $E = ${tn((2 * K * 3e-9 * 0.6) / 0.0025)}$ N/C, straight up.`,
      visual: field({ x: [-8, 8], y: [-2.5, 5], charges: [{ x: -4, y: 0, q: 3 }, { x: 4, y: 0, q: 3 }], probe: { x: 0, y: 3, label: 'P' }, probeArrow: false, fieldLines: true, density: 10 }, 'Two equal positive charges and the point P above their midpoint.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-two-d', difficulty: 3,
      gen(r) {
        const q1 = r.pick([2, 3, 5]), q2 = -r.pick([1, 2, 4]), h = r.pick([3, 4]), d = 4;
        // q1 at the origin, q2 at (d, 0) cm; P at (0, h) cm
        const E1 = (K * q1 * 1e-9) / (h / 100) ** 2;             // straight up
        const r2 = Math.hypot(d, h) / 100, E2m = (K * Math.abs(q2) * 1e-9) / r2 ** 2;
        const ux = (d / 100) / r2, uy = -(h / 100) / r2;          // from P toward q2 (negative: field points toward it)
        const Ex = E2m * ux, Ey = E1 + E2m * uy, E = Math.hypot(Ex, Ey);
        return {
          prompt: t`A $+${q1}$ nC charge sits at the origin and a $${q2}$ nC charge at $(${d}\ \text{cm}, 0)$. How strong is the electric field at P $= (0, ${h}\ \text{cm})$?`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          hints: ['Find each field, split them into x and y components, add, then combine.', 'The positive charge’s field at P points straight up; the negative charge’s field points from P toward that charge.'],
          teach: 'For charges not on one line, add the fields component by component, then combine with Pythagoras.',
          explain: t`From the $+${q1}$ nC charge: $${tn(E1)}$ N/C straight up. From the $${q2}$ nC charge, ${s3(r2 * 100, 3)} cm away: $${tn(E2m)}$ N/C pointing at it, so $(${tn(E2m * ux)}, ${tn(E2m * uy)})$ N/C. Sum: $(${tn(Ex)}, ${tn(Ey)})$ N/C, so $E = ${tn(E)}$ N/C.`,
          visual: field({ x: [-3, 7], y: [-2, 6], charges: [{ x: 0, y: 0, q: q1, label: `+${q1} nC` }, { x: d, y: 0, q: q2, label: `−${Math.abs(q2)} nC` }], probe: { x: 0, y: h, label: 'P' }, probeArrow: false, fieldLines: false }, 'The two charges and the point P (in cm).'),
        };
      },
    }),
    num({
      id: 'cp-thundercloud', difficulty: 2, transfer: true,
      gen(r) {
        const Q = r.pick([20, 30, 40]), h = r.pick([4, 5, 6]), E = (K * Q) / (h * 1000) ** 2;
        return {
          prompt: t`The lower part of a thundercloud holds about $-${Q}$ C of charge, centred ${h} km above the ground. Treating it as a point charge, how strong a field would it alone produce at the ground directly below? Launch sites watch this field with networks of “field mills”: a rocket's exhaust plume can trigger lightning, as it did when Apollo 12 was struck twice during its launch in 1969.`,
          answer: E, units: 'N/C', tol: { rel: 0.01 },
          errors: [{ value: (K * Q) / (h * 1000), feedback: t`Square the distance: $E = kQ/r^2$, with $r$ in metres.` }, { value: (K * Q) / h ** 2, feedback: t`Convert the height to metres: ${h} km $= ${h * 1000}$ m.` }],
          hints: [t`$E = kQ/r^2$ with $r = ${h * 1000}$ m.`],
          teach: 'The point-charge field E = kq/r² gives a first estimate for any compact charge seen from far away.',
          explain: t`$E = \dfrac{(8.988\times10^{9})(${Q})}{(${h * 1000})^2} = ${tn(E)}$ N/C, pointing up toward the negative charge. The real field at the ground is larger still: the conducting ground's own induced charge roughly doubles it — a story for the lesson on conductors — and the cloud's upper positive charge reduces it.`,
          visual: field({ unit: 'km', qunit: 'C', x: [-8, 8], y: [-1, 7.5], charges: [{ x: 0, y: h, q: -Q, label: `−${Q} C` }], probe: { x: 0, y: 0, label: 'field mill' }, probeArrow: false, fieldLines: true, density: 12, notes: { lines: [{ from: [-8, 0], to: [8, 0], color: 'ink3', width: 2 }] } }, 'The cloud’s lower charge as a point charge above the ground (the grey line) and a field mill below it. Not to scale.'),
        };
      },
    }),
    mcq({
      id: 'cp-bisector', difficulty: 2,
      prompt: t`A dipole lies along the $x$ axis with its + charge on the right, so $\vec p$ points toward $+x$. Which way does the field point at P, on the perpendicular bisector above the dipole?`,
      choices: [
        t`Toward $-x$: opposite to $\vec p$`,
        t`Toward $+x$: along $\vec p$`,
        'Straight up, away from the dipole',
        'Nowhere: the fields of the two charges cancel on the bisector',
      ],
      answer: 0,
      why: {
        1: 'On the axis the field is along p. On the bisector it is the other way round.',
        2: 'The upward parts of the two fields cancel (one points away from +, one toward −); only the sideways parts survive.',
        3: 'The sizes are equal on the bisector, but the directions are not opposite: the sideways parts add.',
      },
      hints: ['Draw the two fields at P: away from the + charge, toward the − charge. Which parts cancel?'],
      teach: 'On a dipole’s perpendicular bisector the field points opposite to p — from the + side to the − side.',
      explain: t`The + charge (on the right) pushes P's test charge up and to the left; the − charge (on the left) pulls it down and to the left. The vertical parts cancel and the leftward parts add: $\vec E$ points toward $-x$, opposite to $\vec p$.`,
      visual: field({ x: [-6, 6], y: [-2.5, 5], charges: [{ x: -1.5, y: 0, q: -2 }, { x: 1.5, y: 0, q: 2 }], probe: { x: 0, y: 3, label: 'P' }, probeArrow: false, fieldLines: false, notes: { arrows: [{ from: [-1.2, -1.2], to: [1.2, -1.2], label: 'p', color: 'gold' }] } }, 'A dipole with its moment p (gold) and the point P on its perpendicular bisector.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §5.4 Electric Field', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field' },
    { label: 'OpenStax University Physics Vol. 2, §5.7 Electric Dipoles', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-7-electric-dipoles' },
  ],
});
