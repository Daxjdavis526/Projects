// Faraday's law: a changing magnetic flux through a loop induces an emf,
// ε = −N dΦ/dt — the rate of change of the flux, not the flux itself. The flux
// BA cos θ changes when the field, the area or the angle changes.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { COL, DEG, tn, r6, lab, seg2, circ2, page } from './_magnet.js';

const t = String.raw;

// ─── pictures ───────────────────────────────────────────────────────────────
/** B against t: B1 until 0, a steady ramp to B2 at dt (ms), then held. */
const bGraph = ({ B1, B2, dt, caption }) => ({
  type: 'graph',
  params: {
    x: [r6(-0.25 * dt), r6(1.6 * dt)], y: [0, r6(1.22 * B2)], xlabel: 't (ms)', ylabel: 'B (T)', aspect: 'wide',
    curves: [{ fn: `${B1} + (${r6(B2 - B1)})*min(max(x, 0), ${dt})/${dt}`, color: COL.B, width: 2.6 }],
    points: [{ x: 0, y: B1, color: COL.B, r: 4 }, { x: dt, y: B2, color: COL.B, r: 4 }],
  },
  caption,
});
/** The flux through one turn against time (a 'graph' picture), from an expression in x (s). */
const fluxGraph = ({ fn, x, y, points = [], caption, ylabel = 'Φ (mWb)' }) => ({
  type: 'graph',
  params: { x, y, xlabel: 't (s)', ylabel, aspect: 'wide', curves: [{ fn, color: COL.B, width: 2.6 }], points },
  caption,
});
/** A coil between magnet poles, still, at angle θ (degrees) between its normal and B. */
const coilAt = (deg, caption, extra = {}) => ({
  type: 'em-generator',
  params: { mode: 'generator', angle: deg, play: false, graph: false, readouts: [], arrows: ['B', 'mu'], ...extra },
  caption,
});

