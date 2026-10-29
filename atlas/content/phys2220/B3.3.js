// Motional emf: a conductor moving across a magnetic field has its charges
// pushed along it by q v × B, an emf BLv. In a circuit the current it drives
// feels a force ILB against the motion, so keeping the conductor moving takes
// exactly the power the circuit dissipates.
import { lesson, mcq, num } from '../../src/core/content.js';
import { COL, tn, r6, lab, seg2, fieldMarks, page } from './_magnet.js';

const t = String.raw;

// ─── pictures ───────────────────────────────────────────────────────────────
/** The bar on rails, a still (lengths in m; the picture is drawn in cm). */
const railsPic = ({ B = 0.5, L = 0.2, v = 0.5, R = 0.5, motion = 'push', mass = 0.05, Fa = 0.01, len = 1, x0 = 0.1, at = null, arrows = ['v', 'I', 'F', 'Fapp'], graphs = [], caption, extra = {} }) => ({
  type: 'em-faraday',
  params: { mode: 'rails', B, L, v, R, motion, mass, Fa, len, x0, ...(at === null ? {} : { t: at }), play: false, arrows, graphs, readouts: [], ...extra },
  caption,
});
/** A lone rod moving across a field: dir 'in' | 'out', moving 'right' | 'left'. */
function rodPic(dir, way, caption) {
  const sx = way === 'right' ? 1 : -1;
  return page({
    x: [-2.6, 2.6], y: [-1.5, 1.5],
    curves: [seg2([0, -1.0], [0, 1.0], { color: 'ink2', width: 7 })],
    points: [...fieldMarks(-2.3, 2.3, -1.3, 1.3, 9, 6, dir, { skip: (x, y) => Math.abs(x) < 0.3 || (Math.abs(x - sx * 0.9) < 0.45 && Math.abs(y) < 0.3) }), lab(0.18, 1.18, 'top', 'ink3', 0, 0, 'left'), lab(0.18, -1.18, 'bottom', 'ink3', 0, 0, 'left')],
    arrows: [{ from: [sx * 0.35, 0], to: [sx * 1.4, 0], color: COL.v, label: 'v', labelDx: 0, labelDy: -12 }],
    caption: `A metal rod, not connected to anything, moving ${way} through a uniform field ${dir === 'in' ? 'into' : 'out of'} the page (teal ${dir === 'in' ? '×' : '•'}).`,
    ...(caption ? { caption } : {}),
  });
}

// the worked example
const EX = { B: 0.25, L: 0.4, v: 2.0, R: 0.8 };
EX.emf = EX.B * EX.L * EX.v; EX.I = EX.emf / EX.R; EX.F = EX.I * EX.L * EX.B; EX.Pm = EX.F * EX.v; EX.Pe = EX.I * EX.I * EX.R;

