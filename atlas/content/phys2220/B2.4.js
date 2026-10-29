// Forces between currents: each of two long parallel wires sits in the other's
// field, so each feels F/L = μ₀I₁I₂/(2πd) — currents in the same direction
// attract, opposite ones repel, and the two forces are always equal and
// opposite, whatever the currents.
import { lesson, mcq, num } from '../../src/core/content.js';
import { MU0, COL, G0, tn, r6, lab, seg2, circ2, page } from './_magnet.js';

const t = String.raw;
const PI = Math.PI;
/** Force per metre between two long parallel wires, N/m (d in m). */
const fpl = (I1, I2, d) => (MU0 * I1 * I2) / (2 * PI * d);

// ─── pictures ───────────────────────────────────────────────────────────────
// long straight wires crossing the page, positions in cm: [[x, y, I, label], …]
const wirePic = ({ wires, x, y, forces = false, schematic = false, caption }) => ({
  type: 'em-bfield',
  params: { unit: 'cm', x, y, wires: wires.map(([wx, wy, I, label]) => ({ x: r6(wx), y: r6(wy), I, label })), lines: true, forces, readouts: [], static: true, ...(schematic ? { axes: false, grid: false } : {}) },
  caption,
});
// two wires d cm apart on the x-axis (I > 0: out of the page)
const pairPic = ({ d, I1, I2, caption, schematic = false }) => wirePic({ wires: [[-d / 2, 0, I1, '1'], [d / 2, 0, I2, '2']], x: [r6(-1.1 * d), r6(1.1 * d)], y: [r6(-0.62 * d), r6(0.62 * d)], schematic, caption });

// a wire crossing the page, drawn in a plain picture: a ring with a dot (out) or a cross (in)
const glyph = (x, y, out, R = 0.26) => ({
  curves: [circ2(x, y, R, { color: 'ink', width: 1.8 }), ...(out ? [] : [seg2([x - 0.62 * R, y - 0.62 * R], [x + 0.62 * R, y + 0.62 * R], { color: 'ink', width: 1.8 }), seg2([x - 0.62 * R, y + 0.62 * R], [x + 0.62 * R, y - 0.62 * R], { color: 'ink', width: 1.8 })])],
  points: out ? [{ x, y, r: 3, color: 'ink' }] : [],
});
const merge = (...parts) => ({ curves: parts.flatMap((p) => p.curves || []), points: parts.flatMap((p) => p.points || []) });

// the worked example
const EX = { d: 0.05, I1: 8.0, I2: 3.0 };
EX.B1 = (MU0 * EX.I1) / (2 * PI * EX.d); EX.B2 = (MU0 * EX.I2) / (2 * PI * EX.d);
EX.F = EX.I2 * EX.B1; EX.F1 = EX.I1 * EX.B2;
const exG = merge(glyph(-2.5, 0, true), glyph(2.5, 0, true));

