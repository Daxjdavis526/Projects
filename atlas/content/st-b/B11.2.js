// Weak solutions and the Rankine–Hugoniot condition: the integral form of a
// conservation law u_t + f(u)_x = 0 survives a jump, and fixes its speed,
// s = [f]/[u] — for Burgers (u_L + u_R)/2. Weak solutions are not unique: the
// entropy (Lax) condition u_L > s > u_R picks the physical one (a shock, or
// else a rarefaction fan u = x/t). The conservation form matters: a different
// law with the same smooth solutions moves shocks at a different speed, and a
// non-conservative scheme leaves the shock stuck. Traffic jams, the gas behind
// a shock, a shock tube's incident shock, the Mach disk.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { SRC } from './_pde.js';

const t = String.raw;
const r3 = (x) => +x.toPrecision(3);
const burg = (params, caption) => ({ type: 'pde3-burgers', params: { controls: false, play: false, readout: false, ...params }, caption });
const GAM = 1.4, A1 = 343;          // air: ratio of specific heats; speed of sound at 20 °C (m/s)
const LEVEQUE = { label: 'R. J. LeVeque, Numerical Methods for Conservation Laws, 2nd ed. (Birkhäuser, 1992), ch. 3 and 12', url: 'https://doi.org/10.1007/978-3-0348-8629-1' };
const ANDERSON = { label: 'J. D. Anderson, Modern Compressible Flow, 3rd ed. (McGraw-Hill, 2003), ch. 3 and 7 (normal shocks, the shock tube)', url: 'https://openlibrary.org/isbn/9780072424430' };

