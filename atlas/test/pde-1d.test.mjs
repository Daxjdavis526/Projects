// The exact 1D PDE solutions behind the pde-player and pde-walk simulations:
// each is checked against its own equation by finite differences, against the
// verified answer keys of the research notes, and against conserved quantities
// (mass for heat and transport, energy for waves); the random walk against its
// exact binomial law and the diffusion limit; and the sims' validators.
//   node atlas/test/pde-1d.test.mjs

import * as M from '../src/viz/model/pde-1d.js';
import { simpson } from '../src/viz/model/numeric.js';
import { validate as vPlayer, defaults as dPlayer } from '../src/viz/sims/pde-player.js';
import { validate as vWalk, defaults as dWalk } from '../src/viz/sims/pde-walk.js';

let pass = 0, fail = 0;
function check(name, ok, detail = '') {
  if (ok) pass++;
  else { fail++; console.log(`FAIL  ${name}${detail ? '  — ' + detail : ''}`); }
}
const close = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const PROF = ['gauss', 'box', 'tri', 'rough'];

// erfc: agrees with 1 − erf where both are accurate, and keeps its precision far out
check('erfc(0.5) = 0.4795001222', close(M.erfc(0.5), 0.4795001221869535, 1e-12));
check('erfc(5) = 1.5375e-12', close(M.erfc(5), 1.5374597944280349e-12, 1e-9));
check('erfc(−2) = 2 − erfc(2)', close(M.erfc(-2), 2 - 0.004677734981047266, 1e-12));

// profiles: the antiderivative differentiates to the profile
for (const k of PROF) {
  const pr = M.PROFILES[k];
  let worst = 0;
  for (let s = -2.9; s <= 2.9; s += 0.137) {
    if (k === 'box' && Math.abs(Math.abs(s) - 1) < 0.01) continue;
    const d = (pr.P(s + 1e-4) - pr.P(s - 1e-4)) / 2e-4;
    worst = Math.max(worst, Math.abs(d - pr.p(s)));
  }
  check(`profile ${k}: P′ = p`, worst < 2e-4, `worst ${worst}`);
  if (pr.dp) {
    let w2 = 0;
    for (let s = -2.9; s <= 2.9; s += 0.137) { if (Math.abs(Math.abs(s) - 1) < 0.01 || Math.abs(s) < 0.01) continue; w2 = Math.max(w2, Math.abs((pr.p(s + 1e-5) - pr.p(s - 1e-5)) / 2e-5 - pr.dp(s))); }
    check(`profile ${k}: dp = p′`, w2 < 1e-5, `worst ${w2}`);
  }
}

// ─── transport ───
{
  // research key: u_t + 2u_x = 0, u(x,0) = e^(−x²) ⇒ e^(−(x−2t)²), pulse centred at x = 4 at t = 2
  const o = { mode: 'transport', profile: 'gauss', c: 2, A: 1, w: 1, x0: 0 };
  check('transport: e^(−(x−2t)²) at (4, 2) is 1', close(M.solve(o, 4, 2), 1, 1e-12));
  check('transport: e^(−(x−2t)²) at (3, 1) is e^(−1)', close(M.solve(o, 3, 1), Math.exp(-1), 1e-12));
  // checkpoint key: u_t + 3u_x = 0, a feature at x = 1 is at x = 7 when t = 2
  check('transport: the feature at x = 1 is at x = 7 at t = 2 (c = 3)', close(M.along({ c: 3 }, 1, 2), 7, 1e-12));
  // decay: e^(−λt) f(x − ct) satisfies u_t + c u_x = −λu
  const od = { ...o, c: 1.3, lambda: 0.4, profile: 'rough', w: 1.2, x0: -1 };
  let worst = 0;
  for (const [x, t] of [[-0.5, 0.3], [0.7, 1.1], [2, 2.5], [1.1, 0.9]]) {
    const h = 1e-4, ut = (M.transport(od, x, t + h) - M.transport(od, x, t - h)) / (2 * h), ux = (M.transport(od, x + h, t) - M.transport(od, x - h, t)) / (2 * h);
    worst = Math.max(worst, Math.abs(ut + od.c * ux + od.lambda * M.transport(od, x, t)));
  }
  check('transport with decay satisfies u_t + c u_x = −λu', worst < 1e-6, `residual ${worst}`);
}
// variable speed: stretch c = a x ⇒ u = f(x e^(−at)) (research key u_t + x u_x = 0 ⇒ f(x e^(−t)))
{
  const o = { speed: 'stretch', c: 1, profile: 'gauss', w: 0.5, x0: 1, A: 1 };
  check('stretch: foot of (e, 1) is 1', close(M.foot(o, Math.E, 1), 1, 1e-12));
  let worst = 0;
  for (const [x, t] of [[0.5, 0.2], [1.5, 0.6], [2.5, 1.3]]) {
    const h = 1e-5, ut = (M.transport(o, x, t + h) - M.transport(o, x, t - h)) / (2 * h), ux = (M.transport(o, x + h, t) - M.transport(o, x - h, t)) / (2 * h);
    worst = Math.max(worst, Math.abs(ut + x * ux));
  }
  check('stretch solution satisfies u_t + x u_x = 0', worst < 1e-6, `residual ${worst}`);
}
// the river: characteristics follow dx/dt = c(x); foot and along are inverses; the PDE holds
{
  const o = { speed: 'river', c: 1.5, slow: 0.3, profile: 'gauss', w: 0.6, x0: -5, A: 1 };
  let worst = 0;
  for (const x0 of [-8, -4, -1, 0.5, 2.7, 5]) for (const t of [0.5, 2, 4]) worst = Math.max(worst, Math.abs(M.foot(o, M.along(o, x0, t), t) - x0));
  check('river: foot(along(x0, t), t) = x0', worst < 1e-6, `worst ${worst}`);
  // along solves dx/dt = c(x)
  let w2 = 0;
  for (const x0 of [-6, -2.5, 0, 2.8]) for (const t of [0.3, 1.7, 3.1]) {
    const h = 1e-4, v = (M.along(o, x0, t + h) - M.along(o, x0, t - h)) / (2 * h);
    w2 = Math.max(w2, Math.abs(v - M.speed(o, M.along(o, x0, t))) / M.speed(o, M.along(o, x0, t)));
  }
  check('river: characteristics move at c(x)', w2 < 1e-4, `worst rel ${w2}`);
  // travel time through the slow reach: ∫ dx/c(x) from −6 to 6 by quadrature
  const T = simpson((x) => 1 / M.speed(o, x), -6, 6, 4000);
  check('river: time from −6 to 6 is ∫dx/c', close(M.along(o, -6, T), 6, 1e-5), `${M.along(o, -6, T)}`);
  check('river: the slow reach really is slow', close(M.speed(o, 0.5), 1.5 * 0.3, 1e-3) && close(M.speed(o, -9), 1.5, 1e-6));
}

