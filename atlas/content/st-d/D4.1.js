// The complex exponential and logarithm as maps. e^{x+iy} = e^x e^{iy}: x sets
// the distance from 0, y the angle — so vertical lines go to circles,
// horizontal lines to rays, and every horizontal strip of height 2π covers
// the punctured plane once (e^z is periodic, with period 2πi). Undoing it,
// log w = ln|w| + i arg w is defined only up to 2πi; the principal value Log
// picks the angle in (−π, π].
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, r6, cTeX, num as nm, cxmap, apart } from './_cx.js';

const t = String.raw;
const PI = Math.PI;

// e^z on a strip, and Log on a polar grid
const expPic = (o, caption) => cxmap({ f: 'exp', x: [-2, 1.5], y: [-3.4, 3.4], wx: [-3, 3], wy: [-3, 3], grid: 'cartesian', gx: [-1.5, 1], gy: [-PI, PI], gn: 9, ...o }, caption);
const logPic = (o, caption) => cxmap({ f: 'log', ...(o.drag ? { drag: { label: 'w', wlabel: 'Log w', ...o.drag } } : {}), x: [-3, 3], y: [-3, 3], wx: [-1.8, 1.4], wy: [-3.5, 3.5], grid: 'polar', gr: [0.25, 2.5], gth: [-PI, PI], gn: 7, gm: 12, ...o, ...(o.drag ? { drag: { label: 'w', wlabel: 'Log w', ...o.drag } } : {}) }, caption);

