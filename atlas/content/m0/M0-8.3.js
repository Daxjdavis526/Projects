// a sin x + b cos x = R sin(x + φ) — two sinusoids of one frequency add to one sinusoid; R and φ come from the phasor (a, b).
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { sig } from '../../src/core/format.js';
import { N } from './_m0kit.js';
import { PI, D2R, piTeX, trigGraph } from './_m0trig.js';

const t = String.raw;
const deg = (x) => x / D2R;
// the phasor picture: a along the reference direction, b a quarter turn ahead, both turned by the angle u;
// the right half plots a sin t, b cos t and their sum against t (squeezed by 1.5 horizontally)
const C0 = -7, SX = 1.8;
const phasorParams = (a, b, u, { sliders = true, readouts = true } = {}) => ({
  x: [-13.2, 12.2], y: [-6, 6], equal: true, aspect: 'wide', xlabel: '', ylabel: '', xticks: 0, yticks: 0, grid: false,
  ...(sliders ? {
    sliders: [
      { key: 'a', label: t`Coefficient $a$ (of $\sin x$)`, min: -4, max: 4, step: 0.1, value: a, explain: t`The length of the orange phasor, which points along the reference direction.` },
      { key: 'b', label: t`Coefficient $b$ (of $\cos x$)`, min: -4, max: 4, step: 0.1, value: b, explain: t`The length of the blue phasor, a quarter turn ahead of the orange one.` },
      { key: 'u', label: t`Angle $x$`, min: 0, max: 6.28, step: 0.01, value: u, unit: '\\text{rad}', explain: t`Turn both phasors together; their heights are $a\sin x$ and $b\cos x$.` },
    ],
  } : { constants: { a, b, u } }),
  curves: [
    { param: [`${C0} + sqrt(a^2 + b^2)*cos(t)`, 'sqrt(a^2 + b^2)*sin(t)'], t: [0, N(2 * PI)], color: 'ink4', width: 1.2, dash: true },
    { fn: '0', domain: [0, N(2 * PI * SX)], color: 'ink4', width: 1 },
    { param: [`${SX}*t`, 'a*sin(t)'], t: [0, N(2 * PI)], color: 'warn', width: 1.3, dash: true },
    { param: [`${SX}*t`, 'b*cos(t)'], t: [0, N(2 * PI)], color: 'accent', width: 1.3, dash: true },
    { param: [`${SX}*t`, 'a*sin(t) + b*cos(t)'], t: [0, N(2 * PI)], color: 'gold', width: 2.6 },
    { param: [`${C0} + a*cos(u) - b*sin(u) + t*(${SX}*u - (${C0} + a*cos(u) - b*sin(u)))`, 'a*sin(u) + b*cos(u)'], t: [0, 1], color: 'gold', width: 1.1, dash: true },
  ],
  arrows: [
    { from: [C0, 0], to: [`${C0} + a*cos(u)`, 'a*sin(u)'], color: 'warn', width: 2.6 },
    { from: [`${C0} + a*cos(u)`, 'a*sin(u)'], to: [`${C0} + a*cos(u) - b*sin(u)`, 'a*sin(u) + b*cos(u)'], color: 'accent', width: 2.6 },
    { from: [C0, 0], to: [`${C0} + a*cos(u) - b*sin(u)`, 'a*sin(u) + b*cos(u)'], color: 'gold', width: 3.2, label: 'R', labelDx: 8, labelDy: -8 },
  ],
  points: [{ x: `${SX}*u`, y: 'a*sin(u) + b*cos(u)', color: 'gold', r: 5 }, { x: N(SX * 2 * PI), y: 0, r: 0, label: 'x', color: 'ink3', labelDx: 8, labelDy: 0 }, { x: C0, y: 0, color: 'ink3', r: 3 }],
  ...(readouts ? {
    readouts: [
      { label: t`$R = \sqrt{a^2 + b^2}$`, expr: 'sqrt(a^2 + b^2)', digits: 3 },
      { label: t`$\varphi$ (degrees)`, expr: 'atan2(b, a)*180/pi', digits: 4 },
      { label: t`$a\sin x + b\cos x$`, expr: 'a*sin(u) + b*cos(u)', digits: 3 },
      { label: t`$R\sin(x + \varphi)$`, expr: 'sqrt(a^2 + b^2)*sin(u + atan2(b, a))', digits: 3 },
    ],
  } : {}),
});