// ─── wave ───
{
  // research key: [f(x−ct) + f(x+ct)]/2 solves u_tt = c²u_xx
  for (const init of ['pluck', 'strike', 'right']) for (const profile of ['gauss', 'rough']) {
    const o = { mode: 'wave', init, profile, c: 1.7, A: 1, w: 0.9, x0: 0.4 };
    let worst = 0;
    for (const [x, t] of [[0.2, 0.3], [1.4, 0.8], [-2, 1.6], [3.1, 1.2]]) {
      const h = 1e-3, u = (a, b) => M.wave(o, a, b);
      const utt = (u(x, t + h) - 2 * u(x, t) + u(x, t - h)) / (h * h), uxx = (u(x + h, t) - 2 * u(x, t) + u(x - h, t)) / (h * h);
      worst = Math.max(worst, Math.abs(utt - o.c * o.c * uxx));
    }
    check(`wave (${init}, ${profile}) satisfies u_tt = c²u_xx`, worst < 2e-3, `residual ${worst}`);
    // initial data
    const h = 1e-5, f0 = M.wave(o, 0.7, 0), v0 = (M.wave(o, 0.7, h) - M.wave(o, 0.7, -h)) / (2 * h), p = M.initial(o, 0.7);
    const want = init === 'strike' ? [0, p] : init === 'right' ? [p, -o.c * (M.initial(o, 0.7 + h) - M.initial(o, 0.7 - h)) / (2 * h)] : [p, 0];
    check(`wave (${init}, ${profile}): initial displacement and velocity`, close(f0, want[0], 1e-6) && close(v0, want[1], 1e-5), `${f0} ${v0} vs ${want}`);
  }
  // a pluck splits into two half-height copies
  const o = { mode: 'wave', init: 'pluck', profile: 'gauss', c: 2, A: 1, w: 0.5, x0: 0 };
  check('pluck: two half-height pulses at x = ±ct', close(M.wave(o, 6, 3), 0.5, 1e-9) && close(M.wave(o, -6, 3), 0.5, 1e-9) && Math.abs(M.wave(o, 0, 3)) < 1e-12);
  // a strike leaves a plateau A w √π /(2c) between the fronts (gauss)
  const s = { ...o, init: 'strike' };
  check('strike: plateau of height (1/2c)∫g between the fronts', close(M.wave(s, 0, 4), (Math.sqrt(Math.PI) * 0.5) / (2 * 2), 1e-9));
  // energy: conserved, equal to c²∫(R′² + L′²); pluck starts all potential, ends half and half
  for (const init of ['pluck', 'strike', 'right']) for (const profile of ['gauss', 'tri', 'rough']) {
    const q = { mode: 'wave', init, profile, c: 1.5, A: 0.8, w: 0.7, x0: 0.3 };
    const Es = [0, 0.4, 1, 3].map((t) => M.waveEnergy(q, t));
    const spread = Math.max(...Es.map((e) => e.E)) - Math.min(...Es.map((e) => e.E));
    check(`energy conserved (${init}, ${profile})`, spread < 1e-4 * Es[0].E, `spread ${spread} of ${Es[0].E}`);
    if (init === 'pluck') check(`pluck (${profile}): all potential at t = 0, half and half once apart`, Es[0].K < 1e-12 && close(Es[3].K, Es[3].V, 1e-3), `${Es[0].K} ${Es[3].K} ${Es[3].V}`);
  }
  // closed form for the Gaussian pluck: E = c²A²√π/(2√2 w)
  {
    const q = { mode: 'wave', init: 'pluck', profile: 'gauss', c: 3, A: 0.5, w: 0.8, x0: 0 };
    const want = (9 * 0.25 * Math.sqrt(Math.PI)) / (2 * Math.SQRT2 * 0.8);
    check('Gaussian pluck energy c²A²√π/(2√2 w)', close(M.waveEnergy(q, 1.3).E, want, 1e-5), `${M.waveEnergy(q, 1.3).E} vs ${want}`);
  }
  check('square pluck: infinite energy', M.waveEnergy({ mode: 'wave', init: 'pluck', profile: 'box', c: 1, w: 1 }, 1).E === Infinity);
}