export default lesson({
  id: 'phys2220.B2.4',
  title: 'Forces between currents',
  minutes: 12, difficulty: 2,
  intro: t`Two long parallel wires each sit in the other’s magnetic field, so each feels a force. Wire 1’s field at wire 2 is $B_1 = \mu_0 I_1/(2\pi d)$, and a length $L$ of wire 2 feels $I_2 L B_1$. Per metre of wire:

$$\frac{F}{L} = \frac{\mu_0 I_1 I_2}{2\pi d}$$

Currents in the **same** direction **attract**; currents in **opposite** directions **repel** — the reverse of the rule for charges. And the force on wire 1 is exactly as big as the force on wire 2, whatever the currents: Newton’s third law holds. From 1948 to 2019 this force defined the ampere: the current that, in two long wires 1 m apart, gives $2\times10^{-7}$ N on every metre.`,
  symbols: [
    { tex: 'F/L', text: 'the force on each metre of either wire, in N/m — the wires are long, so the force is given per unit length' },
    { tex: 'I_1, I_2', text: 'the currents in the two wires, in A' },
    { tex: 'd', text: 'the distance between the wires, in m' },
    { tex: '\\mu_0', text: '$4\\pi\\times10^{-7}$ T·m/A' },
  ],
  why: 'It is the force that pinches plasma columns and lightning channels, that busbars and transformer windings must be braced against in a short circuit, and the one that defined the ampere for seventy years.',
  visual: {
    type: 'em-bfield',
    title: 'Attract or repel',
    lead: t`Two long wires cross the page. Each sits in the other’s field and feels a force (violet arrows). Set the currents and their directions, and drag either wire; the readouts give the force on each metre of each wire.`,
    tasks: [
      'With both currents the same way, the arrows point at each other: the wires attract.',
      'Switch wire 2’s current to the opposite direction: now they repel — the reverse of the rule for charges.',
      'Make one current five times the other: the two forces stay exactly equal. That is Newton’s third law.',
      'Drag a wire out to twice the separation: the force per metre halves.',
    ],
    params: {
      unit: 'cm', x: [-6, 6], y: [-3.6, 3.6],
      sliders: [
        { key: 'I1', label: 'Current $I_1$', min: 1, max: 10, step: 1, value: 6, unit: '\\mathrm{A}', explain: 'Wire 1’s current, out of the page.' },
        { key: 'I2', label: 'Current $I_2$', min: 1, max: 10, step: 1, value: 2, unit: '\\mathrm{A}', explain: 'The size of wire 2’s current.' },
      ],
      choices: [{ key: 's', label: 'Wire 2’s current', options: [[1, 'Same direction'], [-1, 'Opposite direction']], value: 1 }],
      wires: [{ x: -1.5, y: 0, I: 'I1', label: '1', drag: true }, { x: 1.5, y: 0, I: 's*I2', label: '2', drag: true }],
      forces: true, forceOn: 'all', readouts: ['F', 'd'],
    },
    caption: 'Each wire is long and straight, perpendicular to the page: a dot in a circle carries current out of the page, a cross into it. The field lines are those of both wires together. The arrows show which way each force points; the readouts give its exact size, μ₀I₁I₂/(2πd), per metre of wire.',
  },
  example: {
    prompt: t`Two long parallel wires $5.0$ cm apart carry $8.0$ A and $3.0$ A in the same direction. Find the force on each metre of each wire, and whether they attract or repel. ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
    visual: page({
      x: [-4.3, 4.3], y: [-2.2, 2.2],
      curves: [...exG.curves, circ2(-2.5, 0, 5, { color: COL.B, width: 1.4, dash: true, a0: -0.3, a1: 0.3 }), seg2([-2.5, -1.75], [2.5, -1.75], { color: 'ink3', width: 1.2 }), seg2([-2.5, -1.6], [-2.5, -1.9], { color: 'ink3', width: 1.2 }), seg2([2.5, -1.6], [2.5, -1.9], { color: 'ink3', width: 1.2 })],
      points: [...exG.points, lab(-2.5, 0.55, 'wire 1: 8.0 A', 'ink2'), lab(2.85, -0.5, 'wire 2: 3.0 A', 'ink2', 0, 0, 'left'), lab(0, -1.5, 'd = 5.0 cm', 'ink3'), lab(2.05, 1.62, 'wire 1’s field', COL.B, 0, 0, 'right')],
      arrows: [
        { from: [2.5, 0.32], to: [2.5, 1.62], color: COL.B, label: 'B₁', labelDx: 8, labelDy: 0, labelAlign: 'left' },
        { from: [-2.5, -0.32], to: [-2.5, -0.81], color: COL.B, label: 'B₂', labelDx: 8, labelDy: 0, labelAlign: 'left' },
        { from: [2.18, 0], to: [0.95, 0], color: COL.F, label: 'F on 2', labelDx: 0, labelDy: 12 },
        { from: [-2.18, 0], to: [-0.95, 0], color: COL.F, label: 'F on 1', labelDx: 0, labelDy: 12 },
      ],
      caption: 'Both currents come out of the page. Wire 1’s field (teal, dashed) circles it anticlockwise, so at wire 2 it points up the page; wire 2’s field at wire 1 points down. The forces (violet) point at each other. Arrows not to scale.',
    }),
    steps: [
      { label: 'Wire 1’s field at wire 2', text: t`$B_1 = \dfrac{\mu_0 I_1}{2\pi d} = \dfrac{(4\pi\times10^{-7})(8.0)}{2\pi(0.050)} = ${tn(EX.B1)}$ T. With the current coming out of the page, the field circles wire 1 anticlockwise, so at wire 2 it points up the page.` },
      { label: 'The force on wire 2', text: t`$\vec F = I_2\vec L\times\vec B_1$, with $\vec L$ perpendicular to $\vec B_1$, so per metre $F/L = I_2B_1 = (3.0)(${tn(EX.B1)}) = ${tn(EX.F)}$ N/m. Out of the page crossed with up the page points left: toward wire 1.` },
      { label: 'The force on wire 1', text: t`Wire 2’s field at wire 1 is $B_2 = \mu_0 I_2/(2\pi d) = ${tn(EX.B2)}$ T, pointing down the page there, so $F/L = I_1B_2 = (8.0)(${tn(EX.B2)}) = ${tn(EX.F1)}$ N/m, pointing right: toward wire 2.` },
      { label: 'Equal and opposite', text: t`Both are $\dfrac{\mu_0 I_1 I_2}{2\pi d}$. Wire 1 carries more current but sits in the weaker field; wire 2 sits in the stronger field but carries less. The products match, as Newton’s third law demands.` },
      { label: 'Sense check', text: t`$${tn(EX.F * 1e6)}\ \mu$N on each metre is the weight of about ${Math.round((EX.F / G0) * 1e6)} mg: everyday currents pull on each other only feebly. It takes kiloamperes to make the force matter.` },
    ],
    answer: t`$${tn(EX.F * 1e6)}\ \mu$N/m on each wire, attracting.`,
  },
  practice: [
    num({
      id: 'fpl', difficulty: 1,
      gen(r) {
        const I1 = r.pick([4, 6, 10, 15]), I2 = r.pick([2, 5, 8]), dc = r.pick([2, 3, 5, 8]), same = r.bool();
        const F = fpl(I1, I2, dc / 100);
        return {
          prompt: t`Two long parallel wires ${dc} cm apart carry $${I1}$ A and $${I2}$ A in ${same ? 'the same direction' : 'opposite directions'}. What force acts on each metre of each wire?`,
          visual: pairPic({ d: dc, I1, I2: same ? I2 : -I2, caption: `The two wires, ${dc} cm apart, crossing the page, with the field lines of both together.` }),
          answer: F * 1e6, units: 'μN/m', tol: { rel: 0.01 },
          errors: [
            { value: ((MU0 * I1 * I2) / (dc / 100)) * 1e6, feedback: t`A long wire’s field is $\mu_0 I/(2\pi d)$: keep the $2\pi$.` },
            { value: fpl(I1, I2, dc) * 1e6, feedback: 'Convert the separation to metres.' },
            { value: ((MU0 * I1) / (2 * PI * (dc / 100))) * 1e6, feedback: t`That is wire 1’s field at wire 2, in microtesla. The force per metre is that field times the other current, $I_2B_1$.` },
          ],
          hints: [t`Wire 1’s field at wire 2 is $B_1 = \mu_0 I_1/(2\pi d)$; the force per metre on wire 2 is $I_2B_1$.`, t`$\dfrac{F}{L} = \dfrac{(4\pi\times10^{-7})(${I1})(${I2})}{2\pi(${dc / 100})}$.`],
          teach: 'Two long parallel wires each feel F/L = μ₀I₁I₂/(2πd).',
          explain: t`$\dfrac{F}{L} = \dfrac{\mu_0 I_1I_2}{2\pi d} = \dfrac{(4\pi\times10^{-7})(${I1})(${I2})}{2\pi(${dc / 100})} = ${tn(F)}$ N/m $= ${tn(F * 1e6)}\ \mu$N/m on each wire — ${same ? 'attracting' : 'repelling'}.`,
        };
      },
    }),
    mcq({
      id: 'attract', difficulty: 1,
      prompt: 'Two long parallel wires carry currents in the same direction — out of the page in the picture. Which way is the force on wire 2?',
      visual: pairPic({ d: 4, I1: 5, I2: 5, caption: 'Both currents come out of the page. The field lines are those of both wires together.' }),
      choices: ['Toward wire 1: the wires attract', 'Away from wire 1: like currents repel, as like charges do', 'Up the page, along wire 1’s field there', 'Out of the page, along its own current'],
      answer: 0,
      why: {
        1: 'Currents are not charges. The force comes from each wire’s magnetic field, and for currents in the same direction it pulls the wires together.',
        2: t`The magnetic force is perpendicular to the field: $\vec F = I\vec L\times\vec B$. Wire 1’s field at wire 2 points up the page, so the force is sideways, along the line between the wires.`,
        3: t`The force is perpendicular to the current too: $\vec L\times\vec B$ is at right angles to $\vec L$.`,
      },
      hints: [t`Find wire 1’s field at wire 2 with the right-hand rule, then use $\vec F = I\vec L\times\vec B$.`],
      teach: 'Currents in the same direction attract; opposite currents repel — the reverse of the rule for charges.',
      explain: t`Wire 1’s current comes out of the page, so its field circles it anticlockwise and points up the page at wire 2. $\vec F = I_2\vec L\times\vec B_1$, with $\vec L$ out of the page and $\vec B_1$ up the page, points left — toward wire 1.`,
    }),
    mcq({
      id: 'third', difficulty: 2,
      prompt: 'Wire 1 carries 12 A and wire 2 carries 3 A, in the same direction. How do the forces on the two wires compare?',
      visual: pairPic({ d: 4, I1: 12, I2: 3, caption: 'Wire 1 (12 A) and wire 2 (3 A), with the field lines of both: the field is much stronger round wire 1.' }),
      choices: ['They are equal and opposite', 'The force on wire 2 is 4 times bigger: it sits in the stronger field', 'The force on wire 1 is 4 times bigger: it carries more current', 'Only wire 2 feels a force: wire 1’s field overwhelms wire 2’s'],
      answer: 0,
      why: {
        1: t`Wire 2 does sit in the stronger field, but it carries the smaller current: $I_2B_1 = I_2\cdot\mu_0I_1/(2\pi d)$, the same product as $I_1B_2$.`,
        2: 'Wire 1 carries 4 times the current, but it sits in wire 2’s field, which is 4 times weaker. The products are the same.',
        3: t`Each wire feels the other’s field, and both fields are there. The force on wire 1 is $I_1B_2$, not zero.`,
      },
      hints: [t`Write the force per metre on each wire, $I_2B_1$ and $I_1B_2$, where each $B$ comes from the other wire.`],
      teach: 'Two currents push or pull on each other equally, whatever their sizes — Newton’s third law.',
      explain: t`On wire 2: $I_2B_1 = I_2\cdot\dfrac{\mu_0I_1}{2\pi d}$. On wire 1: $I_1B_2 = I_1\cdot\dfrac{\mu_0I_2}{2\pi d}$. Both are $\dfrac{\mu_0I_1I_2}{2\pi d}$, pointing toward each other.`,
    }),
    num({
      id: 'sep', difficulty: 2,
      gen(r) {
        const I1 = r.pick([5, 8, 12, 20]), I2 = r.pick([4, 10, 15]), dTrue = r.pick([1.5, 2.5, 4, 6]);
        const Fu = +(fpl(I1, I2, dTrue / 100) * 1e6).toPrecision(3), F = Fu * 1e-6, d = (MU0 * I1 * I2) / (2 * PI * F);
        return {
          prompt: t`Two long parallel wires carry $${I1}$ A and $${I2}$ A. How far apart must they be for each metre of either wire to feel $${tn(Fu)}\ \mu$N?`,
          visual: pairPic({ d: 4, I1, I2, schematic: true, caption: 'The two wires, with their field lines. Not to scale: the separation is what you are finding.' }),
          answer: d * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [
            { value: ((MU0 * I1 * I2) / F) * 100, feedback: t`Keep the $2\pi$: $d = \mu_0I_1I_2/\big(2\pi(F/L)\big)$.` },
            { value: d * 100 * 1e-6, feedback: 'Convert micronewtons to newtons: 1 μN = 10⁻⁶ N.' },
          ],
          hints: [t`Solve $\dfrac{F}{L} = \dfrac{\mu_0I_1I_2}{2\pi d}$ for $d$.`, t`$d = \dfrac{\mu_0I_1I_2}{2\pi(F/L)} = \dfrac{(4\pi\times10^{-7})(${I1})(${I2})}{2\pi(${tn(F)})}$ m.`],
          teach: 'The force between two wires falls as 1/d: halve the separation and the force doubles.',
          explain: t`$d = \dfrac{\mu_0I_1I_2}{2\pi(F/L)} = \dfrac{(4\pi\times10^{-7})(${I1})(${I2})}{2\pi(${tn(F)})} = ${tn(d)}$ m $= ${tn(d * 100)}$ cm.`,
        };
      },
    }),
    {
      type: 'slider', id: 'set-d', difficulty: 2, param: 'd',
      instruction: 'Drag the separation slider to the right value, then check.',
      gen(r) {
        const I1 = r.pick([6, 8, 10]), I2 = r.pick([3, 5]), dc = r.pick([2, 2.5, 3, 4, 5, 6]);
        const Fu = +(fpl(I1, I2, dc / 100) * 1e6).toPrecision(3);
        return {
          prompt: t`Wire 1 carries $${I1}$ A and wire 2 carries $${I2}$ A, in the same direction. Set their separation $d$ so that each metre of either wire feels $${tn(Fu)}\ \mu$N.`,
          answer: [r6(dc - 0.15), r6(dc + 0.15)],
          hints: [t`Solve for $d$: $d = \dfrac{\mu_0I_1I_2}{2\pi(F/L)}$, then convert to centimetres.`],
          teach: 'To set a force between two wires, solve F/L = μ₀I₁I₂/(2πd) for the separation.',
          explain: t`$d = \dfrac{(4\pi\times10^{-7})(${I1})(${I2})}{2\pi(${tn(Fu * 1e-6)})} = ${tn(dc / 100)}$ m $= ${dc}$ cm.`,
          visual: {
            type: 'em-bfield',
            params: {
              unit: 'cm', x: [-5.2, 5.2], y: [-2.9, 2.9],
              sliders: [{ key: 'd', label: 'Separation $d$', min: 1, max: 8, step: 0.1, value: dc > 4 ? 1.5 : 7.5, unit: '\\mathrm{cm}', explain: 'The distance between the wires.' }],
              wires: [{ x: '-d/2', y: 0, I: I1, label: '1' }, { x: 'd/2', y: 0, I: I2, label: '2' }],
              forces: true, readouts: [],
            },
            caption: 'Two long wires crossing the page, with the field lines of both and the force on each (violet).',
          },
        };
      },
    },
    mcq({
      id: 'railgun', difficulty: 2,
      prompt: 'In a railgun, a huge current runs out along one rail, across the projectile, and back along the other rail. Besides driving the projectile, what does the current do to the two rails?',
      visual: page({
        x: [-4.2, 4.2], y: [-1.8, 1.8],
        curves: [
          seg2([-3.6, 0.8], [3.4, 0.8], { color: 'ink2', width: 7 }), seg2([-3.6, -0.8], [3.4, -0.8], { color: 'ink2', width: 7 }),
          seg2([2.6, 0.8], [2.6, -0.8], { color: 'warn', width: 11 }),
          seg2([-3.6, 0.8], [-3.6, 0.25], { color: 'ink3', width: 1.6 }), seg2([-3.6, -0.8], [-3.6, -0.25], { color: 'ink3', width: 1.6 }), circ2(-3.6, 0, 0.25, { color: 'ink3', width: 1.6 }),
        ],
        points: [lab(-3.05, 0, 'supply', 'ink3', 0, 0, 'left'), lab(2.6, -1.25, 'projectile', 'warn'), lab(-0.5, 1.3, 'rail', 'ink2'), lab(-0.5, -1.3, 'rail', 'ink2')],
        arrows: [
          { from: [-1.8, 0.52], to: [0.8, 0.52], color: COL.I, label: 'I', labelDx: 0, labelDy: -14 },
          { from: [0.8, -0.52], to: [-1.8, -0.52], color: COL.I, label: 'I', labelDx: 0, labelDy: 14 },
          { from: [2.95, 0.45], to: [2.95, -0.45], color: COL.I, label: 'I', labelDx: 9, labelDy: 0, labelAlign: 'left' },
        ],
        caption: 'A railgun seen from above: the current (blue) runs out along the top rail, down through the projectile (amber), and back along the bottom rail. Schematic.',
      }),
      choices: ['Pushes them apart: their currents run in opposite directions', 'Pulls them together: opposite currents attract, as opposite charges do', 'Nothing: the rails are parts of one circuit, so they cannot push on each other', 'Pulls them together: any two current-carrying conductors attract'],
      answer: 0,
      why: {
        1: 'Currents are not charges: here the rule is reversed, and opposite currents repel.',
        2: 'Parts of one circuit push and pull on each other just as separate wires do: each rail sits in the other’s field.',
        3: 'Only currents in the same direction attract. These run in opposite directions, so they repel.',
      },
      hints: ['The two rails carry the same current. In the same direction, or opposite directions?'],
      teach: 'Opposite currents repel: the conductors of any out-and-back circuit are pushed apart.',
      explain: t`The rails carry the same current in opposite directions, so they repel, with $F/L = \mu_0I^2/(2\pi d)$. At a railgun’s megaampere currents, rails 10 cm apart, the formula gives millions of newtons per metre — which is why railgun rails are held in a massive containment frame.`,
    }),
    num({
      id: 'three', difficulty: 3,
      gen(r) {
        const IA = r.pick([4, 6, 10]), IB = r.pick([2, 3, 5]), IC = r.pick([3, 8, 12]), cSame = r.bool(), dc = r.pick([2, 3, 4]);
        const d = dc / 100, FA = fpl(IA, IB, d), FC = fpl(IC, IB, d);
        // + is toward A (to the left): A pulls B toward A; C pulls B toward C if same, pushes it toward A if opposite
        const net = cSame ? FA - FC : FA + FC, F = Math.abs(net);
        const wrong = cSame ? FA + FC : Math.abs(FA - FC);
        return {
          prompt: t`Three long parallel wires lie in a row, ${dc} cm apart: A, then B, then C. A carries $${IA}$ A and B carries $${IB}$ A, both out of the page; C carries $${IC}$ A ${cSame ? 'out of' : 'into'} the page. What is the size of the net force on each metre of wire B?`,
          visual: wirePic({ wires: [[-dc, 0, IA, 'A'], [0, 0, IB, 'B'], [dc, 0, cSame ? IC : -IC, 'C']], x: [r6(-2 * dc), r6(2 * dc)], y: [r6(-1.13 * dc), r6(1.13 * dc)], caption: `Wires A, B and C, ${dc} cm apart, crossing the page, with the field lines of all three together.` }),
          answer: F * 1e6, units: 'μN/m', tol: { rel: 0.01 },
          errors: [
            { value: wrong * 1e6, feedback: cSame ? 'A and C both carry current the same way as B, so each pulls B toward itself — in opposite directions. Subtract.' : 'C’s current is opposite to B’s, so C pushes B away — toward A, the same way A pulls it. Add.' },
            { value: F * 1e4, feedback: 'Convert the spacing to metres.' },
          ],
          hints: ['Find the force from A and the force from C separately: same-direction currents attract, opposite ones repel.', t`Each is $\mu_0 I_B I/(2\pi d)$ with $d = ${d}$ m. Do they point the same way, or opposite ways?`],
          teach: 'Forces from several wires add as vectors: find each pair’s attraction or repulsion, then combine them.',
          explain: t`From A: $${tn(FA * 1e6)}\ \mu$N/m toward A. From C: $${tn(FC * 1e6)}\ \mu$N/m ${cSame ? 'toward C' : 'away from C, which is also toward A'}. Net: $${tn(F * 1e6)}\ \mu$N/m toward ${net >= 0 ? 'A' : 'C'}.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-busbar', difficulty: 3, transfer: true,
      gen(r) {
        const dc = r.pick([5, 8, 10]), IkA = r.pick([20, 30, 40]);
        const I = IkA * 1e3, F = fpl(I, I, dc / 100);
        const h = 0.5, x0 = dc / 20;
        return {
          prompt: t`A test stand’s DC power supply feeds its load through two long, parallel copper busbars ${dc} cm apart — one carries the current out, the other brings it back. A short circuit drives a fault current of ${IkA} kA through them. Treating the bars as thin wires, what is the force on each metre of busbar?`,
          visual: page({
            x: [-1.6, 1.6], y: [-0.85, 0.85],
            curves: [
              ...[-x0, x0].flatMap((x) => [seg2([x - 0.08, -h], [x + 0.08, -h], { color: 'warn', width: 2 }), seg2([x + 0.08, -h], [x + 0.08, h], { color: 'warn', width: 2 }), seg2([x + 0.08, h], [x - 0.08, h], { color: 'warn', width: 2 }), seg2([x - 0.08, h], [x - 0.08, -h], { color: 'warn', width: 2 })]),
              circ2(-x0, 0, 0.055, { color: 'ink', width: 1.6 }), circ2(x0, 0, 0.055, { color: 'ink', width: 1.6 }),
              seg2([x0 - 0.035, -0.035], [x0 + 0.035, 0.035], { color: 'ink', width: 1.6 }), seg2([x0 - 0.035, 0.035], [x0 + 0.035, -0.035], { color: 'ink', width: 1.6 }),
              seg2([-x0, -0.68], [x0, -0.68], { color: 'ink3', width: 1.2 }), seg2([-x0, -0.62], [-x0, -0.74], { color: 'ink3', width: 1.2 }), seg2([x0, -0.62], [x0, -0.74], { color: 'ink3', width: 1.2 }),
            ],
            points: [{ x: -x0, y: 0, r: 2.4, color: 'ink' }, lab(-x0 - 0.16, 0.3, 'out', 'ink2', 0, 0, 'right'), lab(x0 + 0.16, 0.3, 'back', 'ink2', 0, 0, 'left'), lab(0, -0.8, `${dc} cm`, 'ink3')],
            caption: 'The two busbars cut across, end on (current out of the page in one, into it in the other). Schematic: real bars are wide compared with their spacing, and full calculations correct for their shape.',
          }),
          answer: F / 1e3, units: 'kN/m', tol: { rel: 0.01 },
          errors: [
            { value: fpl(IkA, IkA, dc / 100) / 1e3, feedback: 'Convert kiloamperes to amperes. The force goes as the current squared, so this slip is a factor of a million.' },
            { value: ((MU0 * I * I) / (dc / 100)) / 1e3, feedback: t`Keep the $2\pi$: $F/L = \mu_0 I^2/(2\pi d)$.` },
            { value: fpl(I, I, dc) / 1e3, feedback: 'Convert the spacing to metres.' },
          ],
          hints: [t`Both bars carry the same current $I$, so $F/L = \mu_0 I^2/(2\pi d)$.`, t`$\dfrac{F}{L} = \dfrac{(4\pi\times10^{-7})(${IkA}\times10^{3})^2}{2\pi(${dc / 100})}$ N/m.`],
          teach: 'The force between conductors grows as the current squared — so a fault current, not the working current, sets how strongly busbars must be braced.',
          explain: t`$\dfrac{F}{L} = \dfrac{\mu_0 I^2}{2\pi d} = \dfrac{(4\pi\times10^{-7})(${IkA}\times10^{3})^2}{2\pi(${dc / 100})} = ${tn(F)}$ N/m $= ${tn(F / 1e3)}$ kN/m — the weight of about ${Math.round(F / G0 / 10) * 10} kg on every metre, pushing the bars apart (their currents are opposite). Ten times the current gives a hundred times the force, so busbar supports are sized for the fault, not the working current; and a fault current’s first peak can be well over twice its steady value.`,
        };
      },
    }),
    mcq({
      id: 'cp-slinky', difficulty: 2,
      prompt: 'A current is passed through a loose, springy coil of wire hanging from its top end. What do its turns do?',
      visual: {
        type: 'em-bfield',
        params: { unit: 'cm', x: [-5.5, 5.5], y: [-3.1, 3.1], solenoid: { x0: -3.5, x1: 3.5, R: 1.4, N: 7, I: 3 }, lines: true, readouts: [], static: true, axes: false, grid: false },
        caption: 'The spring cut through its axis, with its field lines: along each side, every turn carries current the same way as its neighbours. Schematic.',
      },
      choices: ['They pull together, so the spring shortens', 'They push apart, so the spring lengthens: neighbouring currents are alike, and like repels like', 'Nothing: the turns are all one wire, so they cannot pull on each other', 'They twist the spring round its axis'],
      answer: 0,
      why: {
        1: 'Like currents attract — the reverse of the rule for charges. Neighbouring turns carry current the same way, so they pull together.',
        2: 'Parts of one wire push and pull on each other just as separate wires do: each turn sits in the field of the others.',
        3: 'The forces between turns pull them together along the axis; nothing pushes them round it.',
      },
      hints: ['Compare the current in one turn with the current in the turn next to it.'],
      teach: 'Neighbouring turns of a coil carry parallel currents, so they attract: coils squeeze themselves along their length.',
      explain: 'Neighbouring turns carry current in the same direction, so they attract, and the spring shortens. If its bottom end dips into a conducting liquid, the shortening lifts it out and breaks the circuit; the spring drops back, and the cycle repeats — the bobbing “Roget’s spiral” demonstration. The same attraction squeezes the windings of high-current magnets, which must be clamped against it.',
    }),
    num({
      id: 'cp-third', difficulty: 2,
      gen(r) {
        const [I1, I2] = r.pick([[2, 8], [5, 15], [20, 4], [12, 40]]), dc = r.pick([2, 4, 5]);
        const F = fpl(I1, I2, dc / 100) * 1e6;
        return {
          prompt: t`Wire 1 carries $${I1}$ A; wire 2, parallel to it and ${dc} cm away, carries $${I2}$ A. Each metre of wire 1 feels a force of $${tn(F)}\ \mu$N. What force does each metre of wire 2 feel?`,
          visual: pairPic({ d: dc, I1, I2, caption: `Wire 1 (${I1} A) and wire 2 (${I2} A), ${dc} cm apart, with the field lines of both.` }),
          answer: F, units: 'μN/m', tol: { rel: 0.01 },
          errors: [
            { value: (F * I2) / I1, feedback: 'The force is not in proportion to the wire’s own current alone: the wire with more current sits in the weaker field. The two forces are equal.' },
            { value: (F * I1) / I2, feedback: 'The wire in the stronger field carries the smaller current. Both forces are μ₀I₁I₂/(2πd): equal.' },
          ],
          hints: [t`Write both forces with $F/L = \mu_0I_1I_2/(2\pi d)$.`],
          teach: 'The forces two currents exert on each other are equal and opposite, whatever the currents.',
          explain: t`The same: $${tn(F)}\ \mu$N/m, in the opposite direction. Each force is $\mu_0I_1I_2/(2\pi d)$ — Newton’s third law.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §12.3', url: 'https://openstax.org/books/university-physics-volume-2/pages/12-3-magnetic-force-between-two-parallel-currents' },
    { label: 'BIPM: the SI Brochure (2019 redefinition of the ampere)', url: 'https://www.bipm.org/en/publications/si-brochure' },
  ],
});
