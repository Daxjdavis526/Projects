// Superposition: the force on a charge from several others is the vector sum
// of the forces each would exert alone. Signed addition on a line, components
// in a plane, balance points, symmetry — and the internal forces of a group
// cancelling in pairs.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tn, r6, K, chargesPic } from './_charges.js';

const t = String.raw;
const NC = 1e-9, UC = 1e-6, CM = 0.01;
const signed = (q) => `${q > 0 ? '+' : '-'}${Math.abs(q)}`;
const mN = (F) => tn(F * 1e3);

/** Charges on the x-axis (positions in cm, charges in nC) as a wide picture. */
function linePic(charges, extra, caption) {
  const xs = charges.map((c) => c.x), lo = Math.min(...xs), hi = Math.max(...xs), pad = 0.1 * (hi - lo) + 2;
  return chargesPic({ unit: 'cm', qunit: 'nC', aspect: 'wide', x: [r6(lo - pad), r6(hi + pad)], y: [-3, 3], charges, ...extra }, caption);
}

// Collinear practice: q₁ at 0, q₂ at a, q₃ at a + b (nC, cm), keeping only the
// arrangements where the two forces on q₂ do not nearly cancel.
const COLLINEAR = [];
for (const q1 of [30, -40, 50]) for (const q2 of [-20, 15, 25]) for (const q3 of [40, -60, 35]) for (const a of [4, 5]) for (const b of [6, 8]) {
  const F1 = (K * q1 * q2 * NC * NC) / (a * CM) ** 2, F3 = (-K * q3 * q2 * NC * NC) / (b * CM) ** 2;
  if (Math.abs(F1 + F3) >= 0.15 * Math.max(Math.abs(F1), Math.abs(F3))) COLLINEAR.push([q1, q2, q3, a, b]);
}

// The worked example: a 3-4-5 right triangle (m, µC).
const EX = (() => {
  const q1 = 2, q2 = -3, q3 = 1;
  const F1 = (K * q1 * q3 * UC * UC) / 0.4 ** 2;               // along +y (repulsion)
  const F2 = (K * Math.abs(q2 * q3) * UC * UC) / 0.5 ** 2;     // toward q₂, along (0.6, −0.8)
  const F2x = 0.6 * F2, F2y = -0.8 * F2, Fx = F2x, Fy = F1 + F2y;
  return { F1, F2, F2x, F2y, Fx, Fy, F: Math.hypot(Fx, Fy), deg: (Math.atan2(Fy, Fx) * 180) / Math.PI };
})();

