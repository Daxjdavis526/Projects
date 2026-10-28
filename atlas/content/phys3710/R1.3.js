// Proper time as the length of a worldline, and the twin paradox with
// realistic, accelerated travel. Builds on gr.S09.i (proper time, the
// straight worldline as the longest, a 0.8c round trip with an instant
// turnaround) and gr.S09.d (the integral of the line element) without
// repeating them: here the reverse triangle inequality, a smooth four-phase
// voyage built from R0.2's hyperbolic arcs, the clock hypothesis (acceleration
// is not the cause), and proper time computed from a sampled worldline.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { C, YEAR, g0, r6, st } from './_geom.js';

const t = String.raw;
const CG = C / g0 / YEAR;                 // c/g in years
const EX = { A: 1, T1: 2.5 };             // worked example: 1 g, 2.5 years of crew time per phase
EX.s = CG / EX.A; EX.p = EX.T1 / EX.s;
EX.earth = 4 * EX.s * Math.sinh(EX.p); EX.D = 2 * EX.s * (Math.cosh(EX.p) - 1);

/** Parametric arcs of a four-phase trip (accelerate, decelerate, accelerate home, decelerate) with s = c/α and p = ατ₁/c. */
function tripCurves(s, p, color = 'gold') {
  const t1 = s * Math.sinh(p), x1 = s * (Math.cosh(p) - 1);
  const S = r6(s), P = r6(p);
  return [
    { param: [`${S}*(cosh(t) - 1)`, `${S}*sinh(t)`], t: [0, P], color, width: 2.6 },
    { param: [`${r6(2 * x1)} - ${S}*(cosh(t) - 1)`, `${r6(2 * t1)} - ${S}*sinh(t)`], t: [0, P], color, width: 2.6 },
    { param: [`${r6(2 * x1)} - ${S}*(cosh(t) - 1)`, `${r6(2 * t1)} + ${S}*sinh(t)`], t: [0, P], color, width: 2.6 },
    { param: [`${S}*(cosh(t) - 1)`, `${r6(4 * t1)} - ${S}*sinh(t)`], t: [0, P], color, width: 2.6 },
  ];
}

function tripPicture({ s, p, numbers = true, caption }) {
  const T = 4 * s * Math.sinh(p), D = 2 * s * (Math.cosh(p) - 1);
  return st({
    x: [-0.25 * Math.max(D, 0.4 * T), Math.max(D * 1.25, 0.5 * T)], t: [-0.04 * T, T * 1.05], numbers,
    lines: [{ pts: [[0, 0], [0, T]], color: 'accent', width: 2.4, label: 'Earth twin', at: 0, dx: -8, dy: 0, align: 'right' }],
    events: [[0, 0, 'departure', 'ink2', 9, 10], [0, T, 'reunion', 'ink2', 9, -6], [D, T / 2, 'turnaround', 'gold', 9, 0]],
    extra: { curves: tripCurves(s, p) },
    caption: caption ?? t`Earth’s frame, years up and light-years across ($c = 1$). The traveller (gold) accelerates away, decelerates to the turnaround, accelerates home and decelerates, each phase at the same proper acceleration.`,
  });
}

