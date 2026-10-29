// Rates of change in space and time: u_t and u_x as slopes of the two slices
// of the surface u(x, t), and the rate seen by a moving observer,
// du/dt = u_t + ẋ u_x — the chain rule that every characteristic rides on.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { xtPlane, SRC } from './_pde.js';

const t = String.raw;

// the worked example: a decaying slug carried down a river, C = C0 e^(−λt) e^(−((x − ct)/L)²)
const RV = { C0: 50, c: 0.5, L: 200, lam: 1e-4, x: 1300, tt: 2000, vb: -2 };
{
  const s = (RV.x - RV.c * RV.tt) / RV.L;
  RV.s = s;
  RV.C = RV.C0 * Math.exp(-RV.lam * RV.tt - s * s);
  RV.Cx = (-2 * s / RV.L) * RV.C;
  RV.Ct = (-RV.lam + (2 * s * RV.c) / RV.L) * RV.C;
  RV.raft = RV.Ct + RV.c * RV.Cx;
  RV.boat = RV.Ct + RV.vb * RV.Cx;
}

// the Explore surface: a decaying pulse carried at 1 m/s; the vertical axis is u, the "y" axis is time
const U = 'e^(-0.25*y - (x - y)^2)';
const Uat = (X, T) => `e^(-0.25*(${T}) - ((${X}) - (${T}))^2)`;

