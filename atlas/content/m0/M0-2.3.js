// Solving for a variable in a formula — undo the operations in reverse order.
import { lesson, mcq, num, expr } from '../../src/core/content.js';
import { nice, sig, tex } from '../../src/core/format.js';
import { N, bars, thou } from './_m0kit.js';

const t = String.raw;
const G = 6.674e-11;   // m³ kg⁻¹ s⁻², CODATA 2018
const DAY = 86400;

// Jupiter's four large moons: semi-major axis (10⁶ km) and period (days), JPL
const MOONS = [['Io', 0.4217, 1.769], ['Europa', 0.6709, 3.551], ['Ganymede', 1.0704, 7.155], ['Callisto', 1.8827, 16.689]];
const moonFig = (caption, highlight) => ({
  type: 'graph',
  params: { x: [-1.4, 1.1], y: [0.2, 2.7], xlog: true, ylog: true, aspect: 'wide', xlabel: 'a³ (10¹⁸ km³)', ylabel: 'T² (days²)',
    curves: [{ fn: `x + ${N(Math.log10(41.74))}`, color: 'ink4', dash: true }],
    points: MOONS.map(([n, a, T]) => ({ x: N(Math.log10(a ** 3)), y: N(Math.log10(T * T)), label: n, color: n === highlight ? 'accent' : 'gold', labelDx: 10, labelAlign: 'left', labelDy: 10 })) },
  caption,
});

