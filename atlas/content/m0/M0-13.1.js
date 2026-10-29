// Dimensional analysis — dimensions as algebra: checking equations, and deriving them up to a pure number.
import { lesson, mcq, num } from '../../src/core/content.js';
import { nice, sig, tex } from '../../src/core/format.js';
import { dimBars } from './_m0reason.js';

const t = String.raw;
const G = 6.674e-11, C = 2.998e8, GM_SUN = 1.32712e20, M_SUN = 1.989e30;
const MPC_KM = 3.0857e19, GYR_S = 3.156e16;
// dimensions [M, L, T]
const D = { G: [-1, 3, -2], M: [1, 0, 0], c: [0, 1, -1], r: [0, 1, 0], L: [0, 1, 0], g: [0, 1, -2], m: [1, 0, 0], rho: [1, -3, 0], v: [0, 1, -1], A: [0, 2, 0], F: [1, 1, -2], lambda: [0, 1, 0] };

export default lesson({
  id: 'm0.M0-13.1',
  title: 'Dimensional analysis',
  minutes: 11, difficulty: 2,
  intro: t`Every physical quantity has **dimensions**: how it is built from mass $\mathsf{M}$, length $\mathsf{L}$ and time $\mathsf{T}$ (plus temperature and current when needed). A speed is $\mathsf{L\,T^{-1}}$, a force $\mathsf{M\,L\,T^{-2}}$. Writing $[q]$ for the dimensions of $q$,

$$[q] = \mathsf{M}^{\alpha}\,\mathsf{L}^{\beta}\,\mathsf{T}^{\gamma}$$

Two rules follow. **Only like can be added or equated**: every term of a valid equation has the same dimensions. And the input of $\sin$, $e^{x}$ or $\ln$ must be a pure number. The first rule checks equations for free. Run backwards, it *derives* them: if $q$ can depend only on $a$, $b$ and $c$, write $q = C\,a^{x}b^{y}c^{z}$ and match the powers of $\mathsf{M}$, $\mathsf{L}$ and $\mathsf{T}$ on both sides. What it cannot give you is the pure number $C$ — a $2$ or a $2\pi$ — and it gives a wrong answer if you leave out a quantity that matters.`,
  symbols: [
    { tex: '[q]', text: 'the dimensions of the quantity $q$ (not its value or its units)' },
    { tex: '\\mathsf{M},\\ \\mathsf{L},\\ \\mathsf{T}', text: 'the base dimensions mass, length and time (SI units kg, m, s)' },
    { tex: '\\alpha,\\ \\beta,\\ \\gamma', text: 'the powers of each: for a force, $\\alpha = 1$, $\\beta = 1$, $\\gamma = -2$' },
    { tex: 'C', text: 'a pure number (no dimensions) that dimensional analysis cannot find' },
  ],
  why: t`It is the fastest error check in physics — a wrong power of $c$ shows up before any algebra does — and the way to guess the form of an answer before solving anything. In general relativity it explains why physicists set $G = c = 1$: then a mass *is* a length, $GM/c^2$. [PHYS 2210](#/lesson/phys2210.M1.2) uses the same tool on mechanics problems.`,
  visual: {
    type: 'graph',
    title: 'Build a time from a pendulum',
    lead: t`A pendulum’s period can depend only on its length $L$ ($\mathsf{L}$), gravity $g$ ($\mathsf{L\,T^{-2}}$) and the bob’s mass $m$ ($\mathsf{M}$). The bars show the dimensions of $L^{a}g^{b}m^{c}$; the green dashes show a time, $\mathsf{T}^1$. Make the bars match.`,
    tasks: [
      t`Only $g$ contains time, so its power fixes the $\mathsf{T}$ bar: $-2b = 1$ needs $b = -\tfrac12$.`,
      t`Now the $\mathsf{L}$ bar is $a + b$: set $a = \tfrac12$ to cancel it. The period goes as $\sqrt{L/g}$.`,
      t`Nothing else carries mass, so $c = 0$: **the period cannot depend on the mass**. (The true result is $2\pi\sqrt{L/g}$ — the $2\pi$ is beyond dimensional analysis.)`,
    ],
    params: {
      x: [0.3, 3.7], y: [-2.4, 2.4], aspect: 'wide', xlabel: '', xticks: 0, ylabel: 'power', grid: true,
      sliders: [
        { key: 'a', label: t`Power of $L$, $a$`, min: -1, max: 1, step: 0.5, value: 1, explain: t`$L$ is a length, $\mathsf{L}$.` },
        { key: 'b', label: t`Power of $g$, $b$`, min: -1, max: 1, step: 0.5, value: 0, explain: t`$g$ is an acceleration, $\mathsf{L\,T^{-2}}$.` },
        { key: 'c', label: t`Power of $m$, $c$`, min: -1, max: 1, step: 0.5, value: 0, explain: t`$m$ is a mass, $\mathsf{M}$.` },
      ],
      shade: [
        { fn: 'c', lower: '0', from: 0.62, to: 1.38, color: 'violet', alpha: 0.55 },
        { fn: 'a + b', lower: '0', from: 1.62, to: 2.38, color: 'accent', alpha: 0.55 },
        { fn: '-2*b', lower: '0', from: 2.62, to: 3.38, color: 'gold', alpha: 0.55 },
      ],
      curves: [
        { fn: '0', domain: [0.55, 1.45], color: 'good', width: 3, dash: true },
        { fn: '0', domain: [1.55, 2.45], color: 'good', width: 3, dash: true },
        { fn: '1', domain: [2.55, 3.45], color: 'good', width: 3, dash: true },
      ],
      points: [
        { x: 1, y: -2.1, r: 0, label: 'M', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'violet' },
        { x: 2, y: -2.1, r: 0, label: 'L', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'accent' },
        { x: 3, y: -2.1, r: 0, label: 'T', labelAlign: 'center', labelDx: 0, labelDy: 0, color: 'gold' },
      ],
      readouts: [
        { label: t`power of $\mathsf{M}$`, expr: 'c', digits: 2 },
        { label: t`power of $\mathsf{L}$`, expr: 'a + b', digits: 2 },
        { label: t`power of $\mathsf{T}$`, expr: '-2*b', digits: 2 },
        { label: 'a time? (1 = yes)', expr: 'step(0.01 - abs(c) - abs(a + b) - abs(2*b + 1))', digits: 1 },
      ],
    },
    caption: t`Bars: the powers of $\mathsf{M}$, $\mathsf{L}$ and $\mathsf{T}$ in $L^{a}g^{b}m^{c}$; green dashes: those of a time. The small-swing pendulum is assumed; for large swings the period also depends on the (dimensionless) amplitude.`,
  },
  example: {
    prompt: t`If a black hole’s horizon radius $r_s$ depends only on its mass $M$, the gravitational constant $G$ and the speed of light $c$, how must it depend on them? Estimate it for a black hole of one solar mass.`,
    visual: dimBars({ groups: [{ label: 'G', e: D.G }, { label: 'M', e: D.M }, { label: 'c', e: D.c }, { label: 'GM/c²', e: [0, 1, 0] }], caption: t`The powers of mass, length and time in $G$ ($\mathsf{M^{-1}L^{3}T^{-2}}$), $M$ and $c$, and in the combination $GM/c^2$, which is a pure length.` }),
    steps: [
      { label: 'Dimensions', text: t`$[G] = \mathsf{M^{-1}L^{3}T^{-2}}$ (from $F = Gm_1m_2/r^2$), $[M] = \mathsf{M}$, $[c] = \mathsf{L\,T^{-1}}$, and $r_s$ is a length, $\mathsf{L}$.` },
      { label: 'Guess a power law', text: t`Try $r_s = C\,G^{x}M^{y}c^{z}$, so $\mathsf{L} = \mathsf{M}^{-x + y}\,\mathsf{L}^{3x + z}\,\mathsf{T}^{-2x - z}$.` },
      { label: 'Match powers', text: t`$\mathsf{M}$: $-x + y = 0$. $\mathsf{T}$: $-2x - z = 0$. $\mathsf{L}$: $3x + z = 1$. The last two give $x = 1$, $z = -2$; then $y = 1$.` },
      { label: 'Result', text: t`$r_s = C\,\dfrac{GM}{c^2}$. For the Sun, $\dfrac{GM}{c^2} = \dfrac{${tex(GM_SUN, 6)}}{(2.998\times10^{8})^2} = ${Math.round(GM_SUN / C ** 2)}$ m: about $1.5$ km.` },
      { label: 'Sense check', text: t`General relativity gives $C = 2$: $r_s = 2GM/c^2 = ${nice(sig((2 * GM_SUN) / C ** 2 / 1000, 3))}$ km for one solar mass. Dimensional analysis got everything but the $2$, and showed that $r_s$ grows in proportion to $M$ — a black hole twice as heavy is twice as wide.` },
    ],
    answer: t`$r_s = C\,GM/c^2$; for one solar mass $GM/c^2 \approx 1.5$ km (the full theory: $r_s = 2GM/c^2 \approx 3.0$ km).`,
  },
  practice: [
    mcq({
      id: 'pendulum-which', difficulty: 1,
      prompt: t`Which of these could be the period of a pendulum of length $L$, where $g$ is the acceleration due to gravity?`,
      choices: [t`$2\pi\sqrt{L/g}$`, t`$2\pi\sqrt{g/L}$`, t`$2\pi L/g$`, t`$2\pi\sqrt{Lg}$`],
      answer: 0,
      why: {
        1: t`$[g/L] = \mathsf{T^{-2}}$, so $\sqrt{g/L}$ is a *frequency*, $\mathsf{T^{-1}}$ — upside down.`,
        2: t`$[L/g] = \mathsf{T^2}$: a time squared, not a time.`,
        3: t`$[Lg] = \mathsf{L^2T^{-2}}$, so $\sqrt{Lg}$ is a speed.`,
      },
      hints: [t`$[L] = \mathsf{L}$ and $[g] = \mathsf{L\,T^{-2}}$. Which combination is a time? ($2\pi$ has no dimensions.)`],
      teach: t`Check the dimensions of each option: only one is a time.`,
      explain: t`$[L/g] = \mathsf{L}/(\mathsf{L\,T^{-2}}) = \mathsf{T^2}$, so $\sqrt{L/g}$ is a time. The $2\pi$ is a pure number, invisible to the check.`,
      visual: dimBars({ groups: [{ label: 'L', e: D.L }, { label: 'g', e: D.g }, { label: 'period', e: [0, 0, 1] }], caption: t`The dimensions of the length $L$, of $g$, and of a period.` }),
    }),
    mcq({
      id: 'speed-which', difficulty: 2,
      prompt: t`A satellite circles a planet of mass $M$ at radius $r$. Which expression could be its orbital speed? ($G$ is the gravitational constant.)`,
      choices: [t`$\sqrt{GM/r}$`, t`$\sqrt{Gr/M}$`, t`$GM/r$`, t`$\sqrt{GMr}$`],
      answer: 0,
      why: {
        1: t`$[Gr/M] = \mathsf{M^{-2}L^{4}T^{-2}}$: the masses do not cancel.`,
        2: t`$[GM/r] = \mathsf{L^2T^{-2}}$ is a speed *squared* (it is $v^2$).`,
        3: t`$[GMr] = \mathsf{L^4T^{-2}}$; its root is $\mathsf{L^2T^{-1}}$, not a speed.`,
      },
      hints: [t`$[G] = \mathsf{M^{-1}L^{3}T^{-2}}$. Find the combination with dimensions $\mathsf{L\,T^{-1}}$.`],
      teach: t`$GM$ has dimensions $\mathsf{L^3T^{-2}}$, so $GM/r$ is a speed squared.`,
      explain: t`$[GM/r] = \mathsf{L^3T^{-2}}/\mathsf{L} = \mathsf{L^2T^{-2}}$, whose square root is a speed. It is in fact exactly the circular-orbit speed: here the pure number is $1$.`,
      visual: dimBars({ groups: [{ label: 'G', e: D.G }, { label: 'M', e: D.M }, { label: 'r', e: D.r }, { label: 'speed', e: D.v }], caption: t`The dimensions of $G$, $M$, $r$ and a speed.` }),
    }),
    num({
      id: 'drag-exp', difficulty: 2,
      gen(r) {
        const ask = r.pick(['b', 'a', 'c']);
        const name = { a: t`$\rho$ (that is, $a$)`, b: t`$v$ (that is, $b$)`, c: t`$A$ (that is, $c$)` }[ask], ans = { a: 1, b: 2, c: 1 }[ask];
        return {
          prompt: t`The drag force on a rocket depends on the air density $\rho$ ($\text{kg/m}^3$), its speed $v$ and its frontal area $A$: $F = C\,\rho^{a}v^{b}A^{c}$ with $C$ a pure number. What is the power of ${name}?`,
          answer: ans, tol: { rel: 0, abs: 0.01 },
          errors: [{ value: ask === 'b' ? 1 : 2, feedback: t`Match the powers of $\mathsf{M}$, $\mathsf{L}$ and $\mathsf{T}$ separately: only $\rho$ has mass, only $v$ has time.` }].filter((e) => e.value !== ans),
          hints: [t`$[F] = \mathsf{M\,L\,T^{-2}}$; $[\rho] = \mathsf{M\,L^{-3}}$, $[v] = \mathsf{L\,T^{-1}}$, $[A] = \mathsf{L^2}$.`, t`$\mathsf{M}$: $a = 1$. $\mathsf{T}$: $-b = -2$. $\mathsf{L}$: $-3a + b + 2c = 1$.`],
          teach: t`Match each base dimension separately; start with the one that appears in only one quantity.`,
          explain: t`Mass gives $a = 1$, time gives $b = 2$, and length gives $-3 + 2 + 2c = 1$, so $c = 1$: $F = C\rho v^2A$. The drag equation writes $C = \tfrac12 C_D$, with the drag coefficient $C_D$ found by experiment.`,
          visual: dimBars({ groups: [{ label: 'ρ', e: D.rho }, { label: 'v', e: D.v }, { label: 'A', e: D.A }, { label: 'F', e: D.F }], caption: t`The dimensions of $\rho$, $v$, $A$ and of the force $F$ they must build.` }),
        };
      },
    }),
    num({
      id: 'hubble-time', difficulty: 3,
      gen(r) {
        const H = r.pick([67.4, 70, 73]), ans = MPC_KM / H / GYR_S;
        return {
          prompt: t`The Hubble constant, $H_0 = ${H}$ km/s per megaparsec, sets how fast galaxies recede: $v = H_0 d$. Its dimensions are (speed)/(length) $= \mathsf{T^{-1}}$, so $1/H_0$ is a time, the **Hubble time**. Find it in billions of years. ($1\ \text{Mpc} = 3.0857\times10^{19}$ km, $1\ \text{Gyr} = 3.156\times10^{16}$ s.)`,
          answer: ans, units: 'Gyr', tol: { rel: 0.01 },
          errors: [{ value: 1 / H, feedback: t`$1/${H}$ still carries the units Mpc·s/km. Convert the megaparsec to km so the lengths cancel and leave seconds.` }, { value: (MPC_KM / H / GYR_S) * 1000, feedback: t`Check the powers of ten: the megaparsec is $3.0857\times10^{19}$ *kilometres*, and the speed is in km/s, so no metres are needed.` }],
          hints: [t`$\dfrac{1}{H_0} = \dfrac{1\ \text{Mpc}}{${H}\ \text{km/s}}$.`, t`Put $1\ \text{Mpc} = 3.0857\times10^{19}$ km: the km cancel, leaving seconds. Then divide by $3.156\times10^{16}$ s per Gyr.`],
          teach: t`A rate with dimensions $\mathsf{T^{-1}}$ has a natural time, its reciprocal; cancel the units to find it.`,
          explain: t`$\dfrac{3.0857\times10^{19}\ \text{km}}{${H}\ \text{km/s}} = ${tex(MPC_KM / H, 4)}$ s $= ${nice(sig(ans, 3))}$ Gyr. It is close to the age of the universe, $13.8$ Gyr — not exactly, because the expansion has not been steady.`,
          visual: { type: 'graph', params: { x: [0, 500], y: [0, 40000], aspect: 'wide', xlabel: 'distance d (Mpc)', ylabel: 'recession speed (km/s)', curves: [{ fn: `${H}*x`, color: 'accent' }] }, caption: t`Hubble’s law, $v = H_0 d$, with $H_0 = ${H}$ km/s/Mpc: the slope has dimensions of 1/time.` },
        };
      },
    }),
    mcq({
      id: 'escape-error', difficulty: 2, kind: 'error',
      prompt: t`A student derives the escape speed from a planet of mass $M$ and radius $r$ as $v = \sqrt{2GMr}$. What does a dimensional check say?`,
      choices: [
        t`$[2GMr] = \mathsf{L^4T^{-2}}$, so $\sqrt{2GMr}$ is not a speed: $r$ should divide, not multiply`,
        t`The $2$ is wrong: dimensions show the number must be $1$`,
        t`It passes: dimensional analysis cannot catch a misplaced $r$`,
        t`$G$ is a pure number, so only $Mr$ needs checking, and that is fine`,
      ],
      answer: 0,
      why: {
        1: t`Pure numbers like $2$ have no dimensions, so a dimensional check can never confirm or reject them. (The $2$ is in fact right.)`,
        2: t`A misplaced length changes the dimensions, which is exactly what the check catches.`,
        3: t`$G$ has dimensions $\mathsf{M^{-1}L^3T^{-2}}$; without them no combination of $M$ and $r$ could ever be a speed.`,
      },
      hints: [t`$[GM] = \mathsf{L^3T^{-2}}$. What does multiplying by $r$ do?`],
      teach: t`A dimensional check catches misplaced quantities, never wrong pure numbers.`,
      explain: t`$[GMr] = \mathsf{L^3T^{-2}}\cdot\mathsf{L} = \mathsf{L^4T^{-2}}$; the square root is $\mathsf{L^2T^{-1}}$. The correct result, $v = \sqrt{2GM/r}$, has $[GM/r] = \mathsf{L^2T^{-2}}$, a speed squared.`,
      visual: dimBars({ groups: [{ label: 'GM', e: [0, 3, -2] }, { label: 'r', e: D.r }, { label: 'speed²', e: [0, 2, -2] }], caption: t`The dimensions of $GM$, of $r$, and of a speed squared.` }),
    }),
    num({
      id: 'wave-scale', difficulty: 3,
      gen(r) {
        const k = r.pick([4, 9, 16, 2.25]), ans = Math.sqrt(k);
        return {
          prompt: t`The speed of an ocean swell in deep water depends only on $g$ and its wavelength $\lambda$. By dimensional analysis, how many times faster does a swell of ${k} times the wavelength travel?`,
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: k, feedback: t`The speed is not proportional to $\lambda$: match dimensions to find the power of $\lambda$.` }, { value: k * k, feedback: t`Find the power from the dimensions: $v = C\,g^{x}\lambda^{y}$ with $\mathsf{T}$ fixing $x$ first.` }],
          hints: [t`Write $v = C\,g^{x}\lambda^{y}$ with $[v] = \mathsf{L\,T^{-1}}$, $[g] = \mathsf{L\,T^{-2}}$, $[\lambda] = \mathsf{L}$.`, t`$\mathsf{T}$: $-2x = -1$, so $x = \tfrac12$. $\mathsf{L}$: $x + y = 1$.`],
          teach: t`Once dimensions fix the power law, scaling questions need no constant: $C$ cancels in a ratio.`,
          explain: t`$x = \tfrac12$, $y = \tfrac12$: $v = C\sqrt{g\lambda}$ (in fact $C = 1/\sqrt{2\pi}$). So ${k} times the wavelength travels $\sqrt{${k}} = ${nice(ans)}$ times as fast — why long swells from distant storms arrive first.`,
          visual: dimBars({ groups: [{ label: 'g', e: D.g }, { label: 'λ', e: D.lambda }, { label: 'speed', e: D.v }], caption: t`The dimensions of $g$, $\lambda$ and a speed.` }),
        };
      },
    }),
    mcq({
      id: 'arg-dimless', difficulty: 2,
      prompt: t`Which expression is dimensionally meaningless?`,
      choices: [t`$\ln(5\ \text{kg})$`, t`$e^{-t/\tau}$, with $t$ and $\tau$ in seconds`, t`$\sin(\omega t)$, with $\omega$ in rad/s and $t$ in s`, t`$(v/c)^2$`],
      answer: 0,
      why: {
        1: t`$t/\tau$ is a pure number, so the exponential is fine.`,
        2: t`$\omega t$ is a pure number (radians are a ratio of lengths), so the sine is fine.`,
        3: t`A ratio of two speeds is a pure number; so is its square.`,
      },
      hints: [t`The input of $\ln$, $e^x$ and $\sin$ must be a pure number. Which input carries units?`],
      teach: t`Functions like $\ln$, $\exp$ and $\sin$ only take pure numbers.`,
      explain: t`$\ln(5\ \text{kg})$ would change if you switched to grams — a sign that it means nothing on its own. Logs of physical quantities always come as $\ln(m/m_0)$, a ratio, or in pairs that cancel the units.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-freefall', difficulty: 3, transfer: true,
      prompt: t`A gas cloud collapsing under its own gravity has a **free-fall time** $t_{ff}$ that depends only on $G$ ($\mathsf{M^{-1}L^{3}T^{-2}}$) and its density $\rho$ ($\mathsf{M\,L^{-3}}$). Dimensional analysis gives $t_{ff} = C\,(G\rho)^{p}$. What is $p$?`,
      answer: -0.5, tol: { rel: 0, abs: 0.01 },
      errors: [{ value: 0.5, feedback: t`$[G\rho] = \mathsf{T^{-2}}$: a time needs that to the power $-\tfrac12$, not $+\tfrac12$.` }, { value: -2, feedback: t`$(\mathsf{T^{-2}})^{p} = \mathsf{T}$ needs $-2p = 1$.` }],
      hints: [t`Multiply out $[G\rho]$: the masses and lengths cancel.`, t`$[G\rho] = \mathsf{T^{-2}}$, and you want $\mathsf{T}^{1}$.`],
      teach: t`$G\rho$ is an inverse time squared, so every gravitational collapse or orbit time scales as $1/\sqrt{G\rho}$.`,
      explain: t`$[G\rho] = \mathsf{M^{-1}L^{3}T^{-2}}\cdot\mathsf{M\,L^{-3}} = \mathsf{T^{-2}}$, so $p = -\tfrac12$: $t_{ff} = C/\sqrt{G\rho}$. For gas at the Sun’s mean density, $1410\ \text{kg/m}^3$, $1/\sqrt{G\rho} = ${Math.round(1 / Math.sqrt(G * 1410))}$ s, about an hour; the full calculation gives $C = \sqrt{3\pi/32} \approx 0.54$, about half an hour. The same $1/\sqrt{G\rho}$ sets the period of any orbit skimming a body’s surface.`,
      visual: dimBars({ groups: [{ label: 'G', e: D.G }, { label: 'ρ', e: D.rho }, { label: 'Gρ', e: [0, 0, -2] }], caption: t`The dimensions of $G$, $\rho$ and their product, in which mass and length cancel.` }),
    }),
    num({
      id: 'cp-compact', difficulty: 3, transfer: true,
      gen(r) {
        const m = r.pick([1.3, 1.4, 2.0]), R = r.pick([11, 12, 13]), ans = (G * m * M_SUN) / (R * 1000 * C * C);
        return {
          prompt: t`The dimensionless number $\dfrac{GM}{Rc^2}$ says how strongly relativistic a body’s gravity is: about $10^{-9}$ for the Earth and $0.5$ at a black hole’s horizon. Compute it for a neutron star of $${m}$ solar masses ($1$ solar mass $= 1.989\times10^{30}$ kg) and radius $${R}$ km. ($G = 6.674\times10^{-11}$ SI, $c = 2.998\times10^{8}$ m/s.)`,
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: (G * m * M_SUN) / (R * 1000 * C), feedback: t`Divide by $c^2$, not $c$: only then do the units cancel.` }, { value: (G * m * M_SUN) / (R * C * C), feedback: t`Convert the radius to metres: $${R}$ km $= ${R}\times10^{3}$ m.` }],
          hints: [t`Put everything in SI: $M = ${m}\times1.989\times10^{30}$ kg, $R = ${R}\times10^{3}$ m.`, t`Check that the units cancel: $[GM/R] = \mathsf{L^2T^{-2}}$, the same as $[c^2]$.`],
          teach: t`A dimensionless combination is a pure number in any units — the natural way to say how big an effect is.`,
          explain: t`$\dfrac{GM}{Rc^2} = \dfrac{(6.674\times10^{-11})(${tex(m * M_SUN, 4)})}{(${R}\times10^{3})(2.998\times10^{8})^2} = ${nice(sig(ans, 3))}$. A neutron star is within a factor of a few of the black-hole value $0.5$: its gravity is strongly relativistic.`,
          visual: { type: 'graph', params: { x: [-10.5, 0.5], y: [-1, 1], xlog: true, aspect: 'wide', xlabel: 'GM / Rc²', ylabel: '', yticks: 0, points: [{ x: -9.16, y: 0, color: 'accent', r: 5, label: 'Earth', labelAlign: 'center', labelDx: 0, labelDy: -16 }, { x: -5.67, y: 0, color: 'gold', r: 5, label: 'Sun', labelAlign: 'center', labelDx: 0, labelDy: -16 }, { x: -0.301, y: 0, color: 'bad', r: 5, label: 'horizon', labelAlign: 'center', labelDx: 0, labelDy: -16 }] }, caption: t`The Earth, the Sun and a black hole’s horizon on a logarithmic scale of $GM/Rc^2$.` },
        };
      },
    }),
    mcq({
      id: 'cp-dimless', difficulty: 2,
      prompt: t`A rocket of length $L$ moves at speed $v$ in gravity $g$. Which combination is dimensionless (a pure number, the same in any units)?`,
      choices: [t`$\dfrac{v^2}{gL}$`, t`$\dfrac{gL}{v}$`, t`$\dfrac{v}{gL}$`, t`$\dfrac{v^2 L}{g}$`],
      answer: 0,
      why: {
        1: t`$[gL/v] = \mathsf{L^2T^{-2}}/\mathsf{L\,T^{-1}} = \mathsf{L\,T^{-1}}$: a speed.`,
        2: t`$[v/(gL)] = \mathsf{L\,T^{-1}}/\mathsf{L^2T^{-2}} = \mathsf{L^{-1}T}$.`,
        3: t`$[v^2L/g] = \mathsf{L^2T^{-2}}\cdot\mathsf{L}\,/\,\mathsf{L\,T^{-2}} = \mathsf{L^2}$: an area.`,
      },
      hints: [t`$[gL] = \mathsf{L^2T^{-2}}$. Which has the same dimensions?`],
      teach: t`$gL$ has the dimensions of a speed squared, so $v^2/gL$ is a pure number.`,
      explain: t`$[v^2] = [gL] = \mathsf{L^2T^{-2}}$, so their ratio is a pure number. Its square root, $v/\sqrt{gL}$, is the **Froude number**, which naval architects and wind-tunnel engineers match between a model and the real thing.`,
      visual: dimBars({ groups: [{ label: 'v', e: D.v }, { label: 'g', e: D.g }, { label: 'L', e: D.L }], caption: t`The dimensions of $v$, $g$ and $L$.` }),
    }),
  ],
  sources: [
    { label: 'OpenStax University Physics Vol. 1, §1.4 Dimensional Analysis', url: 'https://openstax.org/books/university-physics-volume-1/pages/1-4-dimensional-analysis' },
    { label: 'IAU 2015 Resolution B3 (nominal solar mass parameter GM)', url: 'https://www.iau.org/static/resolutions/IAU2015_English.pdf' },
  ],
});
