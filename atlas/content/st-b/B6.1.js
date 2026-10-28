// Dirichlet, Neumann and Robin conditions: what each says physically (a
// value, a flux, a flux proportional to a difference), the outward-normal
// sign convention, the Robin condition as the bridge between the other two
// (Biot number), and the Neumann compatibility condition — no steady state
// unless the net flux balances the sources, and then only up to a constant.
import { lesson, mcq, num, expr, match } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
// Incropera Table A.1, 300 K: conductivity k (W/(m K)), specific heat c (J/(kg K))
const SOLIDS = [
  { name: 'aluminium alloy 2024-T6', k: 177, c: 875 },
  { name: 'stainless steel 304', k: 14.9, c: 477 },
  { name: 'titanium', k: 21.9, c: 522 },
  { name: 'pure copper', k: 401, c: 385 },
];
const r3 = (x) => +x.toPrecision(3);

// a rod drawn as a bar with two labelled ends
const rodPic = (left, right, caption) => ({
  type: 'graph',
  params: { x: [-0.25, 1.25], y: [-0.6, 0.6], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [{ param: ['t', '0.12'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['t', '-0.12'], t: [0, 1], color: 'ink2', width: 2 }, { param: ['0', '-0.12 + 0.24*t'], t: [0, 1], color: 'warn', width: 4 }, { param: ['1', '-0.12 + 0.24*t'], t: [0, 1], color: 'accent', width: 4 }], points: [{ x: 0, y: 0.3, label: left, r: 0, labelDx: -30 }, { x: 1, y: 0.3, label: right, r: 0, labelDx: -110 }, { x: 0.5, y: -0.3, label: 'insulated along its length', r: 0, color: 'ink3', labelDx: -70 }] },
  caption,
});

export default lesson({
  id: 'st-b.B6.1',
  title: 'Dirichlet, Neumann and Robin conditions',
  minutes: 13, difficulty: 3,
  intro: t`An elliptic equation such as $\nabla^2u = f$ is solved on a region, and it needs one condition at every point of the region’s boundary. Three kinds cover almost all of physics, and one formula holds them all:

$$a\,u + b\,\frac{\partial u}{\partial n} = g \quad\text{on the boundary.}$$

**Dirichlet** ($b = 0$): the value is prescribed — a wall held at the temperature of boiling nitrogen, a conductor held at a voltage. **Neumann** ($a = 0$): the outward slope, and so the **flux**, is prescribed — an insulated face ($\partial u/\partial n = 0$), a heater delivering known watts. **Robin** (both): the flux is proportional to a difference — Newton’s law of cooling, $-k\,\partial T/\partial n = h\,(T - T_\infty)$. Choosing the wrong kind is the commonest modelling error; the Neumann kind also hides a trap: a solution may not exist at all.`,
  symbols: [
    { tex: 'u', text: 'the unknown on the region — a temperature (K), a potential (V or J/kg)…' },
    { tex: t`\frac{\partial u}{\partial n}`, text: 'the derivative along the **outward** normal $\\hat n$ to the boundary, $\\nabla u\\cdot\\hat n$ (units of $u$ per m). At the left end $x = 0$ of a rod it is $-u_x$; at the right end $+u_x$' },
    { tex: 'a,\\ b', text: 'weights saying which kind of condition this is; for convective cooling $a = h$, $b = k$' },
    { tex: 'g', text: 'the prescribed boundary data (for convection, $hT_\\infty$)' },
    { tex: 'h', text: 'the convective heat-transfer coefficient (W/(m² K)) in Newton’s law of cooling; $T_\\infty$ the surrounding fluid’s temperature' },
    { tex: 'k', text: 'the thermal conductivity (W/(m K)): Fourier’s law says the heat flux is $-k\\nabla T$' },
  ],
  why: t`Every simulation must decide what happens at the edge of its grid. In numerical relativity the outer boundary of the grid is artificial, and choosing conditions that let gravitational waves leave without reflecting — and that keep the constraints satisfied — is an active research problem.`,
  visual: {
    type: 'graph',
    title: 'Robin between Neumann and Dirichlet',
    lead: t`A rod insulated along its length, its left end held at $T_0$ and its right end cooled by a fluid at $T_\infty$. The steady profile is a straight line; the **Biot number** $\text{Bi} = hL/k$ decides its slope. Slide Bi across six decades.`,
    tasks: [
      'Bi = 0.01: the end barely loses heat; the rod sits at T₀ throughout — almost the insulated (Neumann) limit.',
      'Bi = 100: the fluid wins; the end is pinned at T∞ — almost the fixed-value (Dirichlet) limit.',
      'Bi = 1: the end lands exactly halfway. The heat flowing out (readout) climbs from 0 to its Dirichlet value as Bi grows.',
    ],
    params: {
      x: [0, 1], y: [-0.1, 1.2], aspect: 'wide', xlabel: 'x / L', ylabel: '(T − T∞) / (T₀ − T∞)', axesAt: 'edge',
      sliders: [{ key: 'Bi', label: 'Biot number $\\text{Bi} = hL/k$', min: 0.01, max: 100, value: 1, logScale: true, explain: 'How strongly the fluid cools the end, compared with how well the rod conducts heat to it.' }],
      curves: [
        { fn: '1', color: 'ink3', dash: [5, 4], width: 1.4, label: 'Neumann limit (insulated end)', labelAt: 0.55, labelDy: -10 },
        { fn: '1 - x', color: 'ink3', dash: [5, 4], width: 1.4, label: 'Dirichlet limit (T = T∞)', labelAt: 0.25, labelDy: 18 },
        { fn: '1 - Bi*x/(1 + Bi)', color: 'accent', width: 2.8 },
      ],
      points: [{ x: 1, y: '1/(1 + Bi)', color: 'gold', label: 'end', labelDx: -34 }],
      readouts: [{ label: 'end temperature (scaled)', expr: '1/(1 + Bi)', digits: 3 }, { label: 'heat out ÷ Dirichlet value', expr: 'Bi/(1 + Bi)', digits: 3 }],
    },
    caption: t`Steady state of $T'' = 0$ with $T(0) = T_0$ and $-kT'(L) = h\big(T(L) - T_\infty\big)$: $\;\dfrac{T - T_\infty}{T_0 - T_\infty} = 1 - \dfrac{\text{Bi}}{1 + \text{Bi}}\dfrac{x}{L}$. One-dimensional, constant $k$ and $h$.`,
  },
  example: {
    prompt: t`A rod $0 \le x \le 1$ is insulated everywhere — sides and both ends — and heat is generated inside it at the rate $f(x)$ (scaled units). Its steady temperature would solve $-u'' = f$ with $u'(0) = u'(1) = 0$. Is there a steady state when $f = 1$? When $f = x - \tfrac12$? If so, is it unique?`,
    visual: { type: 'graph', params: { x: [0, 1], y: [-0.55, 0.55], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [
      { fn: 'x - 0.5', color: 'warn', width: 2, label: 'f = x − ½', labelAt: 0.82, labelDy: -12 },
      { fn: '-x^3/6 + x^2/4 - 1/24', color: 'accent', width: 2.6, label: 'u (average 0)', labelAt: 0.28, labelDy: -14 },
      { fn: '-x^3/6 + x^2/4 - 1/24 + 0.2', color: 'accent', width: 1.4, dash: [5, 4] },
      { fn: '-x^3/6 + x^2/4 - 1/24 - 0.2', color: 'accent', width: 1.4, dash: [5, 4] },
    ] }, caption: t`The source $f = x - \tfrac12$ (cooling on the left, heating on the right, net zero) and steady states for it: the solid one and any vertical shift of it (dashed). All have zero slope at both ends.` },
    steps: [
      { label: 'Integrate the equation', text: t`Integrate $-u'' = f$ over the rod: $-\big[u'(1) - u'(0)\big] = \int_0^1 f\,dx$. With both ends insulated the left side is 0, so a steady state **requires** $\int_0^1 f\,dx = 0$: the heat made inside must total zero.` },
      { label: 'f = 1', text: t`$\int_0^1 1\,dx = 1 \ne 0$: no steady state. Physically the rod keeps gaining heat with nowhere to put it, and its temperature rises forever.` },
      { label: 'f = x − ½', text: t`$\int_0^1(x - \tfrac12)\,dx = 0$ ✓. Integrate once: $u' = -\tfrac{x^2}{2} + \tfrac{x}{2} + C_1$; $u'(0) = 0$ gives $C_1 = 0$, and then $u'(1) = -\tfrac12 + \tfrac12 = 0$ holds **automatically** — the compatibility condition at work.` },
      { label: 'Integrate again', text: t`$u = -\dfrac{x^3}{6} + \dfrac{x^2}{4} + K$ for **any** constant $K$. Check: $-u'' = -(-x + \tfrac12) = x - \tfrac12$ ✓.` },
      { label: 'Not unique', text: t`Neumann data fix only slopes, so adding a constant changes nothing they can see. Something else must pin $K$: here, the total heat content (say, average temperature 0 gives $K = -\tfrac{1}{24}$).` },
    ],
    answer: t`For $f = 1$ there is no steady state. For $f = x - \tfrac12$ the steady states are $u = -\tfrac{x^3}{6} + \tfrac{x^2}{4} + K$: they exist because $\int f = 0$, and are unique only up to the constant $K$.`,
  },
  practice: [
    match({
      id: 'which-condition', difficulty: 1,
      prompt: t`Match each situation with the kind of condition it imposes on the temperature $T$.`,
      visual: { type: 'graph', params: { x: [0, 3.3], y: [0, 1.3], aspect: 'wide', axes: false, grid: false, xlabel: '', ylabel: '', curves: [
        { param: ['1', 't'], t: [0, 1.2], color: 'ink2', width: 2 }, { param: ['2.1', 't'], t: [0, 1.2], color: 'ink2', width: 2 }, { param: ['3.2', 't'], t: [0, 1.2], color: 'ink2', width: 2 },
        { fn: '0.25 + 0.4*x', domain: [0.1, 1], color: 'accent', width: 2.4 },
        { fn: '0.75 + 0.2*(x - 2.1)^2', domain: [1.2, 2.1], color: 'violet', width: 2.4 },
        { fn: '1.0 - 0.25*(x - 2.3)', domain: [2.3, 3.2], color: 'teal', width: 2.4 },
      ], points: [{ x: 1, y: 0.65, label: 'value fixed', color: 'accent', labelDx: -78, labelDy: -14 }, { x: 2.1, y: 0.75, label: 'slope 0', color: 'violet', labelDx: -56, labelDy: -14 }, { x: 3.2, y: 0.775, label: 'slope ∝ value', color: 'teal', labelDx: -92, labelDy: 18 }] }, caption: 'Three profiles meeting a boundary (vertical line): one with its value fixed, one arriving flat, one with slope tied to its value. Illustrative.' },
      left: [t`The inner face of a tank wall wetted by liquid nitrogen boiling at 77 K`, t`The back face of a heat-shield tile bonded to a perfect insulator`, t`The tip of a radiator fin losing heat by convection to air`, t`A face heated by a laser that delivers a known $q$ in W/m²`, t`The temperature everywhere in the tile at $t = 0$`],
      right: ['Dirichlet: the value of T is given', 'Neumann: the outward slope ∂T/∂n (the flux) is given', 'Robin: a combination aT + b ∂T/∂n is given', 'not a boundary condition: an initial condition', 'periodic: values at opposite ends are equal'],
      answer: [0, 1, 2, 1, 3],
      hints: ['Is the boundary’s temperature known, its heat flux known, or is the flux tied to its temperature?', 'An insulated face and a known heating rate both fix the flux: one at zero, one at q.'],
      teach: 'Dirichlet fixes the value, Neumann fixes the flux (zero for insulation), Robin ties the flux to the value.',
      explain: t`Boiling liquid holds the wall at its boiling point (Dirichlet, idealized). Insulation means zero flux and a known heater means known flux: both Neumann, $-k\,\partial T/\partial n = q$. Convection is Robin, $-k\,\partial T/\partial n = h(T - T_\infty)$. The state at $t = 0$ is initial data, not a condition on the boundary.`,
    }),
    num({
      id: 'robin-end', difficulty: 2,
      gen(r) {
        const m = r.pick(SOLIDS), L = r.pick([0.05, 0.1, 0.2]), h = r.pick([10, 25, 50, 100]);
        const T0 = r.pick([80, 120, 150]), Ti = r.pick([15, 20, 25]);
        const Bi = (h * L) / m.k, TL = Ti + (T0 - Ti) / (1 + Bi);
        const errs = [[T0, 'That is the insulated (Neumann) limit: it ignores the cooling at the end.'], [Ti, 'That is the Dirichlet limit, as if the fluid pinned the end at its own temperature.']]
          .filter(([v]) => Math.abs(v - TL) > 0.03 * Math.abs(TL)).map(([value, feedback]) => ({ value, feedback }));
        return {
          prompt: t`A ${m.name} rod ($k = ${m.k}$ W/(m K)), ${L * 100} cm long and insulated along its length, has one end held at ${T0} °C. The other end is cooled by air at ${Ti} °C with $h = ${h}$ W/(m² K). What is the steady temperature of the cooled end, in °C?`,
          visual: rodPic(`${T0} °C`, `air ${Ti} °C, h = ${h} W/(m² K)`, 'The rod (schematic): one end held, the other cooled by air.'),
          answer: TL, units: '°C', tol: { rel: 0.005 },
          errors: errs,
          hints: [t`Steady and no sources: $T$ is a straight line. Heat conducted to the end, $k(T_0 - T_L)/L$, equals heat convected away, $h(T_L - T_\infty)$.`, t`Solve: $T_L = T_\infty + \dfrac{T_0 - T_\infty}{1 + \text{Bi}}$ with $\text{Bi} = hL/k$.`],
          teach: 'A Robin end balances conduction into it against convection out of it; the Biot number says which wins.',
          explain: t`$\text{Bi} = hL/k = ${tex(Bi)}$, so $T_L = ${Ti} + \dfrac{${T0 - Ti}}{1 + ${tex(Bi)}} = ${r3(TL)}$ °C. ${Bi < 0.1 ? 'Small Bi: conduction easily keeps up, the rod stays near the held temperature.' : Bi > 10 ? 'Large Bi: the end is nearly at the air temperature.' : 'Neither limit applies: the Robin condition matters.'}`,
        };
      },
    }),
    mcq({
      id: 'outward-normal', difficulty: 2,
      prompt: t`A rod lies along $0 \le x \le L$. Its **left** end, $x = 0$, loses heat by convection to a fluid at $T_\infty$. With Fourier’s law (heat flux $q = -kT_x$ in the $+x$ direction), which condition holds at $x = 0$?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.2], aspect: 'wide', xlabel: 'x / L', ylabel: 'T (scaled)', axesAt: 'edge', curves: [{ fn: '0.45 + 0.9*x - 0.4*x^2', color: 'accent', width: 2.4 }], arrows: [{ from: [0.12, 0.25], to: [0.01, 0.25], color: 'warn', label: 'heat out', labelDx: 8, labelDy: 14 }] }, caption: 'A profile that rises away from the cooled left end: heat flows toward the end (downhill) and out into the fluid.' },
      choices: [t`$k\,T_x(0) = h\big(T(0) - T_\infty\big)$`, t`$-k\,T_x(0) = h\big(T(0) - T_\infty\big)$`, t`$T_x(0) = 0$`, t`$T(0) = T_\infty$`],
      answer: 0,
      why: {
        1: t`That is the right-end form, copied to the left end. At $x = 0$ the outward normal points toward $-x$, so $\partial T/\partial n = -T_x$ and the sign flips.`,
        2: 'That says the end is insulated: no heat leaves at all.',
        3: 'That pins the end at the fluid temperature — the Dirichlet limit, valid only when h is enormous.',
      },
      hints: [t`Write the general form $-k\,\partial T/\partial n = h(T - T_\infty)$ and work out $\partial T/\partial n$ at the left end.`, t`At $x = 0$ the outward direction is $-x$, so $\partial T/\partial n = -T_x(0)$.`],
      teach: 'Always write the condition with the outward normal; at a left or lower boundary the normal derivative is minus the coordinate derivative.',
      explain: t`$-k\,\partial T/\partial n = -k(-T_x) = kT_x(0) = h\big(T(0) - T_\infty\big)$. Sense check: if the end is warmer than the fluid, the right side is positive, so $T_x(0) > 0$ — temperature rises into the rod, and heat flows down the slope and out of the end, as drawn.`,
    }),
    num({
      id: 'insulated-heating', difficulty: 2,
      gen(r) {
        const P = r.pick([5, 10, 20, 40]), m = r.pick([0.5, 1, 2, 3]), c = SOLIDS[0].c;
        const rate = (P / (m * c)) * 60;
        return {
          prompt: t`A ${m} kg aluminium electronics box ($c = ${c}$ J/(kg K)) inside a spacecraft is wrapped in ideal insulation on every face, and its electronics dissipate ${P} W. The temperature inside obeys the heat equation with a source and $\partial T/\partial n = 0$ on every face. How fast does its average temperature rise, in K per minute?`,
          visual: { type: 'graph', params: { x: [0, 60], y: [0, 1.1], aspect: 'wide', xlabel: 't (min)', ylabel: 'average temperature rise (scaled)', axesAt: 'edge', curves: [{ fn: 'x/60', color: 'warn', width: 2.4 }] }, caption: 'With every face insulated there is no steady state: the average temperature climbs at a constant rate (scale not shown).' },
          answer: rate, units: 'K/min', tol: { rel: 0.01 }, difference: true,
          errors: [{ value: rate / 60, feedback: 'That is the rate per second; the question asks per minute.' }],
          hints: [t`Integrate the heat equation over the box: the insulated faces let nothing out, so all ${P} W goes into heating it.`, t`$m c\,\dfrac{d\bar T}{dt} = P$.`],
          teach: 'Integrating a Neumann problem over its region turns the PDE into a heat budget: with zero flux out, the sources only heat the body.',
          explain: t`$\dfrac{d\bar T}{dt} = \dfrac{P}{mc} = \dfrac{${P}}{${m}\times${c}} = ${tex(P / (m * c))}$ K/s $= ${r3(rate)}$ K/min. This is the compatibility condition in action: a steady state needs the net heat in to vanish. Real spacecraft give such boxes a radiator — a Robin-like condition — precisely so a steady state exists.`,
        };
      },
    }),
    expr({
      id: 'neumann-solve', difficulty: 3,
      gen(r) {
        const k = r.pick([1, 2, 3]), A = r.pick([1, 2, 5]);
        const K = k === 1 ? '\\pi' : `${k}\\pi`;
        return {
          prompt: t`Solve $-u'' = ${A === 1 ? '' : A}\cos(${K} x)$ on $[0, 1]$ with $u'(0) = u'(1) = 0$, choosing the solution whose average over $[0, 1]$ is zero.`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-1.15 * A, 1.15 * A], aspect: 'wide', xlabel: 'x', ylabel: '', axesAt: 'edge', curves: [{ fn: `${A}*cos(${k}*pi*x)`, color: 'warn', width: 2.2, label: 'source f', labelAt: 0.05, labelDx: 6, labelDy: -12 }] }, caption: t`The source $f$: equal amounts of heating and cooling, so $\int_0^1 f\,dx = 0$ and a steady state exists.` },
          answer: `${A}*cos(${k}*pi*x)/(${k}*pi)^2`,
          answerTeX: t`\frac{${A === 1 ? '' : A}\cos(${K} x)}{${k === 1 ? '\\pi^2' : `${k * k}\\pi^2`}}`,
          lhs: 'u(x)',
          vars: { x: [0, 1] },
          errors: [{ answer: `-${A}*cos(${k}*pi*x)/(${k}*pi)^2`, feedback: t`Sign: $-u'' = f$, and $(\cos ax)'' = -a^2\cos ax$, so $u = +f/a^2$.` }, { answer: `${A}*cos(${k}*pi*x)/(${k}*pi)`, feedback: 'Two derivatives bring down two factors of kπ: divide by (kπ)².' }],
          hints: [t`Try $u = C\cos(${K} x)$: it already has zero slope at $x = 0$ and $x = 1$.`, t`$-u'' = C(${K})^2\cos(${K} x)$, so $C = ${A}/(${K})^2$. Its average over $[0, 1]$ is zero, so no constant is added.`],
          teach: 'A Neumann problem pins only slopes; a normalization such as zero average picks one solution from the family u + K.',
          explain: t`$u = \dfrac{${A}\cos(${K} x)}{(${K})^2}$. Its slope $-\dfrac{${A}\sin(${K} x)}{${K}}$ vanishes at both ends, and its average is zero. Any $u + K$ would satisfy the equation and both end conditions too.`,
        };
      },
    }),
    mcq({
      id: 'robin-limits', difficulty: 2,
      prompt: t`The condition $-k\,\partial T/\partial n = h\,(T - T_\infty)$ holds on the face of a slab. What happens to it as $h \to \infty$ (an extremely vigorous coolant) and as $h \to 0$?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [-0.1, 1.2], aspect: 'wide', xlabel: 'x / L', ylabel: '(T − T∞) / (T₀ − T∞)', axesAt: 'edge', curves: [{ fn: '1 - 0.01*x/1.01', color: 'teal', width: 2, label: 'Bi = 0.01', labelAt: 0.5, labelDy: -10 }, { fn: '1 - x/2', color: 'accent', width: 2, label: 'Bi = 1', labelAt: 0.5, labelDy: -10 }, { fn: '1 - 100*x/101', color: 'violet', width: 2, label: 'Bi = 100', labelAt: 0.5, labelDx: 8 }] }, caption: 'Steady profiles in a rod with its right end cooled, for three Biot numbers.' },
      choices: [t`$h \to \infty$: Dirichlet, $T = T_\infty$; $\;h \to 0$: Neumann, insulated`, t`$h \to \infty$: Neumann; $\;h \to 0$: Dirichlet`, t`Both limits give a Neumann condition`, t`It stays a Robin condition in both limits`],
      answer: 0,
      why: {
        1: t`Divide by $h$: $T - T_\infty = -(k/h)\,\partial T/\partial n \to 0$ as $h \to \infty$. That fixes the value, not the flux.`,
        2: t`As $h \to \infty$ the flux can be anything; it is the value that becomes fixed.`,
        3: t`In each limit one term drops out: $h \to 0$ leaves $\partial T/\partial n = 0$; $h \to \infty$ leaves $T = T_\infty$.`,
      },
      hints: [t`Set $h = 0$: what is left? For $h \to \infty$, divide both sides by $h$ first.`],
      teach: 'Robin interpolates: small Bi = hL/k gives the insulated limit, large Bi gives the fixed-value limit.',
      explain: t`$h = 0$ leaves $\partial T/\partial n = 0$, an insulated face. Dividing by $h$ and letting $h \to \infty$ leaves $T = T_\infty$, a Dirichlet face. In between, the dimensionless $\text{Bi} = hL/k$ decides which the face resembles.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-chamber-wall', difficulty: 3, transfer: true,
      gen(r) {
        const q = r.pick([20, 40, 60]) * 1e6, L = r.pick([0.7, 0.9, 1.1]) / 1000, k = 320, h = r.pick([60, 100, 150]) * 1e3, Tc = r.pick([60, 120, 200]);
        const Twc = Tc + q / h, Twg = Twc + (q * L) / k;
        return {
          prompt: t`The copper-alloy liner of a regeneratively cooled rocket chamber ($k = ${k}$ W/(m K)) is ${+(L * 1000).toFixed(2)} mm thick. The hot gas delivers a heat flux $q = ${q / 1e6}$ MW/m² into its inner face (a Neumann condition). Coolant at ${Tc} K flows past its outer face with $h = ${h / 1000}$ kW/(m² K) (a Robin condition). In steady state, what is the temperature of the hot inner face, in K?`,
          visual: { type: 'graph', params: { x: [-0.3, 1.3], y: [0, 1.25], aspect: 'wide', xlabel: 'across the wall (scaled)', ylabel: 'T (scaled)', axesAt: 'edge', xticks: 0, yticks: 0, curves: [{ param: ['0', 't'], t: [0, 1.2], color: 'ink2', width: 2 }, { param: ['1', 't'], t: [0, 1.2], color: 'ink2', width: 2 }, { fn: '0.95 - 0.35*x', domain: [0, 1], color: 'accent', width: 2.4 }, { fn: '0.25', domain: [1.08, 1.3], color: 'teal', width: 2, dash: [5, 4] }], arrows: [{ from: [-0.25, 1.05], to: [-0.02, 1.05], color: 'warn', label: 'q from hot gas', labelDx: -20, labelDy: -12 }, { from: [1.02, 0.45], to: [1.25, 0.45], color: 'teal', label: 'to coolant', labelDx: -60, labelDy: 14 }] }, caption: 'One-dimensional, steady, constant conductivity; the wall’s curvature, the ribs between coolant channels and radiation are ignored. Profile shape illustrative.' },
          answer: Twg, units: 'K', tol: { rel: 0.005 },
          errors: [{ value: Twc, feedback: 'That is the coolant-side face. The heat must also cross the copper, adding qL/k.' }, { value: Tc + (q * L) / k, feedback: 'You left out the jump between the coolant and the wall: q/h at the Robin face.' }],
          hints: [t`In steady state the same flux $q$ crosses the coolant film and the wall.`, t`Coolant side: $q = h(T_{wc} - T_c)$. Through the wall: $q = k(T_{wg} - T_{wc})/L$. Add the two temperature rises.`],
          teach: 'In steady 1D conduction the flux is the same at every layer, so temperature drops add like voltages across resistors in series: q/h for the film, qL/k for the wall.',
          explain: t`$T_{wc} = ${Tc} + q/h = ${r3(Twc)}$ K, then $T_{wg} = T_{wc} + qL/k = ${r3(Twg)}$ K. Copper alloys lose strength above roughly 700–800 K, which is why chamber designers fight for a higher $h$ and a thinner liner.`,
        };
      },
    }),
    mcq({
      id: 'cp-neumann-plate', difficulty: 2,
      prompt: t`A thin plate has no sources inside, and the heat flux through every part of its edge is prescribed: $\partial T/\partial n = g$. What can you say about the steady temperature?`,
      visual: { type: 'c3-contour', params: { f: 'x^2 - y^2 + 0.5*x', x: [-1.6, 1.6], y: [-1, 1], levels: 9, labels: false, curves: [{ param: ['-1 + 2*t', '-1'], t: [0, 1], color: 'ink', width: 2 }, { param: ['-1 + 2*t', '1'], t: [0, 1], color: 'ink', width: 2 }, { param: ['-1', '-1 + 2*t'], t: [0, 1], color: 'ink', width: 2 }, { param: ['1', '-1 + 2*t'], t: [0, 1], color: 'ink', width: 2 }] }, caption: 'A steady temperature in a square plate (illustrative). Adding a constant to it changes no slope anywhere.' },
      choices: [t`It exists only if $\oint g\,ds = 0$, and then it is unique up to an added constant`, 'It always exists and is unique', 'It always exists, but there are infinitely many genuinely different shapes', t`It exists only if $g = 0$ everywhere`],
      answer: 0,
      why: {
        1: 'Neumann data only see slopes: adding a constant to a solution gives another solution with the same data. And if heat enters net, nothing removes it, so no steady state exists.',
        2: 'The difference of two solutions has zero flux everywhere on the edge; the energy argument (lesson B6.2) makes it constant — the shape is unique.',
        3: 'Heat may enter through one part of the edge if it leaves through another: only the net flux must vanish.',
      },
      hints: [t`Integrate $\nabla^2T = 0$ over the plate and use the divergence theorem.`, 'If T is a solution, is T + 5 one too?'],
      teach: 'Neumann problems: solvable only when the total flux balances the sources, and then unique only up to a constant.',
      explain: t`The divergence theorem turns $\int\nabla^2T\,dA = 0$ into $\oint \partial T/\partial n\,ds = \oint g\,ds = 0$: the compatibility condition. When it holds, solutions exist and differ only by constants.`,
    }),
    mcq({
      id: 'cp-wrong-model', difficulty: 2, kind: 'error',
      prompt: t`To model a re-entry heat-shield tile whose back face is bonded to a thick layer of insulating felt, a student writes the boundary condition $T = 0$ at the back face, “because no heat gets through.” What is wrong?`,
      visual: { type: 'graph', params: { x: [0, 1], y: [0, 1.1], aspect: 'wide', xlabel: 'depth / thickness', ylabel: 'T rise (scaled)', axesAt: 'edge', curves: [{ fn: '1 - 0.45*sin(pi*x/2)', color: 'accent', width: 2.4, label: 'zero slope at the back', labelAt: 0.62, labelDy: -14 }, { fn: '1 - x', color: 'warn', width: 2, dash: [5, 4], label: 'held at 0', labelAt: 0.75, labelDy: 18 }] }, caption: 'Two back-face models (illustrative shapes): an insulated face meets the wall flat; a face held at fixed temperature draws heat out through it.' },
      choices: ['“No heat gets through” fixes the flux, not the temperature: the condition is ∂T/∂n = 0', 'Nothing: T = 0 means no heat', 'It should be T = T∞ of the air outside the felt', 'It should be a Robin condition with h = 0 and T = 0'],
      answer: 0,
      why: {
        1: 'Temperature is not heat. Holding a face at a fixed temperature generally requires heat to flow through it — exactly what insulation prevents.',
        2: 'The felt is insulating: the air temperature beyond it does not reach the tile’s back face.',
        3: t`With $h = 0$ the Robin condition reduces to $\partial T/\partial n = 0$ — which is the right answer stated awkwardly; the value $T = 0$ plays no part.`,
      },
      hints: ['What does an insulator prevent: a temperature, or a flow of heat?'],
      teach: 'Insulated means zero flux — a Neumann condition — not a fixed temperature.',
      explain: t`Fourier’s law ties heat flow to the temperature gradient, so “no heat crosses” means $\partial T/\partial n = 0$. The student’s $T = 0$ is a Dirichlet condition: it would act as a perfect heat sink, pulling heat out through the back and underpredicting the back-face temperature — the very quantity the tile exists to limit.`,
    }),
  ],
  sources: [SRC.strauss, SRC.incropera, { label: 'D. K. Huzel & D. H. Huang, Modern Engineering for Design of Liquid-Propellant Rocket Engines (AIAA, 1992), ch. 4: regenerative cooling', url: 'https://openlibrary.org/search?q=modern+engineering+for+design+of+liquid-propellant+rocket+engines' }],
});
