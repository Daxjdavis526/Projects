// The geodesic lab, level 3 — the full equatorial geodesic equation
// ẍ^μ = −Γ^μ_αβ ẋ^α ẋ^β for (t, r, φ) as six first-order ODEs in proper time
// (G = c = 1), integrated with RK4, with E = (1 − 2M/r)ṫ, L = r²φ̇ and
// u·u = −1 as checks the integrator knows nothing about. On the orbit
// (rₚ, rₐ) = (7, 16)M over 2000M the three monitors converge to zero at
// order 4 (h = 4 … 0.5M); a planted sign error in Γʳᵣᵣ leaves E and L
// converging (their equations are untouched, and the wrong flow still
// conserves them) but u·u + 1 stuck at 3.8×10⁻³ for every h. Over 10⁵M at a
// deliberately coarse h = 8M RK4's errors grow linearly, in the Christoffel
// form and in the Hamiltonian form H = ½g^{μν}p_μp_ν, while the symplectic
// implicit midpoint rule keeps u·u bounded (E and L are exact in the
// Hamiltonian form). Circular orbits: the radial period 2π/ω, ω² =
// M(r − 6M)/(r³(r − 3M)), measured to five figures; inside 6M an unseeded
// circular orbit leaves anyway, sooner at coarser steps; plunges and the
// coordinate singularity of t at 2M; the ISCO's gravitational-wave frequency.
import { lesson, mcq, num, code } from '../../src/core/content.js';
import { tex } from '../../src/core/format.js';
import { apoState, orbitOf, geoRun, geoRHS, monitors, rk4, hamOf, midpoint, circular, epicyclic2, Veff, M_SUN_S, n12, lg } from './_geo.js';

const t = String.raw;

// ── the orbit (7, 16)M from apoapsis ──
const S = apoState(7, 16);
function maxMon(h, T, bug = null) {
  const mx = { E: 0, L: 0, U: 0 };
  geoRun(S.y, h, Math.round(T / h), { bug, each: (i, y) => { const m = monitors(y); mx.E = Math.max(mx.E, Math.abs(m.E - S.E)); mx.L = Math.max(mx.L, Math.abs(m.L - S.L)); mx.U = Math.max(mx.U, Math.abs(m.uu + 1)); } });
  return mx;
}
const HS = [4, 2, 1, 0.5];
const MON = HS.map((h) => maxMon(h, 2000)), BUGM = HS.map((h) => maxMon(h, 2000, 'Grrr'));
const ratio = (k, key) => MON[k][key] / MON[k + 1][key];
// the radial period, from successive apoapses
const TR = (() => { let last = S.y; const apo = []; geoRun(S.y, 0.5, 4000, { each: (i, y) => { if (last[4] > 0 && y[4] <= 0) apo.push(i * 0.5); last = y; } }); return (apo[apo.length - 1] - apo[0]) / (apo.length - 1); })();

// ── the Explore: 10³M to 10⁵M at h = 8M, the largest error in each window ──
const HX = 8, TX = 1e5, NW = 30, LO = 3;
const EDGES = Array.from({ length: NW + 1 }, (_, k) => 10 ** (LO + ((lg(TX) - LO) * k) / NW));
function windows(stepper, read) {
  const out = Array.from({ length: NW }, () => ({}));
  let j = 0;
  for (let i = 1; i * HX <= TX; i++) {
    const tau = i * HX, vals = read(stepper());
    while (j < NW - 1 && tau > EDGES[j + 1]) j++;
    if (tau < EDGES[0]) continue;
    for (const k in vals) out[j][k] = Math.max(out[j][k] ?? 0, Math.abs(vals[k]));
  }
  return out.map((o, k) => ({ tau: Math.sqrt(EDGES[k] * EDGES[k + 1]), ...o }));
}
const CHR = (() => { const F = geoRHS(1); let y = S.y; return windows(() => (y = rk4(F, y, HX)), (yy) => { const m = monitors(yy); return { E: m.E - S.E, L: m.L - S.L, U: m.uu + 1 }; }); })();
const HAM = hamOf(S.E, S.L);
const HRK = (() => { let z = [16, 0]; return windows(() => (z = rk4(HAM.F, z, HX)), (zz) => ({ U: 2 * HAM.H(zz) + 1 })); })();
const HMP = (() => { let z = [16, 0]; return windows(() => (z = midpoint(HAM.F, z, HX)), (zz) => ({ U: 2 * HAM.H(zz) + 1 })); })();
const wh = (k) => `step(0.5 - abs(cs - ${k}))`;
const winPts = (W, key, color, k) => W.filter((w) => w[key] > 0).map((w) => ({ x: n12(lg(w.tau)), y: n12(lg(w[key])), r: 4, color, when: wh(k) }));
const CROSS = HRK.find((w, i) => w.U > HMP[i].U)?.tau;

// an orbit drawn from the geodesic code's own run: points (r cos φ, r sin φ)
function orbitPic(St, ra, caption) {
  const pts = [];
  geoRun(St.y, 1, 800, { each: (i, y) => { if (i % 3 === 0) pts.push({ x: n12(y[1] * Math.cos(y[2])), y: n12(y[1] * Math.sin(y[2])), r: 1.5, color: 'accent' }); } });
  return { type: 'graph', params: { x: [-1.15 * ra, 1.15 * ra], y: [-1.15 * ra, 1.15 * ra], equal: true, aspect: 'wide', axesAt: 'edge', xlabel: 'x (M)', ylabel: 'y (M)', points: [...pts, { x: 0, y: 0, r: 5, color: 'void' }], curves: [{ param: ['2*cos(t)', '2*sin(t)'], t: [0, 2 * Math.PI], color: 'ink3', width: 1.2 }] }, caption };
}

