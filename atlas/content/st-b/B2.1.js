// The transport equation u_t + c u_x = 0: an observer moving at c sees no
// change, so u is constant along the characteristic lines x − ct = const and
// u = f(x − ct). Spatial profiles become time series at a sensor; data can
// also enter through an inflow boundary.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { player, xtPlane, SRC } from './_pde.js';

const t = String.raw;

// worked example: a spill reaching a water intake 5 km downstream
const SP = { C0: 12, L: 150, c: 0.8, X: 5000 };
SP.tpeak = SP.X / SP.c;
SP.tauw = SP.L / SP.c;                                   // time width
SP.half = (2 * SP.L * Math.sqrt(Math.log(2))) / SP.c;    // time above half maximum

const profile = (fn, x, y, caption, extra = {}) => ({ type: 'graph', params: { x, y, aspect: 'wide', xlabel: 'x (m)', ylabel: 'u', curves: [{ fn, color: 'accent', width: 2.4 }], ...extra }, caption });

export default lesson({
  id: 'st-b.B2.1',
  title: 'The transport equation',
  minutes: 11, difficulty: 2,
  intro: t`The simplest PDE with a time in it says that a profile is **carried along at a fixed speed $c$** without changing shape: a slug of pollutant in a river, a platoon of cars on a highway, a warm slug of propellant flowing down a feed line. Read with lesson B1.1’s eyes, it says an observer moving at speed $c$ sees **no change at all**, $\frac{d}{dt}u(x_0 + ct, t) = u_t + c\,u_x = 0$. So $u$ is constant along every line $x - ct = \text{const}$ — the **characteristics** — and whatever value sits at $x_0$ at $t = 0$ is found at $x_0 + ct$ at time $t$:

$$u(x, t) = f(x - ct)$$

where $f(x) = u(x, 0)$ is the initial profile. One initial condition fixes everything; no information ever moves at any speed but $c$.`,
  equation: t`u_t + c\,u_x = 0`,
  symbols: [
    { tex: 'u(x, t)', text: 'the carried quantity: a concentration, a temperature, a density of cars' },
    { tex: 'c', text: 'the carrying speed (m/s); $c > 0$ moves the profile toward $+x$, $c < 0$ toward $-x$' },
    { tex: 'f(x)', text: 'the initial profile $u(x, 0)$, which the solution simply slides along' },
    { tex: 'x - ct', text: 'the label of the characteristic through $(x, t)$: where it started at $t = 0$, also called its **foot**' },
  ],
  why: t`Characteristics are the paths along which information travels; for the wave equation they are $x \pm ct$, and in relativity they are light rays — which is why causality is a statement about characteristics.`,
  visual: {
    type: 'pde-player',
    title: 'Sliding along the characteristics',
    lead: t`Below, each grey line is a characteristic $x - ct = \text{const}$; the shading shows $u$ carried along them. The gold probe asks for $u$ at one point $(x, t)$: follow its characteristic back to $t = 0$ and read $f$ there. Drag the probe, and change $c$.`,
    tasks: [
      'Set c negative: the lines lean the other way and the bump runs toward −x.',
      'Make c small: the characteristics stand nearly upright — the profile barely moves.',
      'Drag the probe anywhere on the shaded band: its foot lands inside the initial bump.',
    ],
    params: { mode: 'transport', profile: 'gauss', c: 1.5, x: [-10, 10], x0: -4, w: 1, tmax: 6, probe: [3, 4], controls: ['profile', 'c', 't'] },
    caption: t`Exact solution $u = f(x - ct)$ on an infinite line; nothing reflects from the edges of the window. The grey lines are characteristics, about 0.9 m apart at $t = 0$.`,
  },
  example: {
    prompt: t`A spill puts a slug of contaminant into a river: $f(x) = ${SP.C0}\,e^{-(x/${SP.L})^2}$ mg/L, with $x$ in metres from the spill. The river carries it at $c = ${SP.c}$ m/s, and a drinking-water intake sits ${SP.X / 1000} km downstream. When does the peak arrive, and for how long is the intake above half the peak concentration?`,
    visual: { type: 'graph', params: { x: [0, 3], y: [-0.4, 13], aspect: 'wide', xlabel: 't (hours)', ylabel: 'C at the intake (mg/L)', curves: [{ fn: `${SP.C0}*e^(-((x*3600 - ${SP.tpeak})/${SP.tauw})^2)`, color: 'accent', width: 2.4 }], hlines: [{ y: SP.C0 / 2, label: 'half the peak', color: 'ink3' }] },
      caption: t`The concentration recorded at the intake: the spatial slug, turned into a time series. Mixing across and along the river is left out; it would lower and widen this pulse.` },
    steps: [
      { label: 'Characteristics', text: t`Along $dx/dt = c$, $\frac{du}{dt} = u_t + c\,u_x = 0$: $u$ is constant on each line $x - ct = \text{const}$.` },
      { label: 'Solution', text: t`So $u(x, t) = f(x - ct) = ${SP.C0}\,e^{-((x - ${SP.c}t)/${SP.L})^2}$. Check: $u_t = -${SP.c}f'$ and $u_x = f'$, so $u_t + ${SP.c}u_x = 0$. ✓` },
      { label: 'Peak arrival', text: t`The peak rides the characteristic $x = ${SP.c}t$, reaching $x = ${SP.X}$ m at $t = ${SP.X}/${SP.c} = ${SP.tpeak}$ s $\approx ${tex(SP.tpeak / 3600)}$ h.` },
      { label: 'At the intake', text: t`Set $x = ${SP.X}$: $u = ${SP.C0}\,e^{-((${SP.X} - ${SP.c}t)/${SP.L})^2} = ${SP.C0}\,e^{-((t - ${SP.tpeak})/${SP.tauw})^2}$. A width of ${SP.L} m in space passes in ${SP.L}/${SP.c} = ${SP.tauw} s: **lengths become durations, divided by $c$**.` },
      { label: 'Above half', text: t`$u > ${SP.C0 / 2}$ where $|t - ${SP.tpeak}| < ${SP.tauw}\sqrt{\ln 2}$: a duration of $2(${SP.tauw})(0.8326) \approx ${Math.round(SP.half)}$ s, about ${Math.round(SP.half / 60)} minutes.` },
      { label: 'Honesty', text: t`Real rivers shear and mix the slug as it travels, so it arrives lower and longer: transport alone is the leading-order model, and adding $D\,u_{xx}$ (advection–diffusion) is the usual next step.` },
    ],
    answer: t`The peak arrives after ${SP.tpeak} s ($\approx ${tex(SP.tpeak / 3600)}$ h); the intake is above ${SP.C0 / 2} mg/L for about ${Math.round(SP.half)} s.`,
  },
  practice: [
    num({
      id: 'where-peak', difficulty: 1,
      gen(r) {
        const c = r.pick([-2, -1.5, 1.5, 2, 3]), x0 = r.pick([-2, 1, 2]), T = r.pick([2, 3, 4]);
        const X = x0 + c * T;
        return {
          prompt: t`A profile obeys $u_t ${c < 0 ? '-' : '+'} ${Math.abs(c)}\,u_x = 0$ (with $x$ in m and $t$ in s). Its peak is at $x = ${x0}$ m at $t = 0$. Where is the peak at $t = ${T}$ s?`,
          visual: profile(`e^(-(x - ${x0})^2)`, [-12, 14], [-0.1, 1.2], t`The initial profile, peaked at $x = ${x0}$ m.`, { xticks: 13 }),
          answer: X, units: 'm', tol: { rel: 0, abs: 0.05 },
          errors: [{ value: x0 - c * T, feedback: t`In $u_t + c\,u_x = 0$ the speed is $c$ itself: here $c = ${c}$, so the peak moves ${c > 0 ? 'toward +x' : 'toward −x'}.` }, { value: c * T, feedback: t`Add the distance travelled to where the peak started, $x = ${x0}$.` }],
          hints: [t`The solution is $u = f(x - ct)$ with $c = ${c}$.`, t`The peak sits where $x - ct = ${x0}$.`],
          teach: t`A feature at $x_0$ moves to $x_0 + ct$.`,
          explain: t`$x = x_0 + ct = ${x0} + (${c})(${T}) = ${X}$ m.`,
        };
      },
    }),
    mcq({
      id: 'which-solves', difficulty: 2,
      prompt: t`Which of these solves $u_t - 2u_x = 0$ for any differentiable $f$?`,
      visual: player({ mode: 'transport', profile: 'gauss', c: -2, x0: 4, w: 1, t: 2, tmax: 4, x: [-8, 8] }, t`A solution of $u_t - 2u_x = 0$ at $t = 2$ s (solid) and $t = 0$ (dashed), with its characteristics below.`),
      choices: [t`$f(x + 2t)$`, t`$f(x - 2t)$`, t`$f(2x - t)$`, t`$e^{-2t}f(x)$`],
      answer: 0,
      why: {
        1: t`For $f(x - 2t)$: $u_t - 2u_x = -2f' - 2f' = -4f' \ne 0$. That solves $u_t + 2u_x = 0$.`,
        2: t`$u_t = -f'$, $u_x = 2f'$: $u_t - 2u_x = -5f'$. The argument must be $x - ct$ with $c = -2$.`,
        3: t`This decays in place without moving; it solves $u_t = -2u$, not a transport equation.`,
      },
      hints: [t`Write $u_t - 2u_x = 0$ as $u_t + c\,u_x = 0$. What is $c$?`, t`With $c = -2$, the solution is $f(x - ct) = f(x + 2t)$.`],
      teach: t`$u_t + c\,u_x = 0$ is solved by $f(x - ct)$; read $c$ with its sign.`,
      explain: t`$c = -2$, so $u = f(x - (-2)t) = f(x + 2t)$, moving toward $-x$. Check: $u_t = 2f'$, $u_x = f'$, $u_t - 2u_x = 0$. ✓`,
    }),
    num({
      id: 'read-slope', difficulty: 2,
      gen(r) {
        const c = r.pick([0.5, 1.25, 2, 2.5, 4]);
        const m = 1 / c;
        return {
          prompt: t`The lines are the characteristics of a transport equation $u_t + c\,u_x = 0$, drawn in the $x$–$t$ plane ($x$ in m across, $t$ in s up). What is $c$, in m/s?`,
          visual: xtPlane({ x: [0, 10], y: [0, 4], xticks: 10, yticks: 4, curves: [-16, -12, -8, -4, 0, 2, 4, 6, 8].map((k) => ({ fn: `(x - ${k})/${c}`, color: 'accent', width: 1.4 })) }, 'Characteristics of one transport equation. Read the slope off the grid.'),
          answer: c, units: 'm/s', tol: { rel: 0.03 },
          errors: [{ value: m, feedback: t`That is the slope $\Delta t/\Delta x$ on the picture, which is $1/c$: time is the vertical axis.` }],
          hints: ['Pick one line and read two points on it from the grid.', t`Along a characteristic $x - ct$ is constant, so $c = \Delta x/\Delta t$.`],
          teach: t`In the $x$–$t$ plane a characteristic of slope $\Delta t/\Delta x$ has speed $c = \Delta x/\Delta t$: steep lines are slow.`,
          explain: t`Each line climbs ${tex(m)} s per metre, so $c = \Delta x/\Delta t = ${c}$ m/s. In 4 s a line moves ${4 * c} m across.`,
        };
      },
    }),
    {
      type: 'point', id: 'foot', difficulty: 2,
      gen(r) {
        const c = r.pick([1, 1.5, 2]), T = r.pick([2, 2.5, 3]), x0 = r.pick([1, 2, 3]);
        const X = x0 + c * T;
        return {
          prompt: t`For $u_t + ${c}\,u_x = 0$, the value at the point $(x, t) = (${X}, ${T})$ equals the initial profile $f$ at one place on the line $t = 0$. Drag the point there.`,
          instruction: 'Drag the point to where the characteristic through the marked point started, then check.',
          answer: { x: x0, y: 0 }, tol: { x: 0.2, y: 0.12 },
          visual: xtPlane({ x: [-1, 11], y: [0, 4], xticks: 12, yticks: 4, points: [{ x: X, y: T, label: 'the point', color: 'gold' }], drag: [{ key: 'p', x: 5, y: 1.5, snap: 0.1 }] }, t`The $x$–$t$ plane ($x$ in m, $t$ in s). The gold point is $(${X}, ${T})$.`),
          hints: [t`Along the characteristic, $x - ${c}t$ stays the same.`, t`At the point, $x - ${c}t = ${X} - ${c * T}$. At $t = 0$ that is just $x$.`],
          teach: t`$u(x, t) = f(x - ct)$: trace back along the characteristic to its foot at $x - ct$.`,
          explain: t`The foot is at $x - ct = ${X} - ${c}(${T}) = ${x0}$, so $u(${X}, ${T}) = f(${x0})$.`,
        };
      },
    },
    num({
      id: 'platoon', difficulty: 2,
      gen(r) {
        const Lm = r.pick([300, 450, 600, 900]), v = r.pick([20, 25, 30]);
        const dur = Lm / v;
        return {
          prompt: t`A platoon of cars ${Lm} m long travels at a steady ${v} m/s, so its density obeys $\rho_t + ${v}\rho_x = 0$. For how many seconds does a roadside counter see the platoon passing?`,
          visual: profile(`(step(x) - step(x - ${Lm}))*30`, [-200, Lm + 300], [-2, 40], t`The density of cars (per km) along the road at $t = 0$: a block ${Lm} m long. (A real platoon has ragged ends.)`, { xlabel: 'x (m)', ylabel: 'ρ (cars/km)' }),
          answer: dur, units: 's', tol: { rel: 0.01 },
          errors: [{ value: Lm * v, feedback: 'Divide the length by the speed: a longer platoon takes longer to pass, a faster one less.' }],
          hints: [t`At the counter, $\rho(x_c, t) = f(x_c - ${v}t)$: the profile passes by at ${v} m/s.`, 'Time to pass = length ÷ speed.'],
          teach: t`At a fixed sensor a carried profile becomes a time series: a length $\ell$ passes in $\ell/c$.`,
          explain: t`The whole block slides past at ${v} m/s, so it takes ${Lm}/${v} = ${tex(dur)} s.`,
        };
      },
    }),
    mcq({
      id: 'error-speed', difficulty: 3, kind: 'error',
      prompt: t`A student solves $u_t + 3u_x = 0$ with $u(x, 0) = \sin x$ and writes: “The characteristics have slope $\tfrac13$ in the $x$–$t$ plane, so the wave moves at $\tfrac13$ m/s: $u = \sin(x - t/3)$.” What went wrong?`,
      visual: xtPlane({ x: [0, 6], y: [0, 2], xticks: 6, curves: [-6, -4.5, -3, -1.5, 0, 1.5, 3, 4.5].map((k) => ({ fn: `(x - ${k})/3`, color: 'accent', width: 1.4 })) }, t`Characteristics of $u_t + 3u_x = 0$ in the $x$–$t$ plane, $t$ upward.`),
      choices: [t`The slope on the picture is $\Delta t/\Delta x = 1/c$; the speed is $c = 3$, so $u = \sin(x - 3t)$`, t`Nothing: the speed is the slope of the characteristics`, t`The sign: it should be $\sin(x + t/3)$`, t`A sine initial profile cannot be transported; it must decay`],
      answer: 0,
      why: {
        1: t`Check by substitution: for $\sin(x - t/3)$, $u_t + 3u_x = -\tfrac13\cos + 3\cos \ne 0$.`,
        2: t`The sign is right (toward $+x$); the size is not.`,
        3: 'Any differentiable profile is carried unchanged — sines included.',
      },
      hints: [t`Substitute their answer into $u_t + 3u_x$.`, t`With time on the vertical axis, a line of speed $c$ climbs $1/c$ seconds per metre.`],
      teach: t`Slopes in the $x$–$t$ plane are $1/c$: steep characteristics are slow ones.`,
      explain: t`$u = f(x - ct)$ with $c = 3$: $u = \sin(x - 3t)$. The picture’s slope $\tfrac13$ s/m is the reciprocal of the speed.`,
    }),
    expr({
      id: 'solve-ivp', difficulty: 2,
      gen(r) {
        const c = r.pick([2, 3, 4, 5]), a = r.pick([1, 2, 4]);
        return {
          prompt: t`Solve $u_t + ${c}\,u_x = 0$ with $u(x, 0) = \dfrac{1}{${a === 1 ? '' : a} + x^2}$.`,
          visual: profile(`1/(${a} + x^2)`, [-6, 6], [-0.05, 1.1 / a], t`The initial profile $1/(${a} + x^2)$.`),
          answer: `1/(${a} + (x - ${c}t)^2)`, answerTeX: t`\frac{1}{${a} + (x - ${c}t)^2}`, lhs: 'u(x, t)',
          vars: { x: [-3, 3], t: [0, 2] },
          errors: [{ answer: `1/(${a} + (x + ${c}t)^2)`, feedback: t`That moves toward $-x$. For $u_t + ${c}u_x = 0$ the argument is $x - ${c}t$.` }, { answer: `1/(${a} + x^2 - ${c}t)`, feedback: t`Replace $x$ by $x - ${c}t$ **inside** the square: the whole profile shifts.` }],
          hints: [t`The solution is $f(x - ${c}t)$ with $f(x) = 1/(${a} + x^2)$.`, t`Replace every $x$ in $f$ by $(x - ${c}t)$.`],
          teach: t`To solve the transport problem, replace $x$ by $x - ct$ in the initial profile.`,
          explain: t`$u = f(x - ${c}t) = \dfrac{1}{${a} + (x - ${c}t)^2}$. Check: $u_t = ${c}\cdot\dfrac{2(x - ${c}t)}{(\cdots)^2}$ and $u_x = -\dfrac{2(x - ${c}t)}{(\cdots)^2}$, so $u_t + ${c}u_x = 0$. ✓`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-coolant', difficulty: 2, transfer: true,
      gen(r) {
        const v = r.pick([12, 15, 20, 25]), ms = r.pick([20, 30, 40, 50]);
        const len = (v * ms) / 1000;
        return {
          prompt: t`Coolant flows through a regeneratively cooled nozzle’s channels at ${v} m/s. A valve transient sends a warm slug into the channel inlet that lasts ${ms} ms. Treating the coolant temperature as carried by the flow ($T_t + ${v}T_x = 0$), how long, in metres, is the warm slug inside the channel?`,
          visual: xtPlane({ x: [0, 1.5], y: [0, 0.12], xticks: 6, yticks: 4, xlabel: 'x along the channel (m)', ylabel: 't (s)',
            shade: [{ fn: 'x/10 + 0.03', lower: 'x/10', from: 0, to: 1.5, color: 'warn', alpha: 0.3 }],
            curves: [0, 0.02, 0.04, 0.06, 0.08, 0.1].map((k) => ({ fn: `x/10 + ${k}`, color: 'ink3', width: 1 })) },
            t`How inflow data travel, with illustrative numbers (10 m/s, a 30 ms slug): characteristics enter through the inlet $x = 0$ and carry the warm interval (shaded) down the channel. Heat exchange with the walls, which would smear the slug, is ignored.`),
          answer: len, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: ms / 1000 / v, feedback: 'Length = speed × duration, not duration ÷ speed.' }, { value: v * ms, feedback: 'Convert milliseconds to seconds.' }],
          hints: [t`At the inlet the data are given in time, $T(0, t) = g(t)$; inside, $T(x, t) = g(t - x/${v})$.`, 'A duration τ at the inlet occupies a length cτ in the channel.'],
          teach: 'Inflow data in time become a profile in space: length = c × duration.',
          explain: t`$T(x, t) = g(t - x/${v})$, so a ${ms} ms pulse occupies $${v} \times ${ms / 1000} = ${tex(len)}$ m of channel.`,
        };
      },
    }),
    expr({
      id: 'cp-solve', difficulty: 2,
      gen(r) {
        const c = r.pick([2, 3, 6]), k = r.pick([2, 3]);
        return {
          prompt: t`Solve $u_t - ${c}\,u_x = 0$ with $u(x, 0) = e^{-${k}x^2}$.`,
          visual: profile(`e^(-${k}*x^2)`, [-3, 3], [-0.05, 1.15], t`The initial profile $e^{-${k}x^2}$.`),
          answer: `e^(-${k}(x + ${c}t)^2)`, answerTeX: t`e^{-${k}(x + ${c}t)^2}`, lhs: 'u(x, t)',
          vars: { x: [-1, 1], t: [0, 0.3] },
          errors: [{ answer: `e^(-${k}(x - ${c}t)^2)`, feedback: t`Here $c = -${c}$: the profile moves toward $-x$, so the argument is $x + ${c}t$.` }],
          hints: [t`$u_t + c\,u_x = 0$ with $c = -${c}$.`],
          teach: t`$f(x - ct)$, with $c$ read with its sign.`,
          explain: t`$c = -${c}$, so $u = f(x + ${c}t) = e^{-${k}(x + ${c}t)^2}$, moving toward $-x$.`,
        };
      },
    }),
    mcq({
      id: 'cp-depends', difficulty: 2,
      prompt: t`For $u_t + 2u_x = 0$, on which initial data does $u(10, 4)$ depend?`,
      visual: xtPlane({ x: [-2, 12], y: [0, 5], xticks: 7, yticks: 5, points: [{ x: 10, y: 4, label: '(10, 4)', color: 'gold' }] }, t`The $x$–$t$ plane ($x$ in m, $t$ in s) with the point in question.`),
      choices: [t`only on $f(2)$, the value at $x = 2$`, t`on $f$ over the whole interval $2 \le x \le 10$`, t`on $f(10)$`, t`on $f$ everywhere on the line`],
      answer: 0,
      why: {
        1: t`That would be true of a wave equation’s cone, not of transport: here information travels along a single line.`,
        2: t`$f(10)$ has been carried to $x = 18$ by $t = 4$.`,
        3: 'Only the heat equation mixes in data from everywhere; transport carries each value along one characteristic.',
      },
      hints: [t`Follow the characteristic $x - 2t = \text{const}$ back from $(10, 4)$.`],
      teach: 'For transport, each point depends on exactly one point of the initial data: the foot of its characteristic.',
      explain: t`$x - 2t = 10 - 8 = 2$: $u(10, 4) = f(2)$. Change $f$ anywhere else and $u(10, 4)$ does not notice.`,
    }),
  ],
  sources: [SRC.strauss, SRC.evans],
});