export default lesson({
  id: 'm0.M0-2.3',
  title: 'Solving for a variable in a formula',
  minutes: 8, difficulty: 2,
  intro: t`A physics formula is an equation that can be read for any of its letters. To solve for one, **undo the operations around it in the reverse order they were applied** — doing the same thing to both sides each time. The rocket equation is the model case:

$$\Delta v = v_e \ln\frac{m_0}{m_f} \quad\Longrightarrow\quad \frac{m_0}{m_f} = e^{\Delta v / v_e}$$

Divide by $v_e$, then undo the logarithm with its inverse, the exponential. Once you can do this, every formula in a textbook is several formulas.`,
  symbols: [
    { tex: '\\Delta v', text: 'the change in velocity a rocket can make, in m/s (the mission’s “delta-v budget”)' },
    { tex: 'v_e', text: 'effective exhaust velocity, in m/s: about 3 km/s for kerosene engines, 4.4 km/s for hydrogen' },
    { tex: 'm_0', text: 'initial mass, with all propellant on board, in kg' },
    { tex: 'm_f', text: 'final mass, after the burn, in kg' },
    { tex: 'm_0/m_f', text: 'the **mass ratio**, a pure number greater than 1' },
    { tex: '\\ln', text: 'the natural logarithm, undone by $e^{(\\ )}$: $e^{\\ln x} = x$' },
  ],
  why: t`Rearranging before substituting keeps units visible, exposes how the answer scales, and lets you check limits — a habit that pays off in every physics course after this one.`,
  visual: {
    type: 'graph',
    title: 'The tyranny of the rocket equation',
    lead: t`The curve is the mass ratio $m_0/m_f = e^{\Delta v/v_e}$ against the velocity change. The dashed line marks about $9.4$ km/s, roughly what it takes to reach low Earth orbit including gravity and drag losses. Slide the exhaust velocity.`,
    tasks: [
      t`At $v_e = 3.0$ km/s (kerosene), reaching orbit needs a mass ratio near 23: about 96% of the vehicle is propellant.`,
      t`Raise $v_e$ to $4.4$ km/s (hydrogen): the ratio falls to about 8.5. Exhaust velocity sits in the exponent’s denominator, so it matters enormously.`,
      t`Halve $\Delta v$ at any $v_e$: the mass ratio is square-rooted, not halved — $e^{x/2} = \sqrt{e^x}$.`,
    ],
    params: {
      x: [0, 12], y: [0, 30], xlabel: 'Δv (km/s)', ylabel: 'mass ratio m₀/mf',
      sliders: [{ key: 've', label: t`Exhaust velocity $v_e$`, min: 2, max: 4.6, step: 0.1, value: 3, unit: t`\text{km/s}`, explain: t`How fast the exhaust leaves the nozzle, on average; set by the propellants and the nozzle.` }],
      curves: [{ fn: 'e^(x/ve)', color: 'accent' }],
      vlines: [{ x: 9.4, label: 'low Earth orbit', color: 'gold' }],
      points: [{ x: 9.4, y: 'e^(9.4/ve)', color: 'gold' }],
      readouts: [{ label: t`mass ratio at $9.4$ km/s`, expr: 'e^(9.4/ve)', digits: 3 }, { label: 'propellant share', expr: '100(1 - e^(-9.4/ve))', unit: t`\%`, digits: 3 }],
    },
    caption: t`One idealized stage with no structure limits. Real launchers stage, dropping empty tanks, precisely because one stage at these ratios cannot be built with useful payload.`,
  },
  example: {
    prompt: t`A pendulum’s period is $T = 2\pi\sqrt{L/g}$. A student times a $1.000$ m pendulum at $T = 2.006$ s. Solve for $g$, then evaluate it.`,
    visual: { type: 'graph', params: { x: [0, 2.2], y: [0, 3.2], aspect: 'wide', xlabel: 'length L (m)', ylabel: 'period T (s)', curves: [{ fn: '2pi*sqrt(x/9.81)', color: 'accent' }], points: [{ x: 1, y: 2.006, label: 'measured', color: 'gold' }] }, caption: t`$T = 2\pi\sqrt{L/g}$ with $g = 9.81\ \text{m/s}^2$, and the measured point. The formula is the small-angle approximation.` },
    steps: [
      { label: 'List the operations', text: t`Starting from $g$: divide $L$ by it, take the square root, multiply by $2\pi$. Undo them last-first.` },
      { label: 'Undo the 2π', text: t`$\dfrac{T}{2\pi} = \sqrt{\dfrac{L}{g}}$.` },
      { label: 'Undo the root', text: t`Square both sides: $\dfrac{T^2}{4\pi^2} = \dfrac{L}{g}$.` },
      { label: 'Free g', text: t`Take reciprocals of both sides and multiply by $L$: $g = \dfrac{4\pi^2 L}{T^2}$.` },
      { label: 'Evaluate', text: t`$g = \dfrac{39.48 \times 1.000}{2.006^2}$ $= \dfrac{39.48}{4.024}$ $= 9.81\ \text{m/s}^2$. Units: $\text{m}/\text{s}^2$ ✓. And $g$ falls as $T$ grows — a slower swing means weaker gravity, as on the Moon.` },
    ],
    answer: t`$g = \dfrac{4\pi^2 L}{T^2} = 9.81\ \text{m/s}^2$.`,
  },
  practice: [
    expr({
      id: 'kinematics-dx', difficulty: 2,
      prompt: t`Solve $v^2 = v_0^2 + 2a\,\Delta x$ for the displacement $\Delta x$. (Type $v_0$ as \`v_0\`.)`,
      lhs: t`\Delta x`,
      answer: '(v^2 - v_0^2)/(2a)', answerTeX: t`\dfrac{v^2 - v_0^2}{2a}`,
      vars: { v: [3, 6], v_0: [0.5, 2.5], a: [0.5, 3] },
      errors: [
        { answer: '(v - v_0)^2/(2a)', feedback: t`$v^2 - v_0^2 \ne (v - v_0)^2$: the square of a difference has a cross term. Keep $v^2 - v_0^2$ as it is.` },
        { answer: '(v^2 - v_0^2)/2*a', feedback: t`Typed as written, “/2a” means divide by 2 then multiply by $a$. Bracket the denominator: /(2a).` },
        { answer: 'v^2 - v_0^2 - 2a', feedback: t`$2a$ multiplies $\Delta x$, so it is undone by dividing, not subtracting.` },
      ],
      hints: [t`First subtract $v_0^2$ from both sides.`, t`Then divide both sides by $2a$.`],
      teach: t`Undo addition with subtraction and multiplication with division, last operation first.`,
      explain: t`$v^2 - v_0^2 = 2a\,\Delta x$, so $\Delta x = \dfrac{v^2 - v_0^2}{2a}$.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 40], aspect: 'wide', xlabel: 'Δx', ylabel: 'v²', curves: [{ fn: '4 + 3x', color: 'accent', label: 'slope 2a', labelAt: 6, labelDy: 16, labelDx: 10 }], points: [{ x: 0, y: 4, label: 'v₀²', color: 'gold' }] }, caption: t`$v^2$ against $\Delta x$ is a straight line: intercept $v_0^2$, slope $2a$ (here $v_0 = 2$, $a = 1.5$, in any consistent units).` },
    }),
    expr({
      id: 'rocket-mf', difficulty: 2,
      prompt: t`Solve the rocket equation $\Delta v = v_e \ln\dfrac{m_0}{m_f}$ for the final mass $m_f$. (Type $\Delta v$ with its key, $v_e$ as \`v_e\` and $m_0$ as \`m_0\`.)`,
      lhs: t`m_f`,
      answer: 'm_0 e^(-Δv/v_e)', answerTeX: t`m_0\,e^{-\Delta v/v_e}`,
      vars: { 'Δv': [1, 3], m_0: [1, 5], v_e: [2, 4] }, keys: [['Δv', 'Δv']],
      errors: [{ answer: 'm_0 e^(Δv/v_e)', feedback: t`That is bigger than $m_0$ — the rocket would gain mass. $\tfrac{m_0}{m_f} = e^{\Delta v/v_e}$, so $m_f = m_0 / e^{\Delta v/v_e}$.` }, { answer: 'm_0 v_e/Δv', feedback: t`Dividing by $\Delta v/v_e$ does not undo a logarithm; the exponential does: $e^{\ln x} = x$.` }],
      hints: [t`Divide by $v_e$: $\ln\dfrac{m_0}{m_f} = \dfrac{\Delta v}{v_e}$.`, t`Exponentiate both sides, then solve $\dfrac{m_0}{m_f} = e^{\Delta v/v_e}$ for $m_f$.`],
      teach: t`A logarithm is undone by exponentiating both sides: if $\ln X = Y$ then $X = e^{Y}$.`,
      explain: t`$\dfrac{m_0}{m_f} = e^{\Delta v/v_e}$, so $m_f = m_0\,e^{-\Delta v/v_e}$: the mass left falls exponentially with the velocity gained.`,
      visual: { type: 'graph', params: { x: [0, 12], y: [0, 1.1], aspect: 'wide', xlabel: 'Δv (km/s)', ylabel: 'mf/m₀', curves: [{ fn: 'e^(-x/3)', color: 'accent', label: 'vₑ = 3 km/s', labelAt: 3, labelDx: 8 }] }, caption: t`The fraction of the initial mass left after a burn, for $v_e = 3$ km/s: it decays exponentially with $\Delta v$.` },
    }),
    expr({
      id: 'kepler-mass', difficulty: 2,
      prompt: t`Kepler’s third law for a moon orbiting a planet of mass $M$ is $T^2 = \dfrac{4\pi^2 a^3}{G M}$. Solve for $M$.`,
      lhs: t`M`,
      answer: '4pi^2 a^3/(G T^2)', answerTeX: t`\dfrac{4\pi^2 a^3}{G\,T^2}`,
      vars: { a: [1, 3], G: [0.5, 2], T: [1, 3] },
      errors: [{ answer: '4pi^2 a^3 T^2/G', feedback: t`$M$ is in the denominator, so $T^2$ ends up dividing: multiply both sides by $M$ first, then divide by $T^2$.` }, { answer: '4pi^2 a^3/(G T)', feedback: t`The law has $T^2$; dividing by $T$ alone leaves a factor behind.` }],
      hints: [t`Multiply both sides by $M$: $M\,T^2 = \dfrac{4\pi^2 a^3}{G}$.`, t`Now divide both sides by $T^2$.`],
      teach: t`When the unknown is in a denominator, multiply it up first, then divide by whatever it is multiplied by.`,
      explain: t`$M T^2 = \dfrac{4\pi^2 a^3}{G}$, so $M = \dfrac{4\pi^2 a^3}{G T^2}$. Measuring one moon’s orbit weighs the planet.`,
      visual: moonFig(t`Jupiter’s four large moons, on logarithmic axes: they lie on one line of slope 1, so $T^2/a^3$ is the same for all four. That constant is $4\pi^2/(GM)$. Data: JPL; nearly circular orbits.`),
    }),
    num({
      id: 'pendulum-g', difficulty: 2,
      gen(r) {
        const L = r.pick([0.5, 0.8, 1.2, 1.5, 2.0]), gTrue = r.pick([9.78, 9.81, 9.83]);
        const T = Math.round(2 * Math.PI * Math.sqrt(L / gTrue) * 1000) / 1000;
        const g = 4 * Math.PI ** 2 * L / (T * T);
        return {
          prompt: t`A pendulum of length $L = ${L}$ m has a measured period $T = ${T.toFixed(3)}$ s. Using $T = 2\pi\sqrt{L/g}$, find $g$.`,
          answer: g, units: 'm/s^2', tol: { rel: 0.003 },
          errors: [{ value: 2 * Math.PI * L / (T * T), feedback: t`Squaring $T/(2\pi)$ squares the $2\pi$ too: $4\pi^2$.` }, { value: 4 * Math.PI ** 2 * L / T, feedback: t`Squaring both sides makes $T^2$ in the denominator, not $T$.` }],
          hints: [t`$g = \dfrac{4\pi^2 L}{T^2}$.`],
          teach: t`Rearrange symbolically first, then substitute: $g = 4\pi^2 L/T^2$.`,
          explain: t`$g = \dfrac{4\pi^2 (${L})}{${T.toFixed(3)}^2} = ${nice(sig(g, 4))}\ \text{m/s}^2$.`,
          visual: { type: 'graph', params: { x: [0, 2.3], y: [0, 3.3], aspect: 'wide', xlabel: 'length L (m)', ylabel: 'period T (s)', curves: [{ fn: '2pi*sqrt(x/9.81)', color: 'ink4', dash: true }], points: [{ x: L, y: T, label: 'measured', color: 'gold' }] }, caption: t`The measurement, with the curve for $g = 9.81\ \text{m/s}^2$ dashed for reference. Small-angle swings assumed.` },
        };
      },
    }),
    expr({
      id: 'escape-r', difficulty: 2,
      prompt: t`Escape speed from a distance $r$ is $v = \sqrt{\dfrac{2GM}{r}}$. Solve for $r$.`,
      lhs: t`r`,
      answer: '2G M/v^2', answerTeX: t`\dfrac{2GM}{v^2}`,
      vars: { G: [0.5, 2], M: [1, 3], v: [0.5, 2] },
      errors: [{ answer: 'sqrt(2G M)/v', feedback: t`Square both sides first; the square root then disappears from everything at once.` }, { answer: '2G M/v', feedback: t`Squaring both sides gives $v^2$, not $v$.` }],
      hints: [t`Square both sides: $v^2 = \dfrac{2GM}{r}$.`, t`Multiply by $r$, then divide by $v^2$.`],
      teach: t`Undo a square root by squaring both whole sides.`,
      explain: t`$v^2 = 2GM/r$, so $r = 2GM/v^2$. Set $v = c$ and this is the Schwarzschild radius, $r_s = 2GM/c^2$.`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 3], aspect: 'wide', xlabel: 'r', ylabel: 'v', yticks: 0, xticks: 0, curves: [{ fn: 'sqrt(2/x)', color: 'accent', domain: [0.2, 10] }] }, caption: t`Escape speed falls as $1/\sqrt r$: four times farther out, half the speed. Units left off; the shape is the point.` },
    }),
    mcq({
      id: 'energy-v', difficulty: 3,
      prompt: t`A probe of mass $m$ at height $h$ has total mechanical energy $E = \tfrac12 m v^2 + m g h$. Solve for its speed $v$.`,
      visual: bars({ values: [10, 4, 6], labels: ['total E', 'mgh', '½mv²'], xlabel: '', ylabel: 'energy', colors: ['ink3', 'gold', 'accent'], y: [0, 12.5], caption: t`The energy budget: kinetic energy is what is left of $E$ after the potential energy $mgh$. Proportions illustrative.` }),
      choices: [t`$v = \sqrt{\dfrac{2(E - mgh)}{m}}$`, t`$v = \sqrt{\dfrac{2E}{m}} - \sqrt{2gh}$`, t`$v = \sqrt{\dfrac{2E}{m} - gh}$`, t`$v = \dfrac{2(E - mgh)}{m}$`],
      answer: 0,
      why: {
        1: t`A square root does not split over a difference: $\sqrt{A - B} \ne \sqrt A - \sqrt B$. Take the root of the whole expression.`,
        2: t`Dividing $E - mgh$ by $\tfrac{m}{2}$ doubles both terms: $\tfrac{2E}{m} - 2gh$. The $2$ was lost on $gh$.`,
        3: t`That is $v^2$. The last step is a square root.`,
      },
      hints: [t`Subtract $mgh$ first, leaving $\tfrac12 m v^2$ alone.`, t`Then multiply by $2/m$, and take the square root of everything.`],
      teach: t`Isolate the term containing the unknown, then undo its coefficient, then its power — each step applied to the whole side.`,
      explain: t`$\tfrac12 m v^2 = E - mgh$ $\Rightarrow v^2 = \dfrac{2(E - mgh)}{m}$ $\Rightarrow v = \sqrt{\dfrac{2(E - mgh)}{m}}$, equivalently $\sqrt{2E/m - 2gh}$.`,
    }),
  ],
  checkpoint: [
    expr({
      id: 'cp-gravity-r', difficulty: 2,
      prompt: t`Newton’s law of gravitation reads $F = \dfrac{G m_1 m_2}{r^2}$. Solve for the separation $r$ (positive). Type $m_1$ as \`m_1\`.`,
      lhs: t`r`,
      answer: 'sqrt(G m_1 m_2/F)', answerTeX: t`\sqrt{\dfrac{G m_1 m_2}{F}}`,
      vars: { G: [0.5, 2], m_1: [1, 3], m_2: [1, 3], F: [0.5, 2] },
      errors: [{ answer: 'G m_1 m_2/F', feedback: t`That is $r^2$. Take the square root.` }],
      hints: [t`Multiply by $r^2$, divide by $F$, then take the square root.`],
      teach: t`Isolate $r^2$ before taking a root, and keep the positive root for a distance.`,
      explain: t`$r^2 = \dfrac{G m_1 m_2}{F}$, so $r = \sqrt{\dfrac{G m_1 m_2}{F}}$.`,
      visual: { type: 'graph', params: { x: [0, 5], y: [0, 4], aspect: 'wide', xlabel: 'r', ylabel: 'F', xticks: 0, yticks: 0, curves: [{ fn: '1/x^2', color: 'accent', domain: [0.5, 5] }] }, caption: t`The inverse-square law: doubling $r$ quarters $F$. Units left off.` },
    }),
    num({
      id: 'cp-mass-ratio', difficulty: 2, transfer: true,
      gen(r) {
        const [ve, prop] = r.pick([[3.0, 'kerosene'], [3.3, 'kerosene, vacuum-optimized'], [3.6, 'methane'], [4.4, 'hydrogen']]);
        const dv = r.pick([3.2, 4.0, 5.5, 6.0]);
        const R = Math.exp(dv / ve);
        return {
          prompt: t`An upper stage burning ${prop} has $v_e = ${ve}$ km/s and must provide $\Delta v = ${dv}$ km/s. What mass ratio $m_0/m_f$ does it need?`,
          answer: R, tol: { rel: 0.005 },
          errors: [{ value: dv / ve, feedback: t`That is $\ln(m_0/m_f)$. Exponentiate: $m_0/m_f = e^{\Delta v/v_e}$.` }],
          hints: [t`$\dfrac{m_0}{m_f} = e^{\Delta v/v_e}$.`],
          teach: t`Solve for the quantity first, then substitute: the mass ratio is $e^{\Delta v / v_e}$.`,
          explain: t`$e^{${dv}/${ve}} = e^{${nice(sig(dv / ve, 3))}} = ${nice(sig(R, 3))}$: about $${Math.round(100 * (1 - 1 / R))}\%$ of the stage’s starting mass is propellant.`,
          visual: { type: 'graph', params: { x: [0, 8], y: [0, Math.min(40, R * 1.8)], aspect: 'wide', xlabel: 'Δv (km/s)', ylabel: 'mass ratio', yticks: 0, curves: [{ fn: `e^(x/${ve})`, color: 'accent' }], vlines: [{ x: dv, label: `Δv = ${dv} km/s`, color: 'gold' }] }, caption: t`Mass ratio against $\Delta v$ for $v_e = ${ve}$ km/s, scale hidden. Gravity and drag losses are assumed to be inside the $\Delta v$ already.` },
        };
      },
    }),
    num({
      id: 'cp-jupiter', difficulty: 3, transfer: true,
      gen(r) {
        const [name, a6, Td] = r.pick(MOONS);
        const a = a6 * 1e9, T = Td * DAY, M = 4 * Math.PI ** 2 * a ** 3 / (G * T * T);
        return {
          prompt: t`${name} orbits Jupiter at $a = ${thou(a6 * 1e6)}$ km with period $T = ${Td}$ days. Using $M = \dfrac{4\pi^2 a^3}{G T^2}$ and $G = 6.674 \times 10^{-11}\ \text{m}^3\,\text{kg}^{-1}\text{s}^{-2}$, find Jupiter’s mass.`,
          answer: M, units: 'kg', tol: { rel: 0.01 },
          errors: [{ value: 4 * Math.PI ** 2 * (a6 * 1e6) ** 3 / (G * T * T), feedback: t`Convert $a$ to metres before cubing: one factor of $1000$ per kilometre, cubed is $10^9$.` }, { value: 4 * Math.PI ** 2 * a ** 3 / (G * Td * Td), feedback: t`$T$ must be in seconds to match $G$: multiply the days by $86\,400$.` }],
          hints: [t`Convert: $a$ in metres, $T$ in seconds.`, t`$a^3$ and $T^2$ are big numbers: keep them in scientific notation.`],
          teach: t`Rearranged formulas need SI inputs when a constant like $G$ is in SI units.`,
          explain: t`$a = ${tex(a, 4)}$ m and $T = ${tex(T, 4)}$ s give $M = ${tex(M, 3)}$ kg — about 318 Earth masses, the accepted value.`,
          visual: moonFig(t`${name} on the $T^2$–$a^3$ line of Jupiter’s moons. Moons’ own masses are neglected beside Jupiter’s.`, name),
        };
      },
    }),
  ],
  sources: [
    { label: 'OpenStax Algebra and Trigonometry 2e, §2.3 Models and Applications (formulas)', url: 'https://openstax.org/books/algebra-and-trigonometry-2e/pages/2-3-models-and-applications' },
    { label: 'OpenStax University Physics Vol. 1, §9.7 Rocket Propulsion', url: 'https://openstax.org/books/university-physics-volume-1/pages/9-7-rocket-propulsion' },
    { label: 'NASA/JPL Planetary Satellite Mean Elements (Galilean moons)', url: 'https://ssd.jpl.nasa.gov/sats/elem/' },
  ],
});
