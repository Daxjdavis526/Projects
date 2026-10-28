// The fundamental solution of the heat equation: the Gaussian kernel that
// starts as a spike, keeps unit area, falls to 1/e at √(4Dt) and peaks at
// 1/√(4πDt); every solution on the line is a superposition of kernels, and a
// suddenly heated surface (a heat shield) is the erfc built from them.
import { lesson, mcq, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { player, LI900, MATERIALS, SRC } from './_pde.js';

const t = String.raw;
// erfc(η) = p at η = …
const ETA = { 0.5: 0.4769, 0.2: 0.9062, 0.1: 1.1631, 0.05: 1.3859, 0.01: 1.8214 };
const kernelGraph = (D, times, caption, o = {}) => ({
  type: 'graph',
  params: { x: o.x || [-4, 4], y: o.y || [0, 1.25], aspect: 'wide', xlabel: 'x (m)', ylabel: 'Φ (1/m)',
    curves: times.map((s, i) => ({ fn: `e^(-x^2/(4*${D}*${s}))/sqrt(4*pi*${D}*${s})`, color: ['accent', 'violet', 'teal', 'warn'][i], width: 2.2, label: `t = ${s} s`, labelAt: 0.25 + 0.8 * i, labelDx: 8, labelDy: -4 })), ...o.extra },
  caption,
});
const WE = { t: 600, p: 0.1 };
WE.depth = ETA[WE.p] * Math.sqrt(4 * LI900.alpha * WE.t);

export default lesson({
  id: 'st-b.B4.2',
  title: 'The fundamental solution',
  minutes: 13, difficulty: 3,
  intro: t`Release a unit amount of heat (or dye, or probability) at one point and let it diffuse. The heat equation spreads it into a Gaussian that keeps its area while widening — the limit of lesson B4.1’s random-walk histogram:

$$\Phi(x, t) = \frac{1}{\sqrt{4\pi Dt}}\,e^{-x^2/(4Dt)}$$

This **fundamental solution** (or heat kernel) solves $u_t = D\,u_{xx}$ for $t > 0$, has $\int\Phi\,dx = 1$ at every time, and shrinks to a spike as $t \to 0$. It falls to $1/e$ of its peak at $|x| = \sqrt{4Dt}$ — the width spreads as $\sqrt{4Dt}$ — its standard deviation is $\sqrt{2Dt}$, and its peak sinks as $1/\sqrt{4\pi Dt}$. Because the equation is linear, any initial profile is a sum of spikes, so **every solution on the line is a superposition of kernels**: $u(x, t) = \int\Phi(x - y, t)\,f(y)\,dy$.`,
  symbols: [
    { tex: t`\Phi(x, t)`, text: 'the response to a unit spike at $x = 0$, $t = 0$ (units 1/m: amount per metre per unit released)' },
    { tex: 'D', text: 'the diffusivity (m²/s); for heat, $\\alpha = k/(\\rho c_p)$' },
    { tex: t`\sqrt{4Dt}`, text: 'the distance at which $\\Phi$ has fallen to $1/e$ of its peak: how far the spreading has reached' },
    { tex: t`\frac{1}{\sqrt{4\pi Dt}}`, text: 'the peak height, which falls as $1/\\sqrt t$ so that the area stays 1' },
    { tex: 'f(y)', text: 'the initial profile; $u(x, t) = \\int\\Phi(x - y, t)f(y)\\,dy$ adds up a spreading kernel for each slice of it' },
  ],
  why: t`The same construction — a solution for a point source, then superposition — gives Green’s functions (module B9), the retarded potentials of electromagnetism, and the gravitational field of linearized general relativity.`,
  visual: {
    type: 'pde-player',
    title: 'From a spike to a Gaussian',
    lead: t`Start from a narrow bump — nearly a spike — and let it diffuse. Watch the readouts: the area under the curve never changes, the spread grows as $\sqrt{w^2/2 + 2Dt}$, and the peak sinks. Change the initial shape: after a while every profile looks like the same Gaussian.`,
    tasks: [
      'Play with the narrow bump: four times the time doubles the spread.',
      'Switch to the square or the triangle: the corners vanish at once, and soon the shape is indistinguishable from a Gaussian.',
      'Double D: the same shapes appear in half the time — only the combination Dt matters.',
    ],
    params: { mode: 'heat', profile: 'gauss', w: 0.3, D: 0.5, x: [-8, 8], tmax: 6, controls: ['profile', 'D', 'w', 't'] },
    caption: t`Exact solutions on an infinite line (each initial profile convolved with the kernel). The readout’s spread is the standard deviation $\sqrt{\sigma_0^2 + 2Dt}$, with $\sigma_0$ that of the initial profile.`,
  },
  example: {
    prompt: t`At the start of entry, the outer face of a thick LI-900 tile ($\alpha \approx ${tex(LI900.alpha)}\ \text{m}^2/\text{s}$) is suddenly raised from $T_0$ to a high temperature $T_s$ and held there. Find the temperature inside, and the depth at which the rise reaches 10% of the surface rise after 10 minutes. (Use $\operatorname{erfc}(1.163) = 0.10$.)`,
    visual: { type: 'graph', params: { x: [0, 8], y: [0, 1.05], aspect: 'wide', xlabel: 'depth (cm)', ylabel: '(T − T₀)/(Tₛ − T₀)',
      curves: [60, 600, 1800].map((s, i) => ({ fn: `1 - erf(x/100/sqrt(4*${LI900.alpha}*${s}))`, color: ['accent', 'violet', 'teal'][i], label: `${s / 60} min`, labelAt: [0.5, 1.6, 3.2][i], labelDx: 8, labelDy: -4 })),
      hlines: [{ y: 0.1, label: '10%', color: 'ink3' }], points: [{ x: WE.depth * 100, y: 0.1, label: `${tex(WE.depth * 100)} cm`, color: 'gold', labelDy: -12 }] },
      caption: t`$\operatorname{erfc}\big(x/\sqrt{4\alpha t}\big)$ after 1, 10 and 30 minutes. Constant room-temperature properties: a hot tile conducts several times better, so the real soak runs deeper.` },
    steps: [
      { label: 'A step from kernels', text: t`On a whole line, start from $u = 1$ for $x < 0$ and $u = 0$ for $x > 0$. Superposing kernels: $u = \int_{-\infty}^0\Phi(x - y, t)\,dy = \tfrac12\operatorname{erfc}\!\left(\dfrac{x}{\sqrt{4Dt}}\right)$.` },
      { label: 'The surface stays put', text: t`At $x = 0$ this is $\tfrac12$ for all $t > 0$: by symmetry, the interface sits at the average. So doubling it gives a solution for $x > 0$ whose surface is held at 1 — exactly the tile with its face held hot.` },
      { label: 'Temperature inside', text: t`$\dfrac{T - T_0}{T_s - T_0} = \operatorname{erfc}\!\left(\dfrac{x}{\sqrt{4\alpha t}}\right)$. It depends on $x$ and $t$ only through $x/\sqrt{4\alpha t}$: profiles at different times are stretched copies.` },
      { label: 'The depth', text: t`Set $\operatorname{erfc}(\eta) = 0.10$: $\eta = 1.163$, so $x = 1.163\sqrt{4\alpha t} = 1.163\sqrt{4(${tex(LI900.alpha)})(600)} = ${tex(WE.depth)}$ m $\approx ${tex(WE.depth * 100)}$ cm.` },
      { label: 'Sense check', text: t`Shuttle tiles were up to about 12 cm thick where heating was worst; after a 10-minute soak the 10% front is about 4 cm in. Doubling the time moves it only $\sqrt2$ times deeper.` },
    ],
    answer: t`$(T - T_0)/(T_s - T_0) = \operatorname{erfc}\big(x/\sqrt{4\alpha t}\big)$; after 10 minutes the 10% front is about ${tex(WE.depth * 100)} cm deep.`,
  },
  practice: [
    mcq({
      id: 'which-kernel', difficulty: 2,
      prompt: t`Which of these is the fundamental solution of $u_t = D\,u_{xx}$ — a solution that keeps area 1 and starts as a spike at $x = 0$?`,
      visual: kernelGraph(0.5, [0.25, 1, 4], t`The correct kernel with $D = 0.5\ \text{m}^2/\text{s}$ at three times: narrower and taller early, wider and lower later, always with area 1.`),
      choices: [t`$\dfrac{1}{\sqrt{4\pi Dt}}e^{-x^2/(4Dt)}$`, t`$e^{-x^2/(4Dt)}$`, t`$\dfrac{1}{\sqrt{2\pi Dt}}e^{-x^2/(2Dt)}$`, t`$\dfrac{1}{4\pi Dt}e^{-x^2/(4Dt)}$`],
      answer: 0,
      why: {
        1: t`Without the factor $1/\sqrt{4\pi Dt}$ it does not solve the equation ($u_t \ne Du_{xx}$), and its area $\sqrt{4\pi Dt}$ grows with time.`,
        2: t`A properly normalized Gaussian, but with variance $Dt$: it spreads at half the right rate and does not solve $u_t = Du_{xx}$.`,
        3: t`$1/(4\pi Dt)$ is the normalization in two dimensions; in one dimension the area would be $1/\sqrt{4\pi Dt}$, not 1.`,
      },
      hints: [t`The area of $e^{-x^2/(4Dt)}$ is $\sqrt{4\pi Dt}$.`, t`The variance must be $2Dt$, as for the random walk: the exponent is $-x^2/(2\cdot 2Dt)$.`],
      teach: 'The 1D heat kernel is a Gaussian of variance 2Dt normalized to area 1.',
      explain: t`$\Phi = e^{-x^2/4Dt}/\sqrt{4\pi Dt}$: variance $2Dt$ and area 1. Substituting, $\Phi_t = \left(-\tfrac{1}{2t} + \tfrac{x^2}{4Dt^2}\right)\Phi = D\,\Phi_{xx}$.`,
    }),
    num({
      id: 'sheet-release', difficulty: 2,
      gen(r) {
        const M = r.pick([2, 5, 10]), D = r.pick([1e-5, 2e-5]), T = r.pick([60, 300, 1200]);
        const c0 = M / Math.sqrt(4 * Math.PI * D * T);
        return {
          prompt: t`A thin sheet of vapour holding $M = ${M}$ mg per square metre is released at $x = 0$ in a long, still duct, and diffuses with $D = ${tex(D)}\ \text{m}^2/\text{s}$. What is the concentration at $x = 0$ after ${T} s, in mg/m³?`,
          visual: kernelGraph(1, [0.1, 0.4, 1.6], 'The kernel’s shape at three times (illustrative units): the peak height falls as 1/√t.', { x: [-5, 5], y: [0, 1] }),
          answer: c0, units: 'mg/m^3', tol: { rel: 0.01 },
          errors: [{ value: M / Math.sqrt(2 * Math.PI * D * T), feedback: t`The variance is $2Dt$: the peak is $M/\sqrt{4\pi Dt}$.` }, { value: M / Math.sqrt(4 * D * T), feedback: t`Keep the $\pi$: $\sqrt{4\pi Dt}$.` }],
          hints: [t`$c(x, t) = M\,\Phi(x, t)$.`, t`At $x = 0$: $c = M/\sqrt{4\pi Dt}$.`],
          teach: 'An instantaneous plane source spreads as M Φ(x, t): its peak is M/√(4πDt).',
          explain: t`$c(0, t) = \dfrac{${M}}{\sqrt{4\pi(${tex(D)})(${T})}} = ${tex(c0)}$ mg/m³. Four times later, half that.`,
        };
      },
    }),
    num({
      id: 'reach', difficulty: 2,
      gen(r) {
        const m = r.pick(MATERIALS), Lmm = r.pick([5, 10, 20]);
        const L = Lmm / 1000, T = (L * L) / (4 * m.alpha);
        return {
          prompt: t`Heat is deposited in a thin plane inside a long bar of ${m.name} ($\alpha = ${tex(m.alpha)}\ \text{m}^2/\text{s}$). After how many seconds has the temperature ${Lmm} mm from the plane risen to $1/e$ of the temperature at the plane?`,
          visual: kernelGraph(1, [0.25, 1], t`The kernel at two times (illustrative units); the point where it has fallen to $1/e$ of its peak moves out as $\sqrt{4Dt}$.`, { x: [-5, 5], y: [0, 0.65], extra: { hlines: [] } }),
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (L * L) / (2 * m.alpha), feedback: t`The $1/e$ point is at $\sqrt{4\alpha t}$; $\sqrt{2\alpha t}$ is the standard deviation.` }, { value: (Lmm * Lmm) / (4 * m.alpha), feedback: 'Convert millimetres to metres.' }],
          hints: [t`$\Phi(x, t)/\Phi(0, t) = e^{-x^2/(4\alpha t)}$, which is $1/e$ when $x^2 = 4\alpha t$.`],
          teach: 'The kernel reaches 1/e of its peak at |x| = √(4Dt).',
          explain: t`$t = \dfrac{x^2}{4\alpha} = \dfrac{(${tex(L)})^2}{4(${tex(m.alpha)})} = ${tex(T)}$ s.`,
        };
      },
    }),
    num({
      id: 'gauss-spread', difficulty: 2,
      gen(r) {
        const s0 = r.pick([1, 2, 3]), D = r.pick([0.5, 1, 2]), T = r.pick([2, 4, 8]);
        const s = Math.sqrt(s0 * s0 + 2 * D * T), ratio = s0 / s;
        return {
          prompt: t`A Gaussian concentration profile of standard deviation $\sigma_0 = ${s0}$ cm diffuses with $D = ${D}\ \text{cm}^2/\text{s}$. After ${T} s, by what factor has its peak concentration fallen? (Give peak(t)/peak(0).)`,
          visual: player({ mode: 'heat', profile: 'gauss', w: 1.4, D: 0.5, t: 3, tmax: 6, x: [-8, 8], xt: false }, 'A Gaussian at a later time (solid) over its initial shape (dashed), illustrative units: same area, lower and wider.'),
          answer: ratio, tol: { rel: 0.01 },
          errors: [{ value: Math.sqrt(s0 * s0) / Math.sqrt(s0 * s0 + D * T), feedback: t`Variances add as $\sigma^2 = \sigma_0^2 + 2Dt$.` }, { value: (s0 * s0) / (s * s), feedback: 'The peak of a Gaussian scales as 1/σ, not 1/σ².' }],
          hints: [t`A Gaussian stays Gaussian with $\sigma^2 = \sigma_0^2 + 2Dt$.`, t`Area fixed, so peak $\propto 1/\sigma$: the ratio is $\sigma_0/\sigma$.`],
          teach: 'Under diffusion variances add: σ² = σ₀² + 2Dt.',
          explain: t`$\sigma = \sqrt{${s0 * s0} + 2(${D})(${T})} = ${tex(s)}$ cm, so the peak falls by $\sigma_0/\sigma = ${tex(ratio)}$.`,
        };
      },
    }),
    num({
      id: 'two-sources', difficulty: 3,
      gen(r) {
        const a = r.pick([1, 2]), D = r.pick([0.25, 0.5]), T = r.pick([1, 2]);
        const phi = (x) => Math.exp(-(x * x) / (4 * D * T)) / Math.sqrt(4 * Math.PI * D * T);
        const val = phi(a) + phi(-a);
        return {
          prompt: t`Two unit spikes start at $x = -${a}$ m and $x = ${a}$ m and diffuse with $D = ${D}\ \text{m}^2/\text{s}$. What is $u(0, ${T})$, in 1/m?`,
          visual: { type: 'graph', params: { x: [-5, 5], y: [0, 0.6], aspect: 'wide', xlabel: 'x (m)', ylabel: 'u (1/m)', curves: [
            { fn: `e^(-(x - ${a})^2/(4*${D}*${T}))/sqrt(4*pi*${D}*${T})`, color: 'violet', dash: [4, 4] },
            { fn: `e^(-(x + ${a})^2/(4*${D}*${T}))/sqrt(4*pi*${D}*${T})`, color: 'teal', dash: [4, 4] },
            { fn: `(e^(-(x - ${a})^2/(4*${D}*${T})) + e^(-(x + ${a})^2/(4*${D}*${T})))/sqrt(4*pi*${D}*${T})`, color: 'accent', width: 2.4 }] },
            caption: t`At $t = ${T}$ s: the two spreading kernels (dashed) and their sum (solid).` },
          answer: val, units: '1/m', tol: { rel: 0.01 },
          errors: [{ value: val / 2, feedback: 'Both spikes contribute equally at the midpoint: add them.' }],
          hints: [t`Linearity: $u = \Phi(x - ${a}, t) + \Phi(x + ${a}, t)$.`, t`At $x = 0$ both terms equal $e^{-${a * a}/(4\cdot${D}\cdot${T})}/\sqrt{4\pi\cdot${D}\cdot${T}}$.`],
          teach: 'Solutions of the heat equation superpose: add the kernels of separate sources.',
          explain: t`$u(0, ${T}) = 2\,\dfrac{e^{-${a * a}/${4 * D * T}}}{\sqrt{4\pi(${D})(${T})}} = ${tex(val)}$ per metre.`,
        };
      },
    }),
    num({
      id: 'similarity', difficulty: 2,
      gen(r) {
        const d1 = r.pick([1, 2, 3]), t1 = r.pick([5, 10]), k = r.pick([4, 9, 16]);
        return {
          prompt: t`After ${t1} minutes of steady surface heating, the 10% temperature-rise front in a thick slab is ${d1} cm deep. How deep is it after ${t1 * k} minutes?`,
          visual: { type: 'graph', params: { x: [0, 6], y: [0, 1.05], aspect: 'wide', xlabel: 'x / √(4αt)', ylabel: 'rise (fraction)', curves: [{ fn: '1 - erf(x)', color: 'accent', width: 2.4, domain: [0, 3] }], hlines: [{ y: 0.1, label: '10%', color: 'ink3' }] }, caption: 'Every profile collapses onto one curve when depth is measured in units of √(4αt).' },
          answer: d1 * Math.sqrt(k), units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: d1 * k, feedback: 'The front moves as √t, not t.' }],
          hints: [t`The profile depends only on $x/\sqrt{4\alpha t}$.`, t`${k} times the time means $\sqrt{${k}}$ times the depth.`],
          teach: 'Diffusion fronts move as √t: the similarity variable is x/√(4αt).',
          explain: t`$${d1}\times\sqrt{${k}} = ${d1 * Math.sqrt(k)}$ cm.`,
        };
      },
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tile-depth', difficulty: 3, transfer: true,
      gen(r) {
        const p = r.pick([0.5, 0.2, 0.05]), mins = r.pick([5, 15, 20]);
        const d = ETA[p] * Math.sqrt(4 * LI900.alpha * mins * 60);
        return {
          prompt: t`An LI-900 tile ($\alpha \approx ${tex(LI900.alpha)}\ \text{m}^2/\text{s}$) has its face suddenly held at a high temperature. After ${mins} minutes, at what depth has the temperature risen by ${p * 100}% of the surface rise? Use $\operatorname{erfc}(${ETA[p]}) = ${p}$. Answer in cm.`,
          visual: { type: 'graph', params: { x: [0, 8], y: [0, 1.05], aspect: 'wide', xlabel: 'depth (cm)', ylabel: 'rise (fraction)', curves: [{ fn: `1 - erf(x/100/sqrt(4*${LI900.alpha}*${mins * 60}))`, color: 'accent', width: 2.4 }] }, caption: t`The rise through the tile after ${mins} minutes (constant room-temperature properties).` },
          answer: d * 100, units: 'cm', tol: { rel: 0.01 },
          errors: [{ value: ETA[p] * Math.sqrt(2 * LI900.alpha * mins * 60) * 100, feedback: t`The similarity variable is $x/\sqrt{4\alpha t}$.` }, { value: ETA[p] * Math.sqrt(4 * LI900.alpha * mins) * 100, feedback: 'Convert minutes to seconds.' }],
          hints: [t`$(T - T_0)/(T_s - T_0) = \operatorname{erfc}\big(x/\sqrt{4\alpha t}\big)$.`, t`So $x = ${ETA[p]}\sqrt{4\alpha t}$ with $t$ in seconds.`],
          teach: 'A suddenly heated surface: the profile is erfc(x/√(4αt)).',
          explain: t`$x = ${ETA[p]}\sqrt{4(${tex(LI900.alpha)})(${mins * 60})} = ${tex(d)}$ m $= ${tex(d * 100)}$ cm.`,
        };
      },
    }),
    mcq({
      id: 'cp-units', difficulty: 2,
      prompt: t`What are the units of $\Phi(x, t)$, and what is $\int_{-\infty}^{\infty}\Phi\,dx$?`,
      visual: kernelGraph(0.5, [0.5, 2], t`The kernel at two times; the shaded areas are equal.`, { extra: { shade: [{ fn: 'e^(-x^2/(4*0.5*0.5))/sqrt(4*pi*0.5*0.5)', from: -4, to: 4, color: 'accent', alpha: 0.15 }, { fn: 'e^(-x^2/(4*0.5*2))/sqrt(4*pi*0.5*2)', from: -4, to: 4, color: 'violet', alpha: 0.15 }] } }),
      choices: ['1/m, and the integral is 1 at every time', '1/m, and the integral decays like 1/√t', 'dimensionless, and the integral is 1', 'm²/s, and the integral is 4πDt'],
      answer: 0,
      why: {
        1: 'The peak decays like 1/√t, but the width grows like √t: the area stays 1.',
        2: t`$1/\sqrt{4\pi Dt}$ has units $1/\sqrt{\text{m}^2} = 1/\text{m}$.`,
        3: t`$D$ has units m²/s; $\Phi$ is a density per metre.`,
      },
      hints: [t`$Dt$ has units of m².`],
      teach: 'The kernel is a density per unit length with area exactly 1: the amount released is conserved.',
      explain: t`$1/\sqrt{4\pi Dt}$ has units 1/m, the exponent is dimensionless, and $\int\Phi\,dx = 1$ for every $t > 0$ — what diffuses is neither created nor destroyed.`,
    }),
    num({
      id: 'cp-stripe', difficulty: 3, transfer: true,
      gen(r) {
        const s0mm = r.pick([0.5, 1, 2]);
        const m = MATERIALS[3];                                      // titanium
        const s0 = s0mm / 1000, T = (3 * s0 * s0) / (2 * m.alpha);
        return {
          prompt: t`A laser draws a hot stripe across a titanium thruster plate ($\alpha = ${tex(m.alpha)}\ \text{m}^2/\text{s}$). Across the stripe the temperature rise is Gaussian with $\sigma_0 = ${s0mm}$ mm. Treating the spreading as one-dimensional (across the stripe), after how many seconds has the peak rise halved?`,
          visual: player({ mode: 'heat', profile: 'gauss', w: 1, D: 0.5, t: 1.5, tmax: 3, x: [-6, 6], xt: false }, 'A Gaussian temperature rise spreading (illustrative units). A real plate also loses heat from its faces, which this ignores.'),
          answer: T, units: 's', tol: { rel: 0.01 },
          errors: [{ value: (s0 * s0) / (2 * m.alpha), feedback: t`Halving the peak needs $\sigma = 2\sigma_0$, so $2\alpha t = 3\sigma_0^2$.` }, { value: (3 * s0mm * s0mm) / (2 * m.alpha), feedback: 'Put σ₀ in metres.' }],
          hints: [t`Peak $\propto 1/\sigma$ with $\sigma^2 = \sigma_0^2 + 2\alpha t$.`, t`Halved peak: $\sigma = 2\sigma_0$, so $2\alpha t = 3\sigma_0^2$.`],
          teach: 'Variances add: the peak halves when 2αt = 3σ₀².',
          explain: t`$t = \dfrac{3\sigma_0^2}{2\alpha} = \dfrac{3(${tex(s0)})^2}{2(${tex(m.alpha)})} = ${tex(T)}$ s. A thinner stripe fades much faster: $t \propto \sigma_0^2$.`,
        };
      },
    }),
  ],
  sources: [SRC.strauss, SRC.evans, SRC.incropera, SRC.tpsx],
});