export default lesson({
  id: 'st-b.B1.1',
  title: 'Rates of change in space and time',
  minutes: 10, difficulty: 2,
  intro: t`A field $u(x, t)$ is a surface over the $x$–$t$ plane, and it has two basic slopes. **$u_x$** is the slope of the slice at a fixed time (a snapshot); **$u_t$** is the slope of the slice at a fixed place (what a sensor bolted down there records). You met these as partial derivatives in MATH 2210 (lesson C3-3.2); here they become the language of every PDE.

An observer who moves, along $x(t)$, records something else: by the chain rule,

$$\frac{d}{dt}\,u\big(x(t), t\big) = u_t + \dot x\,u_x$$

The change you see is the change at a fixed place, plus the change you cause by moving through a slope. **A moving thermometer and a fixed one disagree**, and both are right.`,
  symbols: [
    { tex: t`u_t = \frac{\partial u}{\partial t}`, text: 'rate of change at a fixed place, $x$ held constant (units of $u$ per second)' },
    { tex: t`u_x = \frac{\partial u}{\partial x}`, text: 'slope of a snapshot, $t$ held constant (units of $u$ per metre)' },
    { tex: t`x(t)`, text: 'the path of a moving observer or sensor (m)' },
    { tex: t`\dot x = \frac{dx}{dt}`, text: 'the observer’s velocity along $x$ (m/s), positive toward $+x$' },
    { tex: t`\frac{d}{dt}u\big(x(t), t\big)`, text: 'the rate of change the moving observer records: the **total** (or material) derivative along the path' },
  ],
  why: t`Choose a path with $\dot x = c$ and the transport equation $u_t + c\,u_x = 0$ says the observer sees no change at all: that is the method of characteristics (B2), and light rays play this role for the wave equation (B3) and in relativity.`,
  visual: {
    type: 'surface3d',
    title: 'Two slices and a path',
    lead: t`The surface is $u(x, t)$ for a slug of dye carried along at 1 m/s and slowly fading (time runs along the second axis). Through the chosen point: the gold slice holds $t$ fixed (its slope is $u_x$), the violet slice holds $x$ fixed (its slope is $u_t$), and the teal curve is an observer moving at speed $v$. Drag to turn the surface.`,
    tasks: [
      t`Put the point on the front of the slug (ahead of the ridge): the gold slice falls ($u_x < 0$) while the violet one rises ($u_t > 0$).`,
      t`Set $v = 1$ m/s: the teal path rides along the ridge, and the observer sees only the slow fade, $du/dt = -0.25\,u$.`,
      t`Set $v = 0$: the observer is a fixed sensor, and $du/dt = u_t$.`,
    ],
    params: {
      z: U, domain: [[-3, 5], [0, 4]], n: 48, zscale: 2, axisLabels: ['x', 't', 'u'], axisLen: 2.2,
      target: [1, 2, 0.6], yaw: -1.25, pitch: 0.6, dist: 12, scale: 1.5,
      sliders: [
        { key: 'px', label: 'Position $x$', min: -2, max: 4, step: 0.05, value: 1.6, unit: '\\mathrm{m}', explain: 'Where the point sits along the river.' },
        { key: 'pt', label: 'Time $t$', min: 0, max: 4, step: 0.05, value: 1, unit: '\\mathrm{s}', explain: 'The moment of the point.' },
        { key: 'v', label: 'Observer speed $v$', min: -1, max: 2, step: 0.05, value: 0.5, unit: '\\mathrm{m/s}', explain: 'How fast the teal observer moves along $x$. Zero: a fixed sensor.' },
      ],
      curves: [
        { param: ['t', 'pt', Uat('t', 'pt')], t: [-3, 5], color: 'gold', width: 3 },
        { param: ['px', 't', Uat('px', 't')], t: [0, 4], color: 'violet', width: 3 },
        { param: ['px + v*(t - pt)', 't', Uat('px + v*(t - pt)', 't')], t: ['max(0, pt - 1.5)', 'min(4, pt + 1.5)'], color: 'teal', width: 3 },
      ],
      readouts: [
        { label: t`$u$`, expr: Uat('px', 'pt'), digits: 3 },
        { label: t`$u_x$`, expr: `-2*(px - pt)*${Uat('px', 'pt')}`, digits: 3 },
        { label: t`$u_t$`, expr: `(-0.25 + 2*(px - pt))*${Uat('px', 'pt')}`, digits: 3 },
        { label: t`$du/dt$ along the path`, expr: `(-0.25 + 2*(1 - v)*(px - pt))*${Uat('px', 'pt')}`, digits: 3 },
      ],
    },
    caption: t`$u = e^{-0.25t - (x - t)^2}$: a profile carried at 1 m/s and fading at a rate $0.25\ \text{s}^{-1}$. The vertical scale is doubled for visibility. The readouts are exact derivatives.`,
  },
  example: {
    prompt: t`A spill makes a slug of dye in a river flowing at $c = ${RV.c}$ m/s. Its concentration is $C(x, t) = C_0\,e^{-\lambda t}\,e^{-((x - ct)/L)^2}$ with $C_0 = ${RV.C0}$ mg/L, $L = ${RV.L}$ m and decay rate $\lambda = 10^{-4}\ \text{s}^{-1}$. At $x = ${RV.x}$ m and $t = ${RV.tt}$ s, find $C_t$ and $C_x$, and the rate of change seen by a raft drifting with the water and by a boat motoring upstream at 2 m/s.`,
    visual: { type: 'graph', params: { x: [0, 2500], y: [-1, 50], aspect: 'wide', xlabel: 'x (m)', ylabel: 'C (mg/L)', xticks: 6,
      curves: [{ fn: `${RV.C0}*e^(-((x)/${RV.L})^2)`, color: 'ink3', dash: [5, 4], label: 't = 0', labelAt: 200, labelDx: 8 },
        { fn: `${RV.C0}*e^(-${RV.lam * RV.tt})*e^(-((x - ${RV.c * RV.tt})/${RV.L})^2)`, color: 'accent', label: 't = 2000 s', labelAt: 1150, labelDx: 10, labelDy: -6 }],
      points: [{ x: RV.x, y: RV.C, label: 'the point', color: 'gold' }] },
      caption: t`The slug at $t = 0$ (dashed) and at $t = ${RV.tt}$ s, carried ${RV.c * RV.tt} m downstream and slightly faded. The point is on its leading edge. Mixing, which would also spread it, is left out.` },
    steps: [
      { label: 'Value', text: t`With $s = (x - ct)/L = (${RV.x} - ${RV.c * RV.tt})/${RV.L} = ${RV.s}$: $C = ${RV.C0}\,e^{-0.2}\,e^{-${RV.s * RV.s}} = ${tex(RV.C)}$ mg/L.` },
      { label: 'Slope in space', text: t`Hold $t$: $C_x = -\dfrac{2s}{L}\,C = -\dfrac{2(${RV.s})}{${RV.L}}(${tex(RV.C)}) = ${tex(RV.Cx)}$ mg/L per metre. Negative: we are on the leading edge, where the concentration falls downstream.` },
      { label: 'Rate in time', text: t`Hold $x$: $C_t = \left(-\lambda + \dfrac{2sc}{L}\right)C = (${tex(-RV.lam)} + ${tex(2 * RV.s * RV.c / RV.L)})(${tex(RV.C)}) = ${tex(RV.Ct)}$ mg/L per second. A sensor fixed on the bank sees the slug arriving.` },
      { label: 'The raft', text: t`$\dot x = c$: $\dfrac{dC}{dt} = C_t + c\,C_x = ${tex(RV.Ct)} + ${RV.c}(${tex(RV.Cx)}) = ${tex(RV.raft)}$ mg/L per second — exactly $-\lambda C$. Riding with the water, you see only the decay: the motion is invisible.` },
      { label: 'The boat', text: t`$\dot x = ${RV.vb}$ m/s: $\dfrac{dC}{dt} = ${tex(RV.Ct)} + (${RV.vb})(${tex(RV.Cx)}) = ${tex(RV.boat)}$ mg/L per second — five times the bank’s rate, because the boat drives into the slug.` },
      { label: 'Sense check', text: t`Units: $C_x$ is mg/L per metre and $\dot x$ is metres per second, so $\dot x\,C_x$ is mg/L per second, like $C_t$. ✓` },
    ],
    answer: t`$C_t \approx ${tex(RV.Ct)}$ mg/(L·s), $C_x \approx ${tex(RV.Cx)}$ mg/(L·m); the raft sees $${tex(RV.raft)}$ mg/(L·s) (pure decay), the boat $${tex(RV.boat)}$ mg/(L·s).`,
  },
  practice: [
    mcq({
      id: 'signs', difficulty: 1,
      prompt: t`The solid curve is a pulse at $t = 1$ s; the dashed one is the same pulse a moment later — it is moving toward $+x$. At the point P, what are the signs of $u_x$ and $u_t$?`,
      visual: { type: 'graph', params: { x: [-1, 6], y: [-0.1, 1.2], aspect: 'wide', xlabel: 'x (m)', ylabel: 'u',
        curves: [{ fn: 'e^(-(x-2)^2)', color: 'accent', width: 2.4 }, { fn: 'e^(-(x-2.4)^2)', color: 'accent', dash: [5, 4], width: 1.5 }],
        points: [{ x: 2.8, y: Math.exp(-0.64), label: 'P', color: 'gold' }] }, caption: t`Snapshots of the same pulse at $t = 1$ s (solid) and a little later (dashed).` },
      choices: [t`$u_x < 0$ and $u_t > 0$`, t`$u_x < 0$ and $u_t < 0$`, t`$u_x > 0$ and $u_t > 0$`, t`$u_x > 0$ and $u_t < 0$`],
      answer: 0,
      why: {
        1: t`The slope is negative there, but look straight up from P: the dashed (later) curve is higher, so at fixed $x$ the value is rising.`,
        2: t`$u_x$ is the slope of the solid curve at P. On the front of the pulse the curve goes downhill to the right.`,
        3: t`Both signs are swapped: that is the back of a pulse, where the curve climbs and the value at a fixed place falls as the pulse moves away.`,
      },
      hints: [t`$u_x$: hold $t$ fixed and read the slope of the solid curve at P.`, t`$u_t$: hold $x$ fixed — compare the solid and dashed curves directly above and below P.`],
      teach: t`$u_x$ is read along a snapshot; $u_t$ is read by comparing two snapshots at the same $x$.`,
      explain: t`P is on the front of the pulse: the snapshot slopes downhill ($u_x < 0$), and as the pulse arrives the value at that spot rises ($u_t > 0$). For a pulse moving at speed $c$, $u_t = -c\,u_x$ — opposite signs.`,
    }),
    num({
      id: 'aircraft-front', difficulty: 2,
      gen(r) {
        const G = r.pick([2, 3, 4, 5]), b = r.pick([0.5, 1, 1.5, 2]), v = r.pick([150, 200, 250, 300]);
        const g = G / 100, rate = b - g * v;
        return {
          prompt: t`Ahead of a cold front, the air temperature falls eastward by ${G} K per 100 km, and at any fixed place it is rising by ${b} K/h. A light aircraft flies due east at ${v} km/h. At what rate does its thermometer reading change, in K/h? (Negative if falling.)`,
          visual: xtPlane({ x: [0, 500], y: [0, 2], xlabel: 'x, east (km)', ylabel: 't (h)', xticks: 6,
            curves: [...Array.from({ length: 14 }, (_, k) => ({ fn: `(${g}*x - ${2 * k})/${b}`, color: 'violet', width: 1, alpha: 0.7 })),
              { fn: `x/${v}`, color: 'gold', width: 2.6, label: 'aircraft', labelAt: 0.75 * v, labelDy: -10 }] },
          t`Isotherms (violet), 2 K apart, in the $x$–$t$ plane: colder to the east, and each one creeping east as the air warms. The aircraft’s path is gold; the isotherms it crosses per hour are its rate of change.`),
          answer: rate, units: 'K/h', tol: { rel: 0.01 },
          errors: [{ value: b + g * v, feedback: t`Flying east means flying toward colder air: $T_x$ is negative, so $\dot x\,T_x$ is negative.` }, { value: b, feedback: t`That is $T_t$, the rate at a fixed place. The aircraft also moves through the gradient: add $\dot x\,T_x$.` }, { value: -g * v, feedback: t`You have the motion term; add the warming at each fixed place, $T_t = ${b}$ K/h.` }],
          hints: [t`$\dfrac{dT}{dt} = T_t + \dot x\,T_x$.`, t`$T_t = +${b}$ K/h, $T_x = -${G / 100}$ K/km, $\dot x = ${v}$ km/h.`],
          teach: 'A moving sensor records the local rate plus its speed times the spatial slope.',
          explain: t`$\dfrac{dT}{dt} = ${b} + (${v})(-${G / 100}) = ${tex(rate)}$ K/h. Advection through the front swamps the local warming — why a thermometer on an aircraft (or a re-entering probe) must be corrected for its own motion.`,
        };
      },
    }),
    mcq({
      id: 'balloon', difficulty: 2,
      prompt: t`A weather balloon rises steadily through still air whose temperature at every height stays the same all morning. Its thermometer reading falls steadily. At a given height, what is $T_t$?`,
      visual: { type: 'graph', params: { x: [0, 60], y: [0, 12], aspect: 'wide', xlabel: 't (min)', ylabel: 'height z (km)', axesAt: 'edge',
        hlines: [2, 4, 6, 8, 10].map((z, i) => ({ y: z, label: `${15 - 13 * (i + 1)} °C`, color: 'violet' })),
        curves: [{ fn: '0.3*x', color: 'gold', width: 2.6, domain: [0, 38], label: 'balloon', labelAt: 17, labelDy: -10 }] },
      caption: t`Isotherms (violet) are horizontal: the temperature at each height does not change with time. The balloon’s path (gold) climbs through them at 5 m/s.` },
      choices: [t`$T_t = 0$; the falling reading is $\dot z\,T_z$`, t`$T_t < 0$, because the reading falls`, t`$T_t > 0$, because the balloon rises`, t`$T_t$ cannot be defined while the balloon moves`],
      answer: 0,
      why: {
        1: t`The reading is $dT/dt$ along the balloon’s path, not $T_t$. A fixed thermometer at any height would read a constant.`,
        2: t`Rising carries the balloon into colder air; that is the term $\dot z\,T_z$, which is negative here.`,
        3: t`$T_t$ belongs to the field, not to the balloon: it is the rate at a fixed height, whoever is there.`,
      },
      hints: ['Ask what a thermometer fixed at one height would read during the morning.', t`The balloon records $\dot z\,T_z + T_t$; which of the two terms is zero here?`],
      teach: t`$u_t$ is a property of the field at a fixed place; a moving sensor records $u_t$ plus its own motion term.`,
      explain: t`The isotherms are horizontal, so $T_t = 0$ at every height. The balloon reads $dT/dt = \dot z\,T_z$: with $\dot z = 5$ m/s and a lapse of 6.5 K/km, about $-0.033$ K/s, or $-2$ K per minute.`,
    }),
    num({
      id: 'pulse-ut', difficulty: 2,
      gen(r) {
        const A = r.pick([2, 3, 4]), c = r.pick([2, 3]), s = r.pick([-1, -0.5, 0.5, 1, 1.5]), T = r.pick([0.5, 1]);
        const X = c * T + s, ut = (A * 2 * s * c) / (1 + s * s) ** 2;
        return {
          prompt: t`A pulse on a long cable is $u(x, t) = \dfrac{${A}}{1 + (x - ${c}t)^2}$ (in cm, with $x$ in m and $t$ in s). Find $u_t$ at $x = ${X}$ m, $t = ${T}$ s, in cm/s.`,
          visual: { type: 'surface3d', params: { z: `${A}/(1 + (x - ${c}*y)^2)`, domain: [[-2, 6], [0, 1.5]], n: 40, axisLabels: ['x', 't', 'u'], axisLen: 2, target: [2, 0.75, 1], yaw: -1.25, pitch: 0.6, dist: 11, scale: 1.35, zscale: 0.6,
            curves: [{ param: ['t', T, `${A}/(1 + (t - ${c * T})^2)`], t: [-2, 6], color: 'gold' }, { param: [X, 't', `${A}/(1 + (${X} - ${c}*t)^2)`], t: [0, 1.5], color: 'violet' }] },
            caption: t`The pulse as a surface over the $x$–$t$ plane (heights scaled by 0.6). Gold: the snapshot at $t = ${T}$ s. Violet: the history at $x = ${X}$ m; its slope where the two meet is $u_t$.` },
          answer: ut, units: 'cm/s', tol: { rel: 0.01 },
          errors: [{ value: ut / c, feedback: t`That is $-u_x$. Differentiating in $t$ brings out the factor $-${c}$ from the inside, $x - ${c}t$.` }, { value: -ut, feedback: t`Check the sign: $\partial_t (x - ${c}t) = -${c}$, and the outer derivative of $(1 + s^2)^{-1}$ is $-2s(1 + s^2)^{-2}$.` }],
          hints: [t`Let $s = x - ${c}t$. Then $u = ${A}(1 + s^2)^{-1}$ and $\partial s/\partial t = -${c}$.`, t`$u_t = ${A}\cdot(-1)(1 + s^2)^{-2}\cdot 2s\cdot(-${c}) = \dfrac{${2 * A * c}\,s}{(1 + s^2)^2}$. Here $s = ${s}$.`],
          teach: t`Hold $x$ fixed and differentiate through the inside function $x - ct$ by the chain rule.`,
          explain: t`$s = ${X} - ${c}(${T}) = ${s}$, so $u_t = \dfrac{${2 * A * c}(${s})}{(1 + ${s * s})^2} = ${tex(ut)}$ cm/s. ${s > 0 ? 'Positive: the point is ahead of the peak, which is arriving.' : 'Negative: the point is behind the peak, which is leaving.'}`,
        };
      },
    }),
    num({
      id: 'ride-the-pattern', difficulty: 3,
      gen(r) {
        const ux = -r.pick([0.4, 0.5, 0.8, 1.2]), v = r.pick([1.5, 2, 2.5, 3, 4]), ut = +(-v * ux).toFixed(3);
        return {
          prompt: t`At one point of a temperature field, a probe array measures $T_x = ${ux}$ K/m and $T_t = ${ut}$ K/s. How fast must a probe move along $x$ to see **no change** in its reading at that moment, in m/s?`,
          visual: { type: 'graph', params: { x: [-2, 2], y: [-2.6, 2.6], aspect: 'wide', xlabel: 'x − x₀ (m)', ylabel: 'T − T₀ (K)',
            curves: [{ fn: `${-ux}*1.4*tanh(-x/1.4)`, color: 'accent', width: 2.4, label: 'snapshot', labelAt: -1.4, labelDy: -10 }, { fn: `${ux}*x`, color: 'gold', dash: [5, 4], domain: [-1.2, 1.2], label: `slope ${ux} K/m`, labelAt: 0.9, labelDx: 8 }] },
            caption: t`A snapshot of the field near the point (illustrative shape) with its slope $T_x$. The snapshot alone cannot tell you $T_t$; the probes measure it separately.` },
          answer: v, units: 'm/s', tol: { rel: 0.01 },
          errors: [{ value: -v, feedback: t`Set $T_t + \dot x\,T_x = 0$ and keep the signs: $\dot x = -T_t/T_x$, and $T_x$ is negative.` }, { value: 1 / v, feedback: t`Invert the other way: $\dot x = -T_t/T_x$, which has units (K/s)/(K/m) = m/s.` }],
          hints: [t`No change means $\dfrac{dT}{dt} = T_t + \dot x\,T_x = 0$.`, t`Solve: $\dot x = -T_t / T_x$.`],
          teach: t`An observer moving at $-u_t/u_x$ keeps up with the pattern: the level lines of $u$ are its paths.`,
          explain: t`$\dot x = -T_t/T_x = -(${ut})/(${ux}) = ${v}$ m/s. Moving at that speed, the probe rides a level line of $T$ — if the whole pattern moves this way, $T_t + ${v}T_x = 0$ is the transport equation.`,
        };
      },
    }),
    mcq({
      id: 'chain-rule', difficulty: 2,
      prompt: t`A sensor moves along the path $x(t)$ through a field $u(x, t)$. Which expression is the rate of change of its reading?`,
      visual: { type: 'surface3d', params: { z: 'e^(-(x - y)^2)', domain: [[-2, 5], [0, 3]], n: 40, axisLabels: ['x', 't', 'u'], axisLen: 2, target: [1.5, 1.5, 0.5], yaw: -1.25, pitch: 0.6, dist: 11, scale: 1.35, zscale: 1.6,
        curves: [{ param: ['0.5 + 0.4*t', 't', 'e^(-(0.5 + 0.4*t - t)^2)'], t: [0, 3], color: 'teal' }] },
        caption: t`A sensor’s path (teal) climbing over and down a moving ridge: its reading is the height of the surface along the path.` },
      choices: [t`$u_t + \dot x\,u_x$`, t`$u_t$`, t`$\dot x\,u_x$`, t`$u_t\,\dot x + u_x$`],
      answer: 0,
      why: {
        1: t`That is what a fixed sensor reads. A moving one also changes its reading by moving through the slope.`,
        2: t`That is the whole story only if the field is steady ($u_t = 0$).`,
        3: t`The velocity multiplies the spatial slope $u_x$ (metres per second × units per metre), not the time rate.`,
      },
      hints: [t`Write the reading as $u(x(t), t)$: a function of $t$ through two slots.`, t`Chain rule: differentiate through the first slot (giving $u_x\,\dot x$) and the second (giving $u_t$).`],
      teach: t`The chain rule: $\frac{d}{dt}u(x(t), t) = u_t + \dot x\,u_x$.`,
      explain: t`$u$ depends on $t$ twice — directly and through $x(t)$ — so $\frac{d}{dt}u(x(t), t) = u_x\,\dot x + u_t$. Units check: (units/m)(m/s) = units/s.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-capsule', difficulty: 2, transfer: true,
      gen(r) {
        const w = r.pick([1.5, 2, 3, 4, 5]), H = 7;
        const frac = w / H;
        return {
          prompt: t`A capsule descends through the upper atmosphere at ${w} km/s (straight down). Model the air density as steady and exponential, $\rho(z) = \rho_0\,e^{-z/H}$ with scale height $H = ${H}$ km. What is the fractional rate $\dfrac{1}{\rho}\dfrac{d\rho}{dt}$ at which the density around the capsule grows, per second?`,
          visual: { type: 'graph', params: { x: [0, 1.25], y: [0, 90], aspect: 'wide', xlabel: 'ρ (kg/m³)', ylabel: 'altitude z (km)', curves: [{ param: ['1.225*e^(-t/7)', 't'], t: [0, 90], color: 'accent', width: 2.4 }],
            arrows: [{ from: [0.6, 75], to: [0.6, 55], color: 'gold', label: 'descent', labelDx: 8 }] },
            caption: t`The exponential atmosphere with $H = 7$ km — an isothermal approximation; the real scale height varies between about 6 and 8 km with temperature.` },
          answer: frac, units: '1/s', tol: { rel: 0.01 },
          errors: [{ value: -frac, feedback: t`The capsule is descending, $\dot z = -${w}$ km/s, and $\rho_z = -\rho/H$: two negatives make the density grow.` }, { value: frac / 1000, feedback: 'Keep the units consistent: km/s divided by km gives per second.' }],
          hints: [t`$\dfrac{d\rho}{dt} = \rho_t + \dot z\,\rho_z$, and the field is steady.`, t`$\rho_z = -\rho/H$ and $\dot z = -${w}$ km/s.`],
          teach: 'In a steady field the whole change a moving observer sees is speed × slope.',
          explain: t`$\rho_t = 0$, so $\dfrac{d\rho}{dt} = \dot z\,\rho_z = (-${w})(-\rho/${H})$, giving $\dfrac{1}{\rho}\dfrac{d\rho}{dt} = ${w}/${H} = ${tex(frac)}\ \text{s}^{-1}$: the density grows by about ${Math.round(frac * 100)}% each second, which is why entry heating and deceleration climb so steeply.`,
        };
      },
    }),
    mcq({
      id: 'cp-buoy', difficulty: 2,
      prompt: t`A buoy drifting freely with a river current $c$ records a concentration that never changes. What equation does the concentration field $C(x, t)$ satisfy along the river?`,
      visual: xtPlane({ x: [0, 10], y: [0, 4], xticks: 6, curves: [
        ...[-6, -4, -2, 0, 2, 4, 6, 8].map((k) => ({ fn: `(x - ${k})/2`, color: 'violet', width: 1, alpha: 0.7 })),
        { fn: '(x - 2)/2', color: 'gold', width: 2.8, label: 'buoy', labelAt: 6, labelDy: -10 }] },
      t`Lines of constant concentration (violet) in the $x$–$t$ plane, and the buoy’s path (gold), which runs along one of them.`),
      choices: [t`$C_t + c\,C_x = 0$`, t`$C_t = 0$`, t`$C_x = 0$`, t`$C_t - c\,C_x = 0$`],
      answer: 0,
      why: {
        1: t`A sensor fixed on the bank would see the concentration change as the pattern passes; only the drifting buoy sees none.`,
        2: 'The concentration varies along the river; it is the drifting reading that is constant.',
        3: t`With the minus sign, $dC/dt = 0$ along paths with $\dot x = -c$: an observer drifting upstream.`,
      },
      hints: [t`The buoy’s path has $\dot x = c$, and along it $dC/dt = 0$.`, t`Write $dC/dt = C_t + \dot x\,C_x$ with $\dot x = c$.`],
      teach: 'Zero change for an observer moving at c is the transport equation.',
      explain: t`Along the buoy, $0 = \dfrac{dC}{dt} = C_t + c\,C_x$. That is the transport equation (lesson B2.1), and the buoy’s path is one of its characteristics.`,
    }),
    mcq({
      id: 'cp-slices', difficulty: 1,
      prompt: t`On the surface $u(x, t)$, two curves pass through the marked point: the gold one at fixed $t$ and the violet one at fixed $x$. The slope of which curve at the point is $u_t$?`,
      visual: { type: 'surface3d', params: { z: '1.5*e^(-(x - 1.2*y)^2/2)', domain: [[-3, 5], [0, 3]], n: 40, axisLabels: ['x', 't', 'u'], axisLen: 2, target: [1, 1.5, 0.7], yaw: -1.25, pitch: 0.6, dist: 11, scale: 1.35,
        curves: [{ param: ['t', 1.2, '1.5*e^(-(t - 1.44)^2/2)'], t: [-3, 5], color: 'gold' }, { param: [2.4, 't', '1.5*e^(-(2.4 - 1.2*t)^2/2)'], t: [0, 3], color: 'violet' }] },
        caption: 'Gold: the snapshot at t = 1.2 s. Violet: the history at x = 2.4 m. They cross at the point in question.' },
      choices: ['the violet curve, at fixed x', 'the gold curve, at fixed t', 'the steepest path up the surface through the point', 'the level curve of u through the point'],
      answer: 0,
      why: {
        1: t`The gold curve varies $x$ with $t$ held fixed: its slope is $u_x$.`,
        2: t`The steepest path follows the gradient $(u_x, u_t)$ — a mixture of both slopes.`,
        3: 'Along a level curve u does not change at all: its “slope” in u is zero.',
      },
      hints: [t`$u_t$ is the rate of change when only $t$ varies.`],
      teach: t`$u_t$ is the slope of the slice at fixed $x$; $u_x$ the slope of the slice at fixed $t$.`,
      explain: t`Along the violet curve only $t$ changes, so its slope is $\partial u/\partial t$. The gold curve gives $\partial u/\partial x$.`,
    }),
  ],
  sources: [SRC.strauss, { label: 'OpenStax Calculus Vol. 3, §4.3 Partial derivatives and §4.5 The chain rule', url: 'https://openstax.org/books/calculus-volume-3/pages/4-5-the-chain-rule' }],
});
