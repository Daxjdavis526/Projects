// The MATH 2280 boss, "The Phase Portrait Challenge": the flight-readiness
// review of Corvid, an imagined two-stage launch vehicle, followed from the pad
// to the end of the first-stage burn. The oxygen tank's ullage pressure sags at
// engine start (a linear first-order model solved with an integrating factor),
// and the flight computer must choose an integrator and step for it (orders of
// accuracy against cost); the stack sways on the pad as the engines light and
// the ignition overpressure kicks it (Laplace with a step and a shifted
// impulse), and a staggered start nearly cancels the sway (the transfer
// function at its poles); pogo grows from negative damping, and an accumulator
// detunes the feed line (resonance curves); in the roll axis the payload rides
// on the adapter (normal modes), and at max-q the pitch loop is classified by
// trace and determinant, then read off the phase portrait of a saturating
// controller (separatrices bound the states it can recover); and late in the
// burn a baffle raises the slosh frequency (a Neumann eigenvalue problem) while
// a tilted surface sloshes almost entirely in its first mode (a Fourier cosine
// coefficient). Every item names the lesson whose skill it measures; every
// number comes from its generator.
import { boss, mcq, multi, num } from '../../src/core/content.js';
import { tex, nice, fmt } from '../../src/core/format.js';

const t = String.raw;
const PI = Math.PI;
const G0 = 9.81;                              // m/s², as the prompts quote it
const r4 = (v) => +(+v).toFixed(4);
const r6 = (v) => +(+v).toPrecision(6);
const r12 = (v) => +(+v).toPrecision(12);     // for the calculus-check integrands
const tn = (x, n = 3) => tex(x, n);
/** Keep only the slips whose values are finite and clearly apart from the key (and a little apart from each other). */
function apart(errors, key, rel = 0.03, mutual = 0.012) {
  const kept = [];
  const far = (u, v, f) => Math.abs(u - v) > f * Math.max(Math.abs(u), Math.abs(v));
  for (const e of errors) {
    if (Number.isFinite(e.value) && far(e.value, key, rel) && kept.every((k) => far(e.value, k.value, mutual))) kept.push(e);
  }
  return kept;
}

// ── picture pieces for schematic graphs ──────────────────────────────────────
const seg = (a, b, color = 'ink3', width = 1.6, dash = false) => ({ param: [`${r4(a[0])} + t*${r4(b[0] - a[0])}`, `${r4(a[1])} + t*${r4(b[1] - a[1])}`], t: [0, 1], color, width, ...(dash ? { dash: true } : {}) });
const poly = (pts, color, width, dash) => pts.slice(1).map((p, k) => seg(pts[k], p, color, width, dash));
const tag = (x, y, label, color = 'ink2', dx = 0, dy = 0) => ({ x: r4(x), y: r4(y), r: 0, color, label, labelDx: dx, labelDy: dy });
const box = (x0, y0, x1, y1, color = 'ink2', width = 2.2) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], color, width);
/** A zigzag spring from x0 to x1 at height y. */
function spring(x0, x1, y, amp = 0.35, n = 6, color = 'gold') {
  const pts = [[x0, y]], L = x1 - x0, a = x0 + 0.15 * L, b = x1 - 0.15 * L;
  pts.push([a, y]);
  for (let k = 0; k < 2 * n; k++) pts.push([a + ((k + 0.5) / (2 * n)) * (b - a), y + (k % 2 ? -amp : amp)]);
  pts.push([b, y], [x1, y]);
  return poly(pts, color, 2);
}
const schematic = (params, caption) => ({ type: 'graph', params: { equal: true, axes: false, grid: false, xlabel: '', ylabel: '', aspect: 'wide', ...params }, caption });

// ── round 1: the ullage model and its integrators ───────────────────────────
/** The ullage model d(pV)/dt = G(pₛ − p) with V = V₀ + Qt, from p(0) = pₛ: p = p∞ + (pₛ − p∞)(V₀/V)^m. */
function ullage(r) {
  const ps = r.pick([420, 450, 480]), ratio = r.pick([3, 4]), Q = r.pick([0.2, 0.25, 0.3]), V0 = r.pick([2, 2.5, 3]);
  const G = r6(ratio * Q), m = ratio + 1, pinf = r6((ratio / (ratio + 1)) * ps), GQ = r6(G + Q);
  const p = (tt) => pinf + (ps - pinf) * (V0 / (V0 + Q * tt)) ** m;
  const f = (tt, y) => (G * ps - GQ * y) / (V0 + Q * tt);
  const fE = `(${r6(G * ps)} - ${GQ}*y)/(${V0} + ${Q}*t)`;
  const pE = (v) => `(${pinf} + ${r6(ps - pinf)}*(${V0}/(${V0} + ${Q}*${v}))^${m})`;
  return { ps, ratio, Q, V0, G, m, pinf, GQ, p, f, fE, pE };
}
const STEP = {
  euler: (f, x, y, h) => y + h * f(x, y),
  heun: (f, x, y, h) => { const k1 = f(x, y), k2 = f(x + h, y + h * k1); return y + (h * (k1 + k2)) / 2; },
  rk4: (f, x, y, h) => {
    const k1 = f(x, y), k2 = f(x + h / 2, y + (h / 2) * k1), k3 = f(x + h / 2, y + (h / 2) * k2), k4 = f(x + h, y + h * k3);
    return y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
  },
};
export function integrate(method, f, y0, T, h) {
  let y = y0;
  const n = Math.round(T / h);
  for (let i = 0; i < n; i++) y = STEP[method](f, i * h, y, h);
  return y;
}
// step sizes that divide 4 s into whole steps, largest first
const STEPS = [0.25, 0.2, 0.125, 0.1, 0.08, 0.05, 0.04, 0.025, 0.02, 0.0125, 0.01, 0.008, 0.005, 0.004, 0.0025, 0.002, 0.00125, 0.001, 0.0008, 0.0005, 0.0004, 0.00025, 0.0002, 0.000125, 0.0001, 0.00008, 0.00005, 0.00004, 0.000025, 0.00002, 0.00001];
/** A step size as TeX: 0.00005 → 5\times10^{-5}. */
const hT = (h) => (h >= 1e-3 ? String(h) : tex(h, 3));
/** A tolerance on the 1–2–5 ladder: the smallest at least x. */
function ladder(x) {
  const e = Math.floor(Math.log10(x));
  for (const k of [e, e + 1]) for (const m of [1, 2, 5]) if (m * 10 ** k >= x * (1 - 1e-12)) return +(m * 10 ** k).toPrecision(3);
  return 10 ** (e + 1);
}

// ── round 2: the stack on the pad ───────────────────────────────────────────
/** The first bending mode: ω, σ = ζω, ω_d. */
function mode(fn, z) {
  const w = 2 * PI * fn, s = z * w, wd = w * Math.sqrt(1 - z * z);
  return { w, s, wd };
}
/** Unit-step response of y″ + 2σy′ + ω²y = ω²u(t), from rest. */
const stepResp = ({ s, wd }, tt) => (tt <= 0 ? 0 : 1 - Math.exp(-s * tt) * (Math.cos(wd * tt) + (s / wd) * Math.sin(wd * tt)));
/** Impulse response of y″ + 2σy′ + ω²y = δ(t), from rest. */
const impResp = ({ s, wd }, tt) => (tt <= 0 ? 0 : (Math.exp(-s * tt) * Math.sin(wd * tt)) / wd);

// ── round 3: pogo ───────────────────────────────────────────────────────────
/** Steady amplitude over static deflection for drive ratio W and damping ratio z. */
const amp = (W, z) => 1 / Math.sqrt((1 - W * W) ** 2 + (2 * z * W) ** 2);

// ── round 4: attitude ───────────────────────────────────────────────────────
const A_AERO = 2, KP = 6, KD = 3;   // per unit pitch inertia, s⁻² and s⁻¹; angles in degrees
/** The saturating pitch loop θ′ = q, q′ = aθ − u·tanh((k_pθ + k_dq)/u), in degrees and seconds. */
export function pitchLoop(u) {
  const f = (x, y) => [y, A_AERO * x - u * Math.tanh((KP * x + KD * y) / u)];
  // the saddles ±θ*, where the aerodynamic torque equals the controller's
  let lo = 0.1 * u / A_AERO, hi = u / A_AERO + 1;
  const g = (x) => A_AERO * x - u * Math.tanh((KP * x) / u);
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (g(mid) < 0) lo = mid; else hi = mid; }
  const ts = (lo + hi) / 2, sech2 = 1 - Math.tanh((KP * ts) / u) ** 2;
  const b = KD * sech2, c = A_AERO - KP * sech2;            // λ² + bλ − c = 0 at the saddle
  const ls = (-b - Math.sqrt(b * b + 4 * c)) / 2, lu = (-b + Math.sqrt(b * b + 4 * c)) / 2;
  return { f, ts, ls, lu };
}
/** Does the loop bring (θ, q) back to rest? RK4 for 40 s. */
export function recovers(u, th, q) {
  const { f } = pitchLoop(u), h = 0.004;
  for (let i = 0; i < 10000; i++) {
    const k1 = f(th, q), k2 = f(th + (h / 2) * k1[0], q + (h / 2) * k1[1]), k3 = f(th + (h / 2) * k2[0], q + (h / 2) * k2[1]), k4 = f(th + h * k3[0], q + h * k3[1]);
    th += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    q += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    if (Math.abs(th) > 300) return false;
  }
  return Math.hypot(th, q) < 0.05;
}
// the four gust states, as multiples of θ* (θ, q): P and Q recover, R and S do not
const GUSTS = { P: [0.3, 0.5], Q: [1.3, -2], R: [0.5, 1.5], S: [-1.3, 0.3] };

