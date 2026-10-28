// Energy conservation for the wave equation: E = ½∫(u_t² + c²u_x²) dx is
// constant, by one integration by parts, whenever the ends do no work.
// Equipartition in travelling pulses, exchange in standing waves, loss with
// damping, and uniqueness as a corollary.
import { lesson, mcq, multi, num } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { player, SRC } from './_pde.js';

const t = String.raw;
const SQ = Math.sqrt(Math.PI) / (2 * Math.SQRT2);       // ∫ for the Gaussian pluck: E = c²A²·SQ/w

// worked example: a Gaussian pluck on a cable
const WE = { A: 0.02, w: 0.5, c: 50, mu: 0.01 };
WE.E = (WE.c ** 2 * WE.A ** 2 * SQ) / WE.w;
WE.J = WE.mu * WE.E;

export default lesson({
  id: 'st-b.B3.4',
  title: 'Energy conservation for waves',
  minutes: 12, difficulty: 3,
  intro: t`A vibrating string carries kinetic energy $\tfrac12\mu u_t^2$ per metre and, because it is stretched when it slopes, potential energy $\tfrac12F_T u_x^2$ per metre. Dividing by $\mu$, the wave equation conserves

$$E(t) = \frac12\int\big(u_t^2 + c^2u_x^2\big)\,dx$$

Proof in one line: $\dfrac{dE}{dt} = \int\big(u_tu_{tt} + c^2u_xu_{xt}\big)dx$. Integrate the second term by parts: $\int c^2u_xu_{xt}\,dx = \big[c^2u_xu_t\big] - \int c^2u_{xx}u_t\,dx$. So $\dfrac{dE}{dt} = \int u_t\big(u_{tt} - c^2u_{xx}\big)dx + \big[c^2u_xu_t\big]_{\text{ends}} = 0$: the integral vanishes by the PDE, and the **boundary term** vanishes when the ends do no work — fixed ($u_t = 0$), free ($u_x = 0$) or far away where nothing has arrived. Energy only moves around: in a travelling pulse it is shared equally between motion and stretch; in a standing wave it sloshes between them.`,
  symbols: [
    { tex: 'E(t)', text: 'the total energy divided by the linear density $\\mu$ (units m³/s²); multiply by $\\mu$ for joules' },
    { tex: t`\tfrac12u_t^2`, text: 'kinetic energy density (per unit $\\mu$): the motion of the string' },
    { tex: t`\tfrac12c^2u_x^2`, text: 'potential energy density (per unit $\\mu$): the extra stretch of a sloping string, $F_T u_x^2/2$ per metre' },
    { tex: t`\big[c^2u_xu_t\big]_{\text{ends}}`, text: 'the power flowing in through the ends (per unit $\\mu$): the work done there by the tension' },
  ],
  why: t`The same integration by parts proves that the wave equation has only one solution for given data (B6), underlies the energy carried away by gravitational waves, and is what numerical relativists monitor to catch a simulation going wrong.`,
  visual: {
    type: 'pde-player',
    title: 'Where the energy is',
    lead: t`The gold shading under the axis is the energy density $\tfrac12(u_t^2 + c^2u_x^2)$; the readout splits the total into kinetic and potential parts. Play and watch the parts change while the total stays fixed.`,
    tasks: [
      'Displace the string: at t = 0 all the energy is potential (the string is still). Once the halves part, kinetic and potential are equal.',
      'Strike it: now it starts all kinetic. The plateau left behind is flat and still, so it holds no energy at all — everything rides on the moving fronts.',
      'Try one pulse moving right: kinetic equals potential at every moment.',
    ],
    params: { mode: 'wave', init: 'pluck', profile: 'gauss', w: 1, c: 2, x: [-12, 12], tmax: 5, energy: true, controls: ['init', 'profile', 'c', 't'] },
    caption: t`Exact d’Alembert solution on an infinite string; energies are integrals over the whole line, per unit linear density. A square pulse has infinite energy in this model (its slope is infinite at the jumps), so its energy readout shows ∞.`,
  },
  example: {
    prompt: t`A cable with $\mu = ${WE.mu}$ kg/m and wave speed $c = ${WE.c}$ m/s is pulled into the shape $u = A e^{-x^2/w^2}$ with $A = ${WE.A * 100}$ cm and $w = ${WE.w}$ m, and released from rest. How much energy does the pluck put in, and how is it shared once the two halves have separated?`,
    visual: player({ mode: 'wave', init: 'pluck', profile: 'gauss', A: 1, w: 1, c: 2, t: 3, tmax: 4, x: [-10, 10], energy: true, halves: true, readout: true }, t`The same kind of pluck in illustrative units, after the halves have separated: the energy density (gold) rides with the pulses, and kinetic equals potential.`),
    steps: [
      { label: 'At release', text: t`$u_t = 0$, so all the energy is potential: $E = \tfrac12c^2\int f'^2\,dx$ with $f' = -\dfrac{2x}{w^2}A e^{-x^2/w^2}$.` },
      { label: 'The integral', text: t`$\int f'^2\,dx = \dfrac{4A^2}{w^4}\int x^2e^{-2x^2/w^2}dx = \dfrac{4A^2}{w^4}\cdot\dfrac{\sqrt\pi\,w^3}{4\sqrt2} = \dfrac{\sqrt\pi\,A^2}{\sqrt2\,w}$, using $\int x^2e^{-ax^2}dx = \dfrac{\sqrt\pi}{2a^{3/2}}$ with $a = 2/w^2$.` },
      { label: 'In joules', text: t`$E = \dfrac{\sqrt\pi\,c^2A^2}{2\sqrt2\,w} = ${tex(WE.E)}\ \text{m}^3/\text{s}^2$, and $\mu E = ${tex(WE.J)}$ J $\approx ${tex(WE.J * 1000)}$ mJ. Since $\mu c^2 = F_T$, this is $F_T\sqrt\pi A^2/(2\sqrt2 w)$: the work done stretching the cable into the bump.` },
      { label: 'Two halves', text: t`By symmetry each half carries $E/2$.` },
      { label: 'Equipartition', text: t`Each half is a travelling wave $F(x \mp ct)$, for which $u_t = \mp c\,u_x$, so $u_t^2 = c^2u_x^2$ pointwise: kinetic and potential densities are equal. The pluck’s potential energy has become half kinetic.` },
    ],
    answer: t`$\mu E \approx ${tex(WE.J * 1000)}$ mJ, all potential at release; afterwards each half carries half, split equally between kinetic and potential.`,
  },
  practice: [
    mcq({
      id: 'boundary-term', difficulty: 2,
      prompt: t`Starting from $\dfrac{dE}{dt} = \int_a^b\big(u_tu_{tt} + c^2u_xu_{xt}\big)\,dx$, integrating the second term by parts gives:`,
      visual: player({ mode: 'wave', init: 'pluck', profile: 'gauss', w: 1, c: 2, t: 1.2, tmax: 3, x: [-8, 8], energy: true }, 'A pluck with its energy density (gold) drawn under the axis.'),
      choices: [
        t`$\displaystyle\int_a^b u_t\big(u_{tt} - c^2u_{xx}\big)\,dx + \big[c^2u_xu_t\big]_a^b$`,
        t`$\displaystyle\int_a^b u_t\big(u_{tt} + c^2u_{xx}\big)\,dx + \big[c^2u_xu_t\big]_a^b$`,
        t`$\displaystyle\int_a^b u_t\big(u_{tt} - c^2u_{xx}\big)\,dx$, with no boundary term`,
        t`$\displaystyle\int_a^b u_x\big(u_{tt} - c^2u_{xx}\big)\,dx$`,
      ],
      answer: 0,
      why: {
        1: t`Integration by parts moves the $x$-derivative with a **minus** sign: $\int u_xu_{xt} = [u_xu_t] - \int u_{xx}u_t$.`,
        2: 'The boundary term is the whole point: it is the power through the ends, and it vanishes only for suitable boundary conditions.',
        3: t`The derivative moves from $u_t$ onto $u_x$, so the leftover factor is $u_t$, not $u_x$.`,
      },
      hints: [t`$u_xu_{xt} = u_x\,\partial_x(u_t)$. Integrate by parts, moving $\partial_x$ off $u_t$.`, t`$\int_a^b u_x\,(u_t)_x\,dx = \big[u_xu_t\big]_a^b - \int_a^b u_{xx}u_t\,dx$.`],
      teach: 'Integration by parts trades a derivative for a boundary term and a minus sign.',
      explain: t`$\int c^2u_xu_{xt}\,dx = [c^2u_xu_t] - \int c^2u_{xx}u_t\,dx$, so $dE/dt = \int u_t(u_{tt} - c^2u_{xx})\,dx + [c^2u_xu_t]_a^b$. The PDE kills the integral; the ends decide the rest.`,
    }),
    num({
      id: 'mode-energy', difficulty: 3,
      gen(r) {
        const mu = r.pick([0.005, 0.01]), A = r.pick([0.002, 0.005]), L = r.pick([0.65, 1.0]), c = r.pick([200, 300]), n = r.pick([1, 2, 3]);
        const E = (mu * A * A * Math.PI ** 2 * c * c * n * n) / (4 * L);
        return {
          prompt: t`A string of length $L = ${L}$ m, $\mu = ${mu}$ kg/m and $c = ${c}$ m/s vibrates in mode ${n}: $u = A\sin(${n}\pi x/L)\cos(\omega t)$ with $A = ${A * 1000}$ mm and $\omega = ${n}\pi c/L$. What is its energy $\mu E$, in millijoules?`,
          visual: { type: 'graph', params: { x: [0, L], y: [-1.3 * A * 1000, 1.3 * A * 1000], aspect: 'wide', xlabel: 'x (m)', ylabel: 'u (mm)', curves: [1, 0.5, -0.5, -1].map((k, i) => ({ fn: `${k * A * 1000}*sin(${n}*pi*x/${L})`, color: ['accent', 'violet', 'teal', 'warn'][i], width: i ? 1.2 : 2.4, dash: i ? [4, 4] : undefined })) }, caption: t`Mode ${n} at several moments of its cycle: the shape stays, the amplitude swings between $\pm A$.` },
          answer: E * 1000, units: 'mJ', tol: { rel: 0.01 },
          integrand: `1000*0.5*${mu}*${c}^2*(${A}*${n}*pi/${L})^2*cos(${n}*pi*x/${L})^2`, limits: [0, L], vars: { x: [0, L] },
          errors: [{ value: E * 2000, feedback: t`Average of $\cos^2$ over the string is $\tfrac12$: $\int_0^L\cos^2 = L/2$.` }],
          hints: [t`At $t = 0$ the string is still: $E = \tfrac12c^2\int_0^L u_x^2\,dx$.`, t`$u_x = A\,\tfrac{${n}\pi}{L}\cos(\tfrac{${n}\pi x}{L})$ and $\int_0^L\cos^2 = L/2$: $\mu E = \dfrac{\mu A^2\pi^2c^2n^2}{4L}$.`],
          teach: 'Evaluate the conserved energy at the most convenient moment — here when the string is momentarily still.',
          explain: t`$\mu E = \dfrac{\mu A^2\pi^2c^2n^2}{4L} = ${tex(E)}$ J $= ${tex(E * 1000)}$ mJ. At the same amplitude, mode $n$ holds $n^2$ times the energy of mode 1.`,
        };
      },
    }),
    num({
      id: 'kinetic-share', difficulty: 2,
      gen(r) {
        const [frac, txt] = r.pick([[1 / 12, t`\tfrac{1}{12}`], [1 / 8, t`\tfrac18`], [1 / 6, t`\tfrac16`], [1 / 3, t`\tfrac13`]]);
        const share = Math.sin(2 * Math.PI * frac) ** 2;
        return {
          prompt: t`A string vibrates in a single standing mode, $u = A\sin(kx)\cos(\omega t)$, starting from rest at $t = 0$. What fraction of its energy is kinetic at $t = ${txt}T$, where $T = 2\pi/\omega$ is the period?`,
          visual: { type: 'graph', params: { x: [0, Math.PI], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'x', ylabel: 'u', curves: [{ fn: 'sin(x)', color: 'ink3', dash: [5, 4] }, { fn: `sin(x)*cos(${2 * Math.PI * frac})`, color: 'accent', width: 2.4 }] }, caption: t`The mode at $t = 0$ (dashed) and at $t = ${txt}T$ (solid).` },
          answer: share, tol: { rel: 0.01, abs: 0.002 },
          errors: [{ value: Math.cos(2 * Math.PI * frac) ** 2, feedback: t`That is the potential share, $\cos^2\omega t$. The kinetic part is $\sin^2\omega t$.` }].filter((e) => Math.abs(e.value - share) > 0.01),
          hints: [t`Kinetic: $\tfrac12\int u_t^2 \propto \omega^2\sin^2(\omega t)$. Potential: $\tfrac12c^2\int u_x^2 \propto c^2k^2\cos^2(\omega t)$, and $\omega = ck$.`, t`So the kinetic share is $\sin^2(\omega t) = \sin^2(2\pi t/T)$.`],
          teach: 'In a standing wave energy sloshes between kinetic and potential, sin²ωt against cos²ωt.',
          explain: t`$\sin^2(2\pi\cdot${tex(frac)}) = ${tex(share)}$. The total never changes; at a quarter period the string is flat and all of it is kinetic.`,
        };
      },
    }),
    num({
      id: 'left-kinetic', difficulty: 3,
      gen(r) {
        const V = r.pick([12, 20, 36, 50]);
        return {
          prompt: t`A long string is pulled into a bump and released from rest; at release its potential energy is ${V} mJ. Long afterwards, how much **kinetic** energy does the left-moving half carry, in mJ?`,
          visual: player({ mode: 'wave', init: 'pluck', profile: 'gauss', w: 1, c: 2, t: 3, tmax: 4, x: [-10, 10], energy: true, halves: true }, 'A pluck after the two halves have separated: the energy density (gold) travels with them.'),
          answer: V / 4, units: 'mJ', tol: { rel: 0.01 },
          errors: [{ value: V / 2, feedback: 'That is the half’s total energy; within a travelling pulse it is shared equally between kinetic and potential.' }, { value: 0, feedback: 'The halves move: they carry kinetic energy.' }],
          hints: ['Energy is conserved: the total is still the initial potential energy.', t`Each half gets half of it, and a travelling pulse has $u_t^2 = c^2u_x^2$: kinetic equals potential within it.`],
          teach: 'A travelling pulse carries equal kinetic and potential energy.',
          explain: t`Total ${V} mJ; each half ${V / 2} mJ; within a travelling pulse $u_t = \pm c\,u_x$, so the kinetic part is half of that: ${V / 4} mJ.`,
        };
      },
    }),
    mcq({
      id: 'damped', difficulty: 2,
      prompt: t`With air drag the string obeys $u_{tt} + \gamma u_t = c^2u_{xx}$ ($\gamma > 0$), with fixed ends. What is $dE/dt$ for $E = \tfrac12\int(u_t^2 + c^2u_x^2)\,dx$?`,
      visual: { type: 'graph', params: { x: [0, 10], y: [0, 1.1], aspect: 'wide', xlabel: 't (s)', ylabel: 'E / E(0)', curves: [{ fn: 'e^(-0.3*x)*(1 + 0.15*cos(2.4*x))/1.15', color: 'accent', width: 2.4 }] }, caption: 'The energy of a damped string (illustrative): it only ever falls, fastest when the string is moving fastest.' },
      choices: [t`$-\gamma\displaystyle\int u_t^2\,dx$, never positive`, t`$0$: the wave equation conserves energy`, t`$-\gamma E$`, t`$+\gamma\displaystyle\int u_t^2\,dx$`],
      answer: 0,
      why: {
        1: t`The derivation used $u_{tt} - c^2u_{xx} = 0$; now that combination equals $-\gamma u_t$.`,
        2: t`That would mean energy decays exactly exponentially at all times; in fact it falls only where the string moves, so the loss rate is $\gamma\int u_t^2$, not $\gamma E$.`,
        3: 'The sign: drag removes energy.',
      },
      hints: [t`Redo the calculation: $dE/dt = \int u_t(u_{tt} - c^2u_{xx})\,dx + [\ldots]$.`, t`Now $u_{tt} - c^2u_{xx} = -\gamma u_t$.`],
      teach: t`Damping turns the energy identity into an inequality: $dE/dt = -\gamma\int u_t^2\,dx \le 0$.`,
      explain: t`$dE/dt = \int u_t(-\gamma u_t)\,dx = -\gamma\int u_t^2\,dx \le 0$: energy leaks out at a rate set by the kinetic energy — the wiggles in the curve.`,
    }),
    multi({
      id: 'which-ends', difficulty: 2,
      prompt: t`For which end conditions on $[0, L]$ is the energy of $u_{tt} = c^2u_{xx}$ conserved? (Select all that apply.)`,
      visual: { type: 'graph', params: { x: [-0.05, 1.05], y: [-0.2, 1.25], aspect: 'wide', xlabel: 'x / L', ylabel: 'u', curves: [{ fn: 'sin(pi*x/2)', color: 'accent', width: 2.4, domain: [0, 1] }], points: [{ x: 0, y: 0, label: 'fixed: u = 0', color: 'gold', labelDx: 8, labelDy: 14 }, { x: 1, y: 1, label: 'free: slope 0', color: 'teal', labelDx: -90, labelDy: -12 }] }, caption: 'A string fixed at x = 0 and free (a massless ring on a frictionless rod) at x = L: no motion at one end, no slope at the other.' },
      choices: [t`both ends fixed: $u(0, t) = u(L, t) = 0$`, t`both ends free: $u_x(0, t) = u_x(L, t) = 0$`, t`fixed at $0$, free at $L$`, t`an end attached to a damper: $u_x(L, t) = -k\,u_t(L, t)$, $k > 0$`, t`an end shaken by a motor: $u(0, t) = \sin(\omega t)$`],
      answer: [0, 1, 2],
      why: {
        3: t`At $x = L$ the boundary term is $c^2u_xu_t = -kc^2u_t^2 \le 0$: energy flows out into the damper. (That is how an absorbing end is modelled.)`,
        4: t`A moving end has $u_t \ne 0$ and does work on the string: energy is pumped in and out.`,
      },
      hints: [t`Energy is conserved when $[c^2u_xu_t]_0^L = 0$.`, t`A fixed end has $u_t = 0$; a free end has $u_x = 0$.`],
      teach: t`Energy is conserved when no end does work: at each end either $u_t = 0$ or $u_x = 0$.`,
      explain: t`Fixed ends make $u_t = 0$ there, free ends make $u_x = 0$, and any mix of the two kills the boundary term. A damper removes energy; a driven end adds it.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-tether-energy', difficulty: 3, transfer: true,
      gen(r) {
        const FT = r.pick([10, 20, 40]), A = r.pick([0.02, 0.05]), w = r.pick([0.5, 1]);
        const J = (FT * A * A * SQ) / w;
        return {
          prompt: t`A crew member on a tethered spacewalk flicks the tether (tension ${FT} N) into a bump $u = Ae^{-x^2/w^2}$ with $A = ${A * 100}$ cm and $w = ${w}$ m, released from rest. How much energy did the flick put into the tether, in millijoules? (Use $\mu c^2 = F_T$.)`,
          visual: { type: 'graph', params: { x: [-3, 3], y: [-0.1, 1.2], aspect: 'wide', xlabel: 'x (m)', ylabel: 'u / A', curves: [{ fn: `e^(-x^2/${w * w})`, color: 'accent', width: 2.4 }, { fn: `${(2 / w) * 0.43}*abs(x/${w})*e^(-x^2/${w * w})*${w}`, color: 'gold', dash: [4, 4] }] }, caption: 'The bump (blue) and, dashed, the size of its slope |u′| (scaled): the potential energy lives where the tether slopes, not at the peak.' },
          answer: J * 1000, units: 'mJ', tol: { rel: 0.01 },
          errors: [{ value: 2 * J * 1000, feedback: t`Keep the $\tfrac12$: $E = \tfrac12F_T\int u_x^2\,dx$.` }],
          hints: [t`At release all the energy is potential: $\tfrac12F_T\int u_x^2\,dx$.`, t`For this bump $\int u_x^2\,dx = \dfrac{\sqrt\pi\,A^2}{\sqrt2\,w}$, so the energy is $\dfrac{\sqrt\pi\,F_T A^2}{2\sqrt2\,w}$.`],
          teach: t`The energy of a pluck is its stretching energy, $\tfrac12F_T\int u_x^2\,dx$.`,
          explain: t`$\dfrac{\sqrt\pi\,(${FT})(${A})^2}{2\sqrt2\,(${w})} = ${tex(J)}$ J $= ${tex(J * 1000)}$ mJ — conserved as the two halves run off along the tether (until its ends or damping intervene).`,
        };
      },
    }),
    mcq({
      id: 'cp-unique', difficulty: 3,
      prompt: t`Two solutions $u$ and $v$ of $u_{tt} = c^2u_{xx}$ on $[0, L]$ with fixed ends have the same initial displacement and velocity. How does energy conservation show they are the same?`,
      choices: [
        t`$w = u - v$ solves the equation with zero data, so its energy is 0 for all $t$; then $w_t = w_x = 0$, so $w$ is constant, and $w(0, t) = 0$ makes it zero`,
        t`Their energies are equal at all times, so $u = v$`,
        t`$u - v$ has zero energy at $t = 0$, but its energy could grow later`,
        'Energy conservation cannot decide this; only an explicit formula can',
      ],
      answer: 0,
      why: {
        1: 'Different solutions can have equal energies (shift a pulse along); equality of energies does not make them equal.',
        2: 'Its energy is conserved, so it stays zero.',
        3: 'The energy argument is exactly such a proof — it needs no formula, which is why it works for complicated equations too.',
      },
      hints: ['Apply conservation to the difference of the two solutions, which also solves the (linear) equation.', t`An energy $\tfrac12\int(w_t^2 + c^2w_x^2)$ that is zero forces both squares to vanish.`],
      teach: 'Energy methods prove uniqueness: the difference of two solutions has zero energy forever.',
      explain: t`By linearity $w = u - v$ solves the equation, with $w = w_t = 0$ at $t = 0$, so $E_w(0) = 0$ and hence $E_w(t) = 0$. A sum of squares that integrates to zero vanishes: $w_t = w_x = 0$, so $w$ is a constant — zero, by the fixed ends. Module B6 builds on this.`,
    }),
    num({
      id: 'cp-mode-ratio', difficulty: 2,
      gen(r) {
        const n = r.pick([2, 3, 4]);
        return {
          prompt: t`Two identical strings vibrate with the same amplitude, one in mode 1 and one in mode ${n}. How many times more energy does the mode-${n} string hold?`,
          visual: { type: 'graph', params: { x: [0, 1], y: [-1.3, 1.3], aspect: 'wide', xlabel: 'x / L', ylabel: 'u / A', curves: [{ fn: 'sin(pi*x)', color: 'accent', width: 2.4, label: 'mode 1', labelAt: 0.5, labelDy: -12 }, { fn: `sin(${n}*pi*x)`, color: 'violet', width: 2, label: `mode ${n}`, labelAt: 0.5 / n, labelDy: -12 }] }, caption: 'Same amplitude, different modes: the higher mode slopes more steeply and moves faster.' },
          answer: n * n, tol: { rel: 0, abs: 0.05 },
          errors: [{ value: n, feedback: t`Both the slopes and the speeds grow with $n$, and energy goes as their squares: $n^2$.` }],
          hints: [t`$\mu E = \mu A^2\pi^2c^2n^2/(4L)$.`],
          teach: 'At fixed amplitude, energy grows as the square of the mode number (as ω²).',
          explain: t`$E \propto n^2$: ${n * n} times as much. Equivalently $E \propto \omega^2A^2$, the familiar result for any oscillator.`,
        };
      },
    }),
  ],
  sources: [SRC.strauss, SRC.evans],
});