export default lesson({
  id: 'st-b.B11.2',
  title: 'Weak solutions and the Rankine–Hugoniot condition',
  minutes: 15, difficulty: 3,
  intro: t`A conservation law $u_t + f(u)_x = 0$ is shorthand for a balance: the amount of $u$ between $a$ and $b$ changes only by what flows through the ends, $\frac{d}{dt}\int_a^b u\,dx = f(u(a)) - f(u(b))$. That balance needs no derivatives, so it still makes sense when $u$ jumps. Solutions in this sense are **weak solutions**. Apply the balance across a jump moving at speed $s$ and you get the **Rankine–Hugoniot condition**:

$$s = \frac{f(u_L) - f(u_R)}{u_L - u_R} \qquad\Big(\text{Burgers, } f = \tfrac12u^2:\ \ s = \tfrac12(u_L + u_R)\Big).$$

Weak solutions are not unique, though. The physical one obeys the **entropy condition**: characteristics must run *into* a shock from both sides, $u_L > s > u_R$. Where that fails, the jump opens into a smooth **rarefaction fan** instead.`,
  symbols: [
    { tex: 'f(u)', text: 'the flux: how much $u$ crosses a point per second (for Burgers $\\tfrac12u^2$; for traffic, cars per second)' },
    { tex: 's', text: 'the speed of the shock (m/s)' },
    { tex: 'u_L,\\ u_R', text: 'the values just left and right of the jump' },
    { tex: '[\\,\\cdot\\,]', text: 'a jump across the shock, as in $[u] = u_L - u_R$; the condition reads $s\\,[u] = [f]$' },
  ],
  why: t`Every shock-capturing code — from rocket-nozzle CFD to the relativistic hydrodynamics of neutron-star mergers — is built so that its discrete solution obeys the Rankine–Hugoniot condition automatically, by updating conserved quantities with flux differences.`,
  visual: {
    type: 'pde3-burgers',
    title: 'Riemann problems',
    lead: t`A single jump from $u_L$ to $u_R$ at $x = 0$ — a **Riemann problem**. Set the two values and watch what the jump becomes; then add an upwind computation.`,
    tasks: [
      'With uL = 1, uR = 0: one shock, moving at ½ m/s exactly — at x = 1 when t = 2. The readout compares its speed with (uL + uR)/2.',
      'Swap them (uL = 0, uR = 1): no shock. The jump opens into a fan of characteristics (teal), u = x/t inside it.',
      'Back at (1, 0), choose the non-conservative scheme: its shock stays stuck at x = 0. The conservative scheme’s dots follow the true shock.',
    ],
    params: { profile: 'step', uL: 1, uR: 0, t: 1, tmax: 4, x: [-3, 4], fold: false, controls: ['uL', 'uR', 't', 'scheme'], readout: true },
    caption: t`Exact weak (entropy) solution of $u_t + (\tfrac12u^2)_x = 0$ for a jump at $x = 0$. Upwind dots: 400 cells, Courant number 0.5. A real shock has a small thickness set by viscosity; here it is a mathematical jump.`,
  },
  example: {
    prompt: t`Burgers’ equation starts from $u = 1$ for $x < 0$ and $u = 0$ for $x > 0$ (in m/s). Derive the shock speed from the integral balance and find where the shock is at $t = 2$ s. Then try the reverse jump, $u_L = 0$, $u_R = 1$.`,
    visual: burg({ profile: 'step', uL: 1, uR: 0, t: 2, tmax: 3, x: [-3, 4], fold: false }, 'The jump (1, 0) at t = 2 s: a shock at x = 1 (orange), with the characteristics from both sides running into it.'),
    steps: [
      { label: 'Set up the balance', text: t`Take an interval $[-a, b]$ containing the shock at $x_s(t)$. Inside, $u = 1$ on the left of the shock and $0$ on the right, so $\int_{-a}^b u\,dx = (x_s + a)\times1$.` },
      { label: 'Flux in and out', text: t`$\frac{d}{dt}\int u\,dx = f(u_L) - f(u_R) = \tfrac12(1)^2 - 0 = \tfrac12$.` },
      { label: 'Read off the speed', text: t`$\dfrac{d}{dt}(x_s + a) = \dfrac{dx_s}{dt} = \tfrac12$: $s = \tfrac12$ m/s — and in general $s\,(u_L - u_R) = f(u_L) - f(u_R)$, the Rankine–Hugoniot condition. At $t = 2$ s the shock is at $x = 1$ m.` },
      { label: 'Check the entropy condition', text: t`$u_L = 1 > s = \tfrac12 > u_R = 0$: characteristics from both sides (speeds 1 and 0) run into it. A physical shock.` },
      { label: 'The reverse jump', text: t`For $(0, 1)$ a jump moving at $\tfrac12$ also satisfies Rankine–Hugoniot — but $u_L = 0 < s$: characteristics would leave it, so it is not physical. The entropy solution is the **fan** $u = x/t$ for $0 \le x \le t$ (0 to its left, 1 to its right), which you can check solves $u_t + uu_x = -x/t^2 + (x/t)(1/t) = 0$.` },
    ],
    answer: t`$s = \tfrac12(1 + 0) = \tfrac12$ m/s, so the shock is at $x = 1$ m at $t = 2$ s. The reverse jump makes no shock: it spreads into the fan $u = x/t$.`,
  },
  practice: [
    num({
      id: 'rh-speed', difficulty: 1,
      gen(r) {
        const uL = r.pick([1, 2, 3, 1.5]), uR = r.pick([-1, 0, 0.5]);
        const s = (uL + uR) / 2;
        return {
          prompt: t`A Burgers shock has $u_L = ${uL}$ m/s behind it and $u_R = ${uR}$ m/s ahead. How fast does it move?`,
          visual: burg({ profile: 'step', uL: Math.min(2, uL), uR, t: 1, tmax: 3, x: [-3, 5], fold: false, tstar: false }, 'A jump from the left value to the right one, and the shock it makes (drawn with the left value capped at 2).'),
          answer: s, units: 'm/s', tol: { rel: 0.005, abs: 0.005 },
          errors: [{ value: uL - uR, feedback: 'That is the jump [u]; the speed is [f]/[u] = (u_L² − u_R²)/(2(u_L − u_R)).' }, { value: (uL * uL - uR * uR) / 2, feedback: t`That is the flux jump $[f]$; divide by the jump $[u]$ too.` }].filter((e) => Math.abs(e.value - s) > 0.01),
          hints: [t`$s = \dfrac{f(u_L) - f(u_R)}{u_L - u_R}$ with $f = \tfrac12u^2$, which simplifies to $\tfrac12(u_L + u_R)$.`],
          teach: 'For Burgers’ equation a shock moves at the average of the values on its two sides.',
          explain: t`$s = \tfrac12(${uL} + ${uR}) = ${s}$ m/s. Check the entropy condition: $${uL} > ${s} > ${uR}$ ✓ — characteristics from both sides run into it.`,
        };
      },
    }),
    num({
      id: 'box-shock', difficulty: 2,
      gen(r) {
        const A = r.pick([0.5, 1, 1.5]), w = r.pick([1, 2]), tt = r.pick([1, 2]);
        const xs = w + (A * tt) / 2;
        return {
          prompt: t`A square pulse, $u_0 = ${A}$ m/s for $|x| < ${w}$ m and 0 elsewhere, obeys Burgers’ equation. Its front becomes a shock at once (a fan opens at its back). Where is the shock at $t = ${tt}$ s, in metres?`,
          visual: burg({ profile: 'box', A, w: 1, t: 0, tmax: 4, x: [-3, 6], fold: false, tstar: false }, 'The square pulse at t = 0 (drawn with half-width 1) and its characteristics: the front edge breaks at once, the back edge fans out.'),
          answer: xs, units: 'm', tol: { rel: 0.005 },
          errors: [{ value: w + A * tt, feedback: t`The shock moves at $\tfrac12(u_L + u_R) = ${A / 2}$ m/s, not at $${A}$.` }, { value: (A * tt) / 2, feedback: t`It starts at the front edge, $x = ${w}$, not at 0.` }],
          hints: [t`Behind the shock $u_L = ${A}$, ahead $u_R = 0$, so $s = ${A / 2}$ m/s.`, t`$x_s = ${w} + s\,t$ — valid until the fan from the back catches up, at $t = 4w/A = ${r3((4 * w) / A)}$ s.`],
          teach: 'A shock’s path is found by integrating its Rankine–Hugoniot speed from where it starts.',
          explain: t`$x_s = ${w} + \tfrac12(${A})(${tt}) = ${r3(xs)}$ m. After $t = 4w/A$ the fan from the back reaches the shock, $u_L$ starts to fall and the shock slows: the pulse becomes a triangle whose front follows $x_s = -w + 2\sqrt{Awt}$ — the area $2Aw$ stays fixed, as conservation demands.`,
        };
      },
    }),
    mcq({
      id: 'shock-or-fan', difficulty: 2,
      prompt: t`Which jump, at $t = 0$, turns into a shock under Burgers’ equation (rather than a rarefaction fan)?`,
      visual: burg({ profile: 'step', uL: 0, uR: 1, t: 1.5, tmax: 3, x: [-3, 4], fold: false, tstar: false }, 'One Riemann problem that does not make a shock: a fan of characteristics (teal) spreads the jump into a ramp.'),
      choices: [t`$u_L = 2$, $u_R = -1$`, t`$u_L = -1$, $u_R = 2$`, t`$u_L = 0$, $u_R = 1$`, t`$u_L = 1$, $u_R = 3$`],
      answer: 0,
      why: {
        1: t`$u_L < u_R$: the right side outruns the left, and the gap fills with a fan.`,
        2: t`Rising from 0 to 1: the fan in the picture.`,
        3: t`$u_L < u_R$ again: the faster values are ahead, so nothing catches up.`,
      },
      hints: ['A shock needs the faster values behind the slower ones.'],
      teach: 'For Burgers, a jump down (u_L > u_R) makes a shock; a jump up makes a rarefaction fan.',
      explain: t`With $u_L = 2 > u_R = -1$ the characteristics run into each other: a shock at speed $\tfrac12(2 - 1) = \tfrac12$ m/s, satisfying $2 > \tfrac12 > -1$. The other three rise from left to right and spread out.`,
    }),
    num({
      id: 'jam-tail', difficulty: 2,
      gen(r) {
        const vmax = r.pick([25, 30]), rhom = 0.15, rhoL = r.pick([0.02, 0.03, 0.05]);
        const s = vmax * (1 - (rhoL + rhom) / rhom);
        return {
          prompt: t`Traffic at density $\rho_L = ${rhoL}$ cars/m runs into a queue of stopped cars, $\rho_R = \rho_{\max} = ${rhom}$ cars/m. With the flux $q(\rho) = v_{\max}\rho(1 - \rho/\rho_{\max})$, $v_{\max} = ${vmax}$ m/s, how fast does the back of the queue move? (Negative: backward along the road.)`,
          visual: { type: 'graph', params: { x: [0, 0.15], y: [0, 1.2], aspect: 'wide', xlabel: 'density ρ (cars/m)', ylabel: 'flux q (cars/s)', axesAt: 'edge', curves: [{ fn: `${vmax}*x*(1 - x/${rhom})`, color: 'accent', width: 2.4 }], points: [{ x: rhoL, y: vmax * rhoL * (1 - rhoL / rhom), color: 'gold', label: 'arriving traffic' }, { x: rhom, y: 0, color: 'warn', label: 'stopped cars', labelDx: -90, labelDy: -12 }] }, caption: 'The flux–density curve. The shock speed is the slope of the chord joining the two states — draw it in your head.' },
          answer: s, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: -s, feedback: 'Check the sign: a queue grows backward, toward the arriving traffic.' }, { value: vmax * (1 - (2 * rhoL) / rhom), feedback: t`That is the characteristic speed $q'(\rho_L)$ of the arriving traffic; the shock moves at the chord slope $[q]/[\rho]$.` }],
          hints: [t`$s = \dfrac{q(\rho_L) - q(\rho_R)}{\rho_L - \rho_R}$, and $q(\rho_{\max}) = 0$.`, t`For this flux it simplifies to $s = v_{\max}\big(1 - (\rho_L + \rho_R)/\rho_{\max}\big)$.`],
          teach: 'Rankine–Hugoniot for traffic: the back of a jam moves at the chord slope [q]/[ρ] of the flux curve.',
          explain: t`$q(\rho_L) = ${r3(vmax * rhoL * (1 - rhoL / rhom))}$ cars/s and $q(\rho_{\max}) = 0$, so $s = \dfrac{${r3(vmax * rhoL * (1 - rhoL / rhom))}}{${rhoL} - ${rhom}} = ${r3(s)}$ m/s — about $${r3(-s * 3.6)}$ km/h backward. Each arriving car adds to the queue, so its tail creeps toward the oncoming traffic.`,
        };
      },
    }),
    num({
      id: 'other-law', difficulty: 3,
      gen(r) {
        const [uL, uR] = r.pick([[1, 0], [2, 0], [2, 1], [3, 1]]);
        const s2 = ((2 / 3) * (uL ** 3 - uR ** 3)) / (uL ** 2 - uR ** 2), s1 = (uL + uR) / 2;
        return {
          prompt: t`Multiply $u_t + uu_x = 0$ by $2u$: smooth solutions also obey $(u^2)_t + \big(\tfrac23u^3\big)_x = 0$, a conservation law for $u^2$ instead of $u$. Treat **that** as the law and apply Rankine–Hugoniot to the jump $u_L = ${uL}$, $u_R = ${uR}$. What shock speed does it give?`,
          visual: { type: 'graph', params: { x: [0, 3.2], y: [0, 2.6], aspect: 'wide', xlabel: 't', ylabel: 'shock position', axesAt: 'edge', curves: [{ fn: `${s1}*x`, color: 'accent', width: 2.4, label: 'conserving u', labelAt: 2.2, labelDy: 14 }] }, caption: t`The shock path when $u$ is the conserved quantity, $s = \tfrac12(u_L + u_R)$. The other law’s path is for you to find.` },
          answer: s2, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: s1, feedback: t`That is the speed for the law conserving $u$. Here the conserved quantity is $u^2$ and the flux $\tfrac23u^3$: $s = [\tfrac23u^3]/[u^2]$.` }],
          hints: [t`Now the conserved quantity is $v = u^2$ with flux $g = \tfrac23u^3$, so $s = [g]/[v]$.`, t`$s = \dfrac{\tfrac23(u_L^3 - u_R^3)}{u_L^2 - u_R^2}$.`],
          teach: 'Equations with the same smooth solutions can have different shock speeds: which quantity is truly conserved is physics, not algebra.',
          explain: t`$s = \dfrac{\tfrac23(${uL ** 3} - ${uR ** 3})}{${uL ** 2} - ${uR ** 2}} = ${r3(s2)}$ m/s, against $${r3(s1)}$ m/s when $u$ is conserved. Both laws agree wherever $u$ is smooth, but they disagree about jumps. In gas dynamics the conserved quantities are mass, momentum and energy — that choice is what makes shock speeds right, and why a numerical scheme must update exactly those.`,
        };
      },
    }),
    num({
      id: 'gas-behind', difficulty: 3,
      gen(r) {
        const M = r.pick([1.5, 2, 3]);
        const ratio = ((GAM + 1) * M * M) / ((GAM - 1) * M * M + 2), s = M * A1, v = s * (1 - 1 / ratio);
        return {
          prompt: t`A shock runs at $s = ${r3(s)}$ m/s into still air. The full gas-dynamic jump conditions say the air behind it is compressed by $\rho_2/\rho_1 = ${r3(ratio)}$. Apply Rankine–Hugoniot to **mass**, $\rho_t + (\rho v)_x = 0$ (density $\rho$, gas velocity $v$), to find how fast the air behind the shock moves, in m/s.`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [-0.2, 3.4], aspect: 'wide', xlabel: 'x', ylabel: 'ρ / ρ₁', axesAt: 'edge', xticks: 0, curves: [{ fn: `step(-x)*${r3(ratio)} + step(x)*1`, color: 'accent', width: 2.6 }], arrows: [{ from: [0, 3.05], to: [1.3, 3.05], color: 'warn', label: 'shock, speed s' }], points: [{ x: -2.4, y: ratio, label: 'moving gas', r: 0, color: 'accent', labelDy: -14 }, { x: 2, y: 1, label: 'still air', r: 0, color: 'accent', labelDy: -14 }] }, caption: 'The density across the shock (a mathematical jump; real shocks are a few mean free paths thick).' },
          answer: v, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: s / ratio, feedback: t`That is the gas speed relative to the shock, $s\rho_1/\rho_2$. In the ground frame, subtract it from $s$.` }, { value: s * ratio, feedback: t`Solve $s(\rho_2 - \rho_1) = \rho_2v_2$ for $v_2$.` }],
          hints: [t`Conserved quantity $\rho$, flux $\rho v$: $s\,(\rho_2 - \rho_1) = \rho_2v_2 - \rho_1\cdot0$.`, t`$v_2 = s\,(1 - \rho_1/\rho_2)$.`],
          teach: 'The same jump condition, s[u] = [f], applies to each conserved quantity of a real gas — mass first.',
          explain: t`$v_2 = ${r3(s)}\times(1 - 1/${r3(ratio)}) = ${r3(v)}$ m/s. The shock outruns the gas it sets moving. Applying the condition to momentum and energy as well gives the pressure and temperature jumps, and the density ratio used here.`,
        };
      },
    }),
    code({
      id: 'stuck-shock', difficulty: 3,
      prompt: t`Compare two upwind schemes on the Riemann problem $u_L = 1$, $u_R = 0$ for Burgers’ equation, on 400 cells of $[-4, 4]$ with $\Delta t = 0.5\,\Delta x$ up to $t = 2$ ($u \ge 0$ throughout, so upwind means “from the left”):

- conservative: $u_j \leftarrow u_j - \frac{\Delta t}{\Delta x}\big(F_j - F_{j-1}\big)$, $F = \tfrac12u^2$;
- non-conservative: $u_j \leftarrow u_j - \frac{\Delta t}{\Delta x}\,u_j\big(u_j - u_{j-1}\big)$.

Use \`left = np.concatenate(([u[0]], u[:-1]))\` for the left neighbours (the end cell copies itself). Write \`run(kind)\`, and set \`xc\` and \`xn\` to the position of each shock: the first cell centre where $u < 0.5$.`,
      starter: t`import numpy as np

N = 400
dx = 8 / N
x = -4 + dx * (np.arange(N) + 0.5)

def run(kind):
    u = np.where(x < 0, 1.0, 0.0)
    # step to t = 2 with dt = 0.5*dx; kind is 'conservative' or 'nonconservative'
    return u

def shock_at(u):
    return x[np.argmax(u < 0.5)]

xc = None
xn = None
print(xc, xn)
`,
      answer: t`import numpy as np

N = 400
dx = 8 / N
x = -4 + dx * (np.arange(N) + 0.5)

def run(kind):
    u = np.where(x < 0, 1.0, 0.0)
    t, dt = 0.0, 0.5 * dx
    while t < 2.0 - 1e-12:
        h = min(dt, 2.0 - t)
        left = np.concatenate(([u[0]], u[:-1]))
        if kind == 'conservative':
            u = u - h / dx * (0.5 * u**2 - 0.5 * left**2)
        else:
            u = u - h / dx * u * (u - left)
        t += h
    return u

def shock_at(u):
    return x[np.argmax(u < 0.5)]

xc = shock_at(run('conservative'))
xn = shock_at(run('nonconservative'))
print(xc, xn)`,
      tests: [
        { name: t`the conservative shock is within 0.05 of the Rankine–Hugoniot position $x = 1$`, code: 'xc is not None and abs(xc - 1.0) < 0.05' },
        { name: t`the non-conservative shock has not moved from $x = 0$`, code: 'xn is not None and abs(xn) < 0.05' },
      ],
      hints: ['Inside `run`: a `while` loop over time steps `h = min(0.5*dx, 2 - t)`, building `left` afresh each step.', 'Conservative: `u = u - h/dx*(0.5*u**2 - 0.5*left**2)`. Non-conservative: `u = u - h/dx*u*(u - left)`.', '`xc = shock_at(run("conservative"))`, and the same for `xn`.'],
      teach: 'A scheme must difference the conserved flux to move shocks at the Rankine–Hugoniot speed; a non-conservative form can converge to a wrong weak solution.',
      explain: t`The conservative scheme puts the shock at $x \approx 1.01$, where Rankine–Hugoniot says. The non-conservative one leaves it **exactly** at $x = 0$: at the jump, $u_j(u_j - u_{j-1})$ vanishes for $u_j = 0$ and for $u_j = u_{j-1} = 1$, so nothing ever moves. Both forms agree for smooth solutions; only the flux form knows what is conserved. This is why every shock-capturing code, relativistic ones included, updates conserved variables by flux differences.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-shock-tube', difficulty: 3, transfer: true,
      gen(r) {
        const pr = r.pick([2, 3, 5, 8]);
        const Ms = Math.sqrt(1 + ((GAM + 1) / (2 * GAM)) * (pr - 1)), s = Ms * A1;
        return {
          prompt: t`A shock tube on a test stand: a diaphragm bursts and a shock runs into still air at 20 °C ($a_1 = 343$ m/s, $\gamma = 1.4$). Behind it the pressure is ${pr} times higher. The Rankine–Hugoniot conditions for mass, momentum and energy of a perfect gas combine into $\dfrac{p_2}{p_1} = 1 + \dfrac{2\gamma}{\gamma + 1}\big(M_s^2 - 1\big)$, where $M_s = s/a_1$ is the shock’s Mach number. How fast does the shock travel, in m/s?`,
          visual: { type: 'graph', params: { x: [-4, 4], y: [0, 9.5], aspect: 'wide', xlabel: 'x along the tube', ylabel: 'p / p₁', axesAt: 'edge', xticks: 0, curves: [{ fn: `step(1 - x)*${pr} + step(x - 1)*1`, color: 'accent', width: 2.6, domain: [-1.5, 4] }], arrows: [{ from: [1, pr + 0.9], to: [2.4, pr + 0.9], color: 'warn', label: 'shock' }], vlines: [{ x: -1.5, label: 'diaphragm (burst)', color: 'ink3' }] }, caption: 'The pressure ahead of and behind the incident shock (schematic: the expansion running the other way, and the contact surface, are not drawn).' },
          answer: s, units: 'm/s', tol: { rel: 0.005 },
          errors: [{ value: A1 * pr, feedback: t`Solve for $M_s$ first: $M_s = \sqrt{1 + \frac{\gamma + 1}{2\gamma}(p_2/p_1 - 1)}$.` }, { value: A1 * (1 + ((GAM + 1) / (2 * GAM)) * (pr - 1)), feedback: t`That is $M_s^2 a_1$: take the square root.` }],
          hints: [t`$M_s^2 = 1 + \dfrac{\gamma + 1}{2\gamma}\Big(\dfrac{p_2}{p_1} - 1\Big)$.`, t`With $\gamma = 1.4$: $\frac{\gamma + 1}{2\gamma} = ${r3((GAM + 1) / (2 * GAM))}$.`, t`Then $s = M_s\,a_1$.`],
          teach: 'For a real gas, Rankine–Hugoniot applied to mass, momentum and energy ties a shock’s speed to its strength: stronger shocks are faster.',
          explain: t`$M_s = \sqrt{1 + ${r3((GAM + 1) / (2 * GAM))}\times${pr - 1}} = ${r3(Ms)}$, so $s = ${r3(Ms)}\times343 = ${r3(s)}$ m/s. A weak shock ($p_2/p_1 \to 1$) moves at the speed of sound — the characteristic speed — and a strong one outruns it, just as a Burgers shock’s speed is the average of the characteristic speeds on its sides. The bright Mach disks in a rocket’s exhaust (its “shock diamonds”) are standing normal shocks obeying the same relations, with the exhaust flowing through them.`,
        };
      },
    }),
    num({
      id: 'cp-riemann-position', difficulty: 2,
      gen(r) {
        const uL = r.pick([1.5, 2]), uR = r.pick([-0.5, 0, 0.5]), x0 = r.pick([-1, 0, 1]), tt = r.pick([2, 3]);
        const xs = x0 + ((uL + uR) / 2) * tt;
        return {
          prompt: t`At $t = 0$, Burgers’ equation has $u = ${uL}$ m/s for $x < ${x0}$ and $u = ${uR}$ m/s for $x > ${x0}$. Where is the shock at $t = ${tt}$ s?`,
          visual: { type: 'graph', params: { x: [-3, 8], y: [-0.8, 2.3], aspect: 'wide', xlabel: 'x (m)', ylabel: 'u at t = 0 (m/s)', axesAt: 'edge', curves: [{ fn: `step(${x0} - x)*${uL} + step(x - ${x0})*${uR}`, color: 'accent', width: 2.6 }], hlines: [{ y: 0, color: 'ink3' }] }, caption: 'The initial jump.' },
          answer: xs, units: 'm', tol: { rel: 0, abs: 0.02 },
          errors: [{ value: x0 + uL * tt, feedback: 'The shock does not move at the speed behind it; it moves at the average of the two sides.' }, { value: ((uL + uR) / 2) * tt, feedback: t`It starts at $x = ${x0}$.` }].filter((e) => Math.abs(e.value - xs) > 0.03),
          hints: [t`$s = \tfrac12(u_L + u_R)$; $x_s = x_0 + st$.`],
          teach: 'A Riemann shock for Burgers moves at the average of the two states, from where the jump started.',
          explain: t`$s = \tfrac12(${uL} + ${uR}) = ${(uL + uR) / 2}$ m/s, so $x_s = ${x0} + ${(uL + uR) / 2}\times${tt} = ${r3(xs)}$ m.`,
        };
      },
    }),
    mcq({
      id: 'cp-entropy', difficulty: 2,
      prompt: t`For the jump $u_L = 0$, $u_R = 1$, both a jump moving at speed $\tfrac12$ and the fan $u = x/t$ are weak solutions of Burgers’ equation. Why is the fan the physical one?`,
      visual: burg({ profile: 'step', uL: 0, uR: 1, t: 2, tmax: 3, x: [-3, 4], fold: false, tstar: false }, 'The fan solution of the jump from 0 to 1: characteristics (teal) spread out from the origin.'),
      choices: ['A jump there would have characteristics leaving it on both sides (uL < s < uR), violating the entropy condition; the fan is what a small viscosity gives as it goes to zero', 'The jump violates the Rankine–Hugoniot condition', 'The fan conserves ∫u dx and the jump does not', 'Both are physical; experiments decide case by case'],
      answer: 0,
      why: {
        1: t`The jump at speed $\tfrac12$ satisfies Rankine–Hugoniot exactly: $\tfrac12(0 + 1) = \tfrac12$.`,
        2: 'Both are weak solutions, so both conserve ∫u dx.',
        3: 'The mathematics picks one: the entropy condition, which is the vanishing-viscosity limit, selects exactly one weak solution.',
      },
      hints: ['Draw the characteristics on each side of the would-be shock: do they run into it or away from it?'],
      teach: 'Weak solutions need an extra rule, the entropy condition (u_L > s > u_R for Burgers), to be unique and physical.',
      explain: t`An “expansion shock” would create information out of nothing — characteristics would emerge from it rather than end on it. Adding a tiny viscosity, $u_t + uu_x = \nu u_{xx}$, and letting $\nu \to 0$ always gives the fan. In gas dynamics the same rule says entropy can only rise across a shock: compression shocks exist, expansion shocks do not.`,
    }),
  ],
  sources: [SRC.evans, LEVEQUE, ANDERSON, { label: 'M. J. Lighthill & G. B. Whitham, On kinematic waves II: a theory of traffic flow on long crowded roads, Proc. R. Soc. Lond. A 229, 317 (1955)', url: 'https://doi.org/10.1098/rspa.1955.0089' }],
});