export default lesson({
  id: 'phys2220.B3.3',
  title: 'Motional emf',
  minutes: 13, difficulty: 2,
  intro: t`Slide a metal rod across a magnetic field and its free charges are carried along with it — and every moving charge feels the magnetic force $q\vec v\times\vec B$. For a rod of length $L$ moving at $v$, with the rod, its velocity and the field all at right angles, that force pushes charges along the rod: positive charge gathers at one end, negative at the other, and the rod becomes a source of emf

$$\mathcal{E} = BLv$$

Laid across two rails and closed through a resistor, the rod drives a current. Faraday’s law agrees: the circuit’s area grows by $Lv$ every second, so its flux grows at $BLv$. And Lenz’s law adds the catch: the current in the rod feels a force $ILB$ that points back against the motion, so whatever moves the rod must keep pushing — and the work it does is exactly the energy the current carries to the resistor.`,
  symbols: [
    { tex: '\\mathcal{E}', text: 'the motional emf between the rod’s ends, in V' },
    { tex: 'B', text: 'the magnetic field, in T, perpendicular to the plane the rod moves in' },
    { tex: 'L', text: 'the rod’s length across the field — between the rails — in m' },
    { tex: 'v', text: 'the rod’s speed, in m/s, perpendicular to its length' },
  ],
  why: 'Motional emf is what every generator makes, how an electromagnetic flowmeter measures water flow with no moving parts, and how a long tether trailing from a spacecraft through Earth’s field can generate power — or, run backwards, push the craft along without propellant.',
  visual: {
    type: 'em-faraday',
    title: 'A bar on rails',
    lead: t`A metal bar slides along two rails through a field into the page; a resistor closes the circuit. The tint is the circuit’s area, through which the flux grows as the bar moves out. Choose how the bar is moved.`,
    tasks: [
      'Pushed at a steady speed: the emf BLv and the current are steady, and the magnetic force on the bar (violet) points back against the motion — the push must match it.',
      'Double the speed: twice the emf, twice the current, twice the force — and four times the power heating the resistor.',
      'Let it coast: the braking force slows the bar, which weakens the force, so the speed dies away ever more gently.',
      'Pull it with a steady force: it speeds up until the braking force matches the pull, then runs on at a terminal speed.',
    ],
    params: {
      mode: 'rails', motion: 'push', motionChoice: true, mass: 0.02, Fa: 0.01, v: 0.5,
      sliders: ['B', 'v', 'R'],
      graphs: ['v', 'I'], readouts: ['emf', 'I', 'F', 'P', 'vt', 'tau'],
    },
  },
  example: {
    prompt: t`A metal rod 0.40 m long slides at a steady 2.0 m/s along rails through a 0.25 T field perpendicular to the rails’ plane; a 0.80 Ω resistor joins the rails. Find (a) the emf, (b) the current, (c) the force needed to keep the rod moving, and (d) compare the power of that force with the power dissipated in the resistor.`,
    visual: railsPic({ B: EX.B, L: EX.L, v: EX.v, R: EX.R, len: 1.5, x0: 0.2, caption: 'Top view: the rod moving to the right, the field into the page. Blue: the induced current, anticlockwise; violet: the magnetic force on the rod; grey: the push that keeps it moving at a steady speed.' }),
    steps: [
      { label: '(a) The emf', text: t`$\mathcal{E} = BLv = (0.25)(0.40)(2.0) = ${tn(EX.emf)}$ V.` },
      { label: '(b) The current', text: t`$I = \mathcal{E}/R = ${tn(EX.emf)}/0.80 = ${tn(EX.I)}$ A. In the rod, $\vec v\times\vec B$ (right × into the page) points up the page, so the current runs up the rod: anticlockwise round the circuit.` },
      { label: '(c) The force', text: t`The current in the rod feels $F = ILB = (${tn(EX.I)})(0.40)(0.25) = ${tn(EX.F)}$ N, pointing to the left, against the motion (up × into the page = left). To keep the speed steady, the push must be ${tn(EX.F)} N to the right.` },
      { label: '(d) Power', text: t`The push delivers $Fv = (${tn(EX.F)})(2.0) = ${tn(EX.Pm)}$ W; the resistor dissipates $I^2R = (${tn(EX.I)})^2(0.80) = ${tn(EX.Pe)}$ W. They are equal: all the work done pushing the rod becomes heat.` },
      { label: 'Sense check', text: t`In general $Fv = (ILB)v = I(BLv) = I\mathcal{E}$: the mechanical power in is always the electrical power out. That is a generator in miniature.` },
    ],
    answer: t`(a) $${tn(EX.emf)}$ V; (b) $${tn(EX.I)}$ A; (c) $${tn(EX.F)}$ N; (d) both $${tn(EX.Pm)}$ W.`,
  },
  practice: [
    num({
      id: 'bLv', difficulty: 1,
      gen(r) {
        const B = r.pick([0.2, 0.45, 0.8]), Lcm = r.pick([10, 25, 40]), v = r.pick([1.5, 3, 6]);
        const emf = B * (Lcm / 100) * v;
        return {
          prompt: t`A metal bar ${Lcm} cm long, laid across two rails, slides at ${v} m/s through a ${B} T field perpendicular to the rails. What emf does it generate?`,
          visual: railsPic({ B, L: Lcm / 100, v, caption: 'Top view: the bar on its rails in the field (into the page), with the induced current (blue) and the magnetic force on the bar (violet).' }),
          answer: emf * 1e3, units: 'mV', tol: { rel: 0.01 },
          errors: [
            { value: B * Lcm * v * 1e3, feedback: 'Convert the length to metres.' },
            { value: B * v * 1e3, feedback: 'The length of the bar matters: a longer bar has more charges pushed along it. ε = BLv.' },
          ],
          hints: [t`$\mathcal{E} = BLv$, with $L$ in metres.`],
          teach: 'A rod moving across a field at right angles develops an emf ε = BLv.',
          explain: t`$\mathcal{E} = BLv = (${B})(${Lcm / 100})(${v}) = ${tn(emf)}$ V $= ${tn(emf * 1e3)}$ mV.`,
        };
      },
    }),
    mcq({
      id: 'end', difficulty: 2,
      gen(r) {
        const dir = r.pick(['in', 'out']), way = r.pick(['right', 'left']);
        const topPos = (way === 'right') === (dir === 'in');      // v × B points up for these two cases
        return {
          prompt: t`A metal rod, not connected to anything, moves ${way === 'right' ? 'to the right' : 'to the left'} through a uniform field ${dir === 'in' ? 'into' : 'out of'} the page. Which end of the rod ends up at the higher potential?`,
          visual: rodPic(dir, way),
          choices: [topPos ? 'The top end' : 'The bottom end', topPos ? 'The bottom end' : 'The top end', 'Neither: with no circuit there is no emf', 'Neither: the field is the same at both ends'],
          answer: 0,
          why: {
            1: t`Work out $\vec v\times\vec B$ for a positive charge in the rod: it points toward the ${topPos ? 'top' : 'bottom'}, so positive charge gathers there.`,
            2: 'The magnetic force acts on the moving charges whether or not a circuit is connected: charge piles up at the ends until its electric field balances the push. There is an emf; there is just no current.',
            3: 'Uniform B does not mean equal ends: the force on each charge points along the rod, so charge separates along it.',
          },
          hints: [t`A positive charge in the rod moves with velocity $\vec v$. Which way is $q\vec v\times\vec B$?`],
          teach: 'In a moving rod, q v × B pushes positive charge toward one end: that end is at the higher potential, circuit or not.',
          explain: t`For a positive charge, $\vec v\times\vec B$ (${way} × ${dir === 'in' ? 'into' : 'out of'} the page) points ${topPos ? 'up' : 'down'} the rod, so positive charge collects at the ${topPos ? 'top' : 'bottom'} until the electric field of the separated charge stops any more arriving. The ${topPos ? 'top' : 'bottom'} is at the higher potential, by $BLv$.`,
        };
      },
    }),
    num({
      id: 'push', difficulty: 2,
      gen(r) {
        const B = r.pick([0.3, 0.6, 1.0]), Lcm = r.pick([15, 30, 50]), v = r.pick([0.5, 2, 4]), R = r.pick([0.2, 1, 5]);
        const L = Lcm / 100, F = (B * B * L * L * v) / R;
        return {
          prompt: t`A bar ${Lcm} cm long slides along rails through a ${B} T field, closed by a ${R} Ω resistor. What force is needed to keep it moving at a steady ${v} m/s?`,
          visual: railsPic({ B, L, v, R, caption: 'Top view: the bar, the induced current (blue), the magnetic force on the bar (violet) and the push (grey) that balances it.' }),
          answer: F * 1e3, units: 'mN', tol: { rel: 0.01 },
          errors: [
            { value: ((B * L * v) / R) * 1e3, feedback: 'That is the current (in mA). The force on the bar is ILB.' },
            { value: B * L * v * 1e3, feedback: 'That is the emf. Find the current, I = ε/R, then the force ILB.' },
            { value: ((B * L * v) / R) * L * 1e3, feedback: t`The force is $ILB$: include the field as well as the length.` },
          ].filter((e) => Math.abs(e.value - F * 1e3) > 0.02 * F * 1e3),
          hints: [t`$\mathcal{E} = BLv$, $I = \mathcal{E}/R$, and the magnetic force on the bar is $ILB$.`, t`Together: $F = \dfrac{B^2L^2v}{R}$.`],
          teach: 'Keeping a rod moving at steady speed takes a force B²L²v/R — equal and opposite to the magnetic force on its current.',
          explain: t`$I = \dfrac{BLv}{R} = ${tn((B * L * v) / R)}$ A, so $F = ILB = \dfrac{B^2L^2v}{R} = ${tn(F)}$ N $= ${tn(F * 1e3)}$ mN, matching the magnetic force that points back against the motion.`,
        };
      },
    }),
    num({
      id: 'terminal', difficulty: 3,
      gen(r) {
        const B = r.pick([0.4, 0.5, 0.8]), Lcm = r.pick([20, 25, 40]), R = r.pick([0.5, 1, 2]), F = r.pick([0.01, 0.02, 0.05]);
        const L = Lcm / 100, vt = (F * R) / (B * B * L * L);
        return {
          prompt: t`A bar ${Lcm} cm long lies across rails in a ${B} T field, closed by a ${R} Ω resistor. It is pulled from rest by a steady ${F} N force along the rails. Friction is negligible. What speed does the bar settle at?`,
          visual: railsPic({ B, L, R, motion: 'pull', mass: 0.05, Fa: F, at: 0.6, arrows: ['v', 'I', 'F', 'Fapp'], caption: 'Top view: the bar early on, still speeding up, pulled to the right (grey); the magnetic force (violet) grows with its speed.' }),
          answer: vt, units: 'm/s', tol: { rel: 0.01 },
          errors: [
            { value: (F * R) / (B * L), feedback: t`The magnetic force is $B^2L^2v/R$ — the field and length each appear twice, once in the emf and once in the force.` },
            { value: (F * R) / (B * B * Lcm * Lcm), feedback: 'Convert the length to metres.' },
          ],
          hints: ['At the terminal speed the bar no longer speeds up: the magnetic force balances the pull.', t`Set $\dfrac{B^2L^2v}{R} = F$ and solve for $v$.`],
          teach: 'A pulled bar reaches the terminal speed at which the magnetic drag B²L²v/R equals the pull.',
          explain: t`At terminal speed, $\dfrac{B^2L^2v_t}{R} = F$, so $v_t = \dfrac{FR}{B^2L^2} = \dfrac{(${F})(${R})}{(${B})^2(${L})^2} = ${tn(vt)}$ m/s. The mass does not matter for the terminal speed — only for how long it takes to get there.`,
        };
      },
    }),
    mcq({
      id: 'energy', difficulty: 2,
      prompt: 'A bar is pushed at a steady speed along rails through a magnetic field, and the current it drives heats the resistor. Where does that energy come from?',
      visual: railsPic({ caption: 'Top view: the bar pushed at a steady speed (grey: the push; violet: the magnetic force on the bar; blue: the current).' }),
      choices: [
        'From the work done by whatever pushes the bar against the magnetic force',
        'From the magnetic field, which does work on the charges',
        'From the bar’s kinetic energy',
        'From nowhere: the current is driven by the field for free',
      ],
      answer: 0,
      why: {
        1: 'The magnetic force on a moving charge is perpendicular to its velocity, so it does no work. It redirects the effort of the push into driving the current.',
        2: 'The bar moves at a steady speed: its kinetic energy does not change.',
        3: 'Stop pushing and the magnetic force on the current brakes the bar to a halt. The current is paid for by the push.',
      },
      hints: ['Is there a force on the bar that the push has to overcome?'],
      teach: 'The power heating the circuit, I²R, is supplied by the push: Fv = (ILB)v = Iε.',
      explain: 'The current in the bar feels a force ILB backward, so the push does work Fv = ILBv = Iε every second — exactly the I²R heating the resistor. The magnetic field only passes the energy along; it does no work itself.',
    }),
    num({
      id: 'flowmeter', difficulty: 2,
      gen(r) {
        const dcm = r.pick([5, 8, 10]), B = r.pick([0.05, 0.1, 0.2]), v = r.pick([1.2, 2.5, 4]);
        const d = dcm / 100, emf = B * d * v;
        return {
          prompt: t`A test stand’s cooling-water line runs through an electromagnetic flowmeter: a ${B} T field across a pipe ${dcm} cm in diameter, with electrodes on either side of the pipe at the ends of a diameter perpendicular to the field. The meter reads ${tn(emf * 1e3)} mV. How fast is the water flowing?`,
          visual: page({
            x: [-2.4, 2.4], y: [-1.4, 1.4],
            curves: [seg2([-2.2, 0.85], [2.2, 0.85], { color: 'ink2', width: 3 }), seg2([-2.2, -0.85], [2.2, -0.85], { color: 'ink2', width: 3 })],
            points: [
              ...fieldMarks(-1.7, 1.7, -0.6, 0.6, 7, 3, 'in', { skip: (x, y) => Math.abs(y) < 0.2 && Math.abs(x + 0.9) < 0.7 }),
              { x: 0, y: 0.85, r: 6, color: 'gold' }, { x: 0, y: -0.85, r: 6, color: 'gold' },
              lab(0, 1.15, 'electrode', 'gold'), lab(0, -1.15, 'electrode', 'gold'),
            ],
            arrows: [{ from: [-1.6, 0], to: [-0.3, 0], color: COL.v, label: 'water', labelDx: 0, labelDy: -12 }],
            caption: 'The pipe seen from the side, cut lengthways: water (moving right) flows through a field into the page; the electrodes (gold) sit at the top and bottom of the pipe. Schematic.',
          }),
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: (emf / (B * dcm)), feedback: 'Convert the diameter to metres.' }, { value: emf * 1e3 / (B * d), feedback: 'Convert millivolts to volts.' }],
          hints: ['Treat the column of water between the electrodes as a conducting rod of length d, moving at v.', t`$\mathcal{E} = Bdv$, so $v = \mathcal{E}/(Bd)$.`],
          teach: 'An electromagnetic flowmeter reads the motional emf Bdv across a conducting fluid to find its speed.',
          explain: t`The water between the electrodes is a conductor ${dcm} cm long moving across the field: $\mathcal{E} = Bdv$, so $v = \dfrac{${tn(emf)}}{(${B})(${d})} = ${tn(v)}$ m/s. Water’s ions carry the charge; the meter has no moving parts to wear or clog. It needs a conducting liquid, though — it cannot measure kerosene or liquid oxygen.`,
        };
      },
    }),
    {
      type: 'slider', id: 'set-v', difficulty: 2, param: 'v',
      instruction: 'Drag the speed slider to the right value, then check.',
      gen(r) {
        const B = r.pick([0.3, 0.5, 0.8]), L = r.pick([0.1, 0.2, 0.3]), R = r.pick([0.5, 1, 2]), v = r.pick([0.4, 0.6, 0.8, 1.2, 1.5]);
        const ImA = +((B * L * v) / R * 1e3).toPrecision(3);
        return {
          prompt: t`A bar ${L * 100} cm long is pushed along rails through a ${B} T field; a ${R} Ω resistor closes the circuit. Set the bar’s speed so that the current is ${ImA} mA.`,
          answer: [r6(v - 0.06), r6(v + 0.06)],
          hints: [t`$I = BLv/R$, so $v = IR/(BL)$.`],
          teach: 'The current a moving bar drives is BLv/R: proportional to its speed.',
          explain: t`$v = \dfrac{IR}{BL} = \dfrac{(${tn(ImA / 1000)})(${R})}{(${B})(${L})} = ${v}$ m/s.`,
          visual: { type: 'em-faraday', params: { mode: 'rails', B, L, R, v: v > 1 ? 0.2 : 1.8, play: false, sliders: ['v'], arrows: ['v', 'I', 'F', 'Fapp'], graphs: [], readouts: [] }, caption: 'Top view: the bar pushed at the speed you set; blue, the current; violet, the magnetic force on the bar.' },
        };
      },
    },
  ],
  checkpoint: [
    num({
      id: 'cp-tether', difficulty: 3, transfer: true,
      gen(r) {
        const Lkm = r.pick([10, 15, 20]), v = r.pick([7.5, 7.7]), BuT = r.pick([20, 25, 30]);
        const emf = BuT * 1e-6 * Lkm * 1e3 * v * 1e3;
        return {
          prompt: t`A satellite in low orbit lets out a conducting tether ${Lkm} km long, which hangs straight down below it. The tether sweeps through the ionosphere at ${v} km/s, across Earth’s field, whose component perpendicular to both the tether and its motion is ${BuT} μT. What emf is induced along the tether?`,
          visual: page({
            x: [-3, 3], y: [-1.6, 1.6],
            curves: [seg2([0, 1.1], [0, -1.35], { color: 'ink2', width: 2.5 })],
            points: [
              ...fieldMarks(-2.6, 2.6, -1.3, 1.3, 9, 5, 'out', { skip: (x, y) => Math.abs(x) < 0.35 || (y > 0.8 && x > 0 && x < 1.6) }),
              { x: 0, y: 1.2, r: 9, color: 'ink3' }, lab(0.3, 1.2, 'satellite', 'ink2', 0, 0, 'left'), lab(0.25, -1.0, 'tether', 'ink2', 0, 0, 'left'),
            ],
            arrows: [{ from: [0.45, 0.25], to: [1.6, 0.25], color: COL.v, label: 'v', labelDx: 0, labelDy: -12 }],
            caption: 'Schematic, not to scale: the satellite and its hanging tether, seen side on, moving to the right across Earth’s field (teal •, the component across the tether’s motion).',
          }),
          answer: emf / 1e3, units: 'kV', tol: { rel: 0.01 },
          errors: [
            { value: emf / 1e6, feedback: 'Convert both lengths to SI: the tether’s length in metres and its speed in metres per second.' },
            { value: emf * 1e3, feedback: 'Convert the field to tesla: 1 μT = 10⁻⁶ T.' },
          ],
          hints: [t`The tether is a rod of length $L$ moving at $v$ across $B$: $\mathcal{E} = BLv$.`, t`$\mathcal{E} = (${BuT}\times10^{-6})(${Lkm}\times10^{3})(${v}\times10^{3})$ V.`],
          teach: 'A long conductor moving fast across even a weak field develops a large emf, BLv: a space tether makes kilovolts.',
          explain: t`$\mathcal{E} = BLv = (${BuT}\times10^{-6})(${Lkm}\times10^{3})(${v}\times10^{3}) = ${tn(emf)}$ V $\approx ${tn(emf / 1e3)}$ kV. In 1996 the Tethered Satellite System (TSS-1R), reeled out to 19.7 km from the Space Shuttle, developed about 3.5 kV in this way before its tether snapped. The ionosphere closes the circuit, so a tether can draw power from the orbit — slowly lowering it — or, driven with a current the other way, push the craft along without propellant.`,
        };
      },
    }),
    mcq({
      id: 'cp-double', difficulty: 2,
      prompt: 'A bar pushed along rails through a field heats the resistor that closes the circuit. If the bar is pushed twice as fast, the power heating the resistor:',
      visual: railsPic({ caption: 'Top view: the bar, pushed at a steady speed, with its current (blue) and the magnetic force on it (violet).' }),
      choices: ['Quadruples', 'Doubles', 'Stays the same: the resistor and the field have not changed', 'Increases eight times'],
      answer: 0,
      why: {
        1: 'The emf doubles, and so does the current: the power, εI, goes up by both factors.',
        2: 'The emf BLv depends on the speed, so the current and the power change with it.',
        3: 'Power is εI = (BLv)²/R: the square of the speed, not the cube.',
      },
      hints: [t`$P = \mathcal{E}I = \mathcal{E}^2/R$, with $\mathcal{E} = BLv$.`],
      teach: 'The power from a moving bar is (BLv)²/R: twice the speed, four times the power — and four times the effort.',
      explain: t`$P = \mathcal{E}^2/R = (BLv)^2/R$, so doubling $v$ quadruples the power. The push has to deliver it: twice the force ($B^2L^2v/R$) at twice the speed.`,
    }),
    mcq({
      id: 'cp-coast', difficulty: 2,
      prompt: 'A bar on rails in a magnetic field, closed through a resistor, is given a push and let go. Friction is negligible. What happens next?',
      visual: railsPic({ motion: 'coast', v: 0.5, mass: 0.02, at: 0.3, arrows: ['v', 'I', 'F'], caption: 'Top view: the bar just after it is let go, moving right; blue, the current; violet, the magnetic force on the bar.' }),
      choices: [
        'It slows down, ever more gently, approaching rest',
        'It keeps going at the same speed: nothing touches it',
        'It slows at a steady rate and stops after a fixed time',
        'It speeds up: the current pushes it on',
      ],
      answer: 0,
      why: {
        1: 'Nothing touches it, but the current it drives feels a magnetic force backward: the bar is braked.',
        2: 'The braking force is proportional to the speed, so it weakens as the bar slows: the slowing is exponential, not steady.',
        3: 'By Lenz’s law the force on the induced current opposes the motion — it never helps it along.',
      },
      hints: ['How does the magnetic force on the bar depend on its speed?'],
      teach: 'A coasting bar is braked by a force proportional to its speed, so its speed decays exponentially, $v_0e^{-t/\\tau}$.',
      explain: t`The braking force $B^2L^2v/R$ shrinks as the bar slows, so $v = v_0e^{-t/\tau}$ with $\tau = mR/(B^2L^2)$: it approaches rest without ever quite stopping, gliding a total of $v_0\tau$. Its kinetic energy all ends up heating the resistor.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 2, §13.3', url: 'https://openstax.org/books/university-physics-volume-2/pages/13-3-motional-emf' },
  ],
});
