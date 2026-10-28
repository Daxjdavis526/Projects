// Euler's formula revisited: why e^{iθ} = cos θ + i sin θ is the right
// definition, three ways — the motion whose velocity is always i times its
// position goes round the unit circle at unit speed; compounding many tiny
// turns, (1 + iθ/n)^n; and the power series. Then what it buys: trig
// identities in one line, De Moivre, phasors adding as arrows, and a damped
// complex frequency — a black hole's ringdown.
import { lesson, mcq, num } from '../../src/core/content.js';
import { M, r6, cTeX, num as nm, deg, argand, apart } from './_cx.js';

const t = String.raw;
const DEG = Math.PI / 180;

// the compounding polygon: vertices (1 + iθ/n)^k, k = 0…n, joined by straight segments (t runs 0…n)
const RHO = 'sqrt(1 + (th/n)^2)', AL = 'atan(th/n)', FL = 'min(floor(t), n - 1)';
const vx = (k) => `(${RHO})^(${k})*cos((${k})*${AL})`, vy = (k) => `(${RHO})^(${k})*sin((${k})*${AL})`;
const polygon = { param: [`${vx(FL)} + (t - ${FL})*(${vx(`${FL} + 1`)} - ${vx(FL)})`, `${vy(FL)} + (t - ${FL})*(${vy(`${FL} + 1`)} - ${vy(FL)})`], t: [0, 'n'], color: 'accent', width: 2.2 };
const unitCircle = { param: ['cos(t)', 'sin(t)'], t: [0, 6.2832], color: 'ink3', width: 1.4, dash: [4, 4] };
// a static polygon for one n and θ
const polyStatic = (n, th, caption) => {
  const rho = Math.sqrt(1 + (th / n) ** 2), al = Math.atan(th / n);
  const pts = Array.from({ length: n + 1 }, (_, k) => M.polar(rho ** k, k * al));
  const curves = [unitCircle, ...pts.slice(1).map((p, k) => ({ param: [`${r6(pts[k][0])} + (${r6(p[0] - pts[k][0])})*t`, `${r6(pts[k][1])} + (${r6(p[1] - pts[k][1])})*t`], t: [0, 1], color: 'accent', width: 2 }))];
  return { type: 'graph', params: { x: [-2.6, 2.6], y: [-1.5, 1.9], equal: true, xlabel: 'Re', ylabel: 'Im', curves, points: [{ x: r6(Math.cos(th)), y: r6(Math.sin(th)), color: 'gold', label: 'e^(iθ)' }] }, caption };
};

const POW = { 6: [0, -1], 10: [0, 1], 12: [-1, 0], 14: [0, -1] };   // e^{inπ/4} for these n

