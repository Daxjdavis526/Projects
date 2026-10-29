// Hyperbolic functions and rapidity: the rapidity φ as the hyperbolic angle
// of spacetime (β = tanh φ, γ = cosh φ, γβ = sinh φ, Doppler factor e^φ),
// rapidities adding where speeds cannot, and the propulsion hook: a rocket
// with constant proper acceleration gains rapidity linearly, φ = ατ/c, and a
// rocket of exhaust speed u gains φ = (u/c) ln(m₀/m₁). Builds on
// math1220.C2-1.9 (sinh, cosh, the sector area) and gr.S03.d (rapidities add)
// without repeating their examples; gr.S07.d used 1 g for 1–3 years, so the
// rocket numbers here avoid that.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { nice, fmt } from '../../src/core/format.js';
import { C, YEAR, g0, r6, st, rocketCurve } from './_geom.js';

const t = String.raw;
const CG = C / g0 / YEAR;                 // c/g in years (and c²/g in light-years): 0.9684

/** Speed against rapidity: β = tanh φ, with optional marks. */
const tanhGraph = ({ hlines = [], points = [], arrows = [], caption } = {}) => ({
  type: 'graph',
  params: {
    x: [0, 3.4], y: [0, 1.15], aspect: 'wide', xlabel: 'rapidity φ', ylabel: 'speed β = v/c',
    curves: [{ fn: 'tanh(x)', color: 'accent', label: 'β = tanh φ', labelAt: 2.2, labelDy: 16 }, { fn: 'x', domain: [0, 1.1], color: 'ink3', dash: true, label: 'β = φ (slow)', labelAt: 0.7, labelDx: -78, labelDy: -6 }],
    hlines: [{ y: 1, label: 'the speed of light', color: 'warn' }, ...hlines], points, arrows,
  },
  caption: caption ?? t`Speed against rapidity. For slow speeds $\beta \approx \varphi$; rapidity grows without limit while $\beta = \tanh\varphi$ stays below 1.`,
});

/** A rocket's hyperbolic worldline (years and light-years, c = 1) for proper acceleration A (in g) up to crew time T. */
function rocketDiagram({ A, T, numbers = true, newton = false, caption }) {
  const s = CG / A, p = T / s;                       // c/α in years; final rapidity
  const tE = s * Math.sinh(p), xE = s * (Math.cosh(p) - 1);
  const top = Math.max(tE * 1.15, 1), right = Math.max(xE * 1.35, 0.6 * top);
  const curves = [rocketCurve(p, 'gold', s)];
  if (newton) curves.push({ param: [`${r6(0.5 / s)}*t^2`, 't'], t: [0, r6(top)], color: 'ink3', width: 1.6, dash: true });
  return st({
    x: [-0.25 * right, right], t: [-0.05 * top, top], cones: [[0, 0, 'future']], numbers,
    lines: [{ pts: [[0, 0], [0, top * 0.97]], color: 'accent', width: 2.2, label: 'Earth', at: 0, dx: -8, dy: -20, align: 'right' }],
    events: [[xE, tE, 'engine off', 'gold', 9, 4]],
    extra: { curves },
    caption: caption ?? t`The rocket’s worldline (gold) in Earth’s frame, years up and light-years across: a hyperbola that bends toward the 45° light line but never reaches it.${newton ? ' Dashed grey: Newton’s parabola, which would cross it.' : ''}`,
  });
}