// ─── heat ───
{
  // research key: the kernel solves u_t = D u_xx and integrates to 1
  const D = 0.7;
  let worst = 0;
  for (const [x, t] of [[0.3, 0.5], [1.2, 1], [-2, 2.5]]) {
    const h = 1e-4, ut = (M.kernel(x, t + h, D) - M.kernel(x, t - h, D)) / (2 * h), uxx = (M.kernel(x + h, t, D) - 2 * M.kernel(x, t, D) + M.kernel(x - h, t, D)) / (h * h);
    worst = Math.max(worst, Math.abs(ut - D * uxx));
  }
  check('heat kernel satisfies u_t = D u_xx', worst < 1e-5, `residual ${worst}`);
  check('heat kernel integrates to 1', close(simpson((x) => M.kernel(x, 1.3, D), -20, 20, 4000), 1, 1e-9));
  check('heat kernel falls to 1/e of its peak at x = √(4Dt)', close(M.kernel(Math.sqrt(4 * D * 2), 2, D) / M.kernel(0, 2, D), Math.exp(-1), 1e-12));
  // every profile: satisfies the PDE, keeps its area, and tends to the initial data as t → 0
  for (const profile of PROF) {
    const o = { mode: 'heat', profile, D: 0.6, A: 1.3, w: 0.8, x0: 0.5 };
    let r = 0;
    for (const [x, t] of [[0.3, 0.2], [1.6, 0.5], [-1, 1.4], [3, 0.8]]) {
      const h = 1e-4, u = (a, b) => M.heat(o, a, b);
      const ut = (u(x, t + h) - u(x, t - h)) / (2 * h), uxx = (u(x + h, t) - 2 * u(x, t) + u(x - h, t)) / (h * h);
      r = Math.max(r, Math.abs(ut - o.D * uxx));
    }
    check(`heat (${profile}) satisfies u_t = D u_xx`, r < 1e-5, `residual ${r}`);
    const area0 = simpson((x) => M.initial(o, x), -10, 10, 8000), area = simpson((x) => M.heat(o, x, 1.7), -20, 20, 8000);
    check(`heat (${profile}) keeps its area`, close(area, area0, 2e-4), `${area} vs ${area0}`);
    let w0 = 0;
    for (const x of [-0.7, 0.1, 0.62, 1.05]) w0 = Math.max(w0, Math.abs(M.heat(o, x, 1e-7) - M.initial(o, x)));
    check(`heat (${profile}) starts from the initial profile`, w0 < 2e-3, `worst ${w0}`);
    // maximum principle: never above the initial maximum, which keeps falling
    const mx = (t) => { let m = -Infinity; for (let x = -6; x <= 6; x += 0.01) m = Math.max(m, M.heat(o, x, t)); return m; };
    const m0 = Math.max(...Array.from({ length: 2001 }, (_, i) => M.initial(o, -6 + i * 0.006)));
    const ms = [0.05, 0.3, 1, 3].map(mx);
    check(`heat (${profile}): the maximum never rises`, ms.every((m, i) => m <= (i ? ms[i - 1] : m0) + 1e-9), ms.join(' '));
    // spread: variance σ₀² + 2Dt
    const sd = M.heatSpread(o, 1.2);
    if (sd !== null) {
      const mean = simpson((x) => x * M.heat(o, x, 1.2), -25, 25, 8000) / area;
      const v = simpson((x) => (x - mean) ** 2 * M.heat(o, x, 1.2), -25, 25, 8000) / area;
      check(`heat (${profile}): variance σ₀² + 2Dt`, close(Math.sqrt(v), sd, 1e-4), `${Math.sqrt(v)} vs ${sd}`);
    }
  }
  // research key: a Gaussian keeps its shape with σ² = σ₀² + 2Dt
  const g = { mode: 'heat', profile: 'gauss', D: 0.5, A: 1, w: Math.SQRT2, x0: 0 };       // σ₀ = 1
  check('Gaussian: peak falls as σ₀/σ', close(M.heat(g, 0, 1.5), 1 / Math.sqrt(1 + 1.5), 1e-12));
  // infinite speed: a square pulse is felt (barely) far away at once
  const b = { mode: 'heat', profile: 'box', D: 1, A: 1, w: 1, x0: 0 };
  const far = M.heat(b, 9, 0.05), want = 0.5 * (M.erfc(8 / Math.sqrt(0.2)) - M.erfc(10 / Math.sqrt(0.2)));
  check('square pulse: positive far away at once, without cancellation', far > 0 && close(far, want, 1e-12) && far < 1e-100, `${far}`);
  // ripple decays like e^(−Dk²t) at early times
  const rgh = { mode: 'heat', profile: 'rough', D: 0.02, A: 1, w: 1, x0: 0 };
  const smooth = { ...rgh, profile: 'gauss' };
  const amp = (t) => (M.heat(rgh, Math.PI / (2 * 8), t) - M.heat(smooth, Math.PI / (2 * 8), t)) / M.heat(smooth, Math.PI / (2 * 8), t);
  check('ripple decays at about e^(−Dk²t)', close(amp(0.5) / amp(0), Math.exp(-0.02 * 64 * 0.5), 0.05), `${amp(0.5) / amp(0)} vs ${Math.exp(-0.64)}`);
}

