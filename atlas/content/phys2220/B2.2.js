// Ampère's law: the circulation of B round any closed path is μ₀ times the
// current threading it. True for every path; useful when symmetry makes B
// constant along a well-chosen one — a circle round a wire, inside a thick
// conductor, between the conductors of a coaxial cable.
import { lesson, mcq, num } from '../../src/core/content.js';
import { MU0, COL, tn, r4, r6, lab, circ2, page } from './_magnet.js';

const t = String.raw;
const PI = Math.PI;

// ─── pictures ───────────────────────────────────────────────────────────────
// wires across the page and an Amperian loop, as a still picture (positions in cm)
const ampPic = (wires, loop, caption, extra = {}) => ({
  type: 'em-bfield',
  params: { unit: 'cm', x: [-6, 6], y: [-3.6, 3.6], wires, loop: { ...loop, move: false, resize: false }, lines: true, density: 0.8, readouts: [], static: true, ...extra },
  caption,
});
// dots or crosses scattered over a disc or a ring (a current spread through a conductor)
function spread(r0, r1, mark, color, n = 3) {
  const out = [];
  if (r0 === 0) out.push(lab(0, 0, mark, color));
  for (let ring = 1; ring <= n; ring++) {
    const rr = r0 + ((r1 - r0) * ring) / (n + 0.5), k = Math.max(4, Math.round(5 * ring * (r0 === 0 ? 1 : 2)));
    for (let j = 0; j < k; j++) { const a = (2 * PI * (j + 0.5 * (ring % 2))) / k; out.push(lab(rr * Math.cos(a), rr * Math.sin(a), mark, color)); }
  }
  return out;
}
const disc = (R, color = 'teal', alpha = 0.12) => ({ fn: `sqrt(max(${r6(R * R)} - x^2, 0))`, lower: `-sqrt(max(${r6(R * R)} - x^2, 0))`, from: -R, to: R, color, alpha });
const ringShade = (b, c, color = 'teal', alpha = 0.12) => [
  { fn: `sqrt(max(${r6(c * c)} - x^2, 0))`, lower: `sqrt(max(${r6(b * b)} - x^2, 0))`, from: -c, to: c, color, alpha },
  { fn: `-sqrt(max(${r6(b * b)} - x^2, 0))`, lower: `-sqrt(max(${r6(c * c)} - x^2, 0))`, from: -c, to: c, color, alpha },
];
// a solid round conductor in cross-section, its current out of the page, with a dashed Amperian circle
function rodPic(R, rl, caption) {
  return page({
    x: [-2.6, 2.6], y: [-1.75, 1.75],
    shade: [disc(R, 'warn', 0.2)],
    curves: [circ2(0, 0, R, { color: 'warn', width: 2 }), circ2(0, 0, rl, { color: 'good', width: 2.2, dash: true })],
    points: [...spread(0, R, '•', 'ink2', 2), lab(r4(rl * Math.cos(0.8)) + 0.1, r4(rl * Math.sin(0.8)) + 0.12, 'r', 'good'), lab(R + 0.2, -0.2, 'R', 'warn')],
    caption,
  });
}
// a coaxial cable in cross-section: inner wire (out of the page), outer sheath (into it), dashed Amperian circles
function coaxPic(loops, caption) {
  const a = 0.5, b = 1.25, c = 1.45;
  return page({
    x: [-2.7, 2.7], y: [-1.85, 1.85],
    shade: [disc(a, 'warn', 0.22), ...ringShade(b, c, 'warn', 0.22)],
    curves: [circ2(0, 0, a, { color: 'warn', width: 2 }), circ2(0, 0, b, { color: 'warn', width: 1.6 }), circ2(0, 0, c, { color: 'warn', width: 1.6 }), ...loops.map((rl) => circ2(0, 0, rl, { color: 'good', width: 2.2, dash: true }))],
    points: [...spread(0, a, '•', 'ink2', 1), ...Array.from({ length: 16 }, (_, j) => { const an = (2 * PI * j) / 16; return lab(1.35 * Math.cos(an), 1.35 * Math.sin(an), '×', 'ink2'); })],
    caption,
  });
}