export default lesson({
  id: 'phys3710.R0.2',
  title: 'Hyperbolic functions and rapidity',
  minutes: 12, difficulty: 3,
  intro: t`On a circle, $\cos^2\theta + \sin^2\theta = 1$ and the angle $\theta$ is what rotations add. Spacetime’s “circle” is the hyperbola $t^2 - x^2 = 1$ (with $c = 1$), and its angle is the **rapidity** $\varphi$:

$$\beta = \tanh\varphi, \qquad \gamma = \cosh\varphi, \qquad \gamma\beta = \sinh\varphi$$

The identity $\cosh^2\varphi - \sinh^2\varphi = 1$ is just $\gamma^2 - \gamma^2\beta^2 = 1$. You met the functions, and the sector of area $\varphi/2$ that makes $\varphi$ an angle, in [Hyperbolic functions and their calculus](#/lesson/math1220.C2-1.9), and saw in [The Minkowski metric](#/lesson/gr.S03.d) that boosts along one line add their rapidities. Here is what that buys an engineer: **a rocket that feels a steady push gains rapidity at a steady rate**, $\varphi = \alpha\tau/c$, so its worldline is a hyperbola — and the rocket equation becomes a statement about rapidity.`,
  symbols: [
    { tex: '\\varphi', text: 'the rapidity, a pure number: the hyperbolic angle between a worldline and the time axis. It can be any size' },
    { tex: '\\beta', text: t`the speed as a fraction of light’s, $v/c$; always between $-1$ and $1$` },
    { tex: '\\gamma', text: t`the Lorentz factor $1/\sqrt{1 - \beta^2}$: how many units of your time pass per unit of the moving clock’s` },
    { tex: '\\gamma\\beta', text: t`the space part of the four-velocity: distance covered (in your frame) per unit of the moving clock’s time, in units of $c$` },
    { tex: '\\tanh,\\ \\cosh,\\ \\sinh', text: t`the hyperbolic functions: $\cosh\varphi = \tfrac12(e^{\varphi} + e^{-\varphi})$, $\sinh\varphi = \tfrac12(e^{\varphi} - e^{-\varphi})$, $\tanh = \sinh/\cosh$` },
  ],
  why: 'Rapidity turns relativistic velocity addition into ordinary addition, makes a boost a hyperbolic rotation (lesson R2.1), and makes constant-thrust spaceflight a straight line on a graph.',
  visual: {
    type: 'graph',
    title: 'A rocket with a steady push',
    lead: t`The gold hyperbola is a rocket that leaves Earth and feels a constant acceleration $\alpha$ (in units of Earth’s $g$). Dots mark every quarter-year of **crew** time. Slide the crew time and read the rapidity: it grows in proportion, $\varphi = \alpha\tau/c$, while the speed $\tanh\varphi$ creeps toward 1.`,
    tasks: [
      'Set α = 1 g and slide the crew time: each quarter-year adds the same rapidity, 0.258, while the speed gains less and less.',
      'Turn up α: the dots crowd along the worldline’s straightening tail — Earth time races ahead of crew time.',
      'Compare with Newton’s parabola (dashed grey): it crosses the light line, where Newton’s rocket would pass the speed of light. The red line is light that leaves Earth too late ever to catch the rocket.',
    ],
    params: {
      x: [-1.2, 6], y: [-0.3, 7], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x (light-years)', ylabel: 't (years, Earth)',
      sliders: [
        { key: 'A', label: t`Proper acceleration $\alpha$`, min: 0.25, max: 3, step: 0.05, value: 1, unit: t`g`, explain: t`What an accelerometer on board reads, in units of $g = 9.81\ \text{m/s}^2$. It stays constant; Earth sees the acceleration fall.` },
        { key: 'tau', label: t`Crew time $\tau$`, min: 0, max: 3, step: 0.01, value: 1.5, unit: t`\text{yr}`, explain: 'The time on the rocket’s own clock since launch.' },
      ],
      curves: [
        { fn: 'x', domain: [0, 7], color: 'warn', dash: true, width: 1.2 },
        { fn: '-x', domain: [-1.2, 0], color: 'warn', dash: true, width: 1.2 },
        { fn: `x + ${r6(CG)}/A`, color: 'bad', width: 1.4, dash: [3, 4] },
        { param: [`${r6(CG)}/A*(cosh(A*t/${r6(CG)}) - 1)`, `${r6(CG)}/A*sinh(A*t/${r6(CG)})`], t: [0, 3], color: 'gold', width: 1.2, dash: [2, 5] },
        { param: [`${r6(CG)}/A*(cosh(A*t/${r6(CG)}) - 1)`, `${r6(CG)}/A*sinh(A*t/${r6(CG)})`], t: [0, 'tau'], color: 'gold', width: 2.8 },
        { param: [`A/${r6(CG)}*t^2/2`, 't'], t: [0, 7], color: 'ink3', width: 1.4, dash: true },
        { param: ['0', 't'], t: [0, 7], color: 'accent', width: 2.2 },
      ],
      points: [
        ...[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3].map((s) => ({ x: `${r6(CG)}/A*(cosh(A*${s}/${r6(CG)}) - 1)`, y: `${r6(CG)}/A*sinh(A*${s}/${r6(CG)})`, r: 2.6, color: 'gold', when: `step(tau - ${s})` })),
        { x: `${r6(CG)}/A*(cosh(A*tau/${r6(CG)}) - 1)`, y: `${r6(CG)}/A*sinh(A*tau/${r6(CG)})`, r: 5, color: 'gold', label: 'rocket now' },
        { x: -0.15, y: 6.5, r: 0.01, color: 'accent', label: 'Earth', labelAlign: 'right' },
        { x: `A/${r6(CG)}*1.2^2/2`, y: 1.2, r: 0.01, color: 'ink3', label: 'Newton', labelDx: 8, labelDy: 12 },
      ],
      readouts: [
        { label: t`rapidity $\varphi = \alpha\tau/c$`, expr: `A*tau/${r6(CG)}`, digits: 4 },
        { label: t`speed $\beta = \tanh\varphi$`, expr: `tanh(A*tau/${r6(CG)})`, digits: 4 },
        { label: t`$\gamma = \cosh\varphi$`, expr: `cosh(A*tau/${r6(CG)})`, digits: 4 },
        { label: t`Earth time $t$`, expr: `${r6(CG)}/A*sinh(A*tau/${r6(CG)})`, digits: 4, unit: t`\text{yr}` },
        { label: t`distance $x$`, expr: `${r6(CG)}/A*(cosh(A*tau/${r6(CG)}) - 1)`, digits: 4, unit: t`\text{ly}` },
        { label: t`Newton’s speed $\alpha\tau$`, expr: `A*tau/${r6(CG)}`, digits: 4, unit: 'c' },
      ],
    },
    caption: t`Units with $c = 1$: years up, light-years across, light at 45° (dashed orange). The rocket starts from rest and its engine never varies; fuel, shielding and the interstellar medium are ignored. The red line is the asymptote of the hyperbola: light sent from Earth on or after it never reaches the rocket while it keeps accelerating.`,
  },
  example: {
    prompt: t`A probe’s engine gives it a steady proper acceleration $\alpha = 0.5g$ (what an accelerometer on board reads) for $\tau = 2$ years of its own time, starting from rest. Show that its rapidity grows as $\varphi = \alpha\tau/c$, then find its final speed, its Lorentz factor, and the Earth time and distance at engine cut-off.`,
    visual: rocketDiagram({ A: 0.5, T: 2, newton: true }),
    steps: [
      { label: 'One small step', text: t`At any instant there is a frame in which the probe is momentarily at rest. In that frame, during a short time $d\tau$ of the probe’s clock, it reaches the small speed $\alpha\,d\tau$ — slow, so Newton is right there and its rapidity is $d\varphi = \alpha\,d\tau/c$.` },
      { label: 'Rapidities add', text: t`Each small boost is measured from the frame the probe was just in, and boosts along one line add their rapidities. So $\varphi$ grows by the same $\alpha\,d\tau/c$ every instant: $\varphi = \alpha\tau/c$. **Speed** does not grow linearly — rapidity does.` },
      { label: 'The numbers', text: t`$c/\alpha = c/(0.5\times9.81\ \text{m/s}^2) = ${nice(2 * CG, 4)}$ years, so $\varphi = 2/${nice(2 * CG, 4)} = ${fmt(1 / CG, 4)}$. Then $\beta = \tanh${fmt(1 / CG, 4)} = ${fmt(Math.tanh(1 / CG), 4)}$ and $\gamma = \cosh${fmt(1 / CG, 4)} = ${fmt(Math.cosh(1 / CG), 4)}$.` },
      { label: 'Earth time and distance', text: t`$dt/d\tau = \gamma = \cosh\varphi$ and $dx/d\tau = \gamma\beta\,c = c\sinh\varphi$. Integrating with $\varphi = \alpha\tau/c$: $t = \dfrac{c}{\alpha}\sinh\dfrac{\alpha\tau}{c} = ${fmt(2 * CG * Math.sinh(1 / CG), 4)}$ yr and $x = \dfrac{c^2}{\alpha}\left(\cosh\dfrac{\alpha\tau}{c} - 1\right) = ${fmt(2 * CG * (Math.cosh(1 / CG) - 1), 4)}$ ly.` },
      { label: 'The hyperbola', text: t`Together, $(x + c^2/\alpha)^2 - (ct)^2 = (c^2/\alpha)^2$: the worldline is a hyperbola, the spacetime analogue of a circle. A body moving in a circle feels a constant inward push; a rocket on a hyperbola feels a constant forward one.` },
      { label: 'Sense check', text: t`Newton would say $v = \alpha\tau = ${fmt(1 / CG, 3)}c$ — faster than light. Relativity gives $${fmt(Math.tanh(1 / CG), 3)}c$, and for small $\alpha\tau/c$ the two agree because $\tanh\varphi \approx \varphi$.` },
    ],
    answer: t`$\varphi = ${fmt(1 / CG, 4)}$, $\beta = ${fmt(Math.tanh(1 / CG), 4)}$, $\gamma = ${fmt(Math.cosh(1 / CG), 4)}$; at cut-off Earth has aged ${fmt(2 * CG * Math.sinh(1 / CG), 3)} years and the probe is ${fmt(2 * CG * (Math.cosh(1 / CG) - 1), 3)} light-years out.`,
  },
  practice: [
    num({
      id: 'phi-from-beta', difficulty: 1,
      gen(r) {
        const [b, k, bt] = r.pick([[0.6, 2, '0.6'], [0.8, 3, '0.8'], [0.28, 4 / 3, '0.28'], [12 / 13, 5, t`\tfrac{12}{13}`], [0.96, 7, '0.96']]);
        const ans = Math.log(k);
        return {
          prompt: t`What is the rapidity of a spacecraft moving at $\beta = ${bt}$? Use $\varphi = \operatorname{artanh}\beta = \tfrac12\ln\dfrac{1 + \beta}{1 - \beta}$.`,
          visual: tanhGraph({ hlines: [{ y: r6(b), label: `β = ${nice(b, 3)}`, color: 'gold' }], caption: t`The speed $\beta = ${bt}$ (gold line) meets the curve $\beta = \tanh\varphi$ at the rapidity you want.` }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: b, feedback: t`$\varphi \approx \beta$ only for slow speeds. At $${bt}$ the curve has bent well away from the dashed line: use the logarithm.` }],
          hints: [t`$\dfrac{1 + \beta}{1 - \beta} = ${nice((1 + b) / (1 - b), 4)}$.`, t`Take half its natural logarithm: $\tfrac12\ln${nice((1 + b) / (1 - b), 4)} = \ln${nice(k, 4)}$.`],
          teach: 'Rapidity is artanh β = ½ ln[(1 + β)/(1 − β)]; it equals β only at low speed.',
          explain: t`$\varphi = \tfrac12\ln${nice((1 + b) / (1 - b), 4)} = \ln ${nice(k, 4)} = ${fmt(ans, 4)}$, larger than $\beta = ${nice(b, 3)}$. Then $e^{\varphi} = ${nice(k, 4)}$: the Doppler factor for light from a source approaching at this speed.`,
        };
      },
    }),
    num({
      id: 'relay', difficulty: 2,
      gen(r) {
        const [[b1, k1, s1], [b2, k2, s2]] = r.pick([
          [[0.28, 4 / 3, '0.28'], [0.8, 3, '0.8']], [[5 / 13, 1.5, t`\tfrac{5}{13}`], [12 / 13, 5, t`\tfrac{12}{13}`]],
          [[0.28, 4 / 3, '0.28'], [0.96, 7, '0.96']], [[5 / 13, 1.5, t`\tfrac{5}{13}`], [0.96, 7, '0.96']],
        ]);
        const K = k1 * k2, f0 = 8.4, ans = f0 / K;
        const beta = (K * K - 1) / (K * K + 1);
        return {
          prompt: t`Mission control transmits at $f_0 = ${f0}$ GHz to a relay ship that recedes at $\beta_1 = ${s1}$. The relay rebroadcasts at exactly the frequency it receives to a probe receding from **it** at $\beta_2 = ${s2}$. A source and receiver separating with rapidity $\varphi$ shift the frequency by the factor $e^{-\varphi}$. What frequency does the probe receive?`,
          visual: tanhGraph({
            arrows: [{ from: [0, 0.07], to: [r6(Math.log(k1)), 0.07], color: 'gold', label: 'φ₁', labelDy: -6 }, { from: [r6(Math.log(k1)), 0.07], to: [r6(Math.log(K)), 0.07], color: 'violet', label: 'φ₂', labelDy: -6 }],
            caption: t`The two rapidities laid end to end along the axis (gold, then violet). The combined speed is read from the curve above their sum.`,
          }),
          answer: ans, units: 'GHz', tol: { rel: 0.005 },
          errors: [{ value: f0 * Math.sqrt((1 - beta) / (1 + beta)) * K * K, feedback: 'Receding lowers the frequency: multiply by $e^{-\\phi}$, which is less than 1.' }, { value: f0 / (k1 + k2), feedback: 'Doppler factors do not add: the relay passes on a frequency already reduced by its own factor, so the two factors multiply.' }],
          hints: [t`$e^{\varphi_1} = \sqrt{\dfrac{1 + \beta_1}{1 - \beta_1}} = ${nice(k1, 4)}$ and $e^{\varphi_2} = ${nice(k2, 4)}$.`, t`The rapidities add, so the factors multiply: $f = f_0\,e^{-(\varphi_1 + \varphi_2)} = ${f0}/(${nice(k1, 4)}\times${nice(k2, 4)})$.`],
          teach: t`Doppler factors are $e^{\varphi}$, so when rapidities add along a line, Doppler factors multiply.`,
          explain: t`$f = ${f0}\ \text{GHz}/${nice(K, 4)} = ${nice(ans, 4)}$ GHz. The probe recedes from Earth with rapidity $\ln${nice(K, 4)}$, i.e. at $\beta = (K^2 - 1)/(K^2 + 1) = ${fmt(beta, 4)}$, and a single direct link at that speed gives the same frequency — the relay changes nothing.`,
        };
      },
    }),
    num({
      id: 'sector', difficulty: 2,
      gen(r) {
        const A = r.pick([0.2, 0.35, 0.55, 0.8]);
        const p = 2 * A, ans = Math.tanh(p);
        return {
          prompt: t`On a spacetime diagram ($c = 1$) the gold time axis of a moving observer meets the hyperbola $t^2 - x^2 = 1$. The shaded sector between your time axis, the hyperbola and the gold axis has area ${A} (in the diagram’s units). How fast does the observer move, as a fraction of $c$?`,
          visual: {
            type: 'graph',
            params: {
              x: [-1.6, 2.6], y: [-0.2, 3.2], equal: true, aspect: 'square', axesAt: 'edge', xlabel: 'x', ylabel: 't',
              curves: [{ fn: 'sqrt(1 + x^2)', color: 'accent' }, { fn: 'x', color: 'warn', dash: true, width: 1.2 }, { fn: '-x', color: 'warn', dash: true, width: 1.2 },
                { param: [`${r6(Math.sinh(p))}*t`, `${r6(Math.cosh(p))}*t`], t: [0, 2.6], color: 'gold', width: 2.4 }],
              shade: [{ fn: 'sqrt(1 + x^2)', lower: `x/${r6(Math.tanh(p))}`, from: 0, to: r6(Math.sinh(p)), color: 'gold', alpha: 0.35 }],
              points: [{ x: 0.05, y: 2.9, r: 0.01, color: 'gold', label: 'moving observer’s t′ axis' }],
            },
            caption: t`The unit hyperbola $t^2 - x^2 = 1$ (blue), light (dashed) and the moving observer’s time axis (gold). The shaded hyperbolic sector measures the rapidity.`,
          },
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: Math.tanh(A), feedback: t`The sector’s area is $\varphi/2$, not $\varphi$, just as a circular sector of angle $\theta$ has area $\theta/2$.` }, { value: p, feedback: t`$2\times${A}$ is the rapidity. The speed is its hyperbolic tangent.` }],
          hints: [t`A hyperbolic sector of the unit hyperbola has area $\varphi/2$.`, t`$\varphi = 2\times${A} = ${nice(p, 3)}$; then $\beta = \tanh\varphi$.`],
          teach: 'The rapidity is a genuine angle: twice the area of the hyperbolic sector it cuts from the unit hyperbola.',
          explain: t`$\varphi = ${nice(p, 3)}$ and $\beta = \tanh${nice(p, 3)} = ${fmt(ans, 4)}$. The gold axis passes through $(\sinh\varphi, \cosh\varphi) = (\gamma\beta, \gamma)$, the event where the observer’s clock reads 1.`,
        };
      },
    }),
    expr({
      id: 'doppler-beta', difficulty: 2,
      prompt: t`Show that the Doppler factor $e^{\varphi}$ depends on the speed alone: use $e^{\varphi} = \cosh\varphi + \sinh\varphi = \gamma + \gamma\beta$ and write it in terms of $\beta$, without any $\gamma$.`,
      visual: {
        type: 'graph',
        params: {
          x: [-2, 2], y: [-2.5, 5], aspect: 'wide', xlabel: 'φ', ylabel: '',
          curves: [{ fn: 'cosh(x)', color: 'accent', label: 'cosh φ', labelAt: -1.7, labelDx: 4, labelDy: -10 }, { fn: 'sinh(x)', color: 'violet', label: 'sinh φ', labelAt: 1.45, labelDx: 8, labelDy: 10 }, { fn: 'e^x', color: 'gold', width: 2.8, label: 'exp φ = cosh φ + sinh φ', labelAt: 1.2, labelDx: -150, labelDy: -6 }],
        },
        caption: t`At every $\varphi$ the gold curve is the sum of the blue and violet ones: $e^{\varphi} = \cosh\varphi + \sinh\varphi$.`,
      },
      answer: 'sqrt((1 + beta)/(1 - beta))', answerTeX: t`\sqrt{\frac{1 + \beta}{1 - \beta}}`, lhs: 'e^{\\varphi}',
      vars: { beta: [-0.9, 0.9] },
      errors: [{ answer: 'sqrt((1 - beta)/(1 + beta))', feedback: t`That is $e^{-\varphi}$, the factor for a receding source. With $\beta > 0$, $\gamma + \gamma\beta$ is larger than 1.` }, { answer: '1 + beta', feedback: t`You dropped the $\gamma$: $\gamma(1 + \beta)$, with $\gamma = 1/\sqrt{1 - \beta^2}$.` }],
      hints: [t`$\gamma + \gamma\beta = \dfrac{1 + \beta}{\sqrt{1 - \beta^2}}$.`, t`Write $1 - \beta^2 = (1 - \beta)(1 + \beta)$ and cancel one $\sqrt{1 + \beta}$.`],
      teach: t`$e^{\varphi} = \gamma(1 + \beta) = \sqrt{(1 + \beta)/(1 - \beta)}$: the relativistic Doppler factor is the exponential of the rapidity.`,
      explain: t`$\gamma(1 + \beta) = \dfrac{1 + \beta}{\sqrt{(1 - \beta)(1 + \beta)}} = \sqrt{\dfrac{1 + \beta}{1 - \beta}}$, the Doppler factor for an approaching source. Taking logarithms gives back $\varphi = \tfrac12\ln\frac{1 + \beta}{1 - \beta}$.`,
    }),
    num({
      id: 'rocket-speed', difficulty: 2,
      gen(r) {
        const [A, T] = r.pick([[0.5, 0.5], [0.5, 1.5], [1.5, 1.5], [2.5, 0.5], [1.5, 1]]);
        const p = (A * T) / CG, ans = Math.tanh(p);
        return {
          prompt: t`A cargo drone accelerates from rest with a steady proper acceleration of $${A}g$ for ${T} year${T === 1 ? '' : 's'} of its own time. How fast is it then moving relative to its launch frame, as a fraction of $c$? ($c/g = ${fmt(CG, 4)}$ years.)`,
          visual: rocketDiagram({ A, T, numbers: false, caption: t`The drone’s hyperbolic worldline, years up and light-years across with $c = 1$ (numbers hidden). Its tangent at cut-off tilts toward the 45° light line by the rapidity.` }),
          answer: ans, tol: { rel: 0.003 },
          errors: [...(p < 1 ? [{ value: p, feedback: t`That is Newton’s $\alpha\tau/c$ — the rapidity, not the speed. The speed is $\tanh\varphi$.` }] : [])],
          hints: [t`The rapidity grows linearly with crew time: $\varphi = \alpha\tau/c = ${A}\times${T}/${fmt(CG, 4)}$.`, t`$\varphi = ${fmt(p, 4)}$; the speed is $\tanh\varphi$.`],
          teach: 'Constant proper acceleration means constant rate of rapidity: φ = ατ/c and β = tanh(ατ/c).',
          explain: t`$\varphi = ${fmt(p, 4)}$, so $\beta = \tanh${fmt(p, 4)} = ${fmt(ans, 4)}$.${p >= 1 ? ` Newton’s $\\alpha\\tau = ${fmt(p, 3)}c$ would already exceed light.` : ''}`,
        };
      },
    }),
    num({
      id: 'rocket-equation', difficulty: 3,
      gen(r) {
        const [b, u, us, b0] = r.pick([[0.6, 0.1, '0.1', '0.6'], [0.5, 0.1, '0.1', '0.5'], [0.8, 0.1, '0.1', '0.8'], [0.2, 0.05, '0.05', '0.2']]);
        const ans = Math.exp(Math.atanh(b) / u), newton = Math.exp(b / u);
        return {
          prompt: t`For a rocket whose exhaust leaves at speed $u$ relative to it, the momentum balance in its momentary rest frame gives $d\varphi = -(u/c)\,dm/m$, where $m$ is its rest mass. Integrated: $\varphi = \dfrac{u}{c}\ln\dfrac{m_0}{m_1}$. A hypothetical probe (beyond any engine yet designed) with exhaust at $u = ${us}c$ must reach $${b0}c$. What mass ratio $m_0/m_1$ does it need?`,
          visual: {
            type: 'graph',
            params: {
              x: [0, 0.95], y: [0, 5], aspect: 'wide', ylog: true, xlabel: 'final speed β', ylabel: 'mass ratio m₀/m₁',
              curves: [{ fn: `log10(e)*0.5*ln((1 + x)/(1 - x))/${u}`, color: 'gold', label: 'relativistic', labelAt: 0.5, labelDx: -10, labelDy: -14, labelAlign: 'right' }, { fn: `log10(e)*x/${u}`, color: 'ink3', dash: true, label: 'Tsiolkovsky (Newton)', labelAt: 0.6, labelDx: 8, labelDy: 12 }],
            },
            caption: t`Mass ratio against final speed for exhaust at $${us}c$, on a logarithmic scale. Newton’s rocket equation (dashed) uses $v$ where relativity uses the rapidity. No engine yet built comes within a hundred times this exhaust speed.`,
          },
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: newton, feedback: t`That is Tsiolkovsky’s Newtonian $e^{v/u}$. Relativity replaces $v/c$ by the rapidity $\operatorname{artanh}\beta$, which is larger.` }],
          hints: [t`$\varphi = \operatorname{artanh}${b0} = ${fmt(Math.atanh(b), 4)}$.`, t`$m_0/m_1 = e^{\varphi c/u} = e^{${fmt(Math.atanh(b), 4)}/${us}}$.`],
          teach: 'The relativistic rocket equation is Tsiolkovsky’s with speed replaced by rapidity: φ = (u/c) ln(m₀/m₁).',
          explain: t`$m_0/m_1 = \exp\!\left(${fmt(Math.atanh(b), 4)}/${us}\right) = ${nice(ans, 4)}$, against Newton’s $${nice(newton, 4)}$. Because $e^{\varphi} = \sqrt{(1 + \beta)/(1 - \beta)}$, the exact answer is $\left(\frac{1 + \beta}{1 - \beta}\right)^{c/2u}$.`,
        };
      },
    }),
    code({
      id: 'boost-by-boost', difficulty: 3,
      prompt: t`Build the constant-acceleration rocket out of many tiny boosts. Finish \`rocket(alpha, tau_end, n)\`: split the crew time into \`n\` steps of \`dtau\`. In each step, the rocket gains speed \`db = alpha*dtau/C\` in its momentary rest frame, which you combine with its current speed by velocity addition, $\beta \leftarrow (\beta + d\beta)/(1 + \beta\,d\beta)$. Advance Earth time and distance with the average of $\gamma$ and $\gamma\beta c$ over the step. Return NumPy arrays \`t\`, \`x\`, \`beta\` with \`n + 1\` entries each. The program then compares the end point with the hyperbola.`,
      starter: t`import numpy as np

C = 299792458.0            # m/s
YEAR = 365.25 * 86400      # s

def rocket(alpha, tau_end, n):
    dtau = tau_end / n
    t = np.zeros(n + 1)
    x = np.zeros(n + 1)
    beta = np.zeros(n + 1)
    db = alpha * dtau / C
    for k in range(n):
        b = beta[k]
        # new speed by relativistic velocity addition
        # Earth time and distance: average gamma and gamma*beta*C over the step
        pass
    return t, x, beta

alpha, tau = 0.5 * 9.81, 2 * YEAR
t, x, beta = rocket(alpha, tau, 2000)
phi = alpha * tau / C
print("beta  numeric", beta[-1], " tanh(phi)", np.tanh(phi))
print("x (ly) numeric", x[-1] / (C * YEAR), " closed form", C**2 / alpha * (np.cosh(phi) - 1) / (C * YEAR))
`,
      answer: t`import numpy as np

C = 299792458.0            # m/s
YEAR = 365.25 * 86400      # s

def rocket(alpha, tau_end, n):
    dtau = tau_end / n
    t = np.zeros(n + 1)
    x = np.zeros(n + 1)
    beta = np.zeros(n + 1)
    db = alpha * dtau / C
    for k in range(n):
        b = beta[k]
        b_new = (b + db) / (1 + b * db)
        g0, g1 = 1 / np.sqrt(1 - b**2), 1 / np.sqrt(1 - b_new**2)
        beta[k + 1] = b_new
        t[k + 1] = t[k] + 0.5 * (g0 + g1) * dtau
        x[k + 1] = x[k] + 0.5 * (g0 * b + g1 * b_new) * C * dtau
    return t, x, beta

alpha, tau = 0.5 * 9.81, 2 * YEAR
t, x, beta = rocket(alpha, tau, 2000)
phi = alpha * tau / C
print("beta  numeric", beta[-1], " tanh(phi)", np.tanh(phi))
print("x (ly) numeric", x[-1] / (C * YEAR), " closed form", C**2 / alpha * (np.cosh(phi) - 1) / (C * YEAR))
`,
      tests: [
        { name: 'rocket returns three arrays of n + 1 entries', code: 'all(len(a) == 2001 for a in rocket(alpha, tau, 2000))' },
        { name: 'the final speed is tanh(ατ/c)', code: 'abs(rocket(alpha, tau, 2000)[2][-1] - np.tanh(alpha*tau/C)) < 1e-6' },
        { name: 'Earth time matches (c/α) sinh(ατ/c) to 1 part in 10⁴', code: 'abs(rocket(alpha, tau, 2000)[0][-1] / (C/alpha*np.sinh(alpha*tau/C)) - 1) < 1e-4' },
        { name: 'distance matches (c²/α)(cosh(ατ/c) − 1) to 1 part in 10⁴', code: 'abs(rocket(alpha, tau, 2000)[1][-1] / (C**2/alpha*(np.cosh(alpha*tau/C) - 1)) - 1) < 1e-4' },
        { name: 'it works for another rocket (2g for half a year)', code: 'abs(rocket(2*9.81, 0.5*YEAR, 3000)[2][-1] - np.tanh(2*9.81*0.5*YEAR/C)) < 1e-6' },
      ],
      hints: [
        t`Inside the loop: \`b_new = (b + db) / (1 + b * db)\`, then \`beta[k + 1] = b_new\`.`,
        t`With \`g0 = 1/np.sqrt(1 - b**2)\` and \`g1\` the same for \`b_new\`: \`t[k + 1] = t[k] + 0.5*(g0 + g1)*dtau\` and \`x[k + 1] = x[k] + 0.5*(g0*b + g1*b_new)*C*dtau\`.`,
      ],
      teach: 'Many small boosts, each added by the velocity-addition rule, build exactly the hyperbola: rapidity is what accumulates.',
      explain: t`Each step adds rapidity $\operatorname{artanh}(d\beta) \approx \alpha\,d\tau/c$, so after $n$ steps $\varphi = \alpha\tau/c$ to within $(d\beta)^2/3$ per step — that is why the speed agrees with $\tanh(\alpha\tau/c)$ to many digits. The time and distance carry the small error of the trapezoid rule. The program prints $\beta \approx ${fmt(Math.tanh(1 / CG), 5)}$ and $x \approx ${fmt(2 * CG * (Math.cosh(1 / CG) - 1), 5)}$ ly, matching the worked example.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-time-to-speed', difficulty: 2, transfer: true,
      gen(r) {
        const [b, bs] = r.pick([[0.9, '0.9'], [0.99, '0.99'], [0.5, '0.5']]);
        const A = r.pick([1, 2]);
        const ans = (CG / A) * Math.atanh(b);
        return {
          prompt: t`A crewed ship accelerates from rest at a steady $${A}g$, as felt on board. How much crew time passes before it moves at $${bs}c$ relative to its launch frame? ($c/g = ${fmt(CG, 4)}$ years.)`,
          visual: tanhGraph({ hlines: [{ y: b, label: `β = ${bs}`, color: 'gold' }], caption: t`Speed against rapidity. The ship’s rapidity grows steadily with crew time; the gold line is the target speed.` }),
          answer: ans, units: 'yr', tol: { rel: 0.005 },
          errors: [{ value: (CG / A) * b, feedback: t`That is Newton’s time $v/\alpha$. Rapidity, not speed, grows at the rate $\alpha/c$: $\tau = (c/\alpha)\operatorname{artanh}\beta$.` }],
          hints: [t`$\varphi = \alpha\tau/c$, so $\tau = (c/\alpha)\,\varphi$ with $\varphi = \operatorname{artanh}${bs}$.`],
          teach: 'Crew time to reach speed β at constant proper acceleration α is (c/α) artanh β.',
          explain: t`$\varphi = \operatorname{artanh}${bs} = ${fmt(Math.atanh(b), 4)}$, so $\tau = ${fmt(CG / A, 4)}\times${fmt(Math.atanh(b), 4)} = ${fmt(ans, 4)}$ years of crew time.`,
        };
      },
    }),
    mcq({
      id: 'cp-what-adds', difficulty: 2,
      prompt: 'A ship launches a probe straight ahead, and the probe launches a smaller probe straight ahead. To find the last probe’s motion relative to the ship’s launch frame, which quantity do you simply add over the three stages?',
      visual: tanhGraph({ arrows: [{ from: [0, 0.07], to: [0.7, 0.07], color: 'gold' }, { from: [0.7, 0.07], to: [1.4, 0.07], color: 'violet' }, { from: [1.4, 0.07], to: [2.1, 0.07], color: 'teal' }], caption: 'Three equal boosts laid end to end along the horizontal axis.' }),
      choices: [t`The rapidities $\varphi$`, t`The speeds $\beta$`, t`The Lorentz factors $\gamma$`, t`The Doppler factors $e^{\varphi}$`],
      answer: 0,
      why: {
        1: 'Adding speeds can exceed c; it is only approximately right at low speed.',
        2: t`$\gamma$ of a combined boost is $\gamma_1\gamma_2(1 + \beta_1\beta_2)$, not a sum.`,
        3: t`Doppler factors $e^{\varphi}$ **multiply**, because their exponents — the rapidities — add.`,
      },
      hints: ['Which quantity is the “angle” of a boost?'],
      teach: 'Collinear boosts compose by adding rapidities; speeds combine by tanh of the sum, and Doppler factors multiply.',
      explain: t`$\varphi_{\text{total}} = \varphi_1 + \varphi_2 + \varphi_3$, and then $\beta = \tanh\varphi_{\text{total}}$, $\gamma = \cosh\varphi_{\text{total}}$ and the Doppler factor is the product $e^{\varphi_1}e^{\varphi_2}e^{\varphi_3}$.`,
    }),
    num({
      id: 'cp-photon-rocket', difficulty: 3, transfer: true,
      gen(r) {
        const [b, bs] = r.pick([[0.9, '0.9'], [0.6, '0.6'], [0.99, '0.99']]);
        const ans = Math.sqrt((1 + b) / (1 - b));
        return {
          prompt: t`A photon rocket uses light itself as exhaust, $u = c$, so its rapidity is $\varphi = \ln(m_0/m_1)$. What mass ratio $m_0/m_1$ brings it from rest to $${bs}c$?`,
          visual: tanhGraph({ hlines: [{ y: b, label: `β = ${bs}`, color: 'gold' }], caption: t`Speed against rapidity; for a photon rocket the rapidity is the logarithm of the mass ratio. A photon rocket remains a paper design.` }),
          answer: ans, tol: { rel: 0.005 },
          errors: [{ value: Math.exp(b), feedback: t`That uses Newton’s $v/u$ in place of the rapidity. $\varphi = \operatorname{artanh}${bs}$.` }, { value: (1 + b) / (1 - b), feedback: t`$e^{\varphi} = \sqrt{(1 + \beta)/(1 - \beta)}$ — you forgot the square root (the ½ in $\operatorname{artanh}$).` }],
          hints: [t`$m_0/m_1 = e^{\varphi}$ with $\varphi = \operatorname{artanh}${bs}$.`, t`$e^{\operatorname{artanh}\beta} = \sqrt{(1 + \beta)/(1 - \beta)}$.`],
          teach: t`For a photon rocket the mass ratio is the Doppler factor $e^{\varphi} = \sqrt{(1 + \beta)/(1 - \beta)}$.`,
          explain: t`$m_0/m_1 = \sqrt{(1 + ${bs})/(1 - ${bs})} = ${fmt(ans, 4)}$. Even with perfect conversion of mass into light, stopping at the destination squares this ratio.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Hartle, Gravity, §5.3 (boosts and rapidity) and §5.6 (accelerated motion)', url: 'https://web.physics.ucsb.edu/~gravitybook/' },
    { label: 'Taylor & Wheeler, Spacetime Physics (2nd ed.), ch. 1 and L.10 (rapidity)', url: 'https://www.eftaylor.com/spacetimephysics/' },
    { label: 'The relativistic rocket equation (Ackeret 1946): an overview with references', url: 'https://en.wikipedia.org/wiki/Relativistic_rocket' },
  ],
});
