// Dimensional analysis: both sides of a valid equation have the same dimensions.
import { lesson, mcq, num, match } from '../../src/core/content.js';
import { fmt } from '../../src/core/format.js';
import { dimBars } from './_measure.js';

const t = String.raw;
const G0 = 9.80665;   // standard gravity, m/s², exact by definition

export default lesson({
  id: 'phys2210.M1.2',
  title: 'Dimensional analysis',
  minutes: 9, difficulty: 2,
  intro: t`Every physical quantity has **dimensions**: the mix of mass ($\mathsf{M}$), length ($\mathsf{L}$) and time ($\mathsf{T}$) it is built from, whichever units you measure it in. A speed is a length per time, $\mathsf{L\,T^{-1}}$, in m/s or in mph alike. The rule is absolute: **you can only add, subtract or equate quantities with the same dimensions**, so every term of a valid equation must match:

$$x = x_0 + v_0 t + \tfrac12 a t^2 \quad\Longrightarrow\quad \mathsf{L} = \mathsf{L} + \mathsf{L\,T^{-1}}\cdot\mathsf{T} + \mathsf{L\,T^{-2}}\cdot\mathsf{T}^2$$

That makes dimensions a free check on every formula you write — and, used cleverly, a way to predict how a quantity must scale before you solve anything.`,
  symbols: [
    { tex: '[\\,Q\\,]', text: 'square brackets mean “the dimensions of $Q$”: $[v] = \\mathsf{L\\,T^{-1}}$' },
    { tex: '\\mathsf{M},\\ \\mathsf{L},\\ \\mathsf{T}', text: 'mass, length and time — the dimensions of the SI base units kg, m and s (electric current, temperature, amount and luminous intensity complete the set)' },
    { tex: 'x,\\ x_0', text: 'position now and at the start, in metres: dimension $\\mathsf{L}$' },
    { tex: 'v_0', text: 'the starting velocity, in m/s: dimension $\\mathsf{L\\,T^{-1}}$' },
    { tex: 'a', text: 'the (constant) acceleration, in m/s²: dimension $\\mathsf{L\\,T^{-2}}$' },
    { tex: 't', text: 'the elapsed time, in seconds: dimension $\\mathsf{T}$' },
    { tex: '\\tfrac12', text: 'a pure number: it has no dimensions, so dimensional analysis can never check it' },
  ],
  why: 'A dimension check takes ten seconds and catches most algebra slips — and in later physics, dimensional reasoning is how you guess the size of black holes and the strength of gravitational waves before solving anything.',
  visual: {
    type: 'graph',
    title: 'Balance the dimensions of a pendulum’s period',
    lead: t`A pendulum’s period $P$ can depend only on its length $L$, the strength of gravity $g$ and the bob’s mass $m$. Guess $P = C\,L^{a} g^{b} m^{c}$, where $C$ is a pure number, and tune the three powers until the right-hand side has the dimensions of a time: each bar must stop on its gold mark — no mass, no length, one power of time.`,
    tasks: [
      'Start with the mass: only c = 0 puts the M bar on its mark. The period cannot depend on the mass at all.',
      'Gravity alone brings time, as T⁻² per power of g: you need b = −½ to end with T¹.',
      t`That leaves a length of $L^{-1/2}$ from g. Cancel it with a = +½: P = C√(L/g).`,
    ],
    params: {
      x: [0.3, 3.7], y: [-2.6, 2.6], xticks: 0.001, xlabel: ' ', ylabel: 'power',
      alt: 'Three bars showing the powers of mass, length and time in a guessed formula, with gold target marks',
      sliders: [
        { key: 'a', label: 'Power of the length, $a$', min: -2, max: 2, step: 0.5, value: 1, explain: t`$[L] = \mathsf{L}$, so $L^a$ adds $a$ to the power of $\mathsf{L}$.` },
        { key: 'b', label: 'Power of gravity, $b$', min: -2, max: 2, step: 0.5, value: 0, explain: t`$[g] = \mathsf{L\,T^{-2}}$, so $g^b$ adds $b$ to the power of $\mathsf{L}$ and $-2b$ to the power of $\mathsf{T}$.` },
        { key: 'c', label: 'Power of the mass, $c$', min: -2, max: 2, step: 0.5, value: 1, explain: t`$[m] = \mathsf{M}$, so $m^c$ sets the power of $\mathsf{M}$ to $c$.` },
      ],
      shade: [
        { fn: 'c', lower: '0', from: 0.65, to: 1.35, color: 'violet', alpha: 0.6 },
        { fn: 'a + b', lower: '0', from: 1.65, to: 2.35, color: 'accent', alpha: 0.6 },
        { fn: '-2*b', lower: '0', from: 2.65, to: 3.35, color: 'good', alpha: 0.6 },
      ],
      curves: [
        { fn: '0', domain: [0.55, 1.45], color: 'gold', width: 4 },
        { fn: '0', domain: [1.55, 2.45], color: 'gold', width: 4 },
        { fn: '1', domain: [2.55, 3.45], color: 'gold', width: 4 },
      ],
      points: [
        { x: 0.6, y: -2.3, r: 0.01, color: 'violet', label: 'M (mass)' },
        { x: 1.6, y: -2.3, r: 0.01, color: 'accent', label: 'L (length)' },
        { x: 2.6, y: -2.3, r: 0.01, color: 'good', label: 'T (time)' },
      ],
      readouts: [{ label: 'power of M', expr: 'c' }, { label: 'power of L', expr: 'a + b' }, { label: 'power of T', expr: '-2*b' }],
    },
    caption: t`Bar heights are the powers of $\mathsf{M}$, $\mathsf{L}$ and $\mathsf{T}$ in $L^a g^b m^c$, using $[L] = \mathsf{L}$, $[g] = \mathsf{L\,T^{-2}}$ and $[m] = \mathsf{M}$. Dimensions fix the powers but never the number $C$: solving the pendulum’s equation of motion gives $C = 2\pi$ for small swings.`,
  },
  example: {
    prompt: t`Find how a pendulum’s period $P$ depends on its length $L$, on $g$ and on the mass $m$ of its bob — without solving any equation of motion.`,
    visual: { type: 'oscillator', params: { kind: 'pendulum', L: 1, theta0: 10 }, caption: t`A pendulum to test the result on: change $L$ and watch the small-angle period — quadrupling $L$ doubles it. Solid curve: the exact motion, integrated numerically; dashed: the small-angle approximation. The drawing is not to scale.` },
    steps: [
      { label: 'List the ingredients', text: t`$[L] = \mathsf{L}$, $[g] = \mathsf{L\,T^{-2}}$, $[m] = \mathsf{M}$, and the target $[P] = \mathsf{T}$. Nothing else about a simple pendulum has dimensions (for small swings the angle is a pure number).` },
      { label: 'Write a power-law guess', text: t`$P = C\,L^{a} g^{b} m^{c}$, so $$\mathsf{T}^1 = \mathsf{L}^{a}\,(\mathsf{L\,T^{-2}})^{b}\,\mathsf{M}^{c} = \mathsf{L}^{a+b}\,\mathsf{T}^{-2b}\,\mathsf{M}^{c}$$` },
      { label: 'Match each dimension', text: t`$\mathsf{M}$: $c = 0$. $\mathsf{T}$: $-2b = 1$, so $b = -\tfrac12$. $\mathsf{L}$: $a + b = 0$, so $a = +\tfrac12$. Three dimensions, three equations, one answer.` },
      { label: 'Read off the law', text: t`$P = C\sqrt{L/g}$, and the mass has dropped out. The full solution gives $C = 2\pi$, so a 1.00 m pendulum on Earth has $P = 2\pi\sqrt{1.00/9.81} = ${fmt(2 * Math.PI * Math.sqrt(1 / 9.81), 3)}$ s.` },
      { label: 'Sense check', text: 'A longer pendulum swings more slowly; stronger gravity makes it swing faster; the bob’s mass does not matter — exactly what Galileo found. A 1 m pendulum ticks once a second on each swing, which is why old clocks were about a metre tall.' },
    ],
    answer: t`$P = C\sqrt{L/g}$ (with $C = 2\pi$ from the full solution), independent of the mass.`,
  },
  practice: [
    mcq({
      id: 'dims-force', difficulty: 1,
      prompt: t`Newton’s second law says $F = ma$. What are the dimensions of force?`,
      choices: [t`$\mathsf{M\,L\,T^{-2}}$`, t`$\mathsf{M\,L\,T^{-1}}$`, t`$\mathsf{M\,L^{2}\,T^{-2}}$`, t`$\mathsf{L\,T^{-2}}$`],
      answer: 0,
      why: {
        1: 'That is momentum, mass times velocity. An acceleration has one more power of time in the denominator than a velocity.',
        2: 'That is energy: a force times a distance.',
        3: 'That is an acceleration on its own — the mass is missing.',
      },
      hints: [t`$[m] = \mathsf{M}$ and $[a] = \mathsf{L\,T^{-2}}$ (metres per second per second).`],
      teach: 'Dimensions multiply like the quantities do: [F] = [m][a] = M × L T⁻².',
      visual: dimBars([{ name: 'mass m', dims: [1, 0, 0] }, { name: 'acceleration a', dims: [0, 1, -2] }]),
      explain: t`$[F] = [m][a] = \mathsf{M}\times\mathsf{L\,T^{-2}} = \mathsf{M\,L\,T^{-2}}$ — in SI units, $1\ \text{N} = 1\ \text{kg}\cdot\text{m/s}^2$.`,
    }),
    match({
      id: 'dims-table', difficulty: 1,
      prompt: 'Match each quantity to its dimensions.',
      left: [t`speed $v$`, t`acceleration $a$`, t`momentum $mv$`, t`kinetic energy $\tfrac12 mv^2$`, t`pressure $F/A$ (force per area)`],
      right: ['L T⁻¹', 'L T⁻²', 'M L T⁻¹', 'M L² T⁻²', 'M L⁻¹ T⁻²', 'M L T⁻²'],
      answer: [0, 1, 2, 3, 4],
      hints: ['Build each one from its formula: momentum is mass times speed, energy is mass times speed squared.', 'Pressure is a force (M L T⁻²) divided by an area (L²).'],
      teach: 'Write a quantity’s defining formula, then multiply the dimensions of its pieces.',
      explain: 'v: L T⁻¹. a: L T⁻². mv: M L T⁻¹. ½mv²: M L² T⁻² (the ½ has no dimensions). F/A: M L T⁻² ÷ L² = M L⁻¹ T⁻². The one left over, M L T⁻², is a force.',
    }),
    mcq({
      id: 'which-equation', difficulty: 2,
      prompt: t`Only one of these equations is dimensionally possible. Which one? ($v$ and $v_0$ are speeds, $a$ is an acceleration, $t$ a time, $x$ and $\Delta x$ distances.)`,
      choices: [t`$v^2 = v_0^2 + 2a\,\Delta x$`, t`$v = v_0 + a\,\Delta x$`, t`$x = v_0 t + a t$`, t`$v = v_0 + \tfrac12 a t^2$`],
      answer: 0,
      why: {
        1: t`$a\,\Delta x$ has dimensions $\mathsf{L^2\,T^{-2}}$, a speed squared, so it cannot be added to a speed.`,
        2: t`$a t$ is a speed ($\mathsf{L\,T^{-1}}$), not a distance. The correct term is $\tfrac12 a t^2$.`,
        3: t`$\tfrac12 a t^2$ is a distance ($\mathsf{L}$), and a distance cannot be added to a speed.`,
      },
      hints: ['Find the dimensions of every term separately; all the terms of a sum must match.', t`$[a\,\Delta x] = \mathsf{L\,T^{-2}}\cdot\mathsf{L} = \mathsf{L^2\,T^{-2}}$. Which equation has a speed squared on the other side?`],
      teach: 'Every term in a sum must have the same dimensions — check them one at a time.',
      visual: dimBars([{ name: 'speed v', dims: [0, 1, -1] }, { name: 'acceleration a', dims: [0, 1, -2] }, { name: 'time t', dims: [0, 0, 1] }, { name: 'distance Δx', dims: [0, 1, 0] }]),
      explain: t`In $v^2 = v_0^2 + 2a\,\Delta x$ every term is $\mathsf{L^2\,T^{-2}}$: $[v^2] = (\mathsf{L\,T^{-1}})^2$ and $[a\,\Delta x] = \mathsf{L\,T^{-2}}\cdot\mathsf{L}$. Passing the test does not prove an equation right; it only means it *could* be.`,
    }),
    mcq({
      id: 'dims-G', difficulty: 2,
      prompt: t`Newton’s law of gravitation is $F = \dfrac{G\,m_1 m_2}{r^2}$. What are the dimensions of the constant $G$?`,
      choices: [t`$\mathsf{L^{3}\,M^{-1}\,T^{-2}}$`, t`$\mathsf{L^{3}\,M\,T^{-2}}$`, t`$\mathsf{M\,L\,T^{-2}}$`, t`None: $G$ is a pure number`],
      answer: 0,
      why: {
        1: t`You multiplied by the masses instead of dividing: $G = F r^2/(m_1 m_2)$.`,
        2: t`That is the dimension of a force. $G$ is what turns two masses and a distance *into* a force.`,
        3: 'Constants of nature usually carry dimensions — that is exactly how they convert one kind of quantity into another.',
      },
      hints: [t`Solve for $G$ first: $G = \dfrac{F r^2}{m_1 m_2}$.`, t`$[G] = \dfrac{\mathsf{M\,L\,T^{-2}}\cdot\mathsf{L^2}}{\mathsf{M^2}}$.`],
      teach: 'To find the dimensions of a constant, solve its equation for the constant and substitute the dimensions of everything else.',
      visual: dimBars([{ name: 'force F', dims: [1, 1, -2] }, { name: 'distance r', dims: [0, 1, 0] }, { name: 'mass m', dims: [1, 0, 0] }]),
      explain: t`$[G] = \dfrac{[F][r]^2}{[m]^2} = \dfrac{\mathsf{M\,L\,T^{-2}}\cdot\mathsf{L^2}}{\mathsf{M^2}} = \mathsf{L^3\,M^{-1}\,T^{-2}}$, which is why $G = 6.674\times10^{-11}\ \text{m}^3\,\text{kg}^{-1}\,\text{s}^{-2}$.`,
    }),
    num({
      id: 'isp-to-ve', difficulty: 2,
      gen(r) {
        const [Isp, what] = r.pick([[282, 'a kerosene–oxygen first-stage engine at sea level'], [311, 'a kerosene–oxygen engine in vacuum'], [320, 'a storable-propellant spacecraft engine in vacuum'], [452, 'a hydrogen–oxygen engine in vacuum'], [465, 'a hydrogen–oxygen upper-stage engine in vacuum']]);
        const ve = Isp * G0;
        return {
          prompt: t`Rocket engineers rate engines by **specific impulse**, $I_\text{sp} = \dfrac{F}{\dot m\,g_0}$: the thrust $F$ divided by the weight of propellant burned each second ($\dot m$ is the mass burned per second and $g_0 = 9.80665\ \text{m/s}^2$). A force divided by a force per second leaves seconds. Multiplying back by $g_0$ gives the **effective exhaust velocity**, $v_e = I_\text{sp}\,g_0$. Find $v_e$ for ${what}, with $I_\text{sp} = ${Isp}\ \text{s}$.`,
          answer: ve, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: Isp / G0, feedback: t`You divided by $g_0$. Check the units: s ÷ (m/s²) is s³/m, not a speed.` }],
          hints: [t`Check the units first: $\text{s}\times\text{m/s}^2 = \text{m/s}$, a speed.`, t`$v_e = ${Isp}\ \text{s}\times9.80665\ \text{m/s}^2$.`],
          teach: 'Units multiply and cancel like numbers: seconds times metres per second squared is metres per second.',
          visual: {
            type: 'graph',
            params: { aspect: 'wide', x: [0, 500], y: [0, 5000], xticks: 5, yticks: 5, xlabel: 'specific impulse (s)', ylabel: 'exhaust velocity (m/s)', curves: [{ fn: '9.80665*x', color: 'accent' }], vlines: [{ x: Isp, label: `${Isp} s`, color: 'gold' }] },
            caption: 'Exhaust velocity is specific impulse times a constant, g₀ — a straight line through the origin. Read it to check the size of your answer; compute the value.',
          },
          explain: t`$v_e = I_\text{sp}\,g_0 = ${Isp}\ \text{s}\times9.80665\ \text{m/s}^2 = ${Math.round(ve)}\ \text{m/s}$, about ${fmt(ve / 1000, 2)} km/s.`,
          solution: 'Why quote seconds at all? In US units, thrust is in pounds-force and propellant flow in pounds of mass per second. One pound of mass weighs one pound-force at standard gravity, so thrust ÷ weight flow comes out as the same number of seconds. Quoted in seconds, specific impulse is the same number in every unit system.',
        };
      },
    }),
    num({
      id: 'pendulum-elsewhere', difficulty: 3,
      gen(r) {
        const P0 = r.pick([1.5, 2, 2.5]);
        const [where, gw] = r.pick([['the Moon', 1.62], ['Mars', 3.71]]);
        const P = P0 * Math.sqrt(9.81 / gw);
        return {
          prompt: t`Dimensional analysis says a pendulum’s period is $P = C\sqrt{L/g}$ for some pure number $C$. A pendulum clock ticks with period ${P0.toFixed(2)} s on Earth, where $g = 9.81\ \text{m/s}^2$. What would its period be on ${where}, where $g = ${gw}\ \text{m/s}^2$? Give 3 significant figures. You never need $C$.`,
          answer: P, units: 's', tol: { rel: 0.003 },
          errors: [
            { value: (P0 * 9.81) / gw, feedback: t`The period goes as $1/\sqrt{g}$, not as $1/g$: take the square root of the ratio.` },
            { value: P0 * Math.sqrt(gw / 9.81), feedback: 'Weaker gravity makes a pendulum swing more slowly, so its period must get longer, not shorter.' },
          ],
          hints: [t`Take a ratio, so $C$ and $L$ cancel: $\dfrac{P_\text{there}}{P_\text{Earth}} = \sqrt{\dfrac{g_\text{Earth}}{g_\text{there}}}$.`, t`$P = ${P0.toFixed(2)}\ \text{s}\times\sqrt{9.81/${gw}}$.`],
          teach: 'A scaling law answers “how does it change?” through ratios, so the unknown constant cancels.',
          explain: t`$P = ${P0.toFixed(2)}\ \text{s}\times\sqrt{\dfrac{9.81}{${gw}}} = ${P0.toFixed(2)}\times${fmt(Math.sqrt(9.81 / gw), 3)} = ${fmt(P, 3)}\ \text{s}$.`,
          visual: {
            type: 'graph',
            params: { aspect: 'wide', x: [0, 11], y: [0, Math.ceil(P0 * 4.2)], xlabel: 'g (m/s²)', ylabel: 'P (s)', curves: [{ fn: `${P0}*sqrt(9.81/x)`, color: 'accent', domain: [0.55, 11] }], points: [{ x: 9.81, y: P0, color: 'gold', label: 'Earth' }] },
            caption: t`The same pendulum’s period against the strength of gravity: $P \propto 1/\sqrt{g}$. Read the trend from the curve; compute the value.`,
          },
        };
      },
    }),
    mcq({
      id: 'fall-time-error', difficulty: 3, kind: 'error',
      prompt: t`A student solves for the time an object takes to fall from rest through a height $h$, and gets

$$t = \sqrt{\frac{2g}{h}}.$$

Without redoing any algebra, what can you say?`,
      choices: [t`It must be wrong: $\sqrt{g/h}$ has dimensions $\mathsf{T^{-1}}$, not $\mathsf{T}$`, 'It could be right: the 2 under the root fixes the dimensions', t`It must be wrong, but only the 2: it should be $\tfrac12$`, t`It could be right: $g$ and $h$ are both lengths, so the root is a pure number`],
      answer: 0,
      why: {
        1: 'Pure numbers like 2 have no dimensions, so they can never fix — or break — dimensional consistency.',
        2: 'Dimensional analysis cannot see numerical factors at all. What it can see is that g/h is upside down.',
        3: t`$g$ is an acceleration ($\mathsf{L\,T^{-2}}$), not a length.`,
      },
      hints: [t`Work out $[g/h]$: an acceleration divided by a length.`, t`$[g/h] = \mathsf{L\,T^{-2}}/\mathsf{L} = \mathsf{T^{-2}}$, so $[\sqrt{g/h}] = \mathsf{T^{-1}}$. What must a time be?`],
      teach: 'If the dimensions of an answer are wrong, the answer is wrong — however careful the algebra looked.',
      explain: t`$[\sqrt{2g/h}] = \mathsf{T^{-1}}$: a rate, not a time. Flipping the fraction fixes the dimensions, $t = \sqrt{2h/g}$, and that is the correct result. The graph is a second check: the student’s formula says a higher drop takes *less* time.`,
      visual: {
        type: 'graph',
        params: { aspect: 'wide', x: [0, 50], y: [0, 2], xlabel: 'h (m)', ylabel: 't (s)', curves: [{ fn: 'sqrt(2*9.8/x)', color: 'bad', domain: [2, 50], label: 'student’s t(h)', labelAt: 30 }] },
        caption: t`The student’s formula, $t = \sqrt{2g/h}$ with $g = 9.8\ \text{m/s}^2$, plotted against the drop height. A sense check that complements the dimension check.`,
      },
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-gas-speed', difficulty: 3, transfer: true,
      prompt: t`Gas in a rocket’s combustion chamber has pressure $p$ (in pascals, N/m²) and density $\rho$ (in kg/m³). Suppose the speed at which the gas can rush out of the nozzle depends only on these two (and on pure numbers). Which combination has the dimensions of a speed?`,
      choices: [t`$\sqrt{p/\rho}$`, t`$\sqrt{\rho/p}$`, t`$p/\rho$`, t`$p\,\rho$`],
      answer: 0,
      why: {
        1: t`That is $\mathsf{T\,L^{-1}}$: one over a speed.`,
        2: t`$p/\rho$ is $\mathsf{L^2\,T^{-2}}$, a speed squared. Take its square root.`,
        3: t`$[p\rho] = \mathsf{M^2\,L^{-4}\,T^{-2}}$: the masses do not even cancel.`,
      },
      hints: [t`$[p] = \mathsf{M\,L^{-1}\,T^{-2}}$ (a force per area) and $[\rho] = \mathsf{M\,L^{-3}}$.`, t`Divide to cancel the mass: $[p/\rho] = \mathsf{L^2\,T^{-2}}$.`],
      teach: 'Dimensional analysis finds the only combination of the inputs with the right dimensions — the physics, up to a pure number.',
      visual: dimBars([{ name: 'pressure p', dims: [1, -1, -2] }, { name: 'density ρ', dims: [1, -3, 0] }]),
      explain: t`$[p/\rho] = \dfrac{\mathsf{M\,L^{-1}\,T^{-2}}}{\mathsf{M\,L^{-3}}} = \mathsf{L^2\,T^{-2}}$, so $\sqrt{p/\rho}$ is a speed. The full theory agrees: the speed of sound in a gas is $\sqrt{\gamma p/\rho}$ with $\gamma \approx 1.4$ for air, and nozzle exhaust speeds are a few times this. Dimensions found everything except the number.`,
    }),
    num({
      id: 'cp-orbit-factor', difficulty: 3, transfer: true,
      gen(r) {
        const k = r.pick([2, 3, 4, 9]);
        return {
          prompt: t`A satellite’s orbital period $T$ can depend only on its orbit radius $r$, the planet’s mass $M$ and the constant $G$. Dimensional analysis then forces $T = C\,\dfrac{r^{3/2}}{\sqrt{GM}}$, with $C$ a pure number. If the satellite moves to an orbit with ${k} times the radius, by what factor does its period grow?`,
          answer: k ** 1.5, tol: { rel: 0.005 },
          errors: [
            { value: k, feedback: t`The period does not grow in proportion to the radius: it goes as $r^{3/2}$.` },
            { value: k * k, feedback: t`The power is $\tfrac32$, not 2.` },
            { value: Math.sqrt(k), feedback: t`The power is $\tfrac32$, not $\tfrac12$: $r^{3/2} = r\sqrt{r}$.` },
          ],
          hints: [t`$G$ and $M$ do not change, so $T \propto r^{3/2}$.`, t`The factor is $${k}^{3/2} = ${k}\sqrt{${k}}$.`],
          teach: 'In a power law, multiplying the input by k multiplies the output by k raised to the same power.',
          visual: {
            type: 'graph',
            params: { aspect: 'wide', x: [0, 10], y: [0, 32], xticks: 0.001, yticks: 0.001, xlabel: 'orbit radius', ylabel: 'period', curves: [{ fn: 'x^1.5', color: 'accent', label: 'T ∝ r^(3/2)', labelAt: 6 }, { fn: 'x', color: 'ink3', dash: true, label: 'T ∝ r', labelAt: 9 }] },
            caption: 'The period grows faster than the radius (solid) — compare a straight proportion (dashed). The axes carry no numbers; compute the factor.',
          },
          explain: t`$T \propto r^{3/2}$, so the period grows by $${k}^{3/2} = ${fmt(k ** 1.5, 3)}$. That is Kepler’s third law, $T^2 \propto r^3$, found without solving a single equation of motion.`,
        };
      },
    }),
    mcq({
      id: 'cp-spring-k', difficulty: 2,
      prompt: t`A spring pulls back with a force of size $F = kx$ when it is stretched by a length $x$. What are the dimensions of the spring constant $k$?`,
      choices: [t`$\mathsf{M\,T^{-2}}$`, t`$\mathsf{M\,L\,T^{-2}}$`, t`$\mathsf{M\,L^{2}\,T^{-2}}$`, t`$\mathsf{L^{-1}}$`],
      answer: 0,
      why: {
        1: t`That is a force. $k$ is a force per unit stretch.`,
        2: 'That is a force times a length (an energy). Divide by the stretch; do not multiply.',
        3: t`$k$ has to turn a length into a force, so it must carry mass and time as well as $\mathsf{L^{-1}}$.`,
      },
      hints: [t`Solve for $k$: $k = F/x$.`],
      teach: 'k = F/x, so its dimensions are those of a force divided by a length: N/m.',
      visual: dimBars([{ name: 'force F', dims: [1, 1, -2] }, { name: 'stretch x', dims: [0, 1, 0] }]),
      explain: t`$[k] = [F]/[x] = \mathsf{M\,L\,T^{-2}}/\mathsf{L} = \mathsf{M\,T^{-2}}$. In SI units, $\text{N/m} = \text{kg/s}^2$.`,
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §1.4', url: 'https://openstax.org/books/university-physics-volume-1/pages/1-4-dimensional-analysis' },
    { label: 'NASA Glenn Research Center, Specific Impulse', url: 'https://www.grc.nasa.gov/www/BGH/specimp.html' },
  ],
});