/** A magnetic speed pickup: the shaft end on, its magnet about to sweep through `deg` degrees past the coil. */
function pickupPic(deg) {
  const a0 = -deg * DEG, R = 1.4, mx = R * Math.cos(a0), my = R * Math.sin(a0);
  return page({
    x: [-2.2, 3.6], y: [-1.75, 1.75],
    curves: [
      circ2(0, 0, R, { color: 'ink3', width: 2 }), circ2(0, 0, 0.18, { color: 'ink3', width: 1.6 }),
      seg2([0, 0], [mx, my], { color: 'gold', width: 1.2, dash: true }), seg2([0, 0], [R, 0], { color: 'gold', width: 1.2, dash: true }),
      circ2(0, 0, 0.95, { color: 'gold', width: 2.2, a0, a1: 0 }),
      circ2(0, 0, 1.68, { color: 'good', width: 1.8, a0: -1.0, a1: -0.42 }),
      ...Array.from({ length: 7 }, (_, k) => seg2([2.05, -0.45 + 0.15 * k], [2.55, -0.38 + 0.15 * k], { color: 'warn', width: 2 })),
      seg2([2.05, -0.55], [2.55, -0.55], { color: 'ink3', width: 1 }), seg2([2.05, 0.55], [2.55, 0.55], { color: 'ink3', width: 1 }),
      seg2([2.55, 0.42], [3.1, 0.42], { color: 'ink3', width: 1.4 }), seg2([2.55, -0.42], [3.1, -0.42], { color: 'ink3', width: 1.4 }),
    ],
    points: [
      { x: r6(mx), y: r6(my), r: 7, color: 'bad' }, { x: R, y: 0, r: 6, color: 'ink3' },
      lab(2.3, 0.82, 'pickup coil', 'ink2'), lab(3.15, 0, 'to the counter', 'ink3', 0, 0, 'left'),
      lab(0, -1.66, 'the shaft, end on', 'ink3'), lab(0.6, 0.22, `${deg}°`, 'gold'), lab(r6(mx - 0.1), r6(my - 0.32), 'magnet', 'bad'),
    ],
    arrows: [{ from: [r6(1.68 * Math.cos(-0.47)), r6(1.68 * Math.sin(-0.47))], to: [r6(1.68 * Math.cos(-0.36)), r6(1.68 * Math.sin(-0.36))], color: 'good', label: 'turning', labelDx: 6, labelDy: 12, labelAlign: 'left' }],
    caption: `Schematic, not to scale: the shaft seen end on. The magnet (red) on its rim turns through ${deg}° (gold) to face the pickup coil (grey dot: where it will be); the flux through the coil climbs as it does.`,
  });
}
/** The flip coil: a square loop facing straight up, Earth's field (teal) up through it, its normal (gold) after the flip. */
const flipPic = (caption) => ({
  type: 'calc-vectors3d',
  params: {
    range: 2,
    parallelograms: [{ at: [-1, -1, 0], u: [2, 0, 0], v: [0, 2, 0], color: 'ink2', alpha: 0.16 }],
    segments: [[[-1, -1, 0], [1, -1, 0]], [[1, -1, 0], [1, 1, 0]], [[1, 1, 0], [-1, 1, 0]], [[-1, 1, 0], [-1, -1, 0]]].map(([from, to]) => ({ from, to, color: 'ink2' })),
    vectors: [
      ...[[-0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [0.5, -0.5]].map(([x, y], k) => ({ from: [x, y, -1.6], to: [x, y, 1.6], color: COL.B, ...(k === 1 ? { label: '\\vec B' } : {}) })),
      { from: [0, 0, 0], to: [0, 0, -1.3], color: 'gold', label: '\\hat n' },
    ],
  },
  caption,
});

// the worked example
const EX = { N: 200, A: 4.0e-4, B1: 0.1, B2: 0.5, dt: 0.2 };
EX.dPhi = (EX.B2 - EX.B1) * EX.A; EX.emf = (EX.N * EX.dPhi) / EX.dt; EX.emf60 = EX.emf * Math.cos(60 * DEG);

// the side view of the example: the loop edge-on, its normal at θ to the vertical field
const TH = 60 * DEG, half = 1.25, nx = Math.sin(TH), ny = Math.cos(TH);   // normal n = (sin θ, cos θ)
const ux = Math.cos(TH), uy = -Math.sin(TH);                               // along the loop, perpendicular to n

export default lesson({
  id: 'phys2220.B3.1',
  title: 'Faraday’s law',
  minutes: 14, difficulty: 2,
  intro: t`Hold a magnet still beside a coil and nothing happens. Move it, and a current flows — for exactly as long as it moves. Faraday found the rule in 1831: an emf appears round a loop whenever the **magnetic flux** through it changes, and the faster it changes, the bigger the emf. For a uniform field crossing a flat loop, the flux is $\Phi_B = BA\cos\theta$; a coil of $N$ turns gets $N$ times the emf of one:

$$\mathcal{E} = -N\frac{d\Phi_B}{dt}$$

The flux can change in three ways — the field changes, the area changes, or the loop turns — and any of them will do. A flux that is large but steady gives no emf at all. The minus sign gives the emf’s direction; it is the subject of the next lesson, Lenz’s law.`,
  symbols: [
    { tex: '\\mathcal{E}', text: 'the induced emf, in volts: the work done on each coulomb of charge taken once round the loop' },
    { tex: 'N', text: 'the number of turns: each turn has the same flux through it and adds the same emf' },
    { tex: '\\Phi_B', text: 'the magnetic flux through one turn, in webers (1 Wb = 1 T·m²)' },
    { tex: 'B', text: 'the magnetic field, in T, taken as uniform over the loop' },
    { tex: 'A', text: 'the area of the loop, in m²' },
    { tex: '\\theta', text: 'the angle between $\\vec B$ and the loop’s normal (the direction perpendicular to its plane): $\\theta = 0$ when the field goes straight through' },
  ],
  why: 'Faraday’s law is how nearly all the world’s electricity is generated, and how transformers, induction hobs, wireless chargers, guitar pickups and the speed sensors on turbopumps work.',
  visual: {
    type: 'em-faraday',
    title: 'Only while it moves',
    lead: t`A bar magnet is pushed into a coil, held there, and pulled out again; the meter reads the current the coil drives round its circuit. Below: the flux linkage $N\Phi_B$ through the coil, and the emf.`,
    tasks: [
      'Watch the meter: it kicks only while the magnet moves. Held still inside the coil — where the flux is biggest — it reads zero.',
      'Compare the two graphs: the emf follows the slope of the flux graph, not its height.',
      'Push it in faster (a shorter push time): the same change of flux in less time, so a taller, narrower pulse. The area under the pulse stays the same.',
      'Double the turns: twice the flux linkage, twice the emf.',
      'Switch to a steady speed straight through: the flux rises and falls, so the emf has two pulses of opposite sign.',
    ],
    params: {
      mode: 'magnet', motion: 'inout', motionChoice: true, motions: ['inout', 'const'], v: 1,
      sliders: ['T1', 'N'],
      graphs: ['flux', 'emf'], readouts: ['flux', 'emf'],
    },
  },
  example: {
    prompt: t`A flat coil of 200 turns, each of area 4.0 cm², lies with its plane perpendicular to a uniform magnetic field. The field rises steadily from 0.10 T to 0.50 T in 0.20 s. (a) What emf is induced in the coil? (b) What would it be if the coil were tilted so that its normal made 60° with the field?`,
    visual: page({
      x: [-2.6, 2.6], y: [-1.5, 1.5],
      curves: [
        ...[-2.0, -1.2, -0.4, 0.4, 1.2, 2.0].map((x) => seg2([x, -1.4], [x, 1.25], { color: COL.B, width: 1.3 })),
        seg2([-half * ux, -half * uy], [half * ux, half * uy], { color: 'ink2', width: 5 }),
        seg2([0, 0], [0, 1.05], { color: 'ink3', width: 1.2, dash: true }),
        circ2(0, 0, 0.55, { color: 'gold', width: 1.6, a0: Math.PI / 2 - TH, a1: Math.PI / 2 }),
      ],
      arrows: [
        ...[-2.0, -1.2, -0.4, 0.4, 1.2, 2.0].map((x) => ({ from: [x, 0.95], to: [x, 1.3], color: COL.B })),
        { from: [0, 0], to: [r6(1.15 * nx), r6(1.15 * ny)], color: 'gold', label: 'normal', labelDx: 8, labelDy: 0, labelAlign: 'left' },
      ],
      points: [lab(0.24, 0.72, 'θ', 'gold'), lab(-2.0, 1.42, 'B', COL.B, 12, 0), lab(-1.05, 0.38, 'the coil, edge on', 'ink2', 0, 0, 'right')],
      caption: 'Side view: the coil seen edge on (grey), the field (teal) running up the page. In (a) the coil faces the field squarely, its normal along B (θ = 0); in (b) it is tilted so the normal makes θ = 60° with B, as drawn. Only the part of B along the normal goes through the coil.',
    }),
    steps: [
      { label: 'The flux, before and after', text: t`$A = 4.0\ \text{cm}^2 = 4.0\times10^{-4}\ \text{m}^2$. With $\theta = 0$, $\Phi_B = BA$: from $(0.10)(4.0\times10^{-4}) = 4.0\times10^{-5}$ Wb to $(0.50)(4.0\times10^{-4}) = 2.0\times10^{-4}$ Wb.` },
      { label: 'Rate of change', text: t`$\Delta\Phi_B = ${tn(EX.dPhi)}$ Wb in 0.20 s: $\dfrac{\Delta\Phi_B}{\Delta t} = ${tn(EX.dPhi / EX.dt)}$ Wb/s, steady because the field rises steadily.` },
      { label: '(a) The emf', text: t`$|\mathcal{E}| = N\dfrac{\Delta\Phi_B}{\Delta t} = (200)(${tn(EX.dPhi / EX.dt)}) = ${tn(EX.emf)}$ V, for the 0.20 s the field is changing — and zero before and after.` },
      { label: '(b) Tilted', text: t`Now $\Phi_B = BA\cos 60^\circ$: every flux, and so every change of flux, is halved. $|\mathcal{E}| = ${tn(EX.emf)} \times \cos 60^\circ = ${tn(EX.emf60)}$ V.` },
      { label: 'Sense check', text: 'The field itself (up to 0.5 T) never appears alone — only its change, 0.40 T, and how fast it happens. Make the same change in 0.02 s and the emf is ten times bigger.' },
    ],
    answer: t`(a) $${tn(EX.emf)}$ V; (b) $${tn(EX.emf60)}$ V.`,
  },
  practice: [
    num({
      id: 'avg', difficulty: 1,
      gen(r) {
        const N = r.pick([50, 100, 250]), Acm = r.pick([5, 12, 20]), B1 = r.pick([0, 0.1, 0.2]), B2 = r.pick([0.5, 0.8, 1.2]), dt = r.pick([20, 50, 100]);
        const A = Acm * 1e-4, emf = (N * A * (B2 - B1)) / (dt / 1000);
        return {
          prompt: t`A coil of ${N} turns, each of area ${Acm} cm², faces a uniform field squarely. The field rises steadily from ${B1} T to ${B2} T in ${dt} ms, as graphed. What emf is induced while it rises?`,
          visual: bGraph({ B1, B2, dt, caption: `The field through the coil against time: a steady rise from ${B1} T to ${B2} T over ${dt} ms.` }),
          answer: emf, units: 'V', tol: { rel: 0.01 },
          errors: [
            { value: emf / N, feedback: t`That is the emf of one turn. The ${N} turns each have it, in series: multiply by $N$.` },
            { value: emf * 1000, feedback: 'Convert the time to seconds: 1 ms = 10⁻³ s.' },
            { value: emf * 1e4, feedback: 'Convert the area to square metres: 1 cm² = 10⁻⁴ m².' },
            ...(B1 > 0 ? [{ value: (N * A * B2) / (dt / 1000), feedback: t`Use the change in the field, $${B2} - ${B1} = ${r6(B2 - B1)}$ T, not its final value.` }] : []),
          ],
          hints: [t`$|\mathcal{E}| = N\,\dfrac{\Delta\Phi_B}{\Delta t}$ with $\Delta\Phi_B = A\,\Delta B$.`, t`$\Delta\Phi_B = (${tn(A)}\ \text{m}^2)(${r6(B2 - B1)}\ \text{T})$, over $\Delta t = ${dt / 1000}$ s.`],
          teach: 'The emf is N times the rate of change of the flux: ε = N ΔΦ/Δt for a steady change.',
          explain: t`$\Delta\Phi_B = A\,\Delta B = (${tn(A)})(${r6(B2 - B1)}) = ${tn(A * (B2 - B1))}$ Wb, so $|\mathcal{E}| = \dfrac{(${N})(${tn(A * (B2 - B1))})}{${dt / 1000}} = ${tn(emf)}$ V.`,
        };
      },
    }),
    mcq({
      id: 'steady', difficulty: 1,
      prompt: 'A small loop is carried at a steady speed through the middle of a large region of uniform magnetic field, without ever reaching its edge. What emf is induced round the loop?',
      visual: {
        type: 'em-faraday',
        params: { mode: 'slide', Lf: 0.16, w: 0.03, h: 0.025, v: 0.05, t: 2.2, play: false, graphs: [], readouts: ['flux'], arrows: ['v'] },
        caption: 'Top view: the loop, moving to the right, wholly inside the field (into the page). The readout gives the flux through it now.',
      },
      choices: ['Zero: the flux through it is not changing', 'Bhv: it is moving through a field', 'A large one, because the flux through it is large', 'Zero only if the loop is broken somewhere'],
      answer: 0,
      why: {
        1: t`Charges in the loop’s front and back edges are both pushed along those edges, by the same amount — round the loop, the two pushes cancel. Only a changing flux gives a net emf.`,
        2: 'Faraday’s law is about how fast the flux changes, not how big it is. A huge steady flux gives no emf.',
        3: 'A break would stop any current, but there is no emf to drive one anyway: the flux is steady.',
      },
      hints: ['How does the flux through the loop change from one moment to the next?'],
      teach: 'No change of flux, no emf: a loop moving inside a uniform field, without leaving it, has zero emf.',
      explain: t`The whole loop stays inside the uniform field, so $\Phi_B = BA$ is the same at every moment: $d\Phi_B/dt = 0$, and $\mathcal{E} = 0$. An emf appears only while an edge crosses the field’s boundary.`,
    }),
    num({
      id: 'tilt', difficulty: 2,
      gen(r) {
        const N = r.pick([20, 50, 120]), B = r.pick([0.2, 0.35, 0.5]), [aCm, bCm] = r.pick([[10, 8], [12, 12], [20, 10]]), dtms = r.pick([10, 25, 40]);
        const [th1, th2] = r.pick([[0, 90], [0, 60], [0, 180], [60, 90]]);
        const A = (aCm * bCm) * 1e-4, dc = Math.abs(Math.cos(th2 * DEG) - Math.cos(th1 * DEG)), emf = (N * B * A * dc) / (dtms / 1000);
        const ds = Math.abs(Math.sin(th2 * DEG) - Math.sin(th1 * DEG)), sinErr = (N * B * A * ds) / (dtms / 1000);
        const errors = [{ value: emf / N, feedback: t`Multiply by the ${N} turns.` }];
        if (Math.abs(sinErr - emf) > 0.02 * emf) errors.push({ value: sinErr, feedback: t`The flux is $BA\cos\theta$, with $\theta$ measured from the normal — not $\sin\theta$.` });
        if (th2 === 180) errors.push({ value: emf / 2, feedback: 'The flux does not just fall to zero: at 180° it is just as big, the other way through the coil. The change is 2BA.' });
        return {
          prompt: t`A rectangular coil of ${N} turns, ${aCm} cm by ${bCm} cm, sits in a uniform ${B} T field. In ${dtms} ms it is turned from $\theta = ${th1}^\circ$ to $\theta = ${th2}^\circ$, where $\theta$ is the angle between its normal and the field. What is the average emf induced while it turns?`,
          visual: coilAt(th2, `The coil at the end of the turn, θ = ${th2}°: its normal (gold) at ${th2}° to the field (teal).`),
          answer: emf, units: 'V', tol: { rel: 0.01 },
          errors,
          hints: [t`$\Phi_B = BA\cos\theta$ per turn; find it at ${th1}° and at ${th2}°.`, t`Average emf: $N\,|\Delta\Phi_B|/\Delta t$, with $A = ${tn(A)}$ m² and $\Delta t = ${dtms / 1000}$ s.`],
          teach: 'Turning a loop in a steady field changes the flux BA cos θ: that alone induces an emf.',
          explain: t`$|\Delta\Phi_B| = BA\,|\cos ${th2}^\circ - \cos ${th1}^\circ| = (${B})(${tn(A)})(${r6(dc)}) = ${tn(B * A * dc)}$ Wb per turn, so the average emf is $\dfrac{(${N})(${tn(B * A * dc)})}{${dtms / 1000}} = ${tn(emf)}$ V.`,
        };
      },
    }),
    mcq({
      id: 'slope', difficulty: 2,
      prompt: 'The graph shows the flux through a coil as a magnet passes it. At which of the marked moments is the induced emf largest?',
      visual: fluxGraph({
        fn: '3*exp(-(x - 4)^2/2)', x: [0, 8], y: [0, 3.6],
        points: [
          { x: 1.5, y: r6(3 * Math.exp(-((1.5 - 4) ** 2) / 2)), color: COL.B, r: 5, label: 'A' },
          { x: 3, y: r6(3 * Math.exp(-0.5)), color: COL.B, r: 5, label: 'B', labelDx: -16, labelDy: -10 },
          { x: 4, y: 3, color: COL.B, r: 5, label: 'C', labelDy: -12 },
          { x: 6.2, y: r6(3 * Math.exp(-((6.2 - 4) ** 2) / 2)), color: COL.B, r: 5, label: 'D' },
        ],
        caption: 'The flux through each turn of the coil against time, as the magnet approaches (rising) and leaves (falling).',
      }),
      choices: ['At B, where the graph is steepest', 'At C, where the flux is largest', 'At A, where the flux is smallest', 'At D, once the flux is falling'],
      answer: 0,
      why: {
        1: 'At the peak the flux is, for an instant, not changing at all: the emf there is zero.',
        2: 'The flux is small at A, but so is its slope. The emf depends on the slope alone.',
        3: 'A falling flux gives an emf too (in the other direction), but the graph is less steep at D than at B.',
      },
      hints: [t`$\mathcal{E} = -N\,d\Phi_B/dt$: the emf is set by the slope of this graph.`],
      teach: 'The emf follows the slope of the flux graph, not its height: it is zero at the flux’s peak.',
      explain: t`The emf is $-N$ times the slope of $\Phi_B(t)$. The slope is greatest at B (and at the matching point on the far side of the peak, where the emf has the opposite sign); at C it is zero.`,
    }),
    {
      type: 'slider', id: 'set-ramp', difficulty: 2, param: 'tr',
      instruction: 'Drag the ramp-time slider to the right value, then check.',
      gen(r) {
        const B0 = r.pick([0.2, 0.4, 0.6]), rc = r.pick([2, 3, 4]), tr = r.pick([0.4, 0.5, 0.8, 1.2, 2.0]);
        const emf = (Math.PI * (rc / 100) ** 2 * B0) / tr, em = +(emf * 1e3).toPrecision(3);
        return {
          prompt: t`The field inside a long solenoid ramps steadily from zero to ${B0} T, holds, and ramps back down. A ring of radius ${rc} cm sits inside it, facing the field. Set the ramp time so that the emf round the ring, while the field rises, is ${em} mV.`,
          answer: [r6(tr - 0.06), r6(tr + 0.06)],
          hints: [t`While the field rises, $|\mathcal{E}| = \pi r^2\,B_0/t_{\text{ramp}}$. Solve for $t_{\text{ramp}}$.`],
          teach: 'The same change of flux made in less time gives a proportionally bigger emf.',
          explain: t`$t_{\text{ramp}} = \dfrac{\pi r^2 B_0}{|\mathcal{E}|} = \dfrac{\pi(${rc / 100})^2(${B0})}{${tn(em / 1000)}} = ${tr}$ s.`,
          visual: {
            type: 'em-faraday',
            params: { mode: 'ramp', B0, r: rc / 100, tr: tr > 1.5 ? 0.3 : 2.8, play: false, sliders: ['tr'], graphs: ['B'], readouts: [], arrows: ['E'] },
            caption: 'The solenoid end on: its field (teal) fills the dashed circle; the ring sits inside. The graph is the field against time; the ramp time sets how steep it is.',
          },
        };
      },
    },
    multi({
      id: 'which', difficulty: 1,
      prompt: 'Which of these induce an emf in a wire loop? Select every one.',
      visual: coilAt(35, 'A coil in the steady field between two magnet poles, its normal (gold) at an angle to the field (teal).'),
      choices: [
        'Turning the loop in a steady field',
        'Making the field through it stronger',
        'Squashing the loop so its area shrinks, in a steady field',
        'Holding the loop still in a strong, steady field',
        'Sliding the loop along inside a large uniform field, without it leaving the field',
      ],
      answer: [0, 1, 2],
      why: {
        3: 'A steady flux, however large, gives no emf.',
        4: t`The flux $BA$ through the loop stays the same as it slides, so there is no emf round it.`,
      },
      hints: [t`$\Phi_B = BA\cos\theta$. Which of these change $B$, $A$ or $\theta$?`],
      teach: 'Changing B, A or the angle θ changes the flux BA cos θ, and any of them induces an emf; steady flux induces none.',
      explain: t`Turning changes $\theta$, strengthening changes $B$, squashing changes $A$ — each changes $\Phi_B = BA\cos\theta$, so each induces an emf. Held still, or sliding within a uniform field, the flux is steady: no emf.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-pickup', difficulty: 3, transfer: true,
      gen(r) {
        const N = r.pick([100, 150, 200]), dPhi = r.pick([2, 4, 6]), deg = r.pick([6, 8, 10]), rpm = r.pick([12000, 24000, 36000]);
        const dt = deg / 360 / (rpm / 60), emf = (N * dPhi * 1e-6) / dt;
        return {
          prompt: t`A test stand reads a turbopump’s speed with a magnetic pickup: a small magnet on the pump’s shaft sweeps past a ${N}-turn coil once each revolution. As the shaft turns through ${deg}°, the flux through each turn rises from zero to ${dPhi} μWb. At ${rpm.toLocaleString('en-US')} rpm, what is the average emf in the pickup while the flux rises?`,
          visual: pickupPic(deg),
          answer: emf, units: 'V', tol: { rel: 0.01 },
          errors: [
            { value: emf / N, feedback: 'Every one of the coil’s turns has that flux change: multiply by N.' },
            { value: emf * 60, feedback: 'rpm is revolutions per minute: divide by 60 for revolutions per second.' },
            { value: (emf * deg) / 360, feedback: `The flux rises during only ${deg}° of each turn, not the whole revolution: Δt is ${deg}/360 of a revolution’s time.` },
          ],
          hints: [t`Time for one revolution: $60/${rpm}$ s. The rise takes ${deg}/360 of that.`, t`$|\mathcal{E}| = N\,\Delta\Phi_B/\Delta t$, with $\Delta t = \dfrac{${deg}}{360}\cdot\dfrac{60}{${rpm}}\ \text{s} = ${tn(dt)}$ s.`],
          teach: 'A speed pickup’s pulses grow with speed: the same change of flux happens in less time.',
          explain: t`$\Delta t = \dfrac{${deg}}{360}\cdot\dfrac{60}{${rpm}} = ${tn(dt)}$ s, so $|\mathcal{E}| = \dfrac{(${N})(${dPhi}\times10^{-6})}{${tn(dt)}} = ${tn(emf)}$ V. Double the shaft speed and the pulses double in height and come twice as often — the counter reads the speed from how often they come. A pickup like this needs no power supply: the shaft’s own motion drives it.`,
        };
      },
    }),
    mcq({
      id: 'cp-interval', difficulty: 2,
      prompt: 'The graph shows the flux through a coil. During which interval is the size of the induced emf greatest?',
      visual: fluxGraph({
        fn: '2*min(x, 3) - 6*min(max(x - 5, 0), 1)', x: [0, 7], y: [0, 7.5],
        points: [],
        caption: 'The flux through each turn of the coil: it rises steadily for 3 s, holds for 2 s, then falls to zero in 1 s.',
      }),
      choices: ['From 5 s to 6 s, while it falls', 'From 3 s to 5 s, while the flux is largest', 'From 0 to 3 s, while it rises', 'The same in all three: the flux is the same coil’s'],
      answer: 0,
      why: {
        1: 'While the flux holds steady, however large, the emf is zero.',
        2: 'Rising gives an emf, but at 2 mWb/s; the fall is three times steeper, 6 mWb/s.',
        3: 'The emf depends on how fast the flux changes, and that differs from interval to interval.',
      },
      hints: ['Compare the slopes of the three pieces.'],
      teach: 'The size of the emf is set by the steepness of the flux graph, rising or falling.',
      explain: t`The slopes are 2 mWb/s (rising), 0 (holding) and 6 mWb/s (falling). The fall is steepest, so the emf is largest then — opposite in sign to the emf while the flux rose.`,
    }),
    num({
      id: 'cp-flip', difficulty: 2,
      gen(r) {
        const N = r.pick([200, 500, 1000]), Acm = r.pick([20, 50, 80]), BuT = r.pick([45, 50, 55]), dt = r.pick([0.05, 0.1, 0.2]);
        const emf = (2 * N * Acm * 1e-4 * BuT * 1e-6) / dt;
        return {
          prompt: t`To measure Earth’s field, a “flip coil” of ${N} turns, each of area ${Acm} cm², is held with its normal along the field and then flipped over, end for end, in ${dt} s. The field there is ${BuT} μT. What average emf does the flip induce?`,
          visual: flipPic('The coil after the flip: its normal (gold) now points against Earth’s field (teal, taken here as straight up through the coil). It began pointing along it.'),
          answer: emf * 1e3, units: 'mV', tol: { rel: 0.01 },
          errors: [
            { value: (emf / 2) * 1e3, feedback: 'Flipping reverses the flux: it goes from +BA to −BA, a change of 2BA, not BA.' },
            { value: (emf / N) * 1e3, feedback: 'Multiply by the number of turns.' },
          ],
          hints: [t`Before: $\Phi_B = +BA$. After the flip: $-BA$.`],
          teach: 'Reversing a loop in a field changes its flux by 2BA — twice what removing it would.',
          explain: t`$|\Delta\Phi_B| = 2BA = 2(${BuT}\times10^{-6})(${tn(Acm * 1e-4)}) = ${tn(2 * BuT * 1e-6 * Acm * 1e-4)}$ Wb per turn, so the average emf is $\dfrac{(${N})(${tn(2 * BuT * 1e-6 * Acm * 1e-4)})}{${dt}} = ${tn(emf * 1e3)}$ mV. Measuring the total charge the flip drives round the circuit gives $B$ directly — the principle of the fluxmeter.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §13.1', url: 'https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law' },
    { label: 'M. Faraday, Experimental Researches in Electricity, Phil. Trans. R. Soc. 122, 125 (1832)', url: 'https://doi.org/10.1098/rstl.1832.0006' },
  ],
});