export default lesson({
  id: 'phys2220.E1.4',
  title: 'Superposition of forces',
  minutes: 14, difficulty: 2,
  intro: t`When several charges act on one, each pushes or pulls on it exactly as Coulomb’s law says it would if it were there alone, and the net force is the **vector sum** of those separate forces. This is the **principle of superposition**:

$$\vec F_{\text{net}} = \vec F_1 + \vec F_2 + \cdots + \vec F_n = \sum_{i=1}^{n} k\,\frac{q\,q_i}{r_i^2}\,\hat r_i$$

No charge blocks, weakens or shares out another’s force: the force between any two charges is the same whatever else is nearby. Because the separate forces point in different directions, add them as vectors. Split each into components, add the $x$ parts and the $y$ parts separately, then rebuild the size $F = \sqrt{F_x^2 + F_y^2}$ and the direction from $\tan\theta = F_y/F_x$. Use the signs of $F_x$ and $F_y$ to pick the right quadrant for $\theta$.`,
  symbols: [
    { tex: '\\vec F_{\\text{net}}', text: 'the net (total) electric force on the charge $q$, in N' },
    { tex: 'q', text: 'the charge whose force you want, in C' },
    { tex: 'q_i', text: 'each of the other $n$ charges, in C, with its sign' },
    { tex: 'r_i', text: 'the distance from $q_i$ to $q$, in m' },
    { tex: '\\hat r_i', text: 'the unit vector pointing from $q_i$ toward $q$. A positive product $q\\,q_i$ (like charges) pushes $q$ along it, away from $q_i$; a negative product pulls $q$ back toward $q_i$' },
    { tex: 'F_x,\\ F_y', text: 'the components of the net force, in N: the sums of the $x$ and $y$ components of the separate forces' },
    { tex: '\\theta', text: 'the direction of the net force, measured anticlockwise from the $+x$ axis' },
  ],
  why: 'Every charged thing you will meet — a molecule, a thundercloud, the skin of a charged spacecraft — is a crowd of charges. Superposition is what lets Coulomb’s two-charge law describe any of them: work out each pair, then add. It is an experimental fact, not a logical necessity, and it holds for every field in this course; quantum electrodynamics predicts that empty space itself responds non-linearly, but noticeably only in fields near 10¹⁸ V/m, millions of times stronger than those inside atoms.',
  visual: {
    type: 'em-coulomb',
    title: 'Add the pushes and pulls',
    lead: t`Three charges you can drag. The thin arrows are the forces on the chosen charge from each of the others, in that charge’s colour; the gold arrow is their vector sum. Every arrow is drawn to one scale.`,
    tasks: [
      'Drag C around: the force from B on A does not change at all. Each force is worked out as if the other charges were absent.',
      'Tick “Add the forces tip to tail”: the gold net force runs from A to the tip of the last arrow.',
      'Drag C onto the line between A and B, about 5.2 cm from A: the two forces on A cancel and the net force all but vanishes.',
      'Choose “every charge (net only)”: wherever you put the charges, the three net forces add to zero (see the readout).',
    ],
    params: {
      mode: 'free', unit: 'cm', x: [-10, 10], y: [-6, 6], target: 0,
      charges: [{ x: -5, y: -2, q: 2, label: 'A' }, { x: 4, y: -2, q: -3, label: 'B' }, { x: -1, y: 3.5, q: 1, label: 'C' }],
    },
  },
  example: {
    prompt: t`Three point charges sit at the corners of a right triangle: $q_1 = +2.0$ µC at the origin, $q_2 = -3.0$ µC at $(0.30\ \text{m}, 0)$ and $q_3 = +1.0$ µC at $(0, 0.40\ \text{m})$. Find the size and direction of the net electric force on $q_3$. ($k = 8.99\times10^9$ N·m²/C²)`,
    visual: chargesPic({
      unit: 'cm', x: [-22, 52], y: [-8, 60], target: 2, components: true, scale: 0.008,
      charges: [{ x: 0, y: 0, q: 2, label: 'q₁' }, { x: 30, y: 0, q: -3, label: 'q₂' }, { x: 0, y: 40, q: 1, label: 'q₃' }],
    }, 'The forces on q₃ from q₁ (violet) and q₂ (teal), their sum (gold) and its components (dashed), all to one scale. Positions in cm.'),
    steps: [
      { label: 'Force from q₁', text: t`$q_1$ and $q_3$ are both positive, $0.40$ m apart, so $q_1$ pushes $q_3$ straight up, along $+y$: $F_1 = \dfrac{(8.99\times10^9)(2.0\times10^{-6})(1.0\times10^{-6})}{0.40^2} = ${tn(EX.F1)}$ N.` },
      { label: 'Force from q₂', text: t`$q_2$ is $\sqrt{0.30^2 + 0.40^2} = 0.50$ m away and unlike, so it pulls $q_3$ toward itself: $F_2 = \dfrac{(8.99\times10^9)(3.0\times10^{-6})(1.0\times10^{-6})}{0.50^2} = ${tn(EX.F2)}$ N, along the direction from $q_3$ to $q_2$, $(0.30, -0.40)/0.50 = (0.6, -0.8)$. So $F_{2x} = +${tn(EX.F2x)}$ N and $F_{2y} = ${tn(EX.F2y)}$ N.` },
      { label: 'Add the components', text: t`$F_x = 0 + ${tn(EX.F2x)} = ${tn(EX.Fx)}$ N and $F_y = ${tn(EX.F1)} - ${tn(-EX.F2y)} = ${tn(EX.Fy)}$ N.` },
      { label: 'Size and direction', text: t`$F = \sqrt{${tn(EX.Fx)}^2 + ${tn(EX.Fy)}^2} = ${tn(EX.F)}$ N, at $\theta = \arctan(${tn(EX.Fy)}/${tn(EX.Fx)}) = ${tn(EX.deg)}°$ — both components are positive, so the angle is in the first quadrant, above the $+x$ axis.` },
    ],
    answer: t`$F_{\text{net}} = ${tn(EX.F)}$ N, pointing $${tn(EX.deg)}°$ above the $+x$ axis — much less than the $${tn(EX.F1 + EX.F2)}$ N you would get by adding the two sizes, because the forces partly cancel.`,
  },
  practice: [
    num({
      id: 'collinear', difficulty: 2,
      gen(r) {
        const [q1, q2, q3, a, b] = r.pick(COLLINEAR);
        const F1 = (K * q1 * q2 * NC * NC) / (a * CM) ** 2;      // on q₂ from q₁ (to its left): + means along +x
        const F3 = (-K * q3 * q2 * NC * NC) / (b * CM) ** 2;     // on q₂ from q₃ (to its right)
        const net = F1 + F3;
        const errors = [
          F1 * F3 < 0
            ? { value: Math.sign(net) * (Math.abs(F1) + Math.abs(F3)) * 1e3, feedback: 'Here the two forces point in opposite directions: give each its sign before adding.' }
            : { value: Math.sign(net) * Math.abs(Math.abs(F1) - Math.abs(F3)) * 1e3, feedback: 'Here both forces point the same way, so they add: subtract only when they point in opposite directions.' },
          { value: K * q2 * NC * ((q1 * NC) / (a * CM) - (q3 * NC) / (b * CM)) * 1e3, feedback: 'Square the distances: each force goes as 1/r².' },
        ];
        const dir = (F) => (F > 0 ? t`along $+x$` : t`along $-x$`);
        const how = (qa) => (qa * q2 > 0 ? 'pushed away' : 'pulled toward it');
        return {
          prompt: t`Three point charges lie on the $x$-axis: $q_1 = ${signed(q1)}$ nC at $x = 0$, $q_2 = ${signed(q2)}$ nC at $x = ${a}$ cm and $q_3 = ${signed(q3)}$ nC at $x = ${a + b}$ cm. What is the $x$-component of the net electric force on $q_2$? (Positive means along $+x$; $k = 8.99\times10^9$ N·m²/C².)`,
          answer: net * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors,
          hints: ['Find each force on q₂ separately, with its direction: like charges repel, unlike charges attract.', t`Then add them as signed numbers: $F_x = F_{1x} + F_{3x}$.`],
          teach: 'On a line, superposition is signed addition: give each force a + or − for its direction, then add.',
          explain: t`From $q_1$, ${a} cm to the left: $${mN(Math.abs(F1))}$ mN ${dir(F1)} ($q_2$ is ${how(q1)}). From $q_3$, ${b} cm to the right: $${mN(Math.abs(F3))}$ mN ${dir(F3)} (${how(q3)}). Net: $F_x = (${mN(F1)}) + (${mN(F3)}) = ${mN(net)}$ mN.`,
          visual: linePic([{ x: 0, y: 0, q: q1, label: 'q₁' }, { x: a, y: 0, q: q2, label: 'q₂' }, { x: a + b, y: 0, q: q3, label: 'q₃' }], { forces: false }, 'The three charges on the x-axis (positions in cm). Force arrows not drawn.'),
        };
      },
    }),
    num({
      id: 'right-angle', difficulty: 2,
      gen(r) {
        const q0 = 20, qa = r.pick([30, -30, 45]), qb = r.pick([-25, 40]), a = r.pick([3, 4]), b = r.pick([5, 6]);
        const Fa = (K * Math.abs(q0 * qa) * NC * NC) / (a * CM) ** 2, Fb = (K * Math.abs(q0 * qb) * NC * NC) / (b * CM) ** 2;
        const F = Math.hypot(Fa, Fb), scale = Math.max(Fa, Fb) / 3.2;
        return {
          prompt: t`A $+${q0}$ nC charge sits at the origin, a $${signed(qa)}$ nC charge at $(${a}\ \text{cm}, 0)$ and a $${signed(qb)}$ nC charge at $(0, ${b}\ \text{cm})$. How large is the net electric force on the charge at the origin? ($k = 8.99\times10^9$ N·m²/C²)`,
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: [
            { value: (Fa + Fb) * 1e3, feedback: 'The two forces are at right angles, so their sizes do not simply add: use Pythagoras.' },
            { value: Math.abs(Fa - Fb) * 1e3, feedback: 'The forces are perpendicular, not opposite: combine them with Pythagoras.' },
          ],
          hints: ['One force lies along the x-axis and the other along the y-axis.', t`$F = \sqrt{F_x^2 + F_y^2}$.`],
          teach: 'Perpendicular forces add like the sides of a right triangle: F = √(Fx² + Fy²).',
          explain: t`The charge on the $x$-axis exerts $${mN(Fa)}$ mN along the $x$-axis (${qa > 0 ? t`a push toward $-x$` : t`a pull toward $+x$`}); the one on the $y$-axis exerts $${mN(Fb)}$ mN along the $y$-axis (${qb > 0 ? t`a push toward $-y$` : t`a pull toward $+y$`}). Net: $\sqrt{${mN(Fa)}^2 + ${mN(Fb)}^2} = ${mN(F)}$ mN.`,
          visual: chargesPic({
            unit: 'cm', qunit: 'nC', x: [-4.8, a + 1.5], y: [-4.8, b + 1.5], target: 0, sum: true, ask: true, scale: r6(scale),
            charges: [{ x: 0, y: 0, q: q0, label: 'q₀' }, { x: a, y: 0, q: qa, label: 'q₁' }, { x: 0, y: b, q: qb, label: 'q₂' }],
          }, 'The forces on the charge at the origin, added tip to tail (to scale, sizes not shown). Positions in cm.'),
        };
      },
    }),
    mcq({
      id: 'pair-direction', difficulty: 2,
      prompt: t`Charges $+Q$ and $-Q$ sit at $(-3\ \text{cm}, 0)$ and $(+3\ \text{cm}, 0)$. A small positive charge $q$ sits at $(0, 4\ \text{cm})$, the same distance from each. Which way does the net electric force on $q$ point?`,
      choices: [t`Along $+x$, parallel to the line from $+Q$ to $-Q$`, 'Nowhere: the pair’s total charge is zero, so together they exert no force', t`Along $+y$, straight away from the pair`, t`Straight toward $-Q$`],
      answer: 0,
      why: {
        1: 'A total charge of zero does not mean zero force. The push from +Q and the pull from −Q are equal in size, but they point in different directions, so they cannot cancel.',
        2: 'Only +Q repels q; −Q attracts it. Their y-parts are equal and opposite, so they cancel.',
        3: 'That is the pull of −Q alone. The push from +Q, directly away from +Q, adds to it.',
      },
      hints: ['Draw the two forces on q: a push directly away from +Q, a pull directly toward −Q.', 'They are the same size (equal distances). Which of their components cancel?'],
      teach: 'Add forces as vectors: two forces of equal size cancel only when they point in exactly opposite directions.',
      explain: t`The push from $+Q$ points along $(3, 4)/5$, up and to the right; the pull toward $-Q$ along $(3, -4)/5$, down and to the right. The two have the same size $F$, so their $y$-parts cancel and their $x$-parts add: the net force is $2F\cdot\tfrac{3}{5}$ along $+x$. A neutral pair still exerts a force — weaker than one charge’s, and falling off faster with distance.`,
      visual: chargesPic({
        unit: 'cm', x: [-6, 6], y: [-1.5, 5.5], target: 2, forces: false, ask: true,
        charges: [{ x: -3, y: 0, q: 5, label: '+Q' }, { x: 3, y: 0, q: -5, label: '−Q' }, { x: 0, y: 4, q: 1, label: 'q' }],
      }, 'The pair and the charge q (positions in cm). Force arrows not drawn.'),
    }),
    num({
      id: 'balance-between', difficulty: 2,
      gen(r) {
        const [q1, q2, d] = r.pick([[40, 10, 30], [90, 10, 40], [20, 80, 30], [-18, -50, 16]]);
        const ratio = Math.sqrt(q2 / q1), x = d / (1 + ratio);
        // a +2 nC test charge at the midpoint, its larger force drawn 0.3 d long
        const big = (K * Math.max(Math.abs(q1), Math.abs(q2)) * 2 * NC * NC) / ((d / 2) * CM) ** 2;
        return {
          prompt: t`Charges $q_1 = ${signed(q1)}$ nC at $x = 0$ and $q_2 = ${signed(q2)}$ nC at $x = ${d}$ cm are held in place. At what point between them would a third charge feel no net electric force? Give its $x$ in cm.`,
          answer: x, units: 'cm', tol: { rel: 0.01 },
          errors: [
            { value: d / 2, feedback: 'The midpoint balances only equal charges: there the bigger charge pushes harder.' },
            { value: (d * Math.abs(q1)) / (Math.abs(q1) + Math.abs(q2)), feedback: 'The forces fall as 1/r², so the distances go as the square roots of the charges, not as the charges themselves.' },
            { value: d - x, feedback: 'The balance point is nearer the smaller charge: only close in can its weaker push match the bigger one’s.' },
          ],
          hints: [t`At the balance point $k\dfrac{|q_1|\,q}{x^2} = k\dfrac{|q_2|\,q}{(d - x)^2}$: the third charge $q$ cancels.`, t`Take square roots: $\dfrac{d - x}{x} = \sqrt{|q_2|/|q_1|}$.`],
          teach: 'Between two like charges the balance point lies nearer the smaller one, where x/(d − x) = √(q₁/q₂).',
          explain: t`Setting the two forces equal, $\dfrac{|q_1|}{x^2} = \dfrac{|q_2|}{(d - x)^2}$, so $\dfrac{d - x}{x} = \sqrt{|q_2|/|q_1|} = ${tn(ratio)}$ and $x = \dfrac{d}{1 + ${tn(ratio)}} = ${tn(x)}$ cm. The third charge’s size and sign drop out. It is a balance, not a trap: nudge the charge sideways — or, for a charge of the opposite sign, along the line — and it drifts away. No arrangement of fixed charges can hold a charge stably (Earnshaw’s theorem).`,
          visual: linePic([{ x: 0, y: 0, q: q1, label: 'q₁' }, { x: d, y: 0, q: q2, label: 'q₂' }, { x: d / 2, y: 0, q: 2, label: 'test' }], { target: 2, net: false, values: false, scale: r6(big / (0.3 * d)) }, 'A small test charge at the midpoint, with the forces on it from q₁ and q₂ (to scale): they do not balance there.'),
        };
      },
    }),
    mcq({
      id: 'no-shielding', difficulty: 2,
      prompt: t`Two charges, $q_1$ and $q_2$, are 10 cm apart, and $q_1$ pushes on $q_2$ with a force of 2.0 mN. A third charge $q_3$ is now fixed on the line between them, 3 cm from $q_2$. What force does $q_1$ exert on $q_2$ now?`,
      choices: ['Still 2.0 mN, in the same direction', 'Less than 2.0 mN: q₃ partly blocks the force from q₁', 'None: q₂ now feels only its nearest neighbour, q₃', 'It depends on the sign of q₃'],
      answer: 0,
      why: {
        1: 'Charges do not block each other’s forces. q₁ still pushes q₂ with k|q₁q₂|/r²; q₃ adds a force of its own.',
        2: 'Every charge acts on every other, near or far: q₂ now feels two forces, one from each.',
        3: 'The sign of q₃ changes the net force on q₂, but not q₁’s share of it.',
      },
      hints: ['Coulomb’s law for q₁ and q₂ contains only q₁, q₂ and the distance between them.', 'The net force on q₂ does change. Is that the question?'],
      teach: 'The force between two charges does not depend on other charges nearby; the net force is that force plus the others.',
      explain: t`Superposition: $q_1$ still pushes $q_2$ with 2.0 mN, and $q_3$ adds its own force; the **net** force on $q_2$ is the sum of the two. Even a metal sheet between them does not block the force: charges in the metal move, and their forces add to $q_1$’s until the sum on the far side cancels — “shielding” is superposition too.`,
      visual: linePic([{ x: 0, y: 0, q: 4, label: 'q₁' }, { x: 7, y: 0, q: -2, label: 'q₃' }, { x: 10, y: 0, q: 3, label: 'q₂' }], { forces: false, ask: true }, 'The three charges (positions in cm). Force arrows not drawn.'),
    }),
    num({
      id: 'triangle', difficulty: 3,
      gen(r) {
        const q = r.pick([15, 25, -20]), s = r.pick([3, 4, 5]);
        const F1 = (K * (q * NC) ** 2) / (s * CM) ** 2, F = Math.sqrt(3) * F1, h = (s * Math.sqrt(3)) / 2;
        return {
          prompt: t`Three identical point charges of $${signed(q)}$ nC sit at the corners of an equilateral triangle with ${s} cm sides. How large is the net electric force on any one of them? ($k = 8.99\times10^9$ N·m²/C²)`,
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: [
            { value: 2 * F1 * 1e3, feedback: 'The two forces are 60° apart, so their sizes do not simply add: only their components along the bisector do.' },
            { value: F1 * 1e3, feedback: 'That is the force from one neighbour. Add the other one too, as a vector.' },
            { value: Math.SQRT2 * F1 * 1e3, feedback: 'The forces are 60° apart, not 90°: Pythagoras does not apply.' },
          ],
          hints: [t`Each neighbour pushes with $F_1 = kq^2/s^2$, along the side joining them, and the two pushes are $60°$ apart.`, t`By symmetry the net force points straight away from the triangle’s centre, and each push contributes $F_1\cos30°$ along that line.`],
          teach: 'Three equal charges on an equilateral triangle: each feels √3 times the force of one neighbour, pointing away from the centre.',
          explain: t`$F_1 = \dfrac{(8.99\times10^9)(${Math.abs(q)}\times10^{-9})^2}{(${r6(s * CM)})^2} = ${mN(F1)}$ mN. The components across the bisector cancel and those along it add: $F = 2F_1\cos30° = \sqrt3\,F_1 = ${mN(F)}$ mN, pointing away from the centre of the triangle${q < 0 ? ' — like charges repel, whatever their sign' : ''}.`,
          visual: chargesPic({
            unit: 'cm', qunit: 'nC', x: [r6(-1.2 * s), r6(1.2 * s)], y: [r6(-0.35 * s), r6(h + 0.95 * s)], target: 0, ask: true, scale: r6(F1 / (0.45 * s)),
            charges: [{ x: 0, y: r6(h), q, label: 'top' }, { x: r6(-s / 2), y: 0, q, label: '' }, { x: r6(s / 2), y: 0, q, label: '' }],
          }, 'The forces on the top charge from the other two (thin) and their sum (gold), to scale; sizes not shown.'),
        };
      },
    }),
    num({
      id: 'balance-outside', difficulty: 3,
      gen(r) {
        const [q1, q2, d] = r.pick([[40, -10, 10], [90, -10, 12], [-50, 18, 8], [16, -36, 6]]);
        const ratio = Math.sqrt(Math.abs(q2 / q1)), x = d / (1 - ratio);
        const smaller = Math.abs(q2) < Math.abs(q1) ? t`$q_2$` : t`$q_1$`;
        // a +2 nC test charge between them, a little off the axis so both arrows show
        const yT = r6(0.12 * d), r1 = Math.hypot(d / 2, yT) * CM;
        const big = (K * Math.max(Math.abs(q1), Math.abs(q2)) * 2 * NC * NC) / r1 ** 2;
        return {
          prompt: t`Charges $q_1 = ${signed(q1)}$ nC at $x = 0$ and $q_2 = ${signed(q2)}$ nC at $x = ${d}$ cm are held in place. Where on the $x$-axis would a third charge feel no net electric force? Give its $x$ in cm (it may be negative).`,
          answer: x, units: 'cm', tol: { rel: 0.01 },
          errors: [
            { value: d / (1 + ratio), feedback: 'Between unlike charges both forces on a third charge point the same way — a push from one, a pull toward the other — so they cannot cancel there.' },
            { value: d / (1 - 1 / ratio), feedback: 'Beyond the bigger charge, that charge is both nearer and bigger, so it always wins. The balance point lies beyond the smaller charge.' },
          ],
          hints: ['Between unlike charges both forces point the same way. Look outside the pair, on the side of the smaller charge, where being nearer makes up for being smaller.', t`Write each distance in terms of $x$ and set $|q_1|/r_1^2 = |q_2|/r_2^2$; taking square roots gives $r_2/r_1 = \sqrt{|q_2|/|q_1|}$.`],
          teach: 'Outside a pair of unlike charges, the balance point lies beyond the smaller charge.',
          explain: t`Between the charges both forces point the same way, so the balance point is outside, beyond the smaller charge, ${smaller}. There $r_2/r_1 = \sqrt{|q_2|/|q_1|} = ${tn(ratio)}$, which gives $x = ${tn(x)}$ cm: ${tn(Math.abs(x))} cm from $q_1$ and ${tn(Math.abs(x - d))} cm from $q_2$. Check: $|q_1|/r_1^2 = ${tn(Math.abs(q1) / x ** 2)}$ and $|q_2|/r_2^2 = ${tn(Math.abs(q2) / (x - d) ** 2)}$ nC/cm², equal.`,
          visual: linePic([{ x: 0, y: 0, q: q1, label: 'q₁' }, { x: d, y: 0, q: q2, label: 'q₂' }, { x: r6(d / 2), y: yT, q: 2, label: 'test' }], { target: 2, net: false, values: false, scale: r6(big / (0.3 * d)) }, 'A test charge between the two (drawn a little off the axis so both arrows show), with the forces on it to scale: they point the same way.'),
        };
      },
    }),
    mcq({
      id: 'internal-forces', difficulty: 2,
      prompt: 'Three charged spacecraft fly together, far from any other charge, pushing and pulling on each other electrically. Add up the net electric forces on all three. What do you get?',
      choices: ['Zero, whatever their charges and positions', 'Zero only if their charges add up to zero', 'A force toward the most strongly charged craft', 'Zero only in symmetric arrangements, such as an equilateral triangle'],
      answer: 0,
      why: {
        1: 'The total charge does not matter: every force in the sum has an equal and opposite partner, so they cancel in pairs whatever the charges.',
        2: 'The most strongly charged craft pushes or pulls on the others, but they push or pull back on it just as hard.',
        3: 'The arrangement changes each craft’s own net force, but not the total: the pairs cancel in any arrangement.',
      },
      hints: ['List every force in the sum: the force of craft 1 on craft 2, of 2 on 1, of 1 on 3, and so on.', 'Newton’s third law pairs them up.'],
      teach: 'Internal forces cancel in pairs: a group’s own electric forces can reshape it but never accelerate its centre of mass.',
      explain: t`The sum contains six forces: $\vec F_{12}$ and $\vec F_{21}$, $\vec F_{13}$ and $\vec F_{31}$, $\vec F_{23}$ and $\vec F_{32}$. Each pair is equal and opposite, so the total is zero. Electric forces between craft can therefore hold or reshape a formation but cannot move it as a whole: its centre of mass follows its orbit, changed only by outside forces — gravity, drag, thrusters.`,
      visual: chargesPic({
        unit: 'm', x: [-7, 8], y: [-4.5, 5.5], target: 'all', ask: true,
        charges: [{ x: -4, y: -1.5, q: 3, label: 'craft 1' }, { x: 4, y: -2, q: -2, label: 'craft 2' }, { x: 1, y: 3, q: 4, label: 'craft 3' }],
      }, 'Three charged craft (drawn as points; positions in m) and the net electric force on each, to one scale.'),
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-components', difficulty: 2,
      gen(r) {
        const [a, b] = r.pick([[6, 8], [5, 12], [8, 6]]), q1 = r.pick([20, -30]), q2 = r.pick([-40, 25]), q = 10;
        const c = Math.hypot(a, b);
        const F1y = (K * q1 * q * NC * NC) / (b * CM) ** 2;                          // from q₁ at the origin, along +y if they repel
        const F2 = (K * q2 * q * NC * NC) / (c * CM) ** 2;                           // signed: + pushes q away from q₂
        const F2x = (F2 * -a) / c, F2y = (F2 * b) / c;                               // unit vector from q₂ to q: (−a, b)/c
        const Fx = F2x, Fy = F1y + F2y, F = Math.hypot(Fx, Fy);
        const flipped = Math.hypot(-F2x, F1y - F2y);
        const errors = [{ value: (Math.abs(F1y) + Math.abs(F2)) * 1e3, feedback: 'The two forces point in different directions: add components, not sizes.' }];
        if (Math.abs(flipped - F) > 0.03 * F) errors.push({ value: flipped * 1e3, feedback: t`Check the direction of the force from $q_2$: ${q2 * q > 0 ? 'like charges push apart' : 'unlike charges pull together'}.` });
        const big = Math.max(Math.abs(F1y), Math.abs(F2));
        return {
          prompt: t`Point charges $q_1 = ${signed(q1)}$ nC at the origin and $q_2 = ${signed(q2)}$ nC at $(${a}\ \text{cm}, 0)$ act on a charge $q = +${q}$ nC at $(0, ${b}\ \text{cm})$. How large is the net electric force on $q$? ($k = 8.99\times10^9$ N·m²/C²)`,
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors,
          hints: [t`$q_2$ is $\sqrt{${a}^2 + ${b}^2} = ${tn(c)}$ cm from $q$; the force from $q_1$ is along the $y$-axis.`, t`Split the force from $q_2$ into components with the factors $${a}/${tn(c)}$ and $${b}/${tn(c)}$, add the $x$ and $y$ parts, then combine.`],
          teach: 'For forces in a plane: components, add, then Pythagoras.',
          explain: t`From $q_1$: $${mN(Math.abs(F1y))}$ mN along ${F1y > 0 ? t`$+y$` : t`$-y$`}. From $q_2$, ${tn(c)} cm away: $${mN(Math.abs(F2))}$ mN ${F2 > 0 ? 'directly away from it' : 'directly toward it'}, with components $(${mN(F2x)}, ${mN(F2y)})$ mN. Sum: $F_x = ${mN(Fx)}$ mN, $F_y = ${mN(Fy)}$ mN, so $F = ${mN(F)}$ mN.`,
          visual: chargesPic({
            unit: 'cm', qunit: 'nC', x: [r6(-0.5 * a - 2), r6(a + 2)], y: [-2, r6(b + 0.45 * b + 1)], target: 2, net: false, ask: true, scale: r6(big / (0.38 * b)),
            charges: [{ x: 0, y: 0, q: q1, label: 'q₁' }, { x: a, y: 0, q: q2, label: 'q₂' }, { x: 0, y: b, q, label: 'q' }],
          }, 'The forces on q from q₁ and q₂, to scale (sizes not shown). Positions in cm.'),
        };
      },
    }),
    num({
      id: 'cp-null-charge', difficulty: 3, transfer: true,
      gen(r) {
        const qa = r.pick([2, 4, 5]), [d1, d2] = r.pick([[10, 20], [15, 25], [20, 30]]);
        const qc = qa * (d2 / d1) ** 2;
        return {
          prompt: t`In a proposed formation of spacecraft held partly by electric forces, craft A, B and C sit on a line in geostationary orbit. A is charged to $+${qa}$ µC and is ${d1} m from B; C is ${d2} m beyond B, on the other side. B carries a charge of its own. What charge must C carry so that B feels no net electric force from the other two? (Give it in µC; treat the craft as point charges.)`,
          answer: qc, units: 'µC', tol: { rel: 0.01 },
          errors: [
            { value: (qa * d2) / d1, feedback: 'The forces fall as 1/r²: the charges must scale with the square of the distances.' },
            { value: qa * (d1 / d2) ** 2, feedback: 'Upside down: C is farther from B, so it needs more charge than A, not less.' },
          ],
          hints: [t`For B to balance, the forces from A and C on it must be equal and opposite: $k\dfrac{q_A q_B}{d_1^2} = k\dfrac{q_C q_B}{d_2^2}$.`, 'B’s own charge cancels from both sides: you do not need it.'],
          teach: 'For a charge to balance between two others, each one’s charge over distance squared must match; the balancing charge’s own size never matters.',
          explain: t`$q_C = q_A\,(d_2/d_1)^2 = ${qa}\times(${d2}/${d1})^2 = ${tn(qc)}$ µC, positive like A, whatever B carries: if B is positive both push it, if negative both pull it, in opposite directions either way. A and C are not balanced, though — each feels a net force from the other two — so a real formation also leans on orbital dynamics or thrusters to hold its shape. Treating the craft as point charges is fair here: at geostationary altitude the thin plasma screens charges only beyond about 100 m or more, whereas in low orbit it screens them within millimetres.`,
          visual: chargesPic({
            unit: 'm', aspect: 'wide', x: [-6, d1 + d2 + 6], y: [-6, 6], forces: false, ask: true,
            charges: [{ x: 0, y: 0, q: qa, label: 'A' }, { x: d1, y: 0, q: 1, label: 'B' }, { x: d1 + d2, y: 0, q: r6(qc), label: 'C' }],
          }, 'Craft A, B and C on a line (drawn as points; positions in m).'),
        };
      },
    }),
    mcq({
      id: 'cp-neutral-pair', difficulty: 2,
      prompt: t`A tight pair of charges, $+Q$ and $-Q$ a small distance $s$ apart, is overall neutral. A charge $q$ sits on the line through the pair, a distance $r \gg s$ from its centre. If $r$ is doubled, what happens to the net force on $q$?`,
      choices: ['It falls to about 1/8: the two forces nearly cancel, and cancel more completely the farther away q is', 'Nothing: there is no force at either distance, because the pair is neutral', 'It falls to 1/4: each charge’s force falls to a quarter, so their difference does too', 'It falls to 1/2: what is left after the cancellation goes as 1/r'],
      answer: 0,
      why: {
        1: 'Neutral overall is not the same as no force: the nearer charge of the pair is a little closer to q, so its force is a little bigger than the farther one’s.',
        2: 'Each force does fall to about a quarter, but the two also become more nearly equal, so their difference falls faster: as 1/r³.',
        3: 'The difference of two inverse-square forces at distances r − s/2 and r + s/2 is about 2kQqs/r³: an inverse cube, not an inverse first power.',
      },
      hints: [t`Write the net force as $kQq\left[\dfrac{1}{(r - s/2)^2} - \dfrac{1}{(r + s/2)^2}\right]$.`, t`For $r \gg s$ this is about $\dfrac{2kQqs}{r^3}$.`],
      teach: 'A neutral pair of charges still exerts a force, but it falls off as 1/r³ instead of 1/r².',
      explain: t`$kQq\left[\dfrac{1}{(r - s/2)^2} - \dfrac{1}{(r + s/2)^2}\right] = kQq\,\dfrac{2rs}{(r^2 - s^2/4)^2} \approx \dfrac{2kQqs}{r^3}$, so doubling $r$ divides the force by about $2^3 = 8$. This is why neutral molecules affect each other only weakly and at short range — and why a polarized neutral object, like the one in the last lesson, still feels and exerts electric forces.`,
      visual: chargesPic({
        unit: 'cm', qunit: 'nC', aspect: 'wide', x: [-2.5, 11.5], y: [-2, 2], target: 2, ask: true, scale: r6((K * NC * NC) / (7.5 * CM) ** 2 / 3.2),
        charges: [{ x: -0.5, y: 0, q: 1, label: '+Q' }, { x: 0.5, y: 0, q: -1, label: '−Q' }, { x: 8, y: 0, q: 1, label: 'q' }],
      }, 'A neutral pair and the charge q: the push from +Q, the pull from −Q, and their small sum (gold), to scale. Not drawn with r ≫ s.'),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §5.3 Coulomb’s Law (superposition of forces)', url: 'https://openstax.org/books/university-physics-volume-2/pages/5-3-coulombs-law' },
    { label: 'J. Schwinger, “On gauge invariance and vacuum polarization”, Phys. Rev. 82, 664 (1951) — the field strength near 10¹⁸ V/m at which the vacuum becomes noticeably non-linear', url: 'https://doi.org/10.1103/PhysRev.82.664' },
    { label: 'H. Schaub, G. G. Parker, L. B. King, “Challenges and prospects of Coulomb spacecraft formations”, J. Astronaut. Sci. 52, 169 (2004)', url: 'https://vivo-cub.colorado.edu/display/pubid_126091' },
    { label: 'H. Schaub, Coulomb formation flying research (Debye lengths of 100–1000 m at geostationary altitude)', url: 'https://hanspeterschaub.info/research-cff.html' },
  ],
});