// ── circular orbits ──
const Tr = (r) => (2 * Math.PI) / Math.sqrt(epicyclic2(r));
function kicked(rc, v) { const c = circular(rc), y = c.y.slice(), f = 1 - 2 / rc; y[4] = v; y[3] = Math.sqrt((1 + (y[4] * y[4]) / f + rc * rc * y[5] * y[5]) / f); return y; }
function measuredTr(rc) { const y0 = kicked(rc, -1e-4); let last = y0; const mins = []; geoRun(y0, 0.5, 8000, { each: (i, y) => { if (last[4] < 0 && y[4] >= 0) mins.push(i * 0.5); last = y; } }); return (mins[mins.length - 1] - mins[0]) / (mins.length - 1); }
const LEAVE = [1, 0.5, 0.25].map((h) => { const c = circular(5); let hit = null; geoRun(c.y, h, Math.round(4000 / h), { each: (i, y) => { if (hit === null && Math.abs(y[1] - 5) > 0.5) hit = i * h; } }); return hit; });
const VeffPic = (L, marks, caption, o = {}) => ({
  type: 'graph',
  params: {
    x: [2, o.xmax ?? 20], y: o.y ?? [0.86, 1.02], aspect: 'wide', axesAt: 'edge', xlabel: 'r (M)', ylabel: 'V(r)',
    curves: [{ fn: `(1 - 2/x)*(1 + ${n12(L * L)}/x^2)`, color: 'gold', width: 2.2, domain: [2.02, o.xmax ?? 20] }],
    vlines: [{ x: 6, color: 'ink4', label: 'ISCO 6M' }],
    points: marks,
  },
  caption,
});

// ── the code exercise: monitors at h = 2 and 1 over 1000M ──
const CODE = [2, 1].map((h) => maxMon(h, 1000));