export default lesson({
  id: 'phys3710.R1.3',
  title: 'Proper time and the twin paradox',
  minutes: 12, difficulty: 3,
  intro: t`A clock measures the length of its own worldline. Add up $d\tau = \sqrt{-ds^2}$ along the way, with $c = 1$:

$$\tau_{AB} = \int_A^B \sqrt{1 - v(t)^2}\;dt$$

where $v(t)$ is the clock’s speed in any one inertial frame. Every moment of motion makes the integrand less than 1, so of all worldlines between two events **the straight one — free fall — is the longest**. That is the twin paradox, and it is a theorem of geometry: for any three events in a timelike chain, $\tau_{AC} \ge \tau_{AB} + \tau_{BC}$, the triangle inequality with its sign reversed. You met proper time, and a twin who turns round instantly, in [Proper time: the time your own clock keeps](#/lesson/gr.S09.i). Here the traveller flies a real voyage at a steady thrust, and you will see that the acceleration is not what ages anyone.`,
  symbols: [
    { tex: '\\tau_{AB}', text: 'the proper time between events A and B along a given worldline: what a clock carried along it reads, in years' },
    { tex: 'v(t)', text: 'the clock’s speed at time t, as a fraction of c, in the chosen inertial frame' },
    { tex: 't', text: 'time in that inertial frame (Earth’s, say), in years' },
    { tex: 'ds^2', text: t`the interval of a small step, $-dt^2 + dx^2 + dy^2 + dz^2$; for a clock it is negative and $d\tau = \sqrt{-ds^2}$` },
  ],
  why: 'In general relativity, free-fall worldlines are exactly the ones of maximal proper time; orbits, light bending and black-hole plunges all follow from extremizing this integral.',
  visual: {
    type: 'graph',
    title: 'A voyage at steady thrust',
    lead: t`The gold worldline is a traveller who accelerates at $\alpha$ for a time $\tau_1$ on the crew’s clock, decelerates for $\tau_1$ to stop at the turnaround, then does the same coming home: four equal phases. The blue twin stays on Earth. Compare the two clocks at the reunion.`,
    tasks: [
      'At 1 g, slide the crew time per phase from 0.5 to 2.5 years: the crew ages 4τ₁, Earth ages far more.',
      'Keep τ₁ fixed and double α: the trip reaches farther, and Earth’s share grows faster than the crew’s.',
      'Make α small: the worldline hugs Earth’s and the two clocks nearly agree.',
    ],
    params: {
      x: [-4, 16], y: [-0.6, 30], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x (light-years)', ylabel: 't (years, Earth)',
      sliders: [
        { key: 'A', label: t`Proper acceleration $\alpha$`, min: 0.2, max: 2, step: 0.05, value: 1, unit: 'g', explain: 'Felt by the crew in every phase; only its direction changes.' },
        { key: 'T', label: t`Crew time per phase $\tau_1$`, min: 0.2, max: 2.6, step: 0.05, value: 2, unit: t`\text{yr}`, explain: 'Four phases, so the crew ages 4τ₁ in all.' },
      ],
      constants: { s0: r6(CG) },
      curves: [
        { param: ['0', 't'], t: [0, 30], color: 'accent', width: 2.4 },
        { param: ['s0/A*(cosh(t) - 1)', 's0/A*sinh(t)'], t: [0, 'A*T/s0'], color: 'gold', width: 2.6 },
        { param: ['2*s0/A*(cosh(A*T/s0) - 1) - s0/A*(cosh(t) - 1)', '2*s0/A*sinh(A*T/s0) - s0/A*sinh(t)'], t: [0, 'A*T/s0'], color: 'gold', width: 2.6 },
        { param: ['2*s0/A*(cosh(A*T/s0) - 1) - s0/A*(cosh(t) - 1)', '2*s0/A*sinh(A*T/s0) + s0/A*sinh(t)'], t: [0, 'A*T/s0'], color: 'gold', width: 2.6 },
        { param: ['s0/A*(cosh(t) - 1)', '4*s0/A*sinh(A*T/s0) - s0/A*sinh(t)'], t: [0, 'A*T/s0'], color: 'gold', width: 2.6 },
        { fn: 'x', domain: [0, 30], color: 'warn', dash: true, width: 1.1 },
      ],
      points: [
        { x: 0, y: '4*s0/A*sinh(A*T/s0)', color: 'ink2', label: 'reunion' },
        { x: '2*s0/A*(cosh(A*T/s0) - 1)', y: '2*s0/A*sinh(A*T/s0)', color: 'gold', label: 'turnaround' },
        { x: -0.8, y: 28.5, r: 0.01, color: 'accent', label: 'Earth twin', labelAlign: 'right' },
      ],
      readouts: [
        { label: t`traveller ages $4\tau_1$`, expr: '4*T', digits: 4, unit: t`\text{yr}` },
        { label: t`Earth twin ages $4\frac{c}{\alpha}\sinh\frac{\alpha\tau_1}{c}$`, expr: '4*s0/A*sinh(A*T/s0)', digits: 4, unit: t`\text{yr}` },
        { label: 'turnaround distance', expr: '2*s0/A*(cosh(A*T/s0) - 1)', digits: 4, unit: t`\text{ly}` },
        { label: 'top speed', expr: 'tanh(A*T/s0)', digits: 4, unit: 'c' },
      ],
    },
    caption: t`Earth’s frame, years up and light-years across, $c = 1$ (dashed: light). Each phase is a hyperbolic arc (lesson R0.2); fuel, shielding and the time spent turning the ship are ignored.`,
  },
  example: {
    prompt: t`A crew flies a four-phase voyage at a steady $1g$: accelerate for 2.5 years of crew time, decelerate for 2.5 to stop at the turnaround, then the same coming home. How much does each twin age, how far away is the turnaround, and how fast does the ship go?`,
    visual: tripPicture({ s: EX.s, p: EX.p }),
    steps: [
      { label: 'The crew’s clock', text: t`Four phases of 2.5 years each: $\tau = 10$ years. Proper time is what the ship’s clock reads, so nothing more is needed.` },
      { label: 'One phase in Earth’s frame', text: t`From lesson R0.2, a phase of crew time $\tau_1$ lasts $t_1 = \dfrac{c}{\alpha}\sinh\dfrac{\alpha\tau_1}{c}$ on Earth. With $c/g = ${fmt(CG, 4)}$ yr: $\alpha\tau_1/c = ${fmt(EX.p, 4)}$, so $t_1 = ${fmt(CG, 4)}\sinh(${fmt(EX.p, 4)}) = ${fmt(EX.earth / 4, 4)}$ years.` },
      { label: 'Symmetry', text: t`The decelerating phase is the accelerating one run backward, and the trip home mirrors the trip out, so every phase takes the same Earth time. Earth ages $4t_1 = ${fmt(EX.earth, 4)}$ years.` },
      { label: 'Distance and speed', text: t`Each phase covers $\dfrac{c^2}{\alpha}\left(\cosh\dfrac{\alpha\tau_1}{c} - 1\right) = ${fmt(EX.D / 2, 4)}$ ly, so the turnaround is ${fmt(EX.D, 4)} ly out. The top speed, at the end of the first phase, is $\tanh(${fmt(EX.p, 4)}) = ${fmt(Math.tanh(EX.p), 4)}c$.` },
      { label: 'Sense check', text: t`$\tau_{\text{ship}} = 10 < ${fmt(EX.earth, 3)} = \tau_{\text{Earth}}$, as the reverse triangle inequality demands: Earth’s worldline is the straight one. A star 11 light-years away (such as Tau Ceti, 11.9 ly) is a round trip of about 10 years for a 1 g crew — and 25 for the people they left.` },
    ],
    answer: t`The crew ages 10 years, Earth ${fmt(EX.earth, 3)}; the turnaround is ${fmt(EX.D, 3)} light-years out and the top speed is ${fmt(Math.tanh(EX.p), 4)}c.`,
  },
  practice: [
    num({
      id: 'three-legs', difficulty: 1,
      gen(r) {
        const [T, X, L] = r.pick([[5, 3, 4], [10, 6, 8], [13, 5, 12], [17, 8, 15]]);
        const W = r.pick([2, 3, 4]);
        const ans = 2 * L + W;
        return {
          prompt: t`A survey ship flies out at constant speed, reaching a station ${X} light-years away after ${T} years of Earth time. It stays ${W} years, then flies home at the same speed. How much time does the ship’s clock record for the whole trip?`,
          visual: st({ x: [-0.3 * X, 1.6 * X], t: [-0.05 * (2 * T + W), 1.05 * (2 * T + W)], numbers: true,
            lines: [{ pts: [[0, 0], [0, 2 * T + W]], color: 'accent', label: 'Earth', at: 0, dx: -8, align: 'right' }, { pts: [[0, 0], [X, T], [X, T + W], [0, 2 * T + W]], color: 'gold', label: 'ship', at: 1, dx: 8 }],
            caption: 'Earth’s frame, years up, light-years across (c = 1). Three straight legs: out, a stay, home.' }),
          answer: ans, units: 'yr', tol: { rel: 1e-3 },
          errors: [{ value: 2 * T + W, feedback: 'That is Earth’s time. On the moving legs the ship’s clock records √(Δt² − Δx²) for each.' }, { value: 2 * L, feedback: 'Include the stay at the station: the ship’s clock keeps running there.' }],
          hints: [t`Each moving leg records $\sqrt{${T}^2 - ${X}^2} = ${L}$ years.`, 'Add the two moving legs and the stay.'],
          teach: 'Proper time along a broken worldline is the sum of each straight leg’s √(Δt² − Δx²).',
          explain: t`$${L} + ${W} + ${L} = ${ans}$ years on the ship, against $${2 * T + W}$ on Earth.`,
        };
      },
    }),
    num({
      id: 'triangle', difficulty: 2,
      gen(r) {
        const [tb, xb, T] = r.pick([[5, 4, 12], [6, 3, 10], [8, 6, 16], [4, 2, 9]]);
        const ab = Math.sqrt(tb * tb - xb * xb), bc = Math.sqrt((T - tb) ** 2 - xb * xb);
        const ans = T - ab - bc;
        return {
          prompt: t`Events A $= (0, 0)$, B $= (${tb}, ${xb})$ and C $= (${T}, 0)$, as $(t, x)$ in years and light-years. How much longer is the straight worldline from A to C than the path A → B → C?`,
          visual: st({ x: [-0.5 * T, 0.7 * T], t: [-0.05 * T, 1.08 * T], numbers: true, cones: [[0, 0, 'future']],
            lines: [{ pts: [[0, 0], [0, T]], color: 'accent' }, { pts: [[0, 0], [xb, tb], [0, T]], color: 'gold' }],
            events: [[0, 0, 'A', 'accent2', -12, 10], [xb, tb, 'B', 'gold', 9, 0], [0, T, 'C', 'accent2', -12, -6]], caption: 'A spacetime triangle (c = 1). The dashed lines are light from A.' }),
          answer: ans, units: 'yr', tol: { rel: 0.003 },
          errors: [{ value: ab + bc - T, feedback: 'Spacetime’s triangle inequality is reversed: the bent path is shorter, so the difference is positive.' }],
          hints: [t`$\tau_{AB} = \sqrt{${tb}^2 - ${xb}^2}$ and $\tau_{BC} = \sqrt{${T - tb}^2 - ${xb}^2}$.`, t`$\tau_{AC} = ${T}$; subtract $\tau_{AB} + \tau_{BC}$.`],
          teach: t`In spacetime the straight timelike side of a triangle is the longest: $\tau_{AC} \ge \tau_{AB} + \tau_{BC}$.`,
          explain: t`$\tau_{AB} = ${fmt(ab, 4)}$, $\tau_{BC} = ${fmt(bc, 4)}$, total ${fmt(ab + bc, 4)} years, short of $\tau_{AC} = ${T}$ by ${fmt(ans, 4)} years. On paper the bent path *looks* longer — the minus sign in the metric reverses Euclid.`,
        };
      },
    }),
    num({
      id: 'trip-earth', difficulty: 2,
      gen(r) {
        const [A, T1] = r.pick([[0.5, 1], [0.5, 1.5], [2, 1], [1.5, 0.5]]);
        const s = CG / A, ans = 4 * s * Math.sinh(T1 / s);
        return {
          prompt: t`A drone flies a four-phase round trip at a steady proper acceleration of $${A}g$, spending ${T1} year${T1 === 1 ? '' : 's'} of its own time in each phase (out-accelerate, out-decelerate, home-accelerate, home-decelerate). How many years pass on Earth? ($c/g = ${fmt(CG, 4)}$ yr.)`,
          visual: tripPicture({ s, p: T1 / s, numbers: false }),
          answer: ans, units: 'yr', tol: { rel: 0.003 },
          errors: [{ value: 4 * T1, feedback: 'That is the drone’s own time, 4τ₁. Earth’s is longer.' }, { value: s * Math.sinh(T1 / s), feedback: 'That is one phase; there are four.' }],
          hints: [t`One phase: $t_1 = (c/\alpha)\sinh(\alpha\tau_1/c)$ with $c/\alpha = ${fmt(s, 4)}$ yr.`, t`Earth time $= 4t_1 = 4\times${fmt(s, 4)}\sinh(${fmt(T1 / s, 4)})$.`],
          teach: 'For a voyage of four equal constant-thrust phases, Earth time is 4(c/α) sinh(ατ₁/c) while the crew ages 4τ₁.',
          explain: t`$4\times${fmt(s, 4)}\times\sinh(${fmt(T1 / s, 4)}) = ${fmt(ans, 4)}$ years on Earth, against ${4 * T1} for the drone.`,
        };
      },
    }),
    mcq({
      id: 'not-acceleration', difficulty: 3,
      prompt: 'Two travellers leave Earth together and later return to it together. Both make identical burns — the same accelerations for the same lengths of their own time — but X turns around right after its first burns, while Y coasts for three years at top speed first and therefore returns later. Compared at their reunions with Earth, what does this show?',
      visual: st({ x: [-1.5, 6.5], t: [-0.4, 15], numbers: false, aspect: 'square',
        lines: [{ pts: [[0, 0], [0, 15]], color: 'accent', label: 'Earth', at: 0, dx: -8, dy: -150, align: 'right' },
          { pts: [[0, 0], [0.4, 1.2], [1.4, 2.6], [1.8, 3.8], [1.4, 5], [0.4, 6.4], [0, 7.6]], color: 'violet', label: 'X', at: 4, dx: 10 },
          { pts: [[0, 0], [0.4, 1.2], [1.4, 2.6], [3.8, 5.6], [4.2, 6.8], [3.8, 8], [1.4, 11], [0.4, 12.4], [0, 13.6]], color: 'gold', label: 'Y', at: 3, dx: 8 }],
        caption: 'Earth’s frame (c = 1), schematic: the curved burns drawn as short bends. X and Y bend identically; only Y has long straight coasts.' }),
      choices: ['Y falls further behind Earth than X does, so the age gap is not set by the accelerations', 'Both fall behind Earth by the same amount, because they made the same accelerations', 'Neither falls behind: the coasting legs are inertial, so they cancel', 'X falls further behind, because its accelerations are packed closer together'],
      answer: 0,
      why: {
        1: 'Identical burns would give identical gaps only if acceleration caused the effect. The coasts add time at high speed, where the clock’s rate is low.',
        2: 'Each coast is inertial, but at high speed relative to Earth: Y’s clock runs at √(1 − v²) of Earth’s rate for three extra years each way.',
        3: 'Spacing does not matter; what matters is how long each clock spends moving, and how fast.',
      },
      hints: ['Write each traveller’s proper time as the integral of √(1 − v²) dt.', 'Where do the two worldlines differ — in the bends, or in the straight stretches?'],
      teach: 'Proper time depends only on speed along the path (the clock hypothesis); acceleration only decides which path is taken.',
      explain: 'The integrand √(1 − v²) depends on speed alone. Y’s extra coasting at high speed adds Earth time much faster than ship time, so Y returns further behind. Acceleration is what lets a traveller come back to compare clocks; the time difference is the geometry of the whole path.',
    }),
    code({
      id: 'tau-from-samples', difficulty: 2,
      prompt: t`Write \`proper_time(t, x)\` that takes NumPy arrays of a worldline’s times and positions (years and light-years, $c = 1$), treats the path between samples as straight segments, and returns the total proper time $\sum\sqrt{\Delta t^2 - \Delta x^2}$. The program checks it on a constant-thrust phase, where the exact answer is $\tau = (c/\alpha)\,\operatorname{arsinh}(\alpha t/c)$.`,
      starter: t`import numpy as np

def proper_time(t, x):
    # sum sqrt(dt**2 - dx**2) over the segments
    return 0.0

s = 0.9684                      # c/alpha in years, for 1 g
t = np.linspace(0, 3, 3001)     # Earth time, years
x = np.sqrt(s**2 + t**2) - s    # the hyperbolic worldline, light-years
print("numeric", proper_time(t, x), " exact", s * np.arcsinh(3 / s))
`,
      answer: t`import numpy as np

def proper_time(t, x):
    dt = np.diff(t)
    dx = np.diff(x)
    return np.sum(np.sqrt(dt**2 - dx**2))

s = 0.9684                      # c/alpha in years, for 1 g
t = np.linspace(0, 3, 3001)     # Earth time, years
x = np.sqrt(s**2 + t**2) - s    # the hyperbolic worldline, light-years
print("numeric", proper_time(t, x), " exact", s * np.arcsinh(3 / s))
`,
      tests: [
        { name: 'a clock at rest for 5 years records 5 years', code: 'abs(proper_time(np.array([0., 5.]), np.array([0., 0.])) - 5) < 1e-12' },
        { name: 'the 5-year, 3-light-year leg records 4 years', code: 'abs(proper_time(np.array([0., 5.]), np.array([0., 3.])) - 4) < 1e-12' },
        { name: 'out and back at 0.6c for 10 years records 8', code: 'abs(proper_time(np.array([0., 5., 10.]), np.array([0., 3., 0.])) - 8) < 1e-12' },
        { name: 'the hyperbolic phase matches (c/α) arsinh(αt/c) to 1 part in 10⁶', code: 'abs(proper_time(t, x) / (s*np.arcsinh(3/s)) - 1) < 1e-6' },
      ],
      hints: [t`\`np.diff(t)\` gives the array of time steps; do the same for \`x\`.`, t`\`return np.sum(np.sqrt(dt**2 - dx**2))\`.`],
      teach: 'A worldline sampled into short straight segments has a proper time you can sum: the discrete version of ∫√(−ds²).',
      explain: t`Short chords of the hyperbola are almost exactly as long as the arc, so the sum converges quickly: about ${fmt(CG * Math.asinh(3 / CG), 5)} years of crew time for 3 years of Earth time at 1 g. The same function measures any worldline you can sample — the numerical heart of every proper-time calculation in relativity.`,
    }),
    mcq({
      id: 'third-clock', difficulty: 2,
      prompt: 'Three clocks leave event O together and meet again at event R: one stays home, one flies out at 0.6c and back, one at 0.8c and back (each turning round at the moment needed to reach R). Which shows the least time at R?',
      visual: st({ x: [-3, 6], t: [-0.4, 10.6], numbers: true, cones: [[0, 0, 'future'], [0, 10, 'past']],
        lines: [{ pts: [[0, 0], [0, 10]], color: 'accent', label: 'home', at: 0, dx: -8, align: 'right' }, { pts: [[0, 0], [3, 5], [0, 10]], color: 'violet', label: '0.6c', at: 0, dx: 8 }, { pts: [[0, 0], [4, 5], [0, 10]], color: 'gold', label: '0.8c', at: 1, dx: 8 }],
        events: [[0, 0, 'O', 'ink2', -12, 10], [0, 10, 'R', 'ink2', -12, -6]], caption: 'Three worldlines from O to R (c = 1). Dashed: light cones of O and R.' }),
      choices: ['The 0.8c clock', 'The 0.6c clock', 'The home clock', 'All three agree, since they share both events'],
      answer: 0,
      why: {
        1: t`It records $2\sqrt{25 - 9} = 8$ years; the 0.8c clock records $2\sqrt{25 - 16} = 6$.`,
        2: 'The straight worldline is the longest: the home clock shows the most, 10 years.',
        3: 'Sharing end points does not fix proper time; the path matters, as length does in space.',
      },
      hints: ['The farther a worldline strays from straight, toward the light cones, the less proper time.'],
      teach: 'Between the same two events, worldlines closer to the light cone have less proper time.',
      explain: 'Home: 10 years. 0.6c: 2 × 4 = 8 years. 0.8c: 2 × 3 = 6 years. Pushed all the way to the light cone, the time would reach zero.',
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-star-voyage', difficulty: 3, transfer: true,
      gen(r) {
        const [name, D] = r.pick([['Epsilon Eridani', 10.5], ['Tau Ceti', 11.9], ['Altair', 16.7]]);
        const q = Math.acosh(1 + D / (2 * CG)), ans = 4 * CG * q;
        return {
          prompt: t`A 1 g crew visits ${name}, ${D} light-years away, and comes home: accelerate halfway, decelerate to stop there, then the same back. Each phase covers half the distance, $\dfrac{c^2}{\alpha}\left(\cosh\dfrac{\alpha\tau_1}{c} - 1\right) = ${D / 2}$ ly. How many years does the crew age on the whole voyage? ($c/g = ${fmt(CG, 4)}$ yr, $c^2/g = ${fmt(CG, 4)}$ ly.)`,
          visual: tripPicture({ s: CG, p: q, numbers: false, caption: t`The voyage in Earth’s frame (c = 1, numbers hidden): four constant-thrust phases.` }),
          answer: ans, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: 4 * CG * Math.sinh(q), feedback: 'That is Earth’s time. The crew ages 4τ₁.' }, { value: CG * q, feedback: 'That is one phase; there are four.' }],
          hints: [t`$\cosh(\alpha\tau_1/c) = 1 + ${D / 2}/${fmt(CG, 4)}$, so $\alpha\tau_1/c = \operatorname{arcosh}(${fmt(1 + D / (2 * CG), 4)})$.`, t`$\tau_1 = ${fmt(CG, 4)}\times\operatorname{arcosh}(${fmt(1 + D / (2 * CG), 4)})$; the crew ages $4\tau_1$.`],
          teach: 'For a constant-thrust round trip, invert the distance formula for each phase’s proper time, then multiply by four.',
          explain: t`$\alpha\tau_1/c = ${fmt(q, 4)}$, $\tau_1 = ${fmt(CG * q, 4)}$ yr, so the crew ages ${fmt(ans, 4)} years while Earth ages ${fmt(4 * CG * Math.sinh(q), 4)}.`,
        };
      },
    }),
    num({
      id: 'cp-legs', difficulty: 2,
      gen(r) {
        const [T, X, L] = r.pick([[25, 7, 24], [41, 9, 40], [29, 21, 20]]);
        const ans = 2 * L;
        return {
          prompt: t`A probe flies to a beacon ${X} light-years away, arriving ${T} years later by Earth clocks, and immediately returns at the same speed. What does its own clock record for the round trip?`,
          visual: st({ x: [-0.3 * X, 1.6 * X], t: [-0.1 * T, 2.1 * T], numbers: true, lines: [{ pts: [[0, 0], [0, 2 * T]], color: 'accent', label: 'Earth', at: 0, dx: -8, align: 'right' }, { pts: [[0, 0], [X, T], [0, 2 * T]], color: 'gold', label: 'probe', at: 0, dx: 8 }], caption: 'Earth’s frame (c = 1).' }),
          answer: ans, units: 'yr', tol: { rel: 1e-3 },
          hints: ['Each leg records √(Δt² − Δx²).'],
          teach: 'Proper time adds leg by leg along a broken worldline.',
          explain: t`$2\sqrt{${T}^2 - ${X}^2} = 2\times${L} = ${ans}$ years, against ${2 * T} on Earth.`,
        };
      },
    }),
    mcq({
      id: 'cp-why-younger', difficulty: 2,
      prompt: 'Which statement explains the twin paradox correctly?',
      visual: tripPicture({ s: EX.s, p: EX.p, numbers: false, caption: 'The four-phase voyage of the worked example, in Earth’s frame (c = 1).' }),
      choices: ['Between departure and reunion the traveller’s worldline is not straight, and the straight one has the greatest proper time', 'Acceleration slows clocks down, and only the traveller accelerated', 'Each twin sees the other’s clock slow, so the effect is an illusion that disappears at the reunion', 'Time passes more slowly far from Earth'],
      answer: 0,
      why: {
        1: 'Proper time depends on speed alone; acceleration determines which path the traveller follows, not how fast its clock ticks.',
        2: 'The reunion compares two clocks at one event: a real, frame-independent difference.',
        3: 'Distance from Earth does not enter; in flat spacetime only speed along the path does.',
      },
      hints: ['What is the same for both twins, and what differs?'],
      teach: 'Proper time is the length of a worldline; between two events the straight (inertial) one is longest.',
      explain: 'Both twins share the departure and reunion events, so the comparison is a comparison of worldline lengths. The stay-at-home’s is straight and therefore longest.',
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, §4.5 (proper time) and §5.4 (the twin paradox)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Bailey et al. (1977), Measurements of relativistic time dilatation for positive and negative muons in a circular orbit, Nature 268, 301', url: 'https://doi.org/10.1038/268301a0' },
  ],
});
