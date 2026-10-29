// The Biot–Savart law: every short piece of current adds a contribution to B,
// inverse-square like Coulomb's law but with a cross product, so it circles
// the piece. Summed: B = μ₀I/(2πr) round a long wire, μ₀I/(2R) at the centre of
// a loop, μ₀IR²/(2(R² + z²)^{3/2}) along its axis.
import { lesson, mcq, num } from '../../src/core/content.js';
import { MU0, COL, tn, r4, r6, lab, seg2, circ2, page } from './_magnet.js';

const t = String.raw;
const PI = Math.PI;

// ─── pictures ───────────────────────────────────────────────────────────────
// a long straight wire across the page, with a point P (positions in cm)
const wirePic = ({ I = 5, px, py, lines = true, arrow = true, caption, x = [-6, 6], y = [-3.6, 3.6] }) => ({
  type: 'em-bfield',
  params: { unit: 'cm', x, y, wires: [{ x: 0, y: 0, I }], lines, density: 0.8, probe: { x: px, y: py, label: 'P' }, probeArrow: arrow, readouts: [], static: true, labels: false },
  caption,
});
// a coil cut through its axis (radius in cm), with field lines and an optional point on the axis
const loopPic = ({ R, I = 1, px = null, caption, x, y }) => ({
  type: 'em-bfield',
  params: { unit: 'cm', x: x ?? [-2.6 * R, 2.6 * R], y: y ?? [-1.6 * R, 1.6 * R], loops: [{ x: 0, R, I }], lines: true, readouts: [], static: true, ...(px !== null ? { probe: { x: px, y: 0, label: 'P' } } : {}) },
  caption,
});
// a flat loop in the page with its current going round anticlockwise (or clockwise)
function pageLoop({ ccw = true, caption, mark = true }) {
  const R2 = 1.95, sg = ccw ? 1 : -1, starts = [0.3, 2.4, 4.5];
  const curves = [circ2(0, 0, 1.6, { color: 'ink2', width: 3 }), ...starts.map((a) => circ2(0, 0, R2, { color: COL.I, width: 2, a0: Math.min(a, a + sg * 0.55), a1: Math.max(a, a + sg * 0.55) }))];
  const arrows = starts.map((a) => {
    const e = a + sg * 0.55, b = e - sg * 0.12;
    return { from: [r4(R2 * Math.cos(b)), r4(R2 * Math.sin(b))], to: [r4(R2 * Math.cos(e)), r4(R2 * Math.sin(e))], color: COL.I };
  });
  return page({
    x: [-3, 3], y: [-2.2, 2.2],
    curves,
    arrows,
    points: [...(mark ? [{ x: 0, y: 0, r: 4, color: 'gold', label: 'centre', labelDx: 8, labelDy: -10 }] : []), lab(r4(2.3 * Math.cos(0.3 + sg * 0.3)), r4(2.3 * Math.sin(0.3 + sg * 0.3)), 'I', COL.I)],
    caption,
  });
}

// the worked example: a 50-turn coil
const EX = { N: 50, R: 0.04, I: 2.0 };
EX.Bc = (EX.N * MU0 * EX.I) / (2 * EX.R);
EX.Bz = EX.Bc / 2 ** 1.5;

// four positions round a wire, and the field direction there for a current out of the page
const AROUND = { right: [[2.4, 0], [0, 1]], left: [[-2.4, 0], [0, -1]], above: [[0, 1.8], [-1, 0]], below: [[0, -1.8], [1, 0]] };
const WORD = (v) => (v[0] > 0 ? 'to the right' : v[0] < 0 ? 'to the left' : v[1] > 0 ? 'up the page' : 'down the page');

