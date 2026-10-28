// Branch points and branch cuts. log z and √z (and z^c) have no single
// continuous value on the whole punctured plane: follow a value continuously
// once round the origin and it comes back changed — log gains 2πi, √ changes
// sign. The origin is a branch point; a branch cut is a curve from it to ∞
// along which we agree to jump, so that a single-valued branch exists on the
// rest. The principal branch cuts along the negative real axis.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, r6, cTeX, num as nm, argand, cxmap, apart } from './_cx.js';

const t = String.raw;
const PI = Math.PI;

const follow = (f, o, caption) => cxmap({ f, x: [-2.2, 2.2], y: [-2.2, 2.2], wx: f === 'log' ? [-2, 2] : [-1.8, 1.8], wy: f === 'log' ? [-4.5, 9] : [-1.8, 1.8], grid: 'polar', gr: [0.4, 2], gth: [-PI, PI], gn: 5, gm: 12, follow: true, trail: true, ...o }, caption);

export default lesson({
  id: 'st-d.D4.2',
  title: 'Branch cuts and multivalued functions',
  minutes: 12, difficulty: 3,
  intro: t`Carry a point $z$ once round the origin and ask its logarithm to change **continuously** along the way. The angle grows by $2\pi$, so the value comes back different:

$$\log z \;\to\; \log z + 2\pi i, \qquad \sqrt z = e^{\frac12\log z} \;\to\; e^{i\pi}\sqrt z = -\sqrt z$$

No single continuous choice of $\log z$ or $\sqrt z$ exists on the whole plane minus $0$. The origin is a **branch point**. To get an honest, single-valued function we cut the plane along a curve from $0$ to $\infty$ — a **branch cut** — and forbid crossing it. The **principal branch** cuts along the negative real axis: there $\operatorname{Arg} z$ jumps from $\pi$ to $-\pi$, $\operatorname{Log} z$ jumps by $2\pi i$, and $\sqrt z$ flips sign.`,
  symbols: [
    { tex: t`\log z`, text: t`the logarithm with an angle that is allowed to change continuously: $\ln|z| + i\theta$, where $\theta$ is followed along a path` },
    { tex: t`\sqrt z`, text: t`a square root, $e^{\frac12\log z}$: length $\sqrt{|z|}$, half the angle. Halving the angle is what makes one lap give a half-turn` },
    { tex: '2\\pi i', text: t`the change in $\log z$ after one anticlockwise lap round $0$ (the angle grows by $2\pi$)` },
    { tex: t`\operatorname{Arg} z`, text: t`the principal angle, in $(-\pi, \pi]$; it jumps by $2\pi$ across the negative real axis, the principal cut` },
  ],
  why: t`Branch cuts decide which value a formula returns — in your own code (the jump of atan2 at $\pm180^\circ$), in contour integrals that wrap round a cut, and in physics where a square root of a complex energy picks out decaying rather than growing waves.`,
  visual: {
    type: 'cx-map',
    title: 'Follow a value round the origin',
    lead: t`The gold point is the value of $f$ followed continuously along the path you drag (the gold trail). Press the button to carry $z$ once round $0$, and watch where $f(z)$ ends up. The readout counts the laps.`,
    tasks: [
      t`For $\sqrt z$: one lap and the value ends at $-\sqrt z$, on the other side; a second lap brings it home.`,
      t`For $\operatorname{Log}$: each lap lifts the value by $2\pi \approx 6.28$; it never comes back.`,
      t`For $z^{1/3}$: three laps to come home. Then drag $z$ round a loop that does **not** enclose $0$: the value returns unchanged.`,
    ],
    params: {
      f: 'sqrt', fns: ['sqrt', 'log', 'pow'], p: [1 / 3, 0], x: [-2.2, 2.2], y: [-2.2, 2.2], wx: [-2.5, 2.5], wy: [-2.5, 2.5],
      grid: 'polar', gr: [0.4, 2], gth: [-PI, PI], gn: 5, gm: 12, follow: true, play: true, trail: true, drag: { x: 1.5, y: 0.01 }, readout: ['z', 'w', 'branch'],
    },
    caption: t`The grid’s image is drawn on the principal branch, which jumps across the dashed red cut; the gold point is continued along your path instead. For $\operatorname{Log}$ the $w$ window shows $|\operatorname{Im} w| \le 2.5$ only, so a value lifted by a full lap leaves it. The third function is $z^{1/3}$.`,
  },
  example: {
    prompt: t`Start with $\sqrt1 = 1$ and follow $\sqrt z$ continuously as $z$ goes once anticlockwise round the unit circle. Where does it end? Compare the principal values just above and just below $z = -1$.`,
    visual: follow('sqrt', { drag: { x: -1, y: 0.02 }, play: false, curves: [{ param: ['cos(t)', 'sin(t)'], t: [0, 2 * PI - 0.001], color: 'violet', follow: true, label: 'path', wlabel: 'its √' }], wx: [-1.6, 1.6], wy: [-1.6, 1.6] }, t`The unit circle walked from $1$ (violet) and the followed square root: a half-circle from $1$ to $-1$.`),
    steps: [
      { label: 'Parametrize', text: t`On the circle $z = e^{i\theta}$, $\theta$ running from $0$ to $2\pi$. Following continuously, $\sqrt z = e^{i\theta/2}$.` },
      { label: 'Arrive', text: t`At $\theta = 2\pi$, $z$ is back at $1$ but $\sqrt z = e^{i\pi} = -1$. The value has swapped to the other square root.` },
      { label: 'The cut', text: t`The principal $\sqrt z$ refuses to be continuous instead: just above $-1$ (angle near $\pi$) it is near $e^{i\pi/2} = i$; just below (angle near $-\pi$) it is near $e^{-i\pi/2} = -i$. A jump of $2i$ across the negative real axis.` },
      { label: 'Two sheets', text: t`So $\sqrt z$ is really one function on two copies of the plane glued crosswise along the cut — a Riemann surface. Each lap moves you to the other copy.` },
    ],
    answer: t`Continued round once, $\sqrt z$ ends at $-1$; the principal branch instead jumps from $i$ (above the cut) to $-i$ (below).`,
  },
  practice: [
    num({
      id: 'above-below', difficulty: 2,
      gen(r) {
        const a = r.pick([4, 9, 0.25, 2.25]), s = r.sign();
        const z = [-a, s * 1e-3];
        const ans = M.sqrtAt(z)[1];
        return {
          prompt: t`Using the principal square root, find $\operatorname{Im}\sqrt{z}$ for $z = -${a} ${s > 0 ? '+' : '-'} 0.001i$, just ${s > 0 ? 'above' : 'below'} the cut. Give 3 significant figures.`,
          visual: cxmap({ f: 'sqrt', x: [-3, 3], y: [-3, 3], wx: [-2, 2], wy: [-2, 2], grid: 'polar', gr: [0.4, 2.8], gth: [-PI, PI], gn: 5, gm: 12, ticks: false, drag: { x: -Math.min(a, 2.8), y: s * 0.12 } }, t`The principal $\sqrt z$; the point is drawn just ${s > 0 ? 'above' : 'below'} the cut (dashed red), with its image. Axes without numbers.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: t`Above the cut the angle is near $+\pi$, below it near $-\pi$; halve it and check the sign.` }],
          hints: [t`Just ${s > 0 ? 'above' : 'below'} the negative real axis, $\operatorname{Arg} z \approx ${s > 0 ? '' : '-'}\pi$.`, t`$\sqrt z = \sqrt{|z|}\,e^{i\operatorname{Arg} z/2} \approx ${nm(Math.sqrt(a), 3)}\,e^{${s > 0 ? '' : '-'}i\pi/2}$.`],
          teach: t`Across the principal cut the angle jumps from $\pi$ to $-\pi$, so $\sqrt z$ jumps from $+i\sqrt{|z|}$ to $-i\sqrt{|z|}$.`,
          explain: t`$\sqrt z \approx ${s > 0 ? '' : '-'}${nm(Math.sqrt(a), 3)}i$: imaginary part $${nm(ans, 3)}$. On the other side of the cut it is the opposite.`,
        };
      },
    }),
    num({
      id: 'log-laps', difficulty: 2,
      gen(r) {
        const [z0, zt, a] = r.pick([[[1, 0], '1', 0], [[0, 1], 'i', PI / 2], [[0, -2], '-2i', -PI / 2], [[1, 1], '1 + i', PI / 4]]);
        const n = r.pick([1, 2, -1, 3]);
        const ans = a + 2 * PI * n;
        return {
          prompt: t`Start at $z = ${zt}$ with the principal value $\operatorname{Log}(${zt})$, then follow $\log z$ continuously while $z$ goes round the origin ${Math.abs(n) === 1 ? 'once' : `${Math.abs(n)} times`} ${n > 0 ? 'anticlockwise' : 'clockwise'}, back to $${zt}$. What is $\operatorname{Im}\log z$ now? (3 significant figures.)`,
          visual: follow('log', { drag: { x: z0[0], y: z0[1] }, ticks: false }, t`The logarithm followed along a path (gold). The principal grid image breaks at the cut. Axes without numbers.`),
          answer: ans, tol: { rel: 0.003, abs: 0.005 },
          errors: apart(ans, [{ value: a, feedback: t`That is where you started. Each lap changes the angle by $2\pi$, and $\log$ remembers it.` }, { value: a - 2 * PI * n, feedback: 'Anticlockwise laps add 2π to the angle; clockwise laps subtract it.' }]),
          hints: [t`$\operatorname{Im}\log z$ is the continuously followed angle.`, t`Start at $\operatorname{Arg}(${zt}) = ${nm(a, 3)}$; each ${n > 0 ? 'anticlockwise' : 'clockwise'} lap ${n > 0 ? 'adds' : 'subtracts'} $2\pi$.`],
          teach: t`Following $\log z$ once round $0$ anticlockwise adds $2\pi i$; the real part $\ln|z|$ comes back unchanged.`,
          explain: t`$${nm(a, 3)} ${n > 0 ? '+' : '-'} ${Math.abs(n)}\times2\pi = ${nm(ans, 4)}$. The value sits on branch $k = ${n}$ of the logarithm.`,
        };
      },
    }),
    mcq({
      id: 'cube-root-laps', difficulty: 2,
      prompt: t`Follow $z^{1/3}$ continuously while $z$ goes round $0$ anticlockwise. After how many laps does the value first come back to where it started?`,
      visual: follow('pow', { p: [1 / 3, 0], drag: { x: 1.6, y: 0.01 } }, t`The principal $z^{1/3}$: the grid’s image fills a wedge of $120^\circ$, a third of the plane.`),
      choices: ['3', '1', '2', 'Never'],
      answer: 0,
      why: { 1: t`One lap adds $2\pi$ to the angle of $z$, which turns $z^{1/3}$ by only $2\pi/3$.`, 2: t`Two laps turn it by $4\pi/3$, not a whole number of turns.`, 3: t`That is $\log z$, whose imaginary part grows without end. Any rational power returns eventually.` },
      hints: [t`$z^{1/3} = e^{\frac13\log z}$: each lap multiplies it by $e^{2\pi i/3}$.`, t`When is $(e^{2\pi i/3})^n = 1$?`],
      teach: t`$z^{p/q}$ (in lowest terms) returns after $q$ laps: it has $q$ branches.`,
      explain: t`Each lap multiplies the value by $e^{2\pi i/3}$, a third of a turn. Three laps make a whole turn: $z^{1/3}$ has three branches, the three cube roots.`,
    }),
    mcq({
      id: 'log-product', difficulty: 3, kind: 'error',
      prompt: t`A student writes: “$\operatorname{Log}(ab) = \operatorname{Log} a + \operatorname{Log} b$, so with $a = b = -1$, $\operatorname{Log}(1) = i\pi + i\pi = 2\pi i$.” What is wrong?`,
      visual: cxmap({ f: 'log', x: [-1.6, 1.6], y: [-1.6, 1.6], wx: [-2, 2], wy: [-7, 7], grid: 'polar', gr: [0.5, 1.5], gth: [-PI, PI], gn: 3, gm: 12, drag: false, points: [{ x: -1, y: 0.001, label: '−1', wlabel: 'Log(−1) = iπ', color: 'gold' }, { x: 1, y: 0, label: '1', wlabel: 'Log 1 = 0', color: 'accent' }] }, t`The principal logarithm: $-1$ (just above the cut) goes to $i\pi$, and $1$ goes to $0$.`),
      choices: [
        t`The rule holds only up to a multiple of $2\pi i$: $\operatorname{Arg} a + \operatorname{Arg} b$ can leave $(-\pi, \pi]$, here giving $2\pi$ instead of $0$`,
        t`$\operatorname{Log}(-1)$ is $-i\pi$, not $i\pi$`,
        t`$\operatorname{Log}(-1)$ is not defined because $-1$ is negative`,
        'Nothing: Log 1 really is 2πi',
      ],
      answer: 0,
      why: {
        1: t`$\operatorname{Arg}(-1) = \pi$ by the convention $(-\pi, \pi]$; with $-i\pi$ the sum would be $-2\pi i$, still not $0$.`,
        2: t`Complex logarithms of negative numbers exist: $\operatorname{Log}(-1) = \ln1 + i\pi = i\pi$.`,
        3: t`$\operatorname{Log} 1 = \ln 1 + i\operatorname{Arg} 1 = 0$. $2\pi i$ is **a** logarithm of 1, but not the principal one.`,
      },
      hints: [t`$\log(ab) = \log a + \log b$ is true for the many-valued log — as sets of values.`, t`For principal values, the sum of the arguments can fall outside $(-\pi, \pi]$.`],
      teach: t`$\operatorname{Log}(ab) = \operatorname{Log} a + \operatorname{Log} b + 2\pi ik$ for some whole $k$; $k \ne 0$ when the arguments add past the cut.`,
      explain: t`$\operatorname{Arg}(-1) + \operatorname{Arg}(-1) = 2\pi$, outside $(-\pi, \pi]$, so the sum lands on another branch: $\operatorname{Log} 1 = 0 = 2\pi i - 2\pi i$. Identities for $\operatorname{Log}$ and for powers $z^c$ need this $2\pi ik$ correction across the cut.`,
    }),
    num({
      id: 'sqrt-path', difficulty: 3,
      gen(r) {
        const R = r.pick([1, 2, 3]), upper = r.bool(0.5);
        const ans = upper ? R : -R;
        return {
          prompt: t`Start at $z = ${R * R}$ with $\sqrt{z} = ${R}$ and follow $\sqrt z$ continuously along the half-circle $|z| = ${R * R}$ through the ${upper ? 'upper' : 'lower'} half-plane to $z = -${R * R}$. What is the imaginary part of the value you arrive with?`,
          visual: argand({ curves: [{ param: [`${R * R}*cos(t)`, `${R * R}*sin(t)`], t: upper ? [0, PI] : [-PI, 0], color: 'violet', width: 2.4 }], pts: [{ z: [R * R, 0], label: 'start', color: 'accent' }, { z: [-R * R, 0], label: 'end', color: 'gold' }], arrows: [{ from: [r6(R * R * Math.cos(upper ? 1.3 : -1.3)), r6(R * R * Math.sin(upper ? 1.3 : -1.3))], to: [r6(R * R * Math.cos(upper ? 1.5 : -1.5)), r6(R * R * Math.sin(upper ? 1.5 : -1.5))], color: 'violet' }], view: R * R * 1.25, ticks: false, caption: t`The path in the $z$-plane, from $${R * R}$ to $-${R * R}$ through the ${upper ? 'upper' : 'lower'} half-plane.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: -ans, feedback: t`Track the angle: ${upper ? 'through the upper half-plane it grows from 0 to π' : 'through the lower half-plane it falls from 0 to −π'}; then halve it.` }],
          hints: [t`On the path, $z = ${R === 1 ? '' : R * R}e^{i\theta}$ with $\theta$ going from $0$ to $${upper ? '' : '-'}\pi$.`, t`$\sqrt z = ${R === 1 ? '' : R}e^{i\theta/2}$, ending at $${R === 1 ? '' : R}e^{${upper ? '' : '-'}i\pi/2}$.`],
          teach: 'The value a continued function arrives with depends on which side of the branch point the path went.',
          explain: t`$\sqrt z$ arrives at $${R === 1 ? '' : R}e^{${upper ? '' : '-'}i\pi/2} = ${upper ? '' : '-'}${R}i$. Going the other way round gives the opposite sign: the two paths together make one lap, which flips $\sqrt z$.`,
        };
      },
    }),
    mcq({
      id: 'cut-choice', difficulty: 2,
      prompt: t`Could you define a single-valued, continuous $\sqrt z$ with its branch cut along the positive imaginary axis instead of the negative real axis?`,
      visual: argand({ curves: [{ param: ['0', 't'], t: [0, 3], color: 'bad', width: 3, dash: [7, 5] }], pts: [{ z: [0, 0], label: 'branch point', color: 'gold' }], circles: [{ r: 1.5, color: 'ink3' }], view: 2, ticks: false, caption: 'A cut along the positive imaginary axis (dashed red). Any loop round the branch point must cross it.' }),
      choices: [
        'Yes: any curve from 0 to ∞ works as a cut; it changes which values the branch takes, not whether one exists',
        'No: the cut must be the negative real axis',
        'No: square roots have no branch point',
        'Yes, and then no cut is needed at all',
      ],
      answer: 0,
      why: { 1: 'The negative real axis is a convention — the principal branch — not a law.', 2: t`One lap round $0$ flips $\sqrt z$: $0$ is a branch point.`, 3: 'A cut is always needed: without one, some loop round 0 would change the value.' },
      hints: ['What is the cut for? It must stop every loop round 0 that would change the value.'],
      teach: 'A branch cut can be any curve from the branch point to infinity; the principal one is a convention.',
      explain: t`Any cut that blocks every loop round $0$ will do. With the cut up the positive imaginary axis the angle runs over $(-3\pi/2, \pi/2]$, so for example $\sqrt{-1} = -i$ on that branch, while the principal branch says $i$.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-below-cut', difficulty: 2,
      gen(r) {
        const a = r.pick([2, 5, 0.5]);
        const ans = M.arg([-a, -0.001]);
        return {
          prompt: t`Find $\operatorname{Im}\operatorname{Log}(-${a} - 0.001i)$, just below the cut, to 3 significant figures.`,
          visual: cxmap({ f: 'log', x: [-5.5, 5.5], y: [-5.5, 5.5], wx: [-2, 2.5], wy: [-4, 4], grid: 'polar', gr: [0.5, 5], gth: [-PI, PI], gn: 5, gm: 12, ticks: false, drag: { x: -a, y: -0.3, label: 'w', wlabel: 'Log w' } }, 'The point (drawn a little below the cut, dashed red) and its principal logarithm. Axes without numbers.'),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: -ans, feedback: t`Just **below** the negative real axis the principal angle is close to $-\pi$, not $+\pi$.` }],
          hints: [t`The principal argument lies in $(-\pi, \pi]$; below the negative real axis it is just above $-\pi$.`],
          teach: t`Below the principal cut the angle of $\operatorname{Log}$ is near $-\pi$; above it, near $+\pi$.`,
          explain: t`$\operatorname{Arg}(-${a} - 0.001i) = -\pi + ${nm(0.001 / a, 2)} \approx ${nm(ans, 4)}$.`,
        };
      },
    }),
    mcq({
      id: 'cp-loop', difficulty: 2,
      prompt: t`You follow $\sqrt z$ continuously round a closed loop that does **not** go round the origin (the loop is centred at $z = 2$, radius $1$). What value do you come back with?`,
      visual: follow('sqrt', { x: [-1.2, 3.4], y: [-1.6, 1.6], wx: [-0.6, 2.2], wy: [-1.4, 1.4], drag: { x: 3, y: 0.01 }, curves: [{ param: ['2 + cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'violet', follow: true }] }, t`The loop $|z - 2| = 1$ (violet) and its image under $\sqrt z$.`),
      choices: ['The value you started with', 'Minus the value you started with', t`The starting value times $e^{i\pi/2}$`, 'It depends on the direction of the loop'],
      answer: 0,
      why: { 1: 'A sign flip needs the angle of z to grow by 2π, which happens only if the loop goes round 0.', 2: t`$e^{i\pi/2}$ would need the angle of $z$ to change by $\pi$ — impossible on a closed loop.`, 3: 'Neither direction encloses 0, so neither changes the value.' },
      hints: ['How much does the angle of z change round this loop?'],
      teach: 'Only loops round a branch point change the value of a multivalued function.',
      explain: t`The angle of $z$ wanders and comes back to where it was (net change $0$), so $\sqrt z$ returns unchanged. Only the number of laps round the branch point matters.`,
    }),
    num({
      id: 'cp-unwrap', difficulty: 3, transfer: true,
      gen(r) {
        const seq = r.pick([[170, 178, -176, -169], [165, 174, -177, -170, -162], [-172, -179, 175, 168], [176, -178, -171, -165]]);
        let un = [seq[0]];
        for (let k = 1; k < seq.length; k++) { let d = seq[k] - seq[k - 1]; d -= 360 * Math.round(d / 360); un.push(un[k - 1] + d); }
        const ans = un[un.length - 1] - un[0];
        const naive = seq[seq.length - 1] - seq[0];
        return {
          prompt: t`An aircraft’s heading is computed with $\operatorname{atan2}$, which returns angles in $(-180^\circ, 180^\circ]$ — the principal argument, with its cut at $\pm180^\circ$. During a steady turn, successive readings one second apart are ${seq.map((x) => t`$${x}^\circ$`).join(', ')}. By how many degrees has the aircraft actually turned from the first reading to the last? (Positive means the heading angle increased.)`,
          visual: { type: 'graph', params: { x: [-0.3, seq.length - 0.7], y: [-200, 200], aspect: 'wide', xlabel: 'time (s)', ylabel: 'atan2 reading (°)', hlines: [{ y: 180, color: 'bad', label: '+180°' }, { y: -180, color: 'bad', label: '−180°' }], points: seq.map((v, k) => ({ x: k, y: v, color: 'gold' })) }, caption: 'The raw readings: a jump of nearly 360° where the heading crosses the cut. The aircraft did not reverse.' },
          answer: ans, units: '°', tol: { rel: 0, abs: 0.5 },
          errors: [{ value: naive, feedback: 'That subtracts the raw readings across the cut. Follow the angle continuously: a step of nearly ±360° is really a small step the other way.' }],
          hints: ['Look at each step between successive readings. A step of nearly 360° in size is a crossing of the cut.', 'Unwrap: whenever a step is bigger than 180° in size, add or subtract 360° to make it small, then add up the steps.'],
          teach: 'Unwrapping an angle is analytic continuation along a path: follow it continuously instead of jumping at the cut.',
          explain: t`The steps are ${seq.slice(1).map((x, k) => { let d = x - seq[k]; d -= 360 * Math.round(d / 360); return t`$${d > 0 ? '+' : ''}${d}^\circ$`; }).join(', ')} once each is reduced to less than $180^\circ$; they add to $${ans}^\circ$. Navigation and attitude software unwraps angles exactly like this — the branch-cut bug of subtracting raw headings is a classic.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 2 §III (multifunctions)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), ch. 3 (branches and branch cuts)', url: 'https://openlibrary.org/isbn/9780073383170' },
  ],
});