export default lesson({
  id: 'st-d.D4.1',
  title: 'The exponential and logarithm',
  minutes: 12, difficulty: 2,
  intro: t`Split the exponent into its real and imaginary parts:

$$e^{x + iy} = e^x\,e^{iy}$$

The real part $x$ sets the **distance** from $0$, $e^x$; the imaginary part $y$ sets the **angle**, $y$ radians. So $e^z$ wraps the plane round the origin: vertical lines become circles, horizontal lines become rays, and climbing $2\pi$ up the $z$-plane brings you back to the same value — $e^z$ is **periodic**, $e^{z + 2\pi i} = e^z$. It never reaches $0$. Running the map backwards gives the **logarithm**, $\log w = \ln|w| + i\arg w$; because the angle is only defined up to whole turns, $\log w$ has infinitely many values, $2\pi i$ apart. The **principal value** $\operatorname{Log} w$ takes the angle in $(-\pi, \pi]$.`,
  symbols: [
    { tex: 'e^x', text: t`the ordinary positive real exponential: the modulus $|e^z|$` },
    { tex: 'e^{iy}', text: t`the unit-length turn by $y$ radians (Euler’s formula): it carries the angle` },
    { tex: t`\ln|w|`, text: t`the natural log of the real, positive number $|w|$: the real part of $\log w$` },
    { tex: t`\arg w`, text: t`an angle of $w$, in radians, defined up to adding $2\pi k$` },
    { tex: t`\operatorname{Log} w`, text: t`the principal logarithm, $\ln|w| + i\operatorname{Arg} w$ with $-\pi < \operatorname{Arg} w \le \pi$` },
  ],
  why: t`The exponential turns adding into multiplying and lines into circles — it is how growth and oscillation combine in $e^{st}$, the language of control, circuits and the damped ringing of black holes — and its many-valued inverse is the first function whose branches you have to manage.`,
  visual: {
    type: 'cx-map',
    title: 'Wrapping the plane round the origin',
    lead: t`Left, a strip of the $z$-plane of height $2\pi$, from $y = -\pi$ to $y = \pi$, with a grid; right, its image under $e^z$. Vertical lines (orange) become circles, horizontal lines (blue) become rays. Drag $z$.`,
    tasks: [
      t`Drag $z$ to the left: $f(z)$ falls toward $0$ but never reaches it, since $|e^z| = e^x > 0$.`,
      t`Drag $z$ straight up: $f(z)$ circles the origin; after a climb of $2\pi \approx 6.28$ it would be back where it started. The strip shown fills the whole $w$-plane except $0$ exactly once.`,
      t`Notice the grid’s right angles survive: circles cross rays at $90^\circ$. The amplitwist is $e^z$ itself, never zero.`,
    ],
    params: { f: 'exp', x: [-2, 1.5], y: [-3.4, 3.4], wx: [-3, 3], wy: [-3, 3], grid: 'cartesian', gx: [-1.5, 1], gy: [-PI, PI], gn: 9, drag: { x: 0.4, y: 0.9 }, readout: ['z', 'w'] },
    caption: t`The grid covers $-1.5 \le x \le 1$ and $-\pi \le y \le \pi$: its image is the ring $e^{-1.5} \le |w| \le e$, with rays every $45^\circ$.`,
  },
  example: {
    prompt: t`Find every solution of $e^z = -2$, and its principal one.`,
    visual: logPic({ drag: { x: -2, y: 0.001 }, readout: ['z', 'w'], zname: 'w-plane (input)', wname: 'z = Log w' }, t`Read backwards: Log sends circles round $0$ to vertical lines and rays to horizontal lines. The point $-2$ lands at $\ln 2 + i\pi$. The dashed red ray is where Log’s angle jumps from $\pi$ to $-\pi$.`),
    steps: [
      { label: 'Polar form', text: t`$-2 = 2e^{i\pi}$: modulus $2$, angle $\pi$ (or $\pi + 2\pi k$ for any whole number $k$).` },
      { label: 'Match parts', text: t`$e^{x + iy} = e^xe^{iy}$ must have modulus $2$ and angle $\pi + 2\pi k$: so $e^x = 2$, giving $x = \ln 2$, and $y = \pi + 2\pi k$.` },
      { label: 'All solutions', text: t`$z = \ln 2 + i(\pi + 2\pi k) \approx 0.693 + i(3.14 + 6.28k)$, $k = 0, \pm1, \pm2, \dots$ — a column of points spaced $2\pi$ apart.` },
      { label: 'Principal', text: t`The one with angle in $(-\pi, \pi]$ is $k = 0$: $\operatorname{Log}(-2) = \ln 2 + i\pi$. Check: $e^{\ln 2}e^{i\pi} = 2\cdot(-1) = -2$. ✓` },
    ],
    answer: t`$z = \ln 2 + i\pi(2k + 1)$; principal value $\operatorname{Log}(-2) = \ln 2 + i\pi \approx 0.693 + 3.142i$.`,
  },
  practice: [
    num({
      id: 'exp-modulus', difficulty: 1,
      gen(r) {
        const x = r.pick([0.5, 1, -0.5, 1.2]), y = r.pick([1, 2, -2, 3]);
        const ans = Math.exp(x);
        return {
          prompt: t`Find $|e^z|$ for $z = ${cTeX([x, y])}$, to 3 significant figures.`,
          visual: expPic({ drag: { x, y }, ticks: false }, t`The point $z$ and its image, with the strip’s grid and its image (axes without numbers).`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.exp(Math.hypot(x, y)), feedback: t`$|e^z|$ is $e^{\operatorname{Re} z}$, not $e^{|z|}$: the imaginary part only turns.` }, { value: Math.exp(x) * Math.abs(Math.cos(y)), feedback: t`That is only the size of the real part. The modulus of $e^{iy}$ is 1.` }]),
          hints: [t`$e^{x + iy} = e^x e^{iy}$ and $|e^{iy}| = 1$.`],
          teach: t`$|e^z| = e^{\operatorname{Re} z}$; the imaginary part of $z$ only sets the angle.`,
          explain: t`$|e^z| = e^{${x}} = ${nm(ans, 3)}$, whatever $y$ is.`,
        };
      },
    }),
    mcq({
      id: 'periodic', difficulty: 2,
      gen(r) {
        const z = r.pick([[0.5, 1], [1, -0.5], [-0.3, 2], [0.8, 0.4]]);
        return {
          prompt: t`Which number has the same exponential as $z_0 = ${cTeX(z)}$?`,
          visual: expPic({ drag: { x: z[0], y: z[1] } }, t`$z_0$ and $e^{z_0}$, with the strip and its image.`),
          choices: [t`$z_0 + 2\pi i$`, t`$z_0 + 2\pi$`, t`$z_0 + \pi i$`, t`$-z_0$`],
          answer: 0,
          why: { 1: t`Moving $2\pi$ to the right multiplies $e^z$ by $e^{2\pi} \approx 535$: the real part sets the size.`, 2: t`Half a turn: $e^{z_0 + \pi i} = -e^{z_0}$.`, 3: t`$e^{-z_0} = 1/e^{z_0}$, which is different unless $e^{z_0} = \pm1$.` },
          hints: [t`Which change of $z$ leaves both $e^x$ and the angle $y$ (up to whole turns) unchanged?`],
          teach: t`$e^z$ has period $2\pi i$: climbing one full turn up the $z$-plane changes nothing.`,
          explain: t`$e^{z_0 + 2\pi i} = e^{z_0}e^{2\pi i} = e^{z_0}\cdot1$. Every $z_0 + 2\pi ik$ has the same exponential — which is why the logarithm is many-valued.`,
        };
      },
    }),
    num({
      id: 'log-arg', difficulty: 2,
      gen(r) {
        const w = r.pick([[-1, 1], [-1, -1], [-1, Math.sqrt(3)], [-Math.sqrt(3), -1], [0, -2], [-2, 0.0]]);
        const wt = cTeX(w);
        const ans = M.arg(w);
        const naive = Math.atan(w[1] / w[0]);
        return {
          prompt: t`Find the imaginary part of $\operatorname{Log}(${wt.replace('1.73', '\\sqrt3')})$ — the principal argument, in radians — to 3 significant figures.`,
          visual: logPic({ drag: { x: w[0], y: w[1] === 0 ? 0 : w[1] }, ticks: false, zname: 'w-plane (input)', wname: 'Log w' }, t`The point and its principal logarithm (axes without numbers). The dashed red ray is the branch cut.`),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: apart(ans, Number.isFinite(naive) ? [{ value: naive, feedback: t`$\arctan(y/x)$ gives the right angle only for $x > 0$. This point is to the left of the imaginary axis: add or subtract $\pi$.` }] : []),
          hints: [t`$\operatorname{Im}\operatorname{Log} w = \operatorname{Arg} w$, the angle in $(-\pi, \pi]$.`, 'Sketch the point and read the angle from the positive real axis, anticlockwise positive.'],
          teach: t`The imaginary part of $\operatorname{Log} w$ is the angle of $w$, chosen in $(-\pi, \pi]$.`,
          explain: t`$\operatorname{Arg}(${cTeX(w)}) = ${nm(ans, 4)}$ rad $= ${nm(ans * 180 / PI, 3)}^\circ$.`,
        };
      },
    }),
    num({
      id: 'log-real', difficulty: 1,
      gen(r) {
        const w = r.pick([[3, 4], [-5, 12], [0, 2], [-1, -1], [6, -8]]);
        const ans = Math.log(M.abs(w));
        return {
          prompt: t`Find the real part of $\operatorname{Log}(${cTeX(w)})$, to 3 significant figures.`,
          visual: logPic({ drag: { x: w[0] / Math.max(1, M.abs(w) / 2.5), y: w[1] / Math.max(1, M.abs(w) / 2.5) }, ticks: false, zname: 'w-plane (input), shrunk to fit', wname: 'Log w' }, t`The direction of $w$ (its length shrunk to fit), and the logarithm map.`),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: apart(ans, [{ value: M.abs(w), feedback: t`That is $|w|$ itself; the real part of $\operatorname{Log} w$ is its natural log.` }, { value: Math.log10(M.abs(w)), feedback: t`Complex logs are natural logs: use $\ln$, not $\log_{10}$.` }]),
          hints: [t`$\operatorname{Re}\operatorname{Log} w = \ln|w|$.`],
          teach: t`The real part of a logarithm is $\ln|w|$, the log of the distance from $0$.`,
          explain: t`$|w| = ${nm(M.abs(w), 4)}$, so $\operatorname{Re}\operatorname{Log} w = \ln ${nm(M.abs(w), 4)} = ${nm(ans, 3)}$.`,
        };
      },
    }),
    {
      type: 'point', id: 'solve-exp', difficulty: 3,
      gen(r) {
        const [w, wt] = r.pick([[[0, 1], 'i'], [[0, -1], '-i'], [[Math.E, 0], 'e'], [[0, 2], '2i'], [[1, 1], '1 + i'], [[0, -1 / Math.E], t`-i/e`]]);
        const z = M.log(w);
        return {
          prompt: t`Drag $z$ to the solution of $e^z = ${wt}$ that lies in the strip $-\pi < \operatorname{Im} z \le \pi$.`,
          visual: expPic({ drag: { x: -1.6, y: -2.6 } }, t`Drag $z$; its image under $e^z$ is the gold point. The grid strip is $-\pi \le y \le \pi$.`),
          answer: { x: r6(z[0]), y: r6(z[1]) }, tol: { x: 0.12, y: 0.12 },
          instruction: 'Drag z, then check.',
          hints: [t`$|e^z| = e^x$ must equal $|${wt}|$, and the angle $y$ must be the angle of $${wt}$.`, t`So $z = \ln|${wt}| + i\operatorname{Arg}(${wt})$.`],
          teach: t`Solving $e^z = w$ is taking a logarithm: $x = \ln|w|$, $y = $ an angle of $w$.`,
          explain: t`$z = \operatorname{Log}(${wt}) = ${cTeX(z)}$; adding any multiple of $2\pi i$ gives the other solutions.`,
        };
      },
    },
    mcq({
      id: 'no-zero', difficulty: 2,
      prompt: t`How many solutions does $e^z = 0$ have?`,
      visual: expPic({ drag: { x: -1.8, y: 0.5 } }, t`Dragging $z$ far to the left brings $e^z$ close to $0$ — but only close.`),
      choices: ['None', 'Exactly one', 'Infinitely many, 2πi apart', t`One for each $k$, at $z = 2\pi ik$`],
      answer: 0,
      why: { 1: t`$|e^z| = e^x$ is positive for every real $x$, so it is never $0$.`, 2: t`The equations $e^z = w$ have infinitely many solutions for every $w \ne 0$; $w = 0$ is the exception.`, 3: t`$e^{2\pi ik} = 1$, not $0$.` },
      hints: [t`What is $|e^z|$?`],
      teach: t`$e^z$ takes every complex value except $0$.`,
      explain: t`$|e^z| = e^{\operatorname{Re} z} > 0$. The origin is the one value missed — which is why $\log 0$ is undefined and the log has a branch point there.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-log-im', difficulty: 2,
      gen(r) {
        const w = r.pick([[-3, 3], [-2, -2], [-1, -Math.sqrt(3)], [-4, 1]]);
        const ans = M.arg(w);
        return {
          prompt: t`Find $\operatorname{Im}\operatorname{Log}(${cTeX(w).replace('1.73', '\\sqrt3')})$ in radians, to 3 significant figures.`,
          visual: logPic({ drag: { x: w[0] / Math.max(1, M.abs(w) / 2.5), y: w[1] / Math.max(1, M.abs(w) / 2.5) }, ticks: false, zname: 'w-plane (input)', wname: 'Log w' }, t`The direction of the point (length shrunk to fit), and the branch cut (dashed red).`),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: apart(ans, [{ value: Math.atan(w[1] / w[0]), feedback: t`$\arctan(y/x)$ is off by $\pi$ for points left of the imaginary axis.` }, { value: ans + 2 * PI, feedback: t`Right direction, but the principal value lies in $(-\pi, \pi]$.` }]),
          hints: [t`The principal argument lies in $(-\pi, \pi]$.`],
          teach: t`$\operatorname{Im}\operatorname{Log} w = \operatorname{Arg} w \in (-\pi, \pi]$.`,
          explain: t`$\operatorname{Arg} = ${nm(ans, 4)}$ rad $(${nm(ans * 180 / PI, 3)}^\circ)$.`,
        };
      },
    }),
    num({
      id: 'cp-branch-k', difficulty: 3,
      gen(r) {
        const [w, wt, a] = r.pick([[[-2, 0], '-2', PI], [[0, 2], '2i', PI / 2], [[0, -3], '-3i', -PI / 2], [[-1, -1], '-1 - i', -3 * PI / 4]]);
        const ans = a + 2 * PI;
        return {
          prompt: t`The equation $e^z = ${wt}$ has infinitely many solutions. Find the imaginary part of the one with $2\pi < \operatorname{Im} z < 4\pi$, to 3 significant figures.`,
          visual: expPic({ drag: false, y: [-3.4, 3.4] }, t`One strip of height $2\pi$ and its image: the solution you want lives one strip higher.`),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: a, feedback: t`That is the principal solution; the one asked for is one full turn, $2\pi$, higher.` }, { value: a + PI, feedback: t`Successive solutions are $2\pi$ apart, not $\pi$.` }],
          hints: [t`All solutions: $z = \ln|${wt}| + i(\operatorname{Arg}(${wt}) + 2\pi k)$.`, t`$\operatorname{Arg}(${wt}) = ${nm(a, 4)}$; add $2\pi$ until you are between $2\pi \approx 6.28$ and $4\pi \approx 12.57$.`],
          teach: t`The solutions of $e^z = w$ form a column spaced $2\pi$ apart: $\log w = \operatorname{Log} w + 2\pi ik$.`,
          explain: t`$\operatorname{Im} z = ${nm(a, 4)} + 2\pi = ${nm(ans, 4)}$.`,
        };
      },
    }),
    num({
      id: 'cp-sampled', difficulty: 3, transfer: true,
      gen(r) {
        const sg = r.pick([10, 20, 40]), T = r.pick([0.01, 0.005, 0.02]), om = r.pick([30, 60, 100]);
        const ans = Math.exp(-sg * T);
        return {
          prompt: t`A flight-control computer samples an attitude loop every $T = ${T}$ s. A continuous mode $e^{st}$ with $s = -${sg} + ${om}i\ \text{s}^{-1}$ appears in the sampled system as powers of $z = e^{sT}$, and the sampled system is stable when $|z| < 1$. Find $|z|$, to 3 significant figures.`,
          visual: cxmap({ f: 'exp', x: [-1.2, 0.6], y: [-2.3, 2.3], wx: [-1.4, 1.4], wy: [-1.4, 1.4], grid: 'cartesian', gx: [-1, 0], gy: [-2.2, 2.2], gn: 7, ticks: false, drag: { x: r6(-sg * T), y: r6(om * T), label: 'sT', wlabel: 'z' }, curves: [{ param: ['0', 't'], t: [-2.3, 2.3], color: 'gold', label: 'Re(sT) = 0' }] }, t`Left: the point $sT$ and part of the left half-plane; right, their images under $z = e^{sT}$. The gold line $\operatorname{Re}(sT) = 0$ maps onto the unit circle. Axes without numbers.`),
          answer: ans, tol: { rel: 0.005 },
          errors: apart(ans, [{ value: Math.exp(-sg), feedback: t`Multiply by the sample time: $|z| = e^{\operatorname{Re}(s)\,T}$.` }, { value: Math.exp(-sg * T) * Math.cos(om * T), feedback: t`That is $\operatorname{Re} z$. The size of $z$ comes from the real part of $sT$ alone.` }]),
          hints: [t`$|e^{sT}| = e^{\operatorname{Re}(sT)}$.`, t`$\operatorname{Re}(sT) = -${sg}\times${T} = ${nm(-sg * T, 3)}$.`],
          teach: t`$z = e^{sT}$ maps the stable left half of the $s$-plane into the unit disc: decay rate sets $|z|$, frequency sets $\arg z$.`,
          explain: t`$|z| = e^{-${sg}\times${T}} = e^{${nm(-sg * T, 3)}} = ${nm(ans, 3)} < 1$: stable. Its angle is $\omega T = ${nm(om * T, 3)}$ rad. Every $s$ with negative real part lands inside the unit circle — the exponential map is the bridge between continuous and digital control.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 2 §IV (exponential and logarithm)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Brown & Churchill, Complex Variables and Applications (9th ed.), ch. 3', url: 'https://openlibrary.org/isbn/9780073383170' },
    { label: 'Franklin, Powell & Workman, Digital Control of Dynamic Systems (the z-transform and the map z = e^(sT))', url: 'https://openlibrary.org/search?q=Digital+Control+of+Dynamic+Systems+Franklin+Powell' },
  ],
});