export default lesson({
  id: 'phys2220.B2.1',
  title: 'The Biot–Savart law',
  minutes: 13, difficulty: 3,
  intro: t`Currents make magnetic fields, and every short piece of current makes its own contribution:

$$d\vec B = \frac{\mu_0}{4\pi}\,\frac{I\,d\vec l\times\hat r}{r^2}$$

It is an inverse-square law, like Coulomb’s — but with a **cross product**, so each piece’s field points neither toward it nor away from it but **round** it, perpendicular both to the piece and to the line $\vec r$ from the piece to the point. Add up the pieces and you have the field of any circuit. A long straight wire: circles round it, $B = \mu_0 I/(2\pi r)$ (point your right thumb along the current and your fingers curl the way $\vec B$ goes). The centre of a loop: $B = \mu_0 I/(2R)$, along its axis.`,
  symbols: [
    { tex: 'd\\vec B', text: 'the contribution to the field from one short piece of current, in T' },
    { tex: '\\mu_0', text: 'the permeability of free space, $4\\pi\\times10^{-7}$ T·m/A (to nine figures): it sets the strength of magnetism the way $\\varepsilon_0$ sets that of electricity' },
    { tex: 'I\\,d\\vec l', text: 'a current element: the current $I$ (A) times a short piece of wire $d\\vec l$ (m), pointing along the current' },
    { tex: '\\vec r,\\ \\hat r', text: '$\\vec r$ runs from the piece of wire to the point where you want the field; $r$ is its length (m) and $\\hat r = \\vec r/r$ its direction' },
    { tex: 'B = \\dfrac{\\mu_0 I}{2\\pi r}', text: 'the result for a long straight wire, at distance $r$ from it' },
    { tex: 'B = \\dfrac{\\mu_0 I}{2R}', text: 'the result at the centre of a circular loop of radius $R$; $N$ turns give $N$ times as much' },
  ],
  why: 'It is how every magnetic field of a circuit is calculated — the solenoids of MRI scanners, the coils that steer particle beams, the stray fields a spacecraft’s wiring makes around its own instruments.',
  visual: {
    type: 'calc-vectors3d',
    title: 'Build a loop’s field one piece at a time',
    lead: t`A circular loop (grey) carries a current anticlockwise as seen from above. Pick one short piece of it, $I\,d\vec l$ (blue), with the angle $\phi$. Its contribution $d\vec B$ (teal) at the point P on the axis is perpendicular both to the piece and to the dashed line $\vec r$ from the piece to P.`,
    tasks: [
      'Move the piece round the loop with φ: dB swings round a cone, always at right angles to r.',
      'Show the ring of eight contributions: their sideways parts cancel in opposite pairs, and their parts along the axis add up.',
      'Raise P with h: each dB shrinks as 1/r² and tilts outward, so the total along the axis falls fast — as 1/z³ far away.',
    ],
    params: {
      range: 3,
      constants: { R: 1.6 },
      sliders: [
        { key: 'phi', label: 'Where the piece is, $\\phi$', min: 0, max: 360, step: 5, value: 60, unit: '^\\circ', explain: 'The angle of the current element round the loop.' },
        { key: 'h', label: 'Height $h$ of P above the loop’s centre', min: 0, max: 3, step: 0.1, value: 1.2, explain: 'In units where the loop’s radius is 1.6.' },
      ],
      toggles: [{ key: 'ring', label: 'Show the contributions of eight pieces', value: false }, { key: 'tot', label: 'Show the total field at P', value: false }],
      curves: [{ param: ['R*cos(t)', 'R*sin(t)', 0], t: [0, 2 * PI], color: 'ink2', width: 2.4 }],
      vectors: [
        { from: ['R*cos(phi*pi/180) + 0.32*sin(phi*pi/180)', 'R*sin(phi*pi/180) - 0.32*cos(phi*pi/180)', 0], to: ['R*cos(phi*pi/180) - 0.32*sin(phi*pi/180)', 'R*sin(phi*pi/180) + 0.32*cos(phi*pi/180)', 0], color: COL.I, label: 'I\\,d\\vec l' },
        { from: ['R*cos(phi*pi/180)', 'R*sin(phi*pi/180)', 0], to: [0, 0, 'h'], color: 'gold', dash: true, label: '\\vec r', width: 1.6 },
        { from: [0, 0, 'h'], to: ['2.2*R^2*h*cos(phi*pi/180)/(R^2 + h^2)^1.5', '2.2*R^2*h*sin(phi*pi/180)/(R^2 + h^2)^1.5', 'h + 2.2*R^3/(R^2 + h^2)^1.5'], color: COL.B, label: 'd\\vec B' },
        ...Array.from({ length: 8 }, (_, k) => ({ from: [0, 0, 'h'], to: [`2.2*R^2*h*cos(${k * 45}*pi/180)/(R^2 + h^2)^1.5`, `2.2*R^2*h*sin(${k * 45}*pi/180)/(R^2 + h^2)^1.5`, 'h + 2.2*R^3/(R^2 + h^2)^1.5'], color: 'ink3', width: 1.6, when: 'ring' })),
        { from: [0, 0, 'h'], to: [0, 0, 'h + 2.6*R^3/(R^2 + h^2)^1.5'], color: 'teal', width: 4.5, label: '\\vec B', when: 'tot' },
      ],
      points: [{ at: [0, 0, 'h'], color: 'gold', label: '\\text{P}' }],
      readouts: [
        { label: '$z/R$ for P', expr: 'h/R', digits: 3 },
        { label: '$B$ at P, for $I = 10$ A and $R = 5$ cm', expr: '1e6*4*pi*1e-7*10*0.05^2/(2*(0.05^2 + (h*0.05/R)^2)^1.5)', unit: '\\mu\\mathrm{T}', digits: 3 },
      ],
    },
    caption: 'The pieces’ contributions are drawn to one scale, the total B to its own (it is the sum of every piece round the loop). Directions are exact. Drag to rotate.',
  },
  example: {
    prompt: t`A flat circular coil of 50 turns and radius 4.0 cm carries 2.0 A. Find the field at its centre, and on its axis 4.0 cm from the centre. ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
    visual: loopPic({ R: 4, I: 2, px: 4, caption: 'The coil cut through its axis (it crosses the page at the dot and the cross), with its field lines; P is on the axis, one radius from the centre.' }),
    steps: [
      { label: 'At the centre', text: t`Every piece of the loop is the same distance $R$ away and at right angles to $\vec r$, so every $dB$ points along the axis and they all add: $B = N\dfrac{\mu_0 I}{2R} = 50\cdot\dfrac{(4\pi\times10^{-7})(2.0)}{2(0.040)} = ${tn(EX.Bc)}$ T $= ${tn(EX.Bc * 1e3)}$ mT.` },
      { label: 'On the axis', text: t`Off-centre, each piece’s $d\vec B$ tilts; the sideways parts cancel round the loop and only the axial parts survive: $B = N\dfrac{\mu_0 IR^2}{2(R^2 + z^2)^{3/2}}$.` },
      { label: 'At z = R', text: t`$(R^2 + R^2)^{3/2} = 2^{3/2}R^3$, so $B = \dfrac{B_{\text{centre}}}{2^{3/2}} = ${tn(EX.Bc * 1e3)}\times0.354 = ${tn(EX.Bz * 1e3)}$ mT.` },
      { label: 'Sense check', text: t`About 30 times Earth’s field at the centre, falling to a third of that one radius away. Far out on the axis the field falls as $1/z^3$ — the coil looks like a small bar magnet.` },
    ],
    answer: t`$${tn(EX.Bc * 1e3)}$ mT at the centre; $${tn(EX.Bz * 1e3)}$ mT on the axis 4.0 cm away.`,
  },
  practice: [
    num({
      id: 'wire-B', difficulty: 1,
      gen(r) {
        const I = r.pick([2, 5, 12, 25, 60]), rc = r.pick([0.5, 1.5, 3, 8, 20]), B = (MU0 * I) / (2 * PI * rc / 100);
        return {
          prompt: t`A long straight wire carries $${I}$ A. What is the magnetic field ${rc} cm from it? ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          visual: wirePic({ I, px: rc, py: 0, arrow: false, x: [r6(-2.5 * rc), r6(2.5 * rc)], y: [r6(-1.5 * rc), r6(1.5 * rc)], caption: 'The wire seen end-on (current out of the page), its circular field lines, and the point P.' }),
          answer: B * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * I) / (rc / 100)) * 1e6, feedback: t`Divide by $2\pi r$, the circumference of the circle the field runs round.` }, { value: ((MU0 * I) / (4 * PI * rc / 100)) * 1e6, feedback: t`For a long wire it is $\mu_0 I/(2\pi r)$; the $4\pi$ belongs to a single current element.` }],
          hints: [t`$B = \dfrac{\mu_0 I}{2\pi r}$, with $r$ in metres.`, t`$\mu_0/(2\pi) = 2\times10^{-7}$ T·m/A, so $B = 2\times10^{-7}\cdot ${I}/${rc / 100}$ T.`],
          teach: 'A long straight wire’s field circles it with strength μ₀I/(2πr): it falls off as 1/r.',
          explain: t`$B = \dfrac{\mu_0 I}{2\pi r} = \dfrac{(4\pi\times10^{-7})(${I})}{2\pi(${rc / 100})} = ${tn(B)}$ T $= ${tn(B * 1e6)}\ \mu\text{T}$.`,
        };
      },
    }),
    mcq({
      id: 'grip', difficulty: 2,
      gen(r) {
        const where = r.pick(Object.keys(AROUND)), out = r.bool(0.5), [[px, py], d0] = AROUND[where];
        const d = out ? d0 : [-d0[0], -d0[1]];
        const radial = [Math.sign(px), Math.sign(py)];
        return {
          prompt: `A long straight wire carries a current ${out ? 'out of' : 'into'} the page. Which way does its magnetic field point at P, ${where === 'right' ? 'to the right of' : where === 'left' ? 'to the left of' : where === 'above' ? 'above' : 'below'} the wire?`,
          visual: wirePic({ I: out ? 5 : -5, px, py, lines: false, arrow: false, caption: `The wire seen end-on: current ${out ? 'out of the page (dot)' : 'into the page (cross)'}. Not to scale.` }),
          choices: [WORD(d), WORD([-d[0], -d[1]]), `${WORD(radial)}, straight away from the wire`, `${WORD([-radial[0], -radial[1]])}, straight toward the wire`].map((w) => w[0].toUpperCase() + w.slice(1)),
          answer: 0,
          why: {
            1: `That is the way round the field goes for a current ${out ? 'into' : 'out of'} the page. Point your right thumb along the current — ${out ? 'toward you' : 'away from you'} — and follow your fingers.`,
            2: 'That is how the electric field of a charged wire points. A magnetic field circles a current; it never points away from it.',
            3: 'A magnetic field circles a current; it never points straight at it.',
          },
          hints: [`Right-hand grip: thumb along the current (${out ? 'out of the page, toward you' : 'into the page, away from you'}), fingers curl the way B goes.`, `Seen from where you are, the field goes ${out ? 'anticlockwise' : 'clockwise'} round the wire. Which way is that at P?`],
          teach: 'The field of a straight current circles it: thumb along the current, fingers curl the way B goes.',
          explain: `For a current ${out ? 'out of' : 'into'} the page the field circles ${out ? 'anticlockwise' : 'clockwise'} as you see it, so at P, ${where === 'right' ? 'to the right' : where === 'left' ? 'to the left' : where === 'above' ? 'above the wire' : 'below the wire'}, it points ${WORD(d)} — tangent to the circle through P.`,
        };
      },
    }),
    num({
      id: 'loop-centre', difficulty: 2,
      gen(r) {
        const N = r.pick([1, 20, 50, 200]), Rc = r.pick([2, 4, 6, 10]), I = r.pick([0.5, 1.5, 3]);
        const B = (N * MU0 * I) / (2 * Rc / 100);
        return {
          prompt: t`A flat circular coil of ${N === 1 ? 'a single turn' : `${N} turns`} and radius ${Rc} cm carries $${I}$ A. What is the field at its centre? ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          visual: loopPic({ R: Rc, I, caption: 'The coil cut through its axis: it crosses the page at the dot and the cross. Its field lines thread through the middle.' }),
          answer: B * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [
            ...(N > 1 ? [{ value: ((MU0 * I) / (2 * Rc / 100)) * 1e6, feedback: t`Each of the ${N} turns adds the same field at the centre: multiply by $N$.` }] : []),
            { value: ((N * MU0 * I) / (2 * PI * Rc / 100)) * 1e6, feedback: t`$\mu_0 I/(2\pi r)$ is a long straight wire. At the centre of a loop it is $\mu_0 I/(2R)$ — every piece is at right angles to $\vec r$, so none is wasted.` },
          ],
          hints: [t`At the centre, every piece of the loop is a distance $R$ away with $d\vec l \perp \hat r$, and all the $dB$ point the same way.`, t`$B = N\dfrac{\mu_0 I}{2R}$, with $R$ in metres.`],
          teach: 'At the centre of a flat coil, B = Nμ₀I/(2R): all its pieces push the field the same way.',
          explain: t`$B = N\dfrac{\mu_0 I}{2R} = ${N}\cdot\dfrac{(4\pi\times10^{-7})(${I})}{2(${Rc / 100})} = ${tn(B)}$ T $= ${tn(B * 1e6)}\ \mu\text{T}$.`,
        };
      },
    }),
    num({
      id: 'on-axis', difficulty: 3,
      gen(r) {
        const N = r.pick([10, 40, 100]), Rc = r.pick([3, 5, 8]), I = r.pick([1, 2.5, 4]), k = r.pick([0.5, 0.75, 1.5, 2]);
        const z = k * Rc, B = (N * MU0 * I * (Rc / 100) ** 2) / (2 * (((Rc / 100) ** 2 + (z / 100) ** 2) ** 1.5));
        return {
          prompt: t`A coil of ${N} turns and radius ${Rc} cm carries $${I}$ A. What is the field on its axis, ${tn(z)} cm from its centre?`,
          visual: loopPic({ R: Rc, I, px: r6(z), x: [-3.2 * Rc, 3.2 * Rc], y: [-1.8 * Rc, 1.8 * Rc], caption: 'The coil cut through its axis, with P on the axis. The field there points along the axis.' }),
          answer: B * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: ((N * MU0 * I) / (2 * Rc / 100)) * 1e6, feedback: t`That is the field at the centre. Off-centre, use $\dfrac{\mu_0 IR^2}{2(R^2 + z^2)^{3/2}}$.` }, { value: ((N * MU0 * I) / (2 * PI * Math.sqrt((Rc / 100) ** 2 + (z / 100) ** 2))) * 1e6, feedback: 'A coil is not a long straight wire: only the axial parts of the pieces’ fields survive.' }],
          hints: [t`On the axis, $B = N\dfrac{\mu_0 IR^2}{2(R^2 + z^2)^{3/2}}$.`, t`Here $z = ${k}R$, so $(R^2 + z^2)^{3/2} = R^3(1 + ${k}^2)^{3/2}$ and $B = B_{\text{centre}}/(1 + ${k}^2)^{3/2}$.`],
          teach: 'Along a coil’s axis the field is $N\\mu_0IR^2/\\big(2(R^2 + z^2)^{3/2}\\big)$: the centre value, shrunk as P moves away.',
          explain: t`$B_{\text{centre}} = N\mu_0I/(2R) = ${tn((N * MU0 * I) / (2 * Rc / 100))}$ T and $(1 + ${k}^2)^{3/2} = ${tn((1 + k * k) ** 1.5)}$, so $B = ${tn(B)}$ T $= ${tn(B * 1e6)}\ \mu\text{T}$.`,
        };
      },
    }),
    mcq({
      id: 'which-piece', difficulty: 2, fixedOrder: true,
      prompt: t`A wire carrying a current is bent as shown. Which straight piece of it adds **nothing** to the magnetic field at the point P?`,
      visual: page({
        x: [-3.6, 3.2], y: [-1.6, 2.2],
        curves: [seg2([-3.4, 0], [-1.0, 0], { color: 'ink2', width: 3 }), seg2([-1.0, 0], [-1.0, 1.6], { color: 'ink2', width: 3 }), seg2([-1.0, 1.6], [2.2, 1.6], { color: 'ink2', width: 3 }), seg2([2.2, 1.6], [2.2, -1.3], { color: 'ink2', width: 3 }), seg2([-1.0, 0], [0.8, 0], { color: 'ink4', width: 1, dash: true })],
        arrows: [{ from: [-2.6, 0], to: [-1.9, 0], color: COL.I }, { from: [-1.0, 0.5], to: [-1.0, 1.1], color: COL.I }, { from: [0.2, 1.6], to: [0.9, 1.6], color: COL.I }, { from: [2.2, 0.5], to: [2.2, -0.2], color: COL.I }],
        points: [{ x: 0.8, y: 0, r: 5, color: 'gold', label: 'P', labelDx: 8, labelDy: -10 }, lab(-2.2, -0.32, 'A', 'ink2'), lab(-1.35, 0.8, 'B', 'ink2'), lab(0.6, 1.95, 'C', 'ink2'), lab(2.55, 0.15, 'D', 'ink2')],
        caption: 'The bent wire (grey) with its current (blue), and the point P on the line of piece A (dashed). Not to scale.',
      }),
      choices: ['A — the piece that points straight at P', 'B — the piece that rises from the end of A', 'C — the long piece above P', 'D — the piece on the far side of P, whose current flows down the page'],
      answer: 0,
      why: {
        1: t`B runs at an angle to the lines from its pieces to P, so $d\vec l\times\hat r \ne 0$ along it.`,
        2: 'Distance weakens a piece’s field (as 1/r²) but never makes it exactly zero; and C runs across the line to P.',
        3: 'Its direction only sets which way its contribution points, not whether it has one.',
      },
      hints: [t`Each piece adds $d\vec B \propto I\,d\vec l\times\hat r$. When is a cross product zero?`, t`$d\vec l\times\hat r = 0$ when the piece points along the line to P.`],
      teach: 'A current element contributes nothing at points along its own line: dl × r̂ = 0 there.',
      explain: t`Every bit of piece A points along the line to P, so $d\vec l\times\hat r = 0$ all along it. The other pieces each add something — this is why the straight leads into a coil, aimed at its centre, add nothing to the field there.`,
    }),
    num({
      id: 'hairpin', difficulty: 3,
      gen(r) {
        const Rc = r.pick([2, 3, 5]), I = r.pick([4, 6, 10]), B = (MU0 * I) / (4 * Rc / 100);
        return {
          prompt: t`A long wire runs in along a straight line, bends round a semicircle of radius ${Rc} cm, and leaves along the same straight line, carrying $${I}$ A. What is the field at the centre of the semicircle?`,
          visual: page({
            x: [-3.2, 3.2], y: [-0.8, 2.0],
            curves: [seg2([-3.1, 0], [-1.6, 0], { color: 'ink2', width: 3 }), circ2(0, 0, 1.6, { color: 'ink2', width: 3, a0: 0, a1: PI }), seg2([1.6, 0], [3.1, 0], { color: 'ink2', width: 3 })],
            arrows: [{ from: [-2.7, 0], to: [-2.0, 0], color: COL.I }, { from: [r4(-1.6 * Math.cos(0.5)), r4(1.6 * Math.sin(0.5))], to: [r4(-1.6 * Math.cos(0.9)), r4(1.6 * Math.sin(0.9))], color: COL.I }, { from: [2.0, 0], to: [2.7, 0], color: COL.I }],
            points: [{ x: 0, y: 0, r: 5, color: 'gold', label: 'centre', labelDx: -22, labelDy: 14 }],
            caption: 'The wire (grey): in along a straight line, round a semicircle, out along the same line. The current is blue.',
          }),
          answer: B * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * I) / (2 * Rc / 100)) * 1e6, feedback: 'That is a whole loop. Here only half a circle carries current round the centre.' }, { value: ((MU0 * I) / (4 * Rc / 100) + (MU0 * I) / (2 * PI * Rc / 100)) * 1e6, feedback: t`The straight parts lie along lines through the centre: $d\vec l\times\hat r = 0$, so they add nothing.` }],
          hints: ['The straight parts point straight at (or away from) the centre. What do they contribute there?', t`The semicircle gives half of a full loop’s $\mu_0 I/(2R)$.`],
          teach: 'Straight leads aimed through a point add nothing there; a semicircular arc adds half a loop’s field, μ₀I/(4R).',
          explain: t`The straight parts contribute nothing ($d\vec l\parallel\hat r$). The semicircle is half a loop: $B = \tfrac12\cdot\dfrac{\mu_0 I}{2R} = \dfrac{\mu_0 I}{4R} = ${tn(B)}$ T $= ${tn(B * 1e6)}\ \mu\text{T}$, pointing into the page (the current goes clockwise round it).`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 2, kind: 'error',
      prompt: t`A student sketches the magnetic field of a long straight wire carrying a current out of the page as straight lines radiating out from the wire, “like the field of a charged rod, since both fall off as $1/r$”. What is wrong?`,
      visual: wirePic({ I: 5, px: 2.2, py: 1.2, lines: true, arrow: true, caption: 'The wire seen end-on (current out of the page), with its true field lines and the field at P.' }),
      choices: [
        'The field circles the wire: it is perpendicular to the line from the wire, not along it',
        'Nothing — only the direction of the arrows needs reversing',
        'The field of a wire falls off as 1/r², not 1/r',
        'Magnetic field lines start on the wire and end at infinity, so they should curve',
      ],
      answer: 0,
      why: {
        1: 'Reversing the arrows would still point them along r. The cross product dl × r̂ is perpendicular to r̂.',
        2: 'Each piece’s field falls as 1/r², but the whole long wire’s field falls as 1/r — the student had that part right.',
        3: 'Magnetic field lines never start or end. Around a wire they are closed circles.',
      },
      hints: [t`Each piece adds $d\vec B \propto d\vec l\times\hat r$. Is that along $\hat r$ or across it?`],
      teach: 'A wire’s magnetic field lines are circles round it, not rays from it: Biot–Savart’s cross product turns the field sideways.',
      explain: t`$d\vec l$ points out of the page and $\hat r$ points from the wire to the point, so $d\vec l\times\hat r$ is perpendicular to both: tangent to a circle round the wire. The lines are closed circles, anticlockwise for a current toward you.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-boom', difficulty: 2, transfer: true,
      gen(r) {
        const I = r.pick([0.2, 0.5, 1.0]), d = r.pick([0.5, 1, 2]), B = (MU0 * I) / (2 * PI * d);
        return {
          prompt: t`A spacecraft’s magnetometer measures the solar wind’s field, which near Earth is only about 5 nT. A straight run of power cable inside the spacecraft carries $${I}$ A. What field does it make at a distance of ${d} m, where the magnetometer would sit without a boom?`,
          visual: wirePic({ I: 5, px: 3.2, py: 0, arrow: false, x: [-5, 5], y: [-3, 3], caption: 'The cable seen end-on, its field lines, and the magnetometer’s position P. Not to scale.' }),
          answer: B * 1e9, units: 'nT', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * I) / d) * 1e9, feedback: t`Divide by $2\pi r$: $B = \mu_0 I/(2\pi r)$.` }],
          hints: [t`Treat the cable as a long straight wire: $B = \mu_0 I/(2\pi r)$.`, t`$\mu_0/(2\pi) = 2\times10^{-7}$ T·m/A; then convert to nT ($1\ \text{nT} = 10^{-9}$ T).`],
          teach: 'Even a modest current makes a field far larger than the interplanetary field: B = μ₀I/(2πr) falls off only as 1/r.',
          explain: t`$B = \dfrac{\mu_0 I}{2\pi r} = \dfrac{(2\times10^{-7})(${I})}{${d}} = ${tn(B * 1e9)}$ nT — ${tn((B * 1e9) / 5, 2)} times the field it is trying to measure. That is why spacecraft carry their magnetometers on long booms, route supply and return wires side by side so their fields cancel, and build to strict “magnetic cleanliness” rules.`,
        };
      },
    }),
    num({
      id: 'cp-compass', difficulty: 2,
      gen(r) {
        const dc = r.pick([2, 3, 5]), BuT = r.pick([18, 20, 25]), I = (2 * PI * (dc / 100) * BuT * 1e-6) / MU0;
        return {
          prompt: t`In Ørsted’s experiment a compass sits ${dc} cm from a long straight wire, where Earth’s field is horizontal with a strength of $${BuT}\ \mu\text{T}$. What current in the wire makes a field there as strong as Earth’s?`,
          visual: wirePic({ I: 5, px: 2.4, py: 0, arrow: true, caption: 'The wire seen end-on and the compass at P, with the wire’s field there. Not to scale.' }),
          answer: I, units: 'A', tol: { rel: 0.01 },
          errors: [{ value: (2 * PI * dc * BuT * 1e-6) / MU0, feedback: 'Convert the distance to metres.' }],
          hints: [t`Solve $\mu_0 I/(2\pi r) = B_{\text{Earth}}$ for $I$.`, t`$I = \dfrac{2\pi r B}{\mu_0}$ with $r$ in metres and $B$ in tesla.`],
          teach: 'Setting μ₀I/(2πr) equal to a known field gives the current: a few amperes rival Earth’s field at a few centimetres.',
          explain: t`$I = \dfrac{2\pi rB}{\mu_0} = \dfrac{2\pi(${dc / 100})(${BuT}\times10^{-6})}{4\pi\times10^{-7}} = ${tn(I)}$ A. With the wire running north–south, its field at the compass is east–west, and the needle swings to point between the two fields — at $45^\circ$ for this current. That swing, in 1820, was the first sign that currents make magnetic fields.`,
        };
      },
    }),
    mcq({
      id: 'cp-loop-dir', difficulty: 2,
      gen(r) {
        const ccw = r.bool(0.5);
        return {
          prompt: `A flat loop of wire in the plane of the page carries a current ${ccw ? 'anticlockwise' : 'clockwise'}, as shown. Which way does its magnetic field point at the centre of the loop?`,
          visual: pageLoop({ ccw, caption: `The loop (grey) with its current (blue) going ${ccw ? 'anticlockwise' : 'clockwise'}.` }),
          choices: [ccw ? 'Out of the page' : 'Into the page', ccw ? 'Into the page' : 'Out of the page', `${ccw ? 'Anticlockwise' : 'Clockwise'} round the loop, along the current`, 'Outward in the plane of the page, toward the wire'],
          answer: 0,
          why: {
            1: 'Check with the grip rule on one piece of the loop: thumb along the current there, and see which way your fingers pass through the centre.',
            2: 'A current’s field circles the current; it does not run along it.',
            3: 'Each piece’s field at the centre is perpendicular to both the piece and the line to the centre — so it is perpendicular to the page.',
          },
          hints: ['Curl the fingers of your right hand round the loop with the current: your thumb points along the field at the centre.', 'Or take one piece: dl × r̂ for a piece of the loop and the line from it to the centre.'],
          teach: 'For a current loop, curl your right fingers with the current: your thumb gives the field through the middle.',
          explain: `Curl the fingers of your right hand ${ccw ? 'anticlockwise' : 'clockwise'}, with the current: your thumb points ${ccw ? 'out of the page, toward you' : 'into the page'}. Every piece of the loop adds to the field at the centre in that same direction.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §12.1–12.2', url: 'https://openstax.org/books/university-physics-volume-2/pages/12-1-the-biot-savart-law' },
    { label: 'OpenStax University Physics Vol. 2, §12.4', url: 'https://openstax.org/books/university-physics-volume-2/pages/12-4-magnetic-field-of-a-current-loop' },
  ],
});