export default lesson({
  id: 'st-d.D1.2',
  title: 'Euler’s formula revisited',
  minutes: 11, difficulty: 2,
  intro: t`You have used $e^{i\theta} = \cos\theta + i\sin\theta$ as a shorthand. Here is why it is not a coincidence but the **only sensible meaning** of an exponential with an imaginary exponent. Ask for the one property that defines $e^{kt}$ — its rate of change is $k$ times itself — with $k = i$:

$$\frac{d}{d\theta}\,e^{i\theta} = i\,e^{i\theta}$$

Read it as motion. The point $e^{i\theta}$ starts at $1$, and its **velocity is its position turned a quarter-turn**: always at right angles to the radius, with the same length as the radius. Such a point goes round the unit circle at speed $1$, so by “time” $\theta$ it has travelled an arc of length $\theta$ — it sits at angle $\theta$ radians, at $(\cos\theta, \sin\theta)$. That is Euler’s formula.`,
  equation: t`e^{i\theta} = \cos\theta + i\sin\theta`,
  symbols: [
    { tex: t`e^{i\theta}`, text: 'the complex exponential: the point at angle $\\theta$ on the circle of radius 1. Its length is always 1' },
    { tex: t`\theta`, text: 'a real number, the angle in **radians** — equal to the arc length walked round the unit circle. (In degrees the formula fails: the derivative rule needs radians)' },
    { tex: t`\cos\theta,\ \sin\theta`, text: 'the real and imaginary parts: the shadows of the point on the two axes' },
    { tex: 'i', text: t`the imaginary unit, $i^2 = -1$; multiplying by it is a quarter-turn` },
  ],
  why: t`Every oscillation in physics — AC circuits, waves, quantum states, the ringing of a black hole — is written as $e^{i\omega t}$, because a turning arrow is simpler to multiply, differentiate and add than a sine.`,
  visual: {
    type: 'graph',
    title: 'Compound many tiny turns',
    lead: t`Multiplying by $1 + i\theta/n$ turns a little and stretches a little (its length is $\sqrt{1 + \theta^2/n^2}$, just over 1). Do it $n$ times: the blue polygon walks from $1$ to $(1 + i\theta/n)^n$. As $n$ grows the stretch per step dies away faster than the steps multiply, and the walk lands on the gold point $e^{i\theta}$ on the unit circle.`,
    tasks: [
      t`With $n = 1$ there is one step, straight up from $1$ to $1 + i\theta$. Raise $n$: the polygon bends round onto the circle.`,
      t`Set $\theta = \pi \approx 3.14$ and push $n$ up: the end approaches $-1$. That is $e^{i\pi} = -1$, a half-turn.`,
      t`Watch the readout of the length: it tends to $1$, roughly like $1 + \theta^2/2n$.`,
    ],
    params: {
      x: [-2.6, 2.6], y: [-1.7, 2.3], equal: true, xlabel: 'Re', ylabel: 'Im',
      sliders: [
        { key: 'n', label: 'Number of steps $n$', min: 1, max: 40, step: 1, value: 4, explain: t`How many small multiplications by $1 + i\theta/n$.` },
        { key: 'th', label: t`Total angle $\theta$`, min: 0.2, max: 6.2, step: 0.02, value: 2, unit: '\\text{rad}', explain: 'The angle the whole walk should turn through, in radians.' },
      ],
      curves: [unitCircle, polygon],
      points: [{ x: 'cos(th)', y: 'sin(th)', color: 'gold', label: 'e^(iθ)' }, { x: `(${RHO})^n*cos(n*${AL})`, y: `(${RHO})^n*sin(n*${AL})`, color: 'accent', label: '(1 + iθ/n)ⁿ', labelDy: 16 }, { x: 1, y: 0, color: 'ink2', label: '1' }],
      readouts: [{ label: 'length of (1 + iθ/n)ⁿ', expr: `(1 + (th/n)^2)^(n/2)`, digits: 4 }, { label: 'its angle (rad)', expr: `n*${AL}`, digits: 4 }],
    },
    caption: t`Exact: every vertex is a power of $1 + i\theta/n$. The dashed circle is $|z| = 1$.`,
  },
  example: {
    prompt: t`Use $e^{i(a + b)} = e^{ia}e^{ib}$ to derive the formulas for $\cos(a + b)$ and $\sin(a + b)$.`,
    visual: argand({
      arrows: [{ to: M.polar(1, 50 * DEG), color: 'accent', label: 'e^(ia)' }, { to: M.polar(1, 80 * DEG), color: 'gold', label: 'e^(i(a+b))' }, { to: M.polar(1, 30 * DEG), color: 'warn', label: 'e^(ib)' }],
      circles: [{ r: 1 }], arcs: [{ r: 0.35, from: 0, to: 30 * DEG, color: 'warn' }, { r: 0.55, from: 50 * DEG, to: 80 * DEG, color: 'warn' }],
      view: 1.25, center: [0.3, 0.45], ticks: false,
      caption: t`Drawn with $a = 50^\circ$, $b = 30^\circ$: multiplying $e^{ia}$ by $e^{ib}$ turns it a further $b$.`,
    }),
    steps: [
      { label: 'Turning twice', text: t`Turning by $a$ and then by $b$ is turning by $a + b$, so $e^{i(a+b)} = e^{ia}\,e^{ib}$ — the exponential law, now with a geometric meaning.` },
      { label: 'Expand the right side', text: t`$(\cos a + i\sin a)(\cos b + i\sin b) = (\cos a\cos b - \sin a\sin b) + i(\sin a\cos b + \cos a\sin b)$, using $i^2 = -1$.` },
      { label: 'Match parts', text: t`The left side is $\cos(a + b) + i\sin(a + b)$. Two complex numbers are equal only if their real parts agree and their imaginary parts agree:
$$\cos(a + b) = \cos a\cos b - \sin a\sin b,\qquad \sin(a + b) = \sin a\cos b + \cos a\sin b.$$` },
      { label: 'Check', text: t`With $a = 50^\circ$, $b = 30^\circ$: $\cos50^\circ\cos30^\circ - \sin50^\circ\sin30^\circ = ${nm(Math.cos(50 * DEG) * Math.cos(30 * DEG) - Math.sin(50 * DEG) * Math.sin(30 * DEG), 4)} = \cos80^\circ$. ✓` },
    ],
    answer: t`Both angle-addition formulas at once, from one line of complex multiplication. The same move gives De Moivre’s $(\cos\theta + i\sin\theta)^n = \cos n\theta + i\sin n\theta$.`,
  },
  practice: [
    mcq({
      id: 'which-point', difficulty: 1,
      gen(r) {
        const [th, tt] = r.pick([[2 * Math.PI / 3, t`2\pi/3`], [5 * Math.PI / 6, t`5\pi/6`], [-Math.PI / 3, t`-\pi/3`], [4 * Math.PI / 3, t`4\pi/3`], [3 * Math.PI / 4, t`3\pi/4`]]);
        const cands = [M.polar(1, th), M.polar(1, -th), M.polar(1, Math.PI / 2 - th), M.polar(1, th * DEG)];
        const L = ['P', 'Q', 'R', 'S'], at = r.shuffle([0, 1, 2, 3]);
        const nameOf = (k) => L[at[k]];
        return {
          prompt: t`Which labelled point is $e^{i${tt}}$?`,
          visual: argand({ pts: cands.map((p, k) => ({ z: p, label: nameOf(k) })), circles: [{ r: 1 }], view: 1.3, caption: 'Four points on the unit circle |z| = 1.' }),
          choices: L, answer: at[0], fixedOrder: true,
          why: {
            [at[1]]: t`Point ${nameOf(1)} is $e^{-i${tt}}$, the mirror image: the angle is measured anticlockwise for positive $\theta$.`,
            [at[2]]: t`Point ${nameOf(2)} has its cosine and sine swapped — the angle measured from the imaginary axis instead of the real one.`,
            [at[3]]: t`Point ${nameOf(3)} is at $${nm(th, 3)}$ **degrees**. In $e^{i\theta}$ the angle is in radians: $${tt} = ${nm(deg(th), 3)}^\circ$.`,
          },
          hints: [t`$e^{i\theta}$ is the point at angle $\theta$ radians on the unit circle, anticlockwise from $1$.`, t`$${tt}$ rad $= ${nm(deg(th), 3)}^\circ$.`],
          teach: t`$e^{i\theta}$ sits on the unit circle at angle $\theta$ radians, measured anticlockwise from the positive real axis.`,
          explain: t`$e^{i${tt}} = \cos(${tt}) + i\sin(${tt}) = ${cTeX(M.polar(1, th))}$: point ${nameOf(0)}, at $${nm(deg(th), 3)}^\circ$.`,
        };
      },
    }),
    num({
      id: 'polar-exp', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3, 4]);
        const [th, tt] = r.pick([[Math.PI / 3, t`\pi/3`], [2 * Math.PI / 3, t`2\pi/3`], [Math.PI / 4, t`\pi/4`], [5 * Math.PI / 6, t`5\pi/6`], [-Math.PI / 6, t`-\pi/6`]]);
        const ans = R * Math.cos(th);
        return {
          prompt: t`Find the real part of $e^{\ln ${R} + i${tt}}$. Give 3 significant figures.`,
          visual: argand({ circles: [{ r: 1 }, { r: R, color: 'ink2' }], arcs: [{ r: 0.7, from: 0, to: th, color: 'warn' }], view: R + 0.4, ticks: false, caption: t`The unit circle and the circle of radius $${R}$; the arc marks the angle $${tt}$.` }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: apart(ans, [{ value: R * Math.sin(th), feedback: 'That is the imaginary part: the real part goes with the cosine.' }, { value: Math.log(R) * Math.cos(th), feedback: t`$e^{\ln ${R}} = ${R}$: the real part of the exponent sets the length, so undo the logarithm.` }]),
          hints: [t`Split the exponent: $e^{x + iy} = e^x\,e^{iy}$.`, t`$e^{\ln ${R}} = ${R}$, so the number is $${R}e^{i${tt}}$, at length $${R}$ and angle $${tt}$.`],
          teach: t`The real part of the exponent sets the length ($e^x$), the imaginary part sets the angle.`,
          explain: t`$e^{\ln ${R} + i${tt}} = ${R}(\cos ${tt} + i\sin ${tt})$, whose real part is $${R}\cos(${tt}) = ${nm(ans, 3)}$.`,
        };
      },
    }),
    num({
      id: 'amp-sum', difficulty: 2,
      gen(r) {
        const [A, B] = r.pick([[3, 4], [5, 12], [6, 8], [8, 15], [2, 3], [1, 2]]);
        const ans = Math.hypot(A, B);
        return {
          prompt: t`Write $x(t) = ${A}\cos\omega t + ${B}\sin\omega t$ as $\operatorname{Re}\big[(${A} - ${B}i)\,e^{i\omega t}\big]$. What is the amplitude of $x(t)$ — the largest value it reaches?`,
          visual: { type: 'graph', params: { x: [0, 12.6], y: [-ans - 1, ans + 1], aspect: 'wide', xlabel: 'ωt (rad)', ylabel: 'x', yticks: 0, curves: [{ fn: `${A}*cos(x)`, color: 'accent', label: `${A} cos ωt`, labelAt: 0.2, labelDy: -10 }, { fn: `${B}*sin(x)`, color: 'warn', label: `${B} sin ωt`, labelAt: 1.9, labelDy: -12 }] }, caption: 'The two parts on their own (vertical scale without numbers). Their sum is another sinusoid of the same frequency.' },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: A + B, feedback: 'The two peaks do not happen at the same time, so the amplitudes do not simply add. Add them as arrows at right angles.' }],
          hints: [t`$(${A} - ${B}i)e^{i\omega t}$ is an arrow of fixed length turning at rate $\omega$; its real part is $x(t)$.`, t`The largest real part a turning arrow reaches is its length: $|${A} - ${B}i|$.`],
          teach: 'Sinusoids of one frequency add like arrows: write each as a complex amplitude, add, and read off the length.',
          explain: t`$|${A} - ${B}i| = \sqrt{${A}^2 + ${B}^2} = ${nm(ans, 4)}$. The phase: $x(t) = ${nm(ans, 4)}\cos(\omega t - ${nm(deg(Math.atan2(B, A)), 3)}^\circ)$, since $\arg(${A} - ${B}i) = -${nm(deg(Math.atan2(B, A)), 3)}^\circ$.`,
        };
      },
    }),
    mcq({
      id: 'why-circle', difficulty: 2,
      prompt: t`A point moves so that its velocity is always $i$ times its position: $\dot z = iz$, starting from $z(0) = 1$. What does it do?`,
      visual: argand({ arrows: [{ to: M.polar(1, 0.7), color: 'accent', label: 'z' }, { from: M.polar(1, 0.7), to: M.add(M.polar(1, 0.7), M.polar(0.6, 0.7 + Math.PI / 2)), color: 'gold', label: 'iz (velocity)' }], circles: [{ r: 1 }], view: 1.4, ticks: false, caption: 'The position arrow and the velocity iz drawn from its tip (velocity shortened to 60%).' }),
      choices: [
        'It goes round the unit circle at speed 1, so at time θ it is at angle θ radians',
        'It moves straight up the imaginary axis at speed 1',
        t`It spirals outward, growing like $e^\theta$`,
        'It goes round the unit circle, but its speed grows with time',
      ],
      answer: 0,
      why: {
        1: t`The velocity is $iz$, which turns as $z$ turns — only at the very start does it point straight up.`,
        2: t`A velocity at right angles to the radius changes the direction of $z$, not its length: $\frac{d}{dt}|z|^2 = 2\operatorname{Re}(\bar z\dot z) = 2\operatorname{Re}(i|z|^2) = 0$.`,
        3: t`The speed is $|iz| = |z| = 1$ the whole time.`,
      },
      hints: [t`Compare the directions of $z$ and $iz$.`, t`$|iz| = |z|$. If the velocity is always perpendicular to the radius, can the distance from 0 change?`],
      teach: t`$\frac{d}{d\theta}e^{i\theta} = ie^{i\theta}$ says “move at right angles to the radius, at unit speed” — circular motion, angle = arc length.`,
      explain: t`The velocity is perpendicular to the position, so the distance from 0 stays 1; its length is 1, so the point walks the circle at unit speed and has covered an arc $\theta$ — angle $\theta$ radians — at time $\theta$. Hence $e^{i\theta} = \cos\theta + i\sin\theta$.`,
    }),
    num({
      id: 'compound', difficulty: 3,
      gen(r) {
        const n = r.pick([4, 5, 10, 20]);
        const ans = Math.pow(1 + Math.PI ** 2 / n ** 2, n / 2);
        return {
          prompt: t`Compounding $n = ${n}$ equal steps toward $e^{i\pi}$: find the length $|(1 + i\pi/${n})^{${n}}|$. Give 3 significant figures.`,
          visual: polyStatic(n, Math.PI, t`The ${n}-step walk $(1 + i\pi/${n})^k$, $k = 0, \dots, ${n}$, and the target $e^{i\pi} = -1$ on the dashed unit circle.`),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: 1, feedback: t`That is the limit as $n \to \infty$. With only $${n}$ steps every factor still stretches a little.` }, { value: Math.sqrt(1 + Math.PI ** 2 / n ** 2), feedback: 'That is the length of one step; there are n of them, and lengths multiply.' }],
          hints: [t`Lengths multiply: $|(1 + i\pi/${n})^{${n}}| = |1 + i\pi/${n}|^{${n}}$.`, t`$|1 + i\pi/${n}| = \sqrt{1 + \pi^2/${n * n}}$.`],
          teach: t`Each factor $1 + i\theta/n$ stretches by $\sqrt{1 + \theta^2/n^2}$; the $n$ stretches together tend to 1, which is why the limit lands on the unit circle.`,
          explain: t`$\left(1 + \pi^2/${n * n}\right)^{${n}/2} = ${nm(ans, 4)}$. For large $n$ this is about $1 + \pi^2/(2n)$, which tends to $1$: the walk ends ever closer to $-1$.`,
        };
      },
    }),
    mcq({
      id: 'de-moivre', difficulty: 2,
      gen(r) {
        const n = r.pick([6, 10, 12, 14]), d = POW[n], m = 2 ** (n / 2);
        const fmt = (c) => cTeX(M.scale(d, c));
        return {
          prompt: t`Compute $(1 + i)^{${n}}$ using polar form.`,
          visual: argand({ arrows: [{ to: [1, 1], color: 'accent', label: '1 + i' }], arcs: [{ r: 0.5, from: 0, to: Math.PI / 4, color: 'accent' }], circles: [{ r: Math.SQRT2 }], view: 1.7, caption: t`$1 + i$: length $\sqrt2$, angle $45^\circ$.` }),
          choices: [t`$${fmt(m)}$`, t`$${fmt(-m)}$`, t`$${fmt(2 ** n)}$`, t`$${fmt(r6(n * Math.SQRT2))}$`],
          answer: 0,
          why: {
            1: t`The length is right but the direction is a half-turn off: count the angle again, $${n}\times45^\circ = ${45 * n}^\circ$.`,
            2: t`$|1 + i| = \sqrt2$, not $2$: the length is $(\sqrt2)^{${n}} = 2^{${n / 2}}$.`,
            3: t`The length is raised to the power $${n}$, not multiplied by it.`,
          },
          hints: [t`$1 + i = \sqrt2\,e^{i\pi/4}$.`, t`$(1 + i)^{${n}} = (\sqrt2)^{${n}}e^{i${n}\pi/4}$; reduce $${n}\pi/4$ by whole turns.`],
          teach: 'A power raises the length to that power and multiplies the angle.',
          explain: t`$(\sqrt2)^{${n}} = ${m}$ and $${n}\times45^\circ = ${45 * n}^\circ$, which points the same way as $${((45 * n) % 360)}^\circ$. So $(1 + i)^{${n}} = ${fmt(m)}$.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-im', difficulty: 2,
      gen(r) {
        const R = r.pick([2, 3, 5]);
        const [a, at] = r.pick([[Math.PI / 4, t`\pi/4`], [Math.PI / 6, t`\pi/6`], [Math.PI / 3, t`\pi/3`]]);
        const [b, bt] = r.pick([[Math.PI / 12, t`\pi/12`], [Math.PI / 4, t`\pi/4`], [Math.PI / 2, t`\pi/2`]]);
        const ans = R * Math.sin(a + b);
        return {
          prompt: t`Find the imaginary part of $${R}e^{i${at}}\cdot e^{i${bt}}$, to 3 significant figures.`,
          visual: argand({ arrows: [{ to: M.polar(R, a), color: 'accent', label: 'first factor' }], circles: [{ r: R }], arcs: [{ r: 0.5 * R, from: a, to: a + b, color: 'warn' }], view: R * 1.15, ticks: false, caption: t`The first factor, and (orange) the further turn the second one adds.` }),
          answer: ans, tol: { rel: 0.005, abs: 0.002 },
          errors: apart(ans, [{ value: R * Math.cos(a + b), feedback: 'That is the real part.' }, { value: R * Math.sin(a) * Math.sin(b), feedback: t`Multiplying does not multiply the sines: it **adds the angles**, $${at} + ${bt}$.` }]),
          hints: [t`$e^{i${at}}e^{i${bt}} = e^{i(${at} + ${bt})}$.`],
          teach: 'Multiplying exponentials adds their angles.',
          explain: t`$${R}e^{i(${at} + ${bt})}$ has imaginary part $${R}\sin(${nm(deg(a + b), 3)}^\circ) = ${nm(ans, 3)}$.`,
        };
      },
    }),
    num({
      id: 'cp-line-voltage', difficulty: 3, transfer: true,
      gen(r) {
        const [V, where] = r.pick([[115, 'an aircraft’s 400 Hz three-phase bus'], [230, 'a European three-phase supply'], [120, 'a North American three-phase supply'], [115, 'a launch pad’s ground-support three-phase supply']]);
        const ans = Math.sqrt(3) * V;
        return {
          prompt: t`On ${where}, each phase voltage is a sinusoid of RMS value $${V}$ V, the three phases $120^\circ$ apart: $v_a = V_0\cos\omega t$, $v_b = V_0\cos(\omega t - 120^\circ)$. A load connected **between** two phases sees $v_a - v_b$. What is its RMS value?`,
          visual: argand({ arrows: [{ to: [1, 0], color: 'accent', label: 'phase a' }, { to: M.polar(1, -120 * DEG), color: 'warn', label: 'phase b' }, { to: M.polar(1, 120 * DEG), color: 'ink3', label: 'phase c' }], circles: [{ r: 1 }], view: 1.3, ticks: false, caption: 'The three phase voltages as complex amplitudes (phasors), equal in length and 120° apart. Lengths in units of the phase amplitude.' }),
          answer: ans, units: 'V', tol: { rel: 0.005 },
          errors: [{ value: 2 * V, feedback: 'The two phases never peak at the same moment: subtract the arrows, do not add their lengths.' }, { value: 0, feedback: 'All three together cancel; two of them do not.' }, { value: V, feedback: t`That is the length of $V_a + V_b$ (the third phase reversed); the load sees the difference.` }],
          hints: [t`Write $v_a - v_b = \operatorname{Re}\big[(V_a - V_b)e^{i\omega t}\big]$ with $V_a = V_0$ and $V_b = V_0e^{-i\,120^\circ}$.`, t`$|1 - e^{-i\,120^\circ}| = |1 - (-\tfrac12 - \tfrac{\sqrt3}{2}i)| = |\tfrac32 + \tfrac{\sqrt3}{2}i| = \sqrt3$. RMS values scale the same way as amplitudes.`],
          teach: 'Same-frequency voltages combine as complex amplitudes; the difference of two phasors 120° apart is √3 times either one.',
          explain: t`$|V_a - V_b| = \sqrt3\,V_0$, so the line-to-line RMS voltage is $\sqrt3\times${V} = ${nm(ans, 4)}$ V — the reason aircraft systems are labelled “115/200 V” and European ones “230/400 V”.`,
        };
      },
    }),
    num({
      id: 'cp-ringdown', difficulty: 3, transfer: true,
      gen(r) {
        const wR = 0.37367168, wI = 0.08896232;
        const n = r.pick([1, 2, 3]);
        const ans = Math.exp(-2 * Math.PI * n * wI / wR);
        return {
          prompt: t`After two black holes merge, the remnant “rings down”: the gravitational-wave strain is $h(t) = \operatorname{Re}\big[A\,e^{-i\omega t}\big]$ with a **complex** frequency $\omega = \omega_R - i\omega_I$. For the dominant mode of a non-spinning black hole of mass $M$, $GM\omega/c^3 = 0.37367 - 0.08896\,i$. By what factor has the amplitude fallen after ${n === 1 ? 'one full oscillation' : `${n} full oscillations`}? (The answer does not depend on $M$.)`,
          visual: { type: 'graph', params: { x: [0, 3.2], y: [-1.1, 1.1], aspect: 'wide', xlabel: 'time (oscillation periods)', ylabel: 'h', yticks: 0, curves: [{ fn: `e^(-${r6(2 * Math.PI * wI / wR)}*x)*cos(2*pi*x)`, color: 'accent' }] }, caption: t`The ringdown waveform $\operatorname{Re}[e^{-i\omega t}]$, with time in units of the oscillation period $2\pi/\omega_R$ (vertical scale without numbers).` },
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.exp(-n * wI / wR), feedback: t`One period is $2\pi/\omega_R$, not $1/\omega_R$: the exponent is $-\omega_I\cdot 2\pi n/\omega_R$.` }, { value: Math.exp(-2 * Math.PI * n * wR / wI), feedback: 'The decay comes from the imaginary part of ω, and the period from the real part — you have them swapped.' }],
          hints: [t`$e^{-i\omega t} = e^{-i\omega_R t}\,e^{-\omega_I t}$: a turning arrow whose length shrinks as $e^{-\omega_I t}$.`, t`One period lasts $2\pi/\omega_R$, so after ${n} the length has the factor $e^{-2\pi\cdot ${n}\,\omega_I/\omega_R}$; only the ratio $\omega_I/\omega_R$ enters.`],
          teach: 'A complex frequency is a turning arrow that shrinks: the real part sets how fast it turns, the imaginary part how fast it decays.',
          explain: t`$e^{-2\pi\cdot${n}\times0.08896/0.37367} = ${nm(ans, 3)}$. A black hole is a poor bell — its quality factor $\omega_R/2\omega_I \approx 2.1$ — and this mode’s frequencies are the numbers LIGO–Virgo compare with Einstein’s theory. (Non-spinning remnant assumed; real remnants spin, which changes both numbers. The mode frequency was computed by Leaver’s continued-fraction method.)`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Needham, Visual Complex Analysis (25th anniversary ed.), ch. 1 §II (Euler’s formula)', url: 'https://global.oup.com/academic/product/visual-complex-analysis-9780192868916' },
    { label: 'Leaver, Proc. R. Soc. A 402, 285 (1985): quasinormal modes of Schwarzschild black holes', url: 'https://doi.org/10.1098/rspa.1985.0119' },
    { label: 'Berti, Cardoso & Starinets, Quasinormal modes of black holes and black branes, CQG 26, 163001 (2009)', url: 'https://arxiv.org/abs/0905.2975' },
  ],
});