// ── round 5: slosh ──────────────────────────────────────────────────────────
const sloshOmega = (k, a, h) => Math.sqrt(a * k * Math.tanh(k * h));

export default boss({
  title: 'The Phase Portrait Challenge',
  intro: t`*Corvid* is an imagined two-stage launch vehicle, and before its first flight comes the flight-readiness review. You follow the first stage from the pad to the end of its burn, and every question the review asks is a differential equation: a tank’s pressure as the engines start, the stack swaying on the pad, a vibration that feeds on itself, the pitch loop at maximum dynamic pressure, propellant sloshing in its tank. Model it, choose the method, solve it — and say what the vehicle will do. Five rounds, eleven problems, no hints, one try each.`,
  pass: 0.7,
  rounds: [
    {
      title: 'Pressurization',
      story: t`Engine start draws liquid oxygen out of the first-stage tank faster than anything else in the flight. The helium that keeps the tank pressurized has to keep up, or the turbopump starves. The propulsion team wants a model of the gas above the liquid — and an integrator the flight computer can afford.`,
      items: [
        num({
          id: 'r1-ullage', skill: 'math2280.DE-2.2', difficulty: 3,
          gen(r) {
            const U = ullage(r), T = r.pick([3, 4, 5]);
            const { ps, Q, V0, G, m, pinf, GQ, p } = U;
            const V = V0 + Q * T, pT = p(T), drop = ps - pT;
            const constV = ps - (pinf + (ps - pinf) * Math.exp((-GQ * T) / V0));
            return {
              prompt: t`Corvid’s first-stage oxygen tank is pressurized with helium. Before the engines start, the gas above the liquid — the **ullage** — fills $V_0 = ${V0}$ m³ at the regulator’s pressure, $p_s = ${ps}$ kPa. From engine start ($t = 0$) liquid oxygen leaves at $Q = ${Q}$ m³/s, so the ullage grows, $V = ${V0} + ${Q}\,t$ m³. Helium flows in through an orifice from the regulator. In a linearized teaching model with the gas held at one temperature, $$\frac{d}{dt}\big(pV\big) = G\,(p_s - p),\qquad G = ${G}\ \text{m}^3/\text{s},$$ where $p$ is the ullage pressure. How far has $p$ fallen below $p_s$ at $t = ${T}$ s? Give 3 significant figures.`,
              answer: drop, units: 'kPa', tol: { rel: 0.005 },
              // for the calculus check: the fall is −∫p′ dt, with the claimed solution substituted into the equation
              integrand: `-(${r6(G * ps)} - ${GQ}*${U.pE('t')})/(${V0} + ${Q}*t)`, vars: { t: [0, T] }, limits: [0, T],
              errors: apart([
                { value: ps * (1 - V0 / V), feedback: t`That is Boyle’s law alone — $pV$ held fixed, as if no helium flowed in. The inflow $G(p_s - p)$ props the pressure up as the ullage grows.` },
                { value: constV, feedback: t`That holds the ullage at $V_0$. It grows by ${Math.round((100 * Q * T) / V0)}% in ${T} s, and the coefficient $(G + Q)/V$ shrinks as it does: integrate it, do not freeze it.` },
                { value: (ps - pinf) * (1 - V0 / V), feedback: t`Check the integrating factor: $\int\frac{G + Q}{V_0 + Qt}\,dt = \frac{G + Q}{Q}\ln V$, so it is $V^{(G+Q)/Q} = V^{${m}}$, not $V$.` },
                { value: pT, feedback: t`That is the pressure itself. The question asks how far it has fallen below $p_s = ${ps}$ kPa.` },
              ], drop),
              hints: [
                t`Expand with the product rule, $\frac{d}{dt}(pV) = Vp' + pV'$ with $V' = Q$, and collect: $p' + \dfrac{G + Q}{V}\,p = \dfrac{G\,p_s}{V}$ — linear in $p$.`,
                t`The integrating factor is $e^{\int (G+Q)/V\,dt} = V^{(G+Q)/Q} = V^{${m}}$. It turns the left side into $\big(V^{${m}}p\big)'$.`,
                t`The solution is $p = p_\infty + (p_s - p_\infty)\left(\dfrac{V_0}{V}\right)^{${m}}$ with $p_\infty = \dfrac{G\,p_s}{G + Q}$.`,
              ],
              teach: t`A first-order linear equation $y' + P(t)\,y = R(t)$ is solved by the integrating factor $e^{\int P\,dt}$ — here a power of the growing ullage volume.`,
              explain: t`With $V' = Q$ the model reads $Vp' + Qp = G(p_s - p)$, that is $$p' + \frac{G + Q}{V_0 + Qt}\,p = \frac{G\,p_s}{V_0 + Qt}.$$ The integrating factor is $V^{(G+Q)/Q} = V^{${m}}$, and $\big(V^{${m}}p\big)' = Gp_s V^{${m - 1}}$ integrates to $\frac{G p_s}{G+Q}V^{${m}} + C$. With $p(0) = p_s$: $$p = p_\infty + (p_s - p_\infty)\left(\frac{V_0}{V}\right)^{${m}},\qquad p_\infty = \frac{G\,p_s}{G + Q} = ${nice(pinf)}\ \text{kPa}.$$ At $t = ${T}$ s, $V = ${nice(r6(V))}$ m³ and $p = ${tn(pT, 4)}$ kPa: a fall of $${tn(drop)}$ kPa. The pressure sags toward $p_\infty$, where the helium flowing in just keeps pace with the liquid flowing out — the orifice sets how far it sags, and the turbopump’s inlet must tolerate that. A teaching model: real helium cools as the ullage expands and is warmed by the tank walls, and a regulator’s flow is not linear in $p_s - p$.`,
              visual: {
                type: 'de-slopefield',
                params: {
                  f: U.fE, x: [0, 2 * T], y: [Math.floor(pinf - 25), ps + 15], xlabel: 't (s)', ylabel: 'p (kPa)', grid: [21, 13], aspect: 'wide',
                  isoclines: [0], seeds: [{ t: 0, y: Math.round(pinf - 15), color: 'teal' }, { t: 0, y: Math.round(pinf + 0.45 * (ps - pinf)), color: 'violet' }],
                  points: [{ x: 0, y: ps, label: 'start: pₛ', color: 'gold', labelDx: 8, labelDy: -6 }],
                  vlines: [{ x: T, label: `t = ${T} s`, color: 'ink3' }],
                },
                caption: t`The slope field of the ullage equation. The gold dashed line is where $p' = 0$, the level $p_\infty$; two other solutions (from lower starting pressures) are drawn, not the one asked about. The model holds the gas at one temperature.`,
              },
            };
          },
        }),
        mcq({
          id: 'r1-integrator', skill: 'math2280.DE-2.8', difficulty: 3,
          gen(r) {
            const U = ullage(r), Tend = 4;
            const exact = U.p(Tend);
            const E = Object.fromEntries(['euler', 'heun', 'rk4'].map((k) => [k, Math.abs(integrate(k, U.f, U.ps, Tend, 1) - exact)]));
            const tol = ladder(2 * E.rk4);
            const hH = STEPS.find((h) => E.heun * h ** 2 <= tol / 2), hE = STEPS.find((h) => E.euler * h <= tol / 2);
            const nH = Math.round((2 * Tend) / hH), nE = Math.round(Tend / hE);
            const tolT = tn(tol, 1);
            return {
              prompt: t`The flight computer re-runs the ullage model of the last problem every control cycle, now for a tank with $p_s = ${U.ps}$ kPa, $V_0 = ${U.V0}$ m³, $Q = ${U.Q}$ m³/s and $G = ${U.G}$ m³/s: $$p' = \frac{${r6(U.G * U.ps)} - ${U.GQ}\,p}{${U.V0} + ${U.Q}\,t},\qquad p(0) = ${U.ps},$$ from $t = 0$ to $4$ s. It must keep the error in $p(4)$ below $${tolT}$ kPa while evaluating the right-hand side as few times as possible: Euler evaluates it once per step, improved Euler twice and RK4 four times. A ground run with $h = 1$ s, against the exact solution, gave these errors in $p(4)$: $$\begin{array}{l|c} \text{method} & \text{error at } h = 1\ \text{s} \\ \hline \text{Euler} & ${tn(E.euler, 2)}\ \text{kPa} \\ \text{improved Euler} & ${tn(E.heun, 2)}\ \text{kPa} \\ \text{RK4} & ${tn(E.rk4, 2)}\ \text{kPa} \end{array}$$ Which integrator and step should it fly?`,
              choices: [t`RK4 with $h = 1$ s`, t`RK4 with $h = 2$ s`, t`Improved Euler with $h = ${hT(hH)}$ s`, t`Euler with $h = ${hT(hE)}$ s`],
              answer: 0,
              why: {
                1: t`It is the cheapest — 8 evaluations — but RK4’s error grows as $h^4$: doubling $h$ multiplies it by about $16$, to roughly $${tn(16 * E.rk4, 2)}$ kPa, over the $${tolT}$ kPa limit.`,
                2: t`It meets the limit (its error falls as $h^2$, to about $${tn(E.heun * hH ** 2, 2)}$ kPa), but it takes ${nH} evaluations, against RK4’s 16 at $h = 1$ s.`,
                3: t`It meets the limit, but Euler’s error falls only in proportion to $h$: it needs ${nE.toLocaleString('en-GB').replace(/,/g, ' ')} evaluations. One evaluation per step is cheap; a million steps are not.`,
              },
              hints: [
                t`A method of order $p$ has error about $Ch^p$ at a fixed end time: Euler $p = 1$, improved Euler $p = 2$, RK4 $p = 4$. Scale each measured error to other step sizes.`,
                t`For each method find the largest $h$ that meets $${tolT}$ kPa, then count the evaluations: (number of steps $4/h$) × (evaluations per step).`,
              ],
              teach: t`The cheapest accurate integrator is the one whose error, scaled by its order $h^p$, meets the tolerance with the fewest function evaluations — usually a high-order method with a moderate step.`,
              explain: t`RK4 already meets $${tolT}$ kPa at $h = 1$ s (error $${tn(E.rk4, 2)}$ kPa) for $4 \times 4 = 16$ evaluations; at $h = 2$ s its error would be about $16$ times larger, $${tn(16 * E.rk4, 2)}$ kPa — too big. Improved Euler must shrink $h$ until $${tn(E.heun, 2)}\,h^2$ (with $h$ in s) is under the limit, $h = ${hT(hH)}$ s, which costs ${nH} evaluations; Euler, with error proportional to $h$, needs ${nE.toLocaleString('en-GB').replace(/,/g, ' ')}. The higher the order, the faster the error falls as the step shrinks — which is why RK4 and its adaptive cousins are the default for smooth problems like this one.`,
              visual: {
                type: 'de-stepper',
                params: {
                  f: U.fE, exact: U.pE('t'), t0: 0, y0: U.ps, T: Tend, hs: [2, 1, 0.5], h: 1,
                  methods: ['euler', 'heun', 'rk4'], method: 'euler', views: ['run'], view: 'run', compare: true, readout: false, errorPlot: false,
                  xlabel: 't (s)', ylabel: 'p (kPa)',
                },
                caption: t`The three methods with $h = 1$ s against the exact solution, $p$ in kPa. At this scale RK4’s polygon cannot be told from the exact curve; the numbers are in the table.`,
              },
            };
          },
        }),
      ],
    },
    {
      title: 'Ignition on the pad',
      story: t`Corvid lights its engines while clamps still hold it to the pad. The engines’ thrust line sits a little off the stack’s centre, so the stack bends, and the pressure wave from ignition, reflected out of the flame trench, kicks it. The clamps should let go when the top is near vertical.`,
      items: [
        num({
          id: 'r2-twang', skill: 'math2280.DE-6.3', difficulty: 4,
          gen(r) {
            const fn = r.pick([0.4, 0.5, 0.6]), z = r.pick([0.01, 0.02, 0.03]), ys = r.pick([0.08, 0.1, 0.12]), vo = r.pick([0.04, 0.06, 0.08]), to = r.pick([0.2, 0.3]);
            const M = mode(fn, z);
            const y = (tt) => ys * stepResp(M, tt) + vo * impResp(M, tt - to);
            const Ts = [2, 2.5, 3, 3.5, 4].filter((T) => Math.abs(y(T)) >= 0.2 * ys);
            const T = r.pick(Ts), Y = 100 * y(T);
            const w2 = r6(M.w * M.w);
            return {
              prompt: t`In its first bending mode, the sideways deflection $y$ (in m) of the top of Corvid’s stack obeys $$y'' + 2\zeta\omega\,y' + \omega^2 y = \omega^2 y_s\,u(t) + v_0\,\delta(t - ${to}),$$ with $\omega = 2\pi(${fn}\ \text{Hz})$ and damping ratio $\zeta = ${z}$, starting at rest. The step is the bending from the off-centre thrust, which would deflect the top by $y_s = ${ys}$ m if held steadily; the impulse is the ignition overpressure arriving at $t = ${to}$ s, which alone would set the top moving at $v_0 = ${vo}$ m/s. The clamps release at $t = ${T}$ s. Where is the top then, in cm? (Positive is the way the thrust pushes it.) Give 3 significant figures.`,
              answer: Y, units: 'cm', tol: { rel: 0.005 },
              errors: apart([
                { value: 100 * ys * stepResp(M, T), feedback: t`That is the thrust’s step alone. The overpressure impulse is still ringing at $t = ${T}$ s: add its response, $v_0\,h(t - ${to})$.` },
                { value: 100 * (ys * stepResp(M, T) + vo * impResp(M, T)), feedback: t`The impulse arrives at $t = ${to}$ s, not at $0$: by the shift theorem its response is $v_0\,h(t - ${to})\,u(t - ${to})$.` },
                { value: 100 * (ys * stepResp(M, T) + vo * M.wd * impResp(M, T - to)), feedback: t`The impulse response of $y'' + 2\zeta\omega y' + \omega^2y$ is $e^{-\zeta\omega t}\sin(\omega_d t)/\omega_d$: divide by $\omega_d$.` },
                { value: 100 * vo * impResp(M, T - to), feedback: t`That is the impulse alone. The step’s response, $y_s\big(1 - e^{-\zeta\omega t}(\cos\omega_d t + \tfrac{\zeta\omega}{\omega_d}\sin\omega_d t)\big)$, is the bigger part.` },
              ], Y),
              hints: [
                t`Transform: $\big(s^2 + 2\zeta\omega s + \omega^2\big)Y = \dfrac{\omega^2 y_s}{s} + v_0e^{-${to}s}$. The two terms can be inverted separately and added.`,
                t`With $\sigma = \zeta\omega$ and $\omega_d = \omega\sqrt{1 - \zeta^2}$: $\mathcal{L}^{-1}\left\{\dfrac{1}{s^2 + 2\sigma s + \omega^2}\right\} = \dfrac{e^{-\sigma t}\sin\omega_d t}{\omega_d}$, and $\mathcal{L}^{-1}\left\{\dfrac{\omega^2}{s(s^2 + 2\sigma s + \omega^2)}\right\} = 1 - e^{-\sigma t}\left(\cos\omega_d t + \dfrac{\sigma}{\omega_d}\sin\omega_d t\right)$.`,
                t`The factor $e^{-${to}s}$ delays the impulse’s response by ${to} s. Evaluate both parts at $t = ${T}$ s, with your calculator in radians.`,
              ],
              teach: t`The Laplace transform turns a step and a delayed impulse into one algebraic equation; each forcing’s response is inverted on its own, the delay becomes a shift in time, and the two add.`,
              explain: t`Transforming, $$Y(s) = \frac{\omega^2 y_s}{s\,(s^2 + 2\sigma s + \omega^2)} + \frac{v_0\,e^{-${to}s}}{s^2 + 2\sigma s + \omega^2},$$ with $\omega = ${tn(M.w, 4)}$ rad/s, $\sigma = \zeta\omega = ${tn(M.s, 3)}\ \text{s}^{-1}$ and $\omega_d = ${tn(M.wd, 4)}$ rad/s. Inverting, $$y = y_s\Big[1 - e^{-\sigma t}\big(\cos\omega_d t + \tfrac{\sigma}{\omega_d}\sin\omega_d t\big)\Big] + \frac{v_0}{\omega_d}\,e^{-\sigma(t - ${to})}\sin\big(\omega_d(t - ${to})\big)\,u(t - ${to}).$$ At $t = ${T}$ s the step’s part is $${tn(100 * ys * stepResp(M, T))}$ cm and the impulse’s $${tn(100 * vo * impResp(M, T - to))}$ cm, so the top is at $${tn(Y)}$ cm. Lightly damped, the stack swings out to nearly twice $y_s$ and back again once every $${tn((2 * PI) / M.wd)}$ s, so the release time matters. The Space Shuttle’s stack swayed like this when its main engines lit, and its solid boosters were ignited several seconds later, when the stack had swung back near vertical. One mode, a point impulse: a teaching model of a structure with many modes.`,
              visual: {
                type: 'graph',
                params: {
                  x: [-0.4, T + 0.6], y: [-0.25, 1.6], xlabel: 't (s)', ylabel: 'forcing', yticks: 0, aspect: 'wide',
                  curves: [{ fn: 'step(x)', color: 'accent', width: 2.6, domain: [-0.4, T + 0.6] }],
                  arrows: [{ from: [to, 0], to: [to, 1.45], color: 'bad', width: 2.6, label: 'overpressure impulse', labelDx: 8, labelDy: 2 }],
                  vlines: [{ x: T, label: 'clamps release', color: 'gold' }],
                  points: [tag(0.9 * T, 1, 'thrust bending (step)', 'accent', -40, -12)],
                },
                caption: t`The two forcings, not to scale with each other: the thrust’s bending switched on at $t = 0$ as a step, and the overpressure as an impulse at $t = ${to}$ s (an arrow, since $\delta$ has no height). Real overpressure lasts a few milliseconds.`,
              },
            };
          },
        }),
        num({
          id: 'r2-stagger', skill: 'math2280.DE-6.5', difficulty: 4,
          gen(r) {
            const fn = r.pick([0.4, 0.5, 0.6]), z = r.pick([0.02, 0.03, 0.05]);
            const M = mode(fn, z), d = PI / M.wd, ratio = (Math.exp(M.s * d) - 1) / 2;
            return {
              prompt: t`Instead of lighting all its engines at once, Corvid’s controller could light half of them at $t = 0$ and the other half at $t = d$. The stack’s bending mode has transfer function $$H(s) = \frac{\omega^2}{s^2 + 2\zeta\omega s + \omega^2},\qquad \omega = 2\pi(${fn}\ \text{Hz}),\quad \zeta = ${z},$$ from the thrust’s bending (as a static deflection) to the top’s deflection, and each half of the engines makes half the step. Choose $d$ so that the second half cancels as much of the sway as it can. Then, at any time after $d$, the sway that remains is what fraction of the sway that lighting all the engines at once would leave? Give 3 significant figures.`,
              answer: ratio, tol: { rel: 0.005 },
              errors: apart([
                { value: (1 + Math.exp(M.s * 2 * d)) / 2, feedback: t`A delay of a whole period lights the second half in step with the first sway: the two add. Cancel with half a period, $d = \pi/\omega_d$, where the second half’s sway is opposite.` },
                { value: (1 - Math.exp(-M.s * d)) / 2, feedback: t`Compare at the same time $t$: the second half’s sway started later, so it has decayed **less**, by $e^{-\sigma(t - d)}$ against $e^{-\sigma t}$ — the factor is $e^{+\sigma d}$.` },
                { value: Math.exp(M.s * d) - 1, feedback: t`Each half makes half the step: the residue at each pole is scaled by $\tfrac12\big|1 + e^{-pd}\big|$, not $\big|1 + e^{-pd}\big|$.` },
              ], ratio),
              hints: [
                t`The thrust is $\tfrac12u(t) + \tfrac12u(t - d)$, so $Y = H(s)\,\dfrac{1 + e^{-sd}}{2s}$. The sway comes from the poles $p = -\sigma \pm i\omega_d$ of $H$ ($\sigma = \zeta\omega$, $\omega_d = \omega\sqrt{1 - \zeta^2}$).`,
                t`Compared with lighting all at once ($Y = H/s$), each pole’s term is multiplied by $\tfrac12\big(1 + e^{-pd}\big)$. With $p = -\sigma + i\omega_d$, $e^{-pd} = e^{\sigma d}e^{-i\omega_d d}$.`,
                t`$\big|1 + e^{\sigma d}e^{-i\omega_d d}\big|$ is (very nearly) smallest when $\omega_d d = \pi$, where it is $e^{\sigma d} - 1$. So the fraction is $\tfrac12\big(e^{\sigma d} - 1\big)$ with $\sigma d = \pi\zeta/\sqrt{1 - \zeta^2}$.`,
              ],
              teach: t`A linear system’s free motion lives at the poles of $H(s)$: an input whose transform nearly vanishes at those poles excites almost no sway — the idea behind input shaping.`,
              explain: t`The staggered thrust transforms to $\frac{1 + e^{-sd}}{2s}$, so every pole’s term in the response is the all-at-once term times $\tfrac12(1 + e^{-pd})$. At $p = -\sigma + i\omega_d$, with $\sigma = ${tn(M.s, 3)}\ \text{s}^{-1}$ and $\omega_d = ${tn(M.wd, 4)}$ rad/s, the second half’s sway is opposite the first’s when $\omega_d d = \pi$: $d = ${tn(d)}$ s, half a damped period. Then $\big|1 + e^{-pd}\big| = e^{\sigma d} - 1$, and the fraction left is $$\tfrac12\big(e^{\sigma d} - 1\big) = \tfrac12\big(e^{${tn(M.s * d, 3)}} - 1\big) = ${tn(ratio)}.$$ It does not depend on the frequency at all — only on $\zeta$. The cancellation is not perfect because the first half’s sway has decayed a little by the time the second half lights; splitting the thrust unequally, in the ratio $1 : e^{-\sigma d}$, would cancel it exactly. This is **input shaping** (Singer and Seering, 1990), used to slew flexible spacecraft and cranes without ringing; real engine clusters are often lit in a staggered sequence to soften their start-up loads.`,
              visual: {
                type: 'de-poles',
                params: { poles: [{ re: r4(-M.s), im: r4(M.wd) }], drag: false, readout: false, panels: ['s', 't'], response: 'step', T: r4(4 / fn), window: { re: [-6, 1.5], im: [-4.6, 4.6] }, labels: true, tname: 'y/yₛ' },
                caption: t`The bending mode’s poles $-\sigma \pm i\omega_d$, just left of the imaginary axis, and the sway after lighting all the engines at once, as a fraction of the static deflection. One mode only: a real stack has more.`,
              },
            };
          },
        }),
      ],
    },
    {
      title: 'Pogo',
      story: t`Lift-off. As propellant burns, the stack’s lengthwise vibration and the engines’ propellant feed can lock together: a surge of thrust shakes the tanks, the shaking surges the flow into the pumps, and the flow surges the thrust. This is **pogo**, and it shook Titan II and Saturn V.`,
      items: [
        num({
          id: 'r3-pogo', skill: 'math2280.DE-3.5', difficulty: 3,
          gen(r) {
            const f = r.pick([5.5, 8, 11]), zs = r.pick([0.01, 0.015, 0.02]), dz = r.pick([0.005, 0.01, 0.015]), zp = r6(zs + dz);
            const w = 2 * PI * f, grow = dz * w, t10 = Math.log(10) / grow;
            return {
              prompt: t`Corvid’s first lengthwise mode vibrates at $f = ${f}$ Hz, and the structure alone damps it with damping ratio $\zeta_s = ${zs}$. For part of the burn, the coupling to the engines’ feed system feeds energy in, which the review models as a negative damping ratio $-\zeta_p$ with $\zeta_p = ${zp}$. So the mode’s amplitude $x$ obeys $$x'' + 2(\zeta_s - \zeta_p)\,\omega\,x' + \omega^2 x = 0,\qquad \omega = 2\pi f.$$ How long does a small vibration take to grow tenfold? Give 3 significant figures.`,
              answer: t10, units: 's', tol: { rel: 0.005 },
              errors: apart([
                { value: Math.log(10) / (dz * f), feedback: t`The growth rate is $|\zeta|\,\omega$ with $\omega = 2\pi f$ in rad/s, not $|\zeta| f$.` },
                { value: Math.log(2) / grow, feedback: t`That is the doubling time. Tenfold needs $\ln 10$, not $\ln 2$.` },
                { value: 1 / grow, feedback: t`That is the time to grow by a factor $e$. Tenfold takes $\ln 10 \approx 2.30$ times longer.` },
                { value: Math.log(10) / (zp * w), feedback: t`The structure’s own damping still acts: the net damping ratio is $\zeta_s - \zeta_p = -${r6(dz)}$, not $-\zeta_p$.` },
              ], t10),
              hints: [
                t`The characteristic roots are $r = -\zeta\omega \pm i\omega\sqrt{1 - \zeta^2}$ with $\zeta = \zeta_s - \zeta_p$. Which sign is the real part?`,
                t`With $\zeta = -${r6(dz)}$ the motion is $e^{${r6(dz)}\,\omega t}$ times an oscillation: the envelope grows at the rate $${r6(dz)}\,\omega$ per second.`,
                t`Solve $e^{${r6(dz)}\,\omega t} = 10$: $t = \dfrac{\ln 10}{${r6(dz)}\,\omega}$, with $\omega = 2\pi(${f})$ rad/s.`,
              ],
              teach: t`The real part of the characteristic roots sets the envelope: $\zeta < 0$ puts them in the right half-plane, and the vibration grows as $e^{|\zeta|\omega t}$ — a self-excited oscillation.`,
              explain: t`The net damping ratio is $\zeta = ${zs} - ${zp} = -${r6(dz)}$, so the roots $r = -\zeta\omega \pm i\omega\sqrt{1 - \zeta^2}$ have real part $+${r6(dz)}\times${tn(w, 4)} = ${tn(grow)}\ \text{s}^{-1}$: the envelope grows as $e^{${tn(grow)}t}$. Tenfold takes $t = \ln 10/${tn(grow)} = ${tn(t10)}$ s — a few seconds of a burn of minutes. Pogo is a closed loop between structure and propulsion; folding it into one negative damping term is a teaching model, good near the frequency where the loop locks. On Apollo 6 the Saturn V’s pogo reached about $\pm0.6\,g$ near 5 Hz, and the cure was the next problem.`,
              visual: {
                type: 'c3-roots',
                params: { mode: 'free', zeta: -dz, w0: r4(w), x0: 1, v0: 0, T: 1, sliders: false, readout: false, yname: 'x' },
                caption: t`The two characteristic roots, just right of the imaginary axis (top), and the first second of the motion from a small start (below), with its growing envelope. The feed-system coupling is folded into a negative damping ratio — a teaching model.`,
              },
            };
          },
        }),
        num({
          id: 'r3-accumulator', skill: 'math2280.DE-3.6', difficulty: 3,
          gen(r) {
            const fs = r.pick([10, 11, 12]), f1 = r6(fs + r.pick([0.8, 1, 1.5])), z1 = r.pick([0.04, 0.05, 0.06]), f2 = r.pick([4, 4.5, 5]), z2 = r.pick([0.2, 0.25, 0.3]);
            const W1 = fs / f1, W2 = fs / f2, M1 = amp(W1, z1), M2 = amp(W2, z2), F = M1 / M2;
            const noSq = (W, z) => 1 / Math.sqrt((1 - W) ** 2 + (2 * z * W) ** 2);
            const curve = (fr, z, color, label, at) => ({ fn: `log10(1/sqrt((1 - (x/${fr})^2)^2 + (${2 * z}*x/${fr})^2))`, color, width: 2.4, label, labelAt: at });
            return {
              prompt: t`To break the pogo loop, the review adds a helium-charged **accumulator** at the oxygen pump’s inlet. The pressure oscillation $p$ in the feed line, driven by the structure’s vibration at $f_s = ${fs}$ Hz, obeys $$p'' + 2\zeta\omega_f\,p' + \omega_f^2\,p = \omega_f^2 P\cos(2\pi f_s t),$$ where $P$ is the size of the drive and $\omega_f = 2\pi f_f$ is the line’s own resonance. Without the accumulator $f_f = ${f1}$ Hz and $\zeta = ${z1}$. The accumulator’s soft gas pocket lowers the resonance to $f_f = ${f2}$ Hz, and the orifice into it raises the damping ratio to $\zeta = ${z2}$. By what factor does it cut the steady amplitude of $p$? Give 3 significant figures.`,
              answer: F, tol: { rel: 0.005 },
              errors: apart([
                { value: Math.abs(1 - W2 * W2) / Math.abs(1 - W1 * W1), feedback: t`That leaves out the damping. Near resonance — and the old line, at $f_s/f_f = ${tn(W1)}$, is near it — the damping term $2\zeta\Omega$ decides the amplitude.` },
                { value: 1 / F, feedback: t`That is the factor upside down: the accumulator makes the amplitude smaller, so it cuts it by a factor greater than 1.` },
                { value: noSq(W1, z1) / noSq(W2, z2), feedback: t`The steady amplitude is $\dfrac{P}{\sqrt{(1 - \Omega^2)^2 + (2\zeta\Omega)^2}}$, with $\Omega^2$, not $\Omega$, in the first term.` },
                { value: amp(W1, z1), feedback: t`That is the old amplification, $\big[(1 - \Omega^2)^2 + (2\zeta\Omega)^2\big]^{-1/2}$ at $\Omega = ${tn(W1)}$. Divide by the new one.` },
              ], F),
              hints: [
                t`For $p'' + 2\zeta\omega_f p' + \omega_f^2 p = \omega_f^2P\cos\omega t$ the steady amplitude is $\dfrac{P}{\sqrt{(1 - \Omega^2)^2 + (2\zeta\Omega)^2}}$ with $\Omega = \omega/\omega_f = f_s/f_f$.`,
                t`Before: $\Omega = ${fs}/${f1}$, $\zeta = ${z1}$. After: $\Omega = ${fs}/${f2}$, $\zeta = ${z2}$. The factor is the ratio of the two amplitudes.`,
              ],
              teach: t`A driven oscillator’s steady amplitude depends on how close the drive is to its resonance; moving the resonance far below the drive (Ω ≫ 1) turns amplification into isolation.`,
              explain: t`Before, $\Omega = ${fs}/${f1} = ${tn(W1)}$ — close to resonance — and the amplification is $\big[(1 - \Omega^2)^2 + (2\zeta\Omega)^2\big]^{-1/2} = ${tn(M1)}$. After, $\Omega = ${fs}/${f2} = ${tn(W2)}$ and it is $${tn(M2)}$: the line now barely follows the drive. The amplitude falls by a factor of $${tn(F)}$, and with it the thrust surges that close the pogo loop. Saturn V’s cure after Apollo 6 was of this kind: helium injected into a cavity in each F-1 engine’s oxygen prevalve, a gas spring that lowered the feed line’s resonance. A one-mode teaching model of a feed system with many.`,
              visual: {
                type: 'graph',
                params: {
                  x: [0, 20], y: [-1.6, 1.5], xlabel: 'drive frequency (Hz)', ylabel: 'amplitude (log scale)', yticks: 0, aspect: 'wide',
                  curves: [curve(f1, z1, 'bad', 'without', f1 + 2.5), curve(f2, z2, 'good', 'with accumulator', 1.6)],
                  vlines: [{ x: fs, label: 'structure', color: 'gold' }],
                },
                caption: t`The feed line’s steady response against drive frequency, without (red) and with (green) the accumulator, on a logarithmic scale with its numbers left off. The gold line is the structure’s vibration.`,
              },
            };
          },
        }),
      ],
    },
    {
      title: 'Max-q',
      story: t`A minute into the flight Corvid passes maximum dynamic pressure, where the air pushes hardest. Its centre of pressure sits ahead of its centre of mass, so the air tries to turn it sideways, and the attitude controller swivels the engines to hold it straight. The guidance team checks the control loops.`,
      items: [
        num({
          id: 'r4-roll', skill: 'math2280.DE-4.5', difficulty: 3,
          gen(r) {
            const J1 = r.pick([6000, 8000, 10000]), J2 = r.pick([1500, 2000, 2500]), ka = r.pick([4, 5, 6]) * 1e6, wc = r.pick([1.5, 2]);
            const kc = r6((J1 + J2) * wc * wc);
            const A = J1 * J2, B = J2 * (kc + ka) + J1 * ka, C = kc * ka, D = Math.sqrt(B * B - 4 * A * C);
            const wH = Math.sqrt((B + D) / (2 * A)), wL = Math.sqrt((B - D) / (2 * A)), fH = wH / (2 * PI);
            const kaT = t`${ka / 1e6}\times10^{6}`;
            return {
              prompt: t`In roll, Corvid’s second stage and its payload are two rotors on one axis. The stage has moment of inertia $J_1 = ${J1}$ kg m² about the axis and the payload $J_2 = ${J2}$ kg m²; the payload adapter between them twists like a torsion spring of stiffness $k_a = ${kaT}$ N m/rad. The roll controller pushes the stage back toward its target like a torsion spring to the stars, $k_c = ${kc}$ N m/rad (its rate damping is left out here). With roll angles $\phi_1$ (stage) and $\phi_2$ (payload), $$J_1\phi_1'' = -k_c\phi_1 - k_a(\phi_1 - \phi_2),\qquad J_2\phi_2'' = -k_a(\phi_2 - \phi_1).$$ What is the frequency of the higher normal mode, in Hz? Give 3 significant figures.`,
              answer: fH, units: 'Hz', tol: { rel: 0.005 },
              errors: apart([
                { value: wH, feedback: t`That is the angular frequency $\omega$ in rad/s. The frequency in Hz is $\omega/2\pi$.` },
                { value: Math.sqrt(ka / J2) / (2 * PI), feedback: t`That treats the stage as fixed, the payload twisting on the adapter alone. The stage twists back the other way: in this mode both rotors move, opposite each other.` },
                { value: Math.sqrt(ka / J1) / (2 * PI), feedback: t`That is the stage twisting on the adapter against a fixed payload — the heavier rotor alone. Solve the two equations together.` },
                { value: Math.sqrt(ka / (J1 + J2)) / (2 * PI), feedback: t`Adding the inertias describes the two rotors turning together; but then the adapter does not twist at all. In the higher mode they turn against each other.` },
              ], fH),
              hints: [
                t`Try $\phi = \mathbf v\cos\omega t$. Then $\big(K - \omega^2 J\big)\mathbf v = \mathbf 0$ with $J = \text{diag}(J_1, J_2)$ and $K = \begin{bmatrix} k_c + k_a & -k_a \\ -k_a & k_a \end{bmatrix}$.`,
                t`A nonzero $\mathbf v$ needs $\det(K - \omega^2J) = 0$: $\;J_1J_2\,\omega^4 - \big[J_2(k_c + k_a) + J_1k_a\big]\omega^2 + k_ck_a = 0$, a quadratic in $\omega^2$.`,
                t`Take the larger root for $\omega^2$, then $f = \omega/2\pi$.`,
              ],
              teach: t`Normal modes of $J\phi'' = -K\phi$ come from $\det(K - \omega^2J) = 0$; each root $\omega^2$ is a mode in which every part moves at the same frequency.`,
              explain: t`With $\phi = \mathbf v\cos\omega t$, $\det(K - \omega^2J) = 0$ gives $$J_1J_2\,\omega^4 - \big[J_2(k_c + k_a) + J_1k_a\big]\omega^2 + k_ck_a = 0,$$ whose roots are $\omega^2 = ${tn(wL * wL, 3)}$ and $${tn(wH * wH, 4)}\ \text{s}^{-2}$. The higher mode has $\omega = ${tn(wH, 4)}$ rad/s, $f = ${tn(fH)}$ Hz: stage and payload twisting against each other on the adapter, almost exactly the free–free value $\sqrt{k_a(1/J_1 + 1/J_2)}$ because the controller is so soft beside the adapter. The lower mode, $\omega = ${tn(wL)}$ rad/s, is the whole vehicle turning together under control. That gap — a factor of $${Math.round(wH / wL)}$ — is what lets a controller ignore the flexible mode; if its bandwidth crept up toward the flexible mode it could pump energy into it. The derivative part of a real controller damps both modes.`,
              visual: schematic({
                x: [-0.6, 12], y: [-2.4, 2.6],
                curves: [
                  seg([0, -1.5], [0, 1.5], 'ink2', 3), ...[-1.2, -0.6, 0, 0.6, 1.2].map((y) => seg([0, y], [-0.4, y - 0.35], 'ink3', 1.4)),
                  ...spring(0, 2.2, 0), ...box(2.2, -1.5, 6.2, 1.5), ...spring(6.2, 8.4, 0, 0.3, 5, 'violet'), ...box(8.4, -0.9, 10.8, 0.9),
                ],
                arrows: [
                  { from: [3.4, 1.9], to: [5.0, 1.9], color: 'accent', width: 2, label: 'φ₁', labelDx: 6, labelDy: 4 },
                  { from: [9.0, 1.3], to: [10.2, 1.3], color: 'accent', width: 2, label: 'φ₂', labelDx: 6, labelDy: 4 },
                ],
                points: [tag(4.2, 0, 'stage J₁', 'ink', -26, 4), tag(9.6, 0, 'payload J₂', 'ink', -32, 4), tag(1.1, -0.6, 'controller', 'gold', -30, 18), tag(7.3, -0.5, 'adapter kₐ', 'violet', -30, 18), tag(0, 1.6, 'stars', 'ink3', -14, -8)],
                alt: 'Two blocks joined by a spring, the left one tied to a wall by another spring',
              }, 'The roll model drawn as a sketch: two rotors on one axis, the adapter a torsion spring between them and the controller a torsion spring from the stage to a fixed direction in space. Arrows show the sense of φ₁ and φ₂. Not to scale.'),
            };
          },
        }),
        mcq({
          id: 'r4-pitch', skill: 'math2280.DE-5.2', difficulty: 3,
          gen(r) {
            const a = r.pick([2, 2.5, 3, 4]), kind = r.pick(['saddle', 'spiral', 'node']);
            let kp, kd;
            if (kind === 'saddle') { kp = a - r.pick([0.5, 1]); kd = r.pick([1.5, 2, 3]); }
            else if (kind === 'spiral') { kp = a + r.pick([2, 3, 4]); kd = r.pick([1, 1.5, 2]); }
            else { kp = a + r.pick([1, 1.5, 2]); kd = r.pick([4, 5]); }
            const tau = -kd, Del = r6(kp - a), disc = r6(tau * tau - 4 * Del);
            const ans = { saddle: 0, spiral: 1, node: 2 }[kind];
            const why = {};
            const nope = (k, s) => { if (k !== ans) why[k] = s; };
            nope(0, t`A saddle needs $\Delta < 0$. Here $\Delta = k_p - a = ${kp} - ${a} = ${nice(Del)} > 0$: the controller’s stiffness beats the air’s overturning push. (Reading $\Delta$ as $a - k_p$ flips the sign of the whole answer.)`);
            nope(1, kind === 'node'
              ? t`A spiral needs complex eigenvalues, $\tau^2 < 4\Delta$. Here $\tau^2 - 4\Delta = ${kd * kd} - ${nice(4 * Del)} = ${nice(disc)} > 0$: the eigenvalues are real, and the strong rate damping stops any overshoot.`
              : t`With $\Delta = ${nice(Del)} < 0$ the eigenvalues are real and of opposite signs — nothing turns, and one of them grows. A spiral needs $\Delta > 0$ and $\tau^2 < 4\Delta$.`);
            nope(2, kind === 'spiral'
              ? t`A node needs real eigenvalues, $\tau^2 \ge 4\Delta$. Here $\tau^2 - 4\Delta = ${kd * kd} - ${nice(4 * Del)} = ${nice(disc)} < 0$: they are complex, so the error overshoots and rings down.`
              : t`$\Delta = ${nice(Del)} < 0$ makes one eigenvalue positive. Real eigenvalues, yes, but of opposite signs: a saddle, not a stable node.`);
            why[3] = t`A centre needs $\tau = 0$ and $\Delta > 0$. The rate gain makes $\tau = -k_d = ${tau} \ne 0$${kind === 'saddle' ? t`, and here $\Delta < 0$ as well` : ''}.`;
            return {
              prompt: t`At max-q, Corvid’s pitch error $\theta$ (with $q = \theta'$) obeys, per unit of pitch inertia, $$\theta'' = a\,\theta - k_p\,\theta - k_d\,\theta',$$ where $a = ${a}\ \text{s}^{-2}$ is the air’s overturning push, and the controller’s gains are $k_p = ${kp}\ \text{s}^{-2}$ (stiffness) and $k_d = ${kd}\ \text{s}^{-1}$ (rate damping). As the system $\begin{bmatrix}\theta \\ q\end{bmatrix}' = \begin{bmatrix} 0 & 1 \\ a - k_p & -k_d\end{bmatrix}\begin{bmatrix}\theta \\ q\end{bmatrix}$, what kind of equilibrium is $\theta = q = 0$ at max-q?`,
              choices: [
                'A saddle: the vehicle turns away from almost every disturbed state',
                'A stable spiral: the pitch error overshoots and rings down',
                'A stable node: the pitch error dies away without overshooting',
                'A centre: the pitch error oscillates for ever at a fixed size',
              ],
              answer: ans, why,
              hints: [
                t`Compute the trace $\tau = -k_d$ and the determinant $\Delta = -(a - k_p) = k_p - a$.`,
                t`$\Delta < 0$: saddle. $\Delta > 0$ and $\tau < 0$: stable — a spiral if $\tau^2 < 4\Delta$, a node if $\tau^2 > 4\Delta$.`,
              ],
              teach: t`For a 2×2 linear system the trace and determinant alone decide the portrait: $\Delta < 0$ a saddle; $\Delta > 0$ with $\tau < 0$ stable, spiralling when $\tau^2 < 4\Delta$.`,
              explain: t`$\tau = -k_d = ${tau}$, $\Delta = k_p - a = ${nice(Del)}$, $\tau^2 - 4\Delta = ${nice(disc)}$. ${kind === 'saddle' ? t`With $\Delta < 0$ the eigenvalues have opposite signs: a **saddle**. The air’s push $a$ beats the controller’s stiffness, so the gain must rise before max-q — gain scheduling.` : kind === 'spiral' ? t`$\Delta > 0$, $\tau < 0$ and $\tau^2 < 4\Delta$: complex eigenvalues with negative real part, a **stable spiral**. A gust leaves a pitch error that overshoots and rings down.` : t`$\Delta > 0$, $\tau < 0$ and $\tau^2 > 4\Delta$: two negative real eigenvalues, a **stable node**. At lift-off, where $a = 0$ and $\Delta = ${kp}$, the same gains give $\tau^2 - 4\Delta = ${nice(r6(kd * kd - 4 * kp))}$ — ${kd * kd < 4 * kp ? 'a spiral; the air’s push has turned it into a node' : 'a node as well'}.`} On the map, the air’s push slides the point straight down from where it sits at lift-off by $a$. A linear model: it holds for small errors, and the next problem shows what happens when the controller runs out of authority.`,
              visual: {
                type: 'de-tracedet',
                params: {
                  tau: -kd, Delta: kp, drag: false, marker: false, labels: false, readout: false, panels: 'map', map: { tau: [-6, 2], Delta: [-3, 9] },
                  points: [{ tau: -kd, Delta: kp, label: 'lift-off (a = 0)', color: 'gold' }],
                },
                caption: t`The trace–determinant map with its region names left off. The gold point is the pitch loop at lift-off, where the air does not push; at max-q the air’s push moves it straight down by $a$.`,
              },
            };
          },
        }),
        multi({
          id: 'r4-recovery', skill: 'math2280.DE-5.1', difficulty: 4,
          gen(r) {
            const u = r.pick([16, 20, 24]), L = pitchLoop(u), ts = L.ts;
            const pts = Object.entries(GUSTS).map(([name, [mx, mq]]) => ({ name, th: Math.round(mx * ts), q: Math.round(mq * ts) }));
            const answer = pts.flatMap((p, i) => (recovers(u, p.th, p.q) ? [i] : []));
            const tsR = Math.round(ts * 10) / 10;
            const e = 0.25;
            const sep = (x0, lam, sgn, dir, color) => ({ x: r4(x0 + sgn * e), y: r4(sgn * e * lam), dir, color });
            const seeds = [];
            for (const x0 of [ts, -ts]) for (const sgn of [1, -1]) seeds.push(sep(x0, L.ls, sgn, 'backward', 'gold'), sep(x0, L.lu, sgn, 'forward', 'teal'));
            const choice = (p) => t`${p.name}: $\theta = ${p.th}^\circ$, $q = ${p.q}^\circ$/s`;
            return {
              prompt: t`Near max-q the pitch controller of the last problem has limited authority: the engines swivel only so far, so its push saturates at $${u}$ °/s². With $\theta$ in degrees and $q = \theta'$ in °/s, $$\theta' = q,\qquad q' = 2\theta - ${u}\tanh\!\left(\frac{6\theta + 3q}{${u}}\right).$$ The phase portrait shows the equilibria: straight flight at the origin and two more at $\theta = \pm${tsR}^\circ$, where the air’s push $2\theta$ equals the controller’s whole authority. The gold curves are the trajectories that run into those two equilibria. A gust can leave the vehicle at any of the states P, Q, R, S marked. From which of them does the controller bring it back to straight flight? Select all.`,
              choices: pts.map(choice),
              answer,
              why: {
                2: t`R starts at a smaller angle than the outer equilibria, but its rate carries it outward, across the gold separatrix: past it, the air’s push beats everything the controller can do. Being inside $\pm${tsR}^\circ$ is not enough.`,
                3: t`S is beyond the outer equilibrium at $-${tsR}^\circ$, and its small rate back toward zero is not enough to recross the separatrix: there the air’s push already exceeds the controller’s whole authority.`,
              },
              hints: [
                t`Linearize at the origin: the Jacobian is $\begin{bmatrix} 0 & 1 \\ 2 - 6 & -3 \end{bmatrix}$, $\tau = -3$, $\Delta = 4$ — a stable spiral. Near it, everything returns.`,
                t`At $\pm${tsR}^\circ$ the determinant is negative: saddles. The trajectories running into a saddle (gold) divide the states that spiral into the origin from those that run away.`,
                t`Recovery is decided by which side of the gold curves a state starts on, not by its angle alone: follow the direction arrows from each point.`,
              ],
              teach: t`In a nonlinear system the stable trajectories of saddles — separatrices — bound the region from which a stable equilibrium is reached; inside it, linear analysis holds, outside it no linear analysis can see.`,
              explain: t`Linearized at the origin the loop is a stable spiral ($\tau = -3$, $\Delta = 4$, $\tau^2 < 4\Delta$). At $\pm${tsR}^\circ$ the controller is saturated, its push no longer grows with $\theta$, and the Jacobian’s determinant is negative: saddles. The gold separatrices that run into them bound a slanting band of states that spiral home. ${answer.map((i) => pts[i].name).join(' and ')} lie inside it — Q even though its angle is beyond $${tsR}^\circ$, because its rate is carrying it back fast enough; R and S lie outside and run away, R despite its small angle. So the review asks not only “is the origin stable?” but “how big a gust can it take?” — the region of attraction, which saturation makes finite. The model is per unit inertia with one rigid pitch mode; a real autopilot also schedules its gains with dynamic pressure.`,
              visual: {
                type: 'de-plane',
                params: {
                  fx: 'y', fy: `2*x - ${u}*tanh((6*x + 3*y)/${u})`, x: [r4(-2.3 * ts), r4(2.3 * ts)], y: [r4(-4.5 * ts), r4(4.5 * ts)], equal: false, aspect: 'wide',
                  xlabel: 'θ (deg)', ylabel: 'q (deg/s)', grid: 17, equilibria: true, seeds, T: 20, readout: false, click: false,
                  points: pts.map((p) => ({ x: p.th, y: p.q, label: p.name, color: 'accent', labelDx: 8, labelDy: -6 })),
                },
                caption: t`The pitch loop’s phase plane (arrows show direction only). Gold: the trajectories that run into the two saddles; teal: the ones that leave them. Equilibria are coloured by type: green attracts, orange is a saddle. Rigid vehicle, one axis, per unit inertia.`,
              },
            };
          },
        }),
      ],
    },
    {
      title: 'Slosh',
      story: t`Late in the burn the tanks are nearly empty and the vehicle accelerates hard. The oxygen left in the tank can slosh from side to side, pushing the vehicle around just when the controller has least margin. The structures team proposes a baffle — a wall across the tank.`,
      items: [
        num({
          id: 'r5-baffle', skill: 'math2280.DE-8.2', difficulty: 3,
          gen(r) {
            const L = r.pick([3, 3.6, 4.2]), h = r.pick([1, 1.5, 2]), n = r.pick([1.5, 2, 2.5]), a = r6(n * G0);
            const k = (2 * PI) / L, w = sloshOmega(k, a, h), f = w / (2 * PI);
            const k1 = PI / L;
            return {
              prompt: t`The review models a slice across the oxygen tank as a box of width $L = ${L}$ m holding liquid $h = ${h}$ m deep, with the vehicle accelerating at $${n}g$, so the effective gravity is $a = ${a}$ m/s². Separating variables in the liquid’s flow gives a horizontal shape $X(x)$ with $$X'' + \lambda X = 0,\qquad X'(0) = X'(L) = 0,$$ because no liquid flows through a wall, and each eigenvalue $\lambda = k^2 > 0$ sloshes at $$\omega^2 = a\,k\tanh(kh).$$ A full-depth baffle is fitted across the middle of the tank, at $x = ${L / 2}$ m. What is the lowest slosh frequency now, in Hz? Give 3 significant figures.`,
              answer: f, units: 'Hz', tol: { rel: 0.005 },
              errors: apart([
                { value: sloshOmega(k1, a, h) / (2 * PI), feedback: t`That is the tank without the baffle, $k = \pi/L$. The baffle is a wall too: no flow through it, so each half is its own problem on $[0, L/2]$.` },
                { value: Math.sqrt(a * k) / (2 * PI), feedback: t`That drops the $\tanh(kh)$ — the deep-liquid limit. At $kh = ${tn(k * h)}$, $\tanh(kh) = ${tn(Math.tanh(k * h))}$, not $1$.` },
                { value: sloshOmega(k, G0, h) / (2 * PI), feedback: t`On the vehicle the liquid feels the thrust acceleration, $a = ${n}g = ${a}$ m/s², not $g$.` },
                { value: w, feedback: t`That is the angular frequency $\omega$ in rad/s. In Hz, divide by $2\pi$.` },
                { value: sloshOmega((4 * PI) / L, a, h) / (2 * PI), feedback: t`On a half of width $L/2$ the lowest mode is half a cosine wave across it, $k = \pi/(L/2)$; you used a full wave.` },
              ], f),
              hints: [
                t`With $\lambda = k^2 > 0$, $X = A\cos kx + B\sin kx$; $X'(0) = 0$ kills the sine, and $X'(\ell) = 0$ on a tank of width $\ell$ needs $\sin k\ell = 0$: $k = n\pi/\ell$.`,
                t`The baffle is a wall: each half, of width $\ell = L/2 = ${L / 2}$ m, has its own problem, so the lowest sloshing mode has $k = \pi/(L/2) = 2\pi/L$.`,
                t`$\omega = \sqrt{a\,k\tanh(kh)}$ with $k = 2\pi/${L}$, and $f = \omega/2\pi$.`,
              ],
              teach: t`Boundary conditions pick the eigenvalues: shrinking the interval a mode must fit in raises its lowest eigenvalue, and with it the frequency.`,
              explain: t`The walls give $X = \cos(n\pi x/\ell)$, $\lambda = (n\pi/\ell)^2$; $n = 0$ is the flat, still surface. Without the baffle $\ell = L$ and the lowest slosh has $k = \pi/L$: liquid piling up against one wall, then the other. The baffle makes each half a tank of width $L/2$, so $k = 2\pi/L = ${tn(k, 4)}\ \text{m}^{-1}$ and $$\omega = \sqrt{${a}\times${tn(k, 4)}\times\tanh(${tn(k * h)})} = ${tn(w)}\ \text{rad/s},\qquad f = ${tn(f)}\ \text{Hz},$$ up from $${tn(sloshOmega(k1, a, h) / (2 * PI))}$ Hz. Notice the mode it removed: $\cos(\pi x/L)$ has its surface node in the middle, but that is exactly where its flow sideways is fastest, and the wall stops it. Raising the slosh frequency away from the attitude controller’s bandwidth is the point. A two-dimensional teaching model: in a real cylindrical tank of radius $R$ the lowest mode has $k = 1.841/R$, from a zero of a Bessel function’s derivative, and real baffles are mostly rings that add damping.`,
              visual: schematic({
                x: [-0.8, L + 1.6], y: [-0.5, h + 1.1],
                shade: [{ fn: `${h}`, lower: '0', from: 0, to: L, color: 'accent', alpha: 0.3 }],
                curves: [...poly([[0, h + 0.7], [0, 0], [L, 0], [L, h + 0.7]], 'ink2', 2.6), seg([L / 2, 0], [L / 2, h + 0.5], 'gold', 3.2)],
                arrows: [
                  { from: [L + 0.8, h + 0.4], to: [L + 0.8, h - 0.6], color: 'bad', width: 2.4, label: 'a', labelDx: 8, labelDy: 4 },
                  { from: [0, -0.28], to: [L, -0.28], color: 'ink3', width: 1.4, label: `L = ${L} m`, labelDx: -L * 30, labelDy: 14 },
                ],
                points: [tag(L / 2, h + 0.5, 'baffle', 'gold', -20, -6), tag(-0.15, h / 2, `h = ${h} m`, 'ink2', -52, 4)],
                alt: 'A rectangular tank, partly full, with a wall across its middle',
              }, 'A slice across the tank, to scale, with the baffle (gold) dividing it in two. The effective gravity a points away from the nose, opposite the thrust. A two-dimensional model of a round tank.'),
            };
          },
        }),
        num({
          id: 'r5-fourier', skill: 'math2280.DE-8.3', difficulty: 3,
          gen(r) {
            const L = r.pick([3, 3.6, 4.2]), D = r.pick([8, 10, 12, 15]), s = D / L;
            const c1 = (-4 * D) / (PI * PI), h = 1.5, ex = 4;   // drawn depth and tilt exaggeration
            const surf = `${h} + ${r6((ex * s) / 100)}*(x - ${L / 2})`;
            return {
              prompt: t`Without the baffle, a pitch manoeuvre tilts the oxygen’s surface in a tank of width $L = ${L}$ m. When the manoeuvre ends, the surface is released from rest as a plane, ${D} cm higher at the far wall than at the near one: its height above the mean level is $$\eta(x, 0) = ${nice(r6(s))}\,\big(x - ${L / 2}\big)\ \text{cm},\qquad 0 \le x \le ${L}\ \text{m}.$$ It then sloshes as a sum of the tank’s modes, $\eta = \sum_n c_n\cos\dfrac{n\pi x}{L}\cos\omega_n t$. What is the first mode’s coefficient $c_1$, in cm, with its sign? Give 3 significant figures.`,
              answer: c1, units: 'cm', tol: { rel: 0.005 },
              integrand: `(2/${L})*${r12(s)}*(x - ${L / 2})*cos(pi*x/${L})`, vars: { x: [0, L] }, limits: [0, L],
              errors: apart([
                { value: c1 / 2, feedback: t`A cosine coefficient on $[0, L]$ is $\dfrac{2}{L}\displaystyle\int_0^L \eta\cos\frac{n\pi x}{L}\,dx$: the factor is $2/L$, not $1/L$.` },
                { value: -D / 2, feedback: t`That sets the mode’s size equal to the tilt’s height at the wall. The cosine and the straight line differ in shape, so the line’s first coefficient comes from the integral — and it is a bit larger than the wall height: $8/\pi^2$ of it.` },
                { value: (-8 * D) / (PI * PI), feedback: t`Check the integral: $\displaystyle\int_0^L\Big(x - \frac L2\Big)\cos\frac{\pi x}{L}\,dx = -\frac{2L^2}{\pi^2}$; times $\dfrac{2}{L}$ and the slope, that is $-\dfrac{4\,(${D})}{\pi^2}$ cm.` },
              ], c1),
              hints: [
                t`$c_1 = \dfrac{2}{L}\displaystyle\int_0^L \eta(x, 0)\cos\frac{\pi x}{L}\,dx$ — the modes $\cos(n\pi x/L)$ are orthogonal on $[0, L]$, and each has $\int_0^L\cos^2 = L/2$.`,
                t`Integrate by parts: $\displaystyle\int_0^L\Big(x - \frac L2\Big)\cos\frac{\pi x}{L}\,dx = \Big[\big(x - \tfrac L2\big)\tfrac{L}{\pi}\sin\tfrac{\pi x}{L}\Big]_0^L - \frac{L}{\pi}\int_0^L\sin\frac{\pi x}{L}\,dx = -\frac{2L^2}{\pi^2}$.`,
              ],
              teach: t`An initial shape is split into a boundary-value problem’s eigenfunctions by orthogonality: each coefficient is the shape’s projection onto that eigenfunction.`,
              explain: t`$$c_1 = \frac{2}{L}\int_0^L ${nice(r6(s))}\Big(x - \frac L2\Big)\cos\frac{\pi x}{L}\,dx = \frac{2}{L}\cdot${nice(r6(s))}\cdot\Big(-\frac{2L^2}{\pi^2}\Big) = -\frac{4\,(${D})}{\pi^2} = ${tn(c1)}\ \text{cm}.$$ The sign says the first mode starts high at the near wall, where $\cos 0 = 1$, and low at the far one — the tilt’s shape. Only odd $n$ appear, $c_n = -\dfrac{4\,(${D})}{n^2\pi^2}$ cm, so the first mode holds $c_1^2\big/\sum c_n^2 = 96/\pi^4 \approx 98.6\%$ of the slosh’s potential energy. That is why control engineers model a tank’s slosh as one pendulum, tuned to the first mode — and why the baffle of the last problem, which forbids exactly that mode, matters so much. Linear slosh: small amplitudes, no damping.`,
              visual: schematic({
                x: [-0.6, L + 0.6], y: [-0.3, h + 1],
                shade: [{ fn: surf, lower: '0', from: 0, to: L, color: 'accent', alpha: 0.3 }],
                curves: [...poly([[0, h + 0.8], [0, 0], [L, 0], [L, h + 0.8]], 'ink2', 2.6), { fn: surf, domain: [0, L], color: 'accent', width: 2.4 }, seg([0, h], [L, h], 'ink3', 1.4, true)],
                points: [tag(L, r4(h + (ex * D) / 200), 'tilted surface', 'accent', -96, -12), tag(0.1, h, 'mean level', 'ink3', 4, 16)],
                alt: 'A tank with its liquid surface tilted, higher at the right wall',
              }, `The tank at release, to scale except the tilt, which is drawn ${ex} times too steep. The dashed line is the mean level, η = 0.`),
            };
          },
        }),
      ],
    },
  ],
});