// the worked example: a thick wire carrying a uniform current
const EX = { I: 30, R: 2e-3 };
const Bat = (r) => (r < EX.R ? (MU0 * EX.I * r) / (2 * PI * EX.R * EX.R) : (MU0 * EX.I) / (2 * PI * r));

export default lesson({
  id: 'phys2220.B2.2',
  title: 'Ampère’s law',
  minutes: 13, difficulty: 3,
  intro: t`Walk round any closed path, adding up the component of $\vec B$ along each step. The total — the **circulation** of $\vec B$ — depends only on the current that threads through the path:

$$\oint\vec B\cdot d\vec l = \mu_0 I_{\text{enc}}$$

Currents outside the path change $\vec B$ along it, but their contributions to the circulation always cancel. The law holds for every path; it **gives** $B$ when symmetry lets you choose a path along which $\vec B$ has the same size and runs along the path, so the integral is just $B$ times the length. Round a long wire that path is a circle: $B(2\pi r) = \mu_0 I$, so $B = \mu_0 I/(2\pi r)$ — the Biot–Savart result in one line.`,
  symbols: [
    { tex: '\\oint', text: 'an integral all the way round a closed path, back to where it started (the **Amperian loop** — any path you choose, not a real wire)' },
    { tex: '\\vec B\\cdot d\\vec l', text: 'the part of $\\vec B$ along a short step $d\\vec l$ of the path, times the step’s length (T·m): positive where $\\vec B$ runs with you, negative where against you' },
    { tex: 'I_{\\text{enc}}', text: 'the net current through the path, in A. Curl your right fingers along the direction you walk: currents along your thumb count positive, the other way negative' },
    { tex: '\\mu_0', text: 'the permeability of free space, $4\\pi\\times10^{-7}$ T·m/A' },
  ],
  why: 'It is the magnetic partner of Gauss’s law, one of Maxwell’s four equations — and with Maxwell’s correction for changing electric fields it is what lets light exist.',
  visual: {
    type: 'em-bfield',
    title: 'Any loop, the same answer',
    lead: t`Three long wires cross the page. Drag the green Amperian loop, resize it, or change its shape: the readout adds up $\vec B\cdot d\vec l$ all the way round it, numerically, and compares the total with $\mu_0$ times the current the loop encloses. The loop is green where $\vec B$ runs with it and amber where against it.`,
    tasks: [
      'Make the loop bigger or lumpier without crossing a wire: the circulation does not change.',
      'Drag a wire into the loop: the circulation jumps by μ₀I. Drag the 2.5 A wire in: it counts negative, because its current goes into the page.',
      'Move the loop so that it encloses no wire: B along it is not zero — the colours show it — but the green and amber parts cancel exactly.',
    ],
    params: {
      unit: 'cm', x: [-6, 6], y: [-3.6, 3.6],
      wires: [{ x: -1.5, y: 0.5, I: 4, label: 'A', drag: true }, { x: 1.8, y: -0.6, I: -2.5, label: 'B', drag: true }, { x: 3.9, y: 2.0, I: 3, label: 'C', drag: true }],
      loop: { shape: 'circle', x: 0, y: 0, r: 2.6 },
      shapes: ['circle', 'square', 'lumpy'],
      readouts: ['circ', 'muI', 'Ienc'],
    },
    caption: 'A dot in a circle: current out of the page; a cross: into it. The wires are long and straight, perpendicular to the page, and their fields are exact. The circulation is summed numerically round the drawn path, which is walked anticlockwise (grey arrowheads).',
  },
  example: {
    prompt: t`A long straight copper conductor of radius 2.0 mm carries 30 A, spread evenly over its cross-section. Find $B$ at 1.0 mm, 2.0 mm and 4.0 mm from its axis. ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
    visual: {
      type: 'graph',
      params: {
        x: [0, 8], y: [0, 3.6], aspect: 'wide', xlabel: 'r (mm)', ylabel: 'B (mT)',
        curves: [{ fn: '1.5*x', domain: [0, 2], color: COL.B, width: 2.6 }, { fn: '6/x', domain: [2, 8], color: COL.B, width: 2.6 }],
        vlines: [{ x: 2, label: 'surface' }],
        points: [{ x: 1, y: 1.5, color: 'gold', label: '1 mm' }, { x: 2, y: 3, color: 'gold', label: '2 mm' }, { x: 4, y: 1.5, color: 'gold', label: '4 mm' }],
      },
      caption: 'B against distance from the axis: rising in proportion to r inside the conductor, falling as 1/r outside, greatest at the surface.',
    },
    steps: [
      { label: 'Choose the path', text: t`By symmetry $\vec B$ circles the axis with the same size all round any circle centred on it. So take a circle of radius $r$: $\oint\vec B\cdot d\vec l = B(2\pi r)$.` },
      { label: 'Inside, r < R', text: t`The circle encloses only the fraction $\pi r^2/\pi R^2$ of the current: $B(2\pi r) = \mu_0 I\,\dfrac{r^2}{R^2}$, so $B = \dfrac{\mu_0 I r}{2\pi R^2}$. At 1.0 mm: $B = \dfrac{(4\pi\times10^{-7})(30)(0.0010)}{2\pi(0.0020)^2} = ${tn(Bat(1e-3) * 1e3)}$ mT.` },
      { label: 'At the surface', text: t`$r = R$ encloses all of it: $B = \dfrac{\mu_0 I}{2\pi R} = ${tn(Bat(2e-3) * 1e3)}$ mT — the largest anywhere.` },
      { label: 'Outside, r > R', text: t`The whole current is enclosed, as for a thin wire: $B = \dfrac{\mu_0 I}{2\pi r}$. At 4.0 mm: $B = ${tn(Bat(4e-3) * 1e3)}$ mT.` },
      { label: 'Sense check', text: t`Inside, $B$ grows from zero on the axis (where no current is enclosed); outside, it falls off as $1/r$. The two formulas agree at the surface, as they must.` },
    ],
    answer: t`$${tn(Bat(1e-3) * 1e3)}$ mT, $${tn(Bat(2e-3) * 1e3)}$ mT and $${tn(Bat(4e-3) * 1e3)}$ mT.`,
  },
  practice: [
    num({
      id: 'circulation', difficulty: 2,
      gen(r) {
        const pick = () => r.pick([2, 3, 4, 5, 6]) * r.sign();
        let Ia, Ib;
        do { Ia = pick(); Ib = pick(); } while (Math.abs(Ia + Ib) < 0.5);
        const Ic = pick(), Id = pick();
        const C = MU0 * (Ia + Ib);
        const wires = [{ x: -1.2, y: 0.6, I: Ia, label: 'A' }, { x: 1.0, y: -0.7, I: Ib, label: 'B' }, { x: 4.2, y: 1.6, I: Ic, label: 'C' }, { x: -4.3, y: -1.9, I: Id, label: 'D' }];
        const signed = (I) => `${Math.abs(I)} A ${I > 0 ? 'out of' : 'into'} the page`;
        const errors = [];
        if (Math.abs(Ia + Ib + Ic + Id - (Ia + Ib)) > 0.5) errors.push({ value: MU0 * (Ia + Ib + Ic + Id), feedback: 'Only the currents through the loop count. C and D change B along it, but their contributions to the circulation cancel.' });
        if (Math.abs(Math.abs(Ia) + Math.abs(Ib) - Math.abs(Ia + Ib)) > 0.5) errors.push({ value: MU0 * (Math.abs(Ia) + Math.abs(Ib)), feedback: 'Currents in opposite directions partly cancel: count into the page as negative for an anticlockwise loop.' });
        return {
          prompt: t`Four long wires cross the page: A carries ${signed(Ia)}, B ${signed(Ib)}, C ${signed(Ic)} and D ${signed(Id)}. A loop encloses A and B only. What is $\oint\vec B\cdot d\vec l$ taken anticlockwise round it? ($\mu_0 = 4\pi\times10^{-7}$ T·m/A)`,
          visual: ampPic(wires, { shape: 'lumpy', x: 0, y: 0, r: 2.3 }, 'The four wires (dot: current out of the page; cross: into it) and the loop round A and B, with the field lines.'),
          answer: C, units: 'T m', tol: { rel: 0.01 },
          errors,
          hints: [t`$\oint\vec B\cdot d\vec l = \mu_0 I_{\text{enc}}$: add the currents through the loop, with signs.`, t`For an anticlockwise path, currents out of the page count positive and currents into it negative: $I_{\text{enc}} = (${Ia}) + (${Ib})$ A.`],
          teach: 'The circulation of B round a loop counts only the currents threading it, with signs set by the right-hand rule.',
          explain: t`$I_{\text{enc}} = (${Ia}) + (${Ib}) = ${Ia + Ib}$ A, so $\oint\vec B\cdot d\vec l = \mu_0 I_{\text{enc}} = (4\pi\times10^{-7})(${Ia + Ib}) = ${tn(C)}$ T·m. The wires outside the loop make no difference to this number, whatever they do to $\vec B$ along it.`,
        };
      },
    }),
    mcq({
      id: 'zero-circ', difficulty: 2,
      prompt: t`For the loop shown, $\oint\vec B\cdot d\vec l = 0$. What can you conclude?`,
      visual: ampPic([{ x: -2.4, y: 0.4, I: 5, label: 'P' }, { x: 3.4, y: -1.0, I: -4, label: 'Q' }], { shape: 'circle', x: 0.4, y: 0.2, r: 1.6 }, 'The loop (green and amber where B runs with it or against it) between two wires, with the field lines.'),
      choices: [
        'No net current threads the loop — though B along it is not zero',
        'B is zero everywhere on the loop',
        'There are no currents anywhere near the loop',
        'The loop is in a place where the field lines are straight',
      ],
      answer: 0,
      why: {
        1: 'The field lines cross the loop: B is there. Its parts along the loop are positive in some places and negative in others, and they cancel.',
        2: 'Currents outside the loop make a field along it — they just add nothing to the circulation.',
        3: 'The field lines here are curved, and the circulation is still zero. Zero circulation says nothing about the shape of the lines.',
      },
      hints: [t`Ampère’s law says $\oint\vec B\cdot d\vec l = \mu_0 I_{\text{enc}}$. What does a zero total tell you about $I_{\text{enc}}$?`, 'An integral can be zero because its positive and negative parts cancel. Look at the colours on the loop.'],
      teach: 'Zero circulation means zero enclosed current, not zero field: outside currents still make B along the loop.',
      explain: t`$\mu_0 I_{\text{enc}} = 0$, so no net current passes through the loop. But $\vec B$ along it is far from zero — the wires outside make it — and its components along the path are positive on one side (green) and negative on the other (amber), cancelling exactly.`,
    }),
    mcq({
      id: 'any-shape', difficulty: 1,
      prompt: t`A small circle and a large lumpy loop both enclose the same single wire, which carries a current $I$. How do the circulations $\oint\vec B\cdot d\vec l$ round them compare?`,
      visual: page({
        x: [-3, 3], y: [-1.9, 1.9],
        curves: [circ2(0, 0, 0.7, { color: 'good', width: 2.2, dash: true }), { polar: '1.45*(1 + 0.18*sin(3*theta) + 0.1*cos(5*theta + 0.6))', theta: [0, 2 * PI], color: 'good', width: 2.2 }],
        points: [{ x: 0, y: 0, r: 8, color: 'ink2' }, lab(0, 0, '•', 'ink'), lab(0.85, 0.55, 'small circle', 'good', 30, 0), lab(1.9, -1.35, 'lumpy loop', 'good')],
        caption: 'A wire carrying current out of the page (dot), with two Amperian loops round it: a small circle (dashed) and a large lumpy loop.',
      }),
      choices: ['They are equal: both are μ₀I', 'The lumpy loop’s is larger, because it is longer', 'The circle’s is larger, because B is stronger closer to the wire', 'They cannot be compared, because B is not constant along the lumpy loop'],
      answer: 0,
      why: {
        1: 'It is longer, but B is weaker out there: the two effects cancel exactly.',
        2: 'B is stronger close in, but the circle is shorter: the product is the same.',
        3: 'Ampère’s law holds for every closed path. It only becomes useless for finding B when B varies along the path; the circulation itself is still μ₀I.',
      },
      hints: ['What does Ampère’s law say the circulation depends on?'],
      teach: 'The circulation of B round a loop depends only on the current it encloses — not on the loop’s size or shape.',
      explain: t`Both loops enclose the same current, so both circulations are $\mu_0 I$. Round the circle, $B = \mu_0 I/(2\pi r)$ times $2\pi r$ gives $\mu_0 I$ directly; round the lumpy loop the pieces are not so simple, but they add up to the same total.`,
    }),
    num({
      id: 'inside-rod', difficulty: 3,
      gen(r) {
        const Rmm = r.pick([2, 3, 5]), I = r.pick([50, 120, 200]), f = r.pick([0.25, 0.4, 0.6, 0.8]);
        const rr = f * Rmm, B = (MU0 * I * (rr / 1000)) / (2 * PI * (Rmm / 1000) ** 2);
        return {
          prompt: t`A long round conductor of radius ${Rmm} mm carries $${I}$ A, spread evenly over its cross-section. What is the magnetic field ${tn(rr)} mm from its axis?`,
          visual: rodPic(1.4, 1.4 * f, 'The conductor in cross-section (current out of the page, spread evenly) with a dashed Amperian circle of radius r inside it. Not to scale.'),
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * I) / (2 * PI * (rr / 1000))) * 1e3, feedback: t`That counts the whole current. A circle inside the conductor encloses only the fraction $r^2/R^2$ of it.` }, { value: ((MU0 * I) / (2 * PI * (Rmm / 1000))) * 1e3, feedback: 'That is the field at the surface. Inside, it is smaller, in proportion to r.' }],
          hints: [t`Take a circle of radius $r$ inside the conductor. The current through it is $I\,r^2/R^2$.`, t`$B(2\pi r) = \mu_0 I\,\dfrac{r^2}{R^2}$, so $B = \dfrac{\mu_0 I r}{2\pi R^2}$.`],
          teach: 'Inside a conductor with uniform current, an Amperian circle encloses I r²/R², so B grows in proportion to r.',
          explain: t`$B = \dfrac{\mu_0 I r}{2\pi R^2} = \dfrac{(4\pi\times10^{-7})(${I})(${tn(rr / 1000)})}{2\pi(${Rmm / 1000})^2} = ${tn(B)}$ T $= ${tn(B * 1e3)}$ mT.`,
        };
      },
    }),
    num({
      id: 'coax-between', difficulty: 2,
      gen(r) {
        const I = r.pick([0.5, 2, 5, 12]), rmm = r.pick([1.5, 2, 3, 4]), B = (MU0 * I) / (2 * PI * (rmm / 1000));
        return {
          prompt: t`A coaxial cable carries $${I}$ A along its central wire and the same current back along its outer sheath. What is the magnetic field in the insulation between them, ${rmm} mm from the axis?`,
          visual: coaxPic([0.9], 'The cable in cross-section: the central wire (current out of the page, dots), the insulation, and the outer sheath (current into the page, crosses). The dashed circle is an Amperian loop in the insulation.'),
          answer: B * 1e6, units: 'uT', tol: { rel: 0.01 },
          errors: [{ value: 0, feedback: 'Zero is right outside the cable. Between the conductors the circle encloses only the central wire’s current.' }, { value: ((2 * MU0 * I) / (2 * PI * (rmm / 1000))) * 1e6, feedback: 'The sheath’s current is outside this circle: it does not count.' }],
          hints: ['Draw a circle between the two conductors. Which current passes through it?', t`Only the central wire’s: $B(2\pi r) = \mu_0 I$.`],
          teach: 'Between a coaxial cable’s conductors, an Amperian circle encloses just the inner current: B = μ₀I/(2πr).',
          explain: t`The circle encloses only the inner wire’s current, so $B = \dfrac{\mu_0 I}{2\pi r} = \dfrac{(2\times10^{-7})(${I})}{${rmm / 1000}} = ${tn(B * 1e6)}\ \mu\text{T}$.`,
        };
      },
    }),
    mcq({
      id: 'find-error', difficulty: 3, kind: 'error',
      prompt: t`A long wire carries current $I$ through the centre of a square Amperian loop of side $a$. A student writes: “$\oint\vec B\cdot d\vec l = B(4a) = \mu_0 I$, so $B = \mu_0 I/(4a)$ everywhere on the square.” What is wrong?`,
      visual: ampPic([{ x: 0, y: 0, I: 5 }], { shape: 'square', x: 0, y: 0, r: 2.0 }, 'The wire at the centre of a square loop, with its circular field lines: B is not the same size all round the square, and not along it at the corners.', { labels: false }),
      choices: [
        t`$B$ is neither the same size nor along the path all round a square, so it cannot be taken out of the integral; the law holds, but it does not give $B$ here`,
        t`The circulation round a square is not $\mu_0 I$`,
        t`It should be $B(2\pi a) = \mu_0 I$`,
        t`Ampère’s law only works for circles`,
      ],
      answer: 0,
      why: {
        1: t`It is: the square encloses the current, so $\oint\vec B\cdot d\vec l = \mu_0 I$ exactly. The slip is in the next step.`,
        2: t`The square’s perimeter is $4a$; and swapping in a circle’s circumference does not make $B$ constant along a square.`,
        3: 'It holds for every closed path — the circulation round this square is μ₀I. It just doesn’t hand you B unless B is constant along the path.',
      },
      hints: [t`Writing $\oint\vec B\cdot d\vec l = B(4a)$ assumes something about $\vec B$ along the path. What?`, t`Is a point at a corner of the square the same distance from the wire as the middle of a side?`],
      teach: 'Ampère’s law always holds, but it only yields B when symmetry makes B constant and along the chosen path.',
      explain: t`The corners are farther from the wire than the middles of the sides, so $B$ varies round the square, and at most points it is not along the path. The circulation is still $\mu_0 I$ — but to get $B$ you need a path that follows the symmetry: a circle, giving $B = \mu_0 I/(2\pi r)$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-mpd', difficulty: 2, transfer: true,
      gen(r) {
        const IkA = r.pick([5, 10, 20]), rcm = r.pick([1, 2, 3]), B = (MU0 * IkA * 1e3) / (2 * PI * (rcm / 100));
        return {
          prompt: t`A **magnetoplasmadynamic (MPD) thruster** drives a current of ${IkA} kA from a central rod cathode, through a plasma, to a surrounding cylindrical anode. The current makes its own magnetic field, which pushes on the plasma and accelerates it. Treating the current as flowing along the cathode, what is the field ${rcm} cm from the axis, inside the anode?`,
          visual: coaxPic([0.9], 'The thruster seen end-on, schematically: the central cathode’s current (dots, out of the page) returns through the outer anode (crosses). The dashed circle is an Amperian loop between them.'),
          answer: B, units: 'T', tol: { rel: 0.01 },
          errors: [{ value: (MU0 * IkA) / (2 * PI * (rcm / 100)), feedback: 'Convert the current to amperes: 1 kA = 1000 A.' }, { value: 0, feedback: 'Zero is the field outside the anode, where the circle would enclose the current going both ways. Inside, it encloses the cathode current only.' }],
          hints: [t`Use a circle of radius $r$ between the cathode and the anode: it encloses the cathode current $I$.`, t`$B = \dfrac{\mu_0 I}{2\pi r} = \dfrac{(2\times10^{-7})(${IkA}\times10^{3})}{${rcm / 100}}$.`],
          teach: 'A current of thousands of amperes makes a strong field of its own: B = μ₀I/(2πr), from Ampère’s law round a circle.',
          explain: t`$B = \dfrac{\mu_0 I}{2\pi r} = ${tn(B)}$ T — comparable to a strong permanent magnet, and made by the thruster’s own current. Crossed with the radial current through the plasma, this field gives a force $\vec J\times\vec B$ that pushes the plasma out of the thruster.`,
        };
      },
    }),
    mcq({
      id: 'cp-coax-out', difficulty: 2,
      prompt: t`A coaxial cable carries a current $I$ out along its central wire and the same current back along its outer sheath. What is the magnetic field just outside the cable?`,
      visual: coaxPic([1.7], 'The cable in cross-section, with a dashed Amperian circle just outside the sheath.'),
      choices: [
        'Zero: a circle round the whole cable encloses no net current',
        t`$\mu_0 I/(2\pi r)$, from the central wire`,
        t`$2\mu_0 I/(2\pi r)$: the two currents add`,
        'It points along the cable, out of the page',
      ],
      answer: 0,
      why: {
        1: 'The sheath’s current is inside that circle too, running the other way.',
        2: 'The currents run in opposite directions, so they cancel in the enclosed current.',
        3: 'A straight current’s field circles it; nothing here makes a field along the cable.',
      },
      hints: ['Draw a circle round the whole cable. What net current passes through it?', 'By symmetry B would have the same size all round that circle — so if the circulation is zero, B is zero.'],
      teach: 'Outside a coaxial cable the enclosed current is zero, so by symmetry the field there is zero — one reason coax is used.',
      explain: t`$I_{\text{enc}} = I - I = 0$, and by symmetry $B$ is the same all round the circle, so $B(2\pi r) = 0$: $B = 0$. A coaxial cable keeps its magnetic field inside itself, which is why it neither disturbs nearby instruments nor picks up their fields.`,
    }),
    num({
      id: 'cp-inside', difficulty: 3,
      gen(r) {
        const Rmm = r.pick([4, 5, 6]), I = r.pick([150, 200, 400]), rmm = r.pick([1, 2, 3]);
        const B = (MU0 * I * (rmm / 1000)) / (2 * PI * (Rmm / 1000) ** 2);
        return {
          prompt: t`A round busbar of radius ${Rmm} mm carries $${I}$ A, spread evenly through it. What is the magnetic field inside it, ${rmm} mm from its axis?`,
          visual: rodPic(1.4, (1.4 * rmm) / Rmm, 'The busbar in cross-section (current out of the page) with a dashed Amperian circle inside it. Not to scale.'),
          answer: B * 1e3, units: 'mT', tol: { rel: 0.01 },
          errors: [{ value: ((MU0 * I) / (2 * PI * (rmm / 1000))) * 1e3, feedback: t`The circle encloses only part of the current: the fraction $r^2/R^2$.` }],
          hints: [t`The current inside radius $r$ is $I r^2/R^2$.`, t`$B = \dfrac{\mu_0 I r}{2\pi R^2}$.`],
          teach: 'Inside a uniformly carrying conductor, B = μ₀Ir/(2πR²): it rises from zero on the axis to its largest value at the surface.',
          explain: t`$B = \dfrac{\mu_0 I r}{2\pi R^2} = ${tn(B)}$ T $= ${tn(B * 1e3)}$ mT.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §12.5', url: 'https://openstax.org/books/university-physics-volume-2/pages/12-5-amperes-law' },
  ],
});