export default lesson({
  id: 'st-f.F14.3',
  title: 'Level 3: the full geodesic equation with conserved-quantity checks',
  minutes: 18, difficulty: 4,
  equation: t`\ddot x^\mu = -\Gamma^\mu{}_{\alpha\beta}\,\dot x^\alpha\dot x^\beta`,
  intro: t`The last level solves the geodesic equation itself ([dissected in gr.EQ.2](#/lesson/gr.EQ.2)), with no shortcuts: in the equatorial plane the coordinates $x^\mu = (t, r, \varphi)$ and their proper-time derivatives make six first-order equations, the Christoffel symbols supplying the forces. This is how a general code works — the same loop would run for Kerr or any metric. But it gives up what levels 1 and 2 had built in. The time and angle symmetries of Schwarzschild make $E$ and $L$ constants ([Killing vectors, st-c.C18.2](#/lesson/st-c.C18.2)), and every timelike geodesic keeps its four-velocity normalized:

$$\begin{gathered} E = \Bigl(1 - \frac{2M}{r}\Bigr)\dot t, \qquad L = r^2\dot\varphi, \\ u\cdot u = -\Bigl(1 - \frac{2M}{r}\Bigr)\dot t^2 + \frac{\dot r^2}{1 - 2M/r} + r^2\dot\varphi^2 = -1 \end{gathered}$$

The integrator knows none of this — so these three numbers become **independent checks** on it. A healthy code’s monitors drift by tiny amounts that shrink at the method’s order; a buggy code’s do not.`,
  symbols: [
    { tex: 'x^\\mu', text: 'the coordinates $(t, r, \\varphi)$ of the particle, with $\\theta = \\pi/2$ (equatorial); Schwarzschild coordinates, $G = c = 1$, lengths and times in units of $M$' },
    { tex: t`\dot x^\mu`, text: 'the four-velocity $u^\\mu = dx^\\mu/d\\tau$; a dot is a derivative with respect to proper time $\\tau$' },
    { tex: t`\Gamma^\mu{}_{\alpha\beta}`, text: 'the Christoffel symbols of the Schwarzschild metric: five independent ones are non-zero in the equatorial plane (listed in the worked example)' },
    { tex: 'E', text: 'the conserved energy per unit mass ($E < 1$ for a bound orbit)' },
    { tex: 'L', text: 'the conserved angular momentum per unit mass' },
    { tex: t`u\cdot u`, text: 'the four-velocity’s squared length $g_{\\mu\\nu}u^\\mu u^\\nu$: exactly $-1$ for a massive particle (0 for light)' },
  ],
  why: 'Every geodesic code in astrophysics — ray tracers for black-hole images, EMRI waveform models, accretion-disk simulations — is checked this way, and the normalization drift is a small cousin of the constraint violations that numerical relativity monitors on every run ([gr.S29](#/lesson/gr.S29.d)).',
  visual: {
    type: 'graph',
    title: 'Drift against wobble',
    lead: t`The orbit $(r_p, r_a) = (7, 16)M$ for $10^5M$ of proper time — about ${Math.round(TX / TR)} radial periods — at a deliberately coarse step $h = 8M$, so that long-time behaviour shows in a short run. Each dot is the largest error in a window of time, on log–log axes. First RK4 on the six equations: all three monitors. Then the same orbit in **Hamiltonian form**, $H = \tfrac12 g^{\mu\nu}p_\mu p_\nu$ with $E = -p_t$ and $L = p_\varphi$, where only $u\cdot u = 2H$ can drift.`,
    tasks: [
      'RK4 on the geodesic equation: after the first few orbits every monitor climbs along a slope-1 line — errors growing in proportion to the time run.',
      'RK4 in Hamiltonian form: E and L cannot drift (they are the momenta of coordinates H does not contain), but u·u still climbs at slope 1.',
      `Implicit midpoint, a symplectic method, in the same form: u·u wobbles at a fixed level and never grows. It starts worse — it is only second order — and RK4 overtakes it ${CROSS ? `near τ = ${(CROSS / 1e4).toFixed(1)}×10⁴M` : 'late in the run'}.`,
    ],
    params: {
      x: [3, 5.05], y: [-8.5, -1], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'proper time τ (M)', ylabel: 'largest monitor error',
      choices: [{ key: 'cs', label: 'Integrator', options: [[1, 'RK4, geodesic equation'], [2, 'RK4, Hamiltonian form'], [3, 'implicit midpoint, Hamiltonian form']], value: 1, explain: 'The geodesic equation evolves (t, r, φ) and their velocities; the Hamiltonian form evolves r and its momentum with E and L held fixed.' }],
      points: [...winPts(CHR, 'E', 'gold', 1), ...winPts(CHR, 'L', 'violet', 1), ...winPts(CHR, 'U', 'accent', 1), ...winPts(HRK, 'U', 'accent', 2), ...winPts(HMP, 'U', 'accent', 3)],
      curves: [{ fn: '-6.2 + (x - 3)', color: 'ink4', width: 1.2, dash: true, domain: [3, 5.05], label: 'slope 1', labelAt: 4.6, labelDy: 14 }],
      legend: [{ label: '|ΔE|', color: 'gold', point: true }, { label: '|ΔL|', color: 'violet', point: true }, { label: '|u·u + 1|', color: 'accent', point: true }], legendAt: 'tl',
    },
    caption: 'Exact float64 runs, 12 500 steps each; 30 windows evenly spaced in log τ. The implicit equations are solved by fixed-point iteration to round-off. h = 8M is far coarser than a production run would use.',
  },
  example: {
    prompt: t`Integrate the orbit $(r_p, r_a) = (7, 16)M$ from apoapsis with RK4 for $2000M$ of proper time, at $h = 4, 2, 1$ and $0.5M$. Watch $E$, $L$ and $u\cdot u$. Then plant a bug — flip the sign of $\Gamma^r{}_{rr}$ — and watch again.`,
    visual: {
      type: 'graph',
      params: {
        x: [-0.45, 0.75], y: [-10.5, -1.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (M)', ylabel: 'largest drift in 2000M',
        points: [...HS.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(MON[i].E)), r: 5, color: 'gold' })), ...HS.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(MON[i].L)), r: 5, color: 'violet' })), ...HS.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(MON[i].U)), r: 5, color: 'accent' })), ...HS.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(BUGM[i].U)), r: 5, color: 'bad' }))],
        legend: [{ label: '|ΔE|', color: 'gold', point: true }, { label: '|ΔL|', color: 'violet', point: true }, { label: '|u·u + 1|', color: 'accent', point: true }, { label: '|u·u + 1|, with the bug', color: 'bad', point: true }], legendAt: 'br',
      },
      caption: 'The largest monitor errors over 2000M against the step, log–log. With the bug, E and L (not drawn) behave exactly as without it.',
    },
    steps: [
      { label: 'Initial data', text: t`From the apsides ([F14.2](#/lesson/st-f.F14.2)): $E = ${S.E.toFixed(6)}$, $L = ${S.L.toFixed(6)}M$. At $r = 16M$: $\dot r = 0$, $\dot t = E/(1 - 2M/r) = ${S.y[3].toFixed(6)}$, $\dot\varphi = L/r^2 = ${S.y[5].toFixed(6)}/M$; check $u\cdot u = -1$.` },
      { label: 'The equations', text: t`With $f = 1 - 2M/r$, the non-zero symbols are $\Gamma^t{}_{tr} = M/(r^2f)$, $\Gamma^r{}_{tt} = Mf/r^2$, $\Gamma^r{}_{rr} = -M/(r^2f)$, $\Gamma^r{}_{\varphi\varphi} = -rf$, $\Gamma^\varphi{}_{r\varphi} = 1/r$. So $$\begin{gathered} \ddot t = -2\Gamma^t{}_{tr}\dot t\dot r, \qquad \ddot\varphi = -\tfrac{2}{r}\dot r\dot\varphi, \\ \ddot r = -\Gamma^r{}_{tt}\dot t^2 - \Gamma^r{}_{rr}\dot r^2 - \Gamma^r{}_{\varphi\varphi}\dot\varphi^2 \end{gathered}$$ (the factor 2 because $\Gamma^t{}_{rt} = \Gamma^t{}_{tr}$ appears twice in the sum).` },
      { label: 'Monitors', text: t`At $h = 2M$ the largest drifts over $2000M$ (about ${Math.round(2000 / TR)} radial periods) are $|\Delta E| = ${tex(MON[1].E, 2)}$, $|\Delta L| = ${tex(MON[1].L, 2)}M$, $|u\cdot u + 1| = ${tex(MON[1].U, 2)}$. At $h = 1M$: $${tex(MON[2].E, 2)}$, $${tex(MON[2].L, 2)}$, $${tex(MON[2].U, 2)}$ — ratios $${ratio(1, 'E').toFixed(1)}$, $${ratio(1, 'L').toFixed(1)}$, $${ratio(1, 'U').toFixed(1)}$, close to $2^4$. The monitors are **converging to zero at RK4’s order**: what drifts is truncation error.` },
      { label: 'A planted bug', text: t`Flip the sign of $\Gamma^r{}_{rr}$. $E$ and $L$ still converge to zero — the $\ddot t$ and $\ddot\varphi$ equations are untouched, and they alone keep $E$ and $L$ constant. But $|u\cdot u + 1|$ is $${tex(BUGM[0].U, 3)}$, $${tex(BUGM[1].U, 3)}$, $${tex(BUGM[2].U, 3)}$, $${tex(BUGM[3].U, 3)}$ at the four steps: **a monitor that converges to something other than zero means the equations are wrong**, and no step size will fix it.` },
      { label: 'Long runs', text: t`Over many orbits RK4’s drifts grow steadily with time (the Explore). A symplectic method in Hamiltonian form keeps $u\cdot u$ within a fixed band instead, for as long as it runs — the shadow Hamiltonian of [F10.2](#/lesson/st-f.F10.2). This $H$ is not separable, so velocity Verlet does not apply; implicit midpoint (or Gauss–Legendre Runge–Kutta, or Tao’s explicit extended-phase-space method) does.` },
    ],
    answer: t`All three monitors converge to zero at order 4 ($${ratio(1, 'U').toFixed(1)}\times$ per halving): a correct code. The bug leaves $u\cdot u + 1 \approx ${tex(BUGM[3].U, 2)}$ at every step — only the normalization monitor sees it.`,
  },
  practice: [
    num({
      id: 'E-from-state', difficulty: 1,
      gen(r) {
        const rp = r.pick([7, 8, 9]), ra = r.pick([14, 18, 22]), St = apoState(rp, ra);
        const td = +St.y[3].toFixed(6), ans = (1 - 2 / ra) * td;
        return {
          prompt: t`A geodesic code starts at apoapsis $r = ${ra}M$ with $\dot r = 0$, $\dot t = ${td.toFixed(6)}$ and $\dot\varphi = ${St.y[5].toFixed(6)}/M$. What is the energy per unit mass $E$ it should keep?`,
          visual: orbitPic(St, ra, 'The orbit from this apoapsis: the first 800M of proper time of the geodesic code’s own RK4 run (h = 1M). The grey circle is the horizon. E is the same at every point of it.'),
          answer: ans, tol: { rel: 1e-5 },
          errors: [{ value: td, feedback: t`$\dot t$ alone is not conserved; $E = (1 - 2M/r)\dot t$.` }, { value: Math.sqrt(1 - 2 / ra) * td, feedback: t`The factor is $1 - 2M/r$ itself, not its square root.` }].filter((e) => Math.abs(e.value - ans) > 1e-3),
          hints: [t`$E = (1 - 2M/r)\dot t$ with $M = 1$.`, t`$(1 - 2/${ra})\times${td.toFixed(6)}$.`],
          teach: 'E = (1 − 2M/r)ṫ is the conserved quantity that the time symmetry of the metric gives: the code must keep it, though nothing in it enforces that.',
          explain: t`$E = (1 - 2/${ra})(${td.toFixed(6)}) = ${ans.toFixed(6)}$, less than 1: the orbit is bound. Every later state of the run should give the same number to within the integrator’s error.`,
        };
      },
    }),
    num({
      id: 'epicyclic', difficulty: 3,
      gen(r) {
        const rc = r.pick([7, 8, 9, 10, 12, 15]), ans = Tr(rc), meas = measuredTr(rc), c = circular(rc);
        return {
          prompt: t`A circular orbit at $r = ${rc}M$ is nudged inward ($\dot r = -10^{-4}$). For small oscillations about it, $\ddot{\delta r} = -\omega^2\,\delta r$ with $\omega^2 = \dfrac{M(r - 6M)}{r^3(r - 3M)}$ (in proper time). What radial period $2\pi/\omega$ should the code measure, in units of $M$?`,
          visual: VeffPic(c.L, [{ x: rc, y: n12(Veff(rc, c.L)), r: 5.5, color: 'accent', label: `circular orbit, r = ${rc}M`, labelDy: 18, labelDx: -10, labelAlign: 'right' }], 'The effective potential for this orbit’s L: the circular orbit sits at its minimum, and the curvature there sets ω² = V″/2.', { y: [+n12(Veff(rc, c.L) - 0.02), +n12(Veff(rc, c.L) + 0.06)], xmax: Math.max(20, 2 * rc) }),
          answer: ans, tol: { rel: 0.003 },
          errors: [{ value: 2 * Math.PI * Math.sqrt(rc ** 3), feedback: t`That is the orbital period $2\pi\sqrt{r^3/M}$, in coordinate time. The radial oscillation has its own frequency, which vanishes at $6M$.` }, { value: 1 / Math.sqrt(epicyclic2(rc)), feedback: t`That is $1/\omega$; the period is $2\pi/\omega$.` }].filter((e) => Math.abs(e.value - ans) > 0.01 * ans),
          hints: [t`$\omega^2 = (${rc} - 6)/(${rc}^3\times${rc - 3})$.`, t`$\omega^2 = ${tex(epicyclic2(rc), 4)}$; the period is $2\pi/\sqrt{\omega^2}$.`],
          teach: 'Linearizing about a circular orbit gives a prediction a code must reproduce: the radial period 2π/ω, which grows without bound as r → 6M.',
          explain: t`$\omega = ${tex(Math.sqrt(epicyclic2(rc)), 4)}$, so $2\pi/\omega = ${ans.toFixed(2)}M$. The geodesic code, RK4 at $h = 0.5M$, measures $${meas.toFixed(2)}M$ between successive periapses. As $r \to 6M$, $\omega \to 0$: the restoring force vanishes at the ISCO, and inside it becomes a push.`,
        };
      },
    }),
    mcq({
      id: 'monitor-bug', difficulty: 3,
      prompt: t`Two geodesic codes run the same orbit at $h = 4, 2, 1, 0.5M$. In code P all three monitors shrink about sixteenfold per halving. In code Q, $|\Delta E|$ and $|\Delta L|$ shrink sixteenfold too, but $|u\cdot u + 1|$ stays at $3.8\times10^{-3}$. What do you conclude?`,
      visual: {
        type: 'graph',
        params: { x: [-0.45, 0.75], y: [-10.5, -1.5], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'step h (M)', ylabel: '|u·u + 1|',
          points: [...HS.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(MON[i].U)), r: 5, color: 'accent' })), ...HS.map((h, i) => ({ x: n12(lg(h)), y: n12(lg(BUGM[i].U)), r: 5, color: 'bad' }))],
          legend: [{ label: 'code P', color: 'accent', point: true }, { label: 'code Q', color: 'bad', point: true }], legendAt: 'br' },
        caption: 'The normalization monitor of the two codes against the step.',
      },
      choices: [
        t`Q integrates the wrong equations — an error in the $\ddot r$ equation, since $E$ and $L$ (which the $\ddot t$ and $\ddot\varphi$ equations protect) are fine. P’s drift is truncation error`,
        'Q needs a smaller step: its error has not reached the asymptotic range',
        'P has the bug: monitors are supposed to stay exactly constant',
        'Q has a round-off problem in computing u·u',
      ],
      answer: 0,
      why: {
        1: 'An error that does not change at all over an eightfold change of step is not truncation error, and no smaller step will move it.',
        2: 'No method that takes finite steps keeps them exactly; what matters is that the drift shrinks at the method’s order — P’s does.',
        3: 'Round-off would be near 10⁻¹⁵, not 10⁻³, and would not stay fixed while E and L are fine.',
      },
      hints: ['What does a monitor do as h → 0 if the equations are right? If they are wrong?', 'Which equations keep E = (1 − 2M/r)ṫ and L = r²φ̇ constant?'],
      teach: 'A conserved-quantity monitor separates two failures: drift that converges to zero is the integrator; drift that converges to a nonzero value is the equations.',
      explain: t`Q is the worked example’s planted bug, a sign error in $\Gamma^r{}_{rr}$. Its trajectory is a converged solution of the wrong equations — which still conserve $E$ and $L$ but not the normalization. That is why a code needs all three monitors: each one watches a different part of the right-hand side.`,
    }),
    mcq({
      id: 'unstable-circle', difficulty: 3,
      prompt: t`A circular orbit at $r = 5M$ is started with the exact circular $E$ and $L$ and no nudge at all. With RK4 it stays circular for a while, then leaves, departing by $0.5M$ at $\tau \approx ${LEAVE[0]}M$ ($h = 1M$), $${LEAVE[1]}M$ ($h = 0.5M$) and $${LEAVE[2]}M$ ($h = 0.25M$). Is the code broken?`,
      visual: VeffPic(circular(5).L, [{ x: 5, y: n12(Veff(5, circular(5).L)), r: 5.5, color: 'bad', label: 'circular orbit, r = 5M', labelDy: -14 }], 'The effective potential for the circular orbit at 5M: it sits on a maximum.', { y: [0.86, 0.96], xmax: 14 }),
      choices: [
        t`No: inside $6M$ circular orbits are unstable. The numerical start is not exactly on the method’s own circular orbit, and that tiny difference grows like $e^{\lambda\tau}$; smaller steps make it smaller, so the orbit lasts longer — but it always leaves`,
        'Yes: a correct code keeps a circular orbit circular for ever',
        'Yes: RK4 is unstable at this step, and the orbit should be integrated with Verlet',
        'No: the orbit is leaving because the horizon pulls it in',
      ],
      answer: 0,
      why: {
        1: 'Only if the circle is stable; at 5M the exact solution amplifies any deviation, however small, and a computer cannot start with none.',
        2: 'The step is far inside RK4’s stability region; the growth is the physics of the orbit, which any accurate method reproduces.',
        3: 'Gravity at r = 5M is balanced exactly by the circular motion; the instability is about deviations from the circle, not a pull from the horizon.',
      },
      hints: ['Is the circular orbit at 5M at a minimum or a maximum of the effective potential?', 'What happens to a small deviation from a maximum?'],
      teach: 'An unstable solution cannot be held by a numerical method: errors seed the unstable mode, and the run tells you how unstable it is.',
      explain: t`At $5M$, $\omega^2 = M(r - 6M)/(r^3(r - 3M)) < 0$, so a deviation grows like $e^{\lambda\tau}$ with $\lambda = \sqrt{-\omega^2} = ${tex(Math.sqrt(-epicyclic2(5)), 3)}/M$: an e-folding every $${(1 / Math.sqrt(-epicyclic2(5))).toFixed(1)}M$. Truncation and round-off supply the seed. The ISCO at $6M$ is where this instability sets in, and it is why accretion disks have an inner edge.`,
    }),
    num({
      id: 'growth', difficulty: 2,
      gen(r) {
        const rc = r.pick([4.5, 5, 5.5]), d0 = r.pick([1e-6, 1e-9, 1e-12]), lam = Math.sqrt(-epicyclic2(rc)), ans = Math.log(0.5 / d0) / lam;
        return {
          prompt: t`An orbit is kicked off the unstable circle at $r = ${rc}M$ by $\delta r = ${tex(d0)}M$. The deviation grows like $e^{\lambda\tau}$ with $\lambda^2 = \dfrac{M(6M - r)}{r^3(r - 3M)}$. After how much proper time has it reached $0.5M$?`,
          visual: VeffPic(circular(rc).L, [{ x: rc, y: n12(Veff(rc, circular(rc).L)), r: 5.5, color: 'bad', label: `r = ${rc}M`, labelDy: -14 }], 'The effective potential with the unstable circular orbit at its maximum.', { y: [0.84, 1.0], xmax: 14 }),
          answer: ans, tol: { rel: 0.01 },
          errors: [{ value: Math.log10(0.5 / d0) / lam, feedback: 'Use the natural logarithm: e^(λτ) = 0.5/δr.' }, { value: Math.log(0.5 / d0) / (lam * lam), feedback: 'Divide by λ, not λ².' }],
          hints: [t`$\lambda = \sqrt{(6 - ${rc})/(${rc}^3\times${rc - 3})} = ${tex(lam, 4)}$.`, t`$\tau = \ln(0.5/${tex(d0)})/\lambda$.`],
          teach: 'An exponential instability turns any seed into a departure after a time proportional to ln(1/seed): tiny seeds buy only a little time.',
          explain: t`$\ln(0.5/${tex(d0)}) = ${Math.log(0.5 / d0).toFixed(2)}$ e-folds of $${(1 / lam).toFixed(2)}M$ each: $\tau = ${ans.toFixed(0)}M$. A seed a thousand times smaller adds only $${(Math.log(1000) / lam).toFixed(0)}M$.`,
        };
      },
    }),
    mcq({
      id: 'plunge', difficulty: 3,
      prompt: t`An orbit with $L = 3.2M$ — below the ISCO’s $2\sqrt3M$ — is released at $r = 12M$. The geodesic code follows it in smoothly to $r \approx 2.1M$, but there $\dot t$ shoots up, the step’s error estimate explodes, and just past $r = 2M$ the state turns to NaN. What is happening?`,
      visual: { type: 'orbit', params: { mode: 'schwarzschild', r0: 12, L: 3.2, turns: 2, compare: false }, caption: 'The plunge, from the orbit equation. In proper time the fall through the horizon is smooth.' },
      choices: [
        t`$\dot t = E/(1 - 2M/r)$ diverges at the horizon: Schwarzschild’s $t$ is a bad coordinate there, not a place where anything physical blows up. Stop the run at $r = 2M(1 + \epsilon)$ with an event, or switch to horizon-penetrating coordinates`,
        'The particle is torn apart by tides, so the equations stop applying',
        t`RK4 is unstable for $L$ below $2\sqrt3M$`,
        'The curvature becomes infinite at r = 2M',
      ],
      answer: 0,
      why: {
        1: 'Tidal forces at the horizon are finite (and small for a supermassive black hole); in any case a geodesic is a point particle’s path, which continues.',
        2: 'Stability is about the step and the equations’ eigenvalues; the code ran fine until r ≈ 2M.',
        3: 'The curvature at r = 2M is finite — the Kretschmann scalar is 48M²/r⁶ there; only the coordinates misbehave.',
      },
      hints: [t`Which components of $\dot x^\mu$ stay finite as $r \to 2M$? Use $E = (1 - 2M/r)\dot t$.`, 'Does anything change for the falling particle’s own clock at r = 2M?'],
      teach: 'A coordinate singularity stops a code as surely as a real one: know which divergences are the coordinates’, and choose coordinates (or stopping events) to match.',
      explain: t`$r(\tau)$ and $\varphi(\tau)$ stay smooth through $r = 2M$ (the radial equation of [F14.1](#/lesson/st-f.F14.1) has nothing special there), but $t$ runs to infinity: the horizon is reached only as $t \to \infty$. In ingoing Eddington–Finkelstein coordinates the same plunge is integrated straight through the horizon to near $r = 0$. Ray-tracing codes for black-hole images use such coordinates, or stop each ray just outside the horizon.`,
    }),
    code({
      id: 'geodesic-rhs', difficulty: 3,
      prompt: t`Write \`rhs(y)\` for the equatorial geodesic equation, $y = [t, r, \varphi, \dot t, \dot r, \dot\varphi]$ and $M = 1$, using the Christoffel symbols of the worked example. The program then runs RK4 on the orbit $(r_p, r_a) = (7, 16)M$ for $1000M$ and records the largest normalization error \`max_uu(h)\`.`,
      starter: t`import numpy as np

M = 1.0
E, L = ${S.E.toFixed(15)}, ${S.L.toFixed(15)}      # the orbit (7, 16)M
y0 = np.array([0.0, 16.0, 0.0, E / (1 - 2 * M / 16), 0.0, L / 16**2])

def rhs(y):
    t, r, phi, td, rd, pd = y
    f = 1 - 2 * M / r
    # return the derivatives [td, rd, pd, t'', r'', phi'']
    return np.array([td, rd, pd, 0.0, 0.0, 0.0])

def uu(y):
    t, r, phi, td, rd, pd = y
    f = 1 - 2 * M / r
    return -f * td**2 + rd**2 / f + r**2 * pd**2

def max_uu(h, T=1000.0):
    y, worst = y0.copy(), 0.0
    for _ in range(round(T / h)):
        k1 = rhs(y); k2 = rhs(y + h / 2 * k1); k3 = rhs(y + h / 2 * k2); k4 = rhs(y + h * k3)
        y = y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        worst = max(worst, abs(uu(y) + 1))
    return worst

print(max_uu(2.0), max_uu(1.0))
`,
      answer: t`import numpy as np

M = 1.0
E, L = ${S.E.toFixed(15)}, ${S.L.toFixed(15)}      # the orbit (7, 16)M
y0 = np.array([0.0, 16.0, 0.0, E / (1 - 2 * M / 16), 0.0, L / 16**2])

def rhs(y):
    t, r, phi, td, rd, pd = y
    f = 1 - 2 * M / r
    tdd = -2 * M / (r**2 * f) * td * rd
    rdd = -M * f / r**2 * td**2 + M / (r**2 * f) * rd**2 + r * f * pd**2
    pdd = -2 / r * rd * pd
    return np.array([td, rd, pd, tdd, rdd, pdd])

def uu(y):
    t, r, phi, td, rd, pd = y
    f = 1 - 2 * M / r
    return -f * td**2 + rd**2 / f + r**2 * pd**2

def max_uu(h, T=1000.0):
    y, worst = y0.copy(), 0.0
    for _ in range(round(T / h)):
        k1 = rhs(y); k2 = rhs(y + h / 2 * k1); k3 = rhs(y + h / 2 * k2); k4 = rhs(y + h * k3)
        y = y + h / 6 * (k1 + 2 * k2 + 2 * k3 + k4)
        worst = max(worst, abs(uu(y) + 1))
    return worst

print(max_uu(2.0), max_uu(1.0))`,
      tests: [
        { name: t`at $h = 2M$ the normalization error stays near $${tex(CODE[0].U, 2)}$`, code: `abs(max_uu(2.0) / ${n12(CODE[0].U)} - 1) < 0.02` },
        { name: 'halving the step shrinks it 12 to 20 times (fourth order)', code: '12 < max_uu(2.0) / max_uu(1.0) < 20' },
        { name: t`at the start, $\ddot r$ is the radial equation’s $-M/r^2 + L^2/r^3 - 3ML^2/r^4$`, code: 'abs(rhs(y0)[4] - (-1/16**2 + L**2/16**3 - 3*L**2/16**4)) < 1e-12' },
      ],
      hints: [t`$\ddot t = -2\,\frac{M}{r^2f}\,\dot t\dot r$ and $\ddot\varphi = -\frac{2}{r}\dot r\dot\varphi$.`, t`$\ddot r = -\frac{Mf}{r^2}\dot t^2 + \frac{M}{r^2f}\dot r^2 + rf\dot\varphi^2$ (the signs come from $-\Gamma$).`, 'Return np.array([td, rd, pd, tdd, rdd, pdd]).'],
      teach: 'The geodesic equation is generic code — Christoffel symbols in, accelerations out — and its conserved quantities are free tests of every line.',
      explain: t`The normalization drifts by $${tex(CODE[0].U, 2)}$ at $h = 2M$ and $${tex(CODE[1].U, 2)}$ at $h = 1M$: a ratio of $${(CODE[0].U / CODE[1].U).toFixed(1)}$, RK4’s order. The third test checks the equations another way: at a turning point the geodesic equation must reduce to level 1’s radial equation.`,
    }),
  ],
  checkpoint: [
    num({
      id: 'cp-isco-freq', difficulty: 2, transfer: true,
      gen(r) {
        const Ms = r.pick([10, 20, 30, 60, 65]), Om = 6 ** -1.5 / (Ms * M_SUN_S), ans = Om / Math.PI;
        return {
          prompt: t`For a test particle on the ISCO of a black hole of $${Ms}$ solar masses, the orbital angular frequency seen from far away is $\Omega = \sqrt{M/r^3}$ at $r = 6M$ (coordinate time, $G = c = 1$). Gravitational waves come out at twice the orbital frequency. What is their frequency in Hz? ($GM_\odot/c^3 = 4.9255\ \mu\text{s}$.)`,
          visual: VeffPic(2 * Math.sqrt(3), [{ x: 6, y: n12(Veff(6, 2 * Math.sqrt(3))), r: 5.5, color: 'accent', label: 'ISCO', labelDy: -14 }], 'The effective potential at L = 2√3 M: the minimum and maximum merge at 6M into an inflection point, the innermost stable circular orbit.', { y: [0.86, 0.96], xmax: 16 }),
          answer: ans, units: 'Hz', tol: { rel: 0.005 },
          errors: [{ value: ans / 2, feedback: 'That is the orbital frequency Ω/2π. The waves come out at twice it: Ω/π.' }, { value: 2 * ans * Math.PI, feedback: 'Ω is an angular frequency: divide by 2π for cycles per second, then double.' }],
          hints: [t`$\Omega = 6^{-3/2}/M$ with $M = ${Ms}\times4.9255\ \mu\text{s}$.`, t`$f_{\text{GW}} = 2\times\Omega/2\pi = \Omega/\pi$.`],
          teach: 'The ISCO sets the frequency where an inspiral’s slow phase ends: f ≈ 4.4 kHz divided by the mass in solar masses.',
          explain: t`$\Omega = 1/(${tex(6 ** 1.5, 4)}\times${tex(Ms * M_SUN_S * 1e6, 4)}\ \mu\text{s}) = ${tex(Om, 4)}\ \text{s}^{-1}$, so $f = \Omega/\pi = ${ans.toFixed(0)}$ Hz — inside LIGO’s band. For comparable masses this is only a rough guide to where the inspiral ends; the test-particle ISCO is the exact limit of a small body around a large one, the extreme-mass-ratio inspirals that LISA will hear.`,
        };
      },
    }),
    mcq({
      id: 'cp-projection', difficulty: 3,
      prompt: t`To “improve” her geodesic code, a student recomputes $\dot t$ after every step from $u\cdot u = -1$, so the normalization is exact. What does that do to her checks?`,
      visual: { type: 'graph', params: { x: [3, 5.05], y: [-8.5, -1], xlog: true, ylog: true, aspect: 'wide', axesAt: 'edge', xlabel: 'proper time τ (M)', ylabel: 'largest monitor error', points: [...winPts(CHR, 'E', 'gold', 1), ...winPts(CHR, 'L', 'violet', 1), ...winPts(CHR, 'U', 'accent', 1)].map((p) => ({ ...p, when: undefined })), legend: [{ label: '|ΔE|', color: 'gold', point: true }, { label: '|ΔL|', color: 'violet', point: true }, { label: '|u·u + 1|', color: 'accent', point: true }], legendAt: 'tl' }, caption: 'The three monitors of plain RK4 (the Explore’s first run), before the change.' },
      choices: [
        t`$u\cdot u$ is no longer a check — it is now true by construction. $E$ and $L$ still are, and they must still converge to zero at the method’s order`,
        'The code is now exact, so all three monitors will stay at round-off',
        t`$E$ is now exact too, because $\dot t$ is fixed by the normalization`,
        'Nothing changes: a monitor cannot be affected by how the state is updated',
      ],
      answer: 0,
      why: {
        1: 'Projecting one quantity back does not remove the truncation error in r, φ and their velocities; the orbit is still approximate.',
        2: 'E = (1 − 2M/r)ṫ depends on r, which is still integrated approximately; nothing forces it to its initial value.',
        3: 'Overwriting ṫ changes the state, and so every monitor computed from it.',
      },
      hints: ['What does a check need to be able to do?', 'Which of E, L and u·u can the projection force, and which can it not?'],
      teach: 'Enforcing a conserved quantity spends it as a check: projection can help, but keep at least one independent monitor.',
      explain: t`A monitor is only a test if the code is free to violate it. After projection, $u\cdot u = -1$ always; the truncation error moves into $\dot t$ and therefore into $E$. Projection is used in practice (constraint-preserving schemes in numerical relativity do something similar), but the convergence of the remaining monitors is then the evidence that the code works.`,
    }),
    num({
      id: 'cp-selfconv', difficulty: 3,
      gen(r) {
        const [rp, ra] = r.pick([[7, 16], [8, 20], [9, 15]]), T = r.pick([1000, 1500]), h = r.pick([2, 1]);
        const St = apoState(rp, ra);
        const u = [h, h / 2, h / 4].map((hh) => +geoRun(St.y, hh, Math.round(T / hh))[2].toFixed(10));
        const Q = (u[0] - u[1]) / (u[1] - u[2]), ans = Math.log2(Q);
        return {
          prompt: t`The geodesic code integrates the orbit $(r_p, r_a) = (${rp}, ${ra})M$ with RK4 and reports the angle travelled, $\varphi$, at $\tau = ${T}M$: $${u[0].toFixed(10)}$, $${u[1].toFixed(10)}$ and $${u[2].toFixed(10)}$ rad at $h = ${h}$, $${h / 2}$ and $${h / 4}M$. What order of convergence does that show?`,
          visual: { type: 'orbit', params: { mode: 'schwarzschild', r0: ra, L: +St.L.toFixed(2), turns: 3, compare: false }, caption: 'The orbit being integrated (drawn from the orbit equation).' },
          answer: ans, tol: { rel: 0, abs: 0.05 },
          errors: [{ value: Q, feedback: t`That is $Q = 2^p$; the order is $\log_2 Q$.` }],
          hints: [t`$Q = (u_h - u_{h/2})/(u_{h/2} - u_{h/4})$.`, t`$Q = ${tex(Q, 4)}$; $p = \log_2 Q$.`],
          teach: 'The full geodesic code has no exact solution to compare with, but self-convergence still measures its order.',
          explain: t`$Q = ${tex(Q, 4)}$, $p = ${ans.toFixed(2)}$: ${Math.abs(ans - 4) < 0.3 ? 'RK4’s fourth order' : 'heading for 4 as h shrinks'}. With the monitors converging too, the code has passed both tests a referee would ask for. The test uses $\varphi$, which keeps growing, rather than $r$: at a moment when $r$ is near a turning point its error is not dominated by one clean $h^4$ term, and the same three runs read through $r$ can give a ratio of any size or sign.`,
        };
      },
    }),
  ],
  sources: [
    { label: 'Carroll, Spacetime and Geometry (Addison-Wesley 2004), §3.4, §5.4 and §7.1: geodesics, Schwarzschild orbits, Killing vectors', url: 'https://www.preposterousuniverse.com/spacetimeandgeometry/' },
    { label: 'Tao (2016), Explicit symplectic approximation of nonseparable Hamiltonians, Phys. Rev. E 94, 043303', url: 'https://doi.org/10.1103/PhysRevE.94.043303' },
    { label: 'Christian & Chan (2021), FANTASY: user-friendly symplectic geodesic integrator, ApJ 909, 67', url: 'https://doi.org/10.3847/1538-4357/abdc28' },
    { label: 'Bardeen, Press & Teukolsky (1972), Rotating black holes: locally nonrotating frames, energy extraction, and scalar synchrotron radiation, ApJ 178, 347', url: 'https://doi.org/10.1086/151796' },
  ],
});
