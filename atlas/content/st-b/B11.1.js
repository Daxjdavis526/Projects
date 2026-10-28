// Burgers' equation and shock formation: u_t + u u_x = 0 carries each value u
// at its own speed u along straight characteristics x = ξ + u0(ξ)t, so fast
// parts overtake slow ones. The slope along a characteristic is
// u0′/(1 + u0′t), which blows up first at t* = −1/min u0′: a shock. Gas
// dynamics (compressions steepen; the shock-formation distance of loud rocket
// noise), traffic (LWR: waves move backward in dense traffic), sonic booms
// (the N-wave), and a conservative upwind scheme watching it happen.
import { lesson, mcq, num, expr, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const burg = (params, caption) => ({ type: 'pde3-burgers', params: { controls: false, play: false, readout: false, ...params }, caption });
const tGauss = (A, w) => (w * Math.sqrt(Math.E)) / (Math.SQRT2 * A);
const AIR = { rho: 1.2, c: 343, beta: 1.2 };      // kg/m³, m/s at 20 °C; β = (γ + 1)/2 with γ = 1.4
const LEVEQUE = { label: 'R. J. LeVeque, Numerical Methods for Conservation Laws, 2nd ed. (Birkhäuser, 1992), ch. 2–3', url: 'https://doi.org/10.1007/978-3-0348-8629-1' };

export default lesson({
  id: 'st-b.B11.1',
  title: 'Burgers’ equation and shock formation',
  minutes: 15, difficulty: 3,
  intro: t`Make the transport speed depend on the thing being transported. In **Burgers’ equation**

$$u_t + u\,u_x = 0$$

each value of $u$ travels at speed $u$: a fluid particle keeps its own velocity, a pulse of compression in a gas moves faster than the quiet air ahead of it. The characteristics are still straight lines, $x = \xi + u_0(\xi)\,t$, and $u$ is constant along each — but now they have **different slopes**. Wherever faster values start behind slower ones, the characteristics converge, the profile steepens, and at the **breaking time**

$$t^* = -\frac{1}{\min u_0'}$$

two of them meet. The smooth solution ends there and a **shock** — a moving jump — is born.`,
  symbols: [
    { tex: 'u(x, t)', text: 'the transported quantity, which is also its own speed (m/s): a flow velocity, or a signal speed' },
    { tex: 'u_0(\\xi)', text: 'the initial profile, $u(\\xi, 0)$' },
    { tex: '\\xi', text: 'the foot of a characteristic: where it starts at $t = 0$ (m)' },
    { tex: 'x = \\xi + u_0(\\xi)\\,t', text: 'the characteristic from $\\xi$: a straight line of slope $u_0(\\xi)$, carrying the value $u_0(\\xi)$' },
    { tex: "u_0'", text: 'the initial slope (1/s); only where it is negative do characteristics converge' },
    { tex: 't^*', text: 'the breaking time (s): when the first characteristics cross and the slope becomes infinite' },
  ],
  why: t`Shocks are everywhere in high-energy astrophysics: supernova blast waves, accretion shocks and the collisions of neutron stars. Relativistic hydrodynamics codes — the ones that compute the matter in neutron-star mergers alongside the spacetime — are built around capturing exactly these discontinuities.`,
  visual: {
    type: 'pde3-burgers',
    title: 'Characteristics that cross',
    lead: t`Above: the initial profile (dashed), the folded profile the characteristics alone would give (violet), and the actual solution with its shock (blue, shock in orange). Below: the characteristics, the first crossing (gold) and the shock’s path. Press Play or drag the time.`,
    tasks: [
      'With the bump, watch the front steepen until t* (gold dot) — then the violet profile folds over and would give three values of u at once.',
      'After t*, the blue solution jumps across the orange shock instead, and characteristics end there (faint and dashed beyond it): they run into the shock from both sides.',
      'Try the sine wave (a shock in every period) and the up-and-down profile: a front and a tail shock — the N-shaped pressure signature of a sonic boom.',
    ],
    params: { profile: 'gauss', profiles: ['gauss', 'sine', 'box', 'nwave'], A: 1, w: 1, t: 0, tmax: 4, x: [-4, 6], nchars: 40, controls: ['profile', 'A', 't', 'fold'] },
    caption: t`Exact weak solution of $u_t + u\,u_x = 0$ on an infinite line (Lax–Oleinik formula); the window is part of it. The sine wave has period $2\pi$ m; the bump is $Ae^{-x^2}$. Real gases have a little viscosity, so a real shock is a steep but smooth ramp a few molecular mean free paths thick.`,
  },
  example: {
    prompt: t`Burgers’ equation starts from the bump $u_0 = e^{-x^2}$ (in m/s, with $x$ in m). When and where does it first break?`,
    visual: burg({ profile: 'gauss', A: 1, t: Math.sqrt(Math.E / 2), tmax: 3, x: [-3, 5] }, t`The bump at $t = t^* = \sqrt{e/2}$: the front has just become vertical at $x = \sqrt2$, where the first two characteristics meet (gold).`),
    steps: [
      { label: 'Characteristics', text: t`$u$ is constant along $x = \xi + u_0(\xi)t$, so $u(x, t) = u_0(\xi)$ — the implicit solution $u = u_0(x - ut)$.` },
      { label: 'Slope along one', text: t`Differentiate $u = u_0(\xi)$ with $\partial x/\partial\xi = 1 + u_0'(\xi)\,t$: $\;u_x = \dfrac{u_0'(\xi)}{1 + u_0'(\xi)\,t}$. Where $u_0' < 0$ the denominator reaches zero at $t = -1/u_0'(\xi)$.` },
      { label: 'The first to break', text: t`The earliest is where $u_0'$ is most negative. $u_0' = -2xe^{-x^2}$ has its minimum where $u_0'' = (4x^2 - 2)e^{-x^2} = 0$: $\xi^* = 1/\sqrt2$, with $u_0'(\xi^*) = -\sqrt2\,e^{-1/2} = ${r3(-Math.SQRT2 * Math.exp(-0.5))}$ s⁻¹.` },
      { label: 'Breaking time', text: t`$t^* = \dfrac{1}{\sqrt2\,e^{-1/2}} = \sqrt{e/2} = ${Math.sqrt(Math.E / 2).toFixed(4)}$ s.` },
      { label: 'Where', text: t`The characteristic from $\xi^*$ carries $u_0(\xi^*) = e^{-1/2}$, so it is at $x = \tfrac{1}{\sqrt2} + e^{-1/2}\sqrt{e/2} = \tfrac{1}{\sqrt2} + \tfrac{1}{\sqrt2} = \sqrt2 \approx ${Math.SQRT2.toFixed(4)}$ m — on the front of the bump, as the picture shows.` },
      { label: 'Sense check', text: t`A taller bump ($u_0 = Ae^{-x^2}$) breaks sooner, $t^* \propto 1/A$: louder sounds steepen into shocks faster. A wider one breaks later, $t^* \propto w$.` },
    ],
    answer: t`It breaks at $t^* = \sqrt{e/2} \approx ${Math.sqrt(Math.E / 2).toFixed(3)}$ s, at $x = \sqrt2 \approx ${Math.SQRT2.toFixed(3)}$ m, on the front of the bump.`,
  },
  practice: [
    mcq({
      id: 'which-side', difficulty: 1,
      prompt: t`A positive bump obeys $u_t + u\,u_x = 0$. As it moves right, which side steepens?`,
      visual: burg({ profile: 'gauss', A: 1, t: 0.8, tmax: 3, x: [-3, 5], shock: false, tstar: false }, 'The bump part-way to breaking, with its characteristics below (the steepening side is for you to name).'),
      choices: ['the front (right-hand) side, where u falls with x', 'the back (left-hand) side, where u rises with x', 'both sides equally: the bump narrows symmetrically', 'neither: the bump moves without changing shape'],
      answer: 0,
      why: {
        1: 'On the back, faster values are ahead of slower ones: the characteristics fan out and that side flattens.',
        2: 'The peak moves fastest, so it gains on the front and pulls away from the back: the shape tilts forward.',
        3: 'That would be linear transport at one speed; here every value has its own speed.',
      },
      hints: ['The top of the bump has the largest u, so it moves fastest. What does it catch up with?'],
      teach: 'Where u decreases in the direction of travel (u₀′ < 0), characteristics converge and the profile steepens.',
      explain: t`The peak overtakes the slower front, so the front steepens toward a shock while the back stretches out — the same tilt as a wave breaking on a beach. Steepening needs $u_0' < 0$.`,
    }),
    num({
      id: 'breaking-gauss', difficulty: 2,
      gen(r) {
        const A = r.pick([0.5, 1, 1.5, 2]), w = r.pick([1, 2, 3]);
        const ts = tGauss(A, w);
        return {
          prompt: t`Find the breaking time of Burgers’ equation for $u_0 = ${A}\,e^{-x^2/${w * w}}$ ($u$ in m/s, $x$ in m).`,
          visual: burg({ profile: 'gauss', A: Math.min(1.5, A), w: 1, t: 0, tmax: 3, x: [-3, 5], fold: false, shock: false, tstar: false }, 'The initial bump and its characteristics (drawn for a bump of width 1); the crossing is for you to find.'),
          answer: ts, units: 's', tol: { rel: 0.005 },
          errors: [{ value: w / A, feedback: t`The steepest slope is not $A/w$: it is $\sqrt2\,e^{-1/2}A/w$, at $x = w/\sqrt2$.` }, { value: ts * w, feedback: t`With width $w$ the steepest slope is $\sqrt2\,e^{-1/2}A/w$; check the factor of $w$.` }].filter((e) => Math.abs(e.value - ts) > 0.01 * ts),
          hints: [t`$t^* = -1/\min u_0'$. For $u_0 = Ae^{-x^2/w^2}$, $u_0' = -\dfrac{2Ax}{w^2}e^{-x^2/w^2}$.`, t`The minimum is at $x = w/\sqrt2$, where $u_0' = -\dfrac{\sqrt2\,A}{w}e^{-1/2}$.`],
          teach: 'The breaking time is −1/min u₀′: the steepest downward slope breaks first.',
          explain: t`$t^* = \dfrac{w\sqrt e}{\sqrt2\,A} = \dfrac{${w}\times${r3(Math.sqrt(Math.E))}}{${r3(Math.SQRT2)}\times${A}} = ${r3(ts)}$ s. Doubling the amplitude halves it; doubling the width doubles it.`,
        };
      },
    }),
    num({
      id: 'breaking-sine', difficulty: 2,
      gen(r) {
        const U = r.pick([0, 2, 5]), a = r.pick([0.5, 1, 2]), L = r.pick([10, 20, 50]);
        const k = (2 * Math.PI) / L, ts = 1 / (a * k);
        return {
          prompt: t`Burgers’ equation starts from a steady flow with a ripple on it: $u_0 = ${U} + ${a}\sin(2\pi x/${L})$, in m/s with $x$ in m. When does it first break?`,
          visual: burg({ profile: 'sine', A: 0.5, w: 1, t: 0, tmax: 4, x: [-3, 7], fold: false, shock: false, tstar: false }, 'A sine ripple and its characteristics (drawn without the steady part, in scaled units). A uniform added speed only slides the picture sideways.'),
          answer: ts, units: 's', tol: { rel: 0.005 },
          errors: [{ value: 1 / ((U + a) * k), feedback: t`The steady part $${U}$ m/s moves everything together; only the ripple’s slope sets the breaking time.` }, { value: L / (a * 2 * Math.PI) * 2 * Math.PI, feedback: t`The slope of $a\sin(kx)$ is $ak$ with $k = 2\pi/L$; keep the $2\pi$.` }].filter((e) => Math.abs(e.value - ts) > 0.01 * ts),
          hints: [t`$u_0' = ${a}k\cos(kx)$ with $k = 2\pi/${L}$: its minimum is $-${a}k$.`, t`$t^* = 1/(${a}k)$.`],
          teach: 'A uniform background speed shifts every characteristic equally: it never changes the breaking time.',
          explain: t`$k = 2\pi/${L} = ${r3(k)}$ rad/m, so $t^* = 1/(${a}\times${r3(k)}) = ${r3(ts)}$ s. Adding a constant $U$ to $u$ is a Galilean shift — the same picture seen from a frame moving at $U$ — so it cannot change when the ripple breaks.`,
        };
      },
    }),
    expr({
      id: 'slope-along', difficulty: 3,
      prompt: t`On the characteristic from $\xi$, the initial slope is $m = u_0'(\xi)$. Using $u = u_0(\xi)$ and $x = \xi + u_0(\xi)\,t$, find the slope $u_x$ on that characteristic at time $t$.`,
      visual: burg({ profile: 'gauss', A: 1, t: 1, tmax: 3, x: [-3, 5], shock: false, tstar: false, fold: false }, 'Characteristics converging over the front of the bump: the slope there grows as they close in.'),
      answer: 'm/(1 + m*t)',
      answerTeX: t`\frac{m}{1 + mt}`,
      lhs: 'u_x',
      vars: { m: [-0.4, 0.8], t: [0, 1.5] },
      errors: [{ answer: 'm*(1 + m*t)', feedback: t`Divide by $\partial x/\partial\xi$, don’t multiply: $u_x = \dfrac{\partial u/\partial\xi}{\partial x/\partial\xi}$.` }, { answer: 'm/(1 - m*t)', feedback: t`$\partial x/\partial\xi = 1 + u_0'(\xi)\,t$, with a plus sign.` }],
      hints: [t`$u_x = \dfrac{\partial u/\partial\xi}{\partial x/\partial\xi}$ along a fixed time.`, t`$\partial u/\partial\xi = u_0'(\xi) = m$ and $\partial x/\partial\xi = 1 + m\,t$.`],
      teach: 'Along a characteristic the slope evolves as u₀′/(1 + u₀′t): it blows up at t = −1/u₀′ when u₀′ < 0.',
      explain: t`$u_x = \dfrac{m}{1 + mt}$. If $m > 0$ it decays like $1/t$ (an expansion flattens); if $m < 0$ the denominator hits zero at $t = -1/m$ — the slope is infinite and that characteristic has met its neighbour.`,
    }),
    num({
      id: 'traffic-wave', difficulty: 2,
      gen(r) {
        const vmax = r.pick([25, 30]), rhom = 0.15, rho = r.pick([0.02, 0.05, 0.1, 0.12]);
        const c = vmax * (1 - (2 * rho) / rhom);
        return {
          prompt: t`In the Lighthill–Whitham–Richards traffic model the car density $\rho$ (cars per metre) obeys $\rho_t + q(\rho)_x = 0$ with flux $q = v_{\max}\,\rho\,(1 - \rho/\rho_{\max})$. Its characteristic speed is $q'(\rho)$, and $u = q'(\rho)$ obeys Burgers’ equation. With $v_{\max} = ${vmax}$ m/s and $\rho_{\max} = ${rhom}$ cars/m, at what speed do density changes travel through traffic of density $${rho}$ cars/m? (Negative means backward, against the traffic.)`,
          visual: { type: 'graph', params: { x: [0, 0.15], y: [-32, 32], aspect: 'wide', xlabel: 'density ρ (cars/m)', ylabel: 'speed (m/s)', axesAt: 'edge', curves: [{ fn: `${vmax}*(1 - x/${rhom})`, color: 'accent', width: 2.2, label: 'car speed v', labelAt: 0.02, labelDy: -12 }, { fn: `${vmax}*(1 - 2*x/${rhom})`, color: 'gold', width: 2.2, dash: [5, 4], label: 'wave speed q′(ρ)', labelAt: 0.11, labelDy: -12 }], hlines: [{ y: 0, color: 'ink3' }], vlines: [{ x: rho, color: 'warn' }] }, caption: 'Car speed and the speed of density waves against density (LWR model with a linear speed–density law). The wave speed is always below the car speed.' },
          answer: c, units: 'm/s', tol: { rel: 0.005, abs: 0.01 },
          errors: [{ value: vmax * (1 - rho / rhom), feedback: t`That is the cars’ own speed $v = q/\rho$; waves travel at $q'(\rho)$.` }],
          hints: [t`$q'(\rho) = v_{\max}\big(1 - 2\rho/\rho_{\max}\big)$.`],
          teach: 'In traffic, density waves move at q′(ρ) — slower than the cars, and backward once the road is more than half full.',
          explain: t`$q' = ${vmax}(1 - 2\times${rho}/${rhom}) = ${r3(c)}$ m/s${c < 0 ? ': the wave moves backward, against the traffic — the stop-and-go waves drivers meet coming toward them' : ': forward, but slower than the cars themselves, which overtake it'}. Light traffic sends waves forward, dense traffic backward; where the two meet, characteristics cross and a jam front forms.`,
        };
      },
    }),
    {
      type: 'slider', id: 'set-tstar', difficulty: 2,
      prompt: t`The bump $u_0 = 0.8\,e^{-x^2}$ evolves under Burgers’ equation. Set the time to the moment its first characteristics cross.`,
      visual: burg({ profile: 'gauss', A: 0.8, t: 0, tmax: 4, x: [-3, 6], tstar: false, shock: false, xt: false, controls: ['t'] }, 'Drag the time and watch the front: the profile carried by the characteristics (violet) goes vertical at the breaking time, then folds over.'),
      param: 't',
      answer: [tGauss(0.8, 1) - 0.06, tGauss(0.8, 1) + 0.06],
      instruction: 'Set the time to the breaking time, then check.',
      hints: [t`$t^* = -1/\min u_0'$; for $Ae^{-x^2}$ that is $\sqrt e/(\sqrt2\,A)$.`, t`With $A = 0.8$: $t^* = ${r3(Math.sqrt(Math.E) / Math.SQRT2)}/0.8$.`],
      teach: 'The breaking time is when the profile first goes vertical and the folded profile starts to fold.',
      explain: t`$t^* = \sqrt e/(0.8\sqrt2) = ${r3(tGauss(0.8, 1))}$ s. Before it the solution is smooth; after it, the characteristics alone would give three values of $u$ at once, and a shock carries the solution instead.`,
    },
    code({
      id: 'upwind-steepen', difficulty: 3,
      prompt: t`Watch a wave steepen into a shock on a grid. Solve $u_t + (\tfrac12u^2)_x = 0$ on the periodic interval $[0, 2\pi)$ with $N = 400$ cells and $u_0 = 1 + 0.5\sin x$ (positive everywhere, so information comes from the left). Use the **conservative upwind** update

$$u_j \leftarrow u_j - \frac{\Delta t}{\Delta x}\big(F_j - F_{j-1}\big),\qquad F_j = \tfrac12u_j^2,$$

with \`np.roll(F, 1)\` for $F_{j-1}$ and $\Delta t = 0.4\,\Delta x/1.5$. Write \`run(T)\` returning the solution at time $T$ from the start, and set \`steep1\` and \`steep3\` to the steepest downward slope, $\max_j\,(u_j - u_{j+1})/\Delta x$, at $T = 1$ and $T = 3$.`,
      starter: t`import numpy as np

N = 400
dx = 2 * np.pi / N
x = np.arange(N) * dx

def run(T):
    u = 1 + 0.5 * np.sin(x)
    # step forward to time T (shorten the last step to land on T exactly)
    return u

def steepest(u):
    return np.max((u - np.roll(u, -1)) / dx)

steep1 = None
steep3 = None
print(steep1, steep3)
`,
      answer: t`import numpy as np

N = 400
dx = 2 * np.pi / N
x = np.arange(N) * dx

def run(T):
    u = 1 + 0.5 * np.sin(x)
    t, dt = 0.0, 0.4 * dx / 1.5
    while t < T - 1e-12:
        h = min(dt, T - t)
        F = 0.5 * u**2
        u = u - h / dx * (F - np.roll(F, 1))
        t += h
    return u

def steepest(u):
    return np.max((u - np.roll(u, -1)) / dx)

steep1 = steepest(run(1.0))
steep3 = steepest(run(3.0))
print(steep1, steep3)`,
      tests: [
        { name: t`at $T = 1$ the steepest slope is within 5% of the exact $\dfrac{0.5}{1 - 0.5T} = 1$`, code: 'steep1 is not None and abs(steep1 - 1.0) < 0.05' },
        { name: 'by T = 3 (after t* = 2) a shock has formed: the slope is over 10 times steeper, limited only by the grid', code: 'steep3 is not None and steep3 > 10 * steep1' },
        { name: t`the scheme conserves $\int u\,dx$ to round-off`, code: 'abs(np.sum(run(3.0)) * dx - 2 * np.pi) < 1e-9' },
      ],
      hints: ['Inside `run`: `t, dt = 0.0, 0.4*dx/1.5`, then `while t < T - 1e-12:` take a step of `h = min(dt, T - t)`.', 'One step: `F = 0.5*u**2`, then `u = u - h/dx*(F - np.roll(F, 1))`, and `t += h`.', '`steep1 = steepest(run(1.0))` and `steep3 = steepest(run(3.0))`.'],
      teach: 'A conservative scheme differences the flux: the total ∫u dx is kept exactly, and the shock it forms moves at the right speed.',
      explain: t`At $T = 1$ the grid gives a slope of about 0.975 against the exact 1.0 — the small shortfall is the scheme’s numerical diffusion. At $T = 3$ it is about 18.7: a jump smeared over two or three cells, as steep as 400 cells allow. The exact solution has an infinite slope from $t^* = 1/0.5 = 2$ s on. Because the update is a difference of fluxes, $\sum u_j\,\Delta x$ never changes — the property that makes the shock move at the right speed (lesson B11.2).`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-rocket-noise', difficulty: 3, transfer: true,
      gen(r) {
        const pa = r.pick([500, 1000, 2000, 4000]), f = r.pick([50, 100, 200]);
        const ua = pa / (AIR.rho * AIR.c), k = (2 * Math.PI * f) / AIR.c, xbar = AIR.c / (AIR.beta * ua * k);
        return {
          prompt: t`Near a large rocket at lift-off, sound reaches pressure amplitudes of thousands of pascals. Riding along with a sound wave, its particle velocity $u$ obeys (approximately) Burgers’ equation with speed $\beta u$, $\beta = 1.2$ for air: $u_t + \beta u\,u_x = 0$. A tone of frequency $f = ${f}$ Hz and pressure amplitude $p_a = ${pa}$ Pa has $u = u_a\sin kx$ with $u_a = p_a/(\rho_0c_0)$ and $k = 2\pi f/c_0$ ($\rho_0 = 1.2$ kg/m³, $c_0 = 343$ m/s). How far does it travel, at $c_0$, before it steepens into a shock? Give the distance in metres.`,
          visual: burg({ profile: 'sine', A: 0.5, t: 1.6, tmax: 3, x: [-3, 7], tstar: false }, 'A sine wave steepening toward a sawtooth under Burgers’ equation (scaled units, in the frame moving with sound). Air absorption, which slows the process, is neglected.'),
          answer: xbar, units: 'm', tol: { rel: 0.01 },
          errors: [{ value: AIR.c / (ua * k), feedback: t`The steepening speed is $\beta u$, not $u$: divide by $\beta = 1.2$ as well.` }, { value: 1 / (AIR.beta * ua * k), feedback: t`That is the breaking **time** in seconds; multiply by $c_0$ for the distance.` }],
          hints: [t`For $u_t + \beta u\,u_x = 0$ the breaking time is $t^* = 1/(\beta\max|u_0'|) = 1/(\beta u_ak)$.`, t`$u_a = p_a/(\rho_0c_0)$ and $k = 2\pi f/c_0$; the distance is $c_0t^*$.`, t`$\bar x = \dfrac{c_0}{\beta u_a k} = \dfrac{\rho_0c_0^3}{2\pi\beta f\,p_a}$.`],
          teach: 'Loud sound steepens into shocks after a distance inversely proportional to its amplitude and frequency: Burgers’ breaking time, times c₀.',
          explain: t`$u_a = ${pa}/(1.2\times343) = ${r3(ua)}$ m/s and $k = ${r3(k)}$ rad/m, so $t^* = 1/(1.2\times${r3(ua)}\times${r3(k)}) = ${r3(xbar / AIR.c)}$ s and $\bar x = c_0t^* = ${r3(xbar)}$ m. That is why the roar of a rocket close up turns into the crackle heard farther away: the waveform has become a train of small shocks. Ordinary speech ($p_a \approx 0.02$ Pa) would need hundreds to thousands of kilometres — absorption wins long before.`,
        };
      },
    }),
    mcq({
      id: 'cp-jam', difficulty: 2, transfer: true,
      prompt: t`Light traffic flows toward a stretch of dense, slow traffic. In the LWR model, density waves in light traffic move forward and in dense traffic backward. What happens where the two meet?`,
      visual: { type: 'graph', params: { x: [-4, 4], y: [0, 3], aspect: 'wide', xlabel: 'position along the road', ylabel: 't', axesAt: 'edge', xticks: 0, yticks: 0, curves: [...[-4, -3.2, -2.4, -1.6, -0.8].map((x0) => ({ fn: `(x - ${x0})/1.2`, color: 'accent', width: 1.2, domain: [x0, 4] })), ...[0.4, 1.2, 2, 2.8, 3.6].map((x0) => ({ fn: `(${x0} - x)/0.8`, color: 'warn', width: 1.2, domain: [-4, x0] }))], vlines: [{ x: 0, label: 'start of the dense stretch', color: 'ink3' }] }, caption: 'Characteristics in light traffic (blue, moving forward) and in dense traffic (orange, moving backward): they run into each other. Schematic.' },
      choices: ['The characteristics collide: a shock forms — the sharp back of the queue, where drivers brake suddenly', 'They pass through each other and the densities mix smoothly', 'A gap opens between them, filled by a gradual fan', 'Nothing: density waves cannot meet because they travel at the same speed'],
      answer: 0,
      why: {
        1: 'In a nonlinear equation characteristics carry values that must agree where they meet; they cannot pass through each other.',
        2: 'A fan opens where characteristics diverge — at the front of a queue that is clearing, not at its back.',
        3: 'Their speeds have opposite signs here, so they must meet.',
      },
      hints: ['Forward-moving characteristics from behind, backward-moving ones from ahead: do they converge or diverge?'],
      teach: 'Converging characteristics make a shock; in traffic it is the abrupt back of a jam.',
      explain: t`They converge, so a shock forms: the density jumps from light to dense across a moving line — the back of the queue, where drivers go from cruising to braking within a few car lengths. Its speed comes from the Rankine–Hugoniot condition (next lesson), and in dense traffic it travels backward along the road.`,
    }),
    mcq({
      id: 'cp-after', difficulty: 2,
      prompt: t`A student says: “After the breaking time $t^*$ Burgers’ equation has no solution, so the model is useless from then on.” What is the best reply?`,
      visual: burg({ profile: 'gauss', A: 1, t: 2.6, tmax: 3, x: [-3, 5] }, 'The bump well after breaking: the folded profile (violet) and the solution with a shock (blue, orange).'),
      choices: ['It has no smooth solution, but it has a weak solution with a jump, fixed by the integral (conservation) form of the law — the shock', 'Right: the model is valid only before t*', 'The folded, three-valued profile is the solution after t*', 'The equation must be replaced by the heat equation after t*'],
      answer: 0,
      why: {
        1: 'The underlying conservation law still holds after t*; only the differential form fails at the jump.',
        2: t`A velocity or a density cannot have three values at one place. The fold is what characteristics alone would give, not physics.`,
        3: t`A little viscosity ($u_t + uu_x = \nu u_{xx}$) does smooth the jump into a thin ramp, but the inviscid limit already describes it as a shock.`,
      },
      hints: ['Go back to the conservation law that the PDE came from: does it need derivatives?'],
      teach: 'At t* the smooth solution ends, not the physics: the integral form of the conservation law allows a jump — a weak solution.',
      explain: t`The integral balance $\frac{d}{dt}\int_a^b u\,dx = q(a) - q(b)$ makes sense for discontinuous $u$. Solutions in that sense, **weak solutions**, continue past $t^*$ with a shock whose speed the balance fixes — the Rankine–Hugoniot condition of the next lesson.`,
    }),
  ],
  sources: [SRC.strauss, SRC.evans, LEVEQUE, { label: 'G. B. Whitham, Linear and Nonlinear Waves (Wiley, 1974), ch. 2–3 (kinematic waves, traffic flow, shocks)', url: 'https://doi.org/10.1002/9781118032954' }, { label: 'M. F. Hamilton & D. T. Blackstock (eds.), Nonlinear Acoustics (Academic Press, 1998), ch. 4 (the shock formation distance)', url: 'https://openlibrary.org/search?q=nonlinear+acoustics+hamilton+blackstock' }],
});