// ─── random walk ───
{
  // exact law: binomial; variance n; it sums to 1
  let s = 0, v = 0;
  for (let m = -40; m <= 40; m++) { const p = M.walkProb(40, m); s += p; v += m * m * p; }
  check('walk law sums to 1', close(s, 1, 1e-12));
  check('walk law has variance n', close(v, 40, 1e-10));
  check('walk law: P(m = 0 after 2 hops) = ½', close(M.walkProb(2, 0), 0.5, 1e-12) && M.walkProb(3, 0) === 0);
  // and approaches the heat kernel with D = Δx²/2Δt (site spacing 2 for one parity)
  const n = 400, pk = M.walkProb(n, 10), g = 2 * M.kernel(10, n, 0.5);
  check('walk law → 2Φ(m, n) with D = ½ (lattice units)', close(pk, g, 0.01), `${pk} vs ${g}`);
  // simulated walkers: variance ≈ n, mean ≈ 0, deterministic for a seed
  const W = M.walkers(20000, 7);
  for (let i = 0; i < 100; i++) M.hop(W);
  const mo = M.moments(W.pos);
  check('20 000 walkers after 100 hops: variance ≈ 100', Math.abs(mo.variance - 100) < 4, `${mo.variance}`);
  check('20 000 walkers after 100 hops: mean ≈ 0', Math.abs(mo.mean) < 0.25, `${mo.mean}`);
  const W2 = M.walkers(50, 7), W3 = M.walkers(50, 7); for (let i = 0; i < 100; i++) { M.hop(W2); M.hop(W3); }
  check('a seed gives the same walk', W2.pos.every((x, i) => x === W3.pos[i]));
  const B = M.walkers(20000, 3); for (let i = 0; i < 100; i++) M.hop(B, 0.6);
  check('a biased walk drifts (2p − 1) per hop and has variance 4p(1 − p) per hop', Math.abs(M.moments(B.pos).mean - 20) < 0.5 && Math.abs(M.moments(B.pos).variance - 96) < 4);
}

// ─── the simulations' validators ───
check('pde-player defaults are valid', vPlayer({ ...dPlayer }).length === 0, vPlayer({ ...dPlayer }).join('; '));
check('pde-player rejects an unknown mode', vPlayer({ ...dPlayer, mode: 'laplace' }).length > 0);
check('pde-player rejects an unknown profile', vPlayer({ ...dPlayer, profile: 'spike' }).length > 0);
check('pde-player rejects a probe outside the window', vPlayer({ ...dPlayer, probe: [50, 1] }).length > 0);
check('pde-walk defaults are valid', vWalk({ ...dWalk }).length === 0, vWalk({ ...dWalk }).join('; '));
check('pde-walk rejects p outside (0, 1)', vWalk({ ...dWalk, p: 1.2 }).length > 0);

console.log(`pde-1d: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