export default lesson({
  id: 'm0.M0-8.3',
  title: 'Writing a sin x + b cos x as R sin(x + φ)',
  minutes: 10, difficulty: 3,
  intro: t`Add a sine and a cosine of the same frequency and you get **one** sinusoid of that frequency, with a new amplitude and a phase:

$$a\sin x + b\cos x = R\sin(x + \varphi), \qquad R = \sqrt{a^2 + b^2}$$

Why: expand the right side with the sum formula, $R\sin(x + \varphi) = R\cos\varphi\,\sin x + R\sin\varphi\,\cos x$, and match coefficients: $a = R\cos\varphi$, $b = R\sin\varphi$. So $(a, b)$ are the components of an arrow — a **phasor** — of length $R$ at angle $\varphi$. Read $\varphi$ off that arrow, quadrant and all: $\tan\varphi = b/a$ gives the right angle only when $a > 0$; when $a < 0$ the arrow points left and you must add $\pi$ (a calculator’s \`atan2(b, a)\` does this for you).`,
  symbols: [
    { tex: 'a,\\ b', text: 'the coefficients of $\\sin x$ and $\\cos x$, in the units of the signal' },
    { tex: 'R', text: 'the **amplitude** of the combined sinusoid: the length of the phasor $(a, b)$' },
    { tex: '\\varphi', text: 'the **phase**, in rad (or degrees): the direction of the phasor $(a, b)$, measured from the $a$-axis' },
    { tex: 'x', text: 'the angle (often $\\omega t$ — the formula holds at every instant)' },
  ],
  why: t`Every solution of the harmonic-oscillator equation comes out as $C_1\cos\omega t + C_2\sin\omega t$; this identity turns it into an amplitude and a phase you can see and measure. In AC circuits, two voltages of the same frequency add the same way — as phasors, tip to tail. The complex-number version, $\operatorname{Re}\big[\tilde A e^{i\omega t}\big]$, is the [complex amplitude](#/lesson/phys3750.W1.1) of wave physics.`,
  visual: {
    type: 'graph',
    title: 'Two phasors, one wave',
    lead: t`Left: the orange phasor has length $a$, the blue one length $b$ and points a quarter turn ahead; tip to tail they make the gold phasor of length $R$. Right: their heights against the angle — $a\sin x$ (orange dashed), $b\cos x$ (blue dashed) and the sum (gold). Turn the angle $x$.`,
    tasks: [
      t`As $x$ grows the whole triangle turns rigidly, so the gold tip moves on a circle of radius $R$: the sum is a pure sinusoid of amplitude $R$.`,
      t`Set $a = 3$, $b = 4$: $R = 5$ and $\varphi = 53.1^\circ$. The gold curve peaks before the orange one, by $\varphi$.`,
      t`Make $a$ negative: the gold phasor points left, and $\varphi$ jumps past $90^\circ$ — where $\tan^{-1}(b/a)$ alone would have pointed the wrong way.`,
    ],
    params: phasorParams(3, 4, 0.6),
    caption: t`To scale: one unit of height is the same on both halves, so the gold tip’s height equals the gold curve’s height. The angle axis on the right is stretched by $1.8$ for room.`,
  },
  example: {
    prompt: t`Write $3\sin t + 4\cos t$ in the form $R\sin(t + \varphi)$.`,
    visual: { type: 'graph', params: phasorParams(3, 4, 0, { sliders: false, readouts: false }), caption: t`At $t = 0$: the phasor $(3, 4)$ drawn tip to tail, and the sum curve with its value $4$ at $t = 0$.` },
    steps: [
      { label: 'Match coefficients', text: t`$R\sin(t + \varphi) = R\cos\varphi\,\sin t + R\sin\varphi\,\cos t$, so $R\cos\varphi = 3$ and $R\sin\varphi = 4$.` },
      { label: 'Amplitude', text: t`Square and add: $R^2(\cos^2\varphi + \sin^2\varphi) = 9 + 16$, so $R = 5$.` },
      { label: 'Phase', text: t`$\cos\varphi = \tfrac35 > 0$ and $\sin\varphi = \tfrac45 > 0$: first quadrant, $\varphi = \tan^{-1}\tfrac43 = ${sig(Math.atan2(4, 3), 4)}$ rad $= ${sig(deg(Math.atan2(4, 3)), 4)}^\circ$.` },
      { label: 'Check', text: t`At $t = 0$: $3 \cdot 0 + 4 \cdot 1 = 4$ and $5\sin(0.9273) = ${sig(5 * Math.sin(Math.atan2(4, 3)), 4)}$ ✓.` },
    ],
    answer: t`$3\sin t + 4\cos t = 5\sin(t + ${sig(Math.atan2(4, 3), 4)})$, a phase of $${sig(deg(Math.atan2(4, 3)), 4)}^\circ$.`,
  },
  practice: [
    num({
      id: 'R-from-ab', difficulty: 1,
      gen(r) {
        const [a, b] = r.pick([[5, 12], [8, -6], [-7, 24], [2, 3], [-1, 4], [6, 6]]), ans = Math.hypot(a, b);
        return {
          prompt: t`What is the amplitude of $${a}\sin x ${b < 0 ? '-' : '+'} ${Math.abs(b)}\cos x$?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.abs(a) + Math.abs(b), feedback: t`Amplitudes do not simply add: the two waves peak at different times. They add like perpendicular arrows: $\sqrt{a^2 + b^2}$.` }, { value: a * a + b * b, feedback: t`That is $R^2$. Take the square root.` }, { value: Math.abs(a + b), feedback: t`Amplitudes add like perpendicular arrows, $\sqrt{a^2 + b^2}$, not as signed numbers.` }].filter((e, i, A) => Math.abs(e.value - ans) > 0.01 && A.findIndex((o) => o.value === e.value) === i),
          hints: [t`The sine and cosine parts are perpendicular phasors of lengths $|a|$ and $|b|$.`],
          teach: t`$R = \sqrt{a^2 + b^2}$: the length of the phasor $(a, b)$.`,
          explain: t`$R = \sqrt{${a * a} + ${b * b}} = ${sig(ans, 4)}$.`,
          visual: { type: 'graph', params: phasorParams((5 * a) / Math.hypot(a, b), (5 * b) / Math.hypot(a, b), 0, { sliders: false, readouts: false }), caption: t`The two phasors at $x = 0$ and the waves, all scaled to fit (the same scale on both halves).` },
        };
      },
    }),
    num({
      id: 'phi-quadrant', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[-1, 1], [-3, 4], [-5, -12], [-2, -2], [-4, 3], [3, -4]]), ans = deg(Math.atan2(b, a)), naive = deg(Math.atan(b / a));
        return {
          prompt: t`Write $${a}\sin x ${b < 0 ? '-' : '+'} ${Math.abs(b)}\cos x = R\sin(x + \varphi)$. Find $\varphi$ in degrees, between $-180^\circ$ and $180^\circ$.`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: naive, feedback: t`$\tan^{-1}(b/a)$ only returns angles between $-90^\circ$ and $90^\circ$, but with $a = ${a}$ the phasor points ${a < 0 ? 'left' : 'right'}. Add or subtract $180^\circ$ to land in the right quadrant.` }, { value: deg(Math.atan2(a, b)), feedback: t`$a$ and $b$ are swapped: $\cos\varphi = a/R$ and $\sin\varphi = b/R$.` }].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`$\cos\varphi = a/R$ and $\sin\varphi = b/R$: their signs tell you the quadrant.`, t`Here $\cos\varphi ${a < 0 ? '<' : '>'} 0$ and $\sin\varphi ${b < 0 ? '<' : '>'} 0$. Find the reference angle $\tan^{-1}|b/a|$ and place it.`],
          teach: t`The phase is the direction of the phasor $(a, b)$ — use its quadrant, not $\tan^{-1}(b/a)$ blindly.`,
          explain: t`$(a, b) = (${a}, ${b})$ is in quadrant ${a > 0 ? 'IV' : b > 0 ? 'II' : 'III'}; the reference angle is $${sig(deg(Math.atan(Math.abs(b / a))), 4)}^\circ$, so $\varphi = ${sig(ans, 4)}^\circ$ (and $R = ${sig(Math.hypot(a, b), 4)}$).`,
          visual: { type: 'graph', params: { x: [-1.5 * Math.max(Math.abs(a), Math.abs(b)), 1.5 * Math.max(Math.abs(a), Math.abs(b))], y: [-1.25 * Math.max(Math.abs(a), Math.abs(b)), 1.25 * Math.max(Math.abs(a), Math.abs(b))], equal: true, aspect: 'wide', xlabel: 'a (sin part)', ylabel: 'b (cos part)', xticks: 8, yticks: 5, arrows: [{ from: [0, 0], to: [a, 0], color: 'warn', width: 2.4 }, { from: [a, 0], to: [a, b], color: 'accent', width: 2.4 }, { from: [0, 0], to: [a, b], color: 'gold', width: 3, label: `(${a}, ${b})`, labelDx: 8, labelDy: -8 }] }, caption: t`The phasor $(a, b)$: the phase $\varphi$ is its direction, measured anticlockwise from the positive $a$-axis.` },
        };
      },
    }),
    expr({
      id: 'write-form', difficulty: 3,
      gen(r) {
        const C = r.pick([
          { q: t`\sin x + \sqrt3\cos x`, R: '2', phi: PI / 3, mod: 'pi/3' },
          { q: t`\sqrt3\sin x + \cos x`, R: '2', phi: PI / 6, mod: 'pi/6' },
          { q: t`\sin x + \cos x`, R: 'sqrt(2)', phi: PI / 4, mod: 'pi/4' },
          { q: t`\sin x - \cos x`, R: 'sqrt(2)', phi: -PI / 4, mod: '-pi/4' },
          { q: t`\sqrt3\sin x - \cos x`, R: '2', phi: -PI / 6, mod: '-pi/6' },
        ]);
        const ans = `${C.R}*sin(x + (${C.mod}))`, RT = C.R === '2' ? '2' : t`\sqrt2`;
        return {
          prompt: t`Write $${C.q}$ in the form $R\sin(x + \varphi)$, with exact $R$ and $\varphi$ (no cosines allowed).`,
          answer: ans, answerTeX: t`${RT}\sin\!\left(x ${C.phi < 0 ? '-' : '+'} ${piTeX(Math.abs(C.phi))}\right)`, vars: { x: [-3, 3] }, forbid: ['cos'],
          errors: [{ answer: `${C.R}*sin(x - (${C.mod}))`, feedback: t`The sign of $\varphi$ is reversed: $R\sin(x + \varphi)$ expands to $R\cos\varphi\sin x + R\sin\varphi\cos x$, so $\sin\varphi$ has the sign of the cosine coefficient.` }, { answer: `sin(x + (${C.mod}))`, feedback: t`The phase is right, but the amplitude is $R = \sqrt{a^2 + b^2}$, not $1$.` }],
          hints: [t`$R = \sqrt{a^2 + b^2}$.`, t`$\cos\varphi = a/R$ and $\sin\varphi = b/R$ are values you know exactly: which special angle?`],
          teach: t`Match $R\cos\varphi$ to the sine’s coefficient and $R\sin\varphi$ to the cosine’s.`,
          explain: t`$R = ${RT}$ and $\varphi = ${piTeX(C.phi)}$: $${C.q} = ${RT}\sin\!\left(x ${C.phi < 0 ? '-' : '+'} ${piTeX(Math.abs(C.phi))}\right)$.`,
          visual: trigGraph({ curves: [{ fn: `${C.R}*sin(x + (${C.mod}))`, color: 'gold' }], lo: -PI, hi: 2 * PI, y: [-2.4, 2.4], caption: t`The sum, plotted: read its amplitude and where it crosses zero going up.` }),
        };
      },
    }),
    num({
      id: 'first-peak', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [5, 12], [8, 6], [1, 2], [4, -3], [12, -5]]), phi = Math.atan2(b, a);
        let ans = PI / 2 - phi; while (ans < 0) ans += 2 * PI;
        return {
          prompt: t`At what time $t$, in seconds, does $y = ${a}\sin t ${b < 0 ? '-' : '+'} ${Math.abs(b)}\cos t$ first reach its maximum after $t = 0$? (Here $t$ is in seconds and the angles in radians.)`,
          answer: ans, units: 's', tol: { rel: 0.005 },
          errors: [{ value: phi, feedback: t`$\varphi$ is the phase, not the peak time. The peak is where $t + \varphi = \pi/2$.` }, { value: PI / 2 + phi, feedback: t`The peak is where $t + \varphi = \pi/2$, so $t = \pi/2 - \varphi$: subtract the phase.` }].filter((e) => e.value > 0 && Math.abs(e.value - ans) > 0.01),
          hints: [t`Write $y = R\sin(t + \varphi)$ with $\varphi = ${sig(phi, 4)}$ rad.`, t`A sine peaks when its angle is $\pi/2$ (plus multiples of $2\pi$).`],
          teach: t`$R\sin(t + \varphi)$ peaks at $t = \pi/2 - \varphi$ (plus whole periods).`,
          explain: t`$\varphi = ${sig(phi, 4)}$ rad, so the peak is at $t = \tfrac{\pi}{2} - ${sig(phi, 4)}${PI / 2 - phi < 0 ? ' + 2\\pi' : ''} = ${sig(ans, 4)}$ s, where $y = R = ${sig(Math.hypot(a, b), 4)}$.`,
          visual: trigGraph({ curves: [{ fn: `${a}*sin(x)`, color: 'warn', dash: true, width: 1.3 }, { fn: `${b}*cos(x)`, color: 'accent', dash: true, width: 1.3 }, { fn: `${a}*sin(x) + ${b}*cos(x)`, color: 'gold' }], lo: 0, hi: 2 * PI, y: [-1.25 * Math.hypot(a, b), 1.35 * Math.hypot(a, b)], xlabel: 't', caption: t`The two parts (dashed) and their sum (gold).` }),
        };
      },
    }),
    num({
      id: 'cos-form', difficulty: 3,
      gen(r) {
        const [a, b] = r.pick([[3, 4], [5, 12], [1, 1], [8, 15]]), ans = deg(Math.atan2(a, b));
        return {
          prompt: t`Physics texts often prefer cosines. Write $${a === 1 ? '' : a}\sin x + ${b === 1 ? '' : b}\cos x = R\cos(x - \delta)$ and find $\delta$ in degrees.`,
          answer: ans, units: 'deg', tol: { rel: 0, abs: 0.3 },
          errors: [{ value: deg(Math.atan2(b, a)), feedback: t`That is the phase for the **sine** form. Expand $R\cos(x - \delta) = R\cos\delta\cos x + R\sin\delta\sin x$: now $\tan\delta = a/b$.` }, { value: -ans, feedback: t`$\cos(x - \delta)$ with $\delta > 0$ is the cosine delayed: check the sign by expanding.` }].filter((e) => Math.abs(e.value - ans) > 0.5),
          hints: [t`Expand $R\cos(x - \delta) = R\cos\delta\cos x + R\sin\delta\sin x$.`, t`So $R\cos\delta = ${b}$ (the cosine coefficient) and $R\sin\delta = ${a}$.`],
          teach: t`In the cosine form the roles swap: $\tan\delta = a/b$, with $\cos\delta$ matching the coefficient of $\cos x$.`,
          explain: t`$R\cos\delta = ${b}$, $R\sin\delta = ${a}$: $\delta = \tan^{-1}(${a}/${b}) = ${sig(ans, 4)}^\circ$. The sine-form phase is $90^\circ - \delta = ${sig(90 - ans, 4)}^\circ$, the same wave described from the other reference.`,
          visual: trigGraph({ curves: [{ fn: `${a}*sin(x) + ${b}*cos(x)`, color: 'gold' }, { fn: `${N(Math.hypot(a, b))}*cos(x)`, color: 'ink3', dash: true, width: 1.3 }], lo: -PI / 2, hi: 2 * PI, y: [-1.3 * Math.hypot(a, b), 1.3 * Math.hypot(a, b)], caption: t`The sum (gold) and $R\cos x$ (dashed): the sum is the cosine delayed by $\delta$.` }),
        };
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-form', difficulty: 2,
      prompt: t`Which is equal to $\sin x - \sqrt3\cos x$ for every $x$?`,
      visual: trigGraph({ curves: [{ fn: 'sin(x) - sqrt(3)*cos(x)', color: 'gold' }], lo: -PI, hi: 2 * PI, y: [-2.4, 2.4], caption: t`The sum, plotted over one and a half periods.` }),
      choices: [t`$2\sin\!\left(x - \tfrac{\pi}{3}\right)$`, t`$2\sin\!\left(x + \tfrac{\pi}{3}\right)$`, t`$\sin\!\left(x - \tfrac{\pi}{3}\right)$`, t`$2\sin\!\left(x - \tfrac{\pi}{6}\right)$`],
      answer: 0,
      why: {
        1: t`The cosine coefficient is negative, so $\sin\varphi < 0$: the phase is $-\pi/3$. Check $x = 0$: the sum is $-\sqrt3$, but $2\sin\tfrac{\pi}{3} = +\sqrt3$.`,
        2: t`The amplitude is $\sqrt{1 + 3} = 2$, not $1$: the graph reaches $\pm2$.`,
        3: t`$\tan^{-1}\sqrt3 = \pi/3$, not $\pi/6$: $\cos\varphi = \tfrac12$, $\sin\varphi = -\tfrac{\sqrt3}{2}$.`,
      },
      hints: [t`$R = \sqrt{1^2 + (\sqrt3)^2}$; then $\cos\varphi = 1/R$ and $\sin\varphi = -\sqrt3/R$.`],
      teach: t`$a\sin x + b\cos x = R\sin(x + \varphi)$ with $R\cos\varphi = a$, $R\sin\varphi = b$ — signs included.`,
      explain: t`$R = 2$, $\cos\varphi = \tfrac12$, $\sin\varphi = -\tfrac{\sqrt3}{2}$: $\varphi = -\tfrac{\pi}{3}$. Check at $x = 0$: $2\sin(-\tfrac{\pi}{3}) = -\sqrt3$ ✓.`,
    }),
    num({
      id: 'cp-ac', difficulty: 3, transfer: true,
      gen(r) {
        const A1 = r.pick([120, 170, 230]), A2 = r.pick([80, 100, 150]), d = r.pick([60, 90, 120]), del = d * D2R, cD = +Math.cos(del).toFixed(12), sD = +Math.sin(del).toFixed(12);
        const a = A1 + A2 * cD, b = A2 * sD, ans = Math.hypot(a, b);
        return {
          prompt: t`Two AC sources of the same frequency are connected in series: $v_1 = ${A1}\sin\omega t$ and $v_2 = ${A2}\sin(\omega t + ${d}^\circ)$, in volts. What is the amplitude of the total voltage $v_1 + v_2$?`,
          answer: ans, units: 'V', tol: { rel: 0.005 },
          errors: [{ value: A1 + A2, feedback: t`Amplitudes add directly only when the sources are in phase. Expand $v_2$ into sine and cosine parts and add those.` }, { value: Math.hypot(A1, A2), feedback: t`$\sqrt{A_1^2 + A_2^2}$ is right only for a $90^\circ$ phase difference. Here it is $${d}^\circ$.` }].filter((e) => Math.abs(e.value - ans) > 0.005 * ans),
          hints: [t`Expand $v_2 = ${A2}\cos ${d}^\circ\,\sin\omega t + ${A2}\sin ${d}^\circ\,\cos\omega t$.`, t`So $a = ${A1} + ${A2}\cos ${d}^\circ$ and $b = ${A2}\sin ${d}^\circ$; then $R = \sqrt{a^2 + b^2}$.`],
          teach: t`Same-frequency signals add as phasors: split each into sine and cosine parts, add the parts, then $R = \sqrt{a^2 + b^2}$.`,
          explain: t`$a = ${A1} + ${A2}(${sig(cD, 3)}) = ${sig(a, 4)}$, $b = ${A2}(${sig(sD, 4)}) = ${sig(b, 4)}$, so $R = ${sig(ans, 4)}$ V. Equivalently, by the law of cosines on the phasor triangle: $R^2 = ${A1}^2 + ${A2}^2 + 2(${A1})(${A2})\cos ${d}^\circ$.`,
          visual: { type: 'graph', params: { x: [-60, 380], y: [-40, 200], equal: true, aspect: 'wide', xlabel: 'sin ωt part (V)', ylabel: 'cos ωt part (V)', xticks: 8, yticks: 4, arrows: [{ from: [0, 0], to: [A1, 0], color: 'warn', width: 2.6, label: 'v₁', labelDx: -10, labelDy: 14 }, { from: [A1, 0], to: [N(a), N(b)], color: 'accent', width: 2.6, label: 'v₂', labelDx: 8, labelDy: -6 }, { from: [0, 0], to: [N(a), N(b)], color: 'gold', width: 1.6, dash: true }], points: [{ x: N(A1 + 25), y: 7, r: 0, label: `${d}°`, color: 'accent', labelDx: 0, labelDy: 0 }] }, caption: t`The two phasors tip to tail, to scale; the dashed gold arrow is the total, whose length you are finding.` },
        };
      },
    }),
    num({
      id: 'cp-osc', difficulty: 2,
      gen(r) {
        const [c1, c2] = r.pick([[3, 4], [6, 8], [5, 12], [9, 12]]), ans = Math.hypot(c1, c2);
        return {
          prompt: t`A star tracker on a vibration-isolation mount moves as $x(t) = ${c1}\cos\omega t + ${c2}\sin\omega t$, in micrometres. How far from the centre does it swing?`,
          answer: ans, units: 'μm', tol: { rel: 0.005 },
          errors: [{ value: c1 + c2, feedback: t`The two parts peak a quarter period apart, so their peaks never coincide: combine them as $\sqrt{C_1^2 + C_2^2}$.` }, { value: Math.max(c1, c2), feedback: t`The larger part alone underestimates the swing: the parts add as perpendicular phasors.` }],
          hints: [t`Write $x = R\sin(\omega t + \varphi)$ (or $R\cos(\omega t - \delta)$); the swing is $R$.`],
          teach: t`$C_1\cos\omega t + C_2\sin\omega t$ has amplitude $\sqrt{C_1^2 + C_2^2}$, whichever form you write it in.`,
          explain: t`$R = \sqrt{${c1}^2 + ${c2}^2} = ${sig(ans, 4)}\ \mu\text{m}$.`,
          visual: trigGraph({ curves: [{ fn: `${c1}*cos(x)`, color: 'accent', dash: true, width: 1.3 }, { fn: `${c2}*sin(x)`, color: 'warn', dash: true, width: 1.3 }, { fn: `${c1}*cos(x) + ${c2}*sin(x)`, color: 'gold' }], lo: 0, hi: 2 * PI, y: [-1.25 * ans, 1.35 * ans], xlabel: 'ωt', ylabel: 'x (μm)', caption: t`The two parts (dashed) and the motion (gold) over one period; vertical scale in micrometres.` }),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Precalculus 2e, §7.2 Sum and Difference Identities', url: 'https://openstax.org/books/precalculus-2e/pages/7-2-sum-and-difference-identities' },
    { label: 'OpenStax University Physics Vol. 2, §15.2 Simple AC Circuits (phasors)', url: 'https://openstax.org/books/university-physics-volume-2/pages/15-2-simple-ac-circuits' },
  ],
});
